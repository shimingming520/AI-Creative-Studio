import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(workspaceRoot, "app");
const packageJsonPath = path.join(appRoot, "package.json");
const builderPath = path.join(appRoot, "node_modules", "electron-builder", "cli.js");
const originalPackageJson = await readFile(packageJsonPath);
const hasBom = originalPackageJson.length >= 3 && originalPackageJson[0] === 0xef && originalPackageJson[1] === 0xbb && originalPackageJson[2] === 0xbf;
const packageJsonWithoutBom = hasBom ? originalPackageJson.subarray(3) : originalPackageJson;
const packageJsonWithBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), packageJsonWithoutBom]);
let child;
let restored = false;
let terminating = false;

async function restorePackageJson() {
  if (restored) {
    return;
  }
  restored = true;
  await writeFile(packageJsonPath, packageJsonWithBom);
}

async function terminate(signal) {
  if (terminating) {
    return;
  }
  terminating = true;
  try {
    child?.kill(signal);
  } finally {
    await restorePackageJson();
    process.exit(signal === "SIGINT" ? 130 : 143);
  }
}

process.once("SIGINT", () => void terminate("SIGINT"));
process.once("SIGTERM", () => void terminate("SIGTERM"));

if (hasBom) {
  await writeFile(packageJsonPath, packageJsonWithoutBom);
}

try {
  child = spawn(process.execPath, [builderPath, "--config", "electron-builder.config.cjs", ...process.argv.slice(2)], {
    cwd: appRoot,
    env: process.env,
    stdio: "inherit",
    windowsHide: true
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`electron-builder 被信号 ${signal} 终止。`));
        return;
      }
      resolve(code ?? 1);
    });
  });
  process.exitCode = exitCode;
} finally {
  await restorePackageJson();
}
