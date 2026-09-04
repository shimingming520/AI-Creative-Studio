export const WORKSPACE_MARQUEE_DRAG_THRESHOLD = 5;
function normalizeCoordinate(_0x49cf2a) {
  const _0x185906 = Number(_0x49cf2a);
  if (Number.isFinite(_0x185906)) {
    return _0x185906;
  } else {
    return 0;
  }
}
function normalizeSelector(_0x46ada4) {
  return String(_0x46ada4 || "").trim();
}
function clamp(_0x155c8e, _0x29a303, _0x2edc09) {
  return Math.max(_0x29a303, Math.min(_0x2edc09, _0x155c8e));
}
export function hasWorkspaceMarqueeDrag(_0x1234e2, _0x345eed, _0xbe6d9c, _0x1cc108, _0x1bd911 = WORKSPACE_MARQUEE_DRAG_THRESHOLD) {
  const _0x3dd6f3 = normalizeCoordinate(_0xbe6d9c) - normalizeCoordinate(_0x1234e2);
  const _0x503543 = normalizeCoordinate(_0x1cc108) - normalizeCoordinate(_0x345eed);
  return Math.hypot(_0x3dd6f3, _0x503543) >= Math.max(0, normalizeCoordinate(_0x1bd911));
}
export function createWorkspaceMarqueeRect(_0x588ba9, _0x3ed6cc, _0x551970, _0x5790ee, _0x5b1b06 = null) {
  let _0x27ffba = normalizeCoordinate(_0x588ba9);
  let _0x28cfc0 = normalizeCoordinate(_0x3ed6cc);
  let _0x1d60ea = normalizeCoordinate(_0x551970);
  let _0x14e775 = normalizeCoordinate(_0x5790ee);
  if (_0x5b1b06) {
    const _0x34e708 = normalizeCoordinate(_0x5b1b06.left);
    const _0x2917ba = normalizeCoordinate(_0x5b1b06.top);
    const _0x2f0bcd = Math.max(_0x34e708, normalizeCoordinate(_0x5b1b06.right));
    const _0x1d1c5a = Math.max(_0x2917ba, normalizeCoordinate(_0x5b1b06.bottom));
    _0x27ffba = clamp(_0x27ffba, _0x34e708, _0x2f0bcd);
    _0x1d60ea = clamp(_0x1d60ea, _0x34e708, _0x2f0bcd);
    _0x28cfc0 = clamp(_0x28cfc0, _0x2917ba, _0x1d1c5a);
    _0x14e775 = clamp(_0x14e775, _0x2917ba, _0x1d1c5a);
  }
  const _0x5350c6 = Math.min(_0x27ffba, _0x1d60ea);
  const _0x4c4bfe = Math.min(_0x28cfc0, _0x14e775);
  const _0x5c2749 = Math.max(_0x27ffba, _0x1d60ea);
  const _0x5effb3 = Math.max(_0x28cfc0, _0x14e775);
  return {
    left: _0x5350c6,
    top: _0x4c4bfe,
    right: _0x5c2749,
    bottom: _0x5effb3,
    width: _0x5c2749 - _0x5350c6,
    height: _0x5effb3 - _0x4c4bfe
  };
}
export function doesWorkspaceMarqueeIntersect(_0x5080df, _0x408482) {
  if (!_0x5080df || !_0x408482) {
    return false;
  }
  return !(normalizeCoordinate(_0x408482.right) < normalizeCoordinate(_0x5080df.left)) && !(normalizeCoordinate(_0x408482.left) > normalizeCoordinate(_0x5080df.right)) && !(normalizeCoordinate(_0x408482.bottom) < normalizeCoordinate(_0x5080df.top)) && !(normalizeCoordinate(_0x408482.top) > normalizeCoordinate(_0x5080df.bottom));
}
export function resolveWorkspaceMarqueeSelection(_0x43229a = [], _0x339438 = [], {
  additive = false
} = {}) {
  const _0x16bfe8 = new Set(additive && Array.isArray(_0x339438) ? _0x339438.map(_0xea97f1 => String(_0xea97f1 ?? "").trim()).filter(Boolean) : []);
  (Array.isArray(_0x43229a) ? _0x43229a : []).map(_0x343b1f => String(_0x343b1f ?? "").trim()).filter(Boolean).forEach(_0x2aa2a4 => _0x16bfe8.add(_0x2aa2a4));
  return [..._0x16bfe8];
}
export function createWorkspaceMarqueeSelectionController({
  root: _0x5f45c9,
  documentObject: _0x150fcc,
  windowObject: _0x154619,
  getConfig: _0x41c86a,
  surfaceSelector: _0x28f24e,
  blockedControlSelector = "",
  overlayClassName = "",
  itemSelector: _0x713919,
  getItemId: _0x29386e,
  hitClassName = "is-marquee-hit",
  rootClassName = "is-marquee-selecting",
  dragThreshold = WORKSPACE_MARQUEE_DRAG_THRESHOLD,
  onActivate = null,
  onCommit = null
} = {}) {
  if (!_0x5f45c9 || !_0x150fcc || !_0x154619 || typeof _0x41c86a !== "function") {
    throw new Error("workspace marquee selection controller dependencies are incomplete");
  }
  const _0x113327 = normalizeSelector(_0x28f24e);
  const _0xd43435 = normalizeSelector(blockedControlSelector);
  const _0x4ba407 = normalizeSelector(overlayClassName);
  const _0x24171b = normalizeSelector(_0x713919);
  const _0xba4cdf = normalizeSelector(hitClassName);
  const _0x7baa08 = normalizeSelector(rootClassName);
  const _0xae91e1 = typeof _0x29386e === "function" ? _0x29386e : null;
  if (!_0x113327) {
    throw new Error("workspace marquee selection surfaceSelector is required");
  }
  if (!_0x24171b || !_0xae91e1) {
    throw new Error("workspace marquee selection itemSelector and getItemId are required");
  }
  let _0x519d52 = null;
  let _0x14fedd = false;
  const _0x25f2a1 = () => {
    const _0x152399 = typeof _0x5f45c9.querySelectorAll === "function" ? _0x5f45c9 : _0x519d52?.surface;
    const _0x297bcb = _0x519d52?.itemSelector || _0x24171b;
    const _0x275b15 = _0x519d52?.hitClassName || _0xba4cdf;
    if (_0x297bcb && _0x275b15) {
      _0x152399?.querySelectorAll?.(_0x297bcb).forEach(_0x558db7 => _0x558db7.classList.remove(_0x275b15));
    }
    _0x519d52?.overlay?.remove?.();
    const _0x56aeb7 = _0x519d52?.rootClassName || _0x7baa08;
    if (_0x56aeb7) {
      _0x5f45c9.classList.remove(_0x56aeb7);
    }
  };
  const _0x195ef3 = _0x2239b9 => {
    const _0x3f97e8 = _0x519d52;
    if (!_0x3f97e8 || _0x3f97e8.pointerId !== _0x2239b9.pointerId) {
      return false;
    }
    if (!_0x3f97e8.active && !hasWorkspaceMarqueeDrag(_0x3f97e8.startX, _0x3f97e8.startY, _0x2239b9.clientX, _0x2239b9.clientY, _0x3f97e8.dragThreshold)) {
      return false;
    }
    if (!_0x3f97e8.active) {
      _0x3f97e8.active = true;
      _0x3f97e8.overlay = _0x150fcc.createElement("div");
      _0x3f97e8.overlay.className = [_0x3f97e8.baseOverlayClassName, _0x3f97e8.overlayClassName].filter(Boolean).join(" ");
      _0x3f97e8.overlay.setAttribute("aria-hidden", "true");
      _0x5f45c9.appendChild(_0x3f97e8.overlay);
      if (_0x3f97e8.rootClassName) {
        _0x5f45c9.classList.add(_0x3f97e8.rootClassName);
      }
      onActivate?.();
      try {
        _0x5f45c9.setPointerCapture?.(_0x2239b9.pointerId);
      } catch {}
    }
    _0x2239b9.preventDefault();
    _0x2239b9.stopPropagation();
    const _0x4a53f5 = createWorkspaceMarqueeRect(_0x3f97e8.startX, _0x3f97e8.startY, _0x2239b9.clientX, _0x2239b9.clientY, _0x3f97e8.surface.getBoundingClientRect());
    Object.assign(_0x3f97e8.overlay.style, {
      left: _0x4a53f5.left + "px",
      top: _0x4a53f5.top + "px",
      width: _0x4a53f5.width + "px",
      height: _0x4a53f5.height + "px"
    });
    const _0x2cfd98 = [];
    _0x3f97e8.surface.querySelectorAll(_0x3f97e8.itemSelector).forEach(_0x28c0f2 => {
      const _0x309f29 = doesWorkspaceMarqueeIntersect(_0x4a53f5, _0x28c0f2.getBoundingClientRect());
      if (_0x3f97e8.hitClassName) {
        _0x28c0f2.classList.toggle(_0x3f97e8.hitClassName, _0x309f29);
      }
      if (_0x309f29) {
        _0x2cfd98.push(String(_0x3f97e8.getItemId(_0x28c0f2) || "").trim());
      }
    });
    _0x3f97e8.hitIds = _0x2cfd98.filter(Boolean);
    return true;
  };
  const _0x2020fd = (_0x5106d6, {
    cancelled = false
  } = {}) => {
    const _0x4f9822 = _0x519d52;
    if (!_0x4f9822 || _0x4f9822.pointerId !== _0x5106d6.pointerId) {
      return false;
    }
    if (_0x4f9822.active && !cancelled) {
      _0x195ef3(_0x5106d6);
    }
    const _0x38e69a = _0x4f9822.active && !cancelled;
    const _0x3d70f5 = _0x38e69a ? resolveWorkspaceMarqueeSelection(_0x4f9822.hitIds, _0x4f9822.initialSelectedIds, {
      additive: _0x4f9822.additive
    }) : [];
    _0x25f2a1();
    _0x519d52 = null;
    try {
      if (_0x5f45c9.hasPointerCapture?.(_0x5106d6.pointerId)) {
        _0x5f45c9.releasePointerCapture(_0x5106d6.pointerId);
      }
    } catch {}
    if (!_0x38e69a) {
      return false;
    }
    _0x5106d6.preventDefault();
    _0x5106d6.stopPropagation();
    _0x14fedd = true;
    _0x154619.setTimeout(() => {
      _0x14fedd = false;
    }, 0);
    _0x4f9822.commit(_0x3d70f5);
    onCommit?.(_0x3d70f5);
    return true;
  };
  const _0x5621bf = () => {
    const _0x10c67f = _0x519d52;
    _0x25f2a1();
    _0x519d52 = null;
    if (!_0x10c67f) {
      return false;
    }
    try {
      if (_0x5f45c9.hasPointerCapture?.(_0x10c67f.pointerId)) {
        _0x5f45c9.releasePointerCapture(_0x10c67f.pointerId);
      }
    } catch {}
    return true;
  };
  const _0xe37106 = _0x30455a => _0x195ef3(_0x30455a);
  const _0x4d9ce8 = _0x3d0e1a => _0x2020fd(_0x3d0e1a);
  const _0x377dbb = _0x1d35b3 => _0x2020fd(_0x1d35b3, {
    cancelled: true
  });
  _0x154619.addEventListener?.("pointermove", _0xe37106, true);
  _0x154619.addEventListener?.("pointerup", _0x4d9ce8, true);
  _0x154619.addEventListener?.("pointercancel", _0x377dbb, true);
  return {
    begin(_0x1ca45a) {
      if (_0x1ca45a.button !== 0 || _0x1ca45a.isPrimary === false || _0x1ca45a.pointerType && _0x1ca45a.pointerType !== "mouse") {
        return false;
      }
      const _0x1dd30c = _0x1ca45a.target.closest?.(_0x113327);
      if (!_0x1dd30c || !_0x5f45c9.contains(_0x1dd30c)) {
        return false;
      }
      const _0x4535f4 = _0x41c86a(_0x1dd30c);
      if (!_0x4535f4?.enabled || typeof _0x4535f4.commit !== "function" || _0x4535f4.canBegin?.(_0x1ca45a) === false) {
        return false;
      }
      const _0x1d558b = normalizeSelector(_0x4535f4.blockedControlSelector ?? _0xd43435);
      const _0x5deb59 = normalizeSelector(_0x4535f4.itemSelector || _0x24171b);
      const _0x5bdd13 = typeof _0x4535f4.getItemId === "function" ? _0x4535f4.getItemId : _0xae91e1;
      const _0x484dc5 = _0x1d558b ? _0x1ca45a.target.closest?.(_0x1d558b) : null;
      if (_0x484dc5 && !_0x484dc5.matches?.(_0x5deb59)) {
        return false;
      }
      _0x5621bf();
      _0x519d52 = {
        pointerId: _0x1ca45a.pointerId,
        startX: Number(_0x1ca45a.clientX) || 0,
        startY: Number(_0x1ca45a.clientY) || 0,
        additive: typeof _0x4535f4.additive === "boolean" ? _0x4535f4.additive : _0x1ca45a.shiftKey === true || _0x1ca45a.ctrlKey === true || _0x1ca45a.metaKey === true,
        initialSelectedIds: Array.isArray(_0x4535f4.selectedIds) ? [..._0x4535f4.selectedIds] : [],
        hitIds: [],
        active: false,
        overlay: null,
        baseOverlayClassName: _0x4ba407,
        overlayClassName: normalizeSelector(_0x4535f4.overlayClassName),
        itemSelector: _0x5deb59,
        hitClassName: normalizeSelector(_0x4535f4.hitClassName ?? _0xba4cdf),
        rootClassName: normalizeSelector(_0x4535f4.rootClassName ?? _0x7baa08),
        getItemId: _0x5bdd13,
        dragThreshold: Math.max(0, normalizeCoordinate(_0x4535f4.dragThreshold ?? dragThreshold)),
        surface: _0x1dd30c,
        commit: _0x4535f4.commit
      };
      return true;
    },
    update: _0x195ef3,
    finish: _0x2020fd,
    cancel: _0x5621bf,
    consumeClick(_0x456f0c) {
      if (!_0x14fedd) {
        return false;
      }
      _0x14fedd = false;
      _0x456f0c.preventDefault();
      _0x456f0c.stopPropagation();
      return true;
    },
    destroy() {
      _0x5621bf();
      _0x154619.removeEventListener?.("pointermove", _0xe37106, true);
      _0x154619.removeEventListener?.("pointerup", _0x4d9ce8, true);
      _0x154619.removeEventListener?.("pointercancel", _0x377dbb, true);
    }
  };
}