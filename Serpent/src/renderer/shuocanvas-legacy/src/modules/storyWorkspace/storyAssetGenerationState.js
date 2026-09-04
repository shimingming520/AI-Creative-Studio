import { buildStoryAssetAppearanceGenerationTasks, compileStoryAssetReferencePrompt } from "./storyAssetAppearances.js";
import { buildCharacterAssetImageGenerationPayload, normalizeCharacterAssetImageGenerationParams } from "../characterAssets/characterAssetImageGeneration.js";
import { getStoryAssetAppearanceGenerationKey } from "./storyProjectTaskState.js";
function normalizeText(_0x3d06a7) {
  return String(_0x3d06a7 || "").trim();
}
export function buildStoryAssetGenerationPayload({
  asset: _0x3ce5ed,
  modelId = "",
  provider = "",
  generationParams = {},
  referenceImageUrls = [],
  mapReferenceImageToImage2 = false
} = {}) {
  const _0x325ac5 = buildCharacterAssetImageGenerationPayload({
    prompt: mapReferenceImageToImage2 ? compileStoryAssetReferencePrompt(_0x3ce5ed?.prompt) : _0x3ce5ed?.prompt,
    modelId: modelId,
    provider: provider,
    generationParams: generationParams,
    referenceImageUrls: referenceImageUrls
  });
  if (mapReferenceImageToImage2) {
    _0x325ac5.inputUrls = (Array.isArray(referenceImageUrls) ? referenceImageUrls : []).map(normalizeText).filter(Boolean);
  }
  return _0x325ac5;
}
export function normalizeStoryImageGenerationParams(_0x5cbb12, _0x2ec23c = {}) {
  return normalizeCharacterAssetImageGenerationParams(_0x5cbb12, _0x2ec23c);
}
export function isStoryAssetBatchLoading(_0x5bacde, _0x33ac16) {
  return _0x5bacde?.isBatchGenerating === true && Array.isArray(_0x5bacde?.batchGeneratingAssetIds) && _0x5bacde.batchGeneratingAssetIds.includes(_0x33ac16);
}
export function setStoryAssetAppearanceGenerating(_0x106e1f, _0x441d50, _0x284523, _0x5c5147 = true) {
  if (!_0x106e1f || typeof _0x106e1f !== "object") {
    return false;
  }
  const _0x36e848 = getStoryAssetAppearanceGenerationKey(_0x441d50, _0x284523);
  if (!_0x36e848) {
    return false;
  }
  const _0x4e9103 = Array.isArray(_0x106e1f.generatingAppearanceKeys) ? _0x106e1f.generatingAppearanceKeys : [];
  const _0x37c162 = _0x5c5147 ? [...new Set([..._0x4e9103, _0x36e848])] : _0x4e9103.filter(_0x447038 => _0x447038 !== _0x36e848);
  _0x106e1f.generatingAppearanceKeys = _0x37c162;
  return _0x37c162.length !== _0x4e9103.length;
}
export function setStoryAssetVoiceGenerating(_0x61923e, _0x206925, _0x31b56a = true) {
  if (!_0x61923e || typeof _0x61923e !== "object") {
    return false;
  }
  const _0x5a2df7 = normalizeText(_0x206925);
  if (!_0x5a2df7) {
    return false;
  }
  const _0x3cf7bc = Array.isArray(_0x61923e.generatingVoiceAssetIds) ? _0x61923e.generatingVoiceAssetIds : [];
  const _0xde9971 = _0x31b56a ? [...new Set([..._0x3cf7bc, _0x5a2df7])] : _0x3cf7bc.filter(_0x57ea5b => normalizeText(_0x57ea5b) !== _0x5a2df7);
  _0x61923e.generatingVoiceAssetIds = _0xde9971;
  return _0xde9971.length !== _0x3cf7bc.length;
}
export function isStoryAssetVoiceLoading(_0x412757, _0x105cf7) {
  const _0xf56bd1 = normalizeText(_0x105cf7);
  if (!_0xf56bd1) {
    return false;
  }
  return Array.isArray(_0x412757?.generatingVoiceAssetIds) && _0x412757.generatingVoiceAssetIds.some(_0x1df270 => normalizeText(_0x1df270) === _0xf56bd1) || _0x412757?.isBatchGenerating === true && Array.isArray(_0x412757?.batchGeneratingVoiceAssetIds) && _0x412757.batchGeneratingVoiceAssetIds.some(_0x3fb966 => normalizeText(_0x3fb966) === _0xf56bd1);
}
export function isStoryAssetCardLoading(_0x1a5ccd, _0x29c3c1) {
  const _0x1b91cc = normalizeText(_0x29c3c1) + ":";
  return isStoryAssetBatchLoading(_0x1a5ccd, _0x29c3c1) || _0x1b91cc !== ":" && Array.isArray(_0x1a5ccd?.generatingAppearanceKeys) && _0x1a5ccd.generatingAppearanceKeys.some(_0xd9683c => normalizeText(_0xd9683c).startsWith(_0x1b91cc));
}
export function isStoryAssetAppearanceLoading(_0x163d7f, _0x2b1c7b, _0x1380b6) {
  const _0x5aaeb3 = getStoryAssetAppearanceGenerationKey(_0x2b1c7b, _0x1380b6);
  if (!_0x5aaeb3) {
    return false;
  }
  return Array.isArray(_0x163d7f?.generatingAppearanceKeys) && _0x163d7f.generatingAppearanceKeys.includes(_0x5aaeb3) || _0x163d7f?.isBatchGenerating === true && Array.isArray(_0x163d7f?.batchGeneratingAppearanceKeys) && _0x163d7f.batchGeneratingAppearanceKeys.includes(_0x5aaeb3);
}
export function getStoryAssetGenerationControlState(_0x5e5944, _0x558d4c, _0x2ea3d0) {
  const _0x667b82 = isStoryAssetAppearanceLoading(_0x5e5944, _0x558d4c, _0x2ea3d0);
  const _0x1aa485 = normalizeText(_0x5e5944?.assetGenerateLabel);
  const _0x1d8bf7 = _0x1aa485 === "生成资产图" ? "生成素材图" : _0x1aa485 || "生成素材图";
  return {
    isGenerating: _0x667b82,
    disabled: _0x667b82,
    label: _0x667b82 ? "生成中" : _0x1d8bf7
  };
}
export function settleStoryAssetBatchLoading(_0x380ac7, _0x8ddfb4, _0x3f96ea = [], {
  failed = false
} = {}) {
  const _0x4517f2 = normalizeText(_0x8ddfb4?.id);
  if (!_0x4517f2 || !Array.isArray(_0x380ac7?.batchGeneratingAssetIds)) {
    return false;
  }
  const _0x3e13f7 = _0x3f96ea.some(_0x50db72 => normalizeText(_0x50db72?.asset?.id) === _0x4517f2);
  if (!failed && _0x3e13f7) {
    return false;
  }
  _0x380ac7.batchGeneratingAssetIds = _0x380ac7.batchGeneratingAssetIds.filter(_0x5ed42b => normalizeText(_0x5ed42b) !== _0x4517f2);
  return true;
}
export function normalizeStoryAssetBatchGenerationMode(_0x368583) {
  const _0x41bcf0 = normalizeText(_0x368583).toLowerCase();
  if (["image", "voice", "all"].includes(_0x41bcf0)) {
    return _0x41bcf0;
  } else {
    return "all";
  }
}
export function buildStoryAssetBatchCancellationUpdate(_0xba277a = {}, _0x5b8c7e = {}) {
  const _0x283e1b = _0x5a2a36 => [...new Set((Array.isArray(_0x5a2a36) ? _0x5a2a36 : []).map(normalizeText).filter(Boolean))];
  const _0x1bdfba = _0x283e1b(_0x5b8c7e.appearanceKeys);
  const _0x52b4e3 = _0x283e1b(_0x5b8c7e.voiceAssetIds);
  const _0x56c732 = _0x283e1b(_0x5b8c7e.assetIds);
  const _0x2a1168 = new Set(_0x1bdfba);
  const _0xe30ff2 = new Set(_0x52b4e3);
  const _0x4bb09c = _0x283e1b(_0xba277a.pendingAppearanceKeys).filter(_0x2e6779 => !_0x2a1168.has(_0x2e6779));
  const _0x9f9d55 = _0x283e1b(_0xba277a.pendingVoiceAssetIds).filter(_0x565ed9 => !_0xe30ff2.has(_0x565ed9));
  const _0x42002c = _0x4bb09c.length + _0x9f9d55.length;
  const _0x3fa620 = _0x1bdfba.length + _0x52b4e3.length;
  return {
    canCancel: _0x42002c > 0,
    cancelledCount: _0x42002c,
    runningCount: _0x3fa620,
    cancelledAppearanceKeys: _0x4bb09c,
    cancelledVoiceAssetIds: _0x9f9d55,
    pendingAssetIds: _0x56c732,
    pendingAppearanceKeys: _0x1bdfba,
    pendingVoiceAssetIds: _0x52b4e3,
    label: _0x3fa620 ? "已取消后续生成 · 正在完成 " + _0x3fa620 + " 项" : "已取消后续生成"
  };
}
export function buildStoryAssetBatchGenerationPlan(_0x1d92d0 = [], _0x44094e = "all") {
  const _0x37356b = normalizeStoryAssetBatchGenerationMode(_0x44094e);
  const _0xb31ca2 = (Array.isArray(_0x1d92d0) ? _0x1d92d0 : []).filter(_0x4b330e => _0x4b330e && !_0x4b330e.isLibraryAsset);
  const _0x4eeb5a = _0x37356b === "voice" ? [] : buildStoryAssetAppearanceGenerationTasks(_0xb31ca2, {
    includeExisting: true
  });
  const _0x5f51dc = _0x37356b === "image" ? [] : _0xb31ca2.filter(_0x1a5466 => _0x1a5466.kind === "character");
  return {
    mode: _0x37356b,
    imageTasks: _0x4eeb5a,
    voiceAssets: _0x5f51dc,
    totalTasks: _0x4eeb5a.length + _0x5f51dc.length
  };
}
export async function runStoryAssetBatchGenerationPhases(_0x4721db = null, _0x4023ac = null) {
  return Promise.all([typeof _0x4721db === "function" ? _0x4721db() : undefined, typeof _0x4023ac === "function" ? _0x4023ac() : undefined]);
}