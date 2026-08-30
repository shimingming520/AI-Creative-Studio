import a214_0x131270 from "node:http";
import { mkdirSync } from "node:fs";
import a214_0x32e58b from "electron";
import { createCustomAiAppStorage } from "./customAiAppStorage.js";
import { openShellFolder, revealShellItemInFolder } from "./shellItemRevealer.js";
const MAX_BODY_BYTES = 67108864;
const DEFAULT_CLOSE_GRACE_MS = 750;
const MAX_CLOSE_GRACE_MS = 5000;
const {
  clipboard = {},
  shell = {}
} = typeof a214_0x32e58b === "object" && a214_0x32e58b ? a214_0x32e58b : {};
function normalizeCloseGraceMs(_0x3d210d) {
  const _0x178078 = Number(_0x3d210d);
  if (!Number.isFinite(_0x178078) || _0x178078 < 0) {
    return DEFAULT_CLOSE_GRACE_MS;
  }
  return Math.min(Math.trunc(_0x178078), MAX_CLOSE_GRACE_MS);
}
function createDesktopHttpBridgeCloseError(_0x39158f) {
  const _0x4b2790 = String(_0x39158f?.message || _0x39158f || "Unknown close failure");
  const _0x4591e6 = new Error("Desktop HTTP bridge close failed: " + _0x4b2790);
  _0x4591e6.code = "DESKTOP_HTTP_BRIDGE_CLOSE_FAILED";
  if (_0x39158f) {
    _0x4591e6.cause = _0x39158f;
  }
  return _0x4591e6;
}
function jsonResponse(_0x32e000, _0x2f5888, _0x1547db) {
  const _0x50b71f = Buffer.from(JSON.stringify(_0x1547db || {}) + "\n", "utf8");
  _0x32e000.writeHead(_0x2f5888, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": String(_0x50b71f.length),
    "Cache-Control": "no-store"
  });
  _0x32e000.end(_0x50b71f);
}
function normalizePathname(_0xc5f427) {
  try {
    return new URL(_0xc5f427 || "/", "http://127.0.0.1").pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}
function readJsonBody(_0x3087d7) {
  return new Promise((_0xd34906, _0x4812de) => {
    const _0x37e6d9 = [];
    let _0x22a1af = 0;
    _0x3087d7.on("data", _0x695aa9 => {
      _0x22a1af += _0x695aa9.length;
      if (_0x22a1af > MAX_BODY_BYTES) {
        _0x4812de(new Error("REQUEST_BODY_TOO_LARGE"));
        _0x3087d7.destroy();
        return;
      }
      _0x37e6d9.push(Buffer.from(_0x695aa9));
    });
    _0x3087d7.on("error", _0x4812de);
    _0x3087d7.on("end", () => {
      const _0x2bc378 = Buffer.concat(_0x37e6d9).toString("utf8").trim();
      if (!_0x2bc378) {
        _0xd34906({});
        return;
      }
      try {
        const _0x433de2 = JSON.parse(_0x2bc378);
        _0xd34906(_0x433de2 && typeof _0x433de2 === "object" ? _0x433de2 : {});
      } catch {
        _0x4812de(new Error("Invalid JSON"));
      }
    });
  });
}
function requireToken(_0x46196a, _0x2cf806) {
  const _0x10b565 = String(_0x2cf806 || "").trim();
  if (!_0x10b565) {
    return false;
  }
  const _0x3a61bc = String(_0x46196a.headers["x-aic-desktop-bridge-token"] || "").trim();
  return _0x3a61bc === _0x10b565;
}
function safeCall(_0x1efdec, _0x530eac) {
  return Promise.resolve().then(() => _0x1efdec(_0x530eac || {}));
}
function readClipboardCustomFileReferences({
  fileReferencesFormat: _0x54da8e,
  normalizeClipboardFileReferences: _0x7a7354
}) {
  try {
    const _0x234fb1 = clipboard.readBuffer(_0x54da8e);
    if (!_0x234fb1 || _0x234fb1.length === 0) {
      return [];
    }
    const _0x36389b = JSON.parse(_0x234fb1.toString("utf8"));
    return _0x7a7354(_0x36389b?.files || []);
  } catch {
    return [];
  }
}
export function createDesktopHttpBridgeHandlers(_0x236e92 = {}) {
  const _0x2fbd4d = () => _0x236e92.getUpdaterController?.();
  const _0x6c04c6 = () => _0x236e92.getBackgroundCompletionNotifier?.();
  const _0x120c73 = typeof _0x236e92.revealItemInFolder === "function" ? _0x236e92.revealItemInFolder : _0x1573b2 => revealShellItemInFolder(_0x1573b2, {
    shellApi: shell,
    logEvent: _0x236e92.logDiagnosticEvent
  });
  const _0x2a85cc = typeof _0x236e92.openFolder === "function" ? _0x236e92.openFolder : _0x455117 => openShellFolder(_0x455117, {
    shellApi: shell,
    logEvent: _0x236e92.logDiagnosticEvent
  });
  const _0x12f210 = () => {
    const _0x3f526d = _0x236e92.secureSettingsOperations;
    if (!_0x3f526d) {
      throw new Error("Secure settings capability operations are unavailable");
    }
    return _0x3f526d;
  };
  const _0x24cad5 = () => {
    const _0x5740e4 = _0x236e92.projectOperations;
    if (!_0x5740e4) {
      throw new Error("Project capability operations are unavailable");
    }
    return _0x5740e4;
  };
  const _0x312e64 = [];
  let _0x1e7684 = null;
  const _0xb0d9dc = () => {
    if (!_0x1e7684) {
      _0x1e7684 = createCustomAiAppStorage({
        getDataDir: _0x236e92.getDataDir
      });
    }
    return _0x1e7684;
  };
  function _0x17df45(_0x5d31ef = {}) {
    _0x312e64.push({
      ...(_0x5d31ef || {}),
      createdAt: Date.now()
    });
    while (_0x312e64.length > 80) {
      _0x312e64.shift();
    }
  }
  function _0x1de176() {
    return _0x312e64.splice(0, _0x312e64.length);
  }
  function _0x4c75ab() {
    return {
      onProgress: _0x17df45
    };
  }
  function _0x372703() {
    const _0x1b65c0 = _0x236e92.getWebPreviewViewManager?.();
    if (!_0x1b65c0) {
      throw new Error("Browser node runtime is unavailable");
    }
    return _0x1b65c0;
  }
  function _0x27a55f(_0x2555a4 = {}) {
    const _0x2b7824 = _0x2555a4 && typeof _0x2555a4 === "object" ? _0x2555a4 : {};
    const _0x52fea9 = String(_0x2b7824.localPath || "").trim();
    if (!_0x52fea9) {
      throw new Error("Staged localPath is required");
    }
    if (Object.prototype.hasOwnProperty.call(_0x2b7824, "path") || Object.prototype.hasOwnProperty.call(_0x2b7824, "bytes")) {
      throw new Error("Raw paths and bytes are not allowed over the desktop HTTP bridge");
    }
    const _0x2c93de = _0x236e92.resolveLocalVirtualPath?.(_0x52fea9) || "";
    if (!_0x2c93de) {
      throw new Error("Path is not allowed");
    }
    const {
      localPath: _0x49f3af,
      ..._0x4c4d64
    } = _0x2b7824;
    return _0x236e92.importAssetToLibrary?.({
      ..._0x4c4d64,
      path: _0x2c93de
    });
  }
  return new Map([["/api/v2/desktop/app/get-version", () => _0x236e92.getAppVersion?.() || ""], ["/api/v2/desktop/app/get-device-id", _0x537ee8 => _0x236e92.getStableDeviceId?.(_0x537ee8) || ""], ["/api/v2/desktop/app/update-state", () => _0x2fbd4d()?.getState?.() || null], ["/api/v2/desktop/app/check-for-updates", () => _0x2fbd4d()?.checkForUpdates?.({
    manual: true
  }) || null], ["/api/v2/desktop/app/download-update", () => _0x2fbd4d()?.downloadUpdate?.() || null], ["/api/v2/desktop/app/cancel-update-download", () => _0x2fbd4d()?.cancelDownload?.() || null], ["/api/v2/desktop/app/install-downloaded-update", () => _0x2fbd4d()?.installDownloadedUpdate?.() || null], ["/api/v2/desktop/notification/show-generation-complete", _0x4024ef => {
    const _0x23418a = _0x6c04c6();
    if (!_0x23418a?.showGenerationComplete) {
      return {
        success: true,
        shown: false,
        reason: "unavailable"
      };
    }
    return _0x23418a.showGenerationComplete(_0x4024ef || {});
  }], ["/api/v2/desktop/notification/consume-generation-complete-clicks", () => {
    const _0x17fe3f = _0x6c04c6();
    return _0x17fe3f?.consumeClickEvents?.() || [];
  }], ["/api/v2/desktop/secure-settings/get", _0x3df070 => _0x12f210().get(_0x3df070)], ["/api/v2/desktop/secure-settings/set", _0xcab5fe => _0x12f210().set(_0xcab5fe)], ["/api/v2/desktop/secure-settings/delete", _0x10f1aa => _0x12f210().delete(_0x10f1aa)], ["/api/v2/desktop/custom-ai-apps/read", () => _0xb0d9dc().read()], ["/api/v2/desktop/custom-ai-apps/write", _0xe82293 => _0xb0d9dc().write(_0xe82293 || {})], ["/api/v2/desktop/storage-migration/read", () => _0x236e92.readLegacyRendererStorageMigration?.() || {
    available: false
  }], ["/api/v2/desktop/storage-migration/complete", _0x3dcd39 => _0x236e92.completeLegacyRendererStorageMigration?.(_0x3dcd39) || {
    success: false
  }], ["/api/v2/desktop/project/open", _0x259974 => _0x24cad5().open(_0x259974)], ["/api/v2/desktop/project/save", _0x4bf66e => _0x24cad5().save(_0x4bf66e)], ["/api/v2/desktop/project/export-package", _0x126fea => _0x24cad5().exportPackage(_0x126fea, _0x4c75ab())], ["/api/v2/desktop/project/import-package", _0x58f6e8 => _0x24cad5().importPackage(_0x58f6e8, _0x4c75ab())], ["/api/v2/desktop/project/consume-package-progress-events", () => _0x1de176()], ["/api/v2/desktop/project/list-recent", () => _0x24cad5().listRecent()], ["/api/v2/desktop/project/remove-recent", _0x2a32f7 => _0x24cad5().removeRecent(_0x2a32f7)], ["/api/v2/desktop/project/set-unsaved-state", _0x5234fd => _0x24cad5().setUnsavedState(_0x5234fd)], ["/api/v2/desktop/project/consume-external-open-requests", () => _0x24cad5().consumeExternalOpenRequests()], ["/api/v2/desktop/project/write-recovery-snapshot", _0x1a34d7 => _0x24cad5().writeRecoverySnapshot(_0x1a34d7)], ["/api/v2/desktop/project/get-recovery-snapshot-info", _0x4bfc72 => _0x24cad5().getRecoverySnapshotInfo(_0x4bfc72)], ["/api/v2/desktop/project/read-recovery-snapshot", () => _0x24cad5().readRecoverySnapshot()], ["/api/v2/desktop/project/clear-recovery-snapshot", () => _0x24cad5().clearRecoverySnapshot()], ["/api/v2/desktop/asset/import", _0x5c678d => _0x27a55f(_0x5c678d)], ["/api/v2/desktop/asset/import-remote", _0x5c5f95 => _0x236e92.importRemoteAssetToLibrary?.(_0x5c5f95)], ["/api/v2/desktop/asset/consume-updates", () => _0x236e92.consumeAssetUpdateEvents?.() || []], ["/api/v2/desktop/file/import-local", _0x143a34 => _0x27a55f(_0x143a34)], ["/api/v2/desktop/dialog/select-directory", _0x5d1967 => _0x236e92.selectDirectory?.(_0x5d1967)], ["/api/v2/desktop/shell/show-item-in-folder", _0x33b536 => {
    const _0x562caa = _0x236e92.resolveLocalVirtualPath?.(_0x33b536?.localPath || "");
    if (!_0x562caa) {
      throw new Error("Path is not allowed");
    }
    _0x120c73(_0x562caa);
    return {
      ok: true
    };
  }], ["/api/v2/desktop/shell/open-known-folder", _0x413f48 => {
    const _0x242667 = _0x236e92.resolveKnownFolder?.(_0x413f48?.kind || "");
    if (!_0x242667) {
      throw new Error("Folder is not allowed");
    }
    mkdirSync(_0x242667, {
      recursive: true
    });
    _0x2a85cc(_0x242667);
    return {
      ok: true
    };
  }], ["/api/v2/desktop/shell/open-external", _0x2f4d60 => _0x236e92.openExternalUrl?.(_0x2f4d60?.url || _0x2f4d60)], ["/api/v2/desktop/web-preview/sync-views", _0x54c511 => _0x372703().syncViews(_0x54c511 || {})], ["/api/v2/desktop/web-preview/dispose-views", _0x3453bf => _0x372703().disposeViews(_0x3453bf || {})], ["/api/v2/desktop/web-preview/control-view", _0x45c906 => _0x372703().controlView(_0x45c906 || {})], ["/api/v2/desktop/web-preview/consume-events", () => _0x372703().consumeEvents?.() || []], ["/api/v2/desktop/web-preview/wait-events", _0x2c8928 => {
    const _0x561a7a = _0x372703();
    return _0x561a7a.waitForEvents?.(_0x2c8928 || {}) || _0x561a7a.consumeEvents?.() || [];
  }], ["/api/v2/desktop/notification-sound/list-mp3-files", _0x14a295 => _0x236e92.listNotificationSoundMp3Files?.(_0x14a295)], ["/api/v2/desktop/notification-sound/list-system-sounds", () => _0x236e92.listSystemNotificationSoundFiles?.()], ["/api/v2/desktop/notification-sound/open-system-sound-folder", () => _0x236e92.openSystemNotificationSoundFolder?.()], ["/api/v2/desktop/notification-sound/play", _0x551304 => _0x236e92.playNotificationSound?.(_0x551304)], ["/api/v2/desktop/media-task/enqueue", _0x1cb832 => _0x236e92.getMediaTaskQueue?.().enqueue(_0x1cb832 || {})], ["/api/v2/desktop/media-task/cancel", _0x304607 => {
    const _0x15c794 = _0x236e92.getMediaTaskQueue?.();
    const _0x397ac7 = _0x304607?.taskId || "";
    if (_0x304607?.onlyIfWaiting === true) {
      return _0x15c794?.cancel(_0x397ac7, {
        onlyIfWaiting: true
      });
    }
    return _0x15c794?.cancel(_0x397ac7);
  }], ["/api/v2/desktop/media-task/list", _0x167265 => _0x236e92.getMediaTaskQueue?.().list({
    limit: _0x167265?.limit || 100
  })], ["/api/v2/desktop/local-asset-cleanup/scan", _0x3c1bf1 => _0x236e92.getLocalAssetCleanupManager?.().scan(_0x3c1bf1 || {})], ["/api/v2/desktop/local-asset-cleanup/trash", _0x21a20e => _0x236e92.getLocalAssetCleanupManager?.().trash(_0x21a20e || {})], ["/api/v2/desktop/diagnostics/log-event", _0xf60cfe => _0x236e92.logDiagnosticEvent?.({
    ...(_0xf60cfe || {}),
    source: _0xf60cfe?.source || "renderer"
  })], ["/api/v2/desktop/diagnostics/create-package", _0x34efd2 => _0x236e92.diagnosticsOperations?.createPackage(_0x34efd2 || {})], ["/api/v2/desktop/diagnostics/open-logs-folder", () => _0x236e92.diagnosticsOperations?.openLogsFolder()], ["/api/v2/desktop/node-export/export-selected", _0x2eeabb => _0x236e92.exportSelectedNodesPackage?.(_0x2eeabb || {})], ["/api/v2/desktop/node-export/save-media", _0xee041f => _0x236e92.saveMediaFile?.(_0xee041f || {})], ["/api/v2/desktop/node-export/save-text", _0x5aa600 => _0x236e92.saveTextFile?.(_0x5aa600 || {})], ["/api/v2/desktop/node-export/save-media-files", _0x290123 => _0x236e92.saveMediaFiles?.(_0x290123 || {})], ["/api/v2/desktop/screenshot/capture-display", () => _0x236e92.captureDesktopDisplay?.()], ["/api/v2/desktop/screenshot/update-global-shortcut", _0x302e12 => _0x236e92.configureGlobalScreenshotShortcut?.(_0x302e12)], ["/api/v2/desktop/screenshot/consume-global-capture-events", () => _0x236e92.consumeGlobalScreenshotCaptureEvents?.() || []], ["/api/v2/desktop/screenshot/get-global-shortcut-status", () => _0x236e92.getGlobalScreenshotShortcutStatus?.() || null], ["/api/v2/desktop/clipboard/write-text", _0x5d7bc0 => {
    clipboard.writeText(String(_0x5d7bc0?.text || ""));
    return {
      ok: true
    };
  }], ["/api/v2/desktop/clipboard/read-text", () => ({
    ok: true,
    text: clipboard.readText()
  })], ["/api/v2/desktop/clipboard/write-file-references", _0x151586 => {
    const _0x575834 = _0x236e92.normalizeClipboardFileReferences?.(_0x151586?.paths || _0x151586?.files || []) || [];
    if (_0x575834.length === 0) {
      return {
        ok: false,
        reason: "no-files",
        files: []
      };
    }
    const _0x43a789 = _0x575834.map(_0x2467c3 => _0x2467c3.path);
    try {
      clipboard.writeBuffer(_0x236e92.fileReferencesFormat, Buffer.from(JSON.stringify({
        version: 1,
        files: _0x43a789
      }), "utf8"));
    } catch {}
    clipboard.writeText(_0x43a789.join("\n"));
    return {
      ok: true,
      files: _0x575834
    };
  }], ["/api/v2/desktop/clipboard/read-file-references", () => {
    let _0x327336 = readClipboardCustomFileReferences(_0x236e92);
    if (_0x327336.length === 0) {
      _0x327336 = _0x236e92.parseClipboardFileReferencesFromText?.(clipboard.readText()) || [];
    }
    return {
      ok: _0x327336.length > 0,
      files: _0x327336
    };
  }]]);
}
export function startDesktopHttpBridge({
  token: _0x2dd30e,
  handlers: _0x2af1ad,
  logEvent = null,
  closeGraceMs = DEFAULT_CLOSE_GRACE_MS
} = {}) {
  const _0x4c026a = _0x2af1ad instanceof Map ? _0x2af1ad : createDesktopHttpBridgeHandlers(_0x2af1ad);
  const _0x2cd0a5 = new Set();
  const _0x10ce77 = a214_0x131270.createServer(async (_0x505f7f, _0x2db978) => {
    if (_0x505f7f.method !== "POST") {
      jsonResponse(_0x2db978, 405, {
        success: false,
        error: "Method not allowed"
      });
      return;
    }
    if (!requireToken(_0x505f7f, _0x2dd30e)) {
      jsonResponse(_0x2db978, 403, {
        success: false,
        error: "Forbidden"
      });
      return;
    }
    const _0x1d98a6 = normalizePathname(_0x505f7f.url);
    const _0x17ac1f = _0x4c026a.get(_0x1d98a6);
    if (typeof _0x17ac1f !== "function") {
      jsonResponse(_0x2db978, 404, {
        success: false,
        error: "Desktop bridge route not found"
      });
      return;
    }
    try {
      const _0x1e7c95 = await readJsonBody(_0x505f7f);
      const _0x3efd39 = await safeCall(_0x17ac1f, _0x1e7c95);
      jsonResponse(_0x2db978, 200, {
        success: true,
        data: _0x3efd39
      });
    } catch (_0x12ab36) {
      const _0x219eac = _0x12ab36?.message === "REQUEST_BODY_TOO_LARGE" ? "Request body too large" : String(_0x12ab36?.message || _0x12ab36);
      logEvent?.({
        type: "desktop_http_bridge.request_failed",
        level: "warn",
        source: "main",
        message: _0x219eac,
        error: _0x12ab36,
        context: {
          path: _0x1d98a6
        }
      });
      jsonResponse(_0x2db978, _0x219eac === "Request body too large" ? 413 : 500, {
        success: false,
        error: _0x219eac
      });
    }
  });
  _0x10ce77.on("connection", _0x5c8ba9 => {
    _0x2cd0a5.add(_0x5c8ba9);
    _0x5c8ba9.once("close", () => _0x2cd0a5.delete(_0x5c8ba9));
  });
  const _0x429c43 = normalizeCloseGraceMs(closeGraceMs);
  let _0x3559af = null;
  const _0x5dda74 = () => {
    if (_0x3559af) {
      return _0x3559af;
    }
    _0x3559af = new Promise((_0x37d7f6, _0x398d18) => {
      let _0x492c27 = false;
      let _0x588965 = null;
      const _0x222447 = (_0x26c7a5 = null) => {
        if (_0x492c27) {
          return;
        }
        _0x492c27 = true;
        if (_0x588965) {
          clearTimeout(_0x588965);
        }
        if (_0x26c7a5) {
          _0x398d18(createDesktopHttpBridgeCloseError(_0x26c7a5));
          return;
        }
        _0x37d7f6();
      };
      const _0x5469a3 = (_0x5d0015 = null) => {
        let _0x4b060b = _0x5d0015;
        try {
          _0x10ce77.closeAllConnections?.();
        } catch (_0x109192) {
          _0x4b060b = _0x109192;
        }
        for (const _0x56288d of _0x2cd0a5) {
          try {
            _0x56288d.destroy();
          } catch (_0x22984f) {
            _0x4b060b ||= _0x22984f;
          }
        }
        _0x222447(_0x4b060b);
      };
      try {
        _0x10ce77.close(_0x3edb15 => _0x222447(_0x3edb15 || null));
        _0x10ce77.closeIdleConnections?.();
        if (!_0x492c27) {
          _0x588965 = setTimeout(_0x5469a3, _0x429c43);
          _0x588965.unref?.();
        }
      } catch (_0x551633) {
        _0x5469a3(_0x551633);
      }
    });
    _0x3559af.catch(_0x3b3a33 => {
      try {
        logEvent?.({
          type: "desktop_http_bridge.close_failed",
          level: "error",
          source: "main",
          message: _0x3b3a33.message,
          error: _0x3b3a33,
          context: {
            closeGraceMs: _0x429c43
          }
        });
      } catch {}
    });
    return _0x3559af;
  };
  return new Promise((_0x4fe54d, _0x5d38fd) => {
    _0x10ce77.once("error", _0x5d38fd);
    _0x10ce77.listen(0, "127.0.0.1", () => {
      _0x10ce77.off("error", _0x5d38fd);
      const _0x45b4e8 = _0x10ce77.address();
      const _0x587f53 = typeof _0x45b4e8 === "object" && _0x45b4e8 ? _0x45b4e8.port : 0;
      _0x4fe54d({
        url: "http://127.0.0.1:" + _0x587f53,
        token: String(_0x2dd30e || ""),
        close: _0x5dda74
      });
    });
  });
}