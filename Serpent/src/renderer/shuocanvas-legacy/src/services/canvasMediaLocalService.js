import { buildImageNodeStorageFields, pickCanvasImageLocalPath, pickCanvasThumbLocalPath, pickPreviewFallbackLocalPath, pickPreviewImageLocalPath, toLocalPathUrl } from "./imageDerivativeService.js";
import { isSafeVirtualLocalPath, localPathToUrl, normalizeLocalPath } from "../utils/localMediaPath.js";
const REMOTE_HTTP_RE = /^https?:\/\//i;
const IMAGE_NODE_TYPES = new Set(["source-image", "image", "ai-image"]);
const VIDEO_NODE_TYPES = new Set(["source-video", "video", "ai-video"]);
const AUDIO_NODE_TYPES = new Set(["source-audio", "audio", "ai-audio"]);
export const VIDEO_PROXY_VERSION_V2_1280 = "v2-1280";
const IMAGE_TRIGGER_KEYS = ["src", "imageUrl", "sourceUrl", "thumbUrl", "url", "resultUrl", "localPath", "originalLocalPath", "displayLocalPath", "thumbLocalPath"];
const VIDEO_TRIGGER_KEYS = ["src", "videoUrl", "thumbUrl", "url", "resultUrl", "localPath", "originalLocalPath", "displayLocalPath", "posterLocalPath", "videoThumbSrc", "videoMetaSrc", "videoProxyVersion", "pendingVideoProxyLocalPath", "pendingVideoProxyVersion"];
const AUDIO_TRIGGER_KEYS = ["src", "audioUrl", "url", "resultUrl", "localPath"];
function hasOwn(_0x3ae41e, _0x3f0f1b) {
  return !!_0x3ae41e && Object.prototype.hasOwnProperty.call(_0x3ae41e, _0x3f0f1b);
}
function normalizeText(_0x5c27f8) {
  return String(_0x5c27f8 || "").trim();
}
function firstNonEmptyString(..._0x507104) {
  for (const _0x38f6be of _0x507104) {
    const _0xf3fd3 = normalizeText(_0x38f6be);
    if (_0xf3fd3) {
      return _0xf3fd3;
    }
  }
  return "";
}
function touchesAnyKey(_0x515c27, _0x10270b) {
  return Array.isArray(_0x10270b) && _0x10270b.some(_0x3faae0 => hasOwn(_0x515c27, _0x3faae0));
}
function normalizeLocalUrlText(_0x516ce3) {
  const _0xdd4e = normalizeCanvasLocalPath(_0x516ce3);
  return localPathToUrl(_0xdd4e);
}
function pickLocalPath(_0x49fc90, _0x1022d2) {
  for (const _0x4d39ad of _0x1022d2) {
    const _0x52d766 = normalizeCanvasLocalPath(_0x49fc90?.[_0x4d39ad]);
    if (_0x52d766) {
      return _0x52d766;
    }
  }
  return "";
}
function copyCommonImageMeta(_0x140eff, _0x3f0431) {
  if (hasOwn(_0x3f0431, "assetId")) {
    _0x140eff.assetId = normalizeText(_0x3f0431.assetId);
  }
  if (hasOwn(_0x3f0431, "sourceId")) {
    _0x140eff.sourceId = normalizeText(_0x3f0431.sourceId);
  }
  if (hasOwn(_0x3f0431, "thumbId")) {
    _0x140eff.thumbId = normalizeText(_0x3f0431.thumbId);
  }
  if (hasOwn(_0x3f0431, "fileName")) {
    _0x140eff.fileName = _0x3f0431.fileName;
  }
  if (hasOwn(_0x3f0431, "error")) {
    _0x140eff.error = _0x3f0431.error;
  }
  if (hasOwn(_0x3f0431, "derivativeStatus")) {
    _0x140eff.derivativeStatus = normalizeText(_0x3f0431.derivativeStatus);
  }
}
function copyCommonVideoMeta(_0x52a05d, _0x6f0a91) {
  if (hasOwn(_0x6f0a91, "assetId")) {
    _0x52a05d.assetId = normalizeText(_0x6f0a91.assetId);
  }
  if (hasOwn(_0x6f0a91, "fileName")) {
    _0x52a05d.fileName = _0x6f0a91.fileName;
  }
  if (hasOwn(_0x6f0a91, "thumbId")) {
    _0x52a05d.thumbId = normalizeText(_0x6f0a91.thumbId);
  }
  if (hasOwn(_0x6f0a91, "videoProxyStatus")) {
    _0x52a05d.videoProxyStatus = normalizeText(_0x6f0a91.videoProxyStatus);
  }
  if (hasOwn(_0x6f0a91, "videoProxyVersion")) {
    _0x52a05d.videoProxyVersion = normalizeText(_0x6f0a91.videoProxyVersion);
  }
  if (hasOwn(_0x6f0a91, "pendingVideoProxyLocalPath")) {
    _0x52a05d.pendingVideoProxyLocalPath = normalizeCanvasLocalPath(_0x6f0a91.pendingVideoProxyLocalPath);
  }
  if (hasOwn(_0x6f0a91, "pendingVideoProxyVersion")) {
    _0x52a05d.pendingVideoProxyVersion = normalizeText(_0x6f0a91.pendingVideoProxyVersion);
  }
  if (hasOwn(_0x6f0a91, "videoCodec")) {
    _0x52a05d.videoCodec = normalizeText(_0x6f0a91.videoCodec);
  }
  if (hasOwn(_0x6f0a91, "videoWidth")) {
    _0x52a05d.videoWidth = Number(_0x6f0a91.videoWidth || 0) || 0;
  }
  if (hasOwn(_0x6f0a91, "videoHeight")) {
    _0x52a05d.videoHeight = Number(_0x6f0a91.videoHeight || 0) || 0;
  }
  if (hasOwn(_0x6f0a91, "videoDuration")) {
    _0x52a05d.videoDuration = Number(_0x6f0a91.videoDuration || 0) || 0;
  }
  if (hasOwn(_0x6f0a91, "videoFps")) {
    _0x52a05d.videoFps = Number(_0x6f0a91.videoFps || 0) || 0;
  }
  if (hasOwn(_0x6f0a91, "derivativeStatus")) {
    _0x52a05d.derivativeStatus = normalizeText(_0x6f0a91.derivativeStatus);
  }
}
function buildNormalizedImageStorage(_0x344e6f = {}) {
  const _0x1894fc = pickLocalPath(_0x344e6f, ["localPath", "originalLocalPath", "displayLocalPath", "imageUrl", "sourceUrl", "src", "url", "resultUrl"]);
  const _0x32d3dc = pickLocalPath(_0x344e6f, ["originalLocalPath", "localPath", "sourceUrl", "imageUrl", "src", "url", "resultUrl"]);
  const _0x2b6e75 = pickLocalPath(_0x344e6f, ["displayLocalPath", "imageUrl", "src", "url", "resultUrl"]);
  const _0x1d7a55 = pickLocalPath(_0x344e6f, ["thumbLocalPath", "thumbUrl"]);
  return buildImageNodeStorageFields({
    ..._0x344e6f,
    localPath: _0x1894fc,
    originalLocalPath: _0x32d3dc,
    displayLocalPath: _0x2b6e75,
    thumbLocalPath: _0x1d7a55
  });
}
export function resolveCanvasImageSourceUrl(_0x33f818 = {}) {
  const _0x51b26e = buildNormalizedImageStorage(_0x33f818);
  const _0x4bcce4 = pickPreviewImageLocalPath(_0x51b26e) || _0x51b26e.originalLocalPath || _0x51b26e.localPath;
  return toLocalPathUrl(_0x4bcce4);
}
function resolveCanvasImageDisplayPath(_0x3cea5e = {}) {
  return pickCanvasImageLocalPath(buildNormalizedImageStorage(_0x3cea5e));
}
function resolveCanvasImageThumbPath(_0x10c0f4 = {}) {
  return pickCanvasThumbLocalPath(buildNormalizedImageStorage(_0x10c0f4));
}
export function isRemoteHttpUrl(_0x2fd79a) {
  return REMOTE_HTTP_RE.test(normalizeText(_0x2fd79a));
}
export function normalizeCanvasLocalPath(_0x3118e1) {
  return normalizeLocalPath(_0x3118e1);
}
export function toCanvasLocalUrl(_0x2b0dbd) {
  return localPathToUrl(_0x2b0dbd);
}
export function resolveCanvasImageDisplayUrl(_0x4b7bf5 = {}) {
  return toLocalPathUrl(resolveCanvasImageDisplayPath(_0x4b7bf5));
}
export function resolveCanvasImageThumbUrl(_0xd97cb7 = {}) {
  return toLocalPathUrl(resolveCanvasImageThumbPath(_0xd97cb7));
}
export function resolveCanvasImageLowZoomUrl(_0x427f6a = {}) {
  return resolveCanvasImageThumbUrl(_0x427f6a) || resolveCanvasImageDisplayUrl(_0x427f6a) || resolveCanvasImageSourceUrl(_0x427f6a);
}
export function resolveCanvasImagePreviewUrl(_0x4edbb9 = {}) {
  const _0x38b59e = buildNormalizedImageStorage(_0x4edbb9);
  const _0x2b5023 = firstNonEmptyString(pickPreviewImageLocalPath(_0x38b59e), pickPreviewFallbackLocalPath(_0x38b59e));
  return toLocalPathUrl(_0x2b5023);
}
export function resolveCanvasVideoLocalPath(_0x316172 = {}) {
  const _0x577974 = pickLocalPath(_0x316172, ["displayLocalPath"]);
  if (_0x577974) {
    return _0x577974;
  }
  const _0x480f54 = normalizeText(_0x316172?.videoProxyStatus);
  if (_0x480f54 === "processing" || _0x480f54 === "waiting") {
    return "";
  }
  return pickLocalPath(_0x316172, ["src", "videoUrl", "url", "resultUrl", "localPath"]);
}
export function resolveCanvasVideoUrl(_0x23e9da = {}) {
  return toCanvasLocalUrl(resolveCanvasVideoLocalPath(_0x23e9da));
}
export function resolveCanvasVideoDisplayUrl(_0x2750f0 = {}) {
  return resolveCanvasVideoUrl(_0x2750f0) || normalizeRemoteMediaFallback(_0x2750f0);
}
export function buildCanvasVideoProxyPromotionPatch(_0x30115c = {}) {
  const _0x51e019 = pickLocalPath(_0x30115c, ["pendingVideoProxyLocalPath"]);
  const _0xf173d4 = normalizeText(_0x30115c?.pendingVideoProxyVersion);
  if (!_0x51e019 || _0xf173d4 !== VIDEO_PROXY_VERSION_V2_1280) {
    return null;
  }
  return {
    ...buildCanvasLocalVideoFields({
      displayLocalPath: _0x51e019,
      videoProxyStatus: "generated",
      videoProxyVersion: _0xf173d4
    }),
    pendingVideoProxyLocalPath: "",
    pendingVideoProxyVersion: "",
    videoProxyMigrationStatus: "promoted",
    videoProxyMigrationError: ""
  };
}
function normalizeCanvasVideoPosterUrl(_0x198e2b, {
  localOnly = false
} = {}) {
  const _0x417cfe = normalizeText(_0x198e2b);
  if (!_0x417cfe) {
    return "";
  }
  if (/^data:image\//i.test(_0x417cfe) || /^blob:/i.test(_0x417cfe) || /^aic-local-preview:/i.test(_0x417cfe)) {
    return _0x417cfe;
  }
  if (/^(?:https?:|file:)/i.test(_0x417cfe)) {
    return "";
  }
  const _0x19809b = localPathToUrl(_0x417cfe);
  if (_0x19809b) {
    return _0x19809b;
  }
  if (localOnly) {
    return "";
  } else {
    return _0x417cfe;
  }
}
export function resolveCanvasVideoPosterUrl(_0x271d60 = {}) {
  const _0x4e787a = Array.isArray(_0x271d60?.videos) ? _0x271d60.videos : [];
  const _0x59f1e7 = Math.max(0, Number(_0x271d60?.mainVideoIndex) || 0);
  const _0x51644a = _0x4e787a[_0x59f1e7] || _0x4e787a[0] || null;
  const _0x1d6bfb = [[_0x51644a?.posterLocalPath, true], [_0x51644a?.previewLocalPath, true], [_0x51644a?.thumbLocalPath, true], [_0x51644a?.thumbnailLocalPath, true], [_0x51644a?.posterUrl, false], [_0x51644a?.previewUrl, false], [_0x51644a?.thumbUrl, false], [_0x51644a?.thumbnailUrl, false], [_0x271d60?.posterLocalPath, true], [_0x271d60?.previewLocalPath, true], [_0x271d60?.thumbLocalPath, true], [_0x271d60?.thumbnailLocalPath, true], [_0x271d60?.posterUrl, false], [_0x271d60?.previewUrl, false], [_0x271d60?.thumbUrl, false], [_0x271d60?.thumbnailUrl, false]];
  for (const [_0x5bb5d6, _0x41a350] of _0x1d6bfb) {
    const _0x58f04e = normalizeCanvasVideoPosterUrl(_0x5bb5d6, {
      localOnly: _0x41a350
    });
    if (_0x58f04e) {
      return _0x58f04e;
    }
  }
  return "";
}
export function resolveCanvasAudioLocalPath(_0x3bfe38 = {}) {
  const _0x4d6a30 = Array.isArray(_0x3bfe38?.audios) ? _0x3bfe38.audios : [];
  const _0x589d43 = Number.isFinite(Number(_0x3bfe38?.mainAudioIndex)) ? Math.max(0, Math.trunc(Number(_0x3bfe38.mainAudioIndex))) : 0;
  const _0xa9e213 = _0x4d6a30[_0x589d43] || _0x4d6a30[0] || null;
  const _0x548907 = pickLocalPath(_0xa9e213, ["localPath", "audioUrl", "src", "url", "resultUrl"]);
  if (_0x548907) {
    return _0x548907;
  }
  return pickLocalPath(_0x3bfe38, ["localPath", "audioUrl", "src", "url", "resultUrl"]);
}
export function resolveCanvasAudioUrl(_0x5743cc = {}) {
  return toCanvasLocalUrl(resolveCanvasAudioLocalPath(_0x5743cc));
}
export function buildCanvasLocalImageFields(_0x54de48 = {}, _0x43f366 = {}) {
  const _0xd88a56 = buildNormalizedImageStorage(_0x54de48);
  const _0x5a8084 = toLocalPathUrl(pickCanvasImageLocalPath(_0xd88a56));
  const _0x100ac3 = resolveCanvasImageSourceUrl(_0xd88a56);
  const _0x3d4c21 = toLocalPathUrl(pickCanvasThumbLocalPath(_0xd88a56));
  const _0x4fbbc7 = _0x43f366.includeSrc === true || hasOwn(_0x54de48, "src");
  const _0x124502 = _0x43f366.includeCanonicalUrl === true || hasOwn(_0x54de48, "url");
  const _0x34e041 = _0x43f366.includeResultUrl === true || hasOwn(_0x54de48, "resultUrl");
  const _0x370e17 = {};
  if (hasOwn(_0x54de48, "localPath") || _0xd88a56.localPath || _0xd88a56.originalLocalPath) {
    _0x370e17.localPath = _0xd88a56.localPath || "";
    _0x370e17.originalLocalPath = _0xd88a56.originalLocalPath || "";
  }
  if (hasOwn(_0x54de48, "displayLocalPath") || _0xd88a56.displayLocalPath) {
    _0x370e17.displayLocalPath = _0xd88a56.displayLocalPath || "";
  }
  if (hasOwn(_0x54de48, "thumbLocalPath") || hasOwn(_0x54de48, "thumbUrl") || _0xd88a56.thumbLocalPath) {
    _0x370e17.thumbLocalPath = _0xd88a56.thumbLocalPath || "";
  }
  if (touchesAnyKey(_0x54de48, ["imageUrl", "sourceUrl", "thumbUrl", "localPath", "originalLocalPath", "displayLocalPath", "thumbLocalPath", "src", "url", "resultUrl"]) || _0x5a8084 || _0x100ac3 || _0x3d4c21) {
    _0x370e17.imageUrl = _0x5a8084 || "";
    _0x370e17.sourceUrl = _0x100ac3 || "";
    _0x370e17.thumbUrl = _0x3d4c21 || "";
  }
  if (_0x4fbbc7) {
    _0x370e17.src = _0x5a8084 || "";
  }
  if (_0x124502) {
    _0x370e17.url = _0x5a8084 || "";
  }
  if (_0x34e041) {
    _0x370e17.resultUrl = _0x5a8084 || "";
  }
  copyCommonImageMeta(_0x370e17, _0x54de48);
  return _0x370e17;
}
export function buildCanvasLocalVideoFields(_0x14e853 = {}, _0x155e67 = {}) {
  const _0x27d1ab = pickLocalPath(_0x14e853, ["localPath", "originalLocalPath", "videoUrl", "src", "url", "resultUrl"]);
  const _0x19efca = pickLocalPath(_0x14e853, ["originalLocalPath"]);
  const _0x5f2bc6 = pickLocalPath(_0x14e853, ["displayLocalPath"]);
  const _0x1d1aaa = resolveCanvasVideoLocalPath(_0x14e853);
  const _0x599c0f = toLocalPathUrl(_0x1d1aaa);
  const _0x430520 = toCanvasLocalUrl(_0x14e853?.thumbUrl);
  const _0x2b154e = pickLocalPath(_0x14e853, ["posterLocalPath"]);
  const _0x1e075b = toLocalPathUrl(_0x2b154e);
  const _0x55a222 = toCanvasLocalUrl(_0x14e853?.videoThumbSrc || _0x1d1aaa);
  const _0x3e885e = _0x155e67.includeCanonicalUrl === true || hasOwn(_0x14e853, "url");
  const _0x2b0264 = _0x155e67.includeResultUrl === true || hasOwn(_0x14e853, "resultUrl");
  const _0x5bf727 = {};
  if (hasOwn(_0x14e853, "localPath") || hasOwn(_0x14e853, "videoUrl") || hasOwn(_0x14e853, "src") || hasOwn(_0x14e853, "url") || hasOwn(_0x14e853, "resultUrl") || hasOwn(_0x14e853, "displayLocalPath") || _0x1d1aaa) {
    if (hasOwn(_0x14e853, "localPath") || hasOwn(_0x14e853, "videoUrl") || hasOwn(_0x14e853, "src") || hasOwn(_0x14e853, "url") || hasOwn(_0x14e853, "resultUrl") || _0x27d1ab) {
      _0x5bf727.localPath = _0x27d1ab || "";
    }
    if (hasOwn(_0x14e853, "originalLocalPath") || _0x19efca) {
      _0x5bf727.originalLocalPath = _0x19efca || "";
    }
    if (hasOwn(_0x14e853, "displayLocalPath") || _0x5f2bc6) {
      _0x5bf727.displayLocalPath = _0x5f2bc6 || "";
    }
    _0x5bf727.videoUrl = _0x599c0f || "";
    _0x5bf727.src = _0x599c0f || "";
  }
  if (hasOwn(_0x14e853, "thumbUrl") || _0x430520) {
    _0x5bf727.thumbUrl = _0x430520 || _0x1e075b || "";
  }
  if (hasOwn(_0x14e853, "posterLocalPath") || _0x2b154e) {
    _0x5bf727.posterLocalPath = _0x2b154e || "";
    if (!_0x5bf727.thumbUrl) {
      _0x5bf727.thumbUrl = _0x1e075b || "";
    }
  }
  if (hasOwn(_0x14e853, "videoThumbSrc")) {
    _0x5bf727.videoThumbSrc = _0x55a222 || "";
  }
  if (hasOwn(_0x14e853, "videoMetaSrc")) {
    _0x5bf727.videoMetaSrc = toCanvasLocalUrl(_0x14e853.videoMetaSrc || _0x1d1aaa);
  }
  if (_0x3e885e) {
    _0x5bf727.url = _0x599c0f || "";
  }
  if (_0x2b0264) {
    _0x5bf727.resultUrl = _0x599c0f || "";
  }
  copyCommonVideoMeta(_0x5bf727, _0x14e853);
  return _0x5bf727;
}
export function buildCanvasLocalAudioFields(_0x5f07d4 = {}, _0x5885a9 = {}) {
  const _0x355a0a = resolveCanvasAudioLocalPath(_0x5f07d4);
  const _0xb1c849 = toLocalPathUrl(_0x355a0a);
  const _0x51fa20 = pickLocalPath(_0x5f07d4, ["waveformLocalPath"]);
  const _0x1711e3 = _0x5885a9.includeCanonicalUrl === true || hasOwn(_0x5f07d4, "url");
  const _0x317b04 = _0x5885a9.includeResultUrl === true || hasOwn(_0x5f07d4, "resultUrl");
  const _0x125e0a = {};
  if (hasOwn(_0x5f07d4, "localPath") || hasOwn(_0x5f07d4, "audioUrl") || hasOwn(_0x5f07d4, "src") || hasOwn(_0x5f07d4, "url") || hasOwn(_0x5f07d4, "resultUrl") || _0x355a0a) {
    _0x125e0a.localPath = _0x355a0a || "";
    _0x125e0a.audioUrl = _0xb1c849 || "";
    _0x125e0a.src = _0xb1c849 || "";
  }
  if (_0x1711e3) {
    _0x125e0a.url = _0xb1c849 || "";
  }
  if (_0x317b04) {
    _0x125e0a.resultUrl = _0xb1c849 || "";
  }
  if (hasOwn(_0x5f07d4, "waveformLocalPath") || _0x51fa20) {
    _0x125e0a.waveformLocalPath = _0x51fa20 || "";
  }
  if (hasOwn(_0x5f07d4, "assetId")) {
    _0x125e0a.assetId = normalizeText(_0x5f07d4.assetId);
  }
  if (hasOwn(_0x5f07d4, "derivativeStatus")) {
    _0x125e0a.derivativeStatus = normalizeText(_0x5f07d4.derivativeStatus);
  }
  if (hasOwn(_0x5f07d4, "fileName")) {
    _0x125e0a.fileName = _0x5f07d4.fileName;
  }
  return _0x125e0a;
}
function normalizeRemoteMediaFallback(_0x2046ca = {}) {
  const _0x4b44ac = normalizeText(_0x2046ca?.remoteFallbackUrl);
  const _0x54c055 = normalizeText(_0x2046ca?.localSaveError);
  if (!_0x4b44ac || !_0x54c055) {
    return "";
  }
  if (/^(?:https?:)?\/\//i.test(_0x4b44ac)) {
    return _0x4b44ac;
  } else {
    return "";
  }
}
function normalizeImageCollection(_0x340d2a) {
  if (!Array.isArray(_0x340d2a)) {
    return _0x340d2a;
  }
  return _0x340d2a.map(_0x3ab7eb => {
    if (!_0x3ab7eb || typeof _0x3ab7eb !== "object") {
      return _0x3ab7eb;
    }
    return {
      ..._0x3ab7eb,
      ...buildCanvasLocalImageFields(_0x3ab7eb, {
        includeSrc: hasOwn(_0x3ab7eb, "src"),
        includeCanonicalUrl: hasOwn(_0x3ab7eb, "url"),
        includeResultUrl: hasOwn(_0x3ab7eb, "resultUrl")
      }),
      remoteFallbackUrl: normalizeRemoteMediaFallback(_0x3ab7eb)
    };
  });
}
function normalizeVideoCollection(_0xa28339) {
  if (!Array.isArray(_0xa28339)) {
    return _0xa28339;
  }
  return _0xa28339.map(_0x2b739 => {
    if (!_0x2b739 || typeof _0x2b739 !== "object") {
      return _0x2b739;
    }
    return {
      ..._0x2b739,
      ...buildCanvasLocalVideoFields(_0x2b739, {
        includeCanonicalUrl: hasOwn(_0x2b739, "url"),
        includeResultUrl: hasOwn(_0x2b739, "resultUrl")
      }),
      remoteFallbackUrl: normalizeRemoteMediaFallback(_0x2b739)
    };
  });
}
function normalizeAudioCollection(_0xdc13a6) {
  if (!Array.isArray(_0xdc13a6)) {
    return _0xdc13a6;
  }
  return _0xdc13a6.map(_0x23172d => {
    if (!_0x23172d || typeof _0x23172d !== "object") {
      return _0x23172d;
    }
    return {
      ..._0x23172d,
      ...buildCanvasLocalAudioFields(_0x23172d, {
        includeCanonicalUrl: hasOwn(_0x23172d, "url"),
        includeResultUrl: hasOwn(_0x23172d, "resultUrl")
      })
    };
  });
}
function validateUrlField(_0x48c03d, _0x159474) {
  const _0x487b44 = normalizeText(_0x159474);
  if (!_0x487b44) {
    return;
  }
  if (normalizeLocalUrlText(_0x487b44) !== _0x487b44) {
    throw new Error("[canvasMediaLocalService] " + _0x48c03d + " 必须是本地 URL");
  }
}
function validatePathField(_0x3f7581, _0x1d889d) {
  const _0x2577e5 = normalizeText(_0x1d889d);
  if (!_0x2577e5) {
    return;
  }
  const _0x26ed2c = normalizeCanvasLocalPath(_0x2577e5);
  if (!_0x26ed2c || !isSafeVirtualLocalPath(_0x26ed2c)) {
    throw new Error("[canvasMediaLocalService] " + _0x3f7581 + " 必须是本地路径");
  }
}
export function assertCanvasMediaPatchLocalOnly(_0x512d63 = {}) {
  if (!_0x512d63 || typeof _0x512d63 !== "object") {
    return;
  }
  const _0x6c5dbb = _0x2a2667 => {
    if (!_0x2a2667 || typeof _0x2a2667 !== "object") {
      return;
    }
    for (const _0x5c6269 of ["src", "imageUrl", "sourceUrl", "thumbUrl", "videoUrl", "audioUrl", "url", "resultUrl", "videoThumbSrc", "videoMetaSrc"]) {
      if (hasOwn(_0x2a2667, _0x5c6269)) {
        validateUrlField(_0x5c6269, _0x2a2667[_0x5c6269]);
      }
    }
    for (const _0x71034c of ["localPath", "originalLocalPath", "displayLocalPath", "pendingVideoProxyLocalPath", "thumbLocalPath", "posterLocalPath", "waveformLocalPath", "imageLocalPath", "path"]) {
      if (hasOwn(_0x2a2667, _0x71034c)) {
        validatePathField(_0x71034c, _0x2a2667[_0x71034c]);
      }
    }
  };
  _0x6c5dbb(_0x512d63);
  if (Array.isArray(_0x512d63.images)) {
    for (const _0x356252 of _0x512d63.images) {
      _0x6c5dbb(_0x356252);
    }
  }
  if (Array.isArray(_0x512d63.videos)) {
    for (const _0x2d8f01 of _0x512d63.videos) {
      _0x6c5dbb(_0x2d8f01);
    }
  }
  if (Array.isArray(_0x512d63.audios)) {
    for (const _0x26bab4 of _0x512d63.audios) {
      _0x6c5dbb(_0x26bab4);
    }
  }
}
export function sanitizeCanvasNodeMediaPatchForStore(_0x2cd3c4 = {}, _0x4622af = null) {
  if (!_0x2cd3c4 || typeof _0x2cd3c4 !== "object" || Array.isArray(_0x2cd3c4)) {
    return _0x2cd3c4;
  }
  const _0x20d7be = normalizeText(_0x2cd3c4.type || _0x4622af?.type);
  const _0x2de648 = {
    ..._0x2cd3c4
  };
  if (hasOwn(_0x2cd3c4, "images")) {
    _0x2de648.images = normalizeImageCollection(_0x2cd3c4.images);
  }
  if (hasOwn(_0x2cd3c4, "remoteFallbackUrl") || hasOwn(_0x2cd3c4, "localSaveError")) {
    _0x2de648.remoteFallbackUrl = normalizeRemoteMediaFallback({
      ...(_0x4622af && typeof _0x4622af === "object" ? _0x4622af : {}),
      ..._0x2cd3c4
    });
  }
  if (hasOwn(_0x2cd3c4, "videos")) {
    _0x2de648.videos = normalizeVideoCollection(_0x2cd3c4.videos);
  }
  if (hasOwn(_0x2cd3c4, "audios")) {
    _0x2de648.audios = normalizeAudioCollection(_0x2cd3c4.audios);
  }
  const _0x3f5fe3 = hasOwn(_0x2cd3c4, "images") || !VIDEO_NODE_TYPES.has(_0x20d7be) && !AUDIO_NODE_TYPES.has(_0x20d7be) && (touchesAnyKey(_0x2cd3c4, IMAGE_TRIGGER_KEYS) || IMAGE_NODE_TYPES.has(_0x20d7be) && touchesAnyKey(_0x2cd3c4, ["src", "localPath", "fileName"]));
  if (_0x3f5fe3) {
    Object.assign(_0x2de648, buildCanvasLocalImageFields(_0x2cd3c4, {
      includeSrc: hasOwn(_0x2cd3c4, "src") || IMAGE_NODE_TYPES.has(_0x20d7be),
      includeCanonicalUrl: hasOwn(_0x2cd3c4, "url"),
      includeResultUrl: hasOwn(_0x2cd3c4, "resultUrl")
    }));
  }
  const _0x45d2c2 = hasOwn(_0x2cd3c4, "videos") || touchesAnyKey(_0x2cd3c4, ["videoUrl", "videoThumbSrc", "videoMetaSrc", "posterLocalPath", "videoProxyStatus", "videoProxyVersion"]) || VIDEO_NODE_TYPES.has(_0x20d7be) && touchesAnyKey(_0x2cd3c4, VIDEO_TRIGGER_KEYS);
  if (_0x45d2c2) {
    Object.assign(_0x2de648, buildCanvasLocalVideoFields(_0x2cd3c4, {
      includeCanonicalUrl: hasOwn(_0x2cd3c4, "url"),
      includeResultUrl: hasOwn(_0x2cd3c4, "resultUrl")
    }));
  }
  const _0x53329e = hasOwn(_0x2cd3c4, "audios") || hasOwn(_0x2cd3c4, "audioUrl") || AUDIO_NODE_TYPES.has(_0x20d7be) && touchesAnyKey(_0x2cd3c4, ["src", "localPath", "waveformLocalPath", "fileName"]);
  if (_0x53329e) {
    Object.assign(_0x2de648, buildCanvasLocalAudioFields(_0x2cd3c4, {
      includeCanonicalUrl: hasOwn(_0x2cd3c4, "url"),
      includeResultUrl: hasOwn(_0x2cd3c4, "resultUrl")
    }));
  }
  return _0x2de648;
}