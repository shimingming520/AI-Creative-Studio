import a1442_0x24c8f4 from "../core/stores/appStore.js";
import { generateId } from "../core/math.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { commit } from "./history.js";
import { showProviderApiKeyMissingToast } from "./providerApiKeyMissingToast.js";
import { buildGenerateVideoRequest } from "../../api/aiVideoApi.js";
import { getShortcuts, handleShortcutKeydown } from "./shortcuts.js";
import { compositeCheckerMask, createEraseCheckerboardPattern, drawEraseMaskCommand, getEraseCanvasPalette } from "./eraseBrushRenderer.js";
import { clampImageBrushSize, drawRoundBrushStroke, getBrushLineWidth, syncCircularBrushCursor } from "./imageEditorBrushStyle.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide, getNodeDefaultSize } from "../services/fileService.js";
import { applyDebugWrenchIcon, formatFinalApiDebugRequest } from "../utils/debugRequestPreview.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { attachVideoKeyingPlaybackSource, renderVideoKeyingThumbs, setVideoKeyingMediaKeepAlive } from "./videoKeyingMediaHelpers.js";
import { buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { getVideoKeyingModelId } from "./videoKeyingManifestResolver.js";
import { RH_DEFAULT_INSTANCE_TYPE, RH_DEFAULT_KEYING_FPS, RH_DEFAULT_KEYING_MASK_MODE, RH_DEFAULT_KEYING_RESOLUTION, getRhKeyingFpsOptions, getRunningHubWorkflowAccess, hasUsableKeyingSettingValue, normalizeRhInstanceType, normalizeRhKeyingFps, normalizeRhKeyingResolution, resolveSourceVideoKeyingSetting } from "./videoKeyingSettings.js";
import { onLocaleChange } from "../i18n/index.js";
import { buildVideoKeyingOutputText, videoKeyingText } from "./videoKeyingTextHelpers.js";
import { videoKeyingLifecycleMethods } from "./videoKeyingLifecycleMethods.js";
import { measureVideoKeyingProjection } from "./videoKeyingProjection.js";
import { getVideoKeyingMaxSourceVideoMB, isVideoKeyingSourceVideoTooLarge } from "./videoKeyingSourceVideoLimit.js";
import { cancelVideoKeyingTaskForNode, getRunningVideoKeyingTaskForNode, runVideoKeyingTask } from "./videoKeyingTaskRuntime.js";
const REMOVE_POS_POINT_LIMIT = 3000;
const REMOVE_MASK_MAX_SIDE = 512;
const VideoKeyingController = {
  active: false,
  nodeId: null,
  wrapperEl: null,
  barEl: null,
  trackEl: null,
  playheadEl: null,
  cancelBtnEl: null,
  confirmBtnEl: null,
  thumbEls: null,
  videoEl: null,
  durationSec: 0,
  _thumbToken: 0,
  _sourceToken: 0,
  _playheadRaf: 0,
  _retryRaf: 0,
  _retryCount: 0,
  _onLoadedMeta: null,
  _onDurationChange: null,
  _onPointerMove: null,
  _onPointerUp: null,
  _onPointerCancel: null,
  _onKeyDown: null,
  _onDocClick: null,
  _hiddenEls: null,
  markLayerEl: null,
  markCanvasEl: null,
  removeMaskCanvasEl: null,
  removeCursorEl: null,
  _marks: null,
  _marksRedo: null,
  _removeDraft: null,
  _removeDrawPointerId: null,
  _removeCursorHover: false,
  _removeCursorLast: {
    x: 0,
    y: 0
  },
  _removeCursorRaf: 0,
  _removeWheelCleanup: null,
  _onMarkPointerDown: null,
  _onMarkPointerMove: null,
  _onMarkPointerUp: null,
  _onMarkPointerCancel: null,
  _onMarkPointerEnter: null,
  _onMarkPointerLeave: null,
  _onMarkWheel: null,
  _onVideoPlay: null,
  _renderMarksFn: null,
  _onResize: null,
  _onShortcutsUpdated: null,
  _onKeyingSettingsDocDown: null,
  _lastFrameIndex: null,
  _lastFrameIndexFps: null,
  helperRightEl: null,
  hintEl: null,
  removeToolbarEl: null,
  removeSizeValueEl: null,
  removeSizeRangeEl: null,
  uiMode: "keying",
  _removePointTool: "foreground",
  _removeBrushSizePx: 40,
  _lastHelperRightText: null,
  _lastConfirmEnabled: null,
  _unsubscribeLocale: null,
  isActiveFor(_0x3b724d) {
    return !!_0x3b724d && this.active === true && this.nodeId === _0x3b724d;
  },
  _isRemoveUiMode() {
    return this.uiMode === "remove";
  },
  _setRemovePointTool(_0xca09a5) {
    const _0x2d68f8 = _0xca09a5 === "background" ? "background" : "foreground";
    this._removePointTool = _0x2d68f8;
    if (this.removeToolbarEl) {
      const _0x3aec19 = _0x2d68f8 === "background" ? "eraser" : "brush";
      this.removeToolbarEl.querySelectorAll(".tool-btn").forEach(_0x26cd86 => {
        _0x26cd86.classList.toggle("active", _0x26cd86.dataset.tool === _0x3aec19);
      });
    }
    this._syncRemoveCursor();
  },
  _clampRemoveBrushSize(_0x55d405) {
    return clampImageBrushSize(_0x55d405, 40);
  },
  _getRemoveToolType() {
    if (this._removePointTool === "background") {
      return "eraser";
    } else {
      return "brush";
    }
  },
  _getShortcutText(_0x575415, _0x1182ed = "") {
    const _0x47d209 = getShortcuts?.();
    const _0x34c1f4 = _0x47d209?.[_0x575415]?.keys;
    if (!Array.isArray(_0x34c1f4) || _0x34c1f4.length === 0) {
      return _0x1182ed;
    }
    return _0x34c1f4.join("+");
  },
  _buildShortcutTooltip(_0x5c6f87, _0x357388, _0x2f2ab9 = "") {
    const _0x8d018c = this._getShortcutText(_0x357388, _0x2f2ab9);
    if (_0x8d018c) {
      return _0x5c6f87 + " " + _0x8d018c;
    } else {
      return _0x5c6f87;
    }
  },
  _syncRemoveBrushControls() {
    const _0x52cd94 = this._clampRemoveBrushSize(this._removeBrushSizePx);
    if (this.removeSizeRangeEl && Number(this.removeSizeRangeEl.value) !== _0x52cd94) {
      this.removeSizeRangeEl.value = String(_0x52cd94);
    }
    if (this.removeSizeValueEl) {
      this.removeSizeValueEl.textContent = String(_0x52cd94);
    }
  },
  _refreshRemoveShortcutUi() {
    if (!this._isRemoveUiMode()) {
      return;
    }
    if (this.removeToolbarEl) {
      const _0x45950b = [[".act-cancel", videoKeyingText("tools.cancel")], ["[data-tool=\"brush\"]", this._buildShortcutTooltip(videoKeyingText("tools.brush"), "editor-tool-brush", "B")], ["[data-tool=\"eraser\"]", this._buildShortcutTooltip(videoKeyingText("tools.eraser"), "editor-tool-eraser", "E")], [".act-undo", this._buildShortcutTooltip(videoKeyingText("tools.undo"), "undo", "Ctrl+Z")], [".act-redo", this._buildShortcutTooltip(videoKeyingText("tools.redo"), "redo", "Ctrl+Shift+Z")], [".act-clear", this._buildShortcutTooltip(videoKeyingText("tools.clear"), "editor-clear", "R")]];
      _0x45950b.forEach(([_0x157007, _0x1c89a6]) => {
        const _0x96140e = this.removeToolbarEl?.querySelector(_0x157007);
        if (!_0x96140e) {
          return;
        }
        _0x96140e.setAttribute("data-tooltip", _0x1c89a6);
        _0x96140e.title = _0x1c89a6;
      });
    }
    if (this.hintEl) {
      const _0x296f9e = [videoKeyingText("hint.removeTitle"), videoKeyingText("hint.shortcutPrefix"), this._getShortcutText("editor-tool-brush", "B"), videoKeyingText("tools.brush"), "  ", this._getShortcutText("editor-tool-eraser", "E"), videoKeyingText("tools.eraser"), "  ", this._getShortcutText("editor-clear", "R"), videoKeyingText("tools.clear"), "  ", this._getShortcutText("undo", "Ctrl+Z"), videoKeyingText("tools.undo"), "  ", this._getShortcutText("redo", "Ctrl+Shift+Z"), videoKeyingText("tools.redo"), videoKeyingText("hint.wheelBrushSize")];
      const _0xfa6876 = Array.from(this.hintEl.children);
      _0x296f9e.forEach((_0x185461, _0x530ef2) => {
        if (_0xfa6876[_0x530ef2]) {
          _0xfa6876[_0x530ef2].textContent = _0x185461;
        }
      });
    }
  },
  _refreshKeyingHintUi() {
    if (!this.hintEl || this._isRemoveUiMode()) {
      return;
    }
    const _0x34d51a = [videoKeyingText("hint.leftClick"), videoKeyingText("hint.selectTarget"), "  ", videoKeyingText("hint.rightClick"), videoKeyingText("hint.excludeTarget"), videoKeyingText("hint.shortcutPrefix"), this._getShortcutText("editor-clear", "R"), videoKeyingText("hint.clearAllPoints"), "  ", this._getShortcutText("undo", "Ctrl+Z"), videoKeyingText("tools.undo"), "  ", this._getShortcutText("redo", "Ctrl+Shift+Z"), videoKeyingText("tools.redo")];
    const _0x5c22ae = Array.from(this.hintEl.children);
    _0x34d51a.forEach((_0xdf5fe7, _0x8721e7) => {
      if (_0x5c22ae[_0x8721e7]) {
        _0x5c22ae[_0x8721e7].textContent = _0xdf5fe7;
      }
    });
  },
  _onRemoveCanvasWheel(_0x393985) {
    _0x393985.preventDefault();
    _0x393985.stopPropagation();
    if (!this.active || !this._isRemoveUiMode() || !this._removeCursorHover) {
      return;
    }
    const _0x88b9c6 = _0x393985.deltaY || 0;
    const _0x180edf = _0x88b9c6 < 0 ? 1 : -1;
    const _0x28a98c = this._clampRemoveBrushSize(this._removeBrushSizePx);
    const _0x24a1c3 = this._clampRemoveBrushSize(_0x28a98c + _0x180edf * 2);
    if (_0x24a1c3 === _0x28a98c) {
      return;
    }
    this._removeBrushSizePx = _0x24a1c3;
    this._syncRemoveBrushControls();
    this._syncRemoveCursor();
  },
  _measureProjection({
    videoEl = this.videoEl || this._getVideoEl(),
    layerEl = null
  } = {}) {
    return measureVideoKeyingProjection({
      videoElement: videoEl,
      layerElement: layerEl
    });
  },
  _scheduleRemoveCursor(_0x5674f8, _0x546ed1) {
    this._removeCursorLast = {
      x: Number(_0x5674f8) || 0,
      y: Number(_0x546ed1) || 0
    };
    if (this._removeCursorRaf) {
      return;
    }
    this._removeCursorRaf = requestAnimationFrame(() => {
      this._removeCursorRaf = 0;
      this._syncRemoveCursor();
    });
  },
  _syncRemoveCursor() {
    const _0x9d2de3 = this.markLayerEl;
    const _0x25e82e = this.removeCursorEl;
    if (!this._isRemoveUiMode() || !_0x9d2de3 || !_0x25e82e) {
      return;
    }
    const _0x2e5acf = () => syncCircularBrushCursor({
      cursorEl: _0x25e82e,
      canvasEl: _0x9d2de3,
      visible: false
    });
    if (!this._removeCursorHover) {
      _0x2e5acf();
      return;
    }
    const _0x405acf = this._measureProjection({
      layerEl: _0x9d2de3
    });
    const _0x2e1775 = _0x405acf?.video;
    const _0x318e80 = _0x405acf?.layer;
    const _0x239682 = _0x405acf?.pickClientPoint(this._removeCursorLast.x, this._removeCursorLast.y);
    const _0x55f687 = _0x239682 ? _0x405acf.normalizedToLayerPoint(_0x239682.nx, _0x239682.ny) : null;
    if (!_0x2e1775 || !_0x318e80 || !_0x239682 || !_0x55f687) {
      _0x2e5acf();
      return;
    }
    const _0x2e6191 = Number(_0x55f687?.x);
    const _0x5282fe = Number(_0x55f687?.y);
    if (!Number.isFinite(_0x2e6191) || !Number.isFinite(_0x5282fe) || _0x2e6191 < 0 || _0x5282fe < 0 || _0x2e6191 > _0x318e80.lw || _0x5282fe > _0x318e80.lh) {
      _0x2e5acf();
      return;
    }
    const _0x475e54 = this._clampRemoveBrushSize(this._removeBrushSizePx);
    syncCircularBrushCursor({
      cursorEl: _0x25e82e,
      canvasEl: _0x9d2de3,
      visible: true,
      tool: this._getRemoveToolType(),
      allowedTools: ["brush", "eraser"],
      sizePx: _0x475e54,
      cursorLast: {
        x: _0x2e6191,
        y: _0x5282fe
      },
      isEraseBrush: true
    });
  },
  _attachMarkLayerListeners() {
    const _0x25bf35 = this.markLayerEl;
    if (!_0x25bf35) {
      return;
    }
    if (this._onMarkPointerDown) {
      _0x25bf35.addEventListener("pointerdown", this._onMarkPointerDown);
    }
    if (this._onMarkPointerMove) {
      _0x25bf35.addEventListener("pointermove", this._onMarkPointerMove);
    }
    if (this._onMarkPointerUp) {
      _0x25bf35.addEventListener("pointerup", this._onMarkPointerUp);
    }
    if (this._onMarkPointerCancel) {
      _0x25bf35.addEventListener("pointercancel", this._onMarkPointerCancel);
    }
    if (this._onMarkPointerCancel) {
      _0x25bf35.addEventListener("lostpointercapture", this._onMarkPointerCancel);
    }
    if (this._onMarkPointerEnter) {
      _0x25bf35.addEventListener("pointerenter", this._onMarkPointerEnter);
    }
    if (this._onMarkPointerLeave) {
      _0x25bf35.addEventListener("pointerleave", this._onMarkPointerLeave);
    }
  },
  _detachMarkLayerListeners(_0x463a3c = this.markLayerEl) {
    if (!_0x463a3c) {
      return;
    }
    if (this._onMarkPointerDown) {
      _0x463a3c.removeEventListener("pointerdown", this._onMarkPointerDown);
    }
    if (this._onMarkPointerMove) {
      _0x463a3c.removeEventListener("pointermove", this._onMarkPointerMove);
    }
    if (this._onMarkPointerUp) {
      _0x463a3c.removeEventListener("pointerup", this._onMarkPointerUp);
    }
    if (this._onMarkPointerCancel) {
      _0x463a3c.removeEventListener("pointercancel", this._onMarkPointerCancel);
    }
    if (this._onMarkPointerCancel) {
      _0x463a3c.removeEventListener("lostpointercapture", this._onMarkPointerCancel);
    }
    if (this._onMarkPointerEnter) {
      _0x463a3c.removeEventListener("pointerenter", this._onMarkPointerEnter);
    }
    if (this._onMarkPointerLeave) {
      _0x463a3c.removeEventListener("pointerleave", this._onMarkPointerLeave);
    }
  },
  _collectRemovePosPoints(_0x410fd6 = REMOVE_POS_POINT_LIMIT) {
    const _0x1885fb = Array.isArray(this._marks) ? this._marks : [];
    const _0x191089 = _0x1885fb.filter(_0x4cdcd0 => _0x4cdcd0 && (_0x4cdcd0.type === "brush" || _0x4cdcd0.type === "eraser"));
    const _0x1c40fe = _0x191089.some(_0x2b3ddb => _0x2b3ddb.type === "brush");
    if (!_0x1c40fe) {
      return [];
    }
    const _0x643ca5 = Math.max(1, Math.trunc(Number(_0x410fd6) || REMOVE_POS_POINT_LIMIT));
    const _0x1a79b6 = this.videoEl || this._getVideoEl();
    const _0x5b37da = Math.max(1, Number(_0x1a79b6?.videoWidth) || Number(_0x1a79b6?.offsetWidth) || REMOVE_MASK_MAX_SIDE);
    const _0x4a6904 = Math.max(1, Number(_0x1a79b6?.videoHeight) || Number(_0x1a79b6?.offsetHeight) || REMOVE_MASK_MAX_SIDE);
    const _0x542db5 = Math.min(1, REMOVE_MASK_MAX_SIDE / Math.max(_0x5b37da, _0x4a6904));
    const _0x5191fd = Math.max(1, Math.round(_0x5b37da * _0x542db5));
    const _0x33b291 = Math.max(1, Math.round(_0x4a6904 * _0x542db5));
    const _0x3faa60 = document.createElement("canvas");
    _0x3faa60.width = _0x5191fd;
    _0x3faa60.height = _0x33b291;
    const _0x2a896e = _0x3faa60.getContext("2d", {
      willReadFrequently: true
    });
    if (!_0x2a896e) {
      return [];
    }
    const _0x310b5b = getEraseCanvasPalette();
    const _0x5805a4 = _0x5191fd / Math.max(1, Number(_0x1a79b6?.offsetWidth) || _0x5191fd);
    _0x191089.forEach(_0x36042e => {
      const _0x1ffe61 = Array.isArray(_0x36042e.points) ? _0x36042e.points : [];
      if (!_0x1ffe61.length) {
        return;
      }
      const _0x14e128 = _0x36042e.type === "eraser" ? "eraser" : "brush";
      const _0x65d232 = getBrushLineWidth(this._clampRemoveBrushSize(_0x36042e.brushSizePx), _0x5805a4, _0x14e128);
      const _0x548d55 = _0x1ffe61.map(_0x2da652 => ({
        x: Math.max(0, Math.min(1, Number(_0x2da652?.nx) || 0)) * (_0x5191fd - 1),
        y: Math.max(0, Math.min(1, Number(_0x2da652?.ny) || 0)) * (_0x33b291 - 1)
      }));
      _0x2a896e.save();
      const _0x370b0f = _0x14e128 === "eraser" ? _0x310b5b.eraseDark : _0x310b5b.brushLight;
      drawRoundBrushStroke(_0x2a896e, {
        points: _0x548d55,
        lineWidth: _0x65d232,
        strokeStyle: _0x370b0f,
        fillStyle: _0x370b0f,
        globalCompositeOperation: _0x14e128 === "eraser" ? "destination-out" : "source-over"
      });
      _0x2a896e.restore();
    });
    const _0x21b7b0 = _0x2a896e.getImageData(0, 0, _0x5191fd, _0x33b291).data;
    const _0x39e472 = [];
    const _0x516a0f = new Set();
    const _0x394400 = (_0x1c8592, _0x20eb82) => {
      const _0x35de72 = _0x5191fd > 1 ? _0x1c8592 / (_0x5191fd - 1) : 0;
      const _0x21447d = _0x33b291 > 1 ? _0x20eb82 / (_0x33b291 - 1) : 0;
      const _0x1d5d28 = Math.round(_0x35de72 * 4000) + ":" + Math.round(_0x21447d * 4000);
      if (_0x516a0f.has(_0x1d5d28)) {
        return;
      }
      _0x516a0f.add(_0x1d5d28);
      _0x39e472.push({
        x: _0x35de72,
        y: _0x21447d
      });
    };
    const _0x139946 = _0x40678d => {
      for (let _0x296bc4 = 0; _0x296bc4 < _0x33b291; _0x296bc4 += _0x40678d) {
        for (let _0x7a09a9 = 0; _0x7a09a9 < _0x5191fd; _0x7a09a9 += _0x40678d) {
          const _0x636a7b = (_0x296bc4 * _0x5191fd + _0x7a09a9) * 4;
          if (_0x21b7b0[_0x636a7b + 3] < 8) {
            continue;
          }
          _0x394400(_0x7a09a9, _0x296bc4);
          if (_0x39e472.length >= _0x643ca5) {
            return true;
          }
        }
      }
      return false;
    };
    const _0x1b5bfa = Math.max(1, Math.floor(Math.max(_0x5191fd, _0x33b291) / 220));
    const _0x539a73 = _0x139946(_0x1b5bfa);
    if (!_0x539a73 && _0x39e472.length < Math.min(_0x643ca5, 80) && _0x1b5bfa > 1) {
      _0x139946(1);
    }
    if (_0x39e472.length > _0x643ca5) {
      _0x39e472.length = _0x643ca5;
    }
    return _0x39e472;
  },
  _getKeyingMeta() {
    const _0x292e6c = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {};
    const {
      fps: _0x487df4,
      resolution: _0x5e854c
    } = this._getRhVideoSettings(_0x292e6c);
    const _0x45a16d = Math.max(1, Math.round((Number(this.durationSec) || 0) * _0x487df4) || 1);
    const _0x18d17a = this.videoEl || this._getVideoEl();
    const _0x2eb995 = Math.max(0, Math.min(Number(this.durationSec) || 0, Number(_0x18d17a?.currentTime) || 0));
    const _0x1e7925 = Math.min(_0x45a16d, Math.max(0, Math.round(_0x2eb995 * _0x487df4)));
    return {
      fps: _0x487df4,
      res: _0x5e854c,
      totalFrames: _0x45a16d,
      frameIndex: _0x1e7925
    };
  },
  _calcKeyingFrameSize(_0x166946, _0x780b32, _0x59f6f7) {
    const _0x39f928 = Math.max(0, Math.trunc(Number(_0x166946) || 0));
    const _0xfe5cd6 = Math.max(0, Math.trunc(Number(_0x780b32) || 0));
    const _0x4a91c0 = Math.max(0, Math.trunc(Number(_0x59f6f7) || 0));
    if (!_0x39f928 || !_0xfe5cd6 || !_0x4a91c0) {
      return {
        w: _0x39f928,
        h: _0xfe5cd6
      };
    }
    const _0x4bfa59 = Math.max(_0x39f928, _0xfe5cd6);
    const _0x255aae = _0x4a91c0 / _0x4bfa59;
    const _0x4be59d = Math.max(1, Math.round(_0x39f928 * _0x255aae));
    const _0x1529d5 = Math.max(1, Math.round(_0xfe5cd6 * _0x255aae));
    return {
      w: _0x4be59d,
      h: _0x1529d5
    };
  },
  _updateHelperRight() {
    if (!this.helperRightEl || !this.active) {
      return;
    }
    const {
      fps: _0x4755df,
      res: _0x24430c,
      frameIndex: _0x36aede
    } = this._getKeyingMeta();
    const _0x3c6a39 = videoKeyingText("helper.meta", {
      fps: _0x4755df,
      resolution: _0x24430c,
      frameIndex: _0x36aede
    });
    if (this._lastHelperRightText === _0x3c6a39) {
      return;
    }
    this._lastHelperRightText = _0x3c6a39;
    this.helperRightEl.textContent = _0x3c6a39;
  },
  _resolveSourceVideoValue(_0x2c098d = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {}) {
    return _0x2c098d.src || _0x2c098d.videoUrl || _0x2c098d.localPath || _0x2c098d.resultLocalPath || "";
  },
  _normalizeRhMaskMode(_0x58f1e9) {
    const _0x478c6a = String(_0x58f1e9 || "").trim();
    if (!_0x478c6a || _0x478c6a === "0") {
      return "Sec";
    }
    if (_0x478c6a === "1") {
      return "Sam3";
    }
    if (_0x478c6a === "2") {
      return "MA2";
    }
    const _0x1c37ea = _0x478c6a.toLowerCase();
    if (_0x1c37ea === "sam3") {
      return "Sam3";
    }
    if (_0x1c37ea === "ma2" || _0x1c37ea === "matanyone2") {
      return "MA2";
    }
    return "Sec";
  },
  _getRhVideoSettings(_0xc1b17 = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {}) {
    const _0x273eab = normalizeRhKeyingFps(resolveSourceVideoKeyingSetting(_0xc1b17, "rhVideoFps", RH_DEFAULT_KEYING_FPS));
    const _0x6448b1 = normalizeRhKeyingResolution(resolveSourceVideoKeyingSetting(_0xc1b17, "rhVideoResolution", RH_DEFAULT_KEYING_RESOLUTION));
    const _0x1199d1 = normalizeRhInstanceType(resolveSourceVideoKeyingSetting(_0xc1b17, "rhInstanceType", RH_DEFAULT_INSTANCE_TYPE));
    return {
      fps: _0x273eab,
      resolution: _0x6448b1,
      instanceType: _0x1199d1
    };
  },
  _getRhMaskMode(_0x599123 = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {}) {
    return this._normalizeRhMaskMode(resolveSourceVideoKeyingSetting(_0x599123, "rhMaskMode", RH_DEFAULT_KEYING_MASK_MODE));
  },
  _getSourceFrameCount(_0x3cf298, _0x36b11e) {
    const _0x5a922d = Number.isFinite(Number(_0x36b11e)) && Number(_0x36b11e) > 0 ? Number(_0x36b11e) : 24;
    const _0x2af1ad = Number(_0x3cf298?.videoFrameCount);
    const _0x1cd470 = Number(_0x3cf298?.videoFps);
    const _0x440eda = [Number(_0x3cf298?.videoDuration), Number(this.durationSec), Number(this.videoEl?.duration)];
    let _0x220bee = _0x440eda.find(_0x4791ef => Number.isFinite(_0x4791ef) && _0x4791ef > 0);
    if (!Number.isFinite(_0x220bee) && Number.isFinite(_0x2af1ad) && _0x2af1ad > 0 && Number.isFinite(_0x1cd470) && _0x1cd470 > 0) {
      _0x220bee = _0x2af1ad / _0x1cd470;
    }
    if (Number.isFinite(_0x220bee)) {
      return Math.max(1, Math.round(_0x220bee * _0x5a922d));
    }
    if (Number.isFinite(_0x2af1ad) && _0x2af1ad > 0) {
      return Math.max(1, Math.trunc(_0x2af1ad));
    }
    return Math.max(1, Math.trunc(Number(_0x3cf298?.rhVideoFrames) || _0x5a922d || 24));
  },
  _getRemoveMaskExportSize(_0x334b2d) {
    const _0x5b121a = this.videoEl || this._getVideoEl();
    const _0x559c27 = Math.max(1, Number(_0x5b121a?.videoWidth) || Number(_0x5b121a?.offsetWidth) || Number(_0x334b2d) || 1024);
    const _0x13a8a4 = Math.max(1, Number(_0x5b121a?.videoHeight) || Number(_0x5b121a?.offsetHeight) || Number(_0x334b2d) || 1024);
    const {
      w: _0x50282f,
      h: _0x5f5814
    } = this._calcKeyingFrameSize(_0x559c27, _0x13a8a4, _0x334b2d);
    return {
      videoEl: _0x5b121a,
      sourceW: _0x559c27,
      sourceH: _0x13a8a4,
      width: Math.max(1, _0x50282f || 1),
      height: Math.max(1, _0x5f5814 || 1)
    };
  },
  _exportRemoveMaskDataUrl(_0x3e98eb) {
    this._renderMarksFn?.();
    const {
      videoEl: _0x1f32d3,
      width: _0xd51024,
      height: _0x688c8f
    } = this._getRemoveMaskExportSize(_0x3e98eb);
    if (!_0xd51024 || !_0x688c8f) {
      throw new Error(videoKeyingText("errors.maskSizeInvalid"));
    }
    const _0x513611 = (Array.isArray(this._marks) ? this._marks : []).filter(_0x37ed2a => _0x37ed2a && (_0x37ed2a.type === "brush" || _0x37ed2a.type === "eraser"));
    const _0x1e3802 = _0x513611.some(_0x5be6eb => _0x5be6eb.type === "brush");
    if (!_0x1e3802) {
      throw new Error(videoKeyingText("errors.noBrush"));
    }
    const _0x1d64bf = document.createElement("canvas");
    _0x1d64bf.width = _0xd51024;
    _0x1d64bf.height = _0x688c8f;
    const _0x4f1d55 = _0x1d64bf.getContext("2d");
    if (!_0x4f1d55) {
      throw new Error(videoKeyingText("errors.maskCanvasUnavailable"));
    }
    const _0x2c8623 = getEraseCanvasPalette();
    _0x4f1d55.fillStyle = _0x2c8623.eraseDark;
    _0x4f1d55.fillRect(0, 0, _0xd51024, _0x688c8f);
    const _0x5ca67d = this.removeMaskCanvasEl;
    const _0x2de73b = this._measureProjection({
      videoEl: _0x1f32d3,
      layerEl: this.markLayerEl
    });
    const _0x20f3d1 = _0x2de73b?.getVideoRectInLayer();
    if (_0x5ca67d && _0x20f3d1 && _0x5ca67d.width > 0 && _0x5ca67d.height > 0) {
      const _0x1c9e01 = Math.max(0, Math.min(_0x5ca67d.width - 1, _0x20f3d1.x));
      const _0x3c58ac = Math.max(0, Math.min(_0x5ca67d.height - 1, _0x20f3d1.y));
      const _0x293c02 = Math.max(1, Math.min(_0x5ca67d.width - _0x1c9e01, _0x20f3d1.width));
      const _0x12ebbb = Math.max(1, Math.min(_0x5ca67d.height - _0x3c58ac, _0x20f3d1.height));
      _0x4f1d55.drawImage(_0x5ca67d, _0x1c9e01, _0x3c58ac, _0x293c02, _0x12ebbb, 0, 0, _0xd51024, _0x688c8f);
      return _0x1d64bf.toDataURL("image/png");
    }
    _0x513611.forEach(_0x5320d0 => {
      const _0x53f2d4 = Array.isArray(_0x5320d0.points) ? _0x5320d0.points : [];
      if (!_0x53f2d4.length) {
        return;
      }
      const _0x327c84 = _0x5320d0.type === "eraser" ? "eraser" : "brush";
      const _0x3bfe0f = _0x327c84 === "eraser" ? _0x2c8623.eraseDark : _0x2c8623.brushLight;
      const _0x573b7c = getBrushLineWidth(this._clampRemoveBrushSize(_0x5320d0.brushSizePx) * (_0xd51024 / Math.max(1, Number(_0x1f32d3?.offsetWidth) || _0xd51024)), 1, _0x327c84);
      const _0x28ef6c = _0x53f2d4.map(_0x20ee1b => ({
        x: Math.max(0, Math.min(1, Number(_0x20ee1b?.nx) || 0)) * (_0xd51024 - 1),
        y: Math.max(0, Math.min(1, Number(_0x20ee1b?.ny) || 0)) * (_0x688c8f - 1)
      }));
      _0x4f1d55.save();
      drawRoundBrushStroke(_0x4f1d55, {
        points: _0x28ef6c,
        lineWidth: _0x573b7c,
        strokeStyle: _0x3bfe0f,
        fillStyle: _0x3bfe0f
      });
      _0x4f1d55.restore();
    });
    return _0x1d64bf.toDataURL("image/png");
  },
  _updateConfirmEnabled() {
    if (!this.confirmBtnEl || !this.active) {
      return;
    }
    const _0x358eef = this.nodeId;
    const _0x821b50 = _0x358eef ? getRunningVideoKeyingTaskForNode(_0x358eef) : null;
    if (_0x821b50) {
      if (this.confirmBtnEl.disabled) {
        this.confirmBtnEl.disabled = false;
      }
      return;
    }
    const {
      pos_points: _0x2005fe,
      neg_points: _0x3c9210
    } = this.getPosNegPoints();
    const _0x23a72c = Array.isArray(_0x2005fe) ? _0x2005fe.length : 0;
    const _0x350e4b = Array.isArray(_0x3c9210) ? _0x3c9210.length : 0;
    const _0x45f003 = this._isRemoveUiMode() ? _0x23a72c > 0 : _0x23a72c > 0 && _0x350e4b < _0x23a72c;
    if (this._lastConfirmEnabled === _0x45f003) {
      return;
    }
    this._lastConfirmEnabled = _0x45f003;
    this.confirmBtnEl.disabled = !_0x45f003;
  },
  _cancelRhTaskForSourceNode(_0x44fe89, _0x2e537c = {}) {
    return cancelVideoKeyingTaskForNode(_0x44fe89, _0x2e537c);
  },
  getPosNegPoints() {
    if (this._isRemoveUiMode()) {
      const _0x527ba0 = this._collectRemovePosPoints(REMOVE_POS_POINT_LIMIT);
      return {
        pos_points: _0x527ba0,
        neg_points: []
      };
    }
    const _0x2a20bb = Array.isArray(this._marks) ? this._marks : [];
    const _0x205581 = [];
    const _0x4ac70f = [];
    for (const _0x30e5ff of _0x2a20bb) {
      if (!_0x30e5ff) {
        continue;
      }
      const _0x271f80 = Number(_0x30e5ff.nx);
      const _0x31fd15 = Number(_0x30e5ff.ny);
      if (!Number.isFinite(_0x271f80) || !Number.isFinite(_0x31fd15)) {
        continue;
      }
      const _0x1fd86d = {
        x: _0x271f80,
        y: _0x31fd15
      };
      if (_0x30e5ff.pointType === "background") {
        _0x4ac70f.push(_0x1fd86d);
      } else {
        _0x205581.push(_0x1fd86d);
      }
    }
    return {
      pos_points: _0x205581,
      neg_points: _0x4ac70f
    };
  },
  _syncPointsToStore() {
    const {
      pos_points: _0x800824,
      neg_points: _0x15fa39
    } = this.getPosNegPoints();
    a1442_0x24c8f4.setVideoKeyingState({
      pos_points: _0x800824,
      neg_points: _0x15fa39
    });
    this._updateConfirmEnabled();
  },
  _undoMark() {
    const _0x50a075 = Array.isArray(this._marks) ? this._marks : [];
    if (!_0x50a075.length) {
      return;
    }
    const _0xf80ce5 = Array.isArray(this._marksRedo) ? this._marksRedo : [];
    const _0x3648cb = _0x50a075.pop();
    _0xf80ce5.push(_0x3648cb);
    this._marks = _0x50a075;
    this._marksRedo = _0xf80ce5;
    this._renderMarksFn?.();
    this._syncPointsToStore();
  },
  _redoMark() {
    const _0x3fca4f = Array.isArray(this._marksRedo) ? this._marksRedo : [];
    if (!_0x3fca4f.length) {
      return;
    }
    const _0x14a370 = Array.isArray(this._marks) ? this._marks : [];
    const _0x3fd836 = _0x3fca4f.pop();
    _0x14a370.push(_0x3fd836);
    this._marks = _0x14a370;
    this._marksRedo = _0x3fca4f;
    this._renderMarksFn?.();
    this._syncPointsToStore();
  },
  _clearAllMarks() {
    this._marks = [];
    this._marksRedo = [];
    this._removeDraft = null;
    this._removeDrawPointerId = null;
    this._renderMarksFn?.();
    a1442_0x24c8f4.setVideoKeyingState({
      pos_points: [],
      neg_points: []
    });
    this._updateConfirmEnabled();
  },
  init(_0x5a3f8c, _0x2fd84a = {}) {
    if (!_0x5a3f8c) {
      return;
    }
    if (this.active) {
      this.exit({
        silent: true
      });
    }
    const _0x405c5f = a1442_0x24c8f4.getState().nodes[_0x5a3f8c];
    if (!_0x405c5f) {
      return;
    }
    this.uiMode = _0x2fd84a?.uiMode === "remove" ? "remove" : "keying";
    this._removePointTool = "foreground";
    this._removeBrushSizePx = 40;
    this._removeDraft = null;
    this._removeDrawPointerId = null;
    this._removeCursorHover = false;
    this._removeCursorLast = {
      x: 0,
      y: 0
    };
    if (this._removeCursorRaf) {
      cancelAnimationFrame(this._removeCursorRaf);
    }
    this._removeCursorRaf = 0;
    this.active = true;
    this.nodeId = _0x5a3f8c;
    this._marks = [];
    this._marksRedo = [];
    a1442_0x24c8f4.setVideoKeyingState({
      active: true,
      nodeId: _0x5a3f8c,
      pos_points: [],
      neg_points: []
    });
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    this._retryCount = 0;
    this._mountWhenReady();
  },
  _mountWhenReady() {
    const _0x4143fb = this.nodeId;
    const _0x4ea018 = () => {
      if (!this.active || this.nodeId !== _0x4143fb) {
        return;
      }
      const _0x13e99d = document.getElementById(_0x4143fb);
      if (!_0x13e99d) {
        this._retryCount++;
        if (this._retryCount > 10) {
          this.exit({
            silent: true
          });
          return;
        }
        this._retryRaf = requestAnimationFrame(_0x4ea018);
        return;
      }
      this.wrapperEl = _0x13e99d;
      this._applyFrozenUI(true);
      this._applyDimMode(true);
      try {
        window._spaceHeld = false;
        const _0x5c8f5e = document.getElementById("v2-wrap");
        if (_0x5c8f5e) {
          _0x5c8f5e.style.cursor = "";
        }
      } catch {}
      this._createUI();
      this._syncDurationAndDefaults();
      this._bindEvents();
      this._renderPlayhead();
    };
    this._retryRaf = requestAnimationFrame(_0x4ea018);
  },
  _applyDimMode(_0x3e2fcc) {
    const _0x5cc00c = document.getElementById("v2-wrap");
    if (_0x5cc00c) {
      if (_0x3e2fcc) {
        _0x5cc00c.classList.add("is-video-keying-mode");
      } else {
        _0x5cc00c.classList.remove("is-video-keying-mode");
      }
    }
    if (this.wrapperEl) {
      if (_0x3e2fcc) {
        this.wrapperEl.classList.add("is-video-keying-target");
      } else {
        this.wrapperEl.classList.remove("is-video-keying-target");
      }
    }
  },
  _applyFrozenUI(_0x9c73e) {
    if (!this.wrapperEl) {
      return;
    }
    const _0x3a9322 = "is-video-keying";
    if (_0x9c73e) {
      this.wrapperEl.classList.add(_0x3a9322);
    } else {
      this.wrapperEl.classList.remove(_0x3a9322);
    }
    this._applyFrozenOverlaysHidden(_0x9c73e);
  },
  _applyFrozenOverlaysHidden(_0xad1899) {
    if (!this.wrapperEl) {
      return;
    }
    if (_0xad1899) {
      if (Array.isArray(this._hiddenEls) && this._hiddenEls.length) {
        return;
      }
      const _0x48d479 = [".video-controls", ".video-mute-btn", ".node-upload-hint", ".video-center-indicator", ".gen-video-center-indicator", ".multi-toggle-btn"];
      const _0x4ac7bd = [];
      _0x48d479.forEach(_0x985a29 => {
        this.wrapperEl.querySelectorAll(_0x985a29).forEach(_0x1bc997 => {
          _0x4ac7bd.push({
            el: _0x1bc997,
            prevDisplay: _0x1bc997.style.display
          });
          _0x1bc997.style.display = "none";
        });
      });
      this._hiddenEls = _0x4ac7bd;
      return;
    }
    const _0x50f283 = Array.isArray(this._hiddenEls) ? this._hiddenEls : [];
    this._hiddenEls = null;
    _0x50f283.forEach(({
      el: _0x19c906,
      prevDisplay: _0x5f460e
    }) => {
      if (!_0x19c906 || !_0x19c906.isConnected) {
        return;
      }
      _0x19c906.style.display = _0x5f460e || "";
    });
  },
  _pauseAllWrapperVideos() {
    if (this.wrapperEl) {
      this.wrapperEl.querySelectorAll("video").forEach(_0x232696 => {
        try {
          if (!_0x232696.paused) {
            _0x232696.pause();
          }
        } catch {}
      });
    }
    if (this.videoEl) {
      try {
        if (!this.videoEl.paused) {
          this.videoEl.pause();
        }
      } catch {}
    }
  },
  _createRemoveToolbar() {
    const _0x57a884 = document.createElement("div");
    _0x57a884.className = "v2-video-keying-erasebar v2-annotate-toolbar";
    const _0x275b31 = this._buildShortcutTooltip(videoKeyingText("tools.brush"), "editor-tool-brush", "B");
    const _0x50483d = this._buildShortcutTooltip(videoKeyingText("tools.eraser"), "editor-tool-eraser", "E");
    const _0x496704 = this._buildShortcutTooltip(videoKeyingText("tools.undo"), "undo", "Ctrl+Z");
    const _0x312a51 = this._buildShortcutTooltip(videoKeyingText("tools.redo"), "redo", "Ctrl+Shift+Z");
    const _0x5402fb = this._buildShortcutTooltip(videoKeyingText("tools.clear"), "editor-clear", "R");
    _0x57a884.innerHTML = "\n      <button class=\"v2-annotate-btn icon-only act-cancel\" data-tooltip=\"" + videoKeyingText("tools.cancel") + "\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg></button>\n      <div class=\"v2-annotate-divider\"></div>\n      <button class=\"v2-annotate-btn icon-only tool-btn active\" data-tool=\"brush\" data-tooltip=\"" + _0x275b31 + "\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\"/></svg></button>\n      <button class=\"v2-annotate-btn icon-only tool-btn\" data-tool=\"eraser\" data-tooltip=\"" + _0x50483d + "\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M20 20H7l-5-5a2 2 0 0 1 0-2.83l9.17-9.17a2 2 0 0 1 2.83 0L22 10a2 2 0 0 1 0 2.83L14.83 20\"/></svg></button>\n      <div class=\"v2-annotate-size\"><span class=\"v2-annotate-size-value\"></span><input class=\"v2-annotate-size-range\" type=\"range\" min=\"1\" max=\"120\" step=\"1\"></div>\n      <div class=\"v2-annotate-divider\"></div>\n      <button class=\"v2-annotate-btn icon-only act-undo\" data-tooltip=\"" + _0x496704 + "\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M9 14l-4-4 4-4\"/><path d=\"M5 10h9a6 6 0 1 1 0 12h-3\"/></svg></button>\n      <button class=\"v2-annotate-btn icon-only act-redo\" data-tooltip=\"" + _0x312a51 + "\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M15 14l4-4-4-4\"/><path d=\"M19 10H10a6 6 0 1 0 0 12h3\"/></svg></button>\n      <button class=\"v2-annotate-btn icon-only act-clear\" data-tooltip=\"" + _0x5402fb + "\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M3 6h18\"/><path d=\"M8 6V4h8v2\"/><path d=\"M6 6l1 16h10l1-16\"/></svg></button>\n    ";
    this.removeSizeValueEl = _0x57a884.querySelector(".v2-annotate-size-value");
    this.removeSizeRangeEl = _0x57a884.querySelector(".v2-annotate-size-range");
    if (this.removeSizeRangeEl && this.removeSizeValueEl) {
      this._syncRemoveBrushControls();
      this.removeSizeRangeEl.addEventListener("input", _0x583e4c => {
        const _0x259ca7 = this._clampRemoveBrushSize(_0x583e4c.target.value);
        this._removeBrushSizePx = _0x259ca7;
        this._syncRemoveBrushControls();
        this._syncRemoveCursor();
      });
    }
    _0x57a884.addEventListener("pointerdown", _0x279c2a => _0x279c2a.stopPropagation());
    _0x57a884.querySelector(".act-cancel")?.addEventListener("click", _0x45e1e1 => {
      _0x45e1e1.stopPropagation();
      this.exit();
    });
    _0x57a884.querySelector("[data-tool=\"brush\"]")?.addEventListener("click", _0x17c20c => {
      _0x17c20c.stopPropagation();
      this._setRemovePointTool("foreground");
    });
    _0x57a884.querySelector("[data-tool=\"eraser\"]")?.addEventListener("click", _0x580dd5 => {
      _0x580dd5.stopPropagation();
      this._setRemovePointTool("background");
    });
    _0x57a884.querySelector(".act-undo")?.addEventListener("click", _0x2bc8da => {
      _0x2bc8da.stopPropagation();
      this._undoMark();
    });
    _0x57a884.querySelector(".act-redo")?.addEventListener("click", _0x1605ea => {
      _0x1605ea.stopPropagation();
      this._redoMark();
    });
    _0x57a884.querySelector(".act-clear")?.addEventListener("click", _0x235b6f => {
      _0x235b6f.stopPropagation();
      this._clearAllMarks();
      window.showToast?.(videoKeyingText("toasts.clearedPoints"), "info");
    });
    return _0x57a884;
  },
  _createUI() {
    if (!this.wrapperEl) {
      return;
    }
    this.wrapperEl.querySelectorAll(".v2-video-keyingbar,.v2-video-keyinghint,.v2-video-keying-erasebar").forEach(_0x25ea87 => _0x25ea87.remove());
    const _0x3f9344 = document.createElement("div");
    _0x3f9344.className = "v2-video-keyingbar";
    const _0x575096 = document.createElement("button");
    _0x575096.type = "button";
    _0x575096.className = "v2-video-clipbtn cancel";
    _0x575096.title = videoKeyingText("tools.cancel");
    {
      const _0x5635dc = "http://www.w3.org/2000/svg";
      const _0x4752df = document.createElementNS(_0x5635dc, "svg");
      _0x4752df.setAttribute("width", "20");
      _0x4752df.setAttribute("height", "20");
      _0x4752df.setAttribute("viewBox", "0 0 24 24");
      _0x4752df.setAttribute("fill", "none");
      _0x4752df.setAttribute("stroke", "currentColor");
      _0x4752df.setAttribute("stroke-width", "2");
      const _0x33c578 = document.createElementNS(_0x5635dc, "path");
      _0x33c578.setAttribute("d", "M18 6L6 18");
      const _0x22f95d = document.createElementNS(_0x5635dc, "path");
      _0x22f95d.setAttribute("d", "M6 6l12 12");
      _0x4752df.appendChild(_0x33c578);
      _0x4752df.appendChild(_0x22f95d);
      _0x575096.appendChild(_0x4752df);
    }
    const _0x6fe6cb = document.createElement("button");
    _0x6fe6cb.type = "button";
    _0x6fe6cb.className = "prompt-submit img-gen-btn";
    _0x6fe6cb.title = this._isRemoveUiMode() ? videoKeyingText("tools.remove") : videoKeyingText("tools.keying");
    {
      const _0x1941d8 = "http://www.w3.org/2000/svg";
      const _0xc710ae = document.createElementNS(_0x1941d8, "svg");
      _0xc710ae.setAttribute("width", "14");
      _0xc710ae.setAttribute("height", "14");
      _0xc710ae.setAttribute("viewBox", "0 0 24 24");
      _0xc710ae.setAttribute("fill", "none");
      _0xc710ae.setAttribute("stroke", "currentColor");
      _0xc710ae.setAttribute("stroke-width", "2");
      const _0x383656 = document.createElementNS(_0x1941d8, "line");
      _0x383656.setAttribute("x1", "12");
      _0x383656.setAttribute("y1", "19");
      _0x383656.setAttribute("x2", "12");
      _0x383656.setAttribute("y2", "5");
      const _0x557659 = document.createElementNS(_0x1941d8, "polyline");
      _0x557659.setAttribute("points", "5 12 12 5 19 12");
      _0xc710ae.appendChild(_0x383656);
      _0xc710ae.appendChild(_0x557659);
      _0x6fe6cb.appendChild(_0xc710ae);
    }
    const _0xa92d02 = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {};
    const {
      fps: _0x5cf0f8,
      resolution: _0x10035b,
      instanceType: _0x38d865
    } = this._getRhVideoSettings(_0xa92d02);
    const _0x26df9e = this._getRhMaskMode(_0xa92d02);
    const _0x5da6b9 = {};
    if (!hasUsableKeyingSettingValue(_0xa92d02.rhVideoFps)) {
      _0x5da6b9.rhVideoFps = _0x5cf0f8;
    }
    if (!hasUsableKeyingSettingValue(_0xa92d02.rhVideoResolution)) {
      _0x5da6b9.rhVideoResolution = _0x10035b;
    }
    if (!hasUsableKeyingSettingValue(_0xa92d02.rhMaskMode)) {
      _0x5da6b9.rhMaskMode = _0x26df9e;
    }
    if (!hasUsableKeyingSettingValue(_0xa92d02.rhInstanceType)) {
      _0x5da6b9.rhInstanceType = _0x38d865;
    }
    if (Object.keys(_0x5da6b9).length) {
      try {
        a1442_0x24c8f4.updateNodeData(this.nodeId, _0x5da6b9);
      } catch {}
    }
    let _0x5b69c1 = document.createElement("div");
    _0x5b69c1.className = "rh-keying-settings-wrap";
    const _0x4cca3f = document.createElement("button");
    _0x4cca3f.type = "button";
    _0x4cca3f.className = "v2-video-clipbtn cancel rh-keying-settings-btn";
    _0x4cca3f.title = videoKeyingText("tools.settings");
    {
      const _0x5dbf05 = "http://www.w3.org/2000/svg";
      const _0x5759a4 = document.createElementNS(_0x5dbf05, "svg");
      _0x5759a4.setAttribute("width", "20");
      _0x5759a4.setAttribute("height", "20");
      _0x5759a4.setAttribute("viewBox", "0 0 24 24");
      _0x5759a4.setAttribute("fill", "none");
      _0x5759a4.setAttribute("stroke", "currentColor");
      _0x5759a4.setAttribute("stroke-width", "2");
      const _0x1a88f0 = document.createElementNS(_0x5dbf05, "path");
      _0x1a88f0.setAttribute("d", "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z");
      const _0x19c60a = document.createElementNS(_0x5dbf05, "path");
      _0x19c60a.setAttribute("d", "M19.4 15a1.7 1.7 0 0 0 .33 1.87l.06.06a2 2 0 0 1-1.42 3.42h-.2a2 2 0 0 1-1.41-.59l-.06-.06a1.7 1.7 0 0 0-1.87-.33 1.7 1.7 0 0 0-1.03 1.54V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.54 1.7 1.7 0 0 0-1.87.33l-.06.06a2 2 0 0 1-1.41.59h-.2a2 2 0 0 1-1.42-3.42l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.54-1.03H3a2 2 0 0 1 0-4h.06A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.33-1.87l-.06-.06A2 2 0 0 1 5.63 3.65h.2a2 2 0 0 1 1.41.59l.06.06A1.7 1.7 0 0 0 9.17 4.6a1.7 1.7 0 0 0 1.03-1.54V3a2 2 0 0 1 4 0v.06a1.7 1.7 0 0 0 1.03 1.54 1.7 1.7 0 0 0 1.87-.33l.06-.06a2 2 0 0 1 1.41-.59h.2A2 2 0 0 1 20.79 7.07l-.06.06A1.7 1.7 0 0 0 20.4 9c.32.55.86.92 1.54 1.03H22a2 2 0 0 1 0 4h-.06A1.7 1.7 0 0 0 19.4 15z");
      _0x5759a4.appendChild(_0x19c60a);
      _0x5759a4.appendChild(_0x1a88f0);
      _0x4cca3f.appendChild(_0x5759a4);
    }
    const _0x105a65 = document.createElement("div");
    _0x105a65.className = "rh-keying-settings-menu";
    _0x105a65.setAttribute("role", "menu");
    {
      const _0x5c8125 = document.createElement("div");
      _0x5c8125.className = "rh-keying-settings-head";
      const _0x3db66b = document.createElement("span");
      _0x3db66b.className = "rh-keying-settings-title";
      _0x3db66b.textContent = videoKeyingText("settings.title");
      _0x5c8125.appendChild(_0x3db66b);
      _0x105a65.appendChild(_0x5c8125);
    }
    {
      const _0xcdd83 = document.createElement("div");
      _0xcdd83.className = "img-rp-quality-area";
      const _0xf726dc = document.createElement("div");
      _0xf726dc.className = "img-rp-section-label";
      const _0x272e7d = document.createElement("span");
      _0x272e7d.className = "rh-keying-label-resolution";
      _0x272e7d.textContent = videoKeyingText("settings.resolution");
      const _0x3994f3 = document.createElement("span");
      _0x3994f3.className = "rh-tip rh-keying-tip-resolution";
      _0x3994f3.setAttribute("data-tooltip", videoKeyingText("settings.resolutionTip"));
      _0x3994f3.textContent = "!";
      _0xf726dc.appendChild(_0x272e7d);
      _0xf726dc.appendChild(_0x3994f3);
      const _0x23b200 = document.createElement("div");
      _0x23b200.className = "img-rp-quality-segmented";
      [832, 1024, 1280, 1440, 1600, 1760, 1920].forEach(_0x1ff313 => {
        const _0x413d35 = document.createElement("button");
        _0x413d35.type = "button";
        const _0x2d96fc = Number(_0x1ff313) > 1440;
        _0x413d35.className = ("img-rp-quality-item " + (_0x2d96fc ? "dev-mode-only" : "") + " rh-keying-res-btn " + (Number(_0x10035b) === Number(_0x1ff313) ? "active" : "")).trim();
        _0x413d35.dataset.value = String(_0x1ff313);
        _0x413d35.textContent = String(_0x1ff313);
        _0x23b200.appendChild(_0x413d35);
      });
      _0xcdd83.appendChild(_0xf726dc);
      _0xcdd83.appendChild(_0x23b200);
      _0x105a65.appendChild(_0xcdd83);
    }
    {
      const _0x526625 = document.createElement("div");
      _0x526625.className = "rh-vram-adv-row";
      const _0x1a358b = document.createElement("div");
      _0x1a358b.className = "rh-vram-adv-label";
      const _0x419036 = document.createElement("span");
      _0x419036.className = "rh-keying-label-fps";
      _0x419036.textContent = videoKeyingText("settings.fps");
      const _0x5cb9c6 = document.createElement("span");
      _0x5cb9c6.className = "rh-tip rh-keying-tip-fps";
      _0x5cb9c6.setAttribute("data-tooltip", videoKeyingText("settings.fpsTip"));
      _0x5cb9c6.textContent = "!";
      _0x1a358b.appendChild(_0x419036);
      _0x1a358b.appendChild(_0x5cb9c6);
      const _0x2387de = document.createElement("div");
      _0x2387de.className = "img-rp-quality-segmented rh-adv-seg rh-v5-fps-seg";
      getRhKeyingFpsOptions().forEach(_0x423b5b => {
        const _0x143d1e = document.createElement("button");
        _0x143d1e.type = "button";
        _0x143d1e.className = ("img-rp-quality-item rh-keying-fps-btn " + (Number(_0x5cf0f8) === Number(_0x423b5b) ? "active" : "")).trim();
        _0x143d1e.dataset.value = String(_0x423b5b);
        _0x143d1e.textContent = videoKeyingText("settings.fpsValue", {
          fps: _0x423b5b
        });
        _0x2387de.appendChild(_0x143d1e);
      });
      _0x526625.appendChild(_0x1a358b);
      _0x526625.appendChild(_0x2387de);
      _0x105a65.appendChild(_0x526625);
    }
    if (!this._isRemoveUiMode()) {
      const _0x3904cc = document.createElement("div");
      _0x3904cc.className = "rh-vram-adv-row";
      const _0x252d1b = document.createElement("div");
      _0x252d1b.className = "rh-vram-adv-label";
      const _0x32f6db = document.createElement("span");
      _0x32f6db.className = "rh-keying-label-mask-mode";
      _0x32f6db.textContent = videoKeyingText("settings.maskMode");
      const _0x1659b4 = document.createElement("span");
      _0x1659b4.className = "rh-tip rh-keying-tip-mask-mode";
      _0x1659b4.setAttribute("data-tooltip", videoKeyingText("settings.maskModeTip"));
      _0x1659b4.textContent = "!";
      _0x252d1b.appendChild(_0x32f6db);
      _0x252d1b.appendChild(_0x1659b4);
      const _0x27c33b = document.createElement("div");
      _0x27c33b.className = "img-rp-quality-segmented rh-adv-seg rh-keying-maskmode-seg";
      [["Sec", "Sec"], ["Sam3", "Sam3"], ["MA2", "MA2"]].forEach(([_0x32e938, _0x1413ea]) => {
        const _0x4970ca = document.createElement("button");
        _0x4970ca.type = "button";
        _0x4970ca.className = ("img-rp-quality-item rh-keying-maskmode-btn " + (_0x26df9e === _0x32e938 ? "active" : "")).trim();
        _0x4970ca.dataset.value = _0x32e938;
        _0x4970ca.textContent = _0x1413ea;
        _0x27c33b.appendChild(_0x4970ca);
      });
      _0x3904cc.appendChild(_0x252d1b);
      _0x3904cc.appendChild(_0x27c33b);
      _0x105a65.appendChild(_0x3904cc);
    }
    {
      const _0x4671ce = document.createElement("div");
      _0x4671ce.className = "rh-vram-adv-row";
      const _0x117eae = document.createElement("div");
      _0x117eae.className = "rh-vram-adv-label";
      const _0x474940 = document.createElement("span");
      _0x474940.className = "rh-keying-label-vram";
      _0x474940.textContent = videoKeyingText("settings.vram");
      const _0xdaacdc = document.createElement("span");
      _0xdaacdc.className = "rh-tip rh-keying-tip-vram";
      _0xdaacdc.setAttribute("data-tooltip", videoKeyingText("settings.vramTip"));
      _0xdaacdc.textContent = "!";
      _0x117eae.appendChild(_0x474940);
      _0x117eae.appendChild(_0xdaacdc);
      const _0x5caba9 = document.createElement("div");
      _0x5caba9.className = "img-rp-quality-segmented rh-adv-seg rh-keying-vram-seg";
      [["default", "24G"], ["plus", "48G"]].forEach(([_0x52f0f7, _0x929653]) => {
        const _0x2d8315 = document.createElement("button");
        _0x2d8315.type = "button";
        _0x2d8315.className = ("img-rp-quality-item rh-keying-vram-btn " + (_0x38d865 === _0x52f0f7 ? "active" : "")).trim();
        _0x2d8315.dataset.value = _0x52f0f7;
        _0x2d8315.textContent = _0x929653;
        _0x5caba9.appendChild(_0x2d8315);
      });
      _0x4671ce.appendChild(_0x117eae);
      _0x4671ce.appendChild(_0x5caba9);
      _0x105a65.appendChild(_0x4671ce);
    }
    _0x5b69c1.appendChild(_0x4cca3f);
    _0x5b69c1.appendChild(_0x105a65);
    const _0x3bba65 = document.createElement("button");
    _0x3bba65.type = "button";
    _0x3bba65.className = "v2-video-clipbtn cancel debug-wrench-btn rh-keying-debug-btn";
    _0x3bba65.title = videoKeyingText("settings.debugParams");
    applyDebugWrenchIcon(_0x3bba65);
    const _0x1997da = document.createElement("div");
    _0x1997da.className = "v2-video-keyingrow";
    const _0x5d1f24 = document.createElement("div");
    _0x5d1f24.className = "v2-video-keyingtrack";
    const _0x4f2338 = document.createElement("div");
    _0x4f2338.className = "v2-video-keyingticks";
    const _0x4667a8 = document.createElement("div");
    _0x4667a8.className = "v2-video-keyingthumbs";
    const _0x53c2b3 = [];
    for (let _0x12bcf3 = 0; _0x12bcf3 < 10; _0x12bcf3++) {
      const _0x5b89fc = document.createElement("div");
      _0x5b89fc.className = "v2-video-keyingthumb";
      _0x4667a8.appendChild(_0x5b89fc);
      _0x53c2b3.push(_0x5b89fc);
    }
    const _0x54b54f = document.createElement("div");
    _0x54b54f.className = "v2-video-keyingplayhead";
    _0x5d1f24.appendChild(_0x4667a8);
    _0x5d1f24.appendChild(_0x54b54f);
    _0x5d1f24.appendChild(_0x4f2338);
    const _0x25d65b = this._isRemoveUiMode();
    _0x1997da.appendChild(_0x575096);
    _0x1997da.appendChild(_0x5d1f24);
    if (_0x5b69c1) {
      _0x1997da.appendChild(_0x5b69c1);
    }
    if (_0x3bba65) {
      _0x1997da.appendChild(_0x3bba65);
    }
    _0x1997da.appendChild(_0x6fe6cb);
    const _0x32bb74 = document.createElement("div");
    _0x32bb74.className = "v2-video-keyinghelper-row";
    const _0x564f98 = document.createElement("div");
    _0x564f98.className = "v2-video-keyinghelper-right";
    _0x32bb74.appendChild(_0x564f98);
    let _0x541fc0 = null;
    let _0x27cd4a = null;
    if (_0x25d65b) {
      _0x27cd4a = this._createRemoveToolbar();
    } else {
      _0x541fc0 = document.createElement("div");
      _0x541fc0.className = "v2-video-keyinghint";
      const _0x3fd0cc = (_0x5a43b8, _0x3b381c) => {
        const _0x1ee1e6 = document.createElement("span");
        if (_0x3b381c) {
          _0x1ee1e6.className = _0x3b381c;
        }
        _0x1ee1e6.textContent = _0x5a43b8;
        return _0x1ee1e6;
      };
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("hint.leftClick")));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("hint.selectTarget"), "v2-video-keyinghint--pos"));
      _0x541fc0.appendChild(_0x3fd0cc("  "));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("hint.rightClick")));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("hint.excludeTarget"), "v2-video-keyinghint--neg"));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("hint.shortcutPrefix")));
      _0x541fc0.appendChild(_0x3fd0cc(this._getShortcutText("editor-clear", "R"), "v2-video-keyinghint-kbd"));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("hint.clearAllPoints")));
      _0x541fc0.appendChild(_0x3fd0cc("  "));
      _0x541fc0.appendChild(_0x3fd0cc(this._getShortcutText("undo", "Ctrl+Z"), "v2-video-keyinghint-kbd"));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("tools.undo")));
      _0x541fc0.appendChild(_0x3fd0cc("  "));
      _0x541fc0.appendChild(_0x3fd0cc(this._getShortcutText("redo", "Ctrl+Shift+Z"), "v2-video-keyinghint-kbd"));
      _0x541fc0.appendChild(_0x3fd0cc(videoKeyingText("tools.redo")));
    }
    _0x3f9344.appendChild(_0x1997da);
    _0x3f9344.appendChild(_0x32bb74);
    if (_0x27cd4a) {
      this.wrapperEl.appendChild(_0x27cd4a);
    }
    this.wrapperEl.appendChild(_0x3f9344);
    if (_0x541fc0) {
      this.wrapperEl.appendChild(_0x541fc0);
    }
    this.barEl = _0x3f9344;
    this.hintEl = _0x541fc0;
    this.removeToolbarEl = _0x27cd4a;
    this._setRemovePointTool(this._removePointTool);
    this.cancelBtnEl = _0x575096;
    this.confirmBtnEl = _0x6fe6cb;
    this.trackEl = _0x5d1f24;
    this.playheadEl = _0x54b54f;
    this.thumbEls = _0x53c2b3;
    this.helperRightEl = _0x564f98;
    this._syncLocaleTexts();
    this._updateHelperRight();
    this._updateConfirmEnabled();
  },
  _syncLocaleTexts() {
    if (this.cancelBtnEl) {
      this.cancelBtnEl.title = videoKeyingText("tools.cancel");
    }
    if (this.confirmBtnEl) {
      this.confirmBtnEl.title = this._isRemoveUiMode() ? videoKeyingText("tools.remove") : videoKeyingText("tools.keying");
    }
    this.barEl?.querySelectorAll(".rh-keying-settings-btn").forEach(_0x1f0a86 => {
      _0x1f0a86.title = videoKeyingText("tools.settings");
    });
    this.barEl?.querySelectorAll(".rh-keying-debug-btn").forEach(_0x222ac4 => {
      _0x222ac4.title = videoKeyingText("settings.debugParams");
    });
    const _0x3b6690 = (_0x2ff0f5, _0x538830) => {
      this.barEl?.querySelectorAll(_0x2ff0f5).forEach(_0x7c4a1c => {
        _0x7c4a1c.textContent = _0x538830;
      });
    };
    const _0x101942 = (_0x2274c5, _0x3bdc1e) => {
      this.barEl?.querySelectorAll(_0x2274c5).forEach(_0x501b94 => {
        _0x501b94.setAttribute("data-tooltip", _0x3bdc1e);
        _0x501b94.title = _0x3bdc1e;
      });
    };
    _0x3b6690(".rh-keying-settings-title", videoKeyingText("settings.title"));
    _0x3b6690(".rh-keying-label-resolution", videoKeyingText("settings.resolution"));
    _0x101942(".rh-keying-tip-resolution", videoKeyingText("settings.resolutionTip"));
    _0x3b6690(".rh-keying-label-fps", videoKeyingText("settings.fps"));
    _0x101942(".rh-keying-tip-fps", videoKeyingText("settings.fpsTip"));
    _0x3b6690(".rh-keying-label-mask-mode", videoKeyingText("settings.maskMode"));
    _0x101942(".rh-keying-tip-mask-mode", videoKeyingText("settings.maskModeTip"));
    _0x3b6690(".rh-keying-label-vram", videoKeyingText("settings.vram"));
    _0x101942(".rh-keying-tip-vram", videoKeyingText("settings.vramTip"));
    this.barEl?.querySelectorAll(".rh-keying-fps-btn").forEach(_0x317fbf => {
      _0x317fbf.textContent = videoKeyingText("settings.fpsValue", {
        fps: _0x317fbf.dataset.value
      });
    });
    this._refreshRemoveShortcutUi();
    this._refreshKeyingHintUi();
    this._lastHelperRightText = null;
    this._updateHelperRight();
  },
  _ensureMarkLayer() {
    if (!this.wrapperEl) {
      return;
    }
    const _0x1ccc41 = this.videoEl || this._getVideoEl();
    if (!_0x1ccc41) {
      return;
    }
    const _0x8e6944 = _0x1ccc41.closest(".node-card") || _0x1ccc41.parentElement || null;
    if (!_0x8e6944) {
      return;
    }
    this._detachMarkLayerListeners(this.markLayerEl);
    if (this.markLayerEl && this.markLayerEl.isConnected) {
      this.markLayerEl.remove();
    }
    this.wrapperEl.querySelectorAll(".v2-video-keying-marklayer").forEach(_0x3b1af8 => _0x3b1af8.remove());
    const _0x5af5fc = document.createElement("div");
    _0x5af5fc.className = "v2-video-keying-marklayer";
    if (this._isRemoveUiMode()) {
      _0x5af5fc.classList.add("is-remove-mode");
    }
    _0x5af5fc.addEventListener("pointerdown", _0x48ddd4 => {
      _0x48ddd4.preventDefault();
      _0x48ddd4.stopPropagation();
    });
    _0x5af5fc.addEventListener("click", _0x18f0ae => {
      _0x18f0ae.preventDefault();
      _0x18f0ae.stopPropagation();
    });
    _0x5af5fc.addEventListener("dblclick", _0x1eb343 => {
      _0x1eb343.preventDefault();
      _0x1eb343.stopPropagation();
    });
    _0x5af5fc.addEventListener("contextmenu", _0x5dbef6 => {
      _0x5dbef6.preventDefault();
      _0x5dbef6.stopPropagation();
    });
    if (this._isRemoveUiMode()) {
      const _0x5904b4 = document.createElement("canvas");
      _0x5904b4.className = "v2-video-keying-paintcanvas";
      _0x5af5fc.appendChild(_0x5904b4);
      this.markCanvasEl = _0x5904b4;
      this.removeMaskCanvasEl = document.createElement("canvas");
      const _0x5670a2 = document.createElement("div");
      _0x5670a2.className = "v2-annotate-cursor v2-video-keying-cursor";
      _0x5670a2.style.display = "none";
      _0x5af5fc.appendChild(_0x5670a2);
      this.removeCursorEl = _0x5670a2;
      this._removeCursorHover = false;
    } else {
      this.markCanvasEl = null;
      this.removeMaskCanvasEl = null;
      this.removeCursorEl = null;
      this._removeCursorHover = false;
    }
    _0x8e6944.appendChild(_0x5af5fc);
    this.markLayerEl = _0x5af5fc;
    this._attachMarkLayerListeners();
    if (this._isRemoveUiMode()) {
      this._onMarkWheel = _0x2be276 => this._onRemoveCanvasWheel(_0x2be276);
      _0x5af5fc.addEventListener("wheel", this._onMarkWheel, {
        passive: false
      });
      this._removeWheelCleanup = () => {
        if (this._onMarkWheel) {
          _0x5af5fc.removeEventListener("wheel", this._onMarkWheel);
        }
      };
    } else {
      this._removeWheelCleanup = null;
      this._onMarkWheel = null;
    }
    this._syncRemoveCursor();
    if (!Array.isArray(this._marks)) {
      this._marks = [];
    }
  },
  _bindEvents() {
    if (!this.barEl) {
      return;
    }
    this.cancelBtnEl?.addEventListener("click", _0x2010db => {
      _0x2010db.stopPropagation();
      this.exit();
    });
    this.confirmBtnEl?.addEventListener("click", async _0x315061 => {
      _0x315061.preventDefault();
      _0x315061.stopPropagation();
      if (!this.active || !this.nodeId) {
        return;
      }
      const _0x57f38e = this.nodeId;
      if (getRunningVideoKeyingTaskForNode(_0x57f38e)) {
        await this._cancelRhTaskForSourceNode(_0x57f38e, {
          notify: true
        });
        return;
      }
      const _0x58c220 = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {};
      const _0x1e3e96 = this.videoEl || this._getVideoEl();
      const _0x5d8bf4 = Number(_0x1e3e96?.videoWidth) || 0;
      const _0x2c242f = Number(_0x1e3e96?.videoHeight) || 0;
      const _0x5c2d76 = Number(_0x1e3e96?.currentTime) || 0;
      const {
        fps: _0x11344c,
        resolution: _0x21e9d7,
        instanceType: _0x52da3
      } = this._getRhVideoSettings(_0x58c220);
      const _0xd872be = this._getRhMaskMode(_0x58c220);
      const _0x58bc49 = this._getSourceFrameCount(_0x58c220, _0x11344c);
      const {
        pos_points: _0x4f32ba,
        neg_points: _0xb7009e
      } = this.getPosNegPoints();
      const {
        w: _0x2bae1f,
        h: _0x41cf30
      } = this._calcKeyingFrameSize(_0x5d8bf4, _0x2c242f, _0x21e9d7);
      const _0x3bb936 = (_0x262d40, _0x16f856, _0x1116f1) => Math.max(_0x16f856, Math.min(_0x1116f1, _0x262d40));
      const _0x33746f = _0x423c97 => ({
        x: Math.round(_0x3bb936(_0x423c97.x * _0x2bae1f, 0, Math.max(0, _0x2bae1f - 1))),
        y: Math.round(_0x3bb936(_0x423c97.y * _0x41cf30, 0, Math.max(0, _0x41cf30 - 1)))
      });
      const _0x160c7b = _0x2bae1f > 0 && _0x41cf30 > 0 ? _0x4f32ba.map(_0x33746f) : [];
      const _0x5655f8 = _0x2bae1f > 0 && _0x41cf30 > 0 ? _0xb7009e.map(_0x33746f) : [];
      const _0x4add1e = _0x160c7b.length ? JSON.stringify(_0x160c7b) : "";
      const _0xc62e46 = _0x5655f8.length ? JSON.stringify(_0x5655f8) : "";
      const _0x341af2 = _0x4add1e;
      const _0xf65e2a = _0xc62e46;
      const _0xc744ca = Math.max(0, Math.round(_0x5c2d76 * _0x11344c));
      try {
        const _0x16c128 = {
          frame_index: _0xc744ca,
          rhVideoFps: _0x11344c,
          rhVideoFrames: _0x58bc49,
          rhVideoResolution: _0x21e9d7,
          rhInstanceType: _0x52da3
        };
        if (!this._isRemoveUiMode()) {
          _0x16c128.positive = _0x4add1e;
          _0x16c128.negative = _0xc62e46;
          _0x16c128.pos_points = _0x341af2;
          _0x16c128.neg_points = _0xf65e2a;
        }
        a1442_0x24c8f4.updateNodeData(this.nodeId, _0x16c128);
      } catch {}
      const _0x2b715c = this._resolveSourceVideoValue(_0x58c220);
      if (!_0x2b715c) {
        window.showToast?.(videoKeyingText("toasts.connectSourceVideoFirst"), "warn");
        return;
      }
      if (isVideoKeyingSourceVideoTooLarge(_0x58c220)) {
        window.showToast?.(videoKeyingText("toasts.sourceVideoTooLarge", {
          maxMB: getVideoKeyingMaxSourceVideoMB()
        }), "warn");
        return;
      }
      let _0x56343c = null;
      try {
        _0x56343c = await getRunningHubWorkflowAccess();
      } catch (_0x1aea6b) {
        window.showToast?.(videoKeyingText("toasts.configReadFailed"), "error");
        return;
      }
      const _0x1f84fd = String(_0x56343c?.apiKey || "").trim();
      const _0x3f6c1f = String(_0x56343c?.providerProfileId || "").trim();
      const _0x5677f1 = String(_0x56343c?.apiUrl || "").trim();
      if (!_0x1f84fd) {
        showProviderApiKeyMissingToast(videoKeyingText("toasts.apiKeyMissing"), {
          providerId: _0x3f6c1f || "runninghubwf",
          type: "warn"
        });
        return;
      }
      if (this._isRemoveUiMode()) {
        let _0x8d3b02 = "";
        try {
          _0x8d3b02 = this._exportRemoveMaskDataUrl(_0x21e9d7);
        } catch (_0x3be14a) {
          window.showToast?.(_0x3be14a?.message || videoKeyingText("errors.removeMaskFailed"), "error");
          return;
        }
        const _0x17673b = _0x58c220;
        const {
          width: _0x2a0dd0,
          height: _0x1c7933
        } = getAutoMediaSizeByShortSide(_0x17673b.width || 512, _0x17673b.height || 288);
        const _0x2b207b = calcSafeSpawnPosNearNode(a1442_0x24c8f4.getState().nodes, _0x17673b, _0x2a0dd0, _0x1c7933);
        const _0x41cf11 = generateId("source-video-erase");
        const _0x202eec = Date.now();
        a1442_0x24c8f4.addNode(buildSourceMediaNodePayload({
          id: _0x41cf11,
          type: "source-video",
          x: _0x2b207b.x,
          y: _0x2b207b.y,
          width: _0x2a0dd0,
          height: _0x1c7933,
          name: videoKeyingText("output.removeGeneratingName"),
          src: "",
          localPath: "",
          ...buildGenerationStartPatch({
            startedAt: _0x202eec
          }),
          provider: "runninghubwf",
          model: getVideoKeyingModelId(),
          rhTaskId: "",
          rhTaskStatus: "pending",
          rhTaskStartedAt: _0x202eec,
          rhTaskRecovering: false,
          rhTaskUseOpenapiQuery: false,
          rhSourceNodeId: _0x57f38e,
          rhToolbarTaskType: "video-remove",
          fixedSize: true,
          outputText: buildVideoKeyingOutputText("remove", "processing")
        }));
        a1442_0x24c8f4.setSelectedNodes([_0x41cf11]);
        const _0x66623e = runVideoKeyingTask({
          sourceNodeId: _0x57f38e,
          outId: _0x41cf11,
          mode: "remove",
          startedAt: _0x202eec,
          payload: {
            provider: "runninghubwf",
            model: getVideoKeyingModelId(),
            apiKey: _0x1f84fd,
            providerProfileId: _0x3f6c1f,
            rhProviderProfileId: _0x3f6c1f,
            runningHubApiUrl: _0x5677f1,
            videoUrl: _0x2b715c,
            maskImageDataUrl: _0x8d3b02,
            sourceFrameCount: _0x58bc49,
            rhVideoFps: _0x11344c,
            rhVideoResolution: _0x21e9d7,
            rhInstanceType: _0x52da3
          }
        });
        this.exit({
          silent: true,
          preserveRh: true
        });
        await _0x66623e;
        return;
      }
      const _0x4723ff = _0x58c220;
      const {
        width: _0x22123c,
        height: _0x441f97
      } = getAutoMediaSizeByShortSide(_0x4723ff.width || 512, _0x4723ff.height || 288);
      const _0x5caf81 = calcSafeSpawnPosNearNode(a1442_0x24c8f4.getState().nodes, _0x4723ff, _0x22123c, _0x441f97);
      const _0x3ece36 = generateId("source-video-matting");
      const _0x3c9cbb = Date.now();
      a1442_0x24c8f4.addNode(buildSourceMediaNodePayload({
        id: _0x3ece36,
        type: "source-video",
        x: _0x5caf81.x,
        y: _0x5caf81.y,
        width: _0x22123c,
        height: _0x441f97,
        name: videoKeyingText("output.keyingResultName", {
          name: _0x4723ff.name || videoKeyingText("output.videoFallback")
        }),
        src: "",
        localPath: "",
        ...buildGenerationStartPatch({
          startedAt: _0x3c9cbb
        }),
        provider: "runninghubwf",
        model: getVideoKeyingModelId(),
        rhTaskId: "",
        rhTaskStatus: "pending",
        rhTaskStartedAt: _0x3c9cbb,
        rhTaskRecovering: false,
        rhTaskUseOpenapiQuery: false,
        rhSourceNodeId: _0x57f38e,
        rhToolbarTaskType: "video-keying",
        fixedSize: true,
        outputText: buildVideoKeyingOutputText("keying", "processing")
      }));
      a1442_0x24c8f4.setSelectedNodes([_0x3ece36]);
      commit();
      const _0x22e588 = runVideoKeyingTask({
        sourceNodeId: _0x57f38e,
        outId: _0x3ece36,
        mode: "keying",
        startedAt: _0x3c9cbb,
        payload: {
          provider: "runninghubwf",
          model: getVideoKeyingModelId(),
          apiKey: _0x1f84fd,
          providerProfileId: _0x3f6c1f,
          rhProviderProfileId: _0x3f6c1f,
          runningHubApiUrl: _0x5677f1,
          videoUrl: _0x2b715c,
          pos_points: _0x341af2,
          neg_points: _0xf65e2a,
          frame_index: _0xc744ca,
          timeSec: _0x5c2d76,
          frameRate: _0x11344c,
          frameCount: _0x58bc49,
          rhVideoFps: _0x11344c,
          rhVideoFrames: _0x58bc49,
          rhVideoResolution: _0x21e9d7,
          rhInstanceType: _0x52da3,
          rhMaskMode: _0xd872be
        }
      });
      this.exit({
        silent: true,
        preserveRh: true
      });
      await _0x22e588;
    });
    const _0x1a16d2 = this.barEl.querySelector(".rh-keying-settings-wrap");
    const _0x424dab = this.barEl.querySelector(".rh-keying-settings-btn");
    const _0x273c3d = this.barEl.querySelector(".rh-keying-settings-menu");
    if (_0x1a16d2 && _0x424dab && _0x273c3d) {
      const _0x3324f2 = () => {
        const _0x2d82b4 = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {};
        const {
          fps: _0x22904c,
          resolution: _0x47c4e9,
          instanceType: _0x164e98
        } = this._getRhVideoSettings(_0x2d82b4);
        const _0x29f582 = this._getRhMaskMode(_0x2d82b4);
        _0x273c3d.querySelectorAll(".rh-keying-res-btn").forEach(_0x5e1bca => _0x5e1bca.classList.toggle("active", Number(_0x5e1bca.dataset.value) === _0x47c4e9));
        _0x273c3d.querySelectorAll(".rh-keying-fps-btn").forEach(_0x394427 => _0x394427.classList.toggle("active", Number(_0x394427.dataset.value) === _0x22904c));
        _0x273c3d.querySelectorAll(".rh-keying-maskmode-btn").forEach(_0x38a332 => _0x38a332.classList.toggle("active", _0x38a332.dataset.value === _0x29f582));
        _0x273c3d.querySelectorAll(".rh-keying-vram-btn").forEach(_0x4a3b84 => _0x4a3b84.classList.toggle("active", _0x4a3b84.dataset.value === _0x164e98));
      };
      _0x1a16d2.addEventListener("click", _0x955fd1 => _0x955fd1.stopPropagation());
      _0x273c3d.addEventListener("click", _0x195334 => _0x195334.stopPropagation());
      _0x424dab.addEventListener("click", _0x389cc4 => {
        _0x389cc4.preventDefault();
        _0x389cc4.stopPropagation();
        const _0x14c8a7 = () => {
          _0x1a16d2.classList.remove("show");
          if (this._onKeyingSettingsDocDown) {
            document.removeEventListener("pointerdown", this._onKeyingSettingsDocDown, true);
            this._onKeyingSettingsDocDown = null;
          }
        };
        const _0x1e3994 = !_0x1a16d2.classList.contains("show");
        if (!_0x1e3994) {
          _0x14c8a7();
          return;
        }
        _0x1a16d2.classList.add("show");
        _0x3324f2();
        if (!this._onKeyingSettingsDocDown) {
          this._onKeyingSettingsDocDown = _0x530f0b => {
            if (_0x1a16d2.contains(_0x530f0b.target)) {
              return;
            }
            _0x14c8a7();
          };
          document.addEventListener("pointerdown", this._onKeyingSettingsDocDown, true);
        }
      });
      _0x273c3d.querySelectorAll(".rh-keying-fps-btn").forEach(_0xbee63d => {
        _0xbee63d.addEventListener("click", _0x695ca7 => {
          _0x695ca7.preventDefault();
          _0x695ca7.stopPropagation();
          const _0x14fb0b = Number(_0xbee63d.dataset.value);
          const _0x12f4ab = normalizeRhKeyingFps(_0x14fb0b);
          try {
            const _0xa1b2c0 = Math.max(1, Math.round((Number(this.durationSec) || 0) * _0x12f4ab) || 1);
            const _0xc07797 = this.videoEl || this._getVideoEl();
            const _0xf38f7d = Math.max(0, Math.min(Number(this.durationSec) || 0, Number(_0xc07797?.currentTime) || 0));
            const _0x181ad3 = Math.max(0, Math.round(_0xf38f7d * _0x12f4ab));
            a1442_0x24c8f4.updateNodeData(this.nodeId, {
              rhVideoFps: _0x12f4ab,
              rhVideoFrames: _0xa1b2c0,
              frame_index: _0x181ad3
            });
          } catch {}
          _0x3324f2();
          this._updateHelperRight();
        });
      });
      _0x273c3d.querySelectorAll(".rh-keying-maskmode-btn").forEach(_0x156d9a => {
        _0x156d9a.addEventListener("click", _0x3bc3d4 => {
          _0x3bc3d4.preventDefault();
          _0x3bc3d4.stopPropagation();
          const _0x490b80 = this._normalizeRhMaskMode(_0x156d9a.dataset.value);
          try {
            a1442_0x24c8f4.updateNodeData(this.nodeId, {
              rhMaskMode: _0x490b80
            });
          } catch {}
          _0x3324f2();
        });
      });
      _0x273c3d.querySelectorAll(".rh-keying-res-btn").forEach(_0xcc18c => {
        _0xcc18c.addEventListener("click", _0x2bd2a4 => {
          _0x2bd2a4.preventDefault();
          _0x2bd2a4.stopPropagation();
          const _0xf9f052 = Math.trunc(Number(_0xcc18c.dataset.value));
          const _0x41dbb4 = [832, 1024, 1280, 1440, 1600, 1760, 1920].includes(_0xf9f052) ? _0xf9f052 : 1024;
          try {
            a1442_0x24c8f4.updateNodeData(this.nodeId, {
              rhVideoResolution: _0x41dbb4
            });
          } catch {}
          _0x3324f2();
          this._updateHelperRight();
        });
      });
      _0x273c3d.querySelectorAll(".rh-keying-vram-btn").forEach(_0x111f07 => {
        _0x111f07.addEventListener("click", _0x5a255b => {
          _0x5a255b.preventDefault();
          _0x5a255b.stopPropagation();
          const _0x4f021b = _0x111f07.dataset.value === "plus" ? "plus" : "default";
          try {
            a1442_0x24c8f4.updateNodeData(this.nodeId, {
              rhInstanceType: _0x4f021b
            });
          } catch {}
          _0x3324f2();
        });
      });
    }
    const _0x537757 = this.barEl.querySelector(".rh-keying-debug-btn");
    if (_0x537757) {
      _0x537757.addEventListener("click", async _0x4a76a2 => {
        _0x4a76a2.preventDefault();
        _0x4a76a2.stopPropagation();
        const _0x844474 = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {};
        const _0x592f92 = this.videoEl || this._getVideoEl();
        const _0x54ce81 = Number(_0x592f92?.currentTime) || 0;
        const _0x2ec938 = Number(_0x592f92?.videoWidth) || 0;
        const _0x39e0dc = Number(_0x592f92?.videoHeight) || 0;
        const {
          fps: _0x2ae181,
          resolution: _0x13a1d0,
          instanceType: _0x5e1ef7
        } = this._getRhVideoSettings(_0x844474);
        const _0x5435e5 = this._getRhMaskMode(_0x844474);
        const _0x233d65 = this._getSourceFrameCount(_0x844474, _0x2ae181);
        const _0xcc4f01 = this._resolveSourceVideoValue(_0x844474);
        if (isVideoKeyingSourceVideoTooLarge(_0x844474)) {
          window.showToast?.(videoKeyingText("toasts.sourceVideoTooLarge", {
            maxMB: getVideoKeyingMaxSourceVideoMB()
          }), "warn");
          return;
        }
        const {
          pos_points: _0x5f2615,
          neg_points: _0x479552
        } = this.getPosNegPoints();
        const {
          w: _0x5eb018,
          h: _0x8c9645
        } = this._calcKeyingFrameSize(_0x2ec938, _0x39e0dc, _0x13a1d0);
        const _0x30f83c = (_0x406aab, _0x19af42, _0x5bc47e) => Math.max(_0x19af42, Math.min(_0x5bc47e, _0x406aab));
        const _0x3b43e0 = _0x2e34c1 => ({
          x: Math.round(_0x30f83c(_0x2e34c1.x * _0x5eb018, 0, Math.max(0, _0x5eb018 - 1))),
          y: Math.round(_0x30f83c(_0x2e34c1.y * _0x8c9645, 0, Math.max(0, _0x8c9645 - 1)))
        });
        const _0x248ee0 = _0x5eb018 > 0 && _0x8c9645 > 0 ? _0x5f2615.map(_0x3b43e0) : [];
        const _0x44796e = _0x5eb018 > 0 && _0x8c9645 > 0 ? _0x479552.map(_0x3b43e0) : [];
        const _0x1b71d6 = _0x248ee0.length ? JSON.stringify(_0x248ee0) : "";
        const _0x135ef8 = _0x44796e.length ? JSON.stringify(_0x44796e) : "";
        let _0x36e2d2 = null;
        try {
          _0x36e2d2 = await getRunningHubWorkflowAccess();
        } catch {
          window.showToast?.(videoKeyingText("toasts.configReadFailed"), "error");
          return;
        }
        const _0x34e644 = String(_0x36e2d2?.apiKey || "").trim();
        const _0x162abb = String(_0x36e2d2?.providerProfileId || "").trim();
        const _0xd10bcb = String(_0x36e2d2?.apiUrl || "").trim();
        let _0x5b6489 = null;
        if (this._isRemoveUiMode()) {
          let _0x47e085 = "";
          try {
            _0x47e085 = this._exportRemoveMaskDataUrl(_0x13a1d0);
          } catch (_0x143483) {
            window.showToast?.(videoKeyingText("toasts.debugBuildFailed", {
              error: _0x143483?.message || videoKeyingText("errors.maskExportFailed")
            }), "error");
            return;
          }
          _0x5b6489 = {
            provider: "runninghubwf",
            model: getVideoKeyingModelId(),
            apiKey: _0x34e644,
            providerProfileId: _0x162abb,
            rhProviderProfileId: _0x162abb,
            runningHubApiUrl: _0xd10bcb,
            videoUrl: _0xcc4f01,
            maskImageDataUrl: _0x47e085,
            sourceFrameCount: _0x233d65,
            rhVideoFps: _0x2ae181,
            rhVideoResolution: _0x13a1d0,
            rhInstanceType: _0x5e1ef7
          };
        } else {
          _0x5b6489 = {
            provider: "runninghubwf",
            model: getVideoKeyingModelId(),
            apiKey: _0x34e644,
            providerProfileId: _0x162abb,
            rhProviderProfileId: _0x162abb,
            runningHubApiUrl: _0xd10bcb,
            videoUrl: _0xcc4f01,
            pos_points: _0x1b71d6,
            neg_points: _0x135ef8,
            timeSec: _0x54ce81,
            frame_index: Math.max(0, Math.round(_0x54ce81 * _0x2ae181)),
            rhVideoFps: _0x2ae181,
            rhVideoFrames: Number.isFinite(_0x844474.rhVideoFrames) ? Math.max(0, Math.trunc(_0x844474.rhVideoFrames)) : _0x233d65,
            rhVideoResolution: _0x13a1d0,
            rhInstanceType: _0x5e1ef7,
            rhMaskMode: _0x5435e5
          };
        }
        try {
          const _0x53dc19 = await buildGenerateVideoRequest(_0x5b6489);
          const _0x4bca67 = formatFinalApiDebugRequest(_0x53dc19);
          const _0x1c35b = a1442_0x24c8f4.getState();
          const _0x42c27a = _0x1c35b.nodes?.[this.nodeId] || {};
          const _0x23e4f8 = (_0x42c27a.x || 0) + (_0x42c27a.width || 380) + 50;
          const _0x516d93 = _0x42c27a.y || 0;
          const _0x412fdc = getNodeDefaultSize("debug");
          let _0x3867f7 = Object.values(_0x1c35b.nodes || {}).find(_0x4a03dd => _0x4a03dd && _0x4a03dd.type === "debug");
          if (!_0x3867f7) {
            a1442_0x24c8f4.addNode({
              id: "debug-" + Date.now(),
              type: "debug",
              x: _0x23e4f8,
              y: _0x516d93,
              ..._0x412fdc,
              name: videoKeyingText("debug.nodeName"),
              outputText: _0x4bca67
            });
          } else {
            a1442_0x24c8f4.updateNodeData(_0x3867f7.id, {
              outputText: _0x4bca67,
              x: _0x23e4f8,
              y: _0x516d93
            });
          }
          window.showToast?.(this._isRemoveUiMode() ? videoKeyingText("toasts.debugRemoveShown") : videoKeyingText("toasts.debugKeyingShown"), "info");
        } catch (_0x1f6418) {
          window.showToast?.(videoKeyingText("toasts.debugFailed", {
            error: _0x1f6418?.message || videoKeyingText("errors.unknown")
          }), "error");
        }
      });
    }
    if (!this._onShortcutsUpdated) {
      this._onShortcutsUpdated = () => {
        this._refreshRemoveShortcutUi();
        this._refreshKeyingHintUi();
      };
      window.addEventListener("shortcuts-updated", this._onShortcutsUpdated);
    }
    const _0x114400 = _0xe862d9 => {
      const _0x1c7d49 = this.trackEl?.getBoundingClientRect();
      const _0x36633e = this.durationSec;
      if (!_0x1c7d49 || !_0x1c7d49.width || !Number.isFinite(_0x36633e) || _0x36633e <= 0) {
        return;
      }
      const _0x212678 = Math.max(0, Math.min(1, (_0xe862d9 - _0x1c7d49.left) / _0x1c7d49.width));
      const _0x5a0f80 = _0x212678 * _0x36633e;
      const _0x3d24c6 = this.videoEl || this._getVideoEl();
      if (_0x3d24c6) {
        _0x3d24c6.currentTime = Math.max(0, Math.min(_0x36633e, _0x5a0f80));
      }
      this._renderPlayhead();
    };
    const _0x29a8ee = (_0x274618, _0x52a308) => {
      if (_0x274618 && this._onPointerMove) {
        _0x274618.removeEventListener("pointermove", this._onPointerMove);
      }
      if (_0x274618 && this._onPointerUp) {
        _0x274618.removeEventListener("pointerup", this._onPointerUp);
      }
      if (_0x274618 && this._onPointerCancel) {
        _0x274618.removeEventListener("pointercancel", this._onPointerCancel);
      }
      if (_0x274618 && this._onPointerCancel) {
        _0x274618.removeEventListener("lostpointercapture", this._onPointerCancel);
      }
      this._onPointerMove = null;
      this._onPointerUp = null;
      this._onPointerCancel = null;
      try {
        if (_0x274618 && Number.isFinite(_0x52a308)) {
          _0x274618.releasePointerCapture(_0x52a308);
        }
      } catch {}
    };
    const _0xfef943 = _0xebf2e6 => {
      if (!this.active || !this.trackEl) {
        return;
      }
      _0xebf2e6.preventDefault();
      _0xebf2e6.stopPropagation();
      this._pauseAllWrapperVideos();
      _0x114400(_0xebf2e6.clientX);
      const _0x4fe19 = this.trackEl;
      const _0x35c3cb = _0xebf2e6.pointerId;
      try {
        if (Number.isFinite(_0x35c3cb)) {
          _0x4fe19.setPointerCapture(_0x35c3cb);
        }
      } catch {}
      this._onPointerMove = _0x330016 => {
        if (Number.isFinite(_0x35c3cb) && _0x330016.pointerId !== _0x35c3cb) {
          return;
        }
        _0x330016.preventDefault();
        _0x114400(_0x330016.clientX);
      };
      this._onPointerUp = _0x6e3a9e => {
        if (Number.isFinite(_0x35c3cb) && _0x6e3a9e.pointerId !== _0x35c3cb) {
          return;
        }
        _0x6e3a9e.preventDefault();
        _0x29a8ee(_0x4fe19, _0x35c3cb);
        this._pauseAllWrapperVideos();
      };
      this._onPointerCancel = _0x2e2616 => {
        if (Number.isFinite(_0x35c3cb) && _0x2e2616.pointerId !== _0x35c3cb) {
          return;
        }
        _0x29a8ee(_0x4fe19, _0x35c3cb);
        this._pauseAllWrapperVideos();
      };
      _0x4fe19.addEventListener("pointermove", this._onPointerMove);
      _0x4fe19.addEventListener("pointerup", this._onPointerUp);
      _0x4fe19.addEventListener("pointercancel", this._onPointerCancel);
      _0x4fe19.addEventListener("lostpointercapture", this._onPointerCancel);
    };
    this.playheadEl?.addEventListener("pointerdown", _0xfef943);
    this.trackEl?.addEventListener("pointerdown", _0xfef943);
    this._onKeyDown = _0x1b1afc => {
      if (!this.active) {
        return;
      }
      if (_0x1b1afc.target && (_0x1b1afc.target.tagName === "INPUT" || _0x1b1afc.target.tagName === "TEXTAREA" || _0x1b1afc.target.isContentEditable)) {
        return;
      }
      if (_0x1b1afc.key === "Escape") {
        _0x1b1afc.preventDefault();
        _0x1b1afc.stopPropagation();
        this.exit();
        return;
      }
      const _0x50758a = handleShortcutKeydown(_0x1b1afc, {
        mattingActive: false,
        annotateActive: false,
        videoKeyingActive: true,
        featureModeActive: true,
        selectedNodeType: "source-video"
      });
      if (!_0x50758a) {
        return;
      }
      if (this._isRemoveUiMode()) {
        if (_0x50758a === "editor-tool-brush") {
          _0x1b1afc.preventDefault();
          _0x1b1afc.stopPropagation();
          this._setRemovePointTool("foreground");
          return;
        }
        if (_0x50758a === "editor-tool-eraser") {
          _0x1b1afc.preventDefault();
          _0x1b1afc.stopPropagation();
          this._setRemovePointTool("background");
          return;
        }
        if (_0x50758a === "editor-clear") {
          _0x1b1afc.preventDefault();
          _0x1b1afc.stopPropagation();
          this._clearAllMarks();
          window.showToast?.(videoKeyingText("toasts.clearedPoints"), "info");
          return;
        }
        if (_0x50758a === "undo") {
          _0x1b1afc.preventDefault();
          _0x1b1afc.stopPropagation();
          this._undoMark();
          return;
        }
        if (_0x50758a === "redo") {
          _0x1b1afc.preventDefault();
          _0x1b1afc.stopPropagation();
          this._redoMark();
          return;
        }
      }
      if (_0x50758a === "undo") {
        _0x1b1afc.preventDefault();
        _0x1b1afc.stopPropagation();
        this._undoMark();
        return;
      }
      if (_0x50758a === "redo") {
        _0x1b1afc.preventDefault();
        _0x1b1afc.stopPropagation();
        this._redoMark();
        return;
      }
      if (_0x50758a === "editor-clear") {
        _0x1b1afc.preventDefault();
        _0x1b1afc.stopPropagation();
        this._clearAllMarks();
        window.showToast?.(videoKeyingText("toasts.clearedPoints"), "info");
      }
    };
    window.addEventListener("keydown", this._onKeyDown, true);
    const _0x4bd74f = () => {
      const _0x273b1d = this.markLayerEl;
      const _0x2fc5c9 = this.videoEl || this._getVideoEl();
      const _0x2beecb = Array.isArray(this._marks) ? this._marks : [];
      if (!_0x273b1d || !_0x2fc5c9) {
        return;
      }
      const _0x34b122 = this._measureProjection({
        videoEl: _0x2fc5c9,
        layerEl: _0x273b1d
      });
      const _0x5e4d8b = _0x34b122?.layer;
      if (!_0x34b122 || !_0x5e4d8b) {
        return;
      }
      if (this._isRemoveUiMode()) {
        const _0x1b842a = this.markCanvasEl;
        if (!_0x1b842a) {
          return;
        }
        const _0x36d6c7 = Math.max(1, Math.round(_0x5e4d8b.lw));
        const _0x1d34f5 = Math.max(1, Math.round(_0x5e4d8b.lh));
        const _0x9870e3 = window.devicePixelRatio || 1;
        const _0x124ee5 = Math.round(_0x36d6c7 * _0x9870e3);
        const _0x7fee14 = Math.round(_0x1d34f5 * _0x9870e3);
        if (_0x1b842a.width !== _0x124ee5 || _0x1b842a.height !== _0x7fee14) {
          _0x1b842a.width = _0x124ee5;
          _0x1b842a.height = _0x7fee14;
          _0x1b842a.style.width = _0x36d6c7 + "px";
          _0x1b842a.style.height = _0x1d34f5 + "px";
        }
        const _0x8d9c85 = _0x1b842a.getContext("2d");
        if (!_0x8d9c85) {
          return;
        }
        _0x8d9c85.setTransform(_0x9870e3, 0, 0, _0x9870e3, 0, 0);
        _0x8d9c85.clearRect(0, 0, _0x36d6c7, _0x1d34f5);
        const _0x30b5b6 = this.removeMaskCanvasEl || document.createElement("canvas");
        if (_0x30b5b6.width !== Math.round(_0x36d6c7) || _0x30b5b6.height !== Math.round(_0x1d34f5)) {
          _0x30b5b6.width = Math.max(1, Math.round(_0x36d6c7));
          _0x30b5b6.height = Math.max(1, Math.round(_0x1d34f5));
        }
        this.removeMaskCanvasEl = _0x30b5b6;
        const _0x4e4cb1 = _0x30b5b6.getContext("2d");
        if (!_0x4e4cb1) {
          return;
        }
        _0x4e4cb1.clearRect(0, 0, _0x30b5b6.width, _0x30b5b6.height);
        _0x4e4cb1.lineCap = "round";
        _0x4e4cb1.lineJoin = "round";
        const _0x797b43 = _0x4fb534 => {
          if (!_0x4fb534 || _0x4fb534.type !== "brush" && _0x4fb534.type !== "eraser") {
            return;
          }
          const _0x3a3dc6 = Array.isArray(_0x4fb534.points) ? _0x4fb534.points : [];
          if (!_0x3a3dc6.length) {
            return;
          }
          const _0x484141 = _0x3a3dc6.map(_0x4400e6 => _0x34b122.normalizedToLayerPoint(Number(_0x4400e6?.nx), Number(_0x4400e6?.ny))).filter(_0x32b76c => Number.isFinite(_0x32b76c.x) && Number.isFinite(_0x32b76c.y));
          if (!_0x484141.length) {
            return;
          }
          drawEraseMaskCommand(_0x4e4cb1, {
            type: _0x4fb534.type === "eraser" ? "eraser" : "brush",
            points: _0x484141,
            lineWidth: getBrushLineWidth(this._clampRemoveBrushSize(_0x4fb534.brushSizePx), 1, _0x4fb534.type)
          });
        };
        _0x2beecb.forEach(_0x797b43);
        if (this._removeDraft) {
          _0x797b43(this._removeDraft);
        }
        const _0x3879b4 = createEraseCheckerboardPattern(_0x8d9c85, 1) || getEraseCanvasPalette().checkerAccent;
        compositeCheckerMask(_0x8d9c85, {
          maskCanvas: _0x30b5b6,
          width: _0x36d6c7,
          height: _0x1d34f5,
          checkerPattern: _0x3879b4,
          checkerZoom: 1,
          checkerAlpha: 0.8
        });
        return;
      }
      if (!_0x2beecb.length) {
        _0x273b1d.replaceChildren();
        return;
      }
      const _0xeabd80 = document.createDocumentFragment();
      for (let _0x1dddaa = 0; _0x1dddaa < _0x2beecb.length; _0x1dddaa++) {
        const _0x3c7331 = _0x2beecb[_0x1dddaa];
        const _0x3f7964 = document.createElement("div");
        const _0x323894 = _0x3c7331 && typeof _0x3c7331.pointType === "string" ? _0x3c7331.pointType : "foreground";
        _0x3f7964.className = _0x323894 === "background" ? "v2-video-keying-mark v2-video-keying-mark--background" : "v2-video-keying-mark v2-video-keying-mark--foreground";
        if (this._isRemoveUiMode()) {
          const _0x1c0d6f = this._clampRemoveBrushSize(_0x3c7331.brushSizePx || this._removeBrushSizePx);
          const _0xf6f3f0 = Math.max(8, Math.min(30, Math.round(_0x1c0d6f / 4)));
          _0x3f7964.style.width = _0xf6f3f0 + "px";
          _0x3f7964.style.height = _0xf6f3f0 + "px";
        }
        const _0x26eed3 = _0x34b122.normalizedToLayerPoint(Number(_0x3c7331.nx), Number(_0x3c7331.ny));
        if (!_0x26eed3) {
          continue;
        }
        _0x3f7964.style.left = _0x26eed3.x + "px";
        _0x3f7964.style.top = _0x26eed3.y + "px";
        _0xeabd80.appendChild(_0x3f7964);
      }
      _0x273b1d.replaceChildren(_0xeabd80);
    };
    this._renderMarksFn = _0x4bd74f;
    const _0x2661c = {
      down: false,
      pointerId: null
    };
    const _0x514da8 = (_0x56bcda = true) => {
      const _0x11ede6 = this.markLayerEl;
      const _0x25d5ea = _0x2661c.pointerId;
      if (_0x11ede6 && Number.isFinite(_0x25d5ea)) {
        try {
          _0x11ede6.releasePointerCapture(_0x25d5ea);
        } catch {}
      }
      _0x2661c.down = false;
      _0x2661c.pointerId = null;
      this._removeDrawPointerId = null;
      const _0x16e23d = this._removeDraft;
      this._removeDraft = null;
      if (!_0x56bcda || !_0x16e23d) {
        this._renderMarksFn?.();
        return;
      }
      const _0x3deb6b = Array.isArray(_0x16e23d.points) ? _0x16e23d.points.map(_0x42afc4 => ({
        nx: Math.max(0, Math.min(1, Number(_0x42afc4?.nx) || 0)),
        ny: Math.max(0, Math.min(1, Number(_0x42afc4?.ny) || 0))
      })).filter(_0x107245 => Number.isFinite(_0x107245.nx) && Number.isFinite(_0x107245.ny)) : [];
      if (!_0x3deb6b.length) {
        this._renderMarksFn?.();
        return;
      }
      const _0xb25ac = Array.isArray(this._marks) ? this._marks : [];
      _0xb25ac.push({
        type: _0x16e23d.type === "eraser" ? "eraser" : "brush",
        brushSizePx: this._clampRemoveBrushSize(_0x16e23d.brushSizePx),
        points: _0x3deb6b
      });
      this._marks = _0xb25ac;
      this._marksRedo = [];
      this._syncPointsToStore();
      this._renderMarksFn?.();
    };
    this._onMarkPointerDown = _0x5f3407 => {
      if (!this.active) {
        return;
      }
      if (_0x5f3407.detail && _0x5f3407.detail > 1) {
        return;
      }
      if (!this.markLayerEl || !this.markLayerEl.contains(_0x5f3407.target)) {
        return;
      }
      _0x5f3407.preventDefault();
      _0x5f3407.stopPropagation();
      this._pauseAllWrapperVideos();
      this._scheduleRemoveCursor(_0x5f3407.clientX, _0x5f3407.clientY);
      const _0x59f055 = this._measureProjection()?.pickClientPoint(_0x5f3407.clientX, _0x5f3407.clientY);
      if (!_0x59f055) {
        return;
      }
      if (this._isRemoveUiMode()) {
        if (_0x5f3407.button !== 0) {
          return;
        }
        if (Array.isArray(this._marksRedo) && this._marksRedo.length) {
          this._marksRedo = [];
        }
        const _0x58e754 = this._getRemoveToolType();
        this._removeDraft = {
          type: _0x58e754,
          brushSizePx: this._clampRemoveBrushSize(this._removeBrushSizePx),
          points: [{
            nx: _0x59f055.nx,
            ny: _0x59f055.ny
          }]
        };
        _0x2661c.down = true;
        _0x2661c.pointerId = _0x5f3407.pointerId;
        this._removeDrawPointerId = _0x5f3407.pointerId;
        try {
          if (Number.isFinite(_0x5f3407.pointerId)) {
            this.markLayerEl.setPointerCapture(_0x5f3407.pointerId);
          }
        } catch {}
        this._renderMarksFn?.();
        return;
      }
      const _0x305eec = Array.isArray(this._marks) ? this._marks : [];
      if (Array.isArray(this._marksRedo) && this._marksRedo.length) {
        this._marksRedo = [];
      }
      const _0x5192c3 = this.videoEl;
      const _0x6ac668 = Number(_0x5192c3?.currentTime) || 0;
      if (_0x5f3407.button !== 0 && _0x5f3407.button !== 2) {
        return;
      }
      let _0x517f80 = _0x5f3407.button === 2 ? "background" : "foreground";
      if (this._isRemoveUiMode() && _0x5f3407.button === 0) {
        _0x517f80 = this._removePointTool === "background" ? "background" : "foreground";
      }
      _0x305eec.push({
        nx: _0x59f055.nx,
        ny: _0x59f055.ny,
        t: _0x6ac668,
        pointType: _0x517f80,
        brushSizePx: this._isRemoveUiMode() ? this._clampRemoveBrushSize(this._removeBrushSizePx) : undefined
      });
      this._marks = _0x305eec;
      _0x4bd74f();
      this._syncPointsToStore();
    };
    this._onMarkPointerMove = _0x2a0ea7 => {
      if (!this.active || !this._isRemoveUiMode()) {
        return;
      }
      this._scheduleRemoveCursor(_0x2a0ea7.clientX, _0x2a0ea7.clientY);
      if (!_0x2661c.down || !this._removeDraft) {
        return;
      }
      if (Number.isFinite(_0x2661c.pointerId) && _0x2a0ea7.pointerId !== _0x2661c.pointerId) {
        return;
      }
      _0x2a0ea7.preventDefault();
      _0x2a0ea7.stopPropagation();
      const _0x25e10b = this._measureProjection()?.pickClientPoint(_0x2a0ea7.clientX, _0x2a0ea7.clientY);
      if (!_0x25e10b) {
        return;
      }
      const _0x49617a = this._removeDraft.points;
      if (!Array.isArray(_0x49617a) || !_0x49617a.length) {
        this._removeDraft.points = [{
          nx: _0x25e10b.nx,
          ny: _0x25e10b.ny
        }];
        this._renderMarksFn?.();
        return;
      }
      const _0x43126b = _0x49617a[_0x49617a.length - 1];
      const _0x38bc21 = Math.hypot(Number(_0x25e10b.nx) - Number(_0x43126b.nx), Number(_0x25e10b.ny) - Number(_0x43126b.ny));
      if (_0x38bc21 < 0.0006) {
        return;
      }
      _0x49617a.push({
        nx: _0x25e10b.nx,
        ny: _0x25e10b.ny
      });
      this._renderMarksFn?.();
    };
    this._onMarkPointerUp = _0x4eaf91 => {
      if (!this.active || !this._isRemoveUiMode()) {
        return;
      }
      this._scheduleRemoveCursor(_0x4eaf91.clientX, _0x4eaf91.clientY);
      if (Number.isFinite(_0x2661c.pointerId) && _0x4eaf91.pointerId !== _0x2661c.pointerId) {
        return;
      }
      _0x4eaf91.preventDefault();
      _0x4eaf91.stopPropagation();
      _0x514da8(true);
    };
    this._onMarkPointerCancel = _0x2b226c => {
      if (!this.active || !this._isRemoveUiMode()) {
        return;
      }
      if (Number.isFinite(_0x2661c.pointerId) && _0x2b226c.pointerId !== _0x2661c.pointerId) {
        return;
      }
      _0x514da8(true);
    };
    this._onMarkPointerEnter = _0x777bcb => {
      if (!this._isRemoveUiMode()) {
        return;
      }
      this._removeCursorHover = true;
      this._scheduleRemoveCursor(_0x777bcb.clientX, _0x777bcb.clientY);
    };
    this._onMarkPointerLeave = () => {
      if (!this._isRemoveUiMode()) {
        return;
      }
      this._removeCursorHover = false;
      this._syncRemoveCursor();
    };
    this._detachMarkLayerListeners();
    this._attachMarkLayerListeners();
    _0x4bd74f();
    this._onResize = () => {
      if (!this.active) {
        return;
      }
      this._renderMarksFn?.();
      this._syncRemoveCursor();
    };
    window.addEventListener("resize", this._onResize);
  },
  _getVideoEl() {
    if (!this.wrapperEl) {
      return null;
    }
    const _0x4e4a23 = Array.from(this.wrapperEl.querySelectorAll("video"));
    for (const _0x58ba98 of _0x4e4a23) {
      if (!_0x58ba98) {
        continue;
      }
      const _0x5f1ae3 = window.getComputedStyle(_0x58ba98);
      if (_0x5f1ae3.display === "none" || _0x5f1ae3.visibility === "hidden") {
        continue;
      }
      const _0xf20046 = Number(_0x5f1ae3.opacity);
      if (Number.isFinite(_0xf20046) && _0xf20046 <= 0) {
        continue;
      }
      const _0x436dca = _0x58ba98.getBoundingClientRect();
      if (!_0x436dca.width || !_0x436dca.height) {
        continue;
      }
      return _0x58ba98;
    }
    return null;
  },
  _readDurationSec(_0x338b0a) {
    if (!_0x338b0a) {
      return 0;
    }
    const _0x401416 = Number(_0x338b0a.duration);
    if (Number.isFinite(_0x401416) && _0x401416 > 0) {
      return _0x401416;
    }
    const _0x2abeae = _0x338b0a.seekable;
    if (_0x2abeae && _0x2abeae.length) {
      const _0x312a67 = Number(_0x2abeae.end(_0x2abeae.length - 1));
      if (Number.isFinite(_0x312a67) && _0x312a67 > 0) {
        return _0x312a67;
      }
    }
    return 0;
  },
  async _syncDurationAndDefaults() {
    this.videoEl = this._getVideoEl();
    this._ensureMarkLayer();
    if (this.videoEl) {
      const _0x3b9285 = this._resolveVideoSrcFromNode(a1442_0x24c8f4.getState().nodes?.[this.nodeId]);
      const _0x1b8a4b = String(_0x3b9285 || "").trim();
      const _0x4dab13 = String(this.videoEl.dataset?.videoKeyingSourceUrl || "").trim();
      const _0x2c63a9 = ++this._sourceToken;
      setVideoKeyingMediaKeepAlive(this.videoEl, true);
      if (_0x1b8a4b && _0x4dab13 !== _0x1b8a4b) {
        await attachVideoKeyingPlaybackSource(this.videoEl, _0x1b8a4b);
        if (!this.active || _0x2c63a9 !== this._sourceToken) {
          return;
        }
        if (this.videoEl.dataset) {
          this.videoEl.dataset.videoKeyingSourceUrl = _0x1b8a4b;
        }
      }
    }
    const _0x251fd4 = this._readDurationSec(this.videoEl);
    if (_0x251fd4 > 0) {
      this.durationSec = _0x251fd4;
    }
    this._pauseAllWrapperVideos();
    if (this.videoEl) {
      this._onLoadedMeta = () => {
        if (!this.active) {
          return;
        }
        const _0x40a6ef = this._readDurationSec(this.videoEl);
        if (_0x40a6ef > 0) {
          this.durationSec = _0x40a6ef;
        }
        this._pauseAllWrapperVideos();
      };
      this._onDurationChange = () => {
        if (!this.active) {
          return;
        }
        const _0x7e72e8 = this._readDurationSec(this.videoEl);
        if (_0x7e72e8 > 0) {
          this.durationSec = _0x7e72e8;
        }
      };
      this.videoEl.addEventListener("loadedmetadata", this._onLoadedMeta, {
        once: true
      });
      this.videoEl.addEventListener("durationchange", this._onDurationChange);
    }
    this._renderThumbs();
    this._startPlayheadLoop();
    if (this.wrapperEl && !this._onVideoPlay) {
      this._onVideoPlay = _0x58f529 => {
        if (!this.active) {
          return;
        }
        if (!this.wrapperEl) {
          return;
        }
        const _0x4d5dc0 = _0x58f529.target;
        if (!(_0x4d5dc0 instanceof HTMLVideoElement)) {
          return;
        }
        try {
          _0x4d5dc0.pause();
        } catch {}
      };
      this.wrapperEl.addEventListener("play", this._onVideoPlay, true);
      this.wrapperEl.addEventListener("playing", this._onVideoPlay, true);
    }
  },
  _startPlayheadLoop() {
    if (this._playheadRaf) {
      cancelAnimationFrame(this._playheadRaf);
    }
    const _0x42ef4e = () => {
      if (!this.active) {
        return;
      }
      this._renderPlayhead();
      this._playheadRaf = requestAnimationFrame(_0x42ef4e);
    };
    this._playheadRaf = requestAnimationFrame(_0x42ef4e);
  },
  _renderPlayhead() {
    if (!this.playheadEl || !this.trackEl) {
      return;
    }
    const _0xed59a3 = this.durationSec;
    if (!Number.isFinite(_0xed59a3) || _0xed59a3 <= 0) {
      this.playheadEl.style.display = "none";
      return;
    }
    const _0x52ca93 = this.videoEl || this._getVideoEl();
    if (!_0x52ca93) {
      this.playheadEl.style.display = "none";
      return;
    }
    let _0x240bb7 = false;
    if (this.videoEl !== _0x52ca93) {
      this.videoEl = _0x52ca93;
      this._ensureMarkLayer();
      this._attachMarkLayerListeners();
      _0x240bb7 = true;
    } else if (this.markLayerEl && !this.markLayerEl.isConnected) {
      this._ensureMarkLayer();
      this._attachMarkLayerListeners();
      _0x240bb7 = true;
    }
    const _0x3dc480 = Math.max(0, Math.min(_0xed59a3, Number(_0x52ca93.currentTime) || 0));
    const _0x5c1d6b = Math.max(0, Math.min(1, _0x3dc480 / _0xed59a3));
    const _0x46262a = a1442_0x24c8f4.getState().nodes?.[this.nodeId] || {};
    const {
      fps: _0x412825
    } = this._getRhVideoSettings(_0x46262a);
    const _0x90905f = Math.max(0, Math.round(_0x3dc480 * _0x412825));
    if (this._lastFrameIndex !== _0x90905f || this._lastFrameIndexFps !== _0x412825) {
      this._lastFrameIndex = _0x90905f;
      this._lastFrameIndexFps = _0x412825;
      this._updateHelperRight();
    }
    this._updateHelperRight();
    this.playheadEl.style.display = "block";
    this.playheadEl.style.left = _0x5c1d6b * 100 + "%";
    if (_0x240bb7) {
      this._renderMarksFn?.();
    }
    this._syncRemoveCursor();
  },
  _resolveVideoSrcFromNode(_0x220fab) {
    if (!_0x220fab) {
      return "";
    }
    const _0x5bf717 = localPathToUrl(_0x220fab.localPath);
    return _0x5bf717 || _0x220fab.src || _0x220fab.videoUrl || _0x220fab.resultUrl || "";
  },
  async _renderThumbs() {
    const _0x20dce7 = ++this._thumbToken;
    const _0x53f83f = Array.isArray(this.thumbEls) ? this.thumbEls : [];
    if (!_0x53f83f.length) {
      return;
    }
    const _0x2e5ae6 = a1442_0x24c8f4.getState().nodes[this.nodeId];
    const _0x7256a2 = this._resolveVideoSrcFromNode(_0x2e5ae6);
    await renderVideoKeyingThumbs({
      src: _0x7256a2,
      thumbs: _0x53f83f,
      token: _0x20dce7,
      isCurrent: _0x27e29e => this.active && this._thumbToken === _0x27e29e,
      readDurationSec: _0x37445f => this._readDurationSec(_0x37445f),
      onDuration: _0x3e8e05 => {
        if (_0x3e8e05 > 0 && (!this.durationSec || this.durationSec <= 0)) {
          this.durationSec = _0x3e8e05;
        }
      }
    });
  },
  ...videoKeyingLifecycleMethods
};
export default VideoKeyingController;