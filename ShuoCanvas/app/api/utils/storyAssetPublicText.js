function normalizeText(_0x2558a6) {
  if (typeof _0x2558a6 === "string") {
    return _0x2558a6.trim();
  } else {
    return "";
  }
}
const STORY_ASSET_FALLBACK_DIAGNOSTIC_PATTERN = /模型细化结果不完整，已使用剧本证据建立基础可生成设定。[。]?/gu;
const STORY_ASSET_CLIENT_INSTRUCTION_PATTERN = /(?:背景由客户端统一添加|由客户端统一添加背景|客户端(?:会|将)?统一添加背景)[。.!！]?/gu;
const STORY_ASSET_INTERNAL_EVIDENCE_PATTERN = /(?:PP-UIE(?:\s+(?:local\s+candidate|candidate|evidence))?|candidateAssets(?:\s+internal\s+clue)?|本地候选|候选资产|召回候选|召回线索|证据原文)\s*[：:]?[^。\r\n；;]*/giu;
export function stripStoryAssetInternalEvidenceMetadata(_0x410b47) {
  return normalizeText(_0x410b47).replace(/PP-UIE\s*本地候选：[^\r\n]*(?:\r?\n\s*证据原文：)?/giu, "").replace(/证据原文：/gu, "").replace(STORY_ASSET_INTERNAL_EVIDENCE_PATTERN, "").replace(STORY_ASSET_FALLBACK_DIAGNOSTIC_PATTERN, "").replace(/[ \t]+\n/gu, "\n").replace(/\n{3,}/gu, "\n\n").trim();
}
export function sanitizeStoryAssetPublicDescriptionText(_0x3c1d18) {
  return stripStoryAssetInternalEvidenceMetadata(_0x3c1d18).replace(STORY_ASSET_INTERNAL_EVIDENCE_PATTERN, "").replace(/(^|[\r\n])(?:剧本事实|视觉补全)：\s*(?=$|[\r\n])/gu, "$1").replace(/\n{3,}/gu, "\n\n").trim();
}
export function sanitizeStoryAssetPublicPromptText(_0x19d6c7) {
  return normalizeText(_0x19d6c7).replace(STORY_ASSET_INTERNAL_EVIDENCE_PATTERN, "").replace(/PP-UIE\s*本地候选：[^\r\n]*/giu, "").replace(/(?:^|[\r\n])\s*(?:candidateAssets|候选资产|召回候选|召回线索)\s*[：:][^\r\n]*/giu, "\n").replace(/(?:^|[\r\n])\s*证据原文：[^\r\n]*/gu, "\n").replace(/证据原文：[^\r\n]*/gu, "").replace(STORY_ASSET_FALLBACK_DIAGNOSTIC_PATTERN, "").replace(STORY_ASSET_CLIENT_INSTRUCTION_PATTERN, "").replace(/(^|[\r\n，；])(?:剧本事实|视觉补全)：\s*/gu, "$1").replace(/[，；]\s*([，；。])/gu, "$1").replace(/[，,；;]\s*([。.!！]|$)/gu, "$1").replace(/[ \t]+\n/gu, "\n").replace(/\n{2,}/gu, "\n").trim();
}