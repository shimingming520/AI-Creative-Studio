import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { parse } from "../app/node_modules/@babel/parser/lib/index.js";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(workspaceRoot, "app");
const scriptExtensions = new Set([".js", ".mjs", ".cjs"]);
const ignoredDirectories = new Set(["node_modules", "vendor", ".electron-runtime"]);
const obfuscationPattern = /\b(?:const|let|var|function)\s+[A-Za-z][A-Za-z0-9]*_0x[0-9a-fA-F]+/m;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath));
    } else if (entry.isFile() && scriptExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }
  return files;
}

const failures = [];
const residualObfuscation = [];
const files = await walk(appRoot);

for (const filePath of files) {
  const source = await readFile(filePath, "utf8");
  if (obfuscationPattern.test(source)) {
    residualObfuscation.push(path.relative(appRoot, filePath));
  }
  try {
    parse(source.replace(/^\uFEFF/, ""), {
      sourceType: "unambiguous",
      allowAwaitOutsideFunction: true,
      plugins: ["importMeta", "topLevelAwait"]
    });
  } catch (error) {
    failures.push({
      file: path.relative(appRoot, filePath),
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

console.log(JSON.stringify({
  scanned: files.length,
  syntaxFailures: failures.length,
  residualObfuscation: residualObfuscation.length,
  failures,
  residualFiles: residualObfuscation
}, null, 2));

if (failures.length > 0 || residualObfuscation.length > 0) {
  process.exitCode = 1;
}
