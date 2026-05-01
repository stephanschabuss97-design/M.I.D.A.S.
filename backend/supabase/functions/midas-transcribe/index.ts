import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const TRANSCRIBE_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const TRANSCRIBE_MODEL = "gpt-4o-transcribe";
const TARGET_UNITS = new Set(["ml", "l", "g", "kg", "min", "minute", "minuten"]);
const DIRECT_NUMBER_WORDS = new Map<string, number>([
  ["null", 0],
  ["ein", 1],
  ["eine", 1],
  ["einen", 1],
  ["einem", 1],
  ["einer", 1],
  ["eins", 1],
  ["zwei", 2],
  ["drei", 3],
  ["vier", 4],
  ["fuenf", 5],
  ["sechs", 6],
  ["sieben", 7],
  ["acht", 8],
  ["neun", 9],
  ["zehn", 10],
  ["elf", 11],
  ["zwoelf", 12],
  ["dreizehn", 13],
  ["vierzehn", 14],
  ["fuenfzehn", 15],
  ["sechzehn", 16],
  ["siebzehn", 17],
  ["achtzehn", 18],
  ["neunzehn", 19],
  ["zwanzig", 20],
  ["dreissig", 30],
  ["vierzig", 40],
  ["fuenfzig", 50],
  ["sechzig", 60],
  ["siebzig", 70],
  ["achtzig", 80],
  ["neunzig", 90],
]);
const UNIT_NUMBER_WORDS = new Map<string, number>([
  ["ein", 1],
  ["eine", 1],
  ["einen", 1],
  ["einem", 1],
  ["einer", 1],
  ["eins", 1],
  ["zwei", 2],
  ["drei", 3],
  ["vier", 4],
  ["fuenf", 5],
  ["sechs", 6],
  ["sieben", 7],
  ["acht", 8],
  ["neun", 9],
]);
const TENS_WORDS = new Map<string, number>([
  ["zwanzig", 20],
  ["dreissig", 30],
  ["vierzig", 40],
  ["fuenfzig", 50],
  ["sechzig", 60],
  ["siebzig", 70],
  ["achtzig", 80],
  ["neunzig", 90],
]);

function normalizeUmlauts(value: string): string {
  return value
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
}

function normalizeTranscriptSurface(value: string): string {
  return normalizeUmlauts(value.toLowerCase())
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\bmilliliter\b/g, "ml")
    .replace(/\bmillilitre\b/g, "ml")
    .replace(/\bgramm\b/g, "g")
    .replace(/\bgram\b/g, "g")
    .replace(/\bkilogramm\b/g, "kg")
    .replace(/-/g, " ")
    .replace(/(^|[^\d])\.(?=[^\d]|$)/g, "$1 ")
    .replace(/[;,!?]+/g, " ")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGermanNumberWord(value: string): number | null {
  const compact = value.replace(/\s+/g, "");
  if (!compact) return null;
  if (/^\d+(?:\.\d+)?$/.test(compact)) {
    return Number(compact);
  }
  const direct = DIRECT_NUMBER_WORDS.get(compact);
  if (direct != null) {
    return direct;
  }
  if (compact.includes("tausend")) {
    const index = compact.indexOf("tausend");
    const leftRaw = compact.slice(0, index);
    const rightRaw = compact.slice(index + "tausend".length);
    const left = leftRaw ? parseGermanNumberWord(leftRaw) : 1;
    const right = rightRaw ? parseGermanNumberWord(rightRaw) : 0;
    if (left == null || right == null) return null;
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    return left * 1000 + right;
  }
  if (compact.includes("hundert")) {
    const index = compact.indexOf("hundert");
    const leftRaw = compact.slice(0, index);
    const rightRaw = compact.slice(index + "hundert".length);
    const left = leftRaw ? parseGermanNumberWord(leftRaw) : 1;
    const right = rightRaw ? parseGermanNumberWord(rightRaw) : 0;
    if (left == null || right == null) return null;
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    return left * 100 + right;
  }
  for (const [tensWord, tensValue] of TENS_WORDS.entries()) {
    if (!compact.endsWith(tensWord)) continue;
    const prefix = compact.slice(0, -tensWord.length);
    if (!prefix) {
      return tensValue;
    }
    if (!prefix.endsWith("und")) continue;
    const unitWord = prefix.slice(0, -"und".length);
    const unitValue = UNIT_NUMBER_WORDS.get(unitWord);
    if (unitValue != null) {
      return tensValue + unitValue;
    }
  }
  return null;
}

function normalizeTranscriptSurfaceNumbers(value: string): string {
  const surface = normalizeTranscriptSurface(value);
  if (!surface) return "";
  const tokens = surface.split(/\s+/g).filter(Boolean);
  const normalized: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    let replaced = false;
    for (let consumed = Math.min(6, tokens.length - index - 1); consumed >= 1; consumed -= 1) {
      const unitToken = tokens[index + consumed];
      if (!TARGET_UNITS.has(unitToken)) continue;
      const phrase = tokens.slice(index, index + consumed).join("");
      const parsed = parseGermanNumberWord(phrase);
      if (!Number.isFinite(parsed)) continue;
      normalized.push(String(parsed), unitToken);
      index += consumed + 1;
      replaced = true;
      break;
    }
    if (replaced) continue;
    normalized.push(tokens[index]);
    index += 1;
  }
  return normalized.join(" ").trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed, use POST" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY missing" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "Missing audio file (form field 'audio')" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "[midas-transcribe] received audio:",
      audioFile.type,
      audioFile.size,
    );

    const openAiForm = new FormData();
    openAiForm.append("file", audioFile);
    openAiForm.append("model", TRANSCRIBE_MODEL);
    openAiForm.append("response_format", "json");
    openAiForm.append(
      "prompt",
      "Deutsch. Fuer klare Mengen- und Timerangaben nach Moeglichkeit Ziffern statt ausgeschriebener Zahlwoerter verwenden.",
    );

    const openAiRes = await fetch(TRANSCRIBE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: openAiForm,
    });

    if (!openAiRes.ok) {
      const errText = await openAiRes.text();
      console.error("[midas-transcribe] OpenAI error:", errText);
      return new Response(
        JSON.stringify({ error: "Transcription failed", details: errText }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result = await openAiRes.json();
    const rawText = (result?.text ?? "").trim();
    const surfaceNormalizedText = normalizeTranscriptSurfaceNumbers(rawText) || rawText;

    console.log("[midas-transcribe] transcription complete", {
      raw_length: rawText.length,
      surface_length: surfaceNormalizedText.length,
      surface_changed: surfaceNormalizedText !== rawText,
    });

    return new Response(JSON.stringify({
      text: rawText,
      transcript: rawText,
      raw_text: rawText,
      surface_normalized_text: surfaceNormalizedText,
      normalized_text: surfaceNormalizedText,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[midas-transcribe] unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
