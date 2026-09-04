function normalizeText(_0x2682c8) {
  return String(_0x2682c8 ?? "").trim();
}
export const STORY_HOME_REWRITE_SOURCE_HINT = "参考剧本会原样保留；AI 将按要求生成新的故事蓝图与世界观。";
export function hasStoryHomeReferenceScript(_0xe719cf = {}) {
  return Boolean(normalizeText(_0xe719cf.scriptFileName) && normalizeText(_0xe719cf.scriptText));
}
export function canStartStoryHomeGeneration(_0x446baa = {}) {
  if (_0x446baa.homeTab === "replication") {
    return Boolean(_0x446baa.replicationSourceFiles?.length);
  }
  if (_0x446baa.isParsingDocument) {
    return false;
  }
  if (_0x446baa.homeTab === "upload") {
    return Boolean(normalizeText(_0x446baa.scriptFileName));
  }
  const _0x1025c8 = Boolean(normalizeText(_0x446baa.scriptFileName));
  return Boolean(normalizeText(_0x446baa.idea)) && (!_0x1025c8 || hasStoryHomeReferenceScript(_0x446baa));
}
export function resolveStoryHomeGenerationMode(_0x5b0d0e = {}) {
  if (_0x5b0d0e.homeTab === "generate" && hasStoryHomeReferenceScript(_0x5b0d0e)) {
    return "rewrite";
  } else {
    return _0x5b0d0e.homeTab;
  }
}
export function clearStoryHomeReferenceScript(_0x35c990 = {}) {
  _0x35c990.scriptFileName = "";
  _0x35c990.scriptText = "";
  _0x35c990.scriptCharacterCount = null;
  if (_0x35c990.hasCreatedProject !== true && _0x35c990.data?.project) {
    _0x35c990.data.project.sourceDocument = null;
  }
}
export function getStoryHomeSummaryTaskCopy(_0x43cc40 = "generate") {
  if (_0x43cc40 === "rewrite") {
    return {
      label: "改写剧本蓝图",
      message: "正在根据参考剧本和改写要求生成故事蓝图",
      status: "正在根据参考剧本和改写要求生成故事蓝图..."
    };
  }
  return {
    label: "生成剧本摘要",
    message: "正在根据原始创意生成剧本摘要",
    status: "正在根据原始创意生成剧本摘要..."
  };
}
function getStoryHomeDocumentDropZone(_0x3f948c) {
  return _0x3f948c?.closest?.("[data-story-rewrite-drop], [data-story-script-drop]") || null;
}
export function handleStoryHomeDocumentDragOver(_0x4d6b50) {
  const _0x3d74f5 = getStoryHomeDocumentDropZone(_0x4d6b50?.target);
  if (!_0x3d74f5) {
    return false;
  }
  _0x4d6b50.preventDefault?.();
  _0x4d6b50.stopPropagation?.();
  if (_0x4d6b50.dataTransfer) {
    _0x4d6b50.dataTransfer.dropEffect = "copy";
  }
  _0x3d74f5.classList?.add?.("is-dragover");
  return true;
}
export function handleStoryHomeDocumentDragLeave(_0x46144b) {
  const _0x17e948 = getStoryHomeDocumentDropZone(_0x46144b?.target);
  if (!_0x17e948 || _0x17e948.contains?.(_0x46144b.relatedTarget)) {
    return false;
  }
  _0x17e948.classList?.remove?.("is-dragover");
  return true;
}
export async function handleStoryHomeDocumentDrop(_0x1e3ecc, _0x2257bb) {
  const _0x4154ea = getStoryHomeDocumentDropZone(_0x1e3ecc?.target);
  if (!_0x4154ea) {
    return false;
  }
  _0x1e3ecc.preventDefault?.();
  _0x1e3ecc.stopPropagation?.();
  _0x4154ea.classList?.remove?.("is-dragover");
  const _0x320246 = _0x1e3ecc.dataTransfer?.files?.[0];
  if (_0x320246 && typeof _0x2257bb === "function") {
    await _0x2257bb(_0x320246);
  }
  return true;
}