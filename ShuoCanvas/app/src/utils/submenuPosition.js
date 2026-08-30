function toFiniteNumber(_0x19e9a6, _0x195a3b = 0) {
  const _0x2964a8 = Number(_0x19e9a6);
  if (Number.isFinite(_0x2964a8)) {
    return _0x2964a8;
  } else {
    return _0x195a3b;
  }
}
function firstPositiveNumber(..._0x190fc5) {
  for (const _0x2d0a7e of _0x190fc5) {
    const _0x415041 = toFiniteNumber(_0x2d0a7e);
    if (_0x415041 > 0) {
      return _0x415041;
    }
  }
  return 0;
}
function normalizeRect(_0x423423 = {}) {
  const _0x115203 = toFiniteNumber(_0x423423.left);
  const _0x1b0bb1 = toFiniteNumber(_0x423423.top);
  const _0x1dc91e = firstPositiveNumber(_0x423423.width, toFiniteNumber(_0x423423.right) - _0x115203);
  const _0x179643 = firstPositiveNumber(_0x423423.height, toFiniteNumber(_0x423423.bottom) - _0x1b0bb1);
  return {
    left: _0x115203,
    top: _0x1b0bb1,
    width: _0x1dc91e,
    height: _0x179643,
    right: toFiniteNumber(_0x423423.right, _0x115203 + _0x1dc91e),
    bottom: toFiniteNumber(_0x423423.bottom, _0x1b0bb1 + _0x179643)
  };
}
function clamp(_0x36ffcc, _0x643ef4, _0x248fb0) {
  return Math.min(Math.max(_0x36ffcc, _0x643ef4), _0x248fb0);
}
export function positionAnchoredSubmenu({
  submenu: _0x156c21,
  anchorRect: _0x39b0e2,
  horizontalAnchorRect = _0x39b0e2,
  containerRect = {
    left: 0,
    top: 0
  },
  preferredSide = "right",
  horizontalPlacement = "side",
  verticalPlacement = "top",
  verticalGap = 0,
  position = "absolute",
  gap = 6,
  viewportMargin = 12,
  viewportWidth = globalThis.window?.innerWidth,
  viewportHeight = globalThis.window?.innerHeight,
  viewportTop = 0,
  submenuWidth: _0x44546e
} = {}) {
  if (!_0x156c21?.style || !_0x39b0e2) {
    return null;
  }
  const _0x48e677 = Math.max(0, toFiniteNumber(viewportMargin, 12));
  const _0x3c7bee = Math.max(0, toFiniteNumber(viewportWidth));
  const _0xf20fed = Math.max(0, toFiniteNumber(viewportHeight));
  const _0x344751 = Math.max(0, toFiniteNumber(viewportTop) + _0x48e677);
  const _0xfe4a8c = normalizeRect(_0x39b0e2);
  const _0x182543 = normalizeRect(horizontalAnchorRect || _0x39b0e2);
  const _0x212ab4 = normalizeRect(containerRect);
  _0x156c21.style.maxHeight = "";
  _0x156c21.style.overflowY = "";
  const _0x4218dd = _0x156c21.getBoundingClientRect?.() || {};
  const _0x426d69 = firstPositiveNumber(_0x156c21.offsetHeight, _0x4218dd.height, _0x156c21.scrollHeight);
  const _0x446e12 = firstPositiveNumber(_0x44546e, _0x156c21.offsetWidth, _0x4218dd.width, _0x182543.width);
  const _0x118f37 = _0xf20fed > _0x344751 + _0x48e677 ? _0xf20fed - _0x344751 - _0x48e677 : _0x426d69;
  const _0x33cd3f = _0x426d69 > 0 && _0x118f37 > 0 ? Math.min(_0x426d69, _0x118f37) : _0x426d69;
  if (_0x426d69 > _0x33cd3f && _0x33cd3f > 0) {
    _0x156c21.style.maxHeight = Math.floor(_0x33cd3f) + "px";
    _0x156c21.style.overflowY = "auto";
  }
  const _0x4c923c = verticalPlacement === "above" ? _0xfe4a8c.top - _0x33cd3f - verticalGap : verticalPlacement === "below" ? _0xfe4a8c.bottom + verticalGap : _0xfe4a8c.top;
  const _0x2d6aa5 = Math.max(_0x344751, _0xf20fed - _0x48e677 - _0x33cd3f);
  const _0x50d8ed = _0xf20fed > 0 && _0x33cd3f > 0 ? clamp(_0x4c923c, _0x344751, _0x2d6aa5) : _0x4c923c;
  const _0x4ada84 = _0x182543.left - _0x446e12 - gap;
  const _0x51ba4f = _0x182543.right + gap;
  const _0x233e63 = _0x4ada84 >= _0x48e677;
  const _0x277f21 = _0x3c7bee <= 0 || _0x51ba4f + _0x446e12 <= _0x3c7bee - _0x48e677;
  let _0xfac18d;
  if (horizontalPlacement === "center") {
    _0xfac18d = _0x182543.left + _0x182543.width / 2 - _0x446e12 / 2;
  } else {
    const _0x9b11c3 = preferredSide === "left";
    if (_0x9b11c3) {
      _0xfac18d = _0x233e63 || !_0x277f21 ? _0x4ada84 : _0x51ba4f;
    } else {
      _0xfac18d = _0x277f21 || !_0x233e63 ? _0x51ba4f : _0x4ada84;
    }
  }
  if (_0x3c7bee > 0 && _0x446e12 > 0) {
    _0xfac18d = clamp(_0xfac18d, _0x48e677, Math.max(_0x48e677, _0x3c7bee - _0x48e677 - _0x446e12));
  }
  const _0x289128 = position === "fixed";
  _0x156c21.style.position = position;
  _0x156c21.style.right = "auto";
  _0x156c21.style.left = Math.round(_0xfac18d - (_0x289128 ? 0 : _0x212ab4.left)) + "px";
  _0x156c21.style.top = Math.round(_0x50d8ed - (_0x289128 ? 0 : _0x212ab4.top)) + "px";
  return {
    left: _0xfac18d,
    top: _0x50d8ed,
    width: _0x446e12,
    height: _0x33cd3f
  };
}