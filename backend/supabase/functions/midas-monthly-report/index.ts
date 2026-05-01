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
const DEFAULT_USER_ID = Deno.env.get("MONTHLY_REPORT_USER_ID") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("[midas-monthly-report] Supabase env missing");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const REPORT_TZ = "Europe/Vienna";

type RangeInput = {
  from?: string | null;
  to?: string | null;
  month?: string | null;
  report_type?: "monthly_report" | "range_report" | null;
};

type NormalizedRange = {
  from: string;
  to: string;
  monthLabel: string;
  monthTag: string;
};

type BpEntry = {
  day?: string | null;
  ctx?: string | null;
  sys?: number | null;
  dia?: number | null;
  pulse?: number | null;
};

type BodyEntry = {
  day?: string | null;
  kg?: number | null;
  cm?: number | null;
  fat_pct?: number | null;
  muscle_pct?: number | null;
  fat_kg?: number | null;
  muscle_kg?: number | null;
};

type LabEntry = {
  day?: string | null;
  egfr?: number | null;
  creatinine?: number | null;
  albuminuria_category?: string | null;
  acr_value?: number | null;
  hba1c?: number | null;
  ldl?: number | null;
  ckd_stage?: string | null;
};

type ActivityEntry = {
  day?: string | null;
  activity?: string | null;
  duration_min?: number | null;
  note?: string | null;
};

type ProfileRow = {
  full_name: string | null;
  birth_date: string | null;
  height_cm: number | null;
  is_smoker: boolean | null;
  medications: unknown | null;
};

type TrendpilotEntry = {
  id: string;
  ts: string | null;
  type: string | null;
  severity: string | null;
  source: string | null;
  window_from: string | null;
  window_to: string | null;
  payload: Record<string, unknown> | null;
};

type NarrativeResult = {
  summary: string;
  text: string;
  meta: Record<string, unknown>;
};

const responseJson = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const responseOk = () => new Response("ok", { headers: corsHeaders });

const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const shiftIsoDate = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
};

const getDatePartsInTz = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(pick("year") || "0"),
    month: Number(pick("month") || "0"),
    day: Number(pick("day") || "0"),
  };
};

const getBearerToken = (req: Request) => {
  const h = req.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return h || null;
};

const monthBoundsUTC = (y: number, m1: number) => {
  const first = new Date(Date.UTC(y, m1 - 1, 1));
  const last = new Date(Date.UTC(y, m1, 0));
  return { from: toISODate(first), to: toISODate(last) };
};

const defaultPreviousMonthBounds = () => {
  const now = new Date();
  const parts = getDatePartsInTz(now, REPORT_TZ);
  const y = parts.year;
  const m = parts.month;
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  return monthBoundsUTC(prevY, prevM);
};

const previousMonthBounds = (monthTag: string) => {
  const [yearRaw, monthRaw] = monthTag.split("-");
  const y = Number(yearRaw);
  const m = Number(monthRaw);
  if (!y || !m) return defaultPreviousMonthBounds();
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  return monthBoundsUTC(prevY, prevM);
};

const formatMonthLabel = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
};

const normalizeRange = (input: RangeInput): NormalizedRange => {
  let from = input.from?.slice(0, 10) ?? "";
  let to = input.to?.slice(0, 10) ?? "";

  if (input.month && input.month.length === 7) {
    const [y, m] = input.month.split("-");
    const b = monthBoundsUTC(Number(y), Number(m));
    from = b.from;
    to = b.to;
  }

  if (!from || !to) {
    const b = defaultPreviousMonthBounds();
    from = b.from;
    to = b.to;
  }

  if (from > to) throw new Error("Von-Datum muss vor Bis-Datum liegen.");

  const start = new Date(from + "T00:00:00Z");
  const monthTag = `${start.getUTCFullYear()}-${String(
    start.getUTCMonth() + 1,
  ).padStart(2, "0")}`;

  return { from, to, monthLabel: formatMonthLabel(from), monthTag };
};

const requireUser = async (token: string | null) => {
  if (!token) throw new Error("Authorization Header fehlt.");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("Nutzer konnte nicht authentifiziert werden.");
  }
  return data.user;
};

const formatDateDE = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: REPORT_TZ,
  });
};

const ESC_BP_BANDS = [
  { key: "grad3", label: "Grad III", color: "#991b1b", sys: 180, dia: 110 },
  { key: "grad2", label: "Grad II", color: "#b91c1c", sys: 160, dia: 100 },
  { key: "grad1", label: "Grad I", color: "#f59e0b", sys: 140, dia: 90 },
  { key: "high-normal", label: "Hoch-normal", color: "#facc15", sys: 130, dia: 85 },
  { key: "normal", label: "Normal", color: "#10b981", sys: 120, dia: 80 },
  { key: "optimal", label: "Optimal", color: "#10b981", sys: 120, dia: 80 },
];

const classifyEscBp = (sys: number | null, dia: number | null) => {
  if (!Number.isFinite(sys ?? NaN) || !Number.isFinite(dia ?? NaN)) return null;
  for (const band of ESC_BP_BANDS) {
    if (band.key === "optimal") continue;
    if ((sys ?? 0) >= band.sys || (dia ?? 0) >= band.dia) return band;
  }
  if ((sys ?? 0) < 120 && (dia ?? 0) < 80) {
    return ESC_BP_BANDS.find((b) => b.key === "optimal") || null;
  }
  return null;
};

