"use strict";
/**
 * YUH-Studio × Serpent 可行性验证：宿主集成模块（phase 1，不改原版 UI）。
 *
 * 原理：
 *   - SERPENT_HOSTED=1 时，Serpent 的 src/main/index.ts 不创建自己的窗口/菜单/托盘，
 *     只启动服务（worker/DB、offscreen 缩略图、扩展服务器、全部 IPC handler）。
 *   - 本模块把 Serpent 的 renderer（.vite/renderer/main_window/index.html）挂到
 *     YUH 主窗口的一个 WebContentsView 上，preload 用的也是 Serpent 自己的
 *     preload bundle（.vite/build/index.js）。
 *   - 三个验证点：视图启动（renderer 挂载 + window.serpent API 存在）、DB 打开
 *     （library.create / listRecent）、缩略图（importFiles → thumbnail artifact）。
 *
 * 开关：YUH_SERPENT_HOST=1 时启用（配合 SERPENT_ROOT 指定 Serpent 目录）。
 */
const path = require("node:path");
const fs = require("node:fs");
const { app, WebContentsView, BrowserWindow } = require("electron");
const { mark } = require("./serpent-host-mark");

// --- stdio hardening (YUH_SERPENT_STDIO_FILE=<path>) ---
// A broken stdout/stderr pipe makes console.log emit an ASYNC error that
// try/catch cannot intercept; the resulting uncaughtException can land exactly
// during the utilityProcess.fork handshake and hang the Library Worker spawn.
// Redirect stdio to a file when hosting under a background job.
(function hardenStdio() {
  const file = process.env.YUH_SERPENT_STDIO_FILE;
  if (!file) return;
  try {
    const fs = require("node:fs");
    const { Writable } = require("node:stream");
    const fd = fs.openSync(file, "a");
    const mk = () =>
      new Writable({
        write(chunk, _enc, cb) {
          try {
            fs.writeSync(fd, chunk);
          } catch {}
          cb();
        },
      });
    process.stdout = mk();
    process.stderr = mk();
  } catch {}
})();
// --- end stdio hardening ---

// --- DSH diagnostic instrumentation (YUH_SERPENT_FORK_DIAG=1) ---
function installDiag() {
  if (process.env.YUH_SERPENT_FORK_DIAG !== "1") return;
  try {
    const up = require("electron").utilityProcess;
    const origFork = up.fork.bind(up);
    up.fork = function forkDiag(...args) {
      mark("diag:fork-enter");
      const child = origFork(...args);
      mark("diag:fork-returned", `pid=${child.pid}`);
      child.on("spawn", () => mark("diag:fork-spawn", `pid=${child.pid}`));
      child.on("exit", (code) => mark("diag:fork-exit", `code=${code}`));
      child.on("error", (e) => mark("diag:fork-error", String(e)));
      return child;
    };
    mark("diag:fork-wrapped");
  } catch (error) {
    mark("diag:install-FAIL", String(error));
  }
  setInterval(() => mark("diag:hb", String(Date.now())), 3000).unref();
  let firstStacks = new Map();
  const counters = new Map();
  process.on("uncaughtException", (e) => {
    const key = String(e);
    if (!firstStacks.has(key)) {
      firstStacks.set(key, e && e.stack ? e.stack : String(e));
      mark("diag:uncaught-first", JSON.stringify(firstStacks.get(key)).slice(0, 4000));
    }
    const n = (counters.get(key) || 0) + 1;
    counters.set(key, n);
    if (n % 20000 === 0) mark("diag:uncaught-count", `${key} x${n}`);
  });
  process.on("unhandledRejection", (e) => mark("diag:unhandled", String(e)));
  mark("diag:installed");
}
installDiag();
// --- end DSH diagnostic instrumentation ---

// 默认 Serpent 目录：仓库内 `AI-Creative-Studio/Serpent`（YUH 已移入同仓库）。
// __dirname = <repo>/YUH-Studio/dev-src, 向上 2 级 = <repo>, 再进 Serpent。
const SERPENT_ROOT = process.env.SERPENT_ROOT || path.join(
  __dirname,
  "..",
  "..",
  "Serpent",
);
const SERPENT_BUILD = path.join(SERPENT_ROOT, ".vite", "hosted-build");
const SERPENT_PRELOAD = path.join(SERPENT_ROOT, ".vite", "build", "index.js");
const SERPENT_WORKER = path.join(SERPENT_ROOT, ".vite", "build", "library_worker.js");
const SERPENT_RENDERER_HTML = path.join(
  SERPENT_ROOT,
  ".vite",
  "renderer",
  "main_window",
  "index.html",
);

