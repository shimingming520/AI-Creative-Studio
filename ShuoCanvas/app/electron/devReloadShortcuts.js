function normalizeInputKey(_0x3fab68) {
  const _0xcda63c = String(_0x3fab68?.key || "").toLowerCase();
  if (_0xcda63c) {
    return _0xcda63c;
  }
  return String(_0x3fab68?.code || "").replace(/^Key/i, "").toLowerCase();
}
export function isPackagedBrowserShortcut(_0x11a6d5) {
  const _0x117a66 = normalizeInputKey(_0x11a6d5);
  if (_0x117a66 === "f5" || _0x117a66 === "f12") {
    return true;
  }
  const _0x1cdac6 = _0x11a6d5?.control === true || _0x11a6d5?.meta === true;
  if (_0x1cdac6 && _0x117a66 === "r") {
    return true;
  }
  const _0x5af371 = _0x11a6d5?.control === true && _0x11a6d5?.shift === true || _0x11a6d5?.meta === true && _0x11a6d5?.alt === true;
  return _0x5af371 && ["c", "i", "j"].includes(_0x117a66);
}
export function installDevReloadShortcuts({
  app: _0x3e618d,
  window: _0x4f1093
}) {
  if (!_0x4f1093) {
    return;
  }
  _0x4f1093.webContents.on("before-input-event", (_0x1355ce, _0x31fa57) => {
    if (_0x31fa57?.type !== "keyDown") {
      return;
    }
    if (_0x3e618d?.isPackaged) {
      const _0x3132c9 = normalizeInputKey(_0x31fa57);
      const _0x1098c5 = _0x3132c9 === "f5" || (_0x31fa57.control || _0x31fa57.meta) && _0x3132c9 === "r";
      if (_0x1098c5) {
        _0x1355ce.preventDefault();
      }
      return;
    }
    const _0x1d1f00 = normalizeInputKey(_0x31fa57);
    const _0x43b37f = _0x1d1f00 === "f5" || (_0x31fa57.control || _0x31fa57.meta) && _0x1d1f00 === "r";
    if (!_0x43b37f) {
      return;
    }
    _0x1355ce.preventDefault();
    if (_0x31fa57.shift) {
      _0x4f1093.webContents.reloadIgnoringCache();
      return;
    }
    _0x4f1093.webContents.reload();
  });
}