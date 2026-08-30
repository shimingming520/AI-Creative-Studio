import { renderAIGenTextModelSelectorMarkup } from "../../components/aigenText/modelSelector.js";
import { renderAIGenVideoModelSelectorMarkup } from "../../components/aigenVideo/modelSelector.js";
import { renderVideoPromptEditorMarkup, renderVideoReferenceBarMarkup } from "../../components/video-node/promptInputSurface.js";
import { getWorkspaceProjectHomeEntries, renderWorkspaceProjectCard, renderWorkspaceProjectSortControl } from "../workspaceProjectHome.js";
import { renderWorkspaceAssetSettingsShell } from "../workspaceAssetSettingsShell.js";
import { renderWorkspaceAssetCard, renderWorkspaceCardDeleteControl, renderWorkspaceAssetTabIcon } from "../workspaceAssetPresentation.js";
import { getDisplayModelName } from "../providers.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { getVideoReplicationProjectTaskSummary } from "./videoReplicationProject.js";
import { VIDEO_REPLICATION_STUDIO_NAME } from "./videoReplicationStudioTerminology.js";
export const VIDEO_REPLICATION_CLIP_LIMIT_OPTIONS = Object.freeze([15, 30]);
function escapeHtml(_0x13fc3a) {
  return String(_0x13fc3a ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x5c2e8e, _0x5cb70c = "") {
  const _0x74fdc = String(_0x5c2e8e ?? "").trim();
  return _0x74fdc || _0x5cb70c;
}
function normalizeClipLimit(_0xed714d) {
  const _0x4cd339 = Number(_0xed714d);
  if (VIDEO_REPLICATION_CLIP_LIMIT_OPTIONS.includes(_0x4cd339)) {
    return _0x4cd339;
  } else {
    return 15;
  }
}
function getSelectedVideoSummary(_0x5dcbda = []) {
  const _0x45e83b = _0x5dcbda.map(_0xf0d350 => normalizeText(_0xf0d350?.name || _0xf0d350?.fileName)).filter(Boolean);
  if (!_0x45e83b.length) {
    return "";
  }
  const _0x510b7a = _0x45e83b.slice(0, 3).join("、");
  const _0x482d68 = Math.max(0, _0x45e83b.length - 3);
  if (_0x482d68) {
    return _0x510b7a + "，另有 " + _0x482d68 + " 个视频";
  } else {
    return _0x510b7a;
  }
}
function getProjectStatusLabel(_0x3aff3e = {}) {
  if (_0x3aff3e.status === "analyzing") {
    return "片段准备中";
  }
  if (_0x3aff3e.status === "ready") {
    return "片段已就绪";
  }
  if (_0x3aff3e.status === "partial") {
    return "部分片段就绪";
  }
  if (_0x3aff3e.status === "failed") {
    return "片段准备失败";
  }
  return "制作中";
}
function resolveGeneratedVideoRef(_0x28cd6a = {}) {
  const _0x39c9ae = Array.isArray(_0x28cd6a?.video?.results) ? _0x28cd6a.video.results : [];
  const _0x57734b = Math.max(0, Math.min(_0x39c9ae.length - 1, Math.trunc(Number(_0x28cd6a?.video?.activeIndex) || 0)));
  const _0x168120 = _0x39c9ae[_0x57734b] || null;
  return normalizeText(_0x168120?.localPath || _0x168120?.videoUrl || _0x168120?.url);
}
function getProjectCoverImageUrls(_0x3a6f95 = {}) {
  return (Array.isArray(_0x3a6f95.episodes) ? _0x3a6f95.episodes : []).flatMap(_0x308ab9 => Array.isArray(_0x308ab9.clips) ? _0x308ab9.clips : []).map(_0x3e1a0c => resolveGeneratedVideoRef(_0x3e1a0c) || normalizeText(_0x3e1a0c?.posterRef || _0x3e1a0c?.thumbnailRef)).filter(Boolean).slice(0, 3).map(_0x31e034 => localPathToUrl(_0x31e034) || _0x31e034);
}
function formatClockTime(_0x18db34) {
  const _0x2e79a8 = Math.max(0, Number(_0x18db34) || 0);
  const _0x549a4f = Math.floor(_0x2e79a8);
  const _0x5e80d7 = Math.floor(_0x549a4f / 60);
  const _0x5ac441 = _0x549a4f % 60;
  return String(_0x5e80d7).padStart(2, "0") + ":" + String(_0x5ac441).padStart(2, "0");
}
function formatClipRange(_0x15ba6f = {}) {
  return formatClockTime(_0x15ba6f.startTimeSec) + "–" + formatClockTime(_0x15ba6f.endTimeSec);
}
function getAssetCollection(_0x362d7d = {}, _0x5b77bb = "character") {
  if (_0x5b77bb === "scene") {
    if (Array.isArray(_0x362d7d.scenes)) {
      return _0x362d7d.scenes;
    } else {
      return [];
    }
  }
  if (_0x5b77bb === "prop") {
    if (Array.isArray(_0x362d7d.props)) {
      return _0x362d7d.props;
    } else {
      return [];
    }
  }
  if (Array.isArray(_0x362d7d.characters)) {
    return _0x362d7d.characters;
  } else {
    return [];
  }
}
function getAssetKindLabel(_0x3f6ea0) {
  if (_0x3f6ea0 === "scene") {
    return "场景";
  } else if (_0x3f6ea0 === "prop") {
    return "道具";
  } else {
    return "人物";
  }
}
function normalizeAssetForRender(_0x3d6895 = {}, _0x5ad07f = "character") {
  const _0x4af1d7 = normalizeText(_0x3d6895.imageRef || _0x3d6895.imageUrl || _0x3d6895.sourceUrl);
  return {
    ..._0x3d6895,
    kind: _0x5ad07f,
    imageRef: _0x4af1d7,
    imageUrl: localPathToUrl(_0x4af1d7) || _0x4af1d7
  };
}
function renderProjectCard(_0x587927 = {}, _0x3dfe17 = {}) {
  const _0x3eb872 = Array.isArray(_0x587927.episodes) ? _0x587927.episodes : [];
  const _0x49b8bb = _0x3eb872.reduce((_0x47de62, _0x35fc73) => _0x47de62 + (Array.isArray(_0x35fc73.clips) ? _0x35fc73.clips.length : 0), 0);
  return renderWorkspaceProjectCard(_0x587927, {
    isDeleteConfirming: _0x3dfe17.pendingDeleteProjectId === _0x587927.id,
    isMenuOpen: _0x3dfe17.openProjectMenuId === _0x587927.id,
    fallbackTitle: "未命名复刻项目",
    itemCount: _0x49b8bb,
    itemLabel: "个片段",
    coverImageUrls: getProjectCoverImageUrls(_0x587927),
    emptyCoverLabel: "复刻项目",
    coverAltPrefix: "复刻项目封面",
    taskSummary: getVideoReplicationProjectTaskSummary(_0x587927)
  });
}
export function renderVideoReplicationHome({
  sourceFiles = [],
  clipLimitSeconds = 15,
  useSourceVideoReference = true,
  promptModelId = "",
  textProvider = "",
  textProviderProfileId = "",
  analysisAvailable = false,
  projects = [],
  isAnalyzing = false,
  projectSearchQuery = "",
  projectSortOrder = "updated-desc",
  showArchivedProjects = false,
  openProjectMenuId = "",
  pendingDeleteProjectId = ""
} = {}) {
  const _0x3fb90d = Array.isArray(sourceFiles) ? sourceFiles : [];
  const _0x5f3dce = Array.isArray(projects) ? projects : [];
  const _0x4226dc = normalizeClipLimit(clipLimitSeconds);
  const _0x1e6716 = getSelectedVideoSummary(_0x3fb90d);
  const _0x42b3a8 = _0x3fb90d.length > 0;
  const _0x508ce2 = _0x5f3dce.filter(_0x3ef070 => Number(_0x3ef070.archivedAt || 0) > 0).length;
  const _0x245f13 = getWorkspaceProjectHomeEntries(_0x5f3dce, {
    query: projectSearchQuery,
    sortOrder: projectSortOrder,
    showArchived: showArchivedProjects
  });
  const _0x1b5ab4 = VIDEO_REPLICATION_CLIP_LIMIT_OPTIONS.map(_0x489cfe => "<button type=\"button\" class=\"story-secondary-button" + (_0x4226dc === _0x489cfe ? " is-active" : "") + "\" data-video-replication-action=\"set-clip-limit\" data-clip-limit-seconds=\"" + _0x489cfe + "\" aria-pressed=\"" + (_0x4226dc === _0x489cfe) + "\"" + (isAnalyzing ? " disabled" : "") + ">" + _0x489cfe + " 秒</button>").join("");
  return "<main class=\"story-home-page\" data-video-replication-home>\n    <section class=\"story-home-hero\">\n      <span class=\"story-eyebrow\">SHUO Canvas · " + VIDEO_REPLICATION_STUDIO_NAME + "</span>\n      <h1>上传参考视频，建立可批量生成的分集片段</h1>\n      <div class=\"story-home-composer" + (isAnalyzing ? " is-generating" : "") + "\" aria-busy=\"" + isAnalyzing + "\">\n        <div class=\"story-home-composer-body\">\n          <div class=\"story-home-composer-panel story-upload-drop " + (_0x42b3a8 ? "has-sources" : "") + "\" data-video-replication-drop>\n            <strong>" + (_0x42b3a8 ? "已选择 " + _0x3fb90d.length + " 个视频" : "导入参考视频") + "</strong>\n            <p>" + (_0x42b3a8 ? escapeHtml(_0x1e6716) : "可一次选择一个或多个视频；每个视频文件对应一个分集。") + "</p>\n            <div class=\"story-upload-actions\">\n              <button type=\"button\" class=\"story-secondary-button\" data-video-replication-action=\"choose-source-videos\"" + (isAnalyzing ? " disabled" : "") + ">" + (_0x42b3a8 ? "重新选择" : "选择视频") + "</button>\n            </div>\n          </div>\n        </div>\n        <div class=\"story-home-model-bar\">\n          <div class=\"story-home-model-controls\">\n            " + renderAIGenTextModelSelectorMarkup({
    modelId: promptModelId,
    provider: textProvider,
    providerProfileId: textProviderProfileId,
    includeRunningHubInternational: true,
    getDisplayModelName: getDisplayModelName,
    className: "story-home-text-model-selector"
  }) + "\n            <div class=\"video-replication-duration-control\" aria-label=\"单片段最大时长\">\n              <span>固定切片</span>\n              <div class=\"story-upload-actions\">" + _0x1b5ab4 + "</div>\n            </div>\n            <button type=\"button\" class=\"story-secondary-button" + (useSourceVideoReference ? " is-active" : "") + "\" data-video-replication-action=\"toggle-source-reference\" aria-pressed=\"" + useSourceVideoReference + "\"" + (isAnalyzing ? " disabled" : "") + ">" + (useSourceVideoReference ? "使用视频参考" : "仅使用反推提示词") + "</button>\n          </div>\n          <button type=\"button\" class=\"story-primary-button story-home-generate story-main-action-button\" data-video-replication-action=\"start-analysis\"" + (_0x42b3a8 && analysisAvailable && !isAnalyzing ? "" : " disabled") + "><span>" + (isAnalyzing ? "正在准备片段" : "开始解析") + "</span><span class=\"story-generate-arrow\" aria-hidden=\"true\">→</span></button>\n        </div>\n        " + (isAnalyzing ? "<div class=\"story-home-generation-loading storyboard-script-loading-overlay\" role=\"status\" aria-live=\"polite\">\n          <div class=\"storyboard-script-loading-spinner\"></div>\n          <div class=\"storyboard-script-loading-label\">正在创建项目并准备固定时长片段</div>\n          <div class=\"storyboard-script-loading-bar\"><div class=\"storyboard-script-loading-bar-fill\"></div></div>\n        </div>" : "") + "\n      </div>\n    </section>\n    <section class=\"story-projects-section\">\n      <div class=\"story-section-heading\">\n        <div><h2>" + (showArchivedProjects ? "已归档项目" : "我的复刻项目") + "</h2></div>\n        <div class=\"story-project-list-controls\">\n          <label class=\"story-project-search\"><span aria-hidden=\"true\">⌕</span><input type=\"search\" data-video-replication-project-search value=\"" + escapeHtml(projectSearchQuery) + "\" placeholder=\"搜索项目名称\" autocomplete=\"off\" aria-label=\"搜索复刻项目\"></label>\n          " + renderWorkspaceProjectSortControl(projectSortOrder) + "\n          <button type=\"button\" class=\"story-project-archive-toggle " + (showArchivedProjects ? "is-active" : "") + "\" data-video-replication-action=\"toggle-archived-projects\" aria-pressed=\"" + showArchivedProjects + "\">" + (showArchivedProjects ? "返回项目" : "已归档 " + _0x508ce2) + "</button>\n        </div>\n      </div>\n      " + (_0x5f3dce.length ? "<div class=\"story-project-grid\">\n          " + _0x245f13.map(_0x5d2873 => renderProjectCard(_0x5d2873, {
    openProjectMenuId: openProjectMenuId,
    pendingDeleteProjectId: pendingDeleteProjectId
  })).join("") + "\n          " + (_0x245f13.length ? "" : "<div class=\"story-project-filter-empty\"><strong>" + (showArchivedProjects ? "没有匹配的归档项目" : "没有匹配的复刻项目") + "</strong><span>可以尝试其他搜索词，或清空搜索条件。</span></div>") + "\n        </div>" : "<div class=\"story-project-empty\">\n          <strong>还没有复刻项目</strong>\n          <span>选择一个或多个视频后开始解析，每个视频会保存为一个分集。</span>\n          <button type=\"button\" class=\"story-primary-button story-project-empty-action\" data-video-replication-action=\"choose-source-videos\">上传视频创建项目</button>\n        </div>") + "\n    </section>\n  </main>";
}
function renderProjectToolbar(_0x58af33 = {}) {
  const _0x3e24ca = Number(_0x58af33.workspace?.step) === 2 ? 2 : 1;
  const _0x92c71d = [[1, "素材设定"], [2, "分集视频"]];
  return "<header class=\"story-workspace-toolbar\">\n    <div class=\"story-project-toolbar\">\n      <button type=\"button\" class=\"story-toolbar-back\" data-video-replication-action=\"back-home\" aria-label=\"返回复刻项目\"><span class=\"story-toolbar-back-icon\" aria-hidden=\"true\"></span><span>复刻项目</span></button>\n      <nav class=\"story-step-navigation\" data-active-step=\"" + _0x3e24ca + "\" aria-label=\"复刻制作步骤\">\n        " + _0x92c71d.map(([_0x2949a4, _0xe34425]) => "<button type=\"button\" class=\"story-step " + (_0x3e24ca === _0x2949a4 ? "is-active" : "") + "\" data-video-replication-action=\"go-project-step\" data-project-step=\"" + _0x2949a4 + "\" aria-current=\"" + (_0x3e24ca === _0x2949a4 ? "step" : "false") + "\"><span>" + _0x2949a4 + "</span>" + _0xe34425 + "</button>").join("") + "\n      </nav>\n      <span class=\"story-project-status\" role=\"status\" aria-live=\"polite\">" + escapeHtml(getProjectStatusLabel(_0x58af33)) + "</span>\n    </div>\n  </header>";
}
function renderAssetDeleteControl(_0x3eacf5, _0x4b8329, _0x500f55) {
  if (_0x4b8329 === "library") {
    return "";
  }
  return renderWorkspaceCardDeleteControl({
    className: "story-asset-card-delete-trigger",
    ariaLabel: "删除" + getAssetKindLabel(_0x4b8329) + "素材 " + _0x3eacf5.name,
    actionAttributes: {
      "data-video-replication-action": "remove-asset",
      "data-asset-kind": _0x4b8329,
      "data-asset-id": _0x3eacf5.id
    },
    disabled: _0x500f55
  });
}
function renderAssetCard(_0x5b1934, {
  kind = "character",
  selectedAssetId = "",
  disabled = false
} = {}) {
  const _0x559d3b = normalizeAssetForRender(_0x5b1934, kind);
  return renderWorkspaceAssetCard({
    asset: _0x559d3b,
    appearances: _0x559d3b.imageUrl ? [{
      id: _0x559d3b.id + "-base",
      name: "基础形象",
      imageUrl: _0x559d3b.imageUrl
    }] : [],
    selected: _0x559d3b.id === selectedAssetId,
    promptPreview: _0x559d3b.description,
    statusText: kind === "library" ? "总素材" : getAssetKindLabel(kind) + "设定",
    cardAttributes: "data-video-replication-action=\"select-asset\" data-asset-kind=\"" + escapeHtml(kind) + "\" data-asset-id=\"" + escapeHtml(_0x559d3b.id) + "\"",
    deleteControlHtml: renderAssetDeleteControl(_0x559d3b, kind, disabled)
  });
}
function renderAssetDetail(_0x4b46db, _0x57e07a) {
  if (!_0x4b46db) {
    return "<aside class=\"story-asset-detail story-empty-panel\">\n      <strong>暂无可用素材</strong>\n      <p>上传" + getAssetKindLabel(_0x57e07a) + "图片后，可在这里查看并补充素材说明。</p>\n    </aside>";
  }
  const _0x565c58 = normalizeAssetForRender(_0x4b46db, _0x57e07a);
  return "<aside class=\"story-asset-detail\">\n    <div class=\"story-asset-preview-wrap\">\n      <div class=\"story-asset-preview-slide\">\n        " + (_0x565c58.imageUrl ? "<img class=\"story-asset-preview\" src=\"" + escapeHtml(_0x565c58.imageUrl) + "\" alt=\"" + escapeHtml(_0x565c58.name) + "\">" : "<div class=\"story-asset-preview story-media-empty\"><span>待上传</span></div>") + "\n      </div>\n      <div class=\"story-asset-preview-caption\">\n        <div class=\"story-asset-caption-heading\"><span class=\"story-asset-caption-title\"><strong>" + escapeHtml(_0x565c58.name) + "</strong></span></div>\n        <span>" + escapeHtml(getAssetKindLabel(_0x57e07a)) + "素材 · 项目内共享</span>\n      </div>\n    </div>\n    <div class=\"story-asset-detail-panel-stage is-image is-settled\">\n      <div class=\"story-asset-detail-panel-cube\">\n        <div class=\"story-asset-detail-copy story-asset-detail-panel-face story-asset-detail-panel-face--image\">\n          <div class=\"story-asset-prompt-field\">\n            <textarea class=\"prompt-textarea\" data-video-replication-asset-description data-asset-kind=\"" + escapeHtml(_0x57e07a) + "\" data-asset-id=\"" + escapeHtml(_0x565c58.id) + "\" maxlength=\"1200\" placeholder=\"补充人物、场景或道具设定；模型生成功能后续接入。\">" + escapeHtml(_0x565c58.description) + "</textarea>\n          </div>\n          <div class=\"story-asset-generation-bar prompt-panel-footer\">\n            <span>素材生成模型与调用逻辑将在后续接入</span>\n            <button type=\"button\" class=\"story-asset-generate-button story-main-action-button\" disabled><span>生成素材图</span></button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </aside>";
}
function renderAssetPageFooter(_0x1f8ab5 = {}) {
  const _0x13c01e = _0x1f8ab5.status === "analyzing";
  return "<footer class=\"story-page-footer\">\n    <div><strong>素材设定将在整个复刻项目中共享</strong><small>" + (_0x13c01e ? "固定时长片段正在后台准备，可先继续设置素材。" : "片段已建立，可进入分集视频查看。") + "</small></div>\n    <div class=\"story-page-footer-actions\">\n      <button type=\"button\" class=\"story-next-button\" data-video-replication-action=\"go-project-step\" data-project-step=\"2\"><span>进入分集视频</span><span class=\"story-next-arrow\" aria-hidden=\"true\">→</span></button>\n    </div>\n  </footer>";
}
function renderAssetsPage(_0x5123b7 = {}, {
  uploadingAssetKind = "",
  libraryAssets = []
} = {}) {
  const _0x23fa1b = ["character", "scene", "prop", "library"].includes(_0x5123b7.workspace?.assetTab) ? _0x5123b7.workspace.assetTab : "character";
  const _0x1d6eaf = _0x23fa1b === "library" ? libraryAssets : getAssetCollection(_0x5123b7, _0x23fa1b);
  const _0x23a1cc = _0x1d6eaf.map(_0x20b9f0 => normalizeAssetForRender(_0x20b9f0, _0x23fa1b));
  const _0x24b39c = _0x23a1cc.find(_0x44eae0 => _0x44eae0.id === _0x5123b7.workspace?.selectedAssetId) || _0x23a1cc[0] || null;
  const _0x2ed679 = uploadingAssetKind === _0x23fa1b;
  const _0x24b841 = _0x23fa1b === "library" ? "" : "<button type=\"button\" class=\"story-secondary-button\" data-video-replication-action=\"choose-asset-images\" data-asset-kind=\"" + escapeHtml(_0x23fa1b) + "\"" + (_0x2ed679 ? " aria-busy=\"true\" disabled" : "") + ">" + (_0x2ed679 ? "<span class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></span><span>上传中…</span>" : "上传" + getAssetKindLabel(_0x23fa1b)) + "</button>";
  return renderWorkspaceAssetSettingsShell({
    className: "video-replication-assets-page",
    activeTab: _0x23fa1b,
    tabCount: 4,
    tabsHtml: [["character", "人物", _0x5123b7.characters?.length || 0], ["scene", "场景", _0x5123b7.scenes?.length || 0], ["prop", "道具", _0x5123b7.props?.length || 0], ["library", "总素材", libraryAssets.length]].map(([_0x147d05, _0x10409d, _0x596f84]) => "<button type=\"button\" class=\"" + (_0x23fa1b === _0x147d05 ? "is-active" : "") + "\" data-video-replication-action=\"select-asset-tab\" data-video-replication-asset-tab=\"" + _0x147d05 + "\" data-asset-kind=\"" + _0x147d05 + "\" role=\"tab\" aria-selected=\"" + (_0x23fa1b === _0x147d05) + "\" tabindex=\"" + (_0x23fa1b === _0x147d05 ? "0" : "-1") + "\">" + renderWorkspaceAssetTabIcon(_0x147d05) + "<span class=\"story-asset-tab-label\">" + _0x10409d + "</span><span class=\"story-asset-tab-count\">" + _0x596f84 + "</span></button>").join(""),
    calloutTitle: _0x23fa1b === "library" ? "从总素材选择项目素材" : "上传或管理" + getAssetKindLabel(_0x23fa1b) + "设定",
    calloutDescription: _0x23fa1b === "library" ? "总素材沿用画布素材库；加入项目的交互将在后续能力接入时启用。" : "界面和素材组织方式与剧情工作室一致，素材在所有分集中共享。",
    calloutActionsHtml: _0x24b841,
    cardsHtml: _0x23a1cc.map(_0xa061b9 => renderAssetCard(_0xa061b9, {
      kind: _0x23fa1b,
      selectedAssetId: _0x24b39c?.id || "",
      disabled: Boolean(uploadingAssetKind)
    })).join(""),
    emptyText: _0x23fa1b === "library" ? "总素材暂无可用图片" : "还没有" + getAssetKindLabel(_0x23fa1b) + "素材",
    detailHtml: renderAssetDetail(_0x24b39c, _0x23fa1b),
    footerHtml: renderAssetPageFooter(_0x5123b7),
    splitRatio: 50
  });
}
function renderEpisodeRail(_0x1cc843 = [], _0x1848e0 = "") {
  return "<aside class=\"video-replication-episode-rail\" data-video-replication-episode-rail aria-label=\"分集列表\">\n    <header><span>分集</span><strong>" + _0x1cc843.length + "</strong></header>\n    <div class=\"video-replication-episode-rail-list\" data-video-replication-scroll-key=\"episode-rail\">\n      " + _0x1cc843.map(_0x11b02e => {
    const _0x5390f7 = _0x11b02e.id === _0x1848e0;
    const _0x3d7c15 = ["uploading", "cutting"].includes(_0x11b02e.status);
    return "<button type=\"button\" class=\"" + (_0x5390f7 ? "is-active" : "") + "\" data-video-replication-action=\"select-episode\" data-episode-id=\"" + escapeHtml(_0x11b02e.id) + "\" aria-pressed=\"" + _0x5390f7 + "\" aria-label=\"第 " + _0x11b02e.number + " 集：" + escapeHtml(_0x11b02e.title) + "\">\n          <span>" + _0x11b02e.number + "</span>\n          " + (_0x3d7c15 ? "<i class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></i>" : "") + "\n          <small>" + (_0x3d7c15 ? Math.round(Number(_0x11b02e.progress) || 0) + "%" : _0x11b02e.clips?.length || 0) + "</small>\n        </button>";
  }).join("") + "\n    </div>\n  </aside>";
}
function renderEpisodeAssetRail(_0x1066aa = {}, _0x2be41a = "assets") {
  const _0x2b148b = [...getAssetCollection(_0x1066aa, "character").map(_0x128ba2 => normalizeAssetForRender(_0x128ba2, "character")), ...getAssetCollection(_0x1066aa, "scene").map(_0x9fbdb4 => normalizeAssetForRender(_0x9fbdb4, "scene")), ...getAssetCollection(_0x1066aa, "prop").map(_0x19570f => normalizeAssetForRender(_0x19570f, "prop"))];
  const _0x1ad52f = [["assets", "本集素材", _0x2b148b.length], ["frames", "片段帧", 0], ["library", "总素材", 0]];
  const _0x299d0e = _0x2b148b.length ? ["character", "scene", "prop"].map(_0x6520ed => {
    const _0x49d65b = _0x2b148b.filter(_0x2debd9 => _0x2debd9.kind === _0x6520ed);
    if (!_0x49d65b.length) {
      return "";
    }
    return "<section><h3>" + getAssetKindLabel(_0x6520ed) + "</h3><div class=\"story-episode-asset-grid\">" + _0x49d65b.map(_0x24a950 => "<button type=\"button\" draggable=\"true\" aria-label=\"引用素材 " + escapeHtml(_0x24a950.name) + "\"><img class=\"story-episode-asset-image\" src=\"" + escapeHtml(_0x24a950.imageUrl) + "\" alt=\"" + escapeHtml(_0x24a950.name) + "\"><span>" + escapeHtml(_0x24a950.name) + "</span></button>").join("") + "</div></section>";
  }).join("") : "<div class=\"story-episode-asset-empty\"><strong>还没有项目素材</strong><span>返回素材设定上传人物、场景或道具图片。</span></div>";
  return "<aside class=\"story-episode-assets\" data-active-tab=\"" + escapeHtml(_0x2be41a) + "\">\n    <header class=\"story-episode-asset-rail-header\">\n      <div class=\"story-episode-asset-rail-tabs\" role=\"tablist\" aria-label=\"分集素材类型\">\n        " + _0x1ad52f.map(([_0x28bced, _0x1883b3, _0x2d2e1f]) => "<button type=\"button\" class=\"" + (_0x2be41a === _0x28bced ? "is-active" : "") + "\" data-video-replication-action=\"select-episode-asset-tab\" data-episode-asset-tab=\"" + _0x28bced + "\" role=\"tab\" aria-selected=\"" + (_0x2be41a === _0x28bced) + "\"><span class=\"story-episode-asset-tab-label\">" + _0x1883b3 + "</span><span class=\"story-episode-asset-count\">" + _0x2d2e1f + "</span></button>").join("") + "\n      </div>\n      <small>" + (_0x2be41a === "assets" ? "项目素材可作为后续视频生成参考" : "该素材入口将在后续调用能力接入") + "</small>\n    </header>\n    <div class=\"story-episode-asset-rail-viewport\">\n      <div class=\"story-episode-asset-rail-page is-active\">\n        " + (_0x2be41a === "assets" ? _0x299d0e : "<div class=\"story-episode-asset-empty\"><strong>暂时没有内容</strong><span>模型与抽帧逻辑将在后续接入。</span></div>") + "\n      </div>\n    </div>\n  </aside>";
}
function renderClipCard(_0x5ade6b = {}, _0x3128c2 = "") {
  const _0x4f37c5 = resolveGeneratedVideoRef(_0x5ade6b) || _0x5ade6b.videoRef;
  const _0x1a4c5b = _0x4f37c5 ? localPathToUrl(_0x4f37c5) || _0x4f37c5 : "";
  const _0x1d1a70 = _0x5ade6b.materializationStatus === "pending";
  const _0x26a846 = _0x5ade6b.materializationStatus === "failed" ? "裁剪失败" : _0x1d1a70 ? "片段准备中" : _0x5ade6b.promptStatus === "ready" ? "提示词已填写" : "提示词待分析";
  return "<div class=\"story-clip-card-shell\">\n    <button type=\"button\" class=\"story-clip-card " + (_0x1a4c5b ? "has-video-thumbnail" : "") + " " + (_0x3128c2 === _0x5ade6b.id ? "is-selected" : "") + "\" data-video-replication-action=\"select-clip\" data-clip-id=\"" + escapeHtml(_0x5ade6b.id) + "\">\n      " + (_0x1a4c5b ? "<span class=\"story-clip-card-media\"><video class=\"story-clip-card-thumbnail\" src=\"" + escapeHtml(_0x1a4c5b) + "\" data-video-replication-media-key=\"" + escapeHtml("clip:" + _0x5ade6b.id + ":" + _0x1a4c5b) + "\" preload=\"metadata\" muted playsinline></video></span>" : "") + "\n      <span class=\"story-clip-card-copy\"><span>" + escapeHtml(_0x26a846) + "</span><strong>" + escapeHtml(_0x5ade6b.title || "片段 " + (Number(_0x5ade6b.index) + 1)) + "</strong><small>" + escapeHtml(formatClipRange(_0x5ade6b)) + "</small></span>\n      " + (_0x1d1a70 ? "<span class=\"story-clip-card-loading\"><span class=\"storyboard-script-loading-spinner\"></span></span>" : "") + "\n    </button>\n  </div>";
}
function renderClipTimeline(_0x5bfa4d, _0x1d50be) {
  const _0x280d4c = Array.isArray(_0x5bfa4d?.clips) ? _0x5bfa4d.clips : [];
  return "<div class=\"story-clip-timeline\">\n    <div class=\"story-clip-timeline-header\"><span>" + formatClockTime(_0x5bfa4d?.durationSec) + "</span><small>每张卡片严格对应固定时间范围</small></div>\n    <div class=\"story-clip-strip\" data-video-replication-scroll-key=\"clip-strip\">\n      " + _0x280d4c.map(_0x43668a => renderClipCard(_0x43668a, _0x1d50be)).join("") + "\n    </div>\n  </div>";
}
function renderClipPromptSurface(_0x32ad68, _0x13d4f4, _0x4f2561) {
  const _0x326dfb = normalizeText(_0x4f2561?.generationPrompt || _0x4f2561?.analysis?.seedancePrompt);
  const _0x3eba64 = normalizeText(_0x4f2561?.videoRef);
  const _0x1977e9 = getAssetCollection(_0x32ad68, "character").map((_0x28279f, _0x3821e8) => {
    const _0x530a41 = normalizeText(_0x28279f.imageRef);
    if (_0x530a41) {
      return {
        kind: "image",
        url: localPathToUrl(_0x530a41) || _0x530a41,
        name: normalizeText(_0x28279f.name, "人物 " + (_0x3821e8 + 1))
      };
    } else {
      return null;
    }
  }).filter(Boolean);
  const _0x5b7d48 = [...(_0x32ad68.settings?.useSourceVideoReference && _0x3eba64 ? [{
    kind: "video",
    url: localPathToUrl(_0x3eba64) || _0x3eba64,
    name: "当前参考片段"
  }] : []), ..._0x1977e9];
  return "<div class=\"story-video-node-prompt text-prompt-panel\">\n    <div class=\"story-clip-prompt-toolbar\">\n      " + renderVideoReferenceBarMarkup({
    inputs: _0x5b7d48,
    attachmentButtonHtml: ""
  }) + "\n      <div class=\"story-clip-reference-summary\"><span class=\"story-clip-reference-summary-label\">使用参考</span><span>图片：<strong>" + _0x1977e9.length + "</strong></span><span>视频：<strong>" + (_0x32ad68.settings?.useSourceVideoReference && _0x3eba64 ? 1 : 0) + "</strong></span></div>\n    </div>\n    " + renderVideoPromptEditorMarkup({
    promptHtml: escapeHtml(_0x326dfb),
    placeholder: "提示词反推将在后续接入；当前可先手动填写片段提示词。",
    attributes: "data-video-replication-prompt-input data-episode-id=\"" + escapeHtml(_0x13d4f4.id) + "\" data-clip-id=\"" + escapeHtml(_0x4f2561.id) + "\""
  }) + "\n    " + (_0x4f2561.promptError ? "<p class=\"story-inline-error\">" + escapeHtml(_0x4f2561.promptError) + "</p>" : "") + "\n    <div class=\"story-clip-model-bar prompt-panel-footer\">\n      " + renderAIGenVideoModelSelectorMarkup({
    modelId: _0x32ad68.settings?.videoModelId,
    provider: _0x32ad68.settings?.videoProvider,
    generationParams: _0x32ad68.settings?.generationParams,
    generationParamsByModel: _0x32ad68.settings?.generationParamsByModel,
    providerProfileId: _0x32ad68.settings?.videoProviderProfileId,
    referenceCounts: {
      imageCount: _0x1977e9.length,
      videoCount: _0x32ad68.settings?.useSourceVideoReference && _0x3eba64 ? 1 : 0,
      audioCount: 0
    },
    showSchemaControls: true,
    className: "story-clip-video-model-selector"
  }) + "\n      <div class=\"story-clip-generation-actions\">\n        <button type=\"button\" class=\"story-secondary-button\" disabled>多选</button>\n        <button type=\"button\" class=\"story-workbench-action-button story-main-action-button\" disabled>生成本片段</button>\n      </div>\n    </div>\n  </div>";
}
function renderEpisodePage(_0x1af22d = {}) {
  const _0x368ee5 = Array.isArray(_0x1af22d.episodes) ? _0x1af22d.episodes : [];
  const _0x27d3b0 = _0x368ee5.find(_0x3fbe5d => _0x3fbe5d.id === _0x1af22d.workspace?.selectedEpisodeId) || _0x368ee5[0] || null;
  const _0x5a6648 = Array.isArray(_0x27d3b0?.clips) ? _0x27d3b0.clips : [];
  const _0x49180e = _0x5a6648.find(_0x2c2525 => _0x2c2525.id === _0x1af22d.workspace?.selectedClipId) || _0x5a6648[0] || null;
  if (!_0x27d3b0 || !_0x49180e) {
    return "<div class=\"story-episodes-page story-content-page video-replication-episode-empty\">\n      " + renderEpisodeRail(_0x368ee5, _0x27d3b0?.id || "") + "\n      <div class=\"story-episode-asset-empty\"><strong>片段正在准备</strong><span>后台完成固定时长裁剪后，片段卡片会在这里出现。</span></div>\n    </div>";
  }
  const _0x309c36 = resolveGeneratedVideoRef(_0x49180e) || _0x49180e.videoRef;
  const _0xcc9d5c = _0x309c36 ? localPathToUrl(_0x309c36) || _0x309c36 : "";
  const _0x1a52e9 = _0x1af22d.workspace?.episodeAssetTab || "assets";
  return "<div class=\"video-replication-episode-production\">\n    " + renderEpisodeRail(_0x368ee5, _0x27d3b0.id) + "\n    <div class=\"story-episode-detail-page\">\n      " + renderEpisodeAssetRail(_0x1af22d, _0x1a52e9) + "\n      <div class=\"story-episode-splitter story-episode-splitter--assets panel-resize-handle panel-resize-handle--transient\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整本集素材区域宽度\" tabindex=\"0\"></div>\n      <section class=\"story-clip-editor\">\n        <header><h2>" + escapeHtml(_0x49180e.title || "片段提示词") + "</h2></header>\n        <div class=\"story-clip-context-row\">\n          <div class=\"story-clip-meta\"><span>第 " + _0x27d3b0.number + " 集</span><span>" + escapeHtml(formatClipRange(_0x49180e)) + "</span><span>固定上限 " + (_0x27d3b0.clipLimitSeconds || _0x1af22d.settings?.clipLimitSeconds || 15) + " 秒</span></div>\n        </div>\n        " + renderClipPromptSurface(_0x1af22d, _0x27d3b0, _0x49180e) + "\n      </section>\n      <div class=\"story-episode-splitter story-episode-splitter--preview panel-resize-handle panel-resize-handle--transient\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整提示词与视频区域宽度\" tabindex=\"0\"></div>\n      <section class=\"story-video-preview\">\n        <div class=\"story-clip-preview-slide\">\n          " + (_0xcc9d5c ? "<video src=\"" + escapeHtml(_0xcc9d5c) + "\" data-video-replication-media-key=\"" + escapeHtml("preview:" + _0x49180e.id + ":" + _0xcc9d5c) + "\" controls preload=\"metadata\" playsinline></video>" : "<div class=\"story-video-empty\"><strong>片段预览</strong><p>" + escapeHtml(_0x49180e.materializationError || "固定片段准备完成后将在这里预览。") + "</p></div>") + "\n        </div>\n      </section>\n      " + renderClipTimeline(_0x27d3b0, _0x49180e.id) + "\n    </div>\n  </div>";
}
export function renderVideoReplicationProject(_0x101b22 = {}, _0x599fb2 = {}) {
  const _0x4f6185 = Number(_0x101b22.workspace?.step) === 2 ? 2 : 1;
  return "<div data-video-replication-project-view data-project-step=\"" + _0x4f6185 + "\">\n    " + renderProjectToolbar(_0x101b22) + "\n    <main class=\"story-page-viewport\" data-video-replication-scroll-key=\"project\">\n      " + (_0x4f6185 === 2 ? renderEpisodePage(_0x101b22) : renderAssetsPage(_0x101b22, _0x599fb2)) + "\n    </main>\n  </div>";
}