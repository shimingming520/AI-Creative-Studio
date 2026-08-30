import { readFile, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { webcrack } from "../.tools/webcrack/node_modules/webcrack/dist/index.js";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(workspaceRoot, "app");
const reportPath = path.join(workspaceRoot, "evidence", "deobfuscation-report.json");
const extensions = new Set([".js", ".mjs", ".cjs"]);
const excludedSegments = new Set(["node_modules", "vendor"]);
const obfuscationPattern = /\b(?:const|let|var|function)\s+[A-Za-z][A-Za-z0-9]*_0x[0-9a-fA-F]+/m;
const concurrency = Math.max(1, Math.min(Number(process.env.SHOU_DEOBFUSCATE_WORKERS) || 4, cpus().length));

async function walk(directory) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (excludedSegments.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath));
    } else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function transform(filePath) {
  const relativePath = path.relative(appRoot, filePath);
  const source = await readFile(filePath, "utf8");
  if (!obfuscationPattern.test(source)) {
    return { relativePath, status: "skipped", inputBytes: Buffer.byteLength(source) };
  }

  const startedAt = Date.now();
  try {
    const result = await webcrack(source, {
      deobfuscate: true,
      jsx: false,
      mangle: false,
      unpack: false,
      unminify: true
    });
    const output = result.code.startsWith("\uFEFF") ? result.code : `\uFEFF${result.code}`;
    await writeFile(filePath, output, "utf8");
    return {
      relativePath,
      status: "transformed",
      inputBytes: Buffer.byteLength(source),
      outputBytes: Buffer.byteLength(output),
      durationMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      relativePath,
      status: "failed",
      inputBytes: Buffer.byteLength(source),
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    };
  }
}

const files = await walk(appRoot);
const results = new Array(files.length);
let cursor = 0;
let completed = 0;

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= files.length) {
      return;
    }

    results[index] = await transform(files[index]);
    completed += 1;
    if (completed % 25 === 0 || completed === files.length) {
      const transformed = results.filter((item) => item?.status === "transformed").length;
      const failed = results.filter((item) => item?.status === "failed").length;
      process.stdout.write(`进度 ${completed}/${files.length}，已还原 ${transformed}，失败 ${failed}\n`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const summary = {
  generatedAt: new Date().toISOString(),
  tool: "webcrack@2.16.0",
  appRoot,
  concurrency,
  scanned: results.length,
  transformed: results.filter((item) => item.status === "transformed").length,
  skipped: results.filter((item) => item.status === "skipped").length,
  failed: results.filter((item) => item.status === "failed").length,
  results
};

await writeFile(reportPath, `\uFEFF${JSON.stringify(summary, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({
  scanned: summary.scanned,
  transformed: summary.transformed,
  skipped: summary.skipped,
  failed: summary.failed,
  reportPath
})}\n`);

if (summary.failed > 0) {
  process.exitCode = 1;
}
