-- Article authors (idempotent)
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.article_authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger (re-use set_updated_at if present)
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'set_updated_at' and pronamespace = 'public'::regnamespace
  ) then
    create or replace function public.set_updated_at() returns trigger as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$ language plpgsql;
  end if;
end;
$$;

drop trigger if exists article_authors_set_updated_at on public.article_authors;
create trigger article_authors_set_updated_at
before update on public.article_authors
for each row execute function public.set_updated_at();

-- Add author_id to articles
alter table public.articles
  add column if not exists author_id uuid;

-- Add FK (best-effort; skip if already exists)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_author_id_fkey'
  ) then
    alter table public.articles
      add constraint articles_author_id_fkey
      foreign key (author_id) references public.article_authors(id) on delete set null;
  end if;
end;
$$;

-- RLS (admin-only writes)
alter table public.article_authors enable row level security;

-- Helper is_admin() is created in drafts/supabase-admin-users-rls.sql

drop policy if exists "article_authors_admin_read" on public.article_authors;
create policy "article_authors_admin_read"
on public.article_authors
for select
to authenticated
using (public.is_admin());

drop policy if exists "article_authors_admin_write" on public.article_authors;
create policy "article_authors_admin_write"
on public.article_authors
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed Signal author (do nothing if exists)
insert into public.article_authors(slug, display_name, active)
values ('signal', 'Signal', true)
on conflict (slug) do nothing;

-- Optional backfill: if your existing articles used author_display='Signal', attach author_id.
update public.articles a
set author_id = au.id
from public.article_authors au
where au.slug = 'signal'
  and (a.author_id is null)
  and (a.author_display = 'Signal');
