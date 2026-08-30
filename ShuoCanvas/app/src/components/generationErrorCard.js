const GENERATION_ERROR_ICON_MARKUP = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"></line></svg>";
function normalizeText(_0x264a51) {
  return String(_0x264a51 ?? "").trim();
}
function escapeHtml(_0x405589) {
  return String(_0x405589 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
export function createGenerationErrorCard({
  errorMessage = "",
  title = "生成失败",
  className = "",
  documentObject = globalThis.document
} = {}) {
  const _0x212872 = normalizeText(title) || "生成失败";
  const _0x4d7fd8 = documentObject.createElement("div");
  _0x4d7fd8.className = ["gen-error-card", normalizeText(className)].filter(Boolean).join(" ");
  const _0x5b9fb1 = documentObject.createElement("div");
  _0x5b9fb1.className = "gen-error-card-icon";
  _0x5b9fb1.innerHTML = GENERATION_ERROR_ICON_MARKUP;
  const _0x3d605c = documentObject.createElement("span");
  _0x3d605c.className = "gen-error-card-title";
  _0x3d605c.textContent = _0x212872;
  const _0xa10b00 = documentObject.createElement("span");
  _0xa10b00.className = "gen-error-card-detail";
  _0xa10b00.textContent = String(errorMessage || _0x212872);
  _0x4d7fd8.appendChild(_0x5b9fb1);
  _0x4d7fd8.appendChild(_0x3d605c);
  _0x4d7fd8.appendChild(_0xa10b00);
  return _0x4d7fd8;
}
export function renderGenerationErrorCardMarkup({
  errorMessage = "",
  title = "生成失败",
  className = "",
  role = ""
} = {}) {
  const _0x9a89bf = normalizeText(title) || "生成失败";
  const _0x58d1f2 = String(errorMessage || _0x9a89bf);
  const _0x31f48f = ["gen-error-card", normalizeText(className)].filter(Boolean).join(" ");
  const _0x240464 = normalizeText(role) ? " role=\"" + escapeHtml(role) + "\"" : "";
  return "<section class=\"" + escapeHtml(_0x31f48f) + "\"" + _0x240464 + ">\n    <span class=\"gen-error-card-icon\" aria-hidden=\"true\">" + GENERATION_ERROR_ICON_MARKUP + "</span>\n    <span class=\"gen-error-card-title\">" + escapeHtml(_0x9a89bf) + "</span>\n    <span class=\"gen-error-card-detail\">" + escapeHtml(_0x58d1f2) + "</span>\n  </section>";
}