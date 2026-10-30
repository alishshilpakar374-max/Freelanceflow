#!/usr/bin/env bash
# Tests the AI quota function against a THROWAWAY local Postgres.
# It creates its own database and a minimal stand-in for Supabase's `auth` schema.
# NEVER point this at your real Supabase project.
#
#   PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres bash supabase/tests/ai_quota_test.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$HERE/../migrations"
DB=ai_quota_test
export PGHOST="${PGHOST:-127.0.0.1}" PGPORT="${PGPORT:-5432}" PGUSER="${PGUSER:-postgres}"

psql_admin() { psql -X -q -v ON_ERROR_STOP=1 -d postgres "$@"; }
psql_db() { psql -X -q -v ON_ERROR_STOP=1 -d "$DB" "$@"; }

FAILS=0
expect() { # expect <actual> <expected> <label>
  if [ "$1" = "$2" ]; then echo "  PASS  $3"; else echo "  FAIL  $3 (expected '$2', got '$1')"; FAILS=$((FAILS + 1)); fi
}
expect_match() { # expect_match <text> <regex> <label>
  if echo "$1" | grep -qiE "$2"; then echo "  PASS  $3"; else echo "  FAIL  $3 (expected /$2/, got '$1')"; FAILS=$((FAILS + 1)); fi
}

