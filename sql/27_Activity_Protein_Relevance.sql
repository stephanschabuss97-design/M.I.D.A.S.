-- MIDAS ACT-C4: additive protein-target relevance for completed activity.
-- Product execution is owner-gated. Run only after the documented preimage.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = '';

lock table public.health_activity_sessions,
  public.health_activity_session_items,
  public.health_activity_item_sets,
  public.health_events in share row exclusive mode;

do $guard$
declare
  v_column pg_catalog.pg_attribute%rowtype;
  v_default text;
  v_expected_hash text;
  v_new_hash text;
  v_signature text;
  v_oid oid;
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999
     or session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'ACT_C4_SQL27_REQUIRES_POSTGRES17_OWNER';
  end if;
  if pg_catalog.to_regrole('authenticated') is null
     or pg_catalog.to_regrole('anon') is null
     or pg_catalog.to_regrole('service_role') is null
     or pg_catalog.to_regprocedure('public.activity_consumer_snapshot_for_owner(uuid,date,date)') is null
     or pg_catalog.to_regprocedure('midas_private.activity_consumer_snapshot_core(uuid,date,date)') is null then
    raise exception 'ACT_C4_SQL27_PREIMAGE_MISSING';
  end if;
  if pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef('public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure),
       'UTF8')), 'hex') <> 'cffcd679d91b86c621388e790752e3100be140dd582f1e1fe18cf2d5cff79f2b'
     or pg_catalog.has_function_privilege('anon', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE')
     or not pg_catalog.has_function_privilege('authenticated', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE')
     or not pg_catalog.has_function_privilege('service_role', 'public.activity_consumer_snapshot_for_owner(uuid,date,date)', 'EXECUTE') then
    raise exception 'ACT_C4_SQL27_SHARED_CONSUMER_DRIFT';
  end if;
  select a.* into v_column
    from pg_catalog.pg_attribute a
   where a.attrelid='public.health_activity_sessions'::pg_catalog.regclass
     and a.attname='protein_target_relevant' and not a.attisdropped;
  if v_column.attname is not null then
    select pg_catalog.pg_get_expr(d.adbin,d.adrelid) into v_default
      from pg_catalog.pg_attrdef d
     where d.adrelid=v_column.attrelid and d.adnum=v_column.attnum;
  end if;
  if v_column.attname is not null and (v_column.atttypid <> 'boolean'::pg_catalog.regtype
      or not v_column.attnotnull or v_default <> 'true') then
    raise exception 'ACT_C4_SQL27_COLUMN_DRIFT';
  end if;
  for v_signature, v_expected_hash, v_new_hash in
    select * from (values
    ('public.activity_v2_commit_session(uuid,jsonb)', '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e', 'c83a990aff798f87ba5b344bd2847b7f83a469ef97952eff0fe028603d06ec7f'),
    ('public.activity_v2_replace_session(uuid,bigint,text,jsonb)', 'feb73a16ccc2680f8ddb368ffbabd1c4cb41320838af9d6040b6c6d2a7cf1f7f', '47d91dcdb39b3487b5bdf64591b3a37a2277471d4c5e7f5b4184d8986fbe7804'),
    ('public.activity_v2_delete_session(uuid,bigint,text)', '97474cc440ca538abd0fa6f444bb2bb69fd801f2080c28e5d81599484477f54b', '6c38acac8f9cfd30b0d867b379906357867f957e0d4626609f627e8a7cf8abc9'),
    ('public.activity_v2_list_sessions(integer,timestamptz,uuid)', 'aeca949ea42b53ec3b7ead67668be4b3c6b70553d538068c01f93157ad0de8ed', 'cbe132ea713c928b4205a8764c1154c582deb221e67b88ad5dbeeb564ffe113a'),
    ('public.activity_v2_session_detail(uuid)', '53938011daac6fe80e68a9c3464604b69f396a4d5f5ff4d274cfbcca925cbb11', 'e87af0d9666dc009f934500192129905a565b712b27c2d1c00b070a35fb1479e'),
    ('public.activity_v2_coaching_export(date,date)', 'ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376', '33c3aa549553363ff75c223b651d9cf298da4d4caca4f4dc8fce673b061906d4')
    ) x(signature, old_hash, new_hash)
  loop
    v_oid := pg_catalog.to_regprocedure(v_signature);
    if v_oid is null then raise exception 'ACT_C4_SQL27_FUNCTION_MISSING:%',v_signature; end if;
    if pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') <>
       (case when v_column.attname is null then v_expected_hash else v_new_hash end) then
      raise exception 'ACT_C4_SQL27_SOURCE_DRIFT:%',v_signature;
    end if;
    if not pg_catalog.has_function_privilege('authenticated', v_oid, 'EXECUTE')
       or pg_catalog.has_function_privilege('anon',v_oid,'EXECUTE') then
      raise exception 'ACT_C4_SQL27_ACL_DRIFT:%',v_signature;
    end if;
  end loop;
  if v_column.attname is not null then
    for v_signature,v_expected_hash in select * from (values
    ('midas_private.activity_protein_days_core(uuid,date,date)', '457b4fc537ed275105f6720910b453266271bdc74606ccdb2cf202120c8a9908'),
    ('public.activity_protein_days(date,date)', '499f12587573cc5fa3fbf98e57b07bfef34761a52a47ecb1a683283fd6ea793a'),
    ('public.activity_protein_days_for_owner(uuid,date,date)', '201811da3b2b48a1a3ccea80af3c506975a8f898a0921057a4f0a7e308019dbe')
      ) x(signature,expected_hash)
    loop
      v_oid := pg_catalog.to_regprocedure(v_signature);
      if v_oid is null or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_oid),'UTF8')),'hex') <> v_expected_hash then
        raise exception 'ACT_C4_SQL27_PROJECTION_DRIFT:%',v_signature;
      end if;
    end loop;
  end if;
end;
$guard$;

create temporary table midas_c4_preimage on commit drop as
select
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s)-'protein_target_relevant' order by s.id),'[]'::jsonb)::text,'UTF8')),'hex')
    from public.health_activity_sessions s) sessions_hash,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id),'[]'::jsonb)::text,'UTF8')),'hex')
    from public.health_activity_session_items i) items_hash,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id),'[]'::jsonb)::text,'UTF8')),'hex')
    from public.health_activity_item_sets st) sets_hash,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id),'[]'::jsonb)::text,'UTF8')),'hex')
    from public.health_events e) events_hash;

alter table public.health_activity_sessions
  add column if not exists protein_target_relevant boolean not null default true;
