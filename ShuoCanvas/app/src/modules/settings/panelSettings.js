import { revealModelServiceSettingsField } from "./modelServiceSettingsNavigator.js";
function getSettingsPanelElements() {
  return {
    settingsOverlay: document.getElementById("settingsOverlay"),
    avatarMenu: document.getElementById("avatarMenu")
  };
}
function isSettingsPanelOpen(_0x4e11ec) {
  return !!_0x4e11ec && _0x4e11ec.style.display === "block";
}
const SETTINGS_FIELD_HIGHLIGHT_CLASS = "is-settings-field-highlight";
const fieldHighlightTimers = new WeakMap();
function getTimerHost() {
  return globalThis.window || globalThis;
}
function scheduleTimer(_0x2ecd2e, _0x8db954 = 0) {
  const _0x2fb300 = getTimerHost();
  if (typeof _0x2fb300?.setTimeout === "function") {
    return _0x2fb300.setTimeout(_0x2ecd2e, _0x8db954);
  }
  _0x2ecd2e();
  return null;
}
function clearScheduledTimer(_0x1cf5a3) {
  if (_0x1cf5a3 == null) {
    return;
  }
  const _0xa307cd = getTimerHost();
  if (typeof _0xa307cd?.clearTimeout === "function") {
    _0xa307cd.clearTimeout(_0x1cf5a3);
  }
}
function dispatchWebPreviewSettingsSync(_0x171bd6) {
  const _0x45c021 = globalThis.window;
  if (!_0x45c021 || typeof _0x45c021.dispatchEvent !== "function") {
    return;
  }
  const _0x38c9ff = {
    reason: _0x171bd6
  };
  const _0x4dd28a = typeof globalThis.CustomEvent === "function" ? new globalThis.CustomEvent("web-preview:force-sync", {
    detail: _0x38c9ff
  }) : {
    type: "web-preview:force-sync",
    detail: _0x38c9ff
  };
  _0x45c021.dispatchEvent(_0x4dd28a);
}
export function activateSettingsPane(_0x444db5 = "api-input") {
  const _0x40865d = String(_0x444db5 || "").trim();
  if (!_0x40865d) {
    return false;
  }
  let _0x445a8c = false;
  document.querySelectorAll?.(".settings-nav-item")?.forEach(_0xbdf266 => {
    const _0xcdb6d0 = _0xbdf266.dataset?.pane === _0x40865d;
    _0xbdf266.classList.toggle("active", _0xcdb6d0);
    _0x445a8c = _0x445a8c || _0xcdb6d0;
  });
  document.querySelectorAll?.(".settings-pane")?.forEach(_0x3f116d => {
    _0x3f116d.classList.toggle("active", _0x3f116d.id === "pane-" + _0x40865d);
  });
  return _0x445a8c;
}
export function highlightSettingsField(_0x10b36f, {
  duration = 4200
} = {}) {
  if (!_0x10b36f?.classList) {
    return false;
  }
  document.querySelectorAll?.("." + SETTINGS_FIELD_HIGHLIGHT_CLASS)?.forEach(_0x43813f => {
    if (_0x43813f !== _0x10b36f) {
      _0x43813f.classList.remove(SETTINGS_FIELD_HIGHLIGHT_CLASS);
    }
  });
  const _0x31fe67 = fieldHighlightTimers.get(_0x10b36f);
  clearScheduledTimer(_0x31fe67);
  _0x10b36f.classList.remove(SETTINGS_FIELD_HIGHLIGHT_CLASS);
  if (typeof _0x10b36f.getBoundingClientRect === "function") {
    _0x10b36f.getBoundingClientRect();
  }
  _0x10b36f.classList.add(SETTINGS_FIELD_HIGHLIGHT_CLASS);
  const _0x23b62a = scheduleTimer(() => {
    _0x10b36f.classList.remove(SETTINGS_FIELD_HIGHLIGHT_CLASS);
    fieldHighlightTimers.delete(_0x10b36f);
  }, duration);
  if (_0x23b62a != null) {
    fieldHighlightTimers.set(_0x10b36f, _0x23b62a);
  }
  return true;
}
export function focusSettingsField(_0x240ce0, _0x3d0db9 = {}) {
  const _0xdb38f5 = (Array.isArray(_0x240ce0) ? _0x240ce0 : [_0x240ce0]).map(_0x18531e => String(_0x18531e || "").trim()).filter(Boolean);
  if (!_0xdb38f5.length) {
    return false;
  }
  const _0x400cb8 = _0xdb38f5.map(_0x1c203b => document.getElementById(_0x1c203b)).find(Boolean);
  if (!_0x400cb8) {
    return false;
  }
  revealModelServiceSettingsField(_0x400cb8);
  _0x400cb8.scrollIntoView?.({
    block: "center",
    behavior: "smooth"
  });
  _0x400cb8.focus?.();
  if (_0x3d0db9.select !== false) {
    _0x400cb8.select?.();
  }
  if (_0x3d0db9.highlight !== false) {
    highlightSettingsField(_0x400cb8, _0x3d0db9);
  }
  return true;
}
export function openSettingsPanelToField({
  paneName = "api-input",
  fieldIds = [],
  select = true,
  highlight = true
} = {}) {
  const _0x77d4cc = openSettingsPanel();
  if (!_0x77d4cc) {
    return false;
  }
  activateSettingsPane(paneName);
  scheduleTimer(() => {
    focusSettingsField(fieldIds, {
      select: select,
      highlight: highlight
    });
  }, 0);
  return true;
}
export function openSettingsPanel() {
  const {
    settingsOverlay: _0x4f7a72,
    avatarMenu: _0x4ce2dd
  } = getSettingsPanelElements();
  if (!_0x4f7a72) {
    return false;
  }
  _0x4f7a72.style.display = "block";
  _0x4ce2dd?.classList.remove("open");
  dispatchWebPreviewSettingsSync("settings-open");
  return true;
}
export function closeSettingsPanel() {
  const {
    settingsOverlay: _0x14a3f5
  } = getSettingsPanelElements();
  if (!_0x14a3f5) {
    return false;
  }
  _0x14a3f5.style.display = "none";
  const _0x475b1e = globalThis.window;
  if (_0x475b1e && typeof _0x475b1e.dispatchEvent === "function") {
    const _0x3bef82 = typeof globalThis.CustomEvent === "function" ? new globalThis.CustomEvent("settings-panel-closed") : {
      type: "settings-panel-closed"
    };
    _0x475b1e.dispatchEvent(_0x3bef82);
  }
  dispatchWebPreviewSettingsSync("settings-close");
  return true;
}
export function toggleSettingsPanel() {
  const {
    settingsOverlay: _0x279e4d
  } = getSettingsPanelElements();
  if (!_0x279e4d) {
    return false;
  }
  if (isSettingsPanelOpen(_0x279e4d)) {
    return closeSettingsPanel();
  } else {
    return openSettingsPanel();
  }
}
export function initSettingsPanelEvents() {
  const _0x43579a = document.getElementById("btnOpenSettings");
  const _0xd9a66f = document.getElementById("btnSettingsClose");
  const _0x2897d9 = document.getElementById("settingsOverlay");
  if (!_0x43579a || !_0x2897d9) {
    return;
  }
  _0x43579a.addEventListener("click", _0x23917b => {
    _0x23917b.stopPropagation();
    openSettingsPanel();
  });
  _0xd9a66f?.addEventListener("click", () => {
    closeSettingsPanel();
  });
  let _0xc9b6c5 = false;
  let _0x4cd7d5 = false;
  const _0x1e745d = () => {
    _0xc9b6c5 = false;
    _0x4cd7d5 = false;
  };
  _0x2897d9.addEventListener("pointerdown", _0x57e4a0 => {
    _0xc9b6c5 = _0x57e4a0.target === _0x2897d9;
    _0x4cd7d5 = false;
  });
  _0x2897d9.addEventListener("pointerup", _0x428460 => {
    _0x4cd7d5 = _0xc9b6c5 && _0x428460.target === _0x2897d9;
  });
  _0x2897d9.addEventListener("pointercancel", _0x1e745d);
  _0x2897d9.addEventListener("click", _0x50bdd5 => {
    const _0x37840c = _0x50bdd5.target === _0x2897d9 && _0xc9b6c5 && _0x4cd7d5;
    _0x1e745d();
    if (_0x37840c) {
      closeSettingsPanel();
    }
  });
  const _0x77b660 = document.querySelectorAll(".settings-nav-item");
  const _0x3932f8 = document.querySelectorAll(".settings-pane");
  _0x77b660.forEach(_0x2cb7ac => {
    _0x2cb7ac.addEventListener("click", () => {
      _0x77b660.forEach(_0x2a9ab2 => _0x2a9ab2.classList.remove("active"));
      _0x3932f8.forEach(_0x157d54 => _0x157d54.classList.remove("active"));
      _0x2cb7ac.classList.add("active");
      const _0x40bfc2 = "pane-" + _0x2cb7ac.dataset.pane;
      const _0x1ea337 = document.getElementById(_0x40bfc2);
      if (_0x1ea337) {
        _0x1ea337.classList.add("active");
      }
    });
  });
}