# Runs the quota function as a signed-in user (role + JWT claims, like PostgREST does).
call_as() {
  psql_db -At -c "set role authenticated;
    select set_config('request.jwt.claims', json_build_object('sub','$1','role','authenticated')::text, false);
    select public.consume_ai_quota();" | tail -1
}
new_user() { psql_db -At -c "insert into auth.users (id) values (gen_random_uuid()) returning id;"; }
count_verdicts() { # count_verdicts <file-glob-dir> <verdict>
  cat "$1"/* | grep -c "^$2$" || true
}

echo "== Setup =="
psql_admin -c "drop database if exists $DB;" -c "create database $DB;"
psql_db <<'SQL'
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;
create extension if not exists pgcrypto;
create schema auth;
create table auth.users (id uuid primary key);
-- Same logic as Supabase's auth.uid(): read the user id from the request JWT claims.
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
SQL
# Apply the migrations exactly as you would (original first, then the hardening one = upgrade path).
psql_db -f "$MIGRATIONS/20261029000020_ai_quota.sql"
psql_db -f "$MIGRATIONS/20261030000001_ai_quota_hardening.sql"

echo "== Definition and privileges =="
expect "$(psql_db -At -c "select prosecdef from pg_proc where proname='consume_ai_quota' and pronamespace='public'::regnamespace")" "t" "function is SECURITY DEFINER"
expect "$(psql_db -At -c "select 'search_path=\"\"' = any(proconfig) from pg_proc where proname='consume_ai_quota' and pronamespace='public'::regnamespace")" "t" "search_path is pinned to empty"
expect "$(psql_db -At -c "select count(*) from pg_proc where proname='consume_ai_quota' and pronamespace='public'::regnamespace")" "1" "old two-argument version is gone (exactly one function)"
expect "$(psql_db -At -c "select relrowsecurity from pg_class where oid='public.ai_requests'::regclass")" "t" "RLS enabled on ai_requests"

USER_OUT="$(psql_db -At -c "set role authenticated; select count(*) from public.ai_requests;" 2>&1 || true)"
expect_match "$USER_OUT" "permission denied" "signed-in user cannot read ai_requests directly"
USER_OUT="$(psql_db -At -c "set role authenticated; insert into public.ai_requests (user_id) values (gen_random_uuid());" 2>&1 || true)"
expect_match "$USER_OUT" "permission denied" "signed-in user cannot insert into ai_requests directly"
USER_OUT="$(psql_db -At -c "set role authenticated; delete from public.ai_requests;" 2>&1 || true)"
expect_match "$USER_OUT" "permission denied" "signed-in user cannot delete from ai_requests directly"
USER_OUT="$(psql_db -At -c "set role anon; select public.consume_ai_quota();" 2>&1 || true)"
expect_match "$USER_OUT" "permission denied" "anon role cannot execute the function"
USER_OUT="$(psql_db -At -c "set role authenticated; select public.consume_ai_quota(1000000, 1000000);" 2>&1 || true)"
expect_match "$USER_OUT" "does not exist" "caller can no longer pass their own limits"

echo "== Unauthenticated =="
expect "$(psql_db -At -c "set role authenticated; select public.consume_ai_quota();" | tail -1)" "unauthenticated" "no JWT claims -> unauthenticated"
expect "$(psql_db -At -c "select count(*) from public.ai_requests")" "0" "unauthenticated call stored nothing"

echo "== Sequential limits (10 per hour) =="
A="$(new_user)"; B="$(new_user)"
ALLOWED=0
for _ in $(seq 1 10); do [ "$(call_as "$A")" = "allowed" ] && ALLOWED=$((ALLOWED + 1)); done
expect "$ALLOWED" "10" "user A: first 10 calls allowed"
expect "$(call_as "$A")" "hourly_limit" "user A: 11th call rejected (hourly_limit)"
expect "$(call_as "$B")" "allowed" "user B is unaffected by user A"

echo "== Concurrency: 40 parallel calls from one user =="
C="$(new_user)"
OUT="$(mktemp -d)"
for i in $(seq 1 40); do call_as "$C" > "$OUT/$i" & done
wait
expect "$(count_verdicts "$OUT" allowed)" "10" "exactly 10 allowed"
expect "$(count_verdicts "$OUT" hourly_limit)" "30" "exactly 30 rejected"
expect "$(psql_db -At -c "select count(*) from public.ai_requests where user_id='$C'")" "10" "exactly 10 rows stored"
rm -rf "$OUT"

echo "== Concurrency: two users at the same time do not block each other's counts =="
E1="$(new_user)"; E2="$(new_user)"
OUT="$(mktemp -d)"
for i in $(seq 1 15); do call_as "$E1" > "$OUT/a$i" & call_as "$E2" > "$OUT/b$i" & done
wait
expect "$(psql_db -At -c "select count(*) from public.ai_requests where user_id='$E1'")" "10" "user E1 capped at 10"
expect "$(psql_db -At -c "select count(*) from public.ai_requests where user_id='$E2'")" "10" "user E2 capped at 10"
rm -rf "$OUT"

echo "== Window edges =="
OLD="$(new_user)"
psql_db -c "insert into public.ai_requests (user_id, created_at) select '$OLD', now() - interval '61 minutes' from generate_series(1,10);"
expect "$(call_as "$OLD")" "allowed" "10 requests older than an hour do not count towards the hourly limit"
NEW="$(new_user)"
psql_db -c "insert into public.ai_requests (user_id, created_at) select '$NEW', now() - interval '59 minutes' from generate_series(1,10);"
expect "$(call_as "$NEW")" "hourly_limit" "10 requests within the hour -> hourly_limit"

echo "== Daily limit (30 per day) =="
D="$(new_user)"
psql_db -c "insert into public.ai_requests (user_id, created_at) select '$D', now() - interval '5 hours' from generate_series(1,29);"
expect "$(call_as "$D")" "allowed" "29 used today: the 30th is allowed"
expect "$(call_as "$D")" "daily_limit" "31st is rejected (daily_limit)"

echo "== Concurrency at the daily boundary: 20 parallel calls with 29 already used =="
D2="$(new_user)"
psql_db -c "insert into public.ai_requests (user_id, created_at) select '$D2', now() - interval '5 hours' from generate_series(1,29);"
OUT="$(mktemp -d)"
for i in $(seq 1 20); do call_as "$D2" > "$OUT/$i" & done
wait
expect "$(count_verdicts "$OUT" allowed)" "1" "exactly 1 allowed"
expect "$(count_verdicts "$OUT" daily_limit)" "19" "exactly 19 rejected"
rm -rf "$OUT"

echo "== Old rows are cleaned up =="
G="$(new_user)"
psql_db -c "insert into public.ai_requests (user_id, created_at) values ('$G', now() - interval '8 days');"
call_as "$G" > /dev/null
expect "$(psql_db -At -c "select count(*) from public.ai_requests where user_id='$G' and created_at < now() - interval '7 days'")" "0" "rows older than 7 days removed"

echo "== Global circuit breaker (500 per day across all users) =="
psql_db -c "insert into auth.users (id) select gen_random_uuid() from generate_series(1,500);"
psql_db -c "delete from public.ai_requests;"
psql_db -c "insert into public.ai_requests (user_id) select id from (select id from auth.users limit 500) s;"
H="$(new_user)"
expect "$(call_as "$H")" "global_limit" "500 requests today across all users -> global_limit"
expect "$(psql_db -At -c "select count(*) from public.ai_requests where user_id='$H'")" "0" "rejected call stored nothing"

echo
if [ "$FAILS" -eq 0 ]; then echo "ALL SQL TESTS PASSED"; else echo "$FAILS SQL TEST(S) FAILED"; exit 1; fi
