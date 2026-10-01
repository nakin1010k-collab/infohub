create unique index if not exists articles_canonical_url_unique
on public.articles (canonical_url)
where canonical_url is not null;