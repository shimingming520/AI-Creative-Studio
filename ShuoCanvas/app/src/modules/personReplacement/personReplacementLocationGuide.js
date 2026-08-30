function normalizeNumber(_0x27818d, _0x34f062 = 0) {
  const _0x518bce = Number(_0x27818d);
  if (Number.isFinite(_0x518bce)) {
    return _0x518bce;
  } else {
    return _0x34f062;
  }
}
function clamp(_0x89e907, _0x181ad2, _0x274c6c) {
  return Math.max(_0x181ad2, Math.min(_0x274c6c, normalizeNumber(_0x89e907, _0x181ad2)));
}
function escapeXml(_0x1af266) {
  return String(_0x1af266 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function normalizeGuideBox(_0x11b69f = {}) {
  const _0x3371db = clamp(_0x11b69f.x, 0, 1);
  const _0x5e1f24 = clamp(_0x11b69f.y, 0, 1);
  return {
    x: _0x3371db,
    y: _0x5e1f24,
    width: clamp(_0x11b69f.width, 0, 1 - _0x3371db),
    height: clamp(_0x11b69f.height, 0, 1 - _0x5e1f24)
  };
}
const GUIDE_COLORS = Object.freeze(["#38bdf8", "#f472b6", "#facc15", "#4ade80", "#c084fc", "#fb923c", "#2dd4bf", "#f87171"]);
export function buildPersonReplacementLocationGuide({
  frame = {},
  people = []
} = {}) {
  const _0x3d44fd = Math.max(1, normalizeNumber(frame.width, 16));
  const _0x290355 = Math.max(1, normalizeNumber(frame.height, 9));
  const _0x1c90f9 = 1200;
  const _0xf964da = Math.max(360, Math.round(_0x1c90f9 * _0x290355 / _0x3d44fd));
  const _0x12896b = (Array.isArray(people) ? people : []).map((_0x3a16df, _0x4e428a) => ({
    label: String(_0x3a16df?.label || String.fromCharCode(65 + _0x4e428a)).trim(),
    bbox: normalizeGuideBox(_0x3a16df?.bbox),
    color: GUIDE_COLORS[_0x4e428a % GUIDE_COLORS.length]
  })).filter(_0xa0b06d => _0xa0b06d.bbox.width > 0 && _0xa0b06d.bbox.height > 0);
  const _0x5c5292 = [0.25, 0.5, 0.75].flatMap(_0x1e0f05 => ["<line x1=\"" + _0x1c90f9 * _0x1e0f05 + "\" y1=\"0\" x2=\"" + _0x1c90f9 * _0x1e0f05 + "\" y2=\"" + _0xf964da + "\" />", "<line x1=\"0\" y1=\"" + _0xf964da * _0x1e0f05 + "\" x2=\"" + _0x1c90f9 + "\" y2=\"" + _0xf964da * _0x1e0f05 + "\" />"]).join("");
  const _0x9e11a2 = _0x12896b.map(_0x44138b => {
    const _0x8ada52 = Math.round(_0x44138b.bbox.x * _0x1c90f9);
    const _0x2b0702 = Math.round(_0x44138b.bbox.y * _0xf964da);
    const _0x3afd59 = Math.max(2, Math.round(_0x44138b.bbox.width * _0x1c90f9));
    const _0x2b8355 = Math.max(2, Math.round(_0x44138b.bbox.height * _0xf964da));
    const _0x7d6eca = Math.max(28, Math.min(64, Math.round(_0x1c90f9 / 18)));
    const _0x1be945 = Math.round(_0x7d6eca * 1.25);
    return "<g data-person-label=\"" + escapeXml(_0x44138b.label) + "\">\n      <rect x=\"" + _0x8ada52 + "\" y=\"" + _0x2b0702 + "\" width=\"" + _0x3afd59 + "\" height=\"" + _0x2b8355 + "\" rx=\"10\" fill=\"" + _0x44138b.color + "\" fill-opacity=\"0.12\" stroke=\"" + _0x44138b.color + "\" stroke-width=\"8\" />\n      <rect x=\"" + _0x8ada52 + "\" y=\"" + _0x2b0702 + "\" width=\"" + _0x1be945 + "\" height=\"" + _0x1be945 + "\" rx=\"8\" fill=\"" + _0x44138b.color + "\" />\n      <text x=\"" + (_0x8ada52 + _0x1be945 / 2) + "\" y=\"" + (_0x2b0702 + _0x1be945 * 0.76) + "\" text-anchor=\"middle\" fill=\"#05070a\" font-family=\"Arial, sans-serif\" font-size=\"" + _0x7d6eca + "\" font-weight=\"800\">" + escapeXml(_0x44138b.label) + "</text>\n    </g>";
  }).join("");
  const _0x3843aa = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + _0x1c90f9 + "\" height=\"" + _0xf964da + "\" viewBox=\"0 0 " + _0x1c90f9 + " " + _0xf964da + "\">\n    <rect width=\"100%\" height=\"100%\" fill=\"#111827\" />\n    <g stroke=\"#94a3b8\" stroke-opacity=\"0.18\" stroke-width=\"2\">" + _0x5c5292 + "</g>\n    " + _0x9e11a2 + "\n  </svg>";
  return {
    svg: _0x3843aa,
    dataUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(_0x3843aa),
    width: _0x1c90f9,
    height: _0xf964da,
    personCount: _0x12896b.length
  };
}