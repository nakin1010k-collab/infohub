-- InfoHub editorial foundation: roles and protected CMS write policies.
-- This migration does not grant editor access to any user automatically.

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'editor', 'admin'));

create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('editor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "categories_editor_write" on public.categories;
create policy "categories_editor_write"
on public.categories for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "sources_editor_write" on public.sources;
create policy "sources_editor_write"
on public.sources for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "articles_editor_write" on public.articles;
create policy "articles_editor_write"
on public.articles for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "article_categories_editor_write" on public.article_categories;
create policy "article_categories_editor_write"
on public.article_categories for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "tags_editor_write" on public.tags;
create policy "tags_editor_write"
on public.tags for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "article_tags_editor_write" on public.article_tags;
create policy "article_tags_editor_write"
on public.article_tags for all
to authenticated
using (public.is_editor_or_admin())
with check (public.is_editor_or_admin());

drop policy if exists "profiles_admin_role_update" on public.profiles;
create policy "profiles_admin_role_update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
