import { buildApiUrl, get, post, request } from "./apiBase.js";
export const DREAMINA_CLI_STATUS_CHANGED_EVENT = "aicanvas:dreamina-cli-status-changed";
let dreaminaCliStatusCache = null;
function notifyDreaminaCliStatusChanged() {
  const _0x469c16 = globalThis.window;
  if (!_0x469c16 || typeof _0x469c16.dispatchEvent !== "function") {
    return;
  }
  const _0x682e55 = typeof globalThis.CustomEvent === "function" ? new globalThis.CustomEvent(DREAMINA_CLI_STATUS_CHANGED_EVENT) : {
    type: DREAMINA_CLI_STATUS_CHANGED_EVENT
  };
  _0x469c16.dispatchEvent(_0x682e55);
}
function rememberDreaminaCliStatus(_0x588be6) {
  if (!_0x588be6 || typeof _0x588be6 !== "object" || Array.isArray(_0x588be6)) {
    return _0x588be6;
  }
  if (!Object.prototype.hasOwnProperty.call(_0x588be6, "loggedIn") && !Object.prototype.hasOwnProperty.call(_0x588be6, "installed")) {
    return _0x588be6;
  }
  dreaminaCliStatusCache = {
    ..._0x588be6
  };
  notifyDreaminaCliStatusChanged();
  return _0x588be6;
}
function rememberDreaminaStatusFromPayload(_0x2d10c7) {
  rememberDreaminaCliStatus(_0x2d10c7?.status);
  return _0x2d10c7;
}
function rememberDreaminaLoginRuntime(_0x34927a) {
  const _0x5a1b95 = String(_0x34927a?.phase || "").trim().toLowerCase();
  if (["success", "reused", "done"].includes(_0x5a1b95)) {
    dreaminaCliStatusCache = {
      ...(dreaminaCliStatusCache || {}),
      loggedIn: true,
      runtime: _0x34927a && typeof _0x34927a === "object" ? {
        ..._0x34927a
      } : _0x34927a
    };
    notifyDreaminaCliStatusChanged();
  }
  return _0x34927a;
}
export function getCachedDreaminaCliStatus() {
  if (dreaminaCliStatusCache) {
    return {
      ...dreaminaCliStatusCache
    };
  } else {
    return null;
  }
}
export function _resetDreaminaCliStatusCacheForTests() {
  dreaminaCliStatusCache = null;
}
export async function fetchDreaminaCliStatusFromServer(_0x5347fc = {}) {
  const _0x1729c4 = _0x5347fc?.refresh ? "?refresh=1" : "";
  const _0x58a888 = await get("/api/v2/dreamina/status" + _0x1729c4);
  if (!_0x58a888.success) {
    throw new Error(_0x58a888.error || "获取 Dreamina CLI 状态失败");
  }
  return rememberDreaminaCliStatus(_0x58a888.data || {});
}
export async function fetchDreaminaCliLoginRuntimeFromServer() {
  const _0x144ad1 = await request("/api/v2/dreamina/login/runtime", {
    method: "GET",
    cache: "no-store"
  });
  if (!_0x144ad1.success) {
    throw new Error(_0x144ad1.error || "获取 Dreamina 登录运行态失败");
  }
  return rememberDreaminaLoginRuntime(_0x144ad1.data || {});
}
export async function startDreaminaHeadlessLoginFromServer() {
  const _0x14a7f6 = await post("/api/v2/dreamina/login", {
    mode: "headless"
  });
  if (!_0x14a7f6.success) {
    throw new Error(_0x14a7f6.error || "发起 Dreamina headless 登录失败");
  }
  return rememberDreaminaStatusFromPayload(_0x14a7f6.data || {});
}
export async function startDreaminaHeadlessReloginFromServer() {
  const _0x2c2535 = await post("/api/v2/dreamina/relogin", {
    mode: "headless"
  });
  if (!_0x2c2535.success) {
    throw new Error(_0x2c2535.error || "发起 Dreamina headless 重新登录失败");
  }
  return rememberDreaminaStatusFromPayload(_0x2c2535.data || {});
}
export async function startDreaminaWebLoginFromServer(_0xa2306c = {}) {
  const _0x318316 = await post("/api/v2/dreamina/login/web", {
    mode: "web",
    force: !!_0xa2306c?.force
  });
  if (!_0x318316.success) {
    throw new Error(_0x318316.error || "发起 Dreamina OAuth 登录失败");
  }
  return rememberDreaminaStatusFromPayload(_0x318316.data || {});
}
export async function importDreaminaLoginResponseFromServer(_0x2b15e5) {
  const _0xcbf0c1 = await post("/api/v2/dreamina/login/import", {
    loginResponse: _0x2b15e5
  });
  if (!_0xcbf0c1.success) {
    throw new Error(_0xcbf0c1.error || "导入 Dreamina 登录态失败");
  }
  return rememberDreaminaStatusFromPayload(_0xcbf0c1.data || {});
}
export async function logoutDreaminaFromServer() {
  const _0x165968 = await post("/api/v2/dreamina/logout", {});
  if (!_0x165968.success) {
    throw new Error(_0x165968.error || "退出 Dreamina 登录失败");
  }
  return rememberDreaminaStatusFromPayload(_0x165968.data || {});
}
export function buildDreaminaQrImageUrl(_0x57a9cd = 0) {
  const _0x398515 = _0x57a9cd ? "?v=" + encodeURIComponent(String(_0x57a9cd)) : "";
  return buildApiUrl("/api/v2/dreamina/login/qr" + _0x398515);
}