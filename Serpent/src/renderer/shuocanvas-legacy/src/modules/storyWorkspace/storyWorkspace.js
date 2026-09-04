import { getAssetMentionCandidates, resolveAssetMentionRef, subscribeAssetMentionRegistry } from "../assetMentionRegistry.js";
import { createWorkspacePageTransitionController } from "../workspacePageTransition.js";
import { createWorkspaceMenuController, syncWorkspaceInlineMenuExpandedWidth } from "../workspaceMenuController.js";
import { bindAIGenTextModelSelector, renderAIGenTextModelSelectorMarkup } from "../../components/aigenText/modelSelector.js";
import { bindAIGenImageModelSelector, renderAIGenImageModelSelectorMarkup } from "../../components/aigenImage/modelSelector.js";
import { bindAIGenVideoModelSelector } from "../../components/aigenVideo/modelSelector.js";
import { buildAudioWorkflowFooterHtml } from "../../components/audio-node/audioFooterSchemaSlots.js";
import { bindAudioWorkflowSchemaSlotControls } from "../../components/audio-node/audioWorkflowSchemaSlotSync.js";
import { bindNodeFooterController, bindNodeModelMenuTrigger, closeNodeFooterMenus } from "../../components/shared/nodeFooterControls.js";
import { createModelProviderProfileControl } from "../../components/shared/modelProviderProfileControl.js";
import { getImageGenerationResultError, getSuccessfulImageGenerationItems, normalizeImageGenerationResult } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { hasPendingRuntimeManifestLoad, waitForRuntimeManifestLoad } from "../../manifests/runtimeManifestReadiness.js";
import { openImagePreview, openVideoPreview } from "../imagePreview.js";
import { showProviderApiKeyMissingToastForError } from "../providerApiKeyMissingToast.js";
import { resolveModelProviderProfileId } from "../modelProviderProfileSelection.js";
import { getDisplayModelName } from "../providers.js";
import { saveOutputBlob, saveOutputFromUrl, uploadFile } from "../../services/projectService.js";
import { saveMediaDownload } from "../../services/downloadSaveService.js";
import { playCompletionSound } from "../../services/completionSoundService.js";
import { logDeveloperDiagnosticEvent } from "../../services/diagnosticsService.js";
import { showGenerationCompleteNotification, subscribeGenerationCompleteNotificationClicks } from "../../services/completionNotificationService.js";
import { attachMediaElementPlaybackSource } from "../../services/desktopMediaBlobSource.js";
import { DEBUG_WRENCH_ICON_HTML } from "../../utils/debugRequestPreview.js";
import { fetchVideoFirstFrameThumbFromServer } from "../../../api/videoThumbApi.js";
import { ensureVideoResultThumbnail } from "../../../api/videoResultThumbnailApi.js";
import { resumeAsyncImageTask, resumeDreaminaImageTask, resumeRunningHubImageTask } from "../../../api/aiImageApi.js";
import { createDemoStoryWorkspaceData } from "./storyWorkspaceData.js";
import { renderWorkspaceAssetSettingsShell as a1413_0x3dc129 } from "../workspaceAssetSettingsShell.js";
import { renderWorkspaceAssetSelectionActions, resolveWorkspaceCardMultiSelection, toggleWorkspaceAssetSelectAll, toggleWorkspaceAssetSelection } from "../workspaceAssetSelection.js";
import { buildWorkspaceAssetLibraryItems, createWorkspaceAssetLibraryDisclosure, getWorkspaceAssetLibraryMediaLabel, handleWorkspaceAssetLibraryImageError } from "../workspaceAssetLibrary.js";
import { renderWorkspaceImageDownloadButton, runWorkspaceImageDownloadAction, saveWorkspaceImageDownload } from "../workspaceImageDownload.js";
import { buildWorkspaceAssetHoverPreviewContent, consumeWorkspaceWheelDirection, isWorkspaceAssetHoverLandscape, renderWorkspaceAssetLoadingOverlay, renderWorkspaceAssetTabIcon, renderWorkspacePreviewArrow, resolveWorkspaceTabTransitionDirection } from "../workspaceAssetPresentation.js";
import { renderStoryAddToLibraryIcon, renderStoryDeleteIcon, renderStoryUploadIcon } from "./storyWorkspaceIcons.js";
import { createStoryMediaHistoryMenuController } from "./storyMediaHistory.js";
import { captureStoryRequestPayload, closeStoryRequestDebugPreview, openStoryRequestDebugPreview } from "./storyRequestDebugPreview.js";
import { clearStoryAssetAppearanceReferenceImage, ensureStoryAssetBaseAppearance, getStoryAssetAppearance, getStoryAssetAppearanceReferenceUrls, getStoryAssetAppearances, getStoryAssetBaseAppearance, isStoryAssetBaseAppearance, normalizeStoryAsset, normalizeStoryWorkspaceAssetData, runStoryAssetAppearanceGenerationTasks, setStoryAssetAppearanceReferenceImage, setStoryAssetBaseAppearance, shouldGenerateStoryAssetBaseAppearanceFirst } from "./storyAssetAppearances.js";
import { buildStoryAssetStyleReferenceMentionCandidate, readStoryAssetPromptText, renderStoryAssetPromptMentions, STORY_ASSET_STYLE_REFERENCE_PILL_KIND } from "./storyAssetPromptMentions.js";
import { applyStoryCharacterAssetPromptPreset, applyStorySceneAssetPromptPreset, getStoryCharacterAssetPromptPreset, getStorySceneAssetPromptPreset, STORY_CHARACTER_ASSET_PROMPT_PRESET_NONE_ID, STORY_SCENE_ASSET_PROMPT_PRESET_NONE_ID } from "./storyAssetPromptPresets.js";
import { STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_IDS, getStoryWorkspaceModelChoice, getStoryWorkspaceModelOptions, resolveStoryWorkspaceModelId, resolveStoryVideoInputTextModelId } from "./storyWorkspaceModelCatalog.js";
import { createStoryWorkspaceSnapshot, hasStoryWorkspaceSnapshotChanged, mergeStoryWorkspaceHydratedProjects, parseStoryWorkspaceSnapshotPayload } from "./storyWorkspacePersistence.js";
import { createWorkspacePersistenceCoordinator } from "../workspacePersistenceCoordinator.js";
import { buildStoryBackgroundTaskId, finishStoryBackgroundTask, getStoryBackgroundTasks, isStoryBackgroundTaskActive, startStoryBackgroundTask, updateStoryBackgroundTask, updateStoryBackgroundTaskBatch } from "./storyBackgroundTasks.js";
import { runStoryEpisodeScriptBatchQueue } from "./storyEpisodeScriptBatchQueue.js";
import { cancelStoryEpisodeSplitBatch, finalizeStoryEpisodeSplitBatch, resetStoryEpisodeSplitBatchState, runStoryEpisodeSplitBatchQueue } from "./storyEpisodeSplitBatchExecution.js";
import { createStoryEpisodeScriptWorkspaceController } from "./storyEpisodeScriptApplication.js";
import { createStoryEpisodeOutlineWorkspaceController } from "./storyEpisodeOutlineApplication.js";
import { createStoryEpisodeSplitRunRecorder } from "./storyEpisodeSplitRun.js";
import { runStoryEpisodeSplitQualityReview } from "./storyEpisodeSplitQualityApplication.js";
import { createStorySummaryRunRecorder } from "./storySummaryRun.js";
import { createStoryTaskBatchCancellationRegistry } from "./storyTaskBatchCancellation.js";
import { createStoryAssetPaidRerunChoiceGate, getStoryAssetExperimentalDraftDisplay, getStoryAssetModelChangeRerunKinds, getStoryAssetPaidRerunBlockedBatches, getStoryAssetPaidRerunBlockedLanes, isStoryAssetLocalQualityRevalidationDraft, isStoryAssetPlannedContinuationDraft } from "./storyAssetExtractionDraft.js";
import { runStoryAssetExtractionToCompletion } from "./storyAssetExtractionRunner.js";
import { attachUploadedStoryAssetsToEpisodes } from "./storyScriptImport.js";
import { STORY_STYLE_CUSTOM_ID, resolveStoryStyleSelection } from "./storyStyleCatalog.js";
import { getStoryHomeGenerateButtonLabel, renderStoryHome, renderStoryHomeComposerBody, renderStoryHomeModelBar, renderStoryHomeParamChevron, renderStoryProjectCard, renderStoryProjectSortControl, renderStoryScriptModeControl } from "./storyHomePresentation.js";
import { STORY_HOME_REWRITE_SOURCE_HINT, canStartStoryHomeGeneration, clearStoryHomeReferenceScript, getStoryHomeSummaryTaskCopy, hasStoryHomeReferenceScript, handleStoryHomeDocumentDragLeave, handleStoryHomeDocumentDragOver, handleStoryHomeDocumentDrop, resolveStoryHomeGenerationMode } from "./storyHomeRewrite.js";
import { applyStoryClipDialogueVoiceGuidance, canGenerateStoryEpisodeScript, clearStoryPlanningForRebuild, compileStoryEpisodeScripts, deriveStoryEpisodeAssetSummary, deriveStoryEpisodeStatus, formatStoryClockDuration, getNextStoryEpisodeScriptIndex, getStoryEpisodeScriptBatchTargets, invalidateStoryEpisodeScriptsFrom, insertStoryEpisodeClip, removeStoryEpisodeClip, mergeStoryEpisodePlans, mergeStoryEpisodeSplit, mergeStoryPlanningAssets, normalizeDurationSeconds, syncStoryPlanningVisualStyle } from "./storyPlanningData.js";
import { buildStoryClipInputSlotViewModel, updateStoryClipInput } from "./storyClipInputSlots.js";
import { createStoryClipGenerationController, getRecoverableStoryClipVideoTask } from "./storyClipGeneration.js";
import { storyClipProduction } from "./storyClipProduction.js";
import { findStoryClipCardShell, syncSelectedClipVideoMetadataInPlace, syncStoryClipCardVideoInPlace } from "./storyClipVideoResultDom.js";
import { createStoryClipProductionPresentation } from "./storyClipProductionPresentation.js";
import { createStoryScriptPlanningPresentation } from "./storyScriptPlanningPresentation.js";
import { createStoryAssetSettingsPresentation } from "./storyAssetSettingsPresentation.js";
import { createStoryAssetSettingsProjection, formatStoryAssetOccurrences, getStoryAssetBatchDirectMode, shouldRenderStoryAssetRoleTag } from "./storyAssetSettingsProjection.js";
import { addStoryLibraryAssetsToProject } from "./storyLibraryProjectAssignment.js";
import { createStoryLibraryAssignmentMenuPortal } from "./storyLibraryAppearanceMenuPortal.js";
import { createStoryWorkspaceChromePresentation } from "./storyWorkspaceChromePresentation.js";
import { renderStoryGenerationSpinner, syncStoryAsyncButton } from "./storyAsyncButtonPresentation.js";
import { createStoryWorkspaceChromeProjection, getStoryEpisodeToolbarOptions, getStoryProjectCanvasEpisodes } from "./storyWorkspaceChromeProjection.js";
import { backfillStoryVideoThumbnails } from "./storyVideoThumbnailBackfill.js";
import { createStoryVideoPlayback, createStoryVideoProgressLoop } from "./storyVideoPlayback.js";
import { startVideoFrameSnapshotPersistence } from "../../components/videoFrameCapture.js";
import { captureStoryClipFrameSnapshot } from "./storyClipFrameCapture.js";
import { playAssetCreateFly } from "../assetCreateFly.js";
import a1413_0x5b7bf6 from "../VideoClipController.js";
import { buildStoryClipFrameMentionCandidates, buildStoryClipFrameMentionId, createStoryClipFrameHoverAsset, createStoryClipFrameRecord, createStoryClipVideoRecord, getStoryClipFrameMediaType, normalizeStoryClipFrames, removeStoryClipFrame, resolveStoryClipFrameImageUrl, resolveStoryClipFrameMediaUrl, resolveStoryClipFrameMentionRef, STORY_CLIP_MEDIA_TYPE_VIDEO, upsertStoryClipFrame } from "./storyClipFrames.js";
import { canEnterStoryWorkspaceStep, canReuseStoryStepNavigation, createStoryWorkspaceNavigationTransaction, getStoryEpisodeGenerationControlState, getStoryVideoEpisodes, getStoryWorkspacePageTransitionDirection, getStoryWorkspaceTransitionDirection, normalizeStoryWorkspaceStep } from "./storyWorkspaceNavigationTransaction.js";
import { exportStoryClipVideos } from "./storyClipExport.js";
import { activateStoryPromptDropSelection, applyStoryAssetNativeDragPreview, getStoryPromptDropRange, hasStoryAssetDragData, readStoryAssetDragData, readStoryAssetDragItemIndex, resolveStoryAssetDragPreview, STORY_ASSET_DRAG_PREVIEW_POINTER_GAP, writeStoryAssetDragData } from "./storyAssetDrag.js";
import { bindWorkspaceEntityContextMenu } from "../workspaceEntityContextMenu.js";
import { resolveStoryWorkspaceContextMenuItems as a1413_0x1ea432 } from "./storyWorkspaceContextMenu.js";
import { handleWorkspaceStepShortcut } from "../workspaceStepShortcut.js";
import { t } from "../../i18n/index.js";
import { _insertMentionPill, appendMentionPillToPrompt, bindPromptMentionHost, resolvePromptTextWithTextRefs, sanitizePromptHtmlForCommit } from "../nodePromptShared.js";
import { shouldSkipPromptTriggerForBulkInput } from "../promptTriggerComposition.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { readVideoFileNaturalSize } from "../../components/source-video/sourceVideoUploadMedia.js";
import { STORY_REPLICATION_VIDEO_ACCEPT, applyStoryVideoReplicationAnalysis, applyStoryVideoReplicationUpload, buildStoryVideoReplicationAssetExtractionProject, createStoryVideoReplicationProjectData, failStoryVideoReplicationEpisode, findStoryReplicationEpisode, getStoryReplicationLocale, getStoryVideoReplicationFooterState, getStoryVideoReplicationSummary, invalidateStoryVideoReplicationAssetLocalization, markStoryVideoReplicationAssetLocalizationComplete, mergeStoryReplicationSourceFiles, reorderStoryVideoReplicationEpisodes, resolveStoryVideoReplicationClipVoiceAssetIds, resolveStoryVideoReplicationHomeTab, resolveStoryReplicationUploadedVideo, STORY_VIDEO_REPLICATION_UNIFIED_ASSET_MAX_OUTPUT_TOKENS, shouldUseStoryVideoReplicationUnifiedAssetLocalization, syncStoryVideoReplicationProject, validateStoryReplicationVideoFile } from "./storyVideoReplication.js";
import { renderStoryVideoReplicationPage, syncStoryVideoReplicationCardElement } from "./storyVideoReplicationPresentation.js";
import { createAudioPlaybackSurfaceController } from "../../components/audio-node/audioPlaybackSurface.js";
import { clearDeletedStoryCanvasBindings } from "./storyEpisodeCanvas.js";
import { reconcileStoryCanvasMediaNodes } from "./storyCanvasMediaSync.js";
import { beginStoryClipTimePillEdit, buildStoryClipMentionCandidates, createStoryClipTimeMentionIcon, getStoryAssetIdFromMentionNodeId, getStoryEpisodeCharacterVoiceEnabled, getStoryClipMentionVoiceState, renderStoryClipPromptMentions, resolveStoryClipAssetMentionRef, resolveStoryClipAssetMentionRefs, setStoryEpisodeCharacterVoiceEnabled, setStoryClipMentionVoiceEnabled, syncStoryClipPromptPillHoverTarget, syncStoryClipPromptPillPresentation } from "./storyClipMentions.js";
import { applyStoryClipAdjustmentCandidate, buildStoryClipAdjustmentGenerationKey, clearStoryClipAdjustmentUndo, discardStoryClipAdjustmentCandidate, getStoryClipPromptLockedTokens, restoreStoryClipPromptHistoryEntry, serializeStoryClipPromptElement, setStoryClipAdjustmentCandidate } from "./storyClipAdjustment.js";
import { getStoryPromptModeLabel, isStoryMinimaxH3PromptMode, normalizeStoryPromptMode, resolveStoryPromptModeDefaultVideoModelId, serializeStoryPromptForMode } from "./storyPromptModes.js";
import { STORY_CHARACTER_VOICE_SAMPLE_MAX_CHARACTERS, clearStoryCharacterVoiceReference, createStoryCharacterVoiceEditorDraft, createStoryCharacterVoicePreviewGuard, generateStoryCharacterVoice, getStoryCharacterVoiceWorkflow, hasStoryCharacterVoiceReference, normalizeStoryCharacterVoiceHistory, normalizeStoryCharacterVoiceReference, replaceStoryCharacterVoiceReference, resumeStoryCharacterVoice, restoreStoryCharacterVoiceHistoryReference, selectStoryCharacterVoiceWorkflow } from "./storyCharacterVoice.js";
import { bindStoryOutlineNavigation, jumpToStoryOutlineSection } from "./storyOutlineNavigation.js";
import { createStoryMarqueeSelectionController } from "./storyMarqueeSelection.js";
import { STORY_ASSET_HOVER_CARD_SELECTOR, applyStoryAssetSplitRatioToLayout, applyStoryEpisodePanelRatiosToLayout, beginStoryHorizontalResizeSession, captureStoryAssetListScrollPosition, captureStoryWorkspaceNestedScrollPositions, findStoryAssetForHover, getStoryAssetHoverCard, getStoryAssetHoverCardAppearanceId, getStoryAssetHoverCardId, isStoryGenerateShortcut, normalizeStoryAssetSplitRatio, normalizeStoryEpisodePanelRatios, restoreStoryAssetListScrollPosition, restoreStoryWorkspaceNestedScrollPositions, scrollStoryClipPromptHistoryWithWheel, scrollStoryClipStripWithWheel, shouldPreserveStoryWorkspaceNestedWheel } from "./storyWorkspaceInteractions.js";
import { STORY_CUSTOM_STYLE_MAX_CHARACTERS, STORY_EPISODE_COUNT_MAX, STORY_EPISODE_COUNT_OPTIONS, STORY_HOME_GENERATION_PROMPTS, STORY_IDEA_MAX_CHARACTERS, STORY_SCRIPT_MAX_CHARACTERS, applyGeneratedStoryResult, buildStoryHomeGenerationRequest, buildStorySummaryRegenerationRequest, createGeneratedStoryProjectData, createUploadedStoryProjectData, getNextStoryScriptMode, getStoryScriptModeHint, invalidateStoryPlanningDownstream, markStorySummaryDownstreamStale, normalizeGeneratedStoryContract, normalizeGeneratedStoryContinuityFacts, normalizeStoryAspectRatio, normalizeStoryEpisodeCount, normalizeStoryProjectPlanning, normalizeStorySceneMaxSeconds, normalizeStoryScriptMode, resolveGeneratedProjectTitle, resolveStoryTextProviderProfileId } from "./storyProjectPlanning.js";
import { advanceStoryProjectSession, createStoryProjectTaskToken, isStoryProjectTaskTokenCurrent, isStoryProjectTaskTokenLive, sanitizeStoryTaskResumePayload } from "./storyProjectTaskToken.js";
import { deriveStoryProjectTaskState, getStoryAssetAppearanceGenerationKey, reconcilePersistedStoryProjectTasks, reconcileStoryClipVideoBackgroundTasks } from "./storyProjectTaskState.js";
import { buildStoryAssetBatchCancellationUpdate, buildStoryAssetBatchGenerationPlan, buildStoryAssetGenerationPayload, getStoryAssetGenerationControlState, isStoryAssetAppearanceLoading, isStoryAssetBatchLoading, isStoryAssetCardLoading, isStoryAssetVoiceLoading, normalizeStoryImageGenerationParams, runStoryAssetBatchGenerationPhases, setStoryAssetAppearanceGenerating, setStoryAssetVoiceGenerating, settleStoryAssetBatchLoading } from "./storyAssetGenerationState.js";
import { STORY_ASSET_TAB_LABELS, applyStoryLibraryAdditionUiState, applyStoryProjectUiState, createStoryProjectUiState, duplicateStoryProjectEntry, getStoryProjectHomeEntries, normalizeStoryEpisodeAssetRailTab, normalizeStoryProjectSortOrder, normalizeStoryProjectVoiceEditor, removeStoryProjectEntry } from "./storyProjectSession.js";
import { applyStoryEpisodeVideoModelDefault, applyStoryPromptModeVideoModelDefault, applyStoryAspectRatioToVideoGenerationParams, applyStoryVideoInitialModeDefault, formatStoryClipVideoGenerationDuration, getStoryVideoFixedInputVisibilityKey, initializeStoryEpisodeVideoGenerationDurations, normalizeStoryVideoGenerationParams, reconcileStoryClipVideoGenerationDurationChange, recoverUnavailableStoryVideoModelState, resolveStoryClipVideoGenerationParams, resolveStoryClipVideoGenerationSettings, resolveStoryVideoClipDurationConstraints, resolveStoryVideoProvider, seedStoryAspectRatioInVideoGenerationParams, syncStoryPromptModeForVideoModel } from "./storyVideoGenerationSettings.js";
import { getStoryEpisodeBatchControlState, getStoryEpisodeBatchTargets, getStoryEpisodeCardAction, isStoryAssetExtractionOperation, runStoryEpisodeSplitBatchTasks, setStoryEpisodeSplitRunning } from "./storyPlanningTaskState.js";
export { addStoryLibraryAssetsToProject, applyStoryAspectRatioToVideoGenerationParams, applyStoryProjectUiState, buildStoryAssetBatchGenerationPlan, buildStoryAssetGenerationPayload, createStoryProjectUiState, duplicateStoryProjectEntry, getStoryAssetGenerationControlState, getStoryEpisodeBatchControlState, getStoryEpisodeBatchTargets, getStoryEpisodeCardAction, getStoryProjectHomeEntries, isStoryAssetAppearanceLoading, isStoryAssetBatchLoading, isStoryAssetCardLoading, isStoryAssetVoiceLoading, isStoryAssetExtractionOperation, normalizeStoryEpisodeAssetRailTab, normalizeStoryImageGenerationParams, normalizeStoryProjectSortOrder, normalizeStoryVideoGenerationParams, recoverUnavailableStoryVideoModelState, removeStoryProjectEntry, renderStoryProjectCard, renderStoryProjectSortControl, renderStoryScriptModeControl, resolveStoryEpisodeCardMedia, resolveStoryClipVideoGenerationSettings, resolveStoryVideoClipDurationConstraints, runStoryAssetBatchGenerationPhases, runStoryEpisodeSplitBatchTasks, seedStoryAspectRatioInVideoGenerationParams, setStoryAssetAppearanceGenerating, setStoryAssetVoiceGenerating, setStoryEpisodeSplitRunning, settleStoryAssetBatchLoading };
const STORY_STEPS = Object.freeze([{
  id: 1,
  label: "剧情大纲"
}, {
  id: 2,
  label: "素材设定"
}, {
  id: 3,
  label: "分集视频"
}]);
const STORY_ASSET_TAB_ORDER = Object.freeze(["character", "scene", "prop", "library"]);
function escapeHtml(_0x33eecd) {
  return String(_0x33eecd ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function normalizeText(_0x53cfc9) {
  return String(_0x53cfc9 || "").trim();
}
const STORY_EPISODE_SPLIT_REQUEST_DIAGNOSTIC_PREFIX = "[storyWorkspace][episode-split-request]";
function createStoryEpisodeSplitDeveloperDiagnostics(_0x5963a0) {
  const _0x52f964 = _0x5963a0?.console;
  return {
    info(_0x3e455d, _0x367bfb = {}) {
      _0x52f964?.info?.(_0x3e455d, _0x367bfb);
      if (_0x3e455d !== STORY_EPISODE_SPLIT_REQUEST_DIAGNOSTIC_PREFIX) {
        return null;
      }
      const _0x1da744 = normalizeText(_0x367bfb?.status) || "started";
      return logDeveloperDiagnosticEvent({
        type: "story.episode_split_request.dev",
        level: _0x1da744 === "failed" ? "error" : "info",
        source: "storyWorkspace",
        message: "Experimental episode split API request " + _0x1da744,
        context: _0x367bfb
      }, {
        windowObject: _0x5963a0
      });
    }
  };
}
function createStoryAssetExtractionDeveloperDiagnostics(_0x1040d5) {
  const _0x5c3ea9 = _0x1040d5?.console;
  return {
    info(_0x522b18, _0x3e0706 = {}) {
      _0x5c3ea9?.info?.(_0x522b18, _0x3e0706);
      const _0x27e866 = normalizeText(_0x3e0706?.status) || "started";
      return logDeveloperDiagnosticEvent({
        type: "story.asset_extraction.dev",
        level: _0x27e866 === "failed" || _0x27e866 === "fallback" ? "error" : "info",
        source: "storyWorkspace",
        message: "Experimental asset extraction " + _0x27e866,
        context: {
          label: normalizeText(_0x522b18),
          ..._0x3e0706
        }
      }, {
        windowObject: _0x1040d5
      });
    }
  };
}
export function syncStoryClipFrameCardSaveError(_0x434db6, _0x275e0a = "") {
  if (!_0x434db6) {
    return false;
  }
  const _0x301359 = normalizeText(_0x275e0a);
  _0x434db6.classList?.toggle?.("is-save-error", Boolean(_0x301359));
  if (_0x301359) {
    _0x434db6.setAttribute?.("data-tooltip", _0x301359);
  } else {
    _0x434db6.removeAttribute?.("data-tooltip");
  }
  _0x434db6.removeAttribute?.("data-native-title");
  _0x434db6.removeAttribute?.("data-tooltip-source");
  _0x434db6.removeAttribute?.("title");
  return true;
}
export function toggleStoryAssetSelectAll(_0x2adc19 = [], _0x46dea7 = []) {
  return toggleWorkspaceAssetSelectAll(_0x2adc19, _0x46dea7);
}
export function toggleStoryAssetSelection(_0x4ae090 = [], _0x3256b5 = "", _0x428bbc = false) {
  return toggleWorkspaceAssetSelection(_0x4ae090, _0x3256b5, _0x428bbc);
}
export function updateStoryAssetBatchButtonLabel(_0x288001, _0x711e3b = "") {
  const _0x412204 = _0x288001?.querySelector?.(".story-asset-batch-trigger-label");
  if (!_0x412204) {
    return false;
  }
  _0x412204.textContent = String(_0x711e3b ?? "");
  return true;
}
export function toggleStoryEpisodeSelectAll(_0x72575d = [], _0x3a9f57 = []) {
  return toggleStoryAssetSelectAll(_0x72575d, _0x3a9f57);
}
function toModelSearchText(_0x64d5e4 = {}) {
  return [_0x64d5e4.label, _0x64d5e4.providerLabel, _0x64d5e4.description, _0x64d5e4.modelId].filter(Boolean).join(" ").toLowerCase();
}
function isUsableImageUrl(_0x29d293) {
  return /^(?:https?:|blob:|data:|\/|images\/|assets\/)/i.test(normalizeText(_0x29d293));
}
const storyClipProductionPresentation = createStoryClipProductionPresentation({
  localPathToUrl: localPathToUrl,
  isUsableImageUrl: isUsableImageUrl,
  renderImageOrEmpty: renderImageOrEmpty,
  renderDeleteIcon: renderStoryDeleteIcon,
  renderEpisodeCardActionIcon: renderStoryEpisodeCardActionIcon
});
const {
  resolveEpisodeCardMedia: resolveStoryEpisodeCardMedia
} = storyClipProductionPresentation;
const storyScriptPlanningPresentation = createStoryScriptPlanningPresentation();
const storyAssetSettingsProjection = createStoryAssetSettingsProjection({
  resolveLibraryReference: resolveAssetMentionRef
});
const storyAssetSettingsPresentation = createStoryAssetSettingsPresentation({
  renderAddToLibraryIcon: renderStoryAddToLibraryIcon,
  renderDeleteIcon: renderStoryDeleteIcon,
  renderDownloadButton: renderWorkspaceImageDownloadButton,
  renderHomeParamChevron: renderStoryHomeParamChevron,
  renderImage: renderImageOrEmpty,
  renderImageModelSelector: renderAIGenImageModelSelectorMarkup,
  renderLoadingOverlay: renderStoryAssetLoadingOverlay,
  renderPromptMentions: renderStoryAssetPromptMentions,
  renderSelectionActions: renderWorkspaceAssetSelectionActions,
  renderTabIcon: renderStoryAssetTabIcon,
  renderUploadIcon: renderStoryUploadIcon,
  renderVoiceFooter: buildAudioWorkflowFooterHtml
});
const storyWorkspaceChromeProjection = createStoryWorkspaceChromeProjection({
  steps: STORY_STEPS
});
const storyWorkspaceChromePresentation = createStoryWorkspaceChromePresentation();
export function getStoryAssetHoverGridColumns(_0x56ef71) {
  const _0x282288 = Math.max(1, Math.floor(Number(_0x56ef71) || 1));
  return Math.ceil(Math.sqrt(_0x282288));
}
export function isStoryAssetHoverLandscape(_0x5bca63, _0x577af) {
  return isWorkspaceAssetHoverLandscape(_0x5bca63, _0x577af);
}
export function getGeneratedStoryAssetHoverAppearances(_0x3c5c83 = [], _0x45a396 = "") {
  const _0x5ddd57 = normalizeText(_0x45a396);
  return (Array.isArray(_0x3c5c83) ? _0x3c5c83 : []).filter(_0x2e642c => Boolean(normalizeText(_0x2e642c?.imageUrl)) && (!_0x5ddd57 || normalizeText(_0x2e642c?.id) === _0x5ddd57));
}
export function buildStoryAssetHoverPreviewContent(_0x494085, {
  appearanceId = "",
  selectedAssetId = "",
  selectedAppearanceId = "",
  mediaOnly = false
} = {}) {
  return buildWorkspaceAssetHoverPreviewContent(_0x494085, {
    appearanceId: appearanceId,
    selectedAssetId: selectedAssetId,
    selectedAppearanceId: selectedAppearanceId,
    mediaOnly: mediaOnly,
    getAppearances: getStoryAssetAppearances,
    hasVoiceReference: hasStoryCharacterVoiceReference
  });
}
export function resolveStoryAppearanceWheelDelta(_0x3135fd) {
  const _0x3b4e13 = Number(_0x3135fd?.deltaX || 0);
  const _0x598c18 = Number(_0x3135fd?.deltaY || 0);
  const _0x84496 = Math.abs(_0x598c18) >= Math.abs(_0x3b4e13) ? _0x598c18 : _0x3b4e13;
  const _0x44598b = Number(_0x3135fd?.deltaMode || 0);
  const _0x190663 = _0x44598b === 1 ? 16 : _0x44598b === 2 ? 800 : 1;
  return _0x84496 * _0x190663;
}
export function consumeStoryWheelDirection(_0x56ec5a, _0x1a2b89, {
  threshold = 24,
  lockDuration = 220,
  now = Date.now()
} = {}) {
  return consumeWorkspaceWheelDirection(_0x56ec5a, _0x1a2b89, {
    threshold: threshold,
    lockDuration: lockDuration,
    now: now
  });
}
export function getStoryAssetTabLabel(_0x58b290) {
  return STORY_ASSET_TAB_LABELS[_0x58b290] || STORY_ASSET_TAB_LABELS.character;
}
export function getStoryAssetTabTransitionDirection(_0x13f2ea, _0x35bc21) {
  return resolveWorkspaceTabTransitionDirection(_0x13f2ea, _0x35bc21, STORY_ASSET_TAB_ORDER);
}
export function renderStoryAssetTabIcon(_0x44f2bd) {
  return renderWorkspaceAssetTabIcon(_0x44f2bd);
}
const STORY_ASSET_PACKAGE_CATEGORY = "剧本资产";
export function buildStoryAssetPackageItemRequest({
  project = {},
  asset = {},
  appearance = {},
  image = null
} = {}) {
  const _0x2237a9 = normalizeText(project?.id);
  const _0x1c23ed = normalizeText(asset?.id);
  const _0x117f51 = normalizeText(appearance?.id);
  const _0x317287 = normalizeText(project?.title) || "未命名剧本";
  const _0x46d5d2 = ["scene", "prop"].includes(normalizeText(asset?.kind)) ? normalizeText(asset.kind) : "character";
  const _0x1c726f = getStoryAssetTabLabel(_0x46d5d2);
  const _0x1b06fd = normalizeText(asset?.name) || "未命名" + _0x1c726f;
  const _0x178406 = normalizeText(appearance?.name) || "基础形象";
  const _0x184375 = image && typeof image === "object" ? image : {
    ...(appearance?.generatedImage && typeof appearance.generatedImage === "object" ? appearance.generatedImage : {}),
    imageUrl: normalizeText(appearance?.imageUrl)
  };
  return {
    packageKey: "story-project:" + _0x2237a9,
    packageName: _0x317287,
    category: STORY_ASSET_PACKAGE_CATEGORY,
    itemKey: "story-appearance:" + _0x1c23ed + ":" + _0x117f51,
    itemName: _0x1c726f + "｜" + _0x1b06fd + "｜" + _0x178406,
    image: {
      ..._0x184375,
      imageUrl: normalizeText(_0x184375.imageUrl || _0x184375.displayUrl || _0x184375.url || appearance?.imageUrl)
    },
    metadata: {
      sourceKind: "story-workspace",
      sourceProjectId: _0x2237a9
    },
    itemMetadata: {
      sourceKind: "story-workspace",
      sourceProjectId: _0x2237a9,
      sourceStoryAssetId: _0x1c23ed,
      sourceStoryAppearanceId: _0x117f51,
      sourceStoryAssetKind: _0x46d5d2
    }
  };
}
function renderImageOrEmpty({
  imageUrl = "",
  fallbackImageUrl = "",
  workspaceAssetLibraryImage = false,
  alt = "",
  className = ""
} = {}) {
  if (isUsableImageUrl(imageUrl)) {
    const _0x50e63d = normalizeText(imageUrl);
    const _0x492337 = normalizeText(fallbackImageUrl);
    const _0xfa3f70 = workspaceAssetLibraryImage ? " data-workspace-asset-library-image" + (isUsableImageUrl(_0x492337) && _0x492337 !== _0x50e63d ? " data-workspace-asset-library-fallback-src=\"" + escapeHtml(_0x492337) + "\"" : "") : "";
    return "<img class=\"" + escapeHtml(className) + "\" src=\"" + escapeHtml(_0x50e63d) + "\" alt=\"" + escapeHtml(alt) + "\" loading=\"lazy\" decoding=\"async\"" + _0xfa3f70 + ">";
  }
  return "<div class=\"" + escapeHtml(className) + " story-media-empty\" role=\"img\" aria-label=\"" + escapeHtml(alt + "待生成") + "\">\n    <span>待生成</span>\n  </div>";
}
export { renderStoryGenerationSpinner };
export function renderStoryAssetLoadingOverlay({
  compact = false,
  title = "图片生成中",
  description = "正在等待生成结果，完成后会自动显示。"
} = {}) {
  return renderWorkspaceAssetLoadingOverlay({
    compact: compact,
    title: title,
    description: description
  });
}
function renderModelIcon(_0x1bbd69, _0x51a8fd = "story-model-icon") {
  if (!_0x1bbd69?.icon || !isUsableImageUrl(_0x1bbd69.icon)) {
    return "";
  }
  return "<img class=\"" + escapeHtml(_0x51a8fd) + "\" src=\"" + escapeHtml(_0x1bbd69.icon) + "\" alt=\"\" loading=\"eager\" decoding=\"async\">";
}
function renderModelPicker(_0x47528c, _0x3dc897, _0x60c29) {
  const _0x284fec = _0x47528c.models[_0x3dc897];
  const _0x2735af = getStoryWorkspaceModelChoice(_0x3dc897, _0x284fec);
  const _0x6fce86 = getStoryWorkspaceModelOptions(_0x3dc897);
  const _0x19aeea = new Map();
  _0x6fce86.forEach(_0x1cbabe => {
    if (!_0x19aeea.has(_0x1cbabe.providerLabel)) {
      _0x19aeea.set(_0x1cbabe.providerLabel, []);
    }
    _0x19aeea.get(_0x1cbabe.providerLabel).push(_0x1cbabe);
  });
  const _0x58445c = [..._0x19aeea.entries()].map(([_0x487c39, _0xa6b2d5]) => "<section class=\"story-model-group\">\n        <h4>" + escapeHtml(_0x487c39) + "</h4>\n        " + _0xa6b2d5.map(_0x28bce0 => "<button type=\"button\" class=\"story-model-option " + (_0x28bce0.modelId === _0x2735af?.modelId ? "is-selected" : "") + "\" data-story-model-option=\"" + escapeHtml(_0x28bce0.modelId) + "\" data-story-model-kind=\"" + escapeHtml(_0x3dc897) + "\" data-story-model-search=\"" + escapeHtml(toModelSearchText(_0x28bce0)) + "\" role=\"option\" aria-selected=\"" + (_0x28bce0.modelId === _0x2735af?.modelId) + "\">\n              " + renderModelIcon(_0x28bce0) + "\n              <span class=\"story-model-option-copy\">\n                <strong>" + escapeHtml(_0x28bce0.label) + "</strong>\n                <small>" + escapeHtml(_0x28bce0.description || _0x28bce0.providerLabel) + "</small>\n              </span>\n              " + (_0x28bce0.vip ? "<span class=\"story-model-vip\">VIP</span>" : "") + "\n            </button>").join("") + "\n      </section>").join("");
  return "<div class=\"story-model-picker\" data-story-model-picker=\"" + escapeHtml(_0x60c29) + "\">\n    <button type=\"button\" class=\"story-model-trigger\" data-story-model-trigger aria-haspopup=\"listbox\" aria-expanded=\"false\">\n      " + renderModelIcon(_0x2735af) + "\n      <span class=\"story-model-trigger-copy\">\n        <small>" + (_0x3dc897 === "text" ? "文本模型" : _0x3dc897 === "image" ? "图像模型" : "视频模型") + "</small>\n        <strong>" + escapeHtml(_0x2735af?.label || "选择模型") + "</strong>\n      </span>\n    </button>\n    <div class=\"story-model-popover\" data-story-model-popover role=\"listbox\">\n      <label class=\"story-model-search-wrap\">\n        <span>搜索模型</span>\n        <input type=\"search\" class=\"story-model-search\" data-story-model-search-input placeholder=\"输入模型或厂商名称\" autocomplete=\"off\">\n      </label>\n      <div class=\"story-model-options\">" + _0x58445c + "</div>\n    </div>\n  </div>";
}
export { getStoryEpisodeToolbarOptions, getStoryProjectCanvasEpisodes };
export function renderProjectToolbar(_0x17f981) {
  return storyWorkspaceChromePresentation.renderToolbar(storyWorkspaceChromeProjection.projectToolbar(_0x17f981));
}
export function getStoryScriptWorkflowStage(_0x30107a = {}) {
  const _0x2b47b1 = _0x30107a?.project || {};
  const _0xfc4379 = Array.isArray(_0x30107a?.episodes) ? _0x30107a.episodes : [];
  if (_0x2b47b1.sourceMode === "upload-original") {
    if (compileStoryEpisodeScripts(_0xfc4379).complete) {
      return "scripts-complete";
    } else {
      return "scripts-pending";
    }
  }
  if (_0x2b47b1.summaryStatus === "generating") {
    return "summary-generating";
  }
  if (!normalizeText(_0x2b47b1.summary)) {
    return "summary-pending";
  }
  if (_0x2b47b1.outlineStatus === "generating") {
    return "outline-generating";
  }
  if (_0x2b47b1.outlineStatus === "stale") {
    return "outline-stale";
  }
  if (!_0xfc4379.length) {
    return "summary-ready";
  }
  if (compileStoryEpisodeScripts(_0xfc4379).complete) {
    return "scripts-complete";
  } else {
    return "scripts-pending";
  }
}
export function updateStorySummaryCharacterField(_0x2f2c47 = [], _0x407b66 = -1, _0x2b209d = "", _0x207f17 = "") {
  const _0x30c8cb = Array.isArray(_0x2f2c47) ? _0x2f2c47[_0x407b66] : null;
  const _0xd064ea = new Set(["name", "roleType", "fixedTraits", "visualAppearance", "voiceDescription", "coreTags", "profile", "motivation", "personality", "relationships", "arc"]);
  if (!_0x30c8cb || !_0xd064ea.has(_0x2b209d)) {
    return false;
  }
  if (_0x2b209d === "coreTags") {
    _0x30c8cb.coreTags = String(_0x207f17 || "").split(/[、,，\n]+/).map(_0x37356d => normalizeText(_0x37356d)).filter(Boolean);
  } else {
    _0x30c8cb[_0x2b209d] = String(_0x207f17 || "");
  }
  return true;
}
export function updateStoryEpisodeOutlineField(_0x2c052b = {}, _0xa72fe9 = "", _0xb5948e = "", _0x4ccbe0 = "") {
  if (!["synopsis", "hook"].includes(_0xb5948e) || !Array.isArray(_0x2c052b?.episodes)) {
    return false;
  }
  const _0x4c787f = _0x2c052b.episodes.findIndex(_0x4d1c87 => String(_0x4d1c87?.id || "") === String(_0xa72fe9 || ""));
  if (_0x4c787f < 0) {
    return false;
  }
  if (_0x2c052b.episodes[_0x4c787f]?.script?.fullText) {
    _0x2c052b.episodes = invalidateStoryEpisodeScriptsFrom(_0x2c052b.episodes, _0x4c787f);
  }
  _0x2c052b.episodes[_0x4c787f][_0xb5948e] = String(_0x4ccbe0 ?? "");
  return true;
}
export function isStoryOutlineSectionOpen(_0x27f730 = {}, _0x40f090 = "", _0xcc2c0e = false) {
  const _0x4d877a = _0x27f730?.outlineSectionOpenState;
  if (_0x4d877a && Object.prototype.hasOwnProperty.call(_0x4d877a, _0x40f090)) {
    return _0x4d877a[_0x40f090] === true;
  }
  return Boolean(_0xcc2c0e);
}
function createStoryScriptPlanningEpisodeView(_0x4a079d, _0x141773, _0x13fbad) {
  const _0x1e7894 = Array.isArray(_0x4a079d.data?.episodes) ? _0x4a079d.data.episodes : [];
  const _0x250bc2 = _0x4a079d.data?.project || {};
  const _0x3e39c7 = Math.max(0, Math.trunc(Number(_0x13fbad) || 0));
  const _0x36f4c6 = Math.max(1, Math.trunc(Number(_0x141773?.number) || _0x3e39c7 + 1));
  const _0x1f0642 = _0x141773?.id;
  const _0x22f66c = normalizeText(_0x1f0642);
  const _0x5d82a9 = Boolean(_0x141773?.script?.fullText);
  const _0xc2aaa0 = _0x4a079d.generatingEpisodeScriptId === _0x1f0642;
  const _0x5e4ce5 = Array.isArray(_0x4a079d.selectedScriptEpisodeIds) ? _0x4a079d.selectedScriptEpisodeIds : [];
  const _0x5e299f = normalizeText(_0x4a079d.generatingEpisodeScriptId);
  return {
    id: _0x22f66c,
    index: _0x3e39c7,
    number: _0x36f4c6,
    title: _0x141773?.title || "",
    synopsis: _0x141773?.synopsis || "",
    hook: _0x141773?.hook || "",
    scriptFullText: _0x141773?.script?.fullText || "",
    isComplete: _0x5d82a9,
    isGenerating: _0xc2aaa0,
    isSelected: _0x5e4ce5.includes(_0x1f0642),
    isOpen: _0x5e299f ? _0xc2aaa0 : isStoryOutlineSectionOpen(_0x4a079d, "episode-" + _0x22f66c, _0x3e39c7 < 2),
    canSelect: !_0x5d82a9 && _0x3e39c7 >= getNextStoryEpisodeScriptIndex(_0x1e7894),
    canGenerate: _0x250bc2.sourceMode !== "upload-original" && _0x250bc2.outlineStatus !== "stale" && canGenerateStoryEpisodeScript(_0x1e7894, _0x3e39c7),
    selectionMode: _0x4a079d.scriptSelectionMode === true,
    disabled: Boolean(_0x4a079d.storyPlanningOperation),
    generationMessage: _0x4a079d.episodeScriptGenerationStatus || "正在生成第 " + _0x36f4c6 + " 集完整剧本",
    allowRegeneration: _0x250bc2.sourceMode !== "upload-original" && _0x250bc2.outlineStatus !== "stale",
    regeneration: {
      isConfirming: normalizeText(_0x4a079d.pendingRegenerationTarget) === "episode-script:" + _0x22f66c,
      disabled: Boolean(_0x4a079d.storyPlanningOperation || _0x4a079d.isGeneratingStory)
    }
  };
}
function createStoryScriptPlanningEpisodeSectionView(_0x9d635) {
  const _0x4605d3 = _0x9d635.data?.project || {};
  const _0x2cd15e = Array.isArray(_0x9d635.data?.episodes) ? _0x9d635.data.episodes : [];
  const _0x56e70a = compileStoryEpisodeScripts(_0x2cd15e);
  const _0x569887 = Array.isArray(_0x9d635.selectedScriptEpisodeIds) ? _0x9d635.selectedScriptEpisodeIds : [];
  const _0x28d343 = _0x569887.length ? getStoryEpisodeScriptBatchTargets(_0x2cd15e, _0x569887) : [];
  const _0x4fbdac = _0x9d635.scriptSelectionMode === true;
  return {
    episodes: _0x2cd15e.map((_0x445583, _0x6677ac) => createStoryScriptPlanningEpisodeView(_0x9d635, _0x445583, _0x6677ac)),
    isUploadedOriginal: _0x4605d3.sourceMode === "upload-original",
    isOutlineGenerating: _0x9d635.storyPlanningOperation === "planning-episode-outlines",
    loadingMessage: _0x9d635.storyPlanningStatus || "正在生成所有分集大纲...",
    complete: _0x56e70a.complete,
    selectionMode: _0x4fbdac,
    batchCount: _0x4fbdac ? _0x28d343.length : Math.max(0, _0x56e70a.totalCount - _0x56e70a.completedCount),
    isStale: _0x4605d3.outlineStatus === "stale",
    busy: Boolean(_0x9d635.storyPlanningOperation),
    batchGenerating: _0x9d635.storyPlanningOperation === "writing-episode-scripts",
    batchCancelRequested: _0x9d635.episodeScriptBatchCancelRequested === true
  };
}
export function renderStoryEpisodeOutlineItem(_0x1949e8, _0x17a0c3, _0x41f62d) {
  return storyScriptPlanningPresentation.renderPlanning({
    kind: "episode-item",
    item: createStoryScriptPlanningEpisodeView(_0x1949e8, _0x17a0c3, _0x41f62d)
  });
}
function renderStoryAssetContinuationIcon() {
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8 5.5 18 12 8 18.5Z\"/></svg>";
}
export function renderStoryEpisodeOutlineSection(_0x1b93cb) {
  return storyScriptPlanningPresentation.renderPlanning({
    kind: "episode-section",
    section: createStoryScriptPlanningEpisodeSectionView(_0x1b93cb)
  });
}
export function renderStoryTextRequestDebugAction({
  isDeveloperMode = false,
  action = "",
  title = "只预览下一次请求，不发送 API",
  disabled = false
} = {}) {
  if (!isDeveloperMode || !normalizeText(action)) {
    return "";
  }
  return "<button type=\"button\" class=\"story-secondary-button story-text-request-debug\" data-story-action=\"" + escapeHtml(action) + "\" title=\"" + escapeHtml(title) + "\" " + (disabled ? "disabled" : "") + ">" + DEBUG_WRENCH_ICON_HTML + "<span>调试</span></button>";
}
export function renderStoryScriptGenerationFooter(_0x34997e) {
  const _0x5f4a80 = compileStoryEpisodeScripts(_0x34997e.data.episodes);
  const _0x4a6a94 = Math.max(0, _0x5f4a80.totalCount - _0x5f4a80.completedCount);
  const _0x126966 = getNextStoryEpisodeScriptIndex(_0x34997e.data.episodes);
  const _0x310afd = _0x34997e.data.episodes[_0x126966] || null;
  const _0x17bb86 = Boolean(_0x34997e.storyPlanningOperation);
  const _0x146963 = _0x34997e.storyPlanningOperation === "writing-episode-scripts";
  const _0x195f95 = _0x34997e.storyPlanningOperation === "writing-episode-script";
  const _0x1c0196 = _0x34997e.episodeScriptBatchCancelRequested === true;
  const _0x2d8f43 = _0x34997e.scriptSelectionMode ? getStoryEpisodeScriptBatchTargets(_0x34997e.data.episodes, _0x34997e.selectedScriptEpisodeIds) : [];
  const _0x371a1f = _0x2d8f43.length;
  const _0x318fae = _0x34997e.scriptSelectionMode ? "data-story-action=\"generate-episode-scripts-batch\" data-story-script-batch-scope=\"selected\"" : "data-story-action=\"generate-next-episode-script\"";
  const _0x9ed3a1 = _0x34997e.scriptSelectionMode ? "生成 " + _0x371a1f + " 集" : "生成 1 集";
  const _0x383ccd = _0x17bb86 || (_0x34997e.scriptSelectionMode ? !_0x371a1f : !_0x310afd);
  const _0x485e00 = renderStoryTextRequestDebugAction({
    isDeveloperMode: Boolean(_0x34997e.experimentalSplitAvailable),
    action: "debug-episode-script-request",
    title: "只预览下一集正文的实际请求，不发送 API",
    disabled: _0x17bb86 || !_0x310afd
  });
  const _0x41fe58 = _0x146963 ? "<button type=\"button\" class=\"story-primary-button\" data-story-action=\"cancel-episode-scripts-batch\" aria-label=\"取消尚未开始的分集\" " + (_0x1c0196 ? "disabled" : "") + ">" + (_0x1c0196 ? "已取消排队" : "取消") + "</button>" : "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"generate-episode-scripts-batch\" data-story-script-batch-scope=\"all\" " + (_0x17bb86 || !_0x4a6a94 ? "disabled" : "") + ">生成全集</button>\n       <button type=\"button\" class=\"story-primary-button\" " + _0x318fae + " " + (_0x383ccd ? "disabled" : "") + " aria-busy=\"" + _0x195f95 + "\">" + (_0x195f95 ? renderStoryGenerationSpinner({
    button: true
  }) : "") + escapeHtml(_0x195f95 ? _0x34997e.storyPlanningStatus || "正在生成分集正文" : _0x9ed3a1) + "</button>";
  return renderPageFooter(_0x34997e, {
    title: "分集大纲生成完成后，将按顺序生成剧本正文",
    hint: _0x34997e.episodeScriptGenerationStatus || "已完成 " + _0x5f4a80.completedCount + "/" + _0x5f4a80.totalCount + " 集",
    actionsMarkup: "\n      " + _0x485e00 + "\n      " + _0x41fe58 + "\n      <button type=\"button\" class=\"story-secondary-button story-script-continue-button\" data-story-action=\"continue-to-assets\" aria-label=\"进入下一步：人设与素材拆解\" " + (_0x17bb86 ? "disabled" : "") + ">" + renderStoryAssetContinuationIcon() + "</button>"
  });
}
export { getStoryAssetExperimentalDraftDisplay, isStoryAssetLocalQualityRevalidationDraft };
export function renderStoryAssetExtractionFooter(_0x1db143 = {}) {
  const _0x3c67b3 = Boolean(_0x1db143.storyPlanningOperation);
  const _0x4e7543 = _0x1db143.storyPlanningOperation === "extracting-assets-experimental";
  const _0x5327bb = _0x1db143.storyPlanningStatus || "正在提取角色、场景与道具";
  const _0x3de619 = getStoryAssetExperimentalDraftDisplay(_0x1db143.data?.assetExtractionDraft);
  const _0xd39e8f = getStoryAssetExperimentalDraftDisplay(_0x1db143.data?.experimentalAssetExtractionDraft);
  const _0x548936 = _0x1db143.storyPlanningOperation === "extracting-assets-experimental" ? "混合提取中" : _0xd39e8f.hasProgress ? _0xd39e8f.actionLabel : "开发测试";
  const _0x29cf7d = _0xd39e8f.hasProgress ? _0xd39e8f.summary : "开发测试 V1：先由本地 PP-UIE 建立候选清单；中短剧本仍把完整原文交给角色、场景、道具三条专用 API，超长剧本只提交受预算约束的剧情证据。每类最多一次且不自动重试；失败不会写入本地兜底提示词，也不会覆盖现有素材";
  const _0x2ad4a0 = _0xd39e8f.hasProgress ? "" : " title=\"" + escapeHtml(_0x29cf7d) + "\"";
  const _0x51295f = _0x3c67b3 ? _0x5327bb : _0x3de619.hasProgress ? _0x3de619.actionLabel : "下一步：提取角色、场景与道具";
  const _0x343468 = !_0x3c67b3 && _0x3de619.needsModelChange ? "<div class=\"story-asset-recovery-model-picker\">\n        <span>切换文本模型</span>\n        " + renderAIGenTextModelSelectorMarkup({
    modelId: _0x1db143.models?.text,
    provider: _0x1db143.textProvider,
    providerProfileId: _0x1db143.textProviderProfileId,
    includeRunningHubInternational: true,
    getDisplayModelName: getDisplayModelName,
    className: "story-asset-recovery-text-model-selector"
  }) + "\n      </div>" : "";
  const _0x3ba127 = _0x1db143.experimentalAssetExtractionAvailable ? "<button type=\"button\" class=\"story-secondary-button story-experimental-asset-extraction\" data-story-action=\"extract-assets-experimental\"" + _0x2ad4a0 + " " + (_0x3c67b3 ? "disabled" : "") + " aria-busy=\"" + _0x4e7543 + "\">" + (_0x4e7543 ? renderStoryGenerationSpinner({
    button: true
  }) : "") + escapeHtml(_0x548936) + "</button>" : "";
  const _0x446e66 = renderStoryTextRequestDebugAction({
    isDeveloperMode: Boolean(_0x1db143.experimentalAssetExtractionAvailable),
    action: "debug-asset-extraction-experimental-request",
    title: "只预览首批本地素材抽取输入，不运行模型",
    disabled: _0x3c67b3
  });
  return renderPageFooter(_0x1db143, {
    nextLabel: "下一步：提取角色、场景与道具",
    nextAction: "extract-assets",
    title: _0x3de619.hasProgress ? "素材提取进度" : "",
    hint: _0x3de619.summary || _0xd39e8f.summary,
    actionsMarkup: "\n      " + _0x446e66 + "\n      " + _0x3ba127 + "\n      " + _0x343468 + "\n      <button type=\"button\" class=\"story-next-button\" data-story-action=\"extract-assets\" " + (_0x3c67b3 ? "disabled" : "") + " aria-busy=\"" + _0x3c67b3 + "\">" + (_0x3c67b3 ? renderStoryGenerationSpinner({
      button: true
    }) : "") + "<span>" + escapeHtml(_0x51295f) + "</span>" + (_0x3c67b3 ? "" : "<span class=\"story-next-arrow\" aria-hidden=\"true\">→</span>") + "</button>"
  });
}
export function renderStoryEpisodeOutlinePlanningFooter(_0x2c0146 = {}, {
  stale = false
} = {}) {
  const _0x41b53f = Boolean(_0x2c0146.storyPlanningOperation);
  const _0x57738c = stale ? "重新运行" : "生成分集大纲";
  const _0x534597 = renderStoryTextRequestDebugAction({
    isDeveloperMode: Boolean(_0x2c0146.experimentalSplitAvailable),
    action: "debug-episode-outline-request",
    title: "只预览生成分集大纲的实际请求，不发送 API",
    disabled: _0x41b53f
  });
  const _0x29b977 = _0x41b53f ? _0x2c0146.storyPlanningStatus || "正在生成分集大纲" : _0x57738c;
  return renderPageFooter(_0x2c0146, {
    nextLabel: _0x57738c,
    nextAction: "plan-episode-outlines",
    title: stale ? "故事蓝图已修改" : "",
    hint: stale ? "现有分集内容仍然保留；重新运行后将按当前蓝图更新" : "",
    actionsMarkup: "\n      " + _0x534597 + "\n      <button type=\"button\" class=\"story-next-button\" data-story-action=\"plan-episode-outlines\" " + (_0x41b53f ? "disabled" : "") + " aria-busy=\"" + _0x41b53f + "\">" + (_0x41b53f ? renderStoryGenerationSpinner({
      button: true
    }) : "") + "<span>" + escapeHtml(_0x29b977) + "</span>" + (_0x41b53f ? "" : "<span class=\"story-next-arrow\" aria-hidden=\"true\">→</span>") + "</button>"
  });
}
function createStoryScriptPlanningPageView(_0x51414e, _0x41e892 = "") {
  const _0x3c15e8 = _0x51414e.data?.project || {};
  const _0x5d467b = Array.isArray(_0x51414e.data?.episodes) ? _0x51414e.data.episodes : [];
  const _0x18db0d = _0x3c15e8.sourceMode === "upload-original";
  const _0x1ee3f3 = _0x3c15e8.sourceMode === "upload-rewrite";
  const _0x366531 = _0x51414e.storyPlanningOperation === "planning-episode-outlines";
  const _0x5ef1c2 = Boolean(_0x366531 || _0x51414e.scriptGenerationFocusMode && _0x5d467b.length);
  const _0x467af7 = !_0x5ef1c2 && isStoryOutlineSectionOpen(_0x51414e, "original", true);
  const _0x169a6d = !_0x5ef1c2 && isStoryOutlineSectionOpen(_0x51414e, "summary", true);
  const _0x15fc27 = _0x5ef1c2 || isStoryOutlineSectionOpen(_0x51414e, "episodes", true);
  const _0x405d41 = Boolean(_0x51414e.storyPlanningOperation || _0x51414e.isGeneratingStory);
  return {
    isUploadedOriginal: _0x18db0d,
    isUploadedRewrite: _0x1ee3f3,
    originalCreative: _0x3c15e8.originalCreative || _0x3c15e8.sourceDocument?.text || "",
    rewriteInstruction: _0x3c15e8.rewriteInstruction || "",
    originalOpen: _0x467af7,
    summaryOpen: _0x169a6d,
    episodesOpen: _0x15fc27,
    summary: {
      status: _0x3c15e8.summaryStatus,
      loadingMessage: _0x51414e.generationStatus || "正在根据原始创意生成剧本摘要...",
      isStale: _0x3c15e8.outlineStatus === "stale",
      episodeCount: normalizeStoryEpisodeCount(_0x3c15e8.planning?.episodeCount),
      storyType: _0x3c15e8.storyType,
      targetAudience: _0x3c15e8.targetAudience,
      logline: _0x3c15e8.logline,
      coreHook: _0x3c15e8.coreHook,
      synopsis: _0x3c15e8.summary,
      background: _0x3c15e8.background,
      setting: _0x3c15e8.setting,
      contract: _0x3c15e8.storyContract,
      plotBeats: _0x3c15e8.plotBeats,
      continuityFacts: _0x3c15e8.continuityFacts,
      characters: _0x3c15e8.characters || []
    },
    summaryRegeneration: {
      isConfirming: normalizeText(_0x51414e.pendingRegenerationTarget) === "summary",
      disabled: _0x405d41
    },
    outlineRegeneration: {
      isConfirming: normalizeText(_0x51414e.pendingRegenerationTarget) === "episode-outlines",
      disabled: _0x405d41
    },
    outlineStatus: _0x3c15e8.outlineStatus,
    episodeSection: createStoryScriptPlanningEpisodeSectionView(_0x51414e),
    footerMarkup: _0x41e892
  };
}
export function renderOutlinePage(_0x3d1a4a) {
  const _0x29c160 = _0x3d1a4a.data?.project || {};
  const _0x24de89 = getStoryScriptWorkflowStage(_0x3d1a4a.data);
  const _0x15f0cd = _0x29c160.sourceMode === "upload-original";
  const _0x3956ff = _0x3d1a4a.storyPlanningOperation === "planning-episode-outlines";
  const _0xc31756 = _0x3956ff ? renderStoryEpisodeOutlinePlanningFooter(_0x3d1a4a, {
    stale: _0x29c160.outlineStatus === "stale"
  }) : _0x24de89 === "scripts-pending" ? _0x15f0cd ? renderStoryAssetExtractionFooter(_0x3d1a4a) : renderStoryScriptGenerationFooter(_0x3d1a4a) : _0x24de89 === "summary-ready" ? renderStoryEpisodeOutlinePlanningFooter(_0x3d1a4a) : _0x24de89 === "outline-stale" ? renderStoryEpisodeOutlinePlanningFooter(_0x3d1a4a, {
    stale: true
  }) : _0x24de89 === "scripts-complete" ? renderStoryAssetExtractionFooter(_0x3d1a4a) : "";
  return storyScriptPlanningPresentation.renderPlanning({
    kind: "page",
    page: createStoryScriptPlanningPageView(_0x3d1a4a, _0xc31756)
  });
}
export function getStoryAssetBreakdownEpisodes(_0x3213be = {}) {
  const _0x4ffbcd = Array.isArray(_0x3213be.assetBreakdownEpisodes) && _0x3213be.assetBreakdownEpisodes.length ? _0x3213be.assetBreakdownEpisodes : _0x3213be.data?.episodes;
  return (Array.isArray(_0x4ffbcd) ? _0x4ffbcd : []).map((_0x819966, _0x288d98) => ({
    id: normalizeText(_0x819966?.id) || "episode-" + (_0x288d98 + 1),
    number: Math.max(1, Math.trunc(Number(_0x819966?.number) || _0x288d98 + 1)),
    synopsis: normalizeText(_0x819966?.synopsis || _0x819966?.script?.fullText)
  }));
}
export function renderStoryAssetBreakdownPage(_0x284675 = {}) {
  const _0x2d19f5 = getStoryAssetBreakdownEpisodes(_0x284675);
  const _0x613848 = Math.trunc(Number(_0x284675.assetBreakdownVisibleCount) || 0);
  const _0x6b5fb3 = Math.min(_0x2d19f5.length, Math.max(_0x2d19f5.length ? 1 : 0, _0x613848));
  const _0x59bdc4 = _0x2d19f5.slice(0, _0x6b5fb3);
  return storyScriptPlanningPresentation.renderAssetBreakdown({
    episodes: _0x59bdc4
  });
}
function renderStoryChapter(_0x3a513a, _0x926f44) {
  return "<article class=\"story-chapter-card\" data-story-chapter-index=\"" + _0x926f44 + "\">\n    <label class=\"story-chapter-title\"><span>第 " + (_0x926f44 + 1) + " 章</span><input type=\"text\" value=\"" + escapeHtml(_0x3a513a.title || "") + "\" data-story-chapter-title=\"" + _0x926f44 + "\"></label>\n    <label class=\"story-chapter-content\"><span>章节正文</span><textarea data-story-chapter-content=\"" + _0x926f44 + "\">" + escapeHtml(_0x3a513a.content || "") + "</textarea></label>\n  </article>";
}
function getVisibleStoryAssets(_0xb0011a) {
  if (_0xb0011a.assetFilter === "library") {
    return buildWorkspaceAssetLibraryItems();
  }
  return _0xb0011a.data.assets.filter(_0x41a70d => _0x41a70d.kind === _0xb0011a.assetFilter);
}
function isStoryLibraryImageAsset(_0x1cca77 = {}) {
  return normalizeText(_0x1cca77?.mediaKind).toLowerCase() === "image" && Boolean(normalizeText(_0x1cca77?.sourceUrl || _0x1cca77?.imageUrl));
}
function getStoryLibraryActionAssetIds(_0x1d2448 = {}, _0x4e0018 = []) {
  const _0x11bd93 = new Set((Array.isArray(_0x4e0018) ? _0x4e0018 : []).filter(isStoryLibraryImageAsset).map(_0x52518c => normalizeText(_0x52518c?.id)).filter(Boolean));
  if (_0x1d2448.assetSelectionMode) {
    return (Array.isArray(_0x1d2448.selectedAssetIds) ? _0x1d2448.selectedAssetIds : []).map(normalizeText).filter(_0x3e86d7 => _0x11bd93.has(_0x3e86d7));
  }
  const _0x1de485 = normalizeText(_0x1d2448.selectedAssetId);
  if (_0x11bd93.has(_0x1de485)) {
    return [_0x1de485];
  } else {
    return [];
  }
}
function getSelectedStoryAsset(_0x49273f, _0x12e8ef) {
  return _0x12e8ef.find(_0x5b910b => _0x5b910b.id === _0x49273f.selectedAssetId) || _0x12e8ef[0] || null;
}
function getSelectedAssetAppearanceIndex(_0x84edfa, _0x2b1873) {
  const _0xea8d72 = Number(_0x84edfa.assetAppearanceIndexes?.[_0x2b1873?.id]);
  const _0x51a74b = Math.max(0, getStoryAssetAppearances(_0x2b1873).length - 1);
  return Math.max(0, Math.min(_0x51a74b, Number.isFinite(_0xea8d72) ? Math.trunc(_0xea8d72) : 0));
}
function getSelectedAssetAppearance(_0x37bf33, _0x4b796f) {
  if (_0x4b796f?.isLibraryAsset) {
    return _0x4b796f;
  } else {
    return getStoryAssetAppearance(_0x4b796f, getSelectedAssetAppearanceIndex(_0x37bf33, _0x4b796f));
  }
}
function getStoryAssetAppearanceActionKey(_0x2b948f = {}, _0x80c1ff = {}) {
  const _0x144c0c = normalizeText(_0x2b948f?.id);
  const _0x3d527c = normalizeText(_0x80c1ff?.id);
  if (_0x144c0c && _0x3d527c) {
    return _0x144c0c + ":" + _0x3d527c;
  } else {
    return "";
  }
}
function isStoryAddedAssetAppearance(_0x18446b = {}) {
  return normalizeText(_0x18446b?.sourceOrigin) === "library";
}
export function removeStoryAddedAssetAppearance(_0xcf2164 = {}, _0x32b245 = "") {
  const _0x497ffc = getStoryAssetAppearances(_0xcf2164);
  const _0x517323 = normalizeText(_0x32b245);
  const _0x24d042 = _0x497ffc.findIndex(_0x413594 => normalizeText(_0x413594?.id) === _0x517323);
  const _0x438101 = _0x497ffc[_0x24d042] || null;
  if (_0x497ffc.length <= 1 || _0x24d042 < 0 || !isStoryAddedAssetAppearance(_0x438101)) {
    return {
      removed: false,
      removedAppearance: null,
      removedIndex: -1,
      nextIndex: Math.max(0, Math.min(_0x497ffc.length - 1, _0x24d042))
    };
  }
  _0xcf2164.appearances = _0x497ffc.filter((_0x99aed6, _0x525aaf) => _0x525aaf !== _0x24d042);
  if (normalizeText(_0xcf2164.baseAppearanceId) === _0x517323) {
    _0xcf2164.baseAppearanceId = "";
    ensureStoryAssetBaseAppearance(_0xcf2164);
  }
  return {
    removed: true,
    removedAppearance: _0x438101,
    removedIndex: _0x24d042,
    nextIndex: Math.max(0, Math.min(_0xcf2164.appearances.length - 1, _0x24d042))
  };
}
const STORY_VISUAL_ASSET_KINDS = ["character", "scene", "prop"];
export function getMissingStoryAssetImages(_0x4bfb52 = []) {
  return (Array.isArray(_0x4bfb52) ? _0x4bfb52 : []).flatMap(_0x5b112c => {
    const _0x1fca75 = normalizeText(_0x5b112c?.kind);
    if (!STORY_VISUAL_ASSET_KINDS.includes(_0x1fca75)) {
      return [];
    }
    const _0x399f26 = getStoryAssetAppearances(_0x5b112c);
    const _0x5962ca = _0x399f26.length ? _0x399f26 : [_0x5b112c];
    return _0x5962ca.filter(_0x1f94f6 => !normalizeText(_0x1f94f6?.imageUrl)).map(_0x5abc75 => ({
      kind: _0x1fca75,
      assetId: normalizeText(_0x5b112c?.id),
      assetName: normalizeText(_0x5b112c?.name),
      appearanceId: normalizeText(_0x5abc75?.id),
      appearanceName: normalizeText(_0x5abc75?.name)
    }));
  });
}
export function buildMissingStoryAssetImageWarning(_0x5d07fa = []) {
  const _0x47ee05 = {
    character: "角色",
    scene: "场景",
    prop: "道具"
  };
  const _0x40543e = STORY_VISUAL_ASSET_KINDS.map(_0x536d88 => {
    const _0x4cc52e = (Array.isArray(_0x5d07fa) ? _0x5d07fa : []).filter(_0x47a414 => _0x47a414?.kind === _0x536d88).length;
    if (_0x4cc52e) {
      return _0x47ee05[_0x536d88] + " " + _0x4cc52e + " 张";
    } else {
      return "";
    }
  }).filter(Boolean);
  if (!_0x40543e.length) {
    return "";
  }
  return "检测到缺少图片：" + _0x40543e.join("、") + "。跳过后，这些素材不会作为分镜视频的图片参考。是否跳过并继续？";
}
export { formatStoryAssetOccurrences, getStoryAssetBatchDirectMode, shouldRenderStoryAssetRoleTag };
export function renderStoryAssetCard(_0x220e9d, _0xb9316c, {
  previewAppearance = null,
  statusText = "",
  cardStatusHtml = "",
  draggable = false,
  cardClassName = "",
  cardAttributes = "",
  shellClassName = "",
  accessoryHtml = "",
  cardMetaHtml = "",
  cardMediaHtml = "",
  fallbackImageUrl = "",
  workspaceAssetLibraryImage = false
} = {}) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "card",
    card: storyAssetSettingsProjection.projectAssetCard(_0x220e9d, _0xb9316c, {
      previewAppearance: previewAppearance,
      statusText: statusText,
      cardStatusHtml: cardStatusHtml,
      draggable: draggable,
      cardClassName: cardClassName,
      cardAttributes: cardAttributes,
      shellClassName: shellClassName,
      accessoryHtml: accessoryHtml,
      cardMetaHtml: cardMetaHtml,
      cardMediaHtml: cardMediaHtml,
      fallbackImageUrl: fallbackImageUrl,
      workspaceAssetLibraryImage: workspaceAssetLibraryImage
    })
  });
}
function renderStoryAppearanceArrow(_0x3553a4) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "appearance-arrow",
    direction: _0x3553a4
  });
}
export function renderStoryAssetReferenceInput(_0x34842d = {}, {
  disabled = false
} = {}) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "reference-input",
    reference: {
      referenceImageUrl: _0x34842d.referenceImageUrl,
      disabled: disabled
    }
  });
}
export function renderStoryPreviewArrow(_0x563983, {
  action = "",
  label = "",
  className = ""
} = {}) {
  return renderWorkspacePreviewArrow(_0x563983, {
    action: action,
    label: label,
    className: className,
    actionAttributes: {
      "data-story-action": action
    }
  });
}
function renderStoryClipNavigationArrow(_0x3114ab) {
  return renderStoryPreviewArrow(_0x3114ab, {
    action: _0x3114ab === "previous" ? "previous-clip" : "next-clip",
    label: _0x3114ab === "previous" ? "上一幕" : "下一幕",
    className: "story-clip-navigation-arrow"
  });
}
const STORY_CHARACTER_VOICE_UPLOAD_EXTENSIONS = new Set(["mp3", "wav", "m4a"]);
const STORY_CHARACTER_VOICE_UPLOAD_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"]);
function isSupportedStoryCharacterVoiceFile(_0x30c4a0) {
  const _0x472b8c = normalizeText(_0x30c4a0?.name).toLowerCase();
  const _0x32ce90 = _0x472b8c.includes(".") ? _0x472b8c.split(".").pop() : "";
  const _0x2225d5 = normalizeText(_0x30c4a0?.type).toLowerCase();
  return STORY_CHARACTER_VOICE_UPLOAD_EXTENSIONS.has(_0x32ce90) || STORY_CHARACTER_VOICE_UPLOAD_MIME_TYPES.has(_0x2225d5);
}
export function renderStoryAssetBatchGenerationControl(_0x5608d9 = {}) {
  return storyAssetSettingsPresentation.renderAssetControls({
    kind: "batch-generation",
    control: storyAssetSettingsProjection.projectAssetControl("batch-generation", {
      state: _0x5608d9
    })
  });
}
export function renderStoryAssetPromptGenerationControl(_0x2d3096 = {}, _0x5dd0fa = {}) {
  return storyAssetSettingsPresentation.renderAssetControls({
    kind: "prompt-generation",
    control: storyAssetSettingsProjection.projectAssetControl("prompt-generation", {
      state: _0x2d3096,
      generationControl: _0x5dd0fa
    })
  });
}
export function renderStoryLibraryAddToProjectControl({
  selectedCount = 0,
  projectAssets = [],
  showCount = true
} = {}) {
  const _0x324c92 = storyAssetSettingsProjection.projectAssetControl("library-selection", {
    selectionMode: showCount,
    selectedCount: selectedCount,
    projectAssets: projectAssets,
    getTabLabel: getStoryAssetTabLabel
  });
  return storyAssetSettingsPresentation.renderAssetControls({
    kind: "library-add",
    control: {
      ..._0x324c92,
      showCount: showCount
    }
  });
}
export function renderStoryLibrarySelectionActions({
  selectionMode = false,
  selectedCount = 0,
  allSelected = false,
  projectAssets = []
} = {}) {
  return storyAssetSettingsPresentation.renderAssetControls({
    kind: "library-selection",
    control: storyAssetSettingsProjection.projectAssetControl("library-selection", {
      selectionMode: selectionMode,
      selectedCount: selectedCount,
      allSelected: allSelected,
      projectAssets: projectAssets,
      getTabLabel: getStoryAssetTabLabel
    })
  });
}
export function syncStoryCharacterVoiceCapsuleState(_0xe3b8d4, _0x519fc1 = {}) {
  if (typeof _0xe3b8d4?.classList?.toggle !== "function") {
    return false;
  }
  const _0x232cfd = hasStoryCharacterVoiceReference(_0x519fc1);
  _0xe3b8d4.classList.toggle("has-reference", _0x232cfd);
  _0xe3b8d4.classList.toggle("is-missing", !_0x232cfd);
  return true;
}
function renderStoryVoiceIcon(_0x135c12 = false) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "voice-icon",
    hasVoice: _0x135c12
  });
}
function renderStoryCharacterVoicePlayer(_0x20233f) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "voice-player",
    voicePlayer: storyAssetSettingsProjection.projectAssetControl("voice-player", {
      asset: _0x20233f
    })
  });
}
export function syncStoryCharacterVoicePlayerState(_0x2431fd, _0x39fba1 = {}) {
  const _0x4598c1 = _0x2431fd?.querySelector?.(".story-asset-caption-title");
  if (!_0x4598c1) {
    return false;
  }
  _0x4598c1.querySelector?.("[data-story-character-voice-player]")?.remove?.();
  const _0x5b9213 = renderStoryCharacterVoicePlayer(_0x39fba1);
  if (_0x5b9213) {
    _0x4598c1.insertAdjacentHTML("beforeend", _0x5b9213);
  }
  return true;
}
export function syncStoryCharacterVoicePlayerPreviewUi(_0x501e39, {
  audioEl = null,
  assetId = ""
} = {}) {
  const _0x4332be = Number(audioEl?.duration);
  const _0x2cdf21 = Number(audioEl?.currentTime);
  const _0x4f84c0 = Number.isFinite(_0x4332be) && _0x4332be > 0 ? Math.max(0, Math.min(1, _0x2cdf21 / _0x4332be)) : 0;
  const _0x580782 = Boolean(audioEl && audioEl.paused === false && audioEl.ended !== true);
  _0x501e39?.querySelectorAll?.("[data-story-character-voice-player]")?.forEach?.(_0x39bdb9 => {
    const _0x2be804 = _0x39bdb9.dataset.storyCharacterVoicePlayer === assetId;
    const _0x2a3f56 = _0x39bdb9.querySelector("[data-story-action='play-character-voice']");
    const _0x5671dd = _0x39bdb9.querySelector("[data-story-character-voice-waveform]");
    _0x39bdb9.classList.toggle("is-active", _0x2be804);
    _0x39bdb9.classList.toggle("is-playing", _0x2be804 && _0x580782);
    if (_0x2a3f56) {
      _0x2a3f56.setAttribute("aria-label", _0x2be804 && _0x580782 ? "暂停声音参考" : "播放声音参考");
    }
    if (_0x5671dd) {
      _0x5671dd.hidden = !_0x2be804;
      const _0x4b6fd5 = _0x5671dd.querySelectorAll("i");
      _0x4b6fd5.forEach((_0x4b0fb8, _0x3f1987) => {
        _0x4b0fb8.classList.toggle("is-played", _0x2be804 && _0x4f84c0 >= (_0x3f1987 + 1) / _0x4b6fd5.length);
      });
    }
  });
}
function renderStoryAssetPreviewActions({
  state = {},
  asset = {},
  appearance = {},
  generationControl = {},
  readOnly = false
} = {}) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "preview-actions",
    actions: storyAssetSettingsProjection.projectAssetControl("preview-actions", {
      state: state,
      asset: asset,
      appearance: appearance,
      generationControl: generationControl,
      readOnly: readOnly
    })
  });
}
export function renderStoryAssetDetail(_0x556cda, _0xc3dfd, {
  showEmptyDescription = true,
  readOnly = false
} = {}) {
  return storyAssetSettingsPresentation.renderAssetSurface({
    kind: "detail",
    detail: storyAssetSettingsProjection.projectAssetDetail(_0x556cda, _0xc3dfd, {
      showEmptyDescription: showEmptyDescription,
      readOnly: readOnly
    })
  });
}
function renderAssetsPage(_0x4178ae) {
  const _0x4dc755 = getVisibleStoryAssets(_0x4178ae);
  const _0x593e7a = _0x4178ae.assetFilter === "library" ? _0x4dc755.filter(isStoryLibraryImageAsset) : _0x4dc755;
  const _0x59f992 = _0x593e7a.length > 0 && _0x593e7a.every(_0x10fe94 => _0x4178ae.selectedAssetIds.includes(_0x10fe94.id));
  const _0x4a5f2e = getSelectedStoryAsset(_0x4178ae, _0x4dc755);
  if (_0x4a5f2e && _0x4178ae.selectedAssetId !== _0x4a5f2e.id) {
    _0x4178ae.selectedAssetId = _0x4a5f2e.id;
  }
  const _0x57f4ab = _0x4178ae.assetFilter === "library" ? getStoryLibraryActionAssetIds(_0x4178ae, _0x4dc755) : [];
  const _0x3bf415 = _0x4178ae.data.assets.filter(_0x4e9fef => _0x4e9fef.kind === "character").length;
  const _0x1623d6 = _0x4178ae.data.assets.filter(_0x11f004 => _0x11f004.kind === "scene").length;
  const _0x290eb0 = _0x4178ae.data.assets.filter(_0x32b17f => _0x32b17f.kind === "prop").length;
  const _0x168fea = buildWorkspaceAssetLibraryItems().length;
  const _0x5e42d9 = _0x628719 => renderStoryAssetCard(_0x4178ae, _0x628719, {
    previewAppearance: _0x4178ae.assetFilter === "library" ? {
      ..._0x628719,
      imageUrl: _0x628719.thumbnailUrl || _0x628719.imageUrl
    } : null,
    fallbackImageUrl: _0x4178ae.assetFilter === "library" ? _0x628719.sourceUrl : "",
    workspaceAssetLibraryImage: _0x4178ae.assetFilter === "library"
  });
  const _0x3ed1c2 = _0x4178ae.assetFilter === "library" ? (_0x4178ae.assetLibraryDisclosure || createWorkspaceAssetLibraryDisclosure()).render({
    assets: _0x4dc755,
    renderAsset: _0x5e42d9
  }) : _0x4dc755.map(_0x5e42d9).join("");
  return a1413_0x3dc129({
    activeTab: _0x4178ae.assetFilter,
    tabCount: 4,
    tabsHtml: [["character", _0x3bf415], ["scene", _0x1623d6], ["prop", _0x290eb0], ["library", _0x168fea]].map(([_0x2fcd99, _0x3d73ad]) => "<button type=\"button\" class=\"" + (_0x4178ae.assetFilter === _0x2fcd99 ? "is-active" : "") + "\" data-story-asset-filter=\"" + _0x2fcd99 + "\" role=\"tab\" aria-selected=\"" + (_0x4178ae.assetFilter === _0x2fcd99) + "\" tabindex=\"" + (_0x4178ae.assetFilter === _0x2fcd99 ? "0" : "-1") + "\">" + renderStoryAssetTabIcon(_0x2fcd99) + "<span class=\"story-asset-tab-label\">" + getStoryAssetTabLabel(_0x2fcd99) + "</span><span class=\"story-asset-tab-count\">" + _0x3d73ad + "</span></button>").join(""),
    calloutTitle: _0x4178ae.assetFilter === "character" ? "生成或导入角色形象" : _0x4178ae.assetFilter === "scene" ? "生成或导入场景设定" : _0x4178ae.assetFilter === "prop" ? "生成或导入道具设定" : "从总素材加入项目",
    calloutDescription: _0x4178ae.assetFilter === "library" ? _0x4178ae.assetSelectionMode ? _0x4178ae.selectedAssetIds.length ? "已选择 " + _0x4178ae.selectedAssetIds.length + " 张图片" : "点击图片进行多选，或拖动鼠标框选。" : "单击图片可直接加入项目；需要多张时可使用框选多选。" : _0x4178ae.assetSelectionMode ? "已选择 " + _0x4178ae.selectedAssetIds.length + " 项" : _0x4178ae.assetFilter === "character" ? "多形象角色会先确定基础形象，再以其作为参考生成其他形象。" : "每项素材保留一张可复用的设定图。",
    calloutActionsHtml: _0x4178ae.assetFilter === "library" ? renderStoryLibrarySelectionActions({
      selectionMode: _0x4178ae.assetSelectionMode,
      selectedCount: _0x57f4ab.length,
      allSelected: _0x59f992,
      projectAssets: _0x4178ae.data.assets
    }) : _0x4178ae.assetSelectionMode ? "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"toggle-all-assets\" aria-pressed=\"" + _0x59f992 + "\" " + (_0x4dc755.length && !_0x4178ae.isBatchGenerating ? "" : "disabled") + ">" + (_0x59f992 ? "取消全选" : "全选") + "</button><button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-asset-selection\" " + (_0x4178ae.isBatchGenerating ? "disabled" : "") + ">取消</button>" + renderStoryAssetBatchGenerationControl(_0x4178ae) : "<button type=\"button\" class=\"story-primary-button\" data-story-action=\"toggle-asset-selection\">选中生成</button>",
    cardsHtml: _0x3ed1c2,
    detailHtml: renderStoryAssetDetail(_0x4178ae, _0x4a5f2e),
    footerHtml: renderPageFooter(_0x4178ae, {
      nextLabel: _0x4178ae.data?.project?.sourceMode === "video-replication" ? "下一步：分集视频" : "生成分镜视频"
    }),
    splitRatio: normalizeStoryAssetSplitRatio(_0x4178ae.assetSplitRatio)
  });
}
export function renderStoryEpisodeCardActionIcon(_0x2fd0ad = "generate") {
  if (_0x2fd0ad === "edit") {
    return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 19h4l10-10-4-4L5 15v4Z\"/><path d=\"m13.5 6.5 4 4M5 19l4-1\"/></svg>";
  }
  if (_0x2fd0ad === "regenerate") {
    return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M20 11a8 8 0 1 0-2.34 5.66\"/><path d=\"M20 4v7h-7\"/></svg>";
  }
  return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><rect x=\"4\" y=\"5\" width=\"12\" height=\"14\" rx=\"2\"/><path d=\"M4 10h12M8 5v14M18.5 4v5M16 6.5h5\"/></svg>";
}
export function isStoryEpisodeExperimentalSplitAvailable(_0x46d28a = globalThis.window) {
  return _0x46d28a?.DEV_MODE === true;
}
export function shouldUseStoryEpisodeExperimentalSplit(_0x3a21d3 = {}) {
  return _0x3a21d3?.experimentalSplitMode === true;
}
export function isStoryAssetExperimentalExtractionAvailable(_0x597323 = globalThis.window) {
  return _0x597323?.DEV_MODE === true;
}
export function shouldUseStoryAssetBatchedExtraction(_0x535d21 = {}, {
  batchedAgentAvailable = false,
  forceSingleRequest = false,
  explicitExperimental = false
} = {}) {
  if (forceSingleRequest) {
    return false;
  }
  if (!explicitExperimental) {
    return false;
  }
  if (!batchedAgentAvailable) {
    return false;
  }
  return Array.isArray(_0x535d21?.episodes);
}
export function shouldUseStoryAssetParallelExtraction({
  parallelAgentAvailable = false,
  forceSingleRequest = false,
  explicitExperimental = false
} = {}) {
  return parallelAgentAvailable && !forceSingleRequest && !explicitExperimental;
}
export function renderStoryEpisodeExperimentalSplitAction(_0x10e057 = {}, {
  isDeveloperMode = false,
  disabled = false,
  busy = false
} = {}) {
  if (!isDeveloperMode) {
    return "";
  }
  const _0x54b0e9 = Math.max(1, Math.trunc(Number(_0x10e057?.number) || 1));
  const _0x3befcd = getStoryEpisodeCardAction(_0x10e057);
  return "<button type=\"button\" class=\"story-episode-experimental-split story-episode-experimental-split--after-" + _0x3befcd.kind + "\" data-story-action=\"experimental-split-episode\" data-story-episode-id=\"" + escapeHtml(_0x10e057?.id) + "\" aria-label=\"使用开发测试生成第 " + _0x54b0e9 + " 集\" title=\"仅开发者模式可用：使用实验性分批生成流程，先规划整集蓝图，再分批生成 3–5 个片段\" " + (disabled ? "disabled" : "") + " aria-busy=\"" + busy + "\">" + (busy ? renderStoryGenerationSpinner({
    button: true
  }) : renderStoryEpisodeCardActionIcon("generate")) + "<span>" + (busy ? "生成中" : "开发测试") + "</span></button>";
}
export function renderStoryEpisodeExperimentalModeToggle(_0x2982e2 = false, {
  disabled = false
} = {}) {
  const _0x577bb5 = _0x2982e2 === true;
  const _0x526d42 = _0x577bb5 ? "实验模式已开启：生成、重新生成和批量拆分将使用实验性分批生成流程；任务会逐批执行，耗时可能增加，结果仍在持续优化" : "开启后，生成、重新生成和批量拆分将使用实验性分批生成流程；任务会逐批执行，耗时可能增加，结果仍在持续优化";
  return "<button type=\"button\" class=\"story-experimental-mode-toggle " + (_0x577bb5 ? "is-active" : "") + "\" data-story-action=\"toggle-experimental-split-mode\" aria-pressed=\"" + _0x577bb5 + "\" aria-label=\"" + (_0x577bb5 ? "关闭" : "开启") + "实验模式\" title=\"" + _0x526d42 + "\" " + (disabled ? "disabled" : "") + "><span class=\"story-experimental-mode-track\" aria-hidden=\"true\"><span class=\"story-experimental-mode-thumb\"></span></span><span class=\"story-experimental-mode-label\">实验模式</span></button>";
}
export function renderStoryEpisodeRequestDebugAction(_0x578671 = {}, {
  isDeveloperMode = false,
  disabled = false
} = {}) {
  if (!isDeveloperMode) {
    return "";
  }
  const _0x19e1ff = Math.max(1, Math.trunc(Number(_0x578671?.number) || 1));
  const _0x30e13f = getStoryEpisodeCardAction(_0x578671);
  return "<button type=\"button\" class=\"story-episode-request-debug story-episode-request-debug--after-" + _0x30e13f.kind + "\" data-story-action=\"debug-experimental-split-request\" data-story-episode-id=\"" + escapeHtml(_0x578671?.id) + "\" aria-label=\"调试第 " + _0x19e1ff + " 集实验分批请求\" title=\"只预览下一次实验分批请求，不发送 API\">" + DEBUG_WRENCH_ICON_HTML + "<span>调试</span></button>";
}
export function renderStoryEpisodeSplitDraftStatus(_0x46357d = {}, {
  disabled = false
} = {}) {
  const _0x2ed2be = _0x46357d?.splitDraft;
  const _0x24c571 = Array.isArray(_0x2ed2be?.items) ? _0x2ed2be.items : [];
  const _0x15c3bd = _0x24c571.reduce((_0x214f17, _0x175042) => _0x214f17 + (_0x175042?.status === "valid" && Array.isArray(_0x175042?.clips) ? _0x175042.clips.length : 0), 0);
  const _0x502483 = _0x24c571.filter(_0x231dde => _0x231dde?.status !== "valid");
  const _0x149d32 = _0x502483.length;
  if (!_0x149d32) {
    return "";
  }
  const _0x2494e3 = normalizeText((Array.isArray(_0x2ed2be?.rejectedClips) ? _0x2ed2be.rejectedClips : []).find(_0x2ebf95 => normalizeText(_0x2ebf95?.message))?.message || _0x502483.find(_0x54a837 => normalizeText(_0x54a837?.error?.message))?.error?.message);
  const _0x2b9cea = _0x502483.some(_0x584f5f => Array.isArray(_0x584f5f?.rawClips) && _0x584f5f.rawClips.length > 0);
  const _0x41e3ba = _0x15c3bd > 0 || _0x2b9cea;
  const _0x1b1eb8 = _0x15c3bd > 0 ? "应用 " + _0x15c3bd + " 个合格片段" : "重新校验已保存结果";
  const _0x44a405 = _0x15c3bd > 0 ? "只应用已通过校验的片段，不调用模型" : "使用当前规则重新校验已保存的片段，不调用模型";
  const _0xf8965e = _0x41e3ba ? "<button type=\"button\" class=\"story-secondary-button story-episode-split-draft-repair\" data-story-action=\"repair-episode-split-draft\" data-story-episode-id=\"" + escapeHtml(_0x46357d?.id) + "\" title=\"" + _0x44a405 + "\" " + (disabled ? "disabled" : "") + ">" + _0x1b1eb8 + "</button>" : "<span class=\"story-episode-split-draft-guidance\">请点击右上角重新生成</span>";
  return "<div class=\"story-episode-split-draft\" role=\"status\" aria-live=\"polite\">\n    <span class=\"story-episode-split-draft-copy\">本次返回未完全通过：已保留 " + _0x15c3bd + " 个合格片段和 " + _0x149d32 + " 项原始错误；当前旧版本未被覆盖。" + (_0x2494e3 ? " 失败原因：" + escapeHtml(_0x2494e3) : "") + "</span>\n    " + _0xf8965e + "\n  </div>";
}
function createStoryEpisodeCardPresentation(_0x3ba629, _0x3454b6) {
  const _0x11e3b5 = _0x3ba629.selectedEpisodeIds.includes(_0x3454b6.id);
  const _0x1568d4 = Array.isArray(_0x3ba629?.data?.assets);
  const _0x2c4668 = _0x1568d4 ? deriveStoryEpisodeAssetSummary(_0x3454b6, _0x3ba629.data.assets) : {
    characterCount: Number(_0x3454b6?.characterCount) || 0,
    sceneCount: Number(_0x3454b6?.sceneCount) || 0,
    propCount: Number(_0x3454b6?.propCount) || 0
  };
  const _0x1f4077 = getStoryEpisodeGenerationControlState(_0x3ba629, _0x3454b6.id);
  const _0x41ea5b = _0x1f4077.isGenerating;
  const _0x157078 = deriveStoryEpisodeStatus(_0x3454b6.clips);
  const _0x2a6b36 = getStoryEpisodeCardAction(_0x3454b6);
  const _0x30b42e = _0x3ba629.episodeSelectionMode === true;
  return {
    id: _0x3454b6.id,
    number: _0x3454b6.number,
    title: _0x3454b6.title,
    status: _0x157078,
    characterCount: _0x2c4668.characterCount,
    sceneCount: _0x2c4668.sceneCount,
    propCount: _0x2c4668.propCount,
    clipCount: _0x3454b6.clipCount,
    isChecked: _0x11e3b5,
    isSelectionMode: _0x30b42e,
    isSplitting: _0x41ea5b,
    disabled: _0x1f4077.disabled,
    actionKind: _0x2a6b36.kind,
    actionLabel: _0x2a6b36.label,
    media: resolveStoryEpisodeCardMedia(_0x3454b6),
    experimentalActionMarkup: renderStoryEpisodeExperimentalSplitAction(_0x3454b6, {
      isDeveloperMode: Boolean(_0x3ba629.experimentalSplitAvailable),
      disabled: _0x1f4077.disabled,
      busy: _0x41ea5b
    }),
    requestDebugMarkup: renderStoryEpisodeRequestDebugAction(_0x3454b6, {
      isDeveloperMode: Boolean(_0x3ba629.experimentalSplitAvailable),
      disabled: _0x1f4077.disabled
    }),
    splitDraftMarkup: renderStoryEpisodeSplitDraftStatus(_0x3454b6, {
      disabled: _0x1f4077.disabled
    })
  };
}
export function renderEpisodeCard(_0x241b5d, _0x5f23b2) {
  return storyClipProductionPresentation.renderOverview({
    kind: "card",
    card: createStoryEpisodeCardPresentation(_0x241b5d, _0x5f23b2)
  });
}
export function renderEpisodesPage(_0x2ef406) {
  const _0x3f3afc = getStoryEpisodeBatchControlState(_0x2ef406);
  const _0x6bb673 = getStoryVideoEpisodes(_0x2ef406.data.episodes);
  const _0x4faedf = shouldUseStoryEpisodeExperimentalSplit(_0x2ef406);
  const _0x38670d = _0x3f3afc.disabled || Array.isArray(_0x2ef406.splittingEpisodeIds) && _0x2ef406.splittingEpisodeIds.length > 0;
  const _0xef6bb2 = _0x6bb673.length > 0 && _0x6bb673.every(_0x42a0de => _0x2ef406.selectedEpisodeIds.includes(_0x42a0de.id));
  return storyClipProductionPresentation.renderOverview({
    kind: "page",
    experimentalMode: _0x4faedf,
    experimentalModeToggleMarkup: renderStoryEpisodeExperimentalModeToggle(_0x4faedf, {
      disabled: _0x38670d
    }),
    selectionMode: _0x2ef406.episodeSelectionMode === true,
    allEpisodesSelected: _0xef6bb2,
    selectedCount: _0x2ef406.selectedEpisodeIds.length,
    batchControl: _0x3f3afc,
    cards: _0x6bb673.map(_0x2790ca => createStoryEpisodeCardPresentation(_0x2ef406, _0x2790ca)),
    footerMarkup: renderPageFooter(_0x2ef406, {
      nextLabel: "保存并返回项目列表",
      isLast: true
    })
  });
}
function renderPageFooter(_0x1ad650, _0x35b0f5 = {}) {
  return storyWorkspaceChromePresentation.renderFooter(storyWorkspaceChromeProjection.projectFooter(_0x1ad650, _0x35b0f5));
}
function getSelectedEpisode(_0x3688e6) {
  return _0x3688e6.data.episodes.find(_0x301b7a => _0x301b7a.id === _0x3688e6.selectedEpisodeId) || _0x3688e6.data.episodes[0];
}
function getSelectedClip(_0x5c1512, _0x486335) {
  return _0x486335?.clips?.find(_0x40bdbb => _0x40bdbb.id === _0x5c1512.selectedClipId) || _0x486335?.clips?.[0] || null;
}
function getStoryEpisodeAssetRailHelp(_0x5c06c8) {
  if (_0x5c06c8 === "frames") {
    return "视频提取画面与裁剪片段，可拖入提示词或删除";
  }
  if (_0x5c06c8 === "library") {
    return "连接画布素材库，可拖入提示词";
  }
  return "拖入提示词";
}
export function renderEpisodeAssetRail(_0x14ccf4) {
  const _0x26d33c = getSelectedEpisode(_0x14ccf4);
  const _0x208b7d = deriveStoryEpisodeAssetSummary(_0x26d33c, _0x14ccf4.data.assets).assets;
  const _0x5c5daf = normalizeText(_0x26d33c?.id);
  const _0x4fb7b3 = Array.isArray(_0x26d33c?.clips) ? _0x26d33c.clips : [];
  const _0x3878c1 = new Set(_0x4fb7b3.map(_0x1646be => normalizeText(_0x1646be?.id)).filter(Boolean));
  const _0x46a6b0 = normalizeStoryClipFrames(_0x14ccf4.data.clipFrames).filter(_0x374f6e => {
    const _0x14ef75 = normalizeText(_0x374f6e.episodeId);
    if (_0x14ef75) {
      return _0x14ef75 === _0x5c5daf;
    }
    return _0x3878c1.has(normalizeText(_0x374f6e.clipId));
  });
  const _0x111632 = normalizeStoryEpisodeAssetRailTab(_0x14ccf4.episodeAssetRailTab);
  const _0x1e2b02 = buildWorkspaceAssetLibraryItems({
    allowedTypes: null
  }).map(_0x1b925b => {
    const _0x1884be = normalizeText(_0x1b925b.mediaKind);
    return {
      ..._0x1b925b,
      mediaKind: _0x1884be,
      imageUrl: _0x1884be === "image" ? normalizeText(_0x1b925b.thumbnailUrl || _0x1b925b.sourceUrl) : normalizeText(_0x1b925b.thumbnailUrl),
      typeLabel: getWorkspaceAssetLibraryMediaLabel(_0x1884be)
    };
  });
  return storyClipProductionPresentation.renderAssetRail({
    activeTab: _0x111632,
    helpText: getStoryEpisodeAssetRailHelp(_0x111632),
    assetKindLabels: Object.fromEntries(["character", "scene", "prop"].map(_0x3000d8 => [_0x3000d8, getStoryAssetTabLabel(_0x3000d8)])),
    assets: _0x208b7d.map(_0x51fb6f => ({
      id: _0x51fb6f.id,
      name: _0x51fb6f.name,
      kind: _0x51fb6f.kind,
      imageUrl: getStoryAssetBaseAppearance(_0x51fb6f)?.imageUrl || getStoryAssetAppearances(_0x51fb6f).find(_0x241d79 => normalizeText(_0x241d79.imageUrl))?.imageUrl || ""
    })),
    clips: _0x4fb7b3.map(_0xdaa1ba => ({
      id: _0xdaa1ba?.id,
      title: _0xdaa1ba?.title
    })),
    frames: _0x46a6b0.map(_0x2c71fa => ({
      id: _0x2c71fa.id,
      name: _0x2c71fa.name,
      clipId: _0x2c71fa.clipId,
      clipTitle: _0x2c71fa.clipTitle,
      captureSavePending: _0x2c71fa.captureSavePending === true,
      mentionId: buildStoryClipFrameMentionId(_0x2c71fa.id),
      mediaType: getStoryClipFrameMediaType(_0x2c71fa),
      imageUrl: resolveStoryClipFrameImageUrl(_0x2c71fa),
      mediaUrl: resolveStoryClipFrameMediaUrl(_0x2c71fa)
    })),
    libraryAssets: _0x1e2b02
  });
}
function renderEpisodeDetail(_0x17968b) {
  const _0x57fe21 = getSelectedEpisode(_0x17968b);
  const _0x1068d5 = getSelectedClip(_0x17968b, _0x57fe21);
  const _0x2e21d4 = _0x17968b.data?.project || {};
  const _0x1cdffd = resolveStoryStyleSelection({
    styleId: _0x2e21d4.videoStyleId,
    stylePrompt: _0x2e21d4.videoStylePrompt,
    videoStyle: _0x2e21d4.videoStyle
  });
  const _0xd25ebb = [_0x1cdffd.label, normalizeStoryAspectRatio(_0x2e21d4.aspectRatio), "单幕最多 " + normalizeStorySceneMaxSeconds(_0x2e21d4.planning?.sceneMaxSeconds) + " 秒"].filter(Boolean);
  const _0x345509 = (_0x57fe21?.clips || []).length > 1;
  if (_0x57fe21 && _0x17968b.selectedEpisodeId !== _0x57fe21.id) {
    _0x17968b.selectedEpisodeId = _0x57fe21.id;
  }
  if (_0x1068d5 && _0x17968b.selectedClipId !== _0x1068d5.id) {
    _0x17968b.selectedClipId = _0x1068d5.id;
  }
  const _0x5d0977 = normalizeStoryEpisodePanelRatios(_0x17968b.episodeAssetPanelRatio, _0x17968b.episodeEditorPanelRatio);
  const _0x5e075c = storyClipProduction.renderEpisode(_0x17968b, _0x57fe21, _0x1068d5);
  return storyClipProductionPresentation.renderDetail({
    title: _0x1068d5?.title || "片段脚本",
    clipMeta: _0xd25ebb,
    ratios: _0x5d0977,
    hasMultipleClips: _0x345509,
    assetRailMarkup: renderEpisodeAssetRail(_0x17968b),
    referenceSummary: _0x5e075c.referenceSummary,
    promptSurface: _0x5e075c.promptSurface,
    navigationMarkup: _0x345509 ? "" + renderStoryClipNavigationArrow("previous") + renderStoryClipNavigationArrow("next") : "",
    videoPreview: _0x5e075c.videoPreview,
    timeline: _0x5e075c.timeline
  });
}
function renderProjectPage(_0x2411e9) {
  if (_0x2411e9.view === "episode") {
    return renderEpisodeDetail(_0x2411e9);
  }
  if (_0x2411e9.step === 1 && _0x2411e9.data?.project?.sourceMode === "video-replication") {
    const _0x3f8fed = getStoryReplicationLocale(_0x2411e9.data.project?.replication?.targetLocale);
    const _0x2542f7 = resolveStoryStyleSelection({
      styleId: _0x2411e9.data.project?.videoStyleId,
      stylePrompt: _0x2411e9.data.project?.videoStylePrompt,
      videoStyle: _0x2411e9.data.project?.videoStyle
    });
    return renderStoryVideoReplicationPage({
      episodes: _0x2411e9.data.episodes,
      targetLabel: _0x3f8fed.label,
      styleLabel: _0x2542f7.label,
      footerMarkup: renderStoryVideoReplicationFooter(_0x2411e9)
    });
  }
  if (_0x2411e9.step === 1 && isStoryAssetExtractionOperation(_0x2411e9.storyPlanningOperation)) {
    return renderStoryAssetBreakdownPage(_0x2411e9);
  }
  if (_0x2411e9.step === 2) {
    return renderAssetsPage(_0x2411e9);
  }
  if (_0x2411e9.step === 3) {
    return renderEpisodesPage(_0x2411e9);
  }
  return renderOutlinePage(_0x2411e9);
}
function renderStoryVideoReplicationFooter(_0x2386c0) {
  const _0x2e9314 = getStoryVideoReplicationFooterState(_0x2386c0.data, {
    localizing: isStoryAssetExtractionOperation(_0x2386c0.storyPlanningOperation),
    planningStatus: _0x2386c0.storyPlanningStatus
  });
  return renderPageFooter(_0x2386c0, {
    title: _0x2e9314.title,
    hint: _0x2e9314.hint,
    actionsMarkup: "<button type=\"button\" class=\"story-next-button story-replication-next-button" + (_0x2e9314.actionAttention ? " is-attention" : "") + "\" data-story-action=\"" + _0x2e9314.action + "\" " + (_0x2e9314.actionDisabled ? "disabled" : "") + " aria-busy=\"" + _0x2e9314.busy + "\">" + (_0x2e9314.busy ? renderStoryGenerationSpinner({
      button: true
    }) : "") + "<span>" + escapeHtml(_0x2e9314.actionLabel) + "</span>" + (_0x2e9314.busy ? "" : "<span class=\"story-next-arrow\" aria-hidden=\"true\">→</span>") + "</button>"
  });
}
function findStoryAsset(_0x2bfda3, _0xfe15d6) {
  return _0x2bfda3.data.assets.find(_0x5e2e0b => _0x5e2e0b.id === _0xfe15d6) || null;
}
function getStoryAssetPromptEditorContext(_0x390e03 = {}, _0x2b1d6f = null) {
  const _0x407c97 = normalizeText(_0x2b1d6f?.dataset?.storyAssetPromptAssetId);
  const _0x581d45 = normalizeText(_0x2b1d6f?.dataset?.storyAssetPromptAppearanceId);
  if (!_0x407c97 || !_0x581d45) {
    return {
      asset: null,
      appearance: null
    };
  }
  const _0x1510d9 = (Array.isArray(_0x390e03?.data?.assets) ? _0x390e03.data.assets : []).find(_0x228f02 => normalizeText(_0x228f02?.id) === _0x407c97) || null;
  const _0x408788 = _0x1510d9 ? getStoryAssetAppearances(_0x1510d9).find(_0x2e4dd3 => normalizeText(_0x2e4dd3?.id) === _0x581d45) || null : null;
  return {
    asset: _0x1510d9,
    appearance: _0x408788
  };
}
export function updateStoryAssetPromptFromEditor(_0x105e1a = {}, _0x753003 = null) {
  const {
    asset: _0x35c4ae,
    appearance: _0x560a46
  } = getStoryAssetPromptEditorContext(_0x105e1a, _0x753003);
  if (!_0x35c4ae || !_0x560a46 || _0x35c4ae.isLibraryAsset) {
    return false;
  }
  _0x560a46.prompt = readStoryAssetPromptText(_0x753003);
  if (normalizeText(getStoryAssetAppearances(_0x35c4ae)[0]?.id) === normalizeText(_0x560a46.id)) {
    _0x35c4ae.prompt = _0x560a46.prompt;
  }
  return true;
}
function updateSelectedClipPrompt(_0x5ecfa8, _0x3eaff5) {
  const _0x14215c = getSelectedEpisode(_0x5ecfa8);
  const _0x5131c5 = getSelectedClip(_0x5ecfa8, _0x14215c);
  if (_0x5131c5) {
    _0x5131c5.prompt = sanitizePromptHtmlForCommit(String(_0x3eaff5 || ""));
  }
}
function syncProjectChapterContent(_0x12947f) {
  if (normalizeText(_0x12947f?.outlineStatus) !== "completed" && !_0x12947f?.compiledScript) {
    _0x12947f.sourceChapters = (_0x12947f.chapters || []).map(_0x21f27c => ({
      id: normalizeText(_0x21f27c?.id),
      title: normalizeText(_0x21f27c?.title),
      content: normalizeText(_0x21f27c?.content)
    }));
  }
  const _0x510042 = (_0x12947f.chapters || []).map(_0x1cd8b6 => (normalizeText(_0x1cd8b6.title) + "\n" + normalizeText(_0x1cd8b6.content)).trim()).filter(Boolean).join("\n\n");
  _0x12947f.plotScript = _0x510042;
  _0x12947f.narrationScript = _0x510042;
}
export function reportStoryWorkspaceApiError(_0x5b1e02, _0x5289d7, _0x138450 = {}) {
  const _0x50d006 = normalizeText(_0x5b1e02) || "unknown-operation";
  const _0x45ed21 = Number(_0x5289d7?.status);
  const _0x28830d = {
    operation: _0x50d006,
    message: normalizeText(_0x5289d7?.message || _0x5289d7) || "未知错误",
    model: normalizeText(_0x138450?.model),
    provider: normalizeText(_0x5289d7?.provider || _0x138450?.provider),
    status: Number.isFinite(_0x45ed21) ? _0x45ed21 : null,
    code: _0x5289d7?.code ?? null,
    type: normalizeText(_0x5289d7?.type || _0x5289d7?.name) || "Error",
    retryable: typeof _0x5289d7?.retryable === "boolean" ? _0x5289d7.retryable : null,
    raw: _0x5289d7?.raw ?? null
  };
  globalThis.console?.error?.("[storyWorkspace][" + _0x50d006 + "] API 请求失败", _0x28830d, _0x5289d7);
  return _0x28830d;
}
export function resolveStoryEpisodeExperimentalErrorMessage(_0xb9fbc9, {
  retryActionLabel = "开发测试"
} = {}) {
  const _0x380e64 = normalizeText(_0xb9fbc9?.message || _0xb9fbc9);
  const _0x511c05 = typeof _0xb9fbc9?.getUserMessage === "function" ? normalizeText(_0xb9fbc9.getUserMessage()) : "";
  const _0x57e4e8 = _0x511c05 || _0x380e64;
  if (/api\s*key|密钥|额度|余额|未登录|未授权/iu.test(_0x57e4e8) || /缺少(?:可用的)?(?:场景资产|剧本正文|标题)|请先选择可用的文本模型|场景资产(?:未完整覆盖|存在重复绑定)|请先重新提取场景资产/u.test(_0x57e4e8)) {
    return _0x57e4e8.replaceAll("资产", "素材");
  }
  const _0x1f0c47 = normalizeText(retryActionLabel) || "开发测试";
  return "本次分镜生成未完成，已保存当前进度。请稍后再次点击“" + _0x1f0c47 + "”继续。";
}
export function resolveStoryTaskResultDestination(_0xdff78d = {}, _0x8a4119 = {}) {
  const _0x2c6c96 = Array.isArray(_0xdff78d?.episodes) ? _0xdff78d.episodes : [];
  const _0x4f9fc7 = Array.isArray(_0xdff78d?.assets) ? _0xdff78d.assets : [];
  const _0x520593 = normalizeText(_0x8a4119?.episodeId);
  const _0x37a330 = _0x2c6c96.find(_0x5676ef => normalizeText(_0x5676ef?.id) === _0x520593);
  if (_0x37a330 && Array.isArray(_0x37a330.clips) && _0x37a330.clips.length) {
    const _0x427a21 = normalizeText(_0x8a4119?.clipId);
    const _0x5c3df6 = _0x37a330.clips.find(_0x16c988 => normalizeText(_0x16c988?.id) === _0x427a21) || _0x37a330.clips[0];
    return {
      view: "episode",
      step: 3,
      episodeId: normalizeText(_0x37a330.id),
      clipId: normalizeText(_0x5c3df6?.id)
    };
  }
  const _0x16041e = normalizeText(_0x8a4119?.assetId);
  const _0xe598e5 = _0x4f9fc7.find(_0x294110 => normalizeText(_0x294110?.id) === _0x16041e);
  if (_0xe598e5) {
    return {
      view: "project",
      step: 2,
      assetId: normalizeText(_0xe598e5.id),
      assetFilter: normalizeText(_0xe598e5.kind) || "character"
    };
  }
  const _0x29e285 = normalizeStoryWorkspaceStep(_0x8a4119?.step);
  return {
    view: "project",
    step: _0x29e285,
    outlineSectionId: _0x29e285 === 1 ? normalizeText(_0x8a4119?.outlineSectionId) : ""
  };
}
export function notifyStoryTaskResult(_0x2c443c, _0x1bb00f, _0x4d580d = "info", {
  details: _0xb6c055,
  duration: _0x22d1d4,
  toastOptions: _0x51f0b2,
  consoleObject = globalThis.console
} = {}) {
  const _0xef2bc4 = _0x4d580d === "warning" ? "warn" : String(_0x4d580d || "info");
  const _0x10fc8d = String(_0x1bb00f || "").trim() || "任务状态已更新。";
  const _0x1546c7 = consoleObject?.error || consoleObject?.log;
  if (_0xef2bc4 === "error" && typeof _0x1546c7 === "function") {
    const _0x51084b = {
      tone: _0xef2bc4,
      message: _0x10fc8d,
      timestamp: new Date().toISOString()
    };
    if (_0xb6c055 === undefined) {
      _0x1546c7.call(consoleObject, "[storyWorkspace][task-result]", _0x51084b);
    } else {
      _0x1546c7.call(consoleObject, "[storyWorkspace][task-result]", _0x51084b, _0xb6c055);
    }
  }
  if (typeof _0x2c443c !== "function") {
    return false;
  }
  if (_0x22d1d4 === undefined && _0x51f0b2 === undefined) {
    _0x2c443c(_0x10fc8d, _0xef2bc4);
  } else {
    _0x2c443c(_0x10fc8d, _0xef2bc4, _0x22d1d4, _0x51f0b2);
  }
  return true;
}
export function notifyStoryTextGenerationComplete(_0x24db69, {
  playSound = playCompletionSound,
  showNotification = showGenerationCompleteNotification,
  navigationTarget = null
} = {}) {
  const _0x421520 = String(_0x24db69 || "").trim() || "剧本工作室文本生成完成。";
  return Promise.allSettled([Promise.resolve().then(() => playSound("generation-success")), Promise.resolve().then(() => showNotification({
    body: _0x421520,
    ...(navigationTarget ? {
      navigation: navigationTarget
    } : {})
  }))]);
}
export function initStoryWorkspace({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  adjustClipPrompt = null,
  generateStory = null,
  generateEpisodeScript = null,
  extractAssets = null,
  extractAssetsParallel = null,
  extractAssetsExperimental = null,
  planEpisodes = null,
  recoverEpisodeSplitDraft = null,
  splitEpisode = null,
  splitEpisodesBatch = null,
  splitEpisodeExperimental = null,
  reviewEpisodeSplit = null,
  extractDocumentText = null,
  analyzeSourceVideo = null,
  createEpisodeCanvas = null,
  createProjectCanvas = null,
  subscribeCanvasNodeDeletions = null,
  subscribeCanvasMediaNodeChanges = null,
  getCanvasMediaSnapshot = null,
  syncClipFrameToCanvas = null,
  deleteCanvasNodes = null,
  generateAssetImage = null,
  saveAssetPackageItem = null,
  saveMedia = saveMediaDownload,
  loadWorkspace = null,
  saveWorkspace = null,
  requestWorkspaceMode = () => false
} = {}) {
  if (!documentObject?.body) {
    return null;
  }
  const _0x37ce1d = documentObject.getElementById("storyWorkspaceRoot");
  if (_0x37ce1d?._storyWorkspaceApi) {
    return _0x37ce1d._storyWorkspaceApi;
  }
  const _0x2b6311 = documentObject.getElementById("v2-wrap");
  if (!_0x2b6311) {
    return null;
  }
  const _0x1356a7 = normalizeStoryWorkspaceAssetData(createDemoStoryWorkspaceData());
  _0x1356a7.project.planning = normalizeStoryProjectPlanning(_0x1356a7.project, {
    allowDeveloperPromptModes: windowObject?.DEV_MODE === true
  });
  const _0x32de8c = resolveStoryWorkspaceModelId("text");
  const _0x6e52c5 = resolveStoryWorkspaceModelId("image");
  const _0x27553a = resolveStoryWorkspaceModelId("video");
  const _0x3ffeb1 = {
    storyProjectSessionId: 1,
    storyProjectSessionById: {
      [normalizeText(_0x1356a7.project?.id)]: 1
    },
    experimentalSplitAvailable: isStoryEpisodeExperimentalSplitAvailable(windowObject),
    experimentalAssetExtractionAvailable: isStoryAssetExperimentalExtractionAvailable(windowObject),
    developerModeAvailable: windowObject?.DEV_MODE === true,
    view: "home",
    step: 1,
    homeTab: "generate",
    uploadInputMode: "file",
    replicationSourceFiles: [],
    replicationSourcePreviewUrls: [],
    replicationTargetLocale: "zh-CN",
    idea: "",
    scriptFileName: "",
    scriptText: "",
    scriptCharacterCount: null,
    isGeneratingStory: false,
    isParsingDocument: false,
    canvasSyncPending: false,
    canvasSyncScope: "",
    hasCreatedProject: false,
    projectTitleEdited: false,
    projects: [],
    projectSearchQuery: "",
    projectSortOrder: "updated-desc",
    showArchivedProjects: false,
    openProjectMenuId: "",
    pendingDeleteProjectId: "",
    pendingDeleteAssetAppearanceKey: "",
    generationStatus: "",
    storyPlanningOperation: "",
    storyPlanningStatus: "",
    assetBreakdownEpisodes: [],
    assetBreakdownVisibleCount: 0,
    scriptSelectionMode: false,
    selectedScriptEpisodeIds: [],
    generatingEpisodeScriptId: "",
    isBatchGeneratingScripts: false,
    episodeScriptBatchId: "",
    episodeScriptBatchCancelRequested: false,
    scriptGenerationFocusMode: false,
    outlineSectionOpenState: {},
    pageScrollPositions: {},
    episodeScriptGenerationStatus: "",
    pendingRegenerationTarget: "",
    pendingClipInput: null,
    generatingClipId: "",
    generatingClipIds: [],
    pendingDeleteClipId: "",
    clipAdjustmentOpen: false,
    clipAdjustmentInstruction: "",
    clipAdjustmentPromptMode: "",
    clipAdjustmentPromptModeOpen: false,
    clipPromptHistoryOpen: false,
    clipAdjustmentGeneratingIds: [],
    clipSelectionMode: false,
    selectedClipGenerationIds: [],
    clipBatchGenerationByEpisode: {},
    textProvider: getStoryWorkspaceModelChoice("text", _0x32de8c)?.provider || "",
    textProviderProfileId: "",
    imageProvider: resolveModelProvider(_0x6e52c5),
    imageGenerationParams: normalizeStoryImageGenerationParams(_0x6e52c5),
    imageGenerationParamsByModel: {},
    assetPromptPresetId: STORY_CHARACTER_ASSET_PROMPT_PRESET_NONE_ID,
    sceneAssetPromptPresetId: STORY_SCENE_ASSET_PROMPT_PRESET_NONE_ID,
    videoProvider: resolveStoryVideoProvider(_0x27553a),
    videoProviderProfileId: "",
    videoProviderProfileIdByModel: {},
    videoGenerationParams: applyStoryAspectRatioToVideoGenerationParams(_0x27553a, {}, _0x1356a7.project?.aspectRatio),
    videoGenerationParamsByModel: {},
    scriptMode: "plot",
    assetFilter: "character",
    assetLibraryDisclosure: createWorkspaceAssetLibraryDisclosure(),
    assetSplitRatio: 50,
    episodeAssetPanelRatio: 22,
    episodeEditorPanelRatio: 34,
    episodeAssetRailTab: "assets",
    assetSelectionMode: false,
    selectedAssetIds: [],
    exportingAssetAppearanceKey: "",
    experimentalSplitMode: false,
    episodeSelectionMode: false,
    selectedEpisodeIds: [],
    splittingEpisodeIds: [],
    episodeBatchSplitOperation: "",
    episodeBatchSplitStatus: "",
    episodeBatchSplitId: "",
    episodeBatchSplitCancelRequested: false,
    assetAppearanceIndexes: {},
    assetAppearanceMotion: "",
    selectedAssetId: _0x1356a7.assets.find(_0x2d3a18 => _0x2d3a18.kind === "character")?.id || "",
    selectedEpisodeId: _0x1356a7.episodes[0]?.id || "",
    selectedClipId: _0x1356a7.episodes[0]?.clips?.[0]?.id || "",
    pendingAssetUploadId: "",
    pendingAssetAppearanceId: "",
    pendingCharacterVoiceAssetId: "",
    characterVoiceEditor: null,
    characterVoicePanelMotion: "",
    generatingAppearanceKeys: [],
    generatingVoiceAssetIds: [],
    isBatchGenerating: false,
    batchGeneratingAssetIds: [],
    batchGeneratingAppearanceKeys: [],
    batchGeneratingVoiceAssetIds: [],
    assetBatchId: "",
    assetBatchCancelRequested: false,
    batchGenerationLabel: "",
    data: _0x1356a7,
    models: {
      text: _0x32de8c,
      image: _0x6e52c5,
      video: _0x27553a
    }
  };
  const _0x3b5272 = documentObject.createElement("section");
  _0x3b5272.id = "storyWorkspaceRoot";
  _0x3b5272.className = "story-workspace-root";
  _0x3b5272.dataset.uiStop = "1";
  _0x3b5272.hidden = true;
  _0x3b5272.setAttribute("aria-hidden", "true");
  _0x3b5272.innerHTML = "<div class=\"story-workspace-shell\" data-story-workspace-shell>\n    <div class=\"story-workspace-toolbar\" data-story-toolbar></div>\n    <div class=\"story-page-stage\" data-story-page-stage>\n      <main class=\"story-page-viewport\" data-story-page-viewport></main>\n      <div class=\"story-workspace-generation-loading storyboard-script-loading-overlay\" data-story-planning-loading role=\"status\" aria-live=\"polite\" hidden>\n        <div class=\"storyboard-script-loading-spinner\"></div>\n        <div class=\"storyboard-script-loading-label\" data-story-planning-loading-label>正在提取角色、场景与道具</div>\n        <div class=\"storyboard-script-loading-bar\"><div class=\"storyboard-script-loading-bar-fill\"></div></div>\n      </div>\n    </div>\n  </div>\n  <div class=\"story-canvas-sync-loading storyboard-script-loading-overlay\" data-story-canvas-sync-loading role=\"status\" aria-live=\"polite\" aria-label=\"正在加入画布\" aria-hidden=\"true\" tabindex=\"-1\" hidden>\n    <div class=\"storyboard-script-loading-spinner\"></div>\n    <strong class=\"storyboard-script-loading-label\">正在加入画布</strong>\n    <small>同步完成后将自动跳转到画布</small>\n  </div>\n  <div class=\"story-asset-hover-preview\" data-story-asset-hover-preview role=\"tooltip\" aria-hidden=\"true\"></div>\n  <div class=\"story-clip-video-history-menu\" data-story-clip-video-history-menu aria-hidden=\"true\"></div>\n  <input class=\"story-hidden-input\" type=\"file\" data-story-script-file accept=\".txt,.docx,.pdf\">\n  <input class=\"story-hidden-input\" type=\"file\" data-story-replication-video-file accept=\"" + STORY_REPLICATION_VIDEO_ACCEPT + "\" multiple>\n  <input class=\"story-hidden-input\" type=\"file\" data-story-asset-file accept=\"image/*\">\n  <input class=\"story-hidden-input\" type=\"file\" data-story-asset-reference-file accept=\"image/*\">\n  <input class=\"story-hidden-input\" type=\"file\" data-story-character-voice-file accept=\".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a\">\n  <input class=\"story-hidden-input\" type=\"file\" data-story-clip-input-file>";
  _0x2b6311.appendChild(_0x3b5272);
  const _0x3a9cf4 = createStoryLibraryAssignmentMenuPortal({
    storyRoot: _0x3b5272,
    windowObject: windowObject
  });
  const _0x46c534 = (_0x205022 = _0x3b5272) => _0x3a9cf4.closeAppearance(_0x205022);
  const _0x4635a9 = _0x94d3cb => _0x3a9cf4.openAppearance(_0x94d3cb);
  const _0x9612c5 = (_0xddf386 = _0x3b5272) => _0x3a9cf4.closeTarget(_0xddf386);
  const _0x25fdd6 = _0x47bab7 => _0x3a9cf4.toggleTarget(_0x47bab7);
  const _0x5867cc = _0x3b5272.querySelector("[data-story-toolbar]");
  const _0x1d7010 = _0x3b5272.querySelector("[data-story-workspace-shell]");
  const _0x3b5b6c = _0x3b5272.querySelector("[data-story-page-stage]");
  const _0x4bf4f6 = _0x3b5272.querySelector("[data-story-page-viewport]");
  const _0x7b052a = _0x3b5272.querySelector("[data-story-planning-loading]");
  const _0x432eb8 = _0x3b5272.querySelector("[data-story-planning-loading-label]");
  const _0x3e2999 = _0x3b5272.querySelector("[data-story-canvas-sync-loading]");
  const _0x1c2041 = _0x3b5272.querySelector("[data-story-asset-hover-preview]");
  const _0x5a04a5 = _0x3b5272.querySelector("[data-story-clip-video-history-menu]");
  const _0x125f3d = _0x3b5272.querySelector("[data-story-script-file]");
  const _0x370723 = _0x3b5272.querySelector("[data-story-replication-video-file]");
  const _0x52035d = _0x3b5272.querySelector("[data-story-asset-file]");
  const _0x558354 = _0x3b5272.querySelector("[data-story-asset-reference-file]");
  const _0x17fec5 = _0x3b5272.querySelector("[data-story-character-voice-file]");
  const _0x334e5b = _0x3b5272.querySelector("[data-story-clip-input-file]");
  let _0x9d8401 = "";
  let _0x290f2f = null;
  let _0x471216 = null;
  let _0x9f5855 = null;
  let _0x47e4c3 = null;
  let _0x566b13 = null;
  let _0x1b2c62 = "";
  let _0x37672c = "";
  let _0x31a289 = [];
  let _0x26af39 = "";
  const _0x5f32e0 = new Map();
  const _0x30e879 = new Map();
  let _0x4929ba = 0;
  let _0x458ddb = null;
  let _0xc7f270 = null;
  let _0x43e0d1 = null;
  let _0x1b2579 = null;
  let _0x5caa71 = null;
  let _0x35eac0 = null;
  let _0x32c8ec = 0;
  let _0x55a161 = 0;
  let _0x866c9e = 0;
  let _0x2afd4c = null;
  let _0x30d9c7 = "";
  let _0x46ef47 = null;
  let _0x15d050 = null;
  let _0x3ebf21 = "";
  const _0x2145bf = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x575e17 = {
    accumulator: 0,
    lockedUntil: 0
  };
  const _0x3d3f7d = new WeakMap();
  const _0x4c44ef = createWorkspacePageTransitionController({
    windowObject: windowObject,
    disposePage: _0xaa1ae4
  });
  const _0x1da07b = new Map();
  const _0x17d744 = new Set();
  const _0x3ad0c2 = new Set();
  const _0x1442b1 = new Set();
  const _0xc8f37c = new Set();
  const _0x348581 = createStoryTaskBatchCancellationRegistry();
  const _0x366053 = createStoryTaskBatchCancellationRegistry();
  const _0x252cfd = createStoryTaskBatchCancellationRegistry();
  let _0x181c81 = 0;
  const _0x52afbd = new Map([[normalizeText(_0x1356a7.project?.id), _0x1356a7]]);
  let _0x1de79f = false;
  let _0x4f8626 = false;
  const _0x338ec4 = () => {
    const _0x24e39e = isStoryEpisodeExperimentalSplitAvailable(windowObject);
    const _0x5122ab = isStoryAssetExperimentalExtractionAvailable(windowObject);
    const _0x342664 = windowObject?.DEV_MODE === true;
    if (_0x3ffeb1.experimentalSplitAvailable === _0x24e39e && _0x3ffeb1.experimentalAssetExtractionAvailable === _0x5122ab && _0x3ffeb1.developerModeAvailable === _0x342664) {
      return;
    }
    _0x3ffeb1.experimentalSplitAvailable = _0x24e39e;
    _0x3ffeb1.experimentalAssetExtractionAvailable = _0x5122ab;
    _0x3ffeb1.developerModeAvailable = _0x342664;
    _0x3ffeb1.homeTab = resolveStoryVideoReplicationHomeTab(_0x3ffeb1, _0x3ffeb1.homeTab);
    if (_0x3ffeb1.data?.project) {
      _0x3ffeb1.data.project.planning = normalizeStoryProjectPlanning(_0x3ffeb1.data.project, {
        allowDeveloperPromptModes: _0x342664
      });
      _0x3c4e04({
        immediate: true
      });
    }
    if (_0x1de79f) {
      return;
    }
    if (_0x4f8626) {
      _0xe5dd9c();
    }
  };
  windowObject?.addEventListener?.("aicanvas:runtime-info", _0x338ec4);
  windowObject?.addEventListener?.("dev-mode-changed", _0x338ec4);
  const _0x1f1468 = new Map();
  let _0x1203ba = null;
  let _0x4823d1 = "";
  let _0x57215f = "";
  const _0x21e6b3 = createStoryCharacterVoicePreviewGuard();
  const _0x1ce8f7 = (_0x1b0f58, _0x143ff3 = "info", _0x25834f, _0x112927) => {
    if (typeof windowObject?.showToast === "function") {
      if (_0x25834f === undefined && _0x112927 === undefined) {
        windowObject.showToast(_0x1b0f58, _0x143ff3);
      } else {
        windowObject.showToast(_0x1b0f58, _0x143ff3, _0x25834f, _0x112927);
      }
    }
  };
  const _0x2d11bd = (_0x459885, _0x2d5ff2 = {}) => ({
    source: "story-workspace",
    projectId: normalizeText(_0x459885?.projectId),
    ..._0x2d5ff2
  });
  const _0x500b30 = (_0x381db6, _0x1248fc = {}) => {
    const _0x3094b4 = _0x381db6?.credentialPromptShown === true || showProviderApiKeyMissingToastForError(_0x381db6, {
      ..._0x1248fc
    });
    if (_0x3094b4) {
      notifyStoryTaskResult(null, _0x381db6?.getUserMessage?.() || _0x381db6?.message || "生成任务缺少可用的 API Key。", "error", {
        details: _0x381db6
      });
    }
    return _0x3094b4;
  };
  const _0x847d75 = (_0x29636c, _0x2262d4 = "info", _0x309c45, _0x501a98) => {
    if (_0x2262d4 === "error" && _0x309c45 && _0x500b30(_0x309c45)) {
      return true;
    }
    const _0x4482ea = Boolean(_0x501a98?.projectId);
    return notifyStoryTaskResult(windowObject?.showToast, _0x29636c, _0x2262d4, {
      details: _0x309c45,
      ...(_0x4482ea ? {
        duration: 9000,
        toastOptions: {
          ariaLabel: String(_0x29636c || "任务完成").trim() + "，点击查看结果",
          onClick: () => {
            _0x2b81b9(_0x501a98);
          }
        }
      } : {})
    });
  };
  const _0x5c2bf9 = (_0x397911, _0x5e19da, _0x3cbd5c, {
    notificationMessage = _0x397911,
    tone = "success",
    details: _0x41d7af,
    showResultToast = true
  } = {}) => {
    const _0x15dbda = _0x2d11bd(_0x5e19da, _0x3cbd5c);
    const _0x4218bd = showResultToast ? _0x847d75(_0x397911, tone, _0x41d7af, _0x15dbda) : false;
    notifyStoryTextGenerationComplete(notificationMessage, {
      navigationTarget: _0x15dbda
    });
    return _0x4218bd;
  };
  const _0xf62208 = (_0x2c3ca4, _0x32f601, _0x55fc54, _0x5f52cd, _0x42ab32) => _0x5c2bf9(_0x2c3ca4, _0x55fc54, _0x5f52cd, {
    tone: _0x32f601,
    details: _0x42ab32
  });
  const _0x2e1a77 = (_0x5f3970, _0x148291, _0x548a2b, {
    notificationMessage = _0x5f3970,
    tone = "success",
    details: _0xe79905
  } = {}) => _0x5c2bf9(_0x5f3970, _0x148291, _0x548a2b, {
    notificationMessage: notificationMessage,
    tone: tone,
    details: _0xe79905
  });
  const _0x3c5b96 = subscribeGenerationCompleteNotificationClicks(_0x4dfe65 => {
    if (_0x4dfe65?.source !== "story-workspace") {
      return;
    }
    _0x2b81b9(_0x4dfe65);
  });
  function _0x5d0718(_0x1b9232) {
    return JSON.parse(JSON.stringify(_0x1b9232));
  }
  function _0x1ac2a9(_0x588cde = {}) {
    const _0x46f1c6 = new Set([_0x3ffeb1.data, ..._0x52afbd.values(), ...(Array.isArray(_0x3ffeb1.projects) ? _0x3ffeb1.projects.map(_0x28a28f => _0x28a28f?.data) : [])]);
    let _0x5b5935 = false;
    for (const _0x2fb997 of _0x46f1c6) {
      if (!_0x2fb997?.project) {
        continue;
      }
      const _0x497d5d = _0x2fb997 === _0x3ffeb1.data ? new Set(normalizeStoryClipFrames(_0x2fb997.clipFrames).map(_0x2770c8 => _0x2770c8.id)) : null;
      const _0x35a09e = clearDeletedStoryCanvasBindings(_0x2fb997, _0x588cde);
      if (_0x35a09e && _0x497d5d) {
        const _0x11560b = new Set(normalizeStoryClipFrames(_0x2fb997.clipFrames).map(_0x36d661 => _0x36d661.id));
        _0x497d5d.forEach(_0x2dd28f => {
          if (!_0x11560b.has(_0x2dd28f)) {
            _0x492090(_0x2dd28f);
          }
        });
      }
      _0x5b5935 = _0x35a09e || _0x5b5935;
    }
    if (_0x5b5935) {
      _0x35e390();
      if (_0x4f8626 && _0x3ffeb1.view === "episode") {
        if (!_0x3ec4f9({
          refreshContent: true
        })) {
          _0xe5dd9c();
        }
      }
      _0x3c4e04({
        immediate: true
      });
    }
    return _0x5b5935;
  }
  function _0xa86e33(_0x268d51 = {}) {
    const _0x570689 = new Set([_0x3ffeb1.data, ..._0x52afbd.values(), ...(Array.isArray(_0x3ffeb1.projects) ? _0x3ffeb1.projects.map(_0x23e36c => _0x23e36c?.data) : [])]);
    let _0x1b1325 = false;
    let _0x365d52 = false;
    for (const _0x5839ff of _0x570689) {
      if (!_0x5839ff?.project) {
        continue;
      }
      const _0x591277 = _0x5839ff === _0x3ffeb1.data;
      const _0x50e677 = _0x591277 ? getSelectedEpisode(_0x3ffeb1) : _0x5839ff.episodes?.[0] || null;
      const _0x557790 = _0x591277 ? getSelectedClip(_0x3ffeb1, _0x50e677) : _0x50e677?.clips?.[0] || null;
      const _0x166f74 = reconcileStoryCanvasMediaNodes(_0x5839ff, {
        ..._0x268d51,
        episodeId: _0x50e677?.id,
        clipId: _0x557790?.id
      });
      _0x1b1325 = _0x166f74 || _0x1b1325;
      _0x365d52 = _0x166f74 && _0x591277 || _0x365d52;
    }
    if (!_0x1b1325) {
      return false;
    }
    if (_0x365d52) {
      _0x35e390();
      if (_0x4f8626 && _0x3ffeb1.view === "episode") {
        if (!_0x3ec4f9({
          refreshContent: true
        })) {
          _0xe5dd9c();
        }
      }
    }
    _0x3c4e04({
      immediate: true
    });
    return true;
  }
  function _0xb7606d() {
    Object.assign(_0x3ffeb1, deriveStoryProjectTaskState());
    _0x3ffeb1.exportingAssetAppearanceKey = "";
  }
  function _0x14d6f1(_0x471ccc = _0x3ffeb1.data) {
    reconcileStoryClipVideoBackgroundTasks(_0x471ccc);
    _0xb7606d();
    Object.assign(_0x3ffeb1, deriveStoryProjectTaskState(_0x471ccc));
    if (_0x3ffeb1.characterVoiceEditor) {
      _0x3ffeb1.characterVoiceEditor.isGenerating = isStoryAssetVoiceLoading(_0x3ffeb1, _0x3ffeb1.characterVoiceEditor.assetId);
    }
  }
  function _0x257e7e(_0x4d6d39) {
    const _0x13082e = normalizeText(_0x4d6d39);
    if (!_0x13082e) {
      return false;
    }
    for (const [_0x55f1be, _0x2accc9] of _0x1da07b) {
      if (!_0x55f1be.startsWith(_0x13082e + ":")) {
        continue;
      }
      _0x2accc9.pause();
      _0x1da07b.delete(_0x55f1be);
    }
    for (const _0x19f30c of _0x1442b1) {
      if (_0x19f30c.startsWith(_0x13082e + ":")) {
        _0x1442b1.delete(_0x19f30c);
      }
    }
    for (const _0x4b8598 of _0x3ad0c2) {
      if (_0x4b8598.startsWith(_0x13082e + ":")) {
        _0x3ad0c2.delete(_0x4b8598);
      }
    }
    _0x5f32e0.delete(_0x13082e);
    for (const _0x451c79 of _0x30e879.keys()) {
      if (_0x451c79.startsWith(_0x13082e + ":")) {
        _0x30e879.delete(_0x451c79);
      }
    }
    _0x52afbd.delete(_0x13082e);
    advanceStoryProjectSession(_0x3ffeb1, _0x13082e);
    return true;
  }
  function _0x3acba7({
    invalidateCurrentProject = false
  } = {}) {
    const _0x16da41 = normalizeText(_0x3ffeb1.data?.project?.id);
    if (invalidateCurrentProject) {
      _0x257e7e(_0x16da41);
    }
    _0x25f8df({
      clearState: true
    });
    _0xb7606d();
    return createStoryProjectTaskToken(_0x3ffeb1);
  }
  function _0x2e0a71(_0x18cd0f = _0x3ffeb1.data) {
    const _0x469cee = normalizeText(_0x18cd0f?.project?.id);
    const _0x5324a2 = _0x3ffeb1.projects.find(_0x31b89d => normalizeText(_0x31b89d?.id || _0x31b89d?.data?.project?.id) === _0x469cee);
    const _0x3e663d = createStoryProjectTaskToken({
      ..._0x3ffeb1,
      data: _0x18cd0f
    });
    _0x3e663d.projectTitleEdited = _0x18cd0f === _0x3ffeb1.data ? _0x3ffeb1.projectTitleEdited === true : _0x5324a2?.projectTitleEdited === true;
    return _0x3e663d;
  }
  function _0x59fa6e(_0x5b59b7) {
    return isStoryProjectTaskTokenCurrent(_0x3ffeb1, _0x5b59b7) && !_0x1de79f;
  }
  function _0x2c064b(_0x12d5d0) {
    return isStoryProjectTaskTokenLive(_0x3ffeb1, _0x12d5d0) && !_0x1de79f;
  }
  function _0x1b50be(_0x4a86ee) {
    const _0x2d918a = normalizeText(_0x4a86ee?.projectId);
    if (!_0x2d918a || !_0x4a86ee?.data?.project) {
      return false;
    }
    _0x52afbd.set(_0x2d918a, _0x4a86ee.data);
    return true;
  }
  function _0x24d502(_0x9fd2ec, _0x146703) {
    const _0x54faa1 = normalizeText(_0x9fd2ec?.projectId);
    const _0x4155e0 = normalizeText(_0x146703);
    if (_0x54faa1 && _0x4155e0) {
      return _0x54faa1 + ":" + _0x4155e0;
    } else {
      return "";
    }
  }
  function _0x39491b(_0x3cc884) {
    const _0x5e2aff = normalizeText(_0x3cc884?.projectId);
    const _0x144157 = _0x3cc884?.data;
    if (!_0x5e2aff || !_0x144157?.project) {
      return false;
    }
    _0x1b50be(_0x3cc884);
    const _0xd2ed8c = _0x3ffeb1.projects.findIndex(_0x12ac57 => normalizeText(_0x12ac57?.id || _0x12ac57?.data?.project?.id) === _0x5e2aff);
    const _0x4d3c01 = _0xd2ed8c >= 0 ? _0x3ffeb1.projects[_0xd2ed8c] : {};
    const _0x3daece = _0x59fa6e(_0x3cc884);
    const _0x3cb12a = _0x3daece && _0x3ffeb1.view !== "home" ? createStoryProjectUiState(_0x3ffeb1) : _0x5d0718(_0x4d3c01.ui || (_0x3daece ? createStoryProjectUiState(_0x3ffeb1) : {}));
    const _0x455d30 = {
      ..._0x4d3c01,
      id: _0x5e2aff,
      title: _0x144157.project.title,
      createdAt: Number(_0x4d3c01.createdAt || 0) || Date.now(),
      updatedAt: Date.now(),
      projectTitleEdited: _0x3daece ? _0x3ffeb1.projectTitleEdited === true : _0x3cc884.projectTitleEdited === true || _0x4d3c01.projectTitleEdited === true,
      ui: _0x3cb12a,
      data: _0x5d0718(_0x144157)
    };
    if (_0xd2ed8c >= 0) {
      _0x3ffeb1.projects[_0xd2ed8c] = _0x455d30;
    } else {
      _0x3ffeb1.projects.unshift(_0x455d30);
    }
    return true;
  }
  function _0x49d70e(_0x529e93, {
    refreshHome = false
  } = {}) {
    _0x39491b(_0x529e93);
    _0x3c4e04({
      immediate: true
    });
    if (refreshHome && _0x3ffeb1.view === "home" && !_0x1de79f) {
      _0xe5dd9c({
        capturePageState: false
      });
    }
  }
  function _0x4ba4d1(_0x1653c7, _0x5e1c2e = {}, {
    refreshHome = true
  } = {}) {
    if (!_0x1653c7?.data?.project) {
      return null;
    }
    _0x1b50be(_0x1653c7);
    const _0x291b41 = startStoryBackgroundTask(_0x1653c7.data, _0x5e1c2e);
    const _0x39df34 = _0x24d502(_0x1653c7, _0x291b41?.id || _0x5e1c2e.id);
    if (_0x39df34) {
      _0x1442b1.add(_0x39df34);
    }
    _0x49d70e(_0x1653c7, {
      refreshHome: refreshHome
    });
    return _0x291b41;
  }
  function _0x1dc293(_0x4cd157, _0x181364, _0x5f493e = {}, {
    refreshHome = true
  } = {}) {
    if (!_0x4cd157?.data?.project) {
      return null;
    }
    const _0x26123f = updateStoryBackgroundTask(_0x4cd157.data, _0x181364, _0x5f493e);
    if (_0x26123f) {
      _0x49d70e(_0x4cd157, {
        refreshHome: refreshHome
      });
    }
    return _0x26123f;
  }
  function _0x38ed49(_0x27e68a, _0x5cba21, _0xc1b9ba = {}) {
    if (!_0x27e68a?.data?.project) {
      return 0;
    }
    const _0x299bfe = updateStoryBackgroundTaskBatch(_0x27e68a.data, _0x5cba21, _0xc1b9ba);
    if (_0x299bfe) {
      _0x49d70e(_0x27e68a, {
        refreshHome: true
      });
    }
    return _0x299bfe;
  }
  function _0x2826d4(_0xe3380, _0x4e29a0 = {}) {
    const _0x2bf5d0 = normalizeText(_0x3ffeb1.data?.project?.id) || "project";
    _0x181c81 += 1;
    return {
      ..._0x5d0718(_0x4e29a0),
      id: (normalizeText(_0xe3380) || "batch") + ":" + _0x2bf5d0 + ":" + Date.now() + ":" + _0x181c81,
      type: normalizeText(_0xe3380) || "batch",
      total: Math.max(0, Math.trunc(Number(_0x4e29a0.total) || 0)),
      completed: Math.max(0, Math.trunc(Number(_0x4e29a0.completed) || 0)),
      label: normalizeText(_0x4e29a0.label)
    };
  }
  function _0x18b12d(_0x58eec5, _0x217068, _0x1a9aeb = {}) {
    if (!_0x217068?.id) {
      return null;
    }
    Object.assign(_0x217068, _0x5d0718(_0x1a9aeb));
    _0x38ed49(_0x58eec5, _0x217068.id, _0x217068);
    return _0x217068;
  }
  function _0x450b2c(_0xadc90f, _0x222a19, _0x516e67 = {}, {
    refreshHome = true
  } = {}) {
    if (!_0xadc90f?.data?.project) {
      return null;
    }
    const _0x47dbfe = finishStoryBackgroundTask(_0xadc90f.data, _0x222a19, _0x516e67);
    if (_0x47dbfe) {
      _0x49d70e(_0xadc90f, {
        refreshHome: refreshHome
      });
    }
    const _0x1d7c48 = _0x24d502(_0xadc90f, _0x222a19);
    if (_0x1d7c48) {
      _0x1442b1.delete(_0x1d7c48);
    }
    return _0x47dbfe;
  }
  function _0x1dbf14() {
    syncStoryCharacterVoicePlayerPreviewUi(_0x3b5272, {
      audioEl: _0x1203ba,
      assetId: _0x57215f
    });
  }
  function _0x5e3c9b(_0x106246) {
    ["play", "pause", "timeupdate", "loadedmetadata", "durationchange", "ended"].forEach(_0x543a9a => _0x106246.addEventListener(_0x543a9a, _0x1dbf14));
  }
  function _0x493da1() {
    _0x21e6b3.invalidate();
    if (_0x1203ba) {
      try {
        _0x1203ba.pause?.();
        _0x1203ba.currentTime = 0;
      } catch {}
    }
    _0x57215f = "";
    _0x1dbf14();
  }
  async function _0x3affd1(_0x456a8e, _0x3f5957 = null) {
    const _0x5b2fc3 = findStoryAsset(_0x3ffeb1, _0x456a8e);
    const _0x176108 = normalizeStoryCharacterVoiceReference(_0x3f5957 || _0x5b2fc3?.voiceReference);
    const _0x49efdb = normalizeText(_0x176108?.audioUrl || _0x176108?.localPath);
    if (!_0x49efdb) {
      _0x1ce8f7("当前角色还没有声音参考。", "warn");
      return;
    }
    let _0x3d0a6f = null;
    let _0x31167a = null;
    let _0x1ba364 = false;
    try {
      _0x3b5272.querySelectorAll("[data-story-character-voice-audio]").forEach(_0xafecb2 => {
        _0xafecb2.pause?.();
      });
      const _0x186e52 = _0x1203ba && _0x4823d1 === _0x49efdb && _0x57215f === _0x456a8e;
      if (_0x186e52 && _0x1203ba.paused === false) {
        _0x1203ba.pause?.();
        _0x1dbf14();
        return;
      }
      if (!_0x186e52) {
        _0x493da1();
      }
      if (!_0x1203ba || _0x4823d1 !== _0x49efdb) {
        _0x1203ba = documentObject.createElement("audio");
        _0x1203ba.preload = "auto";
        _0x4823d1 = _0x49efdb;
        _0x5e3c9b(_0x1203ba);
        _0x1ba364 = true;
      }
      _0x3d0a6f = _0x1203ba;
      _0x31167a = _0x21e6b3.begin({
        assetId: _0x456a8e,
        source: _0x49efdb,
        audioEl: _0x3d0a6f
      });
      if (_0x1ba364) {
        await attachMediaElementPlaybackSource(_0x3d0a6f, _0x49efdb, {
          preload: "auto",
          shouldAssign: () => _0x21e6b3.isCurrent(_0x31167a)
        });
      }
      if (!_0x21e6b3.isCurrent(_0x31167a)) {
        return;
      }
      if (_0x3d0a6f.ended) {
        _0x3d0a6f.currentTime = 0;
      }
      _0x57215f = _0x456a8e;
      _0x1dbf14();
      const _0x428173 = _0x3d0a6f.play?.();
      if (_0x428173 && typeof _0x428173.then === "function") {
        await _0x428173;
      }
      if (!_0x21e6b3.isCurrent(_0x31167a)) {
        _0x3d0a6f.pause?.();
        return;
      }
      _0x1dbf14();
    } catch {
      if (_0x31167a && !_0x21e6b3.isCurrent(_0x31167a)) {
        _0x3d0a6f?.pause?.();
        return;
      }
      _0x21e6b3.invalidate();
      _0x1203ba = null;
      _0x4823d1 = "";
      _0x57215f = "";
      _0x1dbf14();
      _0x1ce8f7("声音参考播放失败。", "warn");
    }
  }
  async function _0x54d343(_0x50e3ed, _0x3d9aea) {
    const _0x223fc8 = findStoryAsset(_0x3ffeb1, _0x50e3ed);
    const _0x4e9151 = normalizeStoryCharacterVoiceHistory(_0x223fc8?.voiceReferenceHistory);
    const _0x359963 = _0x4e9151[Math.trunc(Number(_0x3d9aea))];
    if (!_0x359963) {
      _0x1ce8f7("历史音频不可用。", "warn");
      return;
    }
    await _0x3affd1(_0x50e3ed, _0x359963);
  }
  function _0x58254f(_0x6bf624, _0x530fc2) {
    const _0x3932d4 = findStoryAsset(_0x3ffeb1, _0x6bf624);
    if (!_0x3932d4) {
      return;
    }
    const _0x5ad956 = restoreStoryCharacterVoiceHistoryReference(_0x3932d4, _0x530fc2);
    if (!_0x5ad956) {
      _0x1ce8f7("历史音频不可用。", "warn");
      return;
    }
    _0x493da1();
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7("已恢复历史声音参考。", "success");
  }
  function _0x5ea64b(_0x19e279) {
    const _0xaa3295 = findStoryAsset(_0x3ffeb1, _0x19e279);
    if (!_0xaa3295 || _0xaa3295.kind !== "character") {
      _0x1ce8f7("当前角色不可用。", "warn");
      return;
    }
    _0x3ffeb1.characterVoiceEditor = createStoryCharacterVoiceEditorDraft({
      asset: _0xaa3295,
      data: _0x3ffeb1.data
    });
    _0x3ffeb1.characterVoicePanelMotion = "to-voice";
    _0xe5dd9c();
    _0x3c4e04();
    if (_0x5caa71) {
      windowObject.clearTimeout(_0x5caa71);
    }
    _0x5caa71 = windowObject.setTimeout(() => {
      if (_0x3ffeb1.characterVoicePanelMotion === "to-voice") {
        _0x3ffeb1.characterVoicePanelMotion = "";
        if (_0x4f8626 && _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
          _0xe5dd9c();
        }
      }
      _0x5caa71 = null;
    }, 560);
  }
  function _0x1aa4fd() {
    if (!_0x3ffeb1.characterVoiceEditor) {
      return;
    }
    _0x3ffeb1.pendingCharacterVoiceAssetId = "";
    _0x3ffeb1.characterVoicePanelMotion = "to-asset";
    _0xe5dd9c();
    if (_0x5caa71) {
      windowObject.clearTimeout(_0x5caa71);
    }
    _0x5caa71 = windowObject.setTimeout(() => {
      if (_0x3ffeb1.characterVoicePanelMotion === "to-asset") {
        _0x3ffeb1.characterVoiceEditor = null;
        _0x3ffeb1.characterVoicePanelMotion = "";
        _0x3c4e04();
        if (_0x4f8626 && _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
          _0xe5dd9c();
        }
      }
      _0x5caa71 = null;
    }, 560);
  }
  async function _0x35e8b2({
    asset: _0x4162a8,
    editor: _0x1f8608,
    installId = "",
    projectToken = createStoryProjectTaskToken(_0x3ffeb1),
    batch = null
  } = {}) {
    const _0x1a7252 = getStoryCharacterVoiceWorkflow(_0x1f8608?.nodeData?.model);
    const _0x32eac4 = buildStoryBackgroundTaskId("asset-voice", {
      assetId: _0x4162a8?.id
    });
    _0x4ba4d1(projectToken, {
      id: _0x32eac4,
      type: "asset-voice",
      scope: {
        assetId: _0x4162a8?.id
      },
      label: "生成" + (normalizeText(_0x4162a8?.name) || "角色") + "声音",
      message: "正在等待声音生成结果",
      modelId: _0x1a7252?.key,
      provider: _0x1a7252?.provider,
      executionId: _0x1a7252?.executionId,
      batch: batch
    });
    try {
      const _0x3eb4c6 = await generateStoryCharacterVoice({
        asset: _0x4162a8,
        editor: _0x1f8608,
        installId: installId,
        onTaskMeta: ({
          taskId: _0x4d5eb3,
          payload: _0x17f375,
          workflow: _0x37c2c2
        } = {}) => {
          const _0x2884f4 = normalizeText(_0x4d5eb3);
          if (!_0x2884f4 || !_0x2c064b(projectToken)) {
            return;
          }
          const _0x5161f7 = Boolean(_0x37c2c2?.adapterType === "workflow" || ["runninghub", "runninghubwf"].includes(normalizeText(_0x17f375?.provider)));
          _0x1dc293(projectToken, _0x32eac4, {
            status: "running",
            message: "声音任务已提交，正在等待结果",
            resumable: _0x5161f7,
            remoteTaskId: _0x2884f4,
            resumePayload: sanitizeStoryTaskResumePayload(_0x17f375)
          });
        }
      });
      if (_0x2c064b(projectToken)) {
        _0x450b2c(projectToken, _0x32eac4, {
          status: "succeeded",
          message: "角色声音生成完成"
        });
      }
      return _0x3eb4c6;
    } catch (_0xc2b855) {
      if (_0x2c064b(projectToken)) {
        _0x450b2c(projectToken, _0x32eac4, {
          status: "failed",
          message: "角色声音生成失败",
          error: _0xc2b855?.message || "声音参考生成失败。"
        });
      }
      throw _0xc2b855;
    }
  }
  async function _0x11165e() {
    const _0x1c6396 = _0x3ffeb1.characterVoiceEditor;
    const _0x5f59ec = findStoryAsset(_0x3ffeb1, _0x1c6396?.assetId);
    if (!_0x1c6396 || !_0x5f59ec || isStoryAssetVoiceLoading(_0x3ffeb1, _0x5f59ec.id)) {
      return;
    }
    const _0x4703fc = getStoryCharacterVoiceWorkflow(_0x1c6396.nodeData?.model);
    if (!_0x4703fc) {
      _0x1c6396.error = "当前没有可用的音频模型。";
      _0xe5dd9c();
      return;
    }
    if (false) {
      const _0x2f91f0 = windowObject?.isModelAllowedBySubscription;
      const _0x15341e = typeof _0x2f91f0 === "function" ? _0x2f91f0(_0x4703fc.key, _0x4703fc.provider) : true;
      if (!_0x15341e) {
        windowObject?.openSubscriptionDialog?.({
          modelId: _0x4703fc.key,
          provider: _0x4703fc.provider
        });
        return;
      }
    }
    const _0xfbfe2 = createStoryProjectTaskToken(_0x3ffeb1);
    setStoryAssetVoiceGenerating(_0x3ffeb1, _0x5f59ec.id, true);
    _0x1c6396.isGenerating = true;
    _0x1c6396.error = "";
    _0xe5dd9c();
    try {
      const _0x3b56da = _0x4703fc.vip === true && typeof windowObject?.ensureSubscriptionInstallId === "function" ? await windowObject.ensureSubscriptionInstallId() : windowObject?.__aicInstallId || "";
      if (!_0x2c064b(_0xfbfe2)) {
        return false;
      }
      const _0x5beb95 = await _0x35e8b2({
        asset: _0x5f59ec,
        editor: _0x1c6396,
        installId: _0x3b56da,
        projectToken: _0xfbfe2
      });
      if (!_0x2c064b(_0xfbfe2)) {
        return false;
      }
      if (!_0x5beb95) {
        throw new Error("音频模型没有返回可用的声音结果。");
      }
      if (_0x59fa6e(_0xfbfe2)) {
        _0x493da1();
      }
      replaceStoryCharacterVoiceReference(_0x5f59ec, _0x5beb95);
      _0x1c6396.error = "";
      _0x3c4e04({
        immediate: true
      });
      _0xf62208("角色声音参考已生成。", "success", _0xfbfe2, {
        step: 2,
        assetId: _0x5f59ec.id
      });
      return true;
    } catch (_0x5bccd5) {
      if (!_0x2c064b(_0xfbfe2)) {
        return false;
      }
      _0x1c6396.error = _0x5bccd5?.message || "声音参考生成失败。";
      const _0x3dff12 = _0x500b30(_0x5bccd5, {
        provider: _0x4703fc.provider,
        modelId: _0x4703fc.key
      });
      if (!_0x3dff12) {
        _0x847d75(_0x1c6396.error, "error", _0x5bccd5);
      }
      return false;
    } finally {
      if (_0x59fa6e(_0xfbfe2)) {
        setStoryAssetVoiceGenerating(_0x3ffeb1, _0x5f59ec.id, false);
        _0x1c6396.isGenerating = false;
        _0xe5dd9c();
      }
    }
  }
  function _0x2a522f(_0xe794cf) {
    return findStoryAssetForHover(_0x3ffeb1, _0xe794cf, getVisibleStoryAssets(_0x3ffeb1));
  }
  function _0x2e055f(_0x11e0a3) {
    if (!_0x11e0a3) {
      return;
    }
    const _0x1b8b04 = isStoryAssetHoverLandscape(_0x11e0a3.naturalWidth, _0x11e0a3.naturalHeight);
    _0x11e0a3.closest(".story-asset-hover-preview-item")?.classList.toggle("is-landscape", _0x1b8b04);
    _0x11e0a3.closest(".story-asset-hover-preview-cell")?.classList.toggle("is-landscape", _0x1b8b04);
    if (_0x1c2041?.classList.contains("is-visible")) {
      _0x316991();
    }
  }
  function _0x442e95() {
    _0x1c2041?.querySelectorAll("[data-story-asset-hover-image]").forEach(_0x26fdfa => {
      if (_0x26fdfa.complete && Number(_0x26fdfa.naturalWidth) > 0) {
        _0x2e055f(_0x26fdfa);
        return;
      }
      _0x26fdfa.addEventListener("load", () => _0x2e055f(_0x26fdfa), {
        once: true
      });
    });
  }
  function _0x3614f0(_0x12f651, _0x25be50 = "") {
    if (!_0x1c2041 || !_0x12f651) {
      return false;
    }
    const _0x4a4d6a = getSelectedAssetAppearance(_0x3ffeb1, _0x12f651);
    const _0x1dd03d = buildStoryAssetHoverPreviewContent(_0x12f651, {
      appearanceId: _0x25be50,
      selectedAssetId: _0x3ffeb1.selectedAssetId,
      selectedAppearanceId: _0x4a4d6a?.id
    });
    if (!_0x1dd03d) {
      _0x1c2041.innerHTML = "";
      _0x1c2041.dataset.assetId = "";
      _0x1c2041.dataset.signature = "";
      return false;
    }
    const _0xe3bdcf = normalizeText(_0x25be50) + ":" + (_0x4a4d6a?.id || "") + ":" + (_0x12f651.baseAppearanceId || "") + ":" + _0x1dd03d.hasVoice + "|" + _0x1dd03d.appearances.map(_0x48f365 => (_0x48f365?.id || "") + ":" + normalizeText(_0x48f365?.imageUrl)).join("|");
    if (_0x1c2041.dataset.assetId === String(_0x12f651.id) && _0x1c2041.dataset.signature === _0xe3bdcf) {
      return true;
    }
    _0x1c2041.dataset.assetId = String(_0x12f651.id);
    _0x1c2041.dataset.signature = _0xe3bdcf;
    _0x1c2041.style.setProperty("--story-asset-hover-columns", String(_0x1dd03d.columns));
    _0x1c2041.innerHTML = _0x1dd03d.html;
    _0x442e95();
    return true;
  }
  function _0x316991() {
    _0x32c8ec = 0;
    if (!_0x1c2041?.classList.contains("is-visible")) {
      return;
    }
    const _0xaf7850 = _0x1c2041.getBoundingClientRect();
    const _0xe2340b = windowObject.innerWidth || documentObject.documentElement?.clientWidth || 1024;
    const _0x114b1e = windowObject.innerHeight || documentObject.documentElement?.clientHeight || 768;
    const _0x1145d7 = 14;
    const _0x466d3f = 10;
    const _0x29392e = Math.max(_0x466d3f, _0xe2340b - _0xaf7850.width - _0x466d3f);
    const _0x18dc46 = Math.max(_0x466d3f, _0x114b1e - _0xaf7850.height - _0x466d3f);
    const _0x1b06a6 = _0x2afd4c?.getBoundingClientRect?.();
    let _0xaafd8b = Math.min(Math.max(_0x466d3f, _0x55a161 + _0x1145d7), _0x29392e);
    let _0x2ff854 = Math.min(Math.max(_0x466d3f, _0x866c9e + _0x1145d7), _0x18dc46);
    if (_0x1b06a6) {
      const _0x5e8537 = _0x1b06a6.right + _0x1145d7;
      const _0x3aaee9 = _0x1b06a6.left - _0xaf7850.width - _0x1145d7;
      if (_0x5e8537 <= _0x29392e) {
        _0xaafd8b = _0x5e8537;
      } else if (_0x3aaee9 >= _0x466d3f) {
        _0xaafd8b = _0x3aaee9;
      } else {
        const _0x1e09dd = _0x1b06a6.bottom + _0x1145d7;
        const _0x2f2e9f = _0x1b06a6.top - _0xaf7850.height - _0x1145d7;
        _0xaafd8b = Math.min(Math.max(_0x466d3f, _0x55a161 - _0xaf7850.width / 2), _0x29392e);
        if (_0x1e09dd <= _0x18dc46) {
          _0x2ff854 = _0x1e09dd;
        } else if (_0x2f2e9f >= _0x466d3f) {
          _0x2ff854 = _0x2f2e9f;
        }
      }
      if (_0xaafd8b === _0x5e8537 || _0xaafd8b === _0x3aaee9) {
        _0x2ff854 = Math.min(Math.max(_0x466d3f, _0x866c9e - 18), _0x18dc46);
      }
    }
    _0x1c2041.style.left = Math.round(_0xaafd8b) + "px";
    _0x1c2041.style.top = Math.round(_0x2ff854) + "px";
  }
  function _0x4d0437(_0x1d50a2) {
    _0x55a161 = Number(_0x1d50a2?.clientX || 0);
    _0x866c9e = Number(_0x1d50a2?.clientY || 0);
    if (_0x32c8ec) {
      return;
    }
    if (typeof windowObject.requestAnimationFrame === "function") {
      _0x32c8ec = windowObject.requestAnimationFrame(_0x316991);
      return;
    }
    _0x316991();
  }
  function _0x51e1c3(_0x2b7fe7, _0x413d09, _0x1e63d5, _0x5c8700 = "") {
    if (!_0x1c2041 || _0x413d09?.pointerType === "touch") {
      return;
    }
    if (!_0x1e63d5) {
      _0x277232();
      return;
    }
    _0x2afd4c = _0x2b7fe7?.closest?.(".at-mention-menu") || null;
    _0x30d9c7 = String(_0x1e63d5.id);
    if (!_0x3614f0(_0x1e63d5, _0x5c8700)) {
      _0x277232();
      return;
    }
    _0x1c2041.classList.add("is-visible");
    _0x1c2041.setAttribute("aria-hidden", "false");
    _0x4d0437(_0x413d09);
  }
  function _0x58b043(_0x836823, _0x1d00d7) {
    if (_0x458ddb?.active || _0x1b2c62) {
      _0x277232();
      return;
    }
    if (_0x836823?.dataset?.storyReferenceSource === "library") {
      const _0x40baa9 = resolveAssetMentionRef({
        assetId: _0x836823.dataset.storyReferenceAsset,
        itemIndex: Math.max(0, Math.trunc(Number(_0x836823.dataset.storyReferenceAssetIndex) || 0))
      });
      const _0x2aac67 = _0x40baa9?.type === "image" ? normalizeText(_0x40baa9.thumbUrl || _0x40baa9.url) : normalizeText(_0x40baa9?.thumbUrl);
      if (!_0x40baa9 || !_0x2aac67) {
        _0x277232();
        return;
      }
      return _0x51e1c3(_0x836823, _0x1d00d7, {
        id: normalizeText(_0x40baa9.assetId),
        kind: "library",
        name: normalizeText(_0x40baa9.name) || "总素材",
        hoverTitle: normalizeText(_0x40baa9.assetName) || "总素材",
        imageUrl: _0x2aac67,
        isLibraryAsset: true
      });
    }
    const _0x2e0b3c = normalizeText(_0x836823?.dataset?.storyReferenceFrame);
    if (_0x2e0b3c) {
      const _0x5b0dfd = normalizeStoryClipFrames(_0x3ffeb1.data.clipFrames).find(_0x38b58f => _0x38b58f.id === _0x2e0b3c);
      return _0x51e1c3(_0x836823, _0x1d00d7, createStoryClipFrameHoverAsset(_0x5b0dfd, getStoryAssetHoverCardId(_0x836823)));
    }
    return _0x51e1c3(_0x836823, _0x1d00d7, _0x2a522f(getStoryAssetHoverCardId(_0x836823)), getStoryAssetHoverCardAppearanceId(_0x836823));
  }
  function _0x277232() {
    _0x30d9c7 = "";
    _0x2afd4c = null;
    _0x1c2041?.classList.remove("is-visible");
    _0x1c2041?.setAttribute("aria-hidden", "true");
  }
  _0x46ef47 = createStoryMediaHistoryMenuController({
    menuElement: _0x5a04a5,
    windowObject: windowObject,
    getMarkup: _0x42290b => {
      if (_0x3ffeb1.clipSelectionMode) {
        return "";
      }
      const _0x25eb55 = getSelectedEpisode(_0x3ffeb1);
      const _0x48ee85 = normalizeText(_0x42290b?.dataset?.storyClipId);
      const _0x17f790 = (Array.isArray(_0x25eb55?.clips) ? _0x25eb55.clips : []).find(_0x507391 => normalizeText(_0x507391?.id) === _0x48ee85);
      if (_0x5a04a5) {
        _0x5a04a5.dataset.storyClipId = _0x48ee85;
      }
      return storyClipProduction.renderEpisode(_0x3ffeb1, _0x25eb55, _0x17f790).videoHistoryMenu;
    }
  });
  function _0x538a96() {
    _0x46ef47?.clearHideTimer();
  }
  function _0x3cb00d(_0x1440f0 = {}) {
    _0x46ef47?.hide(_0x1440f0);
  }
  function _0x58a3da(_0x3d91ff, _0x2955bc) {
    _0x46ef47?.show(_0x3d91ff, {
      event: _0x2955bc
    });
  }
  function _0x35e390() {
    if (!_0x3ffeb1.hasCreatedProject || !_0x3ffeb1.data?.project?.id) {
      return;
    }
    const _0x197ba8 = String(_0x3ffeb1.data.project.id);
    _0x52afbd.set(_0x197ba8, _0x3ffeb1.data);
    const _0x32b4ff = _0x3ffeb1.projects.findIndex(_0xf81615 => String(_0xf81615?.id) === _0x197ba8);
    const _0x4e4c04 = _0x32b4ff >= 0 ? _0x3ffeb1.projects[_0x32b4ff] : {};
    const _0xa821d4 = {
      ..._0x4e4c04,
      id: _0x197ba8,
      title: _0x3ffeb1.data.project.title,
      createdAt: Number(_0x4e4c04.createdAt || 0) || Date.now(),
      updatedAt: Date.now(),
      projectTitleEdited: _0x3ffeb1.projectTitleEdited === true,
      ui: _0x3ffeb1.view === "home" && _0x4e4c04.ui ? _0x5d0718(_0x4e4c04.ui) : createStoryProjectUiState(_0x3ffeb1),
      data: _0x5d0718(_0x3ffeb1.data)
    };
    if (_0x32b4ff >= 0) {
      _0x3ffeb1.projects[_0x32b4ff] = _0xa821d4;
    } else {
      _0x3ffeb1.projects.unshift(_0xa821d4);
    }
  }
  const _0x65309f = createWorkspacePersistenceCoordinator({
    ready: false,
    debounceMs: 500,
    save: saveWorkspace,
    getSnapshot: () => {
      _0x35e390();
      return createStoryWorkspaceSnapshot(_0x3ffeb1);
    },
    setTimeoutFn: windowObject?.setTimeout?.bind?.(windowObject),
    clearTimeoutFn: windowObject?.clearTimeout?.bind?.(windowObject),
    onError: _0x15d7b7 => {
      console.warn("[storyWorkspace] 自动保存失败", _0x15d7b7);
    }
  });
  function _0x434b0f() {
    if (!_0x65309f.isReady() || typeof saveWorkspace !== "function") {
      return Promise.resolve(false);
    }
    return _0x65309f.flush({
      force: true
    }).then(() => true).catch(() => false);
  }
  function _0x3c4e04({
    immediate = false
  } = {}) {
    _0x65309f.schedule({
      immediate: immediate
    });
  }
  function _0x169b59(_0x483345, {
    persist = false,
    layout = null,
    splitter = null
  } = {}) {
    const _0x235587 = layout || _0x4bf4f6.querySelector(".story-page.is-current .story-assets-layout") || _0x4bf4f6.querySelector(".story-assets-layout");
    const _0x3820e6 = splitter || _0x235587?.querySelector?.("[data-story-assets-splitter]");
    _0x3ffeb1.assetSplitRatio = applyStoryAssetSplitRatioToLayout(_0x235587, _0x3820e6, _0x483345);
    if (persist) {
      _0x3c4e04({
        immediate: true
      });
    }
  }
  function _0x5cd9de(_0x1e8e93) {
    const _0x4c6667 = _0x1e8e93.target.closest?.("[data-story-assets-splitter]");
    if (!_0x4c6667) {
      return false;
    }
    const _0x5a5c68 = _0x4c6667.closest(".story-assets-layout");
    return beginStoryHorizontalResizeSession({
      event: _0x1e8e93,
      splitter: _0x4c6667,
      layout: _0x5a5c68,
      windowObject: windowObject,
      body: documentObject.body,
      resizingClass: "story-assets-resizing",
      onRatio: _0x1db061 => {
        _0x169b59(_0x1db061, {
          layout: _0x5a5c68,
          splitter: _0x4c6667
        });
      },
      onFinish: () => _0x3c4e04({
        immediate: true
      })
    });
  }
  function _0x15d395(_0x263fd2, _0x16498b, {
    persist = false,
    layout = null
  } = {}) {
    const _0x2ee48f = layout || _0x4bf4f6.querySelector(".story-page.is-current .story-episode-detail-page") || _0x4bf4f6.querySelector(".story-episode-detail-page");
    const _0x5a2054 = applyStoryEpisodePanelRatiosToLayout(_0x2ee48f, {
      assetSplitter: _0x2ee48f?.querySelector?.("[data-story-episode-splitter=\"assets\"]"),
      previewSplitter: _0x2ee48f?.querySelector?.("[data-story-episode-splitter=\"preview\"]")
    }, _0x263fd2, _0x16498b);
    _0x3ffeb1.episodeAssetPanelRatio = _0x5a2054.left;
    _0x3ffeb1.episodeEditorPanelRatio = _0x5a2054.center;
    if (persist) {
      _0x3c4e04({
        immediate: true
      });
    }
  }
  function _0x56cda3(_0x2abdea) {
    const _0xc61125 = _0x2abdea.target.closest?.("[data-story-episode-splitter]");
    if (!_0xc61125) {
      return false;
    }
    const _0x2c643a = _0xc61125.closest(".story-episode-detail-page");
    const _0x56b23a = _0xc61125.dataset.storyEpisodeSplitter;
    return beginStoryHorizontalResizeSession({
      event: _0x2abdea,
      splitter: _0xc61125,
      layout: _0x2c643a,
      windowObject: windowObject,
      body: documentObject.body,
      resizingClass: "story-episode-resizing",
      onRatio: _0x363d82 => {
        if (_0x56b23a === "assets") {
          _0x15d395(_0x363d82, _0x3ffeb1.episodeEditorPanelRatio, {
            layout: _0x2c643a
          });
        } else {
          _0x15d395(_0x3ffeb1.episodeAssetPanelRatio, _0x363d82 - _0x3ffeb1.episodeAssetPanelRatio, {
            layout: _0x2c643a
          });
        }
      },
      onFinish: () => _0x3c4e04({
        immediate: true
      })
    });
  }
  function _0x3e894e() {
    _0x5867cc.innerHTML = _0x3ffeb1.view === "home" ? "" : renderProjectToolbar(_0x3ffeb1);
  }
  function _0x2ab409(_0x55d665, _0x225119, _0x5b0501) {
    if (!_0x55d665 || _0x55d665.dataset?.promptPillKind === "time") {
      return;
    }
    syncStoryClipPromptPillHoverTarget(_0x55d665);
    _0x55d665.querySelectorAll?.("[data-story-voice-separator], [data-story-voice-toggle]")?.forEach(_0x2175c9 => _0x2175c9.remove());
    _0x55d665.classList?.remove("has-story-voice-reference", "is-story-voice-enabled");
    const _0x57d1d0 = getSelectedEpisode(_0x3ffeb1);
    const _0x1e07e2 = getStoryAssetIdFromMentionNodeId(_0x55d665.dataset?.assetId);
    const _0x2be31a = resolveStoryVideoReplicationClipVoiceAssetIds(_0x3ffeb1.data, _0x5b0501);
    if (_0x2be31a && !_0x2be31a.includes(_0x1e07e2)) {
      setStoryClipMentionVoiceEnabled(_0x55d665, _0x3ffeb1.data.assets, false);
      return;
    }
    const _0x1e3abf = getStoryEpisodeCharacterVoiceEnabled(_0x57d1d0, _0x1e07e2);
    if (typeof _0x1e3abf === "boolean") {
      setStoryClipMentionVoiceEnabled(_0x55d665, _0x3ffeb1.data.assets, _0x1e3abf);
    }
    const _0x1b4acc = getStoryClipMentionVoiceState(_0x55d665, _0x3ffeb1.data.assets, {
      voiceEnabled: _0x1e3abf
    });
    if (!_0x1b4acc.available) {
      setStoryClipMentionVoiceEnabled(_0x55d665, _0x3ffeb1.data.assets, false);
      return;
    }
    _0x55d665.classList?.add("has-story-voice-reference");
    _0x55d665.classList?.toggle("is-story-voice-enabled", _0x1b4acc.enabled);
    const _0x4656cb = documentObject.createElement("span");
    _0x4656cb.className = "story-voice-pill-separator";
    _0x4656cb.dataset.storyVoiceSeparator = "true";
    _0x4656cb.setAttribute("aria-hidden", "true");
    _0x4656cb.setAttribute("contenteditable", "false");
    _0x4656cb.textContent = "·";
    const _0x45eb4b = documentObject.createElement("button");
    _0x45eb4b.type = "button";
    _0x45eb4b.className = "story-voice-pill-toggle" + (_0x1b4acc.enabled ? " is-active" : "");
    _0x45eb4b.dataset.storyVoiceToggle = "true";
    _0x45eb4b.setAttribute("contenteditable", "false");
    _0x45eb4b.setAttribute("aria-pressed", String(_0x1b4acc.enabled));
    _0x45eb4b.setAttribute("aria-label", _0x1b4acc.enabled ? "关闭角色声音参考" : "启用角色声音参考");
    _0x45eb4b.innerHTML = renderStoryVoiceIcon(false);
    _0x45eb4b.addEventListener("mousedown", _0x1b28b2 => {
      _0x1b28b2.preventDefault();
      _0x1b28b2.stopPropagation();
    });
    _0x45eb4b.addEventListener("click", _0x26b143 => {
      _0x26b143.preventDefault();
      _0x26b143.stopPropagation();
      const _0x520c3b = getStoryEpisodeCharacterVoiceEnabled(_0x57d1d0, _0x1e07e2);
      const _0x7e1b24 = getStoryClipMentionVoiceState(_0x55d665, _0x3ffeb1.data.assets, {
        voiceEnabled: _0x520c3b
      });
      const _0x4ee170 = !_0x7e1b24.enabled;
      setStoryEpisodeCharacterVoiceEnabled(_0x57d1d0, _0x1e07e2, _0x4ee170);
      _0x225119.querySelectorAll?.(".ref-pill")?.forEach(_0x5b18b7 => {
        if (getStoryAssetIdFromMentionNodeId(_0x5b18b7.dataset?.assetId) !== _0x1e07e2) {
          return;
        }
        setStoryClipMentionVoiceEnabled(_0x5b18b7, _0x3ffeb1.data.assets, _0x4ee170);
        _0x2ab409(_0x5b18b7, _0x225119, _0x5b0501);
      });
      _0x5b0501.prompt = sanitizePromptHtmlForCommit(_0x225119.innerHTML);
      _0x1881c3();
      _0x3c4e04({
        immediate: true
      });
    });
    _0x55d665.appendChild(_0x4656cb);
    _0x55d665.appendChild(_0x45eb4b);
  }
  function _0xf31985() {
    const _0x56642d = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
    const _0x20cfd8 = _0x56642d ? getSelectedAssetAppearance(_0x3ffeb1, _0x56642d) : null;
    return {
      asset: _0x56642d,
      appearance: _0x20cfd8
    };
  }
  function _0x10c6aa(_0x3dfb76) {
    const _0x43440d = getStoryAssetPromptEditorContext(_0x3ffeb1, _0x3dfb76);
    if (!_0x3dfb76 || !_0x43440d.asset || !_0x43440d.appearance || _0x43440d.asset.isLibraryAsset) {
      return null;
    }
    return {
      nodeId: "story-asset-prompt:" + _0x43440d.asset.id,
      promptEl: _0x3dfb76,
      _data: {
        type: "ai-image",
        model: _0x3ffeb1.models.image,
        provider: _0x3ffeb1.imageProvider
      },
      getMentionCandidates: ({
        query = ""
      } = {}) => {
        const {
          asset: _0x4e8baa,
          appearance: _0x53921b
        } = getStoryAssetPromptEditorContext(_0x3ffeb1, _0x3dfb76);
        if (!_0x4e8baa || !_0x53921b || _0x4e8baa.isLibraryAsset || !isStoryAssetBaseAppearance(_0x4e8baa, _0x53921b)) {
          return [];
        }
        const _0x50d2db = buildStoryAssetStyleReferenceMentionCandidate(_0x53921b, {
          query: query
        });
        if (_0x50d2db) {
          return [_0x50d2db];
        } else {
          return [];
        }
      },
      getMentionVisual: ({
        mention: _0x466d63
      } = {}) => ({
        thumbUrl: normalizeText(_0x466d63?.thumbUrl),
        iconType: "image"
      }),
      decorateMentionPill: ({
        pill: _0x5e9d58
      } = {}) => {
        _0x5e9d58?.classList?.add("story-asset-style-reference-pill");
        if (_0x5e9d58?.dataset) {
          _0x5e9d58.dataset.promptPillKind = STORY_ASSET_STYLE_REFERENCE_PILL_KIND;
        }
      },
      commitPromptHtml: () => {
        if (updateStoryAssetPromptFromEditor(_0x3ffeb1, _0x3dfb76)) {
          _0x3c4e04();
        }
      },
      getPromptHtml: () => {
        const {
          appearance: _0x25c398
        } = getStoryAssetPromptEditorContext(_0x3ffeb1, _0x3dfb76);
        return _0x25c398?.prompt || "";
      }
    };
  }
  function _0x2337a2(_0x53040e) {
    const _0x4ec921 = getSelectedEpisode(_0x3ffeb1);
    const _0x596978 = getSelectedClip(_0x3ffeb1, _0x4ec921);
    if (!_0x53040e || !_0x4ec921 || !_0x596978) {
      return null;
    }
    return {
      nodeId: "story-clip:" + _0x596978.id,
      promptEl: _0x53040e,
      keepAssetMentionPills: true,
      _data: {
        type: "ai-video",
        model: _0x3ffeb1.models.video,
        provider: _0x3ffeb1.videoProvider,
        generationParams: _0x3ffeb1.videoGenerationParams
      },
      getMentionMenuPages: () => [{
        id: "assets",
        label: "素材",
        icon: "assets"
      }, {
        id: "tools",
        label: "工具",
        icon: "tools"
      }],
      getMentionMenuDefaultPage: () => "assets",
      getMentionCandidates: ({
        query = ""
      } = {}) => buildStoryClipMentionCandidates({
        assets: _0x3ffeb1.data.assets,
        episode: _0x4ec921,
        libraryCandidates: getAssetMentionCandidates(),
        clipFrames: _0x3ffeb1.data.clipFrames,
        query: query,
        includeTime: true,
        includeClipFrames: true,
        defaultDuration: _0x596978.duration
      }).map(_0x40557a => _0x40557a.pillKind === "time" ? {
        ..._0x40557a,
        thumbNode: createStoryClipTimeMentionIcon(documentObject)
      } : _0x40557a),
      onMentionCandidateHover: ({
        candidate: _0x35726e,
        item: _0x17ad27,
        event: _0x5bd5a8
      } = {}) => {
        const _0x13bf26 = normalizeText(_0x35726e?.storyClipFrameId);
        if (_0x13bf26 && _0x17ad27) {
          const _0x59fbc7 = normalizeStoryClipFrames(_0x3ffeb1.data.clipFrames).find(_0x4619c9 => _0x4619c9.id === _0x13bf26);
          const _0x30bf51 = resolveStoryClipFrameImageUrl(_0x59fbc7);
          if (!_0x59fbc7 || !_0x30bf51) {
            _0x277232();
            return;
          }
          _0x51e1c3(_0x17ad27, _0x5bd5a8, {
            id: "story-clip-frame-preview:" + _0x59fbc7.id,
            kind: "clip-frame",
            name: normalizeText(_0x35726e.subtitle || _0x59fbc7.name) || "视频提取帧",
            hoverTitle: normalizeText(_0x35726e.label) || "片段帧",
            imageUrl: _0x30bf51,
            isLibraryAsset: true
          });
          return;
        }
        const _0x20957b = normalizeText(_0x35726e?.storyAssetId);
        const _0x380b9d = normalizeText(_0x35726e?.storyAppearanceId);
        if (!_0x20957b || !_0x17ad27) {
          _0x277232();
          return;
        }
        _0x17ad27.dataset.storyAssetHoverId = _0x20957b;
        if (_0x380b9d) {
          _0x17ad27.dataset.storyAssetHoverAppearanceId = _0x380b9d;
        } else {
          delete _0x17ad27.dataset.storyAssetHoverAppearanceId;
        }
        _0x58b043(_0x17ad27, _0x5bd5a8);
      },
      onMentionCandidateHoverEnd: () => _0x277232(),
      getMentionVisual: ({
        mention: _0x5eb657,
        pill: _0x1f322d
      } = {}) => {
        const _0x9b597c = normalizeText(_0x5eb657?.pillKind || _0x1f322d?.dataset?.promptPillKind);
        if (_0x9b597c === "time") {
          return {
            thumbNode: createStoryClipTimeMentionIcon(documentObject)
          };
        }
        if (_0x5eb657?.storyAssetId) {
          return {
            thumbUrl: normalizeText(_0x5eb657.thumbUrl),
            iconType: "image"
          };
        }
        const _0x1472bf = resolveStoryClipFrameMentionRef({
          dataset: {
            assetId: _0x5eb657?.assetId || _0x1f322d?.dataset?.assetId
          }
        }, _0x3ffeb1.data.clipFrames);
        if (_0x1472bf) {
          return {
            thumbUrl: normalizeText(_0x1472bf.thumbUrl || _0x1472bf.url),
            iconType: "image"
          };
        }
        const _0x14fe97 = resolveStoryClipAssetMentionRef(_0x1f322d, _0x3ffeb1.data.assets);
        if (!_0x14fe97) {
          return null;
        }
        return {
          thumbUrl: normalizeText(_0x14fe97.thumbUrl || _0x14fe97.url),
          iconType: "image"
        };
      },
      decorateMentionPill: ({
        pill: _0x2bb846
      } = {}) => {
        _0x2ab409(_0x2bb846, _0x53040e, _0x596978);
        if (_0x2bb846?.dataset?.refUnresolved === "true") {
          _0x2bb846.setAttribute?.("data-tooltip", "缺少图片素材");
          _0x2bb846.removeAttribute?.("data-native-title");
          _0x2bb846.removeAttribute?.("data-tooltip-source");
          _0x2bb846.removeAttribute?.("title");
        }
      },
      commitPromptHtml: _0x56a904 => {
        _0x596978.prompt = _0x56a904;
        _0x1881c3();
        _0x3c4e04();
      },
      getPromptHtml: () => _0x596978.prompt,
      onPromptPillActivate: ({
        pill: _0xbe3ade
      } = {}) => {
        if (_0xbe3ade?.dataset?.promptPillKind !== "time") {
          return false;
        }
        beginStoryClipTimePillEdit({
          pill: _0xbe3ade,
          documentObject: documentObject,
          onCommit: () => {
            _0x596978.prompt = sanitizePromptHtmlForCommit(_0x53040e.innerHTML);
            _0x3c4e04();
          }
        });
        return true;
      }
    };
  }
  function _0x6da5a0(_0x4d8b9b, {
    assetIndex = 0,
    triggerRange = null
  } = {}) {
    const _0x523571 = findStoryAsset(_0x3ffeb1, _0x4d8b9b);
    const _0x140254 = getSelectedEpisode(_0x3ffeb1);
    const _0x508c8f = getSelectedClip(_0x3ffeb1, _0x140254);
    if (!_0x508c8f) {
      return false;
    }
    const _0x11cb2d = _0x3b5272.querySelector("[data-story-clip-prompt]");
    const _0x1e97c8 = _0x2337a2(_0x11cb2d);
    let _0x1bdf27 = _0x523571 ? buildStoryClipMentionCandidates({
      assets: [_0x523571],
      episode: {
        assetIds: [_0x523571.id]
      }
    })[0] : null;
    if (!_0x1bdf27) {
      _0x1bdf27 = buildStoryClipFrameMentionCandidates(_0x3ffeb1.data.clipFrames, {
        clips: _0x140254?.clips,
        episodeId: _0x140254?.id
      }).flatMap(_0x5ee9ac => _0x5ee9ac.mentionVariants || [_0x5ee9ac]).find(_0x3d1df4 => _0x3d1df4.assetId === normalizeText(_0x4d8b9b) && !_0x3d1df4.limitReason);
    }
    if (!_0x1bdf27) {
      const _0x5708d8 = resolveAssetMentionRef({
        assetId: _0x4d8b9b,
        itemIndex: Math.max(0, Math.trunc(Number(assetIndex) || 0))
      });
      _0x1bdf27 = _0x5708d8 ? buildStoryClipMentionCandidates({
        libraryCandidates: [_0x5708d8]
      })[0] : null;
    }
    if (!_0x1e97c8 || !_0x1bdf27) {
      return false;
    }
    const _0x5b3fa2 = triggerRange ? _insertMentionPill(_0x1e97c8, {
      candidate: _0x1bdf27,
      triggerRange: triggerRange,
      atIndex: triggerRange.startOffset
    }) : Boolean(appendMentionPillToPrompt(_0x1e97c8, _0x1bdf27));
    if (!_0x5b3fa2) {
      return false;
    }
    _0x11cb2d?.focus?.();
    return true;
  }
  function _0x4a9da7(_0x348f65) {
    const _0x388197 = resolveStoryAssetDragPreview(_0x348f65);
    const _0x44ad35 = _0x388197.element;
    if (!_0x44ad35 || !documentObject?.createElement) {
      return null;
    }
    const _0x46ff5f = _0x44ad35.getBoundingClientRect?.() || _0x348f65?.getBoundingClientRect?.() || {};
    const _0x329d23 = Math.max(1, Number(_0x46ff5f.width) || 128);
    const _0xff3161 = Math.max(1, Number(_0x46ff5f.height) || _0x329d23);
    const _0x5e291b = Math.min(160, Math.max(96, _0x329d23));
    const _0x37a7e2 = Math.max(54, Math.round(_0x5e291b * _0xff3161 / _0x329d23));
    const _0x5ae469 = documentObject.createElement("div");
    _0x5ae469.className = "story-asset-drag-preview";
    _0x5ae469.dataset.storyAssetDragMediaType = _0x388197.mediaType;
    _0x5ae469.setAttribute("aria-hidden", "true");
    _0x5ae469.style.width = Math.round(_0x5e291b) + "px";
    _0x5ae469.style.height = Math.round(_0x37a7e2) + "px";
    let _0xbfe199 = null;
    if (_0x388197.url) {
      _0xbfe199 = documentObject.createElement("img");
      _0xbfe199.src = _0x388197.url;
      _0xbfe199.alt = "";
      _0xbfe199.draggable = false;
    } else if (_0x388197.mediaType === "video") {
      const _0x5eb14e = documentObject.createElement("canvas");
      const _0x5d1ee2 = Math.max(1, Math.trunc(Number(_0x44ad35.videoWidth) || _0x329d23));
      const _0x3dae48 = Math.max(1, Math.trunc(Number(_0x44ad35.videoHeight) || _0xff3161));
      _0x5eb14e.width = _0x5d1ee2;
      _0x5eb14e.height = _0x3dae48;
      try {
        const _0xab980a = _0x5eb14e.getContext?.("2d");
        _0xab980a?.drawImage?.(_0x44ad35, 0, 0, _0x5d1ee2, _0x3dae48);
        if (_0xab980a) {
          _0xbfe199 = _0x5eb14e;
        }
      } catch {
        _0xbfe199 = null;
      }
      if (!_0xbfe199 && typeof _0x44ad35.cloneNode === "function") {
        _0xbfe199 = _0x44ad35.cloneNode(true);
        _0xbfe199.muted = true;
        _0xbfe199.removeAttribute?.("controls");
        try {
          _0xbfe199.currentTime = Number(_0x44ad35.currentTime) || 0;
        } catch {}
      }
    } else if (typeof _0x44ad35.cloneNode === "function") {
      _0xbfe199 = _0x44ad35.cloneNode(true);
    }
    if (!_0xbfe199) {
      return null;
    }
    _0x5ae469.appendChild(_0xbfe199);
    documentObject.body?.appendChild?.(_0x5ae469);
    _0xc7f270 = _0x5ae469;
    return _0x5ae469;
  }
  function _0xd4ea45(_0x327762) {
    if (!_0xc7f270) {
      return;
    }
    const _0x32a7da = Number(_0x327762?.clientX) || 0;
    const _0xdee4e3 = Number(_0x327762?.clientY) || 0;
    const _0x5087c4 = _0xc7f270.getBoundingClientRect?.() || {};
    const _0x13cfb4 = Math.max(1, Number(_0x5087c4.width) || Number.parseFloat(_0xc7f270.style.width) || 1);
    const _0x5187a1 = Math.max(1, Number(_0x5087c4.height) || Number.parseFloat(_0xc7f270.style.height) || 1);
    const _0x294412 = Number(windowObject?.innerWidth) || Number.POSITIVE_INFINITY;
    const _0x5a435f = Number(windowObject?.innerHeight) || Number.POSITIVE_INFINITY;
    const _0x3e8b49 = 8;
    let _0x592102 = _0x32a7da + STORY_ASSET_DRAG_PREVIEW_POINTER_GAP;
    let _0x460aa7 = _0xdee4e3 + STORY_ASSET_DRAG_PREVIEW_POINTER_GAP;
    if (_0x592102 + _0x13cfb4 > _0x294412 - _0x3e8b49) {
      _0x592102 = _0x32a7da - _0x13cfb4 - STORY_ASSET_DRAG_PREVIEW_POINTER_GAP;
    }
    if (_0x460aa7 + _0x5187a1 > _0x5a435f - _0x3e8b49) {
      _0x460aa7 = _0xdee4e3 - _0x5187a1 - STORY_ASSET_DRAG_PREVIEW_POINTER_GAP;
    }
    _0x592102 = Math.max(_0x3e8b49, _0x592102);
    _0x460aa7 = Math.max(_0x3e8b49, _0x460aa7);
    _0xc7f270.style.transform = "translate3d(" + _0x592102 + "px, " + _0x460aa7 + "px, 0)";
  }
  function _0x276cd4() {
    _0x1b2c62 = "";
    _0x4929ba = 0;
    _0xc7f270?.remove?.();
    _0xc7f270 = null;
    _0x3a7987();
    _0x3b5272.querySelectorAll(".is-story-asset-dragging").forEach(_0x29a052 => {
      _0x29a052.classList.remove("is-story-asset-dragging");
    });
    _0x3b5272.querySelectorAll(".is-story-asset-drop-target").forEach(_0x8325f2 => {
      _0x8325f2.classList.remove("is-story-asset-drop-target");
    });
  }
  function _0x155859({
    close = false
  } = {}) {
    if (close) {
      _0x3ffeb1.clipAdjustmentOpen = false;
    }
    _0x3ffeb1.clipAdjustmentInstruction = "";
    _0x3ffeb1.clipAdjustmentPromptMode = "";
    _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
    _0x3ffeb1.clipPromptHistoryOpen = false;
  }
  function _0x112df0(_0x3b957a = "") {
    const _0x7ad2e3 = documentObject.createElement("div");
    _0x7ad2e3.innerHTML = String(_0x3b957a || "");
    return _0x7ad2e3;
  }
  function _0x2bb620(_0x1a57c1) {
    const _0x13db0c = _0x3b5272.querySelector("[data-story-clip-prompt]");
    const _0x5b0199 = _0x13db0c ? sanitizePromptHtmlForCommit(_0x13db0c.innerHTML) : sanitizePromptHtmlForCommit(_0x1a57c1?.prompt || "");
    const _0xc69626 = _0x13db0c || _0x112df0(_0x5b0199);
    return {
      sourcePromptHtml: _0x5b0199,
      sourcePromptText: serializeStoryClipPromptElement(_0xc69626),
      lockedTokens: getStoryClipPromptLockedTokens(_0xc69626),
      officialPromptHtml: sanitizePromptHtmlForCommit(_0x1a57c1?.prompt || "")
    };
  }
  function _0x4b8fe6(_0x110812, _0xff2a22) {
    const _0x1f1887 = _0x3ffeb1.data?.project || {};
    return {
      projectTitle: _0x1f1887.title,
      storySummary: _0x1f1887.summary,
      episodeNumber: _0x110812?.number,
      episodeTitle: _0x110812?.title,
      episodeSynopsis: _0x110812?.synopsis,
      clipTitle: _0xff2a22?.title,
      clipScript: _0xff2a22?.script,
      creativeIntent: _0xff2a22?.creativeIntent,
      transition: _0xff2a22?.transition
    };
  }
  async function _0x39db37({
    instructionOverride = "",
    promptModeOverride = "",
    reopenOnError = true
  } = {}) {
    if (typeof adjustClipPrompt !== "function") {
      _0x1ce8f7("AI 调整服务尚未初始化。", "error");
      return false;
    }
    const _0x531ff3 = getSelectedEpisode(_0x3ffeb1);
    const _0x2d0c95 = getSelectedClip(_0x3ffeb1, _0x531ff3);
    if (!_0x531ff3 || !_0x2d0c95) {
      return false;
    }
    const _0x41eb3c = normalizeText(_0x2d0c95.id);
    const _0x4b3baf = new Set((Array.isArray(_0x3ffeb1.clipAdjustmentGeneratingIds) ? _0x3ffeb1.clipAdjustmentGeneratingIds : []).map(_0x6b2814 => normalizeText(_0x6b2814)));
    const _0x23206e = buildStoryClipAdjustmentGenerationKey(_0x3ffeb1.data?.project?.id, _0x531ff3.id, _0x41eb3c);
    if (!_0x23206e || _0x4b3baf.has(_0x23206e)) {
      return false;
    }
    const _0x419270 = normalizeText(instructionOverride || _0x3ffeb1.clipAdjustmentInstruction);
    const _0x4bd2ad = normalizeStoryPromptMode(_0x2d0c95.promptMode || _0x531ff3.promptMode || _0x3ffeb1.data.project?.planning?.promptMode, {
      allowDeveloperModes: true
    });
    const _0x1ba3d6 = normalizeStoryPromptMode(promptModeOverride || _0x3ffeb1.clipAdjustmentPromptMode || _0x4bd2ad, {
      allowDeveloperModes: true
    });
    const _0x4aae79 = _0x1ba3d6 !== _0x4bd2ad;
    if (!_0x419270 && !_0x4aae79) {
      _0x1ce8f7("请选择新的提示词模式，或填写调整要求。", "warn");
      _0x3b5272.querySelector("[data-story-clip-adjustment-instruction]")?.focus();
      return false;
    }
    const _0x23c169 = _0x2bb620(_0x2d0c95);
    if (!_0x23c169.sourcePromptText) {
      _0x1ce8f7("当前片段还没有可调整的视频提示词。", "warn");
      return false;
    }
    const _0x185b05 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x5d907d = _0x531ff3.id;
    const _0x2ce88b = normalizeDurationSeconds(_0x2d0c95.durationSec || _0x2d0c95.durationSeconds || _0x2d0c95.duration);
    const _0x4adb56 = normalizeStorySceneMaxSeconds(_0x3ffeb1.data.project?.planning?.sceneMaxSeconds);
    const _0x1ed8bd = isStoryMinimaxH3PromptMode(_0x1ba3d6) ? Math.min(15, _0x4adb56) : _0x4adb56;
    _0x4b3baf.add(_0x23206e);
    _0x3ffeb1.clipAdjustmentGeneratingIds = [..._0x4b3baf];
    _0x3ffeb1.clipAdjustmentOpen = false;
    _0x3ffeb1.clipAdjustmentInstruction = "";
    _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
    _0x3ffeb1.clipPromptHistoryOpen = false;
    _0xe5dd9c();
    try {
      const _0x5317b9 = await adjustClipPrompt({
        scope: "prompt",
        instruction: _0x419270,
        currentPrompt: _0x23c169.sourcePromptText,
        selection: null,
        preserveAssetRefs: true,
        preserveDuration: false,
        lockedAssetTokens: _0x23c169.lockedTokens.assetTokens,
        lockedDurationTokens: [],
        duration: _0x2d0c95.duration,
        maxDurationSeconds: _0x1ed8bd,
        context: _0x4b8fe6(_0x531ff3, _0x2d0c95),
        sourcePromptMode: _0x4bd2ad,
        targetPromptMode: _0x1ba3d6,
        model: _0x3ffeb1.models.text,
        provider: _0x3ffeb1.textProvider,
        providerProfileId: _0x3ffeb1.textProviderProfileId
      });
      if (!_0x2c064b(_0x185b05)) {
        return false;
      }
      const _0x3eebfc = _0x185b05.data.episodes.find(_0xbbc840 => _0xbbc840.id === _0x5d907d);
      const _0x551c78 = _0x3eebfc?.clips?.find(_0xed57ec => _0xed57ec.id === _0x41eb3c);
      if (!_0x551c78) {
        return false;
      }
      const _0x376f20 = sanitizePromptHtmlForCommit(renderStoryClipPromptMentions(_0x5317b9.candidateText, {
        assets: _0x185b05.data.assets,
        episode: _0x3eebfc,
        clipFrames: _0x185b05.data.clipFrames
      }));
      setStoryClipAdjustmentCandidate(_0x551c78, {
        id: "candidate-" + Date.now(),
        scope: "prompt",
        instruction: _0x419270,
        promptText: _0x5317b9.candidateText,
        promptHtml: _0x376f20,
        sourcePromptHtml: _0x23c169.officialPromptHtml,
        preserveAssetRefs: true,
        preserveDuration: false,
        sourceDurationSeconds: _0x2ce88b,
        candidateDurationSeconds: _0x5317b9.candidateDurationSeconds,
        sourcePromptMode: _0x4bd2ad,
        targetPromptMode: _0x1ba3d6,
        maxDurationSeconds: _0x1ed8bd,
        modelId: _0x3ffeb1.models.text,
        provider: _0x3ffeb1.textProvider,
        createdAt: Date.now()
      });
      _0x39491b(_0x185b05);
      _0x3c4e04({
        immediate: true
      });
      if (_0x59fa6e(_0x185b05) && _0x3ffeb1.selectedClipId === _0x41eb3c) {
        _0x3ffeb1.clipAdjustmentOpen = false;
        _0x3ffeb1.clipAdjustmentInstruction = "";
        _0x3ffeb1.clipAdjustmentPromptMode = "";
        _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      }
      _0x2e1a77("AI 调整完成，请在右侧选择提示词版本。", _0x185b05, {
        episodeId: _0x5d907d,
        clipId: _0x41eb3c
      }, {
        notificationMessage: "片段视频提示词 AI 调整完成。"
      });
      return true;
    } catch (_0x50ca89) {
      if (!_0x2c064b(_0x185b05)) {
        return false;
      }
      const _0x19e29b = _0x500b30(_0x50ca89, {
        provider: _0x3ffeb1.textProvider,
        modelId: _0x3ffeb1.models.text
      });
      if (!_0x19e29b) {
        _0x847d75(_0x50ca89?.message || "候选版本生成失败。", "error", _0x50ca89);
      }
      if (reopenOnError && _0x59fa6e(_0x185b05) && _0x3ffeb1.selectedClipId === _0x41eb3c) {
        _0x3ffeb1.clipAdjustmentOpen = true;
        _0x3ffeb1.clipAdjustmentInstruction = _0x419270;
        _0x3ffeb1.clipAdjustmentPromptMode = _0x1ba3d6;
        _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      }
      return false;
    } finally {
      _0x3ffeb1.clipAdjustmentGeneratingIds = (Array.isArray(_0x3ffeb1.clipAdjustmentGeneratingIds) ? _0x3ffeb1.clipAdjustmentGeneratingIds : []).filter(_0x3290f1 => normalizeText(_0x3290f1) !== _0x23206e);
      if (_0x59fa6e(_0x185b05)) {
        _0xe5dd9c();
      }
    }
  }
  function _0x43ce84() {
    const _0x3fe4e1 = getSelectedEpisode(_0x3ffeb1);
    const _0x53cf7b = getSelectedClip(_0x3ffeb1, _0x3fe4e1);
    const _0x43f374 = _0x53cf7b?.promptAdjustment?.candidate;
    if (!_0x53cf7b || !_0x43f374) {
      return false;
    }
    if (sanitizePromptHtmlForCommit(_0x53cf7b.prompt || "") !== sanitizePromptHtmlForCommit(_0x43f374.sourcePromptHtml || "")) {
      _0x1ce8f7("当前提示词已变化，请基于最新内容重新生成候选。", "warn");
      return false;
    }
    if (!applyStoryClipAdjustmentCandidate(_0x53cf7b)) {
      return false;
    }
    clearStoryClipAdjustmentUndo(_0x53cf7b);
    _0x135e62(_0x3fe4e1);
    _0x1bbd64(_0x53cf7b);
    _0x155859({
      close: true
    });
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7("已使用 AI 调整后的提示词。", "success");
    return true;
  }
  function _0x135e62(_0xf1a7c8) {
    if (!_0xf1a7c8) {
      return false;
    }
    const _0x4a1e0c = (_0xf1a7c8.clips || []).reduce((_0x55f4c7, _0xc11ed2) => _0x55f4c7 + normalizeDurationSeconds(_0xc11ed2?.durationSec || _0xc11ed2?.durationSeconds || _0xc11ed2?.duration), 0);
    _0xf1a7c8.durationSec = Number(_0x4a1e0c.toFixed(1));
    _0xf1a7c8.duration = formatStoryClockDuration(_0xf1a7c8.durationSec);
    return true;
  }
  function _0x8f72c9(_0x4c7ed7) {
    const _0x293d5c = getSelectedEpisode(_0x3ffeb1);
    const _0x43a0ad = getSelectedClip(_0x3ffeb1, _0x293d5c);
    if (!_0x43a0ad) {
      return false;
    }
    const _0x4ad40b = _0x3b5272.querySelector("[data-story-clip-prompt]");
    if (_0x4ad40b) {
      _0x43a0ad.prompt = sanitizePromptHtmlForCommit(_0x4ad40b.innerHTML);
    }
    const _0x219a71 = restoreStoryClipPromptHistoryEntry(_0x43a0ad, _0x4c7ed7);
    if (!_0x219a71) {
      return false;
    }
    _0x135e62(_0x293d5c);
    _0x155859({
      close: true
    });
    _0x3c4e04({
      immediate: true
    });
    if (!_0x1c9ad4()) {
      _0xe5dd9c();
    }
    _0x1881c3();
    _0x4cdd59();
    _0x1ce8f7("已恢复提示词历史版本。", "success");
    return true;
  }
  function _0xc8c47b() {
    const _0x2bf13e = getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
    if (!discardStoryClipAdjustmentCandidate(_0x2bf13e)) {
      return false;
    }
    _0x155859({
      close: true
    });
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7("已保留原提示词版本。", "info");
    return true;
  }
  function _0x515c9c() {
    const _0x5bd533 = getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
    const _0x490183 = _0x5bd533?.promptAdjustment?.candidate;
    if (!_0x490183) {
      return false;
    }
    _0x39db37({
      instructionOverride: _0x490183.instruction || "保持人物、场景和素材引用不变，重新生成一个提示词版本。",
      promptModeOverride: _0x490183.targetPromptMode,
      reopenOnError: false
    });
    return true;
  }
  function _0x4027b9(_0x1836d9) {
    const _0x447507 = _0x1836d9.target?.closest?.("[data-story-clip-prompt-surface]");
    if (_0x447507) {
      return _0x447507;
    }
    return documentObject.elementFromPoint?.(Number(_0x1836d9.clientX) || 0, Number(_0x1836d9.clientY) || 0)?.closest?.("[data-story-clip-prompt-surface]") || null;
  }
  function _0x3a7987() {
    _0x1b2579?.classList?.remove("is-story-asset-drop-caret-active");
    _0x1b2579 = null;
    if (_0x43e0d1) {
      _0x43e0d1.hidden = true;
    }
  }
  function _0x79aba1(_0x11a72a, _0x19e7d9) {
    const _0x2936fa = getStoryPromptDropRange(documentObject, _0x11a72a, _0x19e7d9.clientX, _0x19e7d9.clientY);
    if (!_0x2936fa) {
      _0x3a7987();
      return null;
    }
    activateStoryPromptDropSelection(windowObject, _0x11a72a, _0x2936fa);
    _0x1b2579?.classList?.remove("is-story-asset-drop-caret-active");
    _0x1b2579 = _0x11a72a;
    _0x11a72a.classList?.add("is-story-asset-drop-caret-active");
    const _0xcc6f24 = _0x2936fa.getBoundingClientRect?.();
    const _0x4b9a79 = _0x11a72a.getBoundingClientRect?.();
    const _0xac1bf8 = windowObject?.getComputedStyle?.(_0x11a72a);
    const _0x363fd6 = Number.parseFloat(_0xac1bf8?.lineHeight) || (Number.parseFloat(_0xac1bf8?.fontSize) || 14) * 1.5;
    const _0x7233fe = Math.max(16, Math.min(36, Number(_0xcc6f24?.height) || _0x363fd6));
    const _0x4d2d94 = Number.isFinite(Number(_0xcc6f24?.left)) ? Number(_0xcc6f24.left) : Number(_0x19e7d9.clientX) || 0;
    const _0x520696 = Number(_0xcc6f24?.height) > 0 ? Number(_0xcc6f24.top) : (Number(_0x19e7d9.clientY) || 0) - _0x7233fe / 2;
    const _0x5ae526 = Number(_0x4b9a79?.top) + 4;
    const _0x59d057 = Number(_0x4b9a79?.bottom) - _0x7233fe - 4;
    const _0x124cc9 = Number.isFinite(_0x5ae526) && Number.isFinite(_0x59d057) && _0x59d057 >= _0x5ae526 ? Math.max(_0x5ae526, Math.min(_0x59d057, _0x520696)) : _0x520696;
    if (!_0x43e0d1) {
      _0x43e0d1 = documentObject.createElement("span");
      _0x43e0d1.className = "story-asset-drop-caret";
      _0x43e0d1.setAttribute("aria-hidden", "true");
      _0x3b5272.appendChild(_0x43e0d1);
    }
    _0x43e0d1.style.left = Math.round(_0x4d2d94) + "px";
    _0x43e0d1.style.top = Math.round(_0x124cc9) + "px";
    _0x43e0d1.style.height = Math.round(_0x7233fe) + "px";
    _0x43e0d1.hidden = false;
    return _0x2936fa;
  }
  function _0x5419a4(_0x441286) {
    const _0x4a0d6f = _0x441286.target?.closest?.("[data-story-reference-asset]");
    const _0xfbf373 = normalizeText(_0x4a0d6f?.dataset?.storyReferenceAsset);
    const _0x56f36b = Math.max(0, Math.trunc(Number(_0x4a0d6f?.dataset?.storyReferenceAssetIndex) || 0));
    if (!_0x4a0d6f || !_0xfbf373 || _0x441286.button !== 0) {
      _0x458ddb = null;
      return false;
    }
    _0x458ddb = {
      assetId: _0xfbf373,
      assetIndex: _0x56f36b,
      element: _0x4a0d6f,
      pointerId: _0x441286.pointerId,
      startX: Number(_0x441286.clientX) || 0,
      startY: Number(_0x441286.clientY) || 0,
      active: false
    };
    _0x4a0d6f.draggable = false;
    _0x4a0d6f.setPointerCapture?.(_0x441286.pointerId);
    return true;
  }
  function _0x39b16b(_0x4d2d5b) {
    const _0x273da1 = _0x458ddb;
    if (!_0x273da1 || _0x273da1.pointerId !== _0x4d2d5b.pointerId) {
      return false;
    }
    if (!_0x273da1.active) {
      const _0x3c6509 = (Number(_0x4d2d5b.clientX) || 0) - _0x273da1.startX;
      const _0x246333 = (Number(_0x4d2d5b.clientY) || 0) - _0x273da1.startY;
      if (Math.hypot(_0x3c6509, _0x246333) < 8) {
        return false;
      }
      _0x273da1.active = true;
      _0x273da1.element?.classList.add("is-story-asset-dragging");
      _0x277232();
      _0x4a9da7(_0x273da1.element);
    }
    _0xd4ea45(_0x4d2d5b);
    _0x3b5272.querySelectorAll(".is-story-asset-drop-target").forEach(_0x52227d => {
      _0x52227d.classList.remove("is-story-asset-drop-target");
    });
    const _0x1c94be = _0x4027b9(_0x4d2d5b);
    _0x1c94be?.classList.add("is-story-asset-drop-target");
    const _0x43bbec = _0x1c94be?.querySelector?.("[data-story-clip-prompt]");
    _0x273da1.triggerRange = _0x43bbec ? _0x79aba1(_0x43bbec, _0x4d2d5b) : null;
    if (!_0x1c94be) {
      _0x3a7987();
    }
    _0x4d2d5b.preventDefault?.();
    return true;
  }
  function _0x1ef3dc(_0x12abc2, {
    cancelled = false
  } = {}) {
    const _0x101666 = _0x458ddb;
    if (!_0x101666 || _0x101666.pointerId !== _0x12abc2.pointerId) {
      return false;
    }
    const _0x28669c = cancelled ? null : _0x4027b9(_0x12abc2);
    const _0x21f736 = _0x101666.active && Boolean(_0x28669c);
    _0x458ddb = null;
    _0x101666.element.draggable = true;
    if (_0x101666.element.hasPointerCapture?.(_0x12abc2.pointerId)) {
      _0x101666.element.releasePointerCapture(_0x12abc2.pointerId);
    }
    if (!_0x101666.active) {
      return false;
    }
    _0x12abc2.preventDefault?.();
    _0x12abc2.stopPropagation?.();
    const _0x56b98d = _0x21f736 ? _0x28669c.querySelector?.("[data-story-clip-prompt]") : null;
    const _0x3bb54e = _0x21f736 ? _0x79aba1(_0x56b98d, _0x12abc2) || _0x101666.triggerRange : null;
    _0x276cd4();
    if (_0x21f736) {
      _0x6da5a0(_0x101666.assetId, {
        assetIndex: _0x101666.assetIndex,
        triggerRange: _0x3bb54e
      });
    }
    return true;
  }
  function _0x2033fd(_0x1fd799) {
    if (!_0x39b16b(_0x1fd799)) {
      return;
    }
    _0x1fd799.stopPropagation?.();
  }
  function _0x3928e0(_0x2431ce) {
    _0x1ef3dc(_0x2431ce);
  }
  function _0x3ce3f4(_0xa8dd07) {
    if (_0x1ef3dc(_0xa8dd07, {
      cancelled: true
    })) {
      return;
    }
    if (_0x458ddb?.pointerId === _0xa8dd07.pointerId) {
      _0x458ddb = null;
    }
  }
  function _0x472e8a(_0x5ed81c) {
    const _0x527674 = _0x5ed81c?.querySelector?.("[data-story-clip-prompt]");
    const _0x5461d9 = _0x2337a2(_0x527674);
    if (!_0x5461d9) {
      return null;
    }
    const _0x254019 = bindPromptMentionHost(_0x5461d9);
    syncStoryClipPromptPillPresentation(_0x527674, _0x3ffeb1.data.assets, _0x3ffeb1.data.clipFrames);
    return _0x254019;
  }
  function _0x3f7d58(_0x4e2c79) {
    const _0x555e13 = _0x4e2c79?.querySelector?.("[data-story-asset-prompt][contenteditable=\"true\"]");
    const _0x4ff571 = _0x10c6aa(_0x555e13);
    if (!_0x4ff571) {
      return null;
    }
    return bindPromptMentionHost(_0x4ff571, {
      commitHydratedPrompt: false
    });
  }
  function _0x991b3b(_0x163360) {
    const _0x2db88a = Math.max(0, Number(_0x163360) || 0);
    const _0x1d7386 = Math.floor(_0x2db88a / 60);
    const _0x14a8ea = Math.floor(_0x2db88a % 60);
    return _0x1d7386 + ":" + String(_0x14a8ea).padStart(2, "0");
  }
  function _0x27cc5b(_0x363486) {
    const _0x19e06c = _0x363486?.querySelector?.("[data-story-video-player]");
    const _0x15db7c = _0x363486?.querySelector?.("[data-story-video-controls]");
    if (!_0x19e06c || !_0x15db7c) {
      return null;
    }
    const _0x3f07b2 = _0x15db7c.querySelector("[data-story-video-play]");
    const _0x1dc242 = _0x15db7c.querySelector("[data-story-video-volume]");
    const _0xe7ffe6 = _0x15db7c.querySelector("[data-story-video-progress]");
    const _0x4f56ad = _0x15db7c.querySelector("[data-story-video-progress-fill]");
    const _0x2c46fc = _0x15db7c.querySelector("[data-story-video-time-current]");
    const _0x224191 = _0x15db7c.querySelector("[data-story-video-time-total]");
    let _0x5ebcf6 = false;
    let _0x1bbf39 = false;
    let _0x56f21b = null;
    const _0x18b3be = getSelectedEpisode(_0x3ffeb1);
    const _0x34b457 = getSelectedClip(_0x3ffeb1, _0x18b3be);
    const _0x17673d = Math.max(0, Math.trunc(Number(_0x19e06c.closest?.("[data-story-video-result-index]")?.dataset?.storyVideoResultIndex) || 0));
    const _0x2cf29a = createStoryVideoPlayback({
      videoEl: _0x19e06c,
      sourceUrl: _0x19e06c.dataset.storyVideoUrl,
      ownerId: ["story-workspace", normalizeText(_0x3ffeb1.data?.project?.id) || "project", normalizeText(_0x18b3be?.id) || "episode", normalizeText(_0x34b457?.id) || "clip", _0x17673d].join(":")
    });
    const _0x5f2a25 = () => {
      const _0x28b5ad = Number(_0x19e06c.duration);
      const _0x45ce58 = Number(_0x19e06c.currentTime);
      const _0x2caede = Number.isFinite(_0x28b5ad) && _0x28b5ad > 0 ? _0x28b5ad : 0;
      const _0x36992d = Number.isFinite(_0x45ce58) && _0x45ce58 > 0 ? Math.min(_0x45ce58, _0x2caede || _0x45ce58) : 0;
      return {
        duration: _0x2caede,
        currentTime: _0x36992d,
        ratio: _0x2caede > 0 ? Math.max(0, Math.min(1, _0x36992d / _0x2caede)) : 0
      };
    };
    const _0x5ac2c6 = ({
      duration: _0x16bafd,
      currentTime: _0x4c4a2b,
      ratio: _0x5c0694
    }) => {
      if (_0x2c46fc) {
        _0x2c46fc.textContent = _0x991b3b(_0x4c4a2b);
      }
      if (_0x224191) {
        _0x224191.textContent = _0x991b3b(_0x16bafd);
      }
      if (_0x4f56ad) {
        _0x4f56ad.style.width = _0x5c0694 * 100 + "%";
      }
      _0xe7ffe6?.setAttribute("aria-valuenow", String(Math.round(_0x5c0694 * 100)));
      _0xe7ffe6?.setAttribute("aria-valuetext", _0x991b3b(_0x4c4a2b) + " / " + _0x991b3b(_0x16bafd));
    };
    const _0x57aaa3 = () => {
      if (_0x5ebcf6 || _0x56f21b != null) {
        return;
      }
      _0x5ac2c6(_0x5f2a25());
    };
    const _0x17b5d4 = () => {
      if (_0x5ebcf6) {
        return;
      }
      const _0x56dd42 = _0x19e06c.paused === false && _0x19e06c.ended !== true;
      _0x3f07b2?.classList.toggle("is-playing", _0x56dd42);
      _0x3f07b2?.setAttribute("aria-label", _0x56dd42 ? "暂停视频" : "播放视频");
      _0x3f07b2?.setAttribute("title", _0x56dd42 ? "暂停视频" : "播放视频");
      const _0x11baf0 = Math.round(Math.max(0, Math.min(1, _0x19e06c.muted ? 0 : Number(_0x19e06c.volume) || 0)) * 100);
      if (_0x1dc242) {
        _0x1dc242.value = String(_0x11baf0);
        _0x1dc242.style.setProperty("--story-video-volume-progress", _0x11baf0 + "%");
        _0x1dc242.setAttribute("aria-valuetext", _0x11baf0 + "%");
      }
      _0x57aaa3();
    };
    const _0x579cca = createStoryVideoProgressLoop({
      videoEl: _0x19e06c,
      onFrame: _0x57aaa3
    });
    const _0x100de5 = async _0x1a759a => {
      _0x1a759a?.preventDefault?.();
      _0x1a759a?.stopPropagation?.();
      if (_0x19e06c.paused === false) {
        _0x19e06c.pause?.();
        return;
      }
      if (_0x19e06c.ended) {
        _0x19e06c.currentTime = 0;
      }
      await _0x2cf29a.play();
      _0x17b5d4();
    };
    const _0x1dbd28 = _0x5a7e4e => {
      const _0x2c0c9d = Number(_0x19e06c.duration);
      const _0x5e19e1 = _0xe7ffe6?.getBoundingClientRect?.();
      if (!(_0x2c0c9d > 0) || !_0x5e19e1?.width) {
        return false;
      }
      const _0x3c9c41 = Math.max(0, Math.min(1, (Number(_0x5a7e4e) - _0x5e19e1.left) / _0x5e19e1.width));
      _0x19e06c.currentTime = _0x3c9c41 * _0x2c0c9d;
      _0x5ac2c6({
        duration: _0x2c0c9d,
        currentTime: _0x3c9c41 * _0x2c0c9d,
        ratio: _0x3c9c41
      });
      return true;
    };
    const _0x469429 = () => {
      const _0x263dab = _0x56f21b;
      _0x56f21b = null;
      if (_0xe7ffe6) {
        _0xe7ffe6.dataset.dragging = "false";
      }
      if (_0x263dab == null) {
        return;
      }
      try {
        _0xe7ffe6?.releasePointerCapture?.(_0x263dab);
      } catch {}
    };
    const _0x332068 = _0x1ac016 => {
      _0x1ac016.preventDefault();
      _0x1ac016.stopPropagation();
      if (!_0x1dbd28(_0x1ac016.clientX)) {
        return;
      }
      _0x56f21b = _0x1ac016.pointerId;
      if (_0xe7ffe6) {
        _0xe7ffe6.dataset.dragging = "true";
      }
      try {
        _0xe7ffe6?.setPointerCapture?.(_0x1ac016.pointerId);
      } catch {}
    };
    const _0x58d8d5 = _0x373646 => {
      if (_0x373646.pointerId !== _0x56f21b) {
        return;
      }
      _0x373646.preventDefault();
      _0x373646.stopPropagation();
      _0x1dbd28(_0x373646.clientX);
    };
    const _0x5d0c44 = _0x40e65b => {
      if (_0x40e65b.pointerId !== _0x56f21b) {
        return;
      }
      _0x40e65b.preventDefault();
      _0x40e65b.stopPropagation();
      _0x1dbd28(_0x40e65b.clientX);
      _0x469429();
      _0x17b5d4();
    };
    const _0x471f1f = _0x24600b => {
      if (_0x24600b.pointerId !== _0x56f21b) {
        return;
      }
      _0x24600b.preventDefault();
      _0x24600b.stopPropagation();
      _0x469429();
      _0x17b5d4();
    };
    const _0x1377dd = _0x58c992 => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(_0x58c992.key)) {
        return;
      }
      const _0x1e3128 = Number(_0x19e06c.duration);
      if (!(_0x1e3128 > 0)) {
        return;
      }
      _0x58c992.preventDefault();
      _0x58c992.stopPropagation();
      if (_0x58c992.key === "Home") {
        _0x19e06c.currentTime = 0;
      } else if (_0x58c992.key === "End") {
        _0x19e06c.currentTime = _0x1e3128;
      } else {
        const _0x47ae72 = _0x58c992.key === "ArrowLeft" ? -5 : 5;
        _0x19e06c.currentTime = Math.max(0, Math.min(_0x1e3128, _0x19e06c.currentTime + _0x47ae72));
      }
      _0x17b5d4();
    };
    const _0x5ebd23 = _0x14dfe2 => {
      _0x14dfe2.stopPropagation();
      const _0xdc8f54 = Math.max(0, Math.min(100, Number(_0x14dfe2.currentTarget?.value) || 0));
      _0x19e06c.muted = false;
      _0x19e06c.volume = _0xdc8f54 / 100;
      _0x17b5d4();
    };
    const _0x4e193f = _0x3326f5 => _0x3326f5.stopPropagation();
    const _0x55f1c1 = _0x755a8d => {
      _0x755a8d.preventDefault();
      _0x755a8d.stopPropagation();
      _0x1bbf39 = true;
      _0x100de5();
    };
    const _0x38b5e6 = _0x2a9dce => {
      _0x2a9dce.preventDefault();
      _0x2a9dce.stopPropagation();
      if (_0x1bbf39) {
        _0x1bbf39 = false;
        return;
      }
      _0x100de5();
    };
    const _0x58b8d7 = ["play", "pause", "timeupdate", "loadedmetadata", "durationchange", "volumechange", "ended"];
    _0x3f07b2?.addEventListener("pointerdown", _0x55f1c1);
    _0x3f07b2?.addEventListener("click", _0x38b5e6);
    _0x19e06c.addEventListener("click", _0x100de5);
    _0x1dc242?.addEventListener("input", _0x5ebd23);
    _0xe7ffe6?.addEventListener("pointerdown", _0x332068);
    _0xe7ffe6?.addEventListener("pointermove", _0x58d8d5);
    _0xe7ffe6?.addEventListener("pointerup", _0x5d0c44);
    _0xe7ffe6?.addEventListener("pointercancel", _0x471f1f);
    _0xe7ffe6?.addEventListener("keydown", _0x1377dd);
    _0x15db7c.addEventListener("pointerdown", _0x4e193f);
    const _0x1c76de = _0x357429 => {
      _0x17b5d4();
      if (_0x357429.type === "play") {
        _0x579cca.start();
      } else if (_0x357429.type === "pause" || _0x357429.type === "ended") {
        _0x579cca.stop();
      }
    };
    _0x58b8d7.forEach(_0xe89756 => _0x19e06c.addEventListener(_0xe89756, _0x1c76de));
    _0x2cf29a.warm().then(() => {
      _0x17b5d4();
      _0x579cca.start();
    }, _0x17b5d4);
    _0x17b5d4();
    return {
      destroy() {
        _0x5ebcf6 = true;
        _0x579cca.destroy();
        _0x2cf29a.destroy();
        _0x3f07b2?.removeEventListener("pointerdown", _0x55f1c1);
        _0x3f07b2?.removeEventListener("click", _0x38b5e6);
        _0x19e06c.removeEventListener("click", _0x100de5);
        _0x1dc242?.removeEventListener("input", _0x5ebd23);
        _0x469429();
        _0xe7ffe6?.removeEventListener("pointerdown", _0x332068);
        _0xe7ffe6?.removeEventListener("pointermove", _0x58d8d5);
        _0xe7ffe6?.removeEventListener("pointerup", _0x5d0c44);
        _0xe7ffe6?.removeEventListener("pointercancel", _0x471f1f);
        _0xe7ffe6?.removeEventListener("keydown", _0x1377dd);
        _0x15db7c.removeEventListener("pointerdown", _0x4e193f);
        _0x58b8d7.forEach(_0x10fa21 => _0x19e06c.removeEventListener(_0x10fa21, _0x1c76de));
      }
    };
  }
  function _0x5542cf(_0x791bd5) {
    const _0x8ef1eb = _0x791bd5?.closest?.(".story-video-result[data-story-video-result-index]");
    const _0x328a5f = _0x8ef1eb?.querySelector?.(".story-video-stage");
    const _0x5e3750 = _0x8ef1eb?.querySelector?.("[data-story-video-player]");
    const _0x13416 = getSelectedEpisode(_0x3ffeb1);
    const _0x161b47 = getSelectedClip(_0x3ffeb1, _0x13416);
    if (!_0x328a5f || !_0x5e3750 || !_0x13416 || !_0x161b47) {
      _0x1ce8f7("当前片段视频不可用。", "warn");
      return false;
    }
    const _0x34afa2 = Math.max(0, Math.trunc(Number(_0x791bd5?.dataset?.storyVideoResultIndex) || 0));
    const _0x44efd0 = Array.isArray(_0x161b47?.video?.results) ? _0x161b47.video.results[_0x34afa2] || {} : {};
    const _0x3cabc3 = normalizeText(_0x44efd0.displayLocalPath || _0x44efd0.localPath || _0x44efd0.originalLocalPath);
    const _0x42a7ac = [localPathToUrl(_0x3cabc3), _0x44efd0.videoUrl, _0x44efd0.url, _0x44efd0.displayUrl, _0x5e3750.dataset?.storyVideoUrl, _0x5e3750.currentSrc, _0x5e3750.getAttribute?.("src")].map(normalizeText).find(Boolean) || "";
    if (!_0x42a7ac) {
      _0x1ce8f7("当前片段视频源不可用。", "warn");
      return false;
    }
    const _0x547197 = normalizeText(_0x44efd0.taskId || _0x44efd0.id || _0x3cabc3 || _0x42a7ac);
    const _0x3a0192 = _0x5e3750.getBoundingClientRect?.();
    const _0x1b46c8 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0xb852c = normalizeText(_0x44efd0.posterUrl || _0x44efd0.thumbUrl || _0x44efd0.thumbnailUrl || _0x44efd0.coverUrl);
    return a1413_0x5b7bf6.initForSource({
      anchorId: "story-video-clip:" + normalizeText(_0x161b47.id) + ":" + _0x34afa2,
      wrapperEl: _0x328a5f,
      videoEl: _0x5e3750,
      sourceUrl: _0x42a7ac,
      sourceLocalPath: _0x3cabc3,
      sourceData: _0x44efd0,
      posterUrl: _0xb852c,
      durationSec: Number(_0x5e3750.duration) || Number(_0x44efd0.videoDuration) || 0,
      videoWidth: Number(_0x5e3750.videoWidth) || Number(_0x44efd0.videoWidth) || 0,
      videoHeight: Number(_0x5e3750.videoHeight) || Number(_0x44efd0.videoHeight) || 0,
      dimMode: false,
      onConfirm: ({
        startSec: _0x29a506,
        endSec: _0x31c860,
        durationSec: _0x76536b,
        cutLocalPath: _0x54bffe,
        videoUrl: _0x19841c,
        fps: _0x522897,
        result: _0x3761f7
      }) => {
        if (!_0x2c064b(_0x1b46c8)) {
          return;
        }
        const _0x44eb76 = _0x1b46c8.data.episodes.find(_0x1ff989 => normalizeText(_0x1ff989?.id) === normalizeText(_0x13416.id));
        const _0x26317e = _0x44eb76?.clips?.find(_0x1bb821 => normalizeText(_0x1bb821?.id) === normalizeText(_0x161b47.id));
        if (!_0x44eb76 || !_0x26317e) {
          return;
        }
        const _0x7df017 = createStoryClipVideoRecord({
          saved: {
            src: _0x19841c,
            localPath: _0x54bffe,
            originalLocalPath: _0x54bffe,
            videoDuration: _0x76536b,
            videoFps: _0x522897,
            videoWidth: Number(_0x3761f7?.width) || Number(_0x44efd0.videoWidth) || Number(_0x5e3750.videoWidth) || 0,
            videoHeight: Number(_0x3761f7?.height) || Number(_0x44efd0.videoHeight) || Number(_0x5e3750.videoHeight) || 0
          },
          episode: _0x44eb76,
          clip: _0x26317e,
          videoResultIndex: _0x34afa2,
          startTimeSec: _0x29a506,
          endTimeSec: _0x31c860,
          sourceKey: _0x547197,
          sourceUrl: _0x42a7ac
        });
        _0x1b46c8.data.clipFrames = upsertStoryClipFrame(_0x1b46c8.data.clipFrames, _0x7df017);
        _0x39491b(_0x1b46c8);
        _0x3c4e04({
          immediate: true
        });
        _0x50b0e1(_0x1b46c8, _0x7df017);
        if (_0x59fa6e(_0x1b46c8)) {
          _0x3ffeb1.episodeAssetRailTab = "frames";
          if (!_0x3ec4f9({
            refreshContent: true
          })) {
            _0xe5dd9c();
          }
          const _0x3ed64d = documentObject.createElement("video");
          _0x3ed64d.src = _0x19841c;
          _0x3ed64d.muted = true;
          _0x3ed64d.playsInline = true;
          if (_0xb852c) {
            _0x3ed64d.poster = _0xb852c;
          }
          const _0x18c860 = _0x4bf4f6.querySelector("[data-story-episode-asset-tab=\"frames\"]");
          playAssetCreateFly({
            fromRect: _0x3a0192,
            contentElement: _0x3ed64d,
            toElement: _0x18c860,
            documentObject: documentObject,
            windowObject: windowObject
          });
        }
        fetchVideoFirstFrameThumbFromServer(_0x19841c, {
          assetId: _0x7df017.id
        }).then(_0xd6b4c9 => {
          if (!_0x2c064b(_0x1b46c8)) {
            return;
          }
          const _0x1b507d = normalizeText(_0xd6b4c9?.thumbUrl || _0xd6b4c9?.url);
          const _0x12c5bb = normalizeText(_0xd6b4c9?.thumbLocalPath || _0xd6b4c9?.localPath);
          if (!_0x1b507d && !_0x12c5bb) {
            return;
          }
          const _0x5ba6f2 = normalizeStoryClipFrames(_0x1b46c8.data.clipFrames).find(_0x1719e5 => _0x1719e5.id === _0x7df017.id);
          if (!_0x5ba6f2) {
            return;
          }
          _0x1b46c8.data.clipFrames = upsertStoryClipFrame(_0x1b46c8.data.clipFrames, {
            ..._0x5ba6f2,
            thumbUrl: _0x1b507d,
            thumbLocalPath: _0x12c5bb
          });
          _0x39491b(_0x1b46c8);
          _0x3c4e04({
            immediate: true
          });
          const _0x19022d = normalizeStoryClipFrames(_0x1b46c8.data.clipFrames).find(_0x146c6e => _0x146c6e.id === _0x7df017.id);
          if (_0x19022d) {
            _0x50b0e1(_0x1b46c8, _0x19022d);
          }
          if (_0x59fa6e(_0x1b46c8)) {
            _0x3ec4f9({
              refreshContent: true
            });
          }
        }).catch(() => {});
      }
    });
  }
  async function _0x37c462(_0x85ac06) {
    const _0x5ac319 = _0x85ac06?.closest?.(".story-video-result[data-story-video-result-index]");
    const _0x4b779a = _0x5ac319?.querySelector?.("[data-story-video-player]");
    const _0x54888a = getSelectedEpisode(_0x3ffeb1);
    const _0x227d3d = getSelectedClip(_0x3ffeb1, _0x54888a);
    if (!_0x4b779a || !_0x54888a || !_0x227d3d) {
      _0x1ce8f7("当前片段视频不可用。", "warn");
      return false;
    }
    const _0x15231d = Math.max(0, Math.trunc(Number(_0x85ac06?.dataset?.storyVideoResultIndex) || 0));
    const _0x4013ca = Math.max(0, Number(_0x4b779a.currentTime) || 0);
    const _0x17a1c1 = [normalizeText(_0x3ffeb1.data?.project?.id), normalizeText(_0x227d3d.id), _0x15231d, Math.round(_0x4013ca * 1000)].join(":");
    if (_0x17d744.has(_0x17a1c1)) {
      return false;
    }
    _0x17d744.add(_0x17a1c1);
    _0x85ac06.disabled = true;
    syncStoryAsyncButton(_0x85ac06, true, {
      spinnerOnly: true
    });
    const _0x9d1a8 = _0x4b779a.getBoundingClientRect?.();
    let _0xa8df5f = false;
    const _0x162537 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x1b41b4 = Array.isArray(_0x227d3d?.video?.results) ? _0x227d3d.video.results[_0x15231d] || {} : {};
    const _0x4afedb = normalizeText(_0x4b779a.dataset?.storyVideoUrl || _0x4b779a.currentSrc);
    const _0xf514dd = normalizeText(_0x1b41b4.taskId || _0x1b41b4.id || _0x1b41b4.localPath || _0x1b41b4.displayLocalPath || _0x1b41b4.videoUrl || _0x1b41b4.url || _0x4afedb);
    try {
      const {
        snapshot: _0x5eaa1d,
        localizedVideo: _0x5c4afe
      } = await captureStoryClipFrameSnapshot({
        videoEl: _0x4b779a,
        sourceResult: _0x1b41b4,
        sourceUrl: _0x4afedb,
        currentTimeSec: _0x4013ca,
        saveOutputFromUrl: saveOutputFromUrl,
        documentObject: documentObject,
        fileNamePrefix: "story_clip_frame"
      });
      if (!_0x2c064b(_0x162537)) {
        return false;
      }
      const _0x9ae460 = _0x162537.data.episodes.find(_0x5d6105 => normalizeText(_0x5d6105?.id) === normalizeText(_0x54888a.id));
      const _0x16229b = _0x9ae460?.clips?.find(_0x3aa1ef => normalizeText(_0x3aa1ef?.id) === normalizeText(_0x227d3d.id));
      if (!_0x9ae460 || !_0x16229b) {
        return false;
      }
      const _0x56bcb4 = Array.isArray(_0x16229b?.video?.results) ? _0x16229b.video.results[_0x15231d] : null;
      if (_0x56bcb4 && _0x5c4afe) {
        _0x56bcb4.localPath = _0x5c4afe.localPath;
        _0x56bcb4.originalLocalPath = _0x5c4afe.originalLocalPath;
        _0x56bcb4.displayLocalPath = _0x5c4afe.displayLocalPath;
      }
      let _0x4c6fc2 = null;
      let _0x8b1d2c = false;
      const {
        savePromise: _0x4e8a28,
        previewUrl: _0x576d90
      } = startVideoFrameSnapshotPersistence(_0x5eaa1d, saveOutputBlob, {
        onPreview: ({
          previewUrl: _0x372424
        }) => {
          _0x4c6fc2 = {
            ...createStoryClipFrameRecord({
              saved: {
                src: _0x372424,
                fileName: _0x5eaa1d.fileName,
                originalWidth: _0x5eaa1d.originalWidth,
                originalHeight: _0x5eaa1d.originalHeight
              },
              episode: _0x9ae460,
              clip: _0x16229b,
              videoResultIndex: _0x15231d,
              currentTimeSec: _0x4013ca,
              sourceKey: _0xf514dd,
              sourceUrl: _0x4afedb
            }),
            captureSavePending: true,
            captureSaveError: "",
            isTransient: true
          };
          const _0x4e29b4 = normalizeStoryClipFrames(_0x162537.data.clipFrames).find(_0x4c68e5 => _0x4c68e5.id === _0x4c6fc2.id);
          if (!_0x4e29b4 && _0x4c6fc2.imageUrl) {
            _0x162537.data.clipFrames = upsertStoryClipFrame(_0x162537.data.clipFrames, _0x4c6fc2);
            _0x8b1d2c = true;
          }
          if (_0x59fa6e(_0x162537)) {
            _0x3ffeb1.episodeAssetRailTab = "frames";
            if (!_0x3ec4f9({
              refreshContent: true
            })) {
              _0xe5dd9c();
            }
            const _0x4df71b = documentObject.createElement("img");
            _0x4df71b.src = _0x372424;
            _0x4df71b.alt = "";
            const _0xa99e40 = _0x4bf4f6.querySelector("[data-story-episode-asset-tab=\"frames\"]");
            playAssetCreateFly({
              fromRect: _0x9d1a8,
              contentElement: _0x4df71b,
              toElement: _0xa99e40,
              documentObject: documentObject,
              windowObject: windowObject
            });
            _0x1ce8f7("当前画面已加入片段帧。", "success");
          }
        }
      });
      _0xa8df5f = true;
      _0x4e8a28.then(_0x474897 => {
        if (!_0x2c064b(_0x162537)) {
          if (_0x576d90) {
            (windowObject?.URL || globalThis.URL)?.revokeObjectURL?.(_0x576d90);
          }
          return;
        }
        const _0x435df5 = createStoryClipFrameRecord({
          saved: _0x474897,
          episode: _0x9ae460,
          clip: _0x16229b,
          videoResultIndex: _0x15231d,
          currentTimeSec: _0x4013ca,
          sourceKey: _0xf514dd,
          sourceUrl: _0x4afedb
        });
        _0x162537.data.clipFrames = upsertStoryClipFrame(_0x162537.data.clipFrames, _0x435df5);
        _0x39491b(_0x162537);
        _0x3c4e04({
          immediate: true
        });
        _0x50b0e1(_0x162537, _0x435df5);
        if (_0x59fa6e(_0x162537)) {
          if (!_0x1cb088(_0x435df5.id)) {
            _0x3ec4f9({
              refreshContent: true
            });
          }
        }
        if (_0x576d90) {
          (windowObject?.URL || globalThis.URL)?.revokeObjectURL?.(_0x576d90);
        }
      }).catch(_0x1fa5d6 => {
        console.warn("[storyWorkspace] save captured clip frame failed", _0x1fa5d6);
        if (_0x8b1d2c && _0x2c064b(_0x162537)) {
          _0x162537.data.clipFrames = normalizeStoryClipFrames(_0x162537.data.clipFrames).map(_0x3acc0e => _0x3acc0e.id === _0x4c6fc2?.id ? {
            ..._0x3acc0e,
            captureSavePending: false,
            captureSaveError: String(_0x1fa5d6?.message || "当前帧本地保存失败"),
            isTransient: true
          } : _0x3acc0e);
          if (_0x59fa6e(_0x162537)) {
            const _0x4238d6 = String(_0x1fa5d6?.message || "当前帧本地保存失败");
            if (!_0x1cb088(_0x4c6fc2?.id, {
              errorMessage: _0x4238d6
            })) {
              _0x3ec4f9({
                refreshContent: true
              });
            }
            _0x1ce8f7("当前帧已显示，但本地保存失败。", "warning");
          }
        } else {
          if (_0x576d90) {
            (windowObject?.URL || globalThis.URL)?.revokeObjectURL?.(_0x576d90);
          }
          if (_0x59fa6e(_0x162537)) {
            _0x1ce8f7("当前帧本地保存失败。", "warning");
          }
        }
      }).finally(() => {
        _0x17d744.delete(_0x17a1c1);
      });
      return true;
    } catch (_0x5f1128) {
      console.warn("[storyWorkspace] capture clip frame failed", _0x5f1128);
      _0x1ce8f7(_0x5f1128?.message || "截取当前帧失败，请重试。", "error");
      return false;
    } finally {
      if (!_0xa8df5f) {
        _0x17d744.delete(_0x17a1c1);
      }
      if (_0x85ac06?.isConnected !== false) {
        _0x85ac06.disabled = false;
        syncStoryAsyncButton(_0x85ac06, false);
      }
    }
  }
  function _0x2c6355(_0x2bed9b) {
    const _0x311e43 = documentObject.createElement("article");
    _0x311e43.className = "story-page";
    _0x311e43.innerHTML = _0x2bed9b;
    const _0x441c55 = _0x311e43.querySelector("[data-story-marquee-page-surface]");
    if (_0x441c55?.dataset.storyMarqueePageSurface) {
      _0x311e43.dataset.storyMarqueeSurface = _0x441c55.dataset.storyMarqueePageSurface;
    }
    if (_0x311e43.querySelector(".story-outline-page")) {
      _0x311e43.classList.add("story-page--outline");
    }
    _0x311e43.querySelector(".story-assets-layout")?.style.setProperty("--story-assets-left", normalizeStoryAssetSplitRatio(_0x3ffeb1.assetSplitRatio) + "%");
    _0x311e43.querySelector(".story-assets-page")?.style.setProperty("--story-assets-left", normalizeStoryAssetSplitRatio(_0x3ffeb1.assetSplitRatio) + "%");
    const _0x5e1425 = normalizeStoryEpisodePanelRatios(_0x3ffeb1.episodeAssetPanelRatio, _0x3ffeb1.episodeEditorPanelRatio);
    const _0x97bd23 = _0x311e43.querySelector(".story-episode-detail-page");
    _0x97bd23?.style.setProperty("--story-episode-assets-width", _0x5e1425.left + "%");
    _0x97bd23?.style.setProperty("--story-episode-editor-width", _0x5e1425.center + "%");
    _0xb44d47(_0x311e43);
    return _0x311e43;
  }
  function _0xb44d47(_0x255fdc) {
    const _0xface6e = [];
    let _0x110cb5 = false;
    const _0x1b14c6 = () => {
      if (_0x110cb5) {
        return;
      }
      _0x110cb5 = true;
      for (const _0x4d24a8 of _0xface6e.reverse()) {
        try {
          _0x4d24a8?.destroy?.();
        } catch (_0x19fb24) {
          globalThis.console?.warn?.("[storyWorkspace] 页面控制器清理失败", _0x19fb24);
        }
      }
      _0xface6e.length = 0;
    };
    try {
      const _0x3f518f = (_0x1aef04, _0xbd2e43) => {
        if (!_0x1aef04) {
          return;
        }
        const _0x40d56d = _0x24ae1c => {
          _0xbd2e43(_0x24ae1c);
        };
        _0x1aef04.addEventListener("pointerdown", _0x40d56d);
        _0xface6e.push({
          destroy: () => _0x1aef04.removeEventListener("pointerdown", _0x40d56d)
        });
      };
      _0x3f518f(_0x255fdc.querySelector("[data-story-assets-splitter]"), _0x5cd9de);
      _0x255fdc.querySelectorAll("[data-story-episode-splitter]").forEach(_0x14f9a9 => {
        _0x3f518f(_0x14f9a9, _0x56cda3);
      });
      const _0x2cbd4a = _0x3f7d58(_0x255fdc);
      if (_0x2cbd4a) {
        _0xface6e.push(_0x2cbd4a);
      }
      const _0x90ac9d = _0x472e8a(_0x255fdc);
      if (_0x90ac9d) {
        _0xface6e.push(_0x90ac9d);
      }
      let _0x5c2502 = _0x27cc5b(_0x255fdc);
      _0xface6e.push({
        destroy() {
          _0x5c2502?.destroy?.();
          _0x5c2502 = null;
        }
      });
      const _0x414c10 = bindStoryOutlineNavigation(_0x255fdc, {
        windowObject: windowObject
      });
      if (_0x414c10) {
        _0xface6e.push(_0x414c10);
      }
      let _0x6201a9 = null;
      const _0x5bb889 = () => {
        _0x6201a9?.destroy?.();
        _0x6201a9 = null;
        const _0x2767d4 = _0x255fdc.querySelector("[data-aigen-text-model-selector]");
        if (!_0x2767d4) {
          return;
        }
        const _0x3f739f = Boolean(_0x2767d4.classList?.contains("story-home-text-model-selector") && _0x3ffeb1.view === "home" && _0x3ffeb1.homeTab === "replication");
        _0x6201a9 = bindAIGenTextModelSelector(_0x2767d4, {
          modelId: _0x3ffeb1.models.text,
          provider: _0x3ffeb1.textProvider,
          providerProfileId: _0x3ffeb1.textProviderProfileId,
          getDisplayModelName: getDisplayModelName,
          documentObject: documentObject,
          onChange: ({
            modelId: _0xcdc21d,
            provider: _0xda2b2,
            providerProfileId: _0x39776e
          }) => {
            if (_0x3f739f && resolveStoryVideoInputTextModelId(_0xcdc21d) !== _0xcdc21d) {
              return;
            }
            _0x3ffeb1.models.text = _0xcdc21d;
            _0x3ffeb1.textProvider = _0xda2b2;
            _0x3ffeb1.textProviderProfileId = _0x39776e;
            _0x3c4e04();
          }
        });
      };
      _0x5bb889();
      _0xface6e.push({
        destroy() {
          _0x6201a9?.destroy?.();
          _0x6201a9 = null;
        }
      });
      const _0xd5b12d = _0x255fdc.querySelector("[data-aigen-image-model-selector]");
      if (_0xd5b12d) {
        const _0x2a9e10 = bindAIGenImageModelSelector(_0xd5b12d, {
          modelId: _0x3ffeb1.models.image,
          provider: _0x3ffeb1.imageProvider,
          generationParams: _0x3ffeb1.imageGenerationParams,
          generationParamsByModel: _0x3ffeb1.imageGenerationParamsByModel,
          showSchemaControls: true,
          onChange: ({
            modelId: _0x464350,
            provider: _0x12ee7d,
            generationParams: _0x51a7a1,
            generationParamsByModel: _0x334202
          }) => {
            _0x3ffeb1.models.image = _0x464350;
            _0x3ffeb1.imageProvider = resolveModelProvider(_0x464350, _0x12ee7d);
            _0x3ffeb1.imageGenerationParams = normalizeStoryImageGenerationParams(_0x464350, _0x51a7a1);
            _0x3ffeb1.imageGenerationParamsByModel = _0x334202;
            _0x3c4e04();
          },
          documentObject: documentObject,
          windowObject: windowObject,
          floatingMenuHost: _0x3b5272,
          schemaPopupPlacement: "portal-auto-up"
        });
        _0xface6e.push(_0x2a9e10);
      }
      let _0x1ad5fc = null;
      let _0x1711d3 = null;
      const _0x440c0a = _0x255fdc.querySelector("[data-aigen-video-model-selector]");
      if (_0x440c0a) {
        const _0x2cd3e6 = getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
        const _0x36d429 = resolveStoryClipVideoGenerationParams(_0x2cd3e6, _0x3ffeb1.models.video, _0x3ffeb1.videoGenerationParams);
        _0x1ad5fc = bindAIGenVideoModelSelector(_0x440c0a, {
          modelId: _0x3ffeb1.models.video,
          provider: _0x3ffeb1.videoProvider,
          generationParams: _0x36d429,
          generationParamsByModel: {
            ..._0x3ffeb1.videoGenerationParamsByModel,
            [_0x3ffeb1.models.video]: {
              ..._0x36d429
            }
          },
          providerProfileId: _0x3ffeb1.videoProviderProfileId,
          providerProfileIdByModel: _0x3ffeb1.videoProviderProfileIdByModel,
          referenceCounts: storyClipProduction.getInputReferenceCounts(getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1))),
          showSchemaControls: true,
          runningHubWorkflowAllowedModelIds: STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_IDS,
          modelSubmenuPlacement: "viewport-auto-up",
          onChange: ({
            modelId: _0x275039,
            provider: _0x4e21a1,
            generationParams: _0x2efda2,
            generationParamsByModel: _0x3e102b,
            providerProfileId: _0x3ca3ed,
            providerProfileIdByModel: _0x311477,
            patch: _0xb94729
          }) => {
            const _0x389db6 = _0x3ffeb1.models.video;
            const _0x2f4b38 = getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
            const _0x3e1f20 = normalizeStoryVideoGenerationParams(_0x389db6, _0x3ffeb1.videoGenerationParams);
            const _0x350ab8 = getStoryVideoFixedInputVisibilityKey(_0x389db6, _0x3ffeb1.videoProvider, _0x3e1f20);
            const _0x1a087b = Boolean(_0x3ffeb1.videoGenerationParamsByModel?.[_0x275039]);
            const _0x29c449 = Boolean(_0xb94729?.model) && !_0x1a087b;
            const _0x114a6a = Boolean(_0xb94729?.model) && _0x275039 !== _0x389db6;
            _0x3ffeb1.models.video = _0x275039;
            if (_0x114a6a) {
              syncStoryPromptModeForVideoModel(_0x3ffeb1, _0x275039, getSelectedEpisode(_0x3ffeb1));
            }
            _0x3ffeb1.videoProvider = resolveStoryVideoProvider(_0x275039, _0x4e21a1);
            _0x3ffeb1.videoProviderProfileId = _0x3ca3ed;
            _0x3ffeb1.videoProviderProfileIdByModel = _0x311477;
            const _0x554498 = normalizeStoryVideoGenerationParams(_0x275039, _0x29c449 ? applyStoryVideoInitialModeDefault(_0x275039, _0x2efda2) : _0x2efda2);
            let _0x2e29dc = _0x29c449 ? applyStoryAspectRatioToVideoGenerationParams(_0x275039, _0x554498, _0x3ffeb1.data.project?.aspectRatio) : _0x554498;
            const _0x112cf9 = reconcileStoryClipVideoGenerationDurationChange({
              clip: _0x2f4b38,
              previousModelId: _0x389db6,
              modelId: _0x275039,
              previousGenerationParams: _0x3e1f20,
              nextGenerationParams: _0x2e29dc,
              generationParamsChanged: Boolean(_0xb94729?.generationParams),
              modelChanged: _0x114a6a
            });
            _0x2e29dc = _0x112cf9.generationParams;
            if (_0x112cf9.durationChanged) {
              _0x764f47(_0x2f4b38);
            }
            _0x3ffeb1.videoGenerationParams = _0x2e29dc;
            _0x3ffeb1.videoGenerationParamsByModel = {
              ..._0x3e102b,
              [_0x389db6]: {
                ..._0x3e1f20
              },
              [_0x275039]: {
                ..._0x3ffeb1.videoGenerationParams
              }
            };
            _0x4a6311();
            _0x3c4e04();
            _0x1711d3?.sync();
            const _0x2a3287 = _0x350ab8 !== getStoryVideoFixedInputVisibilityKey(_0x3ffeb1.models.video, _0x3ffeb1.videoProvider, _0x3ffeb1.videoGenerationParams);
            if (_0x3ffeb1.view === "episode" && (_0xb94729?.model || _0x2a3287)) {
              _0xe5dd9c();
            }
          },
          documentObject: documentObject,
          windowObject: windowObject,
          floatingMenuHost: _0x3b5272,
          schemaPopupPlacement: "portal-auto-up"
        });
        _0xface6e.push(_0x1ad5fc);
      }
      const _0x14499f = _0x255fdc.querySelector("[data-story-video-provider-profile]");
      if (_0x440c0a && _0x14499f) {
        _0x440c0a.appendChild(_0x14499f);
      }
      if (_0x14499f) {
        _0x1711d3 = createModelProviderProfileControl({
          panel: _0x14499f,
          getNodeData: () => ({
            model: _0x3ffeb1.models.video,
            provider: _0x3ffeb1.videoProvider,
            providerProfileId: _0x3ffeb1.videoProviderProfileId,
            providerProfileIdByModel: _0x3ffeb1.videoProviderProfileIdByModel
          }),
          onChange: _0x2adb07 => {
            if (_0x1ad5fc?.applyProviderProfilePatch?.(_0x2adb07)) {
              return;
            }
            _0x3ffeb1.videoProviderProfileId = _0x2adb07.providerProfileId;
            _0x3ffeb1.videoProviderProfileIdByModel = _0x2adb07.providerProfileIdByModel;
            _0x3c4e04();
            _0x1711d3?.sync();
          }
        });
        _0xface6e.push({
          destroy: () => _0x1711d3?.remove()
        });
      }
      const _0xc92f4 = _0x255fdc.querySelector("[data-story-character-voice-panel]");
      if (_0xc92f4 && _0x3ffeb1.characterVoiceEditor) {
        const _0x4a3ebd = _0xc92f4.querySelector("[data-story-character-voice-model-footer]");
        const _0x48f3f8 = "story-character-voice-draft-" + _0x3ffeb1.characterVoiceEditor.assetId;
        const _0x58c1ee = {
          getState: () => ({
            nodes: {
              [_0x48f3f8]: _0x3ffeb1.characterVoiceEditor?.nodeData || {}
            }
          }),
          updateNodeData: (_0x3d0f42, _0x2c860 = {}) => {
            if (!_0x3ffeb1.characterVoiceEditor) {
              return;
            }
            _0x3ffeb1.characterVoiceEditor.nodeData = {
              ...(_0x3ffeb1.characterVoiceEditor.nodeData || {}),
              ..._0x2c860
            };
          }
        };
        if (_0x4a3ebd) {
          _0xface6e.push({
            destroy: bindAudioWorkflowSchemaSlotControls({
              footer: _0x4a3ebd,
              nodeId: _0x48f3f8,
              nodeData: _0x3ffeb1.characterVoiceEditor.nodeData,
              store: _0x58c1ee
            })
          });
          _0xface6e.push({
            destroy: bindNodeFooterController(_0x4a3ebd)
          });
          const _0x74b24a = _0x4a3ebd.querySelector(".img-model-btn-trigger");
          const _0x7c8cbe = _0x4a3ebd.querySelector(".node-model-menu");
          _0xface6e.push({
            destroy: bindNodeModelMenuTrigger({
              root: _0x4a3ebd,
              trigger: _0x74b24a,
              menu: _0x7c8cbe,
              closeOthers: () => closeNodeFooterMenus(_0x4a3ebd, _0x7c8cbe)
            })
          });
          const _0x198ec0 = _0x16beed => {
            const _0x2a6ccc = _0x16beed.target.closest(".node-menu-item[data-value]");
            if (!_0x2a6ccc || !_0x7c8cbe?.contains(_0x2a6ccc) || _0x2a6ccc.dataset.disabled === "true") {
              return;
            }
            _0x16beed.stopPropagation();
            _0x3ffeb1.characterVoiceEditor = selectStoryCharacterVoiceWorkflow(_0x3ffeb1.characterVoiceEditor, _0x2a6ccc.dataset.value);
            _0xe5dd9c();
          };
          _0x7c8cbe?.addEventListener("click", _0x198ec0);
          _0xface6e.push({
            destroy: () => _0x7c8cbe?.removeEventListener("click", _0x198ec0)
          });
          const _0x1ca23f = _0x4a3ebd.querySelector(".rh-adv-btn");
          const _0x839d3f = _0x4a3ebd.querySelector(".rh-adv-panel");
          const _0x2119f2 = _0xd460ec => {
            _0xd460ec.stopPropagation();
            const _0x31dca2 = !_0x839d3f?.classList.contains("show");
            closeNodeFooterMenus(_0x4a3ebd, _0x31dca2 ? _0x839d3f : null);
            _0x839d3f?.classList.toggle("show", _0x31dca2);
            _0x1ca23f?.classList.toggle("active", _0x31dca2);
          };
          _0x1ca23f?.addEventListener("click", _0x2119f2);
          _0xface6e.push({
            destroy: () => _0x1ca23f?.removeEventListener("click", _0x2119f2)
          });
        }
        const _0x3499b9 = _0xc92f4.querySelector("[data-audio-playback-surface]");
        const _0x58790d = createAudioPlaybackSurfaceController(_0x3499b9, {
          onBeforePlay: _0x493da1,
          onError: () => _0x1ce8f7("声音参考播放失败。", "warn")
        });
        if (_0x58790d) {
          _0xface6e.push(_0x58790d);
        }
      }
      _0x3d3f7d.set(_0x255fdc, {
        destroy: _0x1b14c6,
        refreshTextModelSelector: _0x5bb889,
        refreshVideoPreview() {
          _0x5c2502?.destroy?.();
          _0x5c2502 = _0x27cc5b(_0x255fdc);
        }
      });
      return _0x255fdc;
    } catch (_0xbb0ea2) {
      _0x1b14c6();
      throw _0xbb0ea2;
    }
  }
  function _0xaa1ae4(_0x160ef1) {
    _0x3d3f7d.get(_0x160ef1)?.destroy?.();
    _0x3d3f7d.delete(_0x160ef1);
    _0x160ef1?.remove?.();
  }
  function _0x7c24b3() {
    _0x4c44ef.cancel();
  }
  function _0x37bb71(_0x569a98, _0x40e61b = "none", _0x20aac0 = null, {
    transitionScope = "page"
  } = {}) {
    _0x9612c5();
    _0x7c24b3();
    const _0x553789 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x280a8f = _0x2c6355(_0x569a98);
    if (!_0x553789 || _0x40e61b === "none") {
      _0x4bf4f6.querySelectorAll(":scope > .story-page").forEach(_0x51e131 => {
        if (_0x51e131 !== _0x280a8f) {
          _0xaa1ae4(_0x51e131);
        }
      });
      _0x4bf4f6.replaceChildren(_0x280a8f);
      _0x280a8f.classList.add("is-current");
      _0x20aac0?.();
      return {
        page: _0x280a8f,
        committed: Promise.resolve(true),
        committedImmediately: true
      };
    }
    const _0x453d82 = _0x553789.querySelector("[data-story-assets-switch-region]");
    const _0x27a8b1 = _0x280a8f.querySelector("[data-story-assets-switch-region]");
    const _0x2b7b8b = transitionScope === "asset-content" && _0x453d82 && _0x27a8b1;
    const _0x47cdfa = _0x4c44ef.start({
      current: _0x553789,
      next: _0x280a8f,
      parent: _0x4bf4f6,
      direction: _0x40e61b,
      transitionElement: _0x2b7b8b ? _0x27a8b1 : _0x280a8f,
      classNames: {
        current: "is-current",
        scopeCurrent: _0x2b7b8b ? "story-page--asset-content-transition" : "",
        scopeNext: _0x2b7b8b ? "story-page--asset-content-transition" : "",
        scopeTarget: _0x2b7b8b ? "story-page--asset-content-transition-target" : ""
      },
      mount: () => _0x4bf4f6.appendChild(_0x280a8f),
      onTransitionComplete: _0x20aac0
    });
    return {
      page: _0x280a8f,
      committed: _0x47cdfa?.committed || Promise.resolve(false),
      committedImmediately: false
    };
  }
  function _0x6ad455() {
    if (_0x3ffeb1.view === "home") {
      return "home";
    }
    const _0x3b7e39 = normalizeText(_0x3ffeb1.data?.project?.id) || "draft";
    if (_0x3ffeb1.view === "episode") {
      return "project:" + _0x3b7e39 + ":episode:" + (normalizeText(_0x3ffeb1.selectedEpisodeId) || "selected");
    }
    if (_0x3ffeb1.step === 1 && _0x3ffeb1.data?.project?.sourceMode !== "video-replication" && isStoryAssetExtractionOperation(_0x3ffeb1.storyPlanningOperation)) {
      return "project:" + _0x3b7e39 + ":asset-breakdown";
    }
    return "project:" + _0x3b7e39 + ":step:" + normalizeStoryWorkspaceStep(_0x3ffeb1.step);
  }
  function _0x12ca9b() {
    const _0x317cd1 = _0x4bf4f6.querySelector(".story-page.is-current");
    if (!_0x317cd1) {
      return;
    }
    const _0x5931e9 = {
      ...(_0x3ffeb1.outlineSectionOpenState || {})
    };
    _0x317cd1.querySelectorAll("details[data-story-outline-section]").forEach(_0xb02f9 => {
      _0x5931e9[_0xb02f9.dataset.storyOutlineSection] = _0xb02f9.open;
    });
    _0x3ffeb1.outlineSectionOpenState = _0x5931e9;
    const _0x30ca3d = _0x9d8401 || _0x6ad455();
    _0x3ffeb1.pageScrollPositions = {
      ...(_0x3ffeb1.pageScrollPositions || {}),
      [_0x30ca3d]: {
        top: Math.max(0, Number(_0x317cd1.scrollTop) || 0),
        left: Math.max(0, Number(_0x317cd1.scrollLeft) || 0)
      }
    };
  }
  function _0x44f08d() {
    const _0x44c502 = _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2 && _0x3ffeb1.storyPlanningOperation === "planning-episodes";
    _0x3b5b6c.classList.toggle("is-planning", _0x44c502);
    _0x3b5b6c.setAttribute("aria-busy", String(_0x44c502));
    _0x7b052a.hidden = !_0x44c502;
    if (_0x44c502) {
      _0x432eb8.textContent = _0x3ffeb1.storyPlanningStatus || "正在生成分镜视频";
    }
  }
  function _0x2917a9() {
    if (_0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 1) {
      return false;
    }
    if (_0x3ffeb1.data?.project?.sourceMode === "video-replication") {
      return _0x25ae28();
    }
    const _0x1c1a00 = _0x4bf4f6.querySelector(".story-page.is-current .story-page-footer");
    if (!_0x1c1a00) {
      return false;
    }
    const _0x275699 = documentObject.createElement("template");
    _0x275699.innerHTML = renderStoryAssetExtractionFooter(_0x3ffeb1).trim();
    const _0x1cd177 = _0x275699.content.firstElementChild;
    if (!_0x1cd177) {
      return false;
    }
    _0x1c1a00.replaceWith(_0x1cd177);
    return true;
  }
  function _0xe5dd9c({
    direction = "none",
    updateToolbar = true,
    capturePageState = true,
    onTransitionComplete = null,
    transitionScope = "page"
  } = {}) {
    _0x3cb00d();
    const _0x4f55b7 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x3466fb = _0x9d8401 || _0x6ad455();
    const _0xe7eacf = _0x6ad455();
    const _0x397744 = direction === "none" && _0x3466fb === _0xe7eacf ? captureStoryWorkspaceNestedScrollPositions(_0x4f55b7) : null;
    if (capturePageState) {
      _0x12ca9b();
    }
    const _0x31ab5d = _0x3ffeb1.pageScrollPositions?.[_0xe7eacf] || {};
    if (updateToolbar) {
      _0x3e894e();
    }
    const _0x3694df = _0x37bb71(_0x3ffeb1.view === "home" ? renderStoryHome(_0x3ffeb1) : renderProjectPage(_0x3ffeb1), direction, onTransitionComplete, {
      transitionScope: transitionScope
    });
    const _0x57e95a = _0x3694df.page;
    if (_0x57e95a) {
      _0x57e95a.scrollTop = Math.max(0, Number(_0x31ab5d.top) || 0);
      _0x57e95a.scrollLeft = Math.max(0, Number(_0x31ab5d.left) || 0);
      restoreStoryWorkspaceNestedScrollPositions(_0x57e95a, _0x397744);
    }
    if (_0x3694df.committedImmediately) {
      _0x9d8401 = _0xe7eacf;
    } else {
      _0x3694df.committed.then(_0xe6e2d7 => {
        if (_0xe6e2d7 && _0x57e95a.isConnected && _0x57e95a.classList.contains("is-current")) {
          _0x9d8401 = _0xe7eacf;
        }
      }, () => {});
    }
    _0x44f08d();
    _0x1dbf14();
    return _0x3694df.committed;
  }
  function _0x4452c4() {
    if (_0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 2) {
      return null;
    }
    return _0x4bf4f6.querySelector(".story-page.is-current");
  }
  function _0x3ec4f9({
    refreshContent = false
  } = {}) {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x429b7b = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x1691c0 = _0x429b7b?.querySelector("[data-story-episode-asset-rail]");
    if (!_0x429b7b || !_0x1691c0) {
      return false;
    }
    if (refreshContent) {
      const _0x23ca2e = documentObject.createElement("div");
      _0x23ca2e.innerHTML = renderEpisodeAssetRail(_0x3ffeb1);
      const _0x37e346 = _0x23ca2e.firstElementChild;
      ["assets", "frames", "library"].forEach(_0x5eab96 => {
        const _0x40d31c = _0x1691c0.querySelector("[data-story-episode-asset-panel=\"" + _0x5eab96 + "\"]");
        const _0x354e60 = _0x37e346?.querySelector("[data-story-episode-asset-panel=\"" + _0x5eab96 + "\"]");
        if (_0x40d31c && _0x354e60) {
          _0x40d31c.innerHTML = _0x354e60.innerHTML;
        }
        const _0x3a2d45 = _0x1691c0.querySelector("[data-story-episode-asset-count=\"" + _0x5eab96 + "\"]");
        const _0x3a9cf7 = _0x37e346?.querySelector("[data-story-episode-asset-count=\"" + _0x5eab96 + "\"]");
        if (_0x3a2d45 && _0x3a9cf7) {
          _0x3a2d45.textContent = _0x3a9cf7.textContent;
        }
      });
    }
    const _0x5d2197 = normalizeStoryEpisodeAssetRailTab(_0x3ffeb1.episodeAssetRailTab);
    _0x1691c0.dataset.activeTab = _0x5d2197;
    _0x1691c0.querySelectorAll("[data-story-episode-asset-tab]").forEach(_0x148803 => {
      const _0x511d2a = _0x148803.dataset.storyEpisodeAssetTab === _0x5d2197;
      _0x148803.classList.toggle("is-active", _0x511d2a);
      _0x148803.setAttribute("aria-selected", String(_0x511d2a));
      _0x148803.tabIndex = _0x511d2a ? 0 : -1;
    });
    _0x1691c0.querySelectorAll("[data-story-episode-asset-panel]").forEach(_0x552187 => {
      const _0x10b392 = _0x552187.dataset.storyEpisodeAssetPanel === _0x5d2197;
      _0x552187.classList.toggle("is-active", _0x10b392);
      _0x552187.setAttribute("aria-hidden", String(!_0x10b392));
      _0x552187.inert = !_0x10b392;
    });
    const _0x2221d3 = _0x1691c0.querySelector("[data-story-episode-asset-help]");
    if (_0x2221d3) {
      _0x2221d3.textContent = getStoryEpisodeAssetRailHelp(_0x5d2197);
    }
    return true;
  }
  function _0x1cb088(_0x383b12, {
    errorMessage = ""
  } = {}) {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x281600 = normalizeText(_0x383b12);
    const _0x1bf220 = [..._0x4bf4f6.querySelectorAll("[data-story-reference-frame]")].find(_0x5bad03 => _0x5bad03.dataset.storyReferenceFrame === _0x281600);
    if (!_0x1bf220) {
      return false;
    }
    _0x1bf220.setAttribute("aria-busy", "false");
    const _0x521a39 = _0x1bf220.closest(".story-episode-frame-card")?.querySelector("[data-story-action=\"delete-clip-frame\"]");
    if (_0x521a39) {
      _0x521a39.disabled = false;
    }
    syncStoryClipFrameCardSaveError(_0x1bf220, errorMessage);
    return true;
  }
  function _0x51af77(_0x22d6a2) {
    if (_0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 3) {
      return false;
    }
    const _0x35d27f = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x272aeb = _0x3ffeb1.data.episodes.find(_0x535384 => _0x535384.id === _0x22d6a2);
    const _0x5450c9 = [...(_0x35d27f?.querySelectorAll(".story-episode-card[data-story-marquee-id]") || [])].find(_0x5b543d => _0x5b543d.dataset.storyMarqueeId === _0x22d6a2);
    if (!_0x35d27f || !_0x272aeb || !_0x5450c9) {
      return false;
    }
    const _0x47cf66 = documentObject.createElement("div");
    _0x47cf66.innerHTML = renderEpisodeCard(_0x3ffeb1, _0x272aeb);
    const _0x22f945 = _0x47cf66.firstElementChild;
    if (!_0x22f945) {
      return false;
    }
    _0x5450c9.replaceWith(_0x22f945);
    return true;
  }
  function _0x1365cf(_0x1a9e2c) {
    const _0x53912b = _0x4452c4();
    const _0x3b528b = findStoryAsset(_0x3ffeb1, _0x1a9e2c);
    const _0x2d3321 = [...(_0x53912b?.querySelectorAll("[data-story-asset-id]") || [])].find(_0x18bbfe => _0x18bbfe.dataset.storyAssetId === _0x1a9e2c);
    if (!_0x53912b || !_0x3b528b || !_0x2d3321) {
      return false;
    }
    const _0x8323f9 = documentObject.createElement("div");
    _0x8323f9.innerHTML = renderStoryAssetCard(_0x3ffeb1, _0x3b528b);
    const _0x3aecc5 = _0x8323f9.firstElementChild;
    if (!_0x3aecc5) {
      return false;
    }
    _0x2d3321.replaceWith(_0x3aecc5);
    return true;
  }
  function _0x7ca197() {
    const _0x41374f = _0x4452c4();
    const _0x555ea4 = getVisibleStoryAssets(_0x3ffeb1);
    const _0x25748f = getSelectedStoryAsset(_0x3ffeb1, _0x555ea4);
    const _0x41557c = _0x41374f?.querySelector(".story-asset-detail");
    if (!_0x41374f || !_0x25748f || _0x25748f.isLibraryAsset || !_0x41557c) {
      return false;
    }
    _0x41374f.querySelectorAll("[data-story-asset-id]").forEach(_0x147aa7 => {
      _0x147aa7.classList.toggle("is-selected", _0x147aa7.dataset.storyAssetId === _0x25748f.id);
    });
    const _0x2e3356 = getStoryAssetAppearances(_0x25748f);
    const _0x34b349 = getSelectedAssetAppearanceIndex(_0x3ffeb1, _0x25748f);
    const _0x19612e = getSelectedAssetAppearance(_0x3ffeb1, _0x25748f) || _0x25748f;
    const _0x465d71 = _0x2e3356.length > 1;
    const _0x27be49 = getStoryAssetGenerationControlState(_0x3ffeb1, _0x25748f.id, _0x19612e.id);
    const _0x3f4be3 = _0x27be49.isGenerating;
    const _0x47a42e = _0x41557c.querySelector(".story-asset-preview-slide");
    const _0x31816e = _0x41557c.querySelector(".story-asset-preview-wrap");
    _0x31816e?.querySelectorAll(".story-asset-preview-slide--outgoing").forEach(_0x45da9f => _0x45da9f.remove());
    if (_0x47a42e && _0x31816e && _0x3ffeb1.assetAppearanceMotion) {
      const _0x23806d = _0x47a42e.cloneNode(true);
      _0x23806d.classList.remove("img-preview-loading");
      _0x23806d.classList.add("story-asset-preview-slide--outgoing", "is-sliding-" + _0x3ffeb1.assetAppearanceMotion);
      _0x23806d.removeAttribute("aria-busy");
      _0x23806d.setAttribute("aria-hidden", "true");
      _0x23806d.querySelector(".img-loading-overlay")?.remove();
      _0x47a42e.after(_0x23806d);
      const _0x2bd33b = () => _0x23806d.remove();
      _0x23806d.addEventListener("animationend", _0x2bd33b, {
        once: true
      });
      windowObject.setTimeout(_0x2bd33b, 460);
    }
    _0x41557c.classList.remove("is-sliding-next", "is-sliding-previous");
    if (_0x3ffeb1.assetAppearanceMotion) {
      _0x41557c.offsetWidth;
      _0x41557c.classList.add("is-sliding-" + _0x3ffeb1.assetAppearanceMotion);
    }
    if (_0x47a42e) {
      _0x47a42e.classList.toggle("img-preview-loading", _0x3f4be3);
      _0x47a42e.setAttribute("aria-busy", String(_0x3f4be3));
      _0x47a42e.innerHTML = "" + renderImageOrEmpty({
        imageUrl: _0x19612e.imageUrl,
        alt: _0x25748f.name + " · " + (_0x19612e.name || "形象"),
        className: "story-asset-preview"
      }) + (_0x3f4be3 ? renderStoryAssetLoadingOverlay() : "");
    }
    if (_0x31816e) {
      const _0x2f8a48 = documentObject.createElement("div");
      _0x2f8a48.innerHTML = renderStoryAssetPreviewActions({
        state: _0x3ffeb1,
        asset: _0x25748f,
        appearance: _0x19612e,
        generationControl: _0x27be49
      });
      const _0x44259a = _0x31816e.querySelector(".story-asset-preview-actions");
      const _0x939b9c = _0x2f8a48.firstElementChild;
      if (_0x44259a && _0x939b9c) {
        _0x44259a.replaceWith(_0x939b9c);
      }
      _0x31816e.dataset.storyAppearanceWheel = String(_0x465d71);
      if (_0x465d71) {
        _0x31816e.tabIndex = 0;
        _0x31816e.setAttribute("aria-label", "滚动鼠标滚轮或按左右方向键切换形象");
      } else {
        _0x31816e.removeAttribute("tabindex");
        _0x31816e.removeAttribute("aria-label");
        _0x31816e.removeAttribute("title");
      }
      _0x31816e.querySelectorAll(".story-appearance-arrow").forEach(_0x4978c3 => {
        _0x4978c3.remove();
      });
    }
    const _0x32929a = _0x31816e?.querySelector(".story-asset-preview-caption");
    syncStoryCharacterVoiceCapsuleState(_0x32929a?.querySelector("[data-story-character-voice-capsule]"), _0x25748f);
    syncStoryCharacterVoicePlayerState(_0x32929a, _0x25748f);
    if (_0x465d71 && _0x32929a) {
      _0x32929a.insertAdjacentHTML("beforebegin", "" + renderStoryAppearanceArrow("previous") + renderStoryAppearanceArrow("next"));
    }
    const _0x467791 = _0x32929a?.querySelector("strong");
    const _0x18c306 = _0x32929a?.querySelector("[data-story-asset-caption-meta]");
    if (_0x467791) {
      _0x467791.textContent = _0x25748f.name;
    }
    if (_0x18c306) {
      _0x18c306.textContent = (_0x19612e.name || _0x25748f.role || "素材") + " · " + formatStoryAssetOccurrences(_0x19612e.occurrences || _0x25748f.occurrences || "当前项目") + (_0x465d71 ? " · " + (_0x34b349 + 1) + "/" + _0x2e3356.length : "");
    }
    const _0x4a85d1 = _0x32929a?.querySelector(".story-base-appearance-button");
    if (_0x4a85d1) {
      const _0x1b47e8 = isStoryAssetBaseAppearance(_0x25748f, _0x19612e);
      const _0x41439f = Boolean(isStoryAssetCardLoading(_0x3ffeb1, _0x25748f.id));
      _0x4a85d1.classList.toggle("is-active", _0x1b47e8);
      _0x4a85d1.classList.toggle("is-disabled", _0x41439f);
      _0x4a85d1.setAttribute("aria-pressed", String(_0x1b47e8));
      _0x4a85d1.setAttribute("aria-disabled", String(_0x41439f));
      _0x4a85d1.textContent = _0x1b47e8 ? "基础形象" : "设为基础形象";
    }
    const _0x396a81 = _0x41557c.querySelector(".story-asset-prompt-field");
    const _0x301a90 = _0x396a81?.querySelector("[data-story-asset-prompt]");
    const _0x3dcee0 = isStoryAssetBaseAppearance(_0x25748f, _0x19612e);
    const _0x1ae9e9 = _0x32929a?.querySelector(".story-asset-caption-tags");
    const _0x1fb396 = _0x1ae9e9?.querySelector(":scope > .story-asset-style-reference-control");
    if (_0x3ffeb1.allowAssetStyleReference !== false && _0x3dcee0 && _0x1ae9e9) {
      const _0x49202b = documentObject.createElement("div");
      _0x49202b.innerHTML = renderStoryAssetReferenceInput(_0x19612e, {
        disabled: _0x27be49.disabled
      });
      const _0x3ccb1d = _0x49202b.firstElementChild;
      if (_0x3ccb1d && _0x1fb396) {
        _0x1fb396.replaceWith(_0x3ccb1d);
      } else if (_0x3ccb1d) {
        _0x1ae9e9.insertBefore(_0x3ccb1d, _0x1ae9e9.querySelector("[data-story-character-voice-capsule]"));
      }
    } else {
      _0x1fb396?.remove();
    }
    if (_0x301a90) {
      _0x301a90.dataset.storyAssetPromptAssetId = _0x25748f.id;
      _0x301a90.dataset.storyAssetPromptAppearanceId = _0x19612e.id;
      _0x301a90.innerHTML = renderStoryAssetPromptMentions(_0x19612e.prompt || "", _0x19612e);
    }
    const _0x25721b = _0x41557c.querySelector("[data-story-home-param-trigger=\"asset-preset\"]");
    if (_0x25721b) {
      _0x25721b.disabled = _0x27be49.disabled;
    }
    const _0x4a2624 = _0x41557c.querySelector("[data-story-action=\"generate-asset\"]");
    if (_0x4a2624) {
      _0x4a2624.disabled = _0x27be49.disabled;
      syncStoryAsyncButton(_0x4a2624, _0x27be49.isGenerating);
      const _0x9738ba = _0x4a2624.querySelector("[data-story-asset-generate-label]");
      if (_0x9738ba) {
        _0x9738ba.textContent = _0x27be49.label;
      }
    }
    return true;
  }
  function _0xafdba0(_0x4b34e0) {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x77c7c3 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x1335d1 = _0x77c7c3?.querySelector(".story-clip-editor");
    const _0x5cadd3 = _0x77c7c3?.querySelector(".story-video-preview");
    const _0x1191c6 = _0x77c7c3?.querySelector(".story-clip-timeline");
    if (!_0x77c7c3 || !_0x1335d1 || !_0x5cadd3 || !_0x1191c6) {
      return false;
    }
    const _0x7d735b = documentObject.createElement("div");
    _0x7d735b.innerHTML = renderEpisodeDetail(_0x3ffeb1);
    const _0x40d114 = _0x7d735b.firstElementChild;
    const _0xf2c1d0 = _0x40d114?.querySelector(".story-clip-editor");
    const _0x1b57c8 = _0x40d114?.querySelector(".story-video-preview");
    const _0x362b18 = _0x1b57c8?.querySelector("[data-story-clip-preview-slide]");
    if (!_0xf2c1d0 || !_0x1b57c8 || !_0x362b18) {
      return false;
    }
    const _0x53996d = _0x4b34e0 === "previous" ? "previous" : "next";
    const _0x374bf0 = _0x5cadd3.querySelector("[data-story-clip-preview-slide]:not(.story-clip-preview-slide--outgoing)");
    _0x3d3f7d.get(_0x77c7c3)?.destroy?.();
    _0x3d3f7d.delete(_0x77c7c3);
    _0x1335d1.replaceWith(_0xf2c1d0);
    _0x1b57c8.classList.add("is-sliding-" + _0x53996d);
    if (_0x374bf0) {
      _0x374bf0.classList.add("story-clip-preview-slide--outgoing", "is-sliding-" + _0x53996d);
      _0x374bf0.setAttribute("aria-hidden", "true");
      _0x1b57c8.appendChild(_0x374bf0);
    }
    _0x5cadd3.replaceWith(_0x1b57c8);
    _0x1191c6.querySelectorAll("[data-story-clip-id]").forEach(_0xa407c6 => {
      const _0x2dae77 = _0xa407c6.dataset.storyClipId === _0x3ffeb1.selectedClipId;
      _0xa407c6.classList.toggle("is-selected", _0x2dae77);
      _0xa407c6.setAttribute("aria-current", _0x2dae77 ? "true" : "false");
    });
    _0xb44d47(_0x77c7c3);
    const _0x29337a = () => {
      _0x374bf0?.querySelector("video")?.pause?.();
      _0x374bf0?.remove();
      _0x1b57c8.classList.remove("is-sliding-next", "is-sliding-previous");
    };
    _0x374bf0?.addEventListener("animationend", _0x29337a, {
      once: true
    });
    windowObject.setTimeout(_0x29337a, 460);
    windowObject.requestAnimationFrame(() => {
      _0x1191c6.querySelector("[data-story-clip-id].is-selected")?.scrollIntoView?.({
        block: "nearest",
        inline: "nearest"
      });
    });
    return true;
  }
  function _0x73f277(_0x3cc288) {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0xc4fb8f = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0xb67c6 = _0xc4fb8f?.querySelector(".story-video-preview");
    const _0x4c3f8a = _0xb67c6?.querySelector("[data-story-clip-preview-slide]:not(.story-clip-preview-slide--outgoing)");
    if (!_0xc4fb8f || !_0xb67c6 || !_0x4c3f8a) {
      return false;
    }
    const _0x3072f3 = documentObject.createElement("div");
    _0x3072f3.innerHTML = renderEpisodeDetail(_0x3ffeb1);
    const _0x1e5a02 = _0x3072f3.firstElementChild;
    const _0x2b44ae = _0x1e5a02?.querySelector(".story-video-preview");
    const _0x30cd12 = _0x2b44ae?.querySelector("[data-story-clip-preview-slide]");
    if (!_0x2b44ae || !_0x30cd12) {
      return false;
    }
    const _0x2337b2 = _0x3cc288 === "previous" ? "previous" : "next";
    _0x3d3f7d.get(_0xc4fb8f)?.destroy?.();
    _0x3d3f7d.delete(_0xc4fb8f);
    _0x2b44ae.classList.add("is-result-sliding-" + _0x2337b2);
    _0x4c3f8a.classList.add("story-clip-preview-slide--outgoing", "is-result-sliding-" + _0x2337b2);
    _0x4c3f8a.setAttribute("aria-hidden", "true");
    _0x2b44ae.appendChild(_0x4c3f8a);
    _0xb67c6.replaceWith(_0x2b44ae);
    const _0x2800c6 = [..._0xc4fb8f.querySelectorAll(".story-clip-card-shell[data-story-clip-id]")].find(_0x382a1a => _0x382a1a.dataset.storyClipId === _0x3ffeb1.selectedClipId);
    const _0x40cc4d = [...(_0x1e5a02?.querySelectorAll(".story-clip-card-shell[data-story-clip-id]") || [])].find(_0x513738 => _0x513738.dataset.storyClipId === _0x3ffeb1.selectedClipId);
    if (_0x2800c6 && _0x40cc4d) {
      _0x2800c6.replaceWith(_0x40cc4d);
    }
    _0xb44d47(_0xc4fb8f);
    const _0x42e616 = () => {
      _0x4c3f8a.querySelector("video")?.pause?.();
      _0x4c3f8a.remove();
      _0x2b44ae.classList.remove("is-result-sliding-next", "is-result-sliding-previous");
    };
    _0x4c3f8a.addEventListener("animationend", _0x42e616, {
      once: true
    });
    windowObject.setTimeout(_0x42e616, 460);
    return true;
  }
  function _0x4cdd59() {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x4bc4e1 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x1b1e92 = _0x4bc4e1?.querySelector(".story-clip-timeline");
    if (!_0x4bc4e1 || !_0x1b1e92) {
      return false;
    }
    const _0x1a4df8 = _0x1b1e92.querySelector(".story-clip-strip");
    const _0x56776b = documentObject.createElement("div");
    _0x56776b.innerHTML = renderEpisodeDetail(_0x3ffeb1);
    const _0x10c8a0 = _0x56776b.firstElementChild?.querySelector(".story-clip-timeline");
    if (!_0x10c8a0) {
      return false;
    }
    const _0x2398b7 = Math.max(0, Number(_0x1a4df8?.scrollLeft) || 0);
    _0x1b1e92.replaceWith(_0x10c8a0);
    const _0xec7224 = _0x10c8a0.querySelector(".story-clip-strip");
    if (_0xec7224) {
      _0xec7224.scrollLeft = _0x2398b7;
    }
    return true;
  }
  function _0x1881c3() {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0xa6e469 = _0x4bf4f6.querySelector(".story-page.is-current [data-story-clip-reference-summary]");
    const _0x2ad417 = getSelectedEpisode(_0x3ffeb1);
    const _0x52c075 = getSelectedClip(_0x3ffeb1, _0x2ad417);
    if (!_0xa6e469 || !_0x2ad417 || !_0x52c075) {
      return false;
    }
    const _0x4fe2c8 = storyClipProduction.renderEpisode(_0x3ffeb1, _0x2ad417, _0x52c075);
    const _0x37a509 = _0x4fe2c8.referenceCounts;
    ["image", "audio", "video"].forEach(_0x20d354 => {
      const _0x5e5274 = _0xa6e469.querySelector("[data-story-reference-count=\"" + _0x20d354 + "\"]");
      if (_0x5e5274) {
        _0x5e5274.textContent = String(_0x37a509[_0x20d354 + "Count"]);
      }
    });
    _0xa6e469.setAttribute("aria-label", "使用参考，图片 " + _0x37a509.imageCount + "，音频 " + _0x37a509.audioCount + "，视频 " + _0x37a509.videoCount);
    const _0x40b2fe = _0x4bf4f6.querySelector(".story-page.is-current [data-story-clip-prompt-surface] .story-clip-prompt-toolbar > .node-ref-bar");
    if (_0x40b2fe) {
      const _0x3635f4 = documentObject.createElement("div");
      _0x3635f4.innerHTML = _0x4fe2c8.referenceBar;
      const _0x5765c8 = _0x3635f4.firstElementChild;
      const _0x1b7962 = _0x40b2fe.querySelector(".ref-thumb-container--readonly");
      const _0x5948fa = _0x5765c8?.querySelector(".ref-thumb-container--readonly");
      const _0xcba081 = _0x30e86d => Array.from(_0x30e86d?.querySelectorAll?.("[data-ref-readonly-key]") || []).map(_0x3f36ef => _0x3f36ef.dataset.refReadonlyKey || "").join("|");
      if (_0xcba081(_0x1b7962) !== _0xcba081(_0x5948fa)) {
        if (_0x1b7962 && _0x5948fa) {
          _0x1b7962.replaceWith(_0x5948fa);
        } else if (_0x1b7962) {
          _0x1b7962.remove();
        } else if (_0x5948fa) {
          _0x40b2fe.appendChild(_0x5948fa);
        }
        if (_0x5765c8) {
          _0x40b2fe.className = _0x5765c8.className;
        }
      }
    }
    return true;
  }
  function _0x1c9ad4() {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x2a78d0 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x463276 = _0x2a78d0?.querySelector("[data-story-clip-prompt]");
    const _0x889a1c = _0x2a78d0?.querySelector(".story-clip-adjustment-control");
    const _0xb01beb = getSelectedEpisode(_0x3ffeb1);
    const _0xb20b8f = getSelectedClip(_0x3ffeb1, _0xb01beb);
    if (!_0x2a78d0 || !_0x463276 || !_0x889a1c || !_0xb01beb || !_0xb20b8f) {
      return false;
    }
    _0x463276.innerHTML = renderStoryClipPromptMentions(_0xb20b8f.prompt || "", {
      assets: _0x3ffeb1.data.assets,
      episode: _0xb01beb,
      clipFrames: _0x3ffeb1.data.clipFrames
    });
    syncStoryClipPromptPillPresentation(_0x463276, _0x3ffeb1.data.assets, _0x3ffeb1.data.clipFrames);
    _0x463276.querySelectorAll(".ref-pill").forEach(_0x1b1a6c => {
      _0x2ab409(_0x1b1a6c, _0x463276, _0xb20b8f);
    });
    const _0x4116de = documentObject.createElement("div");
    _0x4116de.innerHTML = storyClipProduction.renderEpisode(_0x3ffeb1, _0xb01beb, _0xb20b8f).adjustmentControl;
    const _0x27dd6c = _0x4116de.firstElementChild;
    if (!_0x27dd6c) {
      return false;
    }
    _0x889a1c.replaceWith(_0x27dd6c);
    return true;
  }
  function _0x62a3ea() {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x3efd58 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x49e63d = _0x3efd58?.querySelector(".story-clip-adjustment-control");
    const _0x258981 = _0x49e63d?.querySelector("[data-story-action=\"toggle-clip-adjustment\"]");
    const _0x361b1c = getSelectedEpisode(_0x3ffeb1);
    const _0x305fbb = getSelectedClip(_0x3ffeb1, _0x361b1c);
    if (!_0x3efd58 || !_0x49e63d || !_0x258981 || !_0x361b1c || !_0x305fbb) {
      return false;
    }
    const _0x57a7c9 = _0x49e63d.querySelector("[data-story-clip-adjustment-bar]");
    const _0x5f354f = storyClipProduction.renderEpisode(_0x3ffeb1, _0x361b1c, _0x305fbb).adjustmentBar;
    _0x258981.setAttribute("aria-expanded", String(_0x3ffeb1.clipAdjustmentOpen === true));
    if (!_0x5f354f) {
      _0x57a7c9?.remove();
      return true;
    }
    const _0x4fbeb6 = documentObject.createElement("div");
    _0x4fbeb6.innerHTML = _0x5f354f;
    const _0x59dd71 = _0x4fbeb6.firstElementChild;
    if (!_0x59dd71) {
      return false;
    }
    if (_0x57a7c9) {
      _0x57a7c9.replaceWith(_0x59dd71);
    } else {
      _0x49e63d.appendChild(_0x59dd71);
    }
    return true;
  }
  function _0x2c3482({
    focus = ""
  } = {}) {
    const _0x276b6b = _0x4bf4f6.querySelector(".story-page.is-current [data-story-clip-prompt-history]");
    const _0x56d664 = _0x276b6b?.querySelector("[data-story-action=\"toggle-clip-prompt-history\"]");
    const _0x148ba2 = _0x276b6b?.querySelector("[data-story-clip-prompt-history-panel]");
    if (!_0x276b6b || !_0x56d664 || !_0x148ba2) {
      return false;
    }
    const _0x4a497b = _0x3ffeb1.clipPromptHistoryOpen === true;
    _0x56d664.setAttribute("aria-expanded", String(_0x4a497b));
    _0x148ba2.hidden = !_0x4a497b;
    if (focus === "trigger") {
      _0x56d664.focus();
    }
    if (focus === "first") {
      _0x148ba2.querySelector("[data-story-action=\"restore-clip-prompt-history\"]")?.focus();
    }
    return true;
  }
  function _0x228c7a({
    focus = "",
    updateSelection = false
  } = {}) {
    const _0x4f39d7 = _0x4bf4f6.querySelector(".story-page.is-current [data-story-clip-adjustment-bar]");
    const _0x442ca7 = _0x4f39d7?.querySelector("[data-story-action=\"toggle-clip-adjustment-mode\"]");
    const _0x189cc6 = _0x4f39d7?.querySelector(".story-clip-adjustment-mode-menu");
    if (!_0x4f39d7 || !_0x442ca7 || !_0x189cc6) {
      return false;
    }
    const _0x21b631 = _0x3ffeb1.clipAdjustmentPromptModeOpen === true;
    _0x442ca7.setAttribute("aria-expanded", String(_0x21b631));
    _0x189cc6.hidden = !_0x21b631;
    if (updateSelection) {
      const _0x485ed4 = getSelectedEpisode(_0x3ffeb1);
      const _0x36b590 = getSelectedClip(_0x3ffeb1, _0x485ed4);
      const _0x5bdc89 = normalizeStoryPromptMode(_0x36b590?.promptMode || _0x485ed4?.promptMode || _0x3ffeb1.data.project?.planning?.promptMode, {
        allowDeveloperModes: true
      });
      const _0x5eb34e = normalizeStoryPromptMode(_0x3ffeb1.clipAdjustmentPromptMode || _0x5bdc89, {
        allowDeveloperModes: true
      });
      const _0x176852 = _0x4f39d7.querySelector("[data-story-clip-adjustment-mode-label]");
      if (_0x176852) {
        _0x176852.textContent = getStoryPromptModeLabel(_0x5eb34e);
      }
      _0x189cc6.querySelectorAll("[data-story-clip-adjustment-mode-option]").forEach(_0x4dda6c => {
        const _0x5778e9 = normalizeText(_0x4dda6c.dataset.storyClipAdjustmentModeOption) === _0x5eb34e;
        _0x4dda6c.classList.toggle("is-selected", _0x5778e9);
        _0x4dda6c.setAttribute("aria-selected", String(_0x5778e9));
      });
      const _0x1b9e33 = _0x4f39d7.querySelector("[data-story-action=\"generate-clip-adjustment\"]");
      if (_0x1b9e33) {
        _0x1b9e33.disabled = !normalizeText(_0x3ffeb1.clipAdjustmentInstruction) && _0x5eb34e === _0x5bdc89;
      }
    }
    if (focus === "trigger") {
      _0x442ca7.focus();
    }
    if (focus === "selected") {
      (_0x189cc6.querySelector("[aria-selected=\"true\"]") || _0x189cc6.querySelector("button"))?.focus();
    }
    if (focus === "instruction") {
      _0x4f39d7.querySelector("[data-story-clip-adjustment-instruction]")?.focus();
    }
    return true;
  }
  function _0x1cc89c() {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x255a3a = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x1beb55 = _0x255a3a?.querySelector(".story-clip-selection-controls");
    const _0x246289 = _0x255a3a?.querySelector("[data-story-clip-preview-slide]");
    const _0x413f5f = _0x255a3a?.querySelector(".story-clip-timeline");
    if (!_0x255a3a || !_0x1beb55 || !_0x246289 || !_0x413f5f) {
      return false;
    }
    const _0x355013 = documentObject.createElement("div");
    _0x355013.innerHTML = renderEpisodeDetail(_0x3ffeb1);
    const _0x34e4b2 = _0x355013.firstElementChild;
    const _0x365c35 = _0x34e4b2?.querySelector(".story-clip-selection-controls");
    const _0x3b65f8 = _0x34e4b2?.querySelector("[data-story-clip-preview-slide]");
    const _0x50e40b = _0x34e4b2?.querySelector(".story-clip-timeline");
    const _0x1ceab7 = Array.from(_0x413f5f.querySelectorAll(".story-clip-card-shell[data-story-clip-id]"));
    const _0x439b86 = Array.from(_0x50e40b?.querySelectorAll?.(".story-clip-card-shell[data-story-clip-id]") || []);
    if (!_0x365c35 || !_0x3b65f8 || !_0x50e40b || _0x1ceab7.length !== _0x439b86.length) {
      return false;
    }
    const _0x4b7170 = new Map(_0x1ceab7.map(_0x3e8c7d => [normalizeText(_0x3e8c7d.dataset.storyClipId), _0x3e8c7d]));
    if (_0x439b86.some(_0x124995 => !_0x4b7170.has(normalizeText(_0x124995.dataset.storyClipId)))) {
      return false;
    }
    if (_0x1beb55.outerHTML !== _0x365c35.outerHTML) {
      _0x1beb55.replaceWith(_0x365c35);
    }
    if (_0x246289.innerHTML !== _0x3b65f8.innerHTML) {
      _0x246289.innerHTML = _0x3b65f8.innerHTML;
      _0x3d3f7d.get(_0x255a3a)?.refreshVideoPreview?.();
    }
    _0x439b86.forEach(_0xe55ffa => {
      const _0x542c43 = _0x4b7170.get(normalizeText(_0xe55ffa.dataset.storyClipId));
      if (_0x542c43?.outerHTML !== _0xe55ffa.outerHTML) {
        _0x542c43.replaceWith(_0xe55ffa);
      }
    });
    return true;
  }
  function _0x88077f() {
    if (_0x3ffeb1.view !== "episode") {
      return false;
    }
    const _0x56526c = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0xd7eaba = _0x56526c?.querySelector(".story-clip-timeline");
    if (!_0x56526c || !_0xd7eaba) {
      return false;
    }
    const _0x293091 = _0x56526c.querySelector(".story-clip-selection-controls");
    const _0x3823f8 = documentObject.createElement("div");
    _0x3823f8.innerHTML = storyClipProduction.renderEpisode(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1)).selectionControls;
    const _0x4526b3 = _0x3823f8.firstElementChild;
    if (_0x293091 && _0x4526b3) {
      _0x293091.replaceWith(_0x4526b3);
    }
    const _0xbe8b8f = new Set((Array.isArray(_0x3ffeb1.selectedClipGenerationIds) ? _0x3ffeb1.selectedClipGenerationIds : []).map(_0x461e0a => normalizeText(_0x461e0a)).filter(Boolean));
    _0xd7eaba.classList.toggle("is-selection-mode", _0x3ffeb1.clipSelectionMode);
    const _0x2fc758 = _0xd7eaba.querySelector(".story-clip-timeline-header small");
    if (_0x2fc758) {
      _0x2fc758.textContent = _0x3ffeb1.clipSelectionMode ? "点击片段选择需要生成的视频" : "点击片段切换提示词和视频结果";
    }
    _0xd7eaba.querySelectorAll("[data-story-clip-id]").forEach(_0x5c7fae => {
      const _0xfb9abe = _0xbe8b8f.has(normalizeText(_0x5c7fae.dataset.storyClipId));
      _0x5c7fae.classList.toggle("is-selection-mode", _0x3ffeb1.clipSelectionMode);
      _0x5c7fae.classList.toggle("is-checked", _0x3ffeb1.clipSelectionMode && _0xfb9abe);
      if (!_0x3ffeb1.clipSelectionMode) {
        _0x5c7fae.classList.remove("is-marquee-hit");
      }
      _0x5c7fae.setAttribute("aria-pressed", _0x3ffeb1.clipSelectionMode ? String(_0xfb9abe) : "false");
      const _0x30c42e = _0x5c7fae.closest(".story-clip-card-shell");
      const _0x374e24 = !_0x3ffeb1.clipSelectionMode && normalizeText(_0x3ffeb1.pendingDeleteClipId) === normalizeText(_0x5c7fae.dataset.storyClipId);
      _0x30c42e?.classList.toggle("is-delete-confirming", _0x374e24);
      const _0x10df3 = _0x30c42e?.querySelector(".story-clip-delete-trigger");
      const _0x1fc518 = _0x30c42e?.querySelector(".story-clip-delete-confirm");
      if (_0x10df3) {
        _0x10df3.hidden = _0x3ffeb1.clipSelectionMode || _0x374e24;
      }
      if (_0x1fc518) {
        _0x1fc518.hidden = _0x3ffeb1.clipSelectionMode || !_0x374e24;
      }
      let _0x4c0aa5 = _0x5c7fae.querySelector(".story-clip-select-indicator");
      if (!_0x3ffeb1.clipSelectionMode) {
        _0x4c0aa5?.remove();
        return;
      }
      if (!_0x4c0aa5) {
        _0x4c0aa5 = documentObject.createElement("span");
        _0x4c0aa5.className = "story-asset-select-indicator story-clip-select-indicator";
        _0x4c0aa5.setAttribute("aria-hidden", "true");
        _0x5c7fae.prepend(_0x4c0aa5);
      }
      _0x4c0aa5.textContent = _0xfb9abe ? "✓" : "";
    });
    return true;
  }
  function _0x2984b3() {
    const _0x1dd97d = _0x4452c4()?.querySelectorAll("[data-story-asset-batch-control]") || [];
    const _0x3b84df = storyAssetSettingsProjection.projectAssetControl("batch-generation", {
      state: _0x3ffeb1
    });
    let _0x326d02 = false;
    _0x1dd97d.forEach(_0x211cb1 => {
      _0x326d02 = updateStoryAssetBatchButtonLabel(_0x211cb1, _0x3b84df.label) || _0x326d02;
    });
    return _0x326d02;
  }
  function _0x501339({
    previousMode = ""
  } = {}) {
    if (_0x1de79f) {
      return null;
    }
    _0x4f8626 = true;
    _0x3b5272.hidden = false;
    _0x3b5272.setAttribute("aria-hidden", "false");
    _0xe5dd9c({
      capturePageState: previousMode === "story"
    });
    return _0x3b5272;
  }
  function _0x362be8() {
    if (_0x1de79f) {
      return false;
    }
    if (_0x4f8626) {
      _0x12ca9b();
      _0x3c4e04({
        immediate: true
      });
    }
    _0x4f8626 = false;
    _0x277232();
    _0x3cb00d();
    _0x493da1();
    _0x146793();
    _0x385608();
    _0x15093f();
    _0x5c09e0();
    _0x1e92bb();
    _0x3b5272.hidden = true;
    _0x3b5272.setAttribute("aria-hidden", "true");
    return true;
  }
  function _0x146793(_0x6b2ea2 = null) {
    _0x3b5272.querySelectorAll(".story-model-picker.is-open").forEach(_0x306da0 => {
      if (_0x306da0 === _0x6b2ea2) {
        return;
      }
      _0x306da0.classList.remove("is-open");
      _0x306da0.querySelector("[data-story-model-trigger]")?.setAttribute("aria-expanded", "false");
    });
  }
  function _0x385608(_0x41836e = null) {
    _0x3b5272.querySelectorAll(".story-home-param-picker.is-open").forEach(_0x3581ed => {
      if (_0x3581ed === _0x41836e) {
        return;
      }
      _0x3581ed.classList.remove("is-open");
      _0x3581ed.querySelector("[data-story-home-param-trigger]")?.setAttribute("aria-expanded", "false");
    });
  }
  function _0x1d7b42(_0x1b9fc9 = "") {
    const _0x576e4b = normalizeText(_0x1b9fc9);
    _0x3ffeb1.openProjectMenuId = _0x576e4b;
    _0x3b5272.querySelectorAll("[data-story-open-project]").forEach(_0xb38e13 => {
      const _0x240336 = normalizeText(_0xb38e13.dataset.storyOpenProject) === _0x576e4b;
      _0xb38e13.classList.toggle("is-menu-open", _0x240336);
      const _0x5aec7b = _0xb38e13.querySelector("[data-story-action=\"toggle-project-menu\"]");
      const _0x18acbc = _0xb38e13.querySelector("[data-story-project-menu]");
      _0x5aec7b?.setAttribute("aria-expanded", String(_0x240336));
      if (_0x18acbc) {
        _0x18acbc.hidden = !_0x240336;
        _0x18acbc.setAttribute("aria-hidden", String(!_0x240336));
      }
    });
  }
  function _0x2255e5() {
    _0x3b5272.querySelectorAll("[data-story-project-sort-wrap].is-open").forEach(_0x53d308 => {
      _0x53d308.classList.remove("is-open");
      _0x53d308.querySelector("[data-story-action=\"toggle-project-sort-menu\"]")?.setAttribute("aria-expanded", "false");
      _0x53d308.querySelector("[data-story-project-sort-menu]")?.setAttribute("aria-hidden", "true");
    });
  }
  function _0x2963aa(_0x207eec, _0x5cbc3e) {
    const _0x2eb28b = _0x207eec?.querySelector("[data-story-project-sort-menu]");
    if (!_0x207eec || !_0x5cbc3e || !_0x2eb28b) {
      return;
    }
    _0x2255e5();
    _0x207eec.classList.add("is-open");
    _0x5cbc3e.setAttribute("aria-expanded", "true");
    _0x2eb28b.setAttribute("aria-hidden", "false");
  }
  function _0x15093f(_0x112485 = null) {
    _0x3b5272.querySelectorAll(".story-asset-batch-menu-wrap.is-open").forEach(_0x3a6654 => {
      if (_0x3a6654 === _0x112485) {
        return;
      }
      _0x9612c5(_0x3a6654);
      _0x3a6654.classList.remove("is-open");
      _0x3a6654.querySelector(".story-asset-batch-trigger")?.setAttribute("aria-expanded", "false");
    });
  }
  function _0x52ce48(_0x2b7f99, _0x364d53) {
    const _0x387474 = _0x2b7f99?.querySelector(".story-asset-batch-menu");
    if (!_0x2b7f99 || !_0x364d53 || !_0x387474) {
      return;
    }
    _0x15093f(_0x2b7f99);
    _0x9612c5(_0x2b7f99);
    syncWorkspaceInlineMenuExpandedWidth(_0x387474);
    _0x2b7f99.classList.add("is-open");
    _0x364d53.setAttribute("aria-expanded", "true");
  }
  const _0x228741 = createWorkspaceMenuController({
    root: _0x3b5272,
    wrapperSelector: ".story-canvas-sync-menu-wrap",
    triggerSelector: "[data-story-action=\"toggle-canvas-sync-menu\"]",
    menuSelector: ".story-canvas-sync-menu",
    optionSelector: ".story-canvas-sync-option"
  });
  function _0x5c09e0(_0x138a43 = null) {
    _0x228741.close(_0x138a43);
  }
  function _0x4221d9(_0x14e194, _0x3f10cc) {
    return _0x228741.open(_0x14e194, _0x3f10cc);
  }
  function _0x33004c(_0x54cddb) {
    return _0x228741.handleKeyDown(_0x54cddb);
  }
  function _0x4e3659({
    pending = false,
    scope = "",
    captureFocus = false,
    refreshToolbar = true
  } = {}) {
    const _0x5c7713 = _0x3ffeb1.canvasSyncPending === true;
    if (pending && captureFocus && !_0x5c7713) {
      _0x15d050 = documentObject.activeElement;
      _0x3ebf21 = _0x15d050?.closest?.(".story-canvas-sync-menu-wrap:not(.story-clip-export-menu-wrap)") ? ".story-canvas-sync-menu-wrap:not(.story-clip-export-menu-wrap) [data-story-action=\"toggle-canvas-sync-menu\"]" : "";
    }
    _0x3ffeb1.canvasSyncPending = pending === true;
    _0x3ffeb1.canvasSyncScope = _0x3ffeb1.canvasSyncPending ? normalizeText(scope) : "";
    _0x5c09e0();
    _0x3b5272.classList.toggle("is-canvas-sync-pending", _0x3ffeb1.canvasSyncPending);
    _0x3b5272.setAttribute("aria-busy", _0x3ffeb1.canvasSyncPending ? "true" : "false");
    if (_0x1d7010) {
      _0x1d7010.inert = _0x3ffeb1.canvasSyncPending;
      if (_0x3ffeb1.canvasSyncPending) {
        _0x1d7010.setAttribute("inert", "");
      } else {
        _0x1d7010.removeAttribute("inert");
      }
    }
    if (_0x3e2999) {
      _0x3e2999.hidden = !_0x3ffeb1.canvasSyncPending;
      _0x3e2999.setAttribute("aria-hidden", _0x3ffeb1.canvasSyncPending ? "false" : "true");
    }
    if (refreshToolbar) {
      _0x3e894e();
    }
    if (_0x3ffeb1.canvasSyncPending) {
      if (captureFocus && !_0x5c7713) {
        try {
          _0x3e2999?.focus?.({
            preventScroll: true
          });
        } catch {
          _0x3e2999?.focus?.();
        }
      }
      return;
    }
    const _0x351ac8 = _0x15d050?.isConnected ? _0x15d050 : _0x3ebf21 ? _0x3b5272.querySelector(_0x3ebf21) : null;
    _0x15d050 = null;
    _0x3ebf21 = "";
    if (_0x351ac8 && _0x351ac8.isConnected && !_0x3b5272.hidden) {
      try {
        _0x351ac8.focus?.({
          preventScroll: true
        });
      } catch {
        _0x351ac8.focus?.();
      }
    }
  }
  function _0x1e92bb(_0x63dfa6 = null) {
    _0x3b5272.querySelectorAll(".story-character-voice-history-wrap.is-open").forEach(_0x494456 => {
      if (_0x494456 === _0x63dfa6) {
        return;
      }
      _0x494456.classList.remove("is-open");
      _0x494456.querySelector("[data-story-action=\"toggle-character-voice-history\"]")?.setAttribute("aria-expanded", "false");
      _0x494456.querySelector(".story-character-voice-history-panel")?.setAttribute("aria-hidden", "true");
    });
  }
  function _0x33f097(_0x31d2f7, _0x3bed3a) {
    const _0x5a94dc = _0x31d2f7?.querySelector("[data-story-style-library]");
    const _0x3a6c9a = _0x31d2f7?.querySelector("[data-story-style-custom-editor]");
    if (!_0x5a94dc || !_0x3a6c9a) {
      return;
    }
    _0x5a94dc.hidden = _0x3bed3a;
    _0x3a6c9a.hidden = !_0x3bed3a;
    _0x31d2f7.classList.toggle("is-custom-editing", _0x3bed3a);
    if (_0x3bed3a) {
      windowObject.requestAnimationFrame(() => {
        const _0x500d93 = _0x3a6c9a.querySelector("[data-story-style-custom-input]");
        _0x500d93?.focus();
        _0x500d93?.setSelectionRange?.(_0x500d93.value.length, _0x500d93.value.length);
      });
    }
  }
  function _0x26472d(_0x4009f0) {
    const _0x34d4f0 = _0x4009f0?.querySelector("[data-story-style-category].is-active")?.dataset.storyStyleCategory || "all";
    const _0x7e1a41 = normalizeText(_0x4009f0?.querySelector("[data-story-style-search-input]")?.value).toLowerCase();
    let _0x34de8c = 0;
    _0x4009f0?.querySelectorAll("[data-story-style-card-category]").forEach(_0x462c9f => {
      const _0x229259 = _0x462c9f.dataset.storyStyleCardCategory;
      const _0xd223fc = _0x34d4f0 === "all" || _0x229259 === _0x34d4f0;
      const _0x197a74 = !_0x7e1a41 || String(_0x462c9f.dataset.storyStyleSearch || "").includes(_0x7e1a41);
      _0x462c9f.hidden = !_0xd223fc || !_0x197a74;
      if (!_0x462c9f.hidden) {
        _0x34de8c += 1;
      }
    });
    const _0x39d127 = _0x4009f0?.querySelector("[data-story-style-empty]");
    if (_0x39d127) {
      _0x39d127.hidden = _0x34de8c > 0;
    }
  }
  function _0x377b58(_0x2fa0d8) {
    const _0x2ecd51 = normalizeStoryAspectRatio(_0x2fa0d8);
    _0x3ffeb1.data.project.aspectRatio = _0x2ecd51;
    _0x3ffeb1.videoGenerationParams = applyStoryAspectRatioToVideoGenerationParams(_0x3ffeb1.models.video, _0x3ffeb1.videoGenerationParams, _0x2ecd51);
    _0x3ffeb1.videoGenerationParamsByModel = {
      ..._0x3ffeb1.videoGenerationParamsByModel,
      [_0x3ffeb1.models.video]: {
        ..._0x3ffeb1.videoGenerationParams
      }
    };
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
  }
  function _0xfbf476(_0x1a4c0f, _0x59b980, {
    renderWorkspace = true
  } = {}) {
    const _0x304bd9 = normalizeStoryProjectPlanning(_0x3ffeb1.data.project, {
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    if (_0x1a4c0f === "targetLocale") {
      _0x3ffeb1.replicationTargetLocale = getStoryReplicationLocale(_0x59b980).value;
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c();
      return;
    }
    const _0xfc8a98 = _0x1a4c0f === "episodeCount" ? normalizeStoryEpisodeCount(_0x59b980) : _0x1a4c0f === "promptMode" ? normalizeStoryPromptMode(_0x59b980, {
      allowDeveloperModes: _0x3ffeb1.developerModeAvailable
    }) : normalizeStorySceneMaxSeconds(_0x59b980);
    _0x3ffeb1.data.project.planning = {
      ..._0x304bd9,
      [_0x1a4c0f]: _0xfc8a98
    };
    if (_0x1a4c0f === "promptMode" && applyStoryPromptModeVideoModelDefault(_0x3ffeb1, _0xfc8a98)) {
      _0x4a6311();
    }
    _0x3c4e04({
      immediate: true
    });
    if (renderWorkspace) {
      _0xe5dd9c();
    }
    return _0xfc8a98;
  }
  function _0x5b40bc(_0xf2a6d9) {
    const _0x15ddb4 = Number(_0xf2a6d9?.value);
    if (!Number.isInteger(_0x15ddb4) || _0x15ddb4 < 1 || _0x15ddb4 > STORY_EPISODE_COUNT_MAX) {
      _0xf2a6d9?.setAttribute("aria-invalid", "true");
      _0x1ce8f7("请输入 1-" + STORY_EPISODE_COUNT_MAX + " 的整数集数。", "warn");
      _0xf2a6d9?.focus();
      return false;
    }
    _0xf2a6d9?.setAttribute("aria-invalid", "false");
    const _0x493538 = _0xfbf476("episodeCount", _0x15ddb4, {
      renderWorkspace: false
    });
    _0x257c64(_0xf2a6d9, _0x493538);
    return true;
  }
  function _0x257c64(_0x470dd3, _0xdb5b0c) {
    const _0x3f22da = _0x470dd3?.closest(".story-episode-count-custom-editor");
    const _0x321e37 = _0x3f22da?.closest(".story-planning-picker");
    if (!_0x3f22da || !_0x321e37) {
      return false;
    }
    const _0x149389 = !STORY_EPISODE_COUNT_OPTIONS.includes(_0xdb5b0c);
    _0x3f22da.classList.toggle("is-selected", _0x149389);
    _0x3f22da.setAttribute("aria-selected", String(_0x149389));
    _0x470dd3.value = _0x149389 ? String(_0xdb5b0c) : "";
    _0x321e37.querySelectorAll("[data-story-planning-field=\"episodeCount\"]").forEach(_0x202759 => {
      const _0xdb908 = Number(_0x202759.dataset.storyPlanningOption) === _0xdb5b0c;
      _0x202759.classList.toggle("is-selected", _0xdb908);
      _0x202759.setAttribute("aria-selected", String(_0xdb908));
    });
    const _0x3b55e8 = _0x321e37.querySelector("[data-story-planning-trigger-label]");
    if (_0x3b55e8) {
      _0x3b55e8.textContent = _0xdb5b0c + "集";
    }
    return true;
  }
  function _0x67e5f6(_0x4188f8) {
    windowObject.setTimeout(() => {
      if (!_0x4188f8?.isConnected) {
        return;
      }
      if (normalizeText(_0x4188f8.value)) {
        _0x5b40bc(_0x4188f8);
      } else {
        _0x257c64(_0x4188f8, normalizeStoryEpisodeCount(_0x3ffeb1.data.project?.planning?.episodeCount));
      }
    }, 0);
  }
  function _0x2f3ae6(_0xc59dfe) {
    const _0x4a83d3 = resolveStoryStyleSelection({
      styleId: _0xc59dfe
    });
    if (_0x4a83d3.isCustom) {
      return;
    }
    const _0x5ecea7 = resolveStoryStyleSelection({
      styleId: _0x3ffeb1.data.project.videoStyleId,
      stylePrompt: _0x3ffeb1.data.project.videoStylePrompt,
      videoStyle: _0x3ffeb1.data.project.videoStyle
    }).stylePrompt;
    _0x3ffeb1.data.project.videoStyleId = _0x4a83d3.styleId;
    _0x3ffeb1.data.project.videoStylePrompt = _0x4a83d3.stylePrompt;
    _0x3ffeb1.data.project.videoStyle = _0x4a83d3.label;
    _0x3ffeb1.data = syncStoryPlanningVisualStyle(_0x3ffeb1.data, {
      previousStyle: _0x5ecea7,
      visualStyle: _0x4a83d3.stylePrompt
    });
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
  }
  function _0x205585(_0xa1f529) {
    const _0x2f404d = normalizeText(_0xa1f529?.value).slice(0, STORY_CUSTOM_STYLE_MAX_CHARACTERS);
    if (!_0x2f404d) {
      _0x1ce8f7("请输入自定义风格提示词。", "warn");
      _0xa1f529?.focus();
      return;
    }
    const _0x2123de = resolveStoryStyleSelection({
      styleId: _0x3ffeb1.data.project.videoStyleId,
      stylePrompt: _0x3ffeb1.data.project.videoStylePrompt,
      videoStyle: _0x3ffeb1.data.project.videoStyle
    }).stylePrompt;
    _0x3ffeb1.data.project.videoStyleId = STORY_STYLE_CUSTOM_ID;
    _0x3ffeb1.data.project.videoStylePrompt = _0x2f404d;
    _0x3ffeb1.data.project.customVideoStylePrompt = _0x2f404d;
    _0x3ffeb1.data.project.videoStyle = _0x2f404d;
    _0x3ffeb1.data = syncStoryPlanningVisualStyle(_0x3ffeb1.data, {
      previousStyle: _0x2123de,
      visualStyle: _0x2f404d
    });
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
  }
  function _0x4dc275({
    resetStep = false,
    restoreView = false
  } = {}) {
    if (!restoreView || !["project", "episode"].includes(_0x3ffeb1.view)) {
      _0x3ffeb1.view = "project";
    }
    if (resetStep || _0x3ffeb1.data?.project?.outlineStatus === "stale" || !canEnterStoryWorkspaceStep(_0x3ffeb1.data, _0x3ffeb1.step)) {
      _0x3ffeb1.step = 1;
    }
    if (_0x3ffeb1.view === "episode" && !canEnterStoryWorkspaceStep(_0x3ffeb1.data, 3)) {
      _0x3ffeb1.view = "project";
    }
    _0xe5dd9c({
      direction: "forward"
    });
  }
  function _0x82ecdd(_0x3a7728) {
    const _0x2aca1c = normalizeText(_0x3a7728);
    const _0x432df8 = normalizeText(_0x3ffeb1.data?.project?.id);
    const _0x5058e6 = _0x3ffeb1.projects.find(_0x38fb50 => String(_0x38fb50?.id) === String(_0x3a7728 || ""));
    _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
    if (_0x2aca1c && _0x2aca1c === _0x432df8 && _0x3ffeb1.hasCreatedProject) {
      applyStoryProjectUiState(_0x3ffeb1, _0x5058e6?.ui, _0x3ffeb1.data);
      _0x14d6f1(_0x3ffeb1.data);
      const _0x156a22 = getSelectedEpisode(_0x3ffeb1);
      _0x2d0dd3(getSelectedClip(_0x3ffeb1, _0x156a22), {
        episode: _0x156a22,
        enteringEpisode: _0x3ffeb1.view === "episode"
      });
      _0x4dc275({
        restoreView: true
      });
      _0x4b7537();
      _0x3c4e04({
        immediate: true
      });
      _0x8e94a4();
      _0x2841ee();
      return;
    }
    if (!_0x5058e6?.data) {
      return;
    }
    _0x35e390();
    _0x25f8df({
      clearState: true
    });
    _0xb7606d();
    const _0x41c153 = _0x3ffeb1.projects.find(_0x3ebe39 => normalizeText(_0x3ebe39?.id || _0x3ebe39?.data?.project?.id) === _0x2aca1c) || _0x5058e6;
    _0x3ffeb1.data = _0x52afbd.get(_0x2aca1c) || normalizeStoryWorkspaceAssetData(_0x5d0718(_0x41c153.data));
    _0x52afbd.set(_0x2aca1c, _0x3ffeb1.data);
    _0x3ffeb1.scriptMode = normalizeStoryScriptMode(_0x3ffeb1.data.project?.scriptMode);
    _0x3ffeb1.data.project.planning = normalizeStoryProjectPlanning(_0x3ffeb1.data.project, {
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    const _0x46c04d = _0x3ffeb1.data.project?.sourceDocument;
    if (_0x46c04d && typeof _0x46c04d === "object") {
      _0x3ffeb1.scriptFileName = String(_0x46c04d.fileName || "");
      _0x3ffeb1.scriptText = String(_0x46c04d.text || "").slice(0, STORY_SCRIPT_MAX_CHARACTERS);
      _0x3ffeb1.scriptCharacterCount = Number.isFinite(_0x46c04d.characterCount) ? _0x46c04d.characterCount : _0x3ffeb1.scriptText.length;
    }
    _0x3ffeb1.assetSelectionMode = false;
    _0x3ffeb1.selectedAssetIds = [];
    _0x3ffeb1.scriptSelectionMode = false;
    _0x3ffeb1.selectedScriptEpisodeIds = [];
    _0x3ffeb1.characterVoiceEditor = null;
    _0x3ffeb1.characterVoicePanelMotion = "";
    _0x3ffeb1.pendingCharacterVoiceAssetId = "";
    _0x3ffeb1.pendingDeleteClipId = "";
    _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
    _0x3ffeb1.clipSelectionMode = false;
    _0x3ffeb1.selectedClipGenerationIds = [];
    applyStoryProjectUiState(_0x3ffeb1, _0x41c153.ui, _0x3ffeb1.data);
    _0x14d6f1(_0x3ffeb1.data);
    _0x3ffeb1.projectTitleEdited = _0x41c153.projectTitleEdited === true;
    _0x3ffeb1.hasCreatedProject = true;
    const _0x373bc2 = getSelectedEpisode(_0x3ffeb1);
    _0x2d0dd3(getSelectedClip(_0x3ffeb1, _0x373bc2), {
      episode: _0x373bc2,
      enteringEpisode: _0x3ffeb1.view === "episode"
    });
    _0x4dc275({
      restoreView: true
    });
    _0x4b7537();
    _0x3c4e04({
      immediate: true
    });
    _0x8e94a4();
    _0x2841ee();
  }
  function _0x22829a(_0xf13cac) {
    const _0x5145ba = _0x4bf4f6.querySelector(".story-page.is-current");
    if (!_0x5145ba) {
      return false;
    }
    if (_0xf13cac.outlineSectionId) {
      return jumpToStoryOutlineSection(_0x5145ba, _0xf13cac.outlineSectionId, {
        windowObject: windowObject
      });
    }
    const _0x2976ba = _0xf13cac.assetId ? "storyAssetId" : _0xf13cac.clipId ? "storyClipId" : "";
    const _0x56a348 = _0xf13cac.assetId || _0xf13cac.clipId;
    if (!_0x2976ba || !_0x56a348) {
      return false;
    }
    const _0x3a6a3f = _0xf13cac.assetId ? "[data-story-asset-id]" : "[data-story-clip-id]";
    const _0xa101be = [..._0x5145ba.querySelectorAll(_0x3a6a3f)].find(_0x164b8e => normalizeText(_0x164b8e?.dataset?.[_0x2976ba]) === _0x56a348);
    if (!_0xa101be) {
      return false;
    }
    const _0x131638 = () => _0xa101be.scrollIntoView?.({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
    if (typeof windowObject?.requestAnimationFrame === "function") {
      windowObject.requestAnimationFrame(_0x131638);
    } else {
      _0x131638();
    }
    return true;
  }
  async function _0x2b81b9(_0x54d5a7 = {}) {
    const _0x1c5513 = normalizeText(_0x54d5a7.projectId);
    if (!_0x1c5513) {
      return false;
    }
    if (normalizeText(_0x3ffeb1.data?.project?.id) !== _0x1c5513) {
      const _0x58a0ae = _0x3ffeb1.projects.some(_0x11fff4 => normalizeText(_0x11fff4?.id || _0x11fff4?.data?.project?.id) === _0x1c5513);
      if (!_0x58a0ae) {
        _0x1ce8f7("对应的剧本项目已不存在。", "warn");
        return false;
      }
      _0x82ecdd(_0x1c5513);
    }
    if (normalizeText(_0x3ffeb1.data?.project?.id) !== _0x1c5513) {
      _0x1ce8f7("无法打开任务对应的剧本项目。", "warn");
      return false;
    }
    requestWorkspaceMode("story");
    const _0x2842b9 = resolveStoryTaskResultDestination(_0x3ffeb1.data, _0x54d5a7);
    if (_0x2842b9.view === "episode") {
      const _0x19654d = await _0x1fbff1(_0x2842b9.episodeId, _0x2842b9.clipId);
      if (!_0x19654d) {
        return false;
      }
      _0x22829a(_0x2842b9);
      return true;
    }
    if (!(await _0x220ab0(_0x2842b9.step, {
      assetId: _0x2842b9.assetId,
      assetFilter: _0x2842b9.assetFilter,
      outlineSectionId: _0x2842b9.outlineSectionId
    }))) {
      return false;
    }
    _0x22829a(_0x2842b9);
    return true;
  }
  function _0x5cb141(_0x20e983) {
    const _0x3fc347 = windowObject?.URL;
    if (!_0x20e983 || typeof _0x3fc347?.createObjectURL !== "function") {
      return "";
    }
    try {
      return _0x3fc347.createObjectURL(_0x20e983);
    } catch (_0x8c6857) {
      console.warn("[storyWorkspace] 创建复刻视频本地预览失败", _0x8c6857);
      return "";
    }
  }
  function _0x88a7d9(_0x35b9c5) {
    const _0x59072b = normalizeText(_0x35b9c5);
    const _0x40614f = windowObject?.URL;
    if (!_0x59072b.startsWith("blob:") || typeof _0x40614f?.revokeObjectURL !== "function") {
      return;
    }
    _0x40614f.revokeObjectURL(_0x59072b);
  }
  function _0x4024e3() {
    _0x3ffeb1.replicationSourcePreviewUrls.forEach(_0x88a7d9);
    _0x3ffeb1.replicationSourcePreviewUrls = [];
  }
  function _0x132b13({
    preserveCurrentProject = true
  } = {}) {
    if (_0x3ffeb1.hasCreatedProject && preserveCurrentProject) {
      _0x35e390();
    }
    _0x3acba7();
    _0x3ffeb1.homeTab = "generate";
    _0x3ffeb1.scriptMode = "plot";
    _0x3ffeb1.uploadInputMode = "file";
    _0x3ffeb1.projectTitleEdited = false;
    _0x3ffeb1.idea = "";
    _0x4024e3();
    _0x3ffeb1.replicationSourceFiles = [];
    _0x3ffeb1.scriptFileName = "";
    _0x3ffeb1.scriptText = "";
    _0x3ffeb1.scriptCharacterCount = null;
    _0x3ffeb1.hasCreatedProject = false;
    _0x3ffeb1.openProjectMenuId = "";
    _0x3ffeb1.pendingDeleteProjectId = "";
    _0x3ffeb1.data = normalizeStoryWorkspaceAssetData(createDemoStoryWorkspaceData());
    _0x3ffeb1.data.project.planning = normalizeStoryProjectPlanning(_0x3ffeb1.data.project, {
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    _0x3ffeb1.assetSelectionMode = false;
    _0x3ffeb1.selectedAssetIds = [];
    _0x3ffeb1.scriptSelectionMode = false;
    _0x3ffeb1.selectedScriptEpisodeIds = [];
    _0x3ffeb1.generatingEpisodeScriptId = "";
    _0x3ffeb1.isBatchGeneratingScripts = false;
    _0x3ffeb1.episodeScriptBatchId = "";
    _0x3ffeb1.episodeScriptBatchCancelRequested = false;
    _0x3ffeb1.scriptGenerationFocusMode = false;
    _0x3ffeb1.outlineSectionOpenState = {};
    _0x3ffeb1.episodeScriptGenerationStatus = "";
    _0x3ffeb1.assetAppearanceIndexes = {};
    _0x3ffeb1.characterVoiceEditor = null;
    _0x3ffeb1.characterVoicePanelMotion = "";
    _0x3ffeb1.pendingCharacterVoiceAssetId = "";
    _0x3ffeb1.pendingDeleteClipId = "";
    _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
    _0x3ffeb1.clipSelectionMode = false;
    _0x3ffeb1.selectedClipGenerationIds = [];
    _0x3ffeb1.clipBatchGenerationByEpisode = {};
  }
  function _0x35e913() {
    const _0x3ce49e = new Set(_0x3ffeb1.projects.map(_0x11e38e => normalizeText(_0x11e38e?.id || _0x11e38e?.data?.project?.id)).filter(Boolean));
    const _0x270733 = "story-" + Date.now() + "-copy";
    let _0x9aa6fb = _0x270733;
    let _0x51768c = 2;
    while (_0x3ce49e.has(_0x9aa6fb)) {
      _0x9aa6fb = _0x270733 + "-" + _0x51768c;
      _0x51768c += 1;
    }
    return _0x9aa6fb;
  }
  function _0x573400(_0x52fbaa) {
    const _0x550295 = normalizeText(_0x52fbaa);
    const _0x49d9d9 = () => {
      const _0x1ff468 = [..._0x3b5272.querySelectorAll("[data-story-project-title]")].find(_0x2a809b => normalizeText(_0x2a809b.dataset.storyProjectTitle) === _0x550295);
      _0x1ff468?.focus();
      _0x1ff468?.select();
    };
    if (typeof windowObject.requestAnimationFrame === "function") {
      windowObject.requestAnimationFrame(_0x49d9d9);
    } else {
      _0x49d9d9();
    }
  }
  function _0x39f3d7(_0x36021f) {
    _0x35e390();
    const _0x13be77 = normalizeText(_0x36021f);
    const _0x348323 = _0x3ffeb1.projects.find(_0x5b2b16 => normalizeText(_0x5b2b16?.id || _0x5b2b16?.data?.project?.id) === _0x13be77);
    const _0x37c777 = duplicateStoryProjectEntry(_0x348323, {
      projectId: _0x35e913()
    });
    if (!_0x37c777?.data?.project) {
      _0x1ce8f7("复制项目失败，请刷新后重试。", "error");
      return false;
    }
    _0x3ffeb1.projects.unshift(_0x37c777);
    _0x52afbd.set(_0x37c777.id, _0x37c777.data);
    advanceStoryProjectSession(_0x3ffeb1, _0x37c777.id);
    _0x3ffeb1.openProjectMenuId = "";
    _0x3ffeb1.pendingDeleteProjectId = "";
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7("已创建“" + _0x37c777.title + "”。", "success");
    return true;
  }
  function _0x4b4979(_0x37de81, _0x134c8d) {
    _0x35e390();
    const _0x2a038d = normalizeText(_0x37de81);
    const _0x49b1c8 = _0x3ffeb1.projects.find(_0x4ba80b => normalizeText(_0x4ba80b?.id || _0x4ba80b?.data?.project?.id) === _0x2a038d);
    if (!_0x49b1c8) {
      _0x1ce8f7("项目状态更新失败，请刷新后重试。", "error");
      return false;
    }
    _0x49b1c8.archivedAt = _0x134c8d ? Date.now() : 0;
    _0x49b1c8.updatedAt = Date.now();
    _0x3ffeb1.openProjectMenuId = "";
    _0x3ffeb1.pendingDeleteProjectId = "";
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7(_0x134c8d ? "剧本项目已归档。" : "剧本项目已取消归档。", "success");
    return true;
  }
  function _0x2283dd(_0x171335) {
    const _0x114b9f = normalizeText(_0x171335);
    if (!_0x114b9f) {
      return;
    }
    const _0x14a3f4 = _0x3ffeb1.projects.length;
    _0x3ffeb1.projects = removeStoryProjectEntry(_0x3ffeb1.projects, _0x114b9f);
    if (_0x3ffeb1.projects.length === _0x14a3f4) {
      _0x3ffeb1.openProjectMenuId = "";
      _0x3ffeb1.pendingDeleteProjectId = "";
      _0xe5dd9c();
      return;
    }
    _0x257e7e(_0x114b9f);
    if (normalizeText(_0x3ffeb1.data?.project?.id) === _0x114b9f) {
      _0x3acba7();
      _0x3ffeb1.hasCreatedProject = false;
      _0x132b13({
        preserveCurrentProject: false
      });
      _0x3ffeb1.view = "home";
    } else {
      _0x3ffeb1.openProjectMenuId = "";
      _0x3ffeb1.pendingDeleteProjectId = "";
    }
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7("剧本项目已删除。", "success");
  }
  function _0x172b32(_0x28f37b) {
    const _0x54529f = normalizeText(_0x28f37b);
    const _0x1e60ed = getSelectedEpisode(_0x3ffeb1);
    const _0x19f0c2 = _0x3ffeb1.data.episodes.findIndex(_0x163f72 => _0x163f72.id === _0x1e60ed?.id);
    const _0x4bc3c4 = removeStoryEpisodeClip(_0x1e60ed, _0x54529f);
    if (!_0x54529f || !_0x4bc3c4 || _0x19f0c2 < 0) {
      _0x3ffeb1.pendingDeleteClipId = "";
      _0xe5dd9c();
      _0x1ce8f7("删除片段失败，请刷新后重试。", "error");
      return false;
    }
    _0x3ffeb1.data.episodes[_0x19f0c2] = _0x4bc3c4.episode;
    _0x3ffeb1.pendingDeleteClipId = "";
    _0x3ffeb1.selectedClipGenerationIds = _0x3ffeb1.selectedClipGenerationIds.filter(_0x3e2fdc => normalizeText(_0x3e2fdc) !== _0x54529f);
    const _0x22526a = _0x4bc3c4.episode.clips.find(_0x701a98 => normalizeText(_0x701a98?.id) === normalizeText(_0x3ffeb1.selectedClipId));
    const _0xd6d0bb = _0x22526a || _0x4bc3c4.nextClip || null;
    _0x3ffeb1.selectedClipId = _0xd6d0bb?.id || "";
    _0x1bbd64(_0xd6d0bb);
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    _0x1ce8f7("片段已删除。", "success");
    return true;
  }
  function _0x492090(_0x4b1622) {
    const _0x356290 = buildStoryClipFrameMentionId(_0x4b1622);
    if (!_0x356290) {
      return 0;
    }
    const _0x24b4e9 = _0x119c8b => {
      let _0x37a899 = 0;
      _0x119c8b?.querySelectorAll?.(".ref-pill")?.forEach(_0x394096 => {
        if (normalizeText(_0x394096.dataset?.assetId) !== _0x356290) {
          return;
        }
        _0x394096.remove?.();
        _0x37a899 += 1;
      });
      return _0x37a899;
    };
    let _0x3441fd = 0;
    const _0x54f94d = getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
    const _0x946314 = _0x3b5272.querySelector("[data-story-clip-prompt]");
    if (_0x946314 && _0x54f94d) {
      const _0x4174d3 = _0x24b4e9(_0x946314);
      if (_0x4174d3) {
        _0x54f94d.prompt = sanitizePromptHtmlForCommit(_0x946314.innerHTML);
        _0x3441fd += _0x4174d3;
      }
    }
    _0x3ffeb1.data.episodes.forEach(_0x5dfbfc => {
      (_0x5dfbfc?.clips || []).forEach(_0x297c19 => {
        if (!normalizeText(_0x297c19?.prompt).includes(_0x356290)) {
          return;
        }
        const _0x3e985b = documentObject.createElement("div");
        _0x3e985b.innerHTML = _0x297c19.prompt;
        const _0x4af0b7 = _0x24b4e9(_0x3e985b);
        if (!_0x4af0b7) {
          return;
        }
        _0x297c19.prompt = sanitizePromptHtmlForCommit(_0x3e985b.innerHTML);
        _0x3441fd += _0x4af0b7;
      });
    });
    return _0x3441fd;
  }
  async function _0x50b0e1(_0x1a2ae1, _0x1918e2) {
    if (typeof syncClipFrameToCanvas !== "function" || !normalizeText(_0x1a2ae1?.data?.project?.canvasBinding?.canvasId) || !_0x1918e2) {
      return false;
    }
    try {
      const _0x2a8840 = await syncClipFrameToCanvas({
        project: _0x1a2ae1.data.project,
        frame: _0x1918e2
      });
      if (!_0x2a8840?.synced || !_0x2c064b(_0x1a2ae1)) {
        return false;
      }
      const _0x530686 = normalizeStoryClipFrames(_0x1a2ae1.data.clipFrames).find(_0x502153 => _0x502153.id === _0x1918e2.id);
      if (!_0x530686) {
        return false;
      }
      _0x1a2ae1.data.clipFrames = upsertStoryClipFrame(_0x1a2ae1.data.clipFrames, {
        ..._0x530686,
        ..._0x2a8840.frame
      });
      _0x39491b(_0x1a2ae1);
      _0x3c4e04({
        immediate: true
      });
      if (_0x59fa6e(_0x1a2ae1) && _0x3ffeb1.view === "episode") {
        _0x3ec4f9({
          refreshContent: true
        });
      }
      return true;
    } catch (_0x219a07) {
      console.warn("[storyWorkspace] 片段帧同步到项目画布失败", _0x219a07);
      if (_0x59fa6e(_0x1a2ae1)) {
        _0x1ce8f7(_0x219a07?.message || "片段帧同步到项目画布失败。", "warning");
      }
      return false;
    }
  }
  async function _0x50e0b5(_0x2fb926, {
    episodeId = ""
  } = {}) {
    const _0x367732 = normalizeText(episodeId);
    const _0x16d172 = normalizeStoryClipFrames(_0x2fb926?.data?.clipFrames).filter(_0x3aa9ea => !normalizeText(_0x3aa9ea.canvasNodeId) && _0x3aa9ea.captureSavePending !== true && _0x3aa9ea.isTransient !== true && (!_0x367732 || normalizeText(_0x3aa9ea.episodeId) === _0x367732));
    for (const _0x1b7bde of _0x16d172) {
      if (!_0x2c064b(_0x2fb926)) {
        return false;
      }
      if (!(await _0x50b0e1(_0x2fb926, _0x1b7bde))) {
        return false;
      }
    }
    return true;
  }
  async function _0xd66ed7(_0x27e233) {
    const _0x194c69 = normalizeText(_0x27e233);
    const _0x24a12f = normalizeStoryClipFrames(_0x3ffeb1.data.clipFrames);
    const _0x792f68 = _0x24a12f.find(_0xb70edd => _0xb70edd.id === _0x194c69);
    if (!_0x792f68) {
      _0x1ce8f7("删除失败，当前内容已不存在。", "error");
      return false;
    }
    if (_0x792f68.captureSavePending === true) {
      _0x1ce8f7("请等待当前片段帧保存完成。", "info");
      return false;
    }
    if (typeof deleteCanvasNodes === "function" && normalizeText(_0x792f68.canvasId) && normalizeText(_0x792f68.canvasNodeId)) {
      try {
        await deleteCanvasNodes({
          canvasId: _0x792f68.canvasId,
          nodeIds: [_0x792f68.canvasNodeId]
        });
      } catch (_0x4e8152) {
        _0x1ce8f7(_0x4e8152?.message || "关联画布节点删除失败。", "error");
        return false;
      }
    }
    const _0x233795 = _0x492090(_0x194c69);
    _0x3ffeb1.data.clipFrames = removeStoryClipFrame(_0x24a12f, _0x194c69);
    _0x277232();
    _0x1881c3();
    if (!_0x3ec4f9({
      refreshContent: true
    })) {
      _0xe5dd9c();
    }
    _0x3c4e04({
      immediate: true
    });
    const _0x337eeb = getStoryClipFrameMediaType(_0x792f68) === STORY_CLIP_MEDIA_TYPE_VIDEO ? "视频片段" : "片段帧";
    _0x1ce8f7(_0x233795 > 0 ? _0x337eeb + "已删除，相关提示词引用已移除。" : _0x337eeb + "已删除。", "success");
    return true;
  }
  function _0x54ad39() {
    const _0x510ec2 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x21a424 = _0x510ec2?.querySelector("[data-story-action=\"generate-story\"]");
    const _0x2331b8 = canStartStoryHomeGeneration(_0x3ffeb1);
    if (_0x21a424) {
      _0x21a424.disabled = !_0x2331b8 || _0x3ffeb1.isGeneratingStory;
      syncStoryAsyncButton(_0x21a424, _0x3ffeb1.isGeneratingStory);
      const _0x2e4606 = _0x21a424.querySelector("[data-story-generate-label]");
      if (_0x2e4606) {
        _0x2e4606.textContent = getStoryHomeGenerateButtonLabel(_0x3ffeb1);
      }
      const _0x297f04 = _0x21a424.querySelector(".story-generate-arrow");
      if (_0x297f04) {
        _0x297f04.hidden = _0x3ffeb1.isGeneratingStory;
      }
    }
    const _0x13c493 = _0x510ec2?.querySelector("[data-story-script-mode-control]");
    if (_0x13c493) {
      const _0x711782 = normalizeStoryScriptMode(_0x3ffeb1.scriptMode);
      const _0x16a9e8 = _0x711782 === "narration" ? "解说模式" : "剧情模式";
      const _0xd34fb2 = _0x711782 === "narration" ? "剧情模式" : "解说模式";
      _0x13c493.hidden = _0x3ffeb1.homeTab !== "generate";
      _0x13c493.dataset.storyScriptMode = _0x711782;
      _0x13c493.classList.toggle("is-narration", _0x711782 === "narration");
      _0x13c493.setAttribute("aria-pressed", String(_0x711782 === "narration"));
      _0x13c493.setAttribute("aria-label", "当前" + _0x16a9e8 + "，点击切换为" + _0xd34fb2);
      const _0x53263d = _0x13c493.querySelector("[data-story-script-mode-label]");
      if (_0x53263d) {
        _0x53263d.textContent = _0x16a9e8;
      }
    }
    const _0x3377d3 = _0x510ec2?.querySelector("[data-story-script-mode-hint]");
    if (_0x3377d3) {
      _0x3377d3.textContent = hasStoryHomeReferenceScript(_0x3ffeb1) ? STORY_HOME_REWRITE_SOURCE_HINT : getStoryScriptModeHint(_0x3ffeb1.scriptMode);
    }
    const _0x5d1ec2 = _0x510ec2?.querySelector("[data-story-planning-picker=\"episodeCount\"]");
    if (_0x5d1ec2) {
      _0x5d1ec2.hidden = _0x3ffeb1.homeTab !== "generate";
    }
    const _0x124657 = _0x510ec2?.querySelector("[data-story-planning-picker=\"promptMode\"]");
    if (_0x124657) {
      _0x124657.hidden = _0x3ffeb1.homeTab === "replication";
    }
    const _0x3b27f6 = _0x510ec2?.querySelector("[data-story-planning-picker=\"targetLocale\"]");
    if (_0x3b27f6) {
      _0x3b27f6.hidden = _0x3ffeb1.homeTab !== "replication";
    }
    const _0x4c1a3b = _0x510ec2?.querySelector(".story-home-composer");
    _0x4c1a3b?.classList.toggle("is-generating", _0x3ffeb1.isGeneratingStory);
    _0x4c1a3b?.setAttribute("aria-busy", _0x3ffeb1.isGeneratingStory ? "true" : "false");
    const _0xd47d9 = _0x510ec2?.querySelector("[data-story-generation-loading]");
    if (_0xd47d9) {
      _0xd47d9.hidden = !_0x3ffeb1.isGeneratingStory;
    }
    const _0x2fe0e8 = _0x510ec2?.querySelector("[data-story-generation-loading-label]");
    if (_0x2fe0e8) {
      _0x2fe0e8.textContent = _0x3ffeb1.generationStatus || "正在创建剧情";
    }
    const _0x2424c9 = _0x510ec2?.querySelector("[data-story-idea-count]");
    if (_0x2424c9) {
      _0x2424c9.textContent = _0x3ffeb1.idea.length + " / " + STORY_IDEA_MAX_CHARACTERS;
    }
    const _0x253356 = _0x510ec2?.querySelector("[data-story-paste-count]");
    if (_0x253356) {
      _0x253356.textContent = _0x3ffeb1.scriptText.length + " / " + STORY_SCRIPT_MAX_CHARACTERS;
    }
  }
  function _0x4a9272(_0x55e320) {
    const _0x2370ae = resolveStoryVideoReplicationHomeTab(_0x3ffeb1, _0x55e320);
    if (_0x55e320 === "replication" && _0x2370ae !== _0x55e320) {
      return false;
    }
    if (_0x3ffeb1.homeTab === _0x2370ae) {
      return false;
    }
    _0x3ffeb1.homeTab = _0x2370ae;
    const _0x44c84e = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x5772b6 = _0x44c84e?.querySelector("[data-story-home-tabs]");
    const _0x357795 = _0x44c84e?.querySelector(".story-home-composer-body");
    if (!_0x5772b6 || !_0x357795) {
      _0xe5dd9c();
      return;
    }
    _0x5772b6.dataset.activeTab = _0x2370ae;
    _0x5772b6.querySelectorAll("[data-story-home-tab]").forEach(_0x46e2f4 => {
      const _0x1c5903 = _0x46e2f4.dataset.storyHomeTab === _0x2370ae;
      _0x46e2f4.classList.toggle("is-active", _0x1c5903);
      _0x46e2f4.setAttribute("aria-selected", String(_0x1c5903));
      _0x46e2f4.tabIndex = _0x1c5903 ? 0 : -1;
    });
    if (_0x2370ae === "replication") {
      const _0xb48903 = resolveStoryVideoInputTextModelId(_0x3ffeb1.models.text);
      if (_0xb48903) {
        const _0x2e6a24 = getStoryWorkspaceModelChoice("text", _0xb48903);
        _0x3ffeb1.models.text = _0xb48903;
        _0x3ffeb1.textProvider = _0x2e6a24?.provider || _0x3ffeb1.textProvider;
        _0x3ffeb1.textProviderProfileId = resolveStoryTextProviderProfileId(_0x3ffeb1.textProvider, _0x3ffeb1.textProviderProfileId);
      }
    }
    _0x357795.innerHTML = renderStoryHomeComposerBody(_0x3ffeb1);
    const _0x2aac86 = _0x44c84e.querySelector(".story-home-model-bar");
    const _0x2d341f = documentObject.createElement("template");
    _0x2d341f.innerHTML = renderStoryHomeModelBar(_0x3ffeb1).trim();
    const _0xae4074 = _0x2d341f.content.firstElementChild;
    if (_0x2aac86 && _0xae4074) {
      _0x2aac86.replaceWith(_0xae4074);
      _0x3d3f7d.get(_0x44c84e)?.refreshTextModelSelector?.();
    }
    _0x54ad39();
    _0x3c4e04();
  }
  function _0x1f081f(_0x5265b3) {
    const _0x2a6ace = normalizeStoryScriptMode(_0x5265b3);
    if (_0x3ffeb1.scriptMode === _0x2a6ace) {
      return;
    }
    _0x3ffeb1.scriptMode = _0x2a6ace;
    _0x54ad39();
    _0x3c4e04();
  }
  function _0x5f555a(_0x374a9f) {
    if (_0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 1 || _0x3ffeb1.data?.project?.sourceMode !== "video-replication") {
      return false;
    }
    const _0x9cbd13 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x4d0ccd = findStoryReplicationEpisode(_0x3ffeb1.data, _0x374a9f);
    const _0x581b23 = [...(_0x9cbd13?.querySelectorAll("[data-story-replication-episode-id]") || [])].find(_0x32677c => _0x32677c.matches?.("article") && normalizeText(_0x32677c.dataset.storyReplicationEpisodeId) === normalizeText(_0x374a9f));
    if (!_0x9cbd13 || !_0x4d0ccd || !_0x581b23) {
      return false;
    }
    const _0x4eea60 = _0x3ffeb1.data.episodes.indexOf(_0x4d0ccd);
    return syncStoryVideoReplicationCardElement(_0x581b23, _0x4d0ccd, _0x4eea60);
  }
  function _0x25ae28() {
    if (_0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 1 || _0x3ffeb1.data?.project?.sourceMode !== "video-replication") {
      return false;
    }
    const _0x1193e3 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x33e9ec = _0x1193e3?.querySelector(".story-page-footer");
    if (!_0x33e9ec) {
      return false;
    }
    const _0x568921 = documentObject.createElement("template");
    _0x568921.innerHTML = renderStoryVideoReplicationFooter(_0x3ffeb1).trim();
    const _0x6140ab = _0x568921.content.firstElementChild;
    if (!_0x6140ab) {
      return false;
    }
    _0x33e9ec.replaceWith(_0x6140ab);
    return true;
  }
  function _0x5d3a70(_0x41f245, _0x3658fa) {
    if (!_0x59fa6e(_0x41f245) || _0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 1 || _0x3ffeb1.data?.project?.sourceMode !== "video-replication") {
      return false;
    }
    const _0xb6c834 = _0x5f555a(_0x3658fa);
    const _0x3fdc4e = _0x25ae28();
    return _0xb6c834 && _0x3fdc4e;
  }
  async function _0x5cf748(_0x2d2d32, _0x550789, _0x7d269c) {
    const _0x833c35 = findStoryReplicationEpisode(_0x2d2d32.data, _0x7d269c);
    if (!_0x833c35 || !_0x2c064b(_0x2d2d32)) {
      return false;
    }
    const _0x1a3acb = buildStoryBackgroundTaskId("video-replication-analysis", {
      episodeId: _0x7d269c
    });
    _0x4ba4d1(_0x2d2d32, {
      id: _0x1a3acb,
      type: "video-replication-analysis",
      scope: {
        episodeId: _0x7d269c
      },
      label: "解析第 " + _0x833c35.number + " 集视频",
      message: "正在上传原视频"
    }, {
      refreshHome: false
    });
    invalidateStoryVideoReplicationAssetLocalization(_0x2d2d32.data);
    _0x833c35.replication = {
      ...(_0x833c35.replication || {}),
      status: "uploading",
      progress: 10,
      error: ""
    };
    _0x5d3a70(_0x2d2d32, _0x7d269c);
    try {
      let _0x2734c6 = normalizeText(_0x833c35.sourceVideo?.videoRef);
      if (!_0x2734c6) {
        if (!_0x550789) {
          throw new Error("原视频尚未上传，请使用卡片上的“重新上传该视频”。");
        }
        const _0xa13eaf = readVideoFileNaturalSize(_0x550789).catch(() => null);
        const _0x1e5ca1 = await uploadFile(_0x550789, _0x2d2d32.projectId);
        if (!_0x2c064b(_0x2d2d32)) {
          return false;
        }
        const _0x1ac891 = await _0xa13eaf;
        if (!_0x2c064b(_0x2d2d32)) {
          return false;
        }
        const _0xa150a1 = resolveStoryReplicationUploadedVideo(_0x1e5ca1);
        _0x2734c6 = _0xa150a1.videoRef;
        let _0xcf7d7a = {
          ..._0x1e5ca1,
          localPath: _0xa150a1.localPath || _0x1e5ca1?.localPath,
          videoUrl: _0x2734c6
        };
        try {
          _0xcf7d7a = await ensureVideoResultThumbnail(_0xcf7d7a);
        } catch (_0xc0f2fa) {
          globalThis.console?.warn?.("[storyWorkspace] 复刻视频首帧提取失败，继续执行视频解析", _0xc0f2fa);
        }
        if (!_0x2c064b(_0x2d2d32)) {
          return false;
        }
        applyStoryVideoReplicationUpload(_0x833c35, {
          file: _0x550789,
          videoRef: _0x2734c6,
          durationSec: _0x1ac891?.duration || _0x1e5ca1?.durationSec || _0x1e5ca1?.duration,
          posterUrl: _0xcf7d7a?.posterUrl || _0xcf7d7a?.thumbUrl,
          posterLocalPath: _0xcf7d7a?.posterLocalPath || _0xcf7d7a?.thumbLocalPath
        });
      } else {
        _0x833c35.replication = {
          ...(_0x833c35.replication || {}),
          status: "analyzing",
          progress: 45,
          error: ""
        };
        _0x833c35.status = "解析中";
      }
      _0x1dc293(_0x2d2d32, _0x1a3acb, {
        status: "running",
        message: "正在理解剧情、台词与镜头"
      }, {
        refreshHome: false
      });
      _0x5d3a70(_0x2d2d32, _0x7d269c);
      const _0x1ce266 = _0x2d2d32.data.project || {};
      const _0xaa628d = getStoryReplicationLocale(_0x1ce266.replication?.targetLocale);
      const _0x2f5bde = await analyzeSourceVideo({
        videoRef: _0x2734c6,
        durationSec: _0x833c35.sourceVideo.durationSec,
        modelId: _0x1ce266.replication?.modelId || _0x2d2d32.modelSettings.models?.text,
        model: _0x1ce266.replication?.modelId || _0x2d2d32.modelSettings.models?.text,
        provider: _0x1ce266.replication?.provider || _0x2d2d32.modelSettings.textProvider,
        providerProfileId: _0x1ce266.replication?.providerProfileId || _0x2d2d32.modelSettings.textProviderProfileId,
        targetLocale: _0xaa628d.value,
        targetLocaleLabel: _0xaa628d.label,
        visualStyle: _0x1ce266.videoStylePrompt || _0x1ce266.videoStyle
      });
      if (!_0x2c064b(_0x2d2d32)) {
        return false;
      }
      applyStoryVideoReplicationAnalysis(_0x833c35, _0x2f5bde);
      syncStoryVideoReplicationProject(_0x2d2d32.data);
      _0x450b2c(_0x2d2d32, _0x1a3acb, {
        status: "succeeded",
        message: "第 " + _0x833c35.number + " 集视频解析完成"
      }, {
        refreshHome: false
      });
      _0x39491b(_0x2d2d32);
      _0x3c4e04({
        immediate: true
      });
      _0x5d3a70(_0x2d2d32, _0x7d269c);
      return true;
    } catch (_0x1e009d) {
      if (!_0x2c064b(_0x2d2d32)) {
        return false;
      }
      failStoryVideoReplicationEpisode(_0x833c35, _0x1e009d?.message);
      syncStoryVideoReplicationProject(_0x2d2d32.data);
      _0x450b2c(_0x2d2d32, _0x1a3acb, {
        status: "failed",
        message: "第 " + _0x833c35.number + " 集视频解析失败",
        error: _0x1e009d?.message || "视频解析失败。"
      }, {
        refreshHome: false
      });
      _0x39491b(_0x2d2d32);
      _0x3c4e04({
        immediate: true
      });
      _0x5d3a70(_0x2d2d32, _0x7d269c);
      return false;
    }
  }
  async function _0xab8fe2(_0x5c087d, _0x78e46f = []) {
    const _0x1eba26 = normalizeText(_0x5c087d?.projectId);
    const _0x4b385d = _0x5f32e0.get(_0x1eba26);
    if (_0x4b385d) {
      return _0x4b385d;
    }
    const _0x4dea3b = Array.isArray(_0x78e46f) ? [..._0x78e46f] : [];
    const _0x5a4341 = (async () => {
      for (const _0x17b19d of _0x4dea3b) {
        if (!_0x2c064b(_0x5c087d)) {
          break;
        }
        await _0x5cf748(_0x5c087d, _0x17b19d.file, _0x17b19d.episodeId);
      }
      if (!_0x2c064b(_0x5c087d)) {
        return false;
      }
      const _0x4a9776 = getStoryVideoReplicationSummary(_0x5c087d.data);
      if (!_0x4a9776.active && !_0x4a9776.failed && _0x4a9776.completed === _0x4a9776.total) {
        _0x2e1a77("视频解析完成，共 " + _0x4a9776.completed + " 集。", _0x5c087d, {
          step: 1
        }, {
          notificationMessage: "复刻视频解析完成。"
        });
      } else if (_0x4a9776.failed) {
        _0xf62208("视频解析已完成 " + _0x4a9776.completed + "/" + _0x4a9776.total + " 条，" + _0x4a9776.failed + " 条失败。", "warn", _0x5c087d, {
          step: 1
        });
      }
      return _0x4a9776.completed > 0;
    })().finally(() => {
      if (_0x5f32e0.get(_0x1eba26) === _0x5a4341) {
        _0x5f32e0.delete(_0x1eba26);
      }
      if (_0x59fa6e(_0x5c087d)) {
        _0x25ae28();
      }
    });
    _0x5f32e0.set(_0x1eba26, _0x5a4341);
    return _0x5a4341;
  }
  async function _0x5e2ddd() {
    if (_0x3ffeb1.isGeneratingStory) {
      return false;
    }
    if (resolveStoryVideoReplicationHomeTab(_0x3ffeb1, "replication") !== "replication") {
      return false;
    }
    if (typeof analyzeSourceVideo !== "function") {
      _0x1ce8f7("视频理解 Agent 尚未初始化。", "error");
      return false;
    }
    const _0x265863 = [..._0x3ffeb1.replicationSourceFiles];
    if (!_0x265863.length) {
      _0x1ce8f7("请先上传至少一条视频。", "warn");
      return false;
    }
    const _0x379ea5 = resolveStoryVideoInputTextModelId(_0x3ffeb1.models.text);
    if (!_0x379ea5) {
      _0x1ce8f7("当前没有支持视频输入的文本模型。", "error");
      return false;
    }
    _0x35e390();
    _0x3acba7();
    _0x3ffeb1.models.text = _0x379ea5;
    const _0x2d576b = getStoryWorkspaceModelChoice("text", _0x379ea5);
    _0x3ffeb1.textProvider = _0x2d576b?.provider || _0x3ffeb1.textProvider;
    _0x3ffeb1.textProviderProfileId = resolveStoryTextProviderProfileId(_0x3ffeb1.textProvider, _0x3ffeb1.textProviderProfileId);
    const _0x309977 = "story-" + Date.now();
    _0x3ffeb1.data = createStoryVideoReplicationProjectData({
      projectId: _0x309977,
      files: _0x265863,
      modelId: _0x379ea5,
      provider: _0x3ffeb1.textProvider,
      providerProfileId: _0x3ffeb1.textProviderProfileId,
      targetLocale: _0x3ffeb1.replicationTargetLocale,
      aspectRatio: _0x3ffeb1.data.project?.aspectRatio || "9:16",
      videoStyleId: _0x3ffeb1.data.project?.videoStyleId,
      videoStylePrompt: _0x3ffeb1.data.project?.videoStylePrompt,
      videoStyle: _0x3ffeb1.data.project?.videoStyle
    });
    _0x3ffeb1.projectTitleEdited = false;
    _0x3ffeb1.hasCreatedProject = true;
    _0x3ffeb1.assetSelectionMode = false;
    _0x3ffeb1.selectedAssetIds = [];
    _0x3ffeb1.selectedEpisodeId = _0x3ffeb1.data.episodes[0]?.id || "";
    _0x3ffeb1.selectedClipId = "";
    _0x4024e3();
    _0x3ffeb1.replicationSourceFiles = [];
    _0x4dc275({
      resetStep: true
    });
    _0x35e390();
    _0x3c4e04({
      immediate: true
    });
    const _0x52eb68 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x3c4fa0 = _0x265863.map((_0x176687, _0x32fe35) => ({
      file: _0x176687,
      episodeId: _0x3ffeb1.data.episodes[_0x32fe35]?.id
    })).filter(_0x31c451 => _0x31c451.file && _0x31c451.episodeId);
    _0x3c4fa0.forEach(_0x323539 => {
      _0x30e879.set(_0x309977 + ":" + _0x323539.episodeId, _0x323539.file);
    });
    return _0xab8fe2(_0x52eb68, _0x3c4fa0);
  }
  async function _0x4bfad3() {
    if (_0x3ffeb1.data?.project?.sourceMode !== "video-replication") {
      return false;
    }
    const _0x461c1e = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x17ca1c = normalizeText(_0x461c1e.projectId);
    if (_0x5f32e0.has(_0x17ca1c)) {
      return false;
    }
    const _0x3de18b = _0x3ffeb1.data.episodes.filter(_0x33b40e => _0x33b40e?.replication?.status === "failed").map(_0xb721be => ({
      episodeId: _0xb721be.id,
      file: _0x30e879.get(_0x17ca1c + ":" + _0xb721be.id) || null
    }));
    if (!_0x3de18b.length) {
      return false;
    }
    return _0xab8fe2(_0x461c1e, _0x3de18b);
  }
  function _0x496cda(_0x4f2d7e, _0x347edc, _0x36e28e) {
    const _0xe80994 = getStoryBackgroundTasks(_0x4f2d7e.data).find(_0x1782a8 => _0x1782a8.id === _0x36e28e);
    const _0x568a02 = {
      ..._0x347edc,
      fileName: _0x347edc.fileName || _0x347edc.scriptFileName,
      model: _0x347edc.model || _0x347edc.modelId,
      planning: _0x347edc.planning || {
        episodeCount: _0x347edc.episodeCount,
        sceneMaxSeconds: _0x347edc.sceneMaxSeconds,
        promptMode: _0x347edc.promptMode
      }
    };
    return createStorySummaryRunRecorder({
      project: _0x4f2d7e.data.project,
      request: _0x568a02,
      resumePayload: _0xe80994?.resumePayload,
      onChange: async _0x2bdd11 => {
        _0x1dc293(_0x4f2d7e, _0x36e28e, {
          resumable: _0x2bdd11.status !== "succeeded",
          modelId: _0x2bdd11.input.execution.modelId,
          provider: _0x2bdd11.input.execution.provider,
          resumePayload: {
            kind: _0x2bdd11.kind,
            run: _0x2bdd11
          }
        });
        _0x39491b(_0x4f2d7e);
        const _0x4b25f0 = await _0x434b0f();
        if (typeof saveWorkspace === "function" && _0x65309f.isReady() && !_0x4b25f0) {
          throw new Error("剧本摘要运行记录保存失败，已停止模型请求。");
        }
      }
    });
  }
  async function _0x4ddc9d(_0x281946) {
    if (!_0x281946.requiresPaidRetry) {
      return true;
    }
    const _0x4a9b52 = await _0x2ce3ff({
      overlayId: "story-summary-paid-retry",
      title: "上次剧本摘要请求结果尚未安全提交",
      message: "上次请求可能已经计费，或响应尚未完成本地提交。确认后才会再次调用模型。",
      fallbackValue: null,
      choices: [{
        label: "暂不重试",
        value: null,
        autofocus: true
      }, {
        label: "确认重新请求",
        value: "retry",
        primary: true
      }]
    });
    if (_0x4a9b52 !== "retry") {
      return false;
    }
    await _0x281946.authorizePaidRetry();
    return true;
  }
  async function _0x3df590() {
    if (_0x3ffeb1.isGeneratingStory) {
      return;
    }
    if (_0x3ffeb1.homeTab === "replication") {
      return _0x5e2ddd();
    }
    const _0x5f13e3 = resolveStoryHomeGenerationMode(_0x3ffeb1);
    const _0x3420e5 = buildStoryHomeGenerationRequest({
      mode: _0x5f13e3,
      scriptMode: _0x3ffeb1.scriptMode,
      modelId: _0x3ffeb1.models.text,
      provider: _0x3ffeb1.textProvider,
      providerProfileId: _0x3ffeb1.textProviderProfileId,
      scriptFileName: _0x3ffeb1.scriptFileName,
      scriptText: _0x3ffeb1.scriptText,
      idea: _0x3ffeb1.idea,
      rewriteInstruction: _0x5f13e3 === "rewrite" ? _0x3ffeb1.idea : "",
      aspectRatio: _0x3ffeb1.data.project?.aspectRatio,
      styleId: _0x3ffeb1.data.project?.videoStyleId,
      stylePrompt: _0x3ffeb1.data.project?.videoStylePrompt,
      videoStyle: _0x3ffeb1.data.project?.videoStyle,
      episodeCount: _0x3ffeb1.data.project?.planning?.episodeCount,
      sceneMaxSeconds: _0x3ffeb1.data.project?.planning?.sceneMaxSeconds,
      promptMode: _0x3ffeb1.data.project?.planning?.promptMode,
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    if (!_0x3420e5.ok) {
      _0x1ce8f7(_0x3420e5.error, "warn");
      return;
    }
    windowObject?.dispatchEvent?.(new CustomEvent("storyWorkspace:generateRequested", {
      detail: _0x3420e5
    }));
    _0x35e390();
    applyStoryPromptModeVideoModelDefault(_0x3ffeb1, _0x3420e5.promptMode);
    if (_0x3420e5.mode === "upload") {
      try {
        _0x3acba7();
        _0x3ffeb1.data = createUploadedStoryProjectData({
          projectId: "story-" + Date.now(),
          request: _0x3420e5,
          allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
        });
        _0x3ffeb1.projectTitleEdited = false;
        _0x3ffeb1.hasCreatedProject = true;
        _0x3ffeb1.assetSelectionMode = false;
        _0x3ffeb1.selectedAssetIds = [];
        _0x3ffeb1.assetAppearanceIndexes = {};
        _0x3ffeb1.scriptSelectionMode = false;
        _0x3ffeb1.selectedScriptEpisodeIds = [];
        _0x3ffeb1.scriptGenerationFocusMode = false;
        _0x3ffeb1.outlineSectionOpenState = {};
        _0x3ffeb1.scriptMode = "plot";
        _0x4dc275({
          resetStep: true
        });
        _0x3c4e04({
          immediate: true
        });
        windowObject?.dispatchEvent?.(new CustomEvent("storyWorkspace:storyImported", {
          detail: {
            mode: _0x3420e5.mode,
            modelId: _0x3420e5.modelId,
            provider: _0x3420e5.provider,
            episodeCount: _0x3ffeb1.data.episodes.length
          }
        }));
        _0x847d75("已按原剧本导入 " + _0x3ffeb1.data.episodes.length + " 集，未扩写正文。", "success");
        await _0xf1b5ce({
          advance: true
        });
      } catch (_0x142622) {
        _0x847d75(_0x142622?.message || "剧本导入失败，请检查原始文本。", "error", _0x142622);
      }
      return;
    }
    if (typeof generateStory !== "function") {
      _0x1ce8f7("剧情 Agent 尚未初始化。", "error");
      return;
    }
    _0x3acba7();
    _0x3ffeb1.data = createGeneratedStoryProjectData({}, {
      projectId: "story-" + Date.now(),
      request: _0x3420e5,
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    _0x3ffeb1.data.project.summaryStatus = "generating";
    _0x3ffeb1.projectTitleEdited = false;
    _0x3ffeb1.hasCreatedProject = true;
    const _0x428286 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x43b2cb = buildStoryBackgroundTaskId("story-summary");
    const _0x4c9c7c = _0x496cda(_0x428286, _0x3420e5, _0x43b2cb);
    const _0x2b9db0 = getStoryHomeSummaryTaskCopy(_0x3420e5.mode);
    _0x4ba4d1(_0x428286, {
      id: _0x43b2cb,
      type: "story-summary",
      label: _0x2b9db0.label,
      message: _0x2b9db0.message,
      resumable: true,
      resumePayload: _0x4c9c7c.payload()
    });
    _0x3ffeb1.assetSelectionMode = false;
    _0x3ffeb1.selectedAssetIds = [];
    _0x3ffeb1.assetAppearanceIndexes = {};
    _0x3ffeb1.scriptSelectionMode = false;
    _0x3ffeb1.selectedScriptEpisodeIds = [];
    _0x3ffeb1.scriptGenerationFocusMode = false;
    _0x3ffeb1.outlineSectionOpenState = {};
    _0x3ffeb1.scriptMode = _0x3420e5.scriptMode;
    _0x3ffeb1.isGeneratingStory = true;
    _0x3ffeb1.generationStatus = _0x2b9db0.status;
    _0x4dc275({
      resetStep: true
    });
    _0x3c4e04({
      immediate: true
    });
    try {
      await _0x4c9c7c.start();
      const _0x30e655 = _0x4c9c7c.candidateArtifact || (await generateStory({
        mode: _0x3420e5.mode,
        scriptMode: _0x3420e5.scriptMode,
        idea: _0x3420e5.idea,
        sourceText: _0x3420e5.sourceText,
        fileName: _0x3420e5.scriptFileName,
        rewriteInstruction: _0x3420e5.rewriteInstruction,
        model: _0x4c9c7c.execution.modelId,
        provider: _0x4c9c7c.execution.provider,
        providerProfileId: _0x4c9c7c.execution.providerProfileId,
        aspectRatio: _0x3420e5.aspectRatio,
        visualStyle: _0x3420e5.visualStyle,
        planning: {
          episodeCount: _0x3420e5.episodeCount,
          sceneMaxSeconds: _0x3420e5.sceneMaxSeconds,
          promptMode: _0x3420e5.promptMode
        },
        onInvocation: _0x4c9c7c.onInvocation,
        onProgress: ({
          message: _0x16e9f0
        } = {}) => {
          if (!_0x2c064b(_0x428286)) {
            return;
          }
          const _0x1dd3bf = normalizeText(_0x16e9f0) || "正在生成剧本摘要";
          _0x1dc293(_0x428286, _0x43b2cb, {
            status: "running",
            message: _0x1dd3bf
          });
          if (_0x59fa6e(_0x428286)) {
            _0x3ffeb1.generationStatus = _0x1dd3bf;
            if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 1) {
              _0xe5dd9c();
            }
          }
        }
      }));
      if (!_0x4c9c7c.candidateArtifact) {
        await _0x4c9c7c.ready(_0x30e655);
      }
      if (!_0x2c064b(_0x428286)) {
        return false;
      }
      _0x428286.data = applyGeneratedStoryResult(_0x428286.data, _0x30e655, {
        projectTitleEdited: _0x428286.projectTitleEdited
      });
      _0x1b50be(_0x428286);
      _0x428286.data.project.summaryStatus = "completed";
      _0x428286.data.project.outlineStatus = "pending";
      if (_0x59fa6e(_0x428286)) {
        _0x3ffeb1.data = _0x428286.data;
        _0x3ffeb1.isGeneratingStory = false;
        _0x3ffeb1.generationStatus = "";
      }
      windowObject?.dispatchEvent?.(new CustomEvent("storyWorkspace:storyGenerated", {
        detail: {
          mode: _0x3420e5.mode,
          scriptMode: _0x3420e5.scriptMode,
          modelId: _0x3420e5.modelId,
          provider: _0x3420e5.provider,
          aspectRatio: _0x3420e5.aspectRatio,
          styleId: _0x3420e5.styleId,
          visualStyle: _0x3420e5.visualStyle,
          result: _0x30e655
        }
      }));
      _0x450b2c(_0x428286, _0x43b2cb, {
        status: "succeeded",
        message: "剧本摘要生成完成",
        resumable: false
      });
      await _0x4c9c7c.succeeded();
      _0x2e1a77("剧本摘要生成完成。", _0x428286, {
        step: 1,
        outlineSectionId: "summary"
      });
      _0x3c4e04({
        immediate: true
      });
      if (_0x59fa6e(_0x428286)) {
        _0xe5dd9c();
      }
    } catch (_0x139ba3) {
      if (!_0x2c064b(_0x428286)) {
        return false;
      }
      await _0x4c9c7c.failed(_0x139ba3).catch(() => {});
      _0x428286.data.project.summaryStatus = "error";
      _0x450b2c(_0x428286, _0x43b2cb, {
        status: "failed",
        message: "剧本摘要生成失败",
        error: _0x139ba3?.message || "剧本摘要生成失败，请稍后重试。",
        resumable: true,
        resumePayload: _0x4c9c7c.payload()
      });
      if (_0x59fa6e(_0x428286)) {
        _0x3ffeb1.isGeneratingStory = false;
        _0x3ffeb1.generationStatus = "";
        _0xe5dd9c();
      }
      _0x847d75(_0x139ba3?.message || "剧本摘要生成失败，请稍后重试。", "error", _0x139ba3);
    }
  }
  async function _0x1c53ec() {
    if (_0x3ffeb1.isGeneratingStory || _0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    if (typeof generateStory !== "function") {
      _0x1ce8f7("剧情 Agent 尚未初始化。", "error");
      return false;
    }
    const _0x5a0591 = buildStorySummaryRegenerationRequest(_0x3ffeb1.data.project, {
      modelId: _0x3ffeb1.models.text,
      provider: _0x3ffeb1.textProvider,
      providerProfileId: _0x3ffeb1.textProviderProfileId,
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    if (!_0x5a0591.ok) {
      _0x1ce8f7(_0x5a0591.error, "warn");
      return false;
    }
    const _0x82629d = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x51d761 = buildStoryBackgroundTaskId("story-summary");
    const _0x531c07 = _0x496cda(_0x82629d, _0x5a0591, _0x51d761);
    if (!(await _0x4ddc9d(_0x531c07))) {
      return false;
    }
    _0x3ffeb1.isGeneratingStory = true;
    _0x3ffeb1.generationStatus = "正在根据原始创意重新生成剧本摘要...";
    _0x3ffeb1.data.project.summaryStatus = "generating";
    _0x4ba4d1(_0x82629d, {
      id: _0x51d761,
      type: "story-summary",
      label: "重新生成剧本摘要",
      message: _0x3ffeb1.generationStatus,
      resumable: true,
      resumePayload: _0x531c07.payload()
    });
    _0xe5dd9c();
    try {
      await _0x531c07.start();
      const _0x50dfdb = _0x531c07.candidateArtifact || (await generateStory({
        ..._0x5a0591,
        model: _0x531c07.execution.modelId,
        provider: _0x531c07.execution.provider,
        providerProfileId: _0x531c07.execution.providerProfileId,
        onInvocation: _0x531c07.onInvocation,
        onProgress: ({
          message: _0x4ddfdf
        } = {}) => {
          if (!_0x2c064b(_0x82629d)) {
            return;
          }
          const _0x4629e0 = normalizeText(_0x4ddfdf) || "正在重新生成剧本摘要";
          _0x1dc293(_0x82629d, _0x51d761, {
            status: "running",
            message: _0x4629e0
          });
          if (_0x59fa6e(_0x82629d)) {
            _0x3ffeb1.generationStatus = _0x4629e0;
            if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 1) {
              _0xe5dd9c();
            }
          }
        }
      }));
      if (!_0x531c07.candidateArtifact) {
        await _0x531c07.ready(_0x50dfdb);
      }
      if (!_0x2c064b(_0x82629d)) {
        return false;
      }
      _0x82629d.data = applyGeneratedStoryResult(_0x82629d.data, _0x50dfdb, {
        projectTitleEdited: _0x82629d.projectTitleEdited
      });
      _0x82629d.data = invalidateStoryPlanningDownstream(_0x82629d.data, {
        clearEpisodeOutlines: true
      });
      _0x1b50be(_0x82629d);
      _0x82629d.data.project.summaryStatus = "completed";
      if (_0x59fa6e(_0x82629d)) {
        _0x3ffeb1.data = _0x82629d.data;
        _0x597655();
      }
      windowObject?.dispatchEvent?.(new CustomEvent("storyWorkspace:storyGenerated", {
        detail: {
          mode: _0x5a0591.mode,
          modelId: _0x5a0591.model,
          provider: _0x5a0591.provider,
          aspectRatio: _0x5a0591.aspectRatio,
          visualStyle: _0x5a0591.visualStyle,
          regenerated: true,
          result: _0x50dfdb
        }
      }));
      _0x3c4e04({
        immediate: true
      });
      _0x450b2c(_0x82629d, _0x51d761, {
        status: "succeeded",
        message: "剧本摘要重新生成完成",
        resumable: false
      });
      await _0x531c07.succeeded();
      _0x2e1a77("剧本摘要已重新生成。", _0x82629d, {
        step: 1,
        outlineSectionId: "summary"
      });
      return true;
    } catch (_0x4c7b20) {
      if (!_0x2c064b(_0x82629d)) {
        return false;
      }
      await _0x531c07.failed(_0x4c7b20).catch(() => {});
      _0x82629d.data.project.summaryStatus = normalizeText(_0x82629d.data.project.summary) ? "completed" : "error";
      reportStoryWorkspaceApiError("regenerate-story-summary", _0x4c7b20, {
        model: _0x5a0591.model,
        provider: _0x5a0591.provider
      });
      _0x450b2c(_0x82629d, _0x51d761, {
        status: "failed",
        message: "剧本摘要重新生成失败",
        error: _0x4c7b20?.message || "剧本摘要重新生成失败。",
        resumable: true,
        resumePayload: _0x531c07.payload()
      });
      _0x847d75(_0x4c7b20?.message || "剧本摘要重新生成失败，原摘要和下游内容均已保留。", "error", _0x4c7b20);
      return false;
    } finally {
      if (_0x59fa6e(_0x82629d)) {
        _0x3ffeb1.isGeneratingStory = false;
        _0x3ffeb1.generationStatus = "";
        _0xe5dd9c();
      }
    }
  }
  async function _0x4922bd(_0x13e42e) {
    if (!_0x13e42e) {
      return;
    }
    if (typeof extractDocumentText !== "function") {
      _0x1ce8f7("剧本文档解析服务尚未初始化。", "error");
      return;
    }
    const _0x597493 = _0x3ffeb1.data;
    _0x3ffeb1.isParsingDocument = true;
    _0xe5dd9c();
    try {
      const _0x142f61 = await extractDocumentText(_0x13e42e);
      if (_0x3ffeb1.data !== _0x597493) {
        return false;
      }
      const _0x43f090 = String(_0x142f61?.text || "").slice(0, STORY_SCRIPT_MAX_CHARACTERS);
      if (!normalizeText(_0x43f090)) {
        throw new Error("文档解析结果没有可用文本。");
      }
      _0x3ffeb1.scriptCharacterCount = Number.isFinite(_0x142f61?.characterCount) ? _0x142f61.characterCount : _0x43f090.length;
      _0x3ffeb1.scriptText = _0x43f090;
      _0x3ffeb1.uploadInputMode = "file";
      _0x3ffeb1.scriptFileName = _0x13e42e.name;
      if (!_0x3ffeb1.hasCreatedProject) {
        _0x3ffeb1.data.project.sourceDocument = {
          fileName: _0x13e42e.name,
          text: _0x43f090,
          characterCount: _0x3ffeb1.scriptCharacterCount
        };
      }
      _0x3c4e04({
        immediate: true
      });
      _0x847d75("剧本文档解析完成。", "success");
      return true;
    } catch (_0x2f9647) {
      _0x847d75(_0x2f9647?.message || "剧本文档解析失败。", "error", _0x2f9647);
      return false;
    } finally {
      _0x3ffeb1.isParsingDocument = false;
      _0xe5dd9c();
    }
  }
  function _0x2ce3ff({
    overlayId = "story-planning-confirm-overlay",
    title: _0x216a7e,
    message: _0x59c655,
    choices = [],
    fallbackValue = null
  } = {}) {
    if (!documentObject?.body) {
      return Promise.resolve(fallbackValue);
    }
    documentObject.getElementById(overlayId)?.remove();
    return new Promise(_0x1189f3 => {
      const _0x4688de = documentObject.createElement("div");
      _0x4688de.id = overlayId;
      _0x4688de.className = "custom-confirm-overlay";
      const _0x4f8f53 = documentObject.createElement("div");
      _0x4f8f53.className = "custom-confirm-box";
      const _0x6ae08a = documentObject.createElement("div");
      _0x6ae08a.className = "confirm-title";
      _0x6ae08a.textContent = _0x216a7e || "重新生成";
      const _0x5c7ff2 = documentObject.createElement("div");
      _0x5c7ff2.className = "confirm-msg";
      _0x5c7ff2.textContent = _0x59c655 || "请选择如何处理已有生成结果。";
      const _0x30a824 = documentObject.createElement("div");
      _0x30a824.className = "confirm-btns";
      _0x4f8f53.append(_0x6ae08a, _0x5c7ff2, _0x30a824);
      _0x4688de.appendChild(_0x4f8f53);
      documentObject.body.appendChild(_0x4688de);
      let _0x277141 = false;
      let _0x1d957f = null;
      const _0x172f50 = _0x35ab3f => {
        if (_0x277141) {
          return;
        }
        _0x277141 = true;
        documentObject.removeEventListener("keydown", _0x3f0fb9, true);
        _0x4688de.remove();
        _0x1189f3(_0x35ab3f);
      };
      const _0x3f0fb9 = _0x19e911 => {
        if (_0x19e911.key !== "Escape") {
          return;
        }
        _0x19e911.preventDefault();
        _0x172f50(null);
      };
      _0x4688de.addEventListener("click", _0x5b31ed => {
        if (_0x5b31ed.target === _0x4688de) {
          _0x172f50(null);
        }
      });
      choices.forEach(_0x1b9d77 => {
        const _0x1c2a19 = documentObject.createElement("button");
        _0x1c2a19.type = "button";
        _0x1c2a19.className = "confirm-btn " + (_0x1b9d77.primary ? "confirm-ok" : "confirm-cancel");
        _0x1c2a19.textContent = _0x1b9d77.label;
        _0x1c2a19.addEventListener("click", () => _0x172f50(_0x1b9d77.value));
        _0x30a824.appendChild(_0x1c2a19);
        if (_0x1b9d77.autofocus) {
          _0x1d957f = _0x1c2a19;
        }
      });
      documentObject.addEventListener("keydown", _0x3f0fb9, true);
      _0x1d957f?.focus?.();
    });
  }
  const _0x5bf9dc = createStoryAssetPaidRerunChoiceGate();
  function _0x11f782({
    title: _0xa9979b,
    message: _0x111780
  } = {}) {
    return _0x2ce3ff({
      title: _0xa9979b,
      message: _0x111780,
      fallbackValue: "preserve",
      choices: [{
        label: "取消",
        value: null
      }, {
        label: "保留已有媒体",
        value: "preserve",
        autofocus: true
      }, {
        label: "全部重建",
        value: "rebuild",
        primary: true
      }]
    });
  }
  function _0x548052() {
    return _0x2ce3ff({
      title: "仍有分集正文未完成",
      message: "当前仍有剧集正文未补充。继续素材拆解后，如果再次生成分集正文，将覆盖已生成的素材内容。是否继续进入人设？",
      choices: [{
        label: "取消",
        value: null
      }, {
        label: "继续拆解",
        value: "continue",
        primary: true,
        autofocus: true
      }]
    });
  }
  async function _0xae8d80({
    confirmMissingImages = false
  } = {}) {
    const _0x379d0c = confirmMissingImages ? getMissingStoryAssetImages(_0x3ffeb1.data.assets) : [];
    if (_0x379d0c.length) {
      const _0x274403 = await _0x2ce3ff({
        title: "部分素材图片尚未生成",
        message: buildMissingStoryAssetImageWarning(_0x379d0c),
        choices: [{
          label: "返回补图",
          value: null,
          autofocus: true
        }, {
          label: "跳过并继续",
          value: "skip",
          primary: true
        }]
      });
      if (_0x274403 !== "skip") {
        return false;
      }
    }
    return _0x220ab0(3);
  }
  function _0x25f8df({
    clearState = false
  } = {}) {
    if (_0x35eac0) {
      windowObject.clearTimeout(_0x35eac0);
      _0x35eac0 = null;
    }
    if (clearState) {
      _0x3ffeb1.assetBreakdownEpisodes = [];
      _0x3ffeb1.assetBreakdownVisibleCount = 0;
    }
  }
  function _0x51cf9a() {
    _0x25f8df();
    if (_0x3ffeb1.data?.project?.sourceMode === "video-replication") {
      return;
    }
    const _0x4b5fa4 = getStoryAssetBreakdownEpisodes(_0x3ffeb1).length;
    if (!isStoryAssetExtractionOperation(_0x3ffeb1.storyPlanningOperation) || _0x3ffeb1.assetBreakdownVisibleCount >= _0x4b5fa4) {
      return;
    }
    _0x35eac0 = windowObject.setTimeout(() => {
      _0x35eac0 = null;
      if (!isStoryAssetExtractionOperation(_0x3ffeb1.storyPlanningOperation)) {
        return;
      }
      _0x3ffeb1.assetBreakdownVisibleCount = Math.min(_0x4b5fa4, Math.max(1, _0x3ffeb1.assetBreakdownVisibleCount + 1));
      if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 1) {
        _0xe5dd9c({
          updateToolbar: false
        });
      }
      _0x51cf9a();
    }, 1600);
  }
  function _0x4b7537() {
    if (_0x3ffeb1.data?.project?.sourceMode === "video-replication") {
      return false;
    }
    if (!isStoryAssetExtractionOperation(_0x3ffeb1.storyPlanningOperation)) {
      return false;
    }
    _0x3ffeb1.assetBreakdownEpisodes = _0x5d0718(_0x3ffeb1.data.episodes || []);
    const _0x5b380b = _0x3ffeb1.assetBreakdownEpisodes.length;
    _0x3ffeb1.assetBreakdownVisibleCount = _0x5b380b ? Math.min(_0x5b380b, Math.max(1, Number(_0x3ffeb1.assetBreakdownVisibleCount) || 1)) : 0;
    _0x51cf9a();
    return true;
  }
  function _0x3c6270(_0x3d25e0 = "", _0x503f68 = "") {
    _0x3ffeb1.storyPlanningOperation = _0x3d25e0;
    _0x3ffeb1.storyPlanningStatus = _0x503f68;
    if (_0x3ffeb1.data?.project?.sourceMode === "video-replication" && _0x25ae28()) {
      return;
    }
    _0xe5dd9c();
  }
  function _0x37b4c9(_0x4162fa = _0x3ffeb1.data, _0x533af6 = null) {
    const _0x396255 = _0x4162fa?.project || {};
    const _0x20bd07 = _0x533af6?.modelSettings || {};
    const _0x411e27 = _0x20bd07.textProvider || _0x3ffeb1.textProvider;
    syncStoryPromptModeForVideoModel({
      ..._0x3ffeb1,
      data: _0x4162fa
    }, _0x20bd07.models?.video || _0x3ffeb1.models.video);
    _0x396255.planning = normalizeStoryProjectPlanning(_0x396255, {
      allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
    });
    return {
      project: _0x396255,
      assets: Array.isArray(_0x4162fa?.assets) ? _0x4162fa.assets : [],
      model: _0x20bd07.models?.text || _0x3ffeb1.models.text,
      provider: _0x411e27,
      providerProfileId: resolveStoryTextProviderProfileId(_0x411e27, _0x20bd07.textProviderProfileId || _0x3ffeb1.textProviderProfileId),
      aspectRatio: normalizeStoryAspectRatio(_0x396255.aspectRatio),
      visualStyle: resolveStoryStyleSelection({
        styleId: _0x396255.videoStyleId,
        stylePrompt: _0x396255.videoStylePrompt,
        videoStyle: _0x396255.videoStyle
      }).stylePrompt
    };
  }
  async function _0xf1b5ce({
    advance = true,
    allowIncompleteScripts = false,
    experimental = false,
    singleRequest = false
  } = {}) {
    const _0x539a5c = normalizeText(_0x3ffeb1.data?.project?.id) || "current-project";
    if (_0x3ffeb1.storyPlanningOperation || _0xc8f37c.has(_0x539a5c)) {
      return false;
    }
    if (experimental && !isStoryAssetExperimentalExtractionAvailable(windowObject)) {
      return false;
    }
    const _0x163d65 = _0x3ffeb1.data.project?.sourceMode === "video-replication";
    if (_0x3ffeb1.data.episodes.length) {
      const _0x21cef1 = _0x36a0eb();
      if (!_0x21cef1.complete && !allowIncompleteScripts) {
        _0x1ce8f7("请先按顺序生成所有分集剧本。", "warn");
        return false;
      }
    }
    const _0x24547d = shouldUseStoryVideoReplicationUnifiedAssetLocalization(_0x3ffeb1.data);
    const _0x2a5956 = singleRequest || _0x24547d;
    const _0x1ce78f = shouldUseStoryAssetParallelExtraction({
      parallelAgentAvailable: typeof extractAssetsParallel === "function",
      forceSingleRequest: _0x2a5956,
      explicitExperimental: experimental
    });
    const _0x34bf3d = shouldUseStoryAssetBatchedExtraction(_0x3ffeb1.data, {
      batchedAgentAvailable: typeof extractAssetsExperimental === "function",
      forceSingleRequest: _0x2a5956,
      explicitExperimental: experimental
    });
    const _0x541c43 = !_0x1ce78f && !_0x34bf3d;
    const _0x26c107 = _0x1ce78f ? extractAssetsParallel : _0x34bf3d ? extractAssetsExperimental : extractAssets;
    const _0x4df6a6 = _0x1ce78f ? "extracting-assets" : _0x541c43 ? "extracting-assets-single-request" : "extracting-assets-experimental";
    const _0x5401a7 = _0x1ce78f ? _0x163d65 ? "本地化角色、场景与道具" : "并行提取角色、场景与道具" : _0x541c43 ? _0x163d65 ? "本地化角色、场景与道具" : "单次超长提取角色、场景与道具" : "正在按剧本长度选择三类专用 API 或 PP-UIE + API，并生成最终视觉素材";
    if (typeof _0x26c107 !== "function") {
      _0x1ce8f7((experimental ? "混合开发测试" : "素材") + "提取尚未初始化。", "error");
      return false;
    }
    const _0x39cfa9 = _0x3ffeb1.data.project?.sourceMode === "upload-original";
    const _0xd5dc51 = _0x39cfa9 || _0x163d65;
    const _0x101233 = experimental ? "experimentalAssetExtractionDraft" : "assetExtractionDraft";
    const _0x368d84 = _0x3ffeb1.data;
    const _0x1bf9d2 = _0x368d84[_0x101233];
    const _0x5b3c7b = getStoryAssetPaidRerunBlockedLanes(_0x1bf9d2);
    const _0x6209c1 = getStoryAssetPaidRerunBlockedBatches(_0x1bf9d2);
    const _0x20f86 = _0x5b3c7b.length + _0x6209c1.length;
    const _0x3c76d1 = getStoryAssetModelChangeRerunKinds(_0x1bf9d2);
    let _0x1fa63f = null;
    if (_0x3c76d1.length && !_0x6209c1.length && _0x5b3c7b.length === _0x3c76d1.length) {
      _0x1fa63f = {
        confirmed: true,
        authorizedKinds: _0x3c76d1
      };
    } else if (_0x20f86) {
      const _0x1aed09 = await _0x5bf9dc({
        draft: _0x1bf9d2,
        requestChoice: _0x2ce3ff,
        isCurrent: () => _0x3ffeb1.data === _0x368d84
      });
      if (!["local-revalidate", "paid-rerun"].includes(_0x1aed09.action) || _0x3ffeb1.storyPlanningOperation) {
        return false;
      }
      _0x1fa63f = _0x1aed09.paidRerunAuthorization;
    }
    const _0x32ec05 = isStoryAssetLocalQualityRevalidationDraft(_0x1bf9d2);
    const _0x1543d3 = isStoryAssetPlannedContinuationDraft(_0x1bf9d2);
    let _0x4ea96c = "preserve";
    if (_0x3ffeb1.data.assets.length && !_0x32ec05 && !_0x1543d3 && !_0x20f86) {
      _0xc8f37c.add(_0x539a5c);
      try {
        _0x4ea96c = await _0x11f782({
          title: experimental ? "混合开发测试重新提取角色、场景与道具" : "重新提取角色、场景与道具",
          message: _0xd5dc51 ? "保留已有媒体会沿用匹配素材的图片；全部重建会清空素材媒体和下游分镜，不会改写或删除上传的原始剧本。" : "保留已有媒体会沿用匹配角色、场景和道具的图片；全部重建会清空素材媒体和下游分镜，保留已确认的分集正文。"
        });
      } finally {
        _0xc8f37c.delete(_0x539a5c);
      }
      if (!_0x4ea96c || _0x3ffeb1.data !== _0x368d84) {
        return false;
      }
    }
    _0x25f8df({
      clearState: true
    });
    if (!_0x163d65) {
      _0x3ffeb1.assetBreakdownEpisodes = _0x5d0718(_0x3ffeb1.data.episodes);
      _0x3ffeb1.assetBreakdownVisibleCount = _0x3ffeb1.assetBreakdownEpisodes.length ? 1 : 0;
    }
    _0x3c6270(_0x4df6a6, "正在" + _0x5401a7);
    if (!_0x163d65) {
      _0x51cf9a();
    }
    const _0x3ebd11 = _0x3ffeb1.step;
    const _0xf2ceac = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x274ab5 = _0x541c43 ? buildStoryBackgroundTaskId("asset-extraction-single-request") : experimental ? buildStoryBackgroundTaskId("asset-extraction-experimental") : buildStoryBackgroundTaskId("asset-extraction");
    _0x4ba4d1(_0xf2ceac, {
      id: _0x274ab5,
      type: _0x541c43 ? "asset-extraction-single-request" : experimental ? "asset-extraction-experimental" : "asset-extraction",
      label: _0x5401a7,
      message: _0x3ffeb1.storyPlanningStatus,
      resumable: !_0x541c43,
      ...(!_0x541c43 ? {
        resumePayload: {
          kind: "story-asset-extraction-run",
          draftKey: _0x101233
        }
      } : {})
    });
    const _0x50c3b3 = _0xf2ceac.data;
    try {
      const _0x3f5c15 = _0x37b4c9(_0x50c3b3, _0xf2ceac);
      const _0x495b44 = _0x163d65 ? buildStoryVideoReplicationAssetExtractionProject(_0x50c3b3) : _0x3f5c15.project;
      const _0x45494f = async (_0x4794da = null) => _0x26c107({
        ..._0x3f5c15,
        project: _0x495b44,
        episodes: _0x50c3b3.episodes,
        ...(_0x34bf3d ? {
          diagnostics: createStoryAssetExtractionDeveloperDiagnostics(windowObject)
        } : {}),
        ...(_0x1ce78f || _0x34bf3d ? {
          resumeDraft: _0x4794da,
          ...(_0x1ce78f ? {
            automaticRecovery: !_0x163d65,
            ...(_0x163d65 ? {
              resumeSourceAliases: [{
                project: _0x3f5c15.project
              }]
            } : {})
          } : {}),
          ...(_0x1fa63f ? {
            paidRerunAuthorization: _0x1fa63f
          } : {}),
          onCheckpoint: async _0x148e03 => {
            if (!_0x2c064b(_0xf2ceac)) {
              return;
            }
            _0x50c3b3[_0x101233] = _0x5d0718(_0x148e03);
            _0x1dc293(_0xf2ceac, _0x274ab5, {
              resumable: true,
              modelId: _0x3f5c15.model,
              provider: _0x3f5c15.provider,
              resumePayload: {
                kind: "story-asset-extraction-run",
                draftKey: _0x101233
              }
            });
            _0x39491b(_0xf2ceac);
            await _0x434b0f();
          }
        } : _0x541c43 ? {
          allowOversizedPrompt: true,
          ...(_0x163d65 ? {
            maxOutputTokens: STORY_VIDEO_REPLICATION_UNIFIED_ASSET_MAX_OUTPUT_TOKENS,
            structuredOutputFallback: "prompt"
          } : {})
        } : {}),
        onProgress: ({
          message: _0x137fe5
        } = {}) => {
          if (!_0x2c064b(_0xf2ceac)) {
            return;
          }
          const _0x2f5a80 = normalizeText(_0x137fe5) || "正在" + _0x5401a7;
          _0x1dc293(_0xf2ceac, _0x274ab5, {
            status: "running",
            message: _0x2f5a80
          });
          if (_0x59fa6e(_0xf2ceac)) {
            _0x3ffeb1.storyPlanningStatus = _0x2f5a80;
            _0x44f08d();
            _0x2917a9();
          }
        }
      });
      const _0xffc237 = _0x1ce78f || _0x34bf3d ? await runStoryAssetExtractionToCompletion({
        initialResumeDraft: _0x50c3b3[_0x101233],
        isActive: () => _0x2c064b(_0xf2ceac),
        execute: async _0x28e37e => _0x45494f(_0x28e37e),
        onContinuation: async (_0xfca4f8, _0x6b3b0e) => {
          if (!_0x2c064b(_0xf2ceac)) {
            return;
          }
          _0x50c3b3[_0x101233] = _0x5d0718(_0xfca4f8);
          const _0x876861 = getStoryAssetExperimentalDraftDisplay(_0xfca4f8);
          const _0x2f0f4f = _0x876861.summary || normalizeText(_0x6b3b0e?.message) || "本轮分批调用已完成，系统正在自动继续剩余内容";
          _0x1dc293(_0xf2ceac, _0x274ab5, {
            status: "running",
            message: _0x2f0f4f + " · 正在自动继续"
          });
          _0x39491b(_0xf2ceac);
          await _0x434b0f();
          if (_0x59fa6e(_0xf2ceac)) {
            _0x3ffeb1.storyPlanningStatus = _0x2f0f4f + " · 正在自动继续";
            _0x44f08d();
          }
        }
      }) : await _0x45494f();
      if (!_0x2c064b(_0xf2ceac)) {
        return false;
      }
      const _0x46adf5 = Array.isArray(_0xffc237?.assets) ? _0xffc237.assets : [];
      const _0x41925d = _0x46adf5.filter(_0x58ffac => _0x58ffac?.designStatus === "baseline").length;
      const _0x3dd8b6 = !_0x163d65 || _0x46adf5.some(_0x48a2bb => _0x48a2bb?.kind === "scene");
      if (!_0x46adf5.length || _0x41925d || !_0x3dd8b6) {
        const _0x1418ee = new Error(_0x41925d ? "本轮有 " + _0x41925d + " 个素材没有完成 API 视觉反推；旧素材已保留，未进入下一步。" : !_0x3dd8b6 ? "本轮没有获得可用场景素材；旧素材已保留，未进入下一步。" : "本轮没有获得可用素材；旧素材已保留，未进入下一步。");
        _0x1418ee.type = "ASSET_VISUAL_RESULT_INCOMPLETE";
        throw _0x1418ee;
      }
      let _0x4e5d5e = _0x50c3b3;
      if (_0x4ea96c === "rebuild") {
        _0x4e5d5e = clearStoryPlanningForRebuild(_0x50c3b3);
        _0xf2ceac.data = _0x4e5d5e;
        _0x1b50be(_0xf2ceac);
        if (_0x59fa6e(_0xf2ceac)) {
          _0x3ffeb1.data = _0x4e5d5e;
          _0x597655();
        }
      }
      delete _0x4e5d5e.assetExtractionDraft;
      delete _0x4e5d5e.experimentalAssetExtractionDraft;
      const _0x53670a = _0x1ce78f ? "三路并行" : _0x541c43 ? _0x163d65 ? "统一资产本地化" : "单次超长" : _0xffc237?.extractionMode === "parallel-api" ? "角色、场景、道具三类 API 开发测试" : _0xffc237?.extractionMode === "api-fallback" ? "API 分批降级开发测试" : "PP-UIE + API 混合开发测试";
      const _0x306634 = _0x4ea96c !== "rebuild";
      _0x4e5d5e.assets = mergeStoryPlanningAssets(_0x4e5d5e.assets, _0xffc237?.assets, {
        preserveMedia: _0x306634,
        visualStyle: _0x3f5c15.visualStyle
      });
      const _0x41289d = _0xffc237?.candidateLedger?.summary?.quarantinedCount ? "，已隔离 " + Math.max(0, Math.trunc(Number(_0xffc237.candidateLedger.summary.quarantinedCount) || 0)) + " 个未通过证据裁决的候选" : "";
      if (_0xd5dc51 || _0x163d65 || _0x1ce78f || _0x34bf3d || _0x541c43) {
        _0x4e5d5e.episodes = attachUploadedStoryAssetsToEpisodes(_0x4e5d5e.episodes, _0x4e5d5e.assets);
      }
      if (_0x163d65) {
        markStoryVideoReplicationAssetLocalizationComplete(_0x4e5d5e);
      }
      _0x450b2c(_0xf2ceac, _0x274ab5, {
        status: "succeeded",
        message: _0x53670a + "已提取 " + _0x4e5d5e.assets.length + " 个素材" + _0x41289d,
        resumable: false
      });
      _0x3c4e04({
        immediate: true
      });
      _0x2e1a77(_0x53670a + "已提取 " + _0x4e5d5e.assets.length + " 个角色、场景与道具素材" + _0x41289d + "。", _0xf2ceac, {
        step: 2,
        assetId: _0x4e5d5e.assets[0]?.id
      }, {
        notificationMessage: _0x53670a + "角色、场景与道具素材提取完成。"
      });
      if (_0x59fa6e(_0xf2ceac)) {
        _0x3ffeb1.selectedAssetId = _0x4e5d5e.assets[0]?.id || "";
        _0x3ffeb1.assetFilter = _0x4e5d5e.assets[0]?.kind || "character";
        _0x25f8df({
          clearState: true
        });
        _0x3ffeb1.storyPlanningOperation = "";
        _0x3ffeb1.storyPlanningStatus = "";
        if (advance && _0x3ffeb1.view === "project" && _0x3ffeb1.step === _0x3ebd11) {
          _0x220ab0(2);
        } else {
          _0xe5dd9c();
        }
      }
      return true;
    } catch (_0x2fc5fa) {
      if (!_0x2c064b(_0xf2ceac)) {
        return false;
      }
      reportStoryWorkspaceApiError(_0x541c43 ? _0x163d65 ? "localize-replication-assets" : "extract-assets-single-request" : experimental ? "extract-assets-experimental" : "extract-assets", _0x2fc5fa, {
        model: _0x3ffeb1.models.text,
        provider: _0x3ffeb1.textProvider
      });
      _0x450b2c(_0xf2ceac, _0x274ab5, {
        status: "failed",
        message: (_0x541c43 ? _0x163d65 ? "资产本地化" : "单次超长" : experimental ? "混合开发测试" : "素材") + "提取失败",
        error: _0x2fc5fa?.message || _0x5401a7 + "失败。"
      });
      _0x847d75(_0x2fc5fa?.message || _0x5401a7 + "失败。", "error", _0x2fc5fa);
      return false;
    } finally {
      if (_0x59fa6e(_0xf2ceac)) {
        _0x25f8df({
          clearState: true
        });
        if (_0x3ffeb1.storyPlanningOperation === _0x4df6a6) {
          _0x3c6270();
        }
      }
    }
  }
  async function _0x13330f() {
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    const _0x35c9db = _0x3ffeb1.data.episodes.length > 0 && !compileStoryEpisodeScripts(_0x3ffeb1.data.episodes).complete;
    if (_0x35c9db) {
      const _0x5726e7 = await _0x548052();
      if (_0x5726e7 !== "continue") {
        return false;
      }
    }
    return _0xf1b5ce({
      advance: true,
      allowIncompleteScripts: _0x35c9db
    });
  }
  const _0x1b5e3e = createStoryEpisodeOutlineWorkspaceController({
    state: _0x3ffeb1,
    planEpisodes: planEpisodes,
    host: {
      showToast: _0x1ce8f7,
      showTaskResultToast: _0x847d75,
      requestChoice: _0x2ce3ff,
      requestRegenerationMode: _0x11f782,
      createProjectTaskToken: () => createStoryProjectTaskToken(_0x3ffeb1),
      getPlanningContext: _0x37b4c9,
      isProjectTaskLive: _0x2c064b,
      isProjectTaskCurrent: _0x59fa6e,
      startBackgroundTask: _0x4ba4d1,
      updateBackgroundTask: _0x1dc293,
      finishBackgroundTask: _0x450b2c,
      persistNow: _0x434b0f,
      persistenceRequired: () => typeof saveWorkspace === "function" && _0x65309f.isReady(),
      setPlanningOperation: _0x3c6270,
      syncPlanningLoading: _0x44f08d,
      registerProjectData: _0x1b50be,
      resetDownstreamUi: _0x597655,
      schedulePersistence: _0x3c4e04,
      notifyComplete: _0x2e1a77,
      render: _0xe5dd9c
    }
  });
  function _0x25621d(_0x1367bd = {}) {
    return _0x1b5e3e.execute(_0x1367bd);
  }
  function _0x36a0eb(_0x198c4d = _0x3ffeb1.data) {
    const _0x47ae97 = compileStoryEpisodeScripts(_0x198c4d.episodes);
    const _0xdf52e4 = _0x198c4d.project || {};
    _0xdf52e4.chapters = _0x47ae97.chapters;
    _0xdf52e4.plotScript = _0x47ae97.fullText;
    _0xdf52e4.narrationScript = _0x47ae97.fullText;
    _0xdf52e4.compiledScript = _0x47ae97.complete ? {
      revision: Number(_0xdf52e4.compiledScript?.revision || 0) + 1,
      episodeIds: _0x198c4d.episodes.map(_0x11e35a => _0x11e35a.id),
      fullText: _0x47ae97.fullText,
      confirmedAt: Date.now()
    } : null;
    return _0x47ae97;
  }
  function _0x597655({
    selectedEpisodeId = ""
  } = {}) {
    _0x3ffeb1.assetSelectionMode = false;
    _0x3ffeb1.selectedAssetIds = [];
    _0x3ffeb1.selectedAssetId = "";
    _0x3ffeb1.assetAppearanceIndexes = {};
    _0x3ffeb1.characterVoiceEditor = null;
    _0x3ffeb1.episodeSelectionMode = false;
    _0x3ffeb1.selectedEpisodeIds = [];
    _0x3ffeb1.selectedEpisodeId = selectedEpisodeId;
    _0x3ffeb1.selectedClipId = "";
    _0x3ffeb1.pendingDeleteClipId = "";
    _0x3ffeb1.clipSelectionMode = false;
    _0x3ffeb1.selectedClipGenerationIds = [];
    _0x3ffeb1.scriptSelectionMode = false;
    _0x3ffeb1.selectedScriptEpisodeIds = [];
  }
  const _0x3bfc46 = createStoryEpisodeScriptWorkspaceController({
    state: _0x3ffeb1,
    generateEpisodeScript: generateEpisodeScript,
    host: {
      createProjectTaskToken: () => createStoryProjectTaskToken(_0x3ffeb1),
      isProjectTaskLive: _0x2c064b,
      isProjectTaskCurrent: _0x59fa6e,
      getPlanningContext: _0x37b4c9,
      requestChoice: _0x2ce3ff,
      startBackgroundTask: _0x4ba4d1,
      updateBackgroundTask: _0x1dc293,
      finishBackgroundTask: _0x450b2c,
      persistNow: _0x434b0f,
      persistenceRequired: () => typeof saveWorkspace === "function" && _0x65309f.isReady(),
      renderPlanningProgress: () => {
        if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 1) {
          _0xe5dd9c();
        }
      },
      registerProjectData: _0x1b50be,
      resetDownstreamUi: _0x597655,
      syncCompiledScripts: _0x36a0eb,
      schedulePersistence: _0x3c4e04
    }
  });
  async function _0x1f788d(_0x4f8f80, _0x1accdc = createStoryProjectTaskToken(_0x3ffeb1), {
    batch = null,
    regeneration = false
  } = {}) {
    return await _0x3bfc46.request(_0x4f8f80, _0x1accdc, {
      batch: batch,
      regeneration: regeneration
    });
  }
  async function _0x4cbbeb(_0x186c6d, {
    regeneration = false
  } = {}) {
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    const _0x641db8 = _0x3ffeb1.data.episodes.findIndex(_0x1760ba => _0x1760ba.id === _0x186c6d);
    if (_0x641db8 < 0) {
      return false;
    }
    if (!regeneration && !canGenerateStoryEpisodeScript(_0x3ffeb1.data.episodes, _0x641db8)) {
      _0x1ce8f7("请先完成第 " + (getNextStoryEpisodeScriptIndex(_0x3ffeb1.data.episodes) + 1) + " 集剧本。", "warn");
      return false;
    }
    const _0x2dd8cf = _0x3ffeb1.data.episodes[_0x641db8];
    _0x3ffeb1.scriptGenerationFocusMode = true;
    _0x3ffeb1.generatingEpisodeScriptId = _0x2dd8cf.id;
    _0x3ffeb1.episodeScriptGenerationStatus = "正在生成第 " + (_0x641db8 + 1) + " 集完整剧本";
    _0x3c6270("writing-episode-script", _0x3ffeb1.episodeScriptGenerationStatus);
    const _0x329dc9 = createStoryProjectTaskToken(_0x3ffeb1);
    try {
      const _0x35e210 = await _0x1f788d(_0x2dd8cf, _0x329dc9, {
        regeneration: regeneration
      });
      if (!_0x2c064b(_0x329dc9)) {
        return false;
      }
      _0x2e1a77("第 " + (_0x641db8 + 1) + " 集完整剧本生成完成。", _0x329dc9, {
        step: 1,
        outlineSectionId: "episode-" + _0x186c6d
      });
      return Boolean(_0x35e210);
    } catch (_0x5b210c) {
      if (!_0x2c064b(_0x329dc9)) {
        return false;
      }
      reportStoryWorkspaceApiError("write-episode-script", _0x5b210c, {
        model: _0x3ffeb1.models.text,
        provider: _0x3ffeb1.textProvider,
        episodeId: _0x186c6d
      });
      _0x847d75(_0x5b210c?.message || "第 " + (_0x641db8 + 1) + " 集剧本生成失败。", "error", _0x5b210c);
      return false;
    } finally {
      if (_0x59fa6e(_0x329dc9)) {
        _0x3ffeb1.generatingEpisodeScriptId = "";
        _0x3ffeb1.episodeScriptGenerationStatus = "";
        _0x3ffeb1.storyPlanningOperation = "";
        _0x3ffeb1.storyPlanningStatus = "";
        _0xe5dd9c();
      }
    }
  }
  function _0x22285a() {
    if (_0x3ffeb1.storyPlanningOperation !== "writing-episode-scripts") {
      return false;
    }
    const _0xaa37fe = normalizeText(_0x3ffeb1.episodeScriptBatchId);
    if (!_0xaa37fe) {
      return false;
    }
    const _0x18b5d8 = getStoryBackgroundTasks(_0x3ffeb1.data).find(_0x11d7a7 => isStoryBackgroundTaskActive(_0x11d7a7) && _0x11d7a7.batch?.id === _0xaa37fe);
    if (!_0x18b5d8) {
      return false;
    }
    const _0x5d5bde = normalizeText(_0x3ffeb1.generatingEpisodeScriptId);
    const _0x1a1962 = (Array.isArray(_0x18b5d8.batch?.pendingEpisodeIds) ? _0x18b5d8.batch.pendingEpisodeIds : []).map(_0x4b1a3b => normalizeText(_0x4b1a3b)).filter(_0x23d613 => _0x23d613 && _0x23d613 !== _0x5d5bde);
    if (!_0x1a1962.length) {
      _0x1ce8f7("当前集正在生成，暂无可取消的排队分集。", "info");
      return false;
    }
    if (!_0x348581.request(_0xaa37fe)) {
      return false;
    }
    const _0x53c86a = _0x3ffeb1.data.episodes.findIndex(_0x29b917 => normalizeText(_0x29b917?.id) === _0x5d5bde);
    const _0x4f21c1 = _0x53c86a >= 0 ? "已取消后续 " + _0x1a1962.length + " 集排队，正在完成第 " + (_0x53c86a + 1) + " 集" : "已取消后续 " + _0x1a1962.length + " 集排队，正在完成当前集";
    const _0x214243 = createStoryProjectTaskToken(_0x3ffeb1);
    _0x38ed49(_0x214243, _0xaa37fe, {
      cancelRequested: true,
      cancelledEpisodeIds: _0x1a1962,
      pendingEpisodeIds: _0x5d5bde ? [_0x5d5bde] : [],
      label: _0x4f21c1
    });
    _0x3ffeb1.episodeScriptBatchCancelRequested = true;
    _0x3ffeb1.episodeScriptGenerationStatus = _0x4f21c1;
    _0x3ffeb1.storyPlanningStatus = _0x4f21c1;
    _0xe5dd9c();
    _0x1ce8f7("已取消后续 " + _0x1a1962.length + " 集排队；当前集会继续生成。", "info");
    return true;
  }
  async function _0x151dbf({
    selectedOnly = false
  } = {}) {
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    if (selectedOnly && !_0x3ffeb1.selectedScriptEpisodeIds.length) {
      _0x1ce8f7("请先选择从下一集开始的连续分集。", "info");
      return false;
    }
    const _0x132ab8 = getStoryEpisodeScriptBatchTargets(_0x3ffeb1.data.episodes, selectedOnly ? _0x3ffeb1.selectedScriptEpisodeIds : []);
    if (!_0x132ab8.length) {
      _0x1ce8f7(selectedOnly ? "请选择从下一集开始的连续分集。" : "没有待生成的分集剧本。", "info");
      return false;
    }
    _0x3ffeb1.isBatchGeneratingScripts = true;
    _0x3ffeb1.scriptGenerationFocusMode = true;
    const _0x1bd54b = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x456e87 = _0x1bd54b.data;
    const _0x417a2b = _0x2826d4("episode-scripts", {
      total: _0x132ab8.length,
      completed: 0,
      targetEpisodeIds: _0x132ab8.map(_0x2ab415 => _0x2ab415.id),
      pendingEpisodeIds: _0x132ab8.map(_0x5067cd => _0x5067cd.id),
      label: "批量生成 0/" + _0x132ab8.length
    });
    _0x3ffeb1.episodeScriptBatchId = _0x417a2b.id;
    _0x3ffeb1.episodeScriptBatchCancelRequested = false;
    _0x3c6270("writing-episode-scripts", "准备按顺序生成 " + _0x132ab8.length + " 集");
    let _0x2d880b = 0;
    try {
      const _0x11f1ff = await runStoryEpisodeScriptBatchQueue({
        targets: _0x132ab8,
        batchId: _0x417a2b.id,
        isLive: () => _0x2c064b(_0x1bd54b),
        isCancellationRequested: _0x3ae434 => _0x348581.isRequested(_0x3ae434),
        beforeTarget: ({
          target: _0x5f1bab,
          completed: _0x3c37bc,
          total: _0x38b0af,
          pendingTargets: _0x2ec45
        }) => {
          const _0x20571b = _0x456e87.episodes.findIndex(_0x36203a => _0x36203a.id === _0x5f1bab.id);
          const _0x246126 = "正在生成第 " + (_0x20571b + 1) + " 集 · " + (_0x3c37bc + 1) + "/" + _0x38b0af;
          _0x18b12d(_0x1bd54b, _0x417a2b, {
            completed: _0x3c37bc,
            pendingEpisodeIds: _0x2ec45.map(_0x4eeafe => _0x4eeafe.id),
            label: _0x246126
          });
          if (_0x59fa6e(_0x1bd54b)) {
            _0x3ffeb1.generatingEpisodeScriptId = _0x5f1bab.id;
            _0x3ffeb1.episodeScriptGenerationStatus = _0x246126;
            _0xe5dd9c();
          }
        },
        runTarget: async _0x3e6cec => {
          const _0x1d9db3 = _0x456e87.episodes.findIndex(_0x3be9c4 => _0x3be9c4.id === _0x3e6cec.id);
          return _0x1f788d(_0x456e87.episodes[_0x1d9db3], _0x1bd54b, {
            batch: _0x417a2b
          });
        },
        afterTarget: ({
          completed: _0x1b313b,
          total: _0x57e26c,
          pendingTargets: _0x4021b6,
          cancelRequested: _0x574bf6
        }) => {
          _0x2d880b = _0x1b313b;
          _0x18b12d(_0x1bd54b, _0x417a2b, {
            completed: _0x2d880b,
            cancelRequested: _0x574bf6,
            pendingEpisodeIds: _0x4021b6.map(_0x231982 => _0x231982.id),
            label: _0x574bf6 ? "批量生成已停止 · 完成 " + _0x2d880b + "/" + _0x57e26c : "批量生成 " + _0x2d880b + "/" + _0x57e26c
          });
        }
      });
      if (_0x11f1ff.status === "interrupted") {
        return false;
      }
      if (_0x11f1ff.status === "cancelled") {
        _0x2e1a77(_0x11f1ff.cancelled ? "当前集已完成，已取消剩余 " + _0x11f1ff.cancelled + " 集排队。" : "当前集已完成，批量生成已停止。", _0x1bd54b, {
          step: 1,
          outlineSectionId: "episodes"
        });
        if (_0x59fa6e(_0x1bd54b)) {
          _0x3ffeb1.scriptSelectionMode = false;
          _0x3ffeb1.selectedScriptEpisodeIds = [];
        }
        return true;
      }
      _0x2e1a77("已按顺序完成 " + _0x2d880b + " 集完整剧本。", _0x1bd54b, {
        step: 1,
        outlineSectionId: "episodes"
      });
      if (_0x59fa6e(_0x1bd54b)) {
        _0x3ffeb1.scriptSelectionMode = false;
        _0x3ffeb1.selectedScriptEpisodeIds = [];
      }
      return true;
    } catch (_0x280f38) {
      if (!_0x2c064b(_0x1bd54b)) {
        return false;
      }
      reportStoryWorkspaceApiError("write-episode-scripts-batch", _0x280f38, {
        model: _0x3ffeb1.models.text,
        provider: _0x3ffeb1.textProvider,
        completed: _0x2d880b
      });
      _0x847d75("已完成 " + _0x2d880b + " 集；" + (_0x280f38?.message || "后续分集生成失败。"), "error", _0x280f38);
      return false;
    } finally {
      _0x348581.clear(_0x417a2b.id);
      if (_0x59fa6e(_0x1bd54b)) {
        _0x3ffeb1.isBatchGeneratingScripts = false;
        _0x3ffeb1.generatingEpisodeScriptId = "";
        _0x3ffeb1.episodeScriptBatchId = "";
        _0x3ffeb1.episodeScriptBatchCancelRequested = false;
        _0x3ffeb1.episodeScriptGenerationStatus = "";
        _0x3ffeb1.storyPlanningOperation = "";
        _0x3ffeb1.storyPlanningStatus = "";
        _0xe5dd9c();
      }
    }
  }
  async function _0x57dd42(_0x5c4f0d) {
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    if (_0x3ffeb1.data.project?.sourceMode === "upload-original") {
      _0x1ce8f7("上传剧本保持原稿，不支持 AI 扩写分集正文。", "info");
      return false;
    }
    const _0x21c24c = _0x3ffeb1.data.episodes.findIndex(_0x3b5bcc => _0x3b5bcc.id === _0x5c4f0d);
    if (_0x21c24c < 0 || !normalizeText(_0x3ffeb1.data.episodes[_0x21c24c]?.script?.fullText)) {
      _0x1ce8f7("当前分集正文尚未生成。", "info");
      return false;
    }
    return _0x4cbbeb(_0x5c4f0d, {
      regeneration: true
    });
  }
  function _0x15d272(_0x45a5ef) {
    const _0x18ef25 = getNextStoryEpisodeScriptIndex(_0x3ffeb1.data.episodes);
    const _0x12ae76 = _0x3ffeb1.data.episodes.findIndex(_0x2c6e4d => _0x2c6e4d.id === _0x45a5ef);
    if (_0x12ae76 < _0x18ef25 || _0x12ae76 < 0) {
      return false;
    }
    const _0x191c99 = _0x3ffeb1.selectedScriptEpisodeIds.includes(_0x45a5ef);
    const _0x8f6ea6 = _0x191c99 ? _0x12ae76 : _0x12ae76 + 1;
    _0x3ffeb1.selectedScriptEpisodeIds = _0x3ffeb1.data.episodes.slice(_0x18ef25, _0x8f6ea6).map(_0xbc0b12 => _0xbc0b12.id);
    _0xe5dd9c();
    return true;
  }
  function _0x1871d2(_0x371fb4, _0x10a3c5, _0x1b95eb, _0x25982a = {}) {
    const _0x961578 = normalizeStoryPromptMode(_0x25982a.promptMode || _0x1b95eb?.data?.project?.planning?.promptMode, {
      allowDeveloperModes: true
    });
    const _0x1a9243 = resolveStoryPromptModeDefaultVideoModelId(_0x961578);
    const _0x1bb4a3 = resolveStoryWorkspaceModelId("video", _0x1a9243 || _0x1b95eb?.modelSettings?.models?.video || _0x3ffeb1.models.video);
    const _0x5d4524 = mergeStoryEpisodeSplit(_0x371fb4, _0x10a3c5, {
      ..._0x25982a,
      promptMode: _0x961578,
      videoModelId: _0x1bb4a3,
      includeDialogueVoiceGuidance: _0x1b95eb?.data?.project?.sourceMode === "video-replication"
    });
    initializeStoryEpisodeVideoGenerationDurations(_0x5d4524, _0x1bb4a3);
    return _0x5d4524;
  }
  function _0x279b50({
    episode: _0xfc56e6,
    projectToken: _0x5023c1,
    backgroundTaskId: _0x2e5c97,
    context: _0x906086,
    mode: _0x57cca3,
    promptExperiment = false
  }) {
    const _0x5afa91 = getStoryBackgroundTasks(_0x5023c1.data).find(_0x473da9 => _0x473da9.id === _0x2e5c97);
    return createStoryEpisodeSplitRunRecorder({
      project: _0x906086.project,
      episode: _0xfc56e6,
      assets: _0x5023c1.data.assets,
      constraints: _0x906086.project.planning,
      execution: {
        modelId: _0x906086.model,
        provider: _0x906086.provider,
        providerProfileId: _0x906086.providerProfileId
      },
      mode: _0x57cca3,
      promptExperiment: promptExperiment,
      resumePayload: _0x5afa91?.resumePayload,
      onChange: async _0x42f2b4 => {
        _0x1dc293(_0x5023c1, _0x2e5c97, {
          resumable: true,
          modelId: _0x42f2b4.input.execution.modelId,
          provider: _0x42f2b4.input.execution.provider,
          resumePayload: {
            kind: _0x42f2b4.kind,
            run: _0x42f2b4
          }
        });
        _0x39491b(_0x5023c1);
        const _0x704cc6 = await _0x434b0f();
        if (typeof saveWorkspace === "function" && _0x65309f.isReady() && !_0x704cc6) {
          throw new Error("分镜运行记录保存失败，已停止模型请求。");
        }
      }
    });
  }
  async function _0x59830c(_0x2211e2, _0x59b00f) {
    if (!_0x2211e2.requiresPaidRetry) {
      return true;
    }
    const _0x4b0e77 = await _0x2ce3ff({
      overlayId: "story-episode-split-paid-retry-" + _0x59b00f.id,
      title: "第 " + (_0x59b00f.number || "") + " 集上次请求尚未安全提交",
      message: "上次请求可能已经计费，或原始响应尚未完成本地提交。确认后才会再次调用模型。",
      fallbackValue: null,
      choices: [{
        label: "暂不重试",
        value: null,
        autofocus: true
      }, {
        label: "确认重新请求",
        value: "retry",
        primary: true
      }]
    });
    if (_0x4b0e77 !== "retry") {
      return false;
    }
    await _0x2211e2.authorizePaidRetry();
    return true;
  }
  async function _0x58d6ab(_0x1ea11b, _0x586554 = createStoryProjectTaskToken(_0x3ffeb1), {
    batch = null,
    repairDraft = null
  } = {}) {
    if (!_0x2c064b(_0x586554)) {
      return null;
    }
    const _0x18c4c2 = _0x586554.data;
    const _0x3a435a = _0x37b4c9(_0x18c4c2, _0x586554);
    const _0x495563 = buildStoryBackgroundTaskId("episode-split", {
      episodeId: _0x1ea11b.id
    });
    const _0x5d1b4b = _0x279b50({
      episode: _0x1ea11b,
      projectToken: _0x586554,
      backgroundTaskId: _0x495563,
      context: _0x3a435a,
      mode: "standard"
    });
    if (!(await _0x59830c(_0x5d1b4b, _0x1ea11b))) {
      return null;
    }
    _0x4ba4d1(_0x586554, {
      id: _0x495563,
      type: "episode-split",
      scope: {
        episodeId: _0x1ea11b.id
      },
      label: "拆分第 " + (_0x1ea11b.number || "") + " 集分镜",
      message: "正在生成分镜脚本",
      batch: batch,
      resumable: true,
      resumePayload: _0x5d1b4b.payload()
    });
    let _0x476f6a = null;
    try {
      await _0x5d1b4b.start();
      _0x476f6a = _0x5d1b4b.candidateArtifact || (await splitEpisode({
        project: _0x3a435a.project,
        episode: _0x1ea11b,
        assets: _0x18c4c2.assets,
        constraints: _0x3a435a.project.planning,
        clipDurationConstraints: resolveStoryVideoClipDurationConstraints(resolveStoryWorkspaceModelId("video", _0x586554.modelSettings?.models?.video || _0x3ffeb1.models.video)),
        model: _0x5d1b4b.execution.modelId,
        provider: _0x5d1b4b.execution.provider,
        providerProfileId: _0x5d1b4b.execution.providerProfileId,
        repairDraft: repairDraft,
        onInvocation: _0x5d1b4b.onInvocation,
        diagnostics: createStoryEpisodeSplitDeveloperDiagnostics(windowObject),
        onProgress: ({
          message: _0x28af67
        } = {}) => {
          if (!_0x2c064b(_0x586554)) {
            return;
          }
          _0x1dc293(_0x586554, _0x495563, {
            status: "running",
            message: normalizeText(_0x28af67) || "正在生成分镜脚本"
          });
        }
      }));
      _0x476f6a = await runStoryEpisodeSplitQualityReview({
        reviewEpisodeSplit: reviewEpisodeSplit,
        result: _0x476f6a,
        episode: _0x1ea11b,
        context: _0x3a435a,
        projectData: _0x18c4c2,
        splitRun: _0x5d1b4b,
        onProgress: ({
          message: _0x432d2c
        } = {}) => _0x1dc293(_0x586554, _0x495563, {
          status: "running",
          message: _0x432d2c
        })
      });
      if (!_0x5d1b4b.candidateArtifact) {
        await _0x5d1b4b.ready(_0x476f6a);
      }
    } catch (_0x4d03dd) {
      await _0x5d1b4b.failed(_0x4d03dd).catch(() => {});
      if (_0x2c064b(_0x586554)) {
        if (_0x4d03dd?.partialResult) {
          const _0x4095d2 = _0x18c4c2.episodes.findIndex(_0xc4601c => _0xc4601c.id === _0x1ea11b.id);
          if (_0x4095d2 >= 0) {
            _0x18c4c2.episodes[_0x4095d2] = {
              ..._0x18c4c2.episodes[_0x4095d2],
              splitDraft: _0x4d03dd.partialResult
            };
            _0x3c4e04({
              immediate: true
            });
          }
        }
        _0x450b2c(_0x586554, _0x495563, {
          status: "failed",
          message: _0x4d03dd?.partialResult ? "第 " + (_0x1ea11b.number || "") + " 集本次返回未完全通过，已保存原始结果" : "第 " + (_0x1ea11b.number || "") + " 集分镜拆分失败",
          error: _0x4d03dd?.message || "分集拆分失败。",
          resumable: true,
          resumePayload: _0x5d1b4b.payload()
        });
      }
      throw _0x4d03dd;
    }
    if (!_0x2c064b(_0x586554)) {
      return null;
    }
    const _0x36f707 = _0x1871d2(_0x1ea11b, _0x476f6a, _0x586554, {
      assets: _0x18c4c2.assets,
      preserveMedia: true,
      visualStyle: _0x3a435a.visualStyle,
      promptMode: _0x3a435a.project.planning?.promptMode
    });
    delete _0x36f707.splitDraft;
    delete _0x36f707.experimentalSplitDraft;
    _0x36f707.splitQualityReview = _0x476f6a.qualityReview;
    const _0x400216 = _0x18c4c2.episodes.findIndex(_0x42f701 => _0x42f701.id === _0x1ea11b.id);
    if (_0x400216 >= 0) {
      _0x18c4c2.episodes[_0x400216] = _0x36f707;
    }
    await _0x5d1b4b.succeeded();
    _0x450b2c(_0x586554, _0x495563, {
      status: "succeeded",
      message: _0x476f6a.qualityReview?.unresolvedClipRefs?.length ? "已拆分为 " + _0x36f707.clips.length + " 个片段；" + _0x476f6a.qualityReview.unresolvedClipRefs.length + " 个审片问题保留原片段待处理" : "已拆分为 " + _0x36f707.clips.length + " 个片段，审片已通过",
      resumable: false,
      resumePayload: _0x5d1b4b.payload()
    });
    return _0x36f707;
  }
  function _0x550dd2(_0x3e44d9) {
    if (typeof recoverEpisodeSplitDraft !== "function") {
      _0x1ce8f7("分镜本地恢复能力尚未初始化。", "error");
      return false;
    }
    const _0x5e2690 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x1a9dcd = _0x5e2690.data;
    const _0x531997 = _0x1a9dcd.episodes.findIndex(_0x32ac15 => _0x32ac15.id === _0x3e44d9);
    if (_0x531997 < 0) {
      return false;
    }
    const _0x4df414 = _0x1a9dcd.episodes[_0x531997];
    if (!_0x4df414?.splitDraft) {
      _0x1ce8f7("当前分集没有已保存的返回可供恢复。", "info");
      return false;
    }
    try {
      const _0x40121d = _0x37b4c9(_0x1a9dcd, _0x5e2690);
      const _0x5674ea = recoverEpisodeSplitDraft({
        project: _0x40121d.project,
        episode: _0x4df414,
        assets: _0x1a9dcd.assets,
        constraints: _0x40121d.project.planning,
        draft: _0x4df414.splitDraft
      });
      const _0xa5a62 = _0x1871d2(_0x4df414, _0x5674ea, _0x5e2690, {
        assets: _0x1a9dcd.assets,
        preserveMedia: true,
        visualStyle: _0x40121d.visualStyle,
        promptMode: _0x40121d.project.planning?.promptMode
      });
      delete _0xa5a62.splitDraft;
      delete _0xa5a62.experimentalSplitDraft;
      _0x1a9dcd.episodes[_0x531997] = _0xa5a62;
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c();
      _0x1ce8f7("第 " + (_0xa5a62.number || "") + " 集已在本地恢复为 " + _0xa5a62.clips.length + " 个片段；未调用模型。", "success");
      return true;
    } catch (_0x5af009) {
      _0x847d75((normalizeText(_0x5af009?.message) || "已保存结果仍无法在本地恢复。") + "（未调用模型。）", "error", _0x5af009);
      return false;
    }
  }
  async function _0x5c719b(_0xdf422f, {
    openAfter = false,
    repairDraft = false
  } = {}) {
    const _0x4e1a7f = getStoryEpisodeGenerationControlState(_0x3ffeb1, _0xdf422f);
    if (_0x4e1a7f.disabled) {
      return false;
    }
    const _0x1f68be = shouldUseStoryEpisodeExperimentalSplit(_0x3ffeb1);
    if (!_0x1f68be && typeof splitEpisode !== "function" || _0x1f68be && typeof splitEpisodeExperimental !== "function") {
      _0x1ce8f7("分镜拆分 Agent 尚未初始化。", "error");
      return false;
    }
    const _0xb4cb44 = _0x3ffeb1.data.episodes.find(_0x372254 => _0x372254.id === _0xdf422f);
    if (!_0xb4cb44) {
      return false;
    }
    setStoryEpisodeSplitRunning(_0x3ffeb1, _0xb4cb44.id, true);
    const _0x2ccad1 = createStoryProjectTaskToken(_0x3ffeb1);
    _0xe5dd9c();
    try {
      const _0x4eb177 = _0x1f68be ? await _0x2b612b(_0xb4cb44, _0x2ccad1, {
        experimentalLabel: false
      }) : await _0x58d6ab(_0xb4cb44, _0x2ccad1, {
        repairDraft: repairDraft === true ? _0xb4cb44.splitDraft : null
      });
      if (!_0x4eb177 || !_0x2c064b(_0x2ccad1)) {
        return false;
      }
      _0x3c4e04({
        immediate: true
      });
      _0x2e1a77("第 " + _0x4eb177.number + " 集已拆分为 " + _0x4eb177.clips.length + " 个片段。", _0x2ccad1, {
        episodeId: _0x4eb177.id,
        clipId: _0x4eb177.clips[0]?.id
      }, {
        notificationMessage: "第 " + _0x4eb177.number + " 集分镜脚本生成完成。"
      });
      if (openAfter && _0x59fa6e(_0x2ccad1)) {
        setStoryEpisodeSplitRunning(_0x3ffeb1, _0xb4cb44.id, false);
        await _0x1fbff1(_0x4eb177.id, _0x4eb177.clips[0]?.id);
      }
      return true;
    } catch (_0x1cc3a1) {
      if (!_0x2c064b(_0x2ccad1)) {
        return false;
      }
      _0x847d75(_0x1f68be ? resolveStoryEpisodeExperimentalErrorMessage(_0x1cc3a1, {
        retryActionLabel: "生成分镜脚本"
      }) : _0x1cc3a1?.message || "分集拆分失败。", "error", _0x1cc3a1);
      return false;
    } finally {
      if (_0x59fa6e(_0x2ccad1)) {
        setStoryEpisodeSplitRunning(_0x3ffeb1, _0xb4cb44.id, false);
        _0xe5dd9c();
      }
    }
  }
  async function _0x2b612b(_0x197e7f, _0x3e5c56 = createStoryProjectTaskToken(_0x3ffeb1), {
    batch = null,
    experimentalLabel = false,
    promptExperiment = false
  } = {}) {
    if (!_0x2c064b(_0x3e5c56)) {
      return null;
    }
    const _0x2ffb11 = _0x3e5c56.data;
    const _0x265683 = _0x37b4c9(_0x2ffb11, _0x3e5c56);
    const _0x39d785 = buildStoryBackgroundTaskId("episode-split-experimental", {
      episodeId: _0x197e7f.id
    });
    const _0x41c17b = _0x279b50({
      episode: _0x197e7f,
      projectToken: _0x3e5c56,
      backgroundTaskId: _0x39d785,
      context: _0x265683,
      mode: "experimental",
      promptExperiment: promptExperiment
    });
    if (!(await _0x59830c(_0x41c17b, _0x197e7f))) {
      return null;
    }
    _0x4ba4d1(_0x3e5c56, {
      id: _0x39d785,
      type: "episode-split-experimental",
      scope: {
        episodeId: _0x197e7f.id
      },
      label: experimentalLabel ? "实验分批拆分第 " + (_0x197e7f.number || "") + " 集" : "拆分第 " + (_0x197e7f.number || "") + " 集分镜",
      message: "正在规划整集分镜蓝图",
      batch: batch,
      resumable: true,
      resumePayload: _0x41c17b.payload()
    });
    const _0x5a2f8c = _0x2ffb11.episodes.findIndex(_0x467e6d => _0x467e6d.id === _0x197e7f.id);
    const _0x1525f5 = _0x5a2f8c > 0 ? _0x2ffb11.episodes[_0x5a2f8c - 1] : null;
    const _0x4986dc = _0x5a2f8c >= 0 ? _0x2ffb11.episodes[_0x5a2f8c + 1] || null : null;
    const _0x5b8456 = _0x41c17b.checkpoint || _0x197e7f?.experimentalSplitDraft;
    const _0x210aa5 = _0x5b8456?.status === "completed" ? null : _0x5b8456 || null;
    let _0x1f825a = null;
    try {
      await _0x41c17b.start();
      _0x1f825a = _0x41c17b.candidateArtifact || (await splitEpisodeExperimental({
        project: _0x265683.project,
        episode: _0x197e7f,
        previousEpisode: _0x1525f5,
        nextEpisode: _0x4986dc,
        assets: _0x2ffb11.assets,
        constraints: _0x265683.project.planning,
        model: _0x41c17b.execution.modelId,
        provider: _0x41c17b.execution.provider,
        providerProfileId: _0x41c17b.execution.providerProfileId,
        promptExperiment: promptExperiment === true,
        resumeDraft: _0x210aa5,
        onInvocation: _0x41c17b.onInvocation,
        diagnostics: createStoryEpisodeSplitDeveloperDiagnostics(windowObject),
        onCheckpoint: async _0x5a5e57 => {
          if (!_0x2c064b(_0x3e5c56)) {
            return;
          }
          const _0x55f486 = _0x2ffb11.episodes.findIndex(_0x1a9975 => _0x1a9975.id === _0x197e7f.id);
          if (_0x55f486 < 0) {
            return;
          }
          _0x2ffb11.episodes[_0x55f486] = {
            ..._0x2ffb11.episodes[_0x55f486],
            experimentalSplitDraft: _0x5d0718(_0x5a5e57)
          };
          await _0x41c17b.saveCheckpoint(_0x5a5e57);
        },
        onProgress: ({
          message: _0x2d618f
        } = {}) => {
          if (!_0x2c064b(_0x3e5c56)) {
            return;
          }
          _0x1dc293(_0x3e5c56, _0x39d785, {
            status: "running",
            message: normalizeText(_0x2d618f) || "正在生成分镜脚本"
          });
        }
      }));
      _0x1f825a = await runStoryEpisodeSplitQualityReview({
        reviewEpisodeSplit: reviewEpisodeSplit,
        result: _0x1f825a,
        episode: _0x197e7f,
        context: _0x265683,
        projectData: _0x2ffb11,
        splitRun: _0x41c17b,
        onProgress: ({
          message: _0x55cf84
        } = {}) => _0x1dc293(_0x3e5c56, _0x39d785, {
          status: "running",
          message: _0x55cf84
        })
      });
      if (!_0x41c17b.candidateArtifact) {
        await _0x41c17b.ready(_0x1f825a);
      }
    } catch (_0x300a37) {
      await _0x41c17b.failed(_0x300a37).catch(() => {});
      if (_0x2c064b(_0x3e5c56)) {
        const _0x30335c = resolveStoryEpisodeExperimentalErrorMessage(_0x300a37, {
          retryActionLabel: experimentalLabel ? "开发测试" : "生成分镜脚本"
        });
        if (_0x300a37?.experimentalDraft) {
          const _0x475139 = _0x2ffb11.episodes.findIndex(_0x32e28a => _0x32e28a.id === _0x197e7f.id);
          if (_0x475139 >= 0) {
            _0x2ffb11.episodes[_0x475139] = {
              ..._0x2ffb11.episodes[_0x475139],
              experimentalSplitDraft: _0x5d0718(_0x300a37.experimentalDraft)
            };
            _0x39491b(_0x3e5c56);
            _0x3c4e04({
              immediate: true
            });
          }
        }
        _0x450b2c(_0x3e5c56, _0x39d785, {
          status: "failed",
          message: experimentalLabel ? "第 " + (_0x197e7f.number || "") + " 集实验分批拆分失败" : "第 " + (_0x197e7f.number || "") + " 集分镜拆分失败",
          error: _0x30335c,
          resumable: true,
          resumePayload: _0x41c17b.payload()
        });
      }
      throw _0x300a37;
    }
    if (!_0x2c064b(_0x3e5c56)) {
      return null;
    }
    const _0xf7306f = _0x1871d2(_0x197e7f, _0x1f825a, _0x3e5c56, {
      assets: _0x2ffb11.assets,
      preserveMedia: true,
      visualStyle: _0x265683.visualStyle,
      promptMode: _0x265683.project.planning?.promptMode,
      includeContinuityHandoffs: true
    });
    delete _0xf7306f.splitDraft;
    delete _0xf7306f.experimentalSplitDraft;
    _0xf7306f.splitQualityReview = _0x1f825a.qualityReview;
    const _0xaea0f7 = _0x2ffb11.episodes.findIndex(_0xfd613a => _0xfd613a.id === _0x197e7f.id);
    if (_0xaea0f7 >= 0) {
      _0x2ffb11.episodes[_0xaea0f7] = _0xf7306f;
    }
    await _0x41c17b.succeeded();
    _0x450b2c(_0x3e5c56, _0x39d785, {
      status: "succeeded",
      message: _0x1f825a.qualityReview?.unresolvedClipRefs?.length ? "已拆分为 " + _0xf7306f.clips.length + " 个片段；" + _0x1f825a.qualityReview.unresolvedClipRefs.length + " 个审片问题保留原片段待处理" : "已拆分为 " + _0xf7306f.clips.length + " 个片段，审片已通过",
      resumable: false,
      resumePayload: _0x41c17b.payload()
    });
    return _0xf7306f;
  }
  async function _0x466213(_0x4b81c4) {
    if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
      return false;
    }
    const _0x205c05 = getStoryEpisodeGenerationControlState(_0x3ffeb1, _0x4b81c4);
    if (_0x205c05.disabled) {
      return false;
    }
    if (typeof splitEpisodeExperimental !== "function") {
      _0x1ce8f7("实验分批拆分 Agent 尚未初始化。", "error");
      return false;
    }
    const _0xcd876e = _0x3ffeb1.data.episodes.find(_0x1e6d62 => _0x1e6d62.id === _0x4b81c4);
    if (!_0xcd876e) {
      return false;
    }
    setStoryEpisodeSplitRunning(_0x3ffeb1, _0xcd876e.id, true);
    const _0x21589c = createStoryProjectTaskToken(_0x3ffeb1);
    _0xe5dd9c();
    try {
      const _0x33a70f = await _0x2b612b(_0xcd876e, _0x21589c, {
        experimentalLabel: true,
        promptExperiment: true
      });
      if (!_0x33a70f || !_0x2c064b(_0x21589c)) {
        return false;
      }
      _0x3c4e04({
        immediate: true
      });
      _0x2e1a77("第 " + _0x33a70f.number + " 集实验分批拆分完成，共 " + _0x33a70f.clips.length + " 个片段。", _0x21589c, {
        episodeId: _0x33a70f.id,
        clipId: _0x33a70f.clips[0]?.id
      }, {
        notificationMessage: "第 " + _0x33a70f.number + " 集实验分批分镜生成完成。"
      });
      return true;
    } catch (_0x4f6617) {
      if (!_0x2c064b(_0x21589c)) {
        return false;
      }
      _0x847d75(resolveStoryEpisodeExperimentalErrorMessage(_0x4f6617), "error", _0x4f6617);
      return false;
    } finally {
      if (_0x59fa6e(_0x21589c)) {
        setStoryEpisodeSplitRunning(_0x3ffeb1, _0xcd876e.id, false);
        _0xe5dd9c();
      }
    }
  }
  async function _0x393f88() {
    if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
      return false;
    }
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    if (typeof planEpisodes !== "function") {
      _0x1ce8f7("分集规划 Agent 尚未初始化。", "error");
      return false;
    }
    const _0x298b42 = normalizeStoryWorkspaceAssetData(_0x5d0718(_0x3ffeb1.data));
    const _0x3fdd98 = _0x37b4c9(_0x298b42);
    try {
      const _0x51a9ff = await captureStoryRequestPayload(_0x59aedf => planEpisodes({
        project: _0x3fdd98.project,
        constraints: _0x3fdd98.project.planning,
        model: _0x3fdd98.model,
        provider: _0x3fdd98.provider,
        providerProfileId: _0x3fdd98.providerProfileId,
        request: _0x59aedf
      }));
      openStoryRequestDebugPreview({
        documentObject: documentObject,
        windowObject: windowObject,
        payload: _0x51a9ff,
        title: "分集大纲请求调试",
        subtitle: "以下是点击“生成分集大纲”后构造的实际请求；本次仅预览，不会发送到 API。"
      });
      return true;
    } catch (_0x4fc305) {
      reportStoryWorkspaceApiError("debug-episode-outline-request", _0x4fc305);
      _0x1ce8f7(_0x4fc305?.message || "分集大纲调试请求构建失败。", "error");
      return false;
    }
  }
  async function _0x4898df() {
    if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
      return false;
    }
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    if (typeof generateEpisodeScript !== "function") {
      _0x1ce8f7("完整分集剧本 Agent 尚未初始化。", "error");
      return false;
    }
    const _0x1feaf8 = normalizeStoryWorkspaceAssetData(_0x5d0718(_0x3ffeb1.data));
    const _0x3fb153 = getNextStoryEpisodeScriptIndex(_0x1feaf8.episodes);
    const _0x246b5b = _0x1feaf8.episodes[_0x3fb153];
    if (!_0x246b5b) {
      _0x1ce8f7("没有待生成的分集正文。", "info");
      return false;
    }
    const _0x5d7e8b = _0x37b4c9(_0x1feaf8);
    try {
      const _0x1c4af5 = await captureStoryRequestPayload(_0x1772f0 => generateEpisodeScript({
        project: _0x5d7e8b.project,
        episode: _0x246b5b,
        previousEpisode: _0x3fb153 > 0 ? _0x1feaf8.episodes[_0x3fb153 - 1] : null,
        nextEpisode: _0x1feaf8.episodes[_0x3fb153 + 1] || null,
        model: _0x5d7e8b.model,
        provider: _0x5d7e8b.provider,
        providerProfileId: _0x5d7e8b.providerProfileId,
        request: _0x1772f0
      }));
      openStoryRequestDebugPreview({
        documentObject: documentObject,
        windowObject: windowObject,
        payload: _0x1c4af5,
        title: "第 " + (_0x246b5b.number || _0x3fb153 + 1) + " 集正文请求调试",
        subtitle: "以下是下一集正文生成时构造的实际请求；本次仅预览，不会发送到 API。"
      });
      return true;
    } catch (_0x692049) {
      reportStoryWorkspaceApiError("debug-episode-script-request", _0x692049, {
        episodeId: _0x246b5b.id
      });
      _0x1ce8f7(_0x692049?.message || "分集正文调试请求构建失败。", "error");
      return false;
    }
  }
  async function _0x4eaddd() {
    if (!isStoryAssetExperimentalExtractionAvailable(windowObject)) {
      return false;
    }
    if (_0x3ffeb1.storyPlanningOperation) {
      return false;
    }
    if (typeof extractAssetsExperimental !== "function") {
      _0x1ce8f7("混合素材开发测试尚未初始化。", "error");
      return false;
    }
    const _0x348fa9 = normalizeStoryWorkspaceAssetData(_0x5d0718(_0x3ffeb1.data));
    const _0x5ad7ae = _0x37b4c9(_0x348fa9);
    try {
      const _0x30566c = await captureStoryRequestPayload(_0x5be957 => extractAssetsExperimental({
        ..._0x5ad7ae,
        episodes: _0x348fa9.episodes,
        resumeDraft: _0x348fa9.experimentalAssetExtractionDraft,
        preferLocal: false,
        request: _0x5be957
      }));
      openStoryRequestDebugPreview({
        documentObject: documentObject,
        windowObject: windowObject,
        payload: _0x30566c,
        title: "混合素材抽取 API 请求调试",
        subtitle: "以下是开发链路构造的首个 API 请求；中短剧本预览角色专用请求，超长剧本因本次不运行本地模型而预览备用分批请求。仅供调试，不会发送到 API。"
      });
      return true;
    } catch (_0x104723) {
      reportStoryWorkspaceApiError("debug-asset-extraction-experimental-request", _0x104723);
      _0x1ce8f7(_0x104723?.message || "混合素材抽取调试请求构建失败。", "error");
      return false;
    }
  }
  async function _0x2fe544(_0x3a1796) {
    if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
      return false;
    }
    const _0xd16133 = getStoryEpisodeGenerationControlState(_0x3ffeb1, _0x3a1796);
    if (_0xd16133.disabled) {
      return false;
    }
    if (typeof splitEpisodeExperimental !== "function") {
      _0x1ce8f7("实验分批拆分 Agent 尚未初始化。", "error");
      return false;
    }
    const _0x3ec709 = normalizeStoryWorkspaceAssetData(_0x5d0718(_0x3ffeb1.data));
    const _0x1d63c6 = _0x3ec709.episodes.find(_0xa8a20f => _0xa8a20f.id === _0x3a1796);
    if (!_0x1d63c6) {
      return false;
    }
    const _0x39c819 = _0x37b4c9(_0x3ec709);
    const _0x1cae6c = _0x3ec709.episodes.findIndex(_0xdd44aa => _0xdd44aa.id === _0x1d63c6.id);
    const _0xd22533 = _0x1cae6c > 0 ? _0x3ec709.episodes[_0x1cae6c - 1] : null;
    const _0x339eb8 = _0x1cae6c >= 0 ? _0x3ec709.episodes[_0x1cae6c + 1] || null : null;
    const _0x100fae = _0x1d63c6?.experimentalSplitDraft?.status === "completed" ? null : _0x1d63c6?.experimentalSplitDraft || null;
    try {
      const _0x1c81f1 = await captureStoryRequestPayload(_0x131d3e => splitEpisodeExperimental({
        project: _0x39c819.project,
        episode: _0x1d63c6,
        previousEpisode: _0xd22533,
        nextEpisode: _0x339eb8,
        assets: _0x3ec709.assets,
        constraints: _0x39c819.project.planning,
        model: _0x39c819.model,
        provider: _0x39c819.provider,
        providerProfileId: _0x39c819.providerProfileId,
        promptExperiment: true,
        resumeDraft: _0x100fae,
        request: _0x131d3e
      }));
      openStoryRequestDebugPreview({
        documentObject: documentObject,
        windowObject: windowObject,
        payload: _0x1c81f1,
        title: "第 " + (_0x1d63c6.number || "") + " 集请求调试",
        subtitle: "以下是点击“开发测试”后下一次实际构造的请求；本次仅预览，不会发送到 API。"
      });
      return true;
    } catch (_0x412fbb) {
      reportStoryWorkspaceApiError("debug-experimental-split-request", _0x412fbb, {
        episodeId: _0x1d63c6.id
      });
      _0x1ce8f7(_0x412fbb?.message || "调试请求构建失败。", "error");
      return false;
    }
  }
  async function _0x1d834a({
    selectionMode = false,
    experimental = true
  } = {}) {
    if (getStoryEpisodeBatchControlState(_0x3ffeb1).disabled) {
      return false;
    }
    if (experimental && typeof splitEpisodeExperimental !== "function" || !experimental && typeof splitEpisode !== "function") {
      _0x1ce8f7("分镜拆分 Agent 尚未初始化。", "error");
      return false;
    }
    const _0x8e151d = new Set((Array.isArray(_0x3ffeb1.splittingEpisodeIds) ? _0x3ffeb1.splittingEpisodeIds : []).map(_0x438e5f => normalizeText(_0x438e5f)).filter(Boolean));
    const _0x91b702 = getStoryEpisodeBatchTargets(_0x3ffeb1.data.episodes, _0x3ffeb1.selectedEpisodeIds, selectionMode).filter(_0x42d334 => !_0x8e151d.has(normalizeText(_0x42d334?.id)));
    if (!_0x91b702.length) {
      _0x1ce8f7("请先选择需要拆分的分集。", "info");
      return false;
    }
    const _0x34d695 = selectionMode ? "splitting-selected" : "splitting-all";
    const _0x416c2d = selectionMode ? "正在拆分选中分集" : "正在批量拆分";
    const _0x13c5fb = _0x91b702.map(_0x5ebf24 => normalizeText(_0x5ebf24.id)).filter(Boolean);
    _0x13c5fb.forEach(_0x2660ec => setStoryEpisodeSplitRunning(_0x3ffeb1, _0x2660ec, true));
    _0x3ffeb1.episodeBatchSplitOperation = _0x34d695;
    _0x3ffeb1.episodeBatchSplitStatus = _0x416c2d + " 1/" + _0x91b702.length;
    _0x3ffeb1.episodeBatchSplitCancelRequested = false;
    const _0x4d29b9 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x268268 = _0x4d29b9.data;
    const _0x88f28 = _0x2826d4("episode-splits", {
      operation: _0x34d695,
      total: _0x91b702.length,
      completed: 0,
      targetEpisodeIds: _0x13c5fb,
      pendingEpisodeIds: _0x13c5fb,
      cancelRequested: false,
      label: _0x3ffeb1.episodeBatchSplitStatus
    });
    _0x3ffeb1.episodeBatchSplitId = _0x88f28.id;
    _0xe5dd9c();
    try {
      const _0x399eb0 = await runStoryEpisodeSplitBatchQueue({
        targets: _0x91b702,
        batchId: _0x88f28.id,
        isLive: () => _0x2c064b(_0x4d29b9),
        isCancellationRequested: _0x252cfd.isRequested,
        resolveTarget: _0x48e39f => _0x268268.episodes.find(_0xd18d3d => normalizeText(_0xd18d3d?.id) === normalizeText(_0x48e39f?.id)),
        createMissingTargetError: _0x481a7d => new Error("第 " + (_0x481a7d?.number || "") + " 集不存在，无法拆分。"),
        runTarget: _0x55ed86 => experimental ? _0x2b612b(_0x55ed86, _0x4d29b9, {
          batch: _0x88f28,
          experimentalLabel: false
        }) : _0x58d6ab(_0x55ed86, _0x4d29b9, {
          batch: _0x88f28
        }),
        onTargetSettled: ({
          target: _0x312ba3,
          index: _0x278cf3,
          completed: _0xbd1c21,
          pendingTargets: _0x46918a
        }) => {
          const _0x215827 = normalizeText(_0x312ba3?.id);
          const _0x541893 = _0x416c2d + " " + (_0x278cf3 + 1) + "/" + _0x91b702.length;
          _0x18b12d(_0x4d29b9, _0x88f28, {
            completed: _0xbd1c21,
            pendingEpisodeIds: _0x46918a.map(_0x11ca93 => normalizeText(_0x11ca93?.id)).filter(Boolean),
            label: _0x541893
          });
          if (_0x59fa6e(_0x4d29b9)) {
            if (_0x215827) {
              setStoryEpisodeSplitRunning(_0x3ffeb1, _0x215827, false);
            }
            _0x3ffeb1.episodeBatchSplitStatus = _0x541893;
            _0xe5dd9c();
          }
          _0x3c4e04();
        }
      });
      if (_0x399eb0.status === "interrupted") {
        return false;
      }
      return finalizeStoryEpisodeSplitBatch({
        result: {
          ..._0x399eb0,
          pendingTargets: _0x399eb0.pendingTargets.map(_0x233130 => normalizeText(_0x233130?.id)).filter(Boolean)
        },
        batch: _0x88f28,
        projectToken: _0x4d29b9,
        experimental: experimental,
        selectionMode: selectionMode,
        syncBatch: _0x5b044f => _0x18b12d(_0x4d29b9, _0x88f28, _0x5b044f),
        persist: () => _0x3c4e04({
          immediate: true
        }),
        showToast: _0x1ce8f7,
        resolveErrorMessage: _0x186f5a => experimental ? resolveStoryEpisodeExperimentalErrorMessage(_0x186f5a, {
          retryActionLabel: "批量拆分"
        }) : normalizeText(_0x186f5a?.message) || "分镜拆分失败。",
        notifyFailure: (_0x4aff76, _0x3f613d) => _0x5c2bf9(_0x4aff76, _0x4d29b9, {
          step: 3
        }, _0x3f613d),
        notifySuccess: (_0x1c2056, _0x270ba6) => _0x2e1a77(_0x1c2056, _0x4d29b9, {
          step: 3
        }, _0x270ba6)
      });
    } finally {
      _0x252cfd.clear(_0x88f28.id);
      if (_0x59fa6e(_0x4d29b9)) {
        _0x13c5fb.forEach(_0x1d900d => setStoryEpisodeSplitRunning(_0x3ffeb1, _0x1d900d, false));
        resetStoryEpisodeSplitBatchState(_0x3ffeb1);
        _0xe5dd9c();
      }
    }
  }
  function _0x2144ad() {
    const _0x199501 = createStoryProjectTaskToken(_0x3ffeb1);
    return cancelStoryEpisodeSplitBatch({
      state: _0x3ffeb1,
      tasks: getStoryBackgroundTasks(_0x3ffeb1.data),
      isTaskActive: isStoryBackgroundTaskActive,
      requestCancellation: _0x252cfd.request,
      updateBatch: (_0x127456, _0x374931) => _0x38ed49(_0x199501, _0x127456, _0x374931),
      setEpisodeRunning: (_0x4cc0b7, _0xd4f32c) => setStoryEpisodeSplitRunning(_0x3ffeb1, _0x4cc0b7, _0xd4f32c),
      showToast: _0x1ce8f7,
      render: _0xe5dd9c
    });
  }
  async function _0x9077d3({
    selectionMode = false
  } = {}) {
    if (getStoryEpisodeBatchControlState(_0x3ffeb1).disabled) {
      return false;
    }
    if (shouldUseStoryEpisodeExperimentalSplit(_0x3ffeb1)) {
      return _0x1d834a({
        selectionMode: selectionMode
      });
    }
    return _0x1d834a({
      selectionMode: selectionMode,
      experimental: false
    });
  }
  function _0x18b8ec(_0x2f9b15, _0x1f6e6a, _0x481b72, _0x5b145c = _0x3ffeb1.data) {
    const _0x1bbf7b = _0x5b145c?.episodes?.find(_0x4feec7 => _0x4feec7.id === _0x2f9b15);
    const _0x3ecab8 = _0x1bbf7b?.clips?.findIndex(_0x1110ae => _0x1110ae.id === _0x1f6e6a) ?? -1;
    if (!_0x1bbf7b || _0x3ecab8 < 0 || !_0x481b72) {
      return false;
    }
    _0x1bbf7b.clips[_0x3ecab8] = _0x481b72;
    _0x1bbf7b.status = deriveStoryEpisodeStatus(_0x1bbf7b.clips);
    return true;
  }
  function _0x5cde65(_0x316f47, _0x50ec34, _0x54795c) {
    return [_0x316f47, _0x50ec34, _0x54795c].map(normalizeText).join(":");
  }
  function _0xf0cbf5(_0x4dac95, _0x5b0e2b, _0x162ea0, _0x1f186c, {
    batch = null
  } = {}) {
    const _0x596675 = _0x1f186c?.generation && typeof _0x1f186c.generation === "object" ? _0x1f186c.generation : {};
    const _0x2ac7b2 = normalizeText(_0x596675.status).toLowerCase();
    if (!_0x2ac7b2 || _0x2ac7b2 === "idle") {
      return null;
    }
    const _0x2199a2 = buildStoryBackgroundTaskId("clip-video", {
      episodeId: _0x5b0e2b,
      clipId: _0x162ea0
    });
    const _0x179424 = {
      type: "clip-video",
      scope: {
        episodeId: _0x5b0e2b,
        clipId: _0x162ea0
      },
      label: "生成片段视频",
      message: normalizeText(_0x596675.error) || "正在等待视频生成结果",
      status: _0x2ac7b2,
      resumable: Boolean(normalizeText(_0x596675.taskId)),
      remoteTaskId: _0x596675.taskId,
      modelId: _0x596675.modelId || _0x1f186c?.modelId,
      provider: _0x596675.provider || _0x1f186c?.provider,
      executionId: _0x596675.executionId
    };
    if (batch) {
      _0x179424.batch = batch;
    }
    const _0x386df0 = getStoryBackgroundTasks(_0x4dac95.data).find(_0x1b16f4 => _0x1b16f4.id === _0x2199a2);
    if (["pending", "queued", "recovering", "running", "submitting"].includes(_0x2ac7b2)) {
      if (_0x386df0) {
        return _0x1dc293(_0x4dac95, _0x2199a2, _0x179424);
      } else {
        return _0x4ba4d1(_0x4dac95, {
          id: _0x2199a2,
          ..._0x179424
        });
      }
    }
    if (!_0x386df0) {
      return null;
    }
    if (["success", "succeeded", "completed", "done"].includes(_0x2ac7b2)) {
      return _0x450b2c(_0x4dac95, _0x2199a2, {
        status: "succeeded",
        message: "片段视频生成完成"
      });
    }
    if (["cancelled", "canceled"].includes(_0x2ac7b2)) {
      return _0x450b2c(_0x4dac95, _0x2199a2, {
        status: "cancelled",
        message: "片段视频任务已取消"
      });
    }
    if (["failed", "error"].includes(_0x2ac7b2)) {
      return _0x450b2c(_0x4dac95, _0x2199a2, {
        status: "failed",
        message: "片段视频生成失败",
        error: _0x596675.error || "片段视频生成失败。"
      });
    }
    return null;
  }
  function _0x1f6e4b(_0x360565, _0x2a993c, _0x205f20, _0x3486c8 = null, _0xce0921 = null) {
    const _0xa38509 = _0x360565.data;
    return createStoryClipGenerationController({
      getClip: () => {
        const _0x28fcc1 = _0xa38509?.episodes?.find(_0x29788f => _0x29788f.id === _0x2a993c);
        return _0x28fcc1?.clips?.find(_0x3c4eb1 => _0x3c4eb1.id === _0x205f20) || _0x3486c8;
      },
      updateClip: _0x371490 => {
        if (!_0x2c064b(_0x360565)) {
          return;
        }
        _0x18b8ec(_0x2a993c, _0x205f20, _0x371490, _0xa38509);
        _0xf0cbf5(_0x360565, _0x2a993c, _0x205f20, _0x371490, {
          batch: _0xce0921
        });
        _0x39491b(_0x360565);
        _0x3c4e04({
          immediate: true
        });
        if (!_0x59fa6e(_0x360565)) {
          return;
        }
        _0x14d6f1(_0xa38509);
        if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 3) {
          _0x51af77(_0x2a993c);
          return;
        }
        if (_0x3ffeb1.view === "episode" && normalizeText(_0x3ffeb1.selectedEpisodeId) === normalizeText(_0x2a993c) && _0x3ffeb1.selectedClipId === _0x205f20) {
          if (!_0x1cc89c()) {
            _0xe5dd9c();
          }
        }
      }
    });
  }
  async function _0x3782d1(_0x1f0f8f, _0x47b9e1 = 15000) {
    const _0x1ebf48 = Date.now();
    while (!_0x1de79f) {
      const _0x158726 = resolveModelExecution(_0x1f0f8f.modelId, {
        providerHint: _0x1f0f8f.provider
      });
      if (_0x158726?.modelManifest && _0x158726?.executionManifest) {
        return true;
      }
      if (Date.now() - _0x1ebf48 >= _0x47b9e1) {
        return false;
      }
      await new Promise(_0x4b70ea => windowObject.setTimeout(_0x4b70ea, 250));
    }
    return false;
  }
  async function _0x872ef8({
    episodeId: _0x244b84,
    clipId: _0xab49ac,
    recovery: _0x20eb52,
    projectToken = createStoryProjectTaskToken(_0x3ffeb1)
  }) {
    _0x1b50be(projectToken);
    const _0x1ff184 = _0x5cde65(projectToken.projectId, _0x244b84, _0xab49ac);
    if (_0x1da07b.has(_0x1ff184) || _0x1de79f) {
      return false;
    }
    const _0x365088 = await _0x3782d1(_0x20eb52);
    if (!_0x2c064b(projectToken) || _0x1da07b.has(_0x1ff184)) {
      return false;
    }
    if (!_0x365088) {
      const _0x41fd9b = projectToken.data?.episodes?.find(_0x4312d3 => _0x4312d3.id === _0x244b84);
      const _0x523cd1 = _0x41fd9b?.clips?.find(_0x29d468 => _0x29d468.id === _0xab49ac);
      if (_0x523cd1) {
        const _0x29f090 = {
          ..._0x523cd1,
          generation: {
            ..._0x523cd1.generation,
            status: "failed",
            error: "视频模型缺少 manifest 或 execution manifest：" + _0x20eb52.modelId
          }
        };
        _0x18b8ec(_0x244b84, _0xab49ac, _0x29f090, projectToken.data);
        _0xf0cbf5(projectToken, _0x244b84, _0xab49ac, _0x29f090);
        _0x3c4e04({
          immediate: true
        });
        if (_0x59fa6e(projectToken)) {
          _0x14d6f1(projectToken.data);
          if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 3) {
            _0x51af77(_0x244b84);
          } else if (_0x3ffeb1.view === "episode" && normalizeText(_0x3ffeb1.selectedEpisodeId) === normalizeText(_0x244b84)) {
            _0xe5dd9c();
          }
        }
      }
      return false;
    }
    const _0x4e1dc4 = projectToken.data?.episodes?.find(_0x3fdf3b => _0x3fdf3b.id === _0x244b84);
    const _0x408a8d = _0x4e1dc4?.clips?.find(_0x2de8e8 => _0x2de8e8.id === _0xab49ac);
    if (!_0x408a8d || !getRecoverableStoryClipVideoTask(_0x408a8d)) {
      return false;
    }
    const _0x3189e9 = _0x1f6e4b(projectToken, _0x244b84, _0xab49ac, _0x408a8d);
    _0x1da07b.set(_0x1ff184, _0x3189e9);
    try {
      const _0x203894 = await _0x3189e9.resume({
        projectId: projectToken.projectId,
        episodeId: _0x244b84,
        taskId: _0x20eb52.taskId,
        modelId: _0x20eb52.modelId,
        provider: _0x20eb52.provider,
        providerProfileId: _0x20eb52.providerProfileId,
        executionId: _0x20eb52.executionId,
        startedAt: _0x20eb52.startedAt
      });
      if (!_0x2c064b(projectToken)) {
        return false;
      }
      if (_0x203894?.status === "success") {
        _0xf62208("片段视频任务已恢复并生成完成。", "success", projectToken, {
          episodeId: _0x244b84,
          clipId: _0xab49ac
        });
      }
      _0x3c4e04({
        immediate: true
      });
      return _0x203894?.status === "success" || _0x203894?.status === "pending";
    } catch (_0x4cd58f) {
      if (!_0x2c064b(projectToken)) {
        return false;
      }
      const _0x1e7fd2 = projectToken.data?.episodes?.find(_0x1479a2 => _0x1479a2.id === _0x244b84);
      const _0x5de701 = _0x1e7fd2?.clips?.find(_0x23fd06 => _0x23fd06.id === _0xab49ac);
      if (_0x5de701) {
        const _0xfee2be = {
          ..._0x5de701,
          generation: {
            ..._0x5de701.generation,
            status: "failed",
            error: _0x4cd58f?.message || "片段视频任务恢复失败。"
          }
        };
        _0x18b8ec(_0x244b84, _0xab49ac, _0xfee2be, projectToken.data);
        _0xf0cbf5(projectToken, _0x244b84, _0xab49ac, _0xfee2be);
        _0x3c4e04({
          immediate: true
        });
      }
      _0x847d75(_0x4cd58f?.message || "片段视频任务恢复失败。", "error", {
        episodeId: _0x244b84,
        clipId: _0xab49ac,
        taskId: _0x20eb52.taskId,
        error: _0x4cd58f
      });
      return false;
    } finally {
      if (_0x1da07b.get(_0x1ff184) === _0x3189e9) {
        _0x1da07b.delete(_0x1ff184);
      }
      if (_0x59fa6e(projectToken)) {
        _0x14d6f1(projectToken.data);
        if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 3) {
          _0x51af77(_0x244b84);
        } else if (_0x3ffeb1.view === "episode" && normalizeText(_0x3ffeb1.selectedEpisodeId) === normalizeText(_0x244b84)) {
          _0xe5dd9c();
        }
      }
    }
  }
  function _0x8e94a4(_0x468cd2 = _0x3ffeb1.data) {
    const _0x3b1545 = _0x2e0a71(_0x468cd2);
    const _0x186bcb = [];
    for (const _0x5e125e of _0x468cd2?.episodes || []) {
      for (const _0x835bd7 of _0x5e125e?.clips || []) {
        const _0x5ce616 = getRecoverableStoryClipVideoTask(_0x835bd7);
        if (!_0x5ce616) {
          continue;
        }
        _0x186bcb.push({
          episodeId: _0x5e125e.id,
          clipId: _0x835bd7.id,
          recovery: _0x5ce616
        });
      }
    }
    _0x186bcb.forEach(_0x5da91e => {
      _0x872ef8({
        ..._0x5da91e,
        projectToken: _0x3b1545
      });
    });
    return _0x186bcb.length;
  }
  function _0x764f47(_0x5c6f72) {
    const _0x47593c = normalizeText(_0x5c6f72?.id);
    if (!_0x47593c) {
      return false;
    }
    const _0x4b764b = formatStoryClipVideoGenerationDuration(_0x5c6f72, _0x3ffeb1.models.video, _0x3ffeb1.videoGenerationParams);
    let _0x57e581 = false;
    _0x3b5272.querySelectorAll("[data-story-clip-duration]").forEach(_0x352057 => {
      if (normalizeText(_0x352057.dataset?.storyClipDuration) !== _0x47593c) {
        return;
      }
      if (_0x352057.textContent !== _0x4b764b) {
        _0x352057.textContent = _0x4b764b;
      }
      _0x57e581 = true;
    });
    return _0x57e581;
  }
  function _0x1bbd64(_0x40d2d3) {
    _0x3ffeb1.videoGenerationParams = normalizeStoryVideoGenerationParams(_0x3ffeb1.models.video, seedStoryAspectRatioInVideoGenerationParams(_0x3ffeb1.models.video, _0x3ffeb1.videoGenerationParams, _0x3ffeb1.data.project?.aspectRatio));
    _0x3ffeb1.videoGenerationParamsByModel = {
      ..._0x3ffeb1.videoGenerationParamsByModel,
      [_0x3ffeb1.models.video]: {
        ..._0x3ffeb1.videoGenerationParams
      }
    };
    return Boolean(_0x40d2d3);
  }
  function _0x2d0dd3(_0x229d7e, {
    episode = null,
    enteringEpisode = false,
    switchingEpisode = false
  } = {}) {
    const _0x37b31c = (enteringEpisode || switchingEpisode) && applyStoryEpisodeVideoModelDefault(_0x3ffeb1, episode);
    const _0x2ff708 = recoverUnavailableStoryVideoModelState(_0x3ffeb1, {
      clip: _0x229d7e
    });
    _0x1bbd64(_0x229d7e);
    if (_0x37b31c || _0x2ff708) {
      _0x4a6311();
    }
    return _0x37b31c || _0x2ff708;
  }
  function _0x4a6311() {
    const _0x1fd6d9 = getSelectedEpisode(_0x3ffeb1);
    const _0xf28418 = getSelectedClip(_0x3ffeb1, _0x1fd6d9);
    if (!_0x1fd6d9 || !_0xf28418) {
      return false;
    }
    try {
      const _0x2bd145 = buildStoryClipInputSlotViewModel({
        modelId: _0x3ffeb1.models.video,
        provider: _0x3ffeb1.videoProvider,
        inputs: _0xf28418.inputs
      });
      const _0xb53d44 = {
        image: [],
        video: [],
        audio: []
      };
      _0x2bd145.groups.forEach(_0xc91818 => {
        _0xb53d44[_0xc91818.kind] = _0xc91818.slots.filter(_0x457d39 => _0x457d39.input?.url).map(_0x40edea => ({
          ..._0x40edea.input,
          slotId: _0x40edea.id
        }));
      });
      return _0x18b8ec(_0x1fd6d9.id, _0xf28418.id, {
        ..._0xf28418,
        inputs: _0xb53d44
      });
    } catch {
      return false;
    }
  }
  function _0x36b21d({
    kind: _0x15e4e6,
    slotId: _0x1de9db,
    value: _0x301b6a
  }) {
    const _0x36ff41 = getSelectedEpisode(_0x3ffeb1);
    const _0x515809 = getSelectedClip(_0x3ffeb1, _0x36ff41);
    if (!_0x36ff41 || !_0x515809) {
      return false;
    }
    const _0xf6099b = updateStoryClipInput(_0x515809, {
      kind: _0x15e4e6,
      slotId: _0x1de9db,
      value: _0x301b6a
    });
    _0x18b8ec(_0x36ff41.id, _0x515809.id, _0xf6099b);
    _0x3c4e04({
      immediate: true
    });
    _0xe5dd9c();
    return true;
  }
  async function _0x1dd9a1(_0x35be43) {
    const _0x387b98 = _0x566b13 || _0x3ffeb1.pendingClipInput;
    _0x566b13 = null;
    _0x3ffeb1.pendingClipInput = null;
    if (!_0x35be43 || !_0x387b98) {
      return false;
    }
    const _0x7bd5a6 = _0x387b98.projectToken || createStoryProjectTaskToken(_0x3ffeb1);
    const _0x42fd81 = _0x7bd5a6.data?.episodes?.find(_0xfae625 => normalizeText(_0xfae625?.id) === normalizeText(_0x387b98.episodeId)) || (_0x59fa6e(_0x7bd5a6) ? getSelectedEpisode(_0x3ffeb1) : null);
    const _0x22acac = _0x42fd81?.clips?.find(_0x173f0b => normalizeText(_0x173f0b?.id) === normalizeText(_0x387b98.clipId)) || (_0x59fa6e(_0x7bd5a6) ? getSelectedClip(_0x3ffeb1, _0x42fd81) : null);
    try {
      const _0x2ad384 = String(_0x35be43.type || "").startsWith("image/") ? "image" : String(_0x35be43.type || "").startsWith("video/") ? "video" : String(_0x35be43.type || "").startsWith("audio/") ? "audio" : "";
      const _0x14e661 = _0x387b98.kind || _0x2ad384;
      if (!_0x14e661 || _0x387b98.kind && _0x2ad384 && _0x387b98.kind !== _0x2ad384) {
        throw new Error("所选文件类型与当前视频模型入参槽不匹配");
      }
      if (!_0x42fd81 || !_0x22acac) {
        throw new Error("当前片段不可用");
      }
      const _0x544b93 = buildStoryClipInputSlotViewModel({
        modelId: _0x7bd5a6.modelSettings.models.video,
        provider: _0x7bd5a6.modelSettings.videoProvider,
        inputs: _0x22acac?.inputs
      });
      const _0x1c7a2a = _0x387b98.slotId ? _0x544b93.slots.find(_0x1827dd => _0x1827dd.id === _0x387b98.slotId && _0x1827dd.kind === _0x14e661) : _0x544b93.slots.find(_0x48fb0d => _0x48fb0d.kind === _0x14e661 && !_0x48fb0d.input?.url);
      if (!_0x1c7a2a) {
        throw new Error("当前视频模型没有可用的对应入参槽");
      }
      const _0x194edd = await uploadFile(_0x35be43, _0x7bd5a6.projectId);
      if (!_0x2c064b(_0x7bd5a6)) {
        return false;
      }
      const _0x43191e = normalizeText(_0x194edd?.displayUrl || _0x194edd?.url || _0x194edd?.originalUrl || _0x194edd?.localUrl);
      if (!_0x43191e) {
        throw new Error("素材保存结果缺少可用地址");
      }
      const _0x14e124 = updateStoryClipInput(_0x22acac, {
        kind: _0x14e661,
        slotId: _0x1c7a2a.id,
        value: {
          url: _0x43191e,
          name: _0x35be43.name,
          mimeType: _0x35be43.type
        }
      });
      _0x18b8ec(_0x42fd81.id, _0x22acac.id, _0x14e124, _0x7bd5a6.data);
      _0x39491b(_0x7bd5a6);
      _0x3c4e04({
        immediate: true
      });
      if (_0x59fa6e(_0x7bd5a6)) {
        _0xe5dd9c();
        _0x1ce8f7((_0x14e661 === "image" ? "图片" : _0x14e661 === "audio" ? "音频" : "视频") + "入参已接入。", "success");
      }
      return true;
    } catch (_0x1e36e4) {
      if (_0x59fa6e(_0x7bd5a6)) {
        _0x1ce8f7(_0x1e36e4?.message || "片段入参上传失败。", "error");
      }
      return false;
    }
  }
  function _0x3d2e96(_0xf2e9b3 = {}) {
    if (_0xf2e9b3.type === "selection-missing") {
      _0x1ce8f7("请先选择要生成的片段。", "warn");
      return true;
    }
    if (_0xf2e9b3.type === "empty-prompt") {
      _0x1ce8f7("请先填写视频提示词。", "warn");
      return true;
    }
    if (_0xf2e9b3.type === "provider-error") {
      return _0x500b30(_0xf2e9b3.error, {
        providerId: _0xf2e9b3.provider,
        model: _0xf2e9b3.modelId
      });
    }
    if (_0xf2e9b3.type === "single-failed") {
      const _0x246813 = _0x500b30(_0xf2e9b3.error, {
        providerId: _0xf2e9b3.provider,
        model: _0xf2e9b3.modelId
      });
      if (!_0x246813) {
        _0x847d75(_0xf2e9b3.error?.getUserMessage?.() || _0xf2e9b3.error?.message || "片段视频生成失败。", "error", _0xf2e9b3.error);
      }
      return true;
    }
    if (_0xf2e9b3.type === "single-complete") {
      if (_0xf2e9b3.result?.status === "success" || _0xf2e9b3.result?.ok === true) {
        _0xf62208("片段视频生成完成。", "success", _0xf2e9b3.projectToken, {
          episodeId: _0xf2e9b3.episodeId,
          clipId: _0xf2e9b3.clipId
        });
      }
      return true;
    }
    if (_0xf2e9b3.type === "batch-complete") {
      if (_0xf2e9b3.cancelRequested) {
        _0xf62208("批量生成已停止：完成 " + _0xf2e9b3.succeeded + " 个，失败 " + _0xf2e9b3.failed + " 个，停止 " + _0xf2e9b3.cancelled + " 个。", _0xf2e9b3.failed ? "warn" : "info", _0xf2e9b3.projectToken, {
          episodeId: _0xf2e9b3.episodeId,
          clipId: _0xf2e9b3.clipId
        });
        return true;
      }
      const _0x4f371d = _0xf2e9b3.firstFailure?.reason === "empty-prompt" ? "部分片段缺少视频提示词。" : _0xf2e9b3.firstFailure?.error?.getUserMessage?.() || _0xf2e9b3.firstFailure?.error?.message || "部分片段生成失败。";
      _0x5c2bf9(_0xf2e9b3.failed ? "完成 " + _0xf2e9b3.succeeded + " 个，失败 " + _0xf2e9b3.failed + " 个。" + _0x4f371d : "已完成 " + _0xf2e9b3.succeeded + " 个片段视频。", _0xf2e9b3.projectToken, {
        episodeId: _0xf2e9b3.episodeId,
        clipId: _0xf2e9b3.clipId
      }, {
        tone: _0xf2e9b3.failed ? "warn" : "success",
        details: _0xf2e9b3.firstFailure?.error || _0xf2e9b3.firstFailure,
        showResultToast: _0xf2e9b3.suppressToast !== true
      });
      return true;
    }
    return false;
  }
  const _0x23a488 = storyClipProduction.createRuntime({
    state: _0x3ffeb1,
    projectAdapter: {
      createToken: () => createStoryProjectTaskToken(_0x3ffeb1),
      isLive: _0x2c064b,
      isCurrent: _0x59fa6e,
      register: _0x1b50be,
      createBatch: _0x2826d4,
      syncBatch: _0x18b12d
    },
    generationAdapter: {
      controllers: _0x1da07b,
      resolvePrompt: ({
        episode: _0x23d280,
        clip: _0x569d89,
        displayedClip: _0x10ac09,
        projectToken: _0x367b1c
      }) => {
        const _0x20d9d2 = normalizeText(_0x569d89?.id) === normalizeText(_0x10ac09?.id) ? _0x3b5272.querySelector("[data-story-clip-prompt]") : null;
        return _0x2a6076(_0x23d280, _0x569d89, _0x20d9d2, _0x367b1c.data);
      },
      resolveSettings: ({
        clip: _0x28ac20,
        projectToken: _0x28474d
      }) => resolveStoryClipVideoGenerationSettings(_0x28ac20, _0x28474d, {
        fallbackModelId: _0x3ffeb1.models.video,
        fallbackProvider: _0x3ffeb1.videoProvider
      }),
      resolveInstallId: async () => {
        let _0x9cfef2 = normalizeText(windowObject?.__aicInstallId || globalThis.__aicInstallId);
        if (typeof windowObject?.ensureSubscriptionInstallId === "function") {
          try {
            _0x9cfef2 = normalizeText(await windowObject.ensureSubscriptionInstallId()) || _0x9cfef2;
          } catch {}
        }
        return _0x9cfef2;
      },
      createController: ({
        episode: _0x2e8659,
        clip: _0x2a33cc,
        projectToken: _0x4e1ec6,
        batch: _0x169565
      }) => _0x1f6e4b(_0x4e1ec6, _0x2e8659.id, _0x2a33cc.id, _0x2a33cc, _0x169565)
    },
    projectionAdapter: {
      render: _0xe5dd9c,
      refreshGeneration: _0x1cc89c,
      persist: ({
        immediate = false
      } = {}) => {
        if (immediate) {
          return _0x434b0f();
        }
        _0x3c4e04();
        return Promise.resolve(true);
      },
      present: _0x3d2e96
    }
  });
  async function _0x4d48c1() {
    return _0x23a488.generateSelection();
  }
  function _0x2a6076(_0x5b6493, _0x581f8b, _0x11cfaa = null, _0x2ddd50 = _0x3ffeb1.data) {
    const _0xce1641 = _0x11cfaa || documentObject.createElement("div");
    if (!_0x11cfaa) {
      _0xce1641.innerHTML = renderStoryClipPromptMentions(_0x581f8b?.prompt || "", {
        assets: _0x2ddd50.assets,
        episode: _0x5b6493,
        clipFrames: _0x2ddd50.clipFrames
      });
    }
    const _0x9d883e = [];
    const _0x53dc3c = resolveStoryVideoReplicationClipVoiceAssetIds(_0x2ddd50, _0x581f8b);
    const _0x16cf96 = _0x53dc3c == null ? null : new Set(_0x53dc3c);
    const _0x47fa68 = _0x530405 => {
      if (_0x16cf96 && !_0x16cf96.has(_0x530405)) {
        return false;
      }
      return getStoryEpisodeCharacterVoiceEnabled(_0x5b6493, _0x530405);
    };
    const _0x34b929 = resolvePromptTextWithTextRefs({
      promptEl: _0xce1641,
      assetInputRefs: _0x9d883e,
      assetMediaCounts: {
        image: 0,
        video: 0,
        audio: 0
      },
      allowedAssetTypes: ["text", "image", "video", "audio"],
      resolveAssetMentionRef: _0x12d74e => resolveStoryClipAssetMentionRefs(_0x12d74e, _0x2ddd50.assets, {
        voiceEnabled: _0x47fa68(getStoryAssetIdFromMentionNodeId(_0x12d74e.dataset?.assetId)),
        clipFrames: _0x2ddd50.clipFrames,
        resolveExternalAssetRef: resolveAssetMentionRef
      }),
      dedupeAssetMentions: true
    });
    const _0x213b7c = _0x2ddd50.project?.sourceMode === "video-replication" ? applyStoryClipDialogueVoiceGuidance(_0x34b929, _0x581f8b, _0x2ddd50.assets) : _0x34b929;
    const _0x36c9d0 = _0x581f8b?.promptMode || _0x5b6493?.promptMode || _0x2ddd50.project?.planning?.promptMode;
    if (isStoryMinimaxH3PromptMode(_0x36c9d0) && !_0x9d883e.some(_0x4894ad => ["image", "video"].includes(_0x4894ad?.type))) {
      for (let _0x4664b3 = _0x9d883e.length - 1; _0x4664b3 >= 0; _0x4664b3 -= 1) {
        if (_0x9d883e[_0x4664b3]?.type === "audio") {
          _0x9d883e.splice(_0x4664b3, 1);
        }
      }
    }
    return {
      prompt: serializeStoryPromptForMode(_0x213b7c, _0x36c9d0),
      assetInputRefs: _0x9d883e
    };
  }
  async function _0x198d9b() {
    const _0x3c5cd4 = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x44afd8 = getSelectedEpisode({
      ..._0x3ffeb1,
      data: _0x3c5cd4.data
    });
    if (!_0x44afd8) {
      return false;
    }
    const _0x443a31 = _0x1f1468.get(_0x3c5cd4.projectId);
    if (_0x443a31?.promise) {
      return _0x443a31.promise;
    }
    if (typeof createEpisodeCanvas !== "function") {
      _0x1ce8f7("项目关联画布服务尚未初始化。", "error");
      return false;
    }
    _0x4e3659({
      pending: true,
      scope: "episode",
      captureFocus: true
    });
    const _0x1906f6 = (async () => {
      try {
        const _0x1fd363 = await createEpisodeCanvas({
          project: _0x3c5cd4.data.project,
          episode: _0x44afd8,
          modelId: _0x3c5cd4.modelSettings.models.video,
          provider: _0x3c5cd4.modelSettings.videoProvider,
          generationParams: _0x3c5cd4.modelSettings.videoGenerationParams,
          resolveClipGenerationSettings: _0x41cc79 => resolveStoryClipVideoGenerationSettings(_0x41cc79, _0x3c5cd4, {
            fallbackModelId: _0x3ffeb1.models.video,
            fallbackProvider: _0x3ffeb1.videoProvider
          })
        });
        if (!_0x2c064b(_0x3c5cd4)) {
          return false;
        }
        _0x3c5cd4.data.project.canvasBinding = {
          ...(_0x1fd363.binding || _0x1fd363.canvasBinding || {}),
          canvasId: _0x1fd363.binding?.canvasId || _0x1fd363.canvasBinding?.canvasId || _0x1fd363.canvasId,
          nodes: {
            ...(_0x1fd363.binding?.nodes || _0x1fd363.canvasBinding?.nodes || {})
          },
          ...(_0x1fd363.binding?.layout || _0x1fd363.canvasBinding?.layout ? {
            layout: {
              ...(_0x1fd363.binding?.layout || _0x1fd363.canvasBinding?.layout || {})
            }
          } : {})
        };
        _0xa86e33({
          canvasId: _0x1fd363.canvasId,
          nodes: Array.isArray(_0x1fd363.nodes) ? _0x1fd363.nodes : []
        });
        _0x39491b(_0x3c5cd4);
        _0x3c4e04({
          immediate: true
        });
        const _0xd9ec1e = await _0x50e0b5(_0x3c5cd4, {
          episodeId: _0x44afd8.id
        });
        if (!_0xd9ec1e) {
          return false;
        }
        _0x39491b(_0x3c5cd4);
        _0x3c4e04({
          immediate: true
        });
        if (_0x59fa6e(_0x3c5cd4)) {
          requestWorkspaceMode("canvas");
        }
        if (_0x59fa6e(_0x3c5cd4)) {
          _0x1ce8f7(_0x1fd363.reused ? "已同步本集到项目关联画布。" : "已创建项目关联画布并同步本集。", "success");
        }
        return true;
      } catch (_0x1ef451) {
        if (_0x59fa6e(_0x3c5cd4)) {
          _0x1ce8f7(_0x1ef451?.message || "分集加入画布失败。", "error");
        }
        return false;
      }
    })();
    _0x1f1468.set(_0x3c5cd4.projectId, {
      scope: "episode",
      promise: _0x1906f6
    });
    _0x1906f6.finally(() => {
      if (_0x1f1468.get(_0x3c5cd4.projectId)?.promise === _0x1906f6) {
        _0x1f1468.delete(_0x3c5cd4.projectId);
        _0x4e3659({
          pending: false
        });
      }
    });
    return _0x1906f6;
  }
  async function _0x46e662(_0xf3b3ff, _0x4188eb = null) {
    const _0x2196d7 = getSelectedEpisode(_0x3ffeb1);
    const _0x18feb4 = getSelectedClip(_0x3ffeb1, _0x2196d7);
    if (!_0x2196d7 || _0xf3b3ff === "current" && !_0x18feb4) {
      _0x1ce8f7("请先选择要导出的片段。", "warn");
      return false;
    }
    const _0x3543e3 = _0x4188eb?.disabled === true;
    if (_0x4188eb && "disabled" in _0x4188eb) {
      _0x4188eb.disabled = true;
    }
    syncStoryAsyncButton(_0x4188eb, true);
    try {
      const _0x49ba1b = await exportStoryClipVideos({
        project: _0x3ffeb1.data.project,
        episode: _0x2196d7,
        clip: _0x18feb4,
        mode: _0xf3b3ff
      });
      if (_0x49ba1b?.canceled) {
        return false;
      }
      if (!_0x49ba1b?.success) {
        throw new Error(_0x49ba1b?.error || _0x49ba1b?.message || "视频片段导出失败。");
      }
      const _0xafa27d = Math.max(0, Number(_0x49ba1b.exportedCount) || 0);
      const _0x14abde = Math.max(0, Number(_0x49ba1b.skippedCount) || 0);
      _0x1ce8f7(_0x14abde ? "已导出 " + _0xafa27d + " 个片段，跳过 " + _0x14abde + " 个无可用视频的片段。" : _0xf3b3ff === "current" ? "当前片段已导出。" : "已导出本集 " + _0xafa27d + " 个片段。", "success");
      return true;
    } catch (_0x31533e) {
      _0x1ce8f7(_0x31533e?.message || "视频片段导出失败。", "error");
      return false;
    } finally {
      syncStoryAsyncButton(_0x4188eb, false);
      if (_0x4188eb && "disabled" in _0x4188eb) {
        _0x4188eb.disabled = _0x3543e3;
      }
    }
  }
  async function _0x1200d7() {
    const _0x57d1ff = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x4bb74d = getStoryProjectCanvasEpisodes(_0x57d1ff.data.episodes, _0x3ffeb1.selectedEpisodeId);
    const _0x13d867 = _0x4bb74d[0];
    if (!_0x13d867) {
      return false;
    }
    const _0x9300ae = _0x1f1468.get(_0x57d1ff.projectId);
    if (_0x9300ae?.promise) {
      return _0x9300ae.promise;
    }
    if (typeof createProjectCanvas !== "function") {
      _0x1ce8f7("项目画布服务尚未初始化。", "error");
      return false;
    }
    _0x4e3659({
      pending: true,
      scope: "project",
      captureFocus: true
    });
    const _0x4d76c6 = (async () => {
      try {
        const _0x359b30 = await createProjectCanvas({
          project: _0x57d1ff.data.project,
          assets: _0x57d1ff.data.assets,
          episodes: _0x4bb74d,
          imageModelId: _0x57d1ff.modelSettings.models.image,
          imageProvider: _0x57d1ff.modelSettings.imageProvider,
          imageGenerationParams: _0x57d1ff.modelSettings.imageGenerationParams,
          videoModelId: _0x57d1ff.modelSettings.models.video,
          videoProvider: _0x57d1ff.modelSettings.videoProvider,
          videoGenerationParams: _0x57d1ff.modelSettings.videoGenerationParams
        });
        if (!_0x2c064b(_0x57d1ff)) {
          return false;
        }
        _0x57d1ff.data.project.canvasBinding = {
          ...(_0x359b30.binding || _0x359b30.canvasBinding || {}),
          canvasId: _0x359b30.binding?.canvasId || _0x359b30.canvasBinding?.canvasId || _0x359b30.canvasId,
          nodes: {
            ...(_0x359b30.binding?.nodes || _0x359b30.canvasBinding?.nodes || {})
          },
          ...(_0x359b30.binding?.layout || _0x359b30.canvasBinding?.layout ? {
            layout: {
              ...(_0x359b30.binding?.layout || _0x359b30.canvasBinding?.layout || {})
            }
          } : {})
        };
        _0xa86e33({
          canvasId: _0x359b30.canvasId,
          nodes: Array.isArray(_0x359b30.nodes) ? _0x359b30.nodes.map(_0x3d0295 => _0x3d0295?.node).filter(Boolean) : []
        });
        _0x39491b(_0x57d1ff);
        _0x3c4e04({
          immediate: true
        });
        const _0x29424a = await _0x50e0b5(_0x57d1ff, {
          episodeId: _0x13d867.id
        });
        if (!_0x29424a) {
          return false;
        }
        _0x39491b(_0x57d1ff);
        _0x3c4e04({
          immediate: true
        });
        if (_0x59fa6e(_0x57d1ff)) {
          requestWorkspaceMode("canvas");
        }
        if (_0x59fa6e(_0x57d1ff)) {
          _0x1ce8f7(_0x359b30.reused ? "项目画布已同步：更新 " + (_0x359b30.updatedCount || 0) + " 项，新增 " + (_0x359b30.createdCount || 0) + " 项。" : "已创建项目画布，加入 " + (_0x359b30.createdCount || 0) + " 项内容。", "success");
        }
        return true;
      } catch (_0xa1e1df) {
        if (_0x59fa6e(_0x57d1ff)) {
          _0x1ce8f7(_0xa1e1df?.message || "项目同步到画布失败。", "error");
        }
        return false;
      }
    })();
    _0x1f1468.set(_0x57d1ff.projectId, {
      scope: "project",
      promise: _0x4d76c6
    });
    _0x4d76c6.finally(() => {
      if (_0x1f1468.get(_0x57d1ff.projectId)?.promise === _0x4d76c6) {
        _0x1f1468.delete(_0x57d1ff.projectId);
        _0x4e3659({
          pending: false
        });
      }
    });
    return _0x4d76c6;
  }
  function _0x34b773(_0x56db74, _0x5777af, _0x222034 = {}) {
    const _0x3c33d0 = normalizeText(_0x222034.modelId) || _0x3ffeb1.models.image;
    const _0x539496 = normalizeText(_0x222034.provider) || _0x3ffeb1.imageProvider;
    const _0x486ba2 = _0x222034.generationParams && typeof _0x222034.generationParams === "object" ? _0x222034.generationParams : _0x3ffeb1.imageGenerationParams;
    const _0x33a257 = normalizeText(_0x222034.promptPresetId) || _0x3ffeb1.assetPromptPresetId;
    const _0x365202 = normalizeText(_0x222034.scenePromptPresetId) || _0x3ffeb1.sceneAssetPromptPresetId;
    const _0x9b7a38 = _0x56db74.kind === "character" ? applyStoryCharacterAssetPromptPreset(_0x33a257, _0x5777af.prompt) : _0x56db74.kind === "scene" ? applyStorySceneAssetPromptPreset(_0x365202, _0x5777af.prompt) : _0x5777af.prompt;
    const _0x3b7222 = Boolean(normalizeText(_0x5777af.referenceImageUrl));
    const _0x1b9e05 = buildStoryAssetGenerationPayload({
      asset: {
        ..._0x5777af,
        prompt: _0x9b7a38
      },
      modelId: _0x3c33d0,
      provider: _0x539496,
      generationParams: _0x486ba2,
      referenceImageUrls: getStoryAssetAppearanceReferenceUrls(_0x56db74, _0x5777af),
      mapReferenceImageToImage2: _0x3b7222
    });
    return {
      payload: _0x1b9e05,
      execution: resolveModelExecution(_0x1b9e05.model, {
        providerHint: _0x1b9e05.provider
      })
    };
  }
  function _0x36e520(_0x9ff30a, _0x564fc6, _0x181d7b) {
    const _0x972f4f = normalizeImageGenerationResult(_0x181d7b);
    const _0x29098e = getSuccessfulImageGenerationItems(_0x972f4f)[0];
    const _0x19f989 = normalizeText(_0x29098e?.imageUrl || _0x29098e?.url || _0x29098e?.sourceUrl || _0x29098e?.thumbUrl);
    if (!_0x19f989) {
      throw new Error(getImageGenerationResultError(_0x972f4f) || "图像生成结果缺少可用图片");
    }
    _0x564fc6.imageUrl = _0x19f989;
    _0x564fc6.generatedImage = {
      ..._0x29098e
    };
    _0x564fc6.error = "";
    ensureStoryAssetBaseAppearance(_0x9ff30a);
    return _0x29098e;
  }
  function _0x2e51ed(_0x5cdc33 = {}) {
    const _0x515b2b = _0x5cdc33.execution?.modelManifest;
    const _0x107c5f = _0x5cdc33.execution?.executionManifest;
    return Boolean(_0x107c5f?.adapterType === "workflow" || _0x515b2b?.async === true || _0x107c5f?.extensions?.taskPolling);
  }
  async function _0x75622e(_0x271b21, _0xe0e32a, _0xd2bbaf = {}) {
    const _0x216729 = _0x34b773(_0x271b21, _0xe0e32a, _0xd2bbaf);
    const _0x8cce2e = _0xd2bbaf.projectToken || createStoryProjectTaskToken(_0x3ffeb1);
    const _0x525e69 = buildStoryBackgroundTaskId("asset-image", {
      assetId: _0x271b21?.id,
      appearanceId: _0xe0e32a?.id
    });
    _0x4ba4d1(_0x8cce2e, {
      id: _0x525e69,
      type: "asset-image",
      scope: {
        assetId: _0x271b21?.id,
        appearanceId: _0xe0e32a?.id
      },
      label: "生成" + (normalizeText(_0x271b21?.name) || "素材") + "形象",
      message: "正在等待图片生成结果",
      modelId: _0x216729.payload?.model,
      provider: _0x216729.payload?.provider,
      executionId: _0x216729.execution?.executionManifest?.id,
      resumePayload: sanitizeStoryTaskResumePayload(_0x216729.payload),
      batch: _0xd2bbaf.batch
    });
    try {
      const _0x37a050 = _0x1293d6 => {
        const _0x1ca8b9 = normalizeText(_0x1293d6);
        if (!_0x1ca8b9 || !_0x2c064b(_0x8cce2e)) {
          return;
        }
        _0x1dc293(_0x8cce2e, _0x525e69, {
          status: "running",
          message: "图片任务已提交，正在等待结果",
          resumable: _0x2e51ed(_0x216729),
          remoteTaskId: _0x1ca8b9,
          resumePayload: sanitizeStoryTaskResumePayload(_0x216729.payload)
        });
      };
      const _0x2a58c4 = await generateAssetImage(_0x216729.payload, {
        onTaskId: _0x37a050,
        onTaskMeta: ({
          taskId: _0x2f371c
        } = {}) => _0x37a050(_0x2f371c)
      });
      if (!_0x2c064b(_0x8cce2e)) {
        return false;
      }
      _0x36e520(_0x271b21, _0xe0e32a, _0x2a58c4);
      _0x450b2c(_0x8cce2e, _0x525e69, {
        status: "succeeded",
        message: "素材图片生成完成"
      });
      return true;
    } catch (_0x2276cc) {
      if (_0x2c064b(_0x8cce2e)) {
        _0x450b2c(_0x8cce2e, _0x525e69, {
          status: "failed",
          message: "素材图片生成失败",
          error: _0x2276cc?.getUserMessage?.() || _0x2276cc?.message || "图像生成失败。"
        });
      }
      _0x2276cc.storyAssetGenerationContext = _0x216729;
      throw _0x2276cc;
    }
  }
  async function _0x48ad4a(_0x135cac, _0x2e5d39 = createStoryProjectTaskToken(_0x3ffeb1)) {
    const _0x160258 = _0x2e5d39.projectId + ":" + _0x135cac.id;
    if (_0x3ad0c2.has(_0x160258) || _0x1442b1.has(_0x160258) || _0x1de79f) {
      return false;
    }
    _0x3ad0c2.add(_0x160258);
    _0x1442b1.add(_0x160258);
    _0x1b50be(_0x2e5d39);
    if (_0x59fa6e(_0x2e5d39)) {
      setStoryAssetAppearanceGenerating(_0x3ffeb1, _0x135cac.scope?.assetId, _0x135cac.scope?.appearanceId, true);
      if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
        _0xe5dd9c();
      }
    }
    try {
      const _0x3fd988 = await _0x3782d1({
        modelId: _0x135cac.modelId,
        provider: _0x135cac.provider
      });
      if (!_0x3fd988 || !_0x2c064b(_0x2e5d39)) {
        return false;
      }
      const _0x4a8d7f = _0x2e5d39.data?.assets?.find(_0x514c48 => normalizeText(_0x514c48?.id) === normalizeText(_0x135cac.scope?.assetId));
      const _0x34cbe7 = getStoryAssetAppearances(_0x4a8d7f).find(_0x1d7c1f => normalizeText(_0x1d7c1f?.id) === normalizeText(_0x135cac.scope?.appearanceId));
      if (!_0x4a8d7f || !_0x34cbe7) {
        throw new Error("素材图片任务对应的角色或形象已不存在。");
      }
      const _0x32f054 = {
        ...(_0x135cac.resumePayload && typeof _0x135cac.resumePayload === "object" ? _0x135cac.resumePayload : {}),
        model: _0x135cac.modelId,
        provider: _0x135cac.provider
      };
      const _0xa5052b = resolveModelExecution(_0x135cac.modelId, {
        providerHint: _0x135cac.provider
      });
      let _0x519853 = null;
      if (_0x135cac.provider === "dreamina") {
        _0x519853 = await resumeDreaminaImageTask(_0x135cac.remoteTaskId, _0x32f054);
      } else if (_0xa5052b?.executionManifest?.adapterType === "workflow" || ["runninghub", "runninghubwf"].includes(_0x135cac.provider)) {
        _0x519853 = await resumeRunningHubImageTask(_0x135cac.remoteTaskId, _0x32f054);
      } else {
        _0x519853 = await resumeAsyncImageTask(_0x135cac.remoteTaskId, _0x32f054);
      }
      if (!_0x2c064b(_0x2e5d39)) {
        return false;
      }
      _0x36e520(_0x4a8d7f, _0x34cbe7, _0x519853);
      _0x450b2c(_0x2e5d39, _0x135cac.id, {
        status: "succeeded",
        message: "素材图片任务已恢复并生成完成"
      });
      _0x3c4e04({
        immediate: true
      });
      if (_0x59fa6e(_0x2e5d39) && _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
        _0xe5dd9c();
      }
      _0xf62208("素材图片任务已恢复并生成完成。", "success", _0x2e5d39, {
        step: 2,
        assetId: _0x135cac.scope?.assetId
      });
      return true;
    } catch (_0x16d849) {
      if (!_0x2c064b(_0x2e5d39)) {
        return false;
      }
      _0x450b2c(_0x2e5d39, _0x135cac.id, {
        status: "failed",
        message: "素材图片任务恢复失败",
        error: _0x16d849?.message || "素材图片任务恢复失败。"
      });
      _0x847d75(_0x16d849?.message || "素材图片任务恢复失败。", "error", _0x16d849);
      return false;
    } finally {
      _0x3ad0c2.delete(_0x160258);
      _0x1442b1.delete(_0x160258);
      if (_0x59fa6e(_0x2e5d39)) {
        setStoryAssetAppearanceGenerating(_0x3ffeb1, _0x135cac.scope?.assetId, _0x135cac.scope?.appearanceId, false);
        if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
          _0xe5dd9c();
        }
      }
    }
  }
  async function _0x5ad9f1(_0x4b24b2, _0x402c83 = createStoryProjectTaskToken(_0x3ffeb1)) {
    const _0x1c89f8 = _0x402c83.projectId + ":" + _0x4b24b2.id;
    if (_0x3ad0c2.has(_0x1c89f8) || _0x1442b1.has(_0x1c89f8) || _0x1de79f) {
      return false;
    }
    _0x3ad0c2.add(_0x1c89f8);
    _0x1442b1.add(_0x1c89f8);
    _0x1b50be(_0x402c83);
    if (_0x59fa6e(_0x402c83)) {
      setStoryAssetVoiceGenerating(_0x3ffeb1, _0x4b24b2.scope?.assetId, true);
      if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
        _0xe5dd9c();
      }
    }
    try {
      const _0x46ddfd = await _0x3782d1({
        modelId: _0x4b24b2.modelId,
        provider: _0x4b24b2.provider
      });
      if (!_0x46ddfd || !_0x2c064b(_0x402c83)) {
        return false;
      }
      const _0x5403b3 = _0x402c83.data?.assets?.find(_0x2cd4b7 => normalizeText(_0x2cd4b7?.id) === normalizeText(_0x4b24b2.scope?.assetId));
      if (!_0x5403b3) {
        throw new Error("角色声音任务对应的角色已不存在。");
      }
      const _0xd736bc = await resumeStoryCharacterVoice({
        asset: _0x5403b3,
        taskId: _0x4b24b2.remoteTaskId,
        payload: _0x4b24b2.resumePayload || {}
      });
      if (!_0xd736bc || !_0x2c064b(_0x402c83)) {
        return false;
      }
      replaceStoryCharacterVoiceReference(_0x5403b3, _0xd736bc);
      _0x450b2c(_0x402c83, _0x4b24b2.id, {
        status: "succeeded",
        message: "角色声音任务已恢复并生成完成"
      });
      _0x3c4e04({
        immediate: true
      });
      if (_0x59fa6e(_0x402c83) && _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
        _0xe5dd9c();
      }
      _0xf62208("角色声音任务已恢复并生成完成。", "success", _0x402c83, {
        step: 2,
        assetId: _0x4b24b2.scope?.assetId
      });
      return true;
    } catch (_0x19e599) {
      if (!_0x2c064b(_0x402c83)) {
        return false;
      }
      _0x450b2c(_0x402c83, _0x4b24b2.id, {
        status: "failed",
        message: "角色声音任务恢复失败",
        error: _0x19e599?.message || "角色声音任务恢复失败。"
      });
      _0x847d75(_0x19e599?.message || "角色声音任务恢复失败。", "error", _0x19e599);
      return false;
    } finally {
      _0x3ad0c2.delete(_0x1c89f8);
      _0x1442b1.delete(_0x1c89f8);
      if (_0x59fa6e(_0x402c83)) {
        setStoryAssetVoiceGenerating(_0x3ffeb1, _0x4b24b2.scope?.assetId, false);
        if (normalizeText(_0x3ffeb1.characterVoiceEditor?.assetId) === normalizeText(_0x4b24b2.scope?.assetId)) {
          _0x3ffeb1.characterVoiceEditor.isGenerating = false;
        }
        if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 2) {
          _0xe5dd9c();
        }
      }
    }
  }
  function _0x2841ee(_0x250a48 = _0x3ffeb1.data) {
    const _0x496084 = _0x2e0a71(_0x250a48);
    const _0x4a2997 = getStoryBackgroundTasks(_0x250a48).filter(_0x558ab3 => ["asset-image", "asset-voice"].includes(_0x558ab3.type) && _0x558ab3.resumable && _0x558ab3.remoteTaskId && ["queued", "submitting", "pending", "running", "recovering"].includes(_0x558ab3.status));
    _0x4a2997.forEach(_0x2cf16e => {
      if (_0x2cf16e.type === "asset-voice") {
        _0x5ad9f1(_0x2cf16e, _0x496084);
      } else {
        _0x48ad4a(_0x2cf16e, _0x496084);
      }
    });
    return _0x4a2997.length;
  }
  function _0xc8b960(_0xaadf60, {
    showFallbackToast = true
  } = {}) {
    const _0x4a6686 = _0xaadf60?.storyAssetGenerationContext || {};
    const _0x2209c5 = _0x500b30(_0xaadf60, {
      providerId: _0x4a6686.payload?.provider || _0x3ffeb1.imageProvider,
      model: _0x4a6686.payload?.model || _0x3ffeb1.models.image,
      adapterType: _0x4a6686.execution?.executionManifest?.adapterType || ""
    });
    if (!_0x2209c5 && showFallbackToast) {
      _0x847d75(_0xaadf60?.getUserMessage?.() || _0xaadf60?.message || "图像生成失败，请稍后重试。", "error", _0xaadf60);
    } else if (!_0x2209c5) {
      notifyStoryTaskResult(null, _0xaadf60?.getUserMessage?.() || _0xaadf60?.message || "图像生成失败，请稍后重试。", "error", {
        details: _0xaadf60
      });
    }
    return _0x2209c5;
  }
  async function _0xfc9d5a() {
    const _0x4b0b65 = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
    const _0x80304d = _0x4b0b65 ? getSelectedAssetAppearance(_0x3ffeb1, _0x4b0b65) : null;
    if (!_0x4b0b65 || !_0x80304d || _0x4b0b65.isLibraryAsset || isStoryAssetAppearanceLoading(_0x3ffeb1, _0x4b0b65.id, _0x80304d.id)) {
      return;
    }
    if (!normalizeText(_0x80304d.prompt)) {
      _0x1ce8f7("请先填写提示词。", "warn");
      return;
    }
    if (shouldGenerateStoryAssetBaseAppearanceFirst(_0x4b0b65, _0x80304d)) {
      _0x1ce8f7("请先生成基础形象，再生成其他形象。", "warn");
      return;
    }
    if (typeof generateAssetImage !== "function") {
      _0x1ce8f7("图像生成服务尚未初始化。", "error");
      return;
    }
    const _0x471275 = createStoryProjectTaskToken(_0x3ffeb1);
    setStoryAssetAppearanceGenerating(_0x3ffeb1, _0x4b0b65.id, _0x80304d.id, true);
    _0x80304d.error = "";
    _0xe5dd9c();
    try {
      await _0x75622e(_0x4b0b65, _0x80304d, {
        projectToken: _0x471275
      });
      if (!_0x2c064b(_0x471275)) {
        return false;
      }
      _0xf62208("当前形象已生成。", "success", _0x471275, {
        step: 2,
        assetId: _0x4b0b65.id
      });
      _0x3c4e04({
        immediate: true
      });
      return true;
    } catch (_0x49e29f) {
      if (!_0x2c064b(_0x471275)) {
        return false;
      }
      _0x80304d.error = _0x49e29f?.getUserMessage?.() || _0x49e29f?.message || "生成失败";
      _0xc8b960(_0x49e29f);
      return false;
    } finally {
      if (_0x59fa6e(_0x471275)) {
        setStoryAssetAppearanceGenerating(_0x3ffeb1, _0x4b0b65.id, _0x80304d.id, false);
        _0xe5dd9c();
      }
    }
  }
  async function _0x4ecace(_0x50fde3) {
    const _0x46b5a1 = getSelectedStoryAsset(_0x3ffeb1, getVisibleStoryAssets(_0x3ffeb1));
    const _0x12e650 = _0x46b5a1 ? getSelectedAssetAppearance(_0x3ffeb1, _0x46b5a1) : null;
    const _0x309d05 = normalizeText(_0x12e650?.imageUrl);
    if (!_0x46b5a1 || !_0x12e650 || !_0x309d05) {
      _0x1ce8f7("当前没有可下载的图片。", "warn");
      return false;
    }
    const _0x2cf7f6 = normalizeText(_0x12e650.name);
    const _0x1aff2e = normalizeText(_0x46b5a1.name) || "生成图片";
    const _0x29be92 = _0x2cf7f6 && _0x2cf7f6 !== _0x1aff2e && _0x2cf7f6 !== "基础形象" ? [_0x1aff2e, _0x2cf7f6].join("-") : _0x1aff2e;
    try {
      syncStoryAsyncButton(_0x50fde3, true, {
        spinnerOnly: true
      });
      const _0x4f65fa = await runWorkspaceImageDownloadAction(_0x50fde3, () => saveWorkspaceImageDownload({
        imageRef: _0x309d05,
        filenameBase: _0x29be92,
        saveMedia: saveMedia
      }));
      if (!_0x4f65fa || _0x4f65fa.canceled) {
        return false;
      }
      if (_0x4f65fa.success === false) {
        throw new Error(_0x4f65fa.error || "图片下载失败，请稍后重试。");
      }
      _0x1ce8f7("图片已保存。", "success");
      return true;
    } catch (_0x32095f) {
      _0x1ce8f7(_0x32095f?.message || "图片下载失败，请稍后重试。", "error");
      return false;
    } finally {
      syncStoryAsyncButton(_0x50fde3, false);
    }
  }
  async function _0x21864f() {
    const _0x6b6160 = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
    const _0x34e91b = _0x6b6160 ? getSelectedAssetAppearance(_0x3ffeb1, _0x6b6160) : null;
    if (!_0x6b6160 || !_0x34e91b || _0x6b6160.isLibraryAsset) {
      _0x1ce8f7("当前形象不可加入总素材。", "warn");
      return false;
    }
    if (!normalizeText(_0x34e91b.imageUrl)) {
      _0x1ce8f7("请先生成或上传当前形象。", "warn");
      return false;
    }
    if (typeof saveAssetPackageItem !== "function") {
      _0x1ce8f7("总素材服务尚未初始化。", "error");
      return false;
    }
    const _0xabcfc4 = _0x6b6160.id + ":" + _0x34e91b.id;
    if (normalizeText(_0x3ffeb1.exportingAssetAppearanceKey) === _0xabcfc4) {
      return false;
    }
    const _0x3ef3ac = createStoryProjectTaskToken(_0x3ffeb1);
    const _0x104d11 = _0x3b5272.querySelector(".story-page.is-current .story-asset-detail .story-asset-preview");
    const _0x32f59b = _0x104d11?.getBoundingClientRect?.() || null;
    let _0x133ba8 = false;
    _0x3ffeb1.exportingAssetAppearanceKey = _0xabcfc4;
    _0xe5dd9c();
    try {
      let _0x17590d = buildStoryAssetPackageItemRequest({
        project: _0x3ef3ac.data.project,
        asset: _0x6b6160,
        appearance: _0x34e91b
      });
      const _0x587773 = normalizeText(_0x17590d.image?.imageUrl || _0x34e91b.imageUrl);
      const _0x42e332 = Boolean(normalizeText(_0x17590d.image?.localPath || _0x17590d.image?.originalLocalPath || _0x17590d.image?.displayLocalPath));
      if (!_0x42e332 && /^(?:https?:|blob:|data:)/i.test(_0x587773)) {
        const _0x2e50eb = await saveOutputFromUrl(_0x587773, {
          kind: "image",
          ext: "png",
          dedupeKey: ["story-asset-package", normalizeText(_0x3ef3ac.projectId), normalizeText(_0x6b6160.id), normalizeText(_0x34e91b.id), _0x587773].join(":")
        });
        if (_0x2e50eb?.error) {
          throw new Error(_0x2e50eb.error);
        }
        const _0x16cfc3 = normalizeText(_0x2e50eb?.displayUrl || _0x2e50eb?.url || _0x2e50eb?.originalUrl || _0x2e50eb?.thumbUrl);
        if (!_0x16cfc3) {
          throw new Error("保存当前形象失败：缺少稳定图片地址。");
        }
        _0x17590d = buildStoryAssetPackageItemRequest({
          project: _0x3ef3ac.data.project,
          asset: _0x6b6160,
          appearance: _0x34e91b,
          image: {
            ..._0x17590d.image,
            ...(_0x2e50eb && typeof _0x2e50eb === "object" ? _0x2e50eb : {}),
            imageUrl: _0x16cfc3
          }
        });
      }
      const _0x14542d = await saveAssetPackageItem(_0x17590d);
      if (!_0x2c064b(_0x3ef3ac)) {
        return false;
      }
      const _0x526c32 = normalizeText(_0x14542d?.imageUrl || _0x17590d.image?.imageUrl);
      if (_0x526c32) {
        _0x34e91b.imageUrl = _0x526c32;
      }
      _0x34e91b.totalAssetRef = {
        assetId: normalizeText(_0x14542d?.assetId),
        itemIndex: Math.max(0, Math.trunc(Number(_0x14542d?.itemIndex) || 0)),
        itemKey: _0x17590d.itemKey,
        imageUrl: _0x526c32,
        updatedAt: Date.now()
      };
      _0x3c4e04({
        immediate: true
      });
      _0x1ce8f7(_0x14542d?.itemCreated === false ? "已更新总素材中的当前形象。" : "当前形象已加入总素材。", "success");
      _0x133ba8 = true;
      return true;
    } catch (_0x17f008) {
      if (_0x2c064b(_0x3ef3ac)) {
        _0x1ce8f7(_0x17f008?.message || "加入总素材失败，请稍后重试。", "error");
      }
      return false;
    } finally {
      if (_0x59fa6e(_0x3ef3ac)) {
        _0x3ffeb1.exportingAssetAppearanceKey = "";
        _0xe5dd9c();
        if (_0x133ba8 && _0x104d11 && _0x32f59b) {
          playAssetCreateFly({
            fromRect: _0x32f59b,
            contentElement: _0x104d11,
            toElement: _0x3b5272.querySelector("[data-story-asset-filter=\"library\"]"),
            documentObject: documentObject,
            windowObject: windowObject
          });
        }
      }
    }
  }
  function _0x1d0de9(_0x532874 = "", _0x3eac5c = "", _0x179eaa = false) {
    const _0x5e9671 = findStoryAsset(_0x3ffeb1, _0x532874);
    if (!_0x5e9671) {
      _0x1ce8f7("请选择本剧已有的角色、场景或道具。", "warn");
      return false;
    }
    const _0x253dd8 = getVisibleStoryAssets(_0x3ffeb1);
    const _0x42a4de = getStoryLibraryActionAssetIds(_0x3ffeb1, _0x253dd8);
    if (normalizeText(_0x3eac5c) && _0x42a4de.length !== 1) {
      _0x1ce8f7("替换已有形象时只能选择一张总素材图片。", "warn");
      return false;
    }
    const _0x4a1c17 = addStoryLibraryAssetsToProject(_0x3ffeb1.data.assets, _0x253dd8, _0x42a4de, _0x5e9671.id, {
      targetAppearanceId: _0x3eac5c,
      createAppearance: _0x179eaa
    });
    const _0x1d2fa8 = [..._0x4a1c17.updatedAppearanceIds, ..._0x4a1c17.existingAssetIds, ..._0x4a1c17.addedAssetIds];
    if (!_0x1d2fa8.length) {
      _0x1ce8f7("请选择总素材中的图片后再加入项目。", "warn");
      return false;
    }
    _0x15093f();
    _0x3ffeb1.data.assets = _0x4a1c17.assets;
    const _0x66f014 = findStoryAsset(_0x3ffeb1, _0x5e9671.id);
    const _0x13622e = _0x1d2fa8.at(-1) || "";
    const _0x4c3f3e = getStoryAssetAppearances(_0x66f014).findIndex(_0x40660e => normalizeText(_0x40660e?.id) === _0x13622e);
    applyStoryLibraryAdditionUiState(_0x3ffeb1, {
      targetAssetId: _0x5e9671.id,
      selectedAppearanceIndex: _0x4c3f3e
    });
    _0xe5dd9c();
    _0x3c4e04({
      immediate: true
    });
    if (_0x4a1c17.updatedAppearanceIds.length) {
      _0x1ce8f7("已更新" + _0x5e9671.name + "的所选形象。", "success");
    } else if (_0x4a1c17.addedAssetIds.length) {
      _0x1ce8f7("已为" + _0x5e9671.name + "新增 " + _0x4a1c17.addedAssetIds.length + " 个形象。", "success");
    } else {
      _0x1ce8f7("所选图片已在" + _0x5e9671.name + "的形象中。", "info");
    }
    return true;
  }
  function _0x4ae7d8(_0x1de97f, _0x134674) {
    const _0x4599cc = normalizeText(_0x134674);
    const _0x2ea934 = getStoryBackgroundTasks(_0x1de97f).filter(_0x14a26f => isStoryBackgroundTaskActive(_0x14a26f) && normalizeText(_0x14a26f.batch?.id) === _0x4599cc);
    const _0x1d7fc0 = _0x2ea934.filter(_0x5d22e9 => _0x5d22e9.type === "asset-image").map(_0x5da59d => getStoryAssetAppearanceGenerationKey(_0x5da59d.scope?.assetId, _0x5da59d.scope?.appearanceId)).filter(Boolean);
    const _0x2cf8a1 = _0x2ea934.filter(_0x4bc330 => _0x4bc330.type === "asset-voice").map(_0x3d9083 => normalizeText(_0x3d9083.scope?.assetId)).filter(Boolean);
    return {
      tasks: _0x2ea934,
      appearanceKeys: [...new Set(_0x1d7fc0)],
      voiceAssetIds: [...new Set(_0x2cf8a1)],
      assetIds: [...new Set(_0x2ea934.filter(_0x3afe8b => _0x3afe8b.type === "asset-image").map(_0x80cca5 => normalizeText(_0x80cca5.scope?.assetId)).filter(Boolean))]
    };
  }
  function _0x5710f3() {
    if (!_0x3ffeb1.isBatchGenerating || _0x3ffeb1.assetBatchCancelRequested) {
      return false;
    }
    const _0x449df1 = getStoryBackgroundTasks(_0x3ffeb1.data).find(_0x5233f8 => isStoryBackgroundTaskActive(_0x5233f8) && _0x5233f8.batch?.type === "asset-generation");
    const _0x5a6e18 = normalizeText(_0x3ffeb1.assetBatchId || _0x449df1?.batch?.id);
    const _0x214865 = _0x449df1?.batch;
    if (!_0x5a6e18 || !_0x214865) {
      return false;
    }
    const _0x3d652d = _0x4ae7d8(_0x3ffeb1.data, _0x5a6e18);
    const _0x41f42a = buildStoryAssetBatchCancellationUpdate(_0x214865, _0x3d652d);
    if (!_0x41f42a.canCancel) {
      _0x1ce8f7("当前任务正在生成，暂无可取消的后续任务。", "info");
      return false;
    }
    if (!_0x366053.request(_0x5a6e18)) {
      return false;
    }
    _0x38ed49(createStoryProjectTaskToken(_0x3ffeb1), _0x5a6e18, {
      cancelRequested: true,
      cancelledAppearanceKeys: _0x41f42a.cancelledAppearanceKeys,
      cancelledVoiceAssetIds: _0x41f42a.cancelledVoiceAssetIds,
      pendingAssetIds: _0x41f42a.pendingAssetIds,
      pendingAppearanceKeys: _0x41f42a.pendingAppearanceKeys,
      pendingVoiceAssetIds: _0x41f42a.pendingVoiceAssetIds,
      label: _0x41f42a.label
    });
    _0x3ffeb1.assetBatchId = _0x5a6e18;
    _0x3ffeb1.assetBatchCancelRequested = true;
    _0x3ffeb1.batchGeneratingAssetIds = _0x41f42a.pendingAssetIds;
    _0x3ffeb1.batchGeneratingAppearanceKeys = _0x41f42a.pendingAppearanceKeys;
    _0x3ffeb1.batchGeneratingVoiceAssetIds = _0x41f42a.pendingVoiceAssetIds;
    _0x3ffeb1.batchGenerationLabel = _0x41f42a.label;
    _0xe5dd9c();
    _0x1ce8f7("已取消后续 " + _0x41f42a.cancelledCount + " 项生成；当前任务会继续完成。", "info");
    return true;
  }
  async function _0xe75f58(_0x192102 = "all") {
    if (_0x3ffeb1.isBatchGenerating) {
      return;
    }
    const _0x47b9b5 = _0x3ffeb1.data.assets.filter(_0x4b0564 => _0x3ffeb1.selectedAssetIds.includes(_0x4b0564.id) && !_0x4b0564.isLibraryAsset);
    const _0x324cb4 = buildStoryAssetBatchGenerationPlan(_0x47b9b5, _0x192102);
    if (_0x324cb4.imageTasks.length && typeof generateAssetImage !== "function") {
      _0x1ce8f7("图像生成服务尚未初始化。", "error");
      return;
    }
    if (!_0x324cb4.totalTasks) {
      _0x1ce8f7(_0x324cb4.mode === "image" ? "所选项目没有待生成形象。" : _0x324cb4.mode === "voice" ? "所选项目没有待生成语音。" : "所选项目没有待生成内容。", "info");
      return;
    }
    const _0x265a6d = new Set(Array.isArray(_0x3ffeb1.generatingAppearanceKeys) ? _0x3ffeb1.generatingAppearanceKeys : []);
    const _0x45f4ba = _0x324cb4.imageTasks.map(({
      asset: _0x28ffc0,
      appearance: _0x20765e
    }) => getStoryAssetAppearanceGenerationKey(_0x28ffc0.id, _0x20765e.id)).filter(Boolean);
    const _0x4f748e = [...new Set(_0x324cb4.voiceAssets.map(_0x5bbbd8 => normalizeText(_0x5bbbd8?.id)).filter(Boolean))];
    const _0x19c457 = new Set((Array.isArray(_0x3ffeb1.generatingVoiceAssetIds) ? _0x3ffeb1.generatingVoiceAssetIds : []).map(normalizeText).filter(Boolean));
    const _0x2e3cff = _0x45f4ba.some(_0x51de55 => _0x265a6d.has(_0x51de55)) || _0x4f748e.some(_0x2c32f4 => _0x19c457.has(_0x2c32f4));
    if (_0x2e3cff) {
      _0x1ce8f7("所选素材已有生成任务正在运行。", "info");
      return;
    }
    const _0x518328 = createStoryProjectTaskToken(_0x3ffeb1);
    _0x3ffeb1.isBatchGenerating = true;
    _0x3ffeb1.batchGeneratingAssetIds = [...new Set(_0x324cb4.imageTasks.map(({
      asset: _0x501013
    }) => _0x501013.id))];
    _0x3ffeb1.batchGeneratingAppearanceKeys = [..._0x45f4ba];
    _0x3ffeb1.batchGeneratingVoiceAssetIds = [..._0x4f748e];
    _0x3ffeb1.assetBatchCancelRequested = false;
    _0x3ffeb1.batchGenerationLabel = "批量生成 0/" + _0x324cb4.totalTasks;
    const _0x19e765 = new Set(_0x45f4ba);
    const _0x4d13a5 = new Set(_0x4f748e);
    const _0x2e6295 = () => [...new Set(_0x324cb4.imageTasks.filter(({
      asset: _0x4664e4,
      appearance: _0xb176cf
    }) => _0x19e765.has(getStoryAssetAppearanceGenerationKey(_0x4664e4.id, _0xb176cf.id))).map(({
      asset: _0x9cf918
    }) => normalizeText(_0x9cf918.id)).filter(Boolean))];
    const _0x9a76b3 = _0x2826d4("asset-generation", {
      total: _0x324cb4.totalTasks,
      completed: 0,
      pendingAssetIds: _0x2e6295(),
      pendingAppearanceKeys: [..._0x19e765],
      pendingVoiceAssetIds: [..._0x4d13a5],
      cancelRequested: false,
      label: _0x3ffeb1.batchGenerationLabel
    });
    _0x3ffeb1.assetBatchId = _0x9a76b3.id;
    const _0x37b050 = {
      projectToken: _0x518328,
      batch: _0x9a76b3,
      modelId: _0x3ffeb1.models.image,
      provider: _0x3ffeb1.imageProvider,
      generationParams: {
        ..._0x3ffeb1.imageGenerationParams
      },
      promptPresetId: _0x3ffeb1.assetPromptPresetId,
      scenePromptPresetId: _0x3ffeb1.sceneAssetPromptPresetId
    };
    let _0x113c13 = 0;
    let _0x14ad2a = 0;
    let _0x32397f = 0;
    let _0x539d4f = 0;
    let _0x36f632 = false;
    let _0x44960e = false;
    let _0x583f73 = false;
    let _0x3f42c0 = false;
    const _0x444632 = () => {
      const _0x49dc3d = _0x366053.isRequested(_0x9a76b3.id);
      const _0x4dd6dc = _0x49dc3d ? _0x4ae7d8(_0x518328.data, _0x9a76b3.id) : null;
      const _0x4251ee = _0x4dd6dc?.assetIds || _0x2e6295();
      const _0x39ed47 = _0x4dd6dc?.appearanceKeys || [..._0x19e765];
      const _0xfcb975 = _0x4dd6dc?.voiceAssetIds || [..._0x4d13a5];
      const _0x461d84 = _0x39ed47.length + _0xfcb975.length;
      const _0x4fcf32 = _0x49dc3d ? _0x461d84 ? "已取消后续生成 · 正在完成 " + _0x461d84 + " 项" : "已取消后续生成" : "批量生成 " + _0x539d4f + "/" + _0x324cb4.totalTasks;
      _0x18b12d(_0x518328, _0x9a76b3, {
        completed: _0x539d4f,
        cancelRequested: _0x49dc3d,
        pendingAssetIds: _0x4251ee,
        pendingAppearanceKeys: _0x39ed47,
        pendingVoiceAssetIds: _0xfcb975,
        label: _0x4fcf32
      });
      if (!_0x59fa6e(_0x518328)) {
        return;
      }
      _0x3ffeb1.batchGenerationLabel = _0x4fcf32;
      _0x2984b3();
    };
    _0xe5dd9c();
    await runStoryAssetBatchGenerationPhases(async () => {
      await runStoryAssetAppearanceGenerationTasks(_0x324cb4.imageTasks, async ({
        asset: _0x53954f,
        appearance: _0x1b053a
      }, {
        remainingTasks: _0x191e12
      }) => {
        if (!_0x2c064b(_0x518328)) {
          return;
        }
        const _0x198467 = getStoryAssetAppearanceGenerationKey(_0x53954f.id, _0x1b053a.id);
        if (_0x36f632) {
          _0x32397f += 1;
          _0x539d4f += 1;
          _0x19e765.delete(_0x198467);
          _0x1b053a.error = "缺少 API Key，已跳过当前形象。";
          if (_0x59fa6e(_0x518328)) {
            _0x3ffeb1.batchGeneratingAppearanceKeys = _0x3ffeb1.batchGeneratingAppearanceKeys.filter(_0x258389 => _0x258389 !== _0x198467);
            settleStoryAssetBatchLoading(_0x3ffeb1, _0x53954f, _0x191e12, {
              failed: true
            });
            _0x1365cf(_0x53954f.id);
          }
          _0x444632();
          return;
        }
        _0x1b053a.error = "";
        if (_0x59fa6e(_0x518328) && _0x3ffeb1.selectedAssetId === _0x53954f.id) {
          _0x7ca197();
        }
        let _0x56cc56 = false;
        try {
          if (shouldGenerateStoryAssetBaseAppearanceFirst(_0x53954f, _0x1b053a)) {
            throw new Error("基础形象尚未生成，已跳过当前形象。");
          }
          await _0x75622e(_0x53954f, _0x1b053a, _0x37b050);
          if (!_0x2c064b(_0x518328)) {
            return;
          }
          _0x113c13 += 1;
        } catch (_0x628b24) {
          if (!_0x2c064b(_0x518328)) {
            return;
          }
          _0x56cc56 = true;
          _0x32397f += 1;
          _0x1b053a.error = _0x628b24?.getUserMessage?.() || _0x628b24?.message || "生成失败";
          _0x36f632 = _0x36f632 || _0xc8b960(_0x628b24, {
            showFallbackToast: false
          });
          _0x583f73 = _0x583f73 || _0x36f632;
        }
        _0x539d4f += 1;
        _0x19e765.delete(_0x198467);
        if (_0x59fa6e(_0x518328)) {
          _0x3ffeb1.batchGeneratingAppearanceKeys = _0x3ffeb1.batchGeneratingAppearanceKeys.filter(_0x167fae => _0x167fae !== _0x198467);
          settleStoryAssetBatchLoading(_0x3ffeb1, _0x53954f, _0x366053.isRequested(_0x9a76b3.id) ? [] : _0x191e12, {
            failed: _0x56cc56
          });
          _0x1365cf(_0x53954f.id);
          if (_0x3ffeb1.selectedAssetId === _0x53954f.id) {
            _0x7ca197();
          }
        }
        _0x444632();
        _0x3c4e04({
          immediate: true
        });
      }, {
        shouldStop: () => _0x366053.isRequested(_0x9a76b3.id)
      });
      if (_0x59fa6e(_0x518328)) {
        _0x3ffeb1.batchGeneratingAssetIds = [];
        _0x3ffeb1.batchGeneratingAppearanceKeys = [];
      }
    }, async () => {
      for (const _0x5c4870 of _0x324cb4.voiceAssets) {
        if (!_0x2c064b(_0x518328)) {
          return;
        }
        if (_0x366053.isRequested(_0x9a76b3.id)) {
          break;
        }
        if (_0x44960e) {
          _0x32397f += 1;
          _0x539d4f += 1;
          _0x4d13a5.delete(normalizeText(_0x5c4870.id));
          if (_0x59fa6e(_0x518328)) {
            _0x3ffeb1.batchGeneratingVoiceAssetIds = _0x3ffeb1.batchGeneratingVoiceAssetIds.filter(_0x419471 => normalizeText(_0x419471) !== normalizeText(_0x5c4870.id));
          }
          _0x444632();
          continue;
        }
        let _0x3b05fc = null;
        const _0xa06cb8 = _0x59fa6e(_0x518328) && _0x3ffeb1.characterVoiceEditor?.assetId === _0x5c4870.id;
        if (_0xa06cb8) {
          _0x3ffeb1.characterVoiceEditor.isGenerating = true;
          _0xe5dd9c();
        }
        try {
          const _0x2f88d5 = _0xa06cb8 ? _0x3ffeb1.characterVoiceEditor : createStoryCharacterVoiceEditorDraft({
            asset: _0x5c4870,
            data: _0x518328.data
          });
          _0x3b05fc = getStoryCharacterVoiceWorkflow(_0x2f88d5.nodeData?.model);
          if (!_0x3b05fc) {
            throw new Error("当前没有可用的音频模型。");
          }
          if (false) {
            const _0x56794b = windowObject?.isModelAllowedBySubscription;
            const _0x469c66 = typeof _0x56794b === "function" ? _0x56794b(_0x3b05fc.key, _0x3b05fc.provider) : true;
            if (!_0x469c66) {
              if (!_0x3f42c0 && _0x59fa6e(_0x518328)) {
                windowObject?.openSubscriptionDialog?.({
                  modelId: _0x3b05fc.key,
                  provider: _0x3b05fc.provider
                });
                _0x3f42c0 = true;
              }
              throw new Error("当前声音模型需要高级会员。已停止批量语音生成。");
            }
          }
          const _0x5ea8d1 = _0x3b05fc.vip === true && typeof windowObject?.ensureSubscriptionInstallId === "function" ? await windowObject.ensureSubscriptionInstallId() : windowObject?.__aicInstallId || "";
          if (!_0x2c064b(_0x518328)) {
            return;
          }
          const _0x11a0e3 = await _0x35e8b2({
            asset: _0x5c4870,
            editor: _0x2f88d5,
            installId: _0x5ea8d1,
            projectToken: _0x518328,
            batch: _0x9a76b3
          });
          if (!_0x2c064b(_0x518328)) {
            return;
          }
          if (!_0x11a0e3) {
            throw new Error("音频模型没有返回可用的声音结果。");
          }
          if (_0x59fa6e(_0x518328)) {
            _0x493da1();
          }
          replaceStoryCharacterVoiceReference(_0x5c4870, _0x11a0e3);
          if (_0xa06cb8) {
            _0x3ffeb1.characterVoiceEditor.error = "";
          }
          _0x14ad2a += 1;
        } catch (_0x5ba172) {
          if (!_0x2c064b(_0x518328)) {
            return;
          }
          _0x32397f += 1;
          _0x44960e = _0x500b30(_0x5ba172, {
            provider: _0x3b05fc?.provider,
            modelId: _0x3b05fc?.key
          });
          _0x583f73 = _0x583f73 || _0x44960e;
          if (!_0x44960e) {
            notifyStoryTaskResult(null, _0x5ba172?.message || "角色“" + (normalizeText(_0x5c4870.name) || _0x5c4870.id) + "”声音生成失败。", "error", {
              details: {
                assetId: _0x5c4870.id,
                error: _0x5ba172
              }
            });
          }
        }
        if (_0xa06cb8) {
          _0x3ffeb1.characterVoiceEditor.isGenerating = false;
        }
        _0x4d13a5.delete(normalizeText(_0x5c4870.id));
        if (_0x59fa6e(_0x518328)) {
          _0x3ffeb1.batchGeneratingVoiceAssetIds = _0x3ffeb1.batchGeneratingVoiceAssetIds.filter(_0x5c3889 => normalizeText(_0x5c3889) !== normalizeText(_0x5c4870.id));
        }
        _0x539d4f += 1;
        _0x444632();
        if (_0xa06cb8) {
          _0xe5dd9c();
        } else if (_0x59fa6e(_0x518328)) {
          _0x1365cf(_0x5c4870.id);
          if (_0x3ffeb1.selectedAssetId === _0x5c4870.id) {
            _0x7ca197();
          }
        }
        _0x3c4e04({
          immediate: true
        });
        if (_0x3f42c0) {
          break;
        }
      }
    });
    const _0x32ac91 = _0x366053.isRequested(_0x9a76b3.id);
    const _0x195187 = _0x32ac91 ? _0x19e765.size + _0x4d13a5.size : 0;
    if (_0x32ac91) {
      _0x18b12d(_0x518328, _0x9a76b3, {
        completed: _0x539d4f,
        cancelRequested: true,
        cancelledAppearanceKeys: [..._0x19e765],
        cancelledVoiceAssetIds: [..._0x4d13a5],
        pendingAssetIds: [],
        pendingAppearanceKeys: [],
        pendingVoiceAssetIds: [],
        label: "已取消后续 " + _0x195187 + " 项生成"
      });
    }
    _0x366053.clear(_0x9a76b3.id);
    if (!_0x2c064b(_0x518328)) {
      return false;
    }
    if (_0x59fa6e(_0x518328)) {
      _0x3ffeb1.isBatchGenerating = false;
      _0x3ffeb1.batchGeneratingAssetIds = [];
      _0x3ffeb1.batchGeneratingAppearanceKeys = [];
      _0x3ffeb1.batchGeneratingVoiceAssetIds = [];
      _0x3ffeb1.assetBatchId = "";
      _0x3ffeb1.assetBatchCancelRequested = false;
      _0x3ffeb1.batchGenerationLabel = "";
      _0xe5dd9c();
    }
    _0x3c4e04({
      immediate: true
    });
    const _0x2a541c = [_0x324cb4.mode !== "voice" ? "图片 " + _0x113c13 : "", _0x324cb4.mode !== "image" ? "语音 " + _0x14ad2a : ""].filter(Boolean).join("，");
    if (_0x32ac91) {
      _0xf62208(_0x32397f ? "已取消后续 " + _0x195187 + " 项生成；" + _0x2a541c + "，失败 " + _0x32397f + "。" : "已取消后续 " + _0x195187 + " 项生成；" + _0x2a541c + "。", _0x32397f ? "warn" : "info", _0x518328, {
        step: 2,
        assetId: _0x47b9b5[0]?.id
      });
      return true;
    }
    _0x5c2bf9(_0x32397f ? "批量生成完成：" + _0x2a541c + "，失败 " + _0x32397f + "。" : "批量生成完成：" + _0x2a541c + "。", _0x518328, {
      step: 2,
      assetId: _0x47b9b5[0]?.id
    }, {
      tone: _0x32397f ? "warn" : "success",
      showResultToast: !_0x583f73
    });
    return true;
  }
  function _0x2639e0(_0x214cf1) {
    const _0x5431ac = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
    const _0x1721fb = _0x5431ac ? getStoryAssetAppearances(_0x5431ac) : [];
    if (_0x1721fb.length < 2) {
      return;
    }
    const _0x932f4e = getSelectedAssetAppearanceIndex(_0x3ffeb1, _0x5431ac);
    const _0x43a0d7 = (_0x932f4e + _0x214cf1 + _0x1721fb.length) % _0x1721fb.length;
    _0x3ffeb1.assetAppearanceIndexes = {
      ..._0x3ffeb1.assetAppearanceIndexes,
      [_0x5431ac.id]: _0x43a0d7
    };
    _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
    _0x3ffeb1.assetAppearanceMotion = _0x214cf1 > 0 ? "next" : "previous";
    if (!_0x7ca197()) {
      _0xe5dd9c();
    }
    _0x3ffeb1.assetAppearanceMotion = "";
    _0x3c4e04();
  }
  function _0x130cf5(_0x50b867) {
    const _0x1ead87 = _0x50b867.target.closest?.("[data-story-appearance-wheel=\"true\"]");
    if (!_0x1ead87 || _0x3ffeb1.view !== "project" || _0x3ffeb1.step !== 2) {
      return false;
    }
    _0x50b867.preventDefault();
    const _0x112e25 = consumeStoryWheelDirection(_0x50b867, _0x2145bf);
    if (_0x112e25) {
      _0x2639e0(_0x112e25);
    }
    return true;
  }
  function _0x1d758b(_0x5349ee) {
    const _0x39f878 = getSelectedEpisode(_0x3ffeb1);
    const _0xd27242 = Array.isArray(_0x39f878?.clips) ? _0x39f878.clips : [];
    if (_0xd27242.length < 2) {
      return false;
    }
    const _0x46c333 = storyClipProduction.getAdjacentClipId(_0xd27242, _0x3ffeb1.selectedClipId, _0x5349ee);
    const _0x4b051d = _0xd27242.find(_0x47e350 => _0x47e350.id === _0x46c333);
    if (!_0x4b051d || _0x4b051d.id === _0x3ffeb1.selectedClipId) {
      return false;
    }
    const _0x21e408 = Number(_0x5349ee) < 0 ? "previous" : "next";
    _0x155859({
      close: true
    });
    _0x3ffeb1.selectedClipId = _0x4b051d.id;
    _0x1bbd64(_0x4b051d);
    if (!_0xafdba0(_0x21e408)) {
      _0xe5dd9c();
    }
    _0x3c4e04();
    return true;
  }
  function _0x207763(_0x2d8d36, _0x4e1fc5, {
    delta = 0
  } = {}) {
    const _0xae2d30 = getSelectedEpisode(_0x3ffeb1);
    const _0x5e98b5 = Array.isArray(_0xae2d30?.clips) ? _0xae2d30.clips : [];
    const _0x15154f = _0x5e98b5.find(_0x15efe9 => normalizeText(_0x15efe9?.id) === normalizeText(_0x2d8d36));
    if (!_0x15154f) {
      return false;
    }
    const _0x226b80 = storyClipProduction.renderEpisode(_0x3ffeb1, _0xae2d30, _0x15154f);
    const _0x438b83 = _0x226b80.videoResults;
    if (_0x438b83.length < 2) {
      return false;
    }
    const _0x1b5b7a = _0x226b80.activeVideoResultIndex;
    const _0x28b155 = Math.trunc(Number(_0x4e1fc5));
    const _0x3b2cb1 = Number.isFinite(_0x28b155) ? Math.max(0, Math.min(_0x438b83.length - 1, _0x28b155)) : _0x226b80.getAdjacentVideoResultIndex(delta);
    const _0x259e2f = _0x3ffeb1.selectedClipId !== _0x15154f.id;
    if (!_0x259e2f && _0x3b2cb1 === _0x1b5b7a) {
      _0x3cb00d();
      return false;
    }
    const _0x13a398 = _0x5e98b5.findIndex(_0x13d217 => _0x13d217.id === _0x3ffeb1.selectedClipId);
    const _0x2c287c = _0x5e98b5.findIndex(_0x52ec43 => _0x52ec43.id === _0x15154f.id);
    _0x15154f.video = {
      ...(_0x15154f.video || {}),
      activeIndex: _0x3b2cb1
    };
    _0x3ffeb1.pendingDeleteClipId = "";
    _0x3ffeb1.selectedClipId = _0x15154f.id;
    if (_0x259e2f) {
      _0x155859({
        close: true
      });
      _0x1bbd64(_0x15154f);
      const _0x54d624 = _0x2c287c >= 0 && _0x2c287c < _0x13a398 ? "previous" : "next";
      if (!_0xafdba0(_0x54d624)) {
        _0xe5dd9c();
      }
    } else {
      const _0x3a7557 = Number(delta) < 0 || !delta && _0x3b2cb1 < _0x1b5b7a ? "previous" : "next";
      if (!_0x73f277(_0x3a7557)) {
        _0xe5dd9c();
      }
    }
    _0x3cb00d();
    _0x3c4e04();
    return true;
  }
  function _0x5d489f(_0x282226, _0x5d11fe) {
    const _0x4d4461 = getSelectedEpisode(_0x3ffeb1);
    const _0x12fa32 = (Array.isArray(_0x4d4461?.clips) ? _0x4d4461.clips : []).find(_0x387fc8 => normalizeText(_0x387fc8?.id) === normalizeText(_0x282226));
    if (!_0x12fa32) {
      return false;
    }
    const _0x458b93 = storyClipProduction.removeVideoResult(_0x12fa32, _0x5d11fe);
    if (!_0x458b93.changed) {
      return false;
    }
    _0x12fa32.video = _0x458b93.clip.video;
    const _0x5def31 = normalizeText(_0x3ffeb1.selectedClipId) === normalizeText(_0x12fa32.id);
    if (_0x5def31 && _0x458b93.activeResultChanged) {
      if (!_0x73f277(_0x458b93.direction)) {
        _0xe5dd9c();
      }
    } else {
      const _0x42e683 = _0x4bf4f6.querySelector(".story-page.is-current");
      if (_0x5def31) {
        syncSelectedClipVideoMetadataInPlace(_0x42e683, _0x458b93.activeIndex, _0x458b93.results.length);
      }
      syncStoryClipCardVideoInPlace({
        root: _0x42e683,
        documentObject: documentObject,
        clipId: _0x12fa32.id,
        resultCount: _0x458b93.results.length,
        refreshThumbnail: _0x458b93.activeResultChanged,
        thumbnailMarkup: _0x458b93.activeResultChanged ? storyClipProduction.renderTimelineVideoThumbnail(_0x12fa32) : ""
      });
    }
    const _0x2d2c61 = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x2d6008 = findStoryClipCardShell(_0x2d2c61, _0x12fa32.id);
    const _0x26108f = Math.min(Math.max(0, Math.trunc(Number(_0x5d11fe) || 0)), _0x458b93.results.length - 1);
    _0x46ef47?.refresh?.({
      anchor: _0x2d6008,
      focusSelector: "[data-story-action=\"select-video-result\"][data-story-video-result-index=\"" + _0x26108f + "\"]",
      fallbackFocus: _0x2d6008?.querySelector?.(".story-clip-card")
    });
    _0x3c4e04();
    return true;
  }
  function _0x1b983e(_0x4f6e0a) {
    const _0x3ef0a4 = getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
    if (!_0x3ef0a4) {
      return false;
    }
    return _0x207763(_0x3ef0a4.id, storyClipProduction.renderEpisode(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1), _0x3ef0a4).getAdjacentVideoResultIndex(_0x4f6e0a), {
      delta: _0x4f6e0a
    });
  }
  function _0x17f245(_0x74f5f2) {
    const _0x3386df = _0x74f5f2.target.closest?.("[data-story-clip-navigation=\"true\"]");
    if (!_0x3386df || _0x3ffeb1.view !== "episode") {
      return false;
    }
    _0x74f5f2.preventDefault();
    const _0x334ec2 = consumeStoryWheelDirection(_0x74f5f2, _0x575e17);
    if (_0x334ec2) {
      _0x1d758b(_0x334ec2);
    }
    return true;
  }
  function _0x1a0e89(_0x5975e0) {
    if (!_0x5975e0?.closest?.(".story-page")?.classList.contains("is-current")) {
      return null;
    }
    const _0x264293 = normalizeText(_0x5975e0?.dataset?.storyMarqueeSurface);
    if (_0x264293 === "assets") {
      return {
        enabled: _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2 && !_0x3ffeb1.isBatchGenerating,
        selectedIds: _0x3ffeb1.selectedAssetIds,
        commit(_0x335eba) {
          _0x3ffeb1.selectedAssetIds = _0x3ffeb1.assetFilter === "library" ? _0x335eba.filter(_0xf36f85 => {
            const _0x42f5a4 = getVisibleStoryAssets(_0x3ffeb1).find(_0x10a01a => normalizeText(_0x10a01a?.id) === normalizeText(_0xf36f85));
            return normalizeText(_0x42f5a4?.mediaKind).toLowerCase() === "image" && normalizeText(_0x42f5a4?.sourceUrl || _0x42f5a4?.imageUrl);
          }) : _0x335eba;
          _0x3ffeb1.assetSelectionMode = _0x3ffeb1.selectedAssetIds.length > 0;
          _0xe5dd9c();
        }
      };
    }
    if (_0x264293 === "episodes") {
      return {
        enabled: _0x3ffeb1.view === "project" && _0x3ffeb1.step === 3 && !getStoryEpisodeBatchControlState(_0x3ffeb1).disabled,
        selectedIds: _0x3ffeb1.selectedEpisodeIds,
        commit(_0x43b68b) {
          _0x3ffeb1.episodeSelectionMode = true;
          _0x3ffeb1.selectedEpisodeIds = _0x43b68b;
          _0xe5dd9c();
        }
      };
    }
    if (_0x264293 === "clips") {
      const _0x919b6f = storyClipProduction.getGenerationState(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
      return {
        enabled: _0x3ffeb1.view === "episode" && !_0x919b6f.isBatchGenerating,
        selectedIds: _0x3ffeb1.selectedClipGenerationIds,
        commit(_0x3c5dc2) {
          const _0x11b23f = new Set(_0x919b6f.generatingClipIds);
          _0x3ffeb1.pendingDeleteClipId = "";
          _0x3ffeb1.clipSelectionMode = true;
          _0x3ffeb1.selectedClipGenerationIds = _0x3c5dc2.filter(_0x10416e => !_0x11b23f.has(normalizeText(_0x10416e)));
          _0x5c09e0();
          _0x88077f();
        }
      };
    }
    return null;
  }
  const _0x3c8c92 = createStoryMarqueeSelectionController({
    root: _0x3b5272,
    documentObject: documentObject,
    windowObject: windowObject,
    getConfig: _0x1a0e89,
    onActivate: _0x277232,
    onCommit: () => _0x3c4e04()
  });
  const _0x652cc3 = ["[data-story-marquee-item]", "button", "a[href]", "input", "textarea", "select", "label", "img", "video", "audio", "canvas", "[contenteditable='true']", "[role='button']", "[role='option']", "[role='menuitem']", "[role='slider']", "[tabindex]"].join(",");
  function _0x198b97(_0x300160) {
    const _0x559d4b = _0x4bf4f6.querySelector(".story-page.is-current");
    const _0x11bca0 = _0x300160?.target;
    if (!_0x559d4b?.contains(_0x11bca0) || !_0x11bca0?.closest) {
      return false;
    }
    if (_0x11bca0.closest(_0x652cc3)) {
      return false;
    }
    if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 2 && _0x3ffeb1.assetSelectionMode && !_0x3ffeb1.isBatchGenerating) {
      _0x3ffeb1.assetSelectionMode = false;
      _0x3ffeb1.selectedAssetIds = [];
      _0xe5dd9c();
    } else if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 3 && _0x3ffeb1.episodeSelectionMode) {
      _0x3ffeb1.episodeSelectionMode = false;
      _0x3ffeb1.selectedEpisodeIds = [];
      _0xe5dd9c();
    } else if (_0x3ffeb1.view === "episode" && _0x3ffeb1.clipSelectionMode) {
      _0x3ffeb1.clipSelectionMode = false;
      _0x3ffeb1.selectedClipGenerationIds = [];
      _0x88077f();
    } else {
      return false;
    }
    _0x3c8c92.cancel();
    _0x3c4e04();
    return true;
  }
  const _0x4e50e6 = createStoryWorkspaceNavigationTransaction({
    state: _0x3ffeb1,
    toolbarEl: _0x5867cc,
    windowObject: windowObject,
    renderAdapter: {
      render: _0xe5dd9c,
      renderToolbar: _0x3e894e,
      capturePageState: _0x12ca9b
    },
    onClipSelected: _0x2d0dd3,
    onCommit: _0x3c4e04,
    notify: _0x1ce8f7
  });
  async function _0x220ab0(_0x92a4b5, _0x38c7fc = {}) {
    return _0x4e50e6.navigate({
      ..._0x38c7fc,
      view: "project",
      step: _0x92a4b5
    });
  }
  function _0x44f002(_0x313db5) {
    const _0x136cfb = normalizeStoryWorkspaceStep(_0x313db5);
    if (_0x3ffeb1.data?.project?.outlineStatus === "stale" && _0x136cfb > 1) {
      _0x1ce8f7("故事蓝图已修改，请先重新运行分集规划。", "warn");
      return;
    }
    if (_0x3ffeb1.step === 2 && _0x136cfb === 3) {
      _0xae8d80();
    } else {
      _0x220ab0(_0x136cfb);
    }
  }
  function _0xf3cc42(_0x40a191) {
    return handleWorkspaceStepShortcut(_0x40a191, {
      enabled: _0x4f8626 && !_0x3ffeb1.canvasSyncPending && ["project", "episode"].includes(_0x3ffeb1.view),
      stepCount: STORY_STEPS.length,
      navigate: _0x44f002
    });
  }
  async function _0x1fbff1(_0x37bae4, _0x286218 = "", _0xaec2d9 = null) {
    const _0x48d943 = _0xaec2d9?.disabled === true;
    _0xaec2d9?.classList?.add("is-opening");
    syncStoryAsyncButton(_0xaec2d9, true);
    if (_0xaec2d9 && "disabled" in _0xaec2d9) {
      _0xaec2d9.disabled = true;
    }
    try {
      if (hasPendingRuntimeManifestLoad()) {
        await waitForRuntimeManifestLoad({
          timeoutMs: 500
        });
      }
      return _0x4e50e6.navigate({
        view: "episode",
        episodeId: _0x37bae4,
        clipId: _0x286218
      });
    } finally {
      _0xaec2d9?.classList?.remove("is-opening");
      syncStoryAsyncButton(_0xaec2d9, false);
      if (_0xaec2d9 && "disabled" in _0xaec2d9) {
        _0xaec2d9.disabled = _0x48d943;
      }
    }
  }
  function _0x4b46d5(_0x5b85f6) {
    const _0x5648a3 = _0x5b85f6.dataset.storyModelKind;
    const _0x2119c4 = _0x5b85f6.dataset.storyModelOption;
    if (!_0x5648a3 || !_0x2119c4) {
      return;
    }
    _0x3ffeb1.models[_0x5648a3] = resolveStoryWorkspaceModelId(_0x5648a3, _0x2119c4);
    _0x3c4e04();
    _0xe5dd9c();
  }
  function _0x3faf44(_0x5eedfe) {
    return a1413_0x1ea432({
      event: _0x5eedfe,
      root: _0x3b5272,
      projects: _0x3ffeb1.projects,
      commands: {
        openProject: _0x82ecdd,
        renameProject(_0x5cde93) {
          _0x3ffeb1.openProjectMenuId = "";
          _0xe5dd9c();
          _0x573400(_0x5cde93);
        },
        duplicateProject: _0x39f3d7,
        setProjectArchived: _0x4b4979,
        requestDeleteProject(_0x1e37b3) {
          _0x3ffeb1.openProjectMenuId = "";
          _0x3ffeb1.pendingDeleteProjectId = _0x1e37b3;
          _0xe5dd9c();
        }
      }
    });
  }
  windowObject?.addEventListener?.("keydown", _0xf3cc42, true);
  const _0x5bb44c = bindWorkspaceEntityContextMenu(_0x3b5272, {
    resolveItems: _0x3faf44,
    beforeOpen() {
      if (!_0x3ffeb1.openProjectMenuId) {
        return;
      }
      _0x3ffeb1.openProjectMenuId = "";
      _0xe5dd9c();
    }
  });
  windowObject?.addEventListener?.("pointermove", _0x2033fd, true);
  windowObject?.addEventListener?.("pointerup", _0x3928e0, true);
  windowObject?.addEventListener?.("pointercancel", _0x3ce3f4, true);
  _0x3b5272.addEventListener("pointerdown", _0x4b5d63 => {
    _0x4b5d63.stopPropagation();
    _0x277232();
    if (!_0x4b5d63.target.closest?.("[data-story-clip-video-history-menu]")) {
      _0x3cb00d();
    }
    if (_0x5419a4(_0x4b5d63)) {
      return;
    }
    _0x3c8c92.begin(_0x4b5d63);
  });
  _0x3b5272.addEventListener("pointerover", _0x3a6434 => {
    const _0x18aa86 = _0x3a6434.target.closest?.("[data-story-library-appearance-target]");
    if (_0x18aa86 && (!_0x3a6434.relatedTarget || !_0x18aa86.contains(_0x3a6434.relatedTarget))) {
      _0x4635a9(_0x18aa86);
    }
    const _0x2e29e2 = _0x3a6434.target.closest?.(".story-clip-card-shell[data-story-video-history=\"true\"]");
    if (_0x2e29e2 && _0x3b5272.contains(_0x2e29e2) && (!_0x3a6434.relatedTarget || !_0x2e29e2.contains(_0x3a6434.relatedTarget))) {
      _0x58a3da(_0x2e29e2, _0x3a6434);
    }
    const _0x2a16de = getStoryAssetHoverCard(_0x3a6434.target);
    if (!_0x2a16de || !_0x3b5272.contains(_0x2a16de)) {
      return;
    }
    if (_0x3a6434.relatedTarget && _0x2a16de.contains(_0x3a6434.relatedTarget)) {
      return;
    }
    _0x58b043(_0x2a16de, _0x3a6434);
  });
  _0x3b5272.addEventListener("focusin", _0x2a3355 => {
    const _0x35b3a1 = _0x2a3355.target.closest?.("[data-story-library-appearance-target]");
    if (_0x35b3a1) {
      _0x4635a9(_0x35b3a1);
    }
  });
  _0x3b5272.addEventListener("pointermove", _0x5ad572 => {
    if (_0x3c8c92.update(_0x5ad572)) {
      return;
    }
    const _0x2a5d49 = getStoryAssetHoverCard(_0x5ad572.target);
    if (!_0x2a5d49) {
      if (_0x30d9c7) {
        _0x277232();
      }
      return;
    }
    _0x58b043(_0x2a5d49, _0x5ad572);
  });
  _0x3b5272.addEventListener("pointerup", _0x3ea168 => {
    _0x3c8c92.finish(_0x3ea168);
  });
  _0x3b5272.addEventListener("pointercancel", _0x296bc5 => {
    _0x3c8c92.finish(_0x296bc5, {
      cancelled: true
    });
  });
  _0x3b5272.addEventListener("lostpointercapture", _0x1dd1b3 => {
    if (_0x1ef3dc(_0x1dd1b3, {
      cancelled: true
    })) {
      return;
    }
    _0x458ddb = null;
    _0x3c8c92.finish(_0x1dd1b3, {
      cancelled: true
    });
  });
  _0x3b5272.addEventListener("dragstart", _0x151fb9 => {
    const _0x225e92 = _0x151fb9.target.closest?.("article[data-story-replication-episode-id]");
    if (_0x225e92) {
      if (!_0x151fb9.target.closest?.("[data-story-replication-drag-handle]")) {
        _0x151fb9.preventDefault();
        return;
      }
      _0x37672c = normalizeText(_0x225e92.dataset.storyReplicationEpisodeId);
      if (!_0x37672c) {
        _0x151fb9.preventDefault();
        return;
      }
      _0x31a289 = [...(_0x225e92.closest("[data-story-replication-grid]")?.querySelectorAll("article[data-story-replication-episode-id]") || [])].map(_0x331cdb => normalizeText(_0x331cdb.dataset.storyReplicationEpisodeId));
      _0x151fb9.dataTransfer?.setData?.("application/x-story-replication-episode", _0x37672c);
      if (_0x151fb9.dataTransfer) {
        _0x151fb9.dataTransfer.effectAllowed = "move";
      }
      _0x225e92.classList.add("is-reordering");
      _0x225e92.closest("[data-story-replication-grid]")?.classList.add("is-reordering");
      return;
    }
    const _0x2b5f03 = _0x151fb9.target.closest?.("[data-story-reference-asset]");
    if (_0x2b5f03) {
      if (_0x458ddb) {
        _0x151fb9.preventDefault();
        return;
      }
      const _0x4a6375 = normalizeText(_0x2b5f03.dataset.storyReferenceAsset);
      const _0x51f7a5 = Math.max(0, Math.trunc(Number(_0x2b5f03.dataset.storyReferenceAssetIndex) || 0));
      if (!writeStoryAssetDragData(_0x151fb9.dataTransfer, _0x4a6375, _0x51f7a5)) {
        return;
      }
      applyStoryAssetNativeDragPreview(_0x151fb9.dataTransfer, _0x2b5f03);
      _0x1b2c62 = _0x4a6375;
      _0x4929ba = _0x51f7a5;
      _0x2b5f03.classList.add("is-story-asset-dragging");
      _0x277232();
      return;
    }
    if (_0x151fb9.target.closest?.("[data-story-marquee-item]")) {
      _0x151fb9.preventDefault();
    }
  });
  _0x3b5272.addEventListener("dragend", () => {
    if (_0x37672c) {
      const _0x426ad4 = _0x3b5272.querySelector("[data-story-replication-grid]");
      if (_0x426ad4 && _0x31a289.length) {
        const _0x463d2a = new Map([..._0x426ad4.querySelectorAll("article[data-story-replication-episode-id]")].map(_0xcec37f => [normalizeText(_0xcec37f.dataset.storyReplicationEpisodeId), _0xcec37f]));
        _0x31a289.forEach(_0x4833b4 => {
          const _0x2998f2 = _0x463d2a.get(_0x4833b4);
          if (_0x2998f2) {
            _0x426ad4.appendChild(_0x2998f2);
          }
        });
      }
      _0x3b5272.querySelectorAll(".story-replication-card.is-reordering").forEach(_0x2ab7d5 => _0x2ab7d5.classList.remove("is-reordering"));
      _0x3b5272.querySelector("[data-story-replication-grid]")?.classList.remove("is-reordering");
      _0x37672c = "";
      _0x31a289 = [];
    }
    _0x276cd4();
  });
  _0x3b5272.addEventListener("keydown", _0x521f2c => {
    const _0x3e8256 = _0x521f2c.target.closest?.("[data-story-replication-drag-handle]");
    if (!_0x3e8256 || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(_0x521f2c.key)) {
      return;
    }
    const _0x23c220 = _0x3e8256.closest("article[data-story-replication-episode-id]");
    const _0x12e70b = normalizeText(_0x23c220?.dataset.storyReplicationEpisodeId);
    const _0x947877 = _0x3ffeb1.data.episodes.findIndex(_0x12d67c => normalizeText(_0x12d67c?.id) === _0x12e70b);
    const _0xa521e6 = ["ArrowUp", "ArrowLeft"].includes(_0x521f2c.key) ? -1 : 1;
    const _0x4e50fb = _0x947877 + _0xa521e6;
    if (_0x947877 < 0 || _0x4e50fb < 0 || _0x4e50fb >= _0x3ffeb1.data.episodes.length) {
      return;
    }
    _0x521f2c.preventDefault();
    _0x521f2c.stopPropagation();
    const _0x68c6d7 = _0x3ffeb1.data.episodes.map(_0x288bbe => _0x288bbe.id);
    [_0x68c6d7[_0x947877], _0x68c6d7[_0x4e50fb]] = [_0x68c6d7[_0x4e50fb], _0x68c6d7[_0x947877]];
    _0x3ffeb1.data.episodes = reorderStoryVideoReplicationEpisodes(_0x3ffeb1.data.episodes, _0x68c6d7);
    syncStoryVideoReplicationProject(_0x3ffeb1.data);
    const _0x15e2db = _0x23c220.closest("[data-story-replication-grid]");
    const _0x761921 = [...(_0x15e2db?.querySelectorAll("article[data-story-replication-episode-id]") || [])].find(_0x10a45e => normalizeText(_0x10a45e.dataset.storyReplicationEpisodeId) === _0x68c6d7[_0x947877]);
    if (_0x15e2db && _0x761921) {
      _0x15e2db.insertBefore(_0x23c220, _0xa521e6 < 0 ? _0x761921 : _0x761921.nextSibling);
      _0x3ffeb1.data.episodes.forEach((_0x34074e, _0x2f6f4b) => {
        const _0x29f1da = [..._0x15e2db.querySelectorAll("article[data-story-replication-episode-id]")].find(_0x517ff6 => normalizeText(_0x517ff6.dataset.storyReplicationEpisodeId) === _0x34074e.id);
        syncStoryVideoReplicationCardElement(_0x29f1da, _0x34074e, _0x2f6f4b);
      });
      _0x23c220.querySelector("[data-story-replication-drag-handle]")?.focus();
    }
    _0x3c4e04({
      immediate: true
    });
  });
  _0x3b5272.addEventListener("pointerout", _0x3d5886 => {
    const _0x20f075 = _0x3d5886.target.closest?.(".story-clip-card-shell[data-story-video-history=\"true\"]");
    if (_0x20f075 && (!_0x3d5886.relatedTarget || !_0x20f075.contains(_0x3d5886.relatedTarget)) && !_0x5a04a5?.contains(_0x3d5886.relatedTarget)) {
      _0x3cb00d({
        delayed: true
      });
    }
    const _0x24b458 = getStoryAssetHoverCard(_0x3d5886.target);
    if (!_0x24b458 || getStoryAssetHoverCardId(_0x24b458) !== _0x30d9c7) {
      return;
    }
    if (_0x3d5886.relatedTarget && _0x24b458.contains(_0x3d5886.relatedTarget)) {
      return;
    }
    _0x277232();
  });
  _0x3b5272.addEventListener("dblclick", _0x13eac8 => {
    _0x13eac8.stopPropagation();
    const _0x2aa996 = _0x13eac8.target.closest?.("img.story-asset-preview");
    if (!_0x2aa996 || !_0x3b5272.contains(_0x2aa996)) {
      return;
    }
    const _0x171e92 = normalizeText(_0x2aa996.currentSrc || _0x2aa996.getAttribute("src"));
    if (!isUsableImageUrl(_0x171e92)) {
      return;
    }
    _0x13eac8.preventDefault();
    openImagePreview(_0x171e92, {
      alt: _0x2aa996.alt || "素材图片预览"
    });
  });
  _0x3b5272.addEventListener("wheel", _0x3bdf84 => {
    _0x3bdf84.stopPropagation();
    if (_0x130cf5(_0x3bdf84)) {
      return;
    }
    if (_0x17f245(_0x3bdf84)) {
      return;
    }
    if (scrollStoryClipPromptHistoryWithWheel(_0x3bdf84)) {
      return;
    }
    if (scrollStoryClipStripWithWheel(_0x3bdf84)) {
      return;
    }
    if (shouldPreserveStoryWorkspaceNestedWheel(_0x3bdf84.target)) {
      return;
    }
    const _0x8cb68 = _0x4bf4f6.querySelector(".story-page.is-current");
    if (!_0x8cb68) {
      return;
    }
    _0x3bdf84.preventDefault();
    _0x8cb68.scrollTop += Number(_0x3bdf84.deltaY || 0);
    _0x8cb68.scrollLeft += Number(_0x3bdf84.deltaX || 0);
  }, {
    passive: false
  });
  _0x4bf4f6.addEventListener("scroll", _0x221774 => {
    const _0x3af248 = _0x221774.target;
    if (!_0x3af248?.matches?.(".story-page.is-current")) {
      return;
    }
    const _0x3052c9 = _0x9d8401 || _0x6ad455();
    _0x3ffeb1.pageScrollPositions = {
      ...(_0x3ffeb1.pageScrollPositions || {}),
      [_0x3052c9]: {
        top: Math.max(0, Number(_0x3af248.scrollTop) || 0),
        left: Math.max(0, Number(_0x3af248.scrollLeft) || 0)
      }
    };
    _0x3c4e04();
  }, true);
  _0x3b5272.addEventListener("keydown", _0xaa2eb0 => {
    const _0x57483d = _0xaa2eb0.target.closest?.("[data-story-custom-episode-count-input]");
    if (_0x57483d) {
      if (_0xaa2eb0.key === "Enter") {
        _0xaa2eb0.preventDefault();
        _0xaa2eb0.stopPropagation();
        _0x5b40bc(_0x57483d);
      } else if (_0xaa2eb0.key === "Escape") {
        _0xaa2eb0.preventDefault();
        _0xaa2eb0.stopPropagation();
        _0x257c64(_0x57483d, normalizeStoryEpisodeCount(_0x3ffeb1.data.project?.planning?.episodeCount));
      }
      return;
    }
    const _0x3a7def = _0xaa2eb0.target.closest?.("[data-story-action=\"toggle-clip-adjustment-mode\"]");
    if (_0x3a7def && ["ArrowDown", "ArrowUp"].includes(_0xaa2eb0.key)) {
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      _0x3ffeb1.clipAdjustmentPromptModeOpen = true;
      _0x228c7a({
        focus: "selected"
      });
      return;
    }
    const _0x8aad7b = _0xaa2eb0.target.closest?.("[data-story-clip-adjustment-mode-option]");
    if (_0x8aad7b && ["ArrowDown", "ArrowUp", "Home", "End"].includes(_0xaa2eb0.key)) {
      const _0x2611ff = _0x8aad7b.closest("[role=listbox]");
      const _0x1dfba1 = [...(_0x2611ff?.querySelectorAll("[data-story-clip-adjustment-mode-option]") || [])];
      const _0x52152c = Math.max(0, _0x1dfba1.indexOf(_0x8aad7b));
      const _0x420a57 = _0xaa2eb0.key === "Home" ? 0 : _0xaa2eb0.key === "End" ? _0x1dfba1.length - 1 : (_0x52152c + (_0xaa2eb0.key === "ArrowDown" ? 1 : -1) + _0x1dfba1.length) % _0x1dfba1.length;
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      _0x1dfba1[_0x420a57]?.focus();
      return;
    }
    if (_0xaa2eb0.key === "Enter" && _0xaa2eb0.target.matches?.("[data-story-clip-adjustment-instruction]")) {
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      _0x39db37();
      return;
    }
    if (_0x33004c(_0xaa2eb0)) {
      return;
    }
    if (_0xf3cc42(_0xaa2eb0)) {
      return;
    }
    if (_0xaa2eb0.key === "Escape") {
      if (_0x3ffeb1.clipPromptHistoryOpen) {
        _0xaa2eb0.preventDefault();
        _0xaa2eb0.stopPropagation();
        _0x3ffeb1.clipPromptHistoryOpen = false;
        _0x2c3482({
          focus: "trigger"
        });
        return;
      }
      if (_0x3ffeb1.clipAdjustmentPromptModeOpen) {
        _0xaa2eb0.preventDefault();
        _0xaa2eb0.stopPropagation();
        _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
        _0x228c7a({
          focus: "trigger"
        });
        return;
      }
      _0x3c8c92.cancel();
      _0x146793();
      _0x385608();
      _0x15093f();
      _0x5c09e0();
    }
    const _0x24d8b6 = _0xaa2eb0.target.closest?.("[data-story-appearance-wheel=\"true\"]");
    if (_0x24d8b6 && ["ArrowLeft", "ArrowRight"].includes(_0xaa2eb0.key)) {
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      _0x2639e0(_0xaa2eb0.key === "ArrowRight" ? 1 : -1);
      return;
    }
    const _0x4587a2 = _0xaa2eb0.target.closest?.("[data-story-clip-navigation=\"true\"]");
    if (_0x4587a2 && ["ArrowLeft", "ArrowRight"].includes(_0xaa2eb0.key)) {
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      _0x1d758b(_0xaa2eb0.key === "ArrowRight" ? 1 : -1);
      return;
    }
    const _0x67f118 = _0xaa2eb0.target.closest?.("[data-story-assets-splitter]");
    if (_0x67f118 && ["ArrowLeft", "ArrowRight"].includes(_0xaa2eb0.key)) {
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      _0x169b59(_0x3ffeb1.assetSplitRatio + (_0xaa2eb0.key === "ArrowLeft" ? -2 : 2), {
        persist: true
      });
      return;
    }
    const _0x37b648 = _0xaa2eb0.target.closest?.("[data-story-episode-splitter]");
    if (_0x37b648 && ["ArrowLeft", "ArrowRight"].includes(_0xaa2eb0.key)) {
      _0xaa2eb0.preventDefault();
      _0xaa2eb0.stopPropagation();
      const _0x1495ec = _0xaa2eb0.key === "ArrowLeft" ? -2 : 2;
      if (_0x37b648.dataset.storyEpisodeSplitter === "assets") {
        _0x15d395(_0x3ffeb1.episodeAssetPanelRatio + _0x1495ec, _0x3ffeb1.episodeEditorPanelRatio, {
          persist: true
        });
      } else {
        _0x15d395(_0x3ffeb1.episodeAssetPanelRatio, _0x3ffeb1.episodeEditorPanelRatio + _0x1495ec, {
          persist: true
        });
      }
      return;
    }
    if (!_0x4f8626 || _0x3ffeb1.view !== "home") {
      return;
    }
    if (!isStoryGenerateShortcut(_0xaa2eb0)) {
      return;
    }
    _0xaa2eb0.preventDefault();
    _0xaa2eb0.stopPropagation();
    _0x3df590();
  });
  _0x3b5272.addEventListener("toggle", _0x1b2832 => {
    const _0x29e265 = _0x1b2832.target;
    if (!_0x29e265?.matches?.("details[data-story-outline-section]")) {
      return;
    }
    const _0x4e7ef8 = _0x29e265.dataset.storyOutlineSection;
    _0x3ffeb1.outlineSectionOpenState = {
      ...(_0x3ffeb1.outlineSectionOpenState || {}),
      [_0x4e7ef8]: _0x29e265.open
    };
    _0x3c4e04();
    if (!_0x29e265.open) {
      return;
    }
    if (!_0x3ffeb1.scriptGenerationFocusMode || !["original", "summary"].includes(_0x4e7ef8)) {
      return;
    }
    if (["writing-episode-script", "writing-episode-scripts"].includes(_0x3ffeb1.storyPlanningOperation)) {
      return;
    }
    _0x3ffeb1.scriptGenerationFocusMode = false;
  }, true);
  _0x3b5272.addEventListener("error", handleWorkspaceAssetLibraryImageError, true);
  _0x3b5272.addEventListener("click", _0x2c97a7 => {
    if (_0x3c8c92.consumeClick(_0x2c97a7)) {
      return;
    }
    if (_0x198b97(_0x2c97a7)) {
      return;
    }
    const _0x1851aa = _0x3b5272.querySelector("[data-story-custom-episode-count-input]");
    const _0xddce0e = normalizeText(_0x1851aa?.value) || _0x1851aa?.closest(".story-episode-count-custom-editor")?.classList.contains("is-selected");
    if (_0x1851aa && _0xddce0e && _0x2c97a7.target.closest("[data-story-action=\"generate-story\"]") && !_0x5b40bc(_0x1851aa)) {
      _0x2c97a7.preventDefault();
      return;
    }
    if (_0x3ffeb1.openProjectMenuId && !_0x2c97a7.target.closest("[data-story-project-menu-wrap]")) {
      _0x1d7b42("");
    }
    if (!_0x2c97a7.target.closest("[data-story-project-sort-wrap]")) {
      _0x2255e5();
    }
    if (!_0x2c97a7.target.closest(".story-home-param-picker")) {
      _0x385608();
    }
    if (!_0x2c97a7.target.closest(".story-asset-batch-menu-wrap, [data-story-library-target-menu], [data-story-library-appearance-menu]")) {
      _0x15093f();
    }
    if (!_0x2c97a7.target.closest(".story-canvas-sync-menu-wrap")) {
      _0x5c09e0();
    }
    if (!_0x2c97a7.target.closest(".story-character-voice-history-wrap")) {
      _0x1e92bb();
    }
    const _0x41abb0 = _0x2c97a7.target.closest("[data-story-select-script-episode]");
    if (_0x41abb0 && (_0x3ffeb1.scriptSelectionMode || _0x2c97a7.shiftKey === true) && !_0x2c97a7.target.closest("[data-story-action]")) {
      _0x2c97a7.preventDefault();
      _0x3ffeb1.scriptSelectionMode = true;
      _0x15d272(_0x41abb0.dataset.storySelectScriptEpisode);
      return;
    }
    const _0x510ab4 = _0x2c97a7.target.closest("[data-story-home-param-trigger]");
    if (_0x510ab4) {
      const _0xdd1d71 = _0x510ab4.closest(".story-home-param-picker");
      const _0x57fd5b = !_0xdd1d71.classList.contains("is-open");
      _0x146793();
      _0x385608(_0xdd1d71);
      _0xdd1d71.classList.toggle("is-open", _0x57fd5b);
      _0x510ab4.setAttribute("aria-expanded", String(_0x57fd5b));
      return;
    }
    const _0x103739 = _0x2c97a7.target.closest("[data-story-asset-preset-option]");
    if (_0x103739) {
      if (_0x103739.dataset.storyAssetPresetKind === "scene") {
        _0x3ffeb1.sceneAssetPromptPresetId = getStorySceneAssetPromptPreset(_0x103739.dataset.storyAssetPresetOption).id;
      } else {
        _0x3ffeb1.assetPromptPresetId = getStoryCharacterAssetPromptPreset(_0x103739.dataset.storyAssetPresetOption).id;
      }
      _0x385608();
      _0xe5dd9c();
      return;
    }
    const _0x2c3716 = _0x2c97a7.target.closest("[data-story-aspect-ratio-option]");
    if (_0x2c3716) {
      _0x377b58(_0x2c3716.dataset.storyAspectRatioOption);
      return;
    }
    const _0x53243e = _0x2c97a7.target.closest("[data-story-planning-option]");
    if (_0x53243e) {
      _0xfbf476(_0x53243e.dataset.storyPlanningField, _0x53243e.dataset.storyPlanningOption);
      return;
    }
    const _0x21f320 = _0x2c97a7.target.closest("[data-story-style-option]");
    if (_0x21f320) {
      _0x2f3ae6(_0x21f320.dataset.storyStyleOption);
      return;
    }
    const _0x49fc1a = _0x2c97a7.target.closest("[data-story-style-category]");
    if (_0x49fc1a) {
      const _0x46793b = _0x49fc1a.closest(".story-style-picker");
      _0x46793b?.querySelectorAll("[data-story-style-category]").forEach(_0x29f1f5 => {
        const _0xb25c35 = _0x29f1f5 === _0x49fc1a;
        _0x29f1f5.classList.toggle("is-active", _0xb25c35);
        _0x29f1f5.setAttribute("aria-selected", String(_0xb25c35));
      });
      _0x26472d(_0x46793b);
      return;
    }
    const _0x4acd03 = _0x2c97a7.target.closest("[data-story-style-custom]");
    if (_0x4acd03) {
      _0x33f097(_0x4acd03.closest(".story-style-picker"), true);
      return;
    }
    const _0x1c0756 = _0x2c97a7.target.closest("[data-story-style-custom-back]");
    if (_0x1c0756) {
      _0x33f097(_0x1c0756.closest(".story-style-picker"), false);
      return;
    }
    const _0x21c1d2 = _0x2c97a7.target.closest("[data-story-style-custom-confirm]");
    if (_0x21c1d2) {
      _0x205585(_0x21c1d2.closest(".story-style-picker")?.querySelector("[data-story-style-custom-input]"));
      return;
    }
    const _0x4f5af3 = _0x2c97a7.target.closest("[data-story-model-option]");
    if (_0x4f5af3) {
      _0x4b46d5(_0x4f5af3);
      return;
    }
    const _0x388f57 = _0x2c97a7.target.closest("[data-story-model-trigger]");
    if (_0x388f57) {
      const _0x2481ca = _0x388f57.closest(".story-model-picker");
      const _0x14ba90 = !_0x2481ca.classList.contains("is-open");
      _0x385608();
      _0x146793(_0x2481ca);
      _0x2481ca.classList.toggle("is-open", _0x14ba90);
      _0x388f57.setAttribute("aria-expanded", String(_0x14ba90));
      if (_0x14ba90) {
        _0x2481ca.querySelector("[data-story-model-search-input]")?.focus();
      }
      return;
    }
    const _0x308447 = _0x2c97a7.target.closest("[data-story-home-tab]");
    if (_0x308447) {
      _0x4a9272(_0x308447.dataset.storyHomeTab);
      return;
    }
    const _0x516c60 = _0x2c97a7.target.closest("[data-story-step]");
    if (_0x516c60) {
      _0x44f002(_0x516c60.dataset.storyStep);
      return;
    }
    if (_0x3ffeb1.assetLibraryDisclosure?.toggleFromTarget(_0x2c97a7.target)) {
      return;
    }
    const _0x51046f = _0x2c97a7.target.closest("[data-story-asset-filter]");
    if (_0x51046f) {
      const _0x9349ba = normalizeText(_0x51046f.dataset.storyAssetFilter);
      const _0xaf69ed = getStoryAssetTabTransitionDirection(_0x3ffeb1.assetFilter, _0x9349ba);
      if (_0xaf69ed === "none") {
        return;
      }
      _0x3ffeb1.characterVoiceEditor = null;
      _0x3ffeb1.characterVoicePanelMotion = "";
      _0x3ffeb1.pendingCharacterVoiceAssetId = "";
      _0x3ffeb1.assetFilter = _0x9349ba;
      _0x3ffeb1.selectedAssetId = "";
      _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
      _0x3ffeb1.assetSelectionMode = false;
      _0x3ffeb1.selectedAssetIds = [];
      const _0x5a9f43 = _0x4452c4()?.querySelector(".story-asset-tabs");
      if (_0x5a9f43) {
        _0x5a9f43.dataset.activeTab = _0x9349ba;
        _0x5a9f43.querySelectorAll("[data-story-asset-filter]").forEach(_0x209d0e => {
          const _0x50bd86 = _0x209d0e.dataset.storyAssetFilter === _0x9349ba;
          _0x209d0e.classList.toggle("is-active", _0x50bd86);
          _0x209d0e.setAttribute("aria-selected", String(_0x50bd86));
          _0x209d0e.tabIndex = _0x50bd86 ? 0 : -1;
        });
      }
      _0xe5dd9c({
        direction: _0xaf69ed,
        updateToolbar: false,
        transitionScope: "asset-content"
      });
      _0x3c4e04();
      return;
    }
    const _0x479169 = _0x2c97a7.target.closest("[data-story-episode-asset-tab]");
    if (_0x479169) {
      _0x3ffeb1.episodeAssetRailTab = normalizeStoryEpisodeAssetRailTab(_0x479169.dataset.storyEpisodeAssetTab);
      if (!_0x3ec4f9()) {
        _0xe5dd9c();
      }
      _0x3c4e04();
      return;
    }
    const _0x5af673 = _0x2c97a7.target.closest("[data-story-asset-id]");
    if (_0x5af673) {
      const _0x8afaf4 = _0x5af673.dataset.storyAssetId;
      const _0x50f86e = _0x3ffeb1.selectedAssetId;
      const _0x9e3f64 = _0x3ffeb1.selectedAssetId !== _0x8afaf4;
      const _0x279bd6 = Boolean(_0x3ffeb1.characterVoiceEditor);
      if (_0x9e3f64) {
        updateStoryAssetPromptFromEditor(_0x3ffeb1, _0x4452c4()?.querySelector?.("[data-story-asset-prompt][contenteditable=\"true\"]"));
        _0x493da1();
        _0x3ffeb1.characterVoiceEditor = null;
        _0x3ffeb1.characterVoicePanelMotion = "";
        _0x3ffeb1.pendingCharacterVoiceAssetId = "";
        _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
      }
      _0x3ffeb1.selectedAssetId = _0x8afaf4;
      if (!_0x3ffeb1.isBatchGenerating) {
        const _0xbad72f = _0x3ffeb1.assetFilter === "library" ? getVisibleStoryAssets(_0x3ffeb1).find(_0x1ce3c9 => _0x1ce3c9.id === _0x8afaf4) : null;
        const _0x2def87 = _0x3ffeb1.assetFilter !== "library" || Boolean(normalizeText(_0xbad72f?.mediaKind).toLowerCase() === "image" && normalizeText(_0xbad72f?.sourceUrl || _0xbad72f?.imageUrl));
        const _0xcc4591 = resolveWorkspaceCardMultiSelection({
          selectedIds: _0x3ffeb1.selectedAssetIds,
          itemId: _0x8afaf4,
          activeItemId: _0x50f86e,
          selectionMode: _0x3ffeb1.assetSelectionMode,
          shiftKey: _0x2c97a7.shiftKey === true,
          enabled: _0x2def87
        });
        if (_0xcc4591.handled) {
          _0x3ffeb1.assetSelectionMode = _0xcc4591.selectionMode;
          _0x3ffeb1.selectedAssetIds = _0xcc4591.selectedIds;
        }
      }
      if (!_0x3ffeb1.isBatchGenerating || _0x279bd6 || _0x9e3f64 && !_0x7ca197()) {
        _0xe5dd9c();
      }
      _0x3c4e04();
      return;
    }
    const _0x41dc28 = _0x2c97a7.target.closest("[data-story-select-episode]");
    if (_0x41dc28 && (_0x3ffeb1.episodeSelectionMode || _0x2c97a7.shiftKey === true)) {
      const _0x518cf1 = _0x41dc28.dataset.storySelectEpisode;
      if (getStoryEpisodeGenerationControlState(_0x3ffeb1, _0x518cf1).disabled) {
        return;
      }
      const _0x1af202 = resolveWorkspaceCardMultiSelection({
        selectedIds: _0x3ffeb1.selectedEpisodeIds,
        itemId: _0x518cf1,
        activeItemId: _0x3ffeb1.selectedEpisodeId,
        selectionMode: _0x3ffeb1.episodeSelectionMode,
        shiftKey: _0x2c97a7.shiftKey === true
      });
      if (_0x1af202.handled) {
        _0x3ffeb1.episodeSelectionMode = _0x1af202.selectionMode;
        _0x3ffeb1.selectedEpisodeIds = _0x1af202.selectedIds;
        _0xe5dd9c();
      }
      return;
    }
    const _0x4233bd = _0x2c97a7.target.closest("[data-story-open-episode]");
    if (_0x4233bd) {
      const _0x22ce37 = _0x4233bd.dataset.storyOpenEpisode;
      if (getStoryEpisodeGenerationControlState(_0x3ffeb1, _0x22ce37).disabled) {
        return;
      }
      _0x1fbff1(_0x22ce37, "", _0x4233bd);
      return;
    }
    const _0x1312ed = _0x2c97a7.target.closest("[data-story-insert-after-clip-id]");
    if (_0x1312ed) {
      if (_0x3ffeb1.clipSelectionMode) {
        return;
      }
      const _0x457ed5 = getSelectedEpisode(_0x3ffeb1);
      const _0x5085c7 = insertStoryEpisodeClip(_0x457ed5, _0x1312ed.dataset.storyInsertAfterClipId, {
        promptMode: _0x457ed5?.promptMode || _0x3ffeb1.data.project?.planning?.promptMode
      });
      const _0x12db75 = _0x3ffeb1.data.episodes.findIndex(_0xd1c2c0 => _0xd1c2c0.id === _0x457ed5?.id);
      if (!_0x5085c7 || _0x12db75 < 0) {
        _0x1ce8f7("新增片段失败，请刷新后重试。", "error");
        return;
      }
      _0x3ffeb1.data.episodes[_0x12db75] = _0x5085c7.episode;
      _0x155859({
        close: true
      });
      _0x3ffeb1.selectedClipId = _0x5085c7.clip.id;
      _0x3ffeb1.pendingDeleteClipId = "";
      _0x3ffeb1.selectedClipGenerationIds = [];
      _0x1bbd64(_0x5085c7.clip);
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c();
      _0x1ce8f7("已新增片段。", "success");
      return;
    }
    const _0x8f42ac = _0x2c97a7.target.closest(".story-clip-card[data-story-clip-id]");
    if (_0x8f42ac) {
      const _0x4db6b1 = _0x8f42ac.dataset.storyClipId;
      const _0x2cc926 = resolveWorkspaceCardMultiSelection({
        selectedIds: _0x3ffeb1.selectedClipGenerationIds,
        itemId: _0x4db6b1,
        activeItemId: _0x3ffeb1.selectedClipId,
        selectionMode: _0x3ffeb1.clipSelectionMode,
        shiftKey: _0x2c97a7.shiftKey === true
      });
      if (_0x2cc926.handled) {
        const _0x45e057 = storyClipProduction.getGenerationState(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1));
        if (_0x45e057.isBatchGenerating || _0x45e057.generatingClipIds.includes(normalizeText(_0x4db6b1))) {
          return;
        }
        _0x3ffeb1.pendingDeleteClipId = "";
        _0x3ffeb1.clipSelectionMode = _0x2cc926.selectionMode;
        _0x3ffeb1.selectedClipGenerationIds = _0x2cc926.selectedIds;
        _0x5c09e0();
        _0x88077f();
      } else {
        const _0x2cdd10 = getSelectedEpisode(_0x3ffeb1);
        const _0x1ab3d7 = Array.isArray(_0x2cdd10?.clips) ? _0x2cdd10.clips : [];
        const _0x1f2c8 = _0x1ab3d7.findIndex(_0x438348 => _0x438348.id === _0x3ffeb1.selectedClipId);
        const _0xf80bb3 = _0x1ab3d7.findIndex(_0x525289 => _0x525289.id === _0x4db6b1);
        const _0x2ed4f9 = _0x3ffeb1.selectedClipId !== _0x4db6b1;
        const _0x52d432 = _0xf80bb3 >= 0 && _0xf80bb3 < _0x1f2c8 ? "previous" : "next";
        _0x3ffeb1.pendingDeleteClipId = "";
        if (_0x2ed4f9) {
          _0x155859({
            close: true
          });
        }
        _0x3ffeb1.selectedClipId = _0x4db6b1;
        _0x1bbd64(getSelectedClip(_0x3ffeb1, _0x2cdd10));
        if (_0x2ed4f9) {
          if (!_0xafdba0(_0x52d432)) {
            _0xe5dd9c();
          }
        } else {
          _0x88077f();
        }
        _0x3c4e04();
      }
      return;
    }
    const _0x43b197 = _0x2c97a7.target.closest("[data-story-clip-prompt-surface] .ref-thumb-delete");
    if (_0x43b197) {
      const _0x1fca01 = _0x43b197.closest("[data-slot]");
      if (!_0x1fca01) {
        return;
      }
      _0x36b21d({
        kind: _0x1fca01.dataset.kind,
        slotId: _0x1fca01.dataset.slot,
        value: null
      });
      return;
    }
    const _0x1fcd12 = _0x2c97a7.target.closest("[data-story-clip-prompt-surface] .ref-upload-slot[data-slot]");
    if (_0x1fcd12) {
      const _0x421f98 = _0x1fcd12.dataset.kind;
      const _0xa2e47c = createStoryProjectTaskToken(_0x3ffeb1);
      const _0x4b6a1a = getSelectedEpisode(_0x3ffeb1);
      const _0x84261d = getSelectedClip(_0x3ffeb1, _0x4b6a1a);
      _0x3ffeb1.pendingClipInput = {
        kind: _0x421f98,
        slotId: _0x1fcd12.dataset.slot
      };
      _0x566b13 = {
        ..._0x3ffeb1.pendingClipInput,
        projectToken: _0xa2e47c,
        episodeId: _0x4b6a1a?.id,
        clipId: _0x84261d?.id
      };
      _0x334e5b.accept = _0x421f98 === "image" ? "image/*" : _0x421f98 === "audio" ? "audio/*" : "video/*";
      _0x334e5b.click();
      return;
    }
    const _0x275c6f = _0x2c97a7.target.closest("[data-story-clip-prompt-surface] .prompt-attachment-btn");
    if (_0x275c6f) {
      const _0x2b5b8b = getSelectedEpisode(_0x3ffeb1);
      const _0x298250 = getSelectedClip(_0x3ffeb1, _0x2b5b8b);
      const _0x5af327 = buildStoryClipInputSlotViewModel({
        modelId: _0x3ffeb1.models.video,
        provider: _0x3ffeb1.videoProvider,
        inputs: _0x298250?.inputs
      });
      const _0x3311f2 = _0x5af327.groups.filter(_0x46663c => _0x46663c.slots.some(_0x5d8198 => !_0x5d8198.input?.url)).map(_0x44fdc => _0x44fdc.kind);
      if (!_0x3311f2.length) {
        _0x1ce8f7("当前视频模型的入参槽已满。", "warn");
        return;
      }
      const _0x1aa31c = createStoryProjectTaskToken(_0x3ffeb1);
      _0x3ffeb1.pendingClipInput = {
        kind: "",
        slotId: ""
      };
      _0x566b13 = {
        ..._0x3ffeb1.pendingClipInput,
        projectToken: _0x1aa31c,
        episodeId: _0x2b5b8b?.id,
        clipId: _0x298250?.id
      };
      _0x334e5b.accept = _0x3311f2.map(_0x2d27d3 => _0x2d27d3 + "/*").join(",");
      _0x334e5b.click();
      return;
    }
    const _0x5f12a2 = _0x2c97a7.target.closest("[data-story-script-mode]");
    if (_0x5f12a2) {
      _0x1f081f(getNextStoryScriptMode(_0x3ffeb1.scriptMode));
      return;
    }
    const _0x3a3db7 = _0x2c97a7.target.closest("[data-story-asset-batch-mode]");
    if (_0x3a3db7) {
      _0x15093f();
      _0xe75f58(_0x3a3db7.dataset.storyAssetBatchMode);
      return;
    }
    const _0x2eb0f8 = _0x2c97a7.target.closest("[data-story-library-target-asset-id]");
    if (_0x2eb0f8) {
      _0x1d0de9(_0x2eb0f8.dataset.storyLibraryTargetAssetId, _0x2eb0f8.dataset.storyLibraryTargetAppearanceId, _0x2eb0f8.dataset.storyLibraryTargetCreateAppearance === "true");
      return;
    }
    const _0x17f426 = _0x2c97a7.target.closest("[data-story-library-appearance-target]");
    if (_0x17f426) {
      _0x4635a9(_0x17f426);
      return;
    }
    const _0x4469d9 = _0x2c97a7.target.closest("[data-story-library-target-kind]");
    if (_0x4469d9) {
      _0x25fdd6(_0x4469d9);
      return;
    }
    const _0x39d9e5 = _0x2c97a7.target.closest("[data-story-character-voice-history-play]");
    if (_0x39d9e5) {
      _0x54d343(_0x3ffeb1.characterVoiceEditor?.assetId, _0x39d9e5.dataset.storyCharacterVoiceHistoryPlay);
      return;
    }
    const _0x579c4b = _0x2c97a7.target.closest("[data-story-character-voice-history-restore]");
    if (_0x579c4b) {
      _0x58254f(_0x3ffeb1.characterVoiceEditor?.assetId, _0x579c4b.dataset.storyCharacterVoiceHistoryRestore);
      return;
    }
    const _0x27d954 = _0x2c97a7.target.closest("[data-story-open-project]");
    if (_0x27d954 && !_0x2c97a7.target.closest("[data-story-action]")) {
      if (_0x2c97a7.target.closest("[data-story-project-title]")) {
        return;
      }
      _0x82ecdd(_0x27d954.dataset.storyOpenProject);
      return;
    }
    const _0x26357c = _0x2c97a7.target.closest("[data-story-action]");
    const _0x16fefa = _0x26357c?.dataset.storyAction;
    if (!_0x16fefa) {
      return;
    }
    if (["request-inline-regeneration", "confirm-inline-regeneration", "cancel-inline-regeneration", "request-delete-asset-appearance", "confirm-delete-asset-appearance", "cancel-delete-asset-appearance"].includes(_0x16fefa)) {
      _0x2c97a7.preventDefault();
      _0x2c97a7.stopPropagation();
    }
    if (_0x16fefa === "toggle-clip-adjustment") {
      _0x3ffeb1.clipAdjustmentOpen = !_0x3ffeb1.clipAdjustmentOpen;
      _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      _0x3ffeb1.clipPromptHistoryOpen = false;
      _0x2c3482();
      if (_0x3ffeb1.clipAdjustmentOpen) {
        const _0xf44865 = getSelectedEpisode(_0x3ffeb1);
        const _0x3291d4 = getSelectedClip(_0x3ffeb1, _0xf44865);
        _0x3ffeb1.clipAdjustmentPromptMode = normalizeStoryPromptMode(_0x3291d4?.promptMode || _0xf44865?.promptMode || _0x3ffeb1.data.project?.planning?.promptMode, {
          allowDeveloperModes: true
        });
      }
      _0x62a3ea();
      if (_0x3ffeb1.clipAdjustmentOpen) {
        _0x3b5272.querySelector("[data-story-clip-adjustment-instruction]")?.focus();
      }
    } else if (_0x16fefa === "toggle-clip-prompt-history") {
      _0x3ffeb1.clipPromptHistoryOpen = !_0x3ffeb1.clipPromptHistoryOpen;
      const _0x316ac0 = _0x3ffeb1.clipAdjustmentOpen === true;
      _0x3ffeb1.clipAdjustmentOpen = false;
      _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      if (_0x316ac0) {
        _0x62a3ea();
      }
      _0x2c3482({
        focus: _0x3ffeb1.clipPromptHistoryOpen ? "first" : "trigger"
      });
    } else if (_0x16fefa === "restore-clip-prompt-history") {
      _0x8f72c9(_0x26357c.dataset.storyClipPromptHistoryId);
    } else if (_0x16fefa === "toggle-clip-adjustment-mode") {
      _0x3ffeb1.clipAdjustmentPromptModeOpen = !_0x3ffeb1.clipAdjustmentPromptModeOpen;
      _0x228c7a({
        focus: _0x3ffeb1.clipAdjustmentPromptModeOpen ? "selected" : "trigger"
      });
    } else if (_0x16fefa === "select-clip-adjustment-mode") {
      _0x3ffeb1.clipAdjustmentPromptMode = normalizeStoryPromptMode(_0x26357c.dataset.storyClipAdjustmentModeOption, {
        allowDeveloperModes: true
      });
      _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      _0x228c7a({
        focus: "instruction",
        updateSelection: true
      });
    } else if (_0x16fefa === "generate-clip-adjustment") {
      _0x39db37();
    } else if (_0x16fefa === "regenerate-clip-adjustment") {
      _0x515c9c();
    } else if (_0x16fefa === "use-ai-clip-prompt") {
      _0x43ce84();
    } else if (_0x16fefa === "keep-current-clip-prompt") {
      _0xc8c47b();
    } else if (_0x16fefa === "choose-script" || _0x16fefa === "choose-rewrite-script") {
      _0x125f3d?.click();
    } else if (_0x16fefa === "remove-rewrite-script") {
      clearStoryHomeReferenceScript(_0x3ffeb1);
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c();
      _0x3b5272.querySelector("[data-story-idea-input]")?.focus();
    } else if (_0x16fefa === "choose-replication-videos") {
      _0x26af39 = "";
      _0x370723?.click();
    } else if (_0x16fefa === "reupload-replication-video") {
      const _0x25dcb8 = normalizeText(_0x26357c.dataset.storyReplicationEpisodeId);
      const _0x3e36f2 = findStoryReplicationEpisode(_0x3ffeb1.data, _0x25dcb8);
      const _0x5db7b2 = normalizeText(_0x3ffeb1.data?.project?.id);
      if (_0x3e36f2 && _0x3ffeb1.data?.project?.sourceMode === "video-replication" && _0x3e36f2.replication?.status === "failed" && !normalizeText(_0x3e36f2.sourceVideo?.videoRef)) {
        if (_0x5f32e0.has(_0x5db7b2)) {
          _0x1ce8f7("请等待当前视频解析完成后再重新上传。", "info");
        } else {
          _0x26af39 = _0x25dcb8;
          _0x370723?.click();
        }
      }
    } else if (_0x16fefa === "remove-replication-video") {
      const _0xe536ba = Math.trunc(Number(_0x26357c.dataset.storyReplicationFileIndex));
      if (_0xe536ba >= 0 && _0xe536ba < _0x3ffeb1.replicationSourceFiles.length) {
        _0x88a7d9(_0x3ffeb1.replicationSourcePreviewUrls[_0xe536ba]);
        _0x3ffeb1.replicationSourceFiles = _0x3ffeb1.replicationSourceFiles.filter((_0x2670cb, _0x94324c) => _0x94324c !== _0xe536ba);
        _0x3ffeb1.replicationSourcePreviewUrls = _0x3ffeb1.replicationSourcePreviewUrls.filter((_0x437fb7, _0x44b3f) => _0x44b3f !== _0xe536ba);
        const _0x3276b9 = _0x4bf4f6.querySelector(".story-page.is-current .story-home-composer-body");
        if (_0x3276b9) {
          _0x3276b9.innerHTML = renderStoryHomeComposerBody(_0x3ffeb1);
        }
        _0x54ad39();
      }
    } else if (_0x16fefa === "paste-script") {
      _0x3ffeb1.uploadInputMode = "paste";
      _0x3ffeb1.scriptFileName = normalizeText(_0x3ffeb1.scriptText) ? "粘贴文本" : "";
      _0xe5dd9c();
      _0x3b5272.querySelector("[data-story-paste-input]")?.focus();
    } else if (_0x16fefa === "generate-story") {
      _0x3df590();
    } else if (_0x16fefa === "preview-replication-video") {
      const _0x5cc1df = findStoryReplicationEpisode(_0x3ffeb1.data, _0x26357c.dataset.storyReplicationEpisodeId);
      const _0xd22a7b = normalizeText(_0x5cc1df?.sourceVideo?.videoRef);
      if (_0xd22a7b) {
        openVideoPreview(_0xd22a7b, {
          ariaLabel: (normalizeText(_0x5cc1df?.title) || "原视频") + "预览",
          loop: false
        });
      }
    } else if (_0x16fefa === "retry-replication-analysis") {
      _0x4bfad3();
    } else if (_0x16fefa === "localize-replication-assets") {
      _0xf1b5ce({
        advance: true
      });
    } else if (_0x16fefa === "request-inline-regeneration") {
      if (_0x3ffeb1.storyPlanningOperation || _0x3ffeb1.isGeneratingStory) {
        return;
      }
      const _0x53bbcc = normalizeText(_0x26357c.dataset.storyRegenerationTarget);
      if (_0x3ffeb1.data?.project?.outlineStatus === "stale" && _0x53bbcc.startsWith("episode-script:")) {
        _0x1ce8f7("故事蓝图已修改，请先重新运行分集规划。", "warn");
        return;
      }
      _0x3ffeb1.pendingRegenerationTarget = _0x53bbcc;
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-inline-regeneration") {
      _0x3ffeb1.pendingRegenerationTarget = "";
      _0xe5dd9c();
    } else if (_0x16fefa === "confirm-inline-regeneration") {
      const _0x44cd8f = normalizeText(_0x26357c.dataset.storyRegenerationTarget);
      if (!_0x44cd8f || _0x44cd8f !== _0x3ffeb1.pendingRegenerationTarget) {
        return;
      }
      _0x3ffeb1.pendingRegenerationTarget = "";
      if (_0x44cd8f === "summary") {
        _0x1c53ec();
      } else if (_0x44cd8f === "episode-outlines") {
        _0x25621d({
          advance: false,
          confirmRegeneration: false
        });
      } else if (_0x44cd8f.startsWith("episode-script:")) {
        _0x57dd42(_0x26357c.dataset.storyEpisodeId);
      }
    } else if (_0x16fefa === "debug-episode-outline-request") {
      if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
        return;
      }
      _0x393f88();
    } else if (_0x16fefa === "debug-episode-script-request") {
      if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
        return;
      }
      _0x4898df();
    } else if (_0x16fefa === "debug-asset-extraction-experimental-request") {
      if (!isStoryAssetExperimentalExtractionAvailable(windowObject)) {
        return;
      }
      _0x4eaddd();
    } else if (_0x16fefa === "plan-episode-outlines") {
      _0x25621d({
        advance: false,
        confirmRegeneration: true
      });
    } else if (_0x16fefa === "generate-episode-script") {
      _0x4cbbeb(_0x26357c.dataset.storyEpisodeId);
    } else if (_0x16fefa === "generate-next-episode-script") {
      const _0x563313 = getNextStoryEpisodeScriptIndex(_0x3ffeb1.data.episodes);
      const _0x516897 = _0x3ffeb1.data.episodes[_0x563313];
      if (_0x516897) {
        _0x4cbbeb(_0x516897.id);
      }
    } else if (_0x16fefa === "continue-to-assets") {
      _0x13330f();
    } else if (_0x16fefa === "generate-episode-scripts-batch") {
      _0x151dbf({
        selectedOnly: _0x26357c.dataset.storyScriptBatchScope === "selected"
      });
    } else if (_0x16fefa === "cancel-episode-scripts-batch") {
      _0x22285a();
    } else if (_0x16fefa === "toggle-script-selection") {
      _0x3ffeb1.scriptSelectionMode = true;
      _0x3ffeb1.selectedScriptEpisodeIds = [];
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-script-selection") {
      _0x3ffeb1.scriptSelectionMode = false;
      _0x3ffeb1.selectedScriptEpisodeIds = [];
      _0xe5dd9c();
    } else if (_0x16fefa === "select-all-script-episodes") {
      _0x3ffeb1.selectedScriptEpisodeIds = getStoryEpisodeScriptBatchTargets(_0x3ffeb1.data.episodes, []).map(_0x12511f => _0x12511f.id);
      _0xe5dd9c();
    } else if (_0x16fefa === "select-script-episode") {
      _0x2c97a7.preventDefault();
      _0x15d272(_0x26357c.dataset.storyEpisodeId);
    } else if (_0x16fefa === "toggle-project-sort-menu") {
      _0x2c97a7.preventDefault();
      _0x2c97a7.stopPropagation();
      const _0x27820b = _0x26357c.closest("[data-story-project-sort-wrap]");
      const _0x368692 = !_0x27820b?.classList.contains("is-open");
      _0x1d7b42("");
      _0x385608();
      if (_0x368692) {
        _0x2963aa(_0x27820b, _0x26357c);
      } else {
        _0x2255e5();
      }
    } else if (_0x16fefa === "select-project-sort") {
      _0x2c97a7.preventDefault();
      _0x2c97a7.stopPropagation();
      _0x3ffeb1.projectSortOrder = normalizeStoryProjectSortOrder(_0x26357c.dataset.storyProjectSortOption);
      _0x1d7b42("");
      _0x2255e5();
      _0xe5dd9c({
        capturePageState: false
      });
    } else if (_0x16fefa === "toggle-project-menu") {
      _0x2c97a7.preventDefault();
      _0x2c97a7.stopPropagation();
      const _0x4cd219 = normalizeText(_0x26357c.dataset.storyProjectId);
      _0x3ffeb1.pendingDeleteProjectId = "";
      const _0x6d174c = _0x3ffeb1.openProjectMenuId !== _0x4cd219;
      _0x2255e5();
      _0x1d7b42(_0x6d174c ? _0x4cd219 : "");
    } else if (_0x16fefa === "rename-project") {
      const _0x3677a6 = normalizeText(_0x26357c.dataset.storyProjectId);
      _0x3ffeb1.openProjectMenuId = "";
      _0xe5dd9c();
      _0x573400(_0x3677a6);
    } else if (_0x16fefa === "duplicate-project") {
      _0x39f3d7(_0x26357c.dataset.storyProjectId);
    } else if (_0x16fefa === "archive-project") {
      _0x4b4979(_0x26357c.dataset.storyProjectId, true);
    } else if (_0x16fefa === "unarchive-project") {
      _0x4b4979(_0x26357c.dataset.storyProjectId, false);
    } else if (_0x16fefa === "toggle-archived-projects") {
      _0x3ffeb1.showArchivedProjects = !_0x3ffeb1.showArchivedProjects;
      _0x3ffeb1.openProjectMenuId = "";
      _0x3ffeb1.pendingDeleteProjectId = "";
      _0xe5dd9c();
    } else if (_0x16fefa === "request-delete-project") {
      _0x3ffeb1.openProjectMenuId = "";
      _0x3ffeb1.pendingDeleteProjectId = normalizeText(_0x26357c.dataset.storyProjectId);
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-delete-project") {
      _0x3ffeb1.pendingDeleteProjectId = "";
      _0xe5dd9c();
    } else if (_0x16fefa === "confirm-delete-project") {
      _0x2283dd(_0x26357c.dataset.storyProjectId);
    } else if (_0x16fefa === "delete-clip-frame") {
      _0x2c97a7.preventDefault();
      _0x2c97a7.stopPropagation();
      _0xd66ed7(_0x26357c.dataset.storyClipFrameId);
    } else if (_0x16fefa === "request-delete-clip") {
      if (_0x3ffeb1.clipSelectionMode) {
        return;
      }
      if (storyClipProduction.getGenerationState(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1)).busy) {
        _0x1ce8f7("请等待当前视频生成任务完成。", "info");
        return;
      }
      _0x3ffeb1.pendingDeleteClipId = normalizeText(_0x26357c.dataset.storyClipDeleteId);
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-delete-clip") {
      _0x3ffeb1.pendingDeleteClipId = "";
      _0xe5dd9c();
    } else if (_0x16fefa === "confirm-delete-clip") {
      if (storyClipProduction.getGenerationState(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1)).busy) {
        _0x3ffeb1.pendingDeleteClipId = "";
        _0xe5dd9c();
        _0x1ce8f7("请等待当前视频生成任务完成。", "info");
        return;
      }
      _0x172b32(_0x26357c.dataset.storyClipDeleteId);
    } else if (_0x16fefa === "extract-assets") {
      _0xf1b5ce({
        advance: true
      });
    } else if (_0x16fefa === "extract-assets-experimental") {
      if (!isStoryAssetExperimentalExtractionAvailable(windowObject)) {
        return;
      }
      _0xf1b5ce({
        advance: true,
        experimental: true
      });
    } else if (_0x16fefa === "plan-episodes") {
      _0x25621d({
        advance: true
      });
    } else if (_0x16fefa === "open-episode-stage") {
      _0xae8d80({
        confirmMissingImages: true
      });
    } else if (_0x16fefa === "toggle-experimental-split-mode") {
      const _0x4659dd = getStoryEpisodeBatchControlState(_0x3ffeb1);
      if (_0x4659dd.disabled || Array.isArray(_0x3ffeb1.splittingEpisodeIds) && _0x3ffeb1.splittingEpisodeIds.length > 0) {
        return;
      }
      _0x3ffeb1.experimentalSplitMode = !shouldUseStoryEpisodeExperimentalSplit(_0x3ffeb1);
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c();
    } else if (_0x16fefa === "toggle-episode-selection") {
      _0x3ffeb1.episodeSelectionMode = true;
      _0x3ffeb1.selectedEpisodeIds = [];
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-episode-selection") {
      _0x3c8c92.cancel();
      _0x3ffeb1.episodeSelectionMode = false;
      _0x3ffeb1.selectedEpisodeIds = [];
      _0xe5dd9c();
    } else if (_0x16fefa === "toggle-all-episodes") {
      _0x3ffeb1.selectedEpisodeIds = toggleStoryEpisodeSelectAll(getStoryVideoEpisodes(_0x3ffeb1.data.episodes), _0x3ffeb1.selectedEpisodeIds);
      _0xe5dd9c();
    } else if (_0x16fefa === "split-selected-episodes") {
      _0x9077d3({
        selectionMode: true
      });
    } else if (_0x16fefa === "split-all-episodes") {
      _0x9077d3({
        selectionMode: false
      });
    } else if (_0x16fefa === "cancel-episode-split-batch") {
      _0x2144ad();
    } else if (_0x16fefa === "split-episode") {
      _0x5c719b(_0x26357c.dataset.storyEpisodeId, {
        openAfter: false
      });
    } else if (_0x16fefa === "experimental-split-episode") {
      if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
        return;
      }
      _0x466213(_0x26357c.dataset.storyEpisodeId);
    } else if (_0x16fefa === "debug-experimental-split-request") {
      if (!isStoryEpisodeExperimentalSplitAvailable(windowObject)) {
        return;
      }
      _0x2fe544(_0x26357c.dataset.storyEpisodeId);
    } else if (_0x16fefa === "regenerate-episode") {
      _0x5c719b(_0x26357c.dataset.storyEpisodeId, {
        openAfter: false
      });
    } else if (_0x16fefa === "repair-episode-split-draft") {
      _0x550dd2(_0x26357c.dataset.storyEpisodeId);
    } else if (_0x16fefa === "new-story") {
      _0x132b13();
      _0xe5dd9c();
      _0x3b5272.querySelector("[data-story-idea-input]")?.focus();
    } else if (_0x16fefa === "back-home") {
      _0x3c4e04({
        immediate: true
      });
      _0x3ffeb1.view = "home";
      _0xe5dd9c({
        direction: "backward"
      });
    } else if (_0x16fefa === "previous-step") {
      _0x220ab0(_0x3ffeb1.step - 1);
    } else if (_0x16fefa === "finish-story-workbench") {
      _0x3ffeb1.view = "home";
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c({
        direction: "backward"
      });
      _0x1ce8f7("剧本工作室已保存。", "success");
    } else if (_0x16fefa === "request-delete-asset-appearance") {
      const _0x22bafd = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
      const _0x25353a = _0x22bafd ? getSelectedAssetAppearance(_0x3ffeb1, _0x22bafd) : null;
      const _0x5539c3 = getStoryAssetAppearanceActionKey(_0x22bafd, _0x25353a);
      if (!_0x22bafd || !_0x25353a || !_0x5539c3) {
        return;
      }
      if (!isStoryAddedAssetAppearance(_0x25353a) || getStoryAssetAppearances(_0x22bafd).length <= 1) {
        _0x1ce8f7("剧本识别出的原始形象不能删除。", "warn");
        return;
      }
      if (isStoryAssetAppearanceLoading(_0x3ffeb1, _0x22bafd.id, _0x25353a.id) || normalizeText(_0x3ffeb1.exportingAssetAppearanceKey) === _0x5539c3) {
        _0x1ce8f7("请等待当前形象任务完成。", "info");
        return;
      }
      _0x3ffeb1.pendingDeleteAssetAppearanceKey = _0x5539c3;
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-delete-asset-appearance") {
      _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
      _0xe5dd9c();
    } else if (_0x16fefa === "confirm-delete-asset-appearance") {
      const _0x16bc5e = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
      const _0x39f23f = _0x16bc5e ? getSelectedAssetAppearance(_0x3ffeb1, _0x16bc5e) : null;
      const _0x6f7fe3 = getStoryAssetAppearanceActionKey(_0x16bc5e, _0x39f23f);
      if (!_0x16bc5e || !_0x39f23f || !_0x6f7fe3 || _0x6f7fe3 !== normalizeText(_0x3ffeb1.pendingDeleteAssetAppearanceKey)) {
        return;
      }
      if (isStoryAssetAppearanceLoading(_0x3ffeb1, _0x16bc5e.id, _0x39f23f.id) || normalizeText(_0x3ffeb1.exportingAssetAppearanceKey) === _0x6f7fe3) {
        _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
        _0xe5dd9c();
        _0x1ce8f7("请等待当前形象任务完成。", "info");
        return;
      }
      const _0x1036d8 = removeStoryAddedAssetAppearance(_0x16bc5e, _0x39f23f.id);
      _0x3ffeb1.pendingDeleteAssetAppearanceKey = "";
      if (!_0x1036d8.removed) {
        _0xe5dd9c();
        _0x1ce8f7("剧本识别出的原始形象不能删除。", "warn");
        return;
      }
      _0x3ffeb1.assetAppearanceIndexes = {
        ..._0x3ffeb1.assetAppearanceIndexes,
        [_0x16bc5e.id]: _0x1036d8.nextIndex
      };
      _0x3c4e04({
        immediate: true
      });
      _0xe5dd9c();
      _0x1ce8f7("追加形象已删除，原始形象仍保留。", "success");
    } else if (_0x16fefa === "upload-asset") {
      _0x3ffeb1.pendingAssetUploadId = _0x3ffeb1.selectedAssetId;
      const _0x3d98b6 = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
      _0x3ffeb1.pendingAssetAppearanceId = getSelectedAssetAppearance(_0x3ffeb1, _0x3d98b6)?.id || "";
      _0x290f2f = {
        projectToken: createStoryProjectTaskToken(_0x3ffeb1),
        assetId: _0x3ffeb1.pendingAssetUploadId,
        appearanceId: _0x3ffeb1.pendingAssetAppearanceId
      };
      _0x52035d?.click();
    } else if (_0x16fefa === "upload-asset-reference") {
      const _0x25f05e = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
      const _0x59b2d2 = _0x25f05e ? getSelectedAssetAppearance(_0x3ffeb1, _0x25f05e) : null;
      if (!_0x25f05e || !_0x59b2d2 || !isStoryAssetBaseAppearance(_0x25f05e, _0x59b2d2)) {
        _0x1ce8f7("只有基础形象可以上传风格参考。", "warn");
      } else if (isStoryAssetAppearanceLoading(_0x3ffeb1, _0x25f05e.id, _0x59b2d2.id)) {
        _0x1ce8f7("请等待当前生成或上传任务完成。", "info");
      } else {
        _0x471216 = {
          projectToken: createStoryProjectTaskToken(_0x3ffeb1),
          assetId: _0x25f05e.id,
          appearanceId: _0x59b2d2.id
        };
        _0x558354?.click();
      }
    } else if (_0x16fefa === "remove-asset-reference") {
      const _0xad950e = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
      const _0x51da3f = _0xad950e ? getSelectedAssetAppearance(_0x3ffeb1, _0xad950e) : null;
      if (_0xad950e && _0x51da3f && !isStoryAssetAppearanceLoading(_0x3ffeb1, _0xad950e.id, _0x51da3f.id) && clearStoryAssetAppearanceReferenceImage(_0x51da3f)) {
        _0x1365cf(_0xad950e.id);
        _0x7ca197();
        _0x3c4e04({
          immediate: true
        });
        _0x1ce8f7("风格参考已删除。", "success");
      }
    } else if (_0x16fefa === "play-character-voice") {
      _0x3affd1(_0x26357c.dataset.storyVoiceAssetId || _0x3ffeb1.selectedAssetId);
    } else if (_0x16fefa === "open-character-voice") {
      _0x5ea64b(_0x3ffeb1.selectedAssetId);
    } else if (_0x16fefa === "close-character-voice") {
      _0x1aa4fd();
    } else if (_0x16fefa === "upload-character-voice") {
      _0x3ffeb1.pendingCharacterVoiceAssetId = _0x3ffeb1.characterVoiceEditor?.assetId || "";
      _0x9f5855 = {
        projectToken: createStoryProjectTaskToken(_0x3ffeb1),
        assetId: _0x3ffeb1.pendingCharacterVoiceAssetId,
        editor: _0x3ffeb1.characterVoiceEditor
      };
      _0x17fec5?.click();
    } else if (_0x16fefa === "remove-character-voice") {
      const _0x3d656b = findStoryAsset(_0x3ffeb1, _0x3ffeb1.characterVoiceEditor?.assetId);
      if (_0x3d656b) {
        _0x493da1();
        clearStoryCharacterVoiceReference(_0x3d656b);
        _0x3c4e04({
          immediate: true
        });
        _0xe5dd9c();
        _0x1ce8f7("已移除角色声音参考。", "success");
      }
    } else if (_0x16fefa === "toggle-character-voice-history") {
      const _0x5ee5fa = _0x26357c.closest(".story-character-voice-history-wrap");
      const _0x7b178 = _0x5ee5fa?.querySelector(".story-character-voice-history-panel");
      const _0x533c22 = !_0x5ee5fa?.classList.contains("is-open");
      _0x1e92bb(_0x5ee5fa);
      _0x5ee5fa?.classList.toggle("is-open", _0x533c22);
      _0x26357c.setAttribute("aria-expanded", String(_0x533c22));
      _0x7b178?.setAttribute("aria-hidden", String(!_0x533c22));
    } else if (_0x16fefa === "generate-character-voice") {
      _0x11165e();
    } else if (_0x16fefa === "download-asset-image") {
      _0x4ecace(_0x26357c);
    } else if (_0x16fefa === "add-asset-appearance-to-library") {
      _0x21864f();
    } else if (_0x16fefa === "previous-appearance") {
      _0x2639e0(-1);
    } else if (_0x16fefa === "next-appearance") {
      _0x2639e0(1);
    } else if (_0x16fefa === "previous-clip") {
      _0x1d758b(-1);
    } else if (_0x16fefa === "next-clip") {
      _0x1d758b(1);
    } else if (_0x16fefa === "previous-video-result") {
      _0x1b983e(-1);
    } else if (_0x16fefa === "next-video-result") {
      _0x1b983e(1);
    } else if (_0x16fefa === "select-video-result") {
      _0x207763(_0x26357c.dataset.storyClipId, _0x26357c.dataset.storyVideoResultIndex);
    } else if (_0x16fefa === "delete-video-result") {
      _0x5d489f(_0x26357c.dataset.storyClipId, _0x26357c.dataset.storyVideoResultIndex);
    } else if (_0x16fefa === "capture-video-frame") {
      _0x37c462(_0x26357c);
    } else if (_0x16fefa === "trim-video") {
      _0x5542cf(_0x26357c);
    } else if (_0x16fefa === "set-base-appearance") {
      const _0x1ba2ba = findStoryAsset(_0x3ffeb1, _0x3ffeb1.selectedAssetId);
      const _0x22414c = _0x1ba2ba ? getSelectedAssetAppearance(_0x3ffeb1, _0x1ba2ba) : null;
      if (_0x1ba2ba && isStoryAssetCardLoading(_0x3ffeb1, _0x1ba2ba.id)) {
        _0x1ce8f7("请等待当前生成任务完成。", "info");
      } else if (!_0x1ba2ba || !_0x22414c) {
        _0x1ce8f7("当前形象不可用。", "warn");
      } else if (setStoryAssetBaseAppearance(_0x1ba2ba, _0x22414c.id)) {
        _0x1365cf(_0x1ba2ba.id);
        _0x7ca197();
        _0x3c4e04({
          immediate: true
        });
        _0x1ce8f7("已设为基础形象；生成后会作为其他形象的参考。", "success");
      }
    } else if (_0x16fefa === "toggle-asset-selection") {
      _0x3ffeb1.assetSelectionMode = true;
      _0x3ffeb1.selectedAssetIds = [];
      _0xe5dd9c();
    } else if (_0x16fefa === "cancel-asset-selection") {
      _0x3c8c92.cancel();
      _0x3ffeb1.assetSelectionMode = false;
      _0x3ffeb1.selectedAssetIds = [];
      _0xe5dd9c();
    } else if (_0x16fefa === "toggle-all-assets") {
      const _0x37eaba = getVisibleStoryAssets(_0x3ffeb1);
      _0x3ffeb1.selectedAssetIds = toggleStoryAssetSelectAll(_0x3ffeb1.assetFilter === "library" ? _0x37eaba.filter(_0x178db6 => normalizeText(_0x178db6?.mediaKind).toLowerCase() === "image" && normalizeText(_0x178db6?.sourceUrl || _0x178db6?.imageUrl)) : _0x37eaba, _0x3ffeb1.selectedAssetIds);
      _0xe5dd9c();
    } else if (_0x16fefa === "add-library-assets-to-project") {
      const _0x4598cc = _0x26357c.closest(".story-asset-batch-menu-wrap");
      const _0x3032f7 = !_0x4598cc?.classList.contains("is-open");
      if (_0x3032f7) {
        _0x52ce48(_0x4598cc, _0x26357c);
      } else {
        _0x15093f();
      }
    } else if (_0x16fefa === "cancel-asset-batch-generation") {
      _0x5710f3();
    } else if (_0x16fefa === "batch-generate-assets") {
      _0x146793();
      _0x385608();
      const _0x4853e6 = _0x26357c.dataset.storyAssetBatchDirectMode;
      if (_0x4853e6) {
        _0x15093f();
        _0xe75f58(_0x4853e6);
        return;
      }
      const _0x311468 = _0x26357c.closest(".story-asset-batch-menu-wrap");
      const _0x973ab9 = !_0x311468?.classList.contains("is-open");
      if (_0x973ab9) {
        _0x52ce48(_0x311468, _0x26357c);
      } else {
        _0x15093f();
      }
    } else if (_0x16fefa === "toggle-clip-selection") {
      _0x3ffeb1.pendingDeleteClipId = "";
      _0x3ffeb1.clipSelectionMode = true;
      _0x3ffeb1.selectedClipGenerationIds = [];
      _0x5c09e0();
      _0x88077f();
    } else if (_0x16fefa === "select-all-clips") {
      const _0x1e8faf = getSelectedEpisode(_0x3ffeb1);
      const _0x5842eb = new Set(storyClipProduction.getGenerationState(_0x3ffeb1, _0x1e8faf).generatingClipIds);
      _0x3ffeb1.selectedClipGenerationIds = (_0x1e8faf?.clips || []).filter(_0x476057 => !_0x5842eb.has(normalizeText(_0x476057?.id))).map(_0x9e94b2 => normalizeText(_0x9e94b2?.id)).filter(Boolean);
      _0x88077f();
    } else if (_0x16fefa === "cancel-clip-selection") {
      _0x3c8c92.cancel();
      _0x3ffeb1.clipSelectionMode = false;
      _0x3ffeb1.selectedClipGenerationIds = [];
      _0x88077f();
    } else if (_0x16fefa === "episode-back") {
      _0x3c8c92.cancel();
      _0x3ffeb1.clipSelectionMode = false;
      _0x3ffeb1.selectedClipGenerationIds = [];
      _0x220ab0(canEnterStoryWorkspaceStep(_0x3ffeb1.data, 3) ? 3 : 1);
    } else if (_0x16fefa === "toggle-canvas-sync-menu") {
      const _0x32fa20 = _0x26357c.closest(".story-canvas-sync-menu-wrap");
      const _0x22ef58 = !_0x32fa20?.classList.contains("is-open");
      _0x15093f();
      if (_0x22ef58) {
        _0x4221d9(_0x32fa20, _0x26357c);
      } else {
        _0x5c09e0();
      }
    } else if (_0x16fefa === "sync-episode-to-canvas") {
      _0x5c09e0();
      _0x198d9b();
    } else if (_0x16fefa === "sync-project-to-canvas") {
      _0x5c09e0();
      _0x1200d7();
    } else if (_0x16fefa === "export-current-clip") {
      const _0x1becda = _0x26357c.closest(".story-clip-export-menu-wrap")?.querySelector(".story-menu-trigger");
      _0x5c09e0();
      _0x46e662("current", _0x1becda);
    } else if (_0x16fefa === "export-episode-clips") {
      const _0x589d8c = _0x26357c.closest(".story-clip-export-menu-wrap")?.querySelector(".story-menu-trigger");
      _0x5c09e0();
      _0x46e662("episode", _0x589d8c);
    } else if (_0x16fefa === "cancel-clip-batch-generation") {
      _0x23a488.cancelBatch();
    } else if (_0x16fefa === "generate-clip-video") {
      _0x4d48c1();
    } else if (_0x16fefa === "generate-asset") {
      _0xfc9d5a();
    }
    _0x3c4e04();
  });
  _0x3b5272.addEventListener("input", _0x28be7c => {
    if (_0x28be7c.target.matches("[data-story-custom-episode-count-input]")) {
      const _0x54995e = String(_0x28be7c.target.value || "").replace(/\D+/gu, "").slice(0, 3);
      _0x28be7c.target.value = _0x54995e && Number(_0x54995e) > STORY_EPISODE_COUNT_MAX ? String(STORY_EPISODE_COUNT_MAX) : _0x54995e;
      return;
    }
    if (_0x28be7c.target.matches("[data-story-clip-adjustment-instruction]")) {
      _0x3ffeb1.clipAdjustmentInstruction = String(_0x28be7c.target.value || "").slice(0, 600);
      const _0x2321f9 = getSelectedEpisode(_0x3ffeb1);
      const _0x50e789 = getSelectedClip(_0x3ffeb1, _0x2321f9);
      const _0x2bc6fc = normalizeStoryPromptMode(_0x50e789?.promptMode || _0x2321f9?.promptMode || _0x3ffeb1.data.project?.planning?.promptMode, {
        allowDeveloperModes: true
      });
      const _0x7fa6ba = normalizeStoryPromptMode(_0x3ffeb1.clipAdjustmentPromptMode || _0x2bc6fc, {
        allowDeveloperModes: true
      });
      const _0x3020e9 = _0x28be7c.target.closest("[data-story-clip-adjustment-bar]")?.querySelector("[data-story-action=\"generate-clip-adjustment\"]");
      if (_0x3020e9) {
        _0x3020e9.disabled = !normalizeText(_0x3ffeb1.clipAdjustmentInstruction) && _0x7fa6ba === _0x2bc6fc;
      }
      return;
    }
    if (_0x28be7c.target.matches("[data-story-project-search]")) {
      const _0x55a6c0 = String(_0x28be7c.target.value || "").slice(0, 120);
      _0x3ffeb1.projectSearchQuery = _0x55a6c0;
      _0x3ffeb1.openProjectMenuId = "";
      _0xe5dd9c({
        capturePageState: false
      });
      const _0x483afc = _0x3b5272.querySelector("[data-story-project-search]");
      _0x483afc?.focus();
      _0x483afc?.setSelectionRange?.(_0x55a6c0.length, _0x55a6c0.length);
      return;
    }
    if (_0x28be7c.target.matches("[data-story-character-voice-sample]")) {
      if (_0x3ffeb1.characterVoiceEditor) {
        _0x3ffeb1.characterVoiceEditor.sampleText = String(_0x28be7c.target.value || "").slice(0, STORY_CHARACTER_VOICE_SAMPLE_MAX_CHARACTERS);
      }
      return;
    }
    if (_0x28be7c.target.matches("[data-story-character-voice-description]")) {
      if (_0x3ffeb1.characterVoiceEditor) {
        _0x3ffeb1.characterVoiceEditor.voiceDescription = String(_0x28be7c.target.value || "").slice(0, 600);
      }
      return;
    }
    if (_0x28be7c.target.matches("[data-story-style-search-input]")) {
      _0x26472d(_0x28be7c.target.closest(".story-style-picker"));
      return;
    }
    if (_0x28be7c.target.matches("[data-story-style-custom-input]")) {
      const _0x2df16b = String(_0x28be7c.target.value || "").slice(0, STORY_CUSTOM_STYLE_MAX_CHARACTERS);
      if (_0x28be7c.target.value !== _0x2df16b) {
        _0x28be7c.target.value = _0x2df16b;
      }
      const _0x239196 = _0x28be7c.target.closest(".story-style-custom-editor")?.querySelector("[data-story-style-custom-count]");
      if (_0x239196) {
        _0x239196.textContent = _0x2df16b.length + " / " + STORY_CUSTOM_STYLE_MAX_CHARACTERS;
      }
      return;
    }
    if (_0x28be7c.target.matches("[data-story-idea-input]")) {
      _0x3ffeb1.idea = _0x28be7c.target.value.slice(0, STORY_IDEA_MAX_CHARACTERS);
      _0x54ad39();
    } else if (_0x28be7c.target.matches("[data-story-paste-input]")) {
      _0x3ffeb1.scriptText = _0x28be7c.target.value.slice(0, STORY_SCRIPT_MAX_CHARACTERS);
      _0x3ffeb1.scriptCharacterCount = _0x3ffeb1.scriptText.length;
      _0x3ffeb1.scriptFileName = normalizeText(_0x3ffeb1.scriptText) ? "粘贴文本" : "";
      if (!_0x3ffeb1.hasCreatedProject) {
        _0x3ffeb1.data.project.sourceDocument = normalizeText(_0x3ffeb1.scriptText) ? {
          fileName: "粘贴文本",
          text: _0x3ffeb1.scriptText,
          characterCount: _0x3ffeb1.scriptText.length
        } : null;
      }
      _0x54ad39();
    } else if (_0x28be7c.target.matches("[data-story-outline-field]")) {
      const _0x283532 = {
        "story-type": "storyType",
        "story-target-audience": "targetAudience",
        "story-logline": "logline",
        "story-summary": "summary",
        "story-background": "background",
        "story-setting": "setting",
        "story-core-hook": "coreHook"
      };
      const _0x2a7287 = _0x283532[_0x28be7c.target.dataset.storyOutlineField];
      if (_0x2a7287) {
        _0x3ffeb1.data.project[_0x2a7287] = _0x28be7c.target.value;
        markStorySummaryDownstreamStale(_0x3ffeb1.data);
      }
    } else if (_0x28be7c.target.matches("[data-story-contract-field]")) {
      const _0x3aa586 = normalizeText(_0x28be7c.target.dataset.storyContractField);
      if (Object.hasOwn(STORY_CONTRACT_FIELD_LABELS, _0x3aa586)) {
        _0x3ffeb1.data.project.storyContract ||= normalizeGeneratedStoryContract();
        _0x3ffeb1.data.project.storyContract[_0x3aa586] = _0x28be7c.target.value;
        markStorySummaryDownstreamStale(_0x3ffeb1.data);
      }
    } else if (_0x28be7c.target.matches("[data-story-plot-beat-index][data-story-plot-beat-field]")) {
      const _0x4d7f50 = Number(_0x28be7c.target.dataset.storyPlotBeatIndex);
      const _0x514287 = normalizeText(_0x28be7c.target.dataset.storyPlotBeatField);
      const _0x191779 = _0x3ffeb1.data.project?.plotBeats?.[_0x4d7f50];
      if (_0x191779 && ["stage", "event", "consequence"].includes(_0x514287)) {
        _0x191779[_0x514287] = _0x28be7c.target.value;
        markStorySummaryDownstreamStale(_0x3ffeb1.data);
      }
    } else if (_0x28be7c.target.matches("[data-story-continuity-facts]")) {
      _0x3ffeb1.data.project.continuityFacts = normalizeGeneratedStoryContinuityFacts(String(_0x28be7c.target.value || "").split(/\r?\n/u));
      markStorySummaryDownstreamStale(_0x3ffeb1.data);
    } else if (_0x28be7c.target.matches("[data-story-summary-character-field]")) {
      if (updateStorySummaryCharacterField(_0x3ffeb1.data.project?.characters, Number(_0x28be7c.target.dataset.storySummaryCharacterIndex), _0x28be7c.target.dataset.storySummaryCharacterField, _0x28be7c.target.value)) {
        markStorySummaryDownstreamStale(_0x3ffeb1.data);
      }
    } else if (_0x28be7c.target.matches("[data-story-episode-synopsis], [data-story-episode-hook]")) {
      const _0x112e7b = _0x28be7c.target.matches("[data-story-episode-hook]") ? "hook" : "synopsis";
      const _0x2e9901 = _0x112e7b === "hook" ? _0x28be7c.target.dataset.storyEpisodeHook : _0x28be7c.target.dataset.storyEpisodeSynopsis;
      if (updateStoryEpisodeOutlineField(_0x3ffeb1.data, _0x2e9901, _0x112e7b, _0x28be7c.target.value)) {
        _0x36a0eb();
      }
    } else if (_0x28be7c.target.matches("[data-story-episode-script]")) {
      const _0x32b53d = _0x3ffeb1.data.episodes.find(_0xb91b19 => _0xb91b19.id === _0x28be7c.target.dataset.storyEpisodeScript);
      if (_0x32b53d?.script) {
        _0x32b53d.script.fullText = _0x28be7c.target.value;
        _0x32b53d.script.generatedAt = Date.now();
        _0x36a0eb();
      }
    } else if (_0x28be7c.target.matches("[data-story-chapter-title]")) {
      const _0x306d18 = _0x3ffeb1.data.project.chapters?.[Number(_0x28be7c.target.dataset.storyChapterTitle)];
      if (_0x306d18) {
        _0x306d18.title = _0x28be7c.target.value;
        syncProjectChapterContent(_0x3ffeb1.data.project);
      }
    } else if (_0x28be7c.target.matches("[data-story-chapter-content]")) {
      const _0x5339ed = _0x3ffeb1.data.project.chapters?.[Number(_0x28be7c.target.dataset.storyChapterContent)];
      if (_0x5339ed) {
        _0x5339ed.content = _0x28be7c.target.value;
        syncProjectChapterContent(_0x3ffeb1.data.project);
      }
    } else if (_0x28be7c.target.matches("[data-story-clip-prompt]")) {
      clearStoryClipAdjustmentUndo(getSelectedClip(_0x3ffeb1, getSelectedEpisode(_0x3ffeb1)));
      if (shouldSkipPromptTriggerForBulkInput(_0x28be7c)) {
        return;
      }
      updateSelectedClipPrompt(_0x3ffeb1, _0x28be7c.target.innerHTML);
      _0x1881c3();
    } else if (_0x28be7c.target.matches("[data-story-asset-prompt]")) {
      if (shouldSkipPromptTriggerForBulkInput(_0x28be7c)) {
        return;
      }
      updateStoryAssetPromptFromEditor(_0x3ffeb1, _0x28be7c.target);
    } else if (_0x28be7c.target.matches("[data-story-model-search-input]")) {
      const _0x2ab0c3 = normalizeText(_0x28be7c.target.value).toLowerCase();
      const _0x47dc33 = _0x28be7c.target.closest(".story-model-picker");
      _0x47dc33?.querySelectorAll("[data-story-model-option]").forEach(_0x3b7c18 => {
        _0x3b7c18.hidden = Boolean(_0x2ab0c3) && !String(_0x3b7c18.dataset.storyModelSearch || "").includes(_0x2ab0c3);
      });
    } else if (_0x28be7c.target.matches("[data-story-project-title]")) {
      const _0x5f1ca1 = String(_0x28be7c.target.value || "").slice(0, 120);
      const _0x1297aa = _0x28be7c.target.dataset.storyProjectTitle;
      const _0x46d83c = _0x3ffeb1.projects.find(_0x1264a8 => String(_0x1264a8?.id) === String(_0x1297aa));
      if (_0x46d83c?.data?.project) {
        _0x46d83c.data.project.title = _0x5f1ca1;
        _0x46d83c.title = _0x5f1ca1;
        _0x46d83c.projectTitleEdited = true;
        _0x46d83c.updatedAt = Date.now();
      }
      if (String(_0x3ffeb1.data.project?.id) === String(_0x1297aa)) {
        _0x3ffeb1.data.project.title = _0x5f1ca1;
        _0x3ffeb1.projectTitleEdited = true;
      }
    }
    _0x3c4e04();
  });
  _0x3b5272.addEventListener("change", _0x5e49ed => {
    if (_0x5e49ed.target.matches("[data-story-custom-episode-count-input]")) {
      _0x67e5f6(_0x5e49ed.target);
      return;
    }
    if (!_0x5e49ed.target.matches("[data-story-project-title]")) {
      return;
    }
    const _0x184484 = normalizeText(_0x5e49ed.target.value) || "未命名故事";
    const _0x3ed335 = _0x5e49ed.target.dataset.storyProjectTitle;
    const _0x4f675f = _0x3ffeb1.projects.find(_0xb10429 => String(_0xb10429?.id) === String(_0x3ed335));
    if (_0x4f675f?.data?.project) {
      _0x4f675f.data.project.title = _0x184484;
      _0x4f675f.title = _0x184484;
      _0x4f675f.projectTitleEdited = true;
      _0x4f675f.updatedAt = Date.now();
    }
    if (String(_0x3ffeb1.data.project?.id) === String(_0x3ed335)) {
      _0x3ffeb1.data.project.title = _0x184484;
      _0x3ffeb1.projectTitleEdited = true;
    }
    _0x5e49ed.target.value = _0x184484;
    _0x3c4e04({
      immediate: true
    });
  });
  _0x125f3d?.addEventListener("change", async () => {
    const _0x29673f = _0x125f3d.files?.[0];
    if (!_0x29673f) {
      return;
    }
    await _0x4922bd(_0x29673f);
    _0x125f3d.value = "";
  });
  function _0x56ac9c(_0x6d11d8 = []) {
    const _0x14de7e = Array.from(_0x6d11d8 || []);
    const _0x16db5b = [];
    _0x14de7e.forEach(_0x246018 => {
      const _0x218eeb = validateStoryReplicationVideoFile(_0x246018);
      if (_0x218eeb.ok) {
        _0x16db5b.push(_0x246018);
      } else {
        _0x1ce8f7(_0x218eeb.error, "warn");
      }
    });
    if (!_0x16db5b.length) {
      return false;
    }
    const _0x50ce5e = _0x3ffeb1.replicationSourceFiles;
    const _0x3ff3c6 = _0x3ffeb1.replicationSourcePreviewUrls;
    _0x3ffeb1.replicationSourceFiles = mergeStoryReplicationSourceFiles(_0x50ce5e, _0x16db5b);
    const _0x100ec6 = new Map(_0x50ce5e.map((_0x35e24e, _0x2a81eb) => [_0x35e24e, _0x3ff3c6[_0x2a81eb] || ""]));
    _0x3ffeb1.replicationSourcePreviewUrls = _0x3ffeb1.replicationSourceFiles.map(_0x3a6d02 => _0x100ec6.get(_0x3a6d02) || _0x5cb141(_0x3a6d02));
    const _0x317c48 = _0x4bf4f6.querySelector(".story-page.is-current .story-home-composer-body");
    if (_0x317c48 && _0x3ffeb1.view === "home" && _0x3ffeb1.homeTab === "replication") {
      _0x317c48.innerHTML = renderStoryHomeComposerBody(_0x3ffeb1);
      _0x54ad39();
    } else {
      _0xe5dd9c({
        capturePageState: false
      });
    }
    return true;
  }
  _0x370723?.addEventListener("change", () => {
    const _0x12442b = _0x26af39;
    _0x26af39 = "";
    if (_0x12442b && _0x3ffeb1.data?.project?.sourceMode === "video-replication") {
      const _0x46dc06 = _0x370723.files?.[0];
      const _0x2edd35 = validateStoryReplicationVideoFile(_0x46dc06);
      if (!_0x2edd35.ok) {
        _0x1ce8f7(_0x2edd35.error, "warn");
      } else {
        const _0x43fd5f = createStoryProjectTaskToken(_0x3ffeb1);
        const _0x305f0e = normalizeText(_0x43fd5f.projectId);
        _0x30e879.set(_0x305f0e + ":" + _0x12442b, _0x46dc06);
        _0xab8fe2(_0x43fd5f, [{
          episodeId: _0x12442b,
          file: _0x46dc06
        }]);
      }
      _0x370723.value = "";
      return;
    }
    _0x56ac9c(_0x370723.files);
    _0x370723.value = "";
  });
  _0x52035d?.addEventListener("change", async () => {
    const _0x4d53b6 = _0x52035d.files?.[0];
    const _0x2364bd = _0x290f2f || {
      projectToken: createStoryProjectTaskToken(_0x3ffeb1),
      assetId: _0x3ffeb1.pendingAssetUploadId,
      appearanceId: _0x3ffeb1.pendingAssetAppearanceId
    };
    _0x290f2f = null;
    _0x3ffeb1.pendingAssetUploadId = "";
    _0x3ffeb1.pendingAssetAppearanceId = "";
    const _0x169024 = _0x2364bd.projectToken;
    const _0xad0ef = _0x169024.data?.assets?.find(_0x2305cc => normalizeText(_0x2305cc?.id) === normalizeText(_0x2364bd.assetId));
    const _0x2d439f = getStoryAssetAppearances(_0xad0ef).find(_0x41312b => normalizeText(_0x41312b?.id) === normalizeText(_0x2364bd.appearanceId));
    if (!_0x4d53b6 || !_0xad0ef || !_0x2d439f || !_0x2c064b(_0x169024)) {
      _0x52035d.value = "";
      return;
    }
    const _0x3d4723 = buildStoryBackgroundTaskId("asset-image-upload", {
      assetId: _0xad0ef.id,
      appearanceId: _0x2d439f.id
    });
    if (_0x59fa6e(_0x169024)) {
      setStoryAssetAppearanceGenerating(_0x3ffeb1, _0xad0ef.id, _0x2d439f.id, true);
      _0xe5dd9c();
    }
    _0x4ba4d1(_0x169024, {
      id: _0x3d4723,
      type: "asset-image-upload",
      scope: {
        assetId: _0xad0ef.id,
        appearanceId: _0x2d439f.id
      },
      label: "上传" + (normalizeText(_0xad0ef.name) || "素材") + "图片",
      message: "正在保存本地图片"
    });
    try {
      const _0x2ff9bc = await uploadFile(_0x4d53b6, _0x169024.projectId);
      if (!_0x2c064b(_0x169024)) {
        return;
      }
      const _0x42cd1a = normalizeText(_0x2ff9bc?.displayUrl || _0x2ff9bc?.url || _0x2ff9bc?.originalUrl || _0x2ff9bc?.thumbUrl);
      if (!_0x42cd1a) {
        throw new Error("素材保存结果缺少可用地址");
      }
      _0x2d439f.imageUrl = _0x42cd1a;
      _0x2d439f.error = "";
      ensureStoryAssetBaseAppearance(_0xad0ef);
      _0x450b2c(_0x169024, _0x3d4723, {
        status: "succeeded",
        message: "本地图片已保存"
      });
      if (_0x59fa6e(_0x169024)) {
        _0xe5dd9c();
      }
    } catch (_0x466413) {
      if (!_0x2c064b(_0x169024)) {
        return;
      }
      _0x450b2c(_0x169024, _0x3d4723, {
        status: "failed",
        message: "本地图片保存失败",
        error: _0x466413?.message || "素材保存失败，请稍后重试。"
      });
      if (_0x59fa6e(_0x169024)) {
        _0x1ce8f7(_0x466413?.message || "素材保存失败，请稍后重试。", "error");
      }
    } finally {
      if (_0x59fa6e(_0x169024)) {
        setStoryAssetAppearanceGenerating(_0x3ffeb1, _0xad0ef.id, _0x2d439f.id, false);
        _0xe5dd9c();
      }
      _0x52035d.value = "";
    }
  });
  _0x558354?.addEventListener("change", async () => {
    const _0x588f13 = _0x558354.files?.[0];
    const _0x166ff1 = _0x471216;
    _0x471216 = null;
    const _0x20dcb3 = _0x166ff1?.projectToken;
    const _0x459419 = _0x20dcb3?.data?.assets?.find(_0x5d1ec8 => normalizeText(_0x5d1ec8?.id) === normalizeText(_0x166ff1.assetId));
    const _0xa69f13 = getStoryAssetAppearances(_0x459419).find(_0x15f4f9 => normalizeText(_0x15f4f9?.id) === normalizeText(_0x166ff1?.appearanceId));
    const _0x129bf6 = normalizeText(_0x588f13?.name).toLowerCase();
    const _0xd3395f = String(_0x588f13?.type || "").toLowerCase().startsWith("image/") || /\.(?:avif|bmp|gif|jpe?g|png|webp)$/u.test(_0x129bf6);
    if (!_0x588f13 || !_0x20dcb3 || !_0x459419 || !_0xa69f13 || !_0x2c064b(_0x20dcb3)) {
      _0x558354.value = "";
      return;
    }
    if (!_0xd3395f) {
      if (_0x59fa6e(_0x20dcb3)) {
        _0x1ce8f7("风格参考只支持图片文件。", "warn");
      }
      _0x558354.value = "";
      return;
    }
    if (!isStoryAssetBaseAppearance(_0x459419, _0xa69f13)) {
      if (_0x59fa6e(_0x20dcb3)) {
        _0x1ce8f7("当前形象已不再是基础形象，风格参考未上传。", "warn");
      }
      _0x558354.value = "";
      return;
    }
    const _0x4af117 = buildStoryBackgroundTaskId("asset-reference-image-upload", {
      assetId: _0x459419.id,
      appearanceId: _0xa69f13.id
    });
    if (_0x59fa6e(_0x20dcb3)) {
      setStoryAssetAppearanceGenerating(_0x3ffeb1, _0x459419.id, _0xa69f13.id, true);
      _0xe5dd9c();
    }
    _0x4ba4d1(_0x20dcb3, {
      id: _0x4af117,
      type: "asset-image-upload",
      scope: {
        assetId: _0x459419.id,
        appearanceId: _0xa69f13.id
      },
      label: "上传" + (normalizeText(_0x459419.name) || "基础形象") + "风格参考",
      message: "正在保存风格参考"
    });
    try {
      const _0x263fb5 = await uploadFile(_0x588f13, _0x20dcb3.projectId);
      if (!_0x2c064b(_0x20dcb3)) {
        return;
      }
      const _0x4dcbe3 = normalizeText(_0x263fb5?.displayUrl || _0x263fb5?.url || _0x263fb5?.originalUrl || _0x263fb5?.thumbUrl);
      if (!_0x4dcbe3) {
        throw new Error("风格参考保存结果缺少可用地址");
      }
      setStoryAssetAppearanceReferenceImage(_0xa69f13, _0x4dcbe3);
      _0x450b2c(_0x20dcb3, _0x4af117, {
        status: "succeeded",
        message: "风格参考已保存"
      });
      if (_0x59fa6e(_0x20dcb3)) {
        _0xe5dd9c();
        _0x1ce8f7("风格参考已上传，并已补充提示词。", "success");
      }
    } catch (_0x52ae4) {
      if (!_0x2c064b(_0x20dcb3)) {
        return;
      }
      _0x450b2c(_0x20dcb3, _0x4af117, {
        status: "failed",
        message: "风格参考保存失败",
        error: _0x52ae4?.message || "风格参考上传失败，请稍后重试。"
      });
      if (_0x59fa6e(_0x20dcb3)) {
        _0x1ce8f7(_0x52ae4?.message || "风格参考上传失败，请稍后重试。", "error");
      }
    } finally {
      if (_0x59fa6e(_0x20dcb3)) {
        setStoryAssetAppearanceGenerating(_0x3ffeb1, _0x459419.id, _0xa69f13.id, false);
        _0xe5dd9c();
      }
      _0x558354.value = "";
    }
  });
  async function _0x1923b3(_0x316541, _0x39a348) {
    const _0x39bfb = _0x47e4c3 || {};
    _0x47e4c3 = null;
    const _0x2ee0b6 = _0x39bfb.projectToken || createStoryProjectTaskToken(_0x3ffeb1);
    const _0x5b818a = _0x2ee0b6.data?.assets?.find(_0x113510 => normalizeText(_0x113510?.id) === normalizeText(_0x39a348));
    if (!_0x316541 || !_0x5b818a || _0x5b818a.kind !== "character") {
      return;
    }
    const _0x255f5d = _0x59fa6e(_0x2ee0b6) ? _0x3ffeb1 : deriveStoryProjectTaskState(_0x2ee0b6.data);
    if (isStoryAssetVoiceLoading(_0x255f5d, _0x5b818a.id)) {
      if (_0x59fa6e(_0x2ee0b6)) {
        _0x1ce8f7("请等待当前生成任务完成。", "info");
      }
      return;
    }
    const _0x33096e = _0x39bfb.editor?.assetId === _0x5b818a.id ? _0x39bfb.editor : _0x3ffeb1.characterVoiceEditor?.assetId === _0x5b818a.id ? _0x3ffeb1.characterVoiceEditor : null;
    if (!isSupportedStoryCharacterVoiceFile(_0x316541)) {
      if (_0x33096e) {
        _0x33096e.error = "仅支持 MP3、WAV 或 M4A 音频文件。";
      }
      if (_0x59fa6e(_0x2ee0b6)) {
        _0xe5dd9c();
      }
      return;
    }
    const _0x1735b7 = buildStoryBackgroundTaskId("asset-voice-upload", {
      assetId: _0x5b818a.id
    });
    if (_0x59fa6e(_0x2ee0b6)) {
      setStoryAssetVoiceGenerating(_0x3ffeb1, _0x5b818a.id, true);
      if (_0x3ffeb1.characterVoiceEditor?.assetId === _0x5b818a.id) {
        _0x3ffeb1.characterVoiceEditor.isGenerating = true;
      }
      _0xe5dd9c();
    }
    _0x4ba4d1(_0x2ee0b6, {
      id: _0x1735b7,
      type: "asset-voice-upload",
      scope: {
        assetId: _0x5b818a.id
      },
      label: "上传" + (normalizeText(_0x5b818a.name) || "角色") + "声音",
      message: "正在保存本地音频"
    });
    try {
      const _0x18b061 = await uploadFile(_0x316541, _0x2ee0b6.projectId);
      if (!_0x2c064b(_0x2ee0b6)) {
        return false;
      }
      const _0x358fc0 = normalizeStoryCharacterVoiceReference({
        source: "upload",
        audioUrl: _0x18b061?.displayUrl || _0x18b061?.url || _0x18b061?.originalUrl || _0x18b061?.localUrl,
        localPath: _0x18b061?.localPath || _0x18b061?.originalLocalPath || _0x18b061?.path,
        fileName: _0x316541.name,
        sampleText: _0x33096e?.sampleText,
        voiceDescription: _0x33096e?.voiceDescription,
        updatedAt: Date.now()
      });
      if (!_0x358fc0) {
        throw new Error("音频保存结果缺少可用地址");
      }
      if (_0x59fa6e(_0x2ee0b6)) {
        _0x493da1();
      }
      replaceStoryCharacterVoiceReference(_0x5b818a, _0x358fc0);
      _0x450b2c(_0x2ee0b6, _0x1735b7, {
        status: "succeeded",
        message: "本地音频已保存"
      });
      if (_0x59fa6e(_0x2ee0b6)) {
        if (_0x3ffeb1.characterVoiceEditor?.assetId === _0x5b818a.id) {
          _0x3ffeb1.characterVoiceEditor.error = "";
        }
        _0xe5dd9c();
        _0x1ce8f7("角色声音参考已上传。", "success");
      }
      return true;
    } catch (_0x403bbe) {
      if (!_0x2c064b(_0x2ee0b6)) {
        return false;
      }
      if (_0x33096e) {
        _0x33096e.error = _0x403bbe?.message || "声音参考上传失败。";
      }
      _0x450b2c(_0x2ee0b6, _0x1735b7, {
        status: "failed",
        message: "本地音频保存失败",
        error: _0x403bbe?.message || "声音参考上传失败。"
      });
      if (_0x59fa6e(_0x2ee0b6)) {
        if (_0x3ffeb1.characterVoiceEditor?.assetId === _0x5b818a.id) {
          _0x3ffeb1.characterVoiceEditor.error = _0x403bbe?.message || "声音参考上传失败。";
        }
        _0xe5dd9c();
      }
      return false;
    } finally {
      if (_0x59fa6e(_0x2ee0b6)) {
        setStoryAssetVoiceGenerating(_0x3ffeb1, _0x5b818a.id, false);
        if (_0x3ffeb1.characterVoiceEditor?.assetId === _0x5b818a.id) {
          _0x3ffeb1.characterVoiceEditor.isGenerating = false;
        }
        _0xe5dd9c();
      }
    }
  }
  _0x17fec5?.addEventListener("change", async () => {
    const _0x45dbd0 = _0x17fec5.files?.[0];
    const _0x402d24 = _0x9f5855 || {
      projectToken: createStoryProjectTaskToken(_0x3ffeb1),
      assetId: _0x3ffeb1.pendingCharacterVoiceAssetId,
      editor: _0x3ffeb1.characterVoiceEditor
    };
    _0x9f5855 = null;
    _0x3ffeb1.pendingCharacterVoiceAssetId = "";
    _0x47e4c3 = _0x402d24;
    await _0x1923b3(_0x45dbd0, _0x402d24.assetId);
    _0x17fec5.value = "";
  });
  _0x334e5b?.addEventListener("change", async () => {
    const _0x5984e6 = _0x334e5b.files?.[0];
    await _0x1dd9a1(_0x5984e6);
    _0x334e5b.value = "";
  });
  _0x3b5272.addEventListener("dragover", _0x8578c7 => {
    const _0x378b0a = _0x8578c7.target.closest("[data-story-replication-grid]");
    if (_0x378b0a && _0x37672c) {
      _0x8578c7.preventDefault();
      _0x8578c7.stopPropagation();
      if (_0x8578c7.dataTransfer) {
        _0x8578c7.dataTransfer.dropEffect = "move";
      }
      const _0x23acc5 = [..._0x378b0a.querySelectorAll("article[data-story-replication-episode-id]")].find(_0x2d0391 => normalizeText(_0x2d0391.dataset.storyReplicationEpisodeId) === _0x37672c);
      const _0x21b3e6 = _0x8578c7.target.closest("article[data-story-replication-episode-id]");
      if (_0x23acc5 && _0x21b3e6 && _0x21b3e6 !== _0x23acc5) {
        const _0x5dfbf2 = _0x21b3e6.getBoundingClientRect();
        const _0x446818 = _0x23acc5.getBoundingClientRect();
        const _0x5107f1 = Math.abs(_0x446818.top - _0x5dfbf2.top) < Math.max(8, _0x5dfbf2.height * 0.35);
        const _0x50feb0 = _0x5107f1 ? Number(_0x8578c7.clientX) > _0x5dfbf2.left + _0x5dfbf2.width / 2 : Number(_0x8578c7.clientY) > _0x5dfbf2.top + _0x5dfbf2.height / 2;
        _0x378b0a.insertBefore(_0x23acc5, _0x50feb0 ? _0x21b3e6.nextSibling : _0x21b3e6);
      }
      return;
    }
    const _0x1c8143 = _0x8578c7.target.closest("[data-story-clip-prompt-surface]");
    if (_0x1c8143 && (_0x1b2c62 || hasStoryAssetDragData(_0x8578c7.dataTransfer))) {
      _0x8578c7.preventDefault();
      _0x8578c7.stopPropagation();
      if (_0x8578c7.dataTransfer) {
        _0x8578c7.dataTransfer.dropEffect = "copy";
      }
      _0x1c8143.classList.add("is-story-asset-drop-target");
      _0x79aba1(_0x1c8143.querySelector?.("[data-story-clip-prompt]"), _0x8578c7);
      return;
    }
    const _0x2d425b = _0x8578c7.target.closest("[data-story-character-voice-drop]");
    if (_0x2d425b) {
      _0x8578c7.preventDefault();
      _0x8578c7.stopPropagation();
      if (_0x8578c7.dataTransfer) {
        _0x8578c7.dataTransfer.dropEffect = "copy";
      }
      _0x2d425b.classList.add("is-dragover");
      return;
    }
    const _0x509be8 = _0x8578c7.target.closest("[data-story-replication-drop]");
    if (_0x509be8) {
      _0x8578c7.preventDefault();
      _0x8578c7.stopPropagation();
      if (_0x8578c7.dataTransfer) {
        _0x8578c7.dataTransfer.dropEffect = "copy";
      }
      _0x509be8.classList.add("is-dragover");
      return;
    }
    handleStoryHomeDocumentDragOver(_0x8578c7);
  });
  _0x3b5272.addEventListener("dragleave", _0x2fbb0f => {
    const _0x3c3fe1 = _0x2fbb0f.target.closest("[data-story-clip-prompt-surface]");
    if (_0x3c3fe1 && !_0x3c3fe1.contains(_0x2fbb0f.relatedTarget)) {
      _0x3c3fe1.classList.remove("is-story-asset-drop-target");
      _0x3a7987();
    }
    const _0x26e7e1 = _0x2fbb0f.target.closest("[data-story-character-voice-drop]");
    if (_0x26e7e1 && !_0x26e7e1.contains(_0x2fbb0f.relatedTarget)) {
      _0x26e7e1.classList.remove("is-dragover");
    }
    handleStoryHomeDocumentDragLeave(_0x2fbb0f);
    const _0x5acadf = _0x2fbb0f.target.closest("[data-story-replication-drop]");
    if (_0x5acadf && !_0x5acadf.contains(_0x2fbb0f.relatedTarget)) {
      _0x5acadf.classList.remove("is-dragover");
    }
  });
  _0x3b5272.addEventListener("drop", async _0x31b707 => {
    const _0x10a056 = _0x31b707.target.closest("[data-story-replication-grid]");
    if (_0x10a056 && _0x37672c) {
      _0x31b707.preventDefault();
      _0x31b707.stopPropagation();
      const _0x31bd2b = [..._0x10a056.querySelectorAll("article[data-story-replication-episode-id]")].map(_0x748339 => normalizeText(_0x748339.dataset.storyReplicationEpisodeId));
      _0x3ffeb1.data.episodes = reorderStoryVideoReplicationEpisodes(_0x3ffeb1.data.episodes, _0x31bd2b);
      syncStoryVideoReplicationProject(_0x3ffeb1.data);
      _0x3ffeb1.data.episodes.forEach((_0x2c5434, _0x50e3ee) => {
        const _0x339c0b = [..._0x10a056.querySelectorAll("article[data-story-replication-episode-id]")].find(_0x3fbbb7 => normalizeText(_0x3fbbb7.dataset.storyReplicationEpisodeId) === _0x2c5434.id);
        syncStoryVideoReplicationCardElement(_0x339c0b, _0x2c5434, _0x50e3ee);
      });
      _0x10a056.querySelectorAll(".story-replication-card.is-reordering").forEach(_0x323d0e => _0x323d0e.classList.remove("is-reordering"));
      _0x37672c = "";
      _0x31a289 = [];
      _0x10a056.classList.remove("is-reordering");
      _0x3c4e04({
        immediate: true
      });
      return;
    }
    const _0x18718a = _0x31b707.target.closest("[data-story-clip-prompt-surface]");
    const _0x43cb7b = readStoryAssetDragData(_0x31b707.dataTransfer) || _0x1b2c62;
    const _0x1deb90 = readStoryAssetDragItemIndex(_0x31b707.dataTransfer) || _0x4929ba;
    if (_0x18718a && _0x43cb7b) {
      _0x31b707.preventDefault();
      _0x31b707.stopPropagation();
      const _0x63d29d = _0x18718a.querySelector?.("[data-story-clip-prompt]");
      const _0x3554b3 = _0x79aba1(_0x63d29d, _0x31b707);
      _0x276cd4();
      if (!_0x6da5a0(_0x43cb7b, {
        assetIndex: _0x1deb90,
        triggerRange: _0x3554b3
      })) {
        _0x1ce8f7("素材引用添加失败，请重试。", "error");
      }
      return;
    }
    const _0x184d3f = _0x31b707.target.closest("[data-story-character-voice-drop]");
    if (_0x184d3f) {
      _0x31b707.preventDefault();
      _0x31b707.stopPropagation();
      _0x184d3f.classList.remove("is-dragover");
      const _0x47c395 = _0x31b707.dataTransfer?.files?.[0];
      await _0x1923b3(_0x47c395, _0x3ffeb1.characterVoiceEditor?.assetId);
      return;
    }
    const _0x3bfac0 = _0x31b707.target.closest("[data-story-replication-drop]");
    if (_0x3bfac0) {
      _0x31b707.preventDefault();
      _0x31b707.stopPropagation();
      _0x3bfac0.classList.remove("is-dragover");
      _0x56ac9c(_0x31b707.dataTransfer?.files);
      return;
    }
    await handleStoryHomeDocumentDrop(_0x31b707, _0x4922bd);
  });
  documentObject.addEventListener("click", _0x10bb90 => {
    if (storyClipProduction.shouldCloseAdjustmentOnOutsideClick(_0x3ffeb1, _0x10bb90.target)) {
      _0x3ffeb1.clipAdjustmentOpen = false;
      _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      _0x62a3ea();
    } else if (_0x3ffeb1.clipAdjustmentPromptModeOpen && !_0x10bb90.target.closest?.("[data-story-clip-adjustment-mode]")) {
      _0x3ffeb1.clipAdjustmentPromptModeOpen = false;
      _0x228c7a();
    }
    if (storyClipProduction.shouldClosePromptHistoryOnOutsideClick(_0x3ffeb1, _0x10bb90.target)) {
      _0x3ffeb1.clipPromptHistoryOpen = false;
      _0x2c3482();
    }
    if (!_0x3b5272.contains(_0x10bb90.target)) {
      _0x1d7b42("");
      _0x2255e5();
      _0x146793();
      _0x385608();
      _0x15093f();
      _0x5c09e0();
      _0x1e92bb();
    }
  });
  const _0x3297be = subscribeAssetMentionRegistry(() => {
    if (_0x4f8626 && _0x3ffeb1.view === "project" && _0x3ffeb1.step === 2 && _0x3ffeb1.assetFilter === "library") {
      _0xe5dd9c();
      return;
    }
    if (_0x4f8626 && _0x3ffeb1.view === "episode") {
      if (!_0x3ec4f9({
        refreshContent: true
      })) {
        _0xe5dd9c();
      }
    }
  });
  const _0x37907e = typeof subscribeCanvasNodeDeletions === "function" ? subscribeCanvasNodeDeletions(_0x1ac2a9) : null;
  const _0x197189 = typeof subscribeCanvasMediaNodeChanges === "function" ? subscribeCanvasMediaNodeChanges(_0xa86e33) : null;
  async function _0x7fa7d2() {
    if (typeof loadWorkspace !== "function") {
      _0x65309f.setReady(true);
      return;
    }
    const _0x1a23f7 = _0x65309f.getRevision();
    const _0x2d4122 = createStoryWorkspaceSnapshot(_0x3ffeb1);
    let _0x55ecf7 = false;
    let _0x363f39 = false;
    try {
      const _0x40740b = await loadWorkspace();
      await waitForRuntimeManifestLoad({
        timeoutMs: 500
      });
      const _0x1bef1b = parseStoryWorkspaceSnapshotPayload(_0x40740b);
      if (_0x1bef1b) {
        const _0x37bd3d = _0x1bef1b.projects.map(_0x461edf => {
          const _0x2781ba = _0x461edf?.data ? normalizeStoryWorkspaceAssetData(_0x461edf.data) : _0x461edf?.data;
          reconcilePersistedStoryProjectTasks(_0x2781ba);
          return {
            ..._0x461edf,
            data: _0x2781ba
          };
        });
        const _0x2f75e5 = _0x65309f.getRevision() !== _0x1a23f7 || hasStoryWorkspaceSnapshotChanged(_0x2d4122, createStoryWorkspaceSnapshot(_0x3ffeb1));
        if (_0x2f75e5) {
          _0x3ffeb1.projects = mergeStoryWorkspaceHydratedProjects(_0x3ffeb1.projects, _0x37bd3d);
          _0x3ffeb1.projects.forEach(_0xbc1d13 => {
            const _0x1096ff = normalizeText(_0xbc1d13?.id || _0xbc1d13?.data?.project?.id);
            if (_0x1096ff && _0xbc1d13.data?.project) {
              _0x52afbd.set(_0x1096ff, _0xbc1d13.data);
            }
          });
          _0x55ecf7 = _0x37bd3d.length > 0;
          _0x65309f.schedule();
        } else {
          _0x52afbd.clear();
          _0x3ffeb1.projects = _0x37bd3d;
          _0x3ffeb1.projects.forEach(_0x2e8d4d => {
            const _0x239e19 = normalizeText(_0x2e8d4d?.id || _0x2e8d4d?.data?.project?.id);
            if (_0x239e19 && _0x2e8d4d.data?.project) {
              _0x52afbd.set(_0x239e19, _0x2e8d4d.data);
            }
          });
          advanceStoryProjectSession(_0x3ffeb1);
          _0x3ffeb1.data = normalizeStoryWorkspaceAssetData(_0x1bef1b.currentData);
          reconcilePersistedStoryProjectTasks(_0x3ffeb1.data);
          if (_0x3ffeb1.data?.project?.id) {
            _0x52afbd.set(normalizeText(_0x3ffeb1.data.project.id), _0x3ffeb1.data);
          }
          _0x3ffeb1.data.project.planning = normalizeStoryProjectPlanning(_0x3ffeb1.data.project, {
            allowDeveloperPromptModes: _0x3ffeb1.developerModeAvailable
          });
          _0x3ffeb1.hasCreatedProject = _0x1bef1b.hasCreatedProject === true;
          _0x3ffeb1.projectTitleEdited = _0x1bef1b.projectTitleEdited === true;
          _0x3ffeb1.models = {
            ..._0x3ffeb1.models,
            ..._0x1bef1b.models
          };
          _0x3ffeb1.textProvider = _0x1bef1b.modelProviders?.text || getStoryWorkspaceModelChoice("text", _0x3ffeb1.models.text)?.provider || _0x3ffeb1.textProvider;
          _0x3ffeb1.textProviderProfileId = resolveStoryTextProviderProfileId(_0x3ffeb1.textProvider, _0x1bef1b.modelProviderProfiles?.text || _0x3ffeb1.textProviderProfileId);
          _0x3ffeb1.imageProvider = resolveModelProvider(_0x3ffeb1.models.image, _0x1bef1b.modelProviders?.image || _0x3ffeb1.imageProvider);
          _0x3ffeb1.imageGenerationParams = normalizeStoryImageGenerationParams(_0x3ffeb1.models.image, _0x1bef1b.modelParams?.image);
          _0x3ffeb1.imageGenerationParamsByModel = _0x1bef1b.modelParams?.imageByModel && typeof _0x1bef1b.modelParams.imageByModel === "object" ? {
            ..._0x1bef1b.modelParams.imageByModel
          } : {};
          _0x3ffeb1.videoProvider = resolveStoryVideoProvider(_0x3ffeb1.models.video, _0x1bef1b.modelProviders?.video || _0x3ffeb1.videoProvider);
          _0x3ffeb1.videoProviderProfileIdByModel = _0x1bef1b.modelProviderProfiles?.videoByModel && typeof _0x1bef1b.modelProviderProfiles.videoByModel === "object" ? {
            ..._0x1bef1b.modelProviderProfiles.videoByModel
          } : {};
          _0x3ffeb1.videoProviderProfileId = resolveModelProviderProfileId({
            model: _0x3ffeb1.models.video,
            providerProfileId: _0x1bef1b.modelProviderProfiles?.video || _0x3ffeb1.videoProviderProfileId,
            providerProfileIdByModel: _0x3ffeb1.videoProviderProfileIdByModel
          });
          _0x3ffeb1.videoGenerationParams = normalizeStoryVideoGenerationParams(_0x3ffeb1.models.video, _0x1bef1b.modelParams?.video);
          _0x3ffeb1.videoGenerationParamsByModel = _0x1bef1b.modelParams?.videoByModel && typeof _0x1bef1b.modelParams.videoByModel === "object" ? {
            ..._0x1bef1b.modelParams.videoByModel
          } : {};
          _0x3ffeb1.view = ["home", "project", "episode"].includes(_0x1bef1b.ui.view) ? _0x1bef1b.ui.view : "home";
          const _0x3f1947 = normalizeStoryWorkspaceStep(_0x1bef1b.ui.step);
          _0x3ffeb1.step = canEnterStoryWorkspaceStep(_0x3ffeb1.data, _0x3f1947) ? _0x3f1947 : 1;
          if (_0x3ffeb1.view === "episode" && !canEnterStoryWorkspaceStep(_0x3ffeb1.data, 3)) {
            _0x3ffeb1.view = "project";
          }
          _0x3ffeb1.homeTab = resolveStoryVideoReplicationHomeTab(_0x3ffeb1, _0x1bef1b.ui.homeTab);
          _0x3ffeb1.replicationTargetLocale = getStoryReplicationLocale(_0x1bef1b.ui.replicationTargetLocale).value;
          _0x3ffeb1.scriptMode = normalizeStoryScriptMode(_0x1bef1b.ui.scriptMode || _0x3ffeb1.data.project?.scriptMode);
          _0x3ffeb1.uploadInputMode = _0x1bef1b.ui.uploadInputMode === "paste" ? "paste" : "file";
          _0x3ffeb1.idea = String(_0x1bef1b.ui.idea || "").slice(0, STORY_IDEA_MAX_CHARACTERS);
          _0x3ffeb1.scriptFileName = String(_0x1bef1b.ui.scriptFileName || "");
          _0x3ffeb1.scriptText = String(_0x1bef1b.ui.scriptText || "").slice(0, STORY_SCRIPT_MAX_CHARACTERS);
          _0x3ffeb1.scriptCharacterCount = Number.isFinite(_0x1bef1b.ui.scriptCharacterCount) ? _0x1bef1b.ui.scriptCharacterCount : null;
          const _0x30cc5e = _0x3ffeb1.data.project?.sourceDocument;
          if (_0x30cc5e && typeof _0x30cc5e === "object") {
            _0x3ffeb1.scriptFileName = String(_0x30cc5e.fileName || _0x3ffeb1.scriptFileName);
            _0x3ffeb1.scriptText = String(_0x30cc5e.text || _0x3ffeb1.scriptText).slice(0, STORY_SCRIPT_MAX_CHARACTERS);
            _0x3ffeb1.scriptCharacterCount = Number.isFinite(_0x30cc5e.characterCount) ? _0x30cc5e.characterCount : _0x3ffeb1.scriptText.length;
          }
          _0x3ffeb1.assetFilter = _0x1bef1b.ui.assetFilter || _0x3ffeb1.assetFilter;
          _0x3ffeb1.assetSplitRatio = normalizeStoryAssetSplitRatio(_0x1bef1b.ui.assetSplitRatio);
          const _0x523e46 = normalizeStoryEpisodePanelRatios(_0x1bef1b.ui.episodeAssetPanelRatio, _0x1bef1b.ui.episodeEditorPanelRatio);
          _0x3ffeb1.episodeAssetPanelRatio = _0x523e46.left;
          _0x3ffeb1.episodeEditorPanelRatio = _0x523e46.center;
          _0x3ffeb1.episodeAssetRailTab = normalizeStoryEpisodeAssetRailTab(_0x1bef1b.ui.episodeAssetRailTab);
          _0x3ffeb1.assetAppearanceIndexes = _0x1bef1b.ui.assetAppearanceIndexes && typeof _0x1bef1b.ui.assetAppearanceIndexes === "object" ? {
            ..._0x1bef1b.ui.assetAppearanceIndexes
          } : {};
          _0x3ffeb1.outlineSectionOpenState = _0x1bef1b.ui.outlineSectionOpenState && typeof _0x1bef1b.ui.outlineSectionOpenState === "object" ? {
            ..._0x1bef1b.ui.outlineSectionOpenState
          } : {};
          _0x3ffeb1.pageScrollPositions = _0x1bef1b.ui.pageScrollPositions && typeof _0x1bef1b.ui.pageScrollPositions === "object" ? {
            ..._0x1bef1b.ui.pageScrollPositions
          } : {};
          _0x3ffeb1.experimentalSplitMode = _0x1bef1b.ui.experimentalSplitMode === true;
          _0x3ffeb1.selectedAssetId = _0x1bef1b.ui.selectedAssetId || "";
          _0x3ffeb1.selectedEpisodeId = _0x1bef1b.ui.selectedEpisodeId || "";
          _0x3ffeb1.selectedClipId = _0x1bef1b.ui.selectedClipId || "";
          _0x3ffeb1.characterVoiceEditor = normalizeStoryProjectVoiceEditor(_0x1bef1b.ui.characterVoiceEditor, _0x3ffeb1.data);
          _0x14d6f1(_0x3ffeb1.data);
          const _0x1a6859 = getSelectedEpisode(_0x3ffeb1);
          _0x363f39 = _0x2d0dd3(getSelectedClip(_0x3ffeb1, _0x1a6859), {
            episode: _0x1a6859,
            enteringEpisode: _0x3ffeb1.view === "episode"
          });
          _0x55ecf7 = true;
          if (_0x4f8626) {
            _0xe5dd9c({
              capturePageState: false
            });
          }
        }
      }
    } catch (_0x190844) {
      console.warn("[storyWorkspace] 用户数据加载失败", _0x190844);
      _0x65309f.setHydrationError(_0x190844);
      _0x1ce8f7("历史剧本项目加载失败，已暂停自动保存以防覆盖数据。", "error", 10000);
      return;
    }
    _0x65309f.setReady(true);
    if (typeof getCanvasMediaSnapshot === "function") {
      _0xa86e33(getCanvasMediaSnapshot() || {});
    }
    if (_0x363f39) {
      _0x3c4e04({
        immediate: true
      });
    }
    if (_0x55ecf7 && !_0x1de79f) {
      for (const _0x105a57 of _0x52afbd.values()) {
        _0x8e94a4(_0x105a57);
        _0x2841ee(_0x105a57);
      }
    }
    if (_0x55ecf7 && !_0x1de79f) {
      backfillStoryVideoThumbnails([..._0x52afbd.values()], {
        concurrency: 1
      }).then(_0xd222ac => {
        if (_0x1de79f || !_0xd222ac.updatedCount) {
          return;
        }
        _0x3c4e04({
          immediate: true
        });
        if (!_0x4f8626) {
          return;
        }
        if (_0x3ffeb1.view === "project" && _0x3ffeb1.step === 3) {
          _0xd222ac.changedEpisodeIds.forEach(_0x54988a => {
            _0x51af77(_0x54988a);
          });
        } else if (_0x3ffeb1.view === "episode" && _0xd222ac.changedEpisodeIds.includes(normalizeText(_0x3ffeb1.selectedEpisodeId))) {
          _0x3cb00d();
          _0x4cdd59();
        }
      }).catch(_0x37377a => {
        console.warn("[storyWorkspace] 历史视频缩略图补全失败", _0x37377a);
      });
    }
  }
  const _0xbe9171 = {
    activate: _0x501339,
    deactivate: _0x362be8,
    isActive: () => _0x4f8626,
    openHome() {
      _0x3ffeb1.view = "home";
      if (_0x4f8626) {
        _0xe5dd9c();
      } else {
        requestWorkspaceMode("story");
      }
    },
    openProject() {
      requestWorkspaceMode("story");
      _0x4dc275();
    },
    destroy() {
      _0x362be8();
      _0x1de79f = true;
      _0x4024e3();
      closeStoryRequestDebugPreview(documentObject);
      _0x4e50e6.destroy();
      _0x4c44ef.destroy();
      _0x3c8c92.destroy();
      _0x1da07b.forEach(_0x2da2e6 => _0x2da2e6.pause());
      _0x1da07b.clear();
      _0x5f32e0.clear();
      _0x30e879.clear();
      _0x4e3659({
        pending: false,
        refreshToolbar: false
      });
      _0x1f1468.clear();
      _0x25f8df({
        clearState: true
      });
      if (_0x5caa71) {
        windowObject.clearTimeout(_0x5caa71);
      }
      if (_0x32c8ec && typeof windowObject.cancelAnimationFrame === "function") {
        windowObject.cancelAnimationFrame(_0x32c8ec);
      }
      _0x32c8ec = 0;
      _0x46ef47?.destroy();
      _0x46ef47 = null;
      _0x276cd4();
      _0x493da1();
      _0x1203ba = null;
      _0x4823d1 = "";
      _0x65309f.destroy({
        flush: true,
        force: true
      }).catch(() => {});
      _0x3c5b96?.();
      _0x3297be?.();
      _0x37907e?.();
      _0x197189?.();
      _0x4bf4f6.querySelectorAll(":scope > .story-page").forEach(_0xaa1ae4);
      _0x5bb44c();
      _0x3b5272.removeEventListener("error", handleWorkspaceAssetLibraryImageError, true);
      windowObject?.removeEventListener?.("pointermove", _0x2033fd, true);
      windowObject?.removeEventListener?.("pointerup", _0x3928e0, true);
      windowObject?.removeEventListener?.("pointercancel", _0x3ce3f4, true);
      _0x3a9cf4.destroy();
      windowObject?.removeEventListener?.("keydown", _0xf3cc42, true);
      windowObject?.removeEventListener?.("aicanvas:runtime-info", _0x338ec4);
      windowObject?.removeEventListener?.("dev-mode-changed", _0x338ec4);
      _0x3b5272.remove();
    }
  };
  _0x3b5272._storyWorkspaceApi = _0xbe9171;
  _0x7fa7d2();
  return _0xbe9171;
}
