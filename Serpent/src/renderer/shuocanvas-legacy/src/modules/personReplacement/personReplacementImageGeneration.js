import { isAdaptiveRatioLabel, pickClosestRatioForProviderModel, resolveAdaptiveSourceSize } from "../../../api/imageRatioPolicy.js";
import { resolveModelProvider } from "../../manifests/index.js";
import { normalizeCharacterAssetImageGenerationParams } from "../characterAssets/characterAssetImageGeneration.js";
import { applyWorkspaceCharacterAssetPromptPreset, WORKSPACE_CHARACTER_ASSET_PROMPT_PRESETS } from "../workspaceAssetPromptPresets.js";
import { getPersonReplacementImageResults, resolvePersonReplacementImageSourceRef, resolvePersonReplacementImageResultRef } from "./personReplacementProject.js";
import { buildPersonReplacementPromptPackage } from "./personReplacementPromptCompiler.js";
import { resolvePersonReplacementPromptMentionRef } from "./personReplacementPromptMentions.js";
import { resolvePromptTextWithTextRefs, sanitizePromptHtmlForCommit } from "../nodePromptShared.js";
import { getRecoverablePersonReplacementGenerationTask, isPersonReplacementGenerationTaskActive, normalizePersonReplacementGenerationTaskIdentity } from "./personReplacementGenerationTaskIdentity.js";
export const PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS = Object.freeze(WORKSPACE_CHARACTER_ASSET_PROMPT_PRESETS.filter(_0x5178a8 => ["character-three-view", "character-three-view-face"].includes(_0x5178a8.id)));
const PERSON_REPLACEMENT_DEFAULT_ASSET_PROMPT_PRESET_ID = PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS[0]?.id || "character-three-view";
const PERSON_REPLACEMENT_IMAGE_GENERATION_STATUSES = new Set(["idle", "queued", "submitting", "running", "succeeded", "failed"]);
function normalizeText(_0xf56d6) {
  return String(_0xf56d6 ?? "").trim();
}
function getPositiveSize(_0x3408be = {}) {
  const _0x73cb93 = Number(_0x3408be?.width);
  const _0x2a61e3 = Number(_0x3408be?.height);
  if (Number.isFinite(_0x73cb93) && _0x73cb93 > 0 && Number.isFinite(_0x2a61e3) && _0x2a61e3 > 0) {
    return {
      width: _0x73cb93,
      height: _0x2a61e3
    };
  } else {
    return null;
  }
}
function stableSerialize(_0x31dee3) {
  if (_0x31dee3 === null || typeof _0x31dee3 !== "object") {
    return JSON.stringify(_0x31dee3);
  }
  if (Array.isArray(_0x31dee3)) {
    return "[" + _0x31dee3.map(_0x10a10d => stableSerialize(_0x10a10d)).join(",") + "]";
  }
  return "{" + Object.keys(_0x31dee3).filter(_0xcbf50f => _0x31dee3[_0xcbf50f] !== undefined).sort().map(_0x14f35d => JSON.stringify(_0x14f35d) + ":" + stableSerialize(_0x31dee3[_0x14f35d])).join(",") + "}";
}
export function createPersonReplacementImagePromptRequestResolver({
  documentObject = null
} = {}) {
  return ({
    project = {},
    shot = {},
    promptPackage = {}
  } = {}) => {
    const _0x196849 = normalizeText(shot.imagePrompt);
    const _0x488561 = _0x196849 ? (documentObject || globalThis.document)?.createElement?.("div") : null;
    const _0x491a37 = [];
    let _0x1d540c = _0x196849;
    if (_0x488561) {
      _0x488561.innerHTML = sanitizePromptHtmlForCommit(_0x196849);
      _0x1d540c = resolvePromptTextWithTextRefs({
        promptEl: _0x488561,
        assetInputRefs: _0x491a37,
        assetMediaCounts: {
          image: promptPackage.referenceImages?.length || 0,
          video: 0,
          audio: 0
        },
        allowedAssetTypes: ["image"],
        resolveAssetMentionRef: _0x54ccb4 => resolvePersonReplacementPromptMentionRef(_0x54ccb4, {
          project: project,
          promptPackage: promptPackage,
          shot: shot
        }),
        dedupeAssetMentions: true
      }) || _0x1d540c;
    }
    return {
      savedPrompt: _0x196849,
      requestPrompt: _0x196849 ? [promptPackage.guidedBindingPrompt, "用户要求：\n" + _0x1d540c].filter(Boolean).join("\n\n") : promptPackage.prompt,
      promptAssetRefs: _0x491a37
    };
  };
}
export function createPersonReplacementImageGenerationMappingRevision({
  project = {},
  shot = {}
} = {}) {
  const _0x18f2d4 = buildPersonReplacementPromptPackage({
    project: project,
    shot: shot
  });
  return stableSerialize({
    shot: {
      id: normalizeText(shot.id),
      keyframeRef: normalizeText(shot.keyframeRef),
      imageSourceRef: resolvePersonReplacementImageSourceRef(shot),
      frame: shot.frame,
      sceneReference: shot.sceneReference,
      people: (Array.isArray(shot.people) ? shot.people : []).map(_0x420d26 => ({
        id: normalizeText(_0x420d26.id),
        sourceCharacterId: normalizeText(_0x420d26.sourceCharacterId),
        targetCharacterId: normalizeText(_0x420d26.targetCharacterId),
        targetAppearanceId: normalizeText(_0x420d26.targetAppearanceId),
        label: normalizeText(_0x420d26.label),
        replacementScope: normalizeText(_0x420d26.replacementScope),
        bbox: _0x420d26.locator?.bbox || _0x420d26.bbox
      }))
    },
    prompt: {
      bindingPrompt: _0x18f2d4.bindingPrompt,
      references: _0x18f2d4.referenceImages.map(_0x53ff67 => ({
        role: normalizeText(_0x53ff67.role),
        ref: normalizeText(_0x53ff67.ref),
        targetCharacterId: normalizeText(_0x53ff67.targetCharacterId),
        targetAppearanceId: normalizeText(_0x53ff67.targetAppearanceId),
        targetSceneId: normalizeText(_0x53ff67.targetSceneId),
        targetSceneAppearanceId: normalizeText(_0x53ff67.targetSceneAppearanceId)
      })),
      unmappedPersonIds: _0x18f2d4.unmappedPersonIds,
      missingLocatorPersonIds: _0x18f2d4.missingLocatorPersonIds,
      unresolvedOrientationPersonIds: _0x18f2d4.unresolvedOrientationPersonIds,
      overflowPersonIds: _0x18f2d4.overflowPersonIds
    }
  });
}
export function createPersonReplacementImageGenerationRequestRevision({
  project = {},
  shot = {},
  payload = {},
  sourceImageSize = {}
} = {}) {
  return stableSerialize({
    mappingRevision: createPersonReplacementImageGenerationMappingRevision({
      project: project,
      shot: shot
    }),
    payload: payload,
    sourceImageSize: getPositiveSize(sourceImageSize)
  });
}
export function appendPersonReplacementImageResult(_0x2af02d = {}, _0x25ae5c = {}) {
  const _0x27064d = getPersonReplacementImageResults(_0x2af02d);
  const _0x13c529 = resolvePersonReplacementImageResultRef(_0x25ae5c);
  const _0xf8f510 = _0x27064d.findIndex(_0x5b2f43 => resolvePersonReplacementImageResultRef(_0x5b2f43) === _0x13c529);
  if (_0xf8f510 >= 0) {
    return {
      results: _0x27064d,
      activeIndex: _0xf8f510
    };
  }
  return {
    results: [..._0x27064d, {
      ..._0x25ae5c
    }],
    activeIndex: _0x27064d.length
  };
}
export function normalizePersonReplacementAssetPromptPresetId(_0x1affd8 = "") {
  const _0x219302 = PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS.find(_0x9ae306 => _0x9ae306.id === normalizeText(_0x1affd8));
  return _0x219302?.id || PERSON_REPLACEMENT_DEFAULT_ASSET_PROMPT_PRESET_ID;
}
export function applyPersonReplacementCharacterAssetPromptPreset(_0x111136 = "", _0x29c6ed = "") {
  const _0x38be31 = normalizeText(_0x29c6ed);
  const _0x506e8d = normalizeText(_0x111136);
  if (!PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS.some(_0x2033c0 => _0x2033c0.id === _0x506e8d)) {
    return _0x38be31;
  }
  return applyWorkspaceCharacterAssetPromptPreset(_0x506e8d, _0x38be31, {
    hasImageInput: true
  });
}
export function resolveGeneratedPersonReplacementAppearanceName(_0x5c66a0 = "", _0xc23407 = 1) {
  const _0x3e5b1d = PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS.find(_0x4c8d36 => _0x4c8d36.id === normalizeText(_0x5c66a0));
  return normalizeText(_0x3e5b1d?.label) || "形象 " + Math.max(1, Number(_0xc23407) || 1);
}
export function normalizePersonReplacementImageGenerationState(_0x3436b1 = {}, _0x30f4c2 = "") {
  const _0x7cdc9f = _0x3436b1 && typeof _0x3436b1 === "object" && !Array.isArray(_0x3436b1) ? _0x3436b1 : {};
  const _0x2d6b98 = normalizeText(_0x7cdc9f.status).toLowerCase();
  const _0x592adf = normalizeText(_0x7cdc9f.requestId);
  const _0x2b33b9 = normalizePersonReplacementGenerationTaskIdentity(_0x7cdc9f);
  return {
    status: PERSON_REPLACEMENT_IMAGE_GENERATION_STATUSES.has(_0x2d6b98) ? _0x2d6b98 : "idle",
    shotId: normalizeText(_0x7cdc9f.shotId) || normalizeText(_0x30f4c2),
    error: normalizeText(_0x7cdc9f.error),
    ...(_0x592adf ? {
      requestId: _0x592adf
    } : {}),
    ..._0x2b33b9
  };
}
export function getRecoverablePersonReplacementImageTask(_0x348b5b = {}) {
  return getRecoverablePersonReplacementGenerationTask(normalizePersonReplacementImageGenerationState(_0x348b5b));
}
export function normalizePersonReplacementImageGenerationsByShotId(_0x17011f = {}, _0x1c40d5 = [], _0x39fa69 = {}) {
  const _0x3a86ec = new Set((Array.isArray(_0x1c40d5) ? _0x1c40d5 : []).map(_0x46c294 => normalizeText(_0x46c294?.id)).filter(Boolean));
  const _0x5e8b16 = _0x17011f && typeof _0x17011f === "object" && !Array.isArray(_0x17011f) ? _0x17011f : {};
  const _0x37bcdc = Object.fromEntries(Object.entries(_0x5e8b16).flatMap(([_0x2d797f, _0x124c2d]) => {
    const _0x264ec6 = normalizeText(_0x2d797f);
    if (!_0x3a86ec.has(_0x264ec6)) {
      return [];
    }
    return [[_0x264ec6, normalizePersonReplacementImageGenerationState(_0x124c2d, _0x264ec6)]];
  }));
  const _0x4c92d0 = normalizePersonReplacementImageGenerationState(_0x39fa69);
  if (_0x3a86ec.has(_0x4c92d0.shotId) && !_0x37bcdc[_0x4c92d0.shotId]) {
    _0x37bcdc[_0x4c92d0.shotId] = _0x4c92d0;
  }
  return _0x37bcdc;
}
export function resolvePersonReplacementImageGenerationState(_0x323875 = {}, _0x4c1c10 = "") {
  const _0x5924c9 = normalizeText(_0x4c1c10);
  const _0xfe658e = _0x323875?.imageGenerationsByShotId?.[_0x5924c9];
  if (_0xfe658e && typeof _0xfe658e === "object") {
    return normalizePersonReplacementImageGenerationState(_0xfe658e, _0x5924c9);
  }
  const _0x134d4d = normalizePersonReplacementImageGenerationState(_0x323875?.imageGeneration);
  if (_0x134d4d.shotId === _0x5924c9) {
    return _0x134d4d;
  } else {
    return normalizePersonReplacementImageGenerationState({}, _0x5924c9);
  }
}
export function updatePersonReplacementImageGenerationState(_0x2860f5 = {}, _0x171692 = {}) {
  const _0x39dd7b = normalizePersonReplacementImageGenerationState(_0x171692);
  if (!_0x39dd7b.shotId) {
    return {
      ..._0x2860f5
    };
  }
  const _0x24997a = {
    ...(_0x2860f5?.imageGenerationsByShotId && typeof _0x2860f5.imageGenerationsByShotId === "object" && !Array.isArray(_0x2860f5.imageGenerationsByShotId) ? _0x2860f5.imageGenerationsByShotId : {}),
    [_0x39dd7b.shotId]: _0x39dd7b
  };
  const _0x59e758 = normalizePersonReplacementImageGenerationState(_0x2860f5?.imageGeneration);
  const _0x3eca6f = isPersonReplacementGenerationTaskActive(_0x59e758) && isPersonReplacementGenerationTaskActive(_0x24997a[_0x59e758.shotId]) ? _0x24997a[_0x59e758.shotId] : null;
  const _0x14db50 = Object.values(_0x24997a).find(isPersonReplacementGenerationTaskActive);
  const _0x47e9a2 = isPersonReplacementGenerationTaskActive(_0x39dd7b) ? _0x39dd7b : _0x3eca6f || _0x14db50 || _0x39dd7b;
  return {
    ..._0x2860f5,
    imageGeneration: _0x47e9a2,
    imageGenerationsByShotId: _0x24997a
  };
}
function createImageGenerationUiRevision(_0x46e819 = {}, _0x3af288 = "") {
  const _0x5540f0 = normalizeText(_0x3af288);
  const _0x3da011 = (Array.isArray(_0x46e819?.shots) ? _0x46e819.shots : []).find(_0x44991f => normalizeText(_0x44991f?.id) === _0x5540f0);
  return JSON.stringify({
    shotId: _0x5540f0,
    replacementImageRef: normalizeText(_0x3da011?.replacementImageRef),
    replacementImage: _0x3da011?.replacementImage || null,
    error: normalizeText(_0x3da011?.error),
    generation: resolvePersonReplacementImageGenerationState(_0x46e819?.workspace, _0x5540f0)
  });
}
function createImageGenerationTimelineRevision(_0x4c5d23 = {}) {
  return JSON.stringify((Array.isArray(_0x4c5d23?.shots) ? _0x4c5d23.shots : []).map(_0x1ae4c9 => createImageGenerationUiRevision(_0x4c5d23, _0x1ae4c9?.id)));
}
export function resolvePersonReplacementImageGenerationUiRefreshScope(_0x1c5869 = {}, _0x3a5621 = {}) {
  const _0x170f7a = normalizeText(_0x3a5621?.workspace?.selectedShotId);
  if (createImageGenerationUiRevision(_0x1c5869, _0x170f7a) !== createImageGenerationUiRevision(_0x3a5621, _0x170f7a)) {
    return "selected-shot";
  }
  if (createImageGenerationTimelineRevision(_0x1c5869) !== createImageGenerationTimelineRevision(_0x3a5621)) {
    return "timeline";
  } else {
    return "";
  }
}
export function resolvePersonReplacementImageGenerationParams({
  modelId = "",
  provider = "",
  generationParams = {},
  sourceImageSize = {},
  shot = {}
} = {}) {
  const _0x1fbf79 = normalizeText(modelId);
  const _0x278399 = resolveModelProvider(_0x1fbf79, provider);
  const _0x4351d3 = normalizeCharacterAssetImageGenerationParams(_0x1fbf79, generationParams);
  const _0x4255d2 = _0x4351d3.aspectRatio;
  if (!isAdaptiveRatioLabel(_0x4255d2)) {
    return {
      provider: _0x278399,
      generationParams: _0x4351d3,
      requestedAspectRatio: _0x4255d2,
      resolvedAspectRatio: _0x4255d2,
      adaptiveSource: "explicit"
    };
  }
  const _0x544f23 = getPositiveSize(sourceImageSize) || getPositiveSize(shot?.frame) || {
    width: 0,
    height: 0
  };
  const _0x50c4be = resolveAdaptiveSourceSize({
    inputWidth: _0x544f23.width,
    inputHeight: _0x544f23.height
  });
  const _0x3650ba = pickClosestRatioForProviderModel({
    provider: _0x278399,
    model: _0x1fbf79,
    width: _0x50c4be.width,
    height: _0x50c4be.height,
    imageSize: _0x4351d3.imageSize
  });
  return {
    provider: _0x278399,
    generationParams: {
      ..._0x4351d3,
      aspectRatio: _0x3650ba
    },
    requestedAspectRatio: _0x4255d2,
    resolvedAspectRatio: _0x3650ba,
    adaptiveSource: _0x50c4be.source
  };
}