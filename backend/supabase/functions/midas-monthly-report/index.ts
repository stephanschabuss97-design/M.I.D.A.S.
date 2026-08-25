import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  getIsoDayInTimeZone,
  NormalizedRange,
  readRangeReportRequest,
  readUserBearerToken,
  REPORT_TIME_ZONE as REPORT_TZ,
  RequestContractError,
  resolvePublicRequestErrorMessage,
  resolveRequestErrorStatus,
} from "./request-contract.ts";
import {
  buildAndPersistRangeReport,
  RangeReportRepository,
  RangeReportRow,
  RangeReportWrite,
} from "./report-lifecycle.ts";

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
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("[midas-monthly-report] Supabase env missing");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

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
};

type MedicationRow = {
  id: string;
  name: string | null;
  strength: string | null;
  with_meal: boolean | null;
};

type MedicationSlotRow = {
  id: string;
  med_id: string;
  slot_type: string | null;
  label: string | null;
  sort_order: number | null;
  qty_per_slot: number | null;
};

type RangeMedicationData = {
  medications: MedicationRow[];
  slots: MedicationSlotRow[];
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

const requireUser = async (token: string) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new RequestContractError(
      "Nutzer konnte nicht authentifiziert werden.",
      401,
    );
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
  {
    key: "high-normal",
    label: "Hoch-normal",
    color: "#facc15",
    sys: 130,
    dia: 85,
  },
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
  if (v < 65) {
    return { color: "#f97316", label: "MAP 60-64 mmHg (grenzwertig)" };
  }
  if (v <= 100) return { color: "#22c55e", label: "MAP 65-100 mmHg (normal)" };
  if (v <= 110) return { color: "#eab308", label: "MAP 101-110 mmHg (hoch)" };
  return { color: "#dc2626", label: "MAP > 110 mmHg (kritisch)" };
};

