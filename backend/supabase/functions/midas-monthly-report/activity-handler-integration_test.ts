import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
} from "../_shared/activity-edge-principal.ts";
import { createActivityConsumerRuntime } from "../_shared/activity-consumer-runtime.ts";
import { buildActivityReportPayload } from "./activity-report.ts";
import {
  buildAndPersistRangeReport,
  type RangeReportRepository,
  type RangeReportWrite,
} from "./report-lifecycle.ts";

type DataRecord = Record<string, unknown>;

const fixtures = JSON.parse(
  await Deno.readTextFile(
    new URL(
      "../../../../app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json",
      import.meta.url,
    ),
  ),
);
const productSource = await Deno.readTextFile(
  new URL("./index.ts", import.meta.url),
);
const cases = Object.fromEntries(
  fixtures.cases.map((entry: DataRecord) => [entry.name, entry]),
) as Record<string, DataRecord>;

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

const clone = <T>(value: T): T => structuredClone(value);

const basePayload = (
  range: { from: string; to: string },
  activitySeries: unknown[],
) => ({
  subtype: "range_report",
  period: { from: range.from, to: range.to },
  report_type: "range_report",
  summary: "Stabiler Bericht",
  text: [
    "**Patient**\n- Name: Test",
    "**Datengrundlage**\n- Blutdruck: 0 Messungen\n- Körper: 0 Messungen\n- Labor: 0 Kontrollen\n- Aktivität: 99 Einträge",
    "**Aktivität**\n- Letzte Aktivität: 01.01.2026\n- Trainings/Woche: 99\n- Gesamtdauer: 99 Min (Durchschnitt: 99 Min/Eintrag)",
    "**Trendpilot**\n- Hinweise gesamt: keine",
  ].join("\n\n"),
  meta: { stable: true, activity: { legacy: true } },
  bp_series: [],
  body_series: [],
  lab_series: [],
  activity_series: activitySeries,
});

const createRepository = () => {
  const calls = { find: 0, insert: 0, update: 0 };
  let lastWrite: RangeReportWrite | null = null;
  const repository: RangeReportRepository = {
    find() {
      calls.find += 1;
      return Promise.resolve([]);
    },
    insert(_userId, write) {
      calls.insert += 1;
      lastWrite = write;
      const period = write.payload.period as { to: string };
      return Promise.resolve({
        id: "00000000-0000-4000-8000-000000000101",
        day: period.to,
        ts: write.ts,
        payload: write.payload,
      });
    },
    update() {
      calls.update += 1;
      return Promise.resolve(null);
    },
  };
  return { repository, calls, lastWrite: () => lastWrite };
};

const runHandlerSeam = async (
  fixture: DataRecord,
  rpcResult?: { data: unknown; error: unknown },
  repository = createRepository(),
) => {
  const range = fixture.range as { from: string; to: string };
  let rpcCalls = 0;
  const principal: ActivityEdgePrincipal = Object.freeze({
    schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
    mode: "user",
    owner_id: "00000000-0000-4000-8000-000000000001",
    rpc_client: {
      rpc(functionName, payload) {
        rpcCalls += 1;
        assertEquals(functionName, "activity_consumer_snapshot");
        assertEquals(payload, { p_from: range.from, p_to: range.to });
        return Promise.resolve(
          rpcResult ?? { data: clone(fixture.snapshot), error: null },
        );
      },
    },
  });
  const runtime = createActivityConsumerRuntime({
    today: () => fixtures.today,
  });
  const activitySnapshot = await runtime.loadSnapshot(principal, {
    from: range.from,
    to: range.to,
  });
  const legacyNarrativeInput = activitySnapshot.units.map((unit) => ({
    day: unit.day,
    activity: unit.label,
    duration_min: unit.duration_min,
    note: unit.note,
  }));
  await buildAndPersistRangeReport({
    repository: repository.repository,
    userId: principal.owner_id,
    reportAnchorTs: `${range.to}T12:00:00.000Z`,
    expectedDay: range.to,
    generatedAt: "2026-08-23T12:00:00.000Z",
    buildPayload: () =>
      buildActivityReportPayload(
        basePayload(range, legacyNarrativeInput),
        activitySnapshot,
      ),
  });
  return { rpcCalls, ...repository };
};