create or replace function public.activity_v2_commit_session(
  p_request_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_started_at timestamptz;
  v_ended_at timestamptz;
  v_duration_min integer;
  v_title text;
  v_note text;
  v_protein_target_relevant boolean := true;
  v_client_catalog_version integer;
  v_canonical_payload jsonb;
  v_canonical_items jsonb := '[]'::jsonb;
  v_canonical_sets jsonb;
  v_canonical_set jsonb;
  v_item jsonb;
  v_set jsonb;
  v_item_count integer;
  v_set_count integer;
  v_item_order integer;
  v_set_order integer;
  v_item_orders integer[] := array[]::integer[];
  v_set_orders integer[];
  v_item_keys text[] := array[]::text[];
  v_item_key text;
  v_number numeric;
  v_item_duration integer;
  v_distance_km numeric(6,2);
  v_item_note text;
  v_reps integer;
  v_duration_sec integer;
  v_distance_m numeric(7,2);
  v_weight_kg numeric(6,2);
  v_assistance_kg numeric(6,2);
  v_fingerprint text;
  v_existing_fingerprint text;
  v_session_id uuid;
  v_session_item_id uuid;
  v_outcome text;
  v_tracking_mode text;
  v_label text;
  v_equipment text;
  v_load_comparability text;
  v_field_policy jsonb;
  v_field text;
  v_rule text;
  v_value_text text;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_request_id is null then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  if not (p_payload ?& array[
    'schema_version', 'catalog_version', 'started_at', 'ended_at',
    'duration_min', 'items'
  ]::text[])
  or p_payload - array[
    'schema_version', 'catalog_version', 'started_at', 'ended_at',
    'duration_min', 'title', 'note', 'items', 'protein_target_relevant'
  ]::text[] <> '{}'::jsonb then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'schema_version') <> 'string'
     or p_payload ->> 'schema_version' <> 'midas.activity-session.v1' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if p_payload ? 'protein_target_relevant' then
    if pg_catalog.jsonb_typeof(p_payload -> 'protein_target_relevant') <> 'boolean' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_protein_target_relevant := (p_payload ->> 'protein_target_relevant')::boolean;
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'catalog_version') <> 'number' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_number := (p_payload ->> 'catalog_version')::numeric;
  if v_number <> pg_catalog.trunc(v_number)
     or v_number < 1 or v_number > 2147483647 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_client_catalog_version := v_number::integer;

  if pg_catalog.jsonb_typeof(p_payload -> 'started_at') <> 'string'
     or pg_catalog.jsonb_typeof(p_payload -> 'ended_at') <> 'string'
     or (p_payload ->> 'started_at') !~
       '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}(\.[0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$'
     or (p_payload ->> 'ended_at') !~
       '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}(\.[0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  begin
    v_started_at := (p_payload ->> 'started_at')::timestamptz;
    v_ended_at := (p_payload ->> 'ended_at')::timestamptz;
  exception when others then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end;
  if v_ended_at < v_started_at then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'duration_min') <> 'number' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_number := (p_payload ->> 'duration_min')::numeric;
  if v_number <> pg_catalog.trunc(v_number)
     or v_number < 1 or v_number > 1440 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_duration_min := v_number::integer;

  if not (p_payload ? 'title') or p_payload -> 'title' = 'null'::jsonb then
    v_title := null;
  elsif pg_catalog.jsonb_typeof(p_payload -> 'title') = 'string' then
    v_title := pg_catalog.btrim(p_payload ->> 'title');
    if v_title = '' then v_title := null; end if;
    if v_title is not null and pg_catalog.char_length(v_title) > 120 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  else
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if not (p_payload ? 'note') or p_payload -> 'note' = 'null'::jsonb then
    v_note := null;
  elsif pg_catalog.jsonb_typeof(p_payload -> 'note') = 'string' then
    v_note := pg_catalog.btrim(p_payload ->> 'note');
    if v_note = '' then v_note := null; end if;
    if v_note is not null and pg_catalog.char_length(v_note) > 500 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  else
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'items') <> 'array' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_item_count := pg_catalog.jsonb_array_length(p_payload -> 'items');
  if v_item_count < 1 or v_item_count > 50 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  for v_item in
    select e.value from pg_catalog.jsonb_array_elements(p_payload -> 'items') e(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
       or not (v_item ?& array['item_key', 'item_order', 'sets']::text[])
       or v_item - array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[] <> '{}'::jsonb then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'item_key') <> 'string' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_key := v_item ->> 'item_key';
    if pg_catalog.char_length(v_item_key) not between 1 and 64
       or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'
       or v_item_key = any (v_item_keys) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_keys := pg_catalog.array_append(v_item_keys, v_item_key);

    if pg_catalog.jsonb_typeof(v_item -> 'item_order') <> 'number' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_number := (v_item ->> 'item_order')::numeric;
    if v_number <> pg_catalog.trunc(v_number)
       or v_number < 1 or v_number > 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_order := v_number::integer;
    if v_item_order = any (v_item_orders) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_orders := pg_catalog.array_append(v_item_orders, v_item_order);

    v_item_duration := null;
    if v_item ? 'duration_min' and v_item -> 'duration_min' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'duration_min') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'duration_min')::numeric;
      if v_number <> pg_catalog.trunc(v_number)
         or v_number < 1 or v_number > 1440 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_duration := v_number::integer;
    end if;

    v_distance_km := null;
    if v_item ? 'distance_km' and v_item -> 'distance_km' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'distance_km') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'distance_km')::numeric;
      if v_number <> pg_catalog.round(v_number, 2)
         or v_number < 0.01 or v_number > 1000.00 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_distance_km := v_number::numeric(6,2);
    end if;

    v_item_note := null;
    if v_item ? 'note' and v_item -> 'note' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'note') <> 'string' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_note := pg_catalog.btrim(v_item ->> 'note');
      if v_item_note = '' then v_item_note := null; end if;
      if v_item_note is not null and pg_catalog.char_length(v_item_note) > 500 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'sets') <> 'array' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
    if v_set_count > 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_set_orders := array[]::integer[];
    v_canonical_sets := '[]'::jsonb;

    for v_set in
      select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
    loop
      if pg_catalog.jsonb_typeof(v_set) <> 'object'
         or not (v_set ? 'set_order')
         or v_set - array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[] <> '{}'::jsonb then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      if pg_catalog.jsonb_typeof(v_set -> 'set_order') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_set ->> 'set_order')::numeric;
      if v_number <> pg_catalog.trunc(v_number)
         or v_number < 1 or v_number > 50 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_order := v_number::integer;
      if v_set_order = any (v_set_orders) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_orders := pg_catalog.array_append(v_set_orders, v_set_order);

      v_reps := null;
      if v_set ? 'reps' and v_set -> 'reps' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'reps') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'reps')::numeric;
        if v_number <> pg_catalog.trunc(v_number)
           or v_number < 1 or v_number > 1000 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_reps := v_number::integer;
      end if;

      v_duration_sec := null;
      if v_set ? 'duration_sec' and v_set -> 'duration_sec' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'duration_sec') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'duration_sec')::numeric;
        if v_number <> pg_catalog.trunc(v_number)
           or v_number < 1 or v_number > 3600 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_duration_sec := v_number::integer;
      end if;

      v_distance_m := null;
      if v_set ? 'distance_m' and v_set -> 'distance_m' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'distance_m') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'distance_m')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.10 or v_number > 10000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_distance_m := v_number::numeric(7,2);
      end if;

      v_weight_kg := null;
      if v_set ? 'weight_kg' and v_set -> 'weight_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'weight_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'weight_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.01 or v_number > 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_weight_kg := v_number::numeric(6,2);
      end if;

      v_assistance_kg := null;
      if v_set ? 'assistance_kg'
         and v_set -> 'assistance_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'assistance_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'assistance_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.01 or v_number > 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_assistance_kg := v_number::numeric(6,2);
      end if;

      if (case when v_reps is null then 0 else 1 end)
         + (case when v_duration_sec is null then 0 else 1 end)
         + (case when v_distance_m is null then 0 else 1 end) <> 1
         or (v_weight_kg is not null and v_assistance_kg is not null) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_canonical_set := pg_catalog.jsonb_build_object(
        'set_order', v_set_order,
        'reps', v_reps,
        'duration_sec', v_duration_sec,
        'distance_m', v_distance_m,
        'weight_kg', v_weight_kg,
        'assistance_kg', v_assistance_kg
      );
      v_canonical_sets := v_canonical_sets
        || pg_catalog.jsonb_build_array(v_canonical_set);
    end loop;

    if v_set_count > 0 then
      for v_index in 1..v_set_count loop
        if not (v_index = any (v_set_orders)) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;
      select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'set_order')::integer)
        into v_canonical_sets
        from pg_catalog.jsonb_array_elements(v_canonical_sets) e(value);
    end if;

    v_canonical_items := v_canonical_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', v_item_key,
        'item_order', v_item_order,
        'duration_min', v_item_duration,
        'distance_km', v_distance_km,
        'note', v_item_note,
        'sets', v_canonical_sets
      )
    );
  end loop;

  for v_index in 1..v_item_count loop
    if not (v_index = any (v_item_orders)) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  end loop;
  select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'item_order')::integer)
    into v_canonical_items
    from pg_catalog.jsonb_array_elements(v_canonical_items) e(value);

  v_canonical_payload := pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', v_client_catalog_version,
    'started_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_started_at),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'ended_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_ended_at),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'duration_min', v_duration_min,
    'title', v_title,
    'note', v_note,
    'items', v_canonical_items
  );
  if not v_protein_target_relevant then
    v_canonical_payload := v_canonical_payload ||
      pg_catalog.jsonb_build_object('protein_target_relevant', false);
  end if;
  v_fingerprint := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(v_canonical_payload::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

  select s.id, s.request_fingerprint
    into v_session_id, v_existing_fingerprint
    from public.health_activity_sessions s
   where s.user_id = v_user and s.request_id = p_request_id;

  if found then
    if v_existing_fingerprint <> v_fingerprint then
      raise exception 'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
        using errcode = '22023';
    end if;
    v_outcome := 'replayed';
  else
    if v_ended_at > v_now + interval '5 minutes' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    if not exists (
      select 1
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_client_catalog_version
    ) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    for v_item in
      select e.value
        from pg_catalog.jsonb_array_elements(v_canonical_items) e(value)
       order by (e.value ->> 'item_order')::integer
    loop
      v_item_key := v_item ->> 'item_key';
      select
        c.label,
        c.tracking_mode,
        c.equipment,
        c.load_comparability,
        c.field_policy
        into
          v_label,
          v_tracking_mode,
          v_equipment,
          v_load_comparability,
          v_field_policy
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_client_catalog_version
         and c.item_key = v_item_key
         and c.status = 'active';
      if not found then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
      if (v_tracking_mode = 'strength_sets' and v_set_count < 1)
         or (v_tracking_mode <> 'strength_sets' and v_set_count <> 0) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      foreach v_field in array array['duration_min', 'distance_km', 'note']::text[]
      loop
        v_rule := v_field_policy ->> v_field;
        v_value_text := v_item ->> v_field;
        if (v_rule = 'required' and v_value_text is null)
           or (v_rule = 'forbidden' and v_value_text is not null) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;

      for v_set in
        select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
      loop
        foreach v_field in array array[
          'reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'
        ]::text[]
        loop
          v_rule := v_field_policy ->> v_field;
          v_value_text := v_set ->> v_field;
          if (v_rule = 'required' and v_value_text is null)
             or (v_rule = 'forbidden' and v_value_text is not null) then
            raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
          end if;
        end loop;
      end loop;
    end loop;

    v_session_id := null;
    insert into public.health_activity_sessions (
      user_id,
      request_id,
      request_fingerprint,
      protein_target_relevant,
      started_at,
      ended_at,
      duration_min,
      title,
      note
    ) values (
      v_user,
      p_request_id,
      v_fingerprint,
      v_protein_target_relevant,
      v_started_at,
      v_ended_at,
      v_duration_min,
      v_title,
      v_note
    )
    on conflict (user_id, request_id) do nothing
    returning id into v_session_id;

    if v_session_id is null then
      select s.id, s.request_fingerprint
        into strict v_session_id, v_existing_fingerprint
        from public.health_activity_sessions s
       where s.user_id = v_user and s.request_id = p_request_id;
      if v_existing_fingerprint <> v_fingerprint then
        raise exception 'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
          using errcode = '22023';
      end if;
      v_outcome := 'replayed';
    else
      v_outcome := 'created';
      for v_item in
        select e.value
          from pg_catalog.jsonb_array_elements(v_canonical_items) e(value)
         order by (e.value ->> 'item_order')::integer
      loop
        v_item_key := v_item ->> 'item_key';
        select
          c.label,
          c.tracking_mode,
          c.equipment,
          c.load_comparability,
          c.field_policy
          into strict
            v_label,
            v_tracking_mode,
            v_equipment,
            v_load_comparability,
            v_field_policy
          from public.health_activity_catalog_entries c
         where c.catalog_version = v_client_catalog_version
           and c.item_key = v_item_key
           and c.status = 'active';

        insert into public.health_activity_session_items (
          user_id,
          session_id,
          catalog_version,
          item_key,
          item_order,
          item_label_snapshot,
          tracking_mode_snapshot,
          equipment_snapshot,
          load_comparability_snapshot,
          field_policy_snapshot,
          duration_min,
          distance_km,
          note
        ) values (
          v_user,
          v_session_id,
          v_client_catalog_version,
          v_item_key,
          (v_item ->> 'item_order')::smallint,
          v_label,
          v_tracking_mode,
          v_equipment,
          v_load_comparability,
          v_field_policy,
          (v_item ->> 'duration_min')::integer,
          (v_item ->> 'distance_km')::numeric(6,2),
          v_item ->> 'note'
        )
        returning id into v_session_item_id;

        for v_set in
          select e.value
            from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
           order by (e.value ->> 'set_order')::integer
        loop
          insert into public.health_activity_item_sets (
            user_id,
            session_item_id,
            set_order,
            tracking_mode,
            reps,
            duration_sec,
            distance_m,
            weight_kg,
            assistance_kg
          ) values (
            v_user,
            v_session_item_id,
            (v_set ->> 'set_order')::smallint,
            'strength_sets',
            (v_set ->> 'reps')::integer,
            (v_set ->> 'duration_sec')::integer,
            (v_set ->> 'distance_m')::numeric(7,2),
            (v_set ->> 'weight_kg')::numeric(6,2),
            (v_set ->> 'assistance_kg')::numeric(6,2)
          );
        end loop;
      end loop;
    end if;
  end if;

  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-result.v1',
    'outcome', v_outcome,
    'session', pg_catalog.jsonb_build_object(
      'id', s.id,
      'request_id', s.request_id,
      'started_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.started_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'ended_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.ended_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'day', s.day,
      'duration_min', s.duration_min,
      'title', s.title,
      'note', s.note,
      'created_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.created_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'updated_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.updated_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'items', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'id', i.id,
            'catalog_version', i.catalog_version,
            'item_key', i.item_key,
            'item_order', i.item_order,
            'item_label_snapshot', i.item_label_snapshot,
            'tracking_mode_snapshot', i.tracking_mode_snapshot,
            'equipment_snapshot', i.equipment_snapshot,
            'load_comparability_snapshot', i.load_comparability_snapshot,
            'field_policy_snapshot', i.field_policy_snapshot,
            'duration_min', i.duration_min,
            'distance_km', i.distance_km,
            'note', i.note,
            'created_at', pg_catalog.to_char(
              pg_catalog.timezone('UTC', i.created_at),
              'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            ),
            'sets', coalesce((
              select pg_catalog.jsonb_agg(
                pg_catalog.jsonb_build_object(
                  'id', st.id,
                  'set_order', st.set_order,
                  'tracking_mode', st.tracking_mode,
                  'reps', st.reps,
                  'duration_sec', st.duration_sec,
                  'distance_m', st.distance_m,
                  'weight_kg', st.weight_kg,
                  'assistance_kg', st.assistance_kg,
                  'created_at', pg_catalog.to_char(
                    pg_catalog.timezone('UTC', st.created_at),
                    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
                  )
                ) order by st.set_order
              )
              from public.health_activity_item_sets st
              where st.session_item_id = i.id and st.user_id = v_user
            ), '[]'::jsonb)
          ) order by i.item_order
        )
        from public.health_activity_session_items i
        where i.session_id = s.id and i.user_id = v_user
      ), '[]'::jsonb)
    )
  )
    into strict v_result
    from public.health_activity_sessions s
   where s.id = v_session_id and s.user_id = v_user;

  return v_result;
