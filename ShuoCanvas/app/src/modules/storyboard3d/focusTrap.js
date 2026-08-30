export const STORYBOARD_3D_FOCUSABLE_SELECTOR = ["a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])", "select:not([disabled])", "textarea:not([disabled])", "[contenteditable='true']", "[tabindex]:not([tabindex='-1'])"].join(",");
function isFocusable(_0x20b791) {
  if (!_0x20b791 || _0x20b791.disabled === true || _0x20b791.hidden === true) {
    return false;
  }
  if (_0x20b791.inert === true || _0x20b791.getAttribute?.("aria-hidden") === "true") {
    return false;
  }
  if (_0x20b791.closest?.("[hidden], [aria-hidden='true'], [inert]")) {
    return false;
  }
  if (Number.isFinite(Number(_0x20b791.tabIndex)) && Number(_0x20b791.tabIndex) < 0) {
    return false;
  }
  return typeof _0x20b791.focus === "function";
}
function focusProgrammatically(_0x227776) {
  if (!_0x227776 || _0x227776.disabled === true || _0x227776.hidden === true) {
    return false;
  }
  if (_0x227776.inert === true || _0x227776.getAttribute?.("aria-hidden") === "true") {
    return false;
  }
  if (_0x227776.closest?.("[hidden], [aria-hidden='true'], [inert]")) {
    return false;
  }
  if (typeof _0x227776.focus !== "function") {
    return false;
  }
  _0x227776.focus({
    preventScroll: true
  });
  return true;
}
export function listStoryboard3DFocusableElements(_0x1d3c2e) {
  return [...(_0x1d3c2e?.querySelectorAll?.(STORYBOARD_3D_FOCUSABLE_SELECTOR) || [])].filter(isFocusable);
}
export function focusFirstStoryboard3DElement(_0x49973f, {
  preferredSelector = ""
} = {}) {
  const _0x2c5ff7 = preferredSelector ? _0x49973f?.querySelector?.(preferredSelector) : null;
  const _0x7598db = isFocusable(_0x2c5ff7) ? _0x2c5ff7 : listStoryboard3DFocusableElements(_0x49973f)[0] || _0x49973f;
  return focusProgrammatically(_0x7598db);
}
export function trapStoryboard3DTabKey(_0x2fa174, _0x10c555, _0x5d304c = globalThis.document) {
  if (_0x2fa174?.key !== "Tab" || !_0x10c555) {
    return false;
  }
  const _0x41bf5a = listStoryboard3DFocusableElements(_0x10c555);
  const _0x2c97d5 = _0x5d304c?.activeElement || null;
  const _0x279fc7 = _0x10c555.contains?.(_0x2c97d5) === true;
  let _0x4a202e = null;
  if (_0x41bf5a.length === 0) {
    _0x4a202e = _0x10c555;
  } else if (!_0x279fc7) {
    _0x4a202e = _0x2fa174.shiftKey ? _0x41bf5a.at(-1) : _0x41bf5a[0];
  } else if (_0x2fa174.shiftKey && _0x2c97d5 === _0x41bf5a[0]) {
    _0x4a202e = _0x41bf5a.at(-1);
  } else if (!_0x2fa174.shiftKey && _0x2c97d5 === _0x41bf5a.at(-1)) {
    _0x4a202e = _0x41bf5a[0];
  }
  if (!_0x4a202e || !focusProgrammatically(_0x4a202e)) {
    return false;
  }
  _0x2fa174.preventDefault?.();
  _0x2fa174.stopPropagation?.();
  return true;
}
export function restoreStoryboard3DFocus(_0x4512a3, _0x166385 = globalThis.document) {
  if (!isFocusable(_0x4512a3) || _0x4512a3.isConnected === false) {
    return false;
  }
  const _0x38c465 = _0x166385?.documentElement;
  if (_0x38c465?.contains && !_0x38c465.contains(_0x4512a3)) {
    return false;
  }
  _0x4512a3.focus({
    preventScroll: true
  });
  return true;
}