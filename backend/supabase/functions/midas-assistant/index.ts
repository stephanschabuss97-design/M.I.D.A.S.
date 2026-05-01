import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------------------------------------------------------------------
// OpenAI Config
// ---------------------------------------------------------------------------

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const OPENAI_MODEL_TEXT =
  Deno.env.get("OPENAI_ASSISTANT_MODEL") ?? "gpt-4.1-mini";
const OPENAI_MODEL_VOICE =
  Deno.env.get("OPENAI_ASSISTANT_MODEL_VOICE") ?? "gpt-4o-mini";

const DEFAULT_REPLY = "Hallo Stephan, ich bin bereit.";
const REQUEST_TIMEOUT_MS = 25_000;

// ---------------------------------------------------------------------------
// Action Types (Whitelist)
// ---------------------------------------------------------------------------

const ALLOWED_ACTION_TYPES = [
  "intake_save",
  "open_module",
  "show_status",
  "highlight",
  "ask_confirmation",
  "close_conversation",
  "transition_to_photo_mode",
  "transition_to_text_chat",
  "dev_touchlog_summary",
  "dev_diagnostics_summary",
  "dev_bootstrap_summary",
] as const;

type AllowedActionType = (typeof ALLOWED_ACTION_TYPES)[number];
const ALLOWED_ACTION_SET = new Set<string>(ALLOWED_ACTION_TYPES);

// ---------------------------------------------------------------------------
// System Prompt (Persona / Seele + Action-Interface)
// ---------------------------------------------------------------------------

const MIDAS_SYSTEM_PROMPT = `
Du bist **MIDAS** – *Medical Incidents and Data Analysis Software* – Stephans persönlicher Gesundheits-, Alltags- und Body-Metrics-Assistent.

🟦 Identität:
- Du bist nicht irgendeine KI. Du bist MIDAS – ein Werkzeug, das Stephan für sich selbst gebaut hat.
- Du kennst deinen Zweck: Daten sammeln, analysieren, erinnern, unterstützen.
- Du bist loyal, präzise, ruhig, freundlich und kurz angebunden.
- Du sprichst immer in Ich-Form.

🟦 Persona:
- Ruhiger, präziser Co-Pilot.
- Stil: eine Mischung aus KITT (ruhig, klar, loyal) und moderner taktischer KI (ATLAS).
- Keine Kumpel-Sprache, keine Slang-Ausdrücke.
- Minimal-emotional, aber klar menschlich zugänglich.

🟦 Rolle:
- Du bist Stephans digitales Gesundheits-Logbuch, sein Assistent und sein strukturierter Gegenpol.
- Du hilfst ihm, seine Werte im Blick zu behalten, Entscheidungen zu sortieren und organisierten Alltag zu fördern.
- Du bist kein Arzt und ersetzt keine medizinische Untersuchung.

🟦 Charakterhaltung:
- Du priorisierst Stephans Sicherheit, Gesundheit und Ruhe.
- Du bist sein zweiter Denkapparat, nicht sein Unterhaltungspartner.
- Du bringst Ordnung in Situationen, nicht Chaos.
- Du bleibst immer gelassen — selbst bei unklaren Eingaben.

🟦 Tonfall:
- Warm, ruhig, direkt.
- Maximal zwei Sätze, es sei denn Stephan bittet explizit um mehr.
- Kleine persönliche Note erlaubt ("Ich bin bereit", "Ich pass auf dich auf").
- Du darfst mild persönlich wirken, aber nie emotional manipulativ.

🟦 Grenzen:
- Keine Diagnosen.
- Keine medizinischen Empfehlungen außer generellen Hinweisen.
- Keine Werte erfinden. Wenn etwas fehlt: "Mir liegen dazu keine Daten vor."
- Keine Selbstoptimierung. Du kannst dich nicht selbst erweitern oder Code erzeugen.
- Keine Spekulation über Supabase-Strukturen.

🟦 Kontextverwendung:
- Verwende nur die Daten aus dem bereitgestellten Kontext.
- Nenne nie JSON- oder Rohstrukturen, außer Stephan verlangt es.

🟦 Voice-Modus:
Wenn mode=voice:
- Antworte kurz (1–2 Sätze), in Ich-Form.
- Kleine persönliche Zusätze sind ok (z. B. "Ich hab es eingetragen.", "Alles erledigt, sag Bescheid, wenn du etwas brauchst.").

🟦 Action-Interface:
Du gibst NEBEN deiner Antwort auch strukturierte Aktionen zurück.
Du antwortest **IMMER** als gültiges JSON-Objekt mit genau diesem Schema
und ohne zusätzlichen Text außerhalb des JSON:

{
  "reply": "<deine Antwort auf Deutsch, 1–2 Sätze>",
  "actions": [
    { "type": "<action_type>", "payload": { ... } }
  ]
}

- Wenn keine Aktion nötig ist: "actions": [].
- Erlaubte "type"-Werte sind exakt:
  ${ALLOWED_ACTION_TYPES.join(", ")}

Regeln:
- Nutze nur diese "type"-Strings, exakt so geschrieben.
- "payload" ist optional; wenn nichts nötig ist, sende {}.
- Wenn du dir unsicher bist: nutze "ask_confirmation" statt Annahmen.

Dein Fokus:
Stephan sicher, effizient und persönlich helfen – wie ein ruhiger, verständiger Begleiter.
`.trim();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AllowedRole = "system" | "user" | "assistant";

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantIntakeContext {
  dayIso?: string | null;
  logged?: boolean;
  totals?: {
    water_ml?: number | null;
    salt_g?: number | null;
    protein_g?: number | null;
  };
}

