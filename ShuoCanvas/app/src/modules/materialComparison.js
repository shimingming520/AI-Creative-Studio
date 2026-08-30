import { closeActiveImagePreview, closeActiveVideoPreview, resolveNodeImageOriginalSource } from "./imagePreview.js";
import { isCollageImageNode, resolveCollageNodeImage } from "./collage/collageFactory.js";
import { t } from "../i18n/index.js";
const MODE_SLIDE = "slide";
const MODE_SIDE_BY_SIDE = "side-by-side";
const SLOT_LEFT = "left";
const SLOT_RIGHT = "right";
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 6;
const WHEEL_ZOOM_INTENSITY = 0.0015;
let activeMaterialComparisonClose = null;
function clamp(_0x1eff18, _0x4a5ae0, _0x4a7c6b) {
  const _0x3b729d = Number(_0x1eff18);
  if (!Number.isFinite(_0x3b729d)) {
    return _0x4a5ae0;
  }
  return Math.min(_0x4a7c6b, Math.max(_0x4a5ae0, _0x3b729d));
}
function createElement(_0x1d3ce3, _0x4c5a77, _0x104c4a = "") {
  const _0x2f77b7 = _0x1d3ce3.createElement(_0x4c5a77);
  if (_0x104c4a) {
    _0x2f77b7.className = _0x104c4a;
  }
  return _0x2f77b7;
}
function createTextElement(_0x5ea4ef, _0x44c715, _0x3bfc20, _0x1156e7) {
  const _0xf6ad1a = createElement(_0x5ea4ef, _0x44c715, _0x3bfc20);
  _0xf6ad1a.textContent = _0x1156e7;
  return _0xf6ad1a;
}
function createButton(_0x59ef3e, _0x547ee7, _0x2e0c6a, _0x407f37 = _0x2e0c6a) {
  const _0x3d6f69 = createTextElement(_0x59ef3e, "button", _0x547ee7, _0x2e0c6a);
  _0x3d6f69.type = "button";
  _0x3d6f69.setAttribute("aria-label", _0x407f37);
  return _0x3d6f69;
}
function safeRevokeObjectUrl(_0x5cdca4) {
  try {
    globalThis.URL?.revokeObjectURL?.(_0x5cdca4);
  } catch (_0x383a5d) {}
}
function getEntryLabel(_0x4e9231, _0x12950f, _0x380b4f) {
  return String(_0x12950f?.label || _0x4e9231?.name || _0x4e9231?.fileName || t("canvasInteraction.materialComparison.untitled", {
    index: _0x380b4f + 1
  })).trim();
}
function getEntryAspectRatio(_0x5da8e9, _0x1cf145) {
  const _0x3805f6 = Number(_0x1cf145?.originalWidth || _0x5da8e9?.originalWidth || 0);
  const _0x22f4fd = Number(_0x1cf145?.originalHeight || _0x5da8e9?.originalHeight || 0);
  if (_0x3805f6 <= 0 || _0x22f4fd <= 0) {
    return 0;
  }
  return _0x3805f6 / _0x22f4fd;
}
export function resolveMaterialComparisonEntries(_0x186264 = []) {
  return (Array.isArray(_0x186264) ? _0x186264 : []).filter(_0x123cd7 => isCollageImageNode(_0x123cd7)).map((_0x1c05b2, _0x57b656) => {
    const _0x1031dc = resolveCollageNodeImage(_0x1c05b2);
    return {
      id: String(_0x1c05b2?.id || "comparison-image-" + _0x57b656),
      node: _0x1c05b2,
      label: getEntryLabel(_0x1c05b2, _0x1031dc, _0x57b656),
      thumbnailUrl: String(_0x1031dc?.url || "").trim(),
      aspectRatio: getEntryAspectRatio(_0x1c05b2, _0x1031dc),
      originalPromise: null,
      originalUrl: "",
      revokeUrlOnClose: false
    };
  }).filter(_0x3bba81 => _0x3bba81.thumbnailUrl);
}
export function closeActiveMaterialComparison() {
  if (typeof activeMaterialComparisonClose !== "function") {
    return false;
  }
  const _0x192dc3 = activeMaterialComparisonClose;
  _0x192dc3();
  return true;
}
export function openMaterialComparison(_0xfe0e48 = [], _0x556f1b = {}) {
  const _0x260f7b = resolveMaterialComparisonEntries(_0xfe0e48);
  if (_0x260f7b.length < 2) {
    return () => {};
  }
  const _0x330a79 = _0x556f1b.documentObject || globalThis.document;
  const _0x4f5aa4 = _0x556f1b.windowObject || globalThis.window;
  if (!_0x330a79?.body || !_0x330a79?.createElement) {
    return () => {};
  }
  closeActiveImagePreview();
  closeActiveVideoPreview();
  closeActiveMaterialComparison();
  const _0x1dfdaf = typeof _0x556f1b.translate === "function" ? _0x556f1b.translate : t;
  const _0xcdebb = typeof _0x556f1b.sourceResolver === "function" ? _0x556f1b.sourceResolver : resolveNodeImageOriginalSource;
  const _0x41b047 = {
    mode: MODE_SLIDE,
    leftIndex: 0,
    rightIndex: 1,
    nextSlot: SLOT_LEFT,
    dividerPercent: 50,
    zoom: 1,
    leftAspectRatio: _0x260f7b[0].aspectRatio || 1,
    rightAspectRatio: _0x260f7b[1].aspectRatio || 1,
    stageWidth: 1,
    stageHeight: 1
  };
  const _0x310f15 = new Set();
  let _0x4b527e = false;
  let _0x621ed4 = null;
  let _0x21b1fd = null;
  const _0x59b444 = createElement(_0x330a79, "div", "v2-material-comparison-overlay");
  _0x59b444.setAttribute("role", "dialog");
  _0x59b444.setAttribute("aria-modal", "true");
  _0x59b444.setAttribute("aria-label", _0x1dfdaf("canvasInteraction.materialComparison.ariaLabel"));
  const _0x449a71 = createElement(_0x330a79, "header", "v2-material-comparison-header");
  const _0x56dafb = createElement(_0x330a79, "div", "v2-material-comparison-header-meta");
  const _0x4b4dfd = createTextElement(_0x330a79, "h2", "v2-material-comparison-title", _0x1dfdaf("canvasInteraction.materialComparison.title"));
  const _0x206234 = createTextElement(_0x330a79, "span", "v2-material-comparison-count", "2 / " + _0x260f7b.length);
  const _0x568e7b = createTextElement(_0x330a79, "span", "v2-material-comparison-cache-hint", _0x1dfdaf("canvasInteraction.materialComparison.localCache"));
  _0x56dafb.appendChild(_0x4b4dfd);
  _0x56dafb.appendChild(_0x206234);
  _0x56dafb.appendChild(_0x568e7b);
  const _0x1e509f = createElement(_0x330a79, "div", "v2-material-comparison-mode-switch");
  _0x1e509f.setAttribute("role", "group");
  _0x1e509f.setAttribute("aria-label", _0x1dfdaf("canvasInteraction.materialComparison.modeGroupLabel"));
  const _0x262a5c = createButton(_0x330a79, "v2-material-comparison-mode-button is-active", _0x1dfdaf("canvasInteraction.materialComparison.slideMode"));
  _0x262a5c.dataset.comparisonMode = MODE_SLIDE;
  _0x262a5c.setAttribute("aria-pressed", "true");
  const _0x2f2316 = createButton(_0x330a79, "v2-material-comparison-mode-button", _0x1dfdaf("canvasInteraction.materialComparison.sideBySideMode"));
  _0x2f2316.dataset.comparisonMode = MODE_SIDE_BY_SIDE;
  _0x2f2316.setAttribute("aria-pressed", "false");
  _0x1e509f.appendChild(_0x262a5c);
  _0x1e509f.appendChild(_0x2f2316);
  const _0x4fe266 = createButton(_0x330a79, "v2-material-comparison-close", _0x1dfdaf("canvasInteraction.materialComparison.close"));
  _0x449a71.appendChild(_0x56dafb);
  _0x449a71.appendChild(_0x1e509f);
  _0x449a71.appendChild(_0x4fe266);
  const _0x3c113a = createElement(_0x330a79, "main", "v2-material-comparison-main");
  const _0x1d7d68 = createElement(_0x330a79, "div", "v2-material-comparison-stage-shell");
  const _0x1e2b08 = createElement(_0x330a79, "div", "v2-material-comparison-stage");
  _0x1e2b08.dataset.comparisonMode = MODE_SLIDE;
  _0x1e2b08.style.setProperty("--material-comparison-divider", "50%");
  const _0x326cca = _0x28a42d => {
    const _0x212233 = createElement(_0x330a79, "div", "v2-material-comparison-panel is-" + _0x28a42d);
    const _0x371a3a = createElement(_0x330a79, "img", "v2-material-comparison-image");
    _0x371a3a.draggable = false;
    const _0xa3080e = createTextElement(_0x330a79, "span", "v2-material-comparison-panel-badge", _0x1dfdaf("canvasInteraction.materialComparison." + _0x28a42d));
    _0x212233.appendChild(_0x371a3a);
    _0x212233.appendChild(_0xa3080e);
    return {
      panel: _0x212233,
      image: _0x371a3a
    };
  };
  const _0x2f8ef2 = _0x326cca(SLOT_RIGHT);
  const _0x23be43 = _0x326cca(SLOT_LEFT);
  const _0x2d5cf6 = createButton(_0x330a79, "v2-material-comparison-divider", "", _0x1dfdaf("canvasInteraction.materialComparison.dividerLabel"));
  _0x2d5cf6.setAttribute("role", "slider");
  _0x2d5cf6.setAttribute("aria-valuemin", "0");
  _0x2d5cf6.setAttribute("aria-valuemax", "100");
  _0x2d5cf6.setAttribute("aria-valuenow", "50");
  _0x1e2b08.appendChild(_0x2f8ef2.panel);
  _0x1e2b08.appendChild(_0x23be43.panel);
  _0x1e2b08.appendChild(_0x2d5cf6);
  _0x1d7d68.appendChild(_0x1e2b08);
  _0x3c113a.appendChild(_0x1d7d68);
  const _0x466c5f = createElement(_0x330a79, "footer", "v2-material-comparison-footer");
  const _0xd45feb = createElement(_0x330a79, "div", "v2-material-comparison-library-header");
  const _0x51cf38 = createTextElement(_0x330a79, "strong", "v2-material-comparison-library-title", _0x1dfdaf("canvasInteraction.materialComparison.library"));
  const _0x2edbee = createTextElement(_0x330a79, "span", "v2-material-comparison-library-count", String(_0x260f7b.length));
  const _0x23440a = createTextElement(_0x330a79, "span", "v2-material-comparison-library-hint", _0x1dfdaf("canvasInteraction.materialComparison.libraryHint"));
  _0xd45feb.appendChild(_0x51cf38);
  _0xd45feb.appendChild(_0x2edbee);
  _0xd45feb.appendChild(_0x23440a);
  const _0xf67049 = createElement(_0x330a79, "div", "v2-material-comparison-thumbnail-track");
  const _0x4e56b4 = _0x260f7b.map((_0x154806, _0x552113) => {
    const _0x14ac2b = createButton(_0x330a79, "v2-material-comparison-thumbnail-card", "", _0x1dfdaf("canvasInteraction.materialComparison.thumbnailLabel", {
      index: _0x552113 + 1,
      name: _0x154806.label
    }));
    _0x14ac2b.dataset.comparisonIndex = String(_0x552113);
    const _0x45b7be = createElement(_0x330a79, "img", "v2-material-comparison-thumbnail-image");
    _0x45b7be.src = _0x154806.thumbnailUrl;
    _0x45b7be.alt = _0x154806.label;
    _0x45b7be.draggable = false;
    const _0x4d0ad5 = createTextElement(_0x330a79, "span", "v2-material-comparison-thumbnail-name", _0x154806.label);
    const _0x496388 = createTextElement(_0x330a79, "span", "v2-material-comparison-thumbnail-badge is-left", _0x1dfdaf("canvasInteraction.materialComparison.left"));
    const _0x2f5130 = createTextElement(_0x330a79, "span", "v2-material-comparison-thumbnail-badge is-right", _0x1dfdaf("canvasInteraction.materialComparison.right"));
    _0x14ac2b.appendChild(_0x45b7be);
    _0x14ac2b.appendChild(_0x4d0ad5);
    _0x14ac2b.appendChild(_0x496388);
    _0x14ac2b.appendChild(_0x2f5130);
    _0xf67049.appendChild(_0x14ac2b);
    return {
      card: _0x14ac2b,
      leftBadge: _0x496388,
      rightBadge: _0x2f5130
    };
  });
  _0x466c5f.appendChild(_0xd45feb);
  _0x466c5f.appendChild(_0xf67049);
  _0x59b444.appendChild(_0x449a71);
  _0x59b444.appendChild(_0x3c113a);
  _0x59b444.appendChild(_0x466c5f);
  function _0x1bb7ab(_0x32cf9c) {
    if (_0x32cf9c === SLOT_LEFT) {
      return _0x23be43;
    } else {
      return _0x2f8ef2;
    }
  }
  function _0x4cb241(_0x2e4a7b) {
    const _0x27b187 = _0x2e4a7b === SLOT_LEFT ? _0x41b047.leftAspectRatio : _0x41b047.rightAspectRatio;
    if (Number.isFinite(_0x27b187) && _0x27b187 > 0) {
      return _0x27b187;
    } else {
      return 1;
    }
  }
  function _0x36ddf8(_0x3e8473, _0x2177a9) {
    const _0x5cf769 = Number.isFinite(Number(_0x2177a9)) && Number(_0x2177a9) > 0 ? Number(_0x2177a9) : 1;
    if (_0x3e8473 === SLOT_LEFT) {
      _0x41b047.leftAspectRatio = _0x5cf769;
    } else {
      _0x41b047.rightAspectRatio = _0x5cf769;
    }
    _0x1bb7ab(_0x3e8473).panel.style.setProperty("--material-comparison-source-aspect", String(_0x5cf769));
  }
  function _0x269206() {
    const _0x114183 = _0x3c113a.getBoundingClientRect?.();
    let _0x2e1e5f = Number(_0x3c113a.clientWidth || _0x114183?.width || _0x4f5aa4?.innerWidth || 0);
    let _0x9dd51 = Number(_0x3c113a.clientHeight || _0x114183?.height || _0x4f5aa4?.innerHeight || 0);
    const _0x4369cb = _0x4f5aa4?.getComputedStyle?.(_0x1d7d68);
    if (_0x4369cb) {
      _0x2e1e5f -= (Number.parseFloat(_0x4369cb.paddingLeft) || 0) + (Number.parseFloat(_0x4369cb.paddingRight) || 0);
      _0x9dd51 -= (Number.parseFloat(_0x4369cb.paddingTop) || 0) + (Number.parseFloat(_0x4369cb.paddingBottom) || 0);
    }
    return {
      width: Math.max(1, _0x2e1e5f),
      height: Math.max(1, _0x9dd51)
    };
  }
  function _0x718df7() {
    const _0x321ff9 = _0x4cb241(SLOT_LEFT);
    const _0x232af4 = _0x4cb241(SLOT_RIGHT);
    if (_0x41b047.mode === MODE_SIDE_BY_SIDE) {
      return _0x321ff9 + _0x232af4;
    } else {
      return Math.max(_0x321ff9, _0x232af4);
    }
  }
  function _0xf0c3e8(_0x41769c, _0x1e59c7) {
    let _0x578003 = _0x1e59c7.width;
    let _0x43c1af = _0x578003 / _0x41769c;
    if (_0x43c1af > _0x1e59c7.height) {
      _0x43c1af = _0x1e59c7.height;
      _0x578003 = _0x43c1af * _0x41769c;
    }
    return {
      width: _0x578003,
      height: _0x43c1af,
      area: _0x578003 * _0x43c1af
    };
  }
  function _0x101d43() {
    const _0x28f08f = _0x269206();
    let _0x2c498c;
    if (_0x41b047.mode === MODE_SIDE_BY_SIDE) {
      _0x2c498c = _0xf0c3e8(Math.max(0.01, _0x718df7()), _0x28f08f);
    } else {
      const _0x30a34e = _0xf0c3e8(_0x4cb241(SLOT_LEFT), _0x28f08f);
      const _0x5bde54 = _0xf0c3e8(_0x4cb241(SLOT_RIGHT), _0x28f08f);
      _0x2c498c = _0x30a34e.area >= _0x5bde54.area ? _0x30a34e : _0x5bde54;
    }
    const _0x2017b4 = _0x2c498c.width;
    const _0x549e0d = _0x2c498c.height;
    _0x41b047.stageWidth = Math.max(1, _0x2017b4 * _0x41b047.zoom);
    _0x41b047.stageHeight = Math.max(1, _0x549e0d * _0x41b047.zoom);
    _0x1e2b08.style.setProperty("--material-comparison-stage-width", Math.round(_0x41b047.stageWidth * 100) / 100 + "px");
    _0x1e2b08.style.setProperty("--material-comparison-stage-height", Math.round(_0x41b047.stageHeight * 100) / 100 + "px");
    _0x1e2b08.dataset.zoom = String(Math.round(_0x41b047.zoom * 1000) / 1000);
  }
  function _0x48194b(_0x3a7276, _0x1f9b5f) {
    const _0x3706fb = Math.round(clamp(_0x3a7276, MIN_ZOOM, MAX_ZOOM) * 1000) / 1000;
    if (_0x3706fb === _0x41b047.zoom) {
      return false;
    }
    const _0x200126 = _0x1e2b08.getBoundingClientRect?.();
    const _0x25d77d = clamp((Number(_0x1f9b5f?.clientX) - Number(_0x200126?.left || 0)) / Math.max(1, Number(_0x200126?.width || 0)), 0, 1);
    const _0x40485c = clamp((Number(_0x1f9b5f?.clientY) - Number(_0x200126?.top || 0)) / Math.max(1, Number(_0x200126?.height || 0)), 0, 1);
    _0x41b047.zoom = _0x3706fb;
    _0x101d43();
    const _0x4cf61f = () => {
      const _0x5c0c35 = _0x1e2b08.getBoundingClientRect?.();
      if (!_0x5c0c35 || !_0x200126) {
        return;
      }
      const _0x16812c = Number(_0x5c0c35.left || 0) + Number(_0x5c0c35.width || 0) * _0x25d77d;
      const _0x1d1a87 = Number(_0x5c0c35.top || 0) + Number(_0x5c0c35.height || 0) * _0x40485c;
      _0x3c113a.scrollLeft = Number(_0x3c113a.scrollLeft || 0) + _0x16812c - Number(_0x1f9b5f?.clientX || 0);
      _0x3c113a.scrollTop = Number(_0x3c113a.scrollTop || 0) + _0x1d1a87 - Number(_0x1f9b5f?.clientY || 0);
    };
    if (typeof _0x4f5aa4?.requestAnimationFrame === "function") {
      _0x4f5aa4.requestAnimationFrame(_0x4cf61f);
    } else {
      _0x4cf61f();
    }
    return true;
  }
  function _0x24e488(_0x48f098) {
    const _0x56a540 = Number(_0x48f098?.deltaY || _0x48f098?.deltaX || 0);
    if (!_0x56a540) {
      return;
    }
    const _0x224db2 = _0x41b047.zoom * Math.exp(-_0x56a540 * WHEEL_ZOOM_INTENSITY);
    if (!_0x48194b(_0x224db2, _0x48f098)) {
      return;
    }
    _0x48f098.preventDefault?.();
    _0x48f098.stopPropagation?.();
  }
  function _0x5b2d38(_0x1d9e4c, _0x5bdbfe, _0xdd41be) {
    const {
      panel: _0x1ea4b5,
      image: _0x48814f
    } = _0x1d9e4c;
    const _0x59cdad = String(_0xdd41be || "").trim();
    _0x48814f.alt = _0x5bdbfe.label;
    _0x48814f.hidden = false;
    _0x1ea4b5.classList.add("is-loading");
    _0x1ea4b5.classList.remove("is-error");
    _0x48814f.src = _0x59cdad;
  }
  function _0xac62a8(_0x506003, _0x406b3e) {
    const {
      panel: _0x5eef75,
      image: _0x528962
    } = _0x506003;
    _0x528962.alt = _0x406b3e.label;
    _0x528962.hidden = true;
    _0x528962.removeAttribute?.("src");
    _0x5eef75.classList.add("is-loading");
    _0x5eef75.classList.remove("is-error");
  }
  function _0x1e5c59(_0x3db396) {
    _0x3db396.image.hidden = true;
    _0x3db396.panel.classList.remove("is-loading");
    _0x3db396.panel.classList.add("is-error");
  }
  function _0x52f8cc(_0xbfd0e1, _0x31ab73) {
    const _0x5988f6 = Number(_0x31ab73.image.naturalWidth || 0);
    const _0x1620e9 = Number(_0x31ab73.image.naturalHeight || 0);
    if (_0x5988f6 <= 0 || _0x1620e9 <= 0) {
      return;
    }
    const _0x5ead48 = _0x5988f6 / _0x1620e9;
    const _0x486182 = _0xbfd0e1 === SLOT_LEFT ? _0x41b047.leftIndex : _0x41b047.rightIndex;
    if (_0x260f7b[_0x486182]) {
      _0x260f7b[_0x486182].aspectRatio = _0x5ead48;
    }
    _0x36ddf8(_0xbfd0e1, _0x5ead48);
    _0x101d43();
  }
  function _0x51f8e7(_0x298cad) {
    const _0x54d690 = _0x260f7b[_0x298cad];
    if (!_0x54d690) {
      return Promise.resolve("");
    }
    if (_0x54d690.originalUrl) {
      return Promise.resolve(_0x54d690.originalUrl);
    }
    if (_0x54d690.originalPromise) {
      return _0x54d690.originalPromise;
    }
    _0x54d690.originalPromise = Promise.resolve().then(() => _0xcdebb(_0x54d690.node)).then(_0x45b736 => {
      const _0x58fa5a = String(_0x45b736?.url || "").trim();
      if (!_0x58fa5a) {
        return "";
      }
      if (_0x45b736?.revokeUrlOnClose) {
        if (_0x4b527e) {
          safeRevokeObjectUrl(_0x58fa5a);
        } else {
          _0x310f15.add(_0x58fa5a);
        }
      }
      _0x54d690.originalUrl = _0x58fa5a;
      _0x54d690.revokeUrlOnClose = _0x45b736?.revokeUrlOnClose === true;
      return _0x58fa5a;
    }).catch(() => "");
    return _0x54d690.originalPromise;
  }
  function _0x22a99c(_0x2f3179, _0x27bfa5) {
    const _0x5a20f5 = _0x260f7b[_0x27bfa5];
    if (!_0x5a20f5) {
      return;
    }
    const _0x36ad23 = _0x2f3179 === SLOT_LEFT ? _0x23be43 : _0x2f8ef2;
    _0x36ddf8(_0x2f3179, _0x5a20f5.aspectRatio || 1);
    _0x101d43();
    if (_0x5a20f5.originalUrl) {
      _0x5b2d38(_0x36ad23, _0x5a20f5, _0x5a20f5.originalUrl);
      return;
    }
    _0xac62a8(_0x36ad23, _0x5a20f5);
    _0x51f8e7(_0x27bfa5).then(_0x4d4be4 => {
      if (_0x4b527e) {
        return;
      }
      const _0x12b2a8 = _0x2f3179 === SLOT_LEFT ? _0x41b047.leftIndex : _0x41b047.rightIndex;
      if (_0x12b2a8 !== _0x27bfa5) {
        return;
      }
      if (_0x4d4be4) {
        _0x5b2d38(_0x36ad23, _0x5a20f5, _0x4d4be4);
      } else {
        _0x1e5c59(_0x36ad23);
      }
    });
  }
  function _0x5c9030() {
    _0x4e56b4.forEach(({
      card: _0x3a11c4,
      leftBadge: _0x3d8596,
      rightBadge: _0x869765
    }, _0x54e066) => {
      const _0x2f1a03 = _0x54e066 === _0x41b047.leftIndex;
      const _0x4e4f94 = _0x54e066 === _0x41b047.rightIndex;
      _0x3a11c4.classList.toggle("is-selected", _0x2f1a03 || _0x4e4f94);
      _0x3a11c4.classList.toggle("is-left", _0x2f1a03);
      _0x3a11c4.classList.toggle("is-right", _0x4e4f94);
      _0x3d8596.hidden = !_0x2f1a03;
      _0x869765.hidden = !_0x4e4f94;
      _0x3a11c4.setAttribute("aria-pressed", String(_0x2f1a03 || _0x4e4f94));
    });
  }
  function _0x1c0ecd(_0x28c3a1) {
    const _0x83cf26 = Math.trunc(Number(_0x28c3a1));
    if (!Number.isFinite(_0x83cf26) || !_0x260f7b[_0x83cf26]) {
      return;
    }
    const _0x3e1957 = _0x41b047.nextSlot;
    if (_0x3e1957 === SLOT_LEFT) {
      _0x41b047.leftIndex = _0x83cf26;
      _0x41b047.nextSlot = SLOT_RIGHT;
    } else {
      _0x41b047.rightIndex = _0x83cf26;
      _0x41b047.nextSlot = SLOT_LEFT;
    }
    _0x22a99c(_0x3e1957, _0x83cf26);
    _0x5c9030();
  }
  function _0x204c54(_0x5eef44) {
    const _0x344f48 = _0x5eef44 === MODE_SIDE_BY_SIDE ? MODE_SIDE_BY_SIDE : MODE_SLIDE;
    _0x41b047.mode = _0x344f48;
    _0x1e2b08.dataset.comparisonMode = _0x344f48;
    _0x262a5c.classList.toggle("is-active", _0x344f48 === MODE_SLIDE);
    _0x2f2316.classList.toggle("is-active", _0x344f48 === MODE_SIDE_BY_SIDE);
    _0x262a5c.setAttribute("aria-pressed", String(_0x344f48 === MODE_SLIDE));
    _0x2f2316.setAttribute("aria-pressed", String(_0x344f48 === MODE_SIDE_BY_SIDE));
    _0x101d43();
  }
  function _0x36dc52(_0x13d4f6) {
    _0x41b047.dividerPercent = Math.round(clamp(_0x13d4f6, 0, 100) * 100) / 100;
    _0x1e2b08.style.setProperty("--material-comparison-divider", _0x41b047.dividerPercent + "%");
    _0x2d5cf6.setAttribute("aria-valuenow", String(Math.round(_0x41b047.dividerPercent)));
  }
  function _0x2b3ec3(_0x601487) {
    const _0x409a25 = _0x1e2b08.getBoundingClientRect?.();
    const _0x28918e = Number(_0x409a25?.width) || 0;
    if (_0x28918e <= 0) {
      return;
    }
    const _0x38397b = Number(_0x409a25?.left) || 0;
    _0x36dc52((Number(_0x601487?.clientX) - _0x38397b) / _0x28918e * 100);
  }
  function _0x5123cd(_0x8b1d05) {
    if (_0x621ed4 === null) {
      return;
    }
    if (_0x8b1d05?.pointerId != null && _0x621ed4 != null && _0x8b1d05.pointerId !== _0x621ed4) {
      return;
    }
    _0x8b1d05?.preventDefault?.();
    _0x8b1d05?.stopPropagation?.();
    _0x4f5aa4?.removeEventListener?.("pointermove", _0x19b62f, true);
    _0x4f5aa4?.removeEventListener?.("pointerup", _0x5123cd, true);
    _0x4f5aa4?.removeEventListener?.("pointercancel", _0x5123cd, true);
    _0x1e2b08.classList.remove("is-dragging-divider");
    _0x621ed4 = null;
  }
  function _0x19b62f(_0x4b5e8b) {
    if (_0x621ed4 === null) {
      return;
    }
    if (_0x4b5e8b?.pointerId != null && _0x621ed4 != null && _0x4b5e8b.pointerId !== _0x621ed4) {
      return;
    }
    _0x4b5e8b?.preventDefault?.();
    _0x4b5e8b?.stopPropagation?.();
    _0x2b3ec3(_0x4b5e8b);
  }
  function _0x439f5d(_0x3cd058) {
    if (_0x41b047.mode !== MODE_SLIDE) {
      return;
    }
    if (_0x3cd058?.button != null && _0x3cd058.button !== 0) {
      return;
    }
    _0x3cd058?.preventDefault?.();
    _0x3cd058?.stopPropagation?.();
    _0x5123cd();
    _0x621ed4 = _0x3cd058?.pointerId ?? 0;
    _0x1e2b08.classList.add("is-dragging-divider");
    _0x2b3ec3(_0x3cd058);
    _0x4f5aa4?.addEventListener?.("pointermove", _0x19b62f, true);
    _0x4f5aa4?.addEventListener?.("pointerup", _0x5123cd, true);
    _0x4f5aa4?.addEventListener?.("pointercancel", _0x5123cd, true);
  }
  function _0x4c909f(_0x527a30) {
    if (_0x41b047.mode !== MODE_SLIDE) {
      return;
    }
    if (_0x527a30.key !== "ArrowLeft" && _0x527a30.key !== "ArrowRight") {
      return;
    }
    _0x527a30.preventDefault?.();
    _0x527a30.stopPropagation?.();
    _0x36dc52(_0x41b047.dividerPercent + (_0x527a30.key === "ArrowRight" ? 2 : -2));
  }
  function _0x55cd8f() {
    _0x4f5aa4?.removeEventListener?.("pointermove", _0x1407b3, true);
    _0x4f5aa4?.removeEventListener?.("pointerup", _0x5b22fa, true);
    _0x4f5aa4?.removeEventListener?.("pointercancel", _0x5b22fa, true);
  }
  function _0x3e4d60() {
    _0x55cd8f();
    _0x59b444.classList.remove("is-panning");
    _0x1e2b08.classList.remove("is-panning");
    _0x21b1fd = null;
  }
  function _0x4d97ba(_0xc857c7) {
    if (Number(_0xc857c7?.button) !== 1) {
      return;
    }
    _0xc857c7.preventDefault?.();
    _0xc857c7.stopPropagation?.();
    _0x5123cd();
    _0x3e4d60();
    _0x21b1fd = {
      pointerId: _0xc857c7?.pointerId,
      startX: Number(_0xc857c7?.clientX || 0),
      startY: Number(_0xc857c7?.clientY || 0),
      scrollLeft: Number(_0x3c113a.scrollLeft || 0),
      scrollTop: Number(_0x3c113a.scrollTop || 0)
    };
    _0x59b444.classList.add("is-panning");
    _0x1e2b08.classList.add("is-panning");
    _0x1e2b08.setPointerCapture?.(_0xc857c7?.pointerId);
    _0x4f5aa4?.addEventListener?.("pointermove", _0x1407b3, true);
    _0x4f5aa4?.addEventListener?.("pointerup", _0x5b22fa, true);
    _0x4f5aa4?.addEventListener?.("pointercancel", _0x5b22fa, true);
  }
  function _0x1407b3(_0x429df2) {
    if (!_0x21b1fd) {
      return;
    }
    if (_0x21b1fd.pointerId != null && _0x429df2?.pointerId != null && _0x429df2.pointerId !== _0x21b1fd.pointerId) {
      return;
    }
    _0x429df2.preventDefault?.();
    _0x429df2.stopPropagation?.();
    _0x3c113a.scrollLeft = _0x21b1fd.scrollLeft - (Number(_0x429df2?.clientX || 0) - _0x21b1fd.startX);
    _0x3c113a.scrollTop = _0x21b1fd.scrollTop - (Number(_0x429df2?.clientY || 0) - _0x21b1fd.startY);
  }
  function _0x5b22fa(_0x2102a2) {
    if (!_0x21b1fd) {
      return;
    }
    if (_0x21b1fd.pointerId != null && _0x2102a2?.pointerId != null && _0x2102a2.pointerId !== _0x21b1fd.pointerId) {
      return;
    }
    _0x2102a2?.preventDefault?.();
    _0x2102a2?.stopPropagation?.();
    try {
      _0x1e2b08.releasePointerCapture?.(_0x21b1fd.pointerId);
    } catch (_0xb78f0a) {}
    _0x3e4d60();
  }
  function _0x17db12(_0x40d524) {
    if (Number(_0x40d524?.button) !== 1) {
      return;
    }
    _0x40d524.preventDefault?.();
    _0x40d524.stopPropagation?.();
  }
  const _0x29715c = () => {
    if (_0x4b527e) {
      return;
    }
    _0x4b527e = true;
    _0x330a79.removeEventListener?.("keydown", _0x1e8f93, true);
    _0x4f5aa4?.removeEventListener?.("pointermove", _0x19b62f, true);
    _0x4f5aa4?.removeEventListener?.("pointerup", _0x5123cd, true);
    _0x4f5aa4?.removeEventListener?.("pointercancel", _0x5123cd, true);
    _0x4f5aa4?.removeEventListener?.("resize", _0x101d43);
    _0x3e4d60();
    _0x59b444.remove();
    _0x310f15.forEach(safeRevokeObjectUrl);
    _0x310f15.clear();
    if (activeMaterialComparisonClose === _0x29715c) {
      activeMaterialComparisonClose = null;
    }
  };
  function _0x1e8f93(_0x2b19fb) {
    if (_0x2b19fb.key !== "Escape") {
      return;
    }
    _0x2b19fb.preventDefault?.();
    _0x2b19fb.stopPropagation?.();
    _0x29715c();
  }
  _0x262a5c.addEventListener("click", () => _0x204c54(MODE_SLIDE));
  _0x2f2316.addEventListener("click", () => _0x204c54(MODE_SIDE_BY_SIDE));
  _0x4fe266.addEventListener("click", _0x29715c);
  _0x1e2b08.addEventListener("pointerdown", _0x439f5d);
  _0x1e2b08.addEventListener("pointerdown", _0x4d97ba);
  _0x1e2b08.addEventListener("auxclick", _0x17db12);
  _0x1e2b08.addEventListener("wheel", _0x24e488, {
    passive: false
  });
  _0x2d5cf6.addEventListener("keydown", _0x4c909f);
  _0x23be43.image.addEventListener("load", () => {
    _0x52f8cc(SLOT_LEFT, _0x23be43);
    _0x23be43.panel.classList.remove("is-loading", "is-error");
  });
  _0x2f8ef2.image.addEventListener("load", () => {
    _0x52f8cc(SLOT_RIGHT, _0x2f8ef2);
    _0x2f8ef2.panel.classList.remove("is-loading", "is-error");
  });
  [_0x23be43, _0x2f8ef2].forEach(({
    panel: _0x9728b9,
    image: _0x1227c0
  }) => {
    _0x1227c0.addEventListener("error", () => {
      _0x1227c0.hidden = true;
      _0x9728b9.classList.remove("is-loading");
      _0x9728b9.classList.add("is-error");
    });
  });
  _0x4e56b4.forEach(({
    card: _0x4d2783
  }, _0x420c94) => {
    _0x4d2783.addEventListener("click", () => _0x1c0ecd(_0x420c94));
  });
  _0xf67049.addEventListener("wheel", _0x83fc15 => {
    const _0x2a1f31 = Math.max(0, Number(_0xf67049.scrollWidth || 0) - Number(_0xf67049.clientWidth || 0));
    if (_0x2a1f31 <= 0) {
      return;
    }
    const _0x2ad874 = Number(_0x83fc15.deltaY || _0x83fc15.deltaX || 0);
    if (!_0x2ad874) {
      return;
    }
    const _0x7ca7a0 = Number(_0xf67049.scrollLeft || 0);
    const _0x153f4b = clamp(_0x7ca7a0 + _0x2ad874, 0, _0x2a1f31);
    if (_0x153f4b === _0x7ca7a0) {
      return;
    }
    _0xf67049.scrollLeft = _0x153f4b;
    _0x83fc15.preventDefault?.();
    _0x83fc15.stopPropagation?.();
  }, {
    passive: false
  });
  _0x3c113a.addEventListener("click", _0x9fdbe3 => {
    if (_0x9fdbe3.target === _0x3c113a || _0x9fdbe3.target === _0x1d7d68) {
      _0x29715c();
    }
  });
  _0x59b444.addEventListener("click", _0x4e2c6e => {
    if (_0x4e2c6e.target === _0x59b444) {
      _0x29715c();
    }
  });
  _0x59b444.addEventListener("contextmenu", _0x5a850e => {
    _0x5a850e.preventDefault?.();
    _0x5a850e.stopPropagation?.();
  });
  _0x330a79.addEventListener?.("keydown", _0x1e8f93, true);
  _0x4f5aa4?.addEventListener?.("resize", _0x101d43);
  _0x22a99c(SLOT_LEFT, _0x41b047.leftIndex);
  _0x22a99c(SLOT_RIGHT, _0x41b047.rightIndex);
  _0x5c9030();
  _0x330a79.body.appendChild(_0x59b444);
  _0x101d43();
  activeMaterialComparisonClose = _0x29715c;
  _0x29715c.overlay = _0x59b444;
  _0x29715c.assignEntry = _0x1c0ecd;
  _0x29715c.setMode = _0x204c54;
  _0x29715c.getState = () => ({
    ..._0x41b047
  });
  return _0x29715c;
}