let serpentMain = null; // Serpent 主进程模块（patched build）
let serpView = null; // WebContentsView
let hostWindow = null; // YUH 主窗口（dialog parent）
let started = false; // Serpent 服务已启动
let shutdownDone = false;
let resizeHandler = null;
let viewAttached = false; // 嵌入视图当前是否可见（在 contentView 中）
let lastError = null;
let railWidthPx = 0; // 渲染进程上报的侧边栏实测宽度
let railLeftPx = 0; // 侧边栏右边缘（渲染进程坐标）
let bodyTopPx = 0; // 内容区顶部（渲染进程坐标）
const statusListeners = new Set();

// 默认启用：Serpent 构建产物存在即可用（YUH_SERPENT_HOST=0 可显式禁用）。
function enabled() {
  if (process.env.YUH_SERPENT_HOST === "0") return false;
  return require("node:fs").existsSync(path.join(SERPENT_BUILD, "main.js"));
}

function getState() {
  return {
    enabled: enabled(),
    servicesStarted: started,
    rendererReady:
      Boolean(serpView) &&
      !serpView.webContents.isDestroyed() &&
      serpView.webContents.getURL().length > 0,
    visible: viewAttached,
    error: lastError,
  };
}

function pushState() {
  const state = getState();
  for (const listener of statusListeners) {
    try {
      listener(state);
    } catch {}
  }
}

