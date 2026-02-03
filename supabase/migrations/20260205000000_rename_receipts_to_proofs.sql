-- Rename receipts to proofs: table, columns, indexes, policies.
-- Existing DBs: run this migration. New installs: use schema.sql which creates proofs directly.

-- 1. Drop FK from acknowledgements to receipts so we can rename table/column
ALTER TABLE public.acknowledgements
  DROP CONSTRAINT IF EXISTS acknowledgements_receipt_id_fkey;

-- 2. Rename table and primary key column
ALTER TABLE public.receipts RENAME TO proofs;
ALTER TABLE public.proofs RENAME COLUMN receipt_id TO proof_id;

-- 3. Acknowledgements: rename column and re-add FK
ALTER TABLE public.acknowledgements RENAME COLUMN receipt_id TO proof_id;
ALTER TABLE public.acknowledgements
  ADD CONSTRAINT acknowledgements_proof_id_fkey
  FOREIGN KEY (proof_id) REFERENCES public.proofs(proof_id) ON DELETE CASCADE;

-- 4. Agents: total_receipts → total_proofs
ALTER TABLE public.agents RENAME COLUMN total_receipts TO total_proofs;

-- 5. Index renames (proofs)
ALTER INDEX IF EXISTS idx_receipts_agent_id RENAME TO idx_proofs_agent_id;
ALTER INDEX IF EXISTS idx_receipts_timestamp RENAME TO idx_proofs_timestamp;
ALTER INDEX IF EXISTS idx_receipts_artifact_type RENAME TO idx_proofs_artifact_type;
ALTER INDEX IF EXISTS idx_receipts_ship_type RENAME TO idx_proofs_ship_type;

ALTER INDEX IF EXISTS idx_acknowledgements_receipt RENAME TO idx_acknowledgements_proof;

-- 6. RLS: drop old policy, create new (table is already renamed to proofs)
DROP POLICY IF EXISTS "receipts_select_public" ON public.proofs;
CREATE POLICY "proofs_select_public" ON public.proofs
  FOR SELECT USING (true);
