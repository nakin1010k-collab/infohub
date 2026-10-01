-- Editorial workflow metadata for queue filtering.
alter table public.articles
  add column if not exists ai_enriched_at timestamptz;

create index if not exists articles_ai_enriched_idx
  on public.articles (ai_enriched_at)
  where ai_enriched_at is not null;
