import { fetchUserSettingsFromServer, saveUserSettingsToServer } from "../../../api/userSettingsApi.js";
import { COMPLETION_SOUND_DEFAULTS, BUILT_IN_COMPLETION_SOUND_PATH, normalizeCompletionSoundSettings, previewCompletionSound, setCompletionSoundSettingsCache } from "../../services/completionSoundService.js";
import { showError, showSuccess } from "../../services/toastService.js";
import { t } from "../../i18n/index.js";
import { desktopBridge } from "../../services/desktopBridge.js";
function completionSoundText(_0x2f0d14, _0x4bed26 = {}) {
  return t("settings.completionSound." + _0x2f0d14, _0x4bed26);
}
const ELEMENT_IDS = Object.freeze({
  enabledGroup: "completionSoundEnabledGroup",
  notificationEnabledGroup: "completionNotificationEnabledGroup",
  volumeSlider: "completionSoundVolumeSlider",
  volumeValue: "completionSoundVolumeValue",
  fileControl: "completionSoundFileControl",
  fileSelect: "completionSoundFileSelect",
  fileTrigger: "completionSoundFileTrigger",
  fileTriggerText: "completionSoundFileTriggerText",
  fileMenu: "completionSoundFileMenu",
  openFolderButton: "btnCompletionSoundOpenFolder",
  refreshButton: "btnCompletionSoundRefresh",
  previewButton: "btnCompletionSoundPreview",
  status: "completionSoundStatus"
});
let currentSettings = normalizeCompletionSoundSettings(COMPLETION_SOUND_DEFAULTS);
let currentUserSettings = {};
let currentFiles = [];
function getElement(_0x34700b) {
  return document.getElementById(_0x34700b);
}
function normalizeText(_0xa4afb3) {
  return String(_0xa4afb3 || "").trim();
}
function normalizePathKey(_0x32f481) {
  return normalizeText(_0x32f481).replace(/\\/g, "/").toLowerCase();
}
function clampVolumePercent(_0x51a8c4) {
  const _0x3fe963 = Number(_0x51a8c4);
  if (!Number.isFinite(_0x3fe963)) {
    return Math.round(COMPLETION_SOUND_DEFAULTS.volume * 100);
  }
  return Math.max(0, Math.min(100, Math.round(_0x3fe963)));
}
function isBuiltInNotifyPath(_0x26e127) {
  const _0x15fe21 = normalizePathKey(_0x26e127);
  return _0x15fe21.endsWith("/assets/sounds/notify.mp3") || _0x15fe21 === BUILT_IN_COMPLETION_SOUND_PATH;
}
function readSettingsFromControls() {
  const _0x3a94e4 = clampVolumePercent(getElement(ELEMENT_IDS.volumeSlider)?.value);
  return normalizeCompletionSoundSettings({
    ...currentSettings,
    volume: _0x3a94e4 / 100,
    selectedFilePath: normalizeText(getElement(ELEMENT_IDS.fileSelect)?.value) || BUILT_IN_COMPLETION_SOUND_PATH
  });
}
function setStatus(_0x292516 = "", _0x13408c = "") {
  const _0xeb9983 = getElement(ELEMENT_IDS.status);
  if (!_0xeb9983) {
    return;
  }
  _0xeb9983.textContent = _0x292516;
  _0xeb9983.classList.toggle("is-error", _0x13408c === "error");
  _0xeb9983.classList.toggle("is-success", _0x13408c === "success");
}
function syncEnabledButtons(_0x51dbac) {
  const _0x20653d = getElement(ELEMENT_IDS.enabledGroup);
  if (!_0x20653d) {
    return;
  }
  _0x20653d.querySelectorAll(".cursor-size-btn").forEach(_0x80756d => {
    const _0x5e8afa = _0x80756d.dataset.completionSoundEnabled === "on";
    _0x80756d.classList.toggle("active", _0x5e8afa === _0x51dbac);
  });
}
function syncNotificationEnabledButtons(_0x43f00b) {
  const _0x5b2323 = getElement(ELEMENT_IDS.notificationEnabledGroup);
  if (!_0x5b2323) {
    return;
  }
  _0x5b2323.querySelectorAll(".cursor-size-btn").forEach(_0x4fa05b => {
    const _0x4759e2 = _0x4fa05b.dataset.completionNotificationEnabled === "on";
    _0x4fa05b.classList.toggle("active", _0x4759e2 === _0x43f00b);
  });
}
function renderSettings(_0x2a8a77) {
  currentSettings = normalizeCompletionSoundSettings(_0x2a8a77);
  setCompletionSoundSettingsCache(currentSettings);
  syncEnabledButtons(currentSettings.enabled);
  syncNotificationEnabledButtons(currentSettings.notificationEnabled);
  const _0x43081a = clampVolumePercent(currentSettings.volume * 100);
  const _0x171298 = getElement(ELEMENT_IDS.volumeSlider);
  const _0x311024 = getElement(ELEMENT_IDS.volumeValue);
  if (_0x171298) {
    _0x171298.value = String(_0x43081a);
  }
  if (_0x311024) {
    _0x311024.textContent = _0x43081a + "%";
  }
}
function selectFilePathFromList(_0x585d3e, _0x508ce5) {
  const _0x357784 = normalizePathKey(_0x508ce5);
  const _0x51150c = _0x585d3e.find(_0x8dbeac => normalizePathKey(_0x8dbeac?.path) === _0x357784);
  if (_0x51150c?.path) {
    return _0x51150c.path;
  }
  if (isBuiltInNotifyPath(_0x508ce5)) {
    const _0x4b5eea = _0x585d3e.find(_0x420e2c => normalizeText(_0x420e2c?.name).toLowerCase() === "notify.mp3");
    if (_0x4b5eea?.path) {
      return _0x4b5eea.path;
    }
  }
  return _0x585d3e[0]?.path || BUILT_IN_COMPLETION_SOUND_PATH;
}
function renderFileOptions(_0xbb2c2a, _0x55776e = "") {
  currentFiles = Array.isArray(_0xbb2c2a) ? _0xbb2c2a : [];
  const _0x589561 = getElement(ELEMENT_IDS.fileSelect);
  const _0x3df3f4 = getElement(ELEMENT_IDS.fileTriggerText);
  const _0x2f4045 = getElement(ELEMENT_IDS.fileMenu);
  if (!_0x589561) {
    return;
  }
  _0x589561.replaceChildren();
  _0x2f4045?.replaceChildren?.();
  const _0x4acb6c = selectFilePathFromList(currentFiles, _0x55776e);
  if (currentFiles.length === 0) {
    const _0x4bbc33 = document.createElement("option");
    _0x4bbc33.value = BUILT_IN_COMPLETION_SOUND_PATH;
    _0x4bbc33.textContent = "notify.mp3";
    _0x589561.appendChild(_0x4bbc33);
    _0x589561.value = BUILT_IN_COMPLETION_SOUND_PATH;
    if (_0x3df3f4) {
      _0x3df3f4.textContent = "notify.mp3";
    }
    return;
  }
  for (const _0x3764ed of currentFiles) {
    const _0x1094f8 = normalizeText(_0x3764ed?.path);
    if (!_0x1094f8) {
      continue;
    }
    const _0x210474 = document.createElement("option");
    _0x210474.value = _0x1094f8;
    _0x210474.textContent = normalizeText(_0x3764ed?.name) || _0x1094f8;
    _0x589561.appendChild(_0x210474);
    const _0x3119d6 = document.createElement("button");
    _0x3119d6.type = "button";
    _0x3119d6.className = "settings-preset-option";
    _0x3119d6.dataset.value = _0x1094f8;
    _0x3119d6.textContent = _0x210474.textContent;
    _0x3119d6.setAttribute?.("role", "option");
    _0x2f4045?.appendChild?.(_0x3119d6);
  }
  _0x589561.value = _0x4acb6c;
  syncFileMenuSelection(_0x4acb6c);
}
function getSelectedFileLabel(_0x5153f5) {
  const _0xcf1b41 = normalizePathKey(_0x5153f5);
  const _0x39c0ad = currentFiles.find(_0x759013 => normalizePathKey(_0x759013?.path) === _0xcf1b41);
  return normalizeText(_0x39c0ad?.name) || "notify.mp3";
}
function syncFileMenuSelection(_0x65f6a5) {
  const _0x448d4e = getElement(ELEMENT_IDS.fileSelect);
  const _0x36c711 = getElement(ELEMENT_IDS.fileTriggerText);
  const _0x66586f = getElement(ELEMENT_IDS.fileMenu);
  if (_0x448d4e) {
    _0x448d4e.value = _0x65f6a5;
  }
  if (_0x36c711) {
    _0x36c711.textContent = getSelectedFileLabel(_0x65f6a5);
  }
  _0x66586f?.querySelectorAll?.(".settings-preset-option")?.forEach(_0x3d8463 => {
    const _0x1ae9c1 = normalizePathKey(_0x3d8463.dataset?.value) === normalizePathKey(_0x65f6a5);
    _0x3d8463.classList.toggle("is-active", _0x1ae9c1);
    _0x3d8463.setAttribute?.("aria-selected", _0x1ae9c1 ? "true" : "false");
  });
}
function setFileMenuOpen(_0x2ae291, {
  focusMenu = false,
  focusTrigger = false
} = {}) {
  const _0xead1b = getElement(ELEMENT_IDS.fileControl);
  const _0x396852 = getElement(ELEMENT_IDS.fileTrigger);
  const _0x3a311c = getElement(ELEMENT_IDS.fileMenu);
  if (!_0xead1b || !_0x396852 || !_0x3a311c) {
    return;
  }
  _0xead1b.classList.toggle("is-open", !!_0x2ae291);
  _0x396852.setAttribute?.("aria-expanded", _0x2ae291 ? "true" : "false");
  _0x3a311c.hidden = !_0x2ae291;
  if (_0x2ae291 && focusMenu) {
    const _0x3dcc3a = Array.from(_0x3a311c.querySelectorAll?.(".settings-preset-option") || []).find(_0x1d2f37 => _0x1d2f37.classList?.contains("is-active")) || _0x3a311c.querySelectorAll?.(".settings-preset-option")?.[0];
    _0x3dcc3a?.focus?.();
  } else if (!_0x2ae291 && focusTrigger) {
    _0x396852.focus?.();
  }
}
function isFileMenuOpen() {
  return !!getElement(ELEMENT_IDS.fileControl)?.classList?.contains("is-open");
}
async function selectCompletionSoundFile(_0x352ab6) {
  const _0x5ae67a = selectFilePathFromList(currentFiles, _0x352ab6);
  currentSettings = normalizeCompletionSoundSettings({
    ...currentSettings,
    selectedFilePath: _0x5ae67a
  });
  syncFileMenuSelection(_0x5ae67a);
  setCompletionSoundSettingsCache(currentSettings);
  setFileMenuOpen(false, {
    focusTrigger: true
  });
  await saveCompletionSoundSettings(currentSettings, {
    silent: true
  });
}
async function saveCompletionSoundSettings(_0x436f87, {
  silent = false
} = {}) {
  const _0xb1b4ce = normalizeCompletionSoundSettings({
    ..._0x436f87,
    updatedAt: Date.now()
  });
  currentSettings = _0xb1b4ce;
  setCompletionSoundSettingsCache(_0xb1b4ce);
  try {
    const _0x29c6df = await fetchUserSettingsFromServer().catch(() => currentUserSettings || {});
    currentUserSettings = {
      ...(_0x29c6df || {}),
      completionSound: _0xb1b4ce
    };
    const _0x1f36fd = await saveUserSettingsToServer(currentUserSettings);
    if (_0x1f36fd?.settings && typeof _0x1f36fd.settings === "object") {
      currentUserSettings = _0x1f36fd.settings;
    }
    if (!silent) {
      showSuccess(completionSoundText("saved"));
    }
    return _0xb1b4ce;
  } catch (_0x4d86cd) {
    console.error("[completionSoundSettings] save failed:", _0x4d86cd);
    showError(completionSoundText("saveFailed", {
      error: _0x4d86cd?.message || completionSoundText("unknownError")
    }));
    throw _0x4d86cd;
  }
}
async function loadSystemSoundFiles({
  saveSelected = false
} = {}) {
  if (!desktopBridge.notificationSound.isAvailable()) {
    renderFileOptions([], currentSettings.selectedFilePath);
    setStatus(completionSoundText("listUnsupported"), "error");
    return [];
  }
  try {
    setStatus(completionSoundText("readingSystemSounds"));
    const _0x3b0b34 = await desktopBridge.notificationSound.listSystemSounds();
    const _0x161868 = Array.isArray(_0x3b0b34?.files) ? _0x3b0b34.files : [];
    const _0x41d02e = selectFilePathFromList(_0x161868, currentSettings.selectedFilePath);
    renderFileOptions(_0x161868, _0x41d02e);
    currentSettings = normalizeCompletionSoundSettings({
      ...currentSettings,
      selectedFilePath: _0x41d02e
    });
    setCompletionSoundSettingsCache(currentSettings);
    setStatus(_0x161868.length ? completionSoundText("foundMp3Files", {
      count: _0x161868.length
    }) : completionSoundText("emptyMp3Directory"), _0x161868.length ? "success" : "");
    if (saveSelected) {
      await saveCompletionSoundSettings(currentSettings, {
        silent: true
      });
    }
    return _0x161868;
  } catch (_0x54f4ed) {
    console.error("[completionSoundSettings] list system sounds failed:", _0x54f4ed);
    renderFileOptions([], currentSettings.selectedFilePath);
    setStatus(completionSoundText("listFailed", {
      error: _0x54f4ed?.message || completionSoundText("unknownError")
    }), "error");
    return [];
  }
}
function bindEvents() {
  const _0x27e65f = getElement(ELEMENT_IDS.enabledGroup);
  if (_0x27e65f && !_0x27e65f.__completionSoundBound) {
    _0x27e65f.__completionSoundBound = true;
    _0x27e65f.querySelectorAll(".cursor-size-btn").forEach(_0x2f1144 => {
      _0x2f1144.addEventListener("click", async () => {
        const _0xf916e7 = _0x2f1144.dataset.completionSoundEnabled === "on";
        const _0xacb6da = normalizeCompletionSoundSettings({
          ...currentSettings,
          enabled: _0xf916e7
        });
        renderSettings(_0xacb6da);
        await saveCompletionSoundSettings(_0xacb6da, {
          silent: true
        });
      });
    });
  }
  const _0x5ced7d = getElement(ELEMENT_IDS.notificationEnabledGroup);
  if (_0x5ced7d && !_0x5ced7d.__completionSoundBound) {
    _0x5ced7d.__completionSoundBound = true;
    _0x5ced7d.querySelectorAll(".cursor-size-btn").forEach(_0x2a7fed => {
      _0x2a7fed.addEventListener("click", async () => {
        const _0x473b7a = _0x2a7fed.dataset.completionNotificationEnabled === "on";
        const _0x7cb350 = normalizeCompletionSoundSettings({
          ...currentSettings,
          notificationEnabled: _0x473b7a
        });
        renderSettings(_0x7cb350);
        await saveCompletionSoundSettings(_0x7cb350, {
          silent: true
        });
      });
    });
  }
  const _0x42b265 = getElement(ELEMENT_IDS.volumeSlider);
  if (_0x42b265 && !_0x42b265.__completionSoundBound) {
    _0x42b265.__completionSoundBound = true;
    _0x42b265.addEventListener("input", () => {
      const _0x5484e6 = clampVolumePercent(_0x42b265.value);
      const _0x423ef7 = getElement(ELEMENT_IDS.volumeValue);
      if (_0x423ef7) {
        _0x423ef7.textContent = _0x5484e6 + "%";
      }
    });
    _0x42b265.addEventListener("change", async () => {
      await saveCompletionSoundSettings(readSettingsFromControls(), {
        silent: true
      });
    });
  }
  const _0x279b12 = getElement(ELEMENT_IDS.fileSelect);
  if (_0x279b12 && !_0x279b12.__completionSoundBound) {
    _0x279b12.__completionSoundBound = true;
    _0x279b12.addEventListener("change", async () => {
      await saveCompletionSoundSettings(readSettingsFromControls(), {
        silent: true
      });
    });
  }
  const _0x260c74 = getElement(ELEMENT_IDS.fileTrigger);
  const _0x459328 = getElement(ELEMENT_IDS.fileMenu);
  if (_0x260c74 && _0x459328 && !_0x260c74.__completionSoundBound) {
    _0x260c74.__completionSoundBound = true;
    _0x260c74.addEventListener("click", () => {
      setFileMenuOpen(!isFileMenuOpen(), {
        focusMenu: true
      });
    });
    _0x260c74.addEventListener("keydown", _0x313d08 => {
      if (_0x313d08.key === "ArrowDown" || _0x313d08.key === "Enter" || _0x313d08.key === " ") {
        _0x313d08.preventDefault?.();
        setFileMenuOpen(true, {
          focusMenu: true
        });
      }
    });
    _0x459328.addEventListener("click", _0x5448f5 => {
      const _0x4bb29e = _0x5448f5.target?.closest?.(".settings-preset-option");
      if (!_0x4bb29e || _0x4bb29e.disabled) {
        return;
      }
      selectCompletionSoundFile(_0x4bb29e.dataset.value);
    });
    _0x459328.addEventListener("keydown", _0x543e03 => {
      if (_0x543e03.key === "Escape") {
        _0x543e03.preventDefault?.();
        setFileMenuOpen(false, {
          focusTrigger: true
        });
      } else if (_0x543e03.key === "Enter" || _0x543e03.key === " ") {
        _0x543e03.preventDefault?.();
        const _0xb41026 = document.activeElement?.closest?.(".settings-preset-option");
        if (_0xb41026 && !_0xb41026.disabled) {
          selectCompletionSoundFile(_0xb41026.dataset.value);
        }
      }
    });
    if (typeof document.addEventListener === "function") {
      document.addEventListener("pointerdown", _0x535c30 => {
        if (!isFileMenuOpen()) {
          return;
        }
        const _0x1d4341 = getElement(ELEMENT_IDS.fileControl);
        if (typeof _0x1d4341?.contains === "function" && _0x1d4341.contains(_0x535c30.target)) {
          return;
        }
        setFileMenuOpen(false);
      });
    }
  }
  getElement(ELEMENT_IDS.openFolderButton)?.addEventListener("click", async () => {
    if (!desktopBridge.notificationSound.isAvailable()) {
      showError(completionSoundText("openFolderUnsupported"));
      return;
    }
    try {
      await desktopBridge.notificationSound.openSystemSoundFolder();
    } catch (_0x33366f) {
      showError(completionSoundText("openFolderFailed", {
        error: _0x33366f?.message || completionSoundText("unknownError")
      }));
    }
  });
  getElement(ELEMENT_IDS.refreshButton)?.addEventListener("click", () => {
    loadSystemSoundFiles({
      saveSelected: true
    });
  });
  getElement(ELEMENT_IDS.previewButton)?.addEventListener("click", async () => {
    await previewCompletionSound(readSettingsFromControls());
  });
}
export function initCompletionSoundSettings() {
  if (!getElement(ELEMENT_IDS.enabledGroup)) {
    return;
  }
  bindEvents();
  renderSettings(COMPLETION_SOUND_DEFAULTS);
  renderFileOptions([], BUILT_IN_COMPLETION_SOUND_PATH);
  fetchUserSettingsFromServer().then(async _0x429ffb => {
    currentUserSettings = _0x429ffb || {};
    renderSettings(_0x429ffb?.completionSound || COMPLETION_SOUND_DEFAULTS);
    await loadSystemSoundFiles({
      saveSelected: false
    });
  }).catch(_0x1635b8 => {
    console.error("[completionSoundSettings] load failed:", _0x1635b8);
    showError(completionSoundText("loadFailed"));
  });
}
export const __completionSoundSettingsForTest = {
  renderSettings: renderSettings,
  renderFileOptions: renderFileOptions,
  readSettingsFromControls: readSettingsFromControls,
  getCurrentSettings: () => currentSettings,
  getCurrentFiles: () => currentFiles,
  selectFilePathFromList: selectFilePathFromList
};