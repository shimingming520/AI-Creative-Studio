export function renderRunningHubInstanceControl(_0x13a76d, _0x3d502f, {
  escapeHtmlAttr: _0x50f2aa,
  getFieldValue: _0x4987fc,
  isOptionHidden: _0x3a07a4,
  manifestText: _0x59127b,
  renderDropdownControl: _0x52664f
}) {
  const _0x36367a = String(_0x13a76d?.id || "").trim();
  const _0x4bda8f = String(_0x4987fc(_0x3d502f, _0x13a76d) || _0x13a76d?.defaultValue || "");
  const _0x33f7c5 = (Array.isArray(_0x13a76d?.options) ? _0x13a76d.options : []).filter(_0x527d42 => !_0x3a07a4(_0x527d42, _0x3d502f));
  const _0x42f4dc = Math.max(0, _0x33f7c5.findIndex(_0x5937dd => String(_0x5937dd?.value ?? _0x5937dd) === _0x4bda8f));
  const _0x5d289e = _0x33f7c5[_0x42f4dc] || _0x33f7c5[0] || {};
  const _0x452aba = _0x33f7c5[(_0x42f4dc + 1) % Math.max(1, _0x33f7c5.length)] || _0x5d289e;
  const _0x523e1c = Array.isArray(_0x13a76d?.developerOptions) ? _0x13a76d.developerOptions.filter(_0x1b2d00 => !_0x3a07a4(_0x1b2d00, _0x3d502f)) : [];
  const _0x5e7b8b = _0x33f7c5.map(_0x4e7cc7 => ({
    value: String(_0x4e7cc7?.value ?? _0x4e7cc7),
    label: _0x59127b(_0x4e7cc7?.label ?? _0x4e7cc7?.value ?? _0x4e7cc7)
  }));
  const _0x1687c4 = _0x523e1c.map(_0x386c22 => String(_0x386c22?.value ?? _0x386c22));
  const _0x8b4c8b = _0x5e7b8b.some(_0x313980 => _0x313980.value === String(_0x13a76d?.defaultValue ?? "")) ? String(_0x13a76d?.defaultValue ?? "") : _0x5e7b8b[0]?.value || "default";
  const _0x31cef5 = {
    ..._0x13a76d,
    options: [..._0x33f7c5, ..._0x523e1c],
    developerOptions: []
  };
  const _0x1251bf = _0x523e1c.length ? "<div class=\"ui-schema-instance-developer-control\">" + _0x52664f(_0x31cef5, _0x4bda8f, _0x3d502f, {
    titleHtml: "<div class=\"floating-menu-title ui-schema-floating-menu-title\">" + _0x50f2aa(_0x59127b(_0x13a76d?.label || "显存")) + "</div>"
  }) + "</div>" : "";
  return "<div class=\"ui-schema-field rh-vram-wrap ui-schema-instance-toggle\" data-ui-schema-field=\"" + _0x50f2aa(_0x36367a) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + _0x50f2aa(_0x13a76d?.defaultValue ?? "") + "\" data-ui-schema-normal-default=\"" + _0x50f2aa(_0x8b4c8b) + "\" data-ui-schema-developer-mode=\"" + (globalThis.window?.DEV_MODE === true ? "true" : "false") + "\" data-ui-schema-normal-options=\"" + _0x50f2aa(JSON.stringify(_0x5e7b8b)) + "\" data-ui-schema-developer-values=\"" + _0x50f2aa(JSON.stringify(_0x1687c4)) + "\">\n    <button type=\"button\" class=\"img-pill-btn rh-vram-btn ui-schema-instance-normal-control\" data-ui-schema-value=\"" + _0x50f2aa(_0x452aba?.value ?? _0x452aba) + "\">\n      <span class=\"rh-vram-label ui-schema-pill-label\">" + _0x50f2aa(_0x5d289e?.label ?? _0x5d289e?.value ?? _0x4bda8f) + "</span>\n    </button>\n    " + _0x1251bf + "\n  </div>";
}
export function syncRunningHubInstanceControl(_0x5e02b8, _0x469cbc) {
  if (!_0x5e02b8?.classList?.contains("ui-schema-instance-toggle")) {
    return;
  }
  let _0x1e9f09 = [];
  try {
    _0x1e9f09 = JSON.parse(_0x5e02b8.dataset.uiSchemaNormalOptions || "[]");
  } catch {
    _0x1e9f09 = [];
  }
  const _0x5932b4 = _0x1e9f09.findIndex(_0x165ce8 => String(_0x165ce8?.value ?? "") === String(_0x469cbc ?? ""));
  const _0x2530ab = _0x5932b4 >= 0 ? _0x5932b4 : 0;
  const _0x398f9f = _0x1e9f09[_0x2530ab] || {};
  const _0x3545e4 = _0x1e9f09[(_0x2530ab + 1) % Math.max(1, _0x1e9f09.length)] || _0x398f9f;
  const _0x4307af = _0x5e02b8.querySelector(".ui-schema-instance-normal-control .ui-schema-pill-label");
  if (_0x4307af) {
    _0x4307af.textContent = _0x398f9f?.label || "24G";
  }
  const _0x43196f = _0x5e02b8.querySelector(".ui-schema-instance-normal-control[data-ui-schema-value]");
  if (_0x43196f) {
    _0x43196f.dataset.uiSchemaValue = _0x3545e4?.value || "default";
  }
  const _0x12dc98 = Array.from(_0x5e02b8.querySelectorAll(".ui-schema-instance-developer-control .floating-menu-item[data-ui-schema-value]")).find(_0x406cf1 => String(_0x406cf1?.dataset?.uiSchemaValue || "") === String(_0x469cbc ?? ""));
  const _0x4b59d1 = _0x5e02b8.querySelector(".ui-schema-instance-developer-control .ui-schema-menu-trigger .ui-schema-pill-label");
  if (_0x4b59d1) {
    _0x4b59d1.textContent = _0x12dc98?.dataset?.uiSchemaOptionLabel || _0x12dc98?.textContent?.trim?.() || _0x398f9f?.label || "24G";
  }
}