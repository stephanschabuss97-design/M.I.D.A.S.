import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const normalize = (value) => value.replaceAll("\\", "/");
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const text = (path) => read(path).toString("utf8");
const sha256 = (path) => createHash("sha256").update(read(path)).digest("hex");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const protectedHashes = {
  "backend/supabase/functions/midas-monthly-report/activity-consumer.ts":
    "f25f45c4318d0c592ebb02d943fd267b671c0a9c3e15c71c683c8236d6ba386e",
  "backend/supabase/functions/midas-protein-targets/index.ts":
    "b985895e5cc4e631c2cbc5d649ac13819d48e16721d12967d9d44d2100c8f17e",
  "backend/supabase/functions/midas-trendpilot/index.ts":
    "d16339afff5e399dd1e7efa332a8ce86f98a8267ac5bcbd6659af54645e81bb3",
  ".github/workflows/protein-targets.yml":
    "edb356704a6e22fe8f7e7492e3e0ae62b9fa3f984159ec33b8dba691ceacbcdd",
  ".github/workflows/trendpilot.yml":
    "360f0740f887f7f7e5ea5b15c94d147e3d73eee257a6f44c946cdffde55ea606",
  "app/modules/vitals-stack/trendpilot/index.js":
    "adaa9f0c5c2d12eeda298809a1bde079704bf65a0f2b19525b6c875852a04873",
  "app/modules/doctor-stack/doctor/index.js":
    "11200c055e34ef861b0c1d5507f32122b5d445afd7c0499e32571ffbf4fe7dd4",
  "app/modules/doctor-stack/charts/index.js":
    "37a8093b81c708cfeb4b5e11d052feebb57a751fe68315d3441b7c1dfa319436",
  "app/modules/profile/index.js":
    "ec7faf40e3e5432f9bf5c58330c8f75731904a9deebb927de6fdb63882e9139e",
  "app/modules/vitals-stack/protein/index.js":
    "b8262030fa5a68bc13f8f192cea911b2679355897d5ef6d1df4ce3fa169406d2",
  "app/modules/vitals-stack/vitals/body.js":
    "830a13e4425fe29a0860951daa0d1eb5dea0e5bc10098e0063e606c3d5436e23",
  "sql/25_Activity_Consumer_Compatibility.sql":
    "77be7b9fb633d324a9f51f11640b015fcc54bea7e50dcf5392dc22ea424bc572",
  "index.html":
    "6cf9cf4e6e1c4c4e7722c568a590541c529d85e2e7dde483cac83f8a1bc3e30b",
  "service-worker.js":
    "d02d5510a6ceee8140f1925e6c83630af5b75e35e31851dbc2b7f783a0ed0a8b",
};

for (const [path, expected] of Object.entries(protectedHashes)) {
  assert(sha256(path) === expected, `Protected R12 postimage changed: ${path}`);
}

const r12Files = new Set([
  "backend/supabase/functions/_shared/activity-medical-context.ts",
  "backend/supabase/functions/_shared/activity-medical-context_test.ts",
  "backend/supabase/functions/midas-protein-targets/activity-compatibility.ts",
  "backend/supabase/functions/midas-protein-targets/activity-compatibility_test.ts",
  "backend/supabase/functions/midas-trendpilot/activity-compatibility.ts",
  "backend/supabase/functions/midas-trendpilot/activity-compatibility_test.ts",
  "tools/activity-v2-r12-isolation.mjs",
]);
const parseStatusPaths = (records) => {
  const paths = [];
  for (let index = 0; index < records.length; index += 1) {
    const entry = records[index];
    const statusCode = entry.slice(0, 2);
    paths.push(entry.slice(3));
    if (/[RC]/.test(statusCode)) {
      index += 1;
      assert(index < records.length, "Incomplete git rename/copy status record");
      paths.push(records[index]);
    }
  }
  return paths;
};
assert(
  JSON.stringify(parseStatusPaths([
    "R  backend/supabase/functions/new.ts",
    "backend/supabase/functions/old.ts",
  ])) === JSON.stringify([
    "backend/supabase/functions/new.ts",
    "backend/supabase/functions/old.ts",
  ]),
  "Rename/copy status parser self-test failed",
);

