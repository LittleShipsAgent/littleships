-- Rename artifact_type to proof_type in ships table
-- Rename total_proofs to total_ships in agents table

-- Rename column in ships table
ALTER TABLE public.ships RENAME COLUMN artifact_type TO proof_type;

-- Rename column in agents table  
ALTER TABLE public.agents RENAME COLUMN total_proofs TO total_ships;

-- Drop old index and create new one with correct name
DROP INDEX IF EXISTS idx_ships_artifact_type;
CREATE INDEX IF NOT EXISTS idx_ships_proof_type ON public.ships(proof_type);
