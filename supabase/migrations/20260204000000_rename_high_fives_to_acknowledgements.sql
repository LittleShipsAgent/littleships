-- Rename high_fives table and policies to acknowledgements for consistency.
-- Idempotent: only runs when public.high_fives exists (e.g. existing DBs). Fresh installs use schema.sql which creates acknowledgements directly.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'high_fives') THEN
    ALTER TABLE public.high_fives RENAME TO acknowledgements;
  END IF;
END $$;

ALTER INDEX IF EXISTS idx_high_fives_receipt RENAME TO idx_acknowledgements_receipt;

DROP POLICY IF EXISTS "high_fives_select_public" ON public.acknowledgements;
DROP POLICY IF EXISTS "high_fives_insert_authenticated" ON public.acknowledgements;

CREATE POLICY "acknowledgements_select_public" ON public.acknowledgements
  FOR SELECT USING (true);
