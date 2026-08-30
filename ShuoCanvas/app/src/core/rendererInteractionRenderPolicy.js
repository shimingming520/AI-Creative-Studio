import { RENDERER_VIRTUALIZATION_CONFIG, resolveRendererLowZoomMountLimit } from "./rendererVirtualization.js";
import { NODE_DETAIL_DEFERRED_CLASS } from "./rendererNodeDetailHydration.js";
import { shouldShowGenerationBusyUi } from "./generationTaskUiState.js";
import { isNodeType } from "../modules/registry.js";
const DENSE_INTERACTION_STRUCTURAL_BATCH_SIZE = 1;
const DENSE_INTERACTION_STRUCTURAL_FRAME_BUDGET_MS = 2;
const DENSE_SETTLED_STRUCTURAL_BATCH_SIZE = 2;
const DENSE_SETTLED_STRUCTURAL_FRAME_BUDGET_MS = 6;
const DENSE_SETTLED_FULL_IMAGE_STRUCTURAL_BATCH_SIZE = 1;
const DENSE_SETTLED_FULL_IMAGE_STRUCTURAL_FRAME_BUDGET_MS = 4;
const DENSE_SETTLED_FULL_IMAGE_TAIL_BATCH_SIZE = 1;
const DENSE_SETTLED_FULL_IMAGE_TAIL_FRAME_BUDGET_MS = 4;
const DENSE_SETTLED_FULL_IMAGE_TAIL_PENDING_COUNT = 4;
const HEAVY_MEDIA_MOUNT_TYPES = new Set(["source-image", "ai-image", "source-video", "ai-video", "video"]);
const DENSE_MEDIA_VIEWPORT_COMMIT_DEFER_MAX_ZOOM = 0.95;
const DENSE_MEDIA_VIEWPORT_COMMIT_RECONCILE_DELAY_MS = 480;
const VIDEO_MEDIA_MOUNT_TYPES = new Set(["source-video", "ai-video", "video"]);
const DENSE_SETTLED_HEAVY_UPDATE_BATCH_SIZE = 1;
const DENSE_SETTLED_HEAVY_UPDATE_FRAME_BUDGET_MS = 6;
const PRIORITY_MEDIA_INTERACTION_RECONCILE_DELAY_MS = 32;
export function createHeavyMediaUpdateFrameBudget({
  nodeCount = 0,
  batchSize = DENSE_SETTLED_HEAVY_UPDATE_BATCH_SIZE,
  frameBudgetMs = DENSE_SETTLED_HEAVY_UPDATE_FRAME_BUDGET_MS,
  now = () => typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : 0
} = {}) {
  const _0x1fd34f = Number(nodeCount || 0) >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount;
  const _0x4cd292 = Number(now()) || 0;
  let _0x56cd39 = 0;
  return {
    shouldDefer(_0x46f448 = {}) {
      if (!_0x1fd34f || !HEAVY_MEDIA_MOUNT_TYPES.has(_0x46f448?.node?.type)) {
        return false;
      }
      const _0xaee109 = Math.max(0, (Number(now()) || 0) - _0x4cd292);
      const _0x53d1b2 = _0x56cd39 >= batchSize || _0xaee109 >= frameBudgetMs;
      if (!_0x53d1b2) {
        return false;
      }
      if (_0x56cd39 === 0 && (shouldShowGenerationBusyUi(_0x46f448.node) || isRendererInteractionPriorityNode(_0x46f448))) {
        return false;
      }
      return true;
    },
    consume(_0x980876 = null) {
      if (_0x980876 && !HEAVY_MEDIA_MOUNT_TYPES.has(_0x980876?.type)) {
        return;
      }
      _0x56cd39 += 1;
    }
  };
}
export function shouldForceDeferActiveNodeDetails({
  nodeId: _0x4b6784,
  dragContext: _0x2e6045,
  dragTargets: _0x40503a
} = {}) {
  return !!_0x4b6784 && !!_0x2e6045?.isDragging && _0x2e6045.isCommittingDrag !== true && !!_0x40503a?.has?.(_0x4b6784);
}
export function shouldDeferHeavyMediaForInteractionGrace({
  remainingMs = 0,
  viewport: _0x33d562,
  nodeCount = 0,
  hasPriorityMediaWork = false
} = {}) {
  if (hasPriorityMediaWork) {
    return false;
  }
  if (!(Number(remainingMs) > 0)) {
    return false;
  }
  return resolveRendererLowZoomMountLimit({
    viewport: _0x33d562,
    nodeCount: nodeCount
  }) > 0;
}
export function shouldPauseViewportMediaForInteractionGrace({
  remainingMs = 0,
  viewport: _0x40edf3,
  nodeCount = 0,
  hasPriorityMediaWork = false
} = {}) {
  return shouldDeferHeavyMediaForInteractionGrace({
    remainingMs: remainingMs,
    viewport: _0x40edf3,
    nodeCount: nodeCount,
    hasPriorityMediaWork: hasPriorityMediaWork
  });
}
export function resolveViewportCommitReconcileDelay({
  viewport: _0x19be3a,
  nodeCount = 0,
  hasPriorityMediaWork = false
} = {}) {
  if (hasPriorityMediaWork) {
    return 0;
  }
  if (resolveRendererLowZoomMountLimit({
    viewport: _0x19be3a,
    nodeCount: nodeCount
  }) > 0) {
    return RENDERER_VIRTUALIZATION_CONFIG.lowZoomViewportCommitReconcileDelayMs;
  }
  const _0x7344df = Number.isFinite(_0x19be3a?.zoom) ? _0x19be3a.zoom : 1;
  if (Number(nodeCount || 0) >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount && _0x7344df <= DENSE_MEDIA_VIEWPORT_COMMIT_DEFER_MAX_ZOOM) {
    return DENSE_MEDIA_VIEWPORT_COMMIT_RECONCILE_DELAY_MS;
  }
  return 0;
}
export function resolveViewportInteractionReconcileDelay({
  hasPriorityMediaWork = false,
  fallbackDelayMs = RENDERER_VIRTUALIZATION_CONFIG.settleDelayMs
} = {}) {
  const _0x4e0a45 = Number(fallbackDelayMs);
  const _0x44eea6 = Number.isFinite(_0x4e0a45) ? Math.max(0, _0x4e0a45) : RENDERER_VIRTUALIZATION_CONFIG.settleDelayMs;
  if (!hasPriorityMediaWork) {
    return _0x44eea6;
  }
  return Math.min(_0x44eea6, PRIORITY_MEDIA_INTERACTION_RECONCILE_DELAY_MS);
}
export function shouldHydratePriorityMediaDuringViewportInteraction({
  interactionActive = false,
  hasPriorityMediaWork = false
} = {}) {
  return hasPriorityMediaWork === true && interactionActive !== true;
}
export function shouldDeferHeavyMediaMount({
  node: _0x5ddb5d,
  nodeId: _0xba9928,
  isSelected: _0x41d575,
  isSelectionRelated: _0x3db0d2,
  dragTargets: _0x704c8,
  connOverlay: _0x8bb92,
  pickMode: _0xadb2b,
  options: _0x1a0566
} = {}) {
  if (_0x1a0566?.deferHeavyMediaMount !== true) {
    return false;
  }
  if (!_0xba9928 || !HEAVY_MEDIA_MOUNT_TYPES.has(_0x5ddb5d?.type)) {
    return false;
  }
  return !isRendererInteractionPriorityNode({
    nodeId: _0xba9928,
    isSelected: _0x41d575,
    isSelectionRelated: _0x3db0d2,
    dragTargets: _0x704c8,
    connOverlay: _0x8bb92,
    pickMode: _0xadb2b
  });
}
export function shouldDeferHeavyMediaUpdate({
  node: _0x56d5b7,
  nodeId: _0x1e1a0b,
  viewportBusyForPreview: _0x1b092f,
  nodeCount: _0x357f3d,
  skipInstanceUpdate: _0x26fe34
} = {}) {
  if (_0x26fe34 === true) {
    return false;
  }
  if (_0x1b092f !== true) {
    return false;
  }
  if (Number(_0x357f3d || 0) < RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return false;
  }
  if (!_0x1e1a0b || !isVideoHeavyMediaNode(_0x56d5b7)) {
    return false;
  }
  return !shouldShowGenerationBusyUi(_0x56d5b7);
}
export function shouldKeepHiddenHeavyMediaUpdatePending({
  node: _0x4518b2,
  nodeId: _0x9d457f,
  isSelected: _0x3155e4,
  dragTargets: _0x2ca6e4
} = {}) {
  if (!_0x9d457f || !HEAVY_MEDIA_MOUNT_TYPES.has(_0x4518b2?.type)) {
    return false;
  }
  if (_0x3155e4 || _0x2ca6e4?.has?.(_0x9d457f)) {
    return false;
  }
  return !shouldShowGenerationBusyUi(_0x4518b2);
}
export function shouldKeepHeavyMediaPreviewOnly({
  node: _0xfaa074,
  nodeId: _0x438cfb,
  isSelected: _0x25ecaa,
  isSelectionRelated: _0x5cfb37,
  dragTargets: _0x53494e,
  connOverlay: _0x2ad7eb,
  pickMode: _0x55c379,
  viewport: _0x3aeca2,
  nodeCount: _0x59c0df
} = {}) {
  if (!_0x438cfb || !HEAVY_MEDIA_MOUNT_TYPES.has(_0xfaa074?.type)) {
    return false;
  }
  if (isRendererInteractionPriorityNode({
    nodeId: _0x438cfb,
    isSelected: _0x25ecaa,
    isSelectionRelated: _0x5cfb37,
    dragTargets: _0x53494e,
    connOverlay: _0x2ad7eb,
    pickMode: _0x55c379
  })) {
    return false;
  }
  return resolveRendererLowZoomMountLimit({
    viewport: _0x3aeca2,
    nodeCount: _0x59c0df
  }) > 0;
}
function isInactiveHeavyMediaNode({
  node: _0x559b1a,
  nodeId: _0x4273ff,
  isSelected: _0x43d7aa,
  isSelectionRelated: _0x4d01a1,
  dragTargets: _0x51c86b,
  connOverlay: _0xa0f867,
  pickMode: _0x116e7a
} = {}) {
  if (!_0x4273ff || !HEAVY_MEDIA_MOUNT_TYPES.has(_0x559b1a?.type)) {
    return false;
  }
  if (isRendererInteractionPriorityNode({
    nodeId: _0x4273ff,
    isSelected: _0x43d7aa,
    isSelectionRelated: _0x4d01a1,
    dragTargets: _0x51c86b,
    connOverlay: _0xa0f867,
    pickMode: _0x116e7a
  })) {
    return false;
  }
  return true;
}
function isVideoHeavyMediaNode(_0x279f04 = {}) {
  return VIDEO_MEDIA_MOUNT_TYPES.has(_0x279f04?.type);
}
function isRendererInteractionPriorityNode({
  nodeId: _0x30eb98,
  isSelected: _0x3899ba,
  isSelectionRelated: _0x324704,
  dragTargets: _0x2526c2,
  connOverlay: _0x15e8c3,
  pickMode: _0x29a0f9
} = {}) {
  if (!_0x30eb98) {
    return false;
  }
  return !!_0x3899ba || !!_0x324704 || !!_0x2526c2?.has?.(_0x30eb98) || _0x15e8c3?.srcId === _0x30eb98 || _0x15e8c3?.hoverId === _0x30eb98 || _0x29a0f9?.sourceNodeId === _0x30eb98 || _0x29a0f9?.hoverNodeId === _0x30eb98;
}
export function shouldHydrateVideoMediaImmediately(_0x414098 = {}) {
  return !!isVideoHeavyMediaNode(_0x414098?.node) && !!isRendererInteractionPriorityNode(_0x414098);
}
export function createHeavyMediaPreviewOnlyDecider({
  viewport: _0x4590d3,
  nodeCount: _0x2dbd04,
  lowZoomRealVideoNodeIds: _0x5f19c9,
  fullEligibleVisibleImageNodeIds: _0x3541b7
} = {}) {
  const _0x168250 = resolveRendererLowZoomMountLimit({
    viewport: _0x4590d3,
    nodeCount: _0x2dbd04
  });
  if (_0x168250 > 0) {
    return (_0x324a57 = {}) => {
      if (isNodeType(_0x324a57?.node, ["source-image", "ai-image"]) && _0x3541b7?.has?.(_0x324a57?.nodeId)) {
        return false;
      }
      if (isVideoHeavyMediaNode(_0x324a57?.node) && _0x5f19c9?.has?.(_0x324a57?.nodeId)) {
        return false;
      }
      return isInactiveHeavyMediaNode(_0x324a57);
    };
  }
  return () => false;
}
export function shouldForceDeferRelatedVideoDetails({
  node: _0x5b5dc8,
  nodeId: _0x48a5f4,
  isSelected: _0x47abd2,
  isSelectionRelated: _0x155a87,
  dragTargets: _0x358e87,
  viewport: _0x1a3ac0,
  nodeCount: _0x5ac93d,
  mountCandidateCount: _0x152525,
  options: _0x55ec9d
} = {}) {
  if (!_0x48a5f4 || !isVideoHeavyMediaNode(_0x5b5dc8)) {
    return false;
  }
  _0x47abd2;
  _0x155a87;
  _0x358e87;
  _0x1a3ac0;
  _0x5ac93d;
  _0x152525;
  _0x55ec9d;
  return false;
}
export function shouldQueueNodeDetailHydration({
  wrapperEl: _0x502c1f,
  nodeId: _0x2af389,
  isSelected: _0xebcb7a,
  isSelectionRelated: _0x2ad84c,
  dragTargets: _0x36b5e6,
  connOverlay: _0x5e9603,
  pickMode: _0x20c1a3,
  viewportBusyForPreview: _0x2138e1,
  mountCandidateCount: _0x2ea656,
  nodeCount: _0x16f7a1,
  options: _0x483a26
} = {}) {
  const _0x4da07b = _0x502c1f?.classList?.contains?.(NODE_DETAIL_DEFERRED_CLASS) || _0x502c1f?.dataset?.detailStage === "deferred";
  if (!_0x4da07b) {
    return false;
  }
  if (isRendererInteractionPriorityNode({
    nodeId: _0x2af389,
    isSelected: _0xebcb7a,
    isSelectionRelated: _0x2ad84c,
    dragTargets: _0x36b5e6,
    connOverlay: _0x5e9603,
    pickMode: _0x20c1a3
  })) {
    return false;
  }
  const _0x558972 = _0x2138e1 || _0x483a26?.deferParking === true || _0x483a26?.deferHeavyMediaMount === true;
  if (_0x558972) {
    return true;
  }
  if (_0x2ad84c) {
    return false;
  }
  const _0x3e5fe4 = Number(_0x2ea656 || 0);
  const _0x3463cc = Number(_0x16f7a1 || 0);
  return _0x3e5fe4 >= 24 || _0x3463cc >= 120;
}
export function getRendererStructuralBudgetOptions({
  dragContext: _0x390d7a,
  fullEligibleVisibleImageCount = 0,
  fullImageSettleReady = false,
  nodeCount: _0x49ce80,
  pendingFullEligibleVisibleImageCount = 0,
  renderMode = "steady",
  viewport: _0x9cbb7e
} = {}) {
  const _0x6cbc15 = Number(_0x49ce80) || 0;
  if (_0x6cbc15 < RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return {};
  }
  const _0x2950aa = resolveRendererLowZoomMountLimit({
    viewport: _0x9cbb7e,
    nodeCount: _0x6cbc15
  }) > 0;
  const _0x5968c9 = _0x2950aa || _0x390d7a?.isDragging || _0x390d7a?.isDraggingCell;
  if (_0x5968c9) {
    return {
      batchSize: DENSE_INTERACTION_STRUCTURAL_BATCH_SIZE,
      frameBudgetMs: DENSE_INTERACTION_STRUCTURAL_FRAME_BUDGET_MS
    };
  }
  if (_0x6cbc15 >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    const _0x295630 = renderMode === "steady" && fullImageSettleReady === true && Number(fullEligibleVisibleImageCount) > 0;
    const _0x11c257 = _0x295630 && Number(pendingFullEligibleVisibleImageCount) > 0 && Number(pendingFullEligibleVisibleImageCount) <= DENSE_SETTLED_FULL_IMAGE_TAIL_PENDING_COUNT;
    return {
      batchSize: _0x11c257 ? DENSE_SETTLED_FULL_IMAGE_TAIL_BATCH_SIZE : _0x295630 ? DENSE_SETTLED_FULL_IMAGE_STRUCTURAL_BATCH_SIZE : DENSE_SETTLED_STRUCTURAL_BATCH_SIZE,
      frameBudgetMs: _0x11c257 ? DENSE_SETTLED_FULL_IMAGE_TAIL_FRAME_BUDGET_MS : _0x295630 ? DENSE_SETTLED_FULL_IMAGE_STRUCTURAL_FRAME_BUDGET_MS : DENSE_SETTLED_STRUCTURAL_FRAME_BUDGET_MS
    };
  }
  if (!_0x5968c9 && _0x6cbc15 < RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    return {};
  }
  return {};
}