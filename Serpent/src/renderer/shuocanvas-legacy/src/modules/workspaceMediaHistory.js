function escapeHtml(_0x225836) {
  return String(_0x225836 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function clampActiveIndex(_0x1bdf3d, _0x3f4167) {
  if (!_0x3f4167) {
    return 0;
  }
  return Math.max(0, Math.min(_0x3f4167 - 1, Math.trunc(Number(_0x1bdf3d) || 0)));
}
export function renderWorkspaceMediaHistoryMenu({
  title = "媒体结果",
  results = [],
  activeIndex = 0,
  countLabel = "",
  menuLabel = "",
  minimumItemCount = 2,
  getItemLabel = (_0x5dd073, _0x302146) => "版本 " + (_0x302146 + 1),
  getItemStatus = (_0x378c13, _0x109b62, _0x2f565d) => _0x109b62 === _0x2f565d ? "当前使用" : "点击切换",
  renderMedia = () => "",
  getItemAttributes = () => "",
  renderItemAction = () => ""
} = {}) {
  const _0x31c329 = Array.isArray(results) ? results.filter(_0x4469a0 => _0x4469a0 && typeof _0x4469a0 === "object") : [];
  const _0x4a3481 = Math.max(1, Math.trunc(Number(minimumItemCount) || 2));
  if (_0x31c329.length < _0x4a3481) {
    return "";
  }
  const _0x541b0a = clampActiveIndex(activeIndex, _0x31c329.length);
  const _0x511021 = String(title || "媒体结果").trim();
  const _0x52f46a = String(countLabel || _0x31c329.length + " 个版本").trim();
  const _0x2529ca = String(menuLabel || _0x511021 + "历史结果").trim();
  const _0x2beee2 = _0x31c329.map((_0x5b8db7, _0x3aaf8d) => {
    const _0x14cf6f = String(getItemLabel(_0x5b8db7, _0x3aaf8d) || "版本 " + (_0x3aaf8d + 1)).trim();
    const _0x235f4f = String(getItemStatus(_0x5b8db7, _0x3aaf8d, _0x541b0a) || "点击切换").trim();
    const _0x177885 = renderMedia(_0x5b8db7, _0x3aaf8d) || "";
    const _0x57ad50 = String(getItemAttributes(_0x5b8db7, _0x3aaf8d) || "").trim();
    const _0x54286a = "<button type=\"button\" class=\"story-media-history-item story-clip-video-history-item" + (_0x3aaf8d === _0x541b0a ? " is-current" : "") + "\" " + _0x57ad50 + " role=\"menuitem\" aria-current=\"" + (_0x3aaf8d === _0x541b0a ? "true" : "false") + "\">\n      <span class=\"story-media-history-media story-clip-video-history-media\">" + _0x177885 + "</span>\n      <span><strong>" + escapeHtml(_0x14cf6f) + "</strong><small>" + escapeHtml(_0x235f4f) + "</small></span>\n    </button>";
    const _0x3a7779 = String(renderItemAction(_0x5b8db7, _0x3aaf8d, _0x541b0a) || "").trim();
    if (_0x3a7779) {
      return "<div class=\"story-media-history-entry" + (_0x3aaf8d === _0x541b0a ? " is-current" : "") + "\">" + _0x54286a + _0x3a7779 + "</div>";
    } else {
      return _0x54286a;
    }
  }).reverse().join("");
  return "<div class=\"story-media-history-heading story-clip-video-history-heading\"><strong>" + escapeHtml(_0x511021) + "</strong><span>" + escapeHtml(_0x52f46a) + "</span></div>\n    <div class=\"story-media-history-list story-clip-video-history-list\" role=\"menu\" aria-label=\"" + escapeHtml(_0x2529ca) + "\">" + _0x2beee2 + "</div>";
}
export function createWorkspaceMediaHistoryMenuController({
  menuElement: _0x4674ac,
  windowObject = globalThis.window || globalThis,
  getMarkup = () => "",
  hideDelayMs = 120
} = {}) {
  let _0x5c948f = null;
  let _0x2b1b92 = 0;
  const _0x231840 = () => {
    if (!_0x2b1b92) {
      return;
    }
    windowObject?.clearTimeout?.(_0x2b1b92);
    _0x2b1b92 = 0;
  };
  const _0xbe4406 = (_0x165b9a = _0x5c948f) => {
    if (!_0x165b9a || !_0x4674ac?.classList?.contains?.("is-visible")) {
      return false;
    }
    const _0x57affe = _0x165b9a.getBoundingClientRect?.();
    const _0x36810c = _0x4674ac.getBoundingClientRect?.();
    if (!_0x57affe || !_0x36810c) {
      return false;
    }
    const _0x517e9c = windowObject?.innerWidth || 1024;
    const _0x110025 = windowObject?.innerHeight || 768;
    const _0x457ead = 10;
    const _0x1492bd = 10;
    const _0x4650b9 = Math.max(_0x457ead, _0x517e9c - _0x36810c.width - _0x457ead);
    const _0x3cc0f6 = Math.min(Math.max(_0x457ead, _0x57affe.left + (_0x57affe.width - _0x36810c.width) / 2), _0x4650b9);
    const _0x18f683 = _0x57affe.top - _0x36810c.height - _0x1492bd;
    const _0x5e8907 = _0x57affe.bottom + _0x1492bd;
    const _0x294038 = _0x18f683 >= _0x457ead ? _0x18f683 : Math.min(_0x5e8907, Math.max(_0x457ead, _0x110025 - _0x36810c.height - _0x457ead));
    _0x4674ac.style.left = Math.round(_0x3cc0f6) + "px";
    _0x4674ac.style.top = Math.round(_0x294038) + "px";
    _0x4674ac.classList.toggle("opens-downward", _0x18f683 < _0x457ead);
    return true;
  };
  const _0x141114 = ({
    delayed = false
  } = {}) => {
    _0x231840();
    if (delayed) {
      _0x2b1b92 = windowObject?.setTimeout?.(() => {
        _0x2b1b92 = 0;
        _0x141114();
      }, Math.max(0, Number(hideDelayMs) || 0)) || 0;
      return;
    }
    _0x5c948f = null;
    _0x4674ac?.classList?.remove?.("is-visible", "opens-downward");
    _0x4674ac?.setAttribute?.("aria-hidden", "true");
  };
  const _0x4caa21 = (_0x388d26, _0x307b9b = {}) => {
    if (!_0x4674ac || !_0x388d26 || _0x307b9b?.event?.pointerType === "touch") {
      return false;
    }
    const _0x721ebc = getMarkup(_0x388d26, _0x307b9b);
    if (!_0x721ebc) {
      _0x141114();
      return false;
    }
    _0x231840();
    _0x5c948f = _0x388d26;
    _0x4674ac.innerHTML = _0x721ebc;
    _0x4674ac.classList.add("is-visible");
    _0x4674ac.setAttribute("aria-hidden", "false");
    _0xbe4406(_0x388d26);
    return true;
  };
  const _0x4ded83 = ({
    anchor = _0x5c948f,
    context = {},
    focusSelector = "",
    fallbackFocus = null
  } = {}) => {
    const _0x3e6fc0 = _0x4674ac?.querySelector?.(".story-media-history-list");
    const _0x4223af = Number(_0x3e6fc0?.scrollLeft) || 0;
    const _0x535931 = Number(_0x3e6fc0?.scrollTop) || 0;
    const _0x3421ef = _0x4674ac?.ownerDocument?.activeElement;
    const _0x46a83a = Boolean(_0x3421ef && _0x4674ac?.contains?.(_0x3421ef));
    if (!_0x4caa21(anchor, context)) {
      if (_0x46a83a) {
        fallbackFocus?.focus?.();
      }
      return false;
    }
    const _0x27a9a2 = () => {
      if (_0x5c948f !== anchor || !_0x4674ac?.classList?.contains?.("is-visible")) {
        return;
      }
      const _0x328d99 = _0x4674ac?.querySelector?.(".story-media-history-list");
      if (_0x328d99) {
        _0x328d99.scrollLeft = Math.max(0, _0x4223af);
        _0x328d99.scrollTop = Math.max(0, _0x535931);
      }
      if (_0x46a83a && focusSelector) {
        _0x4674ac?.querySelector?.(focusSelector)?.focus?.();
      }
    };
    _0x27a9a2();
    windowObject?.requestAnimationFrame?.(_0x27a9a2);
    return true;
  };
  const _0x18babf = () => _0x231840();
  const _0x25ec7f = () => _0x141114({
    delayed: true
  });
  const _0x327fa4 = _0x30d949 => {
    const _0x170f47 = _0x30d949.target?.closest?.(".story-media-history-list, .story-clip-video-history-list");
    if (!_0x170f47 || !_0x4674ac?.contains?.(_0x170f47)) {
      return false;
    }
    const _0x217615 = Math.max(0, Number(_0x170f47.scrollWidth) - Number(_0x170f47.clientWidth));
    if (!(_0x217615 > 0)) {
      return false;
    }
    const _0x314aa0 = Number(_0x30d949.deltaX) || 0;
    const _0x36df39 = Number(_0x30d949.deltaY) || 0;
    const _0x22cdaf = Math.abs(_0x314aa0) > Math.abs(_0x36df39) ? _0x314aa0 : _0x36df39;
    if (!_0x22cdaf) {
      return false;
    }
    const _0x3804c1 = Math.max(0, Number(_0x170f47.scrollLeft) || 0);
    const _0x296da8 = Math.max(0, Math.min(_0x217615, _0x3804c1 + _0x22cdaf));
    if (_0x296da8 === _0x3804c1) {
      return false;
    }
    _0x30d949.preventDefault?.();
    _0x30d949.stopPropagation?.();
    _0x170f47.scrollLeft = _0x296da8;
    return true;
  };
  _0x4674ac?.addEventListener?.("pointerenter", _0x18babf);
  _0x4674ac?.addEventListener?.("pointerleave", _0x25ec7f);
  _0x4674ac?.addEventListener?.("wheel", _0x327fa4, {
    passive: false
  });
  return Object.freeze({
    show: _0x4caa21,
    refresh: _0x4ded83,
    hide: _0x141114,
    position: _0xbe4406,
    clearHideTimer: _0x231840,
    getAnchor: () => _0x5c948f,
    destroy() {
      _0x231840();
      _0x141114();
      _0x4674ac?.removeEventListener?.("pointerenter", _0x18babf);
      _0x4674ac?.removeEventListener?.("pointerleave", _0x25ec7f);
      _0x4674ac?.removeEventListener?.("wheel", _0x327fa4);
    }
  });
}