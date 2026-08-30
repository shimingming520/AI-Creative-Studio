function requireFunction(_0x19024b, _0x14d82c) {
  if (typeof _0x19024b !== "function") {
    throw new TypeError(_0x14d82c + " must be a function");
  }
  return _0x19024b;
}
function normalizeAssetId(_0x5ca8fc) {
  const _0x15c063 = String(_0x5ca8fc || "").trim();
  if (!_0x15c063) {
    throw new TypeError("assetId must be a non-empty string");
  }
  return _0x15c063;
}
function nextAssetRevision(_0x38f429) {
  const _0x5440eb = Number(_0x38f429 || 0);
  if (!Number.isSafeInteger(_0x5440eb) || _0x5440eb < 0 || _0x5440eb >= Number.MAX_SAFE_INTEGER) {
    throw new RangeError("asset revision must be a non-negative safe integer");
  }
  return _0x5440eb + 1;
}
export function createAssetIndexCoordinator({
  readIndex: _0x333d93,
  writeIndex: _0x190e81,
  now = () => new Date().toISOString()
} = {}) {
  const _0x4208d3 = requireFunction(_0x333d93, "readIndex");
  const _0x453427 = requireFunction(_0x190e81, "writeIndex");
  const _0x41f27e = requireFunction(now, "now");
  function _0x40e0e7(_0x3dc504, _0x3614e4) {
    const _0x273155 = normalizeAssetId(_0x3dc504);
    const _0x3d3f4f = requireFunction(_0x3614e4, "updater");
    const _0x34cbb4 = _0x4208d3() || {};
    const _0x316c9d = _0x34cbb4.assets && typeof _0x34cbb4.assets === "object" ? _0x34cbb4.assets : {};
    const _0x27dcb0 = _0x316c9d[_0x273155] || null;
    const _0x4a4518 = _0x3d3f4f(_0x27dcb0, {
      ..._0x34cbb4,
      assets: _0x316c9d
    });
    if (_0x4a4518 && typeof _0x4a4518.then === "function") {
      throw new TypeError("asset index updater must be synchronous");
    }
    if (!_0x4a4518) {
      return null;
    }
    const _0x27747a = {
      ..._0x4a4518,
      assetId: _0x273155,
      assetRevision: nextAssetRevision(_0x27dcb0?.assetRevision),
      updatedAt: String(_0x41f27e())
    };
    _0x316c9d[_0x273155] = _0x27747a;
    _0x453427({
      ..._0x34cbb4,
      version: 1,
      assets: _0x316c9d
    });
    return _0x27747a;
  }
  function _0x340772(_0x218b2e, _0x5f0f80, {
    expectedMediaTaskId = ""
  } = {}) {
    const _0x1ec688 = String(expectedMediaTaskId || "").trim();
    return _0x40e0e7(_0x218b2e, _0x40b498 => {
      if (!_0x40b498) {
        return null;
      }
      if (_0x1ec688 && String(_0x40b498.mediaTaskId || "").trim() !== _0x1ec688) {
        return null;
      }
      return {
        ..._0x40b498,
        ...(_0x5f0f80 && typeof _0x5f0f80 === "object" ? _0x5f0f80 : {})
      };
    });
  }
  return {
    commit: _0x40e0e7,
    patch: _0x340772
  };
}