import { findAvailablePosition } from "../core/math.js";
function toFiniteNumber(_0x28b764, _0x569807) {
  const _0x4c9715 = Number(_0x28b764);
  if (Number.isFinite(_0x4c9715)) {
    return _0x4c9715;
  } else {
    return _0x569807;
  }
}
function clampPositiveInteger(_0x5a00b8, _0x2f75de) {
  const _0x62793b = Math.trunc(Number(_0x5a00b8));
  if (Number.isFinite(_0x62793b) && _0x62793b > 0) {
    return _0x62793b;
  } else {
    return _0x2f75de;
  }
}
function normalizeSpawnDirection(_0xf17d30) {
  if (_0xf17d30 === "down" || _0xf17d30 === "left") {
    return _0xf17d30;
  }
  return "right";
}
export function getNodeSpawnPrefs() {
  const _0x26b28a = globalThis.window || {};
  return {
    spacing: _0x26b28a.v2NodeSpacing ?? 120,
    direction: _0x26b28a.v2NodeDirection ?? "right",
    avoidOverlap: _0x26b28a.v2NodeAvoidOverlap ?? true
  };
}
export function calcSpawnStartFromAnchor(_0x4cde19, _0x322728, _0x2bdad4) {
  const _0x28073f = _0x4cde19?.x || 0;
  const _0x38d07f = _0x4cde19?.y || 0;
  const _0x2dd851 = _0x4cde19?.width || 300;
  const _0x38ce6d = _0x4cde19?.height || 300;
  return {
    startX: _0x28073f + (_0x2bdad4 === "right" ? _0x2dd851 + _0x322728 : 0),
    startY: _0x38d07f + (_0x2bdad4 === "down" ? _0x38ce6d + _0x322728 : 0)
  };
}
export function calcSafeSpawnPosNearNode(_0x271701, _0x47803d, _0x2f1ed1, _0xb931b6) {
  const {
    spacing: _0x122737,
    direction: _0x87a0cf,
    avoidOverlap: _0x2ddf89
  } = getNodeSpawnPrefs();
  const _0x2713bc = normalizeSpawnDirection(_0x87a0cf);
  const _0xb09f2e = _0x47803d?.x || 0;
  const _0x346a5b = _0x47803d?.y || 0;
  const _0x31b45e = _0x47803d?.width || 300;
  const _0x5e363f = _0x47803d?.height || 300;
  const _0x1f4e69 = Number(_0x2f1ed1) || 300;
  const _0x714843 = Number(_0xb931b6) || 300;
  const _0x302ee2 = _0x2713bc === "left" ? _0xb09f2e - _0x122737 - _0x1f4e69 : _0xb09f2e + (_0x2713bc === "right" ? _0x31b45e + _0x122737 : 0);
  const _0x3b887a = _0x346a5b + (_0x2713bc === "down" ? _0x5e363f + _0x122737 : 0);
  if (!_0x2ddf89) {
    return {
      x: _0x302ee2,
      y: _0x3b887a
    };
  }
  return findAvailablePosition(_0x271701, _0x302ee2, _0x3b887a, _0x1f4e69, _0x714843, _0x122737, _0x2713bc);
}
export function createBatchSpawnLayoutNearNode({
  nodes = {},
  anchorNode: _0xc31f01,
  itemCount: _0x4ae0de,
  itemWidth: _0xc56dfd,
  itemHeight: _0xf0f756,
  maxPerLine = 5,
  padding = 0,
  titleHeight = 0,
  itemGap: _0x477aa9
} = {}) {
  const _0x3328f5 = getNodeSpawnPrefs();
  const _0x347a07 = Math.max(0, toFiniteNumber(_0x3328f5.spacing, 120));
  const _0x12baec = normalizeSpawnDirection(_0x3328f5.direction);
  const _0x109e7f = _0x3328f5.avoidOverlap !== false;
  const _0x4ab641 = clampPositiveInteger(_0x4ae0de, 1);
  const _0x350556 = Math.max(1, toFiniteNumber(_0xc56dfd, 300));
  const _0x423fb3 = Math.max(1, toFiniteNumber(_0xf0f756, 300));
  const _0x9c910f = Math.max(0, toFiniteNumber(_0x477aa9, _0x347a07));
  const _0x58b673 = Math.max(0, toFiniteNumber(padding, 0));
  const _0x2e11b5 = Math.max(0, toFiniteNumber(titleHeight, 0));
  const _0x1475a5 = Math.min(clampPositiveInteger(maxPerLine, 5), Math.max(1, Math.ceil(Math.sqrt(_0x4ab641))));
  const _0x31453f = _0x12baec === "down" ? Math.max(1, Math.ceil(_0x4ab641 / _0x1475a5)) : _0x1475a5;
  const _0x36b62f = _0x12baec === "down" ? _0x1475a5 : Math.max(1, Math.ceil(_0x4ab641 / _0x1475a5));
  const _0x560d5b = _0x31453f * _0x350556 + (_0x31453f - 1) * _0x9c910f + _0x58b673 * 2;
  const _0x59d51a = _0x36b62f * _0x423fb3 + (_0x36b62f - 1) * _0x9c910f + _0x58b673 * 2 + _0x2e11b5;
  const _0x3272c2 = toFiniteNumber(_0xc31f01?.x, 0);
  const _0x15fa7a = toFiniteNumber(_0xc31f01?.y, 0);
  const _0x26b280 = toFiniteNumber(_0xc31f01?.width, 300);
  const _0x597cbe = toFiniteNumber(_0xc31f01?.height, 300);
  let _0x53e158 = _0x3272c2 + _0x26b280 + _0x347a07;
  let _0x2c43d2 = _0x15fa7a;
  if (_0x12baec === "down") {
    _0x53e158 = _0x3272c2;
    _0x2c43d2 = _0x15fa7a + _0x597cbe + _0x347a07;
  } else if (_0x12baec === "left") {
    _0x53e158 = _0x3272c2 - _0x347a07 - _0x560d5b;
    _0x2c43d2 = _0x15fa7a;
  }
  if (_0x109e7f) {
    const _0x1b6e6b = findAvailablePosition(nodes, _0x53e158, _0x2c43d2, _0x560d5b, _0x59d51a, _0x347a07, _0x12baec);
    _0x53e158 = _0x1b6e6b.x;
    _0x2c43d2 = _0x1b6e6b.y;
  }
  const _0x6c0764 = _0x53e158 + _0x58b673;
  const _0x23abce = _0x2c43d2 + _0x58b673 + _0x2e11b5;
  const _0x49759a = _0x137384 => {
    const _0x3a01be = Math.max(0, Math.trunc(Number(_0x137384)) || 0);
    const _0x38d8f1 = _0x12baec === "down" ? Math.floor(_0x3a01be / _0x36b62f) : _0x3a01be % _0x31453f;
    const _0x4dab39 = _0x12baec === "down" ? _0x3a01be % _0x36b62f : Math.floor(_0x3a01be / _0x31453f);
    return {
      x: _0x6c0764 + _0x38d8f1 * (_0x350556 + _0x9c910f),
      y: _0x23abce + _0x4dab39 * (_0x423fb3 + _0x9c910f),
      col: _0x38d8f1,
      row: _0x4dab39
    };
  };
  return {
    direction: _0x12baec,
    spacing: _0x347a07,
    itemGap: _0x9c910f,
    columns: _0x31453f,
    rows: _0x36b62f,
    groupX: _0x53e158,
    groupY: _0x2c43d2,
    groupWidth: _0x560d5b,
    groupHeight: _0x59d51a,
    itemStartX: _0x6c0764,
    itemStartY: _0x23abce,
    getItemPosition: _0x49759a
  };
}
export function createDuplicateSpawnOffsets({
  nodes = {},
  sourceNodes = [],
  copies = 1
} = {}) {
  const _0x3dbbbf = (Array.isArray(sourceNodes) ? sourceNodes : []).filter(_0x3a24a5 => _0x3a24a5 && typeof _0x3a24a5 === "object");
  if (_0x3dbbbf.length === 0) {
    return [];
  }
  const _0x1c5532 = getNodeSpawnPrefs();
  const _0x3f9e43 = Math.max(0, toFiniteNumber(_0x1c5532.spacing, 120));
  const _0x5b7053 = normalizeSpawnDirection(_0x1c5532.direction);
  const _0x26debe = _0x1c5532.avoidOverlap !== false;
  const _0x9dc45a = clampPositiveInteger(copies, 1);
  const _0xc7fc01 = Math.min(..._0x3dbbbf.map(_0x18d049 => toFiniteNumber(_0x18d049.x, 0)));
  const _0x5b0bef = Math.min(..._0x3dbbbf.map(_0x5c81fc => toFiniteNumber(_0x5c81fc.y, 0)));
  const _0x78fde6 = Math.max(..._0x3dbbbf.map(_0x30963b => toFiniteNumber(_0x30963b.x, 0) + Math.max(1, toFiniteNumber(_0x30963b.width, 100))));
  const _0x4f0221 = Math.max(..._0x3dbbbf.map(_0x54e8fd => toFiniteNumber(_0x54e8fd.y, 0) + Math.max(1, toFiniteNumber(_0x54e8fd.height, 100))));
  const _0xf21a5b = Math.max(1, _0x78fde6 - _0xc7fc01);
  const _0x2c7a55 = Math.max(1, _0x4f0221 - _0x5b0bef);
  const _0x5601b8 = _0x26debe ? {
    ...(nodes || {})
  } : {};
  const _0x5613b0 = [];
  for (let _0x5701d8 = 1; _0x5701d8 <= _0x9dc45a; _0x5701d8 += 1) {
    let _0x54acbb = _0xc7fc01;
    let _0x4b78d3 = _0x5b0bef;
    if (_0x5b7053 === "down") {
      _0x4b78d3 += (_0x2c7a55 + _0x3f9e43) * _0x5701d8;
    } else if (_0x5b7053 === "left") {
      _0x54acbb -= (_0xf21a5b + _0x3f9e43) * _0x5701d8;
    } else {
      _0x54acbb += (_0xf21a5b + _0x3f9e43) * _0x5701d8;
    }
    if (_0x26debe) {
      const _0x1c696d = findAvailablePosition(_0x5601b8, _0x54acbb, _0x4b78d3, _0xf21a5b, _0x2c7a55, _0x3f9e43, _0x5b7053);
      _0x54acbb = _0x1c696d.x;
      _0x4b78d3 = _0x1c696d.y;
      _0x5601b8["duplicate-spawn-" + _0x5701d8] = {
        x: _0x54acbb,
        y: _0x4b78d3,
        width: _0xf21a5b,
        height: _0x2c7a55
      };
    }
    _0x5613b0.push({
      dx: _0x54acbb - _0xc7fc01,
      dy: _0x4b78d3 - _0x5b0bef
    });
  }
  return _0x5613b0;
}