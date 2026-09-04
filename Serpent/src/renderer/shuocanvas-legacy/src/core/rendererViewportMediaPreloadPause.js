import { setCanvasMediaSchedulerPaused } from "../modules/canvasMediaScheduler.js";
const DEFAULT_RENDERER_VIEWPORT_MEDIA_PRELOAD_AUTO_RESUME_MS = 900;
const ACTIVE_VIEWPORT_RECHECK_MS = 180;
let rendererViewportMediaPreloadsPaused = false;
let rendererViewportMediaPreloadResumeTimer = 0;
function clearRendererViewportMediaPreloadResumeTimer() {
  if (!rendererViewportMediaPreloadResumeTimer) {
    return;
  }
  clearTimeout(rendererViewportMediaPreloadResumeTimer);
  rendererViewportMediaPreloadResumeTimer = 0;
}
function isViewportBodyBusy() {
  const _0x524575 = typeof document !== "undefined" ? document?.body?.classList : null;
  return Boolean(_0x524575?.contains?.("is-panning") || _0x524575?.contains?.("is-zooming") || _0x524575?.contains?.("is-viewport-animating"));
}
function scheduleRendererViewportMediaPreloadResume(_0x11b1b0) {
  clearRendererViewportMediaPreloadResumeTimer();
  const _0x4f8028 = Number.isFinite(Number(_0x11b1b0)) ? Math.max(0, Number(_0x11b1b0)) : DEFAULT_RENDERER_VIEWPORT_MEDIA_PRELOAD_AUTO_RESUME_MS;
  rendererViewportMediaPreloadResumeTimer = setTimeout(() => {
    rendererViewportMediaPreloadResumeTimer = 0;
    if (isViewportBodyBusy()) {
      scheduleRendererViewportMediaPreloadResume(ACTIVE_VIEWPORT_RECHECK_MS);
      return;
    }
    syncRendererViewportMediaPreloadPause(false);
  }, _0x4f8028);
}
export function syncRendererViewportMediaPreloadPause(_0x468230, _0x554246 = {}) {
  const _0xe4e0d6 = _0x468230 === true;
  if (_0xe4e0d6) {
    scheduleRendererViewportMediaPreloadResume(_0x554246.autoResumeMs);
  } else {
    clearRendererViewportMediaPreloadResumeTimer();
  }
  if (rendererViewportMediaPreloadsPaused === _0xe4e0d6) {
    return;
  }
  rendererViewportMediaPreloadsPaused = _0xe4e0d6;
  setCanvasMediaSchedulerPaused(_0xe4e0d6, {
    bypassPriority: 1000,
    source: "renderer-viewport"
  });
}
export function clearRendererViewportMediaPreloadPause() {
  clearRendererViewportMediaPreloadResumeTimer();
  syncRendererViewportMediaPreloadPause(false);
}