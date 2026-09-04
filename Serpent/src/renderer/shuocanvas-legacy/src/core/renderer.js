import { isNodeType } from "../modules/registry.js";
import { hasNodeTypeBetaBadge, normalizeNodeType } from "../modules/nodeMeta.js";
import { getInteractionRenderState } from "./interaction.js";
import { getViewportPanPreview } from "./viewportPanPreview.js";
import { createRendererPanPreviewReconciler } from "./rendererPanPreviewReconcile.js";
import { readViewportInteractionState } from "./viewportInteractionState.js";
import { isPerfProbeEnabled, recordEdgeRedrawSample, recordRenderFrameSample, recordRendererNodeLifecycleSample } from "../modules/perf/perfProbe.js";
import { buildVirtualizationCandidateSets, createRendererStructuralBudget, ensureRendererExactVisiblePreviewCandidates, getRendererStructuralReconcileDelayMs, isNodeInsideViewportPadding, RENDERER_VIRTUALIZATION_CONFIG, resolveRendererLowZoomMountLimit } from "./rendererVirtualization.js";
import { buildRendererScenePlan } from "./rendererScenePlan.js";
import { clearRendererSpatialIndexCache, collectVirtualizedRenderNodes, getCachedRendererSpatialIndex } from "./rendererSpatialIndex.js";
import { buildFullEdgeRenderSignature, clearCachedEdgeVisibilityIndex, getCachedEdgeGeometrySignature, getCachedEdgeVisibilityIndex, MANY_EDGES_THRESHOLD } from "./rendererEdgeVisibilityIndex.js";
import { createRendererEdgeLayer } from "./rendererEdgeLayer.js";
import { normalizeConnectionLineStyle } from "./edgePathGeometry.js";
import { installNodeResizeGeometryPreviewer } from "./rendererResizePreview.js";
import { buildGroupOutputMembershipSignature } from "../modules/groupDynamicOutput.js";
import { syncRendererBridge } from "./rendererBridge.js";
import { createPickConnectBannerEl as a641_0x53fee6, renderPickConnectBanner as a641_0x18422f } from "./rendererOverlays.js";
import { createRendererSelectionOverlay } from "./rendererSelectionOverlay.js";
import { createNodeDetailHydrationController } from "./rendererNodeDetailHydration.js";
import { createRendererInteractionGraceController } from "./rendererInteractionGrace.js";
import { createRendererDeferredMediaController, createRendererVisibleAudioWarmupPass } from "./rendererDeferredMedia.js";
import { cancelRendererFastPreviewMediaPreloads, createRendererFastPreviewLayer } from "./rendererFastPreviewLayer.js";
import { createRendererRasterPreviewCoordinator } from "./rendererRasterPreviewCoordinator.js";
import { createRendererFastPreviewContinuationController, createRendererFastPreviewLifecycleTracker, syncRendererFastPreviewAfterNodeRender } from "./rendererFastPreviewContinuation.js";
import { createFastPreviewReleaseScheduler } from "./rendererFastPreviewRelease.js";
import { createRendererSourceVideoSlotLifecycle } from "./rendererSourceVideoSlotLifecycle.js";
import { createRendererVideoMediaResidencyController } from "./rendererVideoMediaResidency.js";
import { cancelCanvasVisibleMediaWarmupPreloads } from "./canvasMediaWarmup.js";
import { buildRendererVirtualizationSignature } from "./rendererVirtualizationSignature.js";
import { consumeRendererNodeDragCommitHint } from "./rendererCommitHints.js";
import { createHeavyMediaPreviewOnlyDecider, createHeavyMediaUpdateFrameBudget, getRendererStructuralBudgetOptions, resolveViewportInteractionReconcileDelay, shouldDeferHeavyMediaForInteractionGrace, shouldDeferHeavyMediaMount, shouldDeferHeavyMediaUpdate, shouldForceDeferActiveNodeDetails, shouldForceDeferRelatedVideoDetails, shouldHydratePriorityMediaDuringViewportInteraction, shouldHydrateVideoMediaImmediately, shouldKeepHiddenHeavyMediaUpdatePending, shouldPauseViewportMediaForInteractionGrace, shouldQueueNodeDetailHydration } from "./rendererInteractionRenderPolicy.js";
import { applyRendererLowZoomRealVideoCandidates, createRendererPriorityMediaFrameResolver, createRendererPriorityMediaWorkResolver, resolveRendererLowZoomRealVideoNodeIds, shouldDeferInitialVideoMediaOnMount, syncRendererPendingSourceVideoActivationIds } from "./rendererPriorityMediaWork.js";
import { applyRendererFullEligibleImageCandidates, collectFullEligibleVisibleImageNodeIds, prioritizeFullEligibleVisibleImageNodes, syncNodeMediaLodMode } from "./rendererNodeMediaLod.js";
import { createRendererNodeLifecycleStats, recordRendererLifecycleDuration, recordRendererLifecycleSkippedUpdate } from "./rendererNodeLifecyclePerf.js";
import { buildRendererNodeSignature } from "./rendererNodeSignature.js";
import { syncNodeResultClass } from "./rendererNodeResultState.js";
import { syncNodeMediaMetricsDataset } from "../modules/nodeMediaMetrics.js";
import { createRendererNodeRuntimeBridge } from "./rendererNodeRuntimeBridge.js";
import { disposePreparedRendererNodeRuntime, prepareRendererNodeRuntime } from "./rendererNodeRuntimeFactory.js";
import { createRendererNodeTimerController } from "./rendererNodeTimerController.js";
import { buildRendererDragTargetSet, buildSelectedNodeRankMap, clearRendererNodeLabelTooltip as a641_0x57722b, formatRendererNodeLabelText as a641_0x382697, formatVideoMetaText, getRendererDefaultNodeLabel, getRendererGroupColorWithOpacity as a641_0x76721a, getRendererNodeLabelKind as a641_0x3c553d, getRendererNodeZIndex, setRendererNodeLabelContent as a641_0x131762, shouldSkipInitialMediaNodeUpdate, syncRendererFastPreviewPresentationOwner, syncRendererNodeDragTransform, syncRendererNodePresentationZIndex } from "./rendererNodePresentation.js";
import { createRendererSelectionFastPath } from "./rendererSelectionFastPath.js";
import { clearRendererViewportMediaPreloadPause, syncRendererViewportMediaPreloadPause } from "./rendererViewportMediaPreloadPause.js";
import { renderViewport as a641_0x16b570 } from "./rendererViewportTransform.js";
import { createRendererViewportJumpDetector } from "./rendererViewportJumpDetector.js";
import { createRendererVideoHydrationBackpressure } from "./rendererVideoHydrationBackpressure.js";
import { createRendererVisibleVideoSurfaceController } from "./rendererVisibleVideoSurface.js";
import { createRendererMediaRuntimePreparer, shouldPrebuildRendererMediaRuntime } from "./rendererMediaRuntimePreparer.js";
import { installRendererRuntimeDiagnosticAccess, isRendererRuntimeDiagnosticsEnabled, recordRendererRuntimeDiagnostic } from "./rendererRuntimeDiagnostics.js";
import { resolveGenerationUiState } from "./generationTaskUiState.js";
import { getRendererPickerNodeTypes } from "./rendererPickerCatalog.js";
import { t } from "../i18n/index.js";
import { resolveCanvasVideoDisplayUrl, resolveCanvasVideoPosterUrl } from "../services/canvasMediaLocalService.js";
export { buildRendererVirtualizationSignature };
export { formatVideoMetaText };
const _componentMap = new Map();
const _nodeRuntimeBridge = createRendererNodeRuntimeBridge({
  getInstance: _0x10ecfc => _componentMap.get(_0x10ecfc)
});
const _nodeDataSnapshotMap = new Map();
const _sourceVideoSourceKeySnapshotMap = new Map();
const _pendingSourceVideoActivationIds = new Set();
let _sourceVideoActivationRev = null;
let _sourceVideoActivationNodesRef = null;
let _resetSelectionFastPath = null;
const _wrapperMap = new Map();
const _nodeTimerController = createRendererNodeTimerController({
  getWrapper: _0x380f0f => _wrapperMap.get(_0x380f0f)
});
const _mountedNodeIds = new Set();
const _parkedNodeIds = new Set();
const _parkedWrapperMap = new Map();
const _selectionOverlay = createRendererSelectionOverlay({
  getWrapper: _0x3471ed => _wrapperMap.get(_0x3471ed) || _parkedWrapperMap.get(_0x3471ed) || null,
  isMounted: _0x13c2cf => _mountedNodeIds.has(_0x13c2cf)
});
const _fastPreviewLifecycle = createRendererFastPreviewLifecycleTracker();
const _pendingNodeDataMap = new Map();
const _nodeTypeSnapshotMap = new Map();
const _nodePinReasons = new Map();
const MANIFEST_MODEL_NODE_TYPES = new Set(["ai-image", "ai-text", "ai-video", "ai-audio"]);
let _rendererRuntimeDiagnosticRenderState = {
  previewOnly: false,
  viewportBusy: false
};
const _rendererRuntimeDiagnosticsEnabled = isRendererRuntimeDiagnosticsEnabled();
installRendererRuntimeDiagnosticAccess(_0x4c367a => {
  const _0x50df66 = _componentMap.get(_0x4c367a);
  const _0x2abd4c = _wrapperMap.get(_0x4c367a);
  return {
    nodeId: _0x4c367a,
    mounted: _mountedNodeIds.has(_0x4c367a),
    parked: _parkedNodeIds.has(_0x4c367a),
    rendererMediaDeferred: _0x50df66?._rendererMediaDeferred === true,
    pinReasons: Array.from(_nodePinReasons.get(_0x4c367a) || []),
    wrapperVideoCount: _0x2abd4c?.querySelectorAll?.("video")?.length || 0,
    ..._rendererRuntimeDiagnosticRenderState
  };
});
const _rendererInteractionGrace = createRendererInteractionGraceController({
  delayMs: RENDERER_VIRTUALIZATION_CONFIG.parkAfterInteractionDelayMs,
  getDragContext: getInteractionRenderState
});
let _schedulePreparedMediaRuntimeCommit = null;
const _rendererMediaRuntimePreparer = createRendererMediaRuntimePreparer({
  isInteractionBusy: _rendererInteractionGrace.isBusy,
  onPrepared: ({
    nodeId: _0x4c538d,
    durationMs: _0x4535a7
  }) => {
    if (_rendererRuntimeDiagnosticsEnabled) {
      recordRendererRuntimeDiagnostic({
        kind: "renderer-media-runtime-prepared",
        nodeId: _0x4c538d,
        durationMs: _0x4535a7
      });
    }
    _schedulePreparedMediaRuntimeCommit?.();
  },
  onPrepareError: ({
    nodeId: _0x210f6f,
    error: _0x4ebf16
  }) => {
    console.warn("[Renderer] media runtime prebuild failed:", _0x210f6f, _0x4ebf16);
  }
});
const _sourceVideoSlotLifecycle = createRendererSourceVideoSlotLifecycle({
  getNode: _0x3d4469 => _currentSnapshot?.nodes?.[_0x3d4469],
  getWrapper: _0x2eebf7 => _wrapperMap.get(_0x2eebf7),
  releasePreview: _0x7c8d8 => _fastPreviewLayer.releaseNode(_0x7c8d8),
  forgetScheduledRelease: _0x16ba03 => _fastPreviewRelease.forget(_0x16ba03)
});
const _fastPreviewLayer = createRendererFastPreviewLayer({
  getWrapper: _0x4c0cc9 => _wrapperMap.get(_0x4c0cc9),
  isMounted: _0x581810 => _mountedNodeIds.has(_0x581810),
  resolveMediaPresentationReady: _sourceVideoSlotLifecycle.resolveMediaPresentationReady,
  onPresentationOwnerChanged: ({
    active: _0xcd4f6f,
    wrapper: _0x25f865
  }) => {
    syncRendererFastPreviewPresentationOwner(_0x25f865, _0xcd4f6f);
  },
  onMediaPresented: () => {
    if (_rendererInteractionGrace.isBusy()) {
      return;
    }
    _schedulePreparedMediaRuntimeCommit?.();
  }
});
const _fastPreviewContinuation = createRendererFastPreviewContinuationController({
  sync: (..._0x2eeefc) => _fastPreviewLayer.sync(..._0x2eeefc)
});
const _fastPreviewRelease = createFastPreviewReleaseScheduler({
  getWrapper: _0x574f24 => _wrapperMap.get(_0x574f24),
  hasPreview: _0x79ba10 => _fastPreviewLayer.hasNodePreview(_0x79ba10),
  isMounted: _0x133b1e => _mountedNodeIds.has(_0x133b1e),
  isInteractionBusy: _rendererInteractionGrace.isBusy,
  resolveMediaPresentationReady: _sourceVideoSlotLifecycle.resolveMediaPresentationReady,
  releasePreview: _0x2f90b5 => _fastPreviewLayer.releaseNode(_0x2f90b5)
});
const _rasterPreviewCoordinator = createRendererRasterPreviewCoordinator({
  isDomMediaPresented: (_0x4e870e, _0x428034) => _fastPreviewLayer.isNodePresentationReady(_0x4e870e, _0x428034),
  onMediaPresented: () => {
    if (_rendererInteractionGrace.isBusy()) {
      return;
    }
    _schedulePreparedMediaRuntimeCommit?.();
  }
});
function _markRasterMediaInteractionBusy() {
  _rendererInteractionGrace.markBusy();
  _rasterPreviewCoordinator.setMediaLoadingBusy(true);
}
function _releaseRasterMediaInteractionBusy() {
  _rasterPreviewCoordinator.setMediaLoadingBusy(false);
  _schedulePreparedMediaRuntimeCommit?.();
}
const RENDERER_DEFERRED_MEDIA_HYDRATION_BATCH_SIZE = 2;
const RENDERER_VIDEO_MEDIA_RESIDENCY_PADDING = 120;
const RENDERER_INACTIVE_PRESENTED_MEDIA_LEASE_MS = 600;
const RENDERER_INACTIVE_PRESENTED_MEDIA_LEASE_LIMIT = 3;
const RENDERER_FULL_SURFACE_RELEASE_BATCH_SIZE = 12;
const RENDERER_FULL_SURFACE_RELEASE_FRAME_BUDGET_MS = 4;
const VISIBLE_VIDEO_STRUCTURAL_RECONCILE_DELAY_MS = 0;
const _videoHydrationBackpressure = createRendererVideoHydrationBackpressure();
const _visibleVideoSurface = createRendererVisibleVideoSurfaceController({
  resolveSource(_0x46d9c6) {
    if (String(_0x46d9c6?.type || "").toLowerCase() === "ai-video" && resolveGenerationUiState(_0x46d9c6) === "error") {
      return "";
    }
    const _0x17914c = Array.isArray(_0x46d9c6?.videos) ? _0x46d9c6.videos : [];
    const _0x5381e1 = Number.isFinite(Number(_0x46d9c6?.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x46d9c6.mainVideoIndex))) : 0;
    return resolveCanvasVideoDisplayUrl(_0x17914c[_0x5381e1] || _0x17914c[0] || {}) || resolveCanvasVideoDisplayUrl(_0x46d9c6);
  }
});
let _rendererDeferredMedia;
const _videoMediaResidency = createRendererVideoMediaResidencyController({
  getComponent: _0x4e1388 => _componentMap.get(_0x4e1388),
  getWrapper: _0x3e1318 => _wrapperMap.get(_0x3e1318),
  isMounted: _0x3419d2 => _mountedNodeIds.has(_0x3419d2),
  isPlaybackActive: (_0x2f02d7, _0x2c2692, _0x21d40b) => {
    if (_getNodePinSet(_0x2f02d7, false)?.size > 0) {
      return true;
    }
    for (const _0x158d98 of _0x21d40b?.querySelectorAll?.("video") || []) {
      if (_0x158d98?.paused === false && _0x158d98?.ended !== true) {
        return true;
      }
    }
    return false;
  },
  shouldRetainPresentedMedia: (_0x312634, _0x2ef36f) => {
    try {
      return _0x2ef36f?.hasPresentedRendererMedia?.() === true;
    } catch {
      return false;
    }
  },
  isRetentionProtected: (_0xd9820f, _0x3b8c8e) => {
    const _0x2a34a4 = _currentSnapshot?.selectedNodeIds;
    return !!Array.isArray(_0x2a34a4) && !!_0x2a34a4.includes(_0xd9820f) || !!_0x2a34a4?.has?.(_0xd9820f) || _0x3b8c8e?._isHovered === true || _0x3b8c8e?._isManualControl === true || _0x3b8c8e?._isManualLoopPlayback === true || _0x3b8c8e?._isSeeking === true;
  },
  presentedMediaLeaseMs: RENDERER_INACTIVE_PRESENTED_MEDIA_LEASE_MS,
  maxRetainedPresentedMedia: RENDERER_INACTIVE_PRESENTED_MEDIA_LEASE_LIMIT,
  onSuspend: (_0x5ecf3c, _0xc484fa) => {
    _fastPreviewLayer.retainNode(_0x5ecf3c);
    const _0x3fa045 = _fastPreviewLayer.isNodePreviewReady(_0x5ecf3c);
    const _0x1bb904 = _0xc484fa?.prepareRendererMediaFallbackForSuspend?.() === true;
    if (!_0x3fa045 && !_0x1bb904) {
      return false;
    }
    _rendererDeferredMedia.forget(_0x5ecf3c);
    _fastPreviewRelease.forget(_0x5ecf3c);
    _0xc484fa?.suspendRendererMedia?.();
    _sourceVideoSlotLifecycle.suspendPresentedSurface(_0x5ecf3c);
    return true;
  },
  onParkSuspend: (_0x3f7842, _0x9f4c10) => {
    const _0x4b8479 = _rendererRuntimeDiagnosticsEnabled ? _nowMs() : 0;
    try {
      _0x9f4c10?.suspendRendererMedia?.();
    } catch {}
    if (_rendererRuntimeDiagnosticsEnabled) {
      recordRendererRuntimeDiagnostic({
        kind: "video-media-suspend",
        nodeId: _0x3f7842,
        reason: "park",
        suspended: true,
        durationMs: _nowMs() - _0x4b8479
      });
    }
  },
  onResume: (_0x385feb, _0x4189b9) => {
    if (_0x4189b9?.prepareRendererVisibleVideoPreview?.() !== true) {
      return;
    }
    _fastPreviewLayer.retainNode(_0x385feb);
    _rendererDeferredMedia.enqueue(_0x385feb, {
      urgent: true
    });
  }
});
_rendererDeferredMedia = createRendererDeferredMediaController({
  getComponent: _0x40c21e => _componentMap.get(_0x40c21e),
  isInteractionBusy: _rendererInteractionGrace.isBusy,
  onHydrateMedia: _fastPreviewRelease.schedule,
  onHydrateDiagnostic: ({
    nodeId: _0x44e95e,
    isVideoMedia: _0x2c5f40,
    durationMs: _0x483f96
  }) => {
    if (!_rendererRuntimeDiagnosticsEnabled) {
      return;
    }
    recordRendererRuntimeDiagnostic({
      kind: "renderer-media-hydrate",
      nodeId: _0x44e95e,
      isVideoMedia: _0x2c5f40,
      durationMs: _0x483f96
    });
  },
  canHydrateMedia: _0x1382fd => _videoMediaResidency.isHydrationAllowed(_0x1382fd),
  canHydrateVideo: () => _videoHydrationBackpressure.tryAcquire(),
  batchSize: RENDERER_DEFERRED_MEDIA_HYDRATION_BATCH_SIZE
});
const _viewportJumpDetector = createRendererViewportJumpDetector();
const _nodeDetailHydration = createNodeDetailHydrationController({
  getWrapper: _0x23d302 => _wrapperMap.get(_0x23d302),
  getParkedWrapper: _0x34a209 => _parkedWrapperMap.get(_0x34a209),
  getWrappers: () => _wrapperMap.values(),
  getParkedWrappers: () => _parkedWrapperMap.values(),
  isMounted: _0x5e0fe2 => _mountedNodeIds.has(_0x5e0fe2),
  isInteractionBusy: _rendererInteractionGrace.isBusy,
  isVideoNodeDetails: _0x326e90 => isNodeType(_currentSnapshot?.nodes?.[_0x326e90], ["source-video", "ai-video", "video"]),
  canHydrateVideoDetails: () => _videoHydrationBackpressure.tryAcquire(),
  onHydrateNodeDetails: _0x14926b => {
    _componentMap.get(_0x14926b)?.hydrateDeferredDetails?.();
    _fastPreviewLayer.retainNode(_0x14926b);
    const _0x43e61e = _currentSnapshot?.nodes?.[_0x14926b];
    const _0x3c0c14 = isNodeType(_0x43e61e, ["source-video", "ai-video", "video"]) && !!resolveCanvasVideoPosterUrl(_0x43e61e);
    if (!_0x3c0c14) {
      _rendererDeferredMedia.enqueue(_0x14926b);
    }
  }
});
const _edgeLayer = createRendererEdgeLayer({
  getContainerSize: _getEdgeContainerSize,
  nowMs: _nowMs,
  recordRedrawSample: recordEdgeRedrawSample
});
const _edgeDomCache = _edgeLayer.getDomCache();
const _nodeToEdgeIds = new Map();
const _incomingEdgeIdsByTarget = new Map();
const FULL_ELIGIBLE_VISIBLE_IMAGE_RECONCILE_DELAY_MS = 0;
const FULL_ELIGIBLE_VISIBLE_IMAGE_SETTLED_BUDGET_DELAY_MS = 220;
const HIGH_ZOOM_STALE_WARMUP_PRELOAD_CANCEL_PRIORITY_LIMIT = 150;
const HIGH_ZOOM_STALE_FAST_PREVIEW_PRELOAD_CANCEL_PRIORITY_LIMIT = 80;
const HIGH_ZOOM_STALE_PRELOAD_CANCEL_THROTTLE_MS = 220;
const VIEWPORT_INTERACTION_PRELOAD_CANCEL_THROTTLE_MS = 180;
const VIEWPORT_INTERACTION_WARMUP_CANCEL_PRIORITY_LIMIT = 150;
const VIEWPORT_INTERACTION_FAST_PREVIEW_CANCEL_PRIORITY_LIMIT = 80;
let _lastHighZoomStalePreloadCancelAt = 0;
let _lastViewportInteractionPreloadCancelAt = 0;
let _lastViewportJumpAt = 0;
const SELECTION_RELATED_HIGHLIGHT_COLORS = Object.freeze(["white", "blue", "green", "cyan", "purple", "red", "yellow"]);
function cancelStaleLowPriorityPreloadsForHighZoom(_0x275fc2) {
  if (_0x275fc2 !== true) {
    return;
  }
  const _0x5d34b3 = typeof performance !== "undefined" && performance && typeof performance.now === "function" ? performance.now() : Date.now();
  if (_lastHighZoomStalePreloadCancelAt > 0 && _0x5d34b3 - _lastHighZoomStalePreloadCancelAt < HIGH_ZOOM_STALE_PRELOAD_CANCEL_THROTTLE_MS) {
    return;
  }
  _lastHighZoomStalePreloadCancelAt = _0x5d34b3;
  cancelCanvasVisibleMediaWarmupPreloads({
    includeActive: false,
    belowPriority: HIGH_ZOOM_STALE_WARMUP_PRELOAD_CANCEL_PRIORITY_LIMIT,
    reason: "high zoom viewport media priority"
  });
  cancelRendererFastPreviewMediaPreloads({
    includeActive: false,
    belowPriority: HIGH_ZOOM_STALE_FAST_PREVIEW_PRELOAD_CANCEL_PRIORITY_LIMIT,
    reason: "high zoom viewport media priority"
  });
}
function cancelQueuedViewportInteractionPreloads(_0x454468) {
  if (_0x454468 !== true) {
    return;
  }
  const _0x235cf2 = typeof performance !== "undefined" && performance && typeof performance.now === "function" ? performance.now() : Date.now();
  if (_lastViewportInteractionPreloadCancelAt > 0 && _0x235cf2 - _lastViewportInteractionPreloadCancelAt < VIEWPORT_INTERACTION_PRELOAD_CANCEL_THROTTLE_MS) {
    return;
  }
  _lastViewportInteractionPreloadCancelAt = _0x235cf2;
  cancelCanvasVisibleMediaWarmupPreloads({
    includeActive: false,
    belowPriority: VIEWPORT_INTERACTION_WARMUP_CANCEL_PRIORITY_LIMIT,
    reason: "viewport interaction"
  });
  cancelRendererFastPreviewMediaPreloads({
    includeActive: false,
    belowPriority: VIEWPORT_INTERACTION_FAST_PREVIEW_CANCEL_PRIORITY_LIMIT,
    reason: "viewport interaction"
  });
}
function isViewportPriorityImageNode({
  node: _0x2bd778,
  nodeId: _0x116d5a,
  mountCandidateIds: _0x27d54d,
  viewport: _0x9f08b3,
  containerW: _0x3a289b,
  containerH: _0x152313,
  isSelected: _0x549996,
  isSelectionRelated: _0x33eda0
} = {}) {
  if (!_0x116d5a || !isNodeType(_0x2bd778, ["source-image", "ai-image"])) {
    return false;
  }
  if (!_0x27d54d?.has?.(_0x116d5a)) {
    return false;
  }
  if (_0x549996 || _0x33eda0) {
    return true;
  }
  return _isNodeVisible(_0x2bd778, _0x9f08b3, _0x3a289b, _0x152313);
}
function isRendererMediaRuntimeInteractionPriority({
  nodeId: _0xbb87d1,
  isSelected: _0x2df1d6,
  isSelectionRelated: _0x3d70fd,
  dragTargets: _0x545e20,
  connOverlay: _0x112742,
  pickMode: _0x3b205d
} = {}) {
  if (!_0xbb87d1) {
    return false;
  }
  return !!_0x2df1d6 || !!_0x3d70fd || !!_0x545e20?.has?.(_0xbb87d1) || _0x112742?.srcId === _0xbb87d1 || _0x112742?.hoverId === _0xbb87d1 || _0x3b205d?.sourceNodeId === _0xbb87d1 || _0x3b205d?.hoverNodeId === _0xbb87d1;
}
let _edgeIndexRev = -1;
let _edgeEntriesRev = -1;
let _edgeEntriesSource = null;
let _edgeEntriesCache = [];
let _cachedContainerWidth = null;
let _cachedContainerHeight = null;
let _lastFullEdgeRenderSignature = "";
let _edgeDomClearedSinceLastFull = false;
let _lastVirtualCandidateSignature = "";
let _lastVirtualCandidateResult = null;
let _containerSizeSourceEl = null;
let _containerResizeObserver = null;
let _containerResizeHandler = null;
let _currentSnapshot = null;
function _getNodePinSet(_0x2f4833, _0x12ac37 = false) {
  let _0x13ade4 = _nodePinReasons.get(_0x2f4833);
  if (!_0x13ade4 && _0x12ac37) {
    _0x13ade4 = new Set();
    _nodePinReasons.set(_0x2f4833, _0x13ade4);
  }
  return _0x13ade4 || null;
}
function _getPinnedNodeIds() {
  const _0x392366 = new Set();
  for (const [_0x2dc786, _0x26cb36] of _nodePinReasons.entries()) {
    if (_0x26cb36 && _0x26cb36.size > 0) {
      _0x392366.add(_0x2dc786);
    }
  }
  return _0x392366;
}
function _clearNodePin(_0x64d775) {
  _nodePinReasons.delete(_0x64d775);
}
function _clearAnchoredUiForNode(_0x4c45aa) {
  if (!_0x4c45aa) {
    return;
  }
  const _0x511e3d = _componentMap.get(_0x4c45aa);
  if (_0x511e3d && typeof _0x511e3d.highlightCell === "function") {
    _0x511e3d.highlightCell(-1);
  }
}
function _resolveVideoMediaLeaseKey(_0x536853, _0x5e36d4) {
  const _0x3e4741 = Array.isArray(_0x5e36d4?.videos) ? _0x5e36d4.videos : [];
  const _0x3ea2ad = Number.isFinite(Number(_0x5e36d4?.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x5e36d4.mainVideoIndex))) : 0;
  const _0xc3d46e = resolveCanvasVideoDisplayUrl(_0x3e4741[_0x3ea2ad] || _0x3e4741[0] || {}) || resolveCanvasVideoDisplayUrl(_0x5e36d4);
  const _0x3f0aa6 = _sourceVideoSlotLifecycle.isManagedNode(_0x536853) ? _sourceVideoSlotLifecycle.read(_0x536853) : null;
  return [String(_0x5e36d4?.type || ""), _0x3ea2ad, String(_0xc3d46e || ""), String(_0x3f0aa6?.sourceKey || ""), Number(_0x3f0aa6?.sourceEpoch || 0)].join("|");
}
function _parkNode(_0x33b7de) {
  const _0x1a6920 = _wrapperMap.get(_0x33b7de);
  if (!_0x1a6920) {
    return null;
  }
  if (_sourceVideoSlotLifecycle.isManagedNode(_0x33b7de)) {
    _sourceVideoSlotLifecycle.syncVisibility(_0x33b7de, "far");
    _sourceVideoSlotLifecycle.setResidency(_0x33b7de, "parked");
  }
  _nodeDetailHydration.forgetNodeDetailHydration(_0x33b7de);
  _rendererDeferredMedia.forget(_0x33b7de);
  _fastPreviewRelease.forget(_0x33b7de);
  _nodeTimerController.hideNode(_0x33b7de);
  if (_0x1a6920.isConnected) {
    _0x1a6920.remove();
  }
  _visibleVideoSurface.forget(_0x33b7de);
  const _0x2fdd1f = _componentMap.get(_0x33b7de);
  let _0x30bc26 = false;
  try {
    _0x30bc26 = _0x2fdd1f?.hasPresentedRendererMedia?.() === true;
  } catch {}
  _videoMediaResidency.park(_0x33b7de, {
    retainPresentedMedia: _0x30bc26,
    leaseKey: _resolveVideoMediaLeaseKey(_0x33b7de, _currentSnapshot?.nodes?.[_0x33b7de])
  });
  _mountedNodeIds.delete(_0x33b7de);
  _parkedNodeIds.add(_0x33b7de);
  _parkedWrapperMap.set(_0x33b7de, _0x1a6920);
  _fastPreviewLifecycle.record(_nodeTypeSnapshotMap.get(_0x33b7de));
  _clearAnchoredUiForNode(_0x33b7de);
  _nodeRuntimeBridge.unregister(_0x33b7de);
  return _0x1a6920;
}
function _mountNode(_0x20e567, _0x3730d3) {
  const _0x4c45ed = _wrapperMap.get(_0x20e567);
  if (!_0x4c45ed) {
    return null;
  }
  _videoMediaResidency.unpark(_0x20e567);
  if (!_0x4c45ed.isConnected) {
    _0x3730d3.appendChild(_0x4c45ed);
  }
  _parkedWrapperMap.delete(_0x20e567);
  _parkedNodeIds.delete(_0x20e567);
  _mountedNodeIds.add(_0x20e567);
  _sourceVideoSlotLifecycle.setResidency(_0x20e567, "mounted");
  _fastPreviewLifecycle.record(_nodeTypeSnapshotMap.get(_0x20e567));
  _nodeRuntimeBridge.register(_0x20e567);
  return _0x4c45ed;
}
function _flushMountBatch(_0x38ad31, _0x325d85) {
  if (!_0x38ad31 || !_0x325d85) {
    return;
  }
  if (_0x325d85.childNodes && _0x325d85.childNodes.length === 0) {
    return;
  }
  _0x38ad31.appendChild(_0x325d85);
}
function _destroyNode(_0xc76fc) {
  _rendererMediaRuntimePreparer.forget(_0xc76fc);
  _visibleVideoSurface.forget(_0xc76fc);
  _videoMediaResidency.forget(_0xc76fc);
  _nodeDetailHydration.forgetNodeDetailHydration(_0xc76fc);
  _rendererDeferredMedia.forget(_0xc76fc);
  _fastPreviewRelease.forget(_0xc76fc);
  _nodeTimerController.hideNode(_0xc76fc);
  const _0x2c4f60 = _componentMap.get(_0xc76fc);
  try {
    if (_0x2c4f60 && typeof _0x2c4f60.unmount === "function") {
      _0x2c4f60.unmount();
    }
  } catch {}
  const _0x49b919 = _wrapperMap.get(_0xc76fc) || _parkedWrapperMap.get(_0xc76fc);
  if (_0x49b919 && _0x49b919.isConnected) {
    _0x49b919.remove();
  }
  _componentMap.delete(_0xc76fc);
  _nodeDataSnapshotMap.delete(_0xc76fc);
  _sourceVideoSourceKeySnapshotMap.delete(_0xc76fc);
  _pendingSourceVideoActivationIds.delete(_0xc76fc);
  _wrapperMap.delete(_0xc76fc);
  _mountedNodeIds.delete(_0xc76fc);
  _parkedNodeIds.delete(_0xc76fc);
  _parkedWrapperMap.delete(_0xc76fc);
  _pendingNodeDataMap.delete(_0xc76fc);
  _nodeTypeSnapshotMap.delete(_0xc76fc);
  _nodeRuntimeBridge.unregister(_0xc76fc);
  if (_sourceVideoSlotLifecycle.isManagedNode(_0xc76fc)) {
    _sourceVideoSlotLifecycle.forget(_0xc76fc);
  }
  _clearNodePin(_0xc76fc);
  _fastPreviewLayer.removeNode(_0xc76fc);
}
function _syncRendererBridge() {
  syncRendererBridge(typeof window === "undefined" ? null : window, {
    componentMap: _componentMap,
    wrapperMap: _wrapperMap,
    mountedNodeIds: _mountedNodeIds,
    nodeToEdgeIds: _nodeToEdgeIds,
    getEdgeLayerStats: _edgeLayer.getStats,
    hitTestEdgeAtScreenPoint: _edgeLayer.hitTestEdgeAtScreenPoint,
    prepareDynamicEdges: _edgeLayer.prepareDynamicEdges,
    setEdgeInteractionHighlight: _edgeLayer.setActiveEdge,
    setHoveredEdge: _edgeLayer.setHoveredEdge,
    markViewportInteractionBusy: _markRasterMediaInteractionBusy,
    releaseViewportInteractionBusy: _releaseRasterMediaInteractionBusy,
    excludeRasterPreviewNode: _rasterPreviewCoordinator.excludeNode,
    syncFastPreviewDragProxy: _fastPreviewLayer.syncNodeDragPreview,
    releaseFastPreviewForPlayback(_0x22b84d) {
      if (!_0x22b84d) {
        return false;
      }
      if (_sourceVideoSlotLifecycle.isManagedNode(_0x22b84d)) {
        return false;
      }
      const _0x466065 = _fastPreviewLayer.releaseNode(_0x22b84d) === true;
      if (!_0x466065) {
        return false;
      }
      const _0x3d1726 = _wrapperMap.get(_0x22b84d);
      if (_0x3d1726?.dataset) {
        _0x3d1726.dataset.fastPreviewReleasedForPlayback = "1";
      }
      _fastPreviewRelease.forget(_0x22b84d);
      return true;
    },
    prepareMediaSlotSource(_0x2eebd1, _0x59f5e6, _0x31485d = {}) {
      return _sourceVideoSlotLifecycle.prepareSource(_0x2eebd1, _0x59f5e6, _0x31485d);
    },
    reportMediaSlotFrame: _sourceVideoSlotLifecycle.reportFrame,
    pinNode(_0x1a8429, _0x2120ec = "src/ui/") {
      if (!_0x1a8429) {
        return;
      }
      const _0x18f569 = _getNodePinSet(_0x1a8429, true);
      _0x18f569.add(String(_0x2120ec || "src/ui/"));
      if (_rendererRuntimeDiagnosticsEnabled) {
        recordRendererRuntimeDiagnostic({
          kind: "renderer-node-pin",
          nodeId: _0x1a8429,
          reason: String(_0x2120ec || "src/ui/"),
          pinReasons: Array.from(_0x18f569)
        });
      }
    },
    unpinNode(_0xd76942, _0x14f357 = "src/ui/") {
      if (!_0xd76942) {
        return;
      }
      const _0x2f7895 = _getNodePinSet(_0xd76942, false);
      if (!_0x2f7895) {
        return;
      }
      _0x2f7895.delete(String(_0x14f357 || "src/ui/"));
      if (_0x2f7895.size === 0) {
        _nodePinReasons.delete(_0xd76942);
      }
      if (_rendererRuntimeDiagnosticsEnabled) {
        recordRendererRuntimeDiagnostic({
          kind: "renderer-node-unpin",
          nodeId: _0xd76942,
          reason: String(_0x14f357 || "src/ui/"),
          pinReasons: Array.from(_0x2f7895)
        });
      }
    }
  });
}
function _rebuildEdgeIndex(_0x3c1f97) {
  _nodeToEdgeIds.clear();
  _incomingEdgeIdsByTarget.clear();
  for (const _0x1a5be1 of Object.values(_0x3c1f97 || {})) {
    if (!_0x1a5be1) {
      continue;
    }
    const _0x40cb4d = _0x1a5be1.sourceId;
    const _0x5ee5a8 = _0x1a5be1.targetId;
    if (_0x40cb4d) {
      let _0x4fa9b8 = _nodeToEdgeIds.get(_0x40cb4d);
      if (!_0x4fa9b8) {
        _0x4fa9b8 = new Set();
        _nodeToEdgeIds.set(_0x40cb4d, _0x4fa9b8);
      }
      _0x4fa9b8.add(_0x1a5be1.id);
    }
    if (_0x5ee5a8) {
      let _0x5933c6 = _nodeToEdgeIds.get(_0x5ee5a8);
      if (!_0x5933c6) {
        _0x5933c6 = new Set();
        _nodeToEdgeIds.set(_0x5ee5a8, _0x5933c6);
      }
      _0x5933c6.add(_0x1a5be1.id);
      let _0x11a97d = _incomingEdgeIdsByTarget.get(_0x5ee5a8);
      if (!_0x11a97d) {
        _0x11a97d = [];
        _incomingEdgeIdsByTarget.set(_0x5ee5a8, _0x11a97d);
      }
      _0x11a97d.push(_0x1a5be1.id);
    }
  }
}
function _ensureEdgeIndex(_0x157f32, _0x1ef10b) {
  const _0x37cd8a = typeof _0x1ef10b === "number" ? _0x1ef10b : 0;
  if (_0x37cd8a === _edgeIndexRev) {
    return;
  }
  _rebuildEdgeIndex(_0x157f32);
  _edgeIndexRev = _0x37cd8a;
}
function _getEdgeEntries(_0x5198f5, _0x4a16bd) {
  const _0x45b05d = typeof _0x4a16bd === "number";
  const _0xc58c55 = _0x45b05d ? _0x4a16bd : 0;
  const _0x3e0397 = _0x45b05d ? _0xc58c55 === _edgeEntriesRev : _0xc58c55 === _edgeEntriesRev && _0x5198f5 === _edgeEntriesSource;
  if (_0x3e0397) {
    return _edgeEntriesCache;
  }
  _edgeEntriesCache = Object.values(_0x5198f5 || {});
  _edgeEntriesRev = _0xc58c55;
  _edgeEntriesSource = _0x5198f5 || null;
  return _edgeEntriesCache;
}
function _buildSelectionRelatedSets(_0x242896, _0x10abe1) {
  const _0x5eb6a3 = _0x242896 instanceof Set ? _0x242896 : new Set(Array.isArray(_0x242896) ? _0x242896 : []);
  const _0x1a6b98 = new Set();
  const _0x1e8bd8 = new Set();
  if (_0x5eb6a3.size === 0) {
    return {
      relatedNodeIds: _0x1a6b98,
      relatedEdgeIds: _0x1e8bd8
    };
  }
  for (const _0x15c86b of _0x5eb6a3) {
    const _0x5d0260 = _nodeToEdgeIds.get(_0x15c86b);
    if (!_0x5d0260) {
      continue;
    }
    for (const _0x298a60 of _0x5d0260) {
      if (!_0x298a60 || _0x1e8bd8.has(_0x298a60)) {
        continue;
      }
      const _0x459a7a = _0x10abe1?.[_0x298a60];
      if (!_0x459a7a?.id) {
        continue;
      }
      const _0x564b07 = _0x459a7a.sourceId;
      const _0x2c72dc = _0x459a7a.targetId;
      const _0x54df48 = _0x5eb6a3.has(_0x564b07);
      const _0x14421f = _0x5eb6a3.has(_0x2c72dc);
      if (!_0x54df48 && !_0x14421f) {
        continue;
      }
      _0x1e8bd8.add(_0x459a7a.id);
      if (_0x564b07 && !_0x54df48) {
        _0x1a6b98.add(_0x564b07);
      }
      if (_0x2c72dc && !_0x14421f) {
        _0x1a6b98.add(_0x2c72dc);
      }
    }
  }
  return {
    relatedNodeIds: _0x1a6b98,
    relatedEdgeIds: _0x1e8bd8
  };
}
function _normalizeSelectionRelatedHighlightColor(_0xe27c20) {
  const _0x26d247 = String(_0xe27c20 || "").trim();
  if (SELECTION_RELATED_HIGHLIGHT_COLORS.includes(_0x26d247)) {
    return _0x26d247;
  } else {
    return "white";
  }
}
function _syncContainerSizeCache(_0x271ab2 = _containerSizeSourceEl) {
  const _0x42d952 = _0x271ab2 || _containerSizeSourceEl || null;
  const _0x51f667 = _0x42d952 ? Number(_0x42d952.clientWidth) : Number(window.innerWidth);
  const _0x302847 = _0x42d952 ? Number(_0x42d952.clientHeight) : Number(window.innerHeight);
  _cachedContainerWidth = Number.isFinite(_0x51f667) ? _0x51f667 : Number(window.innerWidth);
  _cachedContainerHeight = Number.isFinite(_0x302847) ? _0x302847 : Number(window.innerHeight);
  return {
    width: _cachedContainerWidth,
    height: _cachedContainerHeight
  };
}
function _nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function _hasCachedContainerSize() {
  return Number.isFinite(_cachedContainerWidth) && Number.isFinite(_cachedContainerHeight);
}
function _getCachedContainerSize(_0x2405f8 = _containerSizeSourceEl, _0xd2a6b6 = {}) {
  const _0x261bde = _0x2405f8 || _containerSizeSourceEl || null;
  const _0x7f109f = typeof ResizeObserver === "function" && !!_containerResizeObserver;
  const _0x29ac23 = _0xd2a6b6?.refresh === true || !_hasCachedContainerSize() || !_0x7f109f || _0x261bde && _containerSizeSourceEl && _0x261bde !== _containerSizeSourceEl;
  if (_0x29ac23) {
    return _syncContainerSizeCache(_0x261bde);
  }
  return {
    width: _cachedContainerWidth,
    height: _cachedContainerHeight
  };
}
function _getEdgeContainerSize(_0x16a690) {
  const _0xa62e7 = _nowMs();
  const _0x48d517 = _getCachedContainerSize(_containerSizeSourceEl || _0x16a690);
  const _0x3b587d = _nowMs();
  return {
    containerW: Number.isFinite(_0x48d517.width) ? _0x48d517.width : 0,
    containerH: Number.isFinite(_0x48d517.height) ? _0x48d517.height : 0,
    layoutReadMs: Math.max(0, _0x3b587d - _0xa62e7)
  };
}
function _invalidateFullEdgeRenderSignature({
  clearedDom = false
} = {}) {
  _lastFullEdgeRenderSignature = "";
  if (clearedDom) {
    _edgeDomClearedSinceLastFull = true;
  }
}
function _notifyVirtualizationProbe(_0x3ee03d) {
  const _0x45a752 = typeof window !== "undefined" ? window.__rendererVirtualizationProbe : null;
  if (!_0x45a752 || typeof _0x45a752.onCandidateSignatureEvaluated !== "function") {
    return;
  }
  try {
    _0x45a752.onCandidateSignatureEvaluated(_0x3ee03d);
  } catch {}
}
function _collectMovedNodeIds(_0x39f56d, _0x505178) {
  const _0x3b2619 = new Set(_0x39f56d.selectedNodeIds || []);
  const _0x238d00 = _0x505178?.targetNodeId || null;
  if (_0x238d00) {
    _0x3b2619.add(_0x238d00);
  }
  const _0x58f4c9 = _0x39f56d._parentToChildren || {};
  const _0x1ada70 = Array.from(_0x3b2619);
  for (let _0x50ab88 = 0; _0x50ab88 < _0x1ada70.length; _0x50ab88++) {
    const _0x320189 = _0x1ada70[_0x50ab88];
    const _0x42c667 = _0x58f4c9[_0x320189];
    if (!_0x42c667 || _0x42c667.size === 0) {
      continue;
    }
    for (const _0x9e4458 of _0x42c667) {
      if (!_0x3b2619.has(_0x9e4458)) {
        _0x3b2619.add(_0x9e4458);
        _0x1ada70.push(_0x9e4458);
      }
    }
  }
  return _0x3b2619;
}
function _resolveDragRenderOffset(_0x400ab6, _0x50f11d) {
  if (!_0x50f11d?.isDragging) {
    return null;
  }
  const _0x3a291b = _collectMovedNodeIds(_0x400ab6, _0x50f11d);
  if (!_0x3a291b || _0x3a291b.size === 0) {
    return null;
  }
  return {
    movedNodeIds: _0x3a291b,
    dx: Number.isFinite(_0x50f11d.pendingDx) ? _0x50f11d.pendingDx : 0,
    dy: Number.isFinite(_0x50f11d.pendingDy) ? _0x50f11d.pendingDy : 0
  };
}
export function clearRendererCache() {
  _rendererMediaRuntimePreparer.clear();
  console.log("[Renderer] 执行全盘物理清盘...");
  const _0xb04e87 = new Set([..._componentMap.keys(), ..._wrapperMap.keys(), ..._parkedWrapperMap.keys(), ..._mountedNodeIds, ..._parkedNodeIds]);
  for (const _0x18f2ac of _0xb04e87) {
    _destroyNode(_0x18f2ac);
  }
  _clearRenderedEdgesFromDocument();
  _edgeLayer.reset();
  _selectionOverlay.reset();
  _nodeToEdgeIds.clear();
  _incomingEdgeIdsByTarget.clear();
  _edgeIndexRev = -1;
  _edgeEntriesRev = -1;
  _edgeEntriesSource = null;
  _edgeEntriesCache = [];
  clearCachedEdgeVisibilityIndex();
  _cachedContainerWidth = null;
  _cachedContainerHeight = null;
  _lastFullEdgeRenderSignature = "";
  _edgeDomClearedSinceLastFull = false;
  _lastVirtualCandidateSignature = "";
  _lastVirtualCandidateResult = null;
  _fastPreviewContinuation.reset();
  _fastPreviewLifecycle.reset();
  _sourceVideoSlotLifecycle.reset();
  _sourceVideoSourceKeySnapshotMap.clear();
  _pendingSourceVideoActivationIds.clear();
  _sourceVideoActivationRev = null;
  _sourceVideoActivationNodesRef = null;
  _visibleVideoSurface.reset();
  clearRendererSpatialIndexCache();
  _resetSelectionFastPath?.();
  _containerSizeSourceEl = null;
  _rendererInteractionGrace.reset();
  _viewportJumpDetector.reset();
  _lastViewportJumpAt = 0;
  clearRendererViewportMediaPreloadPause();
  _nodePinReasons.clear();
  _pendingNodeDataMap.clear();
  _nodeTypeSnapshotMap.clear();
  _nodeDetailHydration.clearNodeDetailHydrationState();
  _rendererDeferredMedia.clear();
  _videoMediaResidency.clear();
  _videoHydrationBackpressure.reset();
  _fastPreviewRelease.clear();
  _fastPreviewLayer.clear();
  _rasterPreviewCoordinator.reset();
  _nodeTimerController.clear();
  _currentSnapshot = null;
}
export function refreshManifestModelNodeUis() {
  const _0x58dc62 = [];
  const _0xb06a3d = [];
  for (const [_0x1cf2d1, _0x1a161d] of [..._componentMap.entries()]) {
    const _0x286e16 = _currentSnapshot?.nodes?.[_0x1cf2d1];
    if (!_0x286e16 || !MANIFEST_MODEL_NODE_TYPES.has(normalizeNodeType(_0x286e16.type))) {
      continue;
    }
    if (typeof _0x1a161d?.refreshModelRegistryUi === "function") {
      try {
        _0x1a161d.refreshModelRegistryUi();
        _0x58dc62.push(_0x1cf2d1);
        continue;
      } catch (_0x1c47bb) {
        console.warn("[Renderer] refresh model registry UI failed:", _0x1c47bb);
      }
    }
    _destroyNode(_0x1cf2d1);
    _0xb06a3d.push(_0x1cf2d1);
  }
  return {
    refreshedNodeIds: _0x58dc62,
    remountedNodeIds: _0xb06a3d
  };
}
window._edgeDomCache = _edgeDomCache;
_syncRendererBridge();
function _isNodeVisible(_0x41859a, _0x3eb503, _0x336a51, _0x3f306f, _0x5c2e13 = 0, _0x5b72ed = 0) {
  return isNodeInsideViewportPadding(_0x41859a, _0x3eb503, _0x336a51, _0x3f306f, 200, _0x5c2e13, _0x5b72ed);
}
function _renderCullingOnly(_0x455349, _0xe0c39d, _0x5e9350, _0xc1f530 = {}) {
  const _0x3600f0 = _0xc1f530?.hideInvisible !== false;
  const {
    width: _0x586831,
    height: _0x3bedd2
  } = _getCachedContainerSize(_0x455349.parentElement || _0x455349);
  for (const _0x4edb95 of _mountedNodeIds) {
    const _0x519a18 = _0xe0c39d?.[_0x4edb95];
    if (!_0x519a18) {
      continue;
    }
    const _0x386863 = _wrapperMap.get(_0x4edb95);
    if (!_0x386863 || !_0x386863.isConnected || _0x386863.classList?.contains?.("is-dragging")) {
      continue;
    }
    const _0x382647 = _isNodeVisible(_0x519a18, _0x5e9350, _0x586831, _0x3bedd2);
    if (!_0x382647) {
      if (!_0x3600f0) {
        continue;
      }
      _nodeTimerController.hideNode(_0x4edb95);
      if (_0x386863.style.display !== "none") {
        _0x386863.style.display = "none";
      }
    } else {
      _nodeTimerController.trackNode(_0x4edb95, _0x519a18);
      if (_0x386863.style.display === "none") {
        _0x386863.style.display = "";
      }
    }
  }
}
export function initRenderer(_0x18392d, _0x1fb0e2, _0x9a7818) {
  _0x1fb0e2.style.transformOrigin = "0 0";
  _0x1fb0e2.style.position = "absolute";
  _0x1fb0e2.style.top = "0";
  _0x1fb0e2.style.left = "0";
  const _0x41f8e9 = _createSvgLayer();
  _0x1fb0e2.prepend(_0x41f8e9);
  const _0x5a09d6 = _0x41f8e9.querySelector("svg");
  _containerSizeSourceEl = _0x1fb0e2.parentElement || _0x18392d;
  _syncContainerSizeCache(_containerSizeSourceEl);
  if (typeof ResizeObserver === "function" && _containerSizeSourceEl) {
    _containerResizeObserver = new ResizeObserver(() => {
      _syncContainerSizeCache(_containerSizeSourceEl);
    });
    _containerResizeObserver.observe(_containerSizeSourceEl);
  }
  const _0x161fc7 = _createPickerEl();
  _0x18392d.appendChild(_0x161fc7);
  const _0x5a2077 = a641_0x53fee6();
  _0x18392d.appendChild(_0x5a2077);
  _selectionOverlay.mount(_0x1fb0e2);
  const _0x3b3ed8 = _createSelectionRectEl();
  _0x18392d.appendChild(_0x3b3ed8);
  _syncRendererBridge();
  let _0x34c845 = null;
  let _0x384997 = null;
  let _0x1fbf4f = -1;
  let _0x12484a = -1;
  let _0x3a8e9e = 0;
  let _0x220422 = null;
  let _0x861f0c = null;
  const _0x1ec4a1 = createRendererPriorityMediaWorkResolver({
    getContainerSize: () => _getCachedContainerSize(_containerSizeSourceEl)
  });
  function _0x94d5e4(_0x4f667c, _0x50653f, _0x2b6ce6) {
    if (!_0x4f667c || !_0x50653f) {
      return null;
    }
    const _0x1e9128 = _0x4f667c.ui?.selectionRelatedHighlightEnabled === false ? {
      relatedNodeIds: new Set()
    } : _buildSelectionRelatedSets(_0x4f667c.selectedNodeIds, _0x4f667c.edges);
    return _renderNodes(_0x1fb0e2, _0x4f667c.nodes, _0x4f667c.selectedNodeIds, _0x1e9128.relatedNodeIds, _normalizeSelectionRelatedHighlightColor(_0x4f667c.ui?.selectionRelatedHighlightColor), _0x4f667c.connOverlay, _0x4f667c.pickConnectMode, _0x50653f, _0x4f667c.edges, _0x4f667c._parentToChildren, _0x4f667c.ui?.showVideoMeta === true, _0x4f667c, {
      deferParking: true,
      mode: _0x2b6ce6,
      viewportPriorityMediaOnly: true
    });
  }
  function _0x8227da() {
    if (_0x220422 !== null) {
      clearTimeout(_0x220422);
      _0x220422 = null;
    }
    if (_0x861f0c !== null) {
      cancelAnimationFrame(_0x861f0c);
      _0x861f0c = null;
    }
  }
  function _0x2cfa49(_0x5d1ce0 = RENDERER_VIRTUALIZATION_CONFIG.settleDelayMs, {
    bypassInteractionGrace = false
  } = {}) {
    _0x8227da();
    _0x220422 = setTimeout(() => {
      _0x220422 = null;
      if (_0x861f0c !== null) {
        return;
      }
      _0x861f0c = requestAnimationFrame(() => {
        _0x861f0c = null;
        if (_0x34c845 !== null) {
          _0x2cfa49(_0x5d1ce0, {
            bypassInteractionGrace: bypassInteractionGrace
          });
          return;
        }
        if (!_currentSnapshot) {
          return;
        }
        if (!bypassInteractionGrace && _rendererInteractionGrace.isBusy()) {
          _0x2cfa49(_0x5d1ce0, {
            bypassInteractionGrace: bypassInteractionGrace
          });
          return;
        }
        _0x117d2c(_currentSnapshot);
      });
    }, Math.max(0, _0x5d1ce0));
  }
  const _0x4f4012 = () => _0x2cfa49(0);
  _schedulePreparedMediaRuntimeCommit = _0x4f4012;
  const _0x2b86ac = createRendererSelectionFastPath({
    ensureEdgeIndex: _ensureEdgeIndex,
    buildSelectionRelatedSets: _buildSelectionRelatedSets,
    hasPendingRender: () => _0x34c845 !== null,
    cancelPendingRender: () => {
      if (_0x34c845 !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(_0x34c845);
      }
      _0x34c845 = null;
      _0x384997 = null;
    },
    setCurrentSnapshot: _0x48da7b => {
      _currentSnapshot = _0x48da7b;
      _0x384997 = null;
    },
    consumeViewport: _0x326d48 => _viewportJumpDetector.consume(_0x326d48),
    flushSelectionUpdate: (_0x3b489d, _0x1a9385) => _0x34a789(_0x3b489d, _0x1a9385),
    renderAffectedEdges: (_0x2c0424, _0xe9749c, _0x48137a) => {
      if (_0x2c0424.size === 0 || _0xe9749c.ui?.connectionLinesVisible === false) {
        return;
      }
      _renderEdgesByIds(_0x5a09d6, _0x2c0424, _0xe9749c.edges || {}, _0xe9749c.nodes || {}, _0xe9749c.viewport, _0x18392d, null, _0x48137a, {
        pathStyle: _0xe9749c.ui?.connectionLineStyle
      });
    },
    renderSelectionOverlays: _0x5820e5 => {
      _selectionOverlay.render(_0x5820e5);
    }
  });
  const _0x5be48e = () => _0x2b86ac.reset();
  _resetSelectionFastPath = _0x5be48e;
  const _0x4c99dc = createRendererPanPreviewReconciler({
    canvasEl: _0x1fb0e2,
    svgWrapper: _0x41f8e9,
    getSnapshot: () => _currentSnapshot,
    hasPendingStoreRender: () => _0x34c845 !== null,
    markBusy: _rendererInteractionGrace.markBusy,
    renderViewport: a641_0x16b570,
    renderNodes: _renderNodes,
    buildSelectionRelatedSets: _buildSelectionRelatedSets,
    normalizeSelectionRelatedHighlightColor: _normalizeSelectionRelatedHighlightColor,
    hasPriorityMediaWork: (_0x5504c9, _0x371092) => _0x1ec4a1({
      ..._0x5504c9,
      viewport: _0x371092
    }),
    scheduleDeferredReconcile: _0x2cfa49
  });
  installNodeResizeGeometryPreviewer(typeof window === "undefined" ? null : window, () => _currentSnapshot, _ensureEdgeIndex, _nodeToEdgeIds, (_0x27dab1, _0x453ddb, _0x40a1ce) => _renderEdgesByIds(_0x5a09d6, _0x27dab1, _0x40a1ce.edges || {}, _0x453ddb, _0x40a1ce.viewport, _0x18392d, null, null, {
    pathStyle: _0x40a1ce.ui?.connectionLineStyle
  }));
  function _0x2d4e5e(_0x131ba0, _0x3d1561 = "steady", _0xfa043f) {
    const _0x1760e3 = typeof _0x131ba0._nodeCount === "number" ? _0x131ba0._nodeCount : Object.keys(_0x131ba0.nodes || {}).length;
    const _0x560959 = typeof _0x131ba0._edgesRev === "number" ? _0x131ba0._edgesRev : 0;
    const _0x7b85fb = Number.isFinite(_0x131ba0._nodeGeometryRev) ? _0x131ba0._nodeGeometryRev : Number.isFinite(_0x131ba0._persistRev) ? _0x131ba0._persistRev : _0x1760e3;
    const _0x245f81 = _0x560959 !== _0x12484a;
    if (_0x1760e3 !== _0x1fbf4f || _0x245f81) {
      _0x1fbf4f = _0x1760e3;
      _0x12484a = _0x560959;
      _cleanupNodes(_0x1fb0e2, _0x131ba0.nodes);
      _cleanupEdges(_0x5a09d6, _0x131ba0.edges);
    }
    _ensureEdgeIndex(_0x131ba0.edges, _0x560959);
    const _0x3aa19a = _0x131ba0.ui?.selectionRelatedHighlightEnabled === false ? {
      relatedNodeIds: new Set(),
      relatedEdgeIds: new Set()
    } : _buildSelectionRelatedSets(_0x131ba0.selectedNodeIds, _0x131ba0.edges);
    const _0x25f14b = _normalizeSelectionRelatedHighlightColor(_0x131ba0.ui?.selectionRelatedHighlightColor);
    const _0x496405 = _rendererInteractionGrace.getRemainingMs();
    const _0x5f22c5 = shouldDeferHeavyMediaForInteractionGrace({
      remainingMs: _0x496405,
      viewport: _0x131ba0.viewport,
      nodeCount: _0x1760e3,
      hasPriorityMediaWork: false
    });
    const _0x352aed = _0xfa043f?.({
      needed: _0x5f22c5
    }) === true;
    const _0x140b74 = shouldDeferHeavyMediaForInteractionGrace({
      remainingMs: _0x496405,
      viewport: _0x131ba0.viewport,
      nodeCount: _0x1760e3,
      hasPriorityMediaWork: _0x352aed
    });
    const {
      hasPendingStructuralOps: _0x412ccf,
      deferredParkCount = 0,
      hasPendingVisibleVideoMounts = false,
      hasPendingFullEligibleVisibleImageMounts = false
    } = _renderNodes(_0x1fb0e2, _0x131ba0.nodes, _0x131ba0.selectedNodeIds, _0x3aa19a.relatedNodeIds, _0x25f14b, _0x131ba0.connOverlay, _0x131ba0.pickConnectMode, _0x131ba0.viewport, _0x131ba0.edges, _0x131ba0._parentToChildren, _0x131ba0.ui && typeof _0x131ba0.ui.showVideoMeta === "boolean" ? _0x131ba0.ui.showVideoMeta : false, _0x131ba0, {
      mode: _0x3d1561,
      deferHeavyMediaMount: _0x140b74,
      deferParking: _0x496405 > 0,
      fullImageSettleReady: _lastViewportJumpAt <= 0 || _nowMs() - _lastViewportJumpAt >= FULL_ELIGIBLE_VISIBLE_IMAGE_SETTLED_BUDGET_DELAY_MS
    });
    const _0xb95315 = _0x131ba0.edges || {};
    const _0x38aaf2 = _getEdgeEntries(_0xb95315, _0x560959);
    const _0x133dda = _0x38aaf2.length;
    const _0x49d45d = document.documentElement;
    const _0x35e789 = _0x133dda >= MANY_EDGES_THRESHOLD;
    if (_0x35e789) {
      if (!_0x49d45d.classList.contains("has-many-edges")) {
        _0x49d45d.classList.add("has-many-edges");
      }
    } else if (_0x49d45d.classList.contains("has-many-edges")) {
      _0x49d45d.classList.remove("has-many-edges");
    }
    const _0x7a33d8 = getInteractionRenderState();
    const _0x53b2ab = _resolveDragRenderOffset(_0x131ba0, _0x7a33d8);
    const _0x372d6f = _0x131ba0.ui?.connectionLinesVisible !== false;
    const _0x9bc01c = normalizeConnectionLineStyle(_0x131ba0.ui?.connectionLineStyle);
    let _0x5a3b10 = null;
    let _0x5d0f32 = "";
    let _0x599a32 = null;
    function _0x41f929() {
      if (!_0x35e789) {
        return "";
      }
      if (!_0x5d0f32) {
        _0x5d0f32 = getCachedEdgeGeometrySignature(_0x38aaf2, _0x131ba0.nodes, {
          edgesRev: _0x560959,
          geometryRev: _0x7b85fb
        });
      }
      return _0x5d0f32;
    }
    function _0x83b5eb() {
      if (!_0x372d6f || !_0x35e789) {
        return null;
      }
      if (!_0x599a32) {
        _0x599a32 = getCachedEdgeVisibilityIndex(_0x38aaf2, _0x131ba0.nodes, {
          edgesRev: _0x560959,
          geometryRev: _0x7b85fb,
          geometrySignature: _0x41f929()
        });
      }
      return _0x599a32;
    }
    function _0x4fde47(_0x43a4e4 = false) {
      if (!_0x5a3b10) {
        _0x5a3b10 = _getEdgeContainerSize(_0x18392d);
      }
      const _0x498eb4 = buildFullEdgeRenderSignature({
        edgeEntries: _0x38aaf2,
        nodes: _0x131ba0.nodes,
        viewport: _0x131ba0.viewport,
        dragOffsetCtx: _0x53b2ab,
        relatedEdgeIds: _0x3aa19a.relatedEdgeIds,
        containerW: _0x5a3b10.containerW,
        containerH: _0x5a3b10.containerH,
        edgesRev: _0x560959,
        geometryRev: _0x7b85fb,
        geometrySignature: _0x41f929(),
        edgePathStyle: _0x9bc01c
      });
      if (!_0x43a4e4 && _0x498eb4 === _lastFullEdgeRenderSignature) {
        return null;
      }
      return {
        containerSize: _0x5a3b10,
        renderSignature: _0x498eb4,
        pathStyle: _0x9bc01c
      };
    }
    if (!_0x372d6f) {
      _clearRenderedEdges(_0x5a09d6);
    } else if (_0x245f81) {
      if (_0x245f81) {
        _ensureEdgeIndex(_0x131ba0.edges, _0x560959);
      }
      const _0x2d0673 = _0x4fde47(true);
      _renderEdges(_0x5a09d6, _0xb95315, _0x131ba0.nodes, _0x131ba0.viewport, _0x18392d, _0x53b2ab, _0x3aa19a.relatedEdgeIds, _0x38aaf2, "edges-rev-changed", {
        ..._0x2d0673,
        edgeVisibilityIndex: _0x83b5eb()
      });
    } else if (_0x7a33d8.isDragging) {
      _ensureEdgeIndex(_0x131ba0.edges, _0x560959);
      const _0x3ec79a = _0x53b2ab?.movedNodeIds || _collectMovedNodeIds(_0x131ba0, _0x7a33d8);
      const _0x449152 = new Set();
      for (const _0x53f7ed of _0x3ec79a) {
        const _0x4e08e8 = _nodeToEdgeIds.get(_0x53f7ed);
        if (!_0x4e08e8) {
          continue;
        }
        for (const _0xb0f225 of _0x4e08e8) {
          _0x449152.add(_0xb0f225);
        }
      }
      if (_0x449152.size > 0) {
        _renderEdgesByIds(_0x5a09d6, _0x449152, _0xb95315, _0x131ba0.nodes, _0x131ba0.viewport, _0x18392d, _0x53b2ab, _0x3aa19a.relatedEdgeIds, {
          containerSize: _0x5a3b10 || null,
          pathStyle: _0x9bc01c
        });
      } else if (!_0x3ec79a || _0x3ec79a.size === 0) {
        const _0x311e3f = _0x4fde47(false);
        if (_0x311e3f) {
          _renderEdges(_0x5a09d6, _0xb95315, _0x131ba0.nodes, _0x131ba0.viewport, _0x18392d, _0x53b2ab, _0x3aa19a.relatedEdgeIds, _0x38aaf2, "drag-related-edges-unavailable", {
            ..._0x311e3f,
            edgeVisibilityIndex: _0x83b5eb()
          });
        }
      }
    } else {
      const _0x2d2efc = _0x4fde47(false);
      if (_0x2d2efc) {
        _renderEdges(_0x5a09d6, _0xb95315, _0x131ba0.nodes, _0x131ba0.viewport, _0x18392d, _0x53b2ab, _0x3aa19a.relatedEdgeIds, _0x38aaf2, "steady", {
          ..._0x2d2efc,
          edgeVisibilityIndex: _0x83b5eb()
        });
      }
    }
    _renderPicker(_0x161fc7, _0x131ba0.picker, _0x9a7818);
    _renderSelectionRect(_0x3b3ed8, _0x131ba0.selectionBox);
    _selectionOverlay.render(_0x131ba0);
    a641_0x18422f(_0x5a2077, _0x131ba0.pickConnectMode);
    if (_0x412ccf) {
      const _0x456f45 = resolveRendererLowZoomMountLimit({
        viewport: _0x131ba0.viewport,
        nodeCount: _0x1760e3
      }) > 0;
      _0x2cfa49(Math.min(getRendererStructuralReconcileDelayMs(_0x1760e3), hasPendingVisibleVideoMounts ? VISIBLE_VIDEO_STRUCTURAL_RECONCILE_DELAY_MS : hasPendingFullEligibleVisibleImageMounts ? FULL_ELIGIBLE_VISIBLE_IMAGE_RECONCILE_DELAY_MS : _0x456f45 ? 360 : 96), {
        bypassInteractionGrace: hasPendingFullEligibleVisibleImageMounts === true
      });
    } else if (_0x496405 > 0) {
      _0x2cfa49(_0x496405 + 16);
    }
    _0x2b86ac.rememberRenderedSnapshot(_0x131ba0);
  }
  function _0x117d2c(_0x308dff) {
    if (!_0x308dff) {
      return;
    }
    const _0xd39da3 = isPerfProbeEnabled();
    const _0x20c48d = _0xd39da3 && typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : 0;
    let _0x1db3dd = "steady";
    try {
      const _0x6c7fe8 = getInteractionRenderState();
      const _0xe40270 = getViewportPanPreview();
      const _0x50264b = readViewportInteractionState({
        interactionState: _0x6c7fe8
      });
      const _0x5c5eb4 = _0xe40270 && !_0x50264b.isViewportBusy ? readViewportInteractionState({
        interactionState: _0x6c7fe8,
        panPreviewActive: true
      }) : _0x50264b;
      const _0x58acbe = typeof _0x308dff._nodeCount === "number" ? _0x308dff._nodeCount : Object.keys(_0x308dff.nodes || {}).length;
      const _0x12f51e = typeof _0x308dff._edgesRev === "number" ? _0x308dff._edgesRev : 0;
      const _0x33bf44 = (_0x6c7fe8.isDragging || _0x6c7fe8.isDraggingCell) && _0x6c7fe8.isCommittingDrag !== true;
      const _0x2fc45c = _0x33bf44 && (_0x58acbe !== _0x1fbf4f || _0x12f51e !== _0x12484a);
      const _0x4ac3b1 = !_0x5c5eb4.isViewportBusy && _viewportJumpDetector.consume(_0x308dff.viewport);
      if (_0x5c5eb4.isViewportBusy || _0x33bf44 || _0x4ac3b1) {
        _rendererMediaRuntimePreparer.pause();
      }
      const _0x305d74 = _rendererInteractionGrace.getRemainingMs();
      const _0x5648b0 = _0x5c5eb4.isViewportBusy ? _0xe40270 || _0x308dff.viewport : _0x308dff.viewport;
      const _0x2543e7 = createRendererPriorityMediaFrameResolver({
        snapshot: _0x308dff,
        viewport: _0x5648b0,
        resolvePriorityMediaWork: _0x1ec4a1
      });
      const _0x33c9df = _0x5c5eb4.isViewportBusy !== true && _0x4ac3b1 !== true && shouldPauseViewportMediaForInteractionGrace({
        remainingMs: _0x305d74,
        viewport: _0x308dff.viewport,
        nodeCount: _0x58acbe,
        hasPriorityMediaWork: false
      });
      const _0x2bfc26 = _0x2543e7({
        needed: _0x33c9df
      });
      const _0x3c5271 = _0x5c5eb4.isViewportBusy || _0x4ac3b1 || shouldPauseViewportMediaForInteractionGrace({
        remainingMs: _0x305d74,
        viewport: _0x308dff.viewport,
        nodeCount: _0x58acbe,
        hasPriorityMediaWork: _0x2bfc26
      });
      syncRendererViewportMediaPreloadPause(_0x3c5271);
      cancelQueuedViewportInteractionPreloads(_0x3c5271);
      const _0x5238f8 = shouldHydratePriorityMediaDuringViewportInteraction({
        interactionActive: _0x5c5eb4.isViewportAnimating || _0x5c5eb4.isPanning || _0x5c5eb4.isZooming,
        hasPriorityMediaWork: _0x2bfc26
      });
      const _0x19e0a8 = resolveViewportInteractionReconcileDelay({
        hasPriorityMediaWork: _0x2bfc26
      });
      a641_0x16b570(_0x1fb0e2, _0x5648b0, _0x308dff.ui?.titleFollowsCanvasZoom === true);
      if (_0x5c5eb4.isViewportAnimating) {
        _rendererInteractionGrace.markBusy();
        _0x1db3dd = _0x5238f8 ? "viewport-animating-priority-media" : "viewport-animating";
        if (_0x41f8e9.style.display === "none") {
          _0x41f8e9.style.display = "";
        }
        if (_0x5238f8) {
          _0x94d5e4(_0x308dff, _0x5648b0, _0x1db3dd);
        }
        _0x2cfa49(_0x19e0a8);
        return;
      }
      if (_0x5c5eb4.isPanning) {
        _rendererInteractionGrace.markBusy();
        _0x1db3dd = "panning";
        const _0x32d766 = performance.now();
        if (_0x32d766 - _0x3a8e9e > 80) {
          _0x3a8e9e = _0x32d766;
          _renderCullingOnly(_0x1fb0e2, _0x308dff.nodes, _0x5648b0);
        }
        if (_0x41f8e9.style.display === "none") {
          _0x41f8e9.style.display = "";
        }
        _0x2cfa49(_0x19e0a8);
        return;
      }
      if (_0x33bf44 && !_0x2fc45c) {
        _rendererInteractionGrace.markBusy();
        _0x1db3dd = "dragging";
        if (_0x41f8e9.style.display === "none") {
          _0x41f8e9.style.display = "";
        }
        _0x2cfa49();
        return;
      }
      if (_0x5c5eb4.isZooming) {
        _rendererInteractionGrace.markBusy();
        _0x1db3dd = _0x5238f8 ? "zooming-priority-media" : "zooming";
        if (_0x41f8e9.style.display === "none") {
          _0x41f8e9.style.display = "";
        }
        if (_0x5238f8) {
          _0x94d5e4(_0x308dff, _0x5648b0, _0x1db3dd);
        }
        _0x2cfa49(_0x19e0a8);
        return;
      }
      if (consumeRendererNodeDragCommitHint() && _0x58acbe === _0x1fbf4f && _0x12f51e === _0x12484a) {
        _0x1db3dd = "drag-commit-deferred";
        _rendererInteractionGrace.markBusy();
        if (_0x41f8e9.style.display === "none") {
          _0x41f8e9.style.display = "";
        }
        _0x2cfa49(RENDERER_VIRTUALIZATION_CONFIG.dragCommitReconcileDelayMs);
        return;
      }
      if (_0x2fc45c) {
        _rendererInteractionGrace.markBusy();
        _0x1db3dd = "dragging-structural";
      } else if (_0x4ac3b1) {
        _rendererInteractionGrace.markBusy();
        _0x1db3dd = "viewport-jump";
        _lastViewportJumpAt = _nowMs();
        _0x8227da();
      } else {
        _0x8227da();
        _rendererInteractionGrace.markIdle();
      }
      if (_0x41f8e9.style.display === "none") {
        _0x41f8e9.style.display = "";
      }
      _0x2d4e5e(_0x308dff, _0x1db3dd, _0x2543e7);
      if (!_0x2fc45c) {
        _nodeDetailHydration.resumeNodeDetailHydration();
        _rendererDeferredMedia.resume();
        _rendererMediaRuntimePreparer.resume();
      }
    } finally {
      if (_0xd39da3 && typeof performance !== "undefined" && typeof performance.now === "function") {
        const _0x561fe8 = typeof _0x308dff._nodeCount === "number" ? _0x308dff._nodeCount : Object.keys(_0x308dff.nodes || {}).length;
        recordRenderFrameSample({
          mode: _0x1db3dd,
          durationMs: performance.now() - _0x20c48d,
          nodeCount: _0x561fe8,
          edgeCount: Object.keys(_0x308dff.edges || {}).length,
          mountedNodeCount: _mountedNodeIds.size,
          parkedNodeCount: _parkedNodeIds.size,
          ..._fastPreviewLayer.getStats()
        });
      }
    }
  }
  function _0x7fee33(_0x483653) {
    if (!_0x483653) {
      return false;
    }
    const _0xe02acd = _currentSnapshot;
    const _0x3b82de = _0xe02acd?.nodes?.[_0x483653];
    if (!_0x3b82de) {
      return false;
    }
    const _0xf8e73a = _componentMap.get(_0x483653);
    const _0x58763e = _wrapperMap.get(_0x483653);
    if (!_0xf8e73a || typeof _0xf8e73a.update !== "function") {
      return false;
    }
    if (!_mountedNodeIds.has(_0x483653) || !_0x58763e?.isConnected) {
      return false;
    }
    const _0xbcbb2 = new Set(_0xe02acd.selectedNodeIds || []);
    const _0x3868b1 = _0xbcbb2.has(_0x483653);
    const _0x5a05f6 = _buildSelectionRelatedSets(_0xbcbb2, _0xe02acd.edges || {}).relatedNodeIds;
    const _0x2afb8a = !_0x3868b1 && _0x5a05f6.has(_0x483653);
    const _0x3b1b7a = _getIncomingEdgeSignature(_0x483653, _0xe02acd.edges || {}, _0xe02acd.nodes || {});
    const _0x5c1dae = syncNodeMediaLodMode(_0x58763e, _0x3b82de, _0xe02acd.viewport);
    const _0x3e2521 = buildRendererNodeSignature({
      node: _0x3b82de,
      inEdgeSig: _0x3b1b7a,
      pickMode: _0xe02acd.pickConnectMode,
      isSelected: _0x3868b1,
      isSelectionRelated: _0x2afb8a,
      showVideoMeta: _0xe02acd.ui?.showVideoMeta === true,
      viewport: _0xe02acd.viewport,
      mediaLodMode: _0x5c1dae
    });
    _pendingNodeDataMap.delete(_0x483653);
    _nodeDataSnapshotMap.set(_0x483653, _0x3e2521);
    _0xf8e73a.update(_0x3b82de);
    return true;
  }
  function _0x39b788(_0x2ee097) {
    const _0x1d4321 = Array.isArray(_0x2ee097) ? _0x2ee097 : [_0x2ee097];
    let _0x549003 = false;
    for (const _0x5e575c of new Set(_0x1d4321.filter(Boolean))) {
      _0x549003 = _0x7fee33(_0x5e575c) || _0x549003;
    }
    return _0x549003;
  }
  function _0x4cc9dd(_0x53a2cb, _0x49b08c = {}) {
    if (_0x49b08c?.settleInteraction === true) {
      return _0x34a789(_0x53a2cb);
    }
    if (_0x2b86ac.flushSelectionOnlySnapshot(_currentSnapshot, {
      allowPendingRaf: true,
      cancelPendingRaf: true
    })) {
      return true;
    }
    return _0x34a789(_0x53a2cb);
  }
  function _0x34a789(_0x3acec0, _0x3dd579 = {}) {
    if (!_0x3acec0) {
      return false;
    }
    const _0x2fce1c = _currentSnapshot;
    const _0x4583b0 = _0x2fce1c?.nodes || {};
    if (!_0x2fce1c || !_0x4583b0) {
      return false;
    }
    const _0x11fdbf = Array.isArray(_0x3acec0) ? _0x3acec0 : [_0x3acec0];
    const _0x46c504 = Array.isArray(_0x2fce1c.selectedNodeIds) ? _0x2fce1c.selectedNodeIds : [];
    const _0x2e974d = new Set(_0x46c504);
    const _0x51e4f7 = buildSelectedNodeRankMap(_0x46c504);
    const _0x294a05 = _0x2fce1c.edges || {};
    const _0x13c9fd = typeof _0x2fce1c._edgesRev === "number" ? _0x2fce1c._edgesRev : 0;
    _ensureEdgeIndex(_0x294a05, _0x13c9fd);
    const _0x49d1bd = _0x2fce1c.ui?.selectionRelatedHighlightEnabled === false ? {
      relatedNodeIds: new Set()
    } : _buildSelectionRelatedSets(_0x2e974d, _0x294a05);
    const _0x915a3e = _0x49d1bd.relatedNodeIds || new Set();
    const _0x30f3fa = _normalizeSelectionRelatedHighlightColor(_0x2fce1c.ui?.selectionRelatedHighlightColor);
    const _0x1c0fb1 = _0x2fce1c.viewport || {
      x: 0,
      y: 0,
      zoom: 1
    };
    const {
      width: _0x30b479,
      height: _0x202839
    } = _getCachedContainerSize(_0x1fb0e2.parentElement || _0x1fb0e2);
    const _0x591e86 = getInteractionRenderState();
    const _0x341ae6 = buildRendererDragTargetSet({
      dragContext: _0x591e86,
      selectedNodeSet: _0x2e974d,
      parentToChildren: _0x2fce1c._parentToChildren || {}
    });
    const _0x3a4cf5 = _0x2fce1c.ui && typeof _0x2fce1c.ui.showVideoMeta === "boolean" ? _0x2fce1c.ui.showVideoMeta : false;
    let _0x2d8837 = false;
    for (const _0x45e26f of new Set(_0x11fdbf.filter(Boolean))) {
      const _0x415539 = _0x4583b0[_0x45e26f];
      const _0x561428 = _wrapperMap.get(_0x45e26f);
      if (!_0x415539 || !_mountedNodeIds.has(_0x45e26f) || !_0x561428?.isConnected) {
        continue;
      }
      const _0x4337d7 = _0x2e974d.has(_0x45e26f);
      const _0x50367d = !_0x4337d7 && _0x915a3e.has(_0x45e26f);
      const _0x2968c7 = _getIncomingEdgeSignature(_0x45e26f, _0x294a05, _0x4583b0);
      const _0x3d9022 = syncNodeMediaLodMode(_0x561428, _0x415539, _0x1c0fb1);
      const _0x37d6ea = buildRendererNodeSignature({
        node: _0x415539,
        inEdgeSig: _0x2968c7,
        pickMode: _0x2fce1c.pickConnectMode,
        isSelected: _0x4337d7,
        isSelectionRelated: _0x50367d,
        showVideoMeta: _0x3a4cf5,
        viewport: _0x1c0fb1,
        mediaLodMode: _0x3d9022
      });
      _syncMountedNodePresentation({
        wrapperEl: _0x561428,
        node: _0x415539,
        nodeId: _0x45e26f,
        selectedNodeSet: _0x2e974d,
        selectedNodeRankMap: _0x51e4f7,
        connOverlay: _0x2fce1c.connOverlay,
        pickMode: _0x2fce1c.pickConnectMode,
        viewport: _0x1c0fb1,
        containerW: _0x30b479,
        containerH: _0x202839,
        dragContext: _0x591e86,
        dragTargets: _0x341ae6,
        showVideoMeta: _0x3a4cf5,
        relatedNodeIds: _0x915a3e,
        relatedHighlightColor: _0x30f3fa,
        inEdgeSig: _0x2968c7,
        signature: _0x37d6ea,
        mediaLodMode: _0x3d9022,
        skipInstanceUpdate: _0x3dd579?.skipInstanceUpdate !== false
      });
      if (shouldHydrateVideoMediaImmediately({
        node: _0x415539,
        nodeId: _0x45e26f,
        isSelected: _0x4337d7,
        isSelectionRelated: _0x50367d,
        dragTargets: _0x341ae6,
        connOverlay: _0x2fce1c.connOverlay,
        pickMode: _0x2fce1c.pickConnectMode
      })) {
        if (_componentMap.get(_0x45e26f)?._rendererMediaDeferred === true) {
          _videoHydrationBackpressure.markPriorityWork();
        }
        _rendererDeferredMedia.hydrateNow(_0x45e26f);
      }
      _0x2d8837 = true;
    }
    return _0x2d8837;
  }
  if (typeof window !== "undefined") {
    window.v2Renderer = window.v2Renderer || {};
    Object.assign(window.v2Renderer, {
      flushNode: _0x7fee33,
      flushNodes: _0x39b788,
      flushSelection: _0x4cc9dd
    });
  }
  const _0x175bb8 = _0x9a7818.subscribeRaw(_0x1eb796 => {
    if (_0x2b86ac.flushSelectionOnlySnapshot(_0x1eb796)) {
      return;
    }
    _currentSnapshot = _0x1eb796;
    _0x384997 = _0x1eb796;
    if (_0x34c845 !== null) {
      return;
    }
    _0x34c845 = requestAnimationFrame(() => {
      _0x34c845 = null;
      const _0x421744 = _0x384997;
      _0x384997 = null;
      _nodeTimerController.syncSnapshot(_0x421744);
      _0x117d2c(_0x421744);
    });
  });
  const _0x19f05f = () => {
    _0x175bb8();
    _0x2b86ac.reset();
    if (_resetSelectionFastPath === _0x5be48e) {
      _resetSelectionFastPath = null;
    }
    _0x8227da();
    _0x4c99dc.dispose();
    _rendererMediaRuntimePreparer.clear();
    if (_schedulePreparedMediaRuntimeCommit === _0x4f4012) {
      _schedulePreparedMediaRuntimeCommit = null;
    }
    _fastPreviewContinuation.reset();
    if (_containerResizeObserver) {
      _containerResizeObserver.disconnect();
      _containerResizeObserver = null;
    }
    _containerResizeHandler = null;
    _containerSizeSourceEl = null;
    _nodeDetailHydration.clearNodeDetailHydrationState();
    _videoMediaResidency.clear();
    _sourceVideoSourceKeySnapshotMap.clear();
    _pendingSourceVideoActivationIds.clear();
    _sourceVideoActivationRev = null;
    _sourceVideoActivationNodesRef = null;
    _nodeTimerController.clear();
    _currentSnapshot = null;
    clearRendererViewportMediaPreloadPause();
    if (_0x34c845 !== null) {
      cancelAnimationFrame(_0x34c845);
      _0x34c845 = null;
    }
    _0x384997 = null;
    _0x41f8e9?.remove?.();
    _0x161fc7?.remove?.();
    _0x5a2077?.remove?.();
    _selectionOverlay.unmount();
    _0x3b3ed8?.remove?.();
  };
  return _0x19f05f;
}
function _buildGroupOutputOrderSignature(_0x1c34a2, _0x5aaaea) {
  const _0xf90a51 = [];
  const _0x24c0fd = Array.isArray(_0x1c34a2?.groupOutputSourceOrder) ? _0x1c34a2.groupOutputSourceOrder.map(_0x3c22ad => String(_0x3c22ad || "").trim()).join(">") : "";
  if (_0x24c0fd) {
    _0xf90a51.push("global:" + _0x24c0fd);
  }
  const _0x7eee03 = String(_0x5aaaea || "").trim();
  const _0x768694 = _0x1c34a2?.groupOutputSourceOrderByTarget;
  const _0x489624 = _0x7eee03 && _0x768694 && typeof _0x768694 === "object" && !Array.isArray(_0x768694) && Array.isArray(_0x768694[_0x7eee03]) ? _0x768694[_0x7eee03].map(_0x340236 => String(_0x340236 || "").trim()).join(">") : "";
  if (_0x489624) {
    _0xf90a51.push("target:" + _0x489624);
  }
  return _0xf90a51.join("|");
}
function _getIncomingEdgeSignature(_0x451ee2, _0x4aa47, _0x31f5e3) {
  const _0xe1747f = [];
  const _0x5f89e5 = String(_0x31f5e3?.[_0x451ee2]?.parentId || "").trim();
  const _0x18f803 = [["direct", _0x451ee2]];
  if (_0x5f89e5 && isNodeType(_0x31f5e3?.[_0x5f89e5], "group")) {
    _0x18f803.push(["shared:" + _0x5f89e5, _0x5f89e5]);
  }
  for (const [_0x1e6752, _0x3e473b] of _0x18f803) {
    for (const _0x383a85 of _incomingEdgeIdsByTarget.get(_0x3e473b) || []) {
      const _0x47991c = _0x4aa47?.[_0x383a85];
      if (!_0x47991c || _0x47991c.targetId !== _0x3e473b) {
        continue;
      }
      const _0x1ee92a = _0x31f5e3?.[_0x47991c.sourceId];
      const _0x5ad16a = typeof _0x1ee92a?._bizRev === "number" ? _0x1ee92a._bizRev : 0;
      const _0x5777c2 = String(_0x47991c.refSlot || "");
      const _0x103fb6 = _buildGroupOutputOrderSignature(_0x47991c, _0x451ee2);
      _0xe1747f.push(_0x1e6752 + ":" + _0x47991c.id + ":" + _0x47991c.sourceId + ":" + _0x5777c2 + ":" + _0x5ad16a + ":" + buildGroupOutputMembershipSignature(_0x1ee92a, _0x31f5e3) + ":" + _0x103fb6);
    }
  }
  return _0xe1747f.join(",");
}
function _registerNodeRuntime(_0x15d99d) {
  if (!_0x15d99d?.nodeId || !_0x15d99d.wrapperEl || !_0x15d99d.instance) {
    return null;
  }
  const _0x501a03 = document.getElementById(_0x15d99d.nodeId);
  if (_0x501a03 && _0x501a03 !== _0x15d99d.wrapperEl && !_wrapperMap.has(_0x15d99d.nodeId)) {
    _0x501a03.remove();
  }
  _componentMap.set(_0x15d99d.nodeId, _0x15d99d.instance);
  _wrapperMap.set(_0x15d99d.nodeId, _0x15d99d.wrapperEl);
  _nodeTypeSnapshotMap.set(_0x15d99d.nodeId, _0x15d99d.canonicalType);
  return _0x15d99d;
}
function _createNodeRuntime(_0x4fba26, _0x1dd6b9, _0x52fc17, _0xa6ea2, _0x4f319b, _0x28079a = {}) {
  return _registerNodeRuntime(prepareRendererNodeRuntime({
    node: _0x4fba26,
    selectedNodeSet: _0x1dd6b9,
    selectedNodeRankMap: _0x52fc17,
    dragContext: _0xa6ea2,
    dragTargets: _0x4f319b,
    options: _0x28079a
  }));
}
function _ensureVideoMetaEl(_0x5ec9d6, _0x142737) {
  if (!_0x5ec9d6.__v2_video_meta_el) {
    const _0x5e2cde = document.createElement("div");
    _0x5e2cde.className = "node-video-meta";
    _0x5e2cde.dataset.nodeId = _0x142737;
    _0x5e2cde.dataset.visible = "0";
    _0x5e2cde.textContent = "";
    _0x5ec9d6.appendChild(_0x5e2cde);
    _0x5ec9d6.__v2_video_meta_el = _0x5e2cde;
  }
}
function _buildNodePresentationStableKey({
  node: _0x310566,
  nodeId: _0x1823c9,
  signature: _0x1f1a9c,
  visible: _0x6179c7,
  isSelected: _0x404c86,
  isSelectionRelated: _0x3c7e7e,
  relatedHighlightColor: _0x5f2944,
  connOverlay: _0x1af9c4,
  pickMode: _0x1399ea,
  showVideoMeta: _0x331af7,
  focused: _0x474fd5
} = {}) {
  const _0x5cd736 = _0x1af9c4?.srcId === _0x1823c9 ? "1" : "0";
  const _0x2c93bd = _0x1af9c4?.hoverId === _0x1823c9 ? "1" : "0";
  const _0x4bc4c0 = _0x1af9c4?.invalidNodeIds?.includes?.(_0x1823c9) ? "1" : "0";
  const _0xd240c8 = _0x1399ea?.active && _0x1399ea.sourceNodeId === _0x1823c9 ? "1" : "0";
  const _0x34a14b = _0x1399ea?.active && _0x1399ea.hoverNodeId === _0x1823c9 ? "1" : "0";
  const _0x3ac8fe = _0x331af7 && isNodeType(_0x310566, ["source-video", "ai-video"]) ? [_0x310566?.videoFps || "", _0x310566?.videoFrameCount || "", _0x310566?.videoWidth || "", _0x310566?.videoHeight || ""].join(",") : "";
  return [_0x1f1a9c || "", _0x6179c7 ? "1" : "0", _0x404c86 ? "1" : "0", _0x3c7e7e ? "1" : "0", _0x5f2944 || "", _0x5cd736, _0x2c93bd, _0x4bc4c0, String(_0x1af9c4?.side || ""), _0xd240c8, _0x34a14b, String(_0x1399ea?.handleDirection || ""), _0x331af7 ? "1" : "0", _0x3ac8fe, _0x310566?.generationStartTime || "", _0x310566?.generationDuration ?? "", resolveGenerationUiState(_0x310566), _0x474fd5 ? "1" : "0"].join("|");
}
function _syncMountedNodePresentation({
  wrapperEl: _0x4b9fda,
  node: _0x2e9103,
  nodeId: _0x4a45c1,
  selectedNodeSet: _0x3797c8,
  selectedNodeRankMap: _0x47a6d2,
  connOverlay: _0x2e6f09,
  pickMode: _0x2451ad,
  viewport: _0x5ac426,
  containerW: _0x2bd927,
  containerH: _0x303df9,
  dragContext: _0x1a22f3,
  dragTargets: _0x4ebb85,
  showVideoMeta: _0x2a418b,
  relatedNodeIds: _0x1daac7,
  relatedHighlightColor: _0x7505a9,
  inEdgeSig: _0x5bb52f,
  signature: _0x55934f,
  mediaLodMode = null,
  skipInstanceUpdate = false,
  deferInstanceUpdate = false,
  mountedThisFrame = false,
  lifecycleStats = null,
  allowActiveDetailHydration = true
}) {
  let _0x533bb4 = false;
  let _0x4023e5 = false;
  const _0x3e8698 = _0x2e9103.x + "," + _0x2e9103.y + "," + _0x2e9103.width + "," + _0x2e9103.height;
  const _0x1483f4 = _0x4b9fda._posKey !== _0x3e8698;
  const _0x59f0a6 = _0x1a22f3?.isDragging && _0x4ebb85 && _0x4ebb85.has(_0x4a45c1);
  const _0xfbac54 = _0x59f0a6 ? Number.isFinite(_0x1a22f3.pendingDx) ? _0x1a22f3.pendingDx : 0 : 0;
  const _0x71398a = _0x59f0a6 ? Number.isFinite(_0x1a22f3.pendingDy) ? _0x1a22f3.pendingDy : 0 : 0;
  const _0x2721dc = _isNodeVisible(_0x2e9103, _0x5ac426, _0x2bd927, _0x303df9, _0xfbac54, _0x71398a);
  const _0x49af21 = _componentMap.get(_0x4a45c1);
  if (mediaLodMode === null) {
    syncNodeMediaLodMode(_0x4b9fda, _0x2e9103, _0x5ac426);
  }
  if (_0x1483f4) {
    _0x4b9fda._posKey = _0x3e8698;
    _0x4b9fda.style.width = _0x2e9103.width + "px";
    _0x4b9fda.style.height = _0x2e9103.height + "px";
  }
  syncRendererNodeDragTransform(_0x4b9fda, _0x2e9103, {
    active: _0x59f0a6,
    offsetX: _0xfbac54,
    offsetY: _0x71398a,
    positionChanged: _0x1483f4
  });
  if (isNodeType(_0x2e9103, ["source-video", "ai-video"])) {
    _ensureVideoMetaEl(_0x4b9fda, _0x4a45c1);
  }
  const _0xead873 = _0x1a22f3.isDragging === true && _0x4ebb85?.has?.(_0x4a45c1) === true;
  if (_0xead873) {
    _0x4b9fda.classList.add("is-dragging");
  } else {
    _0x4b9fda.classList.remove("is-dragging");
  }
  if (_0xead873 && (_0x1a22f3.hasMoved || !_0x1a22f3.wasSelectedOnDown)) {
    _0x4b9fda.classList.add("is-ui-hidden");
  } else {
    _0x4b9fda.classList.remove("is-ui-hidden");
  }
  const _0xb23c36 = _0x3797c8.has(_0x4a45c1);
  const _0x26e6f0 = !_0xb23c36 && _0x1daac7?.has(_0x4a45c1);
  if (!_0x2721dc) {
    if (_0x49af21 && typeof _0x49af21.syncSelectionState === "function") {
      _0x49af21.syncSelectionState({
        selected: false,
        singleSelected: false,
        visible: false
      });
    }
    _nodeTimerController.hideNode(_0x4a45c1);
    if (_0x4b9fda.style.display !== "none") {
      _0x4b9fda.style.display = "none";
    }
    if (_0x49af21?.update && !skipInstanceUpdate && _0x55934f !== _nodeDataSnapshotMap.get(_0x4a45c1)) {
      const _0x153a5d = shouldKeepHiddenHeavyMediaUpdatePending({
        node: _0x2e9103,
        nodeId: _0x4a45c1,
        isSelected: _0xb23c36,
        dragTargets: _0x4ebb85
      });
      if (deferInstanceUpdate || _0x153a5d) {
        _pendingNodeDataMap.set(_0x4a45c1, {
          node: _0x2e9103,
          signature: _0x55934f
        });
        recordRendererLifecycleSkippedUpdate(lifecycleStats);
      } else {
        _nodeDataSnapshotMap.set(_0x4a45c1, _0x55934f);
        const _0x122ecb = lifecycleStats ? _nowMs() : 0;
        _0x49af21.update(_0x2e9103);
        _0x4023e5 = true;
        if (lifecycleStats) {
          recordRendererLifecycleDuration(lifecycleStats, "update", _0x2e9103, _nowMs() - _0x122ecb, "hidden");
        }
      }
    } else if (_0x49af21?.update && skipInstanceUpdate && _0x55934f !== _nodeDataSnapshotMap.get(_0x4a45c1)) {
      recordRendererLifecycleSkippedUpdate(lifecycleStats);
    }
    return {
      deferredUpdate: _0x533bb4,
      didUpdate: _0x4023e5
    };
  }
  if (_0x4b9fda.style.display === "none") {
    _0x4b9fda.style.display = "";
  }
  const _0x5d9558 = typeof document !== "undefined" && !!document.activeElement && _0x4b9fda.contains(document.activeElement);
  const _0x54baa4 = _buildNodePresentationStableKey({
    node: _0x2e9103,
    nodeId: _0x4a45c1,
    signature: _0x55934f,
    visible: _0x2721dc,
    isSelected: _0xb23c36,
    isSelectionRelated: _0x26e6f0,
    relatedHighlightColor: _0x7505a9,
    connOverlay: _0x2e6f09,
    pickMode: _0x2451ad,
    showVideoMeta: _0x2a418b,
    focused: _0x5d9558
  });
  if (!mountedThisFrame && !_0x59f0a6 && _0x4b9fda.dataset?.detailStage !== "deferred" && _nodeDataSnapshotMap.get(_0x4a45c1) === _0x55934f && _0x4b9fda._presentationStableKey === _0x54baa4) {
    return {
      deferredUpdate: false,
      didUpdate: false
    };
  }
  _0x4b9fda._presentationStableKey = _0x54baa4;
  syncNodeMediaMetricsDataset(_0x4b9fda, _0x2e9103);
  const _0x368f73 = shouldForceDeferActiveNodeDetails({
    nodeId: _0x4a45c1,
    dragContext: _0x1a22f3,
    dragTargets: _0x4ebb85
  });
  const _0x210db8 = _0x4b9fda.classList.contains("selected");
  if (_0xb23c36 !== _0x210db8) {
    if (_0xb23c36) {
      _0x4b9fda.classList.add("selected", "v2-selected");
    } else {
      _0x4b9fda.classList.remove("selected", "v2-selected");
      _0x4b9fda.style.outline = "";
    }
  }
  if (_0x26e6f0) {
    _0x4b9fda.classList.add("selection-related");
    const _0x20e353 = "selection-related-color-" + _normalizeSelectionRelatedHighlightColor(_0x7505a9);
    for (const _0x4fe07f of SELECTION_RELATED_HIGHLIGHT_COLORS) {
      const _0x59b3d3 = "selection-related-color-" + _0x4fe07f;
      if (_0x59b3d3 !== _0x20e353) {
        _0x4b9fda.classList.remove(_0x59b3d3);
      }
    }
    _0x4b9fda.classList.add(_0x20e353);
  } else {
    _0x4b9fda.classList.remove("selection-related");
    for (const _0x38bae7 of SELECTION_RELATED_HIGHLIGHT_COLORS) {
      _0x4b9fda.classList.remove("selection-related-color-" + _0x38bae7);
    }
  }
  if (allowActiveDetailHydration !== false && !_0x368f73 && _nodeDetailHydration.isNodeDetailActive({
    node: _0x2e9103,
    nodeId: _0x4a45c1,
    isSelected: _0xb23c36,
    connOverlay: _0x2e6f09,
    pickMode: _0x2451ad,
    relatedNodeIds: _0x1daac7
  })) {
    if (isNodeType(_0x2e9103, ["source-video", "ai-video", "video"]) && _0x4b9fda?.dataset?.detailStage === "deferred") {
      _videoHydrationBackpressure.markPriorityWork();
    }
    _nodeDetailHydration.hydrateNodeDetails(_0x4a45c1, _0x4b9fda);
  }
  if (_0x49af21 && typeof _0x49af21.syncSelectionState === "function") {
    _0x49af21.syncSelectionState({
      selected: _0xb23c36,
      singleSelected: _0x3797c8.size === 1,
      visible: true
    });
  }
  const _0x36070f = getRendererNodeZIndex(_0x2e9103, _0xb23c36, _0x47a6d2?.get?.(_0x4a45c1) ?? -1, {
    isFocused: _0x5d9558
  });
  syncRendererNodePresentationZIndex(_0x4b9fda, _0x36070f);
  if (isNodeType(_0x2e9103, "group")) {
    const _0x97c4d9 = _0x2e9103.color || "var(--indigo)";
    const _0x404cc2 = a641_0x76721a(_0x97c4d9, "60");
    const _0x1b4449 = a641_0x76721a(_0x97c4d9, "05");
    if (_0x4b9fda.style.borderColor !== _0x404cc2) {
      _0x4b9fda.style.borderColor = _0x404cc2;
    }
    if (_0x4b9fda.style.backgroundColor !== _0x1b4449) {
      _0x4b9fda.style.backgroundColor = _0x1b4449;
    }
    if (_0x4b9fda.style.getPropertyValue("--current-group-color") !== _0x97c4d9) {
      _0x4b9fda.style.setProperty("--current-group-color", _0x97c4d9);
    }
  }
  const _0x49c12a = _0x4b9fda.__v2_name_el;
  const _0x5cc1c0 = normalizeNodeType(_0x2e9103.type);
  const _0x24d8e0 = _0x49c12a ? a641_0x3c553d(_0x5cc1c0) : "";
  if (_0x49c12a) {
    if (_0x24d8e0) {
      if (_0x49c12a.dataset.labelKind !== _0x24d8e0) {
        _0x49c12a.dataset.labelKind = _0x24d8e0;
      }
    } else if ("labelKind" in _0x49c12a.dataset) {
      delete _0x49c12a.dataset.labelKind;
    }
  }
  if (_0x49c12a && _0x49c12a.contentEditable !== "true") {
    const _0x7e4a32 = getRendererDefaultNodeLabel(_0x2e9103);
    const _0x46dcb4 = hasNodeTypeBetaBadge(_0x5cc1c0);
    const _0x56de94 = _0x2e9103.name || _0x7e4a32;
    const _0x2fb996 = a641_0x382697(_0x56de94);
    _0x49c12a.dataset.fullName = _0x56de94;
    _0x49c12a.dataset.isBeta = _0x46dcb4 ? "1" : "0";
    a641_0x57722b(_0x49c12a);
    const _0x59220b = _0x49c12a.querySelector(".node-label-icon");
    const _0x2da9a1 = _0x49c12a.querySelector(".node-label-text");
    const _0x1ccdfb = _0x2fb996 || _0x7e4a32;
    const _0x8494a8 = _0x59220b?.dataset.labelKind || "";
    if (_0x8494a8 !== _0x24d8e0 || _0x2da9a1?.textContent !== _0x1ccdfb || (_0x46dcb4 ? _0x49c12a.dataset.betaLabel !== _0x56de94 : "betaLabel" in _0x49c12a.dataset)) {
      a641_0x131762(_0x49c12a, {
        labelKind: _0x24d8e0,
        displayLabelText: _0x2fb996,
        defaultName: _0x7e4a32,
        isBeta: _0x46dcb4,
        fullLabelText: _0x56de94
      });
    }
  }
  _nodeTimerController.renderNode(_0x4a45c1, _0x2e9103, {
    selected: _0xb23c36
  });
  const _0x2cb009 = _0x4b9fda.__v2_video_meta_el;
  if (_0x2cb009) {
    if (!_0x2a418b) {
      if (_0x2cb009.dataset.visible !== "0") {
        _0x2cb009.dataset.visible = "0";
      }
    } else {
      const _0x83f92e = Number(_0x2e9103.videoFps);
      const _0x141044 = Number(_0x2e9103.videoFrameCount);
      const _0x2bd708 = Number(_0x2e9103.videoWidth);
      const _0xe641cf = Number(_0x2e9103.videoHeight);
      const _0x549020 = Number.isFinite(_0x83f92e) && _0x83f92e > 0 && Number.isFinite(_0x141044) && _0x141044 > 0;
      const _0x13df85 = _0x549020 ? "1" : "0";
      if (_0x2cb009.dataset.visible !== _0x13df85) {
        _0x2cb009.dataset.visible = _0x13df85;
      }
      if (!_0x549020 && typeof _0x49af21?.requestVideoMetaForNodeInfo === "function") {
        _0x49af21.requestVideoMetaForNodeInfo(_0x2e9103);
      }
      if (_0x549020) {
        const _0x396143 = formatVideoMetaText({
          fps: _0x83f92e,
          frames: _0x141044,
          width: _0x2bd708,
          height: _0xe641cf
        });
        if (_0x2cb009.textContent !== _0x396143) {
          _0x2cb009.textContent = _0x396143;
        }
      }
    }
  }
  if (_0x49af21?.update && _0x55934f !== _nodeDataSnapshotMap.get(_0x4a45c1)) {
    if (skipInstanceUpdate) {
      _nodeDataSnapshotMap.set(_0x4a45c1, _0x55934f);
    } else if (deferInstanceUpdate) {
      _0x533bb4 = true;
      recordRendererLifecycleSkippedUpdate(lifecycleStats);
    } else {
      _nodeDataSnapshotMap.set(_0x4a45c1, _0x55934f);
    }
    if (!skipInstanceUpdate && !deferInstanceUpdate) {
      const _0x422425 = lifecycleStats ? _nowMs() : 0;
      _0x49af21.update(_0x2e9103);
      _0x4023e5 = true;
      if (lifecycleStats) {
        const _0x338434 = _0x49af21?._lastUpdatePerfBreakdown || null;
        recordRendererLifecycleDuration(lifecycleStats, "update", _0x2e9103, _nowMs() - _0x422425, "visible", {
          breakdown: _0x338434
        });
      }
    } else if (skipInstanceUpdate) {
      recordRendererLifecycleSkippedUpdate(lifecycleStats);
    }
  }
  const _0x3d5627 = _0x2451ad && _0x2451ad.active && _0x4a45c1 === _0x2451ad.sourceNodeId;
  const _0x235c07 = isNodeType(_0x2e9103, "storyboard") && _0x2e9103.isEditing;
  if (_0x2e6f09 && _0x2e6f09.srcId || _0x3d5627 || _0x235c07) {
    if (_0x4a45c1 === _0x2e6f09?.srcId || _0x3d5627 || _0x235c07) {
      _0x4b9fda.classList.add("conn-src");
      _0x4b9fda.classList.remove("conn-invalid");
    } else if (_0x2e6f09?.invalidNodeIds?.includes(_0x4a45c1)) {
      _0x4b9fda.classList.add("conn-invalid");
      _0x4b9fda.classList.remove("conn-src");
    } else {
      _0x4b9fda.classList.remove("conn-invalid", "conn-src");
    }
  } else {
    _0x4b9fda.classList.remove("conn-invalid", "conn-src");
  }
  if (_0x3d5627 || _0x235c07) {
    _0x4b9fda.style.setProperty("box-shadow", "0 0 0 2px var(--white-70), 0 0 20px 0 var(--white-40)", "important");
    _0x4b9fda.style.setProperty("border-radius", "16px", "important");
  } else if (_0x4b9fda.style.getPropertyPriority("box-shadow") === "important") {
    _0x4b9fda.style.removeProperty("box-shadow");
    _0x4b9fda.style.removeProperty("border-radius");
  }
  const _0x1cb2b6 = _0x2451ad && _0x2451ad.active && _0x2451ad.hoverNodeId === _0x4a45c1;
  if (_0x2e6f09 && _0x2e6f09.hoverId === _0x4a45c1 || _0x1cb2b6) {
    if (!_0x4b9fda.classList.contains("conn-hoverTarget")) {
      _0x4b9fda.classList.add("conn-hoverTarget");
      const _0x362199 = window.getComputedStyle(_0x4b9fda).borderRadius;
      let _0x2b083f = parseFloat(_0x362199);
      if (isNaN(_0x2b083f) || _0x2b083f <= 0) {
        _0x2b083f = 16;
      }
      _0x4b9fda.style.setProperty("--hover-br", _0x2b083f + 4 + "px");
    }
    let _0x58c162 = false;
    if (_0x2e6f09 && _0x2e6f09.side === "left") {
      _0x58c162 = true;
    } else if (_0x1cb2b6 && _0x2451ad && _0x2451ad.handleDirection === "left") {
      _0x58c162 = true;
    }
    if (_0x58c162) {
      _0x4b9fda.classList.add("conn-hover-output");
      _0x4b9fda.classList.remove("conn-hover-input");
    } else {
      _0x4b9fda.classList.add("conn-hover-input");
      _0x4b9fda.classList.remove("conn-hover-output");
    }
  } else if (_0x4b9fda.classList.contains("conn-hoverTarget")) {
    _0x4b9fda.classList.remove("conn-hoverTarget", "conn-hover-input", "conn-hover-output");
    _0x4b9fda.style.removeProperty("--hover-br");
  }
  syncNodeResultClass(_0x4b9fda, _0x2e9103, isNodeType);
  return {
    deferredUpdate: _0x533bb4,
    didUpdate: _0x4023e5
  };
}
function _renderNodesImpl(_0xb9986c, _0xfad56d, _0x921106, _0x5cbac5, _0x5b776e, _0xcef5c7, _0x3c0d47, _0x36c836, _0x320965, _0x4220a7, _0x608dc5, _0x365d94 = null, _0x12d605 = {}) {
  const _0x5acec0 = _0x3c0d47;
  const _0x4ea917 = _0x36c836 || {
    x: 0,
    y: 0,
    zoom: 1
  };
  const _0x5c1672 = _0x320965 || {};
  const _0xc815d9 = _0x4220a7 || {};
  const _0x49dade = _0x608dc5 !== false;
  const _0x21208e = _0x12d605?.deferParking === true;
  const _0x2856f9 = getInteractionRenderState();
  const _0x50a941 = _0x921106 instanceof Set ? _0x921106 : new Set(_0x921106 || []);
  const _0x4cda67 = buildSelectedNodeRankMap(_0x921106);
  const _0x23418e = buildRendererDragTargetSet({
    dragContext: _0x2856f9,
    selectedNodeSet: _0x50a941,
    parentToChildren: _0xc815d9
  });
  const _0x14de40 = _rendererRuntimeDiagnosticsEnabled ? _nowMs() : 0;
  const {
    width: _0x262873,
    height: _0x3ab908
  } = _getCachedContainerSize(_0xb9986c.parentElement || _0xb9986c);
  const _0x4abcd4 = Number.isFinite(_0x365d94?._nodeCount) ? _0x365d94._nodeCount : Object.keys(_0xfad56d || {}).length;
  const _0x4b1ed4 = Number.isFinite(_0x365d94?._nodesRev) ? _0x365d94._nodesRev : Number.isFinite(_0x365d94?._persistRev) ? _0x365d94._persistRev : _0x4abcd4;
  const _0x4ff025 = Number.isFinite(_0x365d94?._nodeGeometryRev) ? _0x365d94._nodeGeometryRev : Number.isFinite(_0x365d94?._persistRev) ? _0x365d94._persistRev : _0x4abcd4;
  const _0x5c1f93 = Number.isFinite(_0x365d94?._sourceVideoRev) ? _0x365d94._sourceVideoRev : Number.isFinite(_0x365d94?._persistRev) ? _0x365d94._persistRev : null;
  const _0xa9aa9e = _getPinnedNodeIds();
  const _0x148847 = getCachedRendererSpatialIndex(_0xfad56d, {
    geometryRev: _0x4ff025,
    nodeCount: _0x4abcd4,
    denseNodeCount: RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount
  });
  const _0x3bdae0 = buildRendererVirtualizationSignature({
    snapshotRev: _0x4b1ed4,
    nodeCount: _0x4abcd4,
    viewport: _0x4ea917,
    selectedNodeIds: _0x921106,
    connOverlay: _0xcef5c7,
    pickConnectMode: _0x5acec0,
    dragContext: _0x2856f9,
    pinnedNodeIds: _0xa9aa9e,
    containerW: _0x262873,
    containerH: _0x3ab908
  });
  let _0xa97d35 = _lastVirtualCandidateResult;
  const _0x115dde = _0x3bdae0 === _lastVirtualCandidateSignature && !!_0xa97d35;
  if (!_0x115dde) {
    _0xa97d35 = buildVirtualizationCandidateSets({
      nodes: _0xfad56d,
      spatialIndex: _0x148847,
      viewport: _0x4ea917,
      containerWidth: _0x262873,
      containerHeight: _0x3ab908,
      selectedNodeIds: _0x921106,
      connOverlay: _0xcef5c7,
      pickConnectMode: _0x5acec0,
      dragContext: _0x2856f9,
      parentToChildren: _0xc815d9,
      pinnedNodeIds: _0xa9aa9e,
      mountedNodeIds: _mountedNodeIds
    });
    _lastVirtualCandidateSignature = _0x3bdae0;
    _lastVirtualCandidateResult = _0xa97d35;
  }
  _0xa97d35 = ensureRendererExactVisiblePreviewCandidates({
    virtualizationResult: _0xa97d35,
    nodes: _0xfad56d,
    spatialIndex: _0x148847,
    viewport: _0x4ea917,
    containerWidth: _0x262873,
    containerHeight: _0x3ab908,
    nodeCount: _0x4abcd4
  });
  const _0x3ee6bc = _0x5c1f93 === null || _sourceVideoActivationNodesRef !== _0xfad56d || _sourceVideoActivationRev !== _0x5c1f93;
  syncRendererPendingSourceVideoActivationIds({
    nodes: _0xfad56d,
    sourceKeysByNodeId: _sourceVideoSourceKeySnapshotMap,
    pendingNodeIds: _pendingSourceVideoActivationIds,
    scanNodes: _0x3ee6bc,
    isPresented: (_0x359fad, _0x238d6c) => {
      const _0x2c7bb4 = _sourceVideoSlotLifecycle.read(_0x359fad);
      return _0x2c7bb4.surface === "media" && _0x2c7bb4.sourceKey === _0x238d6c;
    }
  });
  if (_0x3ee6bc) {
    _sourceVideoActivationRev = _0x5c1f93;
    _sourceVideoActivationNodesRef = _0xfad56d;
  }
  const _0x20b00e = resolveRendererLowZoomRealVideoNodeIds({
    nodes: _0xfad56d,
    candidateNodeIds: _0xa97d35.previewCandidateIds,
    selectedNodeIds: _0x921106,
    priorityNodeIds: _pendingSourceVideoActivationIds,
    viewport: _0x4ea917,
    nodeCount: _0x4abcd4,
    containerWidth: _0x262873,
    containerHeight: _0x3ab908
  });
  _0xa97d35 = applyRendererLowZoomRealVideoCandidates(_0xa97d35, _0x20b00e);
  const _0x200ec1 = collectFullEligibleVisibleImageNodeIds({
    nodes: _0xfad56d,
    candidateNodeIds: _0xa97d35.previewCandidateIds,
    viewport: _0x4ea917,
    isVisible: _0x4cad48 => isNodeInsideViewportPadding(_0x4cad48, _0x4ea917, _0x262873, _0x3ab908, 0),
    getPreviousMode: _0x4b2bcd => String(_wrapperMap.get(_0x4b2bcd)?.dataset?.mediaLodMode || "").trim(),
    interactionBusy: _0x12d605?.viewportBusy === true || _0x12d605?.previewOnly === true || _rendererInteractionGrace.isBusy()
  });
  _0xa97d35 = applyRendererFullEligibleImageCandidates(_0xa97d35, _0x200ec1);
  const _0x46e5db = buildRendererScenePlan({
    nodes: _0xfad56d,
    spatialIndex: _0x148847,
    viewport: _0x4ea917,
    containerRect: {
      width: _0x262873,
      height: _0x3ab908
    },
    mountCandidateIds: _0xa97d35.mountCandidateIds,
    previewCandidateIds: _0xa97d35.previewCandidateIds,
    parkCandidateIds: _0xa97d35.parkCandidateIds,
    selectedNodeIds: _0x50a941,
    activeNodeIds: _0x23418e,
    keepAliveNodeIds: _0xa97d35.keepAliveNodeIds,
    mountedNodeIds: _mountedNodeIds,
    fullEligibleVisibleImageNodeIds: _0x200ec1,
    includeParkIds: false
  });
  const _0x51df9f = _0x3bdae0 + "|scene:" + _0x46e5db.surfaceSignature;
  const {
    plannedFullEligibleVisibleImageNodeIds: _0x556511
  } = _0x46e5db;
  _0xa97d35 = {
    ..._0xa97d35,
    mountCandidateIds: _0x46e5db.fullSurfaceIds,
    previewCandidateIds: _0x46e5db.presentationSurfaceIds,
    parkCandidateIds: _0x46e5db.fullSurfaceReleaseIds,
    scenePlan: _0x46e5db
  };
  _notifyVirtualizationProbe({
    signature: _0x3bdae0,
    cacheHit: _0x115dde,
    snapshotRev: _0x4b1ed4,
    containerW: _0x262873,
    containerH: _0x3ab908,
    spatialIndex: !!_0x148847,
    nodeCount: _0x4abcd4,
    mountCandidateCount: _0xa97d35.mountCandidateIds?.size || 0,
    previewCandidateCount: _0xa97d35.previewCandidateIds?.size || 0,
    parkCandidateCount: _0xa97d35.parkCandidateIds?.size || 0,
    keepAliveCount: _0xa97d35.keepAliveNodeIds?.size || 0,
    scenePressure: _0x46e5db.pressure,
    sceneFullSurfaceBudget: _0x46e5db.fullSurfaceBudget,
    sceneFullSurfaceCount: _0x46e5db.fullSurfaceIds.size,
    sceneProxySurfaceCount: _0x46e5db.proxySurfaceIds.size
  });
  if (_rendererRuntimeDiagnosticsEnabled) {
    recordRendererRuntimeDiagnostic({
      kind: "renderer-virtualization",
      mode: _0x12d605?.mode || "steady",
      cacheHit: _0x115dde,
      nodeCount: _0x4abcd4,
      mountCandidateCount: _0xa97d35.mountCandidateIds?.size || 0,
      previewCandidateCount: _0xa97d35.previewCandidateIds?.size || 0,
      parkCandidateCount: _0xa97d35.parkCandidateIds?.size || 0,
      fullEligibleVisibleImageCount: _0x200ec1.size,
      plannedFullEligibleVisibleImageCount: _0x556511.size,
      scenePressure: _0x46e5db.pressure,
      sceneFullSurfaceBudget: _0x46e5db.fullSurfaceBudget,
      sceneFullSurfaceCount: _0x46e5db.fullSurfaceIds.size,
      sceneProxySurfaceCount: _0x46e5db.proxySurfaceIds.size,
      fullImageSettleReady: _0x12d605?.fullImageSettleReady === true,
      durationMs: _nowMs() - _0x14de40,
      viewport: {
        ..._0x4ea917
      }
    });
  }
  const {
    mountCandidateIds: _0x8bc652
  } = _0xa97d35;
  let {
    parkCandidateIds: _0x164009
  } = _0xa97d35;
  if (_0x12d605?.viewportPriorityMediaOnly !== true) {
    _rendererMediaRuntimePreparer.prune(_0x8bc652);
  }
  const _0x25a573 = _0xa97d35.previewCandidateIds || _0x8bc652;
  const _0xea20bf = collectFullEligibleVisibleImageNodeIds({
    nodes: _0xfad56d,
    candidateNodeIds: _0x25a573,
    viewport: _0x4ea917,
    isVisible: () => true,
    getPreviousMode: _0x310765 => String(_wrapperMap.get(_0x310765)?.dataset?.mediaLodMode || "").trim(),
    interactionBusy: _0x12d605?.viewportBusy === true || _0x12d605?.previewOnly === true || _rendererInteractionGrace.isBusy()
  });
  const _0x50a01b = _0x12d605?.viewportBusy === true || _0x12d605?.deferParking === true || _0x12d605?.deferHeavyMediaMount === true || _rendererInteractionGrace.isBusy();
  const _0x50d1ab = _0x50a01b || _0x12d605?.previewOnly === true;
  const _0x4ff830 = _0x50a01b && resolveRendererLowZoomMountLimit({
    viewport: _0x4ea917,
    nodeCount: _0x4abcd4
  }) <= 0;
  const _0x3f9fc6 = _rasterPreviewCoordinator.sync({
    canvasEl: _0xb9986c,
    nodes: _0xfad56d,
    scenePlan: _0x46e5db,
    selectedNodeIds: _0x50a941,
    dragNodeIds: _0x23418e,
    connOverlay: _0xcef5c7,
    pickConnectMode: _0x5acec0,
    viewport: _0x4ea917,
    viewportBusy: _0x50a01b,
    mediaLoadingBusy: _0x50d1ab,
    freezeRasterSurface: _0x50a01b,
    lockRasterParticipation: _0x12d605?.lockRasterParticipation === true,
    releaseFullSurface(_0x4a0213) {
      const _0x481a20 = _wrapperMap.get(_0x4a0213);
      if (!_0x481a20?.style || _0x481a20.classList?.contains?.("is-dragging")) {
        return;
      }
      _0x481a20.style.display = "none";
      _nodeTimerController.hideNode(_0x4a0213);
    }
  });
  const _0x5788e0 = _0x12d605?.suspendNewMediaSrc === true || _0x3f9fc6.freezeActive === true && _0x50d1ab;
  _0x164009 = _0x3f9fc6.releasableFullSurfaceIds;
  const {
    domPreviewCandidateIds: _0x5e6b8c,
    domPreviewMediaSourceOwnerIds: _0x3208b3
  } = _0x3f9fc6;
  const _0x45142c = [..._0x46e5db.exactVisibleGenerationBusyIds].filter(_0x2ee129 => !_0x46e5db.fullSurfaceIds.has(_0x2ee129) || !_mountedNodeIds.has(_0x2ee129));
  const _0x327f48 = new Set([..._0x3208b3, ..._0x45142c]);
  if (isPerfProbeEnabled()) {
    _0xb9986c.__aicanvasPerfRasterCoordinatorStats = {
      claimedRasterNodeIds: [..._0x3f9fc6.rasterIds],
      domPreviewCandidateNodeIds: [..._0x5e6b8c],
      domPreviewMediaSourceOwnerNodeIds: [..._0x3208b3],
      freezeActive: _0x3f9fc6.freezeActive === true,
      viewportBusyForPreview: _0x50a01b,
      viewportBusyOption: _0x12d605?.viewportBusy === true,
      deferParkingOption: _0x12d605?.deferParking === true,
      deferHeavyMediaMountOption: _0x12d605?.deferHeavyMediaMount === true,
      interactionGraceBusy: _rendererInteractionGrace.isBusy(),
      policy: {
        ...(_0x3f9fc6.policy?.stats || {})
      }
    };
  }
  const _0x5900b9 = _0x51df9f + "|raster:" + _0x3f9fc6.signature;
  const _0x26888f = _0x46e5db.exactVisibleGenerationBusyIds.size > 0 ? new Set([..._0x5e6b8c, ..._0x46e5db.exactVisibleGenerationBusyIds]) : _0x5e6b8c;
  cancelStaleLowPriorityPreloadsForHighZoom(_0x4ff830);
  const _0x1adeef = [];
  _visibleVideoSurface.sync(_0xb9986c, _0xfad56d, _0x1adeef);
  if (_0x12d605?.previewOnly === true) {
    _fastPreviewContinuation.reset();
    _fastPreviewLayer.sync(_0xb9986c, _0xfad56d, _0x26888f, _0x50a941, {
      connOverlay: _0xcef5c7,
      pickConnectMode: _0x5acec0,
      nodeCount: _0x4abcd4,
      viewport: _0x4ea917,
      containerWidth: _0x262873,
      containerHeight: _0x3ab908,
      freezeRasterSurface: _0x3f9fc6.freezeActive === true,
      previewOnly: true,
      suppressNewMedia: _0x4ff830,
      mediaSourceOwnerIds: _0x3208b3,
      requiredImmediateMediaSourceOwnerIds: _0x327f48,
      viewportBusy: _0x50a01b,
      dragContext: _0x2856f9,
      dragTargets: _0x23418e,
      suspendNewMediaSrc: _0x5788e0,
      fullEligibleVisibleImageNodeIds: _0x200ec1,
      fullEligiblePreviewImageNodeIds: _0xea20bf
    });
    return {
      hasPendingStructuralOps: false,
      deferredParkCount: 0,
      hasPendingVisibleVideoMounts: false,
      hasPendingFullEligibleVisibleImageMounts: false
    };
  }
  const _0x2d0ded = prioritizeFullEligibleVisibleImageNodes(collectVirtualizedRenderNodes({
    nodes: _0xfad56d,
    virtualizationResult: _0xa97d35,
    spatialIndex: _0x148847,
    mountedNodeIds: _mountedNodeIds,
    viewport: _0x4ea917,
    containerWidth: _0x262873,
    containerHeight: _0x3ab908
  }), _0x200ec1);
  const _0xff834b = Array.from(_0x556511).filter(_0x3bb638 => !_mountedNodeIds.has(_0x3bb638)).length;
  const _0x4e788d = isPerfProbeEnabled() ? createRendererNodeLifecycleStats({
    mode: _0x12d605?.mode || "steady",
    nodeCount: _0x4abcd4,
    renderNodeCount: _0x2d0ded.length,
    mountCandidateCount: _0x8bc652.size,
    parkCandidateCount: _0x164009.size,
    viewportBusy: _0x50a01b
  }) : null;
  const _0x115ca7 = createRendererStructuralBudget(getRendererStructuralBudgetOptions({
    cacheHit: _0x115dde,
    dragContext: _0x2856f9,
    fullEligibleVisibleImageCount: _0x556511.size,
    fullImageSettleReady: _0x12d605?.fullImageSettleReady === true,
    nodeCount: _0x4abcd4,
    pendingFullEligibleVisibleImageCount: _0xff834b,
    renderMode: _0x12d605?.mode || "steady",
    viewport: _0x4ea917
  }));
  const _0x3a07dd = createRendererStructuralBudget({
    batchSize: RENDERER_FULL_SURFACE_RELEASE_BATCH_SIZE,
    frameBudgetMs: RENDERER_FULL_SURFACE_RELEASE_FRAME_BUDGET_MS
  });
  let _0x43000d = false;
  let _0x145bed = 0;
  let _0x39e7c9 = null;
  const _0x4c835c = new Set();
  const _0x1c49b1 = createHeavyMediaUpdateFrameBudget({
    nodeCount: _0x4abcd4,
    now: _nowMs
  });
  let _0x484a7a = false;
  let _0xd4402b = false;
  let _0x476495 = false;
  let _0x32ac8a = false;
  let _0x2706fa = false;
  const _0x5a6002 = _0x4abcd4 >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount;
  const _0x1ead0f = createHeavyMediaPreviewOnlyDecider({
    viewport: _0x4ea917,
    nodeCount: _0x4abcd4,
    lowZoomRealVideoNodeIds: _0x20b00e,
    fullEligibleVisibleImageNodeIds: _0x556511
  });
  const _0x3f3d0d = createRendererVisibleAudioWarmupPass({
    viewport: _0x4ea917,
    nodeCount: _0x4abcd4,
    deferredMedia: _rendererDeferredMedia
  });
  for (const _0x36939f of _0x2d0ded) {
    if (!_0x36939f?.id) {
      continue;
    }
    const _0x4c0149 = _0x36939f.id;
    let _0x53bf03 = _wrapperMap.get(_0x4c0149);
    let _0x4b5c6a = _componentMap.get(_0x4c0149);
    let _0x57a39b = false;
    const _0xd3ca28 = normalizeNodeType(_0x36939f.type);
    const _0xdd14f0 = isNodeType(_0x36939f, "source-video");
    if (_0xdd14f0) {
      _sourceVideoSlotLifecycle.syncViewportVisibility(_0x4c0149, {
        isSelected: _0x50a941.has(_0x4c0149),
        isPreviewCandidate: _0x25a573.has(_0x4c0149),
        isVisible: _isNodeVisible(_0x36939f, _0x4ea917, _0x262873, _0x3ab908)
      });
    }
    const _0x2d94aa = _nodeTypeSnapshotMap.get(_0x4c0149);
    if (_0x53bf03 && _0x4b5c6a && _0x2d94aa && _0x2d94aa !== _0xd3ca28) {
      _destroyNode(_0x4c0149);
      _0x53bf03 = null;
      _0x4b5c6a = null;
    }
    const _0x2e7fbb = _mountedNodeIds.has(_0x4c0149) && !!_0x53bf03?.isConnected;
    const _0x582f5e = _sourceVideoSlotLifecycle.shouldRetainPresentedSurface(_0x4c0149);
    const _0xbe2e71 = _0x582f5e || _0x8bc652.has(_0x4c0149) || _0x2e7fbb && !_0x164009.has(_0x4c0149);
    let _0x2af954 = false;
    let _0x375e18 = false;
    if (!_0xbe2e71) {
      if (_0x53bf03 && _0x4b5c6a) {
        const _0x1bdb54 = _pendingNodeDataMap.get(_0x4c0149);
        if (!_0x1bdb54 || _0x1bdb54.node !== _0x36939f) {
          _pendingNodeDataMap.set(_0x4c0149, {
            node: _0x36939f,
            signature: null
          });
        }
      }
      if (_0x2e7fbb && _0x164009.has(_0x4c0149)) {
        if (_0x21208e) {
          _0x145bed += 1;
          continue;
        }
        if (_0x3a07dd.hasBudget()) {
          const _0x244ab8 = _0x4e788d ? _nowMs() : 0;
          _parkNode(_0x4c0149);
          if (_0x4e788d) {
            recordRendererLifecycleDuration(_0x4e788d, "park", _0x36939f, _nowMs() - _0x244ab8, "park");
          }
          _0x3a07dd.consume();
        } else {
          _0x43000d = true;
        }
      }
      continue;
    }
    const _0x41e43c = _0x50a941.has(_0x4c0149);
    const _0x5eea09 = !_0x41e43c && _0x5cbac5?.has?.(_0x4c0149);
    const _0x1a8b42 = isNodeType(_0x36939f, ["source-video", "ai-video", "video"]);
    const _0x68ffc4 = _0x1a8b42 && _isNodeVisible(_0x36939f, _0x4ea917, _0x262873, _0x3ab908);
    if (_0x1a8b42) {
      const _0x5702c5 = _0x20b00e.has(_0x4c0149) || resolveRendererLowZoomMountLimit({
        viewport: _0x4ea917,
        nodeCount: _0x4abcd4
      }) <= 0;
      _videoMediaResidency.sync(_0x4c0149, {
        withinResidency: _0x5702c5 && isNodeInsideViewportPadding(_0x36939f, _0x4ea917, _0x262873, _0x3ab908, RENDERER_VIDEO_MEDIA_RESIDENCY_PADDING),
        leaseKey: _resolveVideoMediaLeaseKey(_0x4c0149, _0x36939f)
      });
    }
    const _0x4ad30e = _0x68ffc4 && !!resolveCanvasVideoDisplayUrl(_0x36939f);
    if (_0x12d605?.viewportPriorityMediaOnly === true && !_0x4ad30e) {
      continue;
    }
    const _0x278e92 = _0x20b00e.has(_0x4c0149);
    const _0x2b23ff = shouldHydrateVideoMediaImmediately({
      node: _0x36939f,
      nodeId: _0x4c0149,
      isSelected: _0x41e43c,
      isSelectionRelated: _0x5eea09,
      dragTargets: _0x23418e,
      connOverlay: _0xcef5c7,
      pickMode: _0x5acec0
    });
    const _0x20ea94 = isViewportPriorityImageNode({
      node: _0x36939f,
      nodeId: _0x4c0149,
      mountCandidateIds: _0x8bc652,
      viewport: _0x4ea917,
      containerW: _0x262873,
      containerH: _0x3ab908,
      isSelected: _0x41e43c,
      isSelectionRelated: _0x5eea09
    });
    const _0x3c7c71 = _0x556511.has(_0x4c0149);
    if (!_0x4b5c6a || !_0x53bf03) {
      if (_0x1ead0f({
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        isVisibleVideoMediaNode: _0x68ffc4,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0,
        viewport: _0x4ea917,
        nodeCount: _0x4abcd4
      })) {
        continue;
      }
      if (!_0x3c7c71 && shouldDeferHeavyMediaMount({
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0,
        options: _0x12d605
      })) {
        _0x43000d = true;
        if (_0x1a8b42) {
          _0x2706fa = true;
        }
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        continue;
      }
      if (!_0x3c7c71 && _0x1c49b1.shouldDefer({
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0
      })) {
        _0x43000d = true;
        if (_0x1a8b42) {
          _0x2706fa = true;
        }
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        if (_0x3c7c71) {
          _0xd4402b = true;
        }
        continue;
      }
      if (_0x5a6002 && _0x1a8b42 && _0x476495 && !_0x2b23ff) {
        _0x43000d = true;
        _0x2706fa = true;
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        continue;
      }
      const _0x21a550 = _0x115ca7.hasBudget();
      if (!_0x21a550 && !_0x2b23ff) {
        _0x43000d = true;
        if (_0x1a8b42) {
          _0x2706fa = true;
        }
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        if (_0x3c7c71) {
          _0xd4402b = true;
        }
        continue;
      }
      const _0x4b910e = _nodeDetailHydration.shouldDeferNodeDetails({
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0,
        relatedNodeIds: _0x5cbac5,
        viewport: _0x4ea917,
        mountCandidateCount: _0x8bc652.size,
        nodeCount: _0x4abcd4,
        forceDeferActiveNodeDetails: shouldForceDeferActiveNodeDetails({
          nodeId: _0x4c0149,
          dragContext: _0x2856f9,
          dragTargets: _0x23418e
        }) || _0x12d605?.viewportPriorityMediaOnly === true && _0xdd14f0 && !_0x2b23ff || shouldForceDeferRelatedVideoDetails({
          node: _0x36939f,
          nodeId: _0x4c0149,
          isSelected: _0x41e43c,
          isSelectionRelated: _0x5eea09,
          dragTargets: _0x23418e,
          viewport: _0x4ea917,
          mountCandidateCount: _0x8bc652.size,
          nodeCount: _0x4abcd4,
          options: _0x12d605
        })
      });
      const _0x33f2e8 = false;
      const _0x5be7ad = shouldDeferInitialVideoMediaOnMount({
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        nodeCount: _0x4abcd4,
        mountCandidateCount: _0x8bc652.size
      });
      const _0x1138a8 = _0x68ffc4 && _visibleVideoSurface.hasPendingHandoff(_0x4c0149);
      _0x57a39b = _0x1138a8 || (_0x4b910e || _0x5be7ad) && !_0x33f2e8;
      _0x375e18 = _0x57a39b && (!_0x4b910e || _0x68ffc4) && (!_0x1a8b42 || !resolveCanvasVideoPosterUrl(_0x36939f));
      const _0x4a007e = {
        deferDetailsOnMount: _0x4b910e,
        deferMediaOnMount: _0x57a39b,
        eagerVideoPreviewOnMount: _0x33f2e8
      };
      const _0x481b69 = [_0x4b910e ? "details-deferred" : "details-ready", _0x57a39b ? "media-deferred" : "media-ready", _0x33f2e8 ? "video-eager" : "video-lazy"].join("|");
      const _0x43ca7e = _rendererMediaRuntimePreparer.hasPrepared(_0x4c0149, _0x36939f, _0x481b69);
      const _0x4c7c0d = isRendererMediaRuntimeInteractionPriority({
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0
      });
      const _0x33c36f = shouldPrebuildRendererMediaRuntime({
        node: _0x36939f,
        nodeCount: _0x4abcd4,
        veryDenseNodeCount: RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount,
        hasExactVisiblePreview: _0x5e6b8c.has(_0x4c0149) && _0x3208b3.has(_0x4c0149),
        interactionBusy: _0x50a01b,
        interactionPriority: _0x4c7c0d,
        deferMediaOnMount: _0x57a39b,
        eagerVideoPreviewOnMount: _0x33f2e8,
        viewportPriorityMediaOnly: _0x12d605?.viewportPriorityMediaOnly === true,
        idlePreparationSupported: typeof requestIdleCallback === "function"
      });
      if (!_0x43ca7e && _0x33c36f) {
        _rendererMediaRuntimePreparer.enqueue({
          nodeId: _0x4c0149,
          version: _0x36939f,
          variant: _0x481b69,
          isValid: () => _currentSnapshot?.nodes?.[_0x4c0149] === _0x36939f && !_componentMap.has(_0x4c0149),
          prepare: () => prepareRendererNodeRuntime({
            node: _0x36939f,
            selectedNodeSet: _0x50a941,
            selectedNodeRankMap: _0x4cda67,
            dragContext: _0x2856f9,
            dragTargets: _0x23418e,
            options: {
              ..._0x4a007e,
              prebuildOffscreen: true
            }
          }),
          dispose: disposePreparedRendererNodeRuntime
        });
        _0x43000d = true;
        if (_0x1a8b42) {
          _0x2706fa = true;
        }
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        if (_0x3c7c71) {
          _0xd4402b = true;
        }
        continue;
      }
      if (!_0x43ca7e && !_0x33c36f) {
        _rendererMediaRuntimePreparer.forget(_0x4c0149);
      }
      if (_0x68ffc4 && !_0x2b23ff && !_videoHydrationBackpressure.tryAcquire()) {
        _0x43000d = _0x2706fa = _0x484a7a = true;
        continue;
      }
      const _0x13982b = _0x4e788d ? _nowMs() : 0;
      const _0x57ce30 = _0x43ca7e ? _rendererMediaRuntimePreparer.take(_0x4c0149, _0x36939f, _0x481b69) : null;
      ({
        wrapperEl: _0x53bf03,
        instance: _0x4b5c6a
      } = _0x57ce30 ? _registerNodeRuntime(_0x57ce30) : _createNodeRuntime(_0x36939f, _0x50a941, _0x4cda67, _0x2856f9, _0x23418e, _0x4a007e));
      if (_0x4e788d) {
        recordRendererLifecycleDuration(_0x4e788d, "create", _0x36939f, _nowMs() - _0x13982b, _0x57ce30 ? "commit-prepared-runtime" : _0x57a39b ? "create-deferred-media" : "create");
      }
      if (!_0x39e7c9) {
        _0x39e7c9 = document.createDocumentFragment();
      }
      _mountNode(_0x4c0149, _0x39e7c9);
      _0x2af954 = true;
      _0x1c49b1.consume(_0x36939f);
      if (_0x2b23ff) {
        _videoHydrationBackpressure.markPriorityWork();
      }
      if (_0x1a8b42) {
        _0x476495 = true;
      }
      if (_0x21a550) {
        _0x115ca7.consume();
      }
    } else if (!_0x2e7fbb) {
      if (!_0x3c7c71 && _0x1c49b1.shouldDefer({
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0
      })) {
        _0x43000d = true;
        if (_0x1a8b42) {
          _0x2706fa = true;
        }
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        if (_0x3c7c71) {
          _0xd4402b = true;
        }
        continue;
      }
      if (_0x5a6002 && _0x1a8b42 && _0x476495 && !_0x2b23ff) {
        _0x43000d = true;
        _0x2706fa = true;
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        continue;
      }
      const _0x3cc66d = _0x115ca7.hasBudget();
      if (!_0x3cc66d && !_0x2b23ff) {
        _0x43000d = true;
        if (_0x1a8b42) {
          _0x2706fa = true;
        }
        if (_0x68ffc4) {
          _0x484a7a = true;
        }
        if (_0x3c7c71) {
          _0xd4402b = true;
        }
        continue;
      }
      if (_0x68ffc4 && !_0x2b23ff && !_videoHydrationBackpressure.tryAcquire()) {
        _0x43000d = _0x2706fa = _0x484a7a = true;
        continue;
      }
      if (!_0x39e7c9) {
        _0x39e7c9 = document.createDocumentFragment();
      }
      const _0x453d85 = _0x4e788d ? _nowMs() : 0;
      _mountNode(_0x4c0149, _0x39e7c9);
      if (_0x4e788d) {
        recordRendererLifecycleDuration(_0x4e788d, "remount", _0x36939f, _nowMs() - _0x453d85, "remount");
      }
      _0x2af954 = true;
      _0x1c49b1.consume(_0x36939f);
      if (_0x2b23ff) {
        _videoHydrationBackpressure.markPriorityWork();
      }
      if (_0x1a8b42) {
        _0x476495 = true;
      }
      if (_0x3cc66d) {
        _0x115ca7.consume();
      }
    } else if (_0x20ea94 && _0x53bf03?.dataset?.detailStage === "deferred") {
      _nodeDetailHydration.hydrateNodeDetails(_0x4c0149, _0x53bf03);
      _rendererDeferredMedia.hydrateNow(_0x4c0149);
    }
    const _0x285326 = shouldQueueNodeDetailHydration({
      wrapperEl: _0x53bf03,
      nodeId: _0x4c0149,
      isSelected: _0x41e43c,
      isSelectionRelated: _0x5eea09,
      dragTargets: _0x23418e,
      connOverlay: _0xcef5c7,
      pickMode: _0x5acec0,
      viewportBusyForPreview: _0x50a01b,
      mountCandidateCount: _0x8bc652.size,
      nodeCount: _0x4abcd4,
      options: _0x12d605
    });
    const _0x4abdc7 = _0x4abcd4 >= 120 && isNodeType(_0x36939f, ["ai-video", "ai-audio"]) && !_0x41e43c && !_0x5eea09 && !_0x23418e?.has?.(_0x4c0149) && _0xcef5c7?.srcId !== _0x4c0149 && _0xcef5c7?.hoverId !== _0x4c0149 && _0x5acec0?.sourceNodeId !== _0x4c0149 && _0x5acec0?.hoverNodeId !== _0x4c0149 && _0x36939f?.isVideosExpanded !== true && _0x36939f?.isImagesExpanded !== true;
    if (_0x2af954 || _0x53bf03?.dataset?.detailStage === "deferred") {
      _nodeDetailHydration.syncNodeDetailMountStage({
        wrapperEl: _0x53bf03,
        node: _0x36939f,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0,
        relatedNodeIds: _0x5cbac5,
        viewport: _0x4ea917,
        mountCandidateCount: _0x8bc652.size,
        nodeCount: _0x4abcd4,
        autoHydrate: !_0x4abdc7 && isNodeType(_0x36939f, ["source-video", "ai-video", "video", "source-audio", "ai-audio", "audio"]),
        deferHydrate: _0x285326,
        forceDeferActiveNodeDetails: shouldForceDeferActiveNodeDetails({
          nodeId: _0x4c0149,
          dragContext: _0x2856f9,
          dragTargets: _0x23418e
        }) || _0x12d605?.viewportPriorityMediaOnly === true && _0xdd14f0 && !_0x2b23ff || shouldForceDeferRelatedVideoDetails({
          node: _0x36939f,
          nodeId: _0x4c0149,
          isSelected: _0x41e43c,
          isSelectionRelated: _0x5eea09,
          dragTargets: _0x23418e,
          viewport: _0x4ea917,
          mountCandidateCount: _0x8bc652.size,
          nodeCount: _0x4abcd4,
          options: _0x12d605
        })
      });
      if (_0x2af954 && isNodeType(_0x36939f, ["source-video", "ai-video", "video", "source-audio", "ai-audio", "audio"]) && !_0x4abdc7 && shouldQueueNodeDetailHydration({
        wrapperEl: _0x53bf03,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0,
        viewportBusyForPreview: _0x50a01b,
        mountCandidateCount: _0x8bc652.size,
        nodeCount: _0x4abcd4,
        options: _0x12d605
      })) {
        _nodeDetailHydration.enqueueNodeDetailHydration(_0x4c0149);
      }
    }
    const _0x54d5fb = _pendingNodeDataMap.get(_0x4c0149);
    const _0x2a6811 = _0x54d5fb?.node || _0x36939f;
    const _0x5b116f = _getIncomingEdgeSignature(_0x4c0149, _0x5c1672, _0xfad56d);
    const _0x31fd7b = syncNodeMediaLodMode(_0x53bf03, _0x2a6811, _0x4ea917, {
      interactionBusy: _0x50a01b
    });
    const _0x8941d7 = buildRendererNodeSignature({
      node: _0x2a6811,
      inEdgeSig: _0x5b116f,
      pickMode: _0x5acec0,
      isSelected: _0x41e43c,
      isSelectionRelated: _0x5eea09,
      showVideoMeta: _0x49dade,
      viewport: _0x4ea917,
      mediaLodMode: _0x31fd7b
    });
    const _0x26c4e6 = shouldSkipInitialMediaNodeUpdate(_0x2a6811, _0x2af954);
    const _0x10e37a = _0x1a8b42 && _isNodeVisible(_0x2a6811, _0x4ea917, _0x262873, _0x3ab908) && (_0x278e92 || _0x2b23ff || resolveRendererLowZoomMountLimit({
      viewport: _0x4ea917,
      nodeCount: _0x4abcd4
    }) <= 0) && _0x4b5c6a?.prepareRendererVisibleVideoPreview?.() === true;
    const _0x3cbc10 = _syncMountedNodePresentation({
      wrapperEl: _0x53bf03,
      node: _0x2a6811,
      nodeId: _0x4c0149,
      selectedNodeSet: _0x50a941,
      selectedNodeRankMap: _0x4cda67,
      connOverlay: _0xcef5c7,
      pickMode: _0x5acec0,
      viewport: _0x4ea917,
      containerW: _0x262873,
      containerH: _0x3ab908,
      dragContext: _0x2856f9,
      dragTargets: _0x23418e,
      showVideoMeta: _0x49dade,
      relatedNodeIds: _0x5cbac5,
      relatedHighlightColor: _0x5b776e,
      inEdgeSig: _0x5b116f,
      signature: _0x8941d7,
      mediaLodMode: _0x31fd7b,
      skipInstanceUpdate: _0x26c4e6,
      deferInstanceUpdate: shouldDeferHeavyMediaUpdate({
        node: _0x2a6811,
        nodeId: _0x4c0149,
        viewportBusyForPreview: _0x50a01b,
        nodeCount: _0x4abcd4,
        skipInstanceUpdate: _0x26c4e6
      }) || !_0x2af954 && _0x1c49b1.shouldDefer({
        node: _0x2a6811,
        nodeId: _0x4c0149,
        isSelected: _0x41e43c,
        isSelectionRelated: _0x5eea09,
        dragTargets: _0x23418e,
        connOverlay: _0xcef5c7,
        pickMode: _0x5acec0
      }),
      mountedThisFrame: _0x2af954,
      lifecycleStats: _0x4e788d,
      allowActiveDetailHydration: !_0x285326 && !_0x4abdc7
    });
    if (_0x3cbc10?.deferredUpdate) {
      _0x43000d = true;
      if (_0x1a8b42) {
        _0x2706fa = true;
      }
      if (_0x68ffc4) {
        _0x484a7a = true;
      }
    }
    if (_0x3cbc10?.didUpdate) {
      _0x1c49b1.consume(_0x2a6811);
      if (_0x1a8b42) {
        _0x32ac8a = true;
      }
    }
    if (_0x375e18 || _0x10e37a) {
      _fastPreviewLayer.retainNode(_0x4c0149);
      if (_0x10e37a) {
        if (_visibleVideoSurface.hasPendingHandoff(_0x4c0149)) {
          _0x4c835c.add(_0x4c0149);
        } else if (_0x2af954) {
          _rendererDeferredMedia.hydrateNow(_0x4c0149);
        } else {
          _rendererDeferredMedia.enqueue(_0x4c0149, {
            urgent: true
          });
        }
      } else {
        _rendererDeferredMedia.enqueue(_0x4c0149);
      }
    }
    const _0x5e97ce = _isNodeVisible(_0x2a6811, _0x4ea917, _0x262873, _0x3ab908);
    _0x3f3d0d({
      node: _0x2a6811,
      nodeId: _0x4c0149,
      isVisible: _0x5e97ce,
      isSelected: _0x41e43c,
      component: _0x4b5c6a
    });
    if (_0x54d5fb) {
      _pendingNodeDataMap.delete(_0x4c0149);
    }
  }
  const _0x4a9f30 = _0x39e7c9?.childNodes?.length || 0;
  const _0x4ad2ee = _0x4e788d && _0x4a9f30 > 0 ? _nowMs() : 0;
  _flushMountBatch(_0xb9986c, _0x39e7c9);
  for (const _0x48951f of _0x4c835c) {
    _visibleVideoSurface.handoff(_0x48951f, _componentMap.get(_0x48951f));
    _rendererDeferredMedia.hydrateNow(_0x48951f);
  }
  if (_0x4e788d && _0x4a9f30 > 0) {
    const _0x1fd578 = _nowMs() - _0x4ad2ee;
    _0x4e788d.mountBatchCount += _0x4a9f30;
    _0x4e788d.mountBatchFlushMs += _0x1fd578;
    _0x4e788d.mountBatchFlushMaxMs = Math.max(_0x4e788d.mountBatchFlushMaxMs, _0x1fd578);
  }
  syncRendererFastPreviewAfterNodeRender({
    continuation: _fastPreviewContinuation,
    layer: _fastPreviewLayer,
    canvasEl: _0xb9986c,
    nodes: _0xfad56d,
    previewCandidateIds: _0x26888f,
    selectedNodeSet: _0x50a941,
    candidateSignature: _0x5900b9,
    hasPendingStructuralOps: _0x43000d,
    connOverlay: _0xcef5c7,
    pickConnectMode: _0x5acec0,
    nodeCount: _0x4abcd4,
    viewport: _0x4ea917,
    containerWidth: _0x262873,
    containerHeight: _0x3ab908,
    freezeRasterSurface: _0x3f9fc6.freezeActive === true,
    suppressNewMedia: _0x4ff830,
    mediaSourceOwnerIds: _0x3208b3,
    requiredImmediateMediaSourceOwnerIds: _0x327f48,
    viewportBusy: _0x50a01b,
    dragContext: _0x2856f9,
    dragTargets: _0x23418e,
    suspendNewMediaSrc: _0x5788e0,
    fullEligibleVisibleImageNodeIds: _0x200ec1,
    fullEligiblePreviewImageNodeIds: _0xea20bf,
    ..._fastPreviewLifecycle.getContinuationOptions(),
    mountedHeavyMediaThisFrame: _0x476495,
    updatedHeavyMediaThisFrame: _0x32ac8a,
    hasPendingStructuralVideoMounts: _0x2706fa
  });
  if (_0x4e788d) {
    recordRendererNodeLifecycleSample(_0x4e788d);
  }
  return {
    hasPendingStructuralOps: _0x43000d,
    deferredParkCount: _0x145bed,
    hasPendingVisibleVideoMounts: _0x484a7a,
    hasPendingFullEligibleVisibleImageMounts: _0xd4402b
  };
}
function _renderNodes(..._0x1ad186) {
  if (!_rendererRuntimeDiagnosticsEnabled) {
    return _renderNodesImpl(..._0x1ad186);
  }
  const _0x4abbfa = _nowMs();
  const _0x533716 = _0x1ad186[12] || {};
  const _0x1d73fc = _0x1ad186[1] || {};
  _rendererRuntimeDiagnosticRenderState = {
    previewOnly: _0x533716?.previewOnly === true,
    viewportBusy: _0x533716?.viewportBusy === true || _0x533716?.deferParking === true || _0x533716?.deferHeavyMediaMount === true || _rendererInteractionGrace.isBusy()
  };
  try {
    return _renderNodesImpl(..._0x1ad186);
  } finally {
    recordRendererRuntimeDiagnostic({
      kind: "render-nodes",
      mode: _0x533716?.mode || "steady",
      previewOnly: _0x533716?.previewOnly === true,
      nodeCount: Object.keys(_0x1d73fc).length,
      durationMs: _nowMs() - _0x4abbfa
    });
  }
}
function _cleanupNodes(_0x2c3b08, _0x13dcd9) {
  let _0x4e7f35 = false;
  const _0x3fe380 = new Set(Object.keys(_0x13dcd9 || {}));
  const _0x4f1842 = new Set([..._componentMap.keys(), ..._wrapperMap.keys(), ..._parkedWrapperMap.keys(), ..._mountedNodeIds, ..._parkedNodeIds]);
  for (const _0x4b5a7b of _0x4f1842) {
    if (!_0x3fe380.has(_0x4b5a7b)) {
      _destroyNode(_0x4b5a7b);
      _0x4e7f35 = true;
    }
  }
  _0x2c3b08.querySelectorAll(".v2-node").forEach(_0x20b128 => {
    const _0x524e83 = _0x20b128.id || _0x20b128.dataset.nodeId;
    if (_0x524e83 && !_0x3fe380.has(_0x524e83)) {
      _0x20b128.remove();
      _0x4e7f35 = true;
    }
  });
  if (_0x4e7f35) {
    const _0x5d0536 = document.getElementById("v2-side-plus-holder");
    if (_0x5d0536 && _0x5d0536.children.length > 0) {
      _0x5d0536.replaceChildren();
    }
  }
}
function _createSvgLayer() {
  const _0x148116 = document.createElement("div");
  _0x148116.id = "v2-edges-wrapper";
  _0x148116.style.position = "absolute";
  _0x148116.style.top = "0";
  _0x148116.style.left = "0";
  _0x148116.style.width = "100%";
  _0x148116.style.height = "100%";
  _0x148116.style.pointerEvents = "none";
  _0x148116.style.zIndex = "5";
  const _0x4f5b6f = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  _0x4f5b6f.id = "v2-edges";
  _0x4f5b6f.style.overflow = "visible";
  _0x4f5b6f.style.pointerEvents = "none";
  _0x148116.appendChild(_0x4f5b6f);
  return _0x148116;
}
function _renderEdgesByIds(_0x1c0b13, _0x802728, _0x360a2e, _0x32aaec, _0x3a7c1a, _0xd13710, _0x52ceff = null, _0x32b809 = null, _0xba0245 = {}) {
  const _0x63489f = _edgeLayer.renderPartial({
    svgEl: _0x1c0b13,
    edgeIds: _0x802728,
    edges: _0x360a2e,
    nodes: _0x32aaec,
    viewport: _0x3a7c1a,
    containerEl: _0xd13710,
    dragOffsetCtx: _0x52ceff,
    relatedEdgeIds: _0x32b809,
    options: _0xba0245
  });
  if (_0x63489f.mutated) {
    _invalidateFullEdgeRenderSignature();
  }
}
function _renderEdges(_0x491b92, _0x11c128, _0x47de67, _0x498cb7, _0x386180, _0x2163e8 = null, _0x268b9d = null, _0x2b84a0 = null, _0x16e5d7 = "steady", _0x127446 = {}) {
  _edgeLayer.renderFull({
    svgEl: _0x491b92,
    edges: _0x11c128,
    nodes: _0x47de67,
    viewport: _0x498cb7,
    containerEl: _0x386180,
    dragOffsetCtx: _0x2163e8,
    relatedEdgeIds: _0x268b9d,
    edgeEntries: _0x2b84a0,
    reason: _0x16e5d7,
    options: {
      ..._0x127446,
      clearedDom: _edgeDomClearedSinceLastFull === true
    }
  });
  if (_0x127446?.renderSignature) {
    _lastFullEdgeRenderSignature = _0x127446.renderSignature;
  }
  _edgeDomClearedSinceLastFull = false;
}
function _clearRenderedEdges(_0x50a1c0) {
  const _0x50b2c3 = _edgeLayer.clearRenderedEdges(_0x50a1c0);
  if (_0x50b2c3 > 0) {
    _invalidateFullEdgeRenderSignature({
      clearedDom: true
    });
  }
}
function _clearRenderedEdgesFromDocument() {
  if (typeof document === "undefined") {
    _edgeLayer.reset();
    return;
  }
  const _0x1fcb2f = document.getElementById?.("v2-edges");
  _clearRenderedEdges(_0x1fcb2f);
  document.getElementById?.("v2-draft-edge")?.remove?.();
  document.querySelectorAll?.(".v2-edge-thumbnail").forEach(_0x52fd9c => _0x52fd9c.remove());
  document.querySelectorAll?.("[id^=\"v2-thumb-\"]").forEach(_0x2c7fbc => _0x2c7fbc.remove());
}
function _cleanupEdges(_0x166f68, _0x174ec9) {
  const _0x91d791 = _edgeLayer.cleanupEdges(_0x166f68, _0x174ec9);
  document.querySelectorAll(".v2-edge-thumbnail").forEach(_0x4a2468 => _0x4a2468.remove());
  document.querySelectorAll("[id^=\"v2-thumb-\"]").forEach(_0x4ddb50 => _0x4ddb50.remove());
  if (_0x91d791 > 0) {
    _invalidateFullEdgeRenderSignature({
      clearedDom: true
    });
  }
}
function _createPickerEl() {
  const _0x54a7f1 = document.createElement("div");
  _0x54a7f1.id = "v2-picker";
  _0x54a7f1.dataset.uiStop = "1";
  Object.assign(_0x54a7f1.style, {
    position: "fixed",
    display: "none",
    flexDirection: "column",
    gap: "4px",
    background: "var(--preset-menu-bg)",
    border: "1px solid var(--preset-menu-border)",
    borderRadius: "var(--radius-18)",
    padding: "8px",
    minWidth: "160px",
    boxShadow: "var(--preset-menu-shadow)",
    backdropFilter: "blur(var(--preset-menu-blur))",
    zIndex: "1000",
    fontFamily: "inherit"
  });
  return _0x54a7f1;
}
function _renderPicker(_0x5430b4, _0x173960, _0x527278) {
  if (!_0x173960.visible) {
    _0x5430b4.style.display = "none";
    _0x5430b4.replaceChildren();
    return;
  }
  _0x5430b4.style.display = "flex";
  _0x5430b4.style.left = _0x173960.screenX + "px";
  _0x5430b4.style.top = _0x173960.screenY + "px";
  if (_0x5430b4.children.length > 0) {
    return;
  }
  const _0x1741b6 = document.createElement("div");
  _0x1741b6.textContent = t("coreUi.renderer.picker.addNode");
  Object.assign(_0x1741b6.style, {
    fontSize: "11px",
    color: "var(--text-muted)",
    padding: "2px 4px 6px",
    borderBottom: "1px solid var(--white-08)",
    marginBottom: "4px",
    userSelect: "none"
  });
  _0x5430b4.appendChild(_0x1741b6);
  const _0x5331bc = getRendererPickerNodeTypes();
  for (const {
    type: _0x46d23f,
    label: _0x286fb6,
    defaultLabel: _0x4cb3d5,
    width: _0x131123,
    height: _0x5ac474
  } of _0x5331bc) {
    const _0x329f52 = document.createElement("button");
    _0x329f52.textContent = _0x286fb6;
    _0x329f52.dataset.nodeType = _0x46d23f;
    _0x329f52.dataset.defaultLabel = _0x4cb3d5;
    _0x329f52.dataset.width = String(_0x131123);
    _0x329f52.dataset.height = String(_0x5ac474);
    Object.assign(_0x329f52.style, {
      background: "var(--blue-10)",
      border: "1px solid var(--blue-25)",
      borderRadius: "6px",
      color: "var(--blue)",
      fontSize: "13px",
      padding: "7px 12px",
      cursor: "pointer",
      textAlign: "left",
      transition: "background 0.15s"
    });
    _0x5430b4.appendChild(_0x329f52);
  }
}
function _createSelectionRectEl() {
  const _0x59abb7 = document.createElement("div");
  _0x59abb7.id = "v2-selection-rect";
  Object.assign(_0x59abb7.style, {
    position: "absolute",
    border: "1px dashed var(--white-50)",
    backgroundColor: "var(--white-02)",
    pointerEvents: "none",
    display: "none",
    zIndex: "1000"
  });
  return _0x59abb7;
}
function _renderSelectionRect(_0x3f5bbe, _0x3f4761) {
  if (!_0x3f4761 || !_0x3f4761.active) {
    _0x3f5bbe.style.display = "none";
    return;
  }
  _0x3f5bbe.style.display = "block";
  const _0xe9649e = Math.min(_0x3f4761.x1, _0x3f4761.x2);
  const _0xf537db = Math.min(_0x3f4761.y1, _0x3f4761.y2);
  const _0x4688b1 = Math.abs(_0x3f4761.x2 - _0x3f4761.x1);
  const _0x5b77a6 = Math.abs(_0x3f4761.y2 - _0x3f4761.y1);
  _0x3f5bbe.style.left = _0xe9649e + "px";
  _0x3f5bbe.style.top = _0xf537db + "px";
  _0x3f5bbe.style.width = _0x4688b1 + "px";
  _0x3f5bbe.style.height = _0x5b77a6 + "px";
}