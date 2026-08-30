export function stripPrefix(_0x364ab2, _0x562e71) {
  const _0x246e0c = String(_0x364ab2 || "").trim();
  if (_0x246e0c.startsWith(_0x562e71)) {
    return _0x246e0c.slice(_0x562e71.length);
  } else {
    return _0x246e0c;
  }
}
export function isPresentValue(_0x56412c) {
  return _0x56412c !== undefined && _0x56412c !== null && String(_0x56412c).trim() !== "";
}
export function normalizePositiveInteger(_0x3f8d4d, _0x14f855) {
  const _0x3cc7f2 = Number.parseInt(String(_0x3f8d4d ?? "").trim(), 10);
  if (Number.isFinite(_0x3cc7f2) && _0x3cc7f2 >= 0) {
    return _0x3cc7f2;
  } else {
    return _0x14f855;
  }
}
export function normalizeInputList(_0x4e7ccb) {
  if (Array.isArray(_0x4e7ccb)) {
    return _0x4e7ccb.map(_0x4043bc => String(_0x4043bc || "").trim()).filter(Boolean);
  } else {
    return [];
  }
}
export function normalizeInputUrlsBySlot(_0x392df4) {
  if (!_0x392df4 || typeof _0x392df4 !== "object" || Array.isArray(_0x392df4)) {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x392df4).map(([_0x525bb1, _0x9cf61]) => [String(_0x525bb1 || "").trim(), String(_0x9cf61 || "").trim()]).filter(([_0x58bbe0, _0x20a08a]) => _0x58bbe0 && _0x20a08a));
}
export function appendUniqueUrl(_0x91ba77, _0x2965af) {
  const _0x4f7c18 = String(_0x2965af || "").trim();
  if (_0x4f7c18 && !_0x91ba77.includes(_0x4f7c18)) {
    _0x91ba77.push(_0x4f7c18);
  }
}
export function normalizeKlingKeepOriginalSound(_0x5a2c2c) {
  if (_0x5a2c2c === true || _0x5a2c2c === false) {
    return _0x5a2c2c;
  }
  const _0x5367b5 = String(_0x5a2c2c ?? "").trim().toLowerCase();
  return _0x5367b5 === "true" || _0x5367b5 === "1" || _0x5367b5 === "yes";
}
export function replaceKlingO1PromptImageReferences(_0x4c084a, _0x5a0b20) {
  const _0x5b4cbb = Math.max(0, Math.trunc(Number(_0x5a0b20) || 0));
  if (_0x5b4cbb <= 0) {
    return String(_0x4c084a || "");
  }
  return String(_0x4c084a || "").replace(/@?\u56fe\u7247\s*([1-9]\d*)/g, (_0x4e5483, _0x4229f5) => {
    const _0x2e7620 = Number.parseInt(String(_0x4229f5 || ""), 10);
    if (!Number.isFinite(_0x2e7620) || _0x2e7620 < 1 || _0x2e7620 > _0x5b4cbb) {
      return _0x4e5483;
    }
    return "<<<image_" + _0x2e7620 + ">>>";
  });
}