function onState(listener) {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function setRailWidthPx(width, left, bodyTop) {
  if (typeof width === "number" && width > 0 && width !== railWidthPx) {
    railWidthPx = width;
  }
  if (typeof left === "number" && left > 0) railLeftPx = left;
  if (typeof bodyTop === "number" && bodyTop > 0) bodyTopPx = bodyTop;
  layoutView();
}

/**
 * 在任何 app.ready 之前调用（本项目在 main 模块顶部即 require 本文件，
 * 因此这里天然早于 ready）：设置 hosted 环境并加载 Serpent 主模块。
 */
function preload() {
  mark("preload:enter", `enabled=${enabled()}`);
  if (!enabled()) return false;
  if (!require("node:fs").existsSync(path.join(SERPENT_BUILD, "main.js"))) {
    mark("preload:build-missing", SERPENT_BUILD);
    console.error("[serpent-host] Serpent build missing:", SERPENT_BUILD);
    return false;
  }
  process.env.SERPENT_HOSTED = "1";
  // Serpent 数据与宿主隔离：放进宿主 userData 的子目录，避免污染宿主的
  // workspace-settings.json 等。Serpent 只在 app 层用 getPath('userData')。
  process.env.SERPENT_USER_DATA_DIR = path.join(
    app.getPath("userData"),
    "serpent",
  );
  const mainModule = path.join(SERPENT_BUILD, "main.js");
  try {
    mark("preload:require", mainModule);
    serpentMain = require(mainModule);
    mark("preload:loaded", "OK");
    console.log("[serpent-host] Serpent main module loaded:", mainModule);
    return true;
  } catch (error) {
    mark("preload:ERROR", String(error && error.stack ? error.stack : error));
    console.error("[serpent-host] failed to load Serpent main module:", error);
    serpentMain = null;
    return false;
  }
}

function layoutView() {
  if (!serpView || !hostWindow || hostWindow.isDestroyed()) return;
  const bounds = hostWindow.getContentBounds();
  // 左侧让出侧边栏（.left-rail: clamp(168px, 11vw, 200px)），顶部让出标题栏
  // 40px；优先使用渲染进程上报的实测 railLeftPx/bodyTopPx，缺省时按 11vw 近似。
  const sideWidth =
    railLeftPx > 0
      ? railLeftPx
      : railWidthPx > 0
        ? railWidthPx
        : Math.max(168, Math.min(200, Math.round(bounds.width * 0.11)));
  const top = bodyTopPx > 0 ? bodyTopPx : 40;
  serpView.setBounds({
    x: sideWidth,
    y: top,
    width: Math.max(0, bounds.width - sideWidth),
    height: Math.max(0, bounds.height - top),
  });
  mark(
    "mount:view-bounds",
    `x=${sideWidth} y=${top} w=${Math.max(0, bounds.width - sideWidth)} h=${Math.max(0, bounds.height - top)} window=${bounds.width}x${bounds.height}`,
  );
}

/**
 * Hosted 模式下 Serpent 的 `registerWindowControls` 被跳过（它只服务
 * Serpent 自己的 mainWindow），且宿主窗口自带最小化/最大化/关闭，嵌入视图
 * 不再显示标题栏按钮：宿主把 ?serpentHosted=1 传给 renderer 隐藏按钮，
 * 因此这里不再注册任何 window-control IPC 桥接（功能一并移除）。
 */

/**
 * 幂等地启动 Serpent 全部服务（worker/DB + offscreen + IPC handler）。
 */
async function ensureServices() {
  if (started) return true;
  mark("mount:startSerpentHosted");
  await serpentMain.startSerpentHosted();
  started = true;
  mark("mount:services-started");
  console.log("[serpent-host] Serpent services started (worker/DB + offscreen)");
  return true;
}

/**
 * 幂等地创建嵌入视图并加载 Serpent renderer（成功后 serpView 已就绪）。
 * 隐藏（removeChildView）不会销毁视图 —— 渲染进程与资源库状态原样保留，
 * 再次 show 立即恢复上次浏览内容。仅当渲染进程已死（崩溃/被销毁）时
 * 丢弃旧视图并重建一个新的。
 */
async function ensureView() {
  if (serpView) {
    const wc = serpView.webContents;
    if (wc && !wc.isDestroyed()) return true;
    // 死视图（崩溃/OOM/被销毁）绝不能作为空白视图重新挂回；丢弃并重建。
    mark("mount:view-stale-recreate");
    if (hostWindow && !hostWindow.isDestroyed()) {
      try {
        hostWindow.contentView.removeChildView(serpView);
      } catch {}
    }
    serpView = null;
    viewAttached = false;
  }
  // 宿主窗口回调需要真实 BrowserWindow。
  const win = getYuhWindow();
  hostWindow = win;
  if (!win) {
    mark("mount:ERROR", "no host window found for dialog parent");
    lastError = "no host window found for dialog parent";
    return false;
  }
  serpentMain.setSerpentHostedDialogWindow(win);
  win.on("resize", layoutView);

  // 创建嵌入视图：Serpent 自己的 preload + sandbox。
  const view = new WebContentsView({
    webPreferences: {
      preload: SERPENT_PRELOAD, // Serpent preload bundle (.vite/build/index.js)
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: false, // 与 YUH dev 行为一致：file:// 下加载本地资源
    },
  });
  serpView = view;
  mark("mount:view-created");

  // 把视图 webContents 交给 Serpent（所有 send/授权检查都改为查它）。
  serpentMain.setSerpentHostedRenderer(view.webContents);

  // 加载 Serpent 渲染器。?serpentHosted=1 让 renderer 隐藏自绘的
  // 最小化/最大化/关闭标题栏按钮（宿主窗口自带这些控制）。
  mark("mount:loadFile", SERPENT_RENDERER_HTML);
  await view.webContents.loadFile(SERPENT_RENDERER_HTML, {
    query: { serpentHosted: "1" },
  });
  mark("mount:renderer-loaded");
  console.log("[serpent-host] renderer loaded:", SERPENT_RENDERER_HTML);

  // 挂载探测：等 renderer 的 .app-shell 出现。
  const mounted = await waitForMounted(view.webContents, 20_000);
  mark("mount:mounted", String(mounted));
  console.log(
    mounted
      ? "[serpent-host] renderer MOUNTED (.app-shell)"
      : "[serpent-host] renderer did NOT mount within timeout",
  );
  if (mounted && process.env.YUH_SERPENT_SMOKE === "1") {
    await runSmoke(view.webContents);
  }
  return mounted;
}

/**
 * 显示 Serpent 视图（必要时先懒挂载）。返回 true 表示视图已可见。
 */
async function show() {
  mark("mount:enter", `enabled=${enabled()} serpentMain=${Boolean(serpentMain)}`);
  if (!enabled() || !serpentMain) {
    lastError = "Serpent 未启用或主模块未加载";
    pushState();
    return false;
  }
  try {
    await ensureServices();
    const viewReady = await ensureView();
    if (!viewReady || !serpView || !hostWindow || hostWindow.isDestroyed()) {
      lastError = lastError || "Serpent 视图初始化失败";
      pushState();
      return false;
    }
    if (!viewAttached) {
      hostWindow.contentView.addChildView(serpView);
      viewAttached = true;
      layoutView();
    }
    lastError = null;
    pushState();
    return true;
  } catch (error) {
    lastError = String(error && error.stack ? error.stack : error);
    mark("mount:ERROR", lastError);
    console.error("[serpent-host] mount failed:", error);
    pushState();
    return false;
  }
}

/**
 * 隐藏 Serpent 视图（服务保持运行，再次 show 立即恢复）。
 */
function hide() {
  if (!viewAttached || !serpView) {
    pushState();
    return false;
  }
  const wc = serpView.webContents;
  // 渲染进程已死：直接当作已隐藏，避免把死视图留在 contentView 里。
  if (!wc || wc.isDestroyed()) {
    serpView = null;
    viewAttached = false;
    pushState();
    return true;
  }
  try {
    if (hostWindow && !hostWindow.isDestroyed()) {
      hostWindow.contentView.removeChildView(serpView);
    }
  } catch (error) {
    console.error("[serpent-host] hide error:", error);
  }
  viewAttached = false;
  pushState();
  return true;
}

/**
 * 切换显示/隐藏。
 */
async function toggle() {
  if (viewAttached) {
    hide();
    return false;
  }
  return show();
}

/**
 * 自动化冒烟（YUH_SERPENT_SMOKE=1）：直接从嵌入视图里调用 Serpent 的
 * preload API，验证 ① IPC 往返 ② worker/DB（创建库 + 写数据库文件）
 * ③ 缩略图（导入图片 → 轮询缩略图 artifact）。
 */
async function runSmoke(webContents) {
  mark("smoke:enter");
  const fs = require("node:fs");
  const os = require("node:os");
  const pathNode = require("node:path");

  const smokeDir = process.env.YUH_SERPENT_SMOKE_DIR || pathNode.join(os.tmpdir(), "serpent-host-smoke");
  fs.mkdirSync(smokeDir, { recursive: true });

  const report = { ok: false, steps: [] };
  const step = async (name, fn) => {
    try {
      mark(`smoke:step-${name}`);
      const value = await fn();
      report.steps.push({ name, ok: true, value });
      mark(`smoke:step-${name}-ok`);
      console.log(`[serpent-host:smoke] OK  ${name}`, value ?? "");
      return value;
    } catch (error) {
      mark(`smoke:step-${name}-FAIL`, String(error));
      report.steps.push({ name, ok: false, error: String(error) });
      console.log(`[serpent-host:smoke] FAIL ${name}`, error);
      return undefined;
    }
  };

  const js = (script) =>
    webContents.executeJavaScript(`(async () => { ${script} })()`);

  // ① IPC 往返：renderer 里 window.serpent 存在与否 + listRecent 调用。
  const apiExists = await step("ipc.windowSerpentApi", async () => {
    const exists = await webContents.executeJavaScript(
      "typeof window.serpent !== 'undefined'",
    );
    if (!exists) throw new Error("window.serpent API is missing");
    return "present";
  });
  if (!apiExists) {
    fs.writeFileSync(pathNode.join(smokeDir, "report.json"), JSON.stringify(report, null, 2));
    console.error("[serpent-host:smoke] abort: API missing");
    return;
  }

  await step("ipc.listRecent", () =>
    js("return await window.serpent.library.listRecent();"),
  );

  // ② DB：创建库（E2E 注入目录 → 不用点击原生对话框）。
  const created = await step("db.createLibrary", async () => {
    const result = await js(`
      const name = 'hosted-smoke-' + Date.now();
      const res = await window.serpent.library.create({ displayName: name });
      return JSON.stringify({ name, res });
    `);
    return result;
  });

  // ③ 缩略图：准备一张测试 PNG，通过 E2E 导入文件。
  // (sharp 在宿主 Electron 主进程里 require/编码可能挂起 —— 用预置 base64 PNG，
  // 缩略图管线不关心 PNG 来源，只关心 artifact 是否生成。)
  const pngPath = pathNode.join(smokeDir, "smoke.png");
  mark("smoke:png-write");
  // 80x60 RGB PNG, validated with sharp (1x1 PNG was rejected by libpng).
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAFAAAAA8CAIAAAB+RarbAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAqUlEQVRoge3XURFEMQhDUeRcOU92Za2J7fDRM4MASCAJc76eqlnvwMBhOCudG45oRaXZ0tk2ScEjSSvRMlk6z0O+pW/fMNhSNyCYdcgx3FUIZh1yDIfhrHRuOKIVlWZL54Ga9Q4MHIaz0rnhiFZUmi2dbZMUPJK0Ei2TpfM85Fv69g2DLXUDglmHHMNdhWDWIcdwGM5K54YjWlFptnQeqFnvwMBhuD9C8APcTXFarGTntAAAAABJRU5ErkJggg==";
  fs.writeFileSync(pngPath, Buffer.from(pngBase64, "base64"));
  mark("smoke:png-written", pngPath);

  let libraryId = null;
  let libraryPath = null;
  let assetId = null;
  try {
    const parsed = JSON.parse(created);
    libraryId =
      parsed?.res?.value?.libraryId ??
      parsed?.value?.value?.libraryId ??
      parsed?.value?.library?.libraryId ??
      null;
    libraryPath =
      parsed?.res?.value?.displayPath ??
      parsed?.value?.value?.displayPath ??
      parsed?.value?.library?.displayPath ??
      null;
  } catch {}
  if (libraryId) {
    process.env.SERPENT_E2E_IMPORT_FILES = pngPath;
    const imported = await step("thumbnail.importFiles", async () => {
      const result = await js(`
        const res = await window.serpent.library.importFiles({ libraryId: ${JSON.stringify(libraryId)} });
        return JSON.stringify(res);
      `);
      return result;
    });
    // importFiles 响应里带 assets[0].assetId；解析后显式请求缩略图（即时生成路径）。
    try {
      const parsed = JSON.parse(imported);
      assetId = parsed?.value?.assets?.[0]?.assetId ?? null;
    } catch {}
    if (assetId) {
      const thumbReq = await step("thumbnail.requestThumbnail", async () => {
        const result = await js(`
          const res = await window.serpent.library.requestThumbnail({ libraryId: ${JSON.stringify(libraryId)}, assetId: ${JSON.stringify(assetId)} });
          return JSON.stringify(res);
        `);
        return result;
      });
      report.thumbnailRequest = thumbReq;
    } else {
      mark("smoke:no-asset-id", String(imported).slice(0, 300));
    }
    // 缩略图 artifact 会写到 <library>/.serpent/artifacts 下（PNG 文件）；
    // 生成是异步 job，轮询最多 30s，验证文件存在 + PNG 魔数。
    const artifact = await step("thumbnail.artifactPng", async () => {
      mark("smoke:scan", libraryPath || "unknown");
      if (!libraryPath || !fs.existsSync(libraryPath)) throw new Error(`library path missing: ${libraryPath}`);
      const artifactsDir = pathNode.join(libraryPath, ".serpent", "artifacts");
      if (!fs.existsSync(artifactsDir)) throw new Error(`no artifacts dir: ${artifactsDir}`);
      const deadline = Date.now() + 30_000;
      let images = [];
      while (Date.now() < deadline) {
        images = [];
        const walk = (dir) => {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = pathNode.join(dir, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) images.push(p);
          }
        };
        walk(artifactsDir);
        if (images.length > 0) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (images.length === 0) throw new Error(`no image artifact found under ${artifactsDir} within 30s`);
      // 校验 PNG/JPEG/WebP 魔数
      const candidate = images[0];
      const head = Buffer.from(fs.readFileSync(candidate).subarray(0, 12));
      const hex = head.toString("hex");
      const okSig =
        hex.startsWith("89504e470d0a1a0a") || // PNG
        hex.startsWith("ffd8ff") || // JPEG
        hex.startsWith("52494646") || // RIFF/WEBP
        (hex.startsWith("00000100") || hex.startsWith("ffd8") ); // legacy
      if (!okSig) throw new Error(`bad image signature: ${hex}`);
      const stat = fs.statSync(candidate);
      mark("smoke:artifact", `${candidate} ${stat.size}B sig=${hex.slice(0, 8)}`);
      return `${candidate} (${stat.size} bytes, ${pathNode.extname(candidate)})`;
    });
    report.artifact = artifact;
  }

  report.ok = report.steps.every((s) => s.ok);
  const reportPath = pathNode.join(smokeDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  mark("smoke:report-written", reportPath);
  console.log(
    `[serpent-host:smoke] ${report.ok ? "ALL PASS" : "PARTIAL"} report=${reportPath}`,
  );
  // Smoke 完成后自动退出（无用户会看这个 headless 会话），避免孤儿进程。
  if (process.env.YUH_SERPENT_EXIT_AFTER_SMOKE === "1") {
    mark("smoke:quit");
    await shutdown();
    app.quit();
  }
}

function getYuhAppPath() {
  return path.join(__dirname, "..", "..");
}

async function waitForMounted(webContents, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const ok = await webContents.executeJavaScript(
        "Boolean(document.querySelector('#root .app-shell'))",
      );
      if (ok) return true;
    } catch {
      // page 尚未就绪
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function getYuhWindow() {
  // dev-src/main/index.js 维护了一个 mainWindow；这里从可用窗口中取即可。
  // 优先：传入宿主创建主窗口时的回调；后备：当下唯一非销毁窗口。
  const all = BrowserWindow.getAllWindows().filter((w) => !w.isDestroyed());
  return all[0] || null;
}

// --- ComfyUI 输出路径跟踪（资源管理自动链接） ------------------------------
// 把 YUH 存储设置中的输出文件夹自动注册为当前 Serpent 资源库的链接文件夹
// 「ComfyUI 输出」：虚拟索引、不复制文件；链接根目录由 Serpent 的
// fs watcher 自动增量收录新生成物，合集/智能合集/标签/搜索/删除等
// 资源管理能力全部可用。
const COMFYUI_LINK_DISPLAY_NAME = "ComfyUI 输出";
const COMFYUI_LINK_STATE_FILE = "yuh-comfyui-link-state.json";

function comfyuiLinkStatePath() {
  return path.join(app.getPath("userData"), COMFYUI_LINK_STATE_FILE);
}

function readComfyuiLinkState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(comfyuiLinkStatePath(), "utf8"));
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // 首次运行或文件损坏：当作从未同步过。
  }
  return null;
}

