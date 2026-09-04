import { getAutoMediaSizeByShortSide } from "../services/fileService.js";
const FLAT_MEDIA_TYPES = new Set(["source-image", "image", "ai-image", "source-video", "video", "ai-video"]);
const IMAGE_MEDIA_TYPES = new Set(["source-image", "image", "ai-image"]);
function toNumber(_0x1b06f7, _0x204483 = 0) {
  const _0x8ecc87 = Number(_0x1b06f7);
  if (Number.isFinite(_0x8ecc87)) {
    return _0x8ecc87;
  } else {
    return _0x204483;
  }
}
function getNodeWidth(_0x28c17f) {
  return Math.max(1, toNumber(_0x28c17f?.width ?? _0x28c17f?.w, 240));
}
function getNodeHeight(_0x53e1bc) {
  return Math.max(1, toNumber(_0x53e1bc?.height ?? _0x53e1bc?.h, 240));
}
function isFlatMediaNode(_0x904c8c) {
  return FLAT_MEDIA_TYPES.has(String(_0x904c8c?.type || ""));
}
function getFirstPositiveDimension(..._0x3172f1) {
  for (const _0x1d242f of _0x3172f1) {
    const _0x4a59c8 = Number(_0x1d242f);
    if (Number.isFinite(_0x4a59c8) && _0x4a59c8 > 0) {
      return _0x4a59c8;
    }
  }
  return 0;
}
export function prepareAssetNodeForRestore(_0x3bb172, _0x309dcd) {
  if (!_0x309dcd || typeof _0x309dcd !== "object") {
    return _0x309dcd;
  }
  if (!String(_0x3bb172?.packageKey || "").trim()) {
    return _0x309dcd;
  }
  if (!IMAGE_MEDIA_TYPES.has(String(_0x309dcd.type || ""))) {
    return _0x309dcd;
  }
  const _0x3ce1e3 = getFirstPositiveDimension(_0x309dcd.originalWidth, _0x309dcd.imageWidth, _0x309dcd.naturalWidth, _0x309dcd.metadata?.width, _0x309dcd.width, _0x309dcd.w);
  const _0x1c1889 = getFirstPositiveDimension(_0x309dcd.originalHeight, _0x309dcd.imageHeight, _0x309dcd.naturalHeight, _0x309dcd.metadata?.height, _0x309dcd.height, _0x309dcd.h);
  if (!(_0x3ce1e3 > 0) || !(_0x1c1889 > 0)) {
    return _0x309dcd;
  }
  const _0x3858ce = getAutoMediaSizeByShortSide(_0x3ce1e3, _0x1c1889);
  if (getNodeWidth(_0x309dcd) === _0x3858ce.width && getNodeHeight(_0x309dcd) === _0x3858ce.height) {
    return _0x309dcd;
  }
  return {
    ..._0x309dcd,
    width: _0x3858ce.width,
    height: _0x3858ce.height
  };
}
export function shouldTopAlignRestoredAsset(_0x4ba584, _0x3783a7) {
  const _0x292825 = Array.isArray(_0x4ba584) ? _0x4ba584.filter(Boolean) : [];
  if (_0x292825.length <= 1) {
    return false;
  }
  if (!_0x292825.every(isFlatMediaNode)) {
    return false;
  }
  return !Array.isArray(_0x3783a7) || _0x3783a7.length === 0;
}
export function createTopAlignedAssetNodes(_0x476e69, _0x5e6864 = 24) {
  const _0x2a0dd4 = Array.isArray(_0x476e69) ? _0x476e69.filter(Boolean) : [];
  const _0x50717c = _0x2a0dd4.map((_0x517ffb, _0x4ba58b) => ({
    node: _0x517ffb,
    index: _0x4ba58b
  })).sort((_0x50feb8, _0x3245cf) => {
    const _0x297b96 = toNumber(_0x50feb8.node?.x, 0);
    const _0x74c66c = toNumber(_0x3245cf.node?.x, 0);
    if (_0x297b96 !== _0x74c66c) {
      return _0x297b96 - _0x74c66c;
    }
    const _0x40e686 = toNumber(_0x50feb8.node?.y, 0);
    const _0x28b8b0 = toNumber(_0x3245cf.node?.y, 0);
    if (_0x40e686 !== _0x28b8b0) {
      return _0x40e686 - _0x28b8b0;
    }
    return _0x50feb8.index - _0x3245cf.index;
  });
  let _0x4bd7c1 = 0;
  return _0x50717c.map(({
    node: _0x51db48
  }) => {
    const _0x219324 = getNodeWidth(_0x51db48);
    const _0x145f1f = getNodeHeight(_0x51db48);
    const _0x479c90 = {
      ..._0x51db48,
      x: _0x4bd7c1,
      y: 0,
      width: _0x219324,
      height: _0x145f1f
    };
    _0x4bd7c1 += _0x219324 + _0x5e6864;
    return _0x479c90;
  });
}
export function prepareAssetNodesForRestore(_0x42429e, _0x302919 = 24) {
  const _0x15a5aa = Array.isArray(_0x42429e?.nodes) ? _0x42429e.nodes : [];
  const _0x8b608e = _0x15a5aa.map(_0x260e22 => prepareAssetNodeForRestore(_0x42429e, _0x260e22));
  if (shouldTopAlignRestoredAsset(_0x8b608e, _0x42429e?.edges)) {
    return createTopAlignedAssetNodes(_0x8b608e, _0x302919);
  } else {
    return _0x8b608e;
  }
}