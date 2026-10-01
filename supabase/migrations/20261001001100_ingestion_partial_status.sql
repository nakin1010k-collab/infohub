-- Allow a feed run to finish with some item-level failures.
-- "partial" means the feed itself was fetched, but at least one item failed.
alter table public.ingestion_runs
  drop constraint if exists ingestion_runs_status_check;

alter table public.ingestion_runs
  add constraint ingestion_runs_status_check
  check (status in ('running', 'success', 'partial', 'failed'));