function writeComfyuiLinkState(state) {
  try {
    fs.mkdirSync(path.dirname(comfyuiLinkStatePath()), { recursive: true });
    fs.writeFileSync(
      comfyuiLinkStatePath(),
      JSON.stringify(state, null, 2),
      "utf8",
    );
  } catch (error) {
    console.error("[serpent-host] write comfyui-link state failed:", error);
  }
}

/**
 * 幂等同步「ComfyUI 输出」链接文件夹到当前资源库。
 *
 * 规则：
 *  - 已存在且输出路径一致 → 无操作；
 *  - 已存在但输出路径变了 → 自动 relink（保留链接 id、继续收录新文件）；
 *  - 不存在 → 自动创建（功能默认开启）；
 *  - 同一资源库中曾同步过、现在消失了 → 视为用户手动移除，不再自动重建；
 *    若用户之后手动以同一路径导入，下一次同步会把该链接认领回来并恢复跟踪；
 *  - 还打开着别的资源库（从未在该库同步过）→ 照常创建；
 *  - 尚未打开资源库 → 返回 no-library-open，下次打开资源管理时重试。
 */
async function ensureComfyuiOutputLink(outputRoot) {
  if (!outputRoot || typeof outputRoot !== "string" || !outputRoot.trim()) {
    mark("link:invalid", String(outputRoot));
    return { ok: false, code: "invalid-output-dir" };
  }
  const root = outputRoot.trim();
  mark("link:enter", `root=${root} started=${started} main=${Boolean(serpentMain)}`);
  // 生成资产 fixed sidebar: hand the output root to Serpent main so the
  // renderer can match it against the linked folder below and show the
  // 图像/视频/音频 rows. Set before the readiness guard — the renderer may
  // refetch the root as soon as the library opens (no-library-open is fine).
  try {
    if (serpentMain && typeof serpentMain.setHostedGeneratedAssetsRoot === "function") {
      serpentMain.setHostedGeneratedAssetsRoot(root, COMFYUI_LINK_DISPLAY_NAME);
      mark("link:root-set", root);
    } else {
      mark("link:root-set-skipped", "setter unavailable");
    }
  } catch (error) {
    console.warn("[serpent-host] set generated-assets root failed:", error);
    mark("link:root-set-FAIL", String(error));
  }
  if (!started || !serpentMain || typeof serpentMain.hostedManageLinkedFolder !== "function") {
    mark("link:skip", "serpent-not-ready");
    return { ok: false, code: "serpent-not-ready" };
  }
  try {
    const state = readComfyuiLinkState();
    mark(
      "link:state",
      JSON.stringify(
        state
          ? {
              libraryId: state.libraryId,
              root: state.root,
              folderId: state.folderId ?? null,
              dismissed: state.dismissedLibraryId ?? null,
            }
          : null,
      ),
    );
    const previousSynced =
      state &&
      typeof state.libraryId === "string" &&
      typeof state.root === "string";

    const decide = async (allowCreate, depth) => {
      if (depth > 2) {
        return { ok: false, code: "sync-error", message: "unexpected repeated missing" };
      }
      const result = await serpentMain.hostedManageLinkedFolder({
        displayName: COMFYUI_LINK_DISPLAY_NAME,
        sourceRootPath: root,
        allowCreate,
      });
      mark(
        "link:manage-result",
        `code=${result.code || "ok"} action=${result.action || "-"} folder=${result.folderId ?? "-"} library=${result.libraryId || "-"}`,
      );
      if (!result.ok) return result;
      if (result.action === "missing") {
        const userRemoved = previousSynced && state.libraryId === result.libraryId;
        if (userRemoved) {
          writeComfyuiLinkState({
            ...state,
            libraryId: result.libraryId,
            folderId: null,
            root,
            dismissedLibraryId: result.libraryId,
          });
          return { ok: false, code: "removed-by-user" };
        }
        // 首次同步或换到新的资源库：允许创建。
        return decide(true, depth + 1);
      }
      writeComfyuiLinkState({
        libraryId: result.libraryId,
        folderId: result.folderId ?? null,
        root,
        dismissedLibraryId: null,
      });
      return result;
    };

    const result = await decide(previousSynced ? false : true, 0);
    mark("link:result", `code=${result.code || "ok"} action=${result.action || "-"} folder=${result.folderId ?? "-"}`);
    if (result.ok) {
      console.log(
        `[serpent-host] comfyui link ${result.action} folder=${result.folderId || "-"} root=${root}`,
      );
    } else if (result.code !== "no-library-open" && result.code !== "removed-by-user") {
      console.warn("[serpent-host] comfyui link sync failed:", result);
    }
    return result;
  } catch (error) {
    console.error("[serpent-host] comfyui link sync error:", error);
    return {
      ok: false,
      code: "sync-error",
      message: String((error && error.message) || error),
    };
  }
}

