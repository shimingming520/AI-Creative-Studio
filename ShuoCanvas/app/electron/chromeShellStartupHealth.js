import { CHROME_SHELL_STARTUP_READY_EVENT, isChromeShellStartupAttemptId, readChromeShellStartupMetadata } from "../src/services/chromeShellStartupReadiness.js";
const DEFAULT_READY_TIMEOUT_MS = 20000;
const MIN_READY_TIMEOUT_MS = 1000;
const MAX_READY_TIMEOUT_MS = 120000;
function createStartupHealthError(_0x464e55, _0x284334) {
  const _0x19bfaf = new Error(_0x464e55);
  _0x19bfaf.code = _0x284334;
  return _0x19bfaf;
}
export function resolveChromeShellStartupReadyTimeoutMs(_0x7fe263 = process.env) {
  const _0x2f8f25 = Number(_0x7fe263?.AIC_CHROME_SHELL_READY_TIMEOUT_MS);
  if (!Number.isFinite(_0x2f8f25) || _0x2f8f25 <= 0) {
    return DEFAULT_READY_TIMEOUT_MS;
  }
  return Math.max(MIN_READY_TIMEOUT_MS, Math.min(MAX_READY_TIMEOUT_MS, Math.round(_0x2f8f25)));
}
export function createChromeShellStartupHealthController({
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  now = () => Date.now()
} = {}) {
  let _0x559ef5 = null;
  let _0x3dcead = null;
  function _0x5532e8(_0x335a37) {
    if (!_0x3dcead) {
      return false;
    }
    const _0x5a54d6 = _0x3dcead;
    _0x3dcead = null;
    clearTimeoutFn(_0x5a54d6.timer);
    _0x5a54d6.reject(_0x335a37);
    return true;
  }
  function _0x3a77b6({
    timeoutMs = DEFAULT_READY_TIMEOUT_MS,
    startupAttemptId: _0x305578
  } = {}) {
    if (!isChromeShellStartupAttemptId(_0x305578)) {
      return Promise.reject(createStartupHealthError("Chrome shell startup attempt ID is invalid", "CHROME_SHELL_STARTUP_ATTEMPT_INVALID"));
    }
    _0x559ef5 = null;
    _0x5532e8(createStartupHealthError("Chrome shell renderer readiness wait was replaced", "CHROME_SHELL_RENDERER_READY_REPLACED"));
    const _0x438e8c = now();
    const _0x5c4a0f = Math.max(MIN_READY_TIMEOUT_MS, Math.min(MAX_READY_TIMEOUT_MS, Math.round(Number(timeoutMs) || 0)));
    return new Promise((_0x3a9514, _0x2c2e82) => {
      const _0x1ac0ef = setTimeoutFn(() => {
        if (!_0x3dcead || _0x3dcead.reject !== _0x2c2e82) {
          return;
        }
        _0x3dcead = null;
        _0x2c2e82(createStartupHealthError("Chrome shell renderer did not become ready within " + _0x5c4a0f + "ms", "CHROME_SHELL_RENDERER_READY_TIMEOUT"));
      }, _0x5c4a0f);
      _0x3dcead = {
        reject: _0x2c2e82,
        resolve: _0x3a9514,
        readyTimeoutMs: _0x5c4a0f,
        startedAt: _0x438e8c,
        startupAttemptId: _0x305578,
        timer: _0x1ac0ef
      };
    });
  }
  function _0x2f509a(_0x3c0b3e = {}) {
    if (_0x3c0b3e?.type !== CHROME_SHELL_STARTUP_READY_EVENT) {
      return false;
    }
    if (_0x3c0b3e?.source !== "renderer") {
      return false;
    }
    const _0x5acb67 = readChromeShellStartupMetadata(_0x3c0b3e?.context?.href);
    if (!_0x5acb67) {
      return false;
    }
    if (_0x3c0b3e?.context?.startupAttemptId !== _0x5acb67.startupAttemptId) {
      return false;
    }
    if (_0x3c0b3e?.context?.readyTimeoutMs !== _0x5acb67.readyTimeoutMs) {
      return false;
    }
    if (!_0x3dcead) {
      return _0x559ef5?.startupAttemptId === _0x5acb67.startupAttemptId && _0x559ef5?.readyTimeoutMs === _0x5acb67.readyTimeoutMs;
    }
    if (_0x5acb67.startupAttemptId !== _0x3dcead.startupAttemptId) {
      return false;
    }
    if (_0x5acb67.readyTimeoutMs !== _0x3dcead.readyTimeoutMs) {
      return false;
    }
    const _0x1ed229 = _0x3dcead;
    _0x3dcead = null;
    _0x559ef5 = {
      readyTimeoutMs: _0x1ed229.readyTimeoutMs,
      startupAttemptId: _0x1ed229.startupAttemptId
    };
    clearTimeoutFn(_0x1ed229.timer);
    _0x1ed229.resolve({
      ready: true,
      elapsedMs: Math.max(0, now() - _0x1ed229.startedAt),
      href: String(_0x3c0b3e?.context?.href || ""),
      startupAttemptId: _0x1ed229.startupAttemptId
    });
    return true;
  }
  function _0x428c39(_0x5a0b44 = "Chrome shell renderer readiness wait was cancelled", {
    startupAttemptId: _0x4a2d8f
  } = {}) {
    if (_0x4a2d8f !== undefined && _0x3dcead?.startupAttemptId !== _0x4a2d8f) {
      return false;
    }
    return _0x5532e8(createStartupHealthError(_0x5a0b44, "CHROME_SHELL_RENDERER_READY_CANCELLED"));
  }
  return {
    cancel: _0x428c39,
    observeDiagnosticEvent: _0x2f509a,
    waitForReady: _0x3a77b6
  };
}
export const __chromeShellStartupHealthForTest = {
  DEFAULT_READY_TIMEOUT_MS: DEFAULT_READY_TIMEOUT_MS,
  MAX_READY_TIMEOUT_MS: MAX_READY_TIMEOUT_MS,
  MIN_READY_TIMEOUT_MS: MIN_READY_TIMEOUT_MS
};