export function registerSecureSettingsIpcHandlers({
  ipcMain: _0x1f2b3d,
  secureSettingsOperations: _0x27ef74
}) {
  _0x1f2b3d.handle("secureSettings:get", (_0x3e4a82, _0x3c54bc = {}) => {
    return _0x27ef74.get(_0x3c54bc);
  });
  _0x1f2b3d.handle("secureSettings:set", (_0x4504a0, _0x535210 = {}) => {
    return _0x27ef74.set(_0x535210);
  });
  _0x1f2b3d.handle("secureSettings:delete", (_0x22da17, _0x52c23e = {}) => {
    return _0x27ef74.delete(_0x52c23e);
  });
}