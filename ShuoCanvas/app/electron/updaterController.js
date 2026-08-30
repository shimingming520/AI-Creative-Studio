export const UPDATER_STATES = Object.freeze({
  IDLE: "idle",
  CHECKING: "checking",
  AVAILABLE: "available",
  DOWNLOADING: "downloading",
  DOWNLOADED: "downloaded",
  INSTALLING: "installing",
  ERROR: "error"
});
const DEFAULT_DOWNLOAD_RETRY_DELAYS_MS = [3000, 10000];
function normalizeRetryDelays(_0x32f023) {
  return (Array.isArray(_0x32f023) ? _0x32f023 : DEFAULT_DOWNLOAD_RETRY_DELAYS_MS).map(_0x43b324 => Number(_0x43b324)).filter(_0x4e0ae5 => Number.isFinite(_0x4e0ae5) && _0x4e0ae5 >= 0);
}
function sanitizeUpdaterErrorForLog(_0x4948aa) {
  if (!_0x4948aa) {
    return null;
  }
  const _0x251ce5 = new Error("Updater operation failed");
  _0x251ce5.name = String(_0x4948aa?.name || "Error").slice(0, 120);
  if (_0x4948aa?.code != null) {
    _0x251ce5.code = String(_0x4948aa.code).slice(0, 120);
  }
  return _0x251ce5;
}
function waitForRetry(_0x5d5ae5, _0x4875ac, _0x5b5b65, _0x20396b) {
  return new Promise(_0x268492 => {
    let _0x3f6563 = false;
    let _0x1d9ed9 = null;
    const _0x2ff6bf = _0x24f4c2 => {
      if (_0x3f6563) {
        return;
      }
      _0x3f6563 = true;
      if (_0x20396b.cancelRetryWait === _0x3e94a5) {
        _0x20396b.cancelRetryWait = null;
      }
      _0x268492(_0x24f4c2);
    };
    const _0x3e94a5 = () => {
      if (_0x1d9ed9 !== null) {
        _0x4875ac(_0x1d9ed9);
      }
      _0x2ff6bf(false);
    };
    _0x20396b.cancelRetryWait = _0x3e94a5;
    _0x1d9ed9 = _0x5d5ae5(() => _0x2ff6bf(true), _0x5b5b65);
    if (_0x3f6563 && _0x20396b.cancelRetryWait === _0x3e94a5) {
      _0x20396b.cancelRetryWait = null;
    }
  });
}
export function createUpdaterController(_0x2f3d7a = {}) {
  const _0x4a781a = _0x2f3d7a.autoUpdater;
  if (!_0x4a781a) {
    throw new Error("autoUpdater is required");
  }
  const _0x1483eb = typeof _0x2f3d7a.normalizeInfo === "function" ? _0x2f3d7a.normalizeInfo : _0x4a07c2 => _0x4a07c2 || null;
  const _0x291a16 = typeof _0x2f3d7a.logEvent === "function" ? _0x2f3d7a.logEvent : () => {};
  const _0x366ab7 = typeof _0x2f3d7a.sendEvent === "function" ? _0x2f3d7a.sendEvent : () => {};
  const _0x3967d9 = typeof _0x2f3d7a.setProgressBar === "function" ? _0x2f3d7a.setProgressBar : () => {};
  const _0x50eac0 = typeof _0x2f3d7a.prepareBeforeInstall === "function" ? _0x2f3d7a.prepareBeforeInstall : typeof _0x2f3d7a.stopBeforeInstall === "function" ? _0x2f3d7a.stopBeforeInstall : () => {};
  const _0x2fde50 = typeof _0x2f3d7a.quitApplication === "function" ? _0x2f3d7a.quitApplication : null;
  const _0x4bf0e3 = typeof _0x2f3d7a.setTimeoutFn === "function" ? _0x2f3d7a.setTimeoutFn : setTimeout;
  const _0x3ec4db = typeof _0x2f3d7a.clearTimeoutFn === "function" ? _0x2f3d7a.clearTimeoutFn : clearTimeout;
  const _0x3e1bb7 = typeof _0x2f3d7a.createCancellationToken === "function" ? _0x2f3d7a.createCancellationToken : () => null;
  const _0xfcf418 = normalizeRetryDelays(_0x2f3d7a.retryDelaysMs);
  const _0x58049d = () => {
    if (typeof _0x2f3d7a.isPackaged === "function") {
      return Boolean(_0x2f3d7a.isPackaged());
    }
    return Boolean(_0x2f3d7a.isPackaged);
  };
  let _0x43c446 = false;
  let _0x22b13e = UPDATER_STATES.IDLE;
  let _0x55859c = null;
  let _0x1fd74f = null;
  let _0x4d3483 = null;
  let _0xf071ef = null;
  let _0x4f4a73 = 0;
  let _0x583cc8 = false;
  function _0x3c296b() {
    return {
      state: _0x22b13e,
      latestEvent: _0x1fd74f,
      latestInfo: _0x55859c,
      retryCount: _0x4f4a73,
      maxRetries: _0xfcf418.length,
      canCheck: true,
      canDownload: !_0x4d3483 && (_0x22b13e === UPDATER_STATES.AVAILABLE || _0x22b13e === UPDATER_STATES.ERROR),
      canInstall: _0x22b13e === UPDATER_STATES.DOWNLOADED
    };
  }
  function _0x54fe54(_0x5f2ac0) {
    _0x22b13e = _0x5f2ac0;
  }
  function _0x426575(_0x4a3f30, _0x19fd86 = {}) {
    const _0xe1fe2d = {
      type: _0x4a3f30,
      state: _0x22b13e,
      ..._0x19fd86
    };
    _0x1fd74f = _0xe1fe2d;
    if (_0xe1fe2d.info) {
      _0x55859c = _0xe1fe2d.info;
    }
    _0x366ab7(_0xe1fe2d);
    return _0xe1fe2d;
  }
  function _0x4fcdb8(_0x5bcb60, _0x221c33, _0x169b19, _0x249ee9 = {}, _0x29a989 = null) {
    const _0x2f87c2 = sanitizeUpdaterErrorForLog(_0x29a989);
    _0x291a16({
      type: _0x5bcb60,
      level: _0x221c33,
      source: "main",
      message: _0x169b19,
      context: _0x249ee9,
      ...(_0x2f87c2 ? {
        error: _0x2f87c2
      } : {})
    });
  }
  function _0x535065(_0x190e18, _0x286c05, _0x2a41ba, _0x379bdb = {}) {
    _0x54fe54(UPDATER_STATES.ERROR);
    _0x3967d9(-1);
    _0x4fcdb8(_0x190e18, "error", _0x286c05, _0x379bdb, _0x2a41ba);
  }
  function _0x4df0aa(_0x5875a2, _0x314208 = _0x55859c) {
    if (!_0x5875a2 || _0x5875a2.cancellationEmitted) {
      return;
    }
    _0x5875a2.cancellationEmitted = true;
    _0x4f4a73 = 0;
    _0x54fe54(UPDATER_STATES.AVAILABLE);
    _0x3967d9(-1);
    _0x4fcdb8("updater.download_cancelled", "info", "Application update download cancelled", {
      version: _0x314208?.version || _0x55859c?.version || ""
    });
    _0x426575("download-cancelled", {
      info: _0x314208 || _0x55859c,
      cancelled: true
    });
  }
  function _0x52e96f() {
    if (_0x43c446) {
      return;
    }
    _0x43c446 = true;
    _0x4a781a.autoDownload = false;
    _0x4a781a.autoInstallOnAppQuit = _0x2fde50 !== null;
    _0x4a781a.on("error", _0x1c2340 => {
      if (_0x22b13e === UPDATER_STATES.DOWNLOADING) {
        _0x4fcdb8("updater.download_error_event", "error", "Application updater emitted an error while downloading", {
          retryCount: _0x4f4a73
        }, _0x1c2340);
        return;
      }
      _0x535065("updater.error", "Application updater failed", _0x1c2340);
      _0x426575("error", {
        info: _0x55859c,
        message: "应用更新检查失败",
        manual: _0x583cc8
      });
      _0x583cc8 = false;
    });
    _0x4a781a.on("checking-for-update", () => {
      _0x54fe54(UPDATER_STATES.CHECKING);
      _0x4fcdb8("updater.checking", "info", "Checking for application update");
      _0x426575("checking", {
        info: _0x55859c,
        manual: _0x583cc8
      });
    });
    _0x4a781a.on("update-available", _0xec8884 => {
      _0x55859c = _0x1483eb(_0xec8884);
      _0x4f4a73 = 0;
      _0x54fe54(UPDATER_STATES.AVAILABLE);
      _0x4fcdb8("updater.available", "info", "Application update available", {
        version: _0xec8884?.version || ""
      });
      _0x426575("available", {
        info: _0x55859c,
        manual: _0x583cc8
      });
      _0x583cc8 = false;
    });
    _0x4a781a.on("update-not-available", _0x10add6 => {
      _0x55859c = _0x1483eb(_0x10add6);
      _0x4f4a73 = 0;
      _0x54fe54(UPDATER_STATES.IDLE);
      _0x3967d9(-1);
      _0x4fcdb8("updater.not_available", "info", "Application update not available", {
        version: _0x10add6?.version || ""
      });
      _0x426575("not-available", {
        info: _0x55859c,
        manual: _0x583cc8
      });
      _0x583cc8 = false;
    });
    _0x4a781a.on("download-progress", _0x43787d => {
      if (!_0xf071ef || _0xf071ef.cancelled) {
        return;
      }
      const _0x54e4b5 = Math.max(0, Math.min(100, Number(_0x43787d?.percent || 0)));
      _0x54fe54(UPDATER_STATES.DOWNLOADING);
      _0x3967d9(_0x54e4b5 / 100);
      _0x426575("download-progress", {
        info: _0x55859c,
        percent: _0x54e4b5,
        transferred: Number(_0x43787d?.transferred || 0),
        total: Number(_0x43787d?.total || 0),
        bytesPerSecond: Number(_0x43787d?.bytesPerSecond || 0),
        retryCount: _0x4f4a73,
        maxRetries: _0xfcf418.length
      });
    });
    _0x4a781a.on("update-downloaded", _0x47e4b9 => {
      if (_0xf071ef?.cancelled) {
        return;
      }
      _0x55859c = _0x1483eb(_0x47e4b9);
      _0x4f4a73 = 0;
      _0x54fe54(UPDATER_STATES.DOWNLOADED);
      _0x3967d9(-1);
      _0x4fcdb8("updater.downloaded", "info", "Application update downloaded", {
        version: _0x47e4b9?.version || ""
      });
      _0x426575("downloaded", {
        info: _0x55859c
      });
    });
    _0x4a781a.on("update-cancelled", _0x1ac188 => {
      if (!_0xf071ef) {
        return;
      }
      _0xf071ef.cancelled = true;
      const _0x2c8254 = _0x1483eb(_0x1ac188) || _0x55859c;
      if (_0x2c8254) {
        _0x55859c = _0x2c8254;
      }
      _0x4df0aa(_0xf071ef, _0x2c8254);
    });
  }
  async function _0x405a73(_0x4f186a = {}) {
    _0x52e96f();
    if (!_0x58049d()) {
      return {
        ok: false,
        skipped: true,
        reason: "not-packaged",
        state: _0x22b13e
      };
    }
    _0x54fe54(UPDATER_STATES.CHECKING);
    _0x583cc8 = Boolean(_0x4f186a.manual);
    try {
      await _0x4a781a.checkForUpdates();
      return {
        ok: true,
        state: _0x22b13e
      };
    } catch (_0x28f91d) {
      const _0x3378fd = Boolean(_0x4f186a.manual);
      const _0x2117f7 = _0x22b13e === UPDATER_STATES.ERROR && _0x1fd74f?.type === "error" && _0x1fd74f?.manual === _0x3378fd;
      if (!_0x2117f7) {
        _0x535065("updater.check_failed", "Application update check failed", _0x28f91d, {
          manual: _0x3378fd
        });
        _0x426575("error", {
          info: _0x55859c,
          message: "应用更新检查失败，请稍后再试",
          manual: _0x583cc8
        });
      }
      _0x583cc8 = false;
      throw _0x28f91d;
    }
  }
  async function _0x1b480a(_0x33f55f, _0x57c38a) {
    if (_0x57c38a.cancelled) {
      _0x4df0aa(_0x57c38a);
      return {
        ok: false,
        cancelled: true,
        state: _0x22b13e
      };
    }
    _0x4f4a73 = _0x33f55f;
    _0x54fe54(UPDATER_STATES.DOWNLOADING);
    _0x426575(_0x33f55f === 0 ? "download-started" : "download-retry", {
      info: _0x55859c,
      retryCount: _0x33f55f,
      maxRetries: _0xfcf418.length,
      retryDelayMs: _0x33f55f > 0 ? _0xfcf418[_0x33f55f - 1] || 0 : 0
    });
    try {
      await _0x4a781a.downloadUpdate(_0x57c38a.cancellationToken || undefined);
      if (_0x57c38a.cancelled) {
        _0x4df0aa(_0x57c38a);
        return {
          ok: false,
          cancelled: true,
          state: _0x22b13e
        };
      }
      return {
        ok: true,
        state: _0x22b13e
      };
    } catch (_0x3a9865) {
      if (_0x57c38a.cancelled) {
        _0x4df0aa(_0x57c38a);
        return {
          ok: false,
          cancelled: true,
          state: _0x22b13e
        };
      }
      const _0x22dfd6 = _0xfcf418[_0x33f55f];
      _0x4fcdb8("updater.download_failed", "error", "Application update download failed", {
        attempt: _0x33f55f + 1,
        maxAttempts: _0xfcf418.length + 1,
        version: _0x55859c?.version || ""
      }, _0x3a9865);
      if (Number.isFinite(_0x22dfd6)) {
        _0x4fcdb8("updater.download_retry", "warn", "Retrying application update download", {
          retryCount: _0x33f55f + 1,
          retryDelayMs: _0x22dfd6,
          version: _0x55859c?.version || ""
        });
        const _0x31e76c = await waitForRetry(_0x4bf0e3, _0x3ec4db, _0x22dfd6, _0x57c38a);
        if (!_0x31e76c || _0x57c38a.cancelled) {
          _0x4df0aa(_0x57c38a);
          return {
            ok: false,
            cancelled: true,
            state: _0x22b13e
          };
        }
        return _0x1b480a(_0x33f55f + 1, _0x57c38a);
      }
      _0x4f4a73 = _0xfcf418.length;
      _0x535065("updater.download_exhausted", "Application update download retries exhausted", _0x3a9865, {
        retryCount: _0x4f4a73,
        version: _0x55859c?.version || ""
      });
      _0x426575("download-failed", {
        info: _0x55859c,
        retryCount: _0x4f4a73,
        maxRetries: _0xfcf418.length,
        message: "下载更新失败，请稍后再试"
      });
      throw _0x3a9865;
    }
  }
  async function _0x56995b() {
    _0x52e96f();
    if (_0x4d3483) {
      return _0x4d3483;
    }
    const _0x4300c2 = {
      cancellationToken: _0x3e1bb7(),
      cancelled: false,
      cancellationEmitted: false,
      cancelRetryWait: null
    };
    _0xf071ef = _0x4300c2;
    _0x4d3483 = _0x1b480a(0, _0x4300c2).finally(() => {
      if (_0xf071ef === _0x4300c2) {
        _0xf071ef = null;
      }
      _0x4d3483 = null;
    });
    return _0x4d3483;
  }
  function _0x3e5ef2() {
    _0x52e96f();
    const _0x2b2995 = _0xf071ef;
    if (!_0x2b2995 || !_0x4d3483 || _0x2b2995.cancelled) {
      return {
        ok: true,
        cancelled: false,
        state: _0x22b13e
      };
    }
    _0x2b2995.cancelled = true;
    _0x2b2995.cancelRetryWait?.();
    _0x2b2995.cancelRetryWait = null;
    try {
      _0x2b2995.cancellationToken?.cancel?.();
    } catch (_0x230b44) {
      _0x4fcdb8("updater.download_cancel_failed", "error", "Application update download cancellation failed", {
        version: _0x55859c?.version || ""
      }, _0x230b44);
      return {
        ok: false,
        cancelled: false,
        state: _0x22b13e
      };
    }
    _0x4df0aa(_0x2b2995);
    return {
      ok: true,
      cancelled: true,
      state: _0x22b13e
    };
  }
  async function _0x18656e() {
    _0x52e96f();
    _0x54fe54(UPDATER_STATES.INSTALLING);
    _0x4fcdb8("updater.install_requested", "info", "Application update install requested", {
      version: _0x55859c?.version || ""
    });
    _0x426575("installing", {
      info: _0x55859c
    });
    try {
      await Promise.resolve(_0x50eac0());
      if (_0x2fde50) {
        _0x2fde50();
        return {
          ok: true,
          state: _0x22b13e
        };
      }
      _0x4a781a.quitAndInstall(false, true);
      return {
        ok: true,
        state: _0x22b13e
      };
    } catch (_0x548324) {
      _0x535065("updater.install_failed", "Application update install failed", _0x548324, {
        version: _0x55859c?.version || ""
      });
      _0x426575("error", {
        info: _0x55859c,
        message: "重启安装失败，请稍后再试"
      });
      throw _0x548324;
    }
  }
  return {
    installHandlers: _0x52e96f,
    checkForUpdates: _0x405a73,
    downloadUpdate: _0x56995b,
    cancelDownload: _0x3e5ef2,
    installDownloadedUpdate: _0x18656e,
    getState: _0x3c296b,
    getLatestEvent: () => _0x1fd74f
  };
}