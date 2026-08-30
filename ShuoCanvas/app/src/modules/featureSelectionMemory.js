import { RH_VIDEO_BASIC_MODEL_ID, getModelManifest, listModelManifests, resolveModelExecution, sanitizeModelUiSchemaParams } from "../manifests/index.js";
import { STORYBOARD_SCRIPT_TEXT_MODEL, STORYBOARD_SCRIPT_TEXT_PROVIDER } from "../core/storyboardScriptFactory.js";
import { MODEL_PROVIDER_PROFILE_MEMORY_KEY, getModelProviderProfileIds, getModelProviderProfileMemoryKey, normalizeModelProviderProfileId, sanitizeModelProviderProfileMemory } from "./modelProviderProfileSelection.js";
export const FEATURE_SELECTIONS_STORAGE_KEY = "v2-feature-selections";
const MODEL_PARAMS_MEMORY_KEY = "generationParamsByModel";
const NODE_MODEL_PARAMS_MEMORY_TYPES = new Set(["ai-image", "ai-video", "ai-audio", "storyboard-script"]);
const NODE_PROVIDER_PROFILE_MEMORY_TYPES = new Set([...NODE_MODEL_PARAMS_MEMORY_TYPES, "ai-text"]);
const NODE_MODULE_KEY_MAP = {
  "ai-text": "ai-text",
  "ai-image": "ai-image",
  "ai-video": "ai-video",
  "ai-audio": "ai-audio",
  "source-video": "source-video",
  "storyboard-script": "storyboard-script"
};
const NODE_DEFAULT_SELECTIONS = {
  "ai-text": {
    model: "apimart/kimi-k2-instruct",
    provider: "apimart"
  },
  "ai-image": {
    model: "apimart/nano-banana-2",
    provider: "apimart",
    rhInstanceType: "default"
  },
  "ai-video": {
    model: RH_VIDEO_BASIC_MODEL_ID,
    provider: "runninghubwf",
    resolution: "720p",
    duration: 5,
    rhInstanceType: "default"
  },
  "ai-audio": {
    model: "indextts2_clone",
    provider: "runninghubwf",
    audioWorkflowKey: "indextts2_clone",
    rhInstanceType: "default"
  },
  "storyboard-script": {
    model: STORYBOARD_SCRIPT_TEXT_MODEL,
    provider: STORYBOARD_SCRIPT_TEXT_PROVIDER
  }
};
const NODE_MEMORY_SELECTION_FIELDS = {
  "ai-text": ["model", "provider"],
  "ai-image": ["model", "provider", "imageSize", "aspectRatio", "batchSize", "rhResolution", "rhInstanceType"],
  "ai-video": ["model", "provider", "aspectRatio", "resolution", "duration", "mode", "dreaminaRouteMode", "rhInstanceType", "rhVideoFps", "rhVideoFrames", "rhVideoSeconds", "rhVideoResolution"],
  "ai-audio": ["model", "provider", "audioWorkflowKey", "rhInstanceType"],
  "source-video": ["rhInstanceType", "rhVideoFps", "rhVideoResolution", "rhMaskMode"],
  "storyboard-script": ["model", "provider"]
};
function isPlainObject(_0x24357c) {
  return !!_0x24357c && typeof _0x24357c === "object" && !Array.isArray(_0x24357c);
}
function hasUsableValue(_0x5b15f5) {
  if (_0x5b15f5 === null || _0x5b15f5 === undefined) {
    return false;
  }
  if (typeof _0x5b15f5 === "string") {
    return _0x5b15f5.trim().length > 0;
  }
  if (typeof _0x5b15f5 === "number") {
    return Number.isFinite(_0x5b15f5);
  }
  if (typeof _0x5b15f5 === "boolean") {
    return true;
  }
  return false;
}
function toModuleKey(_0x40787f) {
  return NODE_MODULE_KEY_MAP[String(_0x40787f || "").trim()] || "";
}
function ensureModuleRecord(_0x435cee, _0x4960ee) {
  if (!isPlainObject(_0x435cee[_0x4960ee])) {
    _0x435cee[_0x4960ee] = {};
  }
  return _0x435cee[_0x4960ee];
}
function hasOwnField(_0x564710, _0x208d97) {
  return !!_0x564710 && Object.prototype.hasOwnProperty.call(_0x564710, _0x208d97);
}
function isSchemaMemoryNodeType(_0x1ec6dc) {
  return NODE_MODEL_PARAMS_MEMORY_TYPES.has(String(_0x1ec6dc || "").trim());
}
function getPlainParams(_0x281607) {
  if (isPlainObject(_0x281607)) {
    return {
      ..._0x281607
    };
  } else {
    return {};
  }
}
function hasModelManifest(_0x255b34) {
  return !!getModelManifest(_0x255b34);
}
function resolveSchemaModelId(_0x4d1d3f, _0x3d882e = "") {
  const _0x53f96f = String(_0x4d1d3f || "").trim();
  if (!_0x53f96f) {
    return "";
  }
  if (hasModelManifest(_0x53f96f)) {
    return _0x53f96f;
  }
  try {
    const _0x43649b = resolveModelExecution(_0x53f96f, {
      providerHint: _0x3d882e
    }) || resolveModelExecution(_0x53f96f);
    const _0x19d3fe = String(_0x43649b?.canonicalModelId || _0x43649b?.modelManifest?.modelId || "").trim();
    if (_0x19d3fe && hasModelManifest(_0x19d3fe)) {
      return _0x19d3fe;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function resolveNodeSchemaModelId(_0x533b39 = {}) {
  const _0x369efd = String(_0x533b39?.provider || "").trim();
  const _0x564d83 = String(_0x533b39?.type || "").trim() === "ai-audio" ? [_0x533b39?.model, _0x533b39?.audioWorkflowKey] : [_0x533b39?.model];
  for (const _0x4131b7 of _0x564d83) {
    const _0x50ad82 = resolveSchemaModelId(_0x4131b7, _0x369efd);
    if (_0x50ad82) {
      return _0x50ad82;
    }
  }
  return "";
}
function getProviderIdFromModelId(_0x554b3b) {
  const _0x1d87c1 = String(_0x554b3b || "").trim();
  const _0x4e78a4 = _0x1d87c1.indexOf("/");
  if (_0x4e78a4 > 0) {
    return _0x1d87c1.slice(0, _0x4e78a4);
  } else {
    return "";
  }
}
function getRegisteredProviderManifests(_0x59664e) {
  const _0x219e34 = String(_0x59664e || "").trim();
  if (!_0x219e34) {
    return [];
  }
  return listModelManifests().filter(_0x9126db => {
    const _0x33d5ac = _0x9126db?.extensions?.customProvider || {};
    return String(_0x9126db?.provider || "").trim() === _0x219e34 || String(_0x33d5ac?.providerId || "").trim() === _0x219e34;
  });
}
function hasCustomProviderManifests(_0x112454) {
  return getRegisteredProviderManifests(_0x112454).some(_0x5748e5 => {
    const _0x427c14 = _0x5748e5?.extensions?.customProvider;
    return _0x427c14 && typeof _0x427c14 === "object";
  });
}
function hasKnownProvider(_0x2bfac0) {
  return getRegisteredProviderManifests(_0x2bfac0).length > 0;
}
function hasUnavailableRememberedCustomModel(_0x356540, _0x4425ac, _0x34f649) {
  if (!isPlainObject(_0x34f649)) {
    return false;
  }
  const _0x276965 = hasOwnField(_0x4425ac, "model");
  const _0x2fb9c1 = hasOwnField(_0x4425ac, "audioWorkflowKey");
  if (_0x276965) {
    return false;
  }
  if (_0x356540 === "ai-audio" && _0x2fb9c1) {
    return false;
  }
  const _0x38a9c7 = _0x356540 === "ai-audio" ? _0x34f649.model || _0x34f649.audioWorkflowKey : _0x34f649.model;
  if (!hasUsableValue(_0x38a9c7)) {
    return false;
  }
  const _0x213e0c = String(_0x34f649.provider || getProviderIdFromModelId(_0x38a9c7)).trim();
  if (resolveSchemaModelId(_0x38a9c7, _0x213e0c)) {
    return false;
  }
  if (_0x213e0c && hasCustomProviderManifests(_0x213e0c)) {
    return true;
  }
  if (_0x213e0c) {
    return !hasKnownProvider(_0x213e0c);
  } else {
    return false;
  }
}
function getSchemaFieldIds(_0x190ad1) {
  const _0x330725 = getModelManifest(_0x190ad1)?.uiSchema?.fields;
  return new Set((Array.isArray(_0x330725) ? _0x330725 : []).map(_0x1d8425 => String(_0x1d8425?.id || "").trim()).filter(Boolean));
}
function sanitizeSchemaParams(_0x31cb9d, _0x10da8e = {}, _0x1d2dfc = {}) {
  const _0x5c9643 = resolveSchemaModelId(_0x31cb9d);
  if (!_0x5c9643) {
    return {};
  }
  const _0x5c6627 = getModelManifest(_0x5c9643);
  const _0x140f09 = Array.isArray(_0x5c6627?.uiSchema?.fields) ? _0x5c6627.uiSchema.fields : [];
  const _0x586cbe = getSchemaFieldIds(_0x5c9643);
  if (!_0x586cbe.size) {
    return {};
  }
  const _0x2eb2c1 = getPlainParams(_0x10da8e);
  const _0x5c0048 = sanitizeModelUiSchemaParams(_0x5c9643, _0x2eb2c1, {
    includeDefaults: _0x1d2dfc.includeDefaults === true
  });
  const _0x3f2aad = new Set(_0x140f09.filter(_0xddf212 => _0xddf212?.allowEmpty === true).map(_0x50118d => String(_0x50118d?.id || "").trim()).filter(Boolean));
  const _0x1dab33 = {};
  for (const [_0x5bbf9a, _0x5b0e36] of Object.entries(_0x5c0048)) {
    if (!_0x586cbe.has(_0x5bbf9a)) {
      continue;
    }
    if (_0x3f2aad.has(_0x5bbf9a)) {
      if (_0x5b0e36 === undefined || _0x5b0e36 === null) {
        continue;
      }
      _0x1dab33[_0x5bbf9a] = _0x5b0e36;
      continue;
    }
    if (!hasUsableValue(_0x5b0e36)) {
      continue;
    }
    _0x1dab33[_0x5bbf9a] = _0x5b0e36;
  }
  return _0x1dab33;
}
function sanitizeModelParamsMemoryRecord(_0x32a82a) {
  if (!isPlainObject(_0x32a82a)) {
    return {};
  }
  const _0x33c70c = {};
  for (const [_0x117219, _0x5a8c9b] of Object.entries(_0x32a82a)) {
    const _0x3a5b53 = resolveSchemaModelId(_0x117219);
    if (!_0x3a5b53) {
      continue;
    }
    const _0x4337da = sanitizeSchemaParams(_0x3a5b53, _0x5a8c9b, {
      includeDefaults: false
    });
    if (Object.keys(_0x4337da).length > 0) {
      _0x33c70c[_0x3a5b53] = _0x4337da;
    }
  }
  return _0x33c70c;
}
function mergeModelProviderProfileMemory(_0x337e53, _0x41aa78) {
  const _0x5de440 = sanitizeModelProviderProfileMemory(_0x41aa78);
  if (Object.keys(_0x5de440).length === 0) {
    return false;
  }
  const _0x22dc5f = sanitizeModelProviderProfileMemory(_0x337e53[MODEL_PROVIDER_PROFILE_MEMORY_KEY]);
  const _0x2574b4 = {
    ..._0x22dc5f,
    ..._0x5de440
  };
  if (JSON.stringify(_0x22dc5f) === JSON.stringify(_0x2574b4)) {
    return false;
  }
  _0x337e53[MODEL_PROVIDER_PROFILE_MEMORY_KEY] = _0x2574b4;
  return true;
}
function getModelParamsMemory(_0x548e81, _0x4fc583) {
  const _0x49e6b4 = isPlainObject(_0x548e81?.[MODEL_PARAMS_MEMORY_KEY]) ? _0x548e81[MODEL_PARAMS_MEMORY_KEY] : {};
  return getPlainParams(_0x49e6b4[_0x4fc583]);
}
function pickSchemaFieldValues(_0x2ac012, _0x69aa0) {
  const _0x4bc92f = {};
  if (!isPlainObject(_0x2ac012) || !_0x69aa0?.size) {
    return _0x4bc92f;
  }
  for (const _0x4bd0c5 of _0x69aa0) {
    if (!hasOwnField(_0x2ac012, _0x4bd0c5)) {
      continue;
    }
    const _0x3e145d = _0x2ac012[_0x4bd0c5];
    if (!hasUsableValue(_0x3e145d)) {
      continue;
    }
    _0x4bc92f[_0x4bd0c5] = _0x3e145d;
  }
  return _0x4bc92f;
}
function mergeModelParamMemory(_0x3b9f61, _0x4579e7, _0xe83168) {
  const _0xd7673b = resolveSchemaModelId(_0x4579e7);
  if (!_0xd7673b) {
    return false;
  }
  const _0x2e5f1b = sanitizeSchemaParams(_0xd7673b, _0xe83168, {
    includeDefaults: false
  });
  if (Object.keys(_0x2e5f1b).length === 0) {
    return false;
  }
  if (!isPlainObject(_0x3b9f61[MODEL_PARAMS_MEMORY_KEY])) {
    _0x3b9f61[MODEL_PARAMS_MEMORY_KEY] = {};
  }
  const _0x3f85b9 = getPlainParams(_0x3b9f61[MODEL_PARAMS_MEMORY_KEY][_0xd7673b]);
  const _0x28a00b = {
    ..._0x3f85b9,
    ..._0x2e5f1b
  };
  const _0x67c93 = JSON.stringify(_0x3f85b9) !== JSON.stringify(_0x28a00b);
  if (_0x67c93) {
    _0x3b9f61[MODEL_PARAMS_MEMORY_KEY][_0xd7673b] = _0x28a00b;
  }
  return _0x67c93;
}
function applyModelScopedParamsToNodeData(_0x36f106, _0x54b41f, _0x5ec12c, _0x2caf6c) {
  if (!isSchemaMemoryNodeType(_0x2caf6c)) {
    return _0x54b41f;
  }
  const _0x16eaf7 = resolveNodeSchemaModelId(_0x54b41f);
  if (!_0x16eaf7) {
    return _0x54b41f;
  }
  const _0x53414f = getSchemaFieldIds(_0x16eaf7);
  if (!_0x53414f.size) {
    return _0x54b41f;
  }
  const _0x404772 = pickSchemaFieldValues(_0x5ec12c, _0x53414f);
  const _0xcd418d = getModelParamsMemory(_0x5ec12c, _0x16eaf7);
  const _0x32478a = getPlainParams(getPlainParams(_0x36f106?.[MODEL_PARAMS_MEMORY_KEY])[_0x16eaf7]);
  const _0x5221c6 = pickSchemaFieldValues(_0x36f106, _0x53414f);
  const _0x671c44 = getPlainParams(_0x36f106?.generationParams);
  const _0x3c661d = Object.keys(_0x404772).length > 0 || Object.keys(_0xcd418d).length > 0 || Object.keys(_0x32478a).length > 0 || Object.keys(_0x671c44).length > 0;
  if (!_0x3c661d) {
    return _0x54b41f;
  }
  const _0x5baa21 = sanitizeSchemaParams(_0x16eaf7, {
    ..._0x404772,
    ..._0xcd418d,
    ..._0x32478a,
    ..._0x5221c6,
    ..._0x671c44
  }, {
    includeDefaults: true
  });
  if (Object.keys(_0x5baa21).length === 0) {
    return _0x54b41f;
  }
  const _0xd42951 = getPlainParams(_0x54b41f.generationParams);
  const _0x18c475 = getPlainParams(_0x54b41f[MODEL_PARAMS_MEMORY_KEY]);
  return {
    ..._0x54b41f,
    generationParams: {
      ..._0xd42951,
      ..._0x5baa21
    },
    [MODEL_PARAMS_MEMORY_KEY]: {
      ..._0x18c475,
      [_0x16eaf7]: _0x5baa21
    }
  };
}
function applyModelProviderProfileToNodeData(_0x2c4cb3, _0x241c99, _0x582267) {
  const _0x18364f = resolveNodeSchemaModelId(_0x241c99);
  const _0x51bd76 = getModelProviderProfileMemoryKey(_0x18364f);
  if (!_0x51bd76 || getModelProviderProfileIds(_0x51bd76).length === 0) {
    return _0x241c99;
  }
  const _0x3e2938 = sanitizeModelProviderProfileMemory(_0x582267?.[MODEL_PROVIDER_PROFILE_MEMORY_KEY]);
  const _0x4b5798 = sanitizeModelProviderProfileMemory(_0x2c4cb3?.[MODEL_PROVIDER_PROFILE_MEMORY_KEY]);
  const _0x22f9f8 = {
    ..._0x3e2938,
    ..._0x4b5798
  };
  const _0x25eebe = hasOwnField(_0x2c4cb3, "providerProfileId") ? _0x2c4cb3.providerProfileId : _0x22f9f8[_0x51bd76];
  const _0x20fb6b = normalizeModelProviderProfileId(_0x51bd76, _0x25eebe);
  _0x22f9f8[_0x51bd76] = _0x20fb6b;
  return {
    ..._0x241c99,
    providerProfileId: _0x20fb6b,
    [MODEL_PROVIDER_PROFILE_MEMORY_KEY]: _0x22f9f8
  };
}
function captureModelScopedParamsFromPatch(_0x4aabc6, _0x334aaa, _0x2c79a6, _0x208cce) {
  if (!isSchemaMemoryNodeType(_0x4aabc6)) {
    return false;
  }
  let _0x28d68e = false;
  const _0xe730bd = sanitizeModelParamsMemoryRecord(_0x2c79a6?.[MODEL_PARAMS_MEMORY_KEY]);
  for (const [_0x3eadfa, _0x251ba3] of Object.entries(_0xe730bd)) {
    if (mergeModelParamMemory(_0x208cce, _0x3eadfa, _0x251ba3)) {
      _0x28d68e = true;
    }
  }
  const _0x2959b1 = resolveNodeSchemaModelId({
    ..._0x334aaa,
    ..._0x2c79a6
  });
  if (!_0x2959b1) {
    return _0x28d68e;
  }
  const _0x157adf = getSchemaFieldIds(_0x2959b1);
  if (!_0x157adf.size) {
    return _0x28d68e;
  }
  const _0x30c4a8 = getPlainParams(_0x2c79a6?.generationParams);
  if (mergeModelParamMemory(_0x208cce, _0x2959b1, _0x30c4a8)) {
    _0x28d68e = true;
  }
  return _0x28d68e;
}
function captureModelProviderProfileFromPatch(_0x59c3ea, _0x556235, _0x1daa42) {
  let _0x474eb6 = mergeModelProviderProfileMemory(_0x1daa42, _0x556235?.[MODEL_PROVIDER_PROFILE_MEMORY_KEY]);
  const _0x34c6ec = resolveNodeSchemaModelId({
    ..._0x59c3ea,
    ..._0x556235
  });
  const _0x129b0c = getModelProviderProfileMemoryKey(_0x34c6ec);
  if (!_0x129b0c || getModelProviderProfileIds(_0x129b0c).length === 0) {
    return _0x474eb6;
  }
  if (!hasOwnField(_0x556235, "providerProfileId")) {
    return _0x474eb6;
  }
  const _0x3332ff = normalizeModelProviderProfileId(_0x129b0c, _0x556235.providerProfileId);
  if (!_0x3332ff) {
    return _0x474eb6;
  }
  if (mergeModelProviderProfileMemory(_0x1daa42, {
    [_0x129b0c]: _0x3332ff
  })) {
    _0x474eb6 = true;
  }
  return _0x474eb6;
}
export function sanitizeFeatureSelectionsRecord(_0x10d001) {
  if (!isPlainObject(_0x10d001)) {
    return {};
  }
  const _0x360a38 = {};
  for (const [_0x153fb2, _0x3c7145] of Object.entries(_0x10d001)) {
    if (!isPlainObject(_0x3c7145)) {
      continue;
    }
    const _0x44aa1e = {};
    for (const [_0x1a1f44, _0x319cd7] of Object.entries(_0x3c7145)) {
      if (_0x1a1f44 === MODEL_PARAMS_MEMORY_KEY) {
        if (!NODE_MODEL_PARAMS_MEMORY_TYPES.has(String(_0x153fb2 || ""))) {
          continue;
        }
        const _0x5d3824 = sanitizeModelParamsMemoryRecord(_0x319cd7);
        if (Object.keys(_0x5d3824).length > 0) {
          _0x44aa1e[MODEL_PARAMS_MEMORY_KEY] = _0x5d3824;
        }
        continue;
      }
      if (_0x1a1f44 === MODEL_PROVIDER_PROFILE_MEMORY_KEY) {
        if (!NODE_PROVIDER_PROFILE_MEMORY_TYPES.has(String(_0x153fb2 || ""))) {
          continue;
        }
        const _0x10d9f = sanitizeModelProviderProfileMemory(_0x319cd7);
        if (Object.keys(_0x10d9f).length > 0) {
          _0x44aa1e[MODEL_PROVIDER_PROFILE_MEMORY_KEY] = _0x10d9f;
        }
        continue;
      }
      if (!hasUsableValue(_0x319cd7)) {
        continue;
      }
      _0x44aa1e[String(_0x1a1f44)] = _0x319cd7;
    }
    if (Object.keys(_0x44aa1e).length > 0) {
      _0x360a38[String(_0x153fb2)] = _0x44aa1e;
    }
  }
  return _0x360a38;
}
export function applyFeatureSelectionsToNodeData(_0x127d34, _0x6fae52) {
  if (!isPlainObject(_0x127d34)) {
    return _0x127d34;
  }
  const _0x1cf284 = String(_0x127d34.type || "").trim();
  const _0x3aab98 = toModuleKey(_0x1cf284);
  if (!_0x3aab98) {
    return _0x127d34;
  }
  const _0x1865bf = NODE_DEFAULT_SELECTIONS[_0x1cf284] || {};
  const _0x5bfaa8 = NODE_MEMORY_SELECTION_FIELDS[_0x1cf284] || [];
  const _0x3e63d4 = isPlainObject(_0x6fae52?.[_0x3aab98]) ? _0x6fae52[_0x3aab98] : {};
  const _0x5ee653 = hasUnavailableRememberedCustomModel(_0x1cf284, _0x127d34, _0x3e63d4) ? {} : _0x3e63d4;
  const _0x1e2704 = {
    ..._0x127d34
  };
  for (const _0x21d0d5 of _0x5bfaa8) {
    if (hasOwnField(_0x127d34, _0x21d0d5)) {
      continue;
    }
    if (!hasUsableValue(_0x5ee653[_0x21d0d5])) {
      continue;
    }
    _0x1e2704[_0x21d0d5] = _0x5ee653[_0x21d0d5];
  }
  for (const [_0x290941, _0x3e633f] of Object.entries(_0x1865bf)) {
    if (hasOwnField(_0x127d34, _0x290941)) {
      continue;
    }
    if (hasUsableValue(_0x1e2704[_0x290941])) {
      continue;
    }
    _0x1e2704[_0x290941] = _0x3e633f;
  }
  const _0x53ec66 = hasOwnField(_0x127d34, "model");
  const _0x4ac10c = hasOwnField(_0x127d34, "audioWorkflowKey");
  if (_0x1cf284 === "ai-audio" && _0x53ec66 && !_0x4ac10c && hasUsableValue(_0x1e2704.model)) {
    const _0x47f320 = String(_0x1e2704.model).trim();
    if (_0x47f320 === "indextts2_clone" || _0x47f320 === "voice_convert") {
      _0x1e2704.audioWorkflowKey = _0x47f320;
    }
  }
  if (_0x1cf284 === "ai-audio" && _0x4ac10c && !_0x53ec66 && hasUsableValue(_0x1e2704.audioWorkflowKey)) {
    _0x1e2704.model = String(_0x1e2704.audioWorkflowKey).trim();
  }
  if (!hasUsableValue(_0x1e2704.audioWorkflowKey) && hasUsableValue(_0x1e2704.model)) {
    const _0x25e9ba = String(_0x1e2704.model).trim();
    if (_0x25e9ba === "indextts2_clone" || _0x25e9ba === "voice_convert") {
      _0x1e2704.audioWorkflowKey = _0x25e9ba;
    }
  }
  if (!hasUsableValue(_0x1e2704.model) && hasUsableValue(_0x1e2704.audioWorkflowKey)) {
    _0x1e2704.model = String(_0x1e2704.audioWorkflowKey).trim();
  }
  const _0x10e62b = applyModelScopedParamsToNodeData(_0x127d34, _0x1e2704, _0x5ee653, _0x1cf284);
  return applyModelProviderProfileToNodeData(_0x127d34, _0x10e62b, _0x5ee653);
}
export function captureFeatureSelectionsFromNodePatch(_0x356983, _0x5ac10f, _0x18a3d4) {
  const _0x41dd99 = String(_0x356983?.type || "").trim();
  const _0x3f9c35 = toModuleKey(_0x41dd99);
  if (!_0x3f9c35 || !isPlainObject(_0x5ac10f) || !isPlainObject(_0x18a3d4)) {
    return false;
  }
  const _0x590e86 = NODE_MEMORY_SELECTION_FIELDS[_0x41dd99] || [];
  const _0x379ce7 = ensureModuleRecord(_0x18a3d4, _0x3f9c35);
  let _0x20157b = false;
  for (const _0x19082c of _0x590e86) {
    if (!Object.prototype.hasOwnProperty.call(_0x5ac10f, _0x19082c)) {
      continue;
    }
    const _0x2f12a3 = _0x5ac10f[_0x19082c];
    if (!hasUsableValue(_0x2f12a3)) {
      continue;
    }
    if (_0x379ce7[_0x19082c] === _0x2f12a3) {
      continue;
    }
    _0x379ce7[_0x19082c] = _0x2f12a3;
    _0x20157b = true;
  }
  if (Object.prototype.hasOwnProperty.call(_0x5ac10f, "model") && !Object.prototype.hasOwnProperty.call(_0x5ac10f, "audioWorkflowKey") && _0x41dd99 === "ai-audio" && hasUsableValue(_0x5ac10f.model)) {
    const _0x1c9c34 = String(_0x5ac10f.model).trim();
    if (_0x1c9c34 === "indextts2_clone" || _0x1c9c34 === "voice_convert") {
      if (_0x379ce7.audioWorkflowKey !== _0x1c9c34) {
        _0x379ce7.audioWorkflowKey = _0x1c9c34;
        _0x20157b = true;
      }
    }
  }
  if (captureModelScopedParamsFromPatch(_0x41dd99, _0x356983, _0x5ac10f, _0x379ce7)) {
    _0x20157b = true;
  }
  if (NODE_PROVIDER_PROFILE_MEMORY_TYPES.has(_0x41dd99) && captureModelProviderProfileFromPatch(_0x356983, _0x5ac10f, _0x379ce7)) {
    _0x20157b = true;
  }
  return _0x20157b;
}