const classifyMapValue = (mapVal: number | null) => {
  const v = Number(mapVal);
  if (!Number.isFinite(v)) return null;
  if (v < 60) return { color: "#dc2626", label: "MAP < 60 mmHg (kritisch)" };
  if (v < 65) return { color: "#f97316", label: "MAP 60-64 mmHg (grenzwertig)" };
  if (v <= 100) return { color: "#22c55e", label: "MAP 65-100 mmHg (normal)" };
  if (v <= 110) return { color: "#eab308", label: "MAP 101-110 mmHg (hoch)" };
  return { color: "#dc2626", label: "MAP > 110 mmHg (kritisch)" };
};

const classifyPulsePressure = (pp: number | null) => {
  const v = Number(pp);
  if (!Number.isFinite(v)) return null;
  if (v <= 29) return { color: "#dc2626", label: "Pulsdruck <= 29 mmHg (sehr niedrig)" };
  if (v <= 50) return { color: "#22c55e", label: "Pulsdruck 30-50 mmHg (normal)" };
  if (v <= 60) return { color: "#eab308", label: "Pulsdruck 51-60 mmHg (grenzwertig)" };
  if (v <= 70) return { color: "#f97316", label: "Pulsdruck 61-70 mmHg (hoch)" };
  return { color: "#dc2626", label: "Pulsdruck >= 71 mmHg (kritisch)" };
};

const classifyBmi = (v: number | null) => {
  if (v == null) return { color: "#9aa3af", label: "unbekannt" };
  if (v < 18.5) return { color: "#60a5fa", label: "untergew." };
  if (v < 25) return { color: "#10b981", label: "normal" };
  if (v < 30) return { color: "#f59e0b", label: "übergew." };
  return { color: "#ef4444", label: "adipös" };
};

const classifyWhtr = (v: number | null) => {
  if (v == null) return { color: "#9aa3af", label: "unbekannt" };
  if (v < 0.5) return { color: "#10b981", label: "ok" };
  if (v <= 0.6) return { color: "#f59e0b", label: "erhöht" };
  return { color: "#ef4444", label: "hoch" };
};

const formatDateTimeDE = (d: Date) =>
  d.toLocaleString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: REPORT_TZ,
  });

