-- InfoHub security and article-write hardening.
-- Keeps the existing RPC contracts available while adding an atomic image-aware
-- contract for the current application and tightening SECURITY DEFINER exposure.

-- Pin search_path on project-owned functions so SECURITY DEFINER execution does
-- not inherit a caller-controlled path.
alter function public.set_updated_at() set search_path = pg_catalog, public, auth;
alter function public.handle_new_user() set search_path = pg_catalog, public, auth;
alter function public.is_editor_or_admin() set search_path = pg_catalog, public, auth;
alter function public.is_admin() set search_path = pg_catalog, public, auth;
alter function public.current_profile_role() set search_path = pg_catalog, public, auth;
alter function public.notify_ingestion_failure(uuid, text, uuid, text) set search_path = pg_catalog, public, auth;

-- The existing article RPCs are privileged write endpoints. Keep them callable
-- by the roles that need them, but never by anon/public.
revoke execute on function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz) from public, anon;
revoke execute on function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) from public, anon;
revoke execute on function public.admin_import_article(uuid,uuid,text,text,text,text,text,text,text,integer,uuid,jsonb) from public, anon;
revoke execute on function public.is_editor_or_admin() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.current_profile_role() from public, anon;
revoke execute on function public.notify_ingestion_failure(uuid,text,uuid,text) from public, anon;

grant execute on function public.is_editor_or_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.notify_ingestion_failure(uuid,text,uuid,text) to authenticated, service_role;

