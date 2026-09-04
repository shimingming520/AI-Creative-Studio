import { accessSync, constants, existsSync, statSync } from "node:fs";
import path from "node:path";

import { app } from "electron";

/**
 * Absolute paths for media CLIs so the Library Worker (UtilityProcess) does
 * not depend on a minimal GUI PATH. Mirrors worker `binary-resolver` roots
 * but can use `app.getAppPath()` from Main.
 */
function platformBinaryName(baseName: string): string {
  return process.platform === "win32" ? `${baseName}.exe` : baseName;
}

function platformDirectory(): string {
  if (process.platform === "win32") return "win32-x64";
  return process.arch === "arm64" ? "darwin-arm64" : "darwin-x64";
}

function isRunnable(filePath: string): boolean {
  try {
    if (!statSync(filePath).isFile()) return false;
    if (process.platform !== "win32") {
      accessSync(filePath, constants.X_OK);
    }
    return true;
  } catch {
    return false;
  }
}

function firstRunnable(candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    if (isRunnable(candidate)) return candidate;
  }
  return undefined;
}

function resourceCandidates(toolDir: string, binaryName: string): string[] {
  const relative = path.join(
    toolDir,
    platformDirectory(),
    platformBinaryName(binaryName),
  );
  const roots = [
    path.join(process.resourcesPath, "resources"),
    process.resourcesPath,
    path.join(app.getAppPath(), "resources"),
    path.join(process.cwd(), "resources"),
  ];
  return roots.map((root) => path.join(root, relative));
}

/** Env overrides passed into `utilityProcess.fork` for the Library Worker. */
export function mediaBinaryWorkerEnv(
  baseEnv: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env = { ...baseEnv };
  // Electron UtilityProcess 不总是继承主进程通过 Module._initPaths
  // 设置的 NODE_PATH。宿主集成(例如 YUH Studio)会通过
  // SERPENT_NODE_MODULES 指向外置依赖目录，显式传递给 worker，确保
  // better-sqlite3、sharp 等 external 依赖可以被解析。
  const dependencyRoots = [env.NODE_PATH, env.SERPENT_NODE_MODULES]
    .filter((value): value is string => Boolean(value && value.trim()))
    .flatMap((value) => value.split(path.delimiter))
    .filter((value, index, values) => values.indexOf(value) === index);
  if (dependencyRoots.length > 0) {
    env.NODE_PATH = dependencyRoots.join(path.delimiter);
  }
  // A configured path is authoritative even when it does not exist. This is
  // intentional: launch-time test and development overrides must reach the
  // Worker unchanged so a missing component reports FFMPEG_REQUIRED instead
  // of silently recovering from bundled/PATH binaries.
  if (env.SERPENT_FFMPEG_PATH === undefined) {
    const ffmpeg = firstRunnable(resourceCandidates("ffmpeg", "ffmpeg"));
    if (ffmpeg) env.SERPENT_FFMPEG_PATH = ffmpeg;
  }
  if (env.SERPENT_OIIO_PATH === undefined) {
    const oiiotool = firstRunnable(resourceCandidates("oiio", "oiiotool"));
    if (oiiotool) env.SERPENT_OIIO_PATH = oiiotool;
  }
  // Ensure worker can still find sibling tools next to an env override.
  if (env.SERPENT_FFMPEG_PATH && existsSync(env.SERPENT_FFMPEG_PATH)) {
    const dir = path.dirname(env.SERPENT_FFMPEG_PATH);
    const pathKey = process.platform === "win32" ? "Path" : "PATH";
    const current = env[pathKey] ?? env.PATH ?? "";
    if (!current.split(path.delimiter).includes(dir)) {
      env[pathKey] = `${dir}${path.delimiter}${current}`;
    }
  }
  return env;
}
