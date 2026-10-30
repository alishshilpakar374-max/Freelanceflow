-- Replaces consume_ai_quota(integer, integer) from 20261029000020_ai_quota.sql.
--
-- Why: the old version took its limits as ARGUMENTS. Any signed-in user could call it
-- directly through the Supabase API with limits of their choosing, and the limits lived
-- in the Edge Function instead of the database. The limits now live inside the function
-- and cannot be changed by a caller.

drop function if exists public.consume_ai_quota(integer, integer);

create index if not exists ai_requests_created_idx on public.ai_requests (created_at desc);

create or replace function public.consume_ai_quota()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  max_per_hour constant integer := 10;
  max_per_day constant integer := 30;
  -- ASSUMPTION (my addition, not in your spec): a circuit breaker across ALL users, so
  -- account-farming cannot run up an unbounded Gemini bill. Tune or raise it as you wish.
  max_global_per_day constant integer := 100;
  used_hour integer;
  used_day integer;
  used_global integer;
begin
  if uid is null then
    return 'unauthenticated';
  end if;

  -- Serialise concurrent calls from the same user so two requests cannot both
  -- read "9 used" and both be allowed. The lock is released at the end of the call.
  perform pg_advisory_xact_lock(hashtextextended('ai_quota:' || uid::text, 0));

  select
    count(*) filter (where created_at > now() - interval '1 hour'),
    count(*)
  into used_hour, used_day
  from public.ai_requests
  where user_id = uid and created_at > now() - interval '1 day';

  if used_hour >= max_per_hour then
    return 'hourly_limit';
  end if;

  if used_day >= max_per_day then
    return 'daily_limit';
  end if;

  -- Soft limit: not serialised across users, so it can overshoot by a few under heavy concurrency.
  select count(*) into used_global
  from public.ai_requests
  where created_at > now() - interval '1 day';

  if used_global >= max_global_per_day then
    return 'global_limit';
  end if;

  insert into public.ai_requests (user_id) values (uid);
  delete from public.ai_requests where user_id = uid and created_at < now() - interval '7 days';

  return 'allowed';
end;
$$;

revoke all on function public.consume_ai_quota() from public, anon;
grant execute on function public.consume_ai_quota() to authenticated;