end;
$$;

create or replace function public.activity_v2_replace_session(
  p_session_id uuid,
  p_expected_revision bigint,
  p_expected_content_fingerprint text,
  p_replacement jsonb
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.health_activity_sessions%rowtype;
  v_protein_target_relevant boolean;
  v_catalog_version integer;
  v_catalog_count integer;
  v_item_count integer;
  v_current_items jsonb;
  v_current_content jsonb;
  v_current_fingerprint text;
  v_desired_items jsonb := '[]'::jsonb;
  v_desired_sets jsonb;
  v_desired_content jsonb;
  v_desired_fingerprint text;
  v_item jsonb;
  v_set jsonb;
  v_item_key text;
  v_item_id uuid;
  v_duration_min integer;
  v_number numeric;
  v_label text;
  v_tracking_mode text;
  v_equipment text;
  v_load_comparability text;
  v_field_policy jsonb;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_session_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_expected_content_fingerprint is null
     or p_expected_content_fingerprint !~ '^[0-9a-f]{64}$'
     or p_replacement is null
     or pg_catalog.jsonb_typeof(p_replacement) <> 'object'
     or not (p_replacement ?& array[
       'schema_version', 'duration_min', 'note', 'items'
     ]::text[])
     or p_replacement - array[
       'schema_version', 'duration_min', 'note', 'items',
       'protein_target_relevant'
     ]::text[] <> '{}'::jsonb
     or pg_catalog.jsonb_typeof(p_replacement -> 'schema_version') <> 'string'
     or p_replacement ->> 'schema_version' <> 'midas.activity-session-replacement.v1'
     or pg_catalog.jsonb_typeof(p_replacement -> 'duration_min') <> 'number'
     or not (pg_catalog.jsonb_typeof(p_replacement -> 'note') in ('string', 'null'))
     or pg_catalog.jsonb_typeof(p_replacement -> 'items') <> 'array'
     or (p_replacement ? 'protein_target_relevant' and
         pg_catalog.jsonb_typeof(p_replacement -> 'protein_target_relevant') <> 'boolean') then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  v_number := (p_replacement ->> 'duration_min')::numeric;
  if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 1440 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_duration_min := v_number::integer;

  select s.* into v_session
    from public.health_activity_sessions s
   where s.id = p_session_id and s.user_id = v_user
   for update;
  if not found then
    raise exception 'MIDAS_ACTIVITY_SESSION_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_protein_target_relevant := v_session.protein_target_relevant;
  if p_replacement ? 'protein_target_relevant' then
    v_protein_target_relevant := (p_replacement ->> 'protein_target_relevant')::boolean;
  end if;

  select pg_catalog.count(*)::integer,
         pg_catalog.count(distinct i.catalog_version)::integer,
         pg_catalog.min(i.catalog_version)
    into v_item_count, v_catalog_count, v_catalog_version
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;
  if v_item_count < 1 or v_catalog_count <> 1 or v_catalog_version is null or v_catalog_version < 1 then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'item_key', i.item_key,
             'item_order', i.item_order,
             'item_label_snapshot', i.item_label_snapshot,
             'tracking_mode_snapshot', i.tracking_mode_snapshot,
             'equipment_snapshot', i.equipment_snapshot,
             'load_comparability_snapshot', i.load_comparability_snapshot,
             'field_policy_snapshot', i.field_policy_snapshot,
             'duration_min', i.duration_min,
             'distance_km', i.distance_km,
             'note', i.note,
             'sets', coalesce((
               select pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'set_order', st.set_order,
                   'tracking_mode', st.tracking_mode,
                   'reps', st.reps,
                   'duration_sec', st.duration_sec,
                   'distance_m', st.distance_m,
                   'weight_kg', st.weight_kg,
                   'assistance_kg', st.assistance_kg
                 ) order by st.set_order)
               from public.health_activity_item_sets st
               where st.session_item_id = i.id and st.user_id = v_user
             ), '[]'::jsonb)
           ) order by i.item_order)
    into v_current_items
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  begin
    v_current_content := midas_private.activity_v2_canonical_content(
      v_catalog_version, v_session.duration_min, v_session.note, v_current_items
    );
  exception when others then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end;
  if not v_session.protein_target_relevant then
    v_current_content := v_current_content ||
      pg_catalog.jsonb_build_object('protein_target_relevant', false);
  end if;
  v_current_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_current_content::text, 'UTF8'), 'sha256'), 'hex');

  if pg_catalog.jsonb_array_length(p_replacement -> 'items') not between 1 and 50 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  for v_item in
    select e.value from pg_catalog.jsonb_array_elements(p_replacement -> 'items') e(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
       or not (v_item ?& array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[])
       or v_item - array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[] <> '{}'::jsonb
       or pg_catalog.jsonb_typeof(v_item -> 'item_key') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'sets') <> 'array' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_key := v_item ->> 'item_key';
    if pg_catalog.char_length(v_item_key) not between 1 and 64
       or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    select i.item_label_snapshot, i.tracking_mode_snapshot,
           i.equipment_snapshot, i.load_comparability_snapshot,
           i.field_policy_snapshot
      into v_label, v_tracking_mode, v_equipment,
           v_load_comparability, v_field_policy
      from public.health_activity_session_items i
     where i.session_id = v_session.id
       and i.user_id = v_user
       and i.item_key = v_item_key;
    if not found then
      select c.label, c.tracking_mode, c.equipment,
             c.load_comparability, c.field_policy
        into v_label, v_tracking_mode, v_equipment,
             v_load_comparability, v_field_policy
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_catalog_version
         and c.item_key = v_item_key
         and c.status = 'active';
      if not found then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end if;

    v_desired_sets := '[]'::jsonb;
    for v_set in
      select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
    loop
      if pg_catalog.jsonb_typeof(v_set) <> 'object'
         or not (v_set ?& array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[])
         or v_set - array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[] <> '{}'::jsonb then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_desired_sets := v_desired_sets || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'set_order', v_set -> 'set_order',
          'tracking_mode', 'strength_sets',
          'reps', v_set -> 'reps',
          'duration_sec', v_set -> 'duration_sec',
          'distance_m', v_set -> 'distance_m',
          'weight_kg', v_set -> 'weight_kg',
          'assistance_kg', v_set -> 'assistance_kg'
        )
      );
    end loop;

    v_desired_items := v_desired_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', v_item -> 'item_key',
        'item_order', v_item -> 'item_order',
        'item_label_snapshot', v_label,
        'tracking_mode_snapshot', v_tracking_mode,
        'equipment_snapshot', v_equipment,
        'load_comparability_snapshot', v_load_comparability,
        'field_policy_snapshot', v_field_policy,
        'duration_min', v_item -> 'duration_min',
        'distance_km', v_item -> 'distance_km',
        'note', v_item -> 'note',
        'sets', v_desired_sets
      )
    );
  end loop;

  v_desired_content := midas_private.activity_v2_canonical_content(
    v_catalog_version,
    v_duration_min,
    p_replacement ->> 'note',
    v_desired_items
  );
  if not v_protein_target_relevant then
    v_desired_content := v_desired_content ||
      pg_catalog.jsonb_build_object('protein_target_relevant', false);
  end if;
  v_desired_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_desired_content::text, 'UTF8'), 'sha256'), 'hex');

  if v_desired_content = v_current_content then
    return pg_catalog.jsonb_build_object(
      'schema_version', 'midas.activity-session-mutation-result.v1',
      'operation', 'replace',
      'outcome', 'replayed',
      'session_id', v_session.id,
      'revision', v_session.revision::text,
      'content_fingerprint', v_current_fingerprint
    );
  end if;

  if p_expected_revision <> v_session.revision
     or p_expected_content_fingerprint <> v_current_fingerprint then
    raise exception 'MIDAS_ACTIVITY_SESSION_CONFLICT' using errcode = '40001';
  end if;
  if v_session.revision = 9223372036854775807 then
    raise exception 'MIDAS_ACTIVITY_REVISION_EXHAUSTED' using errcode = '22023';
  end if;

  if (v_desired_content - 'protein_target_relevant') <>
     (v_current_content - 'protein_target_relevant') then
    delete from public.health_activity_session_items i
     where i.session_id = v_session.id and i.user_id = v_user;

    for v_item in
      select e.value
        from pg_catalog.jsonb_array_elements(v_desired_content -> 'items') e(value)
       order by (e.value ->> 'item_order')::integer
    loop
      insert into public.health_activity_session_items (
        user_id, session_id, catalog_version, item_key, item_order,
        item_label_snapshot, tracking_mode_snapshot, equipment_snapshot,
        load_comparability_snapshot, field_policy_snapshot,
        duration_min, distance_km, note
      ) values (
        v_user, v_session.id, v_catalog_version,
        v_item ->> 'item_key', (v_item ->> 'item_order')::smallint,
        v_item ->> 'item_label_snapshot', v_item ->> 'tracking_mode_snapshot',
        v_item ->> 'equipment_snapshot', v_item ->> 'load_comparability_snapshot',
        v_item -> 'field_policy_snapshot',
        (v_item ->> 'duration_min')::integer,
        (v_item ->> 'distance_km')::numeric(6,2),
        v_item ->> 'note'
      ) returning id into v_item_id;

      for v_set in
        select e.value
          from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
         order by (e.value ->> 'set_order')::integer
      loop
        insert into public.health_activity_item_sets (
          user_id, session_item_id, set_order, tracking_mode,
          reps, duration_sec, distance_m, weight_kg, assistance_kg
        ) values (
          v_user, v_item_id, (v_set ->> 'set_order')::smallint,
          v_set ->> 'tracking_mode',
          (v_set ->> 'reps')::integer,
          (v_set ->> 'duration_sec')::integer,
          (v_set ->> 'distance_m')::numeric(7,2),
          (v_set ->> 'weight_kg')::numeric(6,2),
          (v_set ->> 'assistance_kg')::numeric(6,2)
        );
      end loop;
    end loop;
  end if;

  update public.health_activity_sessions s
     set duration_min = v_duration_min,
         ended_at = s.started_at + pg_catalog.make_interval(mins => v_duration_min),
         note = v_desired_content ->> 'note',
         protein_target_relevant = v_protein_target_relevant,
         revision = s.revision + 1,
         updated_at = pg_catalog.clock_timestamp()
   where s.id = v_session.id and s.user_id = v_user;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-mutation-result.v1',
    'operation', 'replace',
    'outcome', 'updated',
    'session_id', v_session.id,
    'revision', (v_session.revision + 1)::text,
    'content_fingerprint', v_desired_fingerprint
  );
