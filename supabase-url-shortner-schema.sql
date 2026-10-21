-- Run this in Supabase SQL editor for the Express API.
-- These statements preserve existing rows; do not drop production tables.

create table if not exists public.url_shortner_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.url_shortner_links (
  slug text primary key,
  destination_url text not null,
  status text not null default 'Active',
  owner_id text not null references public.url_shortner_users(id) on delete cascade,
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint url_shortner_links_status_check check (status in ('Active', 'Paused', 'Archived'))
);

create index url_shortner_links_owner_created_idx
on public.url_shortner_links (owner_id, created_at desc);

create table if not exists public.url_shortner_clicks (
  id bigint generated always as identity primary key,
  slug text not null references public.url_shortner_links(slug) on delete cascade,
  user_agent text,
  referrer text,
  ip_address text,
  clicked_at timestamptz not null default now()
);

create index url_shortner_clicks_slug_clicked_idx
on public.url_shortner_clicks (slug, clicked_at desc);

-- Express uses its service role key, which bypasses RLS. Keep direct public
-- access closed because the app's JWTs are verified by Express, not Supabase.
alter table public.url_shortner_users enable row level security;
alter table public.url_shortner_links enable row level security;
alter table public.url_shortner_clicks enable row level security;