Deno.test("T-ACT-R13-04 wires one request-bound SQL25 snapshot before report persistence", () => {
  assert(productSource.includes('Deno.env.get("SUPABASE_ANON_KEY")'));
  assert(productSource.includes("createUserActivityPrincipal(token, userId)"));
  assert(productSource.includes("activityRuntime.loadSnapshot("));
  assert(
    productSource.includes(
      "buildActivityReportPayload(basePayload, activitySnapshot)",
    ),
  );
  assert(
    !productSource.includes('fetchSeries<ActivityEntry>("v_events_activity"'),
  );
  assert(!productSource.includes("activity_consumer_snapshot_for_owner"));
  assert(
    productSource.indexOf("activitySnapshotPromise") <
      productSource.indexOf("buildAndPersistRangeReport({"),
  );
});

Deno.test("T-ACT-R13-04 persists exact V1, V2, mixed, and empty projections", async () => {
  for (const name of ["v1_only", "v2_only", "mixed", "empty"]) {
    const fixture = cases[name];
    const result = await runHandlerSeam(fixture);
    const snapshot = fixture.snapshot as DataRecord;
    const summary = snapshot.summary as DataRecord;
    const write = result.lastWrite();
    assertEquals(result.rpcCalls, 1);
    assertEquals(result.calls, { find: 1, insert: 1, update: 0 });
    assert(write !== null);
    assertEquals(write?.payload.activity_series, snapshot.units);
    assertEquals(
      (write?.payload.meta as DataRecord).activity,
      {
        schema_version: "midas.activity-consumer.v1",
        unit_count: summary.unit_count,
        active_day_count: summary.active_day_count,
        active_days_per_week: summary.active_days_per_week,
        total_duration_min: summary.total_duration_min,
        average_duration_min: summary.average_duration_min,
        last_day: summary.last_day,
        mixed_source_day_count:
          (snapshot.quality as DataRecord).mixed_source_day_count,
      },
    );
    assertEquals((write?.payload.meta as DataRecord).stable, true);
  }
});

Deno.test("T-ACT-R13-04 snapshot and projection errors occur before every repository call", async () => {
  for (
    const rpcResult of [
      { data: null, error: { message: "opaque database failure" } },
      { data: { schema_version: "invalid" }, error: null },
    ]
  ) {
    const repository = createRepository();
    let caught: unknown;
    try {
      await runHandlerSeam(cases.mixed, rpcResult, repository);
    } catch (error) {
      caught = error;
    }
    assert(caught instanceof Error);
    assertEquals(
      (caught as Error).message,
      "The activity consumer runtime request failed.",
    );
    assert(!Object.hasOwn(caught as object, "cause"));
    assertEquals(repository.calls, { find: 0, insert: 0, update: 0 });
  }

  const repository = createRepository();
  let caught: unknown;
  try {
    await buildAndPersistRangeReport({
      repository: repository.repository,
      userId: "00000000-0000-4000-8000-000000000001",
      reportAnchorTs: "2026-08-23T12:00:00.000Z",
      expectedDay: "2026-08-23",
      generatedAt: "2026-08-23T12:00:00.000Z",
      buildPayload: () =>
        buildActivityReportPayload(
          {
            ...basePayload(
              cases.mixed.range as { from: string; to: string },
              [],
            ),
            text: "invalid",
          },
          clone(cases.mixed.snapshot),
        ),
    });
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof Error);
  assertEquals(repository.calls, { find: 0, insert: 0, update: 0 });
});

Deno.test("T-ACT-R13-04 keeps stored reports outside normal explicit lifecycle untouched", () => {
  assert(
    !/update\([\s\S]{0,120}range_report/.test(
      productSource.slice(0, productSource.indexOf("const reportRepository")),
    ),
  );
  assert(!/delete\(|delete\s+from|migration/i.test(productSource));
});
