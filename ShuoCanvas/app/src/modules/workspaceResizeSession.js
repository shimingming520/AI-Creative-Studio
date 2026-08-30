export function beginWorkspaceHorizontalResizeSession({
  event: _0x2b81d6,
  splitter: _0xdfb9e0,
  layout: _0x5a4993,
  windowObject = globalThis.window,
  body = globalThis.document?.body,
  resizingClass = "",
  onRatio: _0x12c55d,
  onFinish = null
} = {}) {
  if (!_0x2b81d6 || !_0xdfb9e0 || !_0x5a4993 || typeof _0x12c55d !== "function") {
    return false;
  }
  if (_0x2b81d6.isPrimary === false || Number.isFinite(_0x2b81d6.button) && _0x2b81d6.button !== 0) {
    return false;
  }
  const _0x29d7ae = _0x5a4993.getBoundingClientRect?.();
  if (!_0x29d7ae?.width) {
    return false;
  }
  _0x2b81d6.preventDefault?.();
  _0x2b81d6.stopPropagation?.();
  const _0x221f9a = _0x2b81d6.pointerId;
  try {
    _0xdfb9e0.setPointerCapture?.(_0x221f9a);
  } catch {}
  if (resizingClass) {
    body?.classList?.add?.(resizingClass);
  }
  const _0x24fe37 = _0x5782db => !Number.isFinite(Number(_0x221f9a)) || !Number.isFinite(Number(_0x5782db?.pointerId)) || Number(_0x5782db.pointerId) === Number(_0x221f9a);
  const _0x4749e2 = _0x361138 => {
    if (!_0x24fe37(_0x361138)) {
      return;
    }
    _0x12c55d((Number(_0x361138?.clientX) - _0x29d7ae.left) / _0x29d7ae.width * 100, _0x361138);
  };
  const _0x5bbc76 = _0x9d24ed => {
    if (!_0x24fe37(_0x9d24ed)) {
      return;
    }
    if (resizingClass) {
      body?.classList?.remove?.(resizingClass);
    }
    try {
      if (_0xdfb9e0.hasPointerCapture?.(_0x221f9a)) {
        _0xdfb9e0.releasePointerCapture(_0x221f9a);
      }
    } catch {}
    windowObject?.removeEventListener?.("pointermove", _0x4749e2);
    windowObject?.removeEventListener?.("pointerup", _0x5bbc76);
    windowObject?.removeEventListener?.("pointercancel", _0x5bbc76);
    onFinish?.(_0x9d24ed);
  };
  windowObject?.addEventListener?.("pointermove", _0x4749e2);
  windowObject?.addEventListener?.("pointerup", _0x5bbc76);
  windowObject?.addEventListener?.("pointercancel", _0x5bbc76);
  return true;
}