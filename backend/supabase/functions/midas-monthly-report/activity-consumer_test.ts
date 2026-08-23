import {
  ActivityConsumerContractError,
  ActivityConsumerEdgeError,
  aggregateActivityUnits,
  createActivityConsumerLoader,
  validateActivityRange,
  validateActivitySnapshot,
} from "./activity-consumer.ts";

type DataRecord = Record<string, unknown>;

const fixtureUrl = new URL(
  "../../../../app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json",
  import.meta.url,
);
const fixtures = JSON.parse(await Deno.readTextFile(fixtureUrl));
const mixed = fixtures.cases.find((entry: DataRecord) =>
  entry.name === "mixed"
);
const empty = fixtures.cases.find((entry: DataRecord) =>
  entry.name === "empty"
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

const assertContractCode = (callback: () => unknown, code: string) => {
  let caught: unknown;
  try {
    callback();
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof ActivityConsumerContractError,
    "Expected contract error",
  );
  assertEquals((caught as ActivityConsumerContractError).code, code);
  assertEquals(
    (caught as Error).message,
    "The activity consumer payload is invalid.",
  );
  assert(!Object.hasOwn(caught as object, "payload"));
  assert(!Object.hasOwn(caught as object, "cause"));
};

const assertEdgeError = async (
  promise: Promise<unknown>,
  code: string,
  retryable = false,
  status: number | null = null,
) => {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ActivityConsumerEdgeError, "Expected edge error");
  const edge = caught as ActivityConsumerEdgeError;
  assertEquals(edge.code, code);
  assertEquals(edge.operation, "loadActivitySnapshot");
  assertEquals(edge.retryable, retryable);
  assertEquals(edge.status, status);
  assertEquals(edge.message, "The activity consumer request failed.");
  ["cause", "response", "details", "payload", "jwt"].forEach((key) =>
    assert(!Object.hasOwn(edge, key), `Unexpected ${key}`)
  );
};

Deno.test("T-ACT-R11-06 validates every shared JS/TS golden fixture", () => {
  for (const fixture of fixtures.cases) {
    const aggregated = aggregateActivityUnits(
      clone(fixture.units),
      clone(fixture.range),
      fixtures.today,
    );
    assertEquals(aggregated, fixture.snapshot);
    assertEquals(
      validateActivitySnapshot(clone(fixture.snapshot), fixtures.today),
      fixture.snapshot,
    );
    assert(Object.isFrozen(aggregated));
    assert(Object.isFrozen(aggregated.summary));
    assert(Object.isFrozen(aggregated.units));
  }
});

Deno.test("T-ACT-R11-06 enforces range and strict snapshot keysets", () => {
  assertEquals(
    validateActivityRange(clone(mixed.range), fixtures.today),
    mixed.range,
  );
  assertContractCode(
    () =>
      validateActivityRange({ ...mixed.range, extra: true }, fixtures.today),
    "INVALID_RANGE",
  );
  assertContractCode(
    () =>
      validateActivitySnapshot(
        { ...clone(mixed.snapshot), extra: true },
        fixtures.today,
      ),
    "INVALID_SNAPSHOT",
  );
  assertContractCode(
    () =>
      validateActivitySnapshot({
        ...clone(mixed.snapshot),
        summary: {
          ...clone(mixed.snapshot.summary),
          unit_count: 99,
        },
      }, fixtures.today),
    "INVALID_SNAPSHOT",
  );
});

Deno.test("T-ACT-R11-06 rejects accessors, source drift and unsorted units", () => {
  const accessor = clone(mixed.snapshot);
  Object.defineProperty(accessor, "summary", {
    enumerable: true,
    get() {
      throw new Error("raw accessor secret");
    },
  });
  assertContractCode(
    () => validateActivitySnapshot(accessor, fixtures.today),
    "INVALID_SNAPSHOT",
  );
  const source = clone(mixed.snapshot);
  source.units[0].source = "activity_v3";
  assertContractCode(
    () => validateActivitySnapshot(source, fixtures.today),
    "INVALID_SNAPSHOT",
  );
  const unsorted = clone(mixed.snapshot);
  unsorted.units.reverse();
  assertContractCode(
    () => validateActivitySnapshot(unsorted, fixtures.today),
    "INVALID_SNAPSHOT",
  );
});

Deno.test("T-ACT-R11-06 creates one request-local user client and one ownerless RPC", async () => {
  const tokens: string[] = [];
  const calls: DataRecord[] = [];
  const loader = createActivityConsumerLoader({
    today: () => fixtures.today,
    createUserClient(token) {
      tokens.push(token);
      return {
        rpc(functionName, payload) {
          calls.push({ functionName, payload });
          return Promise.resolve({ data: clone(mixed.snapshot), error: null });
        },
      };
    },
  });
  const result = await loader.loadSnapshot({
    range: { from: mixed.range.from, to: mixed.range.to },
    bearerToken: "user-jwt-one",
  });
  assertEquals(tokens, ["user-jwt-one"]);
  assertEquals(calls, [{
    functionName: "activity_consumer_snapshot",
    payload: { p_from: mixed.range.from, p_to: mixed.range.to },
  }]);
  assert(!Object.hasOwn(calls[0].payload as object, "user_id"));
  assertEquals(result, mixed.snapshot);

  await loader.loadSnapshot({
    range: { from: mixed.range.from, to: mixed.range.to },
    bearerToken: "user-jwt-two",
  });
  assertEquals(tokens, ["user-jwt-one", "user-jwt-two"]);
  assertEquals(calls.length, 2);
});