end;
$function$;

create or replace function public.activity_v2_delete_session(
  p_session_id uuid,
  p_expected_revision bigint,
  p_expected_content_fingerprint text
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.health_activity_sessions%rowtype;
  v_catalog_version integer;
  v_catalog_count integer;
  v_item_count integer;
  v_items jsonb;
  v_content jsonb;
  v_fingerprint text;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_session_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_expected_content_fingerprint is null
     or p_expected_content_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  select s.* into v_session
    from public.health_activity_sessions s
   where s.id = p_session_id and s.user_id = v_user
   for update;
  if not found then
    return pg_catalog.jsonb_build_object(
      'schema_version', 'midas.activity-session-mutation-result.v1',
      'operation', 'delete',
      'outcome', 'already_absent',
      'session_id', p_session_id
    );
  end if;

  select pg_catalog.count(*)::integer,
         pg_catalog.count(distinct i.catalog_version)::integer,
         pg_catalog.min(i.catalog_version)
    into v_item_count, v_catalog_count, v_catalog_version
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;
  if v_item_count < 1 or v_catalog_count <> 1 or v_catalog_version is null or v_catalog_version < 1 then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'item_key', i.item_key,
             'item_order', i.item_order,
             'item_label_snapshot', i.item_label_snapshot,
             'tracking_mode_snapshot', i.tracking_mode_snapshot,
             'equipment_snapshot', i.equipment_snapshot,
             'load_comparability_snapshot', i.load_comparability_snapshot,
             'field_policy_snapshot', i.field_policy_snapshot,
             'duration_min', i.duration_min,
             'distance_km', i.distance_km,
             'note', i.note,
             'sets', coalesce((
               select pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'set_order', st.set_order,
                   'tracking_mode', st.tracking_mode,
                   'reps', st.reps,
                   'duration_sec', st.duration_sec,
                   'distance_m', st.distance_m,
                   'weight_kg', st.weight_kg,
                   'assistance_kg', st.assistance_kg
                 ) order by st.set_order)
               from public.health_activity_item_sets st
               where st.session_item_id = i.id and st.user_id = v_user
             ), '[]'::jsonb)
           ) order by i.item_order)
    into v_items
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  begin
    v_content := midas_private.activity_v2_canonical_content(
      v_catalog_version, v_session.duration_min, v_session.note, v_items
    );
  exception when others then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end;
  if not v_session.protein_target_relevant then
    v_content := v_content ||
      pg_catalog.jsonb_build_object('protein_target_relevant', false);
  end if;
  v_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_content::text, 'UTF8'), 'sha256'), 'hex');

  if p_expected_revision <> v_session.revision
     or p_expected_content_fingerprint <> v_fingerprint then
    raise exception 'MIDAS_ACTIVITY_SESSION_CONFLICT' using errcode = '40001';
  end if;

  delete from public.health_activity_sessions s
   where s.id = v_session.id and s.user_id = v_user;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-mutation-result.v1',
    'operation', 'delete',
    'outcome', 'deleted',
    'session_id', v_session.id
  );
