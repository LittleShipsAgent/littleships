-- Sponsorship monetization (v0)
-- Run in Supabase SQL editor or via migrations.

create extension if not exists pgcrypto;

-- Orders track Stripe session/subscription lifecycle and approval state.
create table if not exists public.sponsor_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text unique,

  status text not null default 'initiated',
  -- initiated -> pending_approval -> active | rejected | canceled
  -- (active/canceled may also be driven by Stripe subscription events)

  price_cents integer not null,
  slots_sold_at_purchase integer not null,

  purchaser_email text,

  approved_at timestamptz,
  rejected_at timestamptz,
  canceled_at timestamptz
);

create index if not exists sponsor_orders_status_idx on public.sponsor_orders(status);
create index if not exists sponsor_orders_created_at_idx on public.sponsor_orders(created_at);

-- Creative (what shows in the rails). One creative per order for now.
create table if not exists public.sponsor_creatives (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  order_id uuid not null references public.sponsor_orders(id) on delete cascade,

  title text not null,
  tagline text not null,
  href text not null,

  logo_text text,
  logo_url text,
  bg_color text
);

create unique index if not exists sponsor_creatives_order_id_uniq on public.sponsor_creatives(order_id);

-- Updated-at trigger helper
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sponsor_orders_set_updated_at on public.sponsor_orders;
create trigger sponsor_orders_set_updated_at
before update on public.sponsor_orders
for each row execute function public.set_updated_at();

drop trigger if exists sponsor_creatives_set_updated_at on public.sponsor_creatives;
create trigger sponsor_creatives_set_updated_at
before update on public.sponsor_creatives
for each row execute function public.set_updated_at();

-- A public view for the rails. (Note: if you enable RLS later, make sure policies allow access.)
create or replace view public.sponsor_active_cards as
select
  o.id as order_id,
  c.id as creative_id,
  c.title,
  c.tagline,
  c.href,
  c.logo_text,
  c.logo_url,
  c.bg_color,
  o.created_at
from public.sponsor_orders o
join public.sponsor_creatives c on c.order_id = o.id
where o.status = 'active'
order by o.created_at asc;