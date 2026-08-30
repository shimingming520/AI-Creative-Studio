function isUsableWindow(_0xa0b6c) {
  return !!_0xa0b6c && _0xa0b6c.isDestroyed?.() !== true;
}
function focusApp(_0x2873d3) {
  try {
    _0x2873d3?.focus?.({
      steal: true
    });
  } catch {
    try {
      _0x2873d3?.focus?.();
    } catch {}
  }
}
export function createForegroundDialogPresenterCore({
  app: _0x59b50f,
  dialog: _0x116be6,
  getMainWindow = () => null,
  shouldUseOwnerWindow = () => false,
  BrowserWindowClass: _0xa5af2b,
  screenApi: _0x39787e
} = {}) {
  let _0x55888a = null;
  function _0xb69fb0() {
    try {
      const _0x56b152 = _0x39787e.getDisplayNearestPoint(_0x39787e.getCursorScreenPoint());
      const _0x47cbd3 = _0x56b152?.workArea || _0x56b152?.bounds;
      if (_0x47cbd3) {
        return {
          x: Math.round(_0x47cbd3.x + Math.max(0, _0x47cbd3.width - 2)),
          y: Math.round(_0x47cbd3.y + Math.max(0, _0x47cbd3.height - 2)),
          width: 1,
          height: 1
        };
      }
    } catch {}
    return {
      x: -32000,
      y: -32000,
      width: 1,
      height: 1
    };
  }
  function _0x35723b() {
    _0x55888a = new _0xa5af2b({
      ..._0xb69fb0(),
      show: false,
      frame: false,
      transparent: true,
      opacity: 0,
      skipTaskbar: true,
      alwaysOnTop: true,
      focusable: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });
    _0x55888a.on("closed", () => {
      _0x55888a = null;
    });
    try {
      _0x55888a.setOpacity(0);
    } catch {}
    return _0x55888a;
  }
  function _0x32707d() {
    const _0x288949 = getMainWindow();
    if (isUsableWindow(_0x288949)) {
      return _0x288949;
    }
    if (!shouldUseOwnerWindow()) {
      return null;
    }
    if (isUsableWindow(_0x55888a)) {
      return _0x55888a;
    }
    return _0x35723b();
  }
  function _0xe86d5e(_0x1fbcb8) {
    if (!isUsableWindow(_0x1fbcb8)) {
      return false;
    }
    try {
      _0x1fbcb8.setBounds(_0xb69fb0());
    } catch {}
    try {
      _0x1fbcb8.setOpacity(0);
    } catch {}
    try {
      _0x1fbcb8.setAlwaysOnTop(true, "screen-saver");
    } catch {}
    try {
      _0x1fbcb8.show();
    } catch {}
    focusApp(_0x59b50f);
    try {
      _0x1fbcb8.focus();
    } catch {}
    try {
      _0x1fbcb8.moveTop();
    } catch {}
    return true;
  }
  function _0x577d86(_0x56cd68) {
    if (!isUsableWindow(_0x56cd68)) {
      return false;
    }
    try {
      if (_0x56cd68.isMinimized?.()) {
        _0x56cd68.restore?.();
      }
    } catch {}
    try {
      _0x56cd68.show();
    } catch {}
    focusApp(_0x59b50f);
    try {
      _0x56cd68.focus();
    } catch {}
    try {
      _0x56cd68.moveTop();
    } catch {}
    return true;
  }
  async function _0x18f31d(_0x316645, _0x594e50) {
    const _0x58fccd = _0x32707d();
    const _0x3e9660 = _0x58fccd && _0x58fccd === _0x55888a;
    if (_0x3e9660) {
      _0xe86d5e(_0x58fccd);
    } else if (_0x58fccd) {
      _0x577d86(_0x58fccd);
    }
    try {
      if (_0x58fccd) {
        return await _0x116be6[_0x316645](_0x58fccd, _0x594e50);
      } else {
        return await _0x116be6[_0x316645](_0x594e50);
      }
    } finally {
      if (_0x3e9660 && isUsableWindow(_0x55888a)) {
        try {
          _0x55888a.hide();
        } catch {}
      }
    }
  }
  function _0x8b834() {
    if (isUsableWindow(_0x55888a)) {
      _0x55888a.destroy();
    }
    _0x55888a = null;
  }
  return {
    destroyOwnerWindow: _0x8b834,
    getDialogParentWindow: _0x32707d,
    showOpenDialog: _0x2b1cf5 => _0x18f31d("showOpenDialog", _0x2b1cf5),
    showSaveDialog: _0x326847 => _0x18f31d("showSaveDialog", _0x326847)
  };
}