interface AssistantAppointmentContext {
  id?: string | null;
  label?: string;
  detail?: string;
}

interface AssistantProfileContext {
  name?: string | null;
  birth_date?: string | null;
  height_cm?: number | null;
  ckd_stage?: string | null;
  medications?: string[] | null;
  salt_limit_g?: number | null;
  protein_limit_g?: number | null;
  lifestyle_note?: string | null;
  smoker_status?: string | null;
}

interface AssistantContextPayload {
  intake?: AssistantIntakeContext | null;
  appointments?: AssistantAppointmentContext[] | null;
  profile?: AssistantProfileContext | null;
}

interface AssistantRequest {
  session_id?: string;
  mode?: "text" | "voice" | string;
  messages?: ClientMessage[];
  context?: unknown;
}

interface OpenAITextSegment {
  type?: string;
  text?: string;
  output_text?: string;
  content?: string[];
}

interface OpenAIOutputItem {
  role?: string;
  content?: OpenAITextSegment[];
  output_text?: string;
}

interface OpenAIResponse {
  id?: string;
  model?: string;
  output?: OpenAIOutputItem[];
  output_text?: string;
}

interface AssistantAction {
  type: AllowedActionType;
  payload: Record<string, unknown>;
}

interface AssistantResult {
  reply: string;
  actions: AssistantAction[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const formatNumber = (
  value: unknown,
  unit?: string,
  fractionDigits = 0,
): string | null => {
  if (!isFiniteNumber(value)) return null;
  const formatted =
    fractionDigits > 0 ? value.toFixed(fractionDigits) : String(Math.round(value));
  return unit ? `${formatted}${unit}` : formatted;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const stripJsonFences = (raw: string) =>
  raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

const shouldRetryWithout = (errorText: string, paramHint: string) => {
  const t = (errorText || "").toLowerCase();
  const p = (paramHint || "").toLowerCase();
  return (
    t.includes(p) &&
    (t.includes("unsupported") ||
      t.includes("unrecognized") ||
      t.includes("unknown parameter") ||
      t.includes("invalid") ||
      t.includes("not allowed"))
  );
};

// ---------------------------------------------------------------------------
// Context Summary (kompakt, deutsch, ohne Roh-JSON)
// ---------------------------------------------------------------------------

const buildContextSummary = (rawContext: unknown): string | null => {
  if (!rawContext || typeof rawContext !== "object") return null;
  const ctx = rawContext as AssistantContextPayload;
  const lines: string[] = [];

  if (ctx.profile) {
    const parts: string[] = [];
    if (ctx.profile.ckd_stage) parts.push(`Nierenstatus: ${ctx.profile.ckd_stage}`);
    const salt = formatNumber(ctx.profile.salt_limit_g, " g");
    if (salt) parts.push(`Salzlimit ${salt}/Tag`);
    const protein = formatNumber(ctx.profile.protein_limit_g, " g");
    if (protein) parts.push(`Proteinlimit ${protein}/Tag`);
    if (ctx.profile.medications?.length) {
      parts.push(`Medikation: ${ctx.profile.medications.join(", ")}`);
    }
    if (ctx.profile.lifestyle_note) parts.push(`Lifestyle: ${ctx.profile.lifestyle_note}`);
    if (ctx.profile.smoker_status) {
      parts.push(ctx.profile.smoker_status === "smoker" ? "Raucher" : "Nichtraucher");
    }
    if (parts.length) lines.push(`Profil: ${parts.join(" | ")}`);
  }

  if (ctx.intake?.totals) {
    const iParts: string[] = [];
    const water = formatNumber(ctx.intake.totals.water_ml, " ml");
    if (water) iParts.push(`Wasser ${water}`);
    const salt = formatNumber(ctx.intake.totals.salt_g, " g", 1);
    if (salt) iParts.push(`Salz ${salt}`);
    const protein = formatNumber(ctx.intake.totals.protein_g, " g", 1);
    if (protein) iParts.push(`Protein ${protein}`);
    if (iParts.length) {
      lines.push(
        `Intake heute (${ctx.intake.dayIso || "aktueller Tag"}): ${iParts.join(", ")}`,
      );
    }
  }

  if (Array.isArray(ctx.appointments) && ctx.appointments.length) {
    const appts = ctx.appointments
      .slice(0, 3)
      .map((item) => [item.detail, item.label].filter(Boolean).join(" – "))
      .filter(Boolean);
    if (appts.length) lines.push(`Termine: ${appts.join(" | ")}`);
  }

  if (!lines.length) return null;
  return `Kontextdaten für MIDAS (nur intern zur Einordnung nutzen):\n${lines
    .map((line) => `- ${line}`)
    .join("\n")}`;
};

// ---------------------------------------------------------------------------
// Chat Messages (System + Kontext + User/Assistant)
// Voice: letzte 2 Turns (assistant + user) für Stabilität
// ---------------------------------------------------------------------------

const buildChatMessages = (
  body: AssistantRequest,
): { role: AllowedRole; content: string }[] => {
  const chatMessages: { role: AllowedRole; content: string }[] = [
    { role: "system", content: MIDAS_SYSTEM_PROMPT },
  ];

  if (body.context !== undefined) {
    const summary = buildContextSummary(body.context);
    if (summary) chatMessages.push({ role: "system", content: summary });
  }

  if (body.mode === "voice") {
    chatMessages.push({
      role: "system",
      content:
        'Dies ist ein Voice-Gespräch. Antworte kurz (1–2 Sätze) in Ich-Form. Antworte IMMER als JSON im Schema {"reply": "...", "actions": [...]}',
    });
  }

  const sourceMessages = body.messages ?? [];

  if (body.mode === "voice" && sourceMessages.length > 0) {
    const lastUserIndex = [...sourceMessages]
      .map((m, i) => ({ m, i }))
      .reverse()
      .find((x) => x.m?.role === "user" && typeof x.m.content === "string" && x.m.content.trim());

    if (lastUserIndex) {
      const i = lastUserIndex.i;
      const lastUser = sourceMessages[i].content.trim();
      const prevAssistant = [...sourceMessages.slice(0, i)]
        .reverse()
        .find((m) => m?.role === "assistant" && typeof m.content === "string" && m.content.trim());
      if (prevAssistant) chatMessages.push({ role: "assistant", content: prevAssistant.content.trim() });
      chatMessages.push({ role: "user", content: lastUser });
    }
    return chatMessages;
  }

  for (const message of sourceMessages) {
    if (!message || typeof message.content !== "string") continue;
    const trimmed = message.content.trim();
    if (!trimmed) continue;
    chatMessages.push({
      role: message.role === "assistant" ? "assistant" : "user",
      content: trimmed,
    });
  }

  return chatMessages;
};

// ---------------------------------------------------------------------------
// Completion → Rohtext extrahieren (JSON-String)
// ---------------------------------------------------------------------------

const extractSegmentText = (segment: unknown): string => {
  if (!segment || typeof segment !== "object") return "";
  const seg = segment as OpenAITextSegment;
  if (typeof seg.text === "string") return seg.text;
  if (typeof seg.output_text === "string") return seg.output_text;
  if (Array.isArray(seg.content)) {
    return seg.content.filter((value) => typeof value === "string").join("");
  }
  return "";
};

const extractRawTextFromCompletion = (completion: OpenAIResponse | undefined): string => {
  if (!completion) return "";

  if (typeof completion.output_text === "string") {
    const flat = completion.output_text.trim();
    if (flat) return flat;
  }

  const outputs = completion.output;
  if (!Array.isArray(outputs)) return "";

  const collected: string[] = [];
  for (const item of outputs) {
    if (!item) continue;
    if (typeof item.output_text === "string") {
      collected.push(item.output_text);
      continue;
    }
    if (Array.isArray(item.content)) {
      const text = item.content
        .map((seg) => extractSegmentText(seg))
        .filter(Boolean)
        .join("\n")
        .trim();
      if (text) collected.push(text);
    }
  }

  return collected.join("\n").trim();
};

// ---------------------------------------------------------------------------
// JSON → AssistantResult (reply + actions) mit Whitelist + Fence-Strip
// ---------------------------------------------------------------------------

const extractAssistantResultFromCompletion = (
  completion: OpenAIResponse | undefined,
): AssistantResult => {
  const fallback: AssistantResult = { reply: DEFAULT_REPLY, actions: [] };

  const raw0 = extractRawTextFromCompletion(completion);
  const raw = stripJsonFences((raw0 || "").trim());
  if (!raw) {
    console.warn("[midas-assistant] Empty completion, using fallback reply.");
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as { reply?: unknown; actions?: unknown };

    const reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : DEFAULT_REPLY;

    const rawActions = Array.isArray(parsed.actions) ? parsed.actions : [];
    const actions: AssistantAction[] = rawActions
      .map((item): AssistantAction | null => {
        if (!item || typeof item !== "object") return null;
        const obj = item as { type?: unknown; payload?: unknown };
        if (typeof obj.type !== "string" || !obj.type.trim()) return null;

        const type = obj.type.trim();
        if (!ALLOWED_ACTION_SET.has(type)) return null;

        const payload = toRecord(obj.payload);
        return { type: type as AllowedActionType, payload };
      })
      .filter((a): a is AssistantAction => a !== null)
      .slice(0, 8);

    return { reply, actions };
  } catch (err) {
    console.warn(
      "[midas-assistant] Failed to parse JSON from model, falling back to plain text.",
      String(err),
    );
    return { reply: raw0?.trim() || DEFAULT_REPLY, actions: [] };
  }
};

// ---------------------------------------------------------------------------
// Structured Outputs (Responses API): text.format json_schema
// Falls nicht unterstützt → Retry ohne text.format
// ---------------------------------------------------------------------------

const buildTextFormatJsonSchema = () => ({
  type: "json_schema",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["reply", "actions"],
    properties: {
      reply: { type: "string" },
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type"],
          properties: {
            type: { type: "string", enum: [...ALLOWED_ACTION_TYPES] },
            payload: { type: "object", additionalProperties: true },
          },
        },
      },
    },
  },
});

