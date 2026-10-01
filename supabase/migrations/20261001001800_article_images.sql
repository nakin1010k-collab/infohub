alter table public.articles add column if not exists image_url text;
create index if not exists articles_image_url_idx on public.articles(id) where image_url is not null;