const calcAgeYears = (birthDateIso: string, refDateIso: string) => {
  const birth = new Date(`${birthDateIso}T00:00:00Z`);
  const ref = new Date(`${refDateIso}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime())) return null;
  let age = ref.getUTCFullYear() - birth.getUTCFullYear();
  const m = ref.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && ref.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
};

const normalizeMedications = (value: unknown) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") {
          const raw = JSON.stringify(entry);
          return raw && raw !== "{}" ? raw : null;
        }
        return null;
      })
      .filter((entry): entry is string => !!entry);
  }
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  return [];
};


const fetchSeries = async <T>(
  table: string,
  userId: string,
  range: NormalizedRange,
): Promise<T[]> => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .gte("day", range.from)
    .lte("day", range.to)
    .order("day", { ascending: true });

  if (error) throw error;
  return (data as T[]) ?? [];
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const round = (value: number | null, digits = 1) => {
  if (value === null) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const average = (values: number[]) =>
  values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;

const formatNumberDE = (value: number | null, digits = 1) => {
  if (value === null || !Number.isFinite(value)) return "?";
  if (!digits) return String(Math.round(value));
  return value.toFixed(digits).replace(".", ",");
};

const formatDelta = (value: number | null, unit = "", digits = 1) => {
  if (value === null) return "n. beurteilbar";
  const r = round(value, digits);
  if (r === null) return "n. beurteilbar";
  const sign = r > 0 ? "+" : "";
  return `${sign}${formatNumberDE(r, digits)}${unit}`;
};
const daysBetween = (fromIso: string, toIso: string) => {
  const start = new Date(`${fromIso}T00:00:00Z`);
  const end = new Date(`${toIso}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return diff >= 0 ? diff + 1 : null;
};

const weeksBetween = (fromIso: string, toIso: string) => {
  const days = daysBetween(fromIso, toIso);
  if (!days) return null;
  return days / 7;
};


const describeMorningEvening = (entries: BpEntry[]) => {
  const c = entries.reduce(
    (a, e) => {
      const ctx = (e.ctx || "").toLowerCase();
      if (ctx.startsWith("m")) a.m++;
      else if (ctx.startsWith("a")) a.a++;
      else a.o++;
      return a;
    },
    { m: 0, a: 0, o: 0 },
  );

  const parts: string[] = [];
  if (c.m) parts.push(`${c.m} morgens`);
  if (c.a) parts.push(`${c.a} abends`);
  if (c.o) parts.push(`${c.o} ohne Kontext`);
  return parts.join(", ");
};

const analyzeBpSeries = (entries: BpEntry[]) => {
  const validEntries = entries.filter(
    (e) => toNumber(e.sys) !== null && toNumber(e.dia) !== null,
  );
  const sys = validEntries
    .map((e) => toNumber(e.sys))
    .filter((v): v is number => v !== null);

  const dia = validEntries
    .map((e) => toNumber(e.dia))
    .filter((v): v is number => v !== null);

  const avgSys = average(sys);
  const avgDia = average(dia);

  const minSys = sys.length ? Math.min(...sys) : null;
  const maxSys = sys.length ? Math.max(...sys) : null;
  const minDia = dia.length ? Math.min(...dia) : null;
  const maxDia = dia.length ? Math.max(...dia) : null;

  const validCount = validEntries.length;
  const hypertensive = validEntries.filter(
    (e) => (toNumber(e.sys) ?? 0) >= 135 || (toNumber(e.dia) ?? 0) >= 85,
  ).length;

  const pp = validEntries
    .map((e) => {
      const s = toNumber(e.sys);
      const d = toNumber(e.dia);
      return s !== null && d !== null ? s - d : null;
    })
    .filter((v): v is number => v !== null);

  const avgPP = average(pp);
  const me = describeMorningEvening(entries);

  const warn =
    !validCount || avgSys === null || avgDia === null
      ? null
      : avgSys >= 135 ||
          avgDia >= 85 ||
          hypertensive >= Math.max(1, Math.ceil(validCount * 0.25))
        ? "Blutdruck auffällig"
        : null;

  let description = "Keine Blutdruckdaten im Monat.";

  if (entries.length && !validCount) {
    description = "Blutdruckdaten vorhanden, aber unvollständig.";
  } else if (validCount) {
    const base = `Ø ${round(avgSys, 0)}/${round(avgDia, 0)} mmHg (${validCount} Messungen${
      me ? `, ${me}` : ""
    })`;
    const spread = `Spanne ${minSys ?? "?"}/${minDia ?? "?"} bis ${maxSys ?? "?"}/${maxDia ?? "?"} mmHg`;
    const high = hypertensive
      ? `${hypertensive} Messungen ≥ 135/85`
      : "keine auffälligen Spitzen";
    const ppNote = avgPP !== null ? `Pulsdruck Ø ${round(avgPP, 1)} mmHg` : null;

    description = `${base}. ${spread}. ${high}.${ppNote ? ` ${ppNote}.` : ""}`;
  }

  return {
    description,
    avgSys: round(avgSys, 1),
    avgDia: round(avgDia, 1),
    minSys,
    maxSys,
    minDia,
    maxDia,
    hypertensiveEntries: hypertensive,
    avgPulsePressure: round(avgPP, 1),
    warning: warn,
  };
};

const analyzeBodySeries = (entries: BodyEntry[]) => {
  if (!entries.length) {
    return {
      description: "Keine Körperdaten erfasst.",
      firstWeight: null,
      lastWeight: null,
      weightDelta: null,
      waistDelta: null,
      avgWeight: null,
      minWeight: null,
      maxWeight: null,
    };
  }

  const weights = entries
    .map((e) => toNumber(e.kg))
    .filter((v): v is number => v !== null);

  const waists = entries
    .map((e) => toNumber(e.cm))
    .filter((v): v is number => v !== null);

  const firstW = weights.length ? weights[0] : null;
  const lastW = weights.length ? weights[weights.length - 1] : null;
  const dW = firstW !== null && lastW !== null ? lastW - firstW : null;

  const firstC = waists.length ? waists[0] : null;
  const lastC = waists.length ? waists[waists.length - 1] : null;
  const dC = firstC !== null && lastC !== null ? lastC - firstC : null;

  const minW = weights.length ? Math.min(...weights) : null;
  const maxW = weights.length ? Math.max(...weights) : null;
  const avgW = average(weights);

  const description = `Gewicht Ø ${round(avgW, 1) ?? "?"} kg (${entries.length} Einträge), Spanne ${minW ?? "?"}–${maxW ?? "?"} kg. Trend: ${formatDelta(
    dW,
    " kg",
    1,
  )}; Bauchumfang: ${formatDelta(dC, " cm", 1)}.`;

  return {
    description,
    firstWeight: round(firstW, 1),
    lastWeight: round(lastW, 1),
    weightDelta: round(dW, 1),
    waistDelta: round(dC, 1),
    avgWeight: round(avgW, 1),
    minWeight: minW,
    maxWeight: maxW,
  };
};

const analyzeLabSeries = (entries: LabEntry[]) => {
  if (!entries.length) {
    return {
      description: "Keine Laborwerte im Zeitraum – bitte Termin planen.",
      latest: null,
      previous: null,
      ckdStage: null,
      warning: "Keine Labordaten",
    };
  }

  const latest = entries[entries.length - 1];
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;

  const egfr = toNumber(latest.egfr);
  const crea = toNumber(latest.creatinine);

  const prevEgfr = prev ? toNumber(prev.egfr) : null;
  const dEgfr = egfr !== null && prevEgfr !== null ? egfr - prevEgfr : null;

  const acr = toNumber(latest.acr_value);

  const album =
    latest.albuminuria_category ||
    (acr !== null ? (acr >= 300 ? "A3" : acr >= 30 ? "A2" : "A1") : null);

  const warn =
    egfr !== null && egfr < 45
      ? "Nierenfunktion reduziert"
      : acr !== null && acr >= 300
        ? "Albuminurie erhöht"
        : null;

  const lines: string[] = [];
  lines.push(
    `Letzte Kontrolle ${latest.day || "unbekannt"}: eGFR ${egfr ?? "?"} ml/min, Kreatinin ${crea ?? "?"} mg/dl.`,
  );
  if (album) {
    lines.push(
      `Albuminurie: ${album}${acr !== null ? ` (${acr} mg/g)` : ""}.`,
    );
  }
  if (dEgfr !== null) {
    lines.push(
      `eGFR-Verlauf: ${formatDelta(
        dEgfr,
        " ml/min",
        1,
      )} gegenüber der vorherigen Messung.`,
    );
  }

  return {
    description: lines.join(" "),
    latest,
    previous: prev,
    ckdStage: latest.ckd_stage || null,
    warning: warn,
  };
};

const analyzeActivitySeries = (
  series: ActivityEntry[],
  prevSeries: ActivityEntry[],
  options?: { includeComparison?: boolean },
) => {
  const includeComparison = options?.includeComparison ?? false;
  const count = series.length;
  const totalMin = series.reduce(
    (sum, row) => sum + (row.duration_min ?? 0),
    0,
  );
  const avgMin = count ? totalMin / count : null;
  const days = new Set(series.map((row) => row.day)).size;

  const prevCount = includeComparison ? prevSeries.length : null;
  const prevTotalMin = includeComparison
    ? prevSeries.reduce(
        (sum, row) => sum + (row.duration_min ?? 0),
        0,
      )
    : null;

  const deltaCount = prevCount !== null ? count - prevCount : null;
  const deltaTotalMin =
    prevTotalMin !== null ? totalMin - prevTotalMin : null;

  if (!count) {
    return {
      description: "Keine Aktivität erfasst.",
      count: 0,
      totalMin: 0,
      avgMin: null,
      days,
      deltaCount,
      deltaTotalMin,
    };
  }

  const avgText = avgMin !== null ? `Ø ${round(avgMin, 0)} Min` : "Ø n. a.";
  const compareText = includeComparison
    ? prevCount !== null
      ? `Gegenüber Vormonat: ${formatDelta(deltaCount, " Einträge", 0)}, ${formatDelta(deltaTotalMin, " Min", 0)}.`
      : "Gegenüber Vormonat: n. beurteilbar."
    : null;
  const baseText = `${count} Einträge, ${Math.round(totalMin)} Minuten gesamt, ${avgText}. Tage aktiv: ${days}.`;

  return {
    description: compareText ? `${baseText} ${compareText}` : baseText,
    count,
    totalMin: Math.round(totalMin),
    avgMin: round(avgMin, 0),
    days,
    deltaCount,
    deltaTotalMin,
  };
};

const buildNarrative = ({
  range,
  bpSeries,
  bpSeries30,
  bpSeries180,
  bodySeries,
  labSeries,
  activitySeries,
  activityPrevSeries,
  profile,
  trendpilotEntries,
  generatedAt,
  reportType,
}: {
  range: NormalizedRange;
  bpSeries: BpEntry[];
  bpSeries30: BpEntry[];
  bpSeries180: BpEntry[];
  bodySeries: BodyEntry[];
  labSeries: LabEntry[];
  activitySeries: ActivityEntry[];
  activityPrevSeries: ActivityEntry[];
  profile: ProfileRow | null;
  trendpilotEntries: TrendpilotEntry[];
  generatedAt: string;
  reportType: "monthly_report" | "range_report";
}): NarrativeResult => {
  const isRangeReport = reportType === "range_report";
  const bp = analyzeBpSeries(bpSeries);
  const bp30 = analyzeBpSeries(bpSeries30);
  const bp180 = analyzeBpSeries(bpSeries180);
  const body = analyzeBodySeries(bodySeries);
  const lab = analyzeLabSeries(labSeries);
  const activity = analyzeActivitySeries(activitySeries, activityPrevSeries, {
    includeComparison: !isRangeReport,
  });

  const flags = [bp.warning, lab.warning].filter(Boolean) as string[];
  const warningLabel = flags.length ? ` | Hinweise: ${flags.join(", ")}` : "";

  const activitySummary = `${activity.count}${activity.totalMin ? ` (${activity.totalMin} Min)` : ""}`;
  const rangeLabel = isRangeReport
    ? `Zeitraum ${range.from} bis ${range.to}`
    : range.monthLabel;
  const summary = isRangeReport
    ? ""
    : `${rangeLabel}: BP ${bpSeries.length}, Körper ${bodySeries.length}, Labor ${labSeries.length}, Aktivität ${activitySummary}${warningLabel}`;
  const fmtNum = (value: number | null | undefined, digits = 0) => {
    if (value === null || value === undefined) return "?";
    const rounded = round(value, digits);
    return rounded === null ? "?" : formatNumberDE(rounded, digits);
  };

  const bp30From = shiftIsoDate(range.to, -29);
  const bp180From = shiftIsoDate(range.to, -179);

  const buildBpMeta = (stats: ReturnType<typeof analyzeBpSeries>, from: string, to: string) => {
    const mapVal =
      stats.avgSys !== null && stats.avgDia !== null
        ? round((stats.avgSys + 2 * stats.avgDia) / 3, 0)
        : null;
    const esc = classifyEscBp(stats.avgSys, stats.avgDia);
    const mapClass = classifyMapValue(mapVal);
    const pulseClass = classifyPulsePressure(stats.avgPulsePressure);
    return {
      from,
      to,
      avg_sys: stats.avgSys,
      avg_dia: stats.avgDia,
      min_sys: stats.minSys,
      max_sys: stats.maxSys,
      min_dia: stats.minDia,
      max_dia: stats.maxDia,
      map_avg: mapVal,
      pulse_avg: stats.avgPulsePressure,
      esc_class: esc,
      map_class: mapClass,
      pulse_class: pulseClass,
    };
  };

  const bodyRangeMeta = (() => {
    const weightEntries = bodySeries.filter((entry) => toNumber(entry.kg) !== null);
    const waistEntries = bodySeries.filter((entry) => toNumber(entry.cm) !== null);

    const firstWeightEntry = weightEntries[0] || null;
    const lastWeightEntry = weightEntries.length ? weightEntries[weightEntries.length - 1] : null;
    const firstWeight = firstWeightEntry ? toNumber(firstWeightEntry.kg) : null;
    const lastWeight = lastWeightEntry ? toNumber(lastWeightEntry.kg) : null;
    const weightDelta = firstWeight !== null && lastWeight !== null ? lastWeight - firstWeight : null;

    const firstWaistEntry = waistEntries[0] || null;
    const lastWaistEntry = waistEntries.length ? waistEntries[waistEntries.length - 1] : null;
    const firstWaist = firstWaistEntry ? toNumber(firstWaistEntry.cm) : null;
    const lastWaist = lastWaistEntry ? toNumber(lastWaistEntry.cm) : null;
    const waistDelta = firstWaist !== null && lastWaist !== null ? lastWaist - firstWaist : null;

    const heightCm = profile?.height_cm ?? null;
    const lastBmi = lastWeight !== null && heightCm ? lastWeight / Math.pow(heightCm / 100, 2) : null;
    const firstBmi = firstWeight !== null && heightCm ? firstWeight / Math.pow(heightCm / 100, 2) : null;
    const bmiDelta = lastBmi !== null && firstBmi !== null ? lastBmi - firstBmi : null;

    const lastWhtr = lastWaist !== null && heightCm ? lastWaist / heightCm : null;
    const firstWhtr = firstWaist !== null && heightCm ? firstWaist / heightCm : null;
    const whtrDelta = lastWhtr !== null && firstWhtr !== null ? lastWhtr - firstWhtr : null;

    return {
      first_weight: firstWeight,
      last_weight: lastWeight,
      weight_delta: weightDelta,
      first_weight_day: firstWeightEntry?.day || null,
      last_weight_day: lastWeightEntry?.day || null,
      first_waist: firstWaist,
      last_waist: lastWaist,
      waist_delta: waistDelta,
      first_waist_day: firstWaistEntry?.day || null,
      last_waist_day: lastWaistEntry?.day || null,
      bmi_last: lastBmi,
      bmi_delta: bmiDelta,
      bmi_class: classifyBmi(lastBmi),
      whtr_last: lastWhtr,
      whtr_delta: whtrDelta,
      whtr_class: classifyWhtr(lastWhtr),
    };
  })();

  const activityRangeMeta = (() => {
    const lastDay = activitySeries.length
      ? activitySeries[activitySeries.length - 1]?.day || null
      : null;
    const weeks = weeksBetween(range.from, range.to);
    const perWeek = weeks ? activity.count / weeks : null;
    return { last_day: lastDay, per_week: perWeek };
  })();

  const formatBpMonthly = () => {
    if (!bpSeries.length) return "**Blutdruck:** Keine Messungen im Zeitraum.";
    const base = `**Blutdruck:** ∅ ${fmtNum(bp.avgSys, 0)}/${fmtNum(bp.avgDia, 0)} mmHg (${bpSeries.length} Messungen)`;
    const span = `Spanne ${fmtNum(bp.minSys, 0)}/${fmtNum(bp.minDia, 0)} bis ${fmtNum(bp.maxSys, 0)}/${fmtNum(bp.maxDia, 0)}`;
    const peaks = bp.hypertensiveEntries ? `Spitzen >=135/85: ${bp.hypertensiveEntries}` : "";
    return `${base}, ${span}.${peaks ? ` ${peaks}.` : ""}`;
  };

  const formatBodyMonthly = () => {
    if (!bodySeries.length) return "**Körper:** Keine Körperdaten im Zeitraum.";
    const avg = fmtNum(body.avgWeight, 1);
    const span = `${fmtNum(body.minWeight, 1)}-${fmtNum(body.maxWeight, 1)} kg`;
    const trend = formatDelta(body.weightDelta, " kg", 1);
    const waist = formatDelta(body.waistDelta, " cm", 1);
    return `**Körper:** ∅ ${avg} kg, Trend ${trend}, Spanne ${span}. Taille Trend ${waist}.`;
  };

  const formatLabMonthly = () => {
    if (!labSeries.length) return "**Labor:** Keine Labordaten im Zeitraum.";
    const latest = lab.latest || {};
    const egfr = toNumber(latest.egfr);
    const crea = toNumber(latest.creatinine);
    const acr = toNumber(latest.acr_value);
    const album =
      latest.albuminuria_category ||
      (acr !== null ? (acr >= 300 ? "A3" : acr >= 30 ? "A2" : "A1") : null);
    const ckInfo = lab.ckdStage ? ` (CKD ${lab.ckdStage})` : "";
    const base = `**Labor${ckInfo}:** Letzte Kontrolle ${latest.day || "unbekannt"}: eGFR ${egfr ?? "?"} ml/min, Kreatinin ${crea ?? "?"} mg/dl`;
    const albumText = album ? `, Albuminurie ${album}${acr !== null ? ` (${acr} mg/g)` : ""}` : "";
    return `${base}${albumText}.`;
  };
  const formatActivityMonthly = () => {
    if (!activity.count) return "**Aktivität:** Keine Einträge im Zeitraum.";
    const base = `**Aktivität:** ${activity.count} Einträge, ${activity.totalMin} Min, ${activity.days} Tage aktiv.`;
    if (activity.deltaCount === null || activity.deltaTotalMin === null) return base;
    const compare = `Vormonat: ${formatDelta(activity.deltaCount, " Einträge", 0)}, ${formatDelta(activity.deltaTotalMin, " Min", 0)}.`;
    return `${base} ${compare}`;
  };

  const formatPatientRange = () => {
    if (!profile) return "**Patient**\n- Keine Profildaten vorhanden.";
    const birth = profile.birth_date ? formatDateDE(profile.birth_date) : "-";
    const age =
      profile.birth_date ? calcAgeYears(profile.birth_date, range.to) : null;
    const birthLabel =
      birth !== "-" ? `${birth}${age !== null ? ` (${age} Jahre)` : ""}` : "-";
    const height =
      typeof profile.height_cm === "number" ? `${profile.height_cm} cm` : "-";
    const smoker =
      profile.is_smoker === null
        ? "-"
        : profile.is_smoker
          ? "Raucher"
          : "Nichtraucher";
    const meds = normalizeMedications(profile.medications);
    const medsLabel = meds.length ? meds.join(", ") : "keine";
    return [
      "**Patient**",
      `- Name: ${profile.full_name || "-"}`,
      `- Geburtsdatum: ${birthLabel}`,
      `- Größe: ${height}`,
      `- Raucherstatus: ${smoker}`,
      `- Derzeitige Medikation: ${medsLabel}`,
    ].join("\n");
  };

  const formatDataBasisRange = () => {
    const me = describeMorningEvening(bpSeries);
    const bpCount = bpSeries.length ? `${bpSeries.length} Messungen${me ? ` (${me})` : ""}` : "0 Messungen";
    const bodyCount = bodySeries.length ? `${bodySeries.length} Messungen` : "0 Messungen";
    const labCount = `${labSeries.length} Kontrolle${labSeries.length === 1 ? "" : "n"}`;
    const activityCount = `${activity.count} Einträge`;
    return [
      "**Datengrundlage**",
      `- Blutdruck: ${bpCount}`,
      `- Körper: ${bodyCount}`,
      `- Labor: ${labCount}`,
      `- Aktivität: ${activityCount}`,
    ].join("\n");
  };

  const formatBpRange = () => {
    const from30 = bp30From;
    const from180 = bp180From;

    const formatWindow = (
      label: string,
      entries: BpEntry[],
      stats: ReturnType<typeof analyzeBpSeries>,
      from: string,
      to: string,
    ) => {
      const period = `${formatDateDE(from)} bis ${formatDateDE(to)}`;
      const header = `**Zeitraum ${label}**`;
      if (!entries.length) {
        return [header, `- Zeitraum: ${period}`, `- Keine Messungen im Zeitraum.`];
      }
      const mapVal =
        stats.avgSys !== null && stats.avgDia !== null
          ? round((stats.avgSys + 2 * stats.avgDia) / 3, 0)
          : null;
      const lines = [
        header,
        `- Zeitraum: ${period}`,
        `- Durchschnitt: ${fmtNum(stats.avgSys, 0)}/${fmtNum(stats.avgDia, 0)} mmHg`,
        `- Spanne: ${fmtNum(stats.minSys, 0)}/${fmtNum(stats.minDia, 0)} bis ${fmtNum(stats.maxSys, 0)}/${fmtNum(stats.maxDia, 0)} mmHg`,
        mapVal !== null ? `- MAP (Durchschnitt): ${fmtNum(mapVal, 0)} mmHg` : null,
        stats.avgPulsePressure !== null
          ? `- Pulsdruck (Durchschnitt): ${fmtNum(stats.avgPulsePressure, 0)} mmHg`
          : null,
      ].filter(Boolean) as string[];
      return lines;
    };

    const lines = [
      "**Blutdruck**",
      ...formatWindow("30 Tage", bpSeries30, bp30, from30, range.to),
      "",
      ...formatWindow("180 Tage", bpSeries180, bp180, from180, range.to),
    ];
    return lines.join("\n");
  };
  const formatBodyRange = () => {
    if (!bodySeries.length) return "**Körperzusammensetzung**\n- Keine Körperdaten im Zeitraum.";
    const changeLabel = (dateLabel: string) =>
      dateLabel && dateLabel !== "-" ? `Änderung seit ${dateLabel}` : "Änderung seit Start";
    const firstWeightDate = formatDateDE(bodyRangeMeta.first_weight_day);
    const lastWeightDate = formatDateDE(bodyRangeMeta.last_weight_day);
    const firstWaistDate = formatDateDE(bodyRangeMeta.first_waist_day);
    const lastWaistDate = formatDateDE(bodyRangeMeta.last_waist_day);

    const lines = [
      "**Körperzusammensetzung**",
      `- Zeitraum: ${formatDateDE(range.from)} bis ${formatDateDE(range.to)}`,
      bodyRangeMeta.last_weight !== null
        ? `- Gewicht: letzter Wert ${fmtNum(bodyRangeMeta.last_weight, 1)} kg (${lastWeightDate}), ${changeLabel(firstWeightDate)}: ${formatDelta(bodyRangeMeta.weight_delta, " kg", 1)}`
        : "- Gewicht: keine Daten.",
      bodyRangeMeta.last_waist !== null
        ? `- Bauchumfang: letzter Wert ${fmtNum(bodyRangeMeta.last_waist, 1)} cm (${lastWaistDate}), ${changeLabel(firstWaistDate)}: ${formatDelta(bodyRangeMeta.waist_delta, " cm", 1)}`
        : "- Bauchumfang: keine Daten.",
      bodyRangeMeta.whtr_last !== null
        ? `- WHtR: letzter Wert ${fmtNum(bodyRangeMeta.whtr_last, 2)} (${lastWaistDate}), ${changeLabel(firstWaistDate)}: ${formatDelta(bodyRangeMeta.whtr_delta, "", 2)}`
        : "- WHtR: keine Daten.",
      bodyRangeMeta.bmi_last !== null
        ? `- BMI: letzter Wert ${fmtNum(bodyRangeMeta.bmi_last, 1)} (${lastWeightDate}), ${changeLabel(firstWeightDate)}: ${formatDelta(bodyRangeMeta.bmi_delta, "", 1)}`
        : "- BMI: keine Daten.",
    ].filter(Boolean) as string[];
    return lines.join("\n");
  };
  const formatActivityRange = () => {
    if (!activity.count) return "**Aktivität**\n- Keine Einträge im Zeitraum.";
    const perWeek = activityRangeMeta.per_week;
    const perWeekText = perWeek !== null ? fmtNum(perWeek, 1) : "n. a.";
    const avgText =
      activity.avgMin !== null ? `Durchschnitt ${fmtNum(activity.avgMin, 0)} Min/Eintrag` : "Durchschnitt n. a.";
    return [
      "**Aktivität**",
      `- Letzte Aktivität: ${formatDateDE(activityRangeMeta.last_day)}`,
      `- Trainings/Woche: ${perWeekText}`,
      `- Gesamtdauer: ${activity.totalMin} Min (Durchschnitt: ${avgText})`,
    ].join("\n");
  };

  const formatTrendpilotRange = () => {
    const relevant = trendpilotEntries.filter((entry) =>
      ["warning", "critical"].includes((entry.severity || "").toLowerCase()),
    );
    if (!relevant.length) {
      return "**Trendpilot**\n- Hinweise gesamt: keine";
    }
    const lines = ["**Trendpilot**"];
    const seen = new Set();
    const items: string[] = [];
    relevant.forEach((entry) => {
      const labelBase = entry.type || entry.source || "Trendpilot";
      const sevRaw = (entry.severity || "").toLowerCase();
      const sevLabel = sevRaw === "critical" ? "kritisch" : sevRaw === "warning" ? "warnung" : sevRaw || "";
      const windowLabel =
        entry.window_from && entry.window_to
          ? `${entry.window_from} bis ${entry.window_to}`
          : "Zeitraum n. a.";
      const key = `${labelBase}|${sevLabel}|${windowLabel}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(`- Hinweis: ${labelBase}${sevLabel ? ` (${sevLabel})` : ""} - ${windowLabel}`);
    });
    lines.push(`- Hinweise gesamt: ${items.length}`);
    lines.push(...items);
    return lines.join("\n");
  };

  const formatLabRange = () => {
    if (!labSeries.length) return "**Labor / Nierenfunktion**\n- Keine Labordaten im Zeitraum.";
    const latest = lab.latest || {};
    const egfr = toNumber(latest.egfr);
    const crea = toNumber(latest.creatinine);
    const stage = lab.ckdStage ? `CKD ${lab.ckdStage}` : null;
    const lines = [
      "**Labor / Nierenfunktion**",
      `- Letzte Kontrolle: ${latest.day || "unbekannt"}`,
      `- eGFR: ${egfr ?? "?"} ml/min`,
      `- Kreatinin: ${crea ?? "?"} mg/dl`,
      stage ? `- CKD-Stadium: ${stage}` : null,
    ].filter(Boolean) as string[];
    return lines.join("\n");
  };
  const textBlocks = isRangeReport
    ? ([
        formatPatientRange(),
        formatDataBasisRange(),
        formatLabRange(),
        formatBpRange(),
        formatBodyRange(),
        formatActivityRange(),
        formatTrendpilotRange(),
      ].filter(Boolean) as string[])
    : ([
        formatBpMonthly(),
        formatBodyMonthly(),
        formatLabMonthly(),
        formatActivityMonthly(),
      ].filter(Boolean) as string[]);
  const text = textBlocks.join("\n\n");
  const meta = {
    range,
    bp: {
      avg_sys: bp.avgSys,
      avg_dia: bp.avgDia,
      min_sys: bp.minSys,
      max_sys: bp.maxSys,
      min_dia: bp.minDia,
      max_dia: bp.maxDia,
      hypertensive_entries: bp.hypertensiveEntries,
      avg_pulse_pressure: bp.avgPulsePressure,
    },
    bp_30: reportType === "range_report" ? buildBpMeta(bp30, bp30From, range.to) : null,
    bp_180: reportType === "range_report" ? buildBpMeta(bp180, bp180From, range.to) : null,
    body: {
      avg_weight: body.avgWeight,
      first_weight: body.firstWeight,
      last_weight: body.lastWeight,
      min_weight: body.minWeight,
      max_weight: body.maxWeight,
      weight_delta: body.weightDelta,
      waist_delta: body.waistDelta,
    },
    body_range: reportType === "range_report" ? bodyRangeMeta : null,
    lab: {
      latest: lab.latest,
      previous: lab.previous,
      ckd_stage: lab.ckdStage,
    },
    activity: {
      count: activity.count,
      total_min: activity.totalMin,
      avg_min: activity.avgMin,
      days: activity.days,
      delta_count: activity.deltaCount,
      delta_total_min: activity.deltaTotalMin,
      last_day: reportType === "range_report" ? activityRangeMeta.last_day : null,
      per_week: reportType === "range_report" ? activityRangeMeta.per_week : null,
    },
    flags,
  };

  return { summary, text, meta };
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

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return responseOk();
  if (req.method !== "POST") {
    return responseJson({ error: "Method not allowed, use POST" }, 405);
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as RangeInput;
    const token = getBearerToken(req);
    let userId = "";
    if (payload.report_type === "monthly_report" && DEFAULT_USER_ID) {
      userId = DEFAULT_USER_ID;
    } else if (token) {
      const user = await requireUser(token);
      userId = user.id;
    } else if (DEFAULT_USER_ID) {
      userId = DEFAULT_USER_ID;
    } else {
      throw new Error("Authorization Header fehlt.");
    }

    if (!userId) {
      throw new Error("user_id fehlt (kein Token und keine Env gesetzt).");
    }

    const reportType = payload.report_type || "monthly_report";
    const range =
      reportType === "monthly_report"
        ? normalizeRange({ month: payload.month ?? null })
        : normalizeRange(payload);
    const prevRange =
      reportType === "monthly_report" ? previousMonthBounds(range.monthTag) : null;
    const bpRange30 =
      reportType === "range_report"
        ? { ...range, from: shiftIsoDate(range.to, -29), to: range.to }
        : null;
    const bpRange180 =
      reportType === "range_report"
        ? { ...range, from: shiftIsoDate(range.to, -179), to: range.to }
        : null;

    const activityPrevPromise =
      reportType === "monthly_report" && prevRange
        ? fetchSeries<ActivityEntry>("v_events_activity", userId, {
            ...range,
            from: prevRange.from,
            to: prevRange.to,
          })
        : Promise.resolve([]);
    const bp30Promise =
      reportType === "range_report" && bpRange30
        ? fetchSeries<BpEntry>("v_events_bp", userId, bpRange30)
        : Promise.resolve([]);
    const bp180Promise =
      reportType === "range_report" && bpRange180
        ? fetchSeries<BpEntry>("v_events_bp", userId, bpRange180)
        : Promise.resolve([]);

    const profilePromise =
      reportType === "range_report"
        ? supabase
            .from("user_profile")
            .select(
              [
                "full_name",
                "birth_date",
                "height_cm",
                "is_smoker",
                "medications",
              ].join(","),
            )
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null });

    const trendpilotPromise =
      reportType === "range_report"
        ? supabase
            .from("trendpilot_events_range")
            .select(
              [
                "id",
                "ts",
                "type",
                "severity",
                "source",
                "window_from",
                "window_to",
                "payload",
              ].join(","),
            )
            .eq("user_id", userId)
            .order("window_from", { ascending: false })
            .order("ts", { ascending: false })
        : Promise.resolve({ data: [], error: null });

    const [
      bpSeries,
      bpSeries30,
      bpSeries180,
      bodySeries,
      labSeries,
      activitySeries,
      activityPrevSeries,
      profileResult,
      trendpilotResult,
    ] = await Promise.all([
      fetchSeries<BpEntry>("v_events_bp", userId, range),
      bp30Promise,
      bp180Promise,
      fetchSeries<BodyEntry>("v_events_body", userId, range),
      fetchSeries<LabEntry>("v_events_lab", userId, range),
      fetchSeries<ActivityEntry>("v_events_activity", userId, range),
      activityPrevPromise,
      profilePromise,
      trendpilotPromise,
    ]);

    if (profileResult?.error) throw profileResult.error;
    if (trendpilotResult?.error) throw trendpilotResult.error;
    const profile = (profileResult?.data as ProfileRow | null) || null;
    const trendpilotEntries = Array.isArray(trendpilotResult?.data)
      ? (trendpilotResult.data as TrendpilotEntry[])
      : [];
    const generatedAt = new Date().toISOString();

    const narrative = buildNarrative({
      range,
      bpSeries,
      bpSeries30,
      bpSeries180,
      bodySeries,
      labSeries,
      activitySeries,
      activityPrevSeries,
      profile,
      trendpilotEntries,
      generatedAt,
      reportType,
    });

    const reportPayload = {
      subtype: reportType,
      month: range.monthTag,
      month_label: range.monthLabel,
      period: { from: range.from, to: range.to },
      report_type: reportType,
      summary: narrative.summary,
      text: narrative.text,
      meta: narrative.meta,
      generated_at: generatedAt,
      bp_series: bpSeries,
      body_series: bodySeries,
      lab_series: labSeries,
      activity_series: activitySeries,
    };

    if (reportType === "monthly_report") {
      const { data: existing, error: findErr } = await supabase
        .from("health_events")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "system_comment")
        .eq("payload->>subtype", "monthly_report")
        .eq("payload->>month", range.monthTag)
        .order("ts", { ascending: false })
        .limit(1);

      if (findErr) throw findErr;

      if (existing && existing.length) {
        const id = (existing[0] as { id: string }).id;

        const { data, error } = await supabase
          .from("health_events")
          .update({ payload: reportPayload })
          .eq("id", id)
          .select("id, day, ts, payload")
          .single();

        if (error) throw error;
        return responseJson({ report: data, range }, 200);
      }
    }

    const { data, error } = await supabase
        .from("health_events")
        .insert({
          user_id: userId,
          type: "system_comment",
          payload: reportPayload,
        })
      .select("id, day, ts, payload")
      .single();

    if (error) throw error;
    return responseJson({ report: data, range }, 200);
  } catch (err) {
    const message = serializeError(err);
    console.error("[midas-monthly-report] error:", message);
    return responseJson({ error: message }, 400);
  }
});


