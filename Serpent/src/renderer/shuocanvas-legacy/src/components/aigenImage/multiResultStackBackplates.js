export const MAX_MULTI_RESULT_VISIBLE_ITEMS = 16;
export const MAX_MULTI_RESULT_BACKPLATES = MAX_MULTI_RESULT_VISIBLE_ITEMS - 1;
export const MULTI_RESULT_STACK_PREVIEW_CLASS = "is-multi-result-stack";
export const MULTI_RESULT_STACK_EXPANDED_CLASS = "is-multi-result-stack-expanded";
export const MULTI_RESULT_STACK_WRAP_CLASS = "multi-stack-wrap";
export const MULTI_RESULT_STACK_WRAP_EXPANDED_CLASS = "is-expanded";
export const MULTI_RESULT_BACKPLATES_CLASS = "multi-stack-backplates";
export const MULTI_RESULT_BACKPLATE_CLASS = "multi-stack-backplate";
const EXPANDED_GRID_NODE_ROW = 2;
const EXPANDED_GRID_4X4_NODE_ROW = 3;
const FOUR_IMAGE_GRID_SLOT_ORDER = Object.freeze([Object.freeze({
  r: 1,
  c: 1
}), Object.freeze({
  r: 0,
  c: 0
}), Object.freeze({
  r: 0,
  c: 1
})]);
const EXPANDED_GRID_SLOT_ORDER = Object.freeze([Object.freeze({
  r: 2,
  c: 1
}), Object.freeze({
  r: 2,
  c: 2
}), Object.freeze({
  r: 1,
  c: 0
}), Object.freeze({
  r: 1,
  c: 1
}), Object.freeze({
  r: 1,
  c: 2
}), Object.freeze({
  r: 0,
  c: 0
}), Object.freeze({
  r: 0,
  c: 1
}), Object.freeze({
  r: 0,
  c: 2
}), Object.freeze({
  r: 2,
  c: 3
}), Object.freeze({
  r: 1,
  c: 3
}), Object.freeze({
  r: 0,
  c: 3
})]);
const EXPANDED_GRID_4X4_SLOT_ORDER = Object.freeze([Object.freeze({
  r: 3,
  c: 1
}), Object.freeze({
  r: 3,
  c: 2
}), Object.freeze({
  r: 3,
  c: 3
}), Object.freeze({
  r: 2,
  c: 0
}), Object.freeze({
  r: 2,
  c: 1
}), Object.freeze({
  r: 2,
  c: 2
}), Object.freeze({
  r: 2,
  c: 3
}), Object.freeze({
  r: 1,
  c: 0
}), Object.freeze({
  r: 1,
  c: 1
}), Object.freeze({
  r: 1,
  c: 2
}), Object.freeze({
  r: 1,
  c: 3
}), Object.freeze({
  r: 0,
  c: 0
}), Object.freeze({
  r: 0,
  c: 1
}), Object.freeze({
  r: 0,
  c: 2
}), Object.freeze({
  r: 0,
  c: 3
})]);
function toFiniteCount(_0x294637) {
  const _0x41325c = Number(_0x294637);
  if (!Number.isFinite(_0x41325c) || _0x41325c <= 0) {
    return 0;
  }
  return Math.floor(_0x41325c);
}
export function getMultiResultBackplateCount(_0x54c8b7) {
  const _0x120f0a = toFiniteCount(_0x54c8b7);
  return Math.min(Math.max(_0x120f0a - 1, 0), MAX_MULTI_RESULT_BACKPLATES);
}
function normalizeMainIndex(_0x50d3de, _0x5d8829) {
  if (Number.isFinite(Number(_0x50d3de)) && _0x50d3de >= 0 && _0x50d3de < _0x5d8829) {
    return Math.floor(Number(_0x50d3de));
  } else {
    return 0;
  }
}
function normalizeBackplateItem(_0x540b08, _0x56a2f1) {
  const _0x459c79 = Number.isFinite(Number(_0x540b08?.imageIndex)) ? Math.floor(Number(_0x540b08.imageIndex)) : _0x56a2f1;
  return {
    imageIndex: _0x459c79
  };
}
function getExpandedGridLayout(_0x41074a) {
  if (_0x41074a === 4) {
    return {
      nodeRow: 1,
      slotOrder: FOUR_IMAGE_GRID_SLOT_ORDER
    };
  }
  if (_0x41074a > MAX_MULTI_RESULT_VISIBLE_ITEMS - 4) {
    return {
      nodeRow: EXPANDED_GRID_4X4_NODE_ROW,
      slotOrder: EXPANDED_GRID_4X4_SLOT_ORDER
    };
  }
  return {
    nodeRow: EXPANDED_GRID_NODE_ROW,
    slotOrder: EXPANDED_GRID_SLOT_ORDER
  };
}
export function buildMultiResultBackplateItems({
  imageCount = 0,
  mainIndex = 0
} = {}) {
  const _0x33da99 = toFiniteCount(imageCount);
  if (_0x33da99 <= 1) {
    return [];
  }
  const _0x4449ce = normalizeMainIndex(mainIndex, _0x33da99);
  const _0x4f66c7 = [];
  for (let _0x431158 = 0; _0x431158 < _0x33da99; _0x431158 += 1) {
    if (_0x431158 === _0x4449ce) {
      continue;
    }
    _0x4f66c7.push({
      imageIndex: _0x431158
    });
    if (_0x4f66c7.length >= MAX_MULTI_RESULT_BACKPLATES) {
      break;
    }
  }
  return _0x4f66c7;
}
export function buildMultiResultExpandedSlotMap({
  imageCount = 0,
  mainIndex = 0,
  previewWidth = 0,
  previewHeight = 0,
  gap = 0
} = {}) {
  const _0x183b6d = toFiniteCount(imageCount);
  const _0x121e4a = normalizeMainIndex(mainIndex, _0x183b6d);
  const _0x1c9e01 = new Map();
  if (_0x183b6d <= 1) {
    return _0x1c9e01;
  }
  const _0x1de004 = Math.max(1, Number(previewWidth) || 1);
  const _0x1a212e = Math.max(1, Number(previewHeight) || 1);
  const _0x538c11 = Math.max(0, Number(gap) || 0);
  const {
    nodeRow: _0x13c571,
    slotOrder: _0x346b62
  } = getExpandedGridLayout(_0x183b6d);
  let _0x2286fb = 0;
  for (let _0x551a14 = 0; _0x551a14 < _0x183b6d; _0x551a14 += 1) {
    if (_0x551a14 === _0x121e4a) {
      continue;
    }
    const _0x3e82d3 = _0x346b62[_0x2286fb];
    if (!_0x3e82d3) {
      break;
    }
    _0x1c9e01.set(_0x551a14, {
      order: _0x2286fb,
      top: (_0x3e82d3.r - _0x13c571) * (_0x1a212e + _0x538c11),
      left: _0x3e82d3.c * (_0x1de004 + _0x538c11)
    });
    _0x2286fb += 1;
  }
  return _0x1c9e01;
}
export function buildMultiResultCollapsedFrame(_0x46870e = 1) {
  const _0x3a57e7 = Math.min(MAX_MULTI_RESULT_BACKPLATES, Math.max(1, Math.floor(Number(_0x46870e) || 1)));
  const _0x5f16cd = _0x3a57e7 - 1;
  return {
    x: Math.min(10 + _0x5f16cd * 7, 66),
    y: Math.min(_0x5f16cd * 3, 24),
    rotate: Math.min(4 + _0x5f16cd * 2.2, 18),
    scale: Math.max(0.99 - _0x5f16cd * 0.016, 0.86),
    opacity: Math.max(0.58 - _0x5f16cd * 0.055, 0.18)
  };
}
export function shouldEnableMultiResultLayerDragOut({
  isImagesExpanded = false,
  imageCount = 0,
  imageIndex = -1,
  mainImageIndex = 0
} = {}) {
  const _0x507ec0 = toFiniteCount(imageCount);
  if (!isImagesExpanded || _0x507ec0 <= 1) {
    return false;
  }
  const _0x3d0562 = normalizeMainIndex(mainImageIndex, _0x507ec0);
  const _0x4bbf48 = Number.isFinite(Number(imageIndex)) ? Math.floor(Number(imageIndex)) : -1;
  return _0x4bbf48 >= 0 && _0x4bbf48 < _0x507ec0 && _0x4bbf48 !== _0x3d0562;
}
export function resolveMultiResultMainSwap({
  imageCount = 0,
  previousMainIndex = 0,
  nextMainIndex = 0
} = {}) {
  const _0x282af8 = toFiniteCount(imageCount);
  if (_0x282af8 <= 1) {
    return null;
  }
  const _0x9f89da = normalizeMainIndex(previousMainIndex, _0x282af8);
  const _0x119af9 = normalizeMainIndex(nextMainIndex, _0x282af8);
  if (_0x9f89da === _0x119af9) {
    return null;
  }
  return {
    consumedImageIndex: _0x119af9,
    replacementImageIndex: _0x9f89da
  };
}
export function getMultiResultBackplateKey(_0x475746 = []) {
  return (Array.isArray(_0x475746) ? _0x475746 : []).map((_0x42974f, _0x132453) => {
    const _0x5cc48f = normalizeBackplateItem(_0x42974f, _0x132453);
    return "" + _0x5cc48f.imageIndex;
  }).join(",");
}
export function getMultiResultBackplateIdentityKey(_0x79dab4 = []) {
  return (Array.isArray(_0x79dab4) ? _0x79dab4 : []).map((_0x12b86c, _0x31c421) => normalizeBackplateItem(_0x12b86c, _0x31c421).imageIndex).filter(_0x2ca023 => Number.isFinite(_0x2ca023)).sort((_0x3c2a38, _0x96a88b) => _0x3c2a38 - _0x96a88b).map(_0x1c5161 => "" + _0x1c5161).join(",");
}
export function getMultiResultBackplateDomIdentityKey(_0x425c40 = null) {
  const _0x2fd579 = Array.from(_0x425c40?.children || []);
  return getMultiResultBackplateIdentityKey(_0x2fd579.map(_0x4ac0e2 => ({
    imageIndex: Number(_0x4ac0e2?.dataset?.imageIndex)
  })));
}
export function shouldRefreshMultiResultStackDom({
  imageCount = 0,
  previewEl = null,
  containerEl = null,
  stackWrap = null,
  backdropWrap = null,
  backplateItems = null
} = {}) {
  const _0x1f7ba9 = getMultiResultBackplateCount(imageCount);
  if (_0x1f7ba9 <= 0) {
    return false;
  }
  if (!containerEl || !stackWrap || stackWrap.parentNode !== containerEl) {
    return true;
  }
  if (!backdropWrap || backdropWrap.parentNode !== stackWrap) {
    return true;
  }
  if ((Number(backdropWrap.children?.length) || 0) !== _0x1f7ba9) {
    return true;
  }
  if (Array.isArray(backplateItems)) {
    const _0x553aa0 = getMultiResultBackplateIdentityKey(backplateItems);
    if (_0x553aa0 && getMultiResultBackplateDomIdentityKey(backdropWrap) !== _0x553aa0) {
      return true;
    }
  }
  return !previewEl?.classList?.contains(MULTI_RESULT_STACK_PREVIEW_CLASS);
}
export function createMultiResultBackplates(_0x19060b, _0x4bf67d, _0xc215b3 = {}) {
  if (!_0x19060b?.createElement) {
    return null;
  }
  const _0x5172f3 = Array.isArray(_0xc215b3.items) ? _0xc215b3.items : null;
  const _0x101e5f = _0x5172f3 ? _0x5172f3.slice(0, MAX_MULTI_RESULT_BACKPLATES).map((_0xcec24b, _0x5c3b4f) => normalizeBackplateItem(_0xcec24b, _0x5c3b4f)) : Array.from({
    length: getMultiResultBackplateCount(_0x4bf67d)
  }, (_0x1ad16c, _0x1e0c8b) => normalizeBackplateItem({}, _0x1e0c8b + 1));
  if (_0x101e5f.length <= 0) {
    return null;
  }
  const _0x278d2d = _0x19060b.createElement("div");
  _0x278d2d.className = MULTI_RESULT_BACKPLATES_CLASS;
  _0x278d2d.setAttribute("aria-hidden", "true");
  for (let _0x60edc3 = 0; _0x60edc3 < _0x101e5f.length; _0x60edc3 += 1) {
    const _0x4e697f = _0x101e5f[_0x60edc3];
    const _0x19263a = _0x19060b.createElement("div");
    _0x19263a.className = MULTI_RESULT_BACKPLATE_CLASS;
    _0x19263a.dataset.stackIndex = String(_0x60edc3 + 1);
    _0x19263a.dataset.imageIndex = String(_0x4e697f.imageIndex);
    _0x278d2d.appendChild(_0x19263a);
  }
  return _0x278d2d;
}
export function syncMultiResultStackClasses({
  previewEl = null,
  stackWrap = null,
  isActive = false,
  isExpanded = false
} = {}) {
  const _0x57c964 = !!isActive;
  const _0x1ad608 = _0x57c964 && !!isExpanded;
  previewEl?.classList?.toggle(MULTI_RESULT_STACK_PREVIEW_CLASS, _0x57c964);
  previewEl?.classList?.toggle(MULTI_RESULT_STACK_EXPANDED_CLASS, _0x1ad608);
  stackWrap?.classList?.toggle(MULTI_RESULT_STACK_WRAP_EXPANDED_CLASS, _0x1ad608);
}
export function clearMultiResultStackClasses({
  previewEl = null,
  stackWrap = null
} = {}) {
  previewEl?.classList?.remove(MULTI_RESULT_STACK_PREVIEW_CLASS, MULTI_RESULT_STACK_EXPANDED_CLASS);
  stackWrap?.classList?.remove(MULTI_RESULT_STACK_WRAP_EXPANDED_CLASS);
}