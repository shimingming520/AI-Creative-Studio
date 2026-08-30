import { t } from "../../i18n/index.js";
const SVG_NS = "http://www.w3.org/2000/svg";
function storyboardCellText(_0x3b8231, _0x4f6c42 = {}) {
  return t("storyboard.cell." + _0x3b8231, _0x4f6c42);
}
function createEmptyPlusIcon() {
  const _0x53f836 = document.createElementNS(SVG_NS, "svg");
  _0x53f836.setAttribute("width", "24");
  _0x53f836.setAttribute("height", "24");
  _0x53f836.setAttribute("viewBox", "0 0 24 24");
  _0x53f836.setAttribute("fill", "none");
  _0x53f836.setAttribute("stroke", "currentColor");
  _0x53f836.setAttribute("stroke-width", "1.5");
  const _0x322c0b = document.createElementNS(SVG_NS, "path");
  _0x322c0b.setAttribute("d", "M12 3v18m9-9H3");
  _0x53f836.appendChild(_0x322c0b);
  return _0x53f836;
}
export function createStoryboardCellImageElement(_0x22bd28) {
  const _0x1335b3 = document.createElement("img");
  _0x1335b3.className = "storyboard-cell-img";
  _0x1335b3.setAttribute("src", _0x22bd28);
  _0x1335b3.decoding = "async";
  _0x1335b3.loading = "eager";
  _0x1335b3.style.width = "100%";
  _0x1335b3.style.height = "100%";
  _0x1335b3.style.objectFit = "cover";
  _0x1335b3.style.pointerEvents = "none";
  _0x1335b3.addEventListener("error", () => {
    const _0x33007e = _0x1335b3.parentElement;
    if (!_0x33007e) {
      return;
    }
    _0x33007e.replaceChildren();
    const _0x204f3d = document.createElement("div");
    _0x204f3d.style.color = "var(--text-muted)";
    _0x204f3d.style.fontSize = "10px";
    _0x204f3d.textContent = storyboardCellText("loadFailed");
    _0x33007e.appendChild(_0x204f3d);
  });
  return _0x1335b3;
}
function createResidualImage(_0xc67967) {
  const _0xd031e8 = document.createElement("img");
  _0xd031e8.className = "storyboard-empty-residual-img";
  _0xd031e8.setAttribute("src", _0xc67967);
  _0xd031e8.decoding = "async";
  _0xd031e8.loading = "eager";
  _0xd031e8.style.pointerEvents = "none";
  return _0xd031e8;
}
function createEmptyPlaceholder(_0x28e2ab = "empty-placeholder") {
  const _0xfe3ac0 = document.createElement("div");
  _0xfe3ac0.className = _0x28e2ab;
  _0xfe3ac0.style.color = "var(--white-10)";
  _0xfe3ac0.appendChild(createEmptyPlusIcon());
  const _0x4523cc = document.createElement("span");
  _0x4523cc.className = "storyboard-empty-drop-label";
  _0x4523cc.textContent = storyboardCellText("dropImage");
  _0xfe3ac0.setAttribute("aria-label", _0x4523cc.textContent);
  _0xfe3ac0.appendChild(_0x4523cc);
  return _0xfe3ac0;
}
function createEmptyResidualContent(_0x1bde28) {
  const _0x1a0f0f = document.createElement("div");
  _0x1a0f0f.className = "storyboard-empty-residual";
  _0x1a0f0f.appendChild(createResidualImage(_0x1bde28));
  _0x1a0f0f.appendChild(createEmptyPlaceholder("empty-placeholder storyboard-empty-cutout"));
  return _0x1a0f0f;
}
function createExtractedCellContent(_0x13af20, _0x17c5a7, _0x512e08) {
  const _0x56ddd7 = document.createElement("div");
  _0x56ddd7.className = "storyboard-extracted-cell-content";
  if (_0x512e08) {
    _0x56ddd7.appendChild(createResidualImage(_0x512e08));
  }
  const _0x352df4 = createStoryboardCellImageElement(_0x17c5a7);
  _0x352df4.classList.add("storyboard-cell-img--extracted-cutout");
  _0x56ddd7.appendChild(_0x352df4);
  return _0x56ddd7;
}
export function createStoryboardCellContentNode({
  cell: _0x75a09d,
  finalUrl: _0x3f7f57,
  residualUrl = ""
} = {}) {
  if (!_0x75a09d) {
    return document.createTextNode("");
  }
  if (!_0x3f7f57) {
    if (residualUrl) {
      return createEmptyResidualContent(residualUrl);
    } else {
      return createEmptyPlaceholder();
    }
  }
  if (_0x75a09d.storyboardExtractedCell === true || _0x75a09d.storyboardLockedCell === true) {
    return createExtractedCellContent(_0x75a09d, _0x3f7f57, residualUrl);
  }
  return createStoryboardCellImageElement(_0x3f7f57);
}
export function buildReusableStoryboardCellImageMap(_0x2ee6ce) {
  const _0x2b116d = new Map();
  if (!_0x2ee6ce) {
    return _0x2b116d;
  }
  _0x2ee6ce.forEach(_0x498013 => {
    const _0x2b2333 = _0x498013?.querySelector?.(".cell-content-wrap");
    const _0xa9a13d = _0x2b2333?.querySelector?.(".storyboard-cell-img");
    if (!_0xa9a13d || _0xa9a13d.tagName !== "IMG") {
      return;
    }
    const _0x15367a = _0xa9a13d.getAttribute("src") || "";
    if (_0x15367a && !_0x2b116d.has(_0x15367a)) {
      _0x2b116d.set(_0x15367a, _0xa9a13d);
    }
  });
  return _0x2b116d;
}
export function cloneReusableStoryboardCellImage(_0x3c59e6, _0x3baffb) {
  const _0x1f59fd = _0x3baffb?.get?.(_0x3c59e6);
  if (!_0x1f59fd || _0x1f59fd.tagName !== "IMG") {
    return null;
  }
  const _0x4b3ca5 = _0x1f59fd.cloneNode(false);
  _0x4b3ca5.classList.remove("is-cell-preloading", "is-cell-ready");
  _0x4b3ca5.classList.add("storyboard-cell-img");
  _0x4b3ca5.setAttribute("src", _0x3c59e6);
  _0x4b3ca5.decoding = "async";
  _0x4b3ca5.loading = "eager";
  _0x4b3ca5.style.width = "100%";
  _0x4b3ca5.style.height = "100%";
  _0x4b3ca5.style.objectFit = "cover";
  _0x4b3ca5.style.pointerEvents = "none";
  _0x4b3ca5.style.position = "";
  _0x4b3ca5.style.inset = "";
  _0x4b3ca5.style.opacity = "";
  _0x4b3ca5.style.transition = "";
  return _0x4b3ca5;
}