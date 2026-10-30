create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index ai_requests_user_created_idx on public.ai_requests (user_id, created_at desc);

-- No policies and no direct privileges: only consume_ai_quota() can touch this table.
alter table public.ai_requests enable row level security;
revoke all on public.ai_requests from anon, authenticated;

create or replace function public.consume_ai_quota(max_per_hour integer, max_per_day integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  used_hour integer;
  used_day integer;
begin
  if uid is null then
    return false;
  end if;

  -- Serialise concurrent calls from the same user so they can't both slip under the limit.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  select
    count(*) filter (where created_at > now() - interval '1 hour'),
    count(*)
  into used_hour, used_day
  from public.ai_requests
  where user_id = uid and created_at > now() - interval '1 day';

  if used_hour >= max_per_hour or used_day >= max_per_day then
    return false;
  end if;

  insert into public.ai_requests (user_id) values (uid);
  delete from public.ai_requests where user_id = uid and created_at < now() - interval '7 days';
  return true;
end;
$$;

revoke execute on function public.consume_ai_quota(integer, integer) from public, anon;
grant execute on function public.consume_ai_quota(integer, integer) to authenticated;
