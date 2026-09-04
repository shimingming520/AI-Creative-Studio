export const CHROME_SHELL_STARTUP_READY_EVENT = "renderer.chrome_shell_startup_ready";
export const DEFAULT_CHROME_SHELL_STARTUP_READY_DELAY_MS = 1500;
export const CHROME_SHELL_STARTUP_ATTEMPT_ID_PARAM = "aicStartupAttemptId";
export const CHROME_SHELL_STARTUP_READY_TIMEOUT_MS_PARAM = "aicStartupReadyTimeoutMs";
const MIN_STARTUP_ATTEMPT_ID_LENGTH = 16;
const MAX_STARTUP_ATTEMPT_ID_LENGTH = 128;
const MIN_STARTUP_READY_TIMEOUT_MS = 1000;
const MAX_STARTUP_READY_TIMEOUT_MS = 120000;
const MAX_PENDING_READY_REPORTS = 2;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
export function isChromeShellRuntimeHref(_0x54f553) {
  try {
    const _0x49a557 = new URL(String(_0x54f553 || ""));
    return LOOPBACK_HOSTS.has(_0x49a557.hostname) && _0x49a557.searchParams.get("aicRuntime") === "chrome-shell";
  } catch {
    return false;
  }
}
export function isChromeShellStartupAttemptId(_0x4b2a95) {
  if (typeof _0x4b2a95 !== "string") {
    return false;
  }
  const _0x574ff5 = _0x4b2a95;
  return _0x574ff5.length >= MIN_STARTUP_ATTEMPT_ID_LENGTH && _0x574ff5.length <= MAX_STARTUP_ATTEMPT_ID_LENGTH && /^[A-Za-z0-9_-]+$/.test(_0x574ff5);
}
function normalizeStartupReadyTimeoutMs(_0x2cf22e) {
  const _0x5a6c5d = Number(_0x2cf22e);
  if (!Number.isInteger(_0x5a6c5d) || _0x5a6c5d < MIN_STARTUP_READY_TIMEOUT_MS || _0x5a6c5d > MAX_STARTUP_READY_TIMEOUT_MS) {
    return null;
  }
  return _0x5a6c5d;
}
function readNavigationElapsedMs(_0x46d9a2) {
  try {
    const _0x31316f = Number(_0x46d9a2?.performance?.now?.());
    if (Number.isFinite(_0x31316f) && _0x31316f >= 0) {
      return _0x31316f;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
export function buildChromeShellStartupMetadataUrl(_0x26e6ee, {
  startupAttemptId: _0x36bf54,
  readyTimeoutMs: _0x204ae
} = {}) {
  if (!isChromeShellStartupAttemptId(_0x36bf54)) {
    throw new TypeError("Invalid Chrome shell startup attempt id");
  }
  const _0x4a494a = normalizeStartupReadyTimeoutMs(_0x204ae);
  if (_0x4a494a == null) {
    throw new RangeError("Invalid Chrome shell startup ready timeout");
  }
  const _0x24672f = new URL(String(_0x26e6ee || ""));
  _0x24672f.searchParams.set(CHROME_SHELL_STARTUP_ATTEMPT_ID_PARAM, _0x36bf54);
  _0x24672f.searchParams.set(CHROME_SHELL_STARTUP_READY_TIMEOUT_MS_PARAM, String(_0x4a494a));
  return _0x24672f.href;
}
export function readChromeShellStartupMetadata(_0xd8c8e8) {
  if (!isChromeShellRuntimeHref(_0xd8c8e8)) {
    return null;
  }
  try {
    const _0x226c57 = new URL(String(_0xd8c8e8 || ""));
    const _0x1ad33b = String(_0x226c57.searchParams.get(CHROME_SHELL_STARTUP_ATTEMPT_ID_PARAM) || "");
    const _0xd31f2 = String(_0x226c57.searchParams.get(CHROME_SHELL_STARTUP_READY_TIMEOUT_MS_PARAM) || "");
    const _0x120340 = /^(?:[1-9]\d*)$/.test(_0xd31f2) ? normalizeStartupReadyTimeoutMs(_0xd31f2) : null;
    if (!isChromeShellStartupAttemptId(_0x1ad33b) || _0x120340 == null) {
      return null;
    }
    return {
      startupAttemptId: _0x1ad33b,
      readyTimeoutMs: _0x120340
    };
  } catch {
    return null;
  }
}
export function scheduleChromeShellStartupReady({
  windowObject = globalThis.window,
  diagnostics: _0x1a2b14,
  delayMs = DEFAULT_CHROME_SHELL_STARTUP_READY_DELAY_MS,
  retryDelayMs = 750,
  maxAttempts: _0x459156,
  setTimeoutFn = setTimeout
} = {}) {
  const _0x24df35 = String(windowObject?.location?.href || "");
  const _0x51838e = readChromeShellStartupMetadata(_0x24df35);
  if (!_0x51838e) {
    return null;
  }
  if (typeof _0x1a2b14?.logEvent !== "function") {
    return null;
  }
  const _0x578eeb = Math.max(100, Math.min(5000, Number(retryDelayMs) || 0));
  const _0x4d6d70 = Math.max(0, Math.min(10000, Number(delayMs) || 0));
  const _0x495f72 = Math.min(_0x51838e.readyTimeoutMs - 1, Math.max(0, readNavigationElapsedMs(windowObject) || 0));
  const _0x89678d = Math.max(1, _0x51838e.readyTimeoutMs - _0x495f72);
  const _0x78ee64 = Math.min(_0x4d6d70, Math.max(0, _0x89678d - _0x578eeb));
  const _0x248bcb = Math.max(1, Math.ceil((_0x89678d - _0x78ee64) / _0x578eeb));
  const _0x1d0599 = _0x459156 == null ? _0x248bcb : Math.min(_0x248bcb, Math.max(1, Math.round(Number(_0x459156) || 0)));
  let _0x1ead72 = false;
  let _0x3146d3 = 0;
  let _0xb4ee08 = 0;
  let _0x22a256 = false;
  windowObject?.addEventListener?.("pagehide", () => {
    _0x22a256 = true;
  }, {
    once: true
  });
  function _0xda27d3(_0x4879ba) {
    if (_0x4879ba >= _0x248bcb || _0xb4ee08 >= _0x1d0599) {
      return;
    }
    Promise.resolve().then(() => {
      if (_0x1ead72 || _0x22a256 || _0xb4ee08 >= _0x1d0599) {
        return;
      }
      setTimeoutFn(() => _0x1a02f1(_0x4879ba + 1), _0x578eeb);
    });
  }
  function _0x1a02f1(_0x5540f9) {
    if (_0x1ead72 || _0x22a256 || _0x5540f9 > _0x248bcb) {
      return;
    }
    const _0x194ac2 = readNavigationElapsedMs(windowObject);
    if (_0x194ac2 != null && _0x194ac2 >= _0x51838e.readyTimeoutMs) {
      return;
    }
    if (_0x3146d3 >= MAX_PENDING_READY_REPORTS || _0xb4ee08 >= _0x1d0599) {
      _0xda27d3(_0x5540f9);
      return;
    }
    const _0x381d1c = _0xb4ee08 + 1;
    _0xb4ee08 = _0x381d1c;
    let _0x22a47c;
    try {
      _0x22a47c = _0x1a2b14.logEvent({
        type: CHROME_SHELL_STARTUP_READY_EVENT,
        level: "info",
        source: "renderer",
        message: "Chrome shell renderer completed startup",
        context: {
          attempt: _0x381d1c,
          href: _0x24df35,
          navigationElapsedMs: _0x495f72,
          readyTimeoutMs: _0x51838e.readyTimeoutMs,
          remainingTimeoutMs: _0x89678d,
          startupAttemptId: _0x51838e.startupAttemptId,
          userAgent: String(windowObject?.navigator?.userAgent || "")
        }
      });
    } catch {
      _0x22a47c = null;
    }
    if (_0x22a47c?.startupReadyAccepted === true) {
      _0x1ead72 = true;
      return;
    }
    _0x3146d3 += 1;
    Promise.resolve(_0x22a47c).then(_0x484f48 => {
      if (_0x484f48?.startupReadyAccepted === true) {
        _0x1ead72 = true;
      }
    }).catch(() => {}).finally(() => {
      _0x3146d3 = Math.max(0, _0x3146d3 - 1);
    });
    _0xda27d3(_0x5540f9);
  }
  return setTimeoutFn(() => _0x1a02f1(1), _0x78ee64);
}