function normalizeText(_0x3b2cde) {
  return String(_0x3b2cde ?? "").trim();
}
const GENERIC_AUDIO_ITEM_NAMES = new Set(["人声", "声音", "音频", "源音频", "生成音频", "AI音频", "AI 音频"]);
function normalizeItemIndex(_0x13d989) {
  return Math.max(0, Math.trunc(Number(_0x13d989) || 0));
}
function getLibrarySourceKey(_0x15065d = {}) {
  const _0x4d5ce7 = normalizeText(_0x15065d.sourceAssetId || _0x15065d.assetId);
  if (!_0x4d5ce7) {
    return "";
  }
  return _0x4d5ce7 + ":" + normalizeItemIndex(_0x15065d.sourceItemIndex ?? _0x15065d.itemIndex);
}
export function getPersonReplacementLibraryAudioRef(_0x1b25ed = {}) {
  return normalizeText(_0x1b25ed.audioUrl || _0x1b25ed.sourceUrl || _0x1b25ed.url);
}
export function getPersonReplacementAudioSavedName(_0x220e1e = {}) {
  const _0x31e7be = normalizeText(_0x220e1e.savedName);
  if (_0x31e7be) {
    return _0x31e7be;
  }
  const _0x26ea11 = normalizeText(_0x220e1e.name);
  const _0x5e50ef = normalizeText(_0x220e1e.assetName);
  if (_0x5e50ef && (!_0x26ea11 || GENERIC_AUDIO_ITEM_NAMES.has(_0x26ea11))) {
    return _0x5e50ef;
  }
  return _0x26ea11 || _0x5e50ef || "未命名音频";
}
export function getPersonReplacementProjectAudioAssets(_0x5abdf2 = {}) {
  return (Array.isArray(_0x5abdf2.audioAssets) ? _0x5abdf2.audioAssets : []).filter(_0x90eb0b => normalizeText(_0x90eb0b?.mediaKind || _0x90eb0b?.type).toLowerCase() === "audio");
}
export function getPersonReplacementVoiceLibraryBoundCharacters(_0x1b4a4e = {}, _0x116971 = {}) {
  const _0x23aa2d = normalizeText(_0x116971.id);
  const _0x1b866a = getLibrarySourceKey(_0x116971);
  return (Array.isArray(_0x1b4a4e.characters) ? _0x1b4a4e.characters : []).filter(_0x46dc88 => {
    const _0x5ccd27 = _0x46dc88?.voiceReference;
    if (!_0x5ccd27 || normalizeText(_0x5ccd27.source).toLowerCase() !== "library") {
      return false;
    }
    if (_0x23aa2d && normalizeText(_0x5ccd27.libraryAssetId) === _0x23aa2d) {
      return true;
    }
    return Boolean(_0x1b866a && getLibrarySourceKey(_0x5ccd27) === _0x1b866a);
  });
}
export function buildPersonReplacementLibraryVoiceReference(_0x5ac696 = {}, {
  audioUrl = getPersonReplacementLibraryAudioRef(_0x5ac696),
  localPath = "",
  updatedAt = Date.now()
} = {}) {
  const _0x9ce4f = normalizeText(audioUrl);
  if (!_0x9ce4f) {
    throw new Error("所选音频缺少可用地址。");
  }
  return {
    audioUrl: _0x9ce4f,
    localPath: normalizeText(localPath),
    fileName: getPersonReplacementAudioSavedName(_0x5ac696),
    source: "library",
    libraryAssetId: normalizeText(_0x5ac696.id),
    sourceAssetId: normalizeText(_0x5ac696.sourceAssetId || _0x5ac696.assetId),
    sourceItemIndex: normalizeItemIndex(_0x5ac696.sourceItemIndex ?? _0x5ac696.itemIndex),
    updatedAt: updatedAt
  };
}