export function registerDiagnosticsIpcHandlers({
  ipcMain: _0x13a179,
  diagnosticsOperations: _0x4310ac,
  logDiagnosticEvent: _0x10d7d5
}) {
  _0x13a179.handle("diagnostics:createPackage", async (_0x27048b, _0x505267 = {}) => {
    return await _0x4310ac.createPackage(_0x505267 && typeof _0x505267 === "object" ? _0x505267 : {});
  });
  _0x13a179.handle("diagnostics:openLogsFolder", () => _0x4310ac.openLogsFolder());
  _0x13a179.handle("diagnostics:logEvent", (_0x3c4e86, _0x3c0cda = {}) => {
    return _0x10d7d5({
      ...(_0x3c0cda && typeof _0x3c0cda === "object" ? _0x3c0cda : {}),
      source: _0x3c0cda?.source || "renderer"
    });
  });
  _0x13a179.on("diagnostics:dragImportLog", (_0x172e75, _0x1903f2 = {}) => {
    const _0x46cc6f = {
      label: String(_0x1903f2?.label || ""),
      ...(_0x1903f2?.payload && typeof _0x1903f2.payload === "object" ? _0x1903f2.payload : {})
    };
    console.log("[drag-import-prof] renderer", _0x46cc6f);
    _0x10d7d5({
      type: "import.drag_profile",
      level: "debug",
      source: "renderer",
      message: "Drag import profile",
      context: _0x46cc6f
    });
  });
}