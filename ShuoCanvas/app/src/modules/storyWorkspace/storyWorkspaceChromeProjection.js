import { buildStoryEpisodeCanvasName } from "./storyEpisodeCanvas.js";
import { getStoryVideoEpisodes, isStoryWorkspaceStepNavigationDisabled } from "./storyWorkspaceNavigationTransaction.js";
function normalizeText(_0x1a02ca) {
  return String(_0x1a02ca ?? "").trim();
}
function freezeSnapshot(_0x5262cb) {
  if (Array.isArray(_0x5262cb)) {
    return Object.freeze(_0x5262cb.map(_0x37e6e5 => freezeSnapshot(_0x37e6e5)));
  }
  if (_0x5262cb && typeof _0x5262cb === "object") {
    return Object.freeze(Object.fromEntries(Object.entries(_0x5262cb).map(([_0x13059c, _0x4d14a2]) => [_0x13059c, freezeSnapshot(_0x4d14a2)])));
  }
  return _0x5262cb;
}
export function getStoryEpisodeToolbarOptions(_0x1fbf84 = [], _0x4965ba = "") {
  const _0x159639 = normalizeText(_0x4965ba);
  return getStoryVideoEpisodes(_0x1fbf84).filter(_0x2fc8a9 => normalizeText(_0x2fc8a9?.id) !== _0x159639 && Array.isArray(_0x2fc8a9?.clips) && _0x2fc8a9.clips.length > 0);
}
export function getStoryProjectCanvasEpisodes(_0x30bcd1 = [], _0x35b28e = "") {
  const _0x45d9da = getStoryVideoEpisodes(_0x30bcd1);
  const _0x4705cb = normalizeText(_0x35b28e);
  const _0x2d5e95 = _0x45d9da.find(_0x28d2a0 => normalizeText(_0x28d2a0?.id) === _0x4705cb) || _0x45d9da[0];
  if (_0x2d5e95) {
    return [_0x2d5e95];
  } else {
    return [];
  }
}
function projectEpisodeSwitcher(_0x2cab94, _0x4825f2, _0x1a0d3c) {
  return {
    currentEpisodeId: normalizeText(_0x4825f2?.id),
    currentEpisodeName: buildStoryEpisodeCanvasName(_0x4825f2) || "分集详情",
    isCurrentPage: _0x1a0d3c,
    options: getStoryEpisodeToolbarOptions(_0x2cab94.data?.episodes, _0x4825f2?.id).map(_0x2369a2 => ({
      id: _0x2369a2.id,
      name: buildStoryEpisodeCanvasName(_0x2369a2) || "分集详情",
      clipCount: _0x2369a2.clips.length
    }))
  };
}
export function createStoryWorkspaceChromeProjection({
  steps = []
} = {}) {
  function _0x5372a6(_0x37f426, _0x75be31 = _0x37f426.step) {
    const _0x20de07 = _0x37f426.data?.project?.sourceMode;
    const _0x5cd40f = _0x20de07 === "upload-original" ? steps.map(_0x4e00b3 => _0x4e00b3.id === 1 ? {
      ..._0x4e00b3,
      label: "原始剧本"
    } : _0x4e00b3) : _0x20de07 === "video-replication" ? steps.map(_0x5380a3 => _0x5380a3.id === 1 ? {
      ..._0x5380a3,
      label: "视频解析"
    } : _0x5380a3) : steps;
    return {
      activeStep: _0x75be31,
      items: _0x5cd40f.map(_0x25bfd1 => ({
        id: _0x25bfd1.id,
        label: _0x25bfd1.label,
        active: _0x75be31 === _0x25bfd1.id,
        disabled: isStoryWorkspaceStepNavigationDisabled(_0x37f426.data, _0x25bfd1.id)
      }))
    };
  }
  function _0x361559(_0x34d937 = {}) {
    if (_0x34d937.view === "episode") {
      const _0x488f28 = _0x34d937.data?.episodes?.find(_0x17a756 => _0x17a756.id === _0x34d937.selectedEpisodeId);
      return {
        kind: "episode",
        steps: _0x5372a6(_0x34d937, "episode"),
        episodeSwitcher: projectEpisodeSwitcher(_0x34d937, _0x488f28, true),
        canvasSyncPending: _0x34d937.canvasSyncPending === true
      };
    }
    const _0x183969 = getStoryEpisodeToolbarOptions(_0x34d937.data?.episodes);
    const _0x5cc4bb = _0x183969.find(_0xf6865d => normalizeText(_0xf6865d?.id) === normalizeText(_0x34d937.selectedEpisodeId)) || _0x183969[0] || null;
    return {
      kind: "project",
      steps: _0x5372a6(_0x34d937),
      episodeSwitcher: _0x5cc4bb ? projectEpisodeSwitcher(_0x34d937, _0x5cc4bb, false) : null
    };
  }
  function _0x38abd0(_0x499c09 = {}, {
    nextLabel: _0x8db99b,
    nextAction: _0x458093 = "",
    isLast = false,
    title = "",
    hint = "",
    actionsMarkup = ""
  } = {}) {
    const _0x54b79e = _0x458093 || (isLast ? "finish-story-workbench" : _0x499c09.step === 1 ? "extract-assets" : "open-episode-stage");
    const _0x356c7e = Boolean(_0x499c09.storyPlanningOperation);
    const _0x2a21f0 = _0x499c09.storyPlanningStatus || _0x8db99b || "处理中";
    const _0x47f03e = title || (_0x458093 === "plan-episode-outlines" ? "剧本摘要已完成" : _0x458093 === "extract-assets" ? "完整分集剧本已全部完成" : _0x499c09.step === 2 ? "角色、场景和道具设定已应用" : "分集结构已建立");
    const _0x4dade9 = hint || (_0x458093 === "plan-episode-outlines" ? "下一步将按已设置集数生成分集大纲" : _0x458093 === "extract-assets" ? "下一步沿用现有素材、分镜和视频流程" : isLast ? "进入分集后可编辑片段并选择视频模型" : "可以继续下一步，也可以返回修改");
    return {
      title: _0x47f03e,
      hint: _0x4dade9,
      actionsMarkup: actionsMarkup,
      showPrevious: _0x499c09.step > 1,
      nextAction: _0x54b79e,
      nextLabel: _0x356c7e ? _0x2a21f0 : _0x8db99b || "下一步",
      busy: _0x356c7e
    };
  }
  return Object.freeze({
    projectFooter: (..._0x59ed36) => freezeSnapshot(_0x38abd0(..._0x59ed36)),
    projectToolbar: (..._0x532cf7) => freezeSnapshot(_0x361559(..._0x532cf7))
  });
}