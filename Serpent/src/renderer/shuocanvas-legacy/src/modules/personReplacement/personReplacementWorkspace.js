import { PERSON_REPLACEMENT_ORIENTATIONS, PERSON_REPLACEMENT_SCOPES, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME, PERSON_REPLACEMENT_VIDEO_MODEL_IDS, formatPersonReplacementScopeLabel, formatPersonReplacementPersonLabel, getPersonReplacementActiveImageResultIndex, getPersonReplacementActiveVideoResultIndex, getPersonReplacementCrossRoleSourceCharacterIds, getPersonReplacementBindingOccurrences, getPersonReplacementCharacterBaseImageRef, getPersonReplacementImageResults, getPersonReplacementVideoResults, isGeneratedPersonReplacementLabel, resolvePersonReplacementVideoParameterPolicy, resolvePersonReplacementImageResultRef, resolvePersonReplacementImageSourceRef, resolvePersonReplacementVideoResultRef, resolvePersonReplacementVideoImageInput } from "./personReplacementProject.js";
import { buildPersonReplacementPromptMentionCandidates, resolvePersonReplacementPromptMentionRef } from "./personReplacementPromptMentions.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata } from "../../services/desktopMediaBlobSource.js";
import { bindAIGenImageModelSelector } from "../../components/aigenImage/modelSelector.js";
import { bindAIGenVideoModelSelector } from "../../components/aigenVideo/modelSelector.js";
import { createAudioPlaybackSurfaceController, renderAudioPlaybackSurface } from "../../components/audio-node/audioPlaybackSurface.js";
import { renderGenerationErrorCardMarkup } from "../../components/generationErrorCard.js";
import { createModelProviderProfileControl } from "../../components/shared/modelProviderProfileControl.js";
import a1155_0x4b764a from "../VideoClipController.js";
import { MEDIA_CLIP_REVERSE_ICON_PATHS } from "../../components/media-clip/mediaClipReverseControl.js";
import { getModelsByKind, resolveModelProvider } from "../../manifests/index.js";
import { normalizeCharacterAssetImageGenerationParams } from "../characterAssets/characterAssetImageGeneration.js";
import { normalizePersonReplacementAssetPromptPresetId as a1155_0x368647, resolvePersonReplacementImageGenerationUiRefreshScope, resolvePersonReplacementImageGenerationState, updatePersonReplacementImageGenerationState } from "./personReplacementImageGeneration.js";
import { createPersonReplacementImagePresentation, syncPersonReplacementImageStageFrame } from "./personReplacementImagePresentation.js";
import { setPersonReplacementImageResultAsReference } from "./personReplacementImageIteration.js";
import { applyPersonReplacementVideoCrop } from "./personReplacementVideoInputs.js";
import { createPersonReplacementVideoCropOptions, isPersonReplacementVideoCropReverseRunning } from "./personReplacementVideoCrop.js";
import { isPersonReplacementVideoGenerationActive, resolvePersonReplacementVideoGenerationState, resolvePersonReplacementVideoGenerationUiRefreshScope, updatePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
import { createPersonReplacementVideoPresentation, syncPersonReplacementVideoStageFrame } from "./personReplacementVideoPresentation.js";
import { createPersonReplacementShotTimelinePresentation } from "./personReplacementShotTimelinePresentation.js";
import { resolvePersonReplacementSourcePlaybackRef } from "./personReplacementSourcePlayback.js";
import { isPersonReplacementVoiceSeparationActive, resolvePersonReplacementVoiceSeparationState } from "./personReplacementVoiceSeparationState.js";
import { createPersonReplacementIdentityPresentation } from "./personReplacementIdentityPresentation.js";
import { createPersonReplacementCompositePreviewPresentation } from "./personReplacementCompositePreviewPresentation.js";
import { buildPersonReplacementCompositePreviewSnapshot } from "./personReplacementCompositePreviewProjection.js";
import { createPersonReplacementShellPresentation } from "./personReplacementShellPresentation.js";
import { openImagePreview, openVideoPreview } from "../imagePreview.js";
import { addPersonReplacementAppearanceToLibraryWithFly, getNewPersonReplacementLibraryAssets, playPersonReplacementLibraryAssetsIntoProjectTab } from "./personReplacementAssetLibraryInteraction.js";
import { applyWorkspaceAssetSplitRatioToLayout, renderWorkspaceAssetSettingsShell } from "../workspaceAssetSettingsShell.js";
import { normalizeWorkspaceProjectSortOrder } from "../workspaceProjectHome.js";
import { renderWorkspaceAssetSelectionActions, resolveWorkspaceCardMultiSelection } from "../workspaceAssetSelection.js";
import { createWorkspaceAssetLibraryDisclosure, handleWorkspaceAssetLibraryImageError } from "../workspaceAssetLibrary.js";
import { runWorkspaceImageDownloadAction } from "../workspaceImageDownload.js";
import { createTaskBatchCancellationController, runTaskBatchQueue } from "../../core/taskBatchExecution.js";
import { buildWorkspaceAssetHoverPreviewContent, consumeWorkspaceWheelDirection, isWorkspaceAssetHoverLandscape, renderWorkspaceAssetLoadingOverlay, renderWorkspaceAssetTabIcon, resolveWorkspaceTabTransitionDirection } from "../workspaceAssetPresentation.js";
import { buildPersonReplacementAssetViewState, readPersonReplacementAssetPromptText, renderPersonReplacementAudioAssetCard, renderPersonReplacementAudioAssetDetail, renderPersonReplacementAssetCard, renderPersonReplacementAssetDetail, renderPersonReplacementBatchGenerationControl, renderPersonReplacementVoicePreviewPlayer, syncPersonReplacementVoicePreviewUi } from "./personReplacementAssetPresentation.js";
import { getPersonReplacementProjectAudioAssets, getPersonReplacementLibraryAudioRef, getPersonReplacementVoiceLibraryBoundCharacters } from "./personReplacementVoiceLibrary.js";
import { beginWorkspaceHorizontalResizeSession } from "../workspaceResizeSession.js";
import { captureWorkspaceNestedScrollPositions, restoreWorkspaceNestedScrollPositions, shouldPreserveWorkspaceNestedWheel } from "../workspaceWheelNavigation.js";
import { getWorkspaceAssetHoverCard, getWorkspaceAssetHoverCardId } from "../workspaceAssetHover.js";
import { getWorkspaceAssetAppearances, getWorkspaceAssetBaseAppearance } from "../workspaceAssetAppearance.js";
import { createWorkspaceMediaHistoryMenuController } from "../workspaceMediaHistory.js";
import { createWorkspaceVideoPlayback, createWorkspaceVideoProgressLoop } from "../workspaceVideoPlayback.js";
import { createWorkspaceMarqueeSelectionController } from "../workspaceMarqueeSelection.js";
import { applyWorkspaceAssetNativeDragPreview, WORKSPACE_ASSET_DRAG_PREVIEW_POINTER_GAP } from "../workspaceAssetDragPreview.js";
import { bindWorkspaceEntityContextMenu } from "../workspaceEntityContextMenu.js";
import { resolvePersonReplacementContextMenuItems as a1155_0x74ebf6 } from "./personReplacementContextMenu.js";
import { scrollClosestElementHorizontallyWithWheel } from "../workspaceHorizontalWheel.js";
import { createWorkspacePageTransitionController } from "../workspacePageTransition.js";
import { createWorkspaceMenuController, syncWorkspaceInlineMenuExpandedWidth } from "../workspaceMenuController.js";
import { handleWorkspaceStepShortcut } from "../workspaceStepShortcut.js";
import { getMediaClipTimelineNextZoom, getMediaClipTimelineRangeRect, getMediaClipTimelineTrackWidthPx, getMediaClipTimelineZoomScrollLeft } from "../../components/media-clip/mediaClipTimelineModel.js";
import { formatDurationLabel } from "../../components/media-clip/mediaClipUtils.js";
import { captureVideoFrameSnapshot, waitForVideoFrame } from "../../components/videoFrameCapture.js";
import { t } from "../../i18n/index.js";
import { clampRectGroupTranslation } from "../../core/math.js";
import { bindPromptMentionHost, insertPresetPromptIntoEditor, sanitizePromptHtmlForCommit } from "../nodePromptShared.js";
import { shouldSkipPromptTriggerForBulkInput } from "../promptTriggerComposition.js";
import { checkSlashTrigger, handleSlashKeyboardNavigation } from "../slashMenu.js";
import { REPLACEMENT_STUDIO_NAME } from "./replacementStudioTerminology.js";
import { PERSON_REPLACEMENT_EXPORT_MODES } from "./personReplacementExport.js";
import { PERSON_REPLACEMENT_CANVAS_SCOPES } from "./personReplacementOutputCanvas.js";
import { normalizePersonReplacementManualBoxEdit, normalizePersonReplacementManualSelection, resolvePersonReplacementSourceImageSize } from "./personReplacementManualBox.js";
import { PERSON_REPLACEMENT_CUT_BASE_VIEWPORT_WIDTH_PX, PERSON_REPLACEMENT_CUT_DEFAULT_FPS, PERSON_REPLACEMENT_CUT_MIN_SEC, canSplitPersonReplacementShotCutRange, countEditablePersonReplacementShotCuts as a1155_0x23e0e7, createPersonReplacementShotCutDraft, createPersonReplacementShotCutUpdateRequest, getPersonReplacementShotCutDisplayDuration, getPersonReplacementShotCutFrameSec as a1155_0x2ba085, getPersonReplacementShotCutPositionAtTimelineSec, getPersonReplacementShotCutTimelineSec, getPersonReplacementShotCutTotalDuration, getPersonReplacementShotDurationSec as a1155_0x122c5e, hasPersonReplacementShotCutUpdateChanges } from "./personReplacementShotCutModel.js";
import { togglePersonReplacementShotReverseAtTimelineSec } from "./personReplacementShotReverse.js";
import { createPersonReplacementShotCutSession } from "./personReplacementShotCutSession.js";
import { getPersonReplacementShotCutRulerFrameRate, hasSplittablePersonReplacementShotCut, renderPersonReplacementShotCutRulerTicks } from "./personReplacementShotCutRendering.js";
import { reconcilePersonReplacementImageShotSelection, reconcilePersonReplacementShotCardList, reconcilePersonReplacementShotTimelineCard, reconcilePersonReplacementVideoControlContinuity, reconcilePersonReplacementReferenceInputs, reconcilePersonReplacementVideoShotSelection } from "./personReplacementShotSelectionRendering.js";
import { cancelPersonReplacementSlideTransition, startPersonReplacementSlideTransition } from "./personReplacementSlideTransition.js";
import { createPersonReplacementVideoSyncPlayback, shouldReusePersonReplacementVideoPlaybackStage } from "./personReplacementVideoSyncPlayback.js";
import { createPersonReplacementCompositeMediaResidency } from "./personReplacementCompositeMediaResidency.js";
import { PERSON_REPLACEMENT_OUTPUT_TRANSITIONS, transitionPersonReplacementOutput } from "./personReplacementOutputLineage.js";
import { isPersonReplacementSourceProcessing, normalizePersonReplacementCompositeSidebarWidth, normalizePersonReplacementLayout, normalizePersonReplacementPersistenceState, normalizePersonReplacementVoiceLayout, normalizePersonReplacementWorkspaceProject as a1155_0x56b8cf } from "./personReplacementProjectSession.js";
import { PERSON_REPLACEMENT_STEPS, getPersonReplacementStepGate } from "./personReplacementWorkflow.js";
import { PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE, getPersonReplacementBoxedPeople as a1155_0x499c74, getPersonReplacementDuplicateRoleLabels, getPersonReplacementIdentityCorrectionDraftKey as a1155_0x133b49, getPersonReplacementLabelOptions as a1155_0x3d39a9, getPersonReplacementReusableLabels as a1155_0x2f3779 } from "./personReplacementSourceIdentity.js";
const PERSON_REPLACEMENT_VOICE_ASSET_DRAG_TYPE = "application/x-person-replacement-voice-asset";
const PERSON_REPLACEMENT_SCENE_ASSET_DRAG_TYPE = "application/x-person-replacement-scene-asset";
const PERSON_REPLACEMENT_COMPOSITE_PREWARM_MAX_BYTES = 67108864;
const PERSON_REPLACEMENT_COMPOSITE_PREWARM_TIMEOUT_MS = 5000;
const PERSON_REPLACEMENT_CUT_PREVIEW_READY_TIMEOUT_MS = 30000;
const PERSON_REPLACEMENT_PERSISTENT_NESTED_SCROLL_SELECTORS = Object.freeze([".story-assets-list", ".person-replacement-shot-cut-scroll", ".person-replacement-shot-cut-smart-detect-panel"]);
const PERSON_REPLACEMENT_MULTI_SELECTION_INTERACTIVE_SELECTOR = ["[data-story-marquee-item]", "button", "a[href]", "input", "textarea", "select", "label", "img", "video", "audio", "canvas", "[contenteditable='true']", "[role='button']", "[role='option']", "[role='menuitem']", "[role='slider']", "[tabindex]"].join(",");
function getPersonReplacementVideoModelIds() {
  const dynamicIds = getModelsByKind("video")
    .filter((manifest) => manifest?.extensions?.customProvider)
    .map((manifest) => String(manifest.modelId || "").trim())
    .filter(Boolean);
  return [...new Set([...PERSON_REPLACEMENT_VIDEO_MODEL_IDS, ...dynamicIds])];
}
function escapeHtml(_0x2cdcec) {
  return String(_0x2cdcec ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#039;");
}
function normalizeText(_0x4ca389, _0x4b0cbd = "") {
  const _0x5ace3c = String(_0x4ca389 ?? "").trim();
  return _0x5ace3c || _0x4b0cbd;
}
function readPersonReplacementVideoPromptEditor(_0x61fffb) {
  if (!_0x61fffb) {
    return "";
  }
  if (_0x61fffb.matches?.("[contenteditable=\"true\"]")) {
    if (typeof _0x61fffb.innerText === "string") {
      return _0x61fffb.innerText;
    }
    return String(_0x61fffb.innerHTML || _0x61fffb.textContent || "").replace(/<br\b[^>]*\/?>/giu, "\n").replace(/<\/(?:div|p|section|article|blockquote|li)>/giu, "\n").replace(/<[^>]+>/gu, "").replace(/&nbsp;/giu, " ").replace(/&lt;/giu, "<").replace(/&gt;/giu, ">").replace(/&quot;/giu, "\"").replace(/&#39;|&apos;/giu, "'").replace(/&amp;/giu, "&");
  }
  return String(_0x61fffb.value || "");
}
function cloneJson(_0x2743a9) {
  if (_0x2743a9 && typeof _0x2743a9 === "object") {
    return JSON.parse(JSON.stringify(_0x2743a9));
  } else {
    return _0x2743a9;
  }
}
function clamp(_0x2c44fa, _0x3783a3, _0x529f67, _0x2d1356 = _0x3783a3) {
  const _0x10a43b = Number(_0x2c44fa);
  if (Number.isFinite(_0x10a43b)) {
    return Math.min(_0x529f67, Math.max(_0x3783a3, _0x10a43b));
  } else {
    return _0x2d1356;
  }
}
const PERSON_REPLACEMENT_MANUAL_SELECTION_DRAG_THRESHOLD_PX = 4;
function applyPersonReplacementCompositeSidebarWidthToLayout(_0x5c89e6, _0x3b85e3, _0xb4cd10) {
  const _0x172102 = normalizePersonReplacementCompositeSidebarWidth(_0xb4cd10);
  _0x5c89e6?.style?.setProperty?.("--person-replacement-composite-sidebar-width", _0x172102 + "px");
  _0x3b85e3?.setAttribute?.("aria-valuenow", String(Math.round(_0x172102)));
  return _0x172102;
}
const PERSON_REPLACEMENT_ORIENTATION_LABELS = Object.freeze({
  front: "正面",
  back: "背面",
  side: "侧面",
  left_profile: "左侧面",
  right_profile: "右侧面",
  three_quarter_left: "左前侧",
  three_quarter_right: "右前侧",
  over_shoulder_left: "左过肩",
  over_shoulder_right: "右过肩",
  unknown: "待确认"
});
function formatPersonOrientation(_0x595a12) {
  return PERSON_REPLACEMENT_ORIENTATION_LABELS[normalizeText(_0x595a12)] || PERSON_REPLACEMENT_ORIENTATION_LABELS.unknown;
}
function getPersonOrientationOptions() {
  const _0x30ad2b = PERSON_REPLACEMENT_ORIENTATIONS.filter(_0x15e8d6 => _0x15e8d6 !== "unknown");
  return _0x30ad2b.map(_0x460e8d => ({
    value: _0x460e8d,
    label: formatPersonOrientation(_0x460e8d)
  }));
}
function getPersonReplacementScopeOptions() {
  return PERSON_REPLACEMENT_SCOPES.map(_0x27981b => ({
    value: _0x27981b,
    label: formatPersonReplacementScopeLabel(_0x27981b)
  }));
}
function normalizeMediaUrl(_0x2587d9) {
  const _0x5d9fb4 = normalizeText(_0x2587d9);
  if (!_0x5d9fb4) {
    return "";
  }
  return localPathToUrl(_0x5d9fb4) || _0x5d9fb4;
}
function isVideoFile(_0xe2ec8) {
  const _0x34fdae = normalizeText(_0xe2ec8?.type).toLowerCase();
  return _0x34fdae.startsWith("video/") || /\.(?:avi|mkv|mov|mp4|webm)$/iu.test(_0xe2ec8?.name || "");
}
function isImageFile(_0x557dc8) {
  const _0x1efba6 = normalizeText(_0x557dc8?.type).toLowerCase();
  return _0x1efba6.startsWith("image/") || /\.(?:avif|gif|jpe?g|png|webp)$/iu.test(_0x557dc8?.name || "");
}
function isAudioFile(_0x2943f3) {
  const _0x3ff2ee = normalizeText(_0x2943f3?.type).toLowerCase();
  return _0x3ff2ee.startsWith("audio/") || /\.(?:aac|flac|m4a|mp3|ogg|opus|wav)$/iu.test(_0x2943f3?.name || "");
}
function getCharacterAppearance(_0x15b25f, _0x2f88b1 = "") {
  const _0x4df5bd = getWorkspaceAssetAppearances(_0x15b25f);
  return _0x4df5bd.find(_0xf27231 => _0xf27231.id === _0x2f88b1) || getWorkspaceAssetBaseAppearance(_0x15b25f) || _0x4df5bd[0] || null;
}
function getCharacterVoiceUrl(_0x47a7ed = {}) {
  return normalizeMediaUrl(_0x47a7ed.voiceReference?.audioUrl || _0x47a7ed.voiceReference?.localPath || _0x47a7ed.voiceRef);
}
function renderPersonReplacementVoiceReferenceStatus(_0x5981ac = {}, _0x4162af = "") {
  const _0x1956f5 = Boolean(getCharacterVoiceUrl(_0x5981ac));
  return "<span class=\"person-replacement-target-voice-status" + (_0x4162af ? " " + escapeHtml(_0x4162af) : "") + " " + (_0x1956f5 ? "has-reference" : "is-missing") + "\"><i aria-hidden=\"true\"></i>" + (_0x1956f5 ? "有声音参考" : "无声音参考") + "</span>";
}
function smartClipPanelText(_0x2adef7, _0x2234a2 = {}) {
  return t("videoClip.smartPanel." + _0x2adef7, _0x2234a2);
}
function renderSmartClipSettingLabel(_0x5c1871, _0x4f8b8c) {
  return "<span class=\"person-replacement-smart-clip-setting-label\">" + escapeHtml(_0x5c1871) + "<span class=\"rh-tip\" data-tooltip=\"" + escapeHtml(_0x4f8b8c) + "\" aria-label=\"" + escapeHtml(_0x4f8b8c) + "\">!</span></span>";
}
function renderSmartClipModeOptions(_0x64712d, _0xfd6563 = "set-smart-clip-mode") {
  const _0x4d4e6d = [["stable", smartClipPanelText("modeStable")], ["balanced", smartClipPanelText("modeBalanced")], ["sensitive", smartClipPanelText("modeSensitive")]];
  return _0x4d4e6d.map(([_0x3dd850, _0x222b6f]) => "<button type=\"button\" class=\"person-replacement-smart-clip-option " + (_0x64712d === _0x3dd850 ? "is-active" : "") + "\" data-person-replacement-action=\"" + escapeHtml(_0xfd6563) + "\" data-smart-clip-mode=\"" + _0x3dd850 + "\" aria-pressed=\"" + (_0x64712d === _0x3dd850) + "\">" + escapeHtml(_0x222b6f) + "</button>").join("");
}
function formatClock(_0x4f4889) {
  const _0x112b31 = Math.max(0, Number(_0x4f4889) || 0);
  const _0x4f4035 = Math.floor(_0x112b31 / 60);
  const _0x1de0a7 = Math.floor(_0x112b31 % 60);
  return String(_0x4f4035).padStart(2, "0") + ":" + String(_0x1de0a7).padStart(2, "0");
}
function formatPreciseClock(_0x3fe87f) {
  const _0x5c2601 = Math.max(0, Number(_0x3fe87f) || 0);
  const _0x4ef8f1 = Math.floor(_0x5c2601 / 60);
  const _0x574e14 = _0x5c2601 - _0x4ef8f1 * 60;
  return String(_0x4ef8f1).padStart(2, "0") + ":" + _0x574e14.toFixed(2).padStart(5, "0");
}
function renderIcon(_0x9b96ee) {
  const _0x31bcb7 = {
    upload: "<path d=\"M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5\"/><path d=\"M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5\"/>",
    video: "<rect x=\"3\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"/><path d=\"m17 10 4-2v8l-4-2\"/>",
    close: "<path d=\"m6 6 12 12M18 6 6 18\"/>",
    person: "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>",
    undo: "<path d=\"M9 14l-4-4 4-4\"/><path d=\"M5 10h9a6 6 0 1 1 0 12h-3\"/>",
    reset: "<path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 4v5h5\"/>",
    soundOff: "<path d=\"M11 5 6 9H3v6h3l5 4z\"/><path d=\"m16 9 5 5m0-5-5 5\"/>",
    soundOn: "<path d=\"M11 5 6 9H3v6h3l5 4z\"/><path d=\"M15.5 9.5a3.5 3.5 0 0 1 0 5\"/><path d=\"M18 7a7 7 0 0 1 0 10\"/>",
    smartDetect: "<path d=\"m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2z\"/><path d=\"m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8z\"/><path d=\"M5 14v5h5\"/>",
    reverse: MEDIA_CLIP_REVERSE_ICON_PATHS,
    merge: "<path d=\"M4 6h6v5H4zM14 13h6v5h-6z\"/><path d=\"M10 8.5h2a2 2 0 0 1 2 2v5\"/><path d=\"m11.5 13 2.5 2.5 2.5-2.5\"/>"
  };
  return "<svg class=\"person-replacement-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">" + (_0x31bcb7[_0x9b96ee] || "") + "</svg>";
}
const personReplacementShotTimelinePresentation = createPersonReplacementShotTimelinePresentation({
  renderIcon: renderIcon
});
const personReplacementIdentityPresentation = createPersonReplacementIdentityPresentation();
const personReplacementCompositePreviewPresentation = createPersonReplacementCompositePreviewPresentation();
const personReplacementShellPresentation = createPersonReplacementShellPresentation({
  resolveVoiceReferenceCount: _0x52097a => getVoiceCloneInputCharacters(_0x52097a).filter(_0x32cd44 => getCharacterVoiceUrl(_0x32cd44)).length
});
const personReplacementImagePresentation = createPersonReplacementImagePresentation({
  buildIdentityView: (_0x417143, _0x4969f2, _0x5e2e2f) => personReplacementIdentityPresentation.buildImage(_0x417143, _0x4969f2, _0x5e2e2f),
  renderShotTimeline: (_0x433d27, _0xd04afd) => personReplacementShotTimelinePresentation.renderStage(_0x433d27, _0xd04afd),
  renderLayoutSplitter: renderPersonReplacementLayoutSplitter,
  renderFooter: (_0x1c05a8, _0x56c1c0) => personReplacementShellPresentation.renderStepFooter(_0x1c05a8, _0x56c1c0),
  renderSmartDetectTrigger: renderShotCutSmartDetectTrigger
});
const personReplacementVideoPresentation = createPersonReplacementVideoPresentation({
  buildIdentityView: (_0x273936, _0x4607e6) => personReplacementIdentityPresentation.buildVideo(_0x273936, _0x4607e6),
  renderShotTimeline: (_0x30c682, _0x31a635) => personReplacementShotTimelinePresentation.renderStage(_0x30c682, _0x31a635),
  renderLayoutSplitter: renderPersonReplacementLayoutSplitter,
  renderFooter: (_0x223e47, _0x3a9d44) => personReplacementShellPresentation.renderStepFooter(_0x223e47, _0x3a9d44)
});
function renderCompositeComposeAction(_0x2c83d5, _0x167e75 = {}) {
  const _0x45ef56 = _0x2c83d5.shots.some(_0x51c052 => normalizeText(_0x51c052.resultVideoRef));
  const _0x3dcd78 = _0x167e75.composeOutputPending === true;
  const _0x40467b = buildPersonReplacementCompositePreviewSnapshot(_0x2c83d5).fullAvailable;
  const _0x247979 = _0x3dcd78 ? "合成中…" : _0x40467b ? "重新合成全部视频" : "合成全部视频";
  return "<button type=\"button\" class=\"story-workbench-action-button story-main-action-button person-replacement-compose-output" + (_0x3dcd78 ? " is-loading" : "") + "\" data-person-replacement-action=\"compose-output\" aria-busy=\"" + _0x3dcd78 + "\"" + (_0x3dcd78 || !_0x45ef56 ? " disabled" : "") + ">" + (_0x3dcd78 ? "<span class=\"storyboard-script-loading-spinner person-replacement-compose-spinner\" aria-hidden=\"true\"></span>" : "") + "<span>" + _0x247979 + "</span></button>";
}
function normalizeProjectAssetMediaForRender(_0x5ea6a6 = {}) {
  return {
    ..._0x5ea6a6,
    appearances: getWorkspaceAssetAppearances(_0x5ea6a6).map(_0x2afe95 => ({
      ..._0x2afe95,
      imageUrl: normalizeMediaUrl(_0x2afe95.imageUrl),
      referenceImageUrl: normalizeMediaUrl(_0x2afe95.referenceImageUrl)
    }))
  };
}
function getPersonReplacementSelectableAssets(_0x583aa8, _0x485771) {
  if (_0x485771 === "library") {
    return _0x583aa8.libraryAssets.filter(_0x4f84a9 => normalizeText(_0x4f84a9?.mediaKind).toLowerCase() === "image" && normalizeText(_0x4f84a9?.sourceUrl || _0x4f84a9?.imageUrl) || normalizeText(_0x4f84a9?.mediaKind).toLowerCase() === "audio" && getPersonReplacementLibraryAudioRef(_0x4f84a9));
  }
  if (_0x485771 === "audio") {
    return [];
  }
  if (_0x485771 === "scene") {
    return _0x583aa8.scenes;
  } else {
    return _0x583aa8.characters;
  }
}
function renderAssetSettings(_0xbe5eeb, _0x876ad2 = {}) {
  const _0x2a1f16 = ["character", "scene", "audio", "library"].includes(_0xbe5eeb.workspace.characterAssetTab) ? _0xbe5eeb.workspace.characterAssetTab : "character";
  const _0x4b872a = _0x2a1f16 === "library";
  const _0xabee1f = _0x2a1f16 === "scene";
  const _0x43b8fa = _0x2a1f16 === "audio";
  const _0x1e7e7a = new Set(Array.isArray(_0x876ad2.assetUploadPendingKinds) ? _0x876ad2.assetUploadPendingKinds : []);
  const _0x482d6e = getPersonReplacementProjectAudioAssets(_0xbe5eeb);
  const _0x5dcae2 = normalizeText(_0x876ad2.voiceLibraryTargetCharacterId);
  const _0x41219f = {
    ..._0xbe5eeb,
    characters: _0xbe5eeb.characters.map(normalizeProjectAssetMediaForRender),
    scenes: _0xbe5eeb.scenes.map(normalizeProjectAssetMediaForRender)
  };
  const _0x2ddcb6 = _0x41219f.characters.find(_0xe67342 => _0xe67342.id === _0x5dcae2) || null;
  const _0x29914a = _0x43b8fa && Boolean(_0x2ddcb6);
  const _0x35c605 = buildPersonReplacementAssetViewState(_0x41219f);
  _0x35c605.isBatchGenerating = _0x876ad2.assetBatchGenerationActive === true;
  _0x35c605.batchGenerationLabel = normalizeText(_0x876ad2.assetBatchGenerationLabel);
  _0x35c605.batchCancelRequested = _0x876ad2.assetBatchCancelRequested === true;
  _0x35c605.batchGeneratingAssetIds = Array.isArray(_0x876ad2.assetBatchGeneratingCharacterIds) ? _0x876ad2.assetBatchGeneratingCharacterIds : [];
  _0x35c605.batchCancelAction = "cancel-asset-batch-generation";
  const _0x28c372 = _0x29914a ? buildPersonReplacementAssetViewState({
    ..._0x41219f,
    workspace: {
      ..._0x41219f.workspace,
      characterAssetTab: "character",
      selectedCharacterId: _0x2ddcb6.id
    }
  }) : null;
  const _0x40a7b9 = _0x35c605.data.assets;
  const _0x354f00 = _0x40a7b9.find(_0x195f55 => _0x195f55.id === _0x35c605.selectedAssetId) || null;
  const _0x143eb0 = getPersonReplacementSelectableAssets(_0x41219f, _0x2a1f16);
  const _0x44f04a = _0x143eb0.length > 0 && _0x143eb0.every(_0x237c66 => _0x35c605.selectedAssetIds.includes(_0x237c66.id));
  const _0x5671b4 = _0x4b872a ? _0x35c605.assetSelectionMode ? _0x143eb0.filter(_0x5f179c => _0x35c605.selectedAssetIds.includes(_0x5f179c.id)) : _0x143eb0.filter(_0xc71b22 => _0xc71b22.id === _0x35c605.selectedAssetId) : [];
  const _0x5e0780 = _0x5671b4.length;
  const _0x2c815a = _0x876ad2.assetLibraryDisclosure || createWorkspaceAssetLibraryDisclosure();
  const _0x5e70af = _0x4cc178 => {
    const _0x3eea52 = getPersonReplacementVoiceLibraryBoundCharacters(_0xbe5eeb, _0x4cc178);
    if (normalizeText(_0x4cc178?.mediaKind).toLowerCase() === "audio") {
      return renderPersonReplacementAudioAssetCard({
        ..._0x35c605,
        allowDeleteAssetCard: _0x35c605.allowDeleteAssetCard && !_0x29914a
      }, _0x4cc178, {
        boundCharacters: _0x3eea52,
        showVoiceLibraryConfirm: _0x29914a
      });
    }
    return renderPersonReplacementAssetCard(_0x35c605, _0x4cc178, {
      previewAppearance: _0x4b872a ? {
        ..._0x4cc178,
        imageUrl: _0x4cc178.thumbnailUrl || _0x4cc178.imageUrl
      } : null,
      fallbackImageUrl: _0x4b872a ? _0x4cc178.sourceUrl : "",
      workspaceAssetLibraryImage: _0x4b872a,
      cardMetaHtml: !_0x4b872a && !_0xabee1f && !_0x43b8fa ? renderPersonReplacementVoiceReferenceStatus(_0x4cc178, "person-replacement-asset-voice-status") : ""
    });
  };
  const _0x4d4802 = _0x4b872a ? _0x2c815a.render({
    assets: _0x40a7b9,
    renderAsset: _0x5e70af
  }) : _0x40a7b9.map(_0x5e70af).join("");
  const _0x482e65 = "<div class=\"story-asset-batch-menu-wrap story-library-add-menu-wrap person-replacement-library-add-menu-wrap\">\n    <button type=\"button\" class=\"story-primary-button story-asset-batch-trigger\" data-person-replacement-action=\"toggle-library-add-targets\" aria-haspopup=\"menu\" aria-expanded=\"false\" " + (_0x5e0780 ? "" : "disabled") + "><span class=\"story-asset-batch-trigger-label\">加入到项目" + (_0x35c605.assetSelectionMode && _0x5e0780 ? " (" + _0x5e0780 + ")" : "") + "</span></button>\n    <div class=\"story-asset-batch-menu story-library-add-menu\" role=\"menu\" aria-label=\"选择加入项目的素材分类\" aria-hidden=\"true\">\n      <button type=\"button\" role=\"menuitem\" data-person-replacement-action=\"add-library-assets-to-project\" data-person-replacement-library-target-kind=\"character\"><span class=\"story-asset-batch-mode-icon\">" + renderWorkspaceAssetTabIcon("character") + "</span><span>人物</span></button>\n      <button type=\"button\" role=\"menuitem\" data-person-replacement-action=\"add-library-assets-to-project\" data-person-replacement-library-target-kind=\"scene\"><span class=\"story-asset-batch-mode-icon\">" + renderWorkspaceAssetTabIcon("scene") + "</span><span>场景</span></button>\n      <button type=\"button\" role=\"menuitem\" data-person-replacement-action=\"add-library-assets-to-project\" data-person-replacement-library-target-kind=\"audio\"><span class=\"story-asset-batch-mode-icon\">" + renderWorkspaceAssetTabIcon("audio") + "</span><span>音频</span></button>\n    </div>\n  </div>";
  const _0x5376cf = (_0x460778, _0x2ce819, _0x8212bb) => {
    const _0x1b7e94 = _0x1e7e7a.has(_0x460778);
    return "<button type=\"button\" class=\"story-secondary-button\" data-person-replacement-action=\"" + _0x8212bb + "\"" + (_0x1b7e94 ? " aria-busy=\"true\" disabled" : "") + ">" + (_0x1b7e94 ? "<span class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></span><span>上传中…</span>" : "上传" + _0x2ce819) + "</button>";
  };
  const _0x17d0fe = _0x43b8fa ? _0x354f00 : null;
  const _0x43bfda = _0x43b8fa ? _0x29914a ? "<button type=\"button\" class=\"story-secondary-button\" data-person-replacement-action=\"cancel-character-voice-library\">取消</button>" : _0x5376cf("audio", "音频", "choose-new-audio-files") : renderWorkspaceAssetSelectionActions({
    selectionMode: _0x35c605.assetSelectionMode,
    selectedCount: _0x35c605.selectedAssetIds.length,
    allSelected: _0x44f04a,
    primaryActionHtml: _0x4b872a ? _0x482e65 : _0xabee1f ? _0x35c605.assetSelectionMode ? "" : _0x5376cf("scene", "场景", "choose-new-scene-images") : _0x35c605.assetSelectionMode ? renderPersonReplacementBatchGenerationControl(_0x35c605) : _0x5376cf("character", "人物", "choose-new-character-images"),
    selectAllLabel: _0x4b872a ? "全选素材" : "全选",
    clearSelectionLabel: "取消全选"
  });
  return renderWorkspaceAssetSettingsShell({
    className: "person-replacement-assets-page",
    activeTab: _0x2a1f16,
    tabCount: 4,
    tabsHtml: [["character", "人物", _0xbe5eeb.characters.length], ["scene", "场景", _0xbe5eeb.scenes.length], ["audio", "音频", _0x482d6e.length], ["library", "总素材", _0xbe5eeb.libraryAssets.length]].map(([_0x38e401, _0x5092c4, _0x71be5d]) => "<button type=\"button\" class=\"" + (_0x2a1f16 === _0x38e401 ? "is-active" : "") + "\" data-person-replacement-action=\"select-character-asset-tab\" data-asset-tab=\"" + _0x38e401 + "\" role=\"tab\" aria-selected=\"" + (_0x2a1f16 === _0x38e401) + "\" tabindex=\"" + (_0x2a1f16 === _0x38e401 ? "0" : "-1") + "\">" + renderWorkspaceAssetTabIcon(_0x38e401) + "<span class=\"story-asset-tab-label\">" + _0x5092c4 + "</span><span class=\"story-asset-tab-count\">" + _0x71be5d + "</span></button>").join(""),
    calloutTitle: _0x43b8fa ? _0x29914a ? "为「" + _0x2ddcb6.name + "」添加声音" : "音频素材" : _0x4b872a ? "从总素材加入项目" : _0xabee1f ? "项目场景素材" : "上传人物基础形象",
    calloutDescription: _0x43b8fa ? _0x29914a ? "请选择要添加的人设声音，选中后点击确认。" : "这里只显示已加入当前项目的音频；上传会先保存到总素材再加入项目。" : _0x4b872a ? _0x35c605.assetSelectionMode ? _0x35c605.selectedAssetIds.length ? "已选择 " + _0x35c605.selectedAssetIds.length + " 项素材" : "点击图片或音频进行多选，或拖动鼠标框选。" : "单击素材可查看详情；点击加入到项目后，选择人物、场景或音频。" : _0xabee1f ? _0x35c605.assetSelectionMode ? "已选择 " + _0x35c605.selectedAssetIds.length + " 项" : "从总素材加入的场景可在图像替换中作为画面参考。" : _0x35c605.assetSelectionMode ? "已选择 " + _0x35c605.selectedAssetIds.length + " 项" : "上传的第一张图片作为基础形象；后续生成会新增形象。",
    calloutActionsHtml: _0x43bfda,
    cardsHtml: _0x4d4802,
    emptyText: _0x43b8fa ? "当前项目暂无音频，请从总素材加入或上传音频" : _0x4b872a ? "总素材中暂无可用素材" : _0xabee1f ? "请先从总素材加入场景" : "请先上传人物基础形象",
    detailHtml: _0x29914a ? renderPersonReplacementAssetDetail(_0x28c372, _0x2ddcb6, {
      voiceLibrarySelection: {
        audioAsset: _0x17d0fe
      }
    }) : normalizeText(_0x354f00?.mediaKind).toLowerCase() === "audio" ? renderPersonReplacementAudioAssetDetail(_0x354f00, {
      boundCharacters: getPersonReplacementVoiceLibraryBoundCharacters(_0xbe5eeb, _0x354f00),
      selectedCharacterId: _0xbe5eeb.workspace.selectedCharacterId
    }) : renderPersonReplacementAssetDetail(_0x35c605, _0x354f00, {
      showEmptyDescription: _0x4b872a || _0xabee1f,
      readOnly: _0xabee1f
    }),
    footerHtml: personReplacementShellPresentation.renderStepFooter(_0xbe5eeb, {
      nextLabel: "进入图像替换",
      hidePrevious: true
    }),
    splitRatio: _0x35c605.assetSplitRatio
  });
}
function renderShotCutSmartDetectPanel(_0x20310d, {
  smartDetecting = false
} = {}) {
  return "<div id=\"person-replacement-shot-cut-smart-detect-panel\" class=\"person-replacement-shot-cut-smart-detect-panel\" role=\"dialog\" aria-label=\"智能检测切口\">\n    <strong class=\"person-replacement-smart-clip-settings-title\">智能检测</strong>\n    <div class=\"person-replacement-smart-clip-setting-row\">\n      " + renderSmartClipSettingLabel(smartClipPanelText("mode"), smartClipPanelText("modeTip")) + "\n      <div class=\"person-replacement-smart-clip-option-group\" role=\"group\" aria-label=\"" + escapeHtml(smartClipPanelText("mode")) + "\">\n        " + renderSmartClipModeOptions(_0x20310d.settings.smartClipMode, "set-shot-cut-smart-detect-mode") + "\n      </div>\n    </div>\n    <div class=\"person-replacement-shot-cut-smart-detect-footer\">\n      <button type=\"button\" class=\"story-primary-button person-replacement-shot-cut-smart-detect-confirm " + (smartDetecting ? "is-loading" : "") + "\" data-person-replacement-action=\"confirm-shot-cut-smart-detect\" aria-busy=\"" + smartDetecting + "\" " + (smartDetecting ? "disabled" : "") + ">" + (smartDetecting ? "检测中…" : "确定") + "</button>\n    </div>\n  </div>";
}
function renderShotCutSmartDetectTrigger({
  smartDetectOpen = false,
  smartDetecting = false,
  disabled = false
} = {}) {
  const _0x5aa0dc = smartDetecting ? "智能检测中" : "智能检测";
  const _0x59a856 = smartDetecting ? " is-loading" : "";
  const _0x920748 = disabled ? " disabled" : "";
  return "<span class=\"person-replacement-shot-cut-smart-detect " + (smartDetectOpen ? "is-open" : "") + "\" data-person-replacement-shot-cut-smart-detect>\n    <button type=\"button\" class=\"person-replacement-secondary-button person-replacement-keyframe-smart-detect" + _0x59a856 + "\" data-person-replacement-action=\"toggle-shot-cut-smart-detect\" aria-label=\"" + _0x5aa0dc + "\" aria-haspopup=\"dialog\" aria-controls=\"person-replacement-shot-cut-smart-detect-panel\" aria-expanded=\"" + smartDetectOpen + "\"" + _0x920748 + ">" + renderIcon("smartDetect") + "<span>" + (smartDetecting ? "检测中…" : "智能检测") + "</span></button>\n  </span>";
}
function renderPersonReplacementLayoutSplitter(_0x263db6, _0x451cdc) {
  const _0x4006b9 = _0x263db6 === "center";
  const _0x42ff1e = _0x4006b9 ? _0x451cdc.centerTop : _0x451cdc[_0x263db6];
  const _0x37dc77 = _0x4006b9 ? 38 : _0x263db6 === "left" ? 18 : 24;
  const _0x43e02f = _0x4006b9 ? 82 : _0x263db6 === "left" ? 38 : 42;
  const _0x104240 = _0x4006b9 ? "调整中间上下区域高度" : _0x263db6 === "left" ? "调整左侧素材栏宽度" : "调整右侧生成栏宽度";
  return "<div class=\"person-replacement-layout-splitter panel-resize-handle panel-resize-handle--transient " + (_0x4006b9 ? "panel-resize-handle--horizontal is-horizontal" : "is-vertical") + " is-" + _0x263db6 + "\" data-person-replacement-layout-splitter=\"" + _0x263db6 + "\" role=\"separator\" aria-orientation=\"" + (_0x4006b9 ? "horizontal" : "vertical") + "\" aria-label=\"" + _0x104240 + "\" aria-valuemin=\"" + _0x37dc77 + "\" aria-valuemax=\"" + _0x43e02f + "\" aria-valuenow=\"" + Math.round(_0x42ff1e) + "\" tabindex=\"0\"></div>";
}
function getVoiceCloneInputCharacters(_0x87a2bc = {}) {
  const _0x386fe3 = new Set();
  const _0x3fac1f = normalizeText(_0x87a2bc.workspace?.selectedVoiceSourceId);
  const _0x5ae5d2 = (Array.isArray(_0x87a2bc.shots) ? _0x87a2bc.shots : []).filter(_0x3e8d45 => !_0x3fac1f || _0x3e8d45.sourceId === _0x3fac1f);
  const _0x149d48 = new Set();
  _0x5ae5d2.forEach(_0x3f0f5c => {
    (Array.isArray(_0x3f0f5c?.people) ? _0x3f0f5c.people : []).forEach(_0xbe0e2e => {
      const _0x1e29cd = normalizeText(_0xbe0e2e?.sourceCharacterId);
      if (_0x1e29cd) {
        _0x149d48.add(_0x1e29cd);
      }
      const _0x40794b = normalizeText(_0xbe0e2e?.targetCharacterId);
      if (_0x40794b) {
        _0x386fe3.add(_0x40794b);
      }
    });
  });
  (Array.isArray(_0x87a2bc.mappings) ? _0x87a2bc.mappings : []).forEach(_0xd7822 => {
    if (_0x149d48.size && !_0x149d48.has(normalizeText(_0xd7822?.sourceCharacterId))) {
      return;
    }
    const _0x573426 = normalizeText(_0xd7822?.targetCharacterId);
    if (_0x573426) {
      _0x386fe3.add(_0x573426);
    }
  });
  return (Array.isArray(_0x87a2bc.characters) ? _0x87a2bc.characters : []).filter(_0x51da97 => _0x386fe3.has(_0x51da97.id));
}
function renderVoiceCloneCharacterAssetCards(_0x774189) {
  const _0x222816 = getVoiceCloneInputCharacters(_0x774189);
  return _0x222816.map(_0x2adcd7 => {
    const _0x55f890 = getCharacterAppearance(_0x2adcd7);
    const _0x3a67e1 = normalizeMediaUrl(_0x55f890?.imageUrl);
    const _0x1fd607 = getCharacterVoiceUrl(_0x2adcd7);
    const _0x3b483d = Boolean(_0x1fd607);
    const _0x51da71 = renderPersonReplacementVoicePreviewPlayer({
      ..._0x2adcd7,
      kind: "character"
    }, {
      className: "person-replacement-voice-asset-preview",
      showWaveform: false
    });
    return "<article class=\"person-replacement-voice-asset-shell" + (_0x3b483d ? " has-audio" : " is-missing-audio") + "\">\n      <button type=\"button\" class=\"person-replacement-voice-asset-card" + (_0x3b483d ? " has-audio" : " is-missing-audio") + "\" data-person-replacement-action=\"select-voice-asset\" data-person-replacement-voice-asset-id=\"" + escapeHtml(_0x2adcd7.id) + "\" data-character-id=\"" + escapeHtml(_0x2adcd7.id) + "\" " + (_0x3b483d ? "draggable=\"true\"" : "disabled") + " aria-label=\"" + escapeHtml(_0x3b483d ? "加载" + _0x2adcd7.name + "的人物音频" : _0x2adcd7.name + "无音频") + "\">\n        <span class=\"person-replacement-voice-asset-image\">" + (_0x3a67e1 ? "<img src=\"" + escapeHtml(_0x3a67e1) + "\" alt=\"" + escapeHtml(_0x2adcd7.name) + "\">" : "<span aria-hidden=\"true\">人</span>") + "</span>\n        <span class=\"person-replacement-voice-asset-copy\"><strong>" + escapeHtml(_0x2adcd7.name) + "</strong><small>" + (_0x3b483d ? "选择人物素材，使用对应声音" : "无音频") + "</small></span>\n        <span class=\"person-replacement-voice-asset-status" + (_0x3b483d ? " is-ready" : " is-empty") + "\">" + (_0x3b483d ? "可用" : "无音频") + "</span>\n      </button>\n      " + _0x51da71 + "\n    </article>";
  }).join("");
}
function renderVoiceCloneCharacterAssets(_0x256ab4) {
  const _0x19a9f0 = renderVoiceCloneCharacterAssetCards(_0x256ab4);
  return "<aside class=\"person-replacement-voice-assets\" aria-label=\"人物音频素材\">\n    <header class=\"person-replacement-voice-column-heading\"><strong>人物素材</strong><small>仅显示已用于替换入参的人物</small></header>\n    <div class=\"person-replacement-voice-asset-list\">" + (_0x19a9f0 || "<p class=\"person-replacement-inline-empty\">暂无已绑定的人物入参</p>") + "</div>\n    <p class=\"person-replacement-voice-column-hint\">点击右侧句子的“+”后选择高亮人物，也可将人物直接拖入“+”。</p>\n  </aside>";
}
function renderVoiceCloneSourceCards(_0x10ceb5) {
  const _0x4d1036 = Array.isArray(_0x10ceb5.sources) ? _0x10ceb5.sources : [];
  const _0x1634d3 = Array.isArray(_0x10ceb5.shots) ? _0x10ceb5.shots : [];
  const _0x231366 = _0x4d1036.map((_0x120e1d, _0x3fd038) => {
    const _0x39f71b = _0x120e1d.id === _0x10ceb5.workspace.selectedVoiceSourceId;
    const _0x4fcca0 = _0x1634d3.find(_0x6d156c => _0x6d156c?.sourceId === _0x120e1d.id && _0x6d156c?.keyframeRef)?.keyframeRef || "";
    const _0x3f8e0d = normalizeMediaUrl(_0x120e1d.thumbnailRef || _0x4fcca0);
    const _0x126dd9 = normalizeMediaUrl(_0x10ceb5.sourcePreviewRefs?.[_0x120e1d.id] || _0x120e1d.videoRef);
    const _0x306de2 = normalizeMediaUrl(_0x120e1d.videoRef);
    const _0x1d4d86 = resolvePersonReplacementVoiceSeparationState(_0x10ceb5, _0x120e1d.id);
    const _0x9a73d0 = isPersonReplacementVoiceSeparationActive(_0x1d4d86);
    const _0x265e7e = normalizeMediaUrl(_0x1d4d86.vocalsAudioRef || _0x1d4d86.vocalsAudioUrl);
    const _0x68068d = Boolean(_0x265e7e);
    const _0x1c8441 = _0x120e1d.fileName || "视频 " + (_0x3fd038 + 1);
    const _0x1fc7ce = Number(_0x120e1d.durationSec);
    const _0x5a3440 = Number.isFinite(_0x1fc7ce) && _0x1fc7ce > 0 ? formatClock(_0x1fc7ce) : "完整视频";
    const _0x554999 = _0x3f8e0d ? "<img src=\"" + escapeHtml(_0x3f8e0d) + "\" alt=\"" + escapeHtml(_0x1c8441 + " 视频封面") + "\" decoding=\"async\" draggable=\"false\">" : _0x126dd9 ? "<video muted playsinline preload=\"metadata\" src=\"" + escapeHtml(_0x126dd9) + "\"></video>" : "<span aria-hidden=\"true\">视频</span>";
    const _0x3e6f4c = renderAudioPlaybackSurface({
      audioUrl: _0x306de2,
      className: "person-replacement-voice-source-player",
      playLabel: "播放" + _0x1c8441 + "的原始声音",
      pauseLabel: "暂停" + _0x1c8441 + "的原始声音",
      dataAttributes: {
        "data-person-replacement-voice-track": "original",
        "data-person-replacement-voice-track-source-id": _0x120e1d.id
      }
    });
    const _0x4ebb99 = _0x68068d ? renderAudioPlaybackSurface({
      audioUrl: _0x265e7e,
      className: "person-replacement-voice-source-player is-clean-voice",
      playLabel: "播放" + _0x1c8441 + "的清晰人声",
      pauseLabel: "暂停" + _0x1c8441 + "的清晰人声",
      dataAttributes: {
        "data-person-replacement-voice-track": "vocals",
        "data-person-replacement-voice-track-source-id": _0x120e1d.id
      }
    }) : "";
    const _0x11ba44 = _0x9a73d0 ? "提取清晰人声" : _0x68068d ? "已提取清晰人声" : _0x1d4d86.status === "failed" ? "重试" : "提取清晰人声";
    const _0x18b992 = _0x9a73d0 ? _0x68068d ? "正在更新，当前继续使用上次结果" : "正在分离人声与背景声…" : _0x68068d ? "已自动设为声音克隆输入" : "";
    const _0xb17c1 = _0x1d4d86.status === "failed" ? _0x1d4d86.error || "提取失败，请重试" : "";
    const _0x148a52 = _0xb17c1 ? renderGenerationErrorCardMarkup({
      errorMessage: _0xb17c1,
      title: "提取失败",
      className: "person-replacement-voice-error-card",
      role: "alert"
    }) : "";
    const _0x2c990a = _0x9a73d0 ? "正在提取清晰人声，点击可取消" : _0x68068d ? "已提取清晰人声，点击可重新提取" : _0x11ba44;
    const _0x4bd02a = _0x9a73d0 ? "<span class=\"storyboard-script-loading-spinner person-replacement-voice-extraction-spinner\" aria-hidden=\"true\"></span>" : "";
    return "<article class=\"person-replacement-voice-source-shell" + (_0x39f71b ? " is-selected" : "") + (_0x9a73d0 ? " is-extracting" : "") + "\" data-person-replacement-voice-source-shell data-source-id=\"" + escapeHtml(_0x120e1d.id) + "\">\n      <div class=\"person-replacement-voice-source-summary\">\n        <button type=\"button\" class=\"person-replacement-voice-source-card" + (_0x39f71b ? " is-selected" : "") + "\" data-person-replacement-action=\"select-voice-source\" data-source-id=\"" + escapeHtml(_0x120e1d.id) + "\" aria-pressed=\"" + _0x39f71b + "\" aria-label=\"" + escapeHtml("检测完整原始视频：" + _0x1c8441) + "\">\n          <span class=\"person-replacement-voice-source-thumb\">" + _0x554999 + "</span>\n          <span class=\"person-replacement-voice-source-copy\"><strong>" + escapeHtml(_0x1c8441) + "</strong><small>" + escapeHtml(_0x5a3440) + " · 原始上传</small></span>\n          <span class=\"person-replacement-voice-source-state\">" + (_0x39f71b ? "当前" : "选择") + "</span>\n        </button>\n        <button type=\"button\" class=\"person-replacement-voice-extraction-action" + (_0x9a73d0 ? " is-cancel is-loading" : "") + (_0x68068d && !_0x9a73d0 ? " is-success" : "") + "\" data-person-replacement-action=\"" + (_0x9a73d0 ? "cancel-voice-separation" : "extract-clean-voice") + "\" data-source-id=\"" + escapeHtml(_0x120e1d.id) + "\" title=\"" + escapeHtml(_0x2c990a) + "\" aria-label=\"" + escapeHtml(_0x2c990a) + "\" aria-busy=\"" + _0x9a73d0 + "\"" + (_0x306de2 ? "" : " disabled") + ">" + _0x4bd02a + "<span>" + escapeHtml(_0x11ba44) + "</span></button>\n      </div>\n      <div class=\"person-replacement-voice-source-details\">\n        <section class=\"person-replacement-voice-track\" aria-label=\"原始声音\">\n          <div class=\"person-replacement-voice-track-heading\"><strong>原始声音</strong><small>来自完整原始视频</small></div>\n          " + _0x3e6f4c + "\n        </section>\n        " + (_0x68068d ? "<section class=\"person-replacement-voice-track is-clean-voice\" aria-label=\"清晰人声\">\n          <div class=\"person-replacement-voice-track-heading\"><strong>清晰人声</strong><span>克隆输入</span></div>\n          " + _0x4ebb99 + "\n        </section>" : "") + "\n        " + _0x148a52 + "\n        " + (_0x18b992 ? "<footer class=\"person-replacement-voice-extraction-footer\"><span class=\"person-replacement-voice-extraction-status\" title=\"" + escapeHtml(_0x18b992) + "\">" + escapeHtml(_0x18b992) + "</span></footer>" : "") + "\n      </div>\n    </article>";
  }).join("");
  return _0x231366;
}
function renderVoiceCloneSources(_0x1cc05e) {
  const _0x2a398b = renderVoiceCloneSourceCards(_0x1cc05e);
  return "<aside class=\"person-replacement-voice-sources\" aria-label=\"原始上传视频\">\n    <header class=\"person-replacement-voice-column-heading\"><strong>原始视频</strong><small>声音检测始终使用最初上传的完整视频</small></header>\n    <div class=\"person-replacement-voice-source-list\">" + (_0x2a398b || "<p class=\"person-replacement-inline-empty\">请先在项目首页上传视频</p>") + "</div>\n  </aside>";
}
function renderPersonReplacementVoiceLayoutSplitter(_0x3af260, _0x254698) {
  const _0x20fbed = _0x3af260 === "assets";
  const _0x2904a5 = _0x20fbed ? _0x254698.assetsEnd : _0x254698.sourcesEnd;
  const _0x5d0466 = _0x20fbed ? 16 : _0x254698.assetsEnd + 16;
  const _0x11da25 = _0x20fbed ? _0x254698.sourcesEnd - 16 : 60;
  const _0xb0027f = _0x20fbed ? "调整原始视频栏宽度" : "调整人物素材栏宽度";
  return "<div class=\"person-replacement-voice-layout-splitter panel-resize-handle panel-resize-handle--transient is-" + _0x3af260 + "\" data-person-replacement-voice-layout-splitter=\"" + _0x3af260 + "\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"" + _0xb0027f + "\" aria-valuemin=\"" + Math.round(_0x5d0466) + "\" aria-valuemax=\"" + Math.round(_0x11da25) + "\" aria-valuenow=\"" + Math.round(_0x2904a5) + "\" tabindex=\"0\"></div>";
}
function applyPersonReplacementVoiceLayoutToElement(_0x2cb73c, _0x490216) {
  const _0x2ed105 = normalizePersonReplacementVoiceLayout(_0x490216);
  _0x2cb73c?.style?.setProperty?.("--person-replacement-voice-assets-end", _0x2ed105.assetsEnd + "%");
  _0x2cb73c?.style?.setProperty?.("--person-replacement-voice-sources-end", _0x2ed105.sourcesEnd + "%");
  const _0x48279a = _0x2cb73c?.querySelector?.("[data-person-replacement-voice-layout-splitter=\"assets\"]");
  const _0x66f5bb = _0x2cb73c?.querySelector?.("[data-person-replacement-voice-layout-splitter=\"sources\"]");
  _0x48279a?.setAttribute?.("aria-valuemax", String(Math.round(_0x2ed105.sourcesEnd - 16)));
  _0x48279a?.setAttribute?.("aria-valuenow", String(Math.round(_0x2ed105.assetsEnd)));
  _0x66f5bb?.setAttribute?.("aria-valuemin", String(Math.round(_0x2ed105.assetsEnd + 16)));
  _0x66f5bb?.setAttribute?.("aria-valuenow", String(Math.round(_0x2ed105.sourcesEnd)));
  return _0x2ed105;
}
function renderVoiceClone(_0x3edfe0) {
  const _0xfeeb8 = normalizePersonReplacementVoiceLayout(_0x3edfe0.workspace.voiceLayout);
  return "<div class=\"person-replacement-voice-page\">\n    <div class=\"person-replacement-voice-layout\" data-person-replacement-voice-layout style=\"--person-replacement-voice-assets-end:" + _0xfeeb8.assetsEnd + "%;--person-replacement-voice-sources-end:" + _0xfeeb8.sourcesEnd + "%\">\n      " + renderVoiceCloneSources(_0x3edfe0) + "\n      " + renderPersonReplacementVoiceLayoutSplitter("assets", _0xfeeb8) + "\n      " + renderVoiceCloneCharacterAssets(_0x3edfe0) + "\n      " + renderPersonReplacementVoiceLayoutSplitter("sources", _0xfeeb8) + "\n      <section class=\"person-replacement-voice-studio-column\" aria-label=\"声音克隆工作区\"><div class=\"person-replacement-voice-studio-host\" data-person-replacement-voice-studio-host></div></section>\n    </div>\n    " + personReplacementShellPresentation.renderStepFooter(_0x3edfe0, {
    nextLabel: "进入合成视频"
  }) + "\n  </div>";
}
function renderCompositePreview(_0x537f6c, _0x5d2e3c = {}) {
  const _0x315d0a = buildPersonReplacementCompositePreviewSnapshot(_0x537f6c);
  return personReplacementCompositePreviewPresentation.render(_0x315d0a, {
    composeActionHtml: renderCompositeComposeAction(_0x537f6c, _0x5d2e3c),
    playbackControlsHtml: personReplacementVideoPresentation.renderPlaybackControls(_0x315d0a.selectedShot, {
      context: "comparison",
      disabled: !_0x315d0a.canCompare
    }),
    composeOutputPending: _0x5d2e3c.composeOutputPending === true
  });
}
function renderProject(_0x1b17ad, _0x261b6a = {}) {
  const _0x564b5c = {
    1: renderAssetSettings,
    2: (_0x3afbf4, _0x134bb9) => personReplacementImagePresentation.render(_0x3afbf4, _0x134bb9),
    3: (_0x2d92b2, _0x5e2e49) => personReplacementVideoPresentation.render(_0x2d92b2, _0x5e2e49),
    4: renderVoiceClone,
    5: renderCompositePreview
  };
  const _0x6aa9f = _0x261b6a.cutEditorSmartDetectOpen ? renderShotCutSmartDetectPanel(_0x1b17ad, {
    smartDetecting: _0x261b6a.cutEditorSmartDetecting
  }) : "";
  const _0x47bd48 = _0x261b6a.canvasSyncOverlayInline === false ? "" : personReplacementShellPresentation.renderCanvasSyncLoadingOverlay(_0x261b6a);
  return personReplacementShellPresentation.renderHeader(_0x1b17ad, _0x261b6a) + "<main class=\"person-replacement-project-body\"" + (_0x261b6a.canvasSyncPending === true ? " aria-hidden=\"true\" inert" : "") + ">" + _0x564b5c[_0x1b17ad.workspace.step](_0x1b17ad, _0x261b6a) + "</main>" + _0x6aa9f + _0x47bd48;
}
function renderHiddenInputs() {
  return "<div class=\"story-asset-hover-preview\" data-story-asset-hover-preview role=\"tooltip\" aria-hidden=\"true\"></div><div class=\"story-media-history-menu story-clip-video-history-menu\" data-person-replacement-result-history-menu aria-hidden=\"true\"></div><input type=\"file\" accept=\"video/*\" multiple hidden data-person-replacement-input=\"source-videos\"><input type=\"file\" accept=\"image/*\" multiple hidden data-person-replacement-input=\"new-character-images\"><input type=\"file\" accept=\"image/*\" multiple hidden data-person-replacement-input=\"new-scene-images\"><input type=\"file\" accept=\"audio/*\" multiple hidden data-person-replacement-input=\"new-audio-files\"><input type=\"file\" accept=\"image/*\" hidden data-person-replacement-input=\"appearance-image\"><input type=\"file\" accept=\"image/*\" hidden data-person-replacement-input=\"replacement-image\"><input type=\"file\" accept=\"image/*,video/*\" hidden data-person-replacement-input=\"replacement-video-slot\"><input type=\"file\" accept=\"audio/*\" hidden data-person-replacement-input=\"character-voice\">";
}
export function renderPersonReplacementWorkspace(_0x4ae51e = {}, _0x16e142 = {}) {
  const _0x90b2c7 = a1155_0x56b8cf(_0x4ae51e);
  const _0x228b5d = _0x90b2c7.workspace.view === "home" ? personReplacementShellPresentation.renderHome(_0x90b2c7) : renderProject(_0x90b2c7, _0x16e142);
  return "<section class=\"person-replacement-workspace\" data-person-replacement-workspace data-person-replacement-view=\"" + _0x90b2c7.workspace.view + "\" data-person-replacement-step=\"" + _0x90b2c7.workspace.step + "\">" + _0x228b5d + renderHiddenInputs() + "</section>";
}
function resolveMountTarget(_0xb4ab33, _0x41e7ff) {
  if (_0x41e7ff?.nodeType === 1) {
    return _0x41e7ff;
  }
  return _0xb4ab33?.querySelector?.(_0x41e7ff) || _0xb4ab33?.body || null;
}
export function createReplacementStudioWorkspace({
  documentObject = globalThis.document,
  windowObject = globalThis.window || globalThis,
  videoClipController = a1155_0x4b764a,
  createVideoPlayback = createWorkspaceVideoPlayback,
  mountTarget = "#v2-wrap",
  initialProject = {},
  projectSession = null,
  getLibraryAssets = null,
  onSourceVideosSelected = null,
  onSourceVideoSelected = null,
  onRemoveSourceRequested = () => {},
  onProcessRequested = () => {},
  onAddLibraryAssetsToProjectRequested = null,
  onAddLibraryAssetsToCharactersRequested = () => {},
  onAddAssetAppearanceToLibraryRequested = null,
  onNewCharacterImagesSelected = null,
  onNewCharacterImageSelected = null,
  onNewSceneImagesSelected = () => {},
  onNewAudioFilesSelected = () => {},
  onCharacterReferenceSelected = () => {},
  onReplacementImageSelected = () => {},
  onReplacementVideoInputSelected = () => {},
  onReplacementVideoInputRemoved = () => {},
  onShotKeyframeSelected = () => {},
  onCharacterVoiceSelected = () => {},
  onCharacterVoiceLibrarySelected = () => {},
  onDeleteCharacterRequested = () => {},
  onDeleteSceneRequested = () => {},
  onDeleteAudioAssetRequested = () => {},
  onDownloadImageRequested = () => {},
  onGenerateCharacterImageRequested = () => {},
  onGenerateReplacementImageRequested = () => {},
  onCancelReplacementImageRequested = () => {},
  onGenerateReplacementVideoRequested = () => {},
  onCancelReplacementVideoRequested = () => {},
  onGenerationBatchCompleted = () => {},
  onShotCutDetectionRequested = () => {},
  onShotCutRangesRequested = () => {},
  onShotReverseRequested = () => {},
  onManualPersonSelected = () => {},
  onUpdatePeopleRequested = () => {},
  onDeletePeopleRequested = () => {},
  onMergeSourceIdentitiesRequested = () => {},
  onSplitSourceIdentityRequested = () => {},
  onConfirmSourceIdentityRequested = () => {},
  onVoiceStudioMount = () => {},
  onVoiceSeparationRequested = () => {},
  onVoiceSeparationCancelRequested = () => {},
  onVoiceSeparationResumeRequested = () => {},
  onOpenProjectRequested = () => {},
  onRenameProjectRequested = () => {},
  onDuplicateProjectRequested = () => {},
  onArchiveProjectRequested = () => {},
  onDeleteProjectRequested = () => {},
  onBackHomeRequested = () => {},
  onComposeRequested = () => {},
  onExportRequested = () => {},
  onAddToCanvasRequested = () => {},
  onStepNavigationBlocked = () => {},
  canClose = () => true,
  onClose = () => {}
} = {}) {
  let _0x38e2d5 = a1155_0x56b8cf(initialProject);
  const _0x4f8d14 = createWorkspaceAssetLibraryDisclosure();
  let _0x318ed6 = null;
  let _0x25b1da = null;
  let _0x362ce5 = false;
  let _0x364938 = mountTarget;
  let _0x41ce6e = null;
  const _0xd94f9f = new Set();
  let _0x59b80b = "";
  let _0x1b1750 = [];
  let _0x3a40cf = null;
  let _0x1f6895 = null;
  let _0x4516df = null;
  let _0xb158ca = null;
  let _0x137278 = [];
  let _0xcc4bc3 = null;
  let _0x2605dd = null;
  let _0x52380b = null;
  let _0x3fe184 = false;
  let _0x2a3a58 = "";
  let _0x11ed59 = false;
  let _0x48a077 = false;
  let _0x29ece9 = null;
  let _0x9d6d30 = null;
  const _0x33a544 = new Map();
  let _0x2bfe44 = null;
  let _0x3e0738 = false;
  let _0x4dd8fd = null;
  let _0x285b9d = "";
  let _0xf2a298 = "";
  let _0x1a8376 = null;
  let _0x5b4c64 = 0;
  let _0x342774 = 0;
  let _0xe3908c = 0;
  let _0x48725f = null;
  let _0xa398d5 = "";
  let _0x16a723 = false;
  let _0xf44a2a = null;
  let _0x1ee1c3 = null;
  let _0x2d2968 = null;
  let _0xbbc934 = null;
  let _0x37c7f0 = null;
  const _0x2e9af6 = new Map();
  const _0x38a0e2 = new Map();
  let _0x51002a = null;
  let _0x36e06c = false;
  let _0x35ca7d = null;
  let _0x16fd8e = null;
  const _0x420bb9 = createPersonReplacementCompositeMediaResidency({
    projectId: _0x38e2d5.id
  });
  let _0x473164 = false;
  const _0x5bddd1 = createPersonReplacementShotCutSession({
    initialProject: _0x38e2d5,
    windowObject: windowObject,
    onBoundaryDragStopped: () => {
      documentObject?.body?.classList?.remove?.("person-replacement-cut-resizing");
    },
    onDetectionRequested: async _0x1922fe => {
      const _0x109842 = await onShotCutDetectionRequested(_0x1922fe, {
        project: cloneJson(_0x38e2d5)
      });
      const _0x1088c6 = Array.isArray(_0x109842?.ranges) ? _0x109842.ranges : [];
      if (!_0x1088c6.length) {
        throw new Error("智能检测未返回可用切口");
      }
      return _0x1088c6;
    },
    playbackControllerOptions: {
      windowObject: windowObject,
      isEditorOpen: () => _0x3440f2.isOpen,
      getDraft: () => _0x3440f2.draft,
      getProject: () => _0x38e2d5,
      syncNativePlayback: _0x37adbe => _0x57a8f7(_0x37adbe),
      syncTimelinePosition: _0x58d96c => {
        _0x3440f2.playheadSec = _0x58d96c.timelineSec;
        _0x3440f2.previewShotId = _0x58d96c.shotId;
        _0x53ee48();
      },
      previewShotCut: (..._0x3dcdfb) => _0x4c0d1b(..._0x3dcdfb)
    }
  });
  const _0x3440f2 = _0x5bddd1.workspaceState;
  const _0x2e9a33 = _0x1338ec => Boolean(_0x1338ec && !_0x1338ec.error && _0x1338ec.seeking !== true && Number(_0x1338ec.readyState) >= 2 && normalizeText(_0x1338ec.currentSrc || _0x1338ec.getAttribute?.("src") || _0x1338ec.src));
  let _0x1377af = null;
  let _0x1893b0 = null;
  let _0x182068 = false;
  let _0x3a640d = null;
  let _0x49248e = null;
  let _0x51aaf9 = "";
  let _0x26dcb0 = "";
  let _0x50fd35 = new Set();
  let _0x2f1445 = "";
  let _0x28b90d = false;
  let _0x44808f = null;
  let _0x4eb471 = null;
  const _0xfebc3 = new Map();
  let _0x1a1b80 = 0;
  let _0x22e4b4 = false;
  let _0x41fe7d = "";
  let _0x385ea6 = new Set();
  let _0x4ca9d5 = new Set();
  let _0x56a1df = null;
  let _0x11a18b = "none";
  let _0x5a2f56 = "page";
  let _0x5d5c1e = null;
  let _0x1cb872 = "";
  let _0x35790e = false;
  let _0x304022 = "";
  let _0x3348c9 = () => false;
  const _0x33a51c = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x54f0d7 = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x1b5dfd = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x37f3c0 = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x2c9903 = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x297dda = new Map();
  const _0x4f7632 = createWorkspaceMenuController({
    root: () => _0x318ed6,
    wrapperSelector: "[data-person-replacement-output-menu]",
    triggerSelector: "[data-person-replacement-output-menu-trigger]",
    menuSelector: ".story-canvas-sync-menu",
    optionSelector: ".story-canvas-sync-option"
  });
  const _0x282d91 = (_0x137175 = null) => _0x4f7632.close(_0x137175);
  const _0x167d1c = _0x458598 => _0x4f7632.toggle(_0x458598);
  const _0xc38233 = _0x2e2044 => {
    if (typeof onSourceVideosSelected === "function") {
      return _0x443f39(onSourceVideosSelected, _0x2e2044);
    }
    if (typeof onSourceVideoSelected === "function") {
      return Promise.all(_0x2e2044.map(_0x3e85d2 => onSourceVideoSelected(_0x3e85d2)));
    }
    return null;
  };
  const _0x5636bb = _0x266ca2 => {
    if (typeof onNewCharacterImagesSelected === "function") {
      return _0x443f39(onNewCharacterImagesSelected, _0x266ca2);
    }
    if (typeof onNewCharacterImageSelected === "function") {
      return Promise.all(_0x266ca2.map(_0x5439ea => onNewCharacterImageSelected(_0x5439ea, {
        project: cloneJson(_0x38e2d5)
      })));
    }
    return null;
  };
  const _0x362662 = () => {
    if (typeof getLibraryAssets !== "function") {
      return null;
    }
    try {
      const _0x21cfb6 = getLibraryAssets();
      if (Array.isArray(_0x21cfb6)) {
        return _0x21cfb6;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  };
  const _0x5c163a = (_0x4c89dd = _0x38e2d5) => {
    const _0x45fdd7 = _0x362662();
    if (_0x45fdd7 === null) {
      return _0x4c89dd;
    } else {
      return a1155_0x56b8cf({
        ..._0x4c89dd,
        libraryAssets: _0x45fdd7
      });
    }
  };
  const _0x19e3af = (_0x361788, _0x4dc5b7) => {
    const _0x4293f6 = a1155_0x56b8cf(_0x361788);
    if (typeof projectSession?.commitWorkspaceProject !== "function") {
      return _0x4293f6;
    }
    const _0x4e8911 = projectSession.commitWorkspaceProject(cloneJson(_0x4293f6), {
      reason: _0x4dc5b7
    });
    return a1155_0x56b8cf({
      ..._0x4e8911,
      libraryProjects: _0x4293f6.libraryProjects,
      libraryAssets: _0x4293f6.libraryAssets,
      sourcePreviewRefs: _0x4293f6.sourcePreviewRefs,
      persistenceState: _0x4293f6.persistenceState
    });
  };
  const _0x575f0c = _0x425ba7 => {
    _0x38e2d5 = _0x19e3af(_0x38e2d5, _0x425ba7);
    return cloneJson(_0x38e2d5);
  };
  const _0x4fe314 = () => isPersonReplacementSourceProcessing(_0x38e2d5);
  const _0x43f5cd = (_0x28030f, _0x5b3e0a = 0) => {
    onStepNavigationBlocked({
      reason: _0x28030f,
      currentStep: _0x38e2d5.workspace.step,
      requestedStep: _0x5b3e0a,
      project: cloneJson(_0x38e2d5)
    });
  };
  const _0x2a557f = (_0x3170a0 = _0x38e2d5) => {
    const _0x3bf918 = _0x3170a0?.workspace || {};
    if (_0x3bf918.view !== "project") {
      return normalizeText(_0x3bf918.view) || "home";
    }
    const _0x5d5edb = Math.trunc(Number(_0x3bf918.step) || 1);
    if (_0x5d5edb === 1) {
      return "project:" + _0x5d5edb + ":asset:" + (["character", "scene", "audio", "library"].includes(_0x3bf918.characterAssetTab) ? _0x3bf918.characterAssetTab : "character");
    } else {
      return "project:" + _0x5d5edb;
    }
  };
  const _0xfe3258 = (_0x3b3ec2 = _0x38e2d5) => (normalizeText(_0x3b3ec2?.id) || "draft") + "" + _0x2a557f(_0x3b3ec2);
  const _0x43a8dc = (_0x2b236d, _0x99f9b5, {
    assetScope = "asset-content"
  } = {}) => {
    const _0x4c1f6d = _0x2b236d?.workspace || {};
    const _0x240113 = _0x99f9b5?.workspace || {};
    if (_0x4c1f6d.view !== "project" || _0x240113.view !== "project") {
      return;
    }
    const _0x403630 = Math.trunc(Number(_0x4c1f6d.step) || 1);
    const _0x3c253a = Math.trunc(Number(_0x240113.step) || 1);
    if (_0x403630 !== _0x3c253a) {
      _0x11a18b = _0x3c253a > _0x403630 ? "forward" : "backward";
      _0x5a2f56 = "page";
      return;
    }
    if (_0x3c253a !== 1) {
      return;
    }
    const _0x9e3d68 = resolveWorkspaceTabTransitionDirection(_0x4c1f6d.characterAssetTab, _0x240113.characterAssetTab, ["character", "scene", "audio", "library"]);
    if (_0x9e3d68 === "none") {
      return;
    }
    _0x11a18b = _0x9e3d68;
    _0x5a2f56 = assetScope === "asset-list" ? "asset-list" : "asset-content";
  };
  const _0x3f32c6 = (_0x333894, _0x1472ba = null) => {
    const _0x2e0769 = _0x333894?.project || _0x333894;
    if (_0x2e0769 && typeof _0x2e0769 === "object") {
      _0x47c105.setProject(_0x1472ba ? {
        ..._0x2e0769,
        workspace: {
          ...(_0x2e0769.workspace || {}),
          ..._0x1472ba
        }
      } : _0x2e0769);
    }
  };
  const _0x443f39 = (_0x506bbe, _0xe13c83, _0x395679 = {}, {
    applyCallbackResult = true
  } = {}) => {
    const _0xe47344 = _0x38e2d5.workspace.view === "home" ? {
      projectSearchQuery: _0x38e2d5.workspace.projectSearchQuery,
      projectSortOrder: _0x38e2d5.workspace.projectSortOrder,
      showArchivedProjects: _0x38e2d5.workspace.showArchivedProjects,
      openProjectMenuId: "",
      pendingDeleteProjectId: ""
    } : null;
    try {
      const _0x2e045a = _0x506bbe(_0xe13c83, {
        project: cloneJson(_0x38e2d5),
        ..._0x395679
      });
      if (_0x2e045a?.then) {
        _0x2e045a.then(_0x34d379 => {
          if (applyCallbackResult) {
            _0x3f32c6(_0x34d379, _0xe47344);
          }
        }, () => {});
      } else if (applyCallbackResult) {
        _0x3f32c6(_0x2e045a, _0xe47344);
      }
      return _0x2e045a;
    } catch (_0x5efb68) {
      globalThis.queueMicrotask?.(() => {
        throw _0x5efb68;
      });
      return null;
    }
  };
  const _0x1f1455 = (_0x42199a, _0x5c8add = "") => {
    const _0x37a43e = normalizeText(_0x42199a?.dataset?.shotId);
    if (!_0x37a43e) {
      return "";
    }
    const _0x519cae = readPersonReplacementVideoPromptEditor(_0x42199a);
    _0x38e2d5 = a1155_0x56b8cf({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x595c08 => _0x595c08.id === _0x37a43e ? {
        ..._0x595c08,
        videoPrompt: _0x519cae
      } : _0x595c08)
    });
    if (_0x5c8add) {
      _0x575f0c(_0x5c8add);
    }
    return _0x519cae;
  };
  const _0x56a07e = (_0x41629b, _0x53a13e, _0x17a359 = {}) => {
    if (!_0x41629b) {
      return;
    }
    insertPresetPromptIntoEditor({
      storeApi: null,
      promptEl: _0x41629b,
      template: _0x53a13e,
      allowedAssetTypes: ["text", "image", "video", "audio"]
    });
    _0x1f1455(_0x41629b, "video-prompt-preset");
    if (_0x17a359?.insertPrompt === true) {
      return;
    }
    _0x443f39(onGenerateReplacementVideoRequested, {
      projectId: _0x38e2d5.id,
      shotId: normalizeText(_0x41629b.dataset?.shotId)
    }, {}, {
      applyCallbackResult: false
    });
  };
  const _0x35f067 = (_0x3b9c77, _0x5004fa = _0x38e2d5.id) => normalizeText(_0x5004fa) + "" + normalizeText(_0x3b9c77);
  const _0x7ac058 = (_0x487f92, _0x1dacca) => {
    const _0x16fdc2 = _0x35f067(_0x487f92);
    if (_0xd94f9f.has(_0x16fdc2)) {
      return null;
    }
    _0xd94f9f.add(_0x16fdc2);
    _0x3be3ab();
    let _0x431734 = null;
    try {
      _0x431734 = _0x1dacca();
    } catch (_0x1f7afa) {
      _0xd94f9f.delete(_0x16fdc2);
      _0x3be3ab();
      windowObject?.showToast?.(_0x1f7afa?.message || "素材上传失败，请稍后重试。", "error");
      return null;
    }
    const _0x3e78f7 = () => {
      if (!_0xd94f9f.delete(_0x16fdc2)) {
        return;
      }
      _0x3be3ab();
    };
    if (!_0x431734?.then) {
      _0x3e78f7();
      return _0x431734;
    }
    Promise.resolve(_0x431734).catch(_0x214f3f => {
      windowObject?.showToast?.(_0x214f3f?.message || "素材上传失败，请稍后重试。", "error");
    }).finally(_0x3e78f7);
    return _0x431734;
  };
  const _0x59d14f = (_0x45f54a, _0xda5cd4) => {
    const _0x490191 = _0x45f54a?.querySelector?.("[data-person-replacement-action=\"toggle-library-add-targets\"]");
    const _0x41e18e = _0x45f54a?.querySelector?.(".story-asset-batch-menu");
    if (!_0x45f54a || !_0x490191 || !_0x41e18e) {
      return false;
    }
    if (_0xda5cd4) {
      syncWorkspaceInlineMenuExpandedWidth(_0x41e18e);
    }
    _0x45f54a.classList?.toggle?.("is-open", _0xda5cd4);
    _0x490191.setAttribute?.("aria-expanded", String(_0xda5cd4));
    _0x41e18e.setAttribute?.("aria-hidden", String(!_0xda5cd4));
    return true;
  };
  const _0x2cb99f = (_0x377f0f = null) => {
    _0x318ed6?.querySelectorAll?.(".person-replacement-library-add-menu-wrap.is-open")?.forEach?.(_0x30e5ca => {
      if (_0x30e5ca !== _0x377f0f) {
        _0x59d14f(_0x30e5ca, false);
      }
    });
  };
  const _0x36b2dc = (_0x5e21e4, _0x4c1c0c) => {
    const _0xbf424 = _0x5e21e4?.querySelector?.("[data-story-action=\"toggle-character-voice-menu\"]");
    const _0x195aed = _0x5e21e4?.querySelector?.(".person-replacement-add-voice-menu");
    if (!_0x5e21e4 || !_0xbf424 || !_0x195aed) {
      return false;
    }
    _0x5e21e4.classList?.toggle?.("is-open", _0x4c1c0c);
    _0xbf424.setAttribute?.("aria-expanded", String(_0x4c1c0c));
    _0x195aed.setAttribute?.("aria-hidden", String(!_0x4c1c0c));
    return true;
  };
  const _0xf5b39c = (_0x5a5afb = null) => {
    _0x318ed6?.querySelectorAll?.(".person-replacement-add-voice-menu-wrap.is-open")?.forEach?.(_0x211944 => {
      if (_0x211944 !== _0x5a5afb) {
        _0x36b2dc(_0x211944, false);
      }
    });
  };
  const _0x1ef913 = (_0x406797, _0x3f9d18) => {
    const _0x3aa9f0 = _0x38e2d5;
    _0x38e2d5 = _0x19e3af(_0x406797, _0x3f9d18);
    const _0xaad12f = normalizeText(_0x3f9d18);
    const _0xf1bb2 = ["character-voice-library-open", "character-voice-library-cancel", "character-voice-library-confirm"].includes(_0xaad12f) ? "asset-list" : "asset-content";
    _0x43a8dc(_0x3aa9f0, _0x38e2d5, {
      assetScope: _0xf1bb2
    });
    if (!_0x3348c9(_0x3f9d18)) {
      _0x3be3ab();
    }
    return cloneJson(_0x38e2d5);
  };
  const _0x358a3c = ({
    detectionBox: _0x16c43b,
    label: _0x49a00c,
    sourceCharacterId: _0x434a76,
    orientation: _0x409c99
  } = {}) => {
    const _0x1f120b = normalizeText(_0x16c43b?.dataset?.shotId);
    const _0xaa3299 = normalizeText(_0x16c43b?.dataset?.personId);
    const _0x3fa7ae = _0x38e2d5.shots.find(_0x55c8d2 => _0x55c8d2.id === _0x1f120b);
    const _0x28adef = _0x3fa7ae?.people?.find(_0x1bbda5 => _0x1bbda5.id === _0xaa3299);
    if (!_0x28adef) {
      return false;
    }
    const _0x51565a = _0x49a00c === undefined ? normalizeText(_0x28adef.label) : normalizeText(_0x49a00c);
    if (!_0x51565a) {
      return false;
    }
    const _0x3411f8 = normalizeText(_0x434a76, normalizeText(_0x28adef.sourceCharacterId));
    const _0x414ebd = _0x409c99 === undefined ? normalizeText(_0x28adef.orientation) : normalizeText(_0x409c99);
    const _0x4993ba = a1155_0x133b49(_0x1f120b, _0xaa3299);
    const _0x418bd3 = {
      ..._0x38e2d5.workspace.identityCorrectionDrafts
    };
    delete _0x418bd3[_0x4993ba];
    const _0x28f9f7 = _0x38e2d5.workspace.removedCustomPersonLabels.filter(_0x55e21f => _0x55e21f !== _0x51565a);
    _0x38e2d5 = a1155_0x56b8cf({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        identityCorrectionDrafts: _0x418bd3,
        removedCustomPersonLabels: _0x28f9f7
      }
    });
    _0x443f39(onConfirmSourceIdentityRequested, {
      sourceCharacterId: _0x28adef.sourceCharacterId,
      targetSourceCharacterId: _0x3411f8,
      shotId: _0x1f120b,
      personId: _0xaa3299,
      label: _0x51565a,
      orientation: _0x414ebd,
      silent: true
    });
    return true;
  };
  const _0x33392f = () => {
    _0x51002a?.destroy?.();
    _0x51002a = null;
  };
  const _0x1eb4bb = _0x1f987d => {
    _0x33392f();
    const _0x2ad48d = _0x2e9af6.get(_0x1f987d);
    _0x2ad48d?.destroy?.();
    _0x2e9af6.delete(_0x1f987d);
  };
  const _0x394541 = ({
    closeClip = true
  } = {}) => {
    _0x33392f();
    Array.from(_0x2e9af6.keys()).forEach(_0x1eb4bb);
    _0x35ca7d?.();
    _0x35ca7d = null;
    if (closeClip && _0x473164) {
      videoClipController?.exit?.({
        silent: true
      });
      _0x473164 = false;
    }
  };
  const _0x145a0d = () => {
    _0x33392f();
    const _0x5e19ac = _0x2e9af6.get("source");
    const _0x12b3d4 = _0x2e9af6.get("result");
    const _0x58c5c4 = _0x12b3d4?.controlsEl?.querySelector?.("[data-person-replacement-video-sync-play]");
    if (!_0x5e19ac?.videoEl || !_0x12b3d4?.videoEl || !_0x58c5c4) {
      return false;
    }
    _0x51002a = createPersonReplacementVideoSyncPlayback({
      sourceVideo: _0x5e19ac.videoEl,
      resultVideo: _0x12b3d4.videoEl,
      sourcePlay: _0x5e19ac.play,
      resultPlay: _0x12b3d4.play,
      button: _0x58c5c4,
      initiallyEnabled: _0x36e06c,
      onEnabledChange(_0x503c97) {
        _0x36e06c = _0x503c97;
      }
    });
    return true;
  };
  const _0x446efc = () => {
    _0x16fd8e?.destroy?.();
    _0x16fd8e = null;
  };
  const _0x2dab32 = ({
    composeOnly = false
  } = {}) => {
    const _0x1cd27e = _0x420bb9.peek("original");
    if (composeOnly && _0x1cd27e?.reason !== "compose") {
      return false;
    }
    if (!_0x1cd27e) {
      return false;
    }
    if (_0x1cd27e.preserveVisibleElement === true && !_0x1cd27e.controller) {
      return _0x420bb9.forget("original");
    }
    return _0x420bb9.evict("original");
  };
  const _0x4ccd43 = () => _0x420bb9.evict("replacement");
  const _0x336ffd = (_0x652cea = "") => {
    const _0x439931 = normalizeMediaUrl(_0x652cea);
    if (!_0x439931) {
      _0x2dab32();
      return false;
    }
    if (_0x420bb9.peek("original")?.sourceUrl === _0x439931) {
      return true;
    }
    _0x2dab32();
    const _0x1315b9 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-video=\"original\"]");
    const _0x1298c3 = normalizeText(_0x1315b9?.dataset?.personReplacementCompareVideoUrl);
    const _0x3f53fe = normalizeText(_0x1315b9?.getAttribute?.("src") || _0x1315b9?.currentSrc || _0x1315b9?.src);
    const _0x34de17 = Boolean(_0x1315b9 && _0x1298c3 === _0x439931 && _0x3f53fe);
    const _0x1068e3 = _0x34de17 ? _0x1315b9 : documentObject?.createElement?.("video");
    if (!_0x1068e3) {
      return false;
    }
    _0x1068e3.dataset.personReplacementCompareVideo = "original";
    _0x1068e3.dataset.personReplacementCompareVideoUrl = _0x439931;
    _0x1068e3.preload = "auto";
    _0x1068e3.muted = true;
    if (!_0x34de17) {
      _0x1068e3.classList?.add?.("person-replacement-composite-original-prewarm");
      _0x1068e3.setAttribute?.("aria-hidden", "true");
      _0x1068e3.setAttribute?.("tabindex", "-1");
    }
    _0x1068e3.setAttribute?.("playsinline", "");
    const _0xdf6b46 = _0x420bb9.nextSequence("original");
    let _0x177787 = null;
    if (!_0x34de17) {
      try {
        _0x177787 = createVideoPlayback({
          videoEl: _0x1068e3,
          sourceUrl: _0x439931,
          ownerId: ["person-replacement", normalizeText(_0x38e2d5.id) || "project", "complete-video", "composite", "original", "warmup-" + _0xdf6b46].join(":"),
          allowConcurrentPlayback: true,
          preferStreamingSource: false,
          acquirePlaybackOptions: {
            bypassConcurrencyLimit: true,
            maxBytes: PERSON_REPLACEMENT_COMPOSITE_PREWARM_MAX_BYTES,
            timeout: PERSON_REPLACEMENT_COMPOSITE_PREWARM_TIMEOUT_MS
          }
        });
      } catch {
        _0x1068e3.remove?.();
        return false;
      }
    }
    const _0x2b8d60 = _0x420bb9.retain({
      projectId: _0x38e2d5.id,
      role: "original",
      sourceUrl: _0x439931,
      videoEl: _0x1068e3,
      controller: _0x177787,
      preserveVisibleElement: _0x34de17,
      reason: "compose"
    });
    if (!_0x2b8d60) {
      _0x177787?.destroy?.();
      _0x1068e3.remove?.();
      return false;
    }
    if (!_0x34de17) {
      const _0x1f97cd = _0x318ed6?.querySelector?.("[data-person-replacement-compare-card=\"original\"] .person-replacement-compare-media-frame") || documentObject?.body;
      _0x1f97cd?.appendChild?.(_0x1068e3);
    }
    const _0x472db7 = _0x34de17 ? _0x16fd8e?.warmOriginalPlayback?.(_0x439931) : typeof _0x177787?.play === "function" ? _0x177787.play() : _0x177787?.warm?.();
    Promise.resolve(_0x472db7).then(() => {
      if (_0x420bb9.peek("original")?.videoEl !== _0x1068e3) {
        return;
      }
      try {
        _0x1068e3.pause?.();
      } catch {}
    }).catch(() => false);
    return true;
  };
  const _0x245430 = _0x1c85f8 => {
    const _0x4ed329 = normalizeText(_0x1c85f8?.dataset?.personReplacementCompareVideoUrl);
    return _0x420bb9.adopt({
      projectId: _0x38e2d5.id,
      role: "original",
      sourceUrl: _0x4ed329,
      renderedVideo: _0x1c85f8
    });
  };
  const _0x29b2e5 = _0x533a6b => {
    const _0x132f50 = _0x420bb9.peek("replacement");
    const _0x5878a3 = normalizeText(_0x533a6b?.dataset?.personReplacementCompareVideoUrl);
    if (!_0x132f50 || !_0x533a6b || _0x5878a3 !== _0x132f50.sourceUrl || _0x533a6b !== _0x132f50.videoEl && typeof _0x533a6b.replaceWith !== "function") {
      if (_0x132f50 && buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5).previewMode === "full" && _0x5878a3 !== _0x132f50.sourceUrl) {
        _0x4ccd43();
      }
      return null;
    }
    return _0x420bb9.adopt({
      projectId: _0x38e2d5.id,
      role: "replacement",
      sourceUrl: _0x5878a3,
      renderedVideo: _0x533a6b
    });
  };
  const _0x3bd0b3 = () => {
    const _0x51d59d = _0x420bb9.peek("original");
    if (!_0x51d59d || _0x51d59d.controller || _0x51d59d.preserveVisibleElement !== true) {
      return false;
    }
    const _0x22e968 = _0x16fd8e?.retainOriginalPlayback?.(_0x51d59d.sourceUrl);
    if (!_0x22e968?.controller) {
      return false;
    }
    if (!_0x420bb9.handoff("original", _0x22e968)) {
      _0x22e968.controller.destroy?.();
      return false;
    }
    _0x16fd8e = null;
    return true;
  };
  const _0x293979 = () => {
    if (_0x420bb9.has("original") || _0x420bb9.has("replacement")) {
      return false;
    }
    const _0x2b99a3 = buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5).fullMedia;
    const _0x81bc9a = _0x16fd8e?.retainFullPlaybacks?.({
      original: normalizeMediaUrl(_0x2b99a3.originalRef),
      replacement: normalizeMediaUrl(_0x2b99a3.replacementRef)
    });
    if (!_0x81bc9a?.original && !_0x81bc9a?.replacement) {
      return false;
    }
    if (_0x81bc9a.original) {
      _0x420bb9.retain({
        ..._0x81bc9a.original,
        projectId: _0x38e2d5.id,
        role: "original",
        preserveVisibleElement: true,
        reason: "mode-cache"
      });
    }
    if (_0x81bc9a.replacement) {
      _0x420bb9.retain({
        ..._0x81bc9a.replacement,
        projectId: _0x38e2d5.id,
        role: "replacement"
      });
    }
    _0x16fd8e = null;
    return true;
  };
  const _0x4510e2 = () => {
    _0x35ca7d?.();
    _0x35ca7d = null;
    const _0x4b9d09 = Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-video-center-stage]") || []);
    const _0x172e28 = _0x4b9d09.map(_0x175464 => {
      const _0x5a47a9 = _0x175464.querySelector?.("[data-person-replacement-video-center-player]");
      if (!_0x5a47a9) {
        return null;
      }
      const _0x6b4f42 = () => {
        const _0x172ead = _0x5a47a9.paused === false && _0x5a47a9.ended !== true;
        _0x175464.classList?.toggle?.("is-playing", _0x172ead);
        if (_0x175464.dataset) {
          _0x175464.dataset.personReplacementVideoPlaybackState = _0x172ead ? "playing" : "paused";
        }
      };
      const _0x3572e7 = ["play", "playing", "pause", "ended", "emptied"];
      _0x3572e7.forEach(_0x199dd5 => {
        _0x5a47a9.addEventListener?.(_0x199dd5, _0x6b4f42);
      });
      _0x6b4f42();
      return () => {
        _0x3572e7.forEach(_0x2fa1bb => {
          _0x5a47a9.removeEventListener?.(_0x2fa1bb, _0x6b4f42);
        });
      };
    }).filter(Boolean);
    _0x35ca7d = () => {
      _0x172e28.forEach(_0x514338 => _0x514338());
    };
  };
  const _0x4af0ea = ({
    roles = ["source", "result"],
    reset = true
  } = {}) => {
    const _0x147fff = [...new Set((Array.isArray(roles) ? roles : []).filter(_0x11cdab => _0x11cdab === "source" || _0x11cdab === "result"))];
    if (reset) {
      Array.from(_0x2e9af6.keys()).forEach(_0x1eb4bb);
    }
    _0x4510e2();
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 3) {
      return;
    }
    const _0x295995 = personReplacementVideoPresentation.build(_0x38e2d5).shot;
    _0x147fff.forEach(_0x39d78d => {
      _0x1eb4bb(_0x39d78d);
      const _0x530073 = _0x318ed6?.querySelector?.("[data-person-replacement-video-player=\"" + _0x39d78d + "\"]");
      const _0x42a6c4 = _0x318ed6?.querySelector?.("[data-person-replacement-video-controls=\"" + _0x39d78d + "\"]");
      const _0x4d82f9 = normalizeText(_0x530073?.dataset?.personReplacementVideoUrl);
      if (!_0x530073 || !_0x42a6c4 || !_0x4d82f9) {
        return;
      }
      const _0x224280 = _0x42a6c4.querySelector?.("[data-person-replacement-video-play]");
      const _0x28d745 = _0x42a6c4.querySelector?.("[data-person-replacement-video-volume]");
      const _0xdd79b8 = _0x42a6c4.querySelector?.("[data-person-replacement-video-volume-toggle]");
      const _0x3c9691 = _0x42a6c4.querySelector?.("[data-person-replacement-video-progress]");
      const _0x1a20f1 = _0x42a6c4.querySelector?.("[data-person-replacement-video-progress-fill]");
      const _0x418060 = _0x42a6c4.querySelector?.("[data-person-replacement-video-time-current]");
      const _0x483bc4 = _0x42a6c4.querySelector?.("[data-person-replacement-video-time-total]");
      const _0x2f64be = normalizeText(_0x42a6c4.dataset?.personReplacementVideoLabel) || (_0x39d78d === "result" ? "替换结果" : "当前片段");
      let _0x284596 = false;
      const _0x3effe4 = _0x38a0e2.get(_0x39d78d);
      let _0x114a6d = _0x3effe4 ? clamp(Number(_0x3effe4.lastAudibleVolume), 0, 1, 1) || 1 : clamp(Number(_0x530073.volume), 0, 1, 1) || 1;
      if (_0x3effe4) {
        _0x530073.volume = clamp(Number(_0x3effe4.volume), 0, 1, 1);
        _0x530073.muted = _0x3effe4.muted === true;
      }
      const _0x31c6a1 = () => {
        const _0x219fc4 = clamp(Number(_0x530073.volume), 0, 1, 0);
        if (_0x530073.muted !== true && _0x219fc4 > 0) {
          _0x114a6d = _0x219fc4;
        }
        _0x38a0e2.set(_0x39d78d, {
          muted: _0x530073.muted === true,
          volume: _0x219fc4,
          lastAudibleVolume: _0x114a6d
        });
      };
      let _0x3f76df = null;
      const _0x184d7c = _0x11a9a6 => {
        const _0xefe872 = Math.max(0, Number(_0x11a9a6) || 0);
        const _0x3370e7 = Math.floor(_0xefe872 / 60);
        return _0x3370e7 + ":" + String(Math.floor(_0xefe872 % 60)).padStart(2, "0");
      };
      const _0x33ddc7 = createVideoPlayback({
        videoEl: _0x530073,
        sourceUrl: _0x4d82f9,
        ownerId: ["person-replacement", normalizeText(_0x38e2d5.id, "project"), normalizeText(_0x295995?.id, "shot"), _0x39d78d].join(":"),
        allowConcurrentPlayback: () => _0x51002a?.isEnabled?.() === true
      });
      const _0x3ec040 = () => {
        const _0x15cc8d = Number(_0x530073.duration);
        const _0x4e5f36 = Number(_0x530073.currentTime);
        const _0x28cf6f = Number.isFinite(_0x15cc8d) && _0x15cc8d > 0 ? _0x15cc8d : 0;
        const _0x32cdb7 = Number.isFinite(_0x4e5f36) && _0x4e5f36 > 0 ? Math.min(_0x4e5f36, _0x28cf6f || _0x4e5f36) : 0;
        return {
          duration: _0x28cf6f,
          currentTime: _0x32cdb7,
          ratio: _0x28cf6f > 0 ? clamp(_0x32cdb7 / _0x28cf6f, 0, 1, 0) : 0
        };
      };
      const _0x1621e9 = ({
        duration: _0x305626,
        currentTime: _0x394b52,
        ratio: _0x3d380f
      }) => {
        if (_0x418060) {
          _0x418060.textContent = _0x184d7c(_0x394b52);
        }
        if (_0x483bc4) {
          _0x483bc4.textContent = _0x184d7c(_0x305626);
        }
        if (_0x1a20f1?.style) {
          _0x1a20f1.style.width = _0x3d380f * 100 + "%";
        }
        _0x3c9691?.setAttribute?.("aria-valuenow", String(Math.round(_0x3d380f * 100)));
        _0x3c9691?.setAttribute?.("aria-valuetext", _0x184d7c(_0x394b52) + " / " + _0x184d7c(_0x305626));
      };
      const _0x266755 = () => {
        if (_0x284596) {
          return;
        }
        _0x31c6a1();
        const _0x3c3b53 = _0x530073.paused === false && _0x530073.ended !== true;
        _0x224280?.classList?.toggle?.("is-playing", _0x3c3b53);
        _0x224280?.setAttribute?.("aria-label", "" + (_0x3c3b53 ? "暂停" : "播放") + _0x2f64be);
        _0x224280?.removeAttribute?.("title");
        const _0x44feec = Math.round(clamp(_0x530073.muted ? 0 : Number(_0x530073.volume), 0, 1, 0) * 100);
        const _0xeaf13c = _0x530073.muted === true || _0x44feec === 0;
        if (_0x28d745) {
          _0x28d745.value = String(_0x44feec);
          _0x28d745.style?.setProperty?.("--story-video-volume-progress", _0x44feec + "%");
          _0x28d745.setAttribute?.("aria-valuetext", _0x44feec + "%");
        }
        _0xdd79b8?.classList?.toggle?.("is-muted", _0xeaf13c);
        _0xdd79b8?.setAttribute?.("aria-pressed", String(_0xeaf13c));
        _0xdd79b8?.setAttribute?.("aria-label", "" + (_0xeaf13c ? "恢复" : "静音") + _0x2f64be);
        if (_0x3f76df == null) {
          _0x1621e9(_0x3ec040());
        }
      };
      const _0x25ea2b = createWorkspaceVideoProgressLoop({
        videoEl: _0x530073,
        onFrame: () => {
          if (_0x3f76df == null) {
            _0x1621e9(_0x3ec040());
          }
        }
      });
      const _0x2bc44b = async _0x131be7 => {
        _0x131be7?.preventDefault?.();
        _0x131be7?.stopPropagation?.();
        if (_0x51002a?.isEnabled?.()) {
          await _0x51002a.togglePlayback({
            master: _0x39d78d
          });
          _0x266755();
          return;
        }
        if (_0x530073.paused === false) {
          _0x530073.pause?.();
          return;
        }
        if (_0x530073.ended) {
          _0x530073.currentTime = 0;
        }
        await _0x33ddc7.play();
        _0x266755();
      };
      const _0xc732ac = _0xd1ba9f => {
        const _0x2ec542 = Number(_0x530073.duration);
        const _0x471029 = _0x3c9691?.getBoundingClientRect?.();
        if (!(_0x2ec542 > 0) || !(Number(_0x471029?.width) > 0)) {
          return false;
        }
        const _0x51a622 = clamp((Number(_0xd1ba9f) - Number(_0x471029.left || 0)) / Number(_0x471029.width), 0, 1, 0);
        _0x530073.currentTime = _0x51a622 * _0x2ec542;
        _0x1621e9({
          duration: _0x2ec542,
          currentTime: _0x51a622 * _0x2ec542,
          ratio: _0x51a622
        });
        return true;
      };
      const _0xda07fe = () => {
        const _0x24361d = _0x3f76df;
        _0x3f76df = null;
        if (_0x24361d == null) {
          return;
        }
        try {
          _0x3c9691?.releasePointerCapture?.(_0x24361d);
        } catch {}
      };
      const _0x5af3ff = _0x527f2 => {
        _0x527f2.preventDefault?.();
        _0x527f2.stopPropagation?.();
        if (!_0xc732ac(_0x527f2.clientX)) {
          return;
        }
        _0x3f76df = _0x527f2.pointerId;
        try {
          _0x3c9691?.setPointerCapture?.(_0x527f2.pointerId);
        } catch {}
      };
      const _0x4d450d = _0x4553e4 => {
        if (_0x4553e4.pointerId !== _0x3f76df) {
          return;
        }
        _0x4553e4.preventDefault?.();
        _0x4553e4.stopPropagation?.();
        _0xc732ac(_0x4553e4.clientX);
      };
      const _0xea32cc = _0x769b10 => {
        if (_0x769b10.pointerId !== _0x3f76df) {
          return;
        }
        _0x769b10.preventDefault?.();
        _0x769b10.stopPropagation?.();
        _0xc732ac(_0x769b10.clientX);
        _0xda07fe();
        _0x266755();
      };
      const _0x5c8278 = _0x3475f4 => {
        if (_0x3475f4.pointerId !== _0x3f76df) {
          return;
        }
        _0x3475f4.preventDefault?.();
        _0x3475f4.stopPropagation?.();
        _0xda07fe();
        _0x266755();
      };
      const _0x284255 = _0x274a46 => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(_0x274a46.key)) {
          return;
        }
        const _0x96097c = Number(_0x530073.duration);
        if (!(_0x96097c > 0)) {
          return;
        }
        _0x274a46.preventDefault?.();
        _0x274a46.stopPropagation?.();
        if (_0x274a46.key === "Home") {
          _0x530073.currentTime = 0;
        } else if (_0x274a46.key === "End") {
          _0x530073.currentTime = _0x96097c;
        } else {
          const _0x4e35ba = _0x274a46.key === "ArrowLeft" ? -5 : 5;
          _0x530073.currentTime = clamp(_0x530073.currentTime + _0x4e35ba, 0, _0x96097c, 0);
        }
        _0x266755();
      };
      const _0xfd1bd0 = _0x13a83e => {
        _0x13a83e.stopPropagation?.();
        const _0x37f6d1 = clamp(Number(_0x13a83e.currentTarget?.value), 0, 100, 0);
        if (_0x37f6d1 > 0) {
          _0x114a6d = _0x37f6d1 / 100;
        }
        _0x530073.muted = false;
        _0x530073.volume = _0x37f6d1 / 100;
        _0x266755();
      };
      const _0x14f943 = _0x1b7764 => {
        _0x1b7764?.preventDefault?.();
        _0x1b7764?.stopPropagation?.();
        const _0x2e464d = clamp(Number(_0x530073.volume), 0, 1, 0);
        if (_0x530073.muted !== true && _0x2e464d > 0) {
          _0x114a6d = _0x2e464d;
          _0x530073.muted = true;
        } else {
          _0x530073.volume = _0x114a6d;
          _0x530073.muted = false;
        }
        _0x266755();
      };
      const _0x1218d1 = _0x59a91a => _0x59a91a.stopPropagation?.();
      const _0x5ea144 = ["play", "pause", "timeupdate", "loadedmetadata", "durationchange", "volumechange", "ended"];
      const _0x2e754c = _0x2f9c74 => {
        if (_0x2f9c74.type === "loadedmetadata") {
          syncPersonReplacementVideoStageFrame(_0x530073);
        }
        _0x266755();
        if (_0x2f9c74.type === "play") {
          _0x25ea2b.start();
        } else if (_0x2f9c74.type === "pause" || _0x2f9c74.type === "ended") {
          _0x25ea2b.stop();
        }
      };
      _0x224280?.addEventListener?.("click", _0x2bc44b);
      _0x530073.addEventListener?.("click", _0x2bc44b);
      _0x28d745?.addEventListener?.("input", _0xfd1bd0);
      _0xdd79b8?.addEventListener?.("click", _0x14f943);
      _0x3c9691?.addEventListener?.("pointerdown", _0x5af3ff);
      _0x3c9691?.addEventListener?.("pointermove", _0x4d450d);
      _0x3c9691?.addEventListener?.("pointerup", _0xea32cc);
      _0x3c9691?.addEventListener?.("pointercancel", _0x5c8278);
      _0x3c9691?.addEventListener?.("keydown", _0x284255);
      _0x42a6c4.addEventListener?.("pointerdown", _0x1218d1);
      _0x5ea144.forEach(_0xe2eacc => _0x530073.addEventListener?.(_0xe2eacc, _0x2e754c));
      syncPersonReplacementVideoStageFrame(_0x530073);
      _0x33ddc7.warm().then(_0x266755, _0x266755);
      _0x266755();
      _0x2e9af6.set(_0x39d78d, {
        videoEl: _0x530073,
        controlsEl: _0x42a6c4,
        play: () => _0x33ddc7.play(),
        pause: () => _0x530073.pause?.(),
        destroy() {
          _0x31c6a1();
          _0x284596 = true;
          _0x25ea2b.destroy();
          _0x33ddc7.destroy();
          _0xda07fe();
          _0x224280?.removeEventListener?.("click", _0x2bc44b);
          _0x530073.removeEventListener?.("click", _0x2bc44b);
          _0x28d745?.removeEventListener?.("input", _0xfd1bd0);
          _0xdd79b8?.removeEventListener?.("click", _0x14f943);
          _0x3c9691?.removeEventListener?.("pointerdown", _0x5af3ff);
          _0x3c9691?.removeEventListener?.("pointermove", _0x4d450d);
          _0x3c9691?.removeEventListener?.("pointerup", _0xea32cc);
          _0x3c9691?.removeEventListener?.("pointercancel", _0x5c8278);
          _0x3c9691?.removeEventListener?.("keydown", _0x284255);
          _0x42a6c4.removeEventListener?.("pointerdown", _0x1218d1);
          _0x5ea144.forEach(_0x9d4f01 => _0x530073.removeEventListener?.(_0x9d4f01, _0x2e754c));
        }
      });
    });
    _0x145a0d();
  };
  const _0x118c44 = () => {
    _0x446efc();
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 5) {
      return;
    }
    const _0xf04d79 = _0x318ed6?.querySelector?.("[data-person-replacement-composite-preview]");
    const _0x1c02f9 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-video=\"original\"]");
    const _0x2eca70 = _0x245430(_0x1c02f9);
    const _0x3c085a = _0x2eca70?.videoEl || _0x1c02f9;
    const _0x181478 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-video=\"replacement\"]");
    const _0x5d5417 = _0x29b2e5(_0x181478);
    const _0x294391 = _0x5d5417?.videoEl || _0x181478;
    const _0x486cd5 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-original-audio]");
    const _0x15a107 = normalizeText(_0x486cd5?.dataset?.personReplacementCompareOriginalAudioUrl);
    const _0x3dc52f = _0x318ed6?.querySelector?.("[data-person-replacement-compare-replacement-audio]");
    const _0x29e68c = normalizeText(_0x3dc52f?.dataset?.personReplacementCompareReplacementAudioUrl);
    const _0x3ab5ea = Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-compare-playback], [data-person-replacement-compare-playback-control]") || []);
    const _0x188577 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-progress]");
    const _0x2a45c8 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-progress-fill]");
    const _0x35e067 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-current-time]");
    const _0x19bc09 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-total-time]");
    const _0x10fa77 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-volume]");
    const _0x12b082 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-volume-toggle]");
    const _0xe86c34 = [_0x3c085a, _0x294391].filter(Boolean);
    const _0x496320 = _0x294391 || _0x3c085a;
    if (!_0xf04d79 || !_0x496320 || !_0xe86c34.length) {
      return;
    }
    const _0x20f97b = buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5);
    const _0x173b6e = _0x20f97b.selectedShot;
    const _0x5dd72d = _0x20f97b.previewMode === "full";
    const _0x5801ef = _0x5dd72d ? _0x20f97b.composedShots : [];
    const _0xd10628 = _0x5dd72d ? {
      id: "complete-video",
      startTimeSec: 0,
      durationSec: _0x5801ef.reduce((_0xad67b1, _0x76d435) => _0xad67b1 + a1155_0x122c5e(_0x76d435), 0)
    } : _0x173b6e;
    let _0x28da04 = false;
    const _0x35cb23 = new Map();
    _0xe86c34.forEach((_0x49a6b0, _0x5864fc) => {
      const _0x2770b0 = normalizeText(_0x49a6b0.dataset?.personReplacementCompareVideo) || (_0x49a6b0 === _0x294391 ? "replacement" : "original");
      const _0x1270ae = normalizeText(_0x49a6b0.dataset?.personReplacementCompareVideoUrl || _0x49a6b0.getAttribute?.("src") || _0x49a6b0.src);
      if (!_0x1270ae) {
        return;
      }
      const _0x55d6a3 = _0x49a6b0 === _0x2eca70?.videoEl ? _0x2eca70 : _0x49a6b0 === _0x5d5417?.videoEl ? _0x5d5417 : null;
      const _0x5474a0 = _0x55d6a3?.controller || createVideoPlayback({
        videoEl: _0x49a6b0,
        sourceUrl: _0x1270ae,
        ownerId: ["person-replacement", normalizeText(_0x38e2d5.id) || "project", normalizeText(_0xd10628?.id) || String(_0x5864fc), "composite", _0x2770b0].join(":"),
        allowConcurrentPlayback: true,
        preferStreamingSource: false,
        ...(_0x5dd72d ? {
          acquirePlaybackOptions: {
            bypassConcurrencyLimit: true,
            maxBytes: PERSON_REPLACEMENT_COMPOSITE_PREWARM_MAX_BYTES,
            timeout: PERSON_REPLACEMENT_COMPOSITE_PREWARM_TIMEOUT_MS
          }
        } : {})
      });
      _0x35cb23.set(_0x49a6b0, _0x5474a0);
      Promise.resolve(_0x5474a0.warm?.()).catch(() => false);
    });
    const _0x3666ca = _0x3dc52f && _0x29e68c ? attachMediaElementPlaybackSource(_0x3dc52f, _0x29e68c, {
      preload: "auto",
      shouldAssign: () => !_0x28da04 && _0x3dc52f.isConnected !== false
    }).catch(() => "") : Promise.resolve("");
    const _0xe2d3bf = _0x486cd5 && _0x15a107 ? attachMediaElementPlaybackSource(_0x486cd5, _0x15a107, {
      preload: "auto",
      shouldAssign: () => !_0x28da04 && _0x486cd5.isConnected !== false
    }).catch(() => "") : Promise.resolve("");
    const _0x251a6c = Math.max(0, Number(_0xd10628?.startTimeSec) || 0);
    let _0x3b03e5 = 0;
    let _0xe1c11c = 0;
    let _0x54b2b5 = null;
    let _0x395a97 = 0;
    let _0xdd9d02 = false;
    let _0x390a75 = clamp(Number(_0x3dc52f?.volume ?? _0x294391?.volume ?? _0x3c085a?.volume), 0, 1, 1);
    let _0x4aec5e = _0x390a75 || 1;
    const _0x5bca71 = () => {
      const _0x5d39ee = Number(_0x496320.duration);
      if (Number.isFinite(_0x5d39ee) && _0x5d39ee > 0) {
        return _0x5d39ee;
      }
      return Math.max(0, Number(_0xd10628?.durationSec) || 0);
    };
    const _0x364acf = () => {
      const _0x5b925c = Number(_0x496320.currentTime);
      if (Number.isFinite(_0x5b925c) && _0x5b925c > 0) {
        return _0x5b925c;
      } else {
        return 0;
      }
    };
    const _0x44d75b = _0x51667f => {
      const _0x2b8a5b = Math.max(0, Number(_0x51667f) || 0);
      const _0x165ecf = Math.floor(_0x2b8a5b / 60);
      return _0x165ecf + ":" + String(Math.floor(_0x2b8a5b % 60)).padStart(2, "0");
    };
    const _0x1b8205 = () => {
      const _0x570c32 = _0x5bca71();
      const _0x513d35 = Math.min(_0x364acf(), _0x570c32 || _0x364acf());
      const _0x3fb10a = _0x570c32 > 0 ? clamp(_0x513d35 / _0x570c32, 0, 1, 0) : 0;
      if (_0x2a45c8?.style) {
        _0x2a45c8.style.width = _0x3fb10a * 100 + "%";
      }
      _0x188577?.setAttribute?.("aria-valuenow", String(Math.round(_0x3fb10a * 100)));
      _0x188577?.setAttribute?.("aria-valuetext", _0x44d75b(_0x513d35) + " / " + _0x44d75b(_0x570c32));
      if (_0x35e067) {
        _0x35e067.textContent = _0x44d75b(_0x513d35);
      }
      if (_0x19bc09) {
        _0x19bc09.textContent = _0x44d75b(_0x570c32);
      }
    };
    const _0x2d0a3d = () => {
      if (!_0x10fa77) {
        return;
      }
      const _0x581c97 = Math.round(_0x390a75 * 100);
      _0x10fa77.value = String(_0x581c97);
      _0x10fa77.style?.setProperty?.("--story-video-volume-progress", _0x581c97 + "%");
      _0x10fa77.setAttribute?.("aria-valuetext", _0x581c97 + "%");
      const _0x554888 = _0x581c97 === 0;
      _0x12b082?.classList?.toggle?.("is-muted", _0x554888);
      _0x12b082?.setAttribute?.("aria-pressed", String(_0x554888));
      _0x12b082?.setAttribute?.("aria-label", (_0x554888 ? "恢复" : "静音") + "原视频和替换视频");
    };
    const _0x412db0 = _0x37ce08 => {
      const _0x3f9c06 = _0x251a6c + Math.max(0, Number(_0x37ce08) || 0);
      const _0x17b104 = Number(_0x3dc52f?.duration);
      if (Number.isFinite(_0x17b104) && _0x17b104 > 0) {
        return Math.min(_0x3f9c06, Math.max(0, _0x17b104 - 0.04));
      } else {
        return _0x3f9c06;
      }
    };
    const _0x3440f4 = ({
      force = false
    } = {}) => {
      const _0x5ee4be = _0x364acf();
      _0xe86c34.forEach(_0x1229b7 => {
        if (_0x1229b7 === _0x496320) {
          return;
        }
        const _0x375200 = Math.abs((Number(_0x1229b7.currentTime) || 0) - _0x5ee4be);
        if (force || _0x375200 > 0.1) {
          try {
            _0x1229b7.currentTime = _0x5ee4be;
          } catch {}
        }
      });
      if (_0x3dc52f) {
        const _0x25ccbb = _0x412db0(_0x5ee4be);
        const _0xec7bf = Math.abs((Number(_0x3dc52f.currentTime) || 0) - _0x25ccbb);
        if (force || _0xec7bf > 0.12) {
          try {
            _0x3dc52f.currentTime = _0x25ccbb;
          } catch {}
        }
      }
      if (_0x486cd5) {
        const _0x1f5837 = Math.abs((Number(_0x486cd5.currentTime) || 0) - _0x5ee4be);
        if (force || _0x1f5837 > 0.12) {
          try {
            _0x486cd5.currentTime = _0x5ee4be;
          } catch {}
        }
      }
    };
    const _0x4637fe = (_0x4893e4 = _0x38e2d5.audio.previewTrack) => {
      const _0x30fd95 = _0x4893e4 === "original" ? "original" : "replacement";
      if (_0x3c085a) {
        _0x3c085a.muted = _0x30fd95 !== "original" || Boolean(_0x486cd5);
      }
      if (_0x294391) {
        _0x294391.muted = _0x30fd95 !== "replacement" || Boolean(_0x3dc52f);
      }
      if (_0x486cd5) {
        _0x486cd5.muted = _0x30fd95 !== "original";
      }
      if (_0x3dc52f) {
        _0x3dc52f.muted = _0x30fd95 !== "replacement";
      }
      _0xf04d79.dataset.previewTrack = _0x30fd95;
    };
    const _0x59e469 = () => _0x496320.paused === false && _0x496320.ended !== true;
    const _0x3400ef = _0x4bb7b6 => _0x4bb7b6?.paused === false && _0x4bb7b6?.ended !== true;
    const _0x3d1c91 = () => {
      const _0x268964 = _0x59e469();
      const _0x55d535 = _0xdd9d02 && !_0x268964;
      _0xf04d79.classList?.toggle?.("is-comparison-playing", _0x268964);
      _0xf04d79.classList?.toggle?.("is-comparison-loading", _0x55d535);
      _0x3ab5ea.forEach(_0x221a05 => {
        _0x221a05.classList?.toggle?.("is-playing", _0x268964);
        _0x221a05.classList?.toggle?.("is-loading", _0x55d535);
        _0x221a05.setAttribute?.("aria-pressed", String(_0x268964));
        _0x221a05.setAttribute?.("aria-busy", String(_0x55d535));
        _0x221a05.setAttribute?.("aria-label", _0x55d535 ? "取消同步播放加载" : _0x268964 ? "暂停原视频和替换视频" : "播放原视频和替换视频");
      });
      if (_0x54b2b5 == null) {
        _0x1b8205();
      }
      _0x2d0a3d();
    };
    const _0x1ee1eb = () => {
      if (_0x3b03e5) {
        windowObject?.cancelAnimationFrame?.(_0x3b03e5);
        _0x3b03e5 = 0;
      }
      if (_0xe1c11c) {
        windowObject?.clearTimeout?.(_0xe1c11c);
        _0xe1c11c = 0;
      }
    };
    const _0x31472f = () => {
      _0x1ee1eb();
      if (_0x28da04 || !_0x59e469()) {
        return;
      }
      const _0x1ded09 = () => {
        _0x3b03e5 = 0;
        _0xe1c11c = 0;
        if (_0x28da04 || !_0x59e469()) {
          return;
        }
        _0x3440f4();
        _0x1b8205();
        _0x31472f();
      };
      if (typeof windowObject?.requestAnimationFrame === "function") {
        _0x3b03e5 = windowObject.requestAnimationFrame(_0x1ded09);
      } else {
        _0xe1c11c = windowObject?.setTimeout?.(_0x1ded09, 32) || 0;
      }
    };
    const _0xf8182b = ({
      cancelPending = true
    } = {}) => {
      if (cancelPending) {
        _0x395a97 += 1;
      }
      _0xdd9d02 = false;
      _0xe86c34.forEach(_0x1b6f33 => _0x1b6f33.pause?.());
      _0x486cd5?.pause?.();
      _0x3dc52f?.pause?.();
      _0x1ee1eb();
      _0x3d1c91();
    };
    const _0x441ecc = async () => {
      const _0x1b52f2 = _0x395a97 + 1;
      _0x395a97 = _0x1b52f2;
      _0xdd9d02 = true;
      _0x3d1c91();
      const _0x26c2a1 = _0x5bca71();
      if (_0x496320.ended || _0x26c2a1 > 0 && _0x364acf() >= _0x26c2a1 - 0.04) {
        _0x496320.currentTime = 0;
      }
      _0x3440f4({
        force: true
      });
      _0x4637fe();
      const _0x35eb31 = [..._0xe86c34];
      const _0x4c6fdc = _0x38e2d5.audio.previewTrack === "original" ? _0x486cd5 : _0x3dc52f;
      const _0xabdd3c = _0x38e2d5.audio.previewTrack === "original" ? _0xe2d3bf : _0x3666ca;
      if (_0x4c6fdc) {
        _0x35eb31.push(_0x4c6fdc);
      }
      if (_0x4c6fdc !== _0x486cd5) {
        _0x486cd5?.pause?.();
      }
      if (_0x4c6fdc !== _0x3dc52f) {
        _0x3dc52f?.pause?.();
      }
      const _0x2c8691 = Promise.allSettled(_0xe86c34.map(_0x10635b => {
        const _0x3cd6d6 = _0x35cb23.get(_0x10635b);
        try {
          return _0x3cd6d6?.play?.() ?? _0x10635b.play?.();
        } catch (_0x1a43c1) {
          return Promise.reject(_0x1a43c1);
        }
      }));
      if (_0x4c6fdc && _0x35eb31.includes(_0x4c6fdc)) {
        _0xabdd3c.then(_0x28be95 => {
          if (!_0x28be95) {
            throw new Error("Selected audio source unavailable");
          }
          if (_0x28da04 || _0x1b52f2 !== _0x395a97) {
            return false;
          }
          return _0x4c6fdc.play?.();
        }).then(() => {
          if (_0x28da04 || _0x1b52f2 !== _0x395a97) {
            _0x4c6fdc.pause?.();
            return;
          }
          _0x3440f4({
            force: true
          });
        }).catch(() => {
          if (_0x28da04 || _0x1b52f2 !== _0x395a97) {
            return;
          }
          _0x4c6fdc.pause?.();
          const _0x1d3cce = _0x38e2d5.audio.previewTrack === "original" ? _0x3c085a : _0x294391;
          if (_0x1d3cce) {
            _0x1d3cce.muted = false;
          }
          _0x2d0a3d();
        });
      }
      const _0x43370f = await _0x2c8691;
      if (_0x28da04 || _0x1b52f2 !== _0x395a97) {
        _0x35eb31.forEach(_0x615617 => _0x615617.pause?.());
        return false;
      }
      _0xdd9d02 = false;
      const _0x5beecb = _0x43370f.some(_0x4a9cce => _0x4a9cce.status === "rejected" || _0x4a9cce.value === false) || !_0xe86c34.every(_0x3400ef);
      if (_0x5beecb) {
        _0xf8182b({
          cancelPending: false
        });
        windowObject?.showToast?.("同步播放失败，请确认视频文件仍然可用。", "warn");
        return false;
      }
      _0x3440f4({
        force: true
      });
      _0x3d1c91();
      _0x31472f();
      return true;
    };
    const _0x950b63 = () => {
      if (_0x59e469() || _0xdd9d02) {
        _0xf8182b();
        return false;
      }
      _0x441ecc();
      return true;
    };
    const _0x492408 = _0x3aebfe => {
      const _0x1cf90c = _0x5bca71();
      if (!(_0x1cf90c > 0)) {
        return false;
      }
      const _0x5bad26 = clamp(Number(_0x3aebfe), 0, 1, 0);
      _0x496320.currentTime = _0x5bad26 * _0x1cf90c;
      _0x3440f4({
        force: true
      });
      _0x1b8205();
      return true;
    };
    const _0x25ed91 = _0x4aa90b => {
      const _0x5c5218 = _0x188577?.getBoundingClientRect?.();
      if (!(Number(_0x5c5218?.width) > 0)) {
        return false;
      }
      return _0x492408((Number(_0x4aa90b) - Number(_0x5c5218.left || 0)) / Number(_0x5c5218.width));
    };
    const _0x5ca401 = () => {
      const _0x2cd00a = _0x54b2b5;
      _0x54b2b5 = null;
      if (_0x2cd00a == null) {
        return;
      }
      try {
        _0x188577?.releasePointerCapture?.(_0x2cd00a);
      } catch {}
    };
    const _0x44e07e = _0x97267f => {
      _0x97267f.preventDefault?.();
      _0x97267f.stopPropagation?.();
      if (!_0x25ed91(_0x97267f.clientX)) {
        return;
      }
      _0x54b2b5 = _0x97267f.pointerId;
      try {
        _0x188577?.setPointerCapture?.(_0x97267f.pointerId);
      } catch {}
    };
    const _0x53b352 = _0x569e86 => {
      if (_0x569e86.pointerId !== _0x54b2b5) {
        return;
      }
      _0x569e86.preventDefault?.();
      _0x569e86.stopPropagation?.();
      _0x25ed91(_0x569e86.clientX);
    };
    const _0x42c5e2 = _0x2c07a8 => {
      if (_0x2c07a8.pointerId !== _0x54b2b5) {
        return;
      }
      _0x2c07a8.preventDefault?.();
      _0x2c07a8.stopPropagation?.();
      _0x25ed91(_0x2c07a8.clientX);
      _0x5ca401();
      _0x3d1c91();
    };
    const _0x3a8a41 = _0x4cc7ff => {
      if (_0x4cc7ff.pointerId !== _0x54b2b5) {
        return;
      }
      _0x4cc7ff.preventDefault?.();
      _0x4cc7ff.stopPropagation?.();
      _0x5ca401();
      _0x3d1c91();
    };
    const _0xfa0de8 = _0x3e5347 => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(_0x3e5347.key)) {
        return;
      }
      const _0x1be477 = _0x5bca71();
      if (!(_0x1be477 > 0)) {
        return;
      }
      _0x3e5347.preventDefault?.();
      _0x3e5347.stopPropagation?.();
      if (_0x3e5347.key === "Home") {
        _0x492408(0);
      } else if (_0x3e5347.key === "End") {
        _0x492408(1);
      } else {
        const _0x53c29d = _0x3e5347.key === "ArrowLeft" ? -5 : 5;
        _0x492408((_0x364acf() + _0x53c29d) / _0x1be477);
      }
      _0x3d1c91();
    };
    const _0x2eae5d = _0x2a5d3e => {
      _0x2a5d3e.stopPropagation?.();
      _0x390a75 = clamp(Number(_0x2a5d3e.currentTarget?.value) / 100, 0, 1, _0x390a75);
      if (_0x390a75 > 0) {
        _0x4aec5e = _0x390a75;
      }
      [..._0xe86c34, _0x486cd5, _0x3dc52f].filter(Boolean).forEach(_0x11116f => {
        _0x11116f.volume = _0x390a75;
      });
      _0x2d0a3d();
    };
    const _0x1c4953 = _0xd6b964 => {
      _0xd6b964?.preventDefault?.();
      _0xd6b964?.stopPropagation?.();
      _0x390a75 = _0x390a75 > 0 ? 0 : _0x4aec5e;
      [..._0xe86c34, _0x486cd5, _0x3dc52f].filter(Boolean).forEach(_0x2527d7 => {
        _0x2527d7.volume = _0x390a75;
      });
      _0x2d0a3d();
    };
    const _0x5a4115 = _0x27f7c1 => {
      if (_0x27f7c1.type === "ended") {
        _0xf8182b();
        return;
      }
      _0x3d1c91();
      if (_0x27f7c1.type === "play" || _0x27f7c1.type === "playing") {
        _0x31472f();
      } else if (_0x27f7c1.type === "pause") {
        _0x1ee1eb();
      }
    };
    const _0x291ab5 = ["play", "playing", "pause", "ended", "loadedmetadata", "durationchange", "timeupdate", "seeked"];
    _0x188577?.addEventListener?.("pointerdown", _0x44e07e);
    _0x188577?.addEventListener?.("pointermove", _0x53b352);
    _0x188577?.addEventListener?.("pointerup", _0x42c5e2);
    _0x188577?.addEventListener?.("pointercancel", _0x3a8a41);
    _0x188577?.addEventListener?.("keydown", _0xfa0de8);
    _0x10fa77?.addEventListener?.("input", _0x2eae5d);
    _0x12b082?.addEventListener?.("click", _0x1c4953);
    _0x291ab5.forEach(_0x587972 => _0x496320.addEventListener?.(_0x587972, _0x5a4115));
    _0x4637fe();
    _0x1b8205();
    _0x3d1c91();
    const _0x3d57e7 = ({
      retainVideos = []
    } = {}) => {
      if (_0x28da04) {
        return new Map();
      }
      _0x28da04 = true;
      _0xf8182b();
      const _0x546d9c = new Map();
      (Array.isArray(retainVideos) ? retainVideos : []).forEach(_0x36f3ad => {
        const _0x678b86 = _0x35cb23.get(_0x36f3ad);
        if (!_0x678b86) {
          return;
        }
        _0x546d9c.set(_0x36f3ad, _0x678b86);
        _0x35cb23.delete(_0x36f3ad);
      });
      _0x35cb23.forEach(_0x3d5c00 => _0x3d5c00.destroy?.());
      _0x35cb23.clear();
      _0x5ca401();
      _0x188577?.removeEventListener?.("pointerdown", _0x44e07e);
      _0x188577?.removeEventListener?.("pointermove", _0x53b352);
      _0x188577?.removeEventListener?.("pointerup", _0x42c5e2);
      _0x188577?.removeEventListener?.("pointercancel", _0x3a8a41);
      _0x188577?.removeEventListener?.("keydown", _0xfa0de8);
      _0x10fa77?.removeEventListener?.("input", _0x2eae5d);
      _0x12b082?.removeEventListener?.("click", _0x1c4953);
      _0x291ab5.forEach(_0xa2a9bc => _0x496320.removeEventListener?.(_0xa2a9bc, _0x5a4115));
      [_0x486cd5, _0x3dc52f].filter(Boolean).forEach(_0x59be1f => {
        try {
          _0x59be1f.removeAttribute?.("src");
          clearDesktopMediaPlaybackSourceMetadata(_0x59be1f);
          _0x59be1f.preload = "none";
          _0x59be1f.load?.();
        } catch {}
      });
      return _0x546d9c;
    };
    _0x16fd8e = {
      togglePlayback: _0x950b63,
      setTrack(_0x313112) {
        _0x4637fe(_0x313112);
        _0x3440f4({
          force: true
        });
        const _0x11283f = _0x313112 === "original" ? _0x486cd5 : _0x3dc52f;
        const _0x3c2b6b = _0x313112 === "original" ? _0xe2d3bf : _0x3666ca;
        if (_0x11283f && _0x59e469()) {
          _0x3c2b6b.then(_0x5399a7 => {
            if (!_0x5399a7 || _0x28da04 || !_0x59e469()) {
              return false;
            }
            return _0x11283f.play?.();
          }).catch(() => {
            const _0x6a109d = _0x313112 === "original" ? _0x3c085a : _0x294391;
            if (!_0x28da04 && _0x6a109d) {
              _0x6a109d.muted = false;
            }
          });
        }
        if (_0x11283f !== _0x486cd5) {
          _0x486cd5?.pause?.();
        }
        if (_0x11283f !== _0x3dc52f) {
          _0x3dc52f?.pause?.();
        }
        _0x3d1c91();
      },
      warmOriginalPlayback(_0x4617d0 = "") {
        const _0x352f30 = normalizeText(_0x4617d0);
        const _0x464ee2 = normalizeText(_0x3c085a?.dataset?.personReplacementCompareVideoUrl);
        const _0x308a42 = _0x3c085a ? _0x35cb23.get(_0x3c085a) : null;
        if (_0x28da04 || !_0x308a42 || !_0x352f30 || _0x352f30 !== _0x464ee2) {
          return Promise.resolve(false);
        }
        try {
          return Promise.resolve(_0x308a42.play?.()).then(_0x5b7931 => {
            if (!_0x28da04) {
              _0x3c085a.pause?.();
            }
            return _0x5b7931 !== false;
          }, () => false);
        } catch {
          return Promise.resolve(false);
        }
      },
      retainOriginalPlayback(_0x4fe936 = "") {
        const _0xe0621f = normalizeText(_0x4fe936);
        const _0x46495d = normalizeText(_0x3c085a?.dataset?.personReplacementCompareVideoUrl);
        if (!_0x3c085a || !_0xe0621f || _0xe0621f !== _0x46495d) {
          return null;
        }
        const _0x562b4f = _0x3d57e7({
          retainVideos: [_0x3c085a]
        });
        const _0x1b164f = _0x562b4f.get(_0x3c085a);
        if (_0x1b164f) {
          return {
            sourceUrl: _0x46495d,
            videoEl: _0x3c085a,
            controller: _0x1b164f
          };
        } else {
          return null;
        }
      },
      retainFullPlaybacks(_0x33304b = {}) {
        const _0x1dd74b = [["original", _0x3c085a, normalizeText(_0x33304b.original)], ["replacement", _0x294391, normalizeText(_0x33304b.replacement)]].filter(([, _0x4d0dfe, _0x36cff9]) => _0x4d0dfe && _0x36cff9 && _0x36cff9 === normalizeText(_0x4d0dfe.dataset?.personReplacementCompareVideoUrl) && _0x35cb23.has(_0x4d0dfe));
        if (!_0x1dd74b.length) {
          return null;
        }
        const _0x313583 = _0x3d57e7({
          retainVideos: _0x1dd74b.map(([, _0x463c8]) => _0x463c8)
        });
        return _0x1dd74b.reduce((_0x329c32, [_0x419cbd, _0x2f61f1, _0x5cd5bd]) => {
          const _0x2067ae = _0x313583.get(_0x2f61f1);
          if (_0x2067ae) {
            _0x329c32[_0x419cbd] = {
              sourceUrl: _0x5cd5bd,
              videoEl: _0x2f61f1,
              controller: _0x2067ae
            };
          }
          return _0x329c32;
        }, {});
      },
      destroy() {
        _0x3d57e7();
      }
    };
  };
  const _0x3bc912 = _0x3fcd28 => {
    const _0x4eb6b9 = _0x3fcd28 === "original" ? "original" : "replacement";
    if (_0x4eb6b9 === "replacement") {
      const _0x432575 = buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5).media;
      if (!_0x432575.replacementAudioRef) {
        windowObject?.showToast?.("请返回「声音克隆」，先生成语音并点击「合成」，完成后再选择替换音轨。", "warn");
        return cloneJson(_0x38e2d5);
      }
    }
    if (_0x4eb6b9 === _0x38e2d5.audio.previewTrack && _0x4eb6b9 === _0x38e2d5.audio.exportTrack) {
      _0x16fd8e?.setTrack?.(_0x4eb6b9);
      return cloneJson(_0x38e2d5);
    }
    _0x38e2d5 = a1155_0x56b8cf(transitionPersonReplacementOutput({
      ..._0x38e2d5,
      audio: {
        ..._0x38e2d5.audio,
        previewTrack: _0x4eb6b9,
        exportTrack: _0x4eb6b9
      }
    }, {
      type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.FINAL_MUX_INVALIDATE
    }));
    _0x318ed6?.querySelectorAll?.("[data-person-replacement-action=\"set-preview-track\"]")?.forEach?.(_0x5d09e2 => {
      const _0x1ee8b3 = _0x5d09e2.dataset?.previewTrack === _0x4eb6b9;
      _0x5d09e2.classList?.toggle?.("is-selected", _0x1ee8b3);
      _0x5d09e2.setAttribute?.("aria-pressed", String(_0x1ee8b3));
    });
    _0x16fd8e?.setTrack?.(_0x4eb6b9);
    _0x575f0c("preview-track");
    return cloneJson(_0x38e2d5);
  };
  const _0xd6f0d = (_0x11c131 = "") => {
    const _0x4b2858 = _0x38e2d5.shots.find(_0x83b3c4 => _0x83b3c4.id === normalizeText(_0x11c131 || _0x38e2d5.workspace.selectedShotId));
    const _0x412c2c = _0x318ed6?.querySelector?.("[data-person-replacement-video-stage]");
    const _0x18e9cd = _0x412c2c?.querySelector?.("[data-person-replacement-video-player]");
    const _0x2d629c = normalizeText(_0x4b2858?.videoRef);
    const _0x8d8139 = normalizeMediaUrl(_0x2d629c);
    if (!_0x4b2858 || !_0x412c2c || !_0x18e9cd || !_0x8d8139) {
      windowObject?.showToast?.("当前视频片段尚未准备完成。", "warn");
      return false;
    }
    if (isPersonReplacementVideoCropReverseRunning(_0x4b2858)) {
      windowObject?.showToast?.("当前视频片段正在处理倒放，请稍后再裁剪。", "info");
      return false;
    }
    _0x18e9cd.pause?.();
    const _0x298747 = Number(_0x18e9cd.duration) > 0 ? Number(_0x18e9cd.duration) : Math.max(0, Number(_0x4b2858.durationSec) || 0);
    const _0x1c97be = videoClipController?.initForSource?.(createPersonReplacementVideoCropOptions({
      projectId: _0x38e2d5.id,
      selectedShot: _0x4b2858,
      stage: _0x412c2c,
      videoEl: _0x18e9cd,
      durationSec: _0x298747,
      getProject: () => _0x38e2d5,
      acceptProject: _0x435aca => {
        const _0x452ec2 = a1155_0x56b8cf(_0x435aca);
        if (normalizeText(_0x452ec2.id) === normalizeText(_0x38e2d5.id)) {
          _0x38e2d5 = _0x452ec2;
        }
        return _0x38e2d5;
      },
      requestReverseChange: _0x237995,
      onConfirm: _0x3c8b79 => {
        _0x473164 = false;
        _0x1ef913(applyPersonReplacementVideoCrop(_0x38e2d5, {
          ..._0x3c8b79,
          shotId: _0x4b2858.id
        }), "video-crop");
      },
      onExit: ({
        reason: _0x4b1502
      } = {}) => {
        _0x473164 = false;
        if (["confirm", "silent"].includes(_0x4b1502) || _0x362ce5) {
          return;
        }
        if (!_0x1ac515()) {
          _0x3be3ab();
        }
      }
    }));
    _0x473164 = _0x1c97be === true;
    return _0x473164;
  };
  const _0xafce7e = () => {
    _0x1f6895?.();
    _0x1f6895 = null;
  };
  const _0x5ad8cd = (_0x132e70, _0x5127a5) => {
    if (!_0x132e70 || !_0x5127a5) {
      return false;
    }
    if (_0x132e70.isPrimary === false || Number.isFinite(_0x132e70.button) && _0x132e70.button !== 0) {
      return false;
    }
    const _0x3d5708 = normalizeText(_0x5127a5.dataset?.personReplacementLayoutSplitter);
    if (!["left", "center", "right"].includes(_0x3d5708)) {
      return false;
    }
    const _0x54cb8f = _0x3d5708 === "center";
    const _0x2c5380 = _0x5127a5.closest?.(_0x54cb8f ? ".person-replacement-middle-layout" : "[data-person-replacement-layout]");
    const _0x47a6df = _0x5127a5.closest?.("[data-person-replacement-layout]");
    const _0x2a09e8 = _0x2c5380?.getBoundingClientRect?.();
    const _0x3956a1 = _0x54cb8f ? Number(_0x2a09e8?.height) : Number(_0x2a09e8?.width);
    if (!(_0x3956a1 > 0)) {
      return false;
    }
    _0x132e70.preventDefault?.();
    _0x132e70.stopPropagation?.();
    _0xafce7e();
    const _0x5f53a6 = _0x132e70.pointerId;
    try {
      _0x5127a5.setPointerCapture?.(_0x5f53a6);
    } catch {}
    _0x5127a5.classList?.add?.("is-active");
    documentObject?.body?.classList?.add?.("person-replacement-layout-resizing");
    const _0x19032b = _0x4daa45 => !Number.isFinite(Number(_0x5f53a6)) || !Number.isFinite(Number(_0x4daa45?.pointerId)) || Number(_0x4daa45.pointerId) === Number(_0x5f53a6);
    let _0x27e9ed = null;
    let _0x24f80d = 0;
    const _0x2a871b = _0x42620a => {
      if (!_0x42620a) {
        return;
      }
      const _0x52e92b = _0x54cb8f ? _0x42620a.clientY : _0x42620a.clientX;
      const _0x5a2fa7 = _0x54cb8f ? _0x2a09e8.top : _0x2a09e8.left;
      const _0x370ec3 = (Number(_0x52e92b) - Number(_0x5a2fa7 || 0)) / _0x3956a1 * 100;
      const _0x461be3 = Math.round((_0x3d5708 === "right" ? 100 - _0x370ec3 : _0x370ec3) * 100) / 100;
      const _0x131506 = _0x38e2d5.workspace.replacementLayout;
      const _0xc34fd1 = normalizePersonReplacementLayout({
        ..._0x131506,
        ...(_0x3d5708 === "center" ? {
          centerTop: _0x461be3
        } : {
          [_0x3d5708]: _0x461be3
        })
      });
      _0x38e2d5.workspace.replacementLayout = _0xc34fd1;
      if (_0x3d5708 === "center") {
        _0x47a6df?.style?.setProperty?.("--person-replacement-center-top", _0xc34fd1.centerTop + "%");
      } else {
        _0x2c5380.style?.setProperty?.("--person-replacement-" + _0x3d5708 + "-width", _0xc34fd1[_0x3d5708] + "%");
      }
      _0x5127a5.setAttribute?.("aria-valuenow", String(Math.round(_0xc34fd1[_0x3d5708 === "center" ? "centerTop" : _0x3d5708])));
    };
    const _0x4a50ad = () => {
      _0x24f80d = 0;
      const _0x3120cc = _0x27e9ed;
      _0x27e9ed = null;
      _0x2a871b(_0x3120cc);
    };
    const _0x4c3356 = _0x2900af => {
      if (!_0x19032b(_0x2900af)) {
        return;
      }
      _0x27e9ed = {
        clientX: _0x2900af?.clientX,
        clientY: _0x2900af?.clientY
      };
      if (_0x24f80d) {
        return;
      }
      const _0x631c1d = windowObject?.requestAnimationFrame;
      if (typeof _0x631c1d === "function") {
        _0x24f80d = _0x631c1d.call(windowObject, _0x4a50ad);
        return;
      }
      _0x4a50ad();
    };
    const _0x1b59c6 = _0x587e10 => {
      if (!_0x19032b(_0x587e10)) {
        return;
      }
      const _0x239831 = _0x54cb8f ? Number(_0x587e10?.clientY) : Number(_0x587e10?.clientX);
      if (Number.isFinite(_0x239831)) {
        _0x27e9ed = {
          clientX: _0x587e10?.clientX,
          clientY: _0x587e10?.clientY
        };
      }
      if (_0x24f80d && typeof windowObject?.cancelAnimationFrame === "function") {
        windowObject.cancelAnimationFrame(_0x24f80d);
      }
      _0x4a50ad();
      _0xafce7e();
      _0x38e2d5 = a1155_0x56b8cf(_0x38e2d5);
      _0x575f0c("replacement-layout");
    };
    const _0x954492 = () => {
      if (_0x24f80d && typeof windowObject?.cancelAnimationFrame === "function") {
        windowObject.cancelAnimationFrame(_0x24f80d);
      }
      _0x24f80d = 0;
      _0x27e9ed = null;
      _0x5127a5.classList?.remove?.("is-active");
      documentObject?.body?.classList?.remove?.("person-replacement-layout-resizing");
      try {
        _0x5127a5.releasePointerCapture?.(_0x5f53a6);
      } catch {}
      windowObject?.removeEventListener?.("pointermove", _0x4c3356, true);
      windowObject?.removeEventListener?.("pointerup", _0x1b59c6, true);
      windowObject?.removeEventListener?.("pointercancel", _0x1b59c6, true);
      if (_0x1f6895 === _0x954492) {
        _0x1f6895 = null;
      }
    };
    _0x1f6895 = _0x954492;
    windowObject?.addEventListener?.("pointermove", _0x4c3356, true);
    windowObject?.addEventListener?.("pointerup", _0x1b59c6, true);
    windowObject?.addEventListener?.("pointercancel", _0x1b59c6, true);
    _0x4c3356(_0x132e70);
    return true;
  };
  const _0x429763 = (_0x33f519, _0x454700) => {
    const _0xd92c8c = _0x454700?.getBoundingClientRect?.();
    const _0x181e69 = Math.max(1, Number(_0xd92c8c?.width) || Number(_0x454700?.clientWidth) || 1);
    const _0x380ea1 = Math.max(1, Number(_0xd92c8c?.height) || Number(_0x454700?.clientHeight) || 1);
    return {
      x: clamp((Number(_0x33f519?.clientX) - Number(_0xd92c8c?.left || 0)) / _0x181e69, 0, 1, 0),
      y: clamp((Number(_0x33f519?.clientY) - Number(_0xd92c8c?.top || 0)) / _0x380ea1, 0, 1, 0)
    };
  };
  const _0x5b850e = (_0x30fee9, _0x29275e) => {
    _0x30fee9?.style?.setProperty?.("--box-x", _0x29275e.x * 100 + "%");
    _0x30fee9?.style?.setProperty?.("--box-y", _0x29275e.y * 100 + "%");
    _0x30fee9?.style?.setProperty?.("--box-width", _0x29275e.width * 100 + "%");
    _0x30fee9?.style?.setProperty?.("--box-height", _0x29275e.height * 100 + "%");
  };
  const _0x5e89ff = () => {
    _0x51aaf9 = "";
    _0x26dcb0 = "";
    _0x318ed6?.querySelectorAll?.(".person-replacement-detection-box.is-keyboard-selected")?.forEach?.(_0x1c1cd8 => {
      _0x1c1cd8.classList?.remove?.("is-keyboard-selected");
    });
  };
  const _0x3a3cb8 = (_0x56c49d, {
    focus = true
  } = {}) => {
    const _0x469d1b = normalizeText(_0x56c49d?.dataset?.shotId || _0x38e2d5.workspace.selectedShotId);
    const _0x62b14e = normalizeText(_0x56c49d?.dataset?.personId);
    if (!_0x469d1b || !_0x62b14e) {
      return false;
    }
    _0x51aaf9 = _0x469d1b;
    _0x26dcb0 = _0x62b14e;
    _0x318ed6?.querySelectorAll?.(".person-replacement-detection-box.is-keyboard-selected")?.forEach?.(_0x13ba45 => {
      if (_0x13ba45 === _0x56c49d) {
        return;
      }
      _0x13ba45.classList?.remove?.("is-keyboard-selected");
    });
    _0x56c49d.classList?.add?.("is-keyboard-selected");
    if (focus) {
      try {
        _0x56c49d.focus?.({
          preventScroll: true
        });
      } catch {
        _0x56c49d.focus?.();
      }
    }
    return true;
  };
  const _0x58390e = _0xb11a33 => {
    const _0x3b5907 = _0x49248e;
    if (!_0x3b5907) {
      return null;
    }
    const _0x34a73c = Number(_0xb11a33?.clientX);
    const _0x395d00 = Number(_0xb11a33?.clientY);
    const _0x50246a = Number.isFinite(_0x34a73c) && Number.isFinite(_0x395d00) ? Math.hypot(_0x34a73c - _0x3b5907.startClientX, _0x395d00 - _0x3b5907.startClientY) : 0;
    if (!_0x3b5907.hasDragged && _0x50246a < PERSON_REPLACEMENT_MANUAL_SELECTION_DRAG_THRESHOLD_PX) {
      return _0x3b5907.items.map(_0x5d2e4e => _0x5d2e4e.originalBox);
    }
    _0x3b5907.hasDragged = true;
    const _0x5e0f5c = _0x429763(_0xb11a33, _0x3b5907.stage);
    const _0x405a68 = {
      x: _0x5e0f5c.x - _0x3b5907.start.x,
      y: _0x5e0f5c.y - _0x3b5907.start.y
    };
    const _0x9f6f57 = _0x3b5907.isBatchMove ? clampRectGroupTranslation(_0x3b5907.items.map(_0x115691 => _0x115691.originalBox), _0x405a68.x, _0x405a68.y) : _0x405a68;
    _0x3b5907.items.forEach(_0x7518cf => {
      _0x7518cf.currentBox = normalizePersonReplacementManualBoxEdit(_0x7518cf.originalBox, _0x9f6f57, _0x3b5907.mode);
      _0x5b850e(_0x7518cf.element, _0x7518cf.currentBox);
    });
    return _0x3b5907.items.map(_0xfa7e07 => _0xfa7e07.currentBox);
  };
  const _0x2bcbe9 = (_0x289168, {
    cancelled = false
  } = {}) => {
    const _0xa20204 = _0x49248e;
    if (!_0xa20204) {
      return false;
    }
    if (!cancelled && _0x289168) {
      _0x58390e(_0x289168);
    }
    _0x49248e = null;
    _0xa20204.cleanup?.();
    if (cancelled) {
      _0xa20204.items.forEach(_0x3daf8f => {
        _0x5b850e(_0x3daf8f.element, _0x3daf8f.originalBox);
      });
      return true;
    }
    if (!_0xa20204.hasDragged) {
      return true;
    }
    _0x443f39(onUpdatePeopleRequested, {
      shotId: _0xa20204.shotId,
      updates: _0xa20204.items.map(_0x4cff3b => ({
        personId: _0x4cff3b.personId,
        bbox: _0x4cff3b.currentBox
      }))
    });
    if (_0xa20204.isBatchMove) {
      _0x3d7690();
    }
    return true;
  };
  const _0x450954 = (_0x37f472, _0x318c21, {
    batch = false
  } = {}) => {
    if (_0x49248e || Number(_0x37f472?.button) > 0 || !_0x318c21) {
      return false;
    }
    const _0x1c0360 = normalizeText(_0x318c21.dataset?.shotId || _0x38e2d5.workspace.selectedShotId);
    const _0x37fe1e = normalizeText(_0x318c21.dataset?.personId);
    const _0x448dfc = _0x38e2d5.shots.find(_0x397d28 => _0x397d28.id === _0x1c0360);
    const _0x522986 = _0x448dfc?.people?.find(_0x158b31 => _0x158b31.id === _0x37fe1e);
    const _0x29c60e = _0x522986?.locator?.bbox || _0x522986?.bbox;
    const _0x2d0488 = _0x318c21.closest?.("[data-person-replacement-keyframe-stage]");
    const _0x5636a0 = batch && _0x50fd35.has(_0x3ba1fe(_0x318c21));
    if (!_0x2d0488 || !_0x29c60e) {
      return false;
    }
    if (!_0x5636a0) {
      _0x3a3cb8(_0x318c21);
    }
    const _0x51103e = _0x429763(_0x37f472, _0x2d0488);
    const _0x27b870 = _0x5636a0 ? "move" : normalizeText(_0x37f472.target?.closest?.("[data-person-replacement-manual-resize]")?.dataset?.personReplacementManualResize, "move");
    const _0x5e3310 = _0x5636a0 ? Array.from(_0x2d0488.querySelectorAll?.(".person-replacement-detection-box.is-batch-selected[data-person-id]") || []).map(_0x424436 => {
      const _0xbfcadb = normalizeText(_0x424436.dataset?.personId);
      const _0x20f124 = _0x448dfc?.people?.find(_0x3288cc => _0x3288cc.id === _0xbfcadb);
      const _0x33ab84 = _0x20f124?.locator?.bbox || _0x20f124?.bbox;
      if (_0x33ab84) {
        return {
          personId: _0xbfcadb,
          element: _0x424436,
          originalBox: {
            ..._0x33ab84
          },
          currentBox: {
            ..._0x33ab84
          }
        };
      } else {
        return null;
      }
    }).filter(Boolean) : [{
      personId: _0x37fe1e,
      element: _0x318c21,
      originalBox: {
        ..._0x29c60e
      },
      currentBox: {
        ..._0x29c60e
      }
    }];
    if (!_0x5e3310.length) {
      return false;
    }
    const _0x58349b = _0x4c9c84 => _0x58390e(_0x4c9c84);
    const _0x441d80 = _0x2ca7d9 => _0x2bcbe9(_0x2ca7d9);
    const _0x2c181a = () => _0x2bcbe9(null, {
      cancelled: true
    });
    windowObject?.addEventListener?.("pointermove", _0x58349b);
    windowObject?.addEventListener?.("pointerup", _0x441d80, {
      once: true
    });
    windowObject?.addEventListener?.("pointercancel", _0x2c181a, {
      once: true
    });
    _0x49248e = {
      shotId: _0x1c0360,
      stage: _0x2d0488,
      mode: _0x27b870,
      isBatchMove: _0x5636a0,
      start: _0x51103e,
      startClientX: Number.isFinite(Number(_0x37f472?.clientX)) ? Number(_0x37f472.clientX) : 0,
      startClientY: Number.isFinite(Number(_0x37f472?.clientY)) ? Number(_0x37f472.clientY) : 0,
      hasDragged: false,
      items: _0x5e3310,
      cleanup: () => {
        windowObject?.removeEventListener?.("pointermove", _0x58349b);
        windowObject?.removeEventListener?.("pointerup", _0x441d80);
        windowObject?.removeEventListener?.("pointercancel", _0x2c181a);
      }
    };
    _0x37f472.preventDefault?.();
    _0x37f472.stopPropagation?.();
    return true;
  };
  const _0x564526 = _0x8d5a1 => {
    const _0x145c69 = _0x3a640d;
    if (!_0x145c69?.preview) {
      return;
    }
    const _0x604be0 = normalizePersonReplacementManualSelection(_0x145c69.start, _0x8d5a1);
    if (!_0x604be0) {
      return;
    }
    _0x145c69.preview.style?.setProperty?.("--selection-x", _0x604be0.x * 100 + "%");
    _0x145c69.preview.style?.setProperty?.("--selection-y", _0x604be0.y * 100 + "%");
    _0x145c69.preview.style?.setProperty?.("--selection-width", _0x604be0.width * 100 + "%");
    _0x145c69.preview.style?.setProperty?.("--selection-height", _0x604be0.height * 100 + "%");
  };
  const _0xbf97d1 = (_0x1bad98, {
    cancelled = false
  } = {}) => {
    const _0x456efb = _0x3a640d;
    if (!_0x456efb) {
      return false;
    }
    _0x3a640d = null;
    _0x456efb.cleanup?.();
    _0x182068 = false;
    const _0x46625a = _0x1bad98 ? Math.hypot(Number(_0x1bad98.clientX) - _0x456efb.startClientX, Number(_0x1bad98.clientY) - _0x456efb.startClientY) : 0;
    const _0x20dfd8 = _0x456efb.hasDragged || _0x46625a >= PERSON_REPLACEMENT_MANUAL_SELECTION_DRAG_THRESHOLD_PX;
    if (!cancelled && !_0x20dfd8) {
      _0x3be3ab();
      return true;
    }
    const _0x5e7383 = _0x429763(_0x1bad98, _0x456efb.stage);
    const _0x32dbf2 = cancelled ? null : normalizePersonReplacementManualSelection(_0x456efb.start, _0x5e7383);
    if (_0x32dbf2) {
      _0x443f39(onManualPersonSelected, {
        shotId: _0x456efb.shotId,
        bbox: _0x32dbf2
      });
    } else if (!cancelled) {
      windowObject?.showToast?.("框选范围太小，请完整框住需要替换的主体。", "info");
    }
    _0x3be3ab();
    return true;
  };
  const _0x339350 = (_0x1d3a2f, _0x311d61) => {
    if (!_0x182068 || _0x3a640d || !_0x311d61) {
      return false;
    }
    const _0x322dc1 = _0x429763(_0x1d3a2f, _0x311d61);
    const _0x231ce6 = documentObject?.createElement?.("div") || null;
    if (_0x231ce6) {
      _0x231ce6.className = "person-replacement-manual-selection-preview";
      _0x311d61.appendChild?.(_0x231ce6);
    }
    const _0x1c7a8e = _0x448fc3 => {
      if (Math.hypot(Number(_0x448fc3.clientX) - Number(_0x1d3a2f.clientX), Number(_0x448fc3.clientY) - Number(_0x1d3a2f.clientY)) >= PERSON_REPLACEMENT_MANUAL_SELECTION_DRAG_THRESHOLD_PX) {
        if (_0x3a640d) {
          _0x3a640d.hasDragged = true;
        }
      }
      _0x564526(_0x429763(_0x448fc3, _0x311d61));
    };
    const _0x2f14e0 = _0x27cfcf => _0xbf97d1(_0x27cfcf);
    const _0x383ff7 = () => _0xbf97d1(_0x1d3a2f, {
      cancelled: true
    });
    windowObject?.addEventListener?.("pointermove", _0x1c7a8e);
    windowObject?.addEventListener?.("pointerup", _0x2f14e0, {
      once: true
    });
    windowObject?.addEventListener?.("pointercancel", _0x383ff7, {
      once: true
    });
    _0x3a640d = {
      shotId: normalizeText(_0x311d61.dataset?.shotId || _0x38e2d5.workspace.selectedShotId),
      stage: _0x311d61,
      start: _0x322dc1,
      startClientX: Number(_0x1d3a2f.clientX),
      startClientY: Number(_0x1d3a2f.clientY),
      hasDragged: false,
      preview: _0x231ce6,
      cleanup: () => {
        windowObject?.removeEventListener?.("pointermove", _0x1c7a8e);
        windowObject?.removeEventListener?.("pointerup", _0x2f14e0);
        windowObject?.removeEventListener?.("pointercancel", _0x383ff7);
        _0x231ce6?.remove?.();
      }
    };
    _0x564526(_0x322dc1);
    _0x1d3a2f.preventDefault?.();
    _0x1d3a2f.stopPropagation?.();
    return true;
  };
  const _0x1f4615 = () => {
    if (_0x3a640d) {
      return _0xbf97d1(null, {
        cancelled: true
      });
    }
    if (!_0x182068) {
      return false;
    }
    _0x182068 = false;
    _0x3be3ab();
    return true;
  };
  const _0x5026bd = () => _0x38e2d5.characters.find(_0x1b7fd7 => _0x1b7fd7.id === _0x38e2d5.workspace.selectedCharacterId) || null;
  const _0x96ff9b = (_0x4a98ce = _0x5026bd()) => {
    const _0x2dd543 = Math.trunc(Number(_0x38e2d5.workspace.assetAppearanceIndexes?.[_0x4a98ce?.id]) || 0);
    return getWorkspaceAssetAppearances(_0x4a98ce)[_0x2dd543] || getWorkspaceAssetAppearances(_0x4a98ce)[0] || null;
  };
  const _0x3c4384 = () => {
    const _0x33baf6 = _0x38e2d5.workspace.characterAssetTab;
    const _0x315e24 = _0x33baf6 === "scene" ? _0x38e2d5.scenes.find(_0x5827fd => _0x5827fd.id === _0x38e2d5.workspace.selectedSceneId) : _0x33baf6 === "library" ? _0x38e2d5.libraryAssets.find(_0x5046a6 => _0x5046a6.id === _0x38e2d5.workspace.selectedLibraryAssetId) : _0x5026bd();
    const _0x49020b = _0x33baf6 === "library" ? _0x315e24 : _0x96ff9b(_0x315e24);
    const _0xc2b9b7 = normalizeText(_0x49020b?.sourceUrl || _0x49020b?.imageUrl || _0x49020b?.thumbnailUrl);
    if (!_0x315e24 || !_0xc2b9b7) {
      return null;
    }
    const _0x5e358b = normalizeText(_0x315e24.name) || "生成图片";
    const _0x292581 = normalizeText(_0x49020b?.name);
    return {
      imageRef: _0xc2b9b7,
      filenameBase: _0x292581 && _0x292581 !== _0x5e358b && _0x292581 !== "基础形象" ? [_0x5e358b, _0x292581].join("-") : _0x5e358b,
      title: "下载图片"
    };
  };
  const _0x3ce610 = () => {
    const _0xf35507 = _0x38e2d5.shots.find(_0x5cccae => _0x5cccae.id === _0x38e2d5.workspace.selectedShotId);
    const _0xc87e73 = normalizeText(_0xf35507?.replacementImageRef);
    if (!_0xf35507 || !_0xc87e73) {
      return null;
    }
    const _0x234088 = Math.max(0, _0x38e2d5.shots.findIndex(_0x516c4a => _0x516c4a.id === _0xf35507.id));
    return {
      imageRef: _0xc87e73,
      filenameBase: ["镜头片段" + String(_0x234088 + 1).padStart(2, "0"), "替换图"].join("-"),
      title: "下载替换图片"
    };
  };
  const _0x479854 = (_0x2fcd6d, _0x1e0a18) => {
    if (!_0x1e0a18) {
      return false;
    }
    runWorkspaceImageDownloadAction(_0x2fcd6d, () => Promise.resolve(_0x443f39(onDownloadImageRequested, _0x1e0a18, {}, {
      applyCallbackResult: false
    })));
    return true;
  };
  const _0x5c7464 = (_0xb2c533, _0x3d6910 = "未命名人物") => String(_0xb2c533 ?? "").replace(/\s+/gu, " ").trim() || _0x3d6910;
  const _0x1ab626 = _0x1e7774 => {
    const _0x47dcd5 = normalizeText(_0x1e7774?.dataset?.storyAssetNameId);
    const _0xe9516 = _0x38e2d5.characters.find(_0x1eb76f => _0x1eb76f.id === _0x47dcd5);
    if (!_0x1e7774 || !_0xe9516 || _0x1e7774.getAttribute?.("contenteditable") === "true") {
      return false;
    }
    _0x1e7774.dataset.storyAssetOriginalName = _0xe9516.name;
    _0x1e7774.setAttribute?.("contenteditable", "true");
    _0x1e7774.setAttribute?.("role", "textbox");
    _0x1e7774.setAttribute?.("aria-label", "修改" + _0xe9516.name + "的名称");
    _0x1e7774.classList?.add?.("is-editing");
    _0x1e7774.focus?.();
    const _0x3bd083 = windowObject?.getSelection?.();
    const _0x18cafe = documentObject?.createRange?.();
    if (_0x3bd083 && _0x18cafe) {
      _0x18cafe.selectNodeContents?.(_0x1e7774);
      _0x3bd083.removeAllRanges?.();
      _0x3bd083.addRange?.(_0x18cafe);
    }
    return true;
  };
  const _0x4f57fb = (_0x18ec94, {
    cancel = false
  } = {}) => {
    const _0x25f78c = normalizeText(_0x18ec94?.dataset?.storyAssetNameId);
    const _0x16a8d2 = _0x38e2d5.characters.find(_0x1fe982 => _0x1fe982.id === _0x25f78c);
    if (!_0x18ec94 || !_0x16a8d2 || _0x18ec94.getAttribute?.("contenteditable") !== "true") {
      return false;
    }
    const _0x4bbd05 = _0x5c7464(_0x18ec94.dataset.storyAssetOriginalName, _0x16a8d2.name);
    const _0x51f498 = cancel ? _0x4bbd05 : _0x5c7464(_0x18ec94.textContent, _0x4bbd05);
    _0x38e2d5 = a1155_0x56b8cf({
      ..._0x38e2d5,
      characters: _0x38e2d5.characters.map(_0x231bc6 => _0x231bc6.id === _0x25f78c ? {
        ..._0x231bc6,
        name: _0x51f498
      } : _0x231bc6)
    });
    _0x318ed6?.querySelectorAll?.("[data-story-asset-name-id]")?.forEach?.(_0x37f1ea => {
      if (normalizeText(_0x37f1ea.dataset.storyAssetNameId) !== _0x25f78c) {
        return;
      }
      _0x37f1ea.textContent = _0x51f498;
      _0x37f1ea.removeAttribute?.("contenteditable");
      _0x37f1ea.removeAttribute?.("role");
      _0x37f1ea.setAttribute?.("aria-label", "重命名" + _0x51f498);
      _0x37f1ea.classList?.remove?.("is-editing");
      delete _0x37f1ea.dataset.storyAssetOriginalName;
    });
    if (!cancel && _0x51f498 !== _0x16a8d2.name) {
      _0x575f0c("character-name");
    }
    return true;
  };
  const _0x4587a1 = () => _0x318ed6?.querySelector?.("[data-story-asset-hover-preview]");
  const _0x38929b = _0x428910 => {
    const _0x6f6ca9 = _0x428910?.closest?.(".person-replacement-prompt-reference-inputs");
    const _0x5dedfc = _0x6f6ca9 ? _0x428910?.querySelector?.(".ref-thumb-media") : null;
    const _0x199e1a = normalizeMediaUrl(_0x5dedfc?.currentSrc || _0x5dedfc?.getAttribute?.("src") || _0x5dedfc?.src);
    if (!_0x199e1a) {
      return null;
    }
    const _0x25d915 = normalizeText(_0x428910?.dataset?.slot) || "input";
    const _0xde2d12 = normalizeText(_0x428910?.getAttribute?.("aria-label")) || "模型入参 " + _0x25d915;
    return {
      id: "prompt-reference:" + _0x25d915 + ":" + _0x199e1a,
      slotId: _0x25d915,
      label: _0xde2d12,
      imageUrl: _0x199e1a
    };
  };
  const _0x37929c = _0x27659a => getWorkspaceAssetHoverCard(_0x27659a, {
    selector: "[data-story-asset-id], [data-story-reference-asset], [data-story-asset-hover-id]"
  }) || _0x27659a?.closest?.(".person-replacement-prompt-reference-inputs .ref-thumb-wrap[data-slot]") || null;
  const _0x2eff9a = _0x55d995 => normalizeText(getWorkspaceAssetHoverCardId(_0x55d995, {
    datasetKeys: ["storyAssetHoverId", "storyAssetId", "storyReferenceAsset"]
  })) || _0x38929b(_0x55d995)?.id || "";
  const _0x389f58 = _0x5a846d => {
    const _0xc7b066 = _0x2d2968;
    if (!_0x5a846d || !_0xc7b066) {
      return false;
    }
    return _0x2eff9a(_0x5a846d) === _0xc7b066.assetId && normalizeText(_0x5a846d.dataset?.shotId) === _0xc7b066.shotId && normalizeText(_0x5a846d.dataset?.personId) === _0xc7b066.personId;
  };
  const _0x44c2d8 = () => {
    _0xa398d5 = "";
    _0x48725f = null;
    const _0x3be9f6 = _0x4587a1();
    _0x3be9f6?.classList?.remove?.("is-visible");
    _0x3be9f6?.classList?.remove?.("is-prompt-reference-preview");
    _0x3be9f6?.setAttribute?.("aria-hidden", "true");
  };
  const _0x5bbab6 = () => {
    _0x5b4c64 = 0;
    const _0x19c5a0 = _0x4587a1();
    if (!_0x19c5a0?.classList?.contains?.("is-visible")) {
      return;
    }
    const _0x18137d = _0x19c5a0.getBoundingClientRect?.();
    if (!_0x18137d) {
      return;
    }
    const _0x5200e9 = windowObject?.innerWidth || documentObject?.documentElement?.clientWidth || 1024;
    const _0x2f9f4c = windowObject?.innerHeight || documentObject?.documentElement?.clientHeight || 768;
    const _0x4b3d3d = 14;
    const _0x4a2752 = 10;
    const _0x5bb33b = Math.max(_0x4a2752, _0x5200e9 - _0x18137d.width - _0x4a2752);
    const _0x3d50d9 = Math.max(_0x4a2752, _0x2f9f4c - _0x18137d.height - _0x4a2752);
    const _0x1041d4 = _0x48725f?.getBoundingClientRect?.();
    const _0xa0cc1 = Number(_0x1041d4?.width) > 0 && Number.isFinite(Number(_0x1041d4?.left)) && Number.isFinite(Number(_0x1041d4?.top));
    const _0x96270c = _0xa0cc1 ? Number(_0x1041d4.left) + (Number(_0x1041d4.width) - _0x18137d.width) / 2 : _0x342774 + _0x4b3d3d;
    const _0x569fe1 = _0xa0cc1 ? Number(_0x1041d4.top) - _0x18137d.height - _0x4b3d3d : _0xe3908c + _0x4b3d3d;
    _0x19c5a0.style.left = Math.round(Math.min(Math.max(_0x4a2752, _0x96270c), _0x5bb33b)) + "px";
    _0x19c5a0.style.top = Math.round(Math.min(Math.max(_0x4a2752, _0x569fe1), _0x3d50d9)) + "px";
  };
  const _0x1e28fa = (_0xc61f45, {
    anchor = null
  } = {}) => {
    _0x342774 = Number(_0xc61f45?.clientX || 0);
    _0xe3908c = Number(_0xc61f45?.clientY || 0);
    _0x48725f = anchor;
    if (_0x5b4c64) {
      return;
    }
    if (typeof windowObject?.requestAnimationFrame === "function") {
      _0x5b4c64 = windowObject.requestAnimationFrame(_0x5bbab6);
    } else {
      _0x5bbab6();
    }
  };
  const _0x4c0aab = _0x4eb5b5 => {
    _0x4eb5b5?.querySelectorAll?.("[data-story-asset-hover-image]")?.forEach?.(_0x3a805f => {
      const _0x5884c6 = () => {
        const _0x6cc75e = isWorkspaceAssetHoverLandscape(_0x3a805f.naturalWidth, _0x3a805f.naturalHeight);
        _0x3a805f.closest?.(".story-asset-hover-preview-item")?.classList?.toggle?.("is-landscape", _0x6cc75e);
        _0x3a805f.closest?.(".story-asset-hover-preview-cell")?.classList?.toggle?.("is-landscape", _0x6cc75e);
        _0x5bbab6();
      };
      if (_0x3a805f.complete && Number(_0x3a805f.naturalWidth) > 0) {
        _0x5884c6();
      } else {
        _0x3a805f.addEventListener?.("load", _0x5884c6, {
          once: true
        });
      }
    });
  };
  const _0x3f41f9 = (_0x21782d, _0x1725fb) => {
    if (!_0x21782d || _0x1725fb?.pointerType === "touch" || _0x38e2d5.workspace.view !== "project" || _0x318ed6?.classList?.contains?.("is-marquee-selecting") || _0x16a723) {
      _0x44c2d8();
      return;
    }
    const _0x2f7c9f = _0x38929b(_0x21782d);
    const _0x2c9cef = _0x21782d.dataset?.personReplacementAudioLibraryAsset === "true";
    const _0x5ecea8 = normalizeText(getWorkspaceAssetHoverCardId(_0x21782d, {
      datasetKeys: ["storyAssetHoverId", "storyAssetId", "storyReferenceAsset"]
    })) || _0x2f7c9f?.id || "";
    if (_0x389f58(_0x21782d)) {
      _0x44c2d8();
      return;
    }
    const _0x277533 = normalizeText(_0x21782d.dataset?.storyAssetHoverAppearanceId);
    const _0x37aff8 = _0x38e2d5.workspace.step === 2 && Boolean(_0x21782d.closest?.(".person-replacement-target-assets"));
    const _0x3a9067 = _0x38e2d5.workspace.step === 2 && Boolean(_0x37aff8 || _0x21782d.closest?.("[data-person-replacement-person-drop]"));
    const _0x486b70 = _0x21782d.dataset?.personReplacementReplacementAssetKind === "scene";
    const _0x387be4 = _0x38e2d5.workspace.step === 3 && _0x21782d.dataset?.personReplacementVideoShotHoverPreview === "true";
    const _0x4f7d4c = _0x38e2d5.workspace.step === 3 && _0x21782d.dataset?.personReplacementVideoReferenceHoverPreview === "true";
    const _0x5c4469 = _0x38e2d5.workspace.step === 5 && _0x21782d.dataset?.personReplacementCompositeShotHoverPreview === "true";
    const _0x3c99d7 = Boolean(_0x2f7c9f);
    const _0x15b4f0 = _0x387be4 || _0x4f7d4c || _0x5c4469 ? _0x38e2d5.shots.findIndex(_0x1bbeda => normalizeText(_0x1bbeda?.id) === _0x5ecea8) : -1;
    const _0x4fe3ea = _0x15b4f0 >= 0 ? _0x38e2d5.shots[_0x15b4f0] : null;
    const _0x5c52ed = getPersonReplacementImageResults(_0x4fe3ea);
    const _0x21aa65 = getPersonReplacementActiveImageResultIndex(_0x4fe3ea, _0x5c52ed);
    const _0x2424a5 = resolvePersonReplacementImageResultRef(_0x5c52ed[_0x21aa65]) || normalizeText(_0x4fe3ea?.replacementImageRef);
    const _0x4971fa = _0x387be4 && _0x4fe3ea ? resolveVideoShotReferencePreview(_0x38e2d5, _0x4fe3ea) : null;
    const _0x1483cf = _0x4fe3ea ? {
      id: _0x5ecea8,
      kind: "scene",
      name: "片段" + String(_0x15b4f0 + 1).padStart(2, "0"),
      appearances: [{
        id: "source-frame",
        name: "原片关键帧",
        imageUrl: normalizeMediaUrl(_0x4fe3ea.keyframeRef)
      }, {
        id: _0x4971fa?.isCharacterReference ? "character-reference" : "replacement-frame",
        name: _0x4971fa?.isCharacterReference ? "人物入参图" : "当前替换图",
        imageUrl: normalizeMediaUrl(_0x4971fa?.referenceImageRef || _0x2424a5)
      }]
    } : null;
    const _0xcc1975 = _0x4f7d4c && _0x4fe3ea ? resolvePersonReplacementVideoImageInput(_0x38e2d5, _0x4fe3ea) : null;
    const _0x33bec0 = Array.isArray(_0xcc1975?.referenceOptions) ? _0xcc1975.referenceOptions : [];
    const _0x384e24 = Math.max(0, Math.min(Math.max(0, _0x33bec0.length - 1), Math.trunc(Number(_0x21782d.dataset?.personReplacementVideoReferenceIndex) || 0)));
    const _0x3f4cf8 = _0x33bec0[_0x384e24];
    const _0x31c247 = _0x3f4cf8?.imageRef ? {
      id: _0x5ecea8,
      kind: "scene",
      name: "替换参考图 " + (_0x384e24 + 1),
      appearances: [{
        id: "video-reference-" + _0x384e24,
        name: "替换参考图",
        imageUrl: normalizeMediaUrl(_0x3f4cf8.imageRef)
      }]
    } : null;
    const _0x3183f8 = _0x5c4469 && _0x4fe3ea ? {
      id: _0x5ecea8,
      kind: "scene",
      name: normalizeText(_0x4fe3ea.title) || "片段" + String(_0x15b4f0 + 1).padStart(2, "0"),
      appearances: [{
        id: "composite-thumbnail",
        name: "片段缩略图",
        imageUrl: normalizeMediaUrl(_0x2424a5 || _0x4fe3ea.keyframeRef)
      }]
    } : null;
    const _0x16174c = _0x3c99d7 ? {
      id: _0x5ecea8,
      kind: "scene",
      name: _0x2f7c9f.label,
      appearances: [{
        id: _0x2f7c9f.slotId,
        name: _0x2f7c9f.label,
        imageUrl: _0x2f7c9f.imageUrl
      }]
    } : null;
    const _0x176eac = !_0x3c99d7 && !_0x387be4 && !_0x4f7d4c && !_0x5c4469 && (_0x486b70 || _0x38e2d5.workspace.step === 1 && _0x38e2d5.workspace.characterAssetTab === "scene");
    const _0x3ce1e1 = !_0x176eac && !_0x2c9cef && !_0x3c99d7 && !_0x3a9067 && !_0x387be4 && !_0x4f7d4c && !_0x5c4469 && _0x38e2d5.workspace.characterAssetTab === "library";
    const _0x515018 = !_0x176eac && !_0x3c99d7 && !_0x3a9067 && !_0x387be4 && !_0x4f7d4c && !_0x5c4469 && (_0x2c9cef || _0x38e2d5.workspace.characterAssetTab === "audio");
    const _0x2a9316 = _0x38e2d5.workspace.characterAssetTab === "audio" ? _0x38e2d5.audioAssets : _0x38e2d5.libraryAssets;
    const _0x4726b6 = _0x515018 ? _0x2a9316.find(_0x4ac1b5 => normalizeText(_0x4ac1b5?.id) === _0x5ecea8) : null;
    const _0xecd87b = _0x4726b6 ? getPersonReplacementVoiceLibraryBoundCharacters(_0x38e2d5, _0x4726b6).map(_0x510f43 => {
      const _0x3568c0 = getWorkspaceAssetBaseAppearance(_0x510f43) || getWorkspaceAssetAppearances(_0x510f43).find(_0x4ebeb6 => normalizeText(_0x4ebeb6?.imageUrl));
      return {
        id: _0x510f43.id,
        name: normalizeText(_0x510f43.name) || "未命名人设",
        imageUrl: normalizeMediaUrl(_0x3568c0?.imageUrl)
      };
    }).filter(_0x15130a => _0x15130a.imageUrl) : [];
    const _0x2bc6cf = _0xecd87b.length ? {
      id: _0x5ecea8,
      kind: "character",
      name: normalizeText(_0x4726b6?.name) || "音频绑定人设",
      appearances: _0xecd87b
    } : null;
    const _0x33c29f = _0x176eac ? _0x38e2d5.scenes : _0x3ce1e1 ? _0x38e2d5.libraryAssets : _0x515018 ? _0x2a9316 : _0x38e2d5.characters;
    const _0x57f86d = _0x16174c || _0x3183f8 || _0x31c247 || _0x1483cf || _0x2bc6cf || _0x33c29f.find(_0x11d91f => normalizeText(_0x11d91f?.id) === _0x5ecea8);
    if (_0x515018 && !_0x2bc6cf) {
      _0x44c2d8();
      return;
    }
    const _0x4ded0d = _0x4587a1();
    const _0x4862c4 = _0x3c99d7 ? _0x16174c?.appearances?.[0] : _0x5c4469 ? _0x3183f8?.appearances?.[0] : _0x4f7d4c ? _0x31c247?.appearances?.[0] : _0x387be4 ? _0x1483cf?.appearances?.[1] : _0x515018 ? _0x2bc6cf?.appearances?.[0] : _0x57f86d?.isLibraryAsset ? _0x57f86d : _0x277533 ? getCharacterAppearance(_0x57f86d, _0x277533) : _0x96ff9b(_0x57f86d);
    const _0x1a556a = _0x515018 ? _0x2bc6cf : _0x3a9067 && _0x4862c4 ? {
      ..._0x57f86d,
      appearances: [_0x4862c4]
    } : _0x57f86d;
    const _0x4489c4 = buildWorkspaceAssetHoverPreviewContent(_0x1a556a, {
      selectedAssetId: _0x3c99d7 || _0x387be4 || _0x4f7d4c || _0x5c4469 ? _0x5ecea8 : _0x3a9067 ? _0x5ecea8 : _0x515018 && _0x38e2d5.workspace.characterAssetTab === "audio" ? _0x38e2d5.workspace.selectedAudioAssetId : _0x3ce1e1 || _0x515018 ? _0x38e2d5.workspace.selectedLibraryAssetId : _0x176eac ? _0x38e2d5.workspace.selectedSceneId : _0x38e2d5.workspace.selectedCharacterId,
      selectedAppearanceId: _0x4862c4?.id,
      mediaOnly: _0x387be4 || _0x4f7d4c || _0x5c4469 || _0x3c99d7 || _0x515018 || [1, 2].includes(_0x38e2d5.workspace.step),
      getAppearances: getWorkspaceAssetAppearances,
      hasVoiceReference: _0x50dd0a => Boolean(getCharacterVoiceUrl(_0x50dd0a))
    });
    if (!_0x4ded0d || !_0x4489c4) {
      _0x44c2d8();
      return;
    }
    const _0x207aa2 = _0x5ecea8 + ":" + (_0x4862c4?.id || "") + ":" + _0x4489c4.mediaOnly + ":" + _0x4489c4.appearances.map(_0x41dcc5 => (_0x41dcc5?.id || "") + ":" + (_0x41dcc5?.imageUrl || "")).join("|");
    _0xa398d5 = _0x5ecea8;
    if (_0x4ded0d.dataset.signature !== _0x207aa2) {
      _0x4ded0d.dataset.signature = _0x207aa2;
      _0x4ded0d.style.setProperty("--story-asset-hover-columns", String(_0x4489c4.columns));
      _0x4ded0d.innerHTML = _0x4489c4.html;
      _0x4c0aab(_0x4ded0d);
    }
    _0x4ded0d.classList.toggle("is-prompt-reference-preview", _0x3c99d7);
    _0x4ded0d.classList.add("is-visible");
    _0x4ded0d.setAttribute("aria-hidden", "false");
    _0x1e28fa(_0x1725fb, {
      anchor: _0x3c99d7 ? _0x21782d : null
    });
  };
  const _0x4daf86 = _0x13136e => {
    const _0x1199a7 = _0x13136e.target?.closest?.("[data-person-replacement-image-history=\"true\"], [data-person-replacement-video-history=\"true\"]");
    if (_0x1199a7 && _0x318ed6?.contains?.(_0x1199a7) && (!_0x13136e.relatedTarget || !_0x1199a7.contains?.(_0x13136e.relatedTarget))) {
      _0x22bfd0(_0x1199a7, _0x13136e);
    }
    if (_0x13136e.target?.closest?.(".person-replacement-detection-label")) {
      _0x44c2d8();
      return;
    }
    const _0x489bd4 = _0x37929c(_0x13136e.target);
    if (!_0x489bd4 || !_0x318ed6?.contains?.(_0x489bd4)) {
      return;
    }
    if (_0x13136e.relatedTarget && _0x489bd4.contains?.(_0x13136e.relatedTarget)) {
      return;
    }
    _0x3f41f9(_0x489bd4, _0x13136e);
  };
  const _0x293731 = _0x425c6e => {
    const _0x5ca813 = _0x318ed6?.querySelector?.("[data-person-replacement-result-history-menu]");
    const _0x5db630 = _0xbbc934?.getAnchor?.();
    if (_0x5ca813?.classList?.contains?.("is-visible") && !_0x5ca813.contains?.(_0x425c6e.target) && !_0x5db630?.contains?.(_0x425c6e.target)) {
      _0x400efa({
        delayed: true
      });
    }
    if (_0x425c6e.target?.closest?.(".person-replacement-detection-label")) {
      if (_0xa398d5) {
        _0x44c2d8();
      }
      return;
    }
    const _0x5d2326 = _0x37929c(_0x425c6e.target);
    if (!_0x5d2326 || !_0x318ed6?.contains?.(_0x5d2326)) {
      if (!_0x16a723) {
        _0x2d2968 = null;
      }
      if (_0xa398d5) {
        _0x44c2d8();
      }
      return;
    }
    _0x3f41f9(_0x5d2326, _0x425c6e);
  };
  const _0x4eec1a = _0x9a541f => {
    const _0x2c8636 = _0x9a541f.target?.closest?.("[data-person-replacement-image-history=\"true\"], [data-person-replacement-video-history=\"true\"]");
    const _0x2e9315 = _0x318ed6?.querySelector?.("[data-person-replacement-result-history-menu]");
    if (_0x2c8636 && (!_0x9a541f.relatedTarget || !_0x2c8636.contains?.(_0x9a541f.relatedTarget)) && !_0x2e9315?.contains?.(_0x9a541f.relatedTarget)) {
      _0x400efa({
        delayed: true
      });
    }
    const _0x15162e = _0x37929c(_0x9a541f.target);
    if (!_0x16a723 && _0x389f58(_0x15162e)) {
      _0x2d2968 = null;
    }
    if (!_0x15162e || _0x2eff9a(_0x15162e) !== _0xa398d5) {
      return;
    }
    if (_0x9a541f.relatedTarget && _0x15162e.contains?.(_0x9a541f.relatedTarget)) {
      return;
    }
    _0x44c2d8();
  };
  const _0x18fbd7 = () => {
    _0xbbc934?.destroy?.();
    const _0x9d9bda = _0x318ed6?.querySelector?.("[data-person-replacement-result-history-menu]");
    _0xbbc934 = createWorkspaceMediaHistoryMenuController({
      menuElement: _0x9d9bda,
      windowObject: windowObject,
      getMarkup: (_0x4ad0e3, _0x162a4c = {}) => {
        if (_0x38e2d5.workspace.shotSelectionMode) {
          return "";
        }
        const _0x5e0837 = normalizeText(_0x4ad0e3?.dataset?.shotId);
        const _0x41a05f = _0x38e2d5.shots.findIndex(_0x1af9b1 => normalizeText(_0x1af9b1?.id) === _0x5e0837);
        if (_0x41a05f < 0) {
          return "";
        }
        if (_0x9d9bda) {
          _0x9d9bda.dataset.shotId = _0x5e0837;
        }
        const _0x168108 = _0x38e2d5.shots[_0x41a05f];
        const _0x5ecf1d = "片段" + String(_0x41a05f + 1).padStart(2, "0");
        const _0x4d305b = _0x162a4c.historyKind === "video" || _0x4ad0e3?.dataset?.personReplacementVideoHistory === "true" ? "video" : "image";
        if (_0x9d9bda) {
          _0x9d9bda.dataset.historyKind = _0x4d305b;
        }
        const _0x23cc45 = {
          allowSingleResult: _0x162a4c.allowSingleResult === true
        };
        return personReplacementShotTimelinePresentation.renderHistoryMenu({
          kind: _0x4d305b,
          shot: _0x168108,
          title: _0x5ecf1d,
          ..._0x23cc45
        });
      }
    });
  };
  const _0x22bfd0 = (_0xa3106d, _0x2081b6) => {
    _0xbbc934?.show?.(_0xa3106d, {
      event: _0x2081b6
    });
  };
  const _0x400efa = (_0x4e34eb = {}) => {
    _0xbbc934?.hide?.(_0x4e34eb);
  };
  const _0x18e3e4 = () => {
    const _0x22aa6f = _0xbbc934?.getAnchor?.();
    const _0x55b110 = _0x318ed6?.querySelector?.("[data-person-replacement-result-history-menu]");
    if (!_0x22aa6f || !_0x55b110?.classList?.contains?.("is-visible")) {
      return null;
    }
    const _0x2f01dd = normalizeText(_0x22aa6f.dataset?.shotId || _0x55b110.dataset?.shotId);
    if (!_0x2f01dd) {
      return null;
    }
    const _0x5022b1 = _0x55b110.querySelector?.(".story-media-history-list");
    const _0x597e8d = documentObject?.activeElement;
    const _0x4e686e = _0x597e8d && _0x55b110.contains?.(_0x597e8d) && _0x597e8d?.dataset?.storyAction ? {
      storyAction: _0x597e8d.dataset.storyAction,
      shotId: _0x597e8d.dataset.shotId || "",
      imageResultIndex: _0x597e8d.dataset.replacementImageResultIndex || "",
      videoResultIndex: _0x597e8d.dataset.replacementVideoResultIndex || ""
    } : null;
    return {
      shotId: _0x2f01dd,
      historyKind: _0x22aa6f.dataset?.personReplacementVideoHistory === "true" || _0x55b110.dataset?.historyKind === "video" ? "video" : "image",
      scrollLeft: Number(_0x5022b1?.scrollLeft) || 0,
      scrollTop: Number(_0x5022b1?.scrollTop) || 0,
      focusedAction: _0x4e686e
    };
  };
  const _0x3d2dc8 = _0x3dd0cd => {
    const _0x8f9dff = normalizeText(_0x3dd0cd?.shotId);
    if (!_0x8f9dff) {
      return false;
    }
    const _0x4caee0 = Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).find(_0x1f7d89 => normalizeText(_0x1f7d89.dataset?.shotId) === _0x8f9dff);
    if (!_0x4caee0) {
      return false;
    }
    const _0x48587e = _0xbbc934?.show?.(_0x4caee0, {
      historyKind: _0x3dd0cd.historyKind,
      allowSingleResult: true
    }) === true;
    if (!_0x48587e) {
      return false;
    }
    const _0x580cb1 = _0x318ed6?.querySelector?.("[data-person-replacement-result-history-menu]");
    const _0x2b5e9d = () => {
      const _0x52dfdc = _0x580cb1?.querySelector?.(".story-media-history-list");
      if (_0x52dfdc) {
        _0x52dfdc.scrollLeft = Math.max(0, Number(_0x3dd0cd.scrollLeft) || 0);
        _0x52dfdc.scrollTop = Math.max(0, Number(_0x3dd0cd.scrollTop) || 0);
      }
      const _0x235da9 = _0x3dd0cd.focusedAction;
      if (!_0x235da9?.storyAction) {
        return;
      }
      const _0x4702f2 = Array.from(_0x580cb1?.querySelectorAll?.("[data-story-action]") || []).find(_0x65a86f => _0x65a86f.dataset?.storyAction === _0x235da9.storyAction && (_0x65a86f.dataset?.shotId || "") === _0x235da9.shotId && (_0x65a86f.dataset?.replacementImageResultIndex || "") === _0x235da9.imageResultIndex && (_0x65a86f.dataset?.replacementVideoResultIndex || "") === _0x235da9.videoResultIndex);
      _0x4702f2?.focus?.();
    };
    _0x2b5e9d();
    windowObject?.requestAnimationFrame?.(_0x2b5e9d);
    return true;
  };
  const _0x2e4999 = () => {
    _0x137278.forEach(_0x58e44d => _0x58e44d?.destroy?.());
    _0x137278 = [];
  };
  const _0x402151 = () => {
    _0x2e4999();
    const _0x16e809 = Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-voice-track]") || []);
    _0x16e809.forEach(_0x2678ff => {
      let _0x15a384 = null;
      _0x15a384 = createAudioPlaybackSurfaceController(_0x2678ff, {
        onBeforePlay: () => {
          _0x3638b1();
          _0x137278.forEach(_0x51cfa7 => {
            if (_0x51cfa7 !== _0x15a384) {
              _0x51cfa7?.audioEl?.pause?.();
            }
          });
        },
        onError: () => windowObject?.showToast?.(_0x2678ff.dataset?.personReplacementVoiceTrack === "vocals" ? "清晰人声播放失败。" : "原始声音播放失败。", "warn")
      });
      if (_0x15a384) {
        _0x137278.push(_0x15a384);
      }
    });
  };
  const _0x281cbe = () => {
    _0x1b1750.forEach(_0x430b97 => _0x430b97?.destroy?.());
    _0x1b1750 = [];
    const _0x345bec = createAudioPlaybackSurfaceController(_0x318ed6?.querySelector?.(".person-replacement-audio-playback[data-audio-playback-surface], .person-replacement-voice-library-playback[data-audio-playback-surface]"), {
      onBeforePlay: _0x3638b1,
      onError: () => windowObject?.showToast?.("声音素材播放失败。", "warn")
    });
    if (_0x345bec) {
      _0x1b1750.push(_0x345bec);
    }
    _0x402151();
    let _0x5e1a4f = null;
    let _0x14eb94 = null;
    const _0x405e23 = _0x318ed6?.querySelector?.("[data-aigen-image-model-selector]");
    if (_0x405e23) {
      const _0x4402de = _0x38e2d5.workspace.step === 1;
      const _0x15a01e = _0x4402de ? _0x38e2d5.settings.characterImageModelId : _0x38e2d5.settings.replacementImageModelId;
      const _0x97468a = _0x4402de ? _0x38e2d5.settings.characterImageGenerationParams : _0x38e2d5.settings.replacementImageGenerationParams;
      const _0x5aa4a3 = _0x4402de ? _0x38e2d5.settings.characterImageProvider : _0x38e2d5.settings.replacementImageProvider;
      const _0x2afa72 = _0x4402de ? _0x38e2d5.settings.characterImageProviderProfileId : _0x38e2d5.settings.replacementImageProviderProfileId;
      const _0x3640b9 = _0x4402de ? _0x38e2d5.settings.characterImageProviderProfileIdByModel : _0x38e2d5.settings.replacementImageProviderProfileIdByModel;
      _0x1b1750.push(bindAIGenImageModelSelector(_0x405e23, {
        modelId: _0x15a01e,
        provider: resolveModelProvider(_0x15a01e, _0x5aa4a3),
        generationParams: _0x97468a,
        generationParamsByModel: _0x4402de ? _0x38e2d5.settings.characterImageGenerationParamsByModel : _0x38e2d5.settings.replacementImageGenerationParamsByModel,
        providerProfileId: _0x2afa72,
        providerProfileIdByModel: _0x3640b9,
        showSchemaControls: true,
        documentObject: documentObject,
        windowObject: windowObject,
        floatingMenuHost: _0x318ed6,
        schemaPopupPlacement: "portal-auto-up",
        onChange: ({
          modelId: _0x3a9d8e,
          provider: _0x3f45f6,
          generationParams: _0x39a80f,
          generationParamsByModel: _0x29e3f5,
          providerProfileId: _0x2e88f6,
          providerProfileIdByModel: _0x105e2a
        }) => {
          const _0x48fbf9 = {
            ..._0x38e2d5.settings
          };
          if (_0x4402de) {
            _0x48fbf9.characterImageModelId = _0x3a9d8e;
            _0x48fbf9.characterImageProvider = resolveModelProvider(_0x3a9d8e, _0x3f45f6);
            _0x48fbf9.characterImageGenerationParams = normalizeCharacterAssetImageGenerationParams(_0x3a9d8e, _0x39a80f);
            _0x48fbf9.characterImageGenerationParamsByModel = _0x29e3f5;
            _0x48fbf9.characterImageProviderProfileId = _0x2e88f6;
            _0x48fbf9.characterImageProviderProfileIdByModel = _0x105e2a;
          } else {
            _0x48fbf9.replacementImageModelId = _0x3a9d8e;
            _0x48fbf9.replacementImageProvider = resolveModelProvider(_0x3a9d8e, _0x3f45f6);
            _0x48fbf9.replacementImageGenerationParams = _0x39a80f;
            _0x48fbf9.replacementImageGenerationParamsByModel = _0x29e3f5;
            _0x48fbf9.replacementImageProviderProfileId = _0x2e88f6;
            _0x48fbf9.replacementImageProviderProfileIdByModel = _0x105e2a;
          }
          _0x38e2d5 = a1155_0x56b8cf({
            ..._0x38e2d5,
            settings: _0x48fbf9
          });
          _0x575f0c("image-model");
          _0x5e1a4f?.sync();
        }
      }));
    }
    const _0x25b36b = _0x318ed6?.querySelector?.("[data-aigen-video-model-selector]");
    if (_0x25b36b) {
      const _0x22a823 = personReplacementVideoPresentation.build(_0x38e2d5);
      const _0x3ec4bb = resolvePersonReplacementVideoParameterPolicy({
        modelId: _0x38e2d5.settings.replacementModelId,
        inputMode: _0x38e2d5.settings.replacementVideoInputMode,
        generationParams: _0x38e2d5.settings.replacementVideoGenerationParams
      });
      _0x14eb94 = bindAIGenVideoModelSelector(_0x25b36b, {
        modelId: _0x38e2d5.settings.replacementModelId,
        provider: resolveModelProvider(_0x38e2d5.settings.replacementModelId),
        generationParams: _0x3ec4bb.generationParams,
        uiSchemaFieldState: _0x3ec4bb.uiSchemaFieldState,
        providerProfileId: _0x38e2d5.settings.replacementVideoProviderProfileId,
        providerProfileIdByModel: _0x38e2d5.settings.replacementVideoProviderProfileIdByModel,
        referenceCounts: _0x22a823.slotState.referenceCounts,
        showSchemaControls: true,
        allowedModelIds: getPersonReplacementVideoModelIds(),
        documentObject: documentObject,
        windowObject: windowObject,
        floatingMenuHost: _0x318ed6,
        modelSubmenuPlacement: "viewport-auto-up",
        schemaPopupPlacement: "viewport-auto-up",
        onChange: ({
          modelId: _0x4db57d,
          generationParams: _0x15bb0e,
          providerProfileId: _0x3300f3,
          providerProfileIdByModel: _0x4d54bc
        }) => {
          const _0x145eb3 = resolvePersonReplacementVideoParameterPolicy({
            modelId: _0x4db57d,
            inputMode: _0x38e2d5.settings.replacementVideoInputMode,
            generationParams: _0x15bb0e,
            resetModeDefaults: _0x4db57d !== _0x38e2d5.settings.replacementModelId
          });
          _0x38e2d5 = a1155_0x56b8cf({
            ..._0x38e2d5,
            settings: {
              ..._0x38e2d5.settings,
              replacementModelId: _0x4db57d,
              replacementVideoGenerationParams: _0x145eb3.generationParams,
              replacementVideoProviderProfileId: _0x3300f3,
              replacementVideoProviderProfileIdByModel: _0x4d54bc
            }
          });
          const _0x5be092 = _0x318ed6?.querySelector?.("[data-person-replacement-video-reference-inputs]");
          if (_0x5be092) {
            const _0x5b94a5 = personReplacementIdentityPresentation.buildVideo(_0x38e2d5, personReplacementVideoPresentation.build(_0x38e2d5)).referenceInputsHtml;
            const _0x175a4d = typeof _0x5be092.cloneNode === "function" ? _0x5be092.cloneNode(false) : null;
            if (_0x175a4d) {
              _0x175a4d.innerHTML = _0x5b94a5;
            }
            if (!_0x175a4d || !reconcilePersonReplacementReferenceInputs({
              currentInputs: _0x5be092,
              nextInputs: _0x175a4d
            })) {
              _0x5be092.innerHTML = _0x5b94a5;
            }
          }
          _0x575f0c("video-model");
          _0x5e1a4f?.sync();
        }
      });
      _0x1b1750.push(_0x14eb94);
    }
    const _0x5659d6 = _0x38e2d5.workspace.step === 1 ? {
      panel: _0x318ed6?.querySelector?.(".story-asset-detail-panel .story-asset-prompt-field"),
      modelSetting: "characterImageModelId",
      providerSetting: "characterImageProvider",
      profileSetting: "characterImageProviderProfileId",
      memorySetting: "characterImageProviderProfileIdByModel"
    } : _0x38e2d5.workspace.step === 2 ? {
      panel: _0x318ed6?.querySelector?.(".person-replacement-image-generation-panel .person-replacement-prompt-input-wrapper"),
      modelSetting: "replacementImageModelId",
      providerSetting: "replacementImageProvider",
      profileSetting: "replacementImageProviderProfileId",
      memorySetting: "replacementImageProviderProfileIdByModel"
    } : _0x38e2d5.workspace.step === 3 ? {
      panel: _0x318ed6?.querySelector?.(".person-replacement-video-generation-panel .person-replacement-prompt-input-wrapper"),
      modelSetting: "replacementModelId",
      providerSetting: "",
      profileSetting: "replacementVideoProviderProfileId",
      memorySetting: "replacementVideoProviderProfileIdByModel"
    } : null;
    if (_0x5659d6?.panel) {
      _0x5e1a4f = createModelProviderProfileControl({
        panel: _0x5659d6.panel,
        getNodeData: () => ({
          model: _0x38e2d5.settings[_0x5659d6.modelSetting],
          provider: _0x5659d6.providerSetting ? _0x38e2d5.settings[_0x5659d6.providerSetting] : resolveModelProvider(_0x38e2d5.settings[_0x5659d6.modelSetting]),
          providerProfileId: _0x38e2d5.settings[_0x5659d6.profileSetting],
          providerProfileIdByModel: _0x38e2d5.settings[_0x5659d6.memorySetting]
        }),
        onChange: _0x546e31 => {
          if (_0x5659d6.profileSetting === "replacementVideoProviderProfileId" && _0x14eb94?.applyProviderProfilePatch?.(_0x546e31)) {
            return;
          }
          _0x38e2d5 = a1155_0x56b8cf({
            ..._0x38e2d5,
            settings: {
              ..._0x38e2d5.settings,
              [_0x5659d6.profileSetting]: _0x546e31.providerProfileId,
              [_0x5659d6.memorySetting]: _0x546e31.providerProfileIdByModel
            }
          });
          _0x575f0c("provider-profile");
          _0x5e1a4f?.sync();
        }
      });
      _0x1b1750.push({
        destroy: () => _0x5e1a4f?.remove()
      });
    }
  };
  const _0x592bd3 = _0x307377 => {
    const _0x682c63 = personReplacementImagePresentation.build(_0x38e2d5).selectedShot;
    if (!_0x307377 || !_0x682c63) {
      return null;
    }
    const _0x47118f = normalizeText(_0x38e2d5.id);
    const _0x386c85 = normalizeText(_0x682c63.id);
    const _0xee4612 = () => normalizeText(_0x38e2d5.id) === _0x47118f ? _0x38e2d5.shots.find(_0x2e7fbe => normalizeText(_0x2e7fbe.id) === _0x386c85) : null;
    return {
      nodeId: "person-replacement-image:" + _0x386c85,
      promptEl: _0x307377,
      keepAssetMentionPills: true,
      _data: {
        type: "ai-image",
        model: _0x38e2d5.settings.replacementImageModelId,
        provider: resolveModelProvider(_0x38e2d5.settings.replacementImageModelId, _0x38e2d5.settings.replacementImageProvider)
      },
      getMentionMenuPages: () => [{
        id: "assets",
        label: "素材",
        icon: "assets"
      }],
      getMentionMenuDefaultPage: () => "assets",
      getMentionCandidates: ({
        query = ""
      } = {}) => buildPersonReplacementPromptMentionCandidates(_0x38e2d5, {
        query: query,
        shot: _0x682c63
      }),
      getMentionVisual: ({
        mention: _0x166091,
        pill: _0x50309f
      } = {}) => {
        const _0x57fdf9 = _0x166091?.thumbUrl ? _0x166091 : resolvePersonReplacementPromptMentionRef(_0x50309f, {
          project: _0x38e2d5,
          shot: _0x682c63
        });
        return {
          thumbUrl: normalizeMediaUrl(_0x57fdf9?.thumbUrl || _0x57fdf9?.url),
          iconType: "image"
        };
      },
      commitPromptHtml: _0x423e90 => {
        if (!_0xee4612()) {
          return;
        }
        _0x38e2d5 = a1155_0x56b8cf({
          ..._0x38e2d5,
          shots: _0x38e2d5.shots.map(_0x14d886 => normalizeText(_0x14d886.id) === _0x386c85 ? {
            ..._0x14d886,
            imagePrompt: sanitizePromptHtmlForCommit(_0x423e90)
          } : _0x14d886)
        });
        _0x575f0c("image-prompt");
      },
      getPromptHtml: () => normalizeText(_0xee4612()?.imagePrompt)
    };
  };
  const _0x51e147 = () => {
    _0x3a40cf?.();
    _0x3a40cf = null;
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 2) {
      return;
    }
    const _0x3bd0f2 = _0x318ed6?.querySelector?.("[data-person-replacement-field=\"image-prompt\"][contenteditable=\"true\"]");
    const _0x57fc87 = _0x592bd3(_0x3bd0f2);
    if (!_0x57fc87) {
      return;
    }
    const _0x4caa02 = bindPromptMentionHost(_0x57fc87);
    _0x3a40cf = () => _0x4caa02?.destroy?.();
  };
  const _0x4389a0 = () => {
    _0x37c7f0?.();
    _0x37c7f0 = null;
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 2) {
      return;
    }
    const _0x22692e = _0x318ed6?.querySelector?.(".person-replacement-middle-preview-slide:not(.person-replacement-middle-preview-slide--outgoing) [data-person-replacement-keyframe-stage] > img") || _0x318ed6?.querySelector?.("[data-person-replacement-keyframe-stage] > img");
    if (!_0x22692e) {
      return;
    }
    const _0x35c7fb = () => syncPersonReplacementImageStageFrame(_0x22692e);
    if (_0x22692e.complete && Number(_0x22692e.naturalWidth) > 0) {
      _0x35c7fb();
    } else {
      _0x22692e.addEventListener?.("load", _0x35c7fb, {
        once: true
      });
    }
    const _0x545f82 = _0x22692e.closest?.("[data-person-replacement-keyframe-stage]")?.parentElement;
    const _0x34e301 = windowObject?.ResizeObserver;
    const _0x40eb80 = typeof _0x34e301 === "function" ? new _0x34e301(_0x35c7fb) : null;
    _0x40eb80?.observe?.(_0x545f82);
    windowObject?.addEventListener?.("resize", _0x35c7fb);
    _0x37c7f0 = () => {
      _0x22692e.removeEventListener?.("load", _0x35c7fb);
      _0x40eb80?.disconnect?.();
      windowObject?.removeEventListener?.("resize", _0x35c7fb);
    };
  };
  const _0x67670f = ({
    active = false
  } = {}) => {
    _0x318ed6?.classList?.toggle?.("is-voice-audio-picking", active === true);
  };
  const _0x44df78 = () => {
    _0x4516df?.();
    _0x4516df = null;
    _0xb158ca = null;
    _0x67670f();
    if (_0x38e2d5.workspace.step !== 4) {
      return;
    }
    const _0xe7f6e0 = _0x318ed6?.querySelector?.("[data-person-replacement-voice-studio-host]");
    if (!_0xe7f6e0) {
      return;
    }
    const _0xd44dcd = onVoiceStudioMount(_0xe7f6e0, {
      project: cloneJson(_0x38e2d5),
      sourceId: _0x38e2d5.workspace.selectedVoiceSourceId,
      onAudioPickStateChange: _0x67670f
    });
    const _0x1d89e3 = normalizeText(_0x38e2d5.workspace.selectedVoiceSourceId);
    const _0x10ed44 = resolvePersonReplacementVoiceSeparationState(_0x38e2d5, _0x1d89e3);
    if (_0x1d89e3 && isPersonReplacementVoiceSeparationActive(_0x10ed44)) {
      _0x443f39(onVoiceSeparationResumeRequested, _0x1d89e3, {}, {
        applyCallbackResult: false
      });
    }
    if (typeof _0xd44dcd === "function") {
      _0x4516df = () => {
        _0x67670f();
        _0xd44dcd();
      };
      return;
    }
    if (_0xd44dcd && typeof _0xd44dcd === "object") {
      _0xb158ca = _0xd44dcd;
      if (typeof _0xd44dcd.destroy === "function") {
        _0x4516df = () => {
          _0x67670f();
          _0xd44dcd.destroy();
        };
      }
    }
  };
  const _0x24806b = (_0x38d5e4, _0x15091c = {}) => {
    const _0x5252dd = _0xb158ca?.selectVoiceAsset?.(_0x38d5e4, _0x15091c);
    if (_0x5252dd?.applied) {
      _0x67670f();
    } else if (_0x5252dd?.reason === "not-picking") {
      windowObject?.showToast?.("请先点击右侧句子轨中的声音克隆入参，再选择人物素材。", "info");
    } else if (_0x5252dd?.reason === "invalid") {
      windowObject?.showToast?.("该人物音频不可用，请重新上传。", "warn");
    }
    return _0x5252dd;
  };
  const _0x3d9901 = () => {
    syncPersonReplacementVoicePreviewUi(_0x318ed6, {
      audioEl: _0x4dd8fd,
      assetId: _0x285b9d
    });
  };
  const _0x5053d5 = _0x3a0123 => {
    ["play", "pause", "timeupdate", "loadedmetadata", "durationchange", "ended"].forEach(_0x58b877 => {
      _0x3a0123.addEventListener?.(_0x58b877, _0x3d9901);
    });
  };
  const _0x3638b1 = () => {
    _0x1a8376 = null;
    if (_0x4dd8fd) {
      try {
        _0x4dd8fd.pause?.();
        _0x4dd8fd.currentTime = 0;
      } catch {}
    }
    _0x4dd8fd = null;
    _0x285b9d = "";
    _0xf2a298 = "";
    _0x3d9901();
  };
  const _0x1706ea = async _0x2a4294 => {
    const _0x4325d1 = normalizeText(_0x2a4294);
    const _0x4780b2 = _0x38e2d5.characters.find(_0x31569f => _0x31569f.id === _0x4325d1);
    const _0x3fd34a = getCharacterVoiceUrl(_0x4780b2);
    if (!_0x3fd34a || typeof windowObject?.Audio !== "function") {
      return;
    }
    _0x137278.forEach(_0x3a09d6 => {
      _0x3a09d6?.audioEl?.pause?.();
    });
    const _0x2e6cb3 = Boolean(_0x4dd8fd && _0x285b9d === _0x4325d1 && _0xf2a298 === _0x3fd34a);
    if (_0x2e6cb3 && _0x1a8376) {
      await _0x1a8376;
      return;
    }
    if (_0x2e6cb3 && _0x4dd8fd.paused === false && _0x4dd8fd.ended !== true) {
      _0x4dd8fd.pause?.();
      _0x3d9901();
      return;
    }
    if (!_0x2e6cb3) {
      _0x3638b1();
      _0x4dd8fd = new windowObject.Audio();
      _0x4dd8fd.preload = "auto";
      _0x285b9d = _0x4325d1;
      _0xf2a298 = _0x3fd34a;
      _0x5053d5(_0x4dd8fd);
    }
    const _0x4f0be1 = _0x4dd8fd;
    if (_0x4f0be1.ended) {
      _0x4f0be1.currentTime = 0;
    }
    _0x3d9901();
    let _0x386e34 = null;
    _0x386e34 = (async () => {
      try {
        const _0x1f998f = await attachMediaElementPlaybackSource(_0x4f0be1, _0x3fd34a, {
          preload: "auto",
          shouldAssign: () => _0x4dd8fd === _0x4f0be1 && _0x285b9d === _0x4325d1 && _0xf2a298 === _0x3fd34a
        });
        if (!_0x1f998f || _0x4dd8fd !== _0x4f0be1 || _0x285b9d !== _0x4325d1 || _0xf2a298 !== _0x3fd34a) {
          return;
        }
        const _0x5c3c9d = _0x4f0be1.play?.();
        if (_0x5c3c9d && typeof _0x5c3c9d.then === "function") {
          await _0x5c3c9d;
        }
        if (_0x4dd8fd === _0x4f0be1) {
          _0x3d9901();
        }
      } catch {
        if (_0x4dd8fd !== _0x4f0be1) {
          return;
        }
        _0x3638b1();
        windowObject?.showToast?.("声音参考播放失败。", "warn");
      } finally {
        if (_0x1a8376 === _0x386e34) {
          _0x1a8376 = null;
        }
      }
    })();
    _0x1a8376 = _0x386e34;
    await _0x386e34;
  };
  const _0xe7f439 = _0x1bf6bc => {
    const _0x42e8be = normalizeText(_0x1bf6bc);
    if (!_0x42e8be || _0x42e8be === _0x38e2d5.workspace.selectedVoiceSourceId || !_0x38e2d5.sources.some(_0x56fcad => _0x56fcad.id === _0x42e8be && _0x56fcad.videoRef)) {
      return cloneJson(_0x38e2d5);
    }
    if (typeof _0xb158ca?.selectSource !== "function") {
      return _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          selectedVoiceSourceId: _0x42e8be
        }
      }, "voice-source");
    }
    const _0x55aa88 = _0xb158ca.selectSource(_0x42e8be);
    if (_0x55aa88?.selected === false) {
      return cloneJson(_0x38e2d5);
    }
    _0x38e2d5 = a1155_0x56b8cf({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        selectedVoiceSourceId: _0x42e8be
      }
    });
    _0x318ed6?.querySelectorAll?.("[data-person-replacement-action=\"select-voice-source\"]")?.forEach?.(_0x2a0950 => {
      const _0x2452b3 = normalizeText(_0x2a0950.dataset?.sourceId) === _0x42e8be;
      _0x2a0950.classList?.toggle?.("is-selected", _0x2452b3);
      _0x2a0950.setAttribute?.("aria-pressed", _0x2452b3 ? "true" : "false");
      const _0x1c4524 = _0x2a0950.querySelector?.(".person-replacement-voice-source-state");
      if (_0x1c4524) {
        _0x1c4524.textContent = _0x2452b3 ? "当前" : "选择";
      }
    });
    _0x318ed6?.querySelectorAll?.("[data-person-replacement-voice-source-shell]")?.forEach?.(_0x35d0d1 => {
      _0x35d0d1.classList?.toggle?.("is-selected", normalizeText(_0x35d0d1.dataset?.sourceId) === _0x42e8be);
    });
    const _0x54e8a2 = _0x318ed6?.querySelector?.(".person-replacement-voice-asset-list");
    if (_0x54e8a2) {
      _0x54e8a2.innerHTML = renderVoiceCloneCharacterAssetCards(_0x38e2d5) || "<p class=\"person-replacement-inline-empty\">暂无已绑定的人物入参</p>";
      _0x3d9901();
    }
    _0x575f0c("voice-source");
    return cloneJson(_0x38e2d5);
  };
  const _0x1bb26b = ({
    sourceId = "",
    remountVoiceStudio = false
  } = {}) => {
    if (_0x362ce5 || _0x38e2d5.workspace.step !== 4) {
      return false;
    }
    const _0x164e69 = _0x318ed6?.querySelector?.(".person-replacement-voice-source-list");
    if (!_0x164e69) {
      return false;
    }
    const _0xbdd3c6 = normalizeText(sourceId);
    const _0x3ffb8f = documentObject?.activeElement?.closest?.("[data-person-replacement-voice-source-shell]");
    const _0x20cc3b = Boolean(_0xbdd3c6 && normalizeText(_0x3ffb8f?.dataset?.sourceId) === _0xbdd3c6);
    _0x2e4999();
    _0x164e69.innerHTML = renderVoiceCloneSourceCards(_0x38e2d5) || "<p class=\"person-replacement-inline-empty\">请先在项目首页上传视频</p>";
    _0x402151();
    if (remountVoiceStudio) {
      _0x44df78();
    }
    if (_0x20cc3b) {
      Array.from(_0x164e69.querySelectorAll?.("[data-person-replacement-action=\"extract-clean-voice\"], [data-person-replacement-action=\"cancel-voice-separation\"]") || []).find(_0x1be325 => normalizeText(_0x1be325.dataset?.sourceId) === _0xbdd3c6)?.focus?.();
    }
    return true;
  };
  const _0x3ba1fe = _0x4fa92a => {
    const _0x1363fd = normalizeText(_0x4fa92a?.dataset?.shotId);
    const _0x3293df = normalizeText(_0x4fa92a?.dataset?.personId);
    if (_0x1363fd && _0x3293df) {
      return _0x1363fd + "" + _0x3293df;
    } else {
      return "";
    }
  };
  const _0x7352c8 = () => {
    const _0x4fcc3e = Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-person-drop]") || []);
    _0x4fcc3e.forEach(_0x41560f => {
      _0x41560f.classList?.remove?.("is-frontmost");
    });
    if (!_0x2f1445) {
      return;
    }
    const _0x6505e8 = _0x4fcc3e.find(_0x199b05 => _0x3ba1fe(_0x199b05) === _0x2f1445);
    if (!_0x6505e8) {
      _0x2f1445 = "";
      return;
    }
    _0x6505e8.classList?.add?.("is-frontmost");
  };
  const _0x11127d = _0x41c94a => {
    const _0x51829f = _0x3ba1fe(_0x41c94a);
    if (!_0x51829f) {
      return;
    }
    _0x2f1445 = _0x51829f;
    _0x7352c8();
  };
  const _0x76ee5e = () => {
    const _0x201736 = Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-person-drop]") || []);
    const _0x36088d = new Set(_0x201736.map(_0x3ba1fe).filter(Boolean));
    _0x50fd35 = new Set([..._0x50fd35].filter(_0x2cf750 => _0x36088d.has(_0x2cf750)));
    _0x201736.forEach(_0x28ab24 => {
      _0x28ab24.classList?.toggle?.("is-batch-selected", _0x50fd35.has(_0x3ba1fe(_0x28ab24)));
    });
  };
  const _0x114d43 = () => {
    if (!_0x50fd35.size) {
      return false;
    }
    _0x50fd35 = new Set();
    _0x76ee5e();
    return true;
  };
  const _0x474d95 = (_0x2f3b0b, _0x58553c = []) => {
    const _0x562afb = normalizeText(_0x2f3b0b);
    _0x50fd35 = new Set((Array.isArray(_0x58553c) ? _0x58553c : []).map(normalizeText).filter(Boolean).map(_0x2a3e17 => _0x562afb + "" + _0x2a3e17));
    _0x5e89ff();
    _0x76ee5e();
  };
  const _0x3a98ad = () => {
    const _0x447875 = [];
    _0x38e2d5.shots.forEach(_0x572738 => {
      _0x572738.people?.forEach(_0x359898 => {
        const _0x36a1b3 = _0x572738.id + "" + _0x359898.id;
        if (_0x50fd35.has(_0x36a1b3)) {
          _0x447875.push({
            shotId: _0x572738.id,
            person: _0x359898
          });
        }
      });
    });
    return _0x447875;
  };
  const _0x3d7690 = () => {
    const _0xfc3de9 = _0x318ed6?.querySelector?.("[data-story-marquee-surface=\"people\"]");
    try {
      _0xfc3de9?.focus?.({
        preventScroll: true
      });
    } catch {
      _0xfc3de9?.focus?.();
    }
  };
  const _0x5eb175 = () => new Set(Array.isArray(_0x38e2d5.workspace.selectedShotIds) ? _0x38e2d5.workspace.selectedShotIds.map(normalizeText).filter(Boolean) : []);
  const _0x2d4148 = (_0x5e1b26, _0xc0101c) => _0x5e1b26.length === _0xc0101c.size && _0x5e1b26.every(_0x226c7d => _0xc0101c.has(_0x226c7d));
  const _0x58edcc = () => {
    const _0x322b66 = normalizeText(_0x38e2d5.id);
    const _0x48493e = _0x38e2d5.workspace.step === 3 ? "video" : "image";
    const _0x2ee479 = _0x5eb175();
    if (!_0x322b66 || !_0x2ee479.size) {
      return null;
    }
    return [..._0xfebc3.values()].find(_0x1109ba => _0x1109ba.projectId === _0x322b66 && _0x1109ba.kind === _0x48493e && _0x2d4148(_0x1109ba.targetShotIds, _0x2ee479)) || null;
  };
  const _0x5ca6ee = () => {
    const _0x40c2c9 = normalizeText(_0x38e2d5.id);
    const _0x1c7ee9 = _0x38e2d5.workspace.step === 3 ? "video" : "image";
    return [...new Set([..._0xfebc3.values()].filter(_0x31fefa => _0x31fefa.projectId === _0x40c2c9 && _0x31fefa.kind === _0x1c7ee9).flatMap(_0x22a142 => [..._0x22a142.generatingShotIds]))];
  };
  const _0x121a59 = () => {
    const _0x30124e = _0x58edcc();
    return {
      active: Boolean(_0x30124e),
      label: _0x30124e?.label || "",
      generatingShotIds: _0x5ca6ee(),
      cancelRequested: _0x30124e?.cancellation?.isRequested?.() === true
    };
  };
  const _0x436099 = () => Boolean(_0x58edcc());
  const _0x502ba8 = () => {
    const _0x12fb4c = _0x121a59();
    return _0x5bddd1.getWorkspacePresentation({
      shotBatchGenerationActive: _0x12fb4c.active,
      shotBatchGenerationLabel: _0x12fb4c.label,
      shotBatchGeneratingShotIds: _0x12fb4c.generatingShotIds,
      shotBatchCancelRequested: _0x12fb4c.cancelRequested,
      assetBatchGenerationActive: _0x22e4b4,
      assetBatchGenerationLabel: _0x41fe7d,
      assetBatchGeneratingCharacterIds: [..._0x385ea6],
      assetBatchCancelRequested: _0x56a1df?.isRequested?.() === true,
      canvasSyncPending: _0x3fe184,
      canvasSyncScope: _0x2a3a58,
      composeOutputPending: _0x11ed59,
      exportOutputPending: _0x48a077,
      canvasSyncOverlayInline: false,
      assetLibraryDisclosure: _0x4f8d14,
      assetUploadPendingKinds: ["character", "scene", "audio"].filter(_0x3e0b3c => _0xd94f9f.has(_0x35f067(_0x3e0b3c))),
      voiceLibraryTargetCharacterId: _0x59b80b
    });
  };
  const _0x1483e7 = () => {
    const _0x54a0fc = _0x318ed6?.querySelector?.("#person-replacement-shot-cut-smart-detect-panel");
    if (!_0x54a0fc?.style) {
      return false;
    }
    const _0x180c89 = Number(windowObject?.innerWidth || documentObject?.documentElement?.clientWidth) || 0;
    if (_0x180c89 <= 720) {
      ["top", "right", "bottom", "left"].forEach(_0x4cb1d5 => {
        _0x54a0fc.style.removeProperty?.(_0x4cb1d5);
      });
      return true;
    }
    const _0x537b6e = _0x318ed6?.querySelector?.("[data-person-replacement-action=\"toggle-shot-cut-smart-detect\"]");
    const _0x3e5196 = _0x537b6e?.getBoundingClientRect?.();
    const _0x40acfb = _0x54a0fc.getBoundingClientRect?.();
    if (!_0x3e5196 || !_0x40acfb) {
      return false;
    }
    const _0x5bead0 = Number(windowObject?.innerHeight || documentObject?.documentElement?.clientHeight) || 0;
    const _0x1e870e = 16;
    const _0x226fb3 = 8;
    const _0x36c58b = Math.max(_0x1e870e, Math.min(_0x180c89 - _0x40acfb.width - _0x1e870e, _0x3e5196.right - _0x40acfb.width));
    const _0x2ae6d6 = _0x3e5196.bottom + _0x226fb3;
    const _0x2747d3 = _0x2ae6d6 + _0x40acfb.height <= _0x5bead0 - _0x1e870e ? _0x2ae6d6 : Math.max(_0x1e870e, _0x3e5196.top - _0x40acfb.height - _0x226fb3);
    _0x54a0fc.style.setProperty?.("top", _0x2747d3 + "px");
    _0x54a0fc.style.setProperty?.("right", "auto");
    _0x54a0fc.style.setProperty?.("bottom", "auto");
    _0x54a0fc.style.setProperty?.("left", _0x36c58b + "px");
    return true;
  };
  const _0x25242e = () => {
    if (_0x3440f2.isSmartDetectOpen) {
      _0x1483e7();
    }
  };
  const _0x47685f = _0x384867 => {
    const _0x10df49 = documentObject?.createElement?.("div");
    if (!_0x10df49) {
      return null;
    }
    _0x10df49.innerHTML = String(_0x384867 || "").trim();
    return _0x10df49.firstElementChild;
  };
  const _0x18569e = () => {
    const _0x5d1c85 = _0x318ed6?.querySelector?.("[data-person-replacement-compare-card=\"replacement\"] .person-replacement-compare-media-frame");
    if (!_0x5d1c85) {
      return false;
    }
    _0x5d1c85.classList?.toggle?.("img-preview-loading", _0x11ed59);
    _0x5d1c85.setAttribute?.("aria-busy", String(_0x11ed59));
    if (_0x11ed59) {
      _0x5d1c85.setAttribute?.("inert", "");
    } else {
      _0x5d1c85.removeAttribute?.("inert");
    }
    const _0x3a33b1 = _0x5d1c85.querySelector?.(".story-asset-loading-overlay");
    if (_0x11ed59 && !_0x3a33b1) {
      const _0x3566f1 = _0x47685f(renderWorkspaceAssetLoadingOverlay({
        title: "视频合成中",
        description: "正在合成替换片段，完成后会自动显示完整视频。"
      }));
      if (_0x3566f1) {
        _0x5d1c85.appendChild?.(_0x3566f1);
      }
    } else if (!_0x11ed59) {
      _0x3a33b1?.remove?.();
    }
    return true;
  };
  const _0x357290 = (_0x41ca47, _0x29b233) => {
    if (!_0x41ca47) {
      return;
    }
    try {
      _0x41ca47.inert = _0x29b233;
    } catch {
      if (_0x29b233) {
        _0x41ca47.setAttribute?.("inert", "");
      } else {
        _0x41ca47.removeAttribute?.("inert");
      }
    }
    if (_0x29b233) {
      _0x41ca47.setAttribute?.("inert", "");
    } else {
      _0x41ca47.removeAttribute?.("inert");
    }
  };
  const _0x1a17dd = ({
    restoreFocus = true
  } = {}) => {
    _0x33a544.forEach((_0x372556, _0x5abe5b) => {
      _0x357290(_0x5abe5b, _0x372556);
    });
    _0x33a544.clear();
    _0x29ece9?.remove?.();
    _0x29ece9 = null;
    documentObject?.body?.classList?.remove?.("person-replacement-canvas-sync-active");
    _0x318ed6?.classList?.remove?.("is-canvas-sync-pending");
    _0x318ed6?.setAttribute?.("aria-busy", "false");
    if (restoreFocus && _0x318ed6?.hidden === false && _0x9d6d30 && _0x9d6d30.isConnected !== false && typeof _0x9d6d30.focus === "function") {
      try {
        _0x9d6d30.focus({
          preventScroll: true
        });
      } catch {
        _0x9d6d30.focus();
      }
    }
    _0x9d6d30 = null;
  };
  const _0x33d575 = ({
    captureFocus = false
  } = {}) => {
    if (!_0x3fe184) {
      _0x1a17dd();
      return;
    }
    const _0x5adf17 = documentObject?.body;
    if (!_0x5adf17) {
      return;
    }
    if (captureFocus) {
      const _0x47f40a = documentObject?.activeElement;
      _0x9d6d30 = _0x318ed6?.contains?.(_0x47f40a) ? _0x47f40a : null;
    }
    if (!_0x29ece9) {
      _0x29ece9 = _0x47685f(personReplacementShellPresentation.renderCanvasSyncLoadingOverlay({
        canvasSyncPending: true
      }));
      if (_0x29ece9) {
        _0x5adf17.appendChild?.(_0x29ece9);
      }
    }
    Array.from(_0x5adf17.children || []).forEach(_0x51f794 => {
      if (_0x51f794 === _0x29ece9) {
        return;
      }
      if (!_0x33a544.has(_0x51f794)) {
        _0x33a544.set(_0x51f794, Boolean(_0x51f794?.inert || _0x51f794?.hasAttribute?.("inert")));
      }
      _0x357290(_0x51f794, true);
    });
    documentObject.body?.classList?.add?.("person-replacement-canvas-sync-active");
    _0x318ed6?.classList?.add?.("is-canvas-sync-pending");
    _0x318ed6?.setAttribute?.("aria-busy", "true");
    try {
      _0x29ece9?.focus?.({
        preventScroll: true
      });
    } catch {
      _0x29ece9?.focus?.();
    }
  };
  const _0x54244d = () => "[data-person-replacement-shot-timeline-scroll]";
  const _0x5e4cee = (_0x4c8bed, _0x349d22) => {
    const _0x3cf54c = new Map(Array.from(_0x349d22?.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).map(_0x2399d0 => [normalizeText(_0x2399d0.dataset?.shotId), _0x2399d0]));
    Array.from(_0x4c8bed?.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).forEach(_0x47444f => {
      const _0x714c25 = _0x3cf54c.get(normalizeText(_0x47444f.dataset?.shotId));
      if (!_0x714c25) {
        return;
      }
      _0x47444f.className = _0x714c25.className;
      ["aria-current", "aria-pressed"].forEach(_0x2b38f6 => {
        const _0x10b135 = _0x714c25.getAttribute?.(_0x2b38f6);
        if (_0x10b135 == null) {
          _0x47444f.removeAttribute?.(_0x2b38f6);
        } else {
          _0x47444f.setAttribute?.(_0x2b38f6, _0x10b135);
        }
      });
    });
  };
  const _0x3b18c6 = _0x36ac76 => {
    const _0x5395cf = normalizeText(_0x38e2d5.workspace.selectedShotId);
    Array.from(_0x36ac76?.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).forEach(_0x5b53d2 => {
      const _0x5a7bd5 = normalizeText(_0x5b53d2.dataset?.shotId) === _0x5395cf;
      _0x5b53d2.classList?.toggle?.("is-selected", _0x5a7bd5);
      _0x5b53d2.setAttribute?.("aria-current", String(_0x5a7bd5));
    });
  };
  const _0x16127e = () => {
    _0x44c2d8();
    _0x400efa();
    _0x394541();
    _0x1b1750.forEach(_0x5bf8c6 => _0x5bf8c6?.destroy?.());
    _0x1b1750 = [];
    _0x2e4999();
    _0x3a40cf?.();
    _0x3a40cf = null;
    _0x37c7f0?.();
    _0x37c7f0 = null;
  };
  const _0x59bbd2 = () => {
    const _0x1f326d = _0x38e2d5.workspace.step === 2 && !_0x3440f2.isOpen;
    _0x182068 = _0x1f326d;
    if (_0x1f326d) {
      const _0x3608af = _0x318ed6?.querySelector?.("[data-person-replacement-keyframe-stage]");
      _0x3608af?.classList?.add?.("is-manual-selecting");
      _0x53fe32(_0x3608af);
    }
    _0x7352c8();
    _0x76ee5e();
    if (!_0x51aaf9 || !_0x26dcb0) {
      return;
    }
    const _0x3b427b = Array.from(_0x318ed6?.querySelectorAll?.(".person-replacement-detection-box[data-person-id]") || []).find(_0x330382 => _0x330382.dataset?.shotId === _0x51aaf9 && _0x330382.dataset?.personId === _0x26dcb0);
    if (_0x3b427b) {
      _0x3a3cb8(_0x3b427b);
    } else {
      _0x5e89ff();
    }
  };
  const _0xdf5c26 = _0x40c534 => {
    const _0x5dfb63 = Number(_0x40c534?.scrollLeft) || 0;
    const _0x78751f = Number(_0x40c534?.scrollTop) || 0;
    const _0xea8118 = _0x40c534?.style?.overflowAnchor || "";
    _0x40c534?.style?.setProperty?.("overflow-anchor", "none");
    const _0x3ac0e6 = () => {
      if (!_0x40c534) {
        return;
      }
      _0x40c534.scrollLeft = _0x5dfb63;
      _0x40c534.scrollTop = _0x78751f;
    };
    return () => {
      _0x3ac0e6();
      const _0x569779 = () => {
        _0x3ac0e6();
        if (_0xea8118) {
          _0x40c534?.style?.setProperty?.("overflow-anchor", _0xea8118);
        } else {
          _0x40c534?.style?.removeProperty?.("overflow-anchor");
        }
      };
      if (typeof windowObject?.requestAnimationFrame === "function") {
        windowObject.requestAnimationFrame(_0x569779);
      } else {
        _0x569779();
      }
    };
  };
  const _0x1920a8 = _0x4147a0 => {
    const _0x16ff6f = _0x121a59();
    const _0x318a27 = _0x47685f(personReplacementShotTimelinePresentation.renderTimeline(_0x38e2d5, {
      allowCutEditing: true,
      mode: "image",
      isBatchGenerating: _0x16ff6f.active,
      batchGenerationLabel: _0x16ff6f.label,
      batchGeneratingShotIds: _0x16ff6f.generatingShotIds,
      batchCancelRequested: _0x16ff6f.cancelRequested
    }));
    const _0x210244 = _0x318a27?.querySelector?.("[data-person-replacement-shot-timeline-scroll]");
    if (!_0x4147a0 || !_0x210244) {
      return false;
    }
    const _0x56a331 = _0xdf5c26(_0x4147a0);
    const _0x255814 = reconcilePersonReplacementShotTimelineCard({
      currentScroller: _0x4147a0,
      nextScroller: _0x210244,
      shotId: _0x38e2d5.workspace.selectedShotId
    });
    if (!_0x255814) {
      _0x56a331();
      return false;
    }
    _0x3b18c6(_0x4147a0);
    _0x56a331();
    return true;
  };
  const _0x3f6136 = () => {
    if (_0x38e2d5.workspace.view !== "project" || ![2, 3].includes(_0x38e2d5.workspace.step) || _0x3440f2.isOpen) {
      return false;
    }
    const _0x58c2ae = _0x38e2d5.workspace.step === 3;
    const _0x57e41c = _0x121a59();
    const _0x5f51d4 = _0x318ed6?.querySelector?.(".person-replacement-shot-timeline");
    const _0x4541a1 = _0x47685f(personReplacementShotTimelinePresentation.renderTimeline(_0x38e2d5, {
      allowCutEditing: !_0x58c2ae,
      mode: _0x58c2ae ? "video" : "image",
      isBatchGenerating: _0x57e41c.active,
      batchGenerationLabel: _0x57e41c.label,
      batchGeneratingShotIds: _0x57e41c.generatingShotIds,
      batchCancelRequested: _0x57e41c.cancelRequested
    }));
    const _0x1e0fa0 = _0x5f51d4?.querySelector?.("[data-person-replacement-shot-timeline-scroll]");
    const _0x23b0e0 = _0x4541a1?.querySelector?.("[data-person-replacement-shot-timeline-scroll]");
    const _0x48cf7c = _0x318ed6?.querySelector?.(_0x58c2ae ? "[data-person-replacement-action=\"generate-replacement-video\"]" : "[data-person-replacement-action=\"generate-replacement-image\"]");
    const _0x26968a = _0x502ba8();
    const _0x397ef3 = _0x58c2ae ? personReplacementVideoPresentation.build(_0x38e2d5) : personReplacementImagePresentation.build(_0x38e2d5, _0x26968a.shotBatchGeneratingShotIds);
    const _0x17cbfb = _0x47685f(_0x58c2ae ? personReplacementVideoPresentation.renderGenerateButton(_0x38e2d5, {
      presentation: _0x397ef3,
      ..._0x26968a
    }) : personReplacementImagePresentation.renderGenerateButton(_0x38e2d5, {
      presentation: _0x397ef3,
      ..._0x26968a
    }));
    if (!_0x5f51d4 || !_0x4541a1 || !_0x1e0fa0 || !_0x23b0e0 || !_0x48cf7c || !_0x17cbfb || typeof _0x5f51d4.replaceWith !== "function" || typeof _0x48cf7c.replaceWith !== "function") {
      return false;
    }
    const _0x36db09 = _0xdf5c26(_0x1e0fa0);
    if (!reconcilePersonReplacementShotCardList({
      currentList: _0x1e0fa0,
      nextList: _0x23b0e0
    })) {
      _0x36db09();
      return false;
    }
    _0x23b0e0.replaceWith(_0x1e0fa0);
    _0x5f51d4.replaceWith(_0x4541a1);
    _0x48cf7c.replaceWith(_0x17cbfb);
    _0x36db09();
    _0x400efa();
    return true;
  };
  const _0x1c214d = () => {
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 5 || _0x3440f2.isOpen) {
      return false;
    }
    const _0x3784d8 = _0x318ed6?.querySelector?.(".person-replacement-preview-shot-rail");
    const _0x2c4204 = _0x47685f(personReplacementCompositePreviewPresentation.renderRail(buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5)));
    const _0x15e9a0 = _0x318ed6?.querySelector?.(".person-replacement-preview-actions--toolbar");
    const _0x2b63b0 = _0x47685f(personReplacementShellPresentation.renderToolbarActions(_0x38e2d5, _0x502ba8()));
    const _0x458a27 = _0x3784d8?.querySelector?.(".person-replacement-preview-shot-list");
    const _0x3be286 = _0x2c4204?.querySelector?.(".person-replacement-preview-shot-list");
    if (!_0x3784d8 || !_0x2c4204 || !_0x15e9a0 || !_0x2b63b0 || typeof _0x3784d8.replaceWith !== "function" || typeof _0x15e9a0.replaceWith !== "function") {
      return false;
    }
    const _0x1b8550 = _0x458a27 && _0x3be286 ? _0xdf5c26(_0x458a27) : null;
    if (_0x458a27 && _0x3be286) {
      if (!reconcilePersonReplacementShotCardList({
        currentList: _0x458a27,
        nextList: _0x3be286
      })) {
        _0x1b8550?.();
        return false;
      }
      _0x3be286.replaceWith(_0x458a27);
    }
    _0x3784d8.replaceWith(_0x2c4204);
    _0x15e9a0.replaceWith(_0x2b63b0);
    _0x1b8550?.();
    return true;
  };
  const _0x379771 = () => {
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 5 || _0x3440f2.isOpen) {
      return false;
    }
    const _0x880d39 = _0x318ed6?.querySelector?.("[data-person-replacement-composite-preview]");
    const _0x47ccb4 = _0x47685f(renderCompositePreview(_0x38e2d5, _0x502ba8()));
    const _0x288909 = _0x880d39?.querySelector?.(".person-replacement-preview-shot-list");
    const _0x2e22da = _0x47ccb4?.querySelector?.(".person-replacement-preview-shot-list");
    if (!_0x880d39 || !_0x47ccb4 || !_0x288909 || !_0x2e22da || typeof _0x880d39.replaceWith !== "function" || typeof _0x2e22da.replaceWith !== "function") {
      return false;
    }
    const _0x3124ce = _0xdf5c26(_0x288909);
    if (!reconcilePersonReplacementShotCardList({
      currentList: _0x288909,
      nextList: _0x2e22da
    })) {
      _0x3124ce();
      return false;
    }
    _0x2e22da.replaceWith(_0x288909);
    _0x44c2d8();
    _0x293979();
    _0x446efc();
    _0x880d39.replaceWith(_0x47ccb4);
    _0x3124ce();
    _0x118c44();
    return true;
  };
  const _0x29245c = ({
    refreshTimelineCard = false
  } = {}) => {
    if (_0x38e2d5.workspace.view !== "project" || ![2, 3].includes(_0x38e2d5.workspace.step) || _0x3440f2.isOpen) {
      return false;
    }
    const _0x4de6cf = _0x318ed6?.querySelector?.(".person-replacement-production-page");
    const _0x47cc62 = _0x38e2d5.workspace.step === 3;
    const _0x115013 = _0x502ba8();
    const _0x31baec = _0x47685f(_0x47cc62 ? personReplacementVideoPresentation.render(_0x38e2d5, _0x115013) : personReplacementImagePresentation.render(_0x38e2d5, {
      ..._0x115013,
      omitShotTimeline: true
    }));
    const _0x3f5d2c = _0x54244d();
    const _0x326e39 = _0x4de6cf?.querySelector?.(_0x3f5d2c);
    const _0x3777aa = _0x31baec?.querySelector?.(_0x3f5d2c);
    const _0x3ca208 = _0x4de6cf?.querySelector?.(".person-replacement-middle-layout");
    const _0x190087 = _0x31baec?.querySelector?.(".person-replacement-middle-layout");
    const _0x5a9b3a = _0x3ca208?.querySelector?.("[data-person-replacement-shot-timeline-stage]");
    if (_0x47cc62) {
      if (!_0x4de6cf || !_0x31baec || !_0x326e39 || !_0x3777aa) {
        return false;
      }
      const _0xa2ef49 = _0xdf5c26(_0x326e39);
      if (!reconcilePersonReplacementVideoShotSelection({
        currentPage: _0x4de6cf,
        nextPage: _0x31baec
      })) {
        return false;
      }
      _0x16127e();
      _0xa2ef49();
      _0x59bbd2();
      _0x51e147();
      _0x281cbe();
      _0x4af0ea();
      return true;
    }
    if (!_0x326e39 || !_0x3ca208 || !_0x190087 || !_0x5a9b3a) {
      return false;
    }
    if (refreshTimelineCard && !_0x1920a8(_0x326e39)) {
      return false;
    }
    if (!refreshTimelineCard) {
      _0x3b18c6(_0x326e39);
    }
    _0x44c2d8();
    _0x400efa();
    _0x3a40cf?.();
    _0x3a40cf = null;
    if (!reconcilePersonReplacementImageShotSelection({
      currentPage: _0x4de6cf,
      nextPage: _0x31baec
    })) {
      return false;
    }
    _0x59bbd2();
    _0x51e147();
    _0x4389a0();
    return true;
  };
  const _0x1ac515 = () => {
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 3 || _0x3440f2.isOpen || _0x473164) {
      return false;
    }
    const _0x3664da = _0x318ed6?.querySelector?.(".person-replacement-production-page");
    const _0x9f8a76 = _0x47685f(personReplacementVideoPresentation.render(_0x38e2d5, _0x502ba8()));
    const _0x28dad6 = _0x3664da?.querySelector?.("[data-person-replacement-video-playback-stage=\"source\"]");
    const _0x535f56 = _0x9f8a76?.querySelector?.("[data-person-replacement-video-playback-stage=\"source\"]");
    const _0x25f9ef = shouldReusePersonReplacementVideoPlaybackStage(_0x28dad6, _0x535f56);
    const _0x4a1be6 = _0x3664da?.querySelector?.(".person-replacement-video-reference-assets");
    const _0x368e0f = _0x9f8a76?.querySelector?.(".person-replacement-video-reference-assets");
    const _0x160b3f = _0x3664da?.querySelector?.("[data-person-replacement-shot-timeline-stage]");
    const _0x13c334 = _0x9f8a76?.querySelector?.("[data-person-replacement-shot-timeline-stage]");
    const _0x5dca74 = _0x160b3f?.querySelector?.(".person-replacement-shot-timeline-scroll");
    const _0xefc117 = _0x13c334?.querySelector?.(".person-replacement-shot-timeline-scroll");
    const _0x2b1760 = _0x3664da?.querySelector?.(".person-replacement-video-generation-panel");
    const _0x53e322 = _0x9f8a76?.querySelector?.(".person-replacement-video-generation-panel");
    const _0x378910 = _0x2b1760?.querySelector?.("[data-person-replacement-video-reference-inputs]");
    const _0x28e28c = _0x53e322?.querySelector?.("[data-person-replacement-video-reference-inputs]");
    const _0xea8bca = _0x2b1760?.querySelector?.("[data-person-replacement-field=\"video-prompt\"][contenteditable=\"true\"]");
    const _0x32392c = _0x53e322?.querySelector?.("[data-person-replacement-field=\"video-prompt\"][contenteditable=\"true\"]");
    const _0x54e351 = _0x2b1760?.querySelector?.("[data-person-replacement-video-playback-stage=\"result\"]");
    const _0x1bbbe1 = _0x53e322?.querySelector?.("[data-person-replacement-video-playback-stage=\"result\"]");
    const _0x11c1e3 = shouldReusePersonReplacementVideoPlaybackStage(_0x54e351, _0x1bbbe1) && typeof _0x1bbbe1?.replaceWith === "function";
    const _0x14ba71 = _0x3664da?.querySelector?.(".person-replacement-step-footer");
    const _0x2be848 = _0x9f8a76?.querySelector?.(".person-replacement-step-footer");
    const _0x298378 = [[_0x160b3f, _0x13c334], [_0x2b1760, _0x53e322], [_0x14ba71, _0x2be848]];
    if (!_0x3664da || !_0x9f8a76 || !_0x5dca74 || !_0xefc117 || !_0x4a1be6 || !_0x368e0f || !_0x378910 || !_0x28e28c || !_0xea8bca || !_0x32392c || Boolean(_0x28dad6) !== Boolean(_0x535f56) || _0x28dad6 && _0x535f56 && !_0x25f9ef || _0x298378.some(([_0x16d98d, _0xf1dd54]) => !_0x16d98d || !_0xf1dd54 || typeof _0x16d98d.replaceWith !== "function")) {
      return false;
    }
    const _0x5ab40d = _0xdf5c26(_0x5dca74);
    if (!reconcilePersonReplacementShotCardList({
      currentList: _0x5dca74,
      nextList: _0xefc117
    })) {
      _0x5ab40d();
      return false;
    }
    _0xefc117.replaceWith(_0x5dca74);
    if (!reconcilePersonReplacementVideoControlContinuity({
      currentReferenceRail: _0x4a1be6,
      nextReferenceRail: _0x368e0f,
      currentReferenceInputs: _0x378910,
      nextReferenceInputs: _0x28e28c,
      currentPromptEditor: _0xea8bca,
      nextPromptEditor: _0x32392c
    })) {
      _0x5ab40d();
      return false;
    }
    _0x44c2d8();
    _0x400efa();
    _0x1b1750.forEach(_0x13cfa2 => _0x13cfa2?.destroy?.());
    _0x1b1750 = [];
    if (_0x11c1e3) {
      _0x1bbbe1.replaceWith(_0x54e351);
    } else {
      _0x1eb4bb("result");
    }
    _0x298378.forEach(([_0x2ffdac, _0x25be0f]) => _0x2ffdac.replaceWith(_0x25be0f));
    _0x5ab40d();
    _0x281cbe();
    if (_0x11c1e3) {
      _0x4510e2();
    } else {
      _0x4af0ea({
        roles: ["result"],
        reset: false
      });
    }
    return true;
  };
  _0x3348c9 = _0x1ed513 => {
    const _0x1c1dab = normalizeText(_0x1ed513);
    if (_0x1c1dab === "shot-marquee" || _0x1c1dab.startsWith("shot-selection")) {
      if (_0x38e2d5.workspace.step === 5) {
        return _0x1c214d();
      } else {
        return _0x3f6136();
      }
    }
    if (_0x1c1dab === "video-input-mode" || _0x1c1dab === "video-reference-change" || _0x1c1dab === "replacement-video-result" || _0x1c1dab === "delete-replacement-video-result" || (_0x1c1dab === "replacement-image-result" || _0x1c1dab === "delete-replacement-image-result") && _0x38e2d5.workspace.step === 3) {
      return _0x1ac515();
    }
    if ((_0x1c1dab === "replacement-image-result" || _0x1c1dab === "delete-replacement-image-result") && _0x38e2d5.workspace.step === 2) {
      return _0x29245c({
        refreshTimelineCard: true
      });
    }
    if (_0x1c1dab === "shot-select") {
      if (_0x38e2d5.workspace.step === 5) {
        return _0x379771();
      } else {
        return _0x29245c();
      }
    }
    if (_0x1c1dab === "replacement-image-reference" && _0x38e2d5.workspace.step === 2) {
      return _0x29245c({
        refreshTimelineCard: true
      });
    }
    if (_0x1c1dab === "composite-full-video-select") {
      return _0x379771();
    }
    return false;
  };
  let _0x3be3ab = () => {
    if (!_0x318ed6 || _0x362ce5) {
      return;
    }
    _0x4eb471 = null;
    _0x3bd0b3();
    _0x293979();
    _0x394541();
    _0x446efc();
    _0xbbc934?.destroy?.();
    _0xbbc934 = null;
    _0x413ff6();
    _0x47fee0();
    _0x246a2b();
    _0x3440f2.pendingPreviewSeek = null;
    _0x3440f2.hoverPreviewActive = false;
    _0x3440f2.hoverPreviewTimeSec = null;
    _0x40df54();
    _0x1b1750.forEach(_0x50ce03 => _0x50ce03?.destroy?.());
    _0x1b1750 = [];
    _0x2e4999();
    _0x3a40cf?.();
    _0x3a40cf = null;
    _0x4516df?.();
    _0x4516df = null;
    _0xb158ca = null;
    _0x3440f2.playheadElement = null;
    _0x3440f2.clockElement = null;
    _0x318ed6.dataset.personReplacementView = _0x38e2d5.workspace.view;
    _0x318ed6.dataset.personReplacementStep = String(_0x38e2d5.workspace.step);
    _0x318ed6.innerHTML = _0x38e2d5.workspace.view === "home" ? personReplacementShellPresentation.renderHome(_0x38e2d5) : renderProject(_0x38e2d5, _0x502ba8());
    _0x7352c8();
    _0x76ee5e();
    _0x51e147();
    _0x4389a0();
    _0x281cbe();
    _0x4af0ea();
    _0x118c44();
    _0x44df78();
    _0x3d9901();
  };
  const _0x526ede = () => _0x5bddd1.clearMotionTimer();
  const _0x5e1cb7 = () => _0x5bddd1.stopBoundaryDrag();
  const _0x530b99 = _0x5bddd1.playback;
  const _0x413ff6 = () => _0x5bddd1.stopPlayback();
  const _0x42b1ba = _0x5d2c49 => _0x530b99.isReverseActive() || _0x5d2c49?.paused === false;
  const _0x246a2b = () => {
    _0x3440f2.previewSeekToken += 1;
    _0x5bddd1.cancelPreviewFrameWait();
  };
  const _0x47fee0 = () => _0x5bddd1.clearPreviewMetadata();
  const _0x27bac0 = _0x41b27e => {
    const _0x555d77 = normalizeText(_0x41b27e);
    if (!_0x555d77) {
      return "";
    }
    const _0x1350a8 = _0x38e2d5.sources.find(_0x212742 => _0x212742.id === _0x555d77);
    const _0x353952 = _0x38e2d5.shots.find(_0x162dc1 => _0x162dc1.sourceId === _0x555d77);
    return normalizeMediaUrl(resolvePersonReplacementSourcePlaybackRef({
      runtimePreviewRef: _0x38e2d5.sourcePreviewRefs?.[_0x555d77],
      source: _0x1350a8,
      sourceShot: _0x353952
    }));
  };
  const _0x24c663 = () => _0x5bddd1.clearBufferedWarmup();
  const _0x3de366 = (_0xd6c987, _0x1662f3) => {
    _0x24c663();
    if (!_0xd6c987) {
      return false;
    }
    const _0x2fae9e = Math.max(0, Number(_0x1662f3) || 0);
    const _0x441813 = () => {
      _0x24c663();
      try {
        if (!Number.isFinite(Number(_0xd6c987.currentTime)) || Math.abs(Number(_0xd6c987.currentTime) - _0x2fae9e) > 0.02) {
          _0xd6c987.currentTime = _0x2fae9e;
        }
      } catch {}
    };
    if (Number(_0xd6c987.readyState) >= 1) {
      _0x441813();
      return true;
    }
    _0xd6c987.addEventListener?.("loadedmetadata", _0x441813, {
      once: true
    });
    _0x3440f2.bufferedWarmupCleanup = () => {
      _0xd6c987.removeEventListener?.("loadedmetadata", _0x441813);
    };
    return true;
  };
  const _0x5b86b7 = () => _0x5bddd1.releasePreviewBuffer();
  const _0x3d943d = () => {
    const _0x113656 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x113656) {
      return false;
    }
    const _0x546961 = normalizeText(_0x113656.dataset?.sourceId);
    const _0x4ab6ab = normalizeText(_0x113656.dataset?.personReplacementShotCutMediaRef || _0x27bac0(_0x546961));
    if (!_0x546961 || !_0x4ab6ab) {
      return false;
    }
    _0x3440f2.bufferedVideo = _0x113656;
    _0x3440f2.bufferedSourceId = _0x546961;
    _0x3440f2.bufferedMediaRef = _0x4ab6ab;
    _0x5bddd1.attachPreviewBuffer(_0x113656);
    try {
      _0x113656.remove?.();
    } catch {}
    return true;
  };
  const _0x482f24 = () => {
    const _0x5da297 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x5da297 || !_0x3440f2.bufferedVideo) {
      return null;
    }
    const _0x5d2644 = normalizeText(_0x5da297.dataset?.sourceId);
    const _0x6ef704 = _0x27bac0(_0x5d2644);
    if (!_0x5d2644 || !_0x6ef704 || _0x5d2644 !== _0x3440f2.bufferedSourceId || _0x6ef704 !== _0x3440f2.bufferedMediaRef || typeof _0x5da297.replaceWith !== "function") {
      _0x5b86b7();
      return null;
    }
    const _0x3135f3 = _0x3440f2.bufferedVideo;
    _0x3135f3.preload = "auto";
    _0x3135f3.playsInline = true;
    _0x3135f3.muted = !_0x3440f2.soundEnabled;
    _0x3135f3.dataset.sourceId = _0x5d2644;
    _0x3135f3.setAttribute?.("aria-label", "镜头切口预览");
    _0x3135f3.setAttribute?.("preload", "auto");
    _0x3135f3.setAttribute?.("playsinline", "");
    _0x3135f3.setAttribute?.("data-person-replacement-shot-cut-video", "");
    _0x3135f3.setAttribute?.("data-source-id", _0x5d2644);
    _0x3135f3.removeAttribute?.("aria-hidden");
    const _0x10722f = _0x5da297.getAttribute?.("poster");
    if (_0x10722f) {
      _0x3135f3.setAttribute?.("poster", _0x10722f);
    } else {
      _0x3135f3.removeAttribute?.("poster");
    }
    _0x5da297.replaceWith(_0x3135f3);
    return _0x3135f3;
  };
  const _0x296051 = (_0x4188b8, _0x454009, _0x1f3758) => {
    const _0x11d747 = normalizeText(_0x454009);
    const _0x2c22bb = normalizeMediaUrl(_0x1f3758);
    if (!_0x4188b8 || !_0x11d747 || !_0x2c22bb) {
      return false;
    }
    _0x4188b8.dataset.sourceId = _0x11d747;
    _0x4188b8.dataset.personReplacementShotCutMediaRef = _0x2c22bb;
    _0x3440f2.bufferedVideo = _0x4188b8;
    _0x3440f2.bufferedSourceId = _0x11d747;
    _0x3440f2.bufferedMediaRef = _0x2c22bb;
    const _0x282484 = () => {
      _0x5bddd1.attachPreviewBuffer(_0x4188b8, () => {});
      _0x4188b8.setAttribute?.("src", _0x2c22bb);
      try {
        _0x4188b8.load?.();
      } catch {}
      return true;
    };
    if (/^(?:blob:|data:)/i.test(_0x2c22bb)) {
      return _0x282484();
    }
    let _0x4877a6 = null;
    try {
      _0x4877a6 = createVideoPlayback({
        videoEl: _0x4188b8,
        sourceUrl: _0x2c22bb,
        ownerId: ["person-replacement", normalizeText(_0x38e2d5.id) || "project", "shot-cut-preview"].join(":"),
        allowConcurrentPlayback: true,
        preferStreamingSource: true,
        acquirePlaybackOptions: {
          bypassConcurrencyLimit: true
        }
      });
    } catch {}
    if (!_0x4877a6 || typeof _0x4877a6.warm !== "function") {
      _0x4877a6?.destroy?.();
      return _0x282484();
    }
    _0x5bddd1.attachPreviewBuffer(_0x4188b8, () => {
      if (_0x1377af === _0x4877a6) {
        _0x1377af = null;
        _0x1893b0 = null;
      }
      _0x4877a6.destroy?.();
    });
    _0x1377af = _0x4877a6;
    _0x1893b0 = _0x4188b8;
    const _0x56648a = () => {
      if (_0x362ce5 || _0x3440f2.bufferedVideo !== _0x4188b8 || normalizeText(_0x4188b8.dataset?.sourceId) !== _0x11d747 || normalizeText(_0x4188b8.getAttribute?.("src") || _0x4188b8.src)) {
        return false;
      }
      return _0x282484();
    };
    Promise.resolve(_0x4877a6.warm()).then(_0x2a5d79 => _0x2a5d79 ? true : _0x56648a(), _0x56648a);
    return true;
  };
  const _0xca3b20 = _0x14ff74 => {
    if (_0x14ff74 && _0x1893b0 === _0x14ff74 && typeof _0x1377af?.play === "function") {
      return _0x1377af.play();
    }
    return _0x14ff74?.play?.();
  };
  const _0x44b2f8 = () => {
    const _0x3a8a36 = Math.trunc(Number(_0x38e2d5.workspace.step) || 1);
    if (_0x3440f2.isOpen || _0x38e2d5.workspace.view !== "project" || ![1, 2].includes(_0x3a8a36)) {
      if (!_0x3440f2.isOpen) {
        _0x5b86b7();
      }
      return false;
    }
    const _0x3a5b61 = "auto";
    const _0x326734 = personReplacementImagePresentation.build(_0x38e2d5).selectedShot;
    const _0x4a2bbb = normalizeText(_0x326734?.sourceId);
    const _0x591a77 = _0x27bac0(_0x4a2bbb);
    const _0x1b0c38 = Math.max(0, Number(_0x326734?.startTimeSec) || 0);
    if (!_0x4a2bbb || !_0x591a77) {
      _0x5b86b7();
      return false;
    }
    if (_0x3440f2.bufferedVideo && _0x3440f2.bufferedSourceId === _0x4a2bbb && _0x3440f2.bufferedMediaRef === _0x591a77) {
      _0x3440f2.bufferedVideo.preload = _0x3a5b61;
      _0x3440f2.bufferedVideo.setAttribute?.("preload", _0x3a5b61);
      _0x3440f2.bufferedVideo.muted = true;
      _0x3de366(_0x3440f2.bufferedVideo, _0x1b0c38);
      return true;
    }
    _0x5b86b7();
    if (!documentObject?.defaultView?.HTMLVideoElement) {
      return false;
    }
    const _0x23874b = documentObject?.createElement?.("video");
    if (normalizeText(_0x23874b?.tagName).toUpperCase() !== "VIDEO") {
      return false;
    }
    _0x23874b.preload = _0x3a5b61;
    _0x23874b.playsInline = true;
    _0x23874b.muted = true;
    _0x23874b.dataset.sourceId = _0x4a2bbb;
    _0x23874b.setAttribute?.("preload", _0x3a5b61);
    _0x23874b.setAttribute?.("playsinline", "");
    _0x23874b.setAttribute?.("muted", "");
    _0x23874b.setAttribute?.("aria-hidden", "true");
    _0x296051(_0x23874b, _0x4a2bbb, _0x591a77);
    _0x3de366(_0x23874b, _0x1b0c38);
    return true;
  };
  const _0x40df54 = () => _0x5bddd1.cancelHoverPreview();
  const _0x67bb7 = () => {
    _0x5bddd1.close({
      releaseBuffer: false
    });
  };
  const _0x53ee48 = () => {
    const _0x309728 = getPersonReplacementShotCutTotalDuration(_0x3440f2.draft);
    const _0x20437a = getPersonReplacementShotCutDisplayDuration(_0x3440f2.draft);
    const _0x5f1090 = clamp(_0x3440f2.playheadSec, 0, _0x309728, 0);
    _0x3440f2.playheadSec = _0x5f1090;
    if (!_0x3440f2.playheadElement) {
      _0x3440f2.playheadElement = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-playhead]") || null;
    }
    _0x3440f2.playheadElement?.style?.setProperty?.("left", (_0x20437a > 0 ? _0x5f1090 / _0x20437a * 100 : 0) + "%");
    if (!_0x3440f2.clockElement) {
      _0x3440f2.clockElement = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-current-time]") || null;
    }
    if (_0x3440f2.clockElement) {
      _0x3440f2.clockElement.textContent = formatPreciseClock(_0x5f1090);
    }
    const _0x5888ce = _0x318ed6?.querySelector?.("[data-person-replacement-action='split-shot-cut']");
    if (_0x5888ce) {
      const _0x17ce23 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x5f1090);
      const _0x119499 = _0x3440f2.draft[_0x17ce23.shotIndex];
      const _0x3152a3 = Boolean(_0x119499 && canSplitPersonReplacementShotCutRange(_0x119499, _0x17ce23.sourceTimeSec - (Number(_0x119499.startSec) || 0)));
      const _0x9d9c3 = _0x3440f2.isSubmitting || _0x3440f2.isSmartDetecting || !_0x3152a3;
      _0x5888ce.disabled = _0x9d9c3;
      if (_0x9d9c3) {
        _0x5888ce.setAttribute?.("disabled", "");
      } else {
        _0x5888ce.removeAttribute?.("disabled");
      }
    }
  };
  const _0x2ba8cd = () => {
    const _0x5f2132 = _0x318ed6?.querySelector?.("[data-person-replacement-action='undo-shot-cut']");
    if (!_0x5f2132) {
      return;
    }
    const _0x12edcd = _0x3440f2.isSubmitting || _0x3440f2.isSmartDetecting || _0x3440f2.undoStack.length === 0;
    _0x5f2132.disabled = _0x12edcd;
    if (_0x12edcd) {
      _0x5f2132.setAttribute?.("disabled", "");
    } else {
      _0x5f2132.removeAttribute?.("disabled");
    }
  };
  const _0x9606aa = () => _0x3440f2.isSubmitting || _0x3440f2.isSmartDetecting;
  const _0x5b60e4 = () => _0x9606aa() || _0x3440f2.isKeyframeCapturing;
  const _0x290ba5 = (_0x2453bb, {
    recordHistory = true
  } = {}) => {
    if (!Array.isArray(_0x2453bb)) {
      return false;
    }
    const _0x46493c = _0x5bddd1.commitDraft(_0x2453bb, {
      recordHistory: recordHistory
    });
    if (!_0x46493c) {
      return false;
    }
    _0x2ba8cd();
    return true;
  };
  const _0x543b3a = (_0x4f8c65 = "reset", {
    clientX = Number.NaN
  } = {}) => {
    if (!_0x3440f2.isOpen) {
      return false;
    }
    const _0x8dbe40 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-timeline-scroll]");
    const _0x5f1f0b = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-timeline]");
    if (!_0x8dbe40 || !_0x5f1f0b) {
      return false;
    }
    const _0xa32194 = Math.max(0.08, Number(_0x3440f2.timelineZoom) || 1);
    const _0x43de01 = _0x4f8c65 === "reset" ? 1 : getMediaClipTimelineNextZoom({
      currentZoom: _0xa32194,
      delta: _0x4f8c65 === "in" ? -1 : 1,
      minZoom: 0.08,
      maxZoom: 6
    });
    const _0x2c8da7 = _0x8dbe40.getBoundingClientRect?.() || {
      left: 0,
      width: _0x8dbe40.clientWidth || 0
    };
    const _0x275a5b = Math.max(1, Number(_0x8dbe40.clientWidth) || Number(_0x2c8da7.width) || 1);
    const _0x2d9dfb = clamp(Number.isFinite(Number(clientX)) ? Number(clientX) - Number(_0x2c8da7.left || 0) : _0x275a5b / 2, 0, _0x275a5b, _0x275a5b / 2);
    const _0x2e3997 = getPersonReplacementShotCutDisplayDuration(_0x3440f2.draft);
    const _0x53677f = getMediaClipTimelineTrackWidthPx({
      durationSec: getPersonReplacementShotCutTotalDuration(_0x3440f2.draft),
      viewportWidthPx: PERSON_REPLACEMENT_CUT_BASE_VIEWPORT_WIDTH_PX,
      zoom: _0xa32194
    });
    const _0xf4243e = clamp((Math.max(0, Number(_0x8dbe40.scrollLeft) || 0) + _0x2d9dfb) / Math.max(1, _0x53677f) * _0x2e3997, 0, _0x2e3997, 0);
    const _0x31960d = getMediaClipTimelineTrackWidthPx({
      durationSec: getPersonReplacementShotCutTotalDuration(_0x3440f2.draft),
      viewportWidthPx: PERSON_REPLACEMENT_CUT_BASE_VIEWPORT_WIDTH_PX,
      zoom: _0x43de01
    });
    const _0x43aee1 = getMediaClipTimelineZoomScrollLeft({
      anchorSec: _0xf4243e,
      anchorX: _0x2d9dfb,
      durationSec: _0x2e3997,
      trackWidthPx: _0x31960d,
      nextContentWidthPx: _0x31960d,
      viewportWidthPx: _0x275a5b
    });
    _0x3440f2.timelineZoom = _0x43de01;
    _0x5f1f0b.style?.setProperty?.("--media-clip-track-content-width", _0x31960d + "px");
    _0x5f1f0b.style?.setProperty?.("--media-clip-timeline-content-width", _0x31960d + "px");
    const _0x3ffedc = _0x5f1f0b.querySelector?.(".person-replacement-shot-cut-ruler");
    if (_0x3ffedc) {
      _0x3ffedc.innerHTML = renderPersonReplacementShotCutRulerTicks(getPersonReplacementShotCutTotalDuration(_0x3440f2.draft), _0x31960d, _0x2e3997, getPersonReplacementShotCutRulerFrameRate(_0x3440f2.draft));
    }
    _0x8dbe40.scrollLeft = Math.max(0, Math.min(Math.max(0, _0x31960d - _0x275a5b), Number(_0x43aee1) || 0));
    _0x53ee48();
    return Math.abs(_0x43de01 - _0xa32194) > 0.0001;
  };
  const _0xdc9f26 = _0x3ba2b0 => {
    if (!_0x3440f2.isOpen || _0x9606aa()) {
      return false;
    }
    _0x3440f2.soundEnabled = !_0x3440f2.soundEnabled;
    const _0x1ce800 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (_0x1ce800) {
      _0x1ce800.muted = !_0x3440f2.soundEnabled;
    }
    const _0x58a8cc = _0x3440f2.soundEnabled ? "关闭声音" : "打开声音";
    _0x3ba2b0?.classList?.toggle?.("is-sound-enabled", _0x3440f2.soundEnabled);
    _0x3ba2b0?.setAttribute?.("aria-pressed", String(_0x3440f2.soundEnabled));
    _0x3ba2b0?.setAttribute?.("aria-label", _0x58a8cc);
    _0x3ba2b0?.setAttribute?.("data-tooltip", _0x58a8cc);
    if (_0x3ba2b0) {
      _0x3ba2b0.innerHTML = renderIcon(_0x3440f2.soundEnabled ? "soundOn" : "soundOff");
    }
    return true;
  };
  const _0x237995 = (_0x6f4505, _0x5cd355) => {
    const _0x2039b8 = onShotReverseRequested({
      shotId: normalizeText(_0x6f4505),
      isReversed: _0x5cd355 === true
    });
    _0x2039b8?.completion?.catch?.(() => {});
    return _0x2039b8;
  };
  const _0x304ca3 = () => {
    for (const _0x5056ef of _0x3440f2.draft) {
      const _0xea6a02 = normalizeText(_0x5056ef?.shotId);
      const _0x505f8b = normalizeText(_0x5056ef?.originShotId);
      const _0xc3afa8 = _0x38e2d5.shots.find(_0x522603 => _0x522603.id === _0xea6a02) || _0x38e2d5.shots.find(_0x49726b => _0x49726b.id === _0x505f8b);
      if (!_0xc3afa8 || Boolean(_0xc3afa8.isReversed) === Boolean(_0x5056ef?.isReversed)) {
        continue;
      }
      _0x237995(_0xc3afa8.id, _0x5056ef?.isReversed === true);
    }
  };
  const _0x1581b9 = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4()) {
      return false;
    }
    const _0x2aced5 = {
      draft: cloneJson(_0x3440f2.draft),
      undoStack: cloneJson(_0x3440f2.undoStack)
    };
    const _0x4d1baf = _0x3440f2.playheadSec;
    const _0x48a7d2 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    const _0x14e075 = _0x530b99.isReverseActive() || _0x48a7d2?.paused === false;
    const _0x249797 = togglePersonReplacementShotReverseAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
    if (!_0x249797 || !_0x290ba5(_0x249797.draft)) {
      return false;
    }
    _0x3440f2.previewShotId = _0x249797.position.shotId;
    try {
      _0x237995(_0x249797.position.shotId, _0x249797.isReversed);
    } catch (_0x3f706f) {
      _0x3440f2.draft = _0x2aced5.draft;
      _0x3440f2.undoStack = _0x2aced5.undoStack;
      _0x3be3ab();
      _0x21ccaa(_0x4d1baf);
      windowObject?.showToast?.(_0x3f706f?.message || "视频倒放失败，请重试。", "error");
      return false;
    }
    _0x3be3ab();
    _0x21ccaa(_0x4d1baf, {
      autoplay: _0x14e075
    });
    windowObject?.showToast?.(_0x249797.message, "success");
    return true;
  };
  const _0x44fcde = (_0x30d75e, _0x499dcc, _0x34e5cd) => {
    if (!_0x499dcc || _0x34e5cd !== _0x3440f2.previewSeekToken || _0x3440f2.pendingPreviewSeek !== _0x499dcc || _0x30d75e !== _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]")) {
      return false;
    }
    const _0x572cf9 = Number(_0x499dcc.sourceSec);
    const _0x2ffc90 = Number(_0x499dcc.presentedSourceSec);
    const _0x235ab6 = Math.max(0.04, Number(_0x499dcc.toleranceSec) || 0);
    if (_0x499dcc.seeked !== true || !Number.isFinite(_0x572cf9) || !Number.isFinite(_0x2ffc90) || Math.abs(_0x2ffc90 - _0x572cf9) > _0x235ab6) {
      return false;
    }
    _0x3440f2.pendingPreviewSeek = null;
    _0x3440f2.previewFrameReadyToken = _0x34e5cd;
    _0x3440f2.previewFrameCallbackId = null;
    _0x3440f2.previewFrameCallbackVideo = null;
    return true;
  };
  const _0x1f0980 = (_0x198d76, _0x5014ec, _0x5e7491) => {
    if (!_0x198d76 || !_0x5014ec || _0x5e7491 !== _0x3440f2.previewSeekToken || _0x3440f2.pendingPreviewSeek !== _0x5014ec) {
      return false;
    }
    _0x5bddd1.cancelPreviewFrameWait();
    if (typeof _0x198d76.requestVideoFrameCallback !== "function") {
      return false;
    }
    try {
      _0x3440f2.previewFrameCallbackVideo = _0x198d76;
      _0x3440f2.previewFrameCallbackId = _0x198d76.requestVideoFrameCallback((_0x8a7483, _0x56b3df = {}) => {
        if (_0x5e7491 !== _0x3440f2.previewSeekToken) {
          return;
        }
        _0x3440f2.previewFrameCallbackId = null;
        _0x3440f2.previewFrameCallbackVideo = null;
        const _0x33a962 = Number(_0x56b3df?.mediaTime);
        _0x5014ec.presentedSourceSec = Number.isFinite(_0x33a962) ? _0x33a962 : Number(_0x198d76.currentTime);
        if (_0x44fcde(_0x198d76, _0x5014ec, _0x5e7491)) {
          _0x57a8f7(_0x198d76);
        }
      });
      return true;
    } catch {
      _0x3440f2.previewFrameCallbackId = null;
      _0x3440f2.previewFrameCallbackVideo = null;
      return false;
    }
  };
  const _0x4c0d1b = (_0x5041fc, _0x1ca518, {
    timelineSec = null,
    autoplay = false,
    hover = false,
    preservePlayhead = false
  } = {}) => {
    const _0x2540b9 = normalizeText(_0x5041fc);
    const _0x3dfcc0 = _0x3440f2.draft.find(_0x1644e7 => normalizeText(_0x1644e7?.shotId) === _0x2540b9);
    const _0x349639 = _0x38e2d5.shots.find(_0x1b882e => _0x1b882e.id === _0x2540b9) || _0x38e2d5.shots.find(_0x4774bc => _0x4774bc.id === normalizeText(_0x3dfcc0?.originShotId));
    const _0x340ef7 = _0x27bac0(_0x349639?.sourceId);
    const _0x32dea4 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x349639 || !_0x340ef7 || !_0x32dea4) {
      return false;
    }
    const _0x251a2e = _0x3dfcc0?.shotId || _0x349639.id;
    const _0x53ae8c = Math.max(PERSON_REPLACEMENT_CUT_MIN_SEC, 1 / Math.max(1, Number(_0x3dfcc0?.outputFps) || PERSON_REPLACEMENT_CUT_DEFAULT_FPS));
    _0x246a2b();
    const _0x1ee52b = _0x3440f2.previewSeekToken;
    const _0x3fa9d4 = timelineSec !== null && timelineSec !== undefined && Number.isFinite(Number(timelineSec));
    const _0x1d628b = _0x3fa9d4 ? clamp(Number(timelineSec), 0, getPersonReplacementShotCutTotalDuration(_0x3440f2.draft), 0) : getPersonReplacementShotCutTimelineSec(_0x3440f2.draft, _0x251a2e, _0x1ca518);
    if (!hover) {
      _0x3440f2.hoverPreviewActive = false;
      _0x3440f2.hoverPreviewTimeSec = null;
      _0x3440f2.previewShotId = _0x251a2e;
      _0x3440f2.pendingPreviewSeek = {
        rangeId: _0x251a2e,
        sourceSec: Number(_0x1ca518) || 0,
        kind: preservePlayhead ? "boundary-preview" : "playhead",
        token: _0x1ee52b,
        toleranceSec: Math.max(0.04, _0x53ae8c * 2),
        seeked: false,
        presentedSourceSec: Number.NaN
      };
      if (!preservePlayhead) {
        _0x3440f2.playheadSec = _0x1d628b;
        _0x53ee48();
      }
      _0x318ed6?.querySelectorAll?.("[data-person-replacement-cut-shot-index]")?.forEach?.(_0x117612 => {
        const _0x1b6b91 = _0x117612.dataset?.shotId === _0x251a2e;
        _0x117612.classList?.toggle?.("is-previewing", _0x1b6b91);
        _0x117612.setAttribute?.("aria-pressed", String(_0x1b6b91));
        if (_0x1b6b91) {
          _0x117612.setAttribute?.("data-selected-clip", "true");
        } else {
          _0x117612.removeAttribute?.("data-selected-clip");
        }
      });
    } else {
      _0x3440f2.pendingPreviewSeek = {
        rangeId: _0x251a2e,
        sourceSec: Number(_0x1ca518) || 0,
        kind: "hover",
        token: _0x1ee52b,
        toleranceSec: Math.max(0.04, _0x53ae8c * 2),
        seeked: false,
        presentedSourceSec: Number.NaN
      };
    }
    const _0x540f51 = normalizeMediaUrl(_0x340ef7);
    const _0x407179 = _0x32dea4.dataset?.sourceId !== _0x349639.sourceId;
    let _0x1e0c9c = false;
    const _0x4e1f49 = () => {
      if (!autoplay || _0x3dfcc0?.isReversed === true || _0x1e0c9c) {
        return;
      }
      _0x1e0c9c = true;
      try {
        const _0x5bf7c0 = _0xca3b20(_0x32dea4);
        Promise.resolve(_0x5bf7c0).then(_0x34bd27 => {
          if (_0x34bd27 === false) {
            _0x1e0c9c = false;
          }
        }, () => {
          _0x1e0c9c = false;
        });
      } catch {
        _0x1e0c9c = false;
      }
    };
    const _0x1aec0c = () => {
      _0x47fee0();
      const _0xe76476 = _0x3440f2.pendingPreviewSeek;
      let _0x31155d = false;
      try {
        const _0x1653a8 = Math.max(0, Number(_0x1ca518) || 0);
        if (!Number.isFinite(Number(_0x32dea4.currentTime)) || Math.abs(Number(_0x32dea4.currentTime) - _0x1653a8) > 0.02) {
          _0x32dea4.currentTime = _0x1653a8;
          _0x31155d = true;
        }
      } catch {}
      if (_0xe76476 && !_0x31155d) {
        _0xe76476.seeked = _0x32dea4.seeking !== true;
      }
      let _0x14f311 = false;
      if (_0xe76476 && !_0x31155d && !_0x407179) {
        _0xe76476.presentedSourceSec = Number(_0x32dea4.currentTime);
        _0x44fcde(_0x32dea4, _0xe76476, _0x1ee52b);
      } else {
        _0x14f311 = _0x1f0980(_0x32dea4, _0xe76476, _0x1ee52b);
      }
      if (_0xe76476 && !_0x14f311) {
        _0xe76476.presentedSourceSec = Number(_0x32dea4.currentTime);
        _0x44fcde(_0x32dea4, _0xe76476, _0x1ee52b);
      }
      if (autoplay && _0x3dfcc0?.isReversed === true) {
        _0x530b99.startReverse(_0x32dea4, _0x1d628b);
      } else {
        _0x4e1f49();
      }
    };
    _0x32dea4.preload = "auto";
    _0x32dea4.muted = !_0x3440f2.soundEnabled;
    _0x47fee0();
    if (_0x407179) {
      _0x413ff6();
      _0x296051(_0x32dea4, _0x349639.sourceId, _0x540f51);
      _0x32dea4.addEventListener?.("loadedmetadata", _0x1aec0c, {
        once: true
      });
      _0x3440f2.previewMetadataCleanup = () => {
        _0x32dea4.removeEventListener?.("loadedmetadata", _0x1aec0c);
      };
    } else if (Number(_0x32dea4.readyState) >= 1) {
      _0x1aec0c();
    } else {
      _0x32dea4.addEventListener?.("loadedmetadata", _0x1aec0c, {
        once: true
      });
      _0x3440f2.previewMetadataCleanup = () => {
        _0x32dea4.removeEventListener?.("loadedmetadata", _0x1aec0c);
      };
      _0x4e1f49();
    }
    if (autoplay && _0x3dfcc0?.isReversed !== true) {
      _0x530b99.startNative(_0x32dea4);
    }
    return true;
  };
  const _0x21ccaa = (_0x2bf747, {
    autoplay = false
  } = {}) => {
    if (!_0x3440f2.isOpen || _0x9606aa() || _0x3440f2.isKeyframeCapturing) {
      return false;
    }
    const _0x1ff7df = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x2bf747);
    if (_0x1ff7df.shotIndex < 0) {
      return false;
    }
    return _0x4c0d1b(_0x1ff7df.shotId, _0x1ff7df.sourceTimeSec, {
      timelineSec: _0x1ff7df.timelineSec,
      autoplay: autoplay
    });
  };
  const _0x84883a = () => {
    if (!_0x3440f2.isOpen || _0x9606aa() || _0x3440f2.isKeyframeCapturing) {
      return false;
    }
    const _0x416267 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x416267) {
      return false;
    }
    if (_0x42b1ba(_0x416267)) {
      _0x416267.pause?.();
      _0x413ff6();
      return true;
    }
    const _0x4c6a60 = getPersonReplacementShotCutTotalDuration(_0x3440f2.draft);
    const _0x480e90 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
    const _0xcf9f25 = Math.max(PERSON_REPLACEMENT_CUT_MIN_SEC, 1 / Math.max(1, Number(_0x3440f2.draft[_0x480e90.shotIndex]?.outputFps) || PERSON_REPLACEMENT_CUT_DEFAULT_FPS));
    if (_0x3440f2.playheadSec >= _0x4c6a60 - _0xcf9f25 / 2) {
      _0x3440f2.playheadSec = 0;
    }
    _0x3440f2.hoverPreviewActive = false;
    _0x3440f2.hoverPreviewTimeSec = null;
    _0x40df54();
    const _0x198049 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-hover-playhead]");
    if (_0x198049) {
      _0x198049.hidden = true;
      _0x198049.classList?.remove?.("is-visible");
    }
    return _0x21ccaa(_0x3440f2.playheadSec, {
      autoplay: true
    });
  };
  const _0x25ddd5 = (_0x918fee, _0xf25be2 = 1) => {
    const _0x1aba29 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
    const _0x205a3a = Math.max(1, Number(_0x3440f2.draft[_0x1aba29.shotIndex]?.outputFps) || PERSON_REPLACEMENT_CUT_DEFAULT_FPS);
    return _0x21ccaa(_0x3440f2.playheadSec + (Number(_0x918fee) < 0 ? -1 : 1) * Math.max(1, Number(_0xf25be2) || 1) / _0x205a3a);
  };
  const _0x4fed9f = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4()) {
      return false;
    }
    if (!_0x5bddd1.splitAtPlayhead()) {
      windowObject?.showToast?.("请把播放头放在片段中间再裁剪。", "warn");
      return false;
    }
    const _0x288b6f = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
    _0x3440f2.previewShotId = _0x288b6f.shotId;
    _0x3be3ab();
    _0x4c0d1b(_0x288b6f.shotId, _0x288b6f.sourceTimeSec, {
      timelineSec: _0x3440f2.playheadSec
    });
    return true;
  };
  const _0x98d29d = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4()) {
      return false;
    }
    if (!_0x5bddd1.mergeSelectedRanges()) {
      return false;
    }
    const _0x1e3e64 = _0x3440f2.draft.find(_0x118363 => normalizeText(_0x118363?.shotId) === normalizeText(_0x3440f2.previewShotId));
    _0x3be3ab();
    if (_0x1e3e64) {
      _0x4c0d1b(_0x1e3e64.shotId, _0x1e3e64.startSec, {
        timelineSec: _0x3440f2.playheadSec
      });
    }
    return true;
  };
  const _0x223192 = async () => {
    if (!_0x3440f2.isOpen || _0x9606aa() || _0x3440f2.isKeyframeCapturing) {
      return false;
    }
    const _0x1ef3c3 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
    const _0x7dc435 = _0x3440f2.draft[_0x1ef3c3.shotIndex];
    const _0x559303 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x7dc435 || !_0x559303) {
      windowObject?.showToast?.("当前片段画面不可用。", "warn");
      return false;
    }
    const _0x32fb79 = {
      projectId: normalizeText(_0x38e2d5.id),
      rangeId: normalizeText(_0x7dc435.shotId),
      originRangeId: normalizeText(_0x7dc435.originShotId || _0x7dc435.shotId),
      sourceId: normalizeText(_0x7dc435.sourceId),
      sourceTimeSec: _0x1ef3c3.sourceTimeSec,
      timelineSec: _0x1ef3c3.timelineSec,
      seekToken: _0x3440f2.previewSeekToken,
      video: _0x559303
    };
    if (_0x3440f2.pendingPreviewSeek || _0x3440f2.previewFrameReadyToken !== _0x32fb79.seekToken || _0x559303.seeking === true || Math.abs(Number(_0x559303.currentTime) - _0x32fb79.sourceTimeSec) > 0.04) {
      windowObject?.showToast?.("当前画面仍在定位，请稍后再获取关键帧。", "info");
      return false;
    }
    _0x3440f2.isKeyframeCapturing = true;
    const _0x39fa65 = _0x318ed6?.querySelectorAll?.(["[data-person-replacement-action='capture-shot-keyframe']", "[data-person-replacement-action='split-shot-cut']", "[data-person-replacement-action='toggle-shot-cut-reverse']", "[data-person-replacement-action='merge-shot-cuts']", "[data-person-replacement-action='undo-shot-cut']", "[data-person-replacement-action='reset-shot-cuts']", "[data-person-replacement-action='cancel-shot-cuts']", "[data-person-replacement-action='confirm-shot-cuts']"].join(", ")) || [];
    _0x39fa65.forEach(_0x451b8a => _0x451b8a.setAttribute("disabled", ""));
    const _0x51a828 = _0x318ed6?.querySelector?.("[data-person-replacement-action='capture-shot-keyframe']");
    _0x51a828?.setAttribute?.("aria-busy", "true");
    _0x51a828?.classList?.add?.("is-loading");
    try {
      const _0x13decd = await waitForVideoFrame(_0x559303, {
        timeoutMs: 10000
      });
      if (!_0x13decd) {
        throw new Error("当前视频画面尚未加载完成");
      }
      const _0x5e45b3 = await captureVideoFrameSnapshot(_0x559303, {
        type: "image/png",
        fileNamePrefix: "person_replacement_" + (normalizeText(_0x7dc435.shotId) || "shot")
      });
      const _0xd9371e = windowObject?.File || globalThis.File;
      let _0x51cd1f = _0x5e45b3.blob;
      if (typeof _0xd9371e === "function") {
        _0x51cd1f = new _0xd9371e([_0x5e45b3.blob], _0x5e45b3.fileName, {
          type: _0x5e45b3.type || "image/png"
        });
      } else {
        try {
          Object.defineProperty(_0x51cd1f, "name", {
            configurable: true,
            value: _0x5e45b3.fileName
          });
        } catch {}
      }
      const _0x34311e = await onShotKeyframeSelected(_0x51cd1f, {
        shotId: _0x32fb79.rangeId,
        originShotId: _0x32fb79.originRangeId,
        keyframeTimeSec: _0x32fb79.sourceTimeSec,
        frame: {
          width: _0x5e45b3.width,
          height: _0x5e45b3.height
        }
      });
      const _0x1c3d0c = normalizeText(_0x34311e?.keyframeRef || _0x34311e?.localPath || _0x34311e?.imageUrl || _0x34311e?.url || _0x34311e);
      if (!_0x1c3d0c) {
        throw new Error("关键帧保存结果缺少可用地址");
      }
      if (!_0x3440f2.isOpen || normalizeText(_0x38e2d5.id) !== _0x32fb79.projectId || _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]") !== _0x32fb79.video) {
        return false;
      }
      const _0x30fbd3 = _0x3440f2.draft.find(_0x3479cb => normalizeText(_0x3479cb?.shotId) === _0x32fb79.rangeId);
      if (!_0x30fbd3 || normalizeText(_0x30fbd3.sourceId) !== _0x32fb79.sourceId) {
        return false;
      }
      _0x290ba5(_0x3440f2.draft.map(_0x28f361 => normalizeText(_0x28f361?.shotId) === _0x32fb79.rangeId ? {
        ..._0x28f361,
        keyframeRef: _0x1c3d0c,
        keyframeTimeSec: _0x32fb79.sourceTimeSec,
        keyframeManuallySelected: true,
        frame: {
          width: _0x5e45b3.width,
          height: _0x5e45b3.height
        }
      } : _0x28f361));
      _0x3440f2.previewShotId = _0x32fb79.rangeId;
      _0x3440f2.playheadSec = _0x32fb79.timelineSec;
      _0x3440f2.isKeyframeCapturing = false;
      windowObject?.showToast?.("已将当前关键帧设为该片段的替换帧，应用切口后生效。", "success");
      _0x3be3ab();
      _0x4c0d1b(_0x32fb79.rangeId, _0x32fb79.sourceTimeSec, {
        timelineSec: _0x32fb79.timelineSec
      });
      return true;
    } catch (_0x8f5cb0) {
      windowObject?.showToast?.(_0x8f5cb0?.message || "获取关键帧失败，请重试。", "error");
      return false;
    } finally {
      if (_0x3440f2.isKeyframeCapturing) {
        _0x3440f2.isKeyframeCapturing = false;
        _0x3be3ab();
      }
    }
  };
  const _0x57a8f7 = _0x5eccc9 => {
    if (!_0x3440f2.isOpen || !_0x5eccc9 || _0x3440f2.boundaryDrag) {
      return;
    }
    const _0x274843 = _0x3440f2.pendingPreviewSeek;
    const _0x2b9b3a = _0x274843?.rangeId || _0x3440f2.previewShotId;
    const _0x17f274 = _0x3440f2.draft.findIndex(_0x203506 => normalizeText(_0x203506?.shotId) === normalizeText(_0x2b9b3a));
    const _0x1bd16f = _0x3440f2.draft[_0x17f274];
    if (!_0x1bd16f) {
      return;
    }
    const _0x449e2b = Number(_0x5eccc9.currentTime);
    if (!Number.isFinite(_0x449e2b)) {
      return;
    }
    if (_0x530b99.isReverseActive()) {
      _0x53ee48();
      return;
    }
    const _0x127e88 = Math.max(PERSON_REPLACEMENT_CUT_MIN_SEC, 1 / Math.max(1, Number(_0x1bd16f.outputFps) || PERSON_REPLACEMENT_CUT_DEFAULT_FPS));
    if (_0x274843) {
      if (Number(_0x274843.token) !== _0x3440f2.previewSeekToken) {
        return;
      }
      if (_0x3440f2.previewFrameReadyToken !== Number(_0x274843.token)) {
        return;
      }
    }
    if (_0x3440f2.hoverPreviewActive && _0x5eccc9.paused !== false) {
      return;
    }
    if (_0x449e2b >= Number(_0x1bd16f.endSec) - _0x127e88 / 2) {
      const _0x5978d2 = _0x3440f2.draft[_0x17f274 + 1];
      if (_0x5eccc9.paused === false && _0x5978d2) {
        const _0x11ee4e = getPersonReplacementShotCutTimelineSec(_0x3440f2.draft, _0x5978d2.shotId, _0x5978d2.startSec);
        _0x4c0d1b(_0x5978d2.shotId, _0x5978d2.startSec, {
          timelineSec: _0x11ee4e,
          autoplay: true
        });
        return;
      }
      if (!_0x5978d2) {
        _0x3440f2.playheadSec = getPersonReplacementShotCutTotalDuration(_0x3440f2.draft);
        _0x5eccc9.pause?.();
        _0x53ee48();
        return;
      }
    }
    _0x3440f2.playheadSec = getPersonReplacementShotCutTimelineSec(_0x3440f2.draft, _0x1bd16f.shotId, _0x449e2b);
    _0x53ee48();
  };
  const _0x36ed23 = (_0x4f158a, _0xdff7da) => {
    _0x526ede();
    _0x3440f2.motionTimer = windowObject?.setTimeout?.(() => {
      _0x3440f2.motionTimer = 0;
      if (_0x3440f2.motion !== _0x4f158a) {
        return;
      }
      _0xdff7da();
    }, 560) || 0;
  };
  const _0x49beb4 = _0x4aa5f7 => {
    _0x67bb7();
    _0x5bddd1.open(_0x38e2d5, _0x4aa5f7);
    _0x3440f2.isOpen = true;
    _0x3440f2.motion = "to-editor";
    _0x3440f2.draft = _0x4aa5f7;
    _0x3440f2.initialDraft = cloneJson(_0x4aa5f7);
    _0x3440f2.previewShotId = _0x38e2d5.workspace.selectedShotId || _0x4aa5f7[0]?.shotId || "";
    _0x3be3ab();
    _0x4c0d1b(_0x3440f2.previewShotId, _0x4aa5f7.find(_0x3a68da => _0x3a68da.shotId === _0x3440f2.previewShotId)?.startSec);
    _0x36ed23("to-editor", () => {
      _0x3440f2.motion = "";
      if (_0x3440f2.isOpen) {
        const _0x17e794 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-timeline-stage]");
        const _0x19cd55 = _0x17e794?.querySelector?.(".person-replacement-shot-timeline-cube");
        _0x17e794?.classList?.remove?.("is-animating");
        _0x17e794?.classList?.add?.("is-settled");
        _0x19cd55?.classList?.remove?.("is-flipping-to-editor");
        const _0xca5743 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
        if (_0xca5743.shotIndex >= 0) {
          _0x4c0d1b(_0xca5743.shotId, _0xca5743.sourceTimeSec, {
            timelineSec: _0x3440f2.playheadSec
          });
        }
      }
    });
    return true;
  };
  const _0x506fd8 = () => {
    _0x3440f2.openingCleanup?.();
    _0x3440f2.openingCleanup = null;
    if (!_0x3440f2.isOpening) {
      return false;
    }
    _0x44b2f8();
    const _0x49f41c = _0x3440f2.bufferedVideo;
    if (!_0x49f41c) {
      return false;
    }
    const _0x4decc0 = ["loadeddata", "canplay", "canplaythrough", "seeked", "progress"];
    let _0x48d39a = 0;
    const _0xe28510 = () => {
      if (_0x48d39a) {
        windowObject?.clearTimeout?.(_0x48d39a);
        _0x48d39a = 0;
      }
      _0x4decc0.forEach(_0x12f5ff => {
        _0x49f41c.removeEventListener?.(_0x12f5ff, _0x130aa2);
      });
      _0x49f41c.removeEventListener?.("error", _0x34a04a);
      _0x49f41c.removeEventListener?.("abort", _0x34a04a);
    };
    const _0x130aa2 = () => {
      if (!_0x3440f2.isOpening || _0x49f41c !== _0x3440f2.bufferedVideo || !_0x2e9a33(_0x49f41c)) {
        return;
      }
      _0xe28510();
      _0x3440f2.openingCleanup = null;
      _0x3440f2.isOpening = false;
      Promise.resolve().then(() => {
        if (!_0x362ce5 && !_0x3440f2.isOpen) {
          _0x919456();
        }
      });
    };
    const _0x34a04a = () => {
      if (!_0x3440f2.isOpening || _0x49f41c !== _0x3440f2.bufferedVideo) {
        return;
      }
      _0xe28510();
      _0x3440f2.openingCleanup = null;
      _0x3440f2.isOpening = false;
      _0x5b86b7();
      _0x3be3ab();
      windowObject?.showToast?.("裁剪预览视频加载失败，请稍后重试。", "warn");
    };
    _0x4decc0.forEach(_0x2655ea => {
      _0x49f41c.addEventListener?.(_0x2655ea, _0x130aa2);
    });
    _0x49f41c.addEventListener?.("error", _0x34a04a);
    _0x49f41c.addEventListener?.("abort", _0x34a04a);
    _0x48d39a = windowObject?.setTimeout?.(_0x34a04a, PERSON_REPLACEMENT_CUT_PREVIEW_READY_TIMEOUT_MS) || 0;
    _0x3440f2.openingCleanup = _0xe28510;
    _0x130aa2();
    return true;
  };
  const _0x919456 = () => {
    const _0x3c3488 = createPersonReplacementShotCutDraft(_0x38e2d5);
    if (!_0x3c3488.length || !a1155_0x23e0e7(_0x3c3488) && !hasSplittablePersonReplacementShotCut(_0x3c3488)) {
      windowObject?.showToast?.("当前时间轴没有可调整或新增的切口。", "warn");
      return false;
    }
    if (_0x3440f2.isOpening) {
      return false;
    }
    const _0x101b08 = Boolean(documentObject?.defaultView?.HTMLVideoElement);
    const _0x422d61 = _0x44b2f8();
    if (!_0x101b08) {
      return _0x49beb4(_0x3c3488);
    }
    if (!_0x422d61 || !_0x3440f2.bufferedVideo) {
      windowObject?.showToast?.("当前视频片段尚未准备完成。", "warn");
      return false;
    }
    if (_0x2e9a33(_0x3440f2.bufferedVideo)) {
      return _0x49beb4(_0x3c3488);
    }
    _0x3440f2.isOpening = true;
    _0x3be3ab();
    return false;
  };
  const _0x54af74 = ({
    animate = true,
    renderWorkspace = true
  } = {}) => {
    if (_0x3440f2.isOpening) {
      _0x67bb7();
      if (renderWorkspace) {
        _0x3be3ab();
      }
      return true;
    }
    if (!_0x3440f2.isOpen && !_0x3440f2.motion) {
      return false;
    }
    _0x5e1cb7();
    _0x526ede();
    if (!animate) {
      _0x67bb7();
      _0x400efa();
      if (renderWorkspace) {
        _0x3be3ab();
      }
      return true;
    }
    _0x3440f2.motion = "to-timeline";
    if (renderWorkspace) {
      _0x3be3ab();
    }
    _0x36ed23("to-timeline", () => {
      _0x67bb7();
      if (renderWorkspace) {
        _0x3be3ab();
        _0x5082ca(_0x38e2d5.workspace.selectedShotId);
      }
    });
    return true;
  };
  const _0x2c21fb = _0x3beea3 => {
    const _0x130779 = Math.trunc(clamp(_0x3beea3, 1, 5, _0x38e2d5.workspace.step));
    if (_0x130779 > _0x38e2d5.workspace.step && _0x4fe314()) {
      _0x43f5cd("step-change", _0x130779);
      return cloneJson(_0x38e2d5);
    }
    const _0x6752b3 = getPersonReplacementStepGate(_0x38e2d5, _0x130779);
    if (_0x130779 !== _0x38e2d5.workspace.step && !_0x6752b3.allowed) {
      _0x43f5cd(_0x6752b3.reason, _0x130779);
      return cloneJson(_0x38e2d5);
    }
    _0x54af74({
      animate: false,
      renderWorkspace: false
    });
    return _0x1ef913({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        step: _0x130779
      }
    }, "step-change");
  };
  const _0x2530e8 = _0x218828 => handleWorkspaceStepShortcut(_0x218828, {
    enabled: Boolean(_0x318ed6 && !_0x318ed6.hidden && !_0x3fe184 && _0x38e2d5.workspace.view === "project"),
    stepCount: PERSON_REPLACEMENT_STEPS.length,
    navigate: _0x2c21fb
  });
  const _0xc490af = _0x11864c => {
    const _0x40a975 = _0x5026bd();
    const _0x1f4285 = getWorkspaceAssetAppearances(_0x40a975);
    if (_0x1f4285.length < 2) {
      return;
    }
    const _0x50c9d2 = Math.trunc(Number(_0x38e2d5.workspace.assetAppearanceIndexes?.[_0x40a975.id]) || 0);
    const _0xd0f70f = (_0x50c9d2 + _0x11864c + _0x1f4285.length) % _0x1f4285.length;
    const _0x4ca0ee = _0x11864c > 0 ? "next" : "previous";
    const _0x341b31 = _0x318ed6?.querySelector?.(".story-asset-detail .story-asset-preview-slide")?.cloneNode?.(true);
    _0x1ef913({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        assetAppearanceIndexes: {
          ..._0x38e2d5.workspace.assetAppearanceIndexes,
          [_0x40a975.id]: _0xd0f70f
        }
      }
    }, "appearance-change");
    const _0x34f57c = _0x318ed6?.querySelector?.(".story-asset-detail");
    const _0x4fc301 = _0x34f57c?.querySelector?.(".story-asset-preview-slide");
    if (!_0x34f57c || !_0x4fc301) {
      return;
    }
    _0x34f57c.classList.remove("is-sliding-next", "is-sliding-previous");
    if (_0x341b31) {
      _0x341b31.classList.remove("img-preview-loading");
      _0x341b31.classList.add("story-asset-preview-slide--outgoing", "is-sliding-" + _0x4ca0ee);
      _0x341b31.removeAttribute?.("aria-busy");
      _0x341b31.setAttribute?.("aria-hidden", "true");
      _0x341b31.querySelector?.(".img-loading-overlay")?.remove?.();
      _0x4fc301.after?.(_0x341b31);
      const _0x1ea420 = () => _0x341b31.remove?.();
      _0x341b31.addEventListener?.("animationend", _0x1ea420, {
        once: true
      });
      windowObject?.setTimeout?.(_0x1ea420, 460);
    }
    _0x34f57c.offsetWidth;
    _0x34f57c.classList.add("is-sliding-" + _0x4ca0ee);
  };
  const _0xad8cc9 = _0x3b869a => {
    const _0x5b612a = getPersonReplacementProjectAudioAssets(_0x38e2d5).find(_0x23d671 => _0x23d671.id === _0x38e2d5.workspace.selectedAudioAssetId);
    const _0x5be32b = getPersonReplacementVoiceLibraryBoundCharacters(_0x38e2d5, _0x5b612a);
    if (_0x5be32b.length < 2) {
      return;
    }
    const _0x4e2a11 = Math.max(0, _0x5be32b.findIndex(_0x37b12c => _0x37b12c.id === _0x38e2d5.workspace.selectedCharacterId));
    const _0x12f655 = (_0x4e2a11 + _0x3b869a + _0x5be32b.length) % _0x5be32b.length;
    _0x1ef913({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        selectedCharacterId: _0x5be32b[_0x12f655].id
      }
    }, "audio-bound-character-change");
  };
  const _0x5082ca = _0x5b062c => {
    const _0x5b68c3 = () => {
      Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).find(_0x47050d => _0x47050d.dataset?.shotId === normalizeText(_0x5b062c))?.scrollIntoView?.({
        block: "nearest",
        inline: "nearest"
      });
    };
    if (typeof windowObject?.requestAnimationFrame === "function") {
      windowObject.requestAnimationFrame(_0x5b68c3);
    } else {
      _0x5b68c3();
    }
  };
  const _0x3bb951 = _0x305f8d => {
    const _0x25080c = _0x38e2d5.shots.findIndex(_0x10f927 => _0x10f927.id === normalizeText(_0x38e2d5.workspace.selectedShotId));
    const _0x2f9253 = _0x38e2d5.shots.findIndex(_0x1c8450 => _0x1c8450.id === normalizeText(_0x305f8d));
    if (_0x25080c < 0 || _0x2f9253 < 0 || _0x25080c === _0x2f9253) {
      return "";
    }
    if (_0x2f9253 > _0x25080c) {
      return "next";
    } else {
      return "previous";
    }
  };
  const _0x585f91 = () => _0x318ed6?.querySelector?.(".person-replacement-image-generation-panel .person-replacement-image-preview-slide:not(.person-replacement-image-preview-slide--outgoing)")?.cloneNode?.(true) || null;
  const _0x49c83c = () => _0x318ed6?.querySelector?.(".person-replacement-middle-layout > .person-replacement-middle-preview-slide:not(.person-replacement-middle-preview-slide--outgoing)")?.cloneNode?.(true) || null;
  const _0x58d58b = _0x88503d => {
    _0x88503d?.querySelectorAll?.(".person-replacement-detection-empty, .person-replacement-keyframe-tools, .person-replacement-shot-navigation-arrow")?.forEach?.(_0x3285a5 => _0x3285a5.remove?.());
    _0x88503d?.querySelectorAll?.(".person-replacement-detection-box")?.forEach?.(_0x2d2a48 => _0x2d2a48.replaceChildren?.());
    return _0x88503d;
  };
  const _0x1c4009 = () => _0x318ed6?.querySelector?.(".person-replacement-video-generation-panel .person-replacement-video-result-slide:not(.person-replacement-video-result-slide--outgoing)") || null;
  const _0x434387 = (_0x21c5c9, _0x3fc0fb) => {
    const _0x199a6a = _0x21c5c9 === "previous" ? "previous" : "next";
    const _0x4bc44c = _0x318ed6?.querySelector?.(".person-replacement-middle-layout");
    const _0x3dba86 = _0x4bc44c?.querySelector?.(".person-replacement-middle-preview-slide:not(.person-replacement-middle-preview-slide--outgoing)");
    if (!_0x4bc44c || !_0x3dba86 || _0x3dba86 === _0x3fc0fb) {
      return false;
    }
    _0x4bc44c.querySelectorAll?.(".person-replacement-middle-preview-slide--outgoing")?.forEach?.(_0x382624 => _0x382624.remove?.());
    _0x4bc44c.classList?.remove?.("is-sliding-next", "is-sliding-previous");
    if (_0x3fc0fb) {
      _0x58d58b(_0x3fc0fb);
      _0x3fc0fb.classList?.remove?.("img-preview-loading", "is-sliding-next", "is-sliding-previous");
      _0x3fc0fb.classList?.add?.("person-replacement-middle-preview-slide--outgoing");
      _0x3fc0fb.removeAttribute?.("aria-busy");
      _0x3fc0fb.setAttribute?.("aria-hidden", "true");
      try {
        _0x3fc0fb.inert = true;
      } catch {}
      _0x3fc0fb.querySelector?.(".story-asset-loading-overlay, .img-loading-overlay")?.remove?.();
      _0x4bc44c.append?.(_0x3fc0fb);
    }
    const _0x2b3469 = startPersonReplacementSlideTransition({
      windowObject: windowObject,
      incomingSlide: _0x3dba86,
      outgoingSlide: _0x3fc0fb,
      direction: _0x199a6a
    });
    let _0x19d09a = false;
    const _0x384a99 = () => {
      if (_0x19d09a) {
        return;
      }
      _0x19d09a = true;
      cancelPersonReplacementSlideTransition(_0x2b3469);
      _0x3fc0fb?.remove?.();
    };
    _0x2b3469.finished.then(_0x384a99);
    windowObject?.setTimeout?.(_0x384a99, _0x2b3469.duration + 80);
    return true;
  };
  const _0x549693 = (_0x3faad5, _0xcae45c) => {
    const _0x5076c4 = _0x3faad5 === "previous" ? "previous" : "next";
    const _0x3532de = _0x318ed6?.querySelector?.(".person-replacement-image-generation-panel .person-replacement-generation-preview");
    const _0x730178 = _0x3532de?.querySelector?.(".person-replacement-image-preview-slide:not(.person-replacement-image-preview-slide--outgoing)");
    if (!_0x3532de || !_0x730178) {
      return false;
    }
    _0x3532de.querySelectorAll?.(".person-replacement-image-preview-slide--outgoing")?.forEach?.(_0x21e3cf => _0x21e3cf.remove?.());
    _0x3532de.classList?.remove?.("is-sliding-next", "is-sliding-previous");
    if (_0xcae45c) {
      _0xcae45c.classList?.remove?.("img-preview-loading");
      _0xcae45c.classList?.add?.("person-replacement-image-preview-slide--outgoing");
      _0xcae45c.removeAttribute?.("aria-busy");
      _0xcae45c.setAttribute?.("aria-hidden", "true");
      _0xcae45c.querySelector?.(".story-asset-loading-overlay, .img-loading-overlay")?.remove?.();
      _0x3532de.append?.(_0xcae45c);
    }
    const _0x54f5d5 = startPersonReplacementSlideTransition({
      windowObject: windowObject,
      incomingSlide: _0x730178,
      outgoingSlide: _0xcae45c,
      direction: _0x5076c4
    });
    let _0x234ec0 = false;
    const _0x25cc0f = () => {
      if (_0x234ec0) {
        return;
      }
      _0x234ec0 = true;
      cancelPersonReplacementSlideTransition(_0x54f5d5);
      _0xcae45c?.remove?.();
    };
    _0x54f5d5.finished.then(_0x25cc0f);
    windowObject?.setTimeout?.(_0x25cc0f, _0x54f5d5.duration + 80);
    return true;
  };
  const _0x27a261 = (_0x357317, _0x472c9d) => {
    const _0x33be7f = _0x357317 === "previous" ? "previous" : "next";
    const _0x5938b8 = _0x318ed6?.querySelector?.(".person-replacement-video-generation-panel .person-replacement-video-result");
    const _0x289091 = _0x5938b8?.querySelector?.(".person-replacement-video-result-slide:not(.person-replacement-video-result-slide--outgoing)");
    if (!_0x5938b8 || !_0x289091 || _0x289091 === _0x472c9d) {
      return false;
    }
    _0x5938b8.querySelectorAll?.(".person-replacement-video-result-slide--outgoing")?.forEach?.(_0x418631 => _0x418631.remove?.());
    _0x5938b8.classList?.remove?.("is-sliding-next", "is-sliding-previous");
    if (_0x472c9d) {
      _0x472c9d.classList?.remove?.("img-preview-loading", "is-sliding-next", "is-sliding-previous");
      _0x472c9d.classList?.add?.("person-replacement-video-result-slide--outgoing");
      _0x472c9d.removeAttribute?.("aria-busy");
      _0x472c9d.setAttribute?.("aria-hidden", "true");
      try {
        _0x472c9d.inert = true;
      } catch {}
      _0x472c9d.querySelector?.(".story-asset-loading-overlay, .img-loading-overlay")?.remove?.();
      _0x5938b8.append?.(_0x472c9d);
    }
    const _0x34e187 = startPersonReplacementSlideTransition({
      windowObject: windowObject,
      incomingSlide: _0x289091,
      outgoingSlide: _0x472c9d,
      direction: _0x33be7f
    });
    let _0x9d324d = false;
    const _0x1a8243 = () => {
      if (_0x9d324d) {
        return;
      }
      _0x9d324d = true;
      cancelPersonReplacementSlideTransition(_0x34e187);
      _0x472c9d?.remove?.();
    };
    _0x34e187.finished.then(_0x1a8243);
    windowObject?.setTimeout?.(_0x1a8243, _0x34e187.duration + 80);
    return true;
  };
  const _0x4ca683 = _0x2c886d => {
    if (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 5) {
      return false;
    }
    const _0xa95846 = _0x318ed6?.querySelector?.(".person-replacement-compare-grid");
    if (!_0xa95846) {
      return false;
    }
    const _0x359c23 = _0x2c886d === "previous" ? "previous" : "next";
    _0xa95846.classList?.remove?.("is-sliding-next");
    _0xa95846.classList?.remove?.("is-sliding-previous");
    _0xa95846.offsetWidth;
    _0xa95846.classList?.add?.("is-sliding-" + _0x359c23);
    return true;
  };
  const _0x395527 = (_0x2ff49f, {
    direction = "",
    ensureVisible = false
  } = {}) => {
    const _0x56f33a = normalizeText(_0x2ff49f);
    const _0x560e6b = _0x38e2d5.shots.find(_0x58eef3 => _0x58eef3.id === _0x56f33a);
    const _0x187572 = _0x38e2d5.workspace.step === 5 && buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5).previewMode === "full";
    if (!_0x560e6b || _0x56f33a === _0x38e2d5.workspace.selectedShotId && !_0x187572) {
      return false;
    }
    const _0x3dd080 = direction || _0x3bb951(_0x56f33a);
    const _0x51b13a = _0x585f91();
    const _0x260614 = _0x49c83c();
    const _0x4c0270 = _0x1c4009();
    _0x1ef913({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        selectedShotId: _0x56f33a,
        ...(_0x38e2d5.workspace.step === 5 ? {
          compositePreviewMode: "shot"
        } : {})
      }
    }, "shot-select");
    _0x549693(_0x3dd080 || "next", _0x51b13a);
    _0x434387(_0x3dd080 || "next", _0x260614);
    _0x27a261(_0x3dd080 || "next", _0x4c0270);
    _0x4ca683(_0x3dd080 || "next");
    if (ensureVisible) {
      _0x5082ca(_0x56f33a);
    }
    return true;
  };
  const _0x53fe32 = _0x5774d2 => {
    _0x5774d2?.setAttribute?.("aria-label", _0x5774d2?.dataset?.personReplacementShotWheel === "true" ? "拖拽新增可替换主体；按住 Ctrl 拖拽可多选人物框；按 D 或 Delete 删除选中框；滚轮或左右方向键切换片段" : "拖拽新增可替换主体；按住 Ctrl 拖拽可多选人物框，按 D 或 Delete 批量删除");
  };
  const _0x312b30 = _0x5d7b66 => {
    const _0x5b5efd = Array.isArray(_0x38e2d5.shots) ? _0x38e2d5.shots : [];
    if (_0x5b5efd.length < 2) {
      return false;
    }
    const _0x16382d = Math.max(0, _0x5b5efd.findIndex(_0x2a5840 => _0x2a5840.id === _0x38e2d5.workspace.selectedShotId));
    const _0x5975e6 = (_0x16382d + Math.sign(Number(_0x5d7b66) || 0) + _0x5b5efd.length) % _0x5b5efd.length;
    const _0x39c1e9 = _0x5b5efd[_0x5975e6];
    if (!_0x39c1e9 || _0x39c1e9.id === _0x38e2d5.workspace.selectedShotId) {
      return false;
    }
    return _0x395527(_0x39c1e9.id, {
      direction: Math.sign(Number(_0x5d7b66) || 0) < 0 ? "previous" : "next",
      ensureVisible: true
    });
  };
  const _0x174e2e = (_0x1d76d3, _0x4e901a = true) => _0x4e901a ? transitionPersonReplacementOutput(_0x1d76d3, {
    type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.INVALIDATE
  }) : _0x1d76d3;
  const _0x547ea8 = (_0x3384e0, _0x78b8c7, {
    selectShot: _0x94838 = true,
    direction = ""
  } = {}) => {
    const _0x3d6a6d = normalizeText(_0x3384e0);
    const _0x176008 = _0x38e2d5.shots.find(_0x2f527f => _0x2f527f.id === _0x3d6a6d);
    const _0x1e018e = getPersonReplacementImageResults(_0x176008);
    if (!_0x176008 || !_0x1e018e.length) {
      return false;
    }
    const _0x2df8cc = getPersonReplacementActiveImageResultIndex(_0x176008, _0x1e018e);
    const _0x4997b6 = Math.max(0, Math.min(_0x1e018e.length - 1, Math.trunc(Number(_0x78b8c7) || 0)));
    const _0x5e499c = Object.prototype.hasOwnProperty.call(_0x1e018e[_0x4997b6], "userPrompt");
    const _0x5577f3 = normalizeText(_0x1e018e[_0x4997b6]?.userPrompt);
    const _0x36711e = Boolean(_0x5e499c && _0x5577f3 !== normalizeText(_0x176008.imagePrompt));
    if (_0x4997b6 === _0x2df8cc && (!_0x94838 || _0x3d6a6d === normalizeText(_0x38e2d5.workspace.selectedShotId)) && !_0x36711e) {
      return false;
    }
    const _0x516928 = _0x94838 && _0x3d6a6d !== normalizeText(_0x38e2d5.workspace.selectedShotId);
    const _0x3bc552 = direction || (_0x516928 ? _0x3bb951(_0x3d6a6d) : _0x4997b6 > _0x2df8cc ? "next" : "previous");
    const _0x1567a7 = _0x585f91();
    const _0x455447 = resolvePersonReplacementImageResultRef(_0x1e018e[_0x4997b6]);
    _0x1ef913({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x5af01c => _0x5af01c.id === _0x3d6a6d ? {
        ..._0x5af01c,
        replacementImage: {
          ...(_0x5af01c.replacementImage || {}),
          results: _0x1e018e,
          activeIndex: _0x4997b6
        },
        replacementImageRef: _0x455447,
        ...(_0x5e499c ? {
          imagePrompt: _0x5577f3
        } : {})
      } : _0x5af01c),
      workspace: {
        ..._0x38e2d5.workspace,
        selectedShotId: _0x94838 ? _0x3d6a6d : _0x38e2d5.workspace.selectedShotId
      }
    }, "replacement-image-result");
    _0x549693(_0x3bc552 || "next", _0x1567a7);
    if (_0x94838) {
      _0x5082ca(_0x3d6a6d);
    }
    return true;
  };
  const _0x3ebf25 = (_0x24fbb7, _0x26ca6c = _0x38e2d5.workspace.selectedShotId, _0x4e3d94 = {}) => {
    const _0x170597 = normalizeText(_0x26ca6c);
    const _0x1364b0 = _0x38e2d5.shots.find(_0x4f99ff => _0x4f99ff.id === _0x170597);
    const _0x28498e = getPersonReplacementImageResults(_0x1364b0);
    if (!_0x1364b0 || _0x28498e.length < 2) {
      return false;
    }
    const _0x4f40a7 = getPersonReplacementActiveImageResultIndex(_0x1364b0, _0x28498e);
    const _0x395e1c = (_0x4f40a7 + Math.sign(Number(_0x24fbb7) || 0) + _0x28498e.length) % _0x28498e.length;
    return _0x547ea8(_0x170597, _0x395e1c, {
      ..._0x4e3d94,
      direction: Math.sign(Number(_0x24fbb7) || 0) < 0 ? "previous" : "next"
    });
  };
  const _0x6872f7 = (_0x4a4ea7, _0x2e7d94) => {
    const _0x1f2fe8 = normalizeText(_0x4a4ea7);
    const _0x592d44 = _0x38e2d5.shots.find(_0x54bd5e => _0x54bd5e.id === _0x1f2fe8);
    const _0x399fdd = getPersonReplacementImageResults(_0x592d44);
    const _0x29d1a0 = Math.trunc(Number(_0x2e7d94));
    if (!_0x592d44 || !Number.isInteger(_0x29d1a0) || _0x29d1a0 < 0 || _0x29d1a0 >= _0x399fdd.length) {
      return false;
    }
    const _0x542e35 = getPersonReplacementActiveImageResultIndex(_0x592d44, _0x399fdd);
    const _0x30469f = _0x38e2d5.shots.find(_0x9000aa => _0x9000aa.id === normalizeText(_0x38e2d5.workspace.selectedShotId));
    const _0xafaefa = resolvePersonReplacementImageSourceRef(_0x30469f);
    const _0x1433ba = resolvePersonReplacementImageResultRef(_0x399fdd[_0x29d1a0]);
    const _0x5cf803 = _0x1433ba === normalizeText(_0x592d44.imageIterationReferenceRef) ? normalizeText(_0x592d44.keyframeRef) : _0x1433ba;
    const _0x5d5365 = _0x1f2fe8 !== normalizeText(_0x38e2d5.workspace.selectedShotId);
    const _0x4df07b = _0x5d5365 || _0x29d1a0 !== _0x542e35;
    const _0x1bfc34 = _0x5d5365 || _0x5cf803 !== _0xafaefa;
    const _0x3b5666 = _0x5d5365 ? _0x3bb951(_0x1f2fe8) : _0x29d1a0 > _0x542e35 ? "next" : "previous";
    const _0x8e2fa0 = _0x4df07b ? _0x585f91() : null;
    const _0x1fe1d9 = _0x1bfc34 ? _0x49c83c() : null;
    const _0x13ca4f = _0x18e3e4();
    const _0x5ec1c9 = setPersonReplacementImageResultAsReference(_0x38e2d5, {
      shotId: _0x1f2fe8,
      resultIndex: _0x2e7d94
    });
    if (!_0x5ec1c9.changed) {
      return false;
    }
    _0x1ef913(_0x51f230(_0x5ec1c9.project, new Set(_0x5ec1c9.changedShotIds)), "replacement-image-reference");
    if (_0x4df07b) {
      _0x549693(_0x3b5666 || "next", _0x8e2fa0);
    }
    if (_0x1bfc34) {
      _0x434387(_0x3b5666 || "next", _0x1fe1d9);
    }
    if (_0x5d5365) {
      _0x5082ca(_0x1f2fe8);
    }
    _0x3d2dc8(_0x13ca4f);
    windowObject?.showToast?.(_0x5ec1c9.clearedReference ? "已取消下一轮参考图。" : "已设为下一轮参考图；人物绑定保持不变。", "success");
    return true;
  };
  const _0x1a7b44 = (_0x2f7790, _0x224cd7) => {
    const _0x54c1db = normalizeText(_0x2f7790);
    const _0x28a334 = _0x38e2d5.shots.find(_0x281eb6 => _0x281eb6.id === _0x54c1db);
    const _0x4144de = getPersonReplacementImageResults(_0x28a334);
    const _0x1dac56 = Number(_0x224cd7);
    if (!_0x28a334 || _0x4144de.length < 2 || !Number.isInteger(_0x1dac56) || _0x1dac56 < 0 || _0x1dac56 >= _0x4144de.length) {
      return false;
    }
    const _0x1ee697 = _0x18e3e4();
    const _0x238b8c = getPersonReplacementActiveImageResultIndex(_0x28a334, _0x4144de);
    const _0x342f88 = resolvePersonReplacementImageResultRef(_0x4144de[_0x238b8c]);
    const _0x58fd62 = _0x4144de.filter((_0x2ccd77, _0x4248a9) => _0x4248a9 !== _0x1dac56);
    const _0x4c058d = _0x1dac56 < _0x238b8c ? _0x238b8c - 1 : _0x1dac56 === _0x238b8c ? Math.min(_0x1dac56, _0x58fd62.length - 1) : _0x238b8c;
    const _0x22f881 = resolvePersonReplacementImageResultRef(_0x58fd62[_0x4c058d]);
    const _0xbcd44 = Object.prototype.hasOwnProperty.call(_0x58fd62[_0x4c058d], "userPrompt");
    const _0x13cc0e = normalizeText(_0x58fd62[_0x4c058d]?.userPrompt);
    const _0x16c6b6 = _0x22f881 !== _0x342f88;
    _0x1ef913({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x2e11ca => _0x2e11ca.id === _0x54c1db ? {
        ..._0x2e11ca,
        replacementImage: {
          ...(_0x2e11ca.replacementImage || {}),
          results: _0x58fd62,
          activeIndex: _0x4c058d
        },
        replacementImageRef: _0x22f881,
        ...(_0x16c6b6 && _0xbcd44 ? {
          imagePrompt: _0x13cc0e
        } : {})
      } : _0x2e11ca)
    }, "delete-replacement-image-result");
    _0x3d2dc8(_0x1ee697);
    return true;
  };
  const _0x4d2659 = (_0x461cc4, _0x3d8bd3, {
    direction = ""
  } = {}) => {
    const _0x79e419 = normalizeText(_0x461cc4);
    const _0x3dc4e2 = _0x38e2d5.shots.find(_0x4a0aa6 => _0x4a0aa6.id === _0x79e419);
    const _0x564c11 = getPersonReplacementVideoResults(_0x3dc4e2);
    if (!_0x3dc4e2 || !_0x564c11.length) {
      return false;
    }
    const _0xceb491 = getPersonReplacementActiveVideoResultIndex(_0x3dc4e2, _0x564c11);
    const _0x439980 = Math.max(0, Math.min(_0x564c11.length - 1, Math.trunc(Number(_0x3d8bd3) || 0)));
    if (_0x439980 === _0xceb491) {
      return false;
    }
    const _0x13643b = direction || (_0x439980 > _0xceb491 ? "next" : "previous");
    const _0x3ae593 = _0x1c4009();
    const _0x15ec8d = resolvePersonReplacementVideoResultRef(_0x564c11[_0x439980]);
    _0x1ef913(_0x174e2e({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x663941 => _0x663941.id === _0x79e419 ? {
        ..._0x663941,
        replacementVideo: {
          ...(_0x663941.replacementVideo || {}),
          results: _0x564c11,
          activeIndex: _0x439980
        },
        resultVideoRef: _0x15ec8d,
        generationStatus: "succeeded",
        error: ""
      } : _0x663941)
    }), "replacement-video-result");
    _0x27a261(_0x13643b, _0x3ae593);
    return true;
  };
  const _0x2bdcdf = (_0x77925d, _0x3e3e9e) => {
    const _0x4858e2 = normalizeText(_0x77925d);
    const _0x3b61bf = _0x38e2d5.shots.find(_0x42dbfd => _0x42dbfd.id === _0x4858e2);
    const _0x51abb3 = getPersonReplacementVideoResults(_0x3b61bf);
    const _0x7bfb53 = Number(_0x3e3e9e);
    if (!_0x3b61bf || _0x51abb3.length < 2 || !Number.isInteger(_0x7bfb53) || _0x7bfb53 < 0 || _0x7bfb53 >= _0x51abb3.length) {
      return false;
    }
    const _0x561845 = _0x18e3e4();
    const _0x345270 = getPersonReplacementActiveVideoResultIndex(_0x3b61bf, _0x51abb3);
    const _0xbced0f = resolvePersonReplacementVideoResultRef(_0x51abb3[_0x345270]);
    const _0x1279f4 = _0x51abb3.filter((_0x162c22, _0xeeafc9) => _0xeeafc9 !== _0x7bfb53);
    const _0x3bc5c2 = _0x7bfb53 < _0x345270 ? _0x345270 - 1 : _0x7bfb53 === _0x345270 ? Math.min(_0x7bfb53, _0x1279f4.length - 1) : _0x345270;
    const _0x39caba = resolvePersonReplacementVideoResultRef(_0x1279f4[_0x3bc5c2]);
    const _0x530902 = _0x39caba !== _0xbced0f;
    _0x1ef913(_0x174e2e({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x58e062 => _0x58e062.id === _0x4858e2 ? {
        ..._0x58e062,
        replacementVideo: {
          ...(_0x58e062.replacementVideo || {}),
          results: _0x1279f4,
          activeIndex: _0x3bc5c2
        },
        resultVideoRef: _0x39caba,
        ...(_0x530902 ? {
          generationStatus: "succeeded",
          error: ""
        } : {})
      } : _0x58e062)
    }, _0x530902), "delete-replacement-video-result");
    _0x3d2dc8(_0x561845);
    return true;
  };
  const _0x247f30 = (_0x9999d1, _0x7f14b3 = _0x38e2d5.workspace.selectedShotId) => {
    const _0x3574b7 = normalizeText(_0x7f14b3);
    const _0x37e68d = _0x38e2d5.shots.find(_0x1ae714 => _0x1ae714.id === _0x3574b7);
    const _0x55a539 = getPersonReplacementVideoResults(_0x37e68d);
    if (!_0x37e68d || _0x55a539.length < 2) {
      return false;
    }
    const _0x1a9397 = getPersonReplacementActiveVideoResultIndex(_0x37e68d, _0x55a539);
    const _0x23b7f2 = (_0x1a9397 + Math.sign(Number(_0x9999d1) || 0) + _0x55a539.length) % _0x55a539.length;
    return _0x4d2659(_0x3574b7, _0x23b7f2, {
      direction: Math.sign(Number(_0x9999d1) || 0) < 0 ? "previous" : "next"
    });
  };
  const _0x13d174 = (_0x37cc8a, _0x30acd6) => {
    const _0x550097 = normalizeText(_0x37cc8a);
    const _0x57ba02 = _0x38e2d5.shots.find(_0x3a6b57 => _0x3a6b57.id === _0x550097);
    const _0x1309a1 = resolvePersonReplacementVideoImageInput(_0x38e2d5, _0x57ba02);
    const _0x34138f = Array.isArray(_0x1309a1.referenceOptions) ? _0x1309a1.referenceOptions : [];
    if (!_0x57ba02 || !_0x34138f.length) {
      return false;
    }
    const _0x1b08d9 = Math.max(0, Math.min(_0x34138f.length - 1, Math.trunc(Number(_0x30acd6) || 0)));
    const _0xfcc491 = _0x34138f[_0x1b08d9];
    const _0x4e79f4 = Math.max(0, Math.min(_0x34138f.length - 1, Math.trunc(Number(_0x1309a1.activeReferenceIndex) || 0)));
    if (_0x1b08d9 === _0x4e79f4 && normalizeText(_0x57ba02.replacementVideoReferenceKind) === normalizeText(_0xfcc491?.kind)) {
      return false;
    }
    _0x1ef913({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x5a1144 => _0x5a1144.id === _0x550097 ? {
        ..._0x5a1144,
        replacementVideoReferenceKind: normalizeText(_0xfcc491?.kind)
      } : _0x5a1144)
    }, "video-reference-change");
    return true;
  };
  const _0x3e820c = (_0x214847 = "image") => {
    const _0x1b0c4e = [...new Set(_0x38e2d5.workspace.selectedShotIds.map(normalizeText).filter(Boolean))];
    if (!_0x1b0c4e.length) {
      return false;
    }
    const _0x73b4da = normalizeText(_0x38e2d5.workspace.selectedShotId);
    const _0xff50b5 = _0x1b0c4e.includes(_0x73b4da) ? [_0x73b4da, ..._0x1b0c4e.filter(_0x204aac => _0x204aac !== _0x73b4da)] : _0x1b0c4e;
    const _0x5852b5 = _0x214847 === "video";
    const _0xb930ad = normalizeText(_0x38e2d5.id);
    const _0x733172 = [..._0xfebc3.values()].find(_0x1a792a => _0x1a792a.projectId === _0xb930ad && _0x1a792a.kind === _0x214847 && _0x2d4148(_0x1a792a.targetShotIds, new Set(_0xff50b5)));
    if (_0x733172) {
      return false;
    }
    const _0x775b43 = _0x5852b5 ? [] : _0xff50b5.map(_0x4fd3cc => _0x38e2d5.shots.find(_0x16970e => _0x16970e.id === _0x4fd3cc)).filter(_0x2b1272 => {
      if (!_0x2b1272) {
        return false;
      }
      const _0x40a873 = personReplacementImagePresentation.build({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          selectedShotId: normalizeText(_0x2b1272.id)
        }
      });
      return !_0x40a873.gate.sceneOnly && _0x40a873.gate.duplicateRoleLabels.length > 0;
    });
    if (_0x775b43.length) {
      windowObject?.showToast?.("有 " + _0x775b43.length + " 个镜头存在重复角色名，请先修改红色框中的角色。", "warn");
      return false;
    }
    const _0x1d0fbb = _0x5852b5 ? onGenerateReplacementVideoRequested : onGenerateReplacementImageRequested;
    const _0x46a6e5 = _0x5852b5 ? "批量生成视频" : "批量生成";
    const _0x54c692 = createTaskBatchCancellationController();
    const _0x56757a = "shot-batch-" + ++_0x1a1b80;
    const _0x29ef29 = {
      id: _0x56757a,
      projectId: _0xb930ad,
      kind: _0x5852b5 ? "video" : "image",
      targetShotIds: _0xff50b5,
      generatingShotIds: new Set(_0xff50b5),
      activeShotIds: new Set(),
      cancellation: _0x54c692,
      label: _0x46a6e5 + " 0/" + _0xff50b5.length
    };
    _0xfebc3.set(_0x56757a, _0x29ef29);
    if (!_0x3f6136()) {
      _0x3be3ab();
    }
    let _0x1db5fc = 0;
    runTaskBatchQueue({
      targets: _0xff50b5,
      concurrency: 2,
      shouldStop: _0x54c692.isRequested,
      onTargetStart: ({
        target: _0x3d72eb
      }) => {
        _0x29ef29.activeShotIds.add(_0x3d72eb);
      },
      runTarget: _0x36f1f9 => _0x443f39(_0x1d0fbb, {
        projectId: _0xb930ad,
        shotId: _0x36f1f9,
        notifyCompletion: false
      }, {}, {
        applyCallbackResult: !_0x5852b5
      }),
      onTargetSettled: ({
        target: _0x3c3aa4
      }) => {
        _0x29ef29.activeShotIds.delete(_0x3c3aa4);
        _0x29ef29.generatingShotIds.delete(_0x3c3aa4);
        _0x1db5fc += 1;
        _0x29ef29.label = _0x54c692.isRequested() ? "正在停止批量生成 · 已结束 " + _0x1db5fc + "/" + _0xff50b5.length : _0x46a6e5 + " " + _0x1db5fc + "/" + _0xff50b5.length;
        if (!_0x3f6136()) {
          _0x3be3ab();
        }
      }
    }).then(_0x37d5d => {
      const _0x2e9428 = _0x37d5d.filter(_0xeae95a => _0xeae95a.status !== "cancelled");
      const _0x15200f = _0x2e9428.filter(_0x3b6323 => _0x3b6323.status === "fulfilled" && _0x3b6323.value?.ok === true).length;
      _0x443f39(onGenerationBatchCompleted, {
        kind: _0x5852b5 ? "video" : "image",
        projectId: _0xb930ad,
        shotIds: _0xff50b5,
        totalCount: _0x2e9428.length,
        successCount: _0x15200f,
        failureCount: _0x2e9428.length - _0x15200f,
        ...(_0x37d5d.length > _0x2e9428.length ? {
          cancelledCount: _0x37d5d.length - _0x2e9428.length
        } : {})
      }, {}, {
        applyCallbackResult: false
      });
    }).finally(() => {
      if (_0xfebc3.get(_0x56757a) !== _0x29ef29) {
        return;
      }
      _0xfebc3.delete(_0x56757a);
      if (!_0x3f6136()) {
        _0x3be3ab();
      }
    });
    return true;
  };
  const _0x576fa0 = () => {
    const _0xa1aed = _0x58edcc();
    const _0x9e4a2 = _0xa1aed?.cancellation;
    if (!_0xa1aed || !_0x9e4a2?.request?.()) {
      return false;
    }
    const _0x2d82ea = [..._0xa1aed.activeShotIds];
    _0xa1aed.generatingShotIds = new Set(_0x2d82ea);
    _0xa1aed.label = "正在停止批量生成";
    if (!_0x3f6136()) {
      _0x3be3ab();
    }
    const _0x49f9d5 = _0xa1aed.kind === "video" ? onCancelReplacementVideoRequested : onCancelReplacementImageRequested;
    Promise.allSettled(_0x2d82ea.map(_0x194026 => Promise.resolve(_0x443f39(_0x49f9d5, {
      projectId: _0xa1aed.projectId,
      shotId: _0x194026
    }, {}, {
      applyCallbackResult: false
    }))));
    return true;
  };
  const _0x5e350b = () => {
    if (_0x22e4b4) {
      return false;
    }
    const _0x1c522e = [...new Set(_0x38e2d5.workspace.selectedAssetIds.map(normalizeText).filter(_0x10a536 => _0x10a536 && _0x38e2d5.characters.some(_0x4b6cd0 => _0x4b6cd0.id === _0x10a536)))];
    if (!_0x1c522e.length) {
      return false;
    }
    const _0x38529b = createTaskBatchCancellationController();
    _0x56a1df = _0x38529b;
    _0x22e4b4 = true;
    _0x385ea6 = new Set(_0x1c522e);
    _0x4ca9d5 = new Set();
    _0x41fe7d = "批量生成 0/" + _0x1c522e.length;
    _0x3be3ab();
    let _0x46de59 = 0;
    runTaskBatchQueue({
      targets: _0x1c522e,
      concurrency: 2,
      shouldStop: _0x38529b.isRequested,
      onTargetStart: ({
        target: _0x40df1c
      }) => {
        _0x4ca9d5.add(_0x40df1c);
      },
      runTarget: _0xf9d10a => {
        const _0x56d1cf = _0x38e2d5.characters.find(_0x583ddb => _0x583ddb.id === _0xf9d10a);
        return _0x443f39(onGenerateCharacterImageRequested, {
          characterId: _0xf9d10a,
          appearanceId: getCharacterAppearance(_0x56d1cf)?.id,
          prompt: _0x56d1cf?.description,
          promptPresetId: _0x38e2d5.workspace.assetPromptPresetId,
          modelId: _0x38e2d5.settings.characterImageModelId,
          provider: _0x38e2d5.settings.characterImageProvider,
          providerProfileId: _0x38e2d5.settings.characterImageProviderProfileId,
          generationParams: _0x38e2d5.settings.characterImageGenerationParams,
          notifyCompletion: false
        });
      },
      onTargetSettled: ({
        target: _0x2b2ba9
      }) => {
        _0x4ca9d5.delete(_0x2b2ba9);
        _0x385ea6.delete(_0x2b2ba9);
        _0x46de59 += 1;
        _0x41fe7d = _0x38529b.isRequested() ? "已取消后续生成 · 正在完成 " + _0x4ca9d5.size + " 项" : "批量生成 " + _0x46de59 + "/" + _0x1c522e.length;
        _0x3be3ab();
      }
    }).then(_0x45d326 => {
      const _0x376059 = _0x45d326.filter(_0x340e15 => _0x340e15.status !== "cancelled");
      const _0x9d7733 = _0x376059.filter(_0x284bb2 => _0x284bb2.status === "fulfilled" && _0x284bb2.value?.ok === true).length;
      _0x443f39(onGenerationBatchCompleted, {
        kind: "asset",
        characterIds: _0x1c522e,
        totalCount: _0x376059.length,
        successCount: _0x9d7733,
        failureCount: _0x376059.length - _0x9d7733,
        ...(_0x45d326.length > _0x376059.length ? {
          cancelledCount: _0x45d326.length - _0x376059.length
        } : {})
      }, {}, {
        applyCallbackResult: false
      });
    }).finally(() => {
      if (_0x56a1df !== _0x38529b) {
        return;
      }
      _0x22e4b4 = false;
      _0x41fe7d = "";
      _0x385ea6 = new Set();
      _0x4ca9d5 = new Set();
      _0x56a1df = null;
      _0x3be3ab();
    });
    return true;
  };
  const _0x56767c = () => {
    const _0x18117e = _0x56a1df;
    if (!_0x22e4b4 || !_0x18117e?.request?.()) {
      return false;
    }
    _0x385ea6 = new Set(_0x4ca9d5);
    _0x41fe7d = _0x4ca9d5.size ? "已取消后续生成 · 正在完成 " + _0x4ca9d5.size + " 项" : "已取消后续生成";
    _0x3be3ab();
    return true;
  };
  const _0x38fc68 = (_0x41c487, _0x38ccd2) => {
    const _0xe5b026 = _0x38e2d5.characters.find(_0x12d542 => _0x12d542.id === normalizeText(_0x41c487));
    const _0x2e9f0c = getWorkspaceAssetAppearances(_0xe5b026);
    const _0x47c732 = _0x2e9f0c.filter(_0x39beb9 => _0x39beb9.imageUrl);
    if (!_0xe5b026 || _0x47c732.length < 2) {
      return false;
    }
    const _0x5ec7b6 = Math.max(0, Math.min(_0x2e9f0c.length - 1, Math.trunc(Number(_0x38e2d5.workspace.assetAppearanceIndexes?.[_0xe5b026.id]) || 0)));
    const _0x29e779 = _0x2e9f0c[_0x5ec7b6]?.id;
    const _0x5572a9 = Math.max(0, _0x47c732.findIndex(_0xccb7f1 => _0xccb7f1.id === _0x29e779));
    const _0xbcee2b = (_0x5572a9 + Math.sign(Number(_0x38ccd2) || 0) + _0x47c732.length) % _0x47c732.length;
    if (_0xbcee2b === _0x5572a9) {
      return false;
    }
    const _0x50e046 = _0x47c732[_0xbcee2b]?.id;
    const _0x12207c = _0x2e9f0c.findIndex(_0x41c420 => _0x41c420.id === _0x50e046);
    const _0x533f6e = {
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        assetAppearanceIndexes: {
          ..._0x38e2d5.workspace.assetAppearanceIndexes,
          [_0xe5b026.id]: Math.max(0, _0x12207c)
        }
      }
    };
    _0x1ef913(_0x533f6e, "target-appearance-preview-change");
    return true;
  };
  const _0x3e19b2 = _0x456306 => {
    const _0xd17657 = _0x456306.target?.closest?.("[data-person-replacement-target-appearance-wheel=\"true\"]");
    if (!_0xd17657 || _0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 2) {
      return false;
    }
    _0x456306.preventDefault();
    const _0x133011 = normalizeText(_0xd17657.dataset.personReplacementTargetCharacterId);
    const _0x44b7ea = _0x297dda.get(_0x133011) || {
      accumulator: 0,
      lockedUntil: 0
    };
    _0x297dda.set(_0x133011, _0x44b7ea);
    const _0x462010 = consumeWorkspaceWheelDirection(_0x456306, _0x44b7ea, {
      threshold: 4,
      lockDuration: 160
    });
    if (_0x462010) {
      _0x38fc68(_0x133011, _0x462010);
    }
    return true;
  };
  const _0x46ea8c = _0x3bf523 => {
    const _0x56869d = _0x3bf523.target?.closest?.("[data-story-appearance-wheel=\"true\"]");
    if (!_0x56869d || _0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 1 || _0x38e2d5.workspace.characterAssetTab === "library") {
      return false;
    }
    _0x3bf523.preventDefault();
    const _0x4b1bbc = consumeWorkspaceWheelDirection(_0x3bf523, _0x33a51c);
    if (_0x4b1bbc) {
      _0xc490af(_0x4b1bbc);
    }
    return true;
  };
  const _0x295839 = _0x4bcebe => {
    const _0x6129fe = _0x4bcebe.target?.closest?.("[data-person-replacement-audio-bound-wheel=\"true\"]");
    if (!_0x6129fe || _0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 1 || _0x38e2d5.workspace.characterAssetTab !== "audio") {
      return false;
    }
    _0x4bcebe.preventDefault();
    const _0x3b83cd = consumeWorkspaceWheelDirection(_0x4bcebe, _0x54f0d7);
    if (_0x3b83cd) {
      _0xad8cc9(_0x3b83cd);
    }
    return true;
  };
  const _0x1f1ccf = _0xf41397 => {
    const _0x3dfd70 = _0xf41397.target?.closest?.("[data-person-replacement-shot-wheel=\"true\"]");
    if (!_0x3dfd70 || _0x38e2d5.workspace.view !== "project" || ![2, 3, 5].includes(_0x38e2d5.workspace.step) || _0x38e2d5.workspace.step === 2 && _0x3440f2.isOpen) {
      return false;
    }
    _0xf41397.preventDefault();
    const _0x346f4a = consumeWorkspaceWheelDirection(_0xf41397, _0x1b5dfd);
    if (_0x346f4a) {
      _0x312b30(_0x346f4a);
    }
    return true;
  };
  const _0x10e233 = _0x2d1431 => {
    const _0x274b66 = _0x2d1431.target?.closest?.("[data-person-replacement-video-result-wheel=\"true\"]");
    if (_0x274b66 && _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 3) {
      _0x2d1431.preventDefault();
      const _0x2fd284 = consumeWorkspaceWheelDirection(_0x2d1431, _0x2c9903);
      if (_0x2fd284) {
        _0x247f30(_0x2fd284);
      }
      return true;
    }
    const _0x296b15 = _0x2d1431.target?.closest?.("[data-person-replacement-image-result-wheel=\"true\"]");
    if (!_0x296b15 || _0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 2) {
      return false;
    }
    _0x2d1431.preventDefault();
    const _0x270156 = consumeWorkspaceWheelDirection(_0x2d1431, _0x37f3c0);
    if (_0x270156) {
      _0x3ebf25(_0x270156);
    }
    return true;
  };
  const _0x202160 = _0x51d27c => {
    const _0x23e94e = _0x51d27c.target?.closest?.("[data-person-replacement-shot-timeline-scroll]");
    const _0x73e694 = _0x51d27c.target?.closest?.("[data-person-replacement-shot-cut-timeline]");
    if (!_0x3440f2.isOpen || !_0x23e94e || !_0x73e694 || !_0x318ed6?.contains?.(_0x23e94e)) {
      return false;
    }
    const _0x3db697 = Number(_0x51d27c.deltaX) || 0;
    const _0x1dd6a4 = Number(_0x51d27c.deltaY) || 0;
    const _0x3bbde5 = Math.abs(_0x3db697) > Math.abs(_0x1dd6a4) ? _0x3db697 : _0x1dd6a4;
    if (!_0x3bbde5) {
      return false;
    }
    if (_0x51d27c.ctrlKey || _0x51d27c.metaKey) {
      _0x51d27c.preventDefault?.();
      _0x51d27c.stopPropagation?.();
      _0x543b3a(_0x3bbde5 > 0 ? "out" : "in", {
        clientX: _0x51d27c.clientX
      });
      return true;
    }
    const _0x25428c = Math.max(0, Number(_0x23e94e.scrollWidth) - Number(_0x23e94e.clientWidth));
    if (!(_0x25428c > 0)) {
      return false;
    }
    const _0x139d30 = clamp(Number(_0x23e94e.scrollLeft) + _0x3bbde5, 0, _0x25428c, Number(_0x23e94e.scrollLeft) || 0);
    if (_0x139d30 === Number(_0x23e94e.scrollLeft)) {
      return false;
    }
    _0x51d27c.preventDefault?.();
    _0x51d27c.stopPropagation?.();
    _0x23e94e.scrollLeft = _0x139d30;
    return true;
  };
  const _0x37d999 = _0x52a7af => {
    return scrollClosestElementHorizontallyWithWheel(_0x52a7af, "[data-person-replacement-shot-timeline-scroll]", {
      boundaryRoot: _0x318ed6,
      preserveNestedScrollable: true
    });
  };
  const _0x448915 = _0x351e10 => {
    return scrollClosestElementHorizontallyWithWheel(_0x351e10, ".person-replacement-video-model-selector", {
      boundaryRoot: _0x318ed6,
      preserveNestedScrollable: true,
      stopPropagation: true
    });
  };
  const _0x112119 = (_0x4be60d, _0xadff3b) => {
    const _0x487b5d = _0xadff3b?.getBoundingClientRect?.();
    const _0x4f3bb2 = Number(_0x487b5d?.width);
    if (!(_0x4f3bb2 > 0)) {
      return _0x3440f2.playheadSec;
    }
    const _0x26052b = getPersonReplacementShotCutDisplayDuration(_0x3440f2.draft);
    const _0x52fef2 = clamp((Number(_0x4be60d?.clientX) - Number(_0x487b5d?.left || 0)) / _0x4f3bb2, 0, 1, 0);
    return clamp(_0x52fef2 * _0x26052b, 0, getPersonReplacementShotCutTotalDuration(_0x3440f2.draft), _0x3440f2.playheadSec);
  };
  const _0x1270be = () => {
    if (_0x3440f2.isKeyframeCapturing || _0x3440f2.hoverPreviewRaf || !_0x3440f2.hoverPreviewActive) {
      return;
    }
    const _0x1d12c4 = () => {
      _0x3440f2.hoverPreviewRaf = 0;
      if (_0x3440f2.isKeyframeCapturing || !_0x3440f2.hoverPreviewActive || !_0x3440f2.isOpen) {
        return;
      }
      const _0x377c3d = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
      if (_0x42b1ba(_0x377c3d)) {
        return;
      }
      const _0x583a69 = Number(_0x3440f2.hoverPreviewRequest);
      if (!Number.isFinite(_0x583a69)) {
        return;
      }
      const _0x13448e = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x583a69);
      if (_0x13448e.shotIndex < 0) {
        return;
      }
      _0x4c0d1b(_0x13448e.shotId, _0x13448e.sourceTimeSec, {
        timelineSec: _0x13448e.timelineSec,
        hover: true
      });
    };
    const _0x4a7c7b = windowObject?.requestAnimationFrame || globalThis.requestAnimationFrame;
    if (typeof _0x4a7c7b === "function") {
      _0x3440f2.hoverPreviewRaf = _0x4a7c7b(_0x1d12c4);
    } else {
      _0x3440f2.hoverPreviewRaf = windowObject?.setTimeout?.(_0x1d12c4, 16) || 0;
    }
  };
  const _0x366e9d = _0x2ba1e0 => {
    const _0x59b570 = _0x2ba1e0?.target?.closest?.("[data-person-replacement-shot-cut-timeline]");
    const _0x5943d3 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-hover-playhead]");
    if (_0x3440f2.boundaryDrag || _0x3440f2.isKeyframeCapturing) {
      _0x3440f2.hoverPreviewActive = false;
      _0x3440f2.hoverPreviewTimeSec = null;
      _0x40df54();
      if (_0x5943d3) {
        _0x5943d3.hidden = true;
        _0x5943d3.classList?.remove?.("is-visible");
      }
      return false;
    }
    if (!_0x3440f2.isOpen || !_0x59b570 || !_0x5943d3) {
      if (_0x5943d3) {
        _0x5943d3.hidden = true;
        _0x5943d3.classList?.remove?.("is-visible");
      }
      return false;
    }
    const _0x92014b = _0x112119(_0x2ba1e0, _0x59b570);
    const _0x2e427f = getPersonReplacementShotCutDisplayDuration(_0x3440f2.draft);
    _0x5943d3.hidden = false;
    _0x5943d3.style?.setProperty?.("left", (_0x2e427f > 0 ? _0x92014b / _0x2e427f * 100 : 0) + "%");
    _0x5943d3.classList?.add?.("is-visible");
    _0x3440f2.hoverPreviewActive = true;
    _0x3440f2.hoverPreviewTimeSec = _0x92014b;
    const _0x20b39f = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x42b1ba(_0x20b39f)) {
      _0x3440f2.hoverPreviewRequest = _0x92014b;
      _0x1270be();
    }
    return true;
  };
  const _0x513c56 = _0x576c7f => {
    const _0x567fda = _0x576c7f?.target?.closest?.("[data-person-replacement-shot-cut-timeline]");
    if (_0x567fda && _0x576c7f?.relatedTarget && _0x567fda.contains?.(_0x576c7f.relatedTarget)) {
      return false;
    }
    const _0x41bd2e = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-hover-playhead]");
    if (_0x3440f2.boundaryDrag) {
      _0x3440f2.hoverPreviewActive = false;
      _0x3440f2.hoverPreviewTimeSec = null;
      _0x40df54();
      if (_0x41bd2e) {
        _0x41bd2e.hidden = true;
        _0x41bd2e.classList?.remove?.("is-visible");
      }
      return false;
    }
    const _0x9b486a = _0x3440f2.hoverPreviewActive;
    _0x3440f2.hoverPreviewActive = false;
    _0x3440f2.hoverPreviewTimeSec = null;
    _0x40df54();
    if (_0x41bd2e) {
      _0x41bd2e.hidden = true;
      _0x41bd2e.classList?.remove?.("is-visible");
    }
    const _0xc4a4ef = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (_0x9b486a && _0xc4a4ef?.paused !== false) {
      const _0x181810 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
      if (_0x181810.shotIndex >= 0) {
        _0x4c0d1b(_0x181810.shotId, _0x181810.sourceTimeSec, {
          timelineSec: _0x3440f2.playheadSec
        });
      }
    }
    return Boolean(_0x41bd2e || _0x9b486a);
  };
  const _0x452a68 = (_0x4ed0ee = null) => {
    const _0x244d48 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-track]");
    if (!_0x244d48) {
      return;
    }
    const _0x343323 = getPersonReplacementShotCutTotalDuration(_0x3440f2.draft);
    let _0x24160b = 0;
    _0x3440f2.draft.forEach((_0x1cbf47, _0x2d8195) => {
      const _0x3f2d7c = Math.max(PERSON_REPLACEMENT_CUT_MIN_SEC, Number(_0x1cbf47.durationSec) || 0);
      const _0x4bc5d4 = getMediaClipTimelineRangeRect({
        startSec: _0x24160b,
        endSec: _0x24160b + _0x3f2d7c,
        durationSec: _0x343323,
        minWidthPct: 0
      });
      const _0x438389 = _0x244d48.querySelector?.("[data-person-replacement-cut-shot-index=\"" + _0x2d8195 + "\"]");
      _0x438389?.style?.setProperty?.("left", _0x4bc5d4.leftPct + "%");
      _0x438389?.style?.setProperty?.("width", _0x4bc5d4.widthPct + "%");
      _0x24160b += _0x3f2d7c;
      const _0x4925a8 = _0x438389?.querySelector?.("[data-person-replacement-cut-duration=\"" + _0x2d8195 + "\"]");
      if (_0x4925a8) {
        _0x4925a8.textContent = formatDurationLabel(_0x3f2d7c);
      }
    });
    _0x244d48.querySelectorAll?.("[data-person-replacement-cut-boundary-index]")?.forEach?.(_0x3d70de => {
      const _0x8efae6 = Math.trunc(Number(_0x3d70de.dataset?.personReplacementCutBoundaryIndex));
      const _0x30c261 = _0x3440f2.draft[_0x8efae6];
      if (!(_0x8efae6 > 0) || !_0x30c261) {
        return;
      }
      _0x3d70de.classList?.toggle?.("is-dragging", _0x8efae6 === _0x4ed0ee);
      _0x3d70de.setAttribute?.("aria-valuenow", _0x30c261.startSec.toFixed(4));
    });
    _0x53ee48();
  };
  const _0x34b7b2 = (_0x7cd573, _0x16bf2c, {
    preview = true,
    active = null,
    recordHistory = true,
    preservePlayhead = false
  } = {}) => {
    const _0x297473 = Math.trunc(Number(_0x7cd573));
    const _0x4aedd5 = _0x3440f2.draft[_0x297473]?.startSec;
    const _0x2914f6 = _0x5bddd1.moveBoundary(_0x297473, _0x16bf2c, {
      recordHistory: recordHistory
    });
    const _0x4bd789 = _0x3440f2.draft[_0x297473];
    if (!_0x2914f6 || !_0x4bd789 || _0x4bd789.startSec === _0x4aedd5) {
      _0x452a68(active);
      return false;
    }
    _0x452a68(active);
    if (preview) {
      _0x4c0d1b(_0x4bd789.shotId, _0x4bd789.startSec, {
        preservePlayhead: preservePlayhead
      });
    }
    return true;
  };
  const _0x558c4b = (_0x361c2f, _0x5220aa, _0x3f1075) => {
    const _0x37bb6b = Math.trunc(Number(_0x5220aa));
    const _0x2d1f48 = _0x3f1075?.getBoundingClientRect?.();
    const _0x386ece = Number(_0x2d1f48?.width);
    if (!(_0x386ece > 0)) {
      return _0x3440f2.draft[_0x37bb6b]?.startSec;
    }
    const _0x43886f = getPersonReplacementShotCutDisplayDuration(_0x3440f2.draft);
    let _0x8de744 = _0x37bb6b - 1;
    while (_0x8de744 > 0 && _0x3440f2.draft[_0x8de744 - 1]?.sourceId === _0x3440f2.draft[_0x37bb6b]?.sourceId) {
      _0x8de744 -= 1;
    }
    const _0x53384b = _0x3440f2.draft.slice(0, _0x8de744).reduce((_0x2aef98, _0x15683e) => _0x2aef98 + _0x15683e.durationSec, 0);
    const _0x2cb6e2 = Number(_0x3440f2.draft[_0x8de744]?.startSec) || 0;
    const _0x219545 = clamp((Number(_0x361c2f?.clientX) - Number(_0x2d1f48.left || 0)) / _0x386ece, 0, 1, 0);
    return _0x2cb6e2 + _0x219545 * _0x43886f - _0x53384b;
  };
  const _0x219786 = (_0x36e3d2, _0x4f6fdd) => {
    if (!_0x3440f2.isOpen || _0x5b60e4() || !_0x4f6fdd) {
      return false;
    }
    const _0x1e6da2 = Math.trunc(Number(_0x4f6fdd.dataset?.personReplacementCutBoundaryIndex));
    const _0x27b112 = _0x4f6fdd.closest?.("[data-person-replacement-shot-cut-track]");
    if (!(_0x1e6da2 > 0) || !_0x27b112) {
      return false;
    }
    _0x36e3d2.preventDefault?.();
    try {
      _0x4f6fdd.focus?.({
        preventScroll: true
      });
    } catch {
      _0x4f6fdd.focus?.();
    }
    _0x5e1cb7();
    _0x3440f2.hoverPreviewActive = false;
    _0x3440f2.hoverPreviewTimeSec = null;
    _0x40df54();
    const _0x3ac3ab = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-hover-playhead]");
    if (_0x3ac3ab) {
      _0x3ac3ab.hidden = true;
      _0x3ac3ab.classList?.remove?.("is-visible");
    }
    _0x4f6fdd.classList?.add?.("is-dragging");
    documentObject?.body?.classList?.add?.("person-replacement-cut-resizing");
    try {
      _0x4f6fdd.setPointerCapture?.(_0x36e3d2.pointerId);
    } catch {}
    const _0x16ecf9 = _0x2ce697 => {
      _0x2ce697.preventDefault?.();
      const _0x1dd094 = _0x34b7b2(_0x1e6da2, _0x558c4b(_0x2ce697, _0x1e6da2, _0x27b112), {
        active: _0x1e6da2,
        recordHistory: !_0x3440f2.boundaryDrag?.historyCaptured,
        preservePlayhead: true
      });
      if (_0x1dd094 && _0x3440f2.boundaryDrag) {
        _0x3440f2.boundaryDrag.historyCaptured = true;
      }
    };
    const _0x5818f4 = _0x200578 => {
      _0x200578?.preventDefault?.();
      _0x5e1cb7();
      _0x452a68();
    };
    const _0x65f95 = () => {
      windowObject?.removeEventListener?.("pointermove", _0x16ecf9, true);
      windowObject?.removeEventListener?.("pointerup", _0x5818f4, true);
      windowObject?.removeEventListener?.("pointercancel", _0x5818f4, true);
      try {
        _0x4f6fdd.releasePointerCapture?.(_0x36e3d2.pointerId);
      } catch {}
      _0x4f6fdd.classList?.remove?.("is-dragging");
    };
    _0x3440f2.boundaryDrag = {
      boundaryIndex: _0x1e6da2,
      cleanup: _0x65f95,
      historyCaptured: false
    };
    windowObject?.addEventListener?.("pointermove", _0x16ecf9, true);
    windowObject?.addEventListener?.("pointerup", _0x5818f4, true);
    windowObject?.addEventListener?.("pointercancel", _0x5818f4, true);
    _0x16ecf9(_0x36e3d2);
    return true;
  };
  const _0x247edf = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4()) {
      return false;
    }
    if (!_0x5bddd1.resetDraft()) {
      return false;
    }
    try {
      _0x304ca3();
    } catch (_0xec8d64) {
      windowObject?.showToast?.(_0xec8d64?.message || "重置倒放状态失败，请重试。", "error");
      return false;
    }
    _0x3440f2.previewShotId = _0x38e2d5.workspace.selectedShotId || _0x3440f2.draft[0]?.shotId || "";
    _0x3be3ab();
    _0x4c0d1b(_0x3440f2.previewShotId, _0x3440f2.draft.find(_0x505147 => _0x505147.shotId === _0x3440f2.previewShotId)?.startSec);
    return true;
  };
  const _0x1a86dd = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4()) {
      return false;
    }
    if (!_0x5bddd1.undo()) {
      return false;
    }
    try {
      _0x304ca3();
    } catch (_0x373875) {
      windowObject?.showToast?.(_0x373875?.message || "撤回倒放状态失败，请重试。", "error");
      return false;
    }
    const _0x57c291 = getPersonReplacementShotCutTotalDuration(_0x3440f2.draft);
    _0x3440f2.playheadSec = clamp(_0x3440f2.playheadSec, 0, _0x57c291, 0);
    const _0x50e074 = getPersonReplacementShotCutPositionAtTimelineSec(_0x3440f2.draft, _0x3440f2.playheadSec);
    _0x3440f2.previewShotId = _0x50e074.shotId || _0x3440f2.draft[0]?.shotId || "";
    _0x3be3ab();
    if (_0x50e074.shotIndex >= 0) {
      _0x4c0d1b(_0x50e074.shotId, _0x50e074.sourceTimeSec, {
        timelineSec: _0x50e074.timelineSec
      });
    }
    return true;
  };
  const _0x1857b7 = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4() || typeof onShotCutDetectionRequested !== "function") {
      return false;
    }
    _0x3440f2.isSmartDetectOpen = false;
    _0x3440f2.isSmartDetecting = true;
    const _0x278606 = ++_0x3440f2.smartDetectionToken;
    const _0x1a52bf = normalizeText(_0x38e2d5.id);
    const _0x39cc2e = () => !_0x362ce5 && _0x3440f2.isOpen && _0x278606 === _0x3440f2.smartDetectionToken && normalizeText(_0x38e2d5.id) === _0x1a52bf;
    _0x3be3ab();
    let _0x8152d9;
    try {
      _0x8152d9 = onShotCutDetectionRequested({
        mode: _0x38e2d5.settings.smartClipMode,
        fps: _0x38e2d5.settings.smartClipFps
      }, {
        project: cloneJson(_0x38e2d5)
      });
    } catch (_0x3698e5) {
      _0x8152d9 = Promise.reject(_0x3698e5);
    }
    Promise.resolve(_0x8152d9).then(_0x466f58 => {
      if (!_0x39cc2e()) {
        return;
      }
      const _0x48b7bd = Array.isArray(_0x466f58?.ranges) ? _0x466f58.ranges : [];
      if (!_0x48b7bd.length) {
        throw new Error("智能检测未返回可用切口");
      }
      const _0x5c4f11 = _0x290ba5(_0x48b7bd);
      _0x3440f2.isSmartDetecting = false;
      _0x3440f2.isSmartDetectOpen = false;
      if (!_0x5c4f11) {
        _0x3be3ab();
        windowObject?.showToast?.("智能检测结果与当前切口一致。", "info");
        return;
      }
      _0x3440f2.playheadSec = 0;
      _0x3440f2.previewShotId = _0x48b7bd[0]?.shotId || "";
      _0x3be3ab();
      _0x4c0d1b(_0x3440f2.previewShotId, Number(_0x48b7bd[0]?.startSec) || 0, {
        timelineSec: 0
      });
      windowObject?.showToast?.("智能检测完成，已覆盖为 " + _0x48b7bd.length + " 个片段。", "success");
    }).catch(_0x288911 => {
      if (!_0x39cc2e()) {
        return;
      }
      _0x3440f2.isSmartDetecting = false;
      _0x3440f2.isSmartDetectOpen = true;
      _0x3be3ab();
      _0x4c0d1b(_0x3440f2.previewShotId, _0x3440f2.draft.find(_0x34cf70 => _0x34cf70.shotId === _0x3440f2.previewShotId)?.startSec);
      windowObject?.showToast?.(_0x288911?.message || "智能检测失败，请重试。", "error");
    });
    return true;
  };
  const _0x1c654d = ({
    submissionKind = "cuts",
    closeOnSuccess = true,
    rollback = null,
    successMessage = "",
    errorMessage = "镜头切口更新失败，请重试。"
  } = {}) => {
    _0x3440f2.isSubmitting = submissionKind;
    _0x3be3ab();
    const _0x35095c = _0x443f39(onShotCutRangesRequested, createPersonReplacementShotCutUpdateRequest(_0x38e2d5.shots, _0x3440f2.draft, _0x3440f2.previewShotId));
    Promise.resolve(_0x35095c).then(() => {
      _0x3440f2.isSubmitting = false;
      if (closeOnSuccess) {
        _0x54af74({
          animate: true,
          renderWorkspace: true
        });
      } else {
        _0x3440f2.initialDraft = cloneJson(_0x3440f2.draft);
        _0x3440f2.undoStack = [];
        _0x3be3ab();
        _0x21ccaa(_0x3440f2.playheadSec);
        if (successMessage) {
          windowObject?.showToast?.(successMessage, "success");
        }
      }
    }).catch(_0x5e01f6 => {
      _0x3440f2.isSubmitting = false;
      if (rollback) {
        _0x3440f2.draft = rollback.draft;
        _0x3440f2.undoStack = rollback.undoStack;
      }
      _0x3be3ab();
      _0x21ccaa(_0x3440f2.playheadSec);
      windowObject?.showToast?.(_0x5e01f6?.message || errorMessage, "error");
    });
    return true;
  };
  const _0x564e77 = () => {
    if (!_0x3440f2.isOpen || _0x5b60e4() || !hasPersonReplacementShotCutUpdateChanges(_0x38e2d5.shots, _0x3440f2.draft)) {
      return false;
    }
    return _0x1c654d();
  };
  _0x5bddd1.configureActionHandlers({
    open: () => _0x919456(),
    toggleSmartDetect: () => {
      if (!_0x3440f2.isSubmitting && !_0x3440f2.isSmartDetecting) {
        _0x3440f2.isSmartDetectOpen = !_0x3440f2.isSmartDetectOpen;
        _0x5bddd1.setSmartDetectOpen(_0x3440f2.isSmartDetectOpen);
        _0x3be3ab();
      }
    },
    setSmartDetectMode: ({
      target: _0x1761ab
    }) => _0x4cc6c9({
      settings: {
        smartClipMode: _0x1761ab.dataset.smartClipMode
      }
    }, {
      notify: true
    }),
    confirmSmartDetect: () => _0x1857b7(),
    toggleSound: ({
      target: _0x47ad72
    }) => _0xdc9f26(_0x47ad72),
    toggleReverse: () => _0x1581b9(),
    captureKeyframe: () => {
      _0x223192();
    },
    undo: () => _0x1a86dd(),
    reset: () => _0x247edf(),
    cancel: () => _0x54af74({
      animate: true,
      renderWorkspace: true
    }),
    confirm: () => _0x564e77(),
    togglePlayback: () => _0x84883a(),
    step: ({
      target: _0x463be7
    }) => _0x25ddd5(Number(_0x463be7.dataset.personReplacementStepDirection) < 0 ? -1 : 1),
    zoom: ({
      target: _0x2462e9,
      event: _0x47d0a1
    }) => _0x543b3a(_0x2462e9.dataset.personReplacementZoomDirection, {
      clientX: _0x47d0a1.clientX
    }),
    split: () => _0x4fed9f(),
    merge: () => _0x98d29d(),
    preview: ({
      target: _0x249de3,
      event: _0x3580fe
    }) => {
      const _0x5705e0 = _0x3440f2.draft[Math.trunc(Number(_0x249de3.dataset.personReplacementCutShotIndex))];
      if (!_0x5705e0) {
        return;
      }
      const _0xf534ca = _0x249de3.closest?.("[data-person-replacement-shot-cut-timeline]");
      if (_0xf534ca && Number.isFinite(Number(_0x3580fe.clientX))) {
        _0x21ccaa(_0x112119(_0x3580fe, _0xf534ca));
      } else {
        _0x4c0d1b(_0x5705e0.shotId, _0x5705e0.startSec);
      }
    }
  });
  const _0x403c9a = _0x300bc7 => {
    if (_0x300bc7.target?.dataset?.personReplacementField === "video-prompt" && handleSlashKeyboardNavigation(_0x300bc7)) {
      return;
    }
    if (_0x4f7632.handleKeyDown(_0x300bc7)) {
      return;
    }
    const _0x4e4480 = _0x300bc7.target?.closest?.("[data-person-replacement-composite-sidebar-splitter]");
    if (_0x4e4480 && ["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      const _0x17a19a = _0x4e4480.closest?.(".person-replacement-preview-workbench");
      const _0xf4ebf3 = _0x300bc7.key === "ArrowLeft" ? -16 : 16;
      _0x38e2d5.workspace.compositeSidebarWidth = applyPersonReplacementCompositeSidebarWidthToLayout(_0x17a19a, _0x4e4480, _0x38e2d5.workspace.compositeSidebarWidth + _0xf4ebf3);
      _0x575f0c("composite-sidebar-width");
      return;
    }
    const _0x125c13 = _0x300bc7.target?.closest?.("[data-person-replacement-voice-layout-splitter]");
    if (_0x125c13 && ["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      const _0x5ee3ca = normalizeText(_0x125c13.dataset?.personReplacementVoiceLayoutSplitter);
      if (["assets", "sources"].includes(_0x5ee3ca)) {
        const _0x466c39 = _0x125c13.closest?.("[data-person-replacement-voice-layout]");
        const _0x317862 = normalizePersonReplacementVoiceLayout(_0x38e2d5.workspace.voiceLayout);
        const _0x5bc13a = _0x300bc7.key === "ArrowLeft" ? -2 : 2;
        _0x38e2d5.workspace.voiceLayout = applyPersonReplacementVoiceLayoutToElement(_0x466c39, {
          ..._0x317862,
          ...(_0x5ee3ca === "assets" ? {
            assetsEnd: _0x317862.assetsEnd + _0x5bc13a
          } : {
            sourcesEnd: _0x317862.sourcesEnd + _0x5bc13a
          })
        });
        _0x575f0c("voice-layout");
      }
      return;
    }
    if (_0x300bc7.key === "Escape") {
      const _0x4caa41 = _0x318ed6?.querySelector?.(".person-replacement-add-voice-menu-wrap.is-open");
      if (_0x4caa41) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        const _0x10833f = _0x4caa41.querySelector?.("[data-story-action=\"toggle-character-voice-menu\"]");
        _0x36b2dc(_0x4caa41, false);
        _0x10833f?.focus?.();
        return;
      }
      const _0x475d49 = _0x318ed6?.querySelector?.(".person-replacement-library-add-menu-wrap.is-open");
      if (_0x475d49) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        const _0x4dbf65 = _0x475d49.querySelector?.("[data-person-replacement-action=\"toggle-library-add-targets\"]");
        _0x59d14f(_0x475d49, false);
        _0x4dbf65?.focus?.();
        return;
      }
    }
    if (_0x300bc7.key === "Escape" && _0x4eb471) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x494354({
        restoreFocus: true
      });
      return;
    }
    const _0x3a3920 = _0x300bc7.target?.closest?.("[data-person-replacement-person-custom-label]");
    if (_0x3a3920 && ["Enter", "Escape"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      const _0x37901c = _0x3a3920.closest?.("[data-person-replacement-detection-picker]");
      _0xb270a(_0x3a3920, {
        cancelled: _0x300bc7.key === "Escape"
      });
      _0x37901c?.querySelector?.("[data-person-replacement-detection-picker-trigger]")?.focus?.();
      return;
    }
    const _0x529ee0 = _0x300bc7.target?.closest?.("[data-person-replacement-cut-boundary-index]");
    if (_0x529ee0 && _0x3440f2.isOpen && ["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      const _0x244af9 = _0x300bc7.shiftKey ? 5 : _0x300bc7.ctrlKey ? 1 : 0;
      if (!_0x244af9) {
        return;
      }
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      const _0x46876b = Math.trunc(Number(_0x529ee0.dataset.personReplacementCutBoundaryIndex));
      const _0x55c309 = _0x3440f2.draft[_0x46876b - 1];
      const _0x5bd951 = _0x3440f2.draft[_0x46876b];
      const _0x21a5d9 = _0x300bc7.key === "ArrowRight" ? 1 : -1;
      const _0x3002b7 = a1155_0x2ba085(_0x55c309, _0x5bd951) * _0x244af9;
      _0x34b7b2(_0x46876b, Number(_0x5bd951?.startSec) + _0x21a5d9 * _0x3002b7, {
        active: _0x46876b
      });
      return;
    }
    const _0x4eacb0 = _0x300bc7.target?.closest?.("[data-person-replacement-cut-shot-index]");
    const _0x3682c5 = Boolean(_0x300bc7.target?.closest?.("input, textarea, select, [contenteditable=\"true\"], [role=\"textbox\"]"));
    if (_0x2530e8(_0x300bc7)) {
      return;
    }
    const _0x58f373 = _0x38e2d5.shots.find(_0x21213f => _0x21213f.id === _0x51aaf9);
    const _0x42c359 = _0x58f373?.people?.find(_0x1fe8f7 => _0x1fe8f7.id === _0x26dcb0);
    const _0x495e89 = _0x300bc7.key === "Delete" || _0x300bc7.key === "Del" || _0x300bc7.code === "Delete" || normalizeText(_0x300bc7.key).toLowerCase() === "d" || _0x300bc7.code === "KeyD";
    const _0xf80874 = _0x3a98ad();
    const _0x2dd420 = new Set(_0xf80874.map(_0x2dc560 => _0x2dc560.shotId));
    if (_0xf80874.length && _0x2dd420.size === 1 && _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 2 && !_0x3440f2.isOpen && !_0x3682c5 && !_0x300bc7.repeat && !_0x300bc7.ctrlKey && !_0x300bc7.metaKey && !_0x300bc7.altKey && _0x495e89) {
      const [_0x40f304] = _0x2dd420;
      const _0x1dfb02 = _0xf80874.map(_0x217b9f => _0x217b9f.person.id);
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x114d43();
      _0x443f39(onDeletePeopleRequested, {
        shotId: _0x40f304,
        personIds: _0x1dfb02
      });
      return;
    }
    if (_0xf80874.length && !_0x3682c5 && _0x300bc7.key === "Escape") {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x114d43();
      return;
    }
    if (_0x42c359 && _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 2 && !_0x3440f2.isOpen && !_0x3682c5 && !_0x300bc7.repeat && !_0x300bc7.ctrlKey && !_0x300bc7.metaKey && !_0x300bc7.altKey && _0x495e89) {
      const _0x517f43 = _0x51aaf9;
      const _0x1823d1 = _0x26dcb0;
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x5e89ff();
      _0x443f39(onDeletePeopleRequested, {
        shotId: _0x517f43,
        personIds: [_0x1823d1]
      });
      return;
    }
    const _0x89bc3c = Boolean(_0x300bc7.target?.closest?.(".person-replacement-shot-cut-action"));
    if (_0x3440f2.isOpen && !_0x9606aa() && !_0x3682c5 && (_0x300bc7.key === " " || _0x300bc7.code === "Space")) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      const _0x1666ef = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-editor]");
      if (_0x1666ef && _0x300bc7.target !== _0x1666ef) {
        try {
          _0x1666ef.focus?.({
            preventScroll: true
          });
        } catch {
          _0x1666ef.focus?.();
        }
      }
      if (!_0x300bc7.repeat) {
        _0x84883a();
      }
      return;
    }
    if (_0x3440f2.isOpen && !_0x9606aa() && !_0x3682c5 && !_0x89bc3c) {
      if (!_0x300bc7.repeat && (_0x300bc7.ctrlKey || _0x300bc7.metaKey) && !_0x300bc7.shiftKey && String(_0x300bc7.key || "").toLowerCase() === "z") {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x1a86dd();
        return;
      }
      if (!_0x300bc7.repeat && (_0x300bc7.ctrlKey || _0x300bc7.metaKey) && (String(_0x300bc7.key || "") === "+" || String(_0x300bc7.key || "") === "=" || _0x300bc7.code === "Equal")) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x543b3a("in");
        return;
      }
      if (!_0x300bc7.repeat && (_0x300bc7.ctrlKey || _0x300bc7.metaKey) && (String(_0x300bc7.key || "") === "-" || _0x300bc7.code === "Minus")) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x543b3a("out");
        return;
      }
      if (!_0x300bc7.repeat && (_0x300bc7.ctrlKey || _0x300bc7.metaKey) && (String(_0x300bc7.key || "") === "0" || _0x300bc7.code === "Digit0")) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x543b3a("reset");
        return;
      }
      if (!_0x300bc7.repeat && !_0x300bc7.ctrlKey && !_0x300bc7.metaKey && !_0x300bc7.altKey && (String(_0x300bc7.key || "").toLowerCase() === "c" || _0x300bc7.code === "KeyC")) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x4fed9f();
        return;
      }
      if (["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x25ddd5(_0x300bc7.key === "ArrowLeft" ? -1 : 1, _0x300bc7.shiftKey ? 5 : 1);
        return;
      }
      if (["Home", "End"].includes(_0x300bc7.key)) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x21ccaa(_0x300bc7.key === "Home" ? 0 : getPersonReplacementShotCutTotalDuration(_0x3440f2.draft));
        return;
      }
    }
    if (_0x4eacb0 && _0x3440f2.isOpen && _0x300bc7.key === "Enter") {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      const _0x27e528 = _0x3440f2.draft[Math.trunc(Number(_0x4eacb0.dataset.personReplacementCutShotIndex))];
      if (_0x27e528) {
        _0x4c0d1b(_0x27e528.shotId, _0x27e528.startSec);
      }
      return;
    }
    const _0x231fb8 = _0x300bc7.target?.closest?.("[data-story-asset-name-id][contenteditable=\"true\"]");
    if (_0x231fb8 && ["Enter", "Escape"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x4f57fb(_0x231fb8, {
        cancel: _0x300bc7.key === "Escape"
      });
      _0x231fb8.blur?.();
      return;
    }
    if (_0x300bc7.key === "Escape") {
      if (_0x747473()) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        return;
      }
      if (_0x49248e) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x2bcbe9(null, {
          cancelled: true
        });
        return;
      }
      if (_0x182068 || _0x3a640d) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x1f4615();
        return;
      }
      if (_0x3440f2.isSmartDetectOpen && !_0x3440f2.isSmartDetecting) {
        _0x300bc7.preventDefault();
        _0x300bc7.stopPropagation();
        _0x3440f2.isSmartDetectOpen = false;
        _0x3be3ab();
        return;
      }
      if (_0x3440f2.isOpen && !_0x5b60e4()) {
        _0x300bc7.preventDefault();
        _0x54af74({
          animate: true,
          renderWorkspace: true
        });
        return;
      }
      _0x40953d?.cancel?.();
      _0x2070fb();
    }
    const _0x5c8f60 = _0x300bc7.target?.closest?.("[data-person-replacement-target-appearance-wheel=\"true\"]");
    if (_0x5c8f60 && _0x38e2d5.workspace.step === 2 && ["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x38fc68(_0x5c8f60.dataset.personReplacementTargetCharacterId, _0x300bc7.key === "ArrowRight" ? 1 : -1);
      return;
    }
    const _0x882df9 = _0x300bc7.target?.closest?.("[data-person-replacement-shot-wheel=\"true\"]");
    if (_0x882df9 && _0x38e2d5.workspace.step === 2 && ["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0x312b30(_0x300bc7.key === "ArrowRight" ? 1 : -1);
      return;
    }
    const _0x1f8cab = _0x300bc7.target?.closest?.("[data-person-replacement-audio-bound-wheel=\"true\"]");
    if (_0x1f8cab && _0x38e2d5.workspace.step === 1 && _0x38e2d5.workspace.characterAssetTab === "audio" && ["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      _0x300bc7.preventDefault();
      _0x300bc7.stopPropagation();
      _0xad8cc9(_0x300bc7.key === "ArrowRight" ? 1 : -1);
      return;
    }
    const _0x35ac7f = _0x300bc7.target?.closest?.("[data-story-appearance-wheel=\"true\"]");
    if (!_0x35ac7f || !["ArrowLeft", "ArrowRight"].includes(_0x300bc7.key)) {
      return;
    }
    _0x300bc7.preventDefault();
    _0x300bc7.stopPropagation();
    _0xc490af(_0x300bc7.key === "ArrowRight" ? 1 : -1);
  };
  const _0xf5f74a = _0x37c7ef => {
    _0x37c7ef.stopPropagation();
    const _0x2ec5a5 = _0x37c7ef.target?.closest?.(".person-replacement-image-preview-slide:not(.person-replacement-image-preview-slide--outgoing) > img");
    if (_0x2ec5a5 && _0x318ed6?.contains?.(_0x2ec5a5)) {
      const _0x4cf911 = normalizeMediaUrl(_0x2ec5a5.currentSrc || _0x2ec5a5.getAttribute?.("src"));
      if (!_0x4cf911) {
        return;
      }
      _0x37c7ef.preventDefault();
      openImagePreview(_0x4cf911, {
        alt: _0x2ec5a5.alt || "替换图片生成结果预览"
      });
      return;
    }
    const _0x2fe070 = _0x37c7ef.target?.closest?.("video[data-person-replacement-video-player=\"result\"]");
    if (_0x2fe070 && _0x318ed6?.contains?.(_0x2fe070)) {
      const _0x5e8a54 = normalizeMediaUrl(_0x2fe070.dataset?.personReplacementVideoUrl || _0x2fe070.getAttribute?.("src") || _0x2fe070.currentSrc);
      if (!_0x5e8a54) {
        return;
      }
      const _0x5ea95c = normalizeMediaUrl(_0x2fe070.currentSrc || _0x2fe070.getAttribute?.("src"));
      _0x37c7ef.preventDefault();
      openVideoPreview(_0x5e8a54, {
        playbackUrl: _0x5ea95c
      });
      return;
    }
    const _0xe8bdfb = _0x37c7ef.target?.closest?.("img.story-asset-preview");
    if (!_0xe8bdfb || !_0x318ed6?.contains?.(_0xe8bdfb)) {
      return;
    }
    const _0x15b41c = normalizeMediaUrl(_0xe8bdfb.currentSrc || _0xe8bdfb.getAttribute?.("src"));
    if (!_0x15b41c) {
      return;
    }
    _0x37c7ef.preventDefault();
    openImagePreview(_0x15b41c, {
      alt: _0xe8bdfb.alt || "人物形象图片预览"
    });
  };
  const _0x59ec0d = (_0x3962e8 = {}) => {
    _0x38e2d5 = a1155_0x56b8cf({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        ..._0x3962e8
      }
    });
    _0x3be3ab();
    return cloneJson(_0x38e2d5);
  };
  const _0x43e08d = () => {
    if (_0x38e2d5.workspace.view !== "home") {
      return false;
    }
    const _0x120af8 = _0x318ed6?.querySelector?.("[data-person-replacement-smart-clip-settings]");
    const _0x29fb63 = _0x120af8?.querySelector?.("[data-person-replacement-action=\"toggle-smart-clip-settings\"]");
    if (!_0x120af8 || !_0x29fb63) {
      return false;
    }
    const _0x1cd505 = _0x38e2d5.workspace.smartClipSettingsOpen === true;
    const _0x5f50e3 = _0x120af8.querySelector?.(".person-replacement-smart-clip-settings-panel");
    if (_0x1cd505 && !_0x5f50e3 && typeof _0x120af8.insertAdjacentHTML !== "function") {
      return false;
    }
    _0x29fb63.classList?.toggle?.("is-active", _0x1cd505);
    _0x29fb63.setAttribute?.("aria-expanded", String(_0x1cd505));
    if (_0x1cd505 && !_0x5f50e3) {
      _0x120af8.insertAdjacentHTML("beforeend", personReplacementShellPresentation.renderSmartClipSettingsPanel(_0x38e2d5));
    } else if (!_0x1cd505) {
      _0x5f50e3?.remove?.();
    }
    _0x120af8.querySelectorAll?.("[data-smart-clip-mode]")?.forEach?.(_0xc779 => {
      const _0x6b9db4 = _0xc779.dataset?.smartClipMode === _0x38e2d5.settings.smartClipMode;
      _0xc779.classList?.toggle?.("is-active", _0x6b9db4);
      _0xc779.setAttribute?.("aria-pressed", String(_0x6b9db4));
    });
    _0x120af8.querySelectorAll?.("[data-smart-clip-fps]")?.forEach?.(_0x2d6020 => {
      const _0x304368 = Number(_0x2d6020.dataset?.smartClipFps) === _0x38e2d5.settings.smartClipFps;
      _0x2d6020.classList?.toggle?.("is-active", _0x304368);
      _0x2d6020.setAttribute?.("aria-pressed", String(_0x304368));
    });
    return true;
  };
  const _0x4cc6c9 = ({
    workspace = {},
    settings = {}
  } = {}, {
    notify = false
  } = {}) => {
    _0x38e2d5 = a1155_0x56b8cf({
      ..._0x38e2d5,
      settings: {
        ..._0x38e2d5.settings,
        ...settings
      },
      workspace: {
        ..._0x38e2d5.workspace,
        ...workspace
      }
    });
    if (!_0x43e08d()) {
      _0x3be3ab();
    }
    if (notify) {
      _0x575f0c("smart-clip-settings");
    }
    return cloneJson(_0x38e2d5);
  };
  const _0x3ab1fb = _0x3bb9cc => {
    const _0x28b933 = _0x318ed6?.querySelector?.("[data-story-project-sort-wrap]");
    const _0x23bf4f = _0x28b933?.querySelector?.("[data-story-action='toggle-project-sort-menu']");
    const _0x3f5173 = _0x28b933?.querySelector?.("[data-story-project-sort-menu]");
    _0x28b933?.classList?.toggle?.("is-open", _0x3bb9cc);
    _0x23bf4f?.setAttribute?.("aria-expanded", String(_0x3bb9cc));
    _0x3f5173?.setAttribute?.("aria-hidden", String(!_0x3bb9cc));
  };
  const _0x2070fb = (_0x4249da = null) => {
    _0x318ed6?.querySelectorAll?.(".story-home-param-picker.is-open")?.forEach?.(_0x44c108 => {
      if (_0x44c108 === _0x4249da) {
        return;
      }
      _0x44c108.classList?.remove?.("is-open");
      _0x44c108.querySelector?.("[data-story-home-param-trigger]")?.setAttribute?.("aria-expanded", "false");
    });
  };
  const _0x598457 = _0x1c08b5 => {
    const _0xcf3912 = _0x1c08b5?.querySelector?.("[data-person-replacement-detection-picker-menu]");
    const _0x2a6975 = _0x1c08b5?.querySelector?.("[data-person-replacement-detection-picker-trigger]");
    if (!_0xcf3912 || !_0x2a6975) {
      return false;
    }
    if (_0xcf3912.dataset?.personReplacementPickerOptionsReady === "true") {
      return true;
    }
    const _0x29c428 = normalizeText(_0x1c08b5.dataset?.personReplacementDetectionPicker);
    let _0x2e3a5f = [];
    if (_0x29c428 === "orientation") {
      _0x2e3a5f = getPersonOrientationOptions();
    } else if (_0x29c428 === "scope") {
      _0x2e3a5f = getPersonReplacementScopeOptions();
    } else if (_0x29c428 === "label") {
      const _0x34b2cb = _0x1c08b5.closest?.(".person-replacement-detection-box");
      const _0x3dfddb = normalizeText(_0x34b2cb?.dataset?.shotId || _0x38e2d5.workspace.selectedShotId);
      const _0x22cefe = _0x38e2d5.shots.find(_0x4238a7 => _0x4238a7.id === _0x3dfddb);
      const _0x4c6b9a = a1155_0x499c74(_0x22cefe);
      const _0x5dbea4 = normalizeText(_0x2a6975.querySelector?.("[data-person-replacement-detection-picker-value]")?.textContent, _0x2a6975.value);
      _0x2e3a5f = a1155_0x3d39a9({
        labels: [..._0x4c6b9a.map((_0xa7482, _0x243a7c) => formatPersonReplacementPersonLabel(_0x243a7c)), ...a1155_0x2f3779(_0x38e2d5)],
        selectedLabel: _0x5dbea4,
        removedLabels: _0x38e2d5.workspace.removedCustomPersonLabels,
        project: _0x38e2d5
      });
    }
    _0xcf3912.innerHTML = personReplacementIdentityPresentation.renderOverlay("picker-options", {
      options: _0x2e3a5f,
      selectedValue: _0x2a6975.value
    });
    if (_0xcf3912.dataset) {
      _0xcf3912.dataset.personReplacementPickerOptionsReady = "true";
    }
    return true;
  };
  const _0x5a98b9 = (_0x614b30, _0x4ec770) => {
    const _0xe9f344 = _0x614b30?.querySelector?.("[data-person-replacement-detection-picker-trigger]");
    const _0x57c9a6 = _0x614b30?.querySelector?.("[data-person-replacement-detection-picker-menu]");
    if (_0x4ec770 && !_0x598457(_0x614b30)) {
      return false;
    }
    _0x614b30?.classList?.toggle?.("is-open", _0x4ec770);
    _0x614b30?.closest?.(".person-replacement-detection-box")?.classList?.toggle?.("is-picker-open", _0x4ec770);
    _0xe9f344?.setAttribute?.("aria-expanded", String(_0x4ec770));
    _0x57c9a6?.setAttribute?.("aria-hidden", String(!_0x4ec770));
    if (!_0x4ec770 && _0x57c9a6?.dataset?.personReplacementPickerOptionsLazy === "true") {
      _0x57c9a6.innerHTML = "";
      if (_0x57c9a6.dataset) {
        delete _0x57c9a6.dataset.personReplacementPickerOptionsReady;
      }
    }
    return true;
  };
  const _0x747473 = (_0x4e5085 = null) => {
    let _0x131c34 = false;
    _0x318ed6?.querySelectorAll?.("[data-person-replacement-detection-picker].is-open")?.forEach?.(_0x5ccc31 => {
      if (_0x5ccc31 === _0x4e5085) {
        return;
      }
      _0x5a98b9(_0x5ccc31, false);
      _0x131c34 = true;
    });
    return _0x131c34;
  };
  const _0xb270a = (_0x503e6e, {
    cancelled = false
  } = {}) => {
    if (!_0x503e6e || _0x503e6e.hidden) {
      return false;
    }
    const _0x2e246f = _0x503e6e.closest?.("[data-person-replacement-detection-picker]");
    const _0x3d9a88 = _0x503e6e.closest?.(".person-replacement-detection-box");
    const _0x31c29d = _0x2e246f?.querySelector?.("[data-person-replacement-detection-picker-trigger]");
    const _0x4ce4dc = _0x31c29d?.querySelector?.("[data-person-replacement-detection-picker-value]");
    if (!_0x2e246f || !_0x31c29d || !_0x4ce4dc) {
      return false;
    }
    const _0xbfba11 = normalizeText(_0x2e246f.dataset.personReplacementPreviousValue);
    const _0x1c49ca = normalizeText(_0x2e246f.dataset.personReplacementPreviousLabel, _0xbfba11);
    const _0xde94c9 = normalizeText(_0x2e246f.dataset.personReplacementPreviousSourceCharacterId);
    const _0x2a5cfb = normalizeText(_0x503e6e.value);
    const _0x1e39e3 = cancelled || !_0x2a5cfb;
    const _0x17b9d4 = _0x1e39e3 ? _0xbfba11 : PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE;
    const _0x5d42f9 = _0x1e39e3 ? _0x1c49ca : _0x2a5cfb;
    _0x31c29d.value = _0x17b9d4;
    _0x31c29d.dataset.personReplacementSelectedSourceCharacterId = _0x1e39e3 ? _0xde94c9 : normalizeText(_0x38e2d5.shots.find(_0x2a2d23 => _0x2a2d23.id === normalizeText(_0x3d9a88?.dataset?.shotId))?.people?.find(_0x52be4c => _0x52be4c.id === normalizeText(_0x3d9a88?.dataset?.personId))?.sourceCharacterId);
    _0x31c29d.hidden = false;
    _0x31c29d.setAttribute("aria-label", "人物名称：" + _0x5d42f9);
    _0x4ce4dc.textContent = _0x5d42f9;
    _0x503e6e.value = _0x5d42f9;
    _0x503e6e.hidden = true;
    _0x2e246f.querySelectorAll?.("[data-person-replacement-detection-picker-option]")?.forEach?.(_0x38623b => {
      const _0x8e5f41 = normalizeText(_0x38623b.dataset.personReplacementDetectionPickerOption) === _0x17b9d4;
      _0x38623b.classList?.toggle?.("is-selected", _0x8e5f41);
      _0x38623b.setAttribute?.("aria-selected", String(_0x8e5f41));
    });
    delete _0x2e246f.dataset.personReplacementPreviousValue;
    delete _0x2e246f.dataset.personReplacementPreviousLabel;
    delete _0x2e246f.dataset.personReplacementPreviousSourceCharacterId;
    if (!_0x1e39e3) {
      _0x358a3c({
        detectionBox: _0x3d9a88,
        label: _0x5d42f9,
        sourceCharacterId: _0x31c29d.dataset.personReplacementSelectedSourceCharacterId
      });
    }
    return !_0x1e39e3;
  };
  const _0x30e5a5 = _0x12f331 => {
    const _0xb50e70 = _0x12f331?.target;
    const _0x56ce1c = _0xb50e70?.closest?.("[data-story-marquee-surface=\"shots\"]");
    const _0x4ecd75 = _0x38e2d5.workspace.step === 1 && _0x38e2d5.workspace.assetSelectionMode && _0xb50e70?.closest?.(".person-replacement-assets-page");
    const _0x20e67b = [2, 3, 5].includes(_0x38e2d5.workspace.step) && _0x38e2d5.workspace.shotSelectionMode && _0x56ce1c;
    const _0x50f1c4 = _0xb50e70?.closest?.(PERSON_REPLACEMENT_MULTI_SELECTION_INTERACTIVE_SELECTOR);
    const _0xe11bf0 = _0x20e67b && _0x50f1c4 === _0x56ce1c;
    if (_0x38e2d5.workspace.view !== "project" || !_0x4ecd75 && !_0x20e67b || _0x50f1c4 && !_0xe11bf0) {
      return false;
    }
    _0x40953d?.cancel?.();
    _0x1ef913({
      ..._0x38e2d5,
      workspace: {
        ..._0x38e2d5.workspace,
        ...(_0x20e67b ? {
          shotSelectionMode: false,
          selectedShotIds: []
        } : {
          assetSelectionMode: false,
          selectedAssetIds: []
        })
      }
    }, _0x20e67b ? "shot-selection-cancel" : "asset-selection-cancel");
    return true;
  };
  const _0x3504be = _0x444d7c => {
    const _0x2c00e0 = () => {
      const _0x5364c2 = Array.from(_0x318ed6?.querySelectorAll?.("[data-story-project-title]") || []).find(_0x2fc9f7 => normalizeText(_0x2fc9f7.dataset.storyProjectTitle) === normalizeText(_0x444d7c));
      _0x5364c2?.focus?.();
      _0x5364c2?.select?.();
    };
    if (typeof windowObject?.requestAnimationFrame === "function") {
      windowObject.requestAnimationFrame(_0x2c00e0);
    } else {
      globalThis.queueMicrotask?.(_0x2c00e0);
    }
  };
  const _0x9910d3 = (_0x22c9ac, _0x41db08) => {
    if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "toggle-project-sort-menu") {
      const _0x1f67bc = _0x22c9ac.closest?.("[data-story-project-sort-wrap]");
      _0x3ab1fb(!_0x1f67bc?.classList?.contains?.("is-open"));
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "select-project-sort") {
      _0x59ec0d({
        projectSortOrder: normalizeWorkspaceProjectSortOrder(_0x22c9ac.dataset.storyProjectSortOption)
      });
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "toggle-archived-projects") {
      _0x59ec0d({
        showArchivedProjects: !_0x38e2d5.workspace.showArchivedProjects,
        openProjectMenuId: "",
        pendingDeleteProjectId: ""
      });
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "toggle-project-menu") {
      const _0x4ef932 = normalizeText(_0x22c9ac.dataset.storyProjectId);
      _0x59ec0d({
        openProjectMenuId: _0x38e2d5.workspace.openProjectMenuId === _0x4ef932 ? "" : _0x4ef932,
        pendingDeleteProjectId: ""
      });
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "rename-project") {
      const _0x78430b = normalizeText(_0x22c9ac.dataset.storyProjectId);
      _0x59ec0d({
        openProjectMenuId: "",
        pendingDeleteProjectId: ""
      });
      _0x3504be(_0x78430b);
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "duplicate-project") {
      _0x443f39(onDuplicateProjectRequested, {
        projectId: _0x22c9ac.dataset.storyProjectId
      });
    } else if (_0x38e2d5.workspace.view === "home" && (_0x41db08 === "archive-project" || _0x41db08 === "unarchive-project")) {
      _0x443f39(onArchiveProjectRequested, {
        projectId: _0x22c9ac.dataset.storyProjectId,
        archived: _0x41db08 === "archive-project"
      });
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "request-delete-project") {
      _0x59ec0d({
        openProjectMenuId: "",
        pendingDeleteProjectId: normalizeText(_0x22c9ac.dataset.storyProjectId)
      });
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "cancel-delete-project") {
      _0x59ec0d({
        pendingDeleteProjectId: ""
      });
    } else if (_0x38e2d5.workspace.view === "home" && _0x41db08 === "confirm-delete-project") {
      _0x443f39(onDeleteProjectRequested, {
        projectId: _0x22c9ac.dataset.storyProjectId
      });
    } else if (_0x41db08 === "target-previous-appearance" || _0x41db08 === "target-next-appearance") {
      const _0x4d33c3 = _0x22c9ac.closest?.("[data-person-replacement-target-controls]");
      _0x38fc68(_0x4d33c3?.dataset?.personReplacementTargetControls, _0x41db08 === "target-next-appearance" ? 1 : -1);
    } else if (_0x41db08 === "toggle-asset-selection") {
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          assetSelectionMode: true
        }
      }, "asset-selection-mode");
    } else if (_0x41db08 === "toggle-shot-selection") {
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          shotSelectionMode: true
        }
      }, "shot-selection-mode");
    } else if (_0x41db08 === "cancel-asset-selection") {
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          assetSelectionMode: false,
          selectedAssetIds: []
        }
      }, "asset-selection-cancel");
    } else if (_0x41db08 === "cancel-shot-selection") {
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          shotSelectionMode: false,
          selectedShotIds: []
        }
      }, "shot-selection-cancel");
    } else if (_0x41db08 === "cancel-shot-batch-generation") {
      _0x576fa0();
    } else if (_0x41db08 === "cancel-asset-batch-generation") {
      _0x56767c();
    } else if (_0x41db08 === "toggle-all-assets") {
      const _0xa0af85 = getPersonReplacementSelectableAssets(_0x38e2d5, _0x38e2d5.workspace.characterAssetTab);
      const _0x2b92db = _0xa0af85.length > 0 && _0xa0af85.every(_0x505b44 => _0x38e2d5.workspace.selectedAssetIds.includes(_0x505b44.id));
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          selectedAssetIds: _0x2b92db ? [] : _0xa0af85.map(_0x3a295a => _0x3a295a.id),
          assetSelectionMode: !_0x2b92db && _0xa0af85.length > 0
        }
      }, "asset-selection-all");
    } else if (_0x41db08 === "toggle-all-shots") {
      const _0x582633 = _0x38e2d5.shots.every(_0x17e93d => _0x38e2d5.workspace.selectedShotIds.includes(_0x17e93d.id));
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          selectedShotIds: _0x582633 ? [] : _0x38e2d5.shots.map(_0x5037c7 => _0x5037c7.id)
        }
      }, "shot-selection-all");
    } else if (_0x41db08 === "previous-appearance") {
      _0xc490af(-1);
    } else if (_0x41db08 === "next-appearance") {
      _0xc490af(1);
    } else if (_0x41db08 === "previous-audio-bound-character") {
      _0xad8cc9(-1);
    } else if (_0x41db08 === "next-audio-bound-character") {
      _0xad8cc9(1);
    } else if (_0x41db08 === "previous-shot") {
      _0x312b30(-1);
    } else if (_0x41db08 === "next-shot") {
      _0x312b30(1);
    } else if (_0x41db08 === "previous-replacement-image-result") {
      _0x3ebf25(-1);
    } else if (_0x41db08 === "next-replacement-image-result") {
      _0x3ebf25(1);
    } else if (_0x41db08 === "previous-replacement-video-result") {
      _0x247f30(-1);
    } else if (_0x41db08 === "next-replacement-video-result") {
      _0x247f30(1);
    } else if (_0x41db08 === "select-video-shot-reference") {
      _0x13d174(_0x22c9ac.dataset.shotId || _0x38e2d5.workspace.selectedShotId, _0x22c9ac.dataset.personReplacementVideoReferenceIndex);
    } else if (_0x41db08 === "select-replacement-image-result") {
      _0x547ea8(_0x22c9ac.dataset.shotId, _0x22c9ac.dataset.replacementImageResultIndex);
      _0x400efa();
    } else if (_0x41db08 === "set-replacement-image-reference") {
      _0x6872f7(_0x22c9ac.dataset.shotId, _0x22c9ac.dataset.replacementImageResultIndex);
    } else if (_0x41db08 === "delete-replacement-image-result") {
      _0x1a7b44(_0x22c9ac.dataset.shotId, _0x22c9ac.dataset.replacementImageResultIndex);
    } else if (_0x41db08 === "select-replacement-video-result") {
      _0x4d2659(_0x22c9ac.dataset.shotId, _0x22c9ac.dataset.replacementVideoResultIndex);
      _0x400efa();
    } else if (_0x41db08 === "delete-replacement-video-result") {
      _0x2bdcdf(_0x22c9ac.dataset.shotId, _0x22c9ac.dataset.replacementVideoResultIndex);
    } else if (_0x41db08 === "download-asset-image") {
      _0x479854(_0x22c9ac, _0x3c4384());
    } else if (_0x41db08 === "add-asset-appearance-to-library") {
      addPersonReplacementAppearanceToLibraryWithFly(_0x318ed6, _0x5026bd(), _0x96ff9b(), onAddAssetAppearanceToLibraryRequested, _0x443f39, documentObject, windowObject);
    } else if (_0x41db08 === "download-replacement-image") {
      _0x479854(_0x22c9ac, _0x3ce610());
    } else if (_0x41db08 === "upload-replacement-image") {
      _0x41ce6e = {
        kind: "replacement-image",
        shotId: _0x38e2d5.workspace.selectedShotId
      };
      _0x318ed6.querySelector("[data-person-replacement-input='replacement-image']")?.click?.();
    } else if (_0x41db08 === "upload-asset") {
      const _0xdd5271 = _0x5026bd();
      const _0x4d4636 = _0x96ff9b(_0xdd5271);
      _0x41ce6e = {
        kind: "appearance",
        characterId: _0xdd5271?.id,
        appearanceId: _0x4d4636?.id
      };
      _0x318ed6.querySelector("[data-person-replacement-input='appearance-image']")?.click?.();
    } else if (_0x41db08 === "toggle-character-voice-menu") {
      const _0x132b44 = _0x22c9ac.closest?.(".person-replacement-add-voice-menu-wrap");
      const _0x151e92 = !_0x132b44?.classList?.contains?.("is-open");
      _0xf5b39c(_0x132b44);
      _0x36b2dc(_0x132b44, _0x151e92);
    } else if (_0x41db08 === "upload-character-voice") {
      _0xf5b39c();
      _0x41ce6e = {
        kind: "voice",
        characterId: _0x5026bd()?.id
      };
      _0x318ed6.querySelector("[data-person-replacement-input='character-voice']")?.click?.();
    } else if (_0x41db08 === "choose-character-voice-from-library") {
      _0xf5b39c();
      const _0x3c2a24 = _0x5026bd();
      if (!_0x3c2a24) {
        windowObject?.showToast?.("请先选择要添加声音的人设。", "warn");
        return;
      }
      const _0x469cf6 = _0x38e2d5;
      const _0x5a7dba = getPersonReplacementProjectAudioAssets(_0x469cf6);
      const _0xea244e = _0x5a7dba.find(_0x4b5545 => getPersonReplacementVoiceLibraryBoundCharacters(_0x469cf6, _0x4b5545).some(_0xb8c93a => _0xb8c93a.id === _0x3c2a24.id));
      _0x59b80b = _0x3c2a24.id;
      _0x1ef913({
        ..._0x469cf6,
        workspace: {
          ..._0x469cf6.workspace,
          characterAssetTab: "audio",
          selectedAudioAssetId: _0xea244e?.id || _0x5a7dba[0]?.id || "",
          assetSelectionMode: false,
          selectedAssetIds: []
        }
      }, "character-voice-library-open");
    } else if (_0x41db08 === "set-base-appearance") {
      const _0x262e69 = _0x5026bd();
      const _0x51af19 = _0x96ff9b(_0x262e69);
      const _0xd2cf52 = _0x38e2d5.characters.map(_0x7433cd => _0x7433cd.id === _0x262e69?.id ? {
        ..._0x7433cd,
        baseAppearanceId: _0x51af19?.id
      } : _0x7433cd);
      _0x1ef913({
        ..._0x38e2d5,
        characters: _0xd2cf52
      }, "set-base-appearance");
    } else if (_0x41db08 === "delete-appearance") {
      const _0x5a150b = _0x5026bd();
      const _0x189702 = _0x96ff9b(_0x5a150b);
      if (!_0x5a150b || !_0x189702 || _0x189702.id === _0x5a150b.baseAppearanceId) {
        return;
      }
      const _0x3f208c = _0x38e2d5.characters.map(_0x4585a9 => _0x4585a9.id === _0x5a150b.id ? {
        ..._0x4585a9,
        appearances: _0x4585a9.appearances.filter(_0x40d9b2 => _0x40d9b2.id !== _0x189702.id)
      } : _0x4585a9);
      _0x1ef913({
        ..._0x38e2d5,
        characters: _0x3f208c,
        workspace: {
          ..._0x38e2d5.workspace,
          assetAppearanceIndexes: {
            ..._0x38e2d5.workspace.assetAppearanceIndexes,
            [_0x5a150b.id]: 0
          }
        }
      }, "delete-appearance");
    } else if (_0x41db08 === "delete-asset-card") {
      _0x44c2d8();
      const _0x3b8756 = normalizeText(_0x22c9ac.dataset.storyAssetDeleteId);
      if (_0x38e2d5.workspace.characterAssetTab === "scene" && _0x38e2d5.scenes.some(_0xd3f444 => _0xd3f444.id === _0x3b8756)) {
        _0x443f39(onDeleteSceneRequested, {
          sceneId: _0x3b8756
        });
      } else if (_0x38e2d5.workspace.characterAssetTab === "audio" && _0x38e2d5.audioAssets.some(_0x3086a8 => _0x3086a8.id === _0x3b8756)) {
        _0x443f39(onDeleteAudioAssetRequested, {
          audioAssetId: _0x3b8756
        });
      } else {
        _0x443f39(onDeleteCharacterRequested, {
          characterId: _0x3b8756
        });
      }
    } else if (_0x41db08 === "generate-asset") {
      const _0x2a1846 = _0x5026bd();
      const _0x4d123f = _0x96ff9b(_0x2a1846);
      _0x443f39(onGenerateCharacterImageRequested, {
        characterId: _0x2a1846?.id,
        appearanceId: _0x4d123f?.id,
        prompt: _0x4d123f?.prompt || _0x2a1846?.description,
        promptPresetId: _0x38e2d5.workspace.assetPromptPresetId,
        modelId: _0x38e2d5.settings.characterImageModelId,
        provider: _0x38e2d5.settings.characterImageProvider,
        providerProfileId: _0x38e2d5.settings.characterImageProviderProfileId,
        generationParams: _0x38e2d5.settings.characterImageGenerationParams
      });
    } else if (_0x41db08 === "batch-generate-assets" && [2, 3].includes(_0x38e2d5.workspace.step)) {
      _0x3e820c(_0x38e2d5.workspace.step === 3 ? "video" : "image");
    } else if (_0x41db08 === "batch-generate-assets") {
      _0x5e350b();
    } else if (_0x41db08 === "play-character-voice") {
      _0x1706ea(_0x22c9ac.dataset.storyVoiceAssetId);
    }
  };
  const _0x51f230 = (_0x51d0ee, _0x16167d) => {
    if (!_0x16167d.size) {
      return _0x51d0ee;
    }
    let _0x286e9a = {
      ..._0x51d0ee.workspace
    };
    _0x16167d.forEach(_0x465ba9 => {
      const _0x3c0c97 = resolvePersonReplacementImageGenerationState(_0x286e9a, _0x465ba9);
      _0x286e9a = updatePersonReplacementImageGenerationState(_0x286e9a, _0x3c0c97.status === "running" ? _0x3c0c97 : {
        status: "idle",
        shotId: _0x465ba9,
        error: ""
      });
      const _0x57cfd5 = resolvePersonReplacementVideoGenerationState(_0x286e9a, _0x465ba9);
      _0x286e9a = updatePersonReplacementVideoGenerationState(_0x286e9a, _0x57cfd5.status === "running" ? _0x57cfd5 : {
        status: "idle",
        shotId: _0x465ba9,
        error: ""
      });
    });
    return {
      ..._0x51d0ee,
      workspace: _0x286e9a
    };
  };
  const _0x1b4f0c = ({
    shotId = "",
    sceneId = "",
    appearanceId = ""
  } = {}, _0x481ffc = "scene-reference-change") => {
    const _0x16b35f = normalizeText(shotId);
    const _0x4d8832 = normalizeText(sceneId);
    const _0x28381c = normalizeText(appearanceId);
    const _0x2facfa = _0x38e2d5.shots.find(_0x3ef058 => _0x3ef058.id === _0x16b35f);
    if (!_0x2facfa) {
      return false;
    }
    if (_0x4d8832) {
      const _0x307976 = _0x38e2d5.scenes.find(_0x1415cb => _0x1415cb.id === _0x4d8832);
      const _0x18d586 = getWorkspaceAssetAppearances(_0x307976).find(_0x1bb998 => _0x1bb998.id === _0x28381c);
      if (!_0x307976 || !_0x18d586?.imageUrl) {
        return false;
      }
    }
    if (normalizeText(_0x2facfa.sceneReference?.sceneId) === _0x4d8832 && normalizeText(_0x2facfa.sceneReference?.appearanceId) === _0x28381c) {
      return false;
    }
    const _0x285425 = _0x51f230({
      ..._0x38e2d5,
      shots: _0x38e2d5.shots.map(_0x3ce70d => _0x3ce70d.id === _0x16b35f ? {
        ..._0x3ce70d,
        sceneReference: {
          sceneId: _0x4d8832,
          appearanceId: _0x28381c
        }
      } : _0x3ce70d)
    }, new Set([_0x16b35f]));
    _0x44c2d8();
    _0x1ef913(_0x285425, _0x481ffc);
    return true;
  };
  const _0x87a38a = ({
    shotId = "",
    personId = "",
    targetCharacterId = "",
    targetAppearanceId = ""
  } = {}, _0x434c80 = "person-mapping-clear") => {
    const _0x4b1086 = normalizeText(shotId);
    const _0x3c1d79 = normalizeText(personId);
    const _0x2f5b43 = normalizeText(targetCharacterId);
    const _0xcd5947 = normalizeText(targetAppearanceId);
    if (!_0x4b1086 || !_0x3c1d79 && !_0x2f5b43) {
      return false;
    }
    const _0x3d1772 = _0x38e2d5.shots.find(_0x3b57c3 => _0x3b57c3.id === _0x4b1086);
    if (!_0x3d1772) {
      return false;
    }
    const _0xc4776b = new Map(_0x38e2d5.mappings.map(_0xeaf293 => [normalizeText(_0xeaf293.sourceCharacterId), normalizeText(_0xeaf293.targetCharacterId)]));
    const _0x67083f = _0x3d1772.people.filter(_0xb58efd => {
      if (_0x3c1d79) {
        return _0xb58efd.id === _0x3c1d79;
      }
      const _0x3bb100 = normalizeText(_0xb58efd.sourceCharacterId);
      const _0x169d31 = normalizeText(_0xb58efd.targetCharacterId) || _0xc4776b.get(_0x3bb100) || "";
      return _0x169d31 === _0x2f5b43 && normalizeText(_0xb58efd.targetAppearanceId) === _0xcd5947;
    });
    if (!_0x67083f.length) {
      return false;
    }
    const _0x4e3bdd = _0x67083f.flatMap(_0x34f98c => getPersonReplacementBindingOccurrences(_0x38e2d5, {
      shotId: _0x4b1086,
      personId: _0x34f98c.id
    }));
    const _0x1f837b = new Set(_0x4e3bdd.map(({
      shotId: _0x20ba41,
      personId: _0x10268c
    }) => _0x20ba41 + ":" + _0x10268c));
    const _0x5d4abe = new Set(_0x4e3bdd.map(_0xc79eed => normalizeText(_0xc79eed.sourceCharacterId)).filter(Boolean));
    const _0x1e0218 = new Set();
    const _0x2d0c4f = _0x38e2d5.shots.map(_0x3adbd3 => {
      let _0x1e2da7 = false;
      const _0x29880d = _0x3adbd3.people.map(_0x20a0af => {
        const _0x5b2a04 = normalizeText(_0x20a0af.sourceCharacterId);
        const _0x209565 = _0x1f837b.has(_0x3adbd3.id + ":" + _0x20a0af.id);
        if (!_0x209565 || !normalizeText(_0x20a0af.targetCharacterId) && !normalizeText(_0x20a0af.targetAppearanceId) && !_0xc4776b.get(_0x5b2a04)) {
          return _0x20a0af;
        }
        _0x1e2da7 = true;
        return {
          ..._0x20a0af,
          targetCharacterId: "",
          targetAppearanceId: ""
        };
      });
      if (!_0x1e2da7) {
        return _0x3adbd3;
      }
      _0x1e0218.add(_0x3adbd3.id);
      return {
        ..._0x3adbd3,
        people: _0x29880d
      };
    });
    const _0x498d73 = _0x38e2d5.mappings.filter(_0x522d49 => !_0x5d4abe.has(normalizeText(_0x522d49.sourceCharacterId)));
    if (!_0x1e0218.size && _0x498d73.length === _0x38e2d5.mappings.length) {
      return false;
    }
    const _0xc0d669 = _0x51f230({
      ..._0x38e2d5,
      shots: _0x2d0c4f,
      mappings: _0x498d73
    }, _0x1e0218);
    _0x44c2d8();
    _0x1ef913(_0xc0d669, _0x434c80);
    return true;
  };
  const _0x37a131 = ({
    shotId = "",
    personId = "",
    targetCharacterId = "",
    targetAppearanceId = "",
    scope = "current"
  } = {}) => {
    const _0x7c21a2 = normalizeText(shotId);
    const _0x4e3321 = normalizeText(personId);
    const _0x1dca0e = normalizeText(targetCharacterId);
    const _0x2427c5 = normalizeText(targetAppearanceId);
    if (!_0x7c21a2 || !_0x4e3321 || !_0x1dca0e || !_0x2427c5) {
      return false;
    }
    const _0x35a769 = _0x38e2d5.shots.find(_0x50bfcd => _0x50bfcd.id === _0x7c21a2);
    const _0x4e2b07 = _0x35a769?.people.find(_0x489ec4 => _0x489ec4.id === _0x4e3321);
    if (!_0x4e2b07) {
      return false;
    }
    const _0xb2e178 = normalizeText(scope).toLowerCase() !== "current";
    const _0x384df3 = _0xb2e178 ? getPersonReplacementBindingOccurrences(_0x38e2d5, {
      shotId: _0x7c21a2,
      personId: _0x4e3321
    }) : [{
      shotId: _0x7c21a2,
      personId: _0x4e3321,
      sourceCharacterId: normalizeText(_0x4e2b07.sourceCharacterId)
    }];
    const _0x1efea4 = new Set(_0x384df3.map(({
      shotId: _0x59d829,
      personId: _0x3222f4
    }) => _0x59d829 + ":" + _0x3222f4));
    const _0x495a1e = new Set(_0x384df3.map(_0x4d7a02 => normalizeText(_0x4d7a02.sourceCharacterId)).filter(Boolean));
    const _0x5e9a42 = getPersonReplacementCrossRoleSourceCharacterIds(_0x38e2d5);
    const _0x242da6 = new Set([..._0x495a1e].filter(_0x3a83b0 => !_0x5e9a42.has(_0x3a83b0)));
    const _0xa1c0ad = new Map(_0x38e2d5.mappings.map(_0x55d3c6 => [normalizeText(_0x55d3c6.sourceCharacterId), normalizeText(_0x55d3c6.targetCharacterId)]));
    const _0x1420ac = new Set();
    const _0x1c4d68 = _0x38e2d5.shots.map(_0xf0b8ec => {
      let _0x5e473c = false;
      const _0x174ade = _0xf0b8ec.people.map(_0x36b2a4 => {
        const _0x4c00ba = _0x1efea4.has(_0xf0b8ec.id + ":" + _0x36b2a4.id);
        if (_0x4c00ba) {
          if (normalizeText(_0x36b2a4.targetCharacterId) === _0x1dca0e && normalizeText(_0x36b2a4.targetAppearanceId) === _0x2427c5) {
            return _0x36b2a4;
          }
          _0x5e473c = true;
          return {
            ..._0x36b2a4,
            targetCharacterId: _0x1dca0e,
            targetAppearanceId: _0x2427c5
          };
        }
        const _0x209be = normalizeText(_0x36b2a4.sourceCharacterId);
        const _0x16da75 = _0xa1c0ad.get(_0x209be) || "";
        const _0x3278fc = Boolean(_0xb2e178 && _0x495a1e.has(_0x209be) && _0x5e9a42.has(_0x209be) && _0x16da75 && normalizeText(_0x36b2a4.targetCharacterId) === _0x16da75);
        if (!_0x3278fc) {
          return _0x36b2a4;
        }
        _0x5e473c = true;
        return {
          ..._0x36b2a4,
          targetCharacterId: "",
          targetAppearanceId: ""
        };
      });
      if (!_0x5e473c) {
        return _0xf0b8ec;
      }
      _0x1420ac.add(_0xf0b8ec.id);
      return {
        ..._0xf0b8ec,
        people: _0x174ade
      };
    });
    const _0x346cba = _0xb2e178 && _0x495a1e.size ? [..._0x38e2d5.mappings.filter(_0x4f8034 => !_0x495a1e.has(normalizeText(_0x4f8034.sourceCharacterId))), ...[..._0x242da6].map(_0x45dc76 => ({
      sourceCharacterId: _0x45dc76,
      targetCharacterId: _0x1dca0e
    }))] : _0x38e2d5.mappings;
    const _0x4d076c = _0xb2e178 && ([..._0x495a1e].some(_0x558b9b => _0xa1c0ad.has(_0x558b9b) && !_0x242da6.has(_0x558b9b)) || [..._0x242da6].some(_0x464632 => _0xa1c0ad.get(_0x464632) !== _0x1dca0e));
    if (!_0x1420ac.size && !_0x4d076c) {
      return false;
    }
    const _0x3226da = _0x51f230({
      ..._0x38e2d5,
      shots: _0x1c4d68,
      mappings: _0x346cba
    }, _0x1420ac);
    _0x44c2d8();
    _0x1ef913(_0x3226da, _0xb2e178 ? "person-mapping" : "person-mapping-current-shot");
    return true;
  };
  const _0x494354 = ({
    restoreFocus = false
  } = {}) => {
    const _0x2c139a = _0x4eb471?.focusTarget;
    _0x4eb471 = null;
    _0x318ed6?.querySelector?.("[data-person-replacement-mapping-scope-menu]")?.remove?.();
    if (restoreFocus) {
      _0x2c139a?.focus?.();
    }
  };
  const _0x107aa4 = ({
    personBox: _0x358ba3,
    mapping: _0x9b11de,
    personLabel = "",
    targetName = "",
    appearanceName = "",
    clientX: _0x2e12d4,
    clientY: _0x1c0a86
  } = {}) => {
    if (!_0x318ed6 || !_0x358ba3 || !_0x9b11de) {
      return false;
    }
    _0x494354();
    _0x4eb471 = {
      mapping: _0x9b11de,
      focusTarget: _0x358ba3
    };
    _0x318ed6.insertAdjacentHTML?.("beforeend", personReplacementIdentityPresentation.renderOverlay("mapping-scope", {
      personLabel: personLabel,
      targetName: targetName,
      appearanceName: appearanceName
    }));
    const _0x4ec1c0 = _0x318ed6.querySelector?.("[data-person-replacement-mapping-scope-menu]");
    if (!_0x4ec1c0) {
      _0x4eb471 = null;
      return false;
    }
    const _0x487b0c = _0x318ed6.getBoundingClientRect?.();
    const _0x31c870 = _0x358ba3.getBoundingClientRect?.();
    const _0x397aa4 = _0x4ec1c0.getBoundingClientRect?.();
    if (_0x487b0c && _0x31c870 && _0x397aa4) {
      const _0x3dd596 = _0x397aa4.width || 260;
      const _0x2c1265 = _0x397aa4.height || 170;
      const _0x4e4ce5 = Number.isFinite(Number(_0x2e12d4)) ? Number(_0x2e12d4) : _0x31c870.right;
      const _0x4dad26 = Number.isFinite(Number(_0x1c0a86)) ? Number(_0x1c0a86) : _0x31c870.top;
      const _0x4a777b = clamp(_0x4e4ce5 - _0x487b0c.left - _0x3dd596 / 2, 12, _0x487b0c.width - _0x3dd596 - 12, 12);
      const _0x14934d = _0x4dad26 - _0x487b0c.top + 10;
      const _0x46089e = _0x14934d + _0x2c1265 <= _0x487b0c.height - 12 ? _0x14934d : clamp(_0x4dad26 - _0x487b0c.top - _0x2c1265 - 10, 12, _0x487b0c.height - _0x2c1265 - 12, 12);
      _0x4ec1c0.style?.setProperty?.("--person-replacement-mapping-scope-left", _0x4a777b + "px");
      _0x4ec1c0.style?.setProperty?.("--person-replacement-mapping-scope-top", _0x46089e + "px");
    }
    _0x4ec1c0.querySelector?.("[data-person-replacement-mapping-scope='current']")?.focus?.();
    return true;
  };
  const _0x5f0f1a = _0x126a0b => {
    const _0x395948 = _0x1ee1c3;
    _0x1ee1c3 = null;
    if (_0x395948 && (_0x126a0b.target === _0x395948 || _0x395948.contains?.(_0x126a0b.target))) {
      _0x126a0b.preventDefault?.();
      _0x126a0b.stopPropagation?.();
      return;
    }
    if (!_0x126a0b.target?.closest?.("[data-person-replacement-output-menu]")) {
      _0x282d91();
    }
    if (!_0x126a0b.target?.closest?.(".person-replacement-library-add-menu-wrap")) {
      _0x2cb99f();
    }
    if (!_0x126a0b.target?.closest?.(".person-replacement-add-voice-menu-wrap")) {
      _0xf5b39c();
    }
    if (_0x4f8d14.toggleFromTarget(_0x126a0b.target)) {
      return;
    }
    if (_0x40953d?.consumeClick?.(_0x126a0b)) {
      return;
    }
    if (!_0x126a0b.target?.closest?.(".story-home-param-picker")) {
      _0x2070fb();
    }
    if (!_0x126a0b.target?.closest?.("[data-person-replacement-detection-picker]")) {
      _0x747473();
    }
    if (_0x30e5a5(_0x126a0b)) {
      return;
    }
    const _0x5378fe = _0x126a0b.target?.closest?.("[data-person-replacement-shot-cut-timeline]");
    if (_0x3440f2.isOpen && _0x5378fe && Number(_0x126a0b.detail) > 0 && !_0x126a0b.target?.closest?.("[data-person-replacement-cut-boundary-index]")) {
      _0x126a0b.preventDefault?.();
      _0x21ccaa(_0x112119(_0x126a0b, _0x5378fe));
      return;
    }
    const _0x307403 = _0x126a0b.target?.closest?.("[data-story-asset-name-id]");
    if (_0x307403 && _0x318ed6.contains(_0x307403)) {
      _0x126a0b.preventDefault?.();
      _0x126a0b.stopPropagation?.();
      _0x44c2d8();
      _0x1ab626(_0x307403);
      return;
    }
    const _0xb24788 = _0x126a0b.target?.closest?.("[data-story-home-param-trigger=\"asset-preset\"]");
    if (_0xb24788 && _0x318ed6.contains(_0xb24788)) {
      const _0x54cf90 = _0xb24788.closest?.(".story-home-param-picker");
      const _0x4d0d3e = !_0x54cf90?.classList?.contains?.("is-open");
      _0x2070fb(_0x54cf90);
      _0x54cf90?.classList?.toggle?.("is-open", _0x4d0d3e);
      _0xb24788.setAttribute?.("aria-expanded", String(_0x4d0d3e));
      return;
    }
    const _0x1d4dc2 = _0x126a0b.target?.closest?.("[data-story-asset-preset-option]");
    if (_0x1d4dc2 && _0x318ed6.contains(_0x1d4dc2)) {
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          assetPromptPresetId: a1155_0x368647(_0x1d4dc2.dataset.storyAssetPresetOption)
        }
      }, "asset-prompt-preset");
      return;
    }
    const _0x5f4700 = _0x126a0b.target?.closest?.("[data-ref-remove-action]");
    if (_0x5f4700 && _0x318ed6.contains(_0x5f4700)) {
      const _0x15a3da = normalizeText(_0x5f4700.dataset.refRemoveAction);
      if (["clear-person-replacement-target", "clear-person-replacement-scene-reference"].includes(_0x15a3da)) {
        _0x126a0b.preventDefault?.();
        let _0x45dee1 = null;
        try {
          _0x45dee1 = JSON.parse(_0x5f4700.dataset.refRemoveValue || "{}");
        } catch {
          _0x45dee1 = null;
        }
        if (_0x45dee1 && _0x15a3da === "clear-person-replacement-target") {
          _0x87a38a(_0x45dee1, "person-mapping-clear-reference");
        } else if (_0x45dee1 && _0x15a3da === "clear-person-replacement-scene-reference") {
          _0x1b4f0c({
            shotId: _0x45dee1.shotId
          }, "scene-reference-clear");
        }
        return;
      }
    }
    const _0xc5ad89 = _0x126a0b.target?.closest?.("[data-person-replacement-video-reference-inputs] .ref-thumb-delete");
    if (_0xc5ad89 && _0x318ed6.contains(_0xc5ad89)) {
      const _0x14c8bd = _0xc5ad89.closest?.("[data-slot]");
      if (_0x14c8bd) {
        _0x126a0b.preventDefault?.();
        _0x443f39(onReplacementVideoInputRemoved, {
          shotId: _0x38e2d5.workspace.selectedShotId,
          slotId: _0x14c8bd.dataset.slot,
          kind: _0x14c8bd.dataset.kind,
          modelId: _0x38e2d5.settings.replacementModelId
        }, {}, {
          applyCallbackResult: false
        });
      }
      return;
    }
    const _0x3fd5ee = _0x126a0b.target?.closest?.("[data-person-replacement-video-reference-inputs] .ref-upload-slot[data-slot]");
    if (_0x3fd5ee && _0x318ed6.contains(_0x3fd5ee)) {
      const _0x5b8271 = normalizeText(_0x3fd5ee.dataset.kind);
      _0x41ce6e = {
        kind: _0x5b8271,
        shotId: _0x38e2d5.workspace.selectedShotId,
        slotId: _0x3fd5ee.dataset.slot,
        modelId: _0x38e2d5.settings.replacementModelId
      };
      const _0x523b5b = _0x318ed6.querySelector?.("[data-person-replacement-input='replacement-video-slot']");
      if (_0x523b5b) {
        _0x523b5b.accept = _0x5b8271 === "image" ? "image/*" : "video/*";
        _0x523b5b.click?.();
      }
      return;
    }
    const _0x5318f3 = _0x126a0b.target?.closest?.("[data-story-asset-id]");
    if (_0x5318f3 && _0x318ed6.contains(_0x5318f3)) {
      const _0x381356 = normalizeText(_0x5318f3.dataset.storyAssetId);
      if (_0x5318f3.dataset.personReplacementShotCard === "true") {
        const _0xd09d35 = resolveWorkspaceCardMultiSelection({
          selectedIds: _0x38e2d5.workspace.selectedShotIds,
          itemId: _0x381356,
          activeItemId: _0x38e2d5.workspace.selectedShotId,
          selectionMode: _0x38e2d5.workspace.shotSelectionMode,
          shiftKey: _0x126a0b.shiftKey === true
        });
        if (_0xd09d35.handled) {
          _0x1ef913({
            ..._0x38e2d5,
            workspace: {
              ..._0x38e2d5.workspace,
              shotSelectionMode: true,
              selectedShotIds: _0xd09d35.selectedIds
            }
          }, "shot-selection");
        } else {
          _0x395527(_0x381356);
        }
      } else if (_0x38e2d5.workspace.step === 2 && _0x5318f3.dataset.personReplacementReplacementAssetKind === "scene") {
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            selectedSceneId: _0x381356
          }
        }, "replacement-scene-asset-select");
      } else if (_0x38e2d5.workspace.step === 2 && _0x5318f3.dataset.personReplacementTargetCharacterId) {
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            selectedCharacterId: _0x381356
          }
        }, "replacement-target-asset-select");
      } else if (_0x38e2d5.workspace.characterAssetTab === "audio") {
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            selectedAudioAssetId: _0x381356,
            assetSelectionMode: false,
            selectedAssetIds: []
          }
        }, "audio-library-asset-select");
      } else if (_0x38e2d5.workspace.characterAssetTab === "scene") {
        const _0x3613de = resolveWorkspaceCardMultiSelection({
          selectedIds: _0x38e2d5.workspace.selectedAssetIds,
          itemId: _0x381356,
          activeItemId: _0x38e2d5.workspace.selectedSceneId,
          selectionMode: _0x38e2d5.workspace.assetSelectionMode,
          shiftKey: _0x126a0b.shiftKey === true
        });
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            ...(_0x3613de.handled ? {
              assetSelectionMode: _0x3613de.selectionMode,
              selectedAssetIds: _0x3613de.selectedIds
            } : {
              selectedSceneId: _0x381356
            })
          }
        }, _0x3613de.handled ? "scene-asset-selection" : "scene-asset-select");
      } else if (_0x38e2d5.workspace.characterAssetTab === "library") {
        const _0x3fe619 = _0x38e2d5.libraryAssets.find(_0x474b27 => _0x474b27.id === _0x381356);
        const _0x51df43 = resolveWorkspaceCardMultiSelection({
          selectedIds: _0x38e2d5.workspace.selectedAssetIds,
          itemId: _0x381356,
          activeItemId: _0x38e2d5.workspace.selectedLibraryAssetId,
          selectionMode: _0x38e2d5.workspace.assetSelectionMode,
          shiftKey: _0x126a0b.shiftKey === true,
          enabled: Boolean(normalizeText(_0x3fe619?.mediaKind).toLowerCase() === "image" && normalizeText(_0x3fe619?.sourceUrl || _0x3fe619?.imageUrl) || normalizeText(_0x3fe619?.mediaKind).toLowerCase() === "audio" && getPersonReplacementLibraryAudioRef(_0x3fe619))
        });
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            selectedLibraryAssetId: _0x381356,
            ...(_0x51df43.handled ? {
              assetSelectionMode: true,
              selectedAssetIds: _0x51df43.selectedIds
            } : {})
          }
        }, "library-asset-select");
      } else {
        const _0x4e643c = resolveWorkspaceCardMultiSelection({
          selectedIds: _0x38e2d5.workspace.selectedAssetIds,
          itemId: _0x381356,
          activeItemId: _0x38e2d5.workspace.selectedCharacterId,
          selectionMode: _0x38e2d5.workspace.assetSelectionMode,
          shiftKey: _0x126a0b.shiftKey === true
        });
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            ...(_0x4e643c.handled ? {
              assetSelectionMode: _0x4e643c.selectionMode,
              selectedAssetIds: _0x4e643c.selectedIds
            } : {
              selectedCharacterId: _0x381356
            })
          }
        }, _0x4e643c.handled ? "asset-selection" : "asset-select");
      }
      return;
    }
    const _0x5a7fed = _0x126a0b.target?.closest?.("[data-story-action]");
    if (_0x5a7fed && _0x318ed6.contains(_0x5a7fed)) {
      _0x9910d3(_0x5a7fed, normalizeText(_0x5a7fed.dataset.storyAction));
      return;
    }
    const _0x4c7843 = _0x126a0b.target?.closest?.("[data-story-open-project]");
    if (_0x4c7843 && _0x318ed6.contains(_0x4c7843) && !_0x126a0b.target?.closest?.("[data-story-project-title]")) {
      _0x443f39(onOpenProjectRequested, _0x4c7843.dataset.storyOpenProject);
      return;
    }
    if (_0x38e2d5.workspace.view === "home" && !_0x126a0b.target?.closest?.("[data-story-project-sort-wrap]")) {
      _0x3ab1fb(false);
    }
    if (_0x38e2d5.workspace.view === "home" && _0x38e2d5.workspace.openProjectMenuId && !_0x126a0b.target?.closest?.("[data-story-project-menu-wrap]")) {
      _0x38e2d5 = a1155_0x56b8cf({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          openProjectMenuId: ""
        }
      });
      _0x318ed6?.querySelectorAll?.(".story-project-card.is-menu-open")?.forEach?.(_0x5819e6 => {
        _0x5819e6.classList?.remove?.("is-menu-open");
        const _0x13b928 = _0x5819e6.querySelector?.("[data-story-action='toggle-project-menu']");
        const _0x9ecaea = _0x5819e6.querySelector?.("[data-story-project-menu]");
        _0x13b928?.setAttribute?.("aria-expanded", "false");
        _0x9ecaea?.setAttribute?.("aria-hidden", "true");
        if (_0x9ecaea) {
          _0x9ecaea.hidden = true;
        }
      });
    }
    if (_0x126a0b.target?.closest?.("[data-person-replacement-cut-boundary-index]")) {
      return;
    }
    const _0x4468d8 = _0x126a0b.target?.closest?.("[data-person-replacement-action]");
    if (!_0x4468d8 || !_0x318ed6.contains(_0x4468d8)) {
      return;
    }
    const _0x580111 = _0x4468d8.dataset.personReplacementAction;
    if (_0x580111 === "confirm-person-mapping-scope") {
      const _0x354f81 = _0x4eb471?.mapping;
      const _0x3d8810 = normalizeText(_0x4468d8.dataset.personReplacementMappingScope).toLowerCase() === "current" ? "current" : "all";
      _0x494354();
      if (_0x354f81) {
        _0x37a131({
          ..._0x354f81,
          scope: _0x3d8810
        });
      }
    } else if (_0x580111 === "close") {
      _0x47c105.close();
    } else if (_0x580111 === "back-home") {
      _0x443f39(onBackHomeRequested, cloneJson(_0x38e2d5));
    } else if (_0x580111 === "open-project") {
      _0x443f39(onOpenProjectRequested, _0x4468d8.dataset.projectId);
    } else if (_0x580111 === "select-step") {
      _0x2c21fb(_0x4468d8.dataset.personReplacementStep);
    } else if (_0x580111 === "previous-step") {
      _0x2c21fb(_0x38e2d5.workspace.step - 1);
    } else if (_0x580111 === "next-step") {
      _0x2c21fb(_0x38e2d5.workspace.step + 1);
    } else if (_0x580111 === "set-video-input-mode") {
      const _0x4ffea6 = _0x4468d8.dataset.personReplacementVideoInputMode === PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE ? PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE : PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME;
      if (_0x4ffea6 === _0x38e2d5.settings.replacementVideoInputMode) {
        return;
      }
      const _0x56eba8 = resolvePersonReplacementVideoParameterPolicy({
        modelId: _0x38e2d5.settings.replacementModelId,
        inputMode: _0x4ffea6,
        generationParams: _0x38e2d5.settings.replacementVideoGenerationParams,
        resetModeDefaults: true
      });
      _0x1ef913({
        ..._0x38e2d5,
        settings: {
          ..._0x38e2d5.settings,
          replacementVideoInputMode: _0x4ffea6,
          replacementVideoGenerationParams: _0x56eba8.generationParams
        }
      }, "video-input-mode");
    } else if (_0x580111 === "select-voice-source") {
      _0xe7f439(_0x4468d8.dataset.sourceId);
    } else if (_0x580111 === "extract-clean-voice") {
      _0x443f39(onVoiceSeparationRequested, _0x4468d8.dataset.sourceId, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "cancel-voice-separation") {
      _0x443f39(onVoiceSeparationCancelRequested, _0x4468d8.dataset.sourceId, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "select-voice-asset") {
      _0x24806b(_0x4468d8.dataset.characterId);
    } else if (_0x580111 === "choose-source-videos") {
      _0x318ed6.querySelector("[data-person-replacement-input='source-videos']")?.click?.();
    } else if (_0x580111 === "remove-source") {
      _0x443f39(onRemoveSourceRequested, {
        sourceId: _0x4468d8.dataset.sourceId
      });
    } else if (_0x580111 === "choose-new-character-images") {
      _0x318ed6.querySelector("[data-person-replacement-input='new-character-images']")?.click?.();
    } else if (_0x580111 === "choose-new-scene-images") {
      _0x318ed6.querySelector("[data-person-replacement-input='new-scene-images']")?.click?.();
    } else if (_0x580111 === "choose-new-audio-files") {
      _0x318ed6.querySelector("[data-person-replacement-input='new-audio-files']")?.click?.();
    } else if (_0x580111 === "cancel-character-voice-library") {
      const _0x1720e8 = _0x59b80b;
      _0x59b80b = "";
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          characterAssetTab: "character",
          selectedCharacterId: _0x1720e8 || _0x38e2d5.workspace.selectedCharacterId,
          assetSelectionMode: false,
          selectedAssetIds: []
        }
      }, "character-voice-library-cancel");
    } else if (_0x580111 === "confirm-character-voice-library") {
      const _0xf72bbe = _0x59b80b;
      const _0x4ee823 = normalizeText(_0x4468d8.dataset.personReplacementAudioAssetId);
      const _0x2a91e0 = _0x38e2d5.audioAssets.find(_0x437696 => _0x437696.id === (_0x4ee823 || _0x38e2d5.workspace.selectedAudioAssetId) && normalizeText(_0x437696?.mediaKind).toLowerCase() === "audio");
      if (!_0xf72bbe || !getPersonReplacementLibraryAudioRef(_0x2a91e0)) {
        windowObject?.showToast?.("请选择要添加的人设声音。", "warn");
        return;
      }
      const _0x5db721 = _0x3e42c9 => {
        if (!_0x3e42c9) {
          return;
        }
        _0x59b80b = "";
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            characterAssetTab: "character",
            selectedCharacterId: _0xf72bbe,
            assetSelectionMode: false,
            selectedAssetIds: []
          }
        }, "character-voice-library-confirm");
      };
      const _0x349057 = _0x443f39(onCharacterVoiceLibrarySelected, {
        characterId: _0xf72bbe,
        asset: cloneJson(_0x2a91e0)
      });
      if (_0x349057?.then) {
        _0x349057.then(_0x5db721);
      } else {
        _0x5db721(_0x349057);
      }
    } else if (_0x580111 === "toggle-library-add-targets") {
      const _0x245d6e = _0x4468d8.closest?.(".person-replacement-library-add-menu-wrap");
      const _0x598215 = !_0x245d6e?.classList?.contains?.("is-open");
      _0x2cb99f(_0x245d6e);
      _0x59d14f(_0x245d6e, _0x598215);
    } else if (_0x580111 === "add-library-assets-to-project" || _0x580111 === "add-library-assets-to-characters") {
      const _0x2238a4 = normalizeText(_0x4468d8.dataset.personReplacementLibraryTargetKind);
      const _0xf26145 = _0x580111 === "add-library-assets-to-characters" ? "character" : ["character", "scene", "audio"].includes(_0x2238a4) ? _0x2238a4 : "character";
      _0x59d14f(_0x4468d8.closest?.(".person-replacement-library-add-menu-wrap"), false);
      const _0x3e808e = _0x38e2d5.workspace.assetSelectionMode ? _0x38e2d5.workspace.selectedAssetIds : [_0x38e2d5.workspace.selectedLibraryAssetId];
      const _0x181f7e = _0x38e2d5.libraryAssets.filter(_0x13a3a1 => {
        if (!_0x3e808e.includes(_0x13a3a1.id)) {
          return false;
        }
        if (_0xf26145 === "audio") {
          return normalizeText(_0x13a3a1?.mediaKind).toLowerCase() === "audio" && Boolean(getPersonReplacementLibraryAudioRef(_0x13a3a1));
        }
        return normalizeText(_0x13a3a1?.mediaKind).toLowerCase() === "image" && Boolean(normalizeText(_0x13a3a1?.sourceUrl || _0x13a3a1?.imageUrl));
      });
      if (!_0x181f7e.length) {
        windowObject?.showToast?.(_0xf26145 === "audio" ? "请选择总素材中的音频后再加入项目。" : "请选择总素材中的图片后再加入项目。", "warn");
        return;
      }
      const _0xd9b360 = typeof onAddLibraryAssetsToProjectRequested === "function";
      if (_0xf26145 === "scene" && !_0xd9b360) {
        windowObject?.showToast?.("当前场景素材导入能力尚未初始化。", "warn");
        return;
      }
      const _0x1355be = getNewPersonReplacementLibraryAssets(_0x38e2d5, _0x181f7e, _0xf26145);
      const _0x43b6ba = _0x181f7e.map(_0x436c06 => ({
        assetId: _0x436c06.sourceAssetId,
        itemIndex: _0x436c06.sourceItemIndex
      }));
      const _0x32bbce = _0x443f39(_0xd9b360 ? onAddLibraryAssetsToProjectRequested : onAddLibraryAssetsToCharactersRequested, _0xd9b360 ? {
        assetRefs: _0x43b6ba,
        targetKind: _0xf26145
      } : {
        assetRefs: _0x43b6ba
      });
      const _0x2a252e = _0x3b939b => {
        playPersonReplacementLibraryAssetsIntoProjectTab(_0x318ed6, _0x1355be, _0x3b939b?.addedCount, _0xf26145, documentObject, windowObject);
      };
      if (_0x32bbce?.then) {
        _0x32bbce.then(_0x2a252e);
      } else {
        _0x2a252e(_0x32bbce);
      }
    } else if (_0x580111 === "select-character-asset-tab") {
      const _0x261541 = normalizeText(_0x4468d8.dataset.assetTab);
      const _0x573596 = ["character", "scene", "audio", "library"].includes(_0x261541) ? _0x261541 : "character";
      const _0x1ee43b = _0x573596 === "library" ? _0x5c163a(_0x38e2d5) : _0x38e2d5;
      const _0x17c05b = _0x573596 === "audio" ? getPersonReplacementProjectAudioAssets(_0x1ee43b) : [];
      const _0x517440 = _0x573596 === "audio" ? _0x17c05b.some(_0x31421a => _0x31421a.id === _0x1ee43b.workspace.selectedAudioAssetId) ? _0x1ee43b.workspace.selectedAudioAssetId : _0x17c05b[0]?.id || "" : _0x1ee43b.workspace.selectedAudioAssetId;
      if (_0x573596 !== "audio") {
        _0x59b80b = "";
      }
      _0x1ef913({
        ..._0x1ee43b,
        workspace: {
          ..._0x1ee43b.workspace,
          characterAssetTab: _0x573596,
          selectedAudioAssetId: _0x517440,
          assetSelectionMode: false,
          selectedAssetIds: []
        }
      }, "character-asset-tab");
    } else if (_0x580111 === "toggle-smart-clip-settings") {
      _0x4cc6c9({
        workspace: {
          smartClipSettingsOpen: !_0x38e2d5.workspace.smartClipSettingsOpen
        }
      });
    } else if (_0x580111 === "set-smart-clip-mode") {
      _0x4cc6c9({
        settings: {
          smartClipMode: _0x4468d8.dataset.smartClipMode
        }
      }, {
        notify: true
      });
    } else if (_0x580111 === "set-smart-clip-fps") {
      _0x4cc6c9({
        settings: {
          smartClipFps: Number(_0x4468d8.dataset.smartClipFps)
        }
      }, {
        notify: true
      });
    } else if (_0x580111 === "process-sources") {
      _0x443f39(onProcessRequested, {
        mode: _0x4468d8.dataset.processingMode
      });
    } else if (_0x5bddd1.handleAction(_0x580111, {
      target: _0x4468d8,
      event: _0x126a0b
    })) {} else if (_0x580111 === "select-shot") {
      _0x54af74({
        animate: false,
        renderWorkspace: false
      });
      _0x395527(_0x4468d8.dataset.shotId);
    } else if (_0x580111 === "select-composite-full-video") {
      if (buildPersonReplacementCompositePreviewSnapshot(_0x38e2d5).fullAvailable) {
        _0x1ef913({
          ..._0x38e2d5,
          workspace: {
            ..._0x38e2d5.workspace,
            compositePreviewMode: "full"
          }
        }, "composite-full-video-select");
      }
    } else if (_0x580111 === "toggle-source-identity-selection") {
      const _0x3fcfc0 = normalizeText(_0x4468d8.dataset.sourceCharacterId);
      const _0x460a97 = new Set(_0x38e2d5.workspace.selectedIdentityIds);
      if (_0x460a97.has(_0x3fcfc0)) {
        _0x460a97.delete(_0x3fcfc0);
      } else {
        _0x460a97.add(_0x3fcfc0);
      }
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          selectedIdentityIds: [..._0x460a97]
        }
      }, "identity-selection");
    } else if (_0x580111 === "merge-source-identities") {
      _0x443f39(onMergeSourceIdentitiesRequested, {
        sourceCharacterIds: _0x38e2d5.workspace.selectedIdentityIds
      });
    } else if (_0x580111 === "toggle-detection-picker") {
      const _0xef44e6 = _0x4468d8.closest?.("[data-person-replacement-detection-picker]");
      const _0x1f0cf1 = !_0xef44e6?.classList?.contains?.("is-open");
      _0x747473(_0xef44e6);
      _0x5a98b9(_0xef44e6, _0x1f0cf1);
    } else if (_0x580111 === "select-detection-picker-option") {
      const _0x37316e = _0x4468d8.closest?.("[data-person-replacement-detection-picker]");
      const _0x43d5f7 = normalizeText(_0x37316e?.dataset?.personReplacementDetectionPicker);
      const _0x2b58cf = normalizeText(_0x4468d8.dataset.personReplacementDetectionPickerOption);
      const _0x2573c3 = normalizeText(_0x4468d8.querySelector?.("span")?.textContent, _0x2b58cf);
      const _0x2ea07f = normalizeText(_0x4468d8.dataset.personReplacementSourceCharacterId);
      const _0x4707c3 = _0x37316e?.querySelector?.("[data-person-replacement-detection-picker-trigger]");
      const _0x2063d6 = _0x4707c3?.querySelector?.("[data-person-replacement-detection-picker-value]");
      const _0x876021 = _0x43d5f7 === "label" && _0x2b58cf === PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE;
      if (_0x876021 && _0x4707c3) {
        _0x37316e.dataset.personReplacementPreviousValue = normalizeText(_0x4707c3.value);
        _0x37316e.dataset.personReplacementPreviousLabel = normalizeText(_0x2063d6?.textContent);
        _0x37316e.dataset.personReplacementPreviousSourceCharacterId = normalizeText(_0x4707c3.dataset?.personReplacementSelectedSourceCharacterId);
      }
      if (_0x4707c3) {
        _0x4707c3.value = _0x2b58cf;
        if (_0x43d5f7 === "label" && !_0x876021) {
          _0x4707c3.dataset.personReplacementSelectedSourceCharacterId = _0x2ea07f;
        }
        _0x4707c3.setAttribute("aria-label", (_0x43d5f7 === "label" ? "人物名称" : _0x43d5f7 === "scope" ? "替换范围" : "人物朝向") + "：" + _0x2573c3);
      }
      if (_0x2063d6) {
        _0x2063d6.textContent = _0x2573c3;
      }
      _0x37316e?.querySelectorAll?.("[data-person-replacement-detection-picker-option]")?.forEach?.(_0x5b12e9 => {
        const _0x2ebeb5 = _0x5b12e9 === _0x4468d8;
        _0x5b12e9.classList?.toggle?.("is-selected", _0x2ebeb5);
        _0x5b12e9.setAttribute?.("aria-selected", String(_0x2ebeb5));
      });
      if (_0x43d5f7 === "label") {
        const _0x2d5286 = _0x37316e?.querySelector?.("[data-person-replacement-person-custom-label]");
        const _0x11008b = _0x2b58cf === PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE;
        if (_0x4707c3) {
          _0x4707c3.hidden = _0x11008b;
        }
        if (_0x2d5286) {
          _0x2d5286.hidden = !_0x11008b;
          if (_0x11008b) {
            _0x2d5286.value = "";
            _0x2d5286.focus?.();
          }
        }
      }
      _0x5a98b9(_0x37316e, false);
      const _0x443432 = _0x37316e?.closest?.(".person-replacement-detection-box");
      if (_0x43d5f7 === "orientation") {
        const _0x5d98c7 = _0x443432?.querySelector?.("[data-person-replacement-person-label]");
        _0x358a3c({
          detectionBox: _0x443432,
          label: _0x5d98c7?.querySelector?.("[data-person-replacement-detection-picker-value]")?.textContent,
          sourceCharacterId: _0x5d98c7?.dataset?.personReplacementSelectedSourceCharacterId,
          orientation: _0x2b58cf
        });
      } else if (_0x43d5f7 === "scope") {
        _0x443f39(onUpdatePeopleRequested, {
          shotId: normalizeText(_0x443432?.dataset?.shotId || _0x38e2d5.workspace.selectedShotId),
          updates: [{
            personId: normalizeText(_0x443432?.dataset?.personId),
            replacementScope: _0x2b58cf
          }]
        });
      } else if (_0x2b58cf !== PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE) {
        _0x358a3c({
          detectionBox: _0x443432,
          label: _0x2573c3,
          sourceCharacterId: _0x2ea07f
        });
      }
    } else if (_0x580111 === "delete-detection-custom-label") {
      const _0x57246c = normalizeText(_0x4468d8.dataset.personReplacementCustomLabel);
      if (!_0x57246c || isGeneratedPersonReplacementLabel(_0x57246c)) {
        return;
      }
      const _0x2c7f8d = new Set(_0x38e2d5.workspace.removedCustomPersonLabels);
      _0x2c7f8d.add(_0x57246c);
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          removedCustomPersonLabels: [..._0x2c7f8d]
        }
      }, "person-custom-label-delete");
    } else if (_0x580111 === "clear-person-mapping") {
      _0x87a38a({
        shotId: _0x4468d8.dataset.shotId,
        personId: _0x4468d8.dataset.personId
      });
    } else if (_0x580111 === "delete-person") {
      _0x5e89ff();
      _0x443f39(onDeletePeopleRequested, {
        shotId: _0x4468d8.dataset.shotId,
        personIds: [_0x4468d8.dataset.personId]
      });
    } else if (_0x580111 === "clear-shot-people") {
      const _0x2e2d14 = normalizeText(_0x4468d8.dataset.shotId || _0x38e2d5.workspace.selectedShotId);
      const _0x1995df = _0x38e2d5.shots.find(_0xbc481d => _0xbc481d.id === _0x2e2d14);
      const _0x180437 = a1155_0x499c74(_0x1995df).map(_0x1bb6c0 => normalizeText(_0x1bb6c0.id)).filter(Boolean);
      if (!_0x180437.length) {
        return;
      }
      _0x5e89ff();
      _0x114d43();
      _0x443f39(onDeletePeopleRequested, {
        shotId: _0x2e2d14,
        personIds: _0x180437
      });
    } else if (_0x580111 === "generate-replacement-image") {
      if (_0x38e2d5.workspace.shotSelectionMode) {
        if (_0x436099()) {
          _0x576fa0();
          return;
        }
        _0x3e820c("image");
        return;
      }
      const _0x284155 = personReplacementImagePresentation.build(_0x38e2d5);
      const _0x5d562c = _0x284155.selectedShot;
      const _0x20d9e4 = _0x284155.gate.duplicateRoleLabels;
      if (!_0x284155.gate.sceneOnly && _0x20d9e4.length) {
        windowObject?.showToast?.("同一镜头内角色不能重复：" + _0x20d9e4.join("、") + "。请修改红色框中的角色名。", "warn");
        return;
      }
      if (!_0x284155.gate.sceneOnly && _0x284155.gate.unresolvedOrientationPersonIds.length) {
        windowObject?.showToast?.("还有 " + _0x284155.gate.unresolvedOrientationPersonIds.length + " 个人物未确认朝向，请先选择朝向。", "warn");
        return;
      }
      const _0x26365a = _0x318ed6?.querySelector?.("[data-person-replacement-keyframe-stage] > img");
      _0x443f39(onGenerateReplacementImageRequested, {
        projectId: _0x38e2d5.id,
        shotId: _0x38e2d5.workspace.selectedShotId,
        sourceImageSize: resolvePersonReplacementSourceImageSize(_0x26365a, _0x5d562c)
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "generate-replacement-video") {
      if (_0x38e2d5.workspace.shotSelectionMode) {
        if (_0x436099()) {
          _0x576fa0();
          return;
        }
        _0x3e820c("video");
        return;
      }
      const _0x44f938 = _0x38e2d5.workspace.selectedShotId;
      const _0x3a8b71 = resolvePersonReplacementVideoGenerationState(_0x38e2d5.workspace, _0x44f938);
      if (isPersonReplacementVideoGenerationActive(_0x3a8b71)) {
        _0x443f39(onCancelReplacementVideoRequested, {
          projectId: _0x38e2d5.id,
          shotId: _0x44f938
        }, {}, {
          applyCallbackResult: false
        });
        return;
      }
      _0x443f39(onGenerateReplacementVideoRequested, {
        projectId: _0x38e2d5.id,
        shotId: _0x44f938
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "trim-current-video") {
      _0xd6f0d(_0x4468d8.dataset.shotId);
    } else if (_0x580111 === "toggle-video-replacement-sync-playback") {
      _0x51002a?.toggleEnabled?.();
    } else if (_0x580111 === "toggle-comparison-playback") {
      _0x16fd8e?.togglePlayback?.();
    } else if (_0x580111 === "set-preview-track") {
      _0x3bc912(_0x4468d8.dataset.previewTrack);
    } else if (_0x580111 === "compose-output") {
      _0x443f39(onComposeRequested, cloneJson(_0x38e2d5), {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "toggle-output-menu") {
      _0x167d1c(_0x4468d8);
    } else if (_0x580111 === "sync-all-clips-to-canvas") {
      _0x282d91();
      _0x443f39(onAddToCanvasRequested, {
        scope: PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS,
        project: cloneJson(_0x38e2d5)
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "sync-project-to-canvas") {
      _0x282d91();
      _0x443f39(onAddToCanvasRequested, {
        scope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT,
        project: cloneJson(_0x38e2d5)
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "export-current-clip") {
      _0x282d91();
      _0x443f39(onExportRequested, {
        mode: PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP,
        project: cloneJson(_0x38e2d5)
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "export-final-video") {
      _0x282d91();
      _0x443f39(onExportRequested, {
        mode: PERSON_REPLACEMENT_EXPORT_MODES.FINAL_VIDEO,
        project: cloneJson(_0x38e2d5)
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "export-all-replacement-clips") {
      _0x282d91();
      _0x443f39(onExportRequested, {
        mode: PERSON_REPLACEMENT_EXPORT_MODES.ALL_REPLACEMENT_CLIPS,
        project: cloneJson(_0x38e2d5)
      }, {}, {
        applyCallbackResult: false
      });
    } else if (_0x580111 === "export-all-clips-and-images") {
      _0x282d91();
      _0x443f39(onExportRequested, {
        mode: PERSON_REPLACEMENT_EXPORT_MODES.ALL_CLIPS_AND_IMAGES,
        project: cloneJson(_0x38e2d5)
      }, {}, {
        applyCallbackResult: false
      });
    }
  };
  const _0x371671 = _0x37620b => {
    if (_0x37620b.target?.matches?.("[data-story-project-search]")) {
      const _0x587212 = Number(_0x37620b.target.selectionStart);
      _0x38e2d5 = a1155_0x56b8cf({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          projectSearchQuery: _0x37620b.target.value,
          openProjectMenuId: "",
          pendingDeleteProjectId: ""
        }
      });
      _0x3be3ab();
      const _0x3bcb2a = _0x318ed6?.querySelector?.("[data-story-project-search]");
      _0x3bcb2a?.focus?.();
      if (Number.isFinite(_0x587212)) {
        _0x3bcb2a?.setSelectionRange?.(_0x587212, _0x587212);
      }
      return;
    }
    if (_0x37620b.target?.matches?.("[data-story-project-title]")) {
      const _0x4f1955 = normalizeText(_0x37620b.target.dataset.storyProjectTitle);
      _0x38e2d5 = a1155_0x56b8cf({
        ..._0x38e2d5,
        libraryProjects: _0x38e2d5.libraryProjects.map(_0x58c2f3 => normalizeText(_0x58c2f3?.id) === _0x4f1955 ? {
          ..._0x58c2f3,
          title: _0x37620b.target.value
        } : _0x58c2f3)
      });
      return;
    }
    if (_0x37620b.target?.matches?.("[data-story-asset-prompt]")) {
      const _0x14137d = _0x5026bd();
      const _0x194551 = _0x96ff9b(_0x14137d);
      if (!_0x14137d || !_0x194551) {
        return;
      }
      _0x38e2d5 = a1155_0x56b8cf({
        ..._0x38e2d5,
        characters: _0x38e2d5.characters.map(_0x45d333 => _0x45d333.id === _0x14137d.id ? {
          ..._0x45d333,
          appearances: _0x45d333.appearances.map(_0x302ca4 => _0x302ca4.id === _0x194551.id ? {
            ..._0x302ca4,
            prompt: readPersonReplacementAssetPromptText(_0x37620b.target)
          } : _0x302ca4)
        } : _0x45d333)
      });
      _0x575f0c("appearance-prompt");
      return;
    }
    if (_0x37620b.target?.dataset?.personReplacementField === "image-prompt") {
      if (shouldSkipPromptTriggerForBulkInput(_0x37620b)) {
        return;
      }
      const _0x1da9b1 = _0x37620b.target.dataset.shotId;
      const _0x9edfec = _0x37620b.target.matches?.("[contenteditable=\"true\"]") ? sanitizePromptHtmlForCommit(_0x37620b.target.innerHTML) : _0x37620b.target.value;
      _0x38e2d5 = a1155_0x56b8cf({
        ..._0x38e2d5,
        shots: _0x38e2d5.shots.map(_0x131aa3 => _0x131aa3.id === _0x1da9b1 ? {
          ..._0x131aa3,
          imagePrompt: _0x9edfec
        } : _0x131aa3)
      });
      _0x575f0c("image-prompt");
      return;
    }
    if (_0x37620b.target?.dataset?.personReplacementField === "video-prompt") {
      if (_0x37620b.type === "input") {
        checkSlashTrigger(_0x37620b, {
          promptEl: _0x37620b.target,
          nodeType: "ai-video",
          nodeId: "",
          onPromptCommit: () => _0x1f1455(_0x37620b.target, "video-prompt"),
          onGenerate: (_0x5a1bfe, _0x3bdcd2) => _0x56a07e(_0x37620b.target, _0x5a1bfe, _0x3bdcd2)
        });
      }
      _0x1f1455(_0x37620b.target);
    }
  };
  const _0x257e63 = _0x1f68a8 => {
    const _0xb7feba = _0x1f68a8.target?.dataset?.personReplacementInput;
    if (_0xb7feba) {
      const _0x5c15ed = Array.from(_0x1f68a8.target.files || []);
      if (_0xb7feba === "source-videos") {
        _0xc38233(_0x5c15ed.filter(isVideoFile));
      } else if (_0xb7feba === "new-character-images") {
        const _0x2bcb2c = _0x5c15ed.filter(isImageFile);
        if (_0x2bcb2c.length) {
          _0x7ac058("character", () => _0x5636bb(_0x2bcb2c));
        }
      } else if (_0xb7feba === "new-scene-images") {
        const _0x190cdd = _0x5c15ed.filter(isImageFile);
        if (_0x190cdd.length) {
          _0x7ac058("scene", () => _0x443f39(onNewSceneImagesSelected, _0x190cdd));
        }
      } else if (_0xb7feba === "new-audio-files") {
        const _0x558ee2 = _0x5c15ed.filter(isAudioFile);
        if (_0x558ee2.length) {
          _0x7ac058("audio", () => _0x443f39(onNewAudioFilesSelected, _0x558ee2));
        }
      } else if (_0xb7feba === "appearance-image" && _0x5c15ed[0]) {
        _0x443f39(onCharacterReferenceSelected, _0x5c15ed[0], _0x41ce6e || {});
      } else if (_0xb7feba === "replacement-image" && _0x5c15ed[0]) {
        _0x443f39(onReplacementImageSelected, _0x5c15ed[0], _0x41ce6e || {}, {
          applyCallbackResult: false
        });
      } else if (_0xb7feba === "replacement-video-slot" && _0x5c15ed[0]) {
        _0x443f39(onReplacementVideoInputSelected, _0x5c15ed[0], _0x41ce6e || {}, {
          applyCallbackResult: false
        });
      } else if (_0xb7feba === "character-voice" && _0x5c15ed[0]) {
        _0x443f39(onCharacterVoiceSelected, _0x5c15ed[0], _0x41ce6e || {});
      }
      _0x1f68a8.target.value = "";
      _0x41ce6e = null;
      return;
    }
    if (_0x1f68a8.target?.matches?.("[data-story-project-title]")) {
      const _0x2a60e0 = normalizeText(_0x1f68a8.target.dataset.storyProjectTitle);
      const _0x3c4b41 = normalizeText(_0x1f68a8.target.value, "未命名人物替换项目");
      _0x1f68a8.target.value = _0x3c4b41;
      _0x443f39(onRenameProjectRequested, {
        projectId: _0x2a60e0,
        title: _0x3c4b41
      });
    } else if (_0x1f68a8.target?.matches?.("[data-story-asset-prompt]")) {
      _0x371671(_0x1f68a8);
    } else if (_0x1f68a8.target?.dataset?.personReplacementField === "image-prompt" || _0x1f68a8.target?.dataset?.personReplacementField === "video-prompt") {
      _0x371671(_0x1f68a8);
      if (_0x1f68a8.target.dataset.personReplacementField === "video-prompt") {
        _0x575f0c("video-prompt");
      }
    } else if (_0x1f68a8.target?.dataset?.personReplacementField === "voice-source") {
      _0x1ef913({
        ..._0x38e2d5,
        workspace: {
          ..._0x38e2d5.workspace,
          selectedVoiceSourceId: _0x1f68a8.target.value
        }
      }, "voice-source");
    }
  };
  const _0x378ede = _0x1d3e3a => {
    const _0x5a90ca = _0x1d3e3a.target?.closest?.("[data-person-replacement-person-custom-label]");
    if (_0x5a90ca) {
      _0xb270a(_0x5a90ca);
    }
    const _0x1f3797 = _0x1d3e3a.target?.closest?.("[data-person-replacement-detection-picker]");
    if (_0x1f3797 && !_0x1f3797.contains?.(_0x1d3e3a.relatedTarget)) {
      _0x5a98b9(_0x1f3797, false);
    }
    const _0x356c16 = _0x1d3e3a.target?.closest?.("[data-story-asset-name-id][contenteditable=\"true\"]");
    if (_0x356c16) {
      _0x4f57fb(_0x356c16);
    }
  };
  const _0x37745c = _0x45ddb5 => {
    _0x44c2d8();
    const _0x592552 = _0x45ddb5.target?.closest?.("[data-person-replacement-voice-asset-id]");
    if (_0x592552) {
      const _0x1e20af = normalizeText(_0x592552.dataset?.personReplacementVoiceAssetId);
      if (!_0x45ddb5.dataTransfer || !_0x1e20af || _0x592552.disabled) {
        _0x45ddb5.preventDefault?.();
        return;
      }
      _0x45ddb5.dataTransfer.effectAllowed = "copy";
      _0x45ddb5.dataTransfer.setData(PERSON_REPLACEMENT_VOICE_ASSET_DRAG_TYPE, JSON.stringify({
        characterId: _0x1e20af
      }));
      applyWorkspaceAssetNativeDragPreview(_0x45ddb5.dataTransfer, _0x592552.querySelector?.(".person-replacement-voice-asset-image img") || _0x592552);
      _0x592552.classList?.add?.("is-voice-asset-dragging");
      _0x318ed6?.classList?.add?.("is-voice-asset-dragging");
      return;
    }
    const _0x379cfb = _0x45ddb5.target?.closest?.("[data-person-replacement-target-character-id], [data-person-replacement-target-scene-id]");
    if (!_0x379cfb || !_0x45ddb5.dataTransfer) {
      _0x45ddb5.preventDefault?.();
      return;
    }
    if (_0x45ddb5.target?.closest?.(".at-mention-variant-arrow")) {
      _0x45ddb5.preventDefault?.();
      return;
    }
    const _0x4e65b7 = normalizeText(_0x379cfb.dataset.personReplacementTargetSceneId);
    const _0x5446c2 = normalizeText(_0x379cfb.dataset.personReplacementTargetCharacterId);
    const _0x47ade8 = normalizeText(_0x4e65b7 ? _0x379cfb.dataset.personReplacementTargetSceneAppearanceId : _0x379cfb.dataset.personReplacementTargetAppearanceId);
    if (!_0x4e65b7 && !_0x5446c2 || !_0x47ade8) {
      _0x45ddb5.preventDefault?.();
      return;
    }
    _0x16a723 = true;
    _0x45ddb5.dataTransfer.effectAllowed = "copy";
    if (_0x4e65b7) {
      _0x45ddb5.dataTransfer.setData(PERSON_REPLACEMENT_SCENE_ASSET_DRAG_TYPE, JSON.stringify({
        sceneId: _0x4e65b7,
        appearanceId: _0x47ade8
      }));
    } else {
      _0x45ddb5.dataTransfer.setData("application/x-person-replacement-target", JSON.stringify({
        characterId: _0x5446c2,
        appearanceId: _0x47ade8
      }));
    }
    applyWorkspaceAssetNativeDragPreview(_0x45ddb5.dataTransfer, _0x379cfb.querySelector?.(".story-asset-card-image") || _0x379cfb);
    _0x379cfb.classList?.add?.("is-story-asset-dragging");
  };
  const _0x10a355 = _0x4a9bfd => {
    const _0x42810a = _0x4a9bfd?.querySelector?.(".story-asset-card-image");
    const _0x4bf4e = normalizeText(_0x42810a?.currentSrc || _0x42810a?.src || _0x42810a?.getAttribute?.("src"));
    if (!_0x42810a || !_0x4bf4e || !documentObject?.createElement) {
      return null;
    }
    const _0x58ffba = _0x42810a.getBoundingClientRect?.() || _0x4a9bfd.getBoundingClientRect?.() || {};
    const _0x23f6df = Math.max(1, Number(_0x58ffba.width) || 128);
    const _0x29bbd3 = Math.max(1, Number(_0x58ffba.height) || _0x23f6df);
    const _0x211477 = Math.min(160, Math.max(96, _0x23f6df));
    const _0x2f00be = Math.max(54, Math.round(_0x211477 * _0x29bbd3 / _0x23f6df));
    const _0x5dfc66 = documentObject.createElement("div");
    const _0x535b7a = documentObject.createElement("img");
    _0x5dfc66.className = "story-asset-drag-preview person-replacement-target-asset-drag-preview";
    _0x5dfc66.setAttribute("aria-hidden", "true");
    _0x5dfc66.style.width = Math.round(_0x211477) + "px";
    _0x5dfc66.style.height = Math.round(_0x2f00be) + "px";
    _0x535b7a.src = _0x4bf4e;
    _0x535b7a.alt = "";
    _0x535b7a.draggable = false;
    _0x5dfc66.appendChild(_0x535b7a);
    documentObject.body?.appendChild?.(_0x5dfc66);
    return _0x5dfc66;
  };
  const _0x284763 = (_0x2647f3, _0x413c3f) => {
    if (!_0x2647f3) {
      return;
    }
    const _0x201fac = Number(_0x413c3f?.clientX) || 0;
    const _0x49ef3b = Number(_0x413c3f?.clientY) || 0;
    const _0x210e0c = _0x2647f3.getBoundingClientRect?.() || {};
    const _0x4ea449 = Math.max(1, Number(_0x210e0c.width) || Number.parseFloat(_0x2647f3.style.width) || 1);
    const _0x183f4d = Math.max(1, Number(_0x210e0c.height) || Number.parseFloat(_0x2647f3.style.height) || 1);
    const _0x205a69 = Number(windowObject?.innerWidth) || Number.POSITIVE_INFINITY;
    const _0x11450f = Number(windowObject?.innerHeight) || Number.POSITIVE_INFINITY;
    const _0xaaf407 = 8;
    let _0x28f5ae = _0x201fac + WORKSPACE_ASSET_DRAG_PREVIEW_POINTER_GAP;
    let _0x1d3cda = _0x49ef3b + WORKSPACE_ASSET_DRAG_PREVIEW_POINTER_GAP;
    if (_0x28f5ae + _0x4ea449 > _0x205a69 - _0xaaf407) {
      _0x28f5ae = _0x201fac - _0x4ea449 - WORKSPACE_ASSET_DRAG_PREVIEW_POINTER_GAP;
    }
    if (_0x1d3cda + _0x183f4d > _0x11450f - _0xaaf407) {
      _0x1d3cda = _0x49ef3b - _0x183f4d - WORKSPACE_ASSET_DRAG_PREVIEW_POINTER_GAP;
    }
    _0x2647f3.style.transform = "translate3d(" + Math.max(_0xaaf407, _0x28f5ae) + "px, " + Math.max(_0xaaf407, _0x1d3cda) + "px, 0)";
  };
  const _0x59c4c0 = _0x1c6bcd => {
    const _0x1bfec5 = documentObject?.elementFromPoint?.(Number(_0x1c6bcd?.clientX) || 0, Number(_0x1c6bcd?.clientY) || 0);
    const _0x2c1cff = _0x1bfec5?.closest?.("[data-person-replacement-person-drop]");
    if (_0x2c1cff && _0x318ed6?.contains?.(_0x2c1cff)) {
      return _0x2c1cff;
    } else {
      return null;
    }
  };
  const _0x2df2ea = _0x4ad1db => {
    const _0xc5124f = documentObject?.elementFromPoint?.(Number(_0x4ad1db?.clientX) || 0, Number(_0x4ad1db?.clientY) || 0);
    const _0x43d455 = _0xc5124f?.closest?.("[data-person-replacement-keyframe-stage]");
    if (_0x43d455 && _0x318ed6?.contains?.(_0x43d455)) {
      return _0x43d455;
    } else {
      return null;
    }
  };
  const _0x68e9ae = _0x263048 => {
    if (_0x52380b === _0x263048) {
      return;
    }
    _0x52380b?.classList?.remove?.("is-scene-reference-drop-target");
    _0x52380b = _0x263048 || null;
    _0x52380b?.classList?.add?.("is-scene-reference-drop-target");
  };
  const _0x16d785 = ({
    personBox: _0x2b7d5e,
    target: _0x41ec7e,
    clientX = 0,
    clientY = 0
  } = {}) => {
    if (!_0x2b7d5e || !normalizeText(_0x41ec7e?.characterId) || !normalizeText(_0x41ec7e?.appearanceId)) {
      return false;
    }
    const _0x12e0ca = {
      shotId: _0x2b7d5e.dataset.shotId,
      personId: _0x2b7d5e.dataset.personId,
      targetCharacterId: _0x41ec7e.characterId,
      targetAppearanceId: _0x41ec7e.appearanceId
    };
    const _0x568938 = _0x38e2d5.shots.find(_0x3c5da3 => _0x3c5da3.id === normalizeText(_0x12e0ca.shotId));
    const _0x3aece1 = _0x568938?.people?.find(_0x5cddf3 => _0x5cddf3.id === normalizeText(_0x12e0ca.personId));
    if (!_0x3aece1) {
      return false;
    }
    const _0x589b44 = normalizeText(_0x3aece1.sourceCharacterId);
    const _0x4300ad = _0x38e2d5.mappings.find(_0x16cc1a => normalizeText(_0x16cc1a.sourceCharacterId) === _0x589b44)?.targetCharacterId;
    const _0x3d286a = Boolean(normalizeText(_0x3aece1.targetCharacterId) || normalizeText(_0x4300ad));
    if (_0x3d286a) {
      const _0x26ffa8 = _0x38e2d5.characters.find(_0x3525a7 => _0x3525a7.id === normalizeText(_0x41ec7e.characterId));
      const _0x573849 = getCharacterAppearance(_0x26ffa8, normalizeText(_0x41ec7e.appearanceId));
      _0x107aa4({
        personBox: _0x2b7d5e,
        mapping: _0x12e0ca,
        personLabel: normalizeText(_0x3aece1.label, _0x589b44 || "当前人物"),
        targetName: normalizeText(_0x26ffa8?.name, "目标人物"),
        appearanceName: normalizeText(_0x573849?.name, "当前形象"),
        clientX: clientX,
        clientY: clientY
      });
    } else {
      _0x37a131(_0x12e0ca);
    }
    _0x2d2968 = {
      assetId: normalizeText(_0x41ec7e.characterId),
      shotId: normalizeText(_0x12e0ca.shotId),
      personId: normalizeText(_0x12e0ca.personId)
    };
    _0x44c2d8();
    return true;
  };
  const _0x3dd8c4 = () => {
    const _0x31a8e2 = _0xf44a2a;
    _0xf44a2a = null;
    _0x31a8e2?.preview?.remove?.();
    documentObject.body?.classList?.remove?.("person-replacement-target-asset-dragging");
    if (!_0x31a8e2?.element) {
      return;
    }
    if (_0x31a8e2.originalDraggable == null) {
      _0x31a8e2.element.removeAttribute?.("draggable");
    } else {
      _0x31a8e2.element.setAttribute?.("draggable", _0x31a8e2.originalDraggable);
    }
    if (_0x31a8e2.element.hasPointerCapture?.(_0x31a8e2.pointerId)) {
      _0x31a8e2.element.releasePointerCapture?.(_0x31a8e2.pointerId);
    }
  };
  const _0x355245 = _0x3c350a => {
    const _0x423e7d = _0x3c350a.target?.closest?.("[data-person-replacement-target-character-id], [data-person-replacement-target-scene-id]");
    if (!_0x423e7d || !_0x318ed6?.contains?.(_0x423e7d) || _0x3c350a.button !== 0 || _0x3c350a.target?.closest?.(".story-appearance-arrow, .at-mention-variant-arrow")) {
      return false;
    }
    const _0x3a6049 = normalizeText(_0x423e7d.dataset?.personReplacementTargetSceneId);
    const _0x408ede = normalizeText(_0x423e7d.dataset?.personReplacementTargetCharacterId);
    const _0x2e04e6 = normalizeText(_0x3a6049 ? _0x423e7d.dataset?.personReplacementTargetSceneAppearanceId : _0x423e7d.dataset?.personReplacementTargetAppearanceId);
    if (!_0x3a6049 && !_0x408ede || !_0x2e04e6) {
      return false;
    }
    _0xf44a2a = {
      kind: _0x3a6049 ? "scene" : "character",
      sceneId: _0x3a6049,
      characterId: _0x408ede,
      appearanceId: _0x2e04e6,
      element: _0x423e7d,
      pointerId: _0x3c350a.pointerId,
      startX: Number(_0x3c350a.clientX) || 0,
      startY: Number(_0x3c350a.clientY) || 0,
      originalDraggable: _0x423e7d.getAttribute?.("draggable"),
      active: false,
      preview: null
    };
    _0x423e7d.setAttribute?.("draggable", "false");
    _0x423e7d.setPointerCapture?.(_0x3c350a.pointerId);
    return true;
  };
  const _0x4c8f1d = _0x296921 => {
    const _0x362207 = _0xf44a2a;
    if (!_0x362207 || _0x362207.pointerId !== _0x296921.pointerId) {
      return false;
    }
    if (!_0x362207.active) {
      const _0x394f00 = (Number(_0x296921.clientX) || 0) - _0x362207.startX;
      const _0x273d6c = (Number(_0x296921.clientY) || 0) - _0x362207.startY;
      if (Math.hypot(_0x394f00, _0x273d6c) < 8) {
        return false;
      }
      _0x362207.active = true;
      _0x16a723 = true;
      _0x362207.element.classList?.add?.("is-story-asset-dragging");
      documentObject.body?.classList?.add?.("person-replacement-target-asset-dragging");
      _0x44c2d8();
      _0x362207.preview = _0x10a355(_0x362207.element);
    }
    _0x284763(_0x362207.preview, _0x296921);
    if (_0x362207.kind === "scene") {
      _0x68e9ae(_0x2df2ea(_0x296921));
    }
    _0x296921.preventDefault?.();
    return true;
  };
  const _0x509bd8 = (_0x3fa7a6, {
    cancelled = false
  } = {}) => {
    const _0xa4efa2 = _0xf44a2a;
    if (!_0xa4efa2 || _0xa4efa2.pointerId !== _0x3fa7a6.pointerId) {
      return false;
    }
    const _0x2adaa8 = _0xa4efa2.kind === "scene" && !cancelled && _0xa4efa2.active ? _0x2df2ea(_0x3fa7a6) : null;
    const _0x45344c = _0xa4efa2.kind === "character" && !cancelled && _0xa4efa2.active ? _0x59c4c0(_0x3fa7a6) : null;
    const _0x549d7e = _0xa4efa2.active;
    const _0x1f6fba = {
      characterId: _0xa4efa2.characterId,
      appearanceId: _0xa4efa2.appearanceId
    };
    _0x3dd8c4();
    _0x68e9ae(null);
    _0x16a723 = false;
    _0xa4efa2.element.classList?.remove?.("is-story-asset-dragging");
    if (!_0x549d7e) {
      return false;
    }
    _0x1ee1c3 = _0xa4efa2.element;
    _0x3fa7a6.preventDefault?.();
    _0x3fa7a6.stopPropagation?.();
    if (_0x2adaa8) {
      _0x1b4f0c({
        shotId: _0x2adaa8.dataset.shotId,
        sceneId: _0xa4efa2.sceneId,
        appearanceId: _0xa4efa2.appearanceId
      });
    } else if (_0x45344c) {
      _0x16d785({
        personBox: _0x45344c,
        target: _0x1f6fba,
        clientX: _0x3fa7a6.clientX,
        clientY: _0x3fa7a6.clientY
      });
    }
    return true;
  };
  const _0x31fddd = () => {
    _0xcc4bc3?.classList?.remove?.("is-person-replacement-voice-drop-target");
    _0xcc4bc3 = null;
  };
  const _0x300869 = () => {
    _0x2605dd?.classList?.remove?.("is-dragover");
    _0x2605dd = null;
    _0x318ed6?.classList?.remove?.("is-dragging-file");
  };
  const _0x3e68e7 = () => {
    _0x2bfe44 = null;
    _0x3e0738 = false;
  };
  const _0x2a882a = _0x1ab1e0 => {
    if (_0x2bfe44 === _0x1ab1e0) {
      return _0x3e0738;
    }
    const _0x17e5b6 = normalizeText(_0x1ab1e0?.dataset?.segmentId);
    _0x2bfe44 = _0x1ab1e0;
    _0x3e0738 = Boolean(_0x17e5b6 && _0xb158ca?.canSelectVoiceAsset?.({
      segmentId: _0x17e5b6
    }) === true);
    return _0x3e0738;
  };
  const _0x6d76cd = _0x3b90e7 => {
    const _0x1457c0 = _0x3b90e7.target?.closest?.("[data-audio-voice-action=\"audio-param\"]");
    const _0x2b4b10 = Array.from(_0x3b90e7.dataTransfer?.types || []);
    const _0x34a144 = _0x318ed6?.classList?.contains?.("is-voice-asset-dragging") || _0x2b4b10.includes(PERSON_REPLACEMENT_VOICE_ASSET_DRAG_TYPE);
    if (_0x1457c0 && _0x34a144) {
      if (!_0x2a882a(_0x1457c0)) {
        _0x31fddd();
        if (_0x3b90e7.dataTransfer) {
          _0x3b90e7.dataTransfer.dropEffect = "none";
        }
        return;
      }
      _0x3b90e7.preventDefault?.();
      if (_0x3b90e7.dataTransfer) {
        _0x3b90e7.dataTransfer.dropEffect = "copy";
      }
      if (_0xcc4bc3 !== _0x1457c0) {
        _0x31fddd();
        _0xcc4bc3 = _0x1457c0;
        _0xcc4bc3.classList?.add?.("is-person-replacement-voice-drop-target");
      }
      return;
    }
    if (_0x34a144) {
      _0x31fddd();
      _0x3e68e7();
    }
    const _0x47a6b6 = _0x3b90e7.target?.closest?.("[data-person-replacement-keyframe-stage]");
    const _0x3c8e29 = _0x2b4b10.includes(PERSON_REPLACEMENT_SCENE_ASSET_DRAG_TYPE);
    if (_0x47a6b6 && _0x3c8e29) {
      _0x3b90e7.preventDefault?.();
      if (_0x3b90e7.dataTransfer) {
        _0x3b90e7.dataTransfer.dropEffect = "copy";
      }
      _0x68e9ae(_0x47a6b6);
      _0x300869();
      return;
    }
    if (_0x3c8e29) {
      _0x68e9ae(null);
    }
    const _0x3b1491 = _0x3b90e7.target?.closest?.("[data-person-replacement-video-drop]");
    const _0x157baa = Boolean(_0x3b90e7.target?.closest?.("[data-person-replacement-person-drop]"));
    const _0x2d0073 = _0x2b4b10.includes("Files");
    if (!_0x157baa && !_0x2d0073) {
      return;
    }
    _0x3b90e7.preventDefault();
    _0x318ed6.classList.add("is-dragging-file");
    if (_0x3b1491 && _0x2d0073 && _0x38e2d5.workspace.view === "home") {
      if (_0x3b90e7.dataTransfer) {
        _0x3b90e7.dataTransfer.dropEffect = "copy";
      }
      if (_0x2605dd !== _0x3b1491) {
        _0x300869();
        _0x2605dd = _0x3b1491;
        _0x2605dd.classList?.add?.("is-dragover");
        _0x318ed6.classList.add("is-dragging-file");
      }
    } else {
      _0x300869();
      if (_0x2d0073) {
        _0x318ed6.classList.add("is-dragging-file");
      }
    }
  };
  const _0x19011a = () => {
    _0x16a723 = false;
    _0x3dd8c4();
    _0x68e9ae(null);
    _0x318ed6?.querySelectorAll?.(".person-replacement-target-asset.is-story-asset-dragging")?.forEach?.(_0x3f052e => _0x3f052e.classList?.remove?.("is-story-asset-dragging"));
  };
  const _0x4c1eed = () => {
    _0x318ed6?.classList?.remove?.("is-voice-asset-dragging");
    _0x318ed6?.querySelectorAll?.(".person-replacement-voice-asset-card.is-voice-asset-dragging")?.forEach?.(_0x2d5c6e => _0x2d5c6e.classList?.remove?.("is-voice-asset-dragging"));
    _0x31fddd();
    _0x3e68e7();
  };
  const _0x3f8fe1 = () => {
    _0x44c2d8();
    _0x19011a();
    _0x4c1eed();
    _0x300869();
  };
  const _0x39d75c = _0x282885 => {
    const _0x5121a3 = _0x282885.target?.closest?.("[data-person-replacement-video-drop]");
    if (_0x5121a3 && !_0x5121a3.contains?.(_0x282885.relatedTarget)) {
      _0x300869();
    }
    const _0x126f37 = _0x282885.relatedTarget;
    if (_0x126f37 && _0x318ed6?.contains?.(_0x126f37)) {
      return;
    }
    _0x31fddd();
    _0x3e68e7();
    _0x300869();
    _0x68e9ae(null);
  };
  const _0xcae9ae = _0x201b5a => {
    _0x201b5a.stopPropagation?.();
    const _0xe7ba9e = _0x201b5a.target?.closest?.("[data-audio-voice-action=\"audio-param\"]");
    const _0x55d9af = _0x201b5a.dataTransfer?.getData?.(PERSON_REPLACEMENT_VOICE_ASSET_DRAG_TYPE);
    const _0x332117 = _0x201b5a.dataTransfer?.getData?.(PERSON_REPLACEMENT_SCENE_ASSET_DRAG_TYPE);
    const _0x526c86 = _0x201b5a.target?.closest?.("[data-person-replacement-keyframe-stage]");
    _0x3f8fe1();
    if (_0xe7ba9e && _0x55d9af) {
      if (!_0x2a882a(_0xe7ba9e)) {
        return;
      }
      _0x201b5a.preventDefault?.();
      let _0x1c8225;
      try {
        _0x1c8225 = JSON.parse(_0x55d9af);
      } catch {
        return;
      }
      const _0x3a677c = normalizeText(_0x1c8225?.characterId);
      const _0x3b2cf1 = normalizeText(_0xe7ba9e.dataset?.segmentId);
      if (!_0x3a677c || !_0x3b2cf1) {
        return;
      }
      _0x24806b(_0x3a677c, {
        segmentId: _0x3b2cf1
      });
      return;
    }
    if (_0x526c86 && _0x332117) {
      _0x201b5a.preventDefault?.();
      let _0x2eb15e;
      try {
        _0x2eb15e = JSON.parse(_0x332117);
      } catch {
        return;
      }
      _0x1b4f0c({
        shotId: _0x526c86.dataset.shotId,
        sceneId: _0x2eb15e?.sceneId,
        appearanceId: _0x2eb15e?.appearanceId
      });
      return;
    }
    const _0xbe7c23 = _0x201b5a.target?.closest?.("[data-person-replacement-person-drop]");
    if (_0xbe7c23) {
      const _0x5258f7 = _0x201b5a.dataTransfer?.getData?.("application/x-person-replacement-target");
      if (!_0x5258f7) {
        return;
      }
      _0x201b5a.preventDefault();
      let _0x3f8e3b;
      try {
        _0x3f8e3b = JSON.parse(_0x5258f7);
      } catch {
        return;
      }
      _0x16d785({
        personBox: _0xbe7c23,
        target: _0x3f8e3b,
        clientX: _0x201b5a.clientX,
        clientY: _0x201b5a.clientY
      });
      return;
    }
    const _0x4c989e = Array.from(_0x201b5a.dataTransfer?.files || []);
    if (!_0x4c989e.length) {
      return;
    }
    _0x201b5a.preventDefault();
    if (_0x38e2d5.workspace.view === "home") {
      _0xc38233(_0x4c989e.filter(isVideoFile));
    } else if (_0x38e2d5.workspace.step === 1) {
      _0x5636bb(_0x4c989e.filter(isImageFile));
    }
  };
  let _0x40953d = null;
  const _0xb1473d = _0x5a41d8 => _0x5a41d8?.ctrlKey === true || _0x5a41d8?.getModifierState?.("Control") === true || _0x28b90d;
  const _0x5161f6 = _0x33f7aa => {
    _0x1ee1c3 = null;
    _0x33f7aa.stopPropagation();
    _0x44c2d8();
    if (!_0x33f7aa.target?.closest?.("[data-person-replacement-mapping-scope-menu]")) {
      _0x494354();
    }
    const _0x2f062b = _0x33f7aa.target?.closest?.("[data-person-replacement-person-drop]");
    if (_0x2f062b && _0x318ed6.contains(_0x2f062b)) {
      _0x11127d(_0x2f062b);
    }
    if (!_0x33f7aa.target?.closest?.("[data-person-replacement-result-history-menu]")) {
      _0x400efa();
    }
    if (_0x355245(_0x33f7aa)) {
      return;
    }
    const _0x2bdc8b = _0x33f7aa.target?.closest?.("[data-story-marquee-surface=\"people\"]");
    const _0xec724e = _0x33f7aa.target?.closest?.(".person-replacement-detection-label, .person-replacement-mapping-badge, [data-person-replacement-action], [data-person-replacement-manual-resize]");
    if (_0xb1473d(_0x33f7aa) && _0x2bdc8b && _0x318ed6.contains(_0x2bdc8b) && !_0xec724e && _0x40953d?.begin?.(_0x33f7aa)) {
      return;
    }
    const _0x1680a4 = Boolean(_0x2f062b?.classList?.contains?.("is-batch-selected"));
    if (_0x1680a4 && !_0xec724e && _0x450954(_0x33f7aa, _0x2f062b, {
      batch: true
    })) {
      return;
    }
    if (!_0xb1473d(_0x33f7aa) && (!_0x2f062b || !_0x1680a4)) {
      _0x114d43();
    }
    const _0x485444 = _0x2f062b?.matches?.(".person-replacement-detection-box[data-person-id]") ? _0x2f062b : null;
    if (_0x485444 && _0x318ed6.contains(_0x485444)) {
      _0x3a3cb8(_0x485444, {
        focus: !_0x33f7aa.target?.closest?.(".person-replacement-detection-label, .person-replacement-mapping-badge, [data-person-replacement-action]")
      });
    } else {
      _0x5e89ff();
    }
    if (_0x485444 && _0x318ed6.contains(_0x485444) && !_0x33f7aa.target?.closest?.(".person-replacement-detection-label, .person-replacement-mapping-badge, [data-person-replacement-action]") && _0x450954(_0x33f7aa, _0x485444)) {
      return;
    }
    if (_0x182068) {
      const _0x255ab1 = _0x33f7aa.target?.closest?.("[data-person-replacement-keyframe-stage]");
      if (_0x255ab1 && _0x318ed6.contains(_0x255ab1) && !_0xb1473d(_0x33f7aa) && !_0x33f7aa.target?.closest?.("[data-person-replacement-person-drop]") && !_0x33f7aa.target?.closest?.("[data-person-replacement-action], [data-story-action]")) {
        if (_0x339350(_0x33f7aa, _0x255ab1)) {
          return;
        }
      }
    }
    const _0x476fb4 = _0x33f7aa.target?.closest?.("[data-person-replacement-layout-splitter]");
    if (_0x476fb4 && _0x5ad8cd(_0x33f7aa, _0x476fb4)) {
      return;
    }
    const _0x1be593 = _0x33f7aa.target?.closest?.("[data-person-replacement-composite-sidebar-splitter]");
    if (_0x1be593) {
      const _0x245287 = _0x1be593.closest?.(".person-replacement-preview-workbench");
      _0x1be593.classList?.add?.("is-active");
      const _0x53c211 = beginWorkspaceHorizontalResizeSession({
        event: _0x33f7aa,
        splitter: _0x1be593,
        layout: _0x245287,
        windowObject: windowObject,
        body: documentObject.body,
        resizingClass: "person-replacement-composite-sidebar-resizing",
        onRatio: _0x2eb74e => {
          const _0x40c290 = Number(_0x245287?.getBoundingClientRect?.()?.width);
          const _0x13c2e2 = Number.isFinite(_0x40c290) ? _0x40c290 * _0x2eb74e / 100 : _0x38e2d5.workspace.compositeSidebarWidth;
          _0x38e2d5.workspace.compositeSidebarWidth = applyPersonReplacementCompositeSidebarWidthToLayout(_0x245287, _0x1be593, _0x13c2e2);
        },
        onFinish: () => {
          _0x1be593.classList?.remove?.("is-active");
          _0x575f0c("composite-sidebar-width");
        }
      });
      if (!_0x53c211) {
        _0x1be593.classList?.remove?.("is-active");
      }
      if (_0x53c211) {
        return;
      }
    }
    const _0x7b2c15 = _0x33f7aa.target?.closest?.("[data-person-replacement-voice-layout-splitter]");
    if (_0x7b2c15) {
      const _0x1824f1 = _0x7b2c15.closest?.("[data-person-replacement-voice-layout]");
      const _0x553009 = normalizeText(_0x7b2c15.dataset?.personReplacementVoiceLayoutSplitter);
      const _0x42610b = ["assets", "sources"].includes(_0x553009);
      if (_0x42610b) {
        _0x7b2c15.classList?.add?.("is-active");
      }
      const _0x37d0e9 = _0x42610b && beginWorkspaceHorizontalResizeSession({
        event: _0x33f7aa,
        splitter: _0x7b2c15,
        layout: _0x1824f1,
        windowObject: windowObject,
        body: documentObject.body,
        resizingClass: "person-replacement-voice-layout-resizing",
        onRatio: _0x7b8e90 => {
          const _0x1ace3d = normalizePersonReplacementVoiceLayout(_0x38e2d5.workspace.voiceLayout);
          const _0x358588 = normalizePersonReplacementVoiceLayout({
            ..._0x1ace3d,
            ...(_0x553009 === "assets" ? {
              assetsEnd: clamp(_0x7b8e90, 16, _0x1ace3d.sourcesEnd - 16, _0x1ace3d.assetsEnd)
            } : {
              sourcesEnd: clamp(_0x7b8e90, _0x1ace3d.assetsEnd + 16, 60, _0x1ace3d.sourcesEnd)
            })
          });
          _0x38e2d5.workspace.voiceLayout = applyPersonReplacementVoiceLayoutToElement(_0x1824f1, _0x358588);
        },
        onFinish: () => {
          _0x7b2c15.classList?.remove?.("is-active");
          _0x575f0c("voice-layout");
        }
      });
      if (!_0x37d0e9) {
        _0x7b2c15.classList?.remove?.("is-active");
      }
      if (_0x37d0e9) {
        return;
      }
    }
    const _0x48d385 = _0x33f7aa.target?.closest?.("[data-person-replacement-cut-boundary-index]");
    if (_0x48d385 && _0x219786(_0x33f7aa, _0x48d385)) {
      return;
    }
    const _0x4d02a4 = _0x33f7aa.target?.closest?.("[data-story-assets-splitter]");
    if (_0x4d02a4) {
      const _0x26dfdd = _0x4d02a4.closest?.(".story-assets-layout");
      beginWorkspaceHorizontalResizeSession({
        event: _0x33f7aa,
        splitter: _0x4d02a4,
        layout: _0x26dfdd,
        windowObject: windowObject,
        body: documentObject.body,
        resizingClass: "story-assets-resizing",
        onRatio: _0x497090 => {
          _0x38e2d5.workspace.assetSplitRatio = applyWorkspaceAssetSplitRatioToLayout(_0x26dfdd, _0x4d02a4, _0x497090);
        },
        onFinish: () => _0x575f0c("asset-split-ratio")
      });
      return;
    }
    if (_0x33f7aa.target) {
      _0x40953d?.begin?.(_0x33f7aa);
    }
  };
  const _0x3a253e = _0x4a008e => {
    if (_0x4c8f1d(_0x4a008e)) {
      return;
    }
    _0x366e9d(_0x4a008e);
    _0x293731(_0x4a008e);
  };
  const _0x13bfdf = _0x33a132 => {
    _0x509bd8(_0x33a132);
  };
  const _0x450703 = _0x264677 => {
    _0x509bd8(_0x264677, {
      cancelled: true
    });
  };
  const _0x9aba9c = _0x80a33c => {
    _0x513c56(_0x80a33c);
    _0x4eec1a(_0x80a33c);
  };
  const _0x1bee9c = () => {
    _0x482f24();
    const _0x513888 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-video]");
    if (!_0x513888 || !_0x3440f2.isOpen) {
      return;
    }
    _0x513888.preload = "auto";
    _0x513888.muted = !_0x3440f2.soundEnabled;
    if (_0x3440f2.boundPreviewVideos.has(_0x513888)) {
      if (_0x513888.paused === false) {
        _0x530b99.startNative(_0x513888);
      }
      return;
    }
    _0x3440f2.boundPreviewVideos.add(_0x513888);
    _0x513888.addEventListener?.("playing", () => _0x530b99.startNative(_0x513888));
    _0x513888.addEventListener?.("pause", () => {
      _0x413ff6();
      _0x57a8f7(_0x513888);
    });
    _0x513888.addEventListener?.("seeked", () => {
      const _0x1f8241 = _0x3440f2.pendingPreviewSeek;
      if (!_0x1f8241) {
        _0x57a8f7(_0x513888);
        return;
      }
      const _0x74ad50 = Number(_0x1f8241.token);
      _0x1f8241.seeked = true;
      if (typeof _0x513888.requestVideoFrameCallback !== "function") {
        _0x1f8241.presentedSourceSec = Number(_0x513888.currentTime);
      } else if (!Number.isFinite(Number(_0x1f8241.presentedSourceSec)) && _0x3440f2.previewFrameCallbackId == null) {
        _0x1f0980(_0x513888, _0x1f8241, _0x74ad50);
      }
      _0x44fcde(_0x513888, _0x1f8241, _0x74ad50);
      _0x57a8f7(_0x513888);
    });
    _0x513888.addEventListener?.("timeupdate", () => {
      if (!_0x513888.paused) {
        _0x530b99.startNative(_0x513888);
      } else {
        _0x57a8f7(_0x513888);
      }
    });
    _0x513888.addEventListener?.("ended", () => {
      _0x413ff6();
      _0x57a8f7(_0x513888);
    });
    _0x513888.addEventListener?.("error", () => {
      _0x246a2b();
      _0x3440f2.pendingPreviewSeek = null;
      windowObject?.showToast?.("裁剪预览视频加载失败，请稍后重试。", "warn");
    });
    if (_0x513888.paused === false) {
      _0x530b99.startNative(_0x513888);
    }
  };
  const _0x3d37c7 = _0x37ade1 => {
    const _0x347905 = (_0x3fbc21, _0x40768b) => _0x9910d3({
      dataset: {
        storyProjectId: _0x3fbc21
      }
    }, _0x40768b);
    return a1155_0x74ebf6({
      event: _0x37ade1,
      root: _0x318ed6,
      projects: _0x38e2d5.libraryProjects,
      commands: {
        openProject: _0x2117d1 => _0x443f39(onOpenProjectRequested, _0x2117d1),
        renameProject: _0x34b098 => _0x347905(_0x34b098, "rename-project"),
        duplicateProject: _0x1557c6 => _0x347905(_0x1557c6, "duplicate-project"),
        setProjectArchived: (_0x106450, _0xa29232) => _0x347905(_0x106450, _0xa29232 ? "archive-project" : "unarchive-project"),
        requestDeleteProject: _0x30c955 => _0x347905(_0x30c955, "request-delete-project")
      }
    });
  };
  const _0x4f7bcf = _0x58d6b1 => {
    _0x318ed6 = documentObject.createElement("section");
    _0x318ed6.className = "person-replacement-workspace replacement-studio-workspace";
    _0x318ed6.dataset.personReplacementWorkspace = "";
    _0x318ed6.dataset.replacementStudioWorkspace = "";
    _0x318ed6.dataset.uiStop = "1";
    _0x318ed6.setAttribute("aria-label", REPLACEMENT_STUDIO_NAME);
    _0x318ed6.innerHTML = renderHiddenInputs();
    _0x58d6b1.appendChild(_0x318ed6);
    _0x318ed6.addEventListener("click", _0x5f0f1a);
    _0x318ed6.addEventListener("input", _0x371671);
    _0x318ed6.addEventListener("change", _0x257e63);
    _0x318ed6.addEventListener("focusout", _0x378ede);
    _0x318ed6.addEventListener("dragstart", _0x37745c);
    _0x318ed6.addEventListener("dragend", _0x3f8fe1);
    _0x318ed6.addEventListener("dragover", _0x6d76cd);
    _0x318ed6.addEventListener("dragleave", _0x39d75c);
    _0x318ed6.addEventListener("drop", _0xcae9ae);
    _0x25b1da?.();
    _0x25b1da = bindWorkspaceEntityContextMenu(_0x318ed6, {
      resolveItems: _0x3d37c7,
      beforeOpen() {
        if (!_0x38e2d5.workspace.openProjectMenuId) {
          return;
        }
        _0x59ec0d({
          openProjectMenuId: ""
        });
      }
    });
    _0x318ed6.addEventListener("error", handleWorkspaceAssetLibraryImageError, true);
    _0x318ed6.addEventListener("pointerdown", _0x5161f6);
    _0x318ed6.addEventListener("pointerup", _0x13bfdf);
    _0x318ed6.addEventListener("pointercancel", _0x450703);
    _0x318ed6.addEventListener("pointerover", _0x4daf86);
    _0x318ed6.addEventListener("pointermove", _0x3a253e);
    _0x318ed6.addEventListener("pointerout", _0x9aba9c);
    _0x318ed6.addEventListener("dblclick", _0xf5f74a);
    const _0x4e8d01 = _0x1370f6 => {
      const _0x172eba = _0x1370f6.target?.closest?.(".person-replacement-production-page");
      if (!_0x172eba || !_0x318ed6.contains(_0x172eba)) {
        return false;
      }
      const _0x16a17f = _0x172eba.ownerDocument?.defaultView?.getComputedStyle?.(_0x172eba)?.overflowY;
      if (!["auto", "scroll", "overlay"].includes(_0x16a17f)) {
        return false;
      }
      const _0x3fc1d2 = Number(_0x1370f6.deltaY) || 0;
      const _0x3243f1 = Math.max(0, _0x172eba.scrollHeight - _0x172eba.clientHeight);
      if (_0x3fc1d2 < 0) {
        return _0x172eba.scrollTop > 0;
      }
      if (_0x3fc1d2 > 0) {
        return _0x172eba.scrollTop < _0x3243f1;
      }
      return false;
    };
    _0x318ed6.addEventListener("wheel", _0xbac4a8 => {
      if (_0x4e8d01(_0xbac4a8)) {
        _0xbac4a8.stopPropagation();
        return;
      }
      if (_0x202160(_0xbac4a8)) {
        _0xbac4a8.stopPropagation();
        return;
      }
      if (_0x10e233(_0xbac4a8)) {
        _0xbac4a8.stopPropagation();
        return;
      }
      if (_0x448915(_0xbac4a8)) {
        return;
      }
      if (_0x37d999(_0xbac4a8)) {
        _0xbac4a8.stopPropagation();
        return;
      }
      if (shouldPreserveWorkspaceNestedWheel(_0xbac4a8.target, {
        nestedSelector: "textarea, [contenteditable=\"true\"], .node-model-submenu, .story-style-grid, .story-assets-list, .story-episode-assets, .story-clip-strip",
        boundaryRoot: _0x318ed6
      })) {
        _0xbac4a8.stopPropagation();
        return;
      }
      _0xbac4a8.stopPropagation();
      if (!_0x1f1ccf(_0xbac4a8) && !_0x3e19b2(_0xbac4a8) && !_0x295839(_0xbac4a8)) {
        _0x46ea8c(_0xbac4a8);
      }
    }, {
      passive: false
    });
    _0x318ed6.addEventListener("keydown", _0x403c9a, true);
    windowObject?.addEventListener?.("keydown", _0x2530e8, true);
    windowObject?.addEventListener?.("resize", _0x25242e);
    const _0x2b2351 = _0xd0382f => {
      if (_0xd0382f?.key === "Control" || _0xd0382f?.code === "ControlLeft" || _0xd0382f?.code === "ControlRight") {
        _0x28b90d = _0xd0382f.type === "keydown";
      }
    };
    const _0x15cd8b = () => {
      _0x28b90d = false;
      _0x19011a();
    };
    windowObject?.addEventListener?.("keydown", _0x2b2351, true);
    windowObject?.addEventListener?.("keyup", _0x2b2351, true);
    windowObject?.addEventListener?.("blur", _0x15cd8b, true);
    _0x44808f = () => {
      windowObject?.removeEventListener?.("keydown", _0x2b2351, true);
      windowObject?.removeEventListener?.("keyup", _0x2b2351, true);
      windowObject?.removeEventListener?.("blur", _0x15cd8b, true);
      _0x15cd8b();
    };
    _0x40953d = createWorkspaceMarqueeSelectionController({
      root: _0x318ed6,
      documentObject: documentObject,
      windowObject: windowObject,
      surfaceSelector: "[data-story-marquee-surface]",
      blockedControlSelector: "[data-story-action], [data-person-replacement-action], input, textarea, select, a, [contenteditable='true']",
      overlayClassName: "story-marquee-selection",
      itemSelector: "[data-story-marquee-item]",
      getItemId: _0xf5f361 => _0xf5f361.dataset?.storyMarqueeId,
      getConfig: _0x1a346b => {
        if (_0x1a346b?.dataset?.storyMarqueeSurface === "shot-cuts" && _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 2 && _0x3440f2.isOpen) {
          return {
            enabled: !_0x5b60e4(),
            selectedIds: _0x3440f2.selectedShotIds,
            itemSelector: "[data-person-replacement-shot-cut-selectable]",
            getItemId: _0x15d40f => _0x15d40f.dataset?.shotId,
            hitClassName: "is-marquee-hit",
            rootClassName: "is-shot-cut-marquee-selecting",
            commit: _0x4e8cce => {
              _0x5bddd1.setSelectedShotIds(_0x4e8cce);
              _0x3be3ab();
            }
          };
        }
        if (_0x1a346b?.dataset?.storyMarqueeSurface === "people" && _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 2 && !_0x3440f2.isOpen) {
          return {
            enabled: true,
            canBegin: _0x585cd1 => _0xb1473d(_0x585cd1),
            additive: false,
            selectedIds: [],
            itemSelector: "[data-person-replacement-person-drop]",
            hitClassName: "is-batch-selection-hit",
            overlayClassName: "is-person-box-selection",
            rootClassName: "is-person-box-marquee-selecting",
            getItemId: _0x33aba4 => _0x33aba4.dataset?.personId,
            commit: _0x157068 => {
              _0x474d95(_0x1a346b.dataset?.shotId, _0x157068);
              _0x3d7690();
            }
          };
        }
        if (_0x1a346b?.dataset?.storyMarqueeSurface === "shots" && _0x38e2d5.workspace.view === "project" && [2, 3, 5].includes(_0x38e2d5.workspace.step) && !_0x3440f2.isOpen) {
          return {
            enabled: true,
            selectedIds: _0x38e2d5.workspace.selectedShotIds,
            commit: _0xda224d => {
              _0x1ef913({
                ..._0x38e2d5,
                workspace: {
                  ..._0x38e2d5.workspace,
                  shotSelectionMode: true,
                  selectedShotIds: _0xda224d
                }
              }, "shot-marquee");
            }
          };
        }
        return {
          enabled: _0x1a346b?.dataset?.storyMarqueeSurface === "assets" && _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 1 && ["character", "scene", "library"].includes(_0x38e2d5.workspace.characterAssetTab),
          selectedIds: _0x38e2d5.workspace.selectedAssetIds,
          commit: _0x3ac3cf => {
            const _0x3eae42 = new Set(getPersonReplacementSelectableAssets(_0x38e2d5, _0x38e2d5.workspace.characterAssetTab).map(_0x3e6a01 => _0x3e6a01.id));
            const _0x1353a5 = _0x3ac3cf.filter(_0x5cd2ad => _0x3eae42.has(_0x5cd2ad));
            _0x1ef913({
              ..._0x38e2d5,
              workspace: {
                ..._0x38e2d5.workspace,
                assetSelectionMode: _0x1353a5.length > 0,
                selectedAssetIds: _0x1353a5
              }
            }, "asset-marquee");
          }
        };
      }
    });
    return _0x318ed6;
  };
  const _0x4ad349 = (_0x3b8055, _0x1e88f4) => {
    const _0x39ec43 = _0x3b8055?.querySelector?.(".story-asset-tabs");
    const _0xf81019 = _0x1e88f4?.querySelector?.(".story-asset-tabs");
    if (!_0x39ec43 || !_0xf81019) {
      return;
    }
    _0x39ec43.dataset.activeTab = _0xf81019.dataset.activeTab;
    _0x39ec43.querySelectorAll?.("[data-asset-tab]")?.forEach?.(_0x2925c4 => {
      const _0xae42d2 = normalizeText(_0x2925c4.dataset?.assetTab);
      const _0x5b4be9 = Array.from(_0xf81019.querySelectorAll?.("[data-asset-tab]") || []).find(_0x260cd7 => normalizeText(_0x260cd7.dataset?.assetTab) === _0xae42d2);
      if (!_0x5b4be9) {
        return;
      }
      _0x2925c4.classList?.toggle?.("is-active", _0x5b4be9.classList?.contains?.("is-active") === true);
      const _0x217a85 = _0x5b4be9.getAttribute?.("aria-selected");
      if (_0x217a85 == null) {
        _0x2925c4.removeAttribute?.("aria-selected");
      } else {
        _0x2925c4.setAttribute?.("aria-selected", _0x217a85);
      }
      _0x2925c4.tabIndex = _0x5b4be9.tabIndex;
      const _0x4f6551 = _0x2925c4.querySelector?.(".story-asset-tab-count");
      const _0x2904a8 = _0x5b4be9.querySelector?.(".story-asset-tab-count");
      if (_0x4f6551 && _0x2904a8) {
        _0x4f6551.textContent = _0x2904a8.textContent;
      }
    });
  };
  const _0x2b575a = (_0x1efcd, _0x1882ad) => {
    const _0x37177b = _0x1efcd?.querySelector?.(".person-replacement-story-toolbar");
    const _0x18dea8 = _0x1882ad?.querySelector?.(".person-replacement-story-toolbar");
    const _0x21ebc5 = _0x37177b?.querySelector?.(".person-replacement-story-steps");
    const _0x336014 = _0x18dea8?.querySelector?.(".person-replacement-story-steps");
    if (!_0x37177b || !_0x18dea8 || !_0x21ebc5 || !_0x336014) {
      return false;
    }
    _0x37177b.className = _0x18dea8.className;
    _0x21ebc5.dataset.activeStep = _0x336014.dataset.activeStep;
    _0x21ebc5.querySelectorAll?.("[data-person-replacement-step]")?.forEach?.(_0x21af7a => {
      const _0x53273c = normalizeText(_0x21af7a.dataset?.personReplacementStep);
      const _0x41d73d = Array.from(_0x336014.querySelectorAll?.("[data-person-replacement-step]") || []).find(_0x4d26ef => normalizeText(_0x4d26ef.dataset?.personReplacementStep) === _0x53273c);
      if (!_0x41d73d) {
        return;
      }
      _0x21af7a.className = _0x41d73d.className;
      ["aria-current", "aria-disabled", "title"].forEach(_0x51362c => {
        const _0x383524 = _0x41d73d.getAttribute?.(_0x51362c);
        if (_0x383524 == null) {
          _0x21af7a.removeAttribute?.(_0x51362c);
        } else {
          _0x21af7a.setAttribute?.(_0x51362c, _0x383524);
        }
      });
    });
    const _0x358ae7 = _0x37177b.querySelector?.(".person-replacement-toolbar-side");
    const _0x10b00a = _0x18dea8.querySelector?.(".person-replacement-toolbar-side");
    if (_0x358ae7 && _0x10b00a) {
      _0x358ae7.innerHTML = _0x10b00a.innerHTML;
    }
    return true;
  };
  const _0x40d7d3 = ({
    renderPending = false
  } = {}) => {
    _0x5d5c1e?.({
      renderPending: renderPending
    });
    _0x5d5c1e = null;
  };
  const _0x1d97f6 = () => {
    const _0xdeccdf = documentObject?.activeElement;
    if (!_0xdeccdf || !_0x318ed6?.contains?.(_0xdeccdf)) {
      return null;
    }
    const _0x5d6e9e = normalizeText(_0xdeccdf.dataset?.personReplacementStep);
    if (_0x5d6e9e) {
      return {
        kind: "step",
        value: _0x5d6e9e
      };
    }
    const _0x1aeeaf = normalizeText(_0xdeccdf.dataset?.assetTab);
    if (_0x1aeeaf) {
      return {
        kind: "asset-tab",
        value: _0x1aeeaf
      };
    }
    const _0x3a0a84 = _0x3440f2.isOpen ? _0xdeccdf.closest?.(["[data-person-replacement-shot-cut-editor]", "#person-replacement-shot-cut-smart-detect-panel"].join(",")) : null;
    if (_0x3a0a84) {
      const _0x31f107 = _0xdeccdf.closest?.("[data-person-replacement-action]");
      return {
        kind: "cut-editor",
        value: normalizeText(_0x31f107?.dataset?.personReplacementAction, "surface"),
        shotId: normalizeText(_0x31f107?.dataset?.shotId),
        smartClipMode: normalizeText(_0x31f107?.dataset?.smartClipMode)
      };
    }
    return null;
  };
  const _0x36a1e6 = (_0x275f5f, {
    currentToolbar = null,
    incomingPage = null
  } = {}) => {
    if (!_0x275f5f?.value) {
      return false;
    }
    if (_0x275f5f.kind === "cut-editor") {
      const _0x398dc6 = _0x318ed6?.querySelector?.("[data-person-replacement-shot-cut-editor]");
      const _0xd07c76 = _0x275f5f.value === "surface" ? null : Array.from(_0x318ed6?.querySelectorAll?.("[data-person-replacement-action]") || []).find(_0x5af7d4 => normalizeText(_0x5af7d4.dataset?.personReplacementAction) === _0x275f5f.value && (!_0x275f5f.shotId || normalizeText(_0x5af7d4.dataset?.shotId) === _0x275f5f.shotId) && (!_0x275f5f.smartClipMode || normalizeText(_0x5af7d4.dataset?.smartClipMode) === _0x275f5f.smartClipMode));
      const _0x5217dd = _0xd07c76 && !_0xd07c76.disabled ? _0xd07c76 : _0x398dc6;
      if (!_0x5217dd) {
        return false;
      }
      try {
        _0x5217dd.focus?.({
          preventScroll: true
        });
      } catch {
        _0x5217dd.focus?.();
      }
      return documentObject?.activeElement === _0x5217dd;
    }
    const _0x1dd6e6 = _0x275f5f.kind === "step" ? currentToolbar || _0x318ed6 : incomingPage || _0x318ed6;
    const _0x2d374d = _0x275f5f.kind === "step" ? "personReplacementStep" : _0x275f5f.kind === "asset-tab" ? "assetTab" : "";
    if (!_0x1dd6e6 || !_0x2d374d) {
      return false;
    }
    const _0xa37090 = _0x275f5f.kind === "step" ? "[data-person-replacement-step]" : "[data-asset-tab]";
    const _0x3b40ba = Array.from(_0x1dd6e6.querySelectorAll?.(_0xa37090) || []).find(_0x1abb1a => normalizeText(_0x1abb1a.dataset?.[_0x2d374d]) === _0x275f5f.value);
    if (!_0x3b40ba || _0x3b40ba.disabled) {
      return false;
    }
    try {
      _0x3b40ba.focus?.({
        preventScroll: true
      });
    } catch {
      _0x3b40ba.focus?.();
    }
    return documentObject?.activeElement === _0x3b40ba;
  };
  const _0x40a3f7 = createWorkspacePageTransitionController({
    windowObject: windowObject,
    disposePage: _0x643381 => _0x643381?.remove?.(),
    restoreFocus: (_0x1c3ee5, _0x10d173) => {
      if (documentObject?.activeElement !== documentObject?.body) {
        return false;
      }
      return _0x36a1e6(_0x1c3ee5, _0x10d173);
    }
  });
  const _0x443269 = (_0x4a88ef, _0x24fd5d, _0xf5db4d, _0x5922ae, {
    currentToolbar = null,
    nextToolbar = null,
    focusKey = null
  } = {}) => {
    const _0x1dfaf7 = _0x24fd5d?.parentElement;
    if (!_0x4a88ef || !_0x24fd5d || !_0x1dfaf7 || !["forward", "backward"].includes(_0xf5db4d)) {
      return false;
    }
    const _0x552460 = _0xf5db4d === "backward" ? "is-entering-backward" : "is-entering-forward";
    const _0x27313f = _0xf5db4d === "backward" ? "is-leaving-backward" : "is-leaving-forward";
    const _0x2a6bce = _0x4a88ef.querySelector?.("[data-story-assets-switch-region]");
    const _0x50fae9 = _0x24fd5d.querySelector?.("[data-story-assets-switch-region]");
    const _0x5d2f30 = _0x4a88ef.querySelector?.(".story-assets-list");
    const _0x3f7518 = _0x24fd5d.querySelector?.(".story-assets-list");
    const _0x3e47ce = _0x5922ae === "asset-content" && _0x2a6bce && _0x50fae9;
    const _0x5c01f8 = _0x5922ae === "asset-list" && _0x5d2f30 && _0x3f7518;
    const _0x268a29 = _0x3e47ce || _0x5c01f8;
    const _0x29bb83 = _0x5c01f8 ? "person-replacement-page--asset-list-transition" : _0x3e47ce ? "person-replacement-page--asset-content-transition" : "";
    const _0x4d677f = _0x5c01f8 ? "person-replacement-page--asset-list-transition-target" : _0x3e47ce ? "person-replacement-page--asset-content-transition-target" : "";
    const _0x2d43c0 = _0x5c01f8 ? _0x3f7518 : _0x3e47ce ? _0x50fae9 : _0x24fd5d;
    _0x24fd5d.remove?.();
    let _0x2d5afd = true;
    let _0x5e5d88 = null;
    const _0x19d9d3 = ({
      renderPending = true
    } = {}) => {
      _0x2d5afd = renderPending;
      _0x5e5d88?.cancel?.({
        commit: true
      });
    };
    _0x5e5d88 = _0x40a3f7.start({
      current: _0x4a88ef,
      next: _0x24fd5d,
      parent: _0x1dfaf7,
      direction: _0xf5db4d,
      transitionElement: _0x2d43c0,
      classNames: {
        current: "is-current",
        page: "person-replacement-page-transition",
        parent: "person-replacement-page-transitioning",
        scopeCurrent: _0x29bb83,
        scopeNext: _0x29bb83,
        scopeTarget: _0x4d677f,
        retainCurrentOnCommit: false,
        directions: {
          [_0xf5db4d]: {
            entering: _0x552460,
            leaving: _0x27313f
          }
        }
      },
      focusKey: focusKey,
      focusContext: {
        currentToolbar: currentToolbar,
        incomingPage: _0x24fd5d
      },
      mount: () => {
        if (_0x24fd5d.parentElement !== _0x1dfaf7) {
          _0x1dfaf7.appendChild?.(_0x24fd5d);
        }
        _0x1dfaf7.insertBefore?.(_0x4a88ef, _0x24fd5d);
      },
      forceLayout: () => {
        currentToolbar?.getBoundingClientRect?.();
        _0x4a88ef.querySelector?.(".story-asset-tabs")?.getBoundingClientRect?.();
        _0x2d43c0?.getBoundingClientRect?.();
      },
      onBeforeCommit: () => {
        _0x2b575a(currentToolbar, nextToolbar);
        if (_0x268a29) {
          _0x4ad349(_0x4a88ef, _0x24fd5d);
        }
      },
      onSettled: () => {
        if (_0x5d5c1e === _0x19d9d3) {
          _0x5d5c1e = null;
        }
        _0x1cb872 = "";
        const _0x498ddc = _0x2d5afd && _0x35790e;
        _0x35790e = false;
        if (_0x498ddc && !_0x362ce5) {
          _0x3be3ab();
        }
      }
    });
    if (!_0x5e5d88) {
      return false;
    }
    _0x5d5c1e = _0x19d9d3;
    _0x1cb872 = _0x2a557f(_0x38e2d5);
    return true;
  };
  const _0x4213ea = _0x3be3ab;
  _0x3be3ab = () => {
    if (!_0x318ed6 || _0x362ce5) {
      return;
    }
    const _0x4fd415 = _0x11a18b;
    const _0x195540 = _0x5a2f56;
    const _0x4fed14 = _0xfe3258(_0x38e2d5);
    const _0x13832b = _0x4fd415 === "none" && _0x304022 === _0x4fed14 ? captureWorkspaceNestedScrollPositions(_0x318ed6, PERSON_REPLACEMENT_PERSISTENT_NESTED_SCROLL_SELECTORS) : null;
    _0x11a18b = "none";
    _0x5a2f56 = "page";
    if (_0x5d5c1e && _0x4fd415 === "none" && _0x1cb872 === _0x2a557f(_0x38e2d5)) {
      _0x35790e = true;
      return;
    }
    const _0x1c8500 = _0x1d97f6();
    _0x3d943d();
    _0x40d7d3({
      renderPending: false
    });
    const _0x507093 = _0x318ed6.querySelector?.(".person-replacement-project-body");
    const _0x3a2f85 = ["forward", "backward"].includes(_0x4fd415) ? _0x507093?.firstElementChild || null : null;
    const _0x2a6c64 = _0x3a2f85 ? _0x318ed6.querySelector?.(".story-workspace-toolbar") : null;
    _0x3a2f85?.remove?.();
    _0x2a6c64?.remove?.();
    const _0xbde14 = _0x38e2d5.workspace.view === "project" && _0x38e2d5.workspace.step === 2 && !_0x3440f2.isOpen;
    _0x182068 = _0xbde14;
    _0x4213ea();
    restoreWorkspaceNestedScrollPositions(_0x318ed6, _0x13832b);
    _0x304022 = _0x4fed14;
    _0x1483e7();
    const _0x75c672 = _0x318ed6.querySelector?.(".person-replacement-project-body");
    const _0x55bf98 = _0x75c672?.firstElementChild || null;
    const _0xd1d019 = _0x2a6c64 ? _0x318ed6.querySelector?.(".story-workspace-toolbar") : null;
    if (_0x2a6c64 && _0xd1d019) {
      _0xd1d019.replaceWith?.(_0x2a6c64);
    }
    const _0x2f6cba = _0x443269(_0x3a2f85, _0x55bf98, _0x4fd415, _0x195540, {
      currentToolbar: _0x2a6c64,
      nextToolbar: _0xd1d019,
      focusKey: _0x1c8500
    });
    if (!_0x2f6cba) {
      _0x2b575a(_0x2a6c64, _0xd1d019);
    }
    _0x36a1e6(_0x1c8500, {
      currentToolbar: _0x2a6c64,
      incomingPage: _0x55bf98
    });
    if (_0xbde14) {
      const _0x5d765a = _0x318ed6.querySelector?.("[data-person-replacement-keyframe-stage]");
      _0x5d765a?.classList?.add?.("is-manual-selecting");
      _0x53fe32(_0x5d765a);
    }
    if (_0x51aaf9 && _0x26dcb0) {
      const _0x11ad59 = _0x38e2d5.shots.some(_0x4f12c0 => _0x4f12c0.id === _0x51aaf9 && _0x4f12c0.people?.some(_0x1613a6 => _0x1613a6.id === _0x26dcb0));
      const _0x21b452 = _0x11ad59 ? Array.from(_0x318ed6.querySelectorAll?.(".person-replacement-detection-box[data-person-id]") || []).find(_0x114543 => _0x114543.dataset?.shotId === _0x51aaf9 && _0x114543.dataset?.personId === _0x26dcb0) : null;
      if (_0x21b452) {
        _0x3a3cb8(_0x21b452);
      } else {
        _0x5e89ff();
      }
    }
    if (typeof _0x318ed6.insertAdjacentHTML === "function") {
      _0x318ed6.insertAdjacentHTML("beforeend", renderHiddenInputs());
    } else {
      _0x318ed6.innerHTML += renderHiddenInputs();
    }
    _0x18fbd7();
    _0x1bee9c();
    _0x44b2f8();
    _0x506fd8();
  };
  const _0x47c105 = Object.freeze({
    open(_0x55f279 = {}) {
      if (_0x362ce5) {
        return null;
      }
      if (_0x55f279.project) {
        _0x67bb7();
        _0x38e2d5 = a1155_0x56b8cf(_0x55f279.project);
        _0x5bddd1.syncProject(_0x38e2d5);
        _0x420bb9.switchProject(_0x38e2d5.id);
      }
      _0x38e2d5 = _0x5c163a(_0x38e2d5);
      _0x364938 = _0x55f279.mountTarget || _0x364938;
      const _0x2cf6c0 = resolveMountTarget(documentObject, _0x364938);
      if (!_0x2cf6c0) {
        return null;
      }
      if (!_0x318ed6) {
        _0x4f7bcf(_0x2cf6c0);
      } else if (_0x318ed6.parentElement !== _0x2cf6c0) {
        _0x2cf6c0.appendChild(_0x318ed6);
      }
      _0x318ed6.hidden = false;
      _0x318ed6.setAttribute("aria-hidden", "false");
      _0x3be3ab();
      return _0x318ed6;
    },
    close() {
      if (!_0x318ed6 || _0x362ce5) {
        return false;
      }
      _0xafce7e();
      _0x1f4615();
      _0x40953d?.cancel?.();
      _0x114d43();
      let _0x68a2e0 = true;
      try {
        _0x68a2e0 = canClose(cloneJson(_0x38e2d5)) !== false;
      } catch {
        _0x68a2e0 = true;
      }
      if (!_0x68a2e0) {
        _0x43f5cd("close");
        return false;
      }
      _0x67bb7();
      _0x5b86b7();
      _0x394541();
      _0x3bd0b3();
      _0x293979();
      _0x446efc();
      _0x400efa();
      _0x318ed6.hidden = true;
      _0x318ed6.setAttribute("aria-hidden", "true");
      _0x3638b1();
      _0x59b80b = "";
      _0x4516df?.();
      _0x4516df = null;
      onClose({
        project: cloneJson(_0x38e2d5)
      });
      return true;
    },
    setProject(_0x49aa14) {
      if (_0x362ce5) {
        return null;
      }
      const _0x4ebb09 = _0x38e2d5;
      const _0x134bfe = _0x5c163a(a1155_0x56b8cf(_0x49aa14));
      const _0x4c186f = normalizeText(_0x134bfe.id);
      if (_0x4c186f !== normalizeText(_0x4ebb09.id)) {
        _0x446efc();
        _0x420bb9.switchProject(_0x4c186f);
      }
      _0x38e2d5 = _0x134bfe;
      if (_0x59b80b && !_0x38e2d5.characters.some(_0x38787d => _0x38787d.id === _0x59b80b)) {
        _0x59b80b = "";
      }
      const _0x112ffd = _0x5bddd1.syncProject(_0x38e2d5);
      _0x43a8dc(_0x4ebb09, _0x38e2d5);
      const _0x448f82 = new Set(_0x38e2d5.shots.map(_0xff754f => _0xff754f.id));
      if (_0x112ffd || (_0x3440f2.isOpen || _0x3440f2.isOpening) && (_0x38e2d5.workspace.view !== "project" || _0x38e2d5.workspace.step !== 2 || _0x3440f2.draft.some(_0x58cd52 => !_0x448f82.has(_0x58cd52.shotId)))) {
        _0x67bb7();
      }
      _0x3be3ab();
      return cloneJson(_0x38e2d5);
    },
    syncProjectState(_0x12840e) {
      if (_0x362ce5) {
        return null;
      }
      const _0x3ec057 = _0x38e2d5;
      const _0x3dcc38 = a1155_0x56b8cf(_0x12840e);
      const _0x5834fb = Boolean(_0x318ed6 && normalizeText(_0x3dcc38.id) === normalizeText(_0x38e2d5.id) && _0x3dcc38.workspace?.view === "project" && _0x3dcc38.workspace?.step === 3 && _0x38e2d5.workspace?.view === "project" && _0x38e2d5.workspace?.step === 3);
      const _0x17160a = _0x5834fb ? resolvePersonReplacementVideoGenerationUiRefreshScope(_0x3ec057, _0x3dcc38) : "";
      const _0x5ac01a = Boolean(_0x318ed6 && normalizeText(_0x3dcc38.id) === normalizeText(_0x38e2d5.id) && _0x3dcc38.workspace?.view === "project" && _0x3dcc38.workspace?.step === 2 && _0x38e2d5.workspace?.view === "project" && _0x38e2d5.workspace?.step === 2);
      const _0x18ff00 = _0x5ac01a ? resolvePersonReplacementImageGenerationUiRefreshScope(_0x3ec057, _0x3dcc38) : "";
      if (normalizeText(_0x3dcc38.id) !== normalizeText(_0x38e2d5.id)) {
        _0x446efc();
        _0x420bb9.switchProject(_0x3dcc38.id);
      }
      _0x38e2d5 = _0x3dcc38;
      if (_0x5bddd1.syncProject(_0x38e2d5)) {
        _0x67bb7();
      }
      if (_0x18ff00 === "selected-shot") {
        _0x29245c({
          refreshTimelineCard: true
        });
      } else if (_0x18ff00 === "timeline") {
        _0x3f6136();
      } else if (_0x17160a === "selected-shot") {
        if (!_0x1ac515() && !_0x473164) {
          _0x3be3ab();
        }
      } else if (_0x17160a === "timeline") {
        _0x3f6136();
      }
      personReplacementShellPresentation.syncStatus(_0x318ed6, _0x38e2d5);
      _0x44b2f8();
      _0x506fd8();
      return cloneJson(_0x38e2d5);
    },
    setPersistenceState(_0x3f5684) {
      if (_0x362ce5) {
        return null;
      }
      _0x38e2d5 = {
        ..._0x38e2d5,
        persistenceState: normalizePersonReplacementPersistenceState(_0x3f5684)
      };
      personReplacementShellPresentation.syncStatus(_0x318ed6, _0x38e2d5);
      return cloneJson(_0x38e2d5.persistenceState);
    },
    setOutputCanvasSyncState(_0x4975d1 = {}) {
      if (_0x362ce5) {
        return null;
      }
      const _0x3878a0 = _0x3fe184;
      _0x3fe184 = _0x4975d1?.pending === true;
      _0x2a3a58 = _0x3fe184 ? normalizeText(_0x4975d1?.scope) : "";
      _0x282d91();
      const _0x25ea3d = _0x318ed6?.querySelector?.(".person-replacement-toolbar-actions");
      const _0x3b89a4 = _0x47685f(personReplacementShellPresentation.renderToolbarActions(_0x38e2d5, _0x502ba8()));
      if (_0x25ea3d && _0x3b89a4 && typeof _0x25ea3d.replaceWith === "function") {
        _0x25ea3d.replaceWith(_0x3b89a4);
      }
      _0x33d575({
        captureFocus: _0x3fe184 && !_0x3878a0
      });
      return {
        pending: _0x3fe184,
        scope: _0x2a3a58
      };
    },
    setComposeOutputState(_0x1b3c22 = {}) {
      if (_0x362ce5) {
        return null;
      }
      const _0x4d2f49 = _0x11ed59;
      _0x11ed59 = _0x1b3c22?.pending === true;
      const _0xbf812c = _0x318ed6?.querySelector?.("[data-person-replacement-action=\"compose-output\"]");
      const _0x179420 = _0x47685f(renderCompositeComposeAction(_0x38e2d5, _0x502ba8()));
      if (_0xbf812c && _0x179420 && typeof _0xbf812c.replaceWith === "function") {
        _0xbf812c.replaceWith(_0x179420);
      }
      _0x18569e();
      if (_0x4d2f49 && !_0x11ed59) {
        _0x2dab32({
          composeOnly: true
        });
      }
      return {
        pending: _0x11ed59
      };
    },
    setExportOutputState(_0x4da750 = {}) {
      if (_0x362ce5) {
        return null;
      }
      _0x48a077 = _0x4da750?.pending === true;
      _0x282d91();
      const _0x5230db = _0x318ed6?.querySelector?.(".person-replacement-toolbar-actions");
      const _0x34474f = _0x47685f(personReplacementShellPresentation.renderToolbarActions(_0x38e2d5, _0x502ba8()));
      if (_0x5230db && _0x34474f && typeof _0x5230db.replaceWith === "function") {
        _0x5230db.replaceWith(_0x34474f);
      }
      return {
        pending: _0x48a077
      };
    },
    prewarmCompositeOriginalVideo(_0x55733e = "") {
      if (_0x362ce5) {
        return false;
      }
      return _0x336ffd(_0x55733e);
    },
    getProject() {
      return cloneJson(_0x38e2d5);
    },
    /** 重新按当前 manifest 清单渲染工作室 UI（配置模型变更后使用）。 */
    refresh() {
      if (_0x362ce5) return false;
      _0x3be3ab();
      return true;
    },
    refreshVoiceSources(_0x1b5c5b = {}) {
      return _0x1bb26b(_0x1b5c5b);
    },
    destroy() {
      if (_0x362ce5) {
        return;
      }
      _0xfebc3.forEach(_0x456aed => {
        _0x456aed.cancellation?.request?.();
      });
      _0x56a1df?.request?.();
      _0xafce7e();
      _0x1f4615();
      _0x67bb7();
      _0x5bddd1.dispose();
      _0x5b86b7();
      _0x394541();
      _0x446efc();
      _0x420bb9.dispose();
      _0x40d7d3({
        renderPending: false
      });
      _0x40a3f7.destroy();
      _0x494354();
      _0x3f8fe1();
      _0x1a17dd({
        restoreFocus: false
      });
      _0x362ce5 = true;
      if (_0x49248e) {
        _0x2bcbe9(null, {
          cancelled: true
        });
      }
      _0x1b1750.forEach(_0x4fdff4 => _0x4fdff4?.destroy?.());
      _0x2e4999();
      _0xbbc934?.destroy?.();
      _0xbbc934 = null;
      _0x3a40cf?.();
      _0x3a40cf = null;
      _0x37c7f0?.();
      _0x37c7f0 = null;
      if (typeof _0x318ed6?.removeEventListener === "function") {
        _0x318ed6.removeEventListener("error", handleWorkspaceAssetLibraryImageError, true);
      }
      _0x25b1da?.();
      _0x25b1da = null;
      _0x4516df?.();
      _0x44808f?.();
      _0x44808f = null;
      windowObject?.removeEventListener?.("keydown", _0x2530e8, true);
      windowObject?.removeEventListener?.("resize", _0x25242e);
      _0x40953d?.destroy?.();
      _0x3638b1();
      if (_0x5b4c64 && typeof windowObject?.cancelAnimationFrame === "function") {
        windowObject.cancelAnimationFrame(_0x5b4c64);
      }
      _0x318ed6?.remove?.();
      _0x318ed6 = null;
    }
  });
  return _0x47c105;
}
