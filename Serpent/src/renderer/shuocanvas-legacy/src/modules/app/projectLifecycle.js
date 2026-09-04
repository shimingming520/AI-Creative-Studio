import { sanitizeSerializedCanvasData } from "../../utils/thumbnailPersistence.js";
import { buildUniqueCanvasName, isCanvasProjectFileName, stripCanvasProjectFileExtension } from "../../utils/canvasProjectFileNames.js";
import { buildImageNodeStorageFields } from "../../services/imageDerivativeService.js";
import { buildCanvasLocalImageFields } from "../../services/canvasMediaLocalService.js";
import { resolveGenerationTaskIdentity } from "../../core/generationExecutionPlan.js";
import { createStableSignature } from "../../utils/stableSignature.js";
import { normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { isModelApiModel, isWorkflowModel as a876_0x4beafd, resolveModelProvider } from "../../manifests/index.js";
import { t } from "../../i18n/index.js";
import { desktopBridge } from "../../services/desktopBridge.js";
import { cancelStartupLoaderGuard } from "../../services/startupLoaderGuard.js";
import { createWorkspaceCacheIdleScheduler, isWorkspaceCacheInteractionBusy } from "./workspaceCacheIdleScheduler.js";
export { createStableSignature } from "../../utils/stableSignature.js";
const BOOT_PERF_MEASURE_NAMES = ["project.loadProject", "buildHydrationSafeMultiData", "hydrateTrustedSnapshot", "CanvasTabManager.init", "loader hidden", "historicalAiLocalization queued"];
const WORKSPACE_META_KEY = "workspace_meta";
const LEGACY_WORKSPACE_KEY = "current_state";
const WORKSPACE_CANVAS_KEY_PREFIX = "workspace_canvas::";
const PROJECT_WORKSPACE_META_KEY_PREFIX = "project_workspace_meta::";
const PROJECT_WORKSPACE_CANVAS_KEY_PREFIX = "project_workspace_canvas::";
const DREAMINA_RESUME_BACKUP_KEY = "tapnow_v2_dreamina_resume_backup";
const PAGE_LIFECYCLE_FLUSH_DEDUPE_MS = 2000;
const RECOVERY_SNAPSHOT_DEDUPE_MS = 5000;
const WORKSPACE_CACHE_PERSIST_DELAY_MS = 1000;
const WORKSPACE_CACHE_META_DELAY_MS = 150;
const WORKSPACE_CACHE_BUSY_RETRY_MS = 250;
const INITIAL_LOADER_MAX_VISIBLE_MS = 10000;
const INITIAL_IMAGE_READY_POLL_MS = 75;
const INITIAL_IMAGE_READY_MAX_ATTEMPTS = 30;
const INITIAL_IMAGE_READY_MIN_RATIO = 0.8;
const INITIAL_IMAGE_READY_MIN_ATTEMPTS = 4;
const INITIAL_IMAGE_READY_STABLE_POLLS = 2;
const INITIAL_IMAGE_REVEAL_MAX_ITEMS = 12;
const INITIAL_REVEAL_IDLE_TIMEOUT_MS = 500;
const INITIAL_PROGRESS_FINISH_MS = 280;
const INITIAL_IMAGE_REVEAL_BASE_MS = 680;
const INITIAL_IMAGE_REVEAL_STAGGER_MS = 60;
const INITIAL_IMAGE_REVEAL_MAX_STAGGER_INDEX = 5;
const INITIAL_BRAND_IMAGE_HANDOFF_MS = 140;
const INITIAL_BACKGROUND_REVEAL_MS = 360;
const INITIAL_IMAGE_LAYER_HANDOFF_MS = 100;
const INITIAL_REVEAL_FRAME_TIMEOUT_MS = 96;
const INITIAL_CANVAS_IMAGE_NODE_TYPES = new Set(["ai-image", "image", "source-image", "source_image"]);
const DREAMINA_RESUME_BACKUP_FIELDS = ["canvasId", "nodeId", "generationStartTime", "generationDuration", "dreaminaSubmitId", "dreaminaTaskStatus", "dreaminaTaskPhase", "dreaminaTaskLabel", "dreaminaTaskStartedAt", "dreaminaTaskLastCheckedAt", "dreaminaTaskRecovering", "dreaminaTaskLastRaw"];
export function resolveInitialLoaderMinimumVisibleMs(_0xecafb5, {
  windowObject = globalThis.window
} = {}) {
  if (windowObject?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    return 0;
  }
  const _0x4beff = Number(_0xecafb5?.dataset?.minVisibleMs);
  if (!Number.isFinite(_0x4beff) || _0x4beff <= 0) {
    return 0;
  }
  return Math.min(INITIAL_LOADER_MAX_VISIBLE_MS, Math.round(_0x4beff));
}
export function waitForInitialLoaderSequence({
  loader: _0x5e45ae,
  windowObject = globalThis.window,
  scheduleTimeout = globalThis.setTimeout
} = {}) {
  const _0x959d13 = resolveInitialLoaderMinimumVisibleMs(_0x5e45ae, {
    windowObject: windowObject
  });
  if (_0x959d13 <= 0 || typeof scheduleTimeout !== "function") {
    return Promise.resolve();
  }
  return new Promise(_0x4d58d5 => {
    scheduleTimeout(_0x4d58d5, _0x959d13);
  });
}
export function waitForInitialRevealFrame({
  windowObject = globalThis.window,
  scheduleTimeout = globalThis.setTimeout,
  cancelTimeout = globalThis.clearTimeout,
  timeoutMs = INITIAL_REVEAL_FRAME_TIMEOUT_MS
} = {}) {
  return new Promise(_0x179179 => {
    let _0x510f0c = false;
    let _0x530df0 = null;
    const _0x40c842 = () => {
      if (_0x510f0c) {
        return;
      }
      _0x510f0c = true;
      _0x179179();
    };
    const _0x41b449 = typeof windowObject?.requestAnimationFrame === "function";
    const _0x1b24a8 = _0x41b449 ? Math.max(16, Number(timeoutMs) || INITIAL_REVEAL_FRAME_TIMEOUT_MS) : 16;
    if (typeof scheduleTimeout === "function") {
      _0x530df0 = scheduleTimeout(_0x40c842, _0x1b24a8);
    }
    if (!_0x41b449) {
      if (_0x530df0 === null) {
        _0x40c842();
      }
      return;
    }
    try {
      windowObject.requestAnimationFrame(() => {
        if (_0x530df0 !== null && typeof cancelTimeout === "function") {
          cancelTimeout(_0x530df0);
        }
        _0x40c842();
      });
    } catch {
      _0x40c842();
    }
  });
}
export function scheduleInitialLoaderFailOpen({
  loader: _0x314af6,
  wrapEl: _0x184c9a,
  canvasEl: _0x246d29,
  timeoutMs = INITIAL_LOADER_MAX_VISIBLE_MS,
  scheduleTimeout = globalThis.setTimeout,
  cancelTimeout = globalThis.clearTimeout,
  onTimeout: _0x25237b
} = {}) {
  if (!_0x314af6 || typeof scheduleTimeout !== "function") {
    return () => {};
  }
  let _0x47d995 = true;
  const _0x1e2e47 = scheduleTimeout(() => {
    if (!_0x47d995) {
      return;
    }
    _0x47d995 = false;
    if (_0x246d29) {
      _0x246d29.style.transition = "";
    }
    if (_0x184c9a) {
      _0x184c9a.style.transition = "";
      _0x184c9a.style.opacity = "1";
      _0x184c9a.classList?.remove?.("is-initial-header-locked");
    }
    _0x314af6.style.opacity = "0";
    _0x314af6.style.visibility = "hidden";
    _0x314af6.remove?.();
    _0x25237b?.();
  }, Math.max(0, Number(timeoutMs) || INITIAL_LOADER_MAX_VISIBLE_MS));
  return () => {
    if (!_0x47d995) {
      return;
    }
    _0x47d995 = false;
    if (typeof cancelTimeout === "function") {
      cancelTimeout(_0x1e2e47);
    }
  };
}
export function hasInitialCanvasImageNodes(_0x498c6b) {
  const _0x14ddc9 = _0x47497b => String(_0x47497b || "").trim().length > 0;
  const _0x52d4b0 = _0x2fefb3 => !!_0x2fefb3 && [_0x2fefb3.imageUrl, _0x2fefb3.localPath, _0x2fefb3.originalLocalPath, _0x2fefb3.displayLocalPath, _0x2fefb3.sourceUrl, _0x2fefb3.src, _0x2fefb3.thumbId, _0x2fefb3.thumbUrl, _0x2fefb3.url].some(_0x14ddc9);
  return Object.values(_0x498c6b || {}).some(_0x10b5bf => {
    if (!INITIAL_CANVAS_IMAGE_NODE_TYPES.has(String(_0x10b5bf?.type || "").trim().toLowerCase())) {
      return false;
    }
    if (Array.isArray(_0x10b5bf?.images) && _0x10b5bf.images.some(_0x52d4b0)) {
      return true;
    }
    return _0x52d4b0(_0x10b5bf);
  });
}
function getInitialRevealImageSource(_0x4b6f42) {
  return String(_0x4b6f42?.currentSrc || _0x4b6f42?.getAttribute?.("src") || _0x4b6f42?.src || _0x4b6f42?.dataset?.lazySrc || _0x4b6f42?.dataset?.lazyPreviewSrc || "").trim();
}
function getInitialRevealImages(_0x552e3e) {
  return Array.from(_0x552e3e?.querySelectorAll?.("img.node-img, img.aigen-image-media, .multi-images-container img.v2-media-preview, img.v2-fast-preview-media") || []).filter(_0xedb55e => getInitialRevealImageSource(_0xedb55e));
}
function isInitialRevealImageReady(_0x1c3348) {
  return getInitialRevealImageSource(_0x1c3348) && _0x1c3348?.complete === true && Number(_0x1c3348?.naturalWidth || 0) > 0;
}
export function collectInitialImageRevealTargets(_0x455e73) {
  return Array.from(_0x455e73?.querySelectorAll?.(".v2-node.image-node") || []).filter(_0x4cce57 => getInitialRevealImages(_0x4cce57).length > 0);
}
function getInitialRasterRevealRect(_0x26aeec, _0x2ec79d, _0x351402) {
  const _0x46bd5b = getInitialRevealImageRect(_0x26aeec);
  const _0x3ed9f0 = Number(_0x351402?.width);
  const _0x554383 = Number(_0x351402?.height);
  if (!_0x46bd5b || !(_0x3ed9f0 > 0) || !(_0x554383 > 0) || ![_0x2ec79d?.x, _0x2ec79d?.y, _0x2ec79d?.width, _0x2ec79d?.height].every(_0x303508 => Number.isFinite(Number(_0x303508)))) {
    return null;
  }
  const _0x20a0d0 = _0x46bd5b.width / _0x3ed9f0;
  const _0x3e2653 = _0x46bd5b.height / _0x554383;
  const _0xaf11d2 = _0x46bd5b.left + (Number(_0x2ec79d.x) - Number(_0x351402.left || 0)) * _0x20a0d0;
  const _0x519486 = _0x46bd5b.top + (Number(_0x2ec79d.y) - Number(_0x351402.top || 0)) * _0x3e2653;
  const _0x1919a2 = Number(_0x2ec79d.width) * _0x20a0d0;
  const _0x43ddc1 = Number(_0x2ec79d.height) * _0x3e2653;
  return {
    left: _0xaf11d2,
    top: _0x519486,
    right: _0xaf11d2 + _0x1919a2,
    bottom: _0x519486 + _0x43ddc1,
    width: _0x1919a2,
    height: _0x43ddc1
  };
}
function isInitialRevealEntryInViewport(_0x5b7364, {
  viewportWidth: _0xcf54ef,
  viewportHeight: _0x3db295
} = {}) {
  const _0x19a8a4 = _0x5b7364?.rect;
  if (!_0x19a8a4) {
    return false;
  }
  return (_0xcf54ef <= 0 || _0x19a8a4.right > 0 && _0x19a8a4.left < _0xcf54ef) && (_0x3db295 <= 0 || _0x19a8a4.bottom > 0 && _0x19a8a4.top < _0x3db295);
}
export function collectInitialImageRevealEntries(_0x12be3f, {
  windowObject = globalThis.window
} = {}) {
  const _0x1151fb = Number(windowObject?.innerWidth || 0);
  const _0x411125 = Number(windowObject?.innerHeight || 0);
  const _0x4c05e4 = [];
  const _0x577012 = Array.from(_0x12be3f?.querySelectorAll?.(".v2-node.image-node, .v2-fast-preview-node--image") || []);
  for (const _0xf6aaf5 of _0x577012) {
    const _0x9c0383 = getInitialRevealImages(_0xf6aaf5)[0];
    const _0x348aa5 = getInitialRevealImageSource(_0x9c0383);
    const _0x3f86a4 = getInitialRevealImageRect(_0x9c0383);
    if (!_0x348aa5 || !_0x3f86a4) {
      continue;
    }
    _0x4c05e4.push({
      image: _0x9c0383,
      nodeId: String(_0xf6aaf5?.id || _0xf6aaf5?.dataset?.nodeId || ""),
      ready: isInitialRevealImageReady(_0x9c0383),
      rect: _0x3f86a4,
      source: _0x348aa5
    });
  }
  const _0x220f78 = Array.from(_0x12be3f?.querySelectorAll?.(".v2-raster-preview-canvas") || []);
  for (const _0x2da9bb of _0x220f78) {
    const _0x18cf9c = _0x2da9bb?.__aicanvasRasterPreviewStats?.worldBounds;
    for (const _0x5abb7a of _0x2da9bb?.__aicanvasRasterPreviewRevealItems || []) {
      const _0xd960d6 = String(_0x5abb7a?.source || "").trim();
      const _0x3026bf = getInitialRasterRevealRect(_0x2da9bb, _0x5abb7a, _0x18cf9c);
      if (!_0xd960d6 || !_0x3026bf) {
        continue;
      }
      _0x4c05e4.push({
        image: null,
        nodeId: String(_0x5abb7a?.nodeId || ""),
        objectFit: "cover",
        objectPosition: "50% 50%",
        ready: _0x5abb7a?.ready === true,
        rect: _0x3026bf,
        source: _0xd960d6
      });
    }
  }
  const _0x22fbaa = new Set();
  return _0x4c05e4.filter(_0x381ee6 => {
    if (!isInitialRevealEntryInViewport(_0x381ee6, {
      viewportWidth: _0x1151fb,
      viewportHeight: _0x411125
    })) {
      return false;
    }
    if (!_0x381ee6.nodeId) {
      return true;
    }
    if (_0x22fbaa.has(_0x381ee6.nodeId)) {
      return false;
    }
    _0x22fbaa.add(_0x381ee6.nodeId);
    return true;
  });
}
export function shouldUseInitialImageFirstReveal({
  nodes: _0x551801,
  targetCount: _0x20c31f,
  reducedMotion = false
} = {}) {
  return reducedMotion !== true && hasInitialCanvasImageNodes(_0x551801) && Number(_0x20c31f || 0) > 0;
}
export function resolveInitialImageRevealDurationMs(_0x10345a) {
  const _0x3379aa = Math.min(INITIAL_IMAGE_REVEAL_MAX_STAGGER_INDEX, Math.max(0, Math.floor(Number(_0x10345a || 0)) - 1));
  return INITIAL_IMAGE_REVEAL_BASE_MS + _0x3379aa * INITIAL_IMAGE_REVEAL_STAGGER_MS;
}
export function resolveInitialImageRevealVector(_0x3ddc2a) {
  const _0x6c5219 = [{
    x: "-42vw",
    y: "0px",
    rotation: "-7deg"
  }, {
    x: "0px",
    y: "-38vh",
    rotation: "5deg"
  }, {
    x: "42vw",
    y: "0px",
    rotation: "7deg"
  }, {
    x: "0px",
    y: "38vh",
    rotation: "-5deg"
  }];
  const _0x4ea96a = Math.max(0, Math.floor(Number(_0x3ddc2a) || 0));
  return _0x6c5219[_0x4ea96a % _0x6c5219.length];
}
export function shouldFinishInitialImageReadinessWait({
  totalCount: _0x1d6e50,
  readyCount: _0x244c54,
  stablePollCount: _0x542674,
  attempt: _0x8dfb6e
} = {}) {
  const _0x757fc0 = Math.max(0, Math.floor(Number(_0x1d6e50) || 0));
  const _0x3febc7 = Math.max(0, Math.floor(Number(_0x244c54) || 0));
  if (_0x757fc0 <= 0) {
    return Number(_0x8dfb6e || 0) >= 2;
  }
  if (_0x3febc7 >= _0x757fc0) {
    return true;
  }
  return Number(_0x8dfb6e || 0) >= INITIAL_IMAGE_READY_MIN_ATTEMPTS && _0x3febc7 / _0x757fc0 >= INITIAL_IMAGE_READY_MIN_RATIO && Number(_0x542674 || 0) >= INITIAL_IMAGE_READY_STABLE_POLLS;
}
export function selectInitialImageRevealEntries(_0x5e8556, {
  maxItems = INITIAL_IMAGE_REVEAL_MAX_ITEMS
} = {}) {
  const _0x2f2c15 = Array.isArray(_0x5e8556) ? _0x5e8556 : [];
  const _0x791f94 = Math.max(0, Math.floor(Number(maxItems) || 0));
  if (_0x791f94 <= 0 || _0x2f2c15.length === 0) {
    return [];
  }
  if (_0x2f2c15.length <= _0x791f94) {
    return [..._0x2f2c15];
  }
  if (_0x791f94 === 1) {
    return [_0x2f2c15[Math.floor((_0x2f2c15.length - 1) / 2)]];
  }
  return Array.from({
    length: _0x791f94
  }, (_0x3c525e, _0x18a526) => {
    const _0x5a2024 = Math.round(_0x18a526 * (_0x2f2c15.length - 1) / (_0x791f94 - 1));
    return _0x2f2c15[_0x5a2024];
  });
}
function getInitialRevealImageRect(_0x40ddf3) {
  const _0x37790a = _0x40ddf3?.getBoundingClientRect?.();
  if (!_0x37790a || !Number.isFinite(_0x37790a.left) || !Number.isFinite(_0x37790a.top) || !Number.isFinite(_0x37790a.width) || !Number.isFinite(_0x37790a.height) || _0x37790a.width <= 1 || _0x37790a.height <= 1) {
    return null;
  }
  return {
    left: _0x37790a.left,
    top: _0x37790a.top,
    right: Number.isFinite(_0x37790a.right) ? _0x37790a.right : _0x37790a.left + _0x37790a.width,
    bottom: Number.isFinite(_0x37790a.bottom) ? _0x37790a.bottom : _0x37790a.top + _0x37790a.height,
    width: _0x37790a.width,
    height: _0x37790a.height
  };
}
function scaleInitialRevealPixelLengths(_0xa0f455, _0x4ce2d0) {
  const _0x2251ba = Number.isFinite(Number(_0x4ce2d0)) && Number(_0x4ce2d0) > 0 ? Number(_0x4ce2d0) : 1;
  return String(_0xa0f455 || "").replace(/(-?(?:\d+(?:\.\d+)?|\.\d+))px\b/gi, (_0xc9cfcf, _0x4f8fc4) => {
    const _0x531fa0 = Math.round(Number(_0x4f8fc4) * _0x2251ba * 1000) / 1000;
    return (Object.is(_0x531fa0, -0) ? 0 : _0x531fa0) + "px";
  });
}
function resolveInitialRevealScale(_0x5fabc3, _0x1ac741) {
  const _0xa21db1 = Number(_0x5fabc3?.offsetWidth);
  const _0x48ef87 = Number(_0x5fabc3?.offsetHeight);
  const _0x1205af = Number.isFinite(_0xa21db1) && _0xa21db1 > 0 ? _0x1ac741.width / _0xa21db1 : 1;
  const _0x5042e8 = Number.isFinite(_0x48ef87) && _0x48ef87 > 0 ? _0x1ac741.height / _0x48ef87 : _0x1205af;
  return {
    scaleX: _0x1205af,
    scaleY: _0x5042e8
  };
}
function resolveInitialRevealBorderRadius(_0x371ef9, _0x246387, _0x16357f) {
  const _0x1300d7 = String(_0x16357f || "").trim() || "0";
  const {
    scaleX: _0x5ecd1d,
    scaleY: _0x4b58cb
  } = resolveInitialRevealScale(_0x371ef9, _0x246387);
  const [_0x5394a8, _0x52f7d5] = _0x1300d7.split(/\s*\/\s*/, 2);
  if (_0x52f7d5) {
    return scaleInitialRevealPixelLengths(_0x5394a8, _0x5ecd1d) + " / " + scaleInitialRevealPixelLengths(_0x52f7d5, _0x4b58cb);
  }
  if (Math.abs(_0x5ecd1d - _0x4b58cb) < 0.001) {
    return scaleInitialRevealPixelLengths(_0x1300d7, _0x5ecd1d);
  }
  return scaleInitialRevealPixelLengths(_0x1300d7, _0x5ecd1d) + " / " + scaleInitialRevealPixelLengths(_0x1300d7, _0x4b58cb);
}
function resolveInitialRevealClipPath(_0x44a987, _0x6756ed, _0x3a84e5) {
  const _0x1c473f = String(_0x3a84e5 || "").trim() || "none";
  if (_0x1c473f === "none") {
    return _0x1c473f;
  }
  const {
    scaleX: _0x2fe53d,
    scaleY: _0xa9a806
  } = resolveInitialRevealScale(_0x44a987, _0x6756ed);
  return scaleInitialRevealPixelLengths(_0x1c473f, Math.min(_0x2fe53d, _0xa9a806));
}
function isInitialRevealImageInViewport(_0x4b0bf5, {
  viewportWidth: _0xe21f76,
  viewportHeight: _0x57baad
} = {}) {
  const _0xcb49e6 = getInitialRevealImageRect(_0x4b0bf5);
  if (!_0xcb49e6) {
    return false;
  }
  return (_0xe21f76 <= 0 || _0xcb49e6.right > 0 && _0xcb49e6.left < _0xe21f76) && (_0x57baad <= 0 || _0xcb49e6.bottom > 0 && _0xcb49e6.top < _0x57baad);
}
export function createInitialImageRevealLayer({
  loader: _0xe4326b,
  imageTargets: _0x4b1e41,
  documentObject = globalThis.document,
  windowObject = globalThis.window
} = {}) {
  if (!_0xe4326b?.appendChild || !documentObject?.createElement || !Array.isArray(_0x4b1e41)) {
    return null;
  }
  const _0x1ee900 = documentObject.createElement("div");
  _0x1ee900.className = "initial-image-reveal-layer";
  _0x1ee900.setAttribute?.("aria-hidden", "true");
  const _0x38320a = Number(windowObject?.innerWidth || documentObject?.documentElement?.clientWidth || 0);
  const _0x35b918 = Number(windowObject?.innerHeight || documentObject?.documentElement?.clientHeight || 0);
  const _0x10c52b = _0x4b1e41.flatMap(_0x368b6b => {
    const _0x1592e3 = _0x368b6b?.rect && _0x368b6b?.source ? _0x368b6b : null;
    const _0x6ed3a0 = _0x1592e3 ? _0x1592e3.image : getInitialRevealImages(_0x368b6b).find(isInitialRevealImageReady);
    const _0xca4836 = _0x1592e3?.rect || getInitialRevealImageRect(_0x6ed3a0);
    const _0x3580ab = _0x1592e3?.source || getInitialRevealImageSource(_0x6ed3a0);
    if (_0x1592e3?.ready === false || !_0x3580ab || !_0xca4836 || _0x38320a > 0 && (_0xca4836.right <= 0 || _0xca4836.left >= _0x38320a) || _0x35b918 > 0 && (_0xca4836.bottom <= 0 || _0xca4836.top >= _0x35b918)) {
      return [];
    }
    return [{
      ..._0x1592e3,
      image: _0x6ed3a0,
      rect: _0xca4836,
      source: _0x3580ab
    }];
  });
  _0x10c52b.sort((_0x5d642a, _0x5e317a) => {
    const _0x55d435 = _0x5d642a.rect.top + _0x5d642a.rect.height / 2;
    const _0x38048d = _0x5e317a.rect.top + _0x5e317a.rect.height / 2;
    if (_0x55d435 !== _0x38048d) {
      return _0x55d435 - _0x38048d;
    }
    return _0x5d642a.rect.left + _0x5d642a.rect.width / 2 - (_0x5e317a.rect.left + _0x5e317a.rect.width / 2);
  });
  selectInitialImageRevealEntries(_0x10c52b).forEach(({
    image: _0x5cee25,
    rect: _0x1b99a0,
    source: _0xe52211,
    objectFit: _0x6b174a,
    objectPosition: _0x4dd356,
    borderRadius: _0x3ed79a,
    clipPath: _0x396ca4
  }, _0x20204a) => {
    const _0xf1dca4 = documentObject.createElement("img");
    const _0xa6db66 = resolveInitialImageRevealVector(_0x20204a);
    const _0x5a49b5 = _0x5cee25 ? windowObject?.getComputedStyle?.(_0x5cee25) : null;
    _0xf1dca4.className = "initial-image-reveal-item";
    _0xf1dca4.alt = "";
    _0xf1dca4.draggable = false;
    _0xf1dca4.decoding = "sync";
    _0xf1dca4.loading = "eager";
    _0xf1dca4.src = _0xe52211;
    _0xf1dca4.style.left = _0x1b99a0.left + "px";
    _0xf1dca4.style.top = _0x1b99a0.top + "px";
    _0xf1dca4.style.width = _0x1b99a0.width + "px";
    _0xf1dca4.style.height = _0x1b99a0.height + "px";
    _0xf1dca4.style.objectFit = _0x6b174a || _0x5a49b5?.objectFit || "cover";
    _0xf1dca4.style.objectPosition = _0x4dd356 || _0x5a49b5?.objectPosition || "50% 50%";
    _0xf1dca4.style.borderRadius = _0x5cee25 ? resolveInitialRevealBorderRadius(_0x5cee25, _0x1b99a0, _0x3ed79a || _0x5a49b5?.borderRadius) : _0x3ed79a || "0";
    _0xf1dca4.style.clipPath = _0x5cee25 ? resolveInitialRevealClipPath(_0x5cee25, _0x1b99a0, _0x396ca4 || _0x5a49b5?.clipPath) : _0x396ca4 || "none";
    _0xf1dca4.style.setProperty("--initial-image-reveal-index", String(Math.min(_0x20204a, INITIAL_IMAGE_REVEAL_MAX_STAGGER_INDEX)));
    _0xf1dca4.style.setProperty("--initial-image-from-x", _0xa6db66.x);
    _0xf1dca4.style.setProperty("--initial-image-from-y", _0xa6db66.y);
    _0xf1dca4.style.setProperty("--initial-image-from-rotation", _0xa6db66.rotation);
    _0x1ee900.appendChild(_0xf1dca4);
  });
  if (!_0x1ee900.childElementCount) {
    _0x1ee900.remove?.();
    return null;
  }
  _0xe4326b.appendChild(_0x1ee900);
  return _0x1ee900;
}
function getUntitledProjectName() {
  return t("projectLifecycle.untitledProject");
}
function getUntitledCanvasName() {
  return t("projectLifecycle.untitledCanvas");
}
function getDefaultCanvasName() {
  return t("projectLifecycle.defaultCanvas");
}
function buildWorkspaceCanvasKey(_0x58a8e6) {
  return "" + WORKSPACE_CANVAS_KEY_PREFIX + String(_0x58a8e6 || "").trim();
}
function normalizeProjectWorkspaceId(_0x44d2f8) {
  return stripCanvasProjectFileExtension(String(_0x44d2f8 || "").trim()).toLowerCase();
}
function buildProjectWorkspaceMetaKey(_0xeb1e95) {
  return "" + PROJECT_WORKSPACE_META_KEY_PREFIX + encodeURIComponent(normalizeProjectWorkspaceId(_0xeb1e95));
}
function buildProjectWorkspaceCanvasKey(_0x3ed449, _0x16241d) {
  return "" + PROJECT_WORKSPACE_CANVAS_KEY_PREFIX + encodeURIComponent(normalizeProjectWorkspaceId(_0x3ed449)) + "::" + encodeURIComponent(String(_0x16241d || "").trim());
}
function inferAsyncProviderByModel(_0x2020e6, _0x3b863c = "") {
  const _0x55ca9c = resolveModelProvider(_0x2020e6, "", {
    allowProviderHint: false
  });
  if (_0x55ca9c) {
    return _0x55ca9c;
  }
  const _0x5296fc = String(_0x3b863c || "").trim().toLowerCase();
  if (_0x5296fc) {
    return _0x5296fc;
  }
  const _0x34ef04 = String(_0x2020e6 || "").trim();
  if (_0x34ef04 && !_0x34ef04.includes("/")) {
    return "grsai";
  }
  return "grsai";
}
function getGenerationKindForNode(_0x2e4a5b) {
  const _0x4cac36 = String(_0x2e4a5b?.type || "").trim().toLowerCase();
  if (_0x4cac36.includes("video")) {
    return "video";
  }
  if (_0x4cac36.includes("audio")) {
    return "audio";
  }
  if (_0x4cac36.includes("image")) {
    return "image";
  }
  return "generation";
}
function resolveProjectLifecycleTaskIdentity(_0xb06e24, _0x1742ed) {
  const _0x87044 = String(_0x1742ed || "").trim();
  const _0x49c38f = _0x87044 === "asyncModelApi" ? inferAsyncProviderByModel(_0xb06e24?.model, _0xb06e24?.asyncTaskProvider || _0xb06e24?.provider || "") : "";
  return resolveGenerationTaskIdentity({
    kind: getGenerationKindForNode(_0xb06e24),
    node: _0xb06e24,
    taskProtocol: _0x87044,
    provider: _0x49c38f
  });
}
function isDreaminaResumeCandidateNode(_0xae1a04) {
  if (!_0xae1a04 || typeof _0xae1a04 !== "object") {
    return false;
  }
  const _0x261912 = String(_0xae1a04.type || "").trim().toLowerCase();
  if (!["ai-video", "ai-image", "source-image", "source-video"].includes(_0x261912)) {
    return false;
  }
  const _0x4c8dea = String(_0xae1a04.provider || "").trim().toLowerCase();
  const _0x1e3881 = String(_0xae1a04.model || "").trim();
  const _0x12d45d = _0x4c8dea === "dreamina" || resolveModelProvider(_0x1e3881, _0x4c8dea) === "dreamina";
  if (!_0x12d45d) {
    return false;
  }
  if (hasDreaminaResultError(_0xae1a04)) {
    return false;
  }
  const _0x494819 = String(_0xae1a04.jobStatus || "").trim().toLowerCase();
  if (_0x494819 === "error" || _0x494819 === "failed") {
    return false;
  }
  if (String(_0xae1a04.jobError || "").trim()) {
    return false;
  }
  const _0x308bb1 = resolveProjectLifecycleTaskIdentity(_0xae1a04, "dreamina");
  if (!_0x308bb1.taskId) {
    return false;
  }
  const _0x2ca355 = String(_0xae1a04.dreaminaTaskPhase || "").trim().toLowerCase();
  const _0x5f0f49 = String(_0xae1a04.dreaminaTaskStatus || "").trim().toLowerCase();
  if (_0x2ca355 === "done" || _0x2ca355 === "failed") {
    return false;
  }
  if (_0x5f0f49 === "failed") {
    return false;
  }
  return true;
}
function hasDreaminaUsableResult(_0x101abb) {
  const _0x241d75 = [_0x101abb?.images, _0x101abb?.videos].filter(Array.isArray);
  return _0x241d75.some(_0x26b290 => _0x26b290.some(_0x4fdee9 => {
    if (!_0x4fdee9 || typeof _0x4fdee9 !== "object") {
      return false;
    }
    return !!String(_0x4fdee9.localPath || _0x4fdee9.originalLocalPath || _0x4fdee9.displayLocalPath || _0x4fdee9.thumbLocalPath || _0x4fdee9.imageUrl || _0x4fdee9.videoUrl || _0x4fdee9.thumbUrl || _0x4fdee9.sourceUrl || "").trim();
  }));
}
function hasDreaminaResultError(_0xeb1a93) {
  const _0x668de2 = [_0xeb1a93?.images, _0xeb1a93?.videos].filter(Array.isArray);
  if (_0x668de2.length === 0) {
    return false;
  }
  if (hasDreaminaUsableResult(_0xeb1a93)) {
    return false;
  }
  return _0x668de2.some(_0x2c344e => _0x2c344e.some(_0x32ae97 => _0x32ae97 && typeof _0x32ae97 === "object" && String(_0x32ae97.error || _0x32ae97.message || "").trim()));
}
function isAsyncResumeCandidateNode(_0x39c293) {
  if (!_0x39c293 || typeof _0x39c293 !== "object") {
    return false;
  }
  const _0x444fbf = String(_0x39c293.type || "").trim().toLowerCase();
  if (!["ai-video", "ai-image", "source-video", "source-image"].includes(_0x444fbf)) {
    return false;
  }
  const _0xd4c056 = resolveProjectLifecycleTaskIdentity(_0x39c293, "asyncModelApi");
  if (!_0xd4c056.taskId) {
    return false;
  }
  const _0x214ff3 = _0xd4c056.provider;
  if (!_0x214ff3 || _0x214ff3 === "runninghubwf" || _0x214ff3 === "runninghub" || _0x214ff3 === "dreamina") {
    return false;
  }
  const _0x24c1c2 = String(_0x39c293.asyncTaskKind || "").trim().toLowerCase();
  if (_0x24c1c2 === "image" && !["ai-image", "source-image"].includes(_0x444fbf)) {
    return false;
  }
  if (_0x24c1c2 === "video" && !["ai-video", "source-video"].includes(_0x444fbf)) {
    return false;
  }
  const _0x33a360 = String(_0x39c293.asyncTaskStatus || "").trim().toLowerCase();
  if (_0x33a360 === "success" || _0x33a360 === "failed" || _0x33a360 === "idle" || _0x33a360 === "cancelled") {
    return false;
  }
  return true;
}
function isRunningHubResumeCandidateNode(_0x7bea7c) {
  if (!_0x7bea7c || typeof _0x7bea7c !== "object") {
    return false;
  }
  const _0x19d8cd = String(_0x7bea7c.type || "").trim().toLowerCase();
  if (!["ai-video", "ai-image", "ai-audio", "source-video", "source-image", "source-audio"].includes(_0x19d8cd)) {
    return false;
  }
  const _0x4388ca = String(_0x7bea7c.provider || "").trim().toLowerCase();
  const _0x4d44d0 = String(_0x7bea7c.model || "").trim();
  const _0x5bd0fe = resolveModelProvider(_0x4d44d0, _0x4388ca, {
    allowProviderHint: false
  });
  const _0x4249c7 = a876_0x4beafd(_0x4d44d0, _0x4388ca || "runninghubwf");
  const _0x35e2a3 = _0x5bd0fe === "runninghub" && isModelApiModel(_0x4d44d0, "runninghub");
  const _0x1b946f = _0x19d8cd === "ai-audio" && _0x4388ca === "runninghubwf";
  const _0x55b9bc = _0x19d8cd === "source-video" && (_0x4388ca === "runninghubwf" || _0x4249c7);
  const _0x43631f = _0x19d8cd === "source-image" && (_0x4388ca === "runninghubwf" || _0x4388ca === "runninghub" || _0x4249c7 || _0x35e2a3);
  const _0x43a257 = _0x19d8cd === "source-audio" && _0x4388ca === "runninghubwf" && _0x4249c7;
  const _0x19b49d = _0x43631f || _0x43a257 || _0x55b9bc || _0x1b946f || _0x4249c7 || _0x35e2a3 || _0x4388ca === "runninghub" || _0x4388ca === "runninghubwf";
  if (!_0x19b49d) {
    return false;
  }
  const _0x34479f = resolveProjectLifecycleTaskIdentity(_0x7bea7c, "workflow");
  if (!_0x34479f.taskId) {
    return false;
  }
  const _0x1f7da9 = String(_0x7bea7c.rhTaskStatus || "").trim().toLowerCase();
  if (_0x1f7da9 === "success" || _0x1f7da9 === "failed" || _0x1f7da9 === "idle" || _0x1f7da9 === "cancelled") {
    return false;
  }
  return true;
}
function buildDreaminaResumeBackupPayload({
  projectId: _0x3d6ae8,
  projectName: _0x2314e5,
  multiData: _0x1a4d26
}) {
  const _0x2fbb35 = Array.isArray(_0x1a4d26?.canvases) ? _0x1a4d26.canvases : [];
  const _0x24c224 = [];
  _0x2fbb35.forEach(_0x428f6e => {
    const _0x1cb1cf = String(_0x428f6e?.id || "").trim();
    if (!_0x1cb1cf) {
      return;
    }
    const _0x5bfb72 = Array.isArray(_0x428f6e?.nodes) ? _0x428f6e.nodes : [];
    _0x5bfb72.forEach(_0x76c39c => {
      const _0x1f5f89 = {
        canvasId: _0x1cb1cf,
        nodeId: String(_0x76c39c.id || "").trim(),
        generationStartTime: Number(_0x76c39c.generationStartTime || 0),
        generationDuration: _0x76c39c.generationDuration == null ? null : Number(_0x76c39c.generationDuration || 0)
      };
      if (isDreaminaResumeCandidateNode(_0x76c39c)) {
        const _0x25e855 = resolveProjectLifecycleTaskIdentity(_0x76c39c, "dreamina");
        const _0x4879b9 = {
          ..._0x1f5f89,
          kind: "dreamina",
          dreaminaSubmitId: _0x25e855.taskId,
          dreaminaTaskStatus: String(_0x76c39c.dreaminaTaskStatus || "").trim(),
          dreaminaTaskPhase: String(_0x76c39c.dreaminaTaskPhase || "").trim(),
          dreaminaTaskLabel: String(_0x76c39c.dreaminaTaskLabel || "").trim(),
          dreaminaTaskStartedAt: _0x25e855.startedAt,
          dreaminaTaskLastCheckedAt: Number(_0x76c39c.dreaminaTaskLastCheckedAt || 0),
          dreaminaTaskRecovering: !!_0x76c39c.dreaminaTaskRecovering
        };
        _0x24c224.push(_0x4879b9);
        return;
      }
      if (isAsyncResumeCandidateNode(_0x76c39c)) {
        const _0x3824d3 = resolveProjectLifecycleTaskIdentity(_0x76c39c, "asyncModelApi");
        _0x24c224.push({
          ..._0x1f5f89,
          kind: "async",
          nodeType: String(_0x76c39c.type || "").trim().toLowerCase(),
          asyncTaskProvider: _0x3824d3.provider,
          asyncTaskKind: String(_0x76c39c.asyncTaskKind || "").trim() || "image",
          asyncTaskId: _0x3824d3.taskId,
          asyncTaskStatus: String(_0x76c39c.asyncTaskStatus || "").trim(),
          asyncTaskStartedAt: _0x3824d3.startedAt,
          asyncTaskRecovering: !!_0x76c39c.asyncTaskRecovering
        });
        return;
      }
      if (!isRunningHubResumeCandidateNode(_0x76c39c)) {
        return;
      }
      const _0xe8e311 = resolveProjectLifecycleTaskIdentity(_0x76c39c, "workflow");
      _0x24c224.push({
        ..._0x1f5f89,
        kind: "runninghub",
        nodeType: String(_0x76c39c.type || "").trim().toLowerCase(),
        rhTaskId: _0xe8e311.taskId,
        rhTaskStatus: String(_0x76c39c.rhTaskStatus || "").trim(),
        rhTaskStartedAt: _0xe8e311.startedAt,
        rhTaskRecovering: !!_0x76c39c.rhTaskRecovering,
        rhTaskUseOpenapiQuery: _0x76c39c.rhTaskUseOpenapiQuery === true
      });
    });
  });
  return {
    projectId: _0x3d6ae8 || "default_v2_project",
    projectName: _0x2314e5 || getUntitledProjectName(),
    timestamp: Date.now(),
    items: _0x24c224
  };
}
function writeDreaminaResumeBackupSync(_0x111465) {
  try {
    const _0x11002a = buildDreaminaResumeBackupPayload(_0x111465);
    if (!Array.isArray(_0x11002a.items) || _0x11002a.items.length === 0) {
      window.localStorage?.removeItem(DREAMINA_RESUME_BACKUP_KEY);
      return;
    }
    window.localStorage?.setItem(DREAMINA_RESUME_BACKUP_KEY, JSON.stringify(_0x11002a));
  } catch (_0x3e0f7e) {
    console.warn("[projectLifecycle] 写入即梦恢复兜底失败:", _0x3e0f7e);
  }
}
function readDreaminaResumeBackupSync() {
  try {
    const _0x3b80c3 = window.localStorage?.getItem(DREAMINA_RESUME_BACKUP_KEY);
    if (!_0x3b80c3) {
      return null;
    }
    const _0x420c31 = JSON.parse(_0x3b80c3);
    if (!_0x420c31 || typeof _0x420c31 !== "object") {
      return null;
    }
    if (!Array.isArray(_0x420c31.items) || _0x420c31.items.length === 0) {
      return null;
    }
    return _0x420c31;
  } catch (_0x548dd2) {
    console.warn("[projectLifecycle] 读取即梦恢复兜底失败:", _0x548dd2);
    return null;
  }
}
function mergeDreaminaResumeBackupIntoMultiData(_0x33ae46, _0x256e89, _0x18de38) {
  if (!_0x256e89 || typeof _0x256e89 !== "object") {
    return _0x33ae46;
  }
  if (String(_0x256e89.projectId || "") !== String(_0x18de38 || "")) {
    return _0x33ae46;
  }
  const _0x14ebf8 = Array.isArray(_0x256e89.items) ? _0x256e89.items : [];
  if (_0x14ebf8.length === 0) {
    return _0x33ae46;
  }
  const _0xcf1ee = {
    ...(_0x33ae46 || {}),
    canvases: Array.isArray(_0x33ae46?.canvases) ? _0x33ae46.canvases.map(_0x57c60b => ({
      ..._0x57c60b,
      nodes: Array.isArray(_0x57c60b?.nodes) ? _0x57c60b.nodes.map(_0x4d6579 => ({
        ..._0x4d6579
      })) : []
    })) : []
  };
  const _0x366110 = new Map();
  _0x14ebf8.forEach(_0xb27c99 => {
    const _0x3bbd0e = String(_0xb27c99?.canvasId || "").trim();
    const _0x139379 = String(_0xb27c99?.nodeId || "").trim();
    if (!_0x3bbd0e || !_0x139379) {
      return;
    }
    _0x366110.set(_0x3bbd0e + "::" + _0x139379, _0xb27c99);
  });
  _0xcf1ee.canvases.forEach(_0x462f49 => {
    const _0x56aaea = String(_0x462f49?.id || "").trim();
    if (!_0x56aaea || !Array.isArray(_0x462f49.nodes)) {
      return;
    }
    _0x462f49.nodes = _0x462f49.nodes.map(_0x44e2bd => {
      const _0x4fb903 = String(_0x44e2bd?.id || "").trim();
      const _0x72fb9b = _0x366110.get(_0x56aaea + "::" + _0x4fb903);
      if (!_0x72fb9b) {
        return _0x44e2bd;
      }
      if (String(_0x72fb9b?.kind || "").trim().toLowerCase() === "dreamina") {
        if (hasDreaminaResultError(_0x44e2bd)) {
          return _0x44e2bd;
        }
        const _0x436f90 = String(_0x44e2bd?.jobStatus || "").trim().toLowerCase();
        if (_0x436f90 === "error" || _0x436f90 === "failed") {
          return _0x44e2bd;
        }
        const _0x63cc20 = {};
        for (const _0x5acd88 of DREAMINA_RESUME_BACKUP_FIELDS) {
          if (Object.hasOwn(_0x72fb9b, _0x5acd88)) {
            _0x63cc20[_0x5acd88] = _0x72fb9b[_0x5acd88];
          }
        }
        const _0x44e834 = Object.hasOwn(_0x72fb9b, "dreaminaTaskLastRaw") && _0x72fb9b.dreaminaTaskLastRaw && typeof _0x72fb9b.dreaminaTaskLastRaw === "object" && !Array.isArray(_0x72fb9b.dreaminaTaskLastRaw) ? _0x72fb9b.dreaminaTaskLastRaw : null;
        return {
          ..._0x44e2bd,
          generationStartTime: Number(_0x63cc20.generationStartTime) > 0 ? Number(_0x63cc20.generationStartTime) : Number(_0x44e2bd?.generationStartTime || 0),
          generationDuration: null,
          dreaminaSubmitId: String(_0x63cc20.dreaminaSubmitId || "").trim(),
          dreaminaTaskStatus: String(_0x63cc20.dreaminaTaskStatus || "").trim(),
          dreaminaTaskPhase: String(_0x63cc20.dreaminaTaskPhase || "").trim(),
          dreaminaTaskLabel: String(_0x63cc20.dreaminaTaskLabel || "").trim(),
          dreaminaTaskStartedAt: Number(_0x63cc20.dreaminaTaskStartedAt || 0),
          dreaminaTaskLastCheckedAt: Number(_0x63cc20.dreaminaTaskLastCheckedAt || 0),
          dreaminaTaskRecovering: true,
          dreaminaTaskLastRaw: _0x44e834 || {}
        };
      }
      if (String(_0x72fb9b?.kind || "").trim().toLowerCase() !== "runninghub") {
        if (String(_0x72fb9b?.kind || "").trim().toLowerCase() !== "async") {
          return _0x44e2bd;
        }
        const _0x3aac57 = String(_0x72fb9b?.nodeType || "").trim().toLowerCase();
        const _0x2b3889 = String(_0x44e2bd?.type || "").trim().toLowerCase();
        if (_0x3aac57 && _0x2b3889 && _0x3aac57 !== _0x2b3889) {
          return _0x44e2bd;
        }
        const _0x1e7cbc = inferAsyncProviderByModel(_0x44e2bd?.model, _0x72fb9b.asyncTaskProvider || _0x44e2bd?.asyncTaskProvider || _0x44e2bd?.provider || "");
        return {
          ..._0x44e2bd,
          generationStartTime: Number(_0x72fb9b.generationStartTime) > 0 ? Number(_0x72fb9b.generationStartTime) : Number(_0x44e2bd?.generationStartTime || 0),
          generationDuration: null,
          asyncTaskProvider: _0x1e7cbc,
          asyncTaskKind: String(_0x72fb9b.asyncTaskKind || "").trim() || "image",
          asyncTaskId: String(_0x72fb9b.asyncTaskId || "").trim(),
          asyncTaskStatus: String(_0x72fb9b.asyncTaskStatus || "").trim() || "pending",
          asyncTaskStartedAt: Number(_0x72fb9b.asyncTaskStartedAt || 0),
          asyncTaskRecovering: true
        };
      }
      const _0x557cb8 = String(_0x72fb9b?.nodeType || "").trim().toLowerCase();
      const _0x2ee35b = String(_0x44e2bd?.type || "").trim().toLowerCase();
      if (_0x557cb8 && _0x2ee35b && _0x557cb8 !== _0x2ee35b) {
        return _0x44e2bd;
      }
      return {
        ..._0x44e2bd,
        generationStartTime: Number(_0x72fb9b.generationStartTime) > 0 ? Number(_0x72fb9b.generationStartTime) : Number(_0x44e2bd?.generationStartTime || 0),
        generationDuration: null,
        rhTaskId: String(_0x72fb9b.rhTaskId || "").trim(),
        rhTaskStatus: String(_0x72fb9b.rhTaskStatus || "").trim() || "pending",
        rhTaskStartedAt: Number(_0x72fb9b.rhTaskStartedAt || 0),
        rhTaskRecovering: true,
        rhTaskUseOpenapiQuery: _0x72fb9b.rhTaskUseOpenapiQuery === true
      };
    });
  });
  return _0xcf1ee;
}
function buildCanvasRecordSignature(_0x465322, _0x210504 = _0x465322?._persistRevHint) {
  const _0x23568b = _0x465322?.visualSnapshot && typeof _0x465322.visualSnapshot === "object" ? {
    schemaVersion: Number(_0x465322.visualSnapshot.schemaVersion) || 1,
    srcLength: String(_0x465322.visualSnapshot.src || "").length,
    width: Number(_0x465322.visualSnapshot.width) || 0,
    height: Number(_0x465322.visualSnapshot.height) || 0,
    capturedAt: Number(_0x465322.visualSnapshot.capturedAt) || 0,
    visibleNodeCount: Number(_0x465322.visualSnapshot.visibleNodeCount) || 0,
    mediaNodeCount: Number(_0x465322.visualSnapshot.mediaNodeCount) || 0,
    readyMediaNodeCount: Number(_0x465322.visualSnapshot.readyMediaNodeCount) || 0
  } : null;
  const _0x2f2c6e = Number.isFinite(_0x210504);
  if (_0x2f2c6e) {
    const _0x44b8a2 = _0x465322?.viewport && typeof _0x465322.viewport === "object" ? _0x465322.viewport : {};
    return createStableSignature({
      _persistRevHint: _0x210504,
      viewport: {
        x: Number.isFinite(_0x44b8a2?.x) ? _0x44b8a2.x : 0,
        y: Number.isFinite(_0x44b8a2?.y) ? _0x44b8a2.y : 0,
        zoom: Number.isFinite(_0x44b8a2?.zoom) ? _0x44b8a2.zoom : 1.1
      },
      nodesLength: Array.isArray(_0x465322?.nodes) ? _0x465322.nodes.length : 0,
      edgesLength: Array.isArray(_0x465322?.edges) ? _0x465322.edges.length : 0,
      assetsLength: Array.isArray(_0x465322?.assets) ? _0x465322.assets.length : 0,
      visualSnapshot: _0x23568b
    });
  }
  return createStableSignature({
    id: _0x465322?.id ?? null,
    name: _0x465322?.name ?? getUntitledCanvasName(),
    nodes: Array.isArray(_0x465322?.nodes) ? _0x465322.nodes : [],
    edges: Array.isArray(_0x465322?.edges) ? _0x465322.edges : [],
    viewport: _0x465322?.viewport && typeof _0x465322.viewport === "object" ? _0x465322.viewport : {
      x: 0,
      y: 0,
      zoom: 1.1
    },
    assets: Array.isArray(_0x465322?.assets) ? _0x465322.assets : [],
    visualSnapshot: _0x23568b
  });
}
export function buildWorkspaceShardRecords(_0x3fd888) {
  const _0x2b6276 = _0x3fd888?.projectId || "default_v2_project";
  const _0x3c7a47 = _0x3fd888?.projectName || getUntitledProjectName();
  const _0x5ee775 = Array.isArray(_0x3fd888?.multiData?.canvases) ? _0x3fd888.multiData.canvases : [];
  const _0x5d8f0f = _0x3fd888?.multiData?.activeCanvasId || _0x5ee775[0]?.id || null;
  const _0x1d7d9e = Array.isArray(_0x3fd888?.multiData?.projectContexts) ? _0x3fd888.multiData.projectContexts.filter(_0x357168 => _0x357168?.canvasId).map(_0x1a5a2a => ({
    ..._0x1a5a2a
  })) : [];
  const _0xaed8ea = Number(_0x3fd888?.workspaceScopeVersion) === 1 ? 1 : 0;
  const _0x1fb2c6 = Date.now();
  const _0x388c4f = {
    cacheVersion: 2,
    projectId: _0x2b6276,
    projectName: _0x3c7a47,
    workspaceScopeVersion: _0xaed8ea,
    activeCanvasId: _0x5d8f0f,
    projectContexts: _0x1d7d9e,
    canvasOrder: _0x5ee775.map(_0x5e5cc0 => ({
      id: _0x5e5cc0?.id ?? null,
      name: _0x5e5cc0?.name ?? getUntitledCanvasName()
    })),
    _timestamp: _0x1fb2c6
  };
  const _0x197114 = _0x5ee775.map(_0x13c636 => {
    const _0x8295b4 = {
      id: _0x13c636?.id ?? null,
      name: _0x13c636?.name ?? getUntitledCanvasName(),
      _persistRevHint: Number.isFinite(_0x13c636?._persistRevHint) ? _0x13c636._persistRevHint : undefined,
      nodes: Array.isArray(_0x13c636?.nodes) ? _0x13c636.nodes : [],
      edges: Array.isArray(_0x13c636?.edges) ? _0x13c636.edges : [],
      viewport: _0x13c636?.viewport && typeof _0x13c636.viewport === "object" ? _0x13c636.viewport : {
        x: 0,
        y: 0,
        zoom: 1.1
      },
      assets: Array.isArray(_0x13c636?.assets) ? _0x13c636.assets : [],
      storyboard3dProjects: Array.isArray(_0x13c636?.storyboard3dProjects) ? _0x13c636.storyboard3dProjects : [],
      visualSnapshot: _0x13c636?.visualSnapshot && typeof _0x13c636.visualSnapshot === "object" ? _0x13c636.visualSnapshot : undefined,
      _timestamp: _0x1fb2c6
    };
    const _0x52ee5d = sanitizeSerializedCanvasData(_0x8295b4);
    const _0x2049ea = Number.isFinite(_0x8295b4._persistRevHint) ? _0x8295b4._persistRevHint : undefined;
    return {
      key: buildWorkspaceCanvasKey(_0x8295b4.id),
      record: _0x8295b4,
      persistedRecord: _0x52ee5d,
      signature: buildCanvasRecordSignature(_0x52ee5d, _0x2049ea)
    };
  });
  return {
    metaRecord: _0x388c4f,
    metaSignature: createStableSignature({
      cacheVersion: _0x388c4f.cacheVersion,
      projectId: _0x388c4f.projectId,
      projectName: _0x388c4f.projectName,
      workspaceScopeVersion: _0x388c4f.workspaceScopeVersion,
      activeCanvasId: _0x388c4f.activeCanvasId,
      projectContexts: _0x388c4f.projectContexts,
      canvasOrder: _0x388c4f.canvasOrder
    }),
    canvasRecords: _0x197114
  };
}
export function restoreWorkspacePayloadFromShardRecords(_0x38f350, _0x411871) {
  if (!_0x38f350 || !Array.isArray(_0x38f350.canvasOrder)) {
    return null;
  }
  const _0x5554cf = new Map();
  for (const _0x1d8eb5 of _0x411871 || []) {
    if (!_0x1d8eb5 || !_0x1d8eb5.id) {
      continue;
    }
    _0x5554cf.set(_0x1d8eb5.id, {
      id: _0x1d8eb5.id,
      name: _0x1d8eb5.name || getUntitledCanvasName(),
      _persistRevHint: Number.isFinite(_0x1d8eb5?._persistRevHint) ? _0x1d8eb5._persistRevHint : undefined,
      nodes: Array.isArray(_0x1d8eb5.nodes) ? _0x1d8eb5.nodes : [],
      edges: Array.isArray(_0x1d8eb5.edges) ? _0x1d8eb5.edges : [],
      viewport: _0x1d8eb5.viewport && typeof _0x1d8eb5.viewport === "object" ? _0x1d8eb5.viewport : {
        x: 0,
        y: 0,
        zoom: 1.1
      },
      assets: Array.isArray(_0x1d8eb5.assets) ? _0x1d8eb5.assets : [],
      storyboard3dProjects: Array.isArray(_0x1d8eb5.storyboard3dProjects) ? _0x1d8eb5.storyboard3dProjects : [],
      visualSnapshot: _0x1d8eb5.visualSnapshot && typeof _0x1d8eb5.visualSnapshot === "object" ? _0x1d8eb5.visualSnapshot : null
    });
  }
  const _0x23865d = [];
  for (const _0x2c51cb of _0x38f350.canvasOrder) {
    const _0x5bf776 = _0x2c51cb?.id;
    if (!_0x5bf776) {
      return null;
    }
    const _0x3022ad = _0x5554cf.get(_0x5bf776);
    if (!_0x3022ad) {
      return null;
    }
    _0x23865d.push({
      ..._0x3022ad,
      name: _0x2c51cb?.name || _0x3022ad.name || getUntitledCanvasName()
    });
  }
  return {
    projectId: _0x38f350.projectId || "default_v2_project",
    projectName: _0x38f350.projectName || getUntitledProjectName(),
    workspaceScopeVersion: Number(_0x38f350.workspaceScopeVersion) === 1 ? 1 : 0,
    multiData: {
      canvases: _0x23865d,
      activeCanvasId: _0x38f350.activeCanvasId || _0x23865d[0]?.id || null,
      projectContexts: Array.isArray(_0x38f350.projectContexts) ? _0x38f350.projectContexts.map(_0x1347da => ({
        ..._0x1347da
      })) : []
    }
  };
}
export function buildRecoverySnapshotSignature({
  meta: _0x3e81cd,
  multiData: _0x72e68a,
  persistenceRevision = null
}) {
  return createStableSignature({
    ...(_0x3e81cd || {}),
    ...(persistenceRevision && typeof persistenceRevision === "object" ? {
      persistenceRevision: persistenceRevision
    } : {
      multiData: _0x72e68a
    })
  });
}
export function createProjectLifecycle({
  store: _0x55553e,
  CanvasTabManager: _0x3ee653,
  project: _0x22cc15,
  loadCustomPresets: _0x5eaf34,
  migrateLegacyThumbnailsInMultiData: _0x1e45bc,
  sanitizeMultiCanvasDataForPersistence: _0x1db049,
  commit: _0x32b207,
  patchStoreSourceNodeNamesFromFileName: _0x1d0574,
  applySourceNamesFromFileNameToCanvas: _0x58cc01
}) {
  let _0x5b37a5 = "";
  let _0x236f3d = "";
  const _0x8c5a8f = new Map();
  let _0x54ce33 = new Set();
  let _0x3d6b39 = false;
  let _0x29c5a8 = null;
  let _0xc822fd = false;
  let _0x12b091 = null;
  let _0x1e5d89 = 0;
  let _0x4bc2f8 = null;
  let _0x586298 = null;
  let _0x898bd3 = "";
  let _0x130d27 = "";
  let _0x31266e = 0;
  let _0x1a0e1d = false;
  let _0x23505e = () => {};
  function _0x28e917() {
    _0x5b37a5 = "";
    _0x236f3d = "";
    _0x8c5a8f.clear();
    _0x54ce33 = new Set();
    _0x3d6b39 = false;
  }
  function _0x217578(_0x4fd896) {
    const _0x1d48e3 = {
      projectId: _0x4fd896?.projectId || "default_v2_project",
      projectName: _0x4fd896?.projectName || getUntitledProjectName(),
      workspaceScopeVersion: Number(_0x4fd896?.workspaceScopeVersion) === 1 ? 1 : 0,
      multiData: _0x4fd896?.multiData || {
        canvases: [],
        activeCanvasId: null
      }
    };
    const {
      metaSignature: _0x298958,
      canvasRecords: _0x4064a0
    } = buildWorkspaceShardRecords(_0x1d48e3);
    _0x5b37a5 = _0x1d48e3.projectId;
    _0x236f3d = _0x298958;
    _0x8c5a8f.clear();
    _0x54ce33 = new Set();
    _0x4064a0.forEach(({
      record: _0x403b44,
      signature: _0x465d54
    }) => {
      if (!_0x403b44?.id) {
        return;
      }
      _0x8c5a8f.set(_0x403b44.id, _0x465d54);
      _0x54ce33.add(_0x403b44.id);
    });
    _0x3d6b39 = true;
  }
  const _0x2ede19 = {
    dbName: "TapNowV2Cache",
    storeName: "workspace",
    version: 1,
    _dbPromise: null,
    async initDB() {
      if (this._dbPromise) {
        return this._dbPromise;
      }
      this._dbPromise = new Promise((_0x27d0fa, _0x2fecde) => {
        const _0x916092 = indexedDB.open(this.dbName, this.version);
        _0x916092.onupgradeneeded = _0x13e0ca => {
          const _0x30df8a = _0x13e0ca.target.result;
          if (!_0x30df8a.objectStoreNames.contains(this.storeName)) {
            _0x30df8a.createObjectStore(this.storeName);
          }
        };
        _0x916092.onsuccess = _0x350a88 => {
          const _0x468ba5 = _0x350a88.target.result;
          _0x468ba5.onversionchange = () => {
            _0x468ba5.close();
            this._dbPromise = null;
          };
          _0x27d0fa(_0x468ba5);
        };
        _0x916092.onerror = _0x1611f1 => {
          this._dbPromise = null;
          _0x2fecde(_0x1611f1.target.error);
        };
      });
      return this._dbPromise;
    },
    async getRecord(_0x68cf47) {
      const _0xba79eb = await this.initDB();
      return new Promise((_0x2790cf, _0x55c1a6) => {
        const _0x1d207f = _0xba79eb.transaction(this.storeName, "readonly");
        const _0x3c52e1 = _0x1d207f.objectStore(this.storeName);
        const _0x330e91 = _0x3c52e1.get(_0x68cf47);
        _0x330e91.onsuccess = _0x56b7b2 => _0x2790cf(_0x56b7b2.target.result ?? null);
        _0x330e91.onerror = _0x2a1d8c => _0x55c1a6(_0x2a1d8c.target.error);
      });
    },
    async getRecords(_0x2c8ef8) {
      const _0x21f11f = await this.initDB();
      return new Promise((_0xd6454f, _0x43fd8a) => {
        const _0x21c956 = _0x21f11f.transaction(this.storeName, "readonly");
        const _0x1c447c = _0x21c956.objectStore(this.storeName);
        const _0x196a47 = _0x2c8ef8.map(_0x4d5bcf => new Promise((_0x384cc0, _0x3b02de) => {
          const _0x2b83cb = _0x1c447c.get(_0x4d5bcf);
          _0x2b83cb.onsuccess = _0x100030 => _0x384cc0(_0x100030.target.result ?? null);
          _0x2b83cb.onerror = _0x2c1aa7 => _0x3b02de(_0x2c1aa7.target.error);
        }));
        Promise.all(_0x196a47).then(_0xd6454f).catch(_0x43fd8a);
      });
    },
    async listKeys() {
      const _0x8962cd = await this.initDB();
      return new Promise((_0x231a0b, _0x2e5be4) => {
        const _0x554454 = _0x8962cd.transaction(this.storeName, "readonly");
        const _0x5a868b = _0x554454.objectStore(this.storeName);
        const _0xa5c260 = _0x5a868b.getAllKeys();
        _0xa5c260.onsuccess = _0x2101ca => _0x231a0b(_0x2101ca.target.result || []);
        _0xa5c260.onerror = _0x142911 => _0x2e5be4(_0x142911.target.error);
      });
    },
    async save(_0x2b5c17) {
      try {
        const _0x57c362 = {
          projectId: _0x2b5c17?.projectId || "default_v2_project",
          projectName: _0x2b5c17?.projectName || getUntitledProjectName(),
          workspaceScopeVersion: Number(_0x2b5c17?.workspaceScopeVersion) === 1 ? 1 : 0,
          multiData: _0x2b5c17?.multiData || {
            canvases: [],
            activeCanvasId: null
          }
        };
        const {
          metaRecord: _0x2ed712,
          metaSignature: _0x160382,
          canvasRecords: _0x2e7411
        } = buildWorkspaceShardRecords(_0x57c362);
        const _0x1b8068 = await this.initDB();
        const _0x47239e = _0x2e7411.map(({
          record: _0x24dc46
        }) => String(_0x24dc46?.id || "").trim()).filter(Boolean);
        const _0x3971e8 = new Set(_0x47239e);
        const _0x897292 = new Set(_0x47239e.map(_0x553882 => buildWorkspaceCanvasKey(_0x553882)));
        const _0x40cc18 = _0x5b37a5 !== _0x57c362.projectId;
        const _0x4be516 = _0x40cc18 || !_0x3d6b39 || _0x54ce33.size === 0 && _0x2e7411.length > 0;
        let _0x156794 = [];
        if (_0x40cc18) {
          if (_0x4be516) {
            await this.listKeys();
          }
        } else if (_0x3d6b39) {
          _0x156794 = Array.from(_0x54ce33).filter(_0x5ee079 => !_0x3971e8.has(_0x5ee079)).map(_0x2aab3d => buildWorkspaceCanvasKey(_0x2aab3d));
        } else if (_0x4be516) {
          const _0x3e4d6f = await this.listKeys();
          const _0x3bfa54 = _0x3e4d6f.filter(_0x18c92d => String(_0x18c92d).startsWith(WORKSPACE_CANVAS_KEY_PREFIX));
          _0x156794 = _0x3bfa54.filter(_0x2abf7b => !_0x897292.has(_0x2abf7b));
        }
        const _0x2cc607 = _0x2e7411.filter(({
          record: _0x5b82ff,
          signature: _0x468e80
        }) => _0x40cc18 || _0x8c5a8f.get(_0x5b82ff.id) !== _0x468e80);
        const _0x38d8d6 = _0x40cc18 || _0x236f3d !== _0x160382;
        if (!_0x38d8d6 && _0x2cc607.length === 0 && _0x156794.length === 0) {
          return;
        }
        return new Promise((_0x5ea353, _0x18f868) => {
          const _0x215aeb = _0x1b8068.transaction(this.storeName, "readwrite");
          const _0x41f0ce = _0x215aeb.objectStore(this.storeName);
          if (_0x38d8d6) {
            _0x41f0ce.put(_0x2ed712, WORKSPACE_META_KEY);
          }
          _0x2cc607.forEach(({
            key: _0x3eaa11,
            persistedRecord: _0x210800
          }) => {
            _0x41f0ce.put(_0x210800, _0x3eaa11);
          });
          _0x156794.forEach(_0xcf1886 => {
            _0x41f0ce.delete(_0xcf1886);
          });
          _0x215aeb.oncomplete = () => {
            _0x5b37a5 = _0x57c362.projectId;
            _0x236f3d = _0x160382;
            const _0x3ed1eb = new Map();
            _0x2e7411.forEach(({
              record: _0x3b8e3b,
              signature: _0x2a2317
            }) => {
              if (!_0x3b8e3b?.id) {
                return;
              }
              _0x3ed1eb.set(_0x3b8e3b.id, _0x2a2317);
            });
            _0x8c5a8f.clear();
            _0x54ce33 = new Set();
            _0x3ed1eb.forEach((_0x5ee197, _0x2b7cbb) => {
              _0x8c5a8f.set(_0x2b7cbb, _0x5ee197);
              _0x54ce33.add(_0x2b7cbb);
            });
            _0x3d6b39 = true;
            _0x5ea353();
          };
          _0x215aeb.onerror = _0x2955d4 => _0x18f868(_0x2955d4.target.error);
          _0x215aeb.onabort = _0x42fdbe => _0x18f868(_0x42fdbe.target.error);
        });
      } catch (_0x4c0c67) {
        console.warn("[V2LocalCache] Save failed:", _0x4c0c67);
      }
    },
    async load() {
      try {
        const _0x5cae3e = await this.getRecord(WORKSPACE_META_KEY);
        if (_0x5cae3e?.cacheVersion === 2 && Array.isArray(_0x5cae3e.canvasOrder)) {
          const _0x2ed036 = _0x5cae3e.canvasOrder.map(_0x1d47fc => buildWorkspaceCanvasKey(_0x1d47fc?.id));
          const _0x6bdfb9 = await this.getRecords(_0x2ed036);
          const _0x1a0955 = restoreWorkspacePayloadFromShardRecords(_0x5cae3e, _0x6bdfb9);
          if (_0x1a0955?.multiData?.canvases?.length) {
            _0x217578(_0x1a0955);
            return _0x1a0955;
          }
        }
        const _0x1fc833 = await this.getRecord(LEGACY_WORKSPACE_KEY);
        if (_0x1fc833?.multiData?.canvases?.length) {
          _0x28e917();
          return _0x1fc833;
        }
        _0x28e917();
        return null;
      } catch (_0x596fff) {
        console.warn("[V2LocalCache] Load failed:", _0x596fff);
        _0x28e917();
        return null;
      }
    },
    async saveProjectSession(_0x31a1a9) {
      const _0x4662d7 = normalizeProjectWorkspaceId(_0x31a1a9?.projectId);
      if (!_0x4662d7) {
        throw new Error("[V2LocalCache] Project workspace session requires projectId");
      }
      const _0x39efd7 = {
        projectId: _0x4662d7,
        projectName: _0x31a1a9?.projectName || getUntitledProjectName(),
        workspaceScopeVersion: 1,
        multiData: _0x31a1a9?.multiData || {
          canvases: [],
          activeCanvasId: null
        }
      };
      const {
        metaRecord: _0x47d2a2,
        canvasRecords: _0x4d0947
      } = buildWorkspaceShardRecords(_0x39efd7);
      const _0x516d9a = buildProjectWorkspaceMetaKey(_0x4662d7);
      const _0xf4a206 = await this.getRecord(_0x516d9a);
      const _0x1ac04c = new Set(_0x4d0947.map(({
        record: _0x54c29a
      }) => String(_0x54c29a?.id || "").trim()).filter(Boolean));
      const _0x3aec0c = Array.isArray(_0xf4a206?.canvasOrder) ? _0xf4a206.canvasOrder.map(_0x4ddc1e => String(_0x4ddc1e?.id || "").trim()).filter(_0x2667ec => _0x2667ec && !_0x1ac04c.has(_0x2667ec)).map(_0x431ba5 => buildProjectWorkspaceCanvasKey(_0x4662d7, _0x431ba5)) : [];
      const _0x3a3b77 = await this.initDB();
      return new Promise((_0x45fa08, _0xc449bd) => {
        const _0x2b6b65 = _0x3a3b77.transaction(this.storeName, "readwrite");
        const _0x3fa4bf = _0x2b6b65.objectStore(this.storeName);
        _0x3fa4bf.put({
          ..._0x47d2a2,
          projectId: _0x4662d7,
          sessionVersion: 1,
          hasUnsavedChanges: _0x31a1a9?.hasUnsavedChanges !== false
        }, _0x516d9a);
        _0x4d0947.forEach(({
          record: _0x232d69,
          persistedRecord: _0x443360
        }) => {
          _0x3fa4bf.put(_0x443360, buildProjectWorkspaceCanvasKey(_0x4662d7, _0x232d69.id));
        });
        _0x3aec0c.forEach(_0x1c8f45 => _0x3fa4bf.delete(_0x1c8f45));
        _0x2b6b65.oncomplete = () => _0x45fa08({
          success: true,
          projectId: _0x4662d7
        });
        _0x2b6b65.onerror = _0x5b066d => _0xc449bd(_0x5b066d.target.error);
        _0x2b6b65.onabort = _0x1a2b6a => _0xc449bd(_0x1a2b6a.target.error);
      });
    },
    async loadProjectSession(_0x3c3b80) {
      const _0x2f1d6b = normalizeProjectWorkspaceId(_0x3c3b80);
      if (!_0x2f1d6b) {
        return null;
      }
      try {
        const _0x4bc44a = await this.getRecord(buildProjectWorkspaceMetaKey(_0x2f1d6b));
        if (_0x4bc44a?.sessionVersion !== 1 || !Array.isArray(_0x4bc44a.canvasOrder)) {
          return null;
        }
        const _0x3734ae = await this.getRecords(_0x4bc44a.canvasOrder.map(_0x99c15 => buildProjectWorkspaceCanvasKey(_0x2f1d6b, _0x99c15?.id)));
        const _0x2c5862 = restoreWorkspacePayloadFromShardRecords(_0x4bc44a, _0x3734ae);
        if (!_0x2c5862?.multiData?.canvases?.length) {
          return null;
        }
        return {
          ..._0x2c5862,
          projectId: _0x2f1d6b,
          hasUnsavedChanges: _0x4bc44a.hasUnsavedChanges !== false,
          session: true
        };
      } catch (_0xf07fc9) {
        console.warn("[V2LocalCache] Load project workspace session failed:", _0xf07fc9);
        return null;
      }
    },
    async clearProjectSession(_0x1a9c42) {
      const _0x32e87e = normalizeProjectWorkspaceId(_0x1a9c42);
      if (!_0x32e87e) {
        return {
          success: false,
          reason: "missing-project-id"
        };
      }
      try {
        const _0x542a82 = buildProjectWorkspaceMetaKey(_0x32e87e);
        const _0x2a1159 = await this.getRecord(_0x542a82);
        const _0x2a2244 = Array.isArray(_0x2a1159?.canvasOrder) ? _0x2a1159.canvasOrder.map(_0x49a804 => String(_0x49a804?.id || "").trim()).filter(Boolean).map(_0x34d059 => buildProjectWorkspaceCanvasKey(_0x32e87e, _0x34d059)) : [];
        const _0x7180e4 = await this.initDB();
        return new Promise((_0x668e6, _0xed0016) => {
          const _0x3a50a4 = _0x7180e4.transaction(this.storeName, "readwrite");
          const _0x4d5ba6 = _0x3a50a4.objectStore(this.storeName);
          _0x4d5ba6.delete(_0x542a82);
          _0x2a2244.forEach(_0x133eb1 => _0x4d5ba6.delete(_0x133eb1));
          _0x3a50a4.oncomplete = () => _0x668e6({
            success: true,
            projectId: _0x32e87e
          });
          _0x3a50a4.onerror = _0x1d92a4 => _0xed0016(_0x1d92a4.target.error);
          _0x3a50a4.onabort = _0x371e8b => _0xed0016(_0x371e8b.target.error);
        });
      } catch (_0x125b59) {
        console.warn("[V2LocalCache] Clear project workspace session failed:", _0x125b59);
        return {
          success: false,
          projectId: _0x32e87e,
          error: _0x125b59
        };
      }
    },
    async clear() {
      try {
        const _0x50c354 = await this.initDB();
        const _0x558efc = await this.listKeys();
        const _0x3a2aea = _0x558efc.filter(_0x1ee2d8 => {
          const _0x6df8f5 = String(_0x1ee2d8);
          return _0x6df8f5 === LEGACY_WORKSPACE_KEY || _0x6df8f5 === WORKSPACE_META_KEY || _0x6df8f5.startsWith(WORKSPACE_CANVAS_KEY_PREFIX) || _0x6df8f5.startsWith(PROJECT_WORKSPACE_META_KEY_PREFIX) || _0x6df8f5.startsWith(PROJECT_WORKSPACE_CANVAS_KEY_PREFIX);
        });
        return new Promise((_0x3c05b6, _0x471079) => {
          const _0x48608d = _0x50c354.transaction(this.storeName, "readwrite");
          const _0x2163a7 = _0x48608d.objectStore(this.storeName);
          _0x3a2aea.forEach(_0x21da95 => _0x2163a7.delete(_0x21da95));
          _0x48608d.oncomplete = () => {
            _0x28e917();
            _0x3c05b6();
          };
          _0x48608d.onerror = _0x46732b => _0x471079(_0x46732b.target.error);
          _0x48608d.onabort = _0x52c9cf => _0x471079(_0x52c9cf.target.error);
        });
      } catch (_0x28fb8d) {
        console.warn("[V2LocalCache] Clear failed:", _0x28fb8d);
      }
    }
  };
  window.V2LocalCache = _0x2ede19;
  const _0x11bdc7 = Object.freeze({
    save(_0x29f1b6) {
      return _0x2ede19.saveProjectSession(_0x29f1b6);
    },
    load(_0x5b6d55) {
      return _0x2ede19.loadProjectSession(_0x5b6d55);
    },
    clear(_0x1c1442) {
      return _0x2ede19.clearProjectSession(_0x1c1442);
    },
    async move(_0x4ce6c9, _0x5be8a9, {
      projectName = ""
    } = {}) {
      const _0x3d51ce = normalizeProjectWorkspaceId(_0x4ce6c9);
      const _0x30d229 = normalizeProjectWorkspaceId(_0x5be8a9);
      if (!_0x3d51ce || !_0x30d229 || _0x3d51ce === _0x30d229) {
        return null;
      }
      const _0x37c9e0 = await _0x2ede19.loadProjectSession(_0x3d51ce);
      if (!_0x37c9e0) {
        return null;
      }
      const _0x2e0bc2 = await _0x2ede19.saveProjectSession({
        ..._0x37c9e0,
        projectId: _0x30d229,
        projectName: projectName || _0x37c9e0.projectName,
        hasUnsavedChanges: _0x37c9e0.hasUnsavedChanges
      });
      await _0x2ede19.clearProjectSession(_0x3d51ce);
      return _0x2e0bc2;
    }
  });
  function _0x500ed7(_0x67f06d) {
    if (typeof performance?.mark !== "function") {
      return;
    }
    performance.mark(_0x67f06d);
  }
  function _0x2c17b9(_0x2ccc9b, _0x3da085, _0x4070f9) {
    if (typeof performance?.measure !== "function") {
      return;
    }
    try {
      performance.measure(_0x2ccc9b, _0x3da085, _0x4070f9);
    } catch {}
  }
  function _0x23d401() {
    if (window.__perfDebug !== true) {
      return;
    }
    if (typeof performance?.getEntriesByName !== "function") {
      return;
    }
    BOOT_PERF_MEASURE_NAMES.forEach(_0x2c01ba => {
      const _0x29f638 = performance.getEntriesByName(_0x2c01ba);
      const _0x71424 = _0x29f638[_0x29f638.length - 1];
      if (!_0x71424) {
        return;
      }
      console.log("[perf] " + _0x2c01ba + ": " + _0x71424.duration.toFixed(1) + "ms");
    });
  }
  function _0x2f8807({
    projectId: _0x11f408,
    projectName: _0x27e591,
    multiData: _0x32fe4f
  }) {
    return {
      projectId: _0x11f408,
      projectName: _0x27e591,
      workspaceScopeVersion: window._v2WorkspaceProjectScoped === true ? 1 : 0,
      multiData: _0x32fe4f || {}
    };
  }
  function _0x40651a({
    projectId: _0x1c736e,
    projectName: _0x4247c9,
    multiData: _0x2556da
  }) {
    const _0x542b43 = _0x2f8807({
      projectId: _0x1c736e,
      projectName: _0x4247c9,
      multiData: _0x2556da
    });
    writeDreaminaResumeBackupSync(_0x542b43);
    return _0x2ede19.save(_0x542b43);
  }
  function _0x46a6ba(_0x39997a, {
    sanitizeForPersistence = false,
    captureVisualSnapshot = false,
    includeProjectContexts = false
  } = {}) {
    if (!_0x39997a) {
      return null;
    }
    if (typeof _0x39997a.getMultiDataSnapshot === "function") {
      return _0x39997a.getMultiDataSnapshot({
        sanitizeForPersistence: sanitizeForPersistence,
        captureVisualSnapshot: captureVisualSnapshot,
        includeProjectContexts: includeProjectContexts
      });
    }
    if (typeof _0x39997a.getMultiData === "function") {
      return _0x39997a.getMultiData();
    }
    return null;
  }
  function _0x9d74e7() {
    return document.getElementById("projectNameText")?.textContent || getUntitledProjectName();
  }
  function _0x13c042() {
    if (desktopBridge.project.isAvailable()) {
      return desktopBridge.project;
    } else {
      return null;
    }
  }
  function _0x217f11() {
    const _0x37be1f = Number(window._v2CurrentProjectLastModified || 0);
    if (Number.isFinite(_0x37be1f) && _0x37be1f > 0) {
      return Math.round(_0x37be1f);
    } else {
      return 0;
    }
  }
  function _0x4145e7() {
    return {
      projectId: window.currentProjectId || "default_v2_project",
      projectName: _0x9d74e7(),
      filename: window._v2CurrentFile || "",
      recentId: window._v2CurrentRecentProjectId || "",
      displayPath: window._v2CurrentProjectDisplayPath || "",
      lastKnownProjectLastModified: _0x217f11(),
      workspaceScopeVersion: window._v2WorkspaceProjectScoped === true ? 1 : 0
    };
  }
  function _0x5d62c8() {
    return _0x3ee653?.hasDirtyCanvases?.() === true;
  }
  async function _0x2a3515(_0x1588c4 = "auto") {
    const _0x4f3d76 = _0x13c042();
    if (typeof _0x4f3d76?.writeRecoverySnapshot !== "function") {
      return {
        success: false,
        reason: "api-unavailable"
      };
    }
    if (!_0x5d62c8()) {
      return {
        success: false,
        reason: "clean"
      };
    }
    const _0x4a3b5c = _0x46a6ba(_0x3ee653, {
      sanitizeForPersistence: true,
      includeProjectContexts: true
    });
    if (!_0x4a3b5c?.canvases?.length) {
      return {
        success: false,
        reason: "empty-canvas"
      };
    }
    const _0x38f20b = _0x4145e7();
    const _0x4ff37c = buildRecoverySnapshotSignature({
      meta: _0x38f20b,
      multiData: _0x4a3b5c,
      persistenceRevision: _0x3ee653?.getPersistenceRevisionSnapshot?.() || null
    });
    const _0x22264d = Date.now();
    if (_0x4ff37c && _0x4ff37c === _0x130d27 && _0x22264d - _0x31266e < RECOVERY_SNAPSHOT_DEDUPE_MS) {
      return {
        success: true,
        deduped: true
      };
    }
    if (_0x586298 && _0x898bd3 === _0x4ff37c) {
      return _0x586298;
    }
    if (_0x586298) {
      return _0x586298.catch(() => null).then(() => _0x2a3515(_0x1588c4));
    }
    _0x586298 = _0x4f3d76.writeRecoverySnapshot({
      ..._0x38f20b,
      reason: _0x1588c4,
      multiData: _0x4a3b5c
    }).then(_0x1b1f26 => {
      if (_0x1b1f26?.success !== false) {
        _0x130d27 = _0x4ff37c;
        _0x31266e = Date.now();
      }
      return _0x1b1f26;
    }).finally(() => {
      _0x586298 = null;
      _0x898bd3 = "";
    });
    _0x898bd3 = _0x4ff37c;
    return _0x586298;
  }
  function _0x7be5c2(_0x1a96f2 = "dirty-state") {
    const _0x3c125c = _0x13c042();
    if (typeof _0x3c125c?.writeRecoverySnapshot !== "function") {
      return;
    }
    if (_0x4bc2f8 !== null) {
      clearTimeout(_0x4bc2f8);
    }
    _0x4bc2f8 = setTimeout(() => {
      _0x4bc2f8 = null;
      _0x56d07e(() => {
        _0x2a3515(_0x1a96f2).catch(_0x580b14 => {
          console.warn("[projectLifecycle] 写入恢复快照失败:", _0x580b14);
        });
      }, {
        timeout: 1500
      });
    }, 500);
  }
  function _0x4c67e0() {
    if (_0x4bc2f8 === null) {
      return;
    }
    clearTimeout(_0x4bc2f8);
    _0x4bc2f8 = null;
  }
  function _0x56fc9c({
    writeRecovery = false,
    reason = "dirty-state",
    knownHasUnsavedChanges = null
  } = {}) {
    const _0x197529 = _0x13c042();
    const _0x45be1d = typeof knownHasUnsavedChanges === "boolean" ? knownHasUnsavedChanges : _0x5d62c8();
    if (typeof _0x197529?.setUnsavedState === "function") {
      const _0x47ba2e = _0x197529.setUnsavedState({
        hasUnsavedChanges: _0x45be1d,
        projectName: _0x9d74e7()
      });
      if (_0x47ba2e && typeof _0x47ba2e.catch === "function") {
        _0x47ba2e.catch(_0x18711b => {
          console.warn("[projectLifecycle] 同步未保存状态失败:", _0x18711b);
        });
      }
    }
    if (_0x45be1d && writeRecovery) {
      _0x7be5c2(reason);
      return;
    }
    if (!_0x45be1d) {
      _0x4c67e0();
    }
  }
  async function _0x140bc3() {
    const _0x502484 = _0x13c042();
    if (typeof _0x502484?.getRecoverySnapshotInfo !== "function" || typeof _0x502484?.readRecoverySnapshot !== "function") {
      return null;
    }
    try {
      const _0x3c0461 = await _0x502484.getRecoverySnapshotInfo(_0x4145e7());
      if (!_0x3c0461?.exists) {
        return null;
      }
      if (_0x3c0461.isNewerThanProject !== true) {
        await _0x502484.clearRecoverySnapshot?.();
        return null;
      }
      const _0xc7358a = await _0x502484.readRecoverySnapshot();
      if (!_0xc7358a?.success || !_0xc7358a.data) {
        return null;
      }
      return {
        projectId: _0xc7358a.projectId || window.currentProjectId || "default_v2_project",
        projectName: _0xc7358a.projectName || getUntitledProjectName(),
        workspaceScopeVersion: Number(_0xc7358a.workspaceScopeVersion) === 1 ? 1 : 0,
        multiData: _0x22cc15.resolveCanvasData(_0xc7358a.data),
        recovery: true,
        filename: _0xc7358a.filename || "",
        recentId: _0xc7358a.recentId || "",
        displayPath: _0xc7358a.displayPath || "",
        lastModified: Number(_0xc7358a.lastModified || 0) || 0
      };
    } catch (_0x2ebeb0) {
      console.warn("[projectLifecycle] 读取恢复快照失败:", _0x2ebeb0);
      return null;
    }
  }
  function _0x11dfa4(_0x23acdc) {
    if (!_0x23acdc?.recovery) {
      return;
    }
    window._v2CurrentFile = _0x23acdc.filename || "";
    window._v2CurrentRecentProjectId = _0x23acdc.recentId || "";
    window._v2CurrentProjectDisplayPath = _0x23acdc.displayPath || "";
    window._v2CurrentProjectLastModified = Number(_0x23acdc.lastModified || 0) || 0;
  }
  function _0x1958a1() {
    if (_0x1a0e1d) {
      return;
    }
    _0x1a0e1d = true;
    window.__aiCanvasWriteRecoverySnapshotForClose = (_0x39eaa6 = "window-close") => _0x2a3515(_0x39eaa6);
    window.addEventListener("aicanvas:dirty-state-changed", () => {
      _0x56fc9c({
        writeRecovery: true,
        reason: "dirty-state"
      });
    });
  }
  function _0x3889d0() {
    if (_0x29c5a8) {
      _0xc822fd = true;
      return _0x29c5a8;
    }
    const _0x1b5f1c = async () => {
      const _0xb1adbd = _0x46a6ba(_0x3ee653, {
        sanitizeForPersistence: true,
        includeProjectContexts: true
      });
      const _0x3197b0 = window.currentProjectId;
      const _0x37ffae = _0x9d74e7();
      if (!_0xb1adbd?.canvases?.length) {
        return;
      }
      await _0x40651a({
        projectId: _0x3197b0,
        projectName: _0x37ffae,
        multiData: _0xb1adbd
      });
    };
    _0x29c5a8 = (async () => {
      try {
        do {
          _0xc822fd = false;
          await _0x1b5f1c();
        } while (_0xc822fd);
      } finally {
        _0x29c5a8 = null;
      }
    })();
    return _0x29c5a8;
  }
  function _0x494982(_0x3fa4da) {
    return _0x1db049(_0x3fa4da || {});
  }
  const _0x4a30e7 = 20000;
  const _0x3d8840 = 22000;
  function _0x56d07e(_0x457d49, {
    timeout = 1500,
    delayMs = 0,
    retryDelayMs = WORKSPACE_CACHE_BUSY_RETRY_MS,
    onError = _0x43a658 => {
      console.warn("[projectLifecycle] 后台任务失败:", _0x43a658);
    }
  } = {}) {
    if (typeof _0x457d49 !== "function") {
      return null;
    }
    const _0x1e5f39 = createWorkspaceCacheIdleScheduler({
      run: _0x457d49,
      isBusy: () => isWorkspaceCacheInteractionBusy({
        documentRef: document,
        CanvasTabManager: _0x3ee653
      }),
      retryDelayMs: retryDelayMs,
      idleTimeoutMs: timeout,
      onError: onError
    });
    _0x1e5f39.schedule({
      delayMs: delayMs
    });
    return _0x1e5f39;
  }
  function _0x887db7(_0x5529ad) {
    _0x56d07e(_0x5529ad, {
      timeout: 1500
    });
  }
  function _0x4977f7(_0x580e60, {
    timeout: _0x119d4f,
    delayMs: _0x5afc08
  } = {}) {
    _0x56d07e(_0x580e60, {
      timeout: _0x119d4f,
      delayMs: _0x5afc08,
      retryDelayMs: 2000,
      onError(_0x53c65b) {
        console.warn("[projectLifecycle] 历史图片后台任务失败:", _0x53c65b);
      }
    });
  }
  function _0x39e41e() {
    return new Promise(_0x56550b => setTimeout(_0x56550b, 0));
  }
  function _0x26d973(_0x24a172) {
    return new Promise(_0x321eb4 => {
      setTimeout(_0x321eb4, Math.max(0, Number(_0x24a172) || 0));
    });
  }
  function _0x38864d() {
    return new Promise(_0x1e9b53 => {
      if (typeof window?.requestIdleCallback === "function") {
        window.requestIdleCallback(() => _0x1e9b53(), {
          timeout: INITIAL_REVEAL_IDLE_TIMEOUT_MS
        });
        return;
      }
      setTimeout(_0x1e9b53, 48);
    });
  }
  async function _0x3ca0c3(_0x3779ac) {
    let _0x522193 = [];
    let _0xcdefc0 = -1;
    let _0x36f8a5 = 0;
    for (let _0x58f453 = 0; _0x58f453 < INITIAL_IMAGE_READY_MAX_ATTEMPTS; _0x58f453 += 1) {
      const _0x56d548 = collectInitialImageRevealEntries(_0x3779ac, {
        windowObject: window
      });
      _0x522193 = _0x56d548.filter(_0x18df2b => _0x18df2b.ready === true);
      _0x36f8a5 = _0x522193.length === _0xcdefc0 ? _0x36f8a5 + 1 : 0;
      _0xcdefc0 = _0x522193.length;
      if (shouldFinishInitialImageReadinessWait({
        totalCount: _0x56d548.length,
        readyCount: _0x522193.length,
        stablePollCount: _0x36f8a5,
        attempt: _0x58f453
      })) {
        return _0x522193;
      }
      await _0x26d973(INITIAL_IMAGE_READY_POLL_MS);
    }
    return _0x522193;
  }
  function _0x35e813({
    canvasEl: _0x45b65f,
    afterHidden: _0x218acc
  } = {}) {
    cancelStartupLoaderGuard(window);
    _0x23505e();
    _0x23505e = () => {};
    if (_0x45b65f) {
      _0x45b65f.style.transition = "";
    }
    if (window.hideGlobalLoading) {
      window.hideGlobalLoading();
    }
    _0x500ed7("loader hidden:end");
    _0x2c17b9("loader hidden", "initApp:start", "loader hidden:end");
    if (typeof _0x218acc === "function") {
      _0x218acc();
    }
    _0x23d401();
  }
  async function _0x5a5a04({
    wrapEl: _0x816b47,
    canvasEl: _0x3ff1d5,
    animate = false,
    imageFirst = true,
    afterHidden: _0x478f92
  } = {}) {
    const _0x2856d2 = document.getElementById("v2-initial-loader");
    const _0x5930cd = _0x55553e.getStateRaw?.()?.nodes || {};
    const _0x3e83c6 = window?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    const _0x38f9cb = imageFirst && hasInitialCanvasImageNodes(_0x5930cd) && !_0x3e83c6 ? await _0x3ca0c3(_0x3ff1d5) : [];
    if (_0x38f9cb.length > 0) {
      await _0x38864d();
      await waitForInitialRevealFrame();
    }
    if (_0x2856d2 && !_0x3e83c6) {
      _0x2856d2.setAttribute?.("data-reveal-ready", "true");
      await _0x26d973(INITIAL_PROGRESS_FINISH_MS);
    }
    const _0x4b1b0a = shouldUseInitialImageFirstReveal({
      nodes: _0x5930cd,
      targetCount: _0x38f9cb.length,
      reducedMotion: _0x3e83c6
    });
    const _0x614449 = _0x4b1b0a ? createInitialImageRevealLayer({
      loader: _0x2856d2,
      imageTargets: _0x38f9cb,
      documentObject: document,
      windowObject: window
    }) : null;
    if (!_0x4b1b0a || !_0x614449) {
      if (animate) {
        await _0x26d973(80);
      }
      if (_0x3ff1d5) {
        _0x3ff1d5.style.transition = "";
      }
      if (_0x816b47) {
        _0x816b47.style.transition = animate ? "opacity 0.2s ease-in-out" : "";
        _0x816b47.style.opacity = "1";
      }
      if (_0x2856d2) {
        _0x2856d2.style.opacity = "0";
        _0x2856d2.style.visibility = "hidden";
        setTimeout(() => {
          _0x2856d2.remove?.();
          _0x816b47?.classList.remove("is-initial-header-locked");
        }, 400);
      } else {
        _0x816b47?.classList.remove("is-initial-header-locked");
      }
      _0x35e813({
        canvasEl: _0x3ff1d5,
        afterHidden: _0x478f92
      });
      return;
    }
    _0x816b47.style.transition = "";
    _0x816b47.style.opacity = "1";
    _0x2856d2.classList.add("is-initial-image-reveal-shell");
    await _0x26d973(INITIAL_BRAND_IMAGE_HANDOFF_MS);
    await waitForInitialRevealFrame();
    _0x2856d2.classList.add("is-initial-image-reveal-active");
    await _0x26d973(resolveInitialImageRevealDurationMs(_0x38f9cb.length));
    await waitForInitialRevealFrame();
    _0x2856d2.classList.add("is-initial-background-reveal");
    await _0x26d973(INITIAL_BACKGROUND_REVEAL_MS);
    _0x2856d2.classList.add("is-initial-image-reveal-handoff");
    await _0x26d973(INITIAL_IMAGE_LAYER_HANDOFF_MS);
    _0x2856d2.style.visibility = "hidden";
    _0x2856d2.remove?.();
    _0x816b47.classList.remove("is-initial-header-locked");
    _0x35e813({
      canvasEl: _0x3ff1d5,
      afterHidden: _0x478f92
    });
  }
  function _0x575763({
    projectId: _0xc4e55,
    projectName: _0x5d1133,
    multiData: _0x36f0a8
  }) {
    if (!_0x36f0a8?.canvases?.length) {
      return;
    }
    _0x887db7(async () => {
      try {
        const {
          changed: _0x33a01b,
          multiData: _0x43a31c
        } = await _0x1e45bc(_0x36f0a8);
        if (!_0x33a01b) {
          return;
        }
        await _0x40651a({
          projectId: _0xc4e55,
          projectName: _0x5d1133,
          multiData: _0x43a31c
        });
      } catch (_0x18d55e) {
        console.warn("[main] 缩略图迁移失败", _0x18d55e);
      }
    });
  }
  function _0x155a04(_0x44a345) {
    const _0x2a1c6b = String(_0x44a345 || "").trim();
    return /^https?:\/\//i.test(_0x2a1c6b) || _0x2a1c6b.startsWith("//");
  }
  function _0x2f20ce(_0x1cae78) {
    const _0x1128aa = [];
    for (const _0x38d659 of Object.values(_0x1cae78 || {})) {
      if (!_0x38d659 || _0x38d659.type !== "ai-image") {
        continue;
      }
      const _0x17a2b0 = Array.isArray(_0x38d659.images) ? _0x38d659.images : [];
      for (let _0x1ed834 = 0; _0x1ed834 < _0x17a2b0.length; _0x1ed834 += 1) {
        const _0x8b5958 = _0x17a2b0[_0x1ed834] || {};
        if (String(_0x8b5958.localPath || "").trim()) {
          continue;
        }
        const _0x4349f9 = String(_0x8b5958.remoteFallbackUrl || _0x8b5958.sourceUrl || _0x8b5958.imageUrl || _0x8b5958.thumbUrl || "").trim();
        if (!_0x4349f9 || !_0x155a04(_0x4349f9)) {
          continue;
        }
        _0x1128aa.push({
          nodeId: _0x38d659.id,
          idx: _0x1ed834,
          remote: _0x4349f9
        });
      }
      if (_0x17a2b0.length === 0 && !String(_0x38d659.localPath || "").trim() && _0x155a04(_0x38d659.remoteFallbackUrl || _0x38d659.thumbUrl || _0x38d659.imageUrl || _0x38d659.sourceUrl)) {
        const _0x3af15a = String(_0x38d659.remoteFallbackUrl || _0x38d659.sourceUrl || _0x38d659.imageUrl || _0x38d659.thumbUrl || "").trim();
        if (_0x3af15a) {
          _0x1128aa.push({
            nodeId: _0x38d659.id,
            idx: -1,
            remote: _0x3af15a
          });
        }
      }
    }
    return _0x1128aa;
  }
  function _0x3e1932(_0xbaa0ef, _0x30143a) {
    if (!_0xbaa0ef) {
      return false;
    }
    if (_0x30143a.idx >= 0) {
      const _0x422161 = Array.isArray(_0xbaa0ef.images) ? _0xbaa0ef.images : [];
      const _0x4b512e = _0x422161[_0x30143a.idx];
      if (!_0x4b512e || String(_0x4b512e.localPath || "").trim()) {
        return false;
      }
      const _0x3eee9e = String(_0x4b512e.remoteFallbackUrl || _0x4b512e.sourceUrl || _0x4b512e.imageUrl || _0x4b512e.thumbUrl || "").trim();
      return _0x3eee9e === _0x30143a.remote;
    }
    if (String(_0xbaa0ef.localPath || "").trim()) {
      return false;
    }
    const _0x368245 = String(_0xbaa0ef.remoteFallbackUrl || _0xbaa0ef.sourceUrl || _0xbaa0ef.imageUrl || _0xbaa0ef.thumbUrl || "").trim();
    return _0x368245 === _0x30143a.remote;
  }
  function _0x32d1dc(_0x1af1ad, _0x5f52a5) {
    const _0x5c2097 = typeof _0x5f52a5 === "string" ? String(_0x5f52a5 || "").trim() : String(_0x5f52a5?.localUrl || _0x5f52a5?.url || "").trim();
    const _0x15199c = typeof _0x5f52a5 === "string" ? normalizeLocalPath(_0x5f52a5) : pickResultLocalPath(_0x5f52a5) || normalizeLocalPath(_0x5c2097);
    if (!_0x15199c) {
      return false;
    }
    const _0x280a5a = _0x5f52a5 && typeof _0x5f52a5 === "object" ? buildImageNodeStorageFields(_0x5f52a5) : {};
    const _0x50ab4d = buildCanvasLocalImageFields(_0x5f52a5 && typeof _0x5f52a5 === "object" ? _0x5f52a5 : {
      localPath: _0x15199c
    });
    const _0x599c60 = _0x55553e.getStateRaw()?.nodes?.[_0x1af1ad.nodeId];
    if (!_0x3e1932(_0x599c60, _0x1af1ad)) {
      return false;
    }
    const _0x3e4499 = {};
    if (_0x1af1ad.idx >= 0) {
      const _0x11e07c = Array.isArray(_0x599c60.images) ? _0x599c60.images.slice() : [];
      if (!_0x11e07c[_0x1af1ad.idx]) {
        return false;
      }
      _0x11e07c[_0x1af1ad.idx] = {
        ...(_0x11e07c[_0x1af1ad.idx] || {}),
        ..._0x50ab4d,
        ..._0x280a5a,
        remoteFallbackUrl: "",
        localSaveError: "",
        originalWidth: Number(_0x5f52a5?.originalWidth || 0) || _0x11e07c[_0x1af1ad.idx]?.originalWidth,
        originalHeight: Number(_0x5f52a5?.originalHeight || 0) || _0x11e07c[_0x1af1ad.idx]?.originalHeight
      };
      _0x3e4499.images = _0x11e07c;
      if ((_0x599c60.mainImageIndex || 0) === _0x1af1ad.idx) {
        Object.assign(_0x3e4499, _0x50ab4d);
        Object.assign(_0x3e4499, _0x280a5a);
        _0x3e4499.remoteFallbackUrl = "";
        _0x3e4499.localSaveError = "";
        _0x3e4499.originalWidth = Number(_0x5f52a5?.originalWidth || 0) || _0x599c60.originalWidth;
        _0x3e4499.originalHeight = Number(_0x5f52a5?.originalHeight || 0) || _0x599c60.originalHeight;
      }
    } else {
      Object.assign(_0x3e4499, _0x50ab4d);
      Object.assign(_0x3e4499, _0x280a5a);
      _0x3e4499.remoteFallbackUrl = "";
      _0x3e4499.localSaveError = "";
      _0x3e4499.originalWidth = Number(_0x5f52a5?.originalWidth || 0) || _0x599c60.originalWidth;
      _0x3e4499.originalHeight = Number(_0x5f52a5?.originalHeight || 0) || _0x599c60.originalHeight;
    }
    if (Object.keys(_0x3e4499).length === 0) {
      return false;
    }
    _0x55553e.updateNodeData(_0x1af1ad.nodeId, _0x3e4499);
    return true;
  }
  function _0x101d14(_0x5b2860) {
    return normalizeLocalPath(_0x5b2860?.originalLocalPath || _0x5b2860?.localPath);
  }
  function _0x4dd882(_0x17fa62) {
    return {
      displayLocalPath: normalizeLocalPath(_0x17fa62?.displayLocalPath),
      thumbLocalPath: normalizeLocalPath(_0x17fa62?.thumbLocalPath)
    };
  }
  function _0x5cdf4b(_0x2cbdff) {
    const _0x57ae96 = _0x101d14(_0x2cbdff);
    if (!_0x57ae96) {
      return false;
    }
    const {
      displayLocalPath: _0x5bb6cf,
      thumbLocalPath: _0x20c4fd
    } = _0x4dd882(_0x2cbdff);
    const _0x37b2cc = !!_0x5bb6cf;
    const _0x8fbb97 = !!_0x20c4fd;
    return !_0x37b2cc || !_0x8fbb97;
  }
  function _0x81fe6e(_0x55bbe1) {
    const _0x408f62 = normalizeLocalPath(_0x55bbe1).toLowerCase();
    return _0x408f62.includes("/_derived/") || _0x408f62.includes("/derived/") || _0x408f62.includes("/videothumbs/");
  }
  function _0x37f9bf(_0xc0ce29) {
    const {
      displayLocalPath: _0x3ed31f,
      thumbLocalPath: _0x4ca772
    } = _0x4dd882(_0xc0ce29);
    const _0xe68f4a = [_0x3ed31f, _0x4ca772].filter(Boolean);
    return _0xe68f4a.length > 0 && _0xe68f4a.every(_0x81fe6e);
  }
  async function _0x55304d(_0x20294a) {
    if (typeof _0x22cc15?.checkLocalMediaExists !== "function") {
      return false;
    }
    const _0xd3fd2b = _0x101d14(_0x20294a);
    if (!_0xd3fd2b) {
      return false;
    }
    const {
      displayLocalPath: _0x49d019,
      thumbLocalPath: _0x5ddb12
    } = _0x4dd882(_0x20294a);
    const _0x9d37aa = [_0x49d019, _0x5ddb12].filter(Boolean);
    if (_0x9d37aa.length === 0) {
      return false;
    }
    for (const _0x34352d of _0x9d37aa) {
      try {
        if (!(await _0x22cc15.checkLocalMediaExists(_0x34352d))) {
          return true;
        }
      } catch {
        return true;
      }
    }
    return false;
  }
  async function _0x413ad3(_0x3e85ec) {
    if (_0x5cdf4b(_0x3e85ec)) {
      return true;
    }
    if (_0x37f9bf(_0x3e85ec)) {
      return false;
    }
    return await _0x55304d(_0x3e85ec);
  }
  async function _0x50cbcd(_0x21df87) {
    const _0x46f655 = [];
    for (const _0x1b24b7 of Object.values(_0x21df87 || {})) {
      if (!_0x1b24b7) {
        continue;
      }
      const _0x8363b0 = String(_0x1b24b7.type || "").trim();
      if (_0x8363b0 === "source-image") {
        if (await _0x413ad3(_0x1b24b7)) {
          _0x46f655.push({
            nodeId: _0x1b24b7.id,
            idx: -1,
            nodeType: _0x8363b0,
            localPath: _0x101d14(_0x1b24b7)
          });
        }
        continue;
      }
      if (_0x8363b0 !== "ai-image") {
        continue;
      }
      const _0x2c9e85 = Array.isArray(_0x1b24b7.images) ? _0x1b24b7.images : [];
      if (_0x2c9e85.length > 0) {
        for (let _0x26cea3 = 0; _0x26cea3 < _0x2c9e85.length; _0x26cea3 += 1) {
          const _0x2c1af8 = _0x2c9e85[_0x26cea3] || {};
          if (!(await _0x413ad3(_0x2c1af8))) {
            continue;
          }
          _0x46f655.push({
            nodeId: _0x1b24b7.id,
            idx: _0x26cea3,
            nodeType: _0x8363b0,
            localPath: _0x101d14(_0x2c1af8)
          });
        }
        continue;
      }
      if (await _0x413ad3(_0x1b24b7)) {
        _0x46f655.push({
          nodeId: _0x1b24b7.id,
          idx: -1,
          nodeType: _0x8363b0,
          localPath: _0x101d14(_0x1b24b7)
        });
      }
    }
    return _0x46f655;
  }
  function _0x14ba48(_0x234687, _0xa00bd5) {
    if (!_0x234687) {
      return false;
    }
    if (_0xa00bd5.idx >= 0) {
      const _0xc6a26e = Array.isArray(_0x234687.images) ? _0x234687.images : [];
      const _0x2e0060 = _0xc6a26e[_0xa00bd5.idx];
      if (!_0x2e0060) {
        return false;
      }
      return _0x101d14(_0x2e0060) === _0xa00bd5.localPath;
    }
    return _0x101d14(_0x234687) === _0xa00bd5.localPath;
  }
  function _0x56b347(_0x198686, _0x20fe35) {
    const _0x139052 = buildImageNodeStorageFields(_0x20fe35);
    if (!_0x139052.displayLocalPath && !_0x139052.thumbLocalPath) {
      return false;
    }
    const _0x3d1e3b = _0x55553e.getStateRaw()?.nodes?.[_0x198686.nodeId];
    if (!_0x14ba48(_0x3d1e3b, _0x198686)) {
      return false;
    }
    const _0x524e38 = {};
    if (_0x198686.idx >= 0) {
      const _0x126fe1 = Array.isArray(_0x3d1e3b.images) ? _0x3d1e3b.images.slice() : [];
      if (!_0x126fe1[_0x198686.idx]) {
        return false;
      }
      _0x126fe1[_0x198686.idx] = {
        ...(_0x126fe1[_0x198686.idx] || {}),
        ..._0x139052,
        originalWidth: Number(_0x20fe35?.originalWidth || 0) || _0x126fe1[_0x198686.idx]?.originalWidth,
        originalHeight: Number(_0x20fe35?.originalHeight || 0) || _0x126fe1[_0x198686.idx]?.originalHeight
      };
      _0x524e38.images = _0x126fe1;
      if ((_0x3d1e3b.mainImageIndex || 0) === _0x198686.idx) {
        Object.assign(_0x524e38, {
          ..._0x139052,
          originalWidth: Number(_0x20fe35?.originalWidth || 0) || _0x3d1e3b.originalWidth,
          originalHeight: Number(_0x20fe35?.originalHeight || 0) || _0x3d1e3b.originalHeight
        });
      }
    } else {
      Object.assign(_0x524e38, {
        ..._0x139052,
        originalWidth: Number(_0x20fe35?.originalWidth || 0) || _0x3d1e3b.originalWidth,
        originalHeight: Number(_0x20fe35?.originalHeight || 0) || _0x3d1e3b.originalHeight
      });
    }
    if (Object.keys(_0x524e38).length === 0) {
      return false;
    }
    _0x55553e.updateNodeData(_0x198686.nodeId, _0x524e38);
    return true;
  }
  async function _0x141d81(_0x4cf601, _0x1834bc = 10) {
    if (typeof _0x22cc15?.saveRemoteImageLocallyDetailed !== "function" && typeof _0x22cc15?.saveRemoteImageLocally !== "function") {
      return;
    }
    if (!_0x4cf601 || window.currentProjectId !== _0x4cf601) {
      return;
    }
    const _0x473183 = _0x2f20ce(_0x55553e.getStateRaw()?.nodes || {});
    if (_0x473183.length === 0) {
      return;
    }
    window.showToast?.(t("projectLifecycle.historicalAiLocalizationStarted", {
      count: _0x473183.length
    }), "info");
    let _0x42de3c = 0;
    await _0x39e41e();
    for (let _0x5bc98a = 0; _0x5bc98a < _0x473183.length; _0x5bc98a += _0x1834bc) {
      if (window.currentProjectId !== _0x4cf601) {
        return;
      }
      const _0x5dbf71 = _0x473183.slice(_0x5bc98a, _0x5bc98a + _0x1834bc);
      for (const _0x17b2ee of _0x5dbf71) {
        if (window.currentProjectId !== _0x4cf601) {
          return;
        }
        try {
          const _0x2d535e = typeof _0x22cc15.saveRemoteImageLocallyDetailed === "function" ? await _0x22cc15.saveRemoteImageLocallyDetailed(_0x17b2ee.remote, _0x4cf601) : await _0x22cc15.saveRemoteImageLocally(_0x17b2ee.remote, _0x4cf601);
          if (_0x32d1dc(_0x17b2ee, _0x2d535e)) {
            _0x42de3c += 1;
          }
        } catch {}
      }
      if (_0x5bc98a + _0x1834bc < _0x473183.length) {
        await _0x39e41e();
      }
    }
    if (window.currentProjectId !== _0x4cf601) {
      return;
    }
    if (_0x42de3c > 0) {
      window.showToast?.(t("projectLifecycle.historicalAiLocalizationFixed", {
        count: _0x42de3c
      }), "success");
    }
  }
  async function _0x4772f9(_0x45360b, _0x4ed938 = 10) {
    if (typeof _0x22cc15?.ensureLocalImageDerivatives !== "function") {
      return;
    }
    if (!_0x45360b || window.currentProjectId !== _0x45360b) {
      return;
    }
    const _0x4551e5 = await _0x50cbcd(_0x55553e.getStateRaw()?.nodes || {});
    if (_0x4551e5.length === 0) {
      return;
    }
    let _0x4fa817 = 0;
    await _0x39e41e();
    for (let _0x53debf = 0; _0x53debf < _0x4551e5.length; _0x53debf += _0x4ed938) {
      if (window.currentProjectId !== _0x45360b) {
        return;
      }
      const _0x21a6f7 = _0x4551e5.slice(_0x53debf, _0x53debf + _0x4ed938);
      for (const _0x3d9e93 of _0x21a6f7) {
        if (window.currentProjectId !== _0x45360b) {
          return;
        }
        try {
          const _0x374369 = await _0x22cc15.ensureLocalImageDerivatives(_0x3d9e93.localPath);
          if (_0x56b347(_0x3d9e93, _0x374369)) {
            _0x4fa817 += 1;
          }
        } catch {}
      }
      if (_0x53debf + _0x4ed938 < _0x4551e5.length) {
        await _0x39e41e();
      }
    }
    if (window.currentProjectId !== _0x45360b) {
      return;
    }
    if (_0x4fa817 > 0) {
      window._triggerLocalCacheSave?.();
      window.showToast?.(t("projectLifecycle.historicalImageDerivativesFixed", {
        count: _0x4fa817
      }), "success");
    }
  }
  function _0x532c89(_0x38801a, _0x50607b = 10) {
    if (!_0x38801a) {
      return;
    }
    _0x500ed7("historicalAiLocalization queued:end");
    _0x2c17b9("historicalAiLocalization queued", "initApp:start", "historicalAiLocalization queued:end");
    _0x4977f7(() => _0x141d81(_0x38801a, _0x50607b), {
      timeout: 2500,
      delayMs: _0x4a30e7
    });
  }
  function _0xb6d409(_0x11ae31, _0x11df5e = 10) {
    if (!_0x11ae31) {
      return;
    }
    _0x4977f7(() => _0x4772f9(_0x11ae31, _0x11df5e), {
      timeout: 3200,
      delayMs: _0x3d8840
    });
  }
  window._queueLegacyThumbnailMigration = _0x575763;
  function _0x5a66ff() {
    return _0x3889d0();
  }
  window._triggerLocalCacheSave = _0x5a66ff;
  let _0x549c08 = false;
  const _0x226606 = createWorkspaceCacheIdleScheduler({
    run: _0x5a66ff,
    isBusy: () => isWorkspaceCacheInteractionBusy({
      documentRef: document,
      CanvasTabManager: _0x3ee653
    }),
    retryDelayMs: WORKSPACE_CACHE_BUSY_RETRY_MS,
    onError(_0x7e35b8) {
      console.warn("[projectLifecycle] 自动缓存保存失败:", _0x7e35b8);
    }
  });
  function _0x3dc279() {
    return _0x226606.schedule({
      delayMs: WORKSPACE_CACHE_META_DELAY_MS
    });
  }
  window._triggerLocalCacheMetaSave = _0x3dc279;
  function _0x49e3e9() {
    _0x22cc15.clearProjectPersistenceBlock?.();
    window._isAppLoaded = true;
    window._checkEmptyHint?.();
  }
  function _0x2e5229({
    pageLifecycle = false
  } = {}) {
    _0x226606.cancel();
    if (window._isAppLoaded !== true) {
      return null;
    }
    if (!pageLifecycle) {
      return _0x5a66ff();
    }
    const _0x1aefb7 = Date.now();
    if (_0x12b091) {
      return _0x12b091;
    }
    if (_0x1e5d89 > 0 && _0x1aefb7 - _0x1e5d89 < PAGE_LIFECYCLE_FLUSH_DEDUPE_MS) {
      return _0x29c5a8 || Promise.resolve(null);
    }
    const _0x31ad1f = _0x5a66ff();
    if (!_0x31ad1f || typeof _0x31ad1f.finally !== "function") {
      _0x1e5d89 = Date.now();
      return _0x31ad1f;
    }
    _0x12b091 = _0x31ad1f;
    _0x31ad1f.finally(() => {
      if (_0x12b091 === _0x31ad1f) {
        _0x1e5d89 = Date.now();
        _0x12b091 = null;
      }
    });
    return _0x31ad1f;
  }
  function _0x477085() {
    if (_0x549c08) {
      return;
    }
    _0x549c08 = true;
    _0x1958a1();
    let _0x493c97 = false;
    _0x55553e.subscribeSelector(_0x46608e => _0x46608e._persistRev, () => {
      if (!_0x493c97) {
        _0x493c97 = true;
        return;
      }
      if (window._isAppLoaded !== true) {
        return;
      }
      _0x226606.schedule({
        delayMs: WORKSPACE_CACHE_PERSIST_DELAY_MS
      });
      _0x56fc9c({
        writeRecovery: true,
        reason: "persist-rev",
        knownHasUnsavedChanges: true
      });
    });
  }
  function _0x55939d() {
    if (_0x5d62c8()) {
      _0x2a3515("beforeunload").catch(() => {});
    }
    return _0x2e5229({
      pageLifecycle: true
    });
  }
  function _0x2fba9b() {
    if (_0x5d62c8()) {
      _0x2a3515("pagehide").catch(() => {});
    }
    return _0x2e5229({
      pageLifecycle: true
    });
  }
  function _0x5a7d20() {
    if (document.visibilityState !== "hidden") {
      _0x1e5d89 = 0;
      return;
    }
    if (_0x5d62c8()) {
      _0x2a3515("visibility-hidden").catch(() => {});
    }
    return _0x2e5229({
      pageLifecycle: true
    });
  }
  async function _0x138082() {
    const _0xb3bbeb = t("projectLifecycle.projectPersistenceLoading");
    _0x22cc15.setProjectPersistenceBlocked?.(_0xb3bbeb);
    window._isAppLoaded = false;
    const _0x37c54f = document.getElementById("v2-wrap");
    const _0x4863b9 = document.getElementById("v2-canvas") || document.querySelector(".v2-canvas");
    const _0x27e989 = document.getElementById("v2-initial-loader");
    const _0x1dad4f = waitForInitialLoaderSequence({
      loader: _0x27e989,
      windowObject: window
    });
    _0x23505e();
    _0x23505e = scheduleInitialLoaderFailOpen({
      loader: _0x27e989,
      wrapEl: _0x37c54f,
      canvasEl: _0x4863b9,
      timeoutMs: INITIAL_LOADER_MAX_VISIBLE_MS,
      onTimeout: () => {
        cancelStartupLoaderGuard(window);
        window.hideGlobalLoading?.();
        console.warn("[startup] Initial loader exceeded " + INITIAL_LOADER_MAX_VISIBLE_MS + "ms and was dismissed.");
      }
    });
    try {
      _0x500ed7("initApp:start");
      _0x5eaf34();
      const _0x106869 = readDreaminaResumeBackupSync();
      const _0x4b4100 = await _0x140bc3();
      const _0x473cf4 = _0x4b4100 || (await _0x2ede19.load());
      if (_0x473cf4 && _0x473cf4.multiData && _0x473cf4.multiData.canvases && _0x473cf4.multiData.canvases.length > 0) {
        _0x55553e.updateViewport(0, 0, 1);
        _0x11dfa4(_0x473cf4);
        window.currentProjectId = _0x473cf4.projectId || "default_v2_project";
        window._v2WorkspaceProjectScoped = Number(_0x473cf4.workspaceScopeVersion) === 1;
        const _0x5e89a2 = document.getElementById("projectNameText");
        if (_0x5e89a2) {
          _0x5e89a2.textContent = _0x473cf4.projectName || getUntitledProjectName();
        }
        const _0x564353 = _0x22cc15.resolveCanvasData(mergeDreaminaResumeBackupIntoMultiData(_0x473cf4.multiData, _0x106869, _0x473cf4.projectId || window.currentProjectId));
        _0x500ed7("buildHydrationSafeMultiData:start");
        const _0x332a79 = _0x494982(_0x564353);
        _0x500ed7("buildHydrationSafeMultiData:end");
        _0x2c17b9("buildHydrationSafeMultiData", "buildHydrationSafeMultiData:start", "buildHydrationSafeMultiData:end");
        _0x500ed7("CanvasTabManager.init:start");
        _0x3ee653.init(_0x332a79, {
          markClean: false
        });
        _0x500ed7("CanvasTabManager.init:end");
        _0x2c17b9("CanvasTabManager.init", "CanvasTabManager.init:start", "CanvasTabManager.init:end");
        _0x575763({
          projectId: window.currentProjectId,
          projectName: _0x473cf4.projectName || getUntitledProjectName(),
          multiData: _0x564353
        });
        _0x49e3e9();
        _0x56fc9c({
          writeRecovery: _0x473cf4.recovery === true,
          reason: "startup"
        });
        _0x32b207();
        _0x27e989?.setAttribute?.("data-app-ready", "true");
        await _0x1dad4f;
        await _0x5a5a04({
          wrapEl: _0x37c54f,
          canvasEl: _0x4863b9,
          animate: false,
          afterHidden: () => {
            _0x532c89(window.currentProjectId);
            _0xb6d409(window.currentProjectId);
          }
        });
        return;
      }
      if (_0x4863b9) {
        _0x4863b9.style.transition = "none";
        _0x4863b9.offsetHeight;
      }
      _0x55553e.updateViewport(0, 0, 1);
      if (window.showGlobalLoading) {
        window.showGlobalLoading(t("projectLifecycle.loadingWorkspaceFiles"));
      }
      const _0x45af5d = window.currentProjectId || "default_v2_project";
      window.currentProjectId = _0x45af5d;
      window._v2WorkspaceProjectScoped = true;
      _0x500ed7("project.loadProject:start");
      const _0x28c0d8 = await _0x22cc15.loadProject(_0x45af5d, {
        allowMissing: _0x45af5d === "default_v2_project"
      });
      const _0x4ecfd8 = mergeDreaminaResumeBackupIntoMultiData(_0x28c0d8, _0x106869, _0x45af5d);
      _0x500ed7("project.loadProject:end");
      _0x2c17b9("project.loadProject", "project.loadProject:start", "project.loadProject:end");
      _0x500ed7("buildHydrationSafeMultiData:start");
      const _0x3f3155 = _0x494982(_0x4ecfd8);
      _0x500ed7("buildHydrationSafeMultiData:end");
      _0x2c17b9("buildHydrationSafeMultiData", "buildHydrationSafeMultiData:start", "buildHydrationSafeMultiData:end");
      _0x500ed7("CanvasTabManager.init:start");
      _0x3ee653.init(_0x3f3155);
      _0x500ed7("CanvasTabManager.init:end");
      _0x2c17b9("CanvasTabManager.init", "CanvasTabManager.init:start", "CanvasTabManager.init:end");
      _0x575763({
        projectId: _0x45af5d,
        projectName: document.getElementById("projectNameText")?.textContent || getDefaultCanvasName(),
        multiData: _0x4ecfd8
      });
      _0x1d0574();
      _0x49e3e9();
      _0x56fc9c({
        writeRecovery: false,
        reason: "startup"
      });
      const _0x58fa88 = document.getElementById("projectNameText");
      if (_0x58fa88) {
        _0x58fa88.textContent = getDefaultCanvasName();
      }
      const _0x96885a = _0x3ee653.getActiveCanvasId?.() || _0x3ee653._activeId;
      if (_0x96885a) {
        _0x3ee653.setCanvasProjectContext?.(_0x96885a, {
          ...(_0x3ee653.getCanvasProjectContext?.(_0x96885a) || {}),
          projectId: _0x45af5d,
          filename: window._v2CurrentFile || "",
          projectName: getDefaultCanvasName(),
          isTemporary: false,
          workspaceProjectScoped: true
        }, {
          persist: false
        });
      }
      _0x27e989?.setAttribute?.("data-app-ready", "true");
      await _0x1dad4f;
      await _0x5a5a04({
        wrapEl: _0x37c54f,
        canvasEl: _0x4863b9,
        animate: true,
        afterHidden: () => {
          _0x532c89(_0x45af5d);
          _0xb6d409(_0x45af5d);
        }
      });
    } catch (_0x40582c) {
      console.error("Failed to init app:", _0x40582c);
      const _0x56f390 = t("projectLifecycle.projectPersistenceLoadFailed");
      _0x22cc15.setProjectPersistenceBlocked?.(_0x56f390);
      window._isAppLoaded = false;
      window.showToast?.(_0x56f390, "error");
      await _0x1dad4f;
      await _0x5a5a04({
        wrapEl: _0x37c54f,
        canvasEl: _0x4863b9,
        animate: true,
        imageFirst: false
      });
    }
  }
  function _0x56801e(_0x16113a) {
    const _0x51ce4a = _0x16113a?.dataTransfer?.types;
    return !!_0x51ce4a && Array.from(_0x51ce4a).includes("Files");
  }
  function _0x3cf9fa(_0x4f427d) {
    if (!_0x56801e(_0x4f427d)) {
      return false;
    }
    _0x4f427d.preventDefault();
    if (_0x4f427d.dataTransfer) {
      _0x4f427d.dataTransfer.dropEffect = "copy";
    }
    return true;
  }
  function _0x2400c0(_0x3e8d74) {
    _0x3cf9fa(_0x3e8d74);
  }
  function _0x55ae5e(_0x11ae3f) {
    if (_0x3cf9fa(_0x11ae3f)) {
      return;
    }
    _0x11ae3f.preventDefault();
  }
  function _0x74fb85(_0x488aae) {
    _0x488aae.preventDefault();
    const _0xb6d71e = _0x488aae.dataTransfer.files[0];
    if (!_0xb6d71e) {
      return;
    }
    if (/\.aicpkg$/i.test(_0xb6d71e.name || "")) {
      const _0x22602b = window._v2ImportProjectPackageByPath;
      if (typeof _0x22602b !== "function") {
        window.showToast?.(t("projectLifecycle.packageUnsupported"), "error");
        return;
      }
      let _0x3dfe7b = "";
      try {
        _0x3dfe7b = String(desktopBridge.assetImport.getPathForFile(_0xb6d71e) || "").trim();
      } catch {
        _0x3dfe7b = "";
      }
      if (!_0x3dfe7b) {
        const _0x457328 = window._v2ImportProjectPackageFile;
        if (typeof _0x457328 === "function") {
          _0x457328(_0xb6d71e);
          return;
        }
        window.showToast?.(t("projectLifecycle.packagePathMissing"), "error");
        return;
      }
      _0x22602b(_0x3dfe7b);
      return;
    }
    if (!isCanvasProjectFileName(_0xb6d71e.name)) {
      return;
    }
    const _0x11be92 = new FileReader();
    _0x11be92.onload = async _0x2ea393 => {
      try {
        const _0x5ddda2 = JSON.parse(_0x2ea393.target.result);
        const _0xdb076d = _0x22cc15.resolveCanvasData(_0x5ddda2);
        const _0x352f18 = _0x494982(_0xdb076d);
        const _0x286346 = _0x352f18.canvases.find(_0x39f50e => _0x39f50e.id === _0x352f18.activeCanvasId) || _0x352f18.canvases[0];
        if (!_0x286346) {
          throw new Error("Project file has no canvas");
        }
        const _0x330e10 = stripCanvasProjectFileExtension(_0xb6d71e.name) || _0x286346.name;
        const _0xfc5a13 = _0x3ee653.findCanvasIdByProjectIdentity?.({
          projectId: _0x330e10,
          filename: _0xb6d71e.name
        }) || "";
        if (_0xfc5a13) {
          await _0x3ee653.switchTo?.(_0xfc5a13);
          return;
        }
        const _0x5b6acd = buildUniqueCanvasName(_0x330e10, _0x3ee653._canvases, {
          fallbackName: getUntitledCanvasName()
        });
        if ((await _0x3ee653.addCanvas()) === false) {
          return;
        }
        _0x3ee653.renameCanvas(_0x3ee653._activeId, _0x5b6acd);
        const _0x20878d = {
          ..._0x286346,
          name: _0x5b6acd
        };
        _0x58cc01(_0x20878d);
        _0x3ee653.hydrateActiveCanvasSnapshot(_0x20878d);
        _0x3ee653.setCanvasProjectContext?.(_0x3ee653._activeId, {
          projectId: _0x330e10,
          filename: _0xb6d71e.name,
          projectName: _0x5b6acd,
          isTemporary: false,
          workspaceProjectScoped: true
        });
        _0x3ee653.markCanvasClean(_0x3ee653._activeId);
        _0x32b207();
        _0x49e3e9();
        _0x3ee653.renderTabs();
        _0x575763({
          projectId: _0x330e10,
          projectName: _0x5b6acd,
          multiData: _0xdb076d
        });
        _0xb6d409(_0x330e10);
        window.showToast?.(t("projectLifecycle.localArchiveLoaded", {
          name: _0x5b6acd
        }));
      } catch (_0x4c2019) {
        console.error("[Drop] 读取本地 JSON 失败:", _0x4c2019);
        window.showToast?.(t("projectLifecycle.jsonArchiveParseFailed"), "error");
      }
    };
    _0x11be92.readAsText(_0xb6d71e);
  }
  function _0x4537a9(_0x4c0521) {
    const _0x83727e = String(_0x4c0521 || "").replace(/\s+/g, " ").trim();
    if (!_0x83727e) {
      return false;
    }
    const _0x24cd5b = _0x3ee653.getActiveCanvasId?.() || _0x3ee653._activeId;
    if (!_0x24cd5b) {
      return false;
    }
    _0x3ee653.renameCanvas?.(_0x24cd5b, _0x83727e);
    const _0x4e86ac = _0x3ee653.getCanvasProjectContext?.(_0x24cd5b);
    if (_0x4e86ac) {
      _0x3ee653.setCanvasProjectContext?.(_0x24cd5b, {
        ..._0x4e86ac,
        projectName: _0x83727e
      });
    }
    const _0x370fe5 = document.getElementById("projectNameText");
    if (_0x370fe5) {
      _0x370fe5.textContent = _0x83727e;
    }
    _0x5a66ff();
    return _0x83727e;
  }
  function _0x22a2bc() {
    const _0x5dbe3c = document.getElementById("projectNameText");
    if (!_0x5dbe3c) {
      return;
    }
    const _0x4b93c5 = () => {
      const _0x44197f = _0x4537a9(_0x5dbe3c.textContent);
      if (_0x44197f) {
        _0x5dbe3c.textContent = _0x44197f;
      }
    };
    _0x5dbe3c.addEventListener("blur", _0x4b93c5);
    _0x5dbe3c.addEventListener("keydown", _0x5e17e6 => {
      if (_0x5e17e6.key === "Enter") {
        _0x5e17e6.preventDefault();
        _0x5dbe3c.blur();
      }
    });
  }
  return {
    V2LocalCache: _0x2ede19,
    projectWorkspaceSessions: _0x11bdc7,
    initApp: _0x138082,
    onBeforeUnload: _0x55939d,
    onPageHide: _0x2fba9b,
    onVisibilityChange: _0x5a7d20,
    onDocumentDragEnter: _0x2400c0,
    onDocumentDragOver: _0x55ae5e,
    onDocumentDrop: _0x74fb85,
    triggerLocalCacheSave: _0x5a66ff,
    flushPendingLocalCacheSaveNow: _0x2e5229,
    resumeProjectPersistenceAfterHydration: _0x49e3e9,
    renameCurrentProject: _0x4537a9,
    bindPersistRevisionAutoSave: _0x477085,
    bindHeaderProjectNameAutoSave: _0x22a2bc
  };
}