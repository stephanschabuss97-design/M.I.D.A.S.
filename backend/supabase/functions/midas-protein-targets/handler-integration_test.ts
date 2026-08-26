import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
  ActivityEdgePrincipalError,
} from "../_shared/activity-edge-principal.ts";
import { createActivityConsumerRuntime } from "../_shared/activity-consumer-runtime.ts";
import {
  type ActivityConsumerUnit,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";
import { createProteinTargetsHandler } from "./index.ts";

const OWNER = "00000000-0000-4000-8000-000000000001";
const TODAY = "2026-08-23";
const RANGE = { from: "2026-07-27", to: TODAY, inclusive_days: 28 };
const NOW = new Date("2026-08-23T12:00:00.000Z");

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
};

const uuid = (value: number) =>
  `10000000-0000-4000-8000-${String(value).padStart(12, "0")}`;

const snapshotFor = (activeDays: number) => {
  const units: ActivityConsumerUnit[] = Array.from(
    { length: activeDays },
    (_, index) => {
      const day = new Date(
        Date.parse("2026-08-01T00:00:00.000Z") + index * 86_400_000,
      )
        .toISOString().slice(0, 10);
      return {
        source: index % 2 ? "activity_v2" : "activity_v1",
        id: uuid(index + 1),
        day,
        occurred_at: `${day}T10:00:00.000Z`,
        label: "Aktivität",
        duration_min: 30,
        note: null,
        item_count: index % 2 ? 1 : null,
      };
    },
  );
  return aggregateActivityUnits(units, RANGE, TODAY);
};

type FakeQueryRecord = {
  table: string;
  operation: "select" | "update";
  filters: Record<string, unknown>;
  updatePayload: Record<string, unknown> | null;
};

type FakeClientOptions = {
  snapshot?: unknown;
  rpcError?: unknown;
  profile?: Record<string, unknown> | null;
  profileError?: unknown;
  labRows?: unknown[];
  labError?: unknown;
  bodyRows?: unknown[];
  bodyError?: unknown;
  updateError?: unknown;
};

const baseProfile = (overrides: Record<string, unknown> = {}) => ({
  user_id: OWNER,
  birth_date: "1980-01-01",
  protein_doctor_lock: false,
  protein_doctor_factor: null,
  protein_doctor_min: null,
  protein_doctor_max: null,
  protein_last_calc_at: null,
  protein_target_min: null,
  protein_target_max: null,
  protein_ckd_stage_g: "G2",
  protein_calc_version: null,
  protein_window_days: null,
  protein_age_base: null,
  protein_activity_level: null,
  protein_activity_score_28d: null,
  protein_factor_pre_ckd: null,
  protein_ckd_factor: null,
  protein_factor_current: null,
  ...overrides,
});

