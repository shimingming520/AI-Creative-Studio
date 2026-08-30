import { scrollClosestElementHorizontallyWithWheel } from "./workspaceHorizontalWheel.js";
const WORKSPACE_SCROLLABLE_OVERFLOW_VALUES = new Set(["auto", "scroll", "overlay"]);
function normalizeSelector(_0xf5f201) {
  return String(_0xf5f201 || "").trim();
}
export function hasWorkspaceScrollableOverflow(_0x56495d, _0x4c54d2) {
  const _0x1e0613 = WORKSPACE_SCROLLABLE_OVERFLOW_VALUES.has(String(_0x4c54d2?.overflowY || "")) && Number(_0x56495d?.scrollHeight || 0) > Number(_0x56495d?.clientHeight || 0);
  const _0x2112e0 = WORKSPACE_SCROLLABLE_OVERFLOW_VALUES.has(String(_0x4c54d2?.overflowX || "")) && Number(_0x56495d?.scrollWidth || 0) > Number(_0x56495d?.clientWidth || 0);
  return _0x1e0613 || _0x2112e0;
}
export function shouldPreserveWorkspaceNestedWheel(_0x5c4045, {
  nestedSelector = "",
  boundaryRoot = null,
  boundarySelector = "",
  getComputedStyle = null
} = {}) {
  const _0x415284 = normalizeSelector(nestedSelector);
  const _0x435fdb = _0x415284 ? _0x5c4045?.closest?.(_0x415284) : null;
  if (_0x435fdb && (!boundaryRoot || boundaryRoot.contains?.(_0x435fdb))) {
    return true;
  }
  const _0x1d65b0 = getComputedStyle || _0x5c4045?.ownerDocument?.defaultView?.getComputedStyle?.bind(_0x5c4045.ownerDocument.defaultView);
  if (typeof _0x1d65b0 !== "function") {
    return false;
  }
  const _0x4cedb4 = normalizeSelector(boundarySelector);
  for (let _0x1a061b = _0x5c4045; _0x1a061b; _0x1a061b = _0x1a061b.parentElement) {
    if (hasWorkspaceScrollableOverflow(_0x1a061b, _0x1d65b0(_0x1a061b))) {
      return true;
    }
    if (_0x1a061b === boundaryRoot || _0x4cedb4 && _0x1a061b.matches?.(_0x4cedb4)) {
      break;
    }
  }
  return false;
}
export function captureWorkspaceScrollPosition(_0x323ca4) {
  if (!_0x323ca4) {
    return null;
  }
  return {
    top: Math.max(0, Number(_0x323ca4.scrollTop) || 0),
    left: Math.max(0, Number(_0x323ca4.scrollLeft) || 0)
  };
}
export function restoreWorkspaceScrollPosition(_0x2cd84a, _0x1df8c0) {
  if (!_0x2cd84a || !_0x1df8c0) {
    return false;
  }
  _0x2cd84a.scrollTop = Math.max(0, Number(_0x1df8c0.top) || 0);
  _0x2cd84a.scrollLeft = Math.max(0, Number(_0x1df8c0.left) || 0);
  return true;
}
export function captureWorkspaceNestedScrollPositions(_0x326b2a, _0x253e34 = []) {
  if (!_0x326b2a?.querySelectorAll || !Array.isArray(_0x253e34)) {
    return null;
  }
  const _0x41579d = [];
  _0x253e34.map(normalizeSelector).filter(Boolean).forEach(_0x1c43c9 => {
    [..._0x326b2a.querySelectorAll(_0x1c43c9)].forEach((_0x4b897d, _0x32be42) => {
      _0x41579d.push({
        selector: _0x1c43c9,
        index: _0x32be42,
        ...captureWorkspaceScrollPosition(_0x4b897d)
      });
    });
  });
  if (_0x41579d.length) {
    return _0x41579d;
  } else {
    return null;
  }
}
export function restoreWorkspaceNestedScrollPositions(_0x214360, _0x2c974e) {
  if (!_0x214360?.querySelectorAll || !Array.isArray(_0x2c974e) || !_0x2c974e.length) {
    return false;
  }
  const _0x49312b = new Map();
  let _0x37865f = false;
  _0x2c974e.forEach(_0x53e5ce => {
    const _0x349fdf = normalizeSelector(_0x53e5ce?.selector);
    if (!_0x349fdf) {
      return;
    }
    if (!_0x49312b.has(_0x349fdf)) {
      _0x49312b.set(_0x349fdf, [..._0x214360.querySelectorAll(_0x349fdf)]);
    }
    const _0x23a3fe = _0x49312b.get(_0x349fdf)[_0x53e5ce.index];
    if (!_0x23a3fe) {
      return;
    }
    _0x37865f = restoreWorkspaceScrollPosition(_0x23a3fe, _0x53e5ce) || _0x37865f;
  });
  return _0x37865f;
}
export function scrollWorkspaceTrackWithWheel(_0x425998, _0x4b0118, _0x46580f = {}) {
  const _0x4b282d = normalizeSelector(_0x4b0118);
  if (!_0x4b282d) {
    return false;
  }
  return scrollClosestElementHorizontallyWithWheel(_0x425998, _0x4b282d, _0x46580f);
}