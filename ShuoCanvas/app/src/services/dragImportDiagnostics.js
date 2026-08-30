import { desktopBridge } from "./desktopBridge.js";
const ENABLED_GLOBAL_FLAG = "__AI_CANVAS_DRAG_IMPORT_PROFILING__";
const ENABLED_STORAGE_KEY = "aic:dragImportProfile";
const ENABLED_QUERY_KEY = "aicDragImportProfile";
function isTruthyFlag(_0x53f25a) {
  const _0x7e6ee9 = String(_0x53f25a || "").trim().toLowerCase();
  return _0x7e6ee9 === "1" || _0x7e6ee9 === "true" || _0x7e6ee9 === "yes" || _0x7e6ee9 === "on";
}
export function isDragImportProfilingEnabled() {
  try {
    if (globalThis[ENABLED_GLOBAL_FLAG] === true) {
      return true;
    }
    const _0x183bf8 = globalThis.window;
    if (_0x183bf8?.[ENABLED_GLOBAL_FLAG] === true) {
      return true;
    }
    const _0xfa76f6 = new URLSearchParams(String(_0x183bf8?.location?.search || ""));
    if (isTruthyFlag(_0xfa76f6.get(ENABLED_QUERY_KEY))) {
      return true;
    }
    if (isTruthyFlag(_0x183bf8?.localStorage?.getItem?.(ENABLED_STORAGE_KEY))) {
      return true;
    }
  } catch {}
  return false;
}
export function logDragImportProfile(_0x45ac06, _0x137a91 = {}) {
  if (!isDragImportProfilingEnabled()) {
    return;
  }
  try {
    const _0x160f93 = {
      t: Math.round(globalThis.performance?.now?.() || 0),
      ...(_0x137a91 && typeof _0x137a91 === "object" ? _0x137a91 : {})
    };
    console.debug?.("[drag-import-prof] " + _0x45ac06, _0x160f93);
    if (desktopBridge.diagnostics.isAvailable()) {
      desktopBridge.diagnostics.logEvent({
        type: "import.drag_profile",
        level: "debug",
        source: "renderer",
        message: "Drag import profile",
        context: {
          label: _0x45ac06,
          ..._0x160f93
        }
      });
    }
  } catch {}
}