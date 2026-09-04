import { desktopBridge } from "./desktopBridge.js";
let installed = false;
function isDesktopRenderer() {
  return desktopBridge.isElectron || desktopBridge.isChromeShell;
}
function dispatchRendererWake(_0x3edc1f = "wake") {
  try {
    window.dispatchEvent(new CustomEvent("aicanvas:desktop-media-wake", {
      detail: {
        reason: _0x3edc1f
      }
    }));
  } catch {}
}
export function initDesktopMediaWakeService() {
  if (installed || !isDesktopRenderer()) {
    return;
  }
  installed = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      dispatchRendererWake("visibilitychange");
    }
  });
  window.addEventListener("focus", () => dispatchRendererWake("focus"));
  window.addEventListener("pageshow", () => dispatchRendererWake("pageshow"));
}
export const __desktopMediaWakeServiceForTest = {
  dispatchRendererWake: dispatchRendererWake
};