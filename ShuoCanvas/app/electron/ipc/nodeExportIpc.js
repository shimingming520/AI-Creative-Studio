export function registerNodeExportIpcHandlers({
  ipcMain: _0x32bd78,
  exportSelectedNodesPackage: _0x3c5bad,
  saveMediaFile: _0x2ad36e,
  saveTextFile: _0x297ae9,
  saveMediaFiles: _0x464ef1
}) {
  _0x32bd78.handle("nodeExport:exportSelected", async (_0x2286ce, _0x1084e4) => {
    if (typeof _0x3c5bad !== "function") {
      throw new Error("当前环境不支持批量下载节点");
    }
    return await _0x3c5bad(_0x1084e4 || {});
  });
  _0x32bd78.handle("nodeExport:saveMedia", async (_0x245665, _0x2b31a2) => {
    if (typeof _0x2ad36e !== "function") {
      throw new Error("当前环境不支持保存媒体文件");
    }
    return await _0x2ad36e(_0x2b31a2 || {});
  });
  _0x32bd78.handle("nodeExport:saveText", async (_0x4ae8f4, _0x2b7baf) => {
    if (typeof _0x297ae9 !== "function") {
      throw new Error("当前环境不支持保存文本文件");
    }
    return await _0x297ae9(_0x2b7baf || {});
  });
  _0x32bd78.handle("nodeExport:saveMediaFiles", async (_0xa28880, _0x5b2152) => {
    if (typeof _0x464ef1 !== "function") {
      throw new Error("当前环境不支持批量保存媒体文件");
    }
    return await _0x464ef1(_0x5b2152 || {});
  });
}