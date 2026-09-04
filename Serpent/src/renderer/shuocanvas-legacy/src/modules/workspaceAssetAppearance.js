function normalizeText(_0x3bc2f1) {
  return String(_0x3bc2f1 ?? "").trim();
}
export function getWorkspaceAssetAppearances(_0x1e1eb2 = {}) {
  if (Array.isArray(_0x1e1eb2?.appearances)) {
    return _0x1e1eb2.appearances;
  } else {
    return [];
  }
}
export function getWorkspaceAssetAppearance(_0x1796d7 = {}, _0x3e97e2 = 0) {
  const _0x43637b = getWorkspaceAssetAppearances(_0x1796d7);
  if (!_0x43637b.length) {
    return null;
  }
  const _0xeb2c6a = Math.max(0, Math.min(_0x43637b.length - 1, Math.trunc(Number(_0x3e97e2) || 0)));
  return _0x43637b[_0xeb2c6a] || null;
}
export function getWorkspaceAssetBaseAppearance(_0x2be70e = {}) {
  const _0x42c261 = normalizeText(_0x2be70e?.baseAppearanceId);
  if (!_0x42c261) {
    return null;
  }
  return getWorkspaceAssetAppearances(_0x2be70e).find(_0x21dc53 => normalizeText(_0x21dc53?.id) === _0x42c261) || null;
}
export function getWorkspaceAssetAppearanceStats(_0x5a84f3 = {}) {
  const _0x1754d9 = getWorkspaceAssetAppearances(_0x5a84f3);
  const _0x7c17c2 = _0x1754d9.filter(_0x2cd38e => normalizeText(_0x2cd38e?.imageUrl)).length;
  const _0x5666e1 = _0x1754d9.filter(_0x5296f3 => !normalizeText(_0x5296f3?.imageUrl) && normalizeText(_0x5296f3?.error)).length;
  return {
    total: _0x1754d9.length,
    generated: _0x7c17c2,
    failed: _0x5666e1,
    pending: Math.max(0, _0x1754d9.length - _0x7c17c2 - _0x5666e1)
  };
}