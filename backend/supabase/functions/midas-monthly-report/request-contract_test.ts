import {
  MAX_RANGE_DAYS,
  readRangeReportRequest,
  readUserBearerToken,
  RequestContractError,
  resolvePublicRequestErrorMessage,
  resolveRequestErrorStatus,
} from "./request-contract.ts";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
};

const assertContractError = async (
  fn: () => unknown | Promise<unknown>,
  expectedMessage: string,
  expectedStatus = 400,
) => {
  let caught: unknown;
  try {
    await fn();
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof RequestContractError, "Expected contract error");
  assertEquals((caught as RequestContractError).message, expectedMessage);
  assertEquals((caught as RequestContractError).status, expectedStatus);
};

const createRequest = (
  body?: string | Record<string, unknown> | null,
  authorization?: string,
) =>
  new Request("http://localhost/midas-monthly-report", {
    method: "POST",
    headers: authorization ? { Authorization: authorization } : undefined,
    ...(body === undefined
      ? {}
      : { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });

const validPayload = {
  from: "2026-01-14",
  to: "2026-07-22",
  report_type: "range_report",
};
const fixedNow = new Date("2026-07-25T10:00:00Z");

Deno.test("valid explicit range request is normalized", async () => {
  const result = await readRangeReportRequest(
    createRequest(validPayload),
    fixedNow,
  );

  assertEquals(result.range.from, "2026-01-14");
  assertEquals(result.range.to, "2026-07-22");
  assertEquals(result.reportAnchorTs, "2026-07-22T12:00:00.000Z");
});

Deno.test("empty body is rejected", async () => {
  await assertContractError(
    () => readRangeReportRequest(createRequest(), fixedNow),
    "Request-Body darf nicht leer sein.",
  );
});

Deno.test("invalid and non-object JSON are rejected", async () => {
  await assertContractError(
    () => readRangeReportRequest(createRequest("{"), fixedNow),
    "Ungueltiges JSON im Request-Body.",
  );
  for (const body of ["null", "[]", '"range_report"']) {
    await assertContractError(
      () => readRangeReportRequest(createRequest(body), fixedNow),
      "Request-Body muss ein JSON-Objekt sein.",
    );
  }
});

Deno.test("report type must be explicit and range-only", async () => {
  for (const reportType of [undefined, null, "monthly_report", "other"]) {
    const payload: Record<string, unknown> = {
      from: validPayload.from,
      to: validPayload.to,
    };
    if (reportType !== undefined) payload.report_type = reportType;
    await assertContractError(
      () => readRangeReportRequest(createRequest(payload), fixedNow),
      "report_type muss explizit range_report sein.",
    );
  }
});

Deno.test("month key is rejected even when null", async () => {
  await assertContractError(
    () =>
      readRangeReportRequest(
        createRequest({ ...validPayload, month: null }),
        fixedNow,
      ),
    "month wird nicht mehr unterstuetzt.",
  );
});

Deno.test("invalid, reversed and future ranges are rejected", async () => {
  await assertContractError(
    () =>
      readRangeReportRequest(
        createRequest({ ...validPayload, from: "2026-02-30" }),
        fixedNow,
      ),
    "from ist kein gueltiges Kalenderdatum.",
  );
  await assertContractError(
    () =>
      readRangeReportRequest(
        createRequest({
          ...validPayload,
          from: "2026-07-23",
          to: "2026-07-22",
        }),
        fixedNow,
      ),
    "from muss vor oder gleich to liegen.",
  );
  await assertContractError(
    () =>
      readRangeReportRequest(
        createRequest({ ...validPayload, to: "2026-07-26" }),
        fixedNow,
      ),
    "to darf nicht in der Zukunft liegen.",
  );
});

Deno.test("range span is bounded while annual reports remain possible", async () => {
  const atLimit = await readRangeReportRequest(
    createRequest({
      ...validPayload,
      from: "2025-06-21",
      to: "2026-07-25",
    }),
    fixedNow,
  );
  assertEquals(atLimit.range.from, "2025-06-21");
  assertEquals(atLimit.range.to, "2026-07-25");

  await assertContractError(
    () =>
      readRangeReportRequest(
        createRequest({
          ...validPayload,
          from: "2025-06-20",
          to: "2026-07-25",
        }),
        fixedNow,
      ),
    `Zeitraum darf maximal ${MAX_RANGE_DAYS} Tage umfassen.`,
  );
});

Deno.test("today and Vienna time zone boundary are accepted", async () => {
  const sameDay = await readRangeReportRequest(
    createRequest({ ...validPayload, to: "2026-07-25" }),
    fixedNow,
  );
  assertEquals(sameDay.range.to, "2026-07-25");

  const lateEvening = await readRangeReportRequest(
    createRequest({ ...validPayload, to: "2026-07-26" }),
    new Date("2026-07-25T22:30:00Z"),
  );
  assertEquals(lateEvening.range.to, "2026-07-26");
});

Deno.test("user bearer token is required and service role is rejected", async () => {
  await assertContractError(
    () => readUserBearerToken(createRequest(validPayload), "service-secret"),
    "Authorization Header fehlt.",
    401,
  );
  await assertContractError(
    () =>
      readUserBearerToken(
        createRequest(validPayload, "service-secret"),
        "service-secret",
      ),
    "Authorization Header fehlt.",
    401,
  );
  await assertContractError(
    () =>
      readUserBearerToken(
        createRequest(validPayload, "Bearer service-secret"),
        "service-secret",
      ),
    "Service-Role ist als Caller nicht erlaubt.",
    403,
  );
  assertEquals(
    readUserBearerToken(
      createRequest(validPayload, "Bearer user-jwt"),
      "service-secret",
    ),
    "user-jwt",
  );
});

Deno.test("only request contract errors map to client status codes", () => {
  assertEquals(
    resolveRequestErrorStatus(new RequestContractError("invalid request")),
    400,
  );
  assertEquals(
    resolveRequestErrorStatus(new RequestContractError("unauthorized", 401)),
    401,
  );
  assertEquals(resolveRequestErrorStatus(new Error("database failed")), 500);
  assertEquals(resolveRequestErrorStatus({ code: "PGRST500" }), 500);
  assertEquals(
    resolvePublicRequestErrorMessage(
      new RequestContractError("invalid request"),
    ),
    "invalid request",
  );
  assertEquals(
    resolvePublicRequestErrorMessage({
      code: "PGRST500",
      message: "relation health_events failed",
    }),
    "Interner Serverfehler.",
  );
});
