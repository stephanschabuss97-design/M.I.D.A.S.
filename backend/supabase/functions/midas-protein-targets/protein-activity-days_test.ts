import {
  createProteinActivityRuntime,
  validateProteinActivityDays,
} from "./protein-activity-days.ts";
import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
} from "../_shared/activity-edge-principal.ts";
import { ActivityConsumerRuntimeError } from "../_shared/activity-consumer-runtime.ts";

const TODAY = "2026-08-23";
const RANGE = { from: "2026-07-27", to: TODAY, inclusive_days: 28 };
const OWNER = "00000000-0000-4000-8000-000000000001";
const projection = (days: string[] = []) => ({
  schema_version: "midas.activity-protein-days.v1",
  timezone: "Europe/Vienna",
  range: RANGE,
  active_days: days,
  active_day_count: days.length,
});
const equal = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("Mismatch");
  }
};
const rejects = async (operation: () => unknown, code: string) => {
  try {
    await operation();
  } catch (error) {
    if (
      !(error instanceof ActivityConsumerRuntimeError) || error.code !== code ||
      String(error).includes("secret")
    ) throw error;
    return;
  }
  throw new Error("Expected safe rejection");
};

Deno.test("C4 isolated adapter binds user and scheduler RPCs to the principal", async () => {
  for (const mode of ["user", "scheduler"] as const) {
    const calls: unknown[] = [];
    const principal = {
      schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
      mode,
      owner_id: OWNER,
      rpc_client: {
        rpc: (name: string, payload: unknown) => {
          calls.push([name, payload]);
          return Promise.resolve({
            data: projection(["2026-08-02"]),
            error: null,
          });
        },
      },
    } as unknown as ActivityEdgePrincipal;
    const result = await createProteinActivityRuntime({ today: () => TODAY })
      .loadDays(principal, { from: RANGE.from, to: TODAY });
    equal(calls, [[
      mode === "user"
        ? "activity_protein_days"
        : "activity_protein_days_for_owner",
      {
        p_from: RANGE.from,
        p_to: TODAY,
        ...(mode === "scheduler" ? { p_owner: OWNER } : {}),
      },
    ]]);
    equal(result.active_day_count, 1);
    if (!Object.isFrozen(result.active_days)) throw new Error("Mutable days");
    await rejects(
      () =>
        createProteinActivityRuntime().loadDays({
          ...principal,
          owner_id: "secret",
        }, { from: RANGE.from, to: TODAY }),
      "SNAPSHOT_UNAVAILABLE",
    );
    equal(calls.length, 1);
  }
});

Deno.test("C4 day contract rejects malformed, duplicate, future, sparse and detail-bearing projections", async () => {
  equal(validateProteinActivityDays(projection(), TODAY).active_day_count, 0);
  const invalid = [
    { ...projection(), schema_version: "midas.activity-consumer.v1" },
    { ...projection(), timezone: "UTC" },
    { ...projection(), active_day_count: 1 },
    { ...projection(), units: ["secret"] },
    projection(["2026-08-02", "2026-08-02"]),
    projection(["2026-08-03", "2026-08-02"]),
    projection(["2026-08-24"]),
    projection(["2026-07-26"]),
    projection(["2026-02-30"]),
    projection(Array(1)),
    { ...projection(), range: { ...RANGE, inclusive_days: 27 } },
  ];
  const getter = projection();
  Object.defineProperty(getter, "active_days", {
    get() {
      throw new Error("secret");
    },
  });
  invalid.push(getter);
  for (const value of invalid) {
    await rejects(
      () => validateProteinActivityDays(value, TODAY),
      "CONTRACT_INVALID",
    );
  }
});

Deno.test("C4 adapter sanitizes RPC failures and never accepts a mismatched window", async () => {
  const runtime = createProteinActivityRuntime({ today: () => TODAY });
  for (
    const response of [{ error: "secret" }, {
      data: {
        ...projection(),
        range: { from: "2026-07-26", to: "2026-08-22", inclusive_days: 28 },
      },
    }]
  ) {
    const principal = {
      schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
      mode: "user",
      owner_id: OWNER,
      rpc_client: { rpc: () => Promise.resolve(response) },
    } as unknown as ActivityEdgePrincipal;
    await rejects(
      () => runtime.loadDays(principal, { from: RANGE.from, to: TODAY }),
      "error" in response ? "SNAPSHOT_UNAVAILABLE" : "CONTRACT_INVALID",
    );
  }
});
