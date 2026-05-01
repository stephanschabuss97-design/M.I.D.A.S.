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

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_VISION_MODEL = Deno.env.get("OPENAI_VISION_MODEL") ?? "gpt-4.1-mini";
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_OUTPUT_TOKENS = 400;
const REQUEST_TIMEOUT_MS = 45_000;

const SYSTEM_PROMPT =
  "Analysiere ausschließlich das sichtbare Essen. Gib realistische Schätzungen für Salz (g) und Protein (g) als JSON aus. Kein Wasserwert.";

const BASE_PROMPT_LINES = [
  "Analysiere dieses Foto einer Mahlzeit.",
  "Das Ergebnis MUSS zwischen 0 und 40 g Salz sowie 0 und 120 g Protein liegen.",
  "summary: kurze Empfehlung (Deutsch, max. 3 Sätze).",
  "salt_g: Zahl (z. B. 1.8).",
  "protein_g: Zahl (z. B. 30).",
];

const TEXT_FORMAT = {
  type: "json_schema",
  name: "midas_food_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "salt_g", "protein_g"],
    properties: {
      summary: { type: "string" },
      salt_g: { type: "number", minimum: 0, maximum: 40 },
      protein_g: { type: "number", minimum: 0, maximum: 120 },
    },
  },
} as const;

type VisionRequest = {
  image_base64?: string;
  imageBase64?: string;
  session_id?: string;
  history?: string;
  prompt?: string;
  context?: unknown;
  meta?: Record<string, unknown>;
};

type AssistantContextPayload = {
  intake?: {
    dayIso?: string | null;
    totals?: {
      water_ml?: number | null;
      salt_g?: number | null;
      protein_g?: number | null;
    };
  } | null;
  appointments?: { label?: string; detail?: string }[] | null;
  profile?: {
    ckd_stage?: string | null;
    salt_limit_g?: number | null;
    protein_limit_g?: number | null;
    medications?: string[] | null;
    lifestyle_note?: string | null;
  } | null;
};

type StructuredResult = {
  summary: string;
  salt_g: number | null;
  protein_g: number | null;
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const okResponse = () => new Response("ok", { headers: corsHeaders });

const getString = (value: unknown): string => (typeof value === "string" ? value : "");

const getBearerToken = (req: Request): string | null => {
  const h = req.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7).trim();
  return h.trim() || null;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundTo = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const extractMimeType = (value: string): string | null => {
  if (!value?.startsWith("data:")) return null;
  const semi = value.indexOf(";", 5);
  if (semi === -1) return null;
  return value.slice(5, semi);
};

const extractBase64 = (value: string): string => {
  if (!value) return "";
  const comma = value.indexOf(",");
  const raw = comma >= 0 ? value.slice(comma + 1) : value;
  return raw.trim();
};

const approximateBase64Bytes = (base64: string): number => {
  if (!base64) return 0;
  const padding = base64.match(/=+$/)?.[0]?.length ?? 0;
  return Math.ceil((base64.length * 3) / 4) - padding;
};

const formatNumber = (value: unknown, unit?: string, fractionDigits = 0): string | null => {
  if (!isFiniteNumber(value)) return null;
  const formatted =
    fractionDigits > 0 ? value.toFixed(fractionDigits) : String(Math.round(value));
  return unit ? `${formatted}${unit}` : formatted;
};

const buildContextSummary = (rawContext: unknown): string | null => {
  if (!rawContext || typeof rawContext !== "object") return null;
  const ctx = rawContext as AssistantContextPayload;
  const lines: string[] = [];

  if (ctx.profile) {
    const p: string[] = [];
    if (ctx.profile.ckd_stage) p.push(`CKD ${ctx.profile.ckd_stage}`);
    const salt = formatNumber(ctx.profile.salt_limit_g, " g");
    if (salt) p.push(`Salzlimit ${salt}/Tag`);
    const protein = formatNumber(ctx.profile.protein_limit_g, " g");
    if (protein) p.push(`Proteinlimit ${protein}/Tag`);
    if (ctx.profile.medications?.length) p.push(`Medikation: ${ctx.profile.medications.join(", ")}`);
    if (ctx.profile.lifestyle_note) p.push(`Lifestyle: ${ctx.profile.lifestyle_note}`);
    if (p.length) lines.push(`Profil: ${p.join(" | ")}`);
  }

  if (ctx.intake?.totals) {
    const parts: string[] = [];
    const salt = formatNumber(ctx.intake.totals.salt_g, " g", 1);
    if (salt) parts.push(`Salz heute ${salt}`);
    const protein = formatNumber(ctx.intake.totals.protein_g, " g", 1);
    if (protein) parts.push(`Protein heute ${protein}`);
    if (parts.length) lines.push(parts.join(" | "));
  }

  if (Array.isArray(ctx.appointments) && ctx.appointments.length) {
    const appts = ctx.appointments
      .slice(0, 2)
      .map((item) => [item.detail, item.label].filter(Boolean).join(" – "))
      .filter(Boolean);
    if (appts.length) lines.push(`Termine: ${appts.join(" | ")}`);
  }

  if (!lines.length) return null;
  return `Kontext (nur zur Einordnung):\n${lines.map((l) => `- ${l}`).join("\n")}`;
};

const buildVisionPrompt = (history?: string, customPrompt?: string, contextSummary?: string) => {
  const lines = [...BASE_PROMPT_LINES];
  if (customPrompt && customPrompt.trim()) lines.push(customPrompt.trim());
  if (contextSummary && contextSummary.trim()) lines.push(contextSummary.trim());
  if (history && history.trim()) lines.push(`Historie:\n${history.trim()}`);
  return lines.join("\n");
};

const stripCodeFences = (text: string) =>
  (text || "")
    .trim()
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

const safeJsonParse = (text: string): unknown | null => {
  const stripped = stripCodeFences(text || "");
  if (!stripped) return null;
  try {
    return JSON.parse(stripped);
  } catch {
    return null;
  }
};

const coerceNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const collectTextCandidates = (completion: Record<string, unknown>): string[] => {
  const candidates: string[] = [];

  const ot = (completion as { output_text?: unknown }).output_text;
  if (typeof ot === "string" && ot.trim()) candidates.push(ot.trim());

  const output = (completion as { output?: unknown }).output;
  if (Array.isArray(output)) {
    for (const item of output as any[]) {
      if (typeof item?.output_text === "string" && item.output_text.trim()) {
        candidates.push(item.output_text.trim());
      }
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const seg of content as any[]) {
          const t =
            typeof seg?.text === "string"
              ? seg.text
              : typeof seg?.output_text === "string"
                ? seg.output_text
                : null;
          if (t && t.trim()) candidates.push(t.trim());
        }
      }
    }
  }

  const choices = (completion as { choices?: unknown }).choices;
  if (Array.isArray(choices) && choices.length) {
    const first = choices[0] as any;
    if (typeof first?.text === "string" && first.text.trim()) candidates.push(first.text.trim());
    if (typeof first?.message?.content === "string" && first.message.content.trim()) {
      candidates.push(first.message.content.trim());
    }
  }

  return candidates;
};

