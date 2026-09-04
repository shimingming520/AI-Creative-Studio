import { fetchUserSettingsFromServer } from "../../api/userSettingsApi.js";
import { t } from "../i18n/index.js";
import { desktopBridge } from "./desktopBridge.js";
export const BUILT_IN_COMPLETION_SOUND_PATH = "assets/sounds/notify.mp3";
export const COMPLETION_SOUND_DEFAULTS = Object.freeze({
  enabled: true,
  notificationEnabled: true,
  volume: 0.7,
  builtInPath: BUILT_IN_COMPLETION_SOUND_PATH,
  selectedFilePath: BUILT_IN_COMPLETION_SOUND_PATH,
  updatedAt: 0
});
let cachedSettings = null;
let hasReportedPlaybackFailure = false;
let audioFactory = _0x401a0b => new Audio(_0x401a0b);
function normalizeText(_0x1ac4c5) {
  return String(_0x1ac4c5 || "").trim();
}
function normalizePathKey(_0x410328) {
  return normalizeText(_0x410328).replace(/\\/g, "/").toLowerCase();
}
function clampVolume(_0x1454bd) {
  const _0x4fec83 = Number(_0x1454bd);
  if (!Number.isFinite(_0x4fec83)) {
    return COMPLETION_SOUND_DEFAULTS.volume;
  }
  return Math.max(0, Math.min(1, _0x4fec83));
}
export function normalizeCompletionSoundSettings(_0x185edb = {}) {
  const _0x3b5a31 = _0x185edb && typeof _0x185edb === "object" && !Array.isArray(_0x185edb) ? _0x185edb : {};
  const _0x4213c4 = normalizeText(_0x3b5a31.selectedFilePath) || normalizeText(_0x3b5a31.customFilePath) || normalizeText(_0x3b5a31.builtInPath) || BUILT_IN_COMPLETION_SOUND_PATH;
  return {
    enabled: _0x3b5a31.enabled !== false,
    notificationEnabled: _0x3b5a31.notificationEnabled !== false,
    volume: clampVolume(_0x3b5a31.volume),
    builtInPath: normalizeText(_0x3b5a31.builtInPath) || BUILT_IN_COMPLETION_SOUND_PATH,
    selectedFilePath: _0x4213c4,
    updatedAt: Number(_0x3b5a31.updatedAt || 0) || 0
  };
}
export function setCompletionSoundSettingsCache(_0x202465) {
  cachedSettings = normalizeCompletionSoundSettings(_0x202465);
  return cachedSettings;
}
export function clearCompletionSoundSettingsCache() {
  cachedSettings = null;
  hasReportedPlaybackFailure = false;
}
export async function loadCompletionSoundSettings({
  force = false
} = {}) {
  if (cachedSettings && !force) {
    return cachedSettings;
  }
  try {
    const _0x44cc6e = await fetchUserSettingsFromServer();
    return setCompletionSoundSettingsCache(_0x44cc6e?.completionSound || {});
  } catch (_0x39f3f8) {
    console.warn("[completionSound] load settings failed:", _0x39f3f8);
    return setCompletionSoundSettingsCache(COMPLETION_SOUND_DEFAULTS);
  }
}
async function resolveHttpCompatSystemSoundUrl(_0x26a0b3) {
  if (!isDesktopHttpShimRuntime() || !desktopBridge.notificationSound.isAvailable()) {
    return "";
  }
  const _0x2af995 = await desktopBridge.notificationSound.listSystemSounds();
  const _0x1439d3 = normalizePathKey(_0x26a0b3);
  const _0x1a6e61 = (Array.isArray(_0x2af995?.files) ? _0x2af995.files : []).find(_0x3b0cb9 => normalizePathKey(_0x3b0cb9?.path) === _0x1439d3);
  return normalizeText(_0x1a6e61?.playbackUrl);
}
async function resolvePlaybackUrl(_0x5ac754) {
  const _0x4a4185 = normalizeCompletionSoundSettings(_0x5ac754);
  const _0x50f815 = normalizeText(_0x4a4185.selectedFilePath) || _0x4a4185.builtInPath;
  if (!_0x50f815) {
    return "";
  }
  if (!/^(?:[a-zA-Z]:[\\/]|\\\\|\/)/.test(_0x50f815)) {
    return _0x50f815;
  }
  if (isDesktopHttpShimRuntime()) {
    const _0x499f5 = await resolveHttpCompatSystemSoundUrl(_0x50f815);
    if (_0x499f5) {
      return _0x499f5;
    }
    throw new Error("System completion sound is unavailable to the browser runtime");
  }
  if (!desktopBridge.mediaPreview.isAvailable()) {
    return _0x50f815;
  }
  const _0x5a0334 = await desktopBridge.mediaPreview.getLocalPreviewUrl({
    path: _0x50f815,
    type: "audio/mpeg"
  });
  return normalizeText(_0x5a0334?.url || _0x5a0334);
}
function getNotificationSoundPlayer() {
  if (desktopBridge.notificationSound.isAvailable()) {
    return _0x322413 => desktopBridge.notificationSound.play(_0x322413);
  } else {
    return null;
  }
}
function isDesktopHttpShimRuntime() {
  return desktopBridge.usesHttpCompat;
}
async function playNativeCompletionSound(_0x4a0374) {
  const _0x106f78 = getNotificationSoundPlayer();
  if (typeof _0x106f78 !== "function") {
    return {
      ok: false,
      skipped: "unavailable"
    };
  }
  const _0xa57c71 = normalizeCompletionSoundSettings(_0x4a0374);
  const _0x39716a = normalizeText(_0xa57c71.selectedFilePath) || _0xa57c71.builtInPath;
  if (!_0x39716a) {
    return {
      ok: false,
      skipped: "missing-file"
    };
  }
  const _0x575a39 = await _0x106f78({
    filePath: _0x39716a,
    volume: _0xa57c71.volume,
    reason: "generation-success"
  });
  if (_0x575a39?.success === false) {
    return {
      ok: false,
      skipped: _0x575a39.reason || "native-failed",
      result: _0x575a39
    };
  }
  return {
    ok: true,
    native: true,
    result: _0x575a39
  };
}
async function playResolvedSound(_0x4dd03d) {
  const _0x3c8041 = normalizeCompletionSoundSettings(_0x4dd03d);
  if (_0x3c8041.enabled === false) {
    return {
      ok: false,
      skipped: "disabled"
    };
  }
  const _0x444680 = isDesktopHttpShimRuntime();
  if (_0x444680) {
    let _0x48f87a = null;
    try {
      const _0xed5179 = await playNativeCompletionSound(_0x3c8041);
      if (_0xed5179.ok) {
        return _0xed5179;
      }
      _0x48f87a = _0xed5179.result || _0xed5179;
    } catch (_0x3fd1fe) {
      _0x48f87a = _0x3fd1fe;
    }
    console.warn("[completionSound] native playback failed; falling back to browser audio:", _0x48f87a);
  }
  if (typeof audioFactory !== "function") {
    return {
      ok: false,
      skipped: "no-audio-factory"
    };
  }
  const _0x4173f6 = await resolvePlaybackUrl(_0x3c8041);
  if (!_0x4173f6) {
    return {
      ok: false,
      skipped: "missing-url"
    };
  }
  const _0x11d2f7 = audioFactory(_0x4173f6);
  if (!_0x11d2f7) {
    return {
      ok: false,
      skipped: "missing-audio"
    };
  }
  _0x11d2f7.volume = _0x3c8041.volume;
  try {
    const _0x5cb9cc = _0x11d2f7.play?.();
    if (_0x5cb9cc && typeof _0x5cb9cc.then === "function") {
      await _0x5cb9cc;
    }
  } catch (_0x554839) {
    if (!_0x444680) {
      try {
        const _0x2b3f20 = await playNativeCompletionSound(_0x3c8041);
        if (_0x2b3f20.ok) {
          return _0x2b3f20;
        }
      } catch {}
    }
    throw _0x554839;
  }
  return {
    ok: true,
    url: _0x4173f6
  };
}
function reportPlaybackFailure(_0x21efdc) {
  console.warn("[completionSound] playback failed:", _0x21efdc);
  if (hasReportedPlaybackFailure) {
    return;
  }
  hasReportedPlaybackFailure = true;
  globalThis.window?.showToast?.(t("coreServices.completion.soundPlaybackFailed"), "warn");
}
export async function previewCompletionSound(_0x552f35 = null) {
  const _0x593c27 = _0x552f35 == null ? await loadCompletionSoundSettings() : normalizeCompletionSoundSettings(_0x552f35);
  try {
    return await playResolvedSound(_0x593c27);
  } catch (_0x558a39) {
    reportPlaybackFailure(_0x558a39);
    return {
      ok: false,
      error: _0x558a39
    };
  }
}
export function playCompletionSound(_0x5284f5 = "generation-success") {
  _0x5284f5;
  const _0x412171 = (async () => {
    const _0x17acac = await loadCompletionSoundSettings();
    return await playResolvedSound(_0x17acac);
  })();
  _0x412171.catch(reportPlaybackFailure);
  return _0x412171;
}
export const __completionSoundServiceForTest = {
  setAudioFactory(_0xe8e831) {
    audioFactory = _0xe8e831;
  },
  reset() {
    audioFactory = _0x4c77a0 => new Audio(_0x4c77a0);
    clearCompletionSoundSettingsCache();
  },
  resolvePlaybackUrl: resolvePlaybackUrl
};