import {
  type AuthModeWithKey,
  createSupabaseContext,
} from "npm:@supabase/server@1.4.1";
import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  ACTIVITY_EDGE_TARGETS,
  ActivityEdgePrincipalError,
  activityEdgePrincipalLog,
  type ActivityEdgeRpcClient,
  createActivityEdgePrincipal,
} from "./activity-edge-principal.ts";

const USER_ID = "00000000-0000-4000-8000-000000000013";
const PROTEIN_OWNER = "00000000-0000-4000-8000-000000000101";
const TREND_OWNER = "00000000-0000-4000-8000-000000000102";
const TEST_URL = "https://midas-test.supabase.co";
const PUBLISHABLE_KEY = `sb_publishable_${"p".repeat(48)}`;
const PROTEIN_KEY = `sb_secret_${"a".repeat(48)}`;
const TREND_KEY = `sb_secret_${"b".repeat(48)}`;
const LEGACY_KEY = `sb_secret_${"c".repeat(48)}`;
const LEGACY_USER_JWT = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "legacy-user-payload-without-kid",
  "legacy-signature",
].join(".");

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("Values differ");
  }
};

const fakeRpcClient = (): ActivityEdgeRpcClient => ({
  rpc: () => Promise.resolve({ data: null, error: null }),
});

const assertPrincipalError = async (
  callback: () => Promise<unknown>,
  code: ActivityEdgePrincipalError["code"],
  status: number,
  publicMessage: string,
) => {
  let caught: unknown;
  try {
    await callback();
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ActivityEdgePrincipalError);
  const safe = caught as ActivityEdgePrincipalError;
  assertEquals(safe.code, code);
  assertEquals(safe.status, status);
  assertEquals(safe.publicMessage, publicMessage);
  assertEquals(safe.message, "The activity edge principal request failed.");
  ["cause", "credential", "token", "jwt", "owner_id", "details"].forEach(
    (key) => assert(!Object.hasOwn(safe, key), `Unexpected ${key}`),
  );
};

const secretEnv = {
  url: TEST_URL,
  publishableKeys: { default: PUBLISHABLE_KEY },
  secretKeys: {
    default: LEGACY_KEY,
    "protein_targets_scheduler": PROTEIN_KEY,
    "trendpilot_scheduler": TREND_KEY,
  },
  jwks: { keys: [] },
};

const realContextDependency =
  (env: typeof secretEnv) =>
  async (request: Request, options: { auth: AuthModeWithKey[] }) =>
    await createSupabaseContext(request, { auth: options.auth, env }) as never;

const fakeUserClient = (
  user: { id?: unknown } | null,
  error: unknown = null,
  onToken: (token: string) => void = () => {},
) => ({
  ...fakeRpcClient(),
  auth: {
    getUser: (token: string) => {
      onToken(token);
      return Promise.resolve({ data: { user }, error });
    },
  },
});

const ownerReader = (name: string) =>
  name === "PROTEIN_TARGETS_USER_ID"
    ? PROTEIN_OWNER
    : name === "TRENDPILOT_USER_ID"
    ? TREND_OWNER
    : undefined;

Deno.test("T-ACT-R13-L01 freezes the two exact auth mode contracts", () => {
  assertEquals(ACTIVITY_EDGE_TARGETS.protein.authModes, [
    "user",
    "secret:protein_targets_scheduler",
  ]);
  assertEquals(ACTIVITY_EDGE_TARGETS.trendpilot.authModes, [
    "user",
    "secret:trendpilot_scheduler",
  ]);
  assert(Object.isFrozen(ACTIVITY_EDGE_TARGETS));
  assert(Object.isFrozen(ACTIVITY_EDGE_TARGETS.protein));
  assert(Object.isFrozen(ACTIVITY_EDGE_TARGETS.protein.authModes));
});

Deno.test("T-ACT-R13-L01 authenticates a legacy user JWT through Supabase Auth", async () => {
  let observedToken = "";
  const rpcClient = fakeUserClient({ id: USER_ID }, null, (token) => {
    observedToken = token;
  });
  const principal = await createActivityEdgePrincipal(
    new Request(TEST_URL, {
      headers: { Authorization: `Bearer ${LEGACY_USER_JWT}` },
    }),
    "protein",
    {
      createContext: () => {
        throw new Error("secret validation must not run for a bearer caller");
      },
      createUserClient: () => rpcClient,
      readEnv: ownerReader,
    },
  );
  assertEquals(principal.schema_version, ACTIVITY_EDGE_PRINCIPAL_SCHEMA);
  assertEquals(principal.mode, "user");
  assertEquals(principal.owner_id, USER_ID);
  assertEquals(observedToken, LEGACY_USER_JWT);
  assertEquals(principal.rpc_client, rpcClient);
  assert(Object.isFrozen(principal));
});

