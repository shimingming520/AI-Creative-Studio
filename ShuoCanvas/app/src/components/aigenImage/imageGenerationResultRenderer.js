import { buildGenerationCollectionResultPatch, firstNonEmptyString, normalizeGenerationResultItems } from "../../core/generationResultRenderer.js";
import { buildImageNodeStorageFields } from "../../services/imageDerivativeService.js";
import { t } from "../../i18n/index.js";
function asObject(_0x17d126) {
  if (_0x17d126 && typeof _0x17d126 === "object" && !Array.isArray(_0x17d126)) {
    return _0x17d126;
  } else {
    return null;
  }
}
function firstString(..._0x419fff) {
  return firstNonEmptyString(..._0x419fff);
}
function normalizeLegacyResultItems(_0x448824) {
  return normalizeGenerationResultItems(_0x448824, {
    collectionField: "images",
    singleItemFields: ["sourceUrl", "imageUrl", "thumbUrl", "localPath", "remoteFallbackUrl"]
  });
}
function normalizeImageResultItem(_0x4f49f6) {
  const _0x49ae2a = asObject(_0x4f49f6);
  if (!_0x49ae2a) {
    throw new Error("[imageGenerationResult] item must be an object");
  }
  const _0x3aebb3 = firstString(_0x49ae2a.error);
  const _0x1a8ead = firstString(_0x49ae2a.url, _0x49ae2a.imageUrl, _0x49ae2a.sourceUrl, _0x49ae2a.thumbUrl, _0x49ae2a.remoteFallbackUrl);
  const _0x7039a6 = {
    ..._0x49ae2a,
    outputType: "image",
    url: _0x1a8ead,
    sourceUrl: firstString(_0x49ae2a.sourceUrl, _0x49ae2a.url, _0x49ae2a.imageUrl),
    imageUrl: firstString(_0x49ae2a.imageUrl, _0x49ae2a.url, _0x49ae2a.sourceUrl),
    thumbUrl: firstString(_0x49ae2a.thumbUrl, _0x49ae2a.imageUrl, _0x49ae2a.url, _0x49ae2a.sourceUrl),
    remoteFallbackUrl: firstString(_0x49ae2a.remoteFallbackUrl),
    localSaveError: firstString(_0x49ae2a.localSaveError),
    localPath: firstString(_0x49ae2a.localPath),
    metadata: _0x49ae2a.metadata && typeof _0x49ae2a.metadata === "object" ? {
      ..._0x49ae2a.metadata
    } : {},
    ...buildImageNodeStorageFields(_0x49ae2a)
  };
  if (_0x3aebb3) {
    _0x7039a6.error = _0x3aebb3;
  }
  return _0x7039a6;
}
function removeMediaFieldPatch(_0x57fb41) {
  if (!_0x57fb41 || typeof _0x57fb41 !== "object") {
    return _0x57fb41;
  }
  for (const _0x42c874 of ["imageUrl", "sourceUrl", "thumbUrl", "sourceId", "thumbId", "localPath", "originalLocalPath", "displayLocalPath", "thumbLocalPath", "remoteFallbackUrl", "localSaveError", "originalWidth", "originalHeight"]) {
    delete _0x57fb41[_0x42c874];
  }
  return _0x57fb41;
}
export function normalizeImageGenerationResult(_0x477d8f) {
  const _0x4839e8 = normalizeLegacyResultItems(_0x477d8f);
  if (_0x4839e8.length === 0) {
    return {
      outputType: "image",
      items: []
    };
  }
  return {
    outputType: "image",
    items: _0x4839e8.map(_0x55cbb5 => normalizeImageResultItem(_0x55cbb5))
  };
}
export function getImageGenerationResultError(_0x2d171b) {
  const _0x5a61bb = normalizeImageGenerationResult(_0x2d171b);
  const _0x2d4072 = getSuccessfulImageGenerationItems(_0x5a61bb);
  if (_0x2d4072.length > 0) {
    return "";
  }
  const _0x401e28 = _0x5a61bb.items.find(_0x1e9a30 => _0x1e9a30?.error)?.error;
  return String(_0x401e28 || "").trim();
}
export function getSuccessfulImageGenerationItems(_0x26eedd) {
  const _0x3d54cf = _0x26eedd?.outputType === "image" && Array.isArray(_0x26eedd.items) ? _0x26eedd : normalizeImageGenerationResult(_0x26eedd);
  return _0x3d54cf.items.filter(_0x5869e6 => _0x5869e6 && !_0x5869e6.error);
}
export function buildImageGenerationResultPatch(_0x2c4a0d, {
  startedAt = 0,
  duration = null
} = {}) {
  const _0x27263b = _0x2c4a0d?.outputType === "image" && Array.isArray(_0x2c4a0d.items) ? _0x2c4a0d : normalizeImageGenerationResult(_0x2c4a0d);
  return buildGenerationCollectionResultPatch(_0x27263b, {
    collectionField: "images",
    mainIndexField: "mainImageIndex",
    expandedField: "isImagesExpanded",
    startedAt: startedAt,
    selectMainIndex: _0x2e3037 => {
      const _0x48dfc1 = _0x2e3037.findIndex(_0x18bea6 => _0x18bea6 && !_0x18bea6.error);
      if (_0x48dfc1 >= 0) {
        return _0x48dfc1;
      } else {
        return 0;
      }
    },
    buildFirstItemPatch: _0x43d222 => ({
      imageUrl: _0x43d222.imageUrl,
      sourceUrl: _0x43d222.sourceUrl,
      thumbUrl: _0x43d222.thumbUrl,
      sourceId: _0x43d222.sourceId,
      thumbId: _0x43d222.thumbId,
      remoteFallbackUrl: firstString(_0x43d222.remoteFallbackUrl),
      localSaveError: firstString(_0x43d222.localSaveError),
      ...buildImageNodeStorageFields(_0x43d222)
    }),
    duration: duration,
    extraPatch: {
      rhStatusMessage: null,
      rhStatusCode: null
    }
  });
}
export function buildImageGenerationFailurePatch({
  error = "",
  startedAt = 0,
  duration = null,
  clearMediaFields = true
} = {}) {
  const _0x53b22f = firstString(error, t("aigenImage.result.generationFailed"));
  const _0x4931fd = buildImageGenerationResultPatch({
    error: _0x53b22f,
    thumbUrl: "",
    imageUrl: ""
  }, {
    startedAt: startedAt,
    duration: duration
  });
  if (clearMediaFields) {
    return _0x4931fd;
  } else {
    return removeMediaFieldPatch(_0x4931fd);
  }
}