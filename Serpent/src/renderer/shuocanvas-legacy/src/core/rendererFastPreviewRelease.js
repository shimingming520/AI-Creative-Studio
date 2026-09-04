const DEFAULT_RELEASE_RETRY_MS = 80;
const DEFAULT_RELEASE_MAX_ATTEMPTS = 60;
const DEFAULT_RELEASE_MAX_ELAPSED_MS = 5000;
const MIN_RELEASE_TOTAL_RETRIES = 2;
function nowMs() {
  const _0x2f8a62 = globalThis.performance?.now?.();
  if (Number.isFinite(_0x2f8a62)) {
    return _0x2f8a62;
  } else {
    return Date.now();
  }
}
function recordReleaseSchedulerEvent(_0x3762d5, _0x56d4a8, _0x40a849 = {}) {
  globalThis.window?.__runtimeCompareRecordFastPreviewRelease?.({
    type: _0x3762d5,
    nodeId: _0x56d4a8,
    ..._0x40a849
  });
}
function isElementVisible(_0x5bd29f) {
  if (!_0x5bd29f || _0x5bd29f.isConnected === false) {
    return false;
  }
  const _0x39c17b = _0x5bd29f.style || {};
  return _0x39c17b.display !== "none" && _0x39c17b.visibility !== "hidden" && _0x39c17b.opacity !== "0";
}
function hasReadyImage(_0x2d25a4) {
  for (const _0x14c37d of _0x2d25a4?.querySelectorAll?.("img") || []) {
    const _0x4482f6 = !!_0x14c37d.classList?.contains?.("node-img") || !!_0x14c37d.classList?.contains?.("v2-media-preview") || !!_0x14c37d.classList?.contains?.("aigen-image-media") || !!_0x14c37d.classList?.contains?.("source-video-poster-frame") || !!_0x14c37d.classList?.contains?.("source-video-capture-preview") || !!_0x14c37d.classList?.contains?.("ai-video-deferred-poster");
    if (!_0x4482f6) {
      continue;
    }
    const _0x38183a = _0x14c37d.currentSrc || _0x14c37d.src || _0x14c37d.getAttribute?.("src") || "";
    if (!_0x38183a || !isElementVisible(_0x14c37d)) {
      continue;
    }
    if (_0x14c37d.complete === false) {
      continue;
    }
    if (_0x2d25a4?.dataset?.mediaLodMode === "full" && String(_0x14c37d.dataset?.lodSrc || "").trim() !== "full") {
      continue;
    }
    if (Number(_0x14c37d.naturalWidth || 0) > 0 || _0x14c37d.complete === undefined) {
      return true;
    }
  }
  return false;
}
function hasReadyVideo(_0x4686d1) {
  for (const _0x461f71 of _0x4686d1?.querySelectorAll?.("video") || []) {
    const _0x1acc4f = _0x461f71.currentSrc || _0x461f71.src || _0x461f71.getAttribute?.("src") || "";
    if (!_0x1acc4f || !isElementVisible(_0x461f71)) {
      continue;
    }
    if (Number(_0x461f71.readyState || 0) >= 2) {
      return true;
    }
  }
  return false;
}
function hasAnyMedia(_0x1ffd6a) {
  return !!_0x1ffd6a?.querySelector?.("img") || !!_0x1ffd6a?.querySelector?.("video");
}
function isRealMediaReady(_0x627b88) {
  if (!hasAnyMedia(_0x627b88)) {
    return true;
  }
  return hasReadyImage(_0x627b88) || hasReadyVideo(_0x627b88);
}
function isStillDetailDeferred(_0x4526a6) {
  return _0x4526a6?.classList?.contains?.("v2-node-detail-deferred") || _0x4526a6?.dataset?.detailStage === "deferred";
}
export function createFastPreviewReleaseScheduler({
  getWrapper: _0x54354c,
  hasPreview: _0x5cac8d,
  isMounted: _0x26baca,
  isInteractionBusy: _0x2440b8,
  resolveMediaPresentationReady: _0x43b7dd,
  releasePreview: _0x2d42b8,
  retryMs = DEFAULT_RELEASE_RETRY_MS,
  maxAttempts = DEFAULT_RELEASE_MAX_ATTEMPTS,
  maxTotalRetries: _0x5d7dc3,
  maxElapsedMs = DEFAULT_RELEASE_MAX_ELAPSED_MS,
  now = nowMs
} = {}) {
  const _0x5b9a6f = new Map();
  const _0x302e88 = new Map();
  const _0x1b76e4 = Math.max(0, Math.trunc(Number(maxAttempts) || 0));
  const _0x40f6ab = Number.isFinite(Number(_0x5d7dc3)) ? Math.max(0, Math.trunc(Number(_0x5d7dc3))) : Math.max(MIN_RELEASE_TOTAL_RETRIES, _0x1b76e4);
  const _0x524ae7 = Math.max(0, Number(maxElapsedMs) || 0);
  function _0x17e150() {
    const _0x21309d = Number(now?.());
    if (Number.isFinite(_0x21309d)) {
      return _0x21309d;
    } else {
      return nowMs();
    }
  }
  function _0x41f4a6(_0x348854, _0x2c7302) {
    if (_0x302e88.get(_0x348854) === _0x2c7302) {
      _0x302e88.delete(_0x348854);
    }
  }
  function _0x4f6314(_0x1f9f9e) {
    const _0x1da1d6 = String(_0x1f9f9e || "");
    const _0x5611bf = _0x5b9a6f.get(_0x1da1d6);
    if (_0x5611bf !== undefined) {
      clearTimeout(_0x5611bf);
      _0x5b9a6f.delete(_0x1da1d6);
      recordReleaseSchedulerEvent("timer-cleared", _0x1da1d6, {
        reason: "forget",
        activeTimerCount: _0x5b9a6f.size
      });
    }
    _0x302e88.delete(_0x1da1d6);
  }
  function _0x13b7a4(_0x136e54, _0x59b4db, _0x181535) {
    if (_0x302e88.get(_0x136e54) !== _0x59b4db) {
      return;
    }
    recordReleaseSchedulerEvent("schedule-call", _0x136e54, {
      attempt: _0x181535,
      readinessAttempt: _0x59b4db.readinessAttempts
    });
    if (typeof _0x5cac8d === "function" && _0x5cac8d(_0x136e54) !== true) {
      _0x41f4a6(_0x136e54, _0x59b4db);
      return;
    }
    const _0x430bb7 = _0x54354c?.(_0x136e54);
    const _0x39bf9d = typeof _0x26baca === "function" ? _0x26baca(_0x136e54) === true : _0x430bb7?.isConnected !== false;
    if (!_0x430bb7 || !_0x39bf9d || _0x430bb7.isConnected === false) {
      _0x41f4a6(_0x136e54, _0x59b4db);
      return;
    }
    const _0x590bf0 = _0x430bb7.hidden === true || !isElementVisible(_0x430bb7) || _0x2440b8?.() || isStillDetailDeferred(_0x430bb7);
    if (!_0x590bf0) {
      const _0x234d8e = _0x59b4db.readinessAttempts;
      recordReleaseSchedulerEvent("ready-check", _0x136e54, {
        attempt: _0x181535,
        readinessAttempt: _0x234d8e
      });
      const _0xbcc576 = _0x43b7dd?.(_0x136e54, _0x430bb7);
      const _0x3990f7 = typeof _0xbcc576 === "boolean" ? _0xbcc576 : isRealMediaReady(_0x430bb7);
      if (_0x3990f7) {
        const _0x11d41c = _0x2d42b8?.(_0x136e54);
        if (_0x11d41c === true) {
          recordReleaseSchedulerEvent("release-success", _0x136e54, {
            attempt: _0x181535,
            readinessAttempt: _0x234d8e
          });
          _0x41f4a6(_0x136e54, _0x59b4db);
          return;
        }
        recordReleaseSchedulerEvent("release-deferred", _0x136e54, {
          attempt: _0x181535,
          readinessAttempt: _0x234d8e
        });
      }
      if (_0x234d8e >= _0x1b76e4) {
        _0x41f4a6(_0x136e54, _0x59b4db);
        return;
      }
      _0x59b4db.readinessAttempts += 1;
    }
    const _0x509c8c = Math.max(0, _0x17e150() - _0x59b4db.startedAt);
    if (_0x59b4db.totalRetries >= _0x40f6ab || _0x509c8c >= _0x524ae7) {
      recordReleaseSchedulerEvent("retry-budget-exhausted", _0x136e54, {
        attempt: _0x181535,
        readinessAttempt: _0x59b4db.readinessAttempts,
        totalRetries: _0x59b4db.totalRetries,
        elapsedMs: _0x509c8c,
        reason: _0x59b4db.totalRetries >= _0x40f6ab ? "total-retries" : "elapsed-time",
        activeTimerCount: _0x5b9a6f.size
      });
      _0x41f4a6(_0x136e54, _0x59b4db);
      return;
    }
    _0x59b4db.totalRetries += 1;
    const _0x30d075 = setTimeout(() => {
      if (_0x5b9a6f.get(_0x136e54) !== _0x30d075) {
        return;
      }
      _0x5b9a6f.delete(_0x136e54);
      recordReleaseSchedulerEvent("timer-cleared", _0x136e54, {
        reason: "fired",
        activeTimerCount: _0x5b9a6f.size
      });
      _0x13b7a4(_0x136e54, _0x59b4db, _0x181535 + 1);
    }, retryMs);
    _0x5b9a6f.set(_0x136e54, _0x30d075);
    recordReleaseSchedulerEvent("timer-created", _0x136e54, {
      attempt: _0x181535,
      readinessAttempt: _0x59b4db.readinessAttempts,
      totalRetries: _0x59b4db.totalRetries,
      activeTimerCount: _0x5b9a6f.size
    });
  }
  function _0x4b5602(_0x1388e1, _0x46290d = 0) {
    const _0x5ba0b3 = String(_0x1388e1 || "");
    if (!_0x5ba0b3) {
      return;
    }
    _0x4f6314(_0x5ba0b3);
    const _0x4b3434 = Math.max(0, Math.trunc(Number(_0x46290d) || 0));
    const _0x42d304 = {
      readinessAttempts: _0x4b3434,
      startedAt: _0x17e150(),
      totalRetries: 0
    };
    _0x302e88.set(_0x5ba0b3, _0x42d304);
    _0x13b7a4(_0x5ba0b3, _0x42d304, _0x4b3434);
  }
  function _0x5e134b() {
    for (const [_0xe4319b, _0x25f885] of _0x5b9a6f) {
      clearTimeout(_0x25f885);
      _0x5b9a6f.delete(_0xe4319b);
      recordReleaseSchedulerEvent("timer-cleared", _0xe4319b, {
        reason: "clear",
        activeTimerCount: _0x5b9a6f.size
      });
    }
    _0x302e88.clear();
  }
  function _0x2d31d5() {
    return _0x5b9a6f.size;
  }
  return {
    clear: _0x5e134b,
    forget: _0x4f6314,
    getActiveTimerCount: _0x2d31d5,
    schedule: _0x4b5602
  };
}