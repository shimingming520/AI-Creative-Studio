export const STARTUP_LOADER_HARD_DEADLINE_MS = 10000;
const STARTUP_LOADER_GUARD_CANCEL_KEY = "__aicCancelStartupLoaderGuard";
function revealAppShell(_0x13a79d) {
  const _0x24b26a = _0x13a79d?.getElementById?.("v2-initial-loader");
  if (!_0x24b26a) {
    return false;
  }
  const _0x30a0c0 = _0x13a79d.getElementById?.("v2-wrap");
  const _0xe3a4ae = _0x13a79d.getElementById?.("v2-canvas") || _0x13a79d.querySelector?.(".v2-canvas");
  if (_0xe3a4ae) {
    _0xe3a4ae.style.transition = "";
  }
  if (_0x30a0c0) {
    _0x30a0c0.style.transition = "";
    _0x30a0c0.style.opacity = "1";
    _0x30a0c0.classList?.remove?.("is-initial-header-locked");
  }
  _0x24b26a.dataset.failOpen = "true";
  _0x24b26a.style.opacity = "0";
  _0x24b26a.style.visibility = "hidden";
  _0x24b26a.remove?.();
  return true;
}
export function cancelStartupLoaderGuard(_0x18bfef = globalThis.window) {
  const _0x286b7b = _0x18bfef?.[STARTUP_LOADER_GUARD_CANCEL_KEY];
  if (typeof _0x286b7b === "function") {
    _0x286b7b();
  }
}
export function installStartupLoaderGuard({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  timeoutMs = STARTUP_LOADER_HARD_DEADLINE_MS,
  scheduleTimeout = globalThis.setTimeout,
  cancelTimeout = globalThis.clearTimeout,
  warn = console.warn
} = {}) {
  cancelStartupLoaderGuard(windowObject);
  if (!windowObject || typeof scheduleTimeout !== "function") {
    return () => {};
  }
  let _0x2c849d = true;
  const _0xdbf4fb = scheduleTimeout(() => {
    if (!_0x2c849d) {
      return;
    }
    _0x2c849d = false;
    delete windowObject[STARTUP_LOADER_GUARD_CANCEL_KEY];
    if (!revealAppShell(documentObject)) {
      return;
    }
    windowObject.hideGlobalLoading?.();
    warn?.("[startup] Initial loader exceeded " + timeoutMs + "ms before startup completed and was dismissed.");
  }, Math.max(0, Number(timeoutMs) || STARTUP_LOADER_HARD_DEADLINE_MS));
  const _0x12ac83 = () => {
    if (!_0x2c849d) {
      return;
    }
    _0x2c849d = false;
    if (typeof cancelTimeout === "function") {
      cancelTimeout(_0xdbf4fb);
    }
    if (windowObject[STARTUP_LOADER_GUARD_CANCEL_KEY] === _0x12ac83) {
      delete windowObject[STARTUP_LOADER_GUARD_CANCEL_KEY];
    }
  };
  windowObject[STARTUP_LOADER_GUARD_CANCEL_KEY] = _0x12ac83;
  return _0x12ac83;
}