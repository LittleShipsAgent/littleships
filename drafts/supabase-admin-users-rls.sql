-- Admin auth + RLS for LittleShips (idempotent)
--
-- Run this in Supabase SQL Editor. Safe to re-run.
--
-- What it does:
-- 1) Creates public.admin_users
-- 2) Enables RLS on admin + article tables
-- 3) Installs/updates policies (drop+create) to avoid CREATE POLICY IF NOT EXISTS issues
--
-- After running:
-- - Sign in once via /admin/login (magic link) to create your auth user
-- - Fetch your user id via /api/admin/whoami
-- - Insert that UUID into public.admin_users

-- 0) Table
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 1) RLS: admin_users
alter table public.admin_users enable row level security;

drop policy if exists "admin_users_read_self" on public.admin_users;
create policy "admin_users_read_self"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- 2) Helper: is_admin()
create or replace function public.is_admin() returns boolean as $$
  select exists(select 1 from public.admin_users au where au.user_id = auth.uid());
$$ language sql stable;

-- 3) RLS: articles (writes restricted to admins)
-- NOTE: we enable RLS but do not add permissive public SELECT policies here,
-- because the app may already rely on service-role reads in some places.
-- Add public read policies separately if/when you migrate reads to anon/session clients.
alter table public.articles enable row level security;

drop policy if exists "articles_admin_insert" on public.articles;
create policy "articles_admin_insert"
on public.articles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "articles_admin_update" on public.articles;
create policy "articles_admin_update"
on public.articles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "articles_admin_delete" on public.articles;
create policy "articles_admin_delete"
on public.articles
for delete
to authenticated
using (public.is_admin());

-- 4) RLS: article_tags join table
alter table public.article_tags enable row level security;

drop policy if exists "article_tags_admin_insert" on public.article_tags;
create policy "article_tags_admin_insert"
on public.article_tags
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "article_tags_admin_delete" on public.article_tags;
create policy "article_tags_admin_delete"
on public.article_tags
for delete
to authenticated
using (public.is_admin());

-- 5) Optional: taxonomy writes (admin-only)
alter table public.article_categories enable row level security;
alter table public.tags enable row level security;

drop policy if exists "article_categories_admin_write" on public.article_categories;
create policy "article_categories_admin_write"
on public.article_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tags_admin_write" on public.tags;
create policy "tags_admin_write"
on public.tags
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 6) Seed admin (run after the user exists in auth.users)
-- insert into public.admin_users(user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict (user_id) do nothing;