Deno.test("T-ACT-R13-L01 authenticates only the target-specific named secret", async () => {
  const createContext = realContextDependency(secretEnv);
  const protein = await createActivityEdgePrincipal(
    new Request(TEST_URL, { headers: { apikey: PROTEIN_KEY } }),
    "protein",
    { createContext, readEnv: ownerReader },
  );
  const trend = await createActivityEdgePrincipal(
    new Request(TEST_URL, { headers: { apikey: TREND_KEY } }),
    "trendpilot",
    { createContext, readEnv: ownerReader },
  );
  assertEquals([protein.mode, protein.owner_id], ["scheduler", PROTEIN_OWNER]);
  assertEquals([trend.mode, trend.owner_id], ["scheduler", TREND_OWNER]);
  assert(protein.rpc_client !== trend.rpc_client);

  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(
        new Request(TEST_URL, { headers: { apikey: TREND_KEY } }),
        "protein",
        { createContext, readEnv: ownerReader },
      ),
    "UNAUTHORIZED",
    401,
    "Unauthorized",
  );
});

Deno.test("T-ACT-R13-L01 rejects public, legacy, bearer-secret and malformed callers", async () => {
  const createContext = realContextDependency(secretEnv);
  const requests = [
    new Request(TEST_URL),
    new Request(TEST_URL, { headers: { apikey: PUBLISHABLE_KEY } }),
    new Request(TEST_URL, { headers: { apikey: LEGACY_KEY } }),
  ];
  for (const request of requests) {
    await assertPrincipalError(
      () =>
        createActivityEdgePrincipal(request, "protein", {
          createContext,
          readEnv: ownerReader,
        }),
      "UNAUTHORIZED",
      401,
      "Unauthorized",
    );
  }
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(
        new Request(TEST_URL, {
          headers: { Authorization: `Bearer ${PROTEIN_KEY}` },
        }),
        "protein",
        {
          createUserClient: () =>
            fakeUserClient(
              null,
              Object.assign(new Error("invalid"), {
                status: 401,
              }),
            ),
        },
      ),
    "UNAUTHORIZED",
    401,
    "Unauthorized",
  );
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(
        new Request(TEST_URL, { headers: { Authorization: "not-a-bearer" } }),
        "protein",
      ),
    "UNAUTHORIZED",
    401,
    "Unauthorized",
  );
});

Deno.test("T-ACT-R13-L01 never falls back from a failed bearer to a scheduler secret", async () => {
  let schedulerCalls = 0;
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(
        new Request(TEST_URL, {
          headers: {
            Authorization: `Bearer ${LEGACY_USER_JWT}`,
            apikey: PROTEIN_KEY,
          },
        }),
        "protein",
        {
          createContext: () => {
            schedulerCalls += 1;
            return Promise.resolve({ data: null, error: null });
          },
          createUserClient: () =>
            fakeUserClient(
              null,
              Object.assign(new Error("expired"), {
                status: 401,
              }),
            ),
        },
      ),
    "UNAUTHORIZED",
    401,
    "Unauthorized",
  );
  assertEquals(schedulerCalls, 0);
});

Deno.test("T-ACT-R13-L01 fails closed on owner or auth configuration", async () => {
  const client = fakeRpcClient();
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(new Request(TEST_URL), "protein", {
        createContext: (_request, options) => {
          assertEquals(options.auth, [
            "secret:protein_targets_scheduler",
          ]);
          return Promise.resolve({
            data: {
              supabase: client,
              supabaseAdmin: client,
              userClaims: null,
              authMode: "secret",
              authKeyName: "protein_targets_scheduler",
            },
            error: null,
          });
        },
        readEnv: () => undefined,
      }),
    "SERVER_CONFIGURATION_UNAVAILABLE",
    500,
    "Server configuration unavailable",
  );
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(new Request(TEST_URL), "protein", {
        createContext: () =>
          Promise.resolve({
            data: null,
            error: Object.assign(new Error("raw auth detail"), { status: 500 }),
          }),
      }),
    "SERVER_CONFIGURATION_UNAVAILABLE",
    500,
    "Server configuration unavailable",
  );
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(
        new Request(TEST_URL, {
          headers: { Authorization: `Bearer ${LEGACY_USER_JWT}` },
        }),
        "protein",
        {
          createUserClient: () => fakeUserClient({ id: "invalid-owner" }),
        },
      ),
    "UNAUTHORIZED",
    401,
    "Unauthorized",
  );
  await assertPrincipalError(
    () =>
      createActivityEdgePrincipal(
        new Request(TEST_URL, {
          headers: { Authorization: `Bearer ${LEGACY_USER_JWT}` },
        }),
        "protein",
        {
          createUserClient: () =>
            fakeUserClient(
              null,
              Object.assign(new Error("auth unavailable"), {
                status: 503,
              }),
            ),
        },
      ),
    "SERVER_CONFIGURATION_UNAVAILABLE",
    500,
    "Server configuration unavailable",
  );
});

Deno.test("T-ACT-R13-L01 exposes only sanitized log fields", () => {
  const entry = activityEdgePrincipalLog(
    "authenticateProteinTarget",
    new ActivityEdgePrincipalError("UNAUTHORIZED"),
  );
  assertEquals(entry, {
    operation: "authenticateProteinTarget",
    code: "UNAUTHORIZED",
    status: 401,
    mode: null,
  });
  assert(Object.isFrozen(entry));
});
