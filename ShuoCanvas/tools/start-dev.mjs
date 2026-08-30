import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(workspaceRoot, "app");
const electronPath = path.join(appRoot, ".electron-shell", "electron.exe");
const launcherRoot = path.join(appRoot, ".electron-dev-app");
const launcherPackageJsonPath = path.join(launcherRoot, "package.json");

if (!existsSync(electronPath)) {
  console.error("缺少本地 Electron 开发壳，请先运行：..\\tools\\prepare-electron-shell.ps1");
  process.exit(1);
}

await mkdir(launcherRoot, { recursive: true });
await writeFile(launcherPackageJsonPath, `${JSON.stringify({
  name: "ai-canvaspro-recovered",
  version: "0.7.9",
  private: true,
  type: "module",
  main: "../electron/main.js"
}, null, 2)}\n`, "utf8");

const child = spawn(electronPath, [launcherRoot, ...process.argv.slice(2)], {
  cwd: appRoot,
  env: {
    ...process.env,
    AIC_CANVAS_RUNTIME: process.env.AIC_CANVAS_RUNTIME || "electron",
    AIC_DISABLE_AUTO_UPDATE: process.env.AIC_DISABLE_AUTO_UPDATE || "1",
    AIC_USE_ELECTRON_CANVAS: process.env.AIC_USE_ELECTRON_CANVAS || "1"
  },
  stdio: "inherit",
  windowsHide: false
});

child.on("error", (error) => {
  console.error("启动 Electron 开发环境失败：", error);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Electron 被信号 ${signal} 终止。`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 0;
});
