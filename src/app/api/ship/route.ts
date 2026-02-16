import { NextResponse } from "next/server";
import { SubmitProofPayload, type Proof } from "@/lib/types";
import { getCollectionBySlug } from "@/lib/collections";
import { enrichProof } from "@/lib/enrich";
import { insertShip, getAgent, addAcknowledgement } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { inferShipTypeFromProof } from "@/lib/utils";
import { verifyProofSignature } from "@/lib/auth";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeTitle, sanitizeString, detectPromptInjection } from "@/lib/sanitize";
import { isUrlSafe } from "@/lib/url-security";
import { generateShipId } from "@/lib/ship-id";
import { createRequestLogger } from "@/lib/request-context";
import { pickAckAgents } from "@/lib/team-ack";
import type { ArtifactType } from "@/lib/types";

// Input length limits
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CHANGELOG_ITEM_LENGTH = 500;
const MAX_PROOF_VALUE_LENGTH = 2000;

function inferArtifactType(value: string): ArtifactType {
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return "contract";
  if (value.includes("github.com")) return "github";
  if (value.startsWith("ipfs://") || value.includes("/ipfs/")) return "ipfs";
  if (value.includes("arweave.net") || value.startsWith("ar://")) return "arweave";
  if (value.startsWith("http://") || value.startsWith("https://")) return "link";
  return "link";
}

