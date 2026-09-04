function clamp(_0x4c5d88, _0x108ceb, _0x651e1b, _0x5c4ec3 = _0x108ceb) {
  const _0x2fff13 = Number(_0x4c5d88);
  if (Number.isFinite(_0x2fff13)) {
    return Math.min(_0x651e1b, Math.max(_0x108ceb, _0x2fff13));
  } else {
    return _0x5c4ec3;
  }
}
export function normalizePersonReplacementManualSelection(_0x290c27 = {}, _0x90236 = {}, {
  minWidth = 0.025,
  minHeight = 0.05
} = {}) {
  const _0xfa7158 = clamp(_0x290c27.x, 0, 1, 0);
  const _0x49a0d4 = clamp(_0x290c27.y, 0, 1, 0);
  const _0x31049b = clamp(_0x90236.x, 0, 1, _0xfa7158);
  const _0x135670 = clamp(_0x90236.y, 0, 1, _0x49a0d4);
  const _0x2c3cc4 = {
    x: Math.round(Math.min(_0xfa7158, _0x31049b) * 1000000) / 1000000,
    y: Math.round(Math.min(_0x49a0d4, _0x135670) * 1000000) / 1000000,
    width: Math.round(Math.abs(_0x31049b - _0xfa7158) * 1000000) / 1000000,
    height: Math.round(Math.abs(_0x135670 - _0x49a0d4) * 1000000) / 1000000
  };
  if (_0x2c3cc4.width >= minWidth && _0x2c3cc4.height >= minHeight) {
    return _0x2c3cc4;
  } else {
    return null;
  }
}
export function resolvePersonReplacementSourceImageSize(_0x6add5c, _0x2278a0 = {}) {
  const _0x28bb84 = Number(_0x6add5c?.naturalWidth);
  const _0x81e27e = Number(_0x6add5c?.naturalHeight);
  if (Number.isFinite(_0x28bb84) && _0x28bb84 > 0 && Number.isFinite(_0x81e27e) && _0x81e27e > 0) {
    return {
      width: _0x28bb84,
      height: _0x81e27e
    };
  }
  const _0x2e0ee8 = Number(_0x2278a0?.frame?.width);
  const _0x417a81 = Number(_0x2278a0?.frame?.height);
  if (Number.isFinite(_0x2e0ee8) && _0x2e0ee8 > 0 && Number.isFinite(_0x417a81) && _0x417a81 > 0) {
    return {
      width: _0x2e0ee8,
      height: _0x417a81
    };
  } else {
    return {
      width: 0,
      height: 0
    };
  }
}
export function normalizePersonReplacementManualBoxEdit(_0x1dd0f3 = {}, _0x143381 = {}, _0x463d33 = "move", {
  minWidth = 0.025,
  minHeight = 0.05
} = {}) {
  const _0x16957b = clamp(_0x1dd0f3.x, 0, 1, 0);
  const _0x5514cd = clamp(_0x1dd0f3.y, 0, 1, 0);
  const _0x4e1b0f = clamp(_0x1dd0f3.width, minWidth, 1 - _0x16957b, minWidth);
  const _0x3ca234 = clamp(_0x1dd0f3.height, minHeight, 1 - _0x5514cd, minHeight);
  const _0xf60910 = Number(_0x143381.x) || 0;
  const _0x452a75 = Number(_0x143381.y) || 0;
  if (_0x463d33 === "move") {
    return {
      x: Math.round(clamp(_0x16957b + _0xf60910, 0, 1 - _0x4e1b0f, _0x16957b) * 1000000) / 1000000,
      y: Math.round(clamp(_0x5514cd + _0x452a75, 0, 1 - _0x3ca234, _0x5514cd) * 1000000) / 1000000,
      width: Math.round(_0x4e1b0f * 1000000) / 1000000,
      height: Math.round(_0x3ca234 * 1000000) / 1000000
    };
  }
  let _0x5e0ece = _0x16957b;
  let _0x43aa7d = _0x5514cd;
  let _0x306da1 = _0x16957b + _0x4e1b0f;
  let _0x40904d = _0x5514cd + _0x3ca234;
  if (_0x463d33.includes("w")) {
    _0x5e0ece = clamp(_0x5e0ece + _0xf60910, 0, _0x306da1 - minWidth, _0x5e0ece);
  }
  if (_0x463d33.includes("e")) {
    _0x306da1 = clamp(_0x306da1 + _0xf60910, _0x5e0ece + minWidth, 1, _0x306da1);
  }
  if (_0x463d33.includes("n")) {
    _0x43aa7d = clamp(_0x43aa7d + _0x452a75, 0, _0x40904d - minHeight, _0x43aa7d);
  }
  if (_0x463d33.includes("s")) {
    _0x40904d = clamp(_0x40904d + _0x452a75, _0x43aa7d + minHeight, 1, _0x40904d);
  }
  return {
    x: Math.round(_0x5e0ece * 1000000) / 1000000,
    y: Math.round(_0x43aa7d * 1000000) / 1000000,
    width: Math.round((_0x306da1 - _0x5e0ece) * 1000000) / 1000000,
    height: Math.round((_0x40904d - _0x43aa7d) * 1000000) / 1000000
  };
}