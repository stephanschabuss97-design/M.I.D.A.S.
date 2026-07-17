import {
  InputValidationError,
  readInput,
  validateInputGuards,
} from "./request-contract.ts";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
};

const assertValidationError = (fn: () => void, expectedMessage: string) => {
  let caught: unknown;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof InputValidationError,
    "Expected InputValidationError",
  );
  assertEquals((caught as InputValidationError).message, expectedMessage);
};

const createRequest = (payload?: Record<string, unknown>) =>
  new Request("http://localhost/midas-incident-push", {
    method: "POST",
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });

Deno.test("diagnostic mode rejects a non-manual trigger", async () => {
  const input = await readInput(createRequest({
    trigger: "scheduler",
    mode: "diagnostic",
    dry_run: true,
  }));

  assertEquals(input.trigger, "scheduler");
  assertValidationError(
    () => validateInputGuards(input),
    "Diagnostic push requires manual trigger",
  );
});

Deno.test("now without dry_run is rejected", async () => {
  const input = await readInput(createRequest({
    now: "2026-07-15T06:00:00+02:00",
  }));

  assertEquals(input.nowOverrideProvided, true);
  assertEquals(input.dryRun, false);
  assertValidationError(
    () => validateInputGuards(input),
    "now darf nur mit dry_run = true gesetzt werden.",
  );
});

Deno.test("now with dry_run true remains available", async () => {
  const input = await readInput(createRequest({
    dry_run: true,
    now: "2026-07-15T06:00:00+02:00",
  }));

  validateInputGuards(input);
  assertEquals(input.nowOverrideProvided, true);
  assertEquals(input.dryRun, true);
  assertEquals(input.now.toISOString(), "2026-07-15T04:00:00.000Z");
});

Deno.test("default path without now remains unchanged", async () => {
  const before = Date.now();
  const input = await readInput(createRequest());
  const after = Date.now();

  validateInputGuards(input);
  assertEquals(input.trigger, "scheduler");
  assertEquals(input.userId, null);
  assertEquals(input.window, "all");
  assertEquals(input.mode, "incidents");
  assertEquals(input.dryRun, false);
  assertEquals(input.nowOverrideProvided, false);
  assert(
    input.now.getTime() >= before && input.now.getTime() <= after,
    "Default now must be created during normalization",
  );
});
