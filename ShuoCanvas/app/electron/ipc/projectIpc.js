export function registerProjectIpcHandlers({
  ipcMain: _0x12c754,
  projectOperations: _0x1d5aac
}) {
  _0x12c754.handle("project:open", (_0x431351, _0xfe9880) => {
    return _0x1d5aac.open(_0xfe9880);
  });
  _0x12c754.handle("project:save", (_0x316ef1, _0x530ecd) => {
    return _0x1d5aac.save(_0x530ecd);
  });
  _0x12c754.handle("project:exportPackage", async (_0x35abc4, _0x54d223) => {
    return await _0x1d5aac.exportPackage(_0x54d223, {
      sender: _0x35abc4?.sender || null
    });
  });
  _0x12c754.handle("project:importPackage", async (_0x12b4cd, _0x4a1bd1) => {
    return await _0x1d5aac.importPackage(_0x4a1bd1, {
      sender: _0x12b4cd?.sender || null
    });
  });
  _0x12c754.on("project:setUnsavedState", (_0xbe7847, _0x230aa5 = {}) => {
    _0x1d5aac.setUnsavedState(_0x230aa5);
  });
  _0x12c754.handle("project:listRecent", () => {
    return _0x1d5aac.listRecent();
  });
  _0x12c754.handle("project:removeRecent", (_0x218626, _0x42b719) => {
    return _0x1d5aac.removeRecent(_0x42b719);
  });
  _0x12c754.handle("project:consumeExternalOpenRequests", () => {
    return _0x1d5aac.consumeExternalOpenRequests();
  });
  _0x12c754.handle("project:writeRecoverySnapshot", (_0x2b5e98, _0x4498ea = {}) => {
    return _0x1d5aac.writeRecoverySnapshot(_0x4498ea);
  });
  _0x12c754.handle("project:getRecoverySnapshotInfo", (_0x108dd1, _0x38b16c = {}) => {
    return _0x1d5aac.getRecoverySnapshotInfo(_0x38b16c);
  });
  _0x12c754.handle("project:readRecoverySnapshot", () => {
    return _0x1d5aac.readRecoverySnapshot();
  });
  _0x12c754.handle("project:clearRecoverySnapshot", () => {
    return _0x1d5aac.clearRecoverySnapshot();
  });
}