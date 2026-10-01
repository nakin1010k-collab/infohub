-- Prevent two active ingestion runs for the same source at once.
create unique index if not exists ingestion_runs_one_running_per_source
  on public.ingestion_runs (source_id)
  where status = 'running';
