create table public.notes_sync_items (
  owner uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('note','subject','prefs')),
  id text not null check (length(id) between 1 and 160),
  updated bigint not null,
  deleted integer not null check (deleted in (0,1)),
  data jsonb,
  body_key text,
  seq bigint generated always as identity,
  primary key (owner,kind,id)
);
create index notes_sync_delta on public.notes_sync_items(owner,seq);
alter table public.notes_sync_items enable row level security;
revoke all on public.notes_sync_items from anon, authenticated;
grant select,insert,update on public.notes_sync_items to authenticated;
create policy notes_owner on public.notes_sync_items for all to authenticated
  using (owner = (select auth.uid()) and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false))
  with check (owner = (select auth.uid()) and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));

create function public.notes_push(batch jsonb) returns text[]
language plpgsql security invoker set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  accepted text[] := '{}';
  previous public.notes_sync_items%rowtype;
begin
  if uid is null or jsonb_array_length(batch) > 50 then raise exception 'Invalid batch'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 37412));
  for item in select value from jsonb_array_elements(batch)
  loop
    select * into previous from public.notes_sync_items
    where owner = uid and kind = item->>'kind' and id = item->>'id';
    if found then
      if previous.updated = (item->>'updated')::bigint and previous.deleted = (item->>'deleted')::int then
        accepted := array_append(accepted, (item->>'kind') || ':' || (item->>'id'));
        continue;
      end if;
      if (item->>'kind') = 'note' and (item->>'deleted')::int = 0 and previous.deleted = 0 then
        if (item->>'base')::bigint is distinct from previous.updated then continue; end if;
      elsif previous.updated >= (item->>'updated')::bigint then
        continue;
      end if;
    end if;
    insert into public.notes_sync_items(owner,kind,id,updated,deleted,data,body_key)
    values(uid,item->>'kind',item->>'id',(item->>'updated')::bigint,(item->>'deleted')::int,item->'data',item->>'body_key')
    on conflict(owner,kind,id) do update set updated=excluded.updated, deleted=excluded.deleted,
      data=excluded.data, body_key=excluded.body_key, seq=excluded.seq;
    accepted := array_append(accepted, (item->>'kind') || ':' || (item->>'id'));
  end loop;
  return accepted;
end
$$;
revoke all on function public.notes_push(jsonb) from public, anon;
grant execute on function public.notes_push(jsonb) to authenticated;

insert into storage.buckets (id,name,public,file_size_limit)
values ('notes-assets','notes-assets',false,52428800);
create policy notes_assets_owner on storage.objects for all to authenticated
using (bucket_id = 'notes-assets' and (storage.foldername(name))[1] = (select auth.uid())::text
  and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false))
with check (bucket_id = 'notes-assets' and (storage.foldername(name))[1] = (select auth.uid())::text
  and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
