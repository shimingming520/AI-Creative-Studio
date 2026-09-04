import { t } from "../../i18n/index.js";
const CONNECTION_LINES_VISIBILITY_EVENT = "v2-connection-lines-visibility-changed";
function readConnectionLinesVisible(_0x422765) {
  return _0x422765?.getState?.()?.ui?.connectionLinesVisible !== false;
}
function syncConnectionLinesToggleButton(_0x346dbd, _0x5576fa) {
  if (!_0x346dbd) {
    return;
  }
  const _0x46fc0e = _0x5576fa !== false;
  _0x346dbd.classList?.toggle?.("active", _0x46fc0e);
  _0x346dbd.setAttribute?.("aria-pressed", _0x46fc0e ? "true" : "false");
}
function dispatchConnectionLinesVisibilityChanged(_0x57e146) {
  const _0x5780ed = globalThis.window;
  if (!_0x5780ed?.dispatchEvent) {
    return;
  }
  const _0x4bd448 = {
    visible: _0x57e146 !== false
  };
  const _0x5707e9 = typeof _0x5780ed.CustomEvent === "function" ? _0x5780ed.CustomEvent : typeof globalThis.CustomEvent === "function" ? globalThis.CustomEvent : null;
  const _0x135b3e = _0x5707e9 ? new _0x5707e9(CONNECTION_LINES_VISIBILITY_EVENT, {
    detail: _0x4bd448
  }) : {
    type: CONNECTION_LINES_VISIBILITY_EVENT,
    detail: _0x4bd448
  };
  _0x5780ed.dispatchEvent(_0x135b3e);
}
function initConnectionLinesToggle({
  button: _0xbe71ba,
  uiStore: _0x58c456
} = {}) {
  if (!_0xbe71ba) {
    return;
  }
  const _0x20bf8b = (_0x3ff3d4, {
    showToast = false
  } = {}) => {
    const _0x5e6150 = _0x3ff3d4 !== false;
    _0x58c456?.setConnectionLinesVisible?.(_0x5e6150);
    syncConnectionLinesToggleButton(_0xbe71ba, _0x5e6150);
    dispatchConnectionLinesVisibilityChanged(_0x5e6150);
    if (showToast) {
      globalThis.window?.showToast?.(_0x5e6150 ? t("appBusinessEvents.toggles.connectionLines.on") : t("appBusinessEvents.toggles.connectionLines.off"));
    }
    return _0x5e6150;
  };
  syncConnectionLinesToggleButton(_0xbe71ba, readConnectionLinesVisible(_0x58c456));
  _0xbe71ba.addEventListener?.("click", () => {
    _0x20bf8b(!readConnectionLinesVisible(_0x58c456), {
      showToast: true
    });
  });
  globalThis.window?.addEventListener?.(CONNECTION_LINES_VISIBILITY_EVENT, _0x173464 => {
    syncConnectionLinesToggleButton(_0xbe71ba, _0x173464?.detail?.visible !== false);
  });
  _0x58c456?.subscribeSelector?.(_0x15d9cf => _0x15d9cf.ui?.connectionLinesVisible !== false, _0x534736 => syncConnectionLinesToggleButton(_0xbe71ba, _0x534736));
}
export function initAppShellUi({
  store: _0x44cc2b,
  uiStore: _0x47e53f,
  initMinimap: _0x1ffdf3,
  minimapEl: _0x1de035,
  btnMinimapEl: _0x1ecc56,
  minimapWrapperEl: _0x1fa2d2,
  btnToggleDotsEl: _0x3f9cd3,
  btnConnectionLinesToggleEl: _0x526201,
  btnAddCanvasEl: _0x3c1138,
  addCanvas: _0x6bb0b3,
  readGridDotsPref: _0x51b420,
  setGridDotsPref: _0x43d554,
  showDevToast: _0x35143b
} = {}) {
  const _0x49611d = document.getElementById("canvasVersionBadge");
  if (_0x49611d) {
    const _0x346063 = document.querySelector("meta[name=\"app-version\"]")?.getAttribute("content");
    const _0x2f6c57 = String(_0x346063 || "").trim().replace(/^v\s*/i, "");
    _0x49611d.textContent = _0x2f6c57 ? t("appShell.currentVersionBadge", {
      version: _0x2f6c57
    }) : "";
  }
  if (_0x1de035) {
    _0x1ffdf3?.(_0x1de035, _0x44cc2b);
  }
  if (_0x1ecc56 && _0x1fa2d2) {
    const _0x457d2b = _0x20fb34 => {
      const _0x17585f = _0x20fb34 === true;
      _0x1fa2d2.classList.toggle("open", _0x17585f);
      _0x1ecc56.classList.toggle("active", _0x17585f);
      _0x1ecc56.setAttribute("aria-pressed", _0x17585f ? "true" : "false");
    };
    _0x457d2b(_0x1fa2d2.classList?.contains?.("open") === true);
    _0x1ecc56.addEventListener("click", () => {
      _0x457d2b(_0x1fa2d2.classList?.contains?.("open") !== true);
    });
    const _0x3432da = () => {
      const _0x1aa391 = Object.keys(_0x44cc2b?.getState?.().nodes || {}).length > 0;
      _0x457d2b(_0x1aa391);
    };
    setTimeout(_0x3432da, 150);
  }
  if (_0x3c1138 && typeof _0x6bb0b3 === "function") {
    _0x3c1138.addEventListener("click", () => _0x6bb0b3());
  }
  if (_0x3f9cd3) {
    const _0x35baa = _0xe068ef => {
      const _0x2b80bd = _0xe068ef !== false;
      _0x3f9cd3.classList?.toggle?.("active", _0x2b80bd);
      _0x3f9cd3.setAttribute?.("aria-pressed", _0x2b80bd ? "true" : "false");
    };
    _0x35baa(_0x51b420?.());
    _0x3f9cd3.addEventListener("click", () => {
      const _0x41102b = _0x43d554?.(!_0x51b420?.());
      _0x35baa(_0x41102b);
      window.showToast?.(_0x41102b ? t("appBusinessEvents.toggles.gridDots.on") : t("appBusinessEvents.toggles.gridDots.off"));
    });
  }
  initConnectionLinesToggle({
    button: _0x526201,
    uiStore: _0x47e53f
  });
  _0x43d554?.(_0x51b420?.());
  _0x35143b;
}