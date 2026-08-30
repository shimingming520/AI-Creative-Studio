import a995_0x1ceb23 from "../core/stores/appStore.js";
import { buildGenerateImageRequest } from "../../api/aiImageApi.js";
import { generateId, screenToWorld, worldToScreen, isPointInRect } from "../core/math.js";
import { setStaticInnerHTML } from "../utils/dom.js";
import { IMAGE_MODELS, getModelProvider } from "../config/modelConfig.js";
import { bindImageFunctionModeMenu, bindImageFunctionModelMenu, closeImageFunctionModelSubmenus, getImageFunctionNanoSelection, getImageFunctionModelDisplayName, getImageFunctionModelTriggerIconHTML, resolveImageFunctionModelByMode, syncImageFunctionModeControl, syncImageFunctionModelMenuActive } from "./imageFunctionModelMenu.js";
import { bindToolbarUpMenus } from "./imageToolbarUpMenu.js";
import { shouldDisableImageSizeControl } from "./imageModelCapabilities.js";
import { ANNOTATE_TOOLBAR_TEMPLATE_ID, createGenerationToolbarMarkup, getAnnotateToolbarToolsForScene } from "./imageAnnotate/annotateToolbarMarkup.js";
import { resolveImageNodeUrl } from "./imageNodeImageUrl.js";
import { waitForImageElementReady } from "./imageOverlayReadiness.js";
import { buildCopiedTextCommand, clampTextScale, createTextTransformState, findTextHit, getTextGeometry, getTextLayout, getTextScalePair, resolveAxisTextScale, rotateTextLocalPoint, TEXT_CONTROL_HIT_RADIUS, TEXT_CONTROL_MAX_SCALE, TEXT_CONTROL_MIN_SCALE, toTextLocalTransformSpace } from "./imageAnnotate/textControls.js";
import { getNextNumberLabelValue } from "./imageAnnotate/numberLabels.js";
import { renderCommands, renderEraseSceneCommands } from "./imageAnnotate/rendering.js";
import { createEraseCheckerboardPattern } from "./eraseBrushRenderer.js";
import { buildGenerationPayload } from "./imageAnnotate/generationPayload.js";
import { exportAnnotateCanvasBlob } from "./imageAnnotate/exportCanvas.js";
import { runGenerationResultFlow } from "./imageAnnotate/generationResultFlow.js";
import { createPendingAnnotateExportNode, markAnnotateExportNodeFailed, saveAnnotateExportResult } from "./imageAnnotate/saveResultNode.js";
import { buildGenerationModelCatalog, buildPersistedEraseSelectionState, buildSeedreamMigrationPatch, ERASE_SELECTION_STATE_KEY, findProviderKeyByModel, getDefaultGenerationModelState, readPersistedEraseSelectionState } from "./imageAnnotate/stateAdapters.js";
import { buildSelectionMaskCanvas } from "./imageAnnotate/selectionMask.js";
import { IMAGE_BRUSH_DEFAULT_SIZE_PX, clampImageBrushSize, syncCircularBrushCursor } from "./imageEditorBrushStyle.js";
import { formatFinalApiDebugRequest } from "../utils/debugRequestPreview.js";
import { getNodeDefaultSize } from "../services/fileService.js";
import { applyI18n, t } from "../i18n/index.js";
function imageAnnotateText(_0x3154df, _0x7de69a = {}) {
  return t("imageAnnotate." + _0x3154df, _0x7de69a);
}
const COLOR_VAR_MAP = {
  black: "--black",
  red: "--annotate-red",
  orange: "--annotate-orange",
  yellow: "--annotate-yellow",
  green: "--annotate-green",
  blue: "--annotate-blue",
  purple: "--annotate-purple",
  white: "--canvas-white"
};
const getCssVar = _0x3a77fc => getComputedStyle(document.documentElement).getPropertyValue(_0x3a77fc).trim();
const COLOR_NAME_BY_VAR = Object.fromEntries(Object.entries(COLOR_VAR_MAP).map(([_0xba9244, _0x2c1ac8]) => [_0x2c1ac8, _0xba9244]));
const normalizeColorName = _0x191783 => {
  const _0x1e6a77 = String(_0x191783 || "").trim();
  if (!_0x1e6a77) {
    return "red";
  }
  if (COLOR_VAR_MAP[_0x1e6a77]) {
    return _0x1e6a77;
  }
  const _0x4d08ea = _0x1e6a77.match(/^var\(\s*(--[^)]+)\s*\)$/);
  if (_0x4d08ea && COLOR_NAME_BY_VAR[_0x4d08ea[1]]) {
    return COLOR_NAME_BY_VAR[_0x4d08ea[1]];
  }
  return "red";
};
const getColorCss = _0x2100f8 => {
  const _0x1ca830 = COLOR_VAR_MAP[_0x2100f8];
  if (_0x1ca830) {
    return "var(" + _0x1ca830 + ")";
  } else {
    return _0x2100f8;
  }
};
const getColorCanvas = _0x559a9e => {
  const _0x1c51b4 = COLOR_VAR_MAP[_0x559a9e];
  if (!_0x1c51b4) {
    return _0x559a9e;
  }
  return getCssVar(_0x1c51b4) || _0x559a9e;
};
const isFiniteCommandPoint = _0xb1e8f1 => Number.isFinite(Number(_0xb1e8f1?.x)) && Number.isFinite(Number(_0xb1e8f1?.y));
const hasDrawableStrokePoints = _0x952792 => Array.isArray(_0x952792?.points) && _0x952792.points.some(isFiniteCommandPoint);
const shouldDiscardStrokeCommand = _0x1a0b12 => (_0x1a0b12?.type === "brush" || _0x1a0b12?.type === "eraser") && !hasDrawableStrokePoints(_0x1a0b12);
const toImageLocalRenderViewport = _0x56128d => ({
  x: 0,
  y: 0,
  zoom: _0x56128d?.zoom
});
export const __textControlTestUtils = {
  clampTextScale: clampTextScale,
  getTextScalePair: getTextScalePair
};
export const __strokeCommandTestUtils = {
  hasDrawableStrokePoints: hasDrawableStrokePoints,
  shouldDiscardStrokeCommand: shouldDiscardStrokeCommand
};
const ERASE_GENERATE_PROMPT = "擦除绿色的区域 并且填充背景";
const ROTATE_CURSOR_CSS = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg transform='rotate(35 14 14)'%3E%3Cpath d='M10.2 22.7a8.6 8.6 0 1 0 0-17.4 6.8 6.8 0 1 1 0 17.4Z' fill='%23ffffff' stroke='%23ffffff' stroke-width='1.6' stroke-linejoin='round'/%3E%3Cpath d='M5.3 22.1h4.8v-4.8' fill='none' stroke='%23ffffff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M5.3 22.1l3.9-3.9' fill='none' stroke='%23ffffff' stroke-width='1.7' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E\") 14 14";
const ImageAnnotateController = {
  active: false,
  nodeId: null,
  nodeData: null,
  overlayEl: null,
  containerEl: null,
  stageEl: null,
  imgEl: null,
  canvasEl: null,
  toolbarEl: null,
  generationToolbarEl: null,
  sizeValueEl: null,
  sizeRangeEl: null,
  colorWrapEl: null,
  colorDotEl: null,
  colorMenuEl: null,
  colorButtons: null,
  toolButtons: null,
  cursorEl: null,
  _cursorHover: false,
  _cursorLast: {
    x: 0,
    y: 0
  },
  _cursorRaf: 0,
  _temporaryTool: null,
  _textInputEl: null,
  _selectedTextCommandIndex: null,
  _unsubscribe: null,
  _commands: [],
  _redoStack: [],
  _draft: null,
  _dirty: false,
  _view: null,
  _mode: null,
  imageSize: "1K",
  model: null,
  provider: null,
  promptText: "",
  _checkerPattern: null,
  _eraseMaskCanvasEl: null,
  _useWhiteboardBase: false,
  _generationModelCatalog: null,
  _fillRegionCache: null,
  _unbindGenerationToolbarUpMenus: null,
  _unbindGenerationFunctionMenus: null,
  init(_0x343664, _0x592b55 = {}) {
    if (this.active) {
      return;
    }
    const _0x5d6edb = a995_0x1ceb23.getStateRaw();
    const _0x1765a0 = _0x5d6edb.nodes?.[_0x343664];
    if (!_0x1765a0) {
      return;
    }
    const _0x5bbcbb = this._resolveNodeImageUrl(_0x1765a0, {
      preferPreview: true
    });
    if (!_0x5bbcbb) {
      window.showToast?.(imageAnnotateText("toasts.noImage"), "warn");
      return;
    }
    const _0x42ae72 = String(_0x592b55.scene || "annotate");
    const _0x50decb = _0x42ae72 === "erase" ? readPersistedEraseSelectionState(_0x1765a0) : null;
    const _0x591004 = _0x42ae72 === "erase" ? _0x50decb?.tool || "brush" : _0x42ae72 === "repaint" ? "brush" : _0x5d6edb.annotate?.tool === "bucket" ? "brush" : _0x5d6edb.annotate?.tool || "brush";
    const _0x4741a7 = normalizeColorName(_0x5d6edb.annotate?.color);
    const _0x2a38de = _0x42ae72 === "erase" ? clampImageBrushSize(_0x50decb?.brushSizePx, 40) : clampImageBrushSize(_0x5d6edb.annotate?.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX);
    this.active = true;
    this.nodeId = _0x343664;
    this._generationModelCatalog = buildGenerationModelCatalog();
    const _0x220202 = this._normalizeLegacySeedreamNode(_0x1765a0);
    this.nodeData = _0x220202;
    this._commands = _0x50decb?.commands || [];
    this._redoStack = [];
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._dirty = false;
    this._useWhiteboardBase = false;
    this._fillRegionCache = new Map();
    const _0x25d156 = imageAnnotateText("actions.save");
    const _0x3a571b = imageAnnotateText("actions.generate");
    const _0x120ced = t("imageAnnotate.actions.generate", {}, {
      locale: "zh-CN"
    });
    const _0x9b253 = String(_0x592b55.submitLabel || _0x25d156).trim();
    const _0x39b71c = _0x9b253 || _0x25d156;
    const _0x31ecbd = _0x39b71c === _0x3a571b || _0x39b71c === _0x120ced;
    this._mode = {
      scene: _0x42ae72,
      submitLabel: _0x39b71c,
      submitBusyLabel: String(_0x592b55.submitBusyLabel || "").trim() || (_0x31ecbd ? imageAnnotateText("actions.generating") : imageAnnotateText("actions.saving")),
      submitNoop: Boolean(_0x592b55.submitNoop)
    };
    const _0x2b3255 = this._getGenerationModelCatalog();
    const _0x35b8f8 = getDefaultGenerationModelState(_0x2b3255);
    this.imageSize = "1K";
    const _0x3bd8d0 = String(_0x220202?.model || "").trim();
    const _0x126714 = String(_0x220202?.provider || "").trim();
    const _0x405cdb = findProviderKeyByModel(_0x2b3255, _0x3bd8d0);
    if (_0x405cdb) {
      this.model = _0x3bd8d0;
      this.provider = _0x405cdb;
    } else {
      this.model = _0x35b8f8.model || _0x3bd8d0 || null;
      this.provider = _0x35b8f8.provider || _0x126714 || getModelProvider(this.model) || null;
    }
    this.promptText = _0x42ae72 === "repaint" ? String(_0x592b55.promptText || "").trim() : "";
    this._view = {
      tool: _0x591004,
      color: _0x4741a7,
      brushSizePx: _0x2a38de,
      viewport: _0x5d6edb.viewport,
      node: _0x220202
    };
    a995_0x1ceb23.setAnnotateState({
      active: true,
      nodeId: _0x343664,
      tool: _0x591004,
      color: _0x4741a7,
      brushSizePx: _0x2a38de
    });
    this._createUI(_0x5bbcbb, {
      tool: _0x591004,
      color: _0x4741a7,
      brushSizePx: _0x2a38de
    });
    this._bindEvents();
    this._unsubscribe = a995_0x1ceb23.subscribeSelector(_0x34993a => {
      const _0x382ed1 = _0x34993a.nodes?.[_0x343664];
      const _0x497fd5 = _0x34993a.viewport || {
        x: 0,
        y: 0,
        zoom: 1
      };
      const _0x8e022f = _0x34993a.annotate || {};
      return {
        hasNode: !!_0x382ed1,
        nx: _0x382ed1 ? _0x382ed1.x : 0,
        ny: _0x382ed1 ? _0x382ed1.y : 0,
        nw: _0x382ed1 ? _0x382ed1.width : 0,
        nh: _0x382ed1 ? _0x382ed1.height : 0,
        vx: _0x497fd5.x,
        vy: _0x497fd5.y,
        vz: _0x497fd5.zoom || 1,
        vox: _0x497fd5._screenOriginX || 0,
        voy: _0x497fd5._screenOriginY || 0,
        tool: _0x8e022f.tool || "brush",
        color: normalizeColorName(_0x8e022f.color),
        brushSizePx: clampImageBrushSize(_0x8e022f.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX)
      };
    }, _0x5ea451 => {
      if (!_0x5ea451?.hasNode) {
        return;
      }
      const _0x4c056f = a995_0x1ceb23.getStateRaw().nodes?.[_0x343664];
      const _0x5c131a = this._normalizeLegacySeedreamNode(_0x4c056f);
      this.nodeData = _0x5c131a || null;
      this._view = {
        tool: _0x5ea451.tool,
        color: _0x5ea451.color,
        brushSizePx: _0x5ea451.brushSizePx,
        viewport: {
          x: _0x5ea451.vx,
          y: _0x5ea451.vy,
          zoom: _0x5ea451.vz,
          _screenOriginX: _0x5ea451.vox,
          _screenOriginY: _0x5ea451.voy
        },
        node: {
          x: Number(_0x5c131a?.x ?? _0x5ea451.nx),
          y: Number(_0x5c131a?.y ?? _0x5ea451.ny),
          width: Number(_0x5c131a?.width ?? _0x5ea451.nw),
          height: Number(_0x5c131a?.height ?? _0x5ea451.nh)
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
        window.showToast?.(imageAnnotateText("errors.imageLoadFailed"), "error");
        this.exit({
          silent: true
        });
      }
    });
  },
  _getGenerationModelCatalog() {
    if (!this._generationModelCatalog) {
      this._generationModelCatalog = buildGenerationModelCatalog();
    }
    return this._generationModelCatalog;
  },
  _normalizeLegacySeedreamNode(_0x28ef35) {
    const _0x3a3e1a = buildSeedreamMigrationPatch(_0x28ef35);
    if (!_0x3a3e1a) {
      return _0x28ef35;
    }
    const _0x4017e4 = {
      ...(_0x28ef35 || {}),
      ..._0x3a3e1a
    };
    const _0x2b6034 = a995_0x1ceb23.getStateRaw().nodes?.[this.nodeId];
    if (_0x2b6034) {
      a995_0x1ceb23.updateNodeData(this.nodeId, _0x3a3e1a);
    }
    return _0x4017e4;
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
      window.showToast?.(imageAnnotateText("toasts.cancelled"), "ok");
    }
    this.active = false;
    this.nodeId = null;
    this.nodeData = null;
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._removeTextInput(false);
    this._dirty = false;
    a995_0x1ceb23.setAnnotateState({
      active: false,
      nodeId: null
    });
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._unbindGenerationToolbarUpMenus?.();
    this._unbindGenerationToolbarUpMenus = null;
    this._unbindGenerationFunctionMenus?.();
    this._unbindGenerationFunctionMenus = null;
    if (this.overlayEl) {
      this.overlayEl.remove();
    }
    if (this.toolbarEl) {
      this.toolbarEl.remove();
    }
    if (this.generationToolbarEl) {
      this.generationToolbarEl.remove();
    }
    this.overlayEl = null;
    this.containerEl = null;
    this.stageEl = null;
    this.imgEl = null;
    this.canvasEl = null;
    this.toolbarEl = null;
    this.generationToolbarEl = null;
    this.sizeValueEl = null;
    this.sizeRangeEl = null;
    this.colorWrapEl = null;
    this.colorDotEl = null;
    this.colorMenuEl = null;
    this.colorButtons = null;
    this.toolButtons = null;
    this.cursorEl = null;
    this._cursorHover = false;
    this._cursorLast = {
      x: 0,
      y: 0
    };
    this._cursorRaf = 0;
    this._temporaryTool = null;
    this._textInputEl = null;
    this._selectedTextCommandIndex = null;
    this._view = null;
    this._mode = null;
    this.imageSize = "1K";
    this.model = null;
    this.provider = null;
    this.promptText = "";
    this._checkerPattern = null;
    this._eraseMaskCanvasEl = null;
    this._useWhiteboardBase = false;
    this._generationModelCatalog = null;
    this._fillRegionCache = null;
    this._unbindGenerationToolbarUpMenus = null;
    this._unbindGenerationFunctionMenus = null;
  },
  _isGenerationScene() {
    return this._mode?.scene === "repaint" || this._mode?.scene === "erase";
  },
  _isEraseScene() {
    return this._mode?.scene === "erase";
  },
  _isRepaintScene() {
    return this._mode?.scene === "repaint";
  },
  _isAnnotateScene() {
    return this._mode?.scene === "annotate";
  },
  _getFlipState(_0x3e84fe = this._commands) {
    const _0x49160b = {
      horizontal: false,
      vertical: false
    };
    (Array.isArray(_0x3e84fe) ? _0x3e84fe : []).forEach(_0x2de82e => {
      if (_0x2de82e?.type === "flip-horizontal") {
        _0x49160b.horizontal = !_0x49160b.horizontal;
      } else if (_0x2de82e?.type === "flip-vertical") {
        _0x49160b.vertical = !_0x49160b.vertical;
      }
    });
    return _0x49160b;
  },
  _getCurrentFlipState() {
    if (!this._isAnnotateScene()) {
      return {
        horizontal: false,
        vertical: false
      };
    }
    return this._getFlipState(this._commands);
  },
  _applyFlipToLocalPoint(_0xcc9621, _0x2cdce3, _0x572a26 = this._getCurrentFlipState()) {
    const _0xec24de = {
      x: Number(_0xcc9621?.x) || 0,
      y: Number(_0xcc9621?.y) || 0
    };
    const _0x2e6267 = Math.max(1, Number(_0x2cdce3?.width) || 1);
    const _0x16e243 = Math.max(1, Number(_0x2cdce3?.height) || 1);
    if (_0x572a26?.horizontal) {
      _0xec24de.x = _0x2e6267 - _0xec24de.x;
    }
    if (_0x572a26?.vertical) {
      _0xec24de.y = _0x16e243 - _0xec24de.y;
    }
    return _0xec24de;
  },
  _getLocalFromClient(_0x44eece, _0x2eddb1, _0x33bfaa, _0x3ddeb0) {
    const _0x169834 = screenToWorld(_0x44eece, _0x2eddb1, _0x33bfaa.viewport);
    const _0x5cd3a8 = {
      x: _0x169834.x - _0x3ddeb0.x,
      y: _0x169834.y - _0x3ddeb0.y
    };
    if (!this._isAnnotateScene()) {
      return _0x5cd3a8;
    }
    return this._applyFlipToLocalPoint(_0x5cd3a8, _0x3ddeb0, this._getCurrentFlipState());
  },
  _applyStageFlip(_0x16873d = this._getCurrentFlipState()) {
    if (!this.stageEl) {
      return;
    }
    if (!this._isAnnotateScene()) {
      this.stageEl.style.transform = "none";
      return;
    }
    const _0x2c5e10 = _0x16873d?.horizontal ? -1 : 1;
    const _0x4f8992 = _0x16873d?.vertical ? -1 : 1;
    this.stageEl.style.transformOrigin = "50% 50%";
    this.stageEl.style.transform = "scale(" + _0x2c5e10 + ", " + _0x4f8992 + ")";
  },
  _applyFlipTransformToContext(_0x9d8daa, _0x309bd7, _0x2a1666, _0x22c3f4 = this._getCurrentFlipState()) {
    if (!_0x9d8daa) {
      return;
    }
    if (_0x22c3f4?.horizontal) {
      _0x9d8daa.translate(_0x309bd7, 0);
      _0x9d8daa.scale(-1, 1);
    }
    if (_0x22c3f4?.vertical) {
      _0x9d8daa.translate(0, _0x2a1666);
      _0x9d8daa.scale(1, -1);
    }
  },
  _closeGenerationMenus() {
    if (!this.generationToolbarEl) {
      return;
    }
    this.generationToolbarEl.querySelectorAll("[data-toolbar-up-menu-menu]").forEach(_0x4f3e1 => {
      const _0x3182c6 = String(_0x4f3e1?.dataset?.toolbarUpMenuOpenClass || "open").trim() || "open";
      _0x4f3e1.classList.remove(_0x3182c6);
      _0x4f3e1.classList.remove("open");
      _0x4f3e1.classList.remove("show");
    });
    this.generationToolbarEl.querySelector(".model-menu")?.classList.remove("show");
    this.generationToolbarEl.querySelector(".image-function-mode-menu")?.classList.remove("show");
    closeImageFunctionModelSubmenus(this.generationToolbarEl.querySelector(".model-menu"));
  },
  _createUI(_0x1f5d80, _0x5ab488 = {}) {
    const _0x318f44 = document.createElement("div");
    _0x318f44.className = "v2-annotate-overlay";
    const _0x5a119e = document.createElement("div");
    _0x5a119e.className = "v2-annotate-container";
    const _0x5cd92f = document.createElement("div");
    _0x5cd92f.className = "v2-annotate-stage";
    const _0x1a976a = document.createElement("img");
    _0x1a976a.className = "v2-annotate-img";
    _0x1a976a.src = _0x1f5d80;
    _0x1a976a.draggable = false;
    const _0x130e64 = document.createElement("canvas");
    _0x130e64.className = "v2-annotate-canvas";
    _0x5cd92f.appendChild(_0x1a976a);
    _0x5cd92f.appendChild(_0x130e64);
    _0x5a119e.appendChild(_0x5cd92f);
    const _0x9a83bf = document.createElement("div");
    _0x9a83bf.className = "v2-annotate-cursor";
    _0x9a83bf.style.display = "none";
    _0x318f44.appendChild(_0x9a83bf);
    _0x318f44.appendChild(_0x5a119e);
    document.body.appendChild(_0x318f44);
    this.overlayEl = _0x318f44;
    this.containerEl = _0x5a119e;
    this.stageEl = _0x5cd92f;
    this.imgEl = _0x1a976a;
    this.canvasEl = _0x130e64;
    this.cursorEl = _0x9a83bf;
    this._applyBaseSurface();
    const _0x29ac5e = document.createElement("div");
    _0x29ac5e.className = "v2-annotate-toolbar";
    setStaticInnerHTML(_0x29ac5e, ANNOTATE_TOOLBAR_TEMPLATE_ID);
    applyI18n(_0x29ac5e);
    document.body.appendChild(_0x29ac5e);
    this.toolbarEl = _0x29ac5e;
    if (this._isGenerationScene()) {
      const _0x56b012 = document.createElement("div");
      _0x56b012.className = "v2-annotate-toolbar v2-annotate-generation-toolbar";
      _0x56b012.innerHTML = createGenerationToolbarMarkup({
        scene: this._mode?.scene || "annotate",
        promptText: this.promptText,
        imageSize: this.imageSize,
        model: this.model,
        provider: this.provider,
        modelCatalog: this._getGenerationModelCatalog(),
        submitTooltip: this._mode?.submitLabel || imageAnnotateText("actions.generate")
      });
      applyI18n(_0x56b012);
      document.body.appendChild(_0x56b012);
      this.generationToolbarEl = _0x56b012;
    }
    this.sizeValueEl = _0x29ac5e.querySelector(".v2-annotate-size-value");
    this.sizeRangeEl = _0x29ac5e.querySelector(".v2-annotate-size-range");
    this.colorWrapEl = _0x29ac5e.querySelector(".v2-annotate-colorwrap");
    this.colorDotEl = _0x29ac5e.querySelector(".v2-annotate-color-dot");
    this.colorMenuEl = _0x29ac5e.querySelector(".v2-annotate-color-menu");
    this.colorButtons = Array.from(_0x29ac5e.querySelectorAll(".v2-annotate-swatch"));
    const _0x11de3d = getAnnotateToolbarToolsForScene(this._mode?.scene || "annotate");
    _0x29ac5e.querySelectorAll(".tool-btn").forEach(_0x29b426 => {
      if (!_0x11de3d.includes(_0x29b426.dataset.tool)) {
        _0x29b426.remove();
      }
    });
    this.toolButtons = Array.from(_0x29ac5e.querySelectorAll(".tool-btn"));
    if (this._isGenerationScene()) {
      this.colorWrapEl?.remove();
      this.colorWrapEl = null;
      this.colorDotEl = null;
      this.colorMenuEl = null;
      this.colorButtons = [];
    }
    if (!this._isAnnotateScene()) {
      _0x29ac5e.querySelector(".act-flip-horizontal")?.remove();
      _0x29ac5e.querySelector(".act-flip-vertical")?.remove();
    }
    const _0x189f34 = _0x29ac5e.querySelector(".act-save");
    const _0x6bb440 = _0x29ac5e.querySelector(".act-new-board");
    const _0x13d027 = _0x189f34?.querySelector("span");
    const _0x1f5b6c = this._mode?.submitLabel || "保存";
    if (_0x13d027) {
      _0x13d027.textContent = _0x1f5b6c;
    }
    if (_0x189f34) {
      _0x189f34.setAttribute("data-tooltip", _0x1f5b6c);
    }
    if (_0x189f34 && this._isGenerationScene()) {
      _0x189f34.style.display = "none";
    }
    if (_0x6bb440 && this._isGenerationScene()) {
      _0x6bb440.style.display = "none";
    }
    const _0xe6528a = clampImageBrushSize(_0x5ab488.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX);
    const _0x1d5c36 = _0x5ab488.tool || "brush";
    const _0x5b4987 = _0x11de3d.includes(_0x1d5c36) ? _0x1d5c36 : "brush";
    const _0x46b3ae = normalizeColorName(_0x5ab488.color);
    this.sizeRangeEl.value = String(_0xe6528a);
    this.sizeValueEl.textContent = String(_0xe6528a);
    this._updateToolActive(_0x5b4987, _0xe6528a);
    this._syncPaletteActive(_0x46b3ae);
    if (this._view) {
      this._updateView(this._view);
    }
  },
  _bindEvents() {
    const _0x218d05 = _0x3601ce => {
      const _0x200a40 = this.canvasEl && (_0x3601ce.target === this.canvasEl || this.canvasEl.contains(_0x3601ce.target));
      if (_0x200a40) {
        this._onCanvasWheel(_0x3601ce);
        return;
      }
      _0x3601ce.preventDefault();
      _0x3601ce.stopPropagation();
    };
    this.overlayEl.addEventListener("wheel", _0x218d05, {
      passive: false
    });
    const _0x3fad14 = () => {
      if (this._view) {
        this._updateView(this._view);
      }
    };
    window.addEventListener("resize", _0x3fad14);
    const _0x36b955 = _0x2cbb9a => {
      if (!this.active) {
        return;
      }
      const _0x1239fc = _0x2cbb9a.target;
      const _0x5868da = _0x1239fc?.tagName?.toLowerCase?.() || "";
      const _0x5a2b43 = _0x5868da === "input" || _0x5868da === "textarea" || _0x1239fc?.isContentEditable === true;
      if (_0x5a2b43) {
        return;
      }
      if (_0x2cbb9a.altKey || _0x2cbb9a.ctrlKey || _0x2cbb9a.metaKey) {
        return;
      }
      const _0x5170b9 = String(_0x2cbb9a.key || "").toLowerCase();
      if (_0x5170b9 === "t" && !this._isGenerationScene()) {
        _0x2cbb9a.preventDefault();
        this._setTool("text");
      }
    };
    window.addEventListener("keydown", _0x36b955);
    const _0x3f0b9e = () => {
      window.removeEventListener("resize", _0x3fad14);
      window.removeEventListener("keydown", _0x36b955);
      this.overlayEl?.removeEventListener("wheel", _0x218d05);
      document.removeEventListener("pointerdown", _0x33953c, true);
    };
    const _0x3cf262 = this.exit.bind(this);
    this.exit = (_0x510339 = {}) => {
      _0x3f0b9e();
      _0x3cf262(_0x510339);
    };
    this.toolbarEl.addEventListener("pointerdown", _0xa3dc40 => _0xa3dc40.stopPropagation());
    this.toolbarEl.querySelector(".act-cancel").addEventListener("click", _0x289ebe => {
      _0x289ebe.stopPropagation();
      this.exit();
    });
    this.toolButtons.forEach(_0x4de2ce => {
      _0x4de2ce.addEventListener("click", _0x2c9847 => {
        _0x2c9847.stopPropagation();
        const _0x2cd87a = _0x4de2ce.dataset.tool;
        this._setTool(_0x2cd87a);
      });
    });
    const _0x327477 = () => {
      if (!this.colorWrapEl) {
        return;
      }
      this.colorWrapEl.classList.remove("open");
    };
    const _0x33953c = _0x54243c => {
      if (this.colorWrapEl && this.colorWrapEl.classList.contains("open") && !this.colorWrapEl.contains(_0x54243c.target)) {
        _0x327477();
      }
      if (this.generationToolbarEl && !this.generationToolbarEl.contains(_0x54243c.target)) {
        this._closeGenerationMenus();
      }
    };
    document.addEventListener("pointerdown", _0x33953c, true);
    this.colorWrapEl?.addEventListener("pointerdown", _0x8ce09f => _0x8ce09f.stopPropagation());
    this.colorWrapEl?.querySelector(".v2-annotate-color-toggle")?.addEventListener("click", _0x230843 => {
      _0x230843.stopPropagation();
      if (!this.colorWrapEl) {
        return;
      }
      this.colorWrapEl.classList.toggle("open");
    });
    this.colorButtons.forEach(_0x18d68c => {
      _0x18d68c.addEventListener("click", _0x2eecd9 => {
        _0x2eecd9.stopPropagation();
        const _0x259165 = _0x18d68c.dataset.color;
        a995_0x1ceb23.setAnnotateState({
          color: _0x259165
        });
        _0x327477();
      });
    });
    this.sizeRangeEl.addEventListener("input", _0x1e9e0c => {
      const _0x8cdf21 = clampImageBrushSize(_0x1e9e0c.target.value, 1);
      a995_0x1ceb23.setAnnotateState({
        brushSizePx: _0x8cdf21
      });
      this.sizeValueEl.textContent = String(_0x8cdf21);
      this._syncCursor();
      this._persistEraseSelectionState();
    });
    this.toolbarEl.querySelector(".act-undo").addEventListener("click", _0x1e3082 => {
      _0x1e3082.stopPropagation();
      this._undo();
    });
    this.toolbarEl.querySelector(".act-flip-horizontal")?.addEventListener("click", _0x13a38a => {
      _0x13a38a.stopPropagation();
      this._flipHorizontal();
    });
    this.toolbarEl.querySelector(".act-flip-vertical")?.addEventListener("click", _0x322bc2 => {
      _0x322bc2.stopPropagation();
      this._flipVertical();
    });
    this.toolbarEl.querySelector(".act-redo").addEventListener("click", _0x22017d => {
      _0x22017d.stopPropagation();
      this._redo();
    });
    this.toolbarEl.querySelector(".act-clear").addEventListener("click", _0x4e6cdf => {
      _0x4e6cdf.stopPropagation();
      this._clear();
    });
    this.toolbarEl.querySelector(".act-new-board")?.addEventListener("click", _0x172c1b => {
      _0x172c1b.stopPropagation();
      this._createNewWhiteboard();
    });
    this.toolbarEl.querySelector(".act-save").addEventListener("click", async _0x267704 => {
      _0x267704.stopPropagation();
      if (this._mode?.submitNoop) {
        return;
      }
      await this._save();
    });
    if (this.generationToolbarEl) {
      this.generationToolbarEl.addEventListener("pointerdown", _0x3708af => _0x3708af.stopPropagation());
      const _0x23d59e = this.generationToolbarEl.querySelector(".v2-annotate-gen-prompt-input");
      const _0x3e999a = this.generationToolbarEl.querySelector(".size-menu");
      const _0x3ec3ce = this.generationToolbarEl.querySelector(".model-menu");
      const _0x2cb1ad = this.generationToolbarEl.querySelector(".model-text");
      const _0x37075c = this.generationToolbarEl.querySelector(".image-function-model-trigger-icon-slot");
      const _0x3ce7fe = this.generationToolbarEl.querySelector(".size-toggle");
      const _0x3ce6cf = this.generationToolbarEl.querySelector(".image-function-mode-toggle");
      const _0x3138ca = this.generationToolbarEl.querySelector(".image-function-mode-menu");
      const _0x1e2925 = () => {
        const _0x58a033 = shouldDisableImageSizeControl(this.model, this.provider);
        if (_0x3ce7fe) {
          _0x3ce7fe.disabled = _0x58a033;
          _0x3ce7fe.classList.toggle("is-disabled", _0x58a033);
          _0x3ce7fe.setAttribute("aria-disabled", _0x58a033 ? "true" : "false");
        }
        _0x3e999a?.querySelectorAll("[data-toolbar-up-menu-field=\"size\"]").forEach(_0xd3dc78 => {
          _0xd3dc78.classList.toggle("disabled", _0x58a033);
          _0xd3dc78.dataset.disabled = _0x58a033 ? "true" : "false";
        });
        if (_0x58a033) {
          _0x3e999a?.classList.remove("open");
        }
      };
      const _0x451322 = () => syncImageFunctionModeControl({
        root: this.generationToolbarEl,
        model: this.model,
        provider: this.provider,
        imageSize: this.imageSize
      });
      const _0x50a3ee = (_0xce51a6, _0x3641eb, {
        syncStore = true
      } = {}) => {
        const _0x390923 = String(_0xce51a6 || "").trim();
        const _0x388af0 = String(_0x3641eb || getModelProvider(_0x390923) || "").trim();
        if (!_0x390923 || !_0x388af0) {
          return;
        }
        const _0x8a91c7 = this.model !== _0x390923 || this.provider !== _0x388af0;
        this.model = _0x390923;
        this.provider = _0x388af0;
        if (_0x2cb1ad) {
          _0x2cb1ad.textContent = getImageFunctionModelDisplayName(_0x390923, this._getGenerationModelCatalog());
        }
        if (_0x37075c) {
          _0x37075c.innerHTML = getImageFunctionModelTriggerIconHTML(_0x390923, _0x388af0);
        }
        syncImageFunctionModelMenuActive({
          modelMenu: _0x3ec3ce,
          model: _0x390923,
          provider: _0x388af0
        });
        _0x451322();
        _0x1e2925();
        if (syncStore && _0x8a91c7 && this.nodeId) {
          a995_0x1ceb23.updateNodeData(this.nodeId, {
            model: _0x390923,
            provider: _0x388af0
          });
        }
      };
      const _0xb175a7 = (_0x5b067e = null) => {
        this.generationToolbarEl?.querySelectorAll("[data-toolbar-up-menu-menu]").forEach(_0x179210 => {
          if (_0x179210 === _0x5b067e) {
            return;
          }
          const _0x246860 = String(_0x179210?.dataset?.toolbarUpMenuOpenClass || "open").trim() || "open";
          _0x179210.classList.remove(_0x246860);
          _0x179210.classList.remove("open");
          _0x179210.classList.remove("show");
        });
      };
      const _0x4f3096 = () => {
        _0xb175a7();
        _0x3ec3ce?.classList.remove("show");
        _0x3138ca?.classList.remove("show");
        closeImageFunctionModelSubmenus(_0x3ec3ce);
      };
      _0x23d59e?.addEventListener("input", _0x15d6e2 => {
        this.promptText = String(_0x15d6e2.target.value || "");
      });
      this._unbindGenerationToolbarUpMenus = bindToolbarUpMenus(this.generationToolbarEl, {
        onBeforeOpen: () => {
          _0x3ec3ce?.classList.remove("show");
          _0x3138ca?.classList.remove("show");
          closeImageFunctionModelSubmenus(_0x3ec3ce);
        },
        onSelect: ({
          fieldId: _0x3212d6,
          value: _0x525006
        }) => {
          if (_0x3212d6 !== "size") {
            return;
          }
          if (shouldDisableImageSizeControl(this.model, this.provider)) {
            return;
          }
          this.imageSize = String(_0x525006 || "1K").trim() || "1K";
          const _0x577873 = getImageFunctionNanoSelection(this.model, this.provider, this.imageSize);
          if (_0x577873) {
            const _0x1bec1d = resolveImageFunctionModelByMode({
              model: this.model,
              provider: this.provider,
              imageSize: this.imageSize,
              mode: _0x577873.mode
            });
            if (_0x1bec1d?.model) {
              _0x50a3ee(_0x1bec1d.model, _0x1bec1d.provider);
            }
          }
          _0x451322();
          _0x1e2925();
        }
      });
      this.generationToolbarEl.querySelector(".model-toggle")?.addEventListener("click", _0xd310d6 => {
        _0xd310d6.stopPropagation();
        _0x3ec3ce?.classList.toggle("show");
        _0xb175a7();
        _0x3138ca?.classList.remove("show");
      });
      const _0x5d3da5 = bindImageFunctionModelMenu({
        modelMenu: _0x3ec3ce,
        onSelect: ({
          model: _0x3dd510,
          provider: _0x2548ea
        }) => {
          _0x50a3ee(_0x3dd510, _0x2548ea);
        },
        closeMenu: () => {
          _0x3ec3ce?.classList.remove("show");
        }
      });
      const _0x2a457a = bindImageFunctionModeMenu({
        modeMenu: _0x3138ca,
        onSelect: ({
          mode: _0x4963d7
        }) => {
          const _0x34cf37 = resolveImageFunctionModelByMode({
            model: this.model,
            provider: this.provider,
            imageSize: this.imageSize,
            mode: _0x4963d7
          });
          if (!_0x34cf37?.model) {
            return;
          }
          _0x50a3ee(_0x34cf37.model, _0x34cf37.provider);
          _0x3138ca?.classList.remove("show");
        }
      });
      this._unbindGenerationFunctionMenus = () => {
        _0x5d3da5?.();
        _0x2a457a?.();
      };
      _0x3ce6cf?.addEventListener("click", _0xe308f4 => {
        _0xe308f4.stopPropagation();
        if (_0x3ce6cf.closest(".image-function-mode-wrap")?.classList.contains("is-hidden")) {
          return;
        }
        _0x3138ca?.classList.toggle("show");
        _0xb175a7(_0x3138ca);
        _0x3ec3ce?.classList.remove("show");
        closeImageFunctionModelSubmenus(_0x3ec3ce);
      });
      _0x451322();
      _0x1e2925();
      this.generationToolbarEl.querySelector(".go")?.addEventListener("click", async _0x2c2aac => {
        _0x2c2aac.stopPropagation();
        await this._save();
      });
      this.generationToolbarEl.querySelector(".debug-wrench-btn")?.addEventListener("click", async _0x1850d2 => {
        _0x1850d2.stopPropagation();
        await this._handleDebugRequest();
      });
    }
    const _0x3d2af3 = this.canvasEl.getContext("2d");
    _0x3d2af3.lineCap = "round";
    _0x3d2af3.lineJoin = "round";
    this._checkerPattern = createEraseCheckerboardPattern(_0x3d2af3, 1);
    const _0x360470 = {
      down: false,
      pointerId: null,
      previousTool: null,
      temporaryTool: null,
      textTransform: null
    };
    const _0x4db1bc = (_0x4b2a32, _0x116e3b) => {
      this._cursorLast = {
        x: _0x4b2a32,
        y: _0x116e3b
      };
      if (this._cursorRaf) {
        return;
      }
      this._cursorRaf = requestAnimationFrame(() => {
        this._cursorRaf = 0;
        this._syncCursor();
      });
    };
    const _0xf74e99 = (_0x2b3f19, _0x53bfb5, _0x329b54, _0x389830 = 0) => {
      const _0x1b0779 = a995_0x1ceb23.getStateRaw();
      const _0x14fb82 = _0x1b0779.nodes?.[this.nodeId];
      if (!_0x14fb82) {
        return false;
      }
      const _0xcd754c = screenToWorld(_0x2b3f19, _0x53bfb5, _0x1b0779.viewport);
      if (!isPointInRect(_0xcd754c.x, _0xcd754c.y, _0x14fb82.x, _0x14fb82.y, _0x14fb82.width, _0x14fb82.height)) {
        return false;
      }
      const _0x287b24 = this._getLocalFromClient(_0x2b3f19, _0x53bfb5, _0x1b0779, _0x14fb82);
      const _0x40bd19 = _0x1b0779.annotate?.tool || "brush";
      const _0x4de30f = _0x389830 === 1 || _0x389830 === 2;
      const _0x39004d = _0x4de30f ? "eraser" : _0x40bd19;
      if (_0x39004d !== "text") {
        this._selectedTextCommandIndex = null;
      }
      const _0x2a073a = clampImageBrushSize(_0x1b0779.annotate?.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX);
      const _0x4aa43a = _0x2a073a / (_0x1b0779.viewport.zoom || 1);
      if (_0x4de30f) {
        _0x360470.previousTool = _0x40bd19;
        _0x360470.temporaryTool = "eraser";
        this._temporaryTool = "eraser";
        this._syncCursor("eraser", _0x2a073a);
      } else {
        _0x360470.previousTool = null;
        _0x360470.temporaryTool = null;
        this._temporaryTool = null;
      }
      if (_0x39004d === "bucket" && !this._isEraseScene()) {
        this._fillArea(_0x287b24, _0x4aa43a);
        return true;
      }
      if (_0x39004d === "number-label" && this._isAnnotateScene()) {
        this._addNumberLabel(_0x287b24, _0x4aa43a);
        return true;
      }
      if (_0x39004d === "text") {
        const _0x5b44c8 = this._findTextHit(_0x287b24, _0x1b0779.viewport);
        if (_0x5b44c8) {
          this._removeTextInput(true);
          this._selectedTextCommandIndex = _0x5b44c8.index;
          if (_0x5b44c8.mode === "delete") {
            this._deleteTextCommand(_0x5b44c8.index);
            return true;
          }
          if (_0x5b44c8.mode === "copy") {
            this._copyTextCommand(_0x5b44c8.index, _0x1b0779.viewport);
            return true;
          }
          _0x360470.down = true;
          _0x360470.pointerId = _0x329b54;
          _0x360470.textTransform = this._createTextTransformState(_0x5b44c8, _0x287b24, _0x1b0779.viewport);
          this.canvasEl.setPointerCapture(_0x329b54);
          this._render();
          return true;
        }
        this._selectedTextCommandIndex = null;
        this._openTextInput(_0x287b24, _0x1b0779, _0x4aa43a, _0x2b3f19, _0x53bfb5);
        return true;
      }
      if (_0x39004d === "rect") {
        this._draft = {
          type: "rect",
          color: getColorCanvas(_0x1b0779.annotate?.color || "red"),
          sizeWorld: _0x4aa43a,
          x1: _0x287b24.x,
          y1: _0x287b24.y,
          x2: _0x287b24.x,
          y2: _0x287b24.y
        };
      } else if (_0x39004d === "eraser") {
        this._draft = {
          type: "eraser",
          sizeWorld: _0x4aa43a,
          points: [_0x287b24]
        };
      } else {
        this._draft = {
          type: "brush",
          color: getColorCanvas(_0x1b0779.annotate?.color || "red"),
          sizeWorld: _0x4aa43a,
          points: [_0x287b24]
        };
      }
      _0x360470.down = true;
      _0x360470.pointerId = _0x329b54;
      this.canvasEl.setPointerCapture(_0x329b54);
      this._render();
      return true;
    };
    const _0x31c236 = (_0x1ea65c, _0xaa098b) => {
      const _0x1842ec = a995_0x1ceb23.getStateRaw();
      const _0x237537 = _0x1842ec.nodes?.[this.nodeId];
      if (!_0x237537) {
        return;
      }
      const _0x2eecf8 = this._getLocalFromClient(_0x1ea65c, _0xaa098b, _0x1842ec, _0x237537);
      if (_0x360470.down && _0x360470.textTransform) {
        const _0x382f00 = _0x360470.textTransform;
        const _0x59cd17 = this._commands[_0x382f00.index];
        if (_0x59cd17?.type === "text") {
          const _0x1b89e9 = _0x1842ec.viewport?.zoom || 1;
          const _0x392b24 = {
            x: Number(_0x2eecf8.x || 0) * _0x1b89e9,
            y: Number(_0x2eecf8.y || 0) * _0x1b89e9
          };
          if (_0x382f00.mode === "move") {
            _0x59cd17.x = _0x2eecf8.x - _0x382f00.offsetWorldX;
            _0x59cd17.y = _0x2eecf8.y - _0x382f00.offsetWorldY;
          } else if (_0x382f00.mode === "scale-x" || _0x382f00.mode === "scale-y") {
            const _0x4f1afa = this._resolveAxisTextScale(_0x382f00, _0x392b24);
            _0x59cd17.scale = undefined;
            _0x59cd17.scaleX = _0x4f1afa.scaleX;
            _0x59cd17.scaleY = _0x4f1afa.scaleY;
            _0x59cd17.x = _0x4f1afa.originPx.x / _0x1b89e9;
            _0x59cd17.y = _0x4f1afa.originPx.y / _0x1b89e9;
          } else if (_0x382f00.mode === "scale-uniform") {
            const _0x451663 = this._toTextLocalTransformSpace(_0x392b24, _0x382f00.originPx, _0x382f00.rotation);
            const _0x3c6974 = _0x451663.x / _0x382f00.baseWidthPx;
            const _0x3b7926 = _0x451663.y / _0x382f00.baseHeightPx;
            const _0x3a8ca7 = Math.max(_0x3c6974, _0x3b7926);
            const _0x53a2f6 = Number.isFinite(_0x3a8ca7) && _0x3a8ca7 > 0 ? _0x3a8ca7 : 1;
            _0x59cd17.scale = undefined;
            _0x59cd17.scaleX = clampTextScale(_0x382f00.baseScaleX * _0x53a2f6);
            _0x59cd17.scaleY = clampTextScale(_0x382f00.baseScaleY * _0x53a2f6);
            _0x59cd17.x = _0x382f00.originPx.x / _0x1b89e9;
            _0x59cd17.y = _0x382f00.originPx.y / _0x1b89e9;
          } else if (_0x382f00.mode === "rotate") {
            const _0x5c7e82 = Math.atan2(_0x392b24.y - _0x382f00.centerPx.y, _0x392b24.x - _0x382f00.centerPx.x);
            const _0x4cf420 = _0x382f00.baseRotation + (_0x5c7e82 - _0x382f00.baseAngle);
            _0x59cd17.rotation = _0x4cf420;
            const {
              scaleX: _0xfe2ad7,
              scaleY: _0x56a788
            } = getTextScalePair(_0x59cd17);
            const _0x42a401 = {
              x: _0x382f00.layoutWidth * _0xfe2ad7 / 2,
              y: _0x382f00.layoutHeight * _0x56a788 / 2
            };
            const _0x3377c4 = Math.cos(_0x4cf420);
            const _0x4381dc = Math.sin(_0x4cf420);
            const _0x2fea59 = _0x42a401.x * _0x3377c4 - _0x42a401.y * _0x4381dc;
            const _0x197a7f = _0x42a401.x * _0x4381dc + _0x42a401.y * _0x3377c4;
            const _0x3873a0 = {
              x: _0x382f00.centerPx.x - _0x2fea59,
              y: _0x382f00.centerPx.y - _0x197a7f
            };
            _0x59cd17.x = _0x3873a0.x / _0x1b89e9;
            _0x59cd17.y = _0x3873a0.y / _0x1b89e9;
          }
          this._selectedTextCommandIndex = _0x382f00.index;
          this._render();
        }
        return;
      }
      if (!_0x360470.down || !this._draft) {
        return;
      }
      if (this._draft.type === "rect") {
        this._draft.x2 = _0x2eecf8.x;
        this._draft.y2 = _0x2eecf8.y;
      } else {
        this._draft.points.push(_0x2eecf8);
      }
      this._render();
    };
    const _0x12360a = () => {
      if (_0x360470.down && _0x360470.textTransform) {
        _0x360470.down = false;
        _0x360470.pointerId = null;
        _0x360470.textTransform = null;
        _0x360470.previousTool = null;
        _0x360470.temporaryTool = null;
        this._temporaryTool = null;
        this._redoStack = [];
        this._dirty = true;
        this._persistEraseSelectionState();
        this._render();
        return;
      }
      if (!_0x360470.down || !this._draft) {
        return;
      }
      const _0x2f073e = this._draft;
      this._draft = null;
      _0x360470.down = false;
      _0x360470.pointerId = null;
      const _0x26dd71 = _0x360470.previousTool;
      _0x360470.previousTool = null;
      _0x360470.temporaryTool = null;
      _0x360470.textTransform = null;
      this._temporaryTool = null;
      if (shouldDiscardStrokeCommand(_0x2f073e)) {
        if (_0x26dd71) {
          this._syncCursor(_0x26dd71, this._view?.brushSizePx);
        } else {
          this._syncCursor();
        }
        this._render();
        return;
      }
      if (_0x2f073e.type === "rect") {
        const _0x106807 = Math.abs(_0x2f073e.x2 - _0x2f073e.x1);
        const _0x10d0e8 = Math.abs(_0x2f073e.y2 - _0x2f073e.y1);
        if (_0x106807 < 0.5 && _0x10d0e8 < 0.5) {
          if (_0x26dd71) {
            this._syncCursor(_0x26dd71, this._view?.brushSizePx);
          } else {
            this._syncCursor();
          }
          this._render();
          return;
        }
      }
      this._commands.push(_0x2f073e);
      this._redoStack = [];
      this._dirty = true;
      this._persistEraseSelectionState();
      if (_0x26dd71) {
        this._syncCursor(_0x26dd71, this._view?.brushSizePx);
      }
      this._render();
    };
    this.canvasEl.addEventListener("pointerdown", _0x5c85df => {
      _0x5c85df.preventDefault();
      _0x5c85df.stopPropagation();
      _0x4db1bc(_0x5c85df.clientX, _0x5c85df.clientY);
      _0xf74e99(_0x5c85df.clientX, _0x5c85df.clientY, _0x5c85df.pointerId, _0x5c85df.button);
    });
    this.canvasEl.addEventListener("contextmenu", _0x494778 => {
      _0x494778.preventDefault();
      _0x494778.stopPropagation();
    });
    this.canvasEl.addEventListener("pointermove", _0x286b91 => {
      _0x286b91.preventDefault();
      _0x286b91.stopPropagation();
      _0x4db1bc(_0x286b91.clientX, _0x286b91.clientY);
      _0x31c236(_0x286b91.clientX, _0x286b91.clientY);
    });
    this.canvasEl.addEventListener("pointerup", _0x23488e => {
      _0x23488e.preventDefault();
      _0x23488e.stopPropagation();
      _0x4db1bc(_0x23488e.clientX, _0x23488e.clientY);
      _0x12360a();
    });
    this.canvasEl.addEventListener("pointercancel", _0x1f679f => {
      _0x1f679f.preventDefault();
      _0x1f679f.stopPropagation();
      _0x4db1bc(_0x1f679f.clientX, _0x1f679f.clientY);
      _0x12360a();
    });
    this.canvasEl.addEventListener("pointerenter", _0x42136f => {
      this._cursorHover = true;
      _0x4db1bc(_0x42136f.clientX, _0x42136f.clientY);
    });
    this.canvasEl.addEventListener("pointerleave", () => {
      this._cursorHover = false;
      this._syncCursor();
    });
  },
  _syncPaletteActive() {
    if (!this.colorButtons) {
      return;
    }
    const _0x1d31d4 = normalizeColorName(this._view?.color) || "red";
    const _0x49a49c = getColorCss(_0x1d31d4);
    if (this.colorDotEl) {
      this.colorDotEl.style.background = _0x49a49c;
      this.colorDotEl.style.borderColor = _0x1d31d4 === "black" ? "var(--white-35)" : _0x1d31d4 === "white" ? "var(--white-25)" : "var(--black-20)";
    }
    this.colorButtons.forEach(_0x29ec4e => {
      if (_0x29ec4e.dataset.color === _0x1d31d4) {
        _0x29ec4e.classList.add("active");
      } else {
        _0x29ec4e.classList.remove("active");
      }
    });
  },
  _onCanvasWheel(_0x59df0c) {
    _0x59df0c.preventDefault();
    _0x59df0c.stopPropagation();
    if (!this.active) {
      return;
    }
    if (!this._cursorHover) {
      return;
    }
    const _0x2d4659 = this._view?.tool || "brush";
    if (_0x2d4659 !== "brush" && _0x2d4659 !== "eraser" && _0x2d4659 !== "bucket" && _0x2d4659 !== "number-label" && _0x2d4659 !== "text") {
      return;
    }
    const _0x1267ca = _0x59df0c.deltaY || 0;
    const _0xa22424 = _0x1267ca < 0 ? 1 : -1;
    const _0x13a474 = clampImageBrushSize(this._view?.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX);
    const _0x2cb022 = clampImageBrushSize(_0x13a474 + _0xa22424 * 2, IMAGE_BRUSH_DEFAULT_SIZE_PX);
    if (_0x2cb022 === _0x13a474) {
      return;
    }
    a995_0x1ceb23.setAnnotateState({
      brushSizePx: _0x2cb022
    });
    if (this.sizeRangeEl) {
      this.sizeRangeEl.value = String(_0x2cb022);
    }
    if (this.sizeValueEl) {
      this.sizeValueEl.textContent = String(_0x2cb022);
    }
    this._syncCursor();
  },
  _syncCursor(_0x549223 = this._temporaryTool || this._view?.tool || "brush", _0x3b26e9 = this._view?.brushSizePx || IMAGE_BRUSH_DEFAULT_SIZE_PX) {
    if (!this.cursorEl) {
      return;
    }
    if (_0x549223 === "text") {
      this.cursorEl.style.display = "none";
      this.cursorEl.classList.remove("is-erase-brush");
      this._syncTextToolCursor();
      return;
    }
    syncCircularBrushCursor({
      cursorEl: this.cursorEl,
      canvasEl: this.canvasEl,
      visible: this._cursorHover,
      tool: _0x549223,
      allowedTools: ["brush", "eraser", "bucket", "number-label"],
      sizePx: _0x3b26e9,
      cursorLast: this._cursorLast,
      isEraseBrush: this._isGenerationScene() || _0x549223 === "eraser"
    });
  },
  _getTextScaleCursor(_0x234461) {
    const _0x21b228 = document.querySelector("#v2-wrap .group-resizer.v2-resize-move") || document.querySelector("#v2-wrap .v2-resize-move");
    if (_0x21b228) {
      const _0x579c28 = getComputedStyle(_0x21b228).cursor;
      if (_0x579c28 && _0x579c28 !== "auto") {
        return _0x579c28;
      }
    }
    return "move";
  },
  _getCanvasPointerCursor() {
    return getCssVar("--pointer-cursor") || "default";
  },
  _syncTextToolCursor() {
    if (!this.canvasEl) {
      return;
    }
    const _0x44fbb4 = this._getCanvasPointerCursor();
    if (!this._cursorHover) {
      this.canvasEl.style.cursor = _0x44fbb4;
      return;
    }
    const _0x283ec1 = a995_0x1ceb23.getStateRaw();
    const _0x53e487 = _0x283ec1.nodes?.[this.nodeId];
    if (!_0x53e487) {
      this.canvasEl.style.cursor = _0x44fbb4;
      return;
    }
    const _0x4a4883 = this._getLocalFromClient(this._cursorLast.x, this._cursorLast.y, _0x283ec1, _0x53e487);
    const _0x4b819f = this._findTextHit(_0x4a4883, _0x283ec1.viewport);
    if (!_0x4b819f) {
      this.canvasEl.style.cursor = _0x44fbb4;
      return;
    }
    if (_0x4b819f.mode === "delete" || _0x4b819f.mode === "copy") {
      this.canvasEl.style.cursor = "var(--link-cursor)";
      return;
    }
    if (_0x4b819f.mode === "rotate") {
      this.canvasEl.style.cursor = ROTATE_CURSOR_CSS + ", " + _0x44fbb4;
      return;
    }
    if (_0x4b819f.mode === "scale-uniform") {
      this.canvasEl.style.cursor = this._getTextScaleCursor(_0x4b819f);
      return;
    }
    if (_0x4b819f.mode === "scale-x") {
      this.canvasEl.style.cursor = "var(--resize-ew-cursor)";
      return;
    }
    if (_0x4b819f.mode === "scale-y") {
      this.canvasEl.style.cursor = "var(--resize-ns-cursor)";
      return;
    }
    this.canvasEl.style.cursor = _0x44fbb4;
  },
  _updateToolActive(_0x5e7b6d = this._view?.tool || "brush", _0x4cbeb7 = this._view?.brushSizePx || IMAGE_BRUSH_DEFAULT_SIZE_PX) {
    this.toolButtons.forEach(_0xc49412 => {
      if (_0xc49412.dataset.tool === _0x5e7b6d) {
        _0xc49412.classList.add("active");
      } else {
        _0xc49412.classList.remove("active");
      }
    });
    this._syncCursor(_0x5e7b6d, _0x4cbeb7);
  },
  _setTool(_0xb56ae8) {
    if (_0xb56ae8 !== "text") {
      this._removeTextInput(true);
    }
    if (_0xb56ae8 !== "text") {
      this._selectedTextCommandIndex = null;
    }
    const _0x4704d3 = getAnnotateToolbarToolsForScene(this._mode?.scene || "annotate");
    const _0x45554a = _0x4704d3.includes(_0xb56ae8) ? _0xb56ae8 : "brush";
    a995_0x1ceb23.setAnnotateState({
      tool: _0x45554a
    });
    this._persistEraseSelectionState();
  },
  _removeTextInput(_0x492d4c = true, _0x1743df = null) {
    const _0x3d776e = _0x1743df || this._textInputEl;
    if (!_0x3d776e) {
      return;
    }
    const _0x2e7828 = this._textInputEl === _0x3d776e;
    const _0x1a8eca = String(_0x3d776e.value || "").trim();
    const _0x3e94f5 = Number(_0x3d776e.dataset.localX);
    const _0x32a48c = Number(_0x3d776e.dataset.localY);
    const _0x46bcf9 = Number(_0x3d776e.dataset.sizeWorld);
    const _0x2e3297 = String(_0x3d776e.dataset.color || "");
    if (_0x3d776e.parentElement) {
      _0x3d776e.parentElement.removeChild(_0x3d776e);
    }
    if (_0x2e7828) {
      this._textInputEl = null;
    }
    if (!_0x2e7828) {
      return;
    }
    if (!_0x492d4c || !_0x1a8eca || !Number.isFinite(_0x3e94f5) || !Number.isFinite(_0x32a48c) || !Number.isFinite(_0x46bcf9)) {
      return;
    }
    this._commands.push({
      type: "text",
      text: _0x1a8eca.slice(0, 200),
      color: _0x2e3297 || getColorCanvas("red"),
      sizeWorld: _0x46bcf9,
      x: _0x3e94f5,
      y: _0x32a48c,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    });
    this._selectedTextCommandIndex = this._commands.length - 1;
    this._redoStack = [];
    this._dirty = true;
    this._persistEraseSelectionState();
    this._render();
  },
  _openTextInput(_0x1dc0ff, _0x2fa99d, _0x5dfeeb, _0x385bbc, _0x29169a) {
    this._removeTextInput(true);
    const _0x5aadf1 = document.createElement("input");
    _0x5aadf1.type = "text";
    _0x5aadf1.maxLength = 200;
    _0x5aadf1.className = "v2-annotate-text-input";
    _0x5aadf1.dataset.localX = String(_0x1dc0ff.x);
    _0x5aadf1.dataset.localY = String(_0x1dc0ff.y);
    _0x5aadf1.dataset.sizeWorld = String(_0x5dfeeb);
    _0x5aadf1.dataset.color = getColorCanvas(_0x2fa99d.annotate?.color || "red");
    _0x5aadf1.style.left = _0x385bbc + "px";
    _0x5aadf1.style.top = _0x29169a + "px";
    _0x5aadf1.style.setProperty("--annotate-text-input-size", clampImageBrushSize(_0x2fa99d.annotate?.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX) + "px");
    _0x5aadf1.style.setProperty("--annotate-text-input-color", _0x5aadf1.dataset.color || getColorCanvas("red"));
    let _0x537117 = false;
    const _0x5c49c8 = _0x34c0bf => {
      if (_0x537117) {
        return;
      }
      _0x537117 = true;
      this._removeTextInput(_0x34c0bf, _0x5aadf1);
    };
    _0x5aadf1.addEventListener("pointerdown", _0x553e43 => _0x553e43.stopPropagation());
    _0x5aadf1.addEventListener("keydown", _0x471dd9 => {
      if (_0x471dd9.key === "Enter" && !_0x471dd9.isComposing) {
        _0x471dd9.preventDefault();
        _0x5c49c8(true);
      } else if (_0x471dd9.key === "Escape") {
        _0x471dd9.preventDefault();
        _0x5c49c8(false);
      }
    });
    _0x5aadf1.addEventListener("blur", () => _0x5c49c8(true));
    this.overlayEl?.appendChild(_0x5aadf1);
    this._textInputEl = _0x5aadf1;
    requestAnimationFrame(() => {
      if (this._textInputEl === _0x5aadf1) {
        _0x5aadf1.focus();
      }
    });
  },
  _getTextLayout(_0x431123, _0x5b16cf) {
    return getTextLayout({
      canvasEl: this.canvasEl,
      cmd: _0x431123,
      viewport: _0x5b16cf
    });
  },
  _getTextGeometry(_0x1b569d, _0x205619) {
    return getTextGeometry({
      canvasEl: this.canvasEl,
      cmd: _0x1b569d,
      viewport: _0x205619
    });
  },
  _toTextLocalTransformSpace(_0x3216b4, _0x15cd7f, _0x4a64e7) {
    return toTextLocalTransformSpace(_0x3216b4, _0x15cd7f, _0x4a64e7);
  },
  _rotateTextLocalPoint(_0xdbf834, _0x2b1bc3) {
    return rotateTextLocalPoint(_0xdbf834, _0x2b1bc3);
  },
  _resolveAxisTextScale(_0x4b879d, _0x378e2b) {
    return resolveAxisTextScale(_0x4b879d, _0x378e2b);
  },
  _deleteTextCommand(_0x1d73c0) {
    const _0x4a3de7 = Number(_0x1d73c0);
    if (!Number.isInteger(_0x4a3de7) || this._commands[_0x4a3de7]?.type !== "text") {
      return false;
    }
    this._commands.splice(_0x4a3de7, 1);
    this._selectedTextCommandIndex = null;
    this._redoStack = [];
    this._dirty = true;
    this._persistEraseSelectionState();
    this._render();
    return true;
  },
  _copyTextCommand(_0x58e9b8, _0x10c441 = this._view?.viewport) {
    const _0x976aee = Number(_0x58e9b8);
    const _0x450dcc = this._commands[_0x976aee];
    if (!Number.isInteger(_0x976aee) || _0x450dcc?.type !== "text") {
      return false;
    }
    const _0x3e71c8 = buildCopiedTextCommand(_0x450dcc, _0x10c441);
    this._commands.splice(_0x976aee + 1, 0, _0x3e71c8);
    this._selectedTextCommandIndex = _0x976aee + 1;
    this._redoStack = [];
    this._dirty = true;
    this._persistEraseSelectionState();
    this._render();
    return true;
  },
  deleteSelectedTextCommand() {
    const _0x200325 = Number(this._selectedTextCommandIndex);
    if (!Number.isInteger(_0x200325)) {
      return false;
    }
    return this._deleteTextCommand(_0x200325);
  },
  _findTextHit(_0xb8fcd4, _0x44e309) {
    return findTextHit({
      commands: this._commands,
      selectedTextCommandIndex: this._selectedTextCommandIndex,
      local: _0xb8fcd4,
      viewport: _0x44e309,
      canvasEl: this.canvasEl
    });
  },
  _createTextTransformState(_0x52a022, _0x15fe95, _0x1c031f) {
    return createTextTransformState({
      commands: this._commands,
      hit: _0x52a022,
      local: _0x15fe95,
      viewport: _0x1c031f,
      canvasEl: this.canvasEl
    });
  },
  _normalizeSelectedTextCommand() {
    const _0x111d51 = Number(this._selectedTextCommandIndex);
    if (!Number.isInteger(_0x111d51) || _0x111d51 < 0 || _0x111d51 >= this._commands.length) {
      this._selectedTextCommandIndex = null;
      return;
    }
    if (this._commands[_0x111d51]?.type !== "text") {
      this._selectedTextCommandIndex = null;
    }
  },
  _updateView(_0x4e624a) {
    if (!this.active) {
      return;
    }
    const _0xd2cbbb = _0x4e624a?.node;
    const _0x352e0b = _0x4e624a?.viewport;
    if (!_0xd2cbbb) {
      return;
    }
    this.nodeData = _0xd2cbbb;
    const _0x5bed24 = clampImageBrushSize(_0x4e624a?.brushSizePx, IMAGE_BRUSH_DEFAULT_SIZE_PX);
    if (this.sizeRangeEl && Number(this.sizeRangeEl.value) !== _0x5bed24) {
      this.sizeRangeEl.value = String(_0x5bed24);
    }
    if (this.sizeValueEl && this.sizeValueEl.textContent !== String(_0x5bed24)) {
      this.sizeValueEl.textContent = String(_0x5bed24);
    }
    this._updateToolActive(_0x4e624a?.tool, _0x5bed24);
    this._syncPaletteActive(_0x4e624a?.color);
    const _0x144b70 = worldToScreen(_0xd2cbbb.x, _0xd2cbbb.y, _0x352e0b);
    const _0x53f94b = Math.round(_0xd2cbbb.width * _0x352e0b.zoom);
    const _0x1bb29 = Math.round(_0xd2cbbb.height * _0x352e0b.zoom);
    this.containerEl.style.left = Math.round(_0x144b70.x) + "px";
    this.containerEl.style.top = Math.round(_0x144b70.y) + "px";
    this.containerEl.style.width = _0x53f94b + "px";
    this.containerEl.style.height = _0x1bb29 + "px";
    const _0x478f1a = window.devicePixelRatio || 1;
    const _0x3b4ba3 = Math.max(1, _0x53f94b);
    const _0x464abb = Math.max(1, _0x1bb29);
    if (this.canvasEl.width !== Math.round(_0x3b4ba3 * _0x478f1a) || this.canvasEl.height !== Math.round(_0x464abb * _0x478f1a)) {
      this.canvasEl.width = Math.round(_0x3b4ba3 * _0x478f1a);
      this.canvasEl.height = Math.round(_0x464abb * _0x478f1a);
      this.canvasEl.style.width = _0x3b4ba3 + "px";
      this.canvasEl.style.height = _0x464abb + "px";
      const _0x3bae9d = this.canvasEl.getContext("2d");
      _0x3bae9d.setTransform(_0x478f1a, 0, 0, _0x478f1a, 0, 0);
      _0x3bae9d.lineCap = "round";
      _0x3bae9d.lineJoin = "round";
    }
    const _0x1a321d = Math.max(12, Math.round(_0x144b70.y) - 54);
    this.toolbarEl.style.left = Math.round(_0x144b70.x + _0x53f94b / 2) + "px";
    this.toolbarEl.style.top = _0x1a321d + "px";
    if (this.generationToolbarEl) {
      this.generationToolbarEl.style.left = Math.round(_0x144b70.x + _0x53f94b / 2) + "px";
      this.generationToolbarEl.style.top = Math.round(_0x144b70.y + _0x1bb29 + 14) + "px";
      this.generationToolbarEl.style.bottom = "auto";
      this.generationToolbarEl.style.transform = "translateX(-50%)";
    }
    this._applyStageFlip(this._getCurrentFlipState());
    this._render(_0x352e0b);
  },
  _render(_0x1bfd5a = this._view?.viewport) {
    if (!this.active || !this.canvasEl) {
      return;
    }
    this._applyStageFlip(this._getCurrentFlipState());
    const _0x43c72b = this.canvasEl.getContext("2d");
    const _0x4fa4f1 = Number(this.canvasEl.style.width.replace("px", "")) || 1;
    const _0xede46f = Number(this.canvasEl.style.height.replace("px", "")) || 1;
    _0x43c72b.clearRect(0, 0, _0x4fa4f1, _0xede46f);
    const _0x5d9102 = toImageLocalRenderViewport(_0x1bfd5a);
    if (this._isGenerationScene()) {
      this._renderEraseSceneCommands(_0x43c72b, _0x5d9102, this._commands, this._draft);
      return;
    }
    this._renderCommands(_0x43c72b, _0x5d9102, this._commands);
    if (this._draft) {
      this._renderCommands(_0x43c72b, _0x5d9102, [this._draft], true);
    }
  },
  _renderEraseSceneCommands(_0x1701a2, _0x379482, _0x5e6fa5 = [], _0x4b2b98 = null) {
    this._eraseMaskCanvasEl = renderEraseSceneCommands({
      documentRef: document,
      canvasEl: this.canvasEl,
      ctx: _0x1701a2,
      viewport: _0x379482,
      commands: _0x5e6fa5,
      draft: _0x4b2b98,
      checkerPattern: this._checkerPattern,
      eraseMaskCanvasEl: this._eraseMaskCanvasEl
    });
  },
  _renderCommands(_0x58ac17, _0x2c9196, _0x256afe, _0x4bb8bf = false) {
    renderCommands({
      ctx: _0x58ac17,
      viewport: _0x2c9196,
      canvasEl: this.canvasEl,
      commands: _0x256afe,
      isDraft: _0x4bb8bf,
      isEraseScene: this._isEraseScene(),
      checkerPattern: this._checkerPattern,
      defaultTextColor: getColorCanvas("red"),
      getTextGeometry: (_0x58c06f, _0x3674cd) => this._getTextGeometry(_0x58c06f, _0x3674cd),
      selectedTextCommandIndex: this._selectedTextCommandIndex,
      selectedCommandsRef: this._commands,
      resolveCssVar: getCssVar,
      fillRegionCache: this._fillRegionCache,
      numberLabelBackgroundColor: getCssVar("--canvas-white")
    });
  },
  _addNumberLabel(_0x465603, _0xb9dea1) {
    if (!this.active || !this._isAnnotateScene()) {
      return null;
    }
    const _0x58748f = a995_0x1ceb23.getStateRaw();
    const _0x21fd13 = Number(_0x465603?.x);
    const _0x4fd5fa = Number(_0x465603?.y);
    if (!Number.isFinite(_0x21fd13) || !Number.isFinite(_0x4fd5fa)) {
      return null;
    }
    const _0x4335bd = {
      type: "number-label",
      number: getNextNumberLabelValue(this._commands),
      x: _0x21fd13,
      y: _0x4fd5fa,
      color: getColorCanvas(_0x58748f.annotate?.color || "red"),
      sizeWorld: _0xb9dea1
    };
    this._commands.push(_0x4335bd);
    this._redoStack = [];
    this._dirty = true;
    this._persistEraseSelectionState();
    this._render();
    return _0x4335bd;
  },
  _fillArea(_0x309eca, _0xeed660) {
    const _0x2b223d = a995_0x1ceb23.getStateRaw();
    const _0x4d02a0 = {
      type: "fill",
      x: Number(_0x309eca?.x) || 0,
      y: Number(_0x309eca?.y) || 0,
      color: getColorCanvas(_0x2b223d.annotate?.color || "red")
    };
    this._commands.push(_0x4d02a0);
    this._redoStack = [];
    this._dirty = true;
    this._persistEraseSelectionState();
    this._render();
  },
  _pushFlipCommand(_0x2062ee) {
    if (!this.active || !this._isAnnotateScene()) {
      return;
    }
    if (_0x2062ee !== "flip-horizontal" && _0x2062ee !== "flip-vertical") {
      return;
    }
    this._removeTextInput(true);
    this._commands.push({
      type: _0x2062ee
    });
    this._redoStack = [];
    this._dirty = true;
    this._normalizeSelectedTextCommand();
    this._render();
  },
  _flipHorizontal() {
    this._pushFlipCommand("flip-horizontal");
  },
  _flipVertical() {
    this._pushFlipCommand("flip-vertical");
  },
  _undo() {
    if (this._commands.length === 0) {
      return;
    }
    const _0x21f2d8 = this._commands.pop();
    this._redoStack.push(_0x21f2d8);
    this._dirty = true;
    this._normalizeSelectedTextCommand();
    this._persistEraseSelectionState();
    this._render();
  },
  _redo() {
    if (this._redoStack.length === 0) {
      return;
    }
    const _0x1a3949 = this._redoStack.pop();
    this._commands.push(_0x1a3949);
    this._dirty = true;
    this._normalizeSelectedTextCommand();
    this._persistEraseSelectionState();
    this._render();
  },
  _clear() {
    if (this._commands.length === 0 && this._redoStack.length === 0) {
      return;
    }
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._dirty = true;
    this._persistEraseSelectionState();
    this._render();
  },
  _applyBaseSurface() {
    if (!this.stageEl || !this.imgEl) {
      return;
    }
    const _0x147e35 = Boolean(this._useWhiteboardBase);
    this.stageEl.classList.toggle("is-whiteboard", _0x147e35);
    this.overlayEl?.classList.toggle("is-whiteboard", _0x147e35);
    this.imgEl.setAttribute("aria-hidden", _0x147e35 ? "true" : "false");
  },
  _createNewWhiteboard() {
    if (!this.active || this._isGenerationScene()) {
      return;
    }
    this._removeTextInput(false);
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._useWhiteboardBase = true;
    this._dirty = true;
    a995_0x1ceb23.setAnnotateState({
      color: "black"
    });
    this._applyBaseSurface();
    this._render();
    window.showToast?.(imageAnnotateText("toasts.newBoard"), "ok");
  },
  _persistEraseSelectionState() {
    if (!this._isEraseScene() || !this.nodeId) {
      return;
    }
    const _0x2a70c0 = a995_0x1ceb23.getStateRaw().nodes?.[this.nodeId];
    if (!_0x2a70c0) {
      return;
    }
    const _0x135a94 = a995_0x1ceb23.getStateRaw().annotate || {};
    const _0xd46971 = buildPersistedEraseSelectionState({
      commands: this._commands,
      tool: _0x135a94.tool,
      brushSizePx: _0x135a94.brushSizePx
    });
    a995_0x1ceb23.updateNodeData(this.nodeId, {
      [ERASE_SELECTION_STATE_KEY]: _0xd46971
    });
  },
  _buildSelectionMaskCanvas(_0x400067, _0x16ecd3, _0x59cddb, _0x4128b8) {
    return buildSelectionMaskCanvas({
      documentRef: document,
      commands: this._commands,
      naturalW: _0x400067,
      naturalH: _0x16ecd3,
      scaleX: _0x59cddb,
      scaleY: _0x4128b8
    });
  },
  async _buildGenerationPayload(_0x3cfd2d, _0x1e59df) {
    return buildGenerationPayload({
      scene: this._mode?.scene,
      commands: this._commands,
      promptText: this.promptText,
      node: _0x3cfd2d,
      imgUrl: _0x1e59df,
      model: this.model,
      provider: this.provider,
      imageSize: this.imageSize,
      erasePrompt: ERASE_GENERATE_PROMPT,
      loadImage: _0x5619a8 => this._loadImage(_0x5619a8),
      createSelectionMaskCanvas: (_0x1b3562, _0x345b12, _0x1d2add, _0x360e4b) => this._buildSelectionMaskCanvas(_0x1b3562, _0x345b12, _0x1d2add, _0x360e4b),
      getModelProvider: getModelProvider,
      notify: (_0x2e2636, _0xa0179) => window.showToast?.(_0x2e2636, _0xa0179),
      documentRef: document,
      urlApi: URL
    });
  },
  async _handleDebugRequest() {
    if (!this.active || !this._isGenerationScene()) {
      return;
    }
    const _0x415b5e = a995_0x1ceb23.getState();
    const _0x217c1b = _0x415b5e.nodes?.[this.nodeId];
    if (!_0x217c1b) {
      return;
    }
    const _0xb609c0 = this._resolveNodeImageUrl(_0x217c1b);
    if (!_0xb609c0) {
      return;
    }
    let _0x31aaaa = "";
    try {
      const _0x584528 = await this._buildGenerationPayload(_0x217c1b, _0xb609c0);
      if (!_0x584528?.payload) {
        return;
      }
      _0x31aaaa = _0x584528.inputUrl || "";
      const _0x2ed636 = await buildGenerateImageRequest(_0x584528.payload);
      const _0xacfac0 = formatFinalApiDebugRequest(_0x2ed636);
      const _0x2080cd = _0x217c1b.x + (_0x217c1b.width || 380) + 50;
      const _0x3f942c = _0x217c1b.y;
      const _0x6a25f2 = getNodeDefaultSize("debug");
      let _0x3987c0 = Object.values(_0x415b5e.nodes).find(_0x5a0c1c => _0x5a0c1c.type === "debug");
      if (!_0x3987c0) {
        a995_0x1ceb23.addNode({
          id: "debug-" + Date.now(),
          type: "debug",
          x: _0x2080cd,
          y: _0x3f942c,
          ..._0x6a25f2,
          name: imageAnnotateText("debug.nodeName"),
          outputText: _0xacfac0
        });
      } else {
        a995_0x1ceb23.updateNodeData(_0x3987c0.id, {
          outputText: _0xacfac0,
          x: _0x2080cd,
          y: _0x3f942c
        });
      }
      window.showToast?.(imageAnnotateText("debug.shown"), "warn");
    } catch (_0x5b0122) {
      window.showToast?.(imageAnnotateText("debug.buildRequestFailed", {
        error: _0x5b0122.message
      }), "error");
    } finally {
      if (_0x31aaaa) {
        URL.revokeObjectURL(_0x31aaaa);
      }
    }
  },
  async _generateEraseResult(_0x3046f7, _0x10ede6) {
    const _0x1baf19 = await this._buildGenerationPayload(_0x3046f7, _0x10ede6);
    if (!_0x1baf19?.payload) {
      return;
    }
    await runGenerationResultFlow({
      scene: "erase",
      built: _0x1baf19,
      sourceNode: _0x3046f7,
      fallbackModel: this.model,
      fallbackProvider: this.provider,
      exitController: _0x25519b => this.exit(_0x25519b),
      notify: (_0x266ba7, _0x44940f) => window.showToast?.(_0x266ba7, _0x44940f)
    });
  },
  async _generateRepaintResult(_0x5553b8, _0x15f514) {
    const _0x4e0abe = await this._buildGenerationPayload(_0x5553b8, _0x15f514);
    if (!_0x4e0abe?.payload) {
      return;
    }
    await runGenerationResultFlow({
      scene: "repaint",
      built: _0x4e0abe,
      sourceNode: _0x5553b8,
      fallbackModel: this.model,
      fallbackProvider: this.provider,
      exitController: _0x7a99aa => this.exit(_0x7a99aa),
      notify: (_0x5046be, _0x373cab) => window.showToast?.(_0x5046be, _0x373cab)
    });
  },
  async _save() {
    if (!this.active) {
      return;
    }
    this._removeTextInput(true);
    const _0x1ac40c = a995_0x1ceb23.getState();
    const _0x1b70d2 = _0x1ac40c.nodes[this.nodeId];
    if (!_0x1b70d2) {
      return;
    }
    const _0x9153ec = this._isGenerationScene();
    const _0x1038b1 = this._resolveNodeImageUrl(_0x1b70d2, {
      preferPreview: !_0x9153ec
    });
    if (!_0x1038b1) {
      return;
    }
    const _0x5dc3a6 = this.generationToolbarEl?.querySelector(".go") || this.toolbarEl.querySelector(".act-save");
    const _0x44f331 = _0x5dc3a6?.querySelector("span") || null;
    const _0x2e5e9f = _0x44f331 ? _0x44f331.textContent : "";
    if (_0x44f331) {
      _0x44f331.textContent = this._mode?.submitBusyLabel || imageAnnotateText("actions.saving");
    }
    if (!_0x5dc3a6) {
      return;
    }
    _0x5dc3a6.style.pointerEvents = "none";
    let _0x371ea2 = "";
    let _0x4d80ee = 0;
    try {
      if (this._isEraseScene()) {
        await this._generateEraseResult(_0x1b70d2, _0x1038b1);
        return;
      }
      if (this._isRepaintScene()) {
        await this._generateRepaintResult(_0x1b70d2, _0x1038b1);
        return;
      }
      const _0x3edfd8 = this._isEraseScene();
      const _0x49ba05 = !_0x3edfd8 && this._useWhiteboardBase;
      const _0x3d0b0c = this._mode?.scene;
      const _0xe0133c = this.nodeId;
      const _0x48549e = Array.isArray(this._commands) ? this._commands.map(_0x53ee94 => _0x53ee94 && typeof _0x53ee94 === "object" ? {
        ..._0x53ee94
      } : _0x53ee94) : [];
      const _0x1d5b2d = this.imgEl;
      const _0x5dd052 = this._getCurrentFlipState();
      const _0x4a7ff5 = getCssVar("--canvas-white");
      const _0x44a274 = getColorCanvas("red");
      const _0x3feb0a = Date.now();
      const _0x155be5 = createPendingAnnotateExportNode({
        scene: _0x3d0b0c,
        sourceNodeId: _0xe0133c,
        baseNode: _0x1b70d2,
        startedAt: _0x3feb0a
      });
      _0x371ea2 = _0x155be5.newNodeId;
      _0x4d80ee = _0x3feb0a;
      this.exit({
        silent: true
      });
      const {
        blob: _0x298c6f,
        exportType: _0x2c978a
      } = await exportAnnotateCanvasBlob({
        documentRef: document,
        node: _0x1b70d2,
        imgEl: _0x1d5b2d,
        imgUrl: _0x1038b1,
        commands: _0x48549e,
        useWhiteboardBase: _0x49ba05,
        isEraseScene: _0x3edfd8,
        loadImage: _0x386d26 => this._loadImage(_0x386d26),
        getCurrentFlipState: () => _0x5dd052,
        applyFlipTransformToContext: (_0x501b66, _0x41883d, _0x92ce3f, _0x2da892) => this._applyFlipTransformToContext(_0x501b66, _0x41883d, _0x92ce3f, _0x2da892),
        createSelectionMaskCanvas: (_0x1f30f1, _0x2afa18, _0x3df78e, _0x4f5c71) => buildSelectionMaskCanvas({
          documentRef: document,
          commands: _0x48549e,
          naturalW: _0x1f30f1,
          naturalH: _0x2afa18,
          scaleX: _0x3df78e,
          scaleY: _0x4f5c71
        }),
        canvasWhiteColor: _0x4a7ff5,
        defaultTextColor: _0x44a274,
        fastDisplayExport: true
      });
      await saveAnnotateExportResult({
        blob: _0x298c6f,
        exportType: _0x2c978a,
        scene: _0x3d0b0c,
        sourceNodeId: _0xe0133c,
        baseNode: _0x1b70d2,
        targetNodeId: _0x155be5.newNodeId,
        startedAt: _0x3feb0a,
        notify: (_0x1a5d0b, _0x3c4ed4) => window.showToast?.(_0x1a5d0b, _0x3c4ed4),
        triggerLocalCacheSave: () => window._triggerLocalCacheSave?.()
      });
    } catch (_0x3f8891) {
      console.error("[Annotate] save failed:", _0x3f8891);
      markAnnotateExportNodeFailed({
        targetNodeId: _0x371ea2,
        error: _0x3f8891,
        startedAt: _0x4d80ee
      });
      window.showToast?.(imageAnnotateText("toasts.saveFailed"), "error");
    } finally {
      if (_0x44f331) {
        _0x44f331.textContent = _0x2e5e9f;
      }
      _0x5dc3a6.style.pointerEvents = "auto";
    }
  },
  _resolveNodeImageUrl(_0x1e0f57, _0x335e09 = {}) {
    return resolveImageNodeUrl(_0x1e0f57, _0x335e09);
  },
  _loadImage(_0x1f4894) {
    return new Promise((_0x4d743d, _0x30539d) => {
      const _0x253407 = new Image();
      _0x253407.crossOrigin = "anonymous";
      _0x253407.onload = () => _0x4d743d(_0x253407);
      _0x253407.onerror = () => _0x30539d(new Error(imageAnnotateText("errors.imageLoadFailed")));
      _0x253407.src = _0x1f4894;
    });
  }
};
export default ImageAnnotateController;