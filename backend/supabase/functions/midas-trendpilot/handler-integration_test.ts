import {
  type ActivityConsumerRange,
  type ActivityConsumerSnapshot,
  type ActivityConsumerUnit,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";
import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
  ActivityEdgePrincipalError,
} from "../_shared/activity-edge-principal.ts";
import { createTrendpilotHandler } from "./index.ts";

const OWNER = "30000000-0000-4000-8000-000000000001";
const TODAY = "2026-08-23";
const NOW = new Date(`${TODAY}T12:00:00.000Z`);
const RANGE_373 = { from: "2025-08-16", to: TODAY };
const ENVELOPE_400 = { from: "2025-07-20", to: TODAY };

const assert = (condition: unknown, message = "Assertion failed") => {
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
  `30000000-0000-4000-8000-${String(value).padStart(12, "0")}`;

const bodyRows = [
  ["2026-06-29", 80],
  ["2026-07-06", 80],
  ["2026-07-13", 80],
  ["2026-07-20", 80],
  ["2026-07-27", 82],
  ["2026-08-03", 82],
].map(([day, kg], index) => ({
  id: uuid(index + 1),
  day,
  ts: `${day}T08:00:00.000Z`,
  type: "body",
  ctx: null,
  payload: { kg },
}));

const bodyState = {
  user_id: OWNER,
  type: "body",
  baseline_from: "2026-06-29",
  baseline_sys: 80,
  baseline_dia: null,
  sample_weeks: 6,
  updated_at: "2026-08-01T10:00:00.000Z",
};

const activityUnits: ActivityConsumerUnit[] = [
  "2026-07-14",
  "2026-07-21",
  "2026-07-28",
  "2026-08-04",
].map((day, index) => ({
  source: index % 2 === 0 ? "activity_v1" : "activity_v2",
  id: uuid(100 + index),
  day,
  occurred_at: `${day}T12:00:00.000Z`,
  label: `Activity ${index + 1}`,
  duration_min: 30,
  note: null,
  item_count: index % 2 === 0 ? null : 1,
}));

const inclusiveDays = (from: string, to: string) =>
  Math.trunc(
    (Date.parse(`${to}T00:00:00.000Z`) -
      Date.parse(`${from}T00:00:00.000Z`)) /
      86_400_000,
  ) + 1;

const snapshotFor = (range: { from: string; to: string }) =>
  aggregateActivityUnits(
    activityUnits.filter((unit) =>
      unit.day >= range.from && unit.day <= range.to
    ),
    {
      ...range,
      inclusive_days: inclusiveDays(range.from, range.to),
    } as ActivityConsumerRange,
    TODAY,
  );

type QueryResult = { data: unknown; error: unknown };
type ExistingEvent = {
  id: string;
  window_to: string;
  ack: boolean;
  ack_at: string | null;
  payload: Record<string, unknown>;
};
type FakeOptions = {
  snapshotError?: unknown;
  healthError?: unknown;
  existingEvent?: ExistingEvent | null;
  bodyState?: typeof bodyState | null;
};
type FakeQueryRecord = {
  table: string;
  filters: Record<string, unknown>;
  upsertPayload: Record<string, unknown> | null;
};

const createFakeClient = (options: FakeOptions = {}) => {
  const queries: FakeQuery[] = [];
  const rpcCalls: { functionName: string; payload: Record<string, unknown> }[] =
    [];

  class FakeQuery {
    filters: Record<string, unknown> = {};
    fromDay: string | null = null;
    toDay: string | null = null;
    upsertPayload: Record<string, unknown> | null = null;

    constructor(readonly table: string) {}

    select(_columns: string) {
      return this;
    }

    eq(key: string, value: unknown) {
      this.filters[key] = value;
      return this;
    }

    gte(key: string, value: string) {
      if (key === "day") this.fromDay = value;
      return this;
    }

    lte(key: string, value: string) {
      if (key === "day") this.toDay = value;
      return this;
    }

    order(_column: string, _options: unknown) {
      return this;
    }

    upsert(payload: Record<string, unknown>, _options: unknown) {
      this.upsertPayload = structuredClone(payload);
      return this;
    }

    maybeSingle() {
      return Promise.resolve(this.resolve());
    }

    then(
      onfulfilled?: (value: QueryResult) => unknown,
      onrejected?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(this.resolve()).then(onfulfilled, onrejected);
    }

    private resolve(): QueryResult {
      if (this.table === "health_events") {
        if (options.healthError) {
          return { data: null, error: options.healthError };
        }
        const rows = this.filters.type === "body" ? bodyRows : [];
        return {
          data: rows.filter((row) =>
            (!this.fromDay || row.day >= this.fromDay) &&
            (!this.toDay || row.day <= this.toDay)
          ),
          error: null,
        };
      }
      if (this.table === "trendpilot_state") {
        const currentBodyState = Object.hasOwn(options, "bodyState")
          ? options.bodyState
          : bodyState;
        return {
          data: this.upsertPayload === null && this.filters.type === "body"
            ? currentBodyState
            : null,
          error: null,
        };
      }
      if (this.table === "trendpilot_events") {
        return {
          data: this.upsertPayload === null
            ? options.existingEvent ?? null
            : { id: "trend-event-1" },
          error: null,
        };
      }
      return { data: null, error: null };
    }
  }

  const client = {
    from(table: string) {
      const query = new FakeQuery(table);
      queries.push(query);
      return query;
    },
    rpc(functionName: string, payload: Record<string, unknown>) {
      rpcCalls.push({ functionName, payload: structuredClone(payload) });
      const range = {
        from: String(payload.p_from),
        to: String(payload.p_to),
      };
      return Promise.resolve({
        data: snapshotFor(range),
        error: options.snapshotError ?? null,
      });
    },
  };
  return { client, queries, rpcCalls };
};

const createPrincipalFactory = (
  client: ReturnType<typeof createFakeClient>["client"],
  mode: ActivityEdgePrincipal["mode"],
) =>
(_request: Request, target: "protein" | "trendpilot") => {
  assertEquals(target, "trendpilot");
  return Promise.resolve(Object.freeze({
    schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
    mode,
    owner_id: OWNER,
    rpc_client: client,
  }) as ActivityEdgePrincipal);
};

const request = (body: Record<string, unknown>) =>
  new Request("http://localhost/functions/v1/midas-trendpilot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const invoke = async (
  body: Record<string, unknown>,
  mode: ActivityEdgePrincipal["mode"] = "user",
  options: FakeOptions = {},
  activityRuntime?: {
    loadSnapshot(
      principal: ActivityEdgePrincipal,
      range: unknown,
    ): Promise<ActivityConsumerSnapshot>;
  },
) => {
  const fake = createFakeClient(options);
  const handler = createTrendpilotHandler({
    createPrincipal: createPrincipalFactory(fake.client, mode),
    now: () => NOW,
    ...(activityRuntime ? { activityRuntime } : {}),
  });
  const response = await handler(request(body));
  return {
    ...fake,
    response,
    payload: await response.json() as Record<string, unknown>,
  };
};

const writes = (queries: FakeQueryRecord[]) =>
  queries.filter((query) => query.upsertPayload !== null);

const assertOwnerFilters = (queries: FakeQueryRecord[]) => {
  queries.forEach((query) => assertEquals(query.filters.user_id, OWNER));
};

const firstActivity = (payload: Record<string, unknown>) => {
  const events = payload.events as Record<string, unknown>[];
  const eventPayload = events[0].payload as Record<string, unknown>;
  const context = eventPayload.context as Record<string, unknown>;
  return context.activity as Record<string, unknown>;
};

Deno.test("T-ACT-R13-06 user dry-run accepts 373 days and loads one 400-day snapshot", async () => {
  const result = await invoke({
    trigger: "manual",
    dry_run: true,
    range: RANGE_373,
  });
  assertEquals(result.response.status, 200);
  assertEquals(result.rpcCalls, [{
    functionName: "activity_consumer_snapshot",
    payload: { p_from: ENVELOPE_400.from, p_to: ENVELOPE_400.to },
  }]);
  assertEquals(writes(result.queries).length, 0);
  assertOwnerFilters(result.queries);
  assertEquals(firstActivity(result.payload), {
    level: "ok",
    active_days_4w: 4,
    weeks_with_entries_4w: 4,
  });
  assert(!JSON.stringify(result.payload).includes(OWNER));

  const midweek = await invoke({
    trigger: "manual",
    dry_run: true,
    range: { from: "2026-06-01", to: "2026-08-05" },
  });
  assertEquals(midweek.response.status, 200);
  assertEquals(midweek.rpcCalls[0].payload, {
    p_from: "2026-05-05",
    p_to: "2026-08-05",
  });
  assertEquals(firstActivity(midweek.payload), {
    level: "ok",
    active_days_4w: 4,
    weeks_with_entries_4w: 4,
  });
});

Deno.test("T-ACT-R13-06 scheduler uses one owner wrapper and writes the new activity keyset", async () => {
  const result = await invoke({ trigger: "scheduler" }, "scheduler");
  assertEquals(result.response.status, 200);
  assertEquals(result.rpcCalls.length, 1);
  assertEquals(
    result.rpcCalls[0].functionName,
    "activity_consumer_snapshot_for_owner",
  );
  assertEquals(result.rpcCalls[0].payload.p_owner, OWNER);
  const eventWrites = writes(result.queries).filter((query) =>
    query.table === "trendpilot_events"
  );
  assertEquals(eventWrites.length, 1);
  assertEquals(
    (eventWrites[0].upsertPayload?.payload as Record<string, unknown>).context,
    (result.payload.events as Record<string, unknown>[])[0].payload &&
      ((result.payload.events as Record<string, unknown>[])[0]
        .payload as Record<
          string,
          unknown
        >).context,
  );
  assertEquals(Object.keys(firstActivity(result.payload)), [
    "level",
    "active_days_4w",
    "weeks_with_entries_4w",
  ]);
  assertOwnerFilters(result.queries);
  assert(!JSON.stringify(result.payload).includes(OWNER));
});

Deno.test("T-ACT-R13-06 preserves legacy sessions activity without rewrite or hybrid", async () => {
  const legacyActivity = {
    level: "ok",
    sessions_4w: 5,
    weeks_with_entries_4w: 2,
    legacy_marker: "keep",
  };
  const result = await invoke(
    { trigger: "manual" },
    "user",
    {
      existingEvent: {
        id: "legacy-event",
        window_to: "2026-08-02",
        ack: true,
        ack_at: "2026-08-04T09:00:00.000Z",
        payload: {
          context: { activity: legacyActivity, legacy_context: "keep" },
          legacy_top: "keep",
        },
      },
    },
  );
  assertEquals(result.response.status, 200);
  const eventWrite = writes(result.queries).find((query) =>
    query.table === "trendpilot_events"
  );
  if (!eventWrite) throw new Error("Expected a Trendpilot event write");
  const row = eventWrite.upsertPayload as Record<string, unknown>;
  const payload = row.payload as Record<string, unknown>;
  const context = payload.context as Record<string, unknown>;
  assertEquals(context.activity, legacyActivity);
  assert(!Object.hasOwn(context.activity as object, "active_days_4w"));
  assertEquals(context.legacy_context, "keep");
  assertEquals(payload.legacy_top, "keep");
  assertEquals(row.ack, true);
  assertEquals(row.ack_at, "2026-08-04T09:00:00.000Z");
});

Deno.test("T-ACT-R13-06 rejects 374 days and body owners before snapshot or table access", async () => {
  for (
    const body of [
      { dry_run: true, range: { from: "2025-08-15", to: TODAY } },
      { dry_run: true, range: { from: RANGE_373.from } },
      { dry_run: true, range: { to: TODAY } },
      { dry_run: true, user_id: OWNER },
      {
        dry_run: true,
        range: { from: RANGE_373.from, to: TODAY, extra: true },
      },
    ]
  ) {
    const result = await invoke(body);
    assertEquals(result.response.status, 400);
    assertEquals(result.payload, { ok: false, error: "Invalid request" });
    assertEquals(result.rpcCalls.length, 0);
    assertEquals(result.queries.length, 0);
  }
});

Deno.test("T-ACT-R13-06 snapshot and data errors are sanitized and remain pre-write", async () => {
  for (
    const options of [
      { snapshotError: { message: "raw snapshot details" } },
      { healthError: { message: "raw health details" } },
    ]
  ) {
    const result = await invoke({ trigger: "manual" }, "user", options);
    assert([500, 502].includes(result.response.status));
    assertEquals(writes(result.queries).length, 0);
    const serialized = JSON.stringify(result.payload);
    assert(!serialized.includes("raw"));
    assert(!serialized.includes(OWNER));
  }

  const contractFailure = await invoke(
    { trigger: "manual" },
    "user",
    { bodyState: null },
    {
      loadSnapshot: () =>
        Promise.resolve(snapshotFor({ from: "2026-07-20", to: TODAY })),
    },
  );
  assertEquals(contractFailure.response.status, 500);
  assertEquals(writes(contractFailure.queries).length, 0);
  assertEquals(contractFailure.payload, {
    ok: false,
    error: "Internal server error",
  });
});

Deno.test("T-ACT-R13-06 auth failures expose no owner, reads, writes, or raw error", async () => {
  const fake = createFakeClient();
  const handler = createTrendpilotHandler({
    createPrincipal: () =>
      Promise.reject(new ActivityEdgePrincipalError("UNAUTHORIZED")),
    now: () => NOW,
  });
  const response = await handler(request({ trigger: "manual", dry_run: true }));
  const payload = await response.json();
  assertEquals(response.status, 401);
  assertEquals(payload, { ok: false, error: "Unauthorized" });
  assertEquals(fake.queries.length, 0);
  assertEquals(fake.rpcCalls.length, 0);
  assert(!JSON.stringify(payload).includes(OWNER));
});
