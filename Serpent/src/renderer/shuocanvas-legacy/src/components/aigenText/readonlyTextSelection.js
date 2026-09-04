function getCaretRangeFromPoint(_0x17a8b6, _0x60905f, _0x14f3bb) {
  if (typeof _0x17a8b6?.caretRangeFromPoint === "function") {
    return _0x17a8b6.caretRangeFromPoint(_0x60905f, _0x14f3bb);
  }
  const _0x3f8c1c = _0x17a8b6?.caretPositionFromPoint?.(_0x60905f, _0x14f3bb);
  if (!_0x3f8c1c || typeof _0x17a8b6?.createRange !== "function") {
    return null;
  }
  const _0x4214f0 = _0x17a8b6.createRange();
  _0x4214f0.setStart(_0x3f8c1c.offsetNode, _0x3f8c1c.offset);
  return _0x4214f0;
}
function setSelection(_0x5f4888, _0xebfb53, _0x5e0566) {
  const _0xd1901c = _0x5f4888?.getSelection?.();
  if (!_0xd1901c || !_0xebfb53 || !_0x5e0566) {
    return;
  }
  _0xd1901c.removeAllRanges();
  if (typeof _0xd1901c.setBaseAndExtent === "function") {
    _0xd1901c.setBaseAndExtent(_0xebfb53.startContainer, _0xebfb53.startOffset, _0x5e0566.startContainer, _0x5e0566.startOffset);
    return;
  }
  const _0x25080e = _0xebfb53.startContainer.ownerDocument.createRange();
  _0x25080e.setStart(_0xebfb53.startContainer, _0xebfb53.startOffset);
  _0x25080e.setEnd(_0x5e0566.startContainer, _0x5e0566.startOffset);
  _0xd1901c.addRange(_0x25080e);
}
function findActiveReadonlyTextRoot(_0x5318e7) {
  if (!_0x5318e7) {
    return null;
  }
  const _0x14257f = _0x5318e7.nodeType === 1 ? _0x5318e7 : _0x5318e7.parentElement;
  if (!_0x14257f) {
    return null;
  }
  if (typeof _0x14257f.closest === "function") {
    return _0x14257f.closest(".aigen-text-output.is-text-selection-active") || _0x14257f.closest("[data-readonly-text-selection-root=\"true\"]");
  }
  let _0x50ca9a = _0x14257f;
  while (_0x50ca9a) {
    if (_0x50ca9a.classList?.contains?.("aigen-text-output") && _0x50ca9a.classList?.contains?.("is-text-selection-active")) {
      return _0x50ca9a;
    }
    if (_0x50ca9a.dataset?.readonlyTextSelectionRoot === "true") {
      return _0x50ca9a;
    }
    _0x50ca9a = _0x50ca9a.parentElement;
  }
  return null;
}
function rangeTouchesActiveReadonlyText(_0x2e0054, _0x52df59) {
  if (!_0x2e0054) {
    return false;
  }
  if (findActiveReadonlyTextRoot(_0x2e0054.commonAncestorContainer) || findActiveReadonlyTextRoot(_0x2e0054.startContainer) || findActiveReadonlyTextRoot(_0x2e0054.endContainer)) {
    return true;
  }
  const _0x4cffde = Array.from(_0x52df59?.querySelectorAll?.(".aigen-text-output.is-text-selection-active, [data-readonly-text-selection-root=\"true\"]") || []);
  return _0x4cffde.some(_0x559a8a => {
    try {
      if (typeof _0x2e0054.intersectsNode === "function") {
        return _0x2e0054.intersectsNode(_0x559a8a);
      }
    } catch (_0x37bc50) {
      return false;
    }
    return _0x559a8a.contains?.(_0x2e0054.startContainer) || _0x559a8a.contains?.(_0x2e0054.endContainer);
  });
}
export function hasActiveReadonlyTextSelection(_0x810f6d = document) {
  const _0xc0465a = _0x810f6d?.getSelection?.();
  if (!_0xc0465a || _0xc0465a.isCollapsed || !String(_0xc0465a.toString?.() || "").trim()) {
    return false;
  }
  const _0x34daf7 = Number(_0xc0465a.rangeCount) || 0;
  for (let _0x287612 = 0; _0x287612 < _0x34daf7; _0x287612 += 1) {
    if (rangeTouchesActiveReadonlyText(_0xc0465a.getRangeAt(_0x287612), _0x810f6d)) {
      return true;
    }
  }
  return false;
}
export function bindReadonlyTextSelection(_0x3ee3e6, _0x22c0fa = {}) {
  if (!_0x3ee3e6?.addEventListener) {
    return () => {};
  }
  const _0x215513 = _0x3ee3e6.ownerDocument || document;
  const _0x1316a8 = _0x215513.defaultView || window;
  let _0x5b9cd6 = false;
  const _0x46313c = () => {
    if (_0x5b9cd6) {
      return;
    }
    _0x5b9cd6 = true;
    _0x3ee3e6.classList?.add("is-text-selection-active");
    _0x22c0fa.onActivate?.();
  };
  const _0xe57789 = () => {
    if (!_0x5b9cd6) {
      return;
    }
    _0x5b9cd6 = false;
    _0x22c0fa.onDeactivate?.();
    _0x3ee3e6.classList?.remove("is-text-selection-active");
    _0x215513.body?.classList.remove("is-aigen-text-selecting");
  };
  const _0x347b4b = _0x503e2f => {
    if (_0x503e2f.button !== 0) {
      return;
    }
    if (!_0x5b9cd6) {
      return;
    }
    _0x503e2f.preventDefault();
    _0x503e2f.stopPropagation();
    _0x215513.body?.classList.add("is-aigen-text-selecting");
    const _0x4accc6 = getCaretRangeFromPoint(_0x215513, _0x503e2f.clientX, _0x503e2f.clientY);
    const _0x13fe68 = _0x32a815 => {
      const _0x42ba5a = getCaretRangeFromPoint(_0x215513, _0x32a815.clientX, _0x32a815.clientY);
      if (_0x4accc6 && _0x42ba5a && _0x3ee3e6.contains(_0x4accc6.startContainer) && _0x3ee3e6.contains(_0x42ba5a.startContainer)) {
        setSelection(_0x1316a8, _0x4accc6, _0x42ba5a);
      }
      _0x32a815.preventDefault();
      _0x32a815.stopPropagation();
    };
    const _0x18d57d = _0x26e21f => {
      _0x13fe68(_0x26e21f);
      _0x215513.body?.classList.remove("is-aigen-text-selecting");
      _0x215513.removeEventListener("pointermove", _0x13fe68, true);
      _0x215513.removeEventListener("pointerup", _0x18d57d, true);
      _0x215513.removeEventListener("pointercancel", _0x18d57d, true);
    };
    _0x215513.addEventListener("pointermove", _0x13fe68, true);
    _0x215513.addEventListener("pointerup", _0x18d57d, true);
    _0x215513.addEventListener("pointercancel", _0x18d57d, true);
  };
  const _0x3c4b56 = _0x2ee38d => {
    _0x2ee38d.preventDefault();
    _0x2ee38d.stopPropagation();
    _0x46313c();
  };
  const _0xb55c16 = _0x57d3bd => {
    if (!_0x5b9cd6 || _0x3ee3e6.contains(_0x57d3bd.target)) {
      return;
    }
    _0xe57789();
  };
  const _0x3fda17 = _0x17bb37 => {
    if (_0x17bb37.key === "Escape") {
      _0xe57789();
    }
  };
  _0x3ee3e6.addEventListener("pointerdown", _0x347b4b, true);
  _0x3ee3e6.addEventListener("dblclick", _0x3c4b56);
  _0x215513.addEventListener("pointerdown", _0xb55c16, true);
  _0x215513.addEventListener("keydown", _0x3fda17, true);
  return () => {
    _0xe57789();
    _0x3ee3e6.removeEventListener("pointerdown", _0x347b4b, true);
    _0x3ee3e6.removeEventListener("dblclick", _0x3c4b56);
    _0x215513.removeEventListener("pointerdown", _0xb55c16, true);
    _0x215513.removeEventListener("keydown", _0x3fda17, true);
  };
}