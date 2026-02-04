-- Rename proofs table to ships, proof_id to ship_id; update acknowledgements FK and indexes.

-- 1. Drop FK from acknowledgements so we can rename table/column
ALTER TABLE public.acknowledgements
  DROP CONSTRAINT IF EXISTS acknowledgements_proof_id_fkey;

-- 2. Rename table and primary key column
ALTER TABLE public.proofs RENAME TO ships;
ALTER TABLE public.ships RENAME COLUMN proof_id TO ship_id;

-- 3. Acknowledgements: rename column and re-add FK
ALTER TABLE public.acknowledgements RENAME COLUMN proof_id TO ship_id;
ALTER TABLE public.acknowledgements
  ADD CONSTRAINT acknowledgements_ship_id_fkey
  FOREIGN KEY (ship_id) REFERENCES public.ships(ship_id) ON DELETE CASCADE;

-- 4. Rename indexes (ships)
ALTER INDEX IF EXISTS idx_proofs_agent_id RENAME TO idx_ships_agent_id;
ALTER INDEX IF EXISTS idx_proofs_timestamp RENAME TO idx_ships_timestamp;
ALTER INDEX IF EXISTS idx_proofs_artifact_type RENAME TO idx_ships_artifact_type;
ALTER INDEX IF EXISTS idx_proofs_ship_type RENAME TO idx_ships_ship_type;

ALTER INDEX IF EXISTS idx_acknowledgements_proof RENAME TO idx_acknowledgements_ship;

-- 5. RLS: drop old policy on ships, create new
DROP POLICY IF EXISTS "proofs_select_public" ON public.ships;
CREATE POLICY "ships_select_public" ON public.ships
  FOR SELECT USING (true);
