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
  p_published_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
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
    reading_minutes, published_at
  ) values (
    p_title, p_slug, p_excerpt, p_content, p_status, p_canonical_url,
    p_reading_minutes, p_published_at
  ) returning id into v_article_id;

  insert into public.article_categories (article_id, category_id)
  values (v_article_id, p_category_id);

  for v_tag in select * from jsonb_array_elements(coalesce(p_tags, '[]'::jsonb)) loop
    insert into public.tags (slug, name)
    values (v_tag->>'slug', v_tag->>'name')
    on conflict (slug) do update set name = excluded.name
    returning id into v_tag_id;

    insert into public.article_tags (article_id, tag_id)
    values (v_article_id, v_tag_id);
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
  p_previous_status text
)
returns void
language plpgsql
security definer
set search_path = public
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
      updated_at = now()
  where id = p_article_id;

  delete from public.article_categories where article_id = p_article_id;
  insert into public.article_categories(article_id, category_id)
  values (p_article_id, p_category_id);

  delete from public.article_tags where article_id = p_article_id;

  for v_tag in select * from jsonb_array_elements(coalesce(p_tags, '[]'::jsonb)) loop
    insert into public.tags(slug, name)
    values (v_tag->>'slug', v_tag->>'name')
    on conflict (slug) do update set name = excluded.name
    returning id into v_tag_id;

    insert into public.article_tags(article_id, tag_id)
    values (p_article_id, v_tag_id);
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

revoke all on function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz) from public;
revoke all on function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) from public;
grant execute on function public.admin_create_article(uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz) to authenticated;
grant execute on function public.admin_update_article(uuid,uuid,text,text,text,text,text,uuid,jsonb,integer,text,timestamptz,text) to authenticated;
