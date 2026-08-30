import a531_0x4ba5fc from "../../core/stores/appStore.js";
import { generateId } from "../../core/math.js";
import { buildStoryboardCropRect } from "../../core/storyboardCellUtils.js";
import { commit } from "../../modules/history.js";
import { saveOutputBlob } from "../../modules/project.js";
import { drawStoryboardComposeAsset } from "../../modules/storyboard/storyboardComposeDraw.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../../services/fileService.js";
const COMPOSE_CANVAS_WIDTH = 2048;
function getStoryboardCells(_0x46d72c) {
  if (Array.isArray(_0x46d72c?.cells)) {
    return _0x46d72c.cells;
  } else {
    return [];
  }
}
function getCssValue(_0x7ea54d, _0x532c9d) {
  if (typeof getComputedStyle !== "function") {
    return _0x532c9d;
  }
  const _0x32c3b2 = getComputedStyle(document.documentElement).getPropertyValue(_0x7ea54d).trim();
  return _0x32c3b2 || _0x532c9d;
}
function parseAspectRatio(_0x59bd5e) {
  const _0x47027d = String(_0x59bd5e || "1:1");
  const [_0x462eb7, _0x2b630e] = _0x47027d.split(":").map(Number);
  const _0x403797 = Number.isFinite(_0x462eb7) && _0x462eb7 > 0 ? _0x462eb7 : 1;
  const _0x12092f = Number.isFinite(_0x2b630e) && _0x2b630e > 0 ? _0x2b630e : 1;
  return {
    aspectStr: _0x47027d,
    rw: _0x403797,
    rh: _0x12092f
  };
}
function createComposeImageLoader() {
  const _0x4883ea = new Map();
  return async _0x2dcd2e => {
    const _0x4dcdad = String(_0x2dcd2e || "").trim();
    if (!_0x4dcdad) {
      return null;
    }
    if (_0x4883ea.has(_0x4dcdad)) {
      return _0x4883ea.get(_0x4dcdad);
    }
    const _0x5d767a = new Promise(_0x32e7ad => {
      const _0x3af172 = new Image();
      _0x3af172.crossOrigin = "anonymous";
      _0x3af172.onload = () => _0x32e7ad(_0x3af172);
      _0x3af172.onerror = () => _0x32e7ad(null);
      _0x3af172.src = _0x4dcdad;
    });
    _0x4883ea.set(_0x4dcdad, _0x5d767a);
    return _0x5d767a;
  };
}
function setComposeButtonBusy(_0x15ec8f) {
  if (!_0x15ec8f) {
    return () => {};
  }
  const _0xa9152f = Array.from(_0x15ec8f.childNodes).map(_0x168af2 => _0x168af2.cloneNode(true));
  const _0x2b670e = _0x15ec8f.dataset.tooltip;
  _0x15ec8f.replaceChildren();
  _0x15ec8f.dataset.tooltip = "合成中...";
  const _0x1c085a = "http://www.w3.org/2000/svg";
  const _0x79f671 = document.createElementNS(_0x1c085a, "svg");
  _0x79f671.classList.add("v2-spinning");
  _0x79f671.setAttribute("width", "14");
  _0x79f671.setAttribute("height", "14");
  _0x79f671.setAttribute("viewBox", "0 0 24 24");
  _0x79f671.setAttribute("fill", "none");
  _0x79f671.setAttribute("stroke", "currentColor");
  _0x79f671.setAttribute("stroke-width", "2");
  const _0x26fdf1 = document.createElementNS(_0x1c085a, "path");
  _0x26fdf1.setAttribute("d", "M21 12a9 9 0 1 1-6.219-8.56");
  _0x79f671.appendChild(_0x26fdf1);
  _0x15ec8f.appendChild(_0x79f671);
  _0x15ec8f.style.pointerEvents = "none";
  return () => {
    _0x15ec8f.replaceChildren(..._0xa9152f.map(_0x3a7e6c => _0x3a7e6c.cloneNode(true)));
    _0x15ec8f.dataset.tooltip = _0x2b670e;
    _0x15ec8f.style.pointerEvents = "auto";
  };
}
function createComposeCanvas(_0x73ca6) {
  const {
    aspectStr: _0x4603d5,
    rw: _0x2db76e,
    rh: _0x55011b
  } = parseAspectRatio(_0x73ca6?.aspectRatio);
  const _0x4efe73 = document.createElement("canvas");
  _0x4efe73.width = COMPOSE_CANVAS_WIDTH;
  _0x4efe73.height = Math.round(COMPOSE_CANVAS_WIDTH * (_0x55011b / _0x2db76e));
  return {
    aspectStr: _0x4603d5,
    canvas: _0x4efe73
  };
}
async function drawBackdrop(_0x518382, {
  backdropUrl: _0x26d468,
  canvasW: _0x378288,
  canvasH: _0x3103f8,
  loadImage: _0x1ebf93
}) {
  if (!_0x26d468) {
    return;
  }
  const _0x26426e = await _0x1ebf93(_0x26d468);
  if (!_0x26426e) {
    return;
  }
  _0x518382.drawImage(_0x26426e, 0, 0, _0x26426e.naturalWidth, _0x26426e.naturalHeight, 0, 0, _0x378288, _0x3103f8);
}
function getSourceNodePosition(_0x5f4357) {
  return {
    x: _0x5f4357.x + _0x5f4357.width + 40,
    y: _0x5f4357.y
  };
}
async function saveComposeCanvas(_0x54faab, _0x105f5b, _0x41facb) {
  const _0x3a5ce1 = await new Promise(_0x3e0a81 => _0x54faab.toBlob(_0x3e0a81, "image/jpeg", 0.9));
  const _0x39c576 = generateId("compose");
  const _0xd577f8 = "storyboard_compose_" + _0x39c576 + ".jpg";
  const _0xb1205f = new File([_0x3a5ce1], _0xd577f8, {
    type: "image/jpeg"
  });
  const _0x17c498 = await saveOutputBlob(_0xb1205f, {
    ext: "jpg"
  });
  const _0x296370 = String(_0x17c498.localPath || _0x17c498.path || "").replace(/^\//, "");
  const _0xbcfa6a = String(_0x17c498.url || "").trim() || "/" + String(_0x296370 || "");
  const _0x23ea75 = getAutoMediaSizeByShortSide(_0x54faab.width, _0x54faab.height);
  const _0x226db9 = generateId("node");
  a531_0x4ba5fc.addNode(buildSourceMediaNodePayload({
    id: _0x226db9,
    type: "source-image",
    x: _0x41facb.x,
    y: _0x41facb.y,
    width: _0x23ea75.width,
    height: _0x23ea75.height,
    src: _0xbcfa6a,
    localPath: _0x296370,
    fileName: _0x17c498.filename || _0xd577f8,
    name: "合成分镜_" + _0x105f5b,
    needsAutoResize: false
  }));
  return _0x226db9;
}
export function getStoryboardComposeCellImageElement(_0x4b8fa5, _0x53f9f6) {
  const _0x1dfd76 = _0x4b8fa5?.[_0x53f9f6] || null;
  if (!_0x1dfd76) {
    return null;
  }
  return Array.from(_0x1dfd76.querySelectorAll?.(".storyboard-cell-img") || []).find(_0x186203 => !_0x186203.classList?.contains?.("storyboard-empty-residual-img") && !_0x186203.classList?.contains?.("storyboard-cell-source-cache")) || null;
}
export function getStoryboardComposeCellDisplayUrl({
  cellEls: _0xd77dfe,
  cellIndex: _0x25626e,
  getImageElementSource: _0x1071af
} = {}) {
  return _0x1071af?.(getStoryboardComposeCellImageElement(_0xd77dfe, _0x25626e));
}
export async function drawStoryboardComposeCell(_0x1b1c38, {
  cell: _0x1d9545,
  cellIndex: _0x29d8e5,
  displayUrl: _0x2e9c19,
  imageEl: _0x4eaa4e,
  target: _0x38d2d4,
  loadImage: _0x4fe294,
  cellEls: _0x3c6829,
  getImageElementSource: _0x15fcc6
}) {
  const _0x8fba61 = _0x4eaa4e || getStoryboardComposeCellImageElement(_0x3c6829, _0x29d8e5);
  const _0x324233 = _0x2e9c19 || _0x15fcc6?.(_0x8fba61);
  return drawStoryboardComposeAsset(_0x1b1c38, {
    cell: _0x1d9545,
    finalUrl: _0x324233,
    imageEl: _0x8fba61,
    target: _0x38d2d4,
    loadImage: _0x4fe294
  });
}
export async function composeStoryboardNode({
  node: _0x1380be,
  rootEl: _0x1ace02,
  cellEls: _0x4c0d92,
  isCellEmpty: _0x4cfc09,
  getImageElementSource: _0x3920c6,
  getBackdropUrl: _0x99a1b1,
  markComposing: _0xdf2165
} = {}) {
  const _0x5772f8 = getStoryboardCells(_0x1380be);
  const _0x25b5e9 = _0x5772f8.some((_0x32759a, _0x157c50) => {
    return !_0x4cfc09?.(_0x32759a) && getStoryboardComposeCellDisplayUrl({
      cellEls: _0x4c0d92,
      cellIndex: _0x157c50,
      getImageElementSource: _0x3920c6
    });
  });
  if (!_0x25b5e9) {
    window.showToast?.("分镜内没有任何内容可供合成", "warning");
    return;
  }
  const _0x368154 = _0x1ace02?.querySelector?.(".act-compose") || null;
  const _0xa01bea = setComposeButtonBusy(_0x368154);
  _0xdf2165?.(true);
  try {
    const {
      aspectStr: _0x3f5e98,
      canvas: _0x1c36c3
    } = createComposeCanvas(_0x1380be);
    const _0x5f35e2 = _0x1c36c3.getContext("2d");
    const _0x521b9f = _0x1c36c3.width;
    const _0x2b99bb = _0x1c36c3.height;
    const _0x3df6fc = getCssValue("--surface-node", "transparent");
    const _0x259bda = getCssValue("--bg-node", _0x3df6fc);
    _0x5f35e2.fillStyle = _0x3df6fc;
    _0x5f35e2.fillRect(0, 0, _0x521b9f, _0x2b99bb);
    const _0x26a7bf = _0x1380be.cols || 2;
    const _0x5b0e19 = _0x1380be.rows || 2;
    const _0x131133 = createComposeImageLoader();
    await drawBackdrop(_0x5f35e2, {
      backdropUrl: _0x99a1b1?.(),
      canvasW: _0x521b9f,
      canvasH: _0x2b99bb,
      loadImage: _0x131133
    });
    await Promise.all(_0x5772f8.map(async (_0x4dbaca, _0x422d3d) => {
      if (_0x422d3d >= _0x26a7bf * _0x5b0e19) {
        return;
      }
      const _0x266159 = buildStoryboardCropRect(_0x1380be, _0x422d3d, {
        width: _0x521b9f,
        height: _0x2b99bb,
        inset: 0
      });
      if (!_0x266159) {
        return;
      }
      const _0x3a26a0 = _0x266159.x0;
      const _0x5b3434 = _0x266159.x1;
      const _0x3fd0b3 = _0x266159.y0;
      const _0x2c915a = _0x266159.y1;
      const _0x16eb72 = Math.max(1, _0x5b3434 - _0x3a26a0);
      const _0x558271 = Math.max(1, _0x2c915a - _0x3fd0b3);
      if (_0x4cfc09?.(_0x4dbaca)) {
        _0x5f35e2.fillStyle = _0x259bda;
        _0x5f35e2.fillRect(_0x3a26a0, _0x3fd0b3, _0x16eb72, _0x558271);
        return;
      }
      const _0x1235c2 = getStoryboardComposeCellImageElement(_0x4c0d92, _0x422d3d);
      const _0x382225 = _0x3920c6?.(_0x1235c2);
      if (!_0x382225) {
        return;
      }
      await drawStoryboardComposeCell(_0x5f35e2, {
        cell: _0x4dbaca,
        cellIndex: _0x422d3d,
        displayUrl: _0x382225,
        imageEl: _0x1235c2,
        target: {
          x0: _0x3a26a0,
          y0: _0x3fd0b3,
          drawW: _0x16eb72,
          drawH: _0x558271
        },
        loadImage: _0x131133,
        cellEls: _0x4c0d92,
        getImageElementSource: _0x3920c6
      });
    }));
    const _0x5efd63 = await saveComposeCanvas(_0x1c36c3, _0x3f5e98, getSourceNodePosition(_0x1380be));
    a531_0x4ba5fc.setSelectedNodes([_0x5efd63]);
    commit();
    window._triggerLocalCacheSave?.();
    window.showToast?.("合成成功，源图像节点已生成", "success");
  } catch (_0x3c046f) {
    console.error("[Storyboard] Compose failed:", _0x3c046f);
    window.showToast?.("合成失败", "error");
  } finally {
    _0xdf2165?.(false);
    _0xa01bea();
  }
}