const statusRecords = execFileSync(
  "git",
  ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
  { cwd: root, encoding: "utf8" },
).split("\0").filter(Boolean);
for (const rawPath of parseStatusPaths(statusRecords)) {
  const path = normalize(rawPath);
  const sensitive = path.startsWith("app/") ||
    path.startsWith("backend/supabase/functions/") ||
    path.startsWith("sql/") || path.startsWith(".github/workflows/") ||
    path === "index.html" || path === "service-worker.js";
  assert(
    !sensitive || r12Files.has(path),
    `Unexpected R12 scope delta: ${path}`,
  );
}

const productionModules = [
  "backend/supabase/functions/_shared/activity-medical-context.ts",
  "backend/supabase/functions/midas-protein-targets/activity-compatibility.ts",
  "backend/supabase/functions/midas-trendpilot/activity-compatibility.ts",
];
const forbidden = [
  /\bDeno\.env\b/,
  /\bcreateClient\b/,
  /\bfetch\s*\(/,
  /\.rpc\s*\(/,
  /\bsupabase\s*\./,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bhealth_events\b/,
  /\bactivity_event\b/,
  /\bhealth_activity_sessions\b/,
  /\bSUPABASE_[A-Z_]+\b/,
];
for (const path of productionModules) {
  const source = text(path);
  forbidden.forEach((pattern) =>
    assert(!pattern.test(source), `Forbidden runtime dependency in ${path}: ${pattern}`)
  );
}

const productSurfaces = [
  ...Object.keys(protectedHashes).filter((path) =>
    path.startsWith("app/") || path.endsWith("/index.ts") ||
    path.endsWith(".yml") || path === "index.html" ||
    path === "service-worker.js"
  ),
];
const r12Imports = [
  "activity-medical-context",
  "activity-compatibility",
  "createActivityMedicalContext",
  "deriveProteinActivityCompatibility",
  "deriveTrendpilotActivityCompatibility",
];
for (const path of productSurfaces) {
  const source = text(path);
  r12Imports.forEach((needle) =>
    assert(!source.includes(needle), `R12 product wiring detected in ${path}`)
  );
}

const protein = text("backend/supabase/functions/midas-protein-targets/index.ts");
assert(protein.includes('protein_calc_version: `v1.2-${calcSource}`'), "Protein version drift");
assert(protein.includes('if (score >= 6) return { level: "ACT3", modifier: 0.3 };'), "ACT3 drift");
assert(protein.includes('if (score >= 2) return { level: "ACT2", modifier: 0.2 };'), "ACT2 drift");

const trend = text("backend/supabase/functions/midas-trendpilot/index.ts");
[
  "CONTEXT_ACTIVITY_MIN_WEEKS = 2",
  "CONTEXT_ACTIVITY_MIN_SESSIONS = 4",
  "CONTEXT_ACTIVITY_HIGH_SESSIONS = 8",
  "CONTEXT_ACTIVITY_LOW_SESSIONS = 3",
  "sessions_4w: sessions",
].forEach((needle) => assert(trend.includes(needle), `Trendpilot contract drift: ${needle}`));

for (const path of [
  "app/modules/vitals-stack/trendpilot/index.js",
  "app/modules/doctor-stack/doctor/index.js",
  "app/modules/doctor-stack/charts/index.js",
]) {
  const source = text(path);
  assert(source.includes("activity.level"), `Activity level consumer missing: ${path}`);
  assert(!source.includes("sessions_4w"), `Legacy counter consumed by visible text: ${path}`);
  assert(!source.includes("active_days_4w"), `R13 payload activated early: ${path}`);
}

console.log(
  `T-ACT-R12-04 PASS protected=${Object.keys(protectedHashes).length} ` +
    `r12_files=${r12Files.size} product_wiring=0 runtime_dependencies=0`,
);
