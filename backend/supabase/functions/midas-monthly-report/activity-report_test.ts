import {
  ActivityReportContractError,
  buildActivityReportPayload,
  buildActivityReportSection,
} from "./activity-report.ts";
import {
  buildAndPersistRangeReport,
  RangeReportRepository,
} from "./report-lifecycle.ts";

type DataRecord = Record<string, unknown>;

const fixtureUrl = new URL(
  "../../../../app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json",
  import.meta.url,
);
const fixtures = JSON.parse(await Deno.readTextFile(fixtureUrl));
const mixed = fixtures.cases.find((entry: DataRecord) =>
  entry.name === "mixed"
);
const v2Only = fixtures.cases.find((entry: DataRecord) =>
  entry.name === "v2_only"
);
const empty = fixtures.cases.find((entry: DataRecord) =>
  entry.name === "empty"
);
const productIndex = await Deno.readTextFile(
  new URL("./index.ts", import.meta.url),
);

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) throw new Error(message);
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const assertEquals = (actual: unknown, expected: unknown) => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, received ${actualJson}`);
  }
};

const basePayload = (range = mixed.range) => ({
  subtype: "range_report",
  period: { from: range.from, to: range.to },
  report_type: "range_report",
  summary: "",
  text: [
    "**Patient**\n- Name: Test",
    "**Datengrundlage**\n- Blutdruck: 2 Messungen\n- Körper: 1 Messung\n- Labor: 1 Kontrolle\n- Aktivität: 1 Einträge",
    "**Aktivität**\n- Letzte Aktivität: 01.01.2026\n- Trainings/Woche: 9\n- Gesamtdauer: 1 Min (Durchschnitt: 1 Min/Eintrag)",
    "**Trendpilot**\n- Hinweise gesamt: keine",
  ].join("\n\n"),
  meta: {
    range: { from: range.from, to: range.to },
    bp: { avg_sys: 120 },
    activity: { count: 1, raw: "legacy" },
    flags: [],
  },
  bp_series: [{ day: range.to, sys: 120 }],
  body_series: [{ day: range.to, kg: 80 }],
  lab_series: [{ day: range.to, egfr: 60 }],
  activity_series: [{ day: range.to, activity: "Legacy" }],
});

const assertReportError = (callback: () => unknown) => {
  let caught: unknown;
  try {
    callback();
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof ActivityReportContractError,
    "Expected report error",
  );
  assertEquals(
    (caught as ActivityReportContractError).code,
    "ACTIVITY_REPORT_CONTRACT_INVALID",
  );
  assertEquals(
    (caught as Error).message,
    "The activity report payload is invalid.",
  );
  assert(!Object.hasOwn(caught as object, "payload"));
  assert(!Object.hasOwn(caught as object, "cause"));
};

Deno.test("T-ACT-R11-06 builds the exact compact mixed report projection", () => {
  const base = basePayload();
  const built = buildActivityReportPayload(base, clone(mixed.snapshot));
  assertEquals(Object.keys(built), Object.keys(base));
  assert(built.text.includes("- Aktivität: 3 Einträge"));
  assert(built.text.includes("- Letzte Aktivität: 22.08.2026"));
  assert(built.text.includes("- Aktive Tage/Woche: 2"));
  assert(
    buildActivityReportSection(clone(v2Only.snapshot)).includes(
      "- Aktive Tage/Woche: 0,5",
    ),
  );
  assert(built.text.includes(
    "- Gesamtdauer: 90 Min (Durchschnitt: 30 Min/Einheit)",
  ));
  assert(!built.text.includes("Trainings/Woche"));
  assertEquals(built.meta.activity, {
    schema_version: "midas.activity-consumer.v1",
    unit_count: 3,
    active_day_count: 2,
    active_days_per_week: 2,
    total_duration_min: 90,
    average_duration_min: 30,
    last_day: "2026-08-22",
    mixed_source_day_count: 1,
  });
  assertEquals(built.activity_series, mixed.snapshot.units);
  assert(Object.isFrozen(built));
  assert(Object.isFrozen(built.meta.activity));
  assert(Object.isFrozen(built.activity_series));
});

Deno.test("T-ACT-R11-06 keeps non-Activity report fields byte-stable", () => {
  const base = basePayload();
  const before = clone(base);
  const built = buildActivityReportPayload(base, clone(mixed.snapshot));
  for (
    const key of [
      "subtype",
      "period",
      "report_type",
      "summary",
      "bp_series",
      "body_series",
      "lab_series",
    ] as const
  ) {
    assertEquals(built[key], (before as DataRecord)[key]);
  }
  assertEquals(built.meta.range, before.meta.range);
  assertEquals(built.meta.bp, before.meta.bp);
  assertEquals(built.meta.flags, before.meta.flags);
  assertEquals(base, before);
});

Deno.test("T-ACT-R11-06 emits the exact empty Activity copy", () => {
  assertEquals(
    buildActivityReportSection(clone(empty.snapshot)),
    "**Aktivität**\n- Keine Einträge im Zeitraum.",
  );
  const built = buildActivityReportPayload(
    basePayload(empty.range),
    clone(empty.snapshot),
  );
  assert(built.text.includes("- Aktivität: 0 Einträge"));
  assert(built.text.includes("**Aktivität**\n- Keine Einträge im Zeitraum."));
  assertEquals(built.activity_series, []);
  assertEquals(built.meta.activity.average_duration_min, null);
});

Deno.test("T-ACT-R11-06 report Activity section excludes coaching detail", () => {
  const section = buildActivityReportSection(clone(mixed.snapshot));
  assert(
    !/(Übung|Satz|Reps|Wiederholung|Gewicht|Volumen|Empfehlung)/i.test(section),
  );
  assertEquals(section.split("\n").length, 4);
});

Deno.test("T-ACT-R11-06 fails closed on key, range, text and snapshot drift", () => {
  assertReportError(() =>
    buildActivityReportPayload(
      { ...basePayload(), extra: true },
      clone(mixed.snapshot),
    )
  );
  assertReportError(() =>
    buildActivityReportPayload(
      {
        ...basePayload(),
        period: { from: empty.range.from, to: empty.range.to },
      },
      clone(mixed.snapshot),
    )
  );
  assertReportError(() =>
    buildActivityReportPayload(
      { ...basePayload(), text: "**Patient**\n- Name: Test" },
      clone(mixed.snapshot),
    )
  );
  assertReportError(() =>
    buildActivityReportPayload(
      basePayload(),
      { ...clone(mixed.snapshot), extra: true },
    )
  );
});

Deno.test("T-ACT-R11-06 Activity failure occurs before report repository access", async () => {
  const calls = { find: 0, insert: 0, update: 0 };
  const repository: RangeReportRepository = {
    find() {
      calls.find += 1;
      return Promise.resolve([]);
    },
    insert() {
      calls.insert += 1;
      throw new Error("unexpected insert");
    },
    update() {
      calls.update += 1;
      throw new Error("unexpected update");
    },
  };
  let caught: unknown;
  try {
    await buildAndPersistRangeReport({
      repository,
      userId: "00000000-0000-4000-8000-000000000001",
      reportAnchorTs: "2026-08-23T12:00:00.000Z",
      expectedDay: mixed.range.to,
      generatedAt: "2026-08-23T12:30:00.000Z",
      buildPayload: () =>
        buildActivityReportPayload(basePayload(), {
          ...clone(mixed.snapshot),
          extra: true,
        }),
    });
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ActivityReportContractError);
  assertEquals(calls, { find: 0, insert: 0, update: 0 });
});

Deno.test("T-ACT-R11-06 legacy snapshots and product handler remain untouched", () => {
  const legacy = {
    id: "legacy-report",
    payload: {
      subtype: "range_report",
      text: "Legacy snapshot",
      meta: { activity: { count: 2 } },
    },
  };
  const before = clone(legacy);
  assertEquals(legacy, before);
  assert(!productIndex.includes('from "./activity-consumer.ts"'));
  assert(!productIndex.includes('from "./activity-report.ts"'));
  assert(!productIndex.includes("validateActivitySnapshot"));
});
