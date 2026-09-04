import { fetchBinghuoModelCatalog } from "../../api/modelCatalogApi.js";
import { registerManifestBundle, unregisterManifestBundle, validateManifestBundle } from "../manifests/modelRegistry.js";
export const BINGHUO_MODEL_CATALOG_CACHE_KEY = "aic-model-catalog-binghuo-v1";
export const BINGHUO_MODEL_CATALOG_SOURCE_ID = "server.binghuo";
const BINGHUO_EXECUTION_POLICY = Object.freeze({
  image: Object.freeze({
    endpoint: "/v1/images/generations",
    bodyResolver: "",
    pollingUrlTemplate: ""
  }),
  video: Object.freeze({
    endpoint: "/v1/video/generations",
    bodyResolver: "binghuoVideo",
    pollingUrlTemplate: "{baseUrl}/v1/video/generations/{taskId}"
  })
});
const BINGHUO_ASSET_UPLOAD_ENDPOINT = "/v1/assets/uploads";
const BINGHUO_ASSET_UPLOAD_PROVIDER = "customProviderAsset";
const BINGHUO_ASSET_UPLOAD_KEYS = Object.freeze(["imageInputUpload", "videoInputUpload", "audioInputUpload"]);
const BINGHUO_EXECUTION_KEYS = new Set(["schemaVersion", "id", "provider", "kind", "adapterType", "endpoint", "endpointMode", "method", "headers", "model", "extensions", "bodyMapping", "responseMapping", "result"]);
const BINGHUO_EXECUTION_EXTENSION_KEYS = new Set([...BINGHUO_ASSET_UPLOAD_KEYS, "binghuoVideo", "bodyResolver", "mergeGenericInputImagesWithSlots", "requestTimeoutMs", "strictInputCounts", "strictUiSchemaParams", "taskPolling"]);
const BINGHUO_BODY_MAPPING_SOURCES = new Set(["constant", "inputAudios", "inputImages", "inputVideos", "model", "param", "prompt"]);
const BINGHUO_BODY_MAPPING_TRANSFORMS = new Set(["booleanParam", "providerRatioSize"]);
const BINGHUO_BODY_MAPPING_PATHS = new Set(["duration", "generate_audio", "images", "model", "n", "prompt", "quality", "quality_level", "ratio", "reference_audios", "reference_videos", "resolution", "response_format", "size", "skip_review"]);
const BINGHUO_TASK_POLLING_KEYS = new Set(["failedStatuses", "headersMode", "maxWaitMs", "method", "mode", "pollIntervalMs", "successStatuses", "transportErrorPolicy", "urlTemplate"]);
const BINGHUO_TASK_TRANSPORT_POLICY_KEYS = new Set(["maxConsecutiveErrors", "retryableStatuses", "surfaceLastError", "terminalStatuses"]);
const BINGHUO_UPLOAD_POLICY_KEYS = new Set(["allowedExtensions", "endpoint", "forceProviderUpload", "inputKinds", "maxBytes", "multipartField", "provider", "responsePath", "strictUpload", "uploadTimeout"]);
const BINGHUO_MODEL_KEYS = new Set(["adapterType", "async", "cancellable", "description", "displayName", "executionId", "extensions", "help", "icon", "inputSlots", "kind", "modelId", "outputType", "prompt", "provider", "schemaVersion", "uiSchema", "vip"]);
const BINGHUO_MODEL_EXTENSION_KEYS = Object.freeze({
  image: new Set(["imageMenu", "modelCatalog", "ratioPolicy"]),
  video: new Set(["modelCatalog", "ratioPolicy", "videoInputSurface", "videoMenu"])
});
const BINGHUO_MODEL_CATALOG_EXTENSION_KEYS = new Set(["templateFamilyDefault", "templateFamilyId", "templateFamilyLabel"]);
function normalizeIdentity(_0x107994) {
  return String(_0x107994 || "").trim();
}
function normalizeExpirySeconds(_0x16686c) {
  if (_0x16686c === null || _0x16686c === undefined || _0x16686c === "") {
    return null;
  }
  const _0x13b0f6 = Number(_0x16686c);
  if (Number.isFinite(_0x13b0f6) && _0x13b0f6 > 0) {
    if (_0x13b0f6 > 100000000000) {
      return Math.floor(_0x13b0f6 / 1000);
    } else {
      return Math.floor(_0x13b0f6);
    }
  }
  const _0x271d7c = Date.parse(String(_0x16686c));
  if (Number.isFinite(_0x271d7c) && _0x271d7c > 0) {
    return Math.floor(_0x271d7c / 1000);
  } else {
    return null;
  }
}
function isActiveSubscription(_0x52e4a2, _0x4f3999) {
  // 模型目录不再受订阅状态限制。
  return true;
}
function assertExactValue(_0x541a35, _0x1df349, _0x53ebb3) {
  if (_0x541a35 !== _0x1df349) {
    throw new Error("[modelCatalog] invalid " + _0x53ebb3);
  }
}
function assertObjectKeysAllowed(_0x2b5dab, _0x1bd0e1, _0x241079) {
  if (!_0x2b5dab || typeof _0x2b5dab !== "object" || Array.isArray(_0x2b5dab)) {
    throw new Error("[modelCatalog] invalid " + _0x241079);
  }
  for (const _0x4dd9e9 of Object.keys(_0x2b5dab)) {
    if (!_0x1bd0e1.has(_0x4dd9e9)) {
      throw new Error("[modelCatalog] " + _0x241079 + "." + _0x4dd9e9 + " is not allowed");
    }
  }
}
function assertBinghuoModelCatalogMetadata(_0x1b6eaf, _0x52e673) {
  if (_0x1b6eaf === undefined || _0x1b6eaf === null) {
    return;
  }
  assertObjectKeysAllowed(_0x1b6eaf, BINGHUO_MODEL_CATALOG_EXTENSION_KEYS, _0x52e673);
  for (const _0xf6c515 of BINGHUO_MODEL_CATALOG_EXTENSION_KEYS) {
    if (!Object.hasOwn(_0x1b6eaf, _0xf6c515)) {
      throw new Error("[modelCatalog] " + _0x52e673 + "." + _0xf6c515 + " is required");
    }
  }
  if (typeof _0x1b6eaf.templateFamilyId !== "string" || !/^[a-z0-9][a-z0-9._-]{0,127}$/.test(_0x1b6eaf.templateFamilyId)) {
    throw new Error("[modelCatalog] invalid " + _0x52e673 + ".templateFamilyId");
  }
  if (typeof _0x1b6eaf.templateFamilyLabel !== "string" || _0x1b6eaf.templateFamilyLabel !== _0x1b6eaf.templateFamilyLabel.trim() || _0x1b6eaf.templateFamilyLabel.length === 0 || _0x1b6eaf.templateFamilyLabel.length > 128 || /[\u0000-\u001f]/.test(_0x1b6eaf.templateFamilyLabel)) {
    throw new Error("[modelCatalog] invalid " + _0x52e673 + ".templateFamilyLabel");
  }
  if (typeof _0x1b6eaf.templateFamilyDefault !== "boolean") {
    throw new Error("[modelCatalog] invalid " + _0x52e673 + ".templateFamilyDefault");
  }
}
function normalizeMappingTransformNames(_0x34baf6) {
  const _0x22cf29 = Array.isArray(_0x34baf6) ? _0x34baf6 : [_0x34baf6];
  return _0x22cf29.filter(_0x49bf3b => _0x49bf3b !== undefined && _0x49bf3b !== null && _0x49bf3b !== "").map(_0x202624 => typeof _0x202624 === "string" ? _0x202624 : String(_0x202624?.name || "").trim());
}
function assertBinghuoBodyMapping(_0x586738, _0x206971) {
  if (!Array.isArray(_0x586738)) {
    throw new Error("[modelCatalog] invalid " + _0x206971);
  }
  _0x586738.forEach((_0x421440, _0x1a99b8) => {
    const _0x5c8487 = _0x206971 + "[" + _0x1a99b8 + "]";
    assertObjectKeysAllowed(_0x421440, new Set(["defaultValue", "field", "from", "omitWhenEmpty", "path", "transform", "value"]), _0x5c8487);
    const _0x15ae9c = String(_0x421440.path || "").trim();
    if (!BINGHUO_BODY_MAPPING_PATHS.has(_0x15ae9c)) {
      throw new Error("[modelCatalog] invalid " + _0x5c8487 + ".path");
    }
    const _0x3ce98b = String(_0x421440.from || "").trim();
    if (!BINGHUO_BODY_MAPPING_SOURCES.has(_0x3ce98b)) {
      throw new Error("[modelCatalog] invalid " + _0x5c8487 + ".from");
    }
    for (const _0x5e56c9 of normalizeMappingTransformNames(_0x421440.transform)) {
      if (!BINGHUO_BODY_MAPPING_TRANSFORMS.has(_0x5e56c9)) {
        throw new Error("[modelCatalog] invalid " + _0x5c8487 + ".transform");
      }
    }
  });
}
function assertBinghuoAssetUploadPolicy(_0x113b6e, _0xa4ff57, _0x1f524b) {
  if (_0x113b6e === undefined || _0x113b6e === null) {
    return;
  }
  assertObjectKeysAllowed(_0x113b6e, BINGHUO_UPLOAD_POLICY_KEYS, _0xa4ff57);
  assertExactValue(String(_0x113b6e.provider || "").trim(), BINGHUO_ASSET_UPLOAD_PROVIDER, _0xa4ff57 + ".provider");
  assertExactValue(String(_0x113b6e.endpoint || "").trim(), BINGHUO_ASSET_UPLOAD_ENDPOINT, _0xa4ff57 + ".endpoint");
  if (_0x113b6e.forceProviderUpload !== true) {
    throw new Error("[modelCatalog] invalid " + _0xa4ff57 + ".forceProviderUpload");
  }
  if (_0x113b6e.multipartField !== "file" || _0x113b6e.responsePath !== "url" || _0x113b6e.strictUpload !== true || !Array.isArray(_0x113b6e.inputKinds) || _0x113b6e.inputKinds.length !== 1 || _0x113b6e.inputKinds[0] !== _0x1f524b) {
    throw new Error("[modelCatalog] invalid " + _0xa4ff57 + " contract");
  }
}
function assertStatusList(_0x490ca5, _0x361abf) {
  if (!Array.isArray(_0x490ca5) || _0x490ca5.length === 0 || _0x490ca5.some(_0x29732e => !/^[a-z][a-z0-9_-]{0,63}$/.test(String(_0x29732e || "")))) {
    throw new Error("[modelCatalog] invalid " + _0x361abf);
  }
}
function assertHttpStatusList(_0x470d94, _0x14dd80) {
  if (!Array.isArray(_0x470d94) || _0x470d94.some(_0x2423cf => !Number.isInteger(_0x2423cf) || _0x2423cf < 400 || _0x2423cf > 599)) {
    throw new Error("[modelCatalog] invalid " + _0x14dd80);
  }
}
function assertBinghuoTaskPolling(_0x4c7751, _0x3911d3) {
  if (!_0x3911d3.pollingUrlTemplate) {
    if (_0x4c7751 !== undefined && _0x4c7751 !== null) {
      throw new Error("[modelCatalog] image task polling is not allowed");
    }
    return;
  }
  assertObjectKeysAllowed(_0x4c7751, BINGHUO_TASK_POLLING_KEYS, "execution extensions.taskPolling");
  assertExactValue(_0x4c7751.mode, "task-proxy", "task polling mode");
  assertExactValue(_0x4c7751.method, "GET", "task polling method");
  assertExactValue(_0x4c7751.headersMode, "bearer", "task polling headersMode");
  assertExactValue(_0x4c7751.urlTemplate, _0x3911d3.pollingUrlTemplate, "execution task polling endpoint");
  const _0x14d793 = Number(_0x4c7751.pollIntervalMs);
  const _0x46f0c2 = Number(_0x4c7751.maxWaitMs);
  if (!Number.isFinite(_0x14d793) || _0x14d793 < 1000 || _0x14d793 > 30000 || !Number.isFinite(_0x46f0c2) || _0x46f0c2 < 60000 || _0x46f0c2 > 7200000) {
    throw new Error("[modelCatalog] invalid task polling timing");
  }
  assertStatusList(_0x4c7751.successStatuses, "task polling successStatuses");
  assertStatusList(_0x4c7751.failedStatuses, "task polling failedStatuses");
  const _0x392dde = _0x4c7751.transportErrorPolicy;
  assertObjectKeysAllowed(_0x392dde, BINGHUO_TASK_TRANSPORT_POLICY_KEYS, "execution extensions.taskPolling.transportErrorPolicy");
  if (!Number.isInteger(_0x392dde.maxConsecutiveErrors) || _0x392dde.maxConsecutiveErrors < 1 || _0x392dde.maxConsecutiveErrors > 10 || _0x392dde.surfaceLastError !== true) {
    throw new Error("[modelCatalog] invalid task polling transport policy");
  }
  assertHttpStatusList(_0x392dde.retryableStatuses, "task polling retryableStatuses");
  assertHttpStatusList(_0x392dde.terminalStatuses, "task polling terminalStatuses");
}
function assertBinghuoExecutionPolicy(_0x2b85ae) {
  assertObjectKeysAllowed(_0x2b85ae, BINGHUO_EXECUTION_KEYS, "execution");
  const _0x18b9dc = String(_0x2b85ae?.kind || "").trim().toLowerCase();
  const _0x267169 = BINGHUO_EXECUTION_POLICY[_0x18b9dc];
  if (!_0x267169) {
    throw new Error("[modelCatalog] catalog contains an unsupported execution kind");
  }
  assertExactValue(String(_0x2b85ae?.adapterType || "").trim(), "modelApi", "execution adapterType");
  assertExactValue(String(_0x2b85ae?.method || "").trim().toUpperCase(), "POST", "execution method");
  assertExactValue(String(_0x2b85ae?.endpoint || "").trim(), _0x267169.endpoint, "execution endpoint");
  assertExactValue(String(_0x2b85ae?.extensions?.bodyResolver || "").trim(), _0x267169.bodyResolver, "execution bodyResolver");
  if (_0x2b85ae?.extensions?.endpointResolver !== undefined) {
    throw new Error("[modelCatalog] endpointResolver is not allowed");
  }
  const _0x13be47 = _0x2b85ae?.extensions || {};
  assertObjectKeysAllowed(_0x13be47, BINGHUO_EXECUTION_EXTENSION_KEYS, "execution extensions");
  assertExactValue(JSON.stringify(_0x2b85ae?.headers || {}), JSON.stringify({
    "Content-Type": "application/json"
  }), "execution headers");
  assertBinghuoBodyMapping(_0x2b85ae?.bodyMapping, "execution bodyMapping");
  assertBinghuoTaskPolling(_0x2b85ae?.extensions?.taskPolling, _0x267169);
  for (const [_0x219227, _0x56d18f] of [["imageInputUpload", "image"], ["videoInputUpload", "video"], ["audioInputUpload", "audio"]]) {
    assertBinghuoAssetUploadPolicy(_0x2b85ae?.extensions?.[_0x219227], "execution extensions." + _0x219227, _0x56d18f);
  }
}
function assertBinghuoBundle(_0x1ce17c) {
  if (!_0x1ce17c || typeof _0x1ce17c !== "object" || Array.isArray(_0x1ce17c)) {
    throw new TypeError("[modelCatalog] catalog bundle must be an object");
  }
  if (_0x1ce17c.schemaVersion !== "1.0") {
    throw new Error("[modelCatalog] unsupported catalog schemaVersion");
  }
  if (_0x1ce17c.sourceId !== BINGHUO_MODEL_CATALOG_SOURCE_ID) {
    throw new Error("[modelCatalog] invalid catalog sourceId");
  }
  if (!Number.isInteger(_0x1ce17c.version) || _0x1ce17c.version < 1) {
    throw new Error("[modelCatalog] catalog version must be a positive integer");
  }
  if (!Array.isArray(_0x1ce17c.models) || !Array.isArray(_0x1ce17c.executions)) {
    throw new Error("[modelCatalog] catalog models/executions must be arrays");
  }
  const _0x4915b4 = new Set();
  const _0x2133ee = new Set();
  _0x1ce17c.models.forEach(_0x27e60c => {
    const _0x80e7da = String(_0x27e60c?.provider || "").trim().toLowerCase();
    const _0x146db7 = String(_0x27e60c?.modelId || "").trim();
    const _0xa1fea8 = String(_0x27e60c?.kind || "").trim().toLowerCase();
    assertObjectKeysAllowed(_0x27e60c, BINGHUO_MODEL_KEYS, "model");
    assertObjectKeysAllowed(_0x27e60c?.extensions || {}, BINGHUO_MODEL_EXTENSION_KEYS[_0xa1fea8] || new Set(), "model extensions");
    assertBinghuoModelCatalogMetadata(_0x27e60c?.extensions?.modelCatalog, "model extensions.modelCatalog");
    if (_0x80e7da !== "binghuo" || !_0x146db7.startsWith("binghuo/") || String(_0x27e60c?.adapterType || "").trim() !== "modelApi" || _0x27e60c?.outputType !== _0xa1fea8) {
      throw new Error("[modelCatalog] catalog contains a non-Binghuo model");
    }
    _0x4915b4.add(_0xa1fea8);
  });
  _0x1ce17c.executions.forEach(_0xc53c28 => {
    if (String(_0xc53c28?.provider || "").trim().toLowerCase() !== "binghuo") {
      throw new Error("[modelCatalog] catalog contains a non-Binghuo execution");
    }
    assertBinghuoExecutionPolicy(_0xc53c28);
    _0x2133ee.add(String(_0xc53c28?.kind || "").trim().toLowerCase());
  });
  if (!_0x4915b4.size || !_0x2133ee.size) {
    throw new Error("[modelCatalog] catalog must include at least one executable model");
  }
  return _0x1ce17c;
}
function readCache(_0x4bf0d2) {
  try {
    const _0x10affb = _0x4bf0d2?.getItem?.(BINGHUO_MODEL_CATALOG_CACHE_KEY);
    if (!_0x10affb) {
      return null;
    }
    const _0x5b48a7 = JSON.parse(_0x10affb);
    if (_0x5b48a7 && typeof _0x5b48a7 === "object") {
      return _0x5b48a7;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function removeCache(_0x2edc6f) {
  try {
    _0x2edc6f?.removeItem?.(BINGHUO_MODEL_CATALOG_CACHE_KEY);
  } catch {}
}
function writeCache(_0x17125b, _0x3300e3) {
  try {
    _0x17125b?.setItem?.(BINGHUO_MODEL_CATALOG_CACHE_KEY, JSON.stringify(_0x3300e3));
    return true;
  } catch {
    return false;
  }
}
function isCacheEligible(_0x312a1b, {
  installId: _0xef2c6,
  deviceId: _0x57eff3,
  nowMs: _0x237246
}) {
  return _0x312a1b?.schemaVersion === "1.0" && _0x312a1b?.provider === "binghuo" && normalizeIdentity(_0x312a1b?.subject?.installId) === normalizeIdentity(_0xef2c6) && normalizeIdentity(_0x312a1b?.subject?.deviceId) === normalizeIdentity(_0x57eff3) && _0x312a1b?.bundle?.sourceId === BINGHUO_MODEL_CATALOG_SOURCE_ID;
}
function readCachedAuthorization(_0x5ed19b) {
  return {
    status: "active",
    expiresAt: normalizeExpirySeconds(_0x5ed19b?.authorization?.expiresAt)
  };
}
function createCatalogState(_0x3f3ae0 = {}) {
  return {
    provider: "binghuo",
    status: "idle",
    source: "none",
    sourceId: "",
    version: null,
    etag: "",
    modelCount: 0,
    executionCount: 0,
    lastLoadedAt: 0,
    lastSyncAt: 0,
    error: null,
    ..._0x3f3ae0
  };
}
export function createModelCatalogService({
  store: _0x2503b5,
  storage = globalThis.localStorage,
  fetchCatalog = fetchBinghuoModelCatalog,
  validateBundle = validateManifestBundle,
  registerBundle = registerManifestBundle,
  unregisterBundle = unregisterManifestBundle,
  now = () => Date.now()
} = {}) {
  let _0x1adb3a = null;
  let _0x6c338b = 0;
  function _0x35a585(_0x79e7b7) {
    const _0x4f4472 = _0x2503b5?.getStateRaw?.()?.modelCatalog || {};
    _0x2503b5?.setModelCatalogState?.({
      ..._0x4f4472,
      ...createCatalogState(),
      ..._0x79e7b7
    });
  }
  function _0x24d758(_0x4d74fc) {
    assertBinghuoBundle(_0x4d74fc);
    const _0x39e911 = _0x1adb3a;
    if (_0x39e911) {
      unregisterBundle(_0x39e911);
    }
    try {
      validateBundle(_0x4d74fc);
      registerBundle(_0x4d74fc);
      _0x1adb3a = _0x4d74fc;
    } catch (_0x45c82e) {
      if (_0x39e911) {
        registerBundle(_0x39e911);
        _0x1adb3a = _0x39e911;
      }
      throw _0x45c82e;
    }
  }
  function _0x2d812c(_0x1ab3f5, {
    source: _0x48993a,
    etag = "",
    synced = false
  }) {
    const _0x4ecc48 = now();
    _0x35a585({
      status: "ready",
      source: _0x48993a,
      sourceId: _0x1ab3f5.sourceId,
      version: _0x1ab3f5.version,
      etag: etag,
      modelCount: _0x1ab3f5.models.length,
      executionCount: _0x1ab3f5.executions.length,
      lastLoadedAt: _0x4ecc48,
      lastSyncAt: synced ? _0x4ecc48 : 0,
      error: null
    });
  }
  function _0x3745d1({
    clearCache = false,
    status = "unavailable",
    error = null
  } = {}) {
    if (_0x1adb3a) {
      unregisterBundle(_0x1adb3a);
    }
    _0x1adb3a = null;
    if (clearCache) {
      removeCache(storage);
    }
    _0x35a585({
      status: status,
      source: "none",
      sourceId: "",
      version: null,
      etag: "",
      modelCount: 0,
      executionCount: 0,
      lastLoadedAt: 0,
      lastSyncAt: now(),
      error: error
    });
  }
  function _0x11624b({
    installId: _0x51a9cf,
    deviceId: _0x2c22a3
  } = {}) {
    const _0x1e9791 = readCache(storage);
    if (!isCacheEligible(_0x1e9791, {
      installId: _0x51a9cf,
      deviceId: _0x2c22a3,
      nowMs: now()
    })) {
      if (_0x1e9791) {
        removeCache(storage);
      }
      return {
        loaded: false,
        reason: "cache-ineligible"
      };
    }
    try {
      _0x24d758(_0x1e9791.bundle);
      _0x2d812c(_0x1e9791.bundle, {
        source: "cache",
        etag: String(_0x1e9791.etag || "")
      });
      return {
        loaded: true,
        bundle: _0x1e9791.bundle,
        authorization: readCachedAuthorization(_0x1e9791)
      };
    } catch (_0x5c857f) {
      removeCache(storage);
      _0x3745d1({
        status: "error",
        error: _0x5c857f?.message || String(_0x5c857f)
      });
      return {
        loaded: false,
        reason: "cache-invalid",
        error: _0x5c857f
      };
    }
  }
  function _0x38cccb({
    installId: _0x4502e4,
    deviceId: _0x233223,
    error: _0x1b7bdd
  } = {}) {
    _0x6c338b += 1;
    const _0x35bbd9 = readCache(storage);
    if (!isCacheEligible(_0x35bbd9, {
      installId: _0x4502e4,
      deviceId: _0x233223,
      nowMs: now()
    })) {
      if (_0x35bbd9) {
        removeCache(storage);
      }
      _0x3745d1({
        status: "error",
        error: _0x1b7bdd?.message || String(_0x1b7bdd || "")
      });
      return {
        status: "error",
        error: _0x1b7bdd
      };
    }
    try {
      if (!_0x1adb3a || _0x1adb3a.version !== _0x35bbd9.bundle.version) {
        _0x24d758(_0x35bbd9.bundle);
      }
      _0x2d812c(_0x35bbd9.bundle, {
        source: "cache-fallback",
        etag: String(_0x35bbd9.etag || ""),
        synced: true
      });
      return {
        status: "cache-fallback",
        bundle: _0x35bbd9.bundle,
        authorization: readCachedAuthorization(_0x35bbd9),
        error: _0x1b7bdd
      };
    } catch (_0x44bf26) {
      removeCache(storage);
      _0x3745d1({
        status: "error",
        error: _0x44bf26?.message || String(_0x44bf26)
      });
      return {
        status: "error",
        error: _0x44bf26
      };
    }
  }
  async function _0x1ebbd3({
    subscriptionState: _0x424062,
    installId: _0x27c9c9,
    deviceId: _0x3e1385,
    force = false
  } = {}) {
    const _0x591623 = ++_0x6c338b;
    const _0x17e4c9 = now();
    if (!isActiveSubscription(_0x424062, _0x17e4c9)) {
      _0x3745d1({
        clearCache: true,
        status: "unavailable"
      });
      return {
        status: "unauthorized"
      };
    }
    const _0x5bced = normalizeIdentity(_0x27c9c9);
    const _0xf33b61 = normalizeIdentity(_0x3e1385);
    if (!_0x5bced || !_0xf33b61) {
      _0x3745d1({
        status: "error",
        error: "缺少模型目录授权主体信息"
      });
      return {
        status: "error",
        error: "missing-subject"
      };
    }
    const _0x3dcae8 = readCache(storage);
    const _0x54dc51 = isCacheEligible(_0x3dcae8, {
      installId: _0x5bced,
      deviceId: _0xf33b61,
      nowMs: _0x17e4c9
    }) ? _0x3dcae8 : null;
    if (_0x3dcae8 && !_0x54dc51) {
      removeCache(storage);
    }
    _0x35a585({
      status: _0x1adb3a ? "refreshing" : "loading",
      source: _0x1adb3a ? "cache" : "none",
      error: null
    });
    try {
      let _0xbec37a = await fetchCatalog({
        installId: _0x5bced,
        deviceId: _0xf33b61,
        etag: force ? "" : String(_0x54dc51?.etag || "")
      });
      if (_0x591623 !== _0x6c338b) {
        return {
          status: "superseded"
        };
      }
      if (_0xbec37a?.status === "not-modified" && !_0x54dc51) {
        _0xbec37a = await fetchCatalog({
          installId: _0x5bced,
          deviceId: _0xf33b61,
          etag: ""
        });
        if (_0x591623 !== _0x6c338b) {
          return {
            status: "superseded"
          };
        }
      }
      if (_0xbec37a?.status === "not-modified") {
        if (!_0x1adb3a || _0x1adb3a.version !== _0x54dc51.bundle.version) {
          _0x24d758(_0x54dc51.bundle);
        }
        _0x2d812c(_0x54dc51.bundle, {
          source: "cache",
          etag: _0xbec37a.etag || _0x54dc51.etag,
          synced: true
        });
        return {
          status: "not-modified",
          bundle: _0x54dc51.bundle
        };
      }
      const _0x53ff54 = assertBinghuoBundle(_0xbec37a?.bundle);
      _0x24d758(_0x53ff54);
      writeCache(storage, {
        schemaVersion: "1.0",
        provider: "binghuo",
        subject: {
          installId: _0x5bced,
          deviceId: _0xf33b61
        },
        authorization: {
          status: "active",
          expiresAt: null
        },
        version: _0x53ff54.version,
        etag: String(_0xbec37a?.etag || ""),
        cachedAt: now(),
        bundle: _0x53ff54
      });
      _0x2d812c(_0x53ff54, {
        source: "remote",
        etag: String(_0xbec37a?.etag || ""),
        synced: true
      });
      return {
        status: "updated",
        bundle: _0x53ff54
      };
    } catch (_0xcc87fb) {
      if (_0x591623 !== _0x6c338b) {
        return {
          status: "superseded",
          error: _0xcc87fb
        };
      }
      if (_0xcc87fb?.status === 401 || _0xcc87fb?.status === 403) {
        _0x3745d1({
          clearCache: true,
          status: "unavailable"
        });
        return {
          status: "unauthorized",
          error: _0xcc87fb
        };
      }
      if (_0x54dc51) {
        if (!_0x1adb3a || _0x1adb3a.version !== _0x54dc51.bundle.version) {
          _0x24d758(_0x54dc51.bundle);
        }
        _0x2d812c(_0x54dc51.bundle, {
          source: "cache-fallback",
          etag: _0x54dc51.etag,
          synced: true
        });
        return {
          status: "cache-fallback",
          bundle: _0x54dc51.bundle,
          error: _0xcc87fb
        };
      }
      _0x3745d1({
        status: "error",
        error: _0xcc87fb?.message || String(_0xcc87fb)
      });
      return {
        status: "error",
        error: _0xcc87fb
      };
    }
  }
  function _0x210d53() {
    _0x6c338b += 1;
    _0x3745d1({
      clearCache: true,
      status: "unavailable"
    });
  }
  return {
    loadCachedCatalog: _0x11624b,
    retainCachedCatalogAfterSubscriptionError: _0x38cccb,
    sync: _0x1ebbd3,
    clear: _0x210d53
  };
}
