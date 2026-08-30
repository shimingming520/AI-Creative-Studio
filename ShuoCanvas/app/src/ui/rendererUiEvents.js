import { executeCommand } from "../core/interaction.js";
import { RENDERER_VIRTUALIZATION_CONFIG } from "../core/rendererVirtualization.js";
import { liftRendererNodePresentationZIndex } from "../core/rendererNodePresentation.js";
import { getAlignableSelectionNodes, screenToWorld } from "../core/math.js";
import { cancelSelectedGenerateButtons, executeSelectedGenerateButtons, hasActiveSelectedGenerateBatch, hasRunningSelectedGenerateNodes } from "../modules/groupExecution.js";
import { getSelectedMediaComposeKind } from "../modules/mediaComposeSelection.js";
import { exportSelectedNodesBatch } from "../modules/nodeBatchExport.js";
import { showContextMenu } from "../modules/interaction/contextMenuPresenter.js";
import { stopActiveSyncVideoPlayback, syncPlaySelectedVideos } from "../modules/videoSyncPlayback.js";
import { t } from "../i18n/index.js";
let _inited = false;
let _guardInstalled = false;
const LABEL_RENAME_CLICK_THRESHOLD_PX = 5;
const NODE_LABEL_RENAMING_CLASS = "is-renaming-label";
const EDGE_SCISSOR_HOVER_DELAY_MS = 500;
const EDGE_POINTER_HIT_DISABLED_BODY_CLASSES = ["is-panning", "is-dragging", "is-zooming", "is-edge-interaction-lite"];
export function shouldResolvePooledEdgePointerHit({
  target: _0x368da,
  canvasEl: _0x2524d6,
  scissorBtn = null,
  bodyClassList = null
} = {}) {
  if (!_0x368da || !_0x2524d6) {
    return false;
  }
  if (_0x368da !== _0x2524d6 && !_0x2524d6.contains?.(_0x368da)) {
    return false;
  }
  if (EDGE_POINTER_HIT_DISABLED_BODY_CLASSES.some(_0x4920a3 => bodyClassList?.contains?.(_0x4920a3))) {
    return false;
  }
  if (scissorBtn && (_0x368da === scissorBtn || scissorBtn.contains?.(_0x368da))) {
    return false;
  }
  if (_0x368da.closest?.("g.connection-group[data-conn-id]")) {
    return false;
  }
  if (_0x368da.closest?.(".v2-node")) {
    return false;
  }
  if (_0x368da.closest?.("[data-ui-stop=\"1\"]")) {
    return false;
  }
  if (_0x368da.closest?.("button")) {
    return false;
  }
  if (_0x368da.closest?.("input")) {
    return false;
  }
  if (_0x368da.closest?.("textarea")) {
    return false;
  }
  if (_0x368da.closest?.("select")) {
    return false;
  }
  if (_0x368da.closest?.("[contenteditable=\"true\"]")) {
    return false;
  }
  return true;
}
function _formatNodeLabelText(_0x470bbf) {
  const _0x2b39e3 = String(_0x470bbf || "").trim();
  if (!_0x2b39e3) {
    return "";
  }
  const _0x34739b = /^[\x00-\x7F]*$/.test(_0x2b39e3);
  if (_0x34739b && _0x2b39e3.length > 20) {
    return _0x2b39e3.slice(0, 20) + "...";
  }
  return _0x2b39e3;
}
function _escapeHtml(_0x172335) {
  return String(_0x172335 || "").replace(/[&<>"']/g, _0x1a3ea4 => {
    if (_0x1a3ea4 === "&") {
      return "&amp;";
    }
    if (_0x1a3ea4 === "<") {
      return "&lt;";
    }
    if (_0x1a3ea4 === ">") {
      return "&gt;";
    }
    if (_0x1a3ea4 === "\"") {
      return "&quot;";
    }
    return "&#39;";
  });
}
function _stackHasRendererJs(_0x7f5b53) {
  const _0x4f04e3 = _getGuardCallsite(_0x7f5b53);
  if (!_0x4f04e3) {
    return false;
  }
  return _0x4f04e3.includes("renderer.js") || _0x4f04e3.includes("/renderer.js") || _0x4f04e3.includes("\\renderer.js");
}
function _getGuardCallsite(_0x5aabbd) {
  const _0x21857b = String(_0x5aabbd || "").split("\n");
  for (const _0x5abccf of _0x21857b) {
    if (!_0x5abccf.includes("at ")) {
      continue;
    }
    const _0x5305b4 = _0x5abccf.match(/\(([^)]+)\)/);
    const _0xe139ea = (_0x5305b4 ? _0x5305b4[1] : _0x5abccf.replace(/^\s*at\s+/, "")).trim();
    if (!_0xe139ea.includes(".js")) {
      continue;
    }
    const _0x1e8c37 = _0xe139ea.replace(/:\d+:\d+$/, "");
    if (_0x1e8c37.includes("rendererUiEvents.js") || _0x1e8c37.includes("/rendererUiEvents.js") || _0x1e8c37.includes("\\rendererUiEvents.js")) {
      continue;
    }
    return _0x1e8c37;
  }
  return "";
}
function _createGuardError() {
  return new Error("[架构守卫] 禁止在 renderer.js 中绑定 DOM 事件，请迁移到 UI 层");
}
export function installRendererEventBindingGuard() {
  if (_guardInstalled) {
    return;
  }
  _guardInstalled = true;
  const _0x42cc13 = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (..._0x53c823) {
    const _0x6b8e77 = new Error().stack;
    if (_stackHasRendererJs(_0x6b8e77)) {
      throw _createGuardError();
    }
    return _0x42cc13.apply(this, _0x53c823);
  };
  const _0x40b4d6 = (_0x496bbf, _0x3c8a44) => {
    if (!_0x496bbf) {
      return;
    }
    const _0x11dfc5 = Object.getOwnPropertyDescriptor(_0x496bbf, _0x3c8a44);
    if (!_0x11dfc5 || typeof _0x11dfc5.set !== "function") {
      return;
    }
    Object.defineProperty(_0x496bbf, _0x3c8a44, {
      configurable: _0x11dfc5.configurable,
      enumerable: _0x11dfc5.enumerable,
      get: _0x11dfc5.get,
      set(_0x3acde6) {
        const _0x149b7c = new Error().stack;
        if (_stackHasRendererJs(_0x149b7c)) {
          throw _createGuardError();
        }
        return _0x11dfc5.set.call(this, _0x3acde6);
      }
    });
  };
  const _0x263449 = ["onclick", "onmouseenter", "onmouseleave", "onpointerdown", "onpointerup", "onpointermove"];
  for (const _0x11a500 of _0x263449) {
    _0x40b4d6(globalThis.HTMLElement?.prototype, _0x11a500);
    _0x40b4d6(globalThis.SVGElement?.prototype, _0x11a500);
  }
}
export function initRendererUiEvents({
  wrap: _0x5b5ffe,
  store: _0x18f0a2,
  canDeleteEdge = () => true
}) {
  if (_inited) {
    return;
  }
  _inited = true;
  const _0x476301 = new WeakMap();
  const _0x350700 = new Map();
  const _0x1d8e83 = {
    "ms-align-left": "left",
    "ms-align-h-center": "h-center",
    "ms-align-right": "right",
    "ms-align-top": "top",
    "ms-align-v-center": "v-center",
    "ms-align-bottom": "bottom",
    "ms-distribute-h": "distribute-h",
    "ms-distribute-v": "distribute-v",
    "ms-arrange-grid": "arrange-grid"
  };
  let _0x8c9528 = null;
  let _0xdb110d = null;
  let _0x22a3bd = null;
  let _0x5349ef = null;
  let _0x2c073c = null;
  let _0x41d87c = null;
  let _0x3bd355 = "";
  let _0x26cf10 = null;
  let _0x5b2525 = {
    x: 0,
    y: 0
  };
  const _0x466353 = document.getElementById("v2-canvas");
  const _0x41ee98 = !!_0x466353;
  const _0x55e289 = (_0x2b0b0d, _0x1d1ea1 = null) => typeof canDeleteEdge === "function" ? canDeleteEdge({
    edgeId: _0x2b0b0d,
    event: _0x1d1ea1,
    store: _0x18f0a2
  }) !== false : canDeleteEdge !== false;
  const _0xb6f428 = ({
    restoreFocus = false
  } = {}) => {
    const _0x16ef45 = _0x8c9528;
    _0x8c9528 = null;
    _0x16ef45?.close?.({
      restoreFocus: restoreFocus
    });
  };
  const _0x56fe05 = () => {
    _0xb6f428();
    _0x18f0a2?.setAlignPanelVisible?.(false);
  };
  const _0x461d4e = (_0x25fcc1 = undefined) => {
    const _0x3be21f = _0x18f0a2?.getState?.();
    if (_0x3be21f?.ui?.alignFeatureEnabled === false) {
      _0x56fe05();
      return;
    }
    executeCommand("align_nodes", {
      mode: "arrange-grid",
      columns: _0x25fcc1
    });
  };
  const _0xcb876e = (_0x941b50, _0x5f3d21, _0x514a65) => {
    if (!_0x941b50 || _0x941b50.disabled) {
      return;
    }
    _0xb6f428();
    _0x941b50.setAttribute("aria-expanded", "true");
    let _0x3d6059 = null;
    _0x3d6059 = showContextMenu(_0x5f3d21, _0x514a65, [{
      label: t("coreUi.renderer.align.gridAuto"),
      action: () => _0x461d4e()
    }, "sep", ...[2, 3, 4, 5].map(_0x5ce9df => ({
      label: t("coreUi.renderer.align.gridColumns", {
        count: _0x5ce9df
      }),
      action: () => _0x461d4e(_0x5ce9df)
    }))], {
      ariaLabel: t("coreUi.renderer.align.gridMenu"),
      includeNodePicker: false,
      restoreTarget: _0x941b50,
      ownerRoot: _0x941b50.ownerDocument || document,
      ownerElement: _0x941b50,
      onClose: () => {
        _0x941b50.setAttribute("aria-expanded", "false");
        if (_0x8c9528 === _0x3d6059) {
          _0x8c9528 = null;
        }
      }
    });
    _0x8c9528 = _0x3d6059;
  };
  const _0x276974 = _0x31a5fc => {
    const _0x38e9bc = _0x31a5fc?.closest?.(".v2-node");
    if (!_0x38e9bc) {
      return "";
    }
    return _0x38e9bc.dataset.nodeId || _0x38e9bc.id || "";
  };
  const _0x1e5eeb = _0x40bbf7 => {
    if (!_0x40bbf7) {
      return;
    }
    window.v2Renderer?.pinNode?.(_0x40bbf7, "recent-ui");
    const _0x9ee359 = _0x350700.get(_0x40bbf7);
    if (_0x9ee359) {
      clearTimeout(_0x9ee359);
    }
    const _0x309f65 = setTimeout(() => {
      _0x350700.delete(_0x40bbf7);
      window.v2Renderer?.unpinNode?.(_0x40bbf7, "recent-ui");
    }, RENDERER_VIRTUALIZATION_CONFIG.recentPinMs);
    _0x350700.set(_0x40bbf7, _0x309f65);
  };
  const _0x3412c6 = _0x426125 => {
    if (!_0x426125) {
      return;
    }
    window.v2Renderer?.pinNode?.(_0x426125, "focus");
  };
  const _0x3701c5 = (_0x5e8295, _0xf65d49) => {
    if (!_0x5e8295 || !_0xf65d49) {
      return;
    }
    if (_0x26cf10) {
      clearTimeout(_0x26cf10);
      _0x26cf10 = null;
    }
    if (_0x3bd355 && _0x3bd355 !== _0xf65d49) {
      window.v2Renderer?.flushNode?.(_0x3bd355);
    }
    _0x3bd355 = _0xf65d49;
    liftRendererNodePresentationZIndex(_0x5e8295, "180");
  };
  const _0x28e167 = (_0x3cbef7, _0x29adea) => {
    if (!_0x29adea) {
      return;
    }
    if (_0x26cf10) {
      clearTimeout(_0x26cf10);
    }
    _0x26cf10 = setTimeout(() => {
      _0x26cf10 = null;
      const _0x50c8a3 = document.activeElement;
      if (_0x3cbef7 && _0x50c8a3 && _0x3cbef7.contains(_0x50c8a3)) {
        return;
      }
      window.v2Renderer?.unpinNode?.(_0x29adea, "focus");
      if (_0x3bd355 === _0x29adea) {
        _0x3bd355 = "";
        window.v2Renderer?.flushNode?.(_0x29adea);
      }
    }, 1200);
  };
  const _0x1125ac = (_0x4e1a05, _0x358f05) => {
    window.v2Renderer?.setEdgeInteractionHighlight?.(_0x4e1a05, _0x358f05);
    const _0x56d8ab = document.querySelector("g.connection-group[data-conn-id=\"" + _0x4e1a05 + "\"]");
    if (_0x56d8ab) {
      if (_0x358f05) {
        _0x56d8ab.classList.add("connection-highlighted");
      } else {
        _0x56d8ab.classList.remove("connection-highlighted");
      }
    }
  };
  const _0x3667ad = (_0x2c8978, _0x3453c9) => {
    window.v2Renderer?.setHoveredEdge?.(_0x2c8978, _0x3453c9);
  };
  const _0x3686f9 = ({
    preserveHover = false
  } = {}) => {
    clearTimeout(_0x2c073c);
    clearTimeout(_0x41d87c);
    _0x2c073c = null;
    _0x41d87c = null;
    if (_0x5349ef) {
      _0x1125ac(_0x5349ef, false);
    }
    if (!preserveHover && _0x22a3bd) {
      _0x3667ad(_0x22a3bd, false);
      _0x22a3bd = null;
    }
    _0x5349ef = null;
    if (_0xdb110d) {
      _0xdb110d.style.display = "none";
    }
  };
  const _0x335b41 = () => {
    if (_0xdb110d) {
      return _0xdb110d;
    }
    _0xdb110d = document.createElement("div");
    _0xdb110d.id = "v2-conn-scissor-btn";
    _0xdb110d.className = "conn-scissor-btn";
    const _0x10c6e8 = "http://www.w3.org/2000/svg";
    const _0x3f1418 = document.createElementNS(_0x10c6e8, "svg");
    _0x3f1418.setAttribute("width", "16");
    _0x3f1418.setAttribute("height", "16");
    _0x3f1418.setAttribute("viewBox", "0 0 24 24");
    _0x3f1418.setAttribute("fill", "none");
    _0x3f1418.setAttribute("stroke", "currentColor");
    _0x3f1418.setAttribute("stroke-width", "2.5");
    _0x3f1418.setAttribute("stroke-linecap", "round");
    _0x3f1418.setAttribute("stroke-linejoin", "round");
    const _0xb6f222 = document.createElementNS(_0x10c6e8, "circle");
    _0xb6f222.setAttribute("cx", "6");
    _0xb6f222.setAttribute("cy", "6");
    _0xb6f222.setAttribute("r", "3");
    const _0x197ee4 = document.createElementNS(_0x10c6e8, "circle");
    _0x197ee4.setAttribute("cx", "6");
    _0x197ee4.setAttribute("cy", "18");
    _0x197ee4.setAttribute("r", "3");
    const _0x3c08da = document.createElementNS(_0x10c6e8, "line");
    _0x3c08da.setAttribute("x1", "20");
    _0x3c08da.setAttribute("y1", "4");
    _0x3c08da.setAttribute("x2", "8.12");
    _0x3c08da.setAttribute("y2", "15.88");
    const _0x2c9ff0 = document.createElementNS(_0x10c6e8, "line");
    _0x2c9ff0.setAttribute("x1", "14.47");
    _0x2c9ff0.setAttribute("y1", "14.48");
    _0x2c9ff0.setAttribute("x2", "20");
    _0x2c9ff0.setAttribute("y2", "20");
    const _0x537ee4 = document.createElementNS(_0x10c6e8, "line");
    _0x537ee4.setAttribute("x1", "8.12");
    _0x537ee4.setAttribute("y1", "8.12");
    _0x537ee4.setAttribute("x2", "12");
    _0x537ee4.setAttribute("y2", "12");
    _0x3f1418.appendChild(_0xb6f222);
    _0x3f1418.appendChild(_0x197ee4);
    _0x3f1418.appendChild(_0x3c08da);
    _0x3f1418.appendChild(_0x2c9ff0);
    _0x3f1418.appendChild(_0x537ee4);
    _0xdb110d.appendChild(_0x3f1418);
    _0xdb110d.style.position = _0x41ee98 ? "absolute" : "fixed";
    _0xdb110d.style.display = "none";
    _0xdb110d.style.zIndex = _0x41ee98 ? "9" : "90";
    _0xdb110d.style.transform = "translate(-50%, -50%)";
    _0xdb110d.style.pointerEvents = "auto";
    (_0x466353 || document.body).appendChild(_0xdb110d);
    _0xdb110d.addEventListener("pointerdown", _0x7a49e0 => _0x7a49e0.stopPropagation());
    _0xdb110d.addEventListener("click", _0x61fb10 => {
      _0x61fb10.stopPropagation();
      if (_0x5349ef && _0x55e289(_0x5349ef, _0x61fb10)) {
        executeCommand("delete_edge", {
          id: _0x5349ef
        });
        _0x3686f9();
      }
    });
    _0xdb110d.addEventListener("mouseenter", () => {
      clearTimeout(_0x41d87c);
      _0x41d87c = null;
    });
    _0xdb110d.addEventListener("mouseleave", () => {
      _0x3686f9();
    });
    return _0xdb110d;
  };
  const _0x176fae = (_0x54da4a, _0x4af02d) => {
    const _0x498e16 = _0x335b41();
    if (_0x41ee98) {
      const _0x52def2 = _0x18f0a2?.getStateRaw?.()?.viewport || _0x18f0a2?.getState?.()?.viewport || {};
      const _0x260b99 = screenToWorld(_0x54da4a, _0x4af02d, _0x52def2);
      _0x498e16.style.left = _0x260b99.x + "px";
      _0x498e16.style.top = _0x260b99.y + "px";
      return;
    }
    _0x498e16.style.left = _0x54da4a + "px";
    _0x498e16.style.top = _0x4af02d + "px";
  };
  const _0x2aa765 = (_0x596785, _0x3beab0 = null) => {
    if (!_0x596785) {
      return;
    }
    if (_0x22a3bd === _0x596785) {
      return;
    }
    if (_0x22a3bd) {
      _0x3667ad(_0x22a3bd, false);
    }
    if (_0x5349ef && _0x5349ef !== _0x596785) {
      _0x1125ac(_0x5349ef, false);
      _0x5349ef = null;
      if (_0xdb110d) {
        _0xdb110d.style.display = "none";
      }
    }
    _0x22a3bd = _0x596785;
    _0x3667ad(_0x596785, true);
    if (!_0x55e289(_0x596785, _0x3beab0)) {
      _0x3686f9({
        preserveHover: true
      });
      return;
    }
    clearTimeout(_0x2c073c);
    clearTimeout(_0x41d87c);
    _0x41d87c = null;
    _0x335b41();
    _0x2c073c = setTimeout(() => {
      if (_0x22a3bd === _0x596785) {
        _0x5349ef = _0x596785;
        _0x1125ac(_0x596785, true);
        _0x176fae(_0x5b2525.x, _0x5b2525.y);
        _0xdb110d.style.display = "flex";
      }
    }, EDGE_SCISSOR_HOVER_DELAY_MS);
  };
  const _0xd189f = (_0x48165f, _0x9b1b67) => {
    if (_0xdb110d && _0x9b1b67 && (_0x9b1b67 === _0xdb110d || _0xdb110d.contains(_0x9b1b67))) {
      return;
    }
    _0x3667ad(_0x48165f, false);
    if (_0x22a3bd === _0x48165f) {
      _0x22a3bd = null;
    }
    clearTimeout(_0x2c073c);
    _0x2c073c = null;
    if (_0x5349ef !== _0x48165f) {
      return;
    }
    _0x41d87c = setTimeout(() => {
      if (_0x5349ef === _0x48165f) {
        _0x3686f9();
      }
    }, 100);
  };
  if (_0x18f0a2?.subscribeRaw) {
    _0x18f0a2.subscribeRaw(_0x248a0a => {
      if (!_0x5349ef) {
        return;
      }
      if (!_0x248a0a?.edges?.[_0x5349ef]) {
        _0x3686f9();
      }
    });
  }
  document.addEventListener("pointerdown", _0x3f730b => {
    const _0x3d194c = _0x276974(_0x3f730b.target);
    if (_0x3d194c) {
      _0x1e5eeb(_0x3d194c);
    }
    const _0x3942d8 = _0x3f730b.target?.closest?.(".node-label[contenteditable=\"true\"]");
    if (_0x3942d8) {
      _0x3f730b.stopPropagation();
    }
  }, true);
  document.addEventListener("focusin", _0x5927d2 => {
    const _0x327a95 = _0x5927d2.target?.closest?.(".v2-node");
    const _0x2fee2c = _0x327a95?.dataset?.nodeId || _0x327a95?.id || "";
    if (_0x2fee2c) {
      _0x3412c6(_0x2fee2c);
      _0x3701c5(_0x327a95, _0x2fee2c);
    }
  }, true);
  document.addEventListener("focusout", _0x165391 => {
    const _0x493a7e = _0x165391.target?.closest?.(".v2-node");
    const _0x265e6f = _0x493a7e?.dataset?.nodeId || _0x493a7e?.id || "";
    if (_0x265e6f) {
      _0x28e167(_0x493a7e, _0x265e6f);
    }
  }, true);
  document.addEventListener("pointerdown", _0x5e955b => {
    const _0x3db4bb = _0x5e955b.target?.closest?.(".node-label[data-node-id]");
    if (!_0x3db4bb) {
      return;
    }
    if (_0x3db4bb.getAttribute("contenteditable") === "true") {
      _0x5e955b.stopPropagation();
      return;
    }
    _0x476301.set(_0x3db4bb, {
      x: _0x5e955b.clientX,
      y: _0x5e955b.clientY
    });
  });
  document.addEventListener("keyup", _0x180446 => {
    if (_0x180446.key === "Control") {
      _0x3686f9();
    }
  });
  document.addEventListener("click", _0x1c4fac => {
    const _0x34a4d6 = _0x1c4fac.target?.closest?.(".v2-pick-connect-banner [data-ui-action=\"exit-pick-connect\"]");
    if (_0x34a4d6) {
      _0x1c4fac.stopPropagation();
      executeCommand("set_pick_connect_mode", {
        active: false
      });
      return;
    }
    const _0xf43f2 = _0x1c4fac.target?.closest?.("#v2-picker button[data-node-type]");
    if (_0xf43f2) {
      _0x1c4fac.stopPropagation();
      const _0x1105a2 = _0x18f0a2?.getState?.();
      const _0x4fd219 = _0x1105a2?.picker;
      const _0x54fe37 = _0xf43f2.dataset.nodeType;
      const _0x3acab4 = Number(_0xf43f2.dataset.width) || 300;
      const _0x472b48 = Number(_0xf43f2.dataset.height) || 300;
      const _0x28b639 = _0xf43f2.dataset.defaultLabel || t("coreUi.renderer.defaultNodeNames.node");
      if (_0x4fd219 && _0x4fd219.visible) {
        executeCommand("create_node", {
          type: _0x54fe37,
          x: _0x4fd219.x,
          y: _0x4fd219.y,
          width: _0x3acab4,
          height: _0x472b48,
          label: _0x28b639,
          content: ""
        });
        executeCommand("hide_picker");
      }
      return;
    }
    const _0x53a0fd = _0x1c4fac.target?.closest?.("#v2-align-center-panel button[data-ui-action]");
    if (_0x53a0fd) {
      _0x1c4fac.stopPropagation();
      if (_0x53a0fd.disabled) {
        return;
      }
      const _0x588f0e = _0x1d8e83[_0x53a0fd.dataset.uiAction];
      if (!_0x588f0e) {
        return;
      }
      const _0x2d7364 = _0x18f0a2?.getState?.();
      if (_0x2d7364?.ui?.alignFeatureEnabled === false) {
        _0x56fe05();
        return;
      }
      executeCommand("align_nodes", {
        mode: _0x588f0e
      });
      return;
    }
    const _0x2ea00e = _0x1c4fac.target?.closest?.(".v2-multi-select-tab button[data-ui-action]");
    if (_0x2ea00e) {
      _0x1c4fac.stopPropagation();
      if (_0x2ea00e.disabled) {
        return;
      }
      const _0x47cd69 = _0x2ea00e.dataset.uiAction;
      if (_0x47cd69 === "ms-sync-video-play") {
        if (stopActiveSyncVideoPlayback()) {
          return;
        }
        const _0x391428 = _0x18f0a2?.getState?.();
        const _0x128727 = _0x391428?.selectedNodeIds || [];
        if (_0x128727.length >= 2) {
          syncPlaySelectedVideos({
            selectedIds: _0x128727,
            state: _0x391428,
            loop: _0x1c4fac.altKey === true,
            shouldStopOnPointerEvent: _0x393a03 => _0x393a03?.target?.closest?.(".v2-multi-select-tab button[data-ui-action=\"ms-sync-video-play\"]") !== _0x2ea00e
          });
        }
        return;
      }
      if (_0x47cd69 === "ms-run-selected") {
        const _0x599f42 = _0x18f0a2?.getState?.();
        const _0x54f6ed = _0x599f42?.selectedNodeIds || [];
        const _0x27dec6 = _0x1bfc86 => {
          const _0x5b380a = _0x18f0a2?.getState?.();
          const _0x438dc3 = _0x1bfc86 || hasRunningSelectedGenerateNodes(_0x5b380a?.nodes || {}, _0x5b380a?.selectedNodeIds || _0x54f6ed);
          const _0x33b2d9 = _0x438dc3 ? t("groupExecution.stopSelected") : t("coreUi.renderer.multiSelect.runSelected");
          _0x2ea00e.dataset.batchActive = String(_0x438dc3);
          _0x2ea00e.dataset.tooltip = _0x33b2d9;
          _0x2ea00e.setAttribute("aria-label", _0x33b2d9);
          _0x2ea00e.setAttribute("aria-busy", String(_0x438dc3));
          _0x2ea00e.classList.toggle("is-active", _0x438dc3);
        };
        if (hasActiveSelectedGenerateBatch() || hasRunningSelectedGenerateNodes(_0x599f42?.nodes || {}, _0x54f6ed)) {
          cancelSelectedGenerateButtons({
            selectedIds: _0x54f6ed,
            state: _0x599f42
          });
          _0x27dec6(false);
          return;
        }
        if (_0x54f6ed.length > 0) {
          executeSelectedGenerateButtons({
            selectedIds: _0x54f6ed,
            state: _0x599f42,
            onStateChange: _0x27dec6
          });
        }
        return;
      }
      if (_0x47cd69 === "ms-asset") {
        const _0x5754e9 = _0x18f0a2?.getState?.()?.selectedNodeIds || [];
        if (_0x5754e9.length > 0) {
          import("../modules/AssetManager.js").then(({
            assetManager: _0x2418d5
          }) => {
            _0x2418d5.showLibrarySavePanel([..._0x5754e9], _0x2ea00e);
          });
        }
        return;
      }
      if (_0x47cd69 === "ms-batch-download") {
        const _0x3ca6de = _0x18f0a2?.getState?.() || {};
        exportSelectedNodesBatch({
          state: _0x3ca6de
        });
        return;
      }
      if (_0x47cd69 === "ms-group") {
        const _0x1bee2e = _0x18f0a2?.getState?.()?.selectedNodeIds || [];
        if (_0x1bee2e.length >= 2) {
          executeCommand("group", {
            ids: _0x1bee2e
          });
        }
        return;
      }
      if (_0x47cd69 === "ms-create-collage") {
        const _0x40710e = _0x18f0a2?.getState?.()?.selectedNodeIds || [];
        if (_0x40710e.length >= 2) {
          executeCommand("create_collage_from_selection", {
            ids: _0x40710e
          });
        }
        return;
      }
      if (_0x47cd69 === "ms-compose-video") {
        const _0x3b1c61 = _0x18f0a2?.getState?.();
        const _0x2a102a = _0x3b1c61?.selectedNodeIds || [];
        if (_0x2a102a.length >= 2) {
          import("../modules/VideoComposeController.js").then(({
            composeSelectedAudios: _0x15a04d,
            composeSelectedVideos: _0x340904
          }) => {
            const _0x2cc8a2 = getSelectedMediaComposeKind(_0x3b1c61?.nodes || {}, _0x2a102a) || _0x2ea00e.dataset.composeKind;
            if (_0x2cc8a2 === "audio") {
              _0x15a04d(_0x2a102a, _0x2ea00e);
            } else {
              _0x340904(_0x2a102a, _0x2ea00e);
            }
          });
        }
        return;
      }
      if (_0x47cd69 === "ms-reset-image-size") {
        const _0x304a12 = _0x18f0a2?.getState?.()?.selectedNodeIds || [];
        if (_0x304a12.length > 0) {
          executeCommand("reset_source_media_size", {
            ids: _0x304a12
          });
        }
        return;
      }
      return;
    }
    if (!_0x1c4fac.target?.closest?.("#v2-align-center-panel")) {
      _0x56fe05();
    }
    const _0x159398 = _0x1c4fac.target?.closest?.(".node-label[data-node-id]");
    if (_0x159398) {
      if (_0x159398.getAttribute("contenteditable") === "true") {
        return;
      }
      const _0x5bc127 = _0x476301.get(_0x159398) || {
        x: _0x1c4fac.clientX,
        y: _0x1c4fac.clientY
      };
      const _0x3c9643 = _0x1c4fac.clientX - _0x5bc127.x;
      const _0x3a8bfd = _0x1c4fac.clientY - _0x5bc127.y;
      if (Math.sqrt(_0x3c9643 * _0x3c9643 + _0x3a8bfd * _0x3a8bfd) > LABEL_RENAME_CLICK_THRESHOLD_PX) {
        return;
      }
      _0x1c4fac.stopPropagation();
      const _0x4458fb = _0x159398.dataset.defaultName || t("app.sourceDefaults.node");
      const _0x2dff46 = _0x159398.dataset.fullName || "";
      const _0x311dc7 = _0x159398.closest(".v2-node");
      _0x159398.textContent = _0x2dff46 || _0x4458fb;
      _0x159398.contentEditable = "true";
      if (_0x311dc7) {
        _0x311dc7.classList.add(NODE_LABEL_RENAMING_CLASS);
      }
      _0x159398.focus();
    }
  });
  document.addEventListener("contextmenu", _0xceac2d => {
    const _0x18b1e9 = _0xceac2d.target?.closest?.("#v2-align-center-panel button[data-ui-action=\"ms-arrange-grid\"]");
    if (!_0x18b1e9) {
      return;
    }
    _0xceac2d.preventDefault();
    _0xceac2d.stopPropagation();
    _0xceac2d.stopImmediatePropagation?.();
    _0xcb876e(_0x18b1e9, _0xceac2d.clientX, _0xceac2d.clientY);
  }, true);
  document.addEventListener("keydown", _0x119f7e => {
    const _0x2f397e = _0x119f7e.target?.closest?.("#v2-align-center-panel button[data-ui-action=\"ms-arrange-grid\"]");
    const _0x4a8280 = _0x119f7e.key === "ArrowDown" || _0x119f7e.key === "ContextMenu" || _0x119f7e.key === "F10" && _0x119f7e.shiftKey;
    if (_0x2f397e && _0x4a8280) {
      _0x119f7e.preventDefault();
      _0x119f7e.stopPropagation();
      const _0x28c1bf = _0x2f397e.getBoundingClientRect();
      _0xcb876e(_0x2f397e, _0x28c1bf.left + _0x28c1bf.width / 2, _0x28c1bf.bottom + 8);
      return;
    }
    const _0x109269 = _0x119f7e.target?.closest?.(".node-label[data-node-id]");
    if (!_0x109269) {
      return;
    }
    if (_0x109269.getAttribute("contenteditable") !== "true") {
      return;
    }
    if (_0x119f7e.key === "Enter") {
      _0x119f7e.preventDefault();
      _0x109269.blur();
    }
  });
  document.addEventListener("focusout", _0x25bb38 => {
    const _0x408f76 = _0x25bb38.target?.closest?.(".node-label[data-node-id]");
    if (!_0x408f76) {
      return;
    }
    if (_0x408f76.getAttribute("contenteditable") !== "true") {
      return;
    }
    const _0x2aa912 = _0x408f76.dataset.defaultName || t("app.sourceDefaults.node");
    const _0x2bec98 = _0x408f76.dataset.nodeId;
    const _0x558144 = _0x408f76.dataset.isBeta === "1";
    const _0x478020 = _0x408f76.closest(".v2-node");
    const _0x5a3f48 = _0x408f76.innerText.trim().replace(/Beta\s*$/i, "").trim() || _0x2aa912;
    _0x408f76.contentEditable = "false";
    if (_0x478020) {
      _0x478020.classList.remove(NODE_LABEL_RENAMING_CLASS);
    }
    if (_0x2bec98) {
      executeCommand("rename_node", {
        id: _0x2bec98,
        name: _0x5a3f48
      });
    }
    const _0xd81ca5 = _formatNodeLabelText(_0x5a3f48);
    _0x408f76.dataset.fullName = _0x5a3f48;
    _0x408f76.title = _0x5a3f48 || t("app.nodeLabel.renameTooltip");
    if (_0x558144) {
      _0x408f76.replaceChildren();
      _0x408f76.appendChild(document.createTextNode(_0xd81ca5 || _0x2aa912));
      const _0x3c8de3 = document.createElement("span");
      _0x3c8de3.className = "v2-node-beta-pill";
      _0x3c8de3.textContent = "Beta";
      _0x408f76.appendChild(_0x3c8de3);
    } else {
      _0x408f76.textContent = _0xd81ca5 || _0x2aa912;
    }
  });
  document.addEventListener("pointerover", _0x4a6e3b => {
    const _0x3fa57d = _0x4a6e3b.target?.closest?.("g.connection-group[data-conn-id]");
    if (_0x3fa57d) {
      if (_0x4a6e3b.relatedTarget && _0x3fa57d.contains(_0x4a6e3b.relatedTarget)) {
        return;
      }
      const _0x1c48c0 = _0x3fa57d.getAttribute("data-conn-id");
      _0x2aa765(_0x1c48c0, _0x4a6e3b);
      return;
    }
    const _0x18ffd0 = _0x4a6e3b.target?.closest?.("#v2-picker button[data-node-type]");
    if (_0x18ffd0) {
      _0x18ffd0.style.background = "var(--blue-25)";
      return;
    }
  });
  document.addEventListener("pointerout", _0x104201 => {
    const _0x27cd75 = _0x104201.target?.closest?.("g.connection-group[data-conn-id]");
    if (_0x27cd75) {
      if (_0x104201.relatedTarget && _0x27cd75.contains(_0x104201.relatedTarget)) {
        return;
      }
      _0xd189f(_0x27cd75.getAttribute("data-conn-id"), _0x104201.relatedTarget);
      return;
    }
    const _0x1d2549 = _0x104201.target?.closest?.("#v2-picker button[data-node-type]");
    if (_0x1d2549) {
      _0x1d2549.style.background = "var(--blue-10)";
      return;
    }
  });
  document.addEventListener("pointermove", _0x5b8462 => {
    _0x5b2525.x = _0x5b8462.clientX;
    _0x5b2525.y = _0x5b8462.clientY;
    const _0x8d5993 = _0x5b8462.target?.closest?.("g.connection-group[data-conn-id]");
    const _0x3c143a = _0xdb110d && (_0x5b8462.target === _0xdb110d || _0xdb110d.contains?.(_0x5b8462.target));
    if (_0x8d5993) {
      _0x2aa765(_0x8d5993.getAttribute("data-conn-id"), _0x5b8462);
    } else if (!_0x3c143a) {
      const _0x5c2a94 = shouldResolvePooledEdgePointerHit({
        target: _0x5b8462.target,
        canvasEl: _0x466353,
        scissorBtn: _0xdb110d,
        bodyClassList: document.body?.classList
      });
      const _0x15e64a = _0x5c2a94 ? window.v2Renderer?.hitTestEdgeAtScreenPoint?.(_0x5b8462.clientX, _0x5b8462.clientY) || "" : "";
      if (_0x15e64a) {
        _0x2aa765(_0x15e64a, _0x5b8462);
      } else if (_0x22a3bd) {
        _0xd189f(_0x22a3bd, _0x5b8462.relatedTarget);
      }
    }
    if (!_0x5349ef || !_0xdb110d || _0xdb110d.style.display === "none") {
      return;
    }
    _0x176fae(_0x5b8462.clientX, _0x5b8462.clientY);
  });
  _0x5b5ffe?.addEventListener?.("pointerdown", _0x3ba894 => {
    const _0x29abe2 = _0x3ba894.target?.closest?.("[data-ui-stop=\"1\"]");
    if (_0x29abe2) {
      _0x3ba894.stopPropagation();
    }
  });
  window.addEventListener("v2-align-feature-changed", () => {
    _0x56fe05();
  });
  _0x18f0a2?.subscribeSelector?.(_0x534333 => ({
    enabled: _0x534333?.ui?.alignFeatureEnabled !== false,
    alignableCount: getAlignableSelectionNodes(_0x534333?.nodes || {}, Array.isArray(_0x534333?.selectedNodeIds) ? _0x534333.selectedNodeIds : []).length
  }), ({
    enabled: _0x462724,
    alignableCount: _0x49230a
  }) => {
    if (!_0x462724 || _0x49230a < 2) {
      _0x56fe05();
    }
  });
}