-- ACT-C4 disposable PostgreSQL-17.6 fixture. Never run on MIDAS production.
\set ON_ERROR_STOP on
\set VERBOSITY terse

do $guard$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_s45'
     or session_user <> 'postgres' or current_user <> 'postgres'
     or pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'ACT_C4_FIXTURE_REQUIRES_DISPOSABLE_POSTGRES17';
  end if;
end;
$guard$;

\echo 'ACT-C4: build exact R14 Activity and R10 export disposable preimage'
\ir 24_Activity_V2_Coaching_Export_fixture.sql

-- Mirror only the R11 V1 source contract in the same full Activity database.
drop view if exists public.v_events_activity;
drop table if exists public.health_events cascade;
create table public.health_events (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  ts timestamptz not null default pg_catalog.now(),
  day date generated always as ((ts at time zone 'Europe/Vienna')::date) stored,
  type text not null,
  ctx text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default pg_catalog.now()
);
alter table public.health_events enable row level security;
create policy events_select_own on public.health_events
  for select using ((select auth.uid()) = user_id);
create policy events_insert_own on public.health_events
  for insert with check ((select auth.uid()) = user_id);
create policy events_update_own on public.health_events
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy events_delete_own on public.health_events
  for delete using ((select auth.uid()) = user_id);
revoke all on table public.health_events
  from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.health_events
  to authenticated, service_role;
create view public.v_events_activity with (security_invoker = on) as
select e.id, e.user_id, e.ts, e.day,
       e.payload ->> 'activity'::text as activity,
       (e.payload ->> 'duration_min'::text)::integer as duration_min,
       e.payload ->> 'note'::text as note
  from public.health_events e
 where e.type = 'activity_event'::text;
revoke all on table public.v_events_activity
  from public, anon, authenticated, service_role;
grant select on table public.v_events_activity to authenticated, service_role;

\ir ../25_Activity_Consumer_Compatibility.sql
\ir ../26_Activity_Consumer_Runtime_Activation.sql

-- The reference days are relative to Vienna today, so the 28-day contract
-- stays valid when the fixture is rerun later.
create or replace function midas_fixture.c4_started_at(p_day date)
returns text language sql stable set search_path = '' as $function$
  select pg_catalog.to_char(
    pg_catalog.timezone('UTC',
      pg_catalog.timezone('Europe/Vienna',p_day::timestamp + interval '10 hours')),
    'YYYY-MM-DD"T"HH24:MI:SS"Z"')
$function$;

-- An actual pre-C4 row must retain its old request fingerprint and become true.
call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','false'::jsonb
);
set role authenticated;
select public.activity_v2_commit_session(
  '27000000-0000-4000-8000-000000000000',
  midas_fixture.duration_payload(midas_fixture.c4_started_at(
    pg_catalog.timezone('Europe/Vienna',pg_catalog.now())::date-40))
) as c4_preexisting \gset
reset role;

\echo 'ACT-C4: forward install and exact rerun'
\ir ../27_Activity_Protein_Relevance.sql
\ir ../27_Activity_Protein_Relevance.sql

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_sessions) = 1
  and (select pg_catalog.bool_and(protein_target_relevant)
       from public.health_activity_sessions)
  and pg_catalog.to_regprocedure('public.activity_protein_days(date,date)') is not null
  and not pg_catalog.has_function_privilege(
    'anon','public.activity_protein_days(date,date)','EXECUTE'),
  'ACT-C4 empty postimage or ACL drift'
);

\echo 'ACT-C4 fixture initial postimage PASS'

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','false'::jsonb
);
set role authenticated;
do $cases$
declare
  v_today date := pg_catalog.timezone('Europe/Vienna',pg_catalog.now())::date;
  v_day_one date := v_today-14;
  v_day_two date := v_today-13;
  v_day_three date := v_today-12;
  v_legacy jsonb;
  v_false jsonb;
  v_excluded jsonb;
  v_detail jsonb;
  v_replace jsonb;
  v_days jsonb;
  v_export jsonb;
  v_list jsonb;
  v_id uuid;
