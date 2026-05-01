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
const DEFAULT_USER_ID = Deno.env.get("TRENDPILOT_USER_ID") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("[midas-trendpilot] Supabase env missing");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TREND_TZ = "Europe/Vienna";
const DEFAULT_RANGE_DAYS = 56;
const MIN_WEEKS_REQUIRED = 6;
const BASELINE_WEEKS = 8;
const NORMALIZE_WEEKS = 6;
const WARNING_DELTA_SYS = 8;
const WARNING_DELTA_DIA = 5;
const CRITICAL_ABS_SYS = 140;
const CRITICAL_ABS_DIA = 90;
const CRITICAL_DELTA_SYS = 15;
const CRITICAL_DELTA_DIA = 10;
const BODY_WARNING_DELTA_KG = 1.2;
const BODY_CRITICAL_DELTA_KG = 2.0;
const COMBINED_MIN_DELTA_KG = 1.5;
const COMBINED_CRITICAL_DELTA_KG = 2.0;
const LAB_MIN_WEEKS = 2;
const LAB_BASELINE_WEEKS = 3;
const LAB_MIN_SAMPLES = 2;
const LAB_WARNING_EGFR_DROP = 8;
const LAB_WARNING_CREAT_RISE = 0.3;
const LAB_CRITICAL_EGFR_DROP = 15;
const LAB_CRITICAL_CREAT_RISE = 0.5;
const LAB_CRITICAL_EGFR_ABS = 45;
const LAB_CRITICAL_CREAT_ABS = 1.8;
const CONTEXT_WEEKS = 4;
const CONTEXT_ACTIVITY_MIN_WEEKS = 2;
const CONTEXT_ACTIVITY_MIN_SESSIONS = 4;
const CONTEXT_ACTIVITY_HIGH_SESSIONS = 8;
const CONTEXT_ACTIVITY_LOW_SESSIONS = 3;
const CONTEXT_BODYCOMP_MIN_SAMPLES = 2;
const CONTEXT_BODYCOMP_MIN_DAYS = 14;
const CONTEXT_WEIGHT_DELTA_KG = 0.5;
const CONTEXT_WAIST_DELTA_CM = 1.0;
const CONTEXT_BODYCOMP_DELTA_PCT = 0.5;
const CONTEXT_LAB_MIN_SAMPLES = 2;

type TrendpilotInput = {
  user_id?: string | null;
  trigger?: "scheduler" | "manual" | null;
  dry_run?: boolean | null;
  range?: {
    from?: string | null;
    to?: string | null;
  } | null;
};

type NormalizedInput = {
  userId: string;
  trigger: "scheduler" | "manual";
  dryRun: boolean;
  range: {
    from: string;
    to: string;
  };
};

type TrendpilotEvent = {
  type: "bp" | "body" | "lab" | "combined";
  severity: "info" | "warning" | "critical";
  window_from: string;
  window_to: string;
  source?: string | null;
  payload?: Record<string, unknown>;
};

type TrendpilotEventWithId = TrendpilotEvent & {
  id?: string | null;
};

type TrendpilotRow = {
  user_id: string;
  type: TrendpilotEvent["type"];
  severity: TrendpilotEvent["severity"];
  window_from: string;
  window_to: string;
  source?: string | null;
  payload: Record<string, unknown>;
  ack?: boolean;
  ack_at?: string | null;
};

type TrendpilotState = {
  user_id: string;
  type: "bp" | "body" | "lab";
  baseline_from: string;
  baseline_sys: number | null;
  baseline_dia: number | null;
  sample_weeks: number;
  updated_at?: string | null;
};

const responseJson = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const responseOk = () => new Response("ok", { headers: corsHeaders });

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
      throw new Error("TRENDPILOT_USER_ID fehlt in der Env.");
    }
    return { userId: DEFAULT_USER_ID, isServiceRole: true };
  }
  const user = await requireUser(token);
  return { userId: user.id, isServiceRole: false };
};

const ISO_DAY_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const toISODateUTC = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const viennaTodayIso = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TREND_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = pick("year");
  const month = pick("month");
  const day = pick("day");
  if (!year || !month || !day) return toISODateUTC(now);
  return `${year}-${month}-${day}`;
};

