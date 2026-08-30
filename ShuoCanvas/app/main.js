import a291_0xdc147a, { graphStore, uiStore, workspaceStore } from "./src/core/stores/appStore.js";
import { subscribeNodeDeletions } from "./src/core/nodeDeletionEvents.js";
import { pauseActiveWorkspaceTasks } from "./src/core/generationTaskRuntime.js";
import { initRenderer, clearRendererCache, refreshManifestModelNodeUis } from "./src/core/renderer.js";
import { createCanvasViewportVideoWarmupController } from "./src/core/canvasViewportVideoWarmupController.js";
import { initRendererUiEvents, installRendererEventBindingGuard } from "./src/ui/rendererUiEvents.js";
import { desktopBridge, installDesktopBridgeCompat } from "./src/services/desktopBridge.js";
import { scheduleChromeShellStartupReady } from "./src/services/chromeShellStartupReadiness.js";
import { migrateLegacyRendererStorageIfNeeded } from "./src/services/legacyRendererStorageMigration.js";
import { executeCanvasCommand, executeCommand, getDragContext, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel, handleWheelPan, settleWheelZoom, settleWheelPan, initCanvasContextMenu, initConnectionHandles, initPickConnect } from "./src/core/interaction.js";
import { addEdgeWithPolicies } from "./src/modules/interaction/EdgeController.js";
import { registerNode } from "./src/modules/registry.js";
import { getNodeTypeAliases } from "./src/modules/nodeMeta.js";
import { SourceTextNode } from "./src/components/SourceTextNode.js";
import { SourceImageNode } from "./src/components/SourceImageNode.js";
import { SourceVideoNode } from "./src/components/SourceVideoNode.js";
import { SourceAudioNode } from "./src/components/SourceAudioNode.js";
import { WebPreviewNode } from "./src/components/WebPreviewNode.js";
import { WebReferenceCardNode } from "./src/components/WebReferenceCardNode.js";
import { MediaClipNode } from "./src/components/MediaClipNode.js";
import { CommentNoteNode } from "./src/components/CommentNoteNode.js";
import { AIGenerateNode } from "./src/components/AIGenerateNode.js";
import { AIGenTextNode } from "./src/components/AIGenTextNode.js";
import { AIGenVideoNode } from "./src/components/AIGenVideoNode.js";
import { AIGenAudioNode } from "./src/components/AIGenAudioNode.js";
import { GroupNode } from "./src/components/GroupNode.js";
import { DebugNode } from "./src/components/DebugNode.js";
import { SceneDetectionNode } from "./src/components/SceneDetectionNode.js";
import { showDevToast } from "./src/components/NodeToolbarConfig.js";
import { setTextWithLineBreaks } from "./src/utils/dom.js";
import { StoryboardNode } from "./src/components/StoryboardNode.js";
import { StoryboardScriptNode } from "./src/components/StoryboardScriptNode.js";
import { CollageNode } from "./src/components/CollageNode.js";
import { PanoramaSceneNode } from "./src/components/PanoramaSceneNode.js";
import { WhiteboardNode } from "./src/components/WhiteboardNode.js";
import { undo, redo, commit, onCommit, createHistoryCheckpoint, undoToHistoryCheckpoint } from "./src/modules/history.js";
import * as a291_0x302295 from "./src/modules/project.js";
import { closeShortcuts } from "./src/modules/shortcuts.js";
import { initToastService, initKeyboardService, addShortcutListener, handleFileDrop, handleWebImageUrlDrop, getBaseName, getNodeDefaultSize, getAIGenerationDefaultSizeByType, getAIGenerationNodeSize, processFile, showError, initDesktopMediaWakeService, initStoreRuntimeEffects } from "./src/services/index.js";
import { saveOutputFromUrl, uploadFile } from "./src/services/projectService.js";
import { migrateLegacyThumbnailsInMultiData } from "./src/services/thumbnailCacheService.js";
import { initWebPreviewViewSyncService } from "./src/services/webPreviewViewSyncService.js";
import { sanitizeMultiCanvasDataForPersistence } from "./src/utils/thumbnailPersistence.js";
import { loadCustomPresets } from "./src/modules/promptPresets.js";
import { getProjects as a291_0x59bc95, createProject as a291_0x28c4be, deleteProject as a291_0x287df5, fetchApiConfigFromServer, saveApiConfigToServer, testProviderConnections, analyzeCustomProviderDocumentation as a291_0x510e65, buildCustomProviderManifestDraft, deleteCustomProviderManifestBundle, discoverCustomProvider, listCustomProviderManifestBundles, saveCustomProviderManifestBundle, validateCustomProviderManifestDraft, fetchDreaminaCliStatusFromServer, fetchDreaminaCliLoginRuntimeFromServer, startDreaminaHeadlessLoginFromServer, startDreaminaHeadlessReloginFromServer, startDreaminaWebLoginFromServer, importDreaminaLoginResponseFromServer, logoutDreaminaFromServer, buildDreaminaQrImageUrl, startServerConnectionMonitor, fetchAppRuntimeInfoFromServer, requestAgentAssistantReply, requestAgentActionPlan, adjustStoryClipPrompt, generateImage, generateVideo, generateStoryEpisodeScript, generateStorySummary, extractStoryAssets, extractStoryAssetsParallel, extractStoryAssetsHybridExperimental, planStoryEpisodeOutlines, recoverStoryEpisodeSplitDraftLocally, reviewStoryEpisodeSplitQuality, splitStoryEpisodeChecked, splitStoryEpisodesBatch, splitStoryEpisodeExperimental, extractStoryDocumentText, fetchStoryWorkspaceFromServer, saveStoryWorkspaceToServer, fetchReplacementStudioWorkspaceFromServer, saveReplacementStudioWorkspaceToServer, fetchVideoReplicationWorkspaceFromServer, saveVideoReplicationWorkspaceToServer, analyzeVideoReplicationClip, getPersonReplacementModelPackStatus, installPersonReplacementModelPack } from "./api/index.js";
import { initMinimap } from "./src/modules/minimap.js";
import a291_0xd6610 from "./src/modules/ImageAnnotateController.js";
import a291_0x20df35 from "./src/modules/ImageMattingController.js";
import a291_0x2744ce from "./src/modules/AudioClipController.js";
import { runAudioSeparationFromNode } from "./src/modules/AudioSeparationController.js";
import { CanvasTabManager } from "./src/modules/CanvasTabManager.js";
import { CanvasProjectDropdownManager } from "./src/modules/CanvasProjectDropdownManager.js";
import { SettingsManager } from "./src/modules/SettingsManager.js";
import { createNodeManagerPanel } from "./src/modules/nodeManager/NodeManagerPanel.js";
import { initCliProviderSettings } from "./src/modules/settings/cliProviderSettings.js";
import { initModelServiceSettingsNavigator } from "./src/modules/settings/modelServiceSettingsNavigator.js";
import { MascotManager } from "./src/modules/MascotManager.js";
import { initAutoUpdate } from "./src/modules/AutoUpdate.js";
import { initDiagnosticsService } from "./src/services/diagnosticsService.js";
import { initExternalLinkHandlers } from "./src/services/externalLinkService.js";
import { initDevEntries } from "./src/modules/devEntry.js";
import { initFloatingMenuKeyboard } from "./src/modules/floatingMenuKeyboard.js";
import { initTextInputContextMenu } from "./src/modules/textInputContextMenu.js";
import { initTaskCenterManager } from "./src/modules/TaskCenterManager.js";
import { initAudioVoicePanel } from "./src/modules/audioVoicePanel.js";
import { initStoryWorkspace } from "./src/modules/storyWorkspace/storyWorkspace.js";
import { showStoryWorkspaceBetaNotice } from "./src/modules/storyWorkspace/storyWorkspaceBetaNotice.js";
import { guardStoryModelTaskCredentials } from "./src/modules/storyWorkspace/storyModelCredentialGuard.js";
import { createReplacementStudioApplication } from "./src/modules/personReplacement/personReplacementApplication.js";
import { ReplacementStudioModelGate } from "./src/modules/personReplacement/personReplacementModelGate.js";
import { isReplacementStudioAuthorized, requestReplacementStudioAuthorization } from "./src/modules/personReplacement/replacementStudioAccess.js";
import { showReplacementStudioBetaNotice } from "./src/modules/personReplacement/replacementStudioBetaNotice.js";
import { REPLACEMENT_STUDIO_MODE_ID } from "./src/modules/personReplacement/replacementStudioTerminology.js";
import { isVideoReplicationStudioAvailable } from "./src/modules/videoReplication/videoReplicationStudioAccess.js";
import { createVideoReplicationApplication } from "./src/modules/videoReplication/videoReplicationApplication.js";
import { createWorkspaceModeCoordinator, isStoryboard3DWorkspaceAvailable } from "./src/modules/workspaceModeCoordinator.js";
import { getAssetMentionCandidates, subscribeAssetMentionRegistry } from "./src/modules/assetMentionRegistry.js";
import { createStoryEpisodeCanvas as a291_0x3a6777, createStoryEpisodeCanvasAdapter } from "./src/modules/storyWorkspace/storyEpisodeCanvas.js";
import { syncPersonReplacementCanvas } from "./src/modules/personReplacement/personReplacementOutputCanvas.js";
import { createStoryProjectCanvasAdapter, syncStoryProjectCanvas } from "./src/modules/storyWorkspace/storyProjectCanvas.js";
import { createStoryClipFrameCanvasAdapter, deleteStoryCanvasMediaNodes, syncStoryClipFrameToCanvas } from "./src/modules/storyWorkspace/storyCanvasMediaSync.js";
import { getStoryCanvasMediaNodeSnapshot, subscribeStoryCanvasMediaNodeChanges } from "./src/modules/storyWorkspace/storyCanvasNodeSubscription.js";
import { createStoryboard3DWorkspaceController } from "./src/modules/storyboard3d/workspaceController.js";
import { installStoryboard3DExportCanvasBridge } from "./src/modules/storyboard3d/exportCanvasBridge.js";
import { installTooltipUnifier } from "./src/modules/tooltipUnifier.js";
import { reportAppStartupActivity } from "./api/appActivityApi.js";
import { createDefaultSubscriptionState, isModelAllowed, isSubscriptionActive, isActivationRequestAccepted, normalizeSubscriptionPayload, ensureDeviceId, ensureInstallId, pullSubscriptionState, submitCdkey, clearSubscriptionAuthorization, DEFAULT_VIP_GATE_MODEL_ID, getVipModelDisplayName } from "./src/modules/subscriptionAccess.js";
import { createModelCatalogService } from "./src/modules/modelCatalogService.js";
import { createAppBusinessEvents } from "./src/modules/app/appBusinessEvents.js";
import { createAppCanvasNodeFlows } from "./src/modules/app/canvasNodeFlows.js";
import { createAppTopbarAndConfig } from "./src/modules/app/appTopbarAndConfig.js";
import { createAppPanels } from "./src/modules/app/appPanels.js";
import { createAppViewport } from "./src/modules/app/appViewport.js";
import { createAgentMaterialUploader } from "./src/modules/app/agentMaterialUpload.js";
import { createCanvasAgentDebugApi, createCanvasCommandsDebugApi, installAppDebugApis } from "./src/modules/app/appDebugApis.js";
import { installAppCanvasPointerBindings } from "./src/modules/app/appCanvasPointerBindings.js";
import { installNativeContextMenuGuard } from "./src/modules/app/nativeContextMenuGuard.js";
import { installAppCanvasDropImport, openAppCanvasFilePicker } from "./src/modules/app/appCanvasDropImport.js";
import { initAppRuntimeInfo } from "./src/modules/app/appRuntimeInfo.js";
import { initAppActivityTracking } from "./src/modules/app/appActivityTracking.js";
import { initAppShellUi } from "./src/modules/app/appShellUi.js";
import { bindIconButtonMotion } from "./src/modules/app/iconButtonMotion.js";
import { initSelectionMediaProperties } from "./src/modules/selectionMediaProperties.js";
import { installGlobalScreenshotBridge } from "./src/modules/app/globalScreenshotBridge.js";
import { createAppProjectContext } from "./src/modules/app/projectContext.js";
import { createSourceNodeNameBackfill } from "./src/modules/app/sourceNodeNameBackfill.js";
import { executeGridCrop } from "./src/modules/imageToolbarGridCrop.js";
import { createCanvasCommandContext, executeCanvasCommand as a291_0x274338, executeCanvasCommandPlan as a291_0x4bfabd } from "./src/modules/canvasCommands/index.js";
import { runSmartClipKeyframeExtractionFromVideoNode } from "./src/modules/VideoClipController.js";
import { runVideoAudioSeparationFromNode } from "./src/modules/VideoAudioSeparationController.js";
import { runVideoReverseFromNode } from "./src/modules/VideoReverseController.js";
import { createAgentConversationStore, createAgentModelSettings, createAgentRuntime, createAgentSessionStore, initAgentPanel } from "./src/modules/agent/index.js";
import { createSpecialNodeDataByType, initAppNodeEntry } from "./src/modules/app/appNodeEntry.js";
import { buildAppCanvasNodeData } from "./src/modules/app/canvasNodeDataFactory.js";
import { bootstrapAppProject } from "./src/modules/app/projectBootstrap.js";
import { getLocale, initI18nDomBindings, t } from "./src/i18n/index.js";
installDesktopBridgeCompat();
await migrateLegacyRendererStorageIfNeeded();
window._isSessionActive = true;
initI18nDomBindings();
initToastService();
initDiagnosticsService();
initExternalLinkHandlers();
initKeyboardService();
initFloatingMenuKeyboard();
initTextInputContextMenu();
installNativeContextMenuGuard();
initTaskCenterManager();
installTooltipUnifier();
initDesktopMediaWakeService();
startServerConnectionMonitor();
window.AI_CANVAS_IS_DEV_BUILD = false;
const appRuntimeInfoPromise = initAppRuntimeInfo({
  fetchAppRuntimeInfo: fetchAppRuntimeInfoFromServer,
  initDevEntries: initDevEntries,
  windowObject: window
});
initAppActivityTracking({
  runtimeInfoPromise: appRuntimeInfoPromise,
  ensureDeviceId: ensureDeviceId,
  reportStartupActivity: reportAppStartupActivity,
  navigatorObject: window.navigator
});
const NODE_COMPONENTS = {
  "source-text": SourceTextNode,
  "comment-note": CommentNoteNode,
  "source-image": SourceImageNode,
  "source-video": SourceVideoNode,
  "source-audio": SourceAudioNode,
  "web-preview": WebPreviewNode,
  "web-reference-card": WebReferenceCardNode,
  "media-clip": MediaClipNode,
  "ai-image": AIGenerateNode,
  "ai-text": AIGenTextNode,
  "ai-video": AIGenVideoNode,
  "ai-audio": AIGenAudioNode,
  "scene-detection": SceneDetectionNode,
  group: GroupNode,
  debug: DebugNode,
  collage: CollageNode,
  whiteboard: WhiteboardNode,
  storyboard: StoryboardNode,
  "storyboard-script": StoryboardScriptNode,
  "panorama-scene": PanoramaSceneNode,
  "panorama-360": PanoramaSceneNode
};
for (const [type, ComponentClass] of Object.entries(NODE_COMPONENTS)) {
  registerNode(type, ComponentClass);
  for (const alias of getNodeTypeAliases(type)) {
    registerNode(alias, ComponentClass);
  }
}
const wrap = document.getElementById("v2-wrap");
const canvas = document.getElementById("v2-canvas");
const canvasStage = canvas?.closest?.(".v2-canvas-stage") || wrap;
const debug = document.getElementById("v2-debug");
const translateAppText = (_0x35c02d, _0x3f6684 = {}) => t("app." + _0x35c02d, _0x3f6684);
const appProjectContext = createAppProjectContext({
  windowObject: window
});
const syncCanvasViewportScreenOrigin = () => {
  const _0x3fd1ec = canvasStage?.getBoundingClientRect?.();
  graphStore.setViewportScreenOrigin?.(_0x3fd1ec?.left || 0, _0x3fd1ec?.top || 0);
};
syncCanvasViewportScreenOrigin();
const canvasStageResizeObserver = typeof ResizeObserver === "function" && canvasStage ? new ResizeObserver(syncCanvasViewportScreenOrigin) : null;
canvasStageResizeObserver?.observe(canvasStage);
window.addEventListener("resize", syncCanvasViewportScreenOrigin);
window.addEventListener("beforeunload", () => {
  canvasStageResizeObserver?.disconnect();
  window.removeEventListener("resize", syncCanvasViewportScreenOrigin);
}, {
  once: true
});
installRendererEventBindingGuard();
initRenderer(wrap, canvas, a291_0xdc147a);
const disposeCanvasViewportVideoWarmup = createCanvasViewportVideoWarmupController({
  store: a291_0xdc147a,
  containerEl: canvas?.parentElement || wrap
});
window.addEventListener("beforeunload", disposeCanvasViewportVideoWarmup, {
  once: true
});
initRendererUiEvents({
  wrap: wrap,
  store: a291_0xdc147a
});
initWebPreviewViewSyncService({
  graphStore: graphStore,
  root: document
});
initStoreRuntimeEffects(a291_0xdc147a);
workspaceStore.setSubscriptionState(createDefaultSubscriptionState());
window.CanvasTabManager = CanvasTabManager;
const sourceNodeNameBackfill = createSourceNodeNameBackfill({
  graphStore: graphStore,
  getBaseName: getBaseName,
  translate: translateAppText
});
const appProjectLifecycle = bootstrapAppProject({
  store: a291_0xdc147a,
  CanvasTabManager: CanvasTabManager,
  project: a291_0x302295,
  loadCustomPresets: loadCustomPresets,
  migrateLegacyThumbnailsInMultiData: migrateLegacyThumbnailsInMultiData,
  sanitizeMultiCanvasDataForPersistence: sanitizeMultiCanvasDataForPersistence,
  commit: commit,
  patchStoreSourceNodeNamesFromFileName: sourceNodeNameBackfill.patchStoreSourceNodeNamesFromFileName,
  applySourceNamesFromFileNameToCanvas: sourceNodeNameBackfill.applySourceNamesFromFileNameToCanvas,
  uploadFile: uploadFile,
  getBaseName: getBaseName
});
initAppShellUi({
  store: graphStore,
  uiStore: uiStore,
  initMinimap: initMinimap,
  minimapEl: document.getElementById("minimap"),
  btnMinimapEl: document.getElementById("btnMinimap"),
  minimapWrapperEl: document.getElementById("minimapWrapper"),
  btnToggleDotsEl: document.getElementById("btnToggleDots"),
  btnConnectionLinesToggleEl: document.getElementById("btnConnectionLinesToggle"),
  btnAddCanvasEl: document.getElementById("btnAddCanvas"),
  addCanvas: () => CanvasTabManager.addCanvas(),
  readGridDotsPref: SettingsManager.readGridDotsPref,
  setGridDotsPref: SettingsManager.setGridDotsPref,
  showDevToast: showDevToast
});
const disposeIconButtonMotion = bindIconButtonMotion(document.querySelectorAll(".sidebar-floating .sidebar-btn-v3, .sidebar-floating .user-gear-plain, .canvas-controls-floating .cc-btn"));
window.addEventListener("beforeunload", disposeIconButtonMotion, {
  once: true
});
const disposeSelectionMediaProperties = initSelectionMediaProperties({
  graphStore: graphStore,
  uiStore: uiStore,
  element: document.getElementById("selectionMediaProperties")
});
window.addEventListener("beforeunload", disposeSelectionMediaProperties, {
  once: true
});
let createStoryEpisodeCanvasFromWorkspace = async () => {
  throw new Error("分集画布服务尚未初始化。");
};
let createStoryProjectCanvasFromWorkspace = async () => {
  throw new Error("项目画布服务尚未初始化。");
};
let syncStoryClipFrameToCanvasFromWorkspace = async () => {
  throw new Error("片段帧画布同步服务尚未初始化。");
};
let createPersonReplacementOutputCanvasFromWorkspace = async () => {
  throw new Error("人物替换画布同步服务尚未初始化。");
};
let deleteStoryCanvasNodesFromWorkspace = async () => false;
const assetManagerModulePromise = import("./src/modules/AssetManager.js");
let workspaceModeCoordinator = null;
let storyWorkspaceApi = null;
const replacementStudioApplication = createReplacementStudioApplication({
  documentObject: document,
  windowObject: window,
  mountTarget: "#v2-wrap",
  uploadFile: uploadFile,
  generateCharacterImage: generateImage,
  generateReplacementImage: generateImage,
  generateReplacementVideo: generateVideo,
  resolveInstallId: ensureInstallId,
  listLibraryAssets: () => getAssetMentionCandidates({
    allowedTypes: ["image", "audio"]
  }),
  subscribeLibraryAssets: subscribeAssetMentionRegistry,
  loadWorkspace: fetchReplacementStudioWorkspaceFromServer,
  saveWorkspace: saveReplacementStudioWorkspaceToServer,
  createOutputCanvas: _0x28100a => createPersonReplacementOutputCanvasFromWorkspace(_0x28100a),
  saveAssetPackageItem: _0x2cb691 => assetManagerModulePromise.then(({
    assetManager: _0x2e6f42
  }) => _0x2e6f42.upsertMediaAssetPackage(_0x2cb691)),
  persistOutputFromUrl: saveOutputFromUrl,
  onRequestClose: () => {
    if (workspaceModeCoordinator?.getMode?.() === REPLACEMENT_STUDIO_MODE_ID) {
      workspaceModeCoordinator.setMode("canvas");
    }
  },
  showToast: (..._0x2dc6f6) => window.showToast?.(..._0x2dc6f6)
});
const replacementStudioModelGate = new ReplacementStudioModelGate({
  documentObject: document,
  modelPackApi: {
    getStatus: getPersonReplacementModelPackStatus,
    install: installPersonReplacementModelPack
  },
  onReady: () => {
    workspaceModeCoordinator?.resumePendingMode?.(REPLACEMENT_STUDIO_MODE_ID);
  },
  onNotify: (..._0x1139cd) => window.showToast?.(..._0x1139cd)
});
let videoReplicationApplication = null;
const getVideoReplicationApplication = () => {
  if (!isVideoReplicationStudioAvailable(window)) {
    return null;
  }
  if (videoReplicationApplication) {
    return videoReplicationApplication;
  }
  videoReplicationApplication = createVideoReplicationApplication({
    documentObject: document,
    windowObject: window,
    mountTarget: "#v2-wrap",
    uploadFile: uploadFile,
    loadWorkspace: fetchVideoReplicationWorkspaceFromServer,
    saveWorkspace: saveVideoReplicationWorkspaceToServer,
    showToast: (..._0x37b4c2) => window.showToast?.(..._0x37b4c2)
  });
  return videoReplicationApplication;
};
const storyboard3DWorkspaceController = createStoryboard3DWorkspaceController({
  documentObject: document,
  windowObject: window,
  storeInstance: workspaceStore,
  commitChanges: commit,
  getWorkspaceModeCoordinator: () => workspaceModeCoordinator
});
storyWorkspaceApi = initStoryWorkspace({
  documentObject: document,
  windowObject: window,
  adjustClipPrompt: guardStoryModelTaskCredentials(adjustStoryClipPrompt),
  generateStory: guardStoryModelTaskCredentials(generateStorySummary),
  generateEpisodeScript: guardStoryModelTaskCredentials(generateStoryEpisodeScript),
  extractAssets: guardStoryModelTaskCredentials(extractStoryAssets),
  extractAssetsParallel: guardStoryModelTaskCredentials(extractStoryAssetsParallel),
  extractAssetsExperimental: guardStoryModelTaskCredentials(extractStoryAssetsHybridExperimental),
  planEpisodes: guardStoryModelTaskCredentials(planStoryEpisodeOutlines),
  recoverEpisodeSplitDraft: recoverStoryEpisodeSplitDraftLocally,
  reviewEpisodeSplit: guardStoryModelTaskCredentials(reviewStoryEpisodeSplitQuality),
  splitEpisode: guardStoryModelTaskCredentials(splitStoryEpisodeChecked),
  splitEpisodesBatch: guardStoryModelTaskCredentials(splitStoryEpisodesBatch),
  splitEpisodeExperimental: guardStoryModelTaskCredentials(splitStoryEpisodeExperimental),
  extractDocumentText: extractStoryDocumentText,
  analyzeSourceVideo: guardStoryModelTaskCredentials(analyzeVideoReplicationClip),
  createEpisodeCanvas: _0x52a34b => createStoryEpisodeCanvasFromWorkspace(_0x52a34b),
  createProjectCanvas: _0x3adbc5 => createStoryProjectCanvasFromWorkspace(_0x3adbc5),
  subscribeCanvasNodeDeletions: _0x452afd => subscribeNodeDeletions(_0xc63a40 => _0x452afd({
    canvasId: CanvasTabManager.getActiveCanvasId(),
    nodes: _0xc63a40
  })),
  subscribeCanvasMediaNodeChanges: _0x40778d => subscribeStoryCanvasMediaNodeChanges({
    graphStore: graphStore,
    getActiveCanvasId: () => CanvasTabManager.getActiveCanvasId(),
    listener: _0x40778d
  }),
  getCanvasMediaSnapshot: () => getStoryCanvasMediaNodeSnapshot({
    graphStore: graphStore,
    getActiveCanvasId: () => CanvasTabManager.getActiveCanvasId()
  }),
  syncClipFrameToCanvas: _0x49717b => syncStoryClipFrameToCanvasFromWorkspace(_0x49717b),
  deleteCanvasNodes: _0x3868bb => deleteStoryCanvasNodesFromWorkspace(_0x3868bb),
  generateAssetImage: guardStoryModelTaskCredentials(generateImage),
  saveAssetPackageItem: _0x351108 => assetManagerModulePromise.then(({
    assetManager: _0x14410a
  }) => _0x14410a.upsertMediaAssetPackage(_0x351108)),
  loadWorkspace: fetchStoryWorkspaceFromServer,
  saveWorkspace: saveStoryWorkspaceToServer,
  requestWorkspaceMode: (..._0x390c88) => workspaceModeCoordinator?.setMode?.(..._0x390c88)
});
const getCanvasPresentationContext = () => {
  const _0x4060e4 = graphStore.getStateRaw?.() || graphStore.getState?.() || {};
  return {
    nodeCount: Object.keys(_0x4060e4.nodes || {}).length,
    viewport: _0x4060e4.viewport || null
  };
};
workspaceModeCoordinator = createWorkspaceModeCoordinator({
  documentObject: document,
  windowObject: window,
  getCanvasPresentationContext: getCanvasPresentationContext,
  storyWorkspace: {
    activate: _0x28e6e2 => storyWorkspaceApi?.activate?.(_0x28e6e2),
    deactivate: _0x4779f6 => storyWorkspaceApi?.deactivate?.(_0x4779f6),
    onActivated: () => showStoryWorkspaceBetaNotice({
      documentObject: document,
      windowObject: window
    })
  },
  storyboard3DWorkspace: {
    isAvailable: () => isStoryboard3DWorkspaceAvailable(window),
    activate: () => storyboard3DWorkspaceController.openHome(),
    deactivate: () => storyboard3DWorkspaceController.close()
  },
  replacementStudio: {
    canActivate: () => isReplacementStudioAuthorized(window),
    requestActivation: ({
      retry: _0x2af05f
    }) => requestReplacementStudioAuthorization({
      windowObject: window,
      onSuccess: _0x2af05f
    }),
    activate: () => replacementStudioModelGate.requestOpen(() => replacementStudioApplication.open()),
    deactivate: () => replacementStudioApplication.close(),
    onActivated: () => showReplacementStudioBetaNotice({
      documentObject: document,
      windowObject: window
    })
  },
  videoReplicationStudio: {
    isAvailable: () => isVideoReplicationStudioAvailable(window),
    activate: () => getVideoReplicationApplication()?.open(),
    deactivate: () => videoReplicationApplication?.close()
  }
});
window.addEventListener("beforeunload", () => {
  workspaceModeCoordinator?.destroy();
  storyWorkspaceApi?.destroy();
  storyboard3DWorkspaceController.dispose();
  replacementStudioModelGate.destroy();
  replacementStudioApplication.destroy();
  videoReplicationApplication?.destroy();
}, {
  once: true
});
const appViewport = createAppViewport({
  graphStore: graphStore,
  uiStore: uiStore,
  wrap: wrap,
  canvasViewportEl: canvasStage,
  debugEl: debug,
  zoomSliderEl: document.getElementById("zoomSlider"),
  zoomPercentEl: document.getElementById("zoomPercent"),
  fitActionEl: document.getElementById("btnFitAction")
});
appViewport.installWindowBindings(window);
assetManagerModulePromise.then(({
  assetManager: _0x3cae35
}) => {});
import("./src/modules/workflows/WorkflowManager.js").then(({
  workflowManager: _0x34f758
}) => {});
import("./src/modules/runninghubAiApp/RunningHubAiAppManager.js").then(({
  runningHubAiAppManager: _0x47bccb
}) => {});
import("./src/modules/GenerationHistoryFileManager.js").then(({
  generationHistoryFileManager: _0x3890a0
}) => {});
initAppNodeEntry({
  graphStore: graphStore,
  wrap: wrap,
  btnAddEl: document.getElementById("btnAdd"),
  nodeMenuEl: document.getElementById("nodeMenu"),
  initCanvasContextMenu: initCanvasContextMenu,
  getNodeDefaultSize: getNodeDefaultSize,
  executeCommand: executeCommand,
  getCanvasToolbarPlacement: () => uiStore.getState?.()?.ui?.canvasToolbarPlacement
});
const appCanvasPointerBindings = installAppCanvasPointerBindings({
  graphStore: graphStore,
  uiStore: uiStore,
  wrap: wrap,
  appViewport: appViewport,
  interaction: {
    getDragContext: getDragContext,
    handlePointerDown: handlePointerDown,
    handlePointerMove: handlePointerMove,
    handlePointerUp: handlePointerUp,
    handleWheel: handleWheel,
    handleWheelPan: handleWheelPan,
    settleWheelZoom: settleWheelZoom,
    settleWheelPan: settleWheelPan,
    initConnectionHandles: initConnectionHandles,
    initPickConnect: initPickConnect
  }
});
installAppCanvasDropImport({
  targetEl: wrap,
  handleFileDrop: handleFileDrop,
  handleWebImageUrlDrop: handleWebImageUrlDrop,
  commit: commit,
  getCurrentProjectId: appProjectContext.getCurrentProjectId
});
const appCanvasNodeFlows = createAppCanvasNodeFlows({
  graphStore: graphStore,
  commit: commit,
  getCursorScreenPosition: appCanvasPointerBindings.getCursorScreenPosition,
  getNodeDefaultSize: getNodeDefaultSize,
  getAIGenerationDefaultSizeByType: getAIGenerationDefaultSizeByType,
  getAIGenerationNodeSize: getAIGenerationNodeSize,
  createPanoramaNodeDataByType: createSpecialNodeDataByType,
  processFile: processFile,
  executeCommand: executeCommand,
  getCurrentProjectId: appProjectContext.getCurrentProjectIdOrNull,
  showToast: (..._0xc10d3) => window.showToast?.(..._0xc10d3)
});
const storyEpisodeCanvasAdapter = createStoryEpisodeCanvasAdapter({
  canvasTabManager: CanvasTabManager,
  createNodeAtCursor: (..._0x5e79bd) => appCanvasNodeFlows.createNodeAtCursor(..._0x5e79bd),
  getGraphState: () => graphStore.getStateRaw?.() || graphStore.getState?.() || {},
  getGraphSnapshot: () => graphStore.getState?.() || {},
  restoreGraphSnapshot: _0x372d25 => graphStore.loadState(_0x372d25),
  updateNodeData: (_0x4c12a2, _0x1f5bb2) => graphStore.updateNodeData(_0x4c12a2, _0x1f5bb2),
  deleteNodes: _0xfd3b43 => graphStore.deleteNodes(_0xfd3b43),
  focusNodes: (..._0x72a044) => appViewport.focusNodes(..._0x72a044),
  commit: commit
});
createStoryEpisodeCanvasFromWorkspace = (_0x3527b2 = {}) => a291_0x3a6777({
  ..._0x3527b2,
  adapter: storyEpisodeCanvasAdapter
});
const storyProjectCanvasAdapter = createStoryProjectCanvasAdapter({
  canvasTabManager: CanvasTabManager,
  createNodeAtCursor: (..._0x532d1f) => appCanvasNodeFlows.createNodeAtCursor(..._0x532d1f),
  getGraphState: () => graphStore.getStateRaw?.() || graphStore.getState?.() || {},
  getGraphSnapshot: () => graphStore.getState?.() || {},
  restoreGraphSnapshot: _0x15d6b8 => graphStore.loadState(_0x15d6b8),
  updateNodeData: (_0x21ffe3, _0x1975af) => graphStore.updateNodeData(_0x21ffe3, _0x1975af),
  moveNode: (_0x113ba2, _0x4c0384, _0x5462b6) => graphStore.updateNodePosition(_0x113ba2, _0x4c0384, _0x5462b6),
  deleteNodes: _0x4356eb => graphStore.deleteNodes(_0x4356eb),
  connectNodes: addEdgeWithPolicies,
  groupNodes: (_0x1c5425, _0x3a67e8) => graphStore.groupNodes(_0x1c5425, _0x3a67e8),
  focusNodes: (..._0x37d861) => appViewport.focusNodes(..._0x37d861),
  commit: commit
});
createStoryProjectCanvasFromWorkspace = (_0xedf2cd = {}) => syncStoryProjectCanvas({
  ..._0xedf2cd,
  adapter: storyProjectCanvasAdapter
});
createPersonReplacementOutputCanvasFromWorkspace = (_0x165d90 = {}) => syncPersonReplacementCanvas({
  ..._0x165d90,
  adapter: storyProjectCanvasAdapter,
  saveOutputBlob: a291_0x302295.saveOutputBlob
});
const storyClipFrameCanvasAdapter = createStoryClipFrameCanvasAdapter({
  canvasTabManager: CanvasTabManager,
  createNodeAtCursor: (..._0x14c850) => appCanvasNodeFlows.createNodeAtCursor(..._0x14c850),
  getGraphState: () => graphStore.getStateRaw?.() || graphStore.getState?.() || {},
  updateNodeData: (_0x44b267, _0x407165) => graphStore.updateNodeData(_0x44b267, _0x407165),
  getNodeSize: _0x42ba8b => getNodeDefaultSize(_0x42ba8b),
  commit: commit
});
syncStoryClipFrameToCanvasFromWorkspace = (_0x1a9be5 = {}) => syncStoryClipFrameToCanvas({
  ..._0x1a9be5,
  adapter: storyClipFrameCanvasAdapter
});
deleteStoryCanvasNodesFromWorkspace = (_0xcb7e5 = {}) => deleteStoryCanvasMediaNodes({
  ..._0xcb7e5,
  adapter: storyClipFrameCanvasAdapter
});
const agentConversationStore = createAgentConversationStore({
  windowObject: window,
  getProjectId: appProjectContext.getCurrentProjectId
});
const agentSessionStore = createAgentSessionStore({
  conversationStore: agentConversationStore
});
const canvasCommandContext = createCanvasCommandContext({
  store: a291_0xdc147a,
  graphStore: graphStore,
  canvasNodeFlows: appCanvasNodeFlows,
  createNodeAtCursor: appCanvasNodeFlows.createNodeAtCursor,
  buildNodeData: buildAppCanvasNodeData,
  executeCommand: executeCommand,
  focusNodes: appViewport.focusNodes,
  commit: commit,
  getNodeDefaultSize: getNodeDefaultSize,
  getAIGenerationDefaultSizeByType: getAIGenerationDefaultSizeByType,
  getAIGenerationNodeSize: getAIGenerationNodeSize,
  connectNodes: addEdgeWithPolicies,
  windowObject: window,
  nodeExport: desktopBridge.nodeExport.isAvailable() ? desktopBridge.nodeExport : null,
  mediaTools: {
    executeGridCrop: executeGridCrop,
    runAudioSeparationFromNode: runAudioSeparationFromNode,
    runSmartClipKeyframeExtractionFromVideoNode: runSmartClipKeyframeExtractionFromVideoNode,
    runVideoAudioSeparationFromNode: runVideoAudioSeparationFromNode,
    runVideoReverseFromNode: runVideoReverseFromNode
  },
  translate: t,
  showToast: (..._0x55f41d) => window.showToast?.(..._0x55f41d),
  scheduleFrame: _0x36993c => requestAnimationFrame(_0x36993c),
  recordCommand: _0x2b2f3a => agentSessionStore.recordCommand(_0x2b2f3a),
  history: {
    createCheckpoint: createHistoryCheckpoint,
    undoToCheckpoint: undoToHistoryCheckpoint
  }
});
const agentModelSettings = createAgentModelSettings({
  windowObject: window
});
const agentRuntime = createAgentRuntime({
  store: a291_0xdc147a,
  commandContext: canvasCommandContext,
  sessionStore: agentSessionStore,
  loopMode: true,
  assistant: ({
    message: _0x1091dc,
    context: _0x22fa99,
    history: _0x6e3a15,
    signal: _0x53dd5d,
    onTrace: _0x59b299
  }) => requestAgentAssistantReply({
    message: _0x1091dc,
    context: _0x22fa99,
    history: _0x6e3a15,
    signal: _0x53dd5d,
    onTrace: _0x59b299,
    settings: {
      ...agentModelSettings.getSettings(),
      locale: getLocale()
    }
  }),
  planner: ({
    message: _0x34cf47,
    context: _0x1f47af,
    history: _0x6f48e5,
    loopState: _0x255352,
    signal: _0x5c6b48,
    onTrace: _0x239d7b
  }) => requestAgentActionPlan({
    message: _0x34cf47,
    context: _0x1f47af,
    history: _0x6f48e5,
    loopState: _0x255352,
    signal: _0x5c6b48,
    onTrace: _0x239d7b,
    settings: {
      ...agentModelSettings.getSettings(),
      locale: getLocale()
    }
  })
});
installAppDebugApis({
  windowObject: window,
  canvasCommands: createCanvasCommandsDebugApi({
    executeCanvasCommand: a291_0x274338,
    executeCanvasCommandPlan: a291_0x4bfabd,
    commandContext: canvasCommandContext
  }),
  canvasAgent: createCanvasAgentDebugApi({
    agentRuntime: agentRuntime,
    agentSessionStore: agentSessionStore
  })
});
const uploadAgentMaterial = createAgentMaterialUploader({
  canvasNodeFlows: appCanvasNodeFlows,
  graphStore: graphStore,
  getBaseName: getBaseName
});
const agentPanelApi = initAgentPanel({
  runtime: agentRuntime,
  modelSettings: agentModelSettings,
  store: a291_0xdc147a,
  uploadMaterial: uploadAgentMaterial,
  fabBtnEl: document.getElementById("fabBtn"),
  root: document.body
});
initAudioVoicePanel({
  store: a291_0xdc147a,
  fabBtnEl: document.getElementById("audioVoicePanelFab"),
  root: document.body
});
installGlobalScreenshotBridge({
  screenshotApi: desktopBridge.screenshot.isAvailable() ? desktopBridge.screenshot : null,
  createMediaNodeFromBlob: appCanvasNodeFlows.createMediaNodeFromBlob,
  showToast: (..._0x499986) => window.showToast?.(..._0x499986),
  translate: translateAppText
});
installStoryboard3DExportCanvasBridge({
  windowObject: window,
  createMediaNodeFromBlob: appCanvasNodeFlows.createMediaNodeFromBlob,
  showToast: (..._0x23edaf) => window.showToast?.(..._0x23edaf)
});
const openCanvasFileUploadFromShortcut = () => {
  const _0x4a9031 = appCanvasPointerBindings.getCursorScreenPosition?.() || {};
  openAppCanvasFilePicker({
    documentObject: document,
    projectId: appProjectContext.getCurrentProjectId(),
    handleFileDrop: handleFileDrop,
    commit: commit,
    clientX: _0x4a9031.x,
    clientY: _0x4a9031.y,
    onUnsupported: () => {
      window.showToast?.(t("canvasInteraction.toasts.unsupportedUpload"), "warning");
    },
    onError: _0x257b7f => {
      console.error("[Canvas] shortcut file import failed:", _0x257b7f);
      window.showToast?.(t("previewUpload.uploadFailed"), "warning");
    }
  });
};
const appBusinessEvents = createAppBusinessEvents({
  store: a291_0xdc147a,
  wrap: wrap,
  canvasViewportEl: canvasStage,
  addShortcutListener: addShortcutListener,
  executeCommand: executeCommand,
  undo: undo,
  redo: redo,
  commit: commit,
  closeShortcuts: closeShortcuts,
  getNodeDefaultSize: getNodeDefaultSize,
  getAIGenerationDefaultSizeByType: getAIGenerationDefaultSizeByType,
  createNodeAtCursor: appCanvasNodeFlows.createNodeAtCursor,
  createImageNodeFromBlob: appCanvasNodeFlows.createMediaNodeFromBlob,
  openFileUpload: openCanvasFileUploadFromShortcut,
  animateViewport: appViewport.animateViewport,
  focusNodeAtZoomPercent: appViewport.focusNodeAtZoomPercent,
  focusNodes: appViewport.focusNodes,
  clearTrackedFocus: appViewport.clearTrackedFocus,
  handlePasteFromClipboard: appCanvasNodeFlows.handlePasteFromClipboard,
  initCanvasContextMenu: initCanvasContextMenu,
  toggleAgentPanel: () => agentPanelApi?.toggle?.(),
  ImageAnnotateController: a291_0xd6610,
  ImageMattingController: a291_0x20df35,
  AudioClipController: a291_0x2744ce
});
appBusinessEvents.bindAll();
const appTopbarAndConfig = createAppTopbarAndConfig({
  store: a291_0xdc147a,
  fetchApiConfigFromServer: fetchApiConfigFromServer,
  saveApiConfigToServer: saveApiConfigToServer,
  testProviderConnections: testProviderConnections,
  discoverCustomProvider: discoverCustomProvider,
  analyzeCustomProviderDocumentation: _0xdefafa => a291_0x510e65(_0xdefafa, {
    settings: {
      ...agentModelSettings.getSettings(),
      locale: getLocale()
    }
  }),
  buildCustomProviderManifestDraft: buildCustomProviderManifestDraft,
  validateCustomProviderManifestDraft: validateCustomProviderManifestDraft,
  saveCustomProviderManifestBundle: saveCustomProviderManifestBundle,
  listCustomProviderManifestBundles: listCustomProviderManifestBundles,
  deleteCustomProviderManifestBundle: deleteCustomProviderManifestBundle,
  refreshManifestModelNodeUis: () => {
    const _0xdef438 = refreshManifestModelNodeUis();
    if (_0xdef438.remountedNodeIds.length > 0) {
      a291_0xdc147a.invalidateUi();
    }
  },
  fetchDreaminaCliStatusFromServer: fetchDreaminaCliStatusFromServer,
  fetchDreaminaCliLoginRuntimeFromServer: fetchDreaminaCliLoginRuntimeFromServer,
  startDreaminaHeadlessLoginFromServer: startDreaminaHeadlessLoginFromServer,
  startDreaminaHeadlessReloginFromServer: startDreaminaHeadlessReloginFromServer,
  startDreaminaWebLoginFromServer: startDreaminaWebLoginFromServer,
  importDreaminaLoginResponseFromServer: importDreaminaLoginResponseFromServer,
  logoutDreaminaFromServer: logoutDreaminaFromServer,
  buildDreaminaQrImageUrl: buildDreaminaQrImageUrl,
  showError: showError
});
initModelServiceSettingsNavigator();
appTopbarAndConfig.init();
initCliProviderSettings();
const modelCatalogService = createModelCatalogService({
  store: workspaceStore
});
const appPanels = createAppPanels({
  store: a291_0xdc147a,
  setTextWithLineBreaks: setTextWithLineBreaks,
  getAIGenerationDefaultSizeByType: getAIGenerationDefaultSizeByType,
  createDefaultSubscriptionState: createDefaultSubscriptionState,
  isModelAllowed: isModelAllowed,
  isSubscriptionActive: isSubscriptionActive,
  isActivationRequestAccepted: isActivationRequestAccepted,
  normalizeSubscriptionPayload: normalizeSubscriptionPayload,
  ensureInstallId: ensureInstallId,
  pullSubscriptionState: pullSubscriptionState,
  submitCdkey: submitCdkey,
  clearSubscriptionAuthorization: clearSubscriptionAuthorization,
  DEFAULT_VIP_GATE_MODEL_ID: DEFAULT_VIP_GATE_MODEL_ID,
  getVipModelDisplayName: getVipModelDisplayName,
  ensureDeviceId: ensureDeviceId,
  modelCatalogService: modelCatalogService,
  refreshManifestModelNodeUis: refreshManifestModelNodeUis
});
appPanels.init();
CanvasProjectDropdownManager.init({
  projectWorkspaceSessions: appProjectLifecycle.projectWorkspaceSessions,
  onProjectHydrated: appProjectLifecycle.resumeProjectPersistenceAfterHydration,
  renameTemporaryProject: appProjectLifecycle.renameCurrentProject,
  pauseActiveWorkspaceTasks: pauseActiveWorkspaceTasks,
  getCanvasToolbarPlacement: () => uiStore.getState?.()?.ui?.canvasToolbarPlacement
});
SettingsManager.init({
  graphStore: graphStore,
  uiStore: uiStore,
  getCanvasPresentationContext: getCanvasPresentationContext
});
const nodeManagerPanel = createNodeManagerPanel({
  graphStore: graphStore,
  uiStore: uiStore,
  appViewport: appViewport,
  executeCanvasCommand: executeCanvasCommand,
  renameCurrentProject: CanvasProjectDropdownManager.renameCurrentProject,
  wrap: wrap,
  canvasStage: canvasStage,
  button: document.getElementById("btnNodeManager")
});
window.addEventListener("beforeunload", () => nodeManagerPanel?.destroy(), {
  once: true
});
MascotManager.init({
  bindFabButton: false
});
initAutoUpdate();
scheduleChromeShellStartupReady({
  windowObject: window,
  diagnostics: desktopBridge.diagnostics
});