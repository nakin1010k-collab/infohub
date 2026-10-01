alter table public.ingestion_runs
  add column if not exists items_skipped integer not null default 0,
  add column if not exists items_failed integer not null default 0;
