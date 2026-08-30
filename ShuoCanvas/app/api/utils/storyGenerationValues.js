export function normalizeText(_0x529ca3) {
  return String(_0x529ca3 || "").trim();
}
export function normalizeStringArray(_0x148f2c) {
  if (Array.isArray(_0x148f2c)) {
    return [...new Set(_0x148f2c.map(normalizeText).filter(Boolean))];
  } else {
    return [];
  }
}
export function normalizePositiveNumber(_0x3e0665) {
  const _0x1753c0 = Number(_0x3e0665);
  if (Number.isFinite(_0x1753c0) && _0x1753c0 > 0) {
    return _0x1753c0;
  } else {
    return 0;
  }
}