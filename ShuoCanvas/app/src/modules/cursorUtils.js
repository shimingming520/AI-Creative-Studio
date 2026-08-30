export function createLinkCursor(_0x2f69ab = {}) {
  const _0x42a21b = _0x2f69ab && typeof _0x2f69ab === "object" ? _0x2f69ab : {};
  const _0x5b214e = {
    small: 24,
    medium: 36,
    large: 48
  };
  const _0x37ace3 = {
    small: 4,
    medium: 6,
    large: 8
  };
  const _0x24d3f3 = Object.prototype.hasOwnProperty.call(_0x5b214e, _0x42a21b.size) ? _0x42a21b.size : "small";
  const _0x417ada = _0x42a21b.strokeColor || "white";
  const _0x25f1cb = _0x42a21b.fillColor || "white";
  const _0x335261 = _0x42a21b.fillOpacity ?? "0.18";
  const _0x1455b1 = _0x42a21b.fallback || "crosshair";
  const _0x5f12f6 = _0x5b214e[_0x24d3f3];
  const _0x507d51 = _0x37ace3[_0x24d3f3];
  const _0x24e039 = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + _0x5f12f6 + "\" height=\"" + _0x5f12f6 + "\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"" + _0x417ada + "\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z\" fill=\"" + _0x25f1cb + "\" fill-opacity=\"" + _0x335261 + "\"/><circle cx=\"20\" cy=\"20\" r=\"2.5\" fill=\"" + _0x417ada + "\"/><path d=\"M12 12 Q 17 12 19 18\" stroke-dasharray=\"3 3\"/></svg>";
  return "url(\"data:image/svg+xml;charset=utf-8," + encodeURIComponent(_0x24e039) + "\") " + _0x507d51 + " " + _0x507d51 + ", " + _0x1455b1;
}
export function createRotateCursor(_0x96bb11 = {}) {
  const _0xf7124f = _0x96bb11 && typeof _0x96bb11 === "object" ? _0x96bb11 : {};
  const _0x5bb6f3 = _0xf7124f.strokeColor || "#17191f";
  const _0x31aa11 = _0xf7124f.outlineColor || "#ffffff";
  const _0x579121 = _0xf7124f.fallback || "grab";
  const _0x454576 = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 28 28\" fill=\"none\"><path d=\"M20.7 8.1A9 9 0 1 0 22 18.3\" stroke=\"" + _0x31aa11 + "\" stroke-width=\"4.2\" stroke-linecap=\"round\"/><path d=\"M20.7 8.1A9 9 0 1 0 22 18.3\" stroke=\"" + _0x5bb6f3 + "\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M16.5 7.9h4.6V3.3\" stroke=\"" + _0x31aa11 + "\" stroke-width=\"4.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M16.5 7.9h4.6V3.3\" stroke=\"" + _0x5bb6f3 + "\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>";
  return "url(\"data:image/svg+xml;charset=utf-8," + encodeURIComponent(_0x454576) + "\") 14 14, " + _0x579121;
}
export function getCursorSize() {
  return localStorage.getItem("v2-cursor-style") || localStorage.getItem("cursorSize") || "small";
}
export function applyLinkCursor(_0x2ac7dc, _0x53dfa3 = {}) {
  const _0xa7f186 = createLinkCursor(_0x53dfa3);
  _0x2ac7dc.style.setProperty("cursor", _0xa7f186, "important");
}
export function removeLinkCursor(_0x2ecc9e) {
  _0x2ecc9e.style.removeProperty("cursor");
}