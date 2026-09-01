#!node
/**
 * Hosted (YUH Studio 嵌入) 产物一键重建脚本。
 *
 * 产出(与 serpent-host.js / hosted-build 加载路径一致):
 *   .vite/renderer/main_window/index.html + assets/   ← Serpent 渲染层(替换工作室 UI)
 *   .vite/build/index.js                              ← Serpent preload(host 桥)
 *   .vite/hosted-build/main.js                        ← Serpent 主进程(hosted 模式)
 *   .vite/hosted-build/*(assemble 拷贝)               ← preload/worker/pdf 等运行时包
 *
 * 注意:
 *   - library_worker.js 等运行时包来自 forge 构建(.vite/build),脚本只做拷贝;
 *     若 worker 变更需先执行 `npx electron-forge package` 刷新 .vite/build。
 *   - 渲染层必须以 --base ./ 构建(file:// 下 /assets 绝对路径会加载失败),
 *     且产物需放入 main_window/ 子目录(与 packagedRendererOutDir 一致)。
 *
 * 用法: node scripts/hosted-rebuild.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
};

// 1) 渲染层 → .vite/renderer/main_window
fs.rmSync(path.join(root, ".vite", "renderer"), { recursive: true, force: true });
const bulk = path.join(root, ".vite", "renderer-bulk");
fs.rmSync(bulk, { recursive: true, force: true });
run("npx vite build --config vite.renderer.config.ts --outDir .vite/renderer-bulk --base ./");
const target = path.join(root, ".vite", "renderer", "main_window");
fs.mkdirSync(target, { recursive: true });
for (const entry of fs.readdirSync(bulk)) {
  fs.renameSync(path.join(bulk, entry), path.join(target, entry));
}
fs.rmdirSync(bulk);

// 2) preload → .vite/build/index.js(emptyOutDir=false,保留 library_worker 等)
run("npx vite build --config vite.hosted-preload.config.ts");

// 3) main → .vite/hosted-build/main.js
run("npx vite build --config vite.hosted-main.config.ts");

// 4) 组装(拷贝 .vite/build 中的运行时包)
run("node scripts/hosted-assemble.cjs");

console.log("\nhosted-rebuild OK");
