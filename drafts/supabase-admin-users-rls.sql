-- Admin auth + RLS for LittleShips (v0)
--
-- 1) Create admin_users
-- 2) Enable RLS policies requiring admin membership for article writes
--
-- Setup flow:
-- - Enable Auth (email magic links) in Supabase project
-- - Create user by signing in once via the app
-- - Then insert that user into admin_users (see seed section)

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Allow user to read their own membership row (useful for gating UI)
create policy if not exists "admin_users_read_self" on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Helper: is admin
create or replace function public.is_admin() returns boolean as $$
  select exists(select 1 from public.admin_users au where au.user_id = auth.uid());
$$ language sql stable;

-- Articles: allow read to everyone (existing behavior should already be public via app queries)
-- Writes are restricted to admins.

alter table public.articles enable row level security;

create policy if not exists "articles_admin_insert" on public.articles
for insert
to authenticated
with check (public.is_admin());

create policy if not exists "articles_admin_update" on public.articles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy if not exists "articles_admin_delete" on public.articles
for delete
to authenticated
using (public.is_admin());

-- Article tags join table
alter table public.article_tags enable row level security;

create policy if not exists "article_tags_admin_insert" on public.article_tags
for insert
to authenticated
with check (public.is_admin());

create policy if not exists "article_tags_admin_delete" on public.article_tags
for delete
to authenticated
using (public.is_admin());

-- Categories + tags (if you want admin-managed taxonomy later)
alter table public.article_categories enable row level security;
alter table public.tags enable row level security;

create policy if not exists "article_categories_admin_write" on public.article_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy if not exists "tags_admin_write" on public.tags
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed admin (run after the user exists in auth.users)
-- Replace with Tim's auth user id.
-- insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000000');
