// @ts-ignore - Supabase Edge/Deno resolves this JSR side-effect import at runtime.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore - Local TS servers may not resolve this JSR import; Deno/Supabase does.
import { createClient } from "jsr:@supabase/supabase-js@2";
// @ts-ignore - Supabase Edge/Deno supports npm: imports; the local TS server does not.
import webpush from "npm:web-push@3.6.6";

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
const DEFAULT_USER_ID = Deno.env.get("INCIDENTS_USER_ID") ?? "";
const INCIDENTS_TZ = Deno.env.get("INCIDENTS_TZ") ?? "Europe/Vienna";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@midas.local";
const INCIDENT_VIBRATE_PATTERN = [300, 150, 300, 150, 600];
const INCIDENT_ACTIONS = [
  {
    action: "open-incident",
    title: "Jetzt oeffnen",
  },
];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("[midas-incident-push] Supabase env missing");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type TriggerKind = "scheduler" | "manual";
type WindowKind = "med" | "bp" | "all";
type ModeKind = "incidents" | "diagnostic";
type Severity = "reminder" | "incident";
type MedicationSection = "morning" | "noon" | "evening" | "night";
type MedicationType =
  | "medication_morning"
  | "medication_noon"
  | "medication_evening"
  | "medication_night";
type PushType = MedicationType | "bp_evening";

type IncidentPushInput = {
  trigger?: TriggerKind | null;
  user_id?: string | null;
  window?: WindowKind | null;
  mode?: ModeKind | null;
  dry_run?: boolean | null;
  now?: string | null;
};

type NormalizedInput = {
  trigger: TriggerKind;
  userId: string | null;
  window: WindowKind;
  mode: ModeKind;
  dryRun: boolean;
  now: Date;
};

type SubscriptionRow = {
  id?: string | null;
  user_id?: string | null;
  endpoint?: string | null;
  p256dh?: string | null;
  auth?: string | null;
  subscription?: Record<string, unknown> | null;
  disabled?: boolean | null;
  consecutive_remote_failures?: number | null;
  endpoint_hash?: string | null;
  client_context?: string | null;
  client_platform?: string | null;
  client_browser?: string | null;
  client_label?: string | null;
};

type MedicationRow = {
  id?: string | null;
};

type SlotRow = {
  id?: string | null;
  med_id?: string | null;
  slot_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  active?: boolean | null;
};

type SlotEventRow = {
  slot_id?: string | null;
};

type MedicationOpenDebug = {
  activeMedCount: number;
  activeMedWithValidSlotsCount: number;
  validSlotCount: number;
  takenEventCount: number;
  fallbackMorningBecauseMissingSlots: boolean;
  invalidSlotTypeCount: number;
  bySection: Record<
    MedicationSection,
    {
      validSlots: number;
      takenSlots: number;
      openSlots: number;
    }
  >;
};

type DeliveryRow = {
  type?: string | null;
  severity?: string | null;
};

type WebPushSub = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type DueEvent = {
  type: PushType;
  severity: Severity;
  title: string;
  body: string;
  tag: string;
};

type SkippedEvent = {
  type: PushType;
  severity?: Severity;
  reason: string;
  nextDueLocal?: string;
};

const MEDICATION_SECTION_ORDER: MedicationSection[] = ["morning", "noon", "evening", "night"];

const MEDICATION_RULES: Record<
  MedicationSection,
  {
    type: MedicationType;
    reminderAfter: { hour: number; minute: number };
    incidentAfter: { hour: number; minute: number };
    reminderTitle: string;
    reminderBody: string;
    incidentTitle: string;
    incidentBody: string;
  }
