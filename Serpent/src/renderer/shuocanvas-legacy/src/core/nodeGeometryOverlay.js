function normalizeOverrideSize(_0x17def7) {
  const _0x277af8 = Number(_0x17def7?.width);
  const _0x3447fb = Number(_0x17def7?.height);
  if (!Number.isFinite(_0x277af8) || !Number.isFinite(_0x3447fb)) {
    return null;
  }
  return {
    width: _0x277af8,
    height: _0x3447fb
  };
}
export function createNodeGeometryOverlay(_0x51641c, _0x35fa92) {
  const _0x678e10 = _0x51641c && typeof _0x51641c === "object" ? _0x51641c : {};
  if (!_0x35fa92 || typeof _0x35fa92 !== "object") {
    return _0x678e10;
  }
  let _0x3f5aa6 = null;
  for (const [_0x2a7f7b, _0x5b976d] of Object.entries(_0x35fa92)) {
    const _0x2d92b9 = _0x678e10[_0x2a7f7b];
    const _0x23b799 = normalizeOverrideSize(_0x5b976d);
    if (!_0x2d92b9 || !_0x23b799) {
      continue;
    }
    if (!_0x3f5aa6) {
      _0x3f5aa6 = Object.create(_0x678e10);
    }
    Object.defineProperty(_0x3f5aa6, _0x2a7f7b, {
      configurable: true,
      enumerable: true,
      value: {
        ..._0x2d92b9,
        ..._0x23b799
      },
      writable: true
    });
  }
  return _0x3f5aa6 || _0x678e10;
}