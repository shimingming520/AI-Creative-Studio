import { resolveModelExecution, sanitizeModelUiSchemaParams } from "../../src/manifests/index.js";
import { isAdaptiveRatioLabel, parseRatioLabel, resolveProviderRatioPayload } from "../imageRatioPolicy.js";
import { ApiError } from "../errors/index.js";
import { buildBodyFromMapping } from "./modelApiMappingEngine.js";
import { buildChatCompletionsStructuredOutput, buildResponsesStructuredOutput, buildTextStructuredOutputSystemPrompt, getTextStructuredOutputRequestMeta, normalizeTextStructuredOutput } from "./textStructuredOutput.js";
import { uploadModelApiMediaInputs } from "../mediaInputUploadRouter.js";
import { isConfiguredObjectStorageEnabled } from "../objectStorageApi.js";
import { getModelApiBodyResolver, getModelApiEndpointResolver, normalizeApimartNanoBanana2Resolution, normalizeApimartGptImage2Resolution } from "./modelApiResolvers/index.js";
import { buildRunningHubModelApiUrl, getRunningHubProviderProfileId, remapRunningHubModelApiUrl, resolveRunningHubModelApiProfileId, resolveRunningHubModelApiBaseUrl } from "../../src/modules/runningHubProviderProfiles.js";
import { normalizeModelProviderProfileId } from "../../src/modules/modelProviderProfileSelection.js";
function normalizeManifestOptionKey(_0x5ddde5) {
  return String(_0x5ddde5 || "").trim().toLowerCase();
}
function findVideoAspectRatioField(_0x2dc72f) {
  return (Array.isArray(_0x2dc72f?.uiSchema?.fields) ? _0x2dc72f.uiSchema.fields : []).find(_0x39d903 => String(_0x39d903?.id || "").trim() === "aspectRatio");
}
function pickDefaultConcreteVideoAspectRatio(_0x4d0b4b) {
  const _0x22f42f = findVideoAspectRatioField(_0x4d0b4b);
  const _0x54f12d = Array.isArray(_0x22f42f?.options) ? _0x22f42f.options : [];
  let _0x20cec1 = "";
  for (const _0xd8919 of _0x54f12d) {
    const _0x5b9b2a = String(_0xd8919?.value ?? _0xd8919 ?? "").trim();
    if (_0x5b9b2a && _0x5b9b2a.includes(":") && !isAdaptiveRatioLabel(_0x5b9b2a)) {
      if (_0x5b9b2a === "1:1") {
        return _0x5b9b2a;
      }
      if (!_0x20cec1) {
        _0x20cec1 = _0x5b9b2a;
      }
    }
  }
  return _0x20cec1;
}
function resolvePayloadAspectRatioInput(_0x5ada1c = {}, _0x1bbb8d = null) {
  const _0x1487d0 = _0x5ada1c?.generationParams && typeof _0x5ada1c.generationParams === "object" && !Array.isArray(_0x5ada1c.generationParams) ? _0x5ada1c.generationParams : {};
  if (Object.prototype.hasOwnProperty.call(_0x1487d0, "aspectRatio")) {
    return _0x1487d0.aspectRatio;
  }
  for (const _0x4f3bfc of ["aspectRatio", "aspect_ratio", "size"]) {
    if (Object.prototype.hasOwnProperty.call(_0x5ada1c || {}, _0x4f3bfc)) {
      return _0x5ada1c[_0x4f3bfc];
    }
  }
  return findVideoAspectRatioField(_0x1bbb8d)?.defaultValue ?? "";
}
function applyVideoAspectRatioExecutionFallback(_0x4753ab = {}, _0x49c071 = null) {
  if (!findVideoAspectRatioField(_0x49c071)) {
    return _0x4753ab;
  }
  const _0x3d5778 = _0x49c071?.extensions?.ratioPolicy || _0x49c071?.ratioPolicy || {};
  if (_0x3d5778?.preserveAdaptive === true) {
    return _0x4753ab;
  }
  const _0x5e6cc9 = resolvePayloadAspectRatioInput(_0x4753ab, _0x49c071);
  if (!isAdaptiveRatioLabel(_0x5e6cc9)) {
    return _0x4753ab;
  }
  const _0x688639 = String(_0x4753ab?.resolvedRatioLabel || "").trim();
  const _0xd8c7c3 = _0x688639 && !isAdaptiveRatioLabel(_0x688639) ? _0x688639 : pickDefaultConcreteVideoAspectRatio(_0x49c071);
  if (!_0xd8c7c3) {
    return _0x4753ab;
  }
  return {
    ..._0x4753ab,
    aspectRatio: _0xd8c7c3,
    resolvedRatioLabel: _0xd8c7c3,
    generationParams: {
      ...(_0x4753ab.generationParams || {}),
      aspectRatio: _0xd8c7c3
    }
  };
}
function mergeRootAspectRatioIntoGenerationParams(_0x5c0492 = {}, _0x4d8056 = {}) {
  const _0x565e08 = _0x4d8056 && typeof _0x4d8056 === "object" && !Array.isArray(_0x4d8056) ? {
    ..._0x4d8056
  } : {};
  const _0x35fcbf = _0x5c0492?.generationParams && typeof _0x5c0492.generationParams === "object" && !Array.isArray(_0x5c0492.generationParams) ? _0x5c0492.generationParams : {};
  if (Object.prototype.hasOwnProperty.call(_0x35fcbf, "aspectRatio")) {
    return _0x565e08;
  }
  if (String(_0x5c0492?.resolvedRatioLabel || "").trim()) {
    return _0x565e08;
  }
  if (Object.prototype.hasOwnProperty.call(_0x5c0492 || {}, "aspectRatio") && !isAdaptiveRatioLabel(_0x5c0492.aspectRatio)) {
    _0x565e08.aspectRatio = _0x5c0492.aspectRatio;
  }
  return _0x565e08;
}
function mergeUiSchemaDefaultsIntoPayload(_0x285ffd = {}, _0x1091c8 = null) {
  const _0x4a841c = Array.isArray(_0x1091c8?.uiSchema?.fields) ? _0x1091c8.uiSchema.fields : [];
  if (_0x4a841c.length === 0) {
    return _0x285ffd;
  }
  const _0xb37d58 = _0x285ffd?.generationParams && typeof _0x285ffd.generationParams === "object" && !Array.isArray(_0x285ffd.generationParams) ? {
    ..._0x285ffd.generationParams
  } : {};
  _0x4a841c.forEach(_0x22924b => {
    const _0x1f6ef5 = String(_0x22924b?.id || "").trim();
    if (!_0x1f6ef5 || Object.prototype.hasOwnProperty.call(_0xb37d58, _0x1f6ef5)) {
      return;
    }
    if (_0x1f6ef5 === "aspectRatio" && String(_0x285ffd?.resolvedRatioLabel || "").trim()) {
      _0xb37d58[_0x1f6ef5] = _0x285ffd.resolvedRatioLabel;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(_0x285ffd || {}, _0x1f6ef5)) {
      _0xb37d58[_0x1f6ef5] = _0x285ffd[_0x1f6ef5];
    }
  });
  const _0x3c98db = sanitizeModelUiSchemaParams(_0x1091c8.modelId, _0xb37d58, {
    includeDefaults: true
  });
  const _0x5f40ce = {
    ..._0x285ffd,
    generationParams: _0x3c98db
  };
  _0x4a841c.forEach(_0x37503f => {
    const _0x48c79c = String(_0x37503f?.id || "").trim();
    if (!_0x48c79c || Object.prototype.hasOwnProperty.call(_0x5f40ce, _0x48c79c)) {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(_0x3c98db, _0x48c79c)) {
      _0x5f40ce[_0x48c79c] = _0x3c98db[_0x48c79c];
    }
  });
  return _0x5f40ce;
}
function resolveMappedModelValue(_0x3a1738, _0x3c08c2) {
  if (!_0x3a1738) {
    return "";
  }
  if (typeof _0x3a1738 === "string") {
    return _0x3a1738;
  }
  if (typeof _0x3a1738 !== "object" || Array.isArray(_0x3a1738)) {
    return "";
  }
  const _0x1b2041 = String(_0x3c08c2?.imageSize || "").trim().toUpperCase();
  const _0x27cfe6 = _0x3a1738.byImageSize || {};
  return _0x1b2041 && _0x27cfe6[_0x1b2041] || _0x3a1738.default || _0x3a1738.model || "";
}
function resolveExecutionModelToken(_0x595268, _0x47dba4) {
  let _0xbe9e7a = _0x595268.model || _0x47dba4.model || "";
  const _0x170a88 = normalizeManifestOptionKey(_0x47dba4.generationParams?.mode ?? _0x47dba4.mode);
  let _0x31ea2f = false;
  if (_0x170a88 && _0x595268.modeModels) {
    const _0x4f0881 = resolveMappedModelValue(_0x595268.modeModels[_0x170a88], _0x47dba4);
    if (_0x4f0881) {
      _0xbe9e7a = _0x4f0881;
      _0x31ea2f = true;
    }
  }
  const _0x239385 = normalizeManifestOptionKey(_0x47dba4.generationParams?.rhModelRoute ?? _0x47dba4.rhModelRoute);
  if (_0x239385 && _0x595268.routeModels) {
    const _0x4385d2 = resolveMappedModelValue(_0x595268.routeModels[_0x239385], _0x47dba4);
    if (_0x4385d2) {
      _0xbe9e7a = _0x4385d2;
      _0x31ea2f = true;
    }
  }
  if (_0x595268.imageSizeModels && !_0x31ea2f) {
    const _0x68d9cb = String(_0x47dba4.imageSize || "").trim().toUpperCase();
    _0xbe9e7a = _0x595268.imageSizeModels[_0x68d9cb] || _0x595268.imageSizeModels.default || _0xbe9e7a;
  }
  return _0xbe9e7a;
}
function resolveProviderConfig(_0x1b3084, _0x62efc8, _0x336162) {
  const _0x39e0d5 = getRunningHubProviderProfileId(_0x62efc8);
  const _0x13de18 = normalizeModelProviderProfileId(_0x62efc8?.model, _0x39e0d5);
  const _0x6a83cb = _0x13de18 || (_0x1b3084 === "runninghub" ? resolveRunningHubModelApiProfileId(_0x62efc8?.model, _0x39e0d5) : _0x1b3084);
  const _0x492d07 = _0x336162.getProviderConfig(_0x6a83cb);
  if (_0x1b3084 !== "runninghub") {
    return _0x492d07;
  }
  return {
    ..._0x492d07,
    apiUrl: resolveRunningHubModelApiBaseUrl(_0x6a83cb)
  };
}
function resolveApiKey(_0x21ce98, _0x2b36a2, _0x58a1ef, _0x17a29a = null) {
  const _0x20b8fd = _0x17a29a || resolveProviderConfig(_0x21ce98, _0x2b36a2, _0x58a1ef);
  if (_0x21ce98 === "runninghub") {
    return _0x20b8fd.modelApiKey || _0x2b36a2.apiKey;
  }
  return _0x20b8fd.apiKey || _0x2b36a2.apiKey;
}
function isCustomProviderId(_0x3af5c5) {
  return /^custom_[a-z0-9_-]+$/i.test(String(_0x3af5c5 || "").trim());
}
const AIC_IMAGE_TASK_PROBE_CONTROL_KEY = "__aicAllowTaskProbe";
const AIC_MODEL_CATALOG_ID_KEY = "__aicModelCatalogId";
function buildModelCatalogIdentity(_0xd463c3, _0x4e51f0) {
  const _0x146075 = String(_0x4e51f0?.modelId || "").trim();
  if (_0xd463c3 === "binghuo" && _0x146075) {
    return {
      [AIC_MODEL_CATALOG_ID_KEY]: _0x146075
    };
  } else {
    return {};
  }
}
function supportsManifestImageTaskPolling(_0x37bfcd) {
  return Boolean(_0x37bfcd && (String(_0x37bfcd.urlTemplate || "").trim() || String(_0x37bfcd.mode || "").trim() === "comfyui-history"));
}
function isCustomProviderModelManifest(_0x530cdb) {
  const _0x3d586d = _0x530cdb?.extensions?.customProvider;
  return Boolean(_0x3d586d && typeof _0x3d586d === "object" && !Array.isArray(_0x3d586d));
}
function isSupportedModelApiProvider(_0x354e10, _0x2280c4 = new Set()) {
  const _0x4ccf75 = String(_0x354e10 || "").trim().toLowerCase();
  return _0x2280c4.has(_0x4ccf75) || isCustomProviderId(_0x4ccf75);
}
function throwMissingApiKey(_0x261213) {
  throw ApiError.authError(_0x261213, null, "API Key 未配置（厂商：" + (_0x261213 || "unknown") + "）");
}
function getManifestMaxInputCount(_0x37f0d7, _0x70c2a6) {
  const _0x2ff023 = Number(_0x37f0d7?.inputSlots?.maxByKind?.[_0x70c2a6]);
  if (Number.isFinite(_0x2ff023)) {
    return Math.max(0, _0x2ff023);
  } else {
    return null;
  }
}
function collectRawImageInputUrls(_0x3fbe8b = {}, _0x13bc98 = null) {
  const _0x59dc8d = getOrderedInputSlotEntries(_0x3fbe8b?.inputUrlsBySlot, _0x13bc98);
  const _0x599669 = _0x59dc8d.length > 0 ? _0x59dc8d.map(_0x462d26 => _0x462d26.url) : Array.isArray(_0x3fbe8b?.inputUrls) ? _0x3fbe8b.inputUrls : [];
  return Array.from(new Set(_0x599669.map(_0x1d2df2 => String(_0x1d2df2 || "").trim()).filter(Boolean)));
}
function collectResolverOwnedImageInputUrls(_0x3133e9 = {}, _0x3ae2db = null) {
  const _0x197e12 = collectRawImageInputUrls(_0x3133e9, _0x3ae2db);
  const _0x320470 = getManifestMaxInputCount(_0x3ae2db, "image");
  if (_0x320470 === null) {
    return _0x197e12;
  } else {
    return _0x197e12.slice(0, Math.max(0, _0x320470));
  }
}
function resolveInputRouteExecutionManifest(_0x13f972, _0x545e70, _0x2b1629) {
  const _0x15b2f6 = _0x13f972?.extensions?.inputRoutes;
  const _0x354e0c = _0x15b2f6 && typeof _0x15b2f6 === "object" && !Array.isArray(_0x15b2f6) ? _0x15b2f6.image : null;
  if (!_0x354e0c || typeof _0x354e0c !== "object" || Array.isArray(_0x354e0c) || collectRawImageInputUrls(_0x545e70, _0x2b1629).length === 0) {
    return _0x13f972;
  }
  return {
    ..._0x13f972,
    ..._0x354e0c,
    extensions: {
      ...(_0x13f972?.extensions || {}),
      ...(_0x354e0c.extensions || {})
    }
  };
}
function isMultipartFormExecution(_0x240718) {
  return String(_0x240718?.requestEncoding || "").trim().toLowerCase() === "multipart/form-data";
}
async function resolveMultipartInputImages(_0x2f8572, _0x3bc89a, _0x3c4ace) {
  if (typeof _0x3c4ace.loadInputImageBlob !== "function") {
    throw new Error("Model API multipart image input loader is not available");
  }
  const _0x33da2e = collectRawImageInputUrls(_0x2f8572, _0x3bc89a);
  const _0x4021da = getManifestMaxInputCount(_0x3bc89a, "image");
  const _0x2063c3 = _0x4021da === null ? _0x33da2e : _0x33da2e.slice(0, _0x4021da);
  const _0x43da11 = [];
  for (const _0x255eaf of _0x2063c3) {
    const _0x204fde = await _0x3c4ace.loadInputImageBlob(_0x255eaf);
    if (typeof Blob === "undefined" || !(_0x204fde instanceof Blob)) {
      throw new Error("Model API multipart image input did not resolve to a file");
    }
    _0x43da11.push(_0x204fde);
  }
  return _0x43da11;
}
function multipartFileName(_0x19cda4, _0x10b17e) {
  const _0x203a12 = String(_0x19cda4?.type || "").trim().toLowerCase();
  const _0x176dbc = _0x203a12 === "image/jpeg" ? "jpg" : _0x203a12 === "image/webp" ? "webp" : _0x203a12 === "image/gif" ? "gif" : "png";
  return "image-" + (_0x10b17e + 1) + "." + _0x176dbc;
}
function appendMultipartValue(_0x17b8bf, _0x290aaa, _0x1d4311, _0x4d2c81 = 0) {
  if (_0x1d4311 === undefined || _0x1d4311 === null || _0x1d4311 === "") {
    return;
  }
  if (typeof Blob !== "undefined" && _0x1d4311 instanceof Blob) {
    _0x17b8bf.append(_0x290aaa, _0x1d4311, multipartFileName(_0x1d4311, _0x4d2c81));
    return;
  }
  if (Array.isArray(_0x1d4311)) {
    _0x1d4311.forEach((_0x1ccd6d, _0x2dce37) => appendMultipartValue(_0x17b8bf, _0x290aaa, _0x1ccd6d, _0x2dce37));
    return;
  }
  if (typeof _0x1d4311 === "object") {
    _0x17b8bf.append(_0x290aaa, JSON.stringify(_0x1d4311));
    return;
  }
  _0x17b8bf.append(_0x290aaa, String(_0x1d4311));
}
function buildMultipartFormData(_0x3f13c4 = {}) {
  const _0x4d9666 = new FormData();
  Object.entries(_0x3f13c4 || {}).forEach(([_0x37c25d, _0x157471]) => {
    appendMultipartValue(_0x4d9666, _0x37c25d, _0x157471);
  });
  return _0x4d9666;
}
function getImageInputUploadPolicy(_0x5f27b9 = {}) {
  if (_0x5f27b9.forceCustomProviderFreeImageHost === true || isCustomProviderModelManifest(_0x5f27b9.modelManifest)) {
    return {
      provider: "freeImageHost",
      inputKinds: ["image"],
      applyInputQualityProfile: true,
      strictUpload: true
    };
  }
  const _0x3b2ee8 = _0x5f27b9.executionManifest?.extensions?.imageInputUpload;
  if (_0x3b2ee8 && typeof _0x3b2ee8 === "object" && !Array.isArray(_0x3b2ee8)) {
    return _0x3b2ee8;
  } else {
    return null;
  }
}
function shouldApplyImageInputUploadPolicy(_0x4a2737) {
  if (!_0x4a2737) {
    return false;
  }
  const _0x448b62 = Array.isArray(_0x4a2737.inputKinds) ? _0x4a2737.inputKinds.map(_0x25897f => String(_0x25897f || "").trim().toLowerCase()) : ["image"];
  return _0x448b62.includes("image");
}
function resolveCustomProviderAssetUploadApiUrl(_0x790a95, _0x355b4c) {
  const _0x31eb8f = String(_0x790a95 || "").trim();
  const _0x555e5a = String(_0x355b4c || "").trim();
  if (!_0x31eb8f || !_0x555e5a.startsWith("/")) {
    throw new Error("Custom provider asset upload manifest is missing a relative endpoint");
  }
  let _0x21452c;
  let _0x4dbe44;
  try {
    _0x21452c = new URL(_0x31eb8f);
    _0x4dbe44 = new URL(_0x555e5a, _0x21452c.origin);
  } catch {
    throw new Error("Custom provider asset upload manifest has an invalid endpoint");
  }
  if (_0x4dbe44.origin !== _0x21452c.origin || _0x4dbe44.search || _0x4dbe44.hash) {
    throw new Error("Custom provider asset upload endpoint must remain on the provider origin");
  }
  return _0x4dbe44.toString();
}
function getCustomProviderAssetUploadOptions(_0x37e988, _0x51e2ab) {
  return {
    provider: "customProviderAsset",
    apiUrl: resolveCustomProviderAssetUploadApiUrl(_0x51e2ab, _0x37e988.endpoint),
    multipartField: String(_0x37e988.multipartField || "file").trim() || "file",
    responsePath: String(_0x37e988.responsePath || "url").trim() || "url",
    forceProviderUpload: _0x37e988.forceProviderUpload === true,
    allowedExtensions: Array.isArray(_0x37e988.allowedExtensions) ? _0x37e988.allowedExtensions : [],
    maxBytes: _0x37e988.maxBytes,
    uploadTimeout: _0x37e988.uploadTimeout,
    compress: _0x37e988.compress === true,
    applyInputQualityProfile: _0x37e988.applyInputQualityProfile === true,
    strictUpload: _0x37e988.strictUpload !== false
  };
}
async function resolveConfiguredImageInputUpload(_0x3b7e75, _0x4ecc39, _0x5ae8fc, _0x2bcb5a, _0x238965 = {}) {
  const _0x387234 = getImageInputUploadPolicy(_0x238965);
  if (!shouldApplyImageInputUploadPolicy(_0x387234)) {
    return {
      handled: false,
      urls: []
    };
  }
  const _0x3f5d14 = String(_0x387234.provider || "").trim();
  const _0x3c9c2a = _0x3f5d14.toLowerCase().replace(/[\s_-]+/g, "");
  if (_0x3c9c2a === "freeimagehost") {
    if (typeof _0x2bcb5a.processInputImages !== "function") {
      throw new Error((_0x3b7e75 || "modelApi") + " image input upload is not available");
    }
    const _0x527bd0 = await uploadModelApiMediaInputs("image", _0x4ecc39, _0x2bcb5a, {
      fallbackProvider: "freeImageHost",
      strictUpload: _0x387234.strictUpload !== false,
      uploadOptions: {
        applyInputQualityProfile: _0x387234.applyInputQualityProfile !== false
      }
    });
    return {
      handled: true,
      urls: _0x527bd0
    };
  }
  if (_0x3c9c2a === "apimart") {
    if (typeof _0x2bcb5a.processInputImages !== "function") {
      throw new Error((_0x3b7e75 || "modelApi") + " image input upload is not available");
    }
    const _0x1841d3 = getUploadProviderConfig(_0x2bcb5a, "apimart");
    const _0x5ac749 = await uploadModelApiMediaInputs("image", _0x4ecc39, _0x2bcb5a, {
      apiKey: _0x1841d3.apiKey || "",
      apiUrl: _0x1841d3.apiUrl,
      fallbackProvider: "apimart",
      strictUpload: _0x387234.strictUpload !== false,
      uploadOptions: {
        applyInputQualityProfile: _0x387234.applyInputQualityProfile !== false,
        permanent: _0x387234.permanent === true,
        uploadTimeout: _0x387234.uploadTimeout
      }
    });
    return {
      handled: true,
      urls: _0x5ac749
    };
  }
  if (_0x3c9c2a === "grsai") {
    if (typeof _0x2bcb5a.processInputImages !== "function") {
      throw new Error((_0x3b7e75 || "modelApi") + " image input upload is not available");
    }
    const _0x2d72b5 = getUploadProviderConfig(_0x2bcb5a, "grsai");
    const _0x14bc58 = await uploadModelApiMediaInputs("image", _0x4ecc39, _0x2bcb5a, {
      apiKey: _0x2d72b5.apiKey || "",
      fallbackProvider: "grsai",
      strictUpload: _0x387234.strictUpload !== false,
      uploadOptions: {
        applyInputQualityProfile: _0x387234.applyInputQualityProfile !== false
      }
    });
    return {
      handled: true,
      urls: _0x14bc58
    };
  }
  if (_0x3c9c2a === "runninghub") {
    if (typeof _0x2bcb5a.processInputImages !== "function") {
      throw new Error((_0x3b7e75 || "modelApi") + " image input upload is not available");
    }
    const _0x450cbd = getUploadProviderConfig(_0x2bcb5a, "runninghub");
    const _0x4ee10c = await uploadModelApiMediaInputs("image", _0x4ecc39, _0x2bcb5a, {
      apiKey: _0x450cbd.modelApiKey || _0x450cbd.apiKey || "",
      apiUrl: _0x450cbd.apiUrl,
      providerProfileId: "runninghub",
      fallbackProvider: "runninghub",
      strictUpload: _0x387234.strictUpload !== false,
      uploadOptions: {
        applyInputQualityProfile: _0x387234.applyInputQualityProfile !== false
      }
    });
    return {
      handled: true,
      urls: _0x4ee10c
    };
  }
  if (_0x3c9c2a === "volcenginefiles") {
    if (typeof _0x2bcb5a.uploadInputsToVolcengineFiles !== "function") {
      throw new Error("Volcengine file upload is not available");
    }
    const _0x3f9084 = await _0x2bcb5a.uploadInputsToVolcengineFiles(_0x4ecc39, _0x5ae8fc, {
      baseUrl: _0x238965.baseUrl,
      kind: "image",
      model: _0x238965.executionManifest?.model
    });
    return {
      handled: true,
      urls: _0x3f9084
    };
  }
  if (_0x3c9c2a === "customproviderasset") {
    if (typeof _0x2bcb5a.processInputImages !== "function") {
      throw new Error((_0x3b7e75 || "modelApi") + " image input upload is not available");
    }
    const _0x3c8bef = getCustomProviderAssetUploadOptions(_0x387234, _0x238965.baseUrl);
    const _0xea369e = await uploadModelApiMediaInputs("image", _0x4ecc39, _0x2bcb5a, {
      apiKey: _0x5ae8fc,
      fallbackProvider: "customProviderAsset",
      strictUpload: _0x387234.strictUpload !== false,
      uploadOptions: _0x3c8bef
    });
    return {
      handled: true,
      urls: _0xea369e
    };
  }
  throw new Error("Unsupported image input upload provider: " + _0x3f5d14);
}
function getMediaInputUploadPolicy(_0x8aa84e = {}, _0x3c1966) {
  const _0x527337 = String(_0x3c1966 || "").trim().toLowerCase();
  const _0x4ca0b4 = _0x527337 === "video" ? "videoInputUpload" : _0x527337 === "audio" ? "audioInputUpload" : "";
  const _0xeabad9 = _0x4ca0b4 ? _0x8aa84e.executionManifest?.extensions?.[_0x4ca0b4] : null;
  if (_0xeabad9 && typeof _0xeabad9 === "object" && !Array.isArray(_0xeabad9)) {
    return _0xeabad9;
  } else {
    return null;
  }
}
function shouldApplyMediaInputUploadPolicy(_0xbe0cee, _0x1752ae) {
  if (!_0xbe0cee) {
    return false;
  }
  const _0x2b8772 = String(_0x1752ae || "").trim().toLowerCase();
  const _0x18b1dc = Array.isArray(_0xbe0cee.inputKinds) ? _0xbe0cee.inputKinds.map(_0x89c1a1 => String(_0x89c1a1 || "").trim().toLowerCase()) : [_0x2b8772];
  return _0x18b1dc.includes(_0x2b8772);
}
function getUploadProviderConfig(_0x76c19b, _0x26ae2f) {
  if (typeof _0x76c19b.getProviderConfig === "function") {
    return _0x76c19b.getProviderConfig(_0x26ae2f);
  } else {
    return {};
  }
}
async function resolveConfiguredMediaInputUpload(_0x465932, _0x5b0df, _0x137610, _0x50332a, _0x381c11, _0x570638 = {}) {
  const _0x488cfd = getMediaInputUploadPolicy(_0x570638, _0x5b0df);
  if (!shouldApplyMediaInputUploadPolicy(_0x488cfd, _0x5b0df)) {
    return {
      handled: false,
      urls: []
    };
  }
  const _0x2fafb4 = String(_0x488cfd.provider || "").trim();
  const _0x326142 = _0x2fafb4.toLowerCase().replace(/[\s_-]+/g, "");
  if (_0x326142 === "runninghub") {
    const _0x4888b3 = await uploadModelApiMediaInputs(_0x5b0df, _0x137610, _0x381c11, {
      strictUpload: _0x488cfd.strictUpload !== false,
      ...(_0x465932 === "runninghub" ? {
        apiKey: _0x50332a,
        apiUrl: _0x570638.baseUrl,
        providerProfileId: _0x570638.providerProfileId
      } : {})
    });
    return {
      handled: true,
      urls: _0x4888b3
    };
  }
  if (_0x326142 === "customproviderasset") {
    if (_0x5b0df === "video" && typeof _0x381c11.processInputVideos !== "function" || _0x5b0df === "audio" && typeof _0x381c11.processInputAudios !== "function") {
      throw new Error((_0x465932 || "modelApi") + " " + _0x5b0df + " input upload is not available");
    }
    const _0x40d657 = getCustomProviderAssetUploadOptions(_0x488cfd, _0x570638.baseUrl);
    const _0x757ece = await uploadModelApiMediaInputs(_0x5b0df, _0x137610, _0x381c11, {
      apiKey: _0x50332a,
      fallbackProvider: "customProviderAsset",
      strictUpload: _0x488cfd.strictUpload !== false,
      uploadOptions: _0x40d657
    });
    return {
      handled: true,
      urls: _0x757ece
    };
  }
  throw new Error("Unsupported " + _0x5b0df + " input upload provider: " + _0x2fafb4);
}
async function resolveInputImages(_0x152056, _0x4922a7, _0x1ff291, _0x5ad6bf, _0x6d48da = {}) {
  const _0x1c6c00 = getManifestMaxInputCount(_0x6d48da.modelManifest, "image");
  if (_0x1c6c00 === 0) {
    return [];
  }
  const _0x388130 = Array.isArray(_0x4922a7.inputUrls) ? _0x4922a7.inputUrls : [];
  if (_0x388130.length === 0) {
    return [];
  }
  const _0x2cb42d = _0x1c6c00 === null ? _0x388130 : _0x388130.slice(0, _0x1c6c00);
  assertNoUnsupportedApimartAssetUrls(_0x152056, _0x2cb42d, _0x6d48da, "image");
  const _0x44e988 = await resolveConfiguredImageInputUpload(_0x152056, _0x2cb42d, _0x1ff291, _0x5ad6bf, _0x6d48da);
  if (_0x44e988.handled) {
    return _0x44e988.urls;
  }
  if (_0x152056 === "ppio") {
    const _0x11168c = await uploadModelApiMediaInputs("image", _0x2cb42d, _0x5ad6bf, {
      strictUpload: true,
      uploadOptions: {
        applyInputQualityProfile: true
      }
    });
    if (_0x11168c.length === 0) {
      throw new Error("参考素材上传云端失败，无法继续生成");
    }
    return _0x11168c;
  }
  if (_0x152056 === "volcengine") {
    if (typeof _0x5ad6bf.uploadInputsToVolcengineFiles !== "function") {
      throw new Error("Volcengine file upload is not available");
    }
    return _0x5ad6bf.uploadInputsToVolcengineFiles(_0x2cb42d, _0x1ff291, {
      baseUrl: _0x6d48da.baseUrl,
      kind: "image",
      model: _0x6d48da.executionManifest?.model
    });
  }
  const _0x4f27b8 = _0x152056 === "apimart" || _0x152056 === "grsai" || _0x152056 === "runninghub";
  const _0x9e610f = _0x152056 === "apimart" || _0x152056 === "runninghub";
  return uploadModelApiMediaInputs("image", _0x2cb42d, _0x5ad6bf, {
    ...(_0x4f27b8 ? {
      apiKey: _0x1ff291,
      fallbackProvider: _0x152056
    } : {}),
    strictUpload: true,
    ...(_0x9e610f ? {
      apiUrl: _0x6d48da.baseUrl,
      providerProfileId: _0x4922a7.providerProfileId
    } : {}),
    uploadOptions: {
      applyInputQualityProfile: true
    }
  });
}
function normalizeInputUrlsBySlot(_0x4fbcf6) {
  if (!_0x4fbcf6 || typeof _0x4fbcf6 !== "object" || Array.isArray(_0x4fbcf6)) {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x4fbcf6).map(([_0x448601, _0x510587]) => [String(_0x448601 || "").trim(), String(_0x510587 || "").trim()]).filter(([_0x3f1493, _0xa49c77]) => _0x3f1493 && _0xa49c77));
}
function getOrderedInputSlotEntries(_0x3881fd = {}, _0xe0839 = null) {
  const _0x5b690a = normalizeInputUrlsBySlot(_0x3881fd);
  const _0x3d8492 = Array.isArray(_0xe0839?.inputSlots?.fixedSlots) ? _0xe0839.inputSlots.fixedSlots : [];
  const _0x59b095 = new Map(_0x3d8492.map(_0x4aebe2 => [String(_0x4aebe2?.id || "").trim(), String(_0x4aebe2?.kind || "").trim().toLowerCase()]).filter(([_0x262f2a]) => _0x262f2a));
  const _0x1d4396 = _0x3d8492.filter(_0x1237fa => String(_0x1237fa?.kind || "").trim().toLowerCase() === "image").map(_0x6c6aba => String(_0x6c6aba?.id || "").trim()).filter(Boolean);
  const _0x35d705 = new Set();
  const _0x57e6da = [];
  _0x1d4396.forEach(_0x5ce4c7 => {
    const _0x45f582 = _0x5b690a[_0x5ce4c7];
    if (!_0x45f582 || _0x35d705.has(_0x5ce4c7)) {
      return;
    }
    _0x57e6da.push({
      slot: _0x5ce4c7,
      url: _0x45f582
    });
    _0x35d705.add(_0x5ce4c7);
  });
  Object.entries(_0x5b690a).forEach(([_0x1709e5, _0x4600cc]) => {
    if (_0x35d705.has(_0x1709e5)) {
      return;
    }
    const _0x24e63f = _0x59b095.get(_0x1709e5);
    if (_0x24e63f && _0x24e63f !== "image") {
      return;
    }
    _0x57e6da.push({
      slot: _0x1709e5,
      url: _0x4600cc
    });
    _0x35d705.add(_0x1709e5);
  });
  return _0x57e6da;
}
async function resolveInputImagesBySlot(_0x157324, _0x92b4f1, _0x3e165b, _0x2ab739, _0x532e62 = {}) {
  const _0x237af5 = getOrderedInputSlotEntries(_0x92b4f1?.inputUrlsBySlot, _0x532e62.modelManifest);
  if (_0x237af5.length === 0) {
    return {};
  }
  const _0x165f3b = getManifestMaxInputCount(_0x532e62.modelManifest, "image");
  const _0xb4366 = _0x165f3b === null ? _0x237af5 : _0x237af5.slice(0, Math.max(0, _0x165f3b));
  const _0x495a70 = await resolveInputImages(_0x157324, {
    ..._0x92b4f1,
    inputUrls: _0xb4366.map(_0x4e12d3 => _0x4e12d3.url)
  }, _0x3e165b, _0x2ab739, _0x532e62);
  return Object.fromEntries(_0xb4366.map((_0x1180f8, _0x398b61) => [_0x1180f8.slot, String(_0x495a70[_0x398b61] || "").trim()]).filter(([, _0x1d2cc0]) => _0x1d2cc0));
}
function normalizeInputList(_0x56e237) {
  if (Array.isArray(_0x56e237)) {
    return _0x56e237.map(_0x2dad32 => String(_0x2dad32 || "").trim()).filter(Boolean);
  } else {
    return [];
  }
}
function isApimartPrivateAssetUrl(_0x30f493) {
  return /^asset:\/\//i.test(String(_0x30f493 || "").trim());
}
function assertNoUnsupportedApimartAssetUrls(_0x1fcde9, _0x249b78, _0x10dc17 = {}, _0x389960 = "image") {
  if (String(_0x1fcde9 || "").trim().toLowerCase() !== "apimart") {
    return;
  }
  if (_0x10dc17.executionManifest?.extensions?.allowApimartAssetUrls === true) {
    return;
  }
  const _0x148444 = normalizeInputList(_0x249b78).find(isApimartPrivateAssetUrl);
  if (!_0x148444) {
    return;
  }
  const _0x1112c8 = _0x389960 === "video" ? "视频" : _0x389960 === "audio" ? "音频" : "图片";
  throw new Error("APIMart " + _0x1112c8 + "输入不支持 asset:// 私有素材 URL；请连接原始素材，或使用可公网访问的 " + _0x1112c8 + " URL 后重试");
}
function collectVideoInputUrls(_0x2bf2f0) {
  return Array.from(new Set([String(_0x2bf2f0.videoUrl || "").trim(), ...normalizeInputList(_0x2bf2f0.videos), ...normalizeInputList(_0x2bf2f0.videoUrls)].filter(Boolean)));
}
function collectAudioInputUrls(_0x25ca1b) {
  return Array.from(new Set([String(_0x25ca1b.audioUrl || "").trim(), ...normalizeInputList(_0x25ca1b.audios), ...normalizeInputList(_0x25ca1b.audioUrls)].filter(Boolean)));
}
function collectVideoImageInputUrls(_0x48a305) {
  const _0x36c6da = Array.isArray(_0x48a305.images) ? _0x48a305.images : Array.isArray(_0x48a305.inputUrls) ? _0x48a305.inputUrls : [];
  return Array.from(new Set(_0x36c6da.map(_0x407418 => String(_0x407418 || "").trim()).filter(Boolean)));
}
function validateStrictVideoInputCounts(_0x268b10, _0x2bc6b4, _0x3b3fbe) {
  if (_0x3b3fbe?.extensions?.strictInputCounts !== true) {
    return;
  }
  const _0x103bb4 = {
    image: Array.from(new Set([...collectRawImageInputUrls(_0x268b10, _0x2bc6b4), ...collectVideoImageInputUrls(_0x268b10)])),
    video: collectVideoInputUrls(_0x268b10),
    audio: collectAudioInputUrls(_0x268b10)
  };
  const _0x511397 = {
    image: "参考图",
    video: "参考视频",
    audio: "参考音频"
  };
  for (const [_0x2c6a92, _0x24083e] of Object.entries(_0x103bb4)) {
    const _0x51645d = getManifestMaxInputCount(_0x2bc6b4, _0x2c6a92);
    const _0x1e46e1 = _0x2bc6b4?.inputSlots?.allowedKinds;
    const _0xb7d701 = _0x51645d === null && Array.isArray(_0x1e46e1) && !_0x1e46e1.map(_0x4a4ab5 => String(_0x4a4ab5 || "").trim()).includes(_0x2c6a92) ? 0 : _0x51645d;
    if (_0xb7d701 !== null && _0x24083e.length > _0xb7d701) {
      throw new Error("便宜渠道当前模型最多支持 " + _0xb7d701 + " 个" + _0x511397[_0x2c6a92] + "，当前传入 " + _0x24083e.length + " 个，请删减后重试");
    }
  }
}
function resolveStrictUiSchemaFieldLabel(_0x1b5686) {
  const _0x799481 = String(_0x1b5686?.id || "").trim();
  const _0x260c2a = {
    aspectRatio: "比例",
    batchSize: "生成数量",
    imageSize: "图片分辨率",
    qualityLevel: "质量"
  };
  return _0x260c2a[_0x799481] || String(_0x1b5686?.label || _0x799481 || "参数").trim();
}
function readExplicitUiSchemaValue(_0x5beb3e, _0x4a0c47) {
  const _0x559414 = _0x5beb3e?.generationParams && typeof _0x5beb3e.generationParams === "object" && !Array.isArray(_0x5beb3e.generationParams) ? _0x5beb3e.generationParams : {};
  if (Object.prototype.hasOwnProperty.call(_0x559414, _0x4a0c47)) {
    return {
      provided: true,
      value: _0x559414[_0x4a0c47]
    };
  }
  if (Object.prototype.hasOwnProperty.call(_0x5beb3e || {}, _0x4a0c47)) {
    return {
      provided: true,
      value: _0x5beb3e[_0x4a0c47]
    };
  }
  return {
    provided: false,
    value: undefined
  };
}
function isSameStrictUiSchemaOption(_0xb81a9d, _0x2ec698) {
  const _0x53ba6a = Number(_0xb81a9d);
  const _0x1fc618 = Number(_0x2ec698);
  if (String(_0xb81a9d ?? "").trim() !== "" && String(_0x2ec698 ?? "").trim() !== "" && Number.isFinite(_0x53ba6a) && Number.isFinite(_0x1fc618)) {
    return _0x53ba6a === _0x1fc618;
  }
  return String(_0xb81a9d ?? "").trim().toLowerCase() === String(_0x2ec698 ?? "").trim().toLowerCase();
}
function validateStrictModelUiSchemaParams(_0xf1d9ca, _0x33d56c, _0x760261) {
  if (_0x760261?.extensions?.strictUiSchemaParams !== true) {
    return;
  }
  const _0x525297 = Array.isArray(_0x33d56c?.uiSchema?.fields) ? _0x33d56c.uiSchema.fields : [];
  const _0x1b4595 = String(_0x33d56c?.displayName || _0x33d56c?.modelId || "当前模型").trim();
  for (const _0x5a8761 of _0x525297) {
    const _0x48a6cd = String(_0x5a8761?.id || "").trim();
    if (!_0x48a6cd) {
      continue;
    }
    const _0x5ba7e8 = readExplicitUiSchemaValue(_0xf1d9ca, _0x48a6cd);
    if (!_0x5ba7e8.provided || _0x5ba7e8.value === undefined || _0x5ba7e8.value === null || String(_0x5ba7e8.value).trim() === "") {
      continue;
    }
    const _0x9c00b2 = (Array.isArray(_0x5a8761?.options) ? _0x5a8761.options : []).map(_0x1dbf04 => _0x1dbf04 && typeof _0x1dbf04 === "object" && !Array.isArray(_0x1dbf04) ? _0x1dbf04.value : _0x1dbf04);
    const _0x383bab = resolveStrictUiSchemaFieldLabel(_0x5a8761);
    if (_0x9c00b2.length > 0 && !_0x9c00b2.some(_0x53b7dc => isSameStrictUiSchemaOption(_0x53b7dc, _0x5ba7e8.value))) {
      throw new Error("便宜渠道 " + _0x1b4595 + " 的" + _0x383bab + "不支持“" + _0x5ba7e8.value + "”，可选：" + _0x9c00b2.join(" / "));
    }
    const _0x487e0a = String(_0x5a8761?.type || "").trim().toLowerCase();
    if (_0x487e0a === "toggle") {
      const _0x1afc69 = String(_0x5ba7e8.value).trim().toLowerCase();
      if (_0x5ba7e8.value !== true && _0x5ba7e8.value !== false && !["true", "false", "1", "0", "yes", "no", "on", "off"].includes(_0x1afc69)) {
        throw new Error("便宜渠道 " + _0x1b4595 + " 的" + _0x383bab + "只能开启或关闭");
      }
      continue;
    }
    if (!["slider", "stepper"].includes(_0x487e0a) || _0x9c00b2.length > 0) {
      continue;
    }
    const _0x47c94d = Number(_0x5ba7e8.value);
    const _0x2fd16d = Number(_0x5a8761?.min);
    const _0x2948d7 = Number(_0x5a8761?.max);
    const _0x1a8a46 = Number(_0x5a8761?.step);
    if (!Number.isFinite(_0x47c94d)) {
      throw new Error("便宜渠道 " + _0x1b4595 + " 的" + _0x383bab + "必须是数字");
    }
    if (Number.isFinite(_0x2fd16d) && _0x47c94d < _0x2fd16d) {
      throw new Error("便宜渠道 " + _0x1b4595 + " 的" + _0x383bab + "不能小于 " + _0x2fd16d);
    }
    if (Number.isFinite(_0x2948d7) && _0x47c94d > _0x2948d7) {
      throw new Error("便宜渠道 " + _0x1b4595 + " 的" + _0x383bab + "不能大于 " + _0x2948d7);
    }
    if (Number.isFinite(_0x1a8a46) && _0x1a8a46 > 0 && Number.isFinite(_0x2fd16d) && Math.abs((_0x47c94d - _0x2fd16d) / _0x1a8a46 - Math.round((_0x47c94d - _0x2fd16d) / _0x1a8a46)) > 1e-9) {
      throw new Error("便宜渠道 " + _0x1b4595 + " 的" + _0x383bab + "必须按 " + _0x1a8a46 + " 递增");
    }
  }
}
function validateStrictImageInputCounts(_0x21a1a5, _0x512e2e, _0x41dadf) {
  if (_0x41dadf?.extensions?.strictInputCounts !== true) {
    return;
  }
  const _0x25aa22 = getManifestMaxInputCount(_0x512e2e, "image");
  if (_0x25aa22 === null) {
    return;
  }
  const _0x8abf86 = Array.from(new Set([...collectRawImageInputUrls(_0x21a1a5, _0x512e2e), ...(Array.isArray(_0x21a1a5?.images) ? _0x21a1a5.images : [])].map(_0x11fe53 => String(_0x11fe53 || "").trim()).filter(Boolean)));
  if (_0x8abf86.length <= _0x25aa22) {
    return;
  }
  throw new Error("便宜渠道当前模型最多支持 " + _0x25aa22 + " 张参考图，当前传入 " + _0x8abf86.length + " 张，请删减后重试");
}
function omitSlotImageUrlsFromVideoInputs(_0x1abea0 = {}) {
  const _0x2be7b4 = new Set(Object.values(normalizeInputUrlsBySlot(_0x1abea0.inputUrlsBySlot)).map(_0x3e4477 => String(_0x3e4477 || "").trim()).filter(Boolean));
  if (_0x2be7b4.size === 0) {
    return _0x1abea0;
  }
  const _0x367ba7 = _0x55a18a => Array.isArray(_0x55a18a) ? _0x55a18a.filter(_0x12275a => !_0x2be7b4.has(String(_0x12275a || "").trim())) : _0x55a18a;
  return {
    ..._0x1abea0,
    images: _0x367ba7(_0x1abea0.images),
    inputUrls: _0x367ba7(_0x1abea0.inputUrls)
  };
}
const VIDEO_MODEL_API_PROVIDERS = new Set(["agnes", "apimart", "binghuo", "minimax", "runninghub", "volcengine"]);
const IMAGE_MODEL_API_PROVIDERS = new Set(["agnes", "apimart", "binghuo", "ppio", "grsai", "runninghub", "volcengine"]);
const AUDIO_MODEL_API_PROVIDERS = new Set(["volcengine-speech"]);
function getProviderUploadLabel(_0x167bf2) {
  const _0x19c661 = String(_0x167bf2 || "").trim().toLowerCase();
  if (_0x19c661 === "agnes") {
    return "Agnes AI";
  }
  if (_0x19c661 === "runninghub") {
    return "RunningHub";
  }
  if (_0x19c661 === "apimart") {
    return "APIMART";
  }
  if (_0x19c661 === "volcengine") {
    return "Volcengine";
  }
  return _0x19c661 || "Model API";
}
function isVolcengineContentGenerationMediaUrl(_0x5b6a8d) {
  return /^(?:https?:|asset:\/\/)/i.test(String(_0x5b6a8d || "").trim());
}
function getVolcengineContentGenerationMediaLabel(_0x512843) {
  if (_0x512843 === "image") {
    return "图片";
  }
  if (_0x512843 === "video") {
    return "视频";
  }
  if (_0x512843 === "audio") {
    return "音频";
  }
  return "素材";
}
function isVolcengineFileId(_0x4e9205) {
  return /^file-[A-Za-z0-9_-]+/.test(String(_0x4e9205 || "").trim());
}
function throwVolcengineFilesApiInputError(_0x51328a) {
  const _0x1fc908 = getVolcengineContentGenerationMediaLabel(_0x51328a);
  throw new Error("Volcengine Seedance " + _0x1fc908 + " input cannot use Files API file_id directly; use a public URL or asset:// asset ID");
}
function assertNoVolcengineFileIds(_0x4f5a1f, _0x336045) {
  for (const _0x583871 of normalizeInputList(_0x4f5a1f)) {
    if (isVolcengineFileId(_0x583871)) {
      throwVolcengineFilesApiInputError(_0x336045);
    }
  }
}
function resolveVolcengineContentGenerationMediaUrls(_0x537251, _0x4100a2) {
  const _0x1cd410 = getVolcengineContentGenerationMediaLabel(_0x4100a2);
  const _0x55630f = [];
  for (const _0x253de3 of normalizeInputList(_0x537251)) {
    if (isVolcengineContentGenerationMediaUrl(_0x253de3)) {
      _0x55630f.push(_0x253de3);
      continue;
    }
    if (isVolcengineFileId(_0x253de3)) {
      throwVolcengineFilesApiInputError(_0x4100a2);
    }
    throw new Error("Volcengine Seedance " + _0x1cd410 + " input needs a public URL or asset:// asset ID; local files require an upload channel that returns a model-usable URL");
  }
  return _0x55630f;
}
async function resolveVideoInputImages(_0x1afb4c, _0x5d095a, _0xc43bcd, _0x20f3f4 = {}) {
  const _0x3baa69 = String(_0x20f3f4.provider || "apimart").trim().toLowerCase();
  const _0x1e6dfe = getProviderUploadLabel(_0x3baa69);
  const _0x16f288 = getManifestMaxInputCount(_0x20f3f4.modelManifest, "image");
  if (_0x16f288 === 0) {
    return [];
  }
  const _0xda1a09 = collectVideoImageInputUrls(_0x1afb4c);
  if (_0xda1a09.length === 0) {
    return [];
  }
  const _0x588847 = _0x16f288 === null ? _0xda1a09 : _0xda1a09.slice(0, Math.max(0, _0x16f288));
  if (_0x3baa69 === "volcengine") {
    assertNoVolcengineFileIds(_0x588847, "image");
  }
  assertNoUnsupportedApimartAssetUrls(_0x3baa69, _0x588847, _0x20f3f4, "image");
  const _0x4d6c49 = await resolveConfiguredImageInputUpload(_0x3baa69, _0x588847, _0x5d095a, _0xc43bcd, _0x20f3f4);
  if (_0x4d6c49.handled) {
    if (Array.isArray(_0x4d6c49.urls)) {
      return _0x4d6c49.urls.map(_0x1bc7a3 => String(_0x1bc7a3 || "").trim()).filter(Boolean);
    } else {
      return [];
    }
  }
  if (_0x3baa69 === "volcengine") {
    if (isConfiguredObjectStorageEnabled()) {
      return await uploadModelApiMediaInputs("image", _0x588847, _0xc43bcd, {
        strictUpload: true
      });
    }
    return resolveVolcengineContentGenerationMediaUrls(_0x588847, "image");
  }
  if (typeof _0xc43bcd.processInputImages !== "function") {
    throw new Error(_0x1e6dfe + " image input upload is not available");
  }
  const _0x5ec796 = _0x3baa69 === "apimart" || _0x3baa69 === "grsai" || _0x3baa69 === "runninghub";
  const _0x5d22ef = _0x3baa69 === "apimart" || _0x3baa69 === "runninghub";
  const _0x4e76f7 = await uploadModelApiMediaInputs("image", _0x588847, _0xc43bcd, {
    ...(_0x5ec796 ? {
      apiKey: _0x5d095a,
      fallbackProvider: _0x3baa69
    } : {}),
    ...(_0x5d22ef ? {
      apiUrl: _0x20f3f4.baseUrl,
      providerProfileId: _0x1afb4c.providerProfileId
    } : {}),
    uploadOptions: {
      applyInputQualityProfile: true
    },
    strictUpload: true
  });
  if (Array.isArray(_0x4e76f7)) {
    return _0x4e76f7.map(_0x282c1f => String(_0x282c1f || "").trim()).filter(Boolean);
  } else {
    return [];
  }
}
async function resolveInputVideos(_0x52a423, _0x2161d1, _0x4936c6, _0xd2f630 = {}) {
  const _0x246bc9 = String(_0xd2f630.provider || "apimart").trim().toLowerCase();
  const _0x329339 = getProviderUploadLabel(_0x246bc9);
  const _0x2ddec5 = getManifestMaxInputCount(_0xd2f630.modelManifest, "video");
  if (_0x2ddec5 === 0) {
    return [];
  }
  const _0xbc56c = collectVideoInputUrls(_0x52a423);
  if (_0xbc56c.length === 0) {
    return [];
  }
  const _0x4685c9 = _0x2ddec5 === null ? _0xbc56c : _0xbc56c.slice(0, _0x2ddec5);
  if (_0x246bc9 === "volcengine") {
    assertNoVolcengineFileIds(_0x4685c9, "video");
  }
  assertNoUnsupportedApimartAssetUrls(_0x246bc9, _0x4685c9, _0xd2f630, "video");
  const _0x961c7d = await resolveConfiguredMediaInputUpload(_0x246bc9, "video", _0x4685c9, _0x2161d1, _0x4936c6, _0xd2f630);
  if (_0x961c7d.handled) {
    if (Array.isArray(_0x961c7d.urls)) {
      return _0x961c7d.urls.map(_0x446bb8 => String(_0x446bb8 || "").trim()).filter(Boolean);
    } else {
      return [];
    }
  }
  if (_0x246bc9 === "volcengine") {
    if (isConfiguredObjectStorageEnabled()) {
      return await uploadModelApiMediaInputs("video", _0x4685c9, _0x4936c6, {
        strictUpload: true
      });
    }
    return resolveVolcengineContentGenerationMediaUrls(_0x4685c9, "video");
  }
  if (typeof _0x4936c6.processInputVideos !== "function") {
    throw new Error(_0x329339 + " video input upload is not available");
  }
  const _0x4c6f4e = await uploadModelApiMediaInputs("video", _0x4685c9, _0x4936c6, {
    strictUpload: true,
    ...(_0x246bc9 === "runninghub" ? {
      apiKey: _0x2161d1,
      apiUrl: _0xd2f630.baseUrl,
      providerProfileId: _0x52a423.providerProfileId
    } : {})
  });
  if (!Array.isArray(_0x4c6f4e) || _0x4c6f4e.length === 0) {
    throw new Error(_0x329339 + " video upload failed");
  }
  return _0x4c6f4e.map(_0x52725d => String(_0x52725d || "").trim()).filter(Boolean);
}
async function resolveInputAudios(_0x414f11, _0x2b94e6, _0x106d6b, _0x2c8bb2 = {}) {
  const _0x38a9b4 = String(_0x2c8bb2.provider || "apimart").trim().toLowerCase();
  const _0x800771 = getProviderUploadLabel(_0x38a9b4);
  const _0xf2b418 = getManifestMaxInputCount(_0x2c8bb2.modelManifest, "audio");
  if (_0xf2b418 === 0) {
    return [];
  }
  const _0x3c47ba = collectAudioInputUrls(_0x414f11);
  if (_0x3c47ba.length === 0) {
    return [];
  }
  const _0x46a119 = _0xf2b418 === null ? _0x3c47ba : _0x3c47ba.slice(0, _0xf2b418);
  if (_0x38a9b4 === "volcengine") {
    assertNoVolcengineFileIds(_0x46a119, "audio");
  }
  assertNoUnsupportedApimartAssetUrls(_0x38a9b4, _0x46a119, _0x2c8bb2, "audio");
  const _0x8afb53 = await resolveConfiguredMediaInputUpload(_0x38a9b4, "audio", _0x46a119, _0x2b94e6, _0x106d6b, _0x2c8bb2);
  if (_0x8afb53.handled) {
    if (Array.isArray(_0x8afb53.urls)) {
      return _0x8afb53.urls.map(_0x4aeca2 => String(_0x4aeca2 || "").trim()).filter(Boolean);
    } else {
      return [];
    }
  }
  if (_0x38a9b4 === "volcengine") {
    if (isConfiguredObjectStorageEnabled()) {
      return await uploadModelApiMediaInputs("audio", _0x46a119, _0x106d6b, {
        strictUpload: true
      });
    }
    return resolveVolcengineContentGenerationMediaUrls(_0x46a119, "audio");
  }
  if (typeof _0x106d6b.processInputAudios !== "function") {
    throw new Error(_0x800771 + " audio input upload is not available");
  }
  const _0x263df1 = await uploadModelApiMediaInputs("audio", _0x46a119, _0x106d6b, {
    strictUpload: true,
    ...(_0x38a9b4 === "runninghub" ? {
      apiKey: _0x2b94e6,
      apiUrl: _0x2c8bb2.baseUrl,
      providerProfileId: _0x414f11.providerProfileId
    } : {})
  });
  if (!Array.isArray(_0x263df1) || _0x263df1.length === 0) {
    throw new Error(_0x800771 + " audio upload failed");
  }
  return _0x263df1.map(_0x34a1be => String(_0x34a1be || "").trim()).filter(Boolean);
}
function resolveProviderRatioSize(_0x4ac238, {
  context: _0x2c6e4a
}) {
  const _0x13d5ff = _0x2c6e4a.payload || {};
  if (_0x13d5ff.suppressAspectRatio) {
    return undefined;
  }
  const _0x1574cf = String(_0x4ac238 || _0x13d5ff.resolvedRatioLabel || _0x13d5ff.aspectRatio || "").trim().toLowerCase();
  const _0xf0c354 = _0x1574cf === "auto" || _0x1574cf === "adaptive" || _0x1574cf === "default" || _0x1574cf === "自适应";
  const _0x239029 = getApimartSeedreamPolicy(_0x2c6e4a);
  if (_0x239029.preserveAdaptiveInputRatio === true && _0xf0c354 && hasSeedreamInputImages(_0x2c6e4a)) {
    return "auto";
  }
  const _0x509d79 = _0x2c6e4a.body?.resolution || _0x13d5ff.imageSize || "2K";
  const _0x426690 = resolveProviderRatioPayload({
    provider: _0x2c6e4a.provider,
    model: _0x13d5ff.model,
    ratioLabel: _0x4ac238 || _0x13d5ff.resolvedRatioLabel || _0x13d5ff.aspectRatio,
    imageSize: _0x509d79,
    suppressAspectRatio: _0x13d5ff.suppressAspectRatio
  });
  return _0x426690?.params?.size || undefined;
}
function normalizeCustomProviderOpenAiImageSize(_0xcbddf1, {
  context: _0x53908d
} = {}) {
  const _0x1905ce = _0x53908d?.payload || {};
  const _0x23261d = String(_0xcbddf1 || _0x1905ce?.generationParams?.imageSize || _0x1905ce?.imageSize || "1024x1024").trim();
  const _0x3c909f = _0x23261d.match(/^(\d{2,5})\s*[xX×]\s*(\d{2,5})$/);
  if (_0x3c909f) {
    return Number(_0x3c909f[1]) + "x" + Number(_0x3c909f[2]);
  }
  const _0x5f425e = String(_0x1905ce?.generationParams?.aspectRatio || _0x1905ce?.resolvedRatioLabel || _0x1905ce?.aspectRatio || "").trim();
  if (!_0x5f425e || isAdaptiveRatioLabel(_0x5f425e)) {
    return "1024x1024";
  }
  const _0x1e73d4 = parseRatioLabel(_0x5f425e);
  if (!_0x1e73d4) {
    return "1024x1024";
  }
  const _0x40168d = _0x1e73d4.w / _0x1e73d4.h;
  if (Math.abs(_0x40168d - 1) < 0.05) {
    return "1024x1024";
  }
  if (_0x40168d > 1) {
    return "1536x1024";
  } else {
    return "1024x1536";
  }
}
function normalizeCustomProviderDocumentedValueMap(_0x4baaee, {
  spec: _0x4302a2
} = {}) {
  const _0x977dba = Array.isArray(_0x4302a2?.values) ? _0x4302a2.values : [];
  const _0x1b5c3c = _0x977dba.find(_0x449bac => _0x449bac && (Object.is(_0x449bac.uiValue, _0x4baaee) || String(_0x449bac.uiValue) === String(_0x4baaee)));
  if (!_0x1b5c3c || !Object.prototype.hasOwnProperty.call(_0x1b5c3c, "requestValue")) {
    throw new Error("Custom provider documented value mapping is missing for the selected option");
  }
  return _0x1b5c3c.requestValue;
}
function normalizeCustomProviderDimensionMap(_0x2ad301, {
  context: _0x36ccd4,
  spec: _0x91b880
} = {}) {
  const _0x532337 = _0x36ccd4?.payload || {};
  const _0x2a671d = _0x532337.generationParams || {};
  const _0x154b71 = _0x2a671d.imageSize ?? _0x532337.imageSize;
  const _0x40be45 = _0x2ad301 ?? _0x2a671d.aspectRatio ?? _0x532337.resolvedRatioLabel ?? _0x532337.aspectRatio;
  const _0x890e8e = Array.isArray(_0x91b880?.values) ? _0x91b880.values : [];
  const _0x85c387 = _0x890e8e.find(_0x216f09 => _0x216f09 && String(_0x216f09.imageSize) === String(_0x154b71) && String(_0x216f09.aspectRatio) === String(_0x40be45));
  if (!_0x85c387 || !Object.prototype.hasOwnProperty.call(_0x85c387, "requestValue")) {
    throw new Error("Custom provider documented dimension mapping is missing for the selected resolution and ratio");
  }
  return _0x85c387.requestValue;
}
function firstArrayItem(_0x1b3318) {
  if (Array.isArray(_0x1b3318)) {
    return _0x1b3318[0] || undefined;
  }
  return _0x1b3318 || undefined;
}
function secondArrayItem(_0x3e86bc) {
  if (Array.isArray(_0x3e86bc)) {
    return _0x3e86bc[1] || undefined;
  }
  return undefined;
}
function normalizeBooleanParam(_0xae00c3) {
  if (_0xae00c3 === true || _0xae00c3 === false) {
    return _0xae00c3;
  }
  const _0x5e7f28 = String(_0xae00c3 ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(_0x5e7f28)) {
    return true;
  }
  if (["false", "0", "no", "off", ""].includes(_0x5e7f28)) {
    return false;
  }
  return Boolean(_0xae00c3);
}
function normalizeNumberParam(_0x2712ea) {
  if (_0x2712ea === undefined || _0x2712ea === null || String(_0x2712ea).trim() === "") {
    return undefined;
  }
  const _0x42b065 = Number(_0x2712ea);
  if (Number.isFinite(_0x42b065)) {
    return _0x42b065;
  } else {
    return undefined;
  }
}
function normalizeIntegerParam(_0x232567) {
  const _0xd6f16e = normalizeNumberParam(_0x232567);
  if (Number.isFinite(_0xd6f16e)) {
    return Math.trunc(_0xd6f16e);
  } else {
    return undefined;
  }
}
function normalizeStringParam(_0x186e15) {
  if (_0x186e15 === undefined || _0x186e15 === null) {
    return undefined;
  }
  return String(_0x186e15);
}
function normalizeApimartImageCount(_0x80a1bd) {
  const _0x53c5a8 = Number.parseInt(String(_0x80a1bd ?? "").trim(), 10);
  if (!Number.isFinite(_0x53c5a8)) {
    return 1;
  }
  return Math.max(1, Math.min(4, _0x53c5a8));
}
function normalizeApimartQwenImageCount(_0x490cd7) {
  const _0xbbeb7b = Number.parseInt(String(_0x490cd7 ?? "").trim(), 10);
  if (!Number.isFinite(_0xbbeb7b)) {
    return 1;
  }
  return Math.max(1, Math.min(6, _0xbbeb7b));
}
function normalizeApimartQwenImageResolution(_0x4439ce) {
  const _0x19937a = String(_0x4439ce || "1K").trim().toUpperCase();
  if (_0x19937a === "2K") {
    return "2K";
  } else {
    return "1K";
  }
}
function getApimartSeedreamPolicy(_0x4d6dde = {}) {
  const _0x453d44 = _0x4d6dde.executionManifest?.extensions?.apimartSeedream;
  if (_0x453d44 && typeof _0x453d44 === "object" && !Array.isArray(_0x453d44)) {
    return _0x453d44;
  } else {
    return {};
  }
}
function getVolcengineSeedreamPolicy(_0x5d312c = {}) {
  const _0x859ba2 = _0x5d312c.executionManifest?.extensions?.volcengineSeedream;
  if (_0x859ba2 && typeof _0x859ba2 === "object" && !Array.isArray(_0x859ba2)) {
    return _0x859ba2;
  } else {
    return {};
  }
}
function normalizeResolutionList(_0x1b411c) {
  if (Array.isArray(_0x1b411c)) {
    return _0x1b411c.map(_0x3d3b2e => String(_0x3d3b2e || "").trim().toUpperCase()).filter(Boolean);
  } else {
    return [];
  }
}
function normalizeApimartSeedreamResolution(_0x3209fc, {
  context: _0x124a94
} = {}) {
  const _0x577efa = getApimartSeedreamPolicy(_0x124a94);
  const _0x2cb4ed = String(_0x3209fc || "2K").trim().toUpperCase();
  const _0x4c107f = normalizeResolutionList(_0x577efa.allowedResolutions);
  if (_0x4c107f.includes(_0x2cb4ed)) {
    return _0x2cb4ed;
  } else {
    return "2K";
  }
}
function normalizeVolcengineSeedreamResolution(_0x334e03, {
  context: _0x3a0c6e
} = {}) {
  const _0x282fa3 = getVolcengineSeedreamPolicy(_0x3a0c6e);
  const _0x2ae4be = String(_0x282fa3.defaultResolution || "2K").trim().toUpperCase();
  const _0x2fc720 = String(_0x334e03 || _0x2ae4be).trim().toUpperCase();
  const _0x2b55ba = normalizeResolutionList(_0x282fa3.allowedResolutions);
  if (_0x2b55ba.includes(_0x2fc720)) {
    return _0x2fc720;
  } else {
    return _0x2ae4be;
  }
}
function hasSeedreamInputImages(_0x2f4ada = {}) {
  if (Array.isArray(_0x2f4ada.inputImages) && _0x2f4ada.inputImages.length > 0) {
    return true;
  }
  const _0x22f805 = _0x2f4ada.payload || {};
  const _0x1a1f4f = [_0x22f805.inputUrls, _0x22f805.image_urls, _0x22f805.imageUrls, _0x22f805.image, _0x22f805.images];
  return _0x1a1f4f.some(_0x127629 => Array.isArray(_0x127629) ? _0x127629.some(_0x7ec191 => String(_0x7ec191 || "").trim()) : String(_0x127629 || "").trim());
}
function hasManifestInputImages(_0x3927a1 = {}) {
  if (Array.isArray(_0x3927a1.inputImages) && _0x3927a1.inputImages.length > 0) {
    return true;
  }
  const _0x2e8ba0 = _0x3927a1.payload || {};
  const _0x2e8e13 = [_0x2e8ba0.inputUrls, _0x2e8ba0.image_urls, _0x2e8ba0.imageUrls, _0x2e8ba0.image, _0x2e8ba0.images];
  return _0x2e8e13.some(_0x160d21 => Array.isArray(_0x160d21) ? _0x160d21.some(_0x4476b7 => String(_0x4476b7 || "").trim()) : String(_0x160d21 || "").trim()) || Object.values(normalizeInputUrlsBySlot(_0x2e8ba0.inputUrlsBySlot)).some(Boolean);
}
function normalizeApimartSeedreamImageCount(_0x54082c, {
  context: _0x35ae43
} = {}) {
  const _0x44b7f4 = getApimartSeedreamPolicy(_0x35ae43);
  const _0x321117 = Number.parseInt(String(_0x54082c ?? "").trim(), 10);
  const _0xe2e253 = Number.isFinite(_0x321117) ? _0x321117 : 1;
  const _0x52f10f = Number.parseInt(String(_0x44b7f4.maxBatchSize ?? 1).trim(), 10);
  const _0x3ad199 = Number.isFinite(_0x52f10f) && _0x52f10f >= 1 ? _0x52f10f : 1;
  const _0x34cc52 = Math.max(1, Math.min(_0x3ad199, _0xe2e253));
  if (!hasSeedreamInputImages(_0x35ae43)) {
    const _0x106708 = Number.parseInt(String(_0x44b7f4.textToImageBatchSize ?? "").trim(), 10);
    if (Number.isFinite(_0x106708) && _0x106708 >= 1) {
      return Math.min(_0x34cc52, _0x106708);
    }
  }
  return _0x34cc52;
}
function normalizeVolcengineSeedreamCountValue(_0x5b0b40, _0x1c510c = {}) {
  const _0x2ccca0 = getVolcengineSeedreamPolicy(_0x1c510c);
  const _0x56c3f9 = Number.parseInt(String(_0x5b0b40 ?? "").trim(), 10);
  const _0x49ce6e = Number.isFinite(_0x56c3f9) ? _0x56c3f9 : 1;
  const _0x3fb65a = Number.parseInt(String(_0x2ccca0.maxBatchSize ?? 1).trim(), 10);
  const _0x1c6ac9 = Number.isFinite(_0x3fb65a) && _0x3fb65a >= 1 ? _0x3fb65a : 1;
  return Math.max(1, Math.min(_0x1c6ac9, _0x49ce6e));
}
function normalizeVolcengineSeedreamImageCount(_0x3020b7, {
  context: _0x143836
} = {}) {
  const _0xdb990c = normalizeVolcengineSeedreamCountValue(_0x3020b7, _0x143836);
  if (_0xdb990c > 1) {
    return _0xdb990c;
  } else {
    return undefined;
  }
}
function resolveVolcengineSeedreamSequentialMode(_0x1b1184, {
  context: _0x3eeac2
} = {}) {
  const _0xff5dc1 = normalizeVolcengineSeedreamCountValue(_0x1b1184, _0x3eeac2);
  if (_0xff5dc1 > 1) {
    return "auto";
  } else {
    return "disabled";
  }
}
function resolveVolcengineSeedreamSize(_0x1a9aa2, {
  context: _0x985ab8
} = {}) {
  const _0x3c5bcf = _0x985ab8?.payload || {};
  const _0x4c36f6 = getVolcengineSeedreamPolicy(_0x985ab8);
  const _0x3f3bfe = normalizeVolcengineSeedreamResolution(_0x3c5bcf.imageSize, {
    context: _0x985ab8
  });
  if (_0x3c5bcf.suppressAspectRatio) {
    return _0x3f3bfe;
  }
  const _0x4b207d = String(_0x1a9aa2 || _0x3c5bcf.resolvedRatioLabel || _0x3c5bcf.aspectRatio || "").trim();
  const _0x57f5e1 = _0x4b207d.toLowerCase();
  const _0x319ab0 = !_0x4b207d || _0x57f5e1 === "auto" || _0x57f5e1 === "adaptive" || _0x57f5e1 === "自适应";
  if (_0x4c36f6.preserveAdaptiveInputRatio === true && _0x4c36f6.supportsAdaptiveSize === true && _0x319ab0 && hasSeedreamInputImages(_0x985ab8)) {
    return "adaptive";
  }
  const _0x2ea7c4 = resolveProviderRatioPayload({
    provider: _0x985ab8.provider,
    model: _0x3c5bcf.model,
    ratioLabel: _0x4b207d || _0x3c5bcf.resolvedRatioLabel || _0x3c5bcf.aspectRatio || "1:1",
    imageSize: _0x3f3bfe,
    suppressAspectRatio: false
  });
  const _0x45f837 = _0x2ea7c4?.resolvedRatioLabel || "1:1";
  const _0x1a2582 = _0x4c36f6.dimensionMapByResolution && typeof _0x4c36f6.dimensionMapByResolution === "object" ? _0x4c36f6.dimensionMapByResolution[_0x3f3bfe] : null;
  if (_0x1a2582?.[_0x45f837]) {
    return _0x1a2582[_0x45f837];
  }
  const _0xc6aa1a = Number(_0x2ea7c4?.params?.width);
  const _0x36b942 = Number(_0x2ea7c4?.params?.height);
  if (Number.isFinite(_0xc6aa1a) && _0xc6aa1a > 0 && Number.isFinite(_0x36b942) && _0x36b942 > 0) {
    return Math.round(_0xc6aa1a) + "x" + Math.round(_0x36b942);
  }
  return _0x3f3bfe;
}
function normalizeApimartWanImageResolution(_0x2fe5e8, {
  context: _0x32c645
} = {}) {
  const _0x103dbf = String(_0x2fe5e8 || "2K").trim().toUpperCase();
  const _0x360c70 = String(_0x32c645?.modelToken || "").trim().toLowerCase();
  if (_0x103dbf === "1K") {
    return "1K";
  }
  if (_0x103dbf === "4K" && _0x360c70 === "wan2.7-image-pro" && !hasManifestInputImages(_0x32c645)) {
    return "4K";
  }
  return "2K";
}
function normalizeApimartVideoResolutionUpper(_0x3a5c74) {
  const _0x9b4f16 = String(_0x3a5c74 || "720P").trim().toUpperCase();
  if (_0x9b4f16 === "1080P") {
    return "1080P";
  }
  if (_0x9b4f16 === "720P") {
    return "720P";
  }
  if (_0x9b4f16 === "540P") {
    return "540P";
  }
  if (_0x9b4f16 === "480P") {
    return "480P";
  }
  return "720P";
}
function normalizeApimartVideoResolutionLower(_0x4e0b59) {
  const _0x4300f9 = String(_0x4e0b59 || "720p").trim().toLowerCase();
  if (_0x4300f9 === "1080p") {
    return "1080p";
  }
  return "720p";
}
function normalizeApimartVeo3VideoResolution(_0x42325a) {
  const _0x1a545b = String(_0x42325a || "720p").trim().toLowerCase();
  if (_0x1a545b === "4k") {
    return "4k";
  }
  if (_0x1a545b === "1080p") {
    return "1080p";
  }
  return "720p";
}
function normalizeApimartViduQ3ModelToken(_0x11ec80 = {}) {
  return String(_0x11ec80?.modelToken || _0x11ec80?.body?.model || _0x11ec80?.payload?.generationParams?.mode || _0x11ec80?.payload?.mode || "viduq3-turbo").trim().toLowerCase();
}
function normalizeApimartViduVideoResolution(_0x3acbd8, {
  context: _0x284e50
} = {}) {
  const _0x379c9f = String(_0x3acbd8 || "720p").trim().toLowerCase();
  const _0x2696f2 = normalizeApimartViduQ3ModelToken(_0x284e50);
  if (_0x2696f2 === "viduq3-mix") {
    if (_0x379c9f === "1080p") {
      return "1080p";
    } else {
      return "720p";
    }
  }
  if (_0x379c9f === "540p" || _0x379c9f === "720p" || _0x379c9f === "1080p") {
    return _0x379c9f;
  }
  return "720p";
}
function normalizeApimartViduVideoDuration(_0xf49342, {
  context: _0x3b2cd0
} = {}) {
  const _0x205109 = normalizeApimartViduQ3ModelToken(_0x3b2cd0);
  const _0x509ffc = _0x205109 === "viduq3" ? 3 : 1;
  const _0x3765c9 = 16;
  const _0x9c5bee = Number(_0xf49342);
  const _0x530ee1 = 5;
  const _0x168734 = Number.isFinite(_0x9c5bee) ? Math.trunc(_0x9c5bee) : _0x530ee1;
  return Math.min(_0x3765c9, Math.max(_0x509ffc, _0x168734));
}
function normalizeApimartHailuoVideoResolution(_0x24d289) {
  const _0x37ca49 = String(_0x24d289 || "768p").trim().toLowerCase();
  if (_0x37ca49 === "512p" || _0x37ca49 === "768p" || _0x37ca49 === "1080p") {
    return _0x37ca49;
  }
  return "768p";
}
function normalizeApimartHailuoVideoDuration(_0x171f38, {
  context: _0x4d9b55
} = {}) {
  const _0x25a7e3 = String(_0x4d9b55?.body?.resolution || _0x4d9b55?.payload?.generationParams?.resolution || _0x4d9b55?.payload?.resolution || "").trim().toLowerCase();
  if (_0x25a7e3 === "1080p") {
    return 5;
  }
  if (Number(_0x171f38) === 10) {
    return 10;
  } else {
    return 5;
  }
}
function normalizeApimartHailuo23VideoResolution(_0x2d31f0) {
  const _0x18059a = String(_0x2d31f0 || "768p").trim().toLowerCase();
  if (_0x18059a === "1080p") {
    return "1080p";
  }
  return "768p";
}
function normalizeApimartHailuo23VideoDuration(_0xbf93d2, {
  context: _0x1539be
} = {}) {
  const _0xb04a79 = String(_0x1539be?.body?.resolution || _0x1539be?.payload?.generationParams?.resolution || _0x1539be?.payload?.resolution || "").trim().toLowerCase();
  if (_0xb04a79 === "1080p") {
    return 6;
  }
  if (Number(_0xbf93d2) === 10) {
    return 10;
  } else {
    return 6;
  }
}
function normalizeApimartVideoRatio(_0x191ba7) {
  const _0x584fe9 = String(_0x191ba7 ?? "").trim();
  const _0x5a52a3 = _0x584fe9.toLowerCase();
  if (!_0x584fe9 || _0x5a52a3 === "auto" || _0x5a52a3 === "adaptive" || _0x5a52a3 === "default" || _0x584fe9 === "自适应" || _0x584fe9 === "默认") {
    return undefined;
  }
  return _0x584fe9;
}
const AGNES_IMAGE_SIZE_BY_RATIO = Object.freeze({
  "1:1": "1024x1024",
  "4:3": "1024x768",
  "3:4": "768x1024",
  "3:2": "1024x682",
  "2:3": "682x1024",
  "16:9": "1024x576",
  "9:16": "576x1024"
});
const AGNES_IMAGE_SIZE_SCALE_BY_QUALITY = Object.freeze({
  "1K": 1,
  "2K": 2,
  "3K": 3,
  "4K": 4
});
const AGNES_VIDEO_DIMENSIONS_BY_RATIO = Object.freeze({
  "1:1": Object.freeze({
    width: 1024,
    height: 1024
  }),
  "4:3": Object.freeze({
    width: 1024,
    height: 768
  }),
  "3:4": Object.freeze({
    width: 768,
    height: 1024
  }),
  "3:2": Object.freeze({
    width: 1152,
    height: 768
  }),
  "2:3": Object.freeze({
    width: 768,
    height: 1152
  }),
  "16:9": Object.freeze({
    width: 1152,
    height: 648
  }),
  "9:16": Object.freeze({
    width: 648,
    height: 1152
  })
});
function normalizeAgnesRatioLabel(_0x5260de, _0x11f9af = "4:3") {
  const _0xedd003 = String(_0x5260de || "").trim();
  if (/^\d+x\d+$/i.test(_0xedd003)) {
    return _0xedd003.toLowerCase();
  }
  const _0x565ff8 = _0xedd003.replace(/\s+/g, "").replace("：", ":").toLowerCase();
  if (!_0x565ff8 || ["auto", "adaptive", "default"].includes(_0x565ff8)) {
    return _0x11f9af;
  }
  const _0xb00cdc = /^(\d+)[/:x](\d+)$/i.exec(_0x565ff8);
  if (!_0xb00cdc) {
    return _0x11f9af;
  }
  return Number(_0xb00cdc[1]) + ":" + Number(_0xb00cdc[2]);
}
function normalizeAgnesImageQuality(_0x3cf138, _0x3c4b44 = "1K") {
  const _0x8170f1 = String(_0x3cf138 || "").trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(AGNES_IMAGE_SIZE_SCALE_BY_QUALITY, _0x8170f1)) {
    return _0x8170f1;
  } else {
    return _0x3c4b44;
  }
}
function normalizeAgnesVideoResolution(_0x40d689, _0x43c0c4 = {}) {
  const _0x197073 = String(_0x40d689 || _0x43c0c4?.payload?.generationParams?.resolution || _0x43c0c4?.payload?.resolution || _0x43c0c4?.payload?.videoSize || "720P").trim().toUpperCase();
  if (_0x197073 === "480P") {
    return "480P";
  }
  if (_0x197073 === "1080P") {
    return "1080P";
  } else {
    return "720P";
  }
}
function normalizeAgnesImageSize(_0x1e06e3, {
  context: _0x304d06
} = {}) {
  const _0x5c0759 = _0x1e06e3 || _0x304d06?.payload?.resolvedRatioLabel || _0x304d06?.payload?.generationParams?.aspectRatio || _0x304d06?.payload?.aspectRatio;
  const _0x146e05 = String(_0x5c0759 || "").trim();
  if (/^\d+x\d+$/i.test(_0x146e05)) {
    return _0x146e05.toLowerCase();
  }
  const _0x3b07bc = normalizeAgnesRatioLabel(_0x5c0759, "4:3");
  const _0x1b115c = AGNES_IMAGE_SIZE_BY_RATIO[_0x3b07bc] || AGNES_IMAGE_SIZE_BY_RATIO["4:3"];
  const _0x380cca = normalizeAgnesImageQuality(_0x304d06?.payload?.generationParams?.imageSize || _0x304d06?.payload?.imageSize || _0x304d06?.payload?.resolution);
  const _0x24424c = AGNES_IMAGE_SIZE_SCALE_BY_QUALITY[_0x380cca] || 1;
  if (_0x24424c === 1) {
    return _0x1b115c;
  }
  const [_0x1747ac, _0x197ba7] = _0x1b115c.split("x").map(_0x4e93b8 => Number(_0x4e93b8));
  if (!Number.isFinite(_0x1747ac) || !Number.isFinite(_0x197ba7)) {
    return _0x1b115c;
  }
  return Math.round(_0x1747ac * _0x24424c) + "x" + Math.round(_0x197ba7 * _0x24424c);
}
function resolveAgnesVideoDimensions(_0x4d82fb, _0x38226c = {}) {
  const _0x5e874e = _0x4d82fb || _0x38226c?.payload?.resolvedRatioLabel || _0x38226c?.payload?.generationParams?.aspectRatio || _0x38226c?.payload?.aspectRatio;
  const _0x55f8df = normalizeAgnesRatioLabel(_0x5e874e, "3:2");
  const _0x3e7a37 = AGNES_VIDEO_DIMENSIONS_BY_RATIO[_0x55f8df] || AGNES_VIDEO_DIMENSIONS_BY_RATIO["3:2"];
  const _0x2f5eb0 = normalizeAgnesVideoResolution("", _0x38226c);
  if (_0x2f5eb0 === "480P") {
    return Object.freeze({
      width: Math.max(8, Math.round(_0x3e7a37.width * 2 / 3 / 8) * 8),
      height: Math.max(8, Math.round(_0x3e7a37.height * 2 / 3 / 8) * 8)
    });
  }
  if (_0x2f5eb0 !== "1080P") {
    return _0x3e7a37;
  }
  return Object.freeze({
    width: Math.round(_0x3e7a37.width * 1.5),
    height: Math.round(_0x3e7a37.height * 1.5)
  });
}
function normalizeAgnesVideoWidth(_0x1f0e8d, {
  context: _0xdae3e
} = {}) {
  return resolveAgnesVideoDimensions(_0x1f0e8d, _0xdae3e).width;
}
function normalizeAgnesVideoHeight(_0x4f389a, {
  context: _0x39dfbe
} = {}) {
  return resolveAgnesVideoDimensions(_0x4f389a, _0x39dfbe).height;
}
function normalizeAgnesVideoFrameRate(_0x5b7da0, {
  spec: _0x40f706
} = {}) {
  const _0x369043 = Number(_0x5b7da0);
  const _0x38a713 = Number.isFinite(Number(_0x40f706?.fallback)) ? Math.trunc(Number(_0x40f706.fallback)) : 24;
  const _0x10a48f = Number.isFinite(_0x369043) ? Math.trunc(_0x369043) : _0x38a713;
  const _0x539afe = Number.isFinite(Number(_0x40f706?.min)) ? Math.trunc(Number(_0x40f706.min)) : 1;
  const _0x4e640a = Number.isFinite(Number(_0x40f706?.max)) ? Math.trunc(Number(_0x40f706.max)) : 60;
  return Math.min(Math.max(_0x10a48f, _0x539afe), _0x4e640a);
}
function resolveAgnesVideoFrameRate(_0x46f173 = {}, _0x5a948f = {}) {
  const _0x28b793 = [_0x46f173?.body?.frame_rate, _0x46f173?.payload?.generationParams?.frame_rate, _0x46f173?.payload?.generationParams?.frameRate, _0x46f173?.payload?.frame_rate, _0x46f173?.payload?.frameRate, _0x5a948f?.frameRate];
  for (const _0x31350d of _0x28b793) {
    if (_0x31350d === undefined || _0x31350d === null || String(_0x31350d).trim() === "") {
      continue;
    }
    return normalizeAgnesVideoFrameRate(_0x31350d, {
      spec: {
        min: _0x5a948f?.frameRateMin,
        max: _0x5a948f?.frameRateMax,
        fallback: _0x5a948f?.frameRate
      }
    });
  }
  return normalizeAgnesVideoFrameRate(undefined, {
    spec: {
      min: _0x5a948f?.frameRateMin,
      max: _0x5a948f?.frameRateMax,
      fallback: _0x5a948f?.frameRate
    }
  });
}
function normalizeAgnesVideoNumFrames(_0x31945e, {
  context: _0x2425b9,
  spec: _0x50cf84
} = {}) {
  const _0x59077d = Number(_0x31945e);
  const _0x2fa251 = Number.isFinite(_0x59077d) && _0x59077d > 0 ? _0x59077d : 5;
  const _0x12448d = resolveAgnesVideoFrameRate(_0x2425b9, _0x50cf84);
  const _0x700ae1 = Number.isFinite(Number(_0x50cf84?.min)) ? Math.trunc(Number(_0x50cf84.min)) : 49;
  const _0x134b9d = Number.isFinite(Number(_0x50cf84?.max)) ? Math.trunc(Number(_0x50cf84.max)) : 441;
  const _0x1185b2 = Math.max(1, _0x700ae1);
  const _0x273691 = Math.max(_0x1185b2, _0x134b9d);
  const _0x36f99d = Math.max(_0x1185b2, Math.round(_0x2fa251 * _0x12448d) + 1);
  const _0x4d6cbb = Math.min(_0x36f99d, _0x273691);
  const _0x45a130 = Math.round((_0x4d6cbb - 1) / 8) * 8 + 1;
  return Math.min(_0x273691, Math.max(_0x1185b2, _0x45a130));
}
function normalizeApimartOptionalText(_0x16b912) {
  const _0x4c2017 = String(_0x16b912 ?? "").trim();
  const _0x33b65f = _0x4c2017.toLowerCase();
  if (!_0x4c2017 || _0x33b65f === "auto" || _0x33b65f === "none") {
    return undefined;
  }
  return _0x4c2017;
}
function normalizeApimartOptionalInteger(_0x15dba5) {
  const _0x552653 = String(_0x15dba5 ?? "").trim();
  const _0x1c2ca7 = _0x552653.toLowerCase();
  if (!_0x552653 || _0x1c2ca7 === "auto" || _0x1c2ca7 === "none") {
    return undefined;
  }
  const _0x11fc0d = Number(_0x552653);
  if (Number.isFinite(_0x11fc0d)) {
    return Math.trunc(_0x11fc0d);
  } else {
    return undefined;
  }
}
function resolveSeedModeValue(_0x4870a6 = {}, _0x148962 = "seed_mode", _0x1c0484 = "fixed") {
  const _0x445d11 = String(_0x148962 || "seed_mode").trim();
  const _0x48893f = _0x4870a6?.generationParams && typeof _0x4870a6.generationParams === "object" && !Array.isArray(_0x4870a6.generationParams) ? _0x4870a6.generationParams : {};
  const _0x14dabf = _0x48893f[_0x445d11] ?? _0x48893f.seedMode ?? _0x4870a6[_0x445d11] ?? _0x4870a6.seedMode ?? _0x1c0484;
  const _0x50deb0 = String(_0x14dabf ?? _0x1c0484).trim().toLowerCase();
  if (_0x50deb0 === "random") {
    return "random";
  } else {
    return "fixed";
  }
}
function generateIntegerSeed(_0x10bbf7, _0x2a0100) {
  const _0x1b120c = Math.min(_0x10bbf7, _0x2a0100);
  const _0x10392d = Math.max(_0x10bbf7, _0x2a0100);
  return _0x1b120c + Math.floor(Math.random() * (_0x10392d - _0x1b120c + 1));
}
function normalizeAgnesVideoSeed(_0x3f7706, {
  context: _0x1d2a55,
  spec: _0x135ae3
} = {}) {
  const _0x4286c1 = resolveSeedModeValue(_0x1d2a55?.payload || {}, _0x135ae3?.modeField, _0x135ae3?.defaultMode || "random");
  if (_0x4286c1 === "random") {
    const _0x443ddb = Number.isFinite(Number(_0x135ae3?.min)) ? Math.trunc(Number(_0x135ae3.min)) : 0;
    const _0x37df82 = Number.isFinite(Number(_0x135ae3?.max)) ? Math.trunc(Number(_0x135ae3.max)) : 2147483647;
    return generateIntegerSeed(_0x443ddb, _0x37df82);
  }
  return normalizeApimartOptionalInteger(_0x3f7706);
}
function normalizeIntegerRange(_0x78870c, {
  spec: _0x4f1a2f
} = {}) {
  const _0x43926f = Number(_0x78870c);
  const _0x52b551 = Number.isFinite(Number(_0x4f1a2f?.fallback)) ? Math.trunc(Number(_0x4f1a2f.fallback)) : 0;
  const _0x26fa78 = Number.isFinite(_0x43926f) ? Math.trunc(_0x43926f) : _0x52b551;
  const _0x242bca = Number.isFinite(Number(_0x4f1a2f?.min)) ? Math.trunc(Number(_0x4f1a2f.min)) : _0x26fa78;
  const _0x4bf386 = Number.isFinite(Number(_0x4f1a2f?.max)) ? Math.trunc(Number(_0x4f1a2f.max)) : _0x26fa78;
  return Math.min(Math.max(_0x26fa78, _0x242bca), _0x4bf386);
}
function formatAllowedImageCounts(_0x32f2b3) {
  if (_0x32f2b3.length <= 1) {
    return String(_0x32f2b3[0] ?? "");
  }
  if (_0x32f2b3.length === 2) {
    return _0x32f2b3[0] + " or " + _0x32f2b3[1];
  }
  return _0x32f2b3.slice(0, -1).join(", ") + ", or " + _0x32f2b3.at(-1);
}
function normalizeImageCountOptions(_0x152084, {
  spec: _0x45b254
} = {}) {
  const _0x431e4f = (Array.isArray(_0x152084) ? _0x152084 : []).map(_0x110b79 => String(_0x110b79 || "").trim()).filter(Boolean);
  if (_0x431e4f.length === 0) {
    return _0x431e4f;
  }
  const _0x56f0ef = (Array.isArray(_0x45b254?.allowedCounts) ? _0x45b254.allowedCounts : []).map(_0x7d67e8 => Number(_0x7d67e8)).filter(_0x424821 => Number.isInteger(_0x424821) && _0x424821 >= 0);
  if (_0x56f0ef.length === 0 || _0x56f0ef.includes(_0x431e4f.length)) {
    return _0x431e4f;
  }
  const _0x5f3538 = String(_0x45b254?.label || "This model").trim() || "This model";
  throw new Error(_0x5f3538 + " supports only " + formatAllowedImageCounts(_0x56f0ef) + " reference images");
}
function normalizeApimartKlingVideoMode(_0x39e119) {
  const _0x2c212b = String(_0x39e119 || "").trim().toLowerCase();
  if (_0x2c212b === "pro") {
    return "pro";
  } else {
    return "std";
  }
}
function normalizeApimartKlingVideoMode4k(_0x5cba11) {
  const _0x4c7863 = String(_0x5cba11 || "").trim().toLowerCase();
  if (_0x4c7863 === "4k") {
    return "4k";
  }
  if (_0x4c7863 === "pro") {
    return "pro";
  } else {
    return "std";
  }
}
function normalizeRunningHubKlingVideoMode(_0x4bb0d8) {
  return normalizeApimartKlingVideoMode(_0x4bb0d8);
}
function normalizeRunningHubKlingV3Model(_0x51126f) {
  const _0x156764 = String(_0x51126f || "").trim().toLowerCase();
  if (_0x156764 === "4k") {
    return "4k";
  }
  if (_0x156764 === "pro") {
    return "pro";
  }
  return "std";
}
function normalizeRunningHubKlingV3AspectRatio(_0x5c955e) {
  const _0x4a5c10 = normalizeApimartVideoRatio(_0x5c955e);
  if (["16:9", "9:16", "1:1"].includes(_0x4a5c10)) {
    return _0x4a5c10;
  } else {
    return undefined;
  }
}
function normalizeRunningHubKlingV3Duration(_0x37258e) {
  const _0x3869c2 = Math.trunc(Number(_0x37258e));
  const _0x4e1c35 = Number.isFinite(_0x3869c2) ? _0x3869c2 : 5;
  return String(Math.min(15, Math.max(3, _0x4e1c35)));
}
function normalizeRunningHubKlingV3CfgScale(_0x4c68c2) {
  const _0x197960 = Number(_0x4c68c2);
  if (!Number.isFinite(_0x197960)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, Math.round(_0x197960 * 10) / 10));
}
function normalizeRunningHubKlingV3ShotType(_0x1b0996) {
  const _0x1e7d9b = String(_0x1b0996 || "").trim().toLowerCase();
  if (_0x1e7d9b === "intelligence") {
    return "intelligence";
  } else {
    return "customize";
  }
}
function normalizeRunningHubKlingO3Model(_0x59b5d5) {
  return normalizeRunningHubKlingV3Model(_0x59b5d5);
}
function normalizeRunningHubKlingO3AspectRatio(_0x436a98) {
  return normalizeRunningHubKlingV3AspectRatio(_0x436a98);
}
function normalizeRunningHubKlingO3Duration(_0x1ff388) {
  return normalizeRunningHubKlingV3Duration(_0x1ff388);
}
function normalizeRunningHubKlingO3ShotType(_0x34ad6a) {
  return normalizeRunningHubKlingV3ShotType(_0x34ad6a);
}
function normalizeRunningHubKlingO1AspectRatio(_0x58a718) {
  const _0x359bd6 = String(_0x58a718 || "9:16").trim();
  if (["16:9", "9:16", "1:1"].includes(_0x359bd6)) {
    return _0x359bd6;
  } else {
    return "9:16";
  }
}
function normalizeRunningHubKlingO1Duration(_0x5b36a5) {
  const _0x3805e2 = Number(_0x5b36a5);
  if (Number.isFinite(_0x3805e2) && Math.trunc(_0x3805e2) === 10) {
    return "10";
  } else {
    return "5";
  }
}
function normalizeRunningHubHailuo02Duration(_0x19a5f2) {
  const _0x10867b = Number(_0x19a5f2);
  if (Number.isFinite(_0x10867b) && Math.trunc(_0x10867b) === 10) {
    return "10";
  } else {
    return "6";
  }
}
function normalizeRunningHubHailuo23Duration(_0x4cdc12) {
  const _0x3a6c62 = Number(_0x4cdc12);
  if (Number.isFinite(_0x3a6c62) && Math.trunc(_0x3a6c62) === 10) {
    return "10";
  } else {
    return "6";
  }
}
function normalizeRunningHubHappyHorseResolution(_0xf1ae11) {
  return normalizeApimartVideoResolutionLower(_0xf1ae11);
}
function normalizeRunningHubHappyHorseAspectRatio(_0x368c9a) {
  const _0x539a8e = normalizeApimartVideoRatio(_0x368c9a);
  if (["16:9", "9:16", "1:1", "4:3", "3:4"].includes(_0x539a8e)) {
    return _0x539a8e;
  } else {
    return undefined;
  }
}
function normalizeRunningHubHappyHorseDuration(_0x4f7a51) {
  const _0x2a92e4 = Math.trunc(Number(_0x4f7a51));
  const _0x53de9a = Number.isFinite(_0x2a92e4) ? _0x2a92e4 : 5;
  return String(Math.min(15, Math.max(3, _0x53de9a)));
}
function normalizeRunningHubHappyHorseAudioSetting(_0x34d127) {
  const _0x4f269f = String(_0x34d127 || "").trim().toLowerCase();
  if (_0x4f269f === "origin") {
    return "origin";
  } else {
    return "auto";
  }
}
function normalizeRunningHubSeedance2Resolution(_0x4cc63b) {
  const _0x3d6b05 = String(_0x4cc63b || "720p").trim().toLowerCase();
  if (_0x3d6b05 === "native1080p") {
    return "native1080p";
  }
  if (["480p", "720p", "1080p", "2k", "4k"].includes(_0x3d6b05)) {
    return _0x3d6b05;
  }
  return "720p";
}
function normalizeRunningHubSeedance2Duration(_0x3f4c5a) {
  const _0x4c679e = Math.trunc(Number(_0x3f4c5a));
  const _0x51be3d = Number.isFinite(_0x4c679e) ? _0x4c679e : 5;
  return String(Math.min(15, Math.max(4, _0x51be3d)));
}
function normalizeRunningHubSeedance2Ratio(_0x3dc416) {
  const _0xa6982c = String(_0x3dc416 ?? "").trim();
  const _0x8e3133 = _0xa6982c.toLowerCase();
  if (!_0xa6982c || _0x8e3133 === "auto" || _0x8e3133 === "adaptive" || _0x8e3133 === "default" || _0xa6982c === "自适应" || _0xa6982c === "默认") {
    return "adaptive";
  }
  if (["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"].includes(_0xa6982c)) {
    return _0xa6982c;
  } else {
    return "adaptive";
  }
}
function normalizeRunningHubVeo3Resolution(_0x264dca) {
  const _0x5a1b5c = String(_0x264dca || "720p").trim().toLowerCase();
  if (_0x5a1b5c === "4k") {
    return "4k";
  }
  if (_0x5a1b5c === "1080p") {
    return "1080p";
  }
  return "720p";
}
function normalizeRunningHubVeo3AspectRatio(_0x4b55e4) {
  const _0x256237 = normalizeApimartVideoRatio(_0x4b55e4);
  if (["16:9", "9:16"].includes(_0x256237)) {
    return _0x256237;
  } else {
    return undefined;
  }
}
function normalizeRunningHubVeo3Duration(_0x1deda4) {
  const _0x7e150d = Math.trunc(Number(_0x1deda4));
  if ([4, 6, 8].includes(_0x7e150d)) {
    return String(_0x7e150d);
  } else {
    return "8";
  }
}
function normalizeRunningHubWan27Mode(_0x211c4b = {}) {
  const _0x1230e2 = String(_0x211c4b?.payload?.generationParams?.wan27_mode || _0x211c4b?.payload?.wan27_mode || _0x211c4b?.body?.wan27_mode || "image").trim().toLowerCase();
  if (_0x1230e2 === "video" || _0x1230e2 === "reference" || _0x1230e2 === "edit") {
    return _0x1230e2;
  } else {
    return "image";
  }
}
function normalizeRunningHubWan27Resolution(_0x147d31) {
  const _0x418b63 = String(_0x147d31 || "720P").trim().toUpperCase();
  if (_0x418b63 === "1080P") {
    return "1080P";
  } else {
    return "720P";
  }
}
function normalizeRunningHubWan27AspectRatio(_0x4a1dc7) {
  const _0xc47da = normalizeApimartVideoRatio(_0x4a1dc7);
  if (["16:9", "9:16", "1:1", "4:3", "3:4"].includes(_0xc47da)) {
    return _0xc47da;
  } else {
    return undefined;
  }
}
function normalizeRunningHubWan27Duration(_0x2d4f6d, {
  context: _0x1a5396
} = {}) {
  const _0x2ee1bd = Math.trunc(Number(_0x2d4f6d));
  const _0x39f0b5 = normalizeRunningHubWan27Mode(_0x1a5396);
  if (_0x39f0b5 === "edit") {
    if (_0x2ee1bd === 0) {
      return "0";
    }
    const _0x4f1e41 = Number.isFinite(_0x2ee1bd) ? _0x2ee1bd : 5;
    return String(Math.min(10, Math.max(2, _0x4f1e41)));
  }
  const _0x4b92c9 = Number.isFinite(_0x2ee1bd) ? _0x2ee1bd : 5;
  return String(Math.min(15, Math.max(5, _0x4b92c9)));
}
function resolveApimartGoogleSearch(_0x464420, {
  context: _0x26013e
}) {
  const _0x362518 = _0x26013e?.payload || {};
  return normalizeBooleanParam(_0x464420) || normalizeBooleanParam(_0x362518.google_image_search);
}
function resolveApimartGoogleImageSearch(_0x543517, {
  context: _0x364cc5
}) {
  const _0x2ffdd0 = _0x364cc5?.body || {};
  const _0x22d877 = _0x364cc5?.payload || {};
  return normalizeBooleanParam(_0x543517) && normalizeBooleanParam(_0x2ffdd0.google_search ?? _0x22d877.google_search);
}
const BODY_MAPPING_TRANSFORMS = Object.freeze({
  apimartNanoBanana2Resolution: _0x3141c2 => normalizeApimartNanoBanana2Resolution(_0x3141c2),
  apimartGptImage2Resolution: _0x5b1c40 => normalizeApimartGptImage2Resolution(_0x5b1c40),
  apimartImageCount: normalizeApimartImageCount,
  apimartQwenImageCount: normalizeApimartQwenImageCount,
  apimartQwenImageResolution: normalizeApimartQwenImageResolution,
  apimartSeedreamResolution: normalizeApimartSeedreamResolution,
  apimartSeedreamImageCount: normalizeApimartSeedreamImageCount,
  volcengineSeedreamSize: resolveVolcengineSeedreamSize,
  volcengineSeedreamImageCount: normalizeVolcengineSeedreamImageCount,
  volcengineSeedreamSequentialMode: resolveVolcengineSeedreamSequentialMode,
  apimartWanImageResolution: normalizeApimartWanImageResolution,
  apimartVideoResolutionUpper: normalizeApimartVideoResolutionUpper,
  apimartVideoResolutionLower: normalizeApimartVideoResolutionLower,
  apimartVeo3VideoResolution: normalizeApimartVeo3VideoResolution,
  apimartViduVideoResolution: normalizeApimartViduVideoResolution,
  apimartViduVideoDuration: normalizeApimartViduVideoDuration,
  apimartHailuoVideoResolution: normalizeApimartHailuoVideoResolution,
  apimartHailuoVideoDuration: normalizeApimartHailuoVideoDuration,
  apimartHailuo23VideoResolution: normalizeApimartHailuo23VideoResolution,
  apimartHailuo23VideoDuration: normalizeApimartHailuo23VideoDuration,
  apimartVideoRatio: normalizeApimartVideoRatio,
  customProviderDimensionMap: normalizeCustomProviderDimensionMap,
  customProviderDocumentedValueMap: normalizeCustomProviderDocumentedValueMap,
  customProviderOpenAiImageSize: normalizeCustomProviderOpenAiImageSize,
  agnesImageSize: normalizeAgnesImageSize,
  agnesVideoWidth: normalizeAgnesVideoWidth,
  agnesVideoHeight: normalizeAgnesVideoHeight,
  agnesVideoFrameRate: normalizeAgnesVideoFrameRate,
  agnesVideoNumFrames: normalizeAgnesVideoNumFrames,
  agnesVideoSeed: normalizeAgnesVideoSeed,
  apimartOptionalText: normalizeApimartOptionalText,
  apimartOptionalInteger: normalizeApimartOptionalInteger,
  integerRange: normalizeIntegerRange,
  imageCountOptions: normalizeImageCountOptions,
  apimartKlingVideoMode: normalizeApimartKlingVideoMode,
  apimartKlingVideoMode4k: normalizeApimartKlingVideoMode4k,
  runninghubKlingVideoMode: normalizeRunningHubKlingVideoMode,
  runninghubKlingV3Model: normalizeRunningHubKlingV3Model,
  runninghubKlingV3AspectRatio: normalizeRunningHubKlingV3AspectRatio,
  runninghubKlingV3Duration: normalizeRunningHubKlingV3Duration,
  runninghubKlingV3CfgScale: normalizeRunningHubKlingV3CfgScale,
  runninghubKlingV3ShotType: normalizeRunningHubKlingV3ShotType,
  runninghubKlingO3Model: normalizeRunningHubKlingO3Model,
  runninghubKlingO3AspectRatio: normalizeRunningHubKlingO3AspectRatio,
  runninghubKlingO3Duration: normalizeRunningHubKlingO3Duration,
  runninghubKlingO3ShotType: normalizeRunningHubKlingO3ShotType,
  runninghubKlingO1AspectRatio: normalizeRunningHubKlingO1AspectRatio,
  runninghubKlingO1Duration: normalizeRunningHubKlingO1Duration,
  runninghubHailuo02Duration: normalizeRunningHubHailuo02Duration,
  runninghubHailuo23Duration: normalizeRunningHubHailuo23Duration,
  runninghubHappyHorseResolution: normalizeRunningHubHappyHorseResolution,
  runninghubHappyHorseAspectRatio: normalizeRunningHubHappyHorseAspectRatio,
  runninghubHappyHorseDuration: normalizeRunningHubHappyHorseDuration,
  runninghubHappyHorseAudioSetting: normalizeRunningHubHappyHorseAudioSetting,
  runninghubSeedance2Resolution: normalizeRunningHubSeedance2Resolution,
  runninghubSeedance2Duration: normalizeRunningHubSeedance2Duration,
  runninghubSeedance2Ratio: normalizeRunningHubSeedance2Ratio,
  runninghubVeo3Resolution: normalizeRunningHubVeo3Resolution,
  runninghubVeo3AspectRatio: normalizeRunningHubVeo3AspectRatio,
  runninghubVeo3Duration: normalizeRunningHubVeo3Duration,
  runninghubWan27Resolution: normalizeRunningHubWan27Resolution,
  runninghubWan27AspectRatio: normalizeRunningHubWan27AspectRatio,
  runninghubWan27Duration: normalizeRunningHubWan27Duration,
  apimartGoogleSearch: resolveApimartGoogleSearch,
  apimartGoogleImageSearch: resolveApimartGoogleImageSearch,
  booleanParam: normalizeBooleanParam,
  numberParam: normalizeNumberParam,
  integerParam: normalizeIntegerParam,
  stringParam: normalizeStringParam,
  first: firstArrayItem,
  second: secondArrayItem,
  providerRatioSize: resolveProviderRatioSize
});
function resolveRequestManifest(_0xbf214a, _0x21c0e4, _0x259165) {
  let _0x5883fa = _0xbf214a;
  let _0x39201a = resolveModelExecution(_0xbf214a.model, {
    providerHint: _0x21c0e4
  });
  if (_0x21c0e4 && (!_0x39201a?.modelManifest || _0x39201a.modelManifest.provider !== _0x21c0e4) && !String(_0xbf214a.model || "").includes("/")) {
    const _0x1e383d = _0x21c0e4 + "/" + _0xbf214a.model;
    const _0x465ebb = resolveModelExecution(_0x1e383d);
    if (_0x465ebb?.modelManifest?.provider === _0x21c0e4) {
      _0x39201a = _0x465ebb;
      _0x5883fa = {
        ..._0xbf214a,
        model: _0x1e383d
      };
    }
  }
  if (_0x39201a?.canonicalModelId && _0x39201a.canonicalModelId !== String(_0xbf214a.model || "").trim()) {
    _0x5883fa = {
      ..._0xbf214a,
      model: _0x39201a.canonicalModelId
    };
  }
  const _0xcf0845 = _0x39201a?.modelManifest;
  const _0x126cca = _0x39201a?.executionManifest;
  if (!_0xcf0845 || !_0x126cca || _0xcf0845.adapterType !== "modelApi" || _0x126cca.adapterType !== "modelApi" || _0xcf0845.kind !== _0x259165 || _0x126cca.kind !== _0x259165) {
    return null;
  }
  const _0x157d7d = _0xcf0845.provider;
  if (_0x21c0e4 && _0x157d7d !== _0x21c0e4) {
    return null;
  }
  if (_0x157d7d === "runninghub") {
    const _0x1c8623 = resolveRunningHubModelApiProfileId(_0xcf0845.modelId, _0x5883fa?.providerProfileId || _0x5883fa?.rhProviderProfileId);
    _0x5883fa = {
      ..._0x5883fa,
      providerProfileId: _0x1c8623,
      rhProviderProfileId: _0x1c8623
    };
  }
  return {
    provider: _0x157d7d,
    modelManifest: _0xcf0845,
    executionManifest: _0x126cca,
    effectivePayload: _0x5883fa
  };
}
async function buildManifestMappedBody(_0xe8cd10) {
  const _0xee510c = await buildBodyFromMapping({
    bodyMapping: _0xe8cd10.executionManifest.bodyMapping,
    context: _0xe8cd10,
    transforms: BODY_MAPPING_TRANSFORMS
  });
  const _0x75182b = _0xe8cd10.executionManifest.extensions?.bodyResolver;
  if (!_0x75182b) {
    return _0xee510c;
  }
  const _0x56953f = getModelApiBodyResolver(_0x75182b);
  if (typeof _0x56953f !== "function") {
    throw new Error("Unsupported model API bodyResolver: " + _0x75182b);
  }
  return _0x56953f({
    ..._0xe8cd10,
    currentBody: _0xee510c
  });
}
function resolveDefaultApiUrl(_0x197952, _0x5cb25e, _0x413acd) {
  const _0x51834a = String(_0x413acd.endpoint || "").trim();
  if (/^https?:\/\//i.test(_0x51834a)) {
    return _0x51834a;
  }
  const _0x185481 = _0x197952 === "grsai" ? String(_0x5cb25e.apiUrl || "").replace(/\/v1\/?$/, "").replace(/\/+$/, "") : String(_0x5cb25e.apiUrl || "").replace(/\/+$/, "");
  const _0x3defae = _0x51834a.match(/^\/(v\d+(?:beta)?)(?:\/|$)/i)?.[1];
  if (_0x3defae && new RegExp("/" + _0x3defae + "$", "i").test(_0x185481)) {
    return "" + _0x185481.slice(0, -(_0x3defae.length + 1)) + _0x51834a;
  }
  return "" + _0x185481 + _0x51834a;
}
const CUSTOM_PROVIDER_TASK_SUCCESS_STATUS_ALIASES = Object.freeze(["succeeded", "success", "completed", "complete", "done", "finished"]);
const CUSTOM_PROVIDER_TASK_FAILURE_STATUS_ALIASES = Object.freeze(["failed", "failure", "fail", "error", "cancelled", "canceled", "expired"]);
export function resolveManifestTaskPolling(_0x9e7375, _0x1f1279, _0xf49900, _0x449944) {
  const _0x4e6ea0 = _0xf49900.extensions?.taskPolling;
  if (!_0x4e6ea0 || typeof _0x4e6ea0 !== "object" || Array.isArray(_0x4e6ea0)) {
    return null;
  }
  const _0x197d62 = String(_0x1f1279.apiUrl || "").replace(/\/v1\/?$/, "").replace(/\/+$/, "");
  const _0x4378f0 = String(_0x4e6ea0.urlTemplate || "").trim();
  const _0x1fa0ba = Array.isArray(_0x4e6ea0.fallbackUrlTemplates) ? _0x4e6ea0.fallbackUrlTemplates.map(_0x3cbd26 => String(_0x3cbd26 || "").trim()).filter(Boolean).map(_0x4e308c => _0x4e308c.replace("{baseUrl}", _0x197d62)) : [];
  const _0x167848 = Number(_0x4e6ea0.pollIntervalMs);
  const _0x2e91fe = Number(_0x4e6ea0.maxWaitMs);
  const _0x52738b = typeof _0x4e6ea0.waitUntilTerminal === "boolean" ? _0x4e6ea0.waitUntilTerminal : isCustomProviderId(_0x9e7375);
  const _0xa25f72 = _0x4e6ea0.continuePollingOnSuccessWithoutResult === true;
  const _0x1b327d = _0x1464e8 => Array.isArray(_0x1464e8) ? [...new Set(_0x1464e8.map(_0x4eefd8 => String(_0x4eefd8 || "").trim().toLowerCase()).filter(_0x48b30e => /^[a-z][a-z0-9_-]{0,63}$/.test(_0x48b30e)))].slice(0, 16) : [];
  const _0x136b65 = isCustomProviderId(_0x9e7375);
  const _0x4373e3 = _0x1b327d([...(Array.isArray(_0x4e6ea0.successStatuses) ? _0x4e6ea0.successStatuses : []), ...(_0x136b65 ? CUSTOM_PROVIDER_TASK_SUCCESS_STATUS_ALIASES : [])]);
  const _0x4c1600 = _0x1b327d([...(Array.isArray(_0x4e6ea0.failedStatuses) ? _0x4e6ea0.failedStatuses : []), ...(_0x136b65 ? CUSTOM_PROVIDER_TASK_FAILURE_STATUS_ALIASES : [])]);
  const _0xe265e4 = (_0x454691, _0x2a7d51 = []) => {
    const _0x56b2cc = Array.isArray(_0x454691) ? _0x454691 : _0x2a7d51;
    return [...new Set(_0x56b2cc.map(_0x4a94c2 => Number(_0x4a94c2)).filter(_0x34983d => Number.isInteger(_0x34983d) && _0x34983d >= 400 && _0x34983d <= 599))].slice(0, 16);
  };
  const _0x34a4b2 = _0x4e6ea0.transportErrorPolicy && typeof _0x4e6ea0.transportErrorPolicy === "object" && !Array.isArray(_0x4e6ea0.transportErrorPolicy) ? _0x4e6ea0.transportErrorPolicy : null;
  const _0x17ca48 = isCustomProviderId(_0x9e7375);
  const _0x3e300f = _0x34a4b2 || _0x17ca48 ? {
    maxConsecutiveErrors: Math.min(10, Math.max(1, Math.trunc(Number(_0x34a4b2?.maxConsecutiveErrors) || 3))),
    retryableStatuses: _0xe265e4(_0x34a4b2?.retryableStatuses, [408, 425, 429, 500, 502, 503, 504]),
    terminalStatuses: _0xe265e4(_0x34a4b2?.terminalStatuses, [400, 401, 403, 404, 405, 409, 410, 413, 422]),
    surfaceLastError: _0x34a4b2?.surfaceLastError !== false
  } : null;
  return {
    method: String(_0x4e6ea0.method || "GET").trim().toUpperCase() || "GET",
    mode: String(_0x4e6ea0.mode || "task-proxy").trim() || "task-proxy",
    urlTemplate: _0x4378f0.replace("{baseUrl}", _0x197d62),
    ...(_0x1fa0ba.length > 0 ? {
      fallbackUrlTemplates: _0x1fa0ba
    } : {}),
    headersMode: String(_0x4e6ea0.headersMode || "bearer").trim() || "bearer",
    ...(Number.isFinite(_0x167848) ? {
      pollIntervalMs: Math.min(30000, Math.max(1000, Math.trunc(_0x167848)))
    } : {}),
    ...(Number.isFinite(_0x2e91fe) ? {
      maxWaitMs: Math.min(7200000, Math.max(60000, Math.trunc(_0x2e91fe)))
    } : {}),
    ...(_0x52738b ? {
      waitUntilTerminal: true
    } : {}),
    ...(_0xa25f72 ? {
      continuePollingOnSuccessWithoutResult: true
    } : {}),
    ...(_0x4373e3.length > 0 ? {
      successStatuses: _0x4373e3
    } : {}),
    ...(_0x4c1600.length > 0 ? {
      failedStatuses: _0x4c1600
    } : {}),
    ...(_0x3e300f ? {
      transportErrorPolicy: _0x3e300f
    } : {}),
    provider: _0x9e7375,
    executionId: _0xf49900.id,
    modelId: _0x449944?.modelManifest?.modelId || ""
  };
}
const SAFE_MANIFEST_ERROR_RULE_TYPES = new Set(["AUTH_ERROR", "CONTENT_FILTERED", "FORBIDDEN", "INSUFFICIENT_BALANCE", "INVALID_PARAMS", "MODEL_UNAVAILABLE", "NETWORK_ERROR", "RATE_LIMIT", "SERVER_ERROR", "SERVICE_UNAVAILABLE", "TASK_FAILED", "TIMEOUT", "UNKNOWN"]);
export function resolveManifestErrorRules(_0x3e4aa0 = {}) {
  const _0x5e6467 = _0x3e4aa0?.extensions?.errorRules;
  if (!Array.isArray(_0x5e6467)) {
    return [];
  }
  return _0x5e6467.slice(0, 12).flatMap(_0x5ddd71 => {
    if (!_0x5ddd71 || typeof _0x5ddd71 !== "object" || Array.isArray(_0x5ddd71)) {
      return [];
    }
    const _0x47ff24 = String(_0x5ddd71.phase || "any").trim().toLowerCase();
    const _0x51534a = String(_0x5ddd71.type || "").trim().toUpperCase();
    const _0x424b3b = [...new Set((Array.isArray(_0x5ddd71.httpStatuses) ? _0x5ddd71.httpStatuses : []).map(_0x32b415 => Number(_0x32b415)).filter(_0x251279 => Number.isInteger(_0x251279) && _0x251279 >= 400 && _0x251279 <= 599))].slice(0, 12);
    const _0x40cf4d = [...new Set((Array.isArray(_0x5ddd71.messageIncludesAny) ? _0x5ddd71.messageIncludesAny : []).map(_0x1cdfe7 => String(_0x1cdfe7 || "").replace(/\s+/g, " ").trim()).filter(_0x101133 => _0x101133 && _0x101133.length <= 240))].slice(0, 6);
    if (!["any", "submit", "poll"].includes(_0x47ff24) || !SAFE_MANIFEST_ERROR_RULE_TYPES.has(_0x51534a) || typeof _0x5ddd71.retryable !== "boolean" || _0x424b3b.length === 0 && _0x40cf4d.length === 0) {
      return [];
    }
    const _0x23d2ee = String(_0x5ddd71.userMessage || "").replace(/\s+/g, " ").trim().slice(0, 500);
    const _0x34b55a = String(_0x5ddd71.hint || "").replace(/\s+/g, " ").trim().slice(0, 500);
    return [{
      phase: _0x47ff24,
      ...(_0x424b3b.length > 0 ? {
        httpStatuses: _0x424b3b
      } : {}),
      ...(_0x40cf4d.length > 0 ? {
        messageIncludesAny: _0x40cf4d
      } : {}),
      type: _0x51534a,
      retryable: _0x5ddd71.retryable,
      ...(_0x23d2ee ? {
        userMessage: _0x23d2ee
      } : {}),
      ...(_0x34b55a ? {
        hint: _0x34b55a
      } : {})
    }];
  });
}
function resolveManifestApiUrl(_0x5570cb, _0x43beda, _0x46602b, _0x12745c) {
  const _0x536a4f = _0x46602b.extensions?.endpointResolver;
  let _0x428739 = "";
  if (!_0x536a4f) {
    _0x428739 = resolveDefaultApiUrl(_0x5570cb, _0x43beda, _0x46602b);
  } else {
    const _0x4c320c = getModelApiEndpointResolver(_0x536a4f);
    if (typeof _0x4c320c !== "function") {
      throw new Error("Unsupported model API endpointResolver: " + _0x536a4f);
    }
    _0x428739 = _0x4c320c({
      provider: _0x5570cb,
      cfg: _0x43beda,
      executionManifest: _0x46602b,
      ..._0x12745c
    });
  }
  if (!_0x428739) {
    throw new Error("Model API endpointResolver returned empty url: " + _0x536a4f);
  }
  if (_0x5570cb === "runninghub") {
    return remapRunningHubModelApiUrl(_0x428739, _0x12745c?.payload?.providerProfileId);
  }
  return _0x428739;
}
function doesResolverOwnInputResolution(_0x531e67) {
  const _0xcafe50 = _0x531e67?.extensions || {};
  return _0xcafe50.resolverOwnsInputs === true || String(_0xcafe50.inputResolutionMode || "").trim() === "resolverOwned";
}
export async function buildVideoRequestFromManifest(_0x48730e, _0x53a3f5, _0x2e0165, _0x237bcf = {}) {
  const _0x197324 = String(_0x237bcf.expectedProvider || "").trim().toLowerCase();
  const _0x2a89fc = resolveRequestManifest(_0x48730e, _0x197324, "video");
  if (!_0x2a89fc) {
    return null;
  }
  const {
    provider: _0x298626,
    modelManifest: _0x5c813f,
    executionManifest: _0xb109ec,
    effectivePayload: _0x2500b2
  } = _0x2a89fc;
  if (!isSupportedModelApiProvider(_0x298626, VIDEO_MODEL_API_PROVIDERS)) {
    return null;
  }
  validateStrictModelUiSchemaParams(_0x2500b2, _0x5c813f, _0xb109ec);
  validateStrictVideoInputCounts(_0x2500b2, _0x5c813f, _0xb109ec);
  const _0x1d4384 = sanitizeModelUiSchemaParams(_0x5c813f.modelId, _0x2500b2.generationParams, {
    includeDefaults: true
  });
  const _0x3c9bf2 = applyVideoAspectRatioExecutionFallback({
    ..._0x2500b2,
    generationParams: mergeRootAspectRatioIntoGenerationParams(_0x2500b2, _0x1d4384)
  }, _0x5c813f);
  const _0x4c9bde = resolveProviderConfig(_0x298626, _0x3c9bf2, _0x2e0165);
  const _0x5ea1c3 = resolveApiKey(_0x298626, _0x3c9bf2, _0x2e0165, _0x4c9bde);
  if (!_0x5ea1c3) {
    throwMissingApiKey(_0x298626);
  }
  const _0x24eb1d = isCustomProviderModelManifest(_0x5c813f);
  const _0x76d2fc = doesResolverOwnInputResolution(_0xb109ec) && !_0x24eb1d;
  const _0x485308 = _0x76d2fc ? {} : await resolveInputImagesBySlot(_0x298626, _0x3c9bf2, _0x5ea1c3, _0x2e0165, {
    modelManifest: _0x5c813f,
    baseUrl: _0x4c9bde.apiUrl,
    executionManifest: _0xb109ec,
    forceCustomProviderFreeImageHost: _0x24eb1d
  });
  const _0x2bd0b0 = Object.keys(_0x485308).length > 0;
  const _0x4e4a76 = _0x298626 === "runninghub" || _0xb109ec.extensions?.mergeGenericInputImagesWithSlots === true;
  const _0x1d2188 = _0x2bd0b0 ? Object.values(_0x485308).map(_0x152494 => String(_0x152494 || "").trim()).filter(Boolean) : [];
  const _0x28dfb2 = !_0x76d2fc && (!_0x2bd0b0 || _0x4e4a76) ? await resolveVideoInputImages(_0x2bd0b0 && _0x4e4a76 ? omitSlotImageUrlsFromVideoInputs(_0x3c9bf2) : _0x3c9bf2, _0x5ea1c3, _0x2e0165, {
    modelManifest: _0xb109ec.extensions?.bodyResolver ? null : _0x5c813f,
    provider: _0x298626,
    baseUrl: _0x4c9bde.apiUrl,
    executionManifest: _0xb109ec,
    forceCustomProviderFreeImageHost: _0x24eb1d
  }) : [];
  const _0x2dd5ac = _0x76d2fc ? [] : _0x2bd0b0 ? Array.from(new Set([..._0x1d2188, ..._0x28dfb2])) : _0x28dfb2;
  const _0x146906 = _0x76d2fc ? [] : await resolveInputVideos(_0x3c9bf2, _0x5ea1c3, _0x2e0165, {
    modelManifest: _0x5c813f,
    provider: _0x298626,
    baseUrl: _0x4c9bde.apiUrl,
    executionManifest: _0xb109ec,
    providerProfileId: _0x3c9bf2.providerProfileId
  });
  const _0x597e87 = _0x76d2fc ? [] : await resolveInputAudios(_0x3c9bf2, _0x5ea1c3, _0x2e0165, {
    modelManifest: _0x5c813f,
    provider: _0x298626,
    baseUrl: _0x4c9bde.apiUrl,
    executionManifest: _0xb109ec,
    providerProfileId: _0x3c9bf2.providerProfileId
  });
  const _0x3113e1 = resolveExecutionModelToken(_0xb109ec, _0x3c9bf2);
  const _0x49c382 = {
    provider: _0x298626,
    modelManifest: _0x5c813f,
    executionManifest: _0xb109ec,
    rawPayload: _0x2500b2,
    payload: _0x3c9bf2,
    finalPrompt: _0x53a3f5,
    modelToken: _0x3113e1,
    apiKey: _0x5ea1c3,
    ctx: _0x2e0165,
    finalUrls: _0x2dd5ac,
    finalUrlsBySlot: _0x485308,
    inputImages: _0x2dd5ac,
    inputVideos: _0x146906,
    inputAudios: _0x597e87
  };
  const _0xc0677 = await buildManifestMappedBody(_0x49c382);
  return {
    url: "/api/v2/proxy/image",
    headers: _0xb109ec.headers || {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: resolveManifestApiUrl(_0x298626, _0x4c9bde, _0xb109ec, _0x49c382),
      apiKey: _0x5ea1c3,
      ..._0xc0677,
      ...buildModelCatalogIdentity(_0x298626, _0x5c813f)
    },
    responseMapping: _0xb109ec.responseMapping,
    errorRules: resolveManifestErrorRules(_0xb109ec),
    taskPolling: resolveManifestTaskPolling(_0x298626, _0x4c9bde, _0xb109ec, _0x49c382),
    useOpenapiQuery: _0x298626 === "runninghub",
    adapterTrace: {
      source: "manifest",
      executionId: _0xb109ec.id,
      modelId: _0x48730e.model
    }
  };
}
function getFixedInputSlotOrderByKind(_0x1d00fb = null, _0x5721cc = "") {
  const _0x2bb228 = String(_0x5721cc || "").trim();
  const _0x1b1a99 = Array.isArray(_0x1d00fb?.inputSlots?.fixedSlots) ? _0x1d00fb.inputSlots.fixedSlots : [];
  return _0x1b1a99.filter(_0x52bf59 => String(_0x52bf59?.kind || "").trim() === _0x2bb228).map(_0xe925f4 => String(_0xe925f4?.id || "").trim()).filter(Boolean);
}
function getAudioRefUrl(_0x5268a8 = {}) {
  return String(_0x5268a8?.url || _0x5268a8?.audioUrl || _0x5268a8?.src || "").trim();
}
function orderAudioRefsByManifestSlots(_0x5b5845 = [], _0x463c65 = null) {
  const _0x27d828 = (Array.isArray(_0x5b5845) ? _0x5b5845 : []).filter(_0x1c5d74 => getAudioRefUrl(_0x1c5d74));
  const _0x34cd37 = getFixedInputSlotOrderByKind(_0x463c65, "audio");
  if (_0x34cd37.length === 0 || _0x27d828.length <= 1) {
    return _0x27d828;
  }
  const _0x979977 = new Set();
  const _0x1fc801 = [];
  _0x34cd37.forEach(_0x551090 => {
    const _0x2a991b = _0x27d828.findIndex((_0x5109ec, _0x3f6b4d) => !_0x979977.has(_0x3f6b4d) && String(_0x5109ec?.refSlot || "").trim() === _0x551090);
    if (_0x2a991b < 0) {
      return;
    }
    _0x979977.add(_0x2a991b);
    _0x1fc801.push(_0x27d828[_0x2a991b]);
  });
  _0x27d828.forEach((_0x430db0, _0x879887) => {
    if (!_0x979977.has(_0x879887)) {
      _0x1fc801.push(_0x430db0);
    }
  });
  return _0x1fc801;
}
function mergeAudioRefsIntoPayload(_0x39a921 = {}, _0x3ab7d4 = null) {
  const _0x4e8370 = Array.isArray(_0x39a921?.audioRefs) ? _0x39a921.audioRefs : [];
  const _0x3e4d92 = orderAudioRefsByManifestSlots(_0x4e8370, _0x3ab7d4).map(_0x3eea20 => getAudioRefUrl(_0x3eea20)).filter(Boolean);
  if (_0x3e4d92.length === 0) {
    return _0x39a921;
  }
  const _0x57681e = normalizeInputList(_0x39a921.audioUrls);
  const _0x1dd8ec = new Set(_0x3e4d92);
  return {
    ..._0x39a921,
    audioUrls: [..._0x57681e.filter(_0x4a0188 => !_0x1dd8ec.has(_0x4a0188)), ..._0x3e4d92]
  };
}
function createModelApiRequestId() {
  const _0x283b1b = Math.random().toString(16).slice(2, 10);
  return Date.now() + "-" + _0x283b1b;
}
function buildTaskProxyHeaders(_0x125cf9, _0x28d6aa, _0x50c402) {
  const _0x5c5f64 = {
    ...(_0x125cf9 || {})
  };
  const _0x406f47 = String(_0x50c402?.extensions?.apiKeyHeader || "").trim();
  if (_0x406f47 && _0x28d6aa && !Object.prototype.hasOwnProperty.call(_0x5c5f64, _0x406f47)) {
    _0x5c5f64[_0x406f47] = _0x28d6aa;
  }
  const _0x57c95a = String(_0x50c402?.extensions?.requestIdHeader || "").trim();
  if (_0x57c95a && !Object.keys(_0x5c5f64).some(_0x3728a8 => _0x3728a8.toLowerCase() === _0x57c95a.toLowerCase())) {
    _0x5c5f64[_0x57c95a] = createModelApiRequestId();
  }
  const _0x545d2f = String(_0x50c402?.extensions?.resourceId || "").trim();
  if (_0x545d2f && !Object.keys(_0x5c5f64).some(_0x29cc9f => _0x29cc9f.toLowerCase() === "x-api-resource-id")) {
    _0x5c5f64["X-Api-Resource-Id"] = _0x545d2f;
  }
  return _0x5c5f64;
}
export async function buildAudioRequestFromManifest(_0x39dce6, _0x9a0667, _0x698e44, _0x3584bf = {}) {
  const _0x284deb = String(_0x3584bf.expectedProvider || "").trim().toLowerCase();
  const _0x20e006 = resolveRequestManifest(_0x39dce6, _0x284deb, "audio");
  if (!_0x20e006) {
    return null;
  }
  const {
    provider: _0x2f0b57,
    modelManifest: _0x2097d5,
    executionManifest: _0x21e48a,
    effectivePayload: _0x518d65
  } = _0x20e006;
  if (!isSupportedModelApiProvider(_0x2f0b57, AUDIO_MODEL_API_PROVIDERS)) {
    return null;
  }
  const _0x572a22 = mergeAudioRefsIntoPayload(_0x518d65, _0x2097d5);
  const _0x4c1f73 = mergeUiSchemaDefaultsIntoPayload(_0x572a22, _0x2097d5);
  const _0x376c46 = resolveProviderConfig(_0x2f0b57, _0x4c1f73, _0x698e44);
  const _0x4fa10a = resolveApiKey(_0x2f0b57, _0x4c1f73, _0x698e44, _0x376c46);
  if (!_0x4fa10a) {
    throwMissingApiKey(_0x2f0b57);
  }
  const _0x217397 = await resolveInputImagesBySlot(_0x2f0b57, _0x4c1f73, _0x4fa10a, _0x698e44, {
    modelManifest: _0x2097d5,
    provider: _0x2f0b57,
    baseUrl: _0x376c46.apiUrl,
    executionManifest: _0x21e48a
  });
  const _0x1553ea = Object.keys(_0x217397).length > 0 ? Object.values(_0x217397) : await resolveInputImages(_0x2f0b57, _0x4c1f73, _0x4fa10a, _0x698e44, {
    modelManifest: _0x2097d5,
    provider: _0x2f0b57,
    baseUrl: _0x376c46.apiUrl,
    executionManifest: _0x21e48a
  });
  const _0x7099ec = await resolveInputAudios(_0x4c1f73, _0x4fa10a, _0x698e44, {
    modelManifest: _0x2097d5,
    provider: _0x2f0b57,
    baseUrl: _0x376c46.apiUrl,
    executionManifest: _0x21e48a
  });
  const _0x1f50c6 = resolveExecutionModelToken(_0x21e48a, _0x4c1f73);
  const _0x3f8eb6 = {
    provider: _0x2f0b57,
    modelManifest: _0x2097d5,
    executionManifest: _0x21e48a,
    payload: _0x4c1f73,
    finalPrompt: _0x9a0667,
    modelToken: _0x1f50c6,
    apiKey: _0x4fa10a,
    ctx: _0x698e44,
    inputImages: _0x1553ea,
    inputVideos: [],
    inputAudios: _0x7099ec
  };
  const _0x3ee149 = await buildManifestMappedBody(_0x3f8eb6);
  const _0x3f9340 = resolveManifestApiUrl(_0x2f0b57, _0x376c46, _0x21e48a, _0x3f8eb6);
  const _0x50c474 = String(_0x21e48a.extensions?.proxyMode || "").trim().toLowerCase();
  if (_0x50c474 === "task") {
    return {
      url: "/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x3f9340),
      headers: buildTaskProxyHeaders(_0x21e48a.headers || {
        "Content-Type": "application/json"
      }, _0x4fa10a, _0x21e48a),
      body: _0x3ee149,
      responseMapping: _0x21e48a.responseMapping,
      errorRules: resolveManifestErrorRules(_0x21e48a),
      adapterTrace: {
        source: "manifest",
        executionId: _0x21e48a.id,
        modelId: _0x4c1f73.model
      },
      meta: {
        provider: _0x2f0b57,
        adapterType: "modelApi",
        audioWorkflowKey: _0x2097d5.modelId,
        audioWorkflowLabel: _0x2097d5.displayName || _0x2097d5.modelId,
        model: _0x2097d5.modelId,
        executionId: _0x21e48a.id,
        isManifestAudioModelApi: true
      }
    };
  }
  return {
    url: "/api/v2/proxy/image",
    headers: _0x21e48a.headers || {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: _0x3f9340,
      apiKey: _0x4fa10a,
      ..._0x3ee149
    },
    responseMapping: _0x21e48a.responseMapping,
    errorRules: resolveManifestErrorRules(_0x21e48a),
    adapterTrace: {
      source: "manifest",
      executionId: _0x21e48a.id,
      modelId: _0x4c1f73.model
    },
    meta: {
      provider: _0x2f0b57,
      adapterType: "modelApi",
      audioWorkflowKey: _0x2097d5.modelId,
      audioWorkflowLabel: _0x2097d5.displayName || _0x2097d5.modelId,
      model: _0x2097d5.modelId,
      executionId: _0x21e48a.id,
      isManifestAudioModelApi: true
    }
  };
}
function normalizeTextMaxOutputTokens(_0x1308fb) {
  const _0x2f629e = Math.trunc(Number(_0x1308fb) || 0);
  if (_0x2f629e > 0) {
    return _0x2f629e;
  } else {
    return 0;
  }
}
function resolveGeminiNativeVideoApiUrl(_0x360fa4, _0x4b4bd2, _0x3e42d5, _0x18c745) {
  const _0x5c0354 = _0x3e42d5.extensions?.geminiNativeVideo;
  const _0x4fe84d = String(_0x5c0354?.endpointTemplate || "").trim();
  if (!_0x4fe84d || !_0x4fe84d.includes("{model}")) {
    throw new Error("Gemini native video manifest requires an endpointTemplate with {model}");
  }
  const _0x35ac07 = _0x4fe84d.replace("{model}", encodeURIComponent(_0x18c745.modelToken));
  const _0x282201 = resolveDefaultApiUrl(_0x360fa4, _0x4b4bd2, {
    endpoint: _0x35ac07
  });
  if (_0x360fa4 === "runninghub") {
    return remapRunningHubModelApiUrl(_0x282201, _0x18c745?.payload?.providerProfileId);
  } else {
    return _0x282201;
  }
}
function buildGeminiNativeThinkingConfig(_0x1b4190, _0x49d82e) {
  const _0x2c07f8 = String(_0x1b4190?.type || "").trim().toLowerCase();
  if (_0x2c07f8 !== "disabled") {
    return {};
  }
  const _0x3ac354 = _0x49d82e?.thinkingControl;
  if (_0x3ac354?.disabledUnsupported === true) {
    throw new Error("当前 Gemini 模型不支持关闭思考，请改用支持无思考模式的模型");
  }
  const _0x1b38d3 = Number(_0x3ac354?.disabledBudget);
  if (!Number.isFinite(_0x1b38d3) || _0x1b38d3 < 0) {
    return {};
  }
  return {
    thinkingConfig: {
      thinkingBudget: Math.trunc(_0x1b38d3),
      includeThoughts: _0x3ac354?.includeThoughts === true
    }
  };
}
function buildGeminiNativeGenerationConfig(_0xbf359, _0x5b58ae, _0x3cf364, _0xb42274) {
  const _0x3022be = normalizeTextStructuredOutput(_0xbf359);
  return {
    ...(_0x5b58ae ? {
      maxOutputTokens: _0x5b58ae
    } : {}),
    ...buildGeminiNativeThinkingConfig(_0x3cf364, _0xb42274),
    ...(_0x3022be ? {
      responseMimeType: "application/json",
      responseJsonSchema: _0x3022be.schema
    } : {})
  };
}
export async function buildTextRequestFromManifest(_0x25d5b5, _0x1b0377, _0x25da22, _0x29ce65 = {}) {
  const _0x13a288 = String(_0x29ce65.expectedProvider || "").trim().toLowerCase();
  const _0x3c2bf3 = resolveRequestManifest(_0x25d5b5, _0x13a288, "text");
  if (!_0x3c2bf3) {
    return null;
  }
  const {
    provider: _0x33a0e4,
    modelManifest: _0x2c122e,
    executionManifest: _0x1395c4,
    effectivePayload: _0x360b0d
  } = _0x3c2bf3;
  const _0x28eb31 = mergeUiSchemaDefaultsIntoPayload(_0x360b0d, _0x2c122e);
  const _0x594c42 = resolveProviderConfig(_0x33a0e4, _0x28eb31, _0x25da22);
  const _0x1d64e4 = resolveApiKey(_0x33a0e4, _0x28eb31, _0x25da22, _0x594c42) || _0x594c42.apiKey;
  if (!_0x1d64e4) {
    throwMissingApiKey(_0x33a0e4);
  }
  const _0x321af6 = resolveExecutionModelToken(_0x1395c4, _0x28eb31);
  const _0x42e702 = {
    provider: _0x33a0e4,
    modelManifest: _0x2c122e,
    executionManifest: _0x1395c4,
    payload: _0x28eb31,
    finalPrompt: _0x1b0377,
    modelToken: _0x321af6,
    apiKey: _0x1d64e4,
    ctx: _0x25da22,
    inputImages: [],
    inputVideos: [],
    inputAudios: []
  };
  const _0x36823a = isCustomProviderModelManifest(_0x2c122e);
  const _0xf9ad65 = String(_0x1395c4.extensions?.structuredOutputMode || "json_schema").trim();
  const _0x517879 = getTextStructuredOutputRequestMeta(_0x28eb31.structuredOutput, {
    mode: _0xf9ad65
  });
  const _0x265bd2 = normalizeTextMaxOutputTokens(_0x28eb31.maxOutputTokens);
  const _0x3d8ab4 = String(_0x28eb31.thinking?.type || "").trim();
  const _0x2889e5 = String(_0x1395c4.extensions?.thinkingControlMode || "").trim();
  const _0x56683d = String(_0x28eb31.reasoningEffort || _0x28eb31.reasoning_effort || "").trim().toLowerCase();
  const _0x430afa = ["none", "minimal", "low", "medium", "high"].includes(_0x56683d) ? _0x56683d : "";
  const _0x11d027 = _0x1395c4.extensions?.reasoningEffortMode === "openai" ? _0x430afa || (_0x3d8ab4 === "disabled" ? "minimal" : _0x3d8ab4 === "enabled" ? "medium" : "") : "";
  const _0x3ed0ab = _0x1395c4.extensions?.geminiNativeVideo;
  const _0x22a650 = Array.isArray(_0x28eb31.inputVideoUrls) ? _0x28eb31.inputVideoUrls.filter(Boolean) : [];
  if (_0x3ed0ab && _0x22a650.length > 0) {
    if (typeof _0x25da22.buildGeminiNativeVideoUserParts !== "function") {
      throw new Error("Gemini native video manifest requires user content resolver");
    }
    const _0x58a6ea = buildGeminiNativeGenerationConfig(_0x28eb31.structuredOutput, _0x265bd2, _0x28eb31.thinking, _0x3ed0ab);
    const _0x1d4585 = typeof _0x25da22.resolveChatCompletionInputUrls === "function" ? _0x25da22.resolveChatCompletionInputUrls({
      providerId: _0x33a0e4,
      mediaPolicy: _0x3ed0ab.mediaPolicy || "image-video",
      inputUrls: _0x28eb31.inputUrls || [],
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x22a650,
      inputAudioUrls: []
    }) : {
      inputUrls: _0x28eb31.inputUrls || [],
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x22a650
    };
    const _0x2c8ef3 = await _0x25da22.buildGeminiNativeVideoUserParts(_0x1b0377, _0x1d4585, _0x1d64e4, _0x33a0e4, {
      mediaPolicy: _0x3ed0ab.mediaPolicy || "image-video",
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x22a650,
      imageUploadProvider: _0x3ed0ab.imageUploadProvider || _0x3ed0ab.uploadProvider || _0x33a0e4,
      videoUploadProvider: _0x3ed0ab.videoUploadProvider || _0x3ed0ab.uploadProvider || _0x33a0e4,
      apiUrl: _0x594c42.apiUrl
    });
    return {
      url: "/api/v2/proxy/completions",
      headers: _0x1395c4.headers || {
        "Content-Type": "application/json"
      },
      body: {
        apiUrl: resolveGeminiNativeVideoApiUrl(_0x33a0e4, _0x594c42, _0x1395c4, _0x42e702),
        apiKey: _0x1d64e4,
        ...(_0x28eb31.systemPrompt ? {
          systemInstruction: {
            parts: [{
              text: _0x28eb31.systemPrompt
            }]
          }
        } : {}),
        contents: [{
          role: "user",
          parts: _0x2c8ef3
        }],
        ...(Object.keys(_0x58a6ea).length > 0 ? {
          generationConfig: _0x58a6ea
        } : {})
      },
      responseMapping: _0x1395c4.responseMapping,
      errorRules: resolveManifestErrorRules(_0x1395c4),
      isProxy: true,
      structuredOutput: _0x517879,
      adapterTrace: {
        source: "manifest",
        executionId: _0x1395c4.id,
        modelId: _0x28eb31.model
      }
    };
  }
  if (_0x1395c4.endpointMode === "responses") {
    if (typeof _0x25da22.buildVolcengineResponsesUserContent !== "function") {
      throw new Error("responses text manifest requires user content resolver");
    }
    const _0x21d7e2 = typeof _0x25da22.resolveChatCompletionInputUrls === "function" ? _0x25da22.resolveChatCompletionInputUrls({
      providerId: _0x33a0e4,
      mediaPolicy: _0x1395c4.extensions?.chatCompletionInputPolicy,
      inputUrls: _0x28eb31.inputUrls || [],
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x28eb31.inputVideoUrls || [],
      inputAudioUrls: _0x28eb31.inputAudioUrls || []
    }) : _0x28eb31.inputImageUrls || _0x28eb31.inputUrls || [];
    const _0x34cd76 = await _0x25da22.buildVolcengineResponsesUserContent(_0x1b0377, _0x21d7e2, _0x1d64e4, _0x33a0e4, {
      mediaPolicy: _0x1395c4.extensions?.chatCompletionInputPolicy,
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x28eb31.inputVideoUrls || [],
      inputAudioUrls: _0x28eb31.inputAudioUrls || [],
      baseUrl: _0x594c42.apiUrl,
      model: _0x321af6,
      videoFps: _0x1395c4.extensions?.volcengineFiles?.videoFps,
      forceCustomProviderFreeImageHost: _0x36823a
    });
    return {
      url: "/api/v2/proxy/completions",
      headers: _0x1395c4.headers || {
        "Content-Type": "application/json"
      },
      body: {
        apiUrl: resolveManifestApiUrl(_0x33a0e4, _0x594c42, _0x1395c4, _0x42e702),
        apiKey: _0x1d64e4,
        model: _0x321af6,
        stream: false,
        ...(_0x28eb31.systemPrompt ? {
          instructions: _0x28eb31.systemPrompt
        } : {}),
        input: [{
          role: "user",
          content: _0x34cd76
        }],
        ...(_0x28eb31.webSearch === true ? {
          tools: [{
            type: "web_search"
          }]
        } : {}),
        ...(_0x265bd2 ? {
          max_output_tokens: _0x265bd2
        } : {}),
        ...(_0x3d8ab4 && _0x2889e5 === "thinking" ? {
          thinking: {
            type: _0x3d8ab4
          }
        } : {}),
        ...buildResponsesStructuredOutput(_0x28eb31.structuredOutput)
      },
      responseMapping: _0x1395c4.responseMapping,
      errorRules: resolveManifestErrorRules(_0x1395c4),
      isProxy: true,
      structuredOutput: _0x517879,
      adapterTrace: {
        source: "manifest",
        executionId: _0x1395c4.id,
        modelId: _0x28eb31.model
      }
    };
  }
  const _0x30bf86 = String(_0x1395c4.endpointMode || "").trim();
  if (!_0x30bf86 || _0x30bf86 === "chat-completion") {
    if (typeof _0x25da22.buildChatCompletionUserContent !== "function") {
      throw new Error("chat-completion text manifest requires user content resolver");
    }
    const _0x3ec21c = typeof _0x25da22.resolveChatCompletionInputUrls === "function" ? _0x25da22.resolveChatCompletionInputUrls({
      providerId: _0x33a0e4,
      mediaPolicy: _0x1395c4.extensions?.chatCompletionInputPolicy,
      inputUrls: _0x28eb31.inputUrls || [],
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x28eb31.inputVideoUrls || [],
      inputAudioUrls: _0x28eb31.inputAudioUrls || []
    }) : _0x28eb31.inputImageUrls || _0x28eb31.inputUrls || [];
    const _0x5300b9 = await _0x25da22.buildChatCompletionUserContent(_0x1b0377, _0x3ec21c, _0x1d64e4, _0x33a0e4, {
      mediaPolicy: _0x1395c4.extensions?.chatCompletionInputPolicy,
      inputImageUrls: _0x28eb31.inputImageUrls || [],
      inputVideoUrls: _0x28eb31.inputVideoUrls || [],
      inputAudioUrls: _0x28eb31.inputAudioUrls || [],
      forceCustomProviderFreeImageHost: _0x36823a,
      apiUrl: _0x594c42.apiUrl,
      providerProfileId: _0x28eb31.providerProfileId
    });
    return {
      url: "/api/v2/proxy/completions",
      headers: _0x1395c4.headers || {
        "Content-Type": "application/json"
      },
      body: {
        apiUrl: resolveManifestApiUrl(_0x33a0e4, _0x594c42, _0x1395c4, _0x42e702),
        apiKey: _0x1d64e4,
        model: _0x321af6,
        stream: _0x1395c4.extensions?.streaming === true,
        messages: [{
          role: "system",
          content: buildTextStructuredOutputSystemPrompt(_0x28eb31.systemPrompt, _0x28eb31.structuredOutput, {
            mode: _0xf9ad65
          })
        }, {
          role: "user",
          content: _0x5300b9
        }],
        ...(_0x265bd2 ? {
          max_tokens: _0x265bd2
        } : {}),
        ...(_0x11d027 ? {
          reasoning_effort: _0x11d027
        } : _0x3d8ab4 && _0x2889e5 === "thinking" ? {
          thinking: {
            type: _0x3d8ab4
          }
        } : {}),
        ...buildChatCompletionsStructuredOutput(_0x28eb31.structuredOutput, {
          mode: _0xf9ad65
        })
      },
      responseMapping: _0x1395c4.responseMapping,
      errorRules: resolveManifestErrorRules(_0x1395c4),
      isProxy: true,
      structuredOutput: _0x517879,
      adapterTrace: {
        source: "manifest",
        executionId: _0x1395c4.id,
        modelId: _0x28eb31.model
      }
    };
  }
  if (_0x30bf86 && _0x30bf86 !== "image-to-text") {
    throw new Error("Unsupported text manifest endpointMode: " + _0x30bf86);
  }
  const _0x3684e2 = Array.isArray(_0x28eb31.inputImageUrls) ? _0x28eb31.inputImageUrls : [];
  if (_0x3684e2.length === 0) {
    throw new Error("RunningHub image-to-text manifest requires an image input");
  }
  const _0x3782e1 = await _0x25da22.buildRunningHubTextImageUrl(_0x3684e2, _0x1d64e4, {
    apiUrl: _0x594c42.apiUrl,
    providerProfileId: _0x28eb31.providerProfileId
  });
  if (!_0x3782e1) {
    throw new Error("RunningHub image-to-text image upload failed");
  }
  return {
    url: "/api/v2/proxy/image",
    headers: _0x1395c4.headers || {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: buildRunningHubModelApiUrl(_0x28eb31.providerProfileId, "/openapi/v2/" + _0x1395c4.model),
      apiKey: _0x1d64e4,
      prompt: _0x1b0377,
      imageUrl: _0x3782e1
    },
    responseMapping: _0x1395c4.responseMapping,
    errorRules: resolveManifestErrorRules(_0x1395c4),
    isProxy: true,
    adapterTrace: {
      source: "manifest",
      executionId: _0x1395c4.id,
      modelId: _0x28eb31.model
    }
  };
}
export async function buildImageRequestFromManifest(_0x212518, _0x144c5e, _0x5b106f, _0x26d7f0 = {}) {
  const _0x596f67 = String(_0x26d7f0.expectedProvider || "").trim().toLowerCase();
  const _0x32a724 = resolveRequestManifest(_0x212518, _0x596f67, "image");
  if (!_0x32a724) {
    return null;
  }
  const {
    provider: _0x13129b,
    modelManifest: _0x1a63fd,
    executionManifest: _0x25b9ce,
    effectivePayload: _0xd7b812
  } = _0x32a724;
  if (!isSupportedModelApiProvider(_0x13129b, IMAGE_MODEL_API_PROVIDERS)) {
    return null;
  }
  validateStrictModelUiSchemaParams(_0xd7b812, _0x1a63fd, _0x25b9ce);
  validateStrictImageInputCounts(_0xd7b812, _0x1a63fd, _0x25b9ce);
  const _0x3c221f = mergeUiSchemaDefaultsIntoPayload(_0xd7b812, _0x1a63fd);
  const _0x5e39e7 = resolveProviderConfig(_0x13129b, _0x3c221f, _0x5b106f);
  const _0x164083 = resolveApiKey(_0x13129b, _0x3c221f, _0x5b106f, _0x5e39e7);
  if (!_0x164083) {
    throwMissingApiKey(_0x13129b);
  }
  const _0x4fb9bc = resolveInputRouteExecutionManifest(_0x25b9ce, _0x3c221f, _0x1a63fd);
  const _0x2638fc = isMultipartFormExecution(_0x4fb9bc);
  const _0x2a93c7 = doesResolverOwnInputResolution(_0x4fb9bc) && !isCustomProviderModelManifest(_0x1a63fd);
  const _0xf107e4 = _0x2638fc || _0x2a93c7 ? {} : await resolveInputImagesBySlot(_0x13129b, _0x3c221f, _0x164083, _0x5b106f, {
    modelManifest: _0x1a63fd,
    executionManifest: _0x4fb9bc,
    baseUrl: _0x5e39e7.apiUrl
  });
  const _0x5a7ee3 = Object.keys(_0xf107e4).length > 0;
  const _0x378ffc = _0x2638fc ? await resolveMultipartInputImages(_0x3c221f, _0x1a63fd, _0x5b106f) : _0x2a93c7 ? collectResolverOwnedImageInputUrls(_0x3c221f, _0x1a63fd) : _0x5a7ee3 ? Object.values(_0xf107e4) : await resolveInputImages(_0x13129b, _0x3c221f, _0x164083, _0x5b106f, {
    modelManifest: _0x1a63fd,
    executionManifest: _0x4fb9bc,
    baseUrl: _0x5e39e7.apiUrl
  });
  const _0x562960 = resolveExecutionModelToken(_0x4fb9bc, _0x3c221f);
  const _0xe6d87e = {
    provider: _0x13129b,
    modelManifest: _0x1a63fd,
    executionManifest: _0x4fb9bc,
    payload: _0x3c221f,
    finalPrompt: _0x144c5e,
    modelToken: _0x562960,
    apiKey: _0x164083,
    ctx: _0x5b106f,
    finalUrls: _0x378ffc,
    finalUrlsBySlot: _0xf107e4,
    inputImages: _0x378ffc,
    inputVideos: [],
    inputAudios: []
  };
  const _0x2e7d51 = await buildManifestMappedBody(_0xe6d87e);
  const _0x381aae = _0x13129b === "runninghub";
  const _0x24404f = resolveManifestApiUrl(_0x13129b, _0x5e39e7, _0x4fb9bc, _0xe6d87e);
  const _0x43f5ca = resolveManifestTaskPolling(_0x13129b, _0x5e39e7, _0x4fb9bc, _0xe6d87e);
  const _0x5e5e51 = Number(_0x4fb9bc.extensions?.requestTimeoutMs);
  const _0x40c5e8 = Number.isFinite(_0x5e5e51) && _0x5e5e51 > 0 ? {
    requestTimeoutMs: Math.trunc(_0x5e5e51)
  } : {};
  if (_0x2638fc) {
    return {
      url: "/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x24404f),
      headers: {
        Authorization: "Bearer " + _0x164083
      },
      body: buildMultipartFormData(_0x2e7d51),
      responseMapping: _0x4fb9bc.responseMapping,
      errorRules: resolveManifestErrorRules(_0x4fb9bc),
      taskPolling: _0x43f5ca,
      ..._0x40c5e8,
      adapterTrace: {
        source: "manifest",
        executionId: _0x4fb9bc.id,
        modelId: _0x3c221f.model
      }
    };
  }
  return {
    url: "/api/v2/proxy/image",
    headers: _0x4fb9bc.headers || {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: _0x24404f,
      apiKey: _0x164083,
      ..._0x2e7d51,
      ...buildModelCatalogIdentity(_0x13129b, _0x1a63fd),
      ...(isCustomProviderId(_0x13129b) ? {
        [AIC_IMAGE_TASK_PROBE_CONTROL_KEY]: supportsManifestImageTaskPolling(_0x43f5ca)
      } : {})
    },
    responseMapping: _0x4fb9bc.responseMapping,
    errorRules: resolveManifestErrorRules(_0x4fb9bc),
    taskPolling: _0x43f5ca,
    ..._0x40c5e8,
    adapterTrace: {
      source: "manifest",
      executionId: _0x4fb9bc.id,
      modelId: _0x212518.model
    },
    ...(_0x381aae ? {
      isAsync: true,
      taskIdPath: _0x25b9ce.responseMapping?.taskIdPath || _0x25b9ce.result?.taskIdPath || "taskId",
      useOpenapiQuery: true,
      pollUrlBuilder: () => buildRunningHubModelApiUrl(_0x3c221f.providerProfileId, "/openapi/v2/query"),
      resultExtractor: _0xab54d5 => {
        if (_0xab54d5.status === "COMPLETED" && Array.isArray(_0xab54d5.results)) {
          return _0xab54d5.results.map(_0x1fa65e => _0x1fa65e.url || _0x1fa65e.imageUrl || _0x1fa65e.videoUrl).filter(Boolean);
        }
        return [];
      }
    } : {})
  };
}