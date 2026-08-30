function normalizeKeyboardKey(_0x1f4ddc) {
  const _0x18f05e = String(_0x1f4ddc?.key || "").toLowerCase();
  if (_0x18f05e) {
    return _0x18f05e;
  }
  return String(_0x1f4ddc?.code || "").replace(/^Key/i, "").toLowerCase();
}
const INITIAL_APP_SHORTCUT_BINDINGS = Object.freeze(["CTRL+SHIFT+C"]);
function eventBinding(_0x4601c2) {
  const _0x459052 = [];
  if (_0x4601c2?.ctrlKey === true || _0x4601c2?.metaKey === true) {
    _0x459052.push("CTRL");
  }
  if (_0x4601c2?.shiftKey === true) {
    _0x459052.push("SHIFT");
  }
  if (_0x4601c2?.altKey === true) {
    _0x459052.push("ALT");
  }
  const _0x158eab = normalizeKeyboardKey(_0x4601c2);
  if (_0x158eab && !["control", "ctrl", "meta", "shift", "alt"].includes(_0x158eab)) {
    _0x459052.push(_0x158eab.toUpperCase());
  }
  return _0x459052.join("+");
}
function isConfiguredAppShortcut(_0x1da3b9, _0x3ddd26) {
  const _0x5a6cbd = eventBinding(_0x3ddd26);
  const _0x218d04 = Array.isArray(_0x1da3b9?.__aicConfiguredShortcutBindings) ? _0x1da3b9.__aicConfiguredShortcutBindings : INITIAL_APP_SHORTCUT_BINDINGS;
  return !!_0x5a6cbd && _0x218d04.includes(_0x5a6cbd);
}
function isInspectElementShortcut(_0x289326) {
  const _0x1c0e12 = normalizeKeyboardKey(_0x289326);
  return _0x1c0e12 === "c" && (_0x289326?.ctrlKey === true && _0x289326?.shiftKey === true || _0x289326?.metaKey === true && _0x289326?.shiftKey === true);
}
export function isPackagedChromeShellLocation(_0x2671a8 = globalThis.location) {
  try {
    const _0x54b331 = new URLSearchParams(String(_0x2671a8?.search || ""));
    return _0x54b331.get("aicRuntime") === "chrome-shell" && _0x54b331.get("aicPackaged") === "1";
  } catch {
    return false;
  }
}
export function isBlockedPackagedBrowserShortcut(_0xa8ef10) {
  const _0x180b7a = normalizeKeyboardKey(_0xa8ef10);
  if (_0x180b7a === "f5" || _0x180b7a === "f12") {
    return true;
  }
  const _0xdcfd4d = _0xa8ef10?.ctrlKey === true || _0xa8ef10?.metaKey === true;
  if (_0xdcfd4d && _0x180b7a === "r") {
    return true;
  }
  const _0x3575bd = _0xa8ef10?.ctrlKey === true && _0xa8ef10?.shiftKey === true || _0xa8ef10?.metaKey === true && _0xa8ef10?.altKey === true;
  const _0xc6ac56 = _0xa8ef10?.metaKey === true && _0xa8ef10?.shiftKey === true;
  return _0x3575bd && ["c", "i", "j"].includes(_0x180b7a) || _0xc6ac56 && _0x180b7a === "c";
}
export function installPackagedBrowserShortcutGuard({
  windowObject = globalThis.window,
  locationObject = windowObject?.location
} = {}) {
  if (!windowObject?.addEventListener) {
    return () => {};
  }
  const _0x59fe96 = _0x2eb73f => {
    if (windowObject.__aicShortcutRecording === true) {
      return;
    }
    const _0x21f5c7 = isBlockedPackagedBrowserShortcut(_0x2eb73f);
    if (_0x21f5c7 && isConfiguredAppShortcut(windowObject, _0x2eb73f)) {
      _0x2eb73f.preventDefault?.();
      return;
    }
    if (isInspectElementShortcut(_0x2eb73f)) {
      _0x2eb73f.preventDefault?.();
      return;
    }
    if (!isPackagedChromeShellLocation(locationObject)) {
      return;
    }
    if (!_0x21f5c7) {
      return;
    }
    _0x2eb73f.preventDefault?.();
    _0x2eb73f.stopImmediatePropagation?.();
  };
  windowObject.addEventListener("keydown", _0x59fe96, true);
  return () => {
    windowObject.removeEventListener?.("keydown", _0x59fe96, true);
  };
}