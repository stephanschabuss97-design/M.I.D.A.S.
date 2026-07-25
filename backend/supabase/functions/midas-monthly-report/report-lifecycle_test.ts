import {
  buildAndPersistRangeReport,
  persistRangeReport,
  RangeReportRepository,
  RangeReportRow,
  RangeReportWrite,
  ReportLifecycleError,
} from "./report-lifecycle.ts";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
};

const assertRejects = async (
  fn: () => Promise<unknown>,
  expectedMessage: string,
) => {
  let caught: unknown;
  try {
    await fn();
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof Error, "Expected an error");
  assertEquals((caught as Error).message, expectedMessage);
};

const oldRow = (
  overrides: Partial<RangeReportRow> = {},
): RangeReportRow => ({
  id: "report-1",
  day: "2026-01-14",
  ts: "2026-01-14T12:00:00.000Z",
  payload: {
    subtype: "range_report",
    created_at: "2026-01-14T13:00:00.000Z",
    generated_at: "2026-01-14T13:00:00.000Z",
  },
  ...overrides,
});

const baseInput = {
  userId: "user-1",
  reportAnchorTs: "2026-07-22T12:00:00.000Z",
  expectedDay: "2026-07-22",
  generatedAt: "2026-07-25T10:00:00.000Z",
  payload: {
    subtype: "range_report",
    period: { from: "2026-01-14", to: "2026-07-22" },
    text: "Arzt-Bericht",
  },
};

type RepositoryOptions = {
  rows?: RangeReportRow[];
  retryRows?: RangeReportRow[];
  insertError?: unknown;
  updateError?: unknown;
  findError?: unknown;
  insertedRow?: RangeReportRow;
  updatedRow?: RangeReportRow | null;
};

const createRepository = (options: RepositoryOptions = {}) => {
  let findCalls = 0;
  let insertCalls = 0;
  let updateCalls = 0;
  let lastWrite: RangeReportWrite | null = null;

  const repository: RangeReportRepository = {
    find: () => {
      findCalls += 1;
      if (options.findError) throw options.findError;
      if (findCalls > 1 && options.retryRows) {
        return Promise.resolve(options.retryRows);
      }
      return Promise.resolve(options.rows || []);
    },
    insert: (_userId, write) => {
      insertCalls += 1;
      lastWrite = write;
      if (options.insertError) throw options.insertError;
      return Promise.resolve(
        options.insertedRow || oldRow({
          id: "report-new",
          day: baseInput.expectedDay,
          ts: write.ts,
          payload: write.payload,
        }),
      );
    },
    update: (_userId, id, write) => {
      updateCalls += 1;
      lastWrite = write;
      if (options.updateError) throw options.updateError;
      return Promise.resolve(
        Object.hasOwn(options, "updatedRow")
          ? options.updatedRow ?? null
          : oldRow({
            id,
            day: baseInput.expectedDay,
            ts: write.ts,
            payload: write.payload,
          }),
      );
    },
  };

  return {
    repository,
    calls: () => ({ findCalls, insertCalls, updateCalls }),
    lastWrite: () => lastWrite,
  };
};

Deno.test("zero-state inserts one complete range report", async () => {
  const mock = createRepository();
  const row = await persistRangeReport({
    ...baseInput,
    repository: mock.repository,
  });

  assertEquals(row.id, "report-new");
  assertEquals(mock.calls().findCalls, 1);
  assertEquals(mock.calls().insertCalls, 1);
  assertEquals(mock.calls().updateCalls, 0);
  assertEquals(
    mock.lastWrite()?.payload.created_at,
    baseInput.generatedAt,
  );
  assertEquals(
    mock.lastWrite()?.payload.generated_at,
    baseInput.generatedAt,
  );
});

Deno.test("existing singleton is replaced in-place and keeps created_at", async () => {
  const existing = oldRow();
  const mock = createRepository({ rows: [existing] });
  const row = await persistRangeReport({
    ...baseInput,
    repository: mock.repository,
  });

  assertEquals(row.id, existing.id);
  assertEquals(mock.calls().insertCalls, 0);
  assertEquals(mock.calls().updateCalls, 1);
  assertEquals(
    mock.lastWrite()?.payload.created_at,
    existing.payload?.created_at,
  );
  assertEquals(
    mock.lastWrite()?.payload.generated_at,
    baseInput.generatedAt,
  );
});

Deno.test("legacy singleton derives created_at exactly once", async () => {
  const existing = oldRow({
    payload: { subtype: "range_report" },
  });
  const mock = createRepository({ rows: [existing] });
  await persistRangeReport({ ...baseInput, repository: mock.repository });

  assertEquals(mock.lastWrite()?.payload.created_at, existing.ts);
});

Deno.test("multiple existing rows fail closed without a write", async () => {
  const mock = createRepository({
    rows: [oldRow(), oldRow({ id: "report-2" })],
  });
  await assertRejects(
    () => persistRangeReport({ ...baseInput, repository: mock.repository }),
    "Mehrere Range-Berichte gefunden; Replacement abgebrochen.",
  );

  assertEquals(mock.calls().insertCalls, 0);
  assertEquals(mock.calls().updateCalls, 0);
});

