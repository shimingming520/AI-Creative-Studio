import { discardStaleStoryEpisodeSplitTransportDraft, ensureUniqueStoryEpisodeClipIds, normalizeStoryAssetDisplayName, normalizeStoryCharacterRole, syncStoryEpisodeClipDialogueMentions } from "./storyPlanningData.js";
import { normalizeStoryClipFrames } from "./storyClipFrames.js";
import { sanitizeStoryAssetPublicDescriptionText, sanitizeStoryAssetPublicPromptText, stripStoryAssetInternalEvidenceMetadata } from "../../../api/utils/storyAssetPublicText.js";
import { getWorkspaceAssetAppearance, getWorkspaceAssetAppearances, getWorkspaceAssetAppearanceStats, getWorkspaceAssetBaseAppearance } from "../workspaceAssetAppearance.js";
function normalizeText(_0x3bf074) {
  return String(_0x3bf074 || "").trim();
}
export const STORY_ASSET_STYLE_REFERENCE_MENTION = "@风格参考";
export const STORY_ASSET_REFERENCE_PROMPT_SUFFIX = "参考" + STORY_ASSET_STYLE_REFERENCE_MENTION + "的图片风格生成形象";
export function appendStoryAssetReferencePrompt(_0x2c6fe2 = "") {
  const _0x5dcb19 = normalizeText(_0x2c6fe2);
  const _0x2641eb = normalizeText(_0x5dcb19.split(STORY_ASSET_REFERENCE_PROMPT_SUFFIX).join(""));
  return [_0x2641eb, STORY_ASSET_REFERENCE_PROMPT_SUFFIX].filter(Boolean).join("\n");
}
export function compileStoryAssetReferencePrompt(_0x5686bc = "") {
  return normalizeText(_0x5686bc).split(STORY_ASSET_STYLE_REFERENCE_MENTION).join("@图片2");
}
export function setStoryAssetAppearanceReferenceImage(_0x4fe61d = null, _0x574b28 = "") {
  const _0x215f3f = normalizeText(_0x574b28);
  if (!_0x4fe61d || typeof _0x4fe61d !== "object" || !_0x215f3f) {
    return false;
  }
  _0x4fe61d.referenceImageUrl = _0x215f3f;
  _0x4fe61d.prompt = appendStoryAssetReferencePrompt(_0x4fe61d.prompt);
  _0x4fe61d.error = "";
  return true;
}
export function clearStoryAssetAppearanceReferenceImage(_0x32c7fb = null) {
  if (!_0x32c7fb || typeof _0x32c7fb !== "object") {
    return false;
  }
  const _0x40d7d4 = Boolean(normalizeText(_0x32c7fb.referenceImageUrl));
  const _0x2f9475 = normalizeText(normalizeText(_0x32c7fb.prompt).split(STORY_ASSET_REFERENCE_PROMPT_SUFFIX).join("").split(STORY_ASSET_STYLE_REFERENCE_MENTION).join(""));
  const _0x1f0141 = _0x2f9475 !== normalizeText(_0x32c7fb.prompt);
  _0x32c7fb.referenceImageUrl = "";
  _0x32c7fb.prompt = _0x2f9475;
  return _0x40d7d4 || _0x1f0141;
}
function buildLegacyPrompt(_0x4a1a69 = {}) {
  return [sanitizeStoryAssetPublicPromptText(_0x4a1a69.description), sanitizeStoryAssetPublicPromptText(_0x4a1a69.prompt)].filter(Boolean).join("\n");
}
export function normalizeStoryAssetAppearance(_0x4bf1a8 = {}, _0x8d1b18 = {}) {
  const _0x39c972 = normalizeText(_0x8d1b18.assetId) || "asset";
  const _0x17aa6a = Math.max(0, Math.trunc(Number(_0x8d1b18.index) || 0));
  const _0x12c4f1 = sanitizeStoryAssetPublicPromptText(_0x4bf1a8.prompt) || sanitizeStoryAssetPublicPromptText(_0x8d1b18.fallbackPrompt);
  return {
    ..._0x4bf1a8,
    id: normalizeText(_0x4bf1a8.id) || _0x39c972 + "-appearance-" + (_0x17aa6a + 1),
    name: normalizeText(_0x4bf1a8.name) || (_0x17aa6a === 0 ? "基础形象" : "形象 " + (_0x17aa6a + 1)),
    occurrences: normalizeText(_0x4bf1a8.occurrences) || normalizeText(_0x8d1b18.occurrences) || "当前项目",
    description: sanitizeStoryAssetPublicDescriptionText(_0x4bf1a8.description),
    scriptFacts: stripStoryAssetInternalEvidenceMetadata(_0x4bf1a8.scriptFacts),
    visualDesign: stripStoryAssetInternalEvidenceMetadata(_0x4bf1a8.visualDesign),
    prompt: _0x12c4f1,
    imageUrl: normalizeText(_0x4bf1a8.imageUrl),
    referenceImageUrl: normalizeText(_0x4bf1a8.referenceImageUrl),
    error: normalizeText(_0x4bf1a8.error)
  };
}
export function normalizeStoryAsset(_0x5a50a8 = {}, _0x3285f4 = 0) {
  const _0x2f4c99 = normalizeText(_0x5a50a8.id) || "story-asset-" + (_0x3285f4 + 1);
  const _0x3efbeb = ["scene", "prop"].includes(_0x5a50a8.kind) ? _0x5a50a8.kind : "character";
  const _0xf77dbe = normalizeStoryAssetDisplayName(_0x5a50a8.name, _0x3efbeb, _0x3285f4);
  const _0x4e14da = Array.isArray(_0x5a50a8.appearances) && _0x5a50a8.appearances.length ? _0x5a50a8.appearances : [{
    id: _0x2f4c99 + "-appearance-1",
    name: "基础形象",
    occurrences: _0x5a50a8.occurrences,
    prompt: buildLegacyPrompt(_0x5a50a8),
    imageUrl: _0x5a50a8.imageUrl,
    generatedImage: _0x5a50a8.generatedImage
  }];
  const _0x5b5729 = _0x4e14da.map((_0x34bc32, _0xcc4deb) => normalizeStoryAssetAppearance(_0x34bc32, {
    assetId: _0x2f4c99,
    index: _0xcc4deb,
    occurrences: _0x5a50a8.occurrences,
    fallbackPrompt: _0xcc4deb === 0 ? buildLegacyPrompt(_0x5a50a8) : ""
  }));
  const _0x347807 = normalizeText(_0x5a50a8.baseAppearanceId);
  const _0x3bd66 = _0x3efbeb === "character" && _0x5b5729.length > 1 ? _0x5b5729.find(_0x9dded5 => _0x9dded5.id === _0x347807) || _0x5b5729.find(_0x44939a => _0x44939a.isBaseAppearance === true) || _0x5b5729.find(_0x57bc88 => normalizeText(_0x57bc88.name) === "基础形象") || _0x5b5729[0] : null;
  return {
    ..._0x5a50a8,
    id: _0x2f4c99,
    kind: _0x3efbeb,
    name: _0xf77dbe,
    description: sanitizeStoryAssetPublicDescriptionText(_0x5a50a8.description),
    scriptFacts: stripStoryAssetInternalEvidenceMetadata(_0x5a50a8.scriptFacts),
    visualDesign: stripStoryAssetInternalEvidenceMetadata(_0x5a50a8.visualDesign),
    prompt: sanitizeStoryAssetPublicPromptText(_0x5a50a8.prompt),
    role: _0x3efbeb === "character" ? normalizeStoryCharacterRole(_0x5a50a8.role, _0xf77dbe) : normalizeText(_0x5a50a8.role),
    baseAppearanceId: _0x3bd66?.id || "",
    appearances: _0x5b5729
  };
}
export function normalizeStoryWorkspaceAssetData(_0x1ffd65 = {}) {
  const _0x333816 = _0x1ffd65 && typeof _0x1ffd65 === "object" ? _0x1ffd65 : {};
  const _0x7cee00 = _0x333816.project?.sourceMode === "video-replication";
  const _0x4e31e8 = Array.isArray(_0x333816.assets) ? _0x333816.assets.map((_0x2f421e, _0x2dc391) => normalizeStoryAsset(_0x2f421e, _0x2dc391)) : [];
  const _0x568781 = Array.isArray(_0x333816.episodes) ? _0x333816.episodes.map(_0x5b74f6 => {
    const _0x2fc8f5 = discardStaleStoryEpisodeSplitTransportDraft(ensureUniqueStoryEpisodeClipIds(_0x5b74f6));
    return {
      ..._0x2fc8f5,
      clips: Array.isArray(_0x2fc8f5?.clips) ? _0x2fc8f5.clips.map(_0xcbabea => syncStoryEpisodeClipDialogueMentions(_0xcbabea, _0x4e31e8, {
        includeDialogueVoiceGuidance: _0x7cee00
      })) : []
    };
  }) : [];
  return {
    ..._0x333816,
    assets: _0x4e31e8,
    episodes: _0x568781,
    clipFrames: normalizeStoryClipFrames(_0x333816.clipFrames)
  };
}
export function getStoryAssetAppearances(_0x2c64ed = {}) {
  return getWorkspaceAssetAppearances(_0x2c64ed);
}
export function getStoryAssetAppearance(_0x9b0d91 = {}, _0x1760ed = 0) {
  return getWorkspaceAssetAppearance(_0x9b0d91, _0x1760ed);
}
export function getStoryAssetBaseAppearance(_0x200114 = {}) {
  return getWorkspaceAssetBaseAppearance(_0x200114);
}
export function getPreferredStoryAssetBaseAppearance(_0x28dd8c = {}) {
  const _0x2cb424 = getStoryAssetAppearances(_0x28dd8c);
  return getStoryAssetBaseAppearance(_0x28dd8c) || _0x2cb424.find(_0xa314b6 => normalizeText(_0xa314b6.name) === "基础形象") || _0x2cb424[0] || null;
}
export function isStoryAssetBaseAppearance(_0x37512b = {}, _0x1944d1 = null) {
  if (_0x37512b.kind !== "character" || !_0x1944d1) {
    return false;
  }
  const _0x3e2323 = getStoryAssetAppearances(_0x37512b);
  if (_0x3e2323.length === 1) {
    return normalizeText(_0x3e2323[0]?.id) === normalizeText(_0x1944d1.id);
  }
  const _0x24ec32 = getStoryAssetBaseAppearance(_0x37512b);
  return Boolean(_0x24ec32 && normalizeText(_0x24ec32.id) === normalizeText(_0x1944d1.id));
}
export function setStoryAssetBaseAppearance(_0x35824a = {}, _0x52896c = "") {
  if (_0x35824a.kind !== "character" || getStoryAssetAppearances(_0x35824a).length < 2) {
    return false;
  }
  const _0x4f0288 = getStoryAssetAppearances(_0x35824a).find(_0xe889fe => normalizeText(_0xe889fe.id) === normalizeText(_0x52896c));
  if (!_0x4f0288) {
    return false;
  }
  _0x35824a.baseAppearanceId = _0x4f0288.id;
  return true;
}
export function ensureStoryAssetBaseAppearance(_0x86b561 = {}) {
  if (_0x86b561.kind !== "character" || getStoryAssetAppearances(_0x86b561).length < 2) {
    return false;
  }
  if (getStoryAssetBaseAppearance(_0x86b561)) {
    return false;
  }
  const _0x2f81fe = getPreferredStoryAssetBaseAppearance(_0x86b561);
  if (!_0x2f81fe) {
    return false;
  }
  _0x86b561.baseAppearanceId = _0x2f81fe.id;
  return true;
}
export function shouldGenerateStoryAssetBaseAppearanceFirst(_0x4aa5dd = {}, _0x5506ae = null) {
  const _0x4f334b = getStoryAssetAppearances(_0x4aa5dd);
  if (_0x4aa5dd.kind !== "character" || _0x4f334b.length < 2) {
    return false;
  }
  const _0xa54ad9 = getPreferredStoryAssetBaseAppearance(_0x4aa5dd);
  if (!_0xa54ad9 || normalizeText(_0xa54ad9.imageUrl)) {
    return false;
  }
  return normalizeText(_0xa54ad9.id) !== normalizeText(_0x5506ae?.id);
}
export function getStoryAssetAppearanceReferenceUrls(_0x4a9735 = {}, _0x41f4c3 = null) {
  const _0xd22fb = getStoryAssetAppearances(_0x4a9735);
  if (_0x4a9735.kind !== "character" || _0xd22fb.length === 0) {
    return [];
  }
  const _0x31c6bb = _0xd22fb.length === 1 ? _0xd22fb[0] : getStoryAssetBaseAppearance(_0x4a9735);
  if (!_0x31c6bb || !normalizeText(_0x41f4c3?.id)) {
    return [];
  }
  if (normalizeText(_0x31c6bb.id) === normalizeText(_0x41f4c3.id)) {
    const _0xdd8c0 = normalizeText(_0x31c6bb.referenceImageUrl);
    if (!_0xdd8c0) {
      return [];
    }
    return [normalizeText(_0x31c6bb.imageUrl), _0xdd8c0].filter(Boolean);
  }
  if (!normalizeText(_0x31c6bb.imageUrl)) {
    return [];
  }
  return [normalizeText(_0x31c6bb.imageUrl), normalizeText(_0x41f4c3.referenceImageUrl)].filter(Boolean);
}
export function buildStoryAssetAppearanceGenerationTasks(_0x10149 = [], {
  includeExisting = false
} = {}) {
  return (Array.isArray(_0x10149) ? _0x10149 : []).flatMap(_0x479396 => {
    const _0x5ca2f4 = getStoryAssetAppearances(_0x479396);
    const _0x1ed2f8 = includeExisting ? _0x5ca2f4 : _0x5ca2f4.filter(_0x4b0f27 => !normalizeText(_0x4b0f27.imageUrl));
    if (_0x479396.kind !== "character" || _0x5ca2f4.length < 2) {
      return _0x1ed2f8.map(_0xa8e7dc => ({
        asset: _0x479396,
        appearance: _0xa8e7dc
      }));
    }
    const _0x2d6784 = getPreferredStoryAssetBaseAppearance(_0x479396);
    if (!_0x2d6784 || !includeExisting && normalizeText(_0x2d6784.imageUrl)) {
      return _0x1ed2f8.map(_0x1603a6 => ({
        asset: _0x479396,
        appearance: _0x1603a6
      }));
    }
    return [..._0x1ed2f8].sort((_0x4df728, _0x5844d6) => Number(_0x5844d6.id === _0x2d6784?.id) - Number(_0x4df728.id === _0x2d6784?.id)).map(_0x185624 => ({
      asset: _0x479396,
      appearance: _0x185624
    }));
  });
}
export async function runStoryAssetAppearanceGenerationTasks(_0x55bcf7 = [], _0x5bf943 = null, {
  shouldStop = () => false
} = {}) {
  if (typeof _0x5bf943 !== "function") {
    return [];
  }
  const _0x3e1abc = new Map();
  (Array.isArray(_0x55bcf7) ? _0x55bcf7 : []).forEach((_0x147343, _0x120a9f) => {
    const _0xa9d09a = _0x147343?.asset;
    const _0x4c5d15 = normalizeText(_0xa9d09a?.id) || _0xa9d09a || "story-asset-task-" + _0x120a9f;
    if (!_0x3e1abc.has(_0x4c5d15)) {
      _0x3e1abc.set(_0x4c5d15, []);
    }
    _0x3e1abc.get(_0x4c5d15).push({
      task: _0x147343,
      taskIndex: _0x120a9f
    });
  });
  const _0x8023ba = new Array(Array.isArray(_0x55bcf7) ? _0x55bcf7.length : 0);
  await Promise.all([..._0x3e1abc.values()].map(async _0x4b70fa => {
    for (let _0x354839 = 0; _0x354839 < _0x4b70fa.length; _0x354839 += 1) {
      const {
        task: _0x4fc7ec,
        taskIndex: _0x221470
      } = _0x4b70fa[_0x354839];
      if (shouldStop({
        task: _0x4fc7ec,
        taskIndex: _0x221470,
        laneIndex: _0x354839,
        laneLength: _0x4b70fa.length
      })) {
        break;
      }
      _0x8023ba[_0x221470] = await _0x5bf943(_0x4fc7ec, {
        taskIndex: _0x221470,
        laneIndex: _0x354839,
        laneLength: _0x4b70fa.length,
        remainingTasks: _0x4b70fa.slice(_0x354839 + 1).map(_0x5a7e01 => _0x5a7e01.task)
      });
    }
  }));
  return _0x8023ba;
}
export function getStoryAssetAppearanceStats(_0x17c5fc = {}) {
  return getWorkspaceAssetAppearanceStats(_0x17c5fc);
}