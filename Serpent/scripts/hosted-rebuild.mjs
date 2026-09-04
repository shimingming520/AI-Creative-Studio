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

/**
 * 每次 hosted 构建前从原始 ShuoCanvas 项目同步替换工作室运行时。
 *
 * 这里保留当前仓库中两个仅针对 Electron 宿主路径的兼容补丁：
 * personReplacementApplication.js 的 Windows 绝对路径优先规则，以及
 * personReplacementWorkspace.js 对 AVI 输入的扩展名兼容；其余模块、样式
 * 和图片资源均以原始项目为唯一来源，避免构建目录继续使用旧副本。
 */
function syncOriginalReplacementRuntime() {
  const originalRoot = process.env.SHUOCANVAS_ROOT || "F:\\PyCharm_Project\\ShuoCanvas";
  if (!fs.existsSync(originalRoot)) {
    console.warn(`[hosted-rebuild] ShuoCanvas source not found, keep existing legacy copy: ${originalRoot}`);
    return;
  }
  const legacyRoot = path.join(root, "src", "renderer", "shuocanvas-legacy");
  const copyTree = (from, to, excluded = new Set()) => {
    if (!fs.existsSync(from)) return;
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue;
      const source = path.join(from, entry.name);
      const target = path.join(to, entry.name);
      if (entry.isDirectory()) copyTree(source, target, new Set());
      else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
      }
    }
  };
  const appRoot = path.join(originalRoot, "app");
  const appSrc = path.join(appRoot, "src");
  const localSrc = path.join(legacyRoot, "src");
  const protectedFiles = new Set([
    path.join("modules", "personReplacement", "personReplacementApplication.js"),
    // hosted 模式需要把 YUH 可用的视频模型映射注入原始替换工作室；
    // 该文件若被 ShuoCanvas 原始副本覆盖，模型菜单会退回 RunningHub，
    // 随后请求无法提交到当前中转站。
    path.join("modules", "personReplacement", "personReplacementProject.js"),
    path.join("modules", "personReplacement", "personReplacementWorkspace.js"),
    // 自定义中转模型使用 custom-* 前缀，需保留 provider 前缀解析补丁。
    path.join("manifests", "modelRegistry.js"),
    // 模型菜单需要保留自定义中转站分组及 custom-* 模型选择逻辑。
    path.join("components", "video-node", "modelSelectorShared.js"),
    path.join("components", "aigenVideo", "modelSelector.js"),
  ]);
  const copySrc = (from, to, relative = "") => {
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const rel = path.join(relative, entry.name);
      if (protectedFiles.has(rel)) continue;
      const source = path.join(from, entry.name);
      const target = path.join(to, entry.name);
      if (entry.isDirectory()) copySrc(source, target, rel);
      else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
      }
    }
  };
  copySrc(appSrc, localSrc);
  // 主样式表同样属于原始工作室的运行时依赖。
  // 当前副本只保留路径兼容处理，不在构建脚本里静默改写它。
  if (fs.existsSync(path.join(appRoot, "style.css"))) {
    const styleTarget = path.join(legacyRoot, "style.css");
    if (!fs.existsSync(styleTarget)) fs.copyFileSync(path.join(appRoot, "style.css"), styleTarget);
  }
  copyTree(path.join(appRoot, "styles"), path.join(legacyRoot, "styles"));
  // 原始 CSS 使用多种相对层级（../images、../../images），为保证迁移后
  // 路径与原项目一致，在各可能的解析根保留同一份静态资源。
  const imageRoot = path.join(appRoot, "images");
  for (const target of [
    path.join(root, "src", "images"),
    path.join(root, "src", "renderer", "images"),
    path.join(legacyRoot, "images"),
    // Vite 的 public 目录会原样输出到 renderer 根目录；风格库运行时
    // 使用 `images/story-styles/*.webp` 相对路径，因此这里也必须同步一份。
    path.join(root, "public", "images"),
  ]) copyTree(imageRoot, target);
  console.log(`[hosted-rebuild] synced original replacement runtime from ${originalRoot}`);
}

syncOriginalReplacementRuntime();

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

// 2.5) hosted worker：开发态没有 Forge 预构建目录时也必须生成，
// 否则宿主启动会在 worker_client 握手阶段直接退出。
run("npx vite build --config vite.worker.config.ts --outDir .vite/build --emptyOutDir false");

// 3) main → .vite/hosted-build/main.js
run("npx vite build --config vite.hosted-main.config.ts");

// 4) 组装(拷贝 .vite/build 中的运行时包)
run("node scripts/hosted-assemble.cjs");

console.log("\nhosted-rebuild OK");
