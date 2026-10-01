-- Keep structured per-item RSS failures so editors can identify the exact source item and reason.
alter table public.ingestion_runs
  add column if not exists failure_details jsonb not null default '[]'::jsonb;

alter table public.ingestion_runs
  add constraint ingestion_runs_failure_details_array_check
  check (jsonb_typeof(failure_details) = 'array');

create index if not exists ingestion_runs_failure_details_gin_idx
  on public.ingestion_runs using gin (failure_details);
