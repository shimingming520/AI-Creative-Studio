import { getViewportScreenCenter, screenToWorld } from "../../core/math.js";
import { createPanorama360NodeData, createPanoramaSceneNodeData } from "../panoramaSceneNode/sceneNode.js";
import { createStoryboardScriptNodeData } from "../../core/storyboardScriptFactory.js";
import { createEmptyCollageNodeData } from "../collage/collageFactory.js";
import { createWhiteboardNodeData } from "../whiteboard/whiteboardNodeData.js";
import { t } from "../../i18n/index.js";
import { isNodeCreationTypeEnabled } from "../nodeCreationMenuCatalog.js";
import { normalizeCanvasToolbarPlacement } from "../canvasToolbarPlacement.js";
const DEV_ONLY_NODE_TYPES = new Set();
export function createSpecialNodeDataByType({
  type: _0x80fd3f,
  id: _0x39456d,
  x: _0x140c4e,
  y: _0x251ef3,
  width: _0x21795c,
  height: _0x370726,
  name: _0x545a1c
}) {
  if (_0x80fd3f === "panorama-scene") {
    return createPanoramaSceneNodeData({
      id: _0x39456d,
      x: _0x140c4e,
      y: _0x251ef3,
      width: _0x21795c,
      height: _0x370726,
      name: _0x545a1c
    });
  }
  if (_0x80fd3f === "panorama-360") {
    return createPanorama360NodeData({
      id: _0x39456d,
      x: _0x140c4e,
      y: _0x251ef3,
      width: _0x21795c,
      height: _0x370726,
      name: _0x545a1c
    });
  }
  if (_0x80fd3f === "storyboard-script") {
    return createStoryboardScriptNodeData({
      id: _0x39456d,
      x: _0x140c4e,
      y: _0x251ef3,
      width: _0x21795c,
      height: _0x370726,
      name: _0x545a1c
    });
  }
  if (_0x80fd3f === "collage") {
    return createEmptyCollageNodeData({
      id: _0x39456d,
      x: _0x140c4e,
      y: _0x251ef3,
      width: _0x21795c,
      height: _0x370726,
      name: _0x545a1c || t("nodeCreation.items.collage.defaultName")
    });
  }
  if (_0x80fd3f === "whiteboard") {
    return createWhiteboardNodeData({
      id: _0x39456d,
      x: _0x140c4e,
      y: _0x251ef3,
      width: _0x21795c,
      height: _0x370726,
      name: _0x545a1c || "白板"
    });
  }
  if (_0x80fd3f === "web-preview") {
    return {
      id: _0x39456d,
      type: _0x80fd3f,
      x: _0x140c4e,
      y: _0x251ef3,
      width: _0x21795c,
      height: _0x370726,
      name: _0x545a1c || t("nodeCreation.items.webPreview.defaultName")
    };
  }
  return null;
}
function isDevModeOn() {
  return window.DEV_MODE === true || document.body.classList.contains("dev-mode");
}
function isDevOnlyNodeType(_0x2398a7) {
  return DEV_ONLY_NODE_TYPES.has(String(_0x2398a7 || ""));
}
function resolveNodeSize(_0x449efb, _0xa7ce5f, {
  forDrop = false
} = {}) {
  let {
    width: _0xbae542,
    height: _0x116651
  } = _0xa7ce5f(_0x449efb);
  if (forDrop && _0x449efb === "test-video") {
    _0xbae542 = 300;
    _0x116651 = 300;
  }
  if (forDrop && _0x449efb === "scene-detection") {
    _0xbae542 = 400;
    _0x116651 = 500;
  }
  return {
    width: _0xbae542,
    height: _0x116651
  };
}
export function initAppNodeEntry({
  graphStore: _0x527ac8,
  wrap: _0x1cfb52,
  btnAddEl: _0x38d5d1,
  nodeMenuEl: _0xb09d23,
  initCanvasContextMenu: _0x4b2323,
  getNodeDefaultSize: _0xa9f85f,
  executeCommand: _0x5accda,
  getCanvasToolbarPlacement: _0x33b9f7
} = {}) {
  const _0x40ee4a = () => {
    const _0x348d20 = isDevModeOn();
    document.querySelectorAll(".nam-item[data-type]").forEach(_0x8dae6b => {
      const _0x41d970 = isDevOnlyNodeType(_0x8dae6b.dataset.type);
      const _0x37e8ce = !isNodeCreationTypeEnabled(_0x8dae6b.dataset.type) || _0x41d970 && !_0x348d20;
      _0x8dae6b.hidden = _0x37e8ce;
      _0x8dae6b.setAttribute("aria-hidden", _0x37e8ce ? "true" : "false");
    });
  };
  const _0x47cbd1 = (_0x1c9c25, _0x406a8a, _0x3e12c1, _0x15b060 = {}) => {
    if (typeof _0x5accda !== "function") {
      throw new Error("appNodeEntry requires executeCommand for canvas mutations.");
    }
    const {
      width: _0x39a301,
      height: _0x523e52
    } = resolveNodeSize(_0x1c9c25, _0xa9f85f, _0x15b060);
    _0x5accda("create_node", {
      type: _0x1c9c25,
      x: _0x406a8a - _0x39a301 / 2,
      y: _0x3e12c1 - _0x523e52 / 2,
      width: _0x39a301,
      height: _0x523e52,
      name: _0x1c9c25 === "media-clip" ? t("nodeCreation.items.mediaClip.defaultName") : ""
    });
  };
  const _0x127827 = _0x3f3318 => {
    const {
      viewport: _0x1ecf7f
    } = _0x527ac8.getState();
    const _0x93fd2d = getViewportScreenCenter(_0x1ecf7f, window.innerWidth, window.innerHeight);
    const _0x3976d4 = screenToWorld(_0x93fd2d.x, _0x93fd2d.y, _0x1ecf7f);
    _0x47cbd1(_0x3f3318, _0x3976d4.x, _0x3976d4.y);
  };
  if (_0x38d5d1) {
    let _0x4e3f69 = null;
    let _0xea985f = "";
    let _0x5d3450 = null;
    const _0x41d908 = () => {
      clearTimeout(_0x4e3f69);
      _0x4e3f69 = null;
    };
    const _0x1d4060 = () => {
      _0x41d908();
      _0xea985f = "";
      if (_0x5d3450) {
        document.removeEventListener("pointerdown", _0x5d3450, true);
        _0x5d3450 = null;
      }
      document.querySelector("#v2PickerOverlay")?.remove();
    };
    const _0x335e80 = () => {
      if (_0xea985f === "pinned") {
        return;
      }
      _0x41d908();
      _0x4e3f69 = setTimeout(_0x1d4060, 200);
    };
    const _0x2fe834 = _0x5058e6 => {
      const _0xf880f8 = document.querySelector?.("#v2PickerOverlay .v2-node-picker");
      if (!_0xf880f8?.getBoundingClientRect) {
        return;
      }
      const _0xcbd040 = document.querySelector?.(".header")?.getBoundingClientRect?.().bottom || 0;
      const _0x1cd569 = Math.max(12, _0xcbd040 + 12);
      const _0x1d876b = 12;
      const _0x4e79ec = Math.max(180, _0x5058e6.top - _0x1d876b - _0x1cd569);
      _0xf880f8.style.maxHeight = _0x4e79ec + "px";
      _0xf880f8.style.transformOrigin = "bottom left";
      const _0x357499 = _0xf880f8.getBoundingClientRect();
      const _0x1c77ee = Number(_0xf880f8.offsetHeight) || _0x357499.height;
      const _0x5bbfda = Math.max(12, window.innerWidth - _0x357499.width - 12);
      _0xf880f8.style.left = Math.min(Math.max(_0x5058e6.left, 12), _0x5bbfda) + "px";
      _0xf880f8.style.top = Math.max(_0x1cd569, _0x5058e6.top - _0x1d876b - _0x1c77ee) + "px";
    };
    const _0x2e1844 = _0x5c8483 => {
      const _0x5b8d14 = document.querySelector?.("#v2PickerOverlay .v2-node-picker");
      if (!_0x5b8d14?.getBoundingClientRect) {
        return;
      }
      const _0x2ebeb9 = 12;
      const _0x2a0211 = _0x5b8d14.getBoundingClientRect();
      const _0x55f2fc = Number(_0x5b8d14.offsetWidth) || _0x2a0211.width;
      if (!(_0x55f2fc > 0)) {
        return;
      }
      _0x5b8d14.style.left = Math.max(12, _0x5c8483.left - _0x2ebeb9 - _0x55f2fc) + "px";
      _0x5b8d14.style.transformOrigin = "top right";
    };
    const _0x593849 = _0x21e7a6 => {
      const _0x5ab628 = document.querySelector("#v2PickerOverlay");
      if (!_0x5ab628) {
        return;
      }
      _0x41d908();
      _0xea985f = _0x21e7a6;
      _0x5ab628.style.pointerEvents = "none";
      const _0x786e08 = _0x5ab628.querySelector(".v2-node-picker");
      if (_0x786e08) {
        _0x786e08.style.pointerEvents = "auto";
        _0x786e08.addEventListener("mouseenter", _0x41d908);
        _0x786e08.addEventListener("mouseleave", _0x335e80);
      }
      if (_0x5d3450) {
        document.removeEventListener("pointerdown", _0x5d3450, true);
      }
      _0x5d3450 = _0x2cc18e => {
        if (_0x786e08?.contains(_0x2cc18e.target) || _0x38d5d1.contains(_0x2cc18e.target)) {
          _0x41d908();
          return;
        }
        _0x1d4060();
      };
      const _0xc81714 = _0x5d3450;
      requestAnimationFrame(() => _0x5d3450 === _0xc81714 && _0xc81714 && document.addEventListener("pointerdown", _0xc81714, true));
    };
    const _0x39e446 = _0xa6f088 => {
      _0x41d908();
      _0xea985f = _0xa6f088;
      const _0x6ee52c = _0x38d5d1.getBoundingClientRect();
      const _0x476e19 = normalizeCanvasToolbarPlacement(_0x33b9f7?.());
      let _0x8d059b = _0x6ee52c.right + 12;
      if (_0x476e19 === "bottom") {
        _0x8d059b = _0x6ee52c.left;
      } else if (_0x476e19 === "right") {
        _0x8d059b = _0x6ee52c.left - 12;
      }
      _0x4b2323._showPicker?.(_0x8d059b, _0x6ee52c.top, true);
      if (_0x476e19 === "bottom") {
        _0x2fe834(_0x6ee52c);
      } else if (_0x476e19 === "right") {
        _0x2e1844(_0x6ee52c);
      }
      document.querySelector("#v2PickerOverlay")?.classList.add("is-sidebar-picker");
      requestAnimationFrame(() => _0x593849(_0xa6f088));
    };
    _0x38d5d1.addEventListener("click", _0x6d6a07 => {
      _0x6d6a07.preventDefault();
      _0x6d6a07.stopPropagation();
      _0x39e446("pinned");
    });
    _0x38d5d1.addEventListener("mouseenter", () => {
      _0x41d908();
      if (document.querySelector("#v2PickerOverlay")) {
        return;
      }
      _0x39e446("hover");
    });
    _0x38d5d1.addEventListener("mouseleave", _0x335e80);
  }
  document.addEventListener("click", _0x454708 => {
    if (_0xb09d23 && _0xb09d23.style.display !== "none" && !_0x454708.target.closest("#nodeMenu") && !_0x454708.target.closest("#btnAdd")) {
      _0xb09d23.style.display = "none";
    }
  });
  _0x40ee4a();
  if (document.body) {
    const _0x3ad81a = new MutationObserver(() => {
      _0x40ee4a();
    });
    _0x3ad81a.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }
  document.querySelectorAll(".nam-item").forEach(_0x25eeac => {
    _0x25eeac.setAttribute("draggable", isNodeCreationTypeEnabled(_0x25eeac.dataset.type) ? "true" : "false");
    _0x25eeac.addEventListener("dragstart", _0x3fc790 => {
      const _0x186561 = _0x3fc790.currentTarget.dataset.type;
      if (!isNodeCreationTypeEnabled(_0x186561)) {
        _0x3fc790.preventDefault();
        return;
      }
      if (isDevOnlyNodeType(_0x186561) && !isDevModeOn()) {
        _0x3fc790.preventDefault();
        return;
      }
      _0x3fc790.dataTransfer.setData("application/v2-node-type", _0x186561);
      _0x3fc790.dataTransfer.effectAllowed = "copy";
    });
    _0x25eeac.addEventListener("click", _0x196318 => {
      _0x196318.stopPropagation();
      const _0x416ec7 = _0x25eeac.dataset.type;
      if (!_0x416ec7 || _0x416ec7 === "resource") {
        return;
      }
      if (!isNodeCreationTypeEnabled(_0x416ec7)) {
        return;
      }
      if (isDevOnlyNodeType(_0x416ec7) && !isDevModeOn()) {
        return;
      }
      _0x127827(_0x416ec7);
      if (_0xb09d23) {
        _0xb09d23.style.display = "none";
      }
    });
  });
  _0x1cfb52.addEventListener("dragover", _0x28b1b9 => {
    if (_0x28b1b9.dataTransfer.types.includes("application/v2-node-type")) {
      _0x28b1b9.preventDefault();
      _0x28b1b9.dataTransfer.dropEffect = "copy";
    }
  });
  _0x1cfb52.addEventListener("drop", _0x5c73b9 => {
    const _0x24dc93 = _0x5c73b9.dataTransfer.getData("application/v2-node-type");
    if (!_0x24dc93) {
      return;
    }
    if (!isNodeCreationTypeEnabled(_0x24dc93)) {
      return;
    }
    if (isDevOnlyNodeType(_0x24dc93) && !isDevModeOn()) {
      return;
    }
    _0x5c73b9.preventDefault();
    const {
      viewport: _0x2c5aef
    } = _0x527ac8.getState();
    const _0x163f12 = screenToWorld(_0x5c73b9.clientX, _0x5c73b9.clientY, _0x2c5aef);
    _0x47cbd1(_0x24dc93, _0x163f12.x, _0x163f12.y, {
      forDrop: true
    });
  });
}