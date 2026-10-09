import { createSupabaseContext } from "npm:@supabase/server@1.4.1";
import {
  authenticateMidasUser,
  createEdgeUserClient,
  EdgeAuthError,
  type EdgeAuthUser,
  readBoundSchedulerOwner,
  readMidasOwner,
  readNamedSchedulerEnv,
  readServerPublishableKey,
  readServerSecretKey,
  readUserBearer,
} from "./edge-auth.ts";
import {
  ActivityEdgePrincipalError,
  createActivityEdgePrincipal,
} from "./activity-edge-principal.ts";
import { createProteinTargetsHandler } from "../midas-protein-targets/index.ts";
import { createTrendpilotHandler } from "../midas-trendpilot/index.ts";
import {
  type ActivityConsumerRange,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";

const OWNER = "00000000-0000-4000-8000-000000000013";
const FOREIGN = "00000000-0000-4000-8000-000000000014";
const URL = "https://midas-fixture.supabase.co";
const PUBLIC = "sb_publishable_fixture_public";
const PROTEIN = "sb_secret_fixture_protein";
const TREND = "sb_secret_fixture_trend";
const TOKEN = "fixture_header.fixture_payload.fixture_signature";
const TODAY = "2026-08-23";
const BASE: Record<string, string> = {
  MIDAS_OWNER_USER_ID: OWNER,
  PROTEIN_TARGETS_USER_ID: OWNER,
  TRENDPILOT_USER_ID: OWNER,
  SUPABASE_URL: URL,
  SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUBLIC }),
  SUPABASE_SECRET_KEYS: JSON.stringify({
    protein_targets_scheduler: PROTEIN,
    trendpilot_scheduler: TREND,
  }),
};
const reader =
  (changes: Record<string, string | undefined> = {}) => (name: string) =>
    ({ ...BASE, ...changes })[name];
const request = (
  authorization: string | null = `Bearer ${TOKEN}`,
  apikey = PUBLIC,
  body: unknown = { dry_run: true, weight_kg: 80, dayIso: TODAY },
) =>
  new Request(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
      ...(authorization === null ? {} : { authorization }),
    },
    body: JSON.stringify(body),
  });