const classifyPulsePressure = (pp: number | null) => {
  const v = Number(pp);
  if (!Number.isFinite(v)) return null;
  if (v <= 29) {
    return { color: "#dc2626", label: "Pulsdruck <= 29 mmHg (sehr niedrig)" };
  }
  if (v <= 50) {
    return { color: "#22c55e", label: "Pulsdruck 30-50 mmHg (normal)" };
  }
  if (v <= 60) {
    return { color: "#eab308", label: "Pulsdruck 51-60 mmHg (grenzwertig)" };
  }
  if (v <= 70) {
    return { color: "#f97316", label: "Pulsdruck 61-70 mmHg (hoch)" };
  }
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

const calcAgeYears = (birthDateIso: string, refDateIso: string) => {
  const birth = new Date(`${birthDateIso}T00:00:00Z`);
  const ref = new Date(`${refDateIso}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime())) return null;
  let age = ref.getUTCFullYear() - birth.getUTCFullYear();
  const m = ref.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && ref.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
};

const MEDICATION_SLOT_LABELS: Record<string, string> = {
  morning: "Morgens",
  noon: "Mittags",
  evening: "Abends",
  night: "Nachts",
};

const MEDICATION_SLOT_LABEL_ALIASES: Record<string, string> = {
  morgen: "Morgens",
  morgens: "Morgens",
  früh: "Morgens",
  frueh: "Morgens",
  mittag: "Mittags",
  mittags: "Mittags",
  abend: "Abends",
  abends: "Abends",
  nacht: "Nachts",
  nachts: "Nachts",
};

const compactText = (value: unknown, fallback = "") => {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized || fallback;
};

const formatMedicationSlot = (slot: MedicationSlotRow) => {
  const slotType = compactText(slot.slot_type).toLowerCase();
  const fallbackKey = compactText(slot.label).toLocaleLowerCase("de-AT");
  const label = MEDICATION_SLOT_LABELS[slotType] ||
    MEDICATION_SLOT_LABEL_ALIASES[fallbackKey] ||
    "Einnahme";
  const qty = Number(slot.qty_per_slot);
  const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
  return `${label}: ${safeQty}`;
};

const formatRangeMedicationRows = (data: RangeMedicationData) => {
  const slotsByMedication = new Map<string, MedicationSlotRow[]>();
  data.slots.forEach((slot) => {
    const medId = compactText(slot.med_id);
    if (!medId) return;
    const current = slotsByMedication.get(medId) || [];
    current.push(slot);
    slotsByMedication.set(medId, current);
  });

  return data.medications
    .slice()
    .sort((a, b) => {
      const byName = compactText(a.name).localeCompare(
        compactText(b.name),
        "de-AT",
        { sensitivity: "base" },
      );
      return byName || compactText(a.id).localeCompare(compactText(b.id));
    })
    .map((medication) => {
      const details: string[] = [];
      const strength = compactText(medication.strength);
      if (strength) details.push(strength);

      const slots = (slotsByMedication.get(medication.id) || [])
        .slice()
        .sort((a, b) => {
          const orderA = Number.isFinite(Number(a.sort_order))
            ? Number(a.sort_order)
            : 0;
          const orderB = Number.isFinite(Number(b.sort_order))
            ? Number(b.sort_order)
            : 0;
          return orderA - orderB ||
            compactText(a.id).localeCompare(compactText(b.id));
        });
      details.push(
        slots.length
          ? slots.map(formatMedicationSlot).join(", ")
          : "Einnahmeplan nicht hinterlegt",
      );
      if (medication.with_meal) details.push("mit Mahlzeit");

      const name = compactText(medication.name, "Medikation");
      return `${name} (${details.join("; ")})`;
    });
};

const fetchRangeMedicationData = async (
  userId: string,
  reportDay: string,
): Promise<RangeMedicationData> => {
  const medicationsResult = await supabase
    .from("health_medications")
    .select("id,name,strength,with_meal")
    .eq("user_id", userId)
    .eq("active", true)
    .order("name", { ascending: true })
    .order("id", { ascending: true });
  if (medicationsResult.error) throw medicationsResult.error;

  const medications = Array.isArray(medicationsResult.data)
    ? (medicationsResult.data as MedicationRow[])
    : [];
  const medicationIds = medications
    .map((medication) => compactText(medication.id))
    .filter(Boolean);
  if (!medicationIds.length) return { medications, slots: [] };

  const slotsResult = await supabase
    .from("health_medication_schedule_slots")
    .select("id,med_id,slot_type,label,sort_order,qty_per_slot")
    .eq("user_id", userId)
    .eq("active", true)
    .in("med_id", medicationIds)
    .lte("start_date", reportDay)
    .or(`end_date.is.null,end_date.gte.${reportDay}`)
    .order("med_id", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (slotsResult.error) throw slotsResult.error;

  const slots = Array.isArray(slotsResult.data)
    ? (slotsResult.data as MedicationSlotRow[])
    : [];
  return { medications, slots };
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

  const warn = !validCount || avgSys === null || avgDia === null
    ? null
    : avgSys >= 135 ||
        avgDia >= 85 ||
        hypertensive >= Math.max(1, Math.ceil(validCount * 0.25))
    ? "Blutdruck auffällig"
    : null;

  let description = "Keine Blutdruckdaten im Zeitraum.";

  if (entries.length && !validCount) {
    description = "Blutdruckdaten vorhanden, aber unvollständig.";
  } else if (validCount) {
    const base = `Ø ${round(avgSys, 0)}/${
      round(avgDia, 0)
    } mmHg (${validCount} Messungen${me ? `, ${me}` : ""})`;
    const spread = `Spanne ${minSys ?? "?"}/${minDia ?? "?"} bis ${
      maxSys ?? "?"
    }/${maxDia ?? "?"} mmHg`;
    const high = hypertensive
      ? `${hypertensive} Messungen ≥ 135/85`
      : "keine auffälligen Spitzen";
    const ppNote = avgPP !== null
      ? `Pulsdruck Ø ${round(avgPP, 1)} mmHg`
      : null;

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

  const description = `Gewicht Ø ${
    round(avgW, 1) ?? "?"
  } kg (${entries.length} Einträge), Spanne ${minW ?? "?"}–${
    maxW ?? "?"
  } kg. Trend: ${
    formatDelta(
      dW,
      " kg",
      1,
    )
  }; Bauchumfang: ${formatDelta(dC, " cm", 1)}.`;

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

  const album = latest.albuminuria_category ||
    (acr !== null ? (acr >= 300 ? "A3" : acr >= 30 ? "A2" : "A1") : null);

  const warn = egfr !== null && egfr < 45
    ? "Nierenfunktion reduziert"
    : acr !== null && acr >= 300
    ? "Albuminurie erhöht"
    : null;

  const lines: string[] = [];
  lines.push(
    `Letzte Kontrolle ${latest.day || "unbekannt"}: eGFR ${
      egfr ?? "?"
    } ml/min, Kreatinin ${crea ?? "?"} mg/dl.`,
  );
  if (album) {
    lines.push(
      `Albuminurie: ${album}${acr !== null ? ` (${acr} mg/g)` : ""}.`,
    );
  }
  if (dEgfr !== null) {
    lines.push(
      `eGFR-Verlauf: ${
        formatDelta(
          dEgfr,
          " ml/min",
          1,
        )
      } gegenüber der vorherigen Messung.`,
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

const analyzeActivitySeries = (series: ActivityEntry[]) => {
  const count = series.length;
  const totalMin = series.reduce(
    (sum, row) => sum + (row.duration_min ?? 0),
    0,
  );
  const avgMin = count ? totalMin / count : null;
  const days = new Set(series.map((row) => row.day)).size;

  if (!count) {
    return {
      description: "Keine Aktivität erfasst.",
      count: 0,
      totalMin: 0,
      avgMin: null,
      days,
      deltaCount: null,
      deltaTotalMin: null,
    };
  }

  const avgText = avgMin !== null ? `Ø ${round(avgMin, 0)} Min` : "Ø n. a.";
  const baseText = `${count} Einträge, ${
    Math.round(totalMin)
  } Minuten gesamt, ${avgText}. Tage aktiv: ${days}.`;

  return {
    description: baseText,
    count,
    totalMin: Math.round(totalMin),
    avgMin: round(avgMin, 0),
    days,
    deltaCount: null,
    deltaTotalMin: null,
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
  profile,
  medicationData,
  trendpilotEntries,
}: {
  range: NormalizedRange;
  bpSeries: BpEntry[];
  bpSeries30: BpEntry[];
  bpSeries180: BpEntry[];
  bodySeries: BodyEntry[];
  labSeries: LabEntry[];
  activitySeries: ActivityEntry[];
  profile: ProfileRow | null;
  medicationData: RangeMedicationData;
  trendpilotEntries: TrendpilotEntry[];
}): NarrativeResult => {
  const bp = analyzeBpSeries(bpSeries);
  const bp30 = analyzeBpSeries(bpSeries30);
  const bp180 = analyzeBpSeries(bpSeries180);
  const body = analyzeBodySeries(bodySeries);
  const lab = analyzeLabSeries(labSeries);
  const activity = analyzeActivitySeries(activitySeries);

  const flags = [bp.warning, lab.warning].filter(Boolean) as string[];
  const summary = "";
  const fmtNum = (value: number | null | undefined, digits = 0) => {
    if (value === null || value === undefined) return "?";
    const rounded = round(value, digits);
    return rounded === null ? "?" : formatNumberDE(rounded, digits);
  };

  const bp30From = shiftIsoDate(range.to, -29);
  const bp180From = shiftIsoDate(range.to, -179);

  const buildBpMeta = (
    stats: ReturnType<typeof analyzeBpSeries>,
    from: string,
    to: string,
  ) => {
    const mapVal = stats.avgSys !== null && stats.avgDia !== null
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
    const weightEntries = bodySeries.filter((entry) =>
      toNumber(entry.kg) !== null
    );
    const waistEntries = bodySeries.filter((entry) =>
      toNumber(entry.cm) !== null
    );

    const firstWeightEntry = weightEntries[0] || null;
    const lastWeightEntry = weightEntries.length
      ? weightEntries[weightEntries.length - 1]
      : null;
    const firstWeight = firstWeightEntry ? toNumber(firstWeightEntry.kg) : null;
    const lastWeight = lastWeightEntry ? toNumber(lastWeightEntry.kg) : null;
    const weightDelta = firstWeight !== null && lastWeight !== null
      ? lastWeight - firstWeight
      : null;

    const firstWaistEntry = waistEntries[0] || null;
    const lastWaistEntry = waistEntries.length
      ? waistEntries[waistEntries.length - 1]
      : null;
    const firstWaist = firstWaistEntry ? toNumber(firstWaistEntry.cm) : null;
    const lastWaist = lastWaistEntry ? toNumber(lastWaistEntry.cm) : null;
    const waistDelta = firstWaist !== null && lastWaist !== null
      ? lastWaist - firstWaist
      : null;

    const heightCm = profile?.height_cm ?? null;
    const lastBmi = lastWeight !== null && heightCm
      ? lastWeight / Math.pow(heightCm / 100, 2)
      : null;
    const firstBmi = firstWeight !== null && heightCm
      ? firstWeight / Math.pow(heightCm / 100, 2)
      : null;
    const bmiDelta = lastBmi !== null && firstBmi !== null
      ? lastBmi - firstBmi
      : null;

    const lastWhtr = lastWaist !== null && heightCm
      ? lastWaist / heightCm
      : null;
    const firstWhtr = firstWaist !== null && heightCm
      ? firstWaist / heightCm
      : null;
    const whtrDelta = lastWhtr !== null && firstWhtr !== null
      ? lastWhtr - firstWhtr
      : null;

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

  const formatPatientRange = () => {
    const medications = formatRangeMedicationRows(medicationData);
    const medicationLabel = medications.length
      ? medications.join("; ")
      : "keine aktiven Medikamente hinterlegt.";
    if (!profile) {
      return [
        "**Patient**",
        "- Keine Profildaten vorhanden.",
        `- Derzeitige Medikation: ${medicationLabel}`,
      ].join("\n");
    }
    const birth = profile.birth_date ? formatDateDE(profile.birth_date) : "-";
    const age = profile.birth_date
      ? calcAgeYears(profile.birth_date, range.to)
      : null;
    const birthLabel = birth !== "-"
      ? `${birth}${age !== null ? ` (${age} Jahre)` : ""}`
      : "-";
    const height = typeof profile.height_cm === "number"
      ? `${profile.height_cm} cm`
      : "-";
    const smoker = profile.is_smoker === null
      ? "-"
      : profile.is_smoker
      ? "Raucher"
      : "Nichtraucher";
    return [
      "**Patient**",
      `- Name: ${profile.full_name || "-"}`,
      `- Geburtsdatum: ${birthLabel}`,
      `- Größe: ${height}`,
      `- Raucherstatus: ${smoker}`,
      `- Derzeitige Medikation: ${medicationLabel}`,
    ].join("\n");
  };

  const formatDataBasisRange = () => {
    const me = describeMorningEvening(bpSeries);
    const bpCount = bpSeries.length
      ? `${bpSeries.length} Messungen${me ? ` (${me})` : ""}`
      : "0 Messungen";
    const bodyCount = bodySeries.length
      ? `${bodySeries.length} Messungen`
      : "0 Messungen";
    const labCount = `${labSeries.length} Kontrolle${
      labSeries.length === 1 ? "" : "n"
    }`;
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
        return [
          header,
          `- Zeitraum: ${period}`,
          `- Keine Messungen im Zeitraum.`,
        ];
      }
      const mapVal = stats.avgSys !== null && stats.avgDia !== null
        ? round((stats.avgSys + 2 * stats.avgDia) / 3, 0)
        : null;
      const lines = [
        header,
        `- Zeitraum: ${period}`,
        `- Durchschnitt: ${fmtNum(stats.avgSys, 0)}/${
          fmtNum(stats.avgDia, 0)
        } mmHg`,
        `- Spanne: ${fmtNum(stats.minSys, 0)}/${fmtNum(stats.minDia, 0)} bis ${
          fmtNum(stats.maxSys, 0)
        }/${fmtNum(stats.maxDia, 0)} mmHg`,
        mapVal !== null
          ? `- MAP (Durchschnitt): ${fmtNum(mapVal, 0)} mmHg`
          : null,
        stats.avgPulsePressure !== null
          ? `- Pulsdruck (Durchschnitt): ${
            fmtNum(stats.avgPulsePressure, 0)
          } mmHg`
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
    if (!bodySeries.length) {
      return "**Körperzusammensetzung**\n- Keine Körperdaten im Zeitraum.";
    }
    const changeLabel = (dateLabel: string) =>
      dateLabel && dateLabel !== "-"
        ? `Änderung seit ${dateLabel}`
        : "Änderung seit Start";
    const firstWeightDate = formatDateDE(bodyRangeMeta.first_weight_day);
    const lastWeightDate = formatDateDE(bodyRangeMeta.last_weight_day);
    const firstWaistDate = formatDateDE(bodyRangeMeta.first_waist_day);
    const lastWaistDate = formatDateDE(bodyRangeMeta.last_waist_day);

    const lines = [
      "**Körperzusammensetzung**",
      `- Zeitraum: ${formatDateDE(range.from)} bis ${formatDateDE(range.to)}`,
      bodyRangeMeta.last_weight !== null
        ? `- Gewicht: letzter Wert ${
          fmtNum(bodyRangeMeta.last_weight, 1)
        } kg (${lastWeightDate}), ${changeLabel(firstWeightDate)}: ${
          formatDelta(bodyRangeMeta.weight_delta, " kg", 1)
        }`
        : "- Gewicht: keine Daten.",
      bodyRangeMeta.last_waist !== null
        ? `- Bauchumfang: letzter Wert ${
          fmtNum(bodyRangeMeta.last_waist, 1)
        } cm (${lastWaistDate}), ${changeLabel(firstWaistDate)}: ${
          formatDelta(bodyRangeMeta.waist_delta, " cm", 1)
        }`
        : "- Bauchumfang: keine Daten.",
      bodyRangeMeta.whtr_last !== null
        ? `- WHtR: letzter Wert ${
          fmtNum(bodyRangeMeta.whtr_last, 2)
        } (${lastWaistDate}), ${changeLabel(firstWaistDate)}: ${
          formatDelta(bodyRangeMeta.whtr_delta, "", 2)
        }`
        : "- WHtR: keine Daten.",
      bodyRangeMeta.bmi_last !== null
        ? `- BMI: letzter Wert ${
          fmtNum(bodyRangeMeta.bmi_last, 1)
        } (${lastWeightDate}), ${changeLabel(firstWeightDate)}: ${
          formatDelta(bodyRangeMeta.bmi_delta, "", 1)
        }`
        : "- BMI: keine Daten.",
    ].filter(Boolean) as string[];
    return lines.join("\n");
  };
  const formatActivityRange = () => {
    if (!activity.count) return "**Aktivität**\n- Keine Einträge im Zeitraum.";
    const perWeek = activityRangeMeta.per_week;
    const perWeekText = perWeek !== null ? fmtNum(perWeek, 1) : "n. a.";
    const avgText = activity.avgMin !== null
      ? `${fmtNum(activity.avgMin, 0)} Min/Eintrag`
      : "n. a.";
    return [
      "**Aktivität**",
      `- Letzte Aktivität: ${formatDateDE(activityRangeMeta.last_day)}`,
      `- Trainings/Woche: ${perWeekText}`,
      `- Gesamtdauer: ${activity.totalMin} Min (Durchschnitt: ${avgText})`,
    ].join("\n");
  };

  const formatTrendpilotRange = () => {
    const relevant = trendpilotEntries.filter((entry) =>
      ["warning", "critical"].includes((entry.severity || "").toLowerCase())
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
      const sevLabel = sevRaw === "critical"
        ? "kritisch"
        : sevRaw === "warning"
        ? "warnung"
        : sevRaw || "";
      const windowLabel = entry.window_from && entry.window_to
        ? `${entry.window_from} bis ${entry.window_to}`
        : "Zeitraum n. a.";
      const key = `${labelBase}|${sevLabel}|${windowLabel}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(
        `- Hinweis: ${labelBase}${
          sevLabel ? ` (${sevLabel})` : ""
        } - ${windowLabel}`,
      );
    });
    lines.push(`- Hinweise gesamt: ${items.length}`);
    lines.push(...items);
    return lines.join("\n");
  };

  const formatLabRange = () => {
    if (!labSeries.length) {
      return "**Labor / Nierenfunktion**\n- Keine Labordaten im Zeitraum.";
    }
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
  const textBlocks = [
    formatPatientRange(),
    formatDataBasisRange(),
    formatLabRange(),
    formatBpRange(),
    formatBodyRange(),
    formatActivityRange(),
    formatTrendpilotRange(),
  ].filter(Boolean) as string[];
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
    bp_30: buildBpMeta(bp30, bp30From, range.to),
    bp_180: buildBpMeta(bp180, bp180From, range.to),
    body: {
      avg_weight: body.avgWeight,
      first_weight: body.firstWeight,
      last_weight: body.lastWeight,
      min_weight: body.minWeight,
      max_weight: body.maxWeight,
      weight_delta: body.weightDelta,
      waist_delta: body.waistDelta,
    },
    body_range: bodyRangeMeta,
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
      last_day: activityRangeMeta.last_day,
      per_week: activityRangeMeta.per_week,
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

const reportRepository: RangeReportRepository = {
  find: async (userId: string) => {
    const { data, error } = await supabase
      .from("health_events")
      .select("id,day,ts,payload")
      .eq("user_id", userId)
      .eq("type", "system_comment")
      .eq("payload->>subtype", "range_report")
      .order("ts", { ascending: false })
      .order("id", { ascending: false })
      .limit(2);
    if (error) throw error;
    return (data as RangeReportRow[] | null) || [];
  },
  insert: async (
    userId: string,
    write: RangeReportWrite,
  ) => {
    const { data, error } = await supabase
      .from("health_events")
      .insert({
        user_id: userId,
        ts: write.ts,
        type: "system_comment",
        payload: write.payload,
      })
      .select("id,day,ts,payload")
      .single();
    if (error) throw error;
    return data as RangeReportRow;
  },
  update: async (
    userId: string,
    id: string,
    write: RangeReportWrite,
  ) => {
    const { data, error } = await supabase
      .from("health_events")
      .update({
        ts: write.ts,
        payload: write.payload,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .eq("type", "system_comment")
      .eq("payload->>subtype", "range_report")
      .select("id,day,ts,payload")
      .maybeSingle();
    if (error) throw error;
    return data as RangeReportRow | null;
  },
};

// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return responseOk();
  if (req.method !== "POST") {
    return responseJson({ error: "Method not allowed, use POST" }, 405);
  }

  try {
    const token = readUserBearerToken(req, SERVICE_ROLE_KEY);
    const user = await requireUser(token);
    const userId = user.id;
    const { range, reportAnchorTs } = await readRangeReportRequest(req);
    const medicationReportDay = getIsoDayInTimeZone(new Date(), REPORT_TZ);
    const bpRange30 = {
      from: shiftIsoDate(range.to, -29),
      to: range.to,
    };
    const bpRange180 = {
      from: shiftIsoDate(range.to, -179),
      to: range.to,
    };

    const profilePromise = supabase
      .from("user_profile")
      .select(
        [
          "full_name",
          "birth_date",
          "height_cm",
          "is_smoker",
        ].join(","),
      )
      .eq("user_id", userId)
      .maybeSingle();

    const trendpilotPromise = supabase
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
      .order("ts", { ascending: false });

    const [
      bpSeries,
      bpSeries30,
      bpSeries180,
      bodySeries,
      labSeries,
      activitySeries,
      medicationData,
      profileResult,
      trendpilotResult,
    ] = await Promise.all([
      fetchSeries<BpEntry>("v_events_bp", userId, range),
      fetchSeries<BpEntry>("v_events_bp", userId, bpRange30),
      fetchSeries<BpEntry>("v_events_bp", userId, bpRange180),
      fetchSeries<BodyEntry>("v_events_body", userId, range),
      fetchSeries<LabEntry>("v_events_lab", userId, range),
      fetchSeries<ActivityEntry>("v_events_activity", userId, range),
      fetchRangeMedicationData(userId, medicationReportDay),
      profilePromise,
      trendpilotPromise,
    ]);

    if (profileResult?.error) throw profileResult.error;
    if (trendpilotResult?.error) throw trendpilotResult.error;
    const profile = (profileResult?.data as ProfileRow | null) || null;
    const trendpilotEntries = Array.isArray(trendpilotResult?.data)
      ? (trendpilotResult.data as unknown as TrendpilotEntry[])
      : [];
    const generatedAt = new Date().toISOString();

    const report = await buildAndPersistRangeReport({
      repository: reportRepository,
      userId,
      reportAnchorTs,
      expectedDay: range.to,
      generatedAt,
      buildPayload: () => {
        const narrative = buildNarrative({
          range,
          bpSeries,
          bpSeries30,
          bpSeries180,
          bodySeries,
          labSeries,
          activitySeries,
          profile,
          medicationData,
          trendpilotEntries,
        });

        return {
          subtype: "range_report",
          period: { from: range.from, to: range.to },
          report_type: "range_report",
          summary: narrative.summary,
          text: narrative.text,
          meta: narrative.meta,
          bp_series: bpSeries,
          body_series: bodySeries,
          lab_series: labSeries,
          activity_series: activitySeries,
        };
      },
    });
    return responseJson(
      { report, range, report_anchor_ts: reportAnchorTs },
      200,
    );
  } catch (err) {
    const message = serializeError(err);
    console.error("[midas-monthly-report] error:", message);
    const status = resolveRequestErrorStatus(err);
    return responseJson(
      { error: resolvePublicRequestErrorMessage(err) },
      status,
    );
  }
});