const createFakeClient = (options: FakeClientOptions = {}) => {
  const queries: FakeQueryRecord[] = [];
  const rpcCalls: Array<
    { functionName: string; payload: Record<string, unknown> }
  > = [];

  const resultFor = (record: FakeQueryRecord) => {
    if (record.operation === "update") {
      return { data: null, error: options.updateError ?? null };
    }
    if (record.table === "user_profile") {
      return {
        data: options.profile === undefined ? baseProfile() : options.profile,
        error: options.profileError ?? null,
      };
    }
    if (record.filters.type === "body") {
      return { data: options.bodyRows ?? [], error: options.bodyError ?? null };
    }
    if (record.filters.type === "lab_event") {
      return { data: options.labRows ?? [], error: options.labError ?? null };
    }
    return { data: [], error: null };
  };

  class FakeQuery implements PromiseLike<unknown> {
    record: FakeQueryRecord;

    constructor(table: string) {
      this.record = {
        table,
        operation: "select",
        filters: {},
        updatePayload: null,
      };
      queries.push(this.record);
    }

    select() {
      return this;
    }

    update(payload: Record<string, unknown>) {
      this.record.operation = "update";
      this.record.updatePayload = structuredClone(payload);
      return this;
    }

    eq(column: string, value: unknown) {
      this.record.filters[column] = value;
      return this;
    }

    order() {
      return this;
    }

    limit() {
      return this;
    }

    maybeSingle() {
      return Promise.resolve(resultFor(this.record));
    }

    then<TResult1 = unknown, TResult2 = never>(
      onfulfilled?:
        | ((value: unknown) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ): PromiseLike<TResult1 | TResult2> {
      return Promise.resolve(resultFor(this.record)).then(
        onfulfilled,
        onrejected,
      );
    }
  }

  const client = {
    from(table: string) {
      return new FakeQuery(table);
    },
    rpc(functionName: string, payload: Record<string, unknown>) {
      rpcCalls.push({ functionName, payload: structuredClone(payload) });
      return Promise.resolve({
        data: options.snapshot ?? snapshotFor(2),
        error: options.rpcError ?? null,
      });
    },
  };
  return { client, queries, rpcCalls };
};

const createPrincipalFactory = (
  client: ReturnType<typeof createFakeClient>["client"],
  mode: ActivityEdgePrincipal["mode"] = "user",
) =>
(_request: Request, target: "protein" | "trendpilot") => {
  assertEquals(target, "protein");
  return Promise.resolve(Object.freeze({
    schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
    mode,
    owner_id: OWNER,
    rpc_client: client,
  }) as ActivityEdgePrincipal);
};

const request = (body: Record<string, unknown>) =>
  new Request(
    "http://localhost/functions/v1/midas-protein-targets",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );

const run = async (
  body: Record<string, unknown>,
  options: FakeClientOptions = {},
  mode: ActivityEdgePrincipal["mode"] = "user",
) => {
  const fake = createFakeClient(options);
  const handler = createProteinTargetsHandler({
    createPrincipal: createPrincipalFactory(fake.client, mode),
    activityRuntime: createActivityConsumerRuntime({ today: () => TODAY }),
    now: () => new Date(NOW),
  });
  const response = await handler(request(body));
  const payload = await response.json();
  return { ...fake, response, payload };
};

const assertOwnerFilters = (queries: FakeQueryRecord[]) => {
  queries.forEach((query) => {
    assertEquals(query.filters.user_id, OWNER);
    assert(!Object.hasOwn(query.updatePayload ?? {}, "user_id"));
  });
};

Deno.test("T-ACT-R13-05 user body-save/manual dry-runs preserve formula and never write", async () => {
  for (const trigger of ["body_save", "manual"]) {
    const result = await run(
      { trigger, weight_kg: 80, dayIso: TODAY, force: true, dry_run: true },
      {
        snapshot: snapshotFor(2),
        labRows: [{
          payload: { ckd_stage: "G2" },
          day: TODAY,
          ts: `${TODAY}T08:00:00Z`,
        }],
      },
    );
    assertEquals(result.response.status, 200);
    assertEquals(result.payload.dry_run, true);
    assertEquals(result.payload.computed, {
      age: 46,
      age_base: 1,
      activity_level: "ACT2",
      activity_score_28d: 2,
      window_days: 28,
      weight_kg: 80,
      ckd_stage_g: "G2",
      ckd_factor: 0.95,
      ckd_source: "lab",
      factor_pre_ckd: 1.2,
      factor_auto: 1.14,
      factor_current: 1.14,
      target_min: 83,
      target_max: 91,
      calc_source: "auto",
      version: "v1.3-auto",
    });
    assertEquals(result.rpcCalls, [{
      functionName: "activity_consumer_snapshot",
      payload: { p_from: RANGE.from, p_to: RANGE.to },
    }]);
    assertEquals(
      result.queries.filter((entry) => entry.operation === "update").length,
      0,
    );
    assertOwnerFilters(result.queries);
    assert(!JSON.stringify(result.payload).includes(OWNER));
  }
});

Deno.test("T-ACT-R13-05 scheduler resolves weight server-side and uses the service wrapper once", async () => {
  const result = await run(
    { trigger: "scheduler", force: true },
    {
      snapshot: snapshotFor(6),
      bodyRows: [{ payload: { kg: 80 }, day: TODAY, ts: `${TODAY}T07:00:00Z` }],
      labRows: [{
        payload: { ckd_stage: "G2" },
        day: TODAY,
        ts: `${TODAY}T08:00:00Z`,
      }],
    },
    "scheduler",
  );
  assertEquals(result.response.status, 200);
  assertEquals(result.payload.computed.activity_level, "ACT3");
  assertEquals(result.payload.computed.activity_score_28d, 6);
  assertEquals(result.payload.computed.version, "v1.3-auto");
  assertEquals(result.rpcCalls, [{
    functionName: "activity_consumer_snapshot_for_owner",
    payload: { p_from: RANGE.from, p_to: RANGE.to, p_owner: OWNER },
  }]);
  const updates = result.queries.filter((entry) =>
    entry.operation === "update"
  );
  assertEquals(updates.length, 1);
  assertEquals(updates[0].updatePayload?.protein_activity_score_28d, 6);
  assertEquals(updates[0].updatePayload?.protein_calc_version, "v1.3-auto");
  assertOwnerFilters(result.queries);
  assert(!JSON.stringify(result.payload).includes(OWNER));
});

Deno.test("T-ACT-R13-05 doctor lock remains authoritative without inventing CKD", async () => {
  const result = await run(
    { trigger: "manual", weight_kg: 80, dayIso: TODAY, force: true },
    {
      snapshot: snapshotFor(0),
      profile: baseProfile({
        protein_doctor_lock: true,
        protein_doctor_factor: 0.8,
        protein_ckd_stage_g: null,
      }),
      labRows: [],
    },
  );
  assertEquals(result.response.status, 200);
  assertEquals(result.payload.computed.calc_source, "doctor");
  assertEquals(result.payload.computed.version, "v1.3-doctor");
  assertEquals(result.payload.computed.target_min, 56);
  assertEquals(result.payload.computed.target_max, 64);
  const update = result.queries.find((entry) => entry.operation === "update");
  assert(update !== undefined);
  assertEquals(update?.updatePayload?.protein_doctor_factor, 0.8);
  assert(!Object.hasOwn(update?.updatePayload ?? {}, "protein_ckd_stage_g"));
  assert(!Object.hasOwn(update?.updatePayload ?? {}, "protein_ckd_factor"));
});

const cooldownProfile = (overrides: Record<string, unknown> = {}) =>
  baseProfile({
    protein_last_calc_at: "2026-08-22T12:00:00.000Z",
    protein_target_min: 83,
    protein_target_max: 91,
    protein_ckd_stage_g: "G2",
    protein_calc_version: "v1.3-auto",
    protein_window_days: 28,
    protein_age_base: 1,
    protein_activity_level: "ACT2",
    protein_activity_score_28d: 2,
    protein_factor_pre_ckd: 1.2,
    protein_ckd_factor: 0.95,
    protein_factor_current: 1.14,
    ...overrides,
  });

Deno.test("T-ACT-R13-05 cooldown skips only an identical v1.3 derivation", async () => {
  const identical = await run(
    { trigger: "body_save", weight_kg: 80, dayIso: TODAY },
    {
      snapshot: snapshotFor(2),
      profile: cooldownProfile(),
      labRows: [{ payload: { ckd_stage: "G2" } }],
    },
  );
  assertEquals(identical.payload.reason, "cooldown_unchanged");
  assertEquals(
    identical.queries.filter((entry) => entry.operation === "update").length,
    0,
  );

  const variants: Array<Record<string, unknown>> = [
    { protein_calc_version: "v1.2-auto" },
    { protein_window_days: 27 },
    { protein_activity_score_28d: 1 },
    { protein_activity_level: "ACT1" },
    { protein_age_base: 0.9 },
    { protein_factor_pre_ckd: 1.1 },
    { protein_ckd_factor: 0.9 },
    { protein_factor_current: 1.13 },
    { protein_target_min: 82 },
    { protein_target_max: 92 },
    { protein_ckd_stage_g: "G3a" },
  ];
  for (const override of variants) {
    const result = await run(
      { trigger: "body_save", weight_kg: 80, dayIso: TODAY },
      {
        snapshot: snapshotFor(2),
        profile: cooldownProfile(override),
        labRows: [{ payload: { ckd_stage: "G2" } }],
      },
    );
    assertEquals(result.payload.skipped, false);
    assertEquals(
      result.queries.filter((entry) => entry.operation === "update").length,
      1,
    );
  }
});

Deno.test("T-ACT-R13-05 rejects body owners and fails snapshot/profile preconditions safely", async () => {
  const invalidDay = await run({
    trigger: "manual",
    weight_kg: 80,
    dayIso: "2026-02-31",
  });
  assertEquals(invalidDay.response.status, 400);
  assertEquals(invalidDay.payload, { error: "Invalid request" });
  assertEquals(invalidDay.rpcCalls.length, 0);
  assertEquals(invalidDay.queries.length, 0);

  const invalid = await run({
    trigger: "manual",
    weight_kg: 80,
    user_id: OWNER,
  });
  assertEquals(invalid.response.status, 400);
  assertEquals(invalid.payload, { error: "Invalid request" });
  assertEquals(invalid.rpcCalls.length, 0);
  assertEquals(invalid.queries.length, 0);

  const snapshotFailure = await run(
    { trigger: "manual", weight_kg: 80, dayIso: TODAY },
    { rpcError: { message: "opaque database error" } },
  );
  assertEquals(snapshotFailure.response.status, 502);
  assertEquals(snapshotFailure.payload, {
    error: "Activity snapshot unavailable",
  });
  assertEquals(snapshotFailure.queries.length, 0);

  const profileFailure = await run(
    { trigger: "manual", weight_kg: 80, dayIso: TODAY },
    { profileError: { message: "opaque profile error" } },
  );
  assertEquals(profileFailure.response.status, 500);
  assertEquals(profileFailure.payload, { error: "Internal server error" });
  assertEquals(
    profileFailure.queries.filter((entry) => entry.operation === "update")
      .length,
    0,
  );
});

Deno.test("T-ACT-R13-05 maps auth failures without reads, owner data, or raw errors", async () => {
  const fake = createFakeClient();
  const handler = createProteinTargetsHandler({
    createPrincipal: () =>
      Promise.reject(new ActivityEdgePrincipalError("UNAUTHORIZED")),
    activityRuntime: createActivityConsumerRuntime({ today: () => TODAY }),
    now: () => new Date(NOW),
  });
  const response = await handler(request({ trigger: "scheduler" }));
  const payload = await response.json();
  assertEquals(response.status, 401);
  assertEquals(payload, { error: "Unauthorized" });
  assertEquals(fake.queries.length, 0);
  assertEquals(fake.rpcCalls.length, 0);
  assert(!JSON.stringify(payload).includes(OWNER));
});
