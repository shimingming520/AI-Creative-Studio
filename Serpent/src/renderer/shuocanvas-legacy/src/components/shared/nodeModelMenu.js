import { translateManifestText } from "../../i18n/manifestText.js";
const RIGHT_CHEVRON_HTML = "<svg class=\"node-menu-caret\" width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" aria-hidden=\"true\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>";
const NODE_MENU_ICON_IMAGE_ATTRS = " loading=\"eager\" decoding=\"async\" fetchpriority=\"high\" draggable=\"false\"";
export function escapeNodeMenuHtml(_0x25e31c) {
  return String(_0x25e31c ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderBadge(_0x155a32 = {}) {
  if (_0x155a32.badgeHtml) {
    return _0x155a32.badgeHtml;
  }
  if (_0x155a32.vip) {
    return "<span class=\"floating-menu-badge floating-menu-badge-warning\">VIP</span>";
  }
  if (_0x155a32.disabled) {
    return "<span class=\"floating-menu-badge floating-menu-badge-danger\">" + escapeNodeMenuHtml(translateManifestText("不可用")) + "</span>";
  }
  return "";
}
function renderIcon(_0x45c4f9 = {}, _0x46cae6 = 20) {
  if (_0x45c4f9.iconHtml) {
    return _0x45c4f9.iconHtml;
  }
  if (!_0x45c4f9.icon) {
    return "";
  }
  const _0x58b01e = Number(_0x46cae6) || 20;
  const _0x1b7d5b = _0x58b01e <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<img src=\"" + escapeNodeMenuHtml(_0x45c4f9.icon) + "\" class=\"" + _0x1b7d5b + "\" alt=\"" + escapeNodeMenuHtml(_0x45c4f9.iconAlt || _0x45c4f9.label || "") + "\"" + NODE_MENU_ICON_IMAGE_ATTRS + ">";
}
function attrsFromObject(_0x34ff5a = {}) {
  return Object.entries(_0x34ff5a).filter(([, _0x4eccaa]) => _0x4eccaa !== undefined && _0x4eccaa !== null && _0x4eccaa !== false).map(([_0x5e9844, _0x4fed1d]) => _0x4fed1d === true ? " " + escapeNodeMenuHtml(_0x5e9844) : " " + escapeNodeMenuHtml(_0x5e9844) + "=\"" + escapeNodeMenuHtml(_0x4fed1d) + "\"").join("");
}
export function renderNodeMenuItem(_0x13cd2c = {}, _0x4c8c96 = {}) {
  const _0x77eb27 = String(_0x4c8c96.activeModel || "");
  const _0x43cfd7 = String(_0x13cd2c.modelId ?? _0x13cd2c.value ?? "");
  const _0x205325 = String(_0x13cd2c.provider ?? "");
  const _0x549b60 = _0x13cd2c.active === true || !!_0x43cfd7 && _0x77eb27 === _0x43cfd7 || Array.isArray(_0x13cd2c.aliases) && _0x13cd2c.aliases.includes(_0x77eb27);
  const _0x4c8a62 = ["floating-menu-item", "node-menu-item", _0x13cd2c.className || "", _0x549b60 ? "active" : "", _0x13cd2c.disabled ? "disabled" : ""].filter(Boolean).join(" ");
  const _0x5a7cad = {
    "data-value": _0x43cfd7 || undefined,
    "data-provider": _0x205325 || undefined,
    "data-credential-model": _0x13cd2c.credentialModelId || undefined,
    "data-disabled": _0x13cd2c.disabledValue || (_0x13cd2c.disabled ? "true" : undefined),
    ..._0x13cd2c.attrs
  };
  const _0x3f2e01 = escapeNodeMenuHtml(translateManifestText(_0x13cd2c.label ?? _0x43cfd7));
  const _0xe5a32d = translateManifestText(_0x13cd2c.subtitle || _0x13cd2c.description || "");
  return "<div class=\"" + _0x4c8a62 + "\"" + attrsFromObject(_0x5a7cad) + ">\n    " + renderIcon(_0x13cd2c) + "\n    <div class=\"fmi-content\">\n      <div class=\"fmi-title\">" + _0x3f2e01 + "</div>\n      " + (_0xe5a32d ? "<div class=\"fmi-sub\">" + escapeNodeMenuHtml(_0xe5a32d) + "</div>" : "") + "\n    </div>\n    " + renderBadge(_0x13cd2c) + "\n  </div>";
}
export function renderNodeMenuGroup(_0x51dfdb = {}, _0x4bba77 = {}) {
  const _0x462b79 = String(_0x51dfdb.id || "").trim();
  const _0x5bcaca = _0x51dfdb.submenuClass || _0x462b79 + "-submenu";
  const _0x1561e3 = _0x51dfdb.headerClass || _0x462b79 + "-group-header";
  const _0xadb6dc = _0x51dfdb.toggleAttr || "data-" + _0x462b79 + "-toggle";
  const _0x553cf4 = _0x51dfdb.developerOnly === true ? "node-menu-developer-only" : "";
  const _0x31402b = [_0x1561e3, "floating-menu-item", "node-menu-group-header", _0x51dfdb.className || "", _0x553cf4].filter(Boolean).join(" ");
  const _0x57b1e8 = ["node-model-submenu", "node-menu-submenu", _0x5bcaca, _0x553cf4].filter(Boolean).join(" ");
  const _0x3315fd = {
    [_0xadb6dc]: true,
    "data-node-menu-submenu": "." + _0x5bcaca,
    ..._0x51dfdb.attrs
  };
  const _0x7bbee6 = _0x51dfdb.itemsHtml || (Array.isArray(_0x51dfdb.items) ? _0x51dfdb.items.map(_0x1d25a6 => renderNodeMenuItem(_0x1d25a6, _0x4bba77)).join("") : "");
  return "\n    <div class=\"" + _0x31402b + "\"" + attrsFromObject(_0x3315fd) + ">\n      " + renderIcon(_0x51dfdb) + "\n      <div class=\"fmi-content\">\n        <div class=\"fmi-title\">" + escapeNodeMenuHtml(translateManifestText(_0x51dfdb.label || _0x462b79)) + "</div>\n        " + (_0x51dfdb.subtitle ? "<div class=\"fmi-sub\">" + escapeNodeMenuHtml(translateManifestText(_0x51dfdb.subtitle)) + "</div>" : "") + "\n      </div>\n      " + renderBadge(_0x51dfdb) + "\n      " + (_0x51dfdb.chevron === false ? "" : RIGHT_CHEVRON_HTML) + "\n    </div>\n    <div class=\"" + escapeNodeMenuHtml(_0x57b1e8) + "\">\n      " + _0x7bbee6 + "\n    </div>";
}
export function renderNodeModelMenu(_0x533aa9 = {}) {
  const _0x5b0e53 = String(_0x533aa9.activeModel || "");
  const _0xdff0fa = Array.isArray(_0x533aa9.groups) ? _0x533aa9.groups : [];
  const _0x22a239 = Array.isArray(_0x533aa9.items) ? _0x533aa9.items : [];
  const _0x565884 = [..._0x22a239.map(_0xbf523e => renderNodeMenuItem(_0xbf523e, {
    activeModel: _0x5b0e53
  })), ..._0xdff0fa.map(_0x5d62eb => renderNodeMenuGroup(_0x5d62eb, {
    activeModel: _0x5b0e53
  }))].join("");
  const _0x87d43c = ["floating-menu", "img-model-menu", "node-model-menu", _0x533aa9.className || ""].filter(Boolean).join(" ");
  return "<div class=\"" + _0x87d43c + "\" data-node-menu-kind=\"" + escapeNodeMenuHtml(_0x533aa9.kind || "") + "\">" + _0x565884 + "</div>";
}
export function renderNodeModelTrigger({
  iconHtml = "",
  label = "",
  className = "",
  caretHtml = ""
} = {}) {
  const _0x3a3dc5 = ["img-pill-btn", "img-model-btn-trigger", "node-model-trigger", className].filter(Boolean).join(" ");
  return "<button type=\"button\" class=\"" + _0x3a3dc5 + "\">\n    " + iconHtml + "\n    <span class=\"img-model-label\">" + escapeNodeMenuHtml(label) + "</span>\n    " + caretHtml + "\n  </button>";
}