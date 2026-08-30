function createBlobFromBase64(_0x53cf6b, _0x1e5509 = "image/png") {
  const _0x5a876f = atob(String(_0x53cf6b || ""));
  const _0x2807f2 = [];
  for (let _0x2b6f57 = 0; _0x2b6f57 < _0x5a876f.length; _0x2b6f57 += 8192) {
    const _0x4548d5 = _0x5a876f.slice(_0x2b6f57, _0x2b6f57 + 8192);
    const _0x399254 = new Uint8Array(_0x4548d5.length);
    for (let _0x2a704c = 0; _0x2a704c < _0x4548d5.length; _0x2a704c += 1) {
      _0x399254[_0x2a704c] = _0x4548d5.charCodeAt(_0x2a704c);
    }
    _0x2807f2.push(_0x399254);
  }
  return new Blob(_0x2807f2, {
    type: _0x1e5509
  });
}
export function installGlobalScreenshotBridge({
  screenshotApi: _0x2adc6e,
  createMediaNodeFromBlob: _0x264857,
  showToast: _0x191191,
  translate: _0x4df5eb,
  consoleObject = console
} = {}) {
  if (!_0x2adc6e) {
    return;
  }
  const _0x458073 = typeof _0x4df5eb === "function" ? _0x4df5eb : (_0x4b6b9d, _0x17d583 = {}) => String(_0x4b6b9d || "").replace(/\{(\w+)\}/g, (_0x30b5e0, _0x2b5a84) => _0x17d583[_0x2b5a84] || "");
  _0x2adc6e.onGlobalCapture?.(async (_0xa41931 = {}) => {
    try {
      const _0x1946d5 = String(_0xa41931?.pngBase64 || "").trim();
      if (!_0x1946d5) {
        return;
      }
      const _0x2f7d75 = String(_0xa41931?.mimeType || "image/png") || "image/png";
      const _0x4418f9 = createBlobFromBase64(_0x1946d5, _0x2f7d75);
      const _0x160225 = await _0x264857?.(_0x4418f9, _0x2f7d75, {
        name: _0x458073("globalScreenshot.nodeName"),
        placement: "viewport-center-sequence",
        sequenceKey: "global-screenshot"
      });
      if (_0x160225) {
        _0x191191?.(_0x458073("globalScreenshot.added"), "success");
      } else {
        _0x191191?.(_0x458073("globalScreenshot.importFailed"), "error");
      }
    } catch (_0x3fa58d) {
      consoleObject.error?.("[screenshot] failed to import global capture", _0x3fa58d);
      _0x191191?.(_0x458073("globalScreenshot.importFailed"), "error");
    }
  });
  _0x2adc6e.onGlobalShortcutStatus?.((_0x5a62fe = {}) => {
    if (_0x5a62fe?.registered === false && _0x5a62fe?.reason === "registration-failed") {
      _0x191191?.(_0x458073("globalScreenshot.shortcutRegistrationFailed", {
        accelerator: _0x5a62fe?.accelerator || "Alt+Q"
      }), "warn");
      return;
    }
    if (_0x5a62fe?.registered === true && _0x5a62fe?.ok === false) {
      _0x191191?.(_0x458073("globalScreenshot.captureFailed"), "error");
    }
  });
}