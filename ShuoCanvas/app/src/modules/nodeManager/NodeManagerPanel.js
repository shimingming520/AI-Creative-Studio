import { MATERIAL_FOLDER_ICON_MARKUP, MATERIAL_TREE_CHEVRON_ICON_SVG, NODE_TOOLBAR_MORE_ICON_SVG, PANEL_COLLAPSE_LEFT_ICON_SVG } from "../../components/sharedIconMarkup.js";
import { t } from "../../i18n/index.js";
import { createSafeSvg } from "../../utils/dom.js";
import { resolveAssetNodeCoverUrl } from "../assetCoverResolver.js";
import { downloadNodeOutput } from "../nodeBatchExport.js";
import { showContextMenu } from "../interaction/contextMenuPresenter.js";
import { scrollElementHorizontallyWithWheel } from "../workspaceHorizontalWheel.js";
import { closeSidebarSubmenu, registerSidebarSubmenu } from "../sidebarSubmenuController.js";
import { buildNodeManagerModel, NODE_MANAGER_FILTERS } from "./nodeManagerModel.js";
import { NODE_MANAGER_PLACEMENT_EVENT, normalizeNodeManagerPlacement } from "./nodeManagerPlacement.js";
import { createNodeManagerDragController } from "./nodeManagerDragController.js";
const SIDEBAR_KEY = "node-manager";
const GROUP_DISCLOSURE_MOTION_MS = 150;
const VIDEO_PLAY_RETRY_MS = 1600;
const ICON_SELECTORS = Object.freeze({
  audio: ".nam-item[data-type=\"audio\"] svg",
  chevron: "#localeSelectTrigger .settings-preset-chevron",
  close: "#btnSettingsClose svg",
  filter: ".settings-nav-item[data-pane=\"canvas-align\"] svg",
  image: ".nam-item[data-type=\"image\"] svg",
  more: ".v2-material-more svg, .act-more-tools svg",
  node: "#btnNodeManager svg",
  search: ".settings-shortcuts-search-icon",
  text: ".nam-item[data-type=\"text\"] svg",
  video: ".nam-item[data-type=\"video\"] svg",
  videoPlay: ".video-play-btn svg"
});
function createSharedIcon(_0xb8acf7) {
  const _0x2a36b9 = _0xb8acf7 === "more" ? NODE_TOOLBAR_MORE_ICON_SVG : _0xb8acf7 === "treeChevron" ? MATERIAL_TREE_CHEVRON_ICON_SVG : _0xb8acf7 === "collapse" ? PANEL_COLLAPSE_LEFT_ICON_SVG : "";
  if (_0x2a36b9) {
    return createSafeSvg(_0x2a36b9);
  } else {
    return null;
  }
}
function getStoreState(_0x2189f0) {
  return _0x2189f0?.getStateRaw?.() || _0x2189f0?.getState?.() || {};
}
function createElement(_0x31ea7e, _0x4c17fc = "", _0x4bdbb7 = {}) {
  const _0x1f9785 = document.createElement(_0x31ea7e);
  if (_0x4c17fc) {
    _0x1f9785.className = _0x4c17fc;
  }
  Object.entries(_0x4bdbb7).forEach(([_0x17016c, _0x2fdd00]) => {
    if (_0x2fdd00 == null) {
      return;
    }
    _0x1f9785.setAttribute(_0x17016c, String(_0x2fdd00));
  });
  return _0x1f9785;
}
function cloneExistingIcon(_0x99f623, _0x583dfe = "") {
  const _0x342df1 = ICON_SELECTORS[_0x99f623] || "";
  const _0x96fdc7 = _0x342df1 ? document.querySelector(_0x342df1) : null;
  const _0x47eb16 = _0x96fdc7?.cloneNode?.(true) || createSharedIcon(_0x99f623);
  if (!_0x47eb16) {
    return null;
  }
  _0x47eb16.removeAttribute?.("id");
  _0x47eb16.setAttribute?.("aria-hidden", "true");
  _0x47eb16.setAttribute?.("focusable", "false");
  if (_0x583dfe) {
    _0x47eb16.classList?.add(_0x583dfe);
  }
  return _0x47eb16;
}
function installNodeManagerButtonIcon(_0x186c18) {
  if (!_0x186c18 || _0x186c18.querySelector?.("svg")) {
    return;
  }
  const _0x395f9b = document.querySelector("#btnToggleDots svg");
  const _0x1e2f7e = _0x395f9b?.cloneNode?.(true);
  if (!_0x1e2f7e) {
    return;
  }
  _0x1e2f7e.removeAttribute?.("id");
  _0x1e2f7e.setAttribute?.("width", "20");
  _0x1e2f7e.setAttribute?.("height", "20");
  _0x1e2f7e.setAttribute?.("aria-hidden", "true");
  _0x1e2f7e.setAttribute?.("focusable", "false");
  _0x186c18.appendChild(_0x1e2f7e);
}
function appendExistingIcon(_0x504338, _0xc9161d, _0x95f481 = "") {
  const _0x2b2f44 = cloneExistingIcon(_0xc9161d, _0x95f481);
  if (_0x2b2f44) {
    _0x504338.appendChild(_0x2b2f44);
  }
  return _0x2b2f44;
}
function getProjectName() {
  const _0x251e67 = window.CanvasTabManager?.getCanvasProjectContext?.();
  const _0x51ecec = document.getElementById("projectNameText")?.textContent;
  return String(_0x251e67?.projectName || _0x51ecec || t("projectDropdown.unnamedCanvas")).replace(/\s+/g, " ").trim();
}
function getNodeListSignature(_0x55f9e6 = {}) {
  const _0x4ed8df = Object.entries(_0x55f9e6 || {}).map(([_0x137f52, _0x29611a]) => {
    let _0x1f3bdc = "";
    try {
      _0x1f3bdc = resolveAssetNodeCoverUrl(_0x29611a || {});
    } catch {
      _0x1f3bdc = "";
    }
    return [String(_0x29611a?.id || _0x137f52), String(_0x29611a?.type || ""), String(_0x29611a?.name || _0x29611a?.title || _0x29611a?.label || ""), String(_0x29611a?.parentId || ""), _0x1f3bdc];
  });
  return JSON.stringify(_0x4ed8df);
}
function normalizeWheelDelta(_0x51d915, _0x20487f) {
  const _0x3f6a37 = _0x51d915.deltaMode === 1 ? 16 : _0x51d915.deltaMode === 2 ? Math.max(1, _0x20487f) : 1;
  return (Number(_0x51d915.deltaY) || Number(_0x51d915.deltaX) || 0) * _0x3f6a37;
}
export function installScrollableWheelBoundary(_0x1eb08e, {
  getAxis = () => "vertical"
} = {}) {
  const _0x2be874 = _0x4880ec => {
    if (getAxis() === "horizontal") {
      const _0x347469 = Math.max(0, Number(_0x1eb08e.clientWidth) || 0);
      const _0x311d7d = Math.max(0, (Number(_0x1eb08e.scrollWidth) || 0) - _0x347469);
      if (_0x311d7d <= 0) {
        return;
      }
      if (!scrollElementHorizontallyWithWheel(_0x4880ec, _0x1eb08e, {
        stopPropagation: true
      })) {
        const _0x48bb93 = Number(_0x4880ec.deltaY) || Number(_0x4880ec.deltaX) || 0;
        if (!_0x48bb93) {
          return;
        }
        _0x4880ec.preventDefault();
        _0x4880ec.stopPropagation();
      }
      return;
    }
    const _0x26330a = Math.max(0, Number(_0x1eb08e.clientHeight) || 0);
    const _0x4d0dbf = Math.max(0, (Number(_0x1eb08e.scrollHeight) || 0) - _0x26330a);
    if (_0x4d0dbf <= 0) {
      return;
    }
    const _0x4d1853 = normalizeWheelDelta(_0x4880ec, _0x26330a);
    if (!_0x4d1853) {
      return;
    }
    _0x1eb08e.scrollTop = Math.min(_0x4d0dbf, Math.max(0, (Number(_0x1eb08e.scrollTop) || 0) + _0x4d1853));
    _0x4880ec.preventDefault();
    _0x4880ec.stopPropagation();
  };
  _0x1eb08e.addEventListener("wheel", _0x2be874, {
    passive: false
  });
  return () => _0x1eb08e.removeEventListener("wheel", _0x2be874);
}
function normalizeRect(_0x182fc8) {
  const _0x3fae6c = Number(_0x182fc8?.left) || 0;
  const _0x63d9f3 = Number(_0x182fc8?.top) || 0;
  const _0x4bc281 = Math.max(0, Number(_0x182fc8?.width) || 0);
  const _0x11f542 = Math.max(0, Number(_0x182fc8?.height) || 0);
  return {
    left: _0x3fae6c,
    top: _0x63d9f3,
    width: _0x4bc281,
    height: _0x11f542,
    right: Number.isFinite(Number(_0x182fc8?.right)) ? Number(_0x182fc8.right) : _0x3fae6c + _0x4bc281,
    bottom: Number.isFinite(Number(_0x182fc8?.bottom)) ? Number(_0x182fc8.bottom) : _0x63d9f3 + _0x11f542
  };
}
export function resolveNodeManagerViewportInsets({
  placement: _0x4029b,
  panelRect: _0xf76d99,
  canvasRect: _0x2633e6,
  gap = 12
} = {}) {
  const _0xff88fb = normalizeRect(_0xf76d99);
  const _0x2f1412 = normalizeRect(_0x2633e6);
  const _0xc3bc72 = Math.max(0, Number(gap) || 0);
  const _0x32ce78 = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  if (!(_0x2f1412.width > 0) || !(_0x2f1412.height > 0)) {
    return _0x32ce78;
  }
  const _0x45a52a = _0xff88fb.right > _0x2f1412.left && _0xff88fb.left < _0x2f1412.right;
  const _0x5cc9f0 = _0xff88fb.bottom > _0x2f1412.top && _0xff88fb.top < _0x2f1412.bottom;
  if (!_0x45a52a || !_0x5cc9f0) {
    return _0x32ce78;
  }
  const _0x591a0b = normalizeNodeManagerPlacement(_0x4029b);
  if (_0x591a0b === "left") {
    _0x32ce78.left = Math.min(_0x2f1412.width - 1, Math.max(0, _0xff88fb.right - _0x2f1412.left + _0xc3bc72));
  } else if (_0x591a0b === "right") {
    _0x32ce78.right = Math.min(_0x2f1412.width - 1, Math.max(0, _0x2f1412.right - _0xff88fb.left + _0xc3bc72));
  } else {
    _0x32ce78.bottom = Math.min(_0x2f1412.height - 1, Math.max(0, _0x2f1412.bottom - _0xff88fb.top + _0xc3bc72));
  }
  return _0x32ce78;
}
export function createNodeManagerPanel({
  graphStore: _0x502f51,
  uiStore: _0x4ab8da,
  appViewport: _0x4d7573,
  executeCanvasCommand: _0x4e9517,
  renameCurrentProject: _0x26f3e0,
  wrap = document.getElementById("v2-wrap"),
  canvasStage = document.querySelector(".v2-canvas-stage"),
  button = document.getElementById("btnNodeManager"),
  showToast = window.showToast
} = {}) {
  if (!_0x502f51 || !wrap || !button) {
    return null;
  }
  installNodeManagerButtonIcon(button);
  let _0x451e39 = "all";
  let _0x2ba173 = "";
  let _0x3b9e7d = false;
  let _0xdad2af = null;
  let _0xbfa78e = "";
  let _0x3ee224 = buildNodeManagerModel({
    nodes: {}
  });
  const _0x22cbc7 = new Set();
  const _0x227d89 = new Set();
  const _0x1f24ec = new Map();
  const _0xfd786d = [];
  let _0x115710 = null;
  const _0x1dedd0 = () => ({
    maxZoom: 1.15,
    viewportInsets: resolveNodeManagerViewportInsets({
      placement: _0x115710?.dataset?.placement,
      panelRect: _0x115710?.getBoundingClientRect?.(),
      canvasRect: canvasStage?.getBoundingClientRect?.()
    })
  });
  const _0x2f98ed = createNodeManagerDragController({
    graphStore: _0x502f51,
    wrap: wrap,
    canvasStage: canvasStage,
    executeCanvasCommand: _0x4e9517,
    onDuplicateFailed: _0x51c12c => {
      showToast?.(_0x51c12c?.message || t("nodeManager.toasts.duplicateFailed"), "error");
    },
    onDuplicated: _0x2f96c4 => {
      _0x4d7573?.focusNode?.(_0x2f96c4, 96, 240, _0x1dedd0());
    }
  });
  _0xfd786d.push(() => _0x2f98ed.destroy());
  _0x115710 = createElement("section", "node-manager-panel canvas-toolbar-panel-surface", {
    id: "nodeManagerPanel",
    role: "complementary",
    "aria-hidden": "true",
    "data-ui-stop": "1"
  });
  const _0x5086ea = createElement("h2", "node-manager-visually-hidden");
  const _0x1a6ab9 = createElement("div", "node-manager-project-row");
  const _0x3b4e12 = createElement("button", "node-manager-project-name", {
    type: "button"
  });
  const _0x5323a7 = createElement("span", "node-manager-project-name-text", {
    "data-tooltip-overflow": "true"
  });
  const _0x5ec5cc = cloneExistingIcon("chevron", "node-manager-project-chevron");
  _0x3b4e12.append(_0x5323a7);
  if (_0x5ec5cc) {
    _0x3b4e12.append(_0x5ec5cc);
  }
  _0x1a6ab9.appendChild(_0x3b4e12);
  const _0x389763 = createElement("div", "node-manager-controls");
  const _0x8245e3 = createElement("div", "node-manager-default-controls");
  const _0x4caf1d = createElement("span", "node-manager-list-title");
  const _0x44cc52 = createElement("button", "node-manager-icon-button node-manager-group-toggle", {
    type: "button"
  });
  appendExistingIcon(_0x44cc52, "chevron", "node-manager-group-toggle-icon");
  const _0x556f08 = createElement("button", "node-manager-filter-button", {
    type: "button",
    "aria-haspopup": "menu"
  });
  const _0x189f6e = createElement("span", "node-manager-filter-label");
  const _0x2c35e1 = cloneExistingIcon("chevron", "node-manager-filter-chevron");
  _0x556f08.appendChild(_0x189f6e);
  if (_0x2c35e1) {
    _0x556f08.appendChild(_0x2c35e1);
  }
  const _0x41ecce = createElement("button", "node-manager-icon-button", {
    type: "button"
  });
  appendExistingIcon(_0x41ecce, "search");
  _0x8245e3.append(_0x4caf1d, _0x44cc52, _0x556f08, _0x41ecce);
  const _0x5c21ac = createElement("div", "node-manager-search-controls");
  const _0x290e38 = createElement("label", "node-manager-search-field");
  const _0x458094 = createElement("input", "node-manager-search-input", {
    type: "search",
    autocomplete: "off",
    spellcheck: "false"
  });
  appendExistingIcon(_0x290e38, "search", "node-manager-search-field-icon");
  _0x290e38.appendChild(_0x458094);
  const _0x47ff42 = createElement("button", "node-manager-icon-button node-manager-search-filter-button", {
    type: "button",
    "aria-haspopup": "menu"
  });
  appendExistingIcon(_0x47ff42, "filter", "node-manager-filter-search-icon");
  const _0x115412 = createElement("button", "node-manager-icon-button", {
    type: "button"
  });
  appendExistingIcon(_0x115412, "close");
  _0x5c21ac.append(_0x290e38, _0x47ff42, _0x115412);
  _0x389763.append(_0x8245e3, _0x5c21ac);
  const _0x10cabb = createElement("div", "node-manager-list", {
    role: "list",
    tabindex: "0"
  });
  const _0x3ff6a0 = createElement("footer", "node-manager-footer");
  const _0x21728b = createElement("button", "node-manager-collapse-button", {
    type: "button"
  });
  appendExistingIcon(_0x21728b, "collapse", "node-manager-collapse-icon");
  const _0x7668d3 = createElement("span", "node-manager-collapse-label");
  _0x21728b.appendChild(_0x7668d3);
  const _0x2f0b6a = createElement("span", "node-manager-total");
  _0x3ff6a0.append(_0x21728b, _0x2f0b6a);
  _0x115710.append(_0x5086ea, _0x1a6ab9, _0x389763, _0x10cabb, _0x3ff6a0);
  wrap.appendChild(_0x115710);
  function _0x235520() {
    return _0x115710.classList.contains("show");
  }
  function _0x282da5() {
    _0xdad2af?.close?.({
      restoreFocus: false
    });
    _0xdad2af = null;
  }
  function _0x2ddf5c(_0x3a0611) {
    const _0x511d5f = normalizeNodeManagerPlacement(_0x3a0611);
    _0x115710.dataset.placement = _0x511d5f;
    return _0x511d5f;
  }
  function _0x106534() {
    const _0x186aaf = getProjectName();
    _0x5323a7.textContent = _0x186aaf;
    _0x5323a7.setAttribute("data-tooltip", _0x186aaf);
  }
  function _0x229751() {
    const _0xceaa3f = _0x3ee224.groupIds || [];
    const _0x597687 = _0xceaa3f.length > 0 && _0xceaa3f.every(_0x2285b7 => _0x22cbc7.has(_0x2285b7));
    const _0x3eb04e = t(_0x597687 ? "nodeManager.expandAll" : "nodeManager.collapseAll");
    _0x44cc52.hidden = _0xceaa3f.length === 0;
    _0x44cc52.classList.toggle("is-expand-action", _0x597687);
    _0x44cc52.setAttribute("aria-label", _0x3eb04e);
    _0x44cc52.title = _0x3eb04e;
  }
  function _0x326af3() {
    _0x5086ea.textContent = t("nodeManager.title");
    _0x115710.setAttribute("aria-label", t("nodeManager.title"));
    _0x3b4e12.setAttribute("aria-label", t("nodeManager.renameProjectAria"));
    _0x4caf1d.textContent = t("nodeManager.listTitle");
    _0x10cabb.setAttribute("aria-label", t("nodeManager.listAria"));
    _0x41ecce.setAttribute("aria-label", t("nodeManager.search"));
    _0x41ecce.title = t("nodeManager.search");
    _0x458094.placeholder = t("nodeManager.searchPlaceholder");
    _0x458094.setAttribute("aria-label", t("nodeManager.search"));
    _0x115412.setAttribute("aria-label", t("nodeManager.closeSearch"));
    _0x115412.title = t("nodeManager.closeSearch");
    _0x556f08.setAttribute("aria-label", t("nodeManager.filter"));
    _0x556f08.title = t("nodeManager.filter");
    _0x47ff42.setAttribute("aria-label", t("nodeManager.filter"));
    _0x47ff42.title = t("nodeManager.filter");
    _0x189f6e.textContent = t("nodeManager.filters." + _0x451e39);
    _0x21728b.setAttribute("aria-label", t("nodeManager.collapsePanel"));
    _0x21728b.title = t("nodeManager.collapsePanel");
    _0x7668d3.textContent = t("nodeManager.collapsePanel");
    _0x2f0b6a.textContent = t("nodeManager.total", {
      count: _0x3ee224.totalNodeCount || 0
    });
    _0x106534();
    _0x229751();
  }
  function _0x8d141a() {
    const _0x17af9e = new Set(getStoreState(_0x502f51).selectedNodeIds || []);
    _0x10cabb.querySelectorAll(".node-manager-row[data-node-id]").forEach(_0x10a152 => {
      const _0x1dbbb4 = _0x17af9e.has(_0x10a152.dataset.nodeId);
      _0x10a152.classList.toggle("is-selected", _0x1dbbb4);
      const _0x249c87 = _0x10a152.querySelector(".node-manager-row-main");
      if (_0x1dbbb4) {
        _0x249c87?.setAttribute("aria-current", "true");
      } else {
        _0x249c87?.removeAttribute("aria-current");
      }
    });
  }
  function _0x1924ae(_0x25d574) {
    const _0x1a078a = String(_0x25d574 || "");
    return Array.from(_0x10cabb.querySelectorAll(".node-manager-row[data-node-id]")).find(_0x3d606e => _0x3d606e.dataset.nodeId === _0x1a078a) || null;
  }
  function _0x405889(_0x59c6a5, _0x4d3b07) {
    const _0x4d3edd = _0x4d3b07 === "group" ? "folder" : ICON_SELECTORS[_0x4d3b07] ? _0x4d3b07 : "node";
    appendExistingIcon(_0x59c6a5, _0x4d3edd, "node-manager-thumb-fallback-icon");
  }
  function _0x4fd202(_0x26aa03) {
    const _0x111eb8 = createElement("span", "node-manager-thumb is-" + _0x26aa03.category);
    if (_0x26aa03.kind === "group") {
      _0x111eb8.classList.add("node-manager-folder-icon");
      _0x111eb8.innerHTML = MATERIAL_FOLDER_ICON_MARKUP;
      return _0x111eb8;
    }
    let _0x249d30 = "";
    try {
      _0x249d30 = resolveAssetNodeCoverUrl(_0x26aa03.node || {});
    } catch {
      _0x249d30 = "";
    }
    if (!_0x249d30) {
      _0x405889(_0x111eb8, _0x26aa03.category);
      return _0x111eb8;
    }
    const _0x350c5a = createElement("img", "node-manager-thumb-image", {
      src: _0x249d30,
      alt: "",
      loading: "lazy",
      decoding: "async",
      draggable: "false"
    });
    _0x350c5a.addEventListener("error", () => {
      _0x350c5a.remove();
      _0x405889(_0x111eb8, _0x26aa03.category);
    }, {
      once: true
    });
    _0x111eb8.appendChild(_0x350c5a);
    if (_0x26aa03.category === "video") {
      const _0x4bfae1 = createElement("span", "node-manager-video-badge");
      if (appendExistingIcon(_0x4bfae1, "videoPlay")) {
        _0x111eb8.appendChild(_0x4bfae1);
      }
    }
    return _0x111eb8;
  }
  function _0x383a56(_0x3d79ce) {
    const _0x1dfe95 = document.getElementById(_0x3d79ce);
    const _0x83f09e = _0x1dfe95?.querySelector?.("video");
    if (_0x83f09e && _0x83f09e.paused === false) {
      return true;
    }
    const _0x300f71 = _0x1dfe95?.querySelector?.(".video-play-btn");
    if (_0x300f71) {
      _0x300f71.click();
      return true;
    }
    if (_0x83f09e?.play) {
      Promise.resolve(_0x83f09e.play()).catch(() => {});
      return true;
    }
    return false;
  }
  function _0x74e7ee(_0x471c90) {
    const _0x3c99e1 = performance.now();
    const _0x1540b8 = () => {
      if (_0x383a56(_0x471c90)) {
        return;
      }
      if (performance.now() - _0x3c99e1 < VIDEO_PLAY_RETRY_MS) {
        requestAnimationFrame(_0x1540b8);
      }
    };
    window.setTimeout(_0x1540b8, 280);
  }
  function _0x546634(_0x20d279) {
    const _0x606ffb = _0x4e9517?.("node.select", {
      ids: [_0x20d279.id]
    });
    if (_0x606ffb?.ok === false) {
      return;
    }
    if (_0x20d279.category === "video") {
      _0x383a56(_0x20d279.id);
    }
    _0x4d7573?.focusNode?.(_0x20d279.id, 96, 320, _0x1dedd0());
    if (_0x20d279.category === "video") {
      _0x74e7ee(_0x20d279.id);
    }
  }
  function _0x5a32b7(_0x581808, _0x2ce234) {
    const _0x4122a2 = _0x1924ae(_0x581808);
    if (!_0x4122a2) {
      return;
    }
    _0x4122a2.classList.toggle("is-busy", _0x2ce234);
    _0x4122a2.setAttribute("aria-busy", String(_0x2ce234));
    _0x4122a2.querySelector(".node-manager-row-spinner")?.remove();
    if (_0x2ce234) {
      const _0x34e849 = createElement("span", "project-package-loading-spinner node-manager-row-spinner", {
        "aria-hidden": "true"
      });
      _0x4122a2.appendChild(_0x34e849);
    }
  }
  function _0x22d5f8() {
    _0x5d66a9();
  }
  function _0x455007(_0x5f04cf) {
    const _0x349d1a = _0x1924ae(_0x5f04cf.id);
    const _0x1068a7 = _0x349d1a?.querySelector(".node-manager-row-name");
    if (!_0x349d1a || !_0x1068a7) {
      return;
    }
    const _0x1dc598 = _0x5f04cf.name || t("nodeManager.unnamed");
    const _0x4e0ef9 = createElement("input", "node-manager-row-rename", {
      type: "text",
      "aria-label": t("nodeManager.actions.rename")
    });
    _0x4e0ef9.value = _0x1dc598;
    _0x1068a7.replaceChildren(_0x4e0ef9);
    _0x349d1a.classList.add("is-renaming");
    let _0x471764 = false;
    const _0x252f60 = () => {
      if (_0x471764) {
        return;
      }
      _0x471764 = true;
      const _0x1c563a = String(_0x4e0ef9.value || "").replace(/\s+/g, " ").trim();
      if (!_0x1c563a || _0x1c563a === _0x1dc598) {
        _0x22d5f8();
        return;
      }
      const _0x103ac5 = _0x4e9517?.("node.rename", {
        nodeId: _0x5f04cf.id,
        name: _0x1c563a
      });
      if (_0x103ac5?.ok === false) {
        showToast?.(_0x103ac5.message || t("nodeManager.toasts.renameFailed"), "error");
        _0x5d66a9();
      }
    };
    _0x4e0ef9.addEventListener("pointerdown", _0x41e047 => _0x41e047.stopPropagation());
    _0x4e0ef9.addEventListener("keydown", _0x222f10 => {
      if (_0x222f10.key === "Enter") {
        _0x222f10.preventDefault();
        _0x222f10.stopPropagation();
        _0x4e0ef9.blur();
      } else if (_0x222f10.key === "Escape") {
        _0x222f10.preventDefault();
        _0x222f10.stopPropagation();
        _0x471764 = true;
        _0x22d5f8();
      }
    });
    _0x4e0ef9.addEventListener("blur", _0x252f60, {
      once: true
    });
    _0x4e0ef9.focus();
    _0x4e0ef9.select();
  }
  async function _0x3a39ab(_0x4408e1) {
    if (_0x227d89.has(_0x4408e1.id)) {
      return;
    }
    _0x227d89.add(_0x4408e1.id);
    _0x5a32b7(_0x4408e1.id, true);
    try {
      await downloadNodeOutput({
        node: getStoreState(_0x502f51).nodes?.[_0x4408e1.id] || _0x4408e1.node,
        nodeId: _0x4408e1.id,
        showToast: showToast
      });
    } finally {
      _0x227d89.delete(_0x4408e1.id);
      _0x5a32b7(_0x4408e1.id, false);
    }
  }
  function _0x5386ef(_0x7c24a7) {
    const _0x53c389 = _0x4e9517?.("node.delete", {
      ids: [_0x7c24a7.id]
    });
    if (_0x53c389?.ok === false) {
      showToast?.(_0x53c389.message || t("nodeManager.toasts.deleteFailed"), "error");
    }
  }
  function _0x449d4b(_0x412e7e, _0x2c36a9, _0x56e1ad, _0x5eb0ff) {
    _0x282da5();
    _0xdad2af = showContextMenu(_0x2c36a9, _0x56e1ad, [{
      label: t("nodeManager.actions.rename"),
      action: () => _0x455007(_0x412e7e)
    }, {
      label: t("nodeManager.actions.download"),
      disabled: _0x412e7e.kind === "group" || _0x227d89.has(_0x412e7e.id),
      action: () => void _0x3a39ab(_0x412e7e)
    }, {
      label: t("nodeManager.actions.delete"),
      danger: true,
      action: () => _0x5386ef(_0x412e7e)
    }], {
      ariaLabel: t("nodeManager.actions.menuAria", {
        name: _0x412e7e.name
      }),
      ownerElement: _0x5eb0ff?.closest?.(".node-manager-row") || _0x5eb0ff,
      ownerRoot: _0x10cabb,
      restoreTarget: _0x5eb0ff,
      sidebarSubmenuOwner: SIDEBAR_KEY,
      onClose: () => {
        _0xdad2af = null;
      }
    });
  }
  function _0x501cfb(_0xbdb4e7) {
    const _0x5c58cd = _0x227d89.has(_0xbdb4e7.id);
    const _0x31b417 = createElement("div", "node-manager-row is-" + _0xbdb4e7.kind, {
      role: "listitem",
      "aria-busy": String(_0x5c58cd),
      "data-node-id": _0xbdb4e7.id
    });
    _0x31b417.classList.toggle("is-busy", _0x5c58cd);
    _0x31b417.style.setProperty("--node-manager-indent", Math.max(0, _0xbdb4e7.depth) * 16 + "px");
    if (_0xbdb4e7.kind === "group") {
      _0x31b417.setAttribute("aria-expanded", String(!_0xbdb4e7.collapsed));
    }
    if (_0xbdb4e7.kind === "group") {
      const _0x5087b0 = createElement("button", "node-manager-group-chevron", {
        type: "button",
        "aria-expanded": String(!_0xbdb4e7.collapsed),
        "aria-label": t(_0xbdb4e7.collapsed ? "nodeManager.expandGroup" : "nodeManager.collapseGroup", {
          name: _0xbdb4e7.name
        })
      });
      appendExistingIcon(_0x5087b0, "treeChevron");
      _0x5087b0.classList.toggle("is-open", !_0xbdb4e7.collapsed);
      _0x5087b0.addEventListener("click", _0x25c8cf => {
        _0x25c8cf.preventDefault();
        _0x25c8cf.stopPropagation();
        if (_0x22cbc7.has(_0xbdb4e7.id)) {
          _0x22cbc7.delete(_0xbdb4e7.id);
        } else {
          _0x22cbc7.add(_0xbdb4e7.id);
        }
        const _0x5e8fbd = !_0x22cbc7.has(_0xbdb4e7.id);
        _0x31b417.setAttribute("aria-expanded", String(_0x5e8fbd));
        _0x5087b0.setAttribute("aria-expanded", String(_0x5e8fbd));
        _0x5087b0.setAttribute("aria-label", t(_0x5e8fbd ? "nodeManager.collapseGroup" : "nodeManager.expandGroup", {
          name: _0xbdb4e7.name
        }));
        _0x5087b0.classList.toggle("is-open", _0x5e8fbd);
        const _0x4af91f = _0x1f24ec.get(_0xbdb4e7.id);
        if (_0x4af91f) {
          window.clearTimeout(_0x4af91f);
        }
        const _0x71d806 = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (_0x71d806) {
          _0x58d3f5();
          return;
        }
        _0x1f24ec.set(_0xbdb4e7.id, window.setTimeout(() => {
          _0x1f24ec.delete(_0xbdb4e7.id);
          _0x58d3f5();
        }, GROUP_DISCLOSURE_MOTION_MS));
      });
      _0x31b417.appendChild(_0x5087b0);
    } else {
      _0x31b417.appendChild(createElement("span", "node-manager-group-chevron-spacer"));
    }
    const _0x21abda = createElement("button", "node-manager-row-main", {
      type: "button"
    });
    _0x21abda.appendChild(_0x4fd202(_0xbdb4e7));
    const _0x3a860d = _0xbdb4e7.name || t("nodeManager.unnamed");
    const _0x1d3018 = createElement("span", "node-manager-row-name", {
      "data-tooltip": _0x3a860d,
      "data-tooltip-overflow": "true"
    });
    _0x1d3018.textContent = _0x3a860d;
    _0x21abda.appendChild(_0x1d3018);
    if (_0xbdb4e7.kind === "group") {
      const _0x7fa5a1 = createElement("span", "node-manager-group-count");
      _0x7fa5a1.textContent = t("nodeManager.groupCount", {
        count: _0xbdb4e7.childCount || 0
      });
      _0x21abda.appendChild(_0x7fa5a1);
    } else {
      _0x2f98ed.bindNodeRow({
        trigger: _0x21abda,
        row: _0x31b417,
        nodeId: _0xbdb4e7.id
      });
    }
    _0x21abda.addEventListener("click", () => _0x546634(_0xbdb4e7));
    _0x31b417.appendChild(_0x21abda);
    const _0x39c858 = createElement("button", "node-manager-more-button", {
      type: "button",
      "aria-haspopup": "menu",
      "aria-label": t("nodeManager.actions.more"),
      title: t("nodeManager.actions.more")
    });
    appendExistingIcon(_0x39c858, "more", "node-manager-more-icon");
    _0x39c858.addEventListener("click", _0x783cd5 => {
      _0x783cd5.preventDefault();
      _0x783cd5.stopPropagation();
      const _0x1665ab = _0x39c858.getBoundingClientRect();
      _0x449d4b(_0xbdb4e7, _0x1665ab.right, _0x1665ab.bottom + 4, _0x39c858);
    });
    _0x31b417.appendChild(_0x39c858);
    if (_0x5c58cd) {
      _0x31b417.appendChild(createElement("span", "project-package-loading-spinner node-manager-row-spinner", {
        "aria-hidden": "true"
      }));
    }
    _0x31b417.addEventListener("contextmenu", _0x41cdde => {
      if (_0x41cdde.target?.closest?.("input")) {
        return;
      }
      _0x41cdde.preventDefault();
      _0x41cdde.stopPropagation();
      _0x449d4b(_0xbdb4e7, _0x41cdde.clientX, _0x41cdde.clientY, _0x21abda);
    });
    return _0x31b417;
  }
  function _0x5d66a9({
    force = false
  } = {}) {
    const _0x79e77 = getStoreState(_0x502f51);
    const _0x584e3a = getNodeListSignature(_0x79e77.nodes || {});
    if (!force && _0x584e3a === _0xbfa78e) {
      _0x8d141a();
      return;
    }
    _0xbfa78e = _0x584e3a;
    const _0x10539d = _0x10cabb.scrollTop;
    const _0x3b96e0 = _0x10cabb.scrollLeft;
    _0x3ee224 = buildNodeManagerModel({
      nodes: _0x79e77.nodes || {},
      filter: _0x451e39,
      query: _0x2ba173,
      collapsedGroupIds: _0x22cbc7
    });
    const _0x5dd3ab = document.createDocumentFragment();
    if (_0x3ee224.items.length === 0) {
      const _0x4da93e = createElement("div", "node-manager-empty", {
        role: "status"
      });
      _0x4da93e.textContent = t("nodeManager.empty");
      _0x5dd3ab.appendChild(_0x4da93e);
    } else {
      _0x3ee224.items.forEach(_0x334534 => _0x5dd3ab.appendChild(_0x501cfb(_0x334534)));
    }
    _0x282da5();
    _0x10cabb.replaceChildren(_0x5dd3ab);
    _0x10cabb.scrollTop = _0x10539d;
    _0x10cabb.scrollLeft = _0x3b96e0;
    _0x189f6e.textContent = t("nodeManager.filters." + _0x451e39);
    _0x2f0b6a.textContent = t("nodeManager.total", {
      count: _0x3ee224.totalNodeCount
    });
    _0x229751();
    _0x8d141a();
  }
  function _0x58d3f5() {
    _0xbfa78e = "";
    _0x5d66a9({
      force: true
    });
  }
  function _0x49d549(_0x5bb719 = _0x556f08) {
    _0x282da5();
    const _0x2a3ca7 = _0x5bb719.getBoundingClientRect();
    _0xdad2af = showContextMenu(_0x2a3ca7.left, _0x2a3ca7.bottom + 4, NODE_MANAGER_FILTERS.map(_0x76e002 => ({
      label: t("nodeManager.filters." + _0x76e002),
      checked: _0x76e002 === _0x451e39,
      action: () => {
        _0x451e39 = _0x76e002;
        _0x58d3f5();
      }
    })), {
      ariaLabel: t("nodeManager.filter"),
      ownerElement: _0x5bb719,
      ownerRoot: _0x389763,
      restoreTarget: _0x5bb719,
      sidebarSubmenuOwner: SIDEBAR_KEY,
      onClose: () => {
        _0xdad2af = null;
      }
    });
  }
  function _0x29799b(_0x2cf41c, {
    clear = false,
    focus = true
  } = {}) {
    _0x3b9e7d = _0x2cf41c === true;
    if (clear) {
      _0x2ba173 = "";
      _0x458094.value = "";
    }
    _0x115710.classList.toggle("is-searching", _0x3b9e7d);
    if (focus && _0x3b9e7d) {
      requestAnimationFrame(() => _0x458094.focus());
    }
    _0x58d3f5();
  }
  function _0x3a4c50() {
    const _0x469fb9 = getProjectName();
    const _0x51ebcd = createElement("input", "node-manager-project-rename", {
      type: "text",
      "aria-label": t("nodeManager.projectNameAria")
    });
    _0x51ebcd.value = _0x469fb9;
    _0x1a6ab9.replaceChildren(_0x51ebcd);
    let _0x53f250 = false;
    let _0x50d0b8 = false;
    const _0x26251e = () => {
      _0x1a6ab9.replaceChildren(_0x3b4e12);
      _0x106534();
    };
    const _0x14e270 = () => {
      if (_0x53f250) {
        return;
      }
      _0x53f250 = true;
      _0x26251e();
    };
    const _0x443f41 = async () => {
      if (_0x53f250 || _0x50d0b8) {
        return;
      }
      const _0x3b0ab3 = String(_0x51ebcd.value || "").replace(/\s+/g, " ").trim();
      if (!_0x3b0ab3 || _0x3b0ab3 === _0x469fb9) {
        _0x14e270();
        return;
      }
      _0x50d0b8 = true;
      _0x51ebcd.disabled = true;
      _0x1a6ab9.setAttribute("aria-busy", "true");
      const _0x108ce5 = createElement("span", "project-package-loading-spinner node-manager-project-spinner", {
        "aria-hidden": "true"
      });
      _0x1a6ab9.appendChild(_0x108ce5);
      try {
        const _0x353310 = await Promise.resolve(_0x26f3e0?.(_0x3b0ab3));
        if (!_0x353310) {
          throw new Error(t("nodeManager.toasts.projectRenameFailed"));
        }
        _0x53f250 = true;
        _0x26251e();
      } catch (_0x4e1d06) {
        _0x50d0b8 = false;
        _0x51ebcd.disabled = false;
        _0x108ce5.remove();
        showToast?.(_0x4e1d06?.message || t("nodeManager.toasts.projectRenameFailed"), "error");
        _0x51ebcd.focus();
        _0x51ebcd.select();
      } finally {
        _0x1a6ab9.removeAttribute("aria-busy");
      }
    };
    _0x51ebcd.addEventListener("keydown", _0x62e00b => {
      if (_0x62e00b.key === "Enter") {
        _0x62e00b.preventDefault();
        _0x62e00b.stopPropagation();
        _0x443f41();
      } else if (_0x62e00b.key === "Escape") {
        _0x62e00b.preventDefault();
        _0x62e00b.stopPropagation();
        _0x14e270();
      }
    });
    _0x51ebcd.addEventListener("blur", () => void _0x443f41());
    _0x51ebcd.focus();
    _0x51ebcd.select();
  }
  function _0x578575() {
    _0x115710.classList.add("show");
    _0x115710.setAttribute("aria-hidden", "false");
    wrap.classList.add("node-manager-open");
    _0x326af3();
    _0x5d66a9({
      force: true
    });
  }
  function _0x182ef8() {
    const _0x4b24ac = _0x115710.contains(document.activeElement);
    _0x282da5();
    _0x115710.classList.remove("show");
    _0x115710.setAttribute("aria-hidden", "true");
    wrap.classList.remove("node-manager-open");
    if (_0x4b24ac) {
      requestAnimationFrame(() => button.focus());
    }
  }
  registerSidebarSubmenu({
    key: SIDEBAR_KEY,
    button: button,
    panel: _0x115710,
    open: _0x578575,
    close: _0x182ef8,
    isOpen: _0x235520,
    ignorePointerDown: _0x176b93 => !!_0x176b93?.target?.closest?.("[data-sidebar-submenu-owner=\"" + SIDEBAR_KEY + "\"]")
  });
  button.removeAttribute("aria-haspopup");
  _0x3b4e12.addEventListener("click", _0x3a4c50);
  _0x41ecce.addEventListener("click", () => _0x29799b(true));
  _0x115412.addEventListener("click", () => _0x29799b(false, {
    clear: true,
    focus: false
  }));
  _0x556f08.addEventListener("click", () => _0x49d549(_0x556f08));
  _0x47ff42.addEventListener("click", () => _0x49d549(_0x47ff42));
  _0x44cc52.addEventListener("click", () => {
    const _0x3a1c7f = _0x3ee224.groupIds || [];
    const _0x5c4ad9 = _0x3a1c7f.length > 0 && _0x3a1c7f.every(_0x1f11ed => _0x22cbc7.has(_0x1f11ed));
    if (_0x5c4ad9) {
      _0x22cbc7.clear();
    } else {
      _0x3a1c7f.forEach(_0x2ee96d => _0x22cbc7.add(_0x2ee96d));
    }
    _0x58d3f5();
  });
  _0x21728b.addEventListener("click", () => closeSidebarSubmenu(SIDEBAR_KEY));
  _0x458094.addEventListener("input", () => {
    _0x2ba173 = _0x458094.value;
    _0x58d3f5();
  });
  _0x458094.addEventListener("keydown", _0x418a25 => {
    if (_0x418a25.key !== "Escape") {
      return;
    }
    _0x418a25.preventDefault();
    _0x418a25.stopPropagation();
    _0x29799b(false, {
      clear: true,
      focus: false
    });
    _0x41ecce.focus();
  });
  _0xfd786d.push(installScrollableWheelBoundary(_0x10cabb, {
    getAxis: () => _0x115710.dataset.placement === "bottom" ? "horizontal" : "vertical"
  }));
  _0xfd786d.push(() => {
    _0x1f24ec.forEach(_0x4d70d0 => window.clearTimeout(_0x4d70d0));
    _0x1f24ec.clear();
  });
  const _0x18a76b = _0x502f51.subscribeSelector?.(_0x6b731f => Number(_0x6b731f._persistRev || 0), () => {
    if (!_0x235520()) {
      _0xbfa78e = "";
      return;
    }
    _0x5d66a9();
  });
  const _0x11c875 = _0x502f51.subscribeSelector?.(_0x439b93 => (_0x439b93.selectedNodeIds || []).join("|"), _0x8d141a);
  const _0x56c884 = _0x4ab8da?.subscribeSelector?.(_0x52de1e => normalizeNodeManagerPlacement(_0x52de1e.ui?.nodeManagerPlacement), _0x2ddf5c);
  _0xfd786d.push(_0x18a76b, _0x11c875, _0x56c884);
  const _0x9711dd = _0x2165a0 => _0x2ddf5c(_0x2165a0?.detail?.placement);
  const _0x59df6f = () => {
    _0x106534();
    _0xbfa78e = "";
    if (_0x235520()) {
      _0x5d66a9({
        force: true
      });
    }
  };
  const _0x129d06 = () => {
    _0x326af3();
    if (_0x235520()) {
      _0x58d3f5();
    }
  };
  window.addEventListener(NODE_MANAGER_PLACEMENT_EVENT, _0x9711dd);
  window.addEventListener("aicanvas:active-canvas-changed", _0x59df6f);
  window.addEventListener("aicanvas:locale-change", _0x129d06);
  _0xfd786d.push(() => window.removeEventListener(NODE_MANAGER_PLACEMENT_EVENT, _0x9711dd));
  _0xfd786d.push(() => window.removeEventListener("aicanvas:active-canvas-changed", _0x59df6f));
  _0xfd786d.push(() => window.removeEventListener("aicanvas:locale-change", _0x129d06));
  const _0x29336c = document.getElementById("projectNameText");
  const _0x5f00d3 = _0x29336c && typeof MutationObserver === "function" ? new MutationObserver(_0x106534) : null;
  _0x5f00d3?.observe(_0x29336c, {
    childList: true,
    characterData: true,
    subtree: true
  });
  _0xfd786d.push(() => _0x5f00d3?.disconnect());
  _0x2ddf5c(getStoreState(_0x4ab8da).ui?.nodeManagerPlacement);
  _0x326af3();
  _0x5d66a9({
    force: true
  });
  return {
    panel: _0x115710,
    open: () => _0x578575(),
    close: () => closeSidebarSubmenu(SIDEBAR_KEY),
    destroy() {
      _0x182ef8();
      _0xfd786d.forEach(_0x573ec7 => _0x573ec7?.());
      _0x115710.remove();
    }
  };
}