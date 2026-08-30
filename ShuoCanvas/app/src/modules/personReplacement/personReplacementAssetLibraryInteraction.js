import { playAssetCreateFly } from "../assetCreateFly.js";
function normalizeText(_0x6bbaf) {
  return String(_0x6bbaf ?? "").trim();
}
function getLibraryAssetSourceKey(_0x12dd4f = {}) {
  return normalizeText(_0x12dd4f.sourceAssetId) + ":" + Math.max(0, Math.trunc(Number(_0x12dd4f.sourceItemIndex) || 0));
}
function getRenderableElementRect(_0x42478d) {
  const _0x3ccdaa = _0x42478d?.getBoundingClientRect?.();
  if (_0x3ccdaa?.width > 0 && _0x3ccdaa?.height > 0) {
    return _0x3ccdaa;
  } else {
    return null;
  }
}
function resolveLibraryAssetFlySource(_0x27c5e0, _0x43d96f, _0x26937 = []) {
  const _0x5be58e = _0x26937.find(_0x4775b9 => normalizeText(_0x4775b9?.dataset?.storyAssetId) === _0x43d96f.id);
  const _0x539287 = _0x5be58e?.querySelector?.(".story-asset-card-image");
  const _0x2b5e2d = getRenderableElementRect(_0x539287);
  if (_0x2b5e2d) {
    return {
      fromRect: _0x2b5e2d,
      contentElement: _0x539287
    };
  }
  const _0x462ec1 = Array.from(_0x27c5e0?.querySelectorAll?.("[data-story-asset-prompt-asset-id]") || []).find(_0xeb2ddd => normalizeText(_0xeb2ddd?.dataset?.storyAssetPromptAssetId) === _0x43d96f.id);
  const _0x108099 = _0x462ec1?.closest?.(".story-asset-detail")?.querySelector?.(".story-asset-preview");
  const _0x1c37aa = getRenderableElementRect(_0x108099);
  if (_0x1c37aa) {
    return {
      fromRect: _0x1c37aa,
      contentElement: _0x108099
    };
  } else {
    return null;
  }
}
export function getNewPersonReplacementLibraryAssets(_0x4d7395 = {}, _0x26e548 = [], _0x3e19c1 = "character") {
  const _0x2e8c75 = _0x3e19c1 === "scene" ? _0x4d7395.scenes : _0x3e19c1 === "audio" ? _0x4d7395.audioAssets : _0x4d7395.characters;
  const _0x1df14d = new Set((Array.isArray(_0x2e8c75) ? _0x2e8c75 : []).filter(_0x1de816 => normalizeText(_0x1de816?.sourceOrigin) === "library").map(_0x5494b6 => getLibraryAssetSourceKey(_0x5494b6)));
  return _0x26e548.filter(_0x1630c0 => !_0x1df14d.has(getLibraryAssetSourceKey(_0x1630c0)));
}
export function playPersonReplacementLibraryAssetsIntoProjectTab(_0x128968, _0x153992 = [], _0x5ba984 = 0, _0x1dee4c = "character", _0x3e3f17 = globalThis.document, _0x265c07 = globalThis.window) {
  const _0x313859 = Math.min(_0x153992.length, Math.max(0, Math.trunc(Number(_0x5ba984) || 0)));
  if (!_0x313859) {
    return false;
  }
  const _0x41f343 = _0x128968?.querySelector?.("[data-asset-tab=\"" + _0x1dee4c + "\"]");
  if (!_0x41f343) {
    return false;
  }
  const _0x580838 = Array.from(_0x128968?.querySelectorAll?.("[data-story-asset-id]") || []);
  _0x153992.slice(0, _0x313859).forEach(_0xe6cbf6 => {
    const _0x5f2db9 = resolveLibraryAssetFlySource(_0x128968, _0xe6cbf6, _0x580838);
    if (!_0x5f2db9) {
      return;
    }
    playAssetCreateFly({
      ..._0x5f2db9,
      toElement: _0x41f343,
      documentObject: _0x3e3f17,
      windowObject: _0x265c07
    });
  });
  return true;
}
export async function addPersonReplacementAppearanceToLibraryWithFly(_0x4cffc5, _0x131cf7, _0x19800b, _0x6b91a5, _0x45eada, _0x2e8466, _0x48df6d) {
  const _0x1f96de = _0x4cffc5?.querySelector?.(".person-replacement-assets-page .story-asset-detail .story-asset-preview");
  const _0x480d31 = _0x1f96de?.getBoundingClientRect?.() || null;
  const _0x2f89d9 = await _0x45eada(_0x6b91a5, {
    characterId: _0x131cf7?.id,
    appearanceId: _0x19800b?.id
  });
  if (!_0x2f89d9?.ok || !_0x1f96de || !_0x480d31) {
    return null;
  }
  return playAssetCreateFly({
    fromRect: _0x480d31,
    contentElement: _0x1f96de,
    toElement: _0x4cffc5?.querySelector?.("[data-asset-tab=\"library\"]"),
    documentObject: _0x2e8466,
    windowObject: _0x48df6d
  });
}