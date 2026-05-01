import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, prefer",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DEFAULT_USER_ID = Deno.env.get("PROTEIN_TARGETS_USER_ID") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("[midas-protein-targets] Supabase env missing");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type TriggerKind = "body_save" | "manual" | "scheduler";

type ProteinTargetInput = {
  trigger?: TriggerKind | null;
  weight_kg?: number | null;
  dayIso?: string | null;
  force?: boolean | null;
};

type NormalizedInput = {
  trigger: TriggerKind;
  weight_kg: number;
  dayIso: string | null;
  force: boolean;
};

type ProfileRow = {
  user_id: string;
  birth_date: string | null;
  protein_doctor_lock: boolean | null;
  protein_doctor_factor: number | null;
  protein_doctor_min: number | null;
  protein_doctor_max: number | null;
  protein_last_calc_at: string | null;
  protein_target_min: number | null;
  protein_target_max: number | null;
  protein_ckd_stage_g?: string | null;
  protein_factor_current?: number | null;
};

type LabEventRow = {
  payload: Record<string, unknown> | null;
  day: string | null;
  ts: string | null;
};

type BodyEventRow = {
  payload: Record<string, unknown> | string | null;
  day: string | null;
  ts: string | null;
};

const responseJson = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const responseOk = () => new Response("ok", { headers: corsHeaders });

const getBearerToken = (req: Request) => {
  const h = req.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return h || null;
};

const requireUser = async (token: string | null) => {
  if (!token) throw new Error("Authorization Header fehlt.");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("Nutzer konnte nicht authentifiziert werden.");
  }
  return data.user;
};

const getUserIdFromToken = async (token: string | null) => {
  if (!token) throw new Error("Authorization Header fehlt.");
  if (token === SERVICE_ROLE_KEY) {
    if (!DEFAULT_USER_ID) {
      throw new Error("PROTEIN_TARGETS_USER_ID fehlt in der Env.");
    }
    return DEFAULT_USER_ID;
  }
  const user = await requireUser(token);
  return user.id;
};

const ISO_DAY_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const normalizeInput = (raw: ProteinTargetInput): NormalizedInput => {
  const trigger =
    raw.trigger === "manual" ||
    raw.trigger === "body_save" ||
    raw.trigger === "scheduler"
      ? raw.trigger
      : "body_save";

  const weightRaw =
    typeof raw.weight_kg === "number"
      ? raw.weight_kg
      : typeof raw.weight_kg === "string"
        ? Number(raw.weight_kg)
        : NaN;
  const weight = weightRaw;
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error("weight_kg fehlt oder ist ungueltig.");
  }

  const dayIso =
    typeof raw.dayIso === "string" && raw.dayIso.trim()
      ? raw.dayIso.trim()
      : null;
  if (dayIso && !ISO_DAY_RE.test(dayIso)) {
    throw new Error("dayIso ist ungueltig (YYYY-MM-DD erwartet).");
  }

  return {
    trigger,
    weight_kg: weight,
    dayIso,
    force: Boolean(raw.force),
  };
};

const serializeError = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    try {
      const s = JSON.stringify(err);
      if (s && s !== "{}") return s;
    } catch {
      /* ignore */
    }
  }
  return String(err);
};

const parsePayloadObject = (value: unknown) => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
};

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

const viennaTodayIso = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = pick("year");
  const month = pick("month");
  const day = pick("day");
  if (!year || !month || !day) return toISODate(now);
  return `${year}-${month}-${day}`;
};

