import { getStoryAssetAppearances, normalizeStoryAsset } from "./storyAssetAppearances.js";
function normalizeText(_0x2c70b1) {
  return String(_0x2c70b1 || "").trim();
}
function getLibraryAssetSourceKey(_0x6d7727 = {}) {
  const _0x4d36ff = normalizeText(_0x6d7727.sourceAssetId || _0x6d7727.assetId);
  const _0x5e5a11 = Math.max(0, Math.trunc(Number(_0x6d7727.sourceItemIndex ?? _0x6d7727.itemIndex) || 0));
  return _0x4d36ff + ":" + _0x5e5a11;
}
function getLibraryAssetImage(_0x54f8c8 = {}) {
  const _0x2e3d46 = normalizeText(_0x54f8c8.mediaKind || _0x54f8c8.type).toLowerCase();
  const _0x4c6bf1 = normalizeText(_0x54f8c8.sourceUrl || _0x54f8c8.imageUrl);
  if (_0x2e3d46 !== "image" || !_0x4c6bf1) {
    return null;
  }
  return {
    imageUrl: _0x4c6bf1,
    sourceAssetId: normalizeText(_0x54f8c8.sourceAssetId || _0x54f8c8.assetId),
    sourceItemIndex: Math.max(0, Math.trunc(Number(_0x54f8c8.sourceItemIndex ?? _0x54f8c8.itemIndex) || 0))
  };
}
function createLibraryAppearanceId(_0x1ced1f = {}, _0x58164c = "", _0x49737d = new Set()) {
  const _0x35d34e = normalizeText(_0x1ced1f.sourceAssetId || _0x1ced1f.assetId).replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/gu, "") || "asset";
  const _0x1a6e8f = Math.max(0, Math.trunc(Number(_0x1ced1f.sourceItemIndex ?? _0x1ced1f.itemIndex) || 0));
  const _0x58896d = (normalizeText(_0x58164c) || "story-asset") + "-appearance-" + _0x35d34e + "-" + (_0x1a6e8f + 1);
  let _0x1eea37 = _0x58896d;
  let _0x26042d = 2;
  while (_0x49737d.has(_0x1eea37)) {
    _0x1eea37 = _0x58896d + "-" + _0x26042d;
    _0x26042d += 1;
  }
  _0x49737d.add(_0x1eea37);
  return _0x1eea37;
}
function createLibraryAppearance(_0x1b2644, _0x10f7b9, _0x3e2533) {
  const _0x27b19e = getLibraryAssetImage(_0x1b2644);
  return {
    id: _0x3e2533,
    name: normalizeText(_0x1b2644.name || _0x1b2644.assetName) || (_0x10f7b9.kind === "scene" ? "新增场景形象" : _0x10f7b9.kind === "prop" ? "新增道具形象" : "新增角色形象"),
    sourceOrigin: "library",
    sourceAssetId: _0x27b19e.sourceAssetId,
    sourceItemIndex: _0x27b19e.sourceItemIndex,
    occurrences: "总素材",
    prompt: "",
    imageUrl: _0x27b19e.imageUrl,
    referenceImageUrl: "",
    error: ""
  };
}
function replaceLibraryAppearance(_0x2c7489, _0x1ed42c) {
  const _0x9599a6 = getLibraryAssetImage(_0x1ed42c);
  const {
    generatedImage: _0x2ccc29,
    totalAssetRef: _0x21a9b9,
    ..._0xa0f712
  } = _0x2c7489;
  return {
    ..._0xa0f712,
    sourceOrigin: "library",
    sourceAssetId: _0x9599a6.sourceAssetId,
    sourceItemIndex: _0x9599a6.sourceItemIndex,
    imageUrl: _0x9599a6.imageUrl,
    error: ""
  };
}
function createEmptyResult(_0x4562e1, _0x481b9a, _0x29c6ee = "") {
  return {
    assets: _0x4562e1,
    addedAssetIds: [],
    updatedAppearanceIds: [],
    existingAssetIds: [],
    skippedAssetIds: (Array.isArray(_0x481b9a) ? _0x481b9a : []).map(normalizeText).filter(Boolean),
    targetAssetId: _0x29c6ee
  };
}
export function addStoryLibraryAssetsToProject(_0x194414 = [], _0x527770 = [], _0x4bfc6f = [], _0x13d5d3 = "", {
  targetAppearanceId = "",
  createAppearance = false
} = {}) {
  const _0x4af05b = Array.isArray(_0x194414) ? _0x194414 : [];
  const _0x37577c = normalizeText(_0x13d5d3);
  const _0x398530 = _0x4af05b.findIndex(_0x24708b => normalizeText(_0x24708b?.id) === _0x37577c);
  if (_0x398530 < 0) {
    return createEmptyResult(_0x4af05b, _0x4bfc6f);
  }
  const _0x28ae27 = _0x4af05b[_0x398530];
  const _0x2d2b99 = new Set((Array.isArray(_0x4bfc6f) ? _0x4bfc6f : []).map(normalizeText).filter(Boolean));
  const _0x23309a = (Array.isArray(_0x527770) ? _0x527770 : []).filter(_0x47dfd8 => _0x2d2b99.has(normalizeText(_0x47dfd8?.id)));
  const _0x3be10d = _0x23309a.filter(getLibraryAssetImage);
  const _0x3ebb38 = _0x23309a.filter(_0x1d53b6 => !getLibraryAssetImage(_0x1d53b6)).map(_0x3edece => normalizeText(_0x3edece?.id)).filter(Boolean);
  const _0x4f3bdf = getStoryAssetAppearances(_0x28ae27);
  const _0x196e0d = normalizeText(targetAppearanceId);
  if (_0x196e0d) {
    const _0x27216b = _0x4f3bdf.findIndex(_0x3203f3 => normalizeText(_0x3203f3?.id) === _0x196e0d);
    if (_0x27216b < 0 || _0x3be10d.length !== 1) {
      return createEmptyResult(_0x4af05b, _0x4bfc6f, _0x37577c);
    }
    const _0x5d6dbf = [..._0x4f3bdf];
    _0x5d6dbf[_0x27216b] = replaceLibraryAppearance(_0x5d6dbf[_0x27216b], _0x3be10d[0]);
    const _0x8e90f = normalizeStoryAsset({
      ..._0x28ae27,
      appearances: _0x5d6dbf
    }, _0x398530);
    return {
      assets: _0x4af05b.map((_0x33a48b, _0x25160f) => _0x25160f === _0x398530 ? _0x8e90f : _0x33a48b),
      addedAssetIds: [],
      updatedAppearanceIds: [_0x196e0d],
      existingAssetIds: [],
      skippedAssetIds: _0x3ebb38,
      targetAssetId: _0x37577c
    };
  }
  const _0x10e2be = new Set(_0x4f3bdf.map(_0x5c680e => normalizeText(_0x5c680e?.id)).filter(Boolean));
  const _0x247cb3 = new Map(_0x4f3bdf.filter(_0x105eb0 => normalizeText(_0x105eb0?.sourceOrigin) === "library").map(_0x57b845 => [getLibraryAssetSourceKey(_0x57b845), _0x57b845]));
  const _0x25fe22 = [];
  const _0x2f4038 = [];
  _0x3be10d.forEach(_0x383fd0 => {
    const _0x40de32 = getLibraryAssetSourceKey(_0x383fd0);
    const _0x1bdb32 = createAppearance ? null : _0x247cb3.get(_0x40de32);
    if (_0x1bdb32) {
      _0x2f4038.push(_0x1bdb32.id);
      return;
    }
    const _0x959730 = createLibraryAppearance(_0x383fd0, _0x28ae27, createLibraryAppearanceId(_0x383fd0, _0x37577c, _0x10e2be));
    _0x25fe22.push(_0x959730);
    _0x247cb3.set(_0x40de32, _0x959730);
  });
  const _0x51dc06 = normalizeStoryAsset({
    ..._0x28ae27,
    appearances: [..._0x4f3bdf, ..._0x25fe22]
  }, _0x398530);
  return {
    assets: _0x4af05b.map((_0x5242f4, _0x59a02c) => _0x59a02c === _0x398530 ? _0x51dc06 : _0x5242f4),
    addedAssetIds: _0x25fe22.map(_0x100dc7 => _0x100dc7.id),
    updatedAppearanceIds: [],
    existingAssetIds: _0x2f4038,
    skippedAssetIds: _0x3ebb38,
    targetAssetId: _0x37577c
  };
}