const extractStructuredResult = (completion: Record<string, unknown>): StructuredResult | null => {
  const texts = collectTextCandidates(completion);
  for (const t of texts) {
    const parsed = safeJsonParse(t);
    if (!parsed || typeof parsed !== "object") continue;

    const obj = parsed as Record<string, unknown>;
    const summary = typeof obj.summary === "string" ? obj.summary.trim() : "";
    if (!summary) continue;

    const saltRaw = coerceNumber(obj.salt_g);
    const proteinRaw = coerceNumber(obj.protein_g);

    const salt = saltRaw === null ? null : clamp(roundTo(saltRaw, 1), 0, 40);
    const protein = proteinRaw === null ? null : clamp(roundTo(proteinRaw, 1), 0, 120);

    return { summary, salt_g: salt, protein_g: protein };
  }
  return null;
};

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

const fetchOpenAI = async (apiKey: string, body: Record<string, unknown>) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    return { res, text };
  } finally {
    clearTimeout(timeoutId);
  }
};

const buildOptionalAuthClient = () => {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!url || !anon) return null;
  try {
    return createClient(url, anon, { auth: { persistSession: false } });
  } catch {
    return null;
  }
};

const tryResolveUserId = async (token: string | null): Promise<string | null> => {
  if (!token) return null;
  const supa = buildOptionalAuthClient();
  if (!supa) return null;
  try {
    const { data, error } = await supa.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return okResponse();
  if (req.method !== "POST") return jsonResponse(405, { error: "method-not-allowed" });

  let payload: VisionRequest;
  try {
    payload = (await req.json()) as VisionRequest;
  } catch (err) {
    console.error("[midas-vision] invalid json", err);
    return jsonResponse(400, { error: "invalid-json" });
  }

  const rawImage = getString(payload.image_base64 ?? payload.imageBase64);
  if (!rawImage) return jsonResponse(400, { error: "image_base64-required" });

  const imageBase64 = extractBase64(rawImage);
  if (!imageBase64) return jsonResponse(400, { error: "image_base64-invalid" });

  const approxBytes = approximateBase64Bytes(imageBase64);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return jsonResponse(413, { error: "image-too-large", limit_bytes: MAX_IMAGE_BYTES });
  }

  const openAiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
  if (!openAiKey) {
    console.error("[midas-vision] OPENAI_API_KEY missing");
    return jsonResponse(500, { error: "openai-key-missing" });
  }

  const token = getBearerToken(req);
  const userId = await tryResolveUserId(token);

  const sessionId = typeof payload.session_id === "string" ? payload.session_id : null;
  const history = typeof payload.history === "string" ? payload.history.trim() : "";
  const customPrompt = typeof payload.prompt === "string" ? payload.prompt : undefined;

  const contextSummary =
    typeof payload.context !== "undefined" ? buildContextSummary(payload.context) : null;
  const userPrompt = buildVisionPrompt(history, customPrompt, contextSummary || undefined);

  const mimeType = extractMimeType(rawImage) ?? "image/jpeg";
  const imageUrl = rawImage.startsWith("data:")
    ? rawImage
    : `data:${mimeType};base64,${imageBase64}`;

  const model = DEFAULT_VISION_MODEL;
  const requestId = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

  const baseBody: Record<string, unknown> = {
    model,
    input: [
      { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
      {
        role: "user",
        content: [
          { type: "input_text", text: userPrompt },
          { type: "input_image", image_url: imageUrl },
        ],
      },
    ],
    max_output_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
    text: { format: TEXT_FORMAT },
    metadata: {
      source: "midas-vision",
      session_id: sessionId,
      request_id: requestId,
      user_id: userId,
    },
    store: false,
  };

  let completion: Record<string, unknown> = {};

  try {
    let { res, text } = await fetchOpenAI(openAiKey, baseBody);

    if (!res.ok) {
      const errText = text || "";
      const tempUnsupported = shouldRetryWithout(errText, "temperature");
      const textUnsupported =
        shouldRetryWithout(errText, "text") ||
        shouldRetryWithout(errText, "json_schema") ||
        shouldRetryWithout(errText, "format");

      if (tempUnsupported || textUnsupported) {
        const retryBody = { ...baseBody } as Record<string, unknown>;

        if (tempUnsupported) {
          const { temperature, ...rest } = retryBody;
          Object.assign(retryBody, rest);
          delete (retryBody as any).temperature;
        }

        if (textUnsupported) {
          if (retryBody.text && typeof retryBody.text === "object") {
            const t = retryBody.text as Record<string, unknown>;
            const { format, ...restText } = t;
            retryBody.text = restText;
          }
        }

        ({ res, text } = await fetchOpenAI(openAiKey, retryBody));
      }
    }

    if (!res.ok) {
      console.error("[midas-vision] OpenAI error", {
        status: res.status,
        response_length: (text || "").length,
      });
      return jsonResponse(res.status, {
        error: "openai-error",
        details: text || res.statusText,
      });
    }

    const parsed = safeJsonParse(text);
    if (!parsed || typeof parsed !== "object") {
      console.error("[midas-vision] openai invalid json", {
        response_length: (text || "").length,
      });
      return jsonResponse(502, { error: "openai-invalid-json" });
    }

    completion = parsed as Record<string, unknown>;
  } catch (err) {
    console.error("[midas-vision] request failed", err);
    if (err instanceof DOMException && err.name === "AbortError") {
      return jsonResponse(504, { error: "upstream-timeout" });
    }
    return jsonResponse(502, {
      error: "vision-request-failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  const structured = extractStructuredResult(completion);
  if (!structured) {
    console.error("[midas-vision] structured result missing", {
      output_count: Array.isArray((completion as { output?: unknown }).output)
        ? ((completion as { output: unknown[] }).output).length
        : 0,
      has_output_text: typeof (completion as { output_text?: unknown }).output_text === "string",
    });
    return jsonResponse(502, { error: "vision-empty" });
  }

  const reply = structured.summary.trim();
  if (!reply) return jsonResponse(502, { error: "summary-missing" });

  const output = Array.isArray((completion as { output?: unknown }).output)
    ? ((completion as { output: unknown[] }).output)
    : [];
  const choices = Array.isArray((completion as { choices?: unknown }).choices)
    ? ((completion as { choices: unknown[] }).choices)
    : [];
  const finishReason =
    ((output[0] as { finish_reason?: unknown })?.finish_reason ??
      (choices[0] as { finish_reason?: unknown })?.finish_reason ??
      (completion as { finish_reason?: unknown }).finish_reason ??
      null);

  const meta: Record<string, unknown> = {
    model,
    session_id: sessionId,
    request_id: requestId,
    user_id: userId,
    finish_reason: finishReason,
    usage: (completion as { usage?: unknown })?.usage ?? null,
  };

  if (payload.meta && typeof payload.meta === "object") {
    meta.request_meta = payload.meta;
  }

  return jsonResponse(200, {
    reply,
    analysis: {
      water_ml: null,
      salt_g: structured.salt_g,
      protein_g: structured.protein_g,
    },
    meta,
  });
});
