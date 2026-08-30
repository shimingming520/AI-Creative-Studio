const TOOLTIP_ATTRS = ["data-tooltip", "data-tooltip-right"];
const OVERFLOW_TOOLTIP_ATTR = "data-tooltip-overflow";
const NATIVE_TITLE_BACKUP_ATTR = "data-native-title";
const GENERATED_TOOLTIP_ATTR = "data-tooltip-source";
const GENERATED_TOOLTIP_VALUE = "native-title";
const TOOLTIP_PORTAL_CLASS = "global-tooltip";
const TOOLTIP_PORTAL_READY_CLASS = "has-global-tooltip-portal";
const TOOLTIP_ARROW_CLASS = "global-tooltip-arrow";
const DEFAULT_TOOLTIP_PLACEMENT = "top";
const RIGHT_TOOLTIP_PLACEMENT = "right";
const TOOLTIP_GAP_PX = 12;
const TOOLTIP_VIEWPORT_PADDING_PX = 8;
const TOOLTIP_ARROW_PADDING_PX = 12;
const TOOLTIP_INTERACTION_SUPPRESS_MS = 420;
const GLOBAL_TOOLTIP_EXCLUDE_SELECTOR = ".generation-node-help-tip";
let installed = null;
function isElementNode(_0x936bc4) {
  return _0x936bc4 && _0x936bc4.nodeType === 1;
}
function clamp(_0x2b5b76, _0x4466a9, _0x120ec7) {
  const _0xb00e09 = Number.isFinite(_0x4466a9) ? _0x4466a9 : 0;
  const _0x2afa33 = Number.isFinite(_0x120ec7) ? Math.max(_0xb00e09, _0x120ec7) : _0xb00e09;
  return Math.min(Math.max(_0x2b5b76, _0xb00e09), _0x2afa33);
}
function normalizeRect(_0x190ccf = {}) {
  const _0x140744 = Number(_0x190ccf.left) || 0;
  const _0xcc271b = Number(_0x190ccf.top) || 0;
  const _0x1fe686 = Number(_0x190ccf.width) || Math.max(0, (Number(_0x190ccf.right) || _0x140744) - _0x140744);
  const _0x4cdb4c = Number(_0x190ccf.height) || Math.max(0, (Number(_0x190ccf.bottom) || _0xcc271b) - _0xcc271b);
  return {
    left: _0x140744,
    top: _0xcc271b,
    right: Number(_0x190ccf.right) || _0x140744 + _0x1fe686,
    bottom: Number(_0x190ccf.bottom) || _0xcc271b + _0x4cdb4c,
    width: _0x1fe686,
    height: _0x4cdb4c
  };
}
function normalizeViewport(_0x4772bd = {}) {
  return {
    width: Number(_0x4772bd.width) || Number(_0x4772bd.innerWidth) || Number(globalThis.innerWidth) || 0,
    height: Number(_0x4772bd.height) || Number(_0x4772bd.innerHeight) || Number(globalThis.innerHeight) || 0,
    padding: Number(_0x4772bd.padding) >= 0 ? Number(_0x4772bd.padding) : TOOLTIP_VIEWPORT_PADDING_PX,
    gap: Number(_0x4772bd.gap) >= 0 ? Number(_0x4772bd.gap) : TOOLTIP_GAP_PX,
    arrowPadding: Number(_0x4772bd.arrowPadding) >= 0 ? Number(_0x4772bd.arrowPadding) : TOOLTIP_ARROW_PADDING_PX
  };
}
function getTooltipNow(_0x46ebc0) {
  const _0x2ee441 = _0x46ebc0?.defaultView || globalThis;
  const _0x58bce8 = _0x2ee441.performance || globalThis.performance;
  if (typeof _0x58bce8?.now === "function") {
    return _0x58bce8.now();
  }
  return Date.now();
}
export function computeTooltipPosition(_0x57ad82, _0x2eb59e, _0x2cb031, _0x35fc2f = DEFAULT_TOOLTIP_PLACEMENT) {
  const _0x2cb1e0 = normalizeRect(_0x57ad82);
  const _0x26d557 = normalizeRect(_0x2eb59e);
  const _0x11867d = normalizeViewport(_0x2cb031);
  const _0x7deee3 = _0x11867d.width - _0x11867d.padding - _0x26d557.width;
  const _0x503979 = _0x11867d.height - _0x11867d.padding - _0x26d557.height;
  const _0x14d0f9 = _0x2cb1e0.left + _0x2cb1e0.width / 2;
  const _0x47b720 = _0x2cb1e0.top + _0x2cb1e0.height / 2;
  let _0x5db4d0 = _0x35fc2f === RIGHT_TOOLTIP_PLACEMENT ? RIGHT_TOOLTIP_PLACEMENT : "top";
  let _0x5671ca = _0x14d0f9 - _0x26d557.width / 2;
  let _0x3da74c = _0x2cb1e0.top - _0x26d557.height - _0x11867d.gap;
  if (_0x5db4d0 === "top") {
    const _0x1f413c = _0x2cb1e0.bottom + _0x11867d.gap;
    if (_0x3da74c < _0x11867d.padding && _0x1f413c + _0x26d557.height <= _0x11867d.height - _0x11867d.padding) {
      _0x5db4d0 = "bottom";
      _0x3da74c = _0x1f413c;
    }
    _0x5671ca = clamp(_0x5671ca, _0x11867d.padding, _0x7deee3);
    _0x3da74c = clamp(_0x3da74c, _0x11867d.padding, _0x503979);
    return {
      left: _0x5671ca,
      top: _0x3da74c,
      placement: _0x5db4d0,
      arrowLeft: clamp(_0x14d0f9 - _0x5671ca, _0x11867d.arrowPadding, _0x26d557.width - _0x11867d.arrowPadding),
      arrowTop: null
    };
  }
  _0x5671ca = _0x2cb1e0.right + _0x11867d.gap;
  _0x3da74c = _0x47b720 - _0x26d557.height / 2;
  if (_0x5671ca + _0x26d557.width > _0x11867d.width - _0x11867d.padding && _0x2cb1e0.left - _0x11867d.gap - _0x26d557.width >= _0x11867d.padding) {
    _0x5db4d0 = "left";
    _0x5671ca = _0x2cb1e0.left - _0x11867d.gap - _0x26d557.width;
  }
  _0x5671ca = clamp(_0x5671ca, _0x11867d.padding, _0x7deee3);
  _0x3da74c = clamp(_0x3da74c, _0x11867d.padding, _0x503979);
  return {
    left: _0x5671ca,
    top: _0x3da74c,
    placement: _0x5db4d0,
    arrowLeft: null,
    arrowTop: clamp(_0x47b720 - _0x3da74c, _0x11867d.arrowPadding, _0x26d557.height - _0x11867d.arrowPadding)
  };
}
function hasUnifiedTooltip(_0x1e6a0c) {
  return TOOLTIP_ATTRS.some(_0x80a017 => {
    const _0x48da53 = _0x1e6a0c.getAttribute(_0x80a017);
    return typeof _0x48da53 === "string" && _0x48da53.trim();
  });
}
function shouldMirrorToAriaLabel(_0x1d24a5) {
  if (_0x1d24a5.hasAttribute("aria-label")) {
    return false;
  }
  const _0x35f57f = String(_0x1d24a5.tagName || "").toLowerCase();
  if (_0x35f57f === "button" || _0x35f57f === "input" || _0x35f57f === "select") {
    return true;
  }
  return _0x1d24a5.hasAttribute("role") || _0x1d24a5.hasAttribute("tabindex");
}
export function unifyNativeTooltipElement(_0xcff16d) {
  if (!isElementNode(_0xcff16d) || !_0xcff16d.hasAttribute("title")) {
    return false;
  }
  const _0x43dde7 = String(_0xcff16d.getAttribute("title") || "").trim();
  const _0x1cef79 = _0xcff16d.getAttribute(GENERATED_TOOLTIP_ATTR) === GENERATED_TOOLTIP_VALUE;
  if (_0x43dde7) {
    if (_0x1cef79 || !hasUnifiedTooltip(_0xcff16d)) {
      _0xcff16d.setAttribute("data-tooltip", _0x43dde7);
      _0xcff16d.setAttribute(GENERATED_TOOLTIP_ATTR, GENERATED_TOOLTIP_VALUE);
    }
    _0xcff16d.setAttribute(NATIVE_TITLE_BACKUP_ATTR, _0x43dde7);
    if (shouldMirrorToAriaLabel(_0xcff16d)) {
      _0xcff16d.setAttribute("aria-label", _0x43dde7);
    }
  } else if (_0x1cef79) {
    _0xcff16d.removeAttribute("data-tooltip");
    _0xcff16d.removeAttribute(GENERATED_TOOLTIP_ATTR);
    _0xcff16d.removeAttribute(NATIVE_TITLE_BACKUP_ATTR);
  }
  _0xcff16d.removeAttribute("title");
  return true;
}
export function unifyNativeTooltips(_0x2cbadb = globalThis.document) {
  if (!_0x2cbadb) {
    return 0;
  }
  let _0x5e6829 = 0;
  if (isElementNode(_0x2cbadb) && unifyNativeTooltipElement(_0x2cbadb)) {
    _0x5e6829 += 1;
  }
  const _0x2fe216 = _0x2cbadb.querySelectorAll?.("[title]");
  if (!_0x2fe216) {
    return _0x5e6829;
  }
  _0x2fe216.forEach(_0x135221 => {
    if (unifyNativeTooltipElement(_0x135221)) {
      _0x5e6829 += 1;
    }
  });
  return _0x5e6829;
}
function normalizeMutationRecord(_0x2e1fc0) {
  if (_0x2e1fc0.type === "attributes") {
    unifyNativeTooltipElement(_0x2e1fc0.target);
  }
}
function getTooltipDescriptor(_0x17d557) {
  if (!isElementNode(_0x17d557)) {
    return null;
  }
  if (_0x17d557.closest?.(GLOBAL_TOOLTIP_EXCLUDE_SELECTOR)) {
    return null;
  }
  if (_0x17d557.hasAttribute?.(OVERFLOW_TOOLTIP_ATTR) && !(Number(_0x17d557.scrollWidth) > Number(_0x17d557.clientWidth) + 1) && !(Number(_0x17d557.scrollHeight) > Number(_0x17d557.clientHeight) + 1)) {
    return null;
  }
  const _0x152690 = String(_0x17d557.closest?.("[data-tooltip-placement]")?.getAttribute?.("data-tooltip-placement") || "").trim();
  const _0x34cc22 = _0x152690 === DEFAULT_TOOLTIP_PLACEMENT || _0x152690 === RIGHT_TOOLTIP_PLACEMENT ? _0x152690 : null;
  const _0xc4e518 = String(_0x17d557.getAttribute("data-tooltip-right") || "").trim();
  if (_0xc4e518) {
    if (_0x17d557.getAttribute("aria-expanded") === "true") {
      return null;
    }
    return {
      text: _0xc4e518,
      placement: _0x34cc22 || RIGHT_TOOLTIP_PLACEMENT
    };
  }
  const _0xd6de28 = String(_0x17d557.getAttribute("data-tooltip") || "").trim();
  if (_0xd6de28) {
    return {
      text: _0xd6de28,
      placement: _0x34cc22 || DEFAULT_TOOLTIP_PLACEMENT
    };
  }
  return null;
}
function findTooltipTarget(_0x324b77) {
  let _0x3dfc2f = isElementNode(_0x324b77) ? _0x324b77 : _0x324b77?.parentElement;
  while (isElementNode(_0x3dfc2f)) {
    if (getTooltipDescriptor(_0x3dfc2f)) {
      return _0x3dfc2f;
    }
    _0x3dfc2f = _0x3dfc2f.parentElement;
  }
  return null;
}
function createTooltipPortal(_0x349c92) {
  const _0x82231e = _0x349c92.createElement("div");
  _0x82231e.className = TOOLTIP_PORTAL_CLASS;
  _0x82231e.setAttribute("role", "tooltip");
  _0x82231e.hidden = true;
  const _0x371dcb = _0x349c92.createElement("div");
  _0x371dcb.className = TOOLTIP_ARROW_CLASS;
  _0x82231e.appendChild(_0x371dcb);
  _0x349c92.body?.appendChild(_0x82231e);
  return {
    portal: _0x82231e,
    arrow: _0x371dcb
  };
}
export function installTooltipUnifier(_0x1fb69c = globalThis.document) {
  if (!_0x1fb69c?.documentElement) {
    return () => {};
  }
  if (installed) {
    return installed.cleanup;
  }
  unifyNativeTooltips(_0x1fb69c);
  _0x1fb69c.documentElement.classList?.add(TOOLTIP_PORTAL_READY_CLASS);
  let _0x27d3dc = null;
  let _0x2a0a98 = null;
  let _0x4e25f4 = null;
  let _0x389e7a = 0;
  let _0x2e8d92 = null;
  let _0x1bbb71 = false;
  const _0x52b4a9 = new Set();
  const _0x5e6c4a = () => {
    if (_0x2a0a98 && _0x2a0a98.isConnected !== false) {
      return _0x2a0a98;
    }
    if (!_0x1fb69c.body || typeof _0x1fb69c.createElement !== "function") {
      return null;
    }
    const _0x55a3ad = createTooltipPortal(_0x1fb69c);
    _0x2a0a98 = _0x55a3ad.portal;
    _0x4e25f4 = _0x55a3ad.arrow;
    return _0x2a0a98;
  };
  const _0x156d34 = (_0x2ec924 = null) => {
    if (_0x2ec924 && _0x27d3dc !== _0x2ec924) {
      return;
    }
    _0x27d3dc = null;
    if (!_0x2a0a98) {
      return;
    }
    _0x2a0a98.classList?.remove("is-visible");
    _0x2a0a98.hidden = true;
  };
  const _0x117908 = () => getTooltipNow(_0x1fb69c) < _0x389e7a;
  const _0x3cbf17 = () => {
    _0x389e7a = Math.max(_0x389e7a, getTooltipNow(_0x1fb69c) + TOOLTIP_INTERACTION_SUPPRESS_MS);
  };
  const _0x16eb78 = () => {
    if (!_0x27d3dc || !_0x2a0a98 || _0x2a0a98.hidden) {
      return;
    }
    if (!_0x1fb69c.documentElement.contains?.(_0x27d3dc)) {
      _0x156d34();
      return;
    }
    const _0x1c3734 = getTooltipDescriptor(_0x27d3dc);
    if (!_0x1c3734) {
      _0x156d34();
      return;
    }
    const _0x3a5baa = _0x27d3dc.getBoundingClientRect?.();
    const _0x154e85 = _0x2a0a98.getBoundingClientRect?.();
    if (!_0x3a5baa || !_0x154e85) {
      return;
    }
    const _0x197f0b = _0x1fb69c.defaultView || globalThis;
    const _0x1fc0af = computeTooltipPosition(_0x3a5baa, _0x154e85, {
      width: _0x197f0b.innerWidth,
      height: _0x197f0b.innerHeight
    }, _0x1c3734.placement);
    _0x2a0a98.style.left = _0x1fc0af.left + "px";
    _0x2a0a98.style.top = _0x1fc0af.top + "px";
    _0x2a0a98.dataset.placement = _0x1fc0af.placement;
    _0x2a0a98.classList?.toggle("is-placement-right", _0x1fc0af.placement === "right");
    _0x2a0a98.classList?.toggle("is-placement-left", _0x1fc0af.placement === "left");
    _0x2a0a98.classList?.toggle("is-placement-bottom", _0x1fc0af.placement === "bottom");
    _0x2a0a98.classList?.toggle("is-placement-top", _0x1fc0af.placement === "top");
    if (_0x4e25f4) {
      if (_0x1fc0af.arrowLeft != null) {
        _0x4e25f4.style.left = _0x1fc0af.arrowLeft + "px";
        _0x4e25f4.style.top = "";
      }
      if (_0x1fc0af.arrowTop != null) {
        _0x4e25f4.style.top = _0x1fc0af.arrowTop + "px";
        _0x4e25f4.style.left = "";
      }
    }
  };
  const _0x592f2b = (_0x34a8be, {
    force = false
  } = {}) => {
    if (!force && _0x117908()) {
      _0x156d34(_0x34a8be);
      return;
    }
    const _0x1e1145 = getTooltipDescriptor(_0x34a8be);
    if (!_0x1e1145) {
      _0x156d34(_0x34a8be);
      return;
    }
    const _0x42a51f = _0x5e6c4a();
    if (!_0x42a51f) {
      return;
    }
    _0x27d3dc = _0x34a8be;
    _0x42a51f.textContent = _0x1e1145.text;
    if (_0x4e25f4) {
      _0x42a51f.appendChild(_0x4e25f4);
    }
    _0x42a51f.hidden = false;
    _0x42a51f.classList?.remove("is-visible");
    _0x42a51f.style.left = "0px";
    _0x42a51f.style.top = "0px";
    _0x16eb78();
    _0x42a51f.classList?.add("is-visible");
  };
  const _0xcadec8 = _0x3d7ff7 => {
    if (!isElementNode(_0x3d7ff7)) {
      return;
    }
    const _0x2c1537 = _0x3d7ff7.classList?.contains("is-tooltip-pinned");
    if (_0x2c1537 && getTooltipDescriptor(_0x3d7ff7)) {
      _0x592f2b(_0x3d7ff7, {
        force: true
      });
      return;
    }
    if (_0x27d3dc === _0x3d7ff7) {
      const _0x549750 = getTooltipDescriptor(_0x3d7ff7);
      if (_0x549750) {
        _0x592f2b(_0x3d7ff7);
      } else {
        _0x156d34(_0x3d7ff7);
      }
    }
  };
  const _0x5a603c = () => {
    _0x2e8d92 = null;
    _0x1bbb71 = false;
    const _0x3bf3d7 = Array.from(_0x52b4a9);
    _0x52b4a9.clear();
    _0x3bf3d7.forEach(_0x1e0a70 => {
      if (_0x1e0a70?.isConnected === false || !_0x1fb69c.documentElement.contains?.(_0x1e0a70)) {
        return;
      }
      unifyNativeTooltips(_0x1e0a70);
    });
  };
  const _0x3dc9c8 = () => {
    if (_0x2e8d92 != null || _0x1bbb71) {
      return;
    }
    const _0x15ff5c = _0x1fb69c.defaultView || globalThis;
    if (typeof _0x15ff5c.requestAnimationFrame === "function") {
      _0x2e8d92 = _0x15ff5c.requestAnimationFrame(_0x5a603c);
      return;
    }
    _0x1bbb71 = true;
    queueMicrotask(_0x5a603c);
  };
  const _0x20e203 = _0x14de26 => {
    if (!isElementNode(_0x14de26)) {
      return;
    }
    for (const _0x4dde2f of _0x52b4a9) {
      if (_0x4dde2f.contains?.(_0x14de26)) {
        return;
      }
      if (_0x14de26.contains?.(_0x4dde2f)) {
        _0x52b4a9.delete(_0x4dde2f);
      }
    }
    _0x52b4a9.add(_0x14de26);
    _0x3dc9c8();
  };
  const _0x2b8174 = _0x1fb69c.defaultView?.MutationObserver || globalThis.MutationObserver;
  const _0x390faa = _0x2b8174 ? new _0x2b8174(_0x4d998e => {
    _0x4d998e.forEach(_0xd7179d => {
      if (_0xd7179d.type === "childList") {
        _0xd7179d.addedNodes?.forEach?.(_0x20e203);
      } else {
        normalizeMutationRecord(_0xd7179d);
      }
      if (_0xd7179d.type === "attributes" && ["class", "data-tooltip", "data-tooltip-right", OVERFLOW_TOOLTIP_ATTR, "aria-expanded"].includes(_0xd7179d.attributeName)) {
        _0xcadec8(_0xd7179d.target);
      }
    });
    if (_0x27d3dc && !_0x1fb69c.documentElement.contains?.(_0x27d3dc)) {
      _0x156d34();
    }
  }) : null;
  _0x390faa?.observe(_0x1fb69c.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["title", "class", "data-tooltip", "data-tooltip-right", OVERFLOW_TOOLTIP_ATTR, "aria-expanded"]
  });
  const _0x511bed = _0x477f21 => {
    const _0x4c0483 = _0x477f21.target?.closest?.("[title]") || _0x477f21.target;
    unifyNativeTooltipElement(_0x4c0483);
    const _0x2df4ea = findTooltipTarget(_0x477f21.target);
    if (_0x2df4ea) {
      _0x592f2b(_0x2df4ea);
    }
  };
  const _0x75f035 = _0x5799d5 => {
    if (!_0x27d3dc) {
      return;
    }
    if (_0x27d3dc.contains?.(_0x5799d5.relatedTarget)) {
      return;
    }
    _0x156d34(_0x27d3dc);
  };
  const _0x494bd3 = _0x4879af => {
    const _0x3ebf92 = _0x4879af.target?.closest?.("[title]") || _0x4879af.target;
    unifyNativeTooltipElement(_0x3ebf92);
    const _0x245413 = findTooltipTarget(_0x4879af.target);
    if (_0x245413) {
      _0x592f2b(_0x245413);
    }
  };
  const _0x1b1710 = _0x1e6580 => {
    if (!_0x27d3dc) {
      return;
    }
    if (_0x27d3dc.contains?.(_0x1e6580.relatedTarget)) {
      return;
    }
    _0x156d34(_0x27d3dc);
  };
  const _0x2a74c2 = () => {
    _0x156d34();
  };
  const _0x2371b9 = () => {
    _0x3cbf17();
    _0x156d34();
  };
  const _0x40829d = () => {
    _0x3cbf17();
    _0x156d34();
  };
  _0x1fb69c.addEventListener?.("pointerover", _0x511bed, true);
  _0x1fb69c.addEventListener?.("pointerout", _0x75f035, true);
  _0x1fb69c.addEventListener?.("focusin", _0x494bd3, true);
  _0x1fb69c.addEventListener?.("focusout", _0x1b1710, true);
  _0x1fb69c.addEventListener?.("pointerdown", _0x2371b9, true);
  _0x1fb69c.addEventListener?.("click", _0x40829d, true);
  _0x1fb69c.addEventListener?.("scroll", _0x2a74c2, true);
  _0x1fb69c.defaultView?.addEventListener?.("scroll", _0x2a74c2, true);
  _0x1fb69c.defaultView?.addEventListener?.("resize", _0x2a74c2);
  const _0x553676 = () => {
    _0x390faa?.disconnect();
    const _0x2275f2 = _0x1fb69c.defaultView || globalThis;
    if (_0x2e8d92 != null && typeof _0x2275f2.cancelAnimationFrame === "function") {
      _0x2275f2.cancelAnimationFrame(_0x2e8d92);
    }
    _0x2e8d92 = null;
    _0x1bbb71 = false;
    _0x52b4a9.clear();
    _0x1fb69c.removeEventListener?.("pointerover", _0x511bed, true);
    _0x1fb69c.removeEventListener?.("pointerout", _0x75f035, true);
    _0x1fb69c.removeEventListener?.("focusin", _0x494bd3, true);
    _0x1fb69c.removeEventListener?.("focusout", _0x1b1710, true);
    _0x1fb69c.removeEventListener?.("pointerdown", _0x2371b9, true);
    _0x1fb69c.removeEventListener?.("click", _0x40829d, true);
    _0x1fb69c.removeEventListener?.("scroll", _0x2a74c2, true);
    _0x1fb69c.defaultView?.removeEventListener?.("scroll", _0x2a74c2, true);
    _0x1fb69c.defaultView?.removeEventListener?.("resize", _0x2a74c2);
    _0x1fb69c.documentElement.classList?.remove(TOOLTIP_PORTAL_READY_CLASS);
    _0x2a0a98?.remove?.();
    _0x27d3dc = null;
    _0x2a0a98 = null;
    _0x4e25f4 = null;
    installed = null;
  };
  installed = {
    cleanup: _0x553676
  };
  return _0x553676;
}