const subDaysIso = (isoDay: string, days: number) => {
  const dt = new Date(`${isoDay}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() - days);
  return toISODateUTC(dt);
};

const diffDaysInclusive = (from: string, to: string) => {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return diff + 1;
};

const diffDays = (from: string, to: string) => {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
};

const hasMinWeeks = (range: NormalizedInput["range"], weeks: number) => {
  return diffDaysInclusive(range.from, range.to) >= weeks * 7;
};

const parseIsoDay = (isoDay: string) => {
  const parts = isoDay.split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
};

const dateFromIsoDayUtc = (isoDay: string) => {
  const parts = parseIsoDay(isoDay);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
};

const addDaysUtc = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );

const weekWindowForDay = (isoDay: string) => {
  const dt = dateFromIsoDayUtc(isoDay);
  if (!dt) {
    throw new Error(`invalid iso day: ${isoDay}`);
  }
  const day = dt.getUTCDay(); // 0=Sun .. 6=Sat
  const mondayDelta = day === 0 ? -6 : 1 - day;
  const monday = addDaysUtc(dt, mondayDelta);
  const sunday = addDaysUtc(monday, 6);
  return { from: toISODateUTC(monday), to: toISODateUTC(sunday) };
};

const mean = (values: number[]) =>
  values.length
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : null;

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const mergePayload = (
  base: Record<string, unknown> | undefined,
  extra: Record<string, unknown> | undefined,
) => {
  return { ...(base || {}), ...(extra || {}) };
};

const filterRowsByRange = (
  rows: Record<string, unknown>[],
  from: string,
  to: string,
) => {
  return rows.filter((row) => {
    const day = typeof row.day === "string" ? row.day : null;
    if (!day) return false;
    return day >= from && day <= to;
  });
};

type BodySample = {
  day: string;
  kg: number | null;
  cm: number | null;
  fat_pct: number | null;
  muscle_pct: number | null;
};

const parseBodySamples = (rows: Record<string, unknown>[]) => {
  const samples: BodySample[] = [];
  for (const row of rows) {
    const day = typeof row.day === "string" ? row.day : null;
    if (!day) continue;
    const payload = row.payload as Record<string, unknown> | null;
    samples.push({
      day,
      kg: toNumber(payload?.kg),
      cm: toNumber(payload?.cm),
      fat_pct: toNumber(payload?.fat_pct),
      muscle_pct: toNumber(payload?.muscle_pct),
    });
  }
  return samples.sort((a, b) => a.day.localeCompare(b.day));
};

const selectTrendValue = (
  samples: BodySample[],
  getter: (sample: BodySample) => number | null,
  minSamples: number,
  minDays: number,
  threshold: number,
) => {
  const filtered = samples
    .map((sample) => ({ day: sample.day, value: getter(sample) }))
    .filter((sample) => typeof sample.value === "number");
  if (filtered.length < minSamples) return "unknown" as const;
  const first = filtered[0];
  const last = filtered[filtered.length - 1];
  const daysApart = Math.abs(diffDays(first.day, last.day));
  if (daysApart < minDays) return "unknown" as const;
  const delta = (last.value as number) - (first.value as number);
  return delta >= threshold ? ("up" as const) : ("flat" as const);
};

const buildActivityContext = (
  rows: Record<string, unknown>[],
  from: string,
  to: string,
) => {
  const windowRows = filterRowsByRange(rows, from, to);
  const sessions = windowRows.length;
  const weeks = new Set<string>();
  for (const row of windowRows) {
    const day = typeof row.day === "string" ? row.day : null;
    if (!day) continue;
    const win = weekWindowForDay(day);
    weeks.add(win.from);
  }
  const weeksWithEntries = weeks.size;
  const gateOk =
    sessions >= CONTEXT_ACTIVITY_MIN_SESSIONS ||
    weeksWithEntries >= CONTEXT_ACTIVITY_MIN_WEEKS;
  let level: "low" | "ok" | "high" | "unknown" = "unknown";
  if (gateOk) {
    if (sessions >= CONTEXT_ACTIVITY_HIGH_SESSIONS) level = "high";
    else if (sessions <= CONTEXT_ACTIVITY_LOW_SESSIONS) level = "low";
    else level = "ok";
  }
  return {
    level,
    sessions_4w: sessions,
    weeks_with_entries_4w: weeksWithEntries,
  };
};

const buildLabContext = (
  rows: Record<string, unknown>[],
  from: string,
  to: string,
  windowTo: string,
) => {
  const windowRows = filterRowsByRange(rows, from, to)
    .map((row) => {
      const day = typeof row.day === "string" ? row.day : null;
      const payload = row.payload as Record<string, unknown> | null;
      if (!day) return null;
      return {
        day,
        egfr: toNumber(payload?.egfr),
        creatinine: toNumber(payload?.creatinine),
      };
    })
    .filter((row) => row && row.egfr != null && row.creatinine != null) as {
    day: string;
    egfr: number;
    creatinine: number;
  }[];

  if (windowRows.length < CONTEXT_LAB_MIN_SAMPLES) {
    return { egfr_trend: "unknown" as const, days_from_window: null };
  }
  const sorted = [...windowRows].sort((a, b) => a.day.localeCompare(b.day));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const deltaEgfr = last.egfr - first.egfr;
  const deltaCreat = last.creatinine - first.creatinine;
  const egfrTrend =
    deltaEgfr <= -LAB_WARNING_EGFR_DROP || deltaCreat >= LAB_WARNING_CREAT_RISE
      ? "down"
      : "flat";
  const daysFromWindow = sorted.reduce((min, row) => {
    const diff = Math.abs(diffDays(row.day, windowTo));
    return Math.min(min, diff);
  }, Number.POSITIVE_INFINITY);
  return {
    egfr_trend: egfrTrend as "down" | "flat",
    days_from_window: Number.isFinite(daysFromWindow) ? daysFromWindow : null,
  };
};

const buildContextForEvent = (
  entry: TrendpilotEvent,
  bodyRows: Record<string, unknown>[],
  activityRows: Record<string, unknown>[],
  labRows: Record<string, unknown>[],
) => {
  if (entry.severity === "info") return null;
  const windowTo = entry.window_to || entry.window_from;
  if (!windowTo) return null;
  const from = subDaysIso(windowTo, CONTEXT_WEEKS * 7 - 1);
  const to = windowTo;
  const bodySamples = parseBodySamples(filterRowsByRange(bodyRows, from, to));
  const activity = buildActivityContext(activityRows, from, to);
  const weightTrend = selectTrendValue(
    bodySamples,
    (sample) => sample.kg,
    2,
    14,
    CONTEXT_WEIGHT_DELTA_KG,
  );
  const waistTrend = selectTrendValue(
    bodySamples,
    (sample) => sample.cm,
    CONTEXT_BODYCOMP_MIN_SAMPLES,
    CONTEXT_BODYCOMP_MIN_DAYS,
    CONTEXT_WAIST_DELTA_CM,
  );
  const muscleTrend = selectTrendValue(
    bodySamples,
    (sample) => sample.muscle_pct,
    CONTEXT_BODYCOMP_MIN_SAMPLES,
    CONTEXT_BODYCOMP_MIN_DAYS,
    CONTEXT_BODYCOMP_DELTA_PCT,
  );
  const fatTrend = selectTrendValue(
    bodySamples,
    (sample) => sample.fat_pct,
    CONTEXT_BODYCOMP_MIN_SAMPLES,
    CONTEXT_BODYCOMP_MIN_DAYS,
    CONTEXT_BODYCOMP_DELTA_PCT,
  );
  const lab = buildLabContext(labRows, from, to, windowTo);
  return {
    context_window_weeks: CONTEXT_WEEKS,
    context_window_to: windowTo,
    activity,
    bodycomp: {
      muscle_trend: muscleTrend,
      fat_trend: fatTrend,
      samples: bodySamples.filter(
        (s) => s.fat_pct != null || s.muscle_pct != null,
      ).length,
    },
    weight: {
      trend: weightTrend,
      waist_trend: waistTrend,
    },
    lab,
  };
};

const attachContextToEvents = (
  events: TrendpilotEvent[],
  bodyRows: Record<string, unknown>[],
  activityRows: Record<string, unknown>[],
  labRows: Record<string, unknown>[],
) => {
  return events.map((evt) => {
    if (evt.severity === "info") return evt;
    const context = buildContextForEvent(evt, bodyRows, activityRows, labRows);
    if (!context) return evt;
    return {
      ...evt,
      payload: mergePayload(evt.payload, { context }),
    };
  });
};

const normalizeRange = (raw?: TrendpilotInput["range"] | null) => {
  let from = raw?.from?.slice(0, 10) ?? "";
  let to = raw?.to?.slice(0, 10) ?? "";
  if (from && !ISO_DAY_RE.test(from)) {
    throw new Error("range.from ist ungueltig (YYYY-MM-DD erwartet).");
  }
  if (to && !ISO_DAY_RE.test(to)) {
    throw new Error("range.to ist ungueltig (YYYY-MM-DD erwartet).");
  }
  if (!from || !to) {
    const today = viennaTodayIso();
    to = today;
    from = subDaysIso(today, DEFAULT_RANGE_DAYS - 1);
  }
  if (from > to) throw new Error("range.from muss vor range.to liegen.");
  return { from, to };
};

const normalizeInput = async (
  req: Request,
  raw: TrendpilotInput,
): Promise<NormalizedInput> => {
  const trigger =
    raw.trigger === "scheduler" || raw.trigger === "manual"
      ? raw.trigger
      : "scheduler";

  const token = getBearerToken(req);
  const { userId, isServiceRole } = await getUserIdFromToken(token);
  if (!isServiceRole && raw.user_id && raw.user_id !== userId) {
    throw new Error("user_id stimmt nicht mit Authorization ueberein.");
  }

  if (!userId) {
    throw new Error("user_id fehlt (kein Token und keine Env gesetzt).");
  }

  return {
    userId,
    trigger,
    dryRun: Boolean(raw.dry_run),
    range: normalizeRange(raw.range),
  };
};

const fetchTrendpilotState = async (
  userId: string,
  type: "bp" | "body" | "lab",
) => {
  const { data, error } = await supabase
    .from("trendpilot_state")
    .select("user_id,type,baseline_from,baseline_sys,baseline_dia,sample_weeks,updated_at")
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle();
  if (error) throw error;
  return (data as TrendpilotState | null) ?? null;
};

const upsertTrendpilotState = async (state: TrendpilotState) => {
  const row = {
    user_id: state.user_id,
    type: state.type,
    baseline_from: state.baseline_from,
    baseline_sys: state.baseline_sys,
    baseline_dia: state.baseline_dia,
    sample_weeks: state.sample_weeks,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("trendpilot_state")
    .upsert(row, { onConflict: "user_id,type" });
  if (error) throw error;
};

const fetchHealthEvents = async (
  userId: string,
  type: "bp" | "body",
  range: NormalizedInput["range"],
) => {
  const { data, error } = await supabase
    .from("health_events")
    .select("id,day,ts,type,ctx,payload")
    .eq("user_id", userId)
    .eq("type", type)
    .gte("day", range.from)
    .lte("day", range.to)
    .order("day", { ascending: true });

  if (error) throw error;
  return (data as Record<string, unknown>[]) ?? [];
};

const fetchLabEvents = async (
  userId: string,
  range: NormalizedInput["range"],
) => {
  const { data, error } = await supabase
    .from("health_events")
    .select("id,day,ts,type,ctx,payload")
    .eq("user_id", userId)
    .eq("type", "lab_event")
    .gte("day", range.from)
    .lte("day", range.to)
    .order("day", { ascending: true });

  if (error) throw error;
  return (data as Record<string, unknown>[]) ?? [];
};

const fetchActivityEvents = async (
  userId: string,
  range: NormalizedInput["range"],
) => {
  const { data, error } = await supabase
    .from("health_events")
    .select("id,day,ts,type,ctx,payload")
    .eq("user_id", userId)
    .eq("type", "activity_event")
    .gte("day", range.from)
    .lte("day", range.to)
    .order("day", { ascending: true });

  if (error) throw error;
  return (data as Record<string, unknown>[]) ?? [];
};

const evaluateBpTrends = async (
  userId: string,
  rows: Record<string, unknown>[],
  dryRun: boolean,
): Promise<TrendpilotEvent[]> => {
  if (!rows.length) return [];

  const weekMap = new Map<
    string,
    { from: string; to: string; sysSum: number; diaSum: number; n: number }
  >();

  for (const row of rows) {
    const day = typeof row.day === "string" ? row.day : null;
    const payload = row.payload as Record<string, unknown> | null;
    const sysRaw = payload?.sys;
    const diaRaw = payload?.dia;
    const sys = typeof sysRaw === "number" ? sysRaw : Number(sysRaw);
    const dia = typeof diaRaw === "number" ? diaRaw : Number(diaRaw);
    if (!day || !Number.isFinite(sys) || !Number.isFinite(dia)) continue;
    const win = weekWindowForDay(day);
    const key = win.from;
    const entry = weekMap.get(key) || {
      from: win.from,
      to: win.to,
      sysSum: 0,
      diaSum: 0,
      n: 0,
    };
    entry.sysSum += sys;
    entry.diaSum += dia;
    entry.n += 1;
    weekMap.set(key, entry);
  }

  const weeks = Array.from(weekMap.values())
    .map((w) => ({
      from: w.from,
      to: w.to,
      avg_sys: w.sysSum / w.n,
      avg_dia: w.diaSum / w.n,
      samples: w.n,
    }))
    .sort((a, b) => a.from.localeCompare(b.from));

  if (weeks.length < MIN_WEEKS_REQUIRED) return [];

  let state = await fetchTrendpilotState(userId, "bp");
  let baselineSys = state?.baseline_sys ?? null;
  let baselineDia = state?.baseline_dia ?? null;
  let baselineFrom = state?.baseline_from ?? "";
  let sampleWeeks = state?.sample_weeks ?? 0;

  if (baselineSys == null || baselineDia == null) {
    const baselineSlice = weeks.slice(0, BASELINE_WEEKS);
    if (baselineSlice.length < MIN_WEEKS_REQUIRED) return [];
    baselineSys = median(baselineSlice.map((w) => w.avg_sys));
    baselineDia = median(baselineSlice.map((w) => w.avg_dia));
    baselineFrom = baselineSlice[0].from;
    sampleWeeks = baselineSlice.length;
    if (!dryRun && baselineSys != null && baselineDia != null) {
      await upsertTrendpilotState({
        user_id: userId,
        type: "bp",
        baseline_from: baselineFrom,
        baseline_sys: baselineSys,
        baseline_dia: baselineDia,
        sample_weeks: sampleWeeks,
      });
    }
  }

  if (baselineSys == null || baselineDia == null) return [];

  const classifyWeek = (avgSys: number, avgDia: number) => {
    const deltaSys = avgSys - baselineSys!;
    const deltaDia = avgDia - baselineDia!;
    if (
      avgSys >= CRITICAL_ABS_SYS ||
      avgDia >= CRITICAL_ABS_DIA ||
      (deltaSys >= CRITICAL_DELTA_SYS && deltaDia >= CRITICAL_DELTA_DIA)
    ) {
      return "critical" as const;
    }
    if (deltaSys >= WARNING_DELTA_SYS || deltaDia >= WARNING_DELTA_DIA) {
      return "warning" as const;
    }
    return "none" as const;
  };

  const statuses = weeks.map((w) => ({
    ...w,
    status: classifyWeek(w.avg_sys, w.avg_dia),
  }));

  const events: TrendpilotEvent[] = [];
  let streakStart = -1;
  let streakSeverity: "warning" | "critical" | null = null;

  for (let i = 0; i < statuses.length; i += 1) {
    const cur = statuses[i];
    if (cur.status === "none") {
      if (streakStart >= 0 && i - streakStart >= 2 && streakSeverity) {
        const end = statuses[i - 1];
        const payload = {
          rule_id: "bp-trend-v1",
          baseline_sys: baselineSys,
          baseline_dia: baselineDia,
          avg_sys: end.avg_sys,
          avg_dia: end.avg_dia,
          delta_sys: end.avg_sys - baselineSys,
          delta_dia: end.avg_dia - baselineDia,
          weeks: i - streakStart,
        };
        events.push({
          type: "bp",
          severity: streakSeverity,
          window_from: statuses[streakStart].from,
          window_to: end.to,
          source: "bp-trend-v1",
          payload,
        });
      }
      streakStart = -1;
      streakSeverity = null;
      continue;
    }

    if (streakStart < 0) {
      streakStart = i;
      streakSeverity = cur.status;
    } else if (cur.status === "critical") {
      streakSeverity = "critical";
    }
  }

  if (streakStart >= 0 && statuses.length - streakStart >= 2 && streakSeverity) {
    const end = statuses[statuses.length - 1];
    const payload = {
      rule_id: "bp-trend-v1",
      baseline_sys: baselineSys,
      baseline_dia: baselineDia,
      avg_sys: end.avg_sys,
      avg_dia: end.avg_dia,
      delta_sys: end.avg_sys - baselineSys,
      delta_dia: end.avg_dia - baselineDia,
      weeks: statuses.length - streakStart,
    };
    events.push({
      type: "bp",
      severity: streakSeverity,
      window_from: statuses[streakStart].from,
      window_to: end.to,
      source: "bp-trend-v1",
      payload,
    });
  }

  const trailing = statuses.slice(-NORMALIZE_WEEKS);
  if (trailing.length === NORMALIZE_WEEKS) {
    const anyAlert = statuses.some((s) => s.status !== "none");
    const trailingAllNone = trailing.every((s) => s.status === "none");
    if (anyAlert && trailingAllNone) {
      const normSys = mean(trailing.map((w) => w.avg_sys));
      const normDia = mean(trailing.map((w) => w.avg_dia));
      if (normSys != null && normDia != null) {
        events.push({
          type: "bp",
          severity: "info",
          window_from: trailing[0].from,
          window_to: trailing[trailing.length - 1].to,
          source: "baseline-normalized-v1",
          payload: {
            rule_id: "baseline-normalized-v1",
            baseline_from_prev: baselineFrom,
            baseline_sys_prev: baselineSys,
            baseline_dia_prev: baselineDia,
            baseline_from: trailing[0].from,
            baseline_sys: normSys,
            baseline_dia: normDia,
            sample_weeks: trailing.length,
          },
        });
      }
      if (!dryRun && normSys != null && normDia != null) {
        await upsertTrendpilotState({
          user_id: userId,
          type: "bp",
          baseline_from: trailing[0].from,
          baseline_sys: normSys,
          baseline_dia: normDia,
          sample_weeks: trailing.length,
        });
      }
    }
  }

  return events;
};

const evaluateBodyTrends = async (
  userId: string,
  rows: Record<string, unknown>[],
  dryRun: boolean,
): Promise<TrendpilotEvent[]> => {
  if (!rows.length) return [];

  const weekMap = new Map<
    string,
    { from: string; to: string; kgSum: number; n: number }
  >();

  for (const row of rows) {
    const day = typeof row.day === "string" ? row.day : null;
    const payload = row.payload as Record<string, unknown> | null;
    const kg = toNumber(payload?.kg);
    if (!day || kg == null) continue;
    const win = weekWindowForDay(day);
    const key = win.from;
    const entry = weekMap.get(key) || {
      from: win.from,
      to: win.to,
      kgSum: 0,
      n: 0,
    };
    entry.kgSum += kg;
    entry.n += 1;
    weekMap.set(key, entry);
  }

  const weeks = Array.from(weekMap.values())
    .map((w) => ({
      from: w.from,
      to: w.to,
      avg_kg: w.kgSum / w.n,
      samples: w.n,
    }))
    .sort((a, b) => a.from.localeCompare(b.from));

  if (weeks.length < MIN_WEEKS_REQUIRED) return [];

  let state = await fetchTrendpilotState(userId, "body");
  let baselineKg = state?.baseline_sys ?? null;
  let baselineFrom = state?.baseline_from ?? "";
  let sampleWeeks = state?.sample_weeks ?? 0;

  if (baselineKg == null) {
    const baselineSlice = weeks.slice(0, BASELINE_WEEKS);
    if (baselineSlice.length < MIN_WEEKS_REQUIRED) return [];
    baselineKg = median(baselineSlice.map((w) => w.avg_kg));
    baselineFrom = baselineSlice[0].from;
    sampleWeeks = baselineSlice.length;
    if (!dryRun && baselineKg != null) {
      await upsertTrendpilotState({
        user_id: userId,
        type: "body",
        baseline_from: baselineFrom,
        baseline_sys: baselineKg,
        baseline_dia: null,
        sample_weeks: sampleWeeks,
      });
    }
  }

  if (baselineKg == null) return [];

  const classifyWeek = (avgKg: number) => {
    const deltaKg = avgKg - baselineKg!;
    if (deltaKg >= BODY_CRITICAL_DELTA_KG) return "critical" as const;
    if (deltaKg >= BODY_WARNING_DELTA_KG) return "warning" as const;
    return "none" as const;
  };

  const statuses = weeks.map((w) => ({
    ...w,
    status: classifyWeek(w.avg_kg),
  }));

  const events: TrendpilotEvent[] = [];
  let streakStart = -1;
  let streakSeverity: "warning" | "critical" | null = null;

  for (let i = 0; i < statuses.length; i += 1) {
    const cur = statuses[i];
    if (cur.status === "none") {
      if (streakStart >= 0 && i - streakStart >= 2 && streakSeverity) {
        const end = statuses[i - 1];
        const payload = {
          rule_id: "body-weight-trend-v1",
          baseline_kg: baselineKg,
          avg_kg: end.avg_kg,
          delta_kg: end.avg_kg - baselineKg,
          weeks: i - streakStart,
        };
        events.push({
          type: "body",
          severity: streakSeverity,
          window_from: statuses[streakStart].from,
          window_to: end.to,
          source: "body-weight-trend-v1",
          payload,
        });
      }
      streakStart = -1;
      streakSeverity = null;
      continue;
    }

    if (streakStart < 0) {
      streakStart = i;
      streakSeverity = cur.status;
    } else if (cur.status === "critical") {
      streakSeverity = "critical";
    }
  }

  if (streakStart >= 0 && statuses.length - streakStart >= 2 && streakSeverity) {
    const end = statuses[statuses.length - 1];
    const payload = {
      rule_id: "body-weight-trend-v1",
      baseline_kg: baselineKg,
      avg_kg: end.avg_kg,
      delta_kg: end.avg_kg - baselineKg,
      weeks: statuses.length - streakStart,
    };
    events.push({
      type: "body",
      severity: streakSeverity,
      window_from: statuses[streakStart].from,
      window_to: end.to,
      source: "body-weight-trend-v1",
      payload,
    });
  }

  const trailing = statuses.slice(-NORMALIZE_WEEKS);
  if (trailing.length === NORMALIZE_WEEKS) {
    const anyAlert = statuses.some((s) => s.status !== "none");
    const trailingAllNone = trailing.every((s) => s.status === "none");
    if (anyAlert && trailingAllNone) {
      const normKg = mean(trailing.map((w) => w.avg_kg));
      if (normKg != null) {
        events.push({
          type: "body",
          severity: "info",
          window_from: trailing[0].from,
          window_to: trailing[trailing.length - 1].to,
          source: "baseline-normalized-v1",
          payload: {
            rule_id: "baseline-normalized-v1",
            baseline_from_prev: baselineFrom,
            baseline_sys_prev: baselineKg,
            baseline_dia_prev: null,
            baseline_from: trailing[0].from,
            baseline_sys: normKg,
            baseline_dia: null,
            sample_weeks: trailing.length,
          },
        });
      }
      if (!dryRun && normKg != null) {
        await upsertTrendpilotState({
          user_id: userId,
          type: "body",
          baseline_from: trailing[0].from,
          baseline_sys: normKg,
          baseline_dia: null,
          sample_weeks: trailing.length,
        });
      }
    }
  }

  return events;
};

const evaluateLabTrends = async (
  userId: string,
  rows: Record<string, unknown>[],
  dryRun: boolean,
): Promise<TrendpilotEvent[]> => {
  if (!rows.length) return [];

  const weekMap = new Map<
    string,
    { from: string; to: string; egfrSum: number; creatSum: number; n: number }
  >();

  for (const row of rows) {
    const day = typeof row.day === "string" ? row.day : null;
    const payload = row.payload as Record<string, unknown> | null;
    const egfr = toNumber(payload?.egfr);
    const creat = toNumber(payload?.creatinine);
    if (!day || egfr == null || creat == null) continue;
    const win = weekWindowForDay(day);
    const key = win.from;
    const entry = weekMap.get(key) || {
      from: win.from,
      to: win.to,
      egfrSum: 0,
      creatSum: 0,
      n: 0,
    };
    entry.egfrSum += egfr;
    entry.creatSum += creat;
    entry.n += 1;
    weekMap.set(key, entry);
  }

  const weeks = Array.from(weekMap.values())
    .map((w) => ({
      from: w.from,
      to: w.to,
      avg_egfr: w.egfrSum / w.n,
      avg_creatinine: w.creatSum / w.n,
      samples: w.n,
    }))
    .sort((a, b) => a.from.localeCompare(b.from));

  if (weeks.length < LAB_MIN_WEEKS) return [];
  const totalSamples = weeks.reduce((sum, w) => sum + w.samples, 0);
  if (totalSamples < LAB_MIN_SAMPLES) return [];

  let state = await fetchTrendpilotState(userId, "lab");
  let baselineEgfr = state?.baseline_sys ?? null;
  let baselineCreat = state?.baseline_dia ?? null;
  let baselineFrom = state?.baseline_from ?? "";
  let sampleWeeks = state?.sample_weeks ?? 0;

  if (baselineEgfr == null || baselineCreat == null) {
    const baselineSlice = weeks.slice(0, LAB_BASELINE_WEEKS);
    if (baselineSlice.length < LAB_MIN_WEEKS) return [];
    const baselineSamples = baselineSlice.reduce((sum, w) => sum + w.samples, 0);
    if (baselineSamples < LAB_MIN_SAMPLES) return [];
    baselineEgfr = median(baselineSlice.map((w) => w.avg_egfr));
    baselineCreat = median(baselineSlice.map((w) => w.avg_creatinine));
    baselineFrom = baselineSlice[0].from;
    sampleWeeks = baselineSlice.length;
    if (!dryRun && baselineEgfr != null && baselineCreat != null) {
      await upsertTrendpilotState({
        user_id: userId,
        type: "lab",
        baseline_from: baselineFrom,
        baseline_sys: baselineEgfr,
        baseline_dia: baselineCreat,
        sample_weeks: sampleWeeks,
      });
    }
  }

  if (baselineEgfr == null || baselineCreat == null) return [];

  const classifyWeek = (avgEgfr: number, avgCreat: number) => {
    const deltaEgfr = avgEgfr - baselineEgfr!;
    const deltaCreat = avgCreat - baselineCreat!;
    if (
      avgEgfr <= LAB_CRITICAL_EGFR_ABS ||
      avgCreat >= LAB_CRITICAL_CREAT_ABS ||
      deltaEgfr <= -LAB_CRITICAL_EGFR_DROP ||
      deltaCreat >= LAB_CRITICAL_CREAT_RISE
    ) {
      return "critical" as const;
    }
    if (
      deltaEgfr <= -LAB_WARNING_EGFR_DROP ||
      deltaCreat >= LAB_WARNING_CREAT_RISE
    ) {
      return "warning" as const;
    }
    return "none" as const;
  };

  const statuses = weeks.map((w) => ({
    ...w,
    status: classifyWeek(w.avg_egfr, w.avg_creatinine),
  }));

  const events: TrendpilotEvent[] = [];
  let streakStart = -1;
  let streakSeverity: "warning" | "critical" | null = null;

  for (let i = 0; i < statuses.length; i += 1) {
    const cur = statuses[i];
    if (cur.status === "none") {
      if (streakStart >= 0 && i - streakStart >= 2 && streakSeverity) {
        const end = statuses[i - 1];
        const payload = {
          rule_id: "lab-egfr-creatinine-trend-v1",
          baseline_egfr: baselineEgfr,
          baseline_creatinine: baselineCreat,
          avg_egfr: end.avg_egfr,
          avg_creatinine: end.avg_creatinine,
          delta_egfr: end.avg_egfr - baselineEgfr,
          delta_creatinine: end.avg_creatinine - baselineCreat,
          weeks: i - streakStart,
        };
        events.push({
          type: "lab",
          severity: streakSeverity,
          window_from: statuses[streakStart].from,
          window_to: end.to,
          source: "lab-egfr-creatinine-trend-v1",
          payload,
        });
      }
      streakStart = -1;
      streakSeverity = null;
      continue;
    }

    if (streakStart < 0) {
      streakStart = i;
      streakSeverity = cur.status;
    } else if (cur.status === "critical") {
      streakSeverity = "critical";
    }
  }

  if (streakStart >= 0 && statuses.length - streakStart >= 2 && streakSeverity) {
    const end = statuses[statuses.length - 1];
    const payload = {
      rule_id: "lab-egfr-creatinine-trend-v1",
      baseline_egfr: baselineEgfr,
      baseline_creatinine: baselineCreat,
      avg_egfr: end.avg_egfr,
      avg_creatinine: end.avg_creatinine,
      delta_egfr: end.avg_egfr - baselineEgfr,
      delta_creatinine: end.avg_creatinine - baselineCreat,
      weeks: statuses.length - streakStart,
    };
    events.push({
      type: "lab",
      severity: streakSeverity,
      window_from: statuses[streakStart].from,
      window_to: end.to,
      source: "lab-egfr-creatinine-trend-v1",
      payload,
    });
  }

  const trailing = statuses.slice(-NORMALIZE_WEEKS);
  if (trailing.length === NORMALIZE_WEEKS) {
    const anyAlert = statuses.some((s) => s.status !== "none");
    const trailingAllNone = trailing.every((s) => s.status === "none");
    if (anyAlert && trailingAllNone) {
      const normEgfr = mean(trailing.map((w) => w.avg_egfr));
      const normCreat = mean(trailing.map((w) => w.avg_creatinine));
      if (normEgfr != null && normCreat != null) {
        events.push({
          type: "lab",
          severity: "info",
          window_from: trailing[0].from,
          window_to: trailing[trailing.length - 1].to,
          source: "baseline-normalized-v1",
          payload: {
            rule_id: "baseline-normalized-v1",
            baseline_from_prev: baselineFrom,
            baseline_sys_prev: baselineEgfr,
            baseline_dia_prev: baselineCreat,
            baseline_from: trailing[0].from,
            baseline_sys: normEgfr,
            baseline_dia: normCreat,
            sample_weeks: trailing.length,
          },
        });
      }
      if (!dryRun && normEgfr != null && normCreat != null) {
        await upsertTrendpilotState({
          user_id: userId,
          type: "lab",
          baseline_from: trailing[0].from,
          baseline_sys: normEgfr,
          baseline_dia: normCreat,
          sample_weeks: trailing.length,
        });
      }
    }
  }

  return events;
};

const correlateTrends = (
  events: TrendpilotEventWithId[],
  _range: NormalizedInput["range"],
): TrendpilotEvent[] => {
  const bpEvents = events.filter(
    (e) => e.type === "bp" && e.id && e.severity !== "info",
  );
  const bodyEvents = events.filter(
    (e) => e.type === "body" && e.id && e.severity !== "info",
  );
  if (!bpEvents.length || !bodyEvents.length) return [];

  const combinedMap = new Map<
    string,
    {
      window_from: string;
      window_to: string;
      severity: "warning" | "critical";
      bp_ids: string[];
      body_ids: string[];
      weight_delta_kg: number | null;
    }
  >();

  for (const bp of bpEvents) {
    for (const body of bodyEvents) {
      const overlapFrom =
        bp.window_from > body.window_from ? bp.window_from : body.window_from;
      const overlapTo =
        bp.window_to < body.window_to ? bp.window_to : body.window_to;
      if (overlapFrom > overlapTo) continue;
      const bodyPayload = body.payload || {};
      const deltaKg = toNumber(bodyPayload.delta_kg);
      if (deltaKg == null) continue;
      if (deltaKg < COMBINED_MIN_DELTA_KG) continue;

      const severity =
        bp.severity === "critical" || deltaKg >= COMBINED_CRITICAL_DELTA_KG
          ? "critical"
          : "warning";
      const key = `${overlapFrom}|${severity}`;
      const entry = combinedMap.get(key) || {
        window_from: overlapFrom,
        window_to: overlapTo,
        severity,
        bp_ids: [],
        body_ids: [],
        weight_delta_kg: deltaKg,
      };
      entry.window_to =
        entry.window_to < overlapTo ? overlapTo : entry.window_to;
      entry.bp_ids.push(bp.id as string);
      entry.body_ids.push(body.id as string);
      entry.weight_delta_kg =
        entry.weight_delta_kg == null || deltaKg > entry.weight_delta_kg
          ? deltaKg
          : entry.weight_delta_kg;
      combinedMap.set(key, entry);
    }
  }

  const combined: TrendpilotEvent[] = [];
  for (const entry of combinedMap.values()) {
    const windowDays = diffDaysInclusive(entry.window_from, entry.window_to);
    combined.push({
      type: "combined",
      severity: entry.severity,
      window_from: entry.window_from,
      window_to: entry.window_to,
      source: "bp-weight-correlation-v1",
      payload: {
        rule_id: "bp-weight-correlation-v1",
        bp_event_ids: entry.bp_ids,
        body_event_ids: entry.body_ids,
        weight_delta_kg: entry.weight_delta_kg,
        window_days: windowDays,
      },
    });
  }

  return combined;
};

const upsertTrendpilotEvents = async (
  userId: string,
  events: TrendpilotEvent[],
) => {
  const results: { id?: string | null; type: string; severity: string }[] = [];
  const withIds: TrendpilotEventWithId[] = [];
  for (const evt of events) {
    const { data: existing, error } = await supabase
      .from("trendpilot_events")
      .select("id,window_to,ack,ack_at,payload")
      .eq("user_id", userId)
      .eq("type", evt.type)
      .eq("window_from", evt.window_from)
      .eq("severity", evt.severity)
      .maybeSingle();
    if (error) throw error;

    const windowTo =
      existing?.window_to && existing.window_to > evt.window_to
        ? existing.window_to
        : evt.window_to;

    const row: TrendpilotRow = {
      user_id: userId,
      type: evt.type,
      severity: evt.severity,
      window_from: evt.window_from,
      window_to: windowTo,
      source: evt.source ?? "trendpilot-v1",
      payload: mergePayload(existing?.payload, evt.payload),
    };

    if (existing?.ack) {
      row.ack = true;
      row.ack_at = existing.ack_at || null;
    }

    const { data: up, error: upErr } = await supabase
      .from("trendpilot_events")
      .upsert(row, {
        onConflict: "user_id,type,window_from,severity",
      })
      .select("id")
      .maybeSingle();
    if (upErr) throw upErr;
    results.push({ id: up?.id ?? null, type: evt.type, severity: evt.severity });
    withIds.push({ ...evt, id: up?.id ?? null });
  }
  return { results, withIds };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return responseOk();
  if (req.method !== "POST") {
    return responseJson({ error: "Nur POST erlaubt." }, 405);
  }

  try {
    const body = (await req.json()) as TrendpilotInput;
    const input = await normalizeInput(req, body);

    const contextRange = {
      from: subDaysIso(input.range.from, CONTEXT_WEEKS * 7 - 1),
      to: input.range.to,
    };

    const [bpRows, bodyRows, labRows, bodyRowsContext, labRowsContext, activityRows] =
      await Promise.all([
        fetchHealthEvents(input.userId, "bp", input.range),
        fetchHealthEvents(input.userId, "body", input.range),
        fetchLabEvents(input.userId, input.range),
        fetchHealthEvents(input.userId, "body", contextRange),
        fetchLabEvents(input.userId, contextRange),
        fetchActivityEvents(input.userId, contextRange),
      ]);

    if (!hasMinWeeks(input.range, MIN_WEEKS_REQUIRED)) {
      return responseJson({
        ok: true,
        trigger: input.trigger,
        range: input.range,
        events: [],
        fetched: { bp: bpRows.length, body: bodyRows.length, lab: labRows.length },
        written: [],
        note: "insufficient_data",
      });
    }

    const bpTrend = await evaluateBpTrends(
      input.userId,
      bpRows,
      input.dryRun,
    );
    const bodyTrend = await evaluateBodyTrends(
      input.userId,
      bodyRows,
      input.dryRun,
    );
    const labTrend = await evaluateLabTrends(
      input.userId,
      labRows,
      input.dryRun,
    );
    const singleEvents = [...bpTrend, ...bodyTrend, ...labTrend];
    const singleWithContext = attachContextToEvents(
      singleEvents,
      bodyRowsContext,
      activityRows,
      labRowsContext,
    );

    if (!singleEvents.length && !input.dryRun) {
      return responseJson({
        ok: true,
        trigger: input.trigger,
        range: input.range,
        events: [],
        fetched: { bp: bpRows.length, body: bodyRows.length, lab: labRows.length },
        written: [],
      });
    }

    if (input.dryRun) {
      const synthetic = singleWithContext.map((evt) => ({
        ...evt,
        id: `${evt.type}:${evt.severity}:${evt.window_from}`,
      }));
      const combined = correlateTrends(
        synthetic,
        input.range,
      );
      const allEvents = [...singleWithContext, ...combined];
      return responseJson({
        ok: true,
        trigger: input.trigger,
        range: input.range,
        dry_run: true,
        events: allEvents,
        fetched: { bp: bpRows.length, body: bodyRows.length, lab: labRows.length },
        written: [],
      });
    }

    const singleUpsert = await upsertTrendpilotEvents(
      input.userId,
      singleWithContext,
    );
    const combined = correlateTrends(singleUpsert.withIds, input.range);
    const combinedUpsert = combined.length
      ? await upsertTrendpilotEvents(input.userId, combined)
      : { results: [], withIds: [] };
    const allEvents = [...singleEvents, ...combined];
    const written = [...singleUpsert.results, ...combinedUpsert.results];
    return responseJson({
      ok: true,
      trigger: input.trigger,
      range: input.range,
      events: allEvents,
      fetched: { bp: bpRows.length, body: bodyRows.length, lab: labRows.length },
      written,
    });
  } catch (err) {
    const message = serializeError(err);
    console.error("[midas-trendpilot] failed", message);
    return responseJson({ ok: false, error: message }, 400);
  }
});
