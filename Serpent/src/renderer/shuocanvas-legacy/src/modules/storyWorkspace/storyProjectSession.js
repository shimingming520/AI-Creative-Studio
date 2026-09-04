import { getWorkspaceProjectHomeEntries, normalizeWorkspaceProjectSortOrder } from "../workspaceProjectHome.js";
import { canEnterStoryWorkspaceStep, normalizeStoryWorkspaceStep } from "./storyWorkspaceNavigationTransaction.js";
import { normalizeStoryAssetSplitRatio, normalizeStoryEpisodePanelRatios } from "./storyWorkspaceInteractions.js";
import { settleInterruptedStoryVideoReplication } from "./storyVideoReplication.js";
export const STORY_ASSET_TAB_LABELS = Object.freeze({
  character: "角色",
  scene: "场景",
  prop: "道具",
  library: "总素材"
});
const STORY_EPISODE_ASSET_RAIL_TABS = new Set(["assets", "frames", "library"]);
function normalizeText(_0xbb6363) {
  return String(_0xbb6363 || "").trim();
}
export function normalizeStoryEpisodeAssetRailTab(_0x1f534b) {
  const _0x11c2b = normalizeText(_0x1f534b);
  if (STORY_EPISODE_ASSET_RAIL_TABS.has(_0x11c2b)) {
    return _0x11c2b;
  } else {
    return "assets";
  }
}
export function removeStoryProjectEntry(_0x654ab6 = [], _0x213844 = "") {
  const _0x3ec6e9 = normalizeText(_0x213844);
  if (!_0x3ec6e9 || !Array.isArray(_0x654ab6)) {
    if (Array.isArray(_0x654ab6)) {
      return [..._0x654ab6];
    } else {
      return [];
    }
  }
  return _0x654ab6.filter(_0x2ac906 => normalizeText(_0x2ac906?.id || _0x2ac906?.data?.project?.id) !== _0x3ec6e9);
}
export function normalizeStoryProjectSortOrder(_0x18a38d) {
  return normalizeWorkspaceProjectSortOrder(_0x18a38d);
}
export function getStoryProjectHomeEntries(_0x3c58cd = [], {
  query = "",
  sortOrder = "updated-desc",
  showArchived = false
} = {}) {
  return getWorkspaceProjectHomeEntries(_0x3c58cd, {
    query: query,
    sortOrder: sortOrder,
    showArchived: showArchived
  });
}
function hasStoryProjectClipVideoResult(_0x54982b = {}) {
  if (normalizeText(_0x54982b?.result?.videoUrl || _0x54982b?.videoUrl || _0x54982b?.resultUrl)) {
    return true;
  }
  return (Array.isArray(_0x54982b?.video?.results) ? _0x54982b.video.results : []).some(_0x438d15 => normalizeText(_0x438d15?.videoUrl || _0x438d15?.url || _0x438d15?.displayUrl || _0x438d15?.localPath || _0x438d15?.displayLocalPath));
}
function resetStoryProjectCopyClipRuntime(_0x2741d4 = {}) {
  const _0x66b488 = {
    ..._0x2741d4
  };
  const _0x2a3ec1 = hasStoryProjectClipVideoResult(_0x66b488);
  const _0x4b80ed = _0x66b488.generation && typeof _0x66b488.generation === "object" ? {
    ..._0x66b488.generation
  } : null;
  if (_0x4b80ed) {
    const _0x3deee7 = normalizeText(_0x4b80ed.status).toLowerCase();
    const _0x247eab = ["pending", "queued", "recovering", "running", "submitting"].includes(_0x3deee7);
    _0x66b488.generation = {
      ..._0x4b80ed,
      ...(_0x247eab ? {
        status: _0x2a3ec1 ? "succeeded" : "idle"
      } : {}),
      taskId: "",
      remoteTaskId: "",
      startedAt: 0
    };
  }
  if (_0x66b488.result && typeof _0x66b488.result === "object") {
    const _0xec04d7 = {
      ..._0x66b488.result
    };
    const _0x28c0a1 = normalizeText(_0xec04d7.status).toLowerCase();
    const _0xf6acac = ["pending", "queued", "recovering", "running", "submitting"].includes(_0x28c0a1);
    _0x66b488.result = {
      ..._0xec04d7,
      ...(_0xf6acac ? {
        status: _0x2a3ec1 ? "succeeded" : "idle"
      } : {}),
      taskId: ""
    };
  }
  return _0x66b488;
}
export function duplicateStoryProjectEntry(_0x206cf5 = {}, {
  projectId = "",
  now = Date.now()
} = {}) {
  const _0x48faa3 = _0x206cf5 && typeof _0x206cf5 === "object" && !Array.isArray(_0x206cf5) ? _0x206cf5 : null;
  const _0x3aaf6b = _0x48faa3?.data;
  if (!_0x3aaf6b?.project) {
    return null;
  }
  const _0x464bc4 = normalizeText(projectId) || "story-" + Math.max(1, Number(now) || Date.now()) + "-copy";
  const _0x444972 = JSON.parse(JSON.stringify(_0x48faa3));
  const _0x29aa8f = (normalizeText(_0x3aaf6b.project.title || _0x48faa3.title) || "未命名故事") + " 副本";
  const _0x349015 = _0x444972.data;
  _0x349015.project = {
    ..._0x349015.project,
    id: _0x464bc4,
    title: _0x29aa8f,
    backgroundTasks: []
  };
  if (_0x349015.project.summaryStatus === "generating") {
    _0x349015.project.summaryStatus = normalizeText(_0x349015.project.summary) ? "completed" : "pending";
  }
  if (_0x349015.project.outlineStatus === "generating") {
    _0x349015.project.outlineStatus = Array.isArray(_0x349015.episodes) && _0x349015.episodes.length ? "completed" : "pending";
  }
  _0x349015.episodes = (Array.isArray(_0x349015.episodes) ? _0x349015.episodes : []).map(_0x4c43a7 => ({
    ..._0x4c43a7,
    clips: (Array.isArray(_0x4c43a7?.clips) ? _0x4c43a7.clips : []).map(resetStoryProjectCopyClipRuntime)
  }));
  settleInterruptedStoryVideoReplication(_0x349015, {
    message: "副本不会继续原项目中的视频解析任务，请点击重试。"
  });
  return {
    ..._0x444972,
    id: _0x464bc4,
    title: _0x29aa8f,
    createdAt: Number(now) || Date.now(),
    updatedAt: Number(now) || Date.now(),
    archivedAt: 0,
    projectTitleEdited: true,
    data: _0x349015
  };
}
function cloneStoryProjectUiValue(_0x3830ca, _0x42c567) {
  if (!_0x3830ca || typeof _0x3830ca !== "object") {
    return _0x42c567;
  }
  try {
    return JSON.parse(JSON.stringify(_0x3830ca));
  } catch {
    return _0x42c567;
  }
}
export function normalizeStoryProjectVoiceEditor(_0x413d9a, _0x33685f) {
  const _0x248db1 = cloneStoryProjectUiValue(_0x413d9a, null);
  if (!_0x248db1 || Array.isArray(_0x248db1)) {
    return null;
  }
  const _0x2201e5 = normalizeText(_0x248db1.assetId);
  const _0x354d87 = (Array.isArray(_0x33685f?.assets) ? _0x33685f.assets : []).find(_0x4cd4f5 => normalizeText(_0x4cd4f5?.id) === _0x2201e5 && _0x4cd4f5?.kind === "character");
  if (!_0x354d87) {
    return null;
  }
  return {
    ..._0x248db1,
    assetId: _0x2201e5,
    isGenerating: false
  };
}
export function createStoryProjectUiState(_0x7a40e = {}) {
  return {
    view: _0x7a40e.view === "episode" ? "episode" : "project",
    step: normalizeStoryWorkspaceStep(_0x7a40e.step),
    assetFilter: Object.hasOwn(STORY_ASSET_TAB_LABELS, _0x7a40e.assetFilter) ? _0x7a40e.assetFilter : "character",
    assetSplitRatio: normalizeStoryAssetSplitRatio(_0x7a40e.assetSplitRatio),
    episodeAssetPanelRatio: normalizeStoryEpisodePanelRatios(_0x7a40e.episodeAssetPanelRatio, _0x7a40e.episodeEditorPanelRatio).left,
    episodeEditorPanelRatio: normalizeStoryEpisodePanelRatios(_0x7a40e.episodeAssetPanelRatio, _0x7a40e.episodeEditorPanelRatio).center,
    episodeAssetRailTab: normalizeStoryEpisodeAssetRailTab(_0x7a40e.episodeAssetRailTab),
    assetAppearanceIndexes: cloneStoryProjectUiValue(_0x7a40e.assetAppearanceIndexes, {}),
    outlineSectionOpenState: cloneStoryProjectUiValue(_0x7a40e.outlineSectionOpenState, {}),
    pageScrollPositions: cloneStoryProjectUiValue(_0x7a40e.pageScrollPositions, {}),
    selectedAssetId: normalizeText(_0x7a40e.selectedAssetId),
    selectedEpisodeId: normalizeText(_0x7a40e.selectedEpisodeId),
    selectedClipId: normalizeText(_0x7a40e.selectedClipId),
    characterVoiceEditor: _0x7a40e.characterVoiceEditor ? {
      ...cloneStoryProjectUiValue(_0x7a40e.characterVoiceEditor, {}),
      isGenerating: false
    } : null,
    assetBreakdownVisibleCount: Math.max(0, Math.trunc(Number(_0x7a40e.assetBreakdownVisibleCount) || 0))
  };
}
export function applyStoryLibraryAdditionUiState(_0x396035 = {}, {
  targetAssetId = "",
  selectedAppearanceIndex = 0
} = {}) {
  if (!_0x396035 || typeof _0x396035 !== "object" || Array.isArray(_0x396035)) {
    return _0x396035;
  }
  const _0x3c609f = normalizeText(targetAssetId);
  if (_0x3c609f) {
    _0x396035.assetAppearanceIndexes = {
      ...(_0x396035.assetAppearanceIndexes || {}),
      [_0x3c609f]: Math.max(0, Math.trunc(Number(selectedAppearanceIndex) || 0))
    };
  }
  _0x396035.assetSelectionMode = false;
  _0x396035.selectedAssetIds = [];
  return _0x396035;
}
export function applyStoryProjectUiState(_0x45b3d3 = {}, _0x5f21e8 = {}, _0x56f85c = _0x45b3d3.data) {
  if (!_0x45b3d3 || typeof _0x45b3d3 !== "object") {
    return _0x45b3d3;
  }
  const _0x6617d8 = _0x5f21e8 && typeof _0x5f21e8 === "object" && !Array.isArray(_0x5f21e8) ? _0x5f21e8 : {};
  const _0x3c87c2 = Array.isArray(_0x56f85c?.episodes) ? _0x56f85c.episodes : [];
  const _0xf3ad11 = Array.isArray(_0x56f85c?.assets) ? _0x56f85c.assets : [];
  const _0x290c9b = normalizeStoryWorkspaceStep(_0x6617d8.step);
  _0x45b3d3.step = _0x56f85c?.project?.outlineStatus !== "stale" && canEnterStoryWorkspaceStep(_0x56f85c, _0x290c9b) ? _0x290c9b : 1;
  _0x45b3d3.assetFilter = Object.hasOwn(STORY_ASSET_TAB_LABELS, _0x6617d8.assetFilter) ? _0x6617d8.assetFilter : "character";
  _0x45b3d3.assetSplitRatio = normalizeStoryAssetSplitRatio(_0x6617d8.assetSplitRatio);
  const _0x13c94e = normalizeStoryEpisodePanelRatios(_0x6617d8.episodeAssetPanelRatio, _0x6617d8.episodeEditorPanelRatio);
  _0x45b3d3.episodeAssetPanelRatio = _0x13c94e.left;
  _0x45b3d3.episodeEditorPanelRatio = _0x13c94e.center;
  _0x45b3d3.episodeAssetRailTab = normalizeStoryEpisodeAssetRailTab(_0x6617d8.episodeAssetRailTab);
  _0x45b3d3.assetAppearanceIndexes = cloneStoryProjectUiValue(_0x6617d8.assetAppearanceIndexes, {});
  _0x45b3d3.outlineSectionOpenState = cloneStoryProjectUiValue(_0x6617d8.outlineSectionOpenState, {});
  _0x45b3d3.pageScrollPositions = cloneStoryProjectUiValue(_0x6617d8.pageScrollPositions, {});
  const _0x3cbda3 = normalizeText(_0x6617d8.selectedAssetId);
  _0x45b3d3.selectedAssetId = _0x45b3d3.assetFilter === "library" || _0xf3ad11.some(_0x10b8fe => normalizeText(_0x10b8fe?.id) === _0x3cbda3) ? _0x3cbda3 : normalizeText(_0xf3ad11.find(_0x45e525 => _0x45e525?.kind === _0x45b3d3.assetFilter)?.id || _0xf3ad11[0]?.id);
  const _0x40fc5a = normalizeText(_0x6617d8.selectedEpisodeId);
  const _0x870668 = _0x3c87c2.find(_0x16fa48 => normalizeText(_0x16fa48?.id) === _0x40fc5a) || _0x3c87c2[0] || null;
  _0x45b3d3.selectedEpisodeId = normalizeText(_0x870668?.id);
  const _0x3121ec = normalizeText(_0x6617d8.selectedClipId);
  const _0x5aa59f = Array.isArray(_0x870668?.clips) ? _0x870668.clips : [];
  _0x45b3d3.selectedClipId = normalizeText(_0x5aa59f.find(_0x155d76 => normalizeText(_0x155d76?.id) === _0x3121ec)?.id || _0x5aa59f[0]?.id);
  _0x45b3d3.characterVoiceEditor = normalizeStoryProjectVoiceEditor(_0x6617d8.characterVoiceEditor, _0x56f85c);
  _0x45b3d3.view = _0x6617d8.view === "episode" && canEnterStoryWorkspaceStep(_0x56f85c, 3) && Boolean(_0x870668) ? "episode" : "project";
  if (_0x45b3d3.view === "episode") {
    _0x45b3d3.step = 3;
  }
  _0x45b3d3.assetBreakdownVisibleCount = Math.max(0, Math.trunc(Number(_0x6617d8.assetBreakdownVisibleCount) || 0));
  return _0x45b3d3;
}