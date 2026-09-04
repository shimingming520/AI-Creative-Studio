import { resolveModelExecution, resolveModelProvider, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { getFixedInputSlotConfigFromManifest, shouldHideFixedInputSlots } from "../fixedInputAssetRefs.js";
import { resolveModelProviderProfileId } from "../modelProviderProfileSelection.js";
import { normalizeStoryAspectRatio } from "./storyProjectPlanning.js";
import { normalizeStoryPromptMode, resolveStoryPromptModeDefaultVideoModelId } from "./storyPromptModes.js";
import { isStoryWorkspaceModelVisible, resolveStoryWorkspaceModelId } from "./storyWorkspaceModelCatalog.js";
const STORY_VIDEO_REFERENCE_DEFAULT_MODE_FIELDS = Object.freeze({
  "apimart/wan3.0": "generation_type",
  "apimart/minimax-h3": "apimart_minimax_h3_mode",
  "minimax/hailuo-h3": "minimax_h3_mode",
  "runninghub-model/hailuo-h3": "rh_hailuo_h3_mode",
  "runninghub/2084286867645755393": "rh_hailuo_h3_mode"
});
function normalizeText(_0x40627f) {
  return String(_0x40627f || "").trim();
}
export function resolveStoryVideoProvider(_0x2f5c77, _0x4e289f = "") {
  return resolveModelProvider(_0x2f5c77, "", {
    allowProviderHint: false,
    allowPrefixInference: false
  }) || resolveModelProvider(_0x2f5c77, _0x4e289f);
}
export function resolveStoryPromptModeForVideoModel(_0x2431dd, _0xba5d04 = "seedance-2.0") {
  const _0x3f1895 = resolveModelExecution(_0x2431dd);
  return normalizeStoryPromptMode(_0x3f1895?.modelManifest?.extensions?.storyWorkspace?.promptMode || _0xba5d04, {
    allowDeveloperModes: true
  });
}
export function syncStoryPromptModeForVideoModel(_0x198ab9 = {}, _0x42ebc2 = _0x198ab9?.models?.video, _0x36430b = null) {
  const _0x1925e8 = rememberStoryEpisodeVideoModelSelection(_0x36430b, _0x42ebc2);
  const _0x239880 = _0x198ab9?.data?.project;
  if (!_0x239880 || typeof _0x239880 !== "object") {
    return _0x1925e8;
  }
  const _0x34af57 = normalizeStoryPromptMode(_0x239880?.planning?.promptMode, {
    allowDeveloperModes: true
  });
  const _0x34b84d = resolveStoryPromptModeForVideoModel(_0x42ebc2, _0x34af57);
  if (_0x34b84d === _0x34af57) {
    return _0x1925e8;
  }
  _0x239880.planning = {
    ...(_0x239880.planning || {}),
    promptMode: _0x34b84d
  };
  return true;
}
function getStoryVideoDurationSchemaField(_0x27af03) {
  const _0x5f39fd = resolveModelExecution(_0x27af03);
  const _0x2a8c0a = Array.isArray(_0x5f39fd?.modelManifest?.uiSchema?.fields) ? _0x5f39fd.modelManifest.uiSchema.fields : [];
  return _0x2a8c0a.find(_0x357c17 => normalizeText(_0x357c17?.id) === "duration") || null;
}
function normalizeDurationSeconds(_0xf8f13e) {
  const _0x33b0d9 = String(_0xf8f13e ?? "").match(/\d+(?:\.\d+)?/);
  const _0x15e885 = Number(_0x33b0d9?.[0]);
  if (Number.isFinite(_0x15e885) && _0x15e885 > 0) {
    return Number(_0x15e885.toFixed(1));
  } else {
    return 0;
  }
}
export function resolveStoryVideoGenerationDurationSeconds(_0x84336e, _0x312940 = {}) {
  const _0x354d13 = getStoryVideoDurationSchemaField(_0x84336e);
  if (!_0x354d13?.id) {
    return 0;
  }
  const _0x3e3e81 = normalizeStoryVideoGenerationParams(_0x84336e, _0x312940);
  return normalizeDurationSeconds(_0x3e3e81[_0x354d13.id]);
}
export function applyStoryVideoGenerationDurationSeconds(_0x5aba25, _0x4c0d93 = {}, _0x534123 = 0) {
  const _0x199304 = getStoryVideoDurationSchemaField(_0x5aba25);
  const _0x545d1d = normalizeStoryVideoGenerationParams(_0x5aba25, _0x4c0d93);
  const _0x4754f1 = normalizeDurationSeconds(_0x534123);
  if (!_0x199304?.id || !_0x4754f1) {
    return _0x545d1d;
  }
  return normalizeStoryVideoGenerationParams(_0x5aba25, {
    ..._0x545d1d,
    [_0x199304.id]: _0x4754f1
  });
}
export function getStoryClipVideoGenerationDurationOverride(_0x4520db = {}) {
  return normalizeDurationSeconds(_0x4520db?.videoGenerationDurationSec);
}
export function resolveStoryVideoInitialGenerationDurationSeconds(_0x11cb73, _0x3c6714 = 0) {
  const _0x21cc9a = getStoryVideoDurationSchemaField(_0x11cb73);
  const _0x41e10a = normalizeDurationSeconds(_0x3c6714);
  if (!_0x21cc9a?.id || !_0x41e10a) {
    return 0;
  }
  const _0x10c5eb = resolveStoryVideoClipDurationConstraints(_0x11cb73);
  const _0x1960a8 = Array.isArray(_0x10c5eb?.allowedSeconds) ? _0x10c5eb.allowedSeconds : [];
  if (_0x1960a8.length) {
    return _0x1960a8.find(_0x2b451f => _0x2b451f >= _0x41e10a) || _0x1960a8.at(-1) || 0;
  }
  const _0x3a3916 = Number(_0x10c5eb?.minSeconds) || 0;
  const _0x1277e3 = Number(_0x10c5eb?.maxSeconds) || 0;
  const _0x1c184f = Number(_0x10c5eb?.stepSeconds) || 0;
  let _0x31d32c = Math.max(_0x3a3916, _0x41e10a);
  if (_0x1c184f > 0) {
    const _0xf8487b = _0x3a3916 || 0;
    _0x31d32c = _0xf8487b + Math.ceil((_0x31d32c - _0xf8487b - 1e-9) / _0x1c184f) * _0x1c184f;
  }
  if (_0x1277e3 > 0) {
    _0x31d32c = Math.min(_0x31d32c, _0x1277e3);
  }
  return normalizeDurationSeconds(_0x31d32c);
}
export function initializeStoryClipVideoGenerationDuration(_0x506ad0, _0x28cbb9) {
  if (!_0x506ad0 || typeof _0x506ad0 !== "object") {
    return false;
  }
  if (getStoryClipVideoGenerationDurationOverride(_0x506ad0)) {
    return false;
  }
  const _0x1e44b1 = normalizeDurationSeconds(_0x506ad0.durationSec || _0x506ad0.durationSeconds || _0x506ad0.duration);
  const _0x252932 = resolveStoryVideoInitialGenerationDurationSeconds(_0x28cbb9, _0x1e44b1);
  if (!_0x252932) {
    return false;
  }
  _0x506ad0.videoGenerationDurationSec = _0x252932;
  return true;
}
export function initializeStoryEpisodeVideoGenerationDurations(_0x53f2ed, _0x2756e9) {
  if (!_0x53f2ed || typeof _0x53f2ed !== "object") {
    return 0;
  }
  return (Array.isArray(_0x53f2ed.clips) ? _0x53f2ed.clips : []).reduce((_0x538f37, _0x35df77) => _0x538f37 + Number(initializeStoryClipVideoGenerationDuration(_0x35df77, _0x2756e9)), 0);
}
export function setStoryClipVideoGenerationDurationOverride(_0xb21b11, _0x29d513) {
  if (!_0xb21b11 || typeof _0xb21b11 !== "object") {
    return false;
  }
  const _0x33f828 = normalizeDurationSeconds(_0x29d513);
  const _0x3281c8 = getStoryClipVideoGenerationDurationOverride(_0xb21b11);
  if (!_0x33f828) {
    delete _0xb21b11.videoGenerationDurationSec;
  } else {
    _0xb21b11.videoGenerationDurationSec = _0x33f828;
  }
  return _0x3281c8 !== getStoryClipVideoGenerationDurationOverride(_0xb21b11);
}
export function resolveStoryClipVideoGenerationParams(_0x333054, _0x39d90a, _0x7235bf = {}) {
  const _0x17f2de = getStoryClipVideoGenerationDurationOverride(_0x333054);
  if (_0x17f2de) {
    return applyStoryVideoGenerationDurationSeconds(_0x39d90a, _0x7235bf, _0x17f2de);
  } else {
    return normalizeStoryVideoGenerationParams(_0x39d90a, _0x7235bf);
  }
}
export function resolveStoryClipVideoGenerationDurationSeconds(_0x327b8d, _0x6ebf26, _0x24a759 = {}) {
  return resolveStoryVideoGenerationDurationSeconds(_0x6ebf26, resolveStoryClipVideoGenerationParams(_0x327b8d, _0x6ebf26, _0x24a759)) || normalizeDurationSeconds(_0x327b8d?.durationSec || _0x327b8d?.durationSeconds || _0x327b8d?.duration);
}
export function formatStoryClipVideoGenerationDuration(_0x1ae098, _0xf4be5f, _0x32ab2f = {}) {
  const _0x3adaf9 = resolveStoryClipVideoGenerationDurationSeconds(_0x1ae098, _0xf4be5f, _0x32ab2f);
  if (_0x3adaf9) {
    return _0x3adaf9.toFixed(1) + "s";
  } else {
    return "--";
  }
}
export function reconcileStoryClipVideoGenerationDurationChange({
  clip: _0x48f66c,
  previousModelId = "",
  modelId = previousModelId,
  previousGenerationParams = {},
  nextGenerationParams = {},
  generationParamsChanged = false,
  modelChanged = false
} = {}) {
  const _0x4b3a4d = normalizeStoryVideoGenerationParams(previousModelId, previousGenerationParams);
  let _0x2c2738 = normalizeStoryVideoGenerationParams(modelId, nextGenerationParams);
  if (!_0x48f66c || modelChanged) {
    return {
      generationParams: _0x2c2738,
      durationChanged: false,
      overrideChanged: false
    };
  }
  const _0x57bab1 = resolveStoryVideoGenerationDurationSeconds(previousModelId, _0x4b3a4d);
  const _0x35da73 = resolveStoryClipVideoGenerationDurationSeconds(_0x48f66c, previousModelId, _0x4b3a4d);
  const _0x5d2607 = resolveStoryVideoGenerationDurationSeconds(modelId, _0x2c2738);
  const _0x371570 = Boolean(getStoryClipVideoGenerationDurationOverride(_0x48f66c));
  const _0x51df59 = Boolean(generationParamsChanged) && _0x5d2607 > 0 && _0x5d2607 !== _0x35da73;
  const _0x5a101d = _0x51df59 ? setStoryClipVideoGenerationDurationOverride(_0x48f66c, _0x5d2607) : false;
  if (_0x57bab1 > 0 && (_0x51df59 || _0x371570 || getStoryClipVideoGenerationDurationOverride(_0x48f66c))) {
    _0x2c2738 = applyStoryVideoGenerationDurationSeconds(modelId, _0x2c2738, _0x57bab1);
  }
  return {
    generationParams: _0x2c2738,
    durationChanged: _0x51df59,
    overrideChanged: _0x5a101d
  };
}
function getStoryVideoAspectRatioSchemaField(_0x1575b2) {
  const _0x5dfa95 = resolveModelExecution(_0x1575b2);
  const _0x396e50 = Array.isArray(_0x5dfa95?.modelManifest?.uiSchema?.fields) ? _0x5dfa95.modelManifest.uiSchema.fields : [];
  return _0x396e50.find(_0x4ae865 => normalizeText(_0x4ae865?.id) === "aspectRatio" || normalizeText(_0x4ae865?.displayRole) === "aspectRatio") || null;
}
function getStoryVideoSchemaOptionValues(_0x19c63f) {
  return (Array.isArray(_0x19c63f?.options) ? _0x19c63f.options : []).map(_0x1c9249 => normalizeText(_0x1c9249 && typeof _0x1c9249 === "object" ? _0x1c9249.value : _0x1c9249)).filter(Boolean);
}
export function resolveStoryVideoClipDurationConstraints(_0x1c8226) {
  const _0x536446 = getStoryVideoDurationSchemaField(_0x1c8226);
  if (!_0x536446) {
    return null;
  }
  const _0x5361ec = [...new Set((Array.isArray(_0x536446.options) ? _0x536446.options : []).map(_0x452140 => Number(_0x452140 && typeof _0x452140 === "object" ? _0x452140.value : _0x452140)).filter(_0x5c2061 => Number.isFinite(_0x5c2061) && _0x5c2061 > 0))].sort((_0x30bace, _0x720d47) => _0x30bace - _0x720d47);
  const _0xaca56f = Number(_0x536446.min);
  const _0x1e13bb = Number(_0x536446.max);
  const _0x16642f = Number(_0x536446.step);
  const _0x3e1e44 = {
    minSeconds: Number.isFinite(_0xaca56f) && _0xaca56f > 0 ? _0xaca56f : _0x5361ec[0] || 0,
    maxSeconds: Number.isFinite(_0x1e13bb) && _0x1e13bb > 0 ? _0x1e13bb : _0x5361ec.at(-1) || 0,
    stepSeconds: Number.isFinite(_0x16642f) && _0x16642f > 0 ? _0x16642f : 0,
    allowedSeconds: _0x5361ec
  };
  if (_0x3e1e44.minSeconds || _0x3e1e44.maxSeconds || _0x3e1e44.allowedSeconds.length) {
    return _0x3e1e44;
  } else {
    return null;
  }
}
export function getStoryVideoFixedInputVisibilityKey(_0x4d4916, _0x494241 = "", _0x409bae = {}) {
  const _0x31d7a5 = resolveModelExecution(_0x4d4916, {
    providerHint: _0x494241
  });
  const _0x205f4c = getFixedInputSlotConfigFromManifest({
    model: _0x4d4916,
    provider: _0x494241,
    generationParams: _0x409bae
  }, {
    manifest: _0x31d7a5?.modelManifest || null
  });
  if (shouldHideFixedInputSlots(_0x205f4c)) {
    return "";
  }
  return normalizeText(_0x205f4c?.visibilityLayoutKey);
}
export function applyStoryVideoInitialModeDefault(_0x4b7890, _0x3eaa28 = {}) {
  const _0x4643d3 = STORY_VIDEO_REFERENCE_DEFAULT_MODE_FIELDS[_0x4b7890];
  if (!_0x4643d3) {
    return _0x3eaa28;
  }
  return {
    ...(_0x3eaa28 && typeof _0x3eaa28 === "object" ? _0x3eaa28 : {}),
    [_0x4643d3]: "reference"
  };
}
export function normalizeStoryVideoGenerationParams(_0x44342e, _0x1b1609 = {}) {
  const _0x54d8f2 = _0x1b1609 && typeof _0x1b1609 === "object" ? _0x1b1609 : {};
  const _0x2b4f9d = STORY_VIDEO_REFERENCE_DEFAULT_MODE_FIELDS[_0x44342e];
  const _0x195057 = _0x2b4f9d && !Object.hasOwn(_0x54d8f2, _0x2b4f9d) ? applyStoryVideoInitialModeDefault(_0x44342e, _0x54d8f2) : _0x54d8f2;
  return sanitizeModelUiSchemaParams(_0x44342e, _0x195057, {
    includeDefaults: true
  });
}
export function applyStoryAspectRatioToVideoGenerationParams(_0x132bd8, _0x54d212 = {}, _0x364ac7 = "16:9") {
  const _0x5eee70 = getStoryVideoAspectRatioSchemaField(_0x132bd8);
  const _0xaedb4b = normalizeStoryVideoGenerationParams(_0x132bd8, _0x54d212);
  if (!_0x5eee70?.id) {
    return _0xaedb4b;
  }
  const _0x886b40 = normalizeStoryAspectRatio(_0x364ac7);
  const _0x26a1e0 = getStoryVideoSchemaOptionValues(_0x5eee70);
  if (_0x26a1e0.length && !_0x26a1e0.includes(_0x886b40)) {
    return _0xaedb4b;
  }
  return normalizeStoryVideoGenerationParams(_0x132bd8, {
    ..._0xaedb4b,
    [_0x5eee70.id]: _0x886b40
  });
}
export function seedStoryAspectRatioInVideoGenerationParams(_0x363e82, _0x550eae = {}, _0x494c3e = "16:9") {
  const _0x38a4ce = getStoryVideoAspectRatioSchemaField(_0x363e82);
  const _0x121085 = normalizeStoryVideoGenerationParams(_0x363e82, _0x550eae);
  if (!_0x38a4ce?.id) {
    return _0x121085;
  }
  const _0x22f391 = normalizeText(_0x550eae?.[_0x38a4ce.id]);
  const _0x4d5884 = getStoryVideoSchemaOptionValues(_0x38a4ce);
  if (_0x22f391 && (!_0x4d5884.length || _0x4d5884.includes(_0x22f391))) {
    return _0x121085;
  }
  return applyStoryAspectRatioToVideoGenerationParams(_0x363e82, _0x121085, _0x494c3e);
}
export function recoverUnavailableStoryVideoModelState(_0x1e1b04 = {}, {
  clip = null
} = {}) {
  const _0x95b077 = normalizeText(_0x1e1b04.models?.video);
  const _0x1fec4f = normalizeText(_0x1e1b04.videoProvider);
  const _0x3e8f0b = resolveModelExecution(_0x95b077) || resolveModelExecution(_0x95b077, {
    providerHint: _0x1fec4f
  });
  if (_0x3e8f0b?.modelManifest?.kind === "video" && _0x3e8f0b?.executionManifest?.kind === "video" && isStoryWorkspaceModelVisible("video", _0x3e8f0b.modelManifest)) {
    const _0x4e0016 = normalizeText(_0x3e8f0b.modelManifest.provider);
    if (_0x4e0016 && _0x4e0016 !== _0x1fec4f) {
      _0x1e1b04.videoProvider = _0x4e0016;
      return true;
    }
    return false;
  }
  const _0x6b2dfc = resolveStoryWorkspaceModelId("video");
  const _0x2d9e1c = resolveModelExecution(_0x6b2dfc);
  if (!_0x6b2dfc || _0x2d9e1c?.modelManifest?.kind !== "video" || _0x2d9e1c?.executionManifest?.kind !== "video") {
    return false;
  }
  const _0x4a9681 = _0x1e1b04.videoGenerationParamsByModel && typeof _0x1e1b04.videoGenerationParamsByModel === "object" ? _0x1e1b04.videoGenerationParamsByModel : {};
  const _0x3eac69 = _0x4a9681[_0x6b2dfc] && typeof _0x4a9681[_0x6b2dfc] === "object" ? _0x4a9681[_0x6b2dfc] : {};
  const _0x5141a9 = normalizeStoryVideoGenerationParams(_0x6b2dfc, seedStoryAspectRatioInVideoGenerationParams(_0x6b2dfc, _0x3eac69, _0x1e1b04.data?.project?.aspectRatio), {
    clip: clip
  });
  _0x1e1b04.models = {
    ...(_0x1e1b04.models || {}),
    video: _0x6b2dfc
  };
  _0x1e1b04.videoProvider = normalizeText(_0x2d9e1c.modelManifest.provider);
  _0x1e1b04.videoProviderProfileId = resolveModelProviderProfileId({
    model: _0x6b2dfc,
    providerProfileId: "",
    providerProfileIdByModel: _0x1e1b04.videoProviderProfileIdByModel
  });
  _0x1e1b04.videoGenerationParams = _0x5141a9;
  _0x1e1b04.videoGenerationParamsByModel = {
    ..._0x4a9681,
    [_0x6b2dfc]: {
      ..._0x5141a9
    }
  };
  return true;
}
export function applyStoryPromptModeVideoModelDefault(_0x585f6e = {}, _0x3e247c = "seedance-2.0") {
  const _0x219a8c = resolveStoryPromptModeDefaultVideoModelId(_0x3e247c);
  return applyStoryVideoModelDefault(_0x585f6e, _0x219a8c);
}
export function applyStoryVideoModelDefault(_0x1a2451 = {}, _0xadbfac = "") {
  if (!normalizeText(_0xadbfac)) {
    return false;
  }
  const _0x1032b1 = resolveStoryWorkspaceModelId("video", _0xadbfac);
  if (!_0x1032b1 || _0x1032b1 !== _0xadbfac) {
    return false;
  }
  const _0x453005 = resolveModelExecution(_0x1032b1);
  if (_0x453005?.modelManifest?.kind !== "video" || _0x453005?.executionManifest?.kind !== "video") {
    return false;
  }
  const _0x1e04af = _0x1a2451.videoGenerationParamsByModel && typeof _0x1a2451.videoGenerationParamsByModel === "object" ? _0x1a2451.videoGenerationParamsByModel : {};
  const _0x57c00f = _0x1e04af[_0x1032b1] && typeof _0x1e04af[_0x1032b1] === "object" ? _0x1e04af[_0x1032b1] : {};
  const _0x3c9f8a = applyStoryAspectRatioToVideoGenerationParams(_0x1032b1, normalizeStoryVideoGenerationParams(_0x1032b1, _0x57c00f), _0x1a2451.data?.project?.aspectRatio);
  _0x1a2451.models = {
    ...(_0x1a2451.models || {}),
    video: _0x1032b1
  };
  _0x1a2451.videoProvider = resolveStoryVideoProvider(_0x1032b1);
  _0x1a2451.videoProviderProfileId = resolveModelProviderProfileId({
    model: _0x1032b1,
    providerProfileId: "",
    providerProfileIdByModel: _0x1a2451.videoProviderProfileIdByModel
  });
  _0x1a2451.videoGenerationParams = _0x3c9f8a;
  _0x1a2451.videoGenerationParamsByModel = {
    ..._0x1e04af,
    [_0x1032b1]: {
      ..._0x3c9f8a
    }
  };
  return true;
}
export function applyStoryEpisodeVideoModelDefault(_0x3694ba = {}, _0x2b16d6 = {}) {
  const _0x3c4885 = normalizeText(_0x2b16d6?.videoModelId) || resolveStoryPromptModeDefaultVideoModelId(_0x2b16d6?.promptMode);
  return applyStoryVideoModelDefault(_0x3694ba, _0x3c4885);
}
export function rememberStoryEpisodeVideoModelSelection(_0x2c4839 = {}, _0x5c44e5 = "") {
  if (!_0x2c4839 || typeof _0x2c4839 !== "object" || Array.isArray(_0x2c4839)) {
    return false;
  }
  const _0x448afa = normalizeText(_0x5c44e5);
  if (!_0x448afa || resolveStoryWorkspaceModelId("video", _0x448afa) !== _0x448afa || normalizeText(_0x2c4839.videoModelId) === _0x448afa) {
    return false;
  }
  _0x2c4839.videoModelId = _0x448afa;
  return true;
}
export function resolveStoryClipVideoGenerationSettings(_0x3a0269, _0x47f625 = {}, {
  fallbackModelId = "",
  fallbackProvider = ""
} = {}) {
  const _0x5235fe = _0x47f625.modelSettings || {};
  const _0x21fd71 = _0x5235fe.models?.video || fallbackModelId;
  const _0x56848f = resolveStoryWorkspaceModelId("video", _0x21fd71);
  const _0x8b93a5 = resolveStoryVideoProvider(_0x56848f, _0x5235fe.videoProvider || fallbackProvider);
  const _0x57296a = _0x5235fe.videoGenerationParamsByModel?.[_0x56848f];
  const _0x1a7b69 = _0x5235fe.videoGenerationParams;
  const _0x39c35a = _0x1a7b69 && typeof _0x1a7b69 === "object" && Object.keys(_0x1a7b69).length ? _0x1a7b69 : _0x57296a || {};
  const _0x37f1c5 = resolveStoryClipVideoGenerationParams(_0x3a0269, _0x56848f, seedStoryAspectRatioInVideoGenerationParams(_0x56848f, _0x39c35a, _0x47f625.data?.project?.aspectRatio));
  const _0xd402e1 = resolveModelProviderProfileId({
    model: _0x56848f,
    providerProfileId: _0x5235fe.videoProviderProfileId,
    providerProfileIdByModel: _0x5235fe.videoProviderProfileIdByModel
  });
  return {
    modelId: _0x56848f,
    provider: _0x8b93a5,
    providerProfileId: _0xd402e1,
    generationParams: _0x37f1c5
  };
}