const subDaysIso = (isoDay: string, days: number) => {
  const dt = new Date(`${isoDay}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() - days);
  return toISODate(dt);
};

const roundTo = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const parseCkdStage = (value: string) => {
  const raw = value.trim();
  if (!raw) return null;
  const match = raw.match(/^G(1|2|3a|3b|4|5)/i);
  if (!match) return null;
  return `G${match[1]}` as const;
};

const ckdFactorFor = (stage: string) => {
  switch (stage) {
    case "G1":
      return 1.0;
    case "G2":
      return 0.95;
    case "G3a":
      return 0.9;
    case "G3b":
      return 0.85;
    case "G4":
      return 0.75;
    case "G5":
      return 0.65;
    default:
      return 1.0;
  }
};

const ageBaseFor = (age: number) => {
  if (!Number.isFinite(age) || age <= 0) return 0.8;
  if (age < 20) return 0.8;
  if (age <= 39) return 0.9;
  if (age <= 59) return 1.0;
  if (age <= 69) return 1.1;
  if (age <= 79) return 1.2;
  if (age <= 99) return 1.3;
  return 1.3;
};

const activityLevelFor = (score: number) => {
  if (score >= 6) return { level: "ACT3", modifier: 0.3 };
  if (score >= 2) return { level: "ACT2", modifier: 0.2 };
  return { level: "ACT1", modifier: 0.1 };
};

const calcAgeYears = (birthDateIso: string, refDateIso: string) => {
  const birth = new Date(`${birthDateIso}T00:00:00Z`);
  const ref = new Date(`${refDateIso}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime())) return null;
  let age = ref.getUTCFullYear() - birth.getUTCFullYear();
  const m = ref.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && ref.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return responseOk();
  if (req.method !== "POST") {
    return responseJson({ error: "Method not allowed, use POST" }, 405);
  }

  try {
    const token = getBearerToken(req);
    const userId = await getUserIdFromToken(token);
    const raw = (await req.json().catch(() => ({}))) as ProteinTargetInput;
    if (raw.weight_kg == null) {
      const { data: bodyRows, error: bodyErr } = await supabase
        .from("health_events")
        .select("payload, day, ts")
        .eq("user_id", userId)
        .eq("type", "body")
        .order("ts", { ascending: false })
        .limit(1);
      if (bodyErr) throw bodyErr;
      const latestBody = (bodyRows?.[0] ?? null) as BodyEventRow | null;
      const payload = parsePayloadObject(latestBody?.payload);
      const weight =
        payload && typeof payload.kg === "number"
          ? payload.kg
          : payload && typeof payload.weight_kg === "number"
            ? payload.weight_kg
            : null;
      if (weight != null) {
        raw.weight_kg = weight;
      }
      if (!raw.dayIso && latestBody?.day) {
        raw.dayIso = latestBody.day;
      }
    }
    const input = normalizeInput(raw);

    const { data: profile, error: profileErr } = await supabase
      .from("user_profile")
      .select(
        [
          "user_id",
          "birth_date",
          "protein_doctor_lock",
          "protein_doctor_factor",
          "protein_doctor_min",
          "protein_doctor_max",
          "protein_last_calc_at",
          "protein_target_min",
          "protein_target_max",
          "protein_ckd_stage_g",
          "protein_factor_current",
        ].join(","),
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (profileErr) throw profileErr;

    const todayIso = input.dayIso || viennaTodayIso();
    const fromIso = subDaysIso(todayIso, 27);

    const { count: activityCount, error: activityErr } = await supabase
      .from("health_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "activity_event")
      .gte("day", fromIso)
      .lte("day", todayIso);
    if (activityErr) throw activityErr;

    const { data: labRows, error: labErr } = await supabase
      .from("health_events")
      .select("payload, day, ts")
      .eq("user_id", userId)
      .eq("type", "lab_event")
      .order("ts", { ascending: false })
      .limit(1);
    if (labErr) throw labErr;
    const latestLab = (labRows?.[0] ?? null) as LabEventRow | null;
    const ckdStageRaw =
      latestLab?.payload &&
      typeof latestLab.payload === "object" &&
      "ckd_stage" in latestLab.payload
        ? String((latestLab.payload as Record<string, unknown>).ckd_stage || "")
        : "";
    const ckdStage = parseCkdStage(ckdStageRaw) || "G1";
    const ckdFactor = ckdFactorFor(ckdStage);

    const profileRow = profile as ProfileRow | null;
    if (!profileRow) {
      throw new Error("Profil fehlt (user_profile).");
    }

    const doctorLock = !!profileRow.protein_doctor_lock;
    const doctorFactorRaw =
      typeof profileRow.protein_doctor_factor === "number"
        ? profileRow.protein_doctor_factor
        : null;
    const doctorFactorValid =
      doctorFactorRaw != null &&
      Number.isFinite(doctorFactorRaw) &&
      doctorFactorRaw > 0;
    if (doctorLock && !doctorFactorValid) {
      return responseJson({
        ok: true,
        skipped: true,
        reason: "doctor_factor_missing",
        user_id: userId,
      });
    }
    const doctorFactor = doctorLock && doctorFactorValid
      ? roundTo(doctorFactorRaw as number, 2)
      : null;

    if (!profileRow.birth_date) {
      throw new Error("birth_date fehlt im Profil.");
    }

    const ageYears = calcAgeYears(profileRow.birth_date, todayIso);
    if (ageYears === null) {
      throw new Error("birth_date ungueltig.");
    }
    const ageBase = ageBaseFor(ageYears);
    const activityScore = Number(activityCount ?? 0);
    const activityMeta = activityLevelFor(activityScore);
    const factorPreCkd = roundTo(ageBase + activityMeta.modifier, 2);
    const factorAuto = roundTo(factorPreCkd * ckdFactor, 2);
    const factorCurrent = doctorLock ? (doctorFactor as number) : factorAuto;
    const calcSource = doctorLock ? "doctor" : "auto";
    const maxFactor = factorCurrent;
    const minFactor = roundTo(factorCurrent - 0.1, 2);
    const targetMax = Math.round(input.weight_kg * maxFactor);
    const targetMin = Math.round(input.weight_kg * minFactor);

    if (!input.force && profileRow.protein_last_calc_at) {
      const last = new Date(profileRow.protein_last_calc_at);
      if (!Number.isNaN(last.getTime())) {
        const daysSince =
          (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
          const prevStage = profileRow.protein_ckd_stage_g || null;
          const stageUnchanged = prevStage === ckdStage;
          const prevFactor =
            typeof profileRow.protein_factor_current === "number" &&
            profileRow.protein_factor_current > 0
              ? profileRow.protein_factor_current
              : null;
          const prevMax =
            typeof profileRow.protein_target_max === "number"
              ? profileRow.protein_target_max
              : null;
          const prevWeight =
            prevFactor && prevMax ? prevMax / prevFactor : null;
          const weightDelta =
            prevWeight !== null ? Math.abs(input.weight_kg - prevWeight) : null;
          const factorDelta =
            prevFactor !== null ? Math.abs(prevFactor - factorCurrent) : null;
          const factorUnchanged =
            factorDelta !== null ? factorDelta < 0.01 : false;
          const shouldSkip =
            weightDelta !== null &&
            weightDelta < 1 &&
            factorUnchanged &&
            (doctorLock || stageUnchanged);

          if (shouldSkip) {
      return responseJson({
        ok: true,
        skipped: true,
        reason: "cooldown_unchanged",
        user_id: userId,
        days_since_last: Number(daysSince.toFixed(2)),
        weight_delta: Number(weightDelta.toFixed(2)),
        calc_source: calcSource,
      });
          }
        }
      }
    }

    const updatePayload: Record<string, unknown> = {
      protein_target_min: targetMin,
      protein_target_max: targetMax,
      protein_calc_version: `v1.2-${calcSource}`,
      protein_window_days: 28,
      protein_last_calc_at: new Date().toISOString(),
      protein_age_base: ageBase,
      protein_activity_level: activityMeta.level,
      protein_activity_score_28d: activityScore,
      protein_factor_pre_ckd: factorPreCkd,
      protein_ckd_stage_g: ckdStage,
      protein_ckd_factor: ckdFactor,
      protein_factor_current: factorCurrent,
    };
    if (doctorLock) {
      updatePayload.protein_doctor_factor = factorCurrent;
      updatePayload.protein_doctor_min = targetMin;
      updatePayload.protein_doctor_max = targetMax;
    }

    const { error: updateErr } = await supabase
      .from("user_profile")
      .update(updatePayload)
      .eq("user_id", userId);
    if (updateErr) throw updateErr;

    return responseJson({
      ok: true,
      skipped: false,
      reason: null,
      user_id: userId,
      input,
      computed: {
        age: ageYears,
        age_base: ageBase,
        activity_level: activityMeta.level,
        activity_score_28d: activityScore,
        window_days: 28,
        weight_kg: input.weight_kg,
        ckd_stage_g: ckdStage,
        ckd_factor: ckdFactor,
        factor_pre_ckd: factorPreCkd,
        factor_auto: factorAuto,
        factor_current: factorCurrent,
        target_min: targetMin,
        target_max: targetMax,
        calc_source: calcSource,
        version: `v1.2-${calcSource}`,
      },
    });
  } catch (err) {
    const message = serializeError(err);
    console.error("[midas-protein-targets] error:", message);
    return responseJson({ error: message }, 400);
  }
});