begin
  v_legacy := public.activity_v2_commit_session(
    '27000000-0000-4000-8000-000000000001',
    midas_fixture.duration_payload(midas_fixture.c4_started_at(v_day_one)));
  if v_legacy ->> 'outcome' <> 'created' then
    raise exception 'C4 legacy commit failed';
  end if;
  if public.activity_v2_commit_session(
      '27000000-0000-4000-8000-000000000000',
      midas_fixture.duration_payload(midas_fixture.c4_started_at(v_today-40)))
       ->> 'outcome' <> 'replayed' then
    raise exception 'C4 preexisting request fingerprint changed';
  end if;
  if public.activity_v2_commit_session(
      '27000000-0000-4000-8000-000000000001',
      midas_fixture.duration_payload(midas_fixture.c4_started_at(v_day_one)) ||
        '{"protein_target_relevant":true}'::jsonb) ->> 'outcome' <> 'replayed' then
    raise exception 'C4 explicit true did not preserve legacy fingerprint';
  end if;
  call midas_fixture.expect_commit_error(
    '27000000-0000-4000-8000-000000000001',
    midas_fixture.duration_payload(midas_fixture.c4_started_at(v_day_one)) ||
      '{"protein_target_relevant":false}'::jsonb,
    'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT');

  v_false := public.activity_v2_commit_session(
    '27000000-0000-4000-8000-000000000002',
    midas_fixture.duration_payload(midas_fixture.c4_started_at(v_day_two)) ||
      '{"protein_target_relevant":false}'::jsonb);
  v_excluded := public.activity_v2_commit_session(
    '27000000-0000-4000-8000-000000000003',
    midas_fixture.duration_payload(midas_fixture.c4_started_at(v_day_three)) ||
      '{"protein_target_relevant":false}'::jsonb);
  if v_false ->> 'outcome' <> 'created' or
     v_excluded ->> 'outcome' <> 'created' then
    raise exception 'C4 false commit failed';
  end if;

  insert into public.health_events(user_id,ts,type,payload)
  values
    (auth.uid(),midas_fixture.c4_started_at(v_day_one)::timestamptz,
     'activity_event','{"activity":"Spaziergang","duration_min":20}'::jsonb),
    (auth.uid(),midas_fixture.c4_started_at(v_day_two)::timestamptz,
     'activity_event','{"activity":"Spaziergang","duration_min":20}'::jsonb);

  v_days := public.activity_protein_days(v_today-27,v_today);
  if v_days ->> 'schema_version' <> 'midas.activity-protein-days.v1'
     or (v_days ->> 'active_day_count')::integer <> 2
     or not (v_days -> 'active_days' @> pg_catalog.jsonb_build_array(v_day_one,v_day_two))
     or v_days -> 'active_days' @> pg_catalog.jsonb_build_array(v_day_three) then
    raise exception 'C4 V1/V2 merge, dedupe or exclusion failed: %',v_days;
  end if;

  v_id := (v_excluded #>> '{session,id}')::uuid;
  v_detail := public.activity_v2_session_detail(v_id);
  if v_detail ->> 'schema_version' <> 'midas.activity-session-detail.v2'
     or v_detail ->> 'protein_target_relevant' <> 'false' then
    raise exception 'C4 detail flag missing: %',v_detail;
  end if;
  v_replace := public.activity_v2_replace_session(
    v_id,(v_detail ->> 'revision')::bigint,
    v_detail ->> 'content_fingerprint',
    midas_fixture.r9_football_replacement(45));
  if v_replace ->> 'outcome' <> 'replayed' then
    raise exception 'C4 omitted correction field did not preserve false: %',v_replace;
  end if;
  v_replace := public.activity_v2_replace_session(
    v_id,(v_detail ->> 'revision')::bigint,
    v_detail ->> 'content_fingerprint',
    midas_fixture.r9_football_replacement(45) ||
      '{"protein_target_relevant":true}'::jsonb);
  if v_replace ->> 'outcome' <> 'updated'
     or (v_replace ->> 'revision')::bigint <> (v_detail ->> 'revision')::bigint+1
     or v_replace ->> 'content_fingerprint' = v_detail ->> 'content_fingerprint' then
    raise exception 'C4 flag-only correction or CAS failed: %',v_replace;
  end if;
  v_days := public.activity_protein_days(v_today-27,v_today);
  if (v_days ->> 'active_day_count')::integer <> 3 then
    raise exception 'C4 relevance correction did not add day: %',v_days;
  end if;
  v_detail := public.activity_v2_session_detail(v_id);
  if v_detail ->> 'protein_target_relevant' <> 'true' then
    raise exception 'C4 detail correction mismatch';
  end if;

  v_list := public.activity_v2_list_sessions(10,null,null);
  if v_list ->> 'schema_version' <> 'midas.activity-session-history-page.v2'
     or pg_catalog.jsonb_array_length(v_list -> 'items') <> 4
     or exists(select 1 from pg_catalog.jsonb_array_elements(v_list -> 'items') x
               where not x.value ? 'protein_target_relevant') then
    raise exception 'C4 list flag/schema missing: %',v_list;
  end if;
  v_export := public.activity_v2_coaching_export(v_today-27,v_today);
  if v_export ->> 'schema_version' <> 'midas.activity-coaching-export.v2'
     or pg_catalog.jsonb_array_length(v_export -> 'sessions') <> 3
     or exists(select 1 from pg_catalog.jsonb_array_elements(v_export -> 'sessions') x
               where not x.value ? 'protein_target_relevant') then
    raise exception 'C4 export flag/schema missing: %',v_export;
  end if;

  v_replace := public.activity_v2_delete_session(
    v_id,(v_detail ->> 'revision')::bigint,
    v_detail ->> 'content_fingerprint');
  if v_replace ->> 'outcome' <> 'deleted' then
    raise exception 'C4 corrected delete failed: %',v_replace;
  end if;
  v_days := public.activity_protein_days(v_today-27,v_today);
  if (v_days ->> 'active_day_count')::integer <> 2 then
    raise exception 'C4 delete did not remove day: %',v_days;
  end if;
end;
$cases$;
reset role;

call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222','false'::jsonb
);
set role authenticated;
do $isolation$
declare
  v_today date := pg_catalog.timezone('Europe/Vienna',pg_catalog.now())::date;
  v_result jsonb;
