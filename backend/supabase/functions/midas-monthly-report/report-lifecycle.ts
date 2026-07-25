export type ReportPayload = Record<string, unknown>;

export type RangeReportRow = {
  id: string;
  day: string | null;
  ts: string | null;
  payload: ReportPayload | null;
};

export type RangeReportWrite = {
  ts: string;
  payload: ReportPayload;
};

export type RangeReportRepository = {
  find(userId: string): Promise<RangeReportRow[]>;
  insert(
    userId: string,
    write: RangeReportWrite,
  ): Promise<RangeReportRow>;
  update(
    userId: string,
    id: string,
    write: RangeReportWrite,
  ): Promise<RangeReportRow | null>;
};

export type PersistRangeReportInput = {
  repository: RangeReportRepository;
  userId: string;
  reportAnchorTs: string;
  expectedDay: string;
  generatedAt: string;
  payload: ReportPayload;
};

export type BuildAndPersistRangeReportInput =
  & Omit<
    PersistRangeReportInput,
    "payload"
  >
  & {
    buildPayload(): ReportPayload | Promise<ReportPayload>;
  };

export class ReportLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportLifecycleError";
  }
}

const nonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const resolveCreatedAt = (
  existing: RangeReportRow | null,
  generatedAt: string,
) =>
  nonEmptyString(existing?.payload?.created_at) ||
  nonEmptyString(existing?.payload?.generated_at) ||
  nonEmptyString(existing?.ts) ||
  generatedAt;

const buildWrite = (
  input: PersistRangeReportInput,
  existing: RangeReportRow | null,
): RangeReportWrite => ({
  ts: input.reportAnchorTs,
  payload: {
    ...input.payload,
    created_at: resolveCreatedAt(existing, input.generatedAt),
    generated_at: input.generatedAt,
  },
});

const isUniqueViolation = (error: unknown) =>
  Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505",
  );

const assertCanonicalRows = (rows: RangeReportRow[]) => {
  if (!Array.isArray(rows)) {
    throw new ReportLifecycleError(
      "Range-Report-Abfrage lieferte ungueltige Daten.",
    );
  }
  if (rows.length > 1) {
    throw new ReportLifecycleError(
      "Mehrere Range-Berichte gefunden; Replacement abgebrochen.",
    );
  }
};

const assertPersistedRow = (
  row: RangeReportRow | null,
  expectedDay: string,
  expectedId?: string,
) => {
  if (!row) {
    throw new ReportLifecycleError(
      "Range-Bericht wurde waehrend Replacement nicht gefunden.",
    );
  }
  if (!row.id) {
    throw new ReportLifecycleError(
      "Persistierter Range-Bericht besitzt keine ID.",
    );
  }
  if (expectedId && row.id !== expectedId) {
    throw new ReportLifecycleError(
      "Range-Bericht wurde nicht in-place ersetzt.",
    );
  }
  if (row.day !== expectedDay) {
    throw new ReportLifecycleError(
      "Abgeleiteter Report-Tag stimmt nicht mit dem Zeitraum ueberein.",
    );
  }
  return row;
};

const updateExisting = async (
  input: PersistRangeReportInput,
  existing: RangeReportRow,
) => {
  const updated = await input.repository.update(
    input.userId,
    existing.id,
    buildWrite(input, existing),
  );
  return assertPersistedRow(updated, input.expectedDay, existing.id);
};

export const persistRangeReport = async (
  input: PersistRangeReportInput,
): Promise<RangeReportRow> => {
  if (!input.userId || !input.reportAnchorTs || !input.generatedAt) {
    throw new ReportLifecycleError(
      "Range-Report-Persistenz erhielt unvollstaendige Eingaben.",
    );
  }

  const existingRows = await input.repository.find(input.userId);
  assertCanonicalRows(existingRows);
  if (existingRows.length === 1) {
    return updateExisting(input, existingRows[0]);
  }

  try {
    const inserted = await input.repository.insert(
      input.userId,
      buildWrite(input, null),
    );
    return assertPersistedRow(inserted, input.expectedDay);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
  }

  const retryRows = await input.repository.find(input.userId);
  assertCanonicalRows(retryRows);
  if (retryRows.length !== 1) {
    throw new ReportLifecycleError(
      "Unique-Konflikt konnte nicht eindeutig aufgeloest werden.",
    );
  }
  return updateExisting(input, retryRows[0]);
};

export const buildAndPersistRangeReport = async (
  input: BuildAndPersistRangeReportInput,
): Promise<RangeReportRow> => {
  const { buildPayload, ...persistInput } = input;
  const payload = await buildPayload();
  return persistRangeReport({ ...persistInput, payload });
};
