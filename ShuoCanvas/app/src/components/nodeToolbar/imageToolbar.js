import a442_0x3de47a from "../../core/stores/appStore.js";
import { generateId } from "../../core/math.js";
import { submitTask } from "../../core/generationTaskRuntime.js";
import a442_0x306613 from "../../modules/ImageCropController.js";
import a442_0x1c375d from "../../modules/ImageAnnotateController.js";
import a442_0x5ddaa2 from "../../modules/ImageExpandController.js";
import a442_0x149958, { createRunningHubTaskStateMachine } from "../../modules/ImageFreeAngleController.js";
import a442_0x205dae from "../../modules/ImageMattingController.js";
import a442_0x3b239b from "../../modules/VideoClipController.js";
import a442_0x4ff66e from "../../modules/VideoKeyingController.js";
import { closeActiveImagePreview, openNodeImagePreview } from "../../modules/imagePreview.js";
import { getImage } from "../../modules/storage.js";
import { showError, showWarning } from "../../services/index.js";
import { buildSourceMediaNodePayload } from "../../services/fileService.js";
import { resolveCanvasImagePreviewUrl } from "../../services/canvasMediaLocalService.js";
import { desktopBridge } from "../../services/desktopBridge.js";
import { saveMediaDownload } from "../../services/downloadSaveService.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch } from "../aigenImage/imageGenerationResultRenderer.js";
import { buildStoryboardNodePayload, computePreparedStoryboardSize, resolveNearestStoryboardAspect } from "../../core/storyboardFactory.js";
import { calcDisplaySizeByMedia } from "../../services/mediaRatioService.js";
import { registerStaticInnerHTML } from "../../utils/dom.js";
import { fetchRemoteBlob } from "../../../api/projectsV2Api.js";
import { resumeApimartMidjourneyUpscaleTask, resumeRunningHubImageTask, submitApimartMidjourneyUpscaleRequest, submitApimartMidjourneyVariationRequest } from "../../../api/aiImageApi.js";
import { runRunninghubAiApp, runRunninghubWorkflow, resumeRunninghubWorkflowTask } from "../../../api/runninghubWorkflowApi.js";
import { processInputVideos } from "../../../api/videoUploadApi.js";
import { buildApiUrl } from "../../../api/apiBase.js";
import { processInputImages } from "../../../api/imageUploadApi.js";
import { getProviderConfig, ensureConfig } from "../../../api/configApi.js";
import { calcSafeSpawnPosNearNode } from "../../modules/nodeSpawn.js";
import { t } from "../../i18n/index.js";
import { executeCommand } from "../../core/interaction.js";
import { commit } from "../../modules/history.js";
import { IMAGE_TOOLBAR_HTML } from "./imageToolbarHtml.js";
import { showDevToast } from "./toolbarShared.js";
import { bindImageToolbarLayoutUi } from "./imageToolbarLayoutUi.js";
import { bindRunningHubToolbarTaskButton, cancelRunningHubRemoteTaskQuietly, cancelRunningHubResultTask, findRunningHubToolbarTaskForNode, isRunningHubToolbarTaskCancelled, notifyRunningHubToolbarTasksChanged } from "./runningHubToolbarTaskButton.js";
import { IMAGE_TOOLBAR_ACTIONS, normalizeImageToolbarLayout, serializeImageToolbarLayout } from "../../modules/imageToolbarLayoutMemory.js";
import { executeGridCrop, prepareGridCells } from "../../modules/imageToolbarGridCrop.js";
import { buildToolbarImageFields, saveOutputImageResult, saveRemoteImageResultLocally } from "../../modules/imageToolbarOutputActions.js";
import { extractFirstImageUrl, parseRhCode, parseRhTaskId, resolveApiInputRatioBasis, resolveFinalResultDisplaySize } from "../../modules/imageToolbarHelpers.js";
import { bindPreviewUploadToolbarAction } from "../../modules/previewUploadEntry.js";
import { bindImageAnnotateCloneActions } from "./imageActions/annotateCloneAction.js";
import { bindImageMattingAction } from "./imageActions/mattingAction.js";
import { bindImageAutoSubjectAction } from "./imageActions/autoSubjectAction.js";
import { bindImagePanorama360Action } from "./imageActions/panorama360Action.js";
import { bindImageHdAction } from "./imageActions/hdAction.js";
import { bindApimartMidjourneyActions } from "./imageActions/midjourneyAction.js";
import { bindImageCropAction } from "./imageActions/cropAction.js";
import { bindImageExpandAction } from "./imageActions/expandAction.js";
import { bindImageAnnotateAction } from "./imageActions/annotateAction.js";
import { bindImageFreeAngleAction } from "./imageActions/freeAngleAction.js";
import { bindImageMultigridAction } from "./imageActions/multigridAction.js";
import { bindImageDownloadAction } from "./imageActions/downloadAction.js";
import { bindImageFullscreenAction } from "./imageActions/fullscreenAction.js";
import { bindImageResetSizeAction } from "./imageActions/resetSizeAction.js";
import { bindApimartPrivateAvatarAction } from "./apimartPrivateAvatarAction.js";
const getStateSnapshot = () => typeof a442_0x3de47a.getStateRaw === "function" ? a442_0x3de47a.getStateRaw() : a442_0x3de47a.getState();
function imageToolbarText(_0x1a6c5f, _0x499868 = {}) {
  return t("nodeToolbar.image." + _0x1a6c5f, _0x499868);
}
function createViewportSnapshotTracker() {
  let _0xe65972 = getStateSnapshot().viewport || {};
  let _0x5f30e9 = typeof a442_0x3de47a.subscribeSelector === "function" ? a442_0x3de47a.subscribeSelector(_0x57fa99 => _0x57fa99.viewport, _0x5c3151 => {
    _0xe65972 = _0x5c3151 || {};
  }) : null;
  return {
    openedViewport: {
      ..._0xe65972
    },
    getViewport: () => _0xe65972,
    dispose: () => {
      _0x5f30e9?.();
      _0x5f30e9 = null;
    }
  };
}
const TOOLBAR_TASK_CANCELLED_MESSAGE = imageToolbarText("taskCancelled");
const IMAGE_LOCAL_SAVE_FAILURE_MESSAGE = imageToolbarText("localSaveGeneratedFailed");
function createToolbarCancelledError() {
  const _0x335c49 = new Error(TOOLBAR_TASK_CANCELLED_MESSAGE);
  _0x335c49.name = "AbortError";
  return _0x335c49;
}
function isToolbarCancelledError(_0x41dd74) {
  const _0x19212c = String(_0x41dd74?.message || _0x41dd74 || "");
  return _0x41dd74?.name === "AbortError" || _0x19212c === TOOLBAR_TASK_CANCELLED_MESSAGE || _0x19212c === "CANCELLED" || _0x19212c.toLowerCase().includes("aborted");
}
function createLocalSaveFailureError() {
  const _0x5749a1 = new Error(IMAGE_LOCAL_SAVE_FAILURE_MESSAGE);
  _0x5749a1.isLocalSaveFailure = true;
  return _0x5749a1;
}
function isLocalSaveFailure(_0x2a35c4) {
  return _0x2a35c4?.isLocalSaveFailure === true || String(_0x2a35c4?.message || _0x2a35c4 || "") === IMAGE_LOCAL_SAVE_FAILURE_MESSAGE;
}
function throwIfToolbarTaskCancelled(_0x2ffc27) {
  if (isRunningHubToolbarTaskCancelled(_0x2ffc27)) {
    throw createToolbarCancelledError();
  }
}
function selectToolbarTaskNode(_0x4166ae) {
  a442_0x3de47a.setSelectedNodes([_0x4166ae]);
}
function notifyImageToolbarTaskChange({
  sourceNodeId: _0x43a38c,
  targetNodeId: _0x4bfff2
}) {
  notifyRunningHubToolbarTasksChanged({
    sourceNodeId: _0x43a38c,
    outId: _0x4bfff2
  });
  window._triggerLocalCacheSave?.();
}
function buildClearedImageMediaFields() {
  return {
    imageUrl: "",
    sourceUrl: "",
    thumbUrl: "",
    src: "",
    localPath: ""
  };
}
export { IMAGE_TOOLBAR_HTML };
registerStaticInnerHTML("toolbar:image", IMAGE_TOOLBAR_HTML);
function getToolbarActionFromButton(_0x39fc5c) {
  if (!_0x39fc5c?.classList) {
    return "";
  }
  for (const _0x896271 of _0x39fc5c.classList) {
    if (!_0x896271.startsWith("act-")) {
      continue;
    }
    const _0x1b49ef = _0x896271.slice(4);
    if (IMAGE_TOOLBAR_ACTIONS.includes(_0x1b49ef)) {
      return _0x1b49ef;
    }
  }
  return "";
}
export function bindImageToolbarEvents(_0x449185, _0x677745) {
  if (!_0x449185) {
    return;
  }
  const _0x280929 = typeof _0x677745 === "string" ? _0x677745 : _0x677745?.id;
  if (!_0x280929) {
    return;
  }
  const _0x45960e = () => getStateSnapshot().nodes?.[_0x280929] || (typeof _0x677745 === "object" ? _0x677745 : null);
  _0x449185.addEventListener("pointerdown", _0xc825cc => _0xc825cc.stopPropagation());
  _0x449185.addEventListener("dblclick", _0x1d42f0 => {
    _0x1d42f0.preventDefault();
    _0x1d42f0.stopPropagation();
  });
  const _0x4d4847 = bindImageToolbarLayoutUi(_0x449185, {
    store: a442_0x3de47a,
    getStateSnapshot: getStateSnapshot,
    imageToolbarActions: IMAGE_TOOLBAR_ACTIONS,
    normalizeImageToolbarLayout: normalizeImageToolbarLayout,
    serializeImageToolbarLayout: serializeImageToolbarLayout,
    getToolbarActionFromButton: getToolbarActionFromButton
  });
  const _0x263b35 = createRunningHubTaskStateMachine();
  const _0x2248bb = _0x263b35.state;
  const _0x1b8e03 = {
    toolbarEl: _0x449185,
    nodeId: _0x280929,
    mediaKind: "image",
    getNodeData: _0x45960e,
    getStateSnapshot: getStateSnapshot,
    _hdTaskMachine: _0x263b35,
    _hdState: _0x2248bb,
    store: a442_0x3de47a,
    generateId: generateId,
    submitTask: submitTask,
    ImageCropController: a442_0x306613,
    ImageAnnotateController: a442_0x1c375d,
    ImageExpandController: a442_0x5ddaa2,
    ImageMattingController: a442_0x205dae,
    closeActiveImagePreview: closeActiveImagePreview,
    openNodeImagePreview: openNodeImagePreview,
    getImage: getImage,
    buildSourceMediaNodePayload: buildSourceMediaNodePayload,
    resolveCanvasImagePreviewUrl: resolveCanvasImagePreviewUrl,
    localPathToUrl: localPathToUrl,
    saveMediaFile: desktopBridge.nodeExport.canSaveMedia() ? saveMediaDownload : null,
    buildImageGenerationFailurePatch: buildImageGenerationFailurePatch,
    buildImageGenerationResultPatch: buildImageGenerationResultPatch,
    buildStoryboardNodePayload: buildStoryboardNodePayload,
    computePreparedStoryboardSize: computePreparedStoryboardSize,
    resolveNearestStoryboardAspect: resolveNearestStoryboardAspect,
    calcDisplaySizeByMedia: calcDisplaySizeByMedia,
    fetchRemoteBlob: fetchRemoteBlob,
    resumeRunningHubImageTask: resumeRunningHubImageTask,
    submitApimartMidjourneyUpscaleRequest: submitApimartMidjourneyUpscaleRequest,
    submitApimartMidjourneyVariationRequest: submitApimartMidjourneyVariationRequest,
    resumeApimartMidjourneyUpscaleTask: resumeApimartMidjourneyUpscaleTask,
    runRunninghubAiApp: runRunninghubAiApp,
    runRunninghubWorkflow: runRunninghubWorkflow,
    resumeRunninghubWorkflowTask: resumeRunninghubWorkflowTask,
    processInputImages: processInputImages,
    getProviderConfig: getProviderConfig,
    ensureConfig: ensureConfig,
    calcSafeSpawnPosNearNode: calcSafeSpawnPosNearNode,
    executeCommand: executeCommand,
    bindRunningHubToolbarTaskButton: bindRunningHubToolbarTaskButton,
    cancelRunningHubRemoteTaskQuietly: cancelRunningHubRemoteTaskQuietly,
    cancelRunningHubResultTask: cancelRunningHubResultTask,
    findRunningHubToolbarTaskForNode: findRunningHubToolbarTaskForNode,
    isRunningHubToolbarTaskCancelled: isRunningHubToolbarTaskCancelled,
    executeGridCrop: executeGridCrop,
    prepareGridCells: prepareGridCells,
    buildToolbarImageFields: buildToolbarImageFields,
    saveOutputImageResult: saveOutputImageResult,
    saveRemoteImageResultLocally: saveRemoteImageResultLocally,
    extractFirstImageUrl: extractFirstImageUrl,
    parseRhCode: parseRhCode,
    parseRhTaskId: parseRhTaskId,
    resolveApiInputRatioBasis: resolveApiInputRatioBasis,
    resolveFinalResultDisplaySize: resolveFinalResultDisplaySize,
    createViewportSnapshotTracker: createViewportSnapshotTracker,
    createToolbarCancelledError: createToolbarCancelledError,
    isToolbarCancelledError: isToolbarCancelledError,
    createLocalSaveFailureError: createLocalSaveFailureError,
    isLocalSaveFailure: isLocalSaveFailure,
    throwIfToolbarTaskCancelled: throwIfToolbarTaskCancelled,
    selectToolbarTaskNode: selectToolbarTaskNode,
    notifyImageToolbarTaskChange: notifyImageToolbarTaskChange,
    buildClearedImageMediaFields: buildClearedImageMediaFields,
    IMAGE_LOCAL_SAVE_FAILURE_MESSAGE: IMAGE_LOCAL_SAVE_FAILURE_MESSAGE
  };
  bindPreviewUploadToolbarAction({
    button: _0x449185.querySelector(".act-upload")
  });
  bindImageAnnotateCloneActions(_0x1b8e03);
  bindImageMattingAction(_0x1b8e03);
  bindImageAutoSubjectAction(_0x1b8e03);
  bindImagePanorama360Action(_0x1b8e03);
  bindApimartPrivateAvatarAction(_0x1b8e03);
  bindImageHdAction(_0x1b8e03);
  bindApimartMidjourneyActions(_0x1b8e03);
  bindImageCropAction(_0x1b8e03);
  bindImageExpandAction(_0x1b8e03);
  bindImageAnnotateAction(_0x1b8e03);
  bindImageFreeAngleAction(_0x1b8e03);
  bindImageMultigridAction(_0x1b8e03);
  bindImageDownloadAction(_0x1b8e03);
  bindImageFullscreenAction(_0x1b8e03);
  bindImageResetSizeAction(_0x1b8e03);
}