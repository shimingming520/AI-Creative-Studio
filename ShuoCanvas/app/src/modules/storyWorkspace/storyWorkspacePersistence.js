export const STORY_WORKSPACE_PERSISTENCE_VERSION = 1;
function cloneJson(_0x5db5fe) {
  if (!_0x5db5fe || typeof _0x5db5fe !== "object") {
    return _0x5db5fe;
  }
  return JSON.parse(JSON.stringify(_0x5db5fe));
}
function normalizeText(_0x5589a3) {
  return String(_0x5589a3 || "").trim();
}
function normalizeEpisodeAssetRailTab(_0x153fc0) {
  const _0x26a7f5 = normalizeText(_0x153fc0);
  if (["assets", "frames", "library"].includes(_0x26a7f5)) {
    return _0x26a7f5;
  } else {
    return "assets";
  }
}
function clonePersistableStoryData(_0x4aed28) {
  const _0x52ac82 = cloneJson(_0x4aed28);
  if (!_0x52ac82 || typeof _0x52ac82 !== "object") {
    return _0x52ac82;
  }
  if (Array.isArray(_0x52ac82.clipFrames)) {
    _0x52ac82.clipFrames = _0x52ac82.clipFrames.filter(_0x286a03 => _0x286a03?.captureSavePending !== true && _0x286a03?.isTransient !== true && ![_0x286a03?.imageUrl, _0x286a03?.videoUrl, _0x286a03?.thumbUrl, _0x286a03?.posterUrl].some(_0x315d6a => normalizeText(_0x315d6a).startsWith("blob:")));
  }
  return _0x52ac82;
}
function clonePersistableProjects(_0x28420e) {
  return (Array.isArray(_0x28420e) ? _0x28420e : []).map(_0x5c3047 => {
    const _0x1b1cc1 = cloneJson(_0x5c3047);
    if (_0x1b1cc1?.data) {
      _0x1b1cc1.data = clonePersistableStoryData(_0x1b1cc1.data);
    }
    return _0x1b1cc1;
  });
}
export function createStoryWorkspaceSnapshot(_0x5d2abf = {}) {
  const _0x1d7da6 = Array.isArray(_0x5d2abf.projects) ? _0x5d2abf.projects : [];
  return {
    schemaVersion: STORY_WORKSPACE_PERSISTENCE_VERSION,
    savedAt: Date.now(),
    activeProjectId: normalizeText(_0x5d2abf.data?.project?.id),
    hasCreatedProject: _0x5d2abf.hasCreatedProject === true,
    projectTitleEdited: _0x5d2abf.projectTitleEdited === true,
    projects: clonePersistableProjects(_0x1d7da6),
    currentData: clonePersistableStoryData(_0x5d2abf.data),
    models: cloneJson(_0x5d2abf.models || {}),
    modelProviders: {
      text: normalizeText(_0x5d2abf.textProvider),
      image: normalizeText(_0x5d2abf.imageProvider),
      video: normalizeText(_0x5d2abf.videoProvider)
    },
    modelProviderProfiles: {
      text: normalizeText(_0x5d2abf.textProviderProfileId),
      video: normalizeText(_0x5d2abf.videoProviderProfileId),
      videoByModel: cloneJson(_0x5d2abf.videoProviderProfileIdByModel || {})
    },
    modelParams: {
      image: cloneJson(_0x5d2abf.imageGenerationParams || {}),
      imageByModel: cloneJson(_0x5d2abf.imageGenerationParamsByModel || {}),
      video: cloneJson(_0x5d2abf.videoGenerationParams || {}),
      videoByModel: cloneJson(_0x5d2abf.videoGenerationParamsByModel || {})
    },
    ui: {
      view: normalizeText(_0x5d2abf.view) || "home",
      step: Number(_0x5d2abf.step) || 1,
      homeTab: ["upload", "generate", "replication"].includes(_0x5d2abf.homeTab) ? _0x5d2abf.homeTab : "upload",
      replicationTargetLocale: normalizeText(_0x5d2abf.replicationTargetLocale) || "zh-CN",
      scriptMode: _0x5d2abf.scriptMode === "narration" ? "narration" : "plot",
      uploadInputMode: _0x5d2abf.uploadInputMode === "paste" ? "paste" : "file",
      idea: String(_0x5d2abf.idea || ""),
      scriptFileName: String(_0x5d2abf.scriptFileName || ""),
      scriptText: String(_0x5d2abf.scriptText || ""),
      scriptCharacterCount: Number.isFinite(_0x5d2abf.scriptCharacterCount) ? _0x5d2abf.scriptCharacterCount : null,
      assetFilter: normalizeText(_0x5d2abf.assetFilter) || "character",
      assetSplitRatio: Number(_0x5d2abf.assetSplitRatio) || 50,
      episodeAssetPanelRatio: Number(_0x5d2abf.episodeAssetPanelRatio) || 22,
      episodeEditorPanelRatio: Number(_0x5d2abf.episodeEditorPanelRatio) || 34,
      episodeAssetRailTab: normalizeEpisodeAssetRailTab(_0x5d2abf.episodeAssetRailTab),
      assetAppearanceIndexes: cloneJson(_0x5d2abf.assetAppearanceIndexes || {}),
      outlineSectionOpenState: cloneJson(_0x5d2abf.outlineSectionOpenState || {}),
      pageScrollPositions: cloneJson(_0x5d2abf.pageScrollPositions || {}),
      experimentalSplitMode: _0x5d2abf.experimentalSplitMode === true,
      selectedAssetId: normalizeText(_0x5d2abf.selectedAssetId),
      selectedEpisodeId: normalizeText(_0x5d2abf.selectedEpisodeId),
      selectedClipId: normalizeText(_0x5d2abf.selectedClipId),
      characterVoiceEditor: _0x5d2abf.characterVoiceEditor ? {
        ...cloneJson(_0x5d2abf.characterVoiceEditor),
        isGenerating: false
      } : null
    }
  };
}
export function normalizeStoryWorkspaceSnapshot(_0x5265b0) {
  if (!_0x5265b0 || typeof _0x5265b0 !== "object" || Array.isArray(_0x5265b0)) {
    return null;
  }
  if (Number(_0x5265b0.schemaVersion) !== STORY_WORKSPACE_PERSISTENCE_VERSION) {
    return null;
  }
  if (!_0x5265b0.currentData?.project || !Array.isArray(_0x5265b0.currentData?.episodes)) {
    return null;
  }
  return {
    ..._0x5265b0,
    projects: Array.isArray(_0x5265b0.projects) ? cloneJson(_0x5265b0.projects) : [],
    currentData: cloneJson(_0x5265b0.currentData),
    models: _0x5265b0.models && typeof _0x5265b0.models === "object" ? cloneJson(_0x5265b0.models) : {},
    modelProviders: _0x5265b0.modelProviders && typeof _0x5265b0.modelProviders === "object" ? cloneJson(_0x5265b0.modelProviders) : {},
    modelProviderProfiles: _0x5265b0.modelProviderProfiles && typeof _0x5265b0.modelProviderProfiles === "object" ? cloneJson(_0x5265b0.modelProviderProfiles) : {},
    modelParams: _0x5265b0.modelParams && typeof _0x5265b0.modelParams === "object" ? cloneJson(_0x5265b0.modelParams) : {},
    ui: _0x5265b0.ui && typeof _0x5265b0.ui === "object" ? cloneJson(_0x5265b0.ui) : {}
  };
}
export function isEmptyStoryWorkspaceSnapshotPayload(_0x142b9c) {
  return _0x142b9c == null || typeof _0x142b9c === "object" && !Array.isArray(_0x142b9c) && Object.keys(_0x142b9c).length === 0;
}
export function parseStoryWorkspaceSnapshotPayload(_0x2804c5) {
  const _0x42ebf2 = normalizeStoryWorkspaceSnapshot(_0x2804c5);
  if (!_0x42ebf2 && !isEmptyStoryWorkspaceSnapshotPayload(_0x2804c5)) {
    throw new Error("剧本工作室存档格式无效");
  }
  return _0x42ebf2;
}
export function mergeStoryWorkspaceHydratedProjects(_0x2c1847 = [], _0x4ec2ff = []) {
  const _0x49dcea = Array.isArray(_0x2c1847) ? [..._0x2c1847] : [];
  const _0x3fc6e2 = _0x4c2b72 => String(_0x4c2b72?.id || _0x4c2b72?.data?.project?.id || "").trim();
  const _0x3ab0ed = new Set(_0x49dcea.map(_0x3fc6e2));
  (Array.isArray(_0x4ec2ff) ? _0x4ec2ff : []).forEach(_0x3abefc => {
    const _0x5c4770 = _0x3fc6e2(_0x3abefc);
    if (!_0x5c4770 || _0x3ab0ed.has(_0x5c4770)) {
      return;
    }
    _0x49dcea.push(_0x3abefc);
    _0x3ab0ed.add(_0x5c4770);
  });
  return _0x49dcea;
}
export function hasStoryWorkspaceSnapshotChanged(_0x51e0d5, _0x458c7f) {
  if (_0x51e0d5 === _0x458c7f) {
    return false;
  }
  if (!_0x51e0d5 || !_0x458c7f) {
    return true;
  }
  try {
    const _0x51dec3 = cloneJson(_0x51e0d5);
    const _0x8b46e9 = cloneJson(_0x458c7f);
    delete _0x51dec3.savedAt;
    delete _0x8b46e9.savedAt;
    return JSON.stringify(_0x51dec3) !== JSON.stringify(_0x8b46e9);
  } catch {
    return true;
  }
}