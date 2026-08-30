import { CUSTOM_PROVIDER_VIP_MODEL_ID, isModelAllowed } from "../subscriptionAccess.js";
export function isCustomProviderAccessAllowed(_0x4c8311 = {}) {
  return isModelAllowed(CUSTOM_PROVIDER_VIP_MODEL_ID, _0x4c8311, "aicanvas");
}
export function applyCustomProviderModelSelectionState(_0x553734, {
  modelKey = "",
  detectedKind = "unknown",
  selected = false
} = {}) {
  const _0x3aedd7 = String(modelKey || "").trim();
  if (!_0x3aedd7) {
    return false;
  }
  if (selected) {
    _0x553734.selectedModelKeys.add(_0x3aedd7);
    return false;
  }
  _0x553734.selectedModelKeys.delete(_0x3aedd7);
  const _0x3a68b8 = String(detectedKind || "unknown").trim().toLowerCase() === "unknown";
  if (_0x3a68b8) {
    _0x553734.assignedModelKinds.delete(_0x3aedd7);
  }
  return _0x3a68b8;
}
export function scrollCustomProviderModelListFromWheel(_0x2b1f8b, _0x2ffcfe = {}) {
  if (!_0x2b1f8b) {
    return false;
  }
  const _0x2ea5a0 = Number(_0x2ffcfe?.deltaY);
  if (!Number.isFinite(_0x2ea5a0) || _0x2ea5a0 === 0) {
    return false;
  }
  const _0x226bdf = Math.max(0, Number(_0x2b1f8b.clientHeight) || 0);
  const _0x10f7be = Math.max(_0x226bdf, Number(_0x2b1f8b.scrollHeight) || 0);
  const _0x449ee8 = Math.max(0, _0x10f7be - _0x226bdf);
  const _0x3e59e0 = Math.min(_0x449ee8, Math.max(0, Number(_0x2b1f8b.scrollTop) || 0));
  const _0xee018b = Number(_0x2ffcfe?.deltaMode) || 0;
  const _0x1a3e15 = _0xee018b === 1 ? 16 : _0xee018b === 2 ? Math.max(_0x226bdf, 1) : 1;
  const _0x475dfc = Math.min(_0x449ee8, Math.max(0, _0x3e59e0 + _0x2ea5a0 * _0x1a3e15));
  if (_0x475dfc === _0x3e59e0) {
    return false;
  }
  _0x2b1f8b.scrollTop = _0x475dfc;
  return true;
}
export function handleCustomProviderResultWheel(_0x6b898, _0x54333a) {
  const _0x2862fe = _0x6b898?.target?.closest?.("[data-custom-provider-result]");
  if (!_0x2862fe || !_0x54333a?.contains?.(_0x2862fe)) {
    return false;
  }
  if (_0x6b898.target?.closest?.(".custom-provider-model-options")) {
    return false;
  }
  const _0x37fe23 = _0x2862fe.querySelector?.(".custom-provider-model-options");
  if (!scrollCustomProviderModelListFromWheel(_0x37fe23, _0x6b898)) {
    return false;
  }
  _0x6b898.preventDefault?.();
  return true;
}
export function captureCustomProviderModelSelectionScroll(_0x46dd38) {
  const _0x454431 = _0x46dd38?.querySelector?.(".custom-provider-model-options");
  return {
    resultScrollTop: Math.max(0, Number(_0x46dd38?.scrollTop) || 0),
    modelListScrollTop: Math.max(0, Number(_0x454431?.scrollTop) || 0)
  };
}
export function restoreCustomProviderModelSelectionScroll(_0x21d54b, _0x21a92e = {}) {
  if (!_0x21d54b) {
    return false;
  }
  const _0x460924 = _0x21d54b.querySelector?.(".custom-provider-model-options");
  _0x21d54b.scrollTop = Math.max(0, Number(_0x21a92e.resultScrollTop) || 0);
  if (_0x460924) {
    _0x460924.scrollTop = Math.max(0, Number(_0x21a92e.modelListScrollTop) || 0);
  }
  return !!_0x460924;
}
const CUSTOM_PROVIDER_EDITOR_STABLE_HEIGHT_PROPERTY = "--custom-provider-editor-stable-height";
export function stabilizeCustomProviderEditorListHeight(_0x306b6b) {
  if (!_0x306b6b) {
    return 0;
  }
  const _0x233fae = Number(_0x306b6b.getBoundingClientRect?.().height);
  const _0x2be720 = Number.isFinite(_0x233fae) ? Math.max(0, _0x233fae) : Math.max(0, Number(_0x306b6b.offsetHeight) || 0);
  const _0x48a93e = Math.max(0, Number(_0x306b6b.dataset?.customProviderStableHeight) || 0);
  const _0x1d409b = Math.ceil(Math.max(_0x2be720, _0x48a93e));
  if (!_0x1d409b) {
    return 0;
  }
  if (_0x306b6b.dataset) {
    _0x306b6b.dataset.customProviderStableHeight = String(_0x1d409b);
  }
  _0x306b6b.style?.setProperty?.(CUSTOM_PROVIDER_EDITOR_STABLE_HEIGHT_PROPERTY, _0x1d409b + "px");
  return _0x1d409b;
}
function getCustomProviderManifestUpstreamModelId(_0x298b0a = {}) {
  const _0x57187c = _0x298b0a?.extensions?.customProvider || {};
  const _0x488c88 = String(_0x298b0a?.modelId || "").trim();
  return String(_0x57187c.upstreamModelId || _0x298b0a.displayName || _0x488c88.split("/").pop() || "").trim();
}
function getCustomProviderModelCapabilityStatus(_0x188738 = {}) {
  return String(_0x188738?.capabilityStatus || _0x188738?.extensions?.customProvider?.capability?.status || "unverified").trim().toLowerCase();
}
export function isCustomProviderModelCapabilityRecognized(_0x2389d4 = {}) {
  return ["documented", "verified"].includes(getCustomProviderModelCapabilityStatus(_0x2389d4));
}
export function getCustomProviderModelsNeedingVerification(_0x303f21 = []) {
  return (Array.isArray(_0x303f21) ? _0x303f21 : []).filter(_0xf86d7a => !isCustomProviderModelCapabilityRecognized(_0xf86d7a));
}
export function getCustomProviderSaveStatus(_0xfa8065 = []) {
  const _0x41003a = Array.isArray(_0xfa8065) ? _0xfa8065 : [];
  const _0x31c718 = getCustomProviderModelsNeedingVerification(_0x41003a).length;
  return {
    key: _0x31c718 > 0 ? "savedWithUnverified" : "saved",
    count: _0x41003a.length,
    unverified: _0x31c718
  };
}
export function getCustomProviderModelActionState({
  hasDiscovery = false,
  hasSavedBundle = false,
  isAddingModels = false,
  selectedCount = 0
} = {}) {
  return {
    saveHidden: !hasDiscovery,
    saveDisabled: selectedCount <= 0,
    verifyHidden: !hasDiscovery && !hasSavedBundle,
    verifyDisabled: selectedCount <= 0,
    actionsHidden: !hasDiscovery && !hasSavedBundle,
    saveLabelKey: isAddingModels ? "addModels" : "saveModels"
  };
}
export function mergeCustomProviderDiscoveryCapabilities(_0x1aee76 = {}, _0x4660c3 = {}) {
  const _0x5f55a3 = new Map((Array.isArray(_0x4660c3?.models) ? _0x4660c3.models : []).map(_0x19b614 => {
    const _0x213fcb = _0x19b614?.extensions?.customProvider?.capability || {};
    const _0x9c2800 = isCustomProviderModelCapabilityRecognized(_0x19b614);
    return [getCustomProviderManifestUpstreamModelId(_0x19b614), {
      isSaved: true,
      ...(_0x9c2800 ? {
        capabilitySource: String(_0x213fcb.source || "stored-bundle").trim(),
        capabilityStatus: getCustomProviderModelCapabilityStatus(_0x19b614)
      } : {})
    }];
  }).filter(([_0x8d5d1b]) => _0x8d5d1b));
  const _0x571315 = _0x52db9c => (Array.isArray(_0x52db9c) ? _0x52db9c : []).map(_0x12d7b8 => {
    const _0x5c2811 = _0x5f55a3.get(String(_0x12d7b8?.upstreamModelId || "").trim());
    if (_0x5c2811) {
      return {
        ..._0x12d7b8,
        ..._0x5c2811
      };
    } else {
      return _0x12d7b8;
    }
  });
  return {
    ..._0x1aee76,
    models: _0x571315(_0x1aee76?.models),
    unknown: _0x571315(_0x1aee76?.unknown)
  };
}
export function mergeCustomProviderRecognizedProfiles(_0x9da5a7 = {}, _0x47c4a6 = {}) {
  const _0x31363a = (_0x47556a, _0x370e5c) => {
    const _0x46c9f7 = _0x47556a?.extensions && typeof _0x47556a.extensions === "object" ? _0x47556a.extensions : {};
    const _0x4d33fd = _0x370e5c?.extensions && typeof _0x370e5c.extensions === "object" ? _0x370e5c.extensions : {};
    const _0x5f0c52 = _0x46c9f7.customProvider && typeof _0x46c9f7.customProvider === "object" ? _0x46c9f7.customProvider : {};
    const _0x2f4b40 = _0x4d33fd.customProvider && typeof _0x4d33fd.customProvider === "object" ? _0x4d33fd.customProvider : {};
    const _0x110ed2 = {
      ..._0x46c9f7,
      ..._0x4d33fd,
      customProvider: {
        ..._0x2f4b40,
        ..._0x5f0c52,
        capability: _0x2f4b40.capability || _0x5f0c52.capability
      }
    };
    ["textMenu", "imageMenu", "videoMenu", "audioMenu"].forEach(_0x10d6a8 => {
      const _0x2c32a3 = _0x46c9f7[_0x10d6a8];
      if (!_0x2c32a3 || typeof _0x2c32a3 !== "object") {
        return;
      }
      const _0x1ff18a = _0x4d33fd[_0x10d6a8];
      _0x110ed2[_0x10d6a8] = {
        ...(_0x1ff18a && typeof _0x1ff18a === "object" ? _0x1ff18a : {}),
        ..._0x2c32a3
      };
    });
    return {
      ..._0x370e5c,
      extensions: _0x110ed2
    };
  };
  const _0x2a381f = new Map((Array.isArray(_0x47c4a6?.models) ? _0x47c4a6.models : []).filter(isCustomProviderModelCapabilityRecognized).map(_0xa39797 => [getCustomProviderManifestUpstreamModelId(_0xa39797), _0xa39797]).filter(([_0x50c8a9]) => _0x50c8a9));
  const _0x16242e = new Map((Array.isArray(_0x47c4a6?.executions) ? _0x47c4a6.executions : []).map(_0x5a7601 => [String(_0x5a7601?.id || "").trim(), _0x5a7601]).filter(([_0x2ed548]) => _0x2ed548));
  const _0x135d0f = new Map((Array.isArray(_0x9da5a7?.executions) ? _0x9da5a7.executions : []).map(_0x306123 => [String(_0x306123?.id || "").trim(), _0x306123]).filter(([_0x38926a]) => _0x38926a));
  const _0x39b790 = new Set();
  const _0x1ace6b = (Array.isArray(_0x9da5a7?.models) ? _0x9da5a7.models : []).map(_0x315347 => {
    const _0x1ddf9b = _0x2a381f.get(getCustomProviderManifestUpstreamModelId(_0x315347));
    if (!_0x1ddf9b) {
      return _0x315347;
    }
    _0x39b790.add(String(_0x1ddf9b.executionId || "").trim());
    return _0x31363a(_0x315347, _0x1ddf9b);
  });
  const _0x545044 = new Set();
  const _0x5983e4 = _0x1ace6b.flatMap(_0x4ec55a => {
    const _0x5739c7 = String(_0x4ec55a?.executionId || "").trim();
    if (!_0x5739c7 || _0x545044.has(_0x5739c7)) {
      return [];
    }
    _0x545044.add(_0x5739c7);
    const _0x1e4a26 = _0x39b790.has(_0x5739c7) ? _0x16242e.get(_0x5739c7) || _0x135d0f.get(_0x5739c7) : _0x135d0f.get(_0x5739c7) || _0x16242e.get(_0x5739c7);
    if (_0x1e4a26) {
      return [_0x1e4a26];
    } else {
      return [];
    }
  });
  return {
    ..._0x9da5a7,
    models: _0x1ace6b,
    executions: _0x5983e4
  };
}
export function resolveCustomProviderDocumentationFailureKey(_0x352bee = {}) {
  const _0x498b4f = (Array.isArray(_0x352bee?.agentModelResults) ? _0x352bee.agentModelResults : []).map(_0x37b3d5 => String(_0x37b3d5?.status || "").trim().toLowerCase());
  if (_0x498b4f.includes("inaccessible")) {
    return "documentationAgentInaccessible";
  }
  if (_0x498b4f.includes("unsupported_lifecycle")) {
    return "documentationAsyncLifecycleUnsupported";
  }
  if (_0x498b4f.includes("not_found")) {
    return "documentationSelectedModelNotFound";
  }
  return "documentationNoMatchingProfile";
}
export function getRememberedCustomProviderConfigs(_0x28ec8b = {}) {
  return Object.entries(_0x28ec8b && typeof _0x28ec8b === "object" ? _0x28ec8b : {}).filter(([_0x5a3666, _0x2293e7]) => {
    if (!String(_0x5a3666 || "").startsWith("custom_")) {
      return false;
    }
    if (!_0x2293e7 || typeof _0x2293e7 !== "object" || Array.isArray(_0x2293e7)) {
      return false;
    }
    return !!String(_0x2293e7.apiUrl || "").trim() && !!String(_0x2293e7.apiKey || "").trim();
  }).map(([_0x3f6a3a, _0x43ea1c]) => ({
    providerId: String(_0x3f6a3a).trim(),
    baseUrl: String(_0x43ea1c.apiUrl || "").trim(),
    apiKey: String(_0x43ea1c.apiKey || "").trim(),
    name: String(_0x43ea1c.label || _0x3f6a3a).trim(),
    documentationUrl: String(_0x43ea1c.documentationUrl || "").trim()
  }));
}