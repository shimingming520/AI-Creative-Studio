import a1006_0x2a169 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { saveOutputBlob } from "./project.js";
import { generateId, screenToWorld, worldToScreen, isPointInRect } from "../core/math.js";
import { commit } from "./history.js";
import { buildBinaryBoundaryMask, floodFillRegion, getCachedSealedFillRegion, paintFilledRegion, sealRegionToBoundary } from "./bucketFill.js";
import { IMAGE_BRUSH_MAX_SIZE_PX, clampImageBrushSize, drawRoundBrushStroke, getEraserClearLineWidth, getBrushLineWidth, mapBrushPoints, syncCircularBrushCursor } from "./imageEditorBrushStyle.js";
import { getPixelToolPalette } from "./pixelToolPalette.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import { waitForImageElementReady } from "./imageOverlayReadiness.js";
const getCssVar = _0x3bbdc8 => getComputedStyle(document.documentElement).getPropertyValue(_0x3bbdc8).trim();
const DEFAULT_MATTING_BRUSH_SIZE_PX = 40;
const MAX_MATTING_BRUSH_SIZE_PX = IMAGE_BRUSH_MAX_SIZE_PX;
const OPAQUE_MASK_PREVIEW_CLEAR = "black";
function imageMattingText(_0x5e9a8b, _0x2f6105 = {}) {
  return t("imageMatting." + _0x5e9a8b, _0x2f6105);
}
function clampMattingBrushSize(_0x395962, _0x4fdde2 = DEFAULT_MATTING_BRUSH_SIZE_PX) {
  return clampImageBrushSize(_0x395962, _0x4fdde2);
}
const isFiniteCommandPoint = _0xd5185e => Number.isFinite(Number(_0xd5185e?.x)) && Number.isFinite(Number(_0xd5185e?.y));
const hasDrawableStrokePoints = _0xd5e501 => Array.isArray(_0xd5e501?.points) && _0xd5e501.points.some(isFiniteCommandPoint);
const shouldDiscardStrokeCommand = _0x2365b6 => (_0x2365b6?.type === "brush" || _0x2365b6?.type === "eraser") && !hasDrawableStrokePoints(_0x2365b6);
const MATTING_TOOLBAR_HTML = "\n      <button class=\"v2-matting-btn icon-only act-cancel\" data-matting-tooltip=\"cancel\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg></button>\n      <div class=\"v2-matting-divider\"></div>\n      <button class=\"v2-matting-btn icon-only tool-btn active\" data-tool=\"brush\" data-brush-mode=\"normal\" data-matting-tooltip=\"brush\">\n        <svg class=\"brush-icon-normal\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\"/></svg>\n        <svg class=\"brush-icon-alpha\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\" style=\"display:none\"><path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\"/><path d=\"M3 3h6v6H3z\" fill=\"currentColor\" fill-opacity=\"0.3\"/></svg>\n      </button>\n      <button class=\"v2-matting-btn icon-only tool-btn\" data-tool=\"eraser\" data-matting-tooltip=\"eraser\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M20 20H7l-5-5a2 2 0 0 1 0-2.83l9.17-9.17a2 2 0 0 1 2.83 0L22 10a2 2 0 0 1 0 2.83L14.83 20\"/></svg></button>\n      <button class=\"v2-matting-btn icon-only tool-btn\" data-tool=\"bucket\" data-matting-tooltip=\"bucket\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M19 11l-8-8-8.5 8.5a2.12 2.12 0 0 0 0 3l4 4a2.12 2.12 0 0 0 3 0L19 11z\"/><path d=\"M16 14l-3.5 3.5\"/><path d=\"M12 18l-2 2\"/><path d=\"M20 20l-2-2\"/></svg></button>\n      <div class=\"v2-matting-divider\"></div>\n      <div class=\"v2-matting-size\"><span class=\"v2-matting-size-value\"></span><input class=\"v2-matting-size-range\" type=\"range\" min=\"1\" max=\"" + MAX_MATTING_BRUSH_SIZE_PX + "\" step=\"1\"></div>\n      <div class=\"v2-matting-divider\"></div>\n      <button class=\"v2-matting-btn icon-only act-undo\" data-matting-tooltip=\"undo\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M9 14l-4-4 4-4\"/><path d=\"M5 10h9a6 6 0 1 1 0 12h-3\"/></svg></button>\n      <button class=\"v2-matting-btn icon-only act-redo\" data-matting-tooltip=\"redo\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M15 14l4-4-4-4\"/><path d=\"M19 10H10a6 6 0 1 0 0 12h3\"/></svg></button>\n      <button class=\"v2-matting-btn icon-only act-clear\" data-matting-tooltip=\"clear\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M3 6h18\"/><path d=\"M8 6V4h8v2\"/><path d=\"M6 6l1 16h10l1-16\"/></svg></button>\n      <button class=\"v2-matting-btn v2-matting-save act-save\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2Z\"/><path d=\"M17 21v-8H7v8\"/><path d=\"M7 3v4h8\"/></svg><span class=\"v2-matting-save-label\"></span></button>\n    ";
const ImageMattingController = {
  active: false,
  nodeId: null,
  nodeData: null,
  overlayEl: null,
  containerEl: null,
  imgEl: null,
  canvasEl: null,
  toolbarEl: null,
  sizeValueEl: null,
  sizeRangeEl: null,
  toolButtons: null,
  cursorEl: null,
  _cursorHover: false,
  _cursorLast: {
    x: 0,
    y: 0
  },
  _cursorRaf: 0,
  _unsubscribe: null,
  _commands: [],
  _redoStack: [],
  _draft: null,
  _dirty: false,
  _baseMaskCleared: false,
  _view: null,
  _normalMaskCanvas: null,
  _normalOverlayCanvas: null,
  _alphaMaskCanvas: null,
  _alphaOverlayCanvas: null,
  _fillRegionCache: null,
  _unsubscribeLocale: null,
  _isSaving: false,
  init(_0x314623) {
    if (this.active) {
      return;
    }
    const _0xade150 = a1006_0x2a169.getStateRaw();
    const _0x3a1d97 = _0xade150.nodes?.[_0x314623];
    if (!_0x3a1d97) {
      return;
    }
    const _0x5f0a6c = this._resolveNodeImageUrl(_0x3a1d97);
    if (!_0x5f0a6c) {
      window.showToast?.(imageMattingText("toasts.noImage"), "warn");
      return;
    }
    const _0x44d982 = new Set(["brush", "eraser", "bucket"]);
    const _0x1db747 = _0x44d982.has(_0xade150.matting?.tool) ? _0xade150.matting.tool : "brush";
    const _0x37102f = clampMattingBrushSize(_0xade150.matting?.brushSizePx);
    const _0x264b02 = _0xade150.matting?.brushMode || "normal";
    this.active = true;
    this.nodeId = _0x314623;
    this.nodeData = _0x3a1d97;
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._dirty = false;
    this._baseMaskCleared = false;
    this._fillRegionCache = new Map();
    this._isSaving = false;
    this._view = {
      tool: _0x1db747,
      brushSizePx: _0x37102f,
      brushMode: _0x264b02,
      viewport: _0xade150.viewport,
      node: _0x3a1d97
    };
    a1006_0x2a169.setMattingState({
      active: true,
      nodeId: _0x314623,
      tool: _0x1db747,
      brushSizePx: _0x37102f,
      brushMode: _0x264b02
    });
    this._createUI(_0x5f0a6c, {
      tool: _0x1db747,
      brushSizePx: _0x37102f,
      brushMode: _0x264b02
    });
    this._loadExistingMask();
    this._bindEvents();
    this._unsubscribe = a1006_0x2a169.subscribeSelector(_0x4a44af => {
      const _0x406c8b = _0x4a44af.nodes?.[_0x314623];
      const _0x589177 = _0x4a44af.viewport || {
        x: 0,
        y: 0,
        zoom: 1
      };
      const _0x158a98 = _0x4a44af.matting || {};
      return {
        hasNode: !!_0x406c8b,
        nx: _0x406c8b ? _0x406c8b.x : 0,
        ny: _0x406c8b ? _0x406c8b.y : 0,
        nw: _0x406c8b ? _0x406c8b.width : 0,
        nh: _0x406c8b ? _0x406c8b.height : 0,
        vx: _0x589177.x,
        vy: _0x589177.y,
        vz: _0x589177.zoom || 1,
        vox: _0x589177._screenOriginX || 0,
        voy: _0x589177._screenOriginY || 0,
        tool: _0x158a98.tool || "brush",
        brushSizePx: clampMattingBrushSize(_0x158a98.brushSizePx),
        brushMode: _0x158a98.brushMode || "normal"
      };
    }, _0x3af9cf => {
      if (!_0x3af9cf?.hasNode) {
        return;
      }
      this._view = {
        tool: _0x3af9cf.tool,
        brushSizePx: _0x3af9cf.brushSizePx,
        brushMode: _0x3af9cf.brushMode,
        viewport: {
          x: _0x3af9cf.vx,
          y: _0x3af9cf.vy,
          zoom: _0x3af9cf.vz,
          _screenOriginX: _0x3af9cf.vox,
          _screenOriginY: _0x3af9cf.voy
        },
        node: {
          x: _0x3af9cf.nx,
          y: _0x3af9cf.ny,
          width: _0x3af9cf.nw,
          height: _0x3af9cf.nh
        }
      };
      this._updateView(this._view);
    });
    this._waitForImageAndShow();
  },
  _waitForImageAndShow() {
    this._cancelImageReadyWait?.();
    this.overlayEl?.classList.add("visible");
    this._cancelImageReadyWait = waitForImageElementReady({
      image: this.imgEl,
      onReady: () => {
        this._cancelImageReadyWait = null;
        if (this.active && this._view) {
          this._updateView(this._view);
        }
      },
      onError: () => {
        this._cancelImageReadyWait = null;
        if (!this.active) {
          return;
        }
        window.showToast?.(imageMattingText("errors.imageLoadFailed"), "error");
        this.exit({
          silent: true
        });
      }
    });
  },
  exit({
    silent = false
  } = {}) {
    if (!this.active) {
      return;
    }
    this._cancelImageReadyWait?.();
    this._cancelImageReadyWait = null;
    if (!silent && this._dirty) {
      window.showToast?.(imageMattingText("toasts.cancelled"), "ok");
    }
    this.active = false;
    this.nodeId = null;
    this.nodeData = null;
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._dirty = false;
    this._normalMaskCanvas = null;
    this._normalOverlayCanvas = null;
    this._alphaMaskCanvas = null;
    this._alphaOverlayCanvas = null;
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    this._isSaving = false;
    this._fillRegionCache = null;
    a1006_0x2a169.setMattingState({
      active: false,
      nodeId: null
    });
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    if (this.overlayEl) {
      this.overlayEl.remove();
    }
    if (this.toolbarEl) {
      this.toolbarEl.remove();
    }
    this.overlayEl = null;
    this.containerEl = null;
    this.imgEl = null;
    this.canvasEl = null;
    this.toolbarEl = null;
    this.sizeValueEl = null;
    this.sizeRangeEl = null;
    this.toolButtons = null;
    this.cursorEl = null;
    this._cursorHover = false;
    this._cursorLast = {
      x: 0,
      y: 0
    };
    this._cursorRaf = 0;
    this._view = null;
  },
  _createUI(_0x8a5b4a, _0x249f2b = {}) {
    const _0x5c6d37 = document.createElement("div");
    _0x5c6d37.className = "v2-matting-overlay";
    const _0x3d24e4 = document.createElement("div");
    _0x3d24e4.className = "v2-matting-container";
    const _0x144154 = document.createElement("img");
    _0x144154.className = "v2-matting-img";
    _0x144154.src = _0x8a5b4a;
    _0x144154.draggable = false;
    const _0x1a16a4 = document.createElement("canvas");
    _0x1a16a4.className = "v2-matting-canvas";
    const _0x4efee1 = document.createElement("div");
    _0x4efee1.className = "v2-matting-cursor";
    _0x4efee1.style.display = "none";
    _0x3d24e4.appendChild(_0x144154);
    _0x3d24e4.appendChild(_0x1a16a4);
    _0x5c6d37.appendChild(_0x4efee1);
    _0x5c6d37.appendChild(_0x3d24e4);
    document.body.appendChild(_0x5c6d37);
    this.overlayEl = _0x5c6d37;
    this.containerEl = _0x3d24e4;
    this.imgEl = _0x144154;
    this.canvasEl = _0x1a16a4;
    this.cursorEl = _0x4efee1;
    const _0x991e6e = document.createElement("div");
    _0x991e6e.className = "v2-matting-toolbar";
    _0x991e6e.innerHTML = MATTING_TOOLBAR_HTML;
    document.body.appendChild(_0x991e6e);
    this.toolbarEl = _0x991e6e;
    this.sizeValueEl = _0x991e6e.querySelector(".v2-matting-size-value");
    this.sizeRangeEl = _0x991e6e.querySelector(".v2-matting-size-range");
    this.toolButtons = Array.from(_0x991e6e.querySelectorAll(".tool-btn"));
    this._subscribeLocaleChanges();
    this._syncLocaleTexts();
    const _0x1d63a8 = clampMattingBrushSize(_0x249f2b.brushSizePx);
    const _0x451258 = _0x249f2b.tool || "brush";
    this.sizeRangeEl.value = String(_0x1d63a8);
    this.sizeValueEl.textContent = String(_0x1d63a8);
    this._updateToolActive(_0x451258, _0x1d63a8);
    if (this._view) {
      this._updateView(this._view);
    }
  },
  _bindEvents() {
    const _0xe8680a = _0x3e0b5c => {
      const _0x1e0c53 = this.canvasEl && (_0x3e0b5c.target === this.canvasEl || this.canvasEl.contains(_0x3e0b5c.target));
      if (_0x1e0c53) {
        this._onCanvasWheel(_0x3e0b5c);
        return;
      }
      _0x3e0b5c.preventDefault();
      _0x3e0b5c.stopPropagation();
    };
    this.overlayEl.addEventListener("wheel", _0xe8680a, {
      passive: false
    });
    const _0x4d1dba = () => {
      if (this._view) {
        this._updateView(this._view);
      }
    };
    window.addEventListener("resize", _0x4d1dba);
    const _0x1ccbea = () => {
      window.removeEventListener("resize", _0x4d1dba);
      this.overlayEl?.removeEventListener("wheel", _0xe8680a);
    };
    const _0x402212 = this.exit.bind(this);
    this.exit = (_0x5c6702 = {}) => {
      _0x1ccbea();
      _0x402212(_0x5c6702);
    };
    this.toolbarEl.addEventListener("pointerdown", _0x2821f6 => _0x2821f6.stopPropagation());
    this.toolbarEl.querySelector(".act-cancel").addEventListener("click", _0x529063 => {
      _0x529063.stopPropagation();
      this.exit();
    });
    this.toolButtons.forEach(_0xc1cf6f => {
      _0xc1cf6f.addEventListener("click", _0x449a08 => {
        _0x449a08.stopPropagation();
        const _0x19994a = _0xc1cf6f.dataset.tool;
        this._switchTool(_0x19994a);
      });
    });
    this.sizeRangeEl.addEventListener("input", _0x4be363 => {
      const _0x54ca68 = clampMattingBrushSize(_0x4be363.target.value, 1);
      a1006_0x2a169.setMattingState({
        brushSizePx: _0x54ca68
      });
      this.sizeValueEl.textContent = String(_0x54ca68);
      this._syncCursor();
    });
    this.toolbarEl.querySelector(".act-undo").addEventListener("click", _0x10c5b0 => {
      _0x10c5b0.stopPropagation();
      this._undo();
    });
    this.toolbarEl.querySelector(".act-redo").addEventListener("click", _0x4efacc => {
      _0x4efacc.stopPropagation();
      this._redo();
    });
    this.toolbarEl.querySelector(".act-clear").addEventListener("click", _0x206bde => {
      _0x206bde.stopPropagation();
      this._clear();
    });
    this.toolbarEl.querySelector(".act-save").addEventListener("click", async _0x539537 => {
      _0x539537.stopPropagation();
      await this._save();
    });
    const _0x1a1153 = this.canvasEl.getContext("2d");
    _0x1a1153.lineCap = "round";
    _0x1a1153.lineJoin = "round";
    const _0x57e91c = {
      down: false,
      pointerId: null
    };
    const _0x2922f9 = (_0x2d4757, _0x4e5a22) => {
      this._cursorLast = {
        x: _0x2d4757,
        y: _0x4e5a22
      };
      if (this._cursorRaf) {
        return;
      }
      this._cursorRaf = requestAnimationFrame(() => {
        this._cursorRaf = 0;
        this._syncCursor();
      });
    };
    const _0x598ef4 = (_0x440893, _0x5b6b83, _0x4fd23d, _0x3bc418 = 0) => {
      const _0x41ea59 = a1006_0x2a169.getStateRaw();
      const _0x329327 = _0x41ea59.nodes?.[this.nodeId];
      if (!_0x329327) {
        return false;
      }
      const _0x4f15d4 = screenToWorld(_0x440893, _0x5b6b83, _0x41ea59.viewport);
      if (!isPointInRect(_0x4f15d4.x, _0x4f15d4.y, _0x329327.x, _0x329327.y, _0x329327.width, _0x329327.height)) {
        return false;
      }
      const _0x3cc2cf = {
        x: _0x4f15d4.x - _0x329327.x,
        y: _0x4f15d4.y - _0x329327.y
      };
      const _0x2b6db5 = _0x41ea59.matting?.tool || "brush";
      if (_0x2b6db5 === "bucket") {
        const _0x380220 = clampMattingBrushSize(_0x41ea59.matting?.brushSizePx);
        const _0x241859 = _0x380220 / (_0x41ea59.viewport.zoom || 1);
        this._fillArea(_0x3cc2cf, _0x241859);
        return true;
      }
      const _0x2c9000 = clampMattingBrushSize(_0x41ea59.matting?.brushSizePx);
      const _0x168bbc = _0x2c9000 / (_0x41ea59.viewport.zoom || 1);
      const _0x18db3b = _0x41ea59.matting?.brushMode || "normal";
      if (_0x2b6db5 === "eraser") {
        this._draft = {
          type: "eraser",
          sizeWorld: _0x168bbc,
          points: [_0x3cc2cf]
        };
      } else {
        this._draft = {
          type: "brush",
          sizeWorld: _0x168bbc,
          points: [_0x3cc2cf],
          mode: _0x18db3b
        };
      }
      _0x57e91c.down = true;
      _0x57e91c.pointerId = _0x4fd23d;
      this.canvasEl.setPointerCapture(_0x4fd23d);
      this._render();
      return true;
    };
    const _0x19970b = (_0x49df7, _0x1c68da) => {
      if (!_0x57e91c.down || !this._draft) {
        return;
      }
      const _0x597dc7 = a1006_0x2a169.getStateRaw();
      const _0x3050bc = _0x597dc7.nodes?.[this.nodeId];
      if (!_0x3050bc) {
        return;
      }
      const _0x572f92 = screenToWorld(_0x49df7, _0x1c68da, _0x597dc7.viewport);
      const _0x3d1a6b = {
        x: _0x572f92.x - _0x3050bc.x,
        y: _0x572f92.y - _0x3050bc.y
      };
      this._draft.points.push(_0x3d1a6b);
      this._render();
    };
    const _0x297635 = () => {
      if (!_0x57e91c.down || !this._draft) {
        return;
      }
      const _0x24d522 = this._draft;
      this._draft = null;
      _0x57e91c.down = false;
      _0x57e91c.pointerId = null;
      if (shouldDiscardStrokeCommand(_0x24d522)) {
        this._render();
        return;
      }
      this._commands.push(_0x24d522);
      this._redoStack = [];
      this._dirty = true;
      this._render();
    };
    this.canvasEl.addEventListener("pointerdown", _0x377564 => {
      _0x377564.preventDefault();
      _0x377564.stopPropagation();
      _0x2922f9(_0x377564.clientX, _0x377564.clientY);
      _0x598ef4(_0x377564.clientX, _0x377564.clientY, _0x377564.pointerId, _0x377564.button);
    });
    this.canvasEl.addEventListener("pointermove", _0x22092a => {
      _0x22092a.preventDefault();
      _0x22092a.stopPropagation();
      _0x2922f9(_0x22092a.clientX, _0x22092a.clientY);
      _0x19970b(_0x22092a.clientX, _0x22092a.clientY);
    });
    this.canvasEl.addEventListener("pointerup", _0x2f4dcc => {
      _0x2f4dcc.preventDefault();
      _0x2f4dcc.stopPropagation();
      _0x2922f9(_0x2f4dcc.clientX, _0x2f4dcc.clientY);
      _0x297635();
    });
    this.canvasEl.addEventListener("pointercancel", _0x463654 => {
      _0x463654.preventDefault();
      _0x463654.stopPropagation();
      _0x2922f9(_0x463654.clientX, _0x463654.clientY);
      _0x297635();
    });
    this.canvasEl.addEventListener("pointerenter", _0x2d4993 => {
      this._cursorHover = true;
      _0x2922f9(_0x2d4993.clientX, _0x2d4993.clientY);
    });
    this.canvasEl.addEventListener("pointerleave", () => {
      this._cursorHover = false;
      this._syncCursor();
    });
  },
  _onCanvasWheel(_0x13068f) {
    _0x13068f.preventDefault();
    _0x13068f.stopPropagation();
    if (!this.active) {
      return;
    }
    if (!this._cursorHover) {
      return;
    }
    const _0x305e93 = this._view?.tool || "brush";
    if (_0x305e93 !== "brush" && _0x305e93 !== "eraser" && _0x305e93 !== "bucket") {
      return;
    }
    const _0x59445a = _0x13068f.deltaY || 0;
    const _0x35d105 = _0x59445a < 0 ? 1 : -1;
    const _0x3d45b8 = clampMattingBrushSize(this._view?.brushSizePx);
    const _0x112d71 = clampMattingBrushSize(_0x3d45b8 + _0x35d105 * 2);
    if (_0x112d71 === _0x3d45b8) {
      return;
    }
    a1006_0x2a169.setMattingState({
      brushSizePx: _0x112d71
    });
    if (this.sizeRangeEl) {
      this.sizeRangeEl.value = String(_0x112d71);
    }
    if (this.sizeValueEl) {
      this.sizeValueEl.textContent = String(_0x112d71);
    }
    this._syncCursor();
  },
  _syncCursor(_0x15931d = this._view?.tool || "brush", _0xd80018 = this._view?.brushSizePx || DEFAULT_MATTING_BRUSH_SIZE_PX) {
    if (!this.cursorEl) {
      return;
    }
    syncCircularBrushCursor({
      cursorEl: this.cursorEl,
      canvasEl: this.canvasEl,
      visible: this._cursorHover,
      tool: _0x15931d,
      allowedTools: ["brush", "eraser", "bucket"],
      sizePx: _0xd80018,
      cursorLast: this._cursorLast
    });
  },
  _subscribeLocaleChanges() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
  },
  _syncLocaleTexts() {
    if (!this.toolbarEl) {
      return;
    }
    this.toolbarEl.querySelectorAll("[data-matting-tooltip]").forEach(_0x1c1470 => {
      const _0x111c63 = _0x1c1470.dataset.mattingTooltip;
      if (!_0x111c63) {
        return;
      }
      let _0x2238fd = imageMattingText("tooltips." + _0x111c63);
      if (_0x111c63 === "brush") {
        _0x2238fd = _0x1c1470.dataset.brushMode === "alpha" ? imageMattingText("tooltips.brushAlphaToggle") : imageMattingText("tooltips.brushNormal");
      }
      _0x1c1470.dataset.tooltip = _0x2238fd;
    });
    const _0x281b1f = this.toolbarEl.querySelector(".v2-matting-save-label");
    if (_0x281b1f && !this._isSaving) {
      _0x281b1f.textContent = imageMattingText("actions.save");
    }
  },
  _switchTool(_0x36fbff) {
    const _0x59cf96 = this.toolButtons.find(_0x401382 => _0x401382.dataset.tool === _0x36fbff);
    if (!_0x59cf96) {
      return;
    }
    if (_0x59cf96.disabled) {
      return;
    }
    const _0x5841fc = a1006_0x2a169.getState();
    const _0x4b5440 = _0x5841fc.matting?.tool;
    if (_0x36fbff === "brush") {
      if (_0x4b5440 === "brush") {
        const _0x30f33d = _0x59cf96.dataset.brushMode || "normal";
        const _0x5dd36a = _0x30f33d === "normal" ? "alpha" : "normal";
        _0x59cf96.dataset.brushMode = _0x5dd36a;
        a1006_0x2a169.setMattingState({
          tool: _0x36fbff,
          brushMode: _0x5dd36a
        });
        _0x59cf96.dataset.tooltip = _0x5dd36a === "normal" ? imageMattingText("tooltips.brushNormalToggle") : imageMattingText("tooltips.brushAlphaToggle");
        const _0x496efc = _0x59cf96.querySelector(".brush-icon-normal");
        const _0x48a31f = _0x59cf96.querySelector(".brush-icon-alpha");
        if (_0x496efc && _0x48a31f) {
          _0x496efc.style.display = _0x5dd36a === "normal" ? "block" : "none";
          _0x48a31f.style.display = _0x5dd36a === "alpha" ? "block" : "none";
        }
      } else {
        a1006_0x2a169.setMattingState({
          tool: _0x36fbff
        });
      }
    } else {
      a1006_0x2a169.setMattingState({
        tool: _0x36fbff
      });
    }
    this._updateToolActive();
  },
  _changeBrushSize(_0x582221) {
    const _0x3a1a0b = clampMattingBrushSize(this._view?.brushSizePx);
    const _0x44fd04 = clampMattingBrushSize(_0x3a1a0b + _0x582221);
    if (_0x44fd04 !== _0x3a1a0b) {
      a1006_0x2a169.setMattingState({
        brushSizePx: _0x44fd04
      });
      if (this.sizeRangeEl) {
        this.sizeRangeEl.value = String(_0x44fd04);
      }
      if (this.sizeValueEl) {
        this.sizeValueEl.textContent = String(_0x44fd04);
      }
      this._syncCursor();
    }
  },
  _updateToolActive(_0x562e7c = this._view?.tool || "brush", _0x130892 = this._view?.brushSizePx || DEFAULT_MATTING_BRUSH_SIZE_PX) {
    this.toolButtons.forEach(_0x4e306d => {
      if (_0x4e306d.dataset.tool === _0x562e7c) {
        _0x4e306d.classList.add("active");
      } else {
        _0x4e306d.classList.remove("active");
      }
    });
    this._syncCursor(_0x562e7c, _0x130892);
  },
  _updateView(_0x498595) {
    if (!this.active) {
      return;
    }
    const _0x139a67 = _0x498595?.node;
    const _0x3fda2b = _0x498595?.viewport;
    if (!_0x139a67) {
      return;
    }
    this.nodeData = _0x139a67;
    const _0x434735 = clampMattingBrushSize(_0x498595?.brushSizePx);
    if (this.sizeRangeEl && Number(this.sizeRangeEl.value) !== _0x434735) {
      this.sizeRangeEl.value = String(_0x434735);
    }
    if (this.sizeValueEl && this.sizeValueEl.textContent !== String(_0x434735)) {
      this.sizeValueEl.textContent = String(_0x434735);
    }
    this._updateToolActive(_0x498595?.tool, _0x434735);
    const _0x116138 = worldToScreen(_0x139a67.x, _0x139a67.y, _0x3fda2b);
    const _0x162f2c = Math.round(_0x139a67.width * _0x3fda2b.zoom);
    const _0x1db3a5 = Math.round(_0x139a67.height * _0x3fda2b.zoom);
    this.containerEl.style.left = Math.round(_0x116138.x) + "px";
    this.containerEl.style.top = Math.round(_0x116138.y) + "px";
    this.containerEl.style.width = _0x162f2c + "px";
    this.containerEl.style.height = _0x1db3a5 + "px";
    const _0x970dc4 = window.devicePixelRatio || 1;
    const _0x3e0d42 = Math.max(1, _0x162f2c);
    const _0x4adb08 = Math.max(1, _0x1db3a5);
    if (this.canvasEl.width !== Math.round(_0x3e0d42 * _0x970dc4) || this.canvasEl.height !== Math.round(_0x4adb08 * _0x970dc4)) {
      this.canvasEl.width = Math.round(_0x3e0d42 * _0x970dc4);
      this.canvasEl.height = Math.round(_0x4adb08 * _0x970dc4);
      this.canvasEl.style.width = _0x3e0d42 + "px";
      this.canvasEl.style.height = _0x4adb08 + "px";
      const _0x50d980 = this.canvasEl.getContext("2d");
      _0x50d980.setTransform(_0x970dc4, 0, 0, _0x970dc4, 0, 0);
      _0x50d980.lineCap = "round";
      _0x50d980.lineJoin = "round";
    }
    const _0x27467c = Math.max(12, Math.round(_0x116138.y) - 54);
    this.toolbarEl.style.left = Math.round(_0x116138.x + _0x162f2c / 2) + "px";
    this.toolbarEl.style.top = _0x27467c + "px";
    this._render(_0x3fda2b);
  },
  _render(_0x2bf32d = this._view?.viewport) {
    if (!this.active || !this.canvasEl) {
      return;
    }
    const _0x53b5ea = this.canvasEl.getContext("2d");
    const _0x1b3383 = Number(this.canvasEl.style.width.replace("px", "")) || 1;
    const _0x78c88 = Number(this.canvasEl.style.height.replace("px", "")) || 1;
    _0x53b5ea.clearRect(0, 0, _0x1b3383, _0x78c88);
    const _0x3657cb = this._commands;
    const _0x25a507 = this._prepareNormalMaskCanvas(_0x1b3383, _0x78c88);
    const _0x35e057 = this._prepareAlphaMaskCanvas(_0x1b3383, _0x78c88);
    this._renderCommands(_0x53b5ea, _0x2bf32d, _0x3657cb, false, {
      normalMaskCtx: _0x25a507,
      alphaMaskCtx: _0x35e057,
      boundarySource: _0x3657cb
    });
    if (this._draft) {
      const _0x594230 = _0x3657cb.concat([this._draft]);
      this._renderCommands(_0x53b5ea, _0x2bf32d, [this._draft], true, {
        normalMaskCtx: _0x25a507,
        alphaMaskCtx: _0x35e057,
        boundarySource: _0x594230
      });
    }
    this._compositeNormalMask(_0x53b5ea, _0x1b3383, _0x78c88);
    this._compositeAlphaMask(_0x53b5ea, _0x2bf32d, _0x1b3383, _0x78c88);
  },
  _prepareNormalMaskCanvas(_0x42eedd, _0x27fe8a) {
    const _0x1e46e2 = Math.max(1, Math.round(_0x42eedd || 1));
    const _0x10588f = Math.max(1, Math.round(_0x27fe8a || 1));
    if (!this._normalMaskCanvas || this._normalMaskCanvas.width !== _0x1e46e2 || this._normalMaskCanvas.height !== _0x10588f) {
      const _0x4f5317 = document.createElement("canvas");
      _0x4f5317.width = _0x1e46e2;
      _0x4f5317.height = _0x10588f;
      this._normalMaskCanvas = _0x4f5317;
    }
    if (!this._normalOverlayCanvas || this._normalOverlayCanvas.width !== _0x1e46e2 || this._normalOverlayCanvas.height !== _0x10588f) {
      const _0xd5dd58 = document.createElement("canvas");
      _0xd5dd58.width = _0x1e46e2;
      _0xd5dd58.height = _0x10588f;
      this._normalOverlayCanvas = _0xd5dd58;
    }
    const _0x78b9b3 = this._normalMaskCanvas.getContext("2d");
    if (!_0x78b9b3) {
      return null;
    }
    _0x78b9b3.clearRect(0, 0, _0x1e46e2, _0x10588f);
    _0x78b9b3.lineCap = "round";
    _0x78b9b3.lineJoin = "round";
    return _0x78b9b3;
  },
  _prepareAlphaMaskCanvas(_0x585554, _0x3ac9db) {
    const _0x3c21ed = Math.max(1, Math.round(_0x585554 || 1));
    const _0x1f6fc5 = Math.max(1, Math.round(_0x3ac9db || 1));
    if (!this._alphaMaskCanvas || this._alphaMaskCanvas.width !== _0x3c21ed || this._alphaMaskCanvas.height !== _0x1f6fc5) {
      const _0x31c4a5 = document.createElement("canvas");
      _0x31c4a5.width = _0x3c21ed;
      _0x31c4a5.height = _0x1f6fc5;
      this._alphaMaskCanvas = _0x31c4a5;
    }
    if (!this._alphaOverlayCanvas || this._alphaOverlayCanvas.width !== _0x3c21ed || this._alphaOverlayCanvas.height !== _0x1f6fc5) {
      const _0x122172 = document.createElement("canvas");
      _0x122172.width = _0x3c21ed;
      _0x122172.height = _0x1f6fc5;
      this._alphaOverlayCanvas = _0x122172;
    }
    const _0x28c32d = this._alphaMaskCanvas.getContext("2d");
    if (!_0x28c32d) {
      return null;
    }
    _0x28c32d.clearRect(0, 0, _0x3c21ed, _0x1f6fc5);
    _0x28c32d.lineCap = "round";
    _0x28c32d.lineJoin = "round";
    return _0x28c32d;
  },
  _compositeNormalMask(_0x170a33, _0x4a90db, _0x2f4176) {
    if (!_0x170a33 || !this._normalMaskCanvas || !this._normalOverlayCanvas) {
      return;
    }
    const _0x55f89e = Math.max(1, Number(_0x4a90db) || 1);
    const _0x34f573 = Math.max(1, Number(_0x2f4176) || 1);
    const _0x45b0fa = this._normalOverlayCanvas.getContext("2d");
    if (!_0x45b0fa) {
      return;
    }
    const _0x4234e3 = getPixelToolPalette();
    _0x45b0fa.clearRect(0, 0, _0x55f89e, _0x34f573);
    _0x45b0fa.save();
    _0x45b0fa.globalCompositeOperation = "source-over";
    _0x45b0fa.globalAlpha = 1;
    _0x45b0fa.fillStyle = _0x4234e3.maskPreviewFill;
    _0x45b0fa.fillRect(0, 0, _0x55f89e, _0x34f573);
    _0x45b0fa.globalCompositeOperation = "destination-in";
    _0x45b0fa.drawImage(this._normalMaskCanvas, 0, 0, _0x55f89e, _0x34f573);
    _0x45b0fa.restore();
    _0x170a33.save();
    _0x170a33.globalCompositeOperation = "source-over";
    _0x170a33.globalAlpha = 1;
    _0x170a33.drawImage(this._normalOverlayCanvas, 0, 0, _0x55f89e, _0x34f573);
    _0x170a33.restore();
  },
  _compositeAlphaMask(_0x124b22, _0x1b84f6, _0x565a36, _0x18259c) {
    if (!_0x124b22 || !this._alphaMaskCanvas || !this._alphaOverlayCanvas) {
      return;
    }
    const _0x25e464 = Math.max(1, Number(_0x565a36) || 1);
    const _0xfd2a28 = Math.max(1, Number(_0x18259c) || 1);
    const _0x1abacb = this._alphaOverlayCanvas.getContext("2d");
    if (!_0x1abacb) {
      return;
    }
    _0x1abacb.clearRect(0, 0, _0x25e464, _0xfd2a28);
    const _0x31a34c = _0x1b84f6?.zoom || 1;
    const _0x49c064 = this._createCheckerboardPattern(_0x1abacb, _0x31a34c);
    _0x1abacb.save();
    _0x1abacb.globalCompositeOperation = "source-over";
    _0x1abacb.globalAlpha = 0.8;
    _0x1abacb.fillStyle = _0x49c064;
    _0x1abacb.fillRect(0, 0, _0x25e464, _0xfd2a28);
    _0x1abacb.globalCompositeOperation = "destination-in";
    _0x1abacb.globalAlpha = 1;
    _0x1abacb.drawImage(this._alphaMaskCanvas, 0, 0, _0x25e464, _0xfd2a28);
    _0x1abacb.restore();
    _0x124b22.save();
    _0x124b22.globalCompositeOperation = "source-over";
    _0x124b22.globalAlpha = 1;
    _0x124b22.drawImage(this._alphaOverlayCanvas, 0, 0, _0x25e464, _0xfd2a28);
    _0x124b22.restore();
  },
  _renderCommands(_0x10985e, _0x132beb, _0x392ac2, _0x4acd16 = false, _0x57fe97 = {}) {
    const _0x1591a2 = _0x132beb.zoom || 1;
    const _0x2be16d = Number(this.canvasEl?.style?.width?.replace("px", "")) || 1;
    const _0x39594c = Number(this.canvasEl?.style?.height?.replace("px", "")) || 1;
    const _0x20fef0 = getPixelToolPalette();
    const _0x78a5a2 = _0x57fe97.normalMaskCtx || null;
    const _0x35339e = _0x57fe97.alphaMaskCtx || null;
    const _0x40b039 = Array.isArray(_0x57fe97.boundarySource) ? _0x57fe97.boundarySource : _0x392ac2;
    _0x392ac2.forEach((_0x1fd54a, _0x5c8c7f) => {
      if (_0x1fd54a.type === "mask-preview") {
        if (!_0x1fd54a.img) {
          return;
        }
        const _0x51a5cd = Number(this.canvasEl?.style?.width?.replace("px", "")) || 1;
        const _0xe3d641 = Number(this.canvasEl?.style?.height?.replace("px", "")) || 1;
        _0x10985e.save();
        _0x10985e.globalCompositeOperation = "source-over";
        _0x10985e.drawImage(_0x1fd54a.img, 0, 0, _0x51a5cd, _0xe3d641);
        _0x10985e.restore();
        return;
      }
      if (_0x1fd54a.type === "mask-base") {
        if (!_0x1fd54a.canvas || !_0x78a5a2) {
          return;
        }
        const _0x224183 = Number(this.canvasEl?.style?.width?.replace("px", "")) || 1;
        const _0x144e29 = Number(this.canvasEl?.style?.height?.replace("px", "")) || 1;
        _0x78a5a2.save();
        _0x78a5a2.globalCompositeOperation = "source-over";
        _0x78a5a2.drawImage(_0x1fd54a.canvas, 0, 0, _0x224183, _0x144e29);
        _0x78a5a2.restore();
        return;
      }
      if (_0x1fd54a.type === "brush") {
        _0x10985e.save();
        const _0x3e2750 = _0x1fd54a.mode === "alpha";
        const _0xa9d728 = mapBrushPoints(_0x1fd54a.points, _0x1591a2, _0x1591a2);
        const _0x423701 = getBrushLineWidth(_0x1fd54a.sizeWorld, _0x1591a2, "brush");
        if (_0x3e2750) {
          if (_0x35339e) {
            _0x35339e.save();
            drawRoundBrushStroke(_0x35339e, {
              points: _0xa9d728,
              lineWidth: _0x423701,
              strokeStyle: "#fff",
              fillStyle: "#fff",
              globalCompositeOperation: "source-over"
            });
            _0x35339e.restore();
          } else {
            const _0x56602f = this._createCheckerboardPattern(_0x10985e, _0x1591a2);
            drawRoundBrushStroke(_0x10985e, {
              points: _0xa9d728,
              lineWidth: _0x423701,
              strokeStyle: _0x56602f,
              fillStyle: _0x56602f,
              globalCompositeOperation: "source-over",
              globalAlpha: 0.8
            });
          }
        } else if (_0x78a5a2) {
          _0x78a5a2.save();
          drawRoundBrushStroke(_0x78a5a2, {
            points: _0xa9d728,
            lineWidth: _0x423701,
            strokeStyle: "#fff",
            fillStyle: "#fff",
            globalCompositeOperation: "source-over"
          });
          _0x78a5a2.restore();
        } else {
          drawRoundBrushStroke(_0x10985e, {
            points: _0xa9d728,
            lineWidth: getEraserClearLineWidth(_0x423701),
            strokeStyle: OPAQUE_MASK_PREVIEW_CLEAR,
            fillStyle: OPAQUE_MASK_PREVIEW_CLEAR,
            globalCompositeOperation: "destination-out"
          });
          drawRoundBrushStroke(_0x10985e, {
            points: _0xa9d728,
            lineWidth: _0x423701,
            strokeStyle: _0x20fef0.maskPreviewFill,
            fillStyle: _0x20fef0.maskPreviewFill,
            globalCompositeOperation: "source-over",
            globalAlpha: 1
          });
        }
        _0x10985e.restore();
        return;
      }
      if (_0x1fd54a.type === "eraser") {
        const _0x4316e7 = mapBrushPoints(_0x1fd54a.points, _0x1591a2, _0x1591a2);
        const _0x14484c = getEraserClearLineWidth(getBrushLineWidth(_0x1fd54a.sizeWorld, _0x1591a2, "eraser"));
        _0x10985e.save();
        drawRoundBrushStroke(_0x10985e, {
          points: _0x4316e7,
          lineWidth: _0x14484c,
          strokeStyle: "#000",
          fillStyle: "#000",
          globalCompositeOperation: "destination-out"
        });
        _0x10985e.restore();
        if (_0x78a5a2) {
          _0x78a5a2.save();
          drawRoundBrushStroke(_0x78a5a2, {
            points: _0x4316e7,
            lineWidth: _0x14484c,
            strokeStyle: "#000",
            fillStyle: "#000",
            globalCompositeOperation: "destination-out"
          });
          _0x78a5a2.restore();
        }
        if (_0x35339e) {
          _0x35339e.save();
          drawRoundBrushStroke(_0x35339e, {
            points: _0x4316e7,
            lineWidth: _0x14484c,
            strokeStyle: "#000",
            fillStyle: "#000",
            globalCompositeOperation: "destination-out"
          });
          _0x35339e.restore();
        }
        return;
      }
      if (_0x1fd54a.type === "fill") {
        const _0x38116c = _0x1fd54a.mode === "alpha";
        const _0x385241 = Number(_0x1fd54a.x ?? _0x1fd54a.startPoint?.x) || 0;
        const _0x4f67e6 = Number(_0x1fd54a.y ?? _0x1fd54a.startPoint?.y) || 0;
        const _0x574838 = _0x40b039.indexOf(_0x1fd54a);
        const _0x23bd64 = _0x574838 >= 0 ? _0x40b039.slice(0, _0x574838) : _0x392ac2.slice(0, _0x5c8c7f);
        const _0x30167d = _0x23bd64.filter(_0x40603e => _0x40603e?.type === "brush" || _0x40603e?.type === "eraser");
        const _0x379dc0 = Math.floor(_0x385241 * _0x1591a2);
        const _0x24e3e0 = Math.floor(_0x4f67e6 * _0x1591a2);
        const _0x587485 = getCachedSealedFillRegion({
          cache: _0x57fe97.fillRegionCache || this._fillRegionCache,
          width: _0x2be16d,
          height: _0x39594c,
          zoom: _0x1591a2,
          fillCommand: _0x1fd54a,
          boundaryCommands: _0x30167d,
          seedX: _0x379dc0,
          seedY: _0x24e3e0,
          extraKey: "mode:" + (_0x1fd54a.mode || ""),
          pointToPixel: _0x488e78 => ({
            x: Number(_0x488e78?.x || 0) * _0x1591a2,
            y: Number(_0x488e78?.y || 0) * _0x1591a2
          }),
          getStrokeWidth: _0x391fd2 => getBrushLineWidth(_0x391fd2?.sizeWorld, _0x1591a2, _0x391fd2?.type)
        });
        if (_0x38116c) {
          if (_0x35339e) {
            paintFilledRegion(_0x35339e, _0x587485, _0x2be16d, _0x39594c, {
              fillStyle: "#fff",
              globalCompositeOperation: "source-over",
              globalAlpha: 1
            });
          } else {
            const _0xe40b2e = this._createCheckerboardPattern(_0x10985e, _0x1591a2);
            paintFilledRegion(_0x10985e, _0x587485, _0x2be16d, _0x39594c, {
              fillStyle: _0xe40b2e,
              globalCompositeOperation: "source-over",
              globalAlpha: 0.8
            });
          }
        } else if (_0x78a5a2) {
          paintFilledRegion(_0x78a5a2, _0x587485, _0x2be16d, _0x39594c, {
            fillStyle: "#fff",
            globalCompositeOperation: "source-over"
          });
        } else {
          paintFilledRegion(_0x10985e, _0x587485, _0x2be16d, _0x39594c, {
            fillStyle: OPAQUE_MASK_PREVIEW_CLEAR,
            globalCompositeOperation: "destination-out"
          });
          paintFilledRegion(_0x10985e, _0x587485, _0x2be16d, _0x39594c, {
            fillStyle: _0x20fef0.selectionOverlay,
            globalCompositeOperation: "source-over"
          });
        }
        return;
      }
    });
  },
  _createCheckerboardPattern(_0x5f35f, _0x21b5d9) {
    const _0x456698 = _0x21b5d9 * 8;
    const _0x8ff8b9 = document.createElement("canvas");
    _0x8ff8b9.width = _0x456698 * 2;
    _0x8ff8b9.height = _0x456698 * 2;
    const _0x4eab5e = _0x8ff8b9.getContext("2d");
    const _0x5f0864 = getPixelToolPalette();
    _0x4eab5e.fillStyle = _0x5f0864.checkerLight;
    _0x4eab5e.fillRect(0, 0, _0x456698 * 2, _0x456698 * 2);
    _0x4eab5e.fillStyle = _0x5f0864.checkerDark;
    _0x4eab5e.fillRect(0, 0, _0x456698, _0x456698);
    _0x4eab5e.fillRect(_0x456698, _0x456698, _0x456698, _0x456698);
    return _0x5f35f.createPattern(_0x8ff8b9, "repeat");
  },
  _fillArea(_0x164cda, _0x303778) {
    const _0x3776e9 = a1006_0x2a169.getState();
    const _0x1d2558 = _0x3776e9.matting?.brushMode || "normal";
    const _0x27fcca = {
      type: "fill",
      x: Number(_0x164cda?.x) || 0,
      y: Number(_0x164cda?.y) || 0,
      mode: _0x1d2558
    };
    this._commands.push(_0x27fcca);
    this._redoStack = [];
    this._dirty = true;
    this._render();
  },
  _undo() {
    if (this._commands.length === 0) {
      return;
    }
    const _0x253820 = this._commands.pop();
    this._redoStack.push(_0x253820);
    this._dirty = true;
    this._render();
  },
  _redo() {
    if (this._redoStack.length === 0) {
      return;
    }
    const _0x507f44 = this._redoStack.pop();
    this._commands.push(_0x507f44);
    this._dirty = true;
    this._render();
  },
  _clear() {
    if (this._commands.length === 0 && this._redoStack.length === 0) {
      return;
    }
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._dirty = true;
    this._baseMaskCleared = true;
    this._render();
  },
  async _save() {
    if (!this.active) {
      return;
    }
    const _0x41aba = a1006_0x2a169.getState();
    const _0x3467f2 = _0x41aba.nodes[this.nodeId];
    if (!_0x3467f2) {
      return;
    }
    const _0x52c0e6 = this._resolveNodeImageUrl(_0x3467f2);
    if (!_0x52c0e6) {
      return;
    }
    const _0x22321d = this.toolbarEl.querySelector(".act-save");
    const _0x169d7d = _0x22321d.querySelector("span");
    const _0x543d8b = _0x169d7d ? _0x169d7d.textContent : "";
    this._isSaving = true;
    if (_0x169d7d) {
      _0x169d7d.textContent = imageMattingText("actions.saving");
    }
    _0x22321d.style.pointerEvents = "none";
    try {
      const _0x19828a = this.nodeId;
      const _0x4a4d37 = Math.max(1, Number(_0x3467f2.width) || 1);
      const _0x16b7ae = Math.max(1, Number(_0x3467f2.height) || 1);
      const _0x38eecf = generateId("mask_save");
      const _0x32e952 = this._commands.filter(_0x11f403 => _0x11f403 && (_0x11f403.type === "brush" || _0x11f403.type === "eraser" || _0x11f403.type === "fill")).map(_0x127b0b => {
        if (_0x127b0b.type === "fill") {
          return {
            type: "fill",
            x: Number(_0x127b0b.x ?? _0x127b0b.startPoint?.x) || 0,
            y: Number(_0x127b0b.y ?? _0x127b0b.startPoint?.y) || 0,
            mode: _0x127b0b.mode
          };
        }
        return {
          type: _0x127b0b.type,
          sizeWorld: Number(_0x127b0b.sizeWorld) || 0,
          mode: _0x127b0b.mode,
          points: Array.isArray(_0x127b0b.points) ? _0x127b0b.points.map(_0xad5c3a => ({
            x: Number(_0xad5c3a.x),
            y: Number(_0xad5c3a.y)
          })) : []
        };
      });
      if (this._baseMaskCleared && _0x32e952.length === 0) {
        a1006_0x2a169.updateNodeData(_0x19828a, {
          mask: "",
          maskPreview: "",
          maskPolarity: "",
          maskPreviewUrl: null,
          maskSaveToken: null
        });
        window._triggerLocalCacheSave?.();
        this.exit({
          silent: true
        });
        return;
      }
      const _0x2a24f3 = this._baseMaskCleared ? "" : normalizeLocalPath(_0x3467f2?.mask);
      const _0x57c600 = await new Promise(_0x3641d4 => this.canvasEl.toBlob(_0x3641d4, "image/png"));
      if (!_0x57c600) {
        throw new Error(imageMattingText("errors.canvasExportFailed"));
      }
      const _0x1b2b64 = URL.createObjectURL(_0x57c600);
      a1006_0x2a169.updateNodeData(_0x19828a, {
        maskPreviewUrl: _0x1b2b64,
        maskSaveToken: _0x38eecf
      });
      window._triggerLocalCacheSave?.();
      this.exit({
        silent: true
      });
      (async () => {
        const _0x5d40c6 = await this._loadImage(_0x52c0e6);
        const _0x3ba6d7 = _0x5d40c6.naturalWidth || _0x5d40c6.width;
        const _0x5bd993 = _0x5d40c6.naturalHeight || _0x5d40c6.height;
        const _0xd0230d = Math.max(_0x4a4d37 / _0x3ba6d7, _0x16b7ae / _0x5bd993) || 1;
        const _0xfb3351 = _0x3ba6d7 * _0xd0230d;
        const _0x1242df = _0x5bd993 * _0xd0230d;
        const _0x15b721 = (_0x4a4d37 - _0xfb3351) / 2;
        const _0x5895bb = (_0x16b7ae - _0x1242df) / 2;
        const _0x4e7b60 = _0x1d97ae => {
          const _0x3b6e8f = (Number(_0x1d97ae?.x) - _0x15b721) / _0xd0230d;
          const _0x3b076a = (Number(_0x1d97ae?.y) - _0x5895bb) / _0xd0230d;
          return {
            x: Math.max(0, Math.min(_0x3ba6d7 - 1, _0x3b6e8f)),
            y: Math.max(0, Math.min(_0x5bd993 - 1, _0x3b076a))
          };
        };
        const _0x2ff288 = document.createElement("canvas");
        _0x2ff288.width = _0x3ba6d7;
        _0x2ff288.height = _0x5bd993;
        const _0x3611bf = _0x2ff288.getContext("2d");
        _0x3611bf.imageSmoothingEnabled = false;
        const _0x972755 = getCssVar("--canvas-white");
        const _0x338d72 = getCssVar("--canvas-black");
        _0x3611bf.fillStyle = _0x338d72;
        _0x3611bf.fillRect(0, 0, _0x3ba6d7, _0x5bd993);
        if (_0x2a24f3) {
          try {
            const _0x2a0133 = await this._loadImage(localPathToUrl(_0x2a24f3));
            _0x3611bf.drawImage(_0x2a0133, 0, 0, _0x3ba6d7, _0x5bd993);
            const _0x420cdf = a1006_0x2a169.getState().nodes?.[_0x19828a];
            const _0x145541 = String(_0x420cdf?.maskPolarity || "").trim();
            if (_0x145541 !== "paint-white") {
              this._invertCanvasBinary(_0x3611bf);
            }
          } catch (_0x13e5f8) {}
        }
        const _0x4341db = (_0x1b6cf5, _0x133812, _0x3f1a50 = 1) => {
          const _0x3a8ca0 = (Array.isArray(_0x1b6cf5.points) ? _0x1b6cf5.points : []).map(_0x300d3d => _0x4e7b60(_0x300d3d));
          if (!_0x3a8ca0.length) {
            return;
          }
          _0x3611bf.save();
          const _0x2fb715 = _0x3f1a50 >= 6 ? "eraser" : "brush";
          const _0x4b6498 = getBrushLineWidth(_0x1b6cf5.sizeWorld, 1 / _0xd0230d, _0x2fb715);
          drawRoundBrushStroke(_0x3611bf, {
            points: _0x3a8ca0,
            lineWidth: _0x2fb715 === "eraser" ? getEraserClearLineWidth(_0x4b6498) : _0x4b6498,
            strokeStyle: _0x133812,
            fillStyle: _0x133812,
            globalCompositeOperation: "source-over"
          });
          _0x3611bf.restore();
        };
        _0x32e952.forEach((_0x4c8608, _0x51e07d) => {
          if (!_0x4c8608) {
            return;
          }
          if (_0x4c8608.type === "brush") {
            _0x4341db(_0x4c8608, _0x972755, 1);
            return;
          }
          if (_0x4c8608.type === "eraser") {
            _0x4341db(_0x4c8608, _0x338d72, 6);
            return;
          }
          if (_0x4c8608.type === "fill") {
            const _0x127590 = _0x32e952.slice(0, _0x51e07d).filter(_0x3f070f => _0x3f070f?.type === "brush" || _0x3f070f?.type === "eraser");
            const _0x2e1e31 = buildBinaryBoundaryMask({
              width: _0x3ba6d7,
              height: _0x5bd993,
              commands: _0x127590,
              pointToPixel: _0x103452 => {
                const _0x3bc975 = _0x4e7b60(_0x103452 || {});
                return {
                  x: _0x3bc975.x,
                  y: _0x3bc975.y
                };
              },
              getStrokeWidth: _0x4b1183 => getBrushLineWidth(_0x4b1183?.sizeWorld, 1 / _0xd0230d, _0x4b1183?.type)
            });
            const _0x28f6cd = _0x4e7b60({
              x: _0x4c8608.x,
              y: _0x4c8608.y
            });
            const _0x162b86 = floodFillRegion(_0x2e1e31.mask, _0x2e1e31.width, _0x2e1e31.height, Math.floor(_0x28f6cd.x), Math.floor(_0x28f6cd.y));
            const _0xd00af7 = sealRegionToBoundary(_0x162b86, _0x2e1e31.mask, _0x2e1e31.width, _0x2e1e31.height);
            paintFilledRegion(_0x3611bf, _0xd00af7, _0x3ba6d7, _0x5bd993, {
              fillStyle: _0x972755,
              globalCompositeOperation: "source-over"
            });
            return;
          }
        });
        const _0x78c1e = _0x3611bf.getImageData(0, 0, _0x3ba6d7, _0x5bd993).data;
        const _0x3fc866 = Math.max(1, Math.floor(Math.max(_0x3ba6d7, _0x5bd993) / 256));
        let _0x310d61 = false;
        for (let _0x460f97 = 0; _0x460f97 < _0x5bd993 && !_0x310d61; _0x460f97 += _0x3fc866) {
          for (let _0xc2b5e1 = 0; _0xc2b5e1 < _0x3ba6d7; _0xc2b5e1 += _0x3fc866) {
            const _0xb30e62 = (_0x460f97 * _0x3ba6d7 + _0xc2b5e1) * 4;
            const _0x3a2be4 = _0x78c1e[_0xb30e62];
            const _0x5dede8 = _0x78c1e[_0xb30e62 + 1];
            const _0x2da7e7 = _0x78c1e[_0xb30e62 + 2];
            if (_0x3a2be4 > 5 || _0x5dede8 > 5 || _0x2da7e7 > 5) {
              _0x310d61 = true;
              break;
            }
          }
        }
        if (!_0x310d61) {
          const _0xd3cfff = a1006_0x2a169.getState().nodes?.[_0x19828a];
          if (!_0xd3cfff || _0xd3cfff.maskSaveToken !== _0x38eecf) {
            URL.revokeObjectURL(_0x1b2b64);
            return;
          }
          a1006_0x2a169.updateNodeData(_0x19828a, {
            mask: "",
            maskPreview: "",
            maskPolarity: "",
            maskPreviewUrl: null,
            maskSaveToken: null
          });
          a1006_0x2a169.setSelectedNodes([_0x19828a]);
          commit();
          URL.revokeObjectURL(_0x1b2b64);
          window._triggerLocalCacheSave?.();
          return;
        }
        const _0x3803df = await new Promise(_0x54bd2b => _0x2ff288.toBlob(_0x54bd2b, "image/png"));
        if (!_0x3803df) {
          throw new Error(imageMattingText("errors.canvasExportFailed"));
        }
        const _0x3604cc = await saveOutputBlob(_0x3803df, {
          ext: "png",
          subDir: "mask",
          kind: "mask"
        });
        const _0xc97c9b = pickResultLocalPath(_0x3604cc);
        const _0x2e8aa9 = await saveOutputBlob(_0x57c600, {
          ext: "png",
          subDir: "mask_preview"
        });
        const _0x367609 = pickResultLocalPath(_0x2e8aa9);
        const _0x1946d0 = a1006_0x2a169.getState().nodes?.[_0x19828a];
        if (!_0x1946d0 || _0x1946d0.maskSaveToken !== _0x38eecf) {
          URL.revokeObjectURL(_0x1b2b64);
          return;
        }
        a1006_0x2a169.updateNodeData(_0x19828a, {
          mask: _0xc97c9b,
          maskPreview: _0x367609,
          maskPolarity: "paint-white",
          maskPreviewUrl: null,
          maskSaveToken: null
        });
        a1006_0x2a169.setSelectedNodes([_0x19828a]);
        commit();
        URL.revokeObjectURL(_0x1b2b64);
        window._triggerLocalCacheSave?.();
      })().catch(() => {
        const _0x4fb640 = a1006_0x2a169.getState().nodes?.[_0x19828a];
        if (!_0x4fb640 || _0x4fb640.maskSaveToken !== _0x38eecf) {
          try {
            URL.revokeObjectURL(_0x1b2b64);
          } catch (_0x539d37) {}
          return;
        }
        a1006_0x2a169.updateNodeData(_0x19828a, {
          maskSaveToken: null
        });
        window.showToast?.(imageMattingText("toasts.saveFailed"), "error");
      });
    } catch (_0x5bd88a) {
      console.error("[Matting] 保存失败:", _0x5bd88a);
      window.showToast?.(imageMattingText("toasts.saveFailed"), "error");
    } finally {
      if (_0x169d7d) {
        _0x169d7d.textContent = _0x543d8b;
      }
      _0x22321d.style.pointerEvents = "auto";
      this._isSaving = false;
      this._syncLocaleTexts();
    }
  },
  _resolveNodeImageUrl(_0x3f56c3) {
    const _0x113c36 = _0x3f56c3.mainImageIndex || 0;
    const _0x6565fa = _0x3f56c3.images && _0x3f56c3.images[_0x113c36];
    const _0x324203 = _0x3f56c3.localPath || _0x6565fa?.localPath;
    const _0x5809cc = localPathToUrl(_0x324203);
    if (_0x5809cc) {
      return _0x5809cc;
    }
    return _0x3f56c3.src || _0x3f56c3.sourceUrl || _0x3f56c3.imageUrl || _0x3f56c3.thumbUrl || _0x6565fa?.imageUrl || _0x6565fa?.thumbUrl || "";
  },
  _invertCanvasBinary(_0x11d0f7) {
    const _0x1c45dc = _0x11d0f7?.canvas;
    const _0x431f0e = _0x1c45dc?.width || 0;
    const _0x2c2468 = _0x1c45dc?.height || 0;
    if (!_0x431f0e || !_0x2c2468) {
      return;
    }
    const _0x265354 = _0x11d0f7.getImageData(0, 0, _0x431f0e, _0x2c2468);
    const _0x110551 = _0x265354.data;
    for (let _0x17b59a = 0; _0x17b59a < _0x110551.length; _0x17b59a += 4) {
      _0x110551[_0x17b59a] = 255 - _0x110551[_0x17b59a];
      _0x110551[_0x17b59a + 1] = 255 - _0x110551[_0x17b59a + 1];
      _0x110551[_0x17b59a + 2] = 255 - _0x110551[_0x17b59a + 2];
    }
    _0x11d0f7.putImageData(_0x265354, 0, 0);
  },
  _createMaskBaseCanvas(_0x43565b, _0x4689c9 = "paint-white") {
    const _0x191ce6 = Math.max(1, Number(_0x43565b?.naturalWidth || _0x43565b?.width) || 1);
    const _0x1e5ed6 = Math.max(1, Number(_0x43565b?.naturalHeight || _0x43565b?.height) || 1);
    const _0x25bfde = document.createElement("canvas");
    _0x25bfde.width = _0x191ce6;
    _0x25bfde.height = _0x1e5ed6;
    const _0x584068 = _0x25bfde.getContext("2d", {
      willReadFrequently: true
    });
    if (!_0x584068) {
      return null;
    }
    _0x584068.drawImage(_0x43565b, 0, 0, _0x191ce6, _0x1e5ed6);
    const _0x505847 = _0x584068.getImageData(0, 0, _0x191ce6, _0x1e5ed6);
    const {
      data: _0x3ce80d
    } = _0x505847;
    const _0x5c2f78 = String(_0x4689c9 || "").trim() === "paint-white";
    for (let _0x3c411f = 0; _0x3c411f < _0x3ce80d.length; _0x3c411f += 4) {
      const _0x41ae65 = Math.max(_0x3ce80d[_0x3c411f], _0x3ce80d[_0x3c411f + 1], _0x3ce80d[_0x3c411f + 2]);
      const _0xa55778 = _0x5c2f78 ? _0x41ae65 : 255 - _0x41ae65;
      const _0x3628d9 = _0xa55778 > 5 ? _0xa55778 : 0;
      _0x3ce80d[_0x3c411f] = 255;
      _0x3ce80d[_0x3c411f + 1] = 255;
      _0x3ce80d[_0x3c411f + 2] = 255;
      _0x3ce80d[_0x3c411f + 3] = _0x3628d9;
    }
    _0x584068.putImageData(_0x505847, 0, 0);
    return _0x25bfde;
  },
  _loadExistingMask() {
    if (!this.active) {
      return;
    }
    const _0x1b448b = a1006_0x2a169.getStateRaw();
    const _0x25c11b = _0x1b448b.nodes?.[this.nodeId];
    const _0x2820ff = String(_0x25c11b?.mask || "").trim();
    const _0xb5e419 = String(_0x25c11b?.maskPreviewUrl || _0x25c11b?.maskPreview || "").trim();
    const _0x51e532 = !!_0x2820ff;
    const _0x3a3df8 = _0x51e532 ? _0x2820ff : _0xb5e419;
    if (!_0x3a3df8) {
      return;
    }
    const _0x1fb411 = _0x3a3df8.startsWith("blob:") || _0x3a3df8.startsWith("data:") ? _0x3a3df8 : localPathToUrl(_0x3a3df8);
    if (!_0x1fb411) {
      return;
    }
    (async () => {
      const _0xf09f9a = await this._loadImage(_0x1fb411);
      if (!this.active) {
        return;
      }
      this._commands = this._commands.filter(_0x27bf90 => _0x27bf90?.type !== "mask-preview" && _0x27bf90?.type !== "mask-base");
      if (_0x51e532) {
        const _0x43d714 = this._createMaskBaseCanvas(_0xf09f9a, _0x25c11b?.maskPolarity);
        if (_0x43d714) {
          this._commands.unshift({
            type: "mask-base",
            canvas: _0x43d714
          });
        }
      } else {
        this._commands.unshift({
          type: "mask-preview",
          img: _0xf09f9a
        });
      }
      this._redoStack = [];
      this._render();
    })().catch(() => {});
  },
  _loadImage(_0x3c821c) {
    return new Promise((_0x5e1b6b, _0x2cd034) => {
      const _0x37a7ff = new Image();
      _0x37a7ff.crossOrigin = "anonymous";
      _0x37a7ff.onload = () => _0x5e1b6b(_0x37a7ff);
      _0x37a7ff.onerror = () => _0x2cd034(new Error(imageMattingText("errors.imageLoadFailed")));
      _0x37a7ff.src = _0x3c821c;
    });
  }
};
export default ImageMattingController;