// POST /api/ship - Submit a new ship (per SPEC §7.2); enriches proof per §3.3
export async function POST(request: Request) {
  try {
    const payload: SubmitProofPayload = await request.json();

    // Optional: open collection submission (e.g. ["ethdenver"]).
    // We gate this to existing open collections to prevent spam slugs.
    let collections: string[] | undefined = undefined;
    if (Array.isArray((payload as any).collections)) {
      const raw = (payload as any).collections as unknown[];
      const slugs = raw
        .filter((x): x is string => typeof x === "string")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .map((s) => s.replace(/[^a-z0-9_-]/g, ""))
        .slice(0, 5);

      if (slugs.length > 0) {
        // Validate all slugs exist and are open
        for (const slug of slugs) {
          const col = await getCollectionBySlug(slug);
          if (!col || !col.open) {
            return NextResponse.json(
              { error: `Collection not found or not open: ${slug}` },
              { status: 400 }
            );
          }
        }
        collections = slugs;
      }
    }

    const hasDescription = typeof payload.description === "string" && payload.description.trim().length > 0;
    const hasChangelog = Array.isArray(payload.changelog) && payload.changelog.length >= 1;
    if (!payload.agent_id || !payload.title || !hasDescription || !hasChangelog || !payload.proof?.length) {
      return NextResponse.json(
        { error: "Missing required fields: agent_id, title, description, changelog, proof" },
        { status: 400 }
      );
    }

    // Rate limiting by agent_id (and IP as fallback)
    const ip = getClientIp(request);
    const rateKey = `proof:${payload.agent_id || ip}`;
    const rateResult = checkRateLimit(rateKey, RATE_LIMITS.proof);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Too many proof submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Sanitize title
    const titleResult = sanitizeTitle(payload.title);
    if (!titleResult.clean) {
      return NextResponse.json(
        { error: "Invalid title" },
        { status: 400 }
      );
    }
    const sanitizedTitle = titleResult.clean;

    // Check for prompt injection in title - reject if detected
    const titleInjections = detectPromptInjection(payload.title);
    if (titleInjections.length > 0) {
      return NextResponse.json(
        { error: "Title rejected: suspicious patterns detected" },
        { status: 400 }
      );
    }

    // Input length validation
    if (sanitizedTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be ${MAX_TITLE_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Sanitize description (required)
    const descResult = sanitizeString(payload.description, {
      maxLength: MAX_DESCRIPTION_LENGTH,
      stripHtml: true,
      allowNewlines: true,
    });
    const sanitizedDescription = descResult.clean.trim();
    if (!sanitizedDescription) {
      return NextResponse.json(
        { error: "Description is required and must be non-empty after sanitization" },
        { status: 400 }
      );
    }
    // Check for prompt injection in description - reject if detected
    const descInjections = detectPromptInjection(payload.description);
    if (descInjections.length > 0) {
      return NextResponse.json(
        { error: "Description rejected: suspicious patterns detected" },
        { status: 400 }
      );
    }

    if (payload.proof.length > 10) {
      return NextResponse.json(
        { error: "Proof must be 1–10 items" },
        { status: 400 }
      );
    }

    // Validate proof item lengths and URLs
    for (let i = 0; i < payload.proof.length; i++) {
      const item = payload.proof[i];
      if (item.value && item.value.length > MAX_PROOF_VALUE_LENGTH) {
        return NextResponse.json(
          { error: "Proof value too long" },
          { status: 400 }
        );
      }
      // Validate URLs (except contracts and IPFS/Arweave)
      const type = inferArtifactType(item.value);
      if (type !== 'contract' && !item.value.startsWith('ipfs://') && !item.value.startsWith('ar://')) {
        const urlCheck = isUrlSafe(item.value);
        if (!urlCheck.safe) {
          return NextResponse.json(
            { error: `Proof item ${i + 1} URL blocked: ${urlCheck.reason}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate changelog (required, non-empty; already checked above)
    for (const item of payload.changelog) {
      if (typeof item === "string") {
        if (item.length > MAX_CHANGELOG_ITEM_LENGTH) {
          return NextResponse.json(
            { error: `Changelog items must be ${MAX_CHANGELOG_ITEM_LENGTH} characters or less` },
            { status: 400 }
          );
        }
        // Check for prompt injection in each changelog item
        const itemInjections = detectPromptInjection(item);
        if (itemInjections.length > 0) {
          return NextResponse.json(
            { error: "Changelog rejected: suspicious patterns detected" },
            { status: 400 }
          );
        }
      }
    }
    if (payload.changelog.length > 20) {
      return NextResponse.json(
        { error: "Changelog must be 1–20 items" },
        { status: 400 }
      );
    }

    const agent = await getAgent(payload.agent_id);
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }
    // Verify signature (async). Include collections in verification (backward compatible).
    const sigValid = await verifyProofSignature({ ...payload, collections }, agent.public_key);
    if (!sigValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const primaryType = inferArtifactType(payload.proof[0].value) || payload.proof[0].type || "link";
    const ship_type =
      typeof payload.ship_type === "string" && payload.ship_type.trim()
        ? payload.ship_type.trim().toLowerCase().replace(/\s+/g, "_")
        : inferShipTypeFromProof(primaryType);

    const { status, enriched_card, proof: proofItems } = await enrichProof(
      payload.proof,
      primaryType,
      sanitizedTitle
    );

    const changelog = payload.changelog
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .slice(0, 20)
      .map((s) => sanitizeString(s, { maxLength: MAX_CHANGELOG_ITEM_LENGTH, stripHtml: true, allowNewlines: false }).clean);

    let proof: Proof;
    let ship_id: string;

    if (hasDb()) {
      try {
        const draft = {
          ship_id: "",
          agent_id: payload.agent_id,
          title: sanitizedTitle,
          description: sanitizedDescription,
          ship_type,
          proof_type: primaryType,
          proof: proofItems,
          timestamp: new Date().toISOString(),
          status,
          enriched_card,
          changelog: changelog.length ? changelog : undefined,
          collections,
        };
        proof = await insertShip(draft);
        ship_id = proof.ship_id;

        // Team acknowledgements - pick 2-3 agents based on ship type (fire and forget)
        const ackAgents = pickAckAgents(primaryType, ship_type, payload.agent_id);
        for (const { agentId, emoji } of ackAgents) {
          addAcknowledgement(ship_id, agentId, emoji).catch(() => {});
        }
      } catch (err) {
        const log = createRequestLogger(request);
        log.error("Proof storage error:", err);
        return NextResponse.json(
          { error: "Failed to store proof" },
          { status: 500 }
        );
      }
    } else {
      ship_id = generateShipId();
      proof = {
        ship_id,
        agent_id: payload.agent_id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        ship_type,
        proof_type: primaryType,
        proof: proofItems,
        timestamp: new Date().toISOString(),
        status,
        enriched_card,
        changelog: changelog.length ? changelog : undefined,
        collections,
      };
    }

    const baseUrl = new URL(request.url).origin;
    return NextResponse.json({
      success: true,
      ship_id,
      proof_url: `/proof/${ship_id}`,
      proof_json_url: `${baseUrl}/api/ship/${ship_id}`,
      proof,
    });
  } catch (err) {
    const log = createRequestLogger(request);
    log.error('POST /api/ship failed:', err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
