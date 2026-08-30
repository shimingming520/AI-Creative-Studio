import { isNodeType } from "../modules/registry.js";
import { MEDIA_LOD_MODE_ATTR, MEDIA_LOD_MODE_FULL, MEDIA_LOD_MODE_THUMB, resolveCanvasImageLodMode } from "../modules/canvasImageLod.js";
export function getNodeMediaLodMode(_0x289c51, _0x417c9e, _0xe45f41 = "", _0x1d7f8b = {}) {
  if (!isNodeType(_0x289c51, ["source-image", "ai-image"])) {
    return "";
  }
  return resolveCanvasImageLodMode({
    node: _0x289c51,
    viewport: _0x417c9e,
    previousMode: _0xe45f41,
    devicePixelRatio: _0x1d7f8b?.devicePixelRatio,
    interactionBusy: _0x1d7f8b?.interactionBusy === true
  });
}
export function syncNodeMediaLodMode(_0x2ba983, _0x456a5d, _0xad0d18, _0x182446 = {}) {
  if (!_0x2ba983?.dataset) {
    return "";
  }
  const _0x40e29e = String(_0x2ba983.dataset[MEDIA_LOD_MODE_ATTR] || "").trim();
  const _0x2462e5 = getNodeMediaLodMode(_0x456a5d, _0xad0d18, _0x40e29e, _0x182446);
  if (!_0x2462e5) {
    if (MEDIA_LOD_MODE_ATTR in _0x2ba983.dataset) {
      delete _0x2ba983.dataset[MEDIA_LOD_MODE_ATTR];
    }
    return "";
  }
  if (_0x2ba983.dataset[MEDIA_LOD_MODE_ATTR] !== _0x2462e5) {
    _0x2ba983.dataset[MEDIA_LOD_MODE_ATTR] = _0x2462e5;
  }
  return _0x2462e5;
}
export function collectFullEligibleVisibleImageNodeIds({
  nodes: _0x589a20,
  candidateNodeIds: _0x298d1d,
  viewport: _0x5464ba,
  devicePixelRatio: _0x412d48,
  isVisible = () => true,
  getPreviousMode = () => "",
  interactionBusy = false
} = {}) {
  const _0x1a9e04 = _0x589a20 && typeof _0x589a20 === "object" ? _0x589a20 : {};
  const _0x2acc52 = _0x298d1d instanceof Set ? _0x298d1d : new Set(_0x298d1d || []);
  const _0x2a777b = new Set();
  for (const _0x1c5d0c of _0x2acc52) {
    const _0x1f7d95 = _0x1a9e04[_0x1c5d0c];
    if (!isNodeType(_0x1f7d95, ["source-image", "ai-image"])) {
      continue;
    }
    if (!isVisible(_0x1f7d95, _0x1c5d0c)) {
      continue;
    }
    if (getNodeMediaLodMode(_0x1f7d95, _0x5464ba, getPreviousMode(_0x1c5d0c), {
      devicePixelRatio: _0x412d48,
      interactionBusy: interactionBusy
    }) === MEDIA_LOD_MODE_FULL) {
      _0x2a777b.add(_0x1c5d0c);
    }
  }
  return _0x2a777b;
}
export function applyRendererFullEligibleImageCandidates(_0x224049, _0x588f8f) {
  if (!(_0x588f8f instanceof Set) || _0x588f8f.size === 0) {
    return _0x224049;
  }
  const _0x476d8e = new Set(_0x224049?.mountCandidateIds);
  const _0x50543c = new Set(_0x224049?.parkCandidateIds);
  for (const _0x23402f of _0x588f8f) {
    _0x476d8e.add(_0x23402f);
    _0x50543c.delete(_0x23402f);
  }
  return {
    ..._0x224049,
    mountCandidateIds: _0x476d8e,
    parkCandidateIds: _0x50543c
  };
}
export function prioritizeFullEligibleVisibleImageNodes(_0x251944, _0x5fa570) {
  if (!Array.isArray(_0x251944) || _0x251944.length < 2 || !(_0x5fa570 instanceof Set) || _0x5fa570.size === 0) {
    return _0x251944;
  }
  const _0x46b48b = [];
  const _0xfd89f0 = [];
  for (const _0x3db4c8 of _0x251944) {
    if (_0x3db4c8?.id && _0x5fa570.has(_0x3db4c8.id)) {
      _0x46b48b.push(_0x3db4c8);
    } else {
      _0xfd89f0.push(_0x3db4c8);
    }
  }
  if (_0x46b48b.length) {
    return _0x46b48b.concat(_0xfd89f0);
  } else {
    return _0x251944;
  }
}