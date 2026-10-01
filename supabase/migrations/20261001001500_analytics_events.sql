create table if not exists public.analytics_events (
 id uuid primary key default gen_random_uuid(),
 event_name text not null check (event_name in ('article_view')),
 article_id uuid references public.articles(id) on delete set null,
 path text,
 created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_article_idx on public.analytics_events(article_id,created_at desc);
alter table public.analytics_events enable row level security;
drop policy if exists "analytics_public_view_insert" on public.analytics_events;
create policy "analytics_public_view_insert" on public.analytics_events for insert to anon, authenticated
with check (event_name='article_view' and char_length(coalesce(path,'')) <= 300);
drop policy if exists "analytics_editor_read" on public.analytics_events;
create policy "analytics_editor_read" on public.analytics_events for select to authenticated
using (public.is_editor_or_admin());