Deno.test("read, insert and update errors are propagated without extra writes", async () => {
  const readMock = createRepository({ findError: new Error("read failed") });
  await assertRejects(
    () =>
      persistRangeReport({
        ...baseInput,
        repository: readMock.repository,
      }),
    "read failed",
  );
  assertEquals(readMock.calls().insertCalls, 0);
  assertEquals(readMock.calls().updateCalls, 0);

  const insertMock = createRepository({
    insertError: new Error("insert failed"),
  });
  await assertRejects(
    () =>
      persistRangeReport({
        ...baseInput,
        repository: insertMock.repository,
      }),
    "insert failed",
  );
  assertEquals(insertMock.calls().findCalls, 1);
  assertEquals(insertMock.calls().insertCalls, 1);
  assertEquals(insertMock.calls().updateCalls, 0);

  const updateMock = createRepository({
    rows: [oldRow()],
    updateError: new Error("update failed"),
  });
  await assertRejects(
    () =>
      persistRangeReport({
        ...baseInput,
        repository: updateMock.repository,
      }),
    "update failed",
  );
  assertEquals(updateMock.calls().insertCalls, 0);
  assertEquals(updateMock.calls().updateCalls, 1);
});

Deno.test("23505 is resolved by exactly one refetch and update", async () => {
  const existing = oldRow();
  const mock = createRepository({
    rows: [],
    insertError: { code: "23505", message: "unique" },
    retryRows: [existing],
  });
  const row = await persistRangeReport({
    ...baseInput,
    repository: mock.repository,
  });

  assertEquals(row.id, existing.id);
  assertEquals(mock.calls().findCalls, 2);
  assertEquals(mock.calls().insertCalls, 1);
  assertEquals(mock.calls().updateCalls, 1);
});

Deno.test("23505 retry fails closed when canonical state is not exactly one", async () => {
  for (
    const retryRows of [
      [],
      [oldRow(), oldRow({ id: "report-2" })],
    ]
  ) {
    const mock = createRepository({
      rows: [],
      insertError: { code: "23505" },
      retryRows,
    });
    await assertRejects(
      () =>
        persistRangeReport({
          ...baseInput,
          repository: mock.repository,
        }),
      retryRows.length > 1
        ? "Mehrere Range-Berichte gefunden; Replacement abgebrochen."
        : "Unique-Konflikt konnte nicht eindeutig aufgeloest werden.",
    );
    assertEquals(mock.calls().findCalls, 2);
    assertEquals(mock.calls().insertCalls, 1);
    assertEquals(mock.calls().updateCalls, 0);
  }
});

Deno.test("derived day and stable ID are verified", async () => {
  const dayMock = createRepository({
    insertedRow: oldRow({ id: "new", day: "2026-07-21" }),
  });
  await assertRejects(
    () =>
      persistRangeReport({
        ...baseInput,
        repository: dayMock.repository,
      }),
    "Abgeleiteter Report-Tag stimmt nicht mit dem Zeitraum ueberein.",
  );

  const idMock = createRepository({
    rows: [oldRow()],
    updatedRow: oldRow({ id: "different", day: baseInput.expectedDay }),
  });
  await assertRejects(
    () =>
      persistRangeReport({
        ...baseInput,
        repository: idMock.repository,
      }),
    "Range-Bericht wurde nicht in-place ersetzt.",
  );
});

Deno.test("concurrent update miss fails as lifecycle error", async () => {
  const mock = createRepository({
    rows: [oldRow()],
    updatedRow: null,
  });
  let caught: unknown;
  try {
    await persistRangeReport({
      ...baseInput,
      repository: mock.repository,
    });
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ReportLifecycleError, "Expected lifecycle error");
  assertEquals(
    (caught as Error).message,
    "Range-Bericht wurde waehrend Replacement nicht gefunden.",
  );
  assertEquals(mock.calls().updateCalls, 1);
});

Deno.test("incomplete persistence input fails before repository access", async () => {
  const mock = createRepository();
  await assertRejects(
    () =>
      persistRangeReport({
        ...baseInput,
        userId: "",
        repository: mock.repository,
      }),
    "Range-Report-Persistenz erhielt unvollstaendige Eingaben.",
  );
  assertEquals(mock.calls().findCalls, 0);
});

Deno.test("build errors occur before repository access", async () => {
  const setup = createRepository({ rows: [oldRow()] });

  await assertRejects(
    () =>
      buildAndPersistRangeReport({
        repository: setup.repository,
        userId: baseInput.userId,
        reportAnchorTs: baseInput.reportAnchorTs,
        expectedDay: baseInput.expectedDay,
        generatedAt: baseInput.generatedAt,
        buildPayload: () => {
          throw new Error("build failed");
        },
      }),
    "build failed",
  );

  assertEquals(setup.calls().findCalls, 0);
  assertEquals(setup.calls().insertCalls, 0);
  assertEquals(setup.calls().updateCalls, 0);
});

Deno.test("lifecycle errors keep their dedicated type", async () => {
  const mock = createRepository({
    rows: [oldRow(), oldRow({ id: "report-2" })],
  });
  let caught: unknown;
  try {
    await persistRangeReport({ ...baseInput, repository: mock.repository });
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ReportLifecycleError, "Expected lifecycle error");
});
