const MIN_NUMBER_LABEL_DIAMETER_PX = 18;
const getFiniteNumber = (_0x4c6876, _0x1dd9b3 = 0) => {
  const _0x282945 = Number(_0x4c6876);
  if (Number.isFinite(_0x282945)) {
    return _0x282945;
  } else {
    return _0x1dd9b3;
  }
};
const getFinitePoint = _0x4fa607 => {
  const _0x316133 = Number(_0x4fa607?.x);
  const _0x3c72e4 = Number(_0x4fa607?.y);
  if (!Number.isFinite(_0x316133) || !Number.isFinite(_0x3c72e4)) {
    return null;
  }
  return {
    x: _0x316133,
    y: _0x3c72e4
  };
};
const getDistanceSq = (_0x3f8af0, _0x2b5796) => {
  const _0x384faf = _0x3f8af0.x - _0x2b5796.x;
  const _0x5c66cf = _0x3f8af0.y - _0x2b5796.y;
  return _0x384faf * _0x384faf + _0x5c66cf * _0x5c66cf;
};
const getDistanceSqToSegment = (_0x3b4d9e, _0x340694, _0x4a3458) => {
  const _0xce7a24 = _0x4a3458.x - _0x340694.x;
  const _0x15bc94 = _0x4a3458.y - _0x340694.y;
  const _0x184931 = _0xce7a24 * _0xce7a24 + _0x15bc94 * _0x15bc94;
  if (_0x184931 <= 0) {
    return getDistanceSq(_0x3b4d9e, _0x340694);
  }
  const _0x894e0 = Math.max(0, Math.min(1, ((_0x3b4d9e.x - _0x340694.x) * _0xce7a24 + (_0x3b4d9e.y - _0x340694.y) * _0x15bc94) / _0x184931));
  return getDistanceSq(_0x3b4d9e, {
    x: _0x340694.x + _0xce7a24 * _0x894e0,
    y: _0x340694.y + _0x15bc94 * _0x894e0
  });
};
const getNumberLabelEraseRadius = _0x373417 => Math.max(1, getFiniteNumber(_0x373417?.sizeWorld, MIN_NUMBER_LABEL_DIAMETER_PX) * 0.3);
const getEraserRadius = _0xeffb44 => Math.max(1, getFiniteNumber(_0xeffb44?.sizeWorld, MIN_NUMBER_LABEL_DIAMETER_PX) / 2);
function doesEraserCoverNumberLabel(_0x523e64, _0x2ffd02) {
  if (_0x2ffd02?.type !== "eraser") {
    return false;
  }
  const _0x45b02e = getFinitePoint(_0x523e64);
  if (!_0x45b02e) {
    return false;
  }
  const _0x29a54a = (Array.isArray(_0x2ffd02?.points) ? _0x2ffd02.points : []).map(getFinitePoint).filter(Boolean);
  if (!_0x29a54a.length) {
    return false;
  }
  const _0x13ea1f = getNumberLabelEraseRadius(_0x523e64) + getEraserRadius(_0x2ffd02);
  const _0x362900 = _0x13ea1f * _0x13ea1f;
  if (_0x29a54a.length === 1) {
    return getDistanceSq(_0x45b02e, _0x29a54a[0]) <= _0x362900;
  }
  for (let _0x1762ff = 1; _0x1762ff < _0x29a54a.length; _0x1762ff += 1) {
    if (getDistanceSqToSegment(_0x45b02e, _0x29a54a[_0x1762ff - 1], _0x29a54a[_0x1762ff]) <= _0x362900) {
      return true;
    }
  }
  return false;
}
export function normalizeNumberLabelValue(_0x4bfc32, _0x5e1086 = 1) {
  const _0x3734a4 = Math.floor(Number(_0x4bfc32));
  if (Number.isFinite(_0x3734a4) && _0x3734a4 > 0) {
    return _0x3734a4;
  }
  const _0x4f4eb8 = Math.floor(Number(_0x5e1086));
  if (Number.isFinite(_0x4f4eb8) && _0x4f4eb8 > 0) {
    return _0x4f4eb8;
  } else {
    return 1;
  }
}
export function getNextNumberLabelValue(_0x1614b0 = []) {
  const _0x4d3a64 = Array.isArray(_0x1614b0) ? _0x1614b0 : [];
  const _0x3097e9 = new Set();
  _0x4d3a64.forEach((_0x599e5b, _0x21a48e) => {
    if (_0x599e5b?.type !== "number-label") {
      return;
    }
    const _0x12853d = _0x4d3a64.slice(_0x21a48e + 1).some(_0x7ec518 => doesEraserCoverNumberLabel(_0x599e5b, _0x7ec518));
    if (!_0x12853d) {
      _0x3097e9.add(normalizeNumberLabelValue(_0x599e5b.number));
    }
  });
  let _0x13631b = 1;
  while (_0x3097e9.has(_0x13631b)) {
    _0x13631b += 1;
  }
  return _0x13631b;
}
export function drawNumberLabel({
  ctx: _0x4d4634,
  x: _0x33ebe3,
  y: _0x5ee1b5,
  number: _0x1d668e,
  diameter: _0x321cdf,
  color: _0x2dbb21,
  backgroundColor = "",
  opacity = 1
} = {}) {
  if (!_0x4d4634) {
    return false;
  }
  const _0x57ae30 = Number(_0x33ebe3);
  const _0x4ced26 = Number(_0x5ee1b5);
  if (!Number.isFinite(_0x57ae30) || !Number.isFinite(_0x4ced26)) {
    return false;
  }
  const _0x15e7ad = Math.max(MIN_NUMBER_LABEL_DIAMETER_PX, Number.isFinite(Number(_0x321cdf)) ? Number(_0x321cdf) : 0);
  const _0x297d15 = _0x15e7ad / 2;
  const _0x56eb61 = String(normalizeNumberLabelValue(_0x1d668e));
  const _0x166176 = _0x56eb61.length <= 2 ? 0.52 : _0x56eb61.length === 3 ? 0.42 : 0.34;
  const _0x366508 = Math.max(10, _0x15e7ad * _0x166176);
  const _0x837502 = Math.max(2, _0x15e7ad * 0.08);
  const _0x3119d8 = Math.max(0, Math.min(1, Number.isFinite(Number(opacity)) ? Number(opacity) : 1));
  _0x4d4634.save();
  _0x4d4634.globalAlpha = _0x3119d8;
  _0x4d4634.globalCompositeOperation = "source-over";
  _0x4d4634.beginPath();
  _0x4d4634.arc(_0x57ae30, _0x4ced26, _0x297d15, 0, Math.PI * 2);
  if (backgroundColor) {
    _0x4d4634.globalAlpha = _0x3119d8 * 0.86;
    _0x4d4634.fillStyle = backgroundColor;
    _0x4d4634.fill();
    _0x4d4634.globalAlpha = _0x3119d8;
  }
  if (_0x2dbb21) {
    _0x4d4634.strokeStyle = _0x2dbb21;
    _0x4d4634.lineWidth = _0x837502;
    _0x4d4634.stroke();
    _0x4d4634.fillStyle = _0x2dbb21;
  }
  _0x4d4634.font = "700 " + _0x366508 + "px sans-serif";
  _0x4d4634.textAlign = "center";
  _0x4d4634.textBaseline = "middle";
  _0x4d4634.fillText(_0x56eb61, _0x57ae30, _0x4ced26);
  _0x4d4634.restore();
  return true;
}
export function drawNumberLabelCommand({
  ctx: _0x40f40e,
  cmd: _0x1fc203,
  scaleX = 1,
  scaleY = scaleX,
  viewport = null,
  defaultColor = "",
  backgroundColor = ""
} = {}) {
  const _0xaf03d9 = Number(viewport?.zoom);
  const _0x294dc1 = viewport ? Number.isFinite(_0xaf03d9) && _0xaf03d9 > 0 ? _0xaf03d9 : 1 : Number.isFinite(Number(scaleX)) ? Number(scaleX) : 1;
  const _0x289591 = viewport ? _0x294dc1 : Number.isFinite(Number(scaleY)) ? Number(scaleY) : _0x294dc1;
  const _0x263092 = viewport ? Number(viewport.x) || 0 : 0;
  const _0x134189 = viewport ? Number(viewport.y) || 0 : 0;
  const _0x181ba6 = Math.max(0.001, Math.abs(_0x294dc1));
  const _0x2e12ff = Number(_0x1fc203?.sizeWorld);
  const _0x1c5139 = viewport ? (Number(_0x1fc203?.x) - _0x263092) * _0x294dc1 : Number(_0x1fc203?.x) * _0x294dc1;
  const _0xb604d0 = viewport ? (Number(_0x1fc203?.y) - _0x134189) * _0x289591 : Number(_0x1fc203?.y) * _0x289591;
  return drawNumberLabel({
    ctx: _0x40f40e,
    x: _0x1c5139,
    y: _0xb604d0,
    number: _0x1fc203?.number,
    diameter: Number.isFinite(_0x2e12ff) ? _0x2e12ff * _0x181ba6 : MIN_NUMBER_LABEL_DIAMETER_PX,
    color: _0x1fc203?.color || defaultColor,
    backgroundColor: backgroundColor,
    opacity: _0x1fc203?.opacity
  });
}