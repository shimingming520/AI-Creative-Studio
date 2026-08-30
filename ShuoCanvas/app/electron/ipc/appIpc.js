export function registerAppIpcHandlers({
  ipcMain: _0x33d4b7,
  getAppVersion: _0x3ad51c,
  getStableDeviceId: _0x599803,
  getUpdaterController: _0x49b2cc,
  getBackgroundCompletionNotifier: _0x30663c
}) {
  _0x33d4b7.handle("app:getVersion", () => {
    return _0x3ad51c();
  });
  _0x33d4b7.handle("app:getDeviceId", (_0x23a14f, _0x1a31d8 = {}) => {
    return _0x599803(_0x1a31d8);
  });
  _0x33d4b7.handle("appUpdater:getState", () => {
    return _0x49b2cc().getState();
  });
  _0x33d4b7.handle("appUpdater:checkForUpdates", async () => {
    return _0x49b2cc().checkForUpdates({
      manual: true
    });
  });
  _0x33d4b7.handle("appUpdater:quitAndInstall", () => {
    return _0x49b2cc().installDownloadedUpdate();
  });
  _0x33d4b7.handle("appUpdater:downloadUpdate", async () => {
    return _0x49b2cc().downloadUpdate();
  });
  _0x33d4b7.handle("appUpdater:cancelDownload", () => {
    return _0x49b2cc().cancelDownload();
  });
  _0x33d4b7.handle("notification:showGenerationComplete", (_0x69489, _0x3bc520 = {}) => {
    const _0x49c55e = _0x30663c?.();
    if (!_0x49c55e || typeof _0x49c55e.showGenerationComplete !== "function") {
      return {
        success: true,
        shown: false,
        reason: "unavailable"
      };
    }
    return _0x49c55e.showGenerationComplete(_0x3bc520 || {});
  });
}