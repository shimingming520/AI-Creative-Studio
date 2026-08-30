import a518_0x345721 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { resumeAsyncImageTask, resumeDreaminaImageTask, resumeRunningHubImageTask } from "../../api/aiImageApi.js";
import { ensureLocalImageDerivatives, uploadFile } from "../modules/project.js";
import { openNodeImagePreview } from "../modules/imagePreview.js";
import { generateThumbnail } from "../modules/imageUtils.js";
import { bindImageToolbarEvents } from "./NodeToolbarConfig.js";
import a518_0x5a5d22 from "../modules/ImageFreeAngleController.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import { setStaticInnerHTML } from "../utils/dom.js";
import { commit } from "../modules/history.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { getThumbnail, setThumbnail } from "../services/thumbnailCacheService.js";
import { getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { logDragImportProfile } from "../services/dragImportDiagnostics.js";
import { buildImageNodeStorageFields, pickCanvasImageLocalPath, toLocalPathUrl } from "../services/imageDerivativeService.js";
import { buildCanvasLocalImageFields, resolveCanvasImageLowZoomUrl, resolveCanvasImageThumbUrl } from "../services/canvasMediaLocalService.js";
import { isCanvasLowZoomActive, pickImageLodUrl, setNodeMediaLodHoverPromoted, shouldUseLowZoomImageThumbnail } from "../modules/canvasImageLod.js";
import { forgetCanvasImageDisplayLoad, isCanvasImageDisplayLoadPending, isCanvasImagePreloadCoolingDown, isCanvasImagePreloadPending, rememberCanvasImagePreloadResolved, preloadCanvasImage, trackCanvasImageDisplayLoad } from "../modules/canvasMediaScheduler.js";
import { assignCanvasImageDisplaySource, clearCanvasImageDisplayHandoff, deferCanvasImageDisplayFallbackRelease } from "../modules/canvasImageDisplayHandoff.js";
import { shouldDeferRendererMediaOnMount, shouldPrebuildRendererRuntimeOffscreen } from "../core/rendererDeferredMedia.js";
import { resumeTask } from "../core/generationTaskRuntime.js";
import { readViewportInteractionState } from "../core/viewportInteractionState.js";
import { isModelApiModel, isWorkflowModel, resolveModelProvider } from "../manifests/index.js";
import { getTaskMessage, isTaskCancelled, isTaskFailed, isTaskTerminal, shouldShowGenerationResultLoadingUi } from "../core/generationTaskUiState.js";
import { buildImageGenerationFailurePatch } from "./aigenImage/imageGenerationResultRenderer.js";
import { getDefaultDreaminaImageModelId } from "./aigenImage/dreaminaModelMenuHelper.js";
const SOURCE_IMAGE_MIN_SIZE = 150;
const SOURCE_IMAGE_IDLE_PRELOAD_TIMEOUT_MS = 40;
const SOURCE_IMAGE_BUSY_RETRY_MS = 48;
const SOURCE_IMAGE_MAX_BUSY_WAIT_MS = 5000;
const SOURCE_IMAGE_LOD_HOVER_REFRESH_DELAY_MS = 160;
const DREAMINA_POLL_TIMEOUT_CODE = "DREAMINA_POLL_TIMEOUT";
const DREAMINA_STALE_ACTIVE_RESUME_MS = 15000;
const NON_RECOVERABLE_FAILURE_STATUSES = new Set(["cancelled", "canceled", "error", "fail", "failed"]);
function hasSharedCanvasImageAcquisition(_0x4655db) {
  const _0x27f4d9 = String(_0x4655db || "").trim();
  return !!_0x27f4d9 && (isCanvasImageDisplayLoadPending(_0x27f4d9) || isCanvasImagePreloadPending(_0x27f4d9) || isCanvasImagePreloadCoolingDown(_0x27f4d9));
}
const DREAMINA_NON_RECOVERABLE_STATUSES = new Set([...NON_RECOVERABLE_FAILURE_STATUSES, "idle"]);
const DREAMINA_NON_RECOVERABLE_PHASES = new Set([...NON_RECOVERABLE_FAILURE_STATUSES, "done"]);
function sourceImageText(_0x438cf0, _0x3cb32c = {}) {
  return t("sourceImageNode." + _0x438cf0, _0x3cb32c);
}
function getSourceImageSchedulerNow() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function isSourceImageInteractionBusy() {
  return readViewportInteractionState().isViewportBusy;
}
function scheduleSourceImageIdleTask(_0x1714a8, {
  timeout = SOURCE_IMAGE_IDLE_PRELOAD_TIMEOUT_MS
} = {}) {
  if (typeof _0x1714a8 !== "function") {
    return () => {};
  }
  let _0x23c4ef = false;
  let _0x2ff392 = () => {};
  const _0x37743f = getSourceImageSchedulerNow();
  const _0x1e8fe5 = globalThis.window?.requestIdleCallback || globalThis.requestIdleCallback;
  const _0x5c6748 = globalThis.window?.cancelIdleCallback || globalThis.cancelIdleCallback;
  function _0x2c0874(_0x144bdb) {
    const _0x1c9fce = setTimeout(_0x3efdd1, _0x144bdb);
    _0x2ff392 = () => clearTimeout(_0x1c9fce);
  }
  const _0x3efdd1 = () => {
    if (_0x23c4ef) {
      return;
    }
    const _0x2e1fa4 = getSourceImageSchedulerNow() - _0x37743f;
    if (isSourceImageInteractionBusy() && _0x2e1fa4 < SOURCE_IMAGE_MAX_BUSY_WAIT_MS) {
      _0x2c0874(SOURCE_IMAGE_BUSY_RETRY_MS);
      return;
    }
    _0x1714a8();
  };
  if (typeof _0x1e8fe5 === "function") {
    const _0x32323c = _0x1e8fe5(_0x3efdd1, {
      timeout: timeout
    });
    _0x2ff392 = () => {
      if (typeof _0x5c6748 === "function") {
        _0x5c6748(_0x32323c);
      }
    };
  } else {
    _0x2c0874(0);
  }
  return () => {
    _0x23c4ef = true;
    _0x2ff392();
  };
}
function buildSourceImageRecoveryFailurePatch(_0x3816bf, {
  error = "",
  startedAt = 0,
  duration = null
} = {}) {
  const _0x3e9112 = String(error?.message || error || sourceImageText("recovery.taskFailed")).trim() || sourceImageText("recovery.taskFailed");
  const _0x2db2de = String(_0x3816bf?.outputText || "").trim();
  const _0x2e38b0 = _0x2db2de ? _0x2db2de + "\n" + sourceImageText("recovery.failedWithMessage", {
    message: _0x3e9112
  }) : sourceImageText("recovery.failedWithMessage", {
    message: _0x3e9112
  });
  return {
    ...buildImageGenerationFailurePatch({
      error: _0x3e9112,
      startedAt: startedAt,
      duration: duration,
      clearMediaFields: false
    }),
    outputText: _0x2e38b0
  };
}
function normalizeImmediateImagePreviewUrl(_0x176bdb) {
  const _0x3b1b43 = String(_0x176bdb || "").trim();
  if (!_0x3b1b43) {
    return "";
  }
  if (/^data:image\//i.test(_0x3b1b43) || /^blob:/i.test(_0x3b1b43) || /^aic-local-preview:/i.test(_0x3b1b43)) {
    return _0x3b1b43;
  }
  if (/^(?:https?:|file:)/i.test(_0x3b1b43)) {
    return "";
  }
  return toLocalPathUrl(_0x3b1b43);
}
function firstImmediateImagePreviewUrl(_0x4fdfbd) {
  for (const _0x276299 of _0x4fdfbd || []) {
    const _0x2ea184 = normalizeImmediateImagePreviewUrl(_0x276299);
    if (_0x2ea184) {
      return _0x2ea184;
    }
  }
  return "";
}
function getPrimarySourceImageItem(_0x1bdbe2) {
  const _0x484e1f = Array.isArray(_0x1bdbe2?.images) ? _0x1bdbe2.images : [];
  if (_0x484e1f.length === 0) {
    return null;
  }
  const _0x1deb19 = Number(_0x1bdbe2?.mainImageIndex);
  const _0x4732ae = Number.isFinite(_0x1deb19) ? Math.max(0, Math.trunc(_0x1deb19)) : 0;
  return _0x484e1f[_0x4732ae] || _0x484e1f[0] || null;
}
function normalizeTaskStatus(_0xaeaca7) {
  return String(_0xaeaca7 || "").trim().toLowerCase();
}
function normalizeUploadMediaDimensions(_0x5c87eb, _0x308521) {
  const _0x424ccc = Math.round(Number(_0x5c87eb) || 0);
  const _0x1e694f = Math.round(Number(_0x308521) || 0);
  if (_0x424ccc <= 0 || _0x1e694f <= 0) {
    return null;
  }
  return {
    width: _0x424ccc,
    height: _0x1e694f
  };
}
export function buildSourceImageUploadSizePatch(..._0x3015e8) {
  for (const _0x3b01d4 of _0x3015e8) {
    const _0x506802 = normalizeUploadMediaDimensions(_0x3b01d4?.width, _0x3b01d4?.height);
    if (!_0x506802) {
      continue;
    }
    const _0x1f303b = getAutoMediaSizeByShortSide(_0x506802.width, _0x506802.height);
    return {
      width: _0x1f303b.width,
      height: _0x1f303b.height,
      imageWidth: _0x506802.width,
      imageHeight: _0x506802.height,
      needsAutoResize: false
    };
  }
  return {
    needsAutoResize: true
  };
}
export class SourceImageNode {
  constructor(_0x1c6b9d) {
    this._data = _0x1c6b9d;
    this.el = document.createElement("div");
    this.id = _0x1c6b9d.id;
    this.el.className = "v2-node-component";
    this._currentSrc = null;
    this._currentMaskPreview = null;
    this._objUrl = null;
    this._thumbGenSrc = null;
    this._failedSrc = null;
    this._currentJobStatus = null;
    this._resolvedPreviewSig = "";
    this._previewResolveToken = 0;
    this._uploadLabelNode = null;
    this._unsubscribeLocale = null;
    this._cachedThumbUrl = "";
    this._activeCapturePreviewUrl = "";
    this._retiredCapturePreviewUrls = new Set();
    this._capturePreviewReleaseCallbacks = new Map();
    this._rhResumeAbortController = null;
    this._rhResumeTaskId = "";
    this._rhResumePromise = null;
    this._rhResumeRetryTimer = null;
    this._dreaminaResumeAbortController = null;
    this._dreaminaResumeSubmitId = "";
    this._dreaminaResumePromise = null;
    this._asyncResumeAbortController = null;
    this._asyncResumeTaskId = "";
    this._asyncResumePromise = null;
    this._idleImageRefreshCancel = null;
    this._lowZoomHoverRefreshTimer = null;
    this._rendererMediaDeferred = shouldDeferRendererMediaOnMount(_0x1c6b9d);
    this._rendererRuntimePrebuiltOffscreen = shouldPrebuildRendererRuntimeOffscreen(_0x1c6b9d);
  }
  _applyMaskPreview(_0xa852da) {
    if (!this._maskOverlay) {
      return;
    }
    const _0x15519b = String(_0xa852da || "").trim();
    if (!_0x15519b) {
      if (this._currentMaskPreview) {
        this._maskOverlay.src = "";
        this._maskOverlay.style.display = "none";
        this._currentMaskPreview = null;
      }
      return;
    }
    if (this._currentMaskPreview === _0x15519b) {
      return;
    }
    const _0x1e8cf6 = _0x15519b.startsWith("blob:") || _0x15519b.startsWith("data:") || _0x15519b.startsWith("/") ? _0x15519b : toLocalPathUrl(_0x15519b);
    if (!_0x1e8cf6) {
      return;
    }
    this._maskOverlay.src = encodeURI(_0x1e8cf6);
    this._maskOverlay.style.display = "block";
    this._currentMaskPreview = _0x15519b;
  }
  _setImageLodSrc(_0x1d2458) {
    if (!this._img?.dataset) {
      return;
    }
    const _0x40f8f4 = String(_0x1d2458 || "").trim();
    if (_0x40f8f4) {
      this._img.dataset.lodSrc = _0x40f8f4;
    } else {
      delete this._img.dataset.lodSrc;
    }
  }
  _isShowingFullImage(_0x26a075 = this._getPrimaryImageUrl()) {
    const _0x4c2c19 = String(_0x26a075 || "").trim();
    if (!_0x4c2c19 || !this._img) {
      return false;
    }
    const _0x45a958 = String(this._img.getAttribute("src") || "").trim();
    const _0x5447cd = String(this._img.dataset?.lodSrc || "").trim();
    return _0x45a958 === _0x4c2c19 && _0x5447cd === "full" && this._img.style.display !== "none";
  }
  _shouldCommitPreloadedImage(_0x5b111c) {
    const _0xfbcec3 = String(_0x5b111c || "").trim();
    if (!_0xfbcec3) {
      return false;
    }
    const _0x8a0578 = a518_0x345721.getStateRaw().nodes?.[this.id] || this._data;
    const _0x230697 = this._getImageDisplayLod(_0x8a0578);
    const _0x4c4ded = this._getCapturePreviewUrl(_0x8a0578);
    const _0x58e569 = _0x230697.url || _0x4c4ded;
    const _0x2b86da = this._getPrimaryImageUrl(_0x8a0578);
    if (!_0x2b86da) {
      return true;
    }
    if (_0xfbcec3 === _0x58e569) {
      return true;
    }
    if (_0xfbcec3 === _0x2b86da && _0x230697.lod === "thumb") {
      return this._isShowingFullImage(_0xfbcec3);
    }
    return false;
  }
  _waitForDisplayedImageLoad(_0x206ef9, {
    allowPendingSrc = false
  } = {}) {
    const _0x58ba88 = String(_0x206ef9 || "").trim();
    const _0xa0c1e7 = this._img;
    if (!_0x58ba88 || !_0xa0c1e7) {
      return Promise.reject(new Error("Image source is empty"));
    }
    const _0x312bea = () => String(_0xa0c1e7.getAttribute?.("src") || _0xa0c1e7.src || "").trim();
    const _0x1bb52d = () => _0x312bea() === _0x58ba88;
    const _0x262f31 = () => {
      const _0x152b82 = {
        image: _0xa0c1e7,
        naturalWidth: _0xa0c1e7.naturalWidth || _0xa0c1e7.width || 0,
        naturalHeight: _0xa0c1e7.naturalHeight || _0xa0c1e7.height || 0
      };
      rememberCanvasImagePreloadResolved(_0x58ba88, _0x152b82);
      return _0x152b82;
    };
    if (!allowPendingSrc && !_0x1bb52d()) {
      return Promise.reject(new Error("Image source changed before load"));
    }
    if (_0x1bb52d() && _0xa0c1e7.complete === true && Number(_0xa0c1e7.naturalWidth || _0xa0c1e7.width || 0) > 0) {
      return Promise.resolve(_0x262f31());
    }
    return new Promise((_0x33507b, _0x25d7a0) => {
      trackCanvasImageDisplayLoad(_0x58ba88, _0xa0c1e7);
      let _0x48dcce = false;
      let _0x34b280 = () => {};
      const _0x217940 = (_0x4b964b = null) => {
        if (_0x48dcce) {
          return;
        }
        _0x48dcce = true;
        forgetCanvasImageDisplayLoad(_0xa0c1e7);
        _0x34b280();
        if (_0x4b964b) {
          _0x25d7a0(_0x4b964b);
          return;
        }
        if (!_0x1bb52d()) {
          _0x25d7a0(new Error("Image source changed before load"));
          return;
        }
        _0x33507b(_0x262f31());
      };
      const _0x3d4a1d = () => _0x217940();
      const _0x59ab54 = () => _0x217940(new Error("Image load failed"));
      if (typeof _0xa0c1e7.addEventListener === "function") {
        _0xa0c1e7.addEventListener("load", _0x3d4a1d, {
          once: true
        });
        _0xa0c1e7.addEventListener("error", _0x59ab54, {
          once: true
        });
        _0x34b280 = () => {
          _0xa0c1e7.removeEventListener?.("load", _0x3d4a1d);
          _0xa0c1e7.removeEventListener?.("error", _0x59ab54);
        };
      } else {
        const _0x1353d4 = _0xa0c1e7.onload;
        const _0x3fc038 = _0xa0c1e7.onerror;
        const _0x27998d = (..._0xd1d14e) => {
          if (typeof _0x1353d4 === "function") {
            _0x1353d4.apply(_0xa0c1e7, _0xd1d14e);
          }
          _0x3d4a1d();
        };
        const _0x413392 = (..._0x19f9f2) => {
          if (typeof _0x3fc038 === "function") {
            _0x3fc038.apply(_0xa0c1e7, _0x19f9f2);
          }
          _0x59ab54();
        };
        _0xa0c1e7.onload = _0x27998d;
        _0xa0c1e7.onerror = _0x413392;
        _0x34b280 = () => {
          if (_0xa0c1e7.onload === _0x27998d) {
            _0xa0c1e7.onload = _0x1353d4;
          }
          if (_0xa0c1e7.onerror === _0x413392) {
            _0xa0c1e7.onerror = _0x3fc038;
          }
        };
      }
    });
  }
  _queueThumbnail(_0x535b90) {
    if (!_0x535b90) {
      return;
    }
    if (this._thumbGenSrc === _0x535b90) {
      return;
    }
    this._thumbGenSrc = _0x535b90;
    generateThumbnail(_0x535b90).then(async _0x314c24 => {
      if (!_0x314c24) {
        return;
      }
      const _0x4e24bc = a518_0x345721.getState().nodes[this.id];
      if (!_0x4e24bc) {
        return;
      }
      if (this._getPrimaryImageUrl(_0x4e24bc) !== _0x535b90) {
        return;
      }
      await setThumbnail(_0x4e24bc, _0x314c24);
      if (!this._cachedThumbUrl) {
        this._cachedThumbUrl = _0x314c24;
      }
    }).catch(_0x52fa1d => {
      console.warn("[SourceImageNode] 缩略图缓存写入失败:", _0x52fa1d);
    }).finally(() => {
      if (this._thumbGenSrc === _0x535b90) {
        this._thumbGenSrc = null;
      }
    });
  }
  _normalizeLocalUrl(_0x5ed67d) {
    return toLocalPathUrl(_0x5ed67d);
  }
  _getPrimaryImageUrl(_0x3807bb = this._data) {
    const _0xbb4690 = pickCanvasImageLocalPath(_0x3807bb);
    if (_0xbb4690) {
      return toLocalPathUrl(_0xbb4690);
    } else {
      return "";
    }
  }
  _getSynchronousThumbUrl(_0x3c1b49 = this._data) {
    const _0x10d59d = getPrimarySourceImageItem(_0x3c1b49);
    return firstImmediateImagePreviewUrl([_0x3c1b49?.previewLocalPath, _0x3c1b49?.thumbLocalPath, _0x3c1b49?.thumbnailLocalPath, _0x3c1b49?.displayLocalPath, _0x3c1b49?.previewUrl, _0x3c1b49?.thumbUrl, _0x3c1b49?.thumbnailUrl, _0x10d59d?.previewLocalPath, _0x10d59d?.thumbLocalPath, _0x10d59d?.thumbnailLocalPath, _0x10d59d?.displayLocalPath, _0x10d59d?.previewUrl, _0x10d59d?.thumbUrl, _0x10d59d?.thumbnailUrl]) || resolveCanvasImageThumbUrl(_0x3c1b49);
  }
  _getLowZoomImageUrl(_0x134235 = this._data) {
    return resolveCanvasImageLowZoomUrl(_0x134235);
  }
  _shouldUseLowZoomThumbnail() {
    return shouldUseLowZoomImageThumbnail({
      nodeId: this.id,
      rootEl: this.el,
      store: a518_0x345721
    });
  }
  _getImageDisplayLod(_0x5caf32 = this._data) {
    const _0x5c98cd = this._getPrimaryImageUrl(_0x5caf32);
    const _0x5ed48a = this._getSynchronousThumbUrl(_0x5caf32) || this._getLowZoomImageUrl(_0x5caf32);
    return pickImageLodUrl({
      mainUrl: _0x5c98cd,
      thumbUrl: _0x5ed48a,
      lowZoomThumbnail: this._shouldUseLowZoomThumbnail()
    });
  }
  _getCapturePreviewUrl(_0xc93f78 = this._data) {
    const _0xf62f3f = String(_0xc93f78?.capturePreviewUrl || "").trim();
    if (!_0xf62f3f) {
      return "";
    }
    if (_0xf62f3f.startsWith("blob:") || _0xf62f3f.startsWith("data:image/") || _0xf62f3f.startsWith("aic-local-preview:")) {
      return _0xf62f3f;
    }
    if ((_0xf62f3f.startsWith("http://") || _0xf62f3f.startsWith("https://")) && _0xf62f3f === String(_0xc93f78?.webSourceUrl || "").trim()) {
      return _0xf62f3f;
    }
    return "";
  }
  _getPreviewSignature(_0x27c23a = this._data) {
    return [String(_0x27c23a?.localPath || "").trim(), String(_0x27c23a?.originalLocalPath || "").trim(), String(_0x27c23a?.displayLocalPath || "").trim(), String(_0x27c23a?.thumbLocalPath || "").trim(), String(_0x27c23a?.previewLocalPath || "").trim(), String(_0x27c23a?.previewUrl || "").trim(), String(_0x27c23a?.thumbUrl || "").trim(), String(_0x27c23a?.thumbnailUrl || "").trim(), String(_0x27c23a?.capturePreviewUrl || "").trim(), String(getPrimarySourceImageItem(_0x27c23a)?.previewLocalPath || "").trim(), String(getPrimarySourceImageItem(_0x27c23a)?.thumbLocalPath || "").trim(), String(getPrimarySourceImageItem(_0x27c23a)?.displayLocalPath || "").trim(), String(getPrimarySourceImageItem(_0x27c23a)?.previewUrl || "").trim(), String(getPrimarySourceImageItem(_0x27c23a)?.thumbUrl || "").trim(), String(getPrimarySourceImageItem(_0x27c23a)?.thumbnailUrl || "").trim(), this._shouldUseLowZoomThumbnail() ? "thumb" : "full"].join("|");
  }
  _revokeCapturePreviewUrl(_0x5679ba) {
    const _0x4c239d = String(_0x5679ba || "").trim();
    if (!_0x4c239d || !_0x4c239d.startsWith("blob:")) {
      return;
    }
    const _0x141387 = globalThis.window?.URL || globalThis.URL;
    if (typeof _0x141387?.revokeObjectURL !== "function") {
      return;
    }
    try {
      _0x141387.revokeObjectURL(_0x4c239d);
    } catch {}
  }
  _readDisplayedImageSource() {
    return String(this._img?.getAttribute?.("src") || this._img?.currentSrc || this._img?.src || "").trim();
  }
  _getCapturePreviewReleaseCallback(_0x5e4ff5) {
    const _0x25d7e7 = String(_0x5e4ff5 || "").trim();
    if (!this._capturePreviewReleaseCallbacks) {
      this._capturePreviewReleaseCallbacks = new Map();
    }
    const _0x216034 = this._capturePreviewReleaseCallbacks.get(_0x25d7e7);
    if (_0x216034) {
      return _0x216034;
    }
    const _0x4300c1 = _0xe0785 => {
      const _0x2acac6 = this._retiredCapturePreviewUrls;
      this._capturePreviewReleaseCallbacks?.delete(_0x25d7e7);
      if (!_0x2acac6?.has(_0x25d7e7)) {
        return;
      }
      if (this._activeCapturePreviewUrl === _0x25d7e7 || this._readDisplayedImageSource() === _0x25d7e7) {
        return;
      }
      _0x2acac6.delete(_0x25d7e7);
      this._revokeCapturePreviewUrl(_0xe0785 || _0x25d7e7);
    };
    this._capturePreviewReleaseCallbacks.set(_0x25d7e7, _0x4300c1);
    return _0x4300c1;
  }
  _flushRetiredCapturePreviewUrls({
    force = false
  } = {}) {
    const _0x139e40 = this._retiredCapturePreviewUrls;
    if (!_0x139e40?.size) {
      return;
    }
    const _0x477730 = this._readDisplayedImageSource();
    for (const _0x1334b7 of [..._0x139e40]) {
      if (!force && this._activeCapturePreviewUrl === _0x1334b7) {
        continue;
      }
      const _0x975c82 = this._getCapturePreviewReleaseCallback(_0x1334b7);
      if (!force && deferCanvasImageDisplayFallbackRelease(this._img, _0x1334b7, _0x975c82)) {
        continue;
      }
      if (!force && _0x477730 === _0x1334b7) {
        continue;
      }
      _0x139e40.delete(_0x1334b7);
      this._capturePreviewReleaseCallbacks?.delete(_0x1334b7);
      this._revokeCapturePreviewUrl(_0x1334b7);
    }
  }
  _retireCapturePreviewUrl(_0x5aeeaa) {
    const _0x2ba846 = String(_0x5aeeaa || "").trim();
    if (!_0x2ba846 || !_0x2ba846.startsWith("blob:")) {
      return;
    }
    if (!this._retiredCapturePreviewUrls) {
      this._retiredCapturePreviewUrls = new Set();
    }
    this._retiredCapturePreviewUrls.add(_0x2ba846);
    this._flushRetiredCapturePreviewUrls();
  }
  _assignImageDisplaySource(_0x1b33e2) {
    const _0x21d4fe = assignCanvasImageDisplaySource(this._img, _0x1b33e2);
    this._flushRetiredCapturePreviewUrls();
    return _0x21d4fe;
  }
  _adoptCapturePreviewUrl(_0x554d65) {
    const _0x1d0f35 = String(_0x554d65 || "").trim();
    const _0xd77e5b = this._activeCapturePreviewUrl;
    this._activeCapturePreviewUrl = _0x1d0f35;
    this._retiredCapturePreviewUrls?.delete(_0x1d0f35);
    if (_0xd77e5b && _0xd77e5b !== _0x1d0f35) {
      this._retireCapturePreviewUrl(_0xd77e5b);
    }
  }
  _releaseActiveCapturePreviewUrl() {
    if (!this._activeCapturePreviewUrl) {
      return;
    }
    const _0x4631be = this._activeCapturePreviewUrl;
    this._activeCapturePreviewUrl = "";
    this._retireCapturePreviewUrl(_0x4631be);
  }
  async _refreshImageDisplay(_0x2e33e4 = false) {
    const _0x434bb1 = this._getPreviewSignature();
    if (!_0x2e33e4 && _0x434bb1 === this._resolvedPreviewSig) {
      return;
    }
    this._resolvedPreviewSig = _0x434bb1;
    const _0x264f12 = ++this._previewResolveToken;
    const _0x827954 = this._getPrimaryImageUrl();
    const _0x32a53b = this._getCapturePreviewUrl();
    const _0x3762bd = this._getSynchronousThumbUrl();
    const _0x1f8bf5 = this._getImageDisplayLod();
    const _0x2a8150 = _0x1f8bf5.lod === "thumb" && _0x827954 && this._isShowingFullImage(_0x827954);
    if (!_0x827954 && _0x32a53b) {
      this._adoptCapturePreviewUrl(_0x32a53b);
      this._showImg(_0x32a53b, this._cachedThumbUrl);
      return;
    }
    if (_0x2a8150) {
      this._cachedThumbUrl = _0x3762bd || _0x1f8bf5.url || this._cachedThumbUrl || "";
      this._releaseActiveCapturePreviewUrl();
      this._showImg(_0x827954, this._cachedThumbUrl || _0x32a53b);
      return;
    }
    if (_0x1f8bf5.lod === "thumb" && _0x1f8bf5.url) {
      this._cachedThumbUrl = _0x3762bd || _0x1f8bf5.url;
      this._releaseActiveCapturePreviewUrl();
      this._showLowZoomThumb(_0x1f8bf5.url);
      return;
    }
    if (_0x827954) {
      this._cachedThumbUrl = _0x3762bd || this._cachedThumbUrl || "";
      this._showImg(_0x827954, this._cachedThumbUrl || _0x32a53b);
      return;
    }
    if (_0x3762bd) {
      this._cachedThumbUrl = _0x3762bd;
      this._releaseActiveCapturePreviewUrl();
      this._showLowZoomThumb(_0x3762bd);
      return;
    }
    let _0x3f2ca9 = "";
    try {
      _0x3f2ca9 = await getThumbnail(this._data);
    } catch {
      _0x3f2ca9 = "";
    }
    if (_0x264f12 !== this._previewResolveToken) {
      return;
    }
    this._cachedThumbUrl = _0x3762bd || _0x3f2ca9 || "";
    if (_0x32a53b) {
      this._adoptCapturePreviewUrl(_0x32a53b);
      this._showImg(_0x32a53b, this._cachedThumbUrl);
      return;
    }
    if (this._cachedThumbUrl) {
      this._showLowZoomThumb(this._cachedThumbUrl);
      return;
    }
    this._showImg("", "");
  }
  _scheduleImageDisplayRefresh(_0x4e917d = false) {
    if (this._idleImageRefreshCancel) {
      return;
    }
    this._idleImageRefreshCancel = scheduleSourceImageIdleTask(() => {
      this._idleImageRefreshCancel = null;
      if (!this._img) {
        return;
      }
      this._refreshImageDisplay(_0x4e917d);
    });
  }
  mount() {
    const _0x4694cc = this.el;
    const _0xb58c8d = this._data;
    Object.assign(_0x4694cc.style, {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "visible",
      pointerEvents: "auto",
      cursor: "default"
    });
    const _0x1d65dd = this._getCapturePreviewUrl(_0xb58c8d);
    const _0x5cd7d5 = this._getPrimaryImageUrl(_0xb58c8d);
    const _0x14f343 = !_0x5cd7d5 && !!_0x1d65dd;
    const _0x2e64c5 = _0x14f343 ? {
      url: _0x1d65dd,
      lod: "full"
    } : this._getImageDisplayLod(_0xb58c8d);
    const _0x220e83 = _0x2e64c5.url || _0x1d65dd;
    const _0x4e7541 = (_0x14f343 ? _0x1d65dd : this._getSynchronousThumbUrl(_0xb58c8d)) || _0x1d65dd;
    const _0xf35cb9 = this._rendererMediaDeferred === true && _0x2e64c5.lod !== "thumb" && !!_0x2e64c5.url && _0x2e64c5.url !== _0x4e7541;
    const _0x53be2d = _0xf35cb9 ? _0x4e7541 : _0x220e83;
    const _0x4d2182 = _0xf35cb9 ? _0x53be2d ? "placeholder" : "" : _0x2e64c5.lod;
    this._adoptCapturePreviewUrl(_0x1d65dd);
    this._currentSrc = _0x220e83;
    this._currentJobStatus = _0xb58c8d.jobStatus || null;
    setStaticInnerHTML(_0x4694cc, "toolbar:image");
    this._card = document.createElement("div");
    this._card.className = "img-node-preview";
    Object.assign(this._card.style, {
      background: "var(--white-05)",
      border: "1px solid var(--stroke-10)",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      width: "100%",
      height: "100%",
      flexShrink: "0"
    });
    this._img = document.createElement("img");
    this._img.className = "node-img";
    this._img.decoding = "async";
    this._img.loading = "eager";
    const _0x302db5 = this._rendererMediaDeferred === true;
    const _0x54faa3 = _0x302db5 ? _0x4e7541 : "";
    const _0x236702 = this._rendererRuntimePrebuiltOffscreen ? "" : _0x302db5 ? _0x54faa3 : _0x53be2d;
    const _0x4bccf8 = hasSharedCanvasImageAcquisition(_0x236702) ? "" : _0x236702;
    if ("fetchPriority" in this._img) {
      this._img.fetchPriority = _0x4bccf8 && (_0x302db5 || _0x53be2d !== _0x220e83 || _0x2e64c5.lod === "full") ? "high" : "auto";
    }
    Object.assign(this._img.style, {
      pointerEvents: "none",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: _0x4bccf8 ? "block" : "none"
    });
    this._setImageLodSrc(_0x302db5 ? _0x54faa3 ? "placeholder" : "" : _0x4d2182);
    if (_0x4bccf8) {
      trackCanvasImageDisplayLoad(_0x4bccf8, this._img);
      this._img.src = _0x4bccf8;
    }
    this._maskOverlay = document.createElement("img");
    this._maskOverlay.className = "node-img-mask-overlay";
    Object.assign(this._maskOverlay.style, {
      pointerEvents: "none"
    });
    if (!_0x302db5) {
      this._applyMaskPreview(_0xb58c8d.maskPreviewUrl || _0xb58c8d.maskPreview);
    }
    this._jobUI = document.createElement("div");
    this._jobUI.className = "node-job-ui";
    Object.assign(this._jobUI.style, {
      position: "absolute",
      inset: "0",
      zIndex: "5",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-node)",
      pointerEvents: "none"
    });
    this._hint = document.createElement("div");
    this._hint.className = "node-upload-hint source-upload-hint";
    Object.assign(this._hint.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      zIndex: "10",
      display: "block"
    });
    this._uploadBtn = document.createElement("button");
    this._uploadBtn.type = "button";
    this._uploadBtn.className = "upload-btn source-upload-btn";
    const _0x4455f7 = "http://www.w3.org/2000/svg";
    const _0x126491 = document.createElementNS(_0x4455f7, "svg");
    _0x126491.setAttribute("width", "14");
    _0x126491.setAttribute("height", "14");
    _0x126491.setAttribute("viewBox", "0 0 24 24");
    _0x126491.setAttribute("fill", "none");
    _0x126491.setAttribute("stroke", "currentColor");
    _0x126491.setAttribute("stroke-width", "2.5");
    const _0x34d359 = document.createElementNS(_0x4455f7, "path");
    _0x34d359.setAttribute("d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4");
    const _0x33016e = document.createElementNS(_0x4455f7, "polyline");
    _0x33016e.setAttribute("points", "17 8 12 3 7 8");
    const _0x5ce20c = document.createElementNS(_0x4455f7, "line");
    _0x5ce20c.setAttribute("x1", "12");
    _0x5ce20c.setAttribute("y1", "3");
    _0x5ce20c.setAttribute("x2", "12");
    _0x5ce20c.setAttribute("y2", "15");
    _0x126491.appendChild(_0x34d359);
    _0x126491.appendChild(_0x33016e);
    _0x126491.appendChild(_0x5ce20c);
    this._uploadBtn.appendChild(_0x126491);
    this._uploadLabelNode = document.createTextNode("");
    this._uploadBtn.appendChild(this._uploadLabelNode);
    this._syncLocaleTexts();
    this._hint.appendChild(this._uploadBtn);
    const _0x125988 = document.createElement("div");
    _0x125988.className = "node-port out-port";
    const _0x56d9ed = document.createElement("div");
    _0x56d9ed.className = "node-resizer";
    this._card.appendChild(this._img);
    this._card.appendChild(this._maskOverlay);
    this._card.appendChild(this._jobUI);
    this._card.appendChild(this._hint);
    this._card.appendChild(_0x125988);
    this._card.appendChild(_0x56d9ed);
    _0x4694cc.appendChild(this._card);
    this._syncJobUI(this._currentJobStatus);
    if (shouldShowGenerationResultLoadingUi(_0xb58c8d, {
      hasResult: !!_0x220e83
    }) && !this._currentJobStatus) {
      startLoading(this._card, {
        variant: "static"
      });
      if (this._hint) {
        this._hint.style.display = "none";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = true;
      }
    }
    this._card.addEventListener("dblclick", _0x443d5a => {
      _0x443d5a.stopPropagation();
      openNodeImagePreview(this._data, {
        currentSrc: this._img?.currentSrc || this._img?.src || ""
      });
    });
    const _0x13e05a = () => isCanvasLowZoomActive() || this._img?.dataset?.lodSrc === "thumb";
    const _0x567855 = () => {
      if (!_0x13e05a()) {
        return;
      }
      this._resolvedPreviewSig = "";
      this._refreshImageDisplay(true);
    };
    const _0x1492ef = (_0x8b652 = 0) => {
      if (this._lowZoomHoverRefreshTimer) {
        clearTimeout(this._lowZoomHoverRefreshTimer);
        this._lowZoomHoverRefreshTimer = null;
      }
      if (_0x8b652 > 0) {
        this._lowZoomHoverRefreshTimer = setTimeout(() => {
          this._lowZoomHoverRefreshTimer = null;
          if (_0x13e05a()) {
            setNodeMediaLodHoverPromoted(this.el, true);
          }
          _0x567855();
        }, _0x8b652);
        return;
      }
      setNodeMediaLodHoverPromoted(this.el, false);
      _0x567855();
    };
    this._card.addEventListener("pointerenter", () => _0x1492ef(SOURCE_IMAGE_LOD_HOVER_REFRESH_DELAY_MS));
    this._card.addEventListener("pointerleave", () => _0x1492ef(0));
    this._input = document.createElement("input");
    this._input.type = "file";
    this._input.accept = "image/*";
    this._input.style.display = "none";
    _0x4694cc.appendChild(this._input);
    this._uploadBtn.addEventListener("click", _0x4dd8a6 => {
      _0x4dd8a6.stopPropagation();
      this._input.click();
    });
    if (_0x56d9ed) {
      _0x56d9ed.addEventListener("pointerdown", _0x44df83 => {
        const _0x5aa661 = a518_0x345721.getStateRaw().ui?.imageVideoNodeResizeEnabled === true;
        const _0x59cc8e = document.getElementById("v2-wrap")?.classList.contains("v2-media-node-resize-enabled");
        if (!_0x5aa661 || !_0x59cc8e) {
          return;
        }
        startNodeResizePreview({
          event: _0x44df83,
          nodeId: this.id,
          getNode: () => a518_0x345721.getStateRaw().nodes?.[this.id] || this._data,
          getViewport: () => a518_0x345721.getStateRaw().viewport,
          resolveSize: ({
            startWidth: _0x477838,
            startHeight: _0x5b72b8,
            dx: _0x105d90,
            dy: _0x467b43
          }) => {
            const _0x5ea1eb = _0x477838 / _0x5b72b8;
            const _0x4cca03 = Math.max(_0x105d90 / _0x477838, _0x467b43 / _0x5b72b8);
            const _0x5b1af9 = Math.max(SOURCE_IMAGE_MIN_SIZE / _0x477838, SOURCE_IMAGE_MIN_SIZE / _0x5b72b8);
            const _0x44e980 = Math.max(_0x5b1af9, 1 + _0x4cca03);
            const _0x55580f = Math.max(SOURCE_IMAGE_MIN_SIZE, Math.round(_0x477838 * _0x44e980));
            const _0x5142d8 = Math.max(SOURCE_IMAGE_MIN_SIZE, Math.round(_0x55580f / _0x5ea1eb));
            return {
              width: _0x55580f,
              height: _0x5142d8
            };
          },
          buildFinalPatch: ({
            startNode: _0x26b889
          }) => _0x26b889?.needsAutoResize ? {
            needsAutoResize: false
          } : {},
          applyPatch: _0x2a9ca6 => a518_0x345721.updateNodeData(this.id, _0x2a9ca6),
          commit: commit
        });
      });
    }
    this._input.addEventListener("change", async _0x1ed9bd => {
      const _0x191815 = _0x1ed9bd.target.files[0];
      if (!_0x191815) {
        return;
      }
      this._isUploading = true;
      startLoading(this._card, {
        variant: "static"
      });
      this._img.style.display = "none";
      const _0xccf928 = Array.from(this._uploadBtn.childNodes).map(_0x3eb12c => _0x3eb12c.cloneNode(true));
      this._uploadBtn.textContent = sourceImageText("upload.transcoding");
      this._uploadBtn.style.pointerEvents = "none";
      try {
        const _0x3e97c7 = await new Promise((_0x194fdd, _0x5c1606) => {
          const _0x23df55 = URL.createObjectURL(_0x191815);
          const _0x226828 = new Image();
          _0x226828.onload = () => {
            const _0x1df063 = Math.round(Number(_0x226828.naturalWidth || _0x226828.width) || 0);
            const _0x595c39 = Math.round(Number(_0x226828.naturalHeight || _0x226828.height) || 0);
            const _0x24d448 = document.createElement("canvas");
            _0x24d448.width = _0x1df063;
            _0x24d448.height = _0x595c39;
            const _0x152504 = _0x24d448.getContext("2d");
            _0x152504.fillStyle = "var(--text-primary)";
            _0x152504.fillRect(0, 0, _0x24d448.width, _0x24d448.height);
            _0x152504.drawImage(_0x226828, 0, 0);
            URL.revokeObjectURL(_0x23df55);
            _0x24d448.toBlob(_0x82683f => {
              if (!_0x82683f) {
                _0x5c1606(new Error(sourceImageText("upload.canvasTranscodeFailed")));
                return;
              }
              const _0x3e96eb = Math.random().toString(36).substring(2, 8);
              const _0x89dc7b = _0x191815.name.replace(/\.[^/.]+$/, "");
              const _0x4f7528 = "upload_" + _0x3e96eb + "_" + _0x89dc7b + ".jpg";
              _0x194fdd({
                file: new File([_0x82683f], _0x4f7528, {
                  type: "image/jpeg"
                }),
                width: _0x1df063,
                height: _0x595c39
              });
            }, "image/jpeg", 0.85);
          };
          _0x226828.onerror = () => {
            URL.revokeObjectURL(_0x23df55);
            _0x5c1606(new Error(sourceImageText("upload.imageLoadFailed")));
          };
          _0x226828.src = _0x23df55;
        });
        const _0x10867b = _0x3e97c7.file;
        this._uploadBtn.textContent = sourceImageText("upload.uploading");
        const _0x46347d = window.currentProjectId || "default_v2_project";
        const _0x57fbd4 = await uploadFile(_0x10867b, _0x46347d);
        const _0x4888cf = _0x57fbd4?.displayLocalPath || _0x57fbd4?.thumbLocalPath ? _0x57fbd4 : await ensureLocalImageDerivatives(_0x57fbd4?.originalLocalPath || _0x57fbd4?.localPath);
        const _0x1f1f87 = String(_0x57fbd4?.url || _0x4888cf?.originalUrl || "").trim();
        const _0x3b7e47 = buildImageNodeStorageFields(_0x4888cf);
        const _0x54f39d = buildSourceImageUploadSizePatch({
          width: _0x4888cf?.originalWidth || _0x3b7e47.originalWidth,
          height: _0x4888cf?.originalHeight || _0x3b7e47.originalHeight
        }, {
          width: _0x3e97c7.width,
          height: _0x3e97c7.height
        });
        const _0x3fe1b7 = _0x191815.name.replace(/\.[^/.]+$/, "");
        a518_0x345721.renameNode(this.id, _0x3fe1b7);
        const _0x445259 = document.getElementById(this.id);
        const _0x2891b7 = _0x445259?.__v2_name_el;
        if (_0x2891b7) {
          _0x2891b7.textContent = _0x3fe1b7;
        }
        a518_0x345721.updateNodeData(this.id, {
          src: _0x1f1f87,
          assetId: _0x57fbd4?.assetId || _0x4888cf?.assetId || "",
          derivativeStatus: _0x57fbd4?.derivativeStatus || _0x4888cf?.derivativeStatus || _0x4888cf?.status || "",
          ..._0x3b7e47,
          fileName: _0x4888cf.filename || _0x57fbd4?.filename || _0x10867b.name,
          ..._0x54f39d
        });
        if (!_0x3b7e47.thumbLocalPath && _0x1f1f87) {
          this._queueThumbnail(_0x1f1f87);
        }
      } catch (_0x6c171a) {
        console.error("图片上传失败:", _0x6c171a);
        alert(sourceImageText("upload.failedRetry"));
        stopLoading(this._card);
        if (this._currentSrc) {
          this._img.style.display = "block";
        }
      } finally {
        this._isUploading = false;
        this._uploadBtn.replaceChildren(..._0xccf928.map(_0x40184c => _0x40184c.cloneNode(true)));
        this._uploadLabelNode = null;
        this._syncLocaleTexts();
        this._uploadBtn.style.pointerEvents = "auto";
        this._input.value = "";
      }
    });
    if (_0x220e83 && _0x53be2d !== _0x220e83) {
      this._scheduleImageDisplayRefresh(true);
    } else {
      this._refreshImageDisplay(true);
    }
    const _0x62fe3f = _0x4694cc.querySelector(".node-floating-toolbar");
    bindImageToolbarEvents(_0x62fe3f, this.id);
    _0x4694cc.addEventListener("v2-node:free-angle", _0x10e3f8 => {
      _0x10e3f8.stopPropagation();
      this._switchToFreeAngle();
    });
    this._maybeResumePersistedTasks(this._data);
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    return _0x4694cc;
  }
  _syncLocaleTexts() {
    if (!this._uploadBtn || this._isUploading) {
      return;
    }
    if (!this._uploadLabelNode || this._uploadLabelNode.parentNode !== this._uploadBtn) {
      this._uploadLabelNode = Array.from(this._uploadBtn.childNodes || []).find(_0x3157fa => _0x3157fa?.nodeType === 3) || null;
    }
    if (!this._uploadLabelNode) {
      this._uploadLabelNode = document.createTextNode("");
      this._uploadBtn.appendChild(this._uploadLabelNode);
    }
    this._uploadLabelNode.textContent = " " + sourceImageText("upload.button");
  }
  async _switchToFreeAngle() {
    if (a518_0x5a5d22.active && a518_0x5a5d22.nodeId === this.id) {
      a518_0x5a5d22._exit();
      return;
    }
    if (window.v2FocusOnNodeAtZoomPercent) {
      window.v2FocusOnNodeAtZoomPercent(this.id, 60);
    }
    const _0x388a9b = this.el.querySelector(".act-multiangle");
    this._bottomPanel = document.createElement("div");
    this._bottomPanel.className = "text-prompt-panel";
    this._bottomPanel.addEventListener("pointerdown", _0x46fb09 => {
      _0x46fb09.stopPropagation();
    });
    await a518_0x5a5d22.render(this.id, this._bottomPanel, () => this._switchToImage(), () => this._handleGenerate(), _0x388a9b);
    this.el.appendChild(this._bottomPanel);
  }
  _switchToImage() {
    if (this._bottomPanel && this._bottomPanel.parentNode) {
      this._bottomPanel.parentNode.removeChild(this._bottomPanel);
      this._bottomPanel = null;
    }
  }
  _handleGenerate() {
    if (window.showToast) {
      window.showToast(sourceImageText("toasts.generateUnsupported"), "info");
    }
  }
  _showLowZoomThumb(_0x2a622a) {
    const _0x34765b = String(_0x2a622a || "").trim();
    if (!_0x34765b) {
      this._showImg("", "");
      return;
    }
    stopLoading(this._card);
    this._currentSrc = _0x34765b;
    if (this._img) {
      const _0x32db57 = String(this._img.getAttribute("src") || "").trim();
      if (_0x32db57 !== _0x34765b && !hasSharedCanvasImageAcquisition(_0x34765b)) {
        this._assignImageDisplaySource(_0x34765b);
        this._setImageLodSrc("thumb");
        trackCanvasImageDisplayLoad(_0x34765b, this._img);
      }
      if (_0x32db57 || !hasSharedCanvasImageAcquisition(_0x34765b)) {
        this._img.style.display = "block";
      }
    }
    if (this._hint) {
      this._hint.style.display = "block";
    }
  }
  _showImg(_0x466a99, _0x4e6a3e = "") {
    if (this._rendererMediaDeferred === true) {
      this._currentSrc = String(_0x466a99 || "").trim();
      this._resolvedPreviewSig = "";
      return;
    }
    if (!_0x466a99) {
      stopLoading(this._card);
      clearCanvasImageDisplayHandoff(this._img);
      this._setImageLodSrc("");
      this._img.style.display = "none";
      if (this._data?.isGenerating) {
        if (this._hint) {
          this._hint.style.display = "none";
        }
      } else if (this._hint) {
        this._hint.style.display = "block";
      }
      return;
    }
    const _0x58f615 = String(_0x4e6a3e || this._cachedThumbUrl || "").trim();
    logDragImportProfile("SourceImageNode:show-img", {
      id: this.id,
      url: _0x466a99,
      fallbackThumb: _0x58f615,
      currentSrc: this._currentSrc || "",
      isGenerating: !!this._data?.isGenerating,
      jobStatus: this._data?.jobStatus || ""
    });
    if (this._failedSrc === _0x466a99 && _0x58f615) {
      this._assignImageDisplaySource(_0x58f615);
      this._setImageLodSrc("placeholder");
      this._img.style.display = "block";
      if (this._hint) {
        this._hint.style.display = "block";
      }
      return;
    }
    const _0x2d236b = String(this._img?.getAttribute("src") || "").trim();
    const _0x1290fb = this._currentSrc === _0x466a99 && _0x2d236b === _0x466a99 && this._img.style.display !== "none";
    let _0x4d8208 = false;
    let _0x4f3297 = false;
    let _0x14fb7b = null;
    const _0x46c08c = String(this._img?.getAttribute("src") || "").trim();
    const _0x483cea = String(this._img?.dataset?.lodSrc || "").trim();
    const _0x51f333 = _0x483cea === "placeholder" && !!_0x58f615 && _0x46c08c === _0x58f615;
    const _0x9363c5 = this._shouldUseLowZoomThumbnail();
    const _0x5f0d8f = _0x51f333 && !_0x9363c5;
    if (_0x5f0d8f && !hasSharedCanvasImageAcquisition(_0x466a99)) {
      _0x14fb7b = this._waitForDisplayedImageLoad(_0x466a99, {
        allowPendingSrc: true
      });
      if ("fetchPriority" in this._img) {
        this._img.fetchPriority = "high";
      }
      if ("loading" in this._img) {
        this._img.loading = "eager";
      }
      this._assignImageDisplaySource(_0x466a99);
      this._setImageLodSrc("full");
      this._img.style.display = "block";
      if (this._hint) {
        this._hint.style.display = "block";
      }
    } else if (_0x51f333 && this._currentSrc !== _0x466a99) {
      this._setImageLodSrc("placeholder");
      this._assignImageDisplaySource(_0x58f615);
      this._img.style.display = "block";
      if (this._hint) {
        this._hint.style.display = "block";
      }
      _0x4d8208 = true;
    } else if (this._currentSrc !== _0x466a99) {
      const _0x560217 = !_0x46c08c || this._img.style.display === "none";
      if (_0x560217) {
        if (!hasSharedCanvasImageAcquisition(_0x466a99)) {
          _0x14fb7b = this._waitForDisplayedImageLoad(_0x466a99, {
            allowPendingSrc: true
          });
          this._assignImageDisplaySource(_0x466a99);
          this._setImageLodSrc("full");
          this._img.style.display = "block";
          if (this._hint) {
            this._hint.style.display = "block";
          }
        }
      } else {
        this._img.style.display = "block";
        _0x4f3297 = true;
      }
    }
    this._currentSrc = _0x466a99;
    const _0x5ee65d = String(this._img?.getAttribute("src") || "").trim();
    const _0x214427 = _0x5ee65d === _0x466a99 && this._img.style.display !== "none";
    const _0x1b95ad = !!_0x58f615 && (_0x4d8208 || _0x5ee65d === _0x58f615) && this._img.style.display !== "none";
    const _0x1087bc = _0x4f3297 && !!_0x5ee65d && _0x5ee65d !== _0x466a99 && this._img.style.display !== "none";
    if (!_0x214427 && !_0x1b95ad && !_0x1087bc) {
      startLoading(this._card, {
        variant: "static"
      });
    } else {
      stopLoading(this._card);
    }
    if (_0x1290fb) {
      const _0x5678c6 = a518_0x345721.getStateRaw().nodes?.[this.id];
      const _0x12240d = Number(_0x5678c6?.imageWidth || 0) > 0 && Number(_0x5678c6?.imageHeight || 0) > 0;
      const _0x314d4f = _0x5678c6?.fixedSize !== true && _0x5678c6?.needsAutoResize === true;
      const _0x4e6282 = this._img?.complete === true && Number(this._img?.naturalWidth || this._img?.width || 0) > 0;
      if (_0x12240d && !_0x314d4f && _0x4e6282) {
        if (this._hint) {
          this._hint.style.display = "block";
        }
        return;
      }
    }
    if (_0x9363c5 && _0x1b95ad && !_0x214427) {
      if (this._hint) {
        this._hint.style.display = "block";
      }
      return;
    }
    const _0x20e303 = !_0x9363c5;
    const _0x42e025 = _0x214427 ? _0x14fb7b || this._waitForDisplayedImageLoad(_0x466a99) : preloadCanvasImage(_0x466a99, {
      decode: true,
      priority: _0x20e303 ? 120 : _0x58f615 ? 20 : 10,
      fetchPriority: _0x20e303 ? "high" : _0x58f615 ? "auto" : "high",
      allowWhenPaused: _0x20e303,
      deferWhenPaused: !_0x20e303
    });
    _0x42e025.then(({
      image: _0x354690,
      naturalWidth: _0x2697e9,
      naturalHeight: _0x4db235
    }) => {
      if (this._currentSrc !== _0x466a99) {
        return;
      }
      if (!this._shouldCommitPreloadedImage(_0x466a99)) {
        return;
      }
      logDragImportProfile("SourceImageNode:preload:onload", {
        id: this.id,
        url: _0x466a99,
        naturalWidth: _0x2697e9 || _0x354690?.naturalWidth || 0,
        naturalHeight: _0x4db235 || _0x354690?.naturalHeight || 0
      });
      const _0x58e12a = Math.max(1, Math.round(_0x2697e9 || _0x354690?.naturalWidth || 0));
      const _0x3b0ff2 = Math.max(1, Math.round(_0x4db235 || _0x354690?.naturalHeight || 0));
      const _0x1c3e87 = a518_0x345721.getStateRaw().nodes?.[this.id];
      if (_0x1c3e87) {
        const _0x41f82f = Number(_0x1c3e87.imageWidth || 0);
        const _0x34b2a7 = Number(_0x1c3e87.imageHeight || 0);
        if (_0x41f82f !== _0x58e12a || _0x34b2a7 !== _0x3b0ff2) {
          a518_0x345721.updateNodeData(this.id, {
            imageWidth: _0x58e12a,
            imageHeight: _0x3b0ff2
          });
        }
      }
      if (!_0x214427) {
        stopLoading(this._card);
        if ("fetchPriority" in this._img) {
          this._img.fetchPriority = "high";
        }
        if ("loading" in this._img) {
          this._img.loading = "eager";
        }
        this._assignImageDisplaySource(_0x466a99);
        this._setImageLodSrc("full");
      }
      this._img.style.display = "block";
      if (this._hint) {
        this._hint.style.display = "block";
      }
      if (this._activeCapturePreviewUrl && this._activeCapturePreviewUrl !== _0x466a99) {
        this._releaseActiveCapturePreviewUrl();
        if (_0x1c3e87?.capturePreviewUrl) {
          a518_0x345721.updateNodeData(this.id, {
            capturePreviewUrl: ""
          });
        }
      }
      if (!String(_0x1c3e87?.thumbLocalPath || "").trim()) {
        this._queueThumbnail(_0x466a99);
      }
      if (this._data.fixedSize) {
        return;
      }
      if (!this._data.needsAutoResize) {
        return;
      }
      const {
        width: _0x151a0a,
        height: _0x7eebf0
      } = getAutoMediaSizeByShortSide(_0x58e12a || 1000, _0x3b0ff2 || 1000);
      a518_0x345721.updateNodeData(this.id, {
        width: _0x151a0a,
        height: _0x7eebf0,
        needsAutoResize: false
      });
    }).catch(() => {
      if (this._currentSrc !== _0x466a99) {
        return;
      }
      if (!this._shouldCommitPreloadedImage(_0x466a99)) {
        return;
      }
      stopLoading(this._card);
      this._failedSrc = _0x466a99;
      const _0x460a1b = String(this._img?.getAttribute("src") || "").trim();
      const _0x5cc1eb = !!_0x460a1b && _0x460a1b !== _0x466a99 && this._img.style.display !== "none";
      if (_0x58f615) {
        this._setImageLodSrc("placeholder");
        if (_0x460a1b !== _0x58f615) {
          this._assignImageDisplaySource(_0x58f615);
        }
        this._img.style.display = "block";
      } else if (_0x5cc1eb) {
        this._img.style.display = "block";
      } else {
        clearCanvasImageDisplayHandoff(this._img);
        this._setImageLodSrc("");
        this._img.src = "";
        this._img.style.display = "none";
      }
      if (this._hint) {
        this._hint.style.display = "block";
      }
    });
  }
  _computeGenerationDuration(_0x2f2f27 = this._data) {
    if (!_0x2f2f27) {
      return 0;
    }
    if (typeof _0x2f2f27.generationDuration === "number") {
      return _0x2f2f27.generationDuration;
    }
    const _0xb2085f = Number(_0x2f2f27.generationStartTime || 0);
    if (!Number.isFinite(_0xb2085f) || _0xb2085f <= 0) {
      return 0;
    }
    return Math.max(0, Date.now() - _0xb2085f);
  }
  hydrateDeferredMedia() {
    if (this._rendererMediaDeferred !== true) {
      return;
    }
    this._rendererMediaDeferred = false;
    this._resolvedPreviewSig = "";
    const _0x2b6061 = a518_0x345721.getStateRaw().nodes?.[this.id] || this._data;
    this.update(_0x2b6061);
  }
  _inferAsyncProvider(_0x444789 = this._data) {
    const _0xa5b7 = String(_0x444789?.model || "").trim();
    const _0xadfd23 = resolveModelProvider(_0xa5b7, "", {
      allowProviderHint: false
    });
    if (_0xadfd23) {
      return _0xadfd23;
    }
    const _0x49654a = String(_0x444789?.asyncTaskProvider || _0x444789?.provider || "").trim().toLowerCase();
    if (_0x49654a) {
      return _0x49654a;
    }
    if (_0xa5b7 && !_0xa5b7.includes("/")) {
      return "grsai";
    }
    return "grsai";
  }
  _isRunningHubRecoverableTask(_0x46fba5 = this._data) {
    if (!_0x46fba5 || typeof _0x46fba5 !== "object") {
      return false;
    }
    const _0x174a04 = String(_0x46fba5.rhTaskId || "").trim();
    if (!_0x174a04) {
      return false;
    }
    const _0x478b20 = String(_0x46fba5.rhTaskStatus || "").trim().toLowerCase();
    if (["success", "idle", "cancelled"].includes(_0x478b20)) {
      return false;
    }
    if (_0x478b20 === "failed" && !this._isRunningHubLocalPendingFailure(_0x46fba5)) {
      return false;
    }
    const _0x46fbfa = String(_0x46fba5.provider || "").trim().toLowerCase();
    const _0x2ea2ba = String(_0x46fba5.model || "").trim();
    const _0x5ecc8f = resolveModelProvider(_0x2ea2ba, _0x46fbfa, {
      allowProviderHint: false
    });
    return _0x46fbfa === "runninghubwf" || _0x46fbfa === "runninghub" || isWorkflowModel(_0x2ea2ba, _0x46fbfa || "runninghubwf") || _0x5ecc8f === "runninghub" && isModelApiModel(_0x2ea2ba, "runninghub");
  }
  _isRunningHubLocalPendingFailure(_0x17d6c6 = this._data) {
    const _0x37bb31 = [_0x17d6c6?.outputText, _0x17d6c6?.jobError, _0x17d6c6?.rhStatusMessage].map(_0x4bd6e9 => String(_0x4bd6e9 || "").trim()).filter(Boolean).join("\n").toLowerCase();
    if (!_0x37bb31) {
      return false;
    }
    return _0x37bb31.includes("任务超时") || _0x37bb31.includes("请求超时") || _0x37bb31.includes("处理超时") || _0x37bb31.includes("仍在生成") || _0x37bb31.includes("继续查询") || _0x37bb31.includes("runninghub 仍在生成".toLowerCase());
  }
  _clearRunningHubRecoveryRetry() {
    if (!this._rhResumeRetryTimer) {
      return;
    }
    clearTimeout(this._rhResumeRetryTimer);
    this._rhResumeRetryTimer = null;
  }
  _scheduleRunningHubRecoveryRetry(_0x559c3f = 5000) {
    this._clearRunningHubRecoveryRetry();
    this._rhResumeRetryTimer = setTimeout(() => {
      this._rhResumeRetryTimer = null;
      this._maybeResumeRunningHubTask();
    }, Math.max(1000, Number(_0x559c3f) || 5000));
  }
  _isDreaminaRecoverableTask(_0x4a19d4 = this._data) {
    if (!_0x4a19d4 || typeof _0x4a19d4 !== "object") {
      return false;
    }
    const _0x29bbb7 = String(_0x4a19d4.dreaminaSubmitId || "").trim();
    if (!_0x29bbb7) {
      return false;
    }
    const _0x5d9e79 = String(_0x4a19d4.provider || "").trim().toLowerCase();
    const _0x2f4b4d = String(_0x4a19d4.model || "").trim();
    if (_0x5d9e79 !== "dreamina" && resolveModelProvider(_0x2f4b4d, _0x5d9e79) !== "dreamina") {
      return false;
    }
    const _0x2de360 = normalizeTaskStatus(_0x4a19d4.jobStatus);
    const _0x33e4fb = normalizeTaskStatus(_0x4a19d4.dreaminaTaskPhase);
    const _0x2bab0c = normalizeTaskStatus(_0x4a19d4.dreaminaTaskStatus);
    if (NON_RECOVERABLE_FAILURE_STATUSES.has(_0x2de360)) {
      return false;
    }
    if (DREAMINA_NON_RECOVERABLE_PHASES.has(_0x33e4fb)) {
      return false;
    }
    if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0x2bab0c)) {
      return false;
    }
    if (_0x4a19d4.isGenerating === true && _0x4a19d4.dreaminaTaskRecovering !== true) {
      const _0x3adfb8 = Number(_0x4a19d4.dreaminaTaskLastCheckedAt || _0x4a19d4.dreaminaTaskStartedAt || _0x4a19d4.generationStartTime || 0);
      if (Number.isFinite(_0x3adfb8) && _0x3adfb8 > 0 && Date.now() - _0x3adfb8 < DREAMINA_STALE_ACTIVE_RESUME_MS) {
        return false;
      }
    }
    return true;
  }
  _isDreaminaPollTimeoutError(_0x224cb2) {
    const _0x504d38 = String(_0x224cb2?.code || "").trim().toUpperCase();
    if (_0x504d38 === DREAMINA_POLL_TIMEOUT_CODE || _0x504d38 === "TIMEOUT") {
      return true;
    }
    const _0x40f244 = String(_0x224cb2?.type || "").trim().toUpperCase();
    if (_0x40f244 === "TIMEOUT" || _0x40f244 === "TASK_TIMEOUT") {
      return true;
    }
    const _0x2a94f7 = String(_0x224cb2?.message || "").trim().toLowerCase();
    return _0x2a94f7.includes("timeout") || _0x2a94f7.includes("超时");
  }
  _isAsyncRecoverableTask(_0x368e03 = this._data) {
    if (!_0x368e03 || typeof _0x368e03 !== "object") {
      return false;
    }
    const _0x46ec34 = String(_0x368e03.asyncTaskId || "").trim();
    if (!_0x46ec34) {
      return false;
    }
    const _0x28e21f = this._inferAsyncProvider(_0x368e03);
    if (!_0x28e21f || _0x28e21f === "runninghubwf" || _0x28e21f === "runninghub" || _0x28e21f === "dreamina") {
      return false;
    }
    const _0xa2210e = String(_0x368e03.asyncTaskKind || "").trim().toLowerCase();
    if (_0xa2210e && _0xa2210e !== "image") {
      return false;
    }
    const _0x23b8e1 = String(_0x368e03.asyncTaskStatus || "").trim().toLowerCase();
    if (["success", "failed", "idle", "cancelled"].includes(_0x23b8e1)) {
      return false;
    }
    return true;
  }
  _stopRunningHubRecovery(_0x48fa8f = true) {
    try {
      this._rhResumeAbortController?.abort?.();
    } catch {}
    this._clearRunningHubRecoveryRetry();
    this._rhResumeAbortController = null;
    this._rhResumePromise = null;
    this._rhResumeTaskId = "";
    if (!_0x48fa8f) {
      return;
    }
    const _0xfb60c3 = a518_0x345721.getState().nodes?.[this.id];
    if (!_0xfb60c3 || _0xfb60c3.rhTaskRecovering !== true) {
      return;
    }
    a518_0x345721.updateNodeData(this.id, {
      rhTaskRecovering: false
    });
  }
  _stopDreaminaRecovery(_0x225489 = true) {
    try {
      this._dreaminaResumeAbortController?.abort?.();
    } catch {}
    this._dreaminaResumeAbortController = null;
    this._dreaminaResumePromise = null;
    this._dreaminaResumeSubmitId = "";
    if (!_0x225489) {
      return;
    }
    const _0x13713e = a518_0x345721.getState().nodes?.[this.id];
    if (!_0x13713e || _0x13713e.dreaminaTaskRecovering !== true) {
      return;
    }
    a518_0x345721.updateNodeData(this.id, {
      dreaminaTaskRecovering: false
    });
  }
  _stopAsyncRecovery(_0x3a1e8d = true) {
    try {
      this._asyncResumeAbortController?.abort?.();
    } catch {}
    this._asyncResumeAbortController = null;
    this._asyncResumePromise = null;
    this._asyncResumeTaskId = "";
    if (!_0x3a1e8d) {
      return;
    }
    const _0x50be4b = a518_0x345721.getState().nodes?.[this.id];
    if (!_0x50be4b || _0x50be4b.asyncTaskRecovering !== true) {
      return;
    }
    a518_0x345721.updateNodeData(this.id, {
      asyncTaskRecovering: false
    });
  }
  _resolveRunningHubResumePayload(_0x3f025e) {
    const _0x2f9596 = String(_0x3f025e?.model || "").trim();
    const _0x57ccc0 = String(_0x3f025e?.provider || "").trim().toLowerCase();
    const _0x3d52e0 = String(_0x3f025e?.taskProviderProfileId || _0x3f025e?.providerProfileId || _0x3f025e?.rhProviderProfileId || "").trim();
    let _0x338ce6 = _0x57ccc0;
    if (!_0x338ce6) {
      _0x338ce6 = isModelApiModel(_0x2f9596, "runninghub") ? "runninghub" : "runninghubwf";
    }
    return {
      model: _0x2f9596,
      provider: _0x338ce6,
      ...(_0x3d52e0 ? {
        providerProfileId: _0x3d52e0,
        rhProviderProfileId: _0x3d52e0
      } : {})
    };
  }
  _resolveDreaminaResumePayload(_0x27430f) {
    return {
      model: String(_0x27430f?.model || "").trim() || getDefaultDreaminaImageModelId(),
      provider: "dreamina"
    };
  }
  _resolveAsyncResumePayload(_0x2d4591) {
    return {
      model: String(_0x2d4591?.model || "").trim(),
      provider: this._inferAsyncProvider(_0x2d4591)
    };
  }
  _fileNameFromPath(_0x408097) {
    const _0x45523f = String(_0x408097 || "").replace(/^\/+/, "");
    if (!_0x45523f) {
      return "";
    }
    const _0x12a235 = _0x45523f.split("/");
    return String(_0x12a235[_0x12a235.length - 1] || "").trim();
  }
  _buildRecoveredImageResultPatch(_0x178902, _0x3237cd = sourceImageText("recovery.imageTaskFailed")) {
    const _0x7df172 = _0x178902?.isBatch && Array.isArray(_0x178902.images) ? _0x178902.images[0] : _0x178902;
    if (!_0x7df172 || _0x7df172.error) {
      throw new Error(String(_0x7df172?.error || _0x3237cd));
    }
    const _0x2b02a9 = buildCanvasLocalImageFields(_0x7df172, {
      includeSrc: true
    });
    if (!_0x2b02a9.src || !_0x2b02a9.localPath) {
      throw new Error(sourceImageText("recovery.noOutputImage"));
    }
    return {
      ..._0x2b02a9,
      fileName: this._fileNameFromPath(_0x2b02a9.localPath)
    };
  }
  _maybeResumePersistedTasks(_0x4f74b1 = this._data) {
    const _0x2132bc = _0x4f74b1 || this._data || {};
    if (isTaskFailed(_0x2132bc) || isTaskCancelled(_0x2132bc)) {
      this._stopRunningHubRecovery(true);
      this._stopDreaminaRecovery(true);
      this._stopAsyncRecovery(true);
      return;
    }
    if (_0x2132bc.rhTaskId || this._rhResumePromise || this._rhResumeTaskId) {
      this._maybeResumeRunningHubTask(_0x2132bc);
    }
    if (_0x2132bc.dreaminaSubmitId || this._dreaminaResumePromise || this._dreaminaResumeSubmitId) {
      this._maybeResumeDreaminaTask(_0x2132bc);
    }
    if (_0x2132bc.asyncTaskId || this._asyncResumePromise || this._asyncResumeTaskId) {
      this._maybeResumeAsyncTask(_0x2132bc);
    }
  }
  _maybeResumeRunningHubTask(_0x36ed9f = null) {
    const _0x386abd = _0x36ed9f || (typeof a518_0x345721.getStateRaw === "function" ? a518_0x345721.getStateRaw()?.nodes?.[this.id] : a518_0x345721.getState().nodes?.[this.id]) || this._data;
    if (!this._isRunningHubRecoverableTask(_0x386abd)) {
      this._stopRunningHubRecovery(true);
      return;
    }
    const _0x33bccc = String(_0x386abd?.rhTaskId || "").trim();
    if (!_0x33bccc) {
      return;
    }
    if (this._rhResumePromise && this._rhResumeTaskId === _0x33bccc) {
      return;
    }
    const _0x3444ed = Number(_0x386abd?.rhTaskStartedAt || _0x386abd?.generationStartTime || 0) || Date.now();
    const _0x24857a = this._resolveRunningHubResumePayload(_0x386abd);
    const _0x3ea71b = _0x386abd?.rhTaskUseOpenapiQuery === true;
    const _0x55ab42 = typeof this._resumeRunningHubTaskPoller === "function" ? this._resumeRunningHubTaskPoller : resumeRunningHubImageTask;
    const _0x133dc8 = new AbortController();
    this._rhResumeAbortController = _0x133dc8;
    this._rhResumeTaskId = _0x33bccc;
    const _0x4aa685 = (async () => {
      try {
        const _0xbdf9db = await resumeTask({
          sourceNodeId: this.id,
          targetNodeId: this.id,
          trigger: "node",
          taskType: "image-generation",
          provider: _0x24857a.provider || _0x386abd?.provider || "runninghubwf",
          adapterType: "workflow",
          modelId: _0x24857a.model || _0x386abd?.model || "",
          executionId: "runninghub.source-image." + (_0x24857a.model || _0x386abd?.model || "workflow"),
          payload: _0x24857a,
          taskId: _0x33bccc,
          cancellable: false,
          resumable: true,
          startBuilder: () => ({
            rhTaskStatus: String(_0x386abd?.rhTaskStatus || "").trim().toLowerCase() === "pending" ? "pending" : "running",
            rhTaskUseOpenapiQuery: _0x3ea71b
          }),
          poll: async () => _0x55ab42(_0x33bccc, _0x24857a, {
            signal: _0x133dc8.signal,
            useOpenapiQuery: _0x3ea71b,
            softTimeout: true
          }),
          resultBuilder: async _0x39ae0e => {
            const _0x771dea = a518_0x345721.getState().nodes?.[this.id] || {};
            const _0x2ce05a = String(_0x771dea?.name || sourceImageText("result.defaultName")).replace(/\s*\(处理中\)\s*$/, "").replace(/\s*\(恢复中\)\s*$/, "").trim();
            return {
              ...this._buildRecoveredImageResultPatch(_0x39ae0e, sourceImageText("recovery.imageTaskFailed")),
              name: _0x2ce05a || sourceImageText("result.defaultName"),
              generationDuration: this._computeGenerationDuration(_0x771dea)
            };
          },
          failureBuilder: (_0x37051f, _0x5a3c2c) => {
            const _0x35f729 = _0x37051f instanceof Error ? _0x37051f.message : String(_0x37051f || sourceImageText("recovery.taskFailed"));
            const _0x57d1ef = a518_0x345721.getState().nodes?.[this.id] || {};
            return buildSourceImageRecoveryFailurePatch(_0x57d1ef, {
              error: _0x35f729,
              startedAt: _0x5a3c2c.startedAt,
              duration: this._computeGenerationDuration(_0x57d1ef)
            });
          },
          parseError: _0x51d23e => _0x51d23e instanceof Error ? _0x51d23e.message : String(_0x51d23e || sourceImageText("recovery.taskFailed"))
        }, {
          store: a518_0x345721,
          startedAt: _0x3444ed,
          abortController: _0x133dc8
        });
        if (_0xbdf9db.status === "pending") {
          window._triggerLocalCacheSave?.();
          this._scheduleRunningHubRecoveryRetry();
          return;
        }
        if (_0xbdf9db.status === "success") {
          window._triggerLocalCacheSave?.();
        }
      } catch (_0x5a3d11) {
        if (_0x133dc8.signal.aborted || String(_0x5a3d11?.message || "") === "CANCELLED" || _0x5a3d11?.name === "AbortError") {
          return;
        }
        const _0x2cbb76 = _0x5a3d11 instanceof Error ? _0x5a3d11.message : String(_0x5a3d11 || sourceImageText("recovery.taskFailed"));
        const _0x37294f = a518_0x345721.getState().nodes?.[this.id];
        if (!_0x37294f) {
          return;
        }
        a518_0x345721.updateNodeData(this.id, {
          ...buildSourceImageRecoveryFailurePatch(_0x37294f, {
            error: _0x2cbb76,
            startedAt: _0x3444ed,
            duration: this._computeGenerationDuration(_0x37294f)
          }),
          isGenerating: false,
          rhTaskStatus: "failed",
          rhTaskRecovering: false
        });
      } finally {
        if (this._rhResumeAbortController === _0x133dc8) {
          this._rhResumeAbortController = null;
        }
        if (this._rhResumeTaskId === _0x33bccc) {
          this._rhResumeTaskId = "";
        }
        this._rhResumePromise = null;
      }
    })();
    this._rhResumePromise = _0x4aa685;
  }
  _maybeResumeDreaminaTask(_0x4845ee = null) {
    const _0xa3e089 = _0x4845ee || (typeof a518_0x345721.getStateRaw === "function" ? a518_0x345721.getStateRaw()?.nodes?.[this.id] : a518_0x345721.getState().nodes?.[this.id]) || this._data;
    if (!this._isDreaminaRecoverableTask(_0xa3e089)) {
      this._stopDreaminaRecovery(true);
      return;
    }
    const _0xdc6a44 = String(_0xa3e089?.dreaminaSubmitId || "").trim();
    if (!_0xdc6a44) {
      return;
    }
    if (this._dreaminaResumeSubmitId === _0xdc6a44) {
      return;
    }
    const _0x599f34 = Number(_0xa3e089?.dreaminaTaskStartedAt || _0xa3e089?.generationStartTime || 0) || Date.now();
    const _0x439162 = this._resolveDreaminaResumePayload(_0xa3e089);
    const _0x1d3b99 = typeof this._dreaminaResumePoller === "function" ? this._dreaminaResumePoller : resumeDreaminaImageTask;
    const _0x53224c = new AbortController();
    this._dreaminaResumeAbortController = _0x53224c;
    this._dreaminaResumeSubmitId = _0xdc6a44;
    const _0x2046ff = (async () => {
      try {
        const _0x970c7a = await resumeTask({
          sourceNodeId: this.id,
          targetNodeId: this.id,
          trigger: "node",
          taskType: "image-generation",
          provider: "dreamina",
          adapterType: "localRuntime",
          modelId: _0x439162.model || _0xa3e089?.model || "",
          executionId: "dreamina.source-image." + (_0x439162.model || _0xa3e089?.model || "image"),
          payload: _0x439162,
          taskId: _0xdc6a44,
          cancellable: false,
          resumable: true,
          startBuilder: () => ({
            dreaminaSubmitId: _0xdc6a44,
            dreaminaTaskStatus: "pending",
            dreaminaTaskPhase: "generating",
            dreaminaTaskLabel: String(_0xa3e089?.dreaminaTaskLabel || "").trim() || sourceImageText("status.generating"),
            dreaminaTaskStartedAt: _0x599f34,
            dreaminaTaskLastCheckedAt: Date.now(),
            dreaminaTaskRecovering: true
          }),
          poll: async () => _0x1d3b99(_0xdc6a44, _0x439162, {
            signal: _0x53224c.signal
          }),
          resultBuilder: async (_0x2338c8, _0x374d50) => {
            const _0x4320c0 = a518_0x345721.getState().nodes?.[this.id] || {};
            const _0x156c9e = String(_0x4320c0?.name || sourceImageText("result.defaultName")).replace(/\s*\(处理中\)\s*$/, "").replace(/\s*\(恢复中\)\s*$/, "").trim();
            return {
              ...this._buildRecoveredImageResultPatch(_0x2338c8, sourceImageText("recovery.dreaminaImageTaskFailed")),
              isGenerating: false,
              name: _0x156c9e || sourceImageText("result.defaultName"),
              generationDuration: this._computeGenerationDuration(_0x4320c0),
              dreaminaTaskStatus: "success",
              dreaminaTaskPhase: "done",
              dreaminaTaskLabel: sourceImageText("status.completed"),
              dreaminaTaskLastCheckedAt: Date.now(),
              dreaminaTaskRecovering: false
            };
          },
          failureBuilder: (_0x4802e2, _0x470190) => {
            const _0x53538d = _0x4802e2 instanceof Error ? _0x4802e2.message : String(_0x4802e2 || sourceImageText("recovery.taskFailed"));
            const _0x1c4524 = a518_0x345721.getState().nodes?.[this.id] || {};
            if (this._isDreaminaPollTimeoutError(_0x4802e2)) {
              return {
                isGenerating: true,
                jobStatus: "running",
                jobError: null,
                generationDuration: Date.now() - _0x470190.startedAt,
                dreaminaTaskStatus: "pending",
                dreaminaTaskPhase: "generating",
                dreaminaTaskLabel: sourceImageText("status.queuedBackground"),
                dreaminaTaskStartedAt: _0x470190.startedAt,
                dreaminaTaskLastCheckedAt: Date.now(),
                dreaminaTaskRecovering: false
              };
            }
            return {
              ...buildSourceImageRecoveryFailurePatch(_0x1c4524, {
                error: _0x53538d,
                startedAt: _0x470190.startedAt,
                duration: this._computeGenerationDuration(_0x1c4524)
              }),
              isGenerating: false,
              dreaminaTaskStatus: "failed",
              dreaminaTaskPhase: "failed",
              dreaminaTaskLabel: _0x53538d || sourceImageText("recovery.failed"),
              dreaminaTaskLastCheckedAt: Date.now(),
              dreaminaTaskRecovering: false
            };
          },
          cancelledBuilder: _0x2fffc1 => ({
            isGenerating: false,
            generationDuration: Date.now() - _0x2fffc1.startedAt,
            dreaminaTaskStatus: "cancelled",
            dreaminaTaskPhase: "cancelled",
            dreaminaTaskLabel: sourceImageText("status.cancelled"),
            dreaminaTaskStartedAt: _0x2fffc1.startedAt,
            dreaminaTaskLastCheckedAt: Date.now(),
            dreaminaTaskRecovering: false
          }),
          parseError: _0x1300c4 => _0x1300c4 instanceof Error ? _0x1300c4.message : String(_0x1300c4 || sourceImageText("recovery.taskFailed"))
        }, {
          store: a518_0x345721,
          startedAt: _0x599f34,
          abortController: _0x53224c
        });
        if (_0x970c7a.status === "success" || _0x970c7a.status === "pending" || _0x970c7a.status === "failed" && this._isDreaminaPollTimeoutError(_0x970c7a.error)) {
          window._triggerLocalCacheSave?.();
        }
      } catch (_0x3af1e7) {
        if (_0x53224c.signal.aborted || String(_0x3af1e7?.message || "") === "CANCELLED" || _0x3af1e7?.name === "AbortError") {
          return;
        }
      } finally {
        if (this._dreaminaResumeAbortController === _0x53224c) {
          this._dreaminaResumeAbortController = null;
        }
        if (this._dreaminaResumeSubmitId === _0xdc6a44) {
          this._dreaminaResumeSubmitId = "";
        }
        this._dreaminaResumePromise = null;
      }
    })();
    this._dreaminaResumePromise = _0x2046ff;
  }
  _maybeResumeAsyncTask(_0x16437e = null) {
    const _0x512ac0 = _0x16437e || (typeof a518_0x345721.getStateRaw === "function" ? a518_0x345721.getStateRaw()?.nodes?.[this.id] : a518_0x345721.getState().nodes?.[this.id]) || this._data;
    if (!this._isAsyncRecoverableTask(_0x512ac0)) {
      this._stopAsyncRecovery(true);
      return;
    }
    const _0xb47712 = String(_0x512ac0?.asyncTaskId || "").trim();
    if (!_0xb47712) {
      return;
    }
    if (this._asyncResumePromise && this._asyncResumeTaskId === _0xb47712) {
      return;
    }
    const _0x3e9a93 = Number(_0x512ac0?.asyncTaskStartedAt || _0x512ac0?.generationStartTime || 0) || Date.now();
    const _0x24c130 = this._resolveAsyncResumePayload(_0x512ac0);
    const _0x5d99f4 = _0x24c130.provider || this._inferAsyncProvider(_0x512ac0);
    const _0x4b9e37 = typeof this._resumeAsyncTaskPoller === "function" ? this._resumeAsyncTaskPoller : resumeAsyncImageTask;
    const _0x1fdcd7 = new AbortController();
    this._asyncResumeAbortController = _0x1fdcd7;
    this._asyncResumeTaskId = _0xb47712;
    const _0x376f4e = (async () => {
      try {
        const _0x3ac79f = await resumeTask({
          sourceNodeId: this.id,
          targetNodeId: this.id,
          trigger: "node",
          taskType: "image-generation",
          provider: _0x5d99f4 || _0x24c130.provider || _0x512ac0?.provider || "",
          adapterType: "modelApi",
          modelId: _0x24c130.model || _0x512ac0?.model || "",
          executionId: (_0x5d99f4 || _0x24c130.provider || "model") + ".source-image.async",
          payload: _0x24c130,
          taskId: _0xb47712,
          async: true,
          cancellable: false,
          resumable: true,
          startBuilder: () => ({
            asyncTaskProvider: _0x5d99f4,
            asyncTaskKind: "image",
            asyncTaskStatus: String(_0x512ac0?.asyncTaskStatus || "").trim().toLowerCase() === "pending" ? "pending" : "running"
          }),
          poll: async () => _0x4b9e37(_0xb47712, _0x24c130, {
            signal: _0x1fdcd7.signal
          }),
          resultBuilder: async _0x1b2bb5 => {
            const _0x14fb6f = a518_0x345721.getState().nodes?.[this.id] || {};
            const _0x50bdaa = String(_0x14fb6f?.name || sourceImageText("result.defaultName")).replace(/\s*\(处理中\)\s*$/, "").replace(/\s*\(恢复中\)\s*$/, "").trim();
            return {
              ...this._buildRecoveredImageResultPatch(_0x1b2bb5, sourceImageText("recovery.asyncImageTaskFailed")),
              name: _0x50bdaa || sourceImageText("result.defaultName"),
              generationDuration: this._computeGenerationDuration(_0x14fb6f)
            };
          },
          failureBuilder: (_0x2fd5dd, _0x3b066a) => {
            const _0x1d83c6 = _0x2fd5dd instanceof Error ? _0x2fd5dd.message : String(_0x2fd5dd || sourceImageText("recovery.taskFailed"));
            const _0x4a5bb3 = a518_0x345721.getState().nodes?.[this.id] || {};
            return buildSourceImageRecoveryFailurePatch(_0x4a5bb3, {
              error: _0x1d83c6,
              startedAt: _0x3b066a.startedAt,
              duration: this._computeGenerationDuration(_0x4a5bb3)
            });
          },
          parseError: _0x15fa47 => _0x15fa47 instanceof Error ? _0x15fa47.message : String(_0x15fa47 || sourceImageText("recovery.taskFailed"))
        }, {
          store: a518_0x345721,
          startedAt: _0x3e9a93,
          abortController: _0x1fdcd7
        });
        if (_0x3ac79f.status === "success") {
          window._triggerLocalCacheSave?.();
        }
      } catch (_0x3b5512) {
        if (_0x1fdcd7.signal.aborted || String(_0x3b5512?.message || "") === "CANCELLED" || _0x3b5512?.name === "AbortError") {
          return;
        }
        const _0x21af79 = _0x3b5512 instanceof Error ? _0x3b5512.message : String(_0x3b5512 || sourceImageText("recovery.taskFailed"));
        const _0x5574eb = a518_0x345721.getState().nodes?.[this.id];
        if (!_0x5574eb) {
          return;
        }
        a518_0x345721.updateNodeData(this.id, {
          ...buildSourceImageRecoveryFailurePatch(_0x5574eb, {
            error: _0x21af79,
            startedAt: _0x3e9a93,
            duration: this._computeGenerationDuration(_0x5574eb)
          }),
          isGenerating: false,
          asyncTaskStatus: "failed",
          asyncTaskRecovering: false
        });
      } finally {
        if (this._asyncResumeAbortController === _0x1fdcd7) {
          this._asyncResumeAbortController = null;
        }
        if (this._asyncResumeTaskId === _0xb47712) {
          this._asyncResumeTaskId = "";
        }
        this._asyncResumePromise = null;
      }
    })();
    this._asyncResumePromise = _0x376f4e;
  }
  _syncJobUI(_0x411413) {
    if (!this._jobUI) {
      return;
    }
    _0x411413 = _0x411413 || null;
    if (_0x411413 === "running") {
      if (this._getCapturePreviewUrl(this._data)) {
        stopLoading(this._jobUI);
        this._jobUI.style.display = "none";
        this._jobUI.replaceChildren();
        if (this._hint) {
          this._hint.style.display = "none";
        }
        if (this._uploadBtn) {
          this._uploadBtn.disabled = true;
        }
        return;
      }
      this._jobUI.style.display = "flex";
      this._jobUI.replaceChildren();
      startLoading(this._jobUI, {
        variant: "full"
      });
      if (this._hint) {
        this._hint.style.display = "none";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = true;
      }
    } else if (_0x411413 === "error") {
      this._jobUI.style.display = "flex";
      this._jobUI.replaceChildren();
      stopLoading(this._jobUI);
      const _0xf7727 = document.createElement("div");
      _0xf7727.style.color = "var(--text-danger)";
      _0xf7727.style.fontSize = "13px";
      _0xf7727.style.textAlign = "center";
      _0xf7727.style.padding = "20px";
      _0xf7727.style.maxWidth = "90%";
      _0xf7727.style.wordBreak = "break-word";
      _0xf7727.textContent = getTaskMessage(this._data) || sourceImageText("status.generationFailed");
      this._jobUI.appendChild(_0xf7727);
      if (this._hint) {
        this._hint.style.display = "block";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = false;
      }
    } else {
      if (this._jobUI.style.display !== "none") {
        this._jobUI.style.opacity = "0";
        this._jobUI.style.transition = "opacity 0.4s ease";
        setTimeout(() => {
          this._jobUI.style.display = "none";
          this._jobUI.style.opacity = "1";
          this._jobUI.style.transition = "";
          stopLoading(this._jobUI);
        }, 400);
      }
      if (this._hint) {
        this._hint.style.display = "block";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = false;
      }
    }
  }
  update(_0x3a7679) {
    if (!this._img) {
      return;
    }
    const _0x408b8b = this._currentJobStatus;
    this._data = _0x3a7679;
    this._currentJobStatus = _0x3a7679.jobStatus || null;
    const _0x452e0c = this._getImageDisplayLod(_0x3a7679).url || this._getCapturePreviewUrl(_0x3a7679);
    if (this._currentJobStatus !== _0x408b8b) {
      this._syncJobUI(this._currentJobStatus);
    }
    const _0x4b64aa = shouldShowGenerationResultLoadingUi(_0x3a7679, {
      hasResult: !!_0x452e0c
    }) && !this._currentJobStatus;
    if (_0x4b64aa) {
      startLoading(this._card, {
        variant: "static"
      });
      if (this._hint) {
        this._hint.style.display = "none";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = true;
      }
    } else if (isTaskTerminal(_0x3a7679)) {
      stopLoading(this._card);
      if (this._uploadBtn) {
        this._uploadBtn.disabled = false;
      }
    } else if (!this._currentJobStatus) {
      if (!this._isUploading && _0x452e0c === this._currentSrc) {
        stopLoading(this._card);
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = false;
      }
    }
    this._refreshImageDisplay();
    this._applyMaskPreview(_0x3a7679.maskPreviewUrl || _0x3a7679.maskPreview);
    this._maybeResumePersistedTasks(_0x3a7679);
  }
  unmount() {
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    if (this._idleImageRefreshCancel) {
      this._idleImageRefreshCancel();
      this._idleImageRefreshCancel = null;
    }
    if (this._lowZoomHoverRefreshTimer) {
      clearTimeout(this._lowZoomHoverRefreshTimer);
      this._lowZoomHoverRefreshTimer = null;
    }
    setNodeMediaLodHoverPromoted(this.el, false);
    clearCanvasImageDisplayHandoff(this._img);
    this._releaseActiveCapturePreviewUrl();
    this._flushRetiredCapturePreviewUrls({
      force: true
    });
    this._stopRunningHubRecovery(false);
    this._stopDreaminaRecovery(false);
    this._stopAsyncRecovery(false);
  }
}