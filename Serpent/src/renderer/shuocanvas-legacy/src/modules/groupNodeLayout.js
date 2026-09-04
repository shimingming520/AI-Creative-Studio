export const GROUP_NODE_CONTENT_INSETS = Object.freeze({
  top: 80,
  right: 32,
  bottom: 32,
  left: 32
});
function toFiniteNumber(_0x483251, _0x3b4ad6 = 0) {
  const _0x29fdb9 = Number(_0x483251);
  if (Number.isFinite(_0x29fdb9)) {
    return _0x29fdb9;
  } else {
    return _0x3b4ad6;
  }
}
export function createGroupNodeLayout({
  x = 0,
  y = 0,
  contentWidth = 0,
  contentHeight = 0,
  minWidth = 0,
  minHeight = 0
} = {}) {
  const _0x2dc5d4 = toFiniteNumber(x);
  const _0xbb0f2c = toFiniteNumber(y);
  const _0x2a57a9 = Math.max(0, toFiniteNumber(contentWidth));
  const _0x45783c = Math.max(0, toFiniteNumber(contentHeight));
  const _0x18d60e = Math.max(Math.max(0, toFiniteNumber(minWidth)), GROUP_NODE_CONTENT_INSETS.left + _0x2a57a9 + GROUP_NODE_CONTENT_INSETS.right);
  const _0x1ffe4e = Math.max(Math.max(0, toFiniteNumber(minHeight)), GROUP_NODE_CONTENT_INSETS.top + _0x45783c + GROUP_NODE_CONTENT_INSETS.bottom);
  return {
    x: _0x2dc5d4,
    y: _0xbb0f2c,
    width: _0x18d60e,
    height: _0x1ffe4e,
    contentX: _0x2dc5d4 + GROUP_NODE_CONTENT_INSETS.left,
    contentY: _0xbb0f2c + GROUP_NODE_CONTENT_INSETS.top
  };
}
export function calculateGroupNodeBounds(_0x4bb598, {
  defaultNodeWidth = 260,
  defaultNodeHeight = 100,
  minWidth = 0,
  minHeight = 0
} = {}) {
  const _0xf7d20e = Array.isArray(_0x4bb598) ? _0x4bb598.filter(Boolean) : [];
  if (!_0xf7d20e.length) {
    throw new Error("calculateGroupNodeBounds requires at least one node");
  }
  const _0x1c29b4 = Math.max(0, toFiniteNumber(defaultNodeWidth, 260));
  const _0x2559a4 = Math.max(0, toFiniteNumber(defaultNodeHeight, 100));
  const _0x4b1557 = Math.min(..._0xf7d20e.map(_0x4f1494 => toFiniteNumber(_0x4f1494.x)));
  const _0x571d72 = Math.min(..._0xf7d20e.map(_0x361c71 => toFiniteNumber(_0x361c71.y)));
  const _0x3e1dce = Math.max(..._0xf7d20e.map(_0x56cb13 => toFiniteNumber(_0x56cb13.x) + (toFiniteNumber(_0x56cb13.width) || _0x1c29b4)));
  const _0x338dab = Math.max(..._0xf7d20e.map(_0x4dd6ce => toFiniteNumber(_0x4dd6ce.y) + (toFiniteNumber(_0x4dd6ce.height) || _0x2559a4)));
  const _0x3e300c = createGroupNodeLayout({
    x: _0x4b1557 - GROUP_NODE_CONTENT_INSETS.left,
    y: _0x571d72 - GROUP_NODE_CONTENT_INSETS.top,
    contentWidth: _0x3e1dce - _0x4b1557,
    contentHeight: _0x338dab - _0x571d72,
    minWidth: minWidth,
    minHeight: minHeight
  });
  return {
    x: _0x3e300c.x,
    y: _0x3e300c.y,
    width: _0x3e300c.width,
    height: _0x3e300c.height
  };
}