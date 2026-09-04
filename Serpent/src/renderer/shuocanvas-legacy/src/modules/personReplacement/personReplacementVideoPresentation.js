import { PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID, PERSON_REPLACEMENT_DEFAULT_VIDEO_PROMPT, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME, PERSON_REPLACEMENT_VIDEO_MODEL_IDS, PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE, getPersonReplacementActiveVideoResultIndex, getPersonReplacementVideoResults, resolvePersonReplacementVideoGenerationFps, resolvePersonReplacementVideoImageInput, resolvePersonReplacementVideoParameterPolicy, resolvePersonReplacementVideoResultRef } from "./personReplacementProject.js";
import { isPersonReplacementVideoGenerationActive, resolvePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
import { resolvePersonReplacementVideoSlotState } from "./personReplacementVideoInputs.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { renderAIGenVideoModelSelectorMarkup } from "../../components/aigenVideo/modelSelector.js";
import { VIDEO_CLIP_ICON_SVG } from "../../components/nodeToolbar/videoToolbarHtml.js";
import { getModelManifest, resolveModelProvider } from "../../manifests/index.js";
import { renderWorkspaceAssetLoadingOverlay } from "../workspaceAssetPresentation.js";
import { renderPersonReplacementPreviewArrow } from "./personReplacementAssetPresentation.js";
import { renderWorkspaceVideoPlaybackControls } from "../workspaceVideoPlaybackControls.js";
import { normalizePersonReplacementLayout } from "./personReplacementProjectSession.js";
import { renderPersonReplacementPromptHtml } from "./personReplacementPromptMentions.js";
export const PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS = Object.freeze({
  MISSING_SHOT: "missing-shot",
  GENERATION_RUNNING: "generation-running",
  SOURCE_PREPARING: "source-preparing",
  SOURCE_PREPARATION_FAILED: "source-preparation-failed",
  MISSING_SOURCE_VIDEO: "missing-source-video",
  MULTIPLE_IMAGE_REFERENCES: "multiple-image-references",
  MISSING_IMAGE_INPUT: "missing-image-input"
});
function normalizeText(_0x50cf6d) {
  return String(_0x50cf6d ?? "").trim();
}
function buildVideoStageFrameStyle(_0xe19980 = {}) {
  const _0x265e87 = Math.max(1, Number(_0xe19980?.frame?.width) || 16);
  const _0x255de0 = Math.max(1, Number(_0xe19980?.frame?.height) || 9);
  return "--frame-aspect:" + _0x265e87 + " / " + _0x255de0 + ";" + ("--frame-width:" + _0x265e87 + ";--frame-height:" + _0x255de0);
}
export function syncPersonReplacementVideoStageFrame(_0x1fa224) {
  const _0x1e82fd = Math.max(0, Number(_0x1fa224?.videoWidth) || 0);
  const _0x30621a = Math.max(0, Number(_0x1fa224?.videoHeight) || 0);
  const _0x2dc45f = _0x1fa224?.closest?.("[data-person-replacement-video-playback-stage]");
  if (!(_0x1e82fd > 0) || !(_0x30621a > 0) || !_0x2dc45f?.style) {
    return false;
  }
  _0x2dc45f.style.setProperty("--frame-aspect", _0x1e82fd + " / " + _0x30621a);
  _0x2dc45f.style.setProperty("--frame-width", String(_0x1e82fd));
  _0x2dc45f.style.setProperty("--frame-height", String(_0x30621a));
  return true;
}
function normalizeProgress(_0x13b085) {
  const _0x20668c = Number(_0x13b085);
  if (!Number.isFinite(_0x20668c)) {
    return 0;
  }
  return Math.max(0, Math.min(100, _0x20668c));
}
function resolveSelectedShot(_0x2cc742 = {}, _0x1dca1a = "") {
  const _0x1730bf = Array.isArray(_0x2cc742?.shots) ? _0x2cc742.shots : [];
  const _0x4a3d02 = normalizeText(_0x1dca1a || _0x2cc742?.workspace?.selectedShotId);
  return _0x1730bf.find(_0x301bbc => normalizeText(_0x301bbc?.id) === _0x4a3d02) || _0x1730bf[0] || null;
}
function buildPreparationPresentation(_0x385b73, _0x22a6e0, _0x50ca75, _0x35754b) {
  const _0x474943 = _0x385b73?.workspace?.videoPreparation;
  const _0x55fe29 = _0x474943 && typeof _0x474943 === "object" && !Array.isArray(_0x474943) ? _0x474943 : {};
  const _0x414641 = normalizeText(_0x55fe29.status).toLowerCase() || "idle";
  const _0x13eac8 = normalizeText(_0x22a6e0?.materializationStatus).toLowerCase() || "idle";
  const _0x3717d9 = !_0x35754b && Boolean(_0x50ca75?.pending === true || _0x13eac8 === "running" || _0x414641 === "running");
  const _0x1c22be = !_0x35754b && Boolean(_0x13eac8 === "failed" || _0x414641 === "failed" && normalizeText(_0x55fe29.error));
  const _0x2b009a = _0x13eac8 === "running" ? normalizeProgress(_0x22a6e0?.materializationProgress) : normalizeProgress(_0x55fe29.progress);
  return {
    status: _0x414641,
    progress: _0x2b009a,
    error: normalizeText(_0x22a6e0?.error || _0x55fe29.error),
    materializationStatus: _0x13eac8,
    isRunning: _0x414641 === "running" || _0x13eac8 === "running",
    sourcePending: _0x3717d9,
    sourceFailed: _0x1c22be
  };
}
function buildGenerationEligibility({
  shot: _0x3fd716,
  generation: _0x1800fe,
  preparation: _0x1ac0d2,
  sourceReady: _0x46ce04,
  imageInput: _0x5251cd
}) {
  if (!_0x3fd716) {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.MISSING_SHOT
    };
  }
  if (_0x1800fe.isActive) {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.GENERATION_RUNNING
    };
  }
  if (_0x1ac0d2.sourcePending) {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.SOURCE_PREPARING
    };
  }
  if (_0x1ac0d2.sourceFailed) {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.SOURCE_PREPARATION_FAILED
    };
  }
  if (!_0x46ce04) {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.MISSING_SOURCE_VIDEO
    };
  }
  if (_0x5251cd.status === "multiple") {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.MULTIPLE_IMAGE_REFERENCES
    };
  }
  if (_0x5251cd.status !== "ready") {
    return {
      canGenerate: false,
      reason: PERSON_REPLACEMENT_VIDEO_GENERATION_BLOCK_REASONS.MISSING_IMAGE_INPUT
    };
  }
  return {
    canGenerate: true,
    reason: ""
  };
}
function buildOutputPresentation(_0x22afb1, _0x182b69) {
  const _0x22dbc0 = _0x22afb1?.output && typeof _0x22afb1.output === "object" && !Array.isArray(_0x22afb1.output) ? _0x22afb1.output : {};
  const _0x4ed4b1 = normalizeText(_0x22dbc0.composeStatus).toLowerCase() || "idle";
  const _0x37f5df = normalizeText(_0x22dbc0.originalMasterRef);
  const _0x1cfcb8 = normalizeText(_0x22dbc0.visualMasterRef);
  const _0x3e6c7f = normalizeText(_0x22dbc0.finalVideoRef);
  const _0xbba014 = normalizeText(_0x22dbc0.finalAudioTrack);
  const _0x56319f = Array.isArray(_0x22dbc0.composedShotIds) ? _0x22dbc0.composedShotIds.map(normalizeText).filter(Boolean) : [];
  const _0x551b06 = _0x3e6c7f || _0x1cfcb8;
  return {
    composeStatus: _0x4ed4b1,
    originalMasterRef: _0x37f5df,
    visualMasterRef: _0x1cfcb8,
    finalVideoRef: _0x3e6c7f,
    finalAudioTrack: _0xbba014,
    composedShotIds: _0x56319f,
    previewVideoRef: _0x551b06,
    compositionAvailable: Boolean(_0x4ed4b1 === "succeeded" && _0x37f5df && _0x551b06),
    finalVideoAvailable: Boolean(_0x3e6c7f),
    selectedShotComposed: Boolean(_0x182b69 && _0x56319f.includes(_0x182b69))
  };
}
export function buildPersonReplacementVideoPresentation(_0x739a16 = {}, {
  shotId: _0xe6d8f1 = ""
} = {}) {
  const _0x2f0316 = resolveSelectedShot(_0x739a16, _0xe6d8f1);
  const _0x1d72b7 = normalizeText(_0x2f0316?.id);
  const _0xc04917 = resolvePersonReplacementVideoImageInput(_0x739a16, _0x2f0316);
  const _0x1e0182 = resolvePersonReplacementVideoSlotState(_0x739a16, _0x2f0316);
  const _0x5d071d = resolvePersonReplacementVideoGenerationState(_0x739a16?.workspace, _0x1d72b7);
  const _0x3a172e = {
    ..._0x5d071d,
    isActive: isPersonReplacementVideoGenerationActive(_0x5d071d)
  };
  const _0x446acb = getPersonReplacementVideoResults(_0x2f0316);
  const _0x55a15d = getPersonReplacementActiveVideoResultIndex(_0x2f0316, _0x446acb);
  const _0x54154d = _0x446acb[_0x55a15d] || null;
  const _0x2c0a93 = resolvePersonReplacementVideoResultRef(_0x54154d);
  const _0x37c9f8 = _0x1e0182.inputsBySlot?.sourceVideo || null;
  const _0x1e46b0 = Boolean(_0x1e0182.slotEntries?.sourceVideo?.url);
  const _0x1de98c = buildPreparationPresentation(_0x739a16, _0x2f0316, _0x37c9f8, _0x1e46b0);
  const _0x3aa766 = {
    sourceRef: normalizeText(_0x2f0316?.videoRef || (_0x1e46b0 ? _0x37c9f8?.url : "")),
    sourceInputRef: normalizeText(_0x37c9f8?.url),
    sourceReady: _0x1e46b0,
    sourcePending: _0x1de98c.sourcePending,
    resultRef: _0x2c0a93 || normalizeText(_0x2f0316?.resultVideoRef),
    resultPosterRef: normalizeText(_0x2f0316?.replacementImageRef || _0x2f0316?.keyframeRef)
  };
  return {
    shot: _0x2f0316,
    shotId: _0x1d72b7,
    imageInput: _0xc04917,
    slotState: _0x1e0182,
    generation: _0x3a172e,
    preparation: _0x1de98c,
    history: {
      results: _0x446acb,
      activeIndex: _0x55a15d,
      activeResult: _0x54154d,
      activeResultRef: _0x2c0a93,
      count: _0x446acb.length,
      hasMultipleResults: _0x446acb.length > 1
    },
    media: _0x3aa766,
    eligibility: buildGenerationEligibility({
      shot: _0x2f0316,
      generation: _0x3a172e,
      preparation: _0x1de98c,
      sourceReady: _0x1e46b0,
      imageInput: _0xc04917
    }),
    output: buildOutputPresentation(_0x739a16, _0x1d72b7)
  };
}
function escapeHtml(_0x28ba15) {
  return String(_0x28ba15 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeMediaUrl(_0x394cc3) {
  const _0xdf7f8 = normalizeText(_0x394cc3);
  if (_0xdf7f8) {
    return localPathToUrl(_0xdf7f8) || _0xdf7f8;
  } else {
    return "";
  }
}
function renderVideoInputModeControl(_0x59e63a) {
  const _0x3a94d1 = _0x59e63a.settings.replacementVideoInputMode;
  const _0x5b67ee = [[PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME, "替换首帧"], [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE, "人物参考图"]];
  return "<div class=\"person-replacement-video-input-mode\" role=\"group\" aria-label=\"视频替换入参模式\">\n    " + _0x5b67ee.map(([_0x4813bc, _0x4d0294]) => "<button type=\"button\" class=\"" + (_0x3a94d1 === _0x4813bc ? "is-active" : "") + "\" data-person-replacement-action=\"set-video-input-mode\" data-person-replacement-video-input-mode=\"" + _0x4813bc + "\" aria-pressed=\"" + (_0x3a94d1 === _0x4813bc) + "\">" + _0x4d0294 + "</button>").join("") + "\n  </div>";
}
function renderVideoNodeCenterPlayIndicator() {
  return "<span class=\"video-center-indicator person-replacement-video-center-indicator\" data-person-replacement-video-center-play aria-hidden=\"true\"><span class=\"indicator-inner\"><svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><polygon points=\"6 4 20 12 6 20 6 4\"></polygon></svg></span></span>";
}
function renderVideoReplacementPlaybackControls(_0x54b782 = {}, {
  role = "source",
  context = "video-replacement",
  disabled = false
} = {}) {
  const _0x15f77f = context === "comparison";
  const _0x5668a7 = role === "result" ? "result" : "source";
  const _0x2fb3b5 = _0x15f77f ? "原视频和替换视频" : _0x5668a7 === "result" ? "替换结果" : "当前片段";
  return renderWorkspaceVideoPlaybackControls({
    label: _0x2fb3b5,
    disabled: disabled,
    className: _0x15f77f ? "person-replacement-video-playback-controls person-replacement-compare-playback-controls" : "person-replacement-video-playback-controls",
    controlsAttributes: _0x15f77f ? {
      "data-person-replacement-compare-playback-controls": true
    } : {
      "data-person-replacement-video-controls": _0x5668a7,
      "data-person-replacement-video-label": _0x2fb3b5
    },
    playAttributes: _0x15f77f ? {
      "data-person-replacement-compare-playback-control": true,
      "data-person-replacement-action": "toggle-comparison-playback",
      "aria-pressed": "false"
    } : {
      "data-person-replacement-video-play": true
    },
    currentTimeAttributes: {
      [_0x15f77f ? "data-person-replacement-compare-current-time" : "data-person-replacement-video-time-current"]: true
    },
    progressAttributes: {
      [_0x15f77f ? "data-person-replacement-compare-progress" : "data-person-replacement-video-progress"]: true
    },
    progressFillAttributes: {
      [_0x15f77f ? "data-person-replacement-compare-progress-fill" : "data-person-replacement-video-progress-fill"]: true
    },
    totalTimeAttributes: {
      [_0x15f77f ? "data-person-replacement-compare-total-time" : "data-person-replacement-video-time-total"]: true
    },
    volumeAttributes: {
      [_0x15f77f ? "data-person-replacement-compare-volume" : "data-person-replacement-video-volume"]: true
    },
    volumeToggleAttributes: {
      [_0x15f77f ? "data-person-replacement-compare-volume-toggle" : "data-person-replacement-video-volume-toggle"]: true
    },
    playLabel: "播放" + _0x2fb3b5,
    progressLabel: _0x15f77f ? "同步播放进度" : _0x2fb3b5 + "播放进度",
    volumeLabel: _0x2fb3b5 + "音量",
    volumeToggleLabel: "静音" + _0x2fb3b5,
    slots: {
      afterPlay: !_0x15f77f && _0x5668a7 === "result" ? "<button type=\"button\" class=\"person-replacement-video-sync-toggle\" data-person-replacement-action=\"toggle-video-replacement-sync-playback\" data-person-replacement-video-sync-play data-tooltip=\"同步播放\" aria-label=\"开启同步播放\" aria-pressed=\"false\">\n      <svg class=\"person-replacement-video-sync-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15\"></path><path d=\"M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15\"></path></svg>\n    </button>" : "",
      beforeVolume: !_0x15f77f && _0x5668a7 === "source" ? "<button type=\"button\" class=\"video-snap-btn story-video-snap-btn story-video-clip-btn\" data-person-replacement-action=\"trim-current-video\" data-shot-id=\"" + escapeHtml(_0x54b782.id) + "\" aria-label=\"裁剪当前片段\">\n        " + VIDEO_CLIP_ICON_SVG + "\n      </button>" : ""
    }
  });
}
function renderVideoReplacementPreview(_0x49864e, _0x1777af, _0x400de7) {
  const _0xde59fe = _0x1777af?.shot || null;
  const _0x2a407d = _0x1777af?.media || {};
  const _0x2f3813 = Math.max(0, _0x49864e.shots.indexOf(_0xde59fe));
  const _0x4837a9 = _0xde59fe?.title || "片段" + String(_0x2f3813 + 1).padStart(2, "0");
  const _0x12bec6 = _0x49864e.shots.length > 1;
  const _0x6b719e = _0x12bec6 ? "" + renderPersonReplacementPreviewArrow("previous", {
    action: "previous-shot",
    label: "上一个片段",
    className: "person-replacement-shot-navigation-arrow person-replacement-video-shot-navigation-arrow"
  }) + renderPersonReplacementPreviewArrow("next", {
    action: "next-shot",
    label: "下一个片段",
    className: "person-replacement-shot-navigation-arrow person-replacement-video-shot-navigation-arrow"
  }) : "";
  const _0x294dc9 = _0x12bec6 ? " data-person-replacement-shot-wheel=\"true\" aria-label=\"滚动鼠标滚轮切换原视频片段\"" : "";
  if (!_0x2a407d.sourceReady) {
    return "<div class=\"person-replacement-video-preview-panel person-replacement-middle-preview-slide\" aria-label=\"" + escapeHtml(_0x4837a9 + "原视频片段") + "\">\n      <div class=\"story-video-result person-replacement-video-preview\"" + _0x294dc9 + "><div class=\"person-replacement-inline-empty\">" + escapeHtml(_0x400de7) + "</div>" + _0x6b719e + "</div>\n    </div>";
  }
  const _0x834ce2 = normalizeMediaUrl(_0x2a407d.sourceRef);
  const _0x122eaf = normalizeMediaUrl(_0xde59fe.keyframeRef);
  const _0x3338b0 = buildVideoStageFrameStyle(_0xde59fe);
  return "<div class=\"person-replacement-video-preview-panel person-replacement-middle-preview-slide\" aria-label=\"" + escapeHtml(_0x4837a9 + "原视频片段") + "\">\n    <div class=\"story-video-result person-replacement-video-preview\"" + _0x294dc9 + ">\n      <div class=\"story-video-stage person-replacement-video-stage\" data-person-replacement-video-stage data-person-replacement-video-playback-stage=\"source\" data-person-replacement-video-url=\"" + escapeHtml(_0x834ce2) + "\" data-person-replacement-video-poster=\"" + escapeHtml(_0x122eaf) + "\" data-person-replacement-video-reversed=\"" + (_0xde59fe.materializedIsReversed === true) + "\" data-person-replacement-video-center-stage data-shot-id=\"" + escapeHtml(_0xde59fe.id) + "\" style=\"" + _0x3338b0 + "\">\n        <video data-person-replacement-video-player=\"source\" data-person-replacement-video-center-player data-person-replacement-video-url=\"" + escapeHtml(_0x834ce2) + "\" playsinline preload=\"metadata\" " + (_0x122eaf ? "poster=\"" + escapeHtml(_0x122eaf) + "\"" : "") + " aria-label=\"" + escapeHtml(_0x4837a9 + "原视频片段") + "\"></video>\n        " + renderVideoNodeCenterPlayIndicator() + "\n        " + renderVideoReplacementPlaybackControls(_0xde59fe, {
    role: "source"
  }) + "\n      </div>\n      " + _0x6b719e + "\n    </div>\n  </div>";
}
function renderVideoReplacementResult(_0x4e3bbb, {
  isGenerating = false
} = {}) {
  const _0x522d16 = _0x4e3bbb?.shot || null;
  const _0x14a1f2 = _0x4e3bbb?.history || {};
  const _0x435417 = _0x4e3bbb?.media || {};
  const _0x3db588 = Number(_0x14a1f2.activeIndex) || 0;
  const _0x2ba913 = normalizeText(_0x435417.resultRef);
  const _0x2074ab = _0x14a1f2.hasMultipleResults === true;
  const _0xb3cc44 = _0x2074ab ? "" + renderPersonReplacementPreviewArrow("previous", {
    action: "previous-replacement-video-result",
    label: "上一个生成版本",
    className: "person-replacement-video-result-arrow"
  }) + renderPersonReplacementPreviewArrow("next", {
    action: "next-replacement-video-result",
    label: "下一个生成版本",
    className: "person-replacement-video-result-arrow"
  }) : "";
  const _0x41a489 = _0x2074ab ? " data-person-replacement-video-result-wheel=\"true\" aria-label=\"滚动鼠标滚轮切换生成版本\"" : "";
  const _0x3b9b1b = isGenerating ? renderWorkspaceAssetLoadingOverlay({
    title: _0x4e3bbb?.generation?.status === "queued" ? "替换视频排队中" : "替换视频生成中",
    description: _0x4e3bbb?.generation?.status === "queued" ? "RunningHub 并发已占满，释放名额后会自动开始。" : "正在等待生成结果，完成后会自动显示。"
  }) : "";
  const _0x539011 = normalizeMediaUrl(_0x2ba913);
  const _0xaf4d8 = normalizeMediaUrl(_0x435417.resultPosterRef);
  const _0x379b08 = Math.max(Number(_0x14a1f2.count) || 0, _0x2ba913 ? 1 : 0);
  const _0x134663 = buildVideoStageFrameStyle(_0x522d16);
  const _0x36338a = _0x2ba913 ? "<div class=\"story-video-stage person-replacement-video-stage person-replacement-video-result-stage\" data-person-replacement-video-playback-stage=\"result\" data-person-replacement-video-url=\"" + escapeHtml(_0x539011) + "\" data-person-replacement-video-center-stage data-shot-id=\"" + escapeHtml(_0x522d16?.id || "") + "\" style=\"" + _0x134663 + "\">\n        <video data-person-replacement-video-player=\"result\" data-person-replacement-video-center-player data-person-replacement-video-url=\"" + escapeHtml(_0x539011) + "\" playsinline preload=\"metadata\"" + (_0xaf4d8 ? " poster=\"" + escapeHtml(_0xaf4d8) + "\"" : "") + " aria-label=\"替换视频生成版本 " + (_0x3db588 + 1) + "/" + _0x379b08 + "\"></video>\n        " + (isGenerating ? "" : renderVideoNodeCenterPlayIndicator()) + "\n        " + (isGenerating ? "" : renderVideoReplacementPlaybackControls(_0x522d16, {
    role: "result"
  })) + "\n      </div>" : "<span>生成视频显示在这里</span>";
  return "<div class=\"person-replacement-generation-preview person-replacement-video-result" + (isGenerating ? " img-preview-loading" : "") + "\" aria-busy=\"" + isGenerating + "\"" + _0x41a489 + "><div class=\"person-replacement-video-result-slide\">" + _0x36338a + "</div>" + _0xb3cc44 + _0x3b9b1b + "</div>";
}
function renderVideoReplacementGenerateButton(_0x38d768, {
  presentation = {},
  shotBatchGenerationActive = false,
  shotBatchGeneratingShotIds = [],
  shotBatchCancelRequested = false
} = {}) {
  const _0x5a524c = presentation.shot || null;
  const _0x582d94 = _0x38d768.workspace.shotSelectionMode === true;
  const _0x51b679 = Array.isArray(_0x38d768.workspace.selectedShotIds) ? _0x38d768.workspace.selectedShotIds.length : 0;
  const _0xfd534f = Boolean(_0x5a524c?.id && (presentation.generation?.isActive && normalizeText(presentation.generation.shotId) === normalizeText(_0x5a524c.id) || Array.isArray(shotBatchGeneratingShotIds) && shotBatchGeneratingShotIds.includes(_0x5a524c.id)));
  const _0x50afa3 = Boolean(!_0x582d94 && presentation.generation?.isActive && normalizeText(presentation.generation.shotId) === normalizeText(_0x5a524c?.id));
  const _0x5e565b = _0x51b679 ? " (" + _0x51b679 + ")" : "";
  const _0x4b9423 = _0x582d94 ? shotBatchGenerationActive ? shotBatchCancelRequested ? "正在停止" + _0x5e565b : "取消运行" + _0x5e565b : "批量生成视频" + _0x5e565b : _0x50afa3 ? "取消运行" : _0xfd534f ? "生成中" : "生成视频";
  const _0x46f218 = _0x582d94 ? !_0x51b679 || shotBatchCancelRequested : !_0x50afa3 && (!presentation.eligibility?.canGenerate || _0xfd534f);
  return "<button type=\"button\" class=\"story-asset-generate-button\" aria-busy=\"" + shotBatchGenerationActive + "\" data-person-replacement-action=\"generate-replacement-video\" " + (_0x46f218 ? "disabled" : "") + ">" + escapeHtml(_0x4b9423) + "</button>";
}
function renderVideoReplacementPage(_0x57237f, _0x46aafd, {
  buildIdentityView: _0x511ca0,
  renderShotTimeline: _0x296ac6,
  renderLayoutSplitter: _0x20497f,
  renderFooter: _0x533f2e
}) {
  const _0x417e8b = buildPersonReplacementVideoPresentation(_0x57237f);
  const _0x284e4c = _0x511ca0(_0x57237f, _0x417e8b);
  const _0x1f57a4 = _0x417e8b.shot;
  const _0x5f1d91 = _0x417e8b.generation;
  const _0x54ed0f = _0x417e8b.preparation;
  const _0x59c64f = _0x417e8b.imageInput;
  const _0x235ec3 = _0x5f1d91.isActive || Boolean(Array.isArray(_0x46aafd.shotBatchGeneratingShotIds) && _0x46aafd.shotBatchGeneratingShotIds.includes(_0x1f57a4?.id));
  const _0x5555f0 = _0x54ed0f.materializationStatus === "running" ? "正在切片并统一为 " + (_0x1f57a4.outputFps || 24) + " FPS…" : _0x54ed0f.materializationStatus === "failed" ? _0x54ed0f.error || "镜头切片失败" : _0x54ed0f.status === "running" ? "正在准备视频片段 " + Math.round(_0x54ed0f.progress) + "%" : "进入视频替换时生成固定帧率片段";
  const _0x20bd42 = _0x57237f.settings.replacementModelId || PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID;
  const _0x265b68 = resolveModelProvider(_0x20bd42);
  const _0x3b881a = getModelManifest(_0x20bd42)?.prompt;
  const _0x2cbecd = _0x1f57a4?.videoPrompt || (_0x3b881a?.emptyPolicy === "allow" ? "" : PERSON_REPLACEMENT_DEFAULT_VIDEO_PROMPT);
  const _0xbde8e2 = normalizeText(_0x3b881a?.placeholder) || "描述视频人物替换效果";
  const _0x537f58 = _0xbde8e2 + "；输入 / 选择预设";
  const _0x1a4d09 = resolvePersonReplacementVideoParameterPolicy({
    modelId: _0x20bd42,
    inputMode: _0x57237f.settings.replacementVideoInputMode,
    generationParams: _0x57237f.settings.replacementVideoGenerationParams
  });
  const _0x538bce = {
    ..._0x1a4d09.generationParams,
    rhVideoFps: resolvePersonReplacementVideoGenerationFps(_0x57237f.settings)
  };
  const _0x3b7034 = _0x59c64f.referenceKind === PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE ? "人物参考图" : "替换首帧";
  const _0x52024d = normalizePersonReplacementLayout(_0x57237f.workspace.replacementLayout);
  const _0x204c9f = "--person-replacement-left-width:" + _0x52024d.left + "%;" + ("--person-replacement-right-width:" + _0x52024d.right + "%;") + ("--person-replacement-center-top:" + _0x52024d.centerTop + "%;");
  return "<div class=\"person-replacement-production-page\">\n    <div class=\"person-replacement-four-panel-layout\" data-person-replacement-layout style=\"" + _0x204c9f + "\">\n      " + _0x284e4c.referenceRailHtml + "\n      " + _0x20497f("left", _0x52024d) + "\n      <section class=\"person-replacement-keyframe-panel person-replacement-middle-layout person-replacement-video-middle-layout\">" + renderVideoReplacementPreview(_0x57237f, _0x417e8b, _0x5555f0) + _0x20497f("center", _0x52024d) + _0x296ac6(_0x57237f, {
    timelineMode: "video",
    shotBatchGenerationActive: _0x46aafd.shotBatchGenerationActive,
    shotBatchGenerationLabel: _0x46aafd.shotBatchGenerationLabel,
    shotBatchGeneratingShotIds: _0x46aafd.shotBatchGeneratingShotIds,
    shotBatchCancelRequested: _0x46aafd.shotBatchCancelRequested
  }) + "</section>\n      " + _0x20497f("right", _0x52024d) + "\n      <aside class=\"person-replacement-generation-panel person-replacement-video-generation-panel\">\n        " + renderVideoReplacementResult(_0x417e8b, {
    isGenerating: _0x235ec3
  }) + "\n        <div class=\"story-asset-detail-copy person-replacement-generation-copy\">\n          <div class=\"story-asset-prompt-field person-replacement-prompt-field\">\n            <div class=\"person-replacement-prompt-field-heading\" role=\"group\" aria-label=\"模型入参\"><div class=\"person-replacement-video-prompt-heading-actions\"><div class=\"person-replacement-prompt-reference-inputs\" data-person-replacement-video-reference-inputs>" + _0x284e4c.referenceInputsHtml + "</div>" + renderVideoInputModeControl(_0x57237f) + "</div></div>\n            <div class=\"prompt-input-wrapper is-resizable person-replacement-prompt-input-wrapper\"><div class=\"prompt-textarea custom-textarea story-asset-prompt-editor person-replacement-prompt-editor\" contenteditable=\"true\" role=\"textbox\" aria-multiline=\"true\" aria-label=\"视频替换提示词\" spellcheck=\"false\" data-placeholder=\"" + escapeHtml(_0x537f58) + "\" data-person-replacement-field=\"video-prompt\" data-shot-id=\"" + escapeHtml(_0x1f57a4?.id || "") + "\">" + renderPersonReplacementPromptHtml(_0x2cbecd) + "</div></div>\n          </div>\n          " + (_0x59c64f.status === "ready" ? "" : "<p class=\"person-replacement-reference-note\">" + escapeHtml(_0x3b7034 + "：" + _0x59c64f.message) + "</p>") + "\n          <div class=\"story-asset-generation-bar prompt-panel-footer\">" + renderAIGenVideoModelSelectorMarkup({
    modelId: _0x20bd42,
    provider: _0x265b68,
    generationParams: _0x538bce,
    uiSchemaFieldState: _0x1a4d09.uiSchemaFieldState,
    providerProfileId: _0x57237f.settings.replacementVideoProviderProfileId,
    providerProfileIdByModel: _0x57237f.settings.replacementVideoProviderProfileIdByModel,
    referenceCounts: _0x417e8b.slotState.referenceCounts,
    showSchemaControls: true,
    allowedModelIds: PERSON_REPLACEMENT_VIDEO_MODEL_IDS,
    className: "person-replacement-video-model-selector"
  }) + renderVideoReplacementGenerateButton(_0x57237f, {
    presentation: _0x417e8b,
    ..._0x46aafd
  }) + "</div>\n          " + (_0x5f1d91.error ? "<p class=\"person-replacement-error\">" + escapeHtml(_0x5f1d91.error) + "</p>" : "") + "\n        </div>\n      </aside>\n    </div>" + _0x533f2e(_0x57237f, {
    nextLabel: "进入声音克隆"
  }) + "\n  </div>";
}
function cloneFrozenPresentationValue(_0x191909) {
  if (Array.isArray(_0x191909)) {
    return Object.freeze(_0x191909.map(cloneFrozenPresentationValue));
  }
  if (!_0x191909 || typeof _0x191909 !== "object") {
    return _0x191909;
  }
  return Object.freeze(Object.fromEntries(Object.entries(_0x191909).map(([_0x26a330, _0x49f98d]) => [_0x26a330, cloneFrozenPresentationValue(_0x49f98d)])));
}
function buildReadonlyVideoPresentation(_0x2acd04, _0x5e99b2) {
  const _0x3720ea = buildPersonReplacementVideoPresentation(_0x2acd04, _0x5e99b2);
  return Object.freeze({
    shot: _0x3720ea.shot ? cloneFrozenPresentationValue(_0x3720ea.shot) : null,
    shotId: _0x3720ea.shotId,
    imageInput: cloneFrozenPresentationValue(_0x3720ea.imageInput),
    slotState: cloneFrozenPresentationValue(_0x3720ea.slotState),
    generation: cloneFrozenPresentationValue(_0x3720ea.generation),
    preparation: cloneFrozenPresentationValue(_0x3720ea.preparation),
    history: cloneFrozenPresentationValue(_0x3720ea.history),
    media: cloneFrozenPresentationValue(_0x3720ea.media),
    eligibility: cloneFrozenPresentationValue(_0x3720ea.eligibility),
    output: cloneFrozenPresentationValue(_0x3720ea.output)
  });
}
export function createPersonReplacementVideoPresentation({
  buildIdentityView = () => ({
    referenceInputsHtml: "",
    referenceRailHtml: ""
  }),
  renderShotTimeline = () => "",
  renderLayoutSplitter = () => "",
  renderFooter = () => ""
} = {}) {
  const _0xb5816b = Object.freeze({
    buildIdentityView: buildIdentityView,
    renderShotTimeline: renderShotTimeline,
    renderLayoutSplitter: renderLayoutSplitter,
    renderFooter: renderFooter
  });
  return Object.freeze({
    build: buildReadonlyVideoPresentation,
    render: (_0x1d6d4e, _0x310d56 = {}) => renderVideoReplacementPage(_0x1d6d4e, _0x310d56, _0xb5816b),
    renderGenerateButton: renderVideoReplacementGenerateButton,
    renderPlaybackControls: renderVideoReplacementPlaybackControls
  });
}