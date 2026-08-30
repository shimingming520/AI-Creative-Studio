import { VIDEO_CLIP_ICON_SVG } from "../../components/nodeToolbar/videoToolbarHtml.js";
import { getMediaClipTimelineRangeRect, getMediaClipTimelineTrackWidthPx } from "../../components/media-clip/mediaClipTimelineModel.js";
import { formatDurationLabel } from "../../components/media-clip/mediaClipUtils.js";
import { resolveMediaClipReverseControlState } from "../../components/media-clip/mediaClipReverseControl.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { renderWorkspaceConfirmIcon, renderWorkspaceKeyframeIcon } from "../workspaceActionIcons.js";
import { renderWorkspaceAssetLoadingOverlay, renderWorkspaceCardDeleteControl } from "../workspaceAssetPresentation.js";
import { renderWorkspaceMediaHistoryMenu } from "../workspaceMediaHistory.js";
import { getPersonReplacementActiveImageResultIndex, getPersonReplacementActiveVideoResultIndex, getPersonReplacementImageResults, getPersonReplacementVideoResults, resolvePersonReplacementImageResultRef, resolvePersonReplacementVideoResultRef } from "./personReplacementProject.js";
import { resolvePersonReplacementImageGenerationState } from "./personReplacementImageGeneration.js";
import { isPersonReplacementVideoGenerationActive, resolvePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
import { renderPersonReplacementAssetCard, renderPersonReplacementBatchGenerationControl } from "./personReplacementAssetPresentation.js";
import { PERSON_REPLACEMENT_CUT_BASE_VIEWPORT_WIDTH_PX, PERSON_REPLACEMENT_CUT_MIN_SEC, canMergePersonReplacementShotCutRanges, canSplitPersonReplacementShotCutRange, countEditablePersonReplacementShotCuts, createPersonReplacementShotCutDraft, getPersonReplacementShotCutDisplayDuration, getPersonReplacementShotCutFrameSec, getPersonReplacementShotCutPositionAtTimelineSec, getPersonReplacementShotCutTimelineSec, getPersonReplacementShotCutTotalDuration, getPersonReplacementShotDurationSec, hasPersonReplacementShotCutUpdateChanges } from "./personReplacementShotCutModel.js";
import { getPersonReplacementShotCutRulerFrameRate, hasSplittablePersonReplacementShotCut, renderPersonReplacementShotCutFilmstrip, renderPersonReplacementShotCutRulerTicks } from "./personReplacementShotCutRendering.js";
import { resolveShotCutSubmissionUi } from "./personReplacementShotReverse.js";
function escapeHtml(_0xc972e1) {
  return String(_0xc972e1 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x3607d4, _0x2baa26 = "") {
  const _0xa602a8 = String(_0x3607d4 ?? "").trim();
  return _0xa602a8 || _0x2baa26;
}
function normalizeMediaUrl(_0x151ae9) {
  const _0x326751 = normalizeText(_0x151ae9);
  if (_0x326751) {
    return localPathToUrl(_0x326751) || _0x326751;
  } else {
    return "";
  }
}
function clamp(_0x1118c6, _0x4ab027, _0x2dc13f, _0x85a603 = _0x4ab027) {
  const _0x50e639 = Number(_0x1118c6);
  if (Number.isFinite(_0x50e639)) {
    return Math.min(_0x2dc13f, Math.max(_0x4ab027, _0x50e639));
  } else {
    return _0x85a603;
  }
}
function formatClock(_0x388a6b) {
  const _0x49965e = Math.max(0, Number(_0x388a6b) || 0);
  const _0x343f2e = Math.floor(_0x49965e / 60);
  const _0x111b26 = Math.floor(_0x49965e % 60);
  return String(_0x343f2e).padStart(2, "0") + ":" + String(_0x111b26).padStart(2, "0");
}
function formatPreciseClock(_0x458e1e) {
  const _0x526711 = Math.max(0, Number(_0x458e1e) || 0);
  const _0x12b8b4 = Math.floor(_0x526711 / 60);
  const _0x3b2333 = _0x526711 - _0x12b8b4 * 60;
  return String(_0x12b8b4).padStart(2, "0") + ":" + _0x3b2333.toFixed(2).padStart(5, "0");
}
function resolvePersonReplacementVideoResultPosterRef(_0x349e42 = {}) {
  if (!_0x349e42 || typeof _0x349e42 !== "object" || Array.isArray(_0x349e42)) {
    return "";
  }
  return [_0x349e42.posterUrl, _0x349e42.thumbUrl, _0x349e42.thumbnailUrl, _0x349e42.coverUrl, _0x349e42.posterLocalPath, _0x349e42.thumbLocalPath, _0x349e42.thumbnailLocalPath].map(_0x367be7 => normalizeText(_0x367be7)).find(Boolean) || "";
}
function renderReplacementImageReferenceButton(_0x2d2dc3 = {}, _0x1751e0 = 0) {
  const _0x1e56b0 = getPersonReplacementImageResults(_0x2d2dc3);
  const _0x29b9b4 = _0x1e56b0[_0x1751e0];
  const _0x13b48d = resolvePersonReplacementImageResultRef(_0x29b9b4);
  if (!_0x13b48d) {
    return "";
  }
  const _0x313e3a = _0x13b48d === normalizeText(_0x2d2dc3?.imageIterationReferenceRef);
  const _0x3c74e3 = _0x313e3a ? "取消图片 " + (_0x1751e0 + 1) + " 的参考" : "将图片 " + (_0x1751e0 + 1) + " 设为参考";
  const _0xe93476 = _0x313e3a ? "再次点击取消下一轮参考" : "设为下一轮图像替换的参考";
  return "<button type=\"button\" class=\"story-base-appearance-button person-replacement-result-reference-button" + (_0x313e3a ? " is-active" : "") + "\" data-story-action=\"set-replacement-image-reference\" data-shot-id=\"" + escapeHtml(_0x2d2dc3?.id) + "\" data-replacement-image-result-index=\"" + _0x1751e0 + "\" aria-pressed=\"" + _0x313e3a + "\" aria-label=\"" + escapeHtml(_0x3c74e3) + "\" title=\"" + escapeHtml(_0xe93476) + "\">参考</button>";
}
function renderReplacementImageHistoryMenu(_0x24a927 = {}, _0x635f92 = "镜头片段", {
  allowSingleResult = false
} = {}) {
  const _0xb33a14 = getPersonReplacementImageResults(_0x24a927);
  const _0x4647fb = getPersonReplacementActiveImageResultIndex(_0x24a927, _0xb33a14);
  return renderWorkspaceMediaHistoryMenu({
    title: _0x635f92,
    results: _0xb33a14,
    activeIndex: _0x4647fb,
    minimumItemCount: allowSingleResult ? 1 : 2,
    countLabel: _0xb33a14.length + " 张图片",
    menuLabel: _0x635f92 + "替换图片",
    getItemLabel: (_0x210f13, _0x28fdfe) => "图片 " + (_0x28fdfe + 1),
    getItemStatus: (_0x2500c2, _0x121500) => _0x121500 === _0x4647fb ? "当前使用" : "点击切换",
    renderMedia: (_0x183a80, _0x549525) => {
      const _0x38cbdf = resolvePersonReplacementImageResultRef(_0x183a80);
      if (_0x38cbdf) {
        return "<img class=\"story-media-history-thumbnail story-clip-video-history-thumbnail\" src=\"" + escapeHtml(normalizeMediaUrl(_0x38cbdf)) + "\" alt=\"" + escapeHtml(_0x635f92 + " · 图片 " + (_0x549525 + 1)) + "\" loading=\"lazy\" draggable=\"false\">";
      } else {
        return "";
      }
    },
    getItemAttributes: (_0x4e311d, _0x3e91cc) => "data-story-action=\"select-replacement-image-result\" data-shot-id=\"" + escapeHtml(_0x24a927?.id) + "\" data-replacement-image-result-index=\"" + _0x3e91cc + "\"",
    renderItemAction: (_0x2e1b0b, _0x431859) => "" + renderReplacementImageReferenceButton(_0x24a927, _0x431859) + (_0xb33a14.length > 1 ? renderWorkspaceCardDeleteControl({
      className: "story-media-history-delete",
      ariaLabel: "删除图片 " + (_0x431859 + 1),
      actionAttributes: {
        "data-story-action": "delete-replacement-image-result",
        "data-shot-id": _0x24a927?.id,
        "data-replacement-image-result-index": _0x431859
      }
    }) : "")
  });
}
function renderReplacementVideoHistoryMenu(_0x7bcfca = {}, _0x215e90 = "镜头片段", {
  allowSingleResult = false
} = {}) {
  const _0x263611 = getPersonReplacementVideoResults(_0x7bcfca);
  const _0x1e61a2 = getPersonReplacementActiveVideoResultIndex(_0x7bcfca, _0x263611);
  return renderWorkspaceMediaHistoryMenu({
    title: _0x215e90,
    results: _0x263611,
    activeIndex: _0x1e61a2,
    minimumItemCount: allowSingleResult ? 1 : 2,
    countLabel: _0x263611.length + " 个视频",
    menuLabel: _0x215e90 + "替换结果视频",
    getItemLabel: (_0x2009ec, _0x31e000) => "视频 " + (_0x31e000 + 1),
    getItemStatus: (_0x569b4b, _0x134dff) => _0x134dff === _0x1e61a2 ? "当前播放" : "点击切换",
    renderMedia: (_0x5486db, _0x467021) => {
      const _0x3d50c9 = resolvePersonReplacementVideoResultPosterRef(_0x5486db);
      if (_0x3d50c9) {
        return "<img class=\"story-media-history-thumbnail story-clip-video-history-thumbnail\" src=\"" + escapeHtml(normalizeMediaUrl(_0x3d50c9)) + "\" alt=\"" + escapeHtml(_0x215e90 + " · 视频 " + (_0x467021 + 1)) + "\" loading=\"lazy\" draggable=\"false\">";
      }
      const _0x27f226 = resolvePersonReplacementVideoResultRef(_0x5486db);
      if (_0x27f226) {
        return "<video class=\"story-media-history-thumbnail story-clip-video-history-thumbnail\" src=\"" + escapeHtml(normalizeMediaUrl(_0x27f226)) + "\" aria-label=\"" + escapeHtml(_0x215e90 + " · 视频 " + (_0x467021 + 1)) + "\" muted playsinline preload=\"metadata\"></video>";
      } else {
        return "";
      }
    },
    getItemAttributes: (_0x546655, _0x8cc3fa) => "data-story-action=\"select-replacement-video-result\" data-shot-id=\"" + escapeHtml(_0x7bcfca?.id) + "\" data-replacement-video-result-index=\"" + _0x8cc3fa + "\"",
    renderItemAction: (_0x22a1cc, _0x307dff) => _0x263611.length > 1 ? renderWorkspaceCardDeleteControl({
      className: "story-media-history-delete",
      ariaLabel: "删除视频 " + (_0x307dff + 1),
      actionAttributes: {
        "data-story-action": "delete-replacement-video-result",
        "data-shot-id": _0x7bcfca?.id,
        "data-replacement-video-result-index": _0x307dff
      }
    }) : ""
  });
}
function renderShotTimeline(_0x2673b0, {
  allowCutEditing = false,
  mode = "image",
  isBatchGenerating = false,
  batchGeneratingShotIds = [],
  batchCancelRequested = false
} = {}) {
  const _0xbd92fc = mode === "video";
  const _0x493a71 = Array.isArray(_0x2673b0.shots) ? _0x2673b0.shots : [];
  const _0x43e504 = _0x493a71.reduce((_0x3f1261, _0x5561c6) => _0x3f1261 + getPersonReplacementShotDurationSec(_0x5561c6), 0);
  const _0x535688 = createPersonReplacementShotCutDraft(_0x2673b0);
  const _0x5e80ae = countEditablePersonReplacementShotCuts(_0x535688);
  const _0x4f425f = _0x5e80ae > 0 || hasSplittablePersonReplacementShotCut(_0x535688);
  const _0x4d4464 = _0x2673b0.workspace.selectedShotIds;
  const _0x11c629 = _0x493a71.length > 0 && _0x493a71.every(_0x302894 => _0x4d4464.includes(_0x302894.id));
  const _0x1c3f2 = _0xbd92fc ? _0x493a71.filter(_0x4238f6 => isPersonReplacementVideoGenerationActive(resolvePersonReplacementVideoGenerationState(_0x2673b0.workspace, _0x4238f6.id))).map(_0x1cf5ff => normalizeText(_0x1cf5ff.id)) : _0x493a71.filter(_0x2cc733 => resolvePersonReplacementImageGenerationState(_0x2673b0.workspace, _0x2cc733.id).status === "running").map(_0x427fb8 => normalizeText(_0x427fb8.id));
  const _0xd2c501 = [...new Set([...(Array.isArray(batchGeneratingShotIds) ? batchGeneratingShotIds : []), ..._0x1c3f2].map(normalizeText).filter(Boolean))];
  const _0x43b869 = {
    data: {
      assets: [],
      project: {}
    },
    assetFilter: "scene",
    selectedAssetId: _0x2673b0.workspace.selectedShotId,
    selectedAssetIds: _0x4d4464,
    assetSelectionMode: _0x2673b0.workspace.shotSelectionMode,
    assetAppearanceIndexes: {},
    generatingAppearanceKeys: _0xd2c501.map(_0x313872 => _0x313872 + ":keyframe"),
    isBatchGenerating: isBatchGenerating,
    batchGenerationActionLabel: _0xbd92fc ? "批量生成视频" : "批量生成替换图",
    batchCancelAction: "cancel-shot-batch-generation",
    batchCancelRequested: batchCancelRequested,
    batchGeneratingAssetIds: isBatchGenerating ? _0xd2c501 : [],
    allowDeleteAssetCard: false,
    allowAssetRename: false,
    hideAssetRoleTag: true,
    hideAssetNameTooltip: true
  };
  const _0x414083 = _0x2673b0.workspace.shotSelectionMode ? "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"toggle-all-shots\" aria-pressed=\"" + _0x11c629 + "\">" + (_0x11c629 ? "取消全选" : "全选") + "</button><button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-shot-selection\">取消</button>" + renderPersonReplacementBatchGenerationControl(_0x43b869) : (allowCutEditing ? "<button type=\"button\" class=\"story-secondary-button person-replacement-shot-split-trigger is-icon-only\" data-person-replacement-action=\"edit-shot-cuts\" data-tooltip=\"剪辑全部切口\" aria-label=\"剪辑全部切口\" " + (_0x4f425f ? "" : "disabled") + ">" + VIDEO_CLIP_ICON_SVG + "</button>" : "") + "<button type=\"button\" class=\"story-primary-button\" data-story-action=\"toggle-shot-selection\" " + (_0x493a71.length ? "" : "disabled") + ">框选多选</button>";
  const _0x458a88 = _0x493a71.map((_0x551f55, _0x80cc9b) => {
    const _0x40a2b2 = "片段" + String(_0x80cc9b + 1).padStart(2, "0");
    const _0x448e8c = getPersonReplacementImageResults(_0x551f55);
    const _0x1139bd = getPersonReplacementActiveImageResultIndex(_0x551f55, _0x448e8c);
    const _0x438c86 = resolvePersonReplacementImageResultRef(_0x448e8c[_0x1139bd]);
    const _0x89ef76 = _0xbd92fc ? getPersonReplacementVideoResults(_0x551f55) : [];
    const _0x21752e = _0xbd92fc ? getPersonReplacementActiveVideoResultIndex(_0x551f55, _0x89ef76) : 0;
    const _0x29b8de = _0x89ef76[_0x21752e] || null;
    const _0x37a3f2 = resolvePersonReplacementVideoResultRef(_0x29b8de) || normalizeText(_0x551f55.resultVideoRef);
    const _0x2d592b = resolvePersonReplacementVideoResultPosterRef(_0x29b8de);
    const _0x56f0fb = normalizeMediaUrl((_0xbd92fc ? _0x2d592b : "") || _0x438c86 || _0x551f55.keyframeRef);
    const _0x1fc6ed = formatClock(_0x551f55.startTimeSec) + "–" + formatClock(_0x551f55.endTimeSec);
    const _0x2ddc54 = _0xbd92fc ? _0x37a3f2 : _0x551f55.replacementImageRef;
    const _0x3313bc = _0x2ddc54 ? _0x1fc6ed + " · 已生成" : _0x1fc6ed;
    const _0x476375 = _0xbd92fc ? "data-person-replacement-video-history=\"" + (_0x89ef76.length > 1) + "\"" : "data-person-replacement-image-history=\"" + (_0x448e8c.length > 1) + "\"";
    const _0x33f22f = !_0xbd92fc && !_0x2673b0.workspace.shotSelectionMode && _0x448e8c.length === 1 ? renderReplacementImageReferenceButton(_0x551f55, 0) : "";
    return renderPersonReplacementAssetCard(_0x43b869, {
      id: _0x551f55.id,
      kind: "scene",
      name: _0x40a2b2,
      description: "",
      imageUrl: _0x56f0fb,
      appearances: [{
        id: "keyframe",
        name: _0xbd92fc && _0x37a3f2 ? "替换结果视频" : "检测帧",
        imageUrl: _0x56f0fb
      }]
    }, {
      statusText: _0x3313bc,
      cardClassName: "person-replacement-shot-card",
      cardAttributes: "data-person-replacement-shot-card=\"true\" data-shot-id=\"" + escapeHtml(_0x551f55.id) + "\" " + _0x476375 + " aria-current=\"" + (_0x551f55.id === _0x2673b0.workspace.selectedShotId ? "true" : "false") + "\" aria-label=\"" + escapeHtml(_0x40a2b2 + "，" + formatClock(_0x551f55.startTimeSec) + " 到 " + formatClock(_0x551f55.endTimeSec) + (_0x2ddc54 ? _0xbd92fc ? "，替换视频已生成" : "，替换图已生成" : "")) + "\"",
      shellClassName: _0x33f22f ? "person-replacement-shot-card-shell" : "",
      accessoryHtml: _0x33f22f
    });
  }).join("");
  const _0x589230 = _0x2673b0.workspace.shotSelectionMode ? "已选择 " + _0x4d4464.length + " 项" : _0xbd92fc ? "点击片段同步切换原视频、替换结果与生成设置" : "点击片段切换预览，拖拽空白区域可框选；将左侧目标形象拖到上方人物框建立替换关系";
  const _0x563c45 = "data-story-marquee-surface=\"shots\" tabindex=\"0\"";
  return "<section class=\"person-replacement-shot-timeline\" aria-label=\"镜头片段网格\">\n    <header class=\"person-replacement-shot-timeline-header\"><div><strong>镜头片段</strong><span>" + _0x493a71.length + " 个片段 · " + formatClock(_0x43e504) + "</span></div><div class=\"person-replacement-shot-timeline-actions\"><small>" + _0x589230 + "</small>" + _0x414083 + "</div></header>\n    <div class=\"person-replacement-shot-timeline-scroll\" data-person-replacement-shot-timeline-scroll " + _0x563c45 + ">\n      <div class=\"person-replacement-shot-grid story-asset-grid\">" + (_0x458a88 || "<div class=\"person-replacement-shot-timeline-empty-state\">镜头切分完成后会显示在这里</div>") + "</div>\n    </div>\n  </section>";
}
function renderShotCutEditor(_0x1ca814, _0x228dae = [], {
  submitting = false,
  keyframeCapturing = false,
  smartDetecting = false,
  playheadSec = 0,
  previewShotId = "",
  timelineZoom = 1,
  soundEnabled = false,
  canUndo = false,
  selectedShotIds = []
} = {}, _0x5e9b56 = () => "") {
  const _0x1a688e = new Map((_0x1ca814.shots || []).map(_0x1569a6 => [_0x1569a6.id, _0x1569a6]));
  const _0x258a54 = getPersonReplacementShotCutTotalDuration(_0x228dae);
  const _0x492fe6 = getPersonReplacementShotCutDisplayDuration(_0x228dae);
  const _0x443ea9 = countEditablePersonReplacementShotCuts(_0x228dae);
  const _0x4ab3f1 = hasPersonReplacementShotCutUpdateChanges(_0x1ca814.shots, _0x228dae);
  const _0xcd2184 = resolveShotCutSubmissionUi(submitting, smartDetecting);
  const {
    reversePending: _0x35121f,
    cutSubmitting: _0x375ab9,
    editorBusy: _0x53aa90
  } = _0xcd2184;
  const _0x7813ed = _0x53aa90 || keyframeCapturing;
  const _0x103224 = _0x53aa90 ? renderWorkspaceAssetLoadingOverlay({
    title: _0xcd2184.loadingTitle,
    description: _0xcd2184.loadingDescription
  }) : "";
  const _0x1e50f3 = getMediaClipTimelineTrackWidthPx({
    durationSec: _0x258a54,
    viewportWidthPx: PERSON_REPLACEMENT_CUT_BASE_VIEWPORT_WIDTH_PX,
    zoom: timelineZoom
  });
  const _0x1c5c0c = clamp(playheadSec, 0, _0x258a54, 0);
  const _0xb019e3 = getPersonReplacementShotCutPositionAtTimelineSec(_0x228dae, _0x1c5c0c);
  const _0x5defea = _0x228dae[_0xb019e3.shotIndex] || null;
  const _0x530479 = new Set((Array.isArray(selectedShotIds) ? selectedShotIds : []).map(normalizeText).filter(Boolean));
  const _0x1e955e = _0x530479.size === 2;
  const _0x9a532e = _0x1e955e && canMergePersonReplacementShotCutRanges(_0x228dae, [..._0x530479]);
  const _0x4e3349 = Boolean(_0x5defea && canSplitPersonReplacementShotCutRange(_0x5defea, _0xb019e3.sourceTimeSec - (Number(_0x5defea.startSec) || 0)));
  const _0x325811 = renderPersonReplacementShotCutRulerTicks(_0x258a54, _0x1e50f3, _0x492fe6, getPersonReplacementShotCutRulerFrameRate(_0x228dae));
  let _0x228108 = 0;
  const _0x341adc = [];
  const _0xc55c8b = [];
  const _0x2c5f98 = _0x228dae.map((_0x1540a4, _0x23bc31) => {
    const _0x4831c7 = _0x1a688e.get(_0x1540a4.shotId) || _0x1a688e.get(_0x1540a4.originShotId) || {};
    const _0x555e7a = Math.max(PERSON_REPLACEMENT_CUT_MIN_SEC, _0x1540a4.durationSec);
    const _0x4104c8 = _0x228108;
    _0x228108 += _0x555e7a;
    const _0x436b42 = getMediaClipTimelineRangeRect({
      startSec: _0x4104c8,
      endSec: _0x228108,
      durationSec: _0x258a54,
      trackWidthPx: _0x1e50f3,
      minWidthPct: 0
    });
    const _0x3895e8 = "片段" + String(_0x23bc31 + 1).padStart(2, "0");
    _0x341adc.push("<span class=\"person-replacement-shot-cut-segment-label\" data-person-replacement-cut-segment-label=\"" + _0x23bc31 + "\" style=\"left:" + _0x436b42.leftPct.toFixed(5) + "%;width:" + _0x436b42.widthPct.toFixed(5) + "%\" aria-hidden=\"true\">" + _0x3895e8 + "</span>");
    if (_0x1540a4.keyframeManuallySelected === true && normalizeText(_0x1540a4.keyframeRef)) {
      const _0x3651cf = getPersonReplacementShotCutTimelineSec(_0x228dae, _0x1540a4.shotId, _0x1540a4.keyframeTimeSec);
      const _0x5c1c95 = clamp(_0x3651cf / _0x492fe6 * 100, 0, 100, 0);
      const _0x42c898 = _0x5c1c95 < 5 ? " is-start" : _0x5c1c95 > 95 ? " is-end" : "";
      const _0x4c88d9 = _0x3895e8 + " 关键帧";
      _0xc55c8b.push("<div class=\"person-replacement-shot-cut-keyframe-marker" + _0x42c898 + "\" data-person-replacement-keyframe-marker=\"" + _0x23bc31 + "\" style=\"left:" + _0x5c1c95.toFixed(5) + "%\" role=\"note\" aria-label=\"" + _0x4c88d9 + "\"><span aria-hidden=\"true\">" + _0x4c88d9 + "</span></div>");
    }
    const _0x8429d = _0x23bc31 > 0 && _0x228dae[_0x23bc31 - 1]?.sourceId !== _0x1540a4.sourceId;
    const _0x57264e = normalizeText(previewShotId) === normalizeText(_0x1540a4.shotId);
    const _0x34cbc1 = _0x530479.has(normalizeText(_0x1540a4.shotId));
    const _0x2ae9b6 = _0x228dae[_0x23bc31 - 1];
    const _0x23d7d4 = _0x228dae[_0x23bc31 + 1];
    const _0xd9d139 = Boolean(_0x2ae9b6 && _0x2ae9b6.sourceId && _0x2ae9b6.sourceId === _0x1540a4.sourceId);
    const _0x2467d4 = Boolean(_0x23d7d4 && _0x23d7d4.sourceId && _0x23d7d4.sourceId === _0x1540a4.sourceId);
    const _0x3aeb07 = _0xd9d139 ? "<button type=\"button\" class=\"person-replacement-shot-cut-boundary media-clip-trim media-clip-trim-left\" data-person-replacement-cut-boundary-index=\"" + _0x23bc31 + "\" data-person-replacement-cut-boundary-side=\"left\" role=\"slider\" aria-label=\"调整片段 " + (_0x23bc31 + 1) + " 的左切口\" aria-valuemin=\"" + (_0x2ae9b6.startSec + getPersonReplacementShotCutFrameSec(_0x2ae9b6, _0x1540a4)).toFixed(4) + "\" aria-valuemax=\"" + (_0x1540a4.endSec - getPersonReplacementShotCutFrameSec(_0x2ae9b6, _0x1540a4)).toFixed(4) + "\" aria-valuenow=\"" + _0x1540a4.startSec.toFixed(4) + "\"><span class=\"media-clip-trim-visual\" aria-hidden=\"true\"></span></button>" : "";
    const _0x40a41a = _0x2467d4 ? "<button type=\"button\" class=\"person-replacement-shot-cut-boundary media-clip-trim media-clip-trim-right\" data-person-replacement-cut-boundary-index=\"" + (_0x23bc31 + 1) + "\" data-person-replacement-cut-boundary-side=\"right\" role=\"slider\" aria-label=\"调整片段 " + (_0x23bc31 + 1) + " 的右切口\" aria-valuemin=\"" + (_0x1540a4.startSec + getPersonReplacementShotCutFrameSec(_0x1540a4, _0x23d7d4)).toFixed(4) + "\" aria-valuemax=\"" + (_0x23d7d4.endSec - getPersonReplacementShotCutFrameSec(_0x1540a4, _0x23d7d4)).toFixed(4) + "\" aria-valuenow=\"" + _0x1540a4.endSec.toFixed(4) + "\"><span class=\"media-clip-trim-visual\" aria-hidden=\"true\"></span></button>" : "";
    return "<div class=\"person-replacement-shot-cut-segment media-clip-segment media-clip-material-strip media-clip-segment-video " + (_0x57264e ? "is-previewing" : "") + " " + (_0x34cbc1 ? "is-merge-selected" : "") + " " + (_0x8429d ? "is-source-start" : "") + " " + (_0x1540a4.isReversed === true ? "is-reversed" : "") + "\" style=\"left:" + _0x436b42.leftPct.toFixed(5) + "%;width:" + _0x436b42.widthPct.toFixed(5) + "%\" data-person-replacement-action=\"preview-shot-cut\" data-person-replacement-shot-cut-selectable data-story-marquee-item data-story-marquee-id=\"" + escapeHtml(_0x1540a4.shotId) + "\" data-person-replacement-cut-shot-index=\"" + _0x23bc31 + "\" data-clip-index=\"" + _0x23bc31 + "\" data-media-kind=\"video\" data-shot-id=\"" + escapeHtml(_0x1540a4.shotId) + "\" " + (_0x57264e ? "data-selected-clip=\"true\"" : "") + " " + (_0x34cbc1 ? "data-person-replacement-cut-merge-selected=\"true\"" : "") + " " + (_0x1540a4.isReversed === true ? "data-person-replacement-cut-reversed=\"true\"" : "") + " role=\"button\" tabindex=\"0\" aria-pressed=\"" + _0x57264e + "\" aria-label=\"" + escapeHtml((_0x4831c7.title || "片段 " + (_0x23bc31 + 1)) + "，" + formatClock(_0x1540a4.startSec) + " 到 " + formatClock(_0x1540a4.endSec) + (_0x1540a4.isReversed === true ? "，已设为倒放" : "") + (_0x34cbc1 ? "，已框选" : "")) + "\">\n      " + renderPersonReplacementShotCutFilmstrip(_0x4831c7, _0x1e50f3, _0x1540a4.keyframeRef) + "\n      <div class=\"media-clip-material-selection v2-video-clipselection person-replacement-shot-cut-selection\" style=\"left:0%;width:100%\" aria-hidden=\"true\"><div class=\"media-clip-material-label v2-video-cliplabel\" data-person-replacement-cut-duration=\"" + _0x23bc31 + "\">" + formatDurationLabel(_0x555e7a) + "</div></div>\n      " + (_0x1540a4.isReversed === true ? "<span class=\"person-replacement-shot-cut-reverse-badge\" aria-hidden=\"true\">倒放</span>" : "") + "\n      " + _0x3aeb07 + _0x40a41a + "\n    </div>";
  }).join("");
  const _0x10e785 = resolveMediaClipReverseControlState({
    isReversed: _0x5defea?.isReversed === true,
    pending: _0x35121f
  });
  const _0x117b0c = _0x10e785.isReversed;
  return "<section class=\"person-replacement-shot-cut-editor\" data-person-replacement-shot-cut-editor tabindex=\"-1\" aria-label=\"调整全部镜头切口\" aria-busy=\"" + _0x53aa90 + "\">\n    <header class=\"person-replacement-shot-timeline-header\">\n      <div><strong>调整全部切口</strong><span>" + _0x228dae.length + " 个片段 · " + _0x443ea9 + " 个可调切口</span><span class=\"person-replacement-shot-cut-clock\"><output data-person-replacement-shot-cut-current-time>" + formatPreciseClock(_0x1c5c0c) + "</output> / " + formatPreciseClock(_0x258a54) + "</span></div>\n      <div class=\"person-replacement-shot-cut-actions\">\n        <button type=\"button\" class=\"person-replacement-shot-cut-action person-replacement-shot-cut-sound is-icon-only " + (soundEnabled ? "is-sound-enabled" : "") + "\" data-person-replacement-action=\"toggle-shot-cut-sound\" data-tooltip=\"" + (soundEnabled ? "关闭声音" : "打开声音") + "\" aria-label=\"" + (soundEnabled ? "关闭声音" : "打开声音") + "\" aria-pressed=\"" + soundEnabled + "\" " + (_0x53aa90 ? "disabled" : "") + ">" + _0x5e9b56(soundEnabled ? "soundOn" : "soundOff") + "</button>\n        <button type=\"button\" class=\"person-replacement-shot-cut-action is-icon-only\" data-person-replacement-action=\"undo-shot-cut\" aria-keyshortcuts=\"Control+Z Meta+Z\" data-tooltip=\"撤回\" aria-label=\"撤回\" " + (_0x7813ed || !canUndo ? "disabled" : "") + ">" + _0x5e9b56("undo") + "</button>\n        <button type=\"button\" class=\"person-replacement-shot-cut-action is-icon-only\" data-person-replacement-action=\"reset-shot-cuts\" data-tooltip=\"重置\" aria-label=\"重置\" " + (_0x7813ed ? "disabled" : "") + ">" + _0x5e9b56("reset") + "</button>\n        <button type=\"button\" class=\"person-replacement-shot-cut-action person-replacement-shot-cut-cancel is-icon-only\" data-person-replacement-action=\"cancel-shot-cuts\" data-tooltip=\"取消\" aria-label=\"取消\" " + (_0x7813ed ? "disabled" : "") + ">" + _0x5e9b56("close") + "</button>\n        <button type=\"button\" class=\"person-replacement-shot-cut-action is-primary is-icon-only " + (_0x375ab9 ? "is-loading" : "") + "\" data-person-replacement-action=\"confirm-shot-cuts\" data-tooltip=\"" + (_0x375ab9 ? "正在应用切口" : "应用切口") + "\" aria-label=\"" + (_0x375ab9 ? "正在应用切口" : "应用切口") + "\" aria-busy=\"" + _0x375ab9 + "\" " + (_0x7813ed || !_0x4ab3f1 ? "disabled" : "") + ">" + renderWorkspaceConfirmIcon() + "</button>\n      </div>\n    </header>\n    <div class=\"person-replacement-shot-cut-shell media-clip-compact is-editing" + (_0x53aa90 ? " img-preview-loading" : "") + "\" aria-busy=\"" + _0x53aa90 + "\">\n      <div class=\"media-clip-compact-body\">\n        <div class=\"person-replacement-shot-cut-scroll media-clip-timeline-scroll\" data-person-replacement-shot-timeline-scroll data-story-marquee-surface=\"shot-cuts\" tabindex=\"0\">\n          <div class=\"person-replacement-shot-cut-timeline media-clip-compact-timeline is-editing\" data-person-replacement-shot-cut-timeline style=\"--media-clip-track-content-width:" + _0x1e50f3 + "px;--media-clip-timeline-content-width:" + _0x1e50f3 + "px;--media-clip-track-axis-width:0px;--cut-total-duration:" + _0x258a54.toFixed(5) + "\">\n            <div class=\"media-clip-ruler person-replacement-shot-cut-ruler\" aria-hidden=\"true\">" + _0x325811 + "</div>\n            <div class=\"media-clip-timeline-lane\">\n              <div class=\"media-clip-timeline-tracks\">\n                <div class=\"person-replacement-shot-cut-track media-clip-track media-clip-track-video is-active\" data-person-replacement-shot-cut-track>" + (_0x2c5f98 || "<div class=\"person-replacement-shot-timeline-empty-state\">暂无可调整的镜头切口</div>") + "</div>\n              </div>\n            </div>\n            <div class=\"person-replacement-shot-cut-annotations\">" + _0x341adc.join("") + _0xc55c8b.join("") + "</div>\n            <div class=\"media-clip-timeline-cursors person-replacement-shot-cut-cursors\" aria-hidden=\"true\">\n              <div class=\"media-clip-playhead media-clip-timeline-cursor media-clip-timeline-cursor-fixed person-replacement-shot-cut-playhead\" data-person-replacement-shot-cut-playhead style=\"left:" + (_0x1c5c0c / _0x492fe6 * 100).toFixed(4) + "%\"></div>\n              <div class=\"media-clip-hover-playhead media-clip-timeline-cursor media-clip-timeline-cursor-hover person-replacement-shot-cut-hover-playhead\" data-person-replacement-shot-cut-hover-playhead hidden></div>\n            </div>\n          </div>\n        </div>\n      </div>\n      " + _0x103224 + "\n    </div>\n    <div class=\"person-replacement-shot-cut-primary-actions\" aria-label=\"片段编辑工具\">\n      <button type=\"button\" class=\"person-replacement-shot-cut-action is-icon-only " + (keyframeCapturing ? "is-loading" : "") + "\" data-person-replacement-action=\"capture-shot-keyframe\" data-tooltip=\"" + (keyframeCapturing ? "正在获取关键帧" : "获取关键帧") + "\" aria-label=\"" + (keyframeCapturing ? "正在获取关键帧" : "获取关键帧") + "\" aria-busy=\"" + keyframeCapturing + "\" " + (_0x53aa90 || keyframeCapturing || _0xb019e3.shotIndex < 0 ? "disabled" : "") + ">" + renderWorkspaceKeyframeIcon() + "</button>\n      <button type=\"button\" class=\"person-replacement-shot-cut-action person-replacement-shot-cut-split is-icon-only\" data-person-replacement-action=\"split-shot-cut\" aria-keyshortcuts=\"C\" data-tooltip=\"裁剪（C）\" aria-label=\"裁剪（C）\" " + (_0x7813ed || !_0x4e3349 ? "disabled" : "") + ">" + VIDEO_CLIP_ICON_SVG + "</button>\n      <button type=\"button\" class=\"person-replacement-shot-cut-action person-replacement-shot-cut-reverse is-icon-only " + (_0x35121f ? "is-loading" : _0x117b0c ? "is-active" : "") + "\" data-person-replacement-action=\"toggle-shot-cut-reverse\" data-tooltip=\"" + _0x10e785.label + "\" aria-label=\"" + _0x10e785.label + "\" aria-busy=\"" + _0x10e785.ariaBusy + "\" aria-pressed=\"" + _0x10e785.ariaPressed + "\" " + (_0x7813ed || _0xb019e3.shotIndex < 0 ? "disabled" : "") + ">" + _0x5e9b56("reverse") + "</button>\n      " + (_0x1e955e ? "<button type=\"button\" class=\"person-replacement-shot-cut-action person-replacement-shot-cut-merge is-icon-only\" data-person-replacement-action=\"merge-shot-cuts\" data-tooltip=\"合并片段\" aria-label=\"合并片段\" " + (_0x7813ed || !_0x9a532e ? "disabled" : "") + ">" + _0x5e9b56("merge") + "</button>" : "") + "\n    </div>\n    <div class=\"person-replacement-shot-cut-helper-row\" aria-label=\"时间轴操作提示\">\n      <div class=\"person-replacement-shot-cut-helper-left\">\n        <span class=\"person-replacement-shot-cut-helper-msg\" style=\"--person-replacement-shot-cut-helper-index:0\"><kbd>Space</kbd><span>播放 / 暂停</span></span>\n        <span class=\"person-replacement-shot-cut-helper-msg\" style=\"--person-replacement-shot-cut-helper-index:1\"><kbd>← →</kbd><span>逐帧移动播放头</span></span>\n        <span class=\"person-replacement-shot-cut-helper-msg\" style=\"--person-replacement-shot-cut-helper-index:2\"><kbd>C</kbd><span>在播放头处增加切口</span></span>\n        <span class=\"person-replacement-shot-cut-helper-msg\" style=\"--person-replacement-shot-cut-helper-index:3\"><kbd>Ctrl / ⌘ Z</kbd><span>撤回上一步裁剪操作</span></span>\n        <span class=\"person-replacement-shot-cut-helper-msg\" style=\"--person-replacement-shot-cut-helper-index:4\"><kbd>Ctrl / ⌘ + −</kbd><span>缩放时间轴</span></span>\n        <span class=\"person-replacement-shot-cut-helper-msg\" style=\"--person-replacement-shot-cut-helper-index:5\"><kbd>拖动切口</kbd><span>左右片段同步伸缩</span></span>\n      </div>\n    </div>\n  </section>";
}
function renderShotTimelineStage(_0x1a4c21, {
  cutEditorOpen = false,
  cutEditorOpening = false,
  cutEditorMotion = "",
  cutEditorDraft = [],
  cutEditorSubmitting = false,
  cutEditorKeyframeCapturing = false,
  cutEditorSmartDetecting = false,
  cutEditorPlayheadSec = 0,
  cutEditorPreviewShotId = "",
  cutEditorTimelineZoom = 1,
  cutEditorSoundEnabled = false,
  cutEditorSelectedShotIds = [],
  cutEditorCanUndo = false,
  allowCutEditing = false,
  timelineMode = "image",
  shotBatchGenerationActive = false,
  shotBatchGeneratingShotIds = [],
  shotBatchCancelRequested = false
} = {}, _0x19caeb = () => "") {
  const _0x57d034 = cutEditorOpen && cutEditorMotion !== "to-timeline";
  const _0x5b3758 = cutEditorMotion === "to-editor" ? "is-flipping-to-editor" : cutEditorMotion === "to-timeline" ? "is-flipping-to-timeline" : "";
  const _0x263be3 = Boolean(_0x5b3758);
  const _0x1943c0 = cutEditorOpening ? " is-cut-editor-loading img-preview-loading" : "";
  const _0x272f0d = _0x57d034 || cutEditorOpening;
  return "<div class=\"person-replacement-shot-timeline-stage " + (_0x57d034 ? "is-editor" : "is-timeline") + " " + (_0x263be3 ? "is-animating" : "is-settled") + _0x1943c0 + "\" data-person-replacement-shot-timeline-stage aria-busy=\"" + cutEditorOpening + "\"" + (cutEditorOpening ? " aria-label=\"视频加载中，正在准备裁剪预览\"" : "") + ">\n    <div class=\"person-replacement-shot-timeline-cube " + _0x5b3758 + "\">\n      <div class=\"person-replacement-shot-timeline-face person-replacement-shot-timeline-face--timeline\" aria-hidden=\"" + _0x57d034 + "\" " + (_0x272f0d ? "inert" : "") + ">" + renderShotTimeline(_0x1a4c21, {
    allowCutEditing: allowCutEditing,
    mode: timelineMode,
    isBatchGenerating: shotBatchGenerationActive,
    batchGeneratingShotIds: shotBatchGeneratingShotIds,
    batchCancelRequested: shotBatchCancelRequested
  }) + "</div>\n      <div class=\"person-replacement-shot-timeline-face person-replacement-shot-timeline-face--editor\" aria-hidden=\"" + !_0x57d034 + "\" " + (_0x57d034 ? "" : "inert") + ">" + renderShotCutEditor(_0x1a4c21, cutEditorDraft, {
    submitting: cutEditorSubmitting,
    keyframeCapturing: cutEditorKeyframeCapturing,
    smartDetecting: cutEditorSmartDetecting,
    playheadSec: cutEditorPlayheadSec,
    previewShotId: cutEditorPreviewShotId,
    timelineZoom: cutEditorTimelineZoom,
    soundEnabled: cutEditorSoundEnabled,
    selectedShotIds: cutEditorSelectedShotIds,
    canUndo: cutEditorCanUndo
  }, _0x19caeb) + "</div>\n    </div>\n    " + (cutEditorOpening ? renderWorkspaceAssetLoadingOverlay({
    title: "视频加载中",
    description: "正在准备裁剪预览，加载完成后会自动进入。"
  }) : "") + "\n  </div>";
}
export function createPersonReplacementShotTimelinePresentation({
  renderIcon = () => ""
} = {}) {
  const _0xd97643 = typeof renderIcon === "function" ? renderIcon : () => "";
  return Object.freeze({
    renderHistoryMenu({
      kind = "image",
      shot = {},
      title = "镜头片段",
      allowSingleResult = false
    } = {}) {
      const _0x574833 = {
        allowSingleResult: allowSingleResult
      };
      if (kind === "video") {
        return renderReplacementVideoHistoryMenu(shot, title, _0x574833);
      } else {
        return renderReplacementImageHistoryMenu(shot, title, _0x574833);
      }
    },
    renderTimeline: renderShotTimeline,
    renderStage(_0xe0cc35, _0x3e69f6 = {}) {
      return renderShotTimelineStage(_0xe0cc35, _0x3e69f6, _0xd97643);
    }
  });
}