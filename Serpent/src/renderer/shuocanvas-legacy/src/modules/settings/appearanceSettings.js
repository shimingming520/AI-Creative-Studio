import { getShortcutLabelByAction } from "./settingsShared.js";
import { runCircularRevealTransition } from "../../utils/circularRevealTransition.js";
import { resolveRendererVirtualizationTier } from "../../core/rendererVirtualization.js";
import { t } from "../../i18n/index.js";
import { CANVAS_TOOLBAR_PLACEMENT_EVENT, normalizeCanvasToolbarPlacement } from "../canvasToolbarPlacement.js";
const FONT_SIZE_MAP = {
  small: "16px",
  medium: "21px",
  large: "26px"
};
const BASE_APP_THEMES = new Set(["dark", "light"]);
const APP_THEME_PRESET_STORAGE_KEY = "v2-app-theme-preset";
const APP_THEME_PRESETS = new Set(["dusk", "dawn", "day"]);
const CURSOR_SIZE_STORAGE_KEY = "v2-cursor-style";
const CURSOR_SIZES = new Set(["small", "medium", "large"]);
const CURSOR_ASSET_PATH = "./images/cursors/windows11-concept-v2/";
const CURSOR_ASSET_FALLBACK_ROOT = "../images/cursors/windows11-concept-v2";
const PROMPT_ACTION_SURFACES = new Set(["transparent", "themed"]);
const LEFT_SIDEBAR_KEYBOARD_FOCUS_CLASS = "left-sidebar-keyboard-focus";
const LEFT_SIDEBAR_REVEAL_GUARD_CLASS = "left-sidebar-auto-hide-revealing";
const LEFT_SIDEBAR_REVEAL_GUARD_MS = 360;
let leftSidebarAutoHideFocusModeDocument = null;
let leftSidebarRevealGuardTimer = 0;
const CURSOR_ROLE_MAP = {
  "--pointer-cursor": {
    file: "pointer",
    fallback: "default"
  },
  "--link-cursor": {
    file: "link",
    fallback: "pointer"
  },
  "--grab-cursor": {
    file: "move",
    fallback: "grab"
  },
  "--grabbing-cursor": {
    file: "move",
    fallback: "grabbing"
  },
  "--text-cursor": {
    file: "beam",
    fallback: "text"
  },
  "--precision-cursor": {
    file: "precision",
    fallback: "crosshair"
  },
  "--move-cursor": {
    file: "move",
    fallback: "move"
  },
  "--help-cursor": {
    file: "help",
    fallback: "help"
  },
  "--unavailable-cursor": {
    file: "unavailable",
    fallback: "not-allowed"
  },
  "--resize-ns-cursor": {
    file: "vert",
    fallback: "ns-resize"
  },
  "--resize-ew-cursor": {
    file: "horz",
    fallback: "ew-resize"
  },
  "--resize-nwse-cursor": {
    file: "dgn1",
    fallback: "nwse-resize"
  },
  "--resize-nesw-cursor": {
    file: "dgn2",
    fallback: "nesw-resize"
  },
  "--alternate-cursor": {
    file: "alternate",
    fallback: "default"
  },
  "--handwriting-cursor": {
    file: "handwriting",
    fallback: "default"
  },
  "--pin-cursor": {
    file: "pin",
    fallback: "pointer"
  },
  "--person-cursor": {
    file: "person",
    fallback: "pointer"
  }
};
const CURSOR_ANIMATED_ROLE_MAP = {
  "--wait-cursor": {
    file: "busy.ani",
    fallback: "wait"
  },
  "--progress-cursor": {
    file: "working.ani",
    fallback: "progress"
  }
};
function shouldBypassThemeRevealTransition(_0x3bed2a) {
  let _0x31d0eb = null;
  try {
    _0x31d0eb = _0x3bed2a?.() || null;
  } catch {
    _0x31d0eb = null;
  }
  return resolveRendererVirtualizationTier({
    viewport: _0x31d0eb?.viewport,
    nodeCount: _0x31d0eb?.nodeCount
  }) === "very-dense-low-zoom";
}
function runThemeRevealTransition(_0x316a5c, _0x43e1c5, {
  getCanvasPresentationContext = null
} = {}) {
  if (shouldBypassThemeRevealTransition(getCanvasPresentationContext)) {
    _0x43e1c5();
    return null;
  }
  return runCircularRevealTransition({
    event: _0x316a5c,
    apply: _0x43e1c5,
    rootClassName: "theme-reveal-transitioning"
  });
}
function normalizeBaseAppTheme(_0x6c3d0) {
  if (BASE_APP_THEMES.has(_0x6c3d0)) {
    return _0x6c3d0;
  } else {
    return "dark";
  }
}
function normalizeAppThemePreset(_0xb98092) {
  if (APP_THEME_PRESETS.has(_0xb98092)) {
    return _0xb98092;
  } else {
    return "dusk";
  }
}
function normalizeCursorSize(_0x3f5b5b) {
  if (CURSOR_SIZES.has(_0x3f5b5b)) {
    return _0x3f5b5b;
  } else {
    return "small";
  }
}
function getBaseThemeForPreset(_0x130640) {
  if (normalizeAppThemePreset(_0x130640) === "day") {
    return "light";
  } else {
    return "dark";
  }
}
function isLightCanvasPreset(_0x29684e) {
  return normalizeAppThemePreset(_0x29684e) !== "dusk";
}
function getCursorThemeForPreset(_0x3d6a5d) {
  if (normalizeAppThemePreset(_0x3d6a5d) === "day") {
    return "dark";
  } else {
    return "light";
  }
}
function getCursorFallbackPreset() {
  return normalizeAppThemePreset(localStorage.getItem(APP_THEME_PRESET_STORAGE_KEY));
}
function resolveCursorAssetRoot() {
  const _0x365941 = String(globalThis.document?.baseURI || "").trim();
  if (!_0x365941) {
    return CURSOR_ASSET_FALLBACK_ROOT;
  }
  try {
    return new URL(CURSOR_ASSET_PATH, _0x365941).href.replace(/\/$/, "");
  } catch {
    return CURSOR_ASSET_FALLBACK_ROOT;
  }
}
function applyCursorStyle({
  size: _0x44d626,
  preset: _0x8d42e
} = {}) {
  const _0x54cfdd = normalizeCursorSize(_0x44d626 || localStorage.getItem(CURSOR_SIZE_STORAGE_KEY));
  const _0x5d8e71 = getCursorThemeForPreset(_0x8d42e || getCursorFallbackPreset());
  const _0x5c0009 = resolveCursorAssetRoot();
  const _0x359e50 = document.documentElement;
  Object.entries(CURSOR_ROLE_MAP).forEach(([_0x5290e8, _0x484dd7]) => {
    _0x359e50.style.setProperty(_0x5290e8, "url('" + _0x5c0009 + "/" + _0x5d8e71 + "/" + _0x484dd7.file + "-" + _0x54cfdd + ".cur'), " + _0x484dd7.fallback);
  });
  Object.entries(CURSOR_ANIMATED_ROLE_MAP).forEach(([_0x55610e, _0x275d55]) => {
    _0x359e50.style.setProperty(_0x55610e, "url('" + _0x5c0009 + "/" + _0x5d8e71 + "/" + _0x275d55.file + "'), " + _0x275d55.fallback);
  });
}
function getUiStoreTheme(_0x4fb46f) {
  try {
    const _0x5b9a17 = _0x4fb46f?.getStateRaw?.() || _0x4fb46f?.getState?.() || {};
    return normalizeBaseAppTheme(_0x5b9a17.theme);
  } catch {
    return "dark";
  }
}
function getSavedAppThemePreset(_0x458212) {
  const _0x122753 = normalizeAppThemePreset(localStorage.getItem(APP_THEME_PRESET_STORAGE_KEY));
  const _0x2693e4 = getUiStoreTheme(_0x458212);
  if (getBaseThemeForPreset(_0x122753) === _0x2693e4) {
    return _0x122753;
  }
  if (_0x2693e4 === "light") {
    return "day";
  } else {
    return "dusk";
  }
}
function syncAppThemeButtons(_0x14a6fa) {
  const _0x3b7a3f = normalizeAppThemePreset(_0x14a6fa);
  document.querySelectorAll(".cursor-size-btn[data-app-theme]").forEach(_0x5b5093 => {
    const _0x310d28 = _0x5b5093.dataset.appTheme === _0x3b7a3f;
    _0x5b5093.classList.toggle("active", _0x310d28);
    _0x5b5093.classList.remove("is-disabled");
    _0x5b5093.setAttribute("aria-disabled", "false");
    _0x5b5093.title = "";
  });
}
function syncCanvasTheme(_0x423aea) {
  const _0x4f53ec = document.getElementById("v2-wrap");
  const _0x3e8c71 = normalizeAppThemePreset(_0x423aea);
  const _0x2dfeec = isLightCanvasPreset(_0x423aea);
  document.documentElement?.classList?.toggle("is-canvas-theme-light", _0x2dfeec);
  if (!_0x4f53ec) {
    return;
  }
  _0x4f53ec.classList.toggle("theme-light", _0x2dfeec);
  APP_THEME_PRESETS.forEach(_0x2ed417 => {
    _0x4f53ec.classList.toggle("canvas-theme-" + _0x2ed417, _0x2ed417 === _0x3e8c71);
  });
}
function normalizePromptActionSurface(_0x90645a) {
  if (PROMPT_ACTION_SURFACES.has(_0x90645a)) {
    return _0x90645a;
  } else {
    return "themed";
  }
}
function applyPromptActionSurface(_0x110501) {
  const _0x4e52e0 = normalizePromptActionSurface(_0x110501);
  localStorage.setItem("v2-prompt-action-surface", _0x4e52e0);
  document.querySelectorAll(".cursor-size-btn[data-prompt-action-surface]").forEach(_0x3716e7 => {
    _0x3716e7.classList.toggle("active", _0x3716e7.dataset.promptActionSurface === _0x4e52e0);
  });
  document.body?.classList.toggle("prompt-action-surface-themed", _0x4e52e0 === "themed");
  const _0x417dfe = document.getElementById("v2-wrap");
  if (!_0x417dfe) {
    return;
  }
  _0x417dfe.classList.toggle("prompt-action-surface-themed", _0x4e52e0 === "themed");
}
function getUiPrefs(_0x558ee5) {
  try {
    const _0x3868ca = _0x558ee5?.getStateRaw?.() || _0x558ee5?.getState?.() || {};
    if (_0x3868ca?.ui && typeof _0x3868ca.ui === "object") {
      return _0x3868ca.ui;
    } else {
      return {};
    }
  } catch {
    return {};
  }
}
function syncButtonPair(_0x1b50b1, _0x285347, _0x450fcb) {
  const _0x361215 = _0x450fcb === true;
  document.getElementById(_0x1b50b1)?.classList.toggle("active", _0x361215);
  document.getElementById(_0x285347)?.classList.toggle("active", !_0x361215);
}
function applyCanvasToolbarPlacement(_0x2106ec) {
  const _0xb6ee7e = normalizeCanvasToolbarPlacement(_0x2106ec);
  const _0x5352d2 = document.getElementById("v2-wrap");
  const _0x58f842 = document.querySelector?.(".sidebar-floating");
  _0x5352d2?.classList.toggle("canvas-toolbar-left", _0xb6ee7e === "left");
  _0x5352d2?.classList.toggle("canvas-toolbar-right", _0xb6ee7e === "right");
  _0x5352d2?.classList.toggle("canvas-toolbar-bottom", _0xb6ee7e === "bottom");
  _0x58f842?.setAttribute("data-tooltip-placement", _0xb6ee7e === "bottom" ? "top" : "right");
  const _0x4aa201 = document.getElementById("btnCanvasToolbarPlacementLeft");
  const _0x4acbd8 = document.getElementById("btnCanvasToolbarPlacementRight");
  const _0x442eab = document.getElementById("btnCanvasToolbarPlacementBottom");
  _0x4aa201?.classList.toggle("active", _0xb6ee7e === "left");
  _0x4acbd8?.classList.toggle("active", _0xb6ee7e === "right");
  _0x442eab?.classList.toggle("active", _0xb6ee7e === "bottom");
  _0x4aa201?.setAttribute("aria-pressed", String(_0xb6ee7e === "left"));
  _0x4acbd8?.setAttribute("aria-pressed", String(_0xb6ee7e === "right"));
  _0x442eab?.setAttribute("aria-pressed", String(_0xb6ee7e === "bottom"));
  if (typeof window?.dispatchEvent === "function" && typeof globalThis.CustomEvent === "function") {
    window.dispatchEvent(new CustomEvent(CANVAS_TOOLBAR_PLACEMENT_EVENT, {
      detail: {
        placement: _0xb6ee7e
      }
    }));
  }
  return _0xb6ee7e;
}
function setCanvasToolbarPlacementPref(_0x26eefb, _0x319bce) {
  const _0x287850 = normalizeCanvasToolbarPlacement(_0x26eefb);
  _0x319bce?.setCanvasToolbarPlacement?.(_0x287850);
  applyCanvasToolbarPlacement(_0x287850);
  return _0x287850;
}
function initCanvasToolbarPlacement({
  uiStore: _0x50b7fb
} = {}) {
  const _0x2b1b68 = document.getElementById("btnCanvasToolbarPlacementLeft");
  const _0x4dc4a2 = document.getElementById("btnCanvasToolbarPlacementRight");
  const _0x2dbd53 = document.getElementById("btnCanvasToolbarPlacementBottom");
  if (!_0x2b1b68 && !_0x4dc4a2 && !_0x2dbd53) {
    return;
  }
  const _0x5a1df3 = _0x2982f7 => applyCanvasToolbarPlacement(_0x2982f7);
  _0x5a1df3(getUiPrefs(_0x50b7fb).canvasToolbarPlacement);
  _0x2b1b68?.addEventListener("click", () => setCanvasToolbarPlacementPref("left", _0x50b7fb));
  _0x4dc4a2?.addEventListener("click", () => setCanvasToolbarPlacementPref("right", _0x50b7fb));
  _0x2dbd53?.addEventListener("click", () => setCanvasToolbarPlacementPref("bottom", _0x50b7fb));
  _0x50b7fb?.subscribeSelector?.(_0x232e2b => normalizeCanvasToolbarPlacement(_0x232e2b.ui?.canvasToolbarPlacement), _0x5a1df3);
}
function syncAutoHidePinButton({
  buttonId: _0x502544,
  autoHideEnabled: _0x275d11,
  pinKey: _0x1af830,
  autoHideKey: _0x31bff6,
  tooltipAttribute: _0x22f329,
  i18nTooltipAttribute: _0x599d08
}) {
  const _0x17098d = document.getElementById(_0x502544);
  if (!_0x17098d) {
    return;
  }
  const _0x392656 = _0x275d11 !== true;
  const _0x44a9b6 = _0x392656 ? _0x31bff6 : _0x1af830;
  const _0x5987d9 = t(_0x44a9b6);
  _0x17098d.classList.toggle("is-pinned", _0x392656);
  _0x17098d.setAttribute("aria-pressed", String(_0x392656));
  _0x17098d.setAttribute("aria-label", _0x5987d9);
  _0x17098d.setAttribute("data-i18n-aria-label", _0x44a9b6);
  _0x17098d.setAttribute(_0x22f329, _0x5987d9);
  _0x17098d.setAttribute(_0x599d08, _0x44a9b6);
}
function applyLeftSidebarAutoHidePref(_0x3c77af) {
  const _0x4e585d = _0x3c77af === true;
  const _0x29e96f = document.getElementById("v2-wrap");
  _0x29e96f?.classList.toggle("left-sidebar-auto-hide", _0x4e585d);
  if (!_0x4e585d) {
    document.body?.classList.remove(LEFT_SIDEBAR_KEYBOARD_FOCUS_CLASS);
    clearLeftSidebarRevealGuard();
  }
  syncButtonPair("btnLeftSidebarAutoHideOn", "btnLeftSidebarAutoHideOff", _0x4e585d);
  syncAutoHidePinButton({
    buttonId: "btnLeftSidebarPin",
    autoHideEnabled: _0x4e585d,
    pinKey: "sidebar.pin",
    autoHideKey: "sidebar.autoHide",
    tooltipAttribute: "data-tooltip-right",
    i18nTooltipAttribute: "data-i18n-tooltip-right"
  });
  return _0x4e585d;
}
function clearLeftSidebarRevealGuard() {
  document.getElementById("v2-wrap")?.classList.remove(LEFT_SIDEBAR_REVEAL_GUARD_CLASS);
  if (leftSidebarRevealGuardTimer && typeof window?.clearTimeout === "function") {
    window.clearTimeout(leftSidebarRevealGuardTimer);
  }
  leftSidebarRevealGuardTimer = 0;
}
function startLeftSidebarRevealGuard() {
  const _0x56a65c = document.getElementById("v2-wrap");
  if (!_0x56a65c?.classList.contains("left-sidebar-auto-hide")) {
    return;
  }
  _0x56a65c.classList.add(LEFT_SIDEBAR_REVEAL_GUARD_CLASS);
  if (leftSidebarRevealGuardTimer && typeof window?.clearTimeout === "function") {
    window.clearTimeout(leftSidebarRevealGuardTimer);
  }
  const _0x21249e = window.setTimeout?.(() => {
    _0x56a65c.classList.remove(LEFT_SIDEBAR_REVEAL_GUARD_CLASS);
    if (leftSidebarRevealGuardTimer === _0x21249e) {
      leftSidebarRevealGuardTimer = 0;
    }
  }, LEFT_SIDEBAR_REVEAL_GUARD_MS);
  leftSidebarRevealGuardTimer = _0x21249e || 0;
}
function initLeftSidebarAutoHideFocusMode() {
  if (leftSidebarAutoHideFocusModeDocument === document) {
    return;
  }
  leftSidebarAutoHideFocusModeDocument = document;
  const _0x329e29 = () => {
    document.body?.classList.remove(LEFT_SIDEBAR_KEYBOARD_FOCUS_CLASS);
  };
  document.addEventListener?.("keydown", _0x73937b => {
    if (_0x73937b?.key !== "Tab") {
      return;
    }
    if (!document.getElementById("v2-wrap")?.classList.contains("left-sidebar-auto-hide")) {
      return;
    }
    document.body?.classList.add(LEFT_SIDEBAR_KEYBOARD_FOCUS_CLASS);
  }, true);
  document.addEventListener?.("pointerdown", _0x329e29, true);
  document.querySelector?.(".sidebar-floating")?.addEventListener?.("focusout", () => {
    window.setTimeout?.(() => {
      if (!document.querySelector?.(".sidebar-floating")?.matches?.(":focus-within")) {
        _0x329e29();
      }
    }, 0);
  });
  const _0x518360 = document.querySelector?.(".left-sidebar-hover-zone");
  _0x518360?.addEventListener?.("pointerenter", startLeftSidebarRevealGuard);
  _0x518360?.addEventListener?.("pointerdown", startLeftSidebarRevealGuard);
}
function applyBottomLeftBarAutoHidePref(_0x4990b3) {
  const _0x3b15ab = _0x4990b3 === true;
  const _0x38bc68 = document.getElementById("v2-wrap");
  _0x38bc68?.classList.toggle("bottom-left-bar-auto-hide", _0x3b15ab);
  syncButtonPair("btnBottomLeftBarAutoHideOn", "btnBottomLeftBarAutoHideOff", _0x3b15ab);
  syncAutoHidePinButton({
    buttonId: "btnBottomLeftBarPin",
    autoHideEnabled: _0x3b15ab,
    pinKey: "canvasControls.pinBar",
    autoHideKey: "canvasControls.autoHideBar",
    tooltipAttribute: "data-tooltip",
    i18nTooltipAttribute: "data-i18n-tooltip"
  });
  return _0x3b15ab;
}
function setLeftSidebarAutoHidePref(_0x46ad11, _0x5a8c1a) {
  const _0x310879 = _0x46ad11 === true;
  if (typeof _0x5a8c1a?.setLeftSidebarAutoHideEnabled === "function") {
    _0x5a8c1a.setLeftSidebarAutoHideEnabled(_0x310879);
  }
  applyLeftSidebarAutoHidePref(_0x310879);
  return _0x310879;
}
function setBottomLeftBarAutoHidePref(_0x371c24, _0x1b1ed2) {
  const _0x2af5f6 = _0x371c24 === true;
  if (typeof _0x1b1ed2?.setBottomLeftBarAutoHideEnabled === "function") {
    _0x1b1ed2.setBottomLeftBarAutoHideEnabled(_0x2af5f6);
  }
  applyBottomLeftBarAutoHidePref(_0x2af5f6);
  return _0x2af5f6;
}
export function initApplicationTheme({
  uiStore: _0x173e3f,
  getCanvasPresentationContext = null
} = {}) {
  let _0x1e8cc0 = getSavedAppThemePreset(_0x173e3f);
  const _0xc51c92 = (_0x465be0 = _0x1e8cc0) => syncAppThemeButtons(_0x465be0);
  const _0x141156 = (_0x2c59a2 = _0x1e8cc0) => {
    _0x1e8cc0 = normalizeAppThemePreset(_0x2c59a2);
    localStorage.setItem(APP_THEME_PRESET_STORAGE_KEY, _0x1e8cc0);
    _0xc51c92(_0x1e8cc0);
    syncCanvasTheme(_0x1e8cc0);
    applyCursorStyle({
      preset: _0x1e8cc0
    });
  };
  const _0x4b0b6a = _0x1cbcea => {
    const _0x99dc05 = normalizeAppThemePreset(_0x1cbcea);
    _0x141156(_0x99dc05);
    const _0x1f4990 = getBaseThemeForPreset(_0x99dc05);
    if (typeof _0x173e3f?.setTheme === "function" && _0x1f4990 !== getUiStoreTheme(_0x173e3f)) {
      _0x173e3f.setTheme(_0x1f4990);
    }
  };
  _0x141156();
  document.querySelectorAll(".cursor-size-btn[data-app-theme]").forEach(_0x496182 => {
    _0x496182.addEventListener("click", _0x5cd498 => {
      const _0x3dd00e = normalizeAppThemePreset(_0x496182.dataset.appTheme);
      if (_0x3dd00e === _0x1e8cc0) {
        _0x4b0b6a(_0x3dd00e);
        return;
      }
      runThemeRevealTransition(_0x5cd498, () => _0x4b0b6a(_0x3dd00e), {
        getCanvasPresentationContext: getCanvasPresentationContext
      });
    });
  });
  if (typeof _0x173e3f?.subscribeSelector === "function") {
    _0x173e3f.subscribeSelector(_0xacf8f0 => _0xacf8f0.theme, _0x41528e => {
      const _0x267e77 = normalizeBaseAppTheme(_0x41528e);
      if (getBaseThemeForPreset(_0x1e8cc0) !== _0x267e77) {
        _0x141156(_0x267e77 === "light" ? "day" : "dusk");
        return;
      }
      _0x141156(_0x1e8cc0);
    });
  }
  window.addEventListener?.("aicanvas:runtime-info", () => _0xc51c92());
}
export function applyGridDotsPref(_0x2846d2) {
  const _0x3768e5 = document.getElementById("v2-wrap");
  if (!_0x3768e5) {
    return;
  }
  _0x3768e5.classList.toggle("has-grid-dots", !!_0x2846d2);
}
export function readGridDotsPref() {
  const _0x217b71 = localStorage.getItem("v2-grid-dots");
  if (_0x217b71 != null) {
    return _0x217b71 === "true" || _0x217b71 === "1";
  }
  localStorage.setItem("v2-grid-dots", "true");
  return true;
}
export function setGridDotsPref(_0x5a7913) {
  const _0x4d1d97 = _0x5a7913 !== false;
  localStorage.setItem("v2-grid-dots", _0x4d1d97 ? "true" : "false");
  applyGridDotsPref(_0x4d1d97);
  const _0xf00f6e = document.getElementById("btnToggleDots");
  const _0x17d5be = document.getElementById("btnGridDotsOn");
  const _0x319463 = document.getElementById("btnGridDotsOff");
  if (_0xf00f6e) {
    _0xf00f6e.classList.toggle("active", _0x4d1d97);
    _0xf00f6e.setAttribute("aria-pressed", _0x4d1d97 ? "true" : "false");
  }
  if (_0x17d5be) {
    _0x17d5be.classList.toggle("active", _0x4d1d97);
  }
  if (_0x319463) {
    _0x319463.classList.toggle("active", !_0x4d1d97);
  }
  return _0x4d1d97;
}
export function applyGridDotsPrefFromStorage() {
  setGridDotsPref(readGridDotsPref());
}
function initCursorSettings() {
  const _0x253cae = _0x33e3a0 => {
    const _0x16f09c = normalizeCursorSize(_0x33e3a0);
    localStorage.setItem(CURSOR_SIZE_STORAGE_KEY, _0x16f09c);
    document.querySelectorAll(".cursor-size-btn[data-size]").forEach(_0x47b817 => {
      _0x47b817.classList.toggle("active", _0x47b817.dataset.size === _0x16f09c);
    });
    applyCursorStyle({
      size: _0x16f09c
    });
  };
  const _0x1185c6 = localStorage.getItem(CURSOR_SIZE_STORAGE_KEY) || "small";
  _0x253cae(_0x1185c6);
  document.querySelectorAll(".cursor-size-btn[data-size]").forEach(_0x298226 => {
    _0x298226.addEventListener("click", () => _0x253cae(_0x298226.dataset.size));
  });
}
function initPromptActionSurface() {
  const _0x323bda = normalizePromptActionSurface(localStorage.getItem("v2-prompt-action-surface"));
  applyPromptActionSurface(_0x323bda);
  document.querySelectorAll(".cursor-size-btn[data-prompt-action-surface]").forEach(_0x48e7a2 => {
    _0x48e7a2.addEventListener("click", () => applyPromptActionSurface(_0x48e7a2.dataset.promptActionSurface));
  });
}
function initAutoHideChromeSettings({
  uiStore: _0x4f43b9
} = {}) {
  const _0x164f8c = document.getElementById("btnLeftSidebarAutoHideOn");
  const _0x32d7c0 = document.getElementById("btnLeftSidebarAutoHideOff");
  const _0xaf3db5 = document.getElementById("btnBottomLeftBarAutoHideOn");
  const _0x38ef00 = document.getElementById("btnBottomLeftBarAutoHideOff");
  const _0x5bb967 = document.getElementById("btnLeftSidebarPin");
  const _0x1f7d81 = document.getElementById("btnBottomLeftBarPin");
  if (!_0x164f8c && !_0x32d7c0 && !_0xaf3db5 && !_0x38ef00 && !_0x5bb967 && !_0x1f7d81) {
    return;
  }
  initLeftSidebarAutoHideFocusMode();
  const _0x5887c7 = getUiPrefs(_0x4f43b9);
  let _0x202507 = _0x5887c7.leftSidebarAutoHideEnabled === true;
  let _0x16b408 = _0x5887c7.bottomLeftBarAutoHideEnabled === true;
  const _0x42283e = _0x5d89a5 => {
    _0x202507 = applyLeftSidebarAutoHidePref(_0x5d89a5);
  };
  const _0xb71ef2 = _0x14a325 => {
    _0x16b408 = applyBottomLeftBarAutoHidePref(_0x14a325);
  };
  const _0x2da2fa = _0x568d7e => {
    _0x202507 = _0x568d7e === true;
    setLeftSidebarAutoHidePref(_0x202507, _0x4f43b9);
  };
  const _0x50d880 = _0x16f00a => {
    _0x16b408 = _0x16f00a === true;
    setBottomLeftBarAutoHidePref(_0x16b408, _0x4f43b9);
  };
  const _0x357670 = _0x768072 => {
    if (Number(_0x768072?.detail) > 0) {
      _0x768072.currentTarget?.blur?.();
    }
  };
  _0x42283e(_0x202507);
  _0xb71ef2(_0x16b408);
  _0x164f8c?.addEventListener("click", () => _0x2da2fa(true));
  _0x32d7c0?.addEventListener("click", () => _0x2da2fa(false));
  _0xaf3db5?.addEventListener("click", () => _0x50d880(true));
  _0x38ef00?.addEventListener("click", () => _0x50d880(false));
  _0x5bb967?.addEventListener("click", _0x2d498f => {
    _0x2da2fa(!_0x202507);
    _0x357670(_0x2d498f);
  });
  _0x1f7d81?.addEventListener("click", _0x30fade => {
    _0x50d880(!_0x16b408);
    _0x357670(_0x30fade);
  });
  if (typeof _0x4f43b9?.subscribeSelector === "function") {
    _0x4f43b9.subscribeSelector(_0x51b09f => _0x51b09f.ui?.leftSidebarAutoHideEnabled === true, _0x42283e);
    _0x4f43b9.subscribeSelector(_0x48d6e4 => _0x48d6e4.ui?.bottomLeftBarAutoHideEnabled === true, _0xb71ef2);
  }
}
function initGridDots() {
  const _0x482f9d = document.getElementById("btnGridDotsOn");
  const _0x2e6420 = document.getElementById("btnGridDotsOff");
  const _0x1e0da3 = document.getElementById("gridDotsShortcutLabel");
  if (!_0x482f9d || !_0x2e6420) {
    return;
  }
  const _0x1e0628 = () => {
    if (!_0x1e0da3) {
      return;
    }
    _0x1e0da3.textContent = getShortcutLabelByAction("grid-dots", ".");
  };
  setGridDotsPref(readGridDotsPref());
  _0x1e0628();
  _0x482f9d.addEventListener("click", () => setGridDotsPref(true));
  _0x2e6420.addEventListener("click", () => setGridDotsPref(false));
  window.addEventListener("shortcuts-updated", _0x1e0628);
}
function initFontSize() {
  const _0x479c96 = _0x2c18c3 => {
    if (!FONT_SIZE_MAP[_0x2c18c3]) {
      _0x2c18c3 = "small";
    }
    localStorage.setItem("v2-input-font-size", _0x2c18c3);
    document.querySelectorAll(".cursor-size-btn[data-fontsize]").forEach(_0x2c0b1d => {
      _0x2c0b1d.classList.toggle("active", _0x2c0b1d.dataset.fontsize === _0x2c18c3);
    });
    document.documentElement.style.setProperty("--prompt-font-size", FONT_SIZE_MAP[_0x2c18c3]);
  };
  const _0x5e3169 = localStorage.getItem("v2-input-font-size") || "small";
  _0x479c96(_0x5e3169);
  document.querySelectorAll(".cursor-size-btn[data-fontsize]").forEach(_0x43be7f => {
    _0x43be7f.addEventListener("click", () => _0x479c96(_0x43be7f.dataset.fontsize));
  });
}
export function initAppearanceSettings(_0xe8be3f = {}) {
  initApplicationTheme({
    uiStore: _0xe8be3f.uiStore,
    getCanvasPresentationContext: _0xe8be3f.getCanvasPresentationContext
  });
  initCursorSettings();
  initPromptActionSurface();
  initCanvasToolbarPlacement({
    uiStore: _0xe8be3f.uiStore
  });
  initAutoHideChromeSettings({
    uiStore: _0xe8be3f.uiStore
  });
  initGridDots();
  initFontSize();
}