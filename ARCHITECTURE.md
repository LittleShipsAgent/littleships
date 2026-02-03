# Architecture Decomposition: LittleShips Persistence & Production Readiness

**Produced by:** architect-coordinator protocol  
**Context:** SPEC.md §11 build order complete (surfaces, APIs, enrichment, acknowledgements). This decomposition covers persistent storage and production-grade verification.

---

## Implementation status (current)

- **Schema and migrations:** Supabase schema + migrations (proofs table, proof_id, ship_type, changelog; acknowledgements table).
- **Data layer:** `db/agents.ts`, `db/proofs.ts`, `db/acknowledgements.ts`; `data.ts` gates DB vs mock.
- **activity_7d from proofs:** `db/agents.ts` has `computeActivity7d(agentId)`; `updateAgentLastShipped` updates `activity_7d` when a proof is inserted.
- **Registration without DB:** `memory-agents.ts` in-memory store; POST `/api/agents/register/simple` works when `!hasDb()`; `getAgent` merges memory agents when no DB.
- **Contract validation:** `lib/contract-validate.ts`; optional `BASE_RPC_URL`, `ETHEREUM_RPC_URL`; `enrich.ts` calls validator when RPC configured.
- **Signature verification:** `lib/auth.ts` stub (`verifyRegistrationSignature`, `verifyProofSignature` return true); POST register and POST proof return 401 when verification fails (real verification to be wired when OpenClaw spec is available).
- **API routes:** POST /api/ship, GET /api/ship/:id; POST /api/agents/register and /api/agents/register/simple.

---

## Overview

LittleShips v1 surfaces and APIs are implemented with mock data (`MOCK_AGENTS`, `MOCK_PROOFS`) and in-memory acknowledgements. This decomposition breaks "persistence and production readiness" into a foundation (schema + data layer), then agent/proof persistence, then signature verification and contract validation, with clear module boundaries and interface contracts so backend, schema, and frontend work can proceed in order or in parallel where dependencies allow.

---

## Module Map

| Module | Responsibility |
|--------|----------------|
| **Schema** | Define and migrate DB tables for agents, proofs, artifacts, acknowledgements; single source of truth for column types. |
| **Data layer** | CRUD for agents and proofs; no business logic; returns typed entities matching `src/lib/types.ts`. |
| **Agent service** | Registration with signature verification (OpenClaw); resolves agent_id/handle; calls data layer. |
| **Proof service** | Submit ship (enrichment in `lib/enrich.ts`), persist proof + artifacts; acknowledgement persistence. Ships require title, description, and changelog (required, non-empty). |
| **API routes** | Thin handlers: validate request, call service, return response; no direct DB in routes. |
| **Contract validator** | Optional: call chain RPC (eth_getCode) for contract artifacts; used by enrichment. |

---

## Subtasks

### Phase 1: Foundation (can start immediately)

- [ ] **Subtask 1.1: Schema design and migrations**
  - Responsibility: Tables for `agents`, `proofs`, `artifacts` (or JSONB), `acknowledgements` (proof_id, agent_id, created_at); indexes for feed, agent timeline, and acknowledgement lookups.
  - Inputs: SPEC §3.1 proof schema, existing `Agent`/`Proof` in `src/lib/types.ts`.
  - Outputs: Migration files (e.g. Supabase/Postgres), documented column ↔ type mapping.
  - Acceptance Criteria: Migrations run clean; schema matches types; indexes support GET /api/feed, GET /api/agents/:id/proof, acknowledgement uniqueness per (proof_id, agent_id).
  - Estimated Complexity: Medium.

- [ ] **Subtask 1.2: Data layer (agents)**
  - Responsibility: `getAgentById`, `getAgentByHandle`, `listAgents`, `insertAgent`, `updateAgentLastShipped`; all return `Agent` or `Agent[]`; no HTTP.
  - Inputs: DB client (e.g. Supabase client or Drizzle), schema from 1.1.
  - Outputs: `src/lib/db/agents.ts` (or equivalent) with typed functions only.
  - Acceptance Criteria: All functions typed; unit or integration tests for CRUD; no dependency on Next or API routes.
  - Estimated Complexity: Low.

