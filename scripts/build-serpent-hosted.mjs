import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const yuhRoot = path.resolve(import.meta.dirname, "..");
// Serpent 是 YUH-Studio 的内置模块：源码仅使用 YUH-Studio/Serpent，
// 不再回退到工作区旁的同级 Serpent，确保所有源码都位于 YUH-Studio 目录下。
const serpentRoot = path.join(yuhRoot, "Serpent");
if (!fs.existsSync(path.join(serpentRoot, "src"))) {
  throw new Error(`[yuh] embedded Serpent source not found: ${serpentRoot}`);
}
const outRoot = path.join(yuhRoot, "build", "serpent");
const readyFiles = [
  path.join(outRoot, ".vite", "hosted-build", "main.js"),
  path.join(outRoot, ".vite", "build", "library_worker.js"),
  path.join(outRoot, ".vite", "renderer", "main_window", "index.html"),
  path.join(outRoot, "node_modules", "better-sqlite3", "lib", "index.js"),
];
function latestMtime(root) {
  if (!fs.existsSync(root)) return 0;
  const stat = fs.statSync(root);
  if (stat.isFile()) return stat.mtimeMs;
  let latest = stat.mtimeMs;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    // 跳过依赖和构建缓存，避免无关文件触发重建。
    if (entry.name === "node_modules" || entry.name === ".vite" || entry.name === "dist") continue;
    latest = Math.max(latest, latestMtime(path.join(root, entry.name)));
  }
  return latest;
}

const sourceRoots = [
  path.join(serpentRoot, "src"),
  path.join(serpentRoot, "styles"),
  path.join(serpentRoot, "vite.renderer.config.ts"),
  path.join(serpentRoot, "vite.hosted-preload.config.ts"),
  path.join(serpentRoot, "vite.hosted-main.config.ts"),
  path.join(serpentRoot, "vite.worker.config.ts"),
  path.join(serpentRoot, "scripts", "hosted-rebuild.mjs"),
];
// 原始 ShuoCanvas 是替换工作室的唯一参考源；纳入新鲜度判断，确保用户
// 修改原项目或重新同步后，YUH 不会继续加载旧的 hosted 构建。
const shuocanvasRoot = process.env.SHUOCANVAS_ROOT || "F:\\PyCharm_Project\\ShuoCanvas";
sourceRoots.push(
  path.join(shuocanvasRoot, "app", "src", "modules", "personReplacement"),
  path.join(shuocanvasRoot, "app", "styles", "person-replacement-workspace.css"),
  path.join(shuocanvasRoot, "app", "styles", "person-replacement-workspace-v2.css"),
  path.join(shuocanvasRoot, "app", "images"),
);
const sourceMtime = Math.max(...sourceRoots.map(latestMtime));
// 运行时依赖(如 better-sqlite3)可能来自历史复制，不能参与新鲜度判断；
// 只比较由 hosted-rebuild 直接生成的三个构建产物。
const buildOutputs = readyFiles.slice(0, 3);
const outputMtime = Math.min(...buildOutputs.map((file) => fs.existsSync(file) ? fs.statSync(file).mtimeMs : 0));
if (process.env.YUH_REBUILD_SERPENT !== "1" && readyFiles.every((file) => fs.existsSync(file)) && outputMtime >= sourceMtime) {
  console.log(`[yuh] Serpent hosted runtime already present at ${outRoot}; skip rebuild`);
  process.exit(0);
}

execFileSync(process.execPath, [path.join(serpentRoot, "scripts", "hosted-rebuild.mjs")], {
  cwd: serpentRoot,
  stdio: "inherit",
});

fs.rmSync(outRoot, { recursive: true, force: true });
fs.mkdirSync(outRoot, { recursive: true });
const viteRoot = path.join(outRoot, ".vite");
fs.mkdirSync(viteRoot, { recursive: true });
for (const [source, target] of [
  [path.join(serpentRoot, ".vite", "hosted-build"), path.join(viteRoot, "hosted-build")],
  [path.join(serpentRoot, ".vite", "build"), path.join(viteRoot, "build")],
  [path.join(serpentRoot, ".vite", "renderer", "main_window"), path.join(viteRoot, "renderer", "main_window")],
]) {
  fs.cpSync(source, target, { recursive: true });
}
// Hosted UtilityProcess runs from build/serpent and does not reliably resolve
// external worker dependencies from the host's NODE_PATH. Bundle the small
// set of native/runtime packages that the worker declares as externals next
// to the hosted runtime so packaged and dev launches use the same resolution
// path.
const runtimeModules = [
  "better-sqlite3",
  "bindings",
  "file-uri-to-path",
  "koffi",
  "sharp",
  "@img",
  "trash",
  "exifr",
  "@napi-rs/canvas",
];
const runtimeModulesRoot = path.join(outRoot, "node_modules");
fs.mkdirSync(runtimeModulesRoot, { recursive: true });
for (const moduleName of runtimeModules) {
  const source = path.join(serpentRoot, "node_modules", moduleName);
  if (!fs.existsSync(source)) continue;
  fs.cpSync(source, path.join(runtimeModulesRoot, moduleName), { recursive: true });
}
console.log(`[yuh] Serpent hosted runtime copied to ${outRoot}`);
