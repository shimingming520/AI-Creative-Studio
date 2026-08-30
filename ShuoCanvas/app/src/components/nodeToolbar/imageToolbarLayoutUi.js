import { t } from "../../i18n/index.js";
import { positionAnchoredSubmenu } from "../../utils/submenuPosition.js";
function imageToolbarText(_0x5bf2a4) {
  return t("nodeToolbar.image." + _0x5bf2a4);
}
const IMAGE_TOOLBAR_ZONE_MAP = Object.freeze({
  "outside-primary": "outsidePrimary",
  "outside-secondary": "outsideSecondary",
  more: "more"
});
function getToolbarZones(_0x58946a) {
  return {
    outsidePrimary: _0x58946a.querySelector("[data-zone=\"outside-primary\"]"),
    outsideSecondary: _0x58946a.querySelector("[data-zone=\"outside-secondary\"]"),
    more: _0x58946a.querySelector("[data-zone=\"more\"]")
  };
}
function collectToolbarActionButtons(_0x29dbb5, _0x223266) {
  const _0x237b05 = new Map();
  _0x29dbb5.querySelectorAll(".ftb-btn").forEach(_0x360a2f => {
    if (_0x360a2f.dataset.fixedToolbarButton === "1") {
      return;
    }
    const _0x1ffdaa = _0x223266(_0x360a2f);
    if (!_0x1ffdaa || _0x237b05.has(_0x1ffdaa)) {
      return;
    }
    _0x237b05.set(_0x1ffdaa, _0x360a2f);
  });
  return _0x237b05;
}
function applyToolbarLayoutToDom({
  toolbarEl: _0x44eb3f,
  layoutInput: _0x359817,
  imageToolbarActions: _0x382e63,
  normalizeImageToolbarLayout: _0x406b31,
  getToolbarActionFromButton: _0x454327
}) {
  const _0x1f77bd = getToolbarZones(_0x44eb3f);
  if (!_0x1f77bd.outsidePrimary || !_0x1f77bd.outsideSecondary || !_0x1f77bd.more) {
    return;
  }
  const _0x1d544c = _0x406b31(_0x359817);
  const _0x5a41ba = collectToolbarActionButtons(_0x44eb3f, _0x454327);
  const _0x5c50c9 = new Set();
  for (const [_0x47055e, _0x4bb6c3] of Object.entries(_0x1d544c)) {
    const _0xa66eea = _0x1f77bd[_0x47055e];
    if (!_0xa66eea) {
      continue;
    }
    _0x4bb6c3.forEach(_0x4212c4 => {
      const _0x232953 = _0x5a41ba.get(_0x4212c4);
      if (!_0x232953) {
        return;
      }
      _0xa66eea.appendChild(_0x232953);
      _0x5c50c9.add(_0x4212c4);
    });
  }
  for (const _0x401384 of _0x382e63) {
    if (_0x5c50c9.has(_0x401384)) {
      continue;
    }
    const _0x5d63bd = _0x5a41ba.get(_0x401384);
    if (!_0x5d63bd) {
      continue;
    }
    _0x1f77bd.more.appendChild(_0x5d63bd);
  }
  const _0x417cd7 = _0x44eb3f.querySelector(".v2-img-toolbar-main-divider");
  if (_0x417cd7) {
    const _0x47d1de = _0x1f77bd.outsideSecondary.querySelectorAll(".ftb-btn").length > 0;
    _0x417cd7.hidden = !_0x47d1de;
  }
}
function readToolbarLayoutFromDom(_0x33def0, _0x5b4980, _0x54f8e4, _0x2379d3 = null) {
  const _0x399425 = {
    outsidePrimary: [],
    outsideSecondary: [],
    more: []
  };
  const _0x2a691c = _0x2379d3 && typeof _0x2379d3 === "object" ? Object.entries(_0x2379d3) : [];
  if (_0x2a691c.length > 0) {
    _0x2a691c.forEach(([_0x7d1d8a, _0x2b5ebf]) => {
      if (!_0x399425[_0x7d1d8a] || !_0x2b5ebf) {
        return;
      }
      _0x2b5ebf.querySelectorAll(".ftb-btn").forEach(_0x444602 => {
        const _0x324a87 = _0x5b4980(_0x444602);
        if (!_0x324a87) {
          return;
        }
        _0x399425[_0x7d1d8a].push(_0x324a87);
      });
    });
    return _0x54f8e4(_0x399425);
  }
  _0x33def0.querySelectorAll("[data-zone]").forEach(_0x3d546a => {
    const _0x514807 = String(_0x3d546a.getAttribute("data-zone") || "").trim();
    const _0x2af09b = IMAGE_TOOLBAR_ZONE_MAP[_0x514807];
    if (!_0x2af09b) {
      return;
    }
    _0x3d546a.querySelectorAll(".ftb-btn").forEach(_0x54975c => {
      const _0x48d758 = _0x5b4980(_0x54975c);
      if (!_0x48d758) {
        return;
      }
      _0x399425[_0x2af09b].push(_0x48d758);
    });
  });
  return _0x54f8e4(_0x399425);
}
export function bindImageToolbarLayoutUi(_0x4f0c5d, _0x560f15 = {}) {
  const {
    store: _0x2057aa,
    getStateSnapshot: _0x1d3a3,
    getToolbarActionFromButton: _0x2b2c82
  } = _0x560f15;
  const _0x5a48b8 = _0x560f15.toolbarActions || _0x560f15.imageToolbarActions || [];
  const _0x170c46 = _0x560f15.normalizeToolbarLayout || _0x560f15.normalizeImageToolbarLayout;
  const _0x47b4ae = _0x560f15.serializeToolbarLayout || _0x560f15.serializeImageToolbarLayout;
  const _0x1549d8 = typeof _0x560f15.getToolbarLayout === "function" ? _0x560f15.getToolbarLayout : _0x7619f5 => _0x7619f5?.ui?.imageToolbarLayout;
  const _0x367f74 = typeof _0x560f15.setToolbarLayout === "function" ? _0x560f15.setToolbarLayout : _0x44c2e7 => _0x2057aa?.setImageToolbarLayout?.(_0x44c2e7);
  const _0x54b221 = new Set(Array.isArray(_0x560f15.moreMenuStickyActions) ? _0x560f15.moreMenuStickyActions : ["hd", "auto-subject", "multigrid"]);
  const _0x5da39f = getToolbarZones(_0x4f0c5d);
  const _0x521e95 = _0x4f0c5d.querySelector(".act-more-tools");
  const _0x536333 = _0x4f0c5d.querySelector("[data-role=\"more-menu\"]");
  const _0x5756ba = _0x4f0c5d.querySelector(".act-customize-tools");
  if (!_0x5da39f.outsidePrimary || !_0x5da39f.outsideSecondary || !_0x5da39f.more || !_0x521e95 || !_0x536333 || !_0x5756ba) {
    return {
      closeMoreMenu() {}
    };
  }
  applyToolbarLayoutToDom({
    toolbarEl: _0x4f0c5d,
    layoutInput: _0x1549d8(_0x1d3a3()),
    imageToolbarActions: _0x5a48b8,
    normalizeImageToolbarLayout: _0x170c46,
    getToolbarActionFromButton: _0x2b2c82
  });
  let _0x3bd1fc = false;
  let _0x457c7f = false;
  let _0x35903b = false;
  let _0x44d1a2 = null;
  let _0x373a0e = null;
  let _0x3dc8e5 = null;
  let _0x3b7501 = 0;
  const _0x2eb5d8 = _0x536333.parentNode;
  const _0x1c0f78 = _0x536333.nextSibling;
  const _0xca1f21 = () => {
    if (_0x3b7501) {
      cancelAnimationFrame(_0x3b7501);
    }
    _0x3b7501 = 0;
    _0x536333.classList.remove("is-portaled");
    _0x536333.removeAttribute("style");
    if (_0x2eb5d8 && _0x536333.parentNode !== _0x2eb5d8) {
      const _0x4893ae = _0x1c0f78 && _0x1c0f78.parentNode === _0x2eb5d8 ? _0x1c0f78 : null;
      _0x2eb5d8.insertBefore(_0x536333, _0x4893ae);
    }
  };
  const _0xd620a7 = () => {
    if (!_0x3bd1fc || _0x536333.hidden || !_0x4f0c5d.isConnected) {
      _0xca1f21();
      return;
    }
    const _0x347e06 = _0x4f0c5d.getBoundingClientRect();
    if (_0x347e06.width > 0 && _0x347e06.height > 0) {
      const _0x1a4e82 = Number(document.querySelector?.(".v2-canvas-stage")?.getBoundingClientRect?.()?.top);
      const _0x1ad48c = Number.isFinite(_0x1a4e82) ? Math.max(0, _0x1a4e82) : 0;
      const _0x48bd30 = _0x536333.getBoundingClientRect?.() || {};
      const _0x2a487a = Number(_0x536333.offsetHeight) || Number(_0x48bd30.height) || 0;
      _0x536333.style.transform = "translate(0, 0)";
      positionAnchoredSubmenu({
        submenu: _0x536333,
        anchorRect: _0x347e06,
        horizontalPlacement: "center",
        verticalPlacement: _0x347e06.top - _0x1ad48c >= _0x2a487a + 18 ? "above" : "below",
        verticalGap: 10,
        position: "fixed",
        viewportMargin: 8,
        viewportTop: _0x1ad48c,
        viewportWidth: globalThis.window?.innerWidth,
        viewportHeight: globalThis.window?.innerHeight
      });
    }
    _0x3b7501 = requestAnimationFrame(_0xd620a7);
  };
  const _0x5ab12d = () => {
    if (_0x536333.parentNode !== document.body) {
      document.body.appendChild(_0x536333);
    }
    _0x536333.classList.add("is-portaled");
    _0x536333.style.transform = "translate(0, 0)";
    if (_0x3b7501) {
      cancelAnimationFrame(_0x3b7501);
    }
    _0x3b7501 = 0;
  };
  const _0x3dee59 = () => {
    const _0x3dd625 = collectToolbarActionButtons(_0x4f0c5d, _0x2b2c82);
    collectToolbarActionButtons(_0x536333, _0x2b2c82).forEach((_0xc70aab, _0x591b91) => _0x3dd625.set(_0x591b91, _0xc70aab));
    return _0x3dd625;
  };
  const _0x1a2665 = (_0x2f0cfe, _0x30949e) => {
    _0x2f0cfe.classList.toggle("is-drop-target", !!_0x30949e);
  };
  const _0x54259e = _0x5756bc => {
    if (_0x373a0e === _0x5756bc) {
      return;
    }
    if (_0x373a0e) {
      _0x1a2665(_0x373a0e, false);
    }
    _0x373a0e = _0x5756bc || null;
    if (_0x373a0e) {
      _0x1a2665(_0x373a0e, true);
    }
  };
  const _0x3f1839 = () => {
    _0x54259e(null);
    Object.values(_0x5da39f).forEach(_0x358fbf => _0x1a2665(_0x358fbf, false));
  };
  const _0x597d34 = _0x13727e => {
    _0x4f0c5d.classList.toggle("is-toolbar-drag-active", !!_0x13727e);
    _0x536333.classList.toggle("is-toolbar-drag-active", !!_0x13727e);
  };
  const _0x4f3126 = () => Object.values(_0x5da39f).flatMap(_0x5e2123 => Array.from(_0x5e2123?.querySelectorAll?.(".ftb-btn") || []).filter(_0x3cb59f => _0x2b2c82(_0x3cb59f)));
  const _0x100b30 = _0xe4eccd => {
    const _0x575031 = _0x4f3126();
    const _0x7c40af = new Map(_0x575031.map(_0x411a91 => [_0x411a91, _0x411a91.getBoundingClientRect?.() || {}]));
    const _0x3da54a = _0xe4eccd();
    if (!_0x3da54a) {
      return false;
    }
    _0x4f3126().forEach(_0x1f9f3a => {
      const _0x24cad7 = _0x7c40af.get(_0x1f9f3a);
      if (!_0x24cad7) {
        return;
      }
      const _0x4af9b4 = _0x1f9f3a.getBoundingClientRect?.() || {};
      const _0x4eca9c = Number(_0x24cad7.left || 0) - Number(_0x4af9b4.left || 0);
      const _0x42c92f = Number(_0x24cad7.top || 0) - Number(_0x4af9b4.top || 0);
      if (_0x4eca9c === 0 && _0x42c92f === 0) {
        return;
      }
      _0x1f9f3a.style.transform = "translate(" + _0x4eca9c + "px, " + _0x42c92f + "px)";
      _0x1f9f3a.style.transition = "none";
      const _0x244e11 = typeof requestAnimationFrame === "function" ? requestAnimationFrame : _0x247661 => setTimeout(_0x247661, 0);
      _0x244e11(() => {
        _0x1f9f3a.style.transform = "";
        _0x1f9f3a.style.transition = "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)";
      });
    });
    return true;
  };
  const _0x594477 = () => {
    const _0xa0cb12 = readToolbarLayoutFromDom(_0x4f0c5d, _0x2b2c82, _0x170c46, _0x5da39f);
    const _0x16e4ff = _0x47b4ae(_0x1549d8(_0x1d3a3()));
    const _0x392c81 = _0x47b4ae(_0xa0cb12);
    if (_0x16e4ff === _0x392c81) {
      return;
    }
    _0x367f74(_0xa0cb12);
  };
  const _0x3a5bf4 = (_0x2ddd9d, _0x5b8fd1) => {
    const _0x142b93 = Array.from(_0x2ddd9d.querySelectorAll(".ftb-btn")).filter(_0x58671a => _0x58671a !== _0x44d1a2);
    for (const _0x196240 of _0x142b93) {
      const _0x3c2666 = _0x196240.getBoundingClientRect();
      const _0x4c1379 = _0x3c2666.left + _0x3c2666.width / 2;
      if (_0x5b8fd1 < _0x4c1379) {
        return _0x196240;
      }
    }
    return null;
  };
  const _0x57ee93 = (_0x491741, _0x1e3038) => {
    const _0x5ec403 = _0x1e3038.target?.closest?.(".ftb-btn");
    if (_0x5ec403 === _0x44d1a2) {
      return _0x44d1a2;
    }
    if (_0x5ec403 && _0x491741.contains(_0x5ec403) && _0x2b2c82(_0x5ec403)) {
      const _0x4e395c = _0x5ec403.getBoundingClientRect();
      const _0x2f4c46 = _0x4e395c.left + _0x4e395c.width / 2;
      if (Number(_0x1e3038.clientX || 0) < _0x2f4c46) {
        return _0x5ec403;
      } else {
        return _0x5ec403.nextElementSibling;
      }
    }
    return _0x3a5bf4(_0x491741, _0x1e3038.clientX);
  };
  const _0x46f39f = (_0x42908e, _0x159cc4) => {
    if (!_0x44d1a2 || !_0x42908e) {
      return false;
    }
    if (_0x159cc4 === _0x44d1a2) {
      return false;
    }
    const _0x36e476 = _0x159cc4 || null;
    if (_0x44d1a2.parentNode === _0x42908e) {
      const _0x262ef0 = _0x44d1a2.nextElementSibling;
      if (_0x36e476 && _0x262ef0 === _0x36e476) {
        return false;
      }
      if (!_0x36e476 && _0x44d1a2 === _0x42908e.lastElementChild) {
        return false;
      }
    }
    return _0x100b30(() => {
      if (_0x36e476) {
        _0x42908e.insertBefore(_0x44d1a2, _0x36e476);
      } else {
        _0x42908e.appendChild(_0x44d1a2);
      }
      return true;
    });
  };
  const _0x45913e = _0x1f2b70 => {
    _0x35903b = !!_0x1f2b70;
    _0x5756ba.classList.toggle("is-tooltip-pinned", _0x35903b);
  };
  const _0x2995fc = _0x4fd50a => {
    _0x457c7f = !!_0x4fd50a;
    _0x4f0c5d.classList.toggle("is-toolbar-customizing", _0x457c7f);
    _0x536333.classList.toggle("is-toolbar-customizing", _0x457c7f);
    _0x45913e(_0x457c7f);
    _0x5756ba.hidden = false;
    _0x5756ba.classList.toggle("is-active", _0x457c7f);
    _0x5756ba.textContent = _0x457c7f ? imageToolbarText("done") : imageToolbarText("customize");
    _0x5756ba.setAttribute("aria-label", _0x457c7f ? imageToolbarText("doneCustomize") : imageToolbarText("customize"));
    _0x3dee59().forEach(_0x4550c3 => {
      _0x4550c3.draggable = _0x457c7f;
      _0x4550c3.classList.toggle("is-toolbar-draggable", _0x457c7f);
    });
    if (!_0x457c7f) {
      _0x44d1a2 = null;
      _0x597d34(false);
      _0x3f1839();
      _0x3dee59().forEach(_0x5111d8 => {
        _0x5111d8.classList.remove("is-toolbar-dragging");
        _0x5111d8.classList.remove("is-toolbar-dragging-capture");
      });
    }
  };
  const _0x14264f = () => {
    if (!_0x3bd1fc) {
      return;
    }
    _0x3bd1fc = false;
    if (_0x457c7f) {
      _0xca1f21();
      _0x594477();
    }
    _0x2995fc(false);
    _0x521e95.classList.remove("is-active");
    _0x536333.hidden = true;
    _0xca1f21();
    if (_0x3dc8e5) {
      document.removeEventListener("pointerdown", _0x3dc8e5, true);
      _0x3dc8e5 = null;
    }
  };
  const _0x40583a = () => {
    if (_0x3bd1fc) {
      return;
    }
    _0x3bd1fc = true;
    _0x521e95.classList.add("is-active");
    _0x5ab12d();
    _0x536333.hidden = false;
    _0xd620a7();
    if (!_0x3dc8e5) {
      _0x3dc8e5 = _0x33aa7e => {
        if (!_0x4f0c5d.contains(_0x33aa7e.target) && !_0x536333.contains(_0x33aa7e.target)) {
          _0x14264f();
        }
      };
      document.addEventListener("pointerdown", _0x3dc8e5, true);
    }
  };
  _0x521e95.addEventListener("click", _0x583155 => {
    _0x583155.preventDefault();
    _0x583155.stopPropagation();
    if (_0x3bd1fc) {
      _0x14264f();
    } else {
      _0x40583a();
    }
  });
  _0x5756ba.addEventListener("click", _0x333f6a => {
    _0x333f6a.preventDefault();
    _0x333f6a.stopPropagation();
    _0x40583a();
    if (_0x457c7f) {
      _0x2995fc(false);
      _0x594477();
      return;
    }
    _0x2995fc(true);
  });
  const _0x41842f = _0x1b084e => {
    const _0x5000cf = _0x1b084e.target?.closest?.(".ftb-btn");
    if (!_0x5000cf) {
      return;
    }
    const _0x47a07c = _0x2b2c82(_0x5000cf);
    if (!_0x47a07c) {
      return;
    }
    if (_0x457c7f) {
      _0x1b084e.preventDefault();
      _0x1b084e.stopPropagation();
      return;
    }
    if (_0x5da39f.more.contains(_0x5000cf)) {
      if (_0x54b221.has(_0x47a07c)) {
        return;
      }
      queueMicrotask(() => {
        if (!_0x4f0c5d.isConnected) {
          return;
        }
        if (_0x457c7f) {
          return;
        }
        _0x14264f();
      });
    }
  };
  _0x4f0c5d.addEventListener("click", _0x41842f, true);
  _0x536333.addEventListener("click", _0x41842f, true);
  collectToolbarActionButtons(_0x4f0c5d, _0x2b2c82).forEach(_0x227443 => {
    if (_0x227443.dataset.toolbarDnDBound === "1") {
      return;
    }
    _0x227443.dataset.toolbarDnDBound = "1";
    _0x227443.addEventListener("dragstart", _0x23796f => {
      if (!_0x457c7f) {
        _0x23796f.preventDefault();
        return;
      }
      _0x44d1a2 = _0x227443;
      _0x597d34(true);
      _0x227443.classList.add("is-toolbar-dragging-capture");
      setTimeout(() => {
        if (_0x44d1a2 === _0x227443) {
          _0x227443.classList.add("is-toolbar-dragging");
        }
      }, 0);
      if (_0x23796f.dataTransfer) {
        _0x23796f.dataTransfer.effectAllowed = "move";
        _0x23796f.dataTransfer.setData("text/plain", "image-toolbar-button");
      }
    });
    _0x227443.addEventListener("dragend", () => {
      _0x227443.classList.remove("is-toolbar-dragging-capture");
      _0x227443.classList.remove("is-toolbar-dragging");
      _0x44d1a2 = null;
      _0x597d34(false);
      _0x3f1839();
    });
  });
  Object.values(_0x5da39f).forEach(_0x1fcd30 => {
    if (_0x1fcd30.dataset.toolbarDropBound === "1") {
      return;
    }
    _0x1fcd30.dataset.toolbarDropBound = "1";
    _0x1fcd30.addEventListener("dragover", _0x35cdaa => {
      if (!_0x457c7f || !_0x44d1a2) {
        return;
      }
      _0x35cdaa.preventDefault();
      _0x54259e(_0x1fcd30);
      const _0x11ab8b = _0x57ee93(_0x1fcd30, _0x35cdaa);
      _0x46f39f(_0x1fcd30, _0x11ab8b);
    });
    _0x1fcd30.addEventListener("dragleave", _0x2ac590 => {
      if (_0x44d1a2) {
        const _0x7ab23f = _0x2ac590.relatedTarget || null;
        if (!_0x7ab23f || _0x1fcd30.contains(_0x7ab23f)) {
          return;
        }
      }
      if (_0x373a0e === _0x1fcd30) {
        _0x54259e(null);
      }
    });
    _0x1fcd30.addEventListener("drop", _0x3aaae8 => {
      if (!_0x457c7f || !_0x44d1a2) {
        return;
      }
      _0x3aaae8.preventDefault();
      _0x54259e(null);
      _0x594477();
    });
  });
  return {
    closeMoreMenu: _0x14264f
  };
}