> = {
  morning: {
    type: "medication_morning",
    reminderAfter: { hour: 10, minute: 0 },
    incidentAfter: { hour: 12, minute: 0 },
    reminderTitle: "Morgenmedikation noch nicht erfasst?",
    reminderBody: "Falls noch offen: bitte kurz bestaetigen.",
    incidentTitle: "Morgenmedikation weiterhin offen",
    incidentBody: "Bitte jetzt pruefen und bestaetigen.",
  },
  noon: {
    type: "medication_noon",
    reminderAfter: { hour: 14, minute: 0 },
    incidentAfter: { hour: 16, minute: 0 },
    reminderTitle: "Mittagmedikation noch nicht erfasst?",
    reminderBody: "Falls noch offen: bitte kurz bestaetigen.",
    incidentTitle: "Mittagmedikation weiterhin offen",
    incidentBody: "Bitte jetzt pruefen und bestaetigen.",
  },
  evening: {
    type: "medication_evening",
    reminderAfter: { hour: 20, minute: 0 },
    incidentAfter: { hour: 22, minute: 0 },
    reminderTitle: "Abendmedikation noch nicht erfasst?",
    reminderBody: "Falls noch offen: bitte kurz bestaetigen.",
    incidentTitle: "Abendmedikation weiterhin offen",
    incidentBody: "Bitte jetzt pruefen und bestaetigen.",
  },
  night: {
    type: "medication_night",
    reminderAfter: { hour: 22, minute: 30 },
    incidentAfter: { hour: 23, minute: 30 },
    reminderTitle: "Nachtmedikation noch nicht erfasst?",
    reminderBody: "Falls noch offen: bitte kurz bestaetigen.",
    incidentTitle: "Nachtmedikation weiterhin offen",
    incidentBody: "Bitte jetzt pruefen und bestaetigen.",
  },
};

const BP_RULE = {
  type: "bp_evening" as const,
  incidentAfter: { hour: 20, minute: 0 },
  title: "Abend-Blutdruck noch offen",
  body: "Falls noch ausstehend: bitte heute Abend noch messen.",
};

const responseJson = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const responseOk = () => new Response("ok", { headers: corsHeaders });

const formatError = (err: unknown) => {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch (_) {
    return String(err);
  }
};

const formatSafePushError = (err: unknown) => {
  const statusCode = Number((err as { statusCode?: number })?.statusCode || 0);
  const status = statusCode ? `status=${statusCode}` : "";
  const message = formatError(err)
    .replace(/https?:\/\/[^\s"')]+/gi, "[url]")
    .replace(/\s+/g, " ")
    .slice(0, 180);
  return [status, message].filter(Boolean).join(" ");
};

const compactHash = (value: unknown) => {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 12) return text;
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
};

const getBearerToken = (req: Request) => {
  const h = req.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return h || null;
};

const getDatePartsInTz = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(pick("year") || "0"),
    month: Number(pick("month") || "0"),
    day: Number(pick("day") || "0"),
    hour: Number(pick("hour") || "0"),
    minute: Number(pick("minute") || "0"),
  };
};

const toDayIsoTz = (date: Date, timeZone: string) => {
  const parts = getDatePartsInTz(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
};

const toMinutes = (hour: number, minute = 0) => (hour * 60) + minute;

const formatLocalTime = (hour: number, minute = 0) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

const normalizeInput = (raw: IncidentPushInput): NormalizedInput => {
  const trigger = raw.trigger === "manual" || raw.trigger === "scheduler" ? raw.trigger : "scheduler";
  const window = raw.window === "med" || raw.window === "bp" || raw.window === "all" ? raw.window : "all";
  const mode = raw.mode === "diagnostic" ? "diagnostic" : "incidents";
  const dryRun = Boolean(raw.dry_run);
  const now = raw.now ? new Date(raw.now) : new Date();
  return {
    trigger,
    userId: raw.user_id?.trim() || null,
    window,
    mode,
    dryRun,
    now,
  };
};

const normalizeMedicationSection = (value: unknown): MedicationSection | "" => {
  const normalized = String(value || "").trim().toLowerCase();
  return MEDICATION_SECTION_ORDER.includes(normalized as MedicationSection)
    ? (normalized as MedicationSection)
    : "";
};

const createMedicationOpenState = () => ({
  morning: false,
  noon: false,
  evening: false,
  night: false,
});

const createMedicationOpenDebug = (): MedicationOpenDebug => ({
  activeMedCount: 0,
  activeMedWithValidSlotsCount: 0,
  validSlotCount: 0,
  takenEventCount: 0,
  fallbackMorningBecauseMissingSlots: false,
  invalidSlotTypeCount: 0,
  bySection: {
    morning: { validSlots: 0, takenSlots: 0, openSlots: 0 },
    noon: { validSlots: 0, takenSlots: 0, openSlots: 0 },
    evening: { validSlots: 0, takenSlots: 0, openSlots: 0 },
    night: { validSlots: 0, takenSlots: 0, openSlots: 0 },
  },
});

const buildDeliveryKey = (type: PushType, severity: Severity) => `${type}::${severity}`;

const isSlotActiveForDay = (slot: SlotRow, dayIso: string) => {
  const start = String(slot.start_date || "");
  const end = String(slot.end_date || "");
  if (!start || start > dayIso) return false;
  if (end && end < dayIso) return false;
  return slot.active !== false;
};

const buildPayload = (event: DueEvent, dayIso: string) => {
  const isIncident = event.severity === "incident";
  return {
    title: event.title,
    body: event.body,
    tag: event.tag,
    data: {
      type: event.type,
      severity: event.severity,
      dayIso,
      source: "remote",
    },
    renotify: false,
    silent: false,
    requireInteraction: isIncident,
    ...(isIncident ? { vibrate: INCIDENT_VIBRATE_PATTERN, actions: INCIDENT_ACTIONS } : {}),
  };
};

const resolveUserIds = async (explicitUserId: string | null) => {
  if (explicitUserId) return [explicitUserId];
  if (DEFAULT_USER_ID) return [DEFAULT_USER_ID];
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("user_id")
    .neq("user_id", "")
    .neq("disabled", true);
  if (error) throw new Error(`[push_subscriptions] ${error.message}`);
  const unique = new Set<string>();
  (data || []).forEach((row: { user_id?: string | null }) => {
    if (row.user_id) unique.add(row.user_id);
  });
  return Array.from(unique);
};

const fetchSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select(
      "id,user_id,endpoint,p256dh,auth,subscription,disabled,consecutive_remote_failures,endpoint_hash,client_context,client_platform,client_browser,client_label"
    )
    .eq("user_id", userId)
    .neq("disabled", true);
  if (error) throw new Error(`[push_subscriptions] ${error.message}`);
  return (data || []) as SubscriptionRow[];
};