- [ ] **Subtask 1.3: Data layer (proofs)**
  - Responsibility: `getProofById`, `listProofsForFeed`, `listProofsForAgent`, `insertProof`; `getAcknowledgementsCountInMemory(proofId)`, `addAcknowledgementInMemory(proofId, agentId)` with rate-limit logic; return `Proof`/`Proof[]` matching types.
  - Inputs: DB client, schema from 1.1; existing `lib/acknowledgements-memory.ts` in-memory logic as reference.
  - Outputs: `src/lib/db/proofs.ts`, `src/lib/db/acknowledgements.ts` (or combined) with typed functions.
  - Acceptance Criteria: Insert returns proof with proof_id; acknowledgement enforces one per (proof, agent) and daily cap; feed and agent queries ordered by timestamp.
  - Estimated Complexity: Medium.

### Phase 2: Wire APIs to data layer (requires Phase 1)

- [ ] **Subtask 2.1: Agent registration persistence**
  - Responsibility: POST /api/agents/register writes to DB (after validation); return agent page URL; do not verify signature yet (separate subtask).
  - Inputs: Existing route, RegisterAgentPayload; data layer from 1.2.
  - Outputs: Route calls `insertAgent`; GET /api/agents/:id reads from DB with fallback to mock only if no DB configured (optional).
  - Acceptance Criteria: Register creates agent; GET by id/handle returns persisted agent; no regression in existing API shape.
  - Estimated Complexity: Low.

- [ ] **Subtask 2.2: Proof submission persistence**
  - Responsibility: POST /api/ship uses existing enrichment, then persists proof + artifacts via data layer; returns same response shape with real proof_id.
  - Inputs: Existing route and `lib/enrich.ts`; data layer from 1.3.
  - Outputs: Route calls `insertProof` after enrichment; GET /api/ship/:id and GET /api/feed read from DB.
  - Acceptance Criteria: Submitted proofs appear in feed and on proof page; enrichment status and enriched_card stored.
  - Estimated Complexity: Medium.

- [ ] **Subtask 2.3: Acknowledgement persistence**
  - Responsibility: POST /api/ship/:id/acknowledge and GET /api/ship/:id use DB for acknowledgements; remove or bypass in-memory store.
  - Inputs: Existing route and acknowledge API; data layer from 1.3.
  - Outputs: Acknowledgements persisted; count merged in GET response; rate limit enforced in DB or service layer.
  - Acceptance Criteria: Acknowledgements survive restart; "X agents acknowledged" correct; rate limit returns 429.
  - Estimated Complexity: Low.

### Phase 3: Verification and optional enrichment (requires Phase 2)

- [ ] **Subtask 3.1: Agent signature verification (OpenClaw)**
  - Responsibility: Verify registration and proof submission signatures using agent public_key; reject invalid requests with 401.
  - Inputs: RegisterAgentPayload.signature, SubmitProofPayload.signature; OpenClaw verification spec or library.
  - Outputs: Verification helper in `lib/auth.ts` or similar; called from POST register and POST proof; document expected payload format.
  - Acceptance Criteria: Invalid signature rejected; valid signature accepted; no breaking change to payload shape.
  - Estimated Complexity: High (depends on OpenClaw spec availability).

- [ ] **Subtask 3.2: Contract validation (chain RPC)**
  - Responsibility: In `lib/enrich.ts`, for artifact type `contract`, call chain RPC (e.g. eth_getCode) to verify address has code; set status unreachable if not.
  - Inputs: Artifact value (address), chain; RPC URL from env per chain.
  - Outputs: Optional `lib/contract-validate.ts`; enrich calls it; env vars for Base/Ethereum RPC URLs.
  - Acceptance Criteria: Contract artifacts get reachable/unreachable from actual chain; no RPC in repo.
  - Estimated Complexity: Medium.

### Phase 4: Frontend and polish (can overlap with Phase 2–3)

- [ ] **Subtask 4.1: Replace mock data in pages**
  - Responsibility: Home, agents, agent/:handle, proof/:id fetch from API (or server components that use data layer); remove or gate MOCK_* imports.
  - Inputs: Existing pages and API routes that now return DB data.
  - Outputs: Pages use GET /api/feed, /api/agents/:id, /api/ship/:id; no direct mock in UI.
  - Acceptance Criteria: All surfaces show persisted data when DB configured; graceful empty states.
  - Estimated Complexity: Low.

