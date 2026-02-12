# Sponsorships v1 — Acceptance Checklist + Local Test Plan

This is the v1 “definition of done” for LittleShips Sponsorships.

## Scope (v1 user journey)
Rail module → dynamic price → embedded checkout → success/confetti → sponsor configuration → **pending approval stored in DB** → admin inventory (Active/Pending/Rejected/Canceled) + next price + capacity setting + **guardrails when lowering capacity** → approve goes live → cancel/expire removes.

## Definitions / status model
Map to DB fields if names differ.

- **Pending**: paid sponsorship exists, not yet approved to display publicly.
- **Active**: approved and currently displayable; counts against capacity; visible in rail.
- **Rejected**: explicitly not approved; not visible.
- **Canceled**: ended by admin/system; not visible.
- **Expired**: ended by time window; not visible.

## Local prerequisites
- Local web server running.
- Supabase env vars present (at minimum):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Stripe test keys present (for embedded checkout):
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
- Supabase tables created:
  - Run `drafts/supabase-sponsorships.sql`
  - Run `drafts/supabase-site-settings.sql`

## Acceptance checklist (ship / no-ship)

### A) Rails + dynamic pricing
- [ ] Rail modules render on intended pages.
- [ ] Clicking a rail module opens the sponsor flow.
- [ ] Price is dynamic (not hardcoded) and matches admin “next price”.
- [ ] Sold out state blocks checkout cleanly.

### B) Embedded checkout
- [ ] Embedded checkout renders reliably (no blank iframe).
- [ ] Successful payment results in success UI.
- [ ] Cancel/failure is handled and does not create an approvable pending record.
- [ ] Idempotent completion (no duplicate orders on refresh/replay).

### C) Success + confetti
- [ ] Confetti fires once on success.
- [ ] User is guided to configuration.

### D) Sponsor configuration
- [ ] Config step loads after payment success.
- [ ] Required fields validate.
- [ ] Save persists and is visible to admin.
- [ ] After save, UI clearly shows **Pending review**.

### E) DB persistence
- [ ] After successful checkout, DB contains a pending order row with:
  - [ ] unique id
  - [ ] status
  - [ ] amount/price paid
  - [ ] Stripe references (session/subscription/customer)
  - [ ] timestamps
  - [ ] creative/config attached (or FK)

### F) Admin inventory screens
- [ ] Admin has a single place to manage Sponsorships.
- [ ] Pending/Active/Rejected/Canceled are visible and correct.
- [ ] Each row shows who/what/price/status and can be approved/rejected/canceled.

### G) Capacity + next price
- [ ] Admin can set capacity (slots total) and it persists.
- [ ] Admin can increase capacity.
- [ ] Decrease capacity has guardrails (no orphaned active sponsors).
- [ ] Next price is computed consistently with purchase flow.

### H) Approve → goes live
- [ ] Approving a pending sponsorship makes it appear on rails.
- [ ] Approval is idempotent.

### I) Cancel/expire removes
- [ ] Cancel removes from rails and frees capacity.
- [ ] Expiration removes from rails (mechanism documented).

## Local test plan (step-by-step)

### 1) Happy path
1. Open a page with rails.
2. Click a sponsor module → verify dynamic price.
3. Complete embedded checkout.
4. Observe confetti.
5. Fill sponsor config and submit.
6. Confirm Pending review screen.
7. Visit `/admin/sponsors` and approve.
8. Refresh rails page and confirm sponsor is live.

### 2) Capacity + pricing
- Set capacity to N=2.
- Purchase 2 sponsorships.
- Verify pricing increments and sold-out behavior.
- Cancel one and verify price/availability updates.

### 3) Guardrail: lowering capacity
- With active+pending = X, attempt set capacity < X.
- Expect a clear error and no DB change.

## Open questions (explicit)
- Does **Pending** reserve capacity for pricing/sold-out? (recommended: yes)
- What drives “next price”: active only or active+pending? (recommended: active+pending)
- Expiration implementation: webhook-driven vs on-read evaluation.
