import { positionAnchoredSubmenu } from "../../utils/submenuPosition.js";
let activeContextMenuSession = null;
export function removeContextMenus({
  includeNodePicker = true
} = {}) {
  const _0x420584 = activeContextMenuSession;
  activeContextMenuSession = null;
  _0x420584?.close?.({
    restoreFocus: false
  });
  document.querySelectorAll(".v2-canvas-ctx-menu").forEach(_0x481b74 => _0x481b74.remove());
  if (includeNodePicker) {
    document.querySelector(".v2-node-picker")?.remove();
  }
}
function placeMenu(_0x28e95c, _0x6283be, _0x2e88e3, _0x52c7bc = 0) {
  document.body.appendChild(_0x28e95c);
  const _0x19863f = Math.max(0, Number(_0x52c7bc) || 0) + 8;
  const _0x4cdc1e = Math.max(120, window.innerHeight - _0x19863f - 8);
  _0x28e95c.style.maxHeight = _0x4cdc1e + "px";
  _0x28e95c.style.overflowY = "auto";
  _0x28e95c.style.overscrollBehavior = "contain";
  const _0x255d5c = _0x28e95c.offsetWidth || 240;
  const _0x3517c2 = Math.min(_0x28e95c.offsetHeight || 200, _0x4cdc1e);
  const _0x5c4925 = _0x6283be + _0x255d5c > window.innerWidth ? _0x6283be - _0x255d5c : _0x6283be;
  const _0x5ecbb0 = Math.min(Math.max(8, _0x5c4925), Math.max(8, window.innerWidth - _0x255d5c - 8));
  const _0x415488 = _0x2e88e3 + _0x3517c2 > window.innerHeight ? _0x2e88e3 - _0x3517c2 : _0x2e88e3;
  const _0x59a0d6 = Math.max(_0x19863f, window.innerHeight - _0x3517c2 - 8);
  const _0x252f0f = Math.min(Math.max(_0x415488, _0x19863f), _0x59a0d6);
  _0x28e95c.style.left = _0x5ecbb0 + "px";
  _0x28e95c.style.top = _0x252f0f + "px";
}
function placeSubmenu(_0x4f91b7, _0x867307, _0x1905d4 = 0) {
  const _0x59be89 = _0x867307.getBoundingClientRect();
  positionAnchoredSubmenu({
    submenu: _0x4f91b7,
    anchorRect: _0x59be89,
    preferredSide: "right",
    position: "fixed",
    gap: 4,
    viewportMargin: 8,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    viewportTop: Math.max(0, Number(_0x1905d4) || 0),
    submenuWidth: _0x4f91b7.offsetWidth || 214
  });
}
function installMenuWheelContainment(_0x2e589b) {
  _0x2e589b.addEventListener("wheel", _0x3aad5e => {
    const _0x3b1e47 = Math.max(0, Number(_0x2e589b.clientHeight) || 0);
    const _0x155fca = Math.max(0, (Number(_0x2e589b.scrollHeight) || 0) - _0x3b1e47);
    if (_0x155fca <= 0) {
      return;
    }
    const _0x136acd = _0x3aad5e.deltaMode === 1 ? 16 : _0x3aad5e.deltaMode === 2 ? Math.max(1, _0x3b1e47) : 1;
    const _0x212201 = (Number(_0x3aad5e.deltaY) || 0) * _0x136acd;
    if (!_0x212201) {
      return;
    }
    _0x2e589b.scrollTop = Math.min(_0x155fca, Math.max(0, (Number(_0x2e589b.scrollTop) || 0) + _0x212201));
    _0x3aad5e.preventDefault?.();
    _0x3aad5e.stopPropagation?.();
  }, {
    passive: false
  });
}
function installMenuContextBoundary(_0x39ea91) {
  _0x39ea91.addEventListener("contextmenu", _0x5e00ac => {
    _0x5e00ac.preventDefault?.();
    _0x5e00ac.stopPropagation?.();
  });
}
function createSeparator(_0x994e23) {
  const _0x186556 = document.createElement("div");
  _0x186556.className = "v2-menu-sep";
  _0x186556.setAttribute("role", "separator");
  _0x186556.addEventListener("mouseenter", _0x994e23);
  return _0x186556;
}
function createMenuRow(_0xae2328, {
  onActivate: _0x4a060b,
  onEnter: _0x5b4b72,
  onKeyDown: _0xcad912
}) {
  const _0x2e94d8 = Array.isArray(_0xae2328.subItems) && _0xae2328.subItems.length > 0;
  const _0x2a6768 = !!_0xae2328.kbd;
  const _0x57900a = _0xae2328.disabled === true;
  const _0x57069b = typeof _0xae2328.checked === "boolean";
  const _0x40da83 = String(_0xae2328.desc || _0xae2328.subtitle || "").trim();
  const _0x323165 = document.createElement("div");
  _0x323165.className = ["v2-menu-row", _0x2a6768 || _0x2e94d8 ? "v2-menu-row-split" : "", _0x40da83 ? "has-desc" : "", _0x57900a ? "is-disabled" : "", _0xae2328.danger === true ? "is-danger" : "", _0x57069b && _0xae2328.checked ? "is-checked" : ""].filter(Boolean).join(" ");
  _0x323165.dataset.menuItem = "1";
  _0x323165.tabIndex = -1;
  _0x323165.setAttribute("role", _0x57069b ? "menuitemcheckbox" : "menuitem");
  _0x323165.setAttribute("aria-disabled", _0x57900a ? "true" : "false");
  if (_0x57069b) {
    _0x323165.setAttribute("aria-checked", _0xae2328.checked ? "true" : "false");
  }
  if (_0x2e94d8) {
    _0x323165.setAttribute("aria-haspopup", "menu");
    _0x323165.setAttribute("aria-expanded", "false");
  }
  const _0xa013ac = document.createElement("span");
  _0xa013ac.className = [_0x2e94d8 ? "v2-menu-rowlabel" : "", _0x40da83 ? "v2-menu-lbl" : ""].filter(Boolean).join(" ");
  _0xa013ac.textContent = _0xae2328.label || "";
  if (_0x57069b) {
    const _0x2ca337 = document.createElement("span");
    _0x2ca337.className = "v2-menu-checkmark";
    _0x2ca337.setAttribute("aria-hidden", "true");
    _0x2ca337.textContent = _0xae2328.checked ? "✓" : "";
    _0x323165.appendChild(_0x2ca337);
  }
  if (_0xae2328.iconEl?.cloneNode) {
    const _0x53c58b = document.createElement("span");
    _0x53c58b.className = "v2-menu-leading-icon";
    _0x53c58b.setAttribute("aria-hidden", "true");
    _0x53c58b.appendChild(_0xae2328.iconEl.cloneNode(true));
    _0x323165.appendChild(_0x53c58b);
  }
  if (_0xae2328.badge) {
    const _0x2d3bc8 = document.createElement("span");
    _0x2d3bc8.textContent = _0xae2328.badge;
    _0x2d3bc8.className = "v2-badge-beta";
    _0xa013ac.appendChild(_0x2d3bc8);
  }
  if (_0x40da83) {
    const _0x41ae8e = document.createElement("span");
    _0x41ae8e.className = "v2-menu-txt-wrap";
    const _0x3a11f6 = document.createElement("span");
    _0x3a11f6.className = "v2-menu-sub";
    _0x3a11f6.textContent = _0x40da83;
    _0x41ae8e.appendChild(_0xa013ac);
    _0x41ae8e.appendChild(_0x3a11f6);
    _0x323165.appendChild(_0x41ae8e);
  } else {
    _0x323165.appendChild(_0xa013ac);
  }
  if (_0x2e94d8) {
    const _0x2ebe2e = document.createElement("span");
    _0x2ebe2e.textContent = "▶";
    _0x2ebe2e.className = "v2-menu-arrow v2-menu-arrow-ml8";
    _0x323165.appendChild(_0x2ebe2e);
  } else if (_0x2a6768) {
    const _0x3af876 = document.createElement("span");
    _0x3af876.className = "v2-menu-kbd";
    _0x3af876.textContent = _0xae2328.kbd;
    _0x323165.appendChild(_0x3af876);
  }
  _0x323165.addEventListener("mouseenter", () => _0x5b4b72(_0x323165, _0xae2328));
  _0x323165.addEventListener("keydown", _0x57d84d => _0xcad912(_0x323165, _0xae2328, _0x57d84d));
  if (!_0x2e94d8) {
    _0x323165.addEventListener("pointerdown", _0x65f843 => {
      _0x65f843.preventDefault?.();
      _0x65f843.stopPropagation();
      if (_0x65f843.button !== undefined && _0x65f843.button !== 0) {
        return;
      }
      if (_0x57900a) {
        return;
      }
      _0x4a060b(_0xae2328, _0x65f843);
    });
  }
  return _0x323165;
}
function markSidebarSubmenuOwner(_0xeac27a, _0x4462c3) {
  const _0x49d8b4 = String(_0x4462c3 || "").trim();
  if (_0x49d8b4) {
    _0xeac27a.dataset.sidebarSubmenuOwner = _0x49d8b4;
  }
}
export function showContextMenu(_0x3f2b2c, _0x506351, _0x4028ce, _0x43333d = {}) {
  const _0x2d34a7 = _0x43333d.restoreTarget || activeContextMenuSession?.restoreTarget || document.activeElement || null;
  removeContextMenus({
    includeNodePicker: _0x43333d.includeNodePicker !== false
  });
  const _0x3f1fd0 = document.createElement("div");
  const _0x3923d6 = _0x43333d.ownerElement;
  _0x3f1fd0.className = _0x43333d.className || "v2-canvas-ctx-menu";
  _0x3f1fd0.setAttribute("role", "menu");
  if (_0x43333d.ariaLabel) {
    _0x3f1fd0.setAttribute("aria-label", _0x43333d.ariaLabel);
  }
  markSidebarSubmenuOwner(_0x3f1fd0, _0x43333d.sidebarSubmenuOwner);
  const _0x236cc0 = [];
  const _0x3e4ce0 = Math.max(0, Number(_0x43333d.viewportTop) || 0);
  const _0x53ac21 = 180;
  let _0x30e09b = null;
  let _0x2ca777 = false;
  let _0x593033 = null;
  let _0x54611e = false;
  const _0x191efa = () => {
    if (_0x30e09b === null) {
      return;
    }
    clearTimeout(_0x30e09b);
    _0x30e09b = null;
  };
  const _0xc0d76f = (_0x2f81e2 = 0) => {
    _0x191efa();
    for (let _0x33215d = _0x236cc0.length - 1; _0x33215d >= _0x2f81e2; _0x33215d--) {
      _0x236cc0[_0x33215d]?.__contextMenuAnchor?.setAttribute?.("aria-expanded", "false");
      _0x236cc0[_0x33215d]?.remove();
    }
    _0x236cc0.splice(_0x2f81e2);
  };
  const _0x2edad2 = (_0x48264b = 0) => {
    _0x191efa();
    _0x30e09b = setTimeout(() => {
      _0x30e09b = null;
      _0xc0d76f(_0x48264b);
    }, _0x53ac21);
  };
  const _0x10d576 = _0x2c3f7a => !!_0x2c3f7a && (_0x3f1fd0.contains(_0x2c3f7a) || _0x236cc0.some(_0x1216e6 => _0x1216e6?.contains(_0x2c3f7a)));
  const _0x4168c0 = ({
    restoreFocus = true
  } = {}) => {
    if (_0x54611e) {
      return;
    }
    _0x54611e = true;
    _0x191efa();
    _0xc0d76f(0);
    _0x3f1fd0.remove();
    _0x593033?.disconnect?.();
    _0x593033 = null;
    if (_0x2ca777) {
      document.removeEventListener("pointerdown", _0x2e3f7b, true);
      _0x2ca777 = false;
    }
    if (activeContextMenuSession === _0xfdec66) {
      activeContextMenuSession = null;
    }
    if (restoreFocus && _0x2d34a7?.focus && _0x2d34a7?.isConnected !== false) {
      _0x2d34a7.focus();
    }
    _0x43333d.onClose?.();
  };
  const _0xa38676 = _0x211dd0 => Array.from(_0x211dd0?.children || []).filter(_0x547952 => _0x547952?.dataset?.menuItem === "1" && _0x547952.getAttribute?.("aria-disabled") !== "true");
  const _0x580df8 = _0x225506 => _0xa38676(_0x225506)[0]?.focus?.();
  const _0x3c0691 = (_0x5232be, _0xb94981, _0x16f870) => {
    const _0x11d22e = _0xa38676(_0x5232be);
    if (_0x11d22e.length === 0) {
      return;
    }
    const _0x1c1af2 = Math.max(0, _0x11d22e.indexOf(_0xb94981));
    const _0x55e052 = (_0x1c1af2 + _0x16f870 + _0x11d22e.length) % _0x11d22e.length;
    _0x11d22e[_0x55e052]?.focus?.();
  };
  const _0x3f65f1 = (_0x50d986, _0x5a5ba2) => {
    if (_0x54611e || _0x50d986?.disabled === true) {
      return;
    }
    _0x4168c0();
    _0x50d986?.action?.(_0x5a5ba2);
  };
  const _0x48f318 = ({
    panel: _0x4c4bab,
    parentRow = null,
    level = null,
    row: _0x14754a,
    item: _0x95e4bc,
    event: _0x58c473,
    openSubmenu: _0x193897
  }) => {
    const _0xb86753 = String(_0x58c473.key || "");
    if (_0xb86753 === "ArrowDown" || _0xb86753 === "ArrowUp") {
      _0x58c473.preventDefault?.();
      _0x3c0691(_0x4c4bab, _0x14754a, _0xb86753 === "ArrowDown" ? 1 : -1);
      return;
    }
    if (_0xb86753 === "Home" || _0xb86753 === "End") {
      _0x58c473.preventDefault?.();
      const _0x8beceb = _0xa38676(_0x4c4bab);
      _0x8beceb[_0xb86753 === "Home" ? 0 : _0x8beceb.length - 1]?.focus?.();
      return;
    }
    if (_0xb86753 === "Escape") {
      _0x58c473.preventDefault?.();
      _0x58c473.stopPropagation?.();
      _0x4168c0();
      return;
    }
    if (_0xb86753 === "ArrowLeft" && parentRow && level !== null) {
      _0x58c473.preventDefault?.();
      _0xc0d76f(level);
      parentRow.focus?.();
      return;
    }
    const _0x4e5cc1 = Array.isArray(_0x95e4bc?.subItems) && _0x95e4bc.subItems.length > 0;
    if (_0xb86753 === "ArrowRight" && _0x4e5cc1 && _0x95e4bc.disabled !== true) {
      _0x58c473.preventDefault?.();
      const _0x1f96f5 = _0x193897?.();
      _0x580df8(_0x1f96f5);
      return;
    }
    if ((_0xb86753 === "Enter" || _0xb86753 === " ") && _0x95e4bc.disabled !== true) {
      _0x58c473.preventDefault?.();
      _0x58c473.stopPropagation?.();
      if (_0x4e5cc1) {
        const _0x2cfc03 = _0x193897?.();
        _0x580df8(_0x2cfc03);
      } else {
        _0x3f65f1(_0x95e4bc, _0x58c473);
      }
    }
  };
  const _0x5bcf39 = (_0x531e8c, _0xf81889, _0x128375) => {
    _0xc0d76f(_0x128375);
    const _0x2893f0 = document.createElement("div");
    _0x2893f0.className = "v2-canvas-ctx-menu v2-submenu";
    _0x2893f0.setAttribute("role", "menu");
    installMenuContextBoundary(_0x2893f0);
    installMenuWheelContainment(_0x2893f0);
    _0x2893f0.__contextMenuAnchor = _0xf81889;
    _0xf81889?.setAttribute?.("aria-expanded", "true");
    markSidebarSubmenuOwner(_0x2893f0, _0x43333d.sidebarSubmenuOwner);
    _0x2893f0.addEventListener("mouseenter", _0x191efa);
    _0x531e8c.forEach(_0x36e987 => {
      if (_0x36e987 === "sep" || _0x36e987?.type === "separator") {
        _0x2893f0.appendChild(createSeparator(() => _0xc0d76f(_0x128375 + 1)));
        return;
      }
      _0x2893f0.appendChild(createMenuRow(_0x36e987, {
        onEnter: (_0x3bdb70, _0x5a1db5) => {
          if (_0x5a1db5.disabled !== true && Array.isArray(_0x5a1db5.subItems) && _0x5a1db5.subItems.length > 0) {
            _0x5bcf39(_0x5a1db5.subItems, _0x3bdb70, _0x128375 + 1);
          } else {
            _0xc0d76f(_0x128375 + 1);
          }
        },
        onActivate: _0x3f65f1,
        onKeyDown: (_0x384d5d, _0x3e2b40, _0x2bdcde) => _0x48f318({
          panel: _0x2893f0,
          parentRow: _0xf81889,
          level: _0x128375,
          row: _0x384d5d,
          item: _0x3e2b40,
          event: _0x2bdcde,
          openSubmenu: () => _0x5bcf39(_0x3e2b40.subItems, _0x384d5d, _0x128375 + 1)
        })
      }));
    });
    document.body.appendChild(_0x2893f0);
    _0x236cc0[_0x128375] = _0x2893f0;
    placeSubmenu(_0x2893f0, _0xf81889, _0x3e4ce0);
    return _0x2893f0;
  };
  _0x4028ce.forEach(_0x56e1ba => {
    if (_0x56e1ba === "sep" || _0x56e1ba?.type === "separator") {
      _0x3f1fd0.appendChild(createSeparator(() => _0xc0d76f(0)));
      return;
    }
    _0x3f1fd0.appendChild(createMenuRow(_0x56e1ba, {
      onEnter: (_0x1db9db, _0x12f612) => {
        if (_0x12f612.disabled !== true && Array.isArray(_0x12f612.subItems) && _0x12f612.subItems.length > 0) {
          _0x5bcf39(_0x12f612.subItems, _0x1db9db, 0);
        } else {
          _0xc0d76f(0);
        }
      },
      onActivate: _0x3f65f1,
      onKeyDown: (_0x5827dd, _0x5a307e, _0x19c0ab) => _0x48f318({
        panel: _0x3f1fd0,
        row: _0x5827dd,
        item: _0x5a307e,
        event: _0x19c0ab,
        openSubmenu: () => _0x5bcf39(_0x5a307e.subItems, _0x5827dd, 0)
      })
    }));
  });
  _0x3f1fd0.addEventListener("mouseenter", _0x191efa);
  installMenuContextBoundary(_0x3f1fd0);
  installMenuWheelContainment(_0x3f1fd0);
  _0x3f1fd0.addEventListener("mouseleave", _0x12c913 => {
    if (!_0x10d576(_0x12c913.relatedTarget)) {
      _0x2edad2(0);
    }
  });
  placeMenu(_0x3f1fd0, _0x3f2b2c, _0x506351, _0x3e4ce0);
  const _0x2e3f7b = _0x555e3f => {
    const _0x25de8d = _0x3f1fd0.contains(_0x555e3f.target) || _0x236cc0.some(_0x2485e0 => _0x2485e0?.contains(_0x555e3f.target));
    const _0x4bb529 = _0x43333d.dismissOnOwnerPointerDown === false && (_0x555e3f.target === _0x3923d6 || _0x3923d6?.contains?.(_0x555e3f.target));
    if (!_0x25de8d && !_0x4bb529) {
      _0x4168c0();
    }
  };
  const _0xfdec66 = {
    menu: _0x3f1fd0,
    restoreTarget: _0x2d34a7,
    close: _0x4168c0
  };
  activeContextMenuSession = _0xfdec66;
  const _0x232da5 = _0x43333d.ownerRoot;
  const _0x4122a3 = _0x43333d.mutationObserver || _0x232da5?.ownerDocument?.defaultView?.MutationObserver || globalThis.MutationObserver;
  if (_0x232da5 && _0x3923d6 && typeof _0x4122a3 === "function") {
    _0x593033 = new _0x4122a3(() => {
      if (_0x3923d6.isConnected === false || _0x232da5.contains?.(_0x3923d6) === false) {
        _0x4168c0({
          restoreFocus: false
        });
      }
    });
    _0x593033.observe(_0x232da5, {
      childList: true,
      subtree: true
    });
  }
  requestAnimationFrame(() => {
    if (_0x54611e) {
      return;
    }
    document.addEventListener("pointerdown", _0x2e3f7b, true);
    _0x2ca777 = true;
    if (_0x43333d.autoFocus !== false) {
      _0x580df8(_0x3f1fd0);
    }
  });
  return {
    menu: _0x3f1fd0,
    close: _0xc6a62e => _0x4168c0(_0xc6a62e)
  };
}