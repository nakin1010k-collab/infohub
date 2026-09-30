-- InfoHub Phase 3A: core news/data schema
-- Designed for Supabase Postgres. No service-role key or project-specific IDs are used.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null unique,
  homepage_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  canonical_url text not null unique,
  image_url text,
  source_id uuid references public.sources(id) on delete set null,
  author_name text,
  published_at timestamptz,
  status text not null default 'draft',
  reading_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_status_check check (status in ('draft', 'published', 'archived')),
  constraint articles_reading_minutes_check check (
    reading_minutes is null or reading_minutes > 0
  )
);

create table if not exists public.article_categories (
  article_id uuid not null references public.articles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, category_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  constraint tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

create index if not exists articles_source_id_idx
  on public.articles (source_id);

create index if not exists article_categories_category_id_idx
  on public.article_categories (category_id, article_id);

create index if not exists article_tags_tag_id_idx
  on public.article_tags (tag_id, article_id);

create index if not exists categories_active_sort_order_idx
  on public.categories (is_active, sort_order);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.article_categories enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "sources_public_read" on public.sources;
create policy "sources_public_read"
on public.sources for select
to anon, authenticated
using (is_active = true);

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read"
on public.articles for select
to anon, authenticated
using (status = 'published');

drop policy if exists "article_categories_public_read" on public.article_categories;
create policy "article_categories_public_read"
on public.article_categories for select
to anon, authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and a.status = 'published'
  )
);

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
on public.tags for select
to anon, authenticated
using (
  exists (
    select 1
    from public.article_tags at
    join public.articles a on a.id = at.article_id
    where at.tag_id = tags.id
      and a.status = 'published'
  )
);

drop policy if exists "article_tags_public_read" on public.article_tags;
create policy "article_tags_public_read"
on public.article_tags for select
to anon, authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and a.status = 'published'
  )
);
