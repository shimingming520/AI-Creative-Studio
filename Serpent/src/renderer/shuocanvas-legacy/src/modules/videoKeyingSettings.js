import a1447_0x4ffba5 from "../core/stores/appStore.js";
import { resolveRunningHubWorkflowAccess } from "../../api/configApi.js";
import { normalizeRunningHubInstanceType } from "./runningHubInstanceTypes.js";
const RH_KEYING_FPS_OPTIONS = Object.freeze([16, 24, 30]);
export const RH_DEFAULT_KEYING_FPS = 24;
export const RH_DEFAULT_KEYING_RESOLUTION = 1024;
export const RH_DEFAULT_KEYING_MASK_MODE = "Sec";
export const RH_DEFAULT_INSTANCE_TYPE = "default";
const SOURCE_VIDEO_KEYING_MEMORY_KEY = "source-video";
export function getRhKeyingFpsOptions() {
  return RH_KEYING_FPS_OPTIONS;
}
export function hasUsableKeyingSettingValue(_0x357d49) {
  if (_0x357d49 === null || _0x357d49 === undefined) {
    return false;
  }
  if (typeof _0x357d49 === "string") {
    return _0x357d49.trim().length > 0;
  }
  if (typeof _0x357d49 === "number") {
    return Number.isFinite(_0x357d49);
  }
  return true;
}
export function normalizeRhKeyingFps(_0x6206a6) {
  const _0x59a9c8 = Number(_0x6206a6);
  if (getRhKeyingFpsOptions().includes(_0x59a9c8)) {
    return _0x59a9c8;
  } else {
    return RH_DEFAULT_KEYING_FPS;
  }
}
export function resolveSourceVideoKeyingSetting(_0xf9d4bb, _0x12b380, _0x5d60ea) {
  const _0xe39e5c = _0xf9d4bb?.[_0x12b380];
  if (hasUsableKeyingSettingValue(_0xe39e5c)) {
    return _0xe39e5c;
  }
  const _0xde99a4 = a1447_0x4ffba5.getFeatureSelection?.(SOURCE_VIDEO_KEYING_MEMORY_KEY, _0x12b380, undefined);
  if (hasUsableKeyingSettingValue(_0xde99a4)) {
    return _0xde99a4;
  } else {
    return _0x5d60ea;
  }
}
export function normalizeRhKeyingResolution(_0x342ac8) {
  const _0x5b3193 = Number(_0x342ac8);
  if (Number.isFinite(_0x5b3193)) {
    return Math.trunc(_0x5b3193);
  } else {
    return RH_DEFAULT_KEYING_RESOLUTION;
  }
}
export function normalizeRhInstanceType(_0x5cfded) {
  return normalizeRunningHubInstanceType(_0x5cfded);
}
export async function getRunningHubWorkflowApiKey() {
  return (await getRunningHubWorkflowAccess()).apiKey;
}
export async function getRunningHubWorkflowAccess(_0x3a9eb1 = "") {
  return resolveRunningHubWorkflowAccess(_0x3a9eb1);
}