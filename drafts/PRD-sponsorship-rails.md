# PRD — Sponsorship Rails (Sponsorship-first Monetization)

**Owner:** PM
**Product:** LittleShips
**Status:** Draft
**Date:** 2026-02-11

## 0) TL;DR
LittleShips will monetize via **sponsorship modules** displayed in persistent **left/right rails** on main product pages. Sponsors buy a monthly subscription via Stripe, then create a sponsor card (logo/title/tagline/link). Cards are **pending approval** until reviewed, then go live. Pricing uses a **prime-demand ladder**: each sold slot increases the price for the next buyer.

---

## 1) Goals
1. Create a clear, tasteful sponsorship surface that does **not** degrade the core feed/product UX.
2. Enable **self-serve purchase** (low-touch) with **pending approval** to prevent abuse.
3. Support **escalating slot pricing** as inventory fills.
4. Instrument impressions/clicks so we can price based on value once traffic exists.

## 2) Non-goals (v1)
- Charging builders/agents to post/ship.
- Complex ad targeting/rotation/personalization.
- Programmatic “auction” pricing.
- Sponsor accounts / authentication system.
- Full-blown advertiser dashboard (beyond “manage sponsorship” link).

---

## 3) Users & Use Cases
### Sponsors (buyers)
- Discover “Buy sponsorship” call-to-action.
- Purchase a monthly slot.
- Provide sponsor card creative.
- Await approval.
- Go live; monitor basic performance (later).

### Admin (Tim / operator)
- Review pending sponsors.
- Approve/reject quickly.
- Optionally disable/remove sponsors.

### Site visitors
- See subtle sponsor cards that don’t distract.
- Click through to sponsor destinations.

---

## 4) UX Spec

### 4.1 Sponsorship Rails (desktop/tablet)
- Layout: persistent left rail + content column + persistent right rail.
- Rails are **sticky** and remain visible as user scrolls.
- Inventory: **20 total slots** on desktop/tablet, split **10 left / 10 right**.
- Right rail: the **bottom** module is always **“Buy sponsorship”**.
  - Net paid slots visible: 10 left + 9 right = **19** (one reserved CTA).

#### Pages where rails show
**Show:** core product pages (e.g., home, ships, ship detail, agents, agent detail, console, collections, tools, articles—unless we later decide to exclude “content”).

**Hide:** utility/legal/onboarding pages:
- Disclaimer / Terms / Code-of-conduct
- Register
- How-to / docs-style pages

Implementation note: default to “show,” and maintain a denylist for utility pages.

### 4.2 Sponsor Card (module) design
- Subtle, tasteful, rounded card (not bright white).
- Vertically centered content stack:
  1) sponsor logo/icon (top)
  2) title (company/product)
  3) tagline (short subtitle)
- Entire card is clickable → sponsor URL.

### 4.3 Buy sponsorship modal (pre-checkout)
Modal content (modeled after Tim’s prior UI):
- Title: “Advertise on LittleShips”
- Value prop: “Get your product in front of builders” (copy TBD)
- Pricing block:
  - “Monthly rate” (current ladder price)
  - “Spots available” (remaining slots)
- Bullet list:
  - Fixed sidebar placement on main pages
  - Logo, name, tagline
  - Direct link to your product
  - Cancel anytime
- Primary CTA: “Continue to checkout”
- Secondary link: “Learn more about sponsoring LittleShips” (optional doc page)

### 4.4 Post-checkout modal (success + creative)
Immediately after successful Stripe checkout, show:
- “Payment successful!”
- Form fields:
  - Company/Product Name (required)
  - Tagline (required)
  - Website URL (required)
  - Icon/Logo upload OR URL (optional but recommended)
  - Background color picker (curated palette)
- Submit → sponsorship status becomes **Pending approval**

### 4.5 Pending approval states
- After submit: show confirmation + SLA copy (recommended: “review within 1 business day”).
- Sponsor does **not** appear publicly until approved.
- If rejected: refund (policy below) + reason (optional).

### 4.6 Mobile
TBD. Explicitly defer. Options later:
- Hide rails entirely.
- Collapsible “Sponsors” section.
- Single inline sponsor row.

---

## 5) Pricing & Inventory

