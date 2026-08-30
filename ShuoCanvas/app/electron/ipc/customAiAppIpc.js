import { createCustomAiAppStorage } from "../customAiAppStorage.js";
export function registerCustomAiAppIpcHandlers({
  ipcMain: _0x595b7b,
  getCustomAiAppStorage: _0x1ed1ac,
  getDataDir: _0x40f3be
}) {
  let _0x34510f = null;
  function _0xc57a9c() {
    if (typeof _0x1ed1ac === "function") {
      return _0x1ed1ac();
    }
    if (!_0x34510f) {
      _0x34510f = createCustomAiAppStorage({
        getDataDir: _0x40f3be
      });
    }
    return _0x34510f;
  }
  _0x595b7b.handle("customAiApps:read", () => {
    return _0xc57a9c().read();
  });
  _0x595b7b.handle("customAiApps:write", (_0x4a1b9c, _0x1e9703 = {}) => {
    return _0xc57a9c().write(_0x1e9703 || {});
  });
}