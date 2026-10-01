-- Editorial audit trail for traceable newsroom actions.
create table if not exists public.article_audit_logs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('created','updated','ai_enriched','published','unpublished','archived','imported')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists article_audit_logs_article_created_idx
  on public.article_audit_logs (article_id, created_at desc);

create index if not exists article_audit_logs_actor_created_idx
  on public.article_audit_logs (actor_id, created_at desc);

alter table public.article_audit_logs enable row level security;

drop policy if exists "article_audit_logs_editor_read" on public.article_audit_logs;
create policy "article_audit_logs_editor_read"
on public.article_audit_logs for select
to authenticated
using (public.is_editor_or_admin());

drop policy if exists "article_audit_logs_editor_write" on public.article_audit_logs;
create policy "article_audit_logs_editor_write"
on public.article_audit_logs for insert
to authenticated
with check (
  public.is_editor_or_admin()
  and actor_id = auth.uid()
);
