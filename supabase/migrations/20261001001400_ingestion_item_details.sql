alter table public.ingestion_runs
  add column if not exists item_details jsonb not null default '[]'::jsonb;

alter table public.ingestion_runs
  add constraint ingestion_runs_item_details_array_check
  check (jsonb_typeof(item_details) = 'array');

create index if not exists ingestion_runs_item_details_gin_idx
  on public.ingestion_runs using gin (item_details);