end;
$function$;

create or replace function public.activity_v2_list_sessions(
  p_limit integer,
  p_cursor_started_at timestamptz,
  p_cursor_id uuid
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_rows jsonb;
  v_items jsonb;
  v_has_more boolean;
  v_next_cursor jsonb;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_limit is null or p_limit not between 1 and 50
     or ((p_cursor_started_at is null) <> (p_cursor_id is null)) then
    raise exception 'MIDAS_ACTIVITY_INVALID_HISTORY_REQUEST' using errcode = '22023';
  end if;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(q) order by q.started_at desc, q.session_id desc), '[]'::jsonb)
    into v_rows
    from (
      select
        s.id as session_id,
        s.started_at,
        pg_catalog.to_char(pg_catalog.timezone('UTC', s.started_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as started_at_text,
        pg_catalog.to_char(s.day, 'YYYY-MM-DD') as day_text,
        s.title,
        s.duration_min,
        s.protein_target_relevant,
        (select pg_catalog.count(*)::integer
           from public.health_activity_session_items i
          where i.session_id = s.id and i.user_id = v_user) as item_count,
        s.revision::text as revision
      from public.health_activity_sessions s
      where s.user_id = v_user
        and (p_cursor_started_at is null
          or (s.started_at, s.id) < (p_cursor_started_at, p_cursor_id))
      order by s.started_at desc, s.id desc
      limit p_limit + 1
    ) q;

  v_has_more := pg_catalog.jsonb_array_length(v_rows) > p_limit;
  select coalesce(pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'session_id', e.value -> 'session_id',
             'started_at', e.value -> 'started_at_text',
             'day', e.value -> 'day_text',
             'title', e.value -> 'title',
             'duration_min', e.value -> 'duration_min',
             'protein_target_relevant', e.value -> 'protein_target_relevant',
             'item_count', e.value -> 'item_count',
             'revision', e.value -> 'revision'
           ) order by e.ordinality
         ), '[]'::jsonb)
    into v_items
    from pg_catalog.jsonb_array_elements(v_rows) with ordinality e(value, ordinality)
   where e.ordinality <= p_limit;

  if v_has_more then
    select pg_catalog.jsonb_build_object(
      'started_at', e.value -> 'started_at_text',
      'id', e.value -> 'session_id'
    ) into v_next_cursor
    from pg_catalog.jsonb_array_elements(v_rows) with ordinality e(value, ordinality)
    where e.ordinality = p_limit;
  else
    v_next_cursor := null;
  end if;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-history-page.v2',
    'items', v_items,
    'has_more', v_has_more,
    'next_cursor', v_next_cursor
  );
