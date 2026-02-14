# Contributing to LittleShips

LittleShips moves fast. This guide keeps us fast **without** PR pileups or merge chaos.

## Branches (source of truth)

- **`main`** = deploy branch (Railway deploys on merge)
- **`sponsorships`** = canonical integration branch for the sponsorship initiative

**Rule:** PR base must be **either `main` or `sponsorships`**. No stacked PR chains (no `auto/*` bases).

---

## PR Philosophy

We want:
- small, reviewable changes
- quick merges
- minimal open PRs
- predictable deployments

### Default merge strategy
- **Squash & merge** for most PRs.
  - Keeps `main` history clean and makes “what shipped” easy.
- Use merge commits only when preserving commit history matters.

---

## Guardrails (non-negotiables)

### 1) PR limits
- **At most 2 open PRs to `main`** at any time.
  - 1 feature PR + (optional) 1 tiny polish PR
- **At most 1 open PR to `sponsorships`** at any time.

If you need to do more work:
- add commits to the existing PR branch, or
- merge the current PR first.

### 2) No stacked PR chains
If work depends on unmerged work:
- put it in the **same PR branch** (additional commit), or
- wait and open the next PR after merge.

### 3) Keep PRs mergeable
Before opening the next PR:
- PR is mergeable (no conflicts)
- build passes (`npm run build`)

### 4) Keep deploy intent explicit
- If you want something live on littleships.dev: PR into **`main`**.
- If it’s sponsorship initiative work: PR into **`sponsorships`**.

---

## Workflow patterns

### Pattern A: “Ship-to-main” (most changes)
1. Create branch from `main`.
2. Make a cohesive change.
3. `npm run build`
4. Open PR targeting `main`.
5. Merge quickly (same day).

### Pattern B: “Sponsorship initiative” (work stays consolidated)
1. Create branch from `sponsorships`.
2. Implement a cohesive slice.
3. `npm run build`
4. Open PR targeting `sponsorships`.
5. Merge quickly.

### Pattern C: “Promote sponsorships to main” (intentional release)
When you’re ready to ship the sponsorship initiative:
1. Open PR: `sponsorships → main`
2. Resolve conflicts once.
3. Merge (squash optional; merge commit acceptable here).

---

## House rules

### Naming
- `feat/...` feature work
- `fix/...` bugfix
- `chore/...` maintenance

### PR titles
- Start with a category: `Admin: ...`, `Sponsors: ...`, `UI: ...`, `Docs: ...`

### Closing obsolete PRs
If work was superseded:
- close the PR with a comment: “Superseded by <PR#> / <branch>.”

---

## Quick checklist (copy/paste)

Before opening a PR:
- [ ] Base is `main` or `sponsorships`
- [ ] `npm run build` passes
- [ ] This PR is a cohesive slice (not a grab bag)
- [ ] PR count limits are respected

Before merging to `main`:
- [ ] Railway env vars are set (if new)
- [ ] Any required Supabase SQL migrations have been applied
