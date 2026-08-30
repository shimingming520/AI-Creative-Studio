function defaultNormalizeKey(_0x586690) {
  const _0x317343 = String(_0x586690 || "").trim();
  if (!_0x317343) {
    throw new TypeError("operation key must be a non-empty string");
  }
  return _0x317343;
}
export function createKeyedOperationQueue({
  normalizeKey = defaultNormalizeKey
} = {}) {
  if (typeof normalizeKey !== "function") {
    throw new TypeError("normalizeKey must be a function");
  }
  const _0x3baeea = new Map();
  async function _0x3a8418(_0x18a821, _0x78286d) {
    if (typeof _0x78286d !== "function") {
      throw new TypeError("operation must be a function");
    }
    const _0x23f214 = normalizeKey(_0x18a821);
    const _0x1e465e = _0x3baeea.get(_0x23f214) || Promise.resolve();
    let _0x23de3c;
    const _0x3d24dc = new Promise(_0x36bc11 => {
      _0x23de3c = _0x36bc11;
    });
    const _0x5349df = _0x1e465e.catch(() => undefined).then(() => _0x3d24dc);
    _0x3baeea.set(_0x23f214, _0x5349df);
    await _0x1e465e.catch(() => undefined);
    try {
      return await _0x78286d();
    } finally {
      _0x23de3c();
      if (_0x3baeea.get(_0x23f214) === _0x5349df) {
        _0x3baeea.delete(_0x23f214);
      }
    }
  }
  return {
    run: _0x3a8418,
    get pendingKeyCount() {
      return _0x3baeea.size;
    }
  };
}
export function createCaseInsensitivePathKey(_0x1d92b0) {
  const _0x5388f4 = defaultNormalizeKey(_0x1d92b0);
  if (process.platform === "win32" || process.platform === "darwin") {
    return _0x5388f4.toLowerCase();
  } else {
    return _0x5388f4;
  }
}