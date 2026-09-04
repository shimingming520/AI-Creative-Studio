const GRID_DOT_WORLD_SPACING = 22;
const MIN_GRID_DOT_SCREEN_SPACING = 18;
const GRID_DOTS_HIDE_AT_ZOOM = 0.25;
const GRID_DOTS_EMPHASIZE_AT_ZOOM = 1.5;
function toFiniteNumber(_0x55b29e, _0x2e736b) {
  const _0x5d8819 = Number(_0x55b29e);
  if (Number.isFinite(_0x5d8819)) {
    return _0x5d8819;
  } else {
    return _0x2e736b;
  }
}
function resolveScreenSpacing(_0x2f1dfc) {
  let _0x17258c = GRID_DOT_WORLD_SPACING * _0x2f1dfc;
  while (_0x17258c < MIN_GRID_DOT_SCREEN_SPACING) {
    _0x17258c *= 2;
  }
  return _0x17258c;
}
export function syncViewportGridDots(_0x435a68, _0x29e097 = {}) {
  const _0x4b317c = _0x435a68?.parentElement;
  if (!_0x4b317c?.style?.setProperty) {
    return false;
  }
  const _0x538e15 = toFiniteNumber(_0x29e097.x, 0);
  const _0x2abd58 = toFiniteNumber(_0x29e097.y, 0);
  const _0x435f6a = toFiniteNumber(_0x29e097.zoom, 1);
  const _0x81bf8 = _0x435f6a > 0 ? _0x435f6a : 1;
  const _0x145818 = _0x538e15 + "|" + _0x2abd58 + "|" + _0x81bf8;
  if (_0x4b317c._lastGridDotsViewport === _0x145818) {
    return false;
  }
  const _0x39c38d = resolveScreenSpacing(_0x81bf8);
  _0x4b317c.style.setProperty("background-position", _0x538e15 + "px " + _0x2abd58 + "px");
  _0x4b317c.style.setProperty("background-size", _0x39c38d + "px " + _0x39c38d + "px");
  _0x4b317c.classList?.toggle?.("is-grid-dots-hidden-by-zoom", _0x81bf8 <= GRID_DOTS_HIDE_AT_ZOOM);
  _0x4b317c.classList?.toggle?.("is-grid-dots-emphasized", _0x81bf8 >= GRID_DOTS_EMPHASIZE_AT_ZOOM);
  _0x4b317c._lastGridDotsViewport = _0x145818;
  return true;
}