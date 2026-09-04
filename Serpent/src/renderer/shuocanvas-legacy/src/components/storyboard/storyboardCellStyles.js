import { buildStoryboardCropRect } from "../../core/storyboardCellUtils.js";
export function applyStoryboardDefaultCellImageStyles(_0x58e899, _0x4bfd50, _0x15ed82) {
  const _0x36f8c0 = String(_0x4bfd50 || "");
  if (_0x58e899.getAttribute("src") !== _0x36f8c0) {
    _0x58e899.setAttribute("src", _0x36f8c0);
  }
  _0x58e899.classList.remove("storyboard-cell-img--source-crop");
  _0x58e899.style.position = "";
  _0x58e899.style.inset = "";
  _0x58e899.style.left = "";
  _0x58e899.style.top = "";
  _0x58e899.style.display = "";
  _0x58e899.style.width = "100%";
  _0x58e899.style.height = "100%";
  _0x58e899.style.objectFit = "cover";
}
export function getStoryboardCellDisplaySourceSize(_0x5c2702, _0x2105cc = null, _0x5338dc = {}) {
  const _0x483c26 = Math.trunc(Number(_0x2105cc?.naturalWidth || _0x2105cc?.width) || 0);
  const _0x3dd6a2 = Math.trunc(Number(_0x2105cc?.naturalHeight || _0x2105cc?.height) || 0);
  return {
    width: Math.max(1, _0x483c26 || Math.trunc(Number(_0x5c2702?.sourceWidth) || Number(_0x5338dc?.storyboardSourceWidth) || Number(_0x5338dc?.sourceWidth) || Number(_0x5338dc?.width) || 1)),
    height: Math.max(1, _0x3dd6a2 || Math.trunc(Number(_0x5c2702?.sourceHeight) || Number(_0x5338dc?.storyboardSourceHeight) || Number(_0x5338dc?.sourceHeight) || Number(_0x5338dc?.height) || 1))
  };
}
export function applyStoryboardSourceCropImageStyles({
  img: _0x5631b9,
  cell: _0x10f81a,
  index: _0x59450b,
  sourceUrl: _0xf41d2c,
  node: _0x5ce651,
  sourceIndex: _0x446a84,
  isLoadedImageElement: _0x59d6a4,
  onImageLoad: _0x3bdb2c
} = {}) {
  if (!_0x5631b9 || !_0xf41d2c) {
    return;
  }
  if (_0x5631b9.getAttribute("src") !== _0xf41d2c) {
    _0x5631b9.setAttribute("src", _0xf41d2c);
  }
  _0x5631b9.classList.add("storyboard-cell-img--source-crop");
  _0x5631b9.style.display = "block";
  _0x5631b9.style.position = "absolute";
  _0x5631b9.style.inset = "";
  _0x5631b9.style.objectFit = "fill";
  _0x5631b9.style.pointerEvents = "none";
  const _0x4f4c04 = getStoryboardCellDisplaySourceSize(_0x10f81a, _0x5631b9, _0x5ce651);
  const _0x4312c4 = buildStoryboardCropRect(_0x5ce651, _0x446a84 ?? _0x59450b, {
    width: _0x4f4c04.width,
    height: _0x4f4c04.height,
    inset: 0
  });
  if (!_0x4312c4 || _0x4312c4.sw <= 0 || _0x4312c4.sh <= 0) {
    _0x5631b9.style.left = "0";
    _0x5631b9.style.top = "0";
    _0x5631b9.style.width = "100%";
    _0x5631b9.style.height = "100%";
    return;
  }
  _0x5631b9.style.left = -(_0x4312c4.sx / _0x4312c4.sw) * 100 + "%";
  _0x5631b9.style.top = -(_0x4312c4.sy / _0x4312c4.sh) * 100 + "%";
  _0x5631b9.style.width = _0x4f4c04.width / _0x4312c4.sw * 100 + "%";
  _0x5631b9.style.height = _0x4f4c04.height / _0x4312c4.sh * 100 + "%";
  if (!_0x59d6a4?.(_0x5631b9)) {
    _0x5631b9.addEventListener?.("load", _0x3bdb2c, {
      once: true
    });
  }
}
export function syncStoryboardSourceCacheImage({
  cellEl: _0x3f0f88,
  sourceUrl: _0x7be2c4,
  onReady = null,
  isLoadedImageElement: _0x198c6c
} = {}) {
  const _0x2d8aea = _0x3f0f88?.querySelector?.(".cell-content-wrap") || null;
  if (!_0x2d8aea) {
    return;
  }
  const _0x14eaf3 = _0x2d8aea.querySelector?.(".storyboard-cell-source-cache") || null;
  const _0x3213c3 = String(_0x7be2c4 || "").trim();
  if (!_0x3213c3) {
    _0x14eaf3?.remove?.();
    return;
  }
  const _0x4098ad = _0x599c97 => {
    if (typeof onReady !== "function" || !_0x599c97) {
      return;
    }
    if (_0x198c6c?.(_0x599c97)) {
      return;
    }
    _0x599c97.addEventListener?.("load", onReady, {
      once: true
    });
  };
  if (_0x14eaf3) {
    if (_0x14eaf3.getAttribute("src") !== _0x3213c3) {
      _0x14eaf3.setAttribute("src", _0x3213c3);
    }
    _0x4098ad(_0x14eaf3);
    return;
  }
  const _0xb5f67b = document.createElement("img");
  _0xb5f67b.className = "storyboard-cell-source-cache storyboard-cell-img--source-crop";
  _0xb5f67b.setAttribute("src", _0x3213c3);
  _0xb5f67b.setAttribute("aria-hidden", "true");
  _0xb5f67b.decoding = "async";
  _0xb5f67b.loading = "eager";
  _0x2d8aea.appendChild(_0xb5f67b);
  _0x4098ad(_0xb5f67b);
}
export function applyStoryboardEmptyCutoutStyles(_0x9d0c60) {
  if (!_0x9d0c60) {
    return;
  }
  const _0xc660e7 = _0x9d0c60.querySelector?.(".storyboard-empty-cutout") || null;
  if (!_0xc660e7) {
    return;
  }
  _0xc660e7.style.display = "flex";
  _0xc660e7.style.position = "absolute";
  _0xc660e7.style.left = "0";
  _0xc660e7.style.top = "0";
  _0xc660e7.style.width = "100%";
  _0xc660e7.style.height = "100%";
}
export function applyStoryboardEmptyResidualImageStyles({
  img: _0x58dcc9,
  cell: _0x1131fa,
  node: _0x27aba9,
  activeBounds: _0x39c119
} = {}) {
  if (!_0x58dcc9) {
    return;
  }
  const _0x38a89a = String(_0x1131fa?.residualImageMode || "");
  if (_0x38a89a !== "source") {
    _0x58dcc9.style.position = "absolute";
    _0x58dcc9.style.inset = "0";
    _0x58dcc9.style.left = "0";
    _0x58dcc9.style.top = "0";
    _0x58dcc9.style.width = "100%";
    _0x58dcc9.style.height = "100%";
    _0x58dcc9.style.objectFit = "cover";
    return;
  }
  const _0xecb062 = Math.max(1, Number(_0x1131fa?.residualImageWidth) || Number(_0x1131fa?.sourceWidth) || Number(_0x27aba9?.sourceWidth) || 1);
  const _0x2eb8e3 = Math.max(1, Number(_0x1131fa?.residualImageHeight) || Number(_0x1131fa?.sourceHeight) || Number(_0x27aba9?.sourceHeight) || 1);
  if (!_0x39c119 || _0x39c119.width <= 0 || _0x39c119.height <= 0) {
    _0x58dcc9.style.position = "absolute";
    _0x58dcc9.style.inset = "0";
    _0x58dcc9.style.width = "100%";
    _0x58dcc9.style.height = "100%";
    _0x58dcc9.style.objectFit = "cover";
    return;
  }
  const _0x246dca = _0xecb062 / Math.max(1, Number(_0x27aba9?.width) || 1);
  const _0x558cae = _0x2eb8e3 / Math.max(1, Number(_0x27aba9?.height) || 1);
  const _0x260d27 = _0x39c119.x0 * _0x246dca;
  const _0x55f518 = _0x39c119.y0 * _0x558cae;
  const _0x22e355 = Math.max(1, _0x39c119.width * _0x246dca);
  const _0x1d0779 = Math.max(1, _0x39c119.height * _0x558cae);
  _0x58dcc9.style.position = "absolute";
  _0x58dcc9.style.inset = "";
  _0x58dcc9.style.left = -(_0x260d27 / _0x22e355) * 100 + "%";
  _0x58dcc9.style.top = -(_0x55f518 / _0x1d0779) * 100 + "%";
  _0x58dcc9.style.width = _0xecb062 / _0x22e355 * 100 + "%";
  _0x58dcc9.style.height = _0x2eb8e3 / _0x1d0779 * 100 + "%";
  _0x58dcc9.style.objectFit = "fill";
}
export function applyStoryboardCellLayoutStyles({
  cellEl: _0x4b95e1,
  isCustomGridEditing = false,
  frozen = null,
  bounds = null
} = {}) {
  if (!_0x4b95e1) {
    return;
  }
  if (isCustomGridEditing && frozen) {
    _0x4b95e1.style.display = frozen.display;
    _0x4b95e1.style.position = frozen.position;
    _0x4b95e1.style.left = frozen.left;
    _0x4b95e1.style.top = frozen.top;
    _0x4b95e1.style.width = frozen.width;
    _0x4b95e1.style.height = frozen.height;
    return;
  }
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
    _0x4b95e1.style.display = "none";
    return;
  }
  _0x4b95e1.style.display = "flex";
  _0x4b95e1.style.position = "absolute";
  _0x4b95e1.style.left = bounds.x0 + "px";
  _0x4b95e1.style.top = bounds.y0 + "px";
  _0x4b95e1.style.width = bounds.width + "px";
  _0x4b95e1.style.height = bounds.height + "px";
}
export function captureStoryboardCellVisualState(_0x72eeb9) {
  if (!_0x72eeb9) {
    return null;
  }
  return _0x72eeb9.map(_0x2cf4eb => ({
    display: _0x2cf4eb.style.display || "",
    position: _0x2cf4eb.style.position || "",
    left: _0x2cf4eb.style.left || "",
    top: _0x2cf4eb.style.top || "",
    width: _0x2cf4eb.style.width || "",
    height: _0x2cf4eb.style.height || ""
  }));
}