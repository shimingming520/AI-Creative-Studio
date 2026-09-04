export const ICON_BUTTON_ACTIVATION_CLASS = "is-icon-activating";
export const ICON_BUTTON_ACTIVATION_ANIMATION = "canvas-chrome-icon-activate";
function defaultRequestFrame(_0x2930ae) {
  const _0x5cc988 = globalThis.requestAnimationFrame;
  if (typeof _0x5cc988 === "function") {
    return _0x5cc988.call(globalThis, _0x2930ae);
  }
  _0x2930ae();
  return null;
}
function defaultPrefersReducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}
export function bindIconButtonMotion(_0x1ba1c2, {
  activeClass = ICON_BUTTON_ACTIVATION_CLASS,
  animationName = ICON_BUTTON_ACTIVATION_ANIMATION,
  durationMs = 320,
  requestFrame = defaultRequestFrame,
  setTimer = globalThis.setTimeout?.bind(globalThis),
  clearTimer = globalThis.clearTimeout?.bind(globalThis),
  prefersReducedMotion = defaultPrefersReducedMotion
} = {}) {
  const _0x1fb61e = [];
  const _0x3fb4e8 = new Set(_0x1ba1c2 ? Array.from(_0x1ba1c2) : []);
  for (const _0x16e613 of _0x3fb4e8) {
    if (!_0x16e613?.addEventListener || !_0x16e613?.classList) {
      continue;
    }
    let _0xf98e98 = false;
    let _0x1d71a6 = 0;
    let _0x161d07 = null;
    const _0x3a83b5 = () => {
      _0x1d71a6 += 1;
      if (_0x161d07 !== null) {
        clearTimer?.(_0x161d07);
        _0x161d07 = null;
      }
      _0x16e613.classList.remove(activeClass);
    };
    const _0x18f2af = () => {
      if (_0x16e613.disabled || prefersReducedMotion()) {
        _0x3a83b5();
        return;
      }
      _0x1d71a6 += 1;
      const _0x3aeb07 = _0x1d71a6;
      if (_0x161d07 !== null) {
        clearTimer?.(_0x161d07);
        _0x161d07 = null;
      }
      _0x16e613.classList.remove(activeClass);
      requestFrame(() => {
        if (_0xf98e98 || _0x3aeb07 !== _0x1d71a6) {
          return;
        }
        _0x16e613.classList.add(activeClass);
        if (typeof setTimer === "function") {
          _0x161d07 = setTimer(_0x3a83b5, durationMs);
        }
      });
    };
    const _0x6f1527 = _0x27b4cd => {
      if (_0x27b4cd?.animationName !== animationName) {
        return;
      }
      _0x3a83b5();
    };
    _0x16e613.addEventListener("click", _0x18f2af);
    _0x16e613.addEventListener("animationend", _0x6f1527);
    _0x1fb61e.push(() => {
      _0xf98e98 = true;
      _0x3a83b5();
      _0x16e613.removeEventListener?.("click", _0x18f2af);
      _0x16e613.removeEventListener?.("animationend", _0x6f1527);
    });
  }
  return () => {
    _0x1fb61e.forEach(_0xa983d7 => _0xa983d7());
  };
}