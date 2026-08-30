import { DEFAULT_APIMART_ROUTE_ID, PROVIDERS_META, getApimartApiUrlForRoute, resolveApimartRouteByApiUrl } from "../src/modules/providers.js";
import { getRunningHubWorkflowDefaultProfileId } from "../src/modules/runningHubProviderProfiles.js";
import { desktopBridge } from "../src/services/desktopBridge.js";
import { get, post } from "./apiBase.js";
import { OBJECT_STORAGE_PROVIDER_IDS } from "./objectStorageProfiles.js";
let apiConfig = null;
let apiConfigLoadPromise = null;
let apiConfigSaveQueue = Promise.resolve();
let apiConfigSavePendingCount = 0;
let apiConfigSaveRevision = 0;
export const API_CONFIG_CHANGED_EVENT = "aicanvas:api-config-changed";
const SECURE_PROVIDER_FIELDS = ["apiKey", "modelApiKey"];
const SECURE_OBJECT_STORAGE_FIELDS = ["accessKeyId", "secretAccessKey", "sessionToken"];
const LEGACY_GRSAI_KEY_FIELDS = ["apiKey", "apiKeyInput"];
const DEFAULT_SECURE_PROVIDER_IDS = Object.freeze([...new Set([...Object.keys(PROVIDERS_META || {}), "grsai", "openai", "ppio", "apimart", "agnes", "runninghub", "aicanvas"])]);
export function clearApiConfig() {
  apiConfig = null;
  apiConfigLoadPromise = null;
  apiConfigSaveRevision += 1;
}
export function isApiConfigLoaded() {
  return apiConfig !== null;
}
export function getApiConfigSnapshot() {
  return cloneConfig(apiConfig || {});
}
function notifyApiConfigChanged(_0x2cef1d = "updated") {
  const _0x29c893 = globalThis.window;
  if (!_0x29c893 || typeof _0x29c893.dispatchEvent !== "function") {
    return;
  }
  const _0x4371f5 = {
    reason: _0x2cef1d
  };
  const _0x14308a = typeof globalThis.CustomEvent === "function" ? new globalThis.CustomEvent(API_CONFIG_CHANGED_EVENT, {
    detail: _0x4371f5
  }) : {
    type: API_CONFIG_CHANGED_EVENT,
    detail: _0x4371f5
  };
  _0x29c893.dispatchEvent(_0x14308a);
}
function isPlainObject(_0xe51ee9) {
  return !!_0xe51ee9 && typeof _0xe51ee9 === "object" && !Array.isArray(_0xe51ee9);
}
function cloneConfig(_0x4877aa) {
  if (isPlainObject(_0x4877aa)) {
    return JSON.parse(JSON.stringify(_0x4877aa));
  } else {
    return {};
  }
}
function normalizeProviderId(_0x11c38d) {
  return String(_0x11c38d || "").trim().replace(/[^A-Za-z0-9_-]/g, "");
}
function normalizeComfyUiBaseUrl(_0x362cae, _0x4ee5af = "") {
  const _0x144c26 = String(_0x362cae || _0x4ee5af || "").trim();
  if (!_0x144c26) {
    return "";
  }
  const _0x5ba4e6 = /^[a-z][a-z0-9+.-]*:\/\//i.test(_0x144c26);
  try {
    const _0x580e2e = new URL(_0x5ba4e6 ? _0x144c26 : "http://" + _0x144c26);
    _0x580e2e.search = "";
    _0x580e2e.hash = "";
    return _0x580e2e.toString().replace(/\/+$/, "");
  } catch {
    const _0x2b8881 = _0x144c26.replace(/[?#].*$/, "").replace(/\/+$/, "");
    if (!_0x2b8881) {
      return "";
    }
    if (_0x5ba4e6) {
      return _0x2b8881;
    } else {
      return "http://" + _0x2b8881;
    }
  }
}
function buildProviderSecureKey(_0x4cfb02, _0x268097) {
  const _0x5f1aa4 = normalizeProviderId(_0x4cfb02);
  const _0x5d14de = String(_0x268097 || "").trim();
  if (!_0x5f1aa4 || !SECURE_PROVIDER_FIELDS.includes(_0x5d14de)) {
    return "";
  }
  return "apiConfig.providers." + _0x5f1aa4 + "." + _0x5d14de;
}
function buildObjectStorageSecureKey(_0x3de9d6, _0x13e8cc = "") {
  const _0x6ba00c = String(_0x3de9d6 || "").trim();
  if (!SECURE_OBJECT_STORAGE_FIELDS.includes(_0x6ba00c)) {
    return "";
  }
  const _0x2d4e98 = normalizeProviderId(_0x13e8cc);
  if (_0x2d4e98) {
    return "apiConfig.objectStorage.profiles." + _0x2d4e98 + "." + _0x6ba00c;
  }
  return "apiConfig.objectStorage." + _0x6ba00c;
}
function getSecureSettingsApi() {
  if (!desktopBridge.isElectron && !desktopBridge.isChromeShell) {
    return null;
  }
  const _0x5e11ac = desktopBridge.secureSettings;
  if (_0x5e11ac && typeof _0x5e11ac.get === "function" && typeof _0x5e11ac.set === "function" && typeof _0x5e11ac.delete === "function") {
    return _0x5e11ac;
  }
  return null;
}
function collectProviderIds(_0x4c35d8 = {}) {
  const _0x591bd5 = new Set(DEFAULT_SECURE_PROVIDER_IDS);
  if (isPlainObject(_0x4c35d8.providers)) {
    Object.keys(_0x4c35d8.providers).forEach(_0x4b8d2f => {
      const _0x353bd7 = normalizeProviderId(_0x4b8d2f);
      if (_0x353bd7) {
        _0x591bd5.add(_0x353bd7);
      }
    });
  }
  return [..._0x591bd5];
}
function collectSecureKeys(_0x29a630 = {}) {
  const _0xd6987f = [];
  collectProviderIds(_0x29a630).forEach(_0x5e43fc => {
    SECURE_PROVIDER_FIELDS.forEach(_0x42d929 => {
      const _0x58a235 = buildProviderSecureKey(_0x5e43fc, _0x42d929);
      if (_0x58a235) {
        _0xd6987f.push(_0x58a235);
      }
    });
  });
  SECURE_OBJECT_STORAGE_FIELDS.forEach(_0x5bf014 => {
    const _0x13132b = buildObjectStorageSecureKey(_0x5bf014);
    if (_0x13132b) {
      _0xd6987f.push(_0x13132b);
    }
  });
  const _0x39950 = new Set(OBJECT_STORAGE_PROVIDER_IDS);
  if (isPlainObject(_0x29a630?.objectStorage?.profiles)) {
    Object.keys(_0x29a630.objectStorage.profiles).forEach(_0x39b320 => {
      const _0x3d7308 = normalizeProviderId(_0x39b320);
      if (_0x3d7308) {
        _0x39950.add(_0x3d7308);
      }
    });
  }
  _0x39950.forEach(_0x51f139 => {
    SECURE_OBJECT_STORAGE_FIELDS.forEach(_0x473a31 => {
      const _0x2068b2 = buildObjectStorageSecureKey(_0x473a31, _0x51f139);
      if (_0x2068b2) {
        _0xd6987f.push(_0x2068b2);
      }
    });
  });
  return _0xd6987f;
}
function stripSensitiveConfigValues(_0x104e2b = {}) {
  const _0x32a0ec = cloneConfig(_0x104e2b);
  if (isPlainObject(_0x32a0ec.providers)) {
    Object.values(_0x32a0ec.providers).forEach(_0x1013e9 => {
      if (!isPlainObject(_0x1013e9)) {
        return;
      }
      SECURE_PROVIDER_FIELDS.forEach(_0xee149e => {
        delete _0x1013e9[_0xee149e];
      });
    });
  }
  if (isPlainObject(_0x32a0ec.objectStorage)) {
    SECURE_OBJECT_STORAGE_FIELDS.forEach(_0x5aaae6 => {
      delete _0x32a0ec.objectStorage[_0x5aaae6];
    });
    if (isPlainObject(_0x32a0ec.objectStorage.profiles)) {
      Object.values(_0x32a0ec.objectStorage.profiles).forEach(_0x1e1d85 => {
        if (!isPlainObject(_0x1e1d85)) {
          return;
        }
        SECURE_OBJECT_STORAGE_FIELDS.forEach(_0x4d07cc => {
          delete _0x1e1d85[_0x4d07cc];
        });
      });
    }
  }
  LEGACY_GRSAI_KEY_FIELDS.forEach(_0x4d6818 => {
    delete _0x32a0ec[_0x4d6818];
  });
  return _0x32a0ec;
}
function normalizeConfigForStorage(_0x45a69c = {}) {
  const _0x273397 = cloneConfig(_0x45a69c);
  const _0x4fc8e2 = _0x273397.providers?.comfyui;
  if (isPlainObject(_0x4fc8e2)) {
    if (Object.prototype.hasOwnProperty.call(_0x4fc8e2, "apiUrl") || Object.prototype.hasOwnProperty.call(_0x4fc8e2, "baseUrl")) {
      _0x4fc8e2.apiUrl = normalizeComfyUiBaseUrl(_0x4fc8e2.apiUrl || _0x4fc8e2.baseUrl || "");
    }
    if (Object.prototype.hasOwnProperty.call(_0x4fc8e2, "cloudApiUrl") || Object.prototype.hasOwnProperty.call(_0x4fc8e2, "cloudBaseUrl")) {
      _0x4fc8e2.cloudApiUrl = normalizeComfyUiBaseUrl(_0x4fc8e2.cloudApiUrl || _0x4fc8e2.cloudBaseUrl || "");
    }
  }
  return _0x273397;
}
function extractPlaintextSecureValues(_0x40a2f5 = {}) {
  const _0x5aa493 = new Map();
  const _0x12d727 = isPlainObject(_0x40a2f5.providers) ? _0x40a2f5.providers : {};
  Object.entries(_0x12d727).forEach(([_0x511e52, _0x3c3880]) => {
    if (!isPlainObject(_0x3c3880)) {
      return;
    }
    SECURE_PROVIDER_FIELDS.forEach(_0xdbacda => {
      if (!Object.prototype.hasOwnProperty.call(_0x3c3880, _0xdbacda)) {
        return;
      }
      const _0x47f6a6 = buildProviderSecureKey(_0x511e52, _0xdbacda);
      if (!_0x47f6a6) {
        return;
      }
      _0x5aa493.set(_0x47f6a6, String(_0x3c3880[_0xdbacda] || ""));
    });
  });
  if (isPlainObject(_0x40a2f5.objectStorage)) {
    SECURE_OBJECT_STORAGE_FIELDS.forEach(_0x407930 => {
      if (!Object.prototype.hasOwnProperty.call(_0x40a2f5.objectStorage, _0x407930)) {
        return;
      }
      const _0x43259b = buildObjectStorageSecureKey(_0x407930);
      if (!_0x43259b) {
        return;
      }
      _0x5aa493.set(_0x43259b, String(_0x40a2f5.objectStorage[_0x407930] || ""));
    });
    if (isPlainObject(_0x40a2f5.objectStorage.profiles)) {
      Object.entries(_0x40a2f5.objectStorage.profiles).forEach(([_0x36eaa4, _0x471427]) => {
        if (!isPlainObject(_0x471427)) {
          return;
        }
        SECURE_OBJECT_STORAGE_FIELDS.forEach(_0x1c0c63 => {
          if (!Object.prototype.hasOwnProperty.call(_0x471427, _0x1c0c63)) {
            return;
          }
          const _0x402b96 = buildObjectStorageSecureKey(_0x1c0c63, _0x36eaa4);
          if (!_0x402b96) {
            return;
          }
          _0x5aa493.set(_0x402b96, String(_0x471427[_0x1c0c63] || ""));
        });
      });
    }
  }
  const _0x26b6b9 = !!String(_0x12d727?.grsai?.apiKey || "").trim();
  if (!_0x26b6b9) {
    for (const _0x4fe4ae of LEGACY_GRSAI_KEY_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(_0x40a2f5, _0x4fe4ae)) {
        continue;
      }
      const _0x5ef7de = String(_0x40a2f5[_0x4fe4ae] || "");
      if (_0x5ef7de) {
        _0x5aa493.set(buildProviderSecureKey("grsai", "apiKey"), _0x5ef7de);
      }
    }
  }
  return _0x5aa493;
}
function mergeSecureValuesIntoConfig(_0x31ed95 = {}, _0x106fec = {}) {
  const _0xc48d75 = stripSensitiveConfigValues(_0x31ed95);
  Object.entries(_0x106fec || {}).forEach(([_0xdc987a, _0x539651]) => {
    const _0x2af46d = String(_0xdc987a || "").match(/^apiConfig\.objectStorage\.profiles\.([A-Za-z0-9_-]+)\.(accessKeyId|secretAccessKey|sessionToken)$/);
    if (_0x2af46d) {
      const _0x548606 = String(_0x539651 || "");
      if (!_0x548606) {
        return;
      }
      const _0x3935bd = _0x2af46d[1];
      const _0xd0c22a = _0x2af46d[2];
      if (!isPlainObject(_0xc48d75.objectStorage)) {
        _0xc48d75.objectStorage = {};
      }
      if (!isPlainObject(_0xc48d75.objectStorage.profiles)) {
        _0xc48d75.objectStorage.profiles = {};
      }
      if (!isPlainObject(_0xc48d75.objectStorage.profiles[_0x3935bd])) {
        _0xc48d75.objectStorage.profiles[_0x3935bd] = {};
      }
      _0xc48d75.objectStorage.profiles[_0x3935bd][_0xd0c22a] = _0x548606;
      return;
    }
    const _0x312ed4 = String(_0xdc987a || "").match(/^apiConfig\.objectStorage\.(accessKeyId|secretAccessKey|sessionToken)$/);
    if (_0x312ed4) {
      const _0x41e2be = String(_0x539651 || "");
      if (!_0x41e2be) {
        return;
      }
      if (!isPlainObject(_0xc48d75.objectStorage)) {
        _0xc48d75.objectStorage = {};
      }
      _0xc48d75.objectStorage[_0x312ed4[1]] = _0x41e2be;
      return;
    }
    const _0x1b83fe = String(_0xdc987a || "").match(/^apiConfig\.providers\.([A-Za-z0-9_-]+)\.(apiKey|modelApiKey)$/);
    if (!_0x1b83fe) {
      return;
    }
    const _0x27604f = _0x1b83fe[1];
    const _0x503b2b = _0x1b83fe[2];
    const _0x587fa5 = String(_0x539651 || "");
    if (!_0x587fa5) {
      return;
    }
    if (!isPlainObject(_0xc48d75.providers)) {
      _0xc48d75.providers = {};
    }
    if (!isPlainObject(_0xc48d75.providers[_0x27604f])) {
      _0xc48d75.providers[_0x27604f] = {};
    }
    _0xc48d75.providers[_0x27604f][_0x503b2b] = _0x587fa5;
  });
  return _0xc48d75;
}
function hasProviderConfigValue(_0x83c7 = {}) {
  if (!isPlainObject(_0x83c7)) {
    return false;
  }
  return ["apiUrl", "cloudApiUrl", "apiKey", "modelApiKey", "routeId", "concurrentLimit", "workflowConcurrentLimit", "modelConcurrentLimit"].some(_0x36fd24 => {
    const _0x5e5ba9 = _0x83c7[_0x36fd24];
    return _0x5e5ba9 !== undefined && _0x5e5ba9 !== null && String(_0x5e5ba9).trim() !== "";
  });
}
async function readSecureValues(_0x5a997c = {}) {
  const _0x144ddc = getSecureSettingsApi();
  if (!_0x144ddc) {
    return {
      available: false,
      values: {}
    };
  }
  try {
    const _0xcd85c9 = await _0x144ddc.get({
      keys: collectSecureKeys(_0x5a997c)
    });
    if (!_0xcd85c9?.available) {
      return {
        available: false,
        values: {}
      };
    }
    return {
      available: true,
      values: isPlainObject(_0xcd85c9.values) ? _0xcd85c9.values : {}
    };
  } catch {
    return {
      available: false,
      values: {}
    };
  }
}
async function writeSecureValues(_0x149c52) {
  const _0x5d2197 = getSecureSettingsApi();
  if (!_0x5d2197 || !(_0x149c52 instanceof Map)) {
    return {
      available: false,
      changed: false
    };
  }
  const _0x53315c = await _0x5d2197.get({
    keys: []
  }).catch(() => null);
  if (!_0x53315c?.available) {
    return {
      available: false,
      changed: false
    };
  }
  let _0x592020 = false;
  let _0xd56400 = false;
  for (const [_0x4990c1, _0x770817] of _0x149c52.entries()) {
    if (!_0x4990c1) {
      continue;
    }
    const _0x2fbcee = String(_0x770817 || "");
    if (_0x2fbcee) {
      const _0x12fbbb = await _0x5d2197.set({
        key: _0x4990c1,
        value: _0x2fbcee
      });
      if (_0x12fbbb?.ok) {
        _0x592020 = true;
      } else {
        _0xd56400 = true;
      }
    } else {
      const _0x55d5f0 = await _0x5d2197.delete({
        key: _0x4990c1
      });
      if (_0x55d5f0?.ok) {
        _0x592020 = true;
      } else {
        _0xd56400 = true;
      }
    }
  }
  return {
    available: true,
    changed: _0x592020,
    failed: _0xd56400
  };
}
async function hydrateConfigFromSecureStorage(_0x1f731c = {}) {
  const _0x307a00 = extractPlaintextSecureValues(_0x1f731c);
  const {
    available: _0x1488a7,
    values: _0x26977a
  } = await readSecureValues(_0x1f731c);
  if (!_0x1488a7) {
    return _0x1f731c;
  }
  let _0x1048c0 = {
    ..._0x26977a
  };
  if (_0x307a00.size > 0) {
    const _0x35a644 = await writeSecureValues(_0x307a00);
    if (_0x35a644.available && !_0x35a644.failed) {
      _0x307a00.forEach((_0x32f2f5, _0x58ffd7) => {
        if (String(_0x32f2f5 || "")) {
          _0x1048c0[_0x58ffd7] = String(_0x32f2f5 || "");
        } else {
          delete _0x1048c0[_0x58ffd7];
        }
      });
      const _0x2047a7 = stripSensitiveConfigValues(_0x1f731c);
      await post("/api/config", _0x2047a7).catch(() => null);
    }
  }
  return mergeSecureValuesIntoConfig(_0x1f731c, _0x1048c0);
}
function _syncLegacyWindowApiKeys(_0x63355d) {
  if (typeof window === "undefined") {
    return;
  }
  const _0x356f7b = _0x63355d?.providers || {};
  const _0x1aef87 = _0x63355d?.apiKey || "";
  window._appApiKey = _0x356f7b.grsai?.apiKey || _0x1aef87 || "";
  window._runningHubApiKey = _0x356f7b.runninghub?.apiKey || "";
  window._runningHubModelApiKey = _0x356f7b.runninghub?.modelApiKey || "";
}
export async function fetchApiConfigFromServer() {
  if (apiConfigLoadPromise) {
    return apiConfigLoadPromise;
  }
  const _0x12964a = (async () => {
    const _0x167d1a = await get("/api/config");
    if (!_0x167d1a.success) {
      throw new Error(_0x167d1a.error || "获取配置失败");
    }
    apiConfig = await hydrateConfigFromSecureStorage(_0x167d1a.data || {});
    _syncLegacyWindowApiKeys(apiConfig);
    notifyApiConfigChanged("loaded");
    return apiConfig;
  })();
  apiConfigLoadPromise = _0x12964a;
  try {
    return await _0x12964a;
  } finally {
    if (apiConfigLoadPromise === _0x12964a) {
      apiConfigLoadPromise = null;
    }
  }
}
async function persistApiConfigToServer(_0x37c0e9, _0x152af6) {
  const _0x9822af = normalizeConfigForStorage(_0x37c0e9 || {});
  const _0x108eb9 = extractPlaintextSecureValues(_0x9822af);
  const _0x2b7fd6 = await writeSecureValues(_0x108eb9);
  const _0x1664ce = [..._0x108eb9.keys()].some(_0x579baa => String(_0x579baa || "").startsWith("apiConfig.objectStorage."));
  if (_0x1664ce && (!_0x2b7fd6.available || _0x2b7fd6.failed)) {
    throw new Error("安全存储不可用，无法保存对象存储访问密钥");
  }
  const _0x2be090 = _0x2b7fd6.available && !_0x2b7fd6.failed ? stripSensitiveConfigValues(_0x9822af) : _0x9822af;
  const _0x315f2e = await post("/api/config", _0x2be090);
  if (!_0x315f2e.success) {
    throw new Error(_0x315f2e.error || "保存配置失败");
  }
  if (_0x152af6 === apiConfigSaveRevision) {
    apiConfig = cloneConfig(_0x9822af);
    _syncLegacyWindowApiKeys({
      providers: _0x9822af?.providers || {}
    });
    notifyApiConfigChanged("saved");
  }
  return _0x315f2e.data;
}
export function saveApiConfigToServer(_0x528173) {
  const _0x4928d2 = normalizeConfigForStorage(_0x528173 || {});
  const _0x398cf0 = ++apiConfigSaveRevision;
  apiConfig = cloneConfig(_0x4928d2);
  _syncLegacyWindowApiKeys({
    providers: _0x4928d2?.providers || {}
  });
  notifyApiConfigChanged("save-pending");
  apiConfigSavePendingCount += 1;
  const _0x2de039 = apiConfigSaveQueue.catch(() => {}).then(() => persistApiConfigToServer(_0x4928d2, _0x398cf0)).finally(() => {
    apiConfigSavePendingCount = Math.max(0, apiConfigSavePendingCount - 1);
  });
  apiConfigSaveQueue = _0x2de039;
  return _0x2de039;
}
export async function ensureConfig() {
  if (apiConfigSavePendingCount > 0) {
    await apiConfigSaveQueue.catch(() => {});
  }
  if (apiConfig) {
    return;
  }
  await fetchApiConfigFromServer();
}
export function getProviderConfig(_0x4d8112) {
  if (_0x4d8112 === "runninghubwf") {
    const _0x2baa4a = getRunningHubWorkflowDefaultProfileId(apiConfig || {});
    const _0x244d21 = PROVIDERS_META[_0x2baa4a];
    const _0x548f6a = _0x244d21?.defaultUrl || "https://www.runninghub.cn";
    const _0x4dd67b = apiConfig?.providers?.[_0x2baa4a] || {};
    return {
      ..._0x4dd67b,
      apiUrl: (_0x4dd67b.apiUrl || _0x548f6a).replace(/\/+$/, ""),
      apiKey: _0x4dd67b.apiKey || "",
      modelApiKey: "",
      providerProfileId: _0x2baa4a,
      rhProviderProfileId: _0x2baa4a
    };
  }
  const _0x477fcd = PROVIDERS_META[_0x4d8112];
  const _0x160b7a = _0x477fcd?.defaultUrl || "https://grsai.dakka.com.cn";
  const _0x162141 = apiConfig?.providers?.[_0x4d8112];
  if (hasProviderConfigValue(_0x162141)) {
    if (_0x4d8112 === "apimart") {
      const _0x1b6e52 = (_0x162141.apiUrl || getApimartApiUrlForRoute(_0x162141.routeId) || _0x160b7a).replace(/\/+$/, "");
      const _0x534954 = resolveApimartRouteByApiUrl(_0x1b6e52);
      return {
        ..._0x162141,
        apiUrl: _0x1b6e52,
        apiKey: _0x162141.apiKey || "",
        modelApiKey: _0x162141.modelApiKey || "",
        routeId: _0x534954?.id || _0x162141.routeId || DEFAULT_APIMART_ROUTE_ID
      };
    }
    if (_0x4d8112 === "comfyui") {
      return {
        ..._0x162141,
        apiUrl: normalizeComfyUiBaseUrl(_0x162141.apiUrl || _0x162141.baseUrl, _0x160b7a),
        cloudApiUrl: normalizeComfyUiBaseUrl(_0x162141.cloudApiUrl || _0x162141.cloudBaseUrl || ""),
        apiKey: _0x162141.apiKey || "",
        modelApiKey: _0x162141.modelApiKey || ""
      };
    }
    return {
      ..._0x162141,
      apiUrl: (_0x162141.apiUrl || _0x160b7a).replace(/\/+$/, ""),
      apiKey: _0x162141.apiKey || "",
      modelApiKey: _0x162141.modelApiKey || ""
    };
  }
  if (_0x4d8112 === "grsai") {
    return {
      apiUrl: (apiConfig?.apiUrlInput || apiConfig?.apiUrl || _0x160b7a).replace(/\/+$/, ""),
      apiKey: apiConfig?.apiKeyInput || apiConfig?.apiKey || "",
      modelApiKey: ""
    };
  }
  if (_0x4d8112 === "apimart") {
    return {
      apiUrl: _0x160b7a,
      apiKey: "",
      modelApiKey: "",
      routeId: DEFAULT_APIMART_ROUTE_ID
    };
  }
  return {
    apiUrl: _0x160b7a,
    apiKey: "",
    modelApiKey: ""
  };
}
export async function resolveRunningHubWorkflowAccess(_0x3da6e7 = "") {
  await ensureConfig();
  const _0x47a22e = String(_0x3da6e7 || "").trim();
  const _0x33e472 = getProviderConfig(_0x47a22e || "runninghubwf");
  return {
    apiKey: String(_0x33e472?.apiKey || "").trim(),
    apiUrl: String(_0x33e472?.apiUrl || "").trim().replace(/\/+$/, ""),
    providerProfileId: String(_0x47a22e || _0x33e472?.providerProfileId || "").trim()
  };
}
export function getObjectStorageConfig() {
  return cloneConfig(isPlainObject(apiConfig?.objectStorage) ? apiConfig.objectStorage : {});
}