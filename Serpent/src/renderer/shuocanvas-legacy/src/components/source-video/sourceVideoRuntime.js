import a513_0x12dd69 from "../../core/stores/appStore.js";
import { t } from "../../i18n/index.js";
import { desktopBridge } from "../../services/desktopBridge.js";
import { readViewportInteractionState } from "../../core/viewportInteractionState.js";
import { RENDERER_VIRTUALIZATION_CONFIG } from "../../core/rendererVirtualization.js";
const SOURCE_VIDEO_IDLE_MEDIA_TIMEOUT_MS = 120;
const SOURCE_VIDEO_BUSY_RETRY_MS = 80;
const SOURCE_VIDEO_MAX_BUSY_WAIT_MS = 3600;
export function sourceVideoText(_0x1a48b9, _0x3a8dda = {}) {
  return t("sourceVideoNode." + _0x1a48b9, _0x3a8dda);
}
export function isDesktopRenderer() {
  return desktopBridge.isElectron || desktopBridge.isChromeShell;
}
export function shouldEagerLoadSourceVideoAtCurrentZoom() {
  let _0x5f2c7c = 1;
  try {
    const _0x46ac3f = typeof a513_0x12dd69.getStateRaw === "function" ? a513_0x12dd69.getStateRaw() : a513_0x12dd69.getState?.();
    const _0x41bc2d = Number(_0x46ac3f?.viewport?.zoom);
    if (Number.isFinite(_0x41bc2d) && _0x41bc2d > 0) {
      _0x5f2c7c = _0x41bc2d;
    }
  } catch {}
  return _0x5f2c7c > RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold;
}
export function isClientFetchableMediaUrl(_0x2a7d71) {
  const _0x1da0d1 = String(_0x2a7d71 || "").trim();
  return /^https?:\/\//i.test(_0x1da0d1) || _0x1da0d1.startsWith("blob:") || _0x1da0d1.startsWith("data:") || _0x1da0d1.startsWith("/") && !_0x1da0d1.startsWith("//");
}
function getSourceVideoSchedulerNow() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
export function isSourceVideoInteractionBusy() {
  return readViewportInteractionState().isViewportBusy;
}
export function hasSourceVideoRecoveryWork(_0x419b2a = {}) {
  return !!String(_0x419b2a?.rhTaskId || "").trim() || !!String(_0x419b2a?.asyncTaskId || "").trim() || _0x419b2a?.rhTaskRecovering === true || _0x419b2a?.asyncTaskRecovering === true;
}
export function scheduleSourceVideoIdleTask(_0x1fb114, {
  timeout = SOURCE_VIDEO_IDLE_MEDIA_TIMEOUT_MS
} = {}) {
  if (typeof _0x1fb114 !== "function") {
    return () => {};
  }
  let _0x522535 = false;
  let _0x4bf657 = () => {};
  const _0xe532d6 = getSourceVideoSchedulerNow();
  const _0x5d3352 = globalThis.window?.requestIdleCallback || globalThis.requestIdleCallback;
  const _0xb75702 = globalThis.window?.cancelIdleCallback || globalThis.cancelIdleCallback;
  function _0x1f6f14(_0x42e081) {
    const _0x4135b4 = setTimeout(_0x29f265, _0x42e081);
    _0x4bf657 = () => clearTimeout(_0x4135b4);
  }
  const _0x29f265 = () => {
    if (_0x522535) {
      return;
    }
    const _0x5730a2 = getSourceVideoSchedulerNow() - _0xe532d6;
    if (isSourceVideoInteractionBusy() && _0x5730a2 < SOURCE_VIDEO_MAX_BUSY_WAIT_MS) {
      _0x1f6f14(SOURCE_VIDEO_BUSY_RETRY_MS);
      return;
    }
    _0x1fb114();
  };
  if (typeof _0x5d3352 === "function") {
    const _0x136224 = _0x5d3352(_0x29f265, {
      timeout: timeout
    });
    _0x4bf657 = () => {
      if (typeof _0xb75702 === "function") {
        _0xb75702(_0x136224);
      }
    };
  } else {
    _0x1f6f14(16);
  }
  return () => {
    _0x522535 = true;
    _0x4bf657();
  };
}
export function shouldFetchVideoMetaForNodeInfo() {
  try {
    const _0xe2fbb9 = typeof a513_0x12dd69.getStateRaw === "function" ? a513_0x12dd69.getStateRaw() : a513_0x12dd69.getState();
    return _0xe2fbb9?.ui?.showVideoMeta === true;
  } catch {
    return false;
  }
}