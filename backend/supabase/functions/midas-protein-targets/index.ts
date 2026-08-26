import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  type ActivityEdgePrincipal,
  ActivityEdgePrincipalError,
  activityEdgePrincipalLog,
  createActivityEdgePrincipal,
} from "../_shared/activity-edge-principal.ts";
import {
  ActivityConsumerRuntimeError,
  createActivityConsumerRuntime,
} from "../_shared/activity-consumer-runtime.ts";
import { createActivityMedicalContext } from "../_shared/activity-medical-context.ts";
import { deriveProteinActivityCompatibility } from "./activity-compatibility.ts";

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

type TriggerKind = "body_save" | "manual" | "scheduler";

type ProteinTargetInput = {
  trigger?: TriggerKind | null;
  weight_kg?: number | string | null;
  dayIso?: string | null;
  force?: boolean | null;
  dry_run?: boolean | null;
};

type NormalizedInput = {
  trigger: TriggerKind;
  weight_kg: number;
  dayIso: string | null;
  force: boolean;
  dryRun: boolean;
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
  protein_calc_version?: string | null;
  protein_window_days?: number | null;
  protein_age_base?: number | null;
  protein_activity_level?: string | null;
  protein_activity_score_28d?: number | null;
  protein_factor_pre_ckd?: number | null;
  protein_ckd_factor?: number | null;
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

const REQUEST_KEYS = Object.freeze(
  [
    "trigger",
    "weight_kg",
    "dayIso",
    "force",
    "dry_run",
  ] as const,
);

class ProteinRequestError extends Error {
  code = "INVALID_REQUEST" as const;
  status = 400 as const;
  publicMessage = "Invalid request" as const;

  constructor() {
    super("The protein target request is invalid.");
    this.name = "ProteinRequestError";
  }
}

const readRequestInput = async (req: Request): Promise<ProteinTargetInput> => {
  let value: unknown;
  try {
    value = await req.json();
  } catch {
    throw new ProteinRequestError();
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ProteinRequestError();
  }
  const prototype = Object.getPrototypeOf(value);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(value);
  if (
    prototype === null ||
    Object.getPrototypeOf(prototype) !== null ||
    keys.some((key) =>
      typeof key !== "string" ||
      !REQUEST_KEYS.includes(key as (typeof REQUEST_KEYS)[number]) ||
      !descriptors[key]?.enumerable ||
      !Object.prototype.hasOwnProperty.call(descriptors[key], "value")
    )
  ) {
    throw new ProteinRequestError();
  }
  return Object.fromEntries(
    keys.map((key) => [key, descriptors[key as string].value]),
  ) as ProteinTargetInput;
};

const ISO_DAY_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const isValidIsoDay = (isoDay: string) => {
  const match = ISO_DAY_RE.exec(isoDay);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(year);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
};

const normalizeInput = (raw: ProteinTargetInput): NormalizedInput => {
  if (
    raw.trigger != null &&
    raw.trigger !== "manual" &&
    raw.trigger !== "body_save" &&
    raw.trigger !== "scheduler"
  ) {
    throw new ProteinRequestError();
  }
  if (raw.force != null && typeof raw.force !== "boolean") {
    throw new ProteinRequestError();
  }
  if (raw.dry_run != null && typeof raw.dry_run !== "boolean") {
    throw new ProteinRequestError();
  }
  const trigger = raw.trigger ?? "body_save";

  const weightRaw = typeof raw.weight_kg === "number"
    ? raw.weight_kg
    : typeof raw.weight_kg === "string"
    ? Number(raw.weight_kg)
    : NaN;
  const weight = weightRaw;
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new ProteinRequestError();
  }

  const dayIso = typeof raw.dayIso === "string" && raw.dayIso.trim()
    ? raw.dayIso.trim()
    : null;
  if (dayIso && !isValidIsoDay(dayIso)) {
    throw new ProteinRequestError();
  }

  return {
    trigger,
    weight_kg: weight,
    dayIso,
    force: Boolean(raw.force),
    dryRun: raw.dry_run === true,
  };
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

const viennaTodayIso = (now: Date) => {
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

const calcAgeYears = (birthDateIso: string, refDateIso: string) => {
  const birth = new Date(`${birthDateIso}T00:00:00Z`);
  const ref = new Date(`${refDateIso}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime())) return null;
  let age = ref.getUTCFullYear() - birth.getUTCFullYear();
  const m = ref.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && ref.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
};

type ProteinHandlerDependencies = {
  createPrincipal?: typeof createActivityEdgePrincipal;
  activityRuntime?: ReturnType<typeof createActivityConsumerRuntime>;
  now?: () => Date;
};

export const createProteinTargetsHandler = (
  dependencies: ProteinHandlerDependencies = {},
) => {
  const createPrincipal = dependencies.createPrincipal ??
    createActivityEdgePrincipal;
  const activityRuntime = dependencies.activityRuntime ??
    createActivityConsumerRuntime();
  const readNow = dependencies.now ?? (() => new Date());

  return async (req: Request) => {
    if (req.method === "OPTIONS") return responseOk();
    if (req.method !== "POST") {
      return responseJson({ error: "Method not allowed, use POST" }, 405);
    }

    let principal: ActivityEdgePrincipal | null = null;
    try {
      principal = await createPrincipal(req, "protein");
      const userId = principal.owner_id;
      const dataClient = principal.rpc_client as unknown as SupabaseClient;
      const raw = await readRequestInput(req);
      if (raw.weight_kg == null) {
        const { data: bodyRows, error: bodyErr } = await dataClient
          .from("health_events")
          .select("payload, day, ts")
          .eq("user_id", userId)
          .eq("type", "body")
          .order("ts", { ascending: false })
          .limit(1);
        if (bodyErr) throw bodyErr;
        const latestBody = (bodyRows?.[0] ?? null) as BodyEventRow | null;
        const payload = parsePayloadObject(latestBody?.payload);
        const weight = payload && typeof payload.kg === "number"
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

      const requestNow = readNow();
      const todayIso = input.dayIso || viennaTodayIso(requestNow);
      const fromIso = subDaysIso(todayIso, 27);
      const activitySnapshot = await activityRuntime.loadSnapshot(
        principal,
        { from: fromIso, to: todayIso },
      );
      const activityContext = createActivityMedicalContext(
        activitySnapshot,
        { from: fromIso, to: todayIso },
      );
      const activityMeta = deriveProteinActivityCompatibility(activityContext);

      const { data: profile, error: profileErr } = await dataClient
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
            "protein_calc_version",
            "protein_window_days",
            "protein_age_base",
            "protein_activity_level",
            "protein_activity_score_28d",
            "protein_factor_pre_ckd",
            "protein_ckd_factor",
            "protein_factor_current",
          ].join(","),
        )
        .eq("user_id", userId)
        .maybeSingle();
      if (profileErr) throw profileErr;
      const profileRow = profile as ProfileRow | null;
      if (!profileRow) {
        throw new Error("Profil fehlt (user_profile).");
      }

      const { data: labRows, error: labErr } = await dataClient
        .from("health_events")
        .select("payload, day, ts")
        .eq("user_id", userId)
        .eq("type", "lab_event")
        .order("ts", { ascending: false })
        .limit(1);
      if (labErr) throw labErr;
      const latestLab = (labRows?.[0] ?? null) as LabEventRow | null;
      const ckdStageRaw = latestLab?.payload &&
          typeof latestLab.payload === "object" &&
          "ckd_stage" in latestLab.payload
        ? String((latestLab.payload as Record<string, unknown>).ckd_stage || "")
        : "";
      const ckdStageLab = parseCkdStage(ckdStageRaw);
      const ckdStageProfile = parseCkdStage(
        profileRow.protein_ckd_stage_g || "",
      );
      const ckdStage = ckdStageLab || ckdStageProfile;
      const ckdSource = ckdStageLab
        ? "lab"
        : ckdStageProfile
        ? "profile"
        : "missing";
      const ckdFactor = ckdStage ? ckdFactorFor(ckdStage) : null;

      const doctorLock = !!profileRow.protein_doctor_lock;
      const doctorFactorRaw =
        typeof profileRow.protein_doctor_factor === "number"
          ? profileRow.protein_doctor_factor
          : null;
      const doctorFactorValid = doctorFactorRaw != null &&
        Number.isFinite(doctorFactorRaw) &&
        doctorFactorRaw > 0;
      if (doctorLock && !doctorFactorValid) {
        return responseJson({
          ok: true,
          skipped: true,
          reason: "doctor_factor_missing",
          dry_run: input.dryRun,
          ckd_source: ckdSource,
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
      if (!doctorLock && !ckdStage) {
        return responseJson({
          ok: true,
          skipped: true,
          reason: "ckd_stage_missing",
          dry_run: input.dryRun,
          input,
          ckd_source: ckdSource,
        });
      }
      const ageBase = ageBaseFor(ageYears);
      const activityScore = activityMeta.active_days_28d;
      const factorPreCkd = roundTo(ageBase + activityMeta.activity_modifier, 2);
      const factorAuto = ckdFactor !== null
        ? roundTo(factorPreCkd * ckdFactor, 2)
        : null;
      const factorCurrent = doctorLock ? doctorFactor : factorAuto;
      if (factorCurrent === null) {
        throw new Error("Protein-Faktor konnte nicht berechnet werden.");
      }
      const calcSource = doctorLock ? "doctor" : "auto";
      const maxFactor = factorCurrent;
      const minFactor = roundTo(factorCurrent - 0.1, 2);
      const targetMax = Math.round(input.weight_kg * maxFactor);
      const targetMin = Math.round(input.weight_kg * minFactor);

      const calcVersion = `v1.3-${calcSource}`;
      const now = requestNow;
      if (!input.force && profileRow.protein_last_calc_at) {
        const last = new Date(profileRow.protein_last_calc_at);
        if (!Number.isNaN(last.getTime())) {
          const daysSince = (now.getTime() - last.getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysSince < 7) {
            const prevStage = profileRow.protein_ckd_stage_g || null;
            const stageUnchanged = ckdStage !== null && prevStage === ckdStage;
            const prevFactor =
              typeof profileRow.protein_factor_current === "number" &&
                profileRow.protein_factor_current > 0
                ? profileRow.protein_factor_current
                : null;
            const prevMax = typeof profileRow.protein_target_max === "number"
              ? profileRow.protein_target_max
              : null;
            const prevWeight = prevFactor && prevMax
              ? prevMax / prevFactor
              : null;
            const weightDelta = prevWeight !== null
              ? Math.abs(input.weight_kg - prevWeight)
              : null;
            const factorDelta = prevFactor !== null
              ? Math.abs(prevFactor - factorCurrent)
              : null;
            const factorUnchanged = factorDelta !== null
              ? factorDelta < 0.01
              : false;
            const derivationUnchanged =
              profileRow.protein_calc_version === calcVersion &&
              profileRow.protein_window_days === 28 &&
              profileRow.protein_activity_score_28d === activityScore &&
              profileRow.protein_activity_level ===
                activityMeta.activity_level &&
              profileRow.protein_age_base === ageBase &&
              profileRow.protein_factor_pre_ckd === factorPreCkd &&
              profileRow.protein_factor_current === factorCurrent &&
              profileRow.protein_target_min === targetMin &&
              profileRow.protein_target_max === targetMax &&
              (!doctorLock ||
                (profileRow.protein_doctor_factor === factorCurrent &&
                  profileRow.protein_doctor_min === targetMin &&
                  profileRow.protein_doctor_max === targetMax)) &&
              (doctorLock || profileRow.protein_ckd_factor === ckdFactor);
            const shouldSkip = weightDelta !== null &&
              weightDelta < 1 &&
              factorUnchanged &&
              (doctorLock || stageUnchanged) &&
              derivationUnchanged;

            if (shouldSkip) {
              return responseJson({
                ok: true,
                skipped: true,
                reason: "cooldown_unchanged",
                dry_run: input.dryRun,
                days_since_last: Number(daysSince.toFixed(2)),
                weight_delta: Number(weightDelta.toFixed(2)),
                calc_source: calcSource,
                ckd_source: ckdSource,
              });
            }
          }
        }
      }

      const updatePayload: Record<string, unknown> = {
        protein_target_min: targetMin,
        protein_target_max: targetMax,
        protein_calc_version: calcVersion,
        protein_window_days: 28,
        protein_last_calc_at: now.toISOString(),
        protein_age_base: ageBase,
        protein_activity_level: activityMeta.activity_level,
        protein_activity_score_28d: activityScore,
        protein_factor_pre_ckd: factorPreCkd,
        protein_factor_current: factorCurrent,
      };
      if (ckdStage && ckdFactor !== null) {
        updatePayload.protein_ckd_stage_g = ckdStage;
        updatePayload.protein_ckd_factor = ckdFactor;
      }
      if (doctorLock) {
        updatePayload.protein_doctor_factor = factorCurrent;
        updatePayload.protein_doctor_min = targetMin;
        updatePayload.protein_doctor_max = targetMax;
      }

      if (!input.dryRun) {
        const { error: updateErr } = await dataClient
          .from("user_profile")
          .update(updatePayload)
          .eq("user_id", userId);
        if (updateErr) throw updateErr;
      }

      return responseJson({
        ok: true,
        skipped: false,
        reason: null,
        dry_run: input.dryRun,
        input,
        computed: {
          age: ageYears,
          age_base: ageBase,
          activity_level: activityMeta.activity_level,
          activity_score_28d: activityScore,
          window_days: 28,
          weight_kg: input.weight_kg,
          ckd_stage_g: ckdStage,
          ckd_factor: ckdFactor,
          ckd_source: ckdSource,
          factor_pre_ckd: factorPreCkd,
          factor_auto: factorAuto,
          factor_current: factorCurrent,
          target_min: targetMin,
          target_max: targetMax,
          calc_source: calcSource,
          version: calcVersion,
        },
      });
    } catch (err) {
      const mode = principal?.mode ?? null;
      if (err instanceof ActivityEdgePrincipalError) {
        console.error(
          "[midas-protein-targets]",
          activityEdgePrincipalLog("proteinTargets", err),
        );
        return responseJson({ error: err.publicMessage }, err.status);
      }
      if (err instanceof ActivityConsumerRuntimeError) {
        console.error("[midas-protein-targets]", {
          operation: "proteinTargets",
          code: err.code,
          status: err.status,
          mode,
        });
        return responseJson({ error: err.publicMessage }, err.status);
      }
      const requestError = err instanceof ProteinRequestError;
      const status = requestError ? err.status : 500;
      const code = requestError ? err.code : "INTERNAL_ERROR";
      console.error("[midas-protein-targets]", {
        operation: "proteinTargets",
        code,
        status,
        mode,
      });
      return responseJson(
        { error: requestError ? err.publicMessage : "Internal server error" },
        status,
      );
    }
  };
};

if (import.meta.main) {
  Deno.serve(createProteinTargetsHandler());
}
