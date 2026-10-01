-- InfoHub news ingestion foundation.
alter table public.sources
  add column if not exists feed_url text;

alter table public.sources
  add column if not exists last_ingested_at timestamptz;

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  status text not null check (status in ('running','success','failed')),
  items_seen integer not null default 0,
  items_created integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists ingestion_runs_source_started_idx
  on public.ingestion_runs (source_id, started_at desc);

alter table public.ingestion_runs enable row level security;

drop policy if exists "ingestion_runs_editor_read" on public.ingestion_runs;
create policy "ingestion_runs_editor_read"
on public.ingestion_runs for select
to authenticated
using (public.is_editor_or_admin());

drop policy if exists "ingestion_runs_editor_write" on public.ingestion_runs;
create policy "ingestion_runs_editor_write"
on public.ingestion_runs for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "sources_feed_editor_write" on public.sources;
create policy "sources_feed_editor_write"
on public.sources for update
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

create index if not exists sources_active_feed_idx
  on public.sources (is_active)
  where feed_url is not null;
