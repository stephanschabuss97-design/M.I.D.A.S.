import { createHandler as assistant } from "../midas-assistant/index.ts";
import { createHandler as transcribe } from "../midas-transcribe/index.ts";
import { createHandler as tts } from "../midas-tts/index.ts";
import { createHandler as vision } from "../midas-vision/index.ts";
import { createHandler as monthly } from "../midas-monthly-report/index.ts";
import { aggregateActivityUnits } from "../midas-monthly-report/activity-consumer.ts";

const OWNER = "00000000-0000-4000-8000-000000000013",
  FOREIGN = "00000000-0000-4000-8000-000000000014";
const TOKEN = "fixture_header.fixture_payload.fixture_signature",
  PUBLIC = "sb_publishable_fixture_public",
  INTERNAL = "sb_secret_fixture_monthly";
const ORIGIN = "https://midas-fixture.supabase.co";
const BASE: Record<string, string> = {
  MIDAS_OWNER_USER_ID: OWNER,
  SUPABASE_URL: ORIGIN,
  SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUBLIC }),
  SUPABASE_SECRET_KEYS: JSON.stringify({ monthly_report_backend: INTERNAL }),
  OPENAI_API_KEY: "synthetic_openai_not_a_credential",
};
const reader =
  (changes: Record<string, string | undefined> = {}) => (name: string) =>
    ({ ...BASE, ...changes })[name];
