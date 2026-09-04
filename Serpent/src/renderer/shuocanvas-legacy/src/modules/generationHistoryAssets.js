import { buildImageNodeStorageFields } from "../services/imageDerivativeService.js";
import { createStableSignature } from "../utils/stableSignature.js";
import { localPathToUrl, normalizeLocalPath as a968_0xa6a570 } from "../utils/localMediaPath.js";
import { getLocale, t } from "../i18n/index.js";
export const GENERATION_HISTORY_CATEGORY = "出图历史";
export const GENERATION_HISTORY_KIND = "generation-history";
export const GENERATION_HISTORY_EVENT = "aicanvas:generation-history:add";
export const GENERATION_HISTORY_MEDIA_KINDS = Object.freeze({
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio"
});
const VIDEO_FILE_REFERENCE_RE = /\.(?:mp4|webm|mov|m4v|avi|mkv)(?:[?#].*)?$/i;
function firstNonEmptyString(..._0x4fc5d5) {
  for (const _0x17a76e of _0x4fc5d5) {
    const _0x1c22d8 = String(_0x17a76e || "").trim();
    if (_0x1c22d8) {
      return _0x1c22d8;
    }
  }
  return "";
}
function normalizeProjectId(_0x598425) {
  return String(_0x598425 || "").trim() || "default_v2_project";
}
function normalizeCanvasId(_0x270c0a) {
  return String(_0x270c0a || "").trim() || "canvas_1";
}
function normalizeLocalPath(_0x138f5e) {
  return a968_0xa6a570(_0x138f5e);
}
function toLocalUrl(_0x41ff94) {
  return localPathToUrl(_0x41ff94);
}
function hashString(_0x4d3430) {
  const _0x5dd833 = String(_0x4d3430 || "");
  let _0x1cd6fb = 2166136261;
  for (let _0x1e3725 = 0; _0x1e3725 < _0x5dd833.length; _0x1e3725 += 1) {
    _0x1cd6fb ^= _0x5dd833.charCodeAt(_0x1e3725);
    _0x1cd6fb = Math.imul(_0x1cd6fb, 16777619);
  }
  return (_0x1cd6fb >>> 0).toString(36);
}
function sanitizeIdPart(_0x3f9d18) {
  return String(_0x3f9d18 || "").trim().replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64);
}
function resolveGenerationStartedAt({
  generationStartedAt: _0x4ab955,
  nodeData: _0x496d33,
  now: _0x34250e
} = {}) {
  const _0x20542d = Number(_0x4ab955);
  if (Number.isFinite(_0x20542d) && _0x20542d > 0) {
    return Math.trunc(_0x20542d);
  }
  const _0x2ddb6e = Number(_0x496d33?.generationStartTime);
  if (Number.isFinite(_0x2ddb6e) && _0x2ddb6e > 0) {
    return Math.trunc(_0x2ddb6e);
  }
  const _0x24e37b = Number(_0x34250e);
  if (Number.isFinite(_0x24e37b) && _0x24e37b > 0) {
    return Math.trunc(_0x24e37b);
  } else {
    return Date.now();
  }
}
function buildGenerationRunId(_0x85f8a2, _0x1a3fe3) {
  const _0x453524 = String(_0x85f8a2?.id || "").trim() || "node";
  return "run-" + hashString(_0x453524) + "-" + _0x1a3fe3;
}
function buildGenerationHistoryAssetId({
  projectHash: _0x3dd70e,
  canvasHash: _0x2f7cd4,
  generationRunId: _0xb83625,
  mediaKind: _0x130bb4,
  index: _0x5f5ae1
} = {}) {
  return ["gen-history", _0x3dd70e, _0x2f7cd4, _0xb83625, String(_0x130bb4 || "").trim().toLowerCase(), Math.max(0, Math.trunc(Number(_0x5f5ae1) || 0))].join("-");
}
function buildGenerationHistoryIdentity({
  projectHash: _0x5a7557,
  canvasHash: _0x2c2991,
  nodeData: _0xbd2696,
  generationStartedAt: _0x5af779,
  mediaKind: _0x24c2d3,
  index: _0x60be37,
  now: _0x3c0aa4
} = {}) {
  const _0x189c88 = Math.max(0, Math.trunc(Number(_0x60be37) || 0));
  const _0x153ecb = resolveGenerationStartedAt({
    generationStartedAt: _0x5af779,
    nodeData: _0xbd2696,
    now: _0x3c0aa4
  });
  const _0x215b80 = buildGenerationRunId(_0xbd2696, _0x153ecb);
  return {
    sourceIndex: _0x189c88,
    startedAt: _0x153ecb,
    generationRunId: _0x215b80,
    assetId: buildGenerationHistoryAssetId({
      projectHash: _0x5a7557,
      canvasHash: _0x2c2991,
      generationRunId: _0x215b80,
      mediaKind: _0x24c2d3,
      index: _0x189c88
    })
  };
}
function formatHistoryDate(_0x5907bb, _0x5cb406) {
  return new Date(_0x5907bb).toLocaleString(getLocale(), _0x5cb406);
}
function pickImageLocalPath(_0x50dfc0 = {}) {
  return firstNonEmptyString(normalizeLocalPath(_0x50dfc0.localPath), normalizeLocalPath(_0x50dfc0.originalLocalPath), normalizeLocalPath(_0x50dfc0.displayLocalPath), normalizeLocalPath(_0x50dfc0.imageUrl), normalizeLocalPath(_0x50dfc0.sourceUrl), normalizeLocalPath(_0x50dfc0.url), normalizeLocalPath(_0x50dfc0.resultUrl));
}
function pickVideoLocalPath(_0x5d0ebf = {}) {
  return firstNonEmptyString(normalizeLocalPath(_0x5d0ebf.localPath), normalizeLocalPath(_0x5d0ebf.originalLocalPath), normalizeLocalPath(_0x5d0ebf.displayLocalPath), normalizeLocalPath(_0x5d0ebf.videoUrl), normalizeLocalPath(_0x5d0ebf.sourceUrl), normalizeLocalPath(_0x5d0ebf.url), normalizeLocalPath(_0x5d0ebf.resultUrl));
}
function pickAudioLocalPath(_0x5eebdd = {}) {
  return firstNonEmptyString(normalizeLocalPath(_0x5eebdd.localPath), normalizeLocalPath(_0x5eebdd.originalLocalPath), normalizeLocalPath(_0x5eebdd.displayLocalPath), normalizeLocalPath(_0x5eebdd.audioUrl), normalizeLocalPath(_0x5eebdd.sourceUrl), normalizeLocalPath(_0x5eebdd.url), normalizeLocalPath(_0x5eebdd.resultUrl));
}
function pickImageDisplayUrl(_0x4890bc = {}) {
  return firstNonEmptyString(toLocalUrl(_0x4890bc.displayLocalPath), toLocalUrl(_0x4890bc.localPath), toLocalUrl(_0x4890bc.originalLocalPath), toLocalUrl(_0x4890bc.imageUrl), toLocalUrl(_0x4890bc.sourceUrl), String(_0x4890bc.imageUrl || "").trim(), String(_0x4890bc.sourceUrl || "").trim());
}
function pickImageThumbUrl(_0x2b0218 = {}) {
  return firstNonEmptyString(toLocalUrl(_0x2b0218.thumbLocalPath), toLocalUrl(_0x2b0218.displayLocalPath), toLocalUrl(_0x2b0218.localPath), toLocalUrl(_0x2b0218.thumbUrl), String(_0x2b0218.thumbUrl || "").trim());
}
function pickVideoDisplayUrl(_0x3f51b0 = {}) {
  return firstNonEmptyString(toLocalUrl(_0x3f51b0.displayLocalPath), toLocalUrl(_0x3f51b0.localPath), toLocalUrl(_0x3f51b0.originalLocalPath), toLocalUrl(_0x3f51b0.videoUrl), toLocalUrl(_0x3f51b0.sourceUrl), String(_0x3f51b0.videoUrl || "").trim(), String(_0x3f51b0.sourceUrl || "").trim(), String(_0x3f51b0.url || "").trim());
}
function pickVideoThumbUrl(_0x47e48c = {}) {
  const _0x2af87e = [toLocalUrl(_0x47e48c.thumbLocalPath), toLocalUrl(_0x47e48c.thumbUrl), String(_0x47e48c.thumbUrl || "").trim(), toLocalUrl(_0x47e48c.posterLocalPath), String(_0x47e48c.posterUrl || "").trim(), toLocalUrl(_0x47e48c.coverLocalPath), String(_0x47e48c.coverUrl || "").trim()];
  return _0x2af87e.find(_0x1e0ef1 => _0x1e0ef1 && !VIDEO_FILE_REFERENCE_RE.test(_0x1e0ef1)) || "";
}
function pickVideoThumbLocalPath(_0x5ec533 = {}) {
  const _0x19133d = [normalizeLocalPath(_0x5ec533.thumbLocalPath), normalizeLocalPath(_0x5ec533.posterLocalPath), normalizeLocalPath(_0x5ec533.coverLocalPath), normalizeLocalPath(_0x5ec533.thumbUrl), normalizeLocalPath(_0x5ec533.posterUrl), normalizeLocalPath(_0x5ec533.coverUrl)];
  return _0x19133d.find(_0x3c2b87 => _0x3c2b87 && !VIDEO_FILE_REFERENCE_RE.test(_0x3c2b87)) || "";
}
function pickAudioDisplayUrl(_0xd9ce49 = {}) {
  return firstNonEmptyString(toLocalUrl(_0xd9ce49.displayLocalPath), toLocalUrl(_0xd9ce49.localPath), toLocalUrl(_0xd9ce49.originalLocalPath), toLocalUrl(_0xd9ce49.audioUrl), toLocalUrl(_0xd9ce49.sourceUrl), String(_0xd9ce49.audioUrl || "").trim(), String(_0xd9ce49.sourceUrl || "").trim(), String(_0xd9ce49.url || "").trim());
}
function hasUsableImageResult(_0x37caf5 = {}) {
  if (!_0x37caf5 || typeof _0x37caf5 !== "object") {
    return false;
  }
  if (String(_0x37caf5.error || "").trim()) {
    return false;
  }
  return Boolean(firstNonEmptyString(_0x37caf5.localPath, _0x37caf5.originalLocalPath, _0x37caf5.displayLocalPath, _0x37caf5.thumbLocalPath, _0x37caf5.imageUrl, _0x37caf5.sourceUrl, _0x37caf5.thumbUrl, _0x37caf5.sourceId, _0x37caf5.thumbId));
}
function hasUsableVideoResult(_0x409352 = {}) {
  if (!_0x409352 || typeof _0x409352 !== "object") {
    return false;
  }
  if (String(_0x409352.error || "").trim()) {
    return false;
  }
  return Boolean(firstNonEmptyString(_0x409352.localPath, _0x409352.originalLocalPath, _0x409352.displayLocalPath, _0x409352.thumbLocalPath, _0x409352.videoUrl, _0x409352.sourceUrl, _0x409352.thumbUrl, _0x409352.sourceId, _0x409352.thumbId));
}
function hasUsableAudioResult(_0x63b8dd = {}) {
  if (!_0x63b8dd || typeof _0x63b8dd !== "object") {
    return false;
  }
  if (String(_0x63b8dd.error || "").trim()) {
    return false;
  }
  return Boolean(firstNonEmptyString(_0x63b8dd.localPath, _0x63b8dd.originalLocalPath, _0x63b8dd.displayLocalPath, _0x63b8dd.audioUrl, _0x63b8dd.sourceUrl, _0x63b8dd.sourceId));
}
function resolveNodeSize(_0x514207 = {}, _0x12f594 = {}) {
  const _0xb467d6 = Number(_0x514207.originalWidth || _0x514207.imageWidth || _0x12f594.imageWidth || 0) || 0;
  const _0x5df5c6 = Number(_0x514207.originalHeight || _0x514207.imageHeight || _0x12f594.imageHeight || 0) || 0;
  if (_0xb467d6 > 0 && _0x5df5c6 > 0) {
    const _0x5f7011 = 260;
    const _0x36eb49 = _0x5f7011 / Math.min(_0xb467d6, _0x5df5c6);
    return {
      width: Math.max(120, Math.round(_0xb467d6 * _0x36eb49)),
      height: Math.max(120, Math.round(_0x5df5c6 * _0x36eb49))
    };
  }
  return {
    width: Number(_0x12f594.width || 0) || 260,
    height: Number(_0x12f594.height || 0) || 260
  };
}
function resolveVideoNodeSize(_0x30eba6 = {}, _0x41719c = {}) {
  const _0x1585df = Number(_0x30eba6.videoWidth || _0x30eba6.width || _0x41719c.videoWidth || 0) || 0;
  const _0x5ce45a = Number(_0x30eba6.videoHeight || _0x30eba6.height || _0x41719c.videoHeight || 0) || 0;
  if (_0x1585df > 0 && _0x5ce45a > 0) {
    const _0x508fa0 = 260;
    const _0x591ec0 = _0x508fa0 / Math.min(_0x1585df, _0x5ce45a);
    return {
      width: Math.max(160, Math.round(_0x1585df * _0x591ec0)),
      height: Math.max(120, Math.round(_0x5ce45a * _0x591ec0))
    };
  }
  return {
    width: Number(_0x41719c.width || 0) || 512,
    height: Number(_0x41719c.height || 0) || 288
  };
}
function resolveAudioNodeSize(_0x15060b = {}) {
  return {
    width: Number(_0x15060b.width || 0) || 320,
    height: Number(_0x15060b.height || 0) || 140
  };
}
export function buildGenerationHistoryFingerprint(_0x337d92 = {}) {
  const _0x238585 = pickImageLocalPath(_0x337d92);
  const _0x3927a7 = createStableSignature(_0x238585 ? {
    kind: GENERATION_HISTORY_MEDIA_KINDS.IMAGE,
    localPath: _0x238585
  } : {
    kind: GENERATION_HISTORY_MEDIA_KINDS.IMAGE,
    imageUrl: String(_0x337d92.imageUrl || "").trim(),
    sourceUrl: String(_0x337d92.sourceUrl || "").trim(),
    thumbUrl: String(_0x337d92.thumbUrl || "").trim(),
    sourceId: String(_0x337d92.sourceId || "").trim(),
    thumbId: String(_0x337d92.thumbId || "").trim()
  });
  return hashString(_0x3927a7);
}
export function buildGenerationHistoryMediaFingerprint(_0x28d49b = {}, _0x325c9b = "image") {
  const _0x361ce6 = String(_0x325c9b || "image").trim() || "image";
  const _0x3deb76 = _0x361ce6 === GENERATION_HISTORY_MEDIA_KINDS.VIDEO ? pickVideoLocalPath(_0x28d49b) : _0x361ce6 === GENERATION_HISTORY_MEDIA_KINDS.AUDIO ? pickAudioLocalPath(_0x28d49b) : pickImageLocalPath(_0x28d49b);
  const _0x1a6c89 = createStableSignature(_0x3deb76 ? {
    kind: _0x361ce6,
    localPath: _0x3deb76
  } : {
    kind: _0x361ce6,
    imageUrl: String(_0x28d49b.imageUrl || "").trim(),
    videoUrl: String(_0x28d49b.videoUrl || "").trim(),
    audioUrl: String(_0x28d49b.audioUrl || "").trim(),
    sourceUrl: String(_0x28d49b.sourceUrl || "").trim(),
    thumbUrl: String(_0x28d49b.thumbUrl || "").trim(),
    sourceId: String(_0x28d49b.sourceId || "").trim(),
    thumbId: String(_0x28d49b.thumbId || "").trim()
  });
  return hashString(_0x1a6c89);
}
export function isGenerationHistoryAsset(_0x23dc59) {
  return String(_0x23dc59?.kind || "") === GENERATION_HISTORY_KIND;
}
export function isAssetVisibleInTab(_0x5b79ce, _0x59dd05, _0xbcb5cc) {
  const _0x3a283 = String(_0x59dd05 || "").trim();
  if (_0x3a283 === GENERATION_HISTORY_CATEGORY) {
    return isGenerationHistoryAsset(_0x5b79ce) && normalizeProjectId(_0x5b79ce?.projectId) === normalizeProjectId(_0xbcb5cc);
  }
  if (isGenerationHistoryAsset(_0x5b79ce)) {
    return false;
  }
  return String(_0x5b79ce?.category || "") === _0x3a283;
}
export function buildGenerationHistoryAsset({
  image: _0x2fe4e9,
  nodeData: _0xbc8b3b,
  projectId: _0x101b6c,
  canvasId: _0x3ac8ea,
  index = 0,
  generationStartedAt: _0xd009be,
  now = Date.now()
} = {}) {
  if (!hasUsableImageResult(_0x2fe4e9)) {
    return null;
  }
  const _0x6a3ce4 = normalizeProjectId(_0x101b6c);
  const _0x35e04e = normalizeCanvasId(_0x3ac8ea);
  const _0x48a89e = buildGenerationHistoryFingerprint(_0x2fe4e9);
  const _0xb2438b = hashString(_0x6a3ce4);
  const _0x436613 = hashString(_0x35e04e);
  const {
    sourceIndex: _0x30f763,
    startedAt: _0x3811cb,
    generationRunId: _0x247279,
    assetId: _0x454e06
  } = buildGenerationHistoryIdentity({
    projectHash: _0xb2438b,
    canvasHash: _0x436613,
    mediaKind: GENERATION_HISTORY_MEDIA_KINDS.IMAGE,
    index: index,
    generationStartedAt: _0xd009be,
    nodeData: _0xbc8b3b,
    now: now
  });
  const _0x49efb8 = buildImageNodeStorageFields(_0x2fe4e9);
  const _0x418db3 = _0x49efb8.localPath || pickImageLocalPath(_0x2fe4e9);
  const _0x1b937e = pickImageDisplayUrl({
    ..._0x2fe4e9,
    ..._0x49efb8
  });
  const _0x31f133 = pickImageThumbUrl({
    ..._0x2fe4e9,
    ..._0x49efb8
  });
  const {
    width: _0x358c5e,
    height: _0x2aa9d1
  } = resolveNodeSize(_0x2fe4e9, _0xbc8b3b);
  const _0x21d49c = String(_0xbc8b3b?.id || "").trim();
  const _0x471458 = String(_0x2fe4e9?.fileName || "").trim() || String(_0x418db3 || "").split(/[\\/]/).pop() || t("generationHistory.fileFallback.image", {
    date: formatHistoryDate(now)
  });
  const _0x46403b = {
    id: "source-image-history-" + _0x247279 + "-" + _0x30f763,
    type: "source-image",
    name: _0x471458,
    x: 0,
    y: 0,
    width: _0x358c5e,
    height: _0x2aa9d1,
    src: _0x1b937e || _0x31f133,
    imageUrl: _0x1b937e || _0x31f133,
    sourceUrl: _0x1b937e || _0x31f133,
    thumbUrl: _0x31f133,
    localPath: _0x418db3,
    ..._0x49efb8,
    sourceId: String(_0x2fe4e9?.sourceId || "").trim(),
    thumbId: String(_0x2fe4e9?.thumbId || "").trim(),
    fileName: _0x471458,
    needsAutoResize: true
  };
  const _0x319526 = sanitizeIdPart(_0x6a3ce4) || "project";
  const _0x37333e = sanitizeIdPart(_0x21d49c) || "node";
  const _0x459ec9 = formatHistoryDate(now, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return {
    id: _0x454e06,
    kind: GENERATION_HISTORY_KIND,
    mediaKind: GENERATION_HISTORY_MEDIA_KINDS.IMAGE,
    projectId: _0x6a3ce4,
    canvasId: _0x35e04e,
    sourceNodeId: _0x21d49c,
    generationRunId: _0x247279,
    generationStartedAt: _0x3811cb,
    resultFingerprint: _0x48a89e,
    name: t("generationHistory.assetName.image", {
      date: _0x459ec9
    }),
    category: GENERATION_HISTORY_CATEGORY,
    coverUrl: _0x31f133 || _0x1b937e,
    coverType: "image",
    items: [{
      type: "source-image",
      name: _0x471458,
      thumbSrc: _0x31f133 || _0x1b937e,
      nodeData: _0x46403b
    }],
    nodes: [_0x46403b],
    edges: [],
    model: String(_0xbc8b3b?.model || "").trim(),
    provider: String(_0xbc8b3b?.provider || "").trim(),
    prompt: String(_0xbc8b3b?.prompt || "").trim(),
    aspectRatio: String(_0xbc8b3b?.aspectRatio || "").trim(),
    imageSize: String(_0xbc8b3b?.imageSize || "").trim(),
    sourceIndex: _0x30f763,
    createdAt: Number(now) || Date.now(),
    updatedAt: Number(now) || Date.now(),
    metaKey: _0x319526 + ":" + _0x37333e + ":" + _0x247279 + ":" + _0x30f763
  };
}
export function buildVideoGenerationHistoryAsset({
  video: _0x9e2819,
  nodeData: _0x428ec3,
  projectId: _0x2ac341,
  canvasId: _0x29c5ed,
  index = 0,
  generationStartedAt: _0x19746a,
  now = Date.now()
} = {}) {
  if (!hasUsableVideoResult(_0x9e2819)) {
    return null;
  }
  const _0x2dcdaf = normalizeProjectId(_0x2ac341);
  const _0x4bbb12 = normalizeCanvasId(_0x29c5ed);
  const _0xeac89 = buildGenerationHistoryMediaFingerprint(_0x9e2819, "video");
  const _0x41d5a0 = hashString(_0x2dcdaf);
  const _0x162e13 = hashString(_0x4bbb12);
  const {
    sourceIndex: _0x753f7,
    startedAt: _0x3c0113,
    generationRunId: _0x649ed9,
    assetId: _0x301a6f
  } = buildGenerationHistoryIdentity({
    projectHash: _0x41d5a0,
    canvasHash: _0x162e13,
    mediaKind: GENERATION_HISTORY_MEDIA_KINDS.VIDEO,
    index: index,
    generationStartedAt: _0x19746a,
    nodeData: _0x428ec3,
    now: now
  });
  const _0x473274 = pickVideoLocalPath(_0x9e2819);
  const _0x131666 = pickVideoDisplayUrl(_0x9e2819);
  const _0x29af0f = pickVideoThumbUrl(_0x9e2819);
  const _0x2c25a9 = pickVideoThumbLocalPath(_0x9e2819);
  const {
    width: _0x5af945,
    height: _0x340936
  } = resolveVideoNodeSize(_0x9e2819, _0x428ec3);
  const _0x1f2ad0 = String(_0x428ec3?.id || "").trim();
  const _0x573c20 = String(_0x9e2819?.fileName || "").trim() || String(_0x473274 || _0x131666 || "").split(/[\\/]/).pop() || t("generationHistory.fileFallback.video", {
    date: formatHistoryDate(now)
  });
  const _0x5d844c = _0x131666 || (_0x473274 ? "/" + _0x473274 : "");
  const _0x1d2a0b = {
    id: "source-video-history-" + _0x649ed9 + "-" + _0x753f7,
    type: "source-video",
    name: _0x573c20,
    x: 0,
    y: 0,
    width: _0x5af945,
    height: _0x340936,
    src: _0x5d844c,
    videoUrl: _0x5d844c,
    posterUrl: _0x29af0f,
    thumbUrl: _0x29af0f,
    posterLocalPath: _0x2c25a9,
    thumbLocalPath: _0x2c25a9,
    videoThumbSrc: _0x5d844c,
    localPath: _0x473274,
    sourceId: String(_0x9e2819?.sourceId || "").trim(),
    thumbId: String(_0x9e2819?.thumbId || "").trim(),
    fileName: _0x573c20,
    videoWidth: Number(_0x9e2819?.videoWidth || _0x9e2819?.width || 0) || undefined,
    videoHeight: Number(_0x9e2819?.videoHeight || _0x9e2819?.height || 0) || undefined,
    duration: Number(_0x9e2819?.duration || _0x9e2819?.videoDuration || 0) || undefined,
    needsAutoResize: true
  };
  const _0x523b0d = sanitizeIdPart(_0x2dcdaf) || "project";
  const _0x16ca17 = sanitizeIdPart(_0x1f2ad0) || "node";
  const _0x1df370 = formatHistoryDate(now, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return {
    id: _0x301a6f,
    kind: GENERATION_HISTORY_KIND,
    mediaKind: GENERATION_HISTORY_MEDIA_KINDS.VIDEO,
    projectId: _0x2dcdaf,
    canvasId: _0x4bbb12,
    sourceNodeId: _0x1f2ad0,
    generationRunId: _0x649ed9,
    generationStartedAt: _0x3c0113,
    resultFingerprint: _0xeac89,
    name: t("generationHistory.assetName.video", {
      date: _0x1df370
    }),
    category: GENERATION_HISTORY_CATEGORY,
    coverUrl: _0x29af0f,
    coverType: "video",
    items: [{
      type: "source-video",
      name: _0x573c20,
      thumbSrc: _0x29af0f,
      nodeData: _0x1d2a0b
    }],
    nodes: [_0x1d2a0b],
    edges: [],
    model: String(_0x428ec3?.model || "").trim(),
    provider: String(_0x428ec3?.provider || "").trim(),
    prompt: String(_0x428ec3?.prompt || "").trim(),
    aspectRatio: String(_0x428ec3?.aspectRatio || "").trim(),
    videoSize: String(_0x428ec3?.videoSize || _0x428ec3?.resolution || "").trim(),
    duration: Number(_0x9e2819?.duration || _0x428ec3?.duration || 0) || undefined,
    sourceIndex: _0x753f7,
    createdAt: Number(now) || Date.now(),
    updatedAt: Number(now) || Date.now(),
    metaKey: _0x523b0d + ":" + _0x16ca17 + ":" + _0x649ed9 + ":" + _0x753f7
  };
}
export function buildAudioGenerationHistoryAsset({
  audio: _0x42826c,
  nodeData: _0x5baabd,
  projectId: _0x1bde0a,
  canvasId: _0x2fc1ab,
  index = 0,
  generationStartedAt: _0x2fe19f,
  now = Date.now()
} = {}) {
  if (!hasUsableAudioResult(_0x42826c)) {
    return null;
  }
  const _0x523d3e = normalizeProjectId(_0x1bde0a);
  const _0x9d0956 = normalizeCanvasId(_0x2fc1ab);
  const _0x35cc9a = buildGenerationHistoryMediaFingerprint(_0x42826c, "audio");
  const _0x31055d = hashString(_0x523d3e);
  const _0x494b08 = hashString(_0x9d0956);
  const {
    sourceIndex: _0x10c69d,
    startedAt: _0x27d4b9,
    generationRunId: _0x17b743,
    assetId: _0x4b2cd2
  } = buildGenerationHistoryIdentity({
    projectHash: _0x31055d,
    canvasHash: _0x494b08,
    mediaKind: GENERATION_HISTORY_MEDIA_KINDS.AUDIO,
    index: index,
    generationStartedAt: _0x2fe19f,
    nodeData: _0x5baabd,
    now: now
  });
  const _0x573a72 = pickAudioLocalPath(_0x42826c);
  const _0x2e167a = pickAudioDisplayUrl(_0x42826c);
  const {
    width: _0xe0ae5b,
    height: _0x26e8c2
  } = resolveAudioNodeSize(_0x5baabd);
  const _0x57fae3 = String(_0x5baabd?.id || "").trim();
  const _0xfdb34a = String(_0x42826c?.fileName || "").trim() || String(_0x573a72 || _0x2e167a || "").split(/[\\/]/).pop() || t("generationHistory.fileFallback.audio", {
    date: formatHistoryDate(now)
  });
  const _0x29d88c = {
    id: "source-audio-history-" + _0x17b743 + "-" + _0x10c69d,
    type: "source-audio",
    name: _0xfdb34a,
    x: 0,
    y: 0,
    width: _0xe0ae5b,
    height: _0x26e8c2,
    src: _0x2e167a,
    audioUrl: _0x2e167a,
    localPath: _0x573a72,
    fileName: _0xfdb34a,
    duration: Number(_0x42826c?.duration || _0x42826c?.audioDuration || 0) || undefined
  };
  const _0x2359b0 = sanitizeIdPart(_0x523d3e) || "project";
  const _0x658ba0 = sanitizeIdPart(_0x57fae3) || "node";
  const _0x156158 = formatHistoryDate(now, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return {
    id: _0x4b2cd2,
    kind: GENERATION_HISTORY_KIND,
    mediaKind: GENERATION_HISTORY_MEDIA_KINDS.AUDIO,
    projectId: _0x523d3e,
    canvasId: _0x9d0956,
    sourceNodeId: _0x57fae3,
    generationRunId: _0x17b743,
    generationStartedAt: _0x27d4b9,
    resultFingerprint: _0x35cc9a,
    name: t("generationHistory.assetName.audio", {
      date: _0x156158
    }),
    category: GENERATION_HISTORY_CATEGORY,
    coverUrl: "",
    coverType: "audio",
    items: [{
      type: "source-audio",
      name: _0xfdb34a,
      thumbSrc: "",
      nodeData: _0x29d88c
    }],
    nodes: [_0x29d88c],
    edges: [],
    model: String(_0x5baabd?.model || _0x5baabd?.audioWorkflowKey || "").trim(),
    provider: String(_0x5baabd?.provider || "").trim(),
    prompt: String(_0x5baabd?.prompt || "").trim(),
    audioWorkflowKey: String(_0x5baabd?.audioWorkflowKey || "").trim(),
    audioWorkflowLabel: String(_0x5baabd?.audioWorkflowLabel || "").trim(),
    duration: Number(_0x42826c?.duration || _0x5baabd?.duration || 0) || undefined,
    sourceIndex: _0x10c69d,
    createdAt: Number(now) || Date.now(),
    updatedAt: Number(now) || Date.now(),
    metaKey: _0x2359b0 + ":" + _0x658ba0 + ":" + _0x17b743 + ":" + _0x10c69d
  };
}
export function buildGenerationHistoryAssetsFromNode({
  images: _0x14c9c0,
  videos: _0x2d2c30,
  audios: _0x1adc0a,
  nodeData: _0x20882c,
  projectId: _0x384520,
  canvasId: _0x8288a6,
  generationStartedAt: _0x3949bb,
  now = Date.now()
} = {}) {
  const _0xc3f29c = Array.isArray(_0x14c9c0) ? _0x14c9c0 : Array.isArray(_0x20882c?.images) ? _0x20882c.images : [];
  const _0x78dab2 = Array.isArray(_0x2d2c30) ? _0x2d2c30 : Array.isArray(_0x20882c?.videos) ? _0x20882c.videos : [];
  const _0x48f247 = String(_0x20882c?.type || "").trim().toLowerCase();
  const _0x50d98c = Array.isArray(_0x1adc0a) ? _0x1adc0a : _0x48f247.includes("audio") && firstNonEmptyString(_0x20882c?.audioUrl, _0x20882c?.localPath) ? [_0x20882c] : [];
  const _0x3bf249 = resolveGenerationStartedAt({
    generationStartedAt: _0x3949bb,
    nodeData: _0x20882c,
    now: now
  });
  return [..._0xc3f29c.map((_0x5877b8, _0xc4b034) => buildGenerationHistoryAsset({
    image: _0x5877b8,
    nodeData: _0x20882c,
    projectId: _0x384520,
    canvasId: _0x8288a6,
    index: _0xc4b034,
    generationStartedAt: _0x3bf249,
    now: now + _0xc4b034
  })), ..._0x78dab2.map((_0x1cdc39, _0x1b70f3) => buildVideoGenerationHistoryAsset({
    video: _0x1cdc39,
    nodeData: _0x20882c,
    projectId: _0x384520,
    canvasId: _0x8288a6,
    index: _0x1b70f3,
    generationStartedAt: _0x3bf249,
    now: now + _0xc3f29c.length + _0x1b70f3
  })), ..._0x50d98c.map((_0xde8260, _0x5ee158) => buildAudioGenerationHistoryAsset({
    audio: _0xde8260,
    nodeData: _0x20882c,
    projectId: _0x384520,
    canvasId: _0x8288a6,
    index: _0x5ee158,
    generationStartedAt: _0x3bf249,
    now: now + _0xc3f29c.length + _0x78dab2.length + _0x5ee158
  }))].filter(Boolean);
}