export function bindRunningHubInstanceDevMode(_0x5f0069, {
  commitValue: _0x3b0d53,
  getNodeData: _0x30e400,
  getNodeFieldValue: _0x41e6d9
}) {
  const _0x57a407 = _0x5f0069?.ownerDocument?.defaultView || globalThis.window;
  const _0x3c0a82 = _0x28b09a => {
    const _0x41a721 = _0x28b09a?.detail?.enabled === true;
    _0x5f0069?.querySelectorAll?.(".ui-schema-instance-toggle[data-ui-schema-developer-values]")?.forEach?.(_0x53f222 => {
      _0x53f222.dataset.uiSchemaDeveloperMode = _0x41a721 ? "true" : "false";
      if (_0x41a721) {
        return;
      }
      let _0x30b1db = [];
      try {
        _0x30b1db = JSON.parse(_0x53f222.dataset.uiSchemaDeveloperValues || "[]").map(_0x319ba9 => String(_0x319ba9));
      } catch {
        _0x30b1db = [];
      }
      const _0x4e305e = String(_0x53f222.dataset.uiSchemaField || "").trim();
      const _0x9f57c0 = typeof _0x30e400 === "function" ? _0x30e400() || {} : {};
      const _0x50a07b = _0x41e6d9(_0x9f57c0, _0x4e305e, _0x53f222.dataset.uiSchemaDefault);
      if (_0x4e305e && _0x30b1db.includes(String(_0x50a07b ?? ""))) {
        _0x3b0d53(_0x4e305e, _0x53f222.dataset.uiSchemaNormalDefault || "default");
      }
    });
  };
  _0x57a407?.addEventListener?.("dev-mode-changed", _0x3c0a82);
  _0x3c0a82({
    detail: {
      enabled: _0x57a407?.DEV_MODE === true
    }
  });
  return () => {
    _0x57a407?.removeEventListener?.("dev-mode-changed", _0x3c0a82);
  };
}