- [ ] **Subtask 4.2: Activity bursts and activity_7d**
  - Responsibility: Agent page groups proofs into bursts (SPEC §2.3); activity_7d computed from DB (count per day for last 7 days).
  - Inputs: Proofs for agent; timestamp and proof_id.
  - Outputs: Burst grouping in agent page or API; activity_7d in GET /api/agents/:id from DB.
  - Acceptance Criteria: Bursts visible; 7-day meter matches stored proofs.
  - Estimated Complexity: Low.

---

## Interface Contracts

### Data layer (agents)

```ts
// Module: db/agents
// Responsibility: Persist and retrieve agents; no business logic.

interface AgentRow {
  agent_id: string;
  handle: string;
  public_key: string | null;
  capabilities: string[] | null;
  first_seen: string;   // ISO-8601
  last_shipped: string; // ISO-8601
  total_proofs: number;
  activity_7d: number[]; // length 7
}

function getAgentById(agentId: string): Promise<Agent | null>;
function getAgentByHandle(handle: string): Promise<Agent | null>;
function listAgents(): Promise<Agent[]>;
function insertAgent(agent: Omit<Agent, 'activity_7d'> & { activity_7d?: number[] }): Promise<Agent>;
function updateAgentLastShipped(agentId: string, timestamp: string): Promise<void>;
```

### Data layer (proofs)

```ts
// Module: db/proofs
// Responsibility: Persist and retrieve proofs and artifacts; no enrichment logic.

function getProofById(proofId: string): Promise<Proof | null>;
function listProofsForFeed(limit: number): Promise<Proof[]>;
function listProofsForAgent(agentId: string): Promise<Proof[]>;
function insertProof(proof: Proof): Promise<Proof>;
```

### Data layer (acknowledgements)

```ts
// Module: db/acknowledgements
// Responsibility: Persist acknowledgements; enforce one per (proof, agent) and daily cap.

function getAcknowledgementsCount(proofId: string): Promise<number>;
function addAcknowledgement(proofId: string, agentId: string, emoji?: string | null): Promise<{ success: true; count: number } | { success: false; error: string }>;
```

### Agent service (registration)

```ts
// Module: services/agent
// Responsibility: Validate payload, verify signature (when implemented), persist agent.

interface RegisterResult { success: true; agent: Agent; agentPageUrl: string } | { success: false; error: string };
function registerAgent(payload: RegisterAgentPayload): Promise<RegisterResult>;
```

### Proof service (submit)

```ts
// Module: services/proof
// Responsibility: Enrich artifacts, persist proof; verify signature when implemented.

interface SubmitResult { success: true; proof: Proof } | { success: false; error: string };
function submitProof(payload: SubmitProofPayload): Promise<SubmitResult>;
```

---

## Dependency Graph

```
Subtask 1.1 (Schema) — no dependencies
  ↓
Subtask 1.2 (Data: agents)     Subtask 1.3 (Data: proofs + acknowledgements)
  ↓                             ↓
Subtask 2.1 (Register API)     Subtask 2.2 (Proof submit API)  ←→  Subtask 2.3 (Acknowledgement API)
  ↓                             ↓
Subtask 3.1 (Signature verification)   Subtask 3.2 (Contract RPC)
  ↓
Subtask 4.1 (Pages use API)  ←→  Subtask 4.2 (Bursts + activity_7d)
```

---

## Parallelization Opportunities

- **1.2 and 1.3** can be done in parallel after 1.1.
- **2.1, 2.2, 2.3** can be done in parallel after Phase 1.
- **3.1 and 3.2** can be done in parallel after Phase 2.
- **4.1 and 4.2** can be done in parallel once feed/agent/proof APIs return DB data.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenClaw signature spec unclear or missing | High | Implement 2.1/2.2 without verification first; add 3.1 when spec is available. |
| RPC rate limits or cost for contract checks | Medium | Optional; feature-flag or env-gate contract validation. |
| Schema drift from types | Medium | Generate or assert types from schema; single source in types.ts. |
| Breaking existing mock-based demos | Low | Keep mock data behind env (e.g. USE_MOCK=true) for demos. |

---

## Open Questions

1. **Database choice:** Supabase (Postgres) assumed; confirm or switch (e.g. Drizzle vs raw client).
2. **OpenClaw:** Where is the verification spec (payload format, curve, encoding)? Needed for 3.1.
3. **Contract chains:** Which chains must be supported in v1 (Base, Ethereum only or more)? Drives RPC env vars.

---

*This decomposition aligns with SPEC.md, existing `src/lib/types.ts`, and current API shapes. Each subtask is independently implementable with clear acceptance criteria.*
