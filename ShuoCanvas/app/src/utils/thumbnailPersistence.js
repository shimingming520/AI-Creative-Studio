function isPlainObject(_0x2d4bb9) {
  return _0x2d4bb9 && typeof _0x2d4bb9 === "object" && !Array.isArray(_0x2d4bb9);
}
export function isInlineImageDataUrl(_0x5444e9) {
  return String(_0x5444e9 || "").trim().startsWith("data:image/");
}
export function isBlobObjectUrl(_0x2f39c3) {
  return String(_0x2f39c3 || "").trim().startsWith("blob:");
}
export function isVolatileMediaUrl(_0x3d4e3c) {
  return isBlobObjectUrl(_0x3d4e3c);
}
function hasMeaningfulValue(_0x316860) {
  return String(_0x316860 || "").trim().length > 0;
}
function isStableUrlFallbackValue(_0x133309) {
  const _0x359b57 = String(_0x133309 || "").trim();
  if (!_0x359b57) {
    return false;
  }
  if (isInlineImageDataUrl(_0x359b57)) {
    return false;
  }
  if (isBlobObjectUrl(_0x359b57)) {
    return false;
  }
  return true;
}
function sanitizeCanvasVisualSnapshot(_0x4321a6) {
  if (!isPlainObject(_0x4321a6)) {
    return null;
  }
  const _0xa56d8e = String(_0x4321a6.src || "").trim();
  if (!isInlineImageDataUrl(_0xa56d8e)) {
    return null;
  }
  return {
    schemaVersion: Number(_0x4321a6.schemaVersion) || 1,
    src: _0xa56d8e,
    width: Math.max(1, Math.round(Number(_0x4321a6.width) || 1)),
    height: Math.max(1, Math.round(Number(_0x4321a6.height) || 1)),
    viewport: isPlainObject(_0x4321a6.viewport) ? {
      x: Number.isFinite(Number(_0x4321a6.viewport.x)) ? Number(_0x4321a6.viewport.x) : 0,
      y: Number.isFinite(Number(_0x4321a6.viewport.y)) ? Number(_0x4321a6.viewport.y) : 0,
      zoom: Number.isFinite(Number(_0x4321a6.viewport.zoom)) && Number(_0x4321a6.viewport.zoom) > 0 ? Number(_0x4321a6.viewport.zoom) : 1
    } : {
      x: 0,
      y: 0,
      zoom: 1
    },
    capturedAt: Number(_0x4321a6.capturedAt) || 0,
    visibleNodeCount: Math.max(0, Math.round(Number(_0x4321a6.visibleNodeCount) || 0)),
    mediaNodeCount: Math.max(0, Math.round(Number(_0x4321a6.mediaNodeCount) || 0)),
    readyMediaNodeCount: Math.max(0, Math.round(Number(_0x4321a6.readyMediaNodeCount) || 0))
  };
}
const INLINE_THUMBNAIL_FIELDS = Object.freeze(["thumbUrl", "thumbSrc", "firstFrameThumbUrl"]);
const THUMBNAIL_FALLBACK_FIELDS = Object.freeze(["localPath", "src", "imageUrl", "sourceUrl", "videoUrl", "audioUrl", "firstFrameUrl", "thumbUrl", "firstFrameThumbUrl", "thumbId", "sourceId"]);
const VOLATILE_MEDIA_URL_FIELDS = Object.freeze(["thumbUrl", "thumbSrc", "firstFrameThumbUrl", "imageUrl", "videoUrl", "audioUrl", "src"]);
const CAPTURE_PREVIEW_MEDIA_URL_FIELDS = Object.freeze(["src", "imageUrl", "url"]);
const CAPTURE_TRANSIENT_FIELDS = Object.freeze(["capturePreviewUrl", "captureSavePending", "captureSaveError"]);
export function hasStableThumbnailFallback(_0xc5b1de) {
  if (!_0xc5b1de || typeof _0xc5b1de !== "object") {
    return false;
  }
  return THUMBNAIL_FALLBACK_FIELDS.some(_0x4c5e79 => {
    const _0x3e96ed = _0xc5b1de[_0x4c5e79];
    if (!hasMeaningfulValue(_0x3e96ed)) {
      return false;
    }
    if ((_0x4c5e79 === "thumbUrl" || _0x4c5e79 === "firstFrameThumbUrl") && (isInlineImageDataUrl(_0x3e96ed) || isBlobObjectUrl(_0x3e96ed))) {
      return false;
    }
    if (_0x4c5e79 === "src" || _0x4c5e79 === "imageUrl" || _0x4c5e79 === "sourceUrl" || _0x4c5e79 === "videoUrl" || _0x4c5e79 === "audioUrl" || _0x4c5e79 === "firstFrameUrl") {
      return isStableUrlFallbackValue(_0x3e96ed);
    }
    return true;
  });
}
function sanitizeInlineThumbnailFieldsInPlace(_0x397440) {
  if (!_0x397440 || typeof _0x397440 !== "object") {
    return;
  }
  if (!hasStableThumbnailFallback(_0x397440)) {
    return;
  }
  for (const _0x4bce2d of INLINE_THUMBNAIL_FIELDS) {
    if (isInlineImageDataUrl(_0x397440[_0x4bce2d])) {
      delete _0x397440[_0x4bce2d];
    }
  }
}
function sanitizeVolatileMediaUrlFieldsInPlace(_0x4ab8fb) {
  if (!_0x4ab8fb || typeof _0x4ab8fb !== "object") {
    return;
  }
  if (!hasStableThumbnailFallback(_0x4ab8fb)) {
    return;
  }
  for (const _0x3c7036 of VOLATILE_MEDIA_URL_FIELDS) {
    if (isVolatileMediaUrl(_0x4ab8fb[_0x3c7036])) {
      delete _0x4ab8fb[_0x3c7036];
    }
  }
}
function sanitizeCapturePreviewMediaUrlFieldsInPlace(_0x429bbc) {
  if (!_0x429bbc || typeof _0x429bbc !== "object") {
    return;
  }
  if (!isInlineImageDataUrl(_0x429bbc.capturePreviewUrl) && _0x429bbc.captureSavePending !== true) {
    return;
  }
  for (const _0x4c0869 of CAPTURE_PREVIEW_MEDIA_URL_FIELDS) {
    if (isInlineImageDataUrl(_0x429bbc[_0x4c0869])) {
      delete _0x429bbc[_0x4c0869];
    }
  }
}
function sanitizeRecordForPersistence(_0x5e93b5) {
  if (Array.isArray(_0x5e93b5)) {
    return _0x5e93b5.map(_0xf4a4db => sanitizeRecordForPersistence(_0xf4a4db));
  }
  if (!isPlainObject(_0x5e93b5)) {
    return _0x5e93b5;
  }
  const _0xe2c8ae = {
    ..._0x5e93b5
  };
  sanitizeInlineThumbnailFieldsInPlace(_0xe2c8ae);
  sanitizeVolatileMediaUrlFieldsInPlace(_0xe2c8ae);
  if (Array.isArray(_0xe2c8ae.nodes)) {
    _0xe2c8ae.nodes = _0xe2c8ae.nodes.map(_0x1fc480 => sanitizeNodeForPersistence(_0x1fc480));
  }
  if (Array.isArray(_0xe2c8ae.items)) {
    _0xe2c8ae.items = _0xe2c8ae.items.map(_0x1bc2d5 => sanitizeRecordForPersistence(_0x1bc2d5));
  }
  if (Array.isArray(_0xe2c8ae.edges)) {
    _0xe2c8ae.edges = _0xe2c8ae.edges.map(_0x5bf7a9 => isPlainObject(_0x5bf7a9) ? {
      ..._0x5bf7a9
    } : _0x5bf7a9);
  }
  if (isPlainObject(_0xe2c8ae.nodeData)) {
    _0xe2c8ae.nodeData = sanitizeNodeForPersistence(_0xe2c8ae.nodeData);
  }
  for (const [_0x25f6ac, _0x2b3348] of Object.entries(_0xe2c8ae)) {
    if (_0x25f6ac === "nodes" || _0x25f6ac === "items" || _0x25f6ac === "edges" || _0x25f6ac === "nodeData") {
      continue;
    }
    if (Array.isArray(_0x2b3348)) {
      _0xe2c8ae[_0x25f6ac] = _0x2b3348.map(_0x35f789 => sanitizeRecordForPersistence(_0x35f789));
      continue;
    }
    if (isPlainObject(_0x2b3348)) {
      _0xe2c8ae[_0x25f6ac] = sanitizeRecordForPersistence(_0x2b3348);
    }
  }
  return _0xe2c8ae;
}
export function sanitizeNodeForPersistence(_0x44f198) {
  if (!isPlainObject(_0x44f198)) {
    return _0x44f198;
  }
  const _0x1146c7 = {
    ..._0x44f198
  };
  sanitizeInlineThumbnailFieldsInPlace(_0x1146c7);
  sanitizeVolatileMediaUrlFieldsInPlace(_0x1146c7);
  sanitizeCapturePreviewMediaUrlFieldsInPlace(_0x1146c7);
  delete _0x1146c7.dreaminaTaskLastRaw;
  for (const _0x31553b of CAPTURE_TRANSIENT_FIELDS) {
    delete _0x1146c7[_0x31553b];
  }
  if (Array.isArray(_0x1146c7.images)) {
    _0x1146c7.images = _0x1146c7.images.map(_0x2081fe => sanitizeRecordForPersistence(_0x2081fe));
  }
  if (Array.isArray(_0x1146c7.videos)) {
    _0x1146c7.videos = _0x1146c7.videos.map(_0x1ccc5d => sanitizeRecordForPersistence(_0x1ccc5d));
  }
  if (Array.isArray(_0x1146c7.cells)) {
    _0x1146c7.cells = _0x1146c7.cells.map(_0x271481 => sanitizeRecordForPersistence(_0x271481));
  }
  return _0x1146c7;
}
export function sanitizeSerializedCanvasData(_0x4d7e4d) {
  if (!isPlainObject(_0x4d7e4d)) {
    return _0x4d7e4d;
  }
  const _0x3da31b = {
    ..._0x4d7e4d
  };
  delete _0x3da31b._persistRevHint;
  const _0x1a8bb7 = sanitizeCanvasVisualSnapshot(_0x3da31b.visualSnapshot);
  if (_0x1a8bb7) {
    _0x3da31b.visualSnapshot = _0x1a8bb7;
  } else {
    delete _0x3da31b.visualSnapshot;
  }
  if (Array.isArray(_0x3da31b.nodes)) {
    _0x3da31b.nodes = _0x3da31b.nodes.map(_0x945169 => sanitizeNodeForPersistence(_0x945169));
  } else if (isPlainObject(_0x3da31b.nodes)) {
    const _0x4d1312 = {};
    for (const [_0x196294, _0x4ea434] of Object.entries(_0x3da31b.nodes)) {
      _0x4d1312[_0x196294] = sanitizeNodeForPersistence(_0x4ea434);
    }
    _0x3da31b.nodes = _0x4d1312;
  }
  if (Array.isArray(_0x3da31b.assets)) {
    _0x3da31b.assets = _0x3da31b.assets.map(_0x98afbe => sanitizeRecordForPersistence(_0x98afbe));
  }
  if (Array.isArray(_0x3da31b.storyboard3dProjects)) {
    _0x3da31b.storyboard3dProjects = _0x3da31b.storyboard3dProjects.map(_0x3179ea => sanitizeRecordForPersistence(_0x3179ea));
  }
  return _0x3da31b;
}
export function sanitizeMultiCanvasDataForPersistence(_0x349038) {
  if (!isPlainObject(_0x349038)) {
    return _0x349038;
  }
  const _0x4c124e = {
    ..._0x349038
  };
  if (!Array.isArray(_0x4c124e.canvases)) {
    return _0x4c124e;
  }
  _0x4c124e.canvases = _0x4c124e.canvases.map(_0x49aabd => {
    if (!isPlainObject(_0x49aabd)) {
      return _0x49aabd;
    }
    return sanitizeSerializedCanvasData(_0x49aabd);
  });
  return _0x4c124e;
}