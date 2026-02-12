"use client";

import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Megaphone } from "lucide-react";
import { useCallback, useState } from "react";
import { fireConfetti } from "@/lib/confetti";
import { SponsorSetupForm } from "./SponsorSetupForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-subtle)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2 text-[var(--fg)]">
            <Megaphone className="h-4 w-4 text-[var(--fg-muted)]" aria-hidden />
            <span className="font-semibold">Advertise on LittleShips</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-[var(--fg-muted)] hover:text-[var(--fg)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

type Step = "pitch" | "checkout" | "success";

export function BuySponsorshipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("pitch");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    const returnUrl = window.location.origin + window.location.pathname;
    const res = await fetch("/api/sponsor/embedded-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ returnUrl }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      sessionId?: string;
      clientSecret?: string;
    };

    if (data.sessionId) setSessionId(data.sessionId);

    return data.clientSecret || "";
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => {
        setStep("pitch");
        onClose();
      }}
    >
      <div className="flex flex-col items-center text-center">
        {step === "success" && sessionId ? (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-muted)_55%,transparent)] text-[var(--fg-muted)]">
              <Megaphone className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--fg)]">Payment successful!</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">Now let’s set up your sponsor card.</p>
            <div className="mt-6 w-full">
              <SponsorSetupForm sessionId={sessionId} />
            </div>
          </>
        ) : step === "checkout" ? (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-muted)_55%,transparent)] text-[var(--fg-muted)]">
              <Megaphone className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--fg)]">Checkout</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">Complete payment below to reserve a sponsor spot.</p>

            <div className="mt-6 w-full">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  fetchClientSecret,
                  onComplete: () => {
                    fireConfetti();
                    setStep("success");
                  },
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-muted)_55%,transparent)] text-[var(--fg-muted)]">
              <Megaphone className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--fg)]">Get your product in front of builders</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">Sitewide placement on LittleShips main pages. Pending approval before going live.</p>

            <div className="mt-6 w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-muted)_60%,transparent)] px-4 py-4">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-[var(--fg-muted)]">Monthly rate</div>
                <div className="text-3xl font-semibold text-[var(--fg)]">$599/mo</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-sm text-[var(--fg-muted)]">Spots available</div>
                <div className="text-sm text-[var(--fg)]">20 total</div>
              </div>
            </div>

            <ul className="mt-6 w-full space-y-2 text-left text-sm text-[var(--fg)]">
              <li>✓ Fixed sidebar placement on main pages</li>
              <li>✓ Your logo, name, and tagline</li>
              <li>✓ Direct link to your product</li>
              <li>✓ Cancel anytime</li>
            </ul>

            <div className="mt-6 w-full">
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="block w-full rounded-xl bg-[var(--fg)] px-4 py-3 text-center text-sm font-semibold text-black hover:opacity-90"
              >
                Continue to checkout
              </button>
              <p className="mt-3 text-xs text-[var(--fg-subtle)]">
                You’ll be charged today. Your sponsorship goes live after approval (typically within 1 business day). If we can’t approve it, we’ll refund.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