Deno.test("T-ACT-R11-06 sanitizes malformed loader envelopes before client access", async () => {
  let clientCalls = 0;
  const loader = createActivityConsumerLoader({
    createUserClient() {
      clientCalls += 1;
      throw new Error("client must not be created");
    },
    today: () => fixtures.today,
  });
  await assertEdgeError(
    loader.loadSnapshot({
      range: { from: mixed.range.from, to: mixed.range.to },
      bearerToken: "secret-jwt",
      extra: "raw request detail",
    }),
    "INVALID_RANGE",
  );
  assertEquals(clientCalls, 0);
});

Deno.test("T-ACT-R11-06 fails closed when bearer or RLS client is missing", async () => {
  let caught: unknown;
  try {
    createActivityConsumerLoader({} as never);
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ActivityConsumerEdgeError);
  assertEquals(
    (caught as ActivityConsumerEdgeError).code,
    "CLIENT_UNAVAILABLE",
  );

  const missingClient = createActivityConsumerLoader({
    today: () => fixtures.today,
    createUserClient() {
      return null as never;
    },
  });
  await assertEdgeError(
    missingClient.loadSnapshot({
      range: { from: mixed.range.from, to: mixed.range.to },
      bearerToken: "user-jwt",
    }),
    "CLIENT_UNAVAILABLE",
  );

  const loader = createActivityConsumerLoader({
    today: () => fixtures.today,
    createUserClient() {
      return {
        rpc: () => Promise.resolve({ data: empty.snapshot, error: null }),
      };
    },
  });
  await assertEdgeError(
    loader.loadSnapshot({
      range: { from: mixed.range.from, to: mixed.range.to },
      bearerToken: "",
    }),
    "AUTH_REQUIRED",
    false,
    401,
  );
});

Deno.test("T-ACT-R11-06 maps SQL and request failures without raw details", async () => {
  const cases = [
    ["MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED", "AUTH_REQUIRED"],
    ["MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE", "INVALID_RANGE"],
    ["MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE", "RANGE_TOO_LARGE"],
    ["MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED", "LIMIT_EXCEEDED"],
    ["MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID", "CONTRACT_INVALID"],
  ];
  for (const [token, code] of cases) {
    const loader = createActivityConsumerLoader({
      today: () => fixtures.today,
      createUserClient() {
        return {
          rpc: () =>
            Promise.resolve({
              data: null,
              error: { message: `${token} raw database secret`, status: 400 },
            }),
        };
      },
    });
    await assertEdgeError(
      loader.loadSnapshot({
        range: { from: mixed.range.from, to: mixed.range.to },
        bearerToken: "user-jwt",
      }),
      code,
      false,
      400,
    );
  }

  const network = createActivityConsumerLoader({
    today: () => fixtures.today,
    createUserClient() {
      return {
        rpc() {
          throw Object.assign(new Error("raw network secret"), { status: 503 });
        },
      };
    },
  });
  await assertEdgeError(
    network.loadSnapshot({
      range: { from: mixed.range.from, to: mixed.range.to },
      bearerToken: "user-jwt",
    }),
    "REQUEST_FAILED",
    true,
    503,
  );

  const accessorError = Object.defineProperties({}, {
    message: {
      enumerable: true,
      get() {
        throw new Error("raw error accessor secret");
      },
    },
    status: {
      enumerable: true,
      get() {
        throw new Error("raw status accessor secret");
      },
    },
  });
  const adversarial = createActivityConsumerLoader({
    today: () => fixtures.today,
    createUserClient() {
      return {
        rpc: () => Promise.resolve({ data: null, error: accessorError }),
      };
    },
  });
  await assertEdgeError(
    adversarial.loadSnapshot({
      range: { from: mixed.range.from, to: mixed.range.to },
      bearerToken: "user-jwt",
    }),
    "REQUEST_FAILED",
  );
});

Deno.test("T-ACT-R11-06 rejects partial, extra-key and response-range drift", async () => {
  for (
    const data of [
      { schema_version: "midas.activity-consumer.v1" },
      { ...clone(mixed.snapshot), extra: true },
      clone(empty.snapshot),
    ]
  ) {
    const loader = createActivityConsumerLoader({
      today: () => fixtures.today,
      createUserClient() {
        return { rpc: () => Promise.resolve({ data, error: null }) };
      },
    });
    await assertEdgeError(
      loader.loadSnapshot({
        range: { from: mixed.range.from, to: mixed.range.to },
        bearerToken: "user-jwt",
      }),
      "CONTRACT_INVALID",
    );
  }
});
