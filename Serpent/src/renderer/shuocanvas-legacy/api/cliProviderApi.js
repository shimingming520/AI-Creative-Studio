import { get, post } from "./apiBase.js";
export const CLI_PROVIDER_STATUS_CHANGED_EVENT = "aicanvas:cli-provider-status-changed";
let cliProviderStatusesCache = null;
function cloneStatuses(_0x3370a0) {
  if (!_0x3370a0 || typeof _0x3370a0 !== "object" || Array.isArray(_0x3370a0)) {
    return null;
  }
  return JSON.parse(JSON.stringify(_0x3370a0));
}
function notifyCliProviderStatusChanged() {
  const _0x5269a5 = globalThis.window;
  if (!_0x5269a5 || typeof _0x5269a5.dispatchEvent !== "function") {
    return;
  }
  const _0xba60d5 = typeof globalThis.CustomEvent === "function" ? new globalThis.CustomEvent(CLI_PROVIDER_STATUS_CHANGED_EVENT) : {
    type: CLI_PROVIDER_STATUS_CHANGED_EVENT
  };
  _0x5269a5.dispatchEvent(_0xba60d5);
}
function rememberCliProviderStatuses(_0x2a383a) {
  const _0x5efebb = cloneStatuses(_0x2a383a);
  if (!_0x5efebb) {
    return _0x2a383a;
  }
  cliProviderStatusesCache = _0x5efebb;
  notifyCliProviderStatusChanged();
  return _0x2a383a;
}
function normalizeCliProvider(_0x160474) {
  const _0xbb08c2 = String(_0x160474 || "").trim().toLowerCase();
  if (!_0xbb08c2) {
    throw new TypeError("CLI provider 不能为空");
  }
  return encodeURIComponent(_0xbb08c2);
}
function unwrapCliProviderResult(_0x5e30e1, _0x42f4ea) {
  if (!_0x5e30e1.success) {
    throw new Error(_0x5e30e1.error || _0x42f4ea);
  }
  return _0x5e30e1.data || {};
}
export async function fetchCliProviderStatuses() {
  const _0x284cdd = await get("/api/v2/cli-providers/status");
  return rememberCliProviderStatuses(unwrapCliProviderResult(_0x284cdd, "获取 CLI Provider 状态失败"));
}
export function getCachedCliProviderStatus(_0x4a6999) {
  const _0x55879b = String(_0x4a6999 || "").trim().toLowerCase();
  if (!_0x55879b || !cliProviderStatusesCache) {
    return null;
  }
  const _0x483e8b = cliProviderStatusesCache.providers;
  const _0x4c6123 = _0x483e8b && typeof _0x483e8b === "object" && !Array.isArray(_0x483e8b) ? _0x483e8b[_0x55879b] : cliProviderStatusesCache[_0x55879b];
  if (_0x4c6123 && typeof _0x4c6123 === "object" && !Array.isArray(_0x4c6123)) {
    return {
      ..._0x4c6123
    };
  } else {
    return null;
  }
}
export function _resetCliProviderStatusesCacheForTests() {
  cliProviderStatusesCache = null;
}
export async function startCliProviderLogin(_0x1d7fb7) {
  const _0x1c837a = normalizeCliProvider(_0x1d7fb7);
  const _0x242319 = await post("/api/v2/cli-providers/" + _0x1c837a + "/login", {});
  return unwrapCliProviderResult(_0x242319, "发起 CLI Provider 登录失败");
}
export async function logoutCliProvider(_0xcbbf78) {
  const _0x4a527b = normalizeCliProvider(_0xcbbf78);
  const _0x390996 = await post("/api/v2/cli-providers/" + _0x4a527b + "/logout", {});
  return unwrapCliProviderResult(_0x390996, "退出 CLI Provider 登录失败");
}
export async function generateTextWithCliProvider(_0x229704) {
  const _0x11973f = Number(_0x229704?.timeoutMs);
  const _0xbffb04 = _0x229704?.disableRequestTimeout === true ? null : Number.isFinite(_0x11973f) && _0x11973f > 0 ? Math.max(30000, Math.trunc(_0x11973f) + 5000) : undefined;
  const _0x4b8f46 = await post("/api/v2/cli-providers/generate-text", _0x229704 || {}, _0xbffb04);
  return unwrapCliProviderResult(_0x4b8f46, "CLI Provider 文本生成失败");
}
export async function generateImageWithCliProvider(_0x5c1183) {
  const _0x79002f = Number(_0x5c1183?.timeoutMs);
  const _0x14e761 = Number.isFinite(_0x79002f) && _0x79002f > 0 ? Math.max(30000, Math.trunc(_0x79002f) + 5000) : undefined;
  const _0x19297f = await post("/api/v2/cli-providers/generate-image", _0x5c1183 || {}, _0x14e761);
  return unwrapCliProviderResult(_0x19297f, "OpenAI CLI 图像生成失败");
}