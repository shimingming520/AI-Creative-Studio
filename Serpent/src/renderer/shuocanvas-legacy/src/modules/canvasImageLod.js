const LOW_ZOOM_BODY_CLASS = "is-zoom-low";
export const CANVAS_LOW_ZOOM_LOD_THRESHOLD = 0.45;
export const CANVAS_IMAGE_THUMB_MAX_EDGE_PX = 320;
export const CANVAS_IMAGE_LOD_DOWNGRADE_RATIO = 0.82;
export const MEDIA_LOD_MODE_ATTR = "mediaLodMode";
export const MEDIA_LOD_MODE_THUMB = "thumb";
export const MEDIA_LOD_MODE_FULL = "full";
export const MEDIA_LOD_HOVER_PROMOTED_CLASS = "media-lod-hover-promoted";
const PROMOTED_NODE_CLASSES = ["selected", "v2-selected", "selection-related", "conn-src", "conn-hoverTarget", MEDIA_LOD_HOVER_PROMOTED_CLASS];
function hashImageDisplayVersionKey(_0x19a7e8 = "") {
  const _0x1384eb = String(_0x19a7e8 || "");
  let _0x5e418e = 2166136261;
  for (let _0x2b7c7d = 0; _0x2b7c7d < _0x1384eb.length; _0x2b7c7d += 1) {
    _0x5e418e ^= _0x1384eb.charCodeAt(_0x2b7c7d);
    _0x5e418e = Math.imul(_0x5e418e, 16777619);
  }
  return (_0x5e418e >>> 0).toString(36);
}
export function versionCanvasImageDisplayUrl(_0x5190ab = "", _0x2d2cf1 = "") {
  const _0x313597 = String(_0x5190ab || "").trim();
  const _0x5cfaad = String(_0x2d2cf1 || "").trim();
  if (!_0x313597 || !_0x5cfaad) {
    return _0x313597;
  }
  if (/^(?:https?:\/\/|\/\/|data:image\/|blob:|aic-local-preview:)/i.test(_0x313597)) {
    return _0x313597;
  }
  const _0x13c79f = _0x313597.indexOf("#");
  const _0x180480 = _0x13c79f >= 0 ? _0x313597.slice(0, _0x13c79f) : _0x313597;
  const _0x2fa467 = _0x13c79f >= 0 ? _0x313597.slice(_0x13c79f) : "";
  const _0x58e7f6 = _0x180480.includes("?") ? "&" : "?";
  return "" + _0x180480 + _0x58e7f6 + "aicv=" + hashImageDisplayVersionKey(_0x5cfaad) + _0x2fa467;
}
export function buildCanvasImageResultIdentityKey(_0x284023 = {}, _0x49d41d = {}, _0x4eb7cb = 0) {
  return [_0x4eb7cb, _0x284023?.assetId, _0x284023?.sourceId, _0x284023?.thumbId, _0x284023?.localPath, _0x284023?.originalLocalPath, _0x284023?.displayLocalPath, _0x284023?.thumbLocalPath, _0x284023?.sourceUrl, _0x284023?.imageUrl, _0x284023?.thumbUrl, _0x284023?.url, _0x284023?.resultUrl, _0x284023?.remoteFallbackUrl, _0x284023?.metadata?.taskId, _0x284023?.metadata?.requestId, _0x49d41d?.generationStartTime, _0x49d41d?.generationDuration, _0x49d41d?.rhTaskId, _0x49d41d?.asyncTaskId, _0x49d41d?.dreaminaSubmitId].map(_0x1a52e0 => String(_0x1a52e0 ?? "").trim()).join("|");
}
function getStateSnapshot(_0x100fc0) {
  if (!_0x100fc0) {
    return {};
  }
  if (typeof _0x100fc0.getStateRaw === "function") {
    return _0x100fc0.getStateRaw() || {};
  }
  if (typeof _0x100fc0.getState === "function") {
    return _0x100fc0.getState() || {};
  }
  return {};
}
function getNodeElement({
  nodeId = "",
  rootEl = null,
  documentRef = globalThis.document
} = {}) {
  const _0xa32458 = rootEl?.closest?.(".v2-node");
  if (_0xa32458) {
    return _0xa32458;
  }
  const _0x3b99c4 = String(nodeId || "").trim();
  if (_0x3b99c4) {
    return documentRef?.getElementById?.(_0x3b99c4) || null;
  } else {
    return null;
  }
}
export function isCanvasLowZoomActive(_0x350520 = globalThis.document) {
  return !!_0x350520?.body?.classList?.contains(LOW_ZOOM_BODY_CLASS);
}
export function setNodeMediaLodHoverPromoted(_0x1f681f = null, _0x12cc43 = false) {
  const _0xe9c7f0 = getNodeElement({
    rootEl: _0x1f681f
  });
  if (!_0xe9c7f0?.classList) {
    return false;
  }
  if (typeof _0xe9c7f0.classList.toggle === "function") {
    _0xe9c7f0.classList.toggle(MEDIA_LOD_HOVER_PROMOTED_CLASS, !!_0x12cc43);
    return true;
  }
  if (_0x12cc43) {
    _0xe9c7f0.classList.add?.(MEDIA_LOD_HOVER_PROMOTED_CLASS);
  } else {
    _0xe9c7f0.classList.remove?.(MEDIA_LOD_HOVER_PROMOTED_CLASS);
  }
  return true;
}
function isNodeMediaLodThumbActive({
  nodeId = "",
  rootEl = null,
  documentRef = globalThis.document
} = {}) {
  const _0x14ac6e = getNodeElement({
    nodeId: nodeId,
    rootEl: rootEl,
    documentRef: documentRef
  });
  const _0x5dd958 = String(_0x14ac6e?.dataset?.[MEDIA_LOD_MODE_ATTR] || "").trim();
  if (_0x5dd958) {
    return _0x5dd958 === MEDIA_LOD_MODE_THUMB;
  }
  return isCanvasLowZoomActive(documentRef);
}
export function isNodePromotedForFullImage({
  nodeId = "",
  rootEl = null,
  store = null,
  documentRef = globalThis.document
} = {}) {
  const _0x588d7b = String(nodeId || "").trim();
  const _0x9d7c70 = getStateSnapshot(store);
  const _0x1d7300 = Array.isArray(_0x9d7c70?.selectedNodeIds) ? _0x9d7c70.selectedNodeIds : [];
  if (_0x588d7b && _0x1d7300.some(_0x5ccf95 => String(_0x5ccf95 || "") === _0x588d7b)) {
    return true;
  }
  const _0x126cc1 = getNodeElement({
    nodeId: _0x588d7b,
    rootEl: rootEl,
    documentRef: documentRef
  });
  if (!_0x126cc1) {
    return false;
  }
  return PROMOTED_NODE_CLASSES.some(_0x6dbb18 => _0x126cc1.classList?.contains(_0x6dbb18));
}
export function shouldUseLowZoomImageThumbnail({
  nodeId = "",
  rootEl = null,
  documentRef = globalThis.document
} = {}) {
  return isNodeMediaLodThumbActive({
    nodeId: nodeId,
    rootEl: rootEl,
    documentRef: documentRef
  });
}
function toPositiveNumber(_0x148dd1) {
  const _0x4575d1 = Number(_0x148dd1);
  if (Number.isFinite(_0x4575d1) && _0x4575d1 > 0) {
    return _0x4575d1;
  } else {
    return 0;
  }
}
function getPrimaryImageMetadata(_0x1c808d = {}) {
  const _0x31c39c = Array.isArray(_0x1c808d?.images) ? _0x1c808d.images : [];
  const _0x5013a5 = Number(_0x1c808d?.mainImageIndex);
  const _0x204a75 = Number.isFinite(_0x5013a5) ? Math.max(0, Math.min(_0x31c39c.length - 1, Math.trunc(_0x5013a5))) : 0;
  return _0x31c39c[_0x204a75] || _0x31c39c[0] || {};
}
function pickPositiveNumber(..._0x46dd57) {
  for (const _0x4afdb4 of _0x46dd57) {
    const _0x582e03 = toPositiveNumber(_0x4afdb4);
    if (_0x582e03 > 0) {
      return _0x582e03;
    }
  }
  return 0;
}
export function getCanvasImageIntrinsicPixelSize(_0x8b670c = {}) {
  const _0x1a2aba = getPrimaryImageMetadata(_0x8b670c);
  return {
    width: pickPositiveNumber(_0x1a2aba.originalWidth, _0x1a2aba.naturalWidth, _0x1a2aba.imageWidth, _0x8b670c.originalWidth, _0x8b670c.naturalWidth, _0x8b670c.imageWidth),
    height: pickPositiveNumber(_0x1a2aba.originalHeight, _0x1a2aba.naturalHeight, _0x1a2aba.imageHeight, _0x8b670c.originalHeight, _0x8b670c.naturalHeight, _0x8b670c.imageHeight)
  };
}
export function getCanvasImageThumbPixelSize(_0x4320e7 = {}) {
  const _0x502c18 = getPrimaryImageMetadata(_0x4320e7);
  const _0x53a00c = pickPositiveNumber(_0x502c18.thumbWidth, _0x502c18.thumbnailWidth, _0x4320e7.thumbWidth, _0x4320e7.thumbnailWidth);
  const _0x282d48 = pickPositiveNumber(_0x502c18.thumbHeight, _0x502c18.thumbnailHeight, _0x4320e7.thumbHeight, _0x4320e7.thumbnailHeight);
  if (_0x53a00c > 0 && _0x282d48 > 0) {
    return {
      width: _0x53a00c,
      height: _0x282d48
    };
  }
  const _0x3470ad = getCanvasImageIntrinsicPixelSize(_0x4320e7);
  const _0x2186b5 = _0x3470ad.width || toPositiveNumber(_0x4320e7?.width);
  const _0x4b781e = _0x3470ad.height || toPositiveNumber(_0x4320e7?.height);
  if (!(_0x2186b5 > 0) || !(_0x4b781e > 0)) {
    return {
      width: 0,
      height: 0
    };
  }
  const _0x79db27 = Math.min(1, CANVAS_IMAGE_THUMB_MAX_EDGE_PX / Math.max(_0x2186b5, _0x4b781e));
  return {
    width: _0x2186b5 * _0x79db27,
    height: _0x4b781e * _0x79db27
  };
}
export function getCanvasImageRequiredPixelSize(_0x2a0790 = {}, _0x146982 = {}, {
  devicePixelRatio: _0x5f5379
} = {}) {
  const _0x4edea6 = toPositiveNumber(_0x146982?.zoom) || 1;
  const _0x5c29e7 = toPositiveNumber(_0x5f5379) || toPositiveNumber(_0x146982?.devicePixelRatio) || toPositiveNumber(_0x146982?.dpr) || toPositiveNumber(globalThis.devicePixelRatio) || 1;
  return {
    width: toPositiveNumber(_0x2a0790?.width) * _0x4edea6 * _0x5c29e7,
    height: toPositiveNumber(_0x2a0790?.height) * _0x4edea6 * _0x5c29e7,
    zoom: _0x4edea6,
    devicePixelRatio: _0x5c29e7
  };
}
export function resolveCanvasImageLodMode({
  node = {},
  viewport = {},
  previousMode = "",
  devicePixelRatio: _0x4ef2e3,
  interactionBusy = false
} = {}) {
  const _0xb10ab2 = previousMode === MEDIA_LOD_MODE_THUMB ? MEDIA_LOD_MODE_THUMB : previousMode === MEDIA_LOD_MODE_FULL ? MEDIA_LOD_MODE_FULL : "";
  if (interactionBusy && _0xb10ab2 === MEDIA_LOD_MODE_FULL) {
    return MEDIA_LOD_MODE_FULL;
  }
  const _0xa65484 = getCanvasImageRequiredPixelSize(node, viewport, {
    devicePixelRatio: _0x4ef2e3
  });
  const _0x1d3faf = getCanvasImageThumbPixelSize(node);
  if (!(_0xa65484.width > 0) || !(_0xa65484.height > 0) || !(_0x1d3faf.width > 0) || !(_0x1d3faf.height > 0)) {
    return MEDIA_LOD_MODE_FULL;
  }
  const _0x1a1a82 = _0xb10ab2 === MEDIA_LOD_MODE_FULL ? CANVAS_IMAGE_LOD_DOWNGRADE_RATIO : 1;
  const _0x463fc5 = _0xa65484.width <= _0x1d3faf.width * _0x1a1a82 && _0xa65484.height <= _0x1d3faf.height * _0x1a1a82;
  if (_0x463fc5) {
    return MEDIA_LOD_MODE_THUMB;
  } else {
    return MEDIA_LOD_MODE_FULL;
  }
}
export function pickImageLodUrl({
  mainUrl = "",
  thumbUrl = "",
  lowZoomThumbnail = false
} = {}) {
  const _0x25279c = String(mainUrl || "").trim();
  const _0x45853c = String(thumbUrl || "").trim();
  if (lowZoomThumbnail && _0x45853c) {
    return {
      url: _0x45853c,
      lod: _0x45853c && _0x45853c !== _0x25279c ? "thumb" : "full"
    };
  }
  return {
    url: _0x25279c || _0x45853c,
    lod: "full"
  };
}