const buildSubscriptionDiagnosticSummary = (row: SubscriptionRow) => ({
  endpointHash: compactHash(row.endpoint_hash),
  clientContext: row.client_context || "unknown",
  clientPlatform: row.client_platform || "unknown",
  clientBrowser: row.client_browser || "unknown",
  clientLabel: row.client_label || "",
});

const buildWebPushSub = (row: SubscriptionRow): WebPushSub | null => {
  if (row.subscription && typeof row.subscription === "object") {
    const sub = row.subscription as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (sub.endpoint && sub.keys?.p256dh && sub.keys?.auth) {
      return { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } };
    }
  }
  if (row.endpoint && row.p256dh && row.auth) {
    return { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
  }
  return null;
};

const fetchMedicationOpenBySection = async (userId: string, dayIso: string) => {
  const sections = createMedicationOpenState();
  const debug = createMedicationOpenDebug();

  const medsResult = await supabase
    .from("health_medications")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true);
  if (medsResult.error) throw new Error(`[health_medications] ${medsResult.error.message}`);
  const meds = (medsResult.data || []) as MedicationRow[];
  debug.activeMedCount = meds.length;
  if (!meds.length) return { sections, debug };

  const activeMedIds = new Set(
    meds
      .map((row) => String(row.id || ""))
      .filter(Boolean)
  );
  if (!activeMedIds.size) return { sections, debug };

  const slotsResult = await supabase
    .from("health_medication_schedule_slots")
    .select("id,med_id,slot_type,start_date,end_date,active")
    .eq("user_id", userId)
    .eq("active", true);
  if (slotsResult.error) {
    throw new Error(`[health_medication_schedule_slots] ${slotsResult.error.message}`);
  }
  const validSlots = ((slotsResult.data || []) as SlotRow[])
    .filter((slot) => {
      const medId = String(slot.med_id || "");
      return activeMedIds.has(medId) && isSlotActiveForDay(slot, dayIso);
    });
  debug.validSlotCount = validSlots.length;

  const takenResult = await supabase
    .from("health_medication_slot_events")
    .select("slot_id")
    .eq("user_id", userId)
    .eq("day", dayIso);
  if (takenResult.error) {
    throw new Error(`[health_medication_slot_events] ${takenResult.error.message}`);
  }
  const takenSet = new Set(
    ((takenResult.data || []) as SlotEventRow[])
      .map((row) => String(row.slot_id || ""))
      .filter(Boolean)
  );
  debug.takenEventCount = takenSet.size;

  const medsWithValidSlots = new Set<string>();
  validSlots.forEach((slot) => {
    const medId = String(slot.med_id || "");
    const slotId = String(slot.id || "");
    if (!medId || !slotId) return;
    medsWithValidSlots.add(medId);
    const section = normalizeMedicationSection(slot.slot_type);
    if (!section) {
      debug.invalidSlotTypeCount += 1;
      return;
    }
    debug.bySection[section].validSlots += 1;
    if (takenSet.has(slotId)) {
      debug.bySection[section].takenSlots += 1;
      return;
    }
    debug.bySection[section].openSlots += 1;
    sections[section] = true;
  });
  debug.activeMedWithValidSlotsCount = medsWithValidSlots.size;

  if (medsWithValidSlots.size < activeMedIds.size) {
    sections.morning = true;
    debug.fallbackMorningBecauseMissingSlots = true;
    debug.bySection.morning.openSlots += 1;
  }

  return { sections, debug };
};

