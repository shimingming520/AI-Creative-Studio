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

function patchStoryEpisodePlanningAssets() {
  const base = path.join(serpentRoot, "src", "renderer", "shuocanvas-legacy", "src", "modules", "storyWorkspace");
  const workspaceFile = path.join(base, "storyWorkspace.js");
  const applicationFile = path.join(base, "storyEpisodeOutlineApplication.js");
  const generationApiFile = path.join(serpentRoot, "src", "renderer", "shuocanvas-legacy", "api", "storyGenerationApi.js");
  let workspace = fs.readFileSync(workspaceFile, "utf8");
  if (!workspace.includes("assets: Array.isArray(_0x4162fa?.assets)")) {
    workspace = workspace.replace("      project: _0x396255,\n      model:", "      project: _0x396255,\n      assets: Array.isArray(_0x4162fa?.assets) ? _0x4162fa.assets : [],\n      model:");
    fs.writeFileSync(workspaceFile, workspace);
  }
  let application = fs.readFileSync(applicationFile, "utf8");
  if (!application.includes("assets: Array.isArray(assets) ? assets : [],")) {
    application = application.replace("    project = {},\n    constraints = {},", "    project = {},\n    assets = [],\n    constraints = {},");
    application = application.replace("        project: project,\n        constraints: constraints,", "        project: project,\n        assets: Array.isArray(assets) ? assets : [],\n        constraints: constraints,");
    application = application.replace("        project: _0x19f2f0.project,\n        constraints: _0x19f2f0.project.planning,", "        project: _0x19f2f0.project,\n        assets: _0x19f2f0.assets,\n        constraints: _0x19f2f0.project.planning,");
    fs.writeFileSync(applicationFile, application);
  }
  let generationApi = fs.readFileSync(generationApiFile, "utf8");
  const guards = [
    '  if (!_0x40e1e5.length) {\n    throw new Error("请先提取并确认角色、场景与道具资产。");\n  }\n',
    '  if (!_0x51edbc.length) {\n    throw new Error("请先提取并确认角色、场景与道具资产。");\n  }\n'
  ];
  for (const guard of guards) {
    if (generationApi.includes(guard)) generationApi = generationApi.replace(guard, '  // 资产设定在分集大纲之后执行；空资产列表是合法的初始状态。\n');
  }
  fs.writeFileSync(generationApiFile, generationApi);
}

// 页面切换会重新挂载剧本工作室，但不会结束同一窗口中的生成任务。
// 该补丁在每次同步原始 ShuoCanvas 后重放，避免任务状态被误判为应用关闭。
function patchStoryTaskPersistence() {
  const base = path.join(serpentRoot, "src", "renderer", "shuocanvas-legacy", "src", "modules", "storyWorkspace");
  const backgroundFile = path.join(base, "storyBackgroundTasks.js");
  const taskStateFile = path.join(base, "storyProjectTaskState.js");
  let background = fs.readFileSync(backgroundFile, "utf8");
  if (!background.includes("RUNTIME_ACTIVE_TASKS_KEY")) {
    background = background.replace(
      "const MAX_PERSISTED_TASKS = 60;",
      `const MAX_PERSISTED_TASKS = 60;
const RUNTIME_ACTIVE_TASKS_KEY = "__yuhStoryRuntimeActiveTasks";
function getRuntimeActiveTasks() {
  const root = globalThis;
  if (!(root[RUNTIME_ACTIVE_TASKS_KEY] instanceof Set)) root[RUNTIME_ACTIVE_TASKS_KEY] = new Set();
  return root[RUNTIME_ACTIVE_TASKS_KEY];
}
function runtimeTaskKey(projectId, taskId) {
  const project = normalizeText(projectId);
  const task = normalizeText(taskId);
  return project && task ? project + "::" + task : "";
}
function syncRuntimeTaskMarker(projectData = {}, task = {}) {
  const key = runtimeTaskKey(projectData?.project?.id, task?.id);
  if (!key) return;
  if (ACTIVE_STATUSES.has(normalizeText(task?.status).toLowerCase())) getRuntimeActiveTasks().add(key);
  else getRuntimeActiveTasks().delete(key);
}
export function hasStoryBackgroundTaskRuntime(projectData = {}) {
  const projectId = normalizeText(projectData?.project?.id);
  if (!projectId) return false;
  const prefix = projectId + "::";
  for (const key of getRuntimeActiveTasks()) if (key.startsWith(prefix)) return true;
  return false;
}`
    );
    background = background.replace(
      "  setStoryBackgroundTasks(_0x2833fb, [_0x24943c, ..._0x19309c]);\n  return _0x24943c;",
      "  setStoryBackgroundTasks(_0x2833fb, [_0x24943c, ..._0x19309c]);\n  syncRuntimeTaskMarker(_0x2833fb, _0x24943c);\n  return _0x24943c;"
    );
    background = background.replace(
      "  setStoryBackgroundTasks(_0x3face5, _0x5ada97);\n  return _0x33ce0a;",
      "  setStoryBackgroundTasks(_0x3face5, _0x5ada97);\n  syncRuntimeTaskMarker(_0x3face5, _0x33ce0a);\n  return _0x33ce0a;"
    );
    background = background.replace(
      "  if (_0xe9f57b) {\n    setStoryBackgroundTasks(_0x55ea4f, _0x4fe563);\n  }",
      "  if (_0xe9f57b) {\n    setStoryBackgroundTasks(_0x55ea4f, _0x4fe563);\n    _0x4fe563.forEach(_0x30a433 => syncRuntimeTaskMarker(_0x55ea4f, _0x30a433));\n  }"
    );
    fs.writeFileSync(backgroundFile, background);
  }
  let taskState = fs.readFileSync(taskStateFile, "utf8");
  if (!taskState.includes("hasStoryBackgroundTaskRuntime")) {
    taskState = taskState.replace(
      'import { settleInterruptedStoryVideoReplication } from "./storyVideoReplication.js";',
      'import { settleInterruptedStoryVideoReplication } from "./storyVideoReplication.js";\nimport { hasStoryBackgroundTaskRuntime } from "./storyBackgroundTasks.js";'
    );
    taskState = taskState.replace(
      "export function reconcilePersistedStoryProjectTasks(_0x785346 = {}) {",
      "export function reconcilePersistedStoryProjectTasks(_0x785346 = {}, {\n  preserveActiveTasks = hasStoryBackgroundTaskRuntime(_0x785346)\n} = {}) {"
    );
    taskState = taskState.replace(
      "  let _0x57ff0d = interruptStoryBackgroundTasks(_0x785346, {",
      "  let _0x57ff0d = preserveActiveTasks ? 0 : interruptStoryBackgroundTasks(_0x785346, {"
    );
    fs.writeFileSync(taskStateFile, taskState);
  }
}

patchStoryEpisodePlanningAssets();
patchStoryTaskPersistence();
execFileSync(process.execPath, [path.join(serpentRoot, "scripts", "hosted-rebuild.mjs")], {
  cwd: serpentRoot,
  stdio: "inherit",
});
patchStoryEpisodePlanningAssets();
patchStoryTaskPersistence();
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
