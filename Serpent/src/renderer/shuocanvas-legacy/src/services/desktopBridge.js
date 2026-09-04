import { post } from "../../api/apiBase.js";
import { CHROME_SHELL_STARTUP_READY_EVENT } from "./chromeShellStartupReadiness.js";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const LONG_DESKTOP_REQUEST_TIMEOUT_MS = 1800000;
const CHROME_SHELL_STARTUP_READY_REQUEST_TIMEOUT_MS = 1500;
const CHROME_SHELL_STARTUP_READY_PATH = "/api/v2/desktop/diagnostics/log-event";
const LONG_DESKTOP_REQUEST_PATHS = new Set(["/api/v2/desktop/project/export-package", "/api/v2/desktop/project/import-package", "/api/v2/desktop/node-export/save-media", "/api/v2/desktop/node-export/save-media-files", "/api/v2/desktop/asset/import"]);
function getWindowObject() {
  return globalThis.window || null;
}
function getElectronApi() {
  const _0x35ebe0 = getWindowObject()?.electronAPI || null;
  if (_0x35ebe0?.__aicDesktopHttpShim === true) {
    return null;
  } else {
    return _0x35ebe0;
  }
}
function getDesktopApi() {
  const _0x2c1f33 = getWindowObject()?.aiCanvasDesktop || null;
  if (_0x2c1f33?.__aicDesktopHttpShim === true) {
    return null;
  } else {
    return _0x2c1f33;
  }
}
function isFunction(_0x632e9f) {
  return typeof _0x632e9f === "function";
}
function isLoopbackAppOrigin() {
  try {
    const _0x400d0 = globalThis.location;
    if (!_0x400d0 || !/^https?:$/i.test(String(_0x400d0.protocol || ""))) {
      return false;
    }
    return LOOPBACK_HOSTS.has(String(_0x400d0.hostname || "").toLowerCase());
  } catch {
    return false;
  }
}
function hasChromeShellRuntimeHint() {
  const _0x400ec1 = getWindowObject();
  if (_0x400ec1?.__AIC_CHROME_SHELL__ || _0x400ec1?.__AIC_DESKTOP_HTTP_BRIDGE__) {
    return true;
  }
  try {
    const _0x8e380b = new URLSearchParams(globalThis.location?.search || "");
    return String(_0x8e380b.get("aicRuntime") || "").toLowerCase() === "chrome-shell";
  } catch {
    return false;
  }
}
function normalizeHttpBridgeResult(_0x57a9dd) {
  if (!_0x57a9dd?.success) {
    throw new Error(_0x57a9dd?.error || "Desktop bridge request failed");
  }
  const _0x5f3cb6 = _0x57a9dd.data;
  if (!_0x5f3cb6 || typeof _0x5f3cb6 !== "object" || !Object.prototype.hasOwnProperty.call(_0x5f3cb6, "success")) {
    return _0x5f3cb6;
  }
  if (_0x5f3cb6.success === false && _0x5f3cb6.canceled === true) {
    return _0x5f3cb6;
  }
  if (_0x5f3cb6.success === false) {
    throw new Error(_0x5f3cb6.error || _0x5f3cb6.message || "Desktop bridge request failed");
  }
  if (Object.prototype.hasOwnProperty.call(_0x5f3cb6, "data")) {
    return _0x5f3cb6.data;
  }
  return _0x5f3cb6;
}
function resolveDesktopBridgeRequestTimeout(_0x5228d3, _0x2c691b = {}) {
  if (String(_0x5228d3 || "") === CHROME_SHELL_STARTUP_READY_PATH && _0x2c691b?.type === CHROME_SHELL_STARTUP_READY_EVENT) {
    return CHROME_SHELL_STARTUP_READY_REQUEST_TIMEOUT_MS;
  }
  if (LONG_DESKTOP_REQUEST_PATHS.has(String(_0x5228d3 || ""))) {
    return LONG_DESKTOP_REQUEST_TIMEOUT_MS;
  } else {
    return undefined;
  }
}
async function postDesktopBridge(_0x1e4902, _0x2db7a7 = {}) {
  return normalizeHttpBridgeResult(await post(_0x1e4902, _0x2db7a7, resolveDesktopBridgeRequestTimeout(_0x1e4902, _0x2db7a7)));
}
async function normalizeDesktopHttpPayload(_0x514aef) {
  if (_0x514aef instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(_0x514aef));
  }
  if (ArrayBuffer.isView(_0x514aef)) {
    return Array.from(new Uint8Array(_0x514aef.buffer, _0x514aef.byteOffset, _0x514aef.byteLength));
  }
  if (typeof Blob !== "undefined" && _0x514aef instanceof Blob) {
    return Array.from(new Uint8Array(await _0x514aef.arrayBuffer()));
  }
  if (Array.isArray(_0x514aef)) {
    return Promise.all(_0x514aef.map(_0x3b4d99 => normalizeDesktopHttpPayload(_0x3b4d99)));
  }
  if (!_0x514aef || typeof _0x514aef !== "object") {
    return _0x514aef;
  }
  const _0x111d7a = await Promise.all(Object.entries(_0x514aef).map(async ([_0xdcfcf8, _0x32c9eb]) => [_0xdcfcf8, await normalizeDesktopHttpPayload(_0x32c9eb)]));
  return Object.fromEntries(_0x111d7a);
}
function chromeShellPost(_0x45bae5, _0x51b359 = {}) {
  if (!desktopBridge.isChromeShell) {
    return undefined;
  }
  return normalizeDesktopHttpPayload(_0x51b359).then(_0x1fafc7 => postDesktopBridge(_0x45bae5, _0x1fafc7));
}
async function writeChromeShellRecoverySnapshotBeforeInstall() {
  if (!desktopBridge.isChromeShell) {
    return null;
  }
  const _0x48fd82 = getWindowObject()?.__aiCanvasWriteRecoverySnapshotForClose;
  if (typeof _0x48fd82 !== "function") {
    return null;
  }
  return _0x48fd82("update-install");
}
function createLatestOnlyChromeShellPoster(_0x4c4121) {
  let _0x387853 = null;
  let _0x361ac5 = null;
  const _0x4161c9 = async () => {
    try {
      while (_0x387853) {
        const _0x3db27a = _0x387853;
        _0x387853 = null;
        await chromeShellPost(_0x4c4121, _0x3db27a);
      }
      return {
        ok: true
      };
    } finally {
      _0x361ac5 = null;
    }
  };
  return (_0x4e84c3 = {}) => {
    _0x387853 = _0x4e84c3;
    if (!_0x361ac5) {
      _0x361ac5 = _0x4161c9();
    }
    return _0x361ac5;
  };
}
let chromeShellUnsavedStatePoster = null;
function postChromeShellUnsavedState(_0x17e16e) {
  if (!desktopBridge.isChromeShell) {
    return undefined;
  }
  if (!chromeShellUnsavedStatePoster) {
    chromeShellUnsavedStatePoster = createLatestOnlyChromeShellPoster("/api/v2/desktop/project/set-unsaved-state");
  }
  return chromeShellUnsavedStatePoster(_0x17e16e);
}
function subscribeByPolling(_0x1c4f57, _0x4c0299, {
  intervalMs = 1000,
  extractItems = _0x47e29f => _0x47e29f,
  getKey = _0x2d2bf4 => JSON.stringify(_0x2d2bf4)
} = {}) {
  if (!desktopBridge.isChromeShell || typeof _0x4c0299 !== "function") {
    return () => {};
  }
  let _0x11014f = false;
  const _0xcae9dc = new Map();
  const _0x2c6c1a = async () => {
    if (_0x11014f) {
      return;
    }
    try {
      const _0x3103f0 = await _0x1c4f57();
      const _0x57fc4b = extractItems(_0x3103f0);
      if (Array.isArray(_0x57fc4b)) {
        _0x57fc4b.forEach(_0x53c79e => {
          const _0x5881c8 = getKey(_0x53c79e);
          const _0x2869cc = JSON.stringify(_0x53c79e || {});
          if (_0xcae9dc.get(_0x5881c8) === _0x2869cc) {
            return;
          }
          _0xcae9dc.set(_0x5881c8, _0x2869cc);
          _0x4c0299(_0x53c79e);
        });
      } else if (_0x57fc4b && typeof _0x57fc4b === "object") {
        const _0x2a4e99 = getKey(_0x57fc4b);
        const _0x2c15fd = JSON.stringify(_0x57fc4b || {});
        if (_0xcae9dc.get(_0x2a4e99) !== _0x2c15fd) {
          _0xcae9dc.set(_0x2a4e99, _0x2c15fd);
          _0x4c0299(_0x57fc4b);
        }
      }
    } catch {}
    if (!_0x11014f) {
      setTimeout(_0x2c6c1a, intervalMs);
    }
  };
  setTimeout(_0x2c6c1a, 0);
  return () => {
    _0x11014f = true;
  };
}
function subscribeToConsumedBatch(_0xd82cb2, _0x17a09f, {
  intervalMs = 500
} = {}) {
  if (!desktopBridge.isChromeShell || typeof _0x17a09f !== "function") {
    return () => {};
  }
  let _0x1c0d02 = false;
  const _0x37881d = async () => {
    if (_0x1c0d02) {
      return;
    }
    try {
      const _0x3fac6a = await _0xd82cb2();
      if (Array.isArray(_0x3fac6a) && _0x3fac6a.length > 0) {
        _0x17a09f(_0x3fac6a);
      }
    } catch {}
    if (!_0x1c0d02) {
      setTimeout(_0x37881d, intervalMs);
    }
  };
  setTimeout(_0x37881d, 0);
  return () => {
    _0x1c0d02 = true;
  };
}
function updaterEventFromStateSnapshot(_0x713336 = {}) {
  if (!_0x713336 || typeof _0x713336 !== "object") {
    return null;
  }
  if (typeof _0x713336.type === "string" && _0x713336.type) {
    return _0x713336;
  }
  if (_0x713336.latestEvent && typeof _0x713336.latestEvent.type === "string") {
    return _0x713336.latestEvent;
  }
  const _0x1b1a1e = String(_0x713336.state || "");
  if (!_0x1b1a1e || _0x1b1a1e === "idle") {
    return null;
  }
  const _0x3b9499 = {
    checking: "checking",
    available: "available",
    downloading: "download-started",
    downloaded: "downloaded",
    error: "download-failed",
    installing: "installing"
  };
  const _0x5d9b8d = _0x3b9499[_0x1b1a1e];
  if (!_0x5d9b8d) {
    return null;
  }
  return {
    type: _0x5d9b8d,
    state: _0x1b1a1e,
    info: _0x713336.latestInfo || null,
    retryCount: Number(_0x713336.retryCount || 0),
    maxRetries: Number(_0x713336.maxRetries || 0)
  };
}
function subscribeToUpdaterState(_0x4cadc3, _0x5c4d20, _0x10771f = subscribeByPolling) {
  if (typeof _0x5c4d20 !== "function") {
    return () => {};
  }
  return _0x10771f(_0x4cadc3, _0x22ed6a => {
    const _0x24fdfa = updaterEventFromStateSnapshot(_0x22ed6a);
    if (_0x24fdfa) {
      _0x5c4d20(_0x24fdfa);
    }
  }, {
    intervalMs: 3000,
    getKey: () => "updater-state"
  });
}
function subscribeByLongPolling(_0x822e73, _0x39b7f4) {
  if (!desktopBridge.isChromeShell || typeof _0x39b7f4 !== "function") {
    return () => {};
  }
  let _0x2aecd3 = false;
  const _0xb2c1f9 = _0x272b97 => new Promise(_0x3dfcd0 => setTimeout(_0x3dfcd0, _0x272b97));
  const _0x14063a = async () => {
    while (!_0x2aecd3) {
      let _0x5883f2 = 0;
      try {
        const _0x38ddb0 = await _0x822e73();
        if (_0x2aecd3) {
          break;
        }
        const _0x563b23 = Array.isArray(_0x38ddb0) ? _0x38ddb0 : [];
        _0x5883f2 = _0x563b23.length;
        _0x563b23.forEach(_0x3f0e05 => _0x39b7f4(_0x3f0e05));
      } catch {
        if (!_0x2aecd3) {
          await _0xb2c1f9(250);
        }
        continue;
      }
      if (!_0x2aecd3 && _0x5883f2 === 0) {
        await _0xb2c1f9(24);
      }
    }
  };
  _0x14063a();
  return () => {
    _0x2aecd3 = true;
  };
}
function getGroup(_0x45556, _0xadad3f) {
  const _0x31a760 = _0x45556?.[_0xadad3f];
  if (_0x31a760 && typeof _0x31a760 === "object") {
    return _0x31a760;
  } else {
    return null;
  }
}
function unavailable(_0x13ae24) {
  return () => {
    throw new Error(_0x13ae24 + " unavailable");
  };
}
const syncChromeShellWebPreviewViews = createLatestOnlyChromeShellPoster("/api/v2/desktop/web-preview/sync-views");
export const desktopBridge = {
  get usesHttpCompat() {
    const _0x160220 = getWindowObject();
    return _0x160220?.electronAPI?.__aicDesktopHttpShim === true || _0x160220?.aiCanvasDesktop?.__aicDesktopHttpShim === true || desktopBridge.isChromeShell;
  },
  get isElectron() {
    return !!getDesktopApi()?.isElectron || !!getElectronApi();
  },
  get isChromeShell() {
    return !getElectronApi() && isLoopbackAppOrigin() && hasChromeShellRuntimeHint();
  },
  app: {
    isAvailable() {
      return !!getDesktopApi() || desktopBridge.isChromeShell;
    },
    getAppVersion: (..._0x18e75e) => getDesktopApi()?.getAppVersion?.(..._0x18e75e) ?? chromeShellPost("/api/v2/desktop/app/get-version", _0x18e75e[0]) ?? Promise.resolve(""),
    getDeviceId: (..._0x867d8d) => getDesktopApi()?.getDeviceId?.(..._0x867d8d) ?? chromeShellPost("/api/v2/desktop/app/get-device-id", _0x867d8d[0]) ?? Promise.resolve(""),
    checkForUpdates: (..._0x44ade9) => getDesktopApi()?.checkForUpdates?.(..._0x44ade9) ?? chromeShellPost("/api/v2/desktop/app/check-for-updates", _0x44ade9[0]) ?? Promise.resolve(null),
    getUpdateState: (..._0x148f93) => getDesktopApi()?.getUpdateState?.(..._0x148f93) ?? chromeShellPost("/api/v2/desktop/app/update-state", _0x148f93[0]) ?? Promise.resolve(null),
    downloadUpdate: (..._0x59ece5) => getDesktopApi()?.downloadUpdate?.(..._0x59ece5) ?? chromeShellPost("/api/v2/desktop/app/download-update", _0x59ece5[0]) ?? Promise.resolve(null),
    cancelUpdateDownload: (..._0x3b004e) => getDesktopApi()?.cancelUpdateDownload?.(..._0x3b004e) ?? chromeShellPost("/api/v2/desktop/app/cancel-update-download", _0x3b004e[0]) ?? Promise.resolve(null),
    installDownloadedUpdate: async (..._0x200f77) => {
      await writeChromeShellRecoverySnapshotBeforeInstall();
      return getDesktopApi()?.installDownloadedUpdate?.(..._0x200f77) ?? chromeShellPost("/api/v2/desktop/app/install-downloaded-update", _0x200f77[0]) ?? null;
    },
    onUpdaterEvent: _0x4ab939 => getDesktopApi()?.onUpdaterEvent?.(_0x4ab939) || subscribeToUpdaterState(() => desktopBridge.app.getUpdateState(), _0x4ab939)
  },
  project: {
    get api() {
      return getGroup(getElectronApi(), "project");
    },
    isAvailable() {
      return !!desktopBridge.project.api || desktopBridge.isChromeShell;
    },
    open: (..._0x253409) => desktopBridge.project.api?.open?.(..._0x253409) ?? chromeShellPost("/api/v2/desktop/project/open", _0x253409[0]),
    save: (..._0x57a993) => desktopBridge.project.api?.save?.(..._0x57a993) ?? chromeShellPost("/api/v2/desktop/project/save", _0x57a993[0]),
    exportPackage: (..._0x468799) => desktopBridge.project.api?.exportPackage?.(..._0x468799) ?? chromeShellPost("/api/v2/desktop/project/export-package", _0x468799[0]),
    importPackage: (..._0x10d0b9) => desktopBridge.project.api?.importPackage?.(..._0x10d0b9) ?? chromeShellPost("/api/v2/desktop/project/import-package", _0x10d0b9[0]),
    listRecent: (..._0x5031d2) => desktopBridge.project.api?.listRecent?.(..._0x5031d2) ?? chromeShellPost("/api/v2/desktop/project/list-recent", _0x5031d2[0]),
    removeRecent: (..._0x4bc87c) => desktopBridge.project.api?.removeRecent?.(..._0x4bc87c) ?? chromeShellPost("/api/v2/desktop/project/remove-recent", _0x4bc87c[0]),
    clearRecoverySnapshot: (..._0x59a042) => desktopBridge.project.api?.clearRecoverySnapshot?.(..._0x59a042) ?? chromeShellPost("/api/v2/desktop/project/clear-recovery-snapshot", _0x59a042[0]),
    writeRecoverySnapshot: (..._0xa5d0e1) => desktopBridge.project.api?.writeRecoverySnapshot?.(..._0xa5d0e1) ?? chromeShellPost("/api/v2/desktop/project/write-recovery-snapshot", _0xa5d0e1[0]),
    getRecoverySnapshotInfo: (..._0x1a0a26) => desktopBridge.project.api?.getRecoverySnapshotInfo?.(..._0x1a0a26) ?? chromeShellPost("/api/v2/desktop/project/get-recovery-snapshot-info", _0x1a0a26[0]),
    readRecoverySnapshot: (..._0x40a068) => desktopBridge.project.api?.readRecoverySnapshot?.(..._0x40a068) ?? chromeShellPost("/api/v2/desktop/project/read-recovery-snapshot", _0x40a068[0]),
    setUnsavedState: (..._0x2a783e) => desktopBridge.project.api?.setUnsavedState?.(..._0x2a783e) ?? postChromeShellUnsavedState(_0x2a783e[0]),
    consumeExternalOpenRequests: (..._0x15a345) => desktopBridge.project.api?.consumeExternalOpenRequests?.(..._0x15a345) ?? chromeShellPost("/api/v2/desktop/project/consume-external-open-requests", _0x15a345[0]),
    onExternalOpen: _0x16f740 => desktopBridge.project.api?.onExternalOpen?.(_0x16f740) || subscribeToConsumedBatch(() => chromeShellPost("/api/v2/desktop/project/consume-external-open-requests", {}), _0x16f740, {
      intervalMs: 500
    }),
    onPackageProgress: _0x371bf8 => desktopBridge.project.api?.onPackageProgress?.(_0x371bf8) || subscribeByPolling(() => chromeShellPost("/api/v2/desktop/project/consume-package-progress-events", {}), _0x371bf8, {
      intervalMs: 250,
      extractItems: _0x27d9fe => Array.isArray(_0x27d9fe) ? _0x27d9fe : [],
      getKey: _0x143225 => String(_0x143225?.createdAt || _0x143225?.operationId || JSON.stringify(_0x143225 || {}))
    })
  },
  shell: {
    isAvailable() {
      const _0x339a0a = getElectronApi();
      return isFunction(_0x339a0a?.shell?.openExternal) || isFunction(_0x339a0a?.openExternal) || desktopBridge.isChromeShell;
    },
    canShowItemInFolder() {
      return isFunction(getElectronApi()?.showItemInFolder) || desktopBridge.isChromeShell;
    },
    canOpenKnownFolder() {
      return isFunction(getElectronApi()?.openKnownFolder) || desktopBridge.isChromeShell;
    },
    showItemInFolder: _0x5bce57 => getElectronApi()?.showItemInFolder?.(_0x5bce57) ?? chromeShellPost("/api/v2/desktop/shell/show-item-in-folder", _0x5bce57) ?? unavailable("showItemInFolder")(),
    openKnownFolder: _0x7642ec => getElectronApi()?.openKnownFolder?.(_0x7642ec) ?? chromeShellPost("/api/v2/desktop/shell/open-known-folder", _0x7642ec) ?? unavailable("openKnownFolder")(),
    openExternal(_0x2ecaf6) {
      const _0x2ade22 = getElectronApi()?.shell?.openExternal || getElectronApi()?.openExternal;
      if (isFunction(_0x2ade22)) {
        return _0x2ade22(_0x2ecaf6);
      }
      const _0x379f29 = chromeShellPost("/api/v2/desktop/shell/open-external", {
        url: _0x2ecaf6
      });
      if (_0x379f29) {
        return _0x379f29;
      }
      if (typeof globalThis.open === "function") {
        globalThis.open(String(_0x2ecaf6 || ""), "_blank", "noopener,noreferrer");
        return Promise.resolve({
          ok: true,
          fallback: "browser"
        });
      }
      return Promise.resolve({
        ok: false,
        error: "openExternal unavailable"
      });
    }
  },
  mediaPreview: {
    isAvailable() {
      return isFunction(getElectronApi()?.getLocalPreviewUrl) || desktopBridge.isChromeShell;
    },
    async getLocalPreviewUrl(_0x26beb5 = {}) {
      const _0x4411d2 = getElectronApi()?.getLocalPreviewUrl;
      if (isFunction(_0x4411d2)) {
        return _0x4411d2(_0x26beb5);
      }
      if (!desktopBridge.isChromeShell) {
        throw new Error("Local preview bridge unavailable");
      }
      return postDesktopBridge("/api/v2/desktop/local-preview", _0x26beb5);
    }
  },
  assetImport: {
    isAvailable() {
      return !!getElectronApi() || desktopBridge.isChromeShell;
    },
    canImportAsset() {
      return isFunction(getElectronApi()?.importAsset) || desktopBridge.isChromeShell;
    },
    canImportRemoteAsset() {
      return isFunction(getElectronApi()?.importRemoteAsset) || desktopBridge.isChromeShell;
    },
    canImportLocalFile() {
      return isFunction(getElectronApi()?.importLocalFile) || desktopBridge.isChromeShell;
    },
    canResolveFilePath() {
      return !!getElectronApi() || desktopBridge.isChromeShell;
    },
    canSubscribeUpdates() {
      return isFunction(getElectronApi()?.onAssetUpdated) || desktopBridge.isChromeShell;
    },
    importAsset: (..._0x58c2f7) => getElectronApi()?.importAsset?.(..._0x58c2f7) ?? chromeShellPost("/api/v2/desktop/asset/import", _0x58c2f7[0]),
    importRemoteAsset: (..._0x4c5b58) => getElectronApi()?.importRemoteAsset?.(..._0x4c5b58) ?? chromeShellPost("/api/v2/desktop/asset/import-remote", _0x4c5b58[0]),
    importLocalFile: (..._0x2b729a) => getElectronApi()?.importLocalFile?.(..._0x2b729a) ?? chromeShellPost("/api/v2/desktop/file/import-local", _0x2b729a[0]),
    getPathForFile: (..._0x59f298) => getElectronApi()?.getPathForFile?.(..._0x59f298) || "",
    onAssetUpdated: _0x494827 => getElectronApi()?.onAssetUpdated?.(_0x494827) || subscribeByPolling(() => chromeShellPost("/api/v2/desktop/asset/consume-updates", {}), _0x494827, {
      intervalMs: 500,
      extractItems: _0x38a49c => Array.isArray(_0x38a49c) ? _0x38a49c : [],
      getKey: _0x535c29 => String(_0x535c29?.assetId || JSON.stringify(_0x535c29 || {}))
    })
  },
  dialog: {
    isAvailable() {
      return isFunction(getElectronApi()?.selectDirectory) || desktopBridge.isChromeShell;
    },
    selectDirectory: (..._0x59a432) => getElectronApi()?.selectDirectory?.(..._0x59a432) ?? chromeShellPost("/api/v2/desktop/dialog/select-directory", _0x59a432[0])
  },
  webPreview: {
    get api() {
      return getGroup(getElectronApi(), "webPreview");
    },
    get surfaceMode() {
      return desktopBridge.webPreview.api?.surfaceMode || (desktopBridge.isChromeShell ? "remote-snapshot" : "");
    },
    isAvailable() {
      return isFunction(desktopBridge.webPreview.api?.syncViews) || desktopBridge.isChromeShell;
    },
    syncViews: (..._0x296d43) => desktopBridge.webPreview.api?.syncViews?.(..._0x296d43) ?? chromeShellPost("/api/v2/desktop/web-preview/sync-views", _0x296d43[0]),
    syncViewsFast: (..._0x5a88bd) => desktopBridge.webPreview.api?.syncViewsFast?.(..._0x5a88bd) ?? desktopBridge.webPreview.api?.syncViews?.(..._0x5a88bd) ?? syncChromeShellWebPreviewViews(_0x5a88bd[0]),
    disposeViews: (..._0xa1af5f) => desktopBridge.webPreview.api?.disposeViews?.(..._0xa1af5f) ?? chromeShellPost("/api/v2/desktop/web-preview/dispose-views", _0xa1af5f[0]),
    controlView: (..._0x42959a) => desktopBridge.webPreview.api?.controlView?.(..._0x42959a) ?? chromeShellPost("/api/v2/desktop/web-preview/control-view", _0x42959a[0]),
    onEvent: _0x1b6419 => desktopBridge.webPreview.api?.onEvent?.(_0x1b6419) || subscribeByLongPolling(() => chromeShellPost("/api/v2/desktop/web-preview/wait-events", {
      waitMs: 1000
    }), _0x1b6419)
  },
  customAiApps: {
    get api() {
      return getGroup(getElectronApi(), "customAiApps");
    },
    isAvailable() {
      return !!desktopBridge.customAiApps.api || desktopBridge.isChromeShell;
    },
    read: (..._0x4dfc2a) => desktopBridge.customAiApps.api?.read?.(..._0x4dfc2a) ?? chromeShellPost("/api/v2/desktop/custom-ai-apps/read", _0x4dfc2a[0]),
    write: (..._0xbb65bd) => desktopBridge.customAiApps.api?.write?.(..._0xbb65bd) ?? chromeShellPost("/api/v2/desktop/custom-ai-apps/write", _0xbb65bd[0])
  },
  storageMigration: {
    isAvailable() {
      return desktopBridge.isChromeShell;
    },
    read: () => chromeShellPost("/api/v2/desktop/storage-migration/read", {}),
    complete: _0xeed2f6 => chromeShellPost("/api/v2/desktop/storage-migration/complete", _0xeed2f6)
  },
  secureSettings: {
    get api() {
      return getGroup(getElectronApi(), "secureSettings");
    },
    get: (..._0x57ec3d) => desktopBridge.secureSettings.api?.get?.(..._0x57ec3d) ?? chromeShellPost("/api/v2/desktop/secure-settings/get", _0x57ec3d[0]),
    set: (..._0x5555e5) => desktopBridge.secureSettings.api?.set?.(..._0x5555e5) ?? chromeShellPost("/api/v2/desktop/secure-settings/set", _0x5555e5[0]),
    delete: (..._0x5237a1) => desktopBridge.secureSettings.api?.delete?.(..._0x5237a1) ?? chromeShellPost("/api/v2/desktop/secure-settings/delete", _0x5237a1[0])
  },
  mediaTask: {
    get api() {
      return getGroup(getElectronApi(), "mediaTask");
    },
    isAvailable() {
      return !!desktopBridge.mediaTask.api || desktopBridge.isChromeShell;
    },
    enqueue: (..._0x4f1aad) => desktopBridge.mediaTask.api?.enqueue?.(..._0x4f1aad) ?? chromeShellPost("/api/v2/desktop/media-task/enqueue", _0x4f1aad[0]),
    cancel: (..._0x469e4b) => desktopBridge.mediaTask.api?.cancel?.(..._0x469e4b) ?? chromeShellPost("/api/v2/desktop/media-task/cancel", _0x469e4b[0]),
    list: (..._0x173261) => desktopBridge.mediaTask.api?.list?.(..._0x173261) ?? chromeShellPost("/api/v2/desktop/media-task/list", _0x173261[0]),
    onUpdate: _0x6f0ad2 => desktopBridge.mediaTask.api?.onUpdate?.(_0x6f0ad2) || subscribeByPolling(() => desktopBridge.mediaTask.list({
      limit: 120
    }), _0x6f0ad2, {
      intervalMs: 1000,
      extractItems: _0x592220 => Array.isArray(_0x592220?.tasks) ? _0x592220.tasks : Array.isArray(_0x592220) ? _0x592220 : [],
      getKey: _0x4a2c93 => String(_0x4a2c93?.taskId || JSON.stringify(_0x4a2c93 || {}))
    })
  },
  diagnostics: {
    get api() {
      return getGroup(getElectronApi(), "diagnostics");
    },
    isAvailable() {
      return !!desktopBridge.diagnostics.api || desktopBridge.isChromeShell;
    },
    logEvent: (..._0x44a4ca) => desktopBridge.diagnostics.api?.logEvent?.(..._0x44a4ca) ?? chromeShellPost("/api/v2/desktop/diagnostics/log-event", _0x44a4ca[0]),
    createPackage: (..._0x59010c) => desktopBridge.diagnostics.api?.createPackage?.(..._0x59010c) ?? chromeShellPost("/api/v2/desktop/diagnostics/create-package", _0x59010c[0]),
    openLogsFolder: (..._0x50d48b) => desktopBridge.diagnostics.api?.openLogsFolder?.(..._0x50d48b) ?? chromeShellPost("/api/v2/desktop/diagnostics/open-logs-folder", _0x50d48b[0])
  },
  nodeExport: {
    get api() {
      return getGroup(getElectronApi(), "nodeExport");
    },
    isAvailable() {
      return isFunction(desktopBridge.nodeExport.api?.exportSelected) || isFunction(desktopBridge.nodeExport.api?.saveMedia) || isFunction(desktopBridge.nodeExport.api?.saveText) || isFunction(desktopBridge.nodeExport.api?.saveMediaFiles) || desktopBridge.isChromeShell;
    },
    canSaveMedia() {
      return isFunction(desktopBridge.nodeExport.api?.saveMedia) || desktopBridge.isChromeShell;
    },
    canSaveText() {
      return isFunction(desktopBridge.nodeExport.api?.saveText) || desktopBridge.isChromeShell;
    },
    canSaveMediaFiles() {
      return isFunction(desktopBridge.nodeExport.api?.saveMediaFiles) || desktopBridge.isChromeShell;
    },
    exportSelected: (..._0x2c0632) => desktopBridge.nodeExport.api?.exportSelected?.(..._0x2c0632) ?? chromeShellPost("/api/v2/desktop/node-export/export-selected", _0x2c0632[0]) ?? unavailable("nodeExport.exportSelected")(),
    saveMedia: (..._0x41f9b7) => desktopBridge.nodeExport.api?.saveMedia?.(..._0x41f9b7) ?? chromeShellPost("/api/v2/desktop/node-export/save-media", _0x41f9b7[0]) ?? unavailable("nodeExport.saveMedia")(),
    saveText: (..._0x522c8a) => desktopBridge.nodeExport.api?.saveText?.(..._0x522c8a) ?? chromeShellPost("/api/v2/desktop/node-export/save-text", _0x522c8a[0]) ?? unavailable("nodeExport.saveText")(),
    saveMediaFiles: (..._0x143464) => desktopBridge.nodeExport.api?.saveMediaFiles?.(..._0x143464) ?? chromeShellPost("/api/v2/desktop/node-export/save-media-files", _0x143464[0]) ?? unavailable("nodeExport.saveMediaFiles")()
  },
  notification: {
    get api() {
      return getGroup(getElectronApi(), "notification");
    },
    isAvailable() {
      return isFunction(desktopBridge.notification.api?.showGenerationComplete) || desktopBridge.isChromeShell;
    },
    showGenerationComplete: (..._0x2c40ab) => desktopBridge.notification.api?.showGenerationComplete?.(..._0x2c40ab) ?? chromeShellPost("/api/v2/desktop/notification/show-generation-complete", _0x2c40ab[0]) ?? Promise.resolve({
      success: true,
      shown: false,
      reason: "unavailable"
    }),
    onGenerationCompleteClick: _0x12895e => desktopBridge.notification.api?.onGenerationCompleteClick?.(_0x12895e) || subscribeByPolling(() => chromeShellPost("/api/v2/desktop/notification/consume-generation-complete-clicks", {}), _0x12895e, {
      intervalMs: 400,
      extractItems: _0x34f5a2 => Array.isArray(_0x34f5a2) ? _0x34f5a2 : [],
      getKey: _0x4c6bb7 => String(_0x4c6bb7?.eventId || _0x4c6bb7?.createdAt || JSON.stringify(_0x4c6bb7 || {}))
    })
  },
  screenshot: {
    get api() {
      return getGroup(getElectronApi(), "screenshot");
    },
    isAvailable() {
      return !!desktopBridge.screenshot.api || desktopBridge.isChromeShell;
    },
    captureDisplay: (..._0x26f145) => desktopBridge.screenshot.api?.captureDisplay?.(..._0x26f145) ?? chromeShellPost("/api/v2/desktop/screenshot/capture-display", _0x26f145[0]),
    updateGlobalShortcut: (..._0x26286a) => desktopBridge.screenshot.api?.updateGlobalShortcut?.(..._0x26286a) ?? chromeShellPost("/api/v2/desktop/screenshot/update-global-shortcut", _0x26286a[0]),
    onGlobalCapture: _0x29ddd1 => desktopBridge.screenshot.api?.onGlobalCapture?.(_0x29ddd1) || subscribeByPolling(() => chromeShellPost("/api/v2/desktop/screenshot/consume-global-capture-events", {}), _0x29ddd1, {
      intervalMs: 150,
      extractItems: _0x847b43 => Array.isArray(_0x847b43) ? _0x847b43 : [],
      getKey: _0x49dc0c => String(_0x49dc0c?.createdAt || _0x49dc0c?.source || JSON.stringify(_0x49dc0c || {}))
    }),
    onGlobalShortcutStatus: _0x59055f => desktopBridge.screenshot.api?.onGlobalShortcutStatus?.(_0x59055f) || subscribeByPolling(() => chromeShellPost("/api/v2/desktop/screenshot/get-global-shortcut-status", {}), _0x59055f, {
      intervalMs: 1000,
      getKey: () => "global-shortcut-status"
    })
  },
  notificationSound: {
    get api() {
      return getGroup(getElectronApi() || getWindowObject()?.electronAPI, "notificationSound");
    },
    isAvailable() {
      return !!desktopBridge.notificationSound.api || desktopBridge.isChromeShell;
    },
    listMp3Files: (..._0xbe8dab) => desktopBridge.notificationSound.api?.listMp3Files?.(..._0xbe8dab) ?? chromeShellPost("/api/v2/desktop/notification-sound/list-mp3-files", _0xbe8dab[0]),
    listSystemSounds: (..._0x11abf9) => desktopBridge.notificationSound.api?.listSystemSounds?.(..._0x11abf9) ?? chromeShellPost("/api/v2/desktop/notification-sound/list-system-sounds", _0x11abf9[0]),
    openSystemSoundFolder: (..._0x145c73) => desktopBridge.notificationSound.api?.openSystemSoundFolder?.(..._0x145c73) ?? chromeShellPost("/api/v2/desktop/notification-sound/open-system-sound-folder", _0x145c73[0]),
    play: (..._0x47f196) => desktopBridge.notificationSound.api?.play?.(..._0x47f196) ?? chromeShellPost("/api/v2/desktop/notification-sound/play", _0x47f196[0])
  },
  localAssetCleanup: {
    get api() {
      return getGroup(getElectronApi(), "localAssetCleanup");
    },
    isAvailable() {
      return !!desktopBridge.localAssetCleanup.api || desktopBridge.isChromeShell;
    },
    scan: (..._0x1afe9f) => desktopBridge.localAssetCleanup.api?.scan?.(..._0x1afe9f) ?? chromeShellPost("/api/v2/desktop/local-asset-cleanup/scan", _0x1afe9f[0]),
    trash: (..._0x1d1af9) => desktopBridge.localAssetCleanup.api?.trash?.(..._0x1d1af9) ?? chromeShellPost("/api/v2/desktop/local-asset-cleanup/trash", _0x1d1af9[0])
  },
  clipboard: {
    get api() {
      return getGroup(getElectronApi(), "clipboard");
    },
    canUseImages() {
      return isFunction(desktopBridge.clipboard.api?.writeImage) || isFunction(desktopBridge.clipboard.api?.readImage);
    },
    canUseFiles() {
      return !!desktopBridge.clipboard.api || desktopBridge.isChromeShell;
    },
    canUseText() {
      return !!desktopBridge.clipboard.api || desktopBridge.isChromeShell;
    },
    writeImage: (..._0x89ad24) => desktopBridge.clipboard.api?.writeImage?.(..._0x89ad24),
    readImage: (..._0x568ad6) => desktopBridge.clipboard.api?.readImage?.(..._0x568ad6),
    writeFileReferences: (..._0x464ed4) => desktopBridge.clipboard.api?.writeFileReferences?.(..._0x464ed4) ?? chromeShellPost("/api/v2/desktop/clipboard/write-file-references", _0x464ed4[0]),
    readFileReferences: (..._0xd4c11f) => desktopBridge.clipboard.api?.readFileReferences?.(..._0xd4c11f) ?? chromeShellPost("/api/v2/desktop/clipboard/read-file-references", _0xd4c11f[0]),
    writeText: (..._0x12c08f) => desktopBridge.clipboard.api?.writeText?.(..._0x12c08f) ?? chromeShellPost("/api/v2/desktop/clipboard/write-text", _0x12c08f[0]),
    readText: (..._0x234b7a) => desktopBridge.clipboard.api?.readText?.(..._0x234b7a) ?? chromeShellPost("/api/v2/desktop/clipboard/read-text", _0x234b7a[0])
  },
  canvasVisualSnapshot: {
    get api() {
      return getGroup(getElectronApi(), "canvasVisualSnapshot");
    },
    isAvailable() {
      return isFunction(desktopBridge.canvasVisualSnapshot.api?.capturePage);
    },
    capturePage: (..._0x3cb5c8) => desktopBridge.canvasVisualSnapshot.api?.capturePage?.(..._0x3cb5c8)
  }
};
export function installDesktopBridgeCompat() {
  const _0x6ca640 = getWindowObject();
  if (!_0x6ca640 || !desktopBridge.isChromeShell || _0x6ca640.electronAPI || _0x6ca640.aiCanvasDesktop) {
    return false;
  }
  _0x6ca640.__AIC_CHROME_SHELL__ = true;
  _0x6ca640.aiCanvasDesktop = {
    __aicDesktopHttpShim: true,
    isElectron: false,
    getAppVersion: _0x5ee5d6 => chromeShellPost("/api/v2/desktop/app/get-version", _0x5ee5d6),
    getDeviceId: _0x3640fd => chromeShellPost("/api/v2/desktop/app/get-device-id", _0x3640fd),
    checkForUpdates: _0x11eb5d => chromeShellPost("/api/v2/desktop/app/check-for-updates", _0x11eb5d),
    getUpdateState: _0x595006 => chromeShellPost("/api/v2/desktop/app/update-state", _0x595006),
    downloadUpdate: _0x390b63 => chromeShellPost("/api/v2/desktop/app/download-update", _0x390b63),
    cancelUpdateDownload: _0x128255 => chromeShellPost("/api/v2/desktop/app/cancel-update-download", _0x128255),
    installDownloadedUpdate: async _0x32f6c9 => {
      await writeChromeShellRecoverySnapshotBeforeInstall();
      return chromeShellPost("/api/v2/desktop/app/install-downloaded-update", _0x32f6c9);
    },
    onUpdaterEvent: _0x329a74 => subscribeToUpdaterState(() => chromeShellPost("/api/v2/desktop/app/update-state", {}), _0x329a74)
  };
  _0x6ca640.electronAPI = {
    __aicDesktopHttpShim: true,
    project: {
      open: _0x5d8e39 => chromeShellPost("/api/v2/desktop/project/open", _0x5d8e39),
      save: _0x118317 => chromeShellPost("/api/v2/desktop/project/save", _0x118317),
      exportPackage: _0xb2141b => chromeShellPost("/api/v2/desktop/project/export-package", _0xb2141b),
      importPackage: _0xb8a327 => chromeShellPost("/api/v2/desktop/project/import-package", _0xb8a327),
      listRecent: _0x857d0f => chromeShellPost("/api/v2/desktop/project/list-recent", _0x857d0f),
      removeRecent: _0x5385cf => chromeShellPost("/api/v2/desktop/project/remove-recent", _0x5385cf),
      setUnsavedState: _0x35b0bd => postChromeShellUnsavedState(_0x35b0bd),
      writeRecoverySnapshot: _0x4e0c78 => chromeShellPost("/api/v2/desktop/project/write-recovery-snapshot", _0x4e0c78),
      getRecoverySnapshotInfo: _0x2b9cf0 => chromeShellPost("/api/v2/desktop/project/get-recovery-snapshot-info", _0x2b9cf0),
      readRecoverySnapshot: _0x2977cc => chromeShellPost("/api/v2/desktop/project/read-recovery-snapshot", _0x2977cc),
      clearRecoverySnapshot: _0x48a3bc => chromeShellPost("/api/v2/desktop/project/clear-recovery-snapshot", _0x48a3bc),
      consumeExternalOpenRequests: _0x156d63 => chromeShellPost("/api/v2/desktop/project/consume-external-open-requests", _0x156d63),
      onExternalOpen: _0x13a76e => subscribeToConsumedBatch(() => chromeShellPost("/api/v2/desktop/project/consume-external-open-requests", {}), _0x13a76e, {
        intervalMs: 500
      }),
      onPackageProgress: _0x1bb2a1 => subscribeByPolling(() => chromeShellPost("/api/v2/desktop/project/consume-package-progress-events", {}), _0x1bb2a1, {
        intervalMs: 250,
        extractItems: _0x5c9efa => Array.isArray(_0x5c9efa) ? _0x5c9efa : [],
        getKey: _0x489b40 => String(_0x489b40?.createdAt || _0x489b40?.operationId || JSON.stringify(_0x489b40 || {}))
      })
    },
    importAsset: _0x4e0ccc => chromeShellPost("/api/v2/desktop/asset/import", _0x4e0ccc),
    importRemoteAsset: _0x2e741a => chromeShellPost("/api/v2/desktop/asset/import-remote", _0x2e741a),
    importLocalFile: _0x165c55 => chromeShellPost("/api/v2/desktop/file/import-local", _0x165c55),
    getPathForFile: _0x237f06 => String(_0x237f06?.path || ""),
    getLocalPreviewUrl: _0x538ad9 => postDesktopBridge("/api/v2/desktop/local-preview", _0x538ad9),
    selectDirectory: _0x5e93a4 => chromeShellPost("/api/v2/desktop/dialog/select-directory", _0x5e93a4),
    showItemInFolder: _0x1a2c64 => chromeShellPost("/api/v2/desktop/shell/show-item-in-folder", _0x1a2c64),
    openKnownFolder: _0x7c17fd => chromeShellPost("/api/v2/desktop/shell/open-known-folder", _0x7c17fd),
    openExternal: _0x2ad983 => chromeShellPost("/api/v2/desktop/shell/open-external", {
      url: _0x2ad983
    }),
    shell: {
      openExternal: _0xb2b115 => chromeShellPost("/api/v2/desktop/shell/open-external", {
        url: _0xb2b115
      })
    },
    webPreview: {
      surfaceMode: "remote-snapshot",
      syncViews: _0x280520 => chromeShellPost("/api/v2/desktop/web-preview/sync-views", _0x280520),
      syncViewsFast: _0x21ceaf => syncChromeShellWebPreviewViews(_0x21ceaf),
      disposeViews: _0x2751ae => chromeShellPost("/api/v2/desktop/web-preview/dispose-views", _0x2751ae),
      controlView: _0x13eec1 => chromeShellPost("/api/v2/desktop/web-preview/control-view", _0x13eec1),
      onEvent: _0x432fa1 => subscribeByLongPolling(() => chromeShellPost("/api/v2/desktop/web-preview/wait-events", {
        waitMs: 1000
      }), _0x432fa1)
    },
    secureSettings: {
      get: _0x5ddc0c => chromeShellPost("/api/v2/desktop/secure-settings/get", _0x5ddc0c),
      set: _0x4dd1a2 => chromeShellPost("/api/v2/desktop/secure-settings/set", _0x4dd1a2),
      delete: _0x2bda96 => chromeShellPost("/api/v2/desktop/secure-settings/delete", _0x2bda96)
    },
    customAiApps: {
      read: _0x3d80d9 => chromeShellPost("/api/v2/desktop/custom-ai-apps/read", _0x3d80d9),
      write: _0x4e512e => chromeShellPost("/api/v2/desktop/custom-ai-apps/write", _0x4e512e)
    },
    mediaTask: {
      enqueue: _0x442a2b => chromeShellPost("/api/v2/desktop/media-task/enqueue", _0x442a2b),
      cancel: _0x385e80 => chromeShellPost("/api/v2/desktop/media-task/cancel", _0x385e80),
      list: _0x5ce91b => chromeShellPost("/api/v2/desktop/media-task/list", _0x5ce91b),
      onUpdate: _0x125660 => subscribeByPolling(() => chromeShellPost("/api/v2/desktop/media-task/list", {
        limit: 120
      }), _0x125660, {
        intervalMs: 1000,
        extractItems: _0x17a64e => Array.isArray(_0x17a64e?.tasks) ? _0x17a64e.tasks : Array.isArray(_0x17a64e) ? _0x17a64e : [],
        getKey: _0x5aabe4 => String(_0x5aabe4?.taskId || JSON.stringify(_0x5aabe4 || {}))
      })
    },
    diagnostics: {
      logEvent: _0xbd35d0 => desktopBridge.diagnostics.logEvent(_0xbd35d0),
      createPackage: _0x568128 => desktopBridge.diagnostics.createPackage(_0x568128),
      openLogsFolder: _0x3e49f3 => desktopBridge.diagnostics.openLogsFolder(_0x3e49f3)
    },
    notification: {
      showGenerationComplete: _0x2963b3 => desktopBridge.notification.showGenerationComplete(_0x2963b3),
      onGenerationCompleteClick: _0x325da9 => desktopBridge.notification.onGenerationCompleteClick(_0x325da9)
    },
    notificationSound: {
      listMp3Files: _0x3524df => chromeShellPost("/api/v2/desktop/notification-sound/list-mp3-files", _0x3524df),
      listSystemSounds: _0x53b7c1 => chromeShellPost("/api/v2/desktop/notification-sound/list-system-sounds", _0x53b7c1),
      openSystemSoundFolder: _0x5e0b38 => chromeShellPost("/api/v2/desktop/notification-sound/open-system-sound-folder", _0x5e0b38),
      play: _0x5dad11 => chromeShellPost("/api/v2/desktop/notification-sound/play", _0x5dad11)
    },
    localAssetCleanup: {
      scan: _0x202b1e => chromeShellPost("/api/v2/desktop/local-asset-cleanup/scan", _0x202b1e),
      trash: _0x32a555 => chromeShellPost("/api/v2/desktop/local-asset-cleanup/trash", _0x32a555)
    },
    nodeExport: {
      exportSelected: _0x301701 => chromeShellPost("/api/v2/desktop/node-export/export-selected", _0x301701),
      saveMedia: _0x1eea3f => chromeShellPost("/api/v2/desktop/node-export/save-media", _0x1eea3f),
      saveText: _0x3d453a => chromeShellPost("/api/v2/desktop/node-export/save-text", _0x3d453a),
      saveMediaFiles: _0x283cfc => chromeShellPost("/api/v2/desktop/node-export/save-media-files", _0x283cfc)
    },
    screenshot: {
      captureDisplay: _0x3b7ee4 => chromeShellPost("/api/v2/desktop/screenshot/capture-display", _0x3b7ee4),
      updateGlobalShortcut: _0x45ab89 => chromeShellPost("/api/v2/desktop/screenshot/update-global-shortcut", _0x45ab89),
      onGlobalCapture: _0x5e88a5 => subscribeByPolling(() => chromeShellPost("/api/v2/desktop/screenshot/consume-global-capture-events", {}), _0x5e88a5, {
        intervalMs: 150,
        extractItems: _0x3582e0 => Array.isArray(_0x3582e0) ? _0x3582e0 : [],
        getKey: _0xe9a904 => String(_0xe9a904?.createdAt || _0xe9a904?.source || JSON.stringify(_0xe9a904 || {}))
      }),
      onGlobalShortcutStatus: _0x226f82 => subscribeByPolling(() => chromeShellPost("/api/v2/desktop/screenshot/get-global-shortcut-status", {}), _0x226f82, {
        intervalMs: 1000,
        getKey: () => "global-shortcut-status"
      })
    },
    clipboard: {
      writeText: _0x599f9d => chromeShellPost("/api/v2/desktop/clipboard/write-text", _0x599f9d),
      readText: _0x263c9a => chromeShellPost("/api/v2/desktop/clipboard/read-text", _0x263c9a),
      writeFileReferences: _0x295418 => chromeShellPost("/api/v2/desktop/clipboard/write-file-references", _0x295418),
      readFileReferences: _0x3fe5d5 => chromeShellPost("/api/v2/desktop/clipboard/read-file-references", _0x3fe5d5)
    },
    onAssetUpdated: _0x24db5f => subscribeByPolling(() => chromeShellPost("/api/v2/desktop/asset/consume-updates", {}), _0x24db5f, {
      intervalMs: 500,
      extractItems: _0x14efac => Array.isArray(_0x14efac) ? _0x14efac : [],
      getKey: _0x3518bd => String(_0x3518bd?.assetId || JSON.stringify(_0x3518bd || {}))
    }),
    logDragImport: (_0xbb797e, _0x565bd9) => desktopBridge.diagnostics.logEvent({
      type: "import.drag_profile",
      level: "debug",
      source: "renderer",
      message: "Drag import profile",
      context: {
        label: _0xbb797e,
        ...(_0x565bd9 || {})
      }
    })
  };
  return true;
}
export function getDesktopBridge() {
  return desktopBridge;
}
export const __desktopBridgeForTest = {
  hasChromeShellRuntimeHint: hasChromeShellRuntimeHint,
  isLoopbackAppOrigin: isLoopbackAppOrigin,
  normalizeDesktopHttpPayload: normalizeDesktopHttpPayload,
  resolveDesktopBridgeRequestTimeout: resolveDesktopBridgeRequestTimeout,
  subscribeToConsumedBatch: subscribeToConsumedBatch,
  subscribeToUpdaterState: subscribeToUpdaterState,
  writeChromeShellRecoverySnapshotBeforeInstall: writeChromeShellRecoverySnapshotBeforeInstall
};