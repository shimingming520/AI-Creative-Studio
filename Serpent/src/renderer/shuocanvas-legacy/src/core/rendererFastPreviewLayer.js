import { resolveCanvasVideoDisplayUrl, toCanvasLocalUrl } from "../services/canvasMediaLocalService.js";
import { cancelQueuedCanvasImagePreloads, forgetCanvasImageDisplayLoad, isCanvasImageDisplayLoadTracked, isCanvasImagePreloadCoolingDown, isCanvasImagePreloadPending, isCanvasImagePreloadSharedImage, rememberCanvasImagePreloadResolved, preloadCanvasImage, trackCanvasImageDisplayLoad } from "../modules/canvasMediaScheduler.js";
import { isPerfProbeEnabled, recordFastPreviewSample } from "../modules/perf/perfProbe.js";
import { buildCanvasImageResultIdentityKey, versionCanvasImageDisplayUrl } from "../modules/canvasImageLod.js";
import { isTaskCancelled, isTaskFailed, shouldShowGenerationBusyUi } from "./generationTaskUiState.js";
import { isRendererFastPreviewGeometryVisible, planRendererFastPreviewAdmission, resolveRendererFastPreviewMediaQueuePriority } from "./rendererFastPreviewAdmission.js";
const FAST_PREVIEW_NODE_COUNT_THRESHOLD = 48;
const FAST_PREVIEW_CANDIDATE_THRESHOLD = 16;
const FAST_PREVIEW_MEDIA_SRC_BATCH_SIZE = 12;
const FAST_PREVIEW_FALLBACK_NODE_CREATE_BATCH_SIZE = 80;
const FAST_PREVIEW_LARGE_CANDIDATE_COUNT = 180;
const FAST_PREVIEW_HUGE_CANDIDATE_COUNT = 360;
const FAST_PREVIEW_LARGE_MEDIA_SRC_BATCH_SIZE = 10;
const FAST_PREVIEW_HUGE_MEDIA_SRC_BATCH_SIZE = 8;
const FAST_PREVIEW_BUSY_MEDIA_SRC_BATCH_SIZE = 8;
const FAST_PREVIEW_VIDEO_MEDIA_SRC_BATCH_SIZE = 8;
const FAST_PREVIEW_LARGE_VIDEO_MEDIA_SRC_BATCH_SIZE = 6;
const FAST_PREVIEW_HUGE_VIDEO_MEDIA_SRC_BATCH_SIZE = 4;
const FAST_PREVIEW_BUSY_VIDEO_MEDIA_SRC_BATCH_SIZE = 2;
const FAST_PREVIEW_BUSY_HINT_TTL_MS = 180;
const FAST_PREVIEW_BUSY_MEDIA_SRC_RETRY_MS = 64;
const FAST_PREVIEW_MEDIA_PRELOAD_PRIORITY = 45;
const FAST_PREVIEW_LOW_PRIORITY_MEDIA_PRELOAD_PRIORITY = 25;
const FAST_PREVIEW_BUSY_MEDIA_PRELOAD_PRIORITY = 20;
const FAST_PREVIEW_VIEWPORT_BUSY_PRELOAD_CANCEL_PRIORITY_LIMIT = 80;
const FAST_PREVIEW_NODE_POOL_LIMIT = 320;
const FAST_PREVIEW_DETACHED_NODE_CACHE_LIMIT = 240;
const FAST_PREVIEW_DETACHED_IN_FLIGHT_CACHE_LIMIT = 520;
const FAST_PREVIEW_LAYER_PADDING = 96;
const FAST_PREVIEW_MEDIA_PRELOAD_SCOPE = "renderer-fast-preview-media";
const FAST_PREVIEW_MOTION_MIN_DISTANCE_SQ = 4;
const FAST_PREVIEW_AUDIO_WAVE_PATH = "M10,40 L10,40 M15,30 L15,50 M20,20 L20,60 M25,35 L25,45 M30,25 L30,55 M35,15 L35,65 M40,30 L40,50 M45,38 L45,42 M50,22 L50,58 M55,18 L55,62 M60,28 L60,52 M65,32 L65,48 M70,24 L70,56 M75,36 L75,44 M80,20 L80,60 M85,16 L85,64 M90,26 L90,54 M95,34 L95,46 M100,22 L100,58 M105,18 L105,62 M110,30 L110,50 M115,38 L115,42 M120,15 L120,65 M125,25 L125,55 M130,35 L130,45 M135,20 L135,60 M140,30 L140,50 M145,40 L145,40 M150,25 L150,55 M155,15 L155,65 M160,30 L160,50 M165,38 L165,42 M170,22 L170,58 M175,18 L175,62 M180,28 L180,52 M185,32 L185,48 M190,24 L190,56";
function toNumber(_0x43e2a, _0x49fd3e = 0) {
  const _0x46ef99 = Number(_0x43e2a);
  if (Number.isFinite(_0x46ef99)) {
    return _0x46ef99;
  } else {
    return _0x49fd3e;
  }
}
function nowPerf() {
  if (typeof performance !== "undefined" && performance && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function isViewportInteractionBusyForPreview() {
  const _0x107552 = typeof document !== "undefined" ? document?.body?.classList : null;
  return Boolean(_0x107552?.contains?.("is-panning") || _0x107552?.contains?.("is-zooming") || _0x107552?.contains?.("is-viewport-animating"));
}
function isDirectViewportGestureBusyForPreview() {
  const _0xd288f7 = typeof document !== "undefined" ? document?.body?.classList : null;
  return Boolean(_0xd288f7?.contains?.("is-panning") || _0xd288f7?.contains?.("is-zooming"));
}
function isElementVisible(_0x364ca3) {
  if (!_0x364ca3 || _0x364ca3.isConnected === false) {
    return false;
  }
  if (_0x364ca3.hidden === true || _0x364ca3.classList?.contains?.("is-hidden")) {
    return false;
  }
  const _0x2ae15c = _0x364ca3.style || {};
  return _0x2ae15c.display !== "none" && _0x2ae15c.visibility !== "hidden" && _0x2ae15c.opacity !== "0";
}
function isMountedImageReady(_0x4aaf20) {
  const _0x144d6b = String(_0x4aaf20?.currentSrc || _0x4aaf20?.src || _0x4aaf20?.getAttribute?.("src") || "").trim();
  if (!_0x144d6b || !isElementVisible(_0x4aaf20)) {
    return false;
  }
  if (_0x4aaf20.complete === false) {
    return false;
  }
  return Number(_0x4aaf20.naturalWidth || 0) > 0 || _0x4aaf20.complete === undefined;
}
function isMountedVideoReady(_0xf9107d) {
  const _0x1b8b24 = String(_0xf9107d?.currentSrc || _0xf9107d?.src || _0xf9107d?.getAttribute?.("src") || "").trim();
  return !!_0x1b8b24 && isElementVisible(_0xf9107d) && Number(_0xf9107d.readyState || 0) >= 2;
}
function hasActiveMountedVideoPlayback(_0x17bb5c) {
  return Array.from(_0x17bb5c?.querySelectorAll?.("video") || []).some(_0xcc723d => isMountedPresentationMediaElement(_0xcc723d) && isMountedVideoReady(_0xcc723d) && _0xcc723d.paused === false && _0xcc723d.ended !== true);
}
function hasMountedMediaElement(_0x2ece08) {
  return !!_0x2ece08?.querySelector?.("img") || !!_0x2ece08?.querySelector?.("video");
}
function isMountedPresentationMediaElement(_0x422e8d) {
  const _0x36fb1e = String(_0x422e8d?.tagName || "").toLowerCase();
  const _0xed254d = _0x422e8d?.classList;
  if (_0x36fb1e === "img") {
    return !!_0xed254d?.contains?.("node-img") || !!_0xed254d?.contains?.("v2-media-preview") || !!_0xed254d?.contains?.("aigen-image-media") || !!_0xed254d?.contains?.("source-video-poster-frame") || !!_0xed254d?.contains?.("source-video-capture-preview") || !!_0xed254d?.contains?.("ai-video-deferred-poster");
  }
  if (_0x36fb1e === "video") {
    return true;
  }
  return false;
}
function isMountedMediaReady(_0xe9c4f6) {
  if (!hasMountedMediaElement(_0xe9c4f6)) {
    return false;
  }
  const _0x35244c = Array.from(_0xe9c4f6?.querySelectorAll?.("img") || []).filter(isMountedPresentationMediaElement);
  const _0x52cae0 = Array.from(_0xe9c4f6?.querySelectorAll?.("video") || []).filter(isMountedPresentationMediaElement);
  if (_0x35244c.length === 0 && _0x52cae0.length === 0) {
    return false;
  }
  for (const _0x3e304e of _0x35244c) {
    if (isMountedImageReady(_0x3e304e)) {
      return true;
    }
  }
  for (const _0x46bef7 of _0x52cae0) {
    if (isMountedVideoReady(_0x46bef7)) {
      return true;
    }
  }
  return false;
}
function isFastPreviewReleasedForPlayback(_0x71aaa2) {
  return _0x71aaa2?.dataset?.fastPreviewReleasedForPlayback === "1";
}
function getPreviewKind(_0x45fdf8 = {}) {
  const _0x1011b0 = String(_0x45fdf8.type || "").toLowerCase();
  if (_0x1011b0.includes("group")) {
    return "group";
  }
  if (_0x1011b0.includes("video") || _0x1011b0.includes("media-clip")) {
    return "video";
  }
  if (_0x1011b0.includes("image")) {
    return "image";
  }
  if (_0x1011b0.includes("audio")) {
    return "audio";
  }
  if (_0x1011b0.includes("text") || _0x1011b0.includes("comment")) {
    return "text";
  }
  return "node";
}
function isWebPreviewNode(_0x4a1927 = {}) {
  return String(_0x4a1927?.type || "").trim().toLowerCase() === "web-preview";
}
function getPreviewText(_0x354e7b = {}, _0x1b6a99 = "node") {
  const _0x53b48a = _0x1b6a99 === "image" ? "Image" : _0x1b6a99 === "video" ? "Video" : _0x1b6a99 === "audio" ? "Audio" : _0x1b6a99 === "text" ? "Text" : "Node";
  return String(_0x354e7b.name || _0x354e7b.title || _0x354e7b.prompt || _0x354e7b.text || _0x53b48a).replace(/\s+/g, " ").trim().slice(0, _0x1b6a99 === "text" ? 160 : 48);
}
function getPrimaryListItem(_0x3c3bd6, _0x15c121 = 0) {
  if (!Array.isArray(_0x3c3bd6) || _0x3c3bd6.length === 0) {
    return null;
  }
  const _0xb190fe = Math.max(0, Math.trunc(Number(_0x15c121) || 0));
  return _0x3c3bd6[_0xb190fe] || _0x3c3bd6[0] || null;
}
function getPrimaryListItemIndex(_0x5e7114, _0x1ce592 = 0) {
  if (!Array.isArray(_0x5e7114) || _0x5e7114.length === 0) {
    return 0;
  }
  return Math.max(0, Math.min(_0x5e7114.length - 1, Math.trunc(Number(_0x1ce592) || 0)));
}
function firstLocalPreviewUrl(_0x30d1b8 = []) {
  for (const _0x5ca040 of _0x30d1b8) {
    const _0x25cef4 = toCanvasLocalUrl(_0x5ca040);
    if (_0x25cef4) {
      return _0x25cef4;
    }
  }
  return "";
}
function uniquePreviewUrls(_0x152f64 = []) {
  const _0x206aae = [];
  const _0x556796 = new Set();
  for (const _0x17bde9 of _0x152f64) {
    const _0x3d647f = String(_0x17bde9 || "").trim();
    if (!_0x3d647f || _0x556796.has(_0x3d647f)) {
      continue;
    }
    _0x556796.add(_0x3d647f);
    _0x206aae.push(_0x3d647f);
  }
  return _0x206aae;
}
function isLikelyImagePreviewUrl(_0x51f02e) {
  const _0xbc36ed = String(_0x51f02e || "").trim();
  if (!_0xbc36ed) {
    return false;
  }
  if (/^(data:image\/|blob:)/i.test(_0xbc36ed)) {
    return true;
  }
  return /\.(?:png|jpe?g|webp|gif|avif|bmp)(?:[?#].*)?$/i.test(_0xbc36ed);
}
function normalizeViewport(_0x15cbd0 = {}) {
  const _0x1ff794 = Number(_0x15cbd0?.zoom);
  return {
    x: Number.isFinite(Number(_0x15cbd0?.x)) ? Number(_0x15cbd0.x) : 0,
    y: Number.isFinite(Number(_0x15cbd0?.y)) ? Number(_0x15cbd0.y) : 0,
    zoom: Number.isFinite(_0x1ff794) && _0x1ff794 > 0 ? _0x1ff794 : 1
  };
}
function getViewportContainerSize(_0x23fdd9 = {}) {
  return {
    width: Math.max(1, Number(_0x23fdd9.containerWidth ?? _0x23fdd9.containerW) || (typeof window !== "undefined" ? Number(window.innerWidth) : 0) || 1600),
    height: Math.max(1, Number(_0x23fdd9.containerHeight ?? _0x23fdd9.containerH) || (typeof window !== "undefined" ? Number(window.innerHeight) : 0) || 900)
  };
}
function getViewportWorldCenter(_0x1e655d = {}) {
  const _0x48c61a = normalizeViewport(_0x1e655d.viewport);
  const {
    width: _0xca46ed,
    height: _0x2357c8
  } = getViewportContainerSize(_0x1e655d);
  return {
    x: ((0 - _0x48c61a.x) / _0x48c61a.zoom + (_0xca46ed - _0x48c61a.x) / _0x48c61a.zoom) / 2,
    y: ((0 - _0x48c61a.y) / _0x48c61a.zoom + (_0x2357c8 - _0x48c61a.y) / _0x48c61a.zoom) / 2
  };
}
function resolveMediaSrcBatchSize(_0x3c5e6e, _0x55dbef = {}) {
  if (_0x55dbef.viewportBusy === true) {
    return FAST_PREVIEW_BUSY_MEDIA_SRC_BATCH_SIZE;
  }
  if (_0x3c5e6e >= FAST_PREVIEW_HUGE_CANDIDATE_COUNT) {
    return FAST_PREVIEW_HUGE_MEDIA_SRC_BATCH_SIZE;
  }
  if (_0x3c5e6e >= FAST_PREVIEW_LARGE_CANDIDATE_COUNT) {
    return FAST_PREVIEW_LARGE_MEDIA_SRC_BATCH_SIZE;
  }
  return FAST_PREVIEW_MEDIA_SRC_BATCH_SIZE;
}
function resolveVideoMediaSrcBatchSize(_0x12b4cb, _0x128666 = {}) {
  if (_0x128666.viewportBusy === true) {
    return FAST_PREVIEW_BUSY_VIDEO_MEDIA_SRC_BATCH_SIZE;
  }
  if (_0x12b4cb >= FAST_PREVIEW_HUGE_CANDIDATE_COUNT) {
    return FAST_PREVIEW_HUGE_VIDEO_MEDIA_SRC_BATCH_SIZE;
  }
  if (_0x12b4cb >= FAST_PREVIEW_LARGE_CANDIDATE_COUNT) {
    return FAST_PREVIEW_LARGE_VIDEO_MEDIA_SRC_BATCH_SIZE;
  }
  return FAST_PREVIEW_VIDEO_MEDIA_SRC_BATCH_SIZE;
}
function getExplicitImagePreviewUrls(_0x370dfe = {}, {
  displayFirst = false,
  displayVersionKey = ""
} = {}) {
  _0x370dfe = _0x370dfe && typeof _0x370dfe === "object" ? _0x370dfe : {};
  const _0x3c8a90 = firstLocalPreviewUrl([_0x370dfe.thumbLocalPath, _0x370dfe.previewLocalPath, _0x370dfe.thumbnailLocalPath, _0x370dfe.thumbUrl, _0x370dfe.previewUrl, _0x370dfe.thumbnailUrl]);
  const _0x29e9b9 = versionCanvasImageDisplayUrl(firstLocalPreviewUrl([_0x370dfe.displayLocalPath, _0x370dfe.displayUrl, _0x370dfe.imageUrl]), displayVersionKey);
  if (displayFirst) {
    return [_0x29e9b9, _0x3c8a90];
  } else {
    return [_0x3c8a90, _0x29e9b9];
  }
}
function getExplicitVideoPreviewUrls(_0x3b4a9d = {}) {
  _0x3b4a9d = _0x3b4a9d && typeof _0x3b4a9d === "object" ? _0x3b4a9d : {};
  return [_0x3b4a9d.posterLocalPath, _0x3b4a9d.thumbLocalPath, _0x3b4a9d.previewLocalPath, _0x3b4a9d.thumbnailLocalPath, _0x3b4a9d.videoThumbSrc, _0x3b4a9d.posterUrl, _0x3b4a9d.thumbUrl, _0x3b4a9d.previewUrl, _0x3b4a9d.thumbnailUrl].map(_0x2cbac6 => toCanvasLocalUrl(_0x2cbac6)).filter(isLikelyImagePreviewUrl);
}
function getPreviewMediaUrls(_0xceaf1a = {}, _0x1d9c97 = "node", {
  displayFirst = false
} = {}) {
  if (_0x1d9c97 === "image") {
    const _0x4dddab = getPrimaryListItemIndex(_0xceaf1a.images, _0xceaf1a.mainImageIndex);
    const _0x389068 = getPrimaryListItem(_0xceaf1a.images, _0xceaf1a.mainImageIndex);
    const _0x17d9b3 = displayFirst && String(_0xceaf1a.type || "").toLowerCase().includes("ai-image") ? buildCanvasImageResultIdentityKey(_0x389068 || {}, _0xceaf1a, _0x4dddab) : "";
    return uniquePreviewUrls([...getExplicitImagePreviewUrls(_0xceaf1a, {
      displayFirst: displayFirst,
      displayVersionKey: _0x17d9b3
    }), ...getExplicitImagePreviewUrls(_0x389068, {
      displayFirst: displayFirst,
      displayVersionKey: _0x17d9b3
    })]);
  }
  if (_0x1d9c97 === "video") {
    const _0x35edec = getPrimaryListItem(_0xceaf1a.videos, _0xceaf1a.mainVideoIndex);
    const _0x2db34b = Array.isArray(_0xceaf1a.videos) ? _0xceaf1a.videos.length : 0;
    const _0x225746 = String(_0xceaf1a.type || "").trim().toLowerCase() === "ai-video";
    if (_0x225746 && (isTaskFailed(_0xceaf1a) || isTaskCancelled(_0xceaf1a) || !!String(_0x35edec?.error || "").trim())) {
      return [];
    }
    return uniquePreviewUrls([...getExplicitVideoPreviewUrls(_0x35edec), ...(_0x2db34b <= 1 ? getExplicitVideoPreviewUrls(_0xceaf1a) : [])]);
  }
  return [];
}
function getNodePresentationMediaUrls(_0x40ce30 = {}) {
  const _0xbc69e = getPreviewKind(_0x40ce30);
  const _0x143a17 = [...getPreviewMediaUrls(_0x40ce30, _0xbc69e, {
    displayFirst: false
  }), ...getPreviewMediaUrls(_0x40ce30, _0xbc69e, {
    displayFirst: true
  })];
  if (_0xbc69e === "video") {
    const _0x35e5e0 = getPrimaryListItem(_0x40ce30.videos, _0x40ce30.mainVideoIndex);
    const _0x3c6b11 = resolveCanvasVideoDisplayUrl(_0x35e5e0 || {});
    if (_0x3c6b11) {
      _0x143a17.push(_0x3c6b11);
    }
    if (!_0x35e5e0 || Array.isArray(_0x40ce30.videos) && _0x40ce30.videos.length <= 1) {
      const _0x491bbf = resolveCanvasVideoDisplayUrl(_0x40ce30);
      if (_0x491bbf) {
        _0x143a17.push(_0x491bbf);
      }
    }
  }
  return uniquePreviewUrls(_0x143a17);
}
function readPresentationMediaSource(_0x34261d) {
  return String(_0x34261d?.dataset?.desktopMediaSourceUrl || _0x34261d?.getAttribute?.("src") || _0x34261d?.currentSrc || _0x34261d?.src || "").trim();
}
function canonicalizePresentationMediaSource(_0x906e2e) {
  const _0x191c56 = String(_0x906e2e || "").trim();
  if (!_0x191c56) {
    return "";
  }
  if (/^(?:blob:|data:|aic-local-preview:)/i.test(_0x191c56)) {
    return _0x191c56;
  }
  if (typeof URL !== "function") {
    return _0x191c56;
  }
  const _0x52e4f1 = String(globalThis.document?.baseURI || globalThis.location?.href || globalThis.location?.origin || "http://localhost/");
  try {
    return new URL(_0x191c56, _0x52e4f1).href;
  } catch {
    return _0x191c56;
  }
}
function isPresentationMediaSourceForNode(_0x373062, _0x1618af) {
  if (!_0x1618af) {
    return true;
  }
  const _0x27d3ab = readPresentationMediaSource(_0x373062);
  if (!_0x27d3ab) {
    return false;
  }
  const _0x34bc0e = getNodePresentationMediaUrls(_0x1618af);
  if (_0x34bc0e.includes(_0x27d3ab)) {
    return true;
  }
  const _0x2ad36b = canonicalizePresentationMediaSource(_0x27d3ab);
  return _0x34bc0e.some(_0x4fe710 => canonicalizePresentationMediaSource(_0x4fe710) === _0x2ad36b);
}
export function resolveRendererPreviewNodePresentation(_0x322194 = {}, {
  displayFirst = false
} = {}) {
  const _0x4b052f = getPreviewKind(_0x322194);
  return {
    kind: _0x4b052f,
    text: getPreviewText(_0x322194, _0x4b052f),
    geometry: getPreviewGeometry(_0x322194),
    sources: getPreviewMediaUrls(_0x322194, _0x4b052f, {
      displayFirst: displayFirst
    })
  };
}
function shouldUseFastPreviewLayer(_0x3cd0be, _0x3e1d3b, _0x594760 = {}) {
  const _0x4818c7 = Number.isFinite(_0x594760.nodeCount) ? _0x594760.nodeCount : Object.keys(_0x3cd0be || {}).length;
  const _0x315d4b = _0x3e1d3b instanceof Set ? _0x3e1d3b.size : 0;
  if (_0x594760.previewOnly === true) {
    return _0x315d4b > 0;
  }
  return _0x4818c7 >= FAST_PREVIEW_NODE_COUNT_THRESHOLD || _0x315d4b >= FAST_PREVIEW_CANDIDATE_THRESHOLD;
}
function createEmptyStats() {
  return {
    fastPreviewCount: 0,
    visibleFastPreviewCount: 0,
    previewWithMediaCount: 0,
    deferredMountedWithPreviewCount: 0,
    stagedPreviewCount: 0,
    connectedStagedPreviewCount: 0
  };
}
function createPreviewEl(_0x4a86a1) {
  const _0x2a0407 = document.createElement("div");
  _0x2a0407.className = "v2-fast-preview-node";
  _0x2a0407.dataset.nodeId = _0x4a86a1;
  const _0x220fe4 = document.createElement("div");
  _0x220fe4.className = "v2-fast-preview-label";
  _0x2a0407.appendChild(_0x220fe4);
  return _0x2a0407;
}
function createPreviewSvgElement(_0x380eba) {
  if (typeof document.createElementNS === "function") {
    return document.createElementNS("http://www.w3.org/2000/svg", _0x380eba);
  } else {
    return document.createElement(_0x380eba);
  }
}
function setPreviewSvgAttributes(_0x1852cb, _0x5e98a8) {
  for (const [_0x33ba8c, _0x40f552] of Object.entries(_0x5e98a8)) {
    _0x1852cb.setAttribute(_0x33ba8c, _0x40f552);
  }
  return _0x1852cb;
}
function createAudioPreviewWaveform(_0x5e9b70) {
  const _0x7d4c33 = document.createElement("div");
  _0x7d4c33.className = "waveform " + _0x5e9b70;
  const _0x270ad6 = setPreviewSvgAttributes(createPreviewSvgElement("svg"), {
    width: "100%",
    height: "80",
    viewBox: "0 0 200 80",
    preserveAspectRatio: "none"
  });
  _0x270ad6.appendChild(setPreviewSvgAttributes(createPreviewSvgElement("path"), {
    d: FAST_PREVIEW_AUDIO_WAVE_PATH,
    stroke: "var(--blue)",
    "stroke-width": "2",
    "stroke-linecap": "round",
    fill: "none"
  }));
  _0x270ad6.appendChild(setPreviewSvgAttributes(createPreviewSvgElement("path"), {
    d: "M0,40 L200,40",
    stroke: "var(--blue)",
    "stroke-width": "1",
    "stroke-dasharray": "2 4",
    opacity: "0.4",
    fill: "none"
  }));
  _0x7d4c33.appendChild(_0x270ad6);
  return _0x7d4c33;
}
function getAudioPreviewDuration(_0x987063 = {}) {
  const _0x332f6d = getPrimaryListItem(_0x987063.audios, _0x987063.mainAudioIndex);
  for (const _0x52ab65 of [_0x332f6d?.audioDuration, _0x332f6d?.duration, _0x987063.audioDuration, _0x987063.duration]) {
    const _0x6b0514 = Number(_0x52ab65);
    if (Number.isFinite(_0x6b0514) && _0x6b0514 > 0) {
      return _0x6b0514;
    }
  }
  return 0;
}
function formatAudioPreviewTime(_0x121cbe) {
  const _0x51e5b4 = Math.max(0, Math.floor(Number(_0x121cbe) || 0));
  const _0x2daa72 = Math.floor(_0x51e5b4 / 3600);
  const _0x4881e4 = Math.floor(_0x51e5b4 % 3600 / 60);
  const _0x478337 = String(_0x51e5b4 % 60).padStart(2, "0");
  if (_0x2daa72 > 0) {
    return _0x2daa72 + ":" + String(_0x4881e4).padStart(2, "0") + ":" + _0x478337;
  } else {
    return _0x4881e4 + ":" + _0x478337;
  }
}
function getAudioPreviewTimeText(_0x520dbf = {}) {
  return "0:00 / " + formatAudioPreviewTime(getAudioPreviewDuration(_0x520dbf));
}
function ensureAudioPreviewContent(_0x5bf3b6, _0x3321e4, _0xa08c8) {
  let _0x5c98e8 = _0x5bf3b6.querySelector(".v2-fast-preview-audio-card");
  if (!_0x5c98e8) {
    _0x5c98e8 = document.createElement("div");
    _0x5c98e8.className = "v2-fast-preview-audio-card audio-card";
    _0x5c98e8.appendChild(createAudioPreviewWaveform("waveform-bg"));
    _0x5c98e8.appendChild(createAudioPreviewWaveform("waveform-unplayed"));
    const _0x13f9f1 = document.createElement("div");
    _0x13f9f1.className = "audio-controls";
    const _0x404cf7 = document.createElement("button");
    _0x404cf7.className = "audio-play-btn";
    _0x404cf7.setAttribute("type", "button");
    _0x404cf7.setAttribute("tabindex", "-1");
    _0x404cf7.setAttribute("aria-hidden", "true");
    const _0x250619 = setPreviewSvgAttributes(createPreviewSvgElement("svg"), {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    });
    _0x250619.appendChild(setPreviewSvgAttributes(createPreviewSvgElement("polygon"), {
      points: "5 3 19 12 5 21 5 3"
    }));
    _0x404cf7.appendChild(_0x250619);
    _0x13f9f1.appendChild(_0x404cf7);
    const _0x3d5504 = document.createElement("div");
    _0x3d5504.className = "audio-time-wrap";
    const _0x2692ec = document.createElement("span");
    _0x2692ec.className = "audio-time-display";
    _0x3d5504.appendChild(_0x2692ec);
    _0x13f9f1.appendChild(_0x3d5504);
    _0x5c98e8.appendChild(_0x13f9f1);
    _0x5bf3b6.prepend(_0x5c98e8);
  }
  const _0x16a678 = _0x5c98e8.querySelector(".audio-time-display");
  const _0x9c4f6b = getAudioPreviewTimeText(_0x3321e4);
  if (_0x16a678 && _0x16a678.textContent !== _0x9c4f6b) {
    _0x16a678.textContent = _0x9c4f6b;
  }
  const _0x2ffeb1 = _0x5bf3b6.querySelector(".v2-fast-preview-label");
  if (!_0x2ffeb1) {
    return;
  }
  _0x2ffeb1.className = "v2-fast-preview-label v2-fast-preview-audio-label node-label";
  if (_0x2ffeb1.dataset.audioPreviewLabel !== "1") {
    for (const _0x13b5c3 of Array.from(_0x2ffeb1.children || [])) {
      _0x13b5c3.remove?.();
    }
    _0x2ffeb1.textContent = "";
    const _0x4a7262 = document.createElement("span");
    _0x4a7262.className = "node-label-icon";
    _0x4a7262.dataset.labelKind = "audio";
    const _0x55d194 = document.createElement("span");
    _0x55d194.className = "node-label-text";
    _0x2ffeb1.appendChild(_0x4a7262);
    _0x2ffeb1.appendChild(_0x55d194);
    _0x2ffeb1.dataset.audioPreviewLabel = "1";
  }
  const _0x4f5686 = _0x2ffeb1.querySelector(".node-label-text");
  if (_0x4f5686 && _0x4f5686.textContent !== _0xa08c8) {
    _0x4f5686.textContent = _0xa08c8;
  }
}
function resetAudioPreviewContent(_0x3a8ffd, _0x441197) {
  _0x3a8ffd.querySelector(".v2-fast-preview-audio-card")?.remove?.();
  const _0x174367 = _0x3a8ffd.querySelector(".v2-fast-preview-label");
  if (!_0x174367) {
    return;
  }
  if (_0x174367.dataset.audioPreviewLabel === "1") {
    for (const _0x25a27f of Array.from(_0x174367.children || [])) {
      _0x25a27f.remove?.();
    }
    delete _0x174367.dataset.audioPreviewLabel;
  }
  _0x174367.className = "v2-fast-preview-label";
  if (_0x174367.textContent !== _0x441197) {
    _0x174367.textContent = _0x441197;
  }
}
function syncPreviewStaticContent(_0x31cb74, _0x159ef8, _0x27f3c0, _0x39a106) {
  if (_0x27f3c0 === "audio") {
    ensureAudioPreviewContent(_0x31cb74, _0x159ef8, _0x39a106);
  } else {
    resetAudioPreviewContent(_0x31cb74, _0x39a106);
  }
}
function getPreviewGeometry(_0x4cc526 = {}) {
  const _0x2a2c95 = toNumber(_0x4cc526.x, 0);
  const _0x599e04 = toNumber(_0x4cc526.y, 0);
  const _0x39fdc5 = Math.max(1, toNumber(_0x4cc526.width, 160));
  const _0x1dc407 = Math.max(1, toNumber(_0x4cc526.height, 120));
  return {
    x: _0x2a2c95,
    y: _0x599e04,
    width: _0x39fdc5,
    height: _0x1dc407
  };
}
function setPreviewMediaSrc(_0x13029c, _0x5597d7, _0x485b24) {
  const _0x50d6a3 = _0x5597d7[_0x485b24] || "";
  if (!_0x50d6a3) {
    return false;
  }
  _0x13029c.dataset.srcIndex = String(_0x485b24);
  if (_0x13029c.getAttribute?.("src") !== _0x50d6a3 && _0x13029c.src !== _0x50d6a3) {
    delete _0x13029c.dataset.previewLoaded;
    trackCanvasImageDisplayLoad(_0x50d6a3, _0x13029c);
    _0x13029c.src = _0x50d6a3;
  }
  return true;
}
function getPreviewMediaCurrentSrc(_0x41a70d) {
  return String(_0x41a70d?.getAttribute?.("src") || _0x41a70d?.src || "").trim();
}
function clearPreviewMediaSrc(_0x66d500) {
  if (!_0x66d500) {
    return;
  }
  forgetCanvasImageDisplayLoad(_0x66d500);
  if (isCanvasImagePreloadSharedImage(_0x66d500)) {
    _0x66d500.remove?.();
    return;
  }
  _0x66d500.removeAttribute?.("src");
  _0x66d500.src = "";
  _0x66d500._previewSources = [];
  _0x66d500._previewSrcPreloadUrl = "";
  _0x66d500._previewMediaQueuePriority = null;
  _0x66d500._previewDirectWhenBlank = false;
  _0x66d500._previewPresentedNotificationKey = "";
  if (_0x66d500.style) {
    _0x66d500.style.visibility = "";
  }
  delete _0x66d500.dataset.srcIndex;
  delete _0x66d500.dataset.previewLoaded;
  delete _0x66d500.dataset.previewKind;
  delete _0x66d500.dataset.previewCritical;
}
function isPreviewMediaLoaded(_0x21b533) {
  if (!getPreviewMediaCurrentSrc(_0x21b533)) {
    return false;
  }
  return _0x21b533?.dataset?.previewLoaded === "1" || _0x21b533?.complete === true || Number(_0x21b533?.naturalWidth || 0) > 0 || Number(_0x21b533?.naturalHeight || 0) > 0;
}
function isPreviewMediaRequestInFlight(_0x163df6) {
  return !!getPreviewMediaCurrentSrc(_0x163df6) && _0x163df6?.dataset?.previewLoaded !== "1" && _0x163df6?.complete !== true && Number(_0x163df6?.naturalWidth || 0) <= 0 && Number(_0x163df6?.naturalHeight || 0) <= 0;
}
function isPreviewMediaResourceProtected(_0x228c98) {
  return isCanvasImageDisplayLoadTracked(_0x228c98) || isPreviewMediaRequestInFlight(_0x228c98) || isCanvasImagePreloadSharedImage(_0x228c98);
}
function isPreviewVideoMedia(_0x3ed081) {
  return String(_0x3ed081?.dataset?.previewKind || "").trim() === "video";
}
function isPreviewCriticalMedia(_0x1c3698) {
  return _0x1c3698?.dataset?.previewCritical === "1";
}
function getReusableLoadedPreviewMediaSource(_0x21726c, _0x38c8f9) {
  const _0x521fd2 = _0x21726c?.querySelector?.(".v2-fast-preview-media");
  if (!isPreviewMediaLoaded(_0x521fd2)) {
    return "";
  }
  const _0x1f0a87 = getPreviewMediaCurrentSrc(_0x521fd2);
  if (!_0x1f0a87) {
    return "";
  }
  const _0x46145a = uniquePreviewUrls(Array.isArray(_0x38c8f9) ? _0x38c8f9 : [_0x38c8f9]);
  if (_0x46145a.includes(_0x1f0a87)) {
    return _0x1f0a87;
  } else {
    return "";
  }
}
function hasRetainablePaintedPreviewMedia(_0x510148, {
  includeImages = false
} = {}) {
  const _0x3544b7 = _0x510148?.querySelector?.(".v2-fast-preview-media");
  return isPreviewMediaLoaded(_0x3544b7) && (includeImages || isPreviewVideoMedia(_0x3544b7));
}
function getRetainablePaintedPreviewMediaSource(_0x38f255, _0x26212c) {
  if (!hasRetainablePaintedPreviewMedia(_0x38f255, {
    includeImages: true
  })) {
    return "";
  }
  return getReusableLoadedPreviewMediaSource(_0x38f255, _0x26212c);
}
function restorePaintedPreviewMedia(_0x1cd446) {
  const _0x1a3552 = _0x1cd446?.querySelector?.(".v2-fast-preview-media");
  if (!isPreviewMediaLoaded(_0x1a3552)) {
    return false;
  }
  delete _0x1a3552.dataset.previewResourceOnly;
  if (_0x1a3552.style) {
    _0x1a3552.style.visibility = "";
  }
  _0x1cd446.dataset.hasMedia = "1";
  const _0x4b0473 = Array.isArray(_0x1a3552._previewSources) ? _0x1a3552._previewSources.length : 0;
  if (_0x4b0473 > 0) {
    _0x1cd446.dataset.previewSrcCount = String(_0x4b0473);
  }
  return true;
}
function getReusableCurrentPreviewMediaSource(_0x16a7aa, _0x161795) {
  const _0x110ae2 = _0x16a7aa?.querySelector?.(".v2-fast-preview-media");
  const _0x40f703 = getPreviewMediaCurrentSrc(_0x110ae2) || String(_0x110ae2?._previewSrcPreloadUrl || "").trim();
  if (!_0x40f703) {
    return "";
  }
  const _0x56c9c2 = uniquePreviewUrls(Array.isArray(_0x161795) ? _0x161795 : [_0x161795]);
  if (_0x56c9c2.includes(_0x40f703)) {
    return _0x40f703;
  } else {
    return "";
  }
}
function nextPreviewMediaPreloadToken(_0x1c7582) {
  if (!_0x1c7582) {
    return 0;
  }
  const _0x3fef86 = (Number(_0x1c7582._previewSrcPreloadToken) || 0) + 1;
  _0x1c7582._previewSrcPreloadToken = _0x3fef86;
  return _0x3fef86;
}
function isPreviewMediaPreloadCurrent(_0x39d243, _0x289d73, _0x4be636, _0x2ca518 = 0) {
  if (!_0x39d243 || _0x39d243.isConnected === false) {
    return false;
  }
  if (_0x39d243._previewSrcPreloadToken !== _0x4be636) {
    return false;
  }
  const _0x5e8d65 = _0x39d243._previewSources || [];
  return String(_0x5e8d65[_0x2ca518] || "").trim() === String(_0x289d73 || "").trim();
}
function resolvePreviewMediaPreloadPriority(_0x121d11, {
  viewportBusy = false
} = {}) {
  if (viewportBusy) {
    return FAST_PREVIEW_BUSY_MEDIA_PRELOAD_PRIORITY;
  }
  if (_0x121d11?.loading === "lazy") {
    return FAST_PREVIEW_LOW_PRIORITY_MEDIA_PRELOAD_PRIORITY;
  }
  return FAST_PREVIEW_MEDIA_PRELOAD_PRIORITY;
}
function applyPreviewMediaSrcAfterPreload(_0xaed844, _0x362d9f, _0x46b50f = 0, _0x428ee5 = {}) {
  const _0x3fe009 = _0x362d9f[_0x46b50f] || "";
  if (!_0x3fe009) {
    return false;
  }
  const _0x10cf7a = _0xaed844.getAttribute?.("src") || _0xaed844.src || "";
  if (_0x10cf7a === _0x3fe009) {
    return true;
  }
  if (String(_0xaed844._previewSrcPreloadUrl || "").trim() === _0x3fe009) {
    return true;
  }
  const _0x4fb5c9 = !isPreviewVideoMedia(_0xaed844) && isCanvasImagePreloadCoolingDown(_0x3fe009);
  if (_0x4fb5c9) {
    return true;
  }
  if (_0x428ee5.directWhenBlank === true && !_0x10cf7a && (isPreviewVideoMedia(_0xaed844) || !isCanvasImagePreloadPending(_0x3fe009))) {
    return setPreviewMediaSrc(_0xaed844, _0x362d9f, _0x46b50f);
  }
  if (/^(data:image\/|blob:)/i.test(_0x3fe009) || typeof Image !== "function") {
    return setPreviewMediaSrc(_0xaed844, _0x362d9f, _0x46b50f);
  }
  const _0x388007 = nextPreviewMediaPreloadToken(_0xaed844);
  _0xaed844._previewSrcPreloadUrl = _0x3fe009;
  preloadCanvasImage(_0x3fe009, {
    decode: _0x428ee5.decode === true,
    requireImage: true,
    priority: resolvePreviewMediaPreloadPriority(_0xaed844, _0x428ee5),
    fetchPriority: _0xaed844?.fetchPriority === "high" ? "high" : "auto",
    scope: FAST_PREVIEW_MEDIA_PRELOAD_SCOPE,
    deferWhenPaused: _0x428ee5.viewportBusy === true || _0xaed844?.loading === "lazy"
  }).then(() => {
    if (!isPreviewMediaPreloadCurrent(_0xaed844, _0x3fe009, _0x388007, _0x46b50f)) {
      return;
    }
    setPreviewMediaSrc(_0xaed844, _0x362d9f, _0x46b50f);
    _0xaed844._previewSrcPreloadUrl = "";
  }, () => {
    if (!isPreviewMediaPreloadCurrent(_0xaed844, _0x3fe009, _0x388007, _0x46b50f)) {
      return;
    }
    _0xaed844._previewSrcPreloadUrl = "";
  });
  return true;
}
function setPreviewMediaSrcJoiningSharedAcquisition(_0x118d5d, _0x3fe8cb, _0x439e5b = 0, _0x12c277 = {}) {
  const _0xbd06e = _0x3fe8cb[_0x439e5b] || "";
  if (!_0xbd06e) {
    return false;
  }
  if (!isPreviewVideoMedia(_0x118d5d) && !/^(data:image\/|blob:)/i.test(_0xbd06e) && _0x12c277.directWhenBlank !== true && (isCanvasImagePreloadPending(_0xbd06e) || isCanvasImagePreloadCoolingDown(_0xbd06e))) {
    return applyPreviewMediaSrcAfterPreload(_0x118d5d, _0x3fe8cb, _0x439e5b, {
      ..._0x12c277,
      directWhenBlank: false
    });
  }
  return setPreviewMediaSrc(_0x118d5d, _0x3fe8cb, _0x439e5b);
}
export function cancelRendererFastPreviewMediaPreloads({
  includeActive = false,
  belowPriority = null,
  reason = "canceled"
} = {}) {
  return cancelQueuedCanvasImagePreloads({
    scope: FAST_PREVIEW_MEDIA_PRELOAD_SCOPE,
    includeActive: includeActive,
    belowPriority: belowPriority,
    reason: reason
  });
}
function previewMediaNeedsSrc(_0x51b6b0, _0x40a679) {
  const _0x2072bb = uniquePreviewUrls(Array.isArray(_0x40a679) ? _0x40a679 : [_0x40a679])[0] || "";
  if (!_0x2072bb) {
    return false;
  }
  const _0x26a168 = _0x51b6b0?.querySelector?.(".v2-fast-preview-media");
  if (!_0x26a168) {
    return true;
  }
  return (_0x26a168.getAttribute?.("src") || _0x26a168.src || "") !== _0x2072bb;
}
function syncPreviewMedia(_0x1c0526, _0x250f26, _0x9cbb5c, _0x1a7c3b = {}) {
  let _0x57cd8e = _0x1c0526.querySelector(".v2-fast-preview-media");
  const _0x18a93f = uniquePreviewUrls(Array.isArray(_0x250f26) ? _0x250f26 : [_0x250f26]);
  const _0xc9982d = getPreviewMediaCurrentSrc(_0x57cd8e);
  if (_0x18a93f.length > 0 && _0xc9982d && !_0x18a93f.includes(_0xc9982d) && isCanvasImagePreloadSharedImage(_0x57cd8e)) {
    _0x57cd8e.onload = null;
    _0x57cd8e.onerror = null;
    _0x57cd8e.remove?.();
    _0x57cd8e = null;
  }
  if (_0x18a93f.length === 0) {
    if (_0x57cd8e) {
      _0x1a7c3b.cancelPendingMediaSrc?.(_0x57cd8e);
    }
    const _0x101298 = _0x1a7c3b.preserveInFlightResource !== false && _0x1a7c3b.placeholderReady !== true && isPreviewMediaResourceProtected(_0x57cd8e);
    if (_0x101298) {
      _0x57cd8e.dataset.previewResourceOnly = "1";
      if (_0x57cd8e.style) {
        _0x57cd8e.style.visibility = "hidden";
      }
    } else {
      clearPreviewMediaSrc(_0x57cd8e);
      _0x57cd8e?.remove?.();
    }
    delete _0x1c0526.dataset.hasMedia;
    delete _0x1c0526.dataset.previewSrcCount;
    if (_0x1a7c3b.placeholderReady === true) {
      _0x1c0526.dataset.placeholderReady = "1";
    } else {
      delete _0x1c0526.dataset.placeholderReady;
    }
    return {
      imageCount: 0,
      srcAssignedCount: 0
    };
  }
  delete _0x1c0526.dataset.placeholderReady;
  if (!_0x57cd8e) {
    _0x57cd8e = document.createElement("img");
    _0x57cd8e.className = "v2-fast-preview-media";
    _0x57cd8e.decoding = "async";
    _0x57cd8e.alt = "";
    if (typeof _0x1c0526.insertBefore === "function") {
      _0x1c0526.insertBefore(_0x57cd8e, _0x1c0526.firstChild || null);
    } else if (typeof _0x1c0526.prepend === "function") {
      _0x1c0526.prepend(_0x57cd8e);
    } else {
      _0x1c0526.appendChild(_0x57cd8e);
    }
  }
  const _0x213d19 = _0x1a7c3b.loading === "lazy" ? "lazy" : "eager";
  const _0x4d7b54 = _0x1a7c3b.fetchPriority === "auto" ? "auto" : "high";
  if (_0x57cd8e.loading !== _0x213d19) {
    _0x57cd8e.loading = _0x213d19;
  }
  try {
    if (_0x57cd8e.fetchPriority !== _0x4d7b54) {
      _0x57cd8e.fetchPriority = _0x4d7b54;
    }
  } catch {}
  _0x57cd8e.dataset.previewKind = String(_0x1a7c3b.kind || "");
  if (_0x1a7c3b.critical === true) {
    _0x57cd8e.dataset.previewCritical = "1";
  } else {
    delete _0x57cd8e.dataset.previewCritical;
  }
  _0x57cd8e._previewSources = _0x18a93f;
  _0x57cd8e._previewMediaQueuePriority = _0x1a7c3b.queuePriority || null;
  _0x57cd8e._previewDirectWhenBlank = _0x1a7c3b.directWhenBlank === true;
  delete _0x57cd8e.dataset.previewResourceOnly;
  if (_0x57cd8e.style) {
    _0x57cd8e.style.visibility = "";
  }
  const _0x1f5529 = () => {
    const _0x1f9d13 = String(_0x57cd8e.getAttribute?.("src") || _0x57cd8e.src || "").trim();
    if (!_0x1f9d13 || !isPreviewMediaLoaded(_0x57cd8e)) {
      return;
    }
    if (String(_0x57cd8e.tagName || "").toLowerCase() === "img" && (_0x57cd8e.complete === false || Number(_0x57cd8e.naturalWidth || 0) <= 0)) {
      return;
    }
    const _0x32c3f8 = String(_0x1a7c3b.nodeId || "") + "\0" + _0x1f9d13;
    if (_0x57cd8e._previewPresentedNotificationKey === _0x32c3f8) {
      return;
    }
    _0x57cd8e._previewPresentedNotificationKey = _0x32c3f8;
    try {
      _0x1a7c3b.onMediaPresented?.(String(_0x1a7c3b.nodeId || ""), _0x57cd8e);
    } catch {}
  };
  _0x57cd8e.onload = () => {
    forgetCanvasImageDisplayLoad(_0x57cd8e);
    const _0x4a8daa = String(_0x57cd8e.getAttribute?.("src") || _0x57cd8e.src || "").trim();
    if (!_0x4a8daa) {
      return;
    }
    _0x57cd8e.dataset.previewLoaded = "1";
    rememberCanvasImagePreloadResolved(_0x4a8daa, {
      image: _0x57cd8e,
      naturalWidth: _0x57cd8e.naturalWidth || _0x57cd8e.width || 0,
      naturalHeight: _0x57cd8e.naturalHeight || _0x57cd8e.height || 0
    }, {
      retainImage: true
    });
    _0x1f5529();
  };
  _0x57cd8e.onerror = () => {
    forgetCanvasImageDisplayLoad(_0x57cd8e);
    delete _0x57cd8e.dataset.previewLoaded;
    const _0x201b86 = Math.max(0, Number(_0x57cd8e.dataset?.srcIndex) || 0);
    const _0x5d1e59 = _0x201b86 + 1;
    if (!applyPreviewMediaSrcAfterPreload(_0x57cd8e, _0x57cd8e._previewSources || [], _0x5d1e59)) {
      _0x57cd8e.onerror = null;
    }
  };
  if (_0x1a7c3b.deferSrc === true) {
    _0x1a7c3b.scheduleMediaSrc?.(_0x57cd8e);
  } else {
    _0x1a7c3b.cancelPendingMediaSrc?.(_0x57cd8e);
    let _0x655546 = false;
    if (_0x1a7c3b.fallbackWhileDecoding === true) {
      const _0x86a087 = getPreviewMediaCurrentSrc(_0x57cd8e);
      const _0x2c520f = !_0x86a087 && _0x18a93f.length > 1;
      if (_0x2c520f) {
        _0x655546 = setPreviewMediaSrcJoiningSharedAcquisition(_0x57cd8e, _0x18a93f, 1, {
          decode: false,
          viewportBusy: _0x1a7c3b.viewportBusy === true
        });
      }
      if (_0x1a7c3b.holdFallbackWhileBusy !== true) {
        _0x655546 = applyPreviewMediaSrcAfterPreload(_0x57cd8e, _0x18a93f, 0, {
          decode: true,
          directWhenBlank: _0x1a7c3b.directWhenBlank === true && !_0x2c520f,
          viewportBusy: _0x1a7c3b.viewportBusy === true
        });
      }
    } else {
      _0x655546 = setPreviewMediaSrcJoiningSharedAcquisition(_0x57cd8e, _0x18a93f, 0, {
        decode: _0x1a7c3b.kind === "image",
        directWhenBlank: _0x1a7c3b.directWhenBlank === true,
        viewportBusy: _0x1a7c3b.viewportBusy === true
      });
    }
    _0x57cd8e.alt = _0x9cbb5c || "";
    _0x1c0526.dataset.hasMedia = "1";
    _0x1c0526.dataset.previewSrcCount = String(_0x18a93f.length);
    _0x1f5529();
    return {
      imageCount: 1,
      srcAssignedCount: _0x655546 ? 1 : 0
    };
  }
  _0x57cd8e.alt = _0x9cbb5c || "";
  _0x1c0526.dataset.hasMedia = "1";
  _0x1c0526.dataset.previewSrcCount = String(_0x18a93f.length);
  _0x1f5529();
  return {
    imageCount: 1,
    srcAssignedCount: 0
  };
}
function syncPreviewEl(_0x2d17fa, _0x50d68c, {
  kind: _0x35fff5,
  text: _0x5cb5dc,
  sources: _0x110976,
  geometry: _0x3978fd,
  offsetX = 0,
  offsetY = 0,
  mediaLoading = "eager",
  mediaFetchPriority = "high",
  mediaCritical = false,
  mediaDirectWhenBlank = false,
  mediaFallbackWhileDecoding = false,
  mediaHoldFallbackWhileBusy = false,
  viewportBusy = false,
  queuePriority = null,
  deferMediaSrc = false,
  placeholderReady = false,
  preserveInFlightResource = true,
  scheduleMediaSrc = null,
  cancelPendingMediaSrc = null,
  onMediaPresented = null
}) {
  const {
    x: _0x25f962,
    y: _0x292ed8,
    width: _0x1d3f00,
    height: _0x4652dd
  } = _0x3978fd || getPreviewGeometry(_0x50d68c);
  const _0x444fbd = _0x25f962 - offsetX;
  const _0x1d47e2 = _0x292ed8 - offsetY;
  const _0x562bed = Array.isArray(_0x110976) ? _0x110976.join(">") : String(_0x110976 || "");
  const _0xbfb492 = _0x444fbd + "," + _0x1d47e2 + "," + _0x1d3f00 + "," + _0x4652dd;
  const _0x368eb9 = _0x35fff5 === "audio" ? getAudioPreviewTimeText(_0x50d68c) : "";
  const _0x40eea2 = _0x35fff5 + "|" + _0x5cb5dc + "|" + _0x562bed + "|" + (placeholderReady ? 1 : 0) + "|" + _0x368eb9;
  const _0x221c2b = _0x2d17fa._previewGeometrySig !== _0xbfb492;
  const _0x33c535 = _0x2d17fa._previewContentSig !== _0x40eea2;
  if (!_0x33c535) {
    const _0x169a85 = _0x2d17fa.querySelector(".v2-fast-preview-media");
    const _0x35c98d = (!Array.isArray(_0x110976) || _0x110976.length === 0) && !!_0x169a85;
    const _0x422e5c = _0x35c98d || previewMediaNeedsSrc(_0x2d17fa, _0x110976) || _0x169a85 && (_0x169a85.loading !== mediaLoading || _0x169a85.fetchPriority !== mediaFetchPriority);
    if (!_0x221c2b && !_0x422e5c) {
      return;
    }
  }
  if (_0x221c2b) {
    const _0x172746 = _0x1d3f00 + "px";
    const _0x203e23 = _0x4652dd + "px";
    if (_0x2d17fa.style.width !== _0x172746) {
      _0x2d17fa.style.width = _0x172746;
    }
    if (_0x2d17fa.style.height !== _0x203e23) {
      _0x2d17fa.style.height = _0x203e23;
    }
    _0x2d17fa._previewBaseX = _0x444fbd;
    _0x2d17fa._previewBaseY = _0x1d47e2;
    _0x2d17fa._previewGeometrySig = _0xbfb492;
  }
  let _0x21cc39 = false;
  if (_0x33c535) {
    const _0x191002 = "v2-fast-preview-node v2-fast-preview-node--" + _0x35fff5;
    if (_0x2d17fa.className !== _0x191002) {
      _0x2d17fa.className = _0x191002;
      _0x21cc39 = true;
    }
    if (_0x2d17fa.dataset.kind !== _0x35fff5) {
      _0x2d17fa.dataset.kind = _0x35fff5;
    }
    syncPreviewStaticContent(_0x2d17fa, _0x50d68c, _0x35fff5, _0x5cb5dc);
    _0x2d17fa._previewContentSig = _0x40eea2;
  }
  if (_0x221c2b || _0x21cc39) {
    applyPreviewDragTransform(_0x2d17fa);
  }
  const _0x13075e = _0x2d17fa.querySelector(".v2-fast-preview-media");
  const _0xe12539 = (!Array.isArray(_0x110976) || _0x110976.length === 0) && !!_0x13075e;
  const _0xfd5a16 = _0x33c535 || _0xe12539 || previewMediaNeedsSrc(_0x2d17fa, _0x110976) || _0x13075e && (_0x13075e.loading !== mediaLoading || _0x13075e.fetchPriority !== mediaFetchPriority);
  if (!_0xfd5a16) {
    return;
  }
  return syncPreviewMedia(_0x2d17fa, _0x110976, _0x5cb5dc, {
    nodeId: _0x50d68c?.id,
    loading: mediaLoading,
    fetchPriority: mediaFetchPriority,
    kind: _0x35fff5,
    critical: mediaCritical,
    directWhenBlank: mediaDirectWhenBlank,
    fallbackWhileDecoding: mediaFallbackWhileDecoding,
    holdFallbackWhileBusy: mediaHoldFallbackWhileBusy,
    viewportBusy: viewportBusy,
    queuePriority: queuePriority,
    deferSrc: deferMediaSrc,
    placeholderReady: placeholderReady,
    preserveInFlightResource: preserveInFlightResource,
    scheduleMediaSrc: scheduleMediaSrc,
    cancelPendingMediaSrc: cancelPendingMediaSrc,
    onMediaPresented: onMediaPresented
  });
}
function applyPreviewDragTransform(_0x359502) {
  if (!_0x359502) {
    return false;
  }
  const _0x3dc3bb = toNumber(_0x359502._previewBaseX, 0);
  const _0x326429 = toNumber(_0x359502._previewBaseY, 0);
  const _0xf2585d = _0x359502._previewDragActive === true;
  const _0x3950cf = _0xf2585d ? toNumber(_0x359502._previewDragDx, 0) : 0;
  const _0x15dff9 = _0xf2585d ? toNumber(_0x359502._previewDragDy, 0) : 0;
  _0x359502.style.transform = "translate(" + (_0x3dc3bb + _0x3950cf) + "px, " + (_0x326429 + _0x15dff9) + "px)";
  _0x359502.classList?.toggle?.("is-dragging-proxy", _0xf2585d);
  if (_0xf2585d) {
    _0x359502.dataset.dragProxy = "1";
  } else {
    delete _0x359502.dataset.dragProxy;
  }
  return true;
}
function resetPreviewDragState(_0x1fbdb1) {
  if (!_0x1fbdb1) {
    return;
  }
  _0x1fbdb1._previewDragActive = false;
  _0x1fbdb1._previewDragDx = 0;
  _0x1fbdb1._previewDragDy = 0;
  applyPreviewDragTransform(_0x1fbdb1);
  _0x1fbdb1.classList?.remove?.("is-dragging-proxy");
  delete _0x1fbdb1.dataset.dragProxy;
}
function settlePreviewDragState(_0x36a3b8, _0x1f6e87 = 0, _0x4fa0c7 = 0) {
  if (!_0x36a3b8) {
    return false;
  }
  _0x36a3b8._previewBaseX = toNumber(_0x36a3b8._previewBaseX, 0) + toNumber(_0x1f6e87, 0);
  _0x36a3b8._previewBaseY = toNumber(_0x36a3b8._previewBaseY, 0) + toNumber(_0x4fa0c7, 0);
  _0x36a3b8._previewDragActive = false;
  _0x36a3b8._previewDragDx = 0;
  _0x36a3b8._previewDragDy = 0;
  return applyPreviewDragTransform(_0x36a3b8);
}
function isStoryboardEditingNode(_0x59ff97 = {}) {
  return String(_0x59ff97?.type || "").trim().toLowerCase() === "storyboard" && _0x59ff97.isEditing;
}
function syncPreviewConnectionState(_0x327e8c, _0x17beee = {}, {
  connOverlay = null,
  pickConnectMode = null
} = {}) {
  const _0x2b243a = String(_0x17beee?.id || _0x327e8c?.dataset?.nodeId || "").trim();
  if (!_0x2b243a || !_0x327e8c?.classList) {
    return;
  }
  const _0xa0deeb = String(connOverlay?.srcId || "").trim();
  const _0x4e874f = pickConnectMode?.active ? String(pickConnectMode.sourceNodeId || "").trim() : "";
  const _0xb068e0 = !!_0x4e874f && _0x2b243a === _0x4e874f;
  const _0x388b84 = !!_0xa0deeb && _0x2b243a === _0xa0deeb;
  const _0x1e11e3 = isStoryboardEditingNode(_0x17beee);
  const _0x1e3a62 = _0x388b84 || _0xb068e0 || _0x1e11e3;
  const _0x35aeb2 = Array.isArray(connOverlay?.invalidNodeIds) ? connOverlay.invalidNodeIds : [];
  const _0x31aef4 = !_0x1e3a62 && _0x35aeb2.includes(_0x2b243a);
  const _0x2bf822 = pickConnectMode?.active ? String(pickConnectMode.hoverNodeId || "").trim() : "";
  const _0x206d81 = !!_0x2bf822 && _0x2b243a === _0x2bf822;
  const _0x2a9043 = connOverlay?.hoverId === _0x2b243a || _0x206d81;
  const _0x23e971 = _0x2a9043 && (connOverlay?.side === "left" || _0x206d81 && pickConnectMode?.handleDirection === "left");
  _0x327e8c.classList.toggle("conn-src", _0x1e3a62);
  _0x327e8c.classList.toggle("conn-invalid", _0x31aef4);
  _0x327e8c.classList.toggle("conn-hoverTarget", _0x2a9043);
  _0x327e8c.classList.toggle("conn-hover-output", _0x23e971);
  _0x327e8c.classList.toggle("conn-hover-input", _0x2a9043 && !_0x23e971);
}
function buildPreviewCandidateSyncSignature(_0x129879, _0x273e22, _0x2c3284 = null) {
  const {
    node: _0x154635,
    nodeId: _0x3d5b7a,
    kind: _0x35749f,
    sources = [],
    geometry = {}
  } = _0x129879 || {};
  const _0x2ed8e6 = _0x273e22?.options || {};
  const _0x1b0303 = _0x2ed8e6.connOverlay || {};
  const _0x250783 = _0x2ed8e6.pickConnectMode || {};
  const _0xca296 = _0x273e22?.mediaPlan?.explicitMediaSourceOwnerIds;
  const _0x3a993d = _0x273e22?.requiredImmediateMediaSourceOwnerIds;
  const _0x143290 = Array.isArray(_0x1b0303.invalidNodeIds) ? _0x1b0303.invalidNodeIds : [];
  const _0x565790 = _0x2c3284?.querySelector?.(".v2-fast-preview-media") || null;
  const _0x2e2498 = String(sources[0] || "").trim();
  const _0x26dc6c = (_0x129879?.fullEligibleVisible === true || _0x129879?.visible === true) && (_0x35749f === "video" || toNumber(_0x273e22?.visibleMediaCandidateCount, 0) <= toNumber(_0x273e22?.immediateMediaSrcLimit, 0));
  const _0x2a8eaf = toNumber(geometry.x, 0) - toNumber(_0x273e22?.layerBounds?.offsetX, 0);
  const _0x51236b = toNumber(geometry.y, 0) - toNumber(_0x273e22?.layerBounds?.offsetY, 0);
  return [_0x3d5b7a, _0x35749f, _0x129879?.text ?? getPreviewText(_0x154635, _0x35749f), sources.join(">"), _0x2a8eaf, _0x51236b, toNumber(geometry.width, 0), toNumber(geometry.height, 0), _0x129879?.nearViewport === true ? 1 : 0, _0x129879?.visible === true ? 1 : 0, _0x129879?.fullEligibleVisible === true ? 1 : 0, _0x129879?.fullEligiblePreview === true ? 1 : 0, _0x129879?.fullEligibleMotionAhead === true ? 1 : 0, _0x129879?.motionFront === true ? 1 : 0, _0x129879?.motionAhead === true ? 1 : 0, _0x129879?.selected === true ? 1 : 0, _0x129879?.retained === true ? 1 : 0, _0x129879?.mounted === true ? 1 : 0, _0x273e22?.mediaPlan?.nodeIdsWithMedia?.has?.(_0x3d5b7a) === true ? 1 : 0, _0xca296 === null ? "legacy" : _0xca296?.has?.(_0x3d5b7a) === true ? 1 : 0, _0x3a993d === null ? "legacy" : _0x3a993d?.has?.(_0x3d5b7a) === true ? 1 : 0, _0x273e22?.mediaPlan?.lowPriority === true ? 1 : 0, _0x273e22?.mediaPlan?.prefetchAhead === true ? 1 : 0, _0x273e22?.mediaLoading || "", _0x273e22?.mediaFetchPriority || "", _0x26dc6c ? 1 : 0, _0x273e22?.viewportBusy === true ? 1 : 0, _0x2ed8e6.suppressNewMedia === true ? 1 : 0, _0x2ed8e6.suspendNewMediaSrc === true ? 1 : 0, _0x2ed8e6.previewMotion?.zoomChanged === true ? 1 : 0, String(_0x1b0303.srcId || ""), String(_0x1b0303.hoverId || ""), String(_0x1b0303.side || ""), _0x143290.includes(_0x3d5b7a) ? 1 : 0, _0x250783.active === true ? 1 : 0, String(_0x250783.sourceNodeId || ""), String(_0x250783.hoverNodeId || ""), String(_0x250783.handleDirection || ""), isStoryboardEditingNode(_0x154635) ? 1 : 0, _0x2c3284?.dataset?.mediaSourceOwner || "", _0x2c3284?.dataset?.hasMedia || "", _0x2c3284?.dataset?.placeholderReady || "", _0x565790 ? getPreviewMediaCurrentSrc(_0x565790) : "", _0x565790?._previewSrcPreloadUrl || "", _0x565790?.dataset?.previewResourceOnly || "", _0x565790?.style?.visibility || "", _0x565790?.loading || "", _0x565790?.fetchPriority || "", _0x2e2498 && _0x35749f !== "video" && isCanvasImagePreloadCoolingDown(_0x2e2498) ? 1 : 0].join("");
}
function syncLayerBounds(_0x1f49ba, _0x471689, {
  preserveAnchor = false
} = {}) {
  if (!_0x1f49ba || !Array.isArray(_0x471689) || _0x471689.length === 0) {
    return null;
  }
  if (preserveAnchor && Number.isFinite(_0x1f49ba._previewOffsetX) && Number.isFinite(_0x1f49ba._previewOffsetY)) {
    return {
      offsetX: _0x1f49ba._previewOffsetX,
      offsetY: _0x1f49ba._previewOffsetY
    };
  }
  let _0x38f4c2 = Infinity;
  let _0x336f20 = Infinity;
  let _0x3ebbc0 = -Infinity;
  let _0x6dac22 = -Infinity;
  for (const _0x2699b5 of _0x471689) {
    const _0x3e423c = _0x2699b5?.geometry;
    if (!_0x3e423c) {
      continue;
    }
    _0x38f4c2 = Math.min(_0x38f4c2, _0x3e423c.x);
    _0x336f20 = Math.min(_0x336f20, _0x3e423c.y);
    _0x3ebbc0 = Math.max(_0x3ebbc0, _0x3e423c.x + _0x3e423c.width);
    _0x6dac22 = Math.max(_0x6dac22, _0x3e423c.y + _0x3e423c.height);
  }
  if (![_0x38f4c2, _0x336f20, _0x3ebbc0, _0x6dac22].every(Number.isFinite)) {
    return null;
  }
  const _0x1eadd8 = _0x38f4c2 - FAST_PREVIEW_LAYER_PADDING;
  const _0xa5aa5 = _0x336f20 - FAST_PREVIEW_LAYER_PADDING;
  const _0x390618 = 1;
  const _0x424806 = 1;
  const _0x598350 = _0x1eadd8 + "," + _0xa5aa5 + "," + _0x390618 + "," + _0x424806;
  if (_0x1f49ba._previewBoundsSig !== _0x598350) {
    Object.assign(_0x1f49ba.style, {
      left: _0x1eadd8 + "px",
      top: _0xa5aa5 + "px",
      width: _0x390618 + "px",
      height: _0x424806 + "px"
    });
    _0x1f49ba._previewBoundsSig = _0x598350;
  }
  _0x1f49ba._previewOffsetX = _0x1eadd8;
  _0x1f49ba._previewOffsetY = _0xa5aa5;
  return {
    offsetX: _0x1eadd8,
    offsetY: _0xa5aa5
  };
}
export function createRendererFastPreviewLayer({
  getWrapper: _0x2d324b,
  isMounted: _0x56fefe,
  resolveMediaPresentationReady: _0x9226b6,
  onMediaPresented: _0x26d95c,
  onPresentationOwnerChanged: _0x276e66
} = {}) {
  const _0x10ed89 = new Map();
  const _0x43efea = new Map();
  const _0x2be93f = [];
  const _0x2220f7 = new Map();
  const _0x12280b = new Map();
  const _0x45c8d8 = new Set();
  const _0x23c879 = new Set();
  let _0x234a5d = [];
  let _0xf730bb = null;
  let _0x5ecf75 = null;
  let _0x2f0257 = Number.POSITIVE_INFINITY;
  let _0x3a6a6e = Number.POSITIVE_INFINITY;
  let _0x2777ed = 0;
  let _0xa54ff2 = false;
  let _0x5a5f80 = null;
  let _0x1641dc = null;
  let _0x235dbf = null;
  let _0x793256 = null;
  let _0x4c5767 = 0;
  let _0x4be843 = null;
  let _0x341ca9 = null;
  let _0x1f2cf2 = createEmptyStats();
  const _0x3f7012 = new Map();
  function _0x1b2fbf(_0x5bc28c, _0x1dd3f5) {
    const _0x507b7d = String(_0x5bc28c || "");
    const _0x20419f = _0x2d324b?.(_0x507b7d);
    if (!_0x20419f?.dataset) {
      return;
    }
    const _0x3a90f6 = _0x1dd3f5 === true;
    if (_0x3a90f6) {
      _0x20419f.dataset.rendererPresentationOwner = "fast-preview";
    } else if (_0x20419f.dataset.rendererPresentationOwner === "fast-preview") {
      delete _0x20419f.dataset.rendererPresentationOwner;
    }
    _0x276e66?.({
      nodeId: _0x507b7d,
      active: _0x3a90f6,
      wrapper: _0x20419f
    });
  }
  function _0x24ea03(_0x31e1a5, _0x1e8b22, _0x4f9533 = _0x341ca9?.[String(_0x31e1a5 || "")]) {
    const _0xc21c1a = _0x9226b6?.(String(_0x31e1a5 || ""), _0x1e8b22);
    const _0x5ef758 = typeof _0xc21c1a === "boolean" ? _0xc21c1a : isMountedMediaReady(_0x1e8b22);
    if (!_0x5ef758) {
      return false;
    }
    const _0x58eebd = [...Array.from(_0x1e8b22?.querySelectorAll?.("img") || []).filter(_0x2353b2 => isMountedPresentationMediaElement(_0x2353b2) && isMountedImageReady(_0x2353b2)), ...Array.from(_0x1e8b22?.querySelectorAll?.("video") || []).filter(_0x37a08d => isMountedPresentationMediaElement(_0x37a08d) && isMountedVideoReady(_0x37a08d))];
    if (_0x4f9533 && !_0x58eebd.some(_0x1f3edc => isPresentationMediaSourceForNode(_0x1f3edc, _0x4f9533))) {
      return false;
    }
    if (_0x1e8b22?.dataset?.mediaLodMode !== "full") {
      return true;
    }
    return _0x58eebd.some(_0x51ae6f => String(_0x51ae6f?.tagName || "").toLowerCase() === "img" && String(_0x51ae6f?.dataset?.lodSrc || "").trim() === "full" && (!_0x4f9533 || isPresentationMediaSourceForNode(_0x51ae6f, _0x4f9533)));
  }
  function _0x2d3933(_0x2af71a, _0x41c46b = _0x2d324b?.(_0x2af71a)) {
    if (!_0x41c46b || !_0x56fefe?.(_0x2af71a) || _0x41c46b.isConnected === false) {
      return false;
    }
    const _0x12bf31 = _0x41c46b.style || {};
    return _0x41c46b.hidden !== true && _0x12bf31.display !== "none" && _0x12bf31.visibility !== "hidden" && _0x12bf31.opacity !== "0";
  }
  function _0x57fba1(_0x546c53) {
    if (typeof requestAnimationFrame === "function") {
      return requestAnimationFrame(_0x546c53);
    }
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      return window.requestAnimationFrame(_0x546c53);
    }
    _0x546c53();
    return null;
  }
  function _0x3c6f62(_0x3cec2d) {
    if (_0x3cec2d == null) {
      return;
    }
    if (typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(_0x3cec2d);
      return;
    }
    if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(_0x3cec2d);
      return;
    }
  }
  function _0x5b18a8() {
    if (_0x5ecf75 === null) {
      return;
    }
    if (typeof clearTimeout === "function") {
      clearTimeout(_0x5ecf75);
    }
    _0x5ecf75 = null;
  }
  function _0x47cf2a(_0x9618e8) {
    if (_0x9618e8 === true) {
      _0x2777ed = nowPerf() + FAST_PREVIEW_BUSY_HINT_TTL_MS;
      return;
    }
    if (_0x9618e8 === false) {
      _0x2777ed = 0;
    }
  }
  function _0x35fbd2() {
    return _0x2777ed > nowPerf();
  }
  function _0x570a30(_0xd9dc76) {
    if (_0xd9dc76 !== true) {
      _0xa54ff2 = false;
      return;
    }
    if (_0xa54ff2) {
      return;
    }
    _0xa54ff2 = true;
    cancelQueuedCanvasImagePreloads({
      scope: FAST_PREVIEW_MEDIA_PRELOAD_SCOPE,
      includeActive: false,
      belowPriority: FAST_PREVIEW_VIEWPORT_BUSY_PRELOAD_CANCEL_PRIORITY_LIMIT,
      reason: "fast preview viewport busy"
    });
  }
  function _0x2feb92(_0x361278 = {}) {
    const _0x26d81e = getViewportWorldCenter(_0x361278);
    const _0x58d871 = _0x5a5f80;
    const _0x45a7c9 = normalizeViewport(_0x361278?.viewport).zoom;
    const _0x36db72 = _0x1641dc;
    _0x5a5f80 = _0x26d81e;
    _0x1641dc = _0x45a7c9;
    if (!_0x58d871) {
      return {
        center: _0x26d81e,
        dx: 0,
        dy: 0,
        active: false,
        zoomChanged: false
      };
    }
    const _0x1be12f = _0x26d81e.x - _0x58d871.x;
    const _0x3551a3 = _0x26d81e.y - _0x58d871.y;
    return {
      center: _0x26d81e,
      dx: _0x1be12f,
      dy: _0x3551a3,
      active: _0x1be12f * _0x1be12f + _0x3551a3 * _0x3551a3 >= FAST_PREVIEW_MOTION_MIN_DISTANCE_SQ,
      zoomChanged: Number.isFinite(_0x36db72) && Math.abs(_0x45a7c9 - _0x36db72) > 0.000001
    };
  }
  function _0xb7f21f(_0x150f7e, _0xaf1e38) {
    const _0x395e40 = _0x150f7e?._previewMediaQueuePriority || {};
    const _0x261ef4 = _0xaf1e38?._previewMediaQueuePriority || {};
    const _0x60575b = Number.isFinite(Number(_0x395e40.userRank)) ? Number(_0x395e40.userRank) : 3;
    const _0x396d3b = Number.isFinite(Number(_0x261ef4.userRank)) ? Number(_0x261ef4.userRank) : 3;
    if (_0x60575b !== _0x396d3b) {
      return _0x60575b - _0x396d3b;
    }
    const _0x5d35a6 = Number.isFinite(Number(_0x395e40.distanceSq)) ? Number(_0x395e40.distanceSq) : Number.POSITIVE_INFINITY;
    const _0x3c5e2b = Number.isFinite(Number(_0x261ef4.distanceSq)) ? Number(_0x261ef4.distanceSq) : Number.POSITIVE_INFINITY;
    if (_0x5d35a6 !== _0x3c5e2b) {
      return _0x5d35a6 - _0x3c5e2b;
    }
    const _0x2525e0 = Number.isFinite(Number(_0x395e40.order)) ? Number(_0x395e40.order) : 0;
    const _0x549510 = Number.isFinite(Number(_0x261ef4.order)) ? Number(_0x261ef4.order) : 0;
    return _0x2525e0 - _0x549510;
  }
  function _0x4caf8e(_0xc19c98) {
    let _0x4d70f7 = _0x234a5d.length;
    for (let _0x125c41 = 0; _0x125c41 < _0x234a5d.length; _0x125c41 += 1) {
      if (_0xb7f21f(_0xc19c98, _0x234a5d[_0x125c41]) < 0) {
        _0x4d70f7 = _0x125c41;
        break;
      }
    }
    _0x234a5d.splice(_0x4d70f7, 0, _0xc19c98);
  }
  function _0x5be956() {
    _0x234a5d.sort(_0xb7f21f);
  }
  function _0x478ef5({
    retryWhenBusy = false
  } = {}) {
    if (_0xf730bb !== null || _0x5ecf75 !== null) {
      return;
    }
    if (retryWhenBusy && typeof setTimeout === "function") {
      _0x5ecf75 = setTimeout(() => {
        _0x5ecf75 = null;
        _0x86e721();
      }, FAST_PREVIEW_BUSY_MEDIA_SRC_RETRY_MS);
      return;
    }
    _0xf730bb = _0x57fba1(_0x86e721);
  }
  function _0x86e721() {
    const _0x35cd91 = isPerfProbeEnabled();
    const _0x31d093 = _0x35cd91 ? nowPerf() : 0;
    _0xf730bb = null;
    _0x5b18a8();
    const _0x37abab = _0x35fbd2() || isViewportInteractionBusyForPreview();
    let _0x4fe0f7 = resolveMediaSrcBatchSize(_0x234a5d.length, {
      viewportBusy: _0x37abab
    });
    let _0x3d34df = resolveVideoMediaSrcBatchSize(_0x234a5d.length, {
      viewportBusy: _0x37abab
    });
    let _0x3aa77 = 0;
    let _0x352bc3 = 0;
    let _0x1e0761 = 0;
    const _0x47f463 = [];
    const _0xbea2a6 = _0x234a5d.length;
    let _0x50926e = 0;
    while (_0x4fe0f7 > 0 && _0x234a5d.length > 0 && _0x50926e < _0xbea2a6) {
      const _0x577fd6 = _0x234a5d.shift();
      _0x50926e += 1;
      if (!_0x577fd6) {
        continue;
      }
      if (_0x577fd6.isConnected === false) {
        _0x23c879.delete(_0x577fd6);
        continue;
      }
      const _0x546595 = isPreviewVideoMedia(_0x577fd6);
      const _0x260bec = isPreviewCriticalMedia(_0x577fd6);
      if (_0x546595 && !_0x260bec && _0x3d34df <= 0) {
        _0x47f463.push(_0x577fd6);
        _0x1e0761 += 1;
        continue;
      }
      _0x23c879.delete(_0x577fd6);
      if (applyPreviewMediaSrcAfterPreload(_0x577fd6, _0x577fd6._previewSources || [], 0, {
        decode: _0x260bec !== true,
        directWhenBlank: _0x260bec === true || _0x577fd6._previewDirectWhenBlank === true,
        viewportBusy: _0x37abab
      })) {
        _0x3aa77 += 1;
        if (_0x546595) {
          _0x352bc3 += 1;
        }
      }
      if (_0x546595 && !_0x260bec) {
        _0x3d34df -= 1;
      }
      _0x4fe0f7 -= 1;
    }
    if (_0x47f463.length > 0) {
      _0x234a5d.push(..._0x47f463);
      _0x5be956();
    }
    if (_0x35cd91) {
      const _0x1a74cf = nowPerf();
      recordFastPreviewSample("media-src-batch", _0x1a74cf - _0x31d093, {
        endPerf: _0x1a74cf,
        pendingMediaSrcCount: _0x234a5d.length,
        srcAssignedCount: _0x3aa77,
        startPerf: _0x31d093,
        videoDeferredCount: _0x1e0761,
        videoSrcAssignedCount: _0x352bc3
      });
    }
    if (_0x234a5d.length > 0) {
      _0x478ef5({
        retryWhenBusy: _0x37abab
      });
    }
  }
  function _0x14c43c(_0x5a6f1c) {
    if (!_0x5a6f1c) {
      return;
    }
    const _0x247f7d = _0x5a6f1c._previewSources?.[0] || "";
    if (!_0x247f7d) {
      return;
    }
    const _0x265c73 = _0x5a6f1c.getAttribute?.("src") || _0x5a6f1c.src || "";
    if (_0x265c73 === _0x247f7d) {
      return;
    }
    if (_0x5a6f1c._previewSrcPreloadUrl === _0x247f7d) {
      return;
    }
    if (_0x5a6f1c._previewSrcPreloadUrl && _0x5a6f1c._previewSrcPreloadUrl !== _0x247f7d) {
      nextPreviewMediaPreloadToken(_0x5a6f1c);
      _0x5a6f1c._previewSrcPreloadUrl = "";
    }
    if (_0x23c879.has(_0x5a6f1c)) {
      _0x5be956();
      return;
    }
    _0x23c879.add(_0x5a6f1c);
    _0x4caf8e(_0x5a6f1c);
    _0x478ef5();
  }
  function _0x17b20d(_0x8c0f56) {
    if (!_0x8c0f56) {
      return;
    }
    if (_0x23c879.has(_0x8c0f56)) {
      _0x23c879.delete(_0x8c0f56);
      _0x234a5d = _0x234a5d.filter(_0x10df41 => _0x10df41 !== _0x8c0f56);
    }
    if (_0x8c0f56._previewSrcPreloadUrl) {
      nextPreviewMediaPreloadToken(_0x8c0f56);
      _0x8c0f56._previewSrcPreloadUrl = "";
    }
  }
  function _0x397e91() {
    if (_0xf730bb !== null) {
      _0x3c6f62(_0xf730bb);
      _0xf730bb = null;
    }
    _0x5b18a8();
    for (const _0x2865f2 of _0x23c879) {
      if (_0x2865f2) {
        nextPreviewMediaPreloadToken(_0x2865f2);
        _0x2865f2._previewSrcPreloadUrl = "";
      }
    }
    _0x23c879.clear();
    _0x234a5d = [];
  }
  function _0x151ac8() {
    if (_0x793256 !== null) {
      _0x3c6f62(_0x793256);
      _0x793256 = null;
    }
    _0x235dbf = null;
  }
  function _0x11f3ed(_0x5356d4, {
    clearSrc = false
  } = {}) {
    if (!_0x5356d4) {
      return;
    }
    const _0x465fa9 = _0x5356d4.querySelector?.(".v2-fast-preview-media");
    if (_0x465fa9) {
      _0x17b20d(_0x465fa9);
      if (clearSrc) {
        clearPreviewMediaSrc(_0x465fa9);
      }
    }
  }
  function _0x8351a0(_0x14deca) {
    const _0x1add7d = _0x14deca?.querySelector?.(".v2-fast-preview-media");
    if (!_0x1add7d) {
      return false;
    }
    _0x17b20d(_0x1add7d);
    if (isPreviewMediaResourceProtected(_0x1add7d)) {
      _0x1add7d.dataset.previewResourceOnly = "1";
      if (_0x1add7d.style) {
        _0x1add7d.style.visibility = "hidden";
      }
      delete _0x14deca.dataset.hasMedia;
      delete _0x14deca.dataset.previewSrcCount;
      return true;
    }
    clearPreviewMediaSrc(_0x1add7d);
    _0x1add7d.remove?.();
    delete _0x14deca.dataset.hasMedia;
    delete _0x14deca.dataset.previewSrcCount;
    return true;
  }
  function _0x57416c(_0x386937, {
    preservePaintedMediaOwners = false,
    preservePaintedVideoOwners = false
  } = {}) {
    if (_0x386937 == null || typeof _0x386937?.[Symbol.iterator] !== "function") {
      return 0;
    }
    const _0x3c404f = new Set(Array.from(_0x386937, _0x418b6b => String(_0x418b6b || "")).filter(Boolean));
    if (_0x235dbf?.mediaPlan) {
      _0x235dbf.mediaPlan.explicitMediaSourceOwnerIds = _0x3c404f;
      _0x235dbf.mediaPlan.nodeIdsWithMedia = new Set([..._0x235dbf.mediaPlan.nodeIdsWithMedia].filter(_0x533e0c => _0x3c404f.has(_0x533e0c)));
      _0x235dbf.options = {
        ..._0x235dbf.options,
        mediaSourceOwnerIds: _0x3c404f
      };
    }
    let _0x5212a9 = 0;
    for (const [_0x474e39, _0x7752ac] of _0x43efea) {
      if (_0x3c404f.has(_0x474e39)) {
        _0x7752ac.dataset.mediaSourceOwner = "1";
        restorePaintedPreviewMedia(_0x7752ac);
      } else if ((preservePaintedMediaOwners || preservePaintedVideoOwners) && hasRetainablePaintedPreviewMedia(_0x7752ac, {
        includeImages: preservePaintedMediaOwners
      })) {
        _0x7752ac.dataset.mediaSourceOwner = "1";
        restorePaintedPreviewMedia(_0x7752ac);
      } else {
        delete _0x7752ac.dataset.mediaSourceOwner;
        if (_0x8351a0(_0x7752ac)) {
          _0x5212a9 += 1;
        }
      }
    }
    for (const [_0x794372, _0x36ad45] of _0x2220f7) {
      if (_0x3c404f.has(_0x794372)) {
        _0x36ad45.dataset.mediaSourceOwner = "1";
        restorePaintedPreviewMedia(_0x36ad45);
      } else if (_0x36ad45.dataset.mediaSourceOwner === "1" && (preservePaintedMediaOwners || preservePaintedVideoOwners) && hasRetainablePaintedPreviewMedia(_0x36ad45, {
        includeImages: preservePaintedMediaOwners
      })) {
        restorePaintedPreviewMedia(_0x36ad45);
      } else {
        delete _0x36ad45.dataset.mediaSourceOwner;
        if (_0x8351a0(_0x36ad45)) {
          _0x5212a9 += 1;
        }
      }
    }
    for (const _0x565d2f of _0x12280b.values()) {
      if (!_0x3c404f.has(_0x565d2f.nodeId) && _0x8351a0(_0x565d2f.el)) {
        _0x5212a9 += 1;
      }
    }
    if (_0x5212a9 > 0) {
      _0x51f700();
    }
    return _0x5212a9;
  }
  function _0x566b7e(_0x493844) {
    if (!_0x493844) {
      return;
    }
    _0x11f3ed(_0x493844, {
      clearSrc: true
    });
    resetPreviewDragState(_0x493844);
    delete _0x493844._previewSig;
    delete _0x493844._previewGeometrySig;
    delete _0x493844._previewContentSig;
    delete _0x493844._previewCandidateSyncSig;
    delete _0x493844.dataset.nodeId;
    delete _0x493844.dataset.kind;
    delete _0x493844.dataset.hasMedia;
    delete _0x493844.dataset.placeholderReady;
    delete _0x493844.dataset.previewSrcCount;
    delete _0x493844.dataset.mediaSourceOwner;
    delete _0x493844.dataset.previewReleaseStage;
    Object.assign(_0x493844.style, {
      display: "none",
      height: "",
      opacity: "",
      pointerEvents: "",
      transform: "",
      visibility: "",
      width: ""
    });
    _0x493844.className = "v2-fast-preview-node";
    _0x493844.remove?.();
  }
  function _0x5b11e1(_0x55c6c0, _0x55638e) {
    const _0xbf190e = String(_0x55c6c0 || "").trim();
    if (!_0xbf190e || !_0x55638e) {
      return false;
    }
    const _0x4b00ae = _0x55638e.querySelector?.(".v2-fast-preview-media");
    if (!isPreviewMediaLoaded(_0x4b00ae) && !isPreviewMediaResourceProtected(_0x4b00ae)) {
      return false;
    }
    _0x11f3ed(_0x55638e);
    resetPreviewDragState(_0x55638e);
    if (_0x2220f7.has(_0xbf190e)) {
      _0x1bdc62(_0x2220f7.get(_0xbf190e));
    }
    _0x2220f7.set(_0xbf190e, _0x55638e);
    Object.assign(_0x55638e.style, {
      display: "none"
    });
    _0x55638e.remove?.();
    while (_0x2220f7.size > FAST_PREVIEW_DETACHED_NODE_CACHE_LIMIT) {
      const _0x1c6e96 = Array.from(_0x2220f7.entries()).find(([_0x1f5ff7, _0x13ce71]) => {
        const _0x554f6e = _0x13ce71?.querySelector?.(".v2-fast-preview-media");
        return !isPreviewMediaResourceProtected(_0x554f6e);
      });
      const _0xe7d71b = _0x1c6e96?.[0];
      if (!_0xe7d71b) {
        if (_0x2220f7.size <= FAST_PREVIEW_DETACHED_IN_FLIGHT_CACHE_LIMIT) {
          break;
        }
      }
      const _0x349f34 = _0xe7d71b || _0x2220f7.keys().next().value;
      const _0x672c23 = _0x2220f7.get(_0x349f34);
      _0x2220f7.delete(_0x349f34);
      _0x1bdc62(_0x672c23);
    }
    return true;
  }
  function _0x174ca9() {
    const _0xd292a2 = Array.from(_0x2220f7.entries()).find(([_0x37ea2a, _0x3b7249]) => {
      const _0x4483d5 = _0x3b7249?.querySelector?.(".v2-fast-preview-media");
      return !isPreviewMediaResourceProtected(_0x4483d5);
    });
    const _0x24e0af = _0xd292a2?.[0];
    if (!_0x24e0af) {
      return null;
    }
    const _0x568852 = _0x2220f7.get(_0x24e0af);
    _0x2220f7.delete(_0x24e0af);
    _0x566b7e(_0x568852);
    return _0x568852 || null;
  }
  function _0x422cd3(_0x120dc4) {
    let _0x197f54 = false;
    let _0x5e87f2 = false;
    let _0x15dfd4 = _0x2220f7.get(_0x120dc4);
    if (_0x15dfd4) {
      _0x2220f7.delete(_0x120dc4);
      _0x197f54 = true;
      _0x5e87f2 = true;
    } else {
      _0x15dfd4 = _0x2be93f.pop() || _0x174ca9();
      _0x197f54 = !!_0x15dfd4;
      if (!_0x15dfd4) {
        _0x15dfd4 = createPreviewEl(_0x120dc4);
      }
    }
    _0x15dfd4.dataset.nodeId = _0x120dc4;
    delete _0x15dfd4.dataset.previewReleaseStage;
    Object.assign(_0x15dfd4.style, {
      display: "",
      opacity: "",
      pointerEvents: "",
      visibility: ""
    });
    if (!_0x5e87f2) {
      delete _0x15dfd4._previewSig;
      delete _0x15dfd4._previewGeometrySig;
      delete _0x15dfd4._previewContentSig;
    }
    _0x15dfd4._fastPreviewReused = _0x197f54;
    let _0x2044ce = _0x15dfd4.querySelector?.(".v2-fast-preview-label");
    if (!_0x2044ce) {
      _0x2044ce = document.createElement("div");
      _0x2044ce.className = "v2-fast-preview-label";
      _0x15dfd4.appendChild(_0x2044ce);
    }
    return _0x15dfd4;
  }
  function _0x1bdc62(_0x2061bc) {
    if (!_0x2061bc) {
      return;
    }
    _0x566b7e(_0x2061bc);
    if (_0x2be93f.length < FAST_PREVIEW_NODE_POOL_LIMIT) {
      _0x2be93f.push(_0x2061bc);
    }
  }
  function _0x5cdd6c(_0x216a46, _0x1ac88b) {
    const {
      node: _0x18004d,
      nodeId: _0x4ce3ba,
      kind: _0x5ee605,
      sources: _0x54e5f1,
      geometry: _0x3b9844,
      nearViewport: _0x2dcdc5,
      visible: _0x5c9021
    } = _0x216a46;
    let _0x1acd04 = _0x43efea.get(_0x4ce3ba);
    const _0x39fdec = _0x1acd04;
    if (!_0x1acd04) {
      const _0xd18a28 = Array.from(_0x12280b.values()).find(_0x31e58e => _0x31e58e.nodeId === _0x4ce3ba);
      if (_0xd18a28) {
        _0x315ea6(_0xd18a28);
        _0x1acd04 = _0x43efea.get(_0x4ce3ba);
      }
    }
    let _0x20cd40 = 0;
    let _0x30d4c7 = 0;
    if (!_0x1acd04) {
      _0x1acd04 = _0x422cd3(_0x4ce3ba);
      _0x43efea.set(_0x4ce3ba, _0x1acd04);
      _0x1ac88b.layer.appendChild(_0x1acd04);
      if (_0x1acd04._fastPreviewReused === true) {
        _0x30d4c7 = 1;
      } else {
        _0x20cd40 = 1;
      }
      delete _0x1acd04._fastPreviewReused;
    } else if (_0x1acd04.parentNode !== _0x1ac88b.layer) {
      _0x1ac88b.layer.appendChild(_0x1acd04);
    }
    _0x1b2fbf(_0x4ce3ba, true);
    const _0x4f100d = buildPreviewCandidateSyncSignature(_0x216a46, _0x1ac88b, _0x1acd04);
    if (_0x39fdec === _0x1acd04 && _0x1acd04.parentNode === _0x1ac88b.layer && _0x1acd04._previewCandidateSyncSig === _0x4f100d) {
      const _0x51744b = _0x1acd04.querySelector?.(".v2-fast-preview-media");
      if (_0x51744b && _0x23c879.has(_0x51744b)) {
        _0x51744b._previewMediaQueuePriority = resolveRendererFastPreviewMediaQueuePriority(_0x216a46, _0x1ac88b.options);
        _0x1ac88b.pendingMediaPriorityChanged = true;
      }
      return {
        createdCount: 0,
        imageCount: 0,
        reusedCount: 0,
        srcAssignedCount: 0
      };
    }
    const _0x1491ec = _0x1ac88b.mediaPlan.nodeIdsWithMedia.has(_0x4ce3ba);
    const _0x11e617 = _0x1ac88b.mediaPlan.explicitMediaSourceOwnerIds === null || _0x1ac88b.mediaPlan.explicitMediaSourceOwnerIds.has(_0x4ce3ba) || _0x216a46.fullEligibleVisible || _0x5c9021 || _0x5ee605 === "video" && _0x216a46.motionFront;
    const _0xc60d92 = _0x11e617 || _0x1ac88b.options?.previewMotion?.zoomChanged !== true ? "" : getRetainablePaintedPreviewMediaSource(_0x1acd04, _0x54e5f1);
    const _0x26d6fa = _0x11e617 || !!_0xc60d92;
    if (_0x26d6fa) {
      _0x1acd04.dataset.mediaSourceOwner = "1";
    } else {
      delete _0x1acd04.dataset.mediaSourceOwner;
    }
    const _0x5af10a = _0x1ac88b.viewportBusy === true || _0x1ac88b.options?.suppressNewMedia === true;
    const _0x1c5667 = _0x1491ec && _0x5ee605 === "video" && _0x54e5f1.length > 0 && (_0x216a46.motionFront || _0x5c9021 && (_0x216a46.mounted || _0x1ac88b.requiredImmediateMediaSourceOwnerIds === null || _0x1ac88b.requiredImmediateMediaSourceOwnerIds.has(_0x4ce3ba)));
    const _0x482de5 = _0x1491ec && _0x5ee605 === "image" && _0x54e5f1.length > 0 && (_0x216a46.fullEligibleVisible || _0x5c9021 && (_0x216a46.mounted || _0x1ac88b.requiredImmediateMediaSourceOwnerIds === null || _0x1ac88b.requiredImmediateMediaSourceOwnerIds.has(_0x4ce3ba)));
    const _0x12934e = _0x26d6fa && (!_0x1491ec || _0x1ac88b.options?.suspendNewMediaSrc === true) ? getReusableLoadedPreviewMediaSource(_0x1acd04, _0x54e5f1) : "";
    const _0x207911 = _0x26d6fa && _0x5af10a && (!_0x1491ec || !_0x12934e) ? getReusableCurrentPreviewMediaSource(_0x1acd04, _0x54e5f1) : "";
    let _0x3677d3 = [];
    if (_0x1491ec && (_0x1ac88b.options?.suspendNewMediaSrc !== true || _0x1c5667 || _0x482de5)) {
      _0x3677d3 = _0x54e5f1;
    } else if (_0xc60d92) {
      _0x3677d3 = [_0xc60d92];
    } else if (_0x12934e) {
      _0x3677d3 = [_0x12934e];
    } else if (_0x207911) {
      _0x3677d3 = [_0x207911];
    }
    const _0x14042a = _0x3677d3.length > 0;
    const _0xde4df8 = _0x1491ec && _0x14042a && (_0x216a46.selected || _0x216a46.retained || _0x216a46.mounted);
    const _0x167fbe = _0x14042a && previewMediaNeedsSrc(_0x1acd04, _0x3677d3);
    const _0x41d626 = _0x5ee605 === "video" && _0x14042a;
    const _0x544246 = (_0x216a46.fullEligibleVisible || _0x5c9021) && (_0x5ee605 === "video" || _0x1ac88b.visibleMediaCandidateCount <= _0x1ac88b.immediateMediaSrcLimit);
    const _0x387c91 = _0x1491ec && _0x14042a && (_0xde4df8 || _0x544246);
    const _0x3083ab = _0x41d626 && _0x387c91;
    const _0x3205ea = _0x1491ec && _0x14042a && (_0x216a46.fullEligibleVisible || _0x216a46.fullEligibleMotionAhead || _0x5c9021 || _0x216a46.motionFront || _0x216a46.motionAhead || _0xde4df8);
    const _0x1f92fc = _0x1491ec && _0x14042a && _0x1ac88b.mediaPlan.lowPriority === true && _0x1ac88b.viewportBusy !== true && _0x2dcdc5;
    const _0xafd47d = _0x167fbe && !_0x387c91 && (_0x1ac88b.immediateMediaSrcSlotsRef.value <= 0 || _0x41d626 && _0x1ac88b.immediateVideoMediaSrcSlotsRef.value <= 0);
    if (_0x167fbe && !_0xafd47d) {
      if (!_0x387c91) {
        _0x1ac88b.immediateMediaSrcSlotsRef.value -= 1;
      }
      if (_0x41d626 && !_0x387c91) {
        _0x1ac88b.immediateVideoMediaSrcSlotsRef.value -= 1;
      }
    }
    const _0x3b648f = _0x1491ec && _0x14042a && _0x1ac88b.mediaPlan.prefetchAhead === true || _0x1f92fc;
    const _0x1197bb = syncPreviewEl(_0x1acd04, _0x18004d, {
      kind: _0x5ee605,
      text: _0x216a46.text ?? getPreviewText(_0x18004d, _0x5ee605),
      sources: _0x3677d3,
      geometry: _0x3b9844,
      offsetX: _0x1ac88b.layerBounds.offsetX,
      offsetY: _0x1ac88b.layerBounds.offsetY,
      mediaLoading: _0x3205ea || _0x3b648f ? "eager" : _0x1ac88b.mediaLoading,
      mediaFetchPriority: _0x3205ea || _0x3b648f ? "high" : _0x1ac88b.mediaFetchPriority,
      mediaCritical: _0x387c91,
      mediaDirectWhenBlank: _0x216a46.fullEligibleVisible || _0x5c9021 || _0x1491ec && _0x216a46.motionFront,
      mediaFallbackWhileDecoding: _0x216a46.fullEligiblePreview,
      mediaHoldFallbackWhileBusy: _0x1ac88b.viewportBusy && _0x1ac88b.options?.suspendNewMediaSrc === true,
      viewportBusy: _0x1ac88b.viewportBusy,
      placeholderReady: _0x54e5f1.length === 0,
      preserveInFlightResource: _0x1ac88b.options?.suspendNewMediaSrc !== true,
      queuePriority: resolveRendererFastPreviewMediaQueuePriority(_0x216a46, _0x1ac88b.options),
      deferMediaSrc: _0xafd47d,
      scheduleMediaSrc: _0x14c43c,
      cancelPendingMediaSrc: _0x17b20d,
      onMediaPresented: _0x26d95c
    });
    if (_0x26d6fa && restorePaintedPreviewMedia(_0x1acd04)) {
      _0x1acd04.dataset.mediaSourceOwner = "1";
    }
    syncPreviewConnectionState(_0x1acd04, _0x18004d, _0x1ac88b.options);
    _0x1acd04._previewCandidateSyncSig = buildPreviewCandidateSyncSignature(_0x216a46, _0x1ac88b, _0x1acd04);
    return {
      createdCount: _0x20cd40,
      imageCount: Number(_0x1197bb?.imageCount || 0),
      reusedCount: _0x30d4c7,
      srcAssignedCount: Number(_0x1197bb?.srcAssignedCount || 0)
    };
  }
  function _0x166ff6() {
    const _0x5edcf1 = isPerfProbeEnabled();
    const _0x4d8bac = _0x5edcf1 ? nowPerf() : 0;
    _0x793256 = null;
    const _0x1e4484 = _0x235dbf;
    if (!_0x1e4484 || _0x1e4484.generation !== _0x4c5767 || _0x1e4484.layer?.isConnected === false) {
      _0x235dbf = null;
      return;
    }
    let _0x4e94b0 = Number(_0x1e4484.createBatchSize) || FAST_PREVIEW_FALLBACK_NODE_CREATE_BATCH_SIZE;
    let _0x4c2fd0 = 0;
    let _0xe19050 = 0;
    let _0x3566d7 = 0;
    let _0xc9536f = 0;
    while (_0x4e94b0 > 0 && _0x1e4484.candidates.length > 0) {
      const _0x517fc1 = _0x5cdd6c(_0x1e4484.candidates.shift(), _0x1e4484);
      _0x4c2fd0 += Number(_0x517fc1?.createdCount || 0);
      _0xe19050 += Number(_0x517fc1?.imageCount || 0);
      _0x3566d7 += Number(_0x517fc1?.reusedCount || 0);
      _0xc9536f += Number(_0x517fc1?.srcAssignedCount || 0);
      _0x4e94b0 -= 1;
    }
    if (_0x1e4484.pendingMediaPriorityChanged) {
      _0x5be956();
      _0x1e4484.pendingMediaPriorityChanged = false;
    }
    if (_0x1e4484.viewportBusy === true) {
      _0x2f0257 = Math.min(_0x2f0257, Math.max(0, _0x1e4484.immediateMediaSrcSlotsRef.value));
      _0x3a6a6e = Math.min(_0x3a6a6e, Math.max(0, _0x1e4484.immediateVideoMediaSrcSlotsRef.value));
    }
    if (_0x5edcf1) {
      const _0x3c8a93 = nowPerf();
      recordFastPreviewSample("create-batch", _0x3c8a93 - _0x4d8bac, {
        createdCount: _0x4c2fd0,
        endPerf: _0x3c8a93,
        imageCount: _0xe19050,
        pendingCreateCount: _0x1e4484.candidates.length,
        pendingMediaSrcCount: _0x234a5d.length,
        poolSize: _0x2be93f.length,
        reusedCount: _0x3566d7,
        srcAssignedCount: _0xc9536f,
        startPerf: _0x4d8bac,
        zoom: _0x1e4484.options?.viewport?.zoom
      });
    }
    if (_0x1e4484.candidates.length > 0) {
      _0x793256 = _0x57fba1(_0x166ff6);
    } else {
      _0x235dbf = null;
      _0x51f700();
    }
  }
  function _0x1fba98(_0x88d9c) {
    if (!_0x88d9c) {
      return null;
    }
    if (_0x4be843 && _0x4be843.parentNode !== _0x88d9c) {
      _0x4be843.remove?.();
      _0x4be843 = null;
    }
    if (!_0x4be843) {
      _0x4be843 = document.createElement("div");
      _0x4be843.className = "v2-fast-preview-layer";
      _0x4be843.dataset.role = "fast-preview-layer";
    }
    if (!_0x4be843.isConnected) {
      if (typeof _0x88d9c.prepend === "function") {
        _0x88d9c.prepend(_0x4be843);
      } else {
        _0x88d9c.appendChild(_0x4be843);
      }
    }
    return _0x4be843;
  }
  function _0xae70f4({
    preserveStagedReleases = false
  } = {}) {
    _0x151ac8();
    _0x397e91();
    for (const _0x4ae389 of _0x3f7012.values()) {
      if (typeof _0x4ae389 === "function") {
        _0x4ae389();
      }
    }
    _0x3f7012.clear();
    if (!preserveStagedReleases) {
      for (const _0xcfede6 of Array.from(_0x12280b.values())) {
        _0x4e13ca(_0xcfede6, {
          cache: false
        });
      }
    }
    _0x43efea.forEach((_0x330b75, _0x5b031e) => {
      _0x1b2fbf(_0x5b031e, false);
      _0x566b7e(_0x330b75);
    });
    _0x43efea.clear();
    _0x2be93f.forEach(_0x36cd7a => _0x566b7e(_0x36cd7a));
    _0x2be93f.length = 0;
    _0x2220f7.forEach(_0x1c7c81 => _0x566b7e(_0x1c7c81));
    _0x2220f7.clear();
    _0x10ed89.clear();
    _0x45c8d8.clear();
    _0x341ca9 = null;
    _0x2777ed = 0;
    _0xa54ff2 = false;
    _0x5a5f80 = null;
    if (!preserveStagedReleases || _0x12280b.size === 0) {
      _0x4be843?.remove?.();
      _0x4be843 = null;
    }
    _0x1f2cf2 = createEmptyStats();
  }
  function _0x51f700() {
    const _0x1791c4 = createEmptyStats();
    for (const [_0x183a1f, _0x326b89] of _0x43efea.entries()) {
      _0x1b2fbf(_0x183a1f, true);
      _0x1791c4.fastPreviewCount += 1;
      if (isElementVisible(_0x326b89)) {
        _0x1791c4.visibleFastPreviewCount += 1;
      }
      if (_0x326b89?.dataset?.hasMedia === "1") {
        _0x1791c4.previewWithMediaCount += 1;
      }
      const _0x396c7d = _0x2d324b?.(_0x183a1f);
      if (_0x56fefe?.(_0x183a1f) && _0x396c7d?.isConnected !== false && (_0x396c7d?.classList?.contains?.("v2-node-detail-deferred") || _0x396c7d?.dataset?.detailStage === "deferred")) {
        _0x1791c4.deferredMountedWithPreviewCount += 1;
      }
    }
    for (const {
      el: _0x530766
    } of _0x12280b.values()) {
      _0x1791c4.stagedPreviewCount += 1;
      if (_0x530766?.isConnected === false) {
        continue;
      }
      _0x1791c4.connectedStagedPreviewCount += 1;
      _0x1791c4.fastPreviewCount += 1;
      if (isElementVisible(_0x530766)) {
        _0x1791c4.visibleFastPreviewCount += 1;
      }
      if (_0x530766?.dataset?.hasMedia === "1") {
        _0x1791c4.previewWithMediaCount += 1;
      }
    }
    _0x1f2cf2 = _0x1791c4;
    return _0x1791c4;
  }
  function _0xaa1f7e(_0x5b0fcb) {
    const _0x352aef = String(_0x5b0fcb || "");
    const _0x4756d7 = _0x3f7012.get(_0x352aef);
    if (typeof _0x4756d7 === "function") {
      _0x4756d7();
    }
    _0x3f7012.delete(_0x352aef);
  }
  function _0x12aeb4(_0x1776bf, _0x3f548d) {
    const _0x19dec8 = String(_0x1776bf || "");
    if (!_0x19dec8 || !_0x3f548d) {
      return;
    }
    if (_0x24ea03(_0x19dec8, _0x3f548d)) {
      _0xaa1f7e(_0x19dec8);
      _0x57fba1(() => {
        const _0x55bd3b = _0x2d324b?.(_0x19dec8);
        if (_0x2d3933(_0x19dec8, _0x55bd3b) && _0x24ea03(_0x19dec8, _0x55bd3b)) {
          try {
            _0x26d95c?.(_0x19dec8, _0x55bd3b);
          } catch {}
          _0x57c45b(_0x19dec8);
        }
      });
      return;
    }
    if (_0x3f7012.has(_0x19dec8)) {
      return;
    }
    const _0x24b8f4 = [...(_0x3f548d.querySelectorAll?.("img") || []), ...(_0x3f548d.querySelectorAll?.("video") || [])];
    if (_0x24b8f4.length === 0) {
      return;
    }
    const _0xd0cee8 = () => {
      const _0x5db18a = _0x2d324b?.(_0x19dec8);
      if (!_0x2d3933(_0x19dec8, _0x5db18a) || !_0x24ea03(_0x19dec8, _0x5db18a)) {
        return;
      }
      try {
        _0x26d95c?.(_0x19dec8, _0x5db18a);
      } catch {}
      _0x57c45b(_0x19dec8);
    };
    for (const _0x52be4c of _0x24b8f4) {
      _0x52be4c.addEventListener?.("load", _0xd0cee8);
      _0x52be4c.addEventListener?.("loadeddata", _0xd0cee8);
      _0x52be4c.addEventListener?.("canplay", _0xd0cee8);
    }
    _0x3f7012.set(_0x19dec8, () => {
      for (const _0x4fa963 of _0x24b8f4) {
        _0x4fa963.removeEventListener?.("load", _0xd0cee8);
        _0x4fa963.removeEventListener?.("loadeddata", _0xd0cee8);
        _0x4fa963.removeEventListener?.("canplay", _0xd0cee8);
      }
    });
  }
  function _0x4e13ca(_0x4dc17c) {
    if (!_0x4dc17c || _0x12280b.get(_0x4dc17c.el) !== _0x4dc17c) {
      return;
    }
    _0x3c6f62(_0x4dc17c.finalizeFrameId);
    _0x4dc17c.finalizeFrameId = null;
    _0x12280b.delete(_0x4dc17c.el);
    if (_0x43efea.get(_0x4dc17c.nodeId) === _0x4dc17c.el) {
      return;
    }
    _0x1bdc62(_0x4dc17c.el);
  }
  function _0x315ea6(_0x5f5d97) {
    if (!_0x5f5d97 || _0x12280b.get(_0x5f5d97.el) !== _0x5f5d97) {
      return false;
    }
    const {
      el: _0x25dfa9,
      nodeId: _0x5b437a
    } = _0x5f5d97;
    _0x3c6f62(_0x5f5d97.finalizeFrameId);
    _0x5f5d97.finalizeFrameId = null;
    _0x12280b.delete(_0x25dfa9);
    delete _0x25dfa9.dataset.previewReleaseStage;
    Object.assign(_0x25dfa9.style, {
      display: "",
      opacity: "",
      pointerEvents: "",
      visibility: ""
    });
    const _0x1c526b = _0x5f5d97.layerEl || _0x4be843;
    if (_0x1c526b && _0x25dfa9.parentNode !== _0x1c526b) {
      _0x1c526b.appendChild(_0x25dfa9);
    }
    _0x43efea.set(_0x5b437a, _0x25dfa9);
    return true;
  }
  function _0x5d9c00(_0x5c72d6, _0x4ae5c3) {
    for (const _0x2d871d of Array.from(_0x12280b.values())) {
      const _0x4e6bfc = _0x5c72d6?.[_0x2d871d.nodeId];
      if (!_0x4e6bfc || !isRendererFastPreviewGeometryVisible(getPreviewGeometry(_0x4e6bfc), _0x4ae5c3)) {
        _0x4e13ca(_0x2d871d);
        continue;
      }
      const _0x3eb4e7 = _0x2d324b?.(_0x2d871d.nodeId);
      const _0x3b6d09 = _0x2d3933(_0x2d871d.nodeId, _0x3eb4e7);
      if (!_0x3b6d09 || !_0x24ea03(_0x2d871d.nodeId, _0x3eb4e7)) {
        _0x315ea6(_0x2d871d);
      }
    }
  }
  function _0x57c45b(_0xf71434, {
    collect = true
  } = {}) {
    const _0x3a6231 = String(_0xf71434 || "");
    const _0x29cef9 = _0x2d324b?.(_0x3a6231);
    if (!_0x3a6231 || !_0x29cef9 || !_0x2d3933(_0x3a6231, _0x29cef9) || !_0x24ea03(_0x3a6231, _0x29cef9)) {
      return false;
    }
    _0x45c8d8.delete(_0x3a6231);
    _0x1b2fbf(_0x3a6231, false);
    _0xaa1f7e(_0x3a6231);
    const _0x1ebb53 = _0x43efea.get(_0x3a6231);
    if (_0x235dbf?.candidates) {
      _0x235dbf.candidates = _0x235dbf.candidates.filter(_0x32fd21 => _0x32fd21.nodeId !== _0x3a6231);
    }
    if (!_0x1ebb53) {
      return true;
    }
    _0x43efea.delete(_0x3a6231);
    _0x11f3ed(_0x1ebb53);
    const _0x2f4d43 = _0x1ebb53.parentNode || _0x4be843;
    _0x1ebb53.dataset.previewReleaseStage = "detached";
    _0x1ebb53.remove?.();
    const _0x2b3b85 = {
      el: _0x1ebb53,
      nodeId: _0x3a6231,
      layerEl: _0x2f4d43,
      finalizeFrameId: null
    };
    _0x12280b.set(_0x1ebb53, _0x2b3b85);
    _0x2b3b85.finalizeFrameId = _0x57fba1(() => {
      _0x2b3b85.finalizeFrameId = null;
      _0x4e13ca(_0x2b3b85);
      _0x51f700();
    });
    if (collect) {
      _0x51f700();
    }
    return true;
  }
  function _0x3285bf(_0x173597) {
    const _0x3cd386 = String(_0x173597 || "");
    for (const _0x81c5b8 of Array.from(_0x12280b.values())) {
      if (_0x81c5b8.nodeId !== _0x3cd386) {
        continue;
      }
      _0x4e13ca(_0x81c5b8);
    }
  }
  function _0x3a45e7(_0x243a5f, {
    cache = true,
    collect = true
  } = {}) {
    const _0x4764c7 = String(_0x243a5f || "");
    _0x45c8d8.delete(_0x4764c7);
    _0x1b2fbf(_0x4764c7, false);
    _0xaa1f7e(_0x4764c7);
    _0x3285bf(_0x4764c7);
    const _0x4d1562 = _0x43efea.get(_0x4764c7);
    if (_0x235dbf?.candidates) {
      _0x235dbf.candidates = _0x235dbf.candidates.filter(_0x2428fa => _0x2428fa.nodeId !== _0x4764c7);
    }
    if (!_0x4d1562) {
      return;
    }
    _0x43efea.delete(_0x4764c7);
    const _0x12bae1 = _0x4d1562.querySelector?.(".v2-fast-preview-media");
    const _0x2c7ab9 = isPreviewMediaResourceProtected(_0x12bae1);
    if (!cache && !_0x2c7ab9 || !_0x5b11e1(_0x4764c7, _0x4d1562)) {
      _0x1bdc62(_0x4d1562);
    }
    if (collect) {
      _0x51f700();
    }
  }
  function _0x2e1e59(_0xe19d20) {
    const _0x4c5c93 = _0xe19d20 && typeof _0xe19d20[Symbol.iterator] === "function" ? new Set(Array.from(_0xe19d20, _0x27da57 => String(_0x27da57 || ""))) : new Set();
    let _0x4b0f8f = 0;
    for (const _0x51b59a of Array.from(_0x43efea.keys())) {
      if (_0x4c5c93.has(_0x51b59a)) {
        continue;
      }
      _0x3a45e7(_0x51b59a, {
        collect: false
      });
      _0x4b0f8f += 1;
    }
    for (const _0x16db25 of Array.from(_0x12280b.values())) {
      if (_0x4c5c93.has(_0x16db25.nodeId)) {
        continue;
      }
      _0x4e13ca(_0x16db25);
    }
    if (_0x4b0f8f > 0) {
      _0x51f700();
    }
    return _0x4b0f8f;
  }
  function _0x51887e(_0x2bf47c) {
    if (!_0x2bf47c) {
      return false;
    }
    if (_0x2bf47c.classList?.contains?.("selected") || _0x2bf47c.classList?.contains?.("v2-selected")) {
      return true;
    }
    const _0xbffdee = typeof document !== "undefined" ? document.activeElement : null;
    return !!_0xbffdee && !!_0x2bf47c.contains?.(_0xbffdee);
  }
  function _0x15d1bc(_0x36459e, _0x1ef71c, _0x51620f = {}) {
    if (!_0x36459e || !_0x1ef71c) {
      return false;
    }
    const _0x5282e1 = _0x51620f?.dragTargets;
    if (!_0x5282e1?.has?.(_0x36459e)) {
      return false;
    }
    const _0x346510 = _0x51620f?.dragContext || {};
    if (_0x346510.isDragging !== true || _0x346510.isCommittingDrag === true) {
      return false;
    }
    const _0x30e8f5 = toNumber(_0x346510.pendingDx, 0);
    const _0x41b4de = toNumber(_0x346510.pendingDy, 0);
    return _0x346510.hasMoved === true || Math.hypot(_0x30e8f5, _0x41b4de) > 0;
  }
  function _0x4c0732(_0x5a5d74, _0x1323b5, {
    kind = "",
    hasMedia = false,
    dragTargets = null,
    dragContext = null,
    fullEligibleVisible = false
  } = {}) {
    const _0x153ee3 = _0x45c8d8.has(String(_0x5a5d74 || ""));
    const _0x37f11a = _0x2d324b?.(_0x5a5d74);
    const _0x143ce8 = _0x2d3933(_0x5a5d74, _0x37f11a);
    const _0x56a326 = kind === "image" || kind === "video";
    const _0x37269 = _0x143ce8 && _0x56a326 && hasMedia ? _0x24ea03(_0x5a5d74, _0x37f11a) : true;
    if (kind === "video" && _0x143ce8 && hasActiveMountedVideoPlayback(_0x37f11a)) {
      _0x45c8d8.delete(String(_0x5a5d74 || ""));
      _0xaa1f7e(_0x5a5d74);
      return false;
    }
    if (kind === "image" && fullEligibleVisible && _0x143ce8 && _0x37269) {
      _0x45c8d8.delete(String(_0x5a5d74 || ""));
      _0xaa1f7e(_0x5a5d74);
      return false;
    }
    if (_0x143ce8 && _0x15d1bc(_0x5a5d74, _0x37f11a, {
      dragTargets: dragTargets,
      dragContext: dragContext
    })) {
      _0xaa1f7e(_0x5a5d74);
      return false;
    }
    if (_0x143ce8 && _0x56a326 && hasMedia && _0x37269 && isFastPreviewReleasedForPlayback(_0x37f11a)) {
      _0xaa1f7e(_0x5a5d74);
      return false;
    }
    if (_0x1323b5?.has?.(_0x5a5d74) || _0x51887e(_0x37f11a)) {
      if (!_0x143ce8) {
        return true;
      }
      if (hasMedia && _0x56a326 && !_0x37269) {
        _0x12aeb4(_0x5a5d74, _0x37f11a);
        return true;
      }
      _0x45c8d8.delete(String(_0x5a5d74 || ""));
      _0xaa1f7e(_0x5a5d74);
      return false;
    }
    if (_0x153ee3) {
      if (!_0x143ce8) {
        return hasMedia;
      }
      if (hasMedia && _0x56a326 && !_0x37269) {
        _0x12aeb4(_0x5a5d74, _0x37f11a);
        return true;
      }
      _0x45c8d8.delete(String(_0x5a5d74 || ""));
      _0xaa1f7e(_0x5a5d74);
      return false;
    }
    if (!_0x143ce8) {
      return true;
    }
    if ((kind === "image" || kind === "video") && !hasMedia) {
      return false;
    }
    if (hasMedia && _0x56a326 && !_0x37269) {
      _0x12aeb4(_0x5a5d74, _0x37f11a);
      return true;
    }
    _0xaa1f7e(_0x5a5d74);
    if (_0x37f11a.classList?.contains?.("v2-node-detail-deferred") || _0x37f11a.dataset?.detailStage === "deferred") {
      return true;
    }
    return false;
  }
  function _0x519e9d(_0x1e19d1, _0x2259ac, _0x421f7e = {}) {
    if (getPreviewKind(_0x2259ac) !== "image" || _0x421f7e.fullEligibleVisibleImageNodeIds?.has?.(_0x1e19d1) !== true) {
      return false;
    }
    const _0x28df92 = _0x2d324b?.(_0x1e19d1);
    return !!_0x2d3933(_0x1e19d1, _0x28df92) && !!_0x24ea03(_0x1e19d1, _0x28df92);
  }
  function _0xc0e02b(_0x2c6298) {
    if (!_0x2c6298) {
      return;
    }
    _0x45c8d8.add(String(_0x2c6298));
  }
  function _0x38d428(_0x10df1f, _0x5c93d4 = _0x341ca9?.[String(_0x10df1f || "")]) {
    const _0x2b0571 = _0x43efea.get(String(_0x10df1f || ""));
    const _0xea1b89 = _0x2b0571?.querySelector?.(".v2-fast-preview-media");
    if (!_0x2b0571 || _0x2b0571.isConnected === false || !isPreviewMediaLoaded(_0xea1b89)) {
      return false;
    }
    if (String(_0xea1b89?.tagName || "").toLowerCase() === "img" && typeof _0xea1b89?.complete === "boolean" && (_0xea1b89.complete !== true || Number(_0xea1b89.naturalWidth || 0) <= 0)) {
      return false;
    }
    for (const _0x254a6c of [_0x4be843, _0x2b0571, _0xea1b89]) {
      if (!isElementVisible(_0x254a6c)) {
        return false;
      }
    }
    return isPresentationMediaSourceForNode(_0xea1b89, _0x5c93d4);
  }
  function _0x47b597(_0x3b6373, _0x17a12a = _0x341ca9?.[String(_0x3b6373 || "")]) {
    const _0x36f6c9 = String(_0x3b6373 || "");
    if (_0x38d428(_0x36f6c9, _0x17a12a)) {
      return true;
    }
    const _0xa9db29 = _0x2d324b?.(_0x36f6c9);
    return !!_0x2d3933(_0x36f6c9, _0xa9db29) && !!_0x24ea03(_0x36f6c9, _0xa9db29, _0x17a12a);
  }
  function _0x4734ac(_0x391838) {
    return _0x43efea.has(String(_0x391838 || ""));
  }
  function _0x7e5474(_0x1b426a) {
    if (!_0x1b426a) {
      return;
    }
    const _0x5e1dac = _0x2d324b?.(_0x1b426a);
    if (!_0x2d3933(_0x1b426a, _0x5e1dac)) {
      return false;
    }
    return _0x57c45b(_0x1b426a);
  }
  function _0x4d1c91(_0x31873a, {
    dx = 0,
    dy = 0,
    active = false,
    settle = false,
    remove = false
  } = {}) {
    const _0x2df422 = String(_0x31873a || "").trim();
    if (!_0x2df422) {
      return false;
    }
    if (remove === true) {
      _0x3a45e7(_0x2df422);
      return true;
    }
    const _0x273de9 = _0x43efea.get(_0x2df422);
    if (!_0x273de9) {
      return false;
    }
    if (active !== true && settle === true) {
      const _0xbc8f54 = _0x2d324b?.(_0x2df422);
      if (_0x2d3933(_0x2df422, _0xbc8f54)) {
        _0x3a45e7(_0x2df422);
        return true;
      }
      return settlePreviewDragState(_0x273de9, dx, dy);
    }
    _0x273de9._previewDragActive = active === true;
    _0x273de9._previewDragDx = toNumber(dx, 0);
    _0x273de9._previewDragDy = toNumber(dy, 0);
    return applyPreviewDragTransform(_0x273de9);
  }
  function _0x169648(_0xa7e55c, _0x3bc750, _0x32d9fe, _0x4ae788, _0x172f3e = {}) {
    _0x341ca9 = _0x3bc750 && typeof _0x3bc750 === "object" ? _0x3bc750 : null;
    _0x47cf2a(_0x172f3e?.viewportBusy);
    const _0x421690 = _0x35fbd2() || isViewportInteractionBusyForPreview();
    _0x570a30(_0x421690);
    const _0x1d1a18 = _0x2feb92(_0x172f3e);
    const _0x1beacb = {
      ..._0x172f3e,
      previewMotion: _0x1d1a18,
      viewportBusy: _0x421690
    };
    _0x5d9c00(_0x3bc750, _0x1beacb);
    if (!shouldUseFastPreviewLayer(_0x3bc750, _0x32d9fe, _0x172f3e)) {
      return _0xae70f4({
        preserveStagedReleases: true
      });
    }
    for (const _0x3cd704 of Array.from(_0x43efea.keys())) {
      const _0x26a1fc = _0x3bc750?.[_0x3cd704];
      if (!shouldShowGenerationBusyUi(_0x26a1fc)) {
        continue;
      }
      const _0x1404a8 = _0x2d324b?.(_0x3cd704);
      if (!_0x2d3933(_0x3cd704, _0x1404a8) && isRendererFastPreviewGeometryVisible(getPreviewGeometry(_0x26a1fc), _0x1beacb)) {
        continue;
      }
      _0x3a45e7(_0x3cd704, {
        cache: false,
        collect: false
      });
    }
    const _0x59172d = isPerfProbeEnabled();
    const _0x2a4a78 = _0x59172d ? nowPerf() : 0;
    const _0x4bab60 = new Set(Array.from(_0x235dbf?.candidates || [], _0x546d5a => String(_0x546d5a?.nodeId || "")).filter(Boolean));
    const _0x103844 = [];
    const _0x3e32e1 = _0x32d9fe && typeof _0x32d9fe[Symbol.iterator] === "function" ? new Set(_0x32d9fe) : Object.keys(_0x3bc750 || {});
    if (_0x3e32e1 instanceof Set) {
      for (const _0x5120a3 of _0x43efea.keys()) {
        if (_0x3e32e1.has(_0x5120a3)) {
          continue;
        }
        const _0x5dc608 = _0x3bc750?.[_0x5120a3];
        const _0x3c10f6 = _0x2d324b?.(_0x5120a3);
        if (_0x5dc608 && !_0x2d3933(_0x5120a3, _0x3c10f6) && isRendererFastPreviewGeometryVisible(getPreviewGeometry(_0x5dc608), _0x1beacb)) {
          _0x3e32e1.add(_0x5120a3);
        }
      }
    }
    for (const _0x5aac96 of _0x3e32e1) {
      const _0x53339e = _0x3bc750?.[_0x5aac96];
      const _0x51702f = String(_0x53339e?.id || "");
      if (!_0x51702f) {
        continue;
      }
      const _0xca446d = shouldShowGenerationBusyUi(_0x53339e);
      let _0x5eb13c = null;
      if (_0xca446d) {
        const _0x2134d8 = _0x2d324b?.(_0x51702f);
        _0x5eb13c = getPreviewGeometry(_0x53339e);
        if (_0x2d3933(_0x51702f, _0x2134d8) || !isRendererFastPreviewGeometryVisible(_0x5eb13c, _0x1beacb)) {
          _0x3a45e7(_0x51702f, {
            cache: false,
            collect: false
          });
          continue;
        }
      }
      if (isWebPreviewNode(_0x53339e)) {
        continue;
      }
      const _0x454020 = Number.isFinite(Number(_0x53339e?._bizRev)) ? Number(_0x53339e._bizRev) : null;
      let _0x22857e = _0x10ed89.get(_0x51702f);
      if (_0x454020 === null || !_0x22857e || _0x22857e.nodeBizRev !== _0x454020) {
        const _0x7abdbf = getPreviewKind(_0x53339e);
        _0x22857e = {
          kind: _0x7abdbf,
          nodeBizRev: _0x454020,
          sourcesDisplayFirst: getPreviewMediaUrls(_0x53339e, _0x7abdbf, {
            displayFirst: true
          }),
          sourcesThumbnailFirst: getPreviewMediaUrls(_0x53339e, _0x7abdbf, {
            displayFirst: false
          }),
          text: getPreviewText(_0x53339e, _0x7abdbf)
        };
        if (_0x454020 === null) {
          _0x10ed89.delete(_0x51702f);
        } else {
          _0x10ed89.set(_0x51702f, _0x22857e);
        }
      }
      const _0x3e079b = _0x22857e.kind;
      const _0x286ade = _0x3e079b === "image" && _0x1beacb.fullEligibleVisibleImageNodeIds?.has?.(_0x51702f) === true;
      const _0x116630 = _0x3e079b === "image" && (_0x286ade || _0x1beacb.fullEligiblePreviewImageNodeIds?.has?.(_0x51702f) === true);
      const _0x28a811 = _0x116630 ? _0x22857e.sourcesDisplayFirst : _0x22857e.sourcesThumbnailFirst;
      if (!_0x4c0732(_0x51702f, _0x4ae788, {
        kind: _0x3e079b,
        hasMedia: _0x28a811.length > 0,
        dragTargets: _0x1beacb.dragTargets,
        dragContext: _0x1beacb.dragContext,
        fullEligibleVisible: _0x286ade
      })) {
        continue;
      }
      const _0x2496ac = _0x2d3933(_0x51702f);
      const _0x53e025 = _0x5eb13c || getPreviewGeometry(_0x53339e);
      _0x103844.push({
        node: _0x53339e,
        nodeId: _0x51702f,
        kind: _0x3e079b,
        sources: _0x28a811,
        text: _0x22857e.text,
        geometry: _0x53e025,
        selected: _0x4ae788?.has?.(_0x51702f) === true,
        fullEligibleVisible: _0x286ade,
        fullEligiblePreview: _0x116630,
        retained: _0x45c8d8.has(_0x51702f),
        continuationPending: _0x4bab60.has(_0x51702f),
        mounted: _0x2496ac
      });
    }
    for (const _0x42611b of _0x10ed89.keys()) {
      if (!_0x3bc750?.[_0x42611b]) {
        _0x10ed89.delete(_0x42611b);
      }
    }
    const _0x517c88 = planRendererFastPreviewAdmission({
      candidateSeeds: _0x103844,
      existingPreviewNodeIds: _0x43efea,
      options: _0x1beacb
    });
    const _0xd918dd = _0x517c88.candidates;
    if (_0xd918dd.length === 0) {
      let _0x394b48 = false;
      for (const _0x822ddf of Array.from(_0x43efea.keys())) {
        const _0x4edce1 = _0x3bc750?.[_0x822ddf];
        if (_0x519e9d(_0x822ddf, _0x4edce1, _0x1beacb)) {
          _0x3a45e7(_0x822ddf, {
            cache: false,
            collect: false
          });
          continue;
        }
        const _0x18f908 = _0x2d324b?.(_0x822ddf);
        const _0x37e3f9 = _0x2d3933(_0x822ddf, _0x18f908);
        if (!_0x37e3f9 && _0x4edce1 && isRendererFastPreviewGeometryVisible(getPreviewGeometry(_0x4edce1), _0x1beacb)) {
          _0x394b48 = true;
          continue;
        }
        const _0x5a9276 = _0x37e3f9 && _0x57c45b(_0x822ddf, {
          collect: false
        });
        if (!_0x5a9276) {
          _0x3a45e7(_0x822ddf, {
            collect: false
          });
        }
      }
      _0x51f700();
      if (_0x394b48) {
        return;
      }
      if (_0x12280b.size > 0) {
        return;
      }
      return _0xae70f4({
        preserveStagedReleases: true
      });
    }
    const _0x290e11 = _0x1fba98(_0xa7e55c);
    if (!_0x290e11) {
      return;
    }
    const _0x2fb5c7 = syncLayerBounds(_0x290e11, _0xd918dd, {
      preserveAnchor: _0x421690
    }) || {
      offsetX: 0,
      offsetY: 0
    };
    _0x151ac8();
    _0x4c5767 += 1;
    const _0x38358c = _0x517c88.liveIds;
    const _0x250c9a = _0x517c88.candidates;
    const _0x587178 = _0x517c88.mediaPlan;
    if (_0x587178.explicitMediaSourceOwnerIds !== null) {
      const _0x2ced90 = new Set();
      for (const _0x1aa506 of _0x43efea.keys()) {
        if (_0x38358c.has(_0x1aa506)) {
          continue;
        }
        const _0x427573 = _0x3bc750?.[_0x1aa506];
        const _0x18d939 = _0x2d324b?.(_0x1aa506);
        if (_0x427573 && !_0x2d3933(_0x1aa506, _0x18d939) && isRendererFastPreviewGeometryVisible(getPreviewGeometry(_0x427573), _0x1beacb)) {
          _0x2ced90.add(_0x1aa506);
        }
      }
      _0x57416c(new Set([..._0x587178.explicitMediaSourceOwnerIds, ..._0x587178.nodeIdsWithMedia, ..._0x2ced90]), {
        preservePaintedMediaOwners: _0x1beacb.previewMotion?.zoomChanged === true
      });
    }
    const _0x4e18ec = _0x587178.lowPriority ? "lazy" : "eager";
    const _0x48d3d3 = _0x587178.lowPriority ? "auto" : "high";
    const _0x4a956c = _0x517c88.immediateMediaSrcLimit;
    const _0x1db174 = _0x1beacb.requiredImmediateMediaSourceOwnerIds != null && typeof _0x1beacb.requiredImmediateMediaSourceOwnerIds?.[Symbol.iterator] === "function" ? new Set(Array.from(_0x1beacb.requiredImmediateMediaSourceOwnerIds, _0x2a42c5 => String(_0x2a42c5 || "")).filter(Boolean)) : null;
    if (!_0x421690) {
      _0x2f0257 = Number.POSITIVE_INFINITY;
      _0x3a6a6e = Number.POSITIVE_INFINITY;
      if (_0x234a5d.length > 0) {
        _0x478ef5();
      }
    }
    const _0x34945d = {
      candidates: [],
      generation: _0x4c5767,
      immediateMediaSrcSlotsRef: {
        value: _0x421690 ? Math.min(_0x2f0257, _0x4a956c) : _0x4a956c
      },
      immediateMediaSrcLimit: _0x4a956c,
      immediateVideoMediaSrcSlotsRef: {
        value: _0x421690 ? Math.min(_0x3a6a6e, _0x517c88.immediateVideoMediaSrcLimit) : _0x517c88.immediateVideoMediaSrcLimit
      },
      createBatchSize: _0x517c88.createBatchSize,
      layer: _0x290e11,
      layerBounds: _0x2fb5c7,
      mediaFetchPriority: _0x48d3d3,
      mediaLoading: _0x4e18ec,
      mediaPlan: _0x587178,
      options: _0x1beacb,
      pendingMediaPriorityChanged: false,
      requiredImmediateMediaSourceOwnerIds: _0x1db174,
      visibleMediaCandidateCount: _0x517c88.visibleMediaCandidateCount,
      viewportBusy: _0x421690
    };
    const _0x2c2b5d = _0x517c88.deferredCandidates;
    let _0xec5cab = 0;
    let _0x59d777 = 0;
    let _0x2a842e = 0;
    let _0x17d8b2 = 0;
    for (const _0x5d5d77 of _0x517c88.immediateCandidates) {
      const _0x4251bb = _0x5cdd6c(_0x5d5d77, _0x34945d);
      _0xec5cab += Number(_0x4251bb?.createdCount || 0);
      _0x59d777 += Number(_0x4251bb?.imageCount || 0);
      _0x2a842e += Number(_0x4251bb?.reusedCount || 0);
      _0x17d8b2 += Number(_0x4251bb?.srcAssignedCount || 0);
    }
    if (_0x34945d.pendingMediaPriorityChanged) {
      _0x5be956();
      _0x34945d.pendingMediaPriorityChanged = false;
    }
    if (_0x421690) {
      _0x2f0257 = Math.min(_0x2f0257, Math.max(0, _0x34945d.immediateMediaSrcSlotsRef.value));
      _0x3a6a6e = Math.min(_0x3a6a6e, Math.max(0, _0x34945d.immediateVideoMediaSrcSlotsRef.value));
    }
    let _0x11a624 = 0;
    for (const _0x36e128 of Array.from(_0x43efea.keys())) {
      if (!_0x38358c.has(_0x36e128)) {
        const _0x79048a = _0x3bc750?.[_0x36e128];
        if (_0x519e9d(_0x36e128, _0x79048a, _0x1beacb)) {
          _0x3a45e7(_0x36e128, {
            cache: false,
            collect: false
          });
          _0x11a624 += 1;
          continue;
        }
        const _0x42dfb1 = _0x2d324b?.(_0x36e128);
        const _0x5212fc = _0x2d3933(_0x36e128, _0x42dfb1);
        if (!_0x5212fc && _0x79048a && isRendererFastPreviewGeometryVisible(getPreviewGeometry(_0x79048a), _0x1beacb)) {
          _0x38358c.add(_0x36e128);
          continue;
        }
        const _0x4ffeda = _0x5212fc && _0x57c45b(_0x36e128, {
          collect: false
        });
        if (!_0x4ffeda) {
          _0x3a45e7(_0x36e128, {
            collect: false
          });
        }
        _0x11a624 += 1;
      }
    }
    if (_0x2c2b5d.length > 0) {
      _0x235dbf = {
        ..._0x34945d,
        candidates: _0x2c2b5d
      };
      _0x793256 = _0x57fba1(_0x166ff6);
    }
    _0x51f700();
    if (_0x59172d) {
      const _0x268b62 = nowPerf();
      recordFastPreviewSample("sync-immediate", _0x268b62 - _0x2a4a78, {
        candidateCount: _0x250c9a.length,
        createdCount: _0xec5cab,
        endPerf: _0x268b62,
        imageCount: _0x59d777,
        pendingCreateCount: _0x2c2b5d.length,
        pendingMediaSrcCount: _0x234a5d.length,
        poolSize: _0x2be93f.length,
        removedCount: _0x11a624,
        reusedCount: _0x2a842e,
        srcAssignedCount: _0x17d8b2,
        startPerf: _0x2a4a78,
        zoom: _0x172f3e?.viewport?.zoom
      });
    }
  }
  return {
    clear: _0xae70f4,
    getStats: () => ({
      ..._0x1f2cf2
    }),
    hasNodePreview: _0x4734ac,
    isNodePresentationReady: _0x47b597,
    isNodePreviewReady: _0x38d428,
    releaseNode: _0x7e5474,
    removeNode: _0x3a45e7,
    prune: _0x2e1e59,
    reconcileMediaSourceOwners: _0x57416c,
    retainNode: _0xc0e02b,
    sync: _0x169648,
    syncNodeDragPreview: _0x4d1c91
  };
}