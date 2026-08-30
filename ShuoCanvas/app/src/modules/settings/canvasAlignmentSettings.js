import a1206_0x393442 from "../../core/stores/appStore.js";
import { getShortcuts } from "../shortcuts.js";
import { applySnapGridEnabled, readSnapGridEnabled, subscribeSnapGridChanges } from "../snapGridState.js";
import { getShortcutLabelByAction } from "./settingsShared.js";
import { normalizeConnectionLineStyle } from "../../core/edgePathGeometry.js";
const SELECTION_RELATED_HIGHLIGHT_COLORS = ["white", "blue", "green", "cyan", "purple", "red", "yellow"];
function normalizeSelectionRelatedHighlightColor(_0x2ac5fd) {
  const _0xfa70db = String(_0x2ac5fd || "").trim();
  if (SELECTION_RELATED_HIGHLIGHT_COLORS.includes(_0xfa70db)) {
    return _0xfa70db;
  } else {
    return "white";
  }
}
function getSelectionRelatedHighlightElements() {
  if (typeof document === "undefined") {
    return {
      btnOn: null,
      btnOff: null,
      colorRow: null,
      colorButtons: []
    };
  }
  return {
    btnOn: document.getElementById("btnSelectionRelatedHighlightOn"),
    btnOff: document.getElementById("btnSelectionRelatedHighlightOff"),
    colorRow: document.getElementById("selectionRelatedHighlightColorRow"),
    colorButtons: Array.from(document.querySelectorAll("[data-highlight-color]"))
  };
}
function syncSelectionRelatedHighlightColorButtons(_0x2168a6) {
  const _0xa6ed46 = normalizeSelectionRelatedHighlightColor(_0x2168a6);
  const {
    colorButtons: _0x5cfd75
  } = getSelectionRelatedHighlightElements();
  _0x5cfd75.forEach(_0x138c79 => {
    _0x138c79.classList.toggle("active", _0x138c79.dataset.highlightColor === _0xa6ed46);
  });
}
function syncSelectionRelatedHighlightEnabled(_0x5c88b0) {
  const _0x53ea5f = _0x5c88b0 !== false;
  const {
    btnOn: _0x119167,
    btnOff: _0x224cb8,
    colorRow: _0x130363,
    colorButtons: _0x4aff53
  } = getSelectionRelatedHighlightElements();
  _0x119167?.classList.toggle("active", _0x53ea5f);
  _0x224cb8?.classList.toggle("active", !_0x53ea5f);
  _0x130363?.classList.toggle("settings-row-disabled", !_0x53ea5f);
  _0x4aff53.forEach(_0x16109d => {
    _0x16109d.disabled = !_0x53ea5f;
    _0x16109d.setAttribute("aria-disabled", _0x53ea5f ? "false" : "true");
  });
}
export function setSelectionRelatedHighlightPref(_0x4b17c8, _0x5ebca = a1206_0x393442) {
  const _0x1ef4bf = _0x4b17c8 !== false;
  _0x5ebca.setSelectionRelatedHighlightEnabled(_0x1ef4bf);
  syncSelectionRelatedHighlightEnabled(_0x1ef4bf);
  return _0x1ef4bf;
}
export function setSelectionRelatedHighlightColorPref(_0x29d212, _0x6c9460 = a1206_0x393442) {
  const _0x56a435 = normalizeSelectionRelatedHighlightColor(_0x29d212);
  _0x6c9460.setSelectionRelatedHighlightColor(_0x56a435);
  syncSelectionRelatedHighlightColorButtons(_0x56a435);
  return _0x56a435;
}
function initSelectionRelatedHighlight() {
  const _0x577334 = document.getElementById("btnSelectionRelatedHighlightOn");
  const _0x2dcfe7 = document.getElementById("btnSelectionRelatedHighlightOff");
  const _0x46384a = Array.from(document.querySelectorAll("[data-highlight-color]"));
  if (!_0x577334 || !_0x2dcfe7) {
    return;
  }
  const _0x2c76bb = a1206_0x393442.getState();
  const _0x5e71ae = _0x2c76bb?.ui?.selectionRelatedHighlightEnabled !== false;
  const _0xdbf81c = normalizeSelectionRelatedHighlightColor(_0x2c76bb?.ui?.selectionRelatedHighlightColor);
  setSelectionRelatedHighlightPref(_0x5e71ae);
  setSelectionRelatedHighlightColorPref(_0xdbf81c);
  _0x577334.addEventListener("click", () => setSelectionRelatedHighlightPref(true));
  _0x2dcfe7.addEventListener("click", () => setSelectionRelatedHighlightPref(false));
  _0x46384a.forEach(_0x43af6b => {
    _0x43af6b.addEventListener("click", () => {
      if (_0x43af6b.disabled) {
        return;
      }
      setSelectionRelatedHighlightColorPref(_0x43af6b.dataset.highlightColor);
    });
  });
}
function initAlignFeature() {
  const _0x1cc860 = document.getElementById("btnAlignTriggerHold");
  const _0x2372cf = document.getElementById("btnAlignTriggerClick");
  const _0x4a4981 = document.getElementById("btnAlignTriggerOff");
  const _0x2361bb = document.getElementById("alignDistributeGapSlider");
  const _0x5cf80e = document.getElementById("alignDistributeGapValue");
  const _0x2441e1 = document.getElementById("alignShortcutLabelMain");
  const _0x2151b5 = document.getElementById("alignShortcutLabelHold");
  const _0x5d25d5 = document.getElementById("alignShortcutLabelClick");
  if (!_0x1cc860 || !_0x2372cf || !_0x4a4981 || !_0x2361bb || !_0x5cf80e) {
    return;
  }
  const _0x121b0c = _0x37536f => {
    const _0x2e6d11 = String(_0x37536f || "").trim();
    if (_0x2e6d11 === "hold" || _0x2e6d11 === "click" || _0x2e6d11 === "off") {
      return _0x2e6d11;
    } else {
      return "click";
    }
  };
  const _0x2133e6 = () => {
    try {
      const _0x219453 = getShortcuts?.() || {};
      const _0x56fac4 = _0x219453?.["align-feature"]?.keys;
      if (Array.isArray(_0x56fac4) && _0x56fac4.length > 0) {
        return _0x56fac4.join("+");
      }
    } catch {}
    return "Tab";
  };
  const _0x4d6e0d = () => {
    const _0x49ca5a = _0x2133e6();
    if (_0x2441e1) {
      _0x2441e1.textContent = _0x49ca5a;
    }
    if (_0x2151b5) {
      _0x2151b5.textContent = _0x49ca5a;
    }
    if (_0x5d25d5) {
      _0x5d25d5.textContent = _0x49ca5a;
    }
  };
  const _0x52b039 = _0x250492 => {
    const _0x465db8 = _0x121b0c(_0x250492);
    a1206_0x393442.setAlignFeatureTriggerMode(_0x465db8);
    const _0x2caac6 = _0x465db8 !== "off";
    _0x1cc860.classList.toggle("active", _0x465db8 === "hold");
    _0x2372cf.classList.toggle("active", _0x465db8 === "click");
    _0x4a4981.classList.toggle("active", _0x465db8 === "off");
    window.dispatchEvent(new CustomEvent("v2-align-feature-changed", {
      detail: {
        enabled: _0x2caac6,
        mode: _0x465db8
      }
    }));
  };
  const _0x11dcf5 = _0x501bf4 => {
    const _0x10e826 = Number(_0x501bf4);
    const _0x5e510a = Number.isFinite(_0x10e826) ? Math.max(0, Math.min(200, Math.round(_0x10e826 / 5) * 5)) : 40;
    _0x2361bb.value = String(_0x5e510a);
    _0x5cf80e.textContent = String(_0x5e510a);
    a1206_0x393442.setAlignDistributeGap(_0x5e510a);
  };
  const _0x5e7581 = a1206_0x393442.getState()?.ui || {};
  const _0xaa6049 = _0x121b0c(_0x5e7581.alignFeatureTriggerMode);
  const _0x3ce548 = Number.isFinite(Number(_0x5e7581.alignDistributeGap)) ? Number(_0x5e7581.alignDistributeGap) : 40;
  _0x52b039(_0xaa6049);
  _0x11dcf5(_0x3ce548);
  _0x4d6e0d();
  _0x1cc860.addEventListener("click", () => _0x52b039("hold"));
  _0x2372cf.addEventListener("click", () => _0x52b039("click"));
  _0x4a4981.addEventListener("click", () => _0x52b039("off"));
  _0x2361bb.addEventListener("input", _0xc1a34 => _0x11dcf5(_0xc1a34.target?.value));
  window.addEventListener("shortcuts-updated", _0x4d6e0d);
}
function initConnectionLines() {
  const _0x26424d = document.getElementById("btnConnectionLinesOn");
  const _0x3fd327 = document.getElementById("btnConnectionLinesOff");
  const _0x143350 = document.getElementById("connectionLinesShortcutLabel");
  if (!_0x26424d || !_0x3fd327) {
    return;
  }
  const _0x22667f = _0x31c521 => {
    const _0x50cc3f = _0x31c521 !== false;
    _0x26424d.classList.toggle("active", _0x50cc3f);
    _0x3fd327.classList.toggle("active", !_0x50cc3f);
  };
  const _0x14c3c6 = _0x17eced => {
    const _0x404e6f = _0x17eced !== false;
    a1206_0x393442.setConnectionLinesVisible(_0x404e6f);
    _0x22667f(_0x404e6f);
    window.dispatchEvent(new CustomEvent("v2-connection-lines-visibility-changed", {
      detail: {
        visible: _0x404e6f
      }
    }));
  };
  const _0x2e8278 = () => {
    if (!_0x143350) {
      return;
    }
    _0x143350.textContent = getShortcutLabelByAction("toggle-connection-lines", "B");
  };
  _0x14c3c6(a1206_0x393442.getState()?.ui?.connectionLinesVisible !== false);
  _0x2e8278();
  _0x26424d.addEventListener("click", () => _0x14c3c6(true));
  _0x3fd327.addEventListener("click", () => _0x14c3c6(false));
  window.addEventListener("shortcuts-updated", _0x2e8278);
  window.addEventListener("v2-connection-lines-visibility-changed", _0x2b444a => {
    _0x22667f(_0x2b444a?.detail?.visible !== false);
  });
}
function initConnectionLineStyle() {
  const _0x2a57f1 = Array.from(document.querySelectorAll("[data-connection-line-style]"));
  if (_0x2a57f1.length === 0) {
    return;
  }
  const _0x3dee76 = _0x45411a => {
    const _0x3aa4c0 = normalizeConnectionLineStyle(_0x45411a);
    a1206_0x393442.setConnectionLineStyle(_0x3aa4c0);
    _0x2a57f1.forEach(_0xa0f6f6 => {
      const _0x5d58d9 = _0xa0f6f6.dataset.connectionLineStyle === _0x3aa4c0;
      _0xa0f6f6.classList.toggle("active", _0x5d58d9);
      _0xa0f6f6.setAttribute("aria-pressed", _0x5d58d9 ? "true" : "false");
    });
  };
  _0x3dee76(a1206_0x393442.getState()?.ui?.connectionLineStyle);
  _0x2a57f1.forEach(_0x12cdd1 => {
    _0x12cdd1.addEventListener("click", () => {
      _0x3dee76(_0x12cdd1.dataset.connectionLineStyle);
    });
  });
}
function ensureSnapGuideOverlay() {
  let _0x12ac51 = document.getElementById("v2-snap-guide-overlay");
  if (!_0x12ac51) {
    _0x12ac51 = document.createElement("div");
    _0x12ac51.id = "v2-snap-guide-overlay";
    _0x12ac51.className = "v2-snap-guide-overlay";
    document.body.appendChild(_0x12ac51);
  }
  window._showSnapGuideLines = _0x172a35 => {
    if (!_0x12ac51) {
      return;
    }
    _0x12ac51.replaceChildren();
    if (!Array.isArray(_0x172a35) || _0x172a35.length === 0) {
      return;
    }
    const _0x432269 = document.createDocumentFragment();
    _0x172a35.forEach(_0x48da8c => {
      if (!_0x48da8c || _0x48da8c.type !== "v" && _0x48da8c.type !== "h") {
        return;
      }
      const _0x2c2630 = document.createElement("div");
      _0x2c2630.className = _0x48da8c.type === "v" ? "v2-snap-guide-line is-vertical" : "v2-snap-guide-line is-horizontal";
      if (_0x48da8c.type === "v") {
        const _0x59fb34 = Number.isFinite(_0x48da8c.start) ? _0x48da8c.start : 0;
        const _0x2a7ed5 = Number.isFinite(_0x48da8c.end) ? _0x48da8c.end : _0x59fb34;
        const _0x1c1468 = Math.min(_0x59fb34, _0x2a7ed5);
        const _0x265c21 = Math.max(1, Math.abs(_0x2a7ed5 - _0x59fb34));
        _0x2c2630.style.left = (Number(_0x48da8c.pos) || 0) + "px";
        _0x2c2630.style.top = _0x1c1468 + "px";
        _0x2c2630.style.height = _0x265c21 + "px";
      } else {
        const _0x3691ba = Number.isFinite(_0x48da8c.start) ? _0x48da8c.start : 0;
        const _0xb237c9 = Number.isFinite(_0x48da8c.end) ? _0x48da8c.end : _0x3691ba;
        const _0xad28f9 = Math.min(_0x3691ba, _0xb237c9);
        const _0x23bbb3 = Math.max(1, Math.abs(_0xb237c9 - _0x3691ba));
        _0x2c2630.style.top = (Number(_0x48da8c.pos) || 0) + "px";
        _0x2c2630.style.left = _0xad28f9 + "px";
        _0x2c2630.style.width = _0x23bbb3 + "px";
      }
      _0x432269.appendChild(_0x2c2630);
    });
    _0x12ac51.appendChild(_0x432269);
  };
  window._clearSnapGuideLines = () => {
    _0x12ac51?.replaceChildren();
  };
}
function initSnapGuides() {
  const _0x4bc83a = document.getElementById("btnSnapGuidesOn");
  const _0x564712 = document.getElementById("btnSnapGuidesOff");
  const _0x504ef0 = document.getElementById("snapGuidesShortcutLabel");
  if (!_0x4bc83a || !_0x564712) {
    return;
  }
  ensureSnapGuideOverlay();
  const _0x134d3a = () => {
    const _0x477250 = localStorage.getItem("v2-snap-guides");
    if (_0x477250 == null) {
      return true;
    }
    return _0x477250 === "1" || _0x477250 === "true";
  };
  const _0x2cc22d = _0x4fa040 => {
    const _0x4ac0c1 = _0x4fa040 !== false;
    _0x4bc83a.classList.toggle("active", _0x4ac0c1);
    _0x564712.classList.toggle("active", !_0x4ac0c1);
  };
  const _0x2b7102 = _0x482d38 => {
    const _0x13297c = _0x482d38 !== false;
    a1206_0x393442.setSnapGuidesEnabled(_0x13297c);
    window.v2SnapGuides = _0x13297c;
    _0x2cc22d(_0x13297c);
    if (!_0x13297c) {
      window._clearSnapGuideLines?.();
    }
    window.dispatchEvent(new CustomEvent("v2-snap-guides-changed", {
      detail: {
        enabled: _0x13297c
      }
    }));
  };
  const _0x5a9146 = () => {
    if (!_0x504ef0) {
      return;
    }
    _0x504ef0.textContent = getShortcutLabelByAction("snap-guides", "；");
  };
  const _0x108a2d = a1206_0x393442.getState()?.ui?.snapGuidesEnabled;
  const _0xdbe4fb = typeof _0x108a2d === "boolean" ? _0x108a2d : _0x134d3a();
  _0x2b7102(_0xdbe4fb);
  _0x5a9146();
  _0x4bc83a.addEventListener("click", () => _0x2b7102(true));
  _0x564712.addEventListener("click", () => _0x2b7102(false));
  window.addEventListener("shortcuts-updated", _0x5a9146);
  window.addEventListener("v2-snap-guides-changed", _0x504c34 => {
    _0x2cc22d(_0x504c34?.detail?.enabled !== false);
  });
}
function initSnapGrid() {
  const _0x565a6f = document.getElementById("btnSnapGridOn");
  const _0x2a919f = document.getElementById("btnSnapGridOff");
  const _0x35dd26 = document.getElementById("snapGridShortcutLabel");
  if (!_0x565a6f || !_0x2a919f) {
    return;
  }
  const _0x5223bf = () => {
    if (!_0x35dd26) {
      return;
    }
    _0x35dd26.textContent = getShortcutLabelByAction("snap-grid", "L");
  };
  const _0x2c6092 = readSnapGridEnabled();
  applySnapGridEnabled(_0x2c6092, {
    emitEvent: false
  });
  _0x5223bf();
  _0x565a6f.addEventListener("click", () => applySnapGridEnabled(true));
  _0x2a919f.addEventListener("click", () => applySnapGridEnabled(false));
  window.addEventListener("shortcuts-updated", _0x5223bf);
  subscribeSnapGridChanges(_0x4c9144 => {
    _0x565a6f.classList.toggle("active", _0x4c9144 === true);
    _0x2a919f.classList.toggle("active", _0x4c9144 !== true);
  });
}
export function initCanvasAlignmentSettings() {
  initSelectionRelatedHighlight();
  initConnectionLines();
  initConnectionLineStyle();
  initSnapGuides();
  initSnapGrid();
  initAlignFeature();
}