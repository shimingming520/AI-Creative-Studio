export const STORYBOARD_3D_SELECTION_DRAG_THRESHOLD = 4;
function finite(_0x93c56c, _0x2b5d05 = 0) {
  const _0x217ee6 = Number(_0x93c56c);
  if (Number.isFinite(_0x217ee6)) {
    return _0x217ee6;
  } else {
    return _0x2b5d05;
  }
}
export function createStoryboard3DSelectionRect(_0x4337b6 = {}, _0x19297c = {}) {
  const _0x2d8a20 = finite(_0x4337b6.clientX);
  const _0x5b42f6 = finite(_0x4337b6.clientY);
  const _0x25ae43 = finite(_0x19297c.clientX, _0x2d8a20);
  const _0x2c55b4 = finite(_0x19297c.clientY, _0x5b42f6);
  const _0x3a092e = Math.min(_0x2d8a20, _0x25ae43);
  const _0x9a041c = Math.min(_0x5b42f6, _0x2c55b4);
  const _0x3668d6 = Math.max(_0x2d8a20, _0x25ae43);
  const _0x369dd7 = Math.max(_0x5b42f6, _0x2c55b4);
  return {
    left: _0x3a092e,
    top: _0x9a041c,
    right: _0x3668d6,
    bottom: _0x369dd7,
    width: _0x3668d6 - _0x3a092e,
    height: _0x369dd7 - _0x9a041c
  };
}
export function hasStoryboard3DSelectionDragMoved(_0x194433) {
  return Math.max(_0x194433?.width || 0, _0x194433?.height || 0) >= STORYBOARD_3D_SELECTION_DRAG_THRESHOLD;
}
export function mergeStoryboard3DBoxSelection({
  initialObjectIds = [],
  hitObjectIds = [],
  additive = false,
  toggle = false
} = {}) {
  const _0x9af981 = [...new Set(initialObjectIds.filter(Boolean))];
  const _0x573ad0 = [...new Set(hitObjectIds.filter(Boolean))];
  if (toggle) {
    const _0x17161e = new Set(_0x9af981);
    _0x573ad0.forEach(_0x4dbff0 => {
      if (_0x17161e.has(_0x4dbff0)) {
        _0x17161e.delete(_0x4dbff0);
      } else {
        _0x17161e.add(_0x4dbff0);
      }
    });
    return [..._0x17161e];
  }
  if (additive) {
    return [...new Set([..._0x9af981, ..._0x573ad0])];
  }
  return _0x573ad0;
}