-- Replace the ingestion helper without the deprecated auth.role() check.
create or replace function public.admin_import_article(
  p_actor_id uuid,
  p_source_id uuid,
  p_source_name text,
  p_slug text,
  p_title text,
  p_excerpt text,
  p_content text,
  p_canonical_url text,
  p_author_name text,
  p_reading_minutes integer,
  p_category_id uuid,
  p_tags jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_article_id uuid;
  v_tag jsonb;
  v_tag_id uuid;
  v_role text;
  v_service_role boolean;
begin
  select role into v_role from public.profiles where id = auth.uid();
  v_service_role := coalesce(auth.jwt()->>'role', '') = 'service_role';

  if not v_service_role
     and (auth.uid() is null or p_actor_id <> auth.uid() or v_role not in ('editor','admin')) then
    raise exception 'forbidden';
  end if;

  insert into public.articles (
    slug,title,excerpt,content,canonical_url,source_id,author_name,
    published_at,status,reading_minutes,ai_enriched_at
  ) values (
    p_slug,p_title,p_excerpt,p_content,p_canonical_url,p_source_id,p_author_name,
    null,'draft',p_reading_minutes,null
  ) returning id into v_article_id;

  if p_category_id is not null then
    insert into public.article_categories(article_id,category_id)
    values (v_article_id,p_category_id);
  end if;

  for v_tag in select * from pg_catalog.jsonb_array_elements(coalesce(p_tags,'[]'::jsonb)) loop
    insert into public.tags(slug,name)
    values (v_tag->>'slug',v_tag->>'name')
    on conflict (slug) do update set name=excluded.name
    returning id into v_tag_id;
    insert into public.article_tags(article_id,tag_id)
    values (v_article_id,v_tag_id)
    on conflict do nothing;
  end loop;

  insert into public.article_audit_logs(article_id,actor_id,action,metadata)
  values (
    v_article_id,p_actor_id,'imported',
    jsonb_build_object('sourceId',p_source_id,'sourceName',p_source_name,'canonicalUrl',p_canonical_url)
  );

  return v_article_id;
end;
$$;

-- New image-aware RPCs make article creation/editing atomic with image_url.
create or replace function public.admin_create_article(
  p_actor_id uuid,
  p_title text,
  p_slug text,
  p_excerpt text,
  p_content text,
  p_status text,
  p_category_id uuid,
  p_tags jsonb,
  p_reading_minutes integer,
  p_canonical_url text,
  p_published_at timestamptz,
  p_image_url text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_article_id uuid;
  v_tag jsonb;
  v_tag_id uuid;
  v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if auth.uid() is null or p_actor_id <> auth.uid() or v_role not in ('editor','admin') then
    raise exception 'forbidden';
  end if;

  insert into public.articles (
    title, slug, excerpt, content, status, canonical_url,
    reading_minutes, published_at, image_url
  ) values (
    p_title, p_slug, p_excerpt, p_content, p_status, p_canonical_url,
    p_reading_minutes, p_published_at, p_image_url
  ) returning id into v_article_id;

  insert into public.article_categories (article_id, category_id)
  values (v_article_id, p_category_id);

  for v_tag in select * from pg_catalog.jsonb_array_elements(coalesce(p_tags, '[]'::jsonb)) loop
    insert into public.tags (slug, name)
    values (v_tag->>'slug', v_tag->>'name')
    on conflict (slug) do update set name = excluded.name
    returning id into v_tag_id;
    insert into public.article_tags (article_id, tag_id)
    values (v_article_id, v_tag_id)
    on conflict do nothing;
  end loop;

  insert into public.article_audit_logs(article_id, actor_id, action, metadata)
  values (v_article_id, p_actor_id, 'created', jsonb_build_object('status', p_status));

  if p_status = 'published' then
    insert into public.article_audit_logs(article_id, actor_id, action, metadata)
    values (v_article_id, p_actor_id, 'published', '{}'::jsonb);
  end if;

  return v_article_id;
end;
$$;

create or replace function public.admin_update_article(
  p_actor_id uuid,
  p_article_id uuid,
  p_title text,
  p_slug text,
  p_excerpt text,
  p_content text,
  p_status text,
  p_category_id uuid,
  p_tags jsonb,
  p_reading_minutes integer,
  p_canonical_url text,
  p_published_at timestamptz,
  p_previous_status text,
  p_image_url text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_tag jsonb;
  v_tag_id uuid;
  v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if auth.uid() is null or p_actor_id <> auth.uid() or v_role not in ('editor','admin') then
    raise exception 'forbidden';
  end if;

  if not exists (select 1 from public.articles where id = p_article_id) then
    raise exception 'not_found';
  end if;

  update public.articles
  set title = p_title,
      slug = p_slug,
      excerpt = p_excerpt,
      content = p_content,
      status = p_status,
      canonical_url = p_canonical_url,
      reading_minutes = p_reading_minutes,
      published_at = p_published_at,
      image_url = p_image_url,
      updated_at = pg_catalog.now()
  where id = p_article_id;

  delete from public.article_categories where article_id = p_article_id;
  insert into public.article_categories(article_id, category_id)
  values (p_article_id, p_category_id);

  delete from public.article_tags where article_id = p_article_id;

  for v_tag in select * from pg_catalog.jsonb_array_elements(coalesce(p_tags, '[]'::jsonb)) loop
    insert into public.tags(slug, name)
    values (v_tag->>'slug', v_tag->>'name')
    on conflict (slug) do update set name = excluded.name
    returning id into v_tag_id;
    insert into public.article_tags(article_id, tag_id)
    values (p_article_id, v_tag_id)
    on conflict do nothing;
  end loop;

  insert into public.article_audit_logs(article_id, actor_id, action, metadata)
  values (
    p_article_id, p_actor_id, 'updated',
    jsonb_build_object('status', p_status, 'previousStatus', p_previous_status)
  );

  if p_status <> p_previous_status then
    if p_status = 'published' then
      insert into public.article_audit_logs(article_id, actor_id, action, metadata)
      values (p_article_id, p_actor_id, 'published',
        jsonb_build_object('previousStatus', p_previous_status, 'status', p_status));
    elsif p_previous_status = 'published' then
      insert into public.article_audit_logs(article_id, actor_id, action, metadata)
      values (p_article_id, p_actor_id, 'unpublished',
        jsonb_build_object('previousStatus', p_previous_status, 'status', p_status));
    elsif p_status = 'archived' then
      insert into public.article_audit_logs(article_id, actor_id, action, metadata)
      values (p_article_id, p_actor_id, 'archived',
        jsonb_build_object('previousStatus', p_previous_status, 'status', p_status));
    end if;
  end if;
end;
$$;

revoke all on function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) from public, anon;
revoke all on function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text,text) from public, anon;
grant execute on function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) to authenticated;
grant execute on function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text,text) to authenticated;

-- Tighten the legacy overloads still present from earlier migrations.
alter function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz) set search_path = pg_catalog, public, auth;
alter function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) set search_path = pg_catalog, public, auth;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz) from authenticated;
revoke execute on function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) from authenticated;
