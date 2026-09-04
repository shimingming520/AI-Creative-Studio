import { isRendererRuntimeDiagnosticsEnabled, recordRendererRuntimeDiagnostic } from "./rendererRuntimeDiagnostics.js";
const DEFAULT_MEDIA_RESIDENCY_SUSPEND_DELAY_MS = 120;
const DEFAULT_PRESENTED_MEDIA_LEASE_MS = 600;
const DEFAULT_MAX_RETAINED_PRESENTED_MEDIA = 3;
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
export function createRendererVideoMediaResidencyController({
  getComponent: _0x17d2dd,
  getWrapper: _0x43bebb,
  isMounted: _0xe7aba8,
  isPlaybackActive: _0x14c977,
  isRetentionProtected: _0x41194b,
  shouldRetainPresentedMedia: _0x36c5bd,
  onSuspend: _0x367833,
  onParkSuspend: _0x425326,
  onResume: _0x4998d9,
  suspendDelayMs = DEFAULT_MEDIA_RESIDENCY_SUSPEND_DELAY_MS,
  presentedMediaLeaseMs = DEFAULT_PRESENTED_MEDIA_LEASE_MS,
  maxRetainedPresentedMedia = DEFAULT_MAX_RETAINED_PRESENTED_MEDIA
} = {}) {
  const _0x5474a1 = new Map();
  const _0x346167 = new Map();
  const _0x3caf4c = Math.max(0, Number(suspendDelayMs) || 0);
  const _0xf1343 = Math.max(0, Number(presentedMediaLeaseMs) || 0);
  const _0x18387b = Math.max(0, Math.trunc(Number(maxRetainedPresentedMedia) || 0));
  const _0x347a2f = isRendererRuntimeDiagnosticsEnabled();
  function _0x33e35a(_0x210298) {
    if (!_0x210298 || _0x210298.timer === null) {
      return;
    }
    clearTimeout(_0x210298.timer);
    _0x210298.timer = null;
  }
  function _0x14c95d(_0x5932f9) {
    if (!_0x5932f9 || _0x5932f9.presentedLeaseTimer === null) {
      return;
    }
    clearTimeout(_0x5932f9.presentedLeaseTimer);
    _0x5932f9.presentedLeaseTimer = null;
  }
  function _0x1748b7(_0x1676ea) {
    _0x14c95d(_0x346167.get(_0x1676ea));
    _0x346167.delete(_0x1676ea);
  }
  function _0x548382(_0x22e709, _0xa3be8e, _0x5b8ba0) {
    return _0x14c977?.(_0x22e709, _0xa3be8e, _0x5b8ba0) === true || _0x41194b?.(_0x22e709, _0xa3be8e, _0x5b8ba0) === true;
  }
  function _0x2ecb11(_0x1744d5, _0xf5da03) {
    if (!_0xf5da03 || _0xf5da03.timer !== null) {
      return;
    }
    _0xf5da03.timer = setTimeout(() => {
      _0xf5da03.timer = null;
      if (_0xf5da03.withinResidency) {
        return;
      }
      const _0x453334 = _0xf5da03.parked === true;
      if (!_0x453334 && !_0xe7aba8?.(_0x1744d5)) {
        return;
      }
      const _0x2ab5a9 = _0x17d2dd?.(_0x1744d5);
      const _0x42db81 = _0x43bebb?.(_0x1744d5);
      if (!_0x2ab5a9 || _0x2ab5a9._rendererMediaDeferred === true) {
        return;
      }
      if (_0x548382(_0x1744d5, _0x2ab5a9, _0x42db81)) {
        _0x2ecb11(_0x1744d5, _0xf5da03);
        return;
      }
      _0x1748b7(_0x1744d5);
      if (_0x453334) {
        _0x425326?.(_0x1744d5, _0x2ab5a9, _0x42db81);
        _0x5474a1.delete(_0x1744d5);
        return;
      }
      const _0x5296ef = _0x347a2f ? nowMs() : 0;
      const _0x58f306 = _0x367833?.(_0x1744d5, _0x2ab5a9, _0x42db81);
      if (_0x347a2f) {
        recordRendererRuntimeDiagnostic({
          kind: "video-media-suspend",
          nodeId: _0x1744d5,
          suspended: _0x58f306 !== false,
          durationMs: nowMs() - _0x5296ef
        });
      }
      if (_0x58f306 === false && !_0xf5da03.withinResidency && _0xe7aba8?.(_0x1744d5)) {
        _0x2ecb11(_0x1744d5, _0xf5da03);
      }
    }, _0x3caf4c);
  }
  function _0x50fdac() {
    const _0x47548b = _0x346167.keys().next().value;
    if (!_0x47548b) {
      return false;
    }
    const _0x3c30c3 = _0x5474a1.get(_0x47548b);
    _0x1748b7(_0x47548b);
    if (!_0x3c30c3 || _0x3c30c3.withinResidency) {
      return true;
    }
    _0x2ecb11(_0x47548b, _0x3c30c3);
    return true;
  }
  function _0x42789a() {
    while (_0x346167.size > _0x18387b) {
      if (!_0x50fdac()) {
        break;
      }
    }
  }
  function _0x4a794b(_0x160215, _0xd1e88e) {
    _0x33e35a(_0xd1e88e);
    _0x1748b7(_0x160215);
    _0x346167.set(_0x160215, _0xd1e88e);
    _0xd1e88e.presentedLeaseTimer = setTimeout(() => {
      _0xd1e88e.presentedLeaseTimer = null;
      if (_0x346167.get(_0x160215) !== _0xd1e88e) {
        return;
      }
      _0x346167.delete(_0x160215);
      if (_0xd1e88e.withinResidency) {
        return;
      }
      _0x2ecb11(_0x160215, _0xd1e88e);
    }, _0xf1343);
    _0x42789a();
  }
  function _0x30d719(_0x3bc1cb) {
    let _0xbb7161 = _0x5474a1.get(_0x3bc1cb);
    if (!_0xbb7161) {
      _0xbb7161 = {
        timer: null,
        presentedLeaseTimer: null,
        withinResidency: false,
        initialized: false,
        parked: false,
        leaseKey: ""
      };
      _0x5474a1.set(_0x3bc1cb, _0xbb7161);
    }
    return _0xbb7161;
  }
  function _0x7096fd(_0x926ff1, {
    withinResidency = false,
    leaseKey = ""
  } = {}) {
    if (!_0x926ff1) {
      return;
    }
    const _0x460cc6 = _0x30d719(_0x926ff1);
    const _0x217f37 = String(leaseKey || "");
    const _0x35f50c = _0x460cc6.initialized === true && _0x460cc6.leaseKey !== _0x217f37;
    if (_0x35f50c) {
      _0x1748b7(_0x926ff1);
      _0x33e35a(_0x460cc6);
    }
    const _0x5bc73e = _0x460cc6.withinResidency;
    const _0x5b375a = _0x460cc6.initialized;
    _0x460cc6.initialized = true;
    _0x460cc6.parked = false;
    _0x460cc6.leaseKey = _0x217f37;
    _0x460cc6.withinResidency = withinResidency === true;
    if (_0x460cc6.withinResidency) {
      _0x1748b7(_0x926ff1);
      _0x33e35a(_0x460cc6);
      const _0x551956 = _0x17d2dd?.(_0x926ff1);
      if (_0xe7aba8?.(_0x926ff1) && _0x551956?._rendererMediaDeferred === true) {
        const _0x905f4 = _0x347a2f ? nowMs() : 0;
        const _0x35b713 = _0x4998d9?.(_0x926ff1, _0x551956, _0x43bebb?.(_0x926ff1));
        if (_0x347a2f) {
          recordRendererRuntimeDiagnostic({
            kind: "video-media-resume",
            nodeId: _0x926ff1,
            resumed: _0x35b713 !== false,
            durationMs: nowMs() - _0x905f4
          });
        }
      }
      return;
    }
    if (!_0xe7aba8?.(_0x926ff1)) {
      _0x33e35a(_0x460cc6);
      return;
    }
    if (_0x18387b > 0 && _0xf1343 > 0 && (_0x35f50c || !_0x5b375a || _0x5bc73e) && _0x36c5bd?.(_0x926ff1, _0x17d2dd?.(_0x926ff1), _0x43bebb?.(_0x926ff1)) === true) {
      _0x4a794b(_0x926ff1, _0x460cc6);
      return;
    }
    if (_0x346167.has(_0x926ff1)) {
      return;
    }
    _0x2ecb11(_0x926ff1, _0x460cc6);
  }
  function _0xff51e5(_0x454f0d, {
    retainPresentedMedia = false,
    leaseKey = ""
  } = {}) {
    if (!_0x454f0d) {
      return;
    }
    const _0x239f2f = _0x30d719(_0x454f0d);
    _0x33e35a(_0x239f2f);
    _0x1748b7(_0x454f0d);
    _0x239f2f.initialized = true;
    _0x239f2f.withinResidency = false;
    _0x239f2f.parked = true;
    _0x239f2f.leaseKey = String(leaseKey || "");
    const _0x314f40 = _0x17d2dd?.(_0x454f0d);
    const _0x3977cd = _0x43bebb?.(_0x454f0d);
    if (retainPresentedMedia === true && _0x18387b > 0 && _0xf1343 > 0 && !_0x548382(_0x454f0d, _0x314f40, _0x3977cd)) {
      _0x4a794b(_0x454f0d, _0x239f2f);
      return;
    }
    if (_0x548382(_0x454f0d, _0x314f40, _0x3977cd)) {
      _0x2ecb11(_0x454f0d, _0x239f2f);
      return;
    }
    _0x425326?.(_0x454f0d, _0x314f40, _0x3977cd);
    _0x5474a1.delete(_0x454f0d);
  }
  function _0x833b21(_0x4b9bf7) {
    const _0x2c09dc = _0x5474a1.get(_0x4b9bf7);
    if (!_0x2c09dc || _0x2c09dc.parked !== true) {
      return;
    }
    _0x33e35a(_0x2c09dc);
    _0x1748b7(_0x4b9bf7);
    _0x2c09dc.parked = false;
  }
  function _0x1bb74a(_0x4ff42b) {
    const _0x3d2d54 = _0x5474a1.get(_0x4ff42b);
    if (!_0x3d2d54 || _0x3d2d54.withinResidency) {
      return true;
    }
    const _0x4e2227 = _0x17d2dd?.(_0x4ff42b);
    const _0x23d154 = _0x43bebb?.(_0x4ff42b);
    return _0x548382(_0x4ff42b, _0x4e2227, _0x23d154);
  }
  function _0x239b68(_0x236273) {
    const _0x34e44c = _0x5474a1.get(_0x236273);
    _0x33e35a(_0x34e44c);
    _0x1748b7(_0x236273);
    _0x5474a1.delete(_0x236273);
  }
  function _0x288235() {
    for (const _0x35e279 of _0x5474a1.values()) {
      _0x33e35a(_0x35e279);
      _0x14c95d(_0x35e279);
    }
    _0x346167.clear();
    _0x5474a1.clear();
  }
  function _0x233135() {
    return _0x346167.size;
  }
  return Object.freeze({
    clear: _0x288235,
    forget: _0x239b68,
    getRetainedPresentedMediaCount: _0x233135,
    isHydrationAllowed: _0x1bb74a,
    park: _0xff51e5,
    sync: _0x7096fd,
    unpark: _0x833b21
  });
}
export const __rendererVideoMediaResidencyForTest = Object.freeze({
  DEFAULT_MEDIA_RESIDENCY_SUSPEND_DELAY_MS: DEFAULT_MEDIA_RESIDENCY_SUSPEND_DELAY_MS,
  DEFAULT_PRESENTED_MEDIA_LEASE_MS: DEFAULT_PRESENTED_MEDIA_LEASE_MS,
  DEFAULT_MAX_RETAINED_PRESENTED_MEDIA: DEFAULT_MAX_RETAINED_PRESENTED_MEDIA
});