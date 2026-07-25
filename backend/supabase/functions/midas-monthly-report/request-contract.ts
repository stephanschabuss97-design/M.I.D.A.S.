export const REPORT_TIME_ZONE = "Europe/Vienna";
export const MAX_RANGE_DAYS = 400;

export type NormalizedRange = {
  from: string;
  to: string;
};

export type RangeReportRequest = {
  range: NormalizedRange;
  reportAnchorTs: string;
};

export class RequestContractError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RequestContractError";
    this.status = status;
  }
}

export const resolveRequestErrorStatus = (error: unknown) =>
  error instanceof RequestContractError ? error.status : 500;

export const resolvePublicRequestErrorMessage = (error: unknown) =>
  error instanceof RequestContractError
    ? error.message
    : "Interner Serverfehler.";

const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const parseIsoDay = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string" || !ISO_DAY_RE.test(value)) {
    throw new RequestContractError(
      `${fieldName} muss ein ISO-Datum YYYY-MM-DD sein.`,
    );
  }
  const year = Number(value.slice(0, 4));
  const parsed = new Date(`${value}T00:00:00Z`);
  if (
    !Number.isInteger(year) ||
    year < 1000 ||
    Number.isNaN(parsed.getTime()) ||
    toIsoDate(parsed) !== value
  ) {
    throw new RequestContractError(
      `${fieldName} ist kein gueltiges Kalenderdatum.`,
    );
  }
  return value;
};

export const getIsoDayInTimeZone = (
  date: Date,
  timeZone = REPORT_TIME_ZONE,
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
};

export const buildReportAnchorTs = (range: NormalizedRange) =>
  new Date(`${range.to}T12:00:00Z`).toISOString();

export const readUserBearerToken = (
  req: Request,
  serviceRoleKey: string,
) => {
  const header = req.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    throw new RequestContractError("Authorization Header fehlt.", 401);
  }
  const token = header.slice(7).trim();
  if (!token) {
    throw new RequestContractError("Authorization Header fehlt.", 401);
  }
  if (serviceRoleKey && token === serviceRoleKey) {
    throw new RequestContractError(
      "Service-Role ist als Caller nicht erlaubt.",
      403,
    );
  }
  return token;
};

export const readRangeReportRequest = async (
  req: Request,
  now = new Date(),
): Promise<RangeReportRequest> => {
  const bodyText = await req.text();
  if (!bodyText.trim()) {
    throw new RequestContractError("Request-Body darf nicht leer sein.");
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(bodyText) as unknown;
  } catch {
    throw new RequestContractError("Ungueltiges JSON im Request-Body.");
  }
  if (!isRecord(rawPayload)) {
    throw new RequestContractError(
      "Request-Body muss ein JSON-Objekt sein.",
    );
  }
  if (Object.hasOwn(rawPayload, "month")) {
    throw new RequestContractError("month wird nicht mehr unterstuetzt.");
  }
  if (rawPayload.report_type !== "range_report") {
    throw new RequestContractError(
      "report_type muss explizit range_report sein.",
    );
  }

  const from = parseIsoDay(rawPayload.from, "from");
  const to = parseIsoDay(rawPayload.to, "to");
  if (from > to) {
    throw new RequestContractError("from muss vor oder gleich to liegen.");
  }
  const today = getIsoDayInTimeZone(now);
  if (to > today) {
    throw new RequestContractError(
      "to darf nicht in der Zukunft liegen.",
    );
  }
  const spanDays =
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000 + 1;
  if (spanDays > MAX_RANGE_DAYS) {
    throw new RequestContractError(
      `Zeitraum darf maximal ${MAX_RANGE_DAYS} Tage umfassen.`,
    );
  }

  const range = { from, to };
  return {
    range,
    reportAnchorTs: buildReportAnchorTs(range),
  };
};