begin
  v_result := public.activity_v2_commit_session(
    '27000000-0000-4000-8000-000000000004',
    midas_fixture.duration_payload(midas_fixture.c4_started_at(v_today-11)));
  if v_result ->> 'outcome' <> 'created' then
    raise exception 'C4 other owner fixture failed';
  end if;
  v_result := public.activity_protein_days(v_today-27,v_today);
  if (v_result ->> 'active_day_count')::integer <> 1 then
    raise exception 'C4 other owner count mismatch: %',v_result;
  end if;
end;
$isolation$;
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','false'::jsonb
);
set role authenticated;
do $isolation$
declare
  v_today date := pg_catalog.timezone('Europe/Vienna',pg_catalog.now())::date;
  v_result jsonb;
begin
  v_result := public.activity_protein_days(v_today-27,v_today);
  if (v_result ->> 'active_day_count')::integer <> 2
     or v_result -> 'active_days' @> pg_catalog.jsonb_build_array(v_today-11) then
    raise exception 'C4 other owner leaked to user: %',v_result;
  end if;
end;
$isolation$;
reset role;

set role service_role;
do $service$
declare
  v_today date := pg_catalog.timezone('Europe/Vienna',pg_catalog.now())::date;
begin
  if (public.activity_protein_days_for_owner(
        '11111111-1111-4111-8111-111111111111',v_today-27,v_today)
        ->> 'active_day_count')::integer <> 2
     or (public.activity_protein_days_for_owner(
        '22222222-2222-4222-8222-222222222222',v_today-27,v_today)
        ->> 'active_day_count')::integer <> 1 then
    raise exception 'C4 service owner projection mismatch';
  end if;
end;
$service$;
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','true'::jsonb
);
set role authenticated;
do $anonymous$
declare
  v_rejected boolean := false;
  v_today date := pg_catalog.timezone('Europe/Vienna',pg_catalog.now())::date;
begin
  begin
    perform public.activity_protein_days(v_today-27,v_today);
  exception when insufficient_privilege then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'C4 anonymous principal was accepted';
  end if;
end;
$anonymous$;
reset role;

select midas_fixture.assert_true(
  not pg_catalog.has_function_privilege('anon','public.activity_protein_days(date,date)','EXECUTE')
  and not pg_catalog.has_function_privilege('authenticated',
    'public.activity_protein_days_for_owner(uuid,date,date)','EXECUTE')
  and pg_catalog.has_function_privilege('service_role',
    'public.activity_protein_days_for_owner(uuid,date,date)','EXECUTE'),
  'C4 projection ACL mismatch');

\echo 'ACT-C4 data, merge, correction, list, export and ACL fixture PASS'
