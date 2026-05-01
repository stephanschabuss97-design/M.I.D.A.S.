import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const TTS_ENDPOINT = "https://api.openai.com/v1/audio/speech";
const TTS_MODEL = "gpt-4o-mini-tts"; // helle, warme, stabile Stimme

// ---------------------------------------------------------------------------
// Typen & Emotion-Whitelist
// ---------------------------------------------------------------------------

type Emotion =
  | "calm"
  | "motivating"
  | "empathic"
  | "focusing"
  | "encouraging";

const ALLOWED_EMOTIONS: Emotion[] = [
  "calm",
  "motivating",
  "empathic",
  "focusing",
  "encouraging",
];

interface TTSRequestBody {
  text?: string;
  voice?: string;
  format?: "wav" | "mp3";
  emotion?: Emotion; // optionaler Emotion-Tag
}

// ---------------------------------------------------------------------------
// Helper: ArrayBuffer → Base64 (ohne Stack-Overflow bei groesseren Buffern)
// ---------------------------------------------------------------------------

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32k
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const subarray = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...subarray);
  }

  return btoa(binary);
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Nur POST erlaubt
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Use POST" }),
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

  let body: TTSRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!body.text || !body.text.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing text" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const voice = body.voice ?? "cedar"; // Cedar als Default-Stimme
  const format = body.format ?? "wav";

  // Emotion: nur erlaubte Werte, sonst "calm"
  const emotion: Emotion =
    body.emotion && ALLOWED_EMOTIONS.includes(body.emotion)
      ? body.emotion
      : "calm";

  try {
    const openAiResponse = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice,
        input: body.text,
        format,
        speed: 1.0,   // ruhig, klar, kontrolliert
        emotion,      // "calm" | "motivating" | "empathic" | "focusing" | "encouraging"
      }),
    });

    if (!openAiResponse.ok) {
      const err = await openAiResponse.text();
      console.error("[midas-tts] OpenAI error:", err);
      return new Response(
        JSON.stringify({ error: "TTS request failed", details: err }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const audioBuffer = await openAiResponse.arrayBuffer();
    const base64Audio = arrayBufferToBase64(audioBuffer);

    // Client bekommt Base64 + Metadaten
    return new Response(
      JSON.stringify({
        audio_base64: base64Audio,
        format,
        voice,
        // optional könntest du emotion hier auch mit zurückgeben, wenn du magst:
        // emotion,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[midas-tts] unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