const fetchBpState = async (userId: string, dayIso: string) => {
  const { data, error } = await supabase
    .from("v_events_bp")
    .select("ctx")
    .eq("user_id", userId)
    .eq("day", dayIso);
  if (error) throw new Error(`[v_events_bp] ${error.message}`);
  const rows = data || [];
  const morning = rows.some((row: { ctx?: string | null }) => (row.ctx || "").toLowerCase().startsWith("m"));
  const evening = rows.some((row: { ctx?: string | null }) => (row.ctx || "").toLowerCase().startsWith("a"));
  return { morning, evening };
};

const fetchRecordedDeliveries = async (userId: string, dayIso: string) => {
  const { data, error } = await supabase
    .from("push_notification_deliveries")
    .select("type,severity")
    .eq("user_id", userId)
    .eq("day", dayIso)
    .eq("source", "remote");
  if (error) throw new Error(`[push_notification_deliveries] ${error.message}`);
  const keys = new Set<string>();
  ((data || []) as DeliveryRow[]).forEach((row) => {
    const type = String(row.type || "");
    const severity = String(row.severity || "") as Severity;
    if (!type || (severity !== "reminder" && severity !== "incident")) return;
    keys.add(buildDeliveryKey(type as PushType, severity));
  });
  return keys;
};

const recordDelivery = async ({
  userId,
  dayIso,
  event,
  deliveredSubscriptionCount,
  trigger,
}: {
  userId: string;
  dayIso: string;
  event: DueEvent;
  deliveredSubscriptionCount: number;
  trigger: TriggerKind;
}) => {
  const { error } = await supabase
    .from("push_notification_deliveries")
    .upsert(
      {
        user_id: userId,
        day: dayIso,
        type: event.type,
        severity: event.severity,
        source: "remote",
        tag: event.tag,
        trigger,
        delivered_subscription_count: deliveredSubscriptionCount,
        sent_at: new Date().toISOString(),
      },
      { onConflict: "user_id,day,type,severity,source" }
    );
  if (error) throw new Error(`[push_notification_deliveries] ${error.message}`);
};

const updateSubscriptionSuccess = async (row: SubscriptionRow) => {
  if (!row.id) return;
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("push_subscriptions")
    .update({
      last_remote_attempt_at: nowIso,
      last_remote_success_at: nowIso,
      last_remote_failure_reason: null,
      consecutive_remote_failures: 0,
      disabled: false,
    })
    .eq("id", row.id);
  if (error) throw new Error(`[push_subscriptions] ${error.message}`);
};

const updateSubscriptionFailure = async (row: SubscriptionRow, err: unknown) => {
  if (!row.id) return;
  const statusCode = Number((err as { statusCode?: number })?.statusCode || 0);
  const disable = statusCode === 404 || statusCode === 410;
  const nowIso = new Date().toISOString();
  const nextFailures = Math.max(0, Number(row.consecutive_remote_failures || 0)) + 1;
  const { error } = await supabase
    .from("push_subscriptions")
    .update({
      last_remote_attempt_at: nowIso,
      last_remote_failure_at: nowIso,
      last_remote_failure_reason: formatSafePushError(err),
      consecutive_remote_failures: nextFailures,
      ...(disable ? { disabled: true } : {}),
    })
    .eq("id", row.id);
  if (error) throw new Error(`[push_subscriptions] ${error.message}`);
  row.consecutive_remote_failures = nextFailures;
  if (disable) row.disabled = true;
};

