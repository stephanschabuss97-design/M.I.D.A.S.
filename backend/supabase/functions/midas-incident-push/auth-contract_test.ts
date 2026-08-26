import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const source = await Deno.readTextFile(
  new URL("./index.ts", import.meta.url),
);

Deno.test("incident caller alias stays isolated from the internal service client", () => {
  assert(
    source.includes(
      'const CALLER_LEGACY_KEY = Deno.env.get("INCIDENTS_PUSH_LEGACY_KEY") ?? "";',
    ),
  );
  assert(
    source.includes('["INCIDENTS_PUSH_LEGACY_KEY", CALLER_LEGACY_KEY]'),
  );
  assert(source.includes("createClient(SUPABASE_URL, SERVICE_ROLE_KEY"));
  assert(source.includes("token !== CALLER_LEGACY_KEY"));
  assertEquals(source.includes("token !== SERVICE_ROLE_KEY"), false);
});