### 5.1 Inventory model
- Total paid inventory target: **19** visible paid slots (CTA occupies 1 right-rail slot).
- Inventory can be treated as a single pool (recommended) vs left/right separate pools.

### 5.2 Prime-demand ladder
- Ladder pricing increases as paid slots are purchased.
- Example ladder (configurable):
  - Slot 1: $599/mo
  - Slot 2: $799/mo
  - Slot 3: $999/mo
  - …
- Price locks for sponsor at purchase time (recommended).

### 5.3 Billing + approval policy
- **Charge immediately** at checkout.
- Sponsorship goes live only after approval.
- Copy: “You’ll be charged today. Your sponsorship goes live after approval (typically within 1 business day). If we can’t approve it, we’ll refund.”

---

## 6) Data Model (v1)
### 6.1 Entities
**SponsorSubscription**
- id
- stripeCustomerId
- stripeSubscriptionId
- stripeCheckoutSessionId (optional)
- status: `pending_creative` | `pending_approval` | `approved` | `rejected` | `canceled` | `paused`
- createdAt, updatedAt
- priceAtPurchaseCents
- slotIndexAtPurchase (optional)

**SponsorCreative**
- id
- sponsorSubscriptionId
- name (title)
- tagline
- url
- logoUrl (optional)
- bgColor (from palette)
- createdAt, updatedAt

**SponsorPlacement** (optional v1; could be computed)
- sponsorSubscriptionId
- rail: `left` | `right`
- position: 1..10


---

## 7) System Design / Flow

### 7.1 Checkout
1) User clicks CTA (Buy sponsorship).
2) Server computes current ladder price + remaining slots.
3) Server creates Stripe Checkout Session for a subscription at computed price.
4) Stripe redirects to `success_url` including `session_id`.

### 7.2 Return + success modal
1) Client loads success URL.
2) Server verifies session is paid.
3) Show success+creative modal.
4) Creative submission stored; status transitions to `pending_approval`.

### 7.3 Approval
- Admin UI (minimal): list pending; approve/reject.
- Approve:
  - status → `approved`
  - sponsor appears in rails.
- Reject:
  - status → `rejected`
  - trigger refund (Stripe) and cancel subscription.

### 7.4 Manage sponsorship (no accounts)
Provide a magic-link style management URL reachable from:
- the post-checkout success screen
- Stripe receipt email (via metadata link or separate email)

This page should allow:
- view status
- update creative (optional v1)
- cancel subscription (link to Stripe customer portal or simple endpoint)

---

## 8) Guardrails / Abuse Prevention
- Pending approval required.
- Validate sponsor URLs (https only; no localhost; optional allowlist/denylist).
- Image validation (size/type; store in controlled bucket; avoid hotlink XSS).
- Rate limit checkout/session creation.

---

## 9) Analytics / Metrics
### 9.1 Events
- sponsor_cta_viewed
- sponsor_cta_clicked
- sponsor_checkout_started
- sponsor_checkout_completed
- sponsor_creative_submitted
- sponsor_approved / sponsor_rejected
- sponsor_impression (per card)
- sponsor_click (per card)

### 9.2 KPIs
- MRR from sponsors
- Conversion: CTA click → checkout → paid → creative submitted → approved
- Fill rate (slots sold / total)
- CTR per sponsor card
- RPM (revenue per 1k impressions)

---

## 10) Acceptance Criteria (v1)
1) Rails render on all main product pages and are hidden on utility/legal/how-to/register.
2) Desktop/tablet: rails are sticky and visible during scroll.
3) Exactly 10 modules per rail; right-bottom module is “Buy sponsorship.”
4) Sponsor cards match the “subtle rounded” design and are fully clickable.
5) Checkout uses Stripe subscription with dynamic ladder pricing.
6) After Stripe success, success+creative modal opens and captures required fields.
7) New sponsors are pending approval and do not appear publicly until approved.
8) Admin can approve/reject; reject triggers subscription cancel + refund.
9) Impressions and clicks are tracked.

---

## 11) Open Questions
1) Inventory pooling: single pool vs separate left/right inventory?
2) Approval SLA copy: “within 1 business day” vs “within 24h”?
3) Mobile behavior (hide vs collapse)?
4) Do we allow sponsors to edit creative after approval (and require re-approval)?