const equal = (a: unknown, b: unknown) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(
      "Contract mismatch: " + JSON.stringify({ actual: a, expected: b }),
    );
  }
};
const assert = (value: unknown) => {
  if (!value) throw new Error("Contract assertion failed");
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const inputs = [
  {
    name: "assistant",
    factory: assistant,
    body: () =>
      JSON.stringify({ messages: [{ role: "user", content: "Test" }] }),
  },
  {
    name: "transcribe",
    factory: transcribe,
    body: () => {
      const f = new FormData();
      f.append("audio", new File(["test"], "test.wav", { type: "audio/wav" }));
      return f;
    },
  },
  { name: "tts", factory: tts, body: () => JSON.stringify({ text: "Test" }) },
  {
    name: "vision",
    factory: vision,
    body: () => JSON.stringify({ image_base64: "dGVzdA==" }),
  },
  {
    name: "monthly",
    factory: monthly,
    body: () =>
      JSON.stringify({
        report_type: "range_report",
        from: "2026-08-01",
        to: "2026-08-01",
      }),
  },
];
const request = (
  body: BodyInit,
  authorization: string | null = `Bearer ${TOKEN}`,
  method = "POST",
) =>
  new Request(ORIGIN, {
    method,
    headers: {
      apikey: PUBLIC,
      ...(authorization === null ? {} : { authorization }),
    },
    ...(method === "POST" ? { body } : {}),
  });
type Call = {
  url: string;
  method: string;
  apikey: string | null;
  authorization: string | null;
  body: unknown;
};
const transport = (
  options: { user?: unknown; status?: number; dataFailure?: boolean } = {},
) => {
  const calls: Call[] = [], logs: unknown[][] = [];
  const original = globalThis.fetch,
    oldLog = console.log,
    oldError = console.error;
  console.log = (...args) => {
    logs.push(args);
  };
  console.error = (...args) => {
    logs.push(args);
  };
  globalThis.fetch = async (input, init) => {
    const req = new Request(input, init);
    let body: unknown = null;
    if (
      req.method === "POST" &&
      !req.headers.get("content-type")?.includes("multipart")
    ) {
      const text = await req.clone().text();
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    calls.push({
      url: req.url,
      method: req.method,
      apikey: req.headers.get("apikey"),
      authorization: req.headers.get("authorization"),
      body,
    });
    const url = new URL(req.url);
    if (url.origin === ORIGIN && url.pathname === "/auth/v1/user") {
      if (options.status) {
        return json({ msg: "raw-private-auth-detail" }, options.status);
      }
      const user = Object.hasOwn(options, "user")
        ? options.user
        : { id: OWNER, is_anonymous: false };
      return json(
        user === null ? {} : {
          aud: "authenticated",
          role: "authenticated",
          app_metadata: {},
          user_metadata: {},
          created_at: "2026-01-01T00:00:00Z",
          ...(user as object),
        },
      );
    }
    if (url.origin === "https://api.openai.com") {
      equal(
        req.headers.get("authorization"),
        "Bearer synthetic_openai_not_a_credential",
      );
      if (url.pathname === "/v1/audio/transcriptions") {
        return json({ text: "zweihundert ml Wasser" });
      }
      if (url.pathname === "/v1/audio/speech") {
        return new Response(new Uint8Array([1, 2, 3]));
      }
      return json({
        output_text: JSON.stringify({
          reply: "Test",
          actions: [],
          summary: "Test",
          salt_g: 1,
          protein_g: 2,
        }),
      });
    }
    if (url.origin === ORIGIN && url.pathname.startsWith("/rest/v1/")) {
      if (options.dataFailure) {
        return json(
          { message: "synthetic domain failure", code: "XX001" },
          500,
        );
      }
      if (url.pathname === "/rest/v1/rpc/activity_consumer_snapshot") {
        equal(req.headers.get("apikey"), PUBLIC);
        equal(req.headers.get("authorization"), `Bearer ${TOKEN}`);
        const args = body as { p_from: string; p_to: string };
        assert(!Object.hasOwn(args, "p_owner"));
        return json(
          aggregateActivityUnits([], {
            from: args.p_from,
            to: args.p_to,
            inclusive_days: 1,
          }, "2026-10-08"),
        );
      }
      equal(req.headers.get("apikey"), INTERNAL);
      if (req.method === "GET" || req.method === "PATCH") {
        equal(url.searchParams.get("user_id"), `eq.${OWNER}`);
      }
      if (url.pathname === "/rest/v1/health_events" && req.method === "POST") {
        const row = body as Record<string, unknown>;
        equal(row.user_id, OWNER);
        return json({
          id: "fixture-report",
          day: "2026-08-01",
          ts: row.ts,
          payload: row.payload,
          created_at: "2026-08-01T12:00:00Z",
        }, 201);
      }
      if (req.headers.get("accept")?.includes("object+json")) return json(null);
      return json([]);
    }
    throw new Error("Unexpected intercepted transport path");
  };
  return {
    calls,
    logs,
    restore: () => {
      globalThis.fetch = original;
      console.log = oldLog;
      console.error = oldError;
    },
  };
};
for (const entry of inputs) {
  Deno.test(`SUPA-L2 ${entry.name}: actual guard rejects identity/credential/config failures with zero domain effects`, async () => {
    const negatives = [
      { auth: null, status: 401 },
      { auth: "Bearer sb_secret_fixture_scheduler", status: 401 },
      { auth: "Bearer sb_publishable_fixture_public", status: 401 },
      { auth: "Basic bad", status: 401 },
      { auth: "Bearer malformed", status: 401 },
      { auth: `Bearer ${TOKEN}`, user: null, status: 401 },
      {
        auth: `Bearer ${TOKEN}`,
        user: { id: FOREIGN, is_anonymous: false },
        status: 401,
      },
      {
        auth: `Bearer ${TOKEN}`,
        user: { id: OWNER, is_anonymous: true },
        status: 401,
      },
      { auth: `Bearer ${TOKEN}`, user: { id: OWNER }, status: 401 },
      { auth: `Bearer ${TOKEN}`, authStatus: 401, status: 401 },
      { auth: `Bearer ${TOKEN}`, authStatus: 503, status: 500 },
      {
        auth: `Bearer ${TOKEN}`,
        changes: { MIDAS_OWNER_USER_ID: undefined },
        status: 500,
      },
      {
        auth: `Bearer ${TOKEN}`,
        changes: { SUPABASE_PUBLISHABLE_KEYS: "{}" },
        status: 500,
      },
      {
        auth: `Bearer ${TOKEN}`,
        changes: { SUPABASE_PUBLISHABLE_KEYS: "broken" },
        status: 500,
      },
      {
        auth: `Bearer ${TOKEN}`,
        changes: {
          SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: INTERNAL }),
        },
        status: 500,
      },
    ];
    for (const negative of negatives) {
      const spy = transport({
        ...(Object.hasOwn(negative, "user") ? { user: negative.user } : {}),
        status: negative.authStatus,
      });
      try {
        const response = await entry.factory(reader(negative.changes))(
          request(entry.body(), negative.auth),
        );
        equal(response.status, negative.status);
        equal(
          spy.calls.filter((c) => !c.url.endsWith("/auth/v1/user")).length,
          0,
        );
        const text = await response.text();
        assert(!text.includes("raw-private-auth-detail"));
        assert(!text.includes(TOKEN));
        assert(!JSON.stringify(spy.logs).includes("raw-private-auth-detail"));
      } finally {
        spy.restore();
      }
    }
  });
  Deno.test(`SUPA-L2 ${entry.name}: verified owner reaches actual domain transport`, async () => {
    const spy = transport();
    try {
      const response = await entry.factory(reader())(request(entry.body()));
      equal(response.status, 200);
      equal(spy.calls[0].url, ORIGIN + "/auth/v1/user");
      equal(spy.calls[0].apikey, PUBLIC);
      equal(spy.calls[0].authorization, `Bearer ${TOKEN}`);
      assert(spy.calls.length > 1);
      const body = await response.json();
      if (entry.name === "transcribe") {
        equal(body.surface_normalized_text, "200 ml wasser");
      }
      if (entry.name === "tts") equal(body.audio_base64, "AQID");
      if (entry.name === "vision") {
        equal(body.meta.user_id, OWNER);
        equal(body.analysis.protein_g, 2);
      }
      if (entry.name === "monthly") {
        equal(body.report.day, "2026-08-01");
        assert(
          spy.calls.some((c) =>
            c.url.includes("/rpc/activity_consumer_snapshot")
          ),
        );
        equal(
          spy.calls.filter((c) =>
            c.method === "POST" && c.url.includes("/health_events")
          ).length,
          1,
        );
      }
    } finally {
      spy.restore();
    }
  });
  Deno.test(`SUPA-L2 ${entry.name}: preflight and method failures have zero effects`, async () => {
    const spy = transport();
    try {
      equal(
        (await entry.factory(reader())(request("", null, "OPTIONS"))).status,
        200,
      );
      equal(
        (await entry.factory(reader())(request("", null, "GET"))).status,
        405,
      );
      equal(spy.calls.length, 0);
    } finally {
      spy.restore();
    }
  });
}
Deno.test("SUPA-L2 Monthly invalid internal map stops before data; data failure prevents replacement", async () => {
  for (
    const map of [
      "{}",
      "broken",
      JSON.stringify({ incidents_push_scheduler: INTERNAL }),
      JSON.stringify({ monthly_report_backend: PUBLIC }),
    ]
  ) {
    const spy = transport();
    try {
      equal(
        (await monthly(reader({ SUPABASE_SECRET_KEYS: map }))(
          request(inputs[4].body()),
        )).status,
        500,
      );
      equal(spy.calls.length, 1);
    } finally {
      spy.restore();
    }
  }
  const spy = transport({ dataFailure: true });
  try {
    equal((await monthly(reader())(request(inputs[4].body()))).status, 500);
    equal(
      spy.calls.filter((c) => c.method !== "GET" && !c.url.includes("/rpc/"))
        .length,
      0,
    );
  } finally {
    spy.restore();
  }
});
