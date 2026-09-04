import { formatPersonReplacementPersonLabel, getPersonReplacementCrossRoleSourceCharacterIds, isGeneratedPersonReplacementLabel, normalizePersonReplacementProject } from "./personReplacementProject.js";
import { buildPersonReplacementSourceCharacters, normalizePersonReplacementIdentityCorrectionDrafts } from "./personReplacementSourceIdentity.js";
import { getRecoverablePersonReplacementImageTask, normalizePersonReplacementAssetPromptPresetId, normalizePersonReplacementImageGenerationsByShotId, normalizePersonReplacementImageGenerationState, updatePersonReplacementImageGenerationState } from "./personReplacementImageGeneration.js";
import { getRecoverablePersonReplacementVideoTask, isPersonReplacementVideoGenerationActive, normalizePersonReplacementVideoGenerationsByShotId, normalizePersonReplacementVideoGenerationState, updatePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
import { getPersonReplacementAccessibleStep } from "./personReplacementWorkflow.js";
import { getWorkspaceProjectTaskPresentation, normalizeWorkspaceProjectSortOrder } from "../workspaceProjectHome.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { getPersonReplacementAudioSavedName } from "./personReplacementVoiceLibrary.js";
const PRESENTATION_MODES = new Set(["none", "render", "state"]);
const ACTIVE_CHARACTER_APPEARANCE_STATUSES = new Set(["queued", "submitting", "running"]);
const ACTIVE_RUNTIME_TASK_STATUSES = new Set(["queued", "submitting", "running"]);
const FAILED_PROJECT_TASK_STATUSES = new Set(["failed", "interrupted"]);
const ACTIVE_SOURCE_ANALYSIS_STATUSES = new Set(["uploading", "cutting", "extracting-keyframes", "detecting", "identifying", "running"]);
const INTERRUPTED_CHARACTER_APPEARANCE_ERROR = "页面刷新后生成任务已中断，请重新生成。";
const INTERRUPTED_PROJECT_TASK_ERROR = "页面刷新后任务已中断，请重试。";
const PERSON_REPLACEMENT_LAYOUT_DEFAULTS = Object.freeze({
  left: 24,
  right: 32,
  centerTop: 68
});
const PERSON_REPLACEMENT_VOICE_LAYOUT_DEFAULTS = Object.freeze({
  assetsEnd: 16,
  sourcesEnd: 38
});
const PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_DEFAULT = 320;
export const PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_RANGE = Object.freeze({
  min: 240,
  max: 720
});
const WORKSPACE_PROJECT_PROJECTION_FIELDS = new Set(["libraryProjects", "libraryAssets", "sourcePreviewRefs", "persistenceState"]);
function normalizeText(_0x592219) {
  return String(_0x592219 ?? "").trim();
}
function cloneJson(_0x2da2ca) {
  return JSON.parse(JSON.stringify(_0x2da2ca));
}
function clamp(_0x2a6fd7, _0x196cee, _0xf25fb, _0x5cb07a = _0x196cee) {
  const _0x5268f8 = Number(_0x2a6fd7);
  if (Number.isFinite(_0x5268f8)) {
    return Math.min(_0xf25fb, Math.max(_0x196cee, _0x5268f8));
  } else {
    return _0x5cb07a;
  }
}
function normalizeMediaUrl(_0x28e4ad) {
  const _0x41d3e = normalizeText(_0x28e4ad);
  if (!_0x41d3e) {
    return "";
  }
  return localPathToUrl(_0x41d3e) || _0x41d3e;
}
function normalizeLibraryAssetForProjectSession(_0x15ce57 = {}, _0x2c8bc5 = 0) {
  const _0x26c05a = normalizeText(_0x15ce57.assetId || _0x15ce57.sourceAssetId || _0x15ce57.id) || "asset-" + (_0x2c8bc5 + 1);
  const _0x4d8465 = Math.max(0, Math.trunc(Number(_0x15ce57.itemIndex ?? _0x15ce57.sourceItemIndex) || 0));
  const _0xb2da19 = (normalizeText(_0x15ce57.type || _0x15ce57.mediaKind) || "image").toLowerCase();
  const _0x3aa6c1 = normalizeText(_0x15ce57.assetName) || normalizeText(_0x15ce57.name) || "画布素材";
  const _0x1d54cc = normalizeMediaUrl(_0x15ce57.thumbUrl || _0x15ce57.thumbnailUrl);
  const _0x492c18 = normalizeMediaUrl(_0x15ce57.url || _0x15ce57.sourceUrl || (_0xb2da19 === "audio" ? _0x15ce57.audioUrl : _0x15ce57.imageUrl));
  const _0x550600 = _0xb2da19 === "audio" ? "音频" : _0xb2da19 === "video" ? "视频" : "图片";
  const _0x466873 = _0xb2da19 === "audio" ? getPersonReplacementAudioSavedName(_0x15ce57) : normalizeText(_0x15ce57.name) || _0x3aa6c1;
  return {
    ..._0x15ce57,
    id: "library-" + _0x26c05a + "-" + _0x4d8465,
    sourceAssetId: _0x26c05a,
    sourceItemIndex: _0x4d8465,
    kind: "library",
    mediaKind: _0xb2da19,
    name: _0x466873,
    ...(_0xb2da19 === "audio" ? {
      savedName: _0x466873
    } : {}),
    assetName: _0x3aa6c1,
    role: _0x550600 + "素材",
    occurrences: "来自画布素材",
    description: _0xb2da19 === "audio" ? "" : normalizeText(_0x15ce57.description) || "来自画布素材「" + _0x3aa6c1 + "」",
    prompt: "",
    imageUrl: _0xb2da19 === "image" ? _0x492c18 || _0x1d54cc : _0x1d54cc,
    audioUrl: _0xb2da19 === "audio" ? _0x492c18 : "",
    thumbnailUrl: _0x1d54cc,
    sourceUrl: _0x492c18 || _0x1d54cc,
    isLibraryAsset: true
  };
}
function getActiveCharacterAppearanceKeys(_0x48355a = {}) {
  return new Set((Array.isArray(_0x48355a.characters) ? _0x48355a.characters : []).flatMap(_0x1d9da8 => (Array.isArray(_0x1d9da8?.appearances) ? _0x1d9da8.appearances : []).filter(_0x41b18c => !normalizeText(_0x41b18c?.imageUrl) && !normalizeText(_0x41b18c?.error) && ACTIVE_CHARACTER_APPEARANCE_STATUSES.has(normalizeText(_0x41b18c?.generationStatus).toLowerCase())).map(_0x2ca698 => normalizeText(_0x1d9da8?.id) + ":" + normalizeText(_0x2ca698?.id)).filter(_0x2223b1 => !_0x2223b1.startsWith(":") && !_0x2223b1.endsWith(":"))));
}
export function normalizePersonReplacementLayout(_0x2664e5 = {}) {
  const _0xbad734 = _0x2664e5 && typeof _0x2664e5 === "object" ? _0x2664e5 : {};
  return {
    left: clamp(_0xbad734.left, 18, 38, PERSON_REPLACEMENT_LAYOUT_DEFAULTS.left),
    right: clamp(_0xbad734.right, 24, 42, PERSON_REPLACEMENT_LAYOUT_DEFAULTS.right),
    centerTop: clamp(_0xbad734.centerTop, 38, 82, PERSON_REPLACEMENT_LAYOUT_DEFAULTS.centerTop)
  };
}
export function normalizePersonReplacementVoiceLayout(_0x8c29a3 = {}) {
  const _0x13c83e = _0x8c29a3 && typeof _0x8c29a3 === "object" ? _0x8c29a3 : {};
  const _0x2e76bb = clamp(_0x13c83e.assetsEnd, 16, 32, PERSON_REPLACEMENT_VOICE_LAYOUT_DEFAULTS.assetsEnd);
  return {
    assetsEnd: _0x2e76bb,
    sourcesEnd: clamp(_0x13c83e.sourcesEnd, _0x2e76bb + 16, 60, Math.max(PERSON_REPLACEMENT_VOICE_LAYOUT_DEFAULTS.sourcesEnd, _0x2e76bb + 16))
  };
}
export function normalizePersonReplacementCompositeSidebarWidth(_0x5cb2f5) {
  return clamp(_0x5cb2f5, PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_RANGE.min, PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_RANGE.max, PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_DEFAULT);
}
export function normalizePersonReplacementPersistenceState(_0xc121fd = {}) {
  const _0xfb902d = _0xc121fd && typeof _0xc121fd === "object" ? _0xc121fd : {};
  const _0x465629 = ["idle", "pending", "saving", "saved", "error"].includes(_0xfb902d.status) ? _0xfb902d.status : "saved";
  return {
    status: _0x465629,
    error: normalizeText(_0xfb902d.error),
    retryAttempt: Math.max(0, Math.trunc(Number(_0xfb902d.retryAttempt) || 0))
  };
}
export function isPersonReplacementSourceProcessing(_0x5bd496 = {}) {
  const _0xb72666 = _0x5bd496?.workspace || {};
  const _0x5449fe = normalizeText(_0xb72666.sourceAnalysis?.status).toLowerCase();
  const _0x33e223 = normalizeText(_0xb72666.videoPreparation?.status).toLowerCase();
  return _0x33e223 === "running" || ACTIVE_SOURCE_ANALYSIS_STATUSES.has(_0x5449fe);
}
export function getPersonReplacementProjectTaskSummary(_0x4fbb42 = {}) {
  const _0x3c4aa3 = _0x4fbb42?.workspace || {};
  const _0x79f75b = normalizeText(_0x3c4aa3.sourceAnalysis?.status).toLowerCase();
  const _0x5597d0 = normalizeText(_0x3c4aa3.videoPreparation?.status).toLowerCase();
  if (isPersonReplacementSourceProcessing(_0x4fbb42)) {
    const _0x92e160 = _0x5597d0 === "running";
    const _0x10bf73 = Math.round(clamp(_0x92e160 ? _0x3c4aa3.videoPreparation?.progress : _0x3c4aa3.sourceAnalysis?.progress, 0, 100, 0));
    return {
      activeCount: 1,
      failedCount: 0,
      label: (_0x92e160 ? "正在准备镜头" : "视频处理中") + " · " + _0x10bf73 + "%"
    };
  }
  const _0x5979a9 = new Set();
  const _0x572bf3 = new Set();
  if (_0x79f75b === "failed" || _0x5597d0 === "failed") {
    _0x572bf3.add("source:processing");
  }
  const _0x2e4999 = (_0x3b6878, _0x453a9a, _0x54a332) => {
    const _0xe2f5dc = normalizeText(_0x453a9a);
    if (!_0xe2f5dc) {
      return;
    }
    const _0x76051c = normalizeText(_0x54a332).toLowerCase();
    if (ACTIVE_RUNTIME_TASK_STATUSES.has(_0x76051c)) {
      _0x5979a9.add(_0x3b6878 + ":" + _0xe2f5dc);
      _0x572bf3.delete(_0x3b6878 + ":" + _0xe2f5dc);
    } else if (FAILED_PROJECT_TASK_STATUSES.has(_0x76051c)) {
      _0x572bf3.add(_0x3b6878 + ":" + _0xe2f5dc);
    }
  };
  const _0x5ce23b = (_0x162830, _0x13e213 = {}) => {
    if (!_0x13e213 || typeof _0x13e213 !== "object" || Array.isArray(_0x13e213)) {
      return;
    }
    Object.entries(_0x13e213).forEach(([_0x17ee48, _0x323441]) => {
      _0x2e4999(_0x162830, _0x17ee48, _0x323441?.status);
    });
  };
  _0x5ce23b("image", _0x3c4aa3.imageGenerationsByShotId);
  _0x5ce23b("video", _0x3c4aa3.videoGenerationsByShotId);
  const _0x33142e = (_0x12a5ea, _0x2b8618 = {}) => {
    _0x2e4999(_0x12a5ea, _0x2b8618?.shotId, _0x2b8618?.status);
  };
  _0x33142e("image", _0x3c4aa3.imageGeneration);
  _0x33142e("video", _0x3c4aa3.videoGeneration);
  (Array.isArray(_0x3c4aa3.generatingAppearanceKeys) ? _0x3c4aa3.generatingAppearanceKeys : []).map(normalizeText).filter(Boolean).forEach(_0x228a7f => {
    _0x5979a9.add("appearance:" + _0x228a7f);
  });
  (Array.isArray(_0x4fbb42?.characters) ? _0x4fbb42.characters : []).forEach(_0x251f42 => {
    (Array.isArray(_0x251f42?.appearances) ? _0x251f42.appearances : []).forEach(_0x42e300 => {
      const _0x5eef8c = normalizeText(_0x251f42?.id) + ":" + normalizeText(_0x42e300?.id);
      const _0x5698f9 = normalizeText(_0x42e300?.generationStatus).toLowerCase();
      if (ACTIVE_CHARACTER_APPEARANCE_STATUSES.has(_0x5698f9)) {
        _0x5979a9.add("appearance:" + _0x5eef8c);
        _0x572bf3.delete("appearance:" + _0x5eef8c);
      } else if (FAILED_PROJECT_TASK_STATUSES.has(_0x5698f9)) {
        _0x572bf3.add("appearance:" + _0x5eef8c);
      }
    });
  });
  (Array.isArray(_0x4fbb42?.shots) ? _0x4fbb42.shots : []).forEach(_0x4b36b5 => {
    _0x2e4999("video", _0x4b36b5?.id, _0x4b36b5?.generationStatus);
  });
  return getWorkspaceProjectTaskPresentation({
    activeCount: _0x5979a9.size,
    failedCount: _0x572bf3.size
  });
}
export function normalizePersonReplacementWorkspaceProject(_0x2be1d2 = {}) {
  const _0x347839 = _0x2be1d2 && typeof _0x2be1d2 === "object" ? _0x2be1d2 : {};
  const _0x48fc6d = normalizePersonReplacementProject(_0x347839);
  const _0x1ef3ab = _0x347839.workspace && typeof _0x347839.workspace === "object" ? _0x347839.workspace : {};
  const _0x38bc62 = normalizeText(_0x1ef3ab.selectedShotId || _0x347839.selectedShotId);
  const _0x154296 = _0x48fc6d.shots.some(_0x16f67e => _0x16f67e.id === _0x38bc62) ? _0x38bc62 : _0x48fc6d.shots[0]?.id || "";
  const _0x5bd9cc = normalizeText(_0x1ef3ab.selectedCharacterId);
  const _0x886317 = _0x48fc6d.characters.some(_0x29d5ce => _0x29d5ce.id === _0x5bd9cc) ? _0x5bd9cc : _0x48fc6d.characters[0]?.id || "";
  const _0x3a4578 = normalizeText(_0x1ef3ab.selectedSceneId);
  const _0x3fe372 = _0x48fc6d.scenes.some(_0x3a7d84 => _0x3a7d84.id === _0x3a4578) ? _0x3a4578 : _0x48fc6d.scenes[0]?.id || "";
  const _0xe30597 = normalizeText(_0x1ef3ab.selectedAudioAssetId);
  const _0x44425f = _0x48fc6d.audioAssets.some(_0x147959 => _0x147959.id === _0xe30597) ? _0xe30597 : _0x48fc6d.audioAssets[0]?.id || "";
  const _0x3a3f80 = normalizeText(_0x1ef3ab.selectedVoiceSourceId);
  const _0x21090e = _0x48fc6d.sources.some(_0x1b62ab => _0x1b62ab.id === _0x3a3f80) ? _0x3a3f80 : _0x48fc6d.sources[0]?.id || "";
  const _0x27c131 = Array.isArray(_0x347839.libraryAssets) ? _0x347839.libraryAssets.filter(_0x4eec8a => ["image", "audio"].includes((normalizeText(_0x4eec8a?.type || _0x4eec8a?.mediaKind) || "image").toLowerCase())).map(normalizeLibraryAssetForProjectSession) : [];
  const _0x23a2f2 = normalizeText(_0x1ef3ab.selectedLibraryAssetId);
  const _0x31f215 = _0x27c131.some(_0x3fbfbd => _0x3fbfbd.id === _0x23a2f2) ? _0x23a2f2 : _0x27c131[0]?.id || "";
  const _0x164e16 = _0x347839.sourcePreviewRefs && typeof _0x347839.sourcePreviewRefs === "object" ? _0x347839.sourcePreviewRefs : {};
  const _0x28b08c = Object.fromEntries(_0x48fc6d.sources.map(_0x134a2b => [_0x134a2b.id, normalizeText(_0x164e16[_0x134a2b.id])]).filter(([, _0x2a5537]) => _0x2a5537.startsWith("blob:")));
  const _0x50cabd = getActiveCharacterAppearanceKeys(_0x48fc6d);
  const _0x286fb3 = Math.trunc(clamp(_0x1ef3ab.step ?? _0x347839.step, 1, 5, 1));
  const _0x304d47 = normalizePersonReplacementImageGenerationState(_0x1ef3ab.imageGeneration);
  const _0x5bf05c = normalizePersonReplacementImageGenerationsByShotId(_0x1ef3ab.imageGenerationsByShotId, _0x48fc6d.shots, _0x304d47);
  const _0x5be116 = Object.values(_0x5bf05c).find(_0x1c29b2 => _0x1c29b2.status === "running");
  const _0x1f25ee = normalizePersonReplacementVideoGenerationState(_0x1ef3ab.videoGeneration);
  const _0x433ada = normalizePersonReplacementVideoGenerationsByShotId(_0x1ef3ab.videoGenerationsByShotId, _0x48fc6d.shots, _0x1f25ee);
  const _0x172400 = Object.values(_0x433ada).find(isPersonReplacementVideoGenerationActive);
  return {
    ..._0x48fc6d,
    persistenceState: normalizePersonReplacementPersistenceState(_0x347839.persistenceState),
    ...(Object.keys(_0x28b08c).length ? {
      sourcePreviewRefs: _0x28b08c
    } : {}),
    libraryProjects: Array.isArray(_0x347839.libraryProjects) ? _0x347839.libraryProjects : [],
    libraryAssets: _0x27c131,
    workspace: {
      view: _0x1ef3ab.view === "project" ? "project" : "home",
      step: getPersonReplacementAccessibleStep(_0x48fc6d, _0x286fb3),
      selectedShotId: _0x154296,
      selectedShotIds: Array.isArray(_0x1ef3ab.selectedShotIds) ? _0x1ef3ab.selectedShotIds.map(normalizeText).filter(_0x563f99 => _0x48fc6d.shots.some(_0x5619ce => _0x5619ce.id === _0x563f99)) : [],
      shotSelectionMode: _0x1ef3ab.shotSelectionMode === true,
      selectedCharacterId: _0x886317,
      selectedSceneId: _0x3fe372,
      selectedAudioAssetId: _0x44425f,
      selectedLibraryAssetId: _0x31f215,
      selectedVoiceSourceId: _0x21090e,
      characterAssetTab: ["character", "scene", "audio", "library"].includes(_0x1ef3ab.characterAssetTab) ? _0x1ef3ab.characterAssetTab : "character",
      replacementLayout: normalizePersonReplacementLayout(_0x1ef3ab.replacementLayout),
      voiceLayout: normalizePersonReplacementVoiceLayout(_0x1ef3ab.voiceLayout),
      assetPromptPresetId: normalizePersonReplacementAssetPromptPresetId(_0x1ef3ab.assetPromptPresetId),
      selectedAssetIds: Array.isArray(_0x1ef3ab.selectedAssetIds) ? _0x1ef3ab.selectedAssetIds.map(normalizeText).filter(Boolean) : [],
      assetSelectionMode: _0x1ef3ab.assetSelectionMode === true,
      assetAppearanceIndexes: _0x1ef3ab.assetAppearanceIndexes && typeof _0x1ef3ab.assetAppearanceIndexes === "object" ? {
        ..._0x1ef3ab.assetAppearanceIndexes
      } : {},
      assetSplitRatio: clamp(_0x1ef3ab.assetSplitRatio, 28, 72, 50),
      compositeSidebarWidth: normalizePersonReplacementCompositeSidebarWidth(_0x1ef3ab.compositeSidebarWidth),
      compositePreviewMode: _0x1ef3ab.compositePreviewMode === "full" && Boolean(_0x48fc6d.output.originalMasterRef) && Boolean(_0x48fc6d.output.finalVideoRef || _0x48fc6d.output.visualMasterRef) ? "full" : "shot",
      generatingAppearanceKeys: Array.isArray(_0x1ef3ab.generatingAppearanceKeys) ? _0x1ef3ab.generatingAppearanceKeys.map(normalizeText).filter(_0x3d1ab1 => _0x50cabd.has(_0x3d1ab1)) : [],
      imageGeneration: _0x304d47.status === "running" && _0x5bf05c[_0x304d47.shotId]?.status === "running" ? _0x5bf05c[_0x304d47.shotId] : _0x5be116 || _0x304d47,
      imageGenerationsByShotId: _0x5bf05c,
      videoGeneration: isPersonReplacementVideoGenerationActive(_0x1f25ee) && isPersonReplacementVideoGenerationActive(_0x433ada[_0x1f25ee.shotId]) ? _0x433ada[_0x1f25ee.shotId] : _0x172400 || _0x1f25ee,
      videoGenerationsByShotId: _0x433ada,
      videoPreparation: _0x1ef3ab.videoPreparation || {
        status: "idle",
        progress: 0,
        error: ""
      },
      sourceAnalysis: _0x1ef3ab.sourceAnalysis || {
        status: "idle",
        progress: 0
      },
      smartClipSettingsOpen: _0x1ef3ab.smartClipSettingsOpen === true,
      identityAnalysis: _0x1ef3ab.identityAnalysis || {
        status: "idle",
        modelId: "",
        stats: {},
        error: ""
      },
      selectedIdentityIds: Array.isArray(_0x1ef3ab.selectedIdentityIds) ? _0x1ef3ab.selectedIdentityIds.map(normalizeText).filter(_0x31319c => _0x48fc6d.sourceCharacters.some(_0x377312 => _0x377312.id === _0x31319c)) : [],
      removedCustomPersonLabels: [...new Set((Array.isArray(_0x1ef3ab.removedCustomPersonLabels) ? _0x1ef3ab.removedCustomPersonLabels : []).map(normalizeText).filter(_0x30deb2 => _0x30deb2 && !isGeneratedPersonReplacementLabel(_0x30deb2)))],
      identityCorrectionDrafts: normalizePersonReplacementIdentityCorrectionDrafts(_0x1ef3ab.identityCorrectionDrafts, _0x48fc6d.shots, _0x48fc6d.sourceCharacters),
      characterImageGeneration: _0x1ef3ab.characterImageGeneration || {
        status: "idle",
        characterId: "",
        appearanceId: "",
        error: ""
      },
      projectSearchQuery: normalizeText(_0x1ef3ab.projectSearchQuery),
      projectSortOrder: normalizeWorkspaceProjectSortOrder(_0x1ef3ab.projectSortOrder),
      showArchivedProjects: _0x1ef3ab.showArchivedProjects === true,
      openProjectMenuId: normalizeText(_0x1ef3ab.openProjectMenuId),
      pendingDeleteProjectId: normalizeText(_0x1ef3ab.pendingDeleteProjectId)
    }
  };
}
export function createPersonReplacementWorkspaceProject(_0x55de11 = {}, _0x115e46 = {}) {
  const _0x3b1ccb = _0x55de11 && typeof _0x55de11 === "object" ? _0x55de11 : {};
  const _0x371ee4 = normalizePersonReplacementProject(_0x3b1ccb);
  const _0x5c7393 = _0x115e46?.workspace && typeof _0x115e46.workspace === "object" ? _0x115e46.workspace : {};
  const _0x3bb53b = _0x3b1ccb.workspace && typeof _0x3b1ccb.workspace === "object" ? _0x3b1ccb.workspace : {};
  const _0x5a299b = _0x371ee4.shots.map((_0x3bf633, _0x5ab441) => ({
    ..._0x3bf633,
    title: normalizeText(_0x3b1ccb.shots?.find?.(_0x2ebf2b => _0x2ebf2b?.id === _0x3bf633.id)?.title) || "片段 " + String(_0x5ab441 + 1).padStart(2, "0"),
    thumbnailUrl: normalizeMediaUrl(_0x3bf633.keyframeRef),
    keyframeUrl: normalizeMediaUrl(_0x3bf633.keyframeRef),
    persons: _0x3bf633.people.map((_0x3a5a95, _0x247c19) => ({
      ..._0x3a5a95,
      label: normalizeText(_0x3a5a95.label) || formatPersonReplacementPersonLabel(_0x247c19)
    }))
  }));
  const _0x91d368 = {
    ..._0x5c7393,
    ..._0x3bb53b,
    selectedShotId: _0x3bb53b.selectedShotId || _0x3b1ccb.selectedShotId || _0x5c7393.selectedShotId || _0x5a299b[0]?.id || ""
  };
  const _0xbf3c46 = Array.isArray(_0x3b1ccb.libraryAssets);
  const _0x2fabc3 = normalizePersonReplacementWorkspaceProject({
    ..._0x371ee4,
    shots: _0x5a299b,
    libraryProjects: _0x3b1ccb.libraryProjects || [],
    libraryAssets: _0xbf3c46 ? _0x3b1ccb.libraryAssets : [],
    workspace: _0x91d368
  });
  return {
    ..._0x2fabc3,
    workspace: {
      ..._0x2fabc3.workspace,
      selectedLibraryAssetId: _0xbf3c46 ? _0x2fabc3.workspace.selectedLibraryAssetId : normalizeText(_0x91d368.selectedLibraryAssetId)
    },
    selectedShotId: _0x2fabc3.workspace.selectedShotId,
    step: _0x2fabc3.workspace.step,
    source: {
      ..._0x2fabc3.source,
      name: _0x2fabc3.source.fileName,
      analysisStatus: _0x2fabc3.source.processingStatus,
      analysisProgress: _0x2fabc3.source.processingProgress,
      shotCount: _0x5a299b.length,
      keyframeCount: _0x5a299b.filter(_0x9141b0 => _0x9141b0.keyframeRef).length
    },
    shots: _0x5a299b
  };
}
function stripWorkspaceProjectProjection(_0x3c0784 = {}) {
  if (!_0x3c0784 || typeof _0x3c0784 !== "object" || Array.isArray(_0x3c0784)) {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x3c0784).filter(([_0x1dd0aa]) => !WORKSPACE_PROJECT_PROJECTION_FIELDS.has(_0x1dd0aa)));
}
export function normalizeReplacementStudioApplicationProject(_0x2c3e88 = {}, _0x57b7d0 = {}) {
  return stripWorkspaceProjectProjection(createPersonReplacementWorkspaceProject(stripWorkspaceProjectProjection(_0x2c3e88), stripWorkspaceProjectProjection(_0x57b7d0)));
}
function applyEditedShotMappings(_0x4f30f6 = {}) {
  const _0xaf5b28 = (Array.isArray(_0x4f30f6.shots) ? _0x4f30f6.shots : []).map(_0x54dda9 => ({
    ..._0x54dda9,
    people: Array.isArray(_0x54dda9.persons) ? _0x54dda9.persons.map(_0x59daac => ({
      ..._0x59daac
    })) : Array.isArray(_0x54dda9.people) ? _0x54dda9.people.map(_0x1f21b3 => ({
      ..._0x1f21b3
    })) : []
  }));
  const _0x2aae57 = getPersonReplacementCrossRoleSourceCharacterIds({
    shots: _0xaf5b28
  });
  const _0xcceaf2 = new Map((Array.isArray(_0x4f30f6.mappings) ? _0x4f30f6.mappings : []).map(_0x16004a => [normalizeText(_0x16004a?.sourceCharacterId), normalizeText(_0x16004a?.targetCharacterId)]).filter(([_0x3d5bf6]) => _0x3d5bf6 && !_0x2aae57.has(_0x3d5bf6)));
  _0xaf5b28.forEach(_0x15e20e => _0x15e20e.people.forEach(_0x5c83e2 => {
    const _0x55c4c2 = normalizeText(_0x5c83e2.sourceCharacterId);
    const _0x91be3 = normalizeText(_0x5c83e2.targetCharacterId);
    if (_0x55c4c2 && _0x91be3 && _0x5c83e2.projectMappingDisabled !== true && !_0x2aae57.has(_0x55c4c2) && !_0xcceaf2.has(_0x55c4c2)) {
      _0xcceaf2.set(_0x55c4c2, _0x91be3);
    }
  }));
  return {
    shots: _0xaf5b28.map(_0x3d8573 => ({
      ..._0x3d8573,
      people: _0x3d8573.people.map(_0x45c514 => ({
        ..._0x45c514,
        targetCharacterId: normalizeText(_0x45c514.targetCharacterId) || (_0x45c514.projectMappingDisabled === true ? "" : _0xcceaf2.get(normalizeText(_0x45c514.sourceCharacterId))) || ""
      }))
    })),
    mappings: [..._0xcceaf2.entries()].filter(([_0x3895ca, _0x1266ac]) => _0x3895ca && _0x1266ac).map(([_0x1eea33, _0x5e5aba]) => ({
      sourceCharacterId: _0x1eea33,
      targetCharacterId: _0x5e5aba
    }))
  };
}
function reconcileWorkspaceProject(_0x46120c, _0x477535, _0xca8035) {
  const _0x1bdb1c = applyEditedShotMappings(_0x477535);
  return {
    ..._0x477535,
    audio: {
      ..._0x477535.audio,
      selectedSourceId: _0xca8035 === "voice-source" ? normalizeText(_0x477535.workspace?.selectedVoiceSourceId) || _0x46120c.audio?.selectedSourceId : _0x477535.audio?.selectedSourceId,
      voiceStudioState: {
        ...(_0x477535.audio?.voiceStudioState || {}),
        ...(_0x46120c.audio?.voiceStudioState || {})
      }
    },
    shots: _0x1bdb1c.shots,
    sourceCharacters: buildPersonReplacementSourceCharacters(_0x1bdb1c.shots, _0x46120c.sourceCharacters),
    mappings: _0x1bdb1c.mappings
  };
}
function settleInterruptedCharacterAppearanceGenerations(_0x9ed1bd = {}) {
  const _0x520e69 = _0x9ed1bd && typeof _0x9ed1bd === "object" ? _0x9ed1bd : {};
  const _0x473351 = new Set(Array.isArray(_0x520e69.workspace?.generatingAppearanceKeys) ? _0x520e69.workspace.generatingAppearanceKeys.map(normalizeText).filter(Boolean) : []);
  let _0xfd0c99 = _0x473351.size > 0;
  const _0x68b10a = (Array.isArray(_0x520e69.characters) ? _0x520e69.characters : []).map(_0x3e6a3b => {
    let _0x3e8535 = false;
    const _0x2324ab = (Array.isArray(_0x3e6a3b?.appearances) ? _0x3e6a3b.appearances : []).map(_0x46be99 => {
      const _0xbbb15d = normalizeText(_0x3e6a3b?.id) + ":" + normalizeText(_0x46be99?.id);
      const _0x11d326 = normalizeText(_0x46be99?.generationStatus).toLowerCase();
      const _0x628923 = Boolean(normalizeText(_0x46be99?.imageUrl));
      const _0x2297de = _0x473351.has(_0xbbb15d);
      const _0x2c2f1d = ACTIVE_CHARACTER_APPEARANCE_STATUSES.has(_0x11d326);
      if (!_0x2297de && !_0x2c2f1d) {
        return _0x46be99;
      }
      if (_0x628923) {
        const _0x58e1da = _0x11d326 !== "succeeded" || Boolean(normalizeText(_0x46be99?.error));
        _0x3e8535 = _0x3e8535 || _0x58e1da;
        if (_0x58e1da) {
          return {
            ..._0x46be99,
            generationStatus: "succeeded",
            error: ""
          };
        } else {
          return _0x46be99;
        }
      }
      if (!_0x2c2f1d && ["failed", "cancelled"].includes(_0x11d326)) {
        return _0x46be99;
      }
      _0x3e8535 = true;
      return {
        ..._0x46be99,
        generationStatus: "failed",
        error: normalizeText(_0x46be99?.error) || INTERRUPTED_CHARACTER_APPEARANCE_ERROR
      };
    });
    if (!_0x3e8535) {
      return _0x3e6a3b;
    }
    _0xfd0c99 = true;
    return {
      ..._0x3e6a3b,
      appearances: _0x2324ab
    };
  });
  if (!_0xfd0c99) {
    return {
      project: _0x520e69,
      changed: false
    };
  }
  return {
    project: {
      ..._0x520e69,
      characters: _0x68b10a,
      workspace: {
        ..._0x520e69.workspace,
        generatingAppearanceKeys: []
      }
    },
    changed: true
  };
}
export function settleInterruptedReplacementStudioProjectTasks(_0x35f7f7 = {}) {
  const _0x39d4d3 = settleInterruptedCharacterAppearanceGenerations(_0x35f7f7);
  const _0x12b4de = _0x39d4d3.project;
  let _0x297256 = _0x39d4d3.changed;
  const _0xd56b12 = {
    ...(_0x12b4de.workspace || {})
  };
  const _0x1a7bb0 = new Set(Object.entries(_0xd56b12.videoGenerationsByShotId || {}).flatMap(([_0xb82ae5, _0x53385a]) => getRecoverablePersonReplacementVideoTask({
    ..._0x53385a,
    shotId: _0xb82ae5
  }) ? [normalizeText(_0xb82ae5)] : []));
  const _0x3bc69d = getRecoverablePersonReplacementVideoTask(_0xd56b12.videoGeneration);
  if (_0x3bc69d) {
    _0x1a7bb0.add(normalizeText(_0xd56b12.videoGeneration?.shotId));
  }
  const _0x11f691 = normalizeText(_0xd56b12.sourceAnalysis?.status).toLowerCase();
  if (ACTIVE_SOURCE_ANALYSIS_STATUSES.has(_0x11f691)) {
    _0xd56b12.sourceAnalysis = {
      ..._0xd56b12.sourceAnalysis,
      status: "failed",
      error: normalizeText(_0xd56b12.sourceAnalysis?.error) || INTERRUPTED_PROJECT_TASK_ERROR
    };
    _0x297256 = true;
  }
  const _0x4e19b9 = normalizeText(_0xd56b12.identityAnalysis?.status).toLowerCase();
  if (ACTIVE_RUNTIME_TASK_STATUSES.has(_0x4e19b9)) {
    _0xd56b12.identityAnalysis = {
      ..._0xd56b12.identityAnalysis,
      status: "failed",
      error: normalizeText(_0xd56b12.identityAnalysis?.error) || INTERRUPTED_PROJECT_TASK_ERROR
    };
    _0x297256 = true;
  }
  if (normalizeText(_0xd56b12.videoPreparation?.status).toLowerCase() === "running") {
    _0xd56b12.videoPreparation = {
      ..._0xd56b12.videoPreparation,
      status: "failed",
      error: normalizeText(_0xd56b12.videoPreparation?.error) || INTERRUPTED_PROJECT_TASK_ERROR
    };
    _0x297256 = true;
  }
  const _0x283e4e = (Array.isArray(_0x12b4de.sources) ? _0x12b4de.sources : []).map(_0x1f1f25 => {
    const _0x45da20 = normalizeText(_0x1f1f25?.processingStatus).toLowerCase();
    if (!ACTIVE_SOURCE_ANALYSIS_STATUSES.has(_0x45da20)) {
      return _0x1f1f25;
    }
    _0x297256 = true;
    if (_0x45da20 === "uploading" && normalizeText(_0x1f1f25?.videoRef)) {
      return {
        ..._0x1f1f25,
        processingStatus: "ready-to-start",
        error: ""
      };
    }
    return {
      ..._0x1f1f25,
      processingStatus: "failed",
      error: normalizeText(_0x1f1f25?.error) || INTERRUPTED_PROJECT_TASK_ERROR
    };
  });
  const _0x46e5f8 = (Array.isArray(_0x12b4de.shots) ? _0x12b4de.shots : []).map(_0x44dd59 => {
    let _0x23c718 = _0x44dd59;
    let _0x399cd7 = false;
    if (normalizeText(_0x44dd59?.analysisStatus).toLowerCase() === "running") {
      _0x23c718 = {
        ..._0x23c718,
        analysisStatus: "failed",
        reviewRequired: true
      };
      _0x399cd7 = true;
    }
    if (normalizeText(_0x44dd59?.materializationStatus).toLowerCase() === "running") {
      _0x23c718 = {
        ..._0x23c718,
        materializationStatus: normalizeText(_0x44dd59?.videoRef) && Boolean(_0x44dd59?.materializedIsReversed) === Boolean(_0x44dd59?.isReversed) ? "succeeded" : "failed",
        materializationProgress: normalizeText(_0x44dd59?.videoRef) && Boolean(_0x44dd59?.materializedIsReversed) === Boolean(_0x44dd59?.isReversed) ? 100 : 0
      };
      _0x399cd7 = _0x399cd7 || !normalizeText(_0x44dd59?.videoRef) || Boolean(_0x44dd59?.materializedIsReversed) !== Boolean(_0x44dd59?.isReversed);
    }
    if (ACTIVE_RUNTIME_TASK_STATUSES.has(normalizeText(_0x44dd59?.generationStatus).toLowerCase()) && !_0x1a7bb0.has(normalizeText(_0x44dd59?.id))) {
      _0x23c718 = {
        ..._0x23c718,
        generationStatus: normalizeText(_0x44dd59?.resultVideoRef) ? "succeeded" : "failed"
      };
      _0x399cd7 = _0x399cd7 || !normalizeText(_0x44dd59?.resultVideoRef);
    }
    if (!_0x399cd7 && _0x23c718 === _0x44dd59) {
      return _0x44dd59;
    }
    _0x297256 = true;
    return {
      ..._0x23c718,
      ...(_0x399cd7 ? {
        error: normalizeText(_0x44dd59?.error) || INTERRUPTED_PROJECT_TASK_ERROR
      } : {})
    };
  });
  const _0x210386 = (_0x163c10, _0x195d6d, {
    getRecoverableTask = null
  } = {}) => {
    const _0x20e0ac = normalizeText(_0x163c10?.status).toLowerCase();
    if (!ACTIVE_RUNTIME_TASK_STATUSES.has(_0x20e0ac)) {
      return _0x163c10;
    }
    if (typeof getRecoverableTask === "function" && getRecoverableTask(_0x163c10)) {
      return _0x163c10;
    }
    const _0x4157c8 = normalizeText(_0x163c10?.shotId);
    const _0x585e91 = _0x46e5f8.find(_0x34b5db => normalizeText(_0x34b5db?.id) === _0x4157c8);
    const _0x50442b = Boolean(normalizeText(_0x585e91?.[_0x195d6d]));
    _0x297256 = true;
    return {
      ..._0x163c10,
      status: _0x50442b ? "succeeded" : "failed",
      error: _0x50442b ? "" : normalizeText(_0x163c10?.error) || INTERRUPTED_PROJECT_TASK_ERROR
    };
  };
  _0xd56b12.imageGeneration = _0x210386(_0xd56b12.imageGeneration, "replacementImageRef", {
    getRecoverableTask: getRecoverablePersonReplacementImageTask
  });
  Object.entries(_0xd56b12.imageGenerationsByShotId || {}).forEach(([_0x5bb7e9, _0x84d8a8]) => {
    const _0x546393 = _0x210386({
      ..._0x84d8a8,
      shotId: _0x5bb7e9
    }, "replacementImageRef", {
      getRecoverableTask: getRecoverablePersonReplacementImageTask
    });
    Object.assign(_0xd56b12, updatePersonReplacementImageGenerationState(_0xd56b12, _0x546393));
  });
  _0xd56b12.videoGeneration = _0x210386(_0xd56b12.videoGeneration, "resultVideoRef", {
    getRecoverableTask: getRecoverablePersonReplacementVideoTask
  });
  Object.entries(_0xd56b12.videoGenerationsByShotId || {}).forEach(([_0x35fdc7, _0x9d9012]) => {
    const _0x59dacc = _0x210386({
      ..._0x9d9012,
      shotId: _0x35fdc7
    }, "resultVideoRef", {
      getRecoverableTask: getRecoverablePersonReplacementVideoTask
    });
    Object.assign(_0xd56b12, updatePersonReplacementVideoGenerationState(_0xd56b12, _0x59dacc));
  });
  if (!_0x297256) {
    return {
      project: _0x12b4de,
      changed: false
    };
  }
  return {
    project: {
      ..._0x12b4de,
      sources: _0x283e4e,
      shots: _0x46e5f8,
      workspace: _0xd56b12
    },
    changed: true
  };
}
export function createReplacementStudioProjectSession({
  initialProject = {},
  now = () => new Date().toISOString()
} = {}) {
  let _0x2f6610 = normalizeReplacementStudioApplicationProject(initialProject, {});
  let _0x3d9e74 = false;
  let _0xcd5dca = {
    rememberProject: null,
    presentProject: null,
    schedulePersistence: null
  };
  const _0x3caeec = new Set();
  const _0x2a7057 = () => {
    if (_0x3d9e74) {
      throw new Error("Replacement Studio Project Session has been destroyed");
    }
  };
  const _0x105ba9 = () => cloneJson(_0x2f6610);
  const _0x297066 = ({
    previousProject: _0x109870,
    reason: _0x2a4bd0,
    source: _0x35721d,
    presentation: _0x13e4c2,
    persist: _0x274c4d
  }) => {
    const _0x4c7740 = _0x105ba9();
    const _0xd1ad20 = cloneJson(_0x109870);
    const _0x222782 = Object.freeze({
      project: _0x4c7740,
      previousProject: _0xd1ad20,
      reason: _0x2a4bd0,
      source: _0x35721d,
      presentation: _0x13e4c2,
      persist: _0x274c4d
    });
    _0x3caeec.forEach(_0x3cf943 => _0x3cf943(_0x222782));
    _0xcd5dca.rememberProject?.(_0x4c7740);
    if (_0x13e4c2 !== "none") {
      _0xcd5dca.presentProject?.({
        project: _0x4c7740,
        presentation: _0x13e4c2,
        reason: _0x2a4bd0,
        source: _0x35721d
      });
    }
    if (_0x274c4d) {
      _0xcd5dca.schedulePersistence?.();
    }
  };
  const _0x3327a8 = (_0x3e74c3, {
    persist = true,
    presentation = "render",
    reason = "application-change",
    source = "application",
    touchUpdatedAt = true
  } = {}) => {
    _0x2a7057();
    if (!PRESENTATION_MODES.has(presentation)) {
      throw new TypeError("Unsupported Replacement Studio presentation mode: " + presentation);
    }
    const _0x1d9432 = _0x2f6610;
    const _0x5ca28c = _0x3e74c3 && typeof _0x3e74c3 === "object" ? _0x3e74c3 : {};
    _0x2f6610 = normalizeReplacementStudioApplicationProject({
      ..._0x5ca28c,
      ...(touchUpdatedAt ? {
        updatedAt: now()
      } : {})
    }, _0x1d9432);
    _0x297066({
      previousProject: _0x1d9432,
      reason: normalizeText(reason),
      source: normalizeText(source) || "application",
      presentation: presentation,
      persist: persist === true
    });
    return _0x105ba9();
  };
  return Object.freeze({
    connect(_0x48dfb6 = {}) {
      _0x2a7057();
      _0xcd5dca = {
        rememberProject: typeof _0x48dfb6.rememberProject === "function" ? _0x48dfb6.rememberProject : null,
        presentProject: typeof _0x48dfb6.presentProject === "function" ? _0x48dfb6.presentProject : null,
        schedulePersistence: typeof _0x48dfb6.schedulePersistence === "function" ? _0x48dfb6.schedulePersistence : null
      };
    },
    getProject: _0x105ba9,
    replace: _0x3327a8,
    commitWorkspaceProject(_0x565fa7, {
      reason = ""
    } = {}) {
      _0x2a7057();
      return _0x3327a8(reconcileWorkspaceProject(_0x2f6610, _0x565fa7 && typeof _0x565fa7 === "object" ? _0x565fa7 : {}, normalizeText(reason)), {
        persist: true,
        presentation: "none",
        reason: reason,
        source: "workspace"
      });
    },
    subscribe(_0xe3c0bb) {
      _0x2a7057();
      if (typeof _0xe3c0bb !== "function") {
        return () => {};
      }
      _0x3caeec.add(_0xe3c0bb);
      return () => _0x3caeec.delete(_0xe3c0bb);
    },
    destroy() {
      if (_0x3d9e74) {
        return;
      }
      _0x3d9e74 = true;
      _0x3caeec.clear();
      _0xcd5dca = {
        rememberProject: null,
        presentProject: null,
        schedulePersistence: null
      };
    }
  });
}