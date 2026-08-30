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
let started = false;
let shutdownDone = false;
let resizeHandler = null;

function enabled() {
  return process.env.YUH_SERPENT_HOST === "1";
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
  // 顶部让出 40px（YUH 自定义标题栏 drag region），其余全部给 Serpent。
  serpView.setBounds({
    x: 0,
    y: 40,
    width: bounds.width,
    height: Math.max(0, bounds.height - 40),
  });
}

/**
 * app.ready 之后调用；返回 true 表示挂载成功。
 */
async function mount() {
  mark("mount:enter", `enabled=${enabled()} serpentMain=${Boolean(serpentMain)}`);
  if (!enabled() || !serpentMain) return false;
  try {
    // 1) 启动 Serpent 全部服务（此调用会注册 IPC handler 并启动 worker）。
    mark("mount:startSerpentHosted");
    await serpentMain.startSerpentHosted();
    started = true;
    mark("mount:services-started");
    console.log("[serpent-host] Serpent services started (worker/DB + offscreen)");

    // 2) 宿主窗口回调需要真实 BrowserWindow。
    const win = getYuhWindow();
    hostWindow = win;
    if (!win) {
      mark("mount:ERROR", "no host window found for dialog parent");
    } else {
      serpentMain.setSerpentHostedDialogWindow(win);
      win.on("resize", layoutView);
    }

    // 3) 创建嵌入视图：Serpent 自己的 preload + sandbox。
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
    win.contentView.addChildView(view);
    layoutView();

    // 4) 把视图 webContents 交给 Serpent（所有 send/授权检查都改为查它）。
    serpentMain.setSerpentHostedRenderer(view.webContents);

    // 5) 加载 Serpent 渲染器。
    mark("mount:loadFile", SERPENT_RENDERER_HTML);
    await view.webContents.loadFile(SERPENT_RENDERER_HTML);
    mark("mount:renderer-loaded");
    console.log("[serpent-host] renderer loaded:", SERPENT_RENDERER_HTML);

    // 6) 挂载探测：等 renderer 的 .app-shell 出现。
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
  } catch (error) {
    mark("mount:ERROR", String(error && error.stack ? error.stack : error));
    console.error("[serpent-host] mount failed:", error);
    return false;
  }
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

module.exports = { preload, mount, shutdown, enabled };
