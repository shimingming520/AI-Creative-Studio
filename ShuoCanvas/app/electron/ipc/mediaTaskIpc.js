export function registerMediaTaskIpcHandlers({
  ipcMain: _0x21afbc,
  getMediaTaskQueue: _0x6f700e
}) {
  _0x21afbc.handle("mediaTask:enqueue", (_0x5008f0, _0x599de7) => {
    return _0x6f700e().enqueue(_0x599de7 || {});
  });
  _0x21afbc.handle("mediaTask:cancel", (_0x39fcca, _0x1c8f86) => {
    const _0x419899 = _0x6f700e();
    const _0x132f1b = _0x1c8f86?.taskId || "";
    if (_0x1c8f86?.onlyIfWaiting === true) {
      return _0x419899.cancel(_0x132f1b, {
        onlyIfWaiting: true
      });
    }
    return _0x419899.cancel(_0x132f1b);
  });
  _0x21afbc.handle("mediaTask:list", (_0x3acfd9, _0x4a6d2f) => {
    return _0x6f700e().list({
      limit: _0x4a6d2f?.limit || 100
    });
  });
}