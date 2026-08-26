import {
  type ActivityConsumerUnit,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";
import {
  ActivityConsumerRuntimeError,
  createActivityConsumerRuntime,
} from "./activity-consumer-runtime.ts";
import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
} from "./activity-edge-principal.ts";

const TODAY = "2026-08-24";
const OWNER = "00000000-0000-4000-8000-000000000013";

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}`);
  }
};

const unit: ActivityConsumerUnit = {
  source: "activity_v1",
  id: "00000000-0000-4000-8000-000000000001",
  day: "2026-08-24",
  occurred_at: "2026-08-24T08:00:00.000Z",
  label: "Training",
  duration_min: 45,
  note: null,
  item_count: null,
};

const snapshot = aggregateActivityUnits(
  [unit],
  { from: "2026-08-24", to: "2026-08-24", inclusive_days: 1 },
  TODAY,
);

const principal = (
  mode: ActivityEdgePrincipal["mode"],
  rpc: ActivityEdgePrincipal["rpc_client"]["rpc"],
): ActivityEdgePrincipal =>
  Object.freeze({
    schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
    mode,
    owner_id: OWNER,
    rpc_client: { rpc },
  });

const assertRuntimeError = async (
  callback: () => Promise<unknown>,
  code: ActivityConsumerRuntimeError["code"],
  status: number,
  publicMessage: string,
) => {
  let caught: unknown;
  try {
    await callback();
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ActivityConsumerRuntimeError);
  const safe = caught as ActivityConsumerRuntimeError;
  assertEquals(safe.code, code);
  assertEquals(safe.status, status);
  assertEquals(safe.publicMessage, publicMessage);
  assertEquals(safe.message, "The activity consumer runtime request failed.");
  ["cause", "payload", "owner_id", "details", "hint"].forEach((key) =>
    assert(!Object.hasOwn(safe, key), `Unexpected ${key}`)
  );
};

Deno.test("T-ACT-R13-L01 routes user and scheduler through exactly one RPC", async () => {
  const calls: Array<{ name: string; payload: Record<string, unknown> }> = [];
  const rpc = (name: string, payload: Record<string, unknown>) => {
    calls.push({ name, payload });
    return Promise.resolve({ data: snapshot, error: null });
  };
  const runtime = createActivityConsumerRuntime({ today: () => TODAY });
  await runtime.loadSnapshot(principal("user", rpc), {
    from: "2026-08-24",
    to: "2026-08-24",
  });
  await runtime.loadSnapshot(principal("scheduler", rpc), {
    from: "2026-08-24",
    to: "2026-08-24",
  });
  assertEquals(calls, [
    {
      name: "activity_consumer_snapshot",
      payload: { p_from: "2026-08-24", p_to: "2026-08-24" },
    },
    {
      name: "activity_consumer_snapshot_for_owner",
      payload: {
        p_from: "2026-08-24",
        p_to: "2026-08-24",
        p_owner: OWNER,
      },
    },
  ]);
  assert(Object.isFrozen(runtime));
});

Deno.test("T-ACT-R13-L01 rejects invalid, future and oversized ranges before IO", async () => {
  let calls = 0;
  const p = principal("user", () => {
    calls += 1;
    return Promise.resolve({ data: snapshot, error: null });
  });
  const runtime = createActivityConsumerRuntime({ today: () => TODAY });
  const invalid = [
    { from: "2026-08-25", to: "2026-08-25" },
    { from: "2025-07-20", to: "2026-08-24" },
    { from: "2026-08-24", to: "2026-08-24", extra: true },
    { from: "not-a-day", to: "2026-08-24" },
  ];
  for (const range of invalid) {
    await assertRuntimeError(
      () => runtime.loadSnapshot(p, range),
      "INVALID_RANGE",
      400,
      "Invalid range",
    );
  }
  assertEquals(calls, 0);
});

Deno.test("T-ACT-R13-L01 sanitizes RPC and contract failures", async () => {
  const runtime = createActivityConsumerRuntime({ today: () => TODAY });
  const range = { from: "2026-08-24", to: "2026-08-24" };
  await assertRuntimeError(
    () =>
      runtime.loadSnapshot(
        principal(
          "user",
          () => Promise.reject(new Error("database credential detail")),
        ),
        range,
      ),
    "SNAPSHOT_UNAVAILABLE",
    502,
    "Activity snapshot unavailable",
  );
  await assertRuntimeError(
    () =>
      runtime.loadSnapshot(
        principal("user", () =>
          Promise.resolve({
            data: null,
            error: { message: "MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE raw" },
          })),
        range,
      ),
    "INVALID_RANGE",
    400,
    "Invalid range",
  );
  await assertRuntimeError(
    () =>
      runtime.loadSnapshot(
        principal("user", () =>
          Promise.resolve({
            data: { ...snapshot, extra: true },
            error: null,
          })),
        range,
      ),
    "CONTRACT_INVALID",
    502,
    "Activity snapshot unavailable",
  );
});

Deno.test("T-ACT-R13-L01 rejects forged principal contracts before IO", async () => {
  let calls = 0;
  const runtime = createActivityConsumerRuntime({ today: () => TODAY });
  const forged = {
    ...principal("user", () => {
      calls += 1;
      return Promise.resolve({ data: snapshot, error: null });
    }),
    schema_version: "forged",
  } as unknown as ActivityEdgePrincipal;
  await assertRuntimeError(
    () =>
      runtime.loadSnapshot(forged, {
        from: "2026-08-24",
        to: "2026-08-24",
      }),
    "SNAPSHOT_UNAVAILABLE",
    502,
    "Activity snapshot unavailable",
  );
  assertEquals(calls, 0);
});
