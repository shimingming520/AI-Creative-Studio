import a1000_0xa09e46 from "../core/stores/appStore.js";
import { worldToScreen, generateId } from "../core/math.js";
import { getDisplayModelName } from "./providers.js";
import { IMAGE_MODELS } from "../config/modelConfig.js";
import { buildGenerateImageRequest, generateImage } from "../../api/aiImageApi.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { buildSourceMediaNodePayload, getNodeDefaultSize } from "../services/fileService.js";
import { OUTPUT_RATIO_SWITCH_THRESHOLD, calcDisplaySizeByMedia, resolveInputRatioBasis, resolveOutputMediaSize, shouldSwitchToOutputRatio } from "../services/mediaRatioService.js";
import { bindImageFunctionModeMenu, bindImageFunctionModelMenu, buildImageFunctionModeControlHTML, buildImageFunctionModelCatalog, buildImageFunctionModelMenuHTML, closeImageFunctionModelSubmenus, findImageFunctionProviderByModel, getDefaultImageFunctionModelState, getImageFunctionNanoSelection, getImageFunctionModelDisplayName, getImageFunctionModelTriggerIconHTML, resolveImageFunctionModelByMode, syncImageFunctionModeControl, syncImageFunctionModelMenuActive } from "./imageFunctionModelMenu.js";
import { shouldDisableImageSizeControl } from "./imageModelCapabilities.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../utils/debugRequestPreview.js";
import { resolveImageNodeUrl } from "./imageNodeImageUrl.js";
import { waitForImageElementReady } from "./imageOverlayReadiness.js";
import { bindToolbarUpMenus, renderToolbarUpMenu } from "./imageToolbarUpMenu.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch } from "../components/aigenImage/imageGenerationResultRenderer.js";
import { buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { buildAsyncTaskPatch as a1000_0x5e4ac6, buildDreaminaTaskPatch as a1000_0x5203ac, buildRunningHubTaskPatch as a1000_0x46a03a } from "../core/generationTaskProtocolState.js";
import { isTaskCancelled } from "../core/generationTaskUiState.js";
import { isDreaminaImageTaskModel, isRunningHubImageTaskModel, resolveImageTaskProvider, shouldUseRunningHubOpenapiQuery } from "./imageTaskModelResolver.js";
import { onLocaleChange, t } from "../i18n/index.js";
const IMAGE_EXPAND_PROMPT = "移除绿区域，并在绿色区域内生成符合画面的场景";
function imageExpandText(_0x12ee95, _0x474c9b = {}) {
  return t("imageExpand." + _0x12ee95, _0x474c9b);
}
const EXPAND_RATIO_OPTIONS = [{
  value: "original",
  labelKey: "ratio.original"
}, {
  value: "21:9",
  label: "21:9"
}, {
  value: "16:9",
  label: "16:9"
}, {
  value: "9:16",
  label: "9:16"
}, {
  value: "4:3",
  label: "4:3"
}, {
  value: "3:4",
  label: "3:4"
}, {
  value: "1:1",
  label: "1:1"
}];
const EXPAND_IMAGE_SIZE_OPTIONS = [{
  value: "1K",
  label: "1K"
}, {
  value: "2K",
  label: "2K"
}, {
  value: "4K",
  label: "4K"
}];
function getExpandRatioOptions() {
  return EXPAND_RATIO_OPTIONS.map(_0x1c4f40 => ({
    ..._0x1c4f40,
    label: _0x1c4f40.labelKey ? imageExpandText(_0x1c4f40.labelKey) : _0x1c4f40.label,
    selectedLabel: _0x1c4f40.value === "original" ? imageExpandText("ratio.selectedOriginal") : _0x1c4f40.label
  }));
}
function getExpandImageSizeOptions({
  disabled = false
} = {}) {
  return EXPAND_IMAGE_SIZE_OPTIONS.map(_0x472101 => ({
    ..._0x472101,
    disabled: disabled
  }));
}
function isRunningHubTaskModel(_0x339da5, _0x15d2e5) {
  return isRunningHubImageTaskModel(_0x339da5, _0x15d2e5);
}
function isDreaminaTaskModel(_0x5d6444, _0x37ecfb) {
  return isDreaminaImageTaskModel(_0x5d6444, _0x37ecfb);
}
function buildRunningHubTaskPatch({
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false,
  useOpenapiQuery = false
} = {}) {
  return a1000_0x46a03a({
    taskId: taskId,
    status: status,
    startedAt: startedAt,
    recovering: recovering,
    useOpenapiQuery: useOpenapiQuery
  });
}
function buildDreaminaTaskPatch({
  submitId = "",
  status = "pending",
  phase = "generating",
  label = imageExpandText("task.generating"),
  startedAt = 0,
  recovering = false
} = {}) {
  return a1000_0x5203ac({
    submitId: submitId,
    status: status,
    phase: phase,
    label: label,
    startedAt: startedAt,
    recovering: recovering,
    defaultLabel: imageExpandText("task.generating")
  });
}
function buildAsyncTaskPatch({
  provider = "",
  kind = "image",
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false
} = {}) {
  return a1000_0x5e4ac6({
    provider: provider,
    kind: kind,
    taskId: taskId,
    status: status,
    startedAt: startedAt,
    recovering: recovering
  });
}
function persistRunningHubResumeCache() {
  try {
    window._triggerLocalCacheSave?.();
  } catch {}
}
function buildImageExpandOutputText(_0xf86d91, {
  error = ""
} = {}) {
  const _0x3309dc = {
    model: _0xf86d91,
    prompt: imageExpandText("output.promptDisplay"),
    error: error
  };
  if (error) {
    return imageExpandText("output.failed", _0x3309dc);
  } else {
    return imageExpandText("output.started", _0x3309dc);
  }
}
function buildExpandModelCatalog() {
  return buildImageFunctionModelCatalog(IMAGE_MODELS);
}
function findProviderKeyByModel(_0x227158, _0x3d042b) {
  const _0x1a0590 = String(_0x3d042b || "").trim();
  if (!_0x1a0590) {
    return null;
  }
  for (const [_0x301ab6, _0xa32a2e] of Object.entries(_0x227158 || {})) {
    const _0x30b0b3 = Array.isArray(_0xa32a2e?.models) ? _0xa32a2e.models : [];
    if (_0x30b0b3.some(_0x228b40 => _0x228b40?.id === _0x1a0590)) {
      return _0x301ab6;
    }
  }
  return findImageFunctionProviderByModel(_0x227158, _0x1a0590);
}
function buildSeedreamMigrationPatch(_0x49cd56) {
  _0x49cd56;
  return null;
}
const ImageExpandController = {
  active: false,
  nodeId: null,
  nodeData: null,
  ratioStr: "original",
  imageSize: "1K",
  model: null,
  provider: null,
  overlayEl: null,
  frameEl: null,
  frameRect: null,
  _pointerState: null,
  imgEl: null,
  toolbarEl: null,
  ratioMenuEl: null,
  sizeMenuEl: null,
  modelMenuEl: null,
  _unsubscribe: null,
  _view: null,
  _expandModelCatalog: null,
  _unbindToolbarUpMenus: null,
  _unsubscribeLocale: null,
  cleanup: null,
  init(_0x3eeaa4) {
    if (this.active) {
      return;
    }
    const _0x26114a = a1000_0xa09e46.getStateRaw();
    const _0x2c6e9f = _0x26114a.nodes?.[_0x3eeaa4];
    if (!_0x2c6e9f) {
      return;
    }
    this.active = true;
    this.nodeId = _0x3eeaa4;
    this._expandModelCatalog = buildExpandModelCatalog();
    const _0x5af713 = this._normalizeLegacySeedreamNode(_0x2c6e9f);
    this.nodeData = _0x5af713;
    this._view = {
      viewport: _0x26114a.viewport,
      node: _0x5af713
    };
    this.ratioStr = "original";
    this.imageSize = "1K";
    const _0x2b2da5 = this._getExpandModelCatalog();
    const _0x2ead68 = getDefaultImageFunctionModelState(_0x2b2da5);
    const _0x226150 = String(_0x5af713?.model || "").trim();
    const _0x35a607 = String(_0x5af713?.provider || "").trim();
    const _0x30b326 = findProviderKeyByModel(_0x2b2da5, _0x226150);
    if (_0x30b326) {
      this.model = _0x226150;
      this.provider = _0x30b326;
    } else if (_0x2ead68.model) {
      this.model = _0x2ead68.model;
      this.provider = _0x2ead68.provider;
    } else {
      this.model = _0x226150 || "";
      this.provider = resolveImageTaskProvider(_0x226150, _0x35a607, _0x2ead68.provider || "");
    }
    this._createUI();
    this._bindEvents();
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    this._unsubscribe = a1000_0xa09e46.subscribeSelector(_0x2c9f8d => {
      const _0x238aa4 = _0x2c9f8d.nodes?.[_0x3eeaa4];
      const _0x18175a = _0x2c9f8d.viewport || {
        x: 0,
        y: 0,
        zoom: 1
      };
      return {
        hasNode: !!_0x238aa4,
        vx: _0x18175a.x,
        vy: _0x18175a.y,
        vz: _0x18175a.zoom || 1,
        vox: _0x18175a._screenOriginX || 0,
        voy: _0x18175a._screenOriginY || 0,
        nx: _0x238aa4 ? _0x238aa4.x : 0,
        ny: _0x238aa4 ? _0x238aa4.y : 0,
        nw: _0x238aa4 ? _0x238aa4.width : 0,
        nh: _0x238aa4 ? _0x238aa4.height : 0
      };
    }, _0xc65fa1 => {
      if (!_0xc65fa1?.hasNode) {
        return;
      }
      const _0x140918 = a1000_0xa09e46.getStateRaw().nodes?.[_0x3eeaa4];
      if (!_0x140918) {
        return;
      }
      const _0x4e3536 = this._normalizeLegacySeedreamNode(_0x140918);
      this.nodeData = _0x4e3536;
      this._view = {
        viewport: {
          x: _0xc65fa1.vx,
          y: _0xc65fa1.vy,
          zoom: _0xc65fa1.vz,
          _screenOriginX: _0xc65fa1.vox,
          _screenOriginY: _0xc65fa1.voy
        },
        node: _0x4e3536
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
        if (this.active) {
          this._updateView(this._view);
        }
      },
      onError: () => {
        this._cancelImageReadyWait = null;
        if (!this.active) {
          return;
        }
        window.showToast?.(imageExpandText("errors.sourceImageLoadFailed"), "error");
        this.exit();
      }
    });
  },
  _getExpandModelCatalog() {
    if (!this._expandModelCatalog) {
      this._expandModelCatalog = buildExpandModelCatalog();
    }
    return this._expandModelCatalog;
  },
  _normalizeLegacySeedreamNode(_0x6b4cc6) {
    const _0x5ab598 = buildSeedreamMigrationPatch(_0x6b4cc6);
    if (!_0x5ab598) {
      return _0x6b4cc6;
    }
    const _0x57f03d = {
      ...(_0x6b4cc6 || {}),
      ..._0x5ab598
    };
    const _0x40f8ba = a1000_0xa09e46.getStateRaw().nodes?.[this.nodeId];
    if (_0x40f8ba) {
      a1000_0xa09e46.updateNodeData(this.nodeId, _0x5ab598);
    }
    return _0x57f03d;
  },
  _getImageUrl() {
    return resolveImageNodeUrl(this.nodeData || {}, {
      preferPreview: true
    });
  },
  _createExpandedImage(_0x124671, _0x1b07c0) {
    return new Promise((_0x59fa01, _0xcabc54) => {
      const _0x8f7010 = new Image();
      _0x8f7010.crossOrigin = "anonymous";
      _0x8f7010.onload = async () => {
        try {
          const _0x45a9b1 = document.createElement("canvas");
          const _0x48d01e = _0x45a9b1.getContext("2d");
          const _0x255621 = _0x8f7010.naturalWidth;
          const _0x53c8c9 = _0x8f7010.naturalHeight;
          const _0x4c7b14 = _0x124671;
          const _0x46fcc0 = {
            x: _0x1b07c0.x || 0,
            y: _0x1b07c0.y || 0,
            w: _0x1b07c0.width || 1,
            h: _0x1b07c0.height || 1
          };
          const _0x553af4 = _0x255621 / _0x46fcc0.w;
          const _0x24eb02 = _0x53c8c9 / _0x46fcc0.h;
          const _0x56795f = Math.round(_0x4c7b14.w * _0x553af4);
          const _0x16830f = Math.round(_0x4c7b14.h * _0x24eb02);
          _0x45a9b1.width = _0x56795f;
          _0x45a9b1.height = _0x16830f;
          _0x48d01e.fillStyle = "#00FF00";
          _0x48d01e.fillRect(0, 0, _0x56795f, _0x16830f);
          const _0x319099 = Math.round((_0x46fcc0.x - _0x4c7b14.x) * _0x553af4);
          const _0x752269 = Math.round((_0x46fcc0.y - _0x4c7b14.y) * _0x24eb02);
          _0x48d01e.drawImage(_0x8f7010, _0x319099, _0x752269, _0x255621, _0x53c8c9);
          _0x45a9b1.toBlob(_0x316f6d => {
            if (_0x316f6d) {
              const _0x1a2e72 = URL.createObjectURL(_0x316f6d);
              _0x59fa01({
                url: _0x1a2e72,
                width: _0x56795f,
                height: _0x16830f
              });
            } else {
              _0xcabc54(new Error(imageExpandText("errors.createExpandedImageFailed")));
            }
          }, "image/png");
        } catch (_0x2d38e0) {
          _0xcabc54(_0x2d38e0);
        }
      };
      _0x8f7010.onerror = () => {
        _0xcabc54(new Error(imageExpandText("errors.sourceImageLoadFailed")));
      };
      const _0x59c40d = resolveImageNodeUrl(_0x1b07c0, {
        preferPreview: false
      });
      _0x8f7010.src = _0x59c40d;
    });
  },
  _buildGenerationPayload(_0x304840, _0x59ac2e, _0x38f9b0) {
    const _0x11b44d = this.ratioStr === "original";
    return {
      prompt: IMAGE_EXPAND_PROMPT,
      model: _0x304840,
      provider: _0x59ac2e,
      ...(_0x11b44d ? {
        suppressAspectRatio: true
      } : {
        aspectRatio: this.ratioStr
      }),
      imageSize: this.imageSize,
      inputUrls: [_0x38f9b0],
      batchSize: 1
    };
  },
  _formatDebugRequest(_0x2baaa5) {
    return formatFinalApiDebugRequest(_0x2baaa5);
  },
  _upsertDebugNode(_0x207c48, _0x464e4e) {
    const _0x47a1da = a1000_0xa09e46.getStateRaw();
    const _0x66a8e = _0x464e4e || _0x47a1da.nodes?.[this.nodeId] || this.nodeData || {};
    const _0xbf73dc = getNodeDefaultSize("debug");
    const {
      x: _0x7e36ce,
      y: _0x4a7b62
    } = calcSafeSpawnPosNearNode(_0x47a1da.nodes, _0x66a8e, _0xbf73dc.width, _0xbf73dc.height);
    const _0x68d574 = Object.values(_0x47a1da.nodes).find(_0x3d56f9 => _0x3d56f9.type === "debug");
    if (!_0x68d574) {
      a1000_0xa09e46.addNode({
        id: "debug-" + Date.now(),
        type: "debug",
        x: _0x7e36ce,
        y: _0x4a7b62,
        ..._0xbf73dc,
        name: imageExpandText("debug.nodeName"),
        outputText: _0x207c48
      });
    } else {
      a1000_0xa09e46.updateNodeData(_0x68d574.id, {
        outputText: _0x207c48,
        x: _0x7e36ce,
        y: _0x4a7b62
      });
    }
  },
  async _handleDebug() {
    let _0x47d445 = null;
    try {
      const _0x19f7a9 = a1000_0xa09e46.getStateRaw();
      const _0x2002ca = _0x19f7a9.nodes?.[this.nodeId];
      if (!_0x2002ca) {
        window.showToast?.(imageExpandText("toasts.sourceNodeMissing"), "warn");
        return;
      }
      if (!this.frameRect) {
        this.frameRect = this._calcFrameWorldRect();
      }
      const _0x32736b = String(this.model || "").trim();
      const _0x47c5ae = resolveImageTaskProvider(_0x32736b, this.provider, "");
      _0x47d445 = await this._createExpandedImage({
        ...this.frameRect
      }, {
        ..._0x2002ca
      });
      const _0x333a81 = this._buildGenerationPayload(_0x32736b, _0x47c5ae, _0x47d445.url);
      const _0x1bf332 = await buildGenerateImageRequest(_0x333a81);
      this._upsertDebugNode(this._formatDebugRequest(_0x1bf332), _0x2002ca);
      window.showToast?.(imageExpandText("toasts.debugShown"), "warn");
    } catch (_0x439dda) {
      console.error("[ImageExpandController] 调试请求构建失败:", _0x439dda);
      window.showToast?.(imageExpandText("toasts.debugBuildFailed", {
        error: _0x439dda?.message || imageExpandText("errors.unknown")
      }), "error");
    } finally {
      if (_0x47d445?.url) {
        URL.revokeObjectURL(_0x47d445.url);
      }
    }
  },
  _parseRatio() {
    if (this.ratioStr === "original") {
      return (this.nodeData.width || 1) / (this.nodeData.height || 1);
    }
    const _0x1cc622 = this.ratioStr.split(":").map(_0x9936e => Number(_0x9936e));
    if (_0x1cc622.length !== 2 || !_0x1cc622[0] || !_0x1cc622[1]) {
      return (this.nodeData.width || 1) / (this.nodeData.height || 1);
    }
    return _0x1cc622[0] / _0x1cc622[1];
  },
  _calcFrameWorldRect() {
    const _0x2ffded = this.nodeData;
    const _0x3720a9 = _0x2ffded.width || 1;
    const _0x369cb6 = _0x2ffded.height || 1;
    const _0x310707 = _0x2ffded.x + _0x3720a9 / 2;
    const _0x5d9d45 = _0x2ffded.y + _0x369cb6 / 2;
    const _0x541cd9 = _0x3720a9 / _0x369cb6;
    const _0x1271c2 = this._parseRatio();
    let _0x126eeb;
    let _0x480844;
    if (_0x1271c2 >= _0x541cd9) {
      _0x480844 = _0x369cb6;
      _0x126eeb = _0x369cb6 * _0x1271c2;
    } else {
      _0x126eeb = _0x3720a9;
      _0x480844 = _0x3720a9 / _0x1271c2;
    }
    const _0x309456 = 1.35;
    const _0xa7503d = Math.max(_0x3720a9, _0x126eeb) * _0x309456;
    const _0x1c952d = Math.max(_0x369cb6, _0x480844) * _0x309456;
    return {
      x: _0x310707 - _0xa7503d / 2,
      y: _0x5d9d45 - _0x1c952d / 2,
      w: _0xa7503d,
      h: _0x1c952d
    };
  },
  _getNodeWorldRect() {
    const _0x32aa90 = this.nodeData || {};
    const _0x2f1afb = _0x32aa90.width || 1;
    const _0x24ab53 = _0x32aa90.height || 1;
    return {
      x: _0x32aa90.x || 0,
      y: _0x32aa90.y || 0,
      w: _0x2f1afb,
      h: _0x24ab53
    };
  },
  _clampFrameRect(_0x3198d3) {
    const _0x43e8af = this._getNodeWorldRect();
    const _0x57f808 = (_0x5005e1, _0x1e11ae, _0x1bf9c0) => Math.min(_0x1bf9c0, Math.max(_0x1e11ae, _0x5005e1));
    const _0x8bac1d = {
      x: Number(_0x3198d3?.x) || 0,
      y: Number(_0x3198d3?.y) || 0,
      w: Number(_0x3198d3?.w) || 1,
      h: Number(_0x3198d3?.h) || 1
    };
    const _0x5bfc7f = Math.max(_0x43e8af.w, 24);
    const _0x4a2fca = Math.max(_0x43e8af.h, 24);
    _0x8bac1d.w = Math.max(_0x8bac1d.w, _0x5bfc7f);
    _0x8bac1d.h = Math.max(_0x8bac1d.h, _0x4a2fca);
    if (this.ratioStr !== "original") {
      const _0x58436c = this._parseRatio();
      const _0x443b19 = _0x8bac1d.x + _0x8bac1d.w / 2;
      const _0x46e84b = _0x8bac1d.y + _0x8bac1d.h / 2;
      let _0x3bf429 = _0x8bac1d.w;
      let _0x589680 = _0x8bac1d.h;
      if (_0x3bf429 / _0x589680 > _0x58436c) {
        _0x589680 = _0x3bf429 / _0x58436c;
      } else {
        _0x3bf429 = _0x589680 * _0x58436c;
      }
      if (_0x3bf429 < _0x5bfc7f) {
        _0x3bf429 = _0x5bfc7f;
        _0x589680 = _0x3bf429 / _0x58436c;
      }
      if (_0x589680 < _0x4a2fca) {
        _0x589680 = _0x4a2fca;
        _0x3bf429 = _0x589680 * _0x58436c;
      }
      _0x8bac1d.w = _0x3bf429;
      _0x8bac1d.h = _0x589680;
      _0x8bac1d.x = _0x443b19 - _0x8bac1d.w / 2;
      _0x8bac1d.y = _0x46e84b - _0x8bac1d.h / 2;
    }
    const _0x4be955 = _0x43e8af.x + _0x43e8af.w - _0x8bac1d.w;
    const _0x38146c = _0x43e8af.x;
    const _0x6f008a = _0x43e8af.y + _0x43e8af.h - _0x8bac1d.h;
    const _0x30ef6f = _0x43e8af.y;
    _0x8bac1d.x = _0x57f808(_0x8bac1d.x, _0x4be955, _0x38146c);
    _0x8bac1d.y = _0x57f808(_0x8bac1d.y, _0x6f008a, _0x30ef6f);
    return _0x8bac1d;
  },
  _closeToolbarUpMenus(_0x36e7e6 = null) {
    this.toolbarEl?.querySelectorAll("[data-toolbar-up-menu-menu]").forEach(_0x380bce => {
      if (_0x380bce === _0x36e7e6) {
        return;
      }
      const _0x108fbb = String(_0x380bce?.dataset?.toolbarUpMenuOpenClass || "open").trim() || "open";
      _0x380bce.classList.remove(_0x108fbb);
      _0x380bce.classList.remove("open");
      _0x380bce.classList.remove("show");
    });
  },
  _createUI() {
    const _0x1510ad = document.createElement("div");
    _0x1510ad.className = "v2-expand-overlay";
    const _0xc587b5 = document.createElement("div");
    _0xc587b5.className = "v2-expand-frame";
    ["tl", "tr", "bl", "br", "tm", "bm", "lm", "rm"].forEach(_0x3e42ad => {
      const _0x1bd5b7 = document.createElement("div");
      _0x1bd5b7.className = "v2-expand-handle " + _0x3e42ad;
      _0x1bd5b7.dataset.handle = _0x3e42ad;
      _0xc587b5.appendChild(_0x1bd5b7);
    });
    const _0x42ad9d = document.createElement("img");
    _0x42ad9d.className = "v2-expand-img";
    _0x42ad9d.draggable = false;
    _0x42ad9d.src = this._getImageUrl();
    _0x1510ad.appendChild(_0xc587b5);
    _0x1510ad.appendChild(_0x42ad9d);
    document.body.appendChild(_0x1510ad);
    this.overlayEl = _0x1510ad;
    this.frameEl = _0xc587b5;
    this.imgEl = _0x42ad9d;
    this.frameRect = this._calcFrameWorldRect();
    const _0x2a2b83 = document.createElement("div");
    _0x2a2b83.className = "v2-expand-toolbar";
    const _0x3f6fc5 = this._getExpandModelCatalog();
    const _0x3c5519 = getImageFunctionModelDisplayName(this.model, _0x3f6fc5);
    const _0x590d49 = getImageFunctionModelTriggerIconHTML(this.model, this.provider);
    const _0x36f614 = shouldDisableImageSizeControl(this.model, this.provider);
    const _0xd4608d = buildImageFunctionModelMenuHTML({
      activeModel: this.model,
      activeProvider: this.provider,
      modelCatalog: _0x3f6fc5
    });
    _0x2a2b83.innerHTML = "\n      <button class=\"v2-expand-toolbar-btn exit\" title=\"" + imageExpandText("actions.exit") + "\">\n        <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg>\n      </button>\n      <div class=\"v2-expand-divider\"></div>\n      " + renderToolbarUpMenu({
      fieldId: "ratio",
      value: this.ratioStr,
      options: getExpandRatioOptions(),
      triggerClass: "ratio-toggle",
      labelClass: "ratio-text",
      menuClass: "v2-expand-menu ratio-menu",
      itemClass: "v2-expand-menu-item"
    }) + "\n      " + renderToolbarUpMenu({
      fieldId: "size",
      value: this.imageSize,
      options: getExpandImageSizeOptions({
        disabled: _0x36f614
      }),
      triggerClass: "size-toggle",
      labelClass: "size-text",
      menuClass: "v2-expand-menu size-menu",
      itemClass: "v2-expand-menu-item",
      disabled: _0x36f614
    }) + "\n      <div class=\"v2-expand-wrap\">\n        <button class=\"v2-expand-toolbar-btn model-toggle\">\n          <span class=\"image-function-model-trigger-icon-slot\">" + _0x590d49 + "</span>\n          <span class=\"model-text\">" + _0x3c5519 + "</span>\n          <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"opacity:0.5;margin-left:2px;\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>\n        </button>\n        <div class=\"floating-menu img-model-menu model-menu\">\n          " + _0xd4608d + "\n        </div>\n      </div>\n      " + buildImageFunctionModeControlHTML({
      model: this.model,
      provider: this.provider,
      imageSize: this.imageSize,
      wrapClass: "v2-expand-wrap",
      buttonClass: "v2-expand-toolbar-btn"
    }) + "\n      <button class=\"v2-expand-toolbar-btn debug-wrench-btn\" type=\"button\" title=\"" + imageExpandText("actions.debugApiParams") + "\" aria-label=\"" + imageExpandText("actions.debugApiParams") + "\">\n        " + DEBUG_WRENCH_ICON_HTML + "\n      </button>\n      <button class=\"v2-expand-toolbar-btn go img-gen-btn\" title=\"" + imageExpandText("actions.generate") + "\">\n        <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 19V5\"/><path d=\"M5 12l7-7 7 7\"/></svg>\n      </button>\n    ";
    document.body.appendChild(_0x2a2b83);
    this.toolbarEl = _0x2a2b83;
    this.ratioMenuEl = _0x2a2b83.querySelector(".ratio-menu");
    this.sizeMenuEl = _0x2a2b83.querySelector(".size-menu");
    this.modelMenuEl = _0x2a2b83.querySelector(".model-menu");
    this._updateView(this._view);
    this._syncLocaleTexts();
  },
  _syncLocaleTexts() {
    if (!this.toolbarEl) {
      return;
    }
    const _0x1f9017 = this.toolbarEl.querySelector(".exit");
    if (_0x1f9017) {
      _0x1f9017.title = imageExpandText("actions.exit");
    }
    const _0x453c31 = this.toolbarEl.querySelector(".debug-wrench-btn");
    if (_0x453c31) {
      const _0x5c5a18 = imageExpandText("actions.debugApiParams");
      _0x453c31.title = _0x5c5a18;
      _0x453c31.setAttribute("aria-label", _0x5c5a18);
    }
    const _0x50a5c5 = this.toolbarEl.querySelector(".go");
    if (_0x50a5c5) {
      _0x50a5c5.title = imageExpandText("actions.generate");
    }
    const _0x33ecc8 = (_0x285415, _0x7c4ee3, _0x48b74d) => {
      const _0x21e983 = new Map(_0x7c4ee3.map(_0x328bb6 => [String(_0x328bb6.value || ""), _0x328bb6]));
      const _0x35810e = this.toolbarEl.querySelector("[data-toolbar-up-menu=\"" + _0x285415 + "\"]");
      const _0x45a2fc = _0x21e983.get(String(_0x48b74d || "")) || _0x7c4ee3[0];
      const _0x25f27a = _0x35810e?.querySelector("[data-toolbar-up-menu-label]");
      if (_0x25f27a && _0x45a2fc) {
        _0x25f27a.textContent = _0x45a2fc.selectedLabel || _0x45a2fc.label || _0x48b74d;
      }
      _0x35810e?.querySelectorAll("[data-toolbar-up-menu-item]")?.forEach(_0x1573e4 => {
        const _0x43efce = _0x21e983.get(String(_0x1573e4.dataset.toolbarUpMenuValue || ""));
        if (!_0x43efce) {
          return;
        }
        _0x1573e4.dataset.toolbarUpMenuLabel = _0x43efce.selectedLabel || _0x43efce.label;
        const _0x1b11e8 = _0x1573e4.querySelector(".floating-menu-label");
        if (_0x1b11e8) {
          _0x1b11e8.textContent = _0x43efce.label;
        }
      });
    };
    _0x33ecc8("ratio", getExpandRatioOptions(), this.ratioStr);
    _0x33ecc8("size", getExpandImageSizeOptions({
      disabled: shouldDisableImageSizeControl(this.model, this.provider)
    }), this.imageSize);
  },
  _updateView(_0x26017b = this._view) {
    if (!this.active) {
      return;
    }
    const _0x4527fb = _0x26017b?.node;
    const _0x55a982 = _0x26017b?.viewport;
    if (!_0x4527fb) {
      return;
    }
    this.nodeData = _0x4527fb;
    if (!this.frameRect) {
      this.frameRect = this._calcFrameWorldRect();
    }
    this.frameRect = this._clampFrameRect(this.frameRect);
    const _0x526828 = this.frameRect;
    const _0x5cd993 = worldToScreen(_0x526828.x, _0x526828.y, _0x55a982);
    const _0x3161d4 = Math.round(_0x526828.w * _0x55a982.zoom);
    const _0x1a2552 = Math.round(_0x526828.h * _0x55a982.zoom);
    this.frameEl.style.left = Math.round(_0x5cd993.x) + "px";
    this.frameEl.style.top = Math.round(_0x5cd993.y) + "px";
    this.frameEl.style.width = _0x3161d4 + "px";
    this.frameEl.style.height = _0x1a2552 + "px";
    const _0x5b2de8 = worldToScreen(_0x4527fb.x, _0x4527fb.y, _0x55a982);
    const _0x357ba7 = Math.round(_0x4527fb.width * _0x55a982.zoom);
    const _0x1bf2fb = Math.round(_0x4527fb.height * _0x55a982.zoom);
    this.imgEl.style.left = Math.round(_0x5b2de8.x) + "px";
    this.imgEl.style.top = Math.round(_0x5b2de8.y) + "px";
    this.imgEl.style.width = _0x357ba7 + "px";
    this.imgEl.style.height = _0x1bf2fb + "px";
    if (this.toolbarEl) {
      const _0x2923c0 = _0x5b2de8.y + _0x1bf2fb + 14;
      this.toolbarEl.style.top = _0x2923c0 + "px";
      this.toolbarEl.style.left = _0x5b2de8.x + _0x357ba7 / 2 + "px";
      this.toolbarEl.style.transform = "translateX(-50%)";
      this.toolbarEl.style.bottom = "auto";
    }
  },
  _bindEvents() {
    const _0x48bc02 = () => this._updateView(this._view);
    window.addEventListener("resize", _0x48bc02);
    const _0x1364d7 = _0x5423e7 => {
      if (_0x5423e7.key === "Escape") {
        this.exit();
      }
    };
    window.addEventListener("keydown", _0x1364d7);
    const _0x4106af = _0x5e9d0c => _0x5e9d0c.stopPropagation();
    this.overlayEl.addEventListener("wheel", _0x4106af, {
      passive: false
    });
    const _0x573b16 = this.modelMenuEl;
    const _0x46d618 = this.toolbarEl.querySelector(".model-text");
    const _0x423605 = this.toolbarEl.querySelector(".image-function-model-trigger-icon-slot");
    const _0x4d2c07 = this.toolbarEl.querySelector(".model-toggle");
    const _0x29d213 = this.toolbarEl.querySelector(".image-function-mode-toggle");
    const _0x3ba5ac = this.toolbarEl.querySelector(".image-function-mode-menu");
    const _0x114dc1 = this._getExpandModelCatalog();
    const _0x48ed05 = () => {
      const _0x2c5ca0 = shouldDisableImageSizeControl(this.model, this.provider);
      const _0x2805e0 = this.toolbarEl.querySelector(".size-toggle");
      if (_0x2805e0) {
        _0x2805e0.disabled = _0x2c5ca0;
        _0x2805e0.classList.toggle("is-disabled", _0x2c5ca0);
        _0x2805e0.setAttribute("aria-disabled", _0x2c5ca0 ? "true" : "false");
      }
      this.sizeMenuEl?.querySelectorAll("[data-toolbar-up-menu-field=\"size\"]").forEach(_0x3ad536 => {
        _0x3ad536.classList.toggle("disabled", _0x2c5ca0);
        _0x3ad536.dataset.disabled = _0x2c5ca0 ? "true" : "false";
      });
      if (_0x2c5ca0) {
        this.sizeMenuEl?.classList.remove("open");
      }
    };
    const _0xcddd0 = () => syncImageFunctionModeControl({
      root: this.toolbarEl,
      model: this.model,
      provider: this.provider,
      imageSize: this.imageSize
    });
    const _0x358f21 = (_0x16eb5c, _0x55cfd2, {
      syncStore = true
    } = {}) => {
      const _0x3606d4 = String(_0x16eb5c || "").trim();
      const _0x90dcf9 = String(resolveImageTaskProvider(_0x3606d4, _0x55cfd2, "")).trim();
      if (!_0x3606d4 || !_0x90dcf9) {
        return;
      }
      const _0x4ba778 = this.model !== _0x3606d4 || this.provider !== _0x90dcf9;
      this.model = _0x3606d4;
      this.provider = _0x90dcf9;
      if (_0x46d618) {
        _0x46d618.textContent = getImageFunctionModelDisplayName(_0x3606d4, _0x114dc1);
      }
      if (_0x423605) {
        _0x423605.innerHTML = getImageFunctionModelTriggerIconHTML(_0x3606d4, _0x90dcf9);
      }
      syncImageFunctionModelMenuActive({
        modelMenu: _0x573b16,
        model: _0x3606d4,
        provider: _0x90dcf9
      });
      _0xcddd0();
      _0x48ed05();
      if (syncStore && _0x4ba778) {
        a1000_0xa09e46.updateNodeData(this.nodeId, {
          model: _0x3606d4,
          provider: _0x90dcf9
        });
      }
    };
    const _0x4d2f7d = () => {
      this._closeToolbarUpMenus();
      this.modelMenuEl?.classList.remove("show");
      _0x3ba5ac?.classList.remove("show");
      closeImageFunctionModelSubmenus(this.modelMenuEl);
    };
    this.toolbarEl.querySelector(".exit").onclick = () => this.exit();
    this._unbindToolbarUpMenus = bindToolbarUpMenus(this.toolbarEl, {
      onBeforeOpen: () => {
        this.modelMenuEl?.classList.remove("show");
        _0x3ba5ac?.classList.remove("show");
        closeImageFunctionModelSubmenus(this.modelMenuEl);
      },
      onSelect: ({
        fieldId: _0x12ddf3,
        value: _0x56704d
      }) => {
        if (_0x12ddf3 === "ratio") {
          this.ratioStr = String(_0x56704d || "original").trim() || "original";
          this.frameRect = this._calcFrameWorldRect();
          this._updateView(this._view);
          return;
        }
        if (_0x12ddf3 === "size") {
          if (shouldDisableImageSizeControl(this.model, this.provider)) {
            return;
          }
          this.imageSize = String(_0x56704d || "1K").trim() || "1K";
          const _0x2fe664 = getImageFunctionNanoSelection(this.model, this.provider, this.imageSize);
          if (_0x2fe664) {
            const _0x4e5ca8 = resolveImageFunctionModelByMode({
              model: this.model,
              provider: this.provider,
              imageSize: this.imageSize,
              mode: _0x2fe664.mode
            });
            if (_0x4e5ca8?.model) {
              _0x358f21(_0x4e5ca8.model, _0x4e5ca8.provider);
            }
          }
          _0xcddd0();
          _0x48ed05();
        }
      }
    });
    if (_0x4d2c07 && _0x573b16 && _0x46d618) {
      _0x4d2c07.addEventListener("click", _0x5a5125 => {
        _0x5a5125.stopPropagation();
        _0x573b16.classList.toggle("show");
        this._closeToolbarUpMenus();
        _0x3ba5ac?.classList.remove("show");
      });
      const _0x3ed108 = bindImageFunctionModelMenu({
        modelMenu: _0x573b16,
        onSelect: ({
          model: _0x325de1,
          provider: _0x223f00
        }) => {
          _0x358f21(_0x325de1, _0x223f00);
        },
        closeMenu: () => {
          _0x573b16.classList.remove("show");
        }
      });
      const _0xf131a0 = bindImageFunctionModeMenu({
        modeMenu: _0x3ba5ac,
        onSelect: ({
          mode: _0x4909a6
        }) => {
          const _0x1d580b = resolveImageFunctionModelByMode({
            model: this.model,
            provider: this.provider,
            imageSize: this.imageSize,
            mode: _0x4909a6
          });
          if (!_0x1d580b?.model) {
            return;
          }
          _0x358f21(_0x1d580b.model, _0x1d580b.provider);
          _0x3ba5ac?.classList.remove("show");
        }
      });
      if (_0x29d213 && _0x3ba5ac) {
        _0x29d213.addEventListener("click", _0x436074 => {
          _0x436074.stopPropagation();
          if (_0x29d213.closest(".image-function-mode-wrap")?.classList.contains("is-hidden")) {
            return;
          }
          _0x3ba5ac.classList.toggle("show");
          this._closeToolbarUpMenus(_0x3ba5ac);
          _0x573b16.classList.remove("show");
          closeImageFunctionModelSubmenus(_0x573b16);
        });
      }
      this._unbindImageFunctionMenus = () => {
        _0x3ed108?.();
        _0xf131a0?.();
      };
    }
    _0xcddd0();
    _0x48ed05();
    const _0x110968 = this.toolbarEl.querySelector(".debug-wrench-btn");
    _0x110968.onclick = _0x124d1b => {
      _0x124d1b.stopPropagation();
      _0x124d1b.preventDefault();
      _0x4d2f7d();
      this._handleDebug();
    };
    this.toolbarEl.querySelector(".go").onclick = async () => {
      let _0x4bb8c9 = null;
      let _0x1bb225 = null;
      let _0x35d998 = resolveInputRatioBasis();
      const _0x47b5a6 = String(this.model || "").trim();
      const _0x4f2055 = resolveImageTaskProvider(_0x47b5a6, this.provider, "");
      const _0x20164c = isRunningHubTaskModel(_0x47b5a6, _0x4f2055);
      const _0x87a98 = isDreaminaTaskModel(_0x47b5a6, _0x4f2055);
      const _0xb850cb = !_0x20164c && !_0x87a98;
      const _0x597079 = String(_0x4f2055 || "").trim().toLowerCase();
      const _0x1eda9a = shouldUseRunningHubOpenapiQuery(_0x47b5a6, _0x4f2055);
      const _0x1633da = Date.now();
      try {
        window.showToast?.(imageExpandText("toasts.generating"), "loading");
        const _0x17b3e4 = a1000_0xa09e46.getStateRaw();
        const _0x330c63 = _0x17b3e4.nodes?.[this.nodeId];
        if (!_0x330c63) {
          return;
        }
        const _0x1d5599 = {
          ...this.frameRect
        };
        const _0x439b84 = {
          ..._0x330c63
        };
        _0x35d998 = resolveInputRatioBasis({
          width: _0x1d5599?.w,
          height: _0x1d5599?.h
        }, {
          width: _0x330c63.width,
          height: _0x330c63.height
        });
        const {
          width: _0xf202db,
          height: _0x45d7c0
        } = calcDisplaySizeByMedia(_0x35d998.width, _0x35d998.height);
        const {
          x: _0x14fbba,
          y: _0x42c4f0
        } = calcSafeSpawnPosNearNode(_0x17b3e4.nodes, _0x330c63, _0xf202db, _0x45d7c0);
        _0x4bb8c9 = generateId("source-image-expand");
        const _0x692131 = () => {
          return isTaskCancelled(a1000_0xa09e46.getState().nodes?.[_0x4bb8c9]);
        };
        a1000_0xa09e46.addNode(buildSourceMediaNodePayload({
          id: _0x4bb8c9,
          type: "source-image",
          x: _0x14fbba,
          y: _0x42c4f0,
          width: _0xf202db,
          height: _0x45d7c0,
          needsAutoResize: false,
          name: imageExpandText("output.generatingName"),
          src: "",
          ...buildGenerationStartPatch({
            startedAt: _0x1633da
          }),
          ...(_0x20164c || _0x87a98 || _0xb850cb ? {
            provider: _0x4f2055,
            model: _0x47b5a6
          } : {}),
          ...(_0x20164c ? {
            rhSourceNodeId: _0x330c63.id,
            rhToolbarTaskType: "image-expand"
          } : {}),
          ...(_0x20164c ? buildRunningHubTaskPatch({
            taskId: "",
            status: "pending",
            startedAt: _0x1633da,
            recovering: false,
            useOpenapiQuery: _0x1eda9a
          }) : {}),
          ...(_0x87a98 ? buildDreaminaTaskPatch({
            submitId: "",
            status: "pending",
            phase: "generating",
            label: imageExpandText("task.submitting"),
            startedAt: _0x1633da,
            recovering: false
          }) : {}),
          ...(_0xb850cb ? buildAsyncTaskPatch({
            provider: _0x597079,
            kind: "image",
            taskId: "",
            status: "pending",
            startedAt: _0x1633da,
            recovering: false
          }) : {}),
          outputText: buildImageExpandOutputText(getDisplayModelName(this.model))
        }));
        if (_0x20164c || _0x87a98 || _0xb850cb) {
          persistRunningHubResumeCache();
        }
        a1000_0xa09e46.setSelectedNodes([_0x4bb8c9]);
        this.exit();
        _0x1bb225 = await this._createExpandedImage(_0x1d5599, _0x439b84);
        _0x35d998 = resolveInputRatioBasis({
          width: _0x1bb225?.width,
          height: _0x1bb225?.height
        }, _0x35d998);
        const _0x2a1f70 = this._buildGenerationPayload(_0x47b5a6, _0x4f2055, _0x1bb225.url);
        const _0x169fcd = await generateImage(_0x2a1f70, {
          onTaskMeta: ({
            taskId: _0x4cc0b2,
            useOpenapiQuery: _0x310c5c,
            provider: _0x584dca,
            providerProfileId: _0x426b15,
            rhProviderProfileId: _0x32d57d
          }) => {
            const _0x1b213d = String(_0x4cc0b2 || "").trim();
            if (!_0x1b213d) {
              return;
            }
            const _0x475958 = a1000_0xa09e46.getState().nodes?.[_0x4bb8c9];
            if (!_0x475958) {
              return;
            }
            if (_0x692131()) {
              return;
            }
            if (_0x20164c) {
              const _0x1bca74 = String(_0x426b15 || _0x32d57d || "").trim();
              a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
                ...(_0x1bca74 ? {
                  taskProviderProfileId: _0x1bca74,
                  providerProfileId: _0x1bca74,
                  rhProviderProfileId: _0x1bca74
                } : {}),
                ...buildRunningHubTaskPatch({
                  taskId: _0x1b213d,
                  status: "running",
                  startedAt: _0x1633da,
                  recovering: false,
                  useOpenapiQuery: _0x310c5c === true
                })
              });
              persistRunningHubResumeCache();
              return;
            }
            if (_0x87a98) {
              a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
                ...buildDreaminaTaskPatch({
                  submitId: _0x1b213d,
                  status: "pending",
                  phase: "generating",
                  label: imageExpandText("task.generating"),
                  startedAt: _0x1633da,
                  recovering: false
                })
              });
              persistRunningHubResumeCache();
              return;
            }
            if (_0xb850cb) {
              a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
                ...buildAsyncTaskPatch({
                  provider: String(_0x584dca || _0x475958?.asyncTaskProvider || _0x597079).trim(),
                  kind: "image",
                  taskId: _0x1b213d,
                  status: "running",
                  startedAt: _0x1633da,
                  recovering: false
                })
              });
              persistRunningHubResumeCache();
            }
          },
          onTaskId: _0x5f218a => {
            const _0x1b5fe9 = String(_0x5f218a || "").trim();
            if (!_0x1b5fe9) {
              return;
            }
            const _0x315527 = a1000_0xa09e46.getState().nodes?.[_0x4bb8c9];
            if (!_0x315527) {
              return;
            }
            if (_0x692131()) {
              return;
            }
            if (_0x20164c) {
              a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
                ...buildRunningHubTaskPatch({
                  taskId: _0x1b5fe9,
                  status: "running",
                  startedAt: _0x1633da,
                  recovering: false,
                  useOpenapiQuery: _0x315527?.rhTaskUseOpenapiQuery === true || _0x1eda9a
                })
              });
              persistRunningHubResumeCache();
              return;
            }
            if (_0x87a98) {
              a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
                ...buildDreaminaTaskPatch({
                  submitId: _0x1b5fe9,
                  status: "pending",
                  phase: "generating",
                  label: imageExpandText("task.generating"),
                  startedAt: _0x1633da,
                  recovering: false
                })
              });
              persistRunningHubResumeCache();
              return;
            }
            if (_0xb850cb) {
              a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
                ...buildAsyncTaskPatch({
                  provider: String(_0x315527?.asyncTaskProvider || _0x597079).trim(),
                  kind: "image",
                  taskId: _0x1b5fe9,
                  status: "running",
                  startedAt: _0x1633da,
                  recovering: false
                })
              });
              persistRunningHubResumeCache();
            }
          }
        });
        if (_0x692131()) {
          return;
        }
        if (_0x169fcd.error) {
          const _0x17a665 = a1000_0xa09e46.getState().nodes?.[_0x4bb8c9];
          const _0x5eb14d = _0x17a665?.generationStartTime ? Date.now() - _0x17a665.generationStartTime : 0;
          a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
            ...buildImageGenerationFailurePatch({
              error: _0x169fcd.error,
              startedAt: _0x1633da,
              duration: _0x5eb14d
            }),
            name: imageExpandText("output.failedName"),
            ...(_0x20164c ? buildRunningHubTaskPatch({
              taskId: _0x17a665?.rhTaskId || "",
              status: "failed",
              startedAt: _0x1633da,
              recovering: false,
              useOpenapiQuery: _0x17a665?.rhTaskUseOpenapiQuery === true || _0x1eda9a
            }) : {}),
            ...(_0x87a98 ? buildDreaminaTaskPatch({
              submitId: _0x17a665?.dreaminaSubmitId || "",
              status: "failed",
              phase: "failed",
              label: _0x169fcd.error || imageExpandText("task.failed"),
              startedAt: _0x1633da,
              recovering: false
            }) : {}),
            ...(_0xb850cb ? buildAsyncTaskPatch({
              provider: _0x17a665?.asyncTaskProvider || _0x597079,
              kind: "image",
              taskId: _0x17a665?.asyncTaskId || "",
              status: "failed",
              startedAt: _0x1633da,
              recovering: false
            }) : {}),
            outputText: buildImageExpandOutputText(getDisplayModelName(this.model), {
              error: _0x169fcd.error
            })
          });
          if (_0x20164c || _0x87a98 || _0xb850cb) {
            persistRunningHubResumeCache();
          }
          return;
        }
        const _0x1ad7ac = a1000_0xa09e46.getState().nodes?.[_0x4bb8c9];
        const _0x2bc42f = _0x1ad7ac?.generationStartTime ? Date.now() - _0x1ad7ac.generationStartTime : 0;
        const _0x2188c5 = await resolveOutputMediaSize({
          localPath: _0x169fcd.localPath,
          imageUrl: _0x169fcd.imageUrl,
          sourceUrl: _0x169fcd.sourceUrl,
          thumbUrl: _0x169fcd.thumbUrl,
          src: _0x169fcd.imageUrl || _0x169fcd.sourceUrl || _0x169fcd.thumbUrl || ""
        });
        const _0x1c254d = _0x2188c5 && shouldSwitchToOutputRatio(_0x35d998.width, _0x35d998.height, _0x2188c5.width, _0x2188c5.height, OUTPUT_RATIO_SWITCH_THRESHOLD) ? calcDisplaySizeByMedia(_0x2188c5.width, _0x2188c5.height) : calcDisplaySizeByMedia(_0x35d998.width, _0x35d998.height);
        a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
          ...buildImageGenerationResultPatch(_0x169fcd, {
            startedAt: _0x1633da,
            duration: _0x2bc42f
          }),
          name: imageExpandText("output.resultName"),
          width: _0x1c254d.width,
          height: _0x1c254d.height,
          ...(_0x20164c ? buildRunningHubTaskPatch({
            taskId: _0x1ad7ac?.rhTaskId || "",
            status: "success",
            startedAt: _0x1633da,
            recovering: false,
            useOpenapiQuery: _0x1ad7ac?.rhTaskUseOpenapiQuery === true || _0x1eda9a
          }) : {}),
          ...(_0x87a98 ? buildDreaminaTaskPatch({
            submitId: _0x1ad7ac?.dreaminaSubmitId || "",
            status: "success",
            phase: "done",
            label: imageExpandText("task.completed"),
            startedAt: _0x1633da,
            recovering: false
          }) : {}),
          ...(_0xb850cb ? buildAsyncTaskPatch({
            provider: _0x1ad7ac?.asyncTaskProvider || _0x597079,
            kind: "image",
            taskId: _0x1ad7ac?.asyncTaskId || "",
            status: "success",
            startedAt: _0x1633da,
            recovering: false
          }) : {}),
          outputText: buildImageExpandOutputText(getDisplayModelName(this.model))
        });
        if (_0x20164c || _0x87a98 || _0xb850cb) {
          persistRunningHubResumeCache();
        }
        window.showToast?.(imageExpandText("toasts.success"), "success");
      } catch (_0x267e54) {
        console.error("扩图生成失败:", _0x267e54);
        if (_0x4bb8c9) {
          const _0x3ffa0c = a1000_0xa09e46.getState().nodes?.[_0x4bb8c9];
          if (isTaskCancelled(_0x3ffa0c)) {
            return;
          }
          const _0x422fd9 = _0x3ffa0c?.generationStartTime ? Date.now() - _0x3ffa0c.generationStartTime : 0;
          const _0x2f64b8 = _0x267e54.message || imageExpandText("errors.unknown");
          a1000_0xa09e46.updateNodeData(_0x4bb8c9, {
            ...buildImageGenerationFailurePatch({
              error: _0x2f64b8,
              startedAt: _0x1633da,
              duration: _0x422fd9
            }),
            name: imageExpandText("output.failedName"),
            ...(_0x20164c ? buildRunningHubTaskPatch({
              taskId: _0x3ffa0c?.rhTaskId || "",
              status: "failed",
              startedAt: _0x1633da,
              recovering: false,
              useOpenapiQuery: _0x3ffa0c?.rhTaskUseOpenapiQuery === true || _0x1eda9a
            }) : {}),
            ...(_0x87a98 ? buildDreaminaTaskPatch({
              submitId: _0x3ffa0c?.dreaminaSubmitId || "",
              status: "failed",
              phase: "failed",
              label: _0x2f64b8 || imageExpandText("task.failed"),
              startedAt: _0x1633da,
              recovering: false
            }) : {}),
            ...(_0xb850cb ? buildAsyncTaskPatch({
              provider: _0x3ffa0c?.asyncTaskProvider || _0x597079,
              kind: "image",
              taskId: _0x3ffa0c?.asyncTaskId || "",
              status: "failed",
              startedAt: _0x1633da,
              recovering: false
            }) : {}),
            outputText: buildImageExpandOutputText(getDisplayModelName(this.model), {
              error: _0x2f64b8
            })
          });
          if (_0x20164c || _0x87a98 || _0xb850cb) {
            persistRunningHubResumeCache();
          }
        } else {
          window.showToast?.(imageExpandText("toasts.failed", {
            error: _0x267e54.message || imageExpandText("errors.unknown")
          }), "error");
        }
      } finally {
        if (_0x1bb225?.url) {
          URL.revokeObjectURL(_0x1bb225.url);
        }
      }
    };
    const _0x27f615 = _0x57504c => {
      if (!this.toolbarEl.contains(_0x57504c.target)) {
        _0x4d2f7d();
      }
    };
    document.addEventListener("pointerdown", _0x27f615, true);
    const _0x183417 = () => {
      if (!this._pointerState) {
        return;
      }
      window.removeEventListener("pointermove", _0x5837f6, true);
      window.removeEventListener("pointerup", _0x159d9b, true);
      window.removeEventListener("pointercancel", _0x159d9b, true);
      this._pointerState = null;
    };
    const _0x568ad2 = () => this.ratioStr !== "original";
    const _0x5837f6 = _0x7881de => {
      const _0x47caf1 = this._pointerState;
      if (!_0x47caf1 || _0x7881de.pointerId !== _0x47caf1.pointerId) {
        return;
      }
      _0x7881de.preventDefault();
      const _0x5a6178 = _0x47caf1.zoom || this._view?.viewport?.zoom || 1;
      const _0x5b528a = (_0x7881de.clientX - _0x47caf1.startX) / _0x5a6178;
      const _0x59f2f4 = (_0x7881de.clientY - _0x47caf1.startY) / _0x5a6178;
      const _0x50c6cd = this._getNodeWorldRect();
      const _0x5deb2f = (_0x5ea813, _0x2577c9, _0x410905) => Math.min(_0x410905, Math.max(_0x2577c9, _0x5ea813));
      if (_0x47caf1.mode === "drag") {
        const _0x4f2d7e = _0x47caf1.startRect.w;
        const _0x1b2c33 = _0x47caf1.startRect.h;
        let _0x1cec64 = _0x47caf1.startRect.x + _0x5b528a;
        let _0x410df7 = _0x47caf1.startRect.y + _0x59f2f4;
        _0x1cec64 = _0x5deb2f(_0x1cec64, _0x50c6cd.x + _0x50c6cd.w - _0x4f2d7e, _0x50c6cd.x);
        _0x410df7 = _0x5deb2f(_0x410df7, _0x50c6cd.y + _0x50c6cd.h - _0x1b2c33, _0x50c6cd.y);
        this.frameRect = {
          x: _0x1cec64,
          y: _0x410df7,
          w: _0x4f2d7e,
          h: _0x1b2c33
        };
        this._updateView(this._view);
        return;
      }
      const _0x542d78 = _0x47caf1.handle;
      const _0xe7271d = Math.max(_0x50c6cd.w, 24);
      const _0x20eafd = Math.max(_0x50c6cd.h, 24);
      const _0x3a5a4f = _0x3e831c => {
        const _0x11a211 = {
          ..._0x3e831c
        };
        const _0x3594ad = _0x50c6cd.x + _0x50c6cd.w - _0x11a211.w;
        const _0x456d21 = _0x50c6cd.x;
        const _0x435bbe = _0x50c6cd.y + _0x50c6cd.h - _0x11a211.h;
        const _0xb21c07 = _0x50c6cd.y;
        _0x11a211.x = _0x5deb2f(_0x11a211.x, _0x3594ad, _0x456d21);
        _0x11a211.y = _0x5deb2f(_0x11a211.y, _0x435bbe, _0xb21c07);
        return _0x11a211;
      };
      const _0x4a02e0 = (_0x5f44eb, _0x5e12fa) => {
        const _0x12dff5 = {
          ..._0x5f44eb
        };
        if (_0x12dff5.w < _0xe7271d) {
          _0x12dff5.w = _0xe7271d;
        }
        if (_0x12dff5.h < _0x20eafd) {
          _0x12dff5.h = _0x20eafd;
        }
        if (_0x5e12fa === "tl") {
          _0x12dff5.x = _0x47caf1.startRect.x + _0x47caf1.startRect.w - _0x12dff5.w;
          _0x12dff5.y = _0x47caf1.startRect.y + _0x47caf1.startRect.h - _0x12dff5.h;
        } else if (_0x5e12fa === "tr") {
          _0x12dff5.x = _0x47caf1.startRect.x;
          _0x12dff5.y = _0x47caf1.startRect.y + _0x47caf1.startRect.h - _0x12dff5.h;
        } else if (_0x5e12fa === "bl") {
          _0x12dff5.x = _0x47caf1.startRect.x + _0x47caf1.startRect.w - _0x12dff5.w;
          _0x12dff5.y = _0x47caf1.startRect.y;
        } else if (_0x5e12fa === "br") {
          _0x12dff5.x = _0x47caf1.startRect.x;
          _0x12dff5.y = _0x47caf1.startRect.y;
        } else if (_0x5e12fa === "lm") {
          _0x12dff5.x = _0x47caf1.startRect.x + _0x47caf1.startRect.w - _0x12dff5.w;
          _0x12dff5.y = _0x47caf1.startRect.y;
        } else if (_0x5e12fa === "rm") {
          _0x12dff5.x = _0x47caf1.startRect.x;
          _0x12dff5.y = _0x47caf1.startRect.y;
        } else if (_0x5e12fa === "tm") {
          _0x12dff5.x = _0x47caf1.startRect.x;
          _0x12dff5.y = _0x47caf1.startRect.y + _0x47caf1.startRect.h - _0x12dff5.h;
        } else if (_0x5e12fa === "bm") {
          _0x12dff5.x = _0x47caf1.startRect.x;
          _0x12dff5.y = _0x47caf1.startRect.y;
        }
        return _0x12dff5;
      };
      if (!_0x568ad2()) {
        let _0x2a69bd = {
          ..._0x47caf1.startRect
        };
        if (_0x542d78 === "tl") {
          _0x2a69bd.x = _0x47caf1.startRect.x + _0x5b528a;
          _0x2a69bd.y = _0x47caf1.startRect.y + _0x59f2f4;
          _0x2a69bd.w = _0x47caf1.startRect.w - _0x5b528a;
          _0x2a69bd.h = _0x47caf1.startRect.h - _0x59f2f4;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "tl");
        } else if (_0x542d78 === "tr") {
          _0x2a69bd.y = _0x47caf1.startRect.y + _0x59f2f4;
          _0x2a69bd.w = _0x47caf1.startRect.w + _0x5b528a;
          _0x2a69bd.h = _0x47caf1.startRect.h - _0x59f2f4;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "tr");
        } else if (_0x542d78 === "bl") {
          _0x2a69bd.x = _0x47caf1.startRect.x + _0x5b528a;
          _0x2a69bd.w = _0x47caf1.startRect.w - _0x5b528a;
          _0x2a69bd.h = _0x47caf1.startRect.h + _0x59f2f4;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "bl");
        } else if (_0x542d78 === "br") {
          _0x2a69bd.w = _0x47caf1.startRect.w + _0x5b528a;
          _0x2a69bd.h = _0x47caf1.startRect.h + _0x59f2f4;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "br");
        } else if (_0x542d78 === "tm") {
          _0x2a69bd.y = _0x47caf1.startRect.y + _0x59f2f4;
          _0x2a69bd.h = _0x47caf1.startRect.h - _0x59f2f4;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "tm");
        } else if (_0x542d78 === "bm") {
          _0x2a69bd.h = _0x47caf1.startRect.h + _0x59f2f4;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "bm");
        } else if (_0x542d78 === "lm") {
          _0x2a69bd.x = _0x47caf1.startRect.x + _0x5b528a;
          _0x2a69bd.w = _0x47caf1.startRect.w - _0x5b528a;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "lm");
        } else if (_0x542d78 === "rm") {
          _0x2a69bd.w = _0x47caf1.startRect.w + _0x5b528a;
          _0x2a69bd = _0x4a02e0(_0x2a69bd, "rm");
        }
        this.frameRect = _0x3a5a4f(_0x2a69bd);
        this._updateView(this._view);
        return;
      }
      const _0x4980e0 = this._parseRatio();
      const _0x2bcf3b = _0x47caf1.startRect.x + _0x47caf1.startRect.w / 2;
      const _0x216716 = _0x47caf1.startRect.y + _0x47caf1.startRect.h / 2;
      let _0x2838cb = {
        ..._0x47caf1.startRect
      };
      if (_0x542d78 === "lm" || _0x542d78 === "rm") {
        let _0x141c6c = _0x47caf1.startRect.w + (_0x542d78 === "rm" ? _0x5b528a : -_0x5b528a);
        _0x141c6c = Math.max(_0x141c6c, _0xe7271d);
        let _0x5b939c = _0x141c6c / _0x4980e0;
        if (_0x5b939c < _0x20eafd) {
          _0x5b939c = _0x20eafd;
          _0x141c6c = _0x5b939c * _0x4980e0;
        }
        _0x2838cb.w = _0x141c6c;
        _0x2838cb.h = _0x5b939c;
        _0x2838cb.x = _0x542d78 === "rm" ? _0x47caf1.startRect.x : _0x47caf1.startRect.x + _0x47caf1.startRect.w - _0x2838cb.w;
        _0x2838cb.y = _0x216716 - _0x2838cb.h / 2;
      } else if (_0x542d78 === "tm" || _0x542d78 === "bm") {
        let _0x1b80b8 = _0x47caf1.startRect.h + (_0x542d78 === "bm" ? _0x59f2f4 : -_0x59f2f4);
        _0x1b80b8 = Math.max(_0x1b80b8, _0x20eafd);
        let _0x1bb718 = _0x1b80b8 * _0x4980e0;
        if (_0x1bb718 < _0xe7271d) {
          _0x1bb718 = _0xe7271d;
          _0x1b80b8 = _0x1bb718 / _0x4980e0;
        }
        _0x2838cb.w = _0x1bb718;
        _0x2838cb.h = _0x1b80b8;
        _0x2838cb.y = _0x542d78 === "bm" ? _0x47caf1.startRect.y : _0x47caf1.startRect.y + _0x47caf1.startRect.h - _0x2838cb.h;
        _0x2838cb.x = _0x2bcf3b - _0x2838cb.w / 2;
      } else {
        const _0x43eafc = _0x542d78 === "tr" || _0x542d78 === "br" ? 1 : -1;
        const _0x535ab0 = _0x542d78 === "bl" || _0x542d78 === "br" ? 1 : -1;
        let _0x1129a0 = _0x47caf1.startRect.w + _0x5b528a * _0x43eafc;
        let _0x2d0c64 = _0x47caf1.startRect.h + _0x59f2f4 * _0x535ab0;
        _0x1129a0 = Math.max(_0x1129a0, 1);
        _0x2d0c64 = Math.max(_0x2d0c64, 1);
        if (_0x1129a0 / _0x2d0c64 > _0x4980e0) {
          _0x2d0c64 = _0x1129a0 / _0x4980e0;
        } else {
          _0x1129a0 = _0x2d0c64 * _0x4980e0;
        }
        if (_0x1129a0 < _0xe7271d) {
          _0x1129a0 = _0xe7271d;
          _0x2d0c64 = _0x1129a0 / _0x4980e0;
        }
        if (_0x2d0c64 < _0x20eafd) {
          _0x2d0c64 = _0x20eafd;
          _0x1129a0 = _0x2d0c64 * _0x4980e0;
        }
        _0x2838cb.w = _0x1129a0;
        _0x2838cb.h = _0x2d0c64;
        if (_0x542d78 === "br") {
          _0x2838cb.x = _0x47caf1.startRect.x;
          _0x2838cb.y = _0x47caf1.startRect.y;
        } else if (_0x542d78 === "bl") {
          _0x2838cb.x = _0x47caf1.startRect.x + _0x47caf1.startRect.w - _0x2838cb.w;
          _0x2838cb.y = _0x47caf1.startRect.y;
        } else if (_0x542d78 === "tr") {
          _0x2838cb.x = _0x47caf1.startRect.x;
          _0x2838cb.y = _0x47caf1.startRect.y + _0x47caf1.startRect.h - _0x2838cb.h;
        } else {
          _0x2838cb.x = _0x47caf1.startRect.x + _0x47caf1.startRect.w - _0x2838cb.w;
          _0x2838cb.y = _0x47caf1.startRect.y + _0x47caf1.startRect.h - _0x2838cb.h;
        }
      }
      this.frameRect = _0x3a5a4f(_0x2838cb);
      this._updateView(this._view);
    };
    const _0x159d9b = _0x29659c => {
      const _0x81f694 = this._pointerState;
      if (!_0x81f694 || _0x29659c.pointerId !== _0x81f694.pointerId) {
        return;
      }
      _0x29659c.preventDefault();
      _0x183417();
    };
    const _0x4aba66 = _0x416faa => {
      if (_0x416faa.button !== 0) {
        return;
      }
      _0x416faa.stopPropagation();
      _0x416faa.preventDefault();
      if (!this.frameRect) {
        this.frameRect = this._calcFrameWorldRect();
      }
      this.frameRect = this._clampFrameRect(this.frameRect);
      const _0x1affa4 = _0x416faa.target.closest(".v2-expand-handle");
      const _0x1b8227 = _0x1affa4?.dataset?.handle || null;
      const _0x32ee81 = _0x1b8227 ? "resize" : "drag";
      this._pointerState = {
        pointerId: _0x416faa.pointerId,
        mode: _0x32ee81,
        handle: _0x1b8227,
        startX: _0x416faa.clientX,
        startY: _0x416faa.clientY,
        startRect: {
          ...this.frameRect
        },
        zoom: this._view?.viewport?.zoom || 1
      };
      this.frameEl.setPointerCapture?.(_0x416faa.pointerId);
      window.addEventListener("pointermove", _0x5837f6, true);
      window.addEventListener("pointerup", _0x159d9b, true);
      window.addEventListener("pointercancel", _0x159d9b, true);
    };
    this.frameEl.addEventListener("pointerdown", _0x4aba66);
    this.cleanup = () => {
      _0x183417();
      window.removeEventListener("resize", _0x48bc02);
      window.removeEventListener("keydown", _0x1364d7);
      document.removeEventListener("pointerdown", _0x27f615, true);
      this.overlayEl?.removeEventListener("wheel", _0x4106af);
      this.frameEl?.removeEventListener("pointerdown", _0x4aba66);
      this._unbindToolbarUpMenus?.();
      this._unbindToolbarUpMenus = null;
      this._unbindImageFunctionMenus?.();
      this._unbindImageFunctionMenus = null;
    };
  },
  exit() {
    if (!this.active) {
      return;
    }
    this._cancelImageReadyWait?.();
    this._cancelImageReadyWait = null;
    this.active = false;
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    if (this._unsubscribeLocale) {
      this._unsubscribeLocale();
      this._unsubscribeLocale = null;
    }
    if (this.overlayEl) {
      this.overlayEl.classList.remove("visible");
    }
    setTimeout(() => {
      this.overlayEl?.remove();
      this.toolbarEl?.remove();
      this.cleanup?.();
      this.nodeId = null;
      this.nodeData = null;
      this.frameRect = null;
      this._view = null;
      this._expandModelCatalog = null;
      this.ratioMenuEl = null;
      this.sizeMenuEl = null;
    }, 200);
  }
};
export default ImageExpandController;