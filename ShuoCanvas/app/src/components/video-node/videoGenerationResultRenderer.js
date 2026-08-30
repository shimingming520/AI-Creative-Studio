import { buildGenerationCollectionResultPatch, firstNonEmptyString, getFirstGenerationResultError, normalizeGenerationResultItems } from "../../core/generationResultRenderer.js";
import { localPathToUrl, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { t } from "../../i18n/index.js";
const VIDEO_GENERATION_MEDIA_CLEAR_PATCH = Object.freeze({
  src: "",
  url: "",
  sourceUrl: "",
  resultUrl: "",
  videoUrl: "",
  videoLocalPath: "",
  localPath: "",
  originalLocalPath: "",
  displayLocalPath: "",
  thumbId: "",
  thumbUrl: "",
  posterUrl: "",
  posterLocalPath: "",
  thumbLocalPath: "",
  previewUrl: "",
  previewLocalPath: "",
  thumbnailUrl: "",
  thumbnailLocalPath: "",
  videoThumbSrc: "",
  videoMetaSrc: "",
  capturePreviewUrl: "",
  videoProxyStatus: "",
  videoProxyVersion: "",
  pendingVideoProxyLocalPath: "",
  pendingVideoProxyVersion: "",
  videoCodec: "",
  remoteFallbackUrl: "",
  localSaveError: "",
  mediaUnavailable: false,
  mediaUnavailableSource: "",
  videoThumbUnavailableSource: ""
});
function videoGenerationResultText(_0x27a200, _0x2f9a1c = {}) {
  return t("videoGenerationResult." + _0x27a200, _0x2f9a1c);
}
function asObject(_0x513825) {
  if (_0x513825 && typeof _0x513825 === "object" && !Array.isArray(_0x513825)) {
    return _0x513825;
  } else {
    return null;
  }
}
function normalizeVideoGenerationResultItem(_0x5b2368) {
  const _0x2c656e = asObject(_0x5b2368);
  if (!_0x2c656e) {
    throw new Error("[videoGenerationResult] item must be an object");
  }
  const _0x1a9e79 = firstNonEmptyString(_0x2c656e.localPath, pickResultLocalPath(_0x2c656e));
  const _0x2f6377 = firstNonEmptyString(_0x2c656e.videoUrl, _0x2c656e.url, _0x2c656e.localUrl, localPathToUrl(_0x1a9e79));
  const _0x450c42 = {
    ..._0x2c656e,
    outputType: "video",
    videoUrl: _0x2f6377,
    localPath: _0x1a9e79,
    thumbUrl: firstNonEmptyString(_0x2c656e.thumbUrl, _0x2c656e.posterUrl),
    thumbId: firstNonEmptyString(_0x2c656e.thumbId, _0x2c656e.assetId),
    metadata: _0x2c656e.metadata && typeof _0x2c656e.metadata === "object" ? {
      ..._0x2c656e.metadata
    } : {}
  };
  const _0x4adc53 = firstNonEmptyString(_0x2c656e.error);
  if (_0x4adc53) {
    _0x450c42.error = _0x4adc53;
  }
  return _0x450c42;
}
function removeMediaFieldPatch(_0x41c12e) {
  if (!_0x41c12e || typeof _0x41c12e !== "object") {
    return _0x41c12e;
  }
  for (const _0x3863d9 of Object.keys(VIDEO_GENERATION_MEDIA_CLEAR_PATCH)) {
    delete _0x41c12e[_0x3863d9];
  }
  return _0x41c12e;
}
export function normalizeVideoGenerationResult(_0x2e3c2d) {
  const _0x292528 = normalizeGenerationResultItems(_0x2e3c2d, {
    collectionField: "videos",
    singleItemFields: ["videoUrl", "url", "localUrl", "localPath", "thumbUrl"]
  });
  if (_0x292528.length === 0) {
    return {
      outputType: "video",
      items: []
    };
  }
  return {
    outputType: "video",
    items: _0x292528.map(_0x5f5791 => normalizeVideoGenerationResultItem(_0x5f5791))
  };
}
export function getVideoGenerationResultError(_0x3eadf8) {
  return getFirstGenerationResultError(_0x3eadf8?.outputType === "video" && Array.isArray(_0x3eadf8.items) ? _0x3eadf8.items : _0x3eadf8, {
    collectionField: "videos",
    singleItemFields: ["videoUrl", "url", "localUrl", "localPath", "thumbUrl"]
  });
}
export function getSuccessfulVideoGenerationItems(_0x274099) {
  const _0x30b3f3 = _0x274099?.outputType === "video" && Array.isArray(_0x274099.items) ? _0x274099 : normalizeVideoGenerationResult(_0x274099);
  return _0x30b3f3.items.filter(_0x4312d8 => _0x4312d8 && !_0x4312d8.error);
}
export function buildVideoGenerationResultPatch(_0xb0349c, {
  startedAt = 0,
  duration = null
} = {}) {
  const _0x142a7e = _0xb0349c?.outputType === "video" && Array.isArray(_0xb0349c.items) ? _0xb0349c : normalizeVideoGenerationResult(_0xb0349c);
  return buildGenerationCollectionResultPatch(_0x142a7e, {
    collectionField: "videos",
    mainIndexField: "mainVideoIndex",
    expandedField: "isVideosExpanded",
    startedAt: startedAt,
    duration: duration,
    buildFirstItemPatch: _0x5879fe => ({
      videoUrl: _0x5879fe.videoUrl,
      localPath: _0x5879fe.localPath,
      displayLocalPath: _0x5879fe.displayLocalPath || "",
      posterLocalPath: _0x5879fe.posterLocalPath || "",
      videoProxyStatus: _0x5879fe.videoProxyStatus || "",
      videoCodec: _0x5879fe.videoCodec || "",
      remoteFallbackUrl: _0x5879fe.remoteFallbackUrl || "",
      localSaveError: _0x5879fe.localSaveError || "",
      thumbId: _0x5879fe.thumbId,
      thumbUrl: _0x5879fe.thumbUrl
    }),
    extraPatch: {
      rhStatusMessage: null,
      rhStatusCode: null
    }
  });
}
export function buildVideoGenerationFailurePatch({
  error = "",
  startedAt = 0,
  duration = null,
  clearMediaFields = true
} = {}) {
  const _0x35e7a3 = firstNonEmptyString(error, videoGenerationResultText("failed"));
  const _0xa14798 = buildGenerationCollectionResultPatch({
    outputType: "video",
    items: [{
      error: _0x35e7a3,
      thumbUrl: "",
      videoUrl: "",
      localPath: ""
    }]
  }, {
    collectionField: "videos",
    mainIndexField: "mainVideoIndex",
    startedAt: startedAt,
    duration: duration,
    buildFirstItemPatch: () => ({
      ...VIDEO_GENERATION_MEDIA_CLEAR_PATCH
    })
  });
  if (clearMediaFields) {
    return _0xa14798;
  } else {
    return removeMediaFieldPatch(_0xa14798);
  }
}