const BACKGROUND_THROTTLE_SWITCHES = Object.freeze(["disable-background-timer-throttling", "disable-renderer-backgrounding", "disable-backgrounding-occluded-windows"]);
const DISABLED_BACKGROUND_FEATURES = "CalculateNativeWinOcclusion,IntensiveWakeUpThrottling,UseEcoQoSForBackgroundProcess";
const MEDIA_ACCELERATION_ENV = "AIC_ELECTRON_MEDIA_ACCELERATION";
const CANVAS_ACCELERATION_ENV = "AIC_ELECTRON_CANVAS_ACCELERATION";
const DISABLE_RENDERER_ACCESSIBILITY_ENV = "AIC_ELECTRON_DISABLE_RENDERER_ACCESSIBILITY";
const MEDIA_ACCELERATION_DISABLE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled", "default", "system"]);
const MEDIA_ACCELERATION_ENABLE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled", "media", "balanced"]);
const WINDOWS_MEDIA_ACCELERATION_SWITCHES = Object.freeze([["autoplay-policy", "no-user-gesture-required"], ["ignore-gpu-blocklist", ""]]);
const WINDOWS_CANVAS_ACCELERATION_SWITCHES = Object.freeze([["ignore-gpu-blocklist", ""], ["enable-gpu-rasterization", ""], ["force-gpu-rasterization", ""], ["enable-zero-copy", ""], ["use-angle", "d3d11"]]);
function readEnvToggle(_0x37b950, _0x569075) {
  return String(_0x37b950?.[_0x569075] || "").trim().toLowerCase();
}
function shouldInstallMediaAccelerationProfile(_0x2399db = process.env, _0xf301e2 = process.platform) {
  const _0x5def37 = readEnvToggle(_0x2399db, MEDIA_ACCELERATION_ENV);
  if (MEDIA_ACCELERATION_DISABLE_VALUES.has(_0x5def37)) {
    return false;
  }
  if (MEDIA_ACCELERATION_ENABLE_VALUES.has(_0x5def37)) {
    return true;
  }
  if (_0x5def37) {
    return true;
  }
  return false;
}
function shouldInstallCanvasAccelerationProfile(_0x255c91 = process.env, _0x209f68 = process.platform) {
  const _0x105bf5 = readEnvToggle(_0x255c91, CANVAS_ACCELERATION_ENV);
  if (MEDIA_ACCELERATION_DISABLE_VALUES.has(_0x105bf5)) {
    return false;
  }
  if (MEDIA_ACCELERATION_ENABLE_VALUES.has(_0x105bf5)) {
    return _0x209f68 === "win32";
  }
  if (_0x105bf5) {
    return _0x209f68 === "win32";
  }
  return _0x209f68 === "win32";
}
function shouldDisableRendererAccessibility(_0xaef0e9 = process.env) {
  const _0x4b1af4 = readEnvToggle(_0xaef0e9, DISABLE_RENDERER_ACCESSIBILITY_ENV);
  if (MEDIA_ACCELERATION_DISABLE_VALUES.has(_0x4b1af4)) {
    return false;
  }
  if (MEDIA_ACCELERATION_ENABLE_VALUES.has(_0x4b1af4)) {
    return true;
  }
  return !!_0x4b1af4;
}
function appendChromiumSwitch(_0x497876, _0x3d6fdc, _0x13c645 = "") {
  try {
    if (_0x13c645) {
      _0x497876.appendSwitch(_0x3d6fdc, _0x13c645);
    } else {
      _0x497876.appendSwitch(_0x3d6fdc);
    }
  } catch (_0x3b1386) {
    const _0x2c211 = _0x13c645 ? "=" + _0x13c645 : "";
    console.warn("[electron] failed to append Chromium switch " + _0x3d6fdc + _0x2c211 + ":", _0x3b1386);
  }
}
export function configureRendererResponsiveness(_0x4b34be) {
  const _0x5d7753 = _0x4b34be?.commandLine;
  if (!_0x5d7753?.appendSwitch) {
    return;
  }
  for (const _0x309c40 of BACKGROUND_THROTTLE_SWITCHES) {
    appendChromiumSwitch(_0x5d7753, _0x309c40);
  }
  try {
    _0x5d7753.appendSwitch("disable-features", DISABLED_BACKGROUND_FEATURES);
  } catch (_0x4a9af9) {
    console.warn("[electron] failed to disable Chromium background features:", _0x4a9af9);
  }
  if (shouldInstallCanvasAccelerationProfile(_0x4b34be?.env || process.env, _0x4b34be?.platform || process.platform)) {
    for (const [_0x4121ef, _0x4b1641] of WINDOWS_CANVAS_ACCELERATION_SWITCHES) {
      appendChromiumSwitch(_0x5d7753, _0x4121ef, _0x4b1641);
    }
  }
  if (shouldInstallMediaAccelerationProfile(_0x4b34be?.env || process.env, _0x4b34be?.platform || process.platform)) {
    for (const [_0x5bb3fc, _0x1334b1] of WINDOWS_MEDIA_ACCELERATION_SWITCHES) {
      appendChromiumSwitch(_0x5d7753, _0x5bb3fc, _0x1334b1);
    }
  }
  if (shouldDisableRendererAccessibility(_0x4b34be?.env || process.env)) {
    appendChromiumSwitch(_0x5d7753, "disable-renderer-accessibility");
  }
}
export const __rendererResponsivenessForTest = {
  BACKGROUND_THROTTLE_SWITCHES: BACKGROUND_THROTTLE_SWITCHES,
  CANVAS_ACCELERATION_ENV: CANVAS_ACCELERATION_ENV,
  DISABLED_BACKGROUND_FEATURES: DISABLED_BACKGROUND_FEATURES,
  DISABLE_RENDERER_ACCESSIBILITY_ENV: DISABLE_RENDERER_ACCESSIBILITY_ENV,
  MEDIA_ACCELERATION_ENV: MEDIA_ACCELERATION_ENV,
  WINDOWS_CANVAS_ACCELERATION_SWITCHES: WINDOWS_CANVAS_ACCELERATION_SWITCHES,
  WINDOWS_MEDIA_ACCELERATION_SWITCHES: WINDOWS_MEDIA_ACCELERATION_SWITCHES,
  shouldInstallCanvasAccelerationProfile: shouldInstallCanvasAccelerationProfile,
  shouldDisableRendererAccessibility: shouldDisableRendererAccessibility,
  shouldInstallMediaAccelerationProfile: shouldInstallMediaAccelerationProfile
};