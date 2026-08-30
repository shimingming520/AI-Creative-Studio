import { generateThumbnail } from "../modules/imageUtils.js";
import { ensureLocalImageDerivatives, uploadFile } from "./projectService.js";
import { buildImageNodeStorageFields } from "./imageDerivativeService.js";
import a1539_0x145a5f from "../core/stores/appStore.js";
import { screenToWorld } from "../core/math.js";
import { showError, showWarning } from "./toastService.js";
import { setThumbnail } from "./thumbnailCacheService.js";
import { installMediaTaskUpdateListener, shouldApplyMediaTaskEventToNode } from "./mediaTaskService.js";
import { logDiagnosticEvent } from "./diagnosticsService.js";
import { logDragImportProfile } from "./dragImportDiagnostics.js";
import { desktopBridge } from "./desktopBridge.js";
import { saveTextDownload } from "./downloadSaveService.js";
import { isProjectImportFileName } from "../utils/canvasProjectFileNames.js";
import { localPathToUrl, pickResultLocalPath } from "../utils/localMediaPath.js";
import { t } from "../i18n/index.js";
import { AI_GENERATION_NODE_SHORT_SIDE, AI_TEXT_DEFAULT_RATIO, MEDIA_CLIP_COMPACT_SIZE, SOURCE_MEDIA_AUTO_RESIZE_SHORT_SIDE } from "./mediaSizingPolicy.js";
export const CANVAS_VIDEO_IMPORT_MAX_BYTES = 314572800;
export const CANVAS_VIDEO_IMPORT_MAX_MB = Math.round(CANVAS_VIDEO_IMPORT_MAX_BYTES / 1024 / 1024);
import { WEB_PREVIEW_MIN_SIZE } from "../modules/webPreviewSizing.js";
import { WHITEBOARD_DEFAULT_SIZE } from "../modules/whiteboard/whiteboardNodeData.js";
export { AI_GENERATION_NODE_SHORT_SIDE, AI_TEXT_DEFAULT_RATIO, MEDIA_CLIP_COMPACT_SIZE, SOURCE_MEDIA_AUTO_RESIZE_SHORT_SIDE } from "./mediaSizingPolicy.js";
function _toOneLineMessage(_0x5e0f92) {
  const _0x42a3c2 = typeof _0x5e0f92 === "string" ? _0x5e0f92 : _0x5e0f92?.message ? String(_0x5e0f92.message) : t("fileService.unknownError");
  return _0x42a3c2.replace(/\s+/g, " ").trim();
}
function _profileDragImport(_0xcb7d45, _0xd0773e = {}) {
  logDragImportProfile(_0xcb7d45, _0xd0773e);
}
const ASSET_MEDIA_TASK_STATUS_RANK = new Map([["waiting", 1], ["processing", 2], ["cancelled", 3], ["failed", 3], ["complete", 3]]);
let _assetUpdatedListenerInstalled = false;
function normalizeAssetUpdatedAt(_0x9671d3) {
  const _0x45ac86 = String(_0x9671d3 || "").trim();
  if (!_0x45ac86) {
    return "";
  }
  const _0x2d8aad = Date.parse(_0x45ac86);
  if (Number.isFinite(_0x2d8aad)) {
    return _0x2d8aad;
  } else {
    return "";
  }
}
function normalizeAssetRevision(_0x86cd99) {
  const _0x1c98f5 = Math.trunc(Number(_0x86cd99));
  if (Number.isFinite(_0x1c98f5) && _0x1c98f5 > 0) {
    return _0x1c98f5;
  } else {
    return 0;
  }
}
export function shouldApplyElectronAssetUpdateToNode(_0x1cda76 = {}, _0x16c5be = {}) {
  const _0x12b08c = normalizeAssetRevision(_0x16c5be?.assetRevision);
  const _0xb8a168 = normalizeAssetRevision(_0x1cda76?.assetRevision);
  if (_0x12b08c > 0 && _0xb8a168 > 0) {
    return _0x12b08c > _0xb8a168;
  }
  const _0x1217ef = normalizeAssetUpdatedAt(_0x16c5be?.assetUpdatedAt || _0x16c5be?.updatedAt);
  const _0x50f6bb = normalizeAssetUpdatedAt(_0x1cda76?.assetUpdatedAt);
  const _0x26c0f7 = _0x1217ef !== "" && _0x50f6bb !== "";
  if (_0x26c0f7 && _0x1217ef < _0x50f6bb) {
    return false;
  }
  const _0x38d70a = {
    taskId: _0x16c5be?.mediaTaskId || "",
    kind: _0x16c5be?.mediaTaskKind || "",
    status: _0x16c5be?.mediaTaskStatus || ""
  };
  if (shouldApplyMediaTaskEventToNode(_0x1cda76, _0x38d70a)) {
    const _0x536880 = String(_0x38d70a.taskId || "").trim();
    const _0x5300f0 = String(_0x1cda76?.mediaTaskId || "").trim();
    if (!_0x536880 || !_0x5300f0 || _0x536880 === _0x5300f0) {
      const _0x50aa45 = ASSET_MEDIA_TASK_STATUS_RANK.get(String(_0x38d70a.status || "").trim().toLowerCase()) || 0;
      const _0x460bb9 = ASSET_MEDIA_TASK_STATUS_RANK.get(String(_0x1cda76?.mediaTaskStatus || "").trim().toLowerCase()) || 0;
      if (_0x50aa45 < _0x460bb9) {
        return false;
      }
    }
    return true;
  }
  return _0x26c0f7 && _0x1217ef > _0x50f6bb;
}
function assignPositiveNumber(_0x233b6d, _0x40eb72, ..._0x42cea6) {
  const _0x5208f8 = _0x42cea6.map(_0x1d2540 => Number(_0x1d2540)).find(_0x1ec303 => Number.isFinite(_0x1ec303) && _0x1ec303 > 0);
  if (_0x5208f8 !== undefined) {
    _0x233b6d[_0x40eb72] = _0x5208f8;
  }
}
export function buildElectronAssetNodePatch(_0x57904d = {}) {
  const _0x420011 = String(_0x57904d?.assetId || "").trim();
  if (!_0x420011) {
    return {};
  }
  const _0x4b7c37 = {
    assetId: _0x420011,
    localPath: _0x57904d?.localPath || _0x57904d?.originalLocalPath || "",
    originalLocalPath: _0x57904d?.originalLocalPath || _0x57904d?.localPath || "",
    displayLocalPath: _0x57904d?.displayLocalPath || "",
    thumbLocalPath: _0x57904d?.thumbLocalPath || _0x57904d?.posterLocalPath || "",
    posterLocalPath: _0x57904d?.posterLocalPath || "",
    waveformLocalPath: _0x57904d?.waveformLocalPath || "",
    derivativeStatus: _0x57904d?.derivativeStatus || _0x57904d?.status || "",
    mediaTaskId: _0x57904d?.mediaTaskId || "",
    mediaTaskKind: _0x57904d?.mediaTaskKind || "",
    mediaTaskStatus: _0x57904d?.mediaTaskStatus || "",
    mediaTaskProgress: Number(_0x57904d?.mediaTaskProgress || 0) || 0,
    mediaTaskError: _0x57904d?.mediaTaskError || "",
    videoProxyStatus: _0x57904d?.videoProxyStatus || "",
    videoProxyVersion: _0x57904d?.videoProxyVersion || "",
    videoCodec: _0x57904d?.videoCodec || ""
  };
  const _0x4919e4 = String(_0x57904d?.assetUpdatedAt || _0x57904d?.updatedAt || "").trim();
  const _0x3287f4 = normalizeAssetRevision(_0x57904d?.assetRevision);
  if (_0x3287f4 > 0) {
    _0x4b7c37.assetRevision = _0x3287f4;
  }
  if (_0x4919e4) {
    _0x4b7c37.assetUpdatedAt = _0x4919e4;
  }
  assignPositiveNumber(_0x4b7c37, "videoWidth", _0x57904d?.videoWidth, _0x57904d?.width);
  assignPositiveNumber(_0x4b7c37, "videoHeight", _0x57904d?.videoHeight, _0x57904d?.height);
  assignPositiveNumber(_0x4b7c37, "videoDuration", _0x57904d?.videoDuration);
  assignPositiveNumber(_0x4b7c37, "videoFps", _0x57904d?.videoFps);
  if (_0x57904d?.kind === "image") {
    _0x4b7c37.src = _0x57904d?.displayUrl || _0x57904d?.url || "";
    _0x4b7c37.imageUrl = _0x57904d?.displayUrl || _0x57904d?.url || "";
    _0x4b7c37.sourceUrl = _0x57904d?.originalUrl || "";
    _0x4b7c37.thumbUrl = _0x57904d?.thumbUrl || "";
  } else if (_0x57904d?.kind === "video") {
    _0x4b7c37.src = _0x57904d?.displayUrl || _0x57904d?.url || _0x57904d?.originalUrl || "";
    _0x4b7c37.videoUrl = _0x57904d?.displayUrl || _0x57904d?.url || _0x57904d?.originalUrl || "";
    _0x4b7c37.sourceUrl = _0x57904d?.originalUrl || _0x57904d?.url || "";
    _0x4b7c37.thumbUrl = _0x57904d?.posterUrl || _0x57904d?.thumbUrl || "";
  } else if (_0x57904d?.kind === "audio") {
    _0x4b7c37.src = _0x57904d?.originalUrl || _0x57904d?.url || "";
    _0x4b7c37.audioUrl = _0x57904d?.originalUrl || _0x57904d?.url || "";
  }
  return _0x4b7c37;
}
export function applyElectronAssetUpdate(_0x4b5b36 = {}, _0x29f0ab = a1539_0x145a5f) {
  const _0x2a83fc = String(_0x4b5b36?.assetId || "").trim();
  if (!_0x2a83fc) {
    return [];
  }
  const _0x2bfc69 = typeof _0x29f0ab?.getStateRaw === "function" ? _0x29f0ab.getStateRaw() : _0x29f0ab?.getState?.();
  const _0x578200 = _0x2bfc69?.nodes || {};
  const _0x42939e = [];
  Object.values(_0x578200).forEach(_0x1e157b => {
    if (String(_0x1e157b?.assetId || "").trim() !== _0x2a83fc) {
      return;
    }
    if (!shouldApplyElectronAssetUpdateToNode(_0x1e157b, _0x4b5b36)) {
      return;
    }
    const _0x43c3ed = buildElectronAssetNodePatch(_0x4b5b36);
    const _0x444730 = Object.entries(_0x43c3ed).some(([_0xba8a96, _0x173254]) => _0x1e157b?.[_0xba8a96] !== _0x173254);
    if (!_0x444730) {
      return;
    }
    _0x29f0ab.updateNodeData(_0x1e157b.id, _0x43c3ed);
    _0x42939e.push(_0x1e157b.id);
  });
  return _0x42939e;
}
function installElectronAssetUpdatedListener() {
  if (_assetUpdatedListenerInstalled) {
    return;
  }
  _assetUpdatedListenerInstalled = true;
  if (!desktopBridge.assetImport.canSubscribeUpdates()) {
    return;
  }
  desktopBridge.assetImport.onAssetUpdated(_0xa177a9 => {
    applyElectronAssetUpdate(_0xa177a9);
  });
}
installElectronAssetUpdatedListener();
installMediaTaskUpdateListener();
export function getBaseName(_0xf91ee7) {
  const _0x2ed800 = String(_0xf91ee7 || "").trim();
  return _0x2ed800.replace(/\.[^/.]+$/, "");
}
function getDefaultNodeName(_0x58ddd3) {
  const _0x520659 = {
    "source-image": t("fileService.defaultNames.image"),
    "source-video": t("fileService.defaultNames.video"),
    "source-audio": t("fileService.defaultNames.audio"),
    "media-clip": t("fileService.defaultNames.mediaClip"),
    "source-text": t("fileService.defaultNames.text")
  };
  return _0x520659[_0x58ddd3] || t("fileService.defaultNames.file");
}
export function getNodeTypeByFile(_0x714a91) {
  if (_0x714a91.type.startsWith("image/")) {
    return "source-image";
  }
  if (_0x714a91.type.startsWith("video/")) {
    return "source-video";
  }
  if (_0x714a91.type.startsWith("audio/")) {
    return "source-audio";
  }
  if (_0x714a91.type === "text/plain" || _0x714a91.name.endsWith(".txt")) {
    return "source-text";
  }
  return null;
}
export function getNodeDefaultSize(_0x330d75) {
  const _0x545db6 = {
    "source-image": {
      width: 512,
      height: 288
    },
    "source-video": {
      width: 512,
      height: 288
    },
    "web-preview": {
      ...WEB_PREVIEW_MIN_SIZE
    },
    "web-reference-card": {
      width: 420,
      height: 360
    },
    "source-audio": {
      width: 320,
      height: 140
    },
    "media-clip": {
      ...MEDIA_CLIP_COMPACT_SIZE
    },
    collage: {
      width: 576,
      height: 576
    },
    whiteboard: {
      ...WHITEBOARD_DEFAULT_SIZE
    },
    "source-text": {
      width: 512,
      height: 288
    },
    "comment-note": {
      width: 260,
      height: 120
    },
    debug: {
      width: 360,
      height: 640
    },
    storyboard: {
      width: 900,
      height: 900
    },
    "storyboard-script": {
      width: 1024,
      height: 576
    },
    "panorama-scene": {
      width: 1024,
      height: 576
    },
    "panorama-360": {
      width: 1024,
      height: 576
    }
  };
  return _0x545db6[_0x330d75] || {
    width: 320,
    height: 180
  };
}
export function getAutoMediaSizeByShortSide(_0x55bc5b, _0x1ba859, _0x78c5a1 = SOURCE_MEDIA_AUTO_RESIZE_SHORT_SIDE) {
  const _0x11e661 = Math.max(1, Number(_0x55bc5b) || 1);
  const _0x32b0df = Math.max(1, Number(_0x1ba859) || 1);
  const _0x9afeab = Math.max(1, Number(_0x78c5a1) || SOURCE_MEDIA_AUTO_RESIZE_SHORT_SIDE);
  const _0x5c3b14 = Math.min(_0x11e661, _0x32b0df);
  const _0x51c57c = _0x9afeab / _0x5c3b14;
  return {
    width: Math.max(1, Math.round(_0x11e661 * _0x51c57c)),
    height: Math.max(1, Math.round(_0x32b0df * _0x51c57c))
  };
}
export function getAIGenerationNodeSize(_0x2a53de, _0x374293, _0x19debc = AI_GENERATION_NODE_SHORT_SIDE) {
  const _0x2dfef2 = Math.max(1, Number(_0x19debc) || AI_GENERATION_NODE_SHORT_SIDE);
  const _0x1768fe = Number(_0x2a53de) || 0;
  const _0x68fb02 = Number(_0x374293) || 0;
  if (_0x1768fe > 0 && _0x68fb02 > 0) {
    return getAutoMediaSizeByShortSide(_0x1768fe, _0x68fb02, _0x2dfef2);
  }
  return {
    width: _0x2dfef2,
    height: _0x2dfef2
  };
}
export function getAIGenerationDefaultSizeByType(_0x425960, _0x31bc58 = AI_GENERATION_NODE_SHORT_SIDE) {
  const _0x26b183 = String(_0x425960 || "").trim();
  if (_0x26b183 === "ai-text") {
    return getAutoMediaSizeByShortSide(AI_TEXT_DEFAULT_RATIO.width, AI_TEXT_DEFAULT_RATIO.height, _0x31bc58);
  }
  if (_0x26b183 === "ai-image" || _0x26b183 === "ai-video") {
    return getAIGenerationNodeSize(undefined, undefined, _0x31bc58);
  }
  return {
    width: Math.max(1, Number(_0x31bc58) || AI_GENERATION_NODE_SHORT_SIDE),
    height: Math.max(1, Number(_0x31bc58) || AI_GENERATION_NODE_SHORT_SIDE)
  };
}
export function buildSourceMediaNodePayload(_0x10bb7c = {}) {
  const _0x504019 = String(_0x10bb7c.type || "").trim();
  if (_0x504019 !== "source-image" && _0x504019 !== "source-video") {
    throw new Error("Unsupported source media type: " + (_0x504019 || "unknown"));
  }
  const _0x2cb3bf = {
    ..._0x10bb7c,
    id: _0x10bb7c.id,
    type: _0x504019,
    x: Number(_0x10bb7c.x) || 0,
    y: Number(_0x10bb7c.y) || 0,
    src: _0x10bb7c.src || "",
    localPath: _0x10bb7c.localPath || "",
    fileName: _0x10bb7c.fileName || "",
    name: _0x10bb7c.name || getDefaultNodeName(_0x504019)
  };
  delete _0x2cb3bf.naturalWidth;
  delete _0x2cb3bf.naturalHeight;
  const _0xa293f9 = Number(_0x10bb7c.naturalWidth || 0);
  const _0x4c6041 = Number(_0x10bb7c.naturalHeight || 0);
  const _0x4ee1a2 = Number(_0x10bb7c.width || 0);
  const _0x2d6398 = Number(_0x10bb7c.height || 0);
  const _0x2d98cc = _0xa293f9 > 0 && _0x4c6041 > 0;
  const _0x3bf0c8 = _0x4ee1a2 > 0 && _0x2d6398 > 0;
  const _0x43a0d8 = _0x3bf0c8 && (_0x10bb7c.needsAutoResize === false || _0x10bb7c.fixedSize === true || _0x10bb7c.useExplicitSizeAsSource === true);
  const _0x543a4f = _0x2d98cc ? getAutoMediaSizeByShortSide(_0xa293f9, _0x4c6041) : _0x43a0d8 ? {
    width: _0x4ee1a2,
    height: _0x2d6398
  } : getNodeDefaultSize(_0x504019);
  const _0x536b8e = !!String(_0x10bb7c.src || _0x10bb7c.localPath || "").trim();
  const _0x22e7f4 = typeof _0x10bb7c.needsAutoResize === "boolean" ? _0x10bb7c.needsAutoResize : !_0x2d98cc && !_0x43a0d8;
  if (_0x22e7f4 && _0x2cb3bf.fixedSize) {
    _0x2cb3bf.fixedSize = false;
  }
  return {
    ..._0x2cb3bf,
    width: _0x543a4f.width,
    height: _0x543a4f.height,
    needsAutoResize: _0x22e7f4
  };
}
export function buildSourceAudioNodePayload(_0x21c070 = {}) {
  const _0x3f874a = String(_0x21c070.type || "source-audio").trim();
  if (_0x3f874a !== "source-audio") {
    throw new Error("Unsupported source audio type: " + (_0x3f874a || "unknown"));
  }
  const _0x53cb33 = getNodeDefaultSize("source-audio");
  const _0x10da44 = Number(_0x21c070.width) > 0 ? Number(_0x21c070.width) : _0x53cb33.width;
  const _0x46a3ce = Number(_0x21c070.height) > 0 ? Number(_0x21c070.height) : _0x53cb33.height;
  return {
    ..._0x21c070,
    id: _0x21c070.id,
    type: "source-audio",
    x: Number(_0x21c070.x) || 0,
    y: Number(_0x21c070.y) || 0,
    width: _0x10da44,
    height: _0x46a3ce,
    src: _0x21c070.src || "",
    localPath: _0x21c070.localPath || "",
    fileName: _0x21c070.fileName || "",
    name: _0x21c070.name || getDefaultNodeName("source-audio"),
    needsAutoResize: false,
    fixedSize: typeof _0x21c070.fixedSize === "boolean" ? _0x21c070.fixedSize : true
  };
}
function generateNodeId(_0x1dcc72, _0x5e8db8 = 0) {
  return _0x1dcc72 + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "-" + _0x5e8db8;
}
const WEB_PREVIEW_IMAGE_DROP_MIME = "application/x-ai-canvas-web-preview-image";
const IMAGE_URL_EXTENSION_RE = /\.(?:png|jpe?g|webp|gif|bmp|svg|avif)(?:[?#].*)?$/i;
const VIDEO_URL_EXTENSION_RE = /\.(?:mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/i;
const STREAM_MEDIA_URL_EXTENSION_RE = /\.(?:m3u8|mpd)(?:[?#].*)?$/i;
const WEB_IMAGE_REMOTE_IMPORT_CONCURRENCY = 3;
const WEB_VIDEO_TRUSTED_SOURCE_TYPES = new Set(["video", "video-source", "source", "video-resource", "douyin-detail"]);
const _webImageRemoteImportQueue = [];
let _webImageRemoteImportActive = 0;
function normalizeHttpDropUrl(_0x59ac98) {
  const _0x59bdd6 = String(_0x59ac98 || "").trim();
  if (!_0x59bdd6) {
    return "";
  }
  try {
    const _0x49389b = new URL(_0x59bdd6, globalThis.location?.href || "https://example.invalid/");
    if (_0x49389b.protocol !== "http:" && _0x49389b.protocol !== "https:") {
      return "";
    }
    _0x49389b.username = "";
    _0x49389b.password = "";
    return _0x49389b.href;
  } catch {
    return "";
  }
}
function toPositiveMediaDimension(_0x14f634) {
  const _0x51dca8 = Number(_0x14f634);
  if (!Number.isFinite(_0x51dca8) || _0x51dca8 <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(_0x51dca8));
}
function normalizeWebImagePayloadSize(_0x18e30e = {}) {
  const _0x419e45 = toPositiveMediaDimension(_0x18e30e?.width ?? _0x18e30e?.naturalWidth ?? _0x18e30e?.imageWidth);
  const _0x275cbe = toPositiveMediaDimension(_0x18e30e?.height ?? _0x18e30e?.naturalHeight ?? _0x18e30e?.imageHeight);
  if (_0x419e45 > 0 && _0x275cbe > 0) {
    return {
      width: _0x419e45,
      height: _0x275cbe
    };
  } else {
    return {};
  }
}
function readDataTransferText(_0x1fe5f3, _0x1f6a17) {
  try {
    return String(_0x1fe5f3?.getData?.(_0x1f6a17) || "").trim();
  } catch {
    return "";
  }
}
function normalizeWebImagePayload(_0x4858d1 = {}) {
  const _0x22fc6b = normalizeHttpDropUrl(_0x4858d1?.url);
  if (!_0x22fc6b) {
    return null;
  }
  const _0x5052de = normalizeHttpDropUrl(_0x4858d1?.pageUrl || _0x4858d1?.sourceUrl || _0x4858d1?.webPageUrl || "");
  return {
    kind: "image",
    url: _0x22fc6b,
    title: String(_0x4858d1?.title || _0x4858d1?.alt || "").trim().slice(0, 160),
    pageUrl: _0x5052de,
    sourceUrl: _0x5052de,
    nodeId: String(_0x4858d1?.nodeId || "").trim(),
    tabId: String(_0x4858d1?.tabId || "").trim(),
    ...normalizeWebImagePayloadSize(_0x4858d1)
  };
}
function normalizeWebVideoPayload(_0xd57d7e = {}) {
  const _0x538949 = normalizeHttpDropUrl(_0xd57d7e?.url);
  if (!_0x538949) {
    return null;
  }
  const _0x32918f = String(_0xd57d7e?.mimeType || "").trim();
  const _0x2b1ff9 = String(_0xd57d7e?.sourceType || "").trim().toLowerCase();
  try {
    const _0x5e76ab = new URL(_0x538949).pathname;
    if (STREAM_MEDIA_URL_EXTENSION_RE.test(_0x5e76ab)) {
      return null;
    }
    const _0x295b51 = _0x32918f.toLowerCase().startsWith("video/") || VIDEO_URL_EXTENSION_RE.test(_0x5e76ab) || WEB_VIDEO_TRUSTED_SOURCE_TYPES.has(_0x2b1ff9);
    if (!_0x295b51) {
      return null;
    }
  } catch {
    return null;
  }
  const _0x513940 = normalizeHttpDropUrl(_0xd57d7e?.pageUrl || _0xd57d7e?.sourceUrl || _0xd57d7e?.webPageUrl || "");
  return {
    kind: "video",
    url: _0x538949,
    title: String(_0xd57d7e?.title || "").trim().slice(0, 160),
    pageUrl: _0x513940,
    sourceUrl: _0x513940,
    nodeId: String(_0xd57d7e?.nodeId || "").trim(),
    tabId: String(_0xd57d7e?.tabId || "").trim(),
    width: Math.max(0, Math.round(Number(_0xd57d7e?.width || 0) || 0)),
    height: Math.max(0, Math.round(Number(_0xd57d7e?.height || 0) || 0)),
    duration: Math.max(0, Number(_0xd57d7e?.duration || 0) || 0),
    mimeType: _0x32918f,
    sourceType: _0x2b1ff9,
    rightsConfirmed: _0xd57d7e?.rightsConfirmed === true
  };
}
function parseWebPreviewImagePayload(_0x5ec80d) {
  try {
    const _0x3533cb = JSON.parse(String(_0x5ec80d || ""));
    if (_0x3533cb?.kind !== "image") {
      return null;
    }
    return normalizeWebImagePayload(_0x3533cb);
  } catch {
    return null;
  }
}
function extractFirstUriListUrl(_0x25e89b) {
  return String(_0x25e89b || "").split(/\r?\n/).map(_0x5aac3b => _0x5aac3b.trim()).find(_0x53c941 => _0x53c941 && !_0x53c941.startsWith("#")) || "";
}
function decodeHtmlAttribute(_0x51a973) {
  return String(_0x51a973 || "").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function extractImageUrlFromHtml(_0x26c8b6) {
  const _0x404c73 = String(_0x26c8b6 || "");
  const _0x12b051 = _0x404c73.match(/<img\b[^>]*\bsrc\s*=\s*(["'])(?<src>.*?)\1/i);
  return normalizeHttpDropUrl(decodeHtmlAttribute(_0x12b051?.groups?.src || ""));
}
function looksLikeImageUrl(_0x21274b) {
  const _0x1cca6d = normalizeHttpDropUrl(_0x21274b);
  if (!_0x1cca6d) {
    return "";
  }
  try {
    const _0x11cfcf = new URL(_0x1cca6d);
    if (IMAGE_URL_EXTENSION_RE.test(_0x11cfcf.pathname)) {
      return _0x1cca6d;
    }
    const _0x5bb823 = _0x11cfcf.searchParams.get("format") || _0x11cfcf.searchParams.get("type") || "";
    if (/^(?:png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(_0x5bb823)) {
      return _0x1cca6d;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
export function extractWebImageDropUrl(_0x391b99) {
  return extractWebImageDropPayload(_0x391b99)?.url || "";
}
export function extractWebImageDropPayload(_0x426aab) {
  const _0x5b600e = parseWebPreviewImagePayload(readDataTransferText(_0x426aab, WEB_PREVIEW_IMAGE_DROP_MIME));
  if (_0x5b600e) {
    return _0x5b600e;
  }
  const _0x216197 = extractImageUrlFromHtml(readDataTransferText(_0x426aab, "text/html"));
  if (_0x216197) {
    return normalizeWebImagePayload({
      url: _0x216197
    });
  }
  const _0x25fb12 = looksLikeImageUrl(extractFirstUriListUrl(readDataTransferText(_0x426aab, "text/uri-list")));
  if (_0x25fb12) {
    return normalizeWebImagePayload({
      url: _0x25fb12
    });
  }
  const _0x3de10a = looksLikeImageUrl(readDataTransferText(_0x426aab, "text/plain"));
  if (_0x3de10a) {
    return normalizeWebImagePayload({
      url: _0x3de10a
    });
  } else {
    return null;
  }
}
function getRemoteImageFileName(_0x825f59) {
  try {
    const _0x21b1b8 = new URL(_0x825f59);
    const _0x20a96c = decodeURIComponent(_0x21b1b8.pathname.split("/").filter(Boolean).pop() || "");
    return _0x20a96c || t("fileService.defaultNames.webImage");
  } catch {
    return t("fileService.defaultNames.webImage");
  }
}
function getRemoteVideoFileName(_0x59b704) {
  try {
    const _0x2269eb = new URL(_0x59b704);
    const _0x50e5ee = decodeURIComponent(_0x2269eb.pathname.split("/").filter(Boolean).pop() || "");
    if (_0x50e5ee && !STREAM_MEDIA_URL_EXTENSION_RE.test(_0x50e5ee)) {
      return _0x50e5ee;
    }
    return t("fileService.defaultNames.webVideo");
  } catch {
    return t("fileService.defaultNames.webVideo");
  }
}
export function buildWebImageDropNodePayload({
  url: _0xd56797,
  title = "",
  pageUrl = "",
  nodeId: _0x1e23fa,
  worldX: _0xe684b1,
  worldY: _0x46e158,
  width = 0,
  height = 0
} = {}) {
  const _0x1021fd = normalizeHttpDropUrl(_0xd56797);
  if (!_0x1021fd) {
    return null;
  }
  const _0x594744 = getRemoteImageFileName(_0x1021fd);
  const _0x245f09 = normalizeHttpDropUrl(pageUrl);
  const _0x4fd74a = String(title || "").trim().slice(0, 160);
  const _0x1ae0a7 = toPositiveMediaDimension(width);
  const _0x5b54f3 = toPositiveMediaDimension(height);
  const _0x184aa9 = _0x1ae0a7 > 0 && _0x5b54f3 > 0;
  return buildSourceMediaNodePayload({
    id: _0x1e23fa || generateNodeId("source-image"),
    type: "source-image",
    x: _0xe684b1,
    y: _0x46e158,
    naturalWidth: _0x1ae0a7,
    naturalHeight: _0x5b54f3,
    ...(_0x184aa9 ? {
      imageWidth: _0x1ae0a7,
      imageHeight: _0x5b54f3
    } : {}),
    capturePreviewUrl: _0x1021fd,
    webSourceUrl: _0x1021fd,
    webPageUrl: _0x245f09,
    webSourceTitle: _0x4fd74a,
    fileName: _0x594744,
    name: _0x4fd74a || getBaseName(_0x594744) || t("fileService.defaultNames.webImage"),
    needsAutoResize: true,
    isGenerating: true,
    jobStatus: "running",
    jobError: null,
    generationStartTime: Date.now(),
    generationDuration: null
  });
}
function buildRemoteImageImportPatch(_0x47da8b = {}, _0xf8aed9 = {}) {
  const _0x3bfddf = buildImageNodeStorageFields(_0x47da8b);
  const _0xaf2124 = localPathToUrl(_0x3bfddf.displayLocalPath || _0x3bfddf.originalLocalPath || _0x3bfddf.localPath);
  const _0x58e9ca = localPathToUrl(_0x3bfddf.originalLocalPath || _0x3bfddf.localPath || _0x3bfddf.displayLocalPath);
  const _0x871bf3 = localPathToUrl(_0x3bfddf.thumbLocalPath);
  return {
    assetId: _0x47da8b?.assetId || "",
    assetRevision: normalizeAssetRevision(_0x47da8b?.assetRevision),
    assetUpdatedAt: _0x47da8b?.assetUpdatedAt || _0x47da8b?.updatedAt || "",
    derivativeStatus: _0x47da8b?.derivativeStatus || _0x47da8b?.status || "",
    ..._0x3bfddf,
    src: _0xaf2124 || _0x58e9ca || "",
    imageUrl: _0xaf2124 || _0x58e9ca || "",
    sourceUrl: _0x58e9ca || _0xaf2124 || "",
    thumbUrl: _0x871bf3,
    isGenerating: false,
    jobStatus: null,
    jobError: null,
    generationDuration: Date.now() - Number(_0xf8aed9?.generationStartTime || Date.now()),
    capturePreviewUrl: ""
  };
}
export function buildWebVideoSourceNodePayload({
  url: _0x29df0f,
  title = "",
  pageUrl = "",
  nodeId: _0x5d6a2c,
  worldX: _0x101ec0,
  worldY: _0x145af2,
  width = 0,
  height = 0,
  duration = 0
} = {}) {
  const _0x3082bb = normalizeHttpDropUrl(_0x29df0f);
  if (!_0x3082bb) {
    return null;
  }
  try {
    if (STREAM_MEDIA_URL_EXTENSION_RE.test(new URL(_0x3082bb).pathname)) {
      return null;
    }
  } catch {
    return null;
  }
  const _0x85304f = getRemoteVideoFileName(_0x3082bb);
  const _0x284f62 = normalizeHttpDropUrl(pageUrl);
  const _0x2d7469 = String(title || "").trim().slice(0, 160);
  return buildSourceMediaNodePayload({
    id: _0x5d6a2c || generateNodeId("source-video"),
    type: "source-video",
    x: _0x101ec0,
    y: _0x145af2,
    webSourceUrl: _0x3082bb,
    webPageUrl: _0x284f62,
    webSourceTitle: _0x2d7469,
    webMediaKind: "video",
    webRightsConfirmed: true,
    fileName: _0x85304f,
    name: _0x2d7469 || getBaseName(_0x85304f) || t("fileService.defaultNames.webVideo"),
    naturalWidth: width,
    naturalHeight: height,
    videoWidth: Number(width || 0) || 0,
    videoHeight: Number(height || 0) || 0,
    videoDuration: Number(duration || 0) || 0,
    needsAutoResize: true,
    isGenerating: true,
    jobStatus: "running",
    jobError: null,
    generationStartTime: Date.now(),
    generationDuration: null
  });
}
function buildRemoteVideoImportPatch(_0x590542 = {}, _0x29f213 = {}) {
  const _0x1919c9 = _0x590542?.localPath || _0x590542?.originalLocalPath || "";
  const _0x53793b = _0x590542?.displayLocalPath || "";
  const _0x35ed18 = _0x53793b || _0x1919c9;
  const _0x58bcde = localPathToUrl(_0x35ed18);
  const _0x1d86f1 = localPathToUrl(_0x1919c9 || _0x53793b);
  const _0x627dfe = _0x590542?.posterLocalPath || _0x590542?.thumbLocalPath || "";
  const _0xafae73 = _0x590542?.posterUrl || _0x590542?.thumbUrl || localPathToUrl(_0x627dfe);
  const _0x1efd7e = String(_0x590542?.mediaTaskStatus || "").trim();
  const _0x3c905d = String(_0x590542?.videoProxyStatus || "").trim();
  const _0xe55982 = _0x1efd7e === "waiting" || _0x1efd7e === "processing" || _0x3c905d === "processing";
  return {
    assetId: _0x590542?.assetId || "",
    assetRevision: normalizeAssetRevision(_0x590542?.assetRevision),
    assetUpdatedAt: _0x590542?.assetUpdatedAt || _0x590542?.updatedAt || "",
    localPath: _0x1919c9,
    originalLocalPath: _0x590542?.originalLocalPath || _0x1919c9,
    displayLocalPath: _0x53793b,
    posterLocalPath: _0x590542?.posterLocalPath || "",
    thumbLocalPath: _0x627dfe,
    derivativeStatus: _0x590542?.derivativeStatus || _0x590542?.status || "",
    mediaTaskId: _0x590542?.mediaTaskId || "",
    mediaTaskKind: _0x590542?.mediaTaskKind || "",
    mediaTaskStatus: _0x1efd7e,
    mediaTaskProgress: Number(_0x590542?.mediaTaskProgress || 0) || 0,
    mediaTaskError: _0x590542?.mediaTaskError || "",
    videoProxyStatus: _0x3c905d,
    videoProxyVersion: _0x590542?.videoProxyVersion || "",
    videoCodec: _0x590542?.videoCodec || "",
    videoDuration: Number(_0x590542?.videoDuration || 0) || Number(_0x29f213?.videoDuration || 0) || 0,
    videoFps: Number(_0x590542?.videoFps || 0) || 0,
    videoWidth: Number(_0x590542?.videoWidth || _0x590542?.width || 0) || Number(_0x29f213?.videoWidth || 0) || 0,
    videoHeight: Number(_0x590542?.videoHeight || _0x590542?.height || 0) || Number(_0x29f213?.videoHeight || 0) || 0,
    src: _0x3c905d === "processing" ? "" : _0x58bcde || _0x1d86f1 || "",
    videoUrl: _0x3c905d === "processing" ? "" : _0x58bcde || _0x1d86f1 || "",
    sourceUrl: _0x1d86f1 || _0x58bcde || "",
    thumbUrl: _0xafae73,
    isGenerating: _0xe55982,
    jobStatus: _0xe55982 ? "running" : null,
    jobError: null,
    generationDuration: Date.now() - Number(_0x29f213?.generationStartTime || Date.now()),
    capturePreviewUrl: ""
  };
}
function getRemoteImportApi() {
  if (!desktopBridge.assetImport.canImportRemoteAsset()) {
    return null;
  }
  return _0x28097a => desktopBridge.assetImport.importRemoteAsset(_0x28097a);
}
function pumpWebImageRemoteImportQueue() {
  while (_webImageRemoteImportActive < WEB_IMAGE_REMOTE_IMPORT_CONCURRENCY && _webImageRemoteImportQueue.length > 0) {
    const _0xc6f1ed = _webImageRemoteImportQueue.shift();
    _webImageRemoteImportActive += 1;
    Promise.resolve().then(_0xc6f1ed).catch(() => {}).finally(() => {
      _webImageRemoteImportActive = Math.max(0, _webImageRemoteImportActive - 1);
      pumpWebImageRemoteImportQueue();
    });
  }
}
function enqueueWebImageRemoteImport(_0x1bed8d) {
  if (typeof _0x1bed8d !== "function") {
    return;
  }
  _webImageRemoteImportQueue.push(_0x1bed8d);
  pumpWebImageRemoteImportQueue();
}
function buildWebImageRemoteImportFallbackPatch(_0x3e0d18, _0x1f020a = {}) {
  return {
    isGenerating: false,
    jobStatus: null,
    jobError: null,
    webImportStatus: "failed",
    webImportError: String(_0x3e0d18 || t("fileService.errors.remoteImageImportFailed")),
    generationDuration: Date.now() - Number(_0x1f020a?.generationStartTime || Date.now())
  };
}
export function scheduleWebImageRemoteImport(_0x5f18cc, _0x2ca9ca = {}, _0xb7003e = {}) {
  const _0x5bcf58 = normalizeWebImagePayload(_0x2ca9ca);
  if (!_0x5f18cc || !_0x5bcf58) {
    return false;
  }
  const _0x293e4b = _0xb7003e.storeInstance || a1539_0x145a5f;
  const _0xbf0b16 = _0xb7003e.projectId || globalThis.window?.currentProjectId || "default_v2_project";
  const _0x27b219 = _0xb7003e.importRemoteAsset || getRemoteImportApi();
  const _0x314e56 = _0x26de72 => {
    const _0x499a45 = _0x293e4b.getState?.()?.nodes?.[_0x5f18cc] || _0x293e4b.getStateRaw?.()?.nodes?.[_0x5f18cc];
    if (!_0x499a45) {
      return;
    }
    const _0x3132ab = normalizeHttpDropUrl(_0x499a45.capturePreviewUrl);
    const _0x3073eb = normalizeHttpDropUrl(_0x499a45.webSourceUrl);
    if (_0x3132ab === _0x5bcf58.url || _0x3073eb === _0x5bcf58.url) {
      _0x293e4b.updateNodeData?.(_0x5f18cc, buildWebImageRemoteImportFallbackPatch(_0x26de72, _0x499a45));
      return;
    }
    _0x293e4b.updateNodeData?.(_0x5f18cc, {
      isGenerating: false,
      jobStatus: "error",
      jobError: String(_0x26de72 || t("fileService.errors.remoteImageImportFailed")),
      generationDuration: Date.now() - Number(_0x499a45.generationStartTime || Date.now())
    });
  };
  enqueueWebImageRemoteImport(async () => {
    const _0x3d5766 = _0x293e4b.getState?.()?.nodes?.[_0x5f18cc] || _0x293e4b.getStateRaw?.()?.nodes?.[_0x5f18cc];
    if (!_0x3d5766) {
      return;
    }
    if (typeof _0x27b219 !== "function") {
      _0x314e56(t("fileService.errors.remoteImportUnsupported"));
      return;
    }
    try {
      const _0x3b8453 = await _0x27b219({
        url: _0x5bcf58.url,
        pageUrl: _0x5bcf58.pageUrl,
        referrer: _0x5bcf58.pageUrl,
        title: _0x5bcf58.title,
        name: getRemoteImageFileName(_0x5bcf58.url),
        projectId: _0xbf0b16,
        nodeId: _0x5bcf58.nodeId,
        tabId: _0x5bcf58.tabId
      });
      const _0x59bb66 = _0x293e4b.getState?.()?.nodes?.[_0x5f18cc] || _0x293e4b.getStateRaw?.()?.nodes?.[_0x5f18cc];
      if (!_0x59bb66) {
        return;
      }
      _0x293e4b.updateNodeData?.(_0x5f18cc, buildRemoteImageImportPatch(_0x3b8453, _0x59bb66));
    } catch (_0xebb40c) {
      const _0x413f21 = _toOneLineMessage(_0xebb40c);
      _0x314e56(_0x413f21 || t("fileService.errors.remoteImageImportFailed"));
      logDiagnosticEvent({
        type: "import.web_image_failed",
        level: "warn",
        source: "renderer",
        message: _0x413f21 || t("fileService.errors.remoteImageImportFailed"),
        error: _0xebb40c,
        context: {
          url: _0x5bcf58.url,
          pageUrl: _0x5bcf58.pageUrl,
          projectId: _0xbf0b16
        }
      });
    }
  });
  return true;
}
export function scheduleWebVideoRemoteImport(_0x3c320f, _0x27d43c = {}, _0x14a81d = {}) {
  const _0x139bf2 = normalizeWebVideoPayload(_0x27d43c);
  if (!_0x3c320f || !_0x139bf2) {
    return false;
  }
  const _0x3935c7 = _0x14a81d.storeInstance || a1539_0x145a5f;
  const _0x48910e = _0x14a81d.projectId || globalThis.window?.currentProjectId || "default_v2_project";
  const _0x2ac6f7 = _0x14a81d.importRemoteAsset || getRemoteImportApi();
  const _0x206909 = _0x238753 => {
    const _0x31a7bc = _0x3935c7.getState?.()?.nodes?.[_0x3c320f] || _0x3935c7.getStateRaw?.()?.nodes?.[_0x3c320f];
    if (!_0x31a7bc) {
      return;
    }
    _0x3935c7.updateNodeData?.(_0x3c320f, {
      isGenerating: false,
      jobStatus: "error",
      jobError: String(_0x238753 || t("fileService.errors.remoteVideoImportFailed")),
      generationDuration: Date.now() - Number(_0x31a7bc.generationStartTime || Date.now())
    });
  };
  enqueueWebImageRemoteImport(async () => {
    const _0x4149d5 = _0x3935c7.getState?.()?.nodes?.[_0x3c320f] || _0x3935c7.getStateRaw?.()?.nodes?.[_0x3c320f];
    if (!_0x4149d5) {
      return;
    }
    if (typeof _0x2ac6f7 !== "function") {
      _0x206909(t("fileService.errors.remoteImportUnsupported"));
      return;
    }
    if (_0x139bf2.rightsConfirmed !== true) {
      _0x206909(t("fileService.errors.webVideoRightsRequired"));
      return;
    }
    try {
      const _0x40ccb5 = await _0x2ac6f7({
        kind: "video",
        url: _0x139bf2.url,
        pageUrl: _0x139bf2.pageUrl,
        referrer: _0x139bf2.pageUrl,
        title: _0x139bf2.title,
        name: getRemoteVideoFileName(_0x139bf2.url),
        type: _0x139bf2.mimeType,
        projectId: _0x48910e,
        nodeId: _0x139bf2.nodeId,
        tabId: _0x139bf2.tabId
      });
      const _0x4b3f01 = _0x3935c7.getState?.()?.nodes?.[_0x3c320f] || _0x3935c7.getStateRaw?.()?.nodes?.[_0x3c320f];
      if (!_0x4b3f01) {
        return;
      }
      _0x3935c7.updateNodeData?.(_0x3c320f, buildRemoteVideoImportPatch(_0x40ccb5, _0x4b3f01));
    } catch (_0x254742) {
      const _0x862a34 = _toOneLineMessage(_0x254742);
      _0x206909(_0x862a34 || t("fileService.errors.remoteVideoImportFailed"));
      logDiagnosticEvent({
        type: "import.web_video_failed",
        level: "warn",
        source: "renderer",
        message: _0x862a34 || t("fileService.errors.remoteVideoImportFailed"),
        error: _0x254742,
        context: {
          url: _0x139bf2.url,
          pageUrl: _0x139bf2.pageUrl,
          projectId: _0x48910e
        }
      });
    }
  });
  return true;
}
export function createWebImageSourceNode({
  payload: _0x2b59f6,
  worldX: _0x1bad62,
  worldY: _0x356723,
  storeInstance = a1539_0x145a5f,
  projectId: _0x1c7e45,
  select = true,
  importRemote = true,
  importRemoteAsset: _0x2e2c88
} = {}) {
  const _0x49be35 = normalizeWebImagePayload(_0x2b59f6);
  if (!_0x49be35) {
    return null;
  }
  const _0x21ecf5 = buildWebImageDropNodePayload({
    url: _0x49be35.url,
    title: _0x49be35.title,
    pageUrl: _0x49be35.pageUrl,
    width: _0x49be35.width,
    height: _0x49be35.height,
    worldX: _0x1bad62,
    worldY: _0x356723
  });
  if (!_0x21ecf5) {
    return null;
  }
  storeInstance.addNode?.(_0x21ecf5);
  if (select) {
    storeInstance.setSelectedNodes?.([_0x21ecf5.id]);
  }
  if (importRemote) {
    scheduleWebImageRemoteImport(_0x21ecf5.id, _0x49be35, {
      storeInstance: storeInstance,
      projectId: _0x1c7e45,
      importRemoteAsset: _0x2e2c88
    });
  }
  return _0x21ecf5;
}
export function createWebVideoSourceNode({
  payload: _0x48b3ee,
  worldX: _0x209c31,
  worldY: _0x26192b,
  storeInstance = a1539_0x145a5f,
  projectId: _0x449ac4,
  select = true,
  importRemote = true,
  importRemoteAsset: _0xcd6d86
} = {}) {
  const _0x5025a8 = normalizeWebVideoPayload(_0x48b3ee);
  if (!_0x5025a8 || _0x5025a8.rightsConfirmed !== true) {
    return null;
  }
  const _0x608f33 = buildWebVideoSourceNodePayload({
    url: _0x5025a8.url,
    title: _0x5025a8.title,
    pageUrl: _0x5025a8.pageUrl,
    width: _0x5025a8.width,
    height: _0x5025a8.height,
    duration: _0x5025a8.duration,
    worldX: _0x209c31,
    worldY: _0x26192b
  });
  if (!_0x608f33) {
    return null;
  }
  storeInstance.addNode?.(_0x608f33);
  if (select) {
    storeInstance.setSelectedNodes?.([_0x608f33.id]);
  }
  if (importRemote) {
    scheduleWebVideoRemoteImport(_0x608f33.id, _0x5025a8, {
      storeInstance: storeInstance,
      projectId: _0x449ac4,
      importRemoteAsset: _0xcd6d86
    });
  }
  return _0x608f33;
}
function createObjectUrlForFilePreview(_0x3ec323) {
  const _0x27706a = String(_0x3ec323?.type || "").trim();
  if (!_0x27706a.startsWith("image/") && !_0x27706a.startsWith("video/")) {
    return "";
  }
  const _0x31ff57 = globalThis.window?.URL || globalThis.URL;
  if (typeof _0x31ff57?.createObjectURL !== "function") {
    return "";
  }
  try {
    return _0x31ff57.createObjectURL(_0x3ec323);
  } catch {
    return "";
  }
}
function revokeObjectUrl(_0x1da233) {
  const _0x3285bf = String(_0x1da233 || "").trim();
  if (!_0x3285bf.startsWith("blob:")) {
    return;
  }
  const _0x59ed4b = globalThis.window?.URL || globalThis.URL;
  if (typeof _0x59ed4b?.revokeObjectURL !== "function") {
    return;
  }
  try {
    _0x59ed4b.revokeObjectURL(_0x3285bf);
  } catch {}
}
function scheduleRevokeObjectUrl(_0x147527) {
  const _0x5ad1fc = String(_0x147527 || "").trim();
  if (!_0x5ad1fc.startsWith("blob:")) {
    return;
  }
  const _0x26c3b4 = globalThis.window?.setTimeout || globalThis.setTimeout;
  if (typeof _0x26c3b4 === "function") {
    _0x26c3b4(() => revokeObjectUrl(_0x5ad1fc), 0);
    return;
  }
  revokeObjectUrl(_0x5ad1fc);
}
function normalizeNaturalSize(_0x39dddf, _0x2ca173) {
  const _0x565dcb = Math.round(Number(_0x39dddf) || 0);
  const _0x2a1be1 = Math.round(Number(_0x2ca173) || 0);
  if (_0x565dcb <= 0 || _0x2a1be1 <= 0) {
    return null;
  }
  return {
    width: _0x565dcb,
    height: _0x2a1be1
  };
}
function pickNaturalSize(_0x5bd095 = {}) {
  return normalizeNaturalSize(_0x5bd095?.width ?? _0x5bd095?.naturalWidth, _0x5bd095?.height ?? _0x5bd095?.naturalHeight);
}
async function readImageFileNaturalSize(_0x935f10) {
  if (!_0x935f10) {
    return null;
  }
  const _0x4e711f = globalThis?.createImageBitmap;
  if (typeof _0x4e711f === "function") {
    try {
      const _0x1ba82b = await _0x4e711f(_0x935f10);
      const _0x207c50 = normalizeNaturalSize(_0x1ba82b?.width, _0x1ba82b?.height);
      if (typeof _0x1ba82b?.close === "function") {
        _0x1ba82b.close();
      }
      if (_0x207c50) {
        return _0x207c50;
      }
    } catch {}
  }
  const _0x13634b = globalThis.Image || globalThis.window?.Image;
  const _0x5e33bb = globalThis.window?.URL || globalThis.URL;
  if (!_0x13634b || typeof _0x5e33bb?.createObjectURL !== "function") {
    return null;
  }
  let _0x2f69e4 = "";
  try {
    _0x2f69e4 = _0x5e33bb.createObjectURL(_0x935f10);
  } catch {
    return null;
  }
  return new Promise(_0x4b3da7 => {
    const _0x4a079c = new _0x13634b();
    let _0x43dd98 = false;
    let _0x5d7f4b = null;
    const _0xa79ed1 = _0x1c7864 => {
      if (_0x43dd98) {
        return;
      }
      _0x43dd98 = true;
      if (_0x5d7f4b) {
        clearTimeout(_0x5d7f4b);
      }
      revokeObjectUrl(_0x2f69e4);
      _0x4b3da7(_0x1c7864);
    };
    _0x5d7f4b = setTimeout(() => _0xa79ed1(null), 2000);
    _0x4a079c.onload = () => _0xa79ed1(normalizeNaturalSize(_0x4a079c.naturalWidth || _0x4a079c.width, _0x4a079c.naturalHeight || _0x4a079c.height));
    _0x4a079c.onerror = () => _0xa79ed1(null);
    _0x4a079c.src = _0x2f69e4;
  });
}
async function readVideoFileNaturalSize(_0x4f4cb8) {
  const _0x4b897c = globalThis.document;
  const _0x1f58ec = globalThis.window?.URL || globalThis.URL;
  if (!_0x4f4cb8 || typeof _0x4b897c?.createElement !== "function") {
    return null;
  }
  if (typeof _0x1f58ec?.createObjectURL !== "function") {
    return null;
  }
  let _0x39bcac = "";
  try {
    _0x39bcac = _0x1f58ec.createObjectURL(_0x4f4cb8);
  } catch {
    return null;
  }
  return new Promise(_0x1b8d46 => {
    const _0x40a8aa = _0x4b897c.createElement("video");
    let _0x54362e = false;
    let _0x5e631a = null;
    const _0x312cc3 = _0x34a358 => {
      if (_0x54362e) {
        return;
      }
      _0x54362e = true;
      if (_0x5e631a) {
        clearTimeout(_0x5e631a);
      }
      _0x40a8aa.removeAttribute("src");
      try {
        _0x40a8aa.load?.();
      } catch {}
      revokeObjectUrl(_0x39bcac);
      _0x1b8d46(_0x34a358);
    };
    _0x5e631a = setTimeout(() => _0x312cc3(null), 2500);
    _0x40a8aa.preload = "metadata";
    _0x40a8aa.muted = true;
    _0x40a8aa.onloadedmetadata = () => {
      const _0x36fce9 = normalizeNaturalSize(_0x40a8aa.videoWidth, _0x40a8aa.videoHeight);
      const _0x14d3b5 = Number(_0x40a8aa.duration || 0);
      if (!_0x36fce9) {
        _0x312cc3(Number.isFinite(_0x14d3b5) && _0x14d3b5 > 0 ? {
          duration: _0x14d3b5
        } : null);
        return;
      }
      _0x312cc3(Number.isFinite(_0x14d3b5) && _0x14d3b5 > 0 ? {
        ..._0x36fce9,
        duration: _0x14d3b5
      } : _0x36fce9);
    };
    _0x40a8aa.onerror = () => _0x312cc3(null);
    _0x40a8aa.src = _0x39bcac;
  });
}
export async function readFileNaturalSize(_0x25320e, _0x5bc38c = "") {
  const _0x595312 = String(_0x5bc38c || getNodeTypeByFile(_0x25320e) || "").trim();
  if (_0x595312 === "source-image") {
    return readImageFileNaturalSize(_0x25320e);
  }
  if (_0x595312 === "source-video") {
    return readVideoFileNaturalSize(_0x25320e);
  }
  return null;
}
function getElectronImportLocalFile() {
  if (!desktopBridge.assetImport.canImportLocalFile()) {
    return null;
  }
  return _0x314baa => desktopBridge.assetImport.importLocalFile(_0x314baa);
}
function getElectronLocalPreviewUrl() {
  if (!desktopBridge.mediaPreview.isAvailable()) {
    return null;
  }
  return _0x226daa => desktopBridge.mediaPreview.getLocalPreviewUrl(_0x226daa);
}
function getElectronFilePath(_0x42a62b) {
  if (!desktopBridge.assetImport.canResolveFilePath()) {
    return "";
  }
  const _0x33a575 = String(_0x42a62b?.path || "").trim();
  if (_0x33a575) {
    _profileDragImport("electron-file-path:direct", {
      name: _0x42a62b?.name || "",
      path: _0x33a575
    });
    return _0x33a575;
  }
  try {
    const _0x5baa08 = String(desktopBridge.assetImport.getPathForFile(_0x42a62b) || "").trim();
    _profileDragImport("electron-file-path:webutils", {
      name: _0x42a62b?.name || "",
      path: _0x5baa08
    });
    return _0x5baa08;
  } catch (_0x79be44) {
    _profileDragImport("electron-file-path:error", {
      name: _0x42a62b?.name || "",
      error: _toOneLineMessage(_0x79be44)
    });
    return "";
  }
}
function canUseElectronLocalImport(_0x5684f7) {
  return !!getElectronImportLocalFile() && !!getElectronFilePath(_0x5684f7);
}
function isPreviewablePendingFile(_0x257a0d, _0x51179c = "") {
  const _0xf063f1 = String(_0x257a0d?.type || "").trim();
  return _0x51179c === "source-image" || _0x51179c === "source-video" || _0xf063f1.startsWith("image/") || _0xf063f1.startsWith("video/");
}
function isAllowedCapturePreviewUrl(_0x325e5f) {
  const _0x1a42a4 = String(_0x325e5f || "").trim();
  return _0x1a42a4.startsWith("blob:") || _0x1a42a4.startsWith("data:image/") || _0x1a42a4.startsWith("aic-local-preview:");
}
function waitForNextPaint() {
  const _0x402013 = globalThis.window?.requestAnimationFrame || globalThis.requestAnimationFrame;
  if (typeof _0x402013 === "function") {
    return new Promise(_0xe659c7 => {
      let _0x4a8098 = false;
      let _0x5c4c92 = null;
      const _0x36ede4 = () => {
        if (_0x4a8098) {
          return;
        }
        _0x4a8098 = true;
        if (_0x5c4c92) {
          clearTimeout(_0x5c4c92);
        }
        _0xe659c7();
      };
      _0x5c4c92 = setTimeout(_0x36ede4, 50);
      _0x402013(_0x36ede4);
    });
  }
  return new Promise(_0x474b56 => setTimeout(_0x474b56, 0));
}
async function createCapturePreviewUrlForFile(_0x5419eb, _0x3e99d0 = "") {
  if (!isPreviewablePendingFile(_0x5419eb, _0x3e99d0)) {
    return "";
  }
  const _0xe9931d = getElectronLocalPreviewUrl();
  const _0x41a2cf = getElectronImportLocalFile();
  if (_0xe9931d && _0x41a2cf) {
    const _0x14acdc = getElectronFilePath(_0x5419eb);
    if (_0x14acdc) {
      try {
        const _0x695f0d = await _0xe9931d({
          path: _0x14acdc,
          name: _0x5419eb?.name || "",
          type: _0x5419eb?.type || ""
        });
        const _0x46cf67 = typeof _0x695f0d === "string" ? _0x695f0d : String(_0x695f0d?.url || "").trim();
        if (isAllowedCapturePreviewUrl(_0x46cf67)) {
          _profileDragImport("electron-preview-url:done", {
            name: _0x5419eb?.name || "",
            url: _0x46cf67
          });
          return _0x46cf67;
        }
      } catch (_0x1de355) {
        _profileDragImport("electron-preview-url:error", {
          name: _0x5419eb?.name || "",
          error: _toOneLineMessage(_0x1de355)
        });
      }
    }
  }
  return createObjectUrlForFilePreview(_0x5419eb);
}
async function importFileWithBestAvailableFlow(_0x3eabba, _0x2d2ae3, _0x4d04da = "") {
  const _0x2e9211 = getElectronImportLocalFile();
  if (_0x2e9211) {
    const _0x52a260 = getElectronFilePath(_0x3eabba);
    if (_0x52a260) {
      try {
        const _0x591c57 = await _0x2e9211({
          path: _0x52a260,
          name: _0x3eabba?.name || "",
          type: _0x3eabba?.type || "",
          projectId: _0x2d2ae3
        });
        _profileDragImport("electron-import:done", {
          name: _0x3eabba?.name || "",
          localPath: _0x591c57?.localPath || "",
          displayLocalPath: _0x591c57?.displayLocalPath || "",
          thumbLocalPath: _0x591c57?.thumbLocalPath || ""
        });
        const _0x5371fb = String(_0x591c57?.localPath || "").trim();
        const _0xfa6215 = !!String(_0x591c57?.displayLocalPath || _0x591c57?.thumbLocalPath || _0x591c57?.originalLocalPath || "").trim();
        if (_0x591c57 && _0x4d04da === "source-image" && _0x5371fb && !_0xfa6215) {
          try {
            _profileDragImport("ensure-derivatives:start", {
              localPath: _0x5371fb
            });
            const _0x21d5a3 = await ensureLocalImageDerivatives(_0x5371fb);
            _profileDragImport("ensure-derivatives:done", {
              localPath: _0x21d5a3?.localPath || "",
              displayLocalPath: _0x21d5a3?.displayLocalPath || "",
              thumbLocalPath: _0x21d5a3?.thumbLocalPath || ""
            });
            return _0x21d5a3;
          } catch (_0x21a810) {
            console.warn("[fileService] Electron 本地导入图片派生生成失败，使用原始文件:", _0x21a810);
            return _0x591c57;
          }
        }
        if (_0x591c57) {
          return _0x591c57;
        }
      } catch (_0x1d08ec) {
        console.warn("[fileService] Electron 本地导入失败，回退上传流程:", _0x1d08ec);
      }
    }
  }
  return uploadFile(_0x3eabba, _0x2d2ae3);
}
export function buildPendingFileNodePayload(_0x38bf8a, _0x145e56, _0x4efab9, _0x9cd44, _0x4641b1 = {}) {
  const _0x3aafed = getNodeTypeByFile(_0x38bf8a);
  if (!_0x3aafed || _0x3aafed === "source-text") {
    return null;
  }
  const _0x59fb0f = _0x9cd44 || generateNodeId(_0x3aafed);
  const _0xb9f4d3 = getBaseName(_0x38bf8a?.name);
  const _0x2709fe = pickNaturalSize(_0x4641b1.mediaNaturalSize || {
    width: _0x4641b1.naturalWidth,
    height: _0x4641b1.naturalHeight
  });
  const _0x510371 = {
    id: _0x59fb0f,
    type: _0x3aafed,
    x: _0x145e56,
    y: _0x4efab9,
    fileName: _0x38bf8a?.name || "",
    name: _0xb9f4d3 || getDefaultNodeName(_0x3aafed),
    isGenerating: true,
    jobStatus: "running",
    jobError: null,
    generationStartTime: Date.now(),
    generationDuration: null
  };
  if (_0x3aafed === "source-image" || _0x3aafed === "source-video") {
    return buildSourceMediaNodePayload({
      ..._0x510371,
      naturalWidth: _0x2709fe?.width,
      naturalHeight: _0x2709fe?.height,
      capturePreviewUrl: typeof _0x4641b1.capturePreviewUrl === "string" ? _0x4641b1.capturePreviewUrl : createObjectUrlForFilePreview(_0x38bf8a)
    });
  }
  if (_0x3aafed === "source-audio") {
    return buildSourceAudioNodePayload(_0x510371);
  }
  return null;
}
function readTextFile(_0x3f4a99) {
  return new Promise((_0x5666b8, _0x22afd1) => {
    const _0x35352c = new FileReader();
    _0x35352c.onload = _0x5786f8 => _0x5666b8(_0x5786f8.target.result);
    _0x35352c.onerror = _0x22afd1;
    _0x35352c.readAsText(_0x3f4a99, "UTF-8");
  });
}
export async function resolveImageImportThumbnailData({
  suppliedThumbnail: _0x3f8071,
  canUseLocalImport = false,
  generateThumbnailData: _0x33d02b
} = {}) {
  if (_0x3f8071 != null) {
    try {
      const _0x2a825f = String((await _0x3f8071) || "").trim();
      if (_0x2a825f) {
        return _0x2a825f;
      }
    } catch {}
  }
  if (canUseLocalImport || typeof _0x33d02b !== "function") {
    return null;
  }
  return _0x33d02b();
}
export async function processFile(_0xd33c22, _0x242023, _0x3d7fff, _0x2de3a5, _0x2cac67 = {}) {
  const _0x221119 = getNodeTypeByFile(_0xd33c22);
  if (!_0x221119) {
    console.warn("[fileService] 暂不支持此类型文件: " + _0xd33c22.type);
    showWarning(t("fileService.errors.unsupportedFileType", {
      file: _0xd33c22.name || _0xd33c22.type || t("fileService.defaultNames.unknownFile")
    }));
    return null;
  }
  const {
    width: _0x31ab12,
    height: _0x5526ca
  } = getNodeDefaultSize(_0x221119);
  const _0x1963a3 = _0x2cac67?.nodeId || generateNodeId(_0x221119);
  const _0xf50fa2 = getBaseName(_0xd33c22.name);
  const _0x1292b1 = _0x2cac67?.mediaNaturalSize || {
    width: _0x2cac67?.naturalWidth,
    height: _0x2cac67?.naturalHeight,
    duration: _0x2cac67?.duration
  };
  const _0x855b80 = pickNaturalSize(_0x1292b1);
  const _0x47ba59 = Number(_0x1292b1?.duration || _0x1292b1?.videoDuration || 0);
  try {
    if (_0x221119 === "source-text") {
      const _0x477a28 = await readTextFile(_0xd33c22);
      return {
        id: _0x1963a3,
        type: _0x221119,
        x: _0x242023,
        y: _0x3d7fff,
        width: _0x31ab12,
        height: _0x5526ca,
        text: _0x477a28,
        content: _0x477a28,
        fileName: _0xd33c22.name,
        name: _0xf50fa2 || t("fileService.defaultNames.text"),
        isGenerating: false,
        jobStatus: null,
        jobError: null
      };
    } else {
      const _0x189b48 = _0x2cac67?.thumbnailDataUrlPromise ?? _0x2cac67?.thumbnailDataUrl;
      const _0x44e0f = canUseElectronLocalImport(_0xd33c22);
      const _0x33dea1 = () => {
        const _0x4e421d = URL.createObjectURL(_0xd33c22);
        return generateThumbnail(_0x4e421d).finally(() => {
          URL.revokeObjectURL(_0x4e421d);
        });
      };
      const _0x4ce075 = _0x221119 !== "source-image" ? Promise.resolve(null) : resolveImageImportThumbnailData({
        suppliedThumbnail: _0x189b48,
        canUseLocalImport: _0x44e0f,
        generateThumbnailData: _0x33dea1
      });
      const _0x35549 = await importFileWithBestAvailableFlow(_0xd33c22, _0x2de3a5, _0x221119);
      const _0x262f5 = await _0x4ce075;
      const _0x452f38 = pickResultLocalPath(_0x35549);
      const _0x523b75 = localPathToUrl(_0x452f38);
      if (_0x221119 === "source-image" && _0x262f5) {
        try {
          await setThumbnail({
            localPath: _0x452f38,
            src: _0x523b75,
            imageUrl: _0x523b75
          }, _0x262f5);
        } catch (_0x17eef9) {
          console.warn("[fileService] 写入缩略图缓存失败:", _0x17eef9);
        }
      }
      const _0x4a1ebd = _0x221119 === "source-image" ? buildImageNodeStorageFields(_0x35549) : {};
      const _0x3aac3c = {
        assetId: _0x35549.assetId || "",
        assetRevision: normalizeAssetRevision(_0x35549.assetRevision),
        assetUpdatedAt: _0x35549.assetUpdatedAt || _0x35549.updatedAt || "",
        originalLocalPath: _0x35549.originalLocalPath || _0x35549.localPath || "",
        displayLocalPath: _0x35549.displayLocalPath || "",
        posterLocalPath: _0x35549.posterLocalPath || "",
        waveformLocalPath: _0x35549.waveformLocalPath || "",
        derivativeStatus: _0x35549.derivativeStatus || _0x35549.status || "",
        mediaTaskId: _0x35549.mediaTaskId || "",
        mediaTaskKind: _0x35549.mediaTaskKind || "",
        mediaTaskStatus: _0x35549.mediaTaskStatus || "",
        mediaTaskProgress: Number(_0x35549.mediaTaskProgress || 0) || 0,
        mediaTaskError: _0x35549.mediaTaskError || "",
        videoProxyStatus: _0x35549.videoProxyStatus || "",
        videoProxyVersion: _0x35549.videoProxyVersion || "",
        videoCodec: _0x35549.videoCodec || "",
        videoDuration: Number(_0x35549.videoDuration || _0x47ba59 || 0) || 0,
        videoFps: Number(_0x35549.videoFps || 0) || 0
      };
      if (_0x221119 === "source-video" && (_0x35549.posterLocalPath || _0x35549.posterUrl || _0x35549.thumbUrl)) {
        _0x3aac3c.thumbUrl = _0x35549.posterUrl || _0x35549.thumbUrl || "";
        _0x3aac3c.thumbLocalPath = _0x35549.posterLocalPath || _0x35549.thumbLocalPath || "";
      }
      const _0x3d4805 = String(_0x35549.mediaTaskStatus || "").trim();
      const _0x3ee742 = String(_0x35549.videoProxyStatus || "").trim();
      const _0x3799f4 = _0x3d4805 === "waiting" || _0x3d4805 === "processing";
      const _0x9ce4a2 = _0x221119 === "source-video" && _0x3799f4 && isAllowedCapturePreviewUrl(_0x2cac67?.capturePreviewUrl) ? String(_0x2cac67.capturePreviewUrl || "").trim() : "";
      const _0x1ded1a = Number(_0x35549.videoWidth || _0x35549.width || 0) || _0x855b80?.width || 0;
      const _0x318140 = Number(_0x35549.videoHeight || _0x35549.height || 0) || _0x855b80?.height || 0;
      const _0x13e4e6 = Number(_0x4a1ebd.originalWidth || _0x35549.originalWidth || 0) || _0x855b80?.width || 0;
      const _0x20a9e8 = Number(_0x4a1ebd.originalHeight || _0x35549.originalHeight || 0) || _0x855b80?.height || 0;
      const _0x2f8b2e = _0x221119 === "source-video" && _0x3ee742 === "processing" ? "" : localPathToUrl(_0x35549.displayLocalPath) || _0x523b75;
      const _0x52aa84 = _0x221119 === "source-image" ? {
        originalWidth: _0x13e4e6 || undefined,
        originalHeight: _0x20a9e8 || undefined,
        imageWidth: _0x13e4e6 || undefined,
        imageHeight: _0x20a9e8 || undefined
      } : {};
      const _0xd18c27 = _0x221119 === "source-video" ? {
        videoWidth: _0x1ded1a,
        videoHeight: _0x318140
      } : {};
      const _0x403130 = {
        id: _0x1963a3,
        type: _0x221119,
        x: _0x242023,
        y: _0x3d7fff,
        width: _0x31ab12,
        height: _0x5526ca,
        src: _0x221119 === "source-video" ? _0x2f8b2e : _0x523b75,
        localPath: _0x452f38,
        ..._0x3aac3c,
        ..._0x4a1ebd,
        fileName: _0xd33c22.name,
        ...(_0x221119 === "source-video" ? {
          fileSize: Number(_0x35549.size || _0xd33c22?.size || 0) || 0,
          stagedUploadId: _0x35549.stagedUploadId || "",
          canonicalImportPending: _0x35549.canonicalImportPending === true,
          canonicalImportStatus: _0x35549.canonicalImportStatus || "",
          canonicalImportError: _0x35549.canonicalImportError || ""
        } : {}),
        name: _0xf50fa2 || getDefaultNodeName(_0x221119),
        ..._0x52aa84,
        naturalWidth: _0x221119 === "source-video" ? _0x1ded1a : _0x13e4e6,
        naturalHeight: _0x221119 === "source-video" ? _0x318140 : _0x20a9e8,
        ..._0xd18c27,
        isGenerating: _0x3799f4,
        jobStatus: _0x3799f4 ? "running" : null,
        jobError: null,
        generationDuration: null,
        capturePreviewUrl: _0x9ce4a2
      };
      if (_0x221119 === "source-image" || _0x221119 === "source-video") {
        return buildSourceMediaNodePayload(_0x403130);
      }
      return _0x403130;
    }
  } catch (_0x58a3a3) {
    console.error("[fileService] 文件 " + _0xd33c22.name + " 处理失败:", _0x58a3a3);
    throw _0x58a3a3;
  }
}
export async function handleFileDrop(_0x5e0ab8, _0x5c50e6) {
  const _0x54177b = _0x5e0ab8.dataTransfer.files;
  if (!_0x54177b || _0x54177b.length === 0) {
    return false;
  }
  _profileDragImport("drop:start", {
    count: _0x54177b.length,
    projectId: _0x5c50e6
  });
  if (_0x54177b.length === 1 && isProjectImportFileName(_0x54177b[0].name || "")) {
    return false;
  }
  _0x5e0ab8.preventDefault();
  _0x5e0ab8.stopPropagation();
  const {
    viewport: _0x4cdf1e
  } = a1539_0x145a5f.getState();
  const _0x34f21c = screenToWorld(_0x5e0ab8.clientX, _0x5e0ab8.clientY, _0x4cdf1e);
  let _0x160ebb = _0x34f21c.x;
  let _0x36e933 = _0x34f21c.y;
  let _0x1b5c8b = false;
  let _0x44e3b9 = false;
  for (let _0x40fcb0 = 0; _0x40fcb0 < _0x54177b.length; _0x40fcb0++) {
    const _0x1ac710 = _0x54177b[_0x40fcb0];
    const _0x4e46cf = getNodeTypeByFile(_0x1ac710);
    _profileDragImport("file:start", {
      name: _0x1ac710?.name || "",
      type: _0x1ac710?.type || "",
      size: _0x1ac710?.size || 0,
      nodeType: _0x4e46cf,
      canUseElectronLocalImport: canUseElectronLocalImport(_0x1ac710)
    });
    if (_0x4e46cf === "source-video" && Number(_0x1ac710?.size || 0) > CANVAS_VIDEO_IMPORT_MAX_BYTES) {
      _0x44e3b9 = true;
      showError(t("fileService.errors.videoTooLarge", {
        file: _0x1ac710?.name || t("fileService.defaultNames.video"),
        maxMB: CANVAS_VIDEO_IMPORT_MAX_MB
      }));
      continue;
    }
    let _0x2eef68 = "";
    let _0x41b61b = null;
    let _0xee903e = Promise.resolve(null);
    if (_0x4e46cf && _0x4e46cf !== "source-text") {
      const _0x29b781 = createCapturePreviewUrlForFile(_0x1ac710, _0x4e46cf);
      _0xee903e = readFileNaturalSize(_0x1ac710, _0x4e46cf).catch(() => null);
      if (_0x4e46cf === "source-video") {
        _0x2eef68 = await _0x29b781;
      } else {
        [_0x2eef68, _0x41b61b] = await Promise.all([_0x29b781, _0xee903e]);
      }
    }
    if (_0x41b61b) {
      _profileDragImport("file:natural-size", {
        name: _0x1ac710?.name || "",
        width: _0x41b61b.width,
        height: _0x41b61b.height
      });
    }
    const _0x477e30 = _0x4e46cf && _0x4e46cf !== "source-text" ? buildPendingFileNodePayload(_0x1ac710, _0x160ebb, _0x36e933, generateNodeId(_0x4e46cf, _0x40fcb0), {
      capturePreviewUrl: _0x2eef68,
      mediaNaturalSize: _0x41b61b
    }) : null;
    const _0x5efaf7 = _0x477e30?.capturePreviewUrl || "";
    if (_0x477e30) {
      a1539_0x145a5f.addNode(_0x477e30);
      a1539_0x145a5f.setSelectedNodes([_0x477e30.id]);
      _profileDragImport("pending:add", {
        id: _0x477e30.id,
        name: _0x1ac710?.name || "",
        hasCapturePreviewUrl: !!_0x477e30.capturePreviewUrl,
        jobStatus: _0x477e30.jobStatus || ""
      });
      _0x1b5c8b = true;
      _0x160ebb += 30;
      _0x36e933 += 30;
      if (_0x477e30.type === "source-video") {
        _0xee903e.then(_0x3e3574 => {
          const _0x317161 = pickNaturalSize(_0x3e3574);
          const _0x59a2a6 = Number(_0x3e3574?.duration || _0x3e3574?.videoDuration || 0);
          const _0x4893fc = Number.isFinite(_0x59a2a6) && _0x59a2a6 > 0;
          if (!_0x317161 && !_0x4893fc) {
            return;
          }
          _0x41b61b = {
            ...(_0x317161 || {}),
            ...(_0x4893fc ? {
              duration: _0x59a2a6
            } : {})
          };
          const _0x228f55 = a1539_0x145a5f.getState().nodes?.[_0x477e30.id];
          if (!_0x228f55) {
            return;
          }
          const _0x24f878 = {};
          if (_0x4893fc && Number(_0x228f55.videoDuration || 0) !== _0x59a2a6) {
            _0x24f878.videoDuration = _0x59a2a6;
          }
          const _0x354d43 = !!String(_0x228f55.localPath || _0x228f55.originalLocalPath || _0x228f55.displayLocalPath || "").trim() && Number(_0x228f55.videoWidth || 0) > 0 && Number(_0x228f55.videoHeight || 0) > 0 && _0x228f55.needsAutoResize === false;
          if (_0x317161 && !_0x354d43) {
            const _0x515846 = getAutoMediaSizeByShortSide(_0x317161.width, _0x317161.height);
            Object.assign(_0x24f878, {
              width: _0x515846.width,
              height: _0x515846.height,
              videoWidth: _0x317161.width,
              videoHeight: _0x317161.height,
              needsAutoResize: false
            });
          }
          if (Object.keys(_0x24f878).length > 0) {
            a1539_0x145a5f.updateNodeData(_0x477e30.id, _0x24f878);
          }
          _profileDragImport("pending:video-natural-size", {
            id: _0x477e30.id,
            width: _0x317161?.width || 0,
            height: _0x317161?.height || 0,
            duration: _0x4893fc ? _0x59a2a6 : 0
          });
        });
        await waitForNextPaint();
      }
    }
    try {
      _profileDragImport("process:start", {
        name: _0x1ac710?.name || "",
        pendingId: _0x477e30?.id || ""
      });
      const _0x5e43db = await processFile(_0x1ac710, _0x477e30 ? _0x477e30.x : _0x160ebb, _0x477e30 ? _0x477e30.y : _0x36e933, _0x5c50e6, _0x477e30 ? {
        nodeId: _0x477e30.id,
        mediaNaturalSize: _0x41b61b,
        capturePreviewUrl: _0x2eef68
      } : {
        mediaNaturalSize: _0x41b61b,
        capturePreviewUrl: _0x2eef68
      });
      _profileDragImport("process:done", {
        name: _0x1ac710?.name || "",
        pendingId: _0x477e30?.id || "",
        localPath: _0x5e43db?.localPath || "",
        displayLocalPath: _0x5e43db?.displayLocalPath || "",
        thumbLocalPath: _0x5e43db?.thumbLocalPath || "",
        jobStatus: _0x5e43db?.jobStatus || ""
      });
      if (_0x5e43db) {
        if (_0x477e30) {
          const _0x1db216 = a1539_0x145a5f.getState().nodes?.[_0x477e30.id];
          if (_0x1db216) {
            const _0x24b588 = pickNaturalSize({
              width: _0x5e43db.videoWidth,
              height: _0x5e43db.videoHeight
            });
            const _0x3108b5 = pickNaturalSize({
              width: _0x1db216.videoWidth,
              height: _0x1db216.videoHeight
            });
            const _0x52ceb3 = _0x477e30.type === "source-video" && !_0x24b588 && _0x3108b5 && _0x1db216.needsAutoResize === false ? {
              ..._0x5e43db,
              width: _0x1db216.width,
              height: _0x1db216.height,
              videoWidth: _0x3108b5.width,
              videoHeight: _0x3108b5.height,
              needsAutoResize: false
            } : _0x5e43db;
            const _0x4b685a = Number(_0x1db216.videoDuration || 0);
            const _0xa90855 = Number(_0x52ceb3.videoDuration || 0);
            const _0x11c196 = _0x477e30.type === "source-video" && String(_0x5efaf7 || "").startsWith("blob:") && _0x52ceb3.capturePreviewUrl !== _0x5efaf7;
            const _0x4f2c9e = _0x477e30.type === "source-video" ? {
              ..._0x52ceb3,
              ...(_0xa90855 <= 0 && _0x4b685a > 0 ? {
                videoDuration: _0x4b685a
              } : {}),
              ...(_0x11c196 ? {
                capturePreviewUrl: _0x5efaf7
              } : {})
            } : _0x52ceb3;
            a1539_0x145a5f.updateNodeData(_0x477e30.id, _0x4f2c9e);
            _profileDragImport("pending:update-final", {
              id: _0x477e30.id,
              localPath: _0x5e43db?.localPath || "",
              displayLocalPath: _0x5e43db?.displayLocalPath || "",
              thumbLocalPath: _0x5e43db?.thumbLocalPath || ""
            });
            if (!_0x11c196 && _0x5e43db.capturePreviewUrl !== _0x5efaf7) {
              scheduleRevokeObjectUrl(_0x5efaf7);
            }
          } else {
            revokeObjectUrl(_0x5efaf7);
          }
        } else {
          a1539_0x145a5f.addNode(_0x5e43db);
          a1539_0x145a5f.setSelectedNodes([_0x5e43db.id]);
          _0x1b5c8b = true;
          _0x160ebb += 30;
          _0x36e933 += 30;
        }
      }
    } catch (_0x26f48c) {
      const _0x67d83f = _toOneLineMessage(_0x26f48c);
      const _0x3f94e8 = _0x67d83f || t("fileService.errors.importFailed");
      logDiagnosticEvent({
        type: "import.file_failed",
        level: "error",
        source: "renderer",
        message: _0x3f94e8,
        error: _0x26f48c,
        context: {
          fileName: _0x1ac710?.name || "",
          fileType: _0x1ac710?.type || "",
          fileSize: Number(_0x1ac710?.size || 0) || 0,
          projectId: _0x5c50e6 || ""
        }
      });
      if (_0x477e30 && a1539_0x145a5f.getState().nodes?.[_0x477e30.id]) {
        a1539_0x145a5f.updateNodeData(_0x477e30.id, {
          isGenerating: false,
          jobStatus: "error",
          jobError: _0x3f94e8,
          generationDuration: Date.now() - Number(_0x477e30.generationStartTime || Date.now()),
          capturePreviewUrl: ""
        });
      }
      revokeObjectUrl(_0x5efaf7);
      showError(t("fileService.errors.importFailedWithFile", {
        file: _0x1ac710?.name || t("fileService.defaultNames.file"),
        reason: _0x67d83f ? t("fileService.errors.importFailedReason", {
          reason: _0x67d83f
        }) : ""
      }).trim());
      console.error("[fileService] 处理文件失败:", _0x26f48c);
    }
  }
  return _0x1b5c8b || _0x44e3b9;
}
export async function handleWebImageUrlDrop(_0x432676, _0xfd7f0e = {}) {
  const _0x23f014 = extractWebImageDropPayload(_0x432676?.dataTransfer);
  if (!_0x23f014?.url) {
    return false;
  }
  _0x432676?.preventDefault?.();
  _0x432676?.stopPropagation?.();
  const _0x42298e = _0xfd7f0e.storeInstance || a1539_0x145a5f;
  const _0x2590a9 = typeof _0x42298e.getState === "function" ? _0x42298e.getState() : {};
  const _0x413505 = screenToWorld(_0x432676?.clientX || 0, _0x432676?.clientY || 0, _0x2590a9.viewport || {});
  const _0x264ba7 = createWebImageSourceNode({
    payload: _0x23f014,
    worldX: _0x413505.x,
    worldY: _0x413505.y,
    storeInstance: _0x42298e,
    projectId: _0xfd7f0e.projectId,
    importRemote: _0xfd7f0e.importRemote !== false
  });
  if (!_0x264ba7) {
    return false;
  }
  _profileDragImport("web-image:add", {
    id: _0x264ba7.id,
    url: _0x23f014.url,
    pageUrl: _0x23f014.pageUrl || ""
  });
  return true;
}
export function downloadJson(_0x53f483, _0x2383c4) {
  return saveTextDownload({
    filename: _0x2383c4,
    content: JSON.stringify(_0x53f483, null, 2),
    mimeType: "application/json",
    filterName: "JSON"
  });
}
export function readJsonFile(_0x2bc763) {
  return new Promise((_0x197477, _0x3a5b18) => {
    const _0x3fb48a = new FileReader();
    _0x3fb48a.onload = _0x1d8b38 => {
      try {
        const _0x106497 = JSON.parse(_0x1d8b38.target.result);
        _0x197477(_0x106497);
      } catch (_0x2c87aa) {
        _0x3a5b18(new Error(t("fileService.errors.jsonParseFailed")));
      }
    };
    _0x3fb48a.onerror = () => _0x3a5b18(new Error(t("fileService.errors.fileReadFailed")));
    _0x3fb48a.readAsText(_0x2bc763);
  });
}