import { existsSync, readFileSync } from "node:fs";
import a221_0x5112c0 from "node:path";
function firstNonEmptyText(..._0x497062) {
  for (const _0xc09e2a of _0x497062) {
    if (_0xc09e2a == null) {
      continue;
    }
    const _0x2a5f12 = String(_0xc09e2a).trim();
    if (_0x2a5f12) {
      return _0x2a5f12;
    }
  }
  return "";
}
function readJsonObjectFileSync(_0x59ab14) {
  try {
    if (!_0x59ab14 || !existsSync(_0x59ab14)) {
      return {};
    }
    const _0x40e15c = JSON.parse(readFileSync(_0x59ab14, "utf8"));
    if (_0x40e15c && typeof _0x40e15c === "object" && !Array.isArray(_0x40e15c)) {
      return _0x40e15c;
    } else {
      return {};
    }
  } catch {
    return {};
  }
}
function readSecureProviderValue(_0x4897b6, _0x1bfc2a, _0x5483c7) {
  const _0x6d03ca = "apiConfig.providers." + _0x1bfc2a + "." + _0x5483c7;
  try {
    return String(_0x4897b6?.().getMany?.([_0x6d03ca])?.[_0x6d03ca] || "").trim();
  } catch {
    return "";
  }
}
export function createDoubaoAsrConfigResolver({
  appRoot: _0x1d1cfb,
  getSecureSettingsStore: _0x32e902,
  getUserRoot: _0x21fb6f,
  processEnv = process.env
} = {}) {
  return function _0x32ab50() {
    const _0x278e4a = a221_0x5112c0.join(_0x21fb6f?.() || "", "config.json");
    const _0x327f3c = a221_0x5112c0.join(_0x1d1cfb || "", "user", "config.json");
    const _0xc73a80 = readJsonObjectFileSync(_0x278e4a);
    const _0x9462e6 = Object.keys(_0xc73a80).length ? _0xc73a80 : readJsonObjectFileSync(_0x327f3c);
    const _0xa8d55c = _0x9462e6?.providers?.volcengine && typeof _0x9462e6.providers.volcengine === "object" ? _0x9462e6.providers.volcengine : {};
    const _0x4c2172 = _0x9462e6?.providers?.["volcengine-speech"] && typeof _0x9462e6.providers["volcengine-speech"] === "object" ? _0x9462e6.providers["volcengine-speech"] : {};
    return {
      apiKey: firstNonEmptyText(processEnv.VOLCENGINE_ASR_API_KEY, processEnv.DOUBAO_ASR_API_KEY, readSecureProviderValue(_0x32e902, "volcengine-speech", "apiKey"), _0x4c2172.apiKey, readSecureProviderValue(_0x32e902, "volcengine", "apiKey"), _0xa8d55c.apiKey),
      appKey: firstNonEmptyText(processEnv.DOUBAO_ASR_APP_KEY, processEnv.VOLCENGINE_ASR_APP_KEY, _0xa8d55c.asrAppKey),
      accessKey: firstNonEmptyText(processEnv.DOUBAO_ASR_ACCESS_KEY, processEnv.VOLCENGINE_ASR_ACCESS_KEY, _0xa8d55c.asrAccessKey),
      baseUrl: firstNonEmptyText(processEnv.DOUBAO_ASR_API_URL, processEnv.VOLCENGINE_ASR_API_URL, _0x4c2172.asrApiUrl, _0x4c2172.apiUrl, _0xa8d55c.asrApiUrl)
    };
  };
}