import { localPathToUrl } from "../../utils/localMediaPath.js";
import { renderWorkspaceAssetLoadingOverlay } from "../workspaceAssetPresentation.js";
import { renderPersonReplacementAssetCard, renderPersonReplacementPreviewArrow } from "./personReplacementAssetPresentation.js";
import { PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_RANGE, normalizePersonReplacementCompositeSidebarWidth } from "./personReplacementProjectSession.js";
import { getPersonReplacementShotDurationSec } from "./personReplacementShotCutModel.js";
function escapeHtml(_0x4d16d9) {
  return String(_0x4d16d9 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x4a6bd1, _0x290d5b = "") {
  const _0x521c02 = String(_0x4a6bd1 ?? "").trim();
  return _0x521c02 || _0x290d5b;
}
function normalizeMediaUrl(_0x220961) {
  const _0x1820d1 = normalizeText(_0x220961);
  if (_0x1820d1) {
    return localPathToUrl(_0x1820d1) || _0x1820d1;
  } else {
    return "";
  }
}
function formatClock(_0x4c4420) {
  const _0x34e1fb = Math.max(0, Number(_0x4c4420) || 0);
  const _0x31f752 = Math.floor(_0x34e1fb / 60);
  const _0x521df3 = Math.floor(_0x34e1fb % 60);
  return String(_0x31f752).padStart(2, "0") + ":" + String(_0x521df3).padStart(2, "0");
}
function renderVideoIcon() {
  return "<svg class=\"person-replacement-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"/><path d=\"m17 10 4-2v8l-4-2\"/></svg>";
}
function renderCompositePreviewShotList(_0x4ecff2) {
  const _0x5c72b8 = _0x4ecff2.previewMode === "full" ? "" : normalizeText(_0x4ecff2.selectedShot?.id);
  const _0x23f0f7 = {
    data: {
      assets: [],
      project: {}
    },
    assetFilter: "scene",
    selectedAssetId: _0x5c72b8,
    selectedAssetIds: _0x4ecff2.selectedShotIds,
    assetSelectionMode: _0x4ecff2.selectionMode,
    assetAppearanceIndexes: {},
    generatingAppearanceKeys: [],
    isBatchGenerating: false,
    batchGeneratingAssetIds: [],
    allowDeleteAssetCard: false,
    allowAssetRename: false,
    hideAssetRoleTag: true,
    hideAssetNameTooltip: true
  };
  return _0x4ecff2.shots.map((_0xf0cee1, _0x216b5b) => {
    const _0x168506 = normalizeText(_0xf0cee1?.id);
    const _0x22484e = _0x168506 === _0x5c72b8;
    const _0x1925be = Boolean(_0xf0cee1?.resultVideoRef);
    const _0x7c15ce = getPersonReplacementShotDurationSec(_0xf0cee1);
    const _0x3950d2 = "镜头片段" + String(_0x216b5b + 1).padStart(2, "0");
    const _0x2fb041 = normalizeMediaUrl(_0xf0cee1?.replacementImageRef || _0xf0cee1?.keyframeRef);
    const _0x4b961a = (_0x7c15ce > 0 ? formatClock(_0x7c15ce) : "00:00") + " · " + (_0x1925be ? "替换视频已就绪" : "等待替换视频");
    const _0x1dd894 = _0x2fb041 ? "data-person-replacement-composite-shot-hover-preview=\"true\"" : "";
    return renderPersonReplacementAssetCard(_0x23f0f7, {
      id: _0x168506,
      kind: "scene",
      name: _0x3950d2,
      description: "",
      imageUrl: _0x2fb041,
      appearances: [{
        id: "composite-thumbnail",
        name: "片段缩略图",
        imageUrl: _0x2fb041
      }]
    }, {
      statusText: _0x4b961a,
      cardClassName: "person-replacement-shot-card person-replacement-preview-shot-card",
      cardAttributes: "data-person-replacement-shot-card=\"true\" data-shot-id=\"" + escapeHtml(_0x168506) + "\" " + _0x1dd894 + " aria-current=\"" + _0x22484e + "\" aria-label=\"" + escapeHtml(_0x3950d2 + "，" + _0x4b961a + (_0x22484e ? "，当前片段" : "")) + "\""
    });
  }).join("");
}
function renderCompositeFullVideoEntry(_0x528076) {
  if (!_0x528076.fullAvailable) {
    return "";
  }
  const _0x2af21a = _0x528076.composedShots.reduce((_0x109c3a, _0x109f63) => _0x109c3a + getPersonReplacementShotDurationSec(_0x109f63), 0);
  const _0x57d6e7 = _0x528076.previewMode === "full";
  const _0xb51efc = _0x528076.composedShots.length + " 个片段 · " + formatClock(_0x2af21a);
  const _0x3bea69 = _0x528076.compositionStale ? "旧合成视频" : "完整视频";
  const _0x373360 = _0x528076.compositionStale ? _0xb51efc + " · 需重新合成" : _0xb51efc;
  return "<div class=\"person-replacement-composite-full-entry\">\n    <button type=\"button\" class=\"person-replacement-composite-full-button" + (_0x57d6e7 ? " is-selected" : "") + "\" data-person-replacement-action=\"select-composite-full-video\" aria-current=\"" + _0x57d6e7 + "\" aria-label=\"" + escapeHtml(_0x3bea69) + "，" + escapeHtml(_0x373360) + "\">\n      <span class=\"person-replacement-composite-full-icon\" aria-hidden=\"true\">" + renderVideoIcon() + "</span>\n      <span class=\"person-replacement-composite-full-copy\"><strong>" + escapeHtml(_0x3bea69) + "</strong><small>" + escapeHtml(_0x373360) + "</small></span>\n    </button>\n  </div>";
}
function renderCompositePreviewShotRail(_0x3a8fa1) {
  const _0x3cffee = _0x3a8fa1.shots.length > 0 && _0x3a8fa1.shots.every(_0x4f26b5 => _0x3a8fa1.selectedShotIds.includes(_0x4f26b5.id));
  const _0x39055a = _0x3a8fa1.selectionMode ? "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"toggle-all-shots\" aria-pressed=\"" + _0x3cffee + "\">" + (_0x3cffee ? "取消全选" : "全选") + "</button><button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-shot-selection\">取消</button>" : "<button type=\"button\" class=\"story-secondary-button story-clip-selection-trigger\" data-story-action=\"toggle-shot-selection\" " + (_0x3a8fa1.shots.length ? "" : "disabled") + ">多选</button>";
  const _0x3242ee = _0x3a8fa1.selectionMode ? "已选 " + _0x3a8fa1.selectedShotIds.length : _0x3a8fa1.completed + "/" + _0x3a8fa1.shots.length;
  return "<aside class=\"person-replacement-preview-shot-rail" + (_0x3a8fa1.fullAvailable ? " has-complete-video" : "") + "\" aria-label=\"待检查片段\">\n    " + renderCompositeFullVideoEntry(_0x3a8fa1) + "\n    <header class=\"" + (_0x3a8fa1.selectionMode ? "is-selection-mode" : "") + "\">\n      <div class=\"person-replacement-preview-shot-heading\"><strong>镜头片段</strong><small>" + (_0x3a8fa1.selectionMode ? "拖拽空白区域可框选" : "逐段检查替换结果") + "</small></div>\n      <div class=\"person-replacement-preview-shot-actions\"><span>" + _0x3242ee + "</span>" + _0x39055a + "</div>\n    </header>\n    <div class=\"person-replacement-preview-shot-list\" data-story-marquee-surface=\"shots\" tabindex=\"0\">" + renderCompositePreviewShotList(_0x3a8fa1) + "</div>\n  </aside>";
}
function renderCompositePreviewMediaCard({
  kind: _0x752940,
  label: _0x2fd3aa,
  description: _0x23435f,
  mediaRef: _0x1195bf,
  posterRef = "",
  playable = false,
  loading = false,
  showShotNavigation = false,
  footerDetail = ""
} = {}) {
  const _0x34b2ad = normalizeText(_0x1195bf);
  const _0x1e3474 = normalizeText(posterRef);
  const _0x4ab43b = _0x752940 === "replacement";
  const _0x28c0cf = showShotNavigation ? "" + renderPersonReplacementPreviewArrow("previous", {
    action: "previous-shot",
    label: "上一个片段",
    className: "person-replacement-shot-navigation-arrow person-replacement-composite-shot-navigation-arrow"
  }) + renderPersonReplacementPreviewArrow("next", {
    action: "next-shot",
    label: "下一个片段",
    className: "person-replacement-shot-navigation-arrow person-replacement-composite-shot-navigation-arrow"
  }) : "";
  const _0xc43c90 = showShotNavigation ? " data-person-replacement-shot-wheel=\"true\" aria-label=\"滚动鼠标滚轮或使用左右按钮切换片段\"" : "";
  return "<article class=\"person-replacement-compare-card is-" + escapeHtml(_0x752940) + "\" data-person-replacement-compare-card=\"" + escapeHtml(_0x752940) + "\">\n    <header class=\"person-replacement-compare-card-heading\">\n      <span class=\"person-replacement-compare-card-label\"><i aria-hidden=\"true\"></i>" + escapeHtml(_0x2fd3aa) + "</span>\n      <small>" + escapeHtml(_0x23435f) + "</small>\n    </header>\n    <div class=\"person-replacement-compare-media-frame" + (loading ? " img-preview-loading" : "") + "\"" + _0xc43c90 + (loading ? " aria-busy=\"true\" inert" : "") + ">\n      <button type=\"button\" class=\"person-replacement-compare-media\" data-person-replacement-compare-playback=\"" + escapeHtml(_0x752940) + "\" data-person-replacement-action=\"toggle-comparison-playback\" aria-label=\"播放原视频和替换视频\" aria-pressed=\"false\" " + (playable && _0x34b2ad ? "" : "disabled") + ">\n        " + (_0x34b2ad ? "<video data-person-replacement-compare-video=\"" + escapeHtml(_0x752940) + "\" data-person-replacement-compare-video-url=\"" + escapeHtml(normalizeMediaUrl(_0x34b2ad)) + "\" playsinline preload=\"metadata\" muted" + (_0x1e3474 ? " poster=\"" + escapeHtml(normalizeMediaUrl(_0x1e3474)) + "\"" : "") + " aria-label=\"" + escapeHtml(_0x2fd3aa) + "\"></video>" : "<div class=\"person-replacement-compare-empty\"><span aria-hidden=\"true\">" + (_0x4ab43b ? "↗" : "□") + "</span><strong>" + (_0x4ab43b ? "等待替换视频" : "原视频尚未准备") + "</strong><small>" + (_0x4ab43b ? "返回视频替换生成当前片段后，可在这里同步对比。" : "完成视频切片后即可预览。") + "</small></div>") + "\n      </button>\n      " + _0x28c0cf + "\n      " + (loading ? renderWorkspaceAssetLoadingOverlay({
    title: "视频合成中",
    description: "正在合成替换片段，完成后会自动显示完整视频。"
  }) : "") + "\n    </div>\n    <footer><span>" + (_0x34b2ad ? "已载入" : "未载入") + "</span><small>" + escapeHtml(footerDetail || (_0x4ab43b ? "生成结果" : "原始片段")) + "</small></footer>\n  </article>";
}
function renderCompositeSidebarSplitter(_0x426be6) {
  const _0x3b2b51 = normalizePersonReplacementCompositeSidebarWidth(_0x426be6);
  return "<div class=\"person-replacement-composite-sidebar-splitter panel-resize-handle panel-resize-handle--transient\" data-person-replacement-composite-sidebar-splitter role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整镜头片段侧栏与显示区域宽度\" aria-valuemin=\"" + PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_RANGE.min + "\" aria-valuemax=\"" + PERSON_REPLACEMENT_COMPOSITE_SIDEBAR_WIDTH_RANGE.max + "\" aria-valuenow=\"" + Math.round(_0x3b2b51) + "\" tabindex=\"0\"></div>";
}
function renderCompositePreview(_0x4e1407, {
  composeActionHtml = "",
  playbackControlsHtml = "",
  composeOutputPending = false
} = {}) {
  const _0x4812f4 = _0x4e1407.previewMode === "full";
  const _0x51c2e9 = _0x4e1407.media.replacementAudioRef ? "声音克隆音轨" : "替换视频内音轨";
  const _0x58ddce = _0x4812f4 ? _0x4e1407.compositionStale ? "<span>旧合成视频</span><small>图像或视频已更新 · 需重新合成</small>" : "<span>完整视频</span><small>" + _0x4e1407.composedShots.length + " 个片段 · 对比已就绪</small>" : "<span>" + String(_0x4e1407.selectedShotIndex + 1).padStart(2, "0") + " / " + String(Math.max(_0x4e1407.total, 1)).padStart(2, "0") + "</span><small>" + (_0x4e1407.composeSucceeded ? "全部视频已合成" : "已替换 " + _0x4e1407.completed + "/" + _0x4e1407.total + "，其余保留原片") + "</small>";
  return "<div class=\"person-replacement-preview-page\" data-person-replacement-composite-preview data-preview-track=\"" + escapeHtml(_0x4e1407.previewTrack) + "\">\n    <div class=\"person-replacement-preview-workbench\" style=\"--person-replacement-composite-sidebar-width:" + _0x4e1407.sidebarWidth + "px;\">\n      " + renderCompositePreviewShotRail(_0x4e1407) + "\n      " + renderCompositeSidebarSplitter(_0x4e1407.sidebarWidth) + "\n      <section class=\"person-replacement-compare-workspace\" aria-label=\"原视频与替换视频对比\">\n        <header class=\"person-replacement-compare-heading\">\n          <div><span class=\"person-replacement-eyebrow\">合成视频</span><h2>" + escapeHtml(_0x4e1407.title) + "</h2><p>同步检查动作、构图与声音，确认后再生成最终合成。</p></div>\n          <div class=\"person-replacement-compare-heading-actions\">\n            " + composeActionHtml + "\n            <div class=\"person-replacement-compare-summary\">" + _0x58ddce + "</div>\n          </div>\n        </header>\n        <div class=\"person-replacement-compare-grid\">\n          " + renderCompositePreviewMediaCard({
    kind: "original",
    label: "原视频",
    description: _0x4812f4 ? "全部原片按时间轴合成" : "动作与镜头基准",
    mediaRef: _0x4e1407.media.originalRef,
    posterRef: _0x4812f4 ? "" : _0x4e1407.selectedShot?.keyframeRef,
    playable: _0x4e1407.canCompare,
    showShotNavigation: !_0x4812f4 && _0x4e1407.total > 1,
    footerDetail: _0x4812f4 ? "原片完整对照" : "原始片段"
  }) + "\n          " + renderCompositePreviewMediaCard({
    kind: "replacement",
    label: "替换视频",
    description: _0x4812f4 ? "替换片段优先，未替换片段保留原片" : "人物替换结果",
    mediaRef: _0x4e1407.media.replacementRef,
    posterRef: _0x4812f4 ? "" : _0x4e1407.selectedShot?.replacementImageRef,
    playable: _0x4e1407.canCompare,
    loading: composeOutputPending,
    showShotNavigation: !_0x4812f4 && _0x4e1407.total > 1,
    footerDetail: _0x4812f4 ? "替换完整结果" : "生成结果"
  }) + "\n        </div>\n        <div class=\"person-replacement-compare-controls\" data-person-replacement-compare-footer>\n          " + playbackControlsHtml + "\n          <div class=\"person-replacement-compare-control-row\">\n            <div class=\"person-replacement-track-setting\"><span>播放音轨</span><div class=\"person-replacement-track-options\" role=\"group\" aria-label=\"播放音轨\">\n              <button type=\"button\" class=\"" + (_0x4e1407.previewTrack === "original" ? "is-selected" : "") + "\" data-person-replacement-action=\"set-preview-track\" data-preview-track=\"original\" aria-pressed=\"" + (_0x4e1407.previewTrack === "original") + "\"><strong>原视频音轨</strong><small>保留现场原声</small></button>\n              <button type=\"button\" class=\"" + (_0x4e1407.previewTrack === "replacement" ? "is-selected" : "") + "\" data-person-replacement-action=\"set-preview-track\" data-preview-track=\"replacement\" aria-pressed=\"" + (_0x4e1407.previewTrack === "replacement") + "\"><strong>替换音轨</strong><small>" + escapeHtml(_0x51c2e9) + "</small></button>\n            </div></div>\n          </div>\n        </div>\n        " + (_0x4812f4 && _0x4e1407.media.originalAudioRef ? "<audio data-person-replacement-compare-original-audio data-person-replacement-compare-original-audio-url=\"" + escapeHtml(normalizeMediaUrl(_0x4e1407.media.originalAudioRef)) + "\" preload=\"none\"></audio>" : "") + "\n        " + (_0x4e1407.media.replacementAudioRef ? "<audio data-person-replacement-compare-replacement-audio data-person-replacement-compare-replacement-audio-url=\"" + escapeHtml(normalizeMediaUrl(_0x4e1407.media.replacementAudioRef)) + "\" preload=\"none\"></audio>" : "") + "\n      </section>\n    </div>\n  </div>";
}
export function createPersonReplacementCompositePreviewPresentation() {
  return Object.freeze({
    render: renderCompositePreview,
    renderRail: renderCompositePreviewShotRail
  });
}