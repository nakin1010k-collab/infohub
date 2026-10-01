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
) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_article_id uuid; v_tag jsonb; v_tag_id uuid; v_role text;
begin
 select role into v_role from public.profiles where id=auth.uid();
 if auth.role() <> 'service_role' and (auth.uid() is null or p_actor_id <> auth.uid() or v_role not in ('editor','admin')) then raise exception 'forbidden'; end if;
 insert into public.articles(source_id,author_name,title,slug,excerpt,content,status,canonical_url,reading_minutes,published_at)
 values(p_source_id,p_author_name,p_title,p_slug,p_excerpt,p_content,'draft',p_canonical_url,p_reading_minutes,null)
 returning id into v_article_id;
 if p_category_id is not null then insert into public.article_categories(article_id,category_id) values(v_article_id,p_category_id); end if;
 for v_tag in select * from jsonb_array_elements(coalesce(p_tags,'[]'::jsonb)) loop
  insert into public.tags(slug,name) values(v_tag->>'slug',v_tag->>'name') on conflict(slug) do update set name=excluded.name returning id into v_tag_id;
  insert into public.article_tags(article_id,tag_id) values(v_article_id,v_tag_id) on conflict do nothing;
 end loop;
 insert into public.article_audit_logs(article_id,actor_id,action,metadata) values(v_article_id,p_actor_id,'imported',jsonb_build_object('source',p_source_name));
 return v_article_id;
end; $$;
