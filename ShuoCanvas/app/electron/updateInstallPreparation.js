import { execFileSync } from "node:child_process";
const DEFAULT_UPDATE_INSTALL_CLEANUP_TIMEOUT_MS = 4000;
function delay(_0x5dda87) {
  return new Promise(_0x950589 => {
    setTimeout(_0x950589, _0x5dda87);
  });
}
function isPidRunning(_0x5ee858) {
  if (!Number.isInteger(_0x5ee858) || _0x5ee858 <= 0) {
    return false;
  }
  try {
    process.kill(_0x5ee858, 0);
    return true;
  } catch (_0x2e5f75) {
    return _0x2e5f75?.code === "EPERM";
  }
}
async function waitForPidExit(_0x522436, _0x293a76) {
  if (!Number.isInteger(_0x522436) || _0x522436 <= 0) {
    return true;
  }
  const _0x3ff9c9 = Date.now();
  while (Date.now() - _0x3ff9c9 < _0x293a76) {
    if (!isPidRunning(_0x522436)) {
      return true;
    }
    await delay(120);
  }
  return !isPidRunning(_0x522436);
}
function terminateProcessTree(_0x1e192c, {
  force = false
} = {}) {
  if (!Number.isInteger(_0x1e192c) || _0x1e192c <= 0) {
    return;
  }
  if (process.platform === "win32") {
    const _0xaab89c = ["/PID", String(_0x1e192c), "/T"];
    if (force) {
      _0xaab89c.push("/F");
    }
    execFileSync("taskkill", _0xaab89c, {
      stdio: "ignore",
      windowsHide: true
    });
    return;
  }
  process.kill(_0x1e192c, force ? "SIGKILL" : "SIGTERM");
}
export function createUpdateInstallPreparation(_0x2443fa = {}) {
  const _0x4b7fa2 = Number(_0x2443fa.timeoutMs) > 0 ? Number(_0x2443fa.timeoutMs) : DEFAULT_UPDATE_INSTALL_CLEANUP_TIMEOUT_MS;
  const _0x5d00f7 = typeof _0x2443fa.getSpawnedServer === "function" ? _0x2443fa.getSpawnedServer : () => null;
  const _0x1f8f95 = typeof _0x2443fa.clearSpawnedServer === "function" ? _0x2443fa.clearSpawnedServer : () => {};
  const _0x204985 = typeof _0x2443fa.markQuittingForUpdate === "function" ? _0x2443fa.markQuittingForUpdate : () => {};
  const _0x3ce6ec = typeof _0x2443fa.resetQuittingForUpdate === "function" ? _0x2443fa.resetQuittingForUpdate : () => {};
  const _0x47986b = typeof _0x2443fa.getMainWindow === "function" ? _0x2443fa.getMainWindow : () => null;
  const _0x3ebe5c = typeof _0x2443fa.getRendererProjectState === "function" ? _0x2443fa.getRendererProjectState : () => ({});
  const _0x55766d = typeof _0x2443fa.requestRendererRecoverySnapshot === "function" ? _0x2443fa.requestRendererRecoverySnapshot : null;
  const _0x67a38 = typeof _0x2443fa.destroyScreenshotOverlayWindow === "function" ? _0x2443fa.destroyScreenshotOverlayWindow : () => {};
  const _0xd25239 = typeof _0x2443fa.stopAllPowerSaveBlockers === "function" ? _0x2443fa.stopAllPowerSaveBlockers : () => {};
  const _0x2f6c5f = typeof _0x2443fa.closeChromeShell === "function" ? _0x2443fa.closeChromeShell : async () => {};
  const _0x72d9eb = typeof _0x2443fa.waitForChromeShellStartup === "function" ? _0x2443fa.waitForChromeShellStartup : async () => {};
  const _0x463e00 = typeof _0x2443fa.stopSpawnedServerForUpdate === "function" ? _0x2443fa.stopSpawnedServerForUpdate : _0x2ef3c6;
  const _0x47caad = typeof _0x2443fa.logEvent === "function" ? _0x2443fa.logEvent : () => {};
  async function _0x2ef3c6() {
    const _0x1f74f7 = _0x5d00f7();
    if (!_0x1f74f7) {
      return true;
    }
    const _0x10922b = Number(_0x1f74f7.pid || 0);
    if (!Number.isInteger(_0x10922b) || _0x10922b <= 0) {
      _0x1f8f95(_0x1f74f7);
      return true;
    }
    try {
      terminateProcessTree(_0x10922b, {
        force: false
      });
    } catch (_0x3c0675) {
      console.warn("[electron] failed to stop backend before update install:", _0x3c0675);
    }
    let _0x1e4aa5 = await waitForPidExit(_0x10922b, _0x4b7fa2);
    if (!_0x1e4aa5) {
      try {
        terminateProcessTree(_0x10922b, {
          force: true
        });
      } catch (_0x224c77) {
        console.warn("[electron] failed to force stop backend before update install:", _0x224c77);
      }
      _0x1e4aa5 = await waitForPidExit(_0x10922b, 1000);
    }
    if (_0x1e4aa5) {
      _0x1f8f95(_0x1f74f7);
    }
    return _0x1e4aa5;
  }
  async function _0x8d8ba2() {
    const _0x3cb09e = _0x3ebe5c();
    const _0x50ea3b = _0x47986b();
    if (_0x3cb09e?.hasUnsavedChanges !== true || !_0x50ea3b || _0x50ea3b.isDestroyed() || !_0x55766d) {
      return;
    }
    try {
      const _0x3c868a = await _0x55766d(_0x50ea3b, "update-install");
      if (_0x3c868a?.success === false) {
        _0x47caad({
          type: "updater.recovery_snapshot_before_install_failed",
          level: "warn",
          source: "main",
          message: "Recovery snapshot before update install failed",
          context: {
            reason: _0x3c868a.reason || "",
            error: _0x3c868a.error || ""
          }
        });
      }
    } catch (_0x5bc80e) {
      _0x47caad({
        type: "updater.recovery_snapshot_before_install_failed",
        level: "warn",
        source: "main",
        message: "Recovery snapshot before update install failed",
        error: _0x5bc80e
      });
    }
  }
  async function _0x5f3f45() {
    let _0x3dad4e = null;
    try {
      await Promise.race([Promise.resolve().then(() => _0x72d9eb()), new Promise((_0x578db8, _0x15f095) => {
        _0x3dad4e = setTimeout(() => {
          const _0x139335 = new Error("Chrome shell startup did not settle before update install");
          _0x139335.code = "UPDATE_CHROME_SHELL_STARTUP_SETTLE_TIMEOUT";
          _0x15f095(_0x139335);
        }, _0x4b7fa2);
      })]);
    } finally {
      if (_0x3dad4e !== null) {
        clearTimeout(_0x3dad4e);
      }
    }
  }
  async function _0x435c54() {
    _0x204985();
    try {
      _0x47caad({
        type: "updater.prepare_install",
        level: "info",
        source: "main",
        message: "Preparing application for update install"
      });
      await _0x5f3f45();
      await _0x8d8ba2();
      try {
        _0x67a38();
      } catch (_0x39476d) {
        console.warn("[electron] failed to destroy screenshot overlay before update:", _0x39476d);
      }
      try {
        _0xd25239();
      } catch (_0x50aebd) {
        console.warn("[electron] failed to stop power save blockers before update:", _0x50aebd);
      }
      await _0x2f6c5f();
      const _0x41f3b0 = await _0x463e00();
      if (!_0x41f3b0) {
        _0x47caad({
          type: "updater.backend_stop_timeout",
          level: "warn",
          source: "main",
          message: "Backend process did not exit before update install"
        });
        const _0x5d58b7 = new Error("Backend process did not exit before update install");
        _0x5d58b7.code = "UPDATE_BACKEND_STOP_TIMEOUT";
        throw _0x5d58b7;
      }
    } catch (_0x4231c5) {
      try {
        _0x3ce6ec();
      } catch (_0x3f237e) {
        console.warn("[electron] failed to reset update quit state:", _0x3f237e);
      }
      throw _0x4231c5;
    }
  }
  return {
    prepareForUpdateInstall: _0x435c54,
    stopSpawnedServerForUpdate: _0x2ef3c6
  };
}