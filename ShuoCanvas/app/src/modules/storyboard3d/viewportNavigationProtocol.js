import { DEFAULT_STORYBOARD_3D_NAVIGATION_PRESET, STORYBOARD_3D_NAVIGATION_PRESETS, resolveStoryboard3DToolFromShortcut } from "./viewportNavigationSettings.js";
export const STORYBOARD_3D_NAVIGATION_MODE = Object.freeze({
  ORBIT: "orbit",
  PAN: "pan",
  DOLLY: "dolly",
  FLY_LOOK: "fly-look"
});
export function resolveStoryboard3DNavigationMode(_0x1f609c = {}, {
  flyMode = false,
  preset = DEFAULT_STORYBOARD_3D_NAVIGATION_PRESET
} = {}) {
  const _0x354e42 = Number(_0x1f609c.button);
  const _0x286ca3 = _0x1f609c.altKey === true;
  const _0x131217 = _0x1f609c.shiftKey === true;
  const _0x2edb76 = _0x1f609c.ctrlKey === true || _0x1f609c.metaKey === true;
  const _0x13184b = STORYBOARD_3D_NAVIGATION_PRESETS[preset] ? preset : DEFAULT_STORYBOARD_3D_NAVIGATION_PRESET;
  if (flyMode && _0x354e42 === 2) {
    return STORYBOARD_3D_NAVIGATION_MODE.FLY_LOOK;
  }
  if (_0x13184b === "blender") {
    if (_0x354e42 !== 1) {
      return null;
    }
    if (_0x2edb76) {
      return STORYBOARD_3D_NAVIGATION_MODE.DOLLY;
    }
    if (_0x131217) {
      return STORYBOARD_3D_NAVIGATION_MODE.PAN;
    }
    return STORYBOARD_3D_NAVIGATION_MODE.ORBIT;
  }
  if (_0x13184b === "unity") {
    if (_0x354e42 === 1) {
      return STORYBOARD_3D_NAVIGATION_MODE.PAN;
    }
    if (_0x286ca3 && _0x354e42 === 0) {
      return STORYBOARD_3D_NAVIGATION_MODE.ORBIT;
    }
    if (_0x286ca3 && _0x354e42 === 2) {
      return STORYBOARD_3D_NAVIGATION_MODE.DOLLY;
    }
    return null;
  }
  if (!_0x286ca3) {
    return null;
  }
  if (_0x354e42 === 0) {
    return STORYBOARD_3D_NAVIGATION_MODE.ORBIT;
  }
  if (_0x354e42 === 1) {
    return STORYBOARD_3D_NAVIGATION_MODE.PAN;
  }
  if (_0x354e42 === 2) {
    return STORYBOARD_3D_NAVIGATION_MODE.DOLLY;
  }
  return null;
}
export function getStoryboard3DNavigationHelpText({
  flyMode = false,
  preset = DEFAULT_STORYBOARD_3D_NAVIGATION_PRESET
} = {}) {
  if (flyMode) {
    return "飞行模式 · WASD / Q E / 右键观察 / Shift 加速";
  } else {
    return STORYBOARD_3D_NAVIGATION_PRESETS[preset]?.summary || STORYBOARD_3D_NAVIGATION_PRESETS[DEFAULT_STORYBOARD_3D_NAVIGATION_PRESET].summary;
  }
}
export function resolveStoryboard3DNavigationTool(_0x10d72c = {}, {
  preset = DEFAULT_STORYBOARD_3D_NAVIGATION_PRESET
} = {}) {
  if (_0x10d72c.altKey || _0x10d72c.ctrlKey || _0x10d72c.metaKey || _0x10d72c.shiftKey) {
    return null;
  }
  return resolveStoryboard3DToolFromShortcut(_0x10d72c.key, preset);
}