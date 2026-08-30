export function createStartupHelpers({
  appDisplayName: _0x5b4f62,
  appOrigin: _0x4ea135,
  getMainWindow: _0xb47cce,
  logDiagnosticEvent: _0x743456,
  shellApi: _0x56d368,
  normalizeExternalUrl: _0x15011c,
  formatExternalUrlForLog: _0x4b8320
}) {
  const _0x45e166 = _0x5a466c => new Promise(_0x4470db => {
    setTimeout(_0x4470db, _0x5a466c);
  });
  function _0x1cb197(_0x368f72) {
    return String(_0x368f72 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function _0x36381e(_0x2430fb = {}) {
    const _0x2d8d7a = String(_0x2430fb.kind || "loading");
    const _0x186f97 = _0x1cb197(_0x2430fb.title || _0x5b4f62 + " 正在启动");
    const _0xfd2934 = _0x1cb197(_0x2430fb.detail || "");
    const _0x40c44d = _0x1cb197(_0x2430fb.hint || "");
    const _0x3a64cf = _0x2d8d7a === "error";
    return "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>" + _0x186f97 + "</title>\n  <style>\n    :root {\n      color-scheme: light dark;\n      font-family: \"Segoe UI\", Arial, sans-serif;\n      background: Canvas;\n      color: CanvasText;\n    }\n    body {\n      margin: 0;\n      min-height: 100vh;\n      display: grid;\n      place-items: center;\n      background: Canvas;\n    }\n    main {\n      width: min(560px, calc(100vw - 56px));\n    }\n    h1 {\n      margin: 0 0 14px;\n      font-size: 24px;\n      font-weight: 650;\n      letter-spacing: 0;\n    }\n    p {\n      margin: 8px 0;\n      color: GrayText;\n      line-height: 1.55;\n      font-size: 14px;\n    }\n    .mark {\n      width: 40px;\n      height: 40px;\n      border-radius: 50%;\n      margin-bottom: 22px;\n      border: 3px solid " + (_0x3a64cf ? "Mark" : "AccentColor") + ";\n      border-top-color: transparent;\n      animation: " + (_0x3a64cf ? "none" : "spin 0.9s linear infinite") + ";\n    }\n    @keyframes spin {\n      to { transform: rotate(360deg); }\n    }\n  </style>\n</head>\n<body>\n  <main>\n    <div class=\"mark\"></div>\n    <h1>" + _0x186f97 + "</h1>\n    " + (_0xfd2934 ? "<p>" + _0xfd2934 + "</p>" : "") + "\n    " + (_0x40c44d ? "<p>" + _0x40c44d + "</p>" : "") + "\n  </main>\n</body>\n</html>";
  }
  function _0x3e6930(_0x5c93f6) {
    const _0x32794a = _0xb47cce();
    if (!_0x32794a || _0x32794a.isDestroyed()) {
      return;
    }
    const _0x1a781b = _0x36381e(_0x5c93f6);
    _0x32794a.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(_0x1a781b));
  }
  function _0x4cdc6a(_0x3703d5) {
    try {
      const _0x3c14a7 = new URL(_0x3703d5);
      return _0x3c14a7.origin === _0x4ea135;
    } catch {
      return false;
    }
  }
  function _0x511449(_0x3360da) {
    const _0x305aaf = _0x15011c(_0x3360da);
    if (!_0x305aaf) {
      _0x743456({
        type: "external_link.blocked",
        level: "warn",
        source: "main",
        message: "Blocked external link",
        context: {
          reason: "invalid-or-disallowed-protocol"
        }
      });
      return {
        ok: false,
        error: "不允许打开该外部链接"
      };
    }
    _0x56d368.openExternal(_0x305aaf);
    _0x743456({
      type: "external_link.opened",
      level: "info",
      source: "main",
      message: "Opened external link",
      context: {
        url: _0x4b8320(_0x305aaf)
      }
    });
    return {
      ok: true,
      url: _0x305aaf
    };
  }
  return {
    delay: _0x45e166,
    loadStartupStatus: _0x3e6930,
    isLocalAppUrl: _0x4cdc6a,
    openExternalUrl: _0x511449
  };
}