const updateSubscriptionDiagnosticSuccess = async (row: SubscriptionRow, nowIso: string) => {
  if (!row.id) return;
  const { error } = await supabase
    .from("push_subscriptions")
    .update({
      last_diagnostic_attempt_at: nowIso,
      last_diagnostic_success_at: nowIso,
      last_diagnostic_failure_reason: null,
    })
    .eq("id", row.id);
  if (error) throw new Error(`[push_subscriptions] ${error.message}`);
};

const updateSubscriptionDiagnosticFailure = async (row: SubscriptionRow, err: unknown, nowIso: string) => {
  if (!row.id) return;
  const { error } = await supabase
    .from("push_subscriptions")
    .update({
      last_diagnostic_attempt_at: nowIso,
      last_diagnostic_failure_at: nowIso,
      last_diagnostic_failure_reason: formatSafePushError(err),
    })
    .eq("id", row.id);
  if (error) throw new Error(`[push_subscriptions] ${error.message}`);
};

const sendPush = async (sub: WebPushSub, payload: Record<string, unknown>) => {
  const body = JSON.stringify(payload);
  await webpush.sendNotification(sub, body);
};

const buildDiagnosticPayload = (evaluatedAtUtc: string) => ({
  title: "MIDAS Push-Test",
  body: "Technische Benachrichtigung erfolgreich.",
  tag: `midas-diagnostic-push-${evaluatedAtUtc.slice(0, 10)}`,
  data: {
    type: "diagnostic_push",
    source: "diagnostic",
    evaluatedAtUtc,
  },
  renotify: false,
  silent: false,
  requireInteraction: false,
});

const runDiagnosticPush = async ({
  userIds,
  evaluatedAtUtc,
  dryRun,
}: {
  userIds: string[];
  evaluatedAtUtc: string;
  dryRun: boolean;
}) => {
  const results: Record<string, unknown>[] = [];
  for (const userId of userIds) {
    const subscriptions = await fetchSubscriptions(userId);
    const activeSubs = subscriptions
      .map((row) => ({ row, sub: buildWebPushSub(row) }))
      .filter((entry): entry is { row: SubscriptionRow; sub: WebPushSub } => !!entry.sub);

    if (!activeSubs.length) {
      results.push({ userId, status: "no-subscriptions" });
      continue;
    }

    if (dryRun) {
      results.push({
        userId,
        status: "dry-run",
        targetSubscriptions: activeSubs.length,
        subscriptions: activeSubs.map(({ row }) => buildSubscriptionDiagnosticSummary(row)),
      });
      continue;
    }

    const payload = buildDiagnosticPayload(evaluatedAtUtc);
    const sent: Record<string, unknown>[] = [];
    const failed: Record<string, unknown>[] = [];

    for (const { row, sub } of activeSubs) {
      if (row.disabled === true) continue;
      const nowIso = new Date().toISOString();
      const subscription = buildSubscriptionDiagnosticSummary(row);
      try {
        await sendPush(sub, payload);
        await updateSubscriptionDiagnosticSuccess(row, nowIso);
        sent.push(subscription);
      } catch (err) {
        const error = formatSafePushError(err);
        await updateSubscriptionDiagnosticFailure(row, err, nowIso);
        failed.push({
          ...subscription,
          error,
        });
      }
    }

    results.push({
      userId,
      status: sent.length ? "diagnostic-sent" : "diagnostic-failed",
      sentSubscriptions: sent.length,
      failedSubscriptions: failed.length,
      sent,
      failed,
    });
  }
  return results;
};

