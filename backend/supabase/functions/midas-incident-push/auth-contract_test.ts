import { createHandler } from "./index.ts";
import type webpush from "npm:web-push@3.6.6";
const OWNER = "00000000-0000-4000-8000-000000000013",
  FOREIGN = "00000000-0000-4000-8000-000000000014";
const KEY = "sb_secret_fixture_incidents",
  OTHER = "sb_secret_fixture_other",
  ORIGIN = "https://midas-fixture.supabase.co";
const BASE: Record<string, string> = {
  MIDAS_OWNER_USER_ID: OWNER,
  INCIDENTS_USER_ID: OWNER,
  SUPABASE_URL: ORIGIN,
  SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({
    default: "sb_publishable_fixture_public",
  }),
  SUPABASE_SECRET_KEYS: JSON.stringify({
    incidents_push_scheduler: KEY,
    protein_targets_scheduler: OTHER,
  }),
  VAPID_PUBLIC_KEY: "synthetic_public",
  VAPID_PRIVATE_KEY: "synthetic_private",
};
const reader =
  (changes: Record<string, string | undefined> = {}) => (name: string) =>
    ({ ...BASE, ...changes })[name];
const equal = (a: unknown, b: unknown) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(
      "Incident contract mismatch: " +
        JSON.stringify({ actual: a, expected: b }),
    );
  }
};
const request = (
  key: string | null = KEY,
  body: unknown = { dry_run: true },
  authorization: string | null = null,
) =>
  new Request(ORIGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key === null ? {} : { apikey: key }),
      ...(authorization === null ? {} : { authorization }),
    },
    body: JSON.stringify(body),
  });
const fixture = () => {
  const calls: { url: string; method: string; key: string | null }[] = [];
  let initializations = 0, pushes = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const req = new Request(input, init);
    const url = new URL(req.url);
    calls.push({
      url: req.url,
      method: req.method,
      key: req.headers.get("apikey"),
    });
    equal(url.origin, ORIGIN);
    equal(url.pathname, "/rest/v1/push_subscriptions");
    equal(url.searchParams.get("user_id"), `eq.${OWNER}`);
    equal(req.headers.get("apikey"), KEY);
    return new Response("[]", {
      headers: { "Content-Type": "application/json" },
    });
  };
  const push = {
    setVapidDetails: () => {
      initializations++;
    },
    sendNotification: () => {
      pushes++;
      throw new Error("Unexpected push");
    },
  } as unknown as typeof webpush;
  return {
    calls,
    push,
    effects: () => ({ initializations, pushes }),
    restore: () => {
      globalThis.fetch = original;
    },
  };
};
Deno.test("SUPA-L2 Incident real SDK/handler rejects wrong keys, bearers, owner drift and unsafe inputs before effects", async () => {
  const cases = [
    { key: null, status: 401 },
    { key: OTHER, status: 401 },
    { key: "sb_publishable_fixture_public", status: 401 },
    { key: "legacy.jwt.signature", status: 401 },
    { authorization: "Bearer fixture.jwt.signature", status: 401 },
    { authorization: `Bearer ${KEY}`, status: 401 },
    { changes: { MIDAS_OWNER_USER_ID: undefined }, status: 500 },
    { changes: { INCIDENTS_USER_ID: FOREIGN }, status: 500 },
    { changes: { SUPABASE_SECRET_KEYS: "{}" }, status: 500 },
    { changes: { SUPABASE_SECRET_KEYS: "broken" }, status: 500 },
    {
      changes: {
        SUPABASE_SECRET_KEYS: JSON.stringify({
          incidents_push_scheduler: "sb_publishable_wrong",
        }),
      },
      status: 500,
    },
    { body: { user_id: FOREIGN, dry_run: true }, status: 401 },
    { body: { user_id: "not-a-uuid", dry_run: true }, status: 401 },
    { body: { now: "2026-08-01T12:00:00Z" }, status: 400 },
    {
      body: { mode: "diagnostic", trigger: "scheduler", dry_run: true },
      status: 400,
    },
  ];
  for (const c of cases) {
    const spy = fixture();
    try {
      const response = await createHandler(reader(c.changes), spy.push)(
        request(
          Object.hasOwn(c, "key") ? c.key : KEY,
          c.body ?? { dry_run: true },
          c.authorization ?? null,
        ),
      );
      equal(response.status, c.status);
      equal(spy.calls.length, 0);
      equal(spy.effects(), { initializations: 0, pushes: 0 });
    } finally {
      spy.restore();
    }
  }
});
Deno.test("SUPA-L2 Incident named key and fixed owner reach scoped transport; manual/now dry-run retained", async () => {
  for (
    const body of [{ dry_run: true }, {
      user_id: OWNER.toUpperCase(),
      dry_run: true,
    }, {
      trigger: "manual",
      mode: "diagnostic",
      dry_run: true,
      now: "2026-08-01T12:00:00Z",
    }]
  ) {
    const spy = fixture();
    try {
      const response = await createHandler(reader(), spy.push)(
        request(KEY, body),
      );
      equal(response.status, 200);
      const result = await response.json();
      equal(result.results[0].userId, OWNER);
      equal(result.results[0].status, "no-subscriptions");
      equal(spy.calls.length, 1);
      equal(spy.calls[0].method, "GET");
      equal(spy.effects(), { initializations: 1, pushes: 0 });
    } finally {
      spy.restore();
    }
  }
});
