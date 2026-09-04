export function generateId(_0x1fca35 = "id") {
  return _0x1fca35 + "-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}
export function screenToWorld(_0x43cfaf, _0x4778cc, _0x28939f) {
  const {
    x: _0x11f2b2,
    y: _0x6dc197,
    zoom: _0x2797bd
  } = _0x28939f;
  const _0x46986c = getViewportScreenOrigin(_0x28939f);
  return {
    x: (_0x43cfaf - _0x46986c.x - _0x11f2b2) / _0x2797bd,
    y: (_0x4778cc - _0x46986c.y - _0x6dc197) / _0x2797bd
  };
}
export function worldToScreen(_0x112b1c, _0x2f47ee, _0x174371) {
  const {
    x: _0x412160,
    y: _0x3e15d7,
    zoom: _0x20f4d5
  } = _0x174371;
  const _0x2ed3fa = getViewportScreenOrigin(_0x174371);
  return {
    x: _0x112b1c * _0x20f4d5 + _0x412160 + _0x2ed3fa.x,
    y: _0x2f47ee * _0x20f4d5 + _0x3e15d7 + _0x2ed3fa.y
  };
}
export function getViewportScreenOrigin(_0x253854 = {}) {
  return {
    x: Number.isFinite(Number(_0x253854?._screenOriginX)) ? Number(_0x253854._screenOriginX) : 0,
    y: Number.isFinite(Number(_0x253854?._screenOriginY)) ? Number(_0x253854._screenOriginY) : 0
  };
}
export function screenToViewportPoint(_0x1f2547, _0x139df9, _0x150181 = {}) {
  const _0x281b82 = getViewportScreenOrigin(_0x150181);
  return {
    x: Number(_0x1f2547) - _0x281b82.x,
    y: Number(_0x139df9) - _0x281b82.y
  };
}
export function getViewportScreenBounds(_0x100cbe = {}, _0x35278d = 0, _0x24fe65 = 0) {
  const _0x388c70 = getViewportScreenOrigin(_0x100cbe);
  const _0x5bdb4f = Number.isFinite(Number(_0x35278d)) ? Number(_0x35278d) : 0;
  const _0x2cf126 = Number.isFinite(Number(_0x24fe65)) ? Number(_0x24fe65) : 0;
  const _0x20e427 = Math.max(0, _0x5bdb4f - _0x388c70.x);
  const _0x3ae02f = Math.max(0, _0x2cf126 - _0x388c70.y);
  return {
    left: _0x388c70.x,
    top: _0x388c70.y,
    right: _0x388c70.x + _0x20e427,
    bottom: _0x388c70.y + _0x3ae02f,
    width: _0x20e427,
    height: _0x3ae02f,
    centerX: _0x388c70.x + _0x20e427 / 2,
    centerY: _0x388c70.y + _0x3ae02f / 2
  };
}
export function getViewportScreenCenter(_0x1cce07 = {}, _0x4dddce = 0, _0x5f300a = 0) {
  const _0x4a6094 = getViewportScreenBounds(_0x1cce07, _0x4dddce, _0x5f300a);
  return {
    x: _0x4a6094.centerX,
    y: _0x4a6094.centerY
  };
}
export const CANVAS_GRID_SIZE = 20;
export function snapToCanvasGrid(_0x2bad88, _0x567a05 = CANVAS_GRID_SIZE) {
  const _0x26d876 = Number.isFinite(Number(_0x567a05)) && Number(_0x567a05) > 0 ? Number(_0x567a05) : CANVAS_GRID_SIZE;
  const _0x63013d = Number(_0x2bad88);
  if (!Number.isFinite(_0x63013d)) {
    return 0;
  }
  return Math.round(_0x63013d / _0x26d876) * _0x26d876;
}
export function isPointInRect(_0x353eda, _0x5dcbea, _0x231684, _0x63ac94, _0x4cb264, _0x1efb79) {
  return _0x353eda >= _0x231684 && _0x353eda <= _0x231684 + _0x4cb264 && _0x5dcbea >= _0x63ac94 && _0x5dcbea <= _0x63ac94 + _0x1efb79;
}
export function isRectIntersect(_0x2d74b3, _0x7d3559, _0x3859fb, _0x4cd803, _0xdaf6cb, _0x241ca7, _0x22c99e, _0x4929ee) {
  return !(_0xdaf6cb >= _0x2d74b3 + _0x3859fb) && !(_0xdaf6cb + _0x22c99e <= _0x2d74b3) && !(_0x241ca7 >= _0x7d3559 + _0x4cd803) && !(_0x241ca7 + _0x4929ee <= _0x7d3559);
}
export function clampRectGroupTranslation(_0x3e5f08 = [], _0x9bb9b5 = 0, _0xb4fbd9 = 0, _0x1ab88e = {
  x: 0,
  y: 0,
  width: 1,
  height: 1
}) {
  const _0x115275 = (Array.isArray(_0x3e5f08) ? _0x3e5f08 : []).map(_0x1665cd => ({
    x: Number(_0x1665cd?.x),
    y: Number(_0x1665cd?.y),
    width: Number(_0x1665cd?.width),
    height: Number(_0x1665cd?.height)
  })).filter(_0x52ce8c => Number.isFinite(_0x52ce8c.x) && Number.isFinite(_0x52ce8c.y) && Number.isFinite(_0x52ce8c.width) && _0x52ce8c.width >= 0 && Number.isFinite(_0x52ce8c.height) && _0x52ce8c.height >= 0);
  if (!_0x115275.length) {
    return {
      x: 0,
      y: 0
    };
  }
  const _0x1ac00b = Number.isFinite(Number(_0x1ab88e?.x)) ? Number(_0x1ab88e.x) : 0;
  const _0x2cf595 = Number.isFinite(Number(_0x1ab88e?.y)) ? Number(_0x1ab88e.y) : 0;
  const _0x1f1f79 = Math.max(0, Number(_0x1ab88e?.width) || 0);
  const _0x2311e2 = Math.max(0, Number(_0x1ab88e?.height) || 0);
  const _0x36aba9 = Math.min(..._0x115275.map(_0x4b1960 => _0x4b1960.x));
  const _0x4ad129 = Math.min(..._0x115275.map(_0x4177df => _0x4177df.y));
  const _0x5b5b2e = Math.max(..._0x115275.map(_0x52b556 => _0x52b556.x + _0x52b556.width));
  const _0x380da1 = Math.max(..._0x115275.map(_0x38c797 => _0x38c797.y + _0x38c797.height));
  const _0x3f48aa = Number(_0x9bb9b5) || 0;
  const _0x5c50c6 = Number(_0xb4fbd9) || 0;
  return {
    x: Math.max(_0x1ac00b - _0x36aba9, Math.min(_0x1ac00b + _0x1f1f79 - _0x5b5b2e, _0x3f48aa)),
    y: Math.max(_0x2cf595 - _0x4ad129, Math.min(_0x2cf595 + _0x2311e2 - _0x380da1, _0x5c50c6))
  };
}
export function findAvailablePosition(_0x26b353, _0x1353da, _0x2cd578, _0xa764d2, _0xb07b72, _0x43970f = 20, _0x4efa36 = "right") {
  let _0x5e9209 = _0x1353da;
  let _0x19ae9c = _0x2cd578;
  const _0x549ce7 = Object.values(_0x26b353);
  if (_0x549ce7.length === 0) {
    return {
      x: _0x5e9209,
      y: _0x19ae9c
    };
  }
  let _0x29f775 = true;
  while (_0x29f775) {
    _0x29f775 = false;
    for (const _0x5d67f9 of _0x549ce7) {
      const _0x43e9f5 = _0x5d67f9.x;
      const _0x47309a = _0x5d67f9.y;
      const _0xf8852a = _0x5d67f9.width || 100;
      const _0x52a9b9 = _0x5d67f9.height || 100;
      if (isRectIntersect(_0x5e9209, _0x19ae9c, _0xa764d2, _0xb07b72, _0x43e9f5, _0x47309a, _0xf8852a, _0x52a9b9)) {
        if (_0x4efa36 === "down") {
          _0x19ae9c = _0x47309a + _0x52a9b9 + _0x43970f;
        } else if (_0x4efa36 === "left") {
          _0x5e9209 = _0x43e9f5 - _0x43970f - _0xa764d2;
        } else {
          _0x5e9209 = _0x43e9f5 + _0xf8852a + _0x43970f;
        }
        _0x29f775 = true;
        break;
      }
    }
  }
  return {
    x: _0x5e9209,
    y: _0x19ae9c
  };
}
const ALIGN_SKIP_KEYS = ["isLocked", "locked", "isHidden", "hidden", "isTemp", "temp", "temporary", "ephemeral", "isDeleted", "deleted"];
function _toFiniteNumber(_0x3cb9d2, _0x4f5fbe = 0) {
  const _0x33038a = Number(_0x3cb9d2);
  if (Number.isFinite(_0x33038a)) {
    return _0x33038a;
  } else {
    return _0x4f5fbe;
  }
}
function _toAlignRatio(_0x2a165c, _0x125bf3 = 0.5) {
  return Math.max(0, Math.min(1, _toFiniteNumber(_0x2a165c, _0x125bf3)));
}
function _isAlignableNode(_0x56b037) {
  if (!_0x56b037 || typeof _0x56b037 !== "object") {
    return false;
  }
  for (const _0x1d0e1b of ALIGN_SKIP_KEYS) {
    if (_0x56b037[_0x1d0e1b]) {
      return false;
    }
  }
  return true;
}
export function getAlignableSelectionNodes(_0x32b0be, _0x1fcd7f) {
  if (!_0x32b0be || typeof _0x32b0be !== "object") {
    return [];
  }
  if (!Array.isArray(_0x1fcd7f) || _0x1fcd7f.length === 0) {
    return [];
  }
  const _0xff856b = [];
  for (const _0x45e117 of _0x1fcd7f) {
    const _0x5ee80c = _0x32b0be[_0x45e117];
    if (!_isAlignableNode(_0x5ee80c)) {
      continue;
    }
    const _0x576289 = _toFiniteNumber(_0x5ee80c.x, 0);
    const _0x48d478 = _toFiniteNumber(_0x5ee80c.y, 0);
    const _0x10fd19 = Math.max(0, _toFiniteNumber(_0x5ee80c.width, 0));
    const _0x49f0db = Math.max(0, _toFiniteNumber(_0x5ee80c.height, 0));
    const _0x34f517 = _0x576289;
    const _0x49be61 = _0x576289 + _0x10fd19;
    const _0x13e5ec = _0x48d478;
    const _0x4e536a = _0x48d478 + _0x49f0db;
    _0xff856b.push({
      id: _0x45e117,
      node: _0x5ee80c,
      x: _0x576289,
      y: _0x48d478,
      width: _0x10fd19,
      height: _0x49f0db,
      left: _0x34f517,
      right: _0x49be61,
      top: _0x13e5ec,
      bottom: _0x4e536a,
      cx: _0x34f517 + _0x10fd19 / 2,
      cy: _0x13e5ec + _0x49f0db / 2
    });
  }
  return _0xff856b;
}
export function computeSelectionBounds(_0x357e9c) {
  if (!Array.isArray(_0x357e9c) || _0x357e9c.length === 0) {
    return null;
  }
  let _0x5c04d6 = Infinity;
  let _0x1f5763 = Infinity;
  let _0x4b3beb = -Infinity;
  let _0x327344 = -Infinity;
  for (const _0x1bfe83 of _0x357e9c) {
    _0x5c04d6 = Math.min(_0x5c04d6, _0x1bfe83.left);
    _0x1f5763 = Math.min(_0x1f5763, _0x1bfe83.top);
    _0x4b3beb = Math.max(_0x4b3beb, _0x1bfe83.right);
    _0x327344 = Math.max(_0x327344, _0x1bfe83.bottom);
  }
  if (!Number.isFinite(_0x5c04d6) || !Number.isFinite(_0x1f5763)) {
    return null;
  }
  return {
    minX: _0x5c04d6,
    maxX: _0x4b3beb,
    minY: _0x1f5763,
    maxY: _0x327344,
    width: _0x4b3beb - _0x5c04d6,
    height: _0x327344 - _0x1f5763,
    centerX: (_0x5c04d6 + _0x4b3beb) / 2,
    centerY: (_0x1f5763 + _0x327344) / 2
  };
}
export function computeNodesWorldBounds(_0x4899ca, _0x252ecc = null) {
  const _0x4c7a8f = [];
  if (Array.isArray(_0x4899ca)) {
    _0x4c7a8f.push(..._0x4899ca.filter(Boolean));
  } else if (Array.isArray(_0x252ecc) && _0x252ecc.length > 0) {
    for (const _0x3e7531 of _0x252ecc) {
      const _0x3de7a6 = _0x4899ca?.[_0x3e7531];
      if (_0x3de7a6) {
        _0x4c7a8f.push(_0x3de7a6);
      }
    }
  } else if (_0x4899ca && typeof _0x4899ca === "object") {
    _0x4c7a8f.push(...Object.values(_0x4899ca));
  }
  if (_0x4c7a8f.length === 0) {
    return null;
  }
  let _0x29d4c9 = Infinity;
  let _0x3caf7c = Infinity;
  let _0x3d9b95 = -Infinity;
  let _0x60bef7 = -Infinity;
  for (const _0x4b9f15 of _0x4c7a8f) {
    if (!_0x4b9f15 || typeof _0x4b9f15 !== "object") {
      continue;
    }
    const _0x1b7df9 = _toFiniteNumber(_0x4b9f15.x, 0);
    const _0x3b1e15 = _toFiniteNumber(_0x4b9f15.y, 0);
    const _0x589375 = Math.max(0, _toFiniteNumber(_0x4b9f15.width, 0));
    const _0x1f58e4 = Math.max(0, _toFiniteNumber(_0x4b9f15.height, 0));
    _0x29d4c9 = Math.min(_0x29d4c9, _0x1b7df9);
    _0x3caf7c = Math.min(_0x3caf7c, _0x3b1e15);
    _0x3d9b95 = Math.max(_0x3d9b95, _0x1b7df9 + _0x589375);
    _0x60bef7 = Math.max(_0x60bef7, _0x3b1e15 + _0x1f58e4);
  }
  if (!Number.isFinite(_0x29d4c9) || !Number.isFinite(_0x3caf7c) || !Number.isFinite(_0x3d9b95) || !Number.isFinite(_0x60bef7)) {
    return null;
  }
  return {
    minX: _0x29d4c9,
    minY: _0x3caf7c,
    maxX: _0x3d9b95,
    maxY: _0x60bef7,
    width: Math.max(0, _0x3d9b95 - _0x29d4c9),
    height: Math.max(0, _0x60bef7 - _0x3caf7c),
    centerX: (_0x29d4c9 + _0x3d9b95) / 2,
    centerY: (_0x3caf7c + _0x60bef7) / 2
  };
}
export function computeViewportForWorldBounds(_0x2592f1, _0x5f018e, _0x4de17a = {}) {
  if (!_0x2592f1 || !_0x5f018e) {
    return null;
  }
  const _0x3f6362 = _toFiniteNumber(_0x5f018e.width, 0);
  const _0x29d503 = _toFiniteNumber(_0x5f018e.height, 0);
  if (!(_0x3f6362 > 0) || !(_0x29d503 > 0)) {
    return null;
  }
  const _0xa111a8 = Math.max(1, _toFiniteNumber(_0x2592f1.width, 0));
  const _0x11306f = Math.max(1, _toFiniteNumber(_0x2592f1.height, 0));
  const _0x2a348a = _toFiniteNumber(_0x2592f1.centerX, 0);
  const _0x54c309 = _toFiniteNumber(_0x2592f1.centerY, 0);
  const _0x526bfc = Math.max(0, _toFiniteNumber(_0x4de17a.padding, 0));
  const _0x331804 = Math.max(0.0001, _toFiniteNumber(_0x4de17a.minZoom, 0.2));
  const _0x5b3d44 = Math.max(_0x331804, _toFiniteNumber(_0x4de17a.maxZoom, 2));
  const _0x3c4112 = Number(_0x4de17a.fixedZoom);
  const _0x23477a = _toAlignRatio(_0x4de17a.alignX, 0.5);
  const _0x591992 = _toAlignRatio(_0x4de17a.alignY, 0.5);
  const _0x114b1c = _toAlignRatio(_0x4de17a.worldAlignX, _0x23477a);
  const _0x235b37 = _toAlignRatio(_0x4de17a.worldAlignY, _0x591992);
  const _0x5b6ebb = _toAlignRatio(_0x4de17a.viewportAlignX, _0x23477a);
  const _0x42d98a = _toAlignRatio(_0x4de17a.viewportAlignY, _0x591992);
  const _0x2abf0d = Math.max(1, _0x3f6362 - _0x526bfc * 2);
  const _0x4a711c = Math.max(1, _0x29d503 - _0x526bfc * 2);
  const _0x549e56 = Number.isFinite(_0x3c4112) ? Math.max(_0x331804, Math.min(_0x3c4112, _0x5b3d44)) : Math.max(_0x331804, Math.min(_0x2abf0d / _0xa111a8, _0x4a711c / _0x11306f, _0x5b3d44));
  const _0x5373ad = _toFiniteNumber(_0x5f018e.left, 0) + _0x3f6362 * _0x5b6ebb;
  const _0x191099 = _toFiniteNumber(_0x5f018e.top, 0) + _0x29d503 * _0x42d98a;
  const _0x4b9261 = _toFiniteNumber(_0x2592f1.minX, 0) + _0xa111a8 * _0x114b1c;
  const _0x5b4817 = _toFiniteNumber(_0x2592f1.minY, 0) + _0x11306f * _0x235b37;
  return {
    x: _0x5373ad - _0x4b9261 * _0x549e56,
    y: _0x191099 - _0x5b4817 * _0x549e56,
    zoom: _0x549e56
  };
}
export function computeAlignTargets(_0x21344e, _0x25564c, _0x366937) {
  if (!Array.isArray(_0x21344e) || _0x21344e.length === 0 || !_0x366937) {
    return {};
  }
  const _0x1b1325 = {};
  for (const _0x24f67f of _0x21344e) {
    let _0x1b71b4 = _0x24f67f.x;
    let _0x294540 = _0x24f67f.y;
    if (_0x25564c === "left") {
      _0x1b71b4 = _0x366937.minX;
    } else if (_0x25564c === "h-center") {
      _0x1b71b4 = _0x366937.centerX - _0x24f67f.width / 2;
    } else if (_0x25564c === "right") {
      _0x1b71b4 = _0x366937.maxX - _0x24f67f.width;
    } else if (_0x25564c === "top") {
      _0x294540 = _0x366937.minY;
    } else if (_0x25564c === "v-center") {
      _0x294540 = _0x366937.centerY - _0x24f67f.height / 2;
    } else if (_0x25564c === "bottom") {
      _0x294540 = _0x366937.maxY - _0x24f67f.height;
    }
    _0x1b1325[_0x24f67f.id] = {
      x: _0x1b71b4,
      y: _0x294540
    };
  }
  return _0x1b1325;
}
export function computeDistributeTargets(_0x1c9724, _0x505877, _0x131f27 = undefined) {
  if (!Array.isArray(_0x1c9724) || _0x1c9724.length < 2) {
    return {};
  }
  const _0x279fe7 = _0x505877 === "horizontal";
  const _0x5288c2 = [..._0x1c9724].sort((_0x43bb2b, _0x17c004) => {
    const _0x59202c = _0x279fe7 ? _0x43bb2b.left : _0x43bb2b.top;
    const _0x99d28f = _0x279fe7 ? _0x17c004.left : _0x17c004.top;
    if (_0x59202c !== _0x99d28f) {
      return _0x59202c - _0x99d28f;
    }
    return String(_0x43bb2b.id).localeCompare(String(_0x17c004.id));
  });
  const _0x3cee11 = {};
  for (const _0x18f0ea of _0x5288c2) {
    _0x3cee11[_0x18f0ea.id] = {
      x: _0x18f0ea.x,
      y: _0x18f0ea.y
    };
  }
  if (_0x5288c2.length <= 1) {
    return _0x3cee11;
  }
  const _0x429230 = Number(_0x131f27);
  if (Number.isFinite(_0x429230) && _0x429230 >= 0) {
    let _0x44adc6 = _0x279fe7 ? _0x5288c2[0].left : _0x5288c2[0].top;
    for (let _0x4404af = 0; _0x4404af < _0x5288c2.length; _0x4404af += 1) {
      const _0xe48463 = _0x5288c2[_0x4404af];
      if (_0x4404af === 0) {
        _0x44adc6 += (_0x279fe7 ? _0xe48463.width : _0xe48463.height) + _0x429230;
        continue;
      }
      if (_0x279fe7) {
        _0x3cee11[_0xe48463.id] = {
          x: _0x44adc6,
          y: _0xe48463.y
        };
        _0x44adc6 += _0xe48463.width + _0x429230;
      } else {
        _0x3cee11[_0xe48463.id] = {
          x: _0xe48463.x,
          y: _0x44adc6
        };
        _0x44adc6 += _0xe48463.height + _0x429230;
      }
    }
    return _0x3cee11;
  }
  if (_0x5288c2.length <= 2) {
    return _0x3cee11;
  }
  const _0x4e0ce8 = _0x5288c2[0];
  const _0x579902 = _0x5288c2[_0x5288c2.length - 1];
  const _0xce6ee4 = _0x5288c2.reduce((_0x57151f, _0x50493b) => _0x57151f + (_0x279fe7 ? _0x50493b.width : _0x50493b.height), 0);
  const _0x4517da = _0x279fe7 ? Math.max(0, _0x579902.right - _0x4e0ce8.left) : Math.max(0, _0x579902.bottom - _0x4e0ce8.top);
  const _0x1cf213 = (_0x4517da - _0xce6ee4) / (_0x5288c2.length - 1);
  let _0x29b776 = _0x279fe7 ? _0x4e0ce8.left : _0x4e0ce8.top;
  for (let _0x403d0f = 0; _0x403d0f < _0x5288c2.length; _0x403d0f += 1) {
    const _0x1281c4 = _0x5288c2[_0x403d0f];
    if (_0x403d0f === 0 || _0x403d0f === _0x5288c2.length - 1) {
      _0x29b776 += (_0x279fe7 ? _0x1281c4.width : _0x1281c4.height) + _0x1cf213;
      continue;
    }
    if (_0x279fe7) {
      _0x3cee11[_0x1281c4.id] = {
        x: _0x29b776,
        y: _0x1281c4.y
      };
      _0x29b776 += _0x1281c4.width + _0x1cf213;
    } else {
      _0x3cee11[_0x1281c4.id] = {
        x: _0x1281c4.x,
        y: _0x29b776
      };
      _0x29b776 += _0x1281c4.height + _0x1cf213;
    }
  }
  return _0x3cee11;
}
function _sortLayoutItems(_0x17a23b) {
  return [...(Array.isArray(_0x17a23b) ? _0x17a23b : [])].sort((_0x2ae8f0, _0x100388) => {
    const _0x5446b8 = _toFiniteNumber(_0x2ae8f0?.top ?? _0x2ae8f0?.y, 0);
    const _0x3c582d = _toFiniteNumber(_0x100388?.top ?? _0x100388?.y, 0);
    if (_0x5446b8 !== _0x3c582d) {
      return _0x5446b8 - _0x3c582d;
    }
    const _0x44104f = _toFiniteNumber(_0x2ae8f0?.left ?? _0x2ae8f0?.x, 0);
    const _0x17065b = _toFiniteNumber(_0x100388?.left ?? _0x100388?.x, 0);
    if (_0x44104f !== _0x17065b) {
      return _0x44104f - _0x17065b;
    }
    return String(_0x2ae8f0?.id || "").localeCompare(String(_0x100388?.id || ""));
  });
}
function _medianLayoutMetric(_0x5deadb, _0x1ee7a5, _0x5efc65 = 1) {
  const _0x4051b0 = (Array.isArray(_0x5deadb) ? _0x5deadb : []).map(_0x5493dc => Math.max(0, _toFiniteNumber(_0x5493dc?.[_0x1ee7a5], 0))).filter(_0x133c7a => _0x133c7a > 0).sort((_0x5d24b4, _0x2c06b3) => _0x5d24b4 - _0x2c06b3);
  if (_0x4051b0.length === 0) {
    return _0x5efc65;
  }
  const _0x493032 = Math.floor(_0x4051b0.length / 2);
  if (_0x4051b0.length % 2 === 1) {
    return _0x4051b0[_0x493032];
  }
  return (_0x4051b0[_0x493032 - 1] + _0x4051b0[_0x493032]) / 2;
}
function _sortGridLayoutItems(_0x1de36f) {
  const _0x100a6b = _sortLayoutItems(_0x1de36f);
  if (_0x100a6b.length <= 1) {
    return _0x100a6b;
  }
  const _0x47bfcd = Math.max(8, _medianLayoutMetric(_0x100a6b, "height", 40) * 0.35);
  const _0x5c4ca8 = [];
  for (const _0x4a6c1 of _0x100a6b) {
    const _0x403b6c = _toFiniteNumber(_0x4a6c1?.top ?? _0x4a6c1?.y, 0);
    const _0x3d8161 = Math.max(0, _toFiniteNumber(_0x4a6c1?.height, 0));
    const _0x4e6d49 = _toFiniteNumber(_0x4a6c1?.bottom, _0x403b6c + _0x3d8161);
    const _0x12de27 = _toFiniteNumber(_0x4a6c1?.cy, _0x403b6c + _0x3d8161 / 2);
    let _0x1b5a8e = null;
    let _0x4c9aad = Infinity;
    for (const _0x4aa103 of _0x5c4ca8) {
      const _0x220a5a = Math.min(_0x4aa103.bottom, _0x4e6d49) - Math.max(_0x4aa103.top, _0x403b6c);
      const _0x221348 = Math.max(1, Math.min(_0x4aa103.bottom - _0x4aa103.top, _0x3d8161 || 1));
      const _0x1ee090 = Math.abs(_0x12de27 - _0x4aa103.centerY);
      const _0x58d72f = _0x220a5a >= _0x221348 * 0.25 || _0x1ee090 <= _0x47bfcd;
      if (_0x58d72f && _0x1ee090 < _0x4c9aad) {
        _0x1b5a8e = _0x4aa103;
        _0x4c9aad = _0x1ee090;
      }
    }
    if (!_0x1b5a8e) {
      _0x5c4ca8.push({
        top: _0x403b6c,
        bottom: _0x4e6d49,
        centerY: _0x12de27,
        centerSum: _0x12de27,
        items: [_0x4a6c1]
      });
      continue;
    }
    _0x1b5a8e.items.push(_0x4a6c1);
    _0x1b5a8e.top = Math.min(_0x1b5a8e.top, _0x403b6c);
    _0x1b5a8e.bottom = Math.max(_0x1b5a8e.bottom, _0x4e6d49);
    _0x1b5a8e.centerSum += _0x12de27;
    _0x1b5a8e.centerY = _0x1b5a8e.centerSum / _0x1b5a8e.items.length;
  }
  _0x5c4ca8.sort((_0x358dcc, _0x2deea5) => _0x358dcc.top - _0x2deea5.top);
  return _0x5c4ca8.flatMap(_0x308177 => _0x308177.items.sort((_0x121cf3, _0x6c63cb) => {
    const _0x2e36b0 = _toFiniteNumber(_0x121cf3?.left ?? _0x121cf3?.x, 0);
    const _0x2f7780 = _toFiniteNumber(_0x6c63cb?.left ?? _0x6c63cb?.x, 0);
    if (_0x2e36b0 !== _0x2f7780) {
      return _0x2e36b0 - _0x2f7780;
    }
    return String(_0x121cf3?.id || "").localeCompare(String(_0x6c63cb?.id || ""));
  }));
}
function _resolveGridRelationLayout(_0x1658c6, _0x318fc2) {
  const _0xa37a8b = _sortGridLayoutItems(_0x1658c6);
  const _0xfac442 = new Set(_0xa37a8b.map(_0xa55bae => String(_0xa55bae?.id || "").trim()).filter(Boolean));
  const _0x311091 = [];
  const _0x3ca822 = new Set();
  for (const _0x81332f of Array.isArray(_0x318fc2) ? _0x318fc2 : []) {
    const _0x51e9cb = String(_0x81332f?.sourceId || "").trim();
    const _0x395a9c = String(_0x81332f?.targetId || "").trim();
    if (!_0x51e9cb || !_0x395a9c || _0x51e9cb === _0x395a9c || !_0xfac442.has(_0x51e9cb) || !_0xfac442.has(_0x395a9c)) {
      continue;
    }
    const _0x3dd14b = _0x51e9cb + "\0" + _0x395a9c;
    if (_0x3ca822.has(_0x3dd14b)) {
      continue;
    }
    _0x3ca822.add(_0x3dd14b);
    _0x311091.push({
      sourceId: _0x51e9cb,
      targetId: _0x395a9c
    });
  }
  if (_0x311091.length === 0) {
    return null;
  }
  const _0x2f6270 = new Map(_0xa37a8b.map((_0x40f12c, _0x14fa04) => [String(_0x40f12c.id), _0x14fa04]));
  const _0x508a2a = new Set();
  const _0xc034da = new Map();
  const _0x477005 = new Map();
  const _0x3830f2 = new Map();
  for (const {
    sourceId: _0x17df5a,
    targetId: _0x35b910
  } of _0x311091) {
    _0x508a2a.add(_0x17df5a);
    _0x508a2a.add(_0x35b910);
    if (!_0xc034da.has(_0x17df5a)) {
      _0xc034da.set(_0x17df5a, []);
    }
    _0xc034da.get(_0x17df5a).push(_0x35b910);
    _0x477005.set(_0x35b910, (_0x477005.get(_0x35b910) || 0) + 1);
    if (!_0x477005.has(_0x17df5a)) {
      _0x477005.set(_0x17df5a, 0);
    }
    if (!_0x3830f2.has(_0x17df5a)) {
      _0x3830f2.set(_0x17df5a, 0);
    }
    if (!_0x3830f2.has(_0x35b910)) {
      _0x3830f2.set(_0x35b910, 0);
    }
  }
  const _0x3902d9 = (_0x58aff3, _0xc3d857) => (_0x2f6270.get(_0x58aff3) ?? Number.MAX_SAFE_INTEGER) - (_0x2f6270.get(_0xc3d857) ?? Number.MAX_SAFE_INTEGER) || _0x58aff3.localeCompare(_0xc3d857);
  let _0x58b759 = [..._0x508a2a].filter(_0x3b4895 => (_0x477005.get(_0x3b4895) || 0) === 0).sort(_0x3902d9);
  const _0x5351d6 = new Set();
  while (_0x58b759.length > 0) {
    const _0x5936b0 = _0x58b759;
    _0x58b759 = [];
    for (const _0x358ab1 of _0x5936b0) {
      _0x5351d6.add(_0x358ab1);
      const _0xee9fed = _0x3830f2.get(_0x358ab1) || 0;
      for (const _0x10e6d3 of _0xc034da.get(_0x358ab1) || []) {
        _0x3830f2.set(_0x10e6d3, Math.max(_0x3830f2.get(_0x10e6d3) || 0, _0xee9fed + 1));
        const _0x57621b = (_0x477005.get(_0x10e6d3) || 0) - 1;
        _0x477005.set(_0x10e6d3, _0x57621b);
        if (_0x57621b === 0) {
          _0x58b759.push(_0x10e6d3);
        }
      }
    }
    _0x58b759.sort(_0x3902d9);
  }
  const _0x569a8d = [..._0x508a2a].filter(_0x5684ae => !_0x5351d6.has(_0x5684ae));
  if (_0x569a8d.length > 0) {
    const _0x3a2636 = _0x569a8d.reduce((_0x3edc1a, _0xfc3c9c) => Math.max(_0x3edc1a, _0x3830f2.get(_0xfc3c9c) || 0), 0);
    for (const _0x48ceee of _0x569a8d) {
      _0x3830f2.set(_0x48ceee, _0x3a2636);
    }
  }
  const _0x4826d1 = [..._0x508a2a].reduce((_0x140004, _0x1e2a7e) => Math.max(_0x140004, (_0x3830f2.get(_0x1e2a7e) || 0) + 1), 1);
  return {
    connectedIds: _0x508a2a,
    layerById: _0x3830f2,
    layerCount: _0x4826d1,
    relations: _0x311091
  };
}
function _buildGraphAwareGridPlacements(_0x40b669, _0x519830, _0x43f9b6) {
  const _0x3a43a4 = Array.from({
    length: _0x519830
  }, () => []);
  const _0x5060f0 = new Map();
  _0x40b669.forEach((_0x3dee8e, _0x271666) => {
    const _0x21b3ca = String(_0x3dee8e.id);
    let _0x487537 = _0x43f9b6.connectedIds.has(_0x21b3ca) ? Math.min(_0x519830 - 1, _0x43f9b6.layerById.get(_0x21b3ca) || 0) : _0x271666 % _0x519830;
    if (!_0x43f9b6.connectedIds.has(_0x21b3ca)) {
      const _0x526c35 = Math.min(..._0x3a43a4.map(_0x54d264 => _0x54d264.length));
      for (let _0x5c9467 = 0; _0x5c9467 < _0x519830; _0x5c9467 += 1) {
        const _0x54f708 = (_0x487537 + _0x5c9467) % _0x519830;
        if (_0x3a43a4[_0x54f708].length === _0x526c35) {
          _0x487537 = _0x54f708;
          break;
        }
      }
    }
    _0x3a43a4[_0x487537].push(_0x3dee8e);
    _0x5060f0.set(_0x21b3ca, _0x487537);
  });
  const _0x5babff = new Map(_0x40b669.map(_0x517e27 => [String(_0x517e27.id), _0x517e27]));
  const _0x424140 = new Map(_0x40b669.map((_0x15865b, _0x8ce4d5) => [String(_0x15865b.id), _0x8ce4d5]));
  const _0x3fefc4 = new Map();
  for (const {
    sourceId: _0x564c10,
    targetId: _0x558de9
  } of _0x43f9b6.relations) {
    if (_0x5060f0.get(_0x564c10) === _0x5060f0.get(_0x558de9)) {
      continue;
    }
    if (!_0x3fefc4.has(_0x564c10)) {
      _0x3fefc4.set(_0x564c10, []);
    }
    if (!_0x3fefc4.has(_0x558de9)) {
      _0x3fefc4.set(_0x558de9, []);
    }
    _0x3fefc4.get(_0x564c10).push(_0x558de9);
    _0x3fefc4.get(_0x558de9).push(_0x564c10);
  }
  const _0x1e24de = new Map();
  const _0x11574d = _0x376ad1 => {
    _0x3a43a4[_0x376ad1].forEach((_0x297942, _0x42f3ff) => {
      _0x1e24de.set(String(_0x297942.id), _0x42f3ff);
    });
  };
  _0x3a43a4.forEach((_0x59c34c, _0x477a75) => _0x11574d(_0x477a75));
  const _0x3535b8 = (_0x53f376, _0x2ff1b8, _0x34d74d) => {
    const _0x4c43e2 = (_0x3fefc4.get(_0x53f376) || []).filter(_0x8b5752 => {
      const _0x388479 = _0x5060f0.get(_0x8b5752);
      if (_0x34d74d > 0) {
        return _0x388479 < _0x2ff1b8;
      } else {
        return _0x388479 > _0x2ff1b8;
      }
    }).map(_0xcf7a1b => _0x1e24de.get(_0xcf7a1b)).filter(Number.isFinite).sort((_0x4ce65c, _0x44ad84) => _0x4ce65c - _0x44ad84);
    if (_0x4c43e2.length === 0) {
      return null;
    }
    const _0x430f6f = Math.floor(_0x4c43e2.length / 2);
    if (_0x4c43e2.length % 2 === 1) {
      return _0x4c43e2[_0x430f6f];
    } else {
      return (_0x4c43e2[_0x430f6f - 1] + _0x4c43e2[_0x430f6f]) / 2;
    }
  };
  const _0x58d165 = _0x3270e3 => {
    const _0x5a32b7 = _0x3270e3 > 0 ? 1 : _0x519830 - 2;
    const _0x89f960 = _0x3270e3 > 0 ? _0x519830 : -1;
    for (let _0x1f2c83 = _0x5a32b7; _0x1f2c83 !== _0x89f960; _0x1f2c83 += _0x3270e3) {
      const _0x462dee = new Map(_0x3a43a4[_0x1f2c83].map((_0x12865d, _0x2f111a) => [String(_0x12865d.id), _0x2f111a]));
      const _0x57cebe = new Map(_0x3a43a4[_0x1f2c83].map(_0x293519 => {
        const _0xd6cd10 = String(_0x293519.id);
        return [_0xd6cd10, _0x3535b8(_0xd6cd10, _0x1f2c83, _0x3270e3)];
      }));
      _0x3a43a4[_0x1f2c83].sort((_0x292114, _0x22f901) => {
        const _0x321f90 = String(_0x292114.id);
        const _0x58d22e = String(_0x22f901.id);
        const _0x1b436e = _0x57cebe.get(_0x321f90);
        const _0xd9f011 = _0x57cebe.get(_0x58d22e);
        const _0x7c7950 = _0x1b436e ?? _0x462dee.get(_0x321f90) ?? 0;
        const _0x2b1ced = _0xd9f011 ?? _0x462dee.get(_0x58d22e) ?? 0;
        if (_0x7c7950 !== _0x2b1ced) {
          return _0x7c7950 - _0x2b1ced;
        }
        return (_0x462dee.get(_0x321f90) ?? 0) - (_0x462dee.get(_0x58d22e) ?? 0) || (_0x424140.get(_0x321f90) ?? Number.MAX_SAFE_INTEGER) - (_0x424140.get(_0x58d22e) ?? Number.MAX_SAFE_INTEGER) || _0x321f90.localeCompare(_0x58d22e);
      });
      _0x11574d(_0x1f2c83);
    }
  };
  for (let _0x5576d7 = 0; _0x5576d7 < 2; _0x5576d7 += 1) {
    _0x58d165(1);
    _0x58d165(-1);
  }
  const _0x2af481 = _0x43f9b6.relations.filter(({
    sourceId: _0x5e80af,
    targetId: _0x2d10e9
  }) => _0x5060f0.get(_0x5e80af) !== _0x5060f0.get(_0x2d10e9));
  const _0x192812 = new Map();
  const _0x51e8e6 = new Map();
  for (const {
    sourceId: _0xc0c124,
    targetId: _0x35cff0
  } of _0x2af481) {
    _0x192812.set(_0xc0c124, (_0x192812.get(_0xc0c124) || 0) + 1);
    _0x51e8e6.set(_0x35cff0, (_0x51e8e6.get(_0x35cff0) || 0) + 1);
  }
  const _0x384999 = new Map(_0x40b669.map(_0x499549 => [String(_0x499549.id), String(_0x499549.id)]));
  const _0x245a11 = new Map(_0x40b669.map(_0x13595c => {
    const _0x47806e = String(_0x13595c.id);
    return [_0x47806e, new Set([_0x5060f0.get(_0x47806e)])];
  }));
  const _0xd06de7 = _0x1a1900 => {
    let _0x5caa35 = _0x1a1900;
    while (_0x384999.get(_0x5caa35) !== _0x5caa35) {
      _0x5caa35 = _0x384999.get(_0x5caa35);
    }
    let _0x568ef4 = _0x1a1900;
    while (_0x384999.get(_0x568ef4) !== _0x5caa35) {
      const _0x4aad51 = _0x384999.get(_0x568ef4);
      _0x384999.set(_0x568ef4, _0x5caa35);
      _0x568ef4 = _0x4aad51;
    }
    return _0x5caa35;
  };
  const _0xf2c79e = (_0x1ba86c, _0xb45a84) => {
    const _0x105b42 = _0xd06de7(_0x1ba86c);
    const _0x20cbf3 = _0xd06de7(_0xb45a84);
    if (_0x105b42 === _0x20cbf3) {
      return true;
    }
    const _0x4fb9ab = _0x245a11.get(_0x105b42) || new Set();
    const _0x412ec6 = _0x245a11.get(_0x20cbf3) || new Set();
    if ([..._0x4fb9ab].some(_0x245691 => _0x412ec6.has(_0x245691))) {
      return false;
    }
    const _0x14e6dd = (_0x424140.get(_0x105b42) ?? Number.MAX_SAFE_INTEGER) <= (_0x424140.get(_0x20cbf3) ?? Number.MAX_SAFE_INTEGER);
    const _0x3a7cd5 = _0x14e6dd ? _0x105b42 : _0x20cbf3;
    const _0x52bc72 = _0x14e6dd ? _0x20cbf3 : _0x105b42;
    _0x384999.set(_0x52bc72, _0x3a7cd5);
    _0x245a11.set(_0x3a7cd5, new Set([..._0x4fb9ab, ..._0x412ec6]));
    _0x245a11.delete(_0x52bc72);
    return true;
  };
  _0x2af481.sort((_0x49aa4e, _0x296929) => {
    const _0x5ee716 = _0x192812.get(_0x49aa4e.sourceId) === 1 && _0x51e8e6.get(_0x49aa4e.targetId) === 1;
    const _0x38e2a0 = _0x192812.get(_0x296929.sourceId) === 1 && _0x51e8e6.get(_0x296929.targetId) === 1;
    if (_0x5ee716 !== _0x38e2a0) {
      if (_0x5ee716) {
        return -1;
      } else {
        return 1;
      }
    }
    const _0x52055c = _0x192812.get(_0x49aa4e.sourceId) === 1 || _0x51e8e6.get(_0x49aa4e.targetId) === 1;
    const _0x37ccba = _0x192812.get(_0x296929.sourceId) === 1 || _0x51e8e6.get(_0x296929.targetId) === 1;
    if (_0x52055c !== _0x37ccba) {
      if (_0x52055c) {
        return -1;
      } else {
        return 1;
      }
    }
    const _0x10004f = Math.abs(_0x5060f0.get(_0x49aa4e.sourceId) - _0x5060f0.get(_0x49aa4e.targetId));
    const _0x13eaeb = Math.abs(_0x5060f0.get(_0x296929.sourceId) - _0x5060f0.get(_0x296929.targetId));
    if (_0x10004f !== _0x13eaeb) {
      return _0x10004f - _0x13eaeb;
    }
    const _0x3b654e = Math.abs((_0x1e24de.get(_0x49aa4e.sourceId) || 0) - (_0x1e24de.get(_0x49aa4e.targetId) || 0));
    const _0x51b354 = Math.abs((_0x1e24de.get(_0x296929.sourceId) || 0) - (_0x1e24de.get(_0x296929.targetId) || 0));
    if (_0x3b654e !== _0x51b354) {
      return _0x3b654e - _0x51b354;
    }
    const _0x3c3cf5 = _0x5babff.get(_0x49aa4e.sourceId);
    const _0x21dd62 = _0x5babff.get(_0x49aa4e.targetId);
    const _0x3ff503 = _0x5babff.get(_0x296929.sourceId);
    const _0x38fde6 = _0x5babff.get(_0x296929.targetId);
    const _0x1c05bc = Math.abs((_0x3c3cf5?.cy || 0) - (_0x21dd62?.cy || 0));
    const _0x1b4637 = Math.abs((_0x3ff503?.cy || 0) - (_0x38fde6?.cy || 0));
    if (_0x1c05bc !== _0x1b4637) {
      return _0x1c05bc - _0x1b4637;
    }
    const _0x40b81d = (_0x424140.get(_0x49aa4e.sourceId) || 0) - (_0x424140.get(_0x296929.sourceId) || 0);
    if (_0x40b81d !== 0) {
      return _0x40b81d;
    }
    return (_0x424140.get(_0x49aa4e.targetId) || 0) - (_0x424140.get(_0x296929.targetId) || 0);
  }).forEach(({
    sourceId: _0x17a7a2,
    targetId: _0x1216d5
  }) => _0xf2c79e(_0x17a7a2, _0x1216d5));
  const _0x55c017 = new Map();
  _0x40b669.forEach((_0x2eba3b, _0x5654e3) => {
    const _0x3fabb0 = String(_0x2eba3b.id);
    const _0xc09edd = _0xd06de7(_0x3fabb0);
    if (!_0x55c017.has(_0xc09edd)) {
      _0x55c017.set(_0xc09edd, {
        firstIndex: _0x5654e3,
        items: []
      });
    }
    const _0x5eb308 = _0x55c017.get(_0xc09edd);
    _0x5eb308.firstIndex = Math.min(_0x5eb308.firstIndex, _0x5654e3);
    _0x5eb308.items.push(_0x2eba3b);
  });
  const _0x33b55a = [..._0x55c017.values()].sort((_0x2d09e4, _0x28f28a) => _0x2d09e4.firstIndex - _0x28f28a.firstIndex);
  return {
    placements: _0x33b55a.flatMap((_0x53092a, _0x2aef4d) => _0x53092a.items.map(_0x3ef198 => ({
      item: _0x3ef198,
      col: _0x5060f0.get(String(_0x3ef198.id)),
      row: _0x2aef4d
    }))),
    rowCount: _0x33b55a.length
  };
}
export function resolveArrangeGridColumns(_0x1078b4, _0x1132ac = {}) {
  const _0x37b87e = Array.isArray(_0x1078b4) ? _0x1078b4.filter(Boolean) : [];
  if (_0x37b87e.length <= 1) {
    return Math.max(1, _0x37b87e.length);
  }
  const _0x2d1c84 = Number(_0x1132ac.columns);
  if (Number.isFinite(_0x2d1c84) && _0x2d1c84 > 0) {
    return Math.max(1, Math.trunc(_0x2d1c84));
  }
  const _0x80bd59 = computeSelectionBounds(_0x37b87e);
  const _0x4b37b5 = Math.max(0, _toFiniteNumber(_0x1132ac.gapX ?? _0x1132ac.gap, 40));
  const _0x2ce4a7 = Math.max(0, _toFiniteNumber(_0x1132ac.gapY ?? _0x1132ac.gap, 40));
  const _0x52ea69 = _medianLayoutMetric(_0x37b87e, "width", 1);
  const _0x3ebb67 = _medianLayoutMetric(_0x37b87e, "height", 1);
  const _0x42479b = Number(_0x1132ac.targetAspect);
  const _0x50e60b = _0x80bd59 && _0x80bd59.height > 0 ? _0x80bd59.width / _0x80bd59.height : 1;
  const _0x1e2cfc = Math.max(0.75, Math.min(16 / 9, Number.isFinite(_0x42479b) && _0x42479b > 0 ? _0x42479b : _0x50e60b));
  const _0x1629d0 = Number(_0x1132ac.maxColumns);
  const _0x154bbd = Math.min(_0x37b87e.length, Number.isFinite(_0x1629d0) && _0x1629d0 > 0 ? Math.max(2, Math.trunc(_0x1629d0)) : 6);
  let _0x135d88 = 2;
  let _0xb18e56 = Infinity;
  for (let _0x203ae0 = 2; _0x203ae0 <= _0x154bbd; _0x203ae0 += 1) {
    const _0x3f7256 = Math.ceil(_0x37b87e.length / _0x203ae0);
    const _0x2eb3ba = _0x203ae0 * _0x52ea69 + (_0x203ae0 - 1) * _0x4b37b5;
    const _0x27785d = _0x3f7256 * _0x3ebb67 + (_0x3f7256 - 1) * _0x2ce4a7;
    const _0x3ac54a = _0x2eb3ba / Math.max(1, _0x27785d);
    const _0x36d6ae = Math.abs(Math.log(_0x3ac54a / _0x1e2cfc));
    const _0x6b38e = (_0x203ae0 * _0x3f7256 - _0x37b87e.length) / _0x37b87e.length;
    const _0x57ea32 = _0x36d6ae + _0x6b38e * 0.9;
    if (_0x57ea32 < _0xb18e56 - 1e-9) {
      _0xb18e56 = _0x57ea32;
      _0x135d88 = _0x203ae0;
    }
  }
  const _0x5b3c6d = _resolveGridRelationLayout(_0x37b87e, _0x1132ac.relations);
  if (_0x5b3c6d) {
    _0x135d88 = Math.max(_0x135d88, Math.min(_0x154bbd, _0x5b3c6d.layerCount));
  }
  return _0x135d88;
}
export function computeArrangeRowTargets(_0x49e8c2, _0x376263 = {}) {
  const _0x2eea0e = _sortLayoutItems(_0x49e8c2);
  if (_0x2eea0e.length === 0) {
    return {};
  }
  const _0x42ba06 = computeSelectionBounds(_0x2eea0e);
  if (!_0x42ba06) {
    return {};
  }
  const _0x942f08 = Math.max(0, _toFiniteNumber(_0x376263.gap, 40));
  const _0x36af59 = String(_0x376263.align || "top");
  let _0x5b7bf7 = _0x42ba06.minX;
  const _0x432d0c = {};
  for (const _0x4be778 of _0x2eea0e) {
    let _0x2f5760 = _0x42ba06.minY;
    if (_0x36af59 === "center" || _0x36af59 === "middle") {
      _0x2f5760 = _0x42ba06.centerY - _0x4be778.height / 2;
    } else if (_0x36af59 === "bottom") {
      _0x2f5760 = _0x42ba06.maxY - _0x4be778.height;
    }
    _0x432d0c[_0x4be778.id] = {
      x: _0x5b7bf7,
      y: _0x2f5760
    };
    _0x5b7bf7 += _0x4be778.width + _0x942f08;
  }
  return _0x432d0c;
}
export function computeArrangeColumnTargets(_0x128aa7, _0x1e99ea = {}) {
  const _0x270f97 = _sortLayoutItems(_0x128aa7);
  if (_0x270f97.length === 0) {
    return {};
  }
  const _0xdd9a31 = computeSelectionBounds(_0x270f97);
  if (!_0xdd9a31) {
    return {};
  }
  const _0x17d786 = Math.max(0, _toFiniteNumber(_0x1e99ea.gap, 40));
  const _0x164cd2 = String(_0x1e99ea.align || "left");
  let _0x140828 = _0xdd9a31.minY;
  const _0xe8c83 = {};
  for (const _0x25b80e of _0x270f97) {
    let _0x597c79 = _0xdd9a31.minX;
    if (_0x164cd2 === "center" || _0x164cd2 === "middle") {
      _0x597c79 = _0xdd9a31.centerX - _0x25b80e.width / 2;
    } else if (_0x164cd2 === "right") {
      _0x597c79 = _0xdd9a31.maxX - _0x25b80e.width;
    }
    _0xe8c83[_0x25b80e.id] = {
      x: _0x597c79,
      y: _0x140828
    };
    _0x140828 += _0x25b80e.height + _0x17d786;
  }
  return _0xe8c83;
}
export function computeArrangeGridTargets(_0x9527f8, _0x5cc69 = {}) {
  const _0x2967c2 = _sortGridLayoutItems(_0x9527f8);
  if (_0x2967c2.length === 0) {
    return {};
  }
  const _0x2ed625 = computeSelectionBounds(_0x2967c2);
  if (!_0x2ed625) {
    return {};
  }
  const _0x28293c = Math.max(0, _toFiniteNumber(_0x5cc69.gapX ?? _0x5cc69.gap, 40));
  const _0x477e7b = Math.max(0, _toFiniteNumber(_0x5cc69.gapY ?? _0x5cc69.gap, 40));
  const _0x5ea319 = resolveArrangeGridColumns(_0x2967c2, {
    ..._0x5cc69,
    gapX: _0x28293c,
    gapY: _0x477e7b
  });
  const _0xf71100 = _resolveGridRelationLayout(_0x2967c2, _0x5cc69.relations);
  let _0x2282d4;
  let _0x2d61ed;
  if (_0xf71100) {
    ({
      placements: _0x2282d4,
      rowCount: _0x2d61ed
    } = _buildGraphAwareGridPlacements(_0x2967c2, _0x5ea319, _0xf71100));
  } else {
    const _0x1b3bfa = Array.from({
      length: _0x5ea319
    }, () => []);
    _0x2967c2.forEach((_0x433acb, _0x569556) => {
      _0x1b3bfa[_0x569556 % _0x5ea319].push(_0x433acb);
    });
    _0x2282d4 = _0x1b3bfa.flatMap((_0x1a6608, _0x10bedc) => _0x1a6608.map((_0x536fe7, _0x46678d) => ({
      item: _0x536fe7,
      col: _0x10bedc,
      row: _0x46678d
    })));
    _0x2d61ed = Math.max(..._0x1b3bfa.map(_0x442fe7 => _0x442fe7.length));
  }
  const _0x2e7b8b = Array(_0x5ea319).fill(0);
  const _0x3fde20 = Array(_0x2d61ed).fill(0);
  _0x2282d4.forEach(({
    item: _0x116e67,
    col: _0x21aad3,
    row: _0x361544
  }) => {
    _0x2e7b8b[_0x21aad3] = Math.max(_0x2e7b8b[_0x21aad3], _0x116e67.width);
    _0x3fde20[_0x361544] = Math.max(_0x3fde20[_0x361544], _0x116e67.height);
  });
  const _0x14827f = [];
  const _0x101762 = [];
  let _0x1f10d9 = 0;
  let _0x8b7f92 = 0;
  for (const _0x4658c0 of _0x2e7b8b) {
    _0x14827f.push(_0x1f10d9);
    _0x1f10d9 += _0x4658c0 + _0x28293c;
  }
  for (const _0x54ddc3 of _0x3fde20) {
    _0x101762.push(_0x8b7f92);
    _0x8b7f92 += _0x54ddc3 + _0x477e7b;
  }
  const _0x1b1d9a = {};
  _0x2282d4.forEach(({
    item: _0x5889cb,
    col: _0x845a9e,
    row: _0xef9be5
  }) => {
    const _0x4fd5be = _0xf71100 ? _0x2e7b8b[_0x845a9e] - _0x5889cb.width : 0;
    const _0x47f23b = _0xf71100 ? (_0x3fde20[_0xef9be5] - _0x5889cb.height) / 2 : 0;
    _0x1b1d9a[_0x5889cb.id] = {
      x: _0x2ed625.minX + _0x14827f[_0x845a9e] + _0x4fd5be,
      y: _0x2ed625.minY + _0x101762[_0xef9be5] + _0x47f23b
    };
  });
  return _0x1b1d9a;
}
export function computeMoveNearNodeTargets(_0x2720ca, _0x2e19eb, _0x4940b2 = {}) {
  const _0x3dc50b = Array.isArray(_0x2720ca) ? _0x2720ca.filter(Boolean) : [];
  if (_0x3dc50b.length === 0 || !_0x2e19eb) {
    return {};
  }
  const _0x352570 = computeSelectionBounds(_0x3dc50b);
  if (!_0x352570) {
    return {};
  }
  const _0x106548 = Math.max(0, _toFiniteNumber(_0x4940b2.gap, 40));
  const _0x1e2dea = String(_0x4940b2.placement || "right");
  let _0x598849 = _0x352570.minX;
  let _0x36e116 = _0x352570.minY;
  if (_0x1e2dea === "left") {
    _0x598849 = _0x2e19eb.left - _0x106548 - _0x352570.width;
    _0x36e116 = _0x2e19eb.cy - _0x352570.height / 2;
  } else if (_0x1e2dea === "top") {
    _0x598849 = _0x2e19eb.cx - _0x352570.width / 2;
    _0x36e116 = _0x2e19eb.top - _0x106548 - _0x352570.height;
  } else if (_0x1e2dea === "bottom") {
    _0x598849 = _0x2e19eb.cx - _0x352570.width / 2;
    _0x36e116 = _0x2e19eb.bottom + _0x106548;
  } else {
    _0x598849 = _0x2e19eb.right + _0x106548;
    _0x36e116 = _0x2e19eb.cy - _0x352570.height / 2;
  }
  const _0x4bd94b = _0x598849 - _0x352570.minX;
  const _0x3b5c7c = _0x36e116 - _0x352570.minY;
  const _0x58414f = {};
  for (const _0x3c33f0 of _0x3dc50b) {
    _0x58414f[_0x3c33f0.id] = {
      x: _0x3c33f0.x + _0x4bd94b,
      y: _0x3c33f0.y + _0x3b5c7c
    };
  }
  return _0x58414f;
}
export function buildNodeOffsetPlan(_0x166a7f, _0xb10d95) {
  if (!_0x166a7f || typeof _0x166a7f !== "object") {
    return {};
  }
  if (!_0xb10d95 || typeof _0xb10d95 !== "object") {
    return {};
  }
  const _0x45a7a5 = {};
  for (const [_0x398e3c, _0x1c564d] of Object.entries(_0xb10d95)) {
    const _0x2b5197 = _0x166a7f[_0x398e3c];
    if (!_0x2b5197 || !_0x1c564d) {
      continue;
    }
    const _0xc73716 = _toFiniteNumber(_0x2b5197.x, 0);
    const _0x26b035 = _toFiniteNumber(_0x2b5197.y, 0);
    const _0x3e5982 = _toFiniteNumber(_0x1c564d.x, _0xc73716);
    const _0x3e6b7c = _toFiniteNumber(_0x1c564d.y, _0x26b035);
    const _0x1c1dc5 = _0x3e5982 - _0xc73716;
    const _0x412f4f = _0x3e6b7c - _0x26b035;
    if (Math.abs(_0x1c1dc5) < 0.000001 && Math.abs(_0x412f4f) < 0.000001) {
      continue;
    }
    _0x45a7a5[_0x398e3c] = {
      dx: _0x1c1dc5,
      dy: _0x412f4f
    };
  }
  return _0x45a7a5;
}
export function resolveSnapThresholdInWorld(_0x3c3970, _0x5f1589 = 8) {
  const _0x56f834 = Number.isFinite(_0x3c3970) && _0x3c3970 > 0 ? _0x3c3970 : 1;
  const _0xb5f78b = Number.isFinite(_0x5f1589) ? _0x5f1589 : 8;
  return _0xb5f78b / _0x56f834;
}
export function computeSingleNodeSnapGuides(_0x3ce095) {
  const {
    nodesById: _0x154167,
    dragNodeId: _0x5dd2fe,
    proposedX: _0x383842,
    proposedY: _0x36211a,
    width: _0x279046,
    height: _0xe35880,
    viewport: _0x1d261e,
    thresholdPx = 8,
    spatialIndex = null
  } = _0x3ce095 || {};
  const _0x2cb402 = _toFiniteNumber(_0x383842, 0);
  const _0x4edf6d = _toFiniteNumber(_0x36211a, 0);
  const _0x5f545c = _toFiniteNumber(_0x1d261e?.x, 0);
  const _0x146ec5 = _toFiniteNumber(_0x1d261e?.y, 0);
  const _0x468a08 = _toFiniteNumber(_0x1d261e?.zoom, 1) || 1;
  const _0x5eae3e = Math.max(0, _toFiniteNumber(_0x279046, 200));
  const _0x1e5a2e = Math.max(0, _toFiniteNumber(_0xe35880, 200));
  const _0x4f0065 = {
    snappedX: _0x2cb402,
    snappedY: _0x4edf6d,
    guideLines: []
  };
  if (!_0x154167 || typeof _0x154167 !== "object" || !_0x5dd2fe || !_0x154167[_0x5dd2fe]) {
    return _0x4f0065;
  }
  const _0x4c9118 = resolveSnapThresholdInWorld(_0x468a08, thresholdPx);
  const _0x47bf5e = _0x2cb402;
  const _0x11daf8 = _0x2cb402 + _0x5eae3e;
  const _0x7da10e = _0x4edf6d;
  const _0xf0e82e = _0x4edf6d + _0x1e5a2e;
  let _0x4e2dd8 = null;
  let _0x3dd6b2 = null;
  let _0x238b13 = null;
  let _0x15ae33 = null;
  const _0x9a1a0c = spatialIndex ? getNodeSpatialQueryNodes(_0x154167, collectSnapSearchCandidateIds(spatialIndex, {
    x: _0x2cb402,
    y: _0x4edf6d,
    width: _0x5eae3e,
    height: _0x1e5a2e
  }, _0x4c9118)) : Object.values(_0x154167);
  for (const _0x316d45 of _0x9a1a0c) {
    if (!_0x316d45 || _0x316d45.id === _0x5dd2fe) {
      continue;
    }
    const _0x57aa83 = _toFiniteNumber(_0x316d45.x, 0);
    const _0x40c040 = _0x57aa83 + Math.max(0, _toFiniteNumber(_0x316d45.width, 200));
    const _0x2f7dc7 = _toFiniteNumber(_0x316d45.y, 0);
    const _0x3b3d80 = _0x2f7dc7 + Math.max(0, _toFiniteNumber(_0x316d45.height, 200));
    if (_0x4e2dd8 === null) {
      if (Math.abs(_0x47bf5e - _0x57aa83) < _0x4c9118) {
        _0x4e2dd8 = _0x57aa83;
        _0x238b13 = _0x57aa83;
      } else if (Math.abs(_0x47bf5e - _0x40c040) < _0x4c9118) {
        _0x4e2dd8 = _0x40c040;
        _0x238b13 = _0x40c040;
      } else if (Math.abs(_0x11daf8 - _0x57aa83) < _0x4c9118) {
        _0x4e2dd8 = _0x57aa83 - _0x5eae3e;
        _0x238b13 = _0x57aa83;
      } else if (Math.abs(_0x11daf8 - _0x40c040) < _0x4c9118) {
        _0x4e2dd8 = _0x40c040 - _0x5eae3e;
        _0x238b13 = _0x40c040;
      }
    }
    if (_0x3dd6b2 === null) {
      if (Math.abs(_0x7da10e - _0x2f7dc7) < _0x4c9118) {
        _0x3dd6b2 = _0x2f7dc7;
        _0x15ae33 = _0x2f7dc7;
      } else if (Math.abs(_0x7da10e - _0x3b3d80) < _0x4c9118) {
        _0x3dd6b2 = _0x3b3d80;
        _0x15ae33 = _0x3b3d80;
      } else if (Math.abs(_0xf0e82e - _0x2f7dc7) < _0x4c9118) {
        _0x3dd6b2 = _0x2f7dc7 - _0x1e5a2e;
        _0x15ae33 = _0x2f7dc7;
      } else if (Math.abs(_0xf0e82e - _0x3b3d80) < _0x4c9118) {
        _0x3dd6b2 = _0x3b3d80 - _0x1e5a2e;
        _0x15ae33 = _0x3b3d80;
      }
    }
    if (_0x4e2dd8 !== null && _0x3dd6b2 !== null) {
      break;
    }
  }
  const _0x374cd6 = [];
  const _0x4f5972 = [];
  if (_0x4e2dd8 !== null) {
    const _0x53053d = collectSnapMatchNodes(_0x154167, _0x9a1a0c, spatialIndex, "x", _0x238b13);
    for (const _0x1e534a of _0x53053d) {
      if (!_0x1e534a || _0x1e534a.id === _0x5dd2fe) {
        continue;
      }
      const _0x58ab66 = _toFiniteNumber(_0x1e534a.x, 0);
      const _0x385fa8 = _0x58ab66 + Math.max(0, _toFiniteNumber(_0x1e534a.width, 200));
      if (Math.abs(_0x58ab66 - _0x238b13) < SNAP_MATCH_EPSILON || Math.abs(_0x385fa8 - _0x238b13) < SNAP_MATCH_EPSILON) {
        _0x374cd6.push(_0x1e534a);
      }
    }
  }
  if (_0x3dd6b2 !== null) {
    const _0x483408 = collectSnapMatchNodes(_0x154167, _0x9a1a0c, spatialIndex, "y", _0x15ae33);
    for (const _0x509db7 of _0x483408) {
      if (!_0x509db7 || _0x509db7.id === _0x5dd2fe) {
        continue;
      }
      const _0x5d412e = _toFiniteNumber(_0x509db7.y, 0);
      const _0x559689 = _0x5d412e + Math.max(0, _toFiniteNumber(_0x509db7.height, 200));
      if (Math.abs(_0x5d412e - _0x15ae33) < SNAP_MATCH_EPSILON || Math.abs(_0x559689 - _0x15ae33) < SNAP_MATCH_EPSILON) {
        _0x4f5972.push(_0x509db7);
      }
    }
  }
  if (_0x4e2dd8 !== null) {
    _0x4f0065.snappedX = _0x4e2dd8;
    const _0x444035 = _0x4edf6d + (_0x3dd6b2 !== null ? _0x3dd6b2 - _0x4edf6d : 0);
    const _0x3a0258 = _0x444035 + _0x1e5a2e;
    let _0x4e2d9a = _0x444035;
    let _0x2cb850 = _0x3a0258;
    _0x374cd6.forEach(_0x479ed5 => {
      const _0x47e529 = _toFiniteNumber(_0x479ed5.y, 0);
      const _0x7b1ab8 = Math.max(0, _toFiniteNumber(_0x479ed5.height, 200));
      _0x4e2d9a = Math.min(_0x4e2d9a, _0x47e529);
      _0x2cb850 = Math.max(_0x2cb850, _0x47e529 + _0x7b1ab8);
    });
    _0x4f0065.guideLines.push({
      type: "v",
      pos: _0x238b13 * _0x468a08 + _0x5f545c,
      start: _0x4e2d9a * _0x468a08 + _0x146ec5,
      end: _0x2cb850 * _0x468a08 + _0x146ec5
    });
  }
  if (_0x3dd6b2 !== null) {
    _0x4f0065.snappedY = _0x3dd6b2;
    const _0x24303b = _0x2cb402 + (_0x4e2dd8 !== null ? _0x4e2dd8 - _0x2cb402 : 0);
    const _0xfc33d4 = _0x24303b + _0x5eae3e;
    let _0xe9dcd2 = _0x24303b;
    let _0x5e3a02 = _0xfc33d4;
    _0x4f5972.forEach(_0x49b821 => {
      const _0x31231d = _toFiniteNumber(_0x49b821.x, 0);
      const _0x206b4b = Math.max(0, _toFiniteNumber(_0x49b821.width, 200));
      _0xe9dcd2 = Math.min(_0xe9dcd2, _0x31231d);
      _0x5e3a02 = Math.max(_0x5e3a02, _0x31231d + _0x206b4b);
    });
    _0x4f0065.guideLines.push({
      type: "h",
      pos: _0x15ae33 * _0x468a08 + _0x146ec5,
      start: _0xe9dcd2 * _0x468a08 + _0x5f545c,
      end: _0x5e3a02 * _0x468a08 + _0x5f545c
    });
  }
  return _0x4f0065;
}
export function computeMultiNodeSnapGuides(_0x2f3dbc) {
  const {
    nodesById: _0x228c04,
    movingNodeIds: _0x1fc5aa,
    proposedBounds: _0x99d6f8,
    viewport: _0x289a6b,
    thresholdPx = 8,
    spatialIndex = null
  } = _0x2f3dbc || {};
  const _0x22ac14 = _toFiniteNumber(_0x99d6f8?.minX, 0);
  const _0x2308e3 = _toFiniteNumber(_0x99d6f8?.minY, 0);
  const _0x5cf3e1 = Math.max(0, _toFiniteNumber(_0x99d6f8?.width, 0));
  const _0x46cffa = Math.max(0, _toFiniteNumber(_0x99d6f8?.height, 0));
  const _0x58e480 = _toFiniteNumber(_0x289a6b?.x, 0);
  const _0x390d9c = _toFiniteNumber(_0x289a6b?.y, 0);
  const _0x2c2c80 = _toFiniteNumber(_0x289a6b?.zoom, 1) || 1;
  const _0x3270a0 = {
    snappedX: _0x22ac14,
    snappedY: _0x2308e3,
    guideLines: []
  };
  if (!_0x228c04 || typeof _0x228c04 !== "object") {
    return _0x3270a0;
  }
  const _0x322096 = new Set(Array.isArray(_0x1fc5aa) ? _0x1fc5aa.filter(Boolean) : []);
  if (_0x322096.size === 0) {
    return _0x3270a0;
  }
  const _0x1dd924 = resolveSnapThresholdInWorld(_0x2c2c80, thresholdPx);
  const _0x20a2bb = _0x22ac14;
  const _0x4f6684 = _0x22ac14 + _0x5cf3e1;
  const _0x3863c2 = _0x2308e3;
  const _0x15d65 = _0x2308e3 + _0x46cffa;
  let _0x3b4503 = null;
  let _0x1dcb9f = null;
  let _0x193782 = null;
  let _0x31ca21 = null;
  const _0x316660 = spatialIndex ? getNodeSpatialQueryNodes(_0x228c04, collectSnapSearchCandidateIds(spatialIndex, {
    x: _0x22ac14,
    y: _0x2308e3,
    width: _0x5cf3e1,
    height: _0x46cffa
  }, _0x1dd924)) : Object.values(_0x228c04);
  for (const _0x5debbd of _0x316660) {
    if (!_0x5debbd || _0x322096.has(_0x5debbd.id)) {
      continue;
    }
    const _0x183011 = _toFiniteNumber(_0x5debbd.x, 0);
    const _0x323be5 = _0x183011 + Math.max(0, _toFiniteNumber(_0x5debbd.width, 200));
    const _0x56f442 = _toFiniteNumber(_0x5debbd.y, 0);
    const _0x355f79 = _0x56f442 + Math.max(0, _toFiniteNumber(_0x5debbd.height, 200));
    if (_0x3b4503 === null) {
      if (Math.abs(_0x20a2bb - _0x183011) < _0x1dd924) {
        _0x3b4503 = _0x183011;
        _0x193782 = _0x183011;
      } else if (Math.abs(_0x20a2bb - _0x323be5) < _0x1dd924) {
        _0x3b4503 = _0x323be5;
        _0x193782 = _0x323be5;
      } else if (Math.abs(_0x4f6684 - _0x183011) < _0x1dd924) {
        _0x3b4503 = _0x183011 - _0x5cf3e1;
        _0x193782 = _0x183011;
      } else if (Math.abs(_0x4f6684 - _0x323be5) < _0x1dd924) {
        _0x3b4503 = _0x323be5 - _0x5cf3e1;
        _0x193782 = _0x323be5;
      }
    }
    if (_0x1dcb9f === null) {
      if (Math.abs(_0x3863c2 - _0x56f442) < _0x1dd924) {
        _0x1dcb9f = _0x56f442;
        _0x31ca21 = _0x56f442;
      } else if (Math.abs(_0x3863c2 - _0x355f79) < _0x1dd924) {
        _0x1dcb9f = _0x355f79;
        _0x31ca21 = _0x355f79;
      } else if (Math.abs(_0x15d65 - _0x56f442) < _0x1dd924) {
        _0x1dcb9f = _0x56f442 - _0x46cffa;
        _0x31ca21 = _0x56f442;
      } else if (Math.abs(_0x15d65 - _0x355f79) < _0x1dd924) {
        _0x1dcb9f = _0x355f79 - _0x46cffa;
        _0x31ca21 = _0x355f79;
      }
    }
    if (_0x3b4503 !== null && _0x1dcb9f !== null) {
      break;
    }
  }
  const _0x40211f = [];
  const _0x2027ad = [];
  if (_0x3b4503 !== null) {
    const _0x453312 = collectSnapMatchNodes(_0x228c04, _0x316660, spatialIndex, "x", _0x193782);
    for (const _0x3555c6 of _0x453312) {
      if (!_0x3555c6 || _0x322096.has(_0x3555c6.id)) {
        continue;
      }
      const _0x322388 = _toFiniteNumber(_0x3555c6.x, 0);
      const _0x1e6d2e = _0x322388 + Math.max(0, _toFiniteNumber(_0x3555c6.width, 200));
      if (Math.abs(_0x322388 - _0x193782) < SNAP_MATCH_EPSILON || Math.abs(_0x1e6d2e - _0x193782) < SNAP_MATCH_EPSILON) {
        _0x40211f.push(_0x3555c6);
      }
    }
  }
  if (_0x1dcb9f !== null) {
    const _0xb20a5c = collectSnapMatchNodes(_0x228c04, _0x316660, spatialIndex, "y", _0x31ca21);
    for (const _0x413411 of _0xb20a5c) {
      if (!_0x413411 || _0x322096.has(_0x413411.id)) {
        continue;
      }
      const _0x3cea4a = _toFiniteNumber(_0x413411.y, 0);
      const _0x1c2888 = _0x3cea4a + Math.max(0, _toFiniteNumber(_0x413411.height, 200));
      if (Math.abs(_0x3cea4a - _0x31ca21) < SNAP_MATCH_EPSILON || Math.abs(_0x1c2888 - _0x31ca21) < SNAP_MATCH_EPSILON) {
        _0x2027ad.push(_0x413411);
      }
    }
  }
  if (_0x3b4503 !== null) {
    _0x3270a0.snappedX = _0x3b4503;
    const _0xeb99cb = _0x2308e3 + (_0x1dcb9f !== null ? _0x1dcb9f - _0x2308e3 : 0);
    const _0x3f9184 = _0xeb99cb + _0x46cffa;
    let _0x190d20 = _0xeb99cb;
    let _0x1b70b1 = _0x3f9184;
    _0x40211f.forEach(_0x37e6a6 => {
      const _0x58a3e6 = _toFiniteNumber(_0x37e6a6.y, 0);
      const _0x5ee5fb = Math.max(0, _toFiniteNumber(_0x37e6a6.height, 200));
      _0x190d20 = Math.min(_0x190d20, _0x58a3e6);
      _0x1b70b1 = Math.max(_0x1b70b1, _0x58a3e6 + _0x5ee5fb);
    });
    _0x3270a0.guideLines.push({
      type: "v",
      pos: _0x193782 * _0x2c2c80 + _0x58e480,
      start: _0x190d20 * _0x2c2c80 + _0x390d9c,
      end: _0x1b70b1 * _0x2c2c80 + _0x390d9c
    });
  }
  if (_0x1dcb9f !== null) {
    _0x3270a0.snappedY = _0x1dcb9f;
    const _0x1d0181 = _0x22ac14 + (_0x3b4503 !== null ? _0x3b4503 - _0x22ac14 : 0);
    const _0x14d115 = _0x1d0181 + _0x5cf3e1;
    let _0x1b6d97 = _0x1d0181;
    let _0x4846a0 = _0x14d115;
    _0x2027ad.forEach(_0x50cb60 => {
      const _0x2cfb33 = _toFiniteNumber(_0x50cb60.x, 0);
      const _0x2da644 = Math.max(0, _toFiniteNumber(_0x50cb60.width, 200));
      _0x1b6d97 = Math.min(_0x1b6d97, _0x2cfb33);
      _0x4846a0 = Math.max(_0x4846a0, _0x2cfb33 + _0x2da644);
    });
    _0x3270a0.guideLines.push({
      type: "h",
      pos: _0x31ca21 * _0x2c2c80 + _0x390d9c,
      start: _0x1b6d97 * _0x2c2c80 + _0x58e480,
      end: _0x4846a0 * _0x2c2c80 + _0x58e480
    });
  }
  return _0x3270a0;
}
export function calcWorldBounds(_0x3ae804, _0x290a0d = null) {
  const _0x1a7b54 = computeNodesWorldBounds(_0x3ae804);
  if (!_0x1a7b54) {
    if (_0x290a0d) {
      const _0x456ecb = 1920;
      const _0x90a356 = 1080;
      const _0x1e0935 = -_0x290a0d.x / _0x290a0d.zoom;
      const _0x117ae0 = -_0x290a0d.y / _0x290a0d.zoom;
      const _0x274746 = _0x456ecb / _0x290a0d.zoom;
      const _0x4a2433 = _0x90a356 / _0x290a0d.zoom;
      const _0x3ba76f = 600;
      return {
        minX: _0x1e0935 - _0x3ba76f,
        minY: _0x117ae0 - _0x3ba76f,
        maxX: _0x1e0935 + _0x274746 + _0x3ba76f,
        maxY: _0x117ae0 + _0x4a2433 + _0x3ba76f,
        width: _0x274746 + _0x3ba76f * 2,
        height: _0x4a2433 + _0x3ba76f * 2
      };
    }
    return {
      minX: 0,
      minY: 0,
      maxX: 2000,
      maxY: 2000,
      width: 2000,
      height: 2000
    };
  }
  const _0x1deb2d = 600;
  const _0x496690 = _0x1a7b54.minX - _0x1deb2d;
  const _0x445955 = _0x1a7b54.minY - _0x1deb2d;
  const _0x296fb9 = _0x1a7b54.maxX + _0x1deb2d;
  const _0x20727b = _0x1a7b54.maxY + _0x1deb2d;
  return {
    minX: _0x496690,
    minY: _0x445955,
    maxX: _0x296fb9,
    maxY: _0x20727b,
    width: _0x296fb9 - _0x496690,
    height: _0x20727b - _0x445955
  };
}
export function worldToMinimap(_0x2dd8c1, _0x42c385, _0x54641f, _0x37a785) {
  const _0x18734d = Math.max(_0x54641f.width, _0x54641f.height, 1);
  const _0x14533d = _0x37a785 / _0x18734d;
  const _0x6f074e = (_0x2dd8c1 - _0x54641f.minX) * _0x14533d;
  const _0x4b1974 = (_0x42c385 - _0x54641f.minY) * _0x14533d;
  return {
    x: _0x6f074e,
    y: _0x4b1974,
    scale: _0x14533d
  };
}
const DEFAULT_NODE_SPATIAL_INDEX_CELL_SIZE = 240;
const EMPTY_NODE_SPATIAL_QUERY_RESULT = Object.freeze([]);
const SNAP_MATCH_EPSILON = 0.1;
function getNodeSpatialCellCoord(_0x2952ef, _0x220b11) {
  return Math.floor(_0x2952ef / _0x220b11);
}
function getNodeSpatialCellKey(_0x6f1a85, _0x588c70) {
  return _0x6f1a85 + "," + _0x588c70;
}
function normalizeNodeSpatialCellBounds(_0x12eb72) {
  if (!_0x12eb72) {
    return null;
  }
  const _0x5cea78 = Number(_0x12eb72.minX);
  const _0x32eec0 = Number(_0x12eb72.maxX);
  const _0x41f54c = Number(_0x12eb72.minY);
  const _0x2b2e87 = Number(_0x12eb72.maxY);
  if (!Number.isFinite(_0x5cea78) || !Number.isFinite(_0x32eec0) || !Number.isFinite(_0x41f54c) || !Number.isFinite(_0x2b2e87)) {
    return null;
  }
  return {
    minX: _0x5cea78,
    maxX: _0x32eec0,
    minY: _0x41f54c,
    maxY: _0x2b2e87
  };
}
function pushNodeIdToSpatialCell(_0x1b675d, _0x427ab1, _0x1d8aea, _0x44e5da) {
  const _0x52c39c = getNodeSpatialCellKey(_0x427ab1, _0x1d8aea);
  const _0xf2cbe2 = _0x1b675d.get(_0x52c39c);
  if (_0xf2cbe2) {
    _0xf2cbe2.push(_0x44e5da);
    return;
  }
  _0x1b675d.set(_0x52c39c, [_0x44e5da]);
}
function normalizeNodeQueryRect(_0x929f86) {
  if (!_0x929f86 || typeof _0x929f86 !== "object") {
    return null;
  }
  const _0x5be106 = Number(_0x929f86.x);
  const _0x93454c = Number(_0x929f86.y);
  const _0x155620 = Math.max(0, Number(_0x929f86.width) || 0);
  const _0x2eb26e = Math.max(0, Number(_0x929f86.height) || 0);
  if (!Number.isFinite(_0x5be106) || !Number.isFinite(_0x93454c)) {
    return null;
  }
  return {
    x: _0x5be106,
    y: _0x93454c,
    width: _0x155620,
    height: _0x2eb26e
  };
}
function finalizeNodeQueryRect(_0x1763ed, _0x3d9a = {}) {
  const _0x3f4909 = normalizeNodeQueryRect(_0x1763ed);
  if (!_0x3f4909) {
    return null;
  }
  return {
    ..._0x3f4909,
    right: _0x3f4909.x + _0x3f4909.width,
    bottom: _0x3f4909.y + _0x3f4909.height,
    cx: _0x3f4909.x + _0x3f4909.width / 2,
    cy: _0x3f4909.y + _0x3f4909.height / 2,
    ..._0x3d9a
  };
}
function defaultNodeQueryRectResolver(_0x3e33fe) {
  if (!_0x3e33fe || typeof _0x3e33fe !== "object") {
    return null;
  }
  return {
    x: _0x3e33fe.x,
    y: _0x3e33fe.y,
    width: _0x3e33fe.width || 0,
    height: _0x3e33fe.height || 0
  };
}
function normalizeNodeQueryOptions(_0x3acf88 = false, _0x12c4c9 = undefined) {
  const _0x539b62 = _0x3acf88 && typeof _0x3acf88 === "object" ? {
    ..._0x3acf88
  } : {
    ignoreGroup: _0x3acf88 === true
  };
  if (_0x12c4c9 && typeof _0x12c4c9 === "object") {
    Object.assign(_0x539b62, _0x12c4c9);
  }
  _0x539b62.ignoreGroup = _0x539b62.ignoreGroup === true;
  _0x539b62.resolveRect = typeof _0x539b62.resolveRect === "function" ? _0x539b62.resolveRect : defaultNodeQueryRectResolver;
  _0x539b62.candidateFilter = typeof _0x539b62.candidateFilter === "function" ? _0x539b62.candidateFilter : null;
  _0x539b62.spatialIndex = _0x539b62.spatialIndex || null;
  return _0x539b62;
}
function resolveNodeQueryRect(_0x108881, _0x416519, _0x2c917b, _0x4ae7a5 = null) {
  const _0x1a6720 = String(_0x108881?.id || _0x416519 || "").trim();
  if (!_0x1a6720) {
    return null;
  }
  const _0x520d0c = _0x4ae7a5?.nodeRects instanceof Map ? _0x4ae7a5.nodeRects.get(_0x1a6720) : null;
  if (_0x520d0c) {
    return _0x520d0c;
  }
  return finalizeNodeQueryRect(_0x2c917b(_0x108881, _0x1a6720));
}
function iterateNodeSpatialRing(_0x2d292d, _0xacf574, _0x5bd1a7, _0x1b311c) {
  if (_0x5bd1a7 === 0) {
    _0x1b311c(_0x2d292d, _0xacf574);
    return;
  }
  const _0x44d94d = _0x2d292d - _0x5bd1a7;
  const _0x3690d8 = _0x2d292d + _0x5bd1a7;
  const _0x20e689 = _0xacf574 - _0x5bd1a7;
  const _0x6595fb = _0xacf574 + _0x5bd1a7;
  for (let _0x2b8912 = _0x44d94d; _0x2b8912 <= _0x3690d8; _0x2b8912 += 1) {
    _0x1b311c(_0x2b8912, _0x20e689);
    _0x1b311c(_0x2b8912, _0x6595fb);
  }
  for (let _0x1a3bbe = _0x20e689 + 1; _0x1a3bbe < _0x6595fb; _0x1a3bbe += 1) {
    _0x1b311c(_0x44d94d, _0x1a3bbe);
    _0x1b311c(_0x3690d8, _0x1a3bbe);
  }
}
function getPointToCellRectDistSq(_0x930222, _0x5930a2, _0x4711a7, _0x5390f5, _0x2c8127) {
  const _0x4b2b33 = _0x4711a7 * _0x2c8127;
  const _0x5c9e91 = _0x5390f5 * _0x2c8127;
  const _0x1795c2 = _0x4b2b33 + _0x2c8127;
  const _0x19d81b = _0x5c9e91 + _0x2c8127;
  const _0x3eccea = _0x930222 < _0x4b2b33 ? _0x4b2b33 - _0x930222 : _0x930222 > _0x1795c2 ? _0x930222 - _0x1795c2 : 0;
  const _0x4ffee5 = _0x5930a2 < _0x5c9e91 ? _0x5c9e91 - _0x5930a2 : _0x5930a2 > _0x19d81b ? _0x5930a2 - _0x19d81b : 0;
  return _0x3eccea * _0x3eccea + _0x4ffee5 * _0x4ffee5;
}
function getNodeSpatialWorldBounds(_0xece422) {
  const _0x4bf50e = normalizeNodeSpatialCellBounds(_0xece422?.boundsCellBounds);
  if (!_0x4bf50e) {
    return null;
  }
  const _0x54d435 = Number(_0xece422?.cellSize);
  if (!Number.isFinite(_0x54d435) || _0x54d435 <= 0) {
    return null;
  }
  return {
    x: _0x4bf50e.minX * _0x54d435,
    y: _0x4bf50e.minY * _0x54d435,
    width: (_0x4bf50e.maxX - _0x4bf50e.minX + 1) * _0x54d435,
    height: (_0x4bf50e.maxY - _0x4bf50e.minY + 1) * _0x54d435
  };
}
function getNodeSpatialStripeRect(_0x452fc1, _0x322ab1, _0x47122e, _0x1ff81d, _0x116232 = 0) {
  const _0x51d479 = getNodeSpatialWorldBounds(_0x452fc1);
  if (!_0x51d479) {
    return null;
  }
  const _0x60826f = Math.min(_toFiniteNumber(_0x47122e, 0), _toFiniteNumber(_0x1ff81d, 0));
  const _0xf74c34 = Math.max(_toFiniteNumber(_0x47122e, 0), _toFiniteNumber(_0x1ff81d, 0));
  const _0x5588ac = Math.max(0, _toFiniteNumber(_0x116232, 0));
  if (_0x322ab1 === "x") {
    return {
      x: _0x60826f - _0x5588ac,
      y: _0x51d479.y,
      width: Math.max(0, _0xf74c34 - _0x60826f) + _0x5588ac * 2,
      height: _0x51d479.height
    };
  }
  if (_0x322ab1 === "y") {
    return {
      x: _0x51d479.x,
      y: _0x60826f - _0x5588ac,
      width: _0x51d479.width,
      height: Math.max(0, _0xf74c34 - _0x60826f) + _0x5588ac * 2
    };
  }
  return null;
}
function getNodeSpatialQueryNodes(_0x583e22, _0x3c1870) {
  if (!Array.isArray(_0x3c1870) || _0x3c1870.length === 0) {
    return [];
  }
  const _0x3b850e = [];
  for (const _0x1fc429 of _0x3c1870) {
    const _0x2b13b1 = _0x583e22?.[_0x1fc429];
    if (_0x2b13b1) {
      _0x3b850e.push(_0x2b13b1);
    }
  }
  return _0x3b850e;
}
function collectSnapSearchCandidateIds(_0x287d37, _0x3e3a36, _0x4db47f) {
  if (!_0x287d37 || !_0x3e3a36) {
    return EMPTY_NODE_SPATIAL_QUERY_RESULT;
  }
  const _0xb29f25 = getNodeSpatialStripeRect(_0x287d37, "x", _0x3e3a36.x, _0x3e3a36.x + _0x3e3a36.width, _0x4db47f);
  const _0x1b45d1 = getNodeSpatialStripeRect(_0x287d37, "y", _0x3e3a36.y, _0x3e3a36.y + _0x3e3a36.height, _0x4db47f);
  if (!_0xb29f25 && !_0x1b45d1) {
    return EMPTY_NODE_SPATIAL_QUERY_RESULT;
  }
  const _0x49149e = new Set();
  if (_0xb29f25) {
    for (const _0xc08d1e of queryNodeSpatialIndexInRect(_0x287d37, _0xb29f25)) {
      _0x49149e.add(_0xc08d1e);
    }
  }
  if (_0x1b45d1) {
    for (const _0x530ff7 of queryNodeSpatialIndexInRect(_0x287d37, _0x1b45d1)) {
      _0x49149e.add(_0x530ff7);
    }
  }
  if (_0x49149e.size > 0) {
    return Array.from(_0x49149e);
  } else {
    return EMPTY_NODE_SPATIAL_QUERY_RESULT;
  }
}
function collectSnapMatchNodes(_0x3263cc, _0x30a0df, _0x3e83b8, _0x2550fc, _0x4da93d) {
  if (!Number.isFinite(_0x4da93d)) {
    return [];
  }
  if (!_0x3e83b8) {
    return _0x30a0df;
  }
  const _0x50d8c4 = getNodeSpatialStripeRect(_0x3e83b8, _0x2550fc, _0x4da93d, _0x4da93d, SNAP_MATCH_EPSILON);
  if (!_0x50d8c4) {
    return _0x30a0df;
  }
  return getNodeSpatialQueryNodes(_0x3263cc, queryNodeSpatialIndexInRect(_0x3e83b8, _0x50d8c4));
}
function getMinRingToCenterCellBounds(_0x3b5d98, _0x5626c6, _0x1c6610) {
  if (!_0x1c6610) {
    return 0;
  }
  const _0xecb6a7 = _0x3b5d98 < _0x1c6610.minX ? _0x1c6610.minX - _0x3b5d98 : _0x3b5d98 > _0x1c6610.maxX ? _0x3b5d98 - _0x1c6610.maxX : 0;
  const _0x1149de = _0x5626c6 < _0x1c6610.minY ? _0x1c6610.minY - _0x5626c6 : _0x5626c6 > _0x1c6610.maxY ? _0x5626c6 - _0x1c6610.maxY : 0;
  return Math.max(_0xecb6a7, _0x1149de);
}
function doesRingCoverCenterCellBounds(_0x382ec5, _0x5efd41, _0x20d462, _0x1c55d7) {
  if (!_0x1c55d7) {
    return true;
  }
  return _0x382ec5 - _0x20d462 <= _0x1c55d7.minX && _0x382ec5 + _0x20d462 >= _0x1c55d7.maxX && _0x5efd41 - _0x20d462 <= _0x1c55d7.minY && _0x5efd41 + _0x20d462 >= _0x1c55d7.maxY;
}
function getNextRingMinCenterDistSq(_0x34ecde, _0x5bac73, _0x47629f, _0x3776ce, _0x44ef0d, _0xb8a90d) {
  if (!_0x34ecde?.centerCellBounds) {
    return Infinity;
  }
  let _0x411267 = Infinity;
  iterateNodeSpatialRing(_0x3776ce, _0x44ef0d, _0xb8a90d, (_0x2b8d87, _0x1e9e60) => {
    if (_0x2b8d87 < _0x34ecde.centerCellBounds.minX || _0x2b8d87 > _0x34ecde.centerCellBounds.maxX || _0x1e9e60 < _0x34ecde.centerCellBounds.minY || _0x1e9e60 > _0x34ecde.centerCellBounds.maxY) {
      return;
    }
    const _0x115e07 = getPointToCellRectDistSq(_0x5bac73, _0x47629f, _0x2b8d87, _0x1e9e60, _0x34ecde.cellSize);
    if (_0x115e07 < _0x411267) {
      _0x411267 = _0x115e07;
    }
  });
  return _0x411267;
}
function findNearestNodeRectInSpatialIndex(_0x4f39e4, _0x177440, _0x12b761, _0x160506, _0x1ec0ad = {}) {
  if (!_0x4f39e4 || !(_0x4f39e4.centerCells instanceof Map) || !(_0x4f39e4.nodeRects instanceof Map) || !_0x4f39e4.centerCellBounds) {
    return null;
  }
  const _0x2ebbd3 = getNodeSpatialCellCoord(_0x12b761, _0x4f39e4.cellSize);
  const _0x340bf8 = getNodeSpatialCellCoord(_0x160506, _0x4f39e4.cellSize);
  const _0x9b878a = getMinRingToCenterCellBounds(_0x2ebbd3, _0x340bf8, _0x4f39e4.centerCellBounds);
  const _0x186c82 = _0x1ec0ad.ignoreGroup === true;
  const _0x300cce = typeof _0x1ec0ad.candidateFilter === "function" ? _0x1ec0ad.candidateFilter : null;
  let _0x5c0414 = null;
  let _0x564ff9 = null;
  let _0x21da6f = Infinity;
  let _0x2134ed = Infinity;
  for (let _0x5d8bb1 = _0x9b878a;; _0x5d8bb1 += 1) {
    iterateNodeSpatialRing(_0x2ebbd3, _0x340bf8, _0x5d8bb1, (_0x778989, _0x5dd25a) => {
      const _0x27215c = _0x4f39e4.centerCells.get(getNodeSpatialCellKey(_0x778989, _0x5dd25a));
      if (!_0x27215c || _0x27215c.length === 0) {
        return;
      }
      for (const _0x3ffe7d of _0x27215c) {
        const _0x743566 = _0x177440?.[_0x3ffe7d];
        if (!_0x743566) {
          continue;
        }
        if (_0x186c82 && _0x743566?.type === "group") {
          continue;
        }
        if (_0x300cce && _0x300cce(_0x743566, _0x3ffe7d) === false) {
          continue;
        }
        const _0x5491b7 = _0x4f39e4.nodeRects.get(_0x3ffe7d);
        if (!_0x5491b7) {
          continue;
        }
        const _0x1ac6dc = _0x12b761 - _0x5491b7.cx;
        const _0xe2e3f9 = _0x160506 - _0x5491b7.cy;
        const _0x509890 = _0x1ac6dc * _0x1ac6dc + _0xe2e3f9 * _0xe2e3f9;
        if (_0x509890 < _0x21da6f || _0x509890 === _0x21da6f && _0x5491b7.order < _0x2134ed) {
          _0x5c0414 = _0x3ffe7d;
          _0x564ff9 = _0x5491b7;
          _0x21da6f = _0x509890;
          _0x2134ed = _0x5491b7.order;
        }
      }
    });
    if (doesRingCoverCenterCellBounds(_0x2ebbd3, _0x340bf8, _0x5d8bb1, _0x4f39e4.centerCellBounds)) {
      break;
    }
    if (_0x564ff9) {
      const _0x543e8b = getNextRingMinCenterDistSq(_0x4f39e4, _0x12b761, _0x160506, _0x2ebbd3, _0x340bf8, _0x5d8bb1 + 1);
      if (_0x21da6f <= _0x543e8b) {
        break;
      }
    }
  }
  if (_0x5c0414 && _0x564ff9) {
    return {
      nodeId: _0x5c0414,
      rect: _0x564ff9
    };
  } else {
    return null;
  }
}
export function createNodeSpatialIndex(_0x375c61, _0x561a01 = {}) {
  const _0x399953 = Number(_0x561a01?.cellSize);
  const _0x5e5c58 = Number.isFinite(_0x399953) && _0x399953 > 0 ? _0x399953 : DEFAULT_NODE_SPATIAL_INDEX_CELL_SIZE;
  const _0x156c3a = typeof _0x561a01?.resolveRect === "function" ? _0x561a01.resolveRect : defaultNodeQueryRectResolver;
  const _0x2bbbfc = new Map();
  const _0x5aff98 = new Map();
  const _0x372edf = new Map();
  let _0x23cc82 = Infinity;
  let _0x7d5685 = -Infinity;
  let _0x302a35 = Infinity;
  let _0xc6e6d6 = -Infinity;
  let _0x37d630 = Infinity;
  let _0x76e725 = -Infinity;
  let _0x55d190 = Infinity;
  let _0x110b83 = -Infinity;
  let _0x1b8daa = 0;
  for (const [_0x4dd0b5, _0x57fbbd] of Object.entries(_0x375c61 || {})) {
    const _0xb4de11 = String(_0x57fbbd?.id || _0x4dd0b5 || "").trim();
    if (!_0xb4de11) {
      continue;
    }
    const _0xa89036 = finalizeNodeQueryRect(_0x156c3a(_0x57fbbd, _0xb4de11), {
      order: _0x1b8daa
    });
    if (!_0xa89036) {
      continue;
    }
    const _0x5ed577 = {
      nodeId: _0xb4de11,
      ..._0xa89036
    };
    _0x372edf.set(_0xb4de11, _0x5ed577);
    _0x1b8daa += 1;
    const _0x26e486 = getNodeSpatialCellCoord(_0x5ed577.x, _0x5e5c58);
    const _0x3194d8 = getNodeSpatialCellCoord(_0x5ed577.right, _0x5e5c58);
    const _0x4cf862 = getNodeSpatialCellCoord(_0x5ed577.y, _0x5e5c58);
    const _0x2380bf = getNodeSpatialCellCoord(_0x5ed577.bottom, _0x5e5c58);
    if (_0x26e486 < _0x23cc82) {
      _0x23cc82 = _0x26e486;
    }
    if (_0x3194d8 > _0x7d5685) {
      _0x7d5685 = _0x3194d8;
    }
    if (_0x4cf862 < _0x302a35) {
      _0x302a35 = _0x4cf862;
    }
    if (_0x2380bf > _0xc6e6d6) {
      _0xc6e6d6 = _0x2380bf;
    }
    for (let _0x7384c1 = _0x26e486; _0x7384c1 <= _0x3194d8; _0x7384c1 += 1) {
      for (let _0x6db78a = _0x4cf862; _0x6db78a <= _0x2380bf; _0x6db78a += 1) {
        pushNodeIdToSpatialCell(_0x2bbbfc, _0x7384c1, _0x6db78a, _0xb4de11);
      }
    }
    const _0x103822 = getNodeSpatialCellCoord(_0x5ed577.cx, _0x5e5c58);
    const _0x34b088 = getNodeSpatialCellCoord(_0x5ed577.cy, _0x5e5c58);
    pushNodeIdToSpatialCell(_0x5aff98, _0x103822, _0x34b088, _0xb4de11);
    if (_0x103822 < _0x37d630) {
      _0x37d630 = _0x103822;
    }
    if (_0x103822 > _0x76e725) {
      _0x76e725 = _0x103822;
    }
    if (_0x34b088 < _0x55d190) {
      _0x55d190 = _0x34b088;
    }
    if (_0x34b088 > _0x110b83) {
      _0x110b83 = _0x34b088;
    }
  }
  const _0x573884 = _0x37d630 === Infinity ? null : {
    minX: _0x37d630,
    maxX: _0x76e725,
    minY: _0x55d190,
    maxY: _0x110b83
  };
  const _0x3131e2 = _0x23cc82 === Infinity ? null : {
    minX: _0x23cc82,
    maxX: _0x7d5685,
    minY: _0x302a35,
    maxY: _0xc6e6d6
  };
  return {
    cellSize: _0x5e5c58,
    boundsCells: _0x2bbbfc,
    centerCells: _0x5aff98,
    nodeRects: _0x372edf,
    boundsCellBounds: _0x3131e2,
    centerCellBounds: _0x573884,
    nodeCount: _0x372edf.size
  };
}
export function queryNodeSpatialIndexAtWorldPoint(_0x22ecef, _0x365d3f, _0x33c0ef) {
  if (!_0x22ecef || !(_0x22ecef.boundsCells instanceof Map) || !Number.isFinite(_0x365d3f) || !Number.isFinite(_0x33c0ef) || !Number.isFinite(_0x22ecef.cellSize) || _0x22ecef.cellSize <= 0) {
    return EMPTY_NODE_SPATIAL_QUERY_RESULT;
  }
  const _0x3ceb95 = getNodeSpatialCellCoord(_0x365d3f, _0x22ecef.cellSize);
  const _0x2786d3 = getNodeSpatialCellCoord(_0x33c0ef, _0x22ecef.cellSize);
  return _0x22ecef.boundsCells.get(getNodeSpatialCellKey(_0x3ceb95, _0x2786d3)) || EMPTY_NODE_SPATIAL_QUERY_RESULT;
}
export function queryNodeSpatialIndexInRect(_0x2d167f, _0x5af2fe) {
  const _0x5c18cb = normalizeNodeQueryRect(_0x5af2fe);
  if (!_0x5c18cb || !_0x2d167f || !(_0x2d167f.boundsCells instanceof Map) || !(_0x2d167f.nodeRects instanceof Map) || !Number.isFinite(_0x2d167f.cellSize) || _0x2d167f.cellSize <= 0) {
    return EMPTY_NODE_SPATIAL_QUERY_RESULT;
  }
  const _0xcff9eb = getNodeSpatialCellCoord(_0x5c18cb.x, _0x2d167f.cellSize);
  const _0x216585 = getNodeSpatialCellCoord(_0x5c18cb.x + _0x5c18cb.width, _0x2d167f.cellSize);
  const _0x3890ca = getNodeSpatialCellCoord(_0x5c18cb.y, _0x2d167f.cellSize);
  const _0x1a4c44 = getNodeSpatialCellCoord(_0x5c18cb.y + _0x5c18cb.height, _0x2d167f.cellSize);
  const _0x541d98 = new Set();
  for (let _0x3cef7a = _0xcff9eb; _0x3cef7a <= _0x216585; _0x3cef7a += 1) {
    for (let _0x32e07b = _0x3890ca; _0x32e07b <= _0x1a4c44; _0x32e07b += 1) {
      const _0x177511 = _0x2d167f.boundsCells.get(getNodeSpatialCellKey(_0x3cef7a, _0x32e07b));
      if (!_0x177511 || _0x177511.length === 0) {
        continue;
      }
      for (const _0x57b550 of _0x177511) {
        _0x541d98.add(_0x57b550);
      }
    }
  }
  if (_0x541d98.size === 0) {
    return EMPTY_NODE_SPATIAL_QUERY_RESULT;
  }
  return Array.from(_0x541d98).sort((_0x350aa6, _0x4298bc) => {
    const _0x7543b7 = _0x2d167f.nodeRects.get(_0x350aa6)?.order ?? Infinity;
    const _0x1d3dd9 = _0x2d167f.nodeRects.get(_0x4298bc)?.order ?? Infinity;
    return _0x7543b7 - _0x1d3dd9;
  });
}
export function getNodeScreenRect(_0x4b9dba, _0x1fb0d4) {
  const {
    x: _0x558558,
    y: _0x16a426,
    zoom: _0x2da04a
  } = _0x1fb0d4;
  const _0x44813e = getViewportScreenOrigin(_0x1fb0d4);
  const _0x38fd55 = _0x4b9dba.x * _0x2da04a + _0x558558 + _0x44813e.x;
  const _0x2db37e = _0x4b9dba.y * _0x2da04a + _0x16a426 + _0x44813e.y;
  const _0x33f631 = (_0x4b9dba.width || 0) * _0x2da04a;
  const _0x468d97 = (_0x4b9dba.height || 0) * _0x2da04a;
  return {
    left: _0x38fd55,
    top: _0x2db37e,
    right: _0x38fd55 + _0x33f631,
    bottom: _0x2db37e + _0x468d97,
    cx: _0x38fd55 + _0x33f631 / 2,
    cy: _0x2db37e + _0x468d97 / 2,
    width: _0x33f631,
    height: _0x468d97
  };
}
export function findClosestNode(_0x3fb383, _0x107491, _0x577e2d, _0x393569, _0x28ced6 = false, _0x2f4d5b = undefined) {
  const {
    x: _0x1dc025,
    y: _0x16c275
  } = screenToWorld(_0x3fb383, _0x107491, _0x393569);
  const _0x26747e = normalizeNodeQueryOptions(_0x28ced6, _0x2f4d5b);
  const _0x258e79 = _0x26747e.spatialIndex ? queryNodeSpatialIndexAtWorldPoint(_0x26747e.spatialIndex, _0x1dc025, _0x16c275) : null;
  if (_0x258e79) {
    for (const _0x3995b6 of _0x258e79) {
      const _0x204144 = _0x577e2d?.[_0x3995b6];
      if (!_0x204144) {
        continue;
      }
      if (_0x26747e.ignoreGroup && _0x204144?.type === "group") {
        continue;
      }
      if (_0x26747e.candidateFilter && _0x26747e.candidateFilter(_0x204144, _0x3995b6) === false) {
        continue;
      }
      const _0x3800ab = resolveNodeQueryRect(_0x204144, _0x3995b6, _0x26747e.resolveRect, _0x26747e.spatialIndex);
      if (!_0x3800ab) {
        continue;
      }
      if (!isPointInRect(_0x1dc025, _0x16c275, _0x3800ab.x, _0x3800ab.y, _0x3800ab.width, _0x3800ab.height)) {
        continue;
      }
      return {
        nodeId: _0x3995b6,
        screenRect: getNodeScreenRect(_0x3800ab, _0x393569),
        isInside: true
      };
    }
    const _0x4566e5 = findNearestNodeRectInSpatialIndex(_0x26747e.spatialIndex, _0x577e2d, _0x1dc025, _0x16c275, _0x26747e);
    if (_0x4566e5) {
      return {
        nodeId: _0x4566e5.nodeId,
        screenRect: getNodeScreenRect(_0x4566e5.rect, _0x393569),
        isInside: false
      };
    } else {
      return null;
    }
  }
  let _0x1d0338 = null;
  let _0x3db3a2 = null;
  let _0x404ad6 = Infinity;
  for (const [_0x47db40, _0x28d7a8] of Object.entries(_0x577e2d || {})) {
    const _0x4a6f6f = String(_0x28d7a8?.id || _0x47db40 || "").trim();
    if (!_0x4a6f6f) {
      continue;
    }
    if (_0x26747e.ignoreGroup && _0x28d7a8?.type === "group") {
      continue;
    }
    if (_0x26747e.candidateFilter && _0x26747e.candidateFilter(_0x28d7a8, _0x4a6f6f) === false) {
      continue;
    }
    const _0x3c9b4a = resolveNodeQueryRect(_0x28d7a8, _0x4a6f6f, _0x26747e.resolveRect, _0x26747e.spatialIndex);
    if (!_0x3c9b4a) {
      continue;
    }
    const _0x5577a8 = isPointInRect(_0x1dc025, _0x16c275, _0x3c9b4a.x, _0x3c9b4a.y, _0x3c9b4a.width, _0x3c9b4a.height);
    if (_0x5577a8) {
      return {
        nodeId: _0x4a6f6f,
        screenRect: getNodeScreenRect(_0x3c9b4a, _0x393569),
        isInside: true
      };
    }
    const _0x1d1eb0 = _0x1dc025 - _0x3c9b4a.cx;
    const _0x13c3ed = _0x16c275 - _0x3c9b4a.cy;
    const _0x33037a = _0x1d1eb0 * _0x1d1eb0 + _0x13c3ed * _0x13c3ed;
    if (_0x33037a < _0x404ad6) {
      _0x404ad6 = _0x33037a;
      _0x1d0338 = _0x4a6f6f;
      _0x3db3a2 = _0x3c9b4a;
    }
  }
  if (_0x1d0338) {
    return {
      nodeId: _0x1d0338,
      screenRect: getNodeScreenRect(_0x3db3a2, _0x393569),
      isInside: false
    };
  } else {
    return null;
  }
}
export function hitTestNode(_0x181478, _0x4342c4, _0x46cd8b, _0x32008b, _0x5a51e8, _0x320740 = false, _0x15cabc = undefined) {
  const {
    x: _0x53fe5b,
    y: _0x11a0d2
  } = screenToWorld(_0x181478, _0x4342c4, _0x32008b);
  const _0x3a9322 = normalizeNodeQueryOptions(_0x320740, _0x15cabc);
  const _0x212ad7 = new Set();
  const _0x43ba1a = String(_0x5a51e8 || "").trim();
  if (_0x43ba1a) {
    _0x212ad7.add(_0x43ba1a);
  }
  if (_0x3a9322.excludeIds && typeof _0x3a9322.excludeIds !== "string" && typeof _0x3a9322.excludeIds[Symbol.iterator] === "function") {
    for (const _0x2e2287 of _0x3a9322.excludeIds) {
      const _0xad63a0 = String(_0x2e2287 || "").trim();
      if (_0xad63a0) {
        _0x212ad7.add(_0xad63a0);
      }
    }
  }
  let _0x424cc3 = null;
  let _0x430109 = null;
  const _0x575acb = _0x3a9322.spatialIndex ? queryNodeSpatialIndexAtWorldPoint(_0x3a9322.spatialIndex, _0x53fe5b, _0x11a0d2) : null;
  const _0x83731e = (_0x1de6f6, _0x455595) => {
    if (_0x212ad7.has(_0x1de6f6)) {
      return;
    }
    if (_0x3a9322.ignoreGroup && _0x455595?.type === "group") {
      return;
    }
    if (_0x3a9322.candidateFilter && _0x3a9322.candidateFilter(_0x455595, _0x1de6f6) === false) {
      return;
    }
    const _0x3ce683 = resolveNodeQueryRect(_0x455595, _0x1de6f6, _0x3a9322.resolveRect, _0x3a9322.spatialIndex);
    if (!_0x3ce683) {
      return;
    }
    if (!isPointInRect(_0x53fe5b, _0x11a0d2, _0x3ce683.x, _0x3ce683.y, _0x3ce683.width, _0x3ce683.height)) {
      return;
    }
    if (_0x455595?.type === "group") {
      _0x424cc3 = _0x1de6f6;
    } else {
      _0x430109 = _0x1de6f6;
    }
  };
  if (_0x575acb) {
    for (const _0xc77fd2 of _0x575acb) {
      const _0x474eea = _0x46cd8b?.[_0xc77fd2];
      if (!_0x474eea) {
        continue;
      }
      _0x83731e(_0xc77fd2, _0x474eea);
    }
    return _0x430109 || _0x424cc3 || null;
  }
  for (const [_0x4aa3c4, _0x1cc335] of Object.entries(_0x46cd8b || {})) {
    const _0x40d11b = String(_0x1cc335?.id || _0x4aa3c4 || "").trim();
    if (!_0x40d11b) {
      continue;
    }
    _0x83731e(_0x40d11b, _0x1cc335);
  }
  return _0x430109 || _0x424cc3 || null;
}
export function checkLineIntersection(_0x14faec, _0x3aabaa, _0xc5c2c3, _0x41dbeb, _0x76a273, _0x5f4656, _0xb68af5, _0x2c4af8) {
  let _0x834ed1 = _0xc5c2c3 - _0x14faec;
  let _0x1b9632 = _0x41dbeb - _0x3aabaa;
  let _0x5250a1 = _0xb68af5 - _0x76a273;
  let _0x16953c = _0x2c4af8 - _0x5f4656;
  let _0x5ab7e1 = -_0x5250a1 * _0x1b9632 + _0x834ed1 * _0x16953c;
  if (_0x5ab7e1 === 0) {
    return false;
  }
  let _0x4e2119 = (-_0x1b9632 * (_0x14faec - _0x76a273) + _0x834ed1 * (_0x3aabaa - _0x5f4656)) / _0x5ab7e1;
  let _0x16c535 = (_0x5250a1 * (_0x3aabaa - _0x5f4656) - _0x16953c * (_0x14faec - _0x76a273)) / _0x5ab7e1;
  return _0x4e2119 >= 0 && _0x4e2119 <= 1 && _0x16c535 >= 0 && _0x16c535 <= 1;
}
export function checkBBoxIntersection(_0x5993fa, _0x86cfd9, _0x275188, _0x4325be, _0x3c4f0f, _0x5523eb, _0xfb7096, _0x5afc40) {
  const _0x10c8d3 = Math.min(_0x5993fa, _0x275188);
  const _0x946182 = Math.max(_0x5993fa, _0x275188);
  const _0x391b6b = Math.min(_0x86cfd9, _0x4325be);
  const _0x2a58ed = Math.max(_0x86cfd9, _0x4325be);
  const _0x3e9849 = Math.min(_0x3c4f0f, _0xfb7096);
  const _0x41f232 = Math.max(_0x3c4f0f, _0xfb7096);
  const _0x3c5af6 = Math.min(_0x5523eb, _0x5afc40);
  const _0x10c5cb = Math.max(_0x5523eb, _0x5afc40);
  return !(_0x946182 < _0x3e9849) && !(_0x41f232 < _0x10c8d3) && !(_0x2a58ed < _0x3c5af6) && !(_0x10c5cb < _0x391b6b);
}
export * from "./panoramaSceneMath.js";