const resolveMedicationDueEvents = ({
  openBySection,
  minutesNow,
  deliveredKeys,
  dayIso,
  skipped,
}: {
  openBySection: Record<MedicationSection, boolean>;
  minutesNow: number;
  deliveredKeys: Set<string>;
  dayIso: string;
  skipped?: SkippedEvent[];
}) => {
  const events: DueEvent[] = [];
  for (const section of MEDICATION_SECTION_ORDER) {
    const rule = MEDICATION_RULES[section];
    if (!openBySection[section]) {
      skipped?.push({
        type: rule.type,
        reason: "section-not-open",
      });
      continue;
    }
    const reminderAt = toMinutes(rule.reminderAfter.hour, rule.reminderAfter.minute);
    const incidentAt = toMinutes(rule.incidentAfter.hour, rule.incidentAfter.minute);
    let severity: Severity | "" = "";
    if (minutesNow >= incidentAt) {
      severity = "incident";
    } else if (minutesNow >= reminderAt) {
      severity = "reminder";
    }
    if (!severity) {
      skipped?.push({
        type: rule.type,
        severity: "reminder",
        reason: "before-reminder-threshold",
        nextDueLocal: formatLocalTime(rule.reminderAfter.hour, rule.reminderAfter.minute),
      });
      continue;
    }

    const incidentKey = buildDeliveryKey(rule.type, "incident");
    const reminderKey = buildDeliveryKey(rule.type, "reminder");

    if (severity === "incident") {
      if (deliveredKeys.has(incidentKey)) {
        skipped?.push({
          type: rule.type,
          severity,
          reason: "already-delivered",
        });
        continue;
      }
    } else if (deliveredKeys.has(reminderKey) || deliveredKeys.has(incidentKey)) {
      skipped?.push({
        type: rule.type,
        severity,
        reason: deliveredKeys.has(incidentKey) ? "incident-already-delivered" : "already-delivered",
        ...(minutesNow < incidentAt
          ? { nextDueLocal: formatLocalTime(rule.incidentAfter.hour, rule.incidentAfter.minute) }
          : {}),
      });
      continue;
    }

    const tagPrefix = severity === "reminder" ? "midas-reminder" : "midas-incident";
    events.push({
      type: rule.type,
      severity,
      title: severity === "reminder" ? rule.reminderTitle : rule.incidentTitle,
      body: severity === "reminder" ? rule.reminderBody : rule.incidentBody,
      tag: `${tagPrefix}-${rule.type}-${dayIso}`,
    });
  }
  return events;
};

