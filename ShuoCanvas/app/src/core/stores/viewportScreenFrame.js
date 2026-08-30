function toFiniteNumber(_0x2e59e5) {
  const _0x466b7a = Number(_0x2e59e5);
  if (Number.isFinite(_0x466b7a)) {
    return _0x466b7a;
  } else {
    return 0;
  }
}
export function createViewportScreenFrame() {
  let _0x11b411 = {
    x: 0,
    y: 0
  };
  return {
    set(_0x4123f2, _0x493b29) {
      const _0x335a27 = {
        x: toFiniteNumber(_0x4123f2),
        y: toFiniteNumber(_0x493b29)
      };
      if (_0x11b411.x === _0x335a27.x && _0x11b411.y === _0x335a27.y) {
        return false;
      }
      _0x11b411 = _0x335a27;
      return true;
    },
    attach(_0x119fdf) {
      return {
        ...(_0x119fdf || {
          x: 0,
          y: 0,
          zoom: 1
        }),
        _screenOriginX: _0x11b411.x,
        _screenOriginY: _0x11b411.y
      };
    },
    strip(_0x881331) {
      const _0x5d53de = {
        ...(_0x881331 || {})
      };
      delete _0x5d53de._screenOriginX;
      delete _0x5d53de._screenOriginY;
      return _0x5d53de;
    }
  };
}