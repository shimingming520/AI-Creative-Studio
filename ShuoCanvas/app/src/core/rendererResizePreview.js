import { createNodeGeometryOverlay } from "./nodeGeometryOverlay.js";
function toFiniteNumber(_0xbca2f2) {
  const _0x51d923 = Number(_0xbca2f2);
  if (Number.isFinite(_0x51d923)) {
    return _0x51d923;
  } else {
    return null;
  }
}
function normalizeEdgeIds(_0x456b45) {
  if (_0x456b45 instanceof Set) {
    return new Set(_0x456b45);
  }
  if (Array.isArray(_0x456b45)) {
    return new Set(_0x456b45);
  }
  return new Set();
}
export function previewNodeResizeGeometry({
  nodeId: _0x5b5109,
  width: _0x3d79e9,
  height: _0x1a293e
} = {}, {
  snapshot: _0x13cea5,
  ensureEdgeIndex: _0x2d8eb0,
  nodeToEdgeIds: _0x3b57ea,
  renderEdgesByIds: _0x356419
} = {}) {
  if (!_0x5b5109 || !_0x13cea5?.nodes?.[_0x5b5109]) {
    return false;
  }
  const _0x7fc36b = toFiniteNumber(_0x3d79e9);
  const _0x11502b = toFiniteNumber(_0x1a293e);
  if (_0x7fc36b === null || _0x11502b === null) {
    return false;
  }
  const _0x33073d = _0x13cea5.edges || {};
  const _0x36ed7c = Number.isFinite(_0x13cea5._edgesRev) ? _0x13cea5._edgesRev : 0;
  _0x2d8eb0?.(_0x33073d, _0x36ed7c);
  const _0x1ee1d0 = normalizeEdgeIds(_0x3b57ea?.get?.(_0x5b5109));
  if (_0x1ee1d0.size === 0) {
    return true;
  }
  _0x356419?.(_0x1ee1d0, createNodeGeometryOverlay(_0x13cea5.nodes, {
    [_0x5b5109]: {
      width: _0x7fc36b,
      height: _0x11502b
    }
  }), _0x13cea5);
  return true;
}
export function installNodeResizeGeometryPreviewer(_0x101524, _0x43487e, _0x26904c, _0x3a6051, _0x352e41) {
  if (!_0x101524) {
    return false;
  }
  _0x101524.v2Renderer = _0x101524.v2Renderer || {};
  _0x101524.v2Renderer.previewNodeResizeGeometry = _0x29f77a => previewNodeResizeGeometry(_0x29f77a, {
    snapshot: typeof _0x43487e === "function" ? _0x43487e() : null,
    ensureEdgeIndex: _0x26904c,
    nodeToEdgeIds: _0x3a6051,
    renderEdgesByIds: _0x352e41
  });
  return true;
}