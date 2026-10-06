/**
 * Typecheck script.
 *
 * Why this exists: the root tsconfig.json is a solution-style config with
 * `"files": []` and project references. Running plain `tsc --noEmit` against it
 * type-checks NOTHING (the program contains zero files), so it always exits 0
 * and silently misses real errors. The referenced projects must be compiled
 * explicitly.
 *
 * A heap bump is also required: this project's program is large enough that
 * Node's default old-space limit crashes tsc with an out-of-memory error before
 * it reports anything.
 *
 * Runs both referenced projects and fails if either reports an error.
 */

import { spawn } from "node:child_process";

const PROJECTS = ["tsconfig.app.json", "tsconfig.node.json"];
const HEAP = process.env.RECEIPTO_TSC_HEAP ?? "4096";

function run(project) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["./node_modules/typescript/bin/tsc", "-p", project, "--noEmit"],
      {
        stdio: "inherit",
        env: { ...process.env, NODE_OPTIONS: `--max-old-space-size=${HEAP}` },
      },
    );
    child.on("close", (code) => resolve(code ?? 1));
  });
}

let failed = false;
for (const project of PROJECTS) {
  console.log(`\n[typecheck] ${project}`);
  const code = await run(project);
  if (code !== 0) {
    failed = true;
    console.error(`[typecheck] ${project} failed with exit code ${code}`);
  }
}

if (failed) process.exit(1);
console.log("\n[typecheck] no type errors");