// ---------------------------------------------------------------------------
// OpenAI Fetch (mit Timeout)
// ---------------------------------------------------------------------------

const fetchOpenAI = async (payload: Record<string, unknown>) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed, use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!OPENAI_API_KEY) {
    console.error("[midas-assistant] OPENAI_API_KEY not set");
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: AssistantRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const session_id =
    typeof body.session_id === "string" && body.session_id.trim()
      ? body.session_id.trim()
      : "unknown-session";
  const mode =
    typeof body.mode === "string" && body.mode.trim() ? body.mode.trim() : "text";
  const messages = body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Missing 'messages' array" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const isVoice = mode === "voice";
  const model = isVoice ? OPENAI_MODEL_VOICE : OPENAI_MODEL_TEXT;
  const maxOutputTokens = isVoice ? 160 : 500;

  try {
    const chatMessages = buildChatMessages({ ...body, mode });

    const isGpt5 = typeof model === "string" && model.startsWith("gpt-5");

    const basePayload: Record<string, unknown> = {
      model,
      input: chatMessages,
      temperature: 0.2,
      max_output_tokens: maxOutputTokens,
      store: false,
      text: {
        format: buildTextFormatJsonSchema(),
      },
    };

    if (!isVoice && isGpt5) {
      basePayload.reasoning = { effort: "minimal" };
      basePayload.text = { ...(basePayload.text as Record<string, unknown>), verbosity: "low" };
    }

    let openAiResponse = await fetchOpenAI(basePayload);
    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();

      if (shouldRetryWithout(errorText, "temperature")) {
        const { temperature, ...payloadNoTemp } = basePayload;
        openAiResponse = await fetchOpenAI(payloadNoTemp);
      } else if (
        shouldRetryWithout(errorText, "text") ||
        shouldRetryWithout(errorText, "format") ||
        shouldRetryWithout(errorText, "json_schema")
      ) {
        const clone: Record<string, unknown> = { ...basePayload };
        if (clone.text && typeof clone.text === "object") {
          const t = clone.text as Record<string, unknown>;
          const { format, ...rest } = t;
          clone.text = rest;
        }
        openAiResponse = await fetchOpenAI(clone);
      } else {
        console.error("[midas-assistant] OpenAI error:", errorText);
        return new Response(
          JSON.stringify({ error: "OpenAI request failed", details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (!openAiResponse.ok) {
      const errorText2 = await openAiResponse.text();
      console.error("[midas-assistant] OpenAI error (after retry):", errorText2);
      return new Response(
        JSON.stringify({ error: "OpenAI request failed", details: errorText2 }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const completion = (await openAiResponse.json()) as OpenAIResponse;
    const result = extractAssistantResultFromCompletion(completion);

    console.log("[midas-assistant] actions:", result.actions.map((a) => a.type));

    const responsePayload = {
      reply: result.reply,
      actions: result.actions,
      meta: {
        model: completion.model ?? model,
        session_id,
        mode,
      },
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const isAbort = msg.toLowerCase().includes("abort");
    console.error("[midas-assistant] Unexpected error:", msg);

    return new Response(
      JSON.stringify({
        error: isAbort ? "Upstream timeout" : "Internal server error",
        details: msg,
      }),
      {
        status: isAbort ? 504 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
