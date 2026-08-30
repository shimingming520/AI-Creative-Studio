import { getApiConfigSnapshot, getProviderConfig, saveApiConfigToServer } from "../../api/configApi.js";
import { testProviderConnection } from "../../api/providerConnectionTestApi.js";
import { mergePassedProviderApiConfig, shouldPersistProviderConnectionResult } from "./providerConnectionVerification.js";
const AUTO_VERIFICATION_REQUESTS = new Map();
function normalizeText(_0x236d1b) {
  return String(_0x236d1b || "").trim();
}
function getVerificationRequestKey(_0x1ae0a9 = {}) {
  const _0x2b6cef = normalizeText(_0x1ae0a9.configProviderId || _0x1ae0a9.providerId).toLowerCase();
  const _0x4cd1cb = normalizeText(_0x1ae0a9.authorizationCapability);
  if (_0x4cd1cb) {
    return _0x2b6cef + ":" + _0x4cd1cb;
  } else {
    return _0x2b6cef;
  }
}
function getProviderTestOptions(_0x5e03b0 = {}) {
  const _0x4aecb2 = normalizeText(_0x5e03b0.authorizationCapability);
  if (!_0x4aecb2) {
    return {};
  }
  return {
    probeCapabilities: [_0x4aecb2],
    requiredCapabilities: [_0x4aecb2]
  };
}
export function getProviderConnectionFailureDetail(_0xedd9bf = {}) {
  return normalizeText(_0xedd9bf.suggestion || _0xedd9bf.summary || _0xedd9bf.error || _0xedd9bf.detail || "API 连接验证未通过");
}
export async function verifyProviderConnectionOnce(_0x362f59 = {}, _0x45f98c = {}) {
  const _0x13685a = _0x45f98c.getProviderConfig || getProviderConfig;
  const _0x89560e = _0x45f98c.getApiConfigSnapshot || getApiConfigSnapshot;
  const _0x367a8b = _0x45f98c.testProviderConnection || testProviderConnection;
  const _0x1fb6df = _0x45f98c.saveApiConfigToServer || saveApiConfigToServer;
  const _0x5c1ce6 = normalizeText(_0x362f59.configProviderId || _0x362f59.providerId).toLowerCase();
  if (!_0x5c1ce6) {
    return {
      ok: false,
      error: "无法确定需要验证的 API 服务"
    };
  }
  const _0x21ee91 = _0x13685a(_0x5c1ce6) || {};
  const _0x50ad0d = await _0x367a8b(_0x5c1ce6, _0x21ee91, getProviderTestOptions(_0x362f59));
  if (!shouldPersistProviderConnectionResult(_0x5c1ce6, _0x50ad0d)) {
    return _0x50ad0d;
  }
  const _0x35e938 = _0x89560e();
  const _0x478c3a = mergePassedProviderApiConfig(_0x35e938, _0x35e938, [_0x5c1ce6], new Map(), {
    providerResults: {
      [_0x5c1ce6]: _0x50ad0d
    }
  });
  await _0x1fb6df(_0x478c3a);
  return _0x50ad0d;
}
export function autoVerifyProviderConnection(_0xc3998 = {}) {
  const _0x499492 = getVerificationRequestKey(_0xc3998);
  if (!_0x499492) {
    return Promise.resolve({
      ok: false,
      error: "无法确定需要验证的 API 服务"
    });
  }
  const _0x3e894a = AUTO_VERIFICATION_REQUESTS.get(_0x499492);
  if (_0x3e894a) {
    return _0x3e894a;
  }
  const _0x52c58a = verifyProviderConnectionOnce(_0xc3998).finally(() => {
    if (AUTO_VERIFICATION_REQUESTS.get(_0x499492) === _0x52c58a) {
      AUTO_VERIFICATION_REQUESTS.delete(_0x499492);
    }
  });
  AUTO_VERIFICATION_REQUESTS.set(_0x499492, _0x52c58a);
  return _0x52c58a;
}