const resolveBpDueEvent = ({
  bp,
  minutesNow,
  deliveredKeys,
  dayIso,
  skipped,
}: {
  bp: { morning: boolean; evening: boolean };
  minutesNow: number;
  deliveredKeys: Set<string>;
  dayIso: string;
  skipped?: SkippedEvent[];
}) => {
  if (!bp.morning) {
    skipped?.push({ type: BP_RULE.type, severity: "incident", reason: "morning-bp-missing" });
    return null;
  }
  if (bp.evening) {
    skipped?.push({ type: BP_RULE.type, severity: "incident", reason: "evening-bp-already-recorded" });
    return null;
  }
  const incidentAt = toMinutes(BP_RULE.incidentAfter.hour, BP_RULE.incidentAfter.minute);
  if (minutesNow < incidentAt) {
    skipped?.push({
      type: BP_RULE.type,
      severity: "incident",
      reason: "before-incident-threshold",
      nextDueLocal: formatLocalTime(BP_RULE.incidentAfter.hour, BP_RULE.incidentAfter.minute),
    });
    return null;
  }
  const key = buildDeliveryKey(BP_RULE.type, "incident");
  if (deliveredKeys.has(key)) {
    skipped?.push({ type: BP_RULE.type, severity: "incident", reason: "already-delivered" });
    return null;
  }
  return {
    type: BP_RULE.type,
    severity: "incident" as const,
    title: BP_RULE.title,
    body: BP_RULE.body,
    tag: `midas-incident-${BP_RULE.type}-${dayIso}`,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return responseOk();
  if (req.method !== "POST") return responseJson({ error: "Method not allowed" }, 405);

  const token = getBearerToken(req);
  if (!token || token !== SERVICE_ROLE_KEY) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  let raw: IncidentPushInput = {};
  try {
    raw = await req.json();
  } catch (_) {
    raw = {};
  }

  const input = normalizeInput(raw);
  const dayIso = toDayIsoTz(input.now, INCIDENTS_TZ);
  const parts = getDatePartsInTz(input.now, INCIDENTS_TZ);
  const minutesNow = toMinutes(parts.hour, parts.minute);
  const runMedWindow = input.window === "all" || input.window === "med";
  const runBpWindow = input.window === "all" || input.window === "bp";
  const results: Record<string, unknown>[] = [];
  const evaluatedAtUtc = input.now.toISOString();
  const evaluatedAtLocal = {
    timeZone: INCIDENTS_TZ,
    dayIso,
    time: formatLocalTime(parts.hour, parts.minute),
    hour: parts.hour,
    minute: parts.minute,
  };

  try {
    const userIds = await resolveUserIds(input.userId);
    if (input.mode === "diagnostic") {
      if (input.trigger !== "manual") {
        return responseJson({ error: "Diagnostic push requires manual trigger" }, 400);
      }
      const diagnosticResults = await runDiagnosticPush({
        userIds,
        evaluatedAtUtc,
        dryRun: input.dryRun,
      });
      return responseJson({
        ok: true,
        trigger: input.trigger,
        mode: input.mode,
        dryRun: input.dryRun,
        evaluatedAtUtc,
        evaluatedAtLocal,
        dayIso,
        results: diagnosticResults,
      });
    }

    for (const userId of userIds) {
      const subscriptions = await fetchSubscriptions(userId);
      const activeSubs = subscriptions
        .map((row) => ({ row, sub: buildWebPushSub(row) }))
        .filter((entry): entry is { row: SubscriptionRow; sub: WebPushSub } => !!entry.sub);

      if (!activeSubs.length) {
        results.push({ userId, status: "no-subscriptions" });
        continue;
      }

      const deliveredKeys = await fetchRecordedDeliveries(userId, dayIso);
      const dueEvents: DueEvent[] = [];
      const skippedEvents: SkippedEvent[] = [];
      let medicationDebug: MedicationOpenDebug | null = null;

      if (runMedWindow) {
        const medicationOpenState = await fetchMedicationOpenBySection(userId, dayIso);
        medicationDebug = medicationOpenState.debug;
        dueEvents.push(
          ...resolveMedicationDueEvents({
            openBySection: medicationOpenState.sections,
            minutesNow,
            deliveredKeys,
            dayIso,
            skipped: skippedEvents,
          })
        );
      }

      if (runBpWindow) {
        const bp = await fetchBpState(userId, dayIso);
        const bpEvent = resolveBpDueEvent({
          bp,
          minutesNow,
          deliveredKeys,
          dayIso,
          skipped: skippedEvents,
        });
        if (bpEvent) dueEvents.push(bpEvent);
      }

      if (!dueEvents.length) {
        results.push({
          userId,
          status: "no-incidents",
          skipped: skippedEvents,
          ...(medicationDebug ? { diagnostics: { medication: medicationDebug } } : {}),
        });
        continue;
      }

      if (input.dryRun) {
        results.push({
          userId,
          status: "dry-run",
          incidents: dueEvents.map((event) => ({
            type: event.type,
            severity: event.severity,
            tag: event.tag,
          })),
          skipped: skippedEvents,
          ...(medicationDebug ? { diagnostics: { medication: medicationDebug } } : {}),
        });
        continue;
      }

      const sentEvents: Record<string, unknown>[] = [];
      const failedEvents: Record<string, unknown>[] = [];

      for (const event of dueEvents) {
        const payload = buildPayload(event, dayIso);
        let deliveredSubscriptionCount = 0;

        for (const { row, sub } of activeSubs) {
          if (row.disabled === true) continue;
          try {
            await sendPush(sub, payload as Record<string, unknown>);
            deliveredSubscriptionCount += 1;
            await updateSubscriptionSuccess(row);
          } catch (err) {
            await updateSubscriptionFailure(row, err);
            failedEvents.push({
              userId,
              type: event.type,
              severity: event.severity,
              error: formatSafePushError(err),
            });
          }
        }

        if (deliveredSubscriptionCount > 0) {
          await recordDelivery({
            userId,
            dayIso,
            event,
            deliveredSubscriptionCount,
            trigger: input.trigger,
          });
          deliveredKeys.add(buildDeliveryKey(event.type, event.severity));
          sentEvents.push({
            type: event.type,
            severity: event.severity,
            deliveredSubscriptions: deliveredSubscriptionCount,
          });
        }
      }

      results.push({
        userId,
        status: sentEvents.length ? "sent" : "push-failed",
        sent: sentEvents,
        failed: failedEvents,
        skipped: skippedEvents,
        ...(medicationDebug ? { diagnostics: { medication: medicationDebug } } : {}),
      });
    }
  } catch (err) {
    return responseJson({ error: formatSafePushError(err) }, 500);
  }

  return responseJson({
    ok: true,
    trigger: input.trigger,
    mode: input.mode,
    window: input.window,
    dryRun: input.dryRun,
    evaluatedAtUtc,
    evaluatedAtLocal,
    dayIso,
    results,
  });
});
