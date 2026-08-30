export function registerScreenshotIpcHandlers({
  ipcMain: _0xbd91b3,
  captureDesktopDisplay: _0x43e328,
  configureGlobalScreenshotShortcut: _0x413dc7,
  handleScreenshotOverlayConfirm: _0x4dae60,
  handleScreenshotOverlayCancel: _0x767313
}) {
  _0xbd91b3.handle("screenshot:captureDisplay", async () => {
    if (typeof _0x43e328 !== "function") {
      return {
        ok: false,
        reason: "not-supported"
      };
    }
    try {
      return await _0x43e328();
    } catch (_0x5c4937) {
      return {
        ok: false,
        reason: "capture-failed",
        error: String(_0x5c4937?.message || _0x5c4937)
      };
    }
  });
  _0xbd91b3.handle("screenshot:overlayConfirm", async (_0x101e3b, _0x3e7766) => {
    if (typeof _0x4dae60 !== "function") {
      return {
        ok: false,
        reason: "not-supported"
      };
    }
    return await _0x4dae60(_0x3e7766);
  });
  _0xbd91b3.handle("screenshot:overlayCancel", async () => {
    if (typeof _0x767313 !== "function") {
      return {
        ok: false,
        reason: "not-supported"
      };
    }
    return await _0x767313();
  });
  _0xbd91b3.handle("screenshot:updateGlobalShortcut", async (_0x102349, _0x59f713) => {
    if (typeof _0x413dc7 !== "function") {
      return {
        ok: false,
        reason: "not-supported"
      };
    }
    return _0x413dc7(_0x59f713);
  });
}