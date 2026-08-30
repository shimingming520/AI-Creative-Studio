import { controlChromeShellLaunchWindow, launchChromeShellWithLifecycle, normalizeChromeShellSpawnError, prepareChromeShellTaskbarIdentity } from "./chromeShellLauncher.js";
import { launchChromeBrowserWorker } from "./chromeBrowserWorker.js";
import { createChromeCdpPipeClient } from "./chromeCdpPipeClient.js";
import { createChromeShellWebPreviewManager } from "./chromeShellWebPreviewManager.js";
const BROWSER_NODE_MODE_ENV = "AIC_CHROME_BROWSER_NODE_MODE";
const BROWSER_NODE_MODES = new Set(["eager", "lazy", "off"]);
function resolveBrowserNodeMode(_0x42934d = process.env) {
  const _0xa422ff = String(_0x42934d?.[BROWSER_NODE_MODE_ENV] || "").trim().toLowerCase();
  if (BROWSER_NODE_MODES.has(_0xa422ff)) {
    return _0xa422ff;
  } else {
    return "lazy";
  }
}
function shouldKeepWebPreviewView(_0x1f0d19 = {}) {
  return _0x1f0d19?.visible === true || _0x1f0d19?.selected === true || _0x1f0d19?.fullscreen === true || _0x1f0d19?.pendingPopup === true;
}
function createDeferredWebPreviewRuntime({
  browserPath: _0x1a213d,
  mainProfileDir: _0xbe5989,
  env: _0x112845,
  logEvent: _0x2e4822,
  launchBrowserWorker: _0x19b846,
  createCdpClient: _0x39b339,
  createWebPreviewManager: _0x852830,
  mode: _0x375da1
} = {}) {
  let _0x7a79d9 = null;
  let _0x57bdd7 = null;
  let _0x4ac2af = null;
  let _0xc9717 = false;
  const _0x4d6ea6 = () => ({
    ok: true,
    count: 0,
    visibleCount: 0
  });
  const _0x1b020b = () => ({
    ok: false,
    error: "browser-node-disabled"
  });
  async function _0xb32430() {
    if (_0xc9717) {
      return null;
    }
    if (_0x57bdd7) {
      return _0x57bdd7;
    }
    if (_0x375da1 === "off") {
      return null;
    }
    if (_0x4ac2af) {
      return _0x4ac2af;
    }
    _0x4ac2af = Promise.resolve().then(() => {
      if (_0xc9717) {
        return null;
      }
      const _0x2ae9c5 = _0x19b846({
        browserPath: _0x1a213d,
        mainProfileDir: _0xbe5989,
        env: _0x112845,
        onError: _0x32947f => _0x2e4822?.({
          type: "chrome_web_preview.worker_error",
          level: "error",
          source: "main",
          message: "Chrome browser node worker failed",
          error: _0x32947f
        })
      });
      _0x7a79d9 = _0x2ae9c5;
      if (!_0x2ae9c5?.devToolsPipe) {
        _0x2e4822?.({
          type: "chrome_web_preview.pipe_unavailable",
          level: "error",
          source: "main",
          message: "Chrome browser node pipe is unavailable"
        });
        return null;
      }
      const _0x7ff7b0 = _0x39b339({
        ..._0x2ae9c5.devToolsPipe,
        logEvent: _0x2e4822
      });
      _0x57bdd7 = _0x852830({
        client: _0x7ff7b0,
        logEvent: _0x2e4822
      });
      return _0x57bdd7;
    }).finally(() => {
      _0x4ac2af = null;
    });
    return _0x4ac2af;
  }
  const _0x5eba93 = {
    async syncViews(_0x1d788a = {}) {
      const _0x9e79ae = Array.isArray(_0x1d788a?.views) ? _0x1d788a.views : [];
      const _0x734be1 = _0x9e79ae.filter(shouldKeepWebPreviewView);
      const _0x2c7d6a = {
        ..._0x1d788a,
        views: _0x734be1
      };
      if (_0x57bdd7) {
        return _0x57bdd7.syncViews(_0x2c7d6a);
      }
      if (_0x734be1.length === 0) {
        return _0x4d6ea6();
      }
      const _0x39a9d8 = await _0xb32430();
      if (!_0x39a9d8) {
        if (_0x375da1 === "off") {
          return _0x1b020b();
        } else {
          return {
            ok: false,
            error: "browser-node-unavailable"
          };
        }
      }
      return _0x39a9d8.syncViews(_0x2c7d6a);
    },
    async disposeViews(_0x4864ae = {}) {
      if (!_0x57bdd7) {
        return {
          ok: true,
          disposed: 0
        };
      }
      return _0x57bdd7.disposeViews(_0x4864ae);
    },
    async controlView(_0x318ab2 = {}) {
      const _0x581d4d = await _0xb32430();
      if (!_0x581d4d) {
        if (_0x375da1 === "off") {
          return _0x1b020b();
        } else {
          return {
            ok: false,
            error: "browser-node-unavailable"
          };
        }
      }
      return _0x581d4d.controlView(_0x318ab2);
    },
    consumeEvents() {
      return _0x57bdd7?.consumeEvents?.() || [];
    },
    waitForEvents(_0x3fc93d = {}) {
      if (_0x57bdd7) {
        return _0x57bdd7.waitForEvents?.(_0x3fc93d) || _0x57bdd7.consumeEvents?.() || [];
      }
      if (_0xc9717) {
        return Promise.resolve([]);
      }
      const _0x25a269 = Number(_0x3fc93d?.waitMs);
      const _0x2b3b5a = Number.isFinite(_0x25a269) ? Math.max(50, Math.min(2500, _0x25a269)) : 1000;
      return new Promise(_0x422253 => setTimeout(_0x422253, _0x2b3b5a, []));
    },
    async dispose() {
      if (_0xc9717) {
        return;
      }
      _0xc9717 = true;
      try {
        await _0x4ac2af;
      } catch {}
      await _0x57bdd7?.dispose?.();
      _0x57bdd7 = null;
      _0x7a79d9?.dispose?.();
      _0x7a79d9 = null;
    },
    _getEntry(_0x4c646f, _0x290cbc) {
      return _0x57bdd7?._getEntry?.(_0x4c646f, _0x290cbc) || null;
    }
  };
  return {
    facade: _0x5eba93,
    ensureRuntime: _0xb32430,
    getBrowserWorker: () => _0x7a79d9
  };
}
export async function startChromeShellRuntime({
  app: _0x2d4b81,
  appUrl: _0x3407d1,
  env = process.env,
  platform = process.platform,
  windowsTaskbarIdentity = null,
  displayWorkAreas = null,
  desktopHttpBridge = null,
  startHttpBridge: _0x449399,
  token: _0x393c01,
  handlers: _0x17cfd3,
  prepare = null,
  logEvent = null,
  onClosed = null,
  launchShell = launchChromeShellWithLifecycle,
  launchBrowserWorker = launchChromeBrowserWorker,
  createCdpClient = createChromeCdpPipeClient,
  createWebPreviewManager = createChromeShellWebPreviewManager,
  waitForRendererReady = null,
  controlShellWindow = controlChromeShellLaunchWindow
} = {}) {
  const _0x5812ed = launchShell === launchChromeShellWithLifecycle && windowsTaskbarIdentity ? prepareChromeShellTaskbarIdentity({
    app: _0x2d4b81,
    env: env,
    platform: platform,
    windowsTaskbarIdentity: windowsTaskbarIdentity,
    logEvent: logEvent
  }) : null;
  let _0x4a5837 = desktopHttpBridge;
  let _0x3c6b1f = false;
  if (!_0x4a5837) {
    if (typeof _0x449399 !== "function") {
      throw new TypeError("Chrome shell desktop bridge factory is required");
    }
    _0x4a5837 = await _0x449399({
      token: _0x393c01,
      handlers: _0x17cfd3,
      logEvent: logEvent
    });
    _0x3c6b1f = true;
    env.AIC_DESKTOP_BRIDGE_URL = _0x4a5837.url;
    env.AIC_DESKTOP_BRIDGE_TOKEN = _0x4a5837.token;
  }
  let _0x5a567f = null;
  let _0x1f67db = null;
  let _0x32919e = null;
  let _0x3a2abd = typeof waitForRendererReady !== "function";
  let _0xe2ccde = false;
  let _0x57e945 = null;
  const _0x2d5535 = _0x3a2abd ? null : new Promise((_0x1f3cf9, _0x1258e5) => {
    _0x57e945 = _0x1258e5;
  });
  _0x2d5535?.catch(() => {});
  try {
    const _0x35625f = await prepare?.();
    const _0x1f90f9 = typeof _0x35625f?.appUrl === "string" && _0x35625f.appUrl.trim() ? _0x35625f.appUrl : _0x3407d1;
    _0x32919e = await launchShell({
      app: _0x2d4b81,
      appUrl: _0x1f90f9,
      env: env,
      platform: platform,
      windowsTaskbarIdentity: windowsTaskbarIdentity,
      windowsTaskbarIdentityPreparation: _0x5812ed,
      displayWorkAreas: displayWorkAreas,
      logEvent: logEvent,
      onClosed: _0x603628 => {
        if (_0x603628?.detached === true) {
          _0xe2ccde = true;
          if (_0x32919e) {
            _0x32919e.detached = true;
          }
          return false;
        }
        _0x5a567f?.dispose?.();
        _0x5a567f = null;
        if (!_0x3a2abd) {
          const _0x1b1d2d = new Error("Chrome shell exited before the renderer completed startup");
          _0x1b1d2d.code = "CHROME_SHELL_EXITED_BEFORE_READY";
          _0x1b1d2d.details = _0x603628;
          logEvent?.({
            type: "chrome_shell.exited_before_renderer_ready",
            level: "error",
            source: "main",
            message: _0x1b1d2d.message,
            error: _0x1b1d2d,
            context: _0x603628
          });
          _0x57e945?.(_0x1b1d2d);
          return false;
        }
        return onClosed?.(_0x603628);
      },
      onLaunchError: _0x5bc98a => {
        const _0xb51879 = normalizeChromeShellSpawnError(_0x5bc98a);
        if (_0x32919e) {
          _0x32919e.spawnError = _0xb51879;
        }
        if (!_0x3a2abd) {
          _0x57e945?.(_0xb51879);
        }
        return false;
      }
    });
    if (_0xe2ccde) {
      _0x32919e.detached = true;
    }
    if (_0x32919e?.spawnError) {
      throw normalizeChromeShellSpawnError(_0x32919e.spawnError);
    }
    if (typeof waitForRendererReady === "function") {
      const _0x3f982b = await Promise.race([waitForRendererReady({
        launch: _0x32919e
      }), _0x2d5535]);
      _0x3a2abd = true;
      logEvent?.({
        type: "chrome_shell.renderer_ready",
        level: "info",
        source: "main",
        message: "Chrome shell renderer completed startup",
        context: {
          browserPath: _0x32919e.browserPath,
          profileDir: _0x32919e.profileDir,
          elapsedMs: Number(_0x3f982b?.elapsedMs || 0)
        }
      });
    }
    const _0x2228ad = resolveBrowserNodeMode(env);
    _0x1f67db = createDeferredWebPreviewRuntime({
      browserPath: _0x32919e.browserPath,
      mainProfileDir: _0x32919e.profileDir,
      env: env,
      logEvent: logEvent,
      launchBrowserWorker: launchBrowserWorker,
      createCdpClient: createCdpClient,
      createWebPreviewManager: createWebPreviewManager,
      mode: _0x2228ad
    });
    _0x5a567f = _0x1f67db.facade;
    if (_0x2228ad === "eager") {
      await _0x1f67db.ensureRuntime();
    }
    return {
      chromeShellLaunch: _0x32919e,
      browserWorker: _0x1f67db.getBrowserWorker(),
      desktopHttpBridge: _0x4a5837,
      webPreviewManager: _0x5a567f
    };
  } catch (_0x3222c8) {
    (await _0x5812ed)?.cancel?.();
    await _0x5a567f?.dispose?.();
    if (_0x32919e?.detached === true) {
      let _0xba2fa7 = false;
      try {
        _0xba2fa7 = await controlShellWindow({
          launch: _0x32919e,
          action: "close",
          env: env,
          platform: platform
        });
      } catch {}
      logEvent?.({
        type: "chrome_shell.detached_window_close_after_startup_failure",
        level: _0xba2fa7 ? "info" : "warn",
        source: "main",
        message: _0xba2fa7 ? "Detached Chrome shell window closed after startup failure" : "Detached Chrome shell window could not be closed after startup failure",
        context: {
          closed: _0xba2fa7
        }
      });
    } else {
      _0x32919e?.process?.kill?.();
    }
    if (_0x3c6b1f) {
      try {
        await _0x4a5837?.close?.();
      } catch {}
    }
    throw _0x3222c8;
  }
}
export const __chromeShellRuntimeForTest = {
  BROWSER_NODE_MODE_ENV: BROWSER_NODE_MODE_ENV,
  resolveBrowserNodeMode: resolveBrowserNodeMode,
  shouldKeepWebPreviewView: shouldKeepWebPreviewView
};