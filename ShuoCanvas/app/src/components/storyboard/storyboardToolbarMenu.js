function appendMenuIcon(_0x3a30c0, _0x49b53d, _0x553270) {
  const _0x2ebf95 = document.createElement("span");
  try {
    const _0xaf47fc = new DOMParser().parseFromString(_0x49b53d, "image/svg+xml");
    const _0xc37db1 = _0xaf47fc.documentElement;
    if (_0xc37db1 && _0xc37db1.tagName && _0xc37db1.tagName.toLowerCase() === "svg") {
      _0x2ebf95.appendChild(document.importNode(_0xc37db1, true));
    }
  } catch {}
  const _0xede0aa = document.createElement("span");
  _0xede0aa.textContent = _0x553270;
  _0x3a30c0.appendChild(_0x2ebf95);
  _0x3a30c0.appendChild(_0xede0aa);
}
export function createStoryboardFloatingMenu(_0x2b2f7f, _0x406ff8) {
  const _0x2dfac7 = document.createElement("div");
  _0x2dfac7.className = "v2-canvas-ctx-menu v2-sb-dropdown";
  _0x2b2f7f.forEach(_0x5ce745 => {
    const _0x435848 = document.createElement("div");
    _0x435848.className = "v2-menu-row";
    if (_0x5ce745.icon) {
      _0x435848.replaceChildren();
      appendMenuIcon(_0x435848, _0x5ce745.icon, _0x5ce745.label);
    } else {
      _0x435848.textContent = _0x5ce745.label;
    }
    _0x435848.addEventListener("pointerdown", _0xd027b6 => _0xd027b6.stopPropagation());
    _0x435848.addEventListener("dblclick", _0x34b664 => _0x34b664.stopPropagation());
    _0x435848.onclick = _0xa87142 => {
      _0xa87142.stopPropagation();
      _0x5ce745.action();
      _0x406ff8?.();
    };
    _0x2dfac7.appendChild(_0x435848);
  });
  return _0x2dfac7;
}
function positionFixedMenu(_0x1c6a4e, _0x34b93c) {
  const _0x117195 = _0x34b93c?.getBoundingClientRect?.() || {
    left: 0,
    top: 0,
    bottom: 0,
    width: 0
  };
  const _0x2878a5 = Number(_0x1c6a4e.offsetHeight) || 0;
  _0x1c6a4e.style.left = _0x117195.left + "px";
  _0x1c6a4e.style.top = _0x117195.top - _0x2878a5 - 8 + "px";
}
function resolveToolbarMenuSafeTop(_0x545f0b) {
  const _0x57e6f3 = document.getElementById?.("v2-server-disconnect-alert");
  if (!_0x57e6f3) {
    return _0x545f0b;
  }
  const _0x3654b7 = typeof window !== "undefined" && typeof window.getComputedStyle === "function" ? window.getComputedStyle(_0x57e6f3) : null;
  if (_0x3654b7?.display === "none" || _0x3654b7?.visibility === "hidden") {
    return _0x545f0b;
  }
  const _0x17be66 = _0x57e6f3.getBoundingClientRect?.();
  const _0x363693 = Number(_0x17be66?.height) || 0;
  const _0x2a5050 = Number(_0x17be66?.bottom) || 0;
  if (_0x363693 > 0) {
    return Math.max(_0x545f0b, _0x2a5050 + _0x545f0b);
  } else {
    return _0x545f0b;
  }
}
function positionToolbarMenu(_0x3ed89f, _0x1999a4, _0x2be305) {
  const _0x381f2b = Number(_0x3ed89f.offsetWidth) || 0;
  const _0x1e92db = Number(_0x3ed89f.offsetHeight) || 0;
  const _0x2aab16 = _0x2be305.getBoundingClientRect?.() || {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0
  };
  const _0x359067 = _0x1999a4.getBoundingClientRect?.() || _0x2aab16;
  const _0x307877 = (typeof window !== "undefined" ? Number(window.innerWidth) : 0) || Number(document.documentElement?.clientWidth) || 0;
  const _0x3502ef = (typeof window !== "undefined" ? Number(window.innerHeight) : 0) || Number(document.documentElement?.clientHeight) || 0;
  const _0x591aea = 8;
  let _0x4e79c4 = (Number(_0x1999a4.offsetLeft) || 0) + (Number(_0x1999a4.offsetWidth) || Number(_0x359067.width) || 0) / 2 - _0x381f2b / 2;
  if (_0x307877 > 0 && Number.isFinite(_0x2aab16.left)) {
    const _0x34c2d6 = _0x2aab16.left + _0x4e79c4;
    const _0x805bbf = _0x34c2d6 + _0x381f2b;
    if (_0x34c2d6 < _0x591aea) {
      _0x4e79c4 += _0x591aea - _0x34c2d6;
    } else if (_0x805bbf > _0x307877 - _0x591aea) {
      _0x4e79c4 -= _0x805bbf - (_0x307877 - _0x591aea);
    }
  }
  const _0x2c685e = resolveToolbarMenuSafeTop(_0x591aea);
  const _0x5965fa = Number(_0x2aab16.top) - _0x2c685e;
  const _0x5f03bd = _0x3502ef > 0 ? _0x3502ef - _0x591aea - Number(_0x2aab16.bottom) : Number.POSITIVE_INFINITY;
  const _0x81819e = _0x1e92db + _0x591aea;
  const _0x243d69 = _0x5965fa >= _0x81819e || _0x5f03bd < _0x81819e && _0x5965fa >= _0x5f03bd;
  _0x3ed89f.style.left = Math.max(0, Math.round(_0x4e79c4)) + "px";
  if (_0x243d69) {
    _0x3ed89f.style.top = "auto";
    _0x3ed89f.style.bottom = "calc(100% + 8px)";
  } else {
    _0x3ed89f.style.bottom = "auto";
    _0x3ed89f.style.top = "calc(100% + 8px)";
  }
}
export function mountStoryboardToolbarMenu(_0x2fe61a, _0x25c018) {
  const _0x1baf9c = _0x25c018?.closest?.(".storyboard-toolbar") || null;
  if (!_0x1baf9c) {
    document.body.appendChild(_0x2fe61a);
    positionFixedMenu(_0x2fe61a, _0x25c018);
    return _0x2fe61a;
  }
  _0x2fe61a.classList.add("storyboard-toolbar-menu");
  _0x1baf9c.appendChild(_0x2fe61a);
  positionToolbarMenu(_0x2fe61a, _0x25c018, _0x1baf9c);
  return _0x2fe61a;
}
export function closeStoryboardToolbarMenu({
  rootEl: _0x56d125,
  menuEl: _0x4f00ca,
  activeMenu: _0x184a49,
  isCustomGridEditing = false,
  dismissHandler = null,
  force = false
} = {}) {
  if (!force && _0x184a49 === "split-lines" && isCustomGridEditing) {
    return {
      menuEl: _0x4f00ca,
      activeMenu: _0x184a49,
      dismissHandler: dismissHandler,
      blocked: true
    };
  }
  _0x4f00ca?.__commitPending?.();
  _0x4f00ca?.remove?.();
  if (_0x184a49) {
    const _0x4e7b56 = _0x56d125?.querySelector?.(".act-" + _0x184a49);
    if (_0x4e7b56) {
      if (_0x184a49 !== "split-lines" || !isCustomGridEditing) {
        _0x4e7b56.classList.remove("active");
      }
      const _0x29a4fb = _0x4e7b56.querySelector(".ftb-chevron");
      if (_0x29a4fb) {
        _0x29a4fb.style.transform = "rotate(0deg)";
      }
    }
  }
  if (dismissHandler) {
    document.removeEventListener("pointerdown", dismissHandler);
  }
  return {
    menuEl: null,
    activeMenu: null,
    dismissHandler: null,
    blocked: false
  };
}