/**
 * 宿主退出前调用：停掉 Serpent 服务并清理视图。
 */
async function shutdown() {
  if (shutdownDone) return;
  shutdownDone = true;
  if (!enabled()) return;
  try {
    if (serpView) {
      const wc = serpView.webContents;
      if (wc && !wc.isDestroyed()) wc.close();
      if (hostWindow && !hostWindow.isDestroyed() && serpView) {
        hostWindow.contentView.removeChildView(serpView);
      }
      serpView = null;
      viewAttached = false;
    }
    if (resizeHandler && hostWindow && !hostWindow.isDestroyed()) {
      hostWindow.removeListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (started && serpentMain && typeof serpentMain.stopSerpentHosted === "function") {
      await serpentMain.stopSerpentHosted();
      console.log("[serpent-host] Serpent services stopped");
    }
  } catch (error) {
    console.error("[serpent-host] shutdown error:", error);
  }
}

module.exports = {
  preload,
  show,
  hide,
  toggle,
  shutdown,
  enabled,
  getState,
  onState,
  setRailWidthPx,
  ensureComfyuiOutputLink,
  /**
   * 推送生成记录（输出路径 → prompt/工作流/参数/模型/耗时）给 Serpent 主进程。
   * 旧版 Serpent 构建没有该 API 时静默跳过。
   */
  setGeneratedAssetsRecords(records) {
    try {
      if (serpentMain && typeof serpentMain.setHostedGenerationRecords === "function") {
        serpentMain.setHostedGenerationRecords(records);
        return true;
      }
    } catch (error) {
      console.warn("[serpent-host] set generation records failed:", error);
    }
    return false;
  },
};
