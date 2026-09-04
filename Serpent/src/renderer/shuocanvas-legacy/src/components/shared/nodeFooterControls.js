import { RH_AI_APP_PERSISTENT_ADVANCED_CLASS } from "./rhAiAppNodeBehavior.js";
function isPersistentAdvancedPanel(_0x438911) {
  return _0x438911?.classList?.contains?.(RH_AI_APP_PERSISTENT_ADVANCED_CLASS);
}
function hidePopup(_0x275c1e) {
  if (!_0x275c1e) {
    return;
  }
  if (_0x275c1e.classList?.contains("floating-menu")) {
    _0x275c1e.classList.remove("show");
    return;
  }
  if (_0x275c1e.classList?.contains("rh-adv-panel") || _0x275c1e.classList?.contains("rh-vram-adv-panel")) {
    if (isPersistentAdvancedPanel(_0x275c1e)) {
      _0x275c1e.classList.add("show");
      _0x275c1e.style.display = "";
      return;
    }
    _0x275c1e.classList.remove("show");
    _0x275c1e.style.display = "";
    return;
  }
  _0x275c1e.style.display = "none";
}
function showPopup(_0x36e927, _0x386246 = "block") {
  if (!_0x36e927) {
    return;
  }
  if (_0x36e927.classList?.contains("floating-menu")) {
    _0x36e927.classList.add("show");
    return;
  }
  _0x36e927.style.display = _0x386246;
}
export function closeNodeFooterMenus(_0x1a221f, _0x4a4448 = null, _0x6736e1 = {}) {
  if (!_0x1a221f) {
    return;
  }
  const _0x16ddd1 = _0x6736e1?.preserveAdvPanel || null;
  _0x1a221f.querySelectorAll(".node-model-menu, .img-model-menu, .floating-menu.show, .ui-schema-floating-menu.show").forEach(_0x50f91d => {
    if (_0x50f91d !== _0x4a4448) {
      _0x50f91d.classList.remove("show");
    }
  });
  _0x1a221f.querySelectorAll(".node-menu-submenu, .node-model-submenu, .ui-schema-popup, .img-ratio-popup, .rh-res-popup, .vid-duration-pop").forEach(_0x4e0919 => {
    if (_0x4e0919 !== _0x4a4448) {
      hidePopup(_0x4e0919);
    }
  });
  _0x1a221f.querySelectorAll(".rh-adv-panel, .rh-vram-adv-panel").forEach(_0x2da09b => {
    if (_0x2da09b === _0x4a4448) {
      return;
    }
    if (_0x16ddd1 && _0x2da09b.contains(_0x16ddd1)) {
      return;
    }
    hidePopup(_0x2da09b);
  });
}
export function positionNodeSubmenu(_0x2364ef, _0x1869cb) {
  if (!_0x2364ef || !_0x1869cb) {
    return;
  }
  showPopup(_0x1869cb, "flex");
  _0x1869cb.style.top = "0px";
  _0x1869cb.style.maxHeight = "";
  _0x1869cb.style.overflowY = "";
  const _0x5e4b6e = _0x2364ef.closest(".node-model-menu, .img-model-menu");
  if (!_0x5e4b6e) {
    return;
  }
  const _0x2f9e02 = _0x2364ef.offsetTop || 0;
  const _0x4cf233 = Number(globalThis.window?.innerHeight) || Number(globalThis.document?.documentElement?.clientHeight) || 0;
  const _0x107d80 = 12;
  const _0x11d126 = _0x1869cb.offsetHeight || _0x1869cb.getBoundingClientRect?.().height || _0x1869cb.scrollHeight || 0;
  const _0x38c6f9 = _0x5e4b6e.getBoundingClientRect?.() || {
    top: 0
  };
  const _0x37c0dc = _0x2364ef.getBoundingClientRect?.() || null;
  const _0x180ba5 = _0x5e4b6e.clientHeight || _0x38c6f9.height || _0x1869cb.parentElement?.clientHeight || 0;
  const _0xa1cc44 = _0x4cf233 > _0x107d80 * 2 && _0x11d126 > 0 ? Math.min(_0x11d126, _0x4cf233 - _0x107d80 * 2) : _0x11d126;
  const _0x10e9cb = _0x1869cb.dataset?.nodeSubmenuPlacement;
  if (_0x10e9cb === "viewport-left" || _0x10e9cb === "viewport-auto" || _0x10e9cb === "viewport-auto-up") {
    const _0x4ab9df = _0x1869cb.offsetWidth || _0x1869cb.getBoundingClientRect?.().width || _0x38c6f9.width || 240;
    const _0x5733cb = Number(globalThis.window?.innerWidth) || Number(globalThis.document?.documentElement?.clientWidth) || 0;
    const _0xacdc7f = Math.max(_0x107d80, _0x4cf233 - _0x107d80 - _0xa1cc44);
    const _0x1c7496 = Number(_0x38c6f9.top) || 0;
    const _0x37769b = Number(_0x38c6f9.bottom) || _0x1c7496 + _0x180ba5;
    const _0x2aa987 = _0x10e9cb === "viewport-auto-up" ? _0x37769b - _0xa1cc44 : Number(_0x37c0dc?.top) || _0x1c7496 + _0x2f9e02;
    const _0x1e9f66 = Math.min(Math.max(_0x2aa987, _0x107d80), _0xacdc7f);
    const _0x2fb26f = Math.max(_0x107d80, _0x5733cb - _0x107d80 - _0x4ab9df);
    const _0x4d4ec2 = Number(_0x38c6f9.left) || 0;
    const _0x205489 = Number(_0x38c6f9.width) || 0;
    const _0x37a52a = Number(_0x38c6f9.right) || _0x4d4ec2 + _0x205489;
    const _0x49f0ee = Number.parseFloat(globalThis.window?.getComputedStyle?.(_0x5e4b6e)?.borderRightWidth) || 0;
    const _0x5b0d58 = _0x4d4ec2 - _0x4ab9df - 6;
    const _0x198823 = _0x37a52a - _0x49f0ee + 6;
    let _0x10c1ca = _0x5b0d58;
    if (_0x10e9cb === "viewport-auto" || _0x10e9cb === "viewport-auto-up") {
      const _0x147ce8 = _0x198823 + _0x4ab9df <= _0x5733cb - _0x107d80;
      const _0x41ab9c = _0x5b0d58 >= _0x107d80;
      if (_0x147ce8 || !_0x41ab9c) {
        _0x10c1ca = _0x198823;
      }
    }
    _0x10c1ca = Math.max(_0x107d80, Math.min(_0x10c1ca, _0x2fb26f));
    _0x1869cb.style.position = "fixed";
    _0x1869cb.style.right = "auto";
    _0x1869cb.style.left = _0x10c1ca + "px";
    _0x1869cb.style.top = _0x1e9f66 + "px";
    if (_0x11d126 > _0xa1cc44) {
      _0x1869cb.style.maxHeight = Math.floor(_0xa1cc44) + "px";
      _0x1869cb.style.overflowY = "auto";
    }
    return;
  }
  const _0x4c1b73 = Math.max(0, _0x180ba5 - _0xa1cc44);
  let _0x5e0edc = Math.min(_0x2f9e02, _0x4c1b73);
  if (_0x4cf233 > _0x107d80 * 2 && _0xa1cc44 > 0) {
    const _0x481799 = _0x4cf233 - _0x107d80 - _0xa1cc44;
    const _0x5800ad = Math.min(Math.max(_0x38c6f9.top + _0x5e0edc, _0x107d80), _0x481799);
    _0x5e0edc = _0x5800ad - _0x38c6f9.top;
    if (_0x11d126 > _0xa1cc44) {
      _0x1869cb.style.maxHeight = Math.floor(_0xa1cc44) + "px";
      _0x1869cb.style.overflowY = "auto";
    }
  }
  _0x1869cb.style.top = Math.round(_0x5e0edc) + "px";
}
export function createFloatingModelMenuPortal({
  menu: _0x4bf642,
  trigger: _0x44910f,
  host: _0x92e747,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  portalClass = "floating-model-menu-portal",
  submenuPlacement = "viewport-auto"
} = {}) {
  if (!_0x4bf642 || !_0x44910f || !_0x92e747?.appendChild) {
    return {
      isOpen: () => _0x4bf642?.classList?.contains?.("show") === true,
      open() {
        _0x4bf642?.classList?.add?.("show");
      },
      close() {
        _0x4bf642?.classList?.remove?.("show");
      },
      contains: _0x6f4501 => _0x4bf642?.contains?.(_0x6f4501) === true,
      destroy() {}
    };
  }
  const _0x5651f2 = ["position", "left", "top", "right", "bottom", "animation", "transform", "max-height", "overflow-x", "overflow-y", "overscroll-behavior"];
  const _0x9c0733 = ["max-height", "overflow-x", "overflow-y", "overscroll-behavior"];
  const _0x263eb4 = new Map(_0x5651f2.map(_0x5981cb => [_0x5981cb, _0x4bf642.style?.getPropertyValue?.(_0x5981cb) || ""]));
  const _0x24b1ab = new Map();
  let _0x1093c1 = null;
  let _0x2aef3d = null;
  let _0x3aeae9 = false;
  const _0x3e9ddd = _0x3602f1 => {
    const _0x4eb3c0 = _0x263eb4.get(_0x3602f1);
    if (_0x4eb3c0) {
      _0x4bf642.style?.setProperty?.(_0x3602f1, _0x4eb3c0);
    } else {
      _0x4bf642.style?.removeProperty?.(_0x3602f1);
    }
  };
  const _0x4e9132 = () => {
    _0x9c0733.forEach(_0x3e9ddd);
  };
  const _0x31a1cb = () => {
    _0x4bf642.querySelectorAll?.(".node-model-submenu").forEach(_0x4ea702 => {
      if (!_0x24b1ab.has(_0x4ea702)) {
        _0x24b1ab.set(_0x4ea702, _0x4ea702.dataset?.nodeSubmenuPlacement);
      }
      if (_0x4ea702.dataset) {
        _0x4ea702.dataset.nodeSubmenuPlacement = submenuPlacement;
      }
    });
  };
  const _0x463435 = () => {
    _0x24b1ab.forEach((_0x5399f0, _0x3ee545) => {
      if (!_0x3ee545?.dataset) {
        return;
      }
      if (_0x5399f0 === undefined) {
        delete _0x3ee545.dataset.nodeSubmenuPlacement;
      } else {
        _0x3ee545.dataset.nodeSubmenuPlacement = _0x5399f0;
      }
      ["position", "left", "top", "right", "max-height", "overflow-y"].forEach(_0x44beaa => _0x3ee545.style?.removeProperty?.(_0x44beaa));
    });
    _0x24b1ab.clear();
  };
  const _0x4bcc0c = () => {
    if (!_0x3aeae9 || !_0x4bf642.classList.contains("show")) {
      return;
    }
    _0x4e9132();
    const _0x26d653 = _0x44910f.getBoundingClientRect?.();
    const _0x276f6c = _0x4bf642.getBoundingClientRect?.();
    if (!_0x26d653 || !_0x276f6c) {
      return;
    }
    const _0x172e4e = Number(windowObject?.innerWidth) || Number(documentObject?.documentElement?.clientWidth) || 0;
    const _0xbe9449 = Number(windowObject?.innerHeight) || Number(documentObject?.documentElement?.clientHeight) || 0;
    const _0x45b42d = _0x92e747.getBoundingClientRect?.() || {
      top: 0,
      left: 0,
      right: _0x172e4e,
      bottom: _0xbe9449
    };
    const _0x198c76 = 12;
    const _0x2b3543 = 12;
    const _0x235d1f = Math.max(_0x198c76, (Number(_0x45b42d.left) || 0) + _0x198c76);
    const _0x1cbd79 = Math.max(_0x198c76, (Number(_0x45b42d.top) || 0) + _0x198c76);
    const _0x19790e = Math.min(_0x172e4e - _0x198c76, Number(_0x45b42d.right) || _0x172e4e - _0x198c76);
    const _0x172b28 = Math.min(_0xbe9449 - _0x198c76, Number(_0x45b42d.bottom) || _0xbe9449 - _0x198c76);
    const _0x2819c7 = Math.max(0, _0x172b28 - _0x1cbd79);
    const _0x4685b4 = Math.min(_0x276f6c.height, _0x2819c7);
    if (_0x276f6c.height > _0x2819c7) {
      _0x4bf642.style?.setProperty?.("max-height", Math.floor(_0x2819c7) + "px");
      _0x4bf642.style?.setProperty?.("overflow-x", "hidden");
      _0x4bf642.style?.setProperty?.("overflow-y", "auto");
      _0x4bf642.style?.setProperty?.("overscroll-behavior", "contain");
    }
    const _0x10cfbc = Math.max(_0x235d1f, _0x19790e - _0x276f6c.width);
    const _0x507f28 = Math.max(_0x1cbd79, _0x172b28 - _0x4685b4);
    const _0x352072 = Math.min(Math.max(_0x26d653.left, _0x235d1f), _0x10cfbc);
    const _0x2fdc6e = _0x26d653.top - _0x2b3543 - _0x4685b4;
    const _0xf4fb81 = _0x26d653.bottom + _0x2b3543;
    const _0x1840e2 = _0x2fdc6e >= _0x1cbd79 ? Math.min(_0x2fdc6e, _0x507f28) : Math.min(Math.max(_0xf4fb81, _0x1cbd79), _0x507f28);
    _0x4bf642.style?.setProperty?.("position", "fixed");
    _0x4bf642.style?.setProperty?.("left", _0x352072 + "px");
    _0x4bf642.style?.setProperty?.("top", _0x1840e2 + "px");
    _0x4bf642.style?.setProperty?.("right", "auto");
    _0x4bf642.style?.setProperty?.("bottom", "auto");
  };
  const _0x5ecd94 = () => {
    if (!_0x3aeae9) {
      return;
    }
    _0x463435();
    if (portalClass) {
      _0x4bf642.classList.remove(portalClass);
    }
    _0x5651f2.forEach(_0x3e9ddd);
    if (_0x1093c1?.isConnected) {
      const _0x12e607 = _0x2aef3d?.parentNode === _0x1093c1 ? _0x2aef3d : null;
      _0x1093c1.insertBefore(_0x4bf642, _0x12e607);
    }
    _0x1093c1 = null;
    _0x2aef3d = null;
    _0x3aeae9 = false;
  };
  const _0x17f82d = () => {
    closeNodeFooterMenus(_0x4bf642);
    _0x4bf642.classList.remove("show");
    _0x5ecd94();
  };
  const _0x2c7f5f = () => {
    if (!_0x3aeae9) {
      _0x1093c1 = _0x4bf642.parentNode;
      _0x2aef3d = _0x4bf642.nextSibling;
      _0x92e747.appendChild(_0x4bf642);
      if (portalClass) {
        _0x4bf642.classList.add(portalClass);
      }
      _0x3aeae9 = true;
    }
    _0x4bf642.style?.setProperty?.("animation", "none");
    _0x4bf642.style?.setProperty?.("transform", "none");
    _0x31a1cb();
    _0x4bf642.classList.add("show");
    _0x4bcc0c();
  };
  documentObject?.addEventListener?.("scroll", _0x4bcc0c, true);
  windowObject?.addEventListener?.("resize", _0x4bcc0c);
  return {
    isOpen: () => _0x4bf642.classList.contains("show"),
    open: _0x2c7f5f,
    close: _0x17f82d,
    contains: _0xd8aad3 => _0x4bf642.contains?.(_0xd8aad3) === true,
    destroy() {
      _0x17f82d();
      documentObject?.removeEventListener?.("scroll", _0x4bcc0c, true);
      windowObject?.removeEventListener?.("resize", _0x4bcc0c);
    }
  };
}
export function createFloatingUiSchemaPopupPortal({
  selector: _0xd6ecc5,
  host: _0x4a7d3e,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  placement = "inline",
  portalClass = "aigen-ui-schema-popup-portal",
  horizontalAlign = "center",
  contextClass = ""
} = {}) {
  if (!_0xd6ecc5 || placement !== "portal-auto-up" || !_0x4a7d3e?.appendChild) {
    return {
      close() {},
      contains: () => false,
      destroy() {}
    };
  }
  const _0x11f165 = ["position", "left", "top", "right", "bottom", "transform", "min-width", "max-height", "overflow-x", "overflow-y"];
  const _0x53a247 = ["click", "mousedown", "input", "change"];
  const _0xeab03d = 12;
  const _0x31e426 = 8;
  let _0x4027e2 = null;
  let _0x554f5a = 0;
  const _0x2baf44 = () => {
    if (!_0x554f5a) {
      return;
    }
    windowObject?.cancelAnimationFrame?.(_0x554f5a);
    _0x554f5a = 0;
  };
  const _0x5d2b81 = () => {
    const _0x1e7937 = Number(windowObject?.innerWidth) || Number(documentObject?.documentElement?.clientWidth) || 0;
    const _0x15716b = Number(windowObject?.innerHeight) || Number(documentObject?.documentElement?.clientHeight) || 0;
    const _0x8063d2 = _0x4a7d3e.getBoundingClientRect?.() || {
      top: 0,
      left: 0,
      right: _0x1e7937,
      bottom: _0x15716b
    };
    return {
      left: Math.max(_0xeab03d, (Number(_0x8063d2.left) || 0) + _0xeab03d),
      top: Math.max(_0xeab03d, (Number(_0x8063d2.top) || 0) + _0xeab03d),
      right: Math.min(_0x1e7937 - _0xeab03d, Number(_0x8063d2.right) || _0x1e7937 - _0xeab03d),
      bottom: Math.min(_0x15716b - _0xeab03d, Number(_0x8063d2.bottom) || _0x15716b - _0xeab03d)
    };
  };
  const _0x1cd4dd = () => {
    _0x554f5a = 0;
    const _0x7301cd = _0x4027e2?.popup;
    const _0x108157 = _0x4027e2?.trigger || _0x4027e2?.fieldEl;
    if (!_0x7301cd?.isConnected || !_0x108157?.isConnected) {
      return;
    }
    const _0x2f667e = _0x108157.getBoundingClientRect?.();
    if (!_0x2f667e) {
      return;
    }
    const _0x25a3ba = _0x5d2b81();
    const _0x5e53ca = Number(_0x2f667e.width) || Math.max(0, (Number(_0x2f667e.right) || 0) - (Number(_0x2f667e.left) || 0));
    if (_0x4027e2?.preservesAnchorWidth && _0x5e53ca > 0) {
      const _0x137329 = Math.max(0, _0x25a3ba.right - _0x25a3ba.left);
      const _0x5e1fdd = Math.min(Math.ceil(_0x5e53ca), Math.floor(_0x137329));
      if (_0x5e1fdd > 0) {
        _0x7301cd.style?.setProperty?.("min-width", _0x5e1fdd + "px");
      }
    }
    const _0x4c4a96 = _0x7301cd.getBoundingClientRect?.();
    if (!_0x4c4a96 || _0x4c4a96.width <= 0) {
      return;
    }
    const _0x10b3b4 = Math.max(80, _0x25a3ba.bottom - _0x25a3ba.top);
    const _0x6d88fe = Math.min(_0x4c4a96.height || _0x7301cd.scrollHeight || _0x10b3b4, _0x10b3b4);
    const _0x4923c1 = _0x4027e2?.ownerProxy?.classList?.contains?.("ui-schema-pill-menu") ? 12 : _0x31e426;
    const _0x3a72d4 = Math.max(_0x25a3ba.left, _0x25a3ba.right - _0x4c4a96.width);
    const _0x412b9e = horizontalAlign === "start" ? _0x2f667e.left : horizontalAlign === "end" ? _0x2f667e.right - _0x4c4a96.width : _0x2f667e.left + (_0x5e53ca - _0x4c4a96.width) / 2;
    const _0x4d014a = Math.min(Math.max(_0x412b9e, _0x25a3ba.left), _0x3a72d4);
    const _0x2348cc = Math.max(_0x25a3ba.top, _0x25a3ba.bottom - _0x6d88fe);
    const _0x55d75c = _0x2f667e.top - _0x4923c1 - _0x6d88fe;
    const _0x194394 = _0x2f667e.bottom + _0x4923c1;
    const _0x5900d7 = _0x55d75c >= _0x25a3ba.top ? Math.min(_0x55d75c, _0x2348cc) : Math.min(Math.max(_0x194394, _0x25a3ba.top), _0x2348cc);
    _0x7301cd.style?.setProperty?.("position", "fixed");
    _0x7301cd.style?.setProperty?.("left", _0x4d014a + "px");
    _0x7301cd.style?.setProperty?.("top", _0x5900d7 + "px");
    _0x7301cd.style?.setProperty?.("right", "auto");
    _0x7301cd.style?.setProperty?.("bottom", "auto");
    _0x7301cd.style?.setProperty?.("transform", "none");
    _0x7301cd.style?.setProperty?.("max-height", Math.floor(_0x10b3b4) + "px");
    _0x7301cd.style?.setProperty?.("overflow-x", "hidden");
    _0x7301cd.style?.setProperty?.("overflow-y", "auto");
  };
  const _0x3f3b1d = () => {
    if (!_0x4027e2) {
      return;
    }
    _0x2baf44();
    const _0x48dcd1 = windowObject?.requestAnimationFrame?.bind?.(windowObject) || (_0x1db792 => windowObject?.setTimeout?.(_0x1db792, 0));
    _0x554f5a = _0x48dcd1(_0x1cd4dd);
  };
  const _0x426b4e = _0x57d5ef => {
    const _0x403b68 = windowObject?.CustomEvent || globalThis.CustomEvent;
    if (typeof _0x403b68 !== "function" || !_0x4027e2) {
      return;
    }
    _0xd6ecc5.dispatchEvent?.(new _0x403b68("ui-schema-portaled-interaction", {
      detail: {
        fieldEl: _0x4027e2.fieldEl,
        nativeEvent: _0x57d5ef,
        popup: _0x4027e2.popup
      }
    }));
  };
  const _0x1da181 = _0x58b6e2 => _0x58b6e2.stopPropagation();
  const _0x4af350 = () => {
    _0x2baf44();
    if (!_0x4027e2) {
      return;
    }
    const {
      popup: _0x1db2d9,
      fieldEl: _0x76851c,
      originalParent: _0x111e6e,
      originalNextSibling: _0x3fded1,
      originalStyles: _0x2fc699,
      ownerProxy: _0x375204
    } = _0x4027e2;
    _0x53a247.forEach(_0x425ad2 => {
      _0x1db2d9.removeEventListener?.(_0x425ad2, _0x426b4e, true);
    });
    _0x1db2d9.removeEventListener?.("wheel", _0x1da181);
    _0x1db2d9.classList?.remove?.(portalClass);
    if (_0x1db2d9.__uiSchemaPortalRoot === _0xd6ecc5) {
      delete _0x1db2d9.__uiSchemaPortalRoot;
    }
    if (_0x76851c?.__uiSchemaPortaledPopup === _0x1db2d9) {
      delete _0x76851c.__uiSchemaPortaledPopup;
    }
    _0x2fc699.forEach((_0x3ba170, _0x55b075) => {
      if (_0x3ba170) {
        _0x1db2d9.style?.setProperty?.(_0x55b075, _0x3ba170);
      } else {
        _0x1db2d9.style?.removeProperty?.(_0x55b075);
      }
    });
    if (_0x111e6e?.isConnected) {
      const _0xadb43 = _0x3fded1?.parentNode === _0x111e6e ? _0x3fded1 : null;
      _0x111e6e.insertBefore(_0x1db2d9, _0xadb43);
    }
    _0x375204?.remove?.();
    _0x4027e2 = null;
  };
  const _0xf597a9 = () => {
    const _0x27ce7b = _0x4027e2?.popup;
    const _0x330f6f = _0x4027e2?.trigger;
    if (_0x27ce7b) {
      _0x27ce7b.classList?.remove?.("show", "is-closing");
      _0x27ce7b.setAttribute?.("aria-hidden", "true");
      if (_0x27ce7b.classList?.contains?.("floating-menu")) {
        _0x27ce7b.style?.setProperty?.("display", "");
      } else {
        _0x27ce7b.style?.setProperty?.("display", "none");
      }
    }
    _0x330f6f?.setAttribute?.("aria-expanded", "false");
    _0x4af350();
  };
  const _0x133674 = ({
    popup: _0xe7b40c,
    fieldEl: _0x2329f9
  }) => {
    const _0x56554c = _0x2329f9?.querySelector?.("[data-ui-schema-menu-trigger]") || _0x2329f9;
    const _0x3667e8 = _0xe7b40c.parentElement || _0x2329f9;
    const _0x27bc4f = String(_0x3667e8?.className || "").split(/\s+/u);
    const _0x1c0780 = _0x3667e8?.classList?.contains?.("ui-schema-advanced-dropdown") || _0x27bc4f.includes("ui-schema-advanced-dropdown");
    const _0x119704 = new Map(_0x11f165.map(_0x361c61 => [_0x361c61, _0xe7b40c.style?.getPropertyValue?.(_0x361c61) || ""]));
    const _0x54073 = documentObject?.createElement?.("div") || null;
    if (_0x54073) {
      _0x54073.className = [String(_0x3667e8?.className || "").trim(), String(_0x2329f9?.className || "").trim(), "aigen-ui-schema-owner-proxy", contextClass].filter(Boolean).join(" ");
    }
    _0x4027e2 = {
      popup: _0xe7b40c,
      fieldEl: _0x2329f9,
      trigger: _0x56554c,
      originalParent: _0xe7b40c.parentNode,
      originalNextSibling: _0xe7b40c.nextSibling,
      originalStyles: _0x119704,
      ownerProxy: _0x54073,
      preservesAnchorWidth: _0x1c0780
    };
    _0x2329f9.__uiSchemaPortaledPopup = _0xe7b40c;
    _0xe7b40c.__uiSchemaPortalRoot = _0xd6ecc5;
    _0x56554c?.setAttribute?.("aria-expanded", "true");
    _0x4a7d3e.appendChild(_0x54073 || _0xe7b40c);
    _0x54073?.appendChild?.(_0xe7b40c);
    _0xe7b40c.classList?.add?.(portalClass);
    _0x53a247.forEach(_0x18e316 => {
      _0xe7b40c.addEventListener?.(_0x18e316, _0x426b4e, true);
    });
    _0xe7b40c.addEventListener?.("wheel", _0x1da181, {
      passive: true
    });
    _0x3f3b1d();
  };
  const _0x16e60a = _0x5256a9 => {
    const _0x30263d = _0x5256a9?.detail?.popup || null;
    const _0x28f070 = _0x5256a9?.detail?.fieldEl || null;
    if (!_0x30263d || !_0x28f070) {
      return;
    }
    const _0x1ad346 = _0xd6ecc5.contains?.(_0x28f070) || _0x30263d.__uiSchemaPortalRoot === _0xd6ecc5;
    if (!_0x1ad346) {
      return;
    }
    if (!_0x5256a9.detail?.shouldOpen) {
      if (_0x30263d === _0x4027e2?.popup) {
        _0x4af350();
      }
      return;
    }
    if (_0x4027e2?.popup !== _0x30263d) {
      _0x4af350();
    }
    if (!_0x4027e2) {
      _0x133674({
        popup: _0x30263d,
        fieldEl: _0x28f070
      });
    }
    _0x3f3b1d();
  };
  const _0x495e71 = _0x5b64a9 => {
    if (!_0x4027e2 || _0x5b64a9?.detail?.popup !== _0x4027e2.popup) {
      return;
    }
    _0x2baf44();
    _0x1cd4dd();
  };
  const _0x24253f = _0x4fb213 => {
    if (!_0x4fb213?.detail?.popup || _0x4fb213.detail.popup === _0x4027e2?.popup) {
      _0xf597a9();
    }
  };
  _0xd6ecc5.addEventListener?.("ui-schema-menu-before-open", _0x16e60a);
  _0xd6ecc5.addEventListener?.("ui-schema-menu-after-open", _0x495e71);
  _0xd6ecc5.addEventListener?.("ui-schema-portaled-close-request", _0x24253f);
  documentObject?.addEventListener?.("scroll", _0x3f3b1d, true);
  windowObject?.addEventListener?.("resize", _0x3f3b1d);
  return {
    close: _0xf597a9,
    contains: _0x14c69b => _0x4027e2?.popup?.contains?.(_0x14c69b) === true,
    destroy() {
      _0xf597a9();
      _0xd6ecc5.removeEventListener?.("ui-schema-menu-before-open", _0x16e60a);
      _0xd6ecc5.removeEventListener?.("ui-schema-menu-after-open", _0x495e71);
      _0xd6ecc5.removeEventListener?.("ui-schema-portaled-close-request", _0x24253f);
      documentObject?.removeEventListener?.("scroll", _0x3f3b1d, true);
      windowObject?.removeEventListener?.("resize", _0x3f3b1d);
    }
  };
}
export function bindNodeModelMenuTrigger({
  root: _0xaee22b,
  trigger: _0x214047,
  menu: _0x35f033,
  closeOthers: _0x1d1488,
  activateMenuKeyboard: _0x534bfc
} = {}) {
  if (!_0xaee22b || !_0x214047 || !_0x35f033) {
    return () => {};
  }
  const _0x3826bb = _0x2d988c => {
    _0x2d988c.stopPropagation();
    const _0x5f5c57 = !_0x35f033.classList.contains("show");
    if (typeof _0x1d1488 === "function") {
      _0x1d1488(_0x35f033);
    } else {
      closeNodeFooterMenus(_0xaee22b, _0x35f033);
    }
    _0x35f033.classList.toggle("show", _0x5f5c57);
    if (_0x5f5c57 && typeof _0x534bfc === "function") {
      _0x534bfc(_0x35f033);
    }
  };
  _0x214047.addEventListener("click", _0x3826bb);
  return () => _0x214047.removeEventListener("click", _0x3826bb);
}
export function bindNodeSubmenus(_0xf28d63, {
  delay = 120
} = {}) {
  if (!_0xf28d63) {
    return () => {};
  }
  const _0x5ec856 = [];
  const _0x3a4c77 = new Map();
  const _0x222fdb = _0xf28d63.querySelectorAll("[data-node-menu-submenu]");
  _0x222fdb.forEach(_0x52cde4 => {
    const _0x44214b = _0x52cde4.dataset.nodeMenuSubmenu || "";
    const _0x397a6a = _0x44214b ? _0xf28d63.querySelector(_0x44214b) : null;
    if (!_0x397a6a) {
      return;
    }
    const _0x1ef40d = () => {
      clearTimeout(_0x3a4c77.get(_0x397a6a));
      positionNodeSubmenu(_0x52cde4, _0x397a6a);
    };
    const _0x2e4463 = () => {
      clearTimeout(_0x3a4c77.get(_0x397a6a));
      _0x3a4c77.set(_0x397a6a, setTimeout(() => {
        hidePopup(_0x397a6a);
        _0x3a4c77.delete(_0x397a6a);
      }, delay));
    };
    _0x52cde4.addEventListener("mouseenter", _0x1ef40d);
    _0x52cde4.addEventListener("mouseleave", _0x2e4463);
    _0x52cde4.addEventListener("click", _0x1ef40d);
    _0x397a6a.addEventListener("mouseenter", _0x1ef40d);
    _0x397a6a.addEventListener("mouseleave", _0x2e4463);
    _0x5ec856.push(() => {
      clearTimeout(_0x3a4c77.get(_0x397a6a));
      _0x52cde4.removeEventListener("mouseenter", _0x1ef40d);
      _0x52cde4.removeEventListener("mouseleave", _0x2e4463);
      _0x52cde4.removeEventListener("click", _0x1ef40d);
      _0x397a6a.removeEventListener("mouseenter", _0x1ef40d);
      _0x397a6a.removeEventListener("mouseleave", _0x2e4463);
    });
  });
  return () => _0x5ec856.forEach(_0x3c08ba => _0x3c08ba());
}
export function bindNodeFooterController(_0x4d0a02, _0x30a73b = {}) {
  if (!_0x4d0a02) {
    return () => {};
  }
  const _0x21c7ef = [];
  _0x21c7ef.push(bindNodeSubmenus(_0x4d0a02));
  const _0x6c8b35 = _0x15aa0e => {
    const _0x1c18a2 = _0x15aa0e?.detail?.fieldEl || null;
    closeNodeFooterMenus(_0x4d0a02, null, {
      preserveAdvPanel: _0x1c18a2
    });
  };
  _0x4d0a02.addEventListener("ui-schema-menu-before-open", _0x6c8b35);
  _0x21c7ef.push(() => _0x4d0a02.removeEventListener("ui-schema-menu-before-open", _0x6c8b35));
  const _0xef9932 = _0x2e8b7e => {
    const _0x140427 = _0x2e8b7e.target?.closest?.(".ui-schema-floating-menu, .floating-menu");
    if (_0x140427 && _0x4d0a02.contains(_0x140427)) {
      _0x2e8b7e.stopPropagation();
    }
  };
  _0x4d0a02.addEventListener("wheel", _0xef9932, {
    passive: true
  });
  _0x21c7ef.push(() => _0x4d0a02.removeEventListener("wheel", _0xef9932));
  const _0x522c1e = _0x49c23c => {
    if (_0x4d0a02.contains(_0x49c23c.target)) {
      return;
    }
    closeNodeFooterMenus(_0x4d0a02);
    if (typeof _0x30a73b.onOutsideClose === "function") {
      _0x30a73b.onOutsideClose();
    }
  };
  document?.addEventListener?.("click", _0x522c1e);
  _0x21c7ef.push(() => document?.removeEventListener?.("click", _0x522c1e));
  return () => _0x21c7ef.forEach(_0x3009b8 => _0x3009b8());
}