import { renderStoryboardGrid, renderStoryboardSequence, resolveStoryboardExportDimensions } from "./storyboardExport.js";
import { buildCollageItemSwapPatch } from "../collage/collageFactory.js";
import { saveMediaFilesDownload } from "../../services/downloadSaveService.js";
import { focusFirstStoryboard3DElement, restoreStoryboard3DFocus, trapStoryboard3DTabKey } from "./focusTrap.js";
function escapeHtml(_0x46809d) {
  return String(_0x46809d ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function safeFileName(_0x42853a) {
  const _0xba699b = String(_0x42853a || "storyboard-3d").trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").slice(0, 80);
  return _0xba699b || "storyboard-3d";
}
export function collectStoryboard3DProjectShots(_0x41f72c) {
  const _0x357a2f = Array.isArray(_0x41f72c?.scenes) ? _0x41f72c.scenes : [];
  const _0x26dfe8 = _0x357a2f.find(_0xcd140f => _0xcd140f.id === _0x41f72c?.activeSceneId) || _0x357a2f[0];
  if (!_0x26dfe8) {
    return [];
  }
  return (Array.isArray(_0x26dfe8.shots) ? _0x26dfe8.shots : []).map((_0x3f5e4c, _0x50ce48) => ({
    ..._0x3f5e4c,
    sceneId: _0x26dfe8.id,
    sceneName: _0x26dfe8.name,
    sceneShotIndex: _0x50ce48
  }));
}
export function getActiveStoryboard3DProjectShot(_0x1204fb) {
  const _0x33888f = Array.isArray(_0x1204fb?.scenes) ? _0x1204fb.scenes : [];
  const _0x2f6d1f = _0x33888f.find(_0x95236b => _0x95236b.id === _0x1204fb?.activeSceneId) || _0x33888f[0];
  if (!_0x2f6d1f) {
    return null;
  }
  const _0x41bb2b = Array.isArray(_0x2f6d1f.shots) ? _0x2f6d1f.shots : [];
  const _0x160a4d = _0x41bb2b.find(_0x31cf2b => _0x31cf2b.id === _0x2f6d1f.activeShotId) || _0x41bb2b[0];
  if (_0x160a4d) {
    return {
      ..._0x160a4d,
      sceneId: _0x2f6d1f.id,
      sceneName: _0x2f6d1f.name
    };
  } else {
    return null;
  }
}
export function normalizeStoryboard3DExportOptions(_0xf7421 = {}) {
  const _0x13d2ac = ["current-png", "current-jpeg", "sequence-png", "grid-png"].includes(_0xf7421.mode) ? _0xf7421.mode : "current-png";
  const _0x39af16 = ["16:9", "9:16", "1:1", "2.39:1"].includes(_0xf7421.aspectRatio) ? _0xf7421.aspectRatio : "16:9";
  const _0x5bab0a = ["720p", "1080p", "2K", "4K"].includes(_0xf7421.resolution) ? _0xf7421.resolution : "1080p";
  const _0x3b96e8 = Number(_0xf7421.gridSize) || Math.pow(Number(_0xf7421.columns) || 3, 2);
  const _0x233cbb = [4, 9, 16].includes(_0x3b96e8) ? _0x3b96e8 : 9;
  return {
    mode: _0x13d2ac,
    aspectRatio: _0x39af16,
    resolution: _0x5bab0a,
    gridSize: _0x233cbb,
    columns: Math.sqrt(_0x233cbb),
    includeMetadata: _0xf7421.includeMetadata !== false,
    includeThirds: Boolean(_0xf7421.includeThirds),
    returnToCanvas: _0xf7421.returnToCanvas !== false
  };
}
function uniqueShotIds(_0x3414a6 = []) {
  return [...new Set((Array.isArray(_0x3414a6) ? _0x3414a6 : []).map(_0x23dd33 => String(_0x23dd33 || "").trim()).filter(Boolean))];
}
export function reconcileStoryboard3DExportSelection(_0x5f3bd4, _0x27cb19 = [], _0x34a6c4 = []) {
  const _0x437fa4 = uniqueShotIds(_0x27cb19);
  const _0x1a2e93 = new Set(_0x437fa4);
  const _0xab6922 = uniqueShotIds(_0x34a6c4).filter(_0x1ebb16 => _0x1a2e93.has(_0x1ebb16));
  if (_0x5f3bd4 === "grid-png") {
    return [];
  }
  if (_0x5f3bd4 === "sequence-png") {
    if (_0xab6922.length > 0) {
      return _0xab6922;
    } else {
      return _0x437fa4.slice(0, 1);
    }
  }
  if (_0xab6922[0]) {
    return [_0xab6922[0]];
  } else {
    return _0x437fa4.slice(0, 1);
  }
}
export function createStoryboard3DExportGridSlots(_0x2d524a = [], _0x4b7209 = 9, _0x3b6326 = []) {
  const _0x18ee6b = normalizeStoryboard3DExportOptions({
    gridSize: _0x4b7209
  }).gridSize;
  const _0x319dfe = uniqueShotIds(_0x2d524a);
  const _0x4c361e = new Set(_0x319dfe);
  const _0x4ec96f = uniqueShotIds(_0x3b6326).filter(_0x388c92 => _0x4c361e.has(_0x388c92));
  const _0x43fdb7 = [..._0x4ec96f, ..._0x319dfe.filter(_0x4ae950 => !_0x4ec96f.includes(_0x4ae950))];
  return Array.from({
    length: _0x18ee6b
  }, (_0xfd63a8, _0x10ff78) => _0x43fdb7[_0x10ff78] || "");
}
function createCollageSlotAdapter(_0x3cfff7, _0x31f631, _0x489ecc) {
  const _0x259e00 = _0x31f631 % _0x489ecc;
  const _0x13a6ae = Math.floor(_0x31f631 / _0x489ecc);
  return {
    id: _0x3cfff7 ? "storyboard-export-" + _0x3cfff7 : "collage-slot-" + _0x31f631,
    shotId: _0x3cfff7,
    url: _0x3cfff7 ? "storyboard-shot://" + encodeURIComponent(_0x3cfff7) : "",
    slotIndex: _0x31f631,
    isEmpty: !_0x3cfff7,
    x: _0x259e00,
    y: _0x13a6ae,
    width: 1,
    height: 1
  };
}
export function placeStoryboard3DShotInGrid(_0xb6cb3c = [], {
  shotId: _0xffd533,
  sourceIndex = -1,
  targetIndex = -1
} = {}) {
  const _0x317af1 = (Array.isArray(_0xb6cb3c) ? _0xb6cb3c : []).map(_0x50e47e => String(_0x50e47e || ""));
  const _0xfd5109 = String(_0xffd533 || "").trim();
  if (!_0xfd5109 || targetIndex < 0 || targetIndex >= _0x317af1.length) {
    return _0x317af1;
  }
  const _0x594357 = _0x317af1.indexOf(_0xfd5109);
  const _0x30e768 = sourceIndex >= 0 ? sourceIndex : _0x594357;
  if (_0x30e768 >= 0 && _0x30e768 !== targetIndex) {
    const _0x57baa0 = Math.max(1, Math.round(Math.sqrt(_0x317af1.length)));
    const _0x238462 = _0x317af1.map((_0x25cf49, _0x18e283) => createCollageSlotAdapter(_0x25cf49, _0x18e283, _0x57baa0));
    const _0x1ddfad = buildCollageItemSwapPatch({
      items: _0x238462
    }, _0x30e768, targetIndex);
    if (_0x1ddfad) {
      return _0x1ddfad.items.map(_0x45c9b6 => String(_0x45c9b6?.shotId || ""));
    }
  }
  const _0x1030b8 = [..._0x317af1];
  _0x1030b8.forEach((_0x183eca, _0x3135d1) => {
    if (_0x183eca === _0xfd5109) {
      _0x1030b8[_0x3135d1] = "";
    }
  });
  _0x1030b8[targetIndex] = _0xfd5109;
  return _0x1030b8;
}
function renderChoiceButtons(_0x570f55, _0x29b730, _0x1c59d1) {
  return _0x29b730.map(({
    value: _0xcf65fb,
    label: _0x26ff7e,
    note = ""
  }) => "<button type=\"button\" class=\"storyboard-3d-export-choice" + (_0xcf65fb === _0x1c59d1 ? " is-active" : "") + "\" data-storyboard-3d-export-action=\"set-option\" data-storyboard-3d-export-option=\"" + escapeHtml(_0x570f55) + "\" data-storyboard-3d-export-value=\"" + escapeHtml(_0xcf65fb) + "\" data-export-focus-key=\"" + escapeHtml(_0x570f55 + ":" + _0xcf65fb) + "\" aria-pressed=\"" + (_0xcf65fb === _0x1c59d1) + "\"><strong>" + escapeHtml(_0x26ff7e) + "</strong>" + (note ? "<small>" + escapeHtml(note) + "</small>" : "") + "</button>").join("");
}
function renderShotVisual(_0x7a6003) {
  const _0x2383ee = String(_0x7a6003?.thumbnailUrl || "").trim();
  if (_0x2383ee) {
    return "<img src=\"" + escapeHtml(_0x2383ee) + "\" alt=\"" + escapeHtml(_0x7a6003?.name || "分镜预览") + "\">";
  }
  return "<span class=\"storyboard-3d-export-shot-placeholder\" aria-hidden=\"true\"><i></i></span>";
}
function renderShotRail(_0x40666b, _0x417002, _0x502d00, _0x5ce06b) {
  const _0x2f2ad9 = new Set(_0x417002);
  const _0x37f43a = _0x502d00 === "grid-png";
  const _0x271dca = _0x502d00 === "sequence-png";
  const _0x203324 = _0x37f43a ? _0x5ce06b.filter(Boolean).length + " 格已编排" : _0x2f2ad9.size + " / " + _0x40666b.length;
  return "<aside class=\"storyboard-3d-export-shot-rail\" aria-label=\"分镜选择\">\n    <div class=\"storyboard-3d-export-rail-heading\"><div><small>EXPORT SET</small><strong>" + (_0x37f43a ? "分镜素材" : "分镜选择") + "</strong></div><span>" + _0x203324 + "</span></div>\n    " + (_0x271dca ? "<button type=\"button\" class=\"storyboard-3d-export-select-all\" data-storyboard-3d-export-action=\"toggle-all-shots\" data-export-focus-key=\"toggle-all\">" + (_0x2f2ad9.size === _0x40666b.length ? "取消全选" : "全选分镜") + "</button>" : "") + "\n    <div class=\"storyboard-3d-export-shot-list\">\n      " + _0x40666b.map((_0x363900, _0x31dc15) => {
    const _0x8293d2 = !_0x37f43a && _0x2f2ad9.has(_0x363900.id);
    return "<article class=\"storyboard-3d-export-shot-item" + (_0x8293d2 ? " is-selected" : "") + "\" draggable=\"true\" data-storyboard-3d-export-drag-shot-id=\"" + escapeHtml(_0x363900.id) + "\" " + (_0x37f43a ? "" : "data-storyboard-3d-export-action=\"toggle-shot\" data-storyboard-3d-export-shot-id=\"" + escapeHtml(_0x363900.id) + "\"") + ">\n          <span class=\"storyboard-3d-export-shot-thumb\">" + renderShotVisual(_0x363900) + "<b>" + String(_0x31dc15 + 1).padStart(2, "0") + "</b></span>\n          " + (_0x37f43a ? "<div class=\"storyboard-3d-export-shot-copy\"><strong>" + escapeHtml(_0x363900.name || "镜头 " + (_0x31dc15 + 1)) + "</strong><small>" + escapeHtml(_0x363900.sceneName || "未命名场景") + "</small></div>" : "<button type=\"button\" data-storyboard-3d-export-action=\"toggle-shot\" data-storyboard-3d-export-shot-id=\"" + escapeHtml(_0x363900.id) + "\" data-export-focus-key=\"shot:" + escapeHtml(_0x363900.id) + "\" aria-pressed=\"" + _0x8293d2 + "\"><span><strong>" + escapeHtml(_0x363900.name || "镜头 " + (_0x31dc15 + 1)) + "</strong><small>" + escapeHtml(_0x363900.sceneName || "未命名场景") + "</small></span></button>") + "\n        </article>";
  }).join("") + "\n    </div>\n    <p>" + (_0x37f43a ? "拖动缩略图到宫格，宫格内可互换位置。" : _0x271dca ? "点击卡片可多选要导出的分镜。" : "点击卡片选择一个要导出的分镜。") + "</p>\n  </aside>";
}
function renderGridComposer(_0x1095cb, _0x4cb597, _0x2066ab) {
  return "<div class=\"storyboard-3d-export-grid-composer\" data-storyboard-3d-export-grid-size=\"" + _0x2066ab + "\">\n    " + _0x1095cb.map((_0x284625, _0x36e8be) => {
    const _0x567a36 = _0x4cb597.get(_0x284625);
    return "<div class=\"storyboard-3d-export-grid-slot" + (_0x567a36 ? " is-filled" : "") + "\" data-storyboard-3d-export-grid-slot=\"" + _0x36e8be + "\" draggable=\"" + Boolean(_0x567a36) + "\">\n        " + (_0x567a36 ? renderShotVisual(_0x567a36) + "<span><b>" + String(_0x36e8be + 1).padStart(2, "0") + "</b><small>" + escapeHtml(_0x567a36.name || "未命名镜头") + "</small></span>" : "<span class=\"storyboard-3d-export-grid-empty\"><b>" + String(_0x36e8be + 1).padStart(2, "0") + "</b><small>拖入分镜</small></span>") + "\n      </div>";
  }).join("") + "\n  </div>";
}
function renderOptions({
  options: _0x2e00e2,
  shots: _0xf89404,
  selectedShotIds: _0x496421,
  gridSlots: _0x32e575
}) {
  const _0xeb069b = resolveStoryboardExportDimensions(_0x2e00e2);
  const _0x4b1415 = new Map(_0xf89404.map(_0x477bf4 => [_0x477bf4.id, _0x477bf4]));
  const _0x51ac09 = _0x496421.length;
  const _0xa28e77 = _0x32e575.filter(Boolean).length;
  const _0x23229c = _0x2e00e2.mode === "grid-png";
  return "<form class=\"storyboard-3d-export-form\" data-storyboard-3d-export-form>\n    <header>\n      <div><small>STORYBOARD OUTPUT</small><strong>导出分镜</strong><span>选择镜头、编排顺序，然后输出图片。</span></div>\n      <button type=\"button\" data-storyboard-3d-export-action=\"close\" aria-label=\"关闭\">×</button>\n    </header>\n    <div class=\"storyboard-3d-export-layout\">\n      " + renderShotRail(_0xf89404, _0x496421, _0x2e00e2.mode, _0x32e575) + "\n      <main class=\"storyboard-3d-export-main\">\n        <section class=\"storyboard-3d-export-mode-row\">\n          <div class=\"storyboard-3d-export-inline-label\"><small>01</small><strong>输出方式</strong></div>\n          <div class=\"storyboard-3d-export-mode-options\">\n            " + renderChoiceButtons("mode", [{
    value: "current-png",
    label: "单张 PNG",
    note: "当前所选镜头"
  }, {
    value: "current-jpeg",
    label: "单张 JPEG",
    note: "更小的文件"
  }, {
    value: "sequence-png",
    label: "PNG 序列",
    note: "逐张独立导出"
  }, {
    value: "grid-png",
    label: "宫格图",
    note: "自由组合画面"
  }], _0x2e00e2.mode) + "\n          </div><em>" + (_0x23229c ? "导出 1 张宫格图" : _0x51ac09 + " 个镜头已选") + "</em>\n        </section>\n        <section class=\"storyboard-3d-export-settings\">\n          <div><span>画幅比例</span><div class=\"storyboard-3d-export-compact-options\">" + renderChoiceButtons("aspectRatio", ["16:9", "9:16", "1:1", "2.39:1"].map(_0x342c19 => ({
    value: _0x342c19,
    label: _0x342c19
  })), _0x2e00e2.aspectRatio) + "</div></div>\n          <div><span>单格分辨率</span><div class=\"storyboard-3d-export-compact-options\">" + renderChoiceButtons("resolution", ["720p", "1080p", "2K", "4K"].map(_0xaf925b => ({
    value: _0xaf925b,
    label: _0xaf925b
  })), _0x2e00e2.resolution) + "</div></div>\n          " + (_0x23229c ? "<div data-storyboard-3d-grid-size><span>宫格布局</span><div class=\"storyboard-3d-export-grid-size-options\">" + renderChoiceButtons("gridSize", [4, 9, 16].map(_0x548da8 => ({
    value: String(_0x548da8),
    label: _0x548da8 + " 宫格"
  })), String(_0x2e00e2.gridSize)) + "</div></div>" : "") + "\n        </section>\n        <section class=\"storyboard-3d-export-stage" + (_0x23229c ? " is-grid" : "") + "\">\n          <div class=\"storyboard-3d-export-stage-heading\"><span><small>02</small><strong>" + (_0x23229c ? "宫格编排" : "输出预览") + "</strong></span><em>" + _0xeb069b.width + " × " + _0xeb069b.height + (_0x23229c ? " / 格" : "") + "</em></div>\n          " + (_0x23229c ? renderGridComposer(_0x32e575, _0x4b1415, _0x2e00e2.gridSize) : "<div class=\"storyboard-3d-export-single-preview\">" + renderShotVisual(_0x4b1415.get(_0x496421[0])) + "<div><strong>" + _0xeb069b.width + " × " + _0xeb069b.height + "</strong><small>" + (_0x2e00e2.mode === "sequence-png" ? _0x51ac09 + " 个独立文件" : "导出首个所选镜头") + "</small></div></div>") + "\n          " + (_0x23229c ? "<p class=\"storyboard-3d-export-grid-help\">已载入 " + _0xa28e77 + " 个镜头。拖动左侧分镜到任意格，或在格子之间拖动互换。</p>" : "") + "\n        </section>\n        <div class=\"storyboard-3d-export-toggles\">\n          <label><input type=\"checkbox\" name=\"includeMetadata\" " + (_0x2e00e2.includeMetadata ? "checked" : "") + "><span>镜头信息与描述</span></label>\n          <label><input type=\"checkbox\" name=\"includeThirds\" " + (_0x2e00e2.includeThirds ? "checked" : "") + "><span>三分线</span></label>\n        </div>\n        <div class=\"storyboard-3d-export-progress\" data-storyboard-3d-export-progress role=\"status\" aria-live=\"polite\"></div>\n      </main>\n    </div>\n    <footer>\n      <button type=\"button\" data-storyboard-3d-export-action=\"close\">取消</button>\n      <div class=\"storyboard-3d-export-destination-actions\">\n        <button type=\"button\" class=\"is-primary\" data-storyboard-3d-export-action=\"toggle-destinations\" data-storyboard-3d-export-start aria-expanded=\"false\">开始导出</button>\n        <div data-storyboard-3d-export-destinations hidden>\n          <button type=\"submit\" data-storyboard-3d-export-submit data-storyboard-3d-export-destination=\"local\" data-export-focus-key=\"destination:local\">导出到本地</button>\n          <button type=\"submit\" class=\"is-primary\" data-storyboard-3d-export-submit data-storyboard-3d-export-destination=\"canvas\" data-export-focus-key=\"destination:canvas\">导出到画布</button>\n        </div>\n      </div>\n    </footer>\n  </form>";
}
async function defaultDownloadResults(_0xed9a42) {
  return await saveMediaFilesDownload({
    title: "选择分镜导出目录",
    files: _0xed9a42
  });
}
export class Storyboard3DExportController {
  constructor({
    getProject: _0x136de3,
    renderFrame: _0xe194d2,
    onComplete: _0x48e21a,
    downloadResults: _0x4b8c98,
    downloadResult: _0x5023a4,
    documentObject = globalThis.document,
    windowObject = globalThis.window
  } = {}) {
    this.getProject = _0x136de3;
    this.renderFrame = _0xe194d2;
    this.onComplete = _0x48e21a;
    this.downloadResults = typeof _0x4b8c98 === "function" ? _0x4b8c98 : typeof _0x5023a4 === "function" ? async (_0xa92345, _0x25492e) => {
      for (const _0x4dd1f3 of _0xa92345) {
        await _0x5023a4({
          blob: _0x4dd1f3.blob
        }, _0x4dd1f3.filename, _0x25492e);
      }
      return {
        success: true,
        canceled: false,
        count: _0xa92345.length
      };
    } : defaultDownloadResults;
    this.document = documentObject;
    this.window = windowObject;
    this.root = null;
    this.returnFocusElement = null;
    this.options = normalizeStoryboard3DExportOptions();
    this.selectedShotIds = [];
    this.gridSlots = [];
    this.dragState = null;
    this.exportDestinationOpen = false;
    this.busy = false;
    this._handleClick = this._handleClick.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
  }
  open(_0x11d875 = {}) {
    if (!this.document?.body) {
      return null;
    }
    this.options = normalizeStoryboard3DExportOptions({
      ...this.options,
      ..._0x11d875
    });
    const _0x1ccad0 = !this.root;
    if (_0x1ccad0) {
      this.returnFocusElement = this.document.activeElement || null;
      const _0xeb292 = this.document.createElement("section");
      _0xeb292.className = "storyboard-3d-export-dialog";
      _0xeb292.setAttribute("role", "dialog");
      _0xeb292.setAttribute("aria-modal", "true");
      _0xeb292.setAttribute("aria-label", "导出 3D 分镜");
      _0xeb292.tabIndex = -1;
      _0xeb292.dataset.uiStop = "1";
      _0xeb292.addEventListener("click", this._handleClick);
      _0xeb292.addEventListener("change", this._handleChange);
      _0xeb292.addEventListener("submit", this._handleSubmit);
      _0xeb292.addEventListener("keydown", this._handleKeyDown);
      _0xeb292.addEventListener("dragstart", this._handleDragStart);
      _0xeb292.addEventListener("dragover", this._handleDragOver);
      _0xeb292.addEventListener("dragleave", this._handleDragLeave);
      _0xeb292.addEventListener("drop", this._handleDrop);
      _0xeb292.addEventListener("dragend", this._handleDragEnd);
      this.document.body.appendChild(_0xeb292);
      this.root = _0xeb292;
    }
    const _0x5481e2 = collectStoryboard3DProjectShots(this.getProject?.());
    const _0x3359f1 = _0x5481e2.map(_0x13e39c => _0x13e39c.id);
    this.selectedShotIds = reconcileStoryboard3DExportSelection(this.options.mode, _0x3359f1, _0x1ccad0 ? [] : this.selectedShotIds);
    this.gridSlots = createStoryboard3DExportGridSlots(_0x3359f1, this.options.gridSize, _0x1ccad0 ? [] : this.gridSlots);
    this.exportDestinationOpen = false;
    this._render();
    if (_0x1ccad0) {
      focusFirstStoryboard3DElement(this.root, {
        preferredSelector: "[data-export-focus-key=\"mode:current-png\"]"
      });
    }
    return this;
  }
  _readOptions() {
    const _0x36d3e4 = this.root?.querySelector("[data-storyboard-3d-export-form]");
    if (!_0x36d3e4) {
      return this.options;
    }
    return normalizeStoryboard3DExportOptions({
      ...this.options,
      includeMetadata: _0x36d3e4.elements.includeMetadata?.checked,
      includeThirds: _0x36d3e4.elements.includeThirds?.checked
    });
  }
  _render() {
    if (!this.root) {
      return;
    }
    const _0x38959e = this.document?.activeElement?.getAttribute?.("data-export-focus-key") || "";
    const _0x480d2b = collectStoryboard3DProjectShots(this.getProject?.());
    this.root.innerHTML = renderOptions({
      options: this.options,
      shots: _0x480d2b,
      selectedShotIds: this.selectedShotIds,
      gridSlots: this.gridSlots
    });
    if (_0x38959e) {
      [...this.root.querySelectorAll("[data-export-focus-key]")].find(_0x1deadb => _0x1deadb.getAttribute("data-export-focus-key") === _0x38959e)?.focus?.({
        preventScroll: true
      });
    }
  }
  _setProgress(_0x464c85) {
    const _0x636448 = this.root?.querySelector("[data-storyboard-3d-export-progress]");
    if (_0x636448) {
      _0x636448.textContent = _0x464c85;
    }
  }
  _setBusy(_0x365453) {
    this.busy = _0x365453;
    this.root?.querySelectorAll("[data-storyboard-3d-export-submit], [data-storyboard-3d-export-start]").forEach(_0x34e396 => {
      _0x34e396.disabled = _0x365453;
    });
  }
  _setExportDestinationOpen(_0x549571) {
    this.exportDestinationOpen = Boolean(_0x549571);
    const _0x286de6 = this.root?.querySelector("[data-storyboard-3d-export-start]");
    const _0x1f4c4b = this.root?.querySelector("[data-storyboard-3d-export-destinations]");
    if (_0x286de6) {
      _0x286de6.hidden = this.exportDestinationOpen;
      _0x286de6.setAttribute("aria-expanded", String(this.exportDestinationOpen));
    }
    if (_0x1f4c4b) {
      _0x1f4c4b.hidden = !this.exportDestinationOpen;
    }
  }
  _handleClick(_0x1de58a) {
    const _0x30d5cc = _0x1de58a.target.closest("[data-storyboard-3d-export-action]");
    if (!_0x30d5cc || !this.root?.contains(_0x30d5cc)) {
      return;
    }
    const _0x1580b2 = _0x30d5cc.getAttribute("data-storyboard-3d-export-action");
    if (_0x1580b2 === "close") {
      this.close();
      return;
    }
    if (_0x1580b2 === "toggle-destinations") {
      this._setExportDestinationOpen(!this.exportDestinationOpen);
      if (this.exportDestinationOpen) {
        this.root?.querySelector("[data-export-focus-key=\"destination:local\"]")?.focus?.();
      }
      return;
    }
    if (_0x1580b2 === "set-option") {
      const _0x481f9f = _0x30d5cc.getAttribute("data-storyboard-3d-export-option");
      const _0x39836e = _0x30d5cc.getAttribute("data-storyboard-3d-export-value");
      const _0x392688 = _0x481f9f === "gridSize" ? Number(_0x39836e) : _0x39836e;
      this.options = normalizeStoryboard3DExportOptions({
        ...this._readOptions(),
        [_0x481f9f]: _0x392688
      });
      const _0x1b03c1 = collectStoryboard3DProjectShots(this.getProject?.());
      const _0x25affb = _0x1b03c1.map(_0x1a8175 => _0x1a8175.id);
      if (_0x481f9f === "mode") {
        this.selectedShotIds = reconcileStoryboard3DExportSelection(this.options.mode, _0x25affb, this.selectedShotIds);
      }
      this.gridSlots = createStoryboard3DExportGridSlots(_0x25affb, this.options.gridSize, _0x481f9f === "gridSize" ? [] : this.gridSlots);
      this.exportDestinationOpen = false;
      this._render();
      return;
    }
    if (_0x1580b2 === "toggle-shot") {
      const _0x45695a = String(_0x30d5cc.getAttribute("data-storyboard-3d-export-shot-id") || "");
      const _0x1ddf8d = collectStoryboard3DProjectShots(this.getProject?.());
      if (this.options.mode === "sequence-png") {
        const _0x46e0c9 = new Set(this.selectedShotIds);
        if (_0x46e0c9.has(_0x45695a)) {
          _0x46e0c9.delete(_0x45695a);
        } else {
          _0x46e0c9.add(_0x45695a);
        }
        this.selectedShotIds = _0x1ddf8d.map(_0x4ad7f6 => _0x4ad7f6.id).filter(_0x4816b6 => _0x46e0c9.has(_0x4816b6));
      } else if (this.options.mode !== "grid-png") {
        this.selectedShotIds = [_0x45695a];
      }
      this.exportDestinationOpen = false;
      this._render();
      return;
    }
    if (_0x1580b2 === "toggle-all-shots") {
      if (this.options.mode !== "sequence-png") {
        return;
      }
      const _0x205180 = collectStoryboard3DProjectShots(this.getProject?.());
      this.selectedShotIds = this.selectedShotIds.length === _0x205180.length ? [] : _0x205180.map(_0x1acda1 => _0x1acda1.id);
      this.exportDestinationOpen = false;
      this._render();
    }
  }
  _handleChange() {
    this.options = this._readOptions();
  }
  _readDragPayload(_0xda9b76) {
    if (this.dragState?.shotId) {
      return this.dragState;
    }
    try {
      const _0x406139 = _0xda9b76?.dataTransfer?.getData?.("application/x-storyboard3d-export-shot");
      if (_0x406139) {
        return JSON.parse(_0x406139);
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  _handleDragStart(_0x3bf17c) {
    const _0x3f2ab0 = _0x3bf17c.target.closest("[data-storyboard-3d-export-grid-slot]");
    const _0x3c453e = _0x3bf17c.target.closest("[data-storyboard-3d-export-drag-shot-id]");
    const _0x212f11 = _0x3f2ab0 ? Number(_0x3f2ab0.getAttribute("data-storyboard-3d-export-grid-slot")) : -1;
    const _0x32d460 = _0x3f2ab0 ? this.gridSlots[_0x212f11] : _0x3c453e?.getAttribute("data-storyboard-3d-export-drag-shot-id") || "";
    if (!_0x32d460) {
      _0x3bf17c.preventDefault();
      return;
    }
    this.dragState = {
      shotId: _0x32d460,
      sourceIndex: _0x212f11
    };
    _0x3bf17c.dataTransfer?.setData?.("application/x-storyboard3d-export-shot", JSON.stringify(this.dragState));
    if (_0x3bf17c.dataTransfer) {
      _0x3bf17c.dataTransfer.effectAllowed = _0x212f11 >= 0 ? "move" : "copy";
    }
  }
  _handleDragOver(_0x2bbb31) {
    const _0x299ced = _0x2bbb31.target.closest("[data-storyboard-3d-export-grid-slot]");
    if (!_0x299ced || !this.root?.contains(_0x299ced)) {
      return;
    }
    _0x2bbb31.preventDefault();
    this.root.querySelectorAll(".storyboard-3d-export-grid-slot.is-drop-target").forEach(_0x4d0e1b => _0x4d0e1b.classList.remove("is-drop-target"));
    _0x299ced.classList.add("is-drop-target");
    if (_0x2bbb31.dataTransfer) {
      _0x2bbb31.dataTransfer.dropEffect = this.dragState?.sourceIndex >= 0 ? "move" : "copy";
    }
  }
  _handleDragLeave(_0x316535) {
    const _0xa55279 = _0x316535.target.closest("[data-storyboard-3d-export-grid-slot]");
    if (!_0xa55279 || _0xa55279.contains(_0x316535.relatedTarget)) {
      return;
    }
    _0xa55279.classList.remove("is-drop-target");
  }
  _handleDrop(_0x4cffb7) {
    const _0x2f929d = _0x4cffb7.target.closest("[data-storyboard-3d-export-grid-slot]");
    if (!_0x2f929d || !this.root?.contains(_0x2f929d)) {
      return;
    }
    _0x4cffb7.preventDefault();
    const _0x309fb8 = this._readDragPayload(_0x4cffb7);
    const _0x5a5fa8 = Number(_0x2f929d.getAttribute("data-storyboard-3d-export-grid-slot"));
    if (!_0x309fb8?.shotId || !Number.isInteger(_0x5a5fa8)) {
      return;
    }
    this.gridSlots = placeStoryboard3DShotInGrid(this.gridSlots, {
      shotId: _0x309fb8.shotId,
      sourceIndex: Number(_0x309fb8.sourceIndex),
      targetIndex: _0x5a5fa8
    });
    this.dragState = null;
    this.exportDestinationOpen = false;
    this._render();
  }
  _handleDragEnd() {
    this.dragState = null;
    this.root?.querySelectorAll(".storyboard-3d-export-grid-slot.is-drop-target").forEach(_0x47c027 => _0x47c027.classList.remove("is-drop-target"));
  }
  _handleKeyDown(_0x380685) {
    if (_0x380685.key === "Escape") {
      _0x380685.preventDefault();
      _0x380685.stopPropagation();
      this.close();
      return;
    }
    trapStoryboard3DTabKey(_0x380685, this.root, this.document);
  }
  async _handleSubmit(_0x59c515) {
    _0x59c515.preventDefault();
    if (this.busy) {
      return;
    }
    const _0x5e79bb = _0x59c515.submitter?.getAttribute?.("data-storyboard-3d-export-destination") === "canvas" ? "canvas" : "local";
    this._setExportDestinationOpen(false);
    this.options = this._readOptions();
    const _0x4b9510 = this.getProject?.();
    const _0x1b9c55 = collectStoryboard3DProjectShots(_0x4b9510);
    const _0x468b1b = new Map(_0x1b9c55.map(_0x2dcfbc => [_0x2dcfbc.id, _0x2dcfbc]));
    const _0x53114f = this.selectedShotIds.map(_0x120ffa => _0x468b1b.get(_0x120ffa)).filter(Boolean);
    const _0x4c512f = this.options.mode.startsWith("current-");
    const _0x52e48c = this.options.mode === "grid-png" ? this.gridSlots.map(_0x325017 => _0x468b1b.get(_0x325017) || null) : _0x4c512f ? [_0x53114f[0]].filter(Boolean) : _0x53114f;
    if (!_0x52e48c.some(Boolean)) {
      this._setProgress("请先选择至少一个要导出的镜头。");
      return;
    }
    if (typeof this.renderFrame !== "function") {
      this._setProgress("3D 离屏渲染器尚未就绪。");
      return;
    }
    this._setBusy(true);
    this._setProgress("正在准备离屏渲染…");
    try {
      const _0x5c259f = {
        renderFrame: this.renderFrame,
        aspectRatio: this.options.aspectRatio,
        resolution: this.options.resolution,
        includeThirds: this.options.includeThirds,
        includeDescription: this.options.includeMetadata,
        includeShotNumber: this.options.includeMetadata,
        includeShotAngle: this.options.includeMetadata,
        includeFocalLength: this.options.includeMetadata,
        metadataHeight: this.options.includeMetadata && !_0x4c512f ? undefined : 0,
        onProgress: ({
          stage: _0x1fd6e5,
          current: _0x410a44,
          total: _0x387e59
        }) => {
          if (_0x1fd6e5 === "encoding") {
            this._setProgress("正在编码图片…");
          } else if (_0x1fd6e5 === "rendering") {
            this._setProgress("正在渲染 " + _0x410a44 + " / " + _0x387e59);
          }
        }
      };
      const _0x5b64d3 = this.options.mode === "current-jpeg" ? "image/jpeg" : "image/png";
      const _0x4c7fff = this.options.mode === "sequence-png" ? await renderStoryboardSequence({
        shots: _0x52e48c,
        ..._0x5c259f,
        mimeType: _0x5b64d3
      }) : [await renderStoryboardGrid({
        shots: _0x52e48c,
        ..._0x5c259f,
        mimeType: _0x5b64d3,
        columns: this.options.mode === "grid-png" ? Math.sqrt(this.options.gridSize) : 1
      })];
      const _0x5e4964 = _0x5b64d3 === "image/jpeg" ? "jpg" : "png";
      if (_0x5e79bb === "local") {
        const _0xfc6798 = _0x4c7fff.map((_0x2f0481, _0x1e7836) => {
          const _0x17ff99 = _0x4c7fff.length > 1 ? "-" + String(_0x1e7836 + 1).padStart(2, "0") : "";
          return {
            kind: "image",
            blob: _0x2f0481.blob,
            filename: "" + safeFileName(_0x4b9510?.name) + _0x17ff99 + "." + _0x5e4964
          };
        });
        const _0x15166f = await this.downloadResults(_0xfc6798, {
          documentObject: this.document,
          windowObject: this.window
        });
        if (_0x15166f?.canceled) {
          this._setProgress("已取消保存。");
          return;
        }
      }
      await this.onComplete?.({
        project: _0x4b9510,
        options: {
          ...this.options,
          returnToCanvas: _0x5e79bb === "canvas",
          destination: _0x5e79bb,
          selectedShotIds: [...this.selectedShotIds],
          gridSlots: [...this.gridSlots]
        },
        results: _0x4c7fff
      });
      this._setProgress(_0x5e79bb === "canvas" ? "已将导出结果发送到画布。" : "已导出到本地，共 " + _0x4c7fff.length + " 个文件。");
    } catch (_0x2e1421) {
      this._setProgress("导出失败：" + (_0x2e1421?.message || String(_0x2e1421)));
    } finally {
      this._setBusy(false);
    }
  }
  close() {
    if (this.busy || !this.root) {
      return false;
    }
    const _0xea7d17 = this.returnFocusElement;
    this.root.removeEventListener("click", this._handleClick);
    this.root.removeEventListener("change", this._handleChange);
    this.root.removeEventListener("submit", this._handleSubmit);
    this.root.removeEventListener("keydown", this._handleKeyDown);
    this.root.removeEventListener("dragstart", this._handleDragStart);
    this.root.removeEventListener("dragover", this._handleDragOver);
    this.root.removeEventListener("dragleave", this._handleDragLeave);
    this.root.removeEventListener("drop", this._handleDrop);
    this.root.removeEventListener("dragend", this._handleDragEnd);
    this.root.remove();
    this.root = null;
    this.dragState = null;
    this.returnFocusElement = null;
    restoreStoryboard3DFocus(_0xea7d17, this.document);
    return true;
  }
  destroy() {
    this.busy = false;
    return this.close();
  }
}
export function createStoryboard3DExportController(_0x46b7ae = {}) {
  return new Storyboard3DExportController(_0x46b7ae);
}