end;
$function$;

create or replace function public.activity_v2_session_detail(p_session_id uuid)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.health_activity_sessions%rowtype;
  v_catalog_version integer;
  v_catalog_count integer;
  v_item_count integer;
  v_items jsonb;
  v_content jsonb;
  v_fingerprint text;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_session_id is null then
    raise exception 'MIDAS_ACTIVITY_INVALID_HISTORY_REQUEST' using errcode = '22023';
  end if;

  select s.* into v_session
    from public.health_activity_sessions s
   where s.id = p_session_id and s.user_id = v_user;
  if not found then return null; end if;

  select pg_catalog.count(*)::integer,
         pg_catalog.count(distinct i.catalog_version)::integer,
         pg_catalog.min(i.catalog_version)
    into v_item_count, v_catalog_count, v_catalog_version
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;
  if v_item_count < 1 or v_catalog_count <> 1 or v_catalog_version is null or v_catalog_version < 1 then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'item_key', i.item_key,
             'item_order', i.item_order,
             'item_label_snapshot', i.item_label_snapshot,
             'tracking_mode_snapshot', i.tracking_mode_snapshot,
             'equipment_snapshot', i.equipment_snapshot,
             'load_comparability_snapshot', i.load_comparability_snapshot,
             'field_policy_snapshot', i.field_policy_snapshot,
             'duration_min', i.duration_min,
             'distance_km', i.distance_km,
             'note', i.note,
             'sets', coalesce((
               select pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'set_order', st.set_order,
                   'tracking_mode', st.tracking_mode,
                   'reps', st.reps,
                   'duration_sec', st.duration_sec,
                   'distance_m', st.distance_m,
                   'weight_kg', st.weight_kg,
                   'assistance_kg', st.assistance_kg
                 ) order by st.set_order)
               from public.health_activity_item_sets st
               where st.session_item_id = i.id and st.user_id = v_user
             ), '[]'::jsonb)
           ) order by i.item_order)
    into v_items
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  begin
    v_content := midas_private.activity_v2_canonical_content(
      v_catalog_version, v_session.duration_min, v_session.note, v_items
    );
  exception when others then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end;
  if not v_session.protein_target_relevant then
    v_content := v_content ||
      pg_catalog.jsonb_build_object('protein_target_relevant', false);
  end if;
  v_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_content::text, 'UTF8'), 'sha256'), 'hex');

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-detail.v2',
    'session_id', v_session.id,
    'catalog_version', v_catalog_version,
    'revision', v_session.revision::text,
    'content_fingerprint', v_fingerprint,
    'started_at', pg_catalog.to_char(pg_catalog.timezone('UTC', v_session.started_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'ended_at', pg_catalog.to_char(pg_catalog.timezone('UTC', v_session.ended_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'day', pg_catalog.to_char(v_session.day, 'YYYY-MM-DD'),
    'title', v_session.title,
    'duration_min', v_session.duration_min,
    'protein_target_relevant', v_session.protein_target_relevant,
    'note', v_content -> 'note',
    'items', v_content -> 'items'
  );
end;
$function$;

create or replace function public.activity_v2_coaching_export(
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_user uuid;
  v_generated_at timestamptz := pg_catalog.statement_timestamp();
  v_vienna_today date;
  v_from_at timestamptz;
  v_until_at timestamptz;
  v_session_count bigint;
  v_item_count bigint;
  v_set_count bigint;
  v_sessions jsonb;
  v_cautions jsonb;
begin
  v_user := auth.uid();
  if v_user is null
     or coalesce(auth.jwt() ->> 'is_anonymous', '') <> 'false' then
    raise exception using
      errcode = '42501',
      message = 'MIDAS_ACTIVITY_AUTH_REQUIRED';
  end if;

  v_vienna_today := pg_catalog.timezone('Europe/Vienna', v_generated_at)::date;
  if p_from is null
     or p_to is null
     or p_from > p_to
     or (p_to - p_from) not between 0 and 365
     or p_to > v_vienna_today then
    raise exception using
      errcode = '22023',
      message = 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST';
  end if;

  v_from_at := pg_catalog.timezone(
    'Europe/Vienna', p_from::timestamp without time zone
  );
  v_until_at := pg_catalog.timezone(
    'Europe/Vienna', (p_to + 1)::timestamp without time zone
  );

  select pg_catalog.count(*)
    into strict v_session_count
    from public.health_activity_sessions s
   where s.user_id = v_user
     and s.started_at >= v_from_at
     and s.started_at < v_until_at
     and s.day between p_from and p_to;
  if v_session_count > 1000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED';
  end if;

  select pg_catalog.count(*)
    into strict v_item_count
    from public.health_activity_session_items i
    join public.health_activity_sessions s
      on s.id = i.session_id
     and s.user_id = v_user
   where i.user_id = v_user
     and s.started_at >= v_from_at
     and s.started_at < v_until_at
     and s.day between p_from and p_to;
  if v_item_count > 10000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED';
  end if;

  select pg_catalog.count(*)
    into strict v_set_count
    from public.health_activity_item_sets st
    join public.health_activity_session_items i
      on i.id = st.session_item_id
     and i.user_id = v_user
    join public.health_activity_sessions s
      on s.id = i.session_id
     and s.user_id = v_user
   where st.user_id = v_user
     and s.started_at >= v_from_at
     and s.started_at < v_until_at
     and s.day between p_from and p_to;
  if v_set_count > 50000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED';
  end if;

  -- A session must have one catalog version, unique keys and dense 1..n order.
  if exists (
    select 1
      from public.health_activity_sessions s
      cross join lateral (
        select
          pg_catalog.count(*) as item_count,
          pg_catalog.count(distinct i.item_key) as key_count,
          pg_catalog.count(distinct i.catalog_version) as version_count,
          pg_catalog.count(distinct i.item_order) as order_count,
          pg_catalog.min(i.item_order) as min_order,
          pg_catalog.max(i.item_order) as max_order
        from public.health_activity_session_items i
       where i.session_id = s.id
         and i.user_id = v_user
      ) x
     where s.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         x.item_count not between 1 and 50
         or x.key_count <> x.item_count
         or x.version_count <> 1
         or x.order_count <> x.item_count
         or x.min_order <> 1
         or x.max_order <> x.item_count
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  -- Historical snapshot fields and item values must match the original row.
  if exists (
    select 1
      from public.health_activity_session_items i
      join public.health_activity_sessions s
        on s.id = i.session_id
       and s.user_id = v_user
      left join public.health_activity_catalog_entries c
        on c.catalog_version = i.catalog_version
       and c.item_key = i.item_key
       and c.tracking_mode = i.tracking_mode_snapshot
     where i.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         c.item_key is null
         or i.item_label_snapshot <> c.label
         or i.equipment_snapshot <> c.equipment
         or i.load_comparability_snapshot <> c.load_comparability
         or i.field_policy_snapshot <> c.field_policy
         or case i.field_policy_snapshot ->> 'duration_min'
              when 'required' then i.duration_min is null
              when 'forbidden' then i.duration_min is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'distance_km'
              when 'required' then i.distance_km is null
              when 'forbidden' then i.distance_km is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'note'
              when 'required' then i.note is null
              when 'forbidden' then i.note is not null
              else false
            end
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  -- Strength items have dense 1..n sets; all other modes have no sets.
  if exists (
    select 1
      from public.health_activity_session_items i
      join public.health_activity_sessions s
        on s.id = i.session_id
       and s.user_id = v_user
      cross join lateral (
        select
          pg_catalog.count(*) as set_count,
          pg_catalog.count(distinct st.set_order) as order_count,
          pg_catalog.min(st.set_order) as min_order,
          pg_catalog.max(st.set_order) as max_order
        from public.health_activity_item_sets st
       where st.session_item_id = i.id
         and st.user_id = v_user
      ) x
     where i.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         (i.tracking_mode_snapshot = 'strength_sets' and (
           x.set_count not between 1 and 50
           or x.order_count <> x.set_count
           or x.min_order <> 1
           or x.max_order <> x.set_count
         ))
         or (i.tracking_mode_snapshot <> 'strength_sets' and x.set_count <> 0)
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  -- Set modes and every field-policy obligation are checked fail-closed.
  if exists (
    select 1
      from public.health_activity_item_sets st
      join public.health_activity_session_items i
        on i.id = st.session_item_id
       and i.user_id = v_user
      join public.health_activity_sessions s
        on s.id = i.session_id
       and s.user_id = v_user
     where st.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         i.tracking_mode_snapshot <> 'strength_sets'
         or st.tracking_mode <> i.tracking_mode_snapshot
         or case i.field_policy_snapshot ->> 'reps'
              when 'required' then st.reps is null
              when 'forbidden' then st.reps is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'duration_sec'
              when 'required' then st.duration_sec is null
              when 'forbidden' then st.duration_sec is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'distance_m'
              when 'required' then st.distance_m is null
              when 'forbidden' then st.distance_m is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'weight_kg'
              when 'required' then st.weight_kg is null
              when 'forbidden' then st.weight_kg is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'assistance_kg'
              when 'required' then st.assistance_kg is null
              when 'forbidden' then st.assistance_kg is not null
              else false
            end
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  select coalesce(
           pg_catalog.jsonb_agg(q.caution order by q.caution collate "C"),
           '[]'::jsonb
         )
    into strict v_cautions
    from (
      select 'no_sessions_in_range'::text as caution
       where v_session_count = 0
      union
      select 'device_relative_loads_present'::text
       where exists (
         select 1
           from public.health_activity_session_items i
           join public.health_activity_sessions s
             on s.id = i.session_id and s.user_id = v_user
          where i.user_id = v_user
            and s.started_at >= v_from_at and s.started_at < v_until_at
            and s.day between p_from and p_to
            and i.load_comparability_snapshot = 'device_relative'
       )
      union
      select 'assistance_loads_present'::text
       where exists (
         select 1
           from public.health_activity_item_sets st
           join public.health_activity_session_items i
             on i.id = st.session_item_id and i.user_id = v_user
           join public.health_activity_sessions s
             on s.id = i.session_id and s.user_id = v_user
          where st.user_id = v_user
            and s.started_at >= v_from_at and s.started_at < v_until_at
            and s.day between p_from and p_to
            and st.assistance_kg is not null
       )
      union
      select 'multiple_catalog_versions_present'::text
       where 1 < (
         select pg_catalog.count(distinct i.catalog_version)
           from public.health_activity_session_items i
           join public.health_activity_sessions s
             on s.id = i.session_id and s.user_id = v_user
          where i.user_id = v_user
            and s.started_at >= v_from_at and s.started_at < v_until_at
            and s.day between p_from and p_to
       )
    ) q;

  select coalesce(
           pg_catalog.jsonb_agg(
             session_row.value
             order by session_row.day, session_row.started_at, session_row.id
           ),
           '[]'::jsonb
         )
    into strict v_sessions
    from (
      select
        s.day,
        s.started_at,
        s.id,
        pg_catalog.jsonb_build_object(
          'session_id', s.id::text,
          'catalog_version', (
            select pg_catalog.min(i.catalog_version)
              from public.health_activity_session_items i
             where i.session_id = s.id and i.user_id = v_user
          ),
          'revision', s.revision::text,
          'protein_target_relevant', s.protein_target_relevant,
          'day', s.day::text,
          'started_at', pg_catalog.to_char(
            pg_catalog.timezone('UTC', s.started_at),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          ),
          'ended_at', pg_catalog.to_char(
            pg_catalog.timezone('UTC', s.ended_at),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          ),
          'duration_min', s.duration_min,
          'title', s.title,
          'note', s.note,
          'items', (
            select coalesce(
                     pg_catalog.jsonb_agg(item_row.value order by item_row.item_order),
                     '[]'::jsonb
                   )
              from (
                select
                  i.item_order,
                  pg_catalog.jsonb_build_object(
                    'item_key', i.item_key,
                    'item_order', i.item_order,
                    'item_label_snapshot', i.item_label_snapshot,
                    'tracking_mode_snapshot', i.tracking_mode_snapshot,
                    'equipment_snapshot', i.equipment_snapshot,
                    'load_comparability_snapshot', i.load_comparability_snapshot,
                    'field_policy_snapshot', i.field_policy_snapshot,
                    'category', c.category,
                    'muscle_groups', pg_catalog.to_jsonb(c.muscle_groups),
                    'sport_tags', pg_catalog.to_jsonb(c.sport_tags),
                    'duration_min', i.duration_min,
                    'distance_km', i.distance_km,
                    'note', i.note,
                    'sets', (
                      select coalesce(
                               pg_catalog.jsonb_agg(
                                 pg_catalog.jsonb_build_object(
                                   'set_order', st.set_order,
                                   'tracking_mode', st.tracking_mode,
                                   'reps', st.reps,
                                   'duration_sec', st.duration_sec,
                                   'distance_m', st.distance_m,
                                   'weight_kg', st.weight_kg,
                                   'assistance_kg', st.assistance_kg
                                 ) order by st.set_order
                               ),
                               '[]'::jsonb
                             )
                        from public.health_activity_item_sets st
                       where st.session_item_id = i.id
                         and st.user_id = v_user
                    )
                  ) as value
                  from public.health_activity_session_items i
                  join public.health_activity_catalog_entries c
                    on c.catalog_version = i.catalog_version
                   and c.item_key = i.item_key
                   and c.tracking_mode = i.tracking_mode_snapshot
                 where i.session_id = s.id
                   and i.user_id = v_user
              ) item_row
          )
        ) as value
        from public.health_activity_sessions s
       where s.user_id = v_user
         and s.started_at >= v_from_at
         and s.started_at < v_until_at
         and s.day between p_from and p_to
    ) session_row;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-coaching-export.v2',
    'generated_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_generated_at),
      'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    ),
    'timezone', 'Europe/Vienna',
    'range', pg_catalog.jsonb_build_object(
      'from', p_from::text,
      'to', p_to::text,
      'inclusive', true
    ),
    'units', pg_catalog.jsonb_build_object(
      'session_duration', 'min',
      'item_duration', 'min',
      'item_distance', 'km',
      'set_duration', 's',
      'set_distance', 'm',
      'weight', 'kg',
      'assistance', 'kg',
      'repetitions', 'count'
    ),
    'completeness', pg_catalog.jsonb_build_object(
      'status', 'complete',
      'truncated', false,
      'session_count', v_session_count,
      'item_count', v_item_count,
      'set_count', v_set_count
    ),
    'quality', pg_catalog.jsonb_build_object(
      'status', case when v_session_count = 0 then 'no_data' else 'ok' end,
      'cautions', v_cautions
    ),
    'sessions', v_sessions
  );
end;
$function$;

create or replace function midas_private.activity_protein_days_core(
  p_owner uuid, p_from date, p_to date
)
returns jsonb
language plpgsql stable security invoker set search_path = ''
as $function$
declare
  v_today date := pg_catalog.timezone('Europe/Vienna', pg_catalog.statement_timestamp())::date;
  v_from_at timestamptz;
  v_until_at timestamptz;
  v_days jsonb;
  v_count integer;
begin
  if p_owner is null then
    raise exception 'MIDAS_ACTIVITY_PROTEIN_AUTH_REQUIRED' using errcode='42501';
  end if;
  if p_from is null or p_to is null or p_to-p_from <> 27 or p_to > v_today then
    raise exception 'MIDAS_ACTIVITY_PROTEIN_INVALID_RANGE' using errcode='22023';
  end if;
  v_from_at := pg_catalog.timezone('Europe/Vienna',p_from::timestamp without time zone);
  v_until_at := pg_catalog.timezone('Europe/Vienna',(p_to+1)::timestamp without time zone);
  if (select pg_catalog.count(*) from public.health_activity_sessions s
       where s.user_id=p_owner and s.day between p_from and p_to
         and s.started_at>=v_from_at and s.started_at<v_until_at) > 1000 then
    raise exception 'MIDAS_ACTIVITY_PROTEIN_LIMIT_EXCEEDED' using errcode='54000';
  end if;
  with days as (
    select v.day from public.v_events_activity v
      where v.user_id=p_owner and v.day between p_from and p_to
        and v.ts>=v_from_at and v.ts<v_until_at
    union
    select s.day from public.health_activity_sessions s
      where s.user_id=p_owner and s.protein_target_relevant
        and s.day between p_from and p_to
        and s.started_at>=v_from_at and s.started_at<v_until_at
  )
  select coalesce(pg_catalog.jsonb_agg(d.day order by d.day),'[]'::jsonb),
         pg_catalog.count(*)::integer
    into v_days,v_count from days d;
  return pg_catalog.jsonb_build_object(
    'schema_version','midas.activity-protein-days.v1',
    'timezone','Europe/Vienna',
    'range',pg_catalog.jsonb_build_object('from',p_from,'to',p_to,'inclusive_days',28),
    'active_days',v_days,'active_day_count',v_count
  );
end;
$function$;

create or replace function public.activity_protein_days(p_from date,p_to date)
returns jsonb
language plpgsql stable security invoker set search_path = ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null or coalesce(auth.jwt()->>'is_anonymous','') <> 'false' then
    raise exception 'MIDAS_ACTIVITY_PROTEIN_AUTH_REQUIRED' using errcode='42501';
  end if;
  return midas_private.activity_protein_days_core(v_user,p_from,p_to);
end;
$function$;

create or replace function public.activity_protein_days_for_owner(
  p_owner uuid,p_from date,p_to date
)
returns jsonb
language plpgsql stable security invoker set search_path = ''
as $function$
begin
  if p_owner is null then
    raise exception 'MIDAS_ACTIVITY_PROTEIN_AUTH_REQUIRED' using errcode='42501';
  end if;
  return midas_private.activity_protein_days_core(p_owner,p_from,p_to);
end;
$function$;

alter function midas_private.activity_protein_days_core(uuid,date,date) owner to postgres;
alter function public.activity_protein_days(date,date) owner to postgres;
alter function public.activity_protein_days_for_owner(uuid,date,date) owner to postgres;
revoke all on function midas_private.activity_protein_days_core(uuid,date,date)
  from public,anon,authenticated,service_role;
grant execute on function midas_private.activity_protein_days_core(uuid,date,date)
  to authenticated,service_role;
revoke all on function public.activity_protein_days(date,date)
  from public,anon,authenticated,service_role;
grant execute on function public.activity_protein_days(date,date) to authenticated;
revoke all on function public.activity_protein_days_for_owner(uuid,date,date)
  from public,anon,authenticated,service_role;
grant execute on function public.activity_protein_days_for_owner(uuid,date,date) to service_role;

do $post$
begin
  if (select sessions_hash from midas_c4_preimage) <>
      (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s)-'protein_target_relevant' order by s.id),'[]'::jsonb)::text,'UTF8')),'hex')
       from public.health_activity_sessions s)
     or (select items_hash from midas_c4_preimage) <>
      (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id),'[]'::jsonb)::text,'UTF8')),'hex')
       from public.health_activity_session_items i)
     or (select sets_hash from midas_c4_preimage) <>
      (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id),'[]'::jsonb)::text,'UTF8')),'hex')
       from public.health_activity_item_sets st)
     or (select events_hash from midas_c4_preimage) <>
      (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id),'[]'::jsonb)::text,'UTF8')),'hex')
       from public.health_events e)
     or exists(select 1 from public.health_activity_sessions where protein_target_relevant is null) then
    raise exception 'ACT_C4_SQL27_DATA_POSTCHECK_FAILED';
  end if;
end;
$post$;
commit;
