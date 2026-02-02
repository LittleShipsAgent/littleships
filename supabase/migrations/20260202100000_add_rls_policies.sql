-- RLS Policies for LittleShips
-- Defense in depth: these policies apply if anon key is ever used
-- Service role key bypasses RLS, so server-side operations are unaffected

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "agents_select_public" ON public.agents;
DROP POLICY IF EXISTS "agents_insert_authenticated" ON public.agents;
DROP POLICY IF EXISTS "receipts_select_public" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert_authenticated" ON public.receipts;
DROP POLICY IF EXISTS "high_fives_select_public" ON public.high_fives;
DROP POLICY IF EXISTS "high_fives_insert_authenticated" ON public.high_fives;

-- Agents: public read, no direct write via anon key
CREATE POLICY "agents_select_public" ON public.agents
  FOR SELECT USING (true);

-- Receipts: public read, no direct write via anon key
CREATE POLICY "receipts_select_public" ON public.receipts
  FOR SELECT USING (true);

-- High-fives: public read, no direct write via anon key
CREATE POLICY "high_fives_select_public" ON public.high_fives
  FOR SELECT USING (true);

-- Note: INSERT/UPDATE/DELETE require service role key (server-side only)
-- No INSERT policies for anon key = direct writes blocked from browser