const equal = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Fixture oracle mismatch (${
        typeof actual === "number" ? actual : typeof actual
      } / ${typeof expected === "number" ? expected : typeof expected})`,
    );
  }
};
const assert = (condition: unknown) => {
  if (!condition) throw new Error("Fixture assertion failed");
};
const rejected = async (run: () => unknown, status: number) => {
  let error: unknown;
  try {
    await run();
  } catch (caught) {
    error = caught;
  }
  assert(
    error instanceof EdgeAuthError ||
      error instanceof ActivityEdgePrincipalError,
  );
  equal((error as EdgeAuthError).status, status);
  const encoded = JSON.stringify(error);
  for (
    const privateValue of [
      OWNER,
      FOREIGN,
      TOKEN,
      PROTEIN,
      TREND,
      "raw-private-detail",
    ]
  ) assert(!encoded.includes(privateValue));
  assert(!Object.hasOwn(error as object, "cause"));
};
const legacy = (role: string) =>
  `${btoa(JSON.stringify({ alg: "HS256" })).replace(/=/g, "")}.${
    btoa(JSON.stringify({ role })).replace(/=/g, "")
  }.synthetic_signature`;

Deno.test("SUPA-L1 public-map presence and selected default fail closed", async () => {
  equal(readServerPublishableKey(reader()), PUBLIC);
  equal(
    readServerPublishableKey(
      reader({
        SUPABASE_PUBLISHABLE_KEYS: undefined,
        SUPABASE_ANON_KEY: legacy("anon"),
      }),
    ),
    legacy("anon"),
  );
  for (
    const raw of [
      "",
      " ",
      "bad-json",
      "null",
      "[]",
      "{}",
      '{"other":"sb_publishable_other"}',
      JSON.stringify({ default: null }),
      JSON.stringify({ default: 7 }),
      JSON.stringify({ default: PROTEIN }),
      JSON.stringify({ default: "Bearer " + PUBLIC }),
      JSON.stringify({ default: PUBLIC + " " }),
      JSON.stringify({ default: legacy("anon") }),
    ]
  ) {
    await rejected(
      () =>
        readServerPublishableKey(
          reader({
            SUPABASE_PUBLISHABLE_KEYS: raw,
            SUPABASE_ANON_KEY: legacy("anon"),
            SUPABASE_PUBLISHABLE_KEY: PUBLIC,
          }),
        ),
      500,
    );
  }
  for (const key of [PUBLIC, PROTEIN, legacy("service_role"), TOKEN, "bad"]) {
    await rejected(
      () =>
        readServerPublishableKey(
          reader({
            SUPABASE_PUBLISHABLE_KEYS: undefined,
            SUPABASE_ANON_KEY: key,
          }),
        ),
      500,
    );
  }
});

Deno.test("SUPA-L1 named secret selection never uses default/first/singular fallback", async () => {
  equal(readServerSecretKey("protein_targets_scheduler", reader()), PROTEIN);
  equal(readServerSecretKey("trendpilot_scheduler", reader()), TREND);
  equal(
    readServerSecretKey(
      "monthly_report_backend",
      reader({
        SUPABASE_SECRET_KEYS: undefined,
        SUPABASE_SERVICE_ROLE_KEY: legacy("service_role"),
      }),
    ),
    legacy("service_role"),
  );
  for (
    const raw of [
      "",
      "bad",
      "null",
      "[]",
      "{}",
      JSON.stringify({ default: PROTEIN }),
      JSON.stringify({ trendpilot_scheduler: TREND }),
      JSON.stringify({ protein_targets_scheduler: PUBLIC }),
      JSON.stringify({ protein_targets_scheduler: null }),
      JSON.stringify({ protein_targets_scheduler: PROTEIN + " " }),
    ]
  ) {
    await rejected(
      () =>
        readServerSecretKey(
          "protein_targets_scheduler",
          reader({
            SUPABASE_SECRET_KEYS: raw,
            SUPABASE_SECRET_KEY: PROTEIN,
            SUPABASE_SERVICE_ROLE_KEY: legacy("service_role"),
          }),
        ),
      500,
    );
  }
  await rejected(
    () =>
      readNamedSchedulerEnv(
        "protein_targets_scheduler",
        reader({
          SUPABASE_SECRET_KEYS: undefined,
          SUPABASE_SERVICE_ROLE_KEY: legacy("service_role"),
        }),
      ),
    500,
  );
});

Deno.test("SUPA-L1 fixed owner and both scheduler stores must agree", async () => {
  equal(readMidasOwner(reader()), OWNER);
  equal(
    readMidasOwner(reader({ MIDAS_OWNER_USER_ID: OWNER.toUpperCase() })),
    OWNER,
  );
  for (const name of ["PROTEIN_TARGETS_USER_ID", "TRENDPILOT_USER_ID"]) {
    equal(readBoundSchedulerOwner(name, reader()), OWNER);
    for (const value of [undefined, "", "not-a-uuid", FOREIGN]) {
      await rejected(
        () => readBoundSchedulerOwner(name, reader({ [name]: value })),
        500,
      );
    }
  }
  for (const value of [undefined, "", "not-a-uuid"]) {
    await rejected(
      () => readMidasOwner(reader({ MIDAS_OWNER_USER_ID: value })),
      500,
    );
  }
});

Deno.test("SUPA-L1 bearer grammar rejects keys and never becomes a scheduler", async () => {
  equal(readUserBearer(request()), TOKEN);
  equal(readUserBearer(request(null)), null);
  for (
    const value of [
      "",
      "Basic " + TOKEN,
      "bearer " + TOKEN,
      "Bearer bad",
      "Bearer " + PROTEIN,
      "Bearer " + PUBLIC,
      "Bearer a.b.",
      "Bearer a.b.c extra",
    ]
  ) {
    await rejected(() => readUserBearer(request(value, PROTEIN)), 401);
  }
});

type FixtureOptions = {
  user?: EdgeAuthUser | null;
  error?: unknown;
  throws?: boolean;
};
const fixture = (options: FixtureOptions = {}) => {
  const effects = {
    auth: 0,
    from: 0,
    rpc: [] as Array<{ name: string; payload: Record<string, unknown> }>,
    writes: 0,
    filters: [] as Array<[string, unknown]>,
  };
  const client = {
    auth: {
      getUser: (token: string) => {
        effects.auth++;
        equal(token, TOKEN);
        if (options.throws) throw new Error("raw-private-detail");
        return Promise.resolve({
          data: {
            user: options.user === undefined
              ? { id: OWNER, is_anonymous: false }
              : options.user,
          },
          error: options.error ?? null,
        });
      },
    },
    rpc: (name: string, payload: Record<string, unknown>) => {
      effects.rpc.push({ name, payload });
      const range = {
        from: payload.p_from as string,
        to: payload.p_to as string,
      };
      const data = name.startsWith("activity_protein_days")
        ? {
          schema_version: "midas.activity-protein-days.v1",
          timezone: "Europe/Vienna",
          range: { ...range, inclusive_days: 28 },
          active_days: [],
          active_day_count: 0,
        }
        : aggregateActivityUnits(
          [],
          {
            ...range,
            inclusive_days: Math.round(
              (Date.parse(range.to) - Date.parse(range.from)) / 86400000,
            ) + 1,
          } as ActivityConsumerRange,
          TODAY,
        );
      return Promise.resolve({ data, error: null });
    },
    from: (table: string) => {
      effects.from++;
      const data = table === "user_profile"
        ? {
          user_id: OWNER,
          birth_date: "1980-01-01",
          protein_ckd_stage_g: "G2",
          protein_doctor_lock: false,
        }
        : [];
      const query = {
        select: () => query,
        order: () => query,
        limit: () => query,
        gte: () => query,
        lte: () => query,
        in: () => query,
        eq: (key: string, value: unknown) => {
          effects.filters.push([key, value]);
          return query;
        },
        maybeSingle: () =>
          Promise.resolve({
            data: table === "user_profile" ? data : null,
            error: null,
          }),
        update: () => {
          effects.writes++;
          return query;
        },
        upsert: () => {
          effects.writes++;
          return query;
        },
        then: (resolve: (value: { data: unknown; error: null }) => unknown) =>
          Promise.resolve({ data, error: null }).then(resolve),
      };
      return query;
    },
  };
  return { client, effects };
};

Deno.test("SUPA-L1 strict nonanonymous identity and sanitized Auth failures", async () => {
  const positive = fixture();
  const auth = await authenticateMidasUser(
    request(),
    () => positive.client,
    reader(),
  );
  equal(auth.owner_id, OWNER);
  assert(auth.client === positive.client);
  equal(positive.effects.auth, 1);
  for (
    const user of [
      null,
      { id: FOREIGN, is_anonymous: false },
      { id: "bad", is_anonymous: false },
      { id: OWNER },
      { id: OWNER, is_anonymous: true },
      { id: OWNER, is_anonymous: "false" },
      { id: OWNER, is_anonymous: null },
    ]
  ) {
    const negative = fixture({ user });
    await rejected(
      () => authenticateMidasUser(request(), () => negative.client, reader()),
      401,
    );
    equal(negative.effects.auth, 1);
    equal(negative.effects.from, 0);
    equal(negative.effects.rpc.length, 0);
  }
  for (const status of [401, 403, 503]) {
    const value = fixture({ error: { status, message: "raw-private-detail" } });
    await rejected(
      () => authenticateMidasUser(request(), () => value.client, reader()),
      status === 503 ? 500 : 401,
    );
  }
  await rejected(
    () =>
      authenticateMidasUser(
        request(),
        () => fixture({ throws: true }).client,
        reader(),
      ),
    500,
  );
  let getterCalls = 0;
  const accessorError = Object.defineProperty({}, "status", {
    get: () => {
      getterCalls++;
      return 401;
    },
  });
  await rejected(
    () =>
      authenticateMidasUser(
        request(),
        () => fixture({ error: accessorError }).client,
        reader(),
      ),
    500,
  );
  equal(getterCalls, 0);
});

Deno.test("SUPA-L1 default user transport uses public apikey and verified JWT, no secret", async () => {
  const original = globalThis.fetch;
  const calls: Array<
    { path: string; apikey: string | null; authorization: string | null }
  > = [];
  try {
    globalThis.fetch = (input, init) => {
      const req = new Request(input, init);
      calls.push({
        path: new globalThis.URL(req.url).pathname,
        apikey: req.headers.get("apikey"),
        authorization: req.headers.get("authorization"),
      });
      return Promise.resolve(
        new Response(
          JSON.stringify({
            id: OWNER,
            is_anonymous: false,
            aud: "authenticated",
            role: "authenticated",
            app_metadata: {},
            user_metadata: {},
            created_at: "2026-01-01T00:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    };
    const auth = await authenticateMidasUser(
      request(),
      (token) => createEdgeUserClient(token, reader()),
      reader(),
    );
    equal(auth.owner_id, OWNER);
    equal(calls, [{
      path: "/auth/v1/user",
      apikey: PUBLIC,
      authorization: `Bearer ${TOKEN}`,
    }]);
  } finally {
    globalThis.fetch = original;
  }
});

const consumers = [
  {
    target: "protein" as const,
    factory: createProteinTargetsHandler,
    key: PROTEIN,
    ownerEnv: "PROTEIN_TARGETS_USER_ID",
  },
  {
    target: "trendpilot" as const,
    factory: createTrendpilotHandler,
    key: TREND,
    ownerEnv: "TRENDPILOT_USER_ID",
  },
];
const handler = (
  consumer: typeof consumers[number],
  value: ReturnType<typeof fixture>,
  changes: Record<string, string | undefined> = {},
  onContext: () => void = () => {},
) =>
  consumer.factory({
    now: () => new Date(`${TODAY}T12:00:00Z`),
    createPrincipal: (req, target) =>
      createActivityEdgePrincipal(req, target, {
        readEnv: reader(changes),
        createUserClient: () => value.client,
        createContext: async (req, options) => {
          onContext();
          const result = await createSupabaseContext(req, options);
          if (result.error || !result.data) return result as never;
          // Keep real SDK credential validation; attach the observed data fixture only after it succeeds.
          return {
            data: { ...result.data, supabaseAdmin: value.client },
            error: null,
          } as never;
        },
      }),
  });

for (const consumer of consumers) {
  Deno.test(`SUPA-L1 ${consumer.target} actual principal-to-handler negatives have zero data effects`, async () => {
    const negatives: Array<
      {
        options?: FixtureOptions;
        authorization?: string | null;
        apikey?: string;
        changes?: Record<string, string | undefined>;
        status: number;
      }
    > = [
      { options: { user: null }, status: 401 },
      { options: { user: { id: FOREIGN, is_anonymous: false } }, status: 401 },
      { options: { user: { id: OWNER, is_anonymous: true } }, status: 401 },
      { options: { user: { id: OWNER } }, status: 401 },
      { options: { user: { id: OWNER, is_anonymous: "false" } }, status: 401 },
      {
        options: { error: { status: 401, message: "raw-private-detail" } },
        status: 401,
      },
      {
        options: { error: { status: 503, message: "raw-private-detail" } },
        status: 500,
      },
      { options: { throws: true }, status: 500 },
      { changes: { MIDAS_OWNER_USER_ID: undefined }, status: 500 },
      { changes: { MIDAS_OWNER_USER_ID: "bad" }, status: 500 },
      { changes: { [consumer.ownerEnv]: FOREIGN }, status: 500 },
      { changes: { [consumer.ownerEnv]: undefined }, status: 500 },
      { authorization: "Bearer bad", apikey: consumer.key, status: 401 },
      {
        authorization: `Bearer ${consumer.key}`,
        apikey: consumer.key,
        status: 401,
      },
      {
        options: { error: { status: 401 } },
        apikey: consumer.key,
        status: 401,
      },
      { authorization: null, apikey: PUBLIC, status: 401 },
      {
        authorization: null,
        apikey: consumer.key === PROTEIN ? TREND : PROTEIN,
        status: 401,
      },
      { authorization: null, apikey: legacy("service_role"), status: 401 },
      {
        authorization: null,
        apikey: consumer.key,
        changes: {
          SUPABASE_SECRET_KEYS: "{}",
          SUPABASE_SERVICE_ROLE_KEY: legacy("service_role"),
        },
        status: 500,
      },
    ];
    const originalFetch = globalThis.fetch;
    const originalLog = console.error;
    let remoteCalls = 0;
    try {
      globalThis.fetch = () => {
        remoteCalls++;
        throw new Error("Unexpected remote effect");
      };
      console.error = (...args) => {
        const text = JSON.stringify(args);
        for (
          const hidden of [
            OWNER,
            FOREIGN,
            TOKEN,
            PROTEIN,
            TREND,
            "raw-private-detail",
          ]
        ) assert(!text.includes(hidden));
      };
      for (const negative of negatives) {
        const value = fixture(negative.options);
        let contextCalls = 0;
        const res = await handler(
          consumer,
          value,
          negative.changes,
          () => contextCalls++,
        )(request(
          negative.authorization === undefined
            ? `Bearer ${TOKEN}`
            : negative.authorization,
          negative.apikey ?? PUBLIC,
        ));
        equal(res.status, negative.status);
        equal(await res.json(), {
          ...(consumer.target === "trendpilot" ? { ok: false } : {}),
          error: negative.status === 401
            ? "Unauthorized"
            : "Server configuration unavailable",
        });
        equal(value.effects.from, 0);
        equal(value.effects.rpc.length, 0);
        equal(value.effects.writes, 0);
        if (negative.authorization !== null) equal(contextCalls, 0);
      }
      equal(remoteCalls, 0);
    } finally {
      globalThis.fetch = originalFetch;
      console.error = originalLog;
    }
  });

  Deno.test(`SUPA-L1 ${consumer.target} verified user and real named secret reach owner-bound data chain`, async () => {
    for (const scheduler of [false, true]) {
      const value = fixture();
      let contexts = 0;
      const res = await handler(consumer, value, {}, () => contexts++)(
        request(
          scheduler ? null : `Bearer ${TOKEN}`,
          scheduler ? consumer.key : PUBLIC,
          consumer.target === "protein"
            ? { dry_run: true, weight_kg: 80, dayIso: TODAY }
            : { dry_run: true, range: { from: "2026-07-27", to: TODAY } },
        ),
      );
      equal(res.status, 200);
      const payload = await res.json();
      equal(payload.ok, true);
      equal(payload.dry_run, true);
      assert(value.effects.from > 0);
      assert(value.effects.rpc.length > 0);
      equal(value.effects.writes, 0);
      equal(value.effects.auth, scheduler ? 0 : 1);
      equal(contexts, scheduler ? 1 : 0);
      for (const [name, owner] of value.effects.filters) {
        if (name === "user_id") equal(owner, OWNER);
      }
      for (const rpc of value.effects.rpc) {
        if (scheduler) {
          equal(rpc.payload.p_owner, OWNER);
          assert(rpc.name.endsWith("_for_owner"));
        } else {
          assert(!Object.hasOwn(rpc.payload, "p_owner"));
          assert(!rpc.name.endsWith("_for_owner"));
        }
      }
    }
  });
}
