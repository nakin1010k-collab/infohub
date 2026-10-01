create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 type text not null default 'system',
 title text not null,
 message text not null,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "notifications_recipient_read" on public.notifications;
create policy "notifications_recipient_read" on public.notifications for select to authenticated using (recipient_id=auth.uid());
drop policy if exists "notifications_recipient_update" on public.notifications;
create policy "notifications_recipient_update" on public.notifications for update to authenticated using (recipient_id=auth.uid()) with check (recipient_id=auth.uid());

create or replace function public.notify_ingestion_failure(
 p_actor_id uuid, p_source_name text, p_run_id uuid, p_message text
) returns integer language plpgsql security definer set search_path=public as $$
declare v_role text; v_count integer:=0;
begin
 select role into v_role from public.profiles where id=auth.uid();
 if auth.role() <> 'service_role' and (auth.uid() is null or p_actor_id is null or p_actor_id<>auth.uid() or v_role not in ('editor','admin')) then raise exception 'forbidden'; end if;
 insert into public.notifications(recipient_id,type,title,message)
 select id,'rss_failure','RSS นำเข้ามีปัญหา',left('แหล่งข่าว '||coalesce(p_source_name,'ไม่ระบุ')||' รอบ '||p_run_id::text||': '||coalesce(p_message,''),500)
 from public.profiles where role in ('editor','admin');
 get diagnostics v_count = row_count; return v_count;
end; $$;
revoke all on function public.notify_ingestion_failure(uuid,text,uuid,text) from public;
grant execute on function public.notify_ingestion_failure(uuid,text,uuid,text) to authenticated,service_role;
