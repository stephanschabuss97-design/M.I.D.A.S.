-- ============================================================================
-- 10_User_Profile_Ext.sql  (Phase 4.3 – Health Profile Layer)
-- Ergänzt public.user_profile um die Felder, die für den Butler/Foto-Kontext
-- benötigt werden. Idempotent ausgeführt (ALTER TABLE ... IF NOT EXISTS).
-- ============================================================================

-- Basis-Tabelle muss bereits aus 01_Health Schema.sql existieren.

alter table public.user_profile
  add column if not exists full_name text,
  add column if not exists birth_date date,
  add column if not exists medications jsonb default '[]'::jsonb,
  add column if not exists is_smoker boolean,
  add column if not exists lifestyle_note text,
  add column if not exists salt_limit_g numeric,
  add column if not exists protein_target_min numeric,
  add column if not exists protein_target_max numeric,
  add column if not exists protein_doctor_lock boolean default false,
  add column if not exists protein_doctor_min numeric,
  add column if not exists protein_doctor_max numeric,
  add column if not exists protein_calc_version text,
  add column if not exists protein_window_days int,
  add column if not exists protein_last_calc_at timestamptz,
  add column if not exists protein_age_base numeric,
  add column if not exists protein_activity_level text,
  add column if not exists protein_activity_score_28d numeric,
  add column if not exists protein_factor_pre_ckd numeric,
  add column if not exists protein_ckd_stage_g text,
  add column if not exists protein_ckd_factor numeric,
  add column if not exists protein_factor_current numeric,
  add column if not exists primary_doctor_name text,
  add column if not exists primary_doctor_email text,
  add column if not exists updated_at timestamptz default now();

alter table public.user_profile
  drop column if exists ckd_stage;

-- height_cm existiert bereits, aber falls ältere Setups es entfernt haben,
-- stellen wir sicher, dass das Feld wieder verfügbar ist.
alter table public.user_profile
  add column if not exists height_cm integer
    check (height_cm is null or height_cm between 120 and 230);

-- Defaults fuer bestehende Datensaetze (idempotent)
update public.user_profile
   set protein_doctor_lock = false
 where protein_doctor_lock is null;

-- Optionaler Trigger, um updated_at bei Änderungen zu setzen.
create or replace function public.set_user_profile_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'set_user_profile_updated_at') then
    execute 'drop trigger set_user_profile_updated_at on public.user_profile';
  end if;
end$$;

create trigger set_user_profile_updated_at
  before update on public.user_profile
  for each row execute function public.set_user_profile_updated_at();

-- Realtime Publication um das Profil ergänzen (bleibt idempotent).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime add table public.user_profile';
    exception
      when others then null;
    end;
  end if;
end$$;
