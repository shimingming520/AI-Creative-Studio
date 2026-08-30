const DEFAULT_PRIORITY_COOLDOWN_MS = 56;
const DEFAULT_LONG_FRAME_THRESHOLD_MS = 50;
const DEFAULT_MAX_NON_PRIORITY_BLOCK_MS = 160;
function getWindowLike() {
  if (typeof window !== "undefined") {
    return window;
  } else {
    return globalThis;
  }
}
function defaultNow() {
  return Number(globalThis.performance?.now?.() || Date.now());
}
function defaultRequestFrame(_0x19a795) {
  const _0x538c58 = getWindowLike();
  if (typeof _0x538c58?.requestAnimationFrame === "function") {
    return _0x538c58.requestAnimationFrame(_0x19a795);
  }
  return setTimeout(() => _0x19a795(defaultNow()), 16);
}
function defaultCancelFrame(_0x15db55) {
  const _0x2120c0 = getWindowLike();
  if (typeof _0x2120c0?.cancelAnimationFrame === "function") {
    _0x2120c0.cancelAnimationFrame(_0x15db55);
    return;
  }
  clearTimeout(_0x15db55);
}
export function createRendererVideoHydrationBackpressure({
  now = defaultNow,
  requestFrame = defaultRequestFrame,
  cancelFrame = defaultCancelFrame,
  priorityCooldownMs = DEFAULT_PRIORITY_COOLDOWN_MS,
  longFrameThresholdMs = DEFAULT_LONG_FRAME_THRESHOLD_MS,
  maxNonPriorityBlockMs = DEFAULT_MAX_NON_PRIORITY_BLOCK_MS
} = {}) {
  let _0x3e4720 = true;
  let _0x125434 = null;
  let _0x4ae403 = null;
  let _0x2407e7 = 0;
  let _0x5dfed8 = 0;
  let _0x4ff371 = true;
  let _0x20180c = null;
  let _0x181654 = false;
  const _0x4f1d64 = () => {
    if (_0x125434 !== null) {
      return;
    }
    _0x125434 = requestFrame(() => {
      _0x125434 = null;
      _0x3e4720 = true;
    });
  };
  const _0x2e2243 = () => {
    if (_0x4ae403 !== null) {
      return;
    }
    _0x4ae403 = requestFrame(() => {
      _0x4ae403 = null;
      const _0x4bcbcf = Number(now()) || 0;
      const _0x3ec6e2 = Math.max(0, _0x4bcbcf - _0x5dfed8);
      _0x5dfed8 = _0x4bcbcf;
      const _0x14025d = _0x20180c === null ? 0 : Math.max(0, _0x4bcbcf - _0x20180c);
      if (_0x4bcbcf >= _0x2407e7 && (_0x3ec6e2 <= Math.max(16, Number(longFrameThresholdMs) || 0) || _0x14025d >= Math.max(0, Number(maxNonPriorityBlockMs) || 0))) {
        _0x4ff371 = true;
        _0x181654 = true;
        return;
      }
      _0x2e2243();
    });
  };
  function _0x16c1f5() {
    const _0x7289d7 = Number(now()) || 0;
    if (_0x181654) {
      return;
    }
    if (_0x20180c === null) {
      _0x20180c = _0x7289d7;
    }
    _0x2407e7 = Math.max(_0x2407e7, _0x7289d7 + Math.max(0, Number(priorityCooldownMs) || 0));
    _0x5dfed8 = _0x7289d7;
    _0x4ff371 = false;
    _0x2e2243();
  }
  function _0x40b808({
    priority = false
  } = {}) {
    if (priority) {
      _0x16c1f5();
      return true;
    }
    if (!_0x181654 && (!_0x4ff371 || (Number(now()) || 0) < _0x2407e7)) {
      return false;
    }
    if (!_0x3e4720) {
      return false;
    }
    _0x3e4720 = false;
    if (_0x181654) {
      _0x181654 = false;
      _0x20180c = null;
      _0x2407e7 = 0;
      _0x4ff371 = true;
    }
    _0x4f1d64();
    return true;
  }
  function _0x577d9c() {
    if (_0x125434 !== null) {
      cancelFrame(_0x125434);
    }
    if (_0x4ae403 !== null) {
      cancelFrame(_0x4ae403);
    }
    _0x125434 = null;
    _0x4ae403 = null;
    _0x2407e7 = 0;
    _0x5dfed8 = 0;
    _0x4ff371 = true;
    _0x20180c = null;
    _0x181654 = false;
    _0x3e4720 = true;
  }
  return {
    markPriorityWork: _0x16c1f5,
    reset: _0x577d9c,
    tryAcquire: _0x40b808
  };
}
export const __rendererVideoHydrationBackpressureForTest = {
  DEFAULT_LONG_FRAME_THRESHOLD_MS: DEFAULT_LONG_FRAME_THRESHOLD_MS,
  DEFAULT_MAX_NON_PRIORITY_BLOCK_MS: DEFAULT_MAX_NON_PRIORITY_BLOCK_MS,
  DEFAULT_PRIORITY_COOLDOWN_MS: DEFAULT_PRIORITY_COOLDOWN_MS
};