import a634_0xf65f46, { graphStore as a634_0x31c48d, uiStore as a634_0x223362, workspaceStore as a634_0x2181c9 } from "./stores/appStore.js";
import { isNodeType } from "../modules/registry.js";
import { getShortcuts } from "../modules/shortcuts.js";
import { screenToWorld, isPointInRect, isRectIntersect, checkLineIntersection, checkBBoxIntersection, hitTestNode, findAvailablePosition, generateId, getViewportScreenCenter, getViewportScreenBounds } from "./math.js";
import { commit } from "../modules/history.js";
import { setClipboard, getClipboard, getClipboardGraph } from "../modules/clipboard.js";
import { captureEditableSelection, getEditableTextTarget, isEditableTextTargetInGroupedNode, showTextInputContextMenu, TEXT_CONTEXT_MENU_TARGET_SELECTOR } from "../modules/textInputContextMenu.js";
import { rafSampleLatest } from "../utils/dom.js";
import { createDragController } from "../modules/interaction/DragController.js";
import { createEdgeCuttingController } from "../modules/interaction/edgeCuttingController.js";
import { beginDragFpsSession, beginPanFpsSession, endDragFpsSession, endPanFpsSession, recordCanvasPanSample } from "../modules/perf/perfProbe.js";
import { createEdgeController, initConnectionHandles as a634_0x5934a4, initPickConnect as a634_0x3cea00, isValidConnection as a634_0x5a1d37, addEdgeWithPolicies, setDragContextGetter } from "../modules/interaction/EdgeController.js";
import { createSelectionController } from "../modules/interaction/SelectionController.js";
import { createZoomController } from "../modules/interaction/ZoomController.js";
import { createWheelPanController } from "../modules/interaction/WheelPanController.js";
import { resolveAutoPanVelocity } from "../modules/interaction/viewportAutoPan.js";
import { createViewportPreviewCoordinator } from "../modules/interaction/viewportPreviewCoordinator.js";
import { createInteractionCommandAdapter } from "../modules/interaction/interactionCommandAdapter.js";
import { createCanvasContextMenuController } from "../modules/interaction/canvasContextMenuController.js";
import { removeContextMenus } from "../modules/interaction/contextMenuPresenter.js";
import { NODE_CREATION_UPLOAD_ITEM, PICKER_NODE_CREATION_SECTION_IDS, getNodeCreationMenuSections } from "../modules/nodeCreationMenuCatalog.js";
import { createNodeCreationMenuIcon } from "../modules/nodeCreationMenuIcons.js";
import { beginViewportPanPreview, cancelViewportPanPreview, flushViewportPanPreview, getViewportPanPreview, isViewportPanPreviewActive, updateViewportPanPreview } from "./viewportPanPreview.js";
import { syncRendererViewportMediaPreloadPause } from "./rendererViewportMediaPreloadPause.js";
import { PANORAMA_SCENE_DEFAULT_SIZE } from "../modules/panoramaSceneNode/sceneNode.js";
import { STORYBOARD_SCRIPT_DEFAULT_SIZE } from "./storyboardScriptFactory.js";
import { getAIGenerationDefaultSizeByType, getAIGenerationNodeSize, getNodeDefaultSize, handleFileDrop } from "../services/fileService.js";
import { buildAppCanvasNodeData } from "../modules/app/canvasNodeDataFactory.js";
import { openAppCanvasFilePicker } from "../modules/app/appCanvasDropImport.js";
import { t } from "../i18n/index.js";
const graphStore = a634_0xf65f46?.graphStore || a634_0x31c48d || a634_0xf65f46;
const uiStore = a634_0xf65f46?.uiStore || a634_0x223362 || a634_0xf65f46;
const workspaceStore = a634_0xf65f46?.workspaceStore || a634_0x2181c9 || a634_0xf65f46;
const interactionCommandAdapter = createInteractionCommandAdapter({
  store: a634_0xf65f46,
  graphStore: graphStore,
  uiStore: uiStore,
  commit: commit,
  buildNodeData: buildAppCanvasNodeData,
  getNodeDefaultSize: getNodeDefaultSize,
  getAIGenerationDefaultSizeByType: getAIGenerationDefaultSizeByType,
  getAIGenerationNodeSize: getAIGenerationNodeSize,
  connectNodes: addEdgeWithPolicies,
  clipboard: {
    getClipboard: getClipboard,
    getClipboardGraph: getClipboardGraph,
    setClipboard: setClipboard
  },
  focusNodes: _0x1739f5 => window.v2FocusOnNodes?.(_0x1739f5),
  translate: t,
  showToast: (..._0x4f06db) => window.showToast?.(..._0x4f06db),
  scheduleFrame: _0x23b01f => requestAnimationFrame(_0x23b01f),
  windowObject: typeof window !== "undefined" ? window : null
});
const canvasContextMenuController = createCanvasContextMenuController({
  store: a634_0xf65f46,
  graphStore: graphStore,
  commandAdapter: interactionCommandAdapter,
  getShortcuts: getShortcuts,
  onUploadFile: ({
    screenX: _0x174464,
    screenY: _0x143f07
  }) => {
    openCanvasUploadAt(_0x174464, _0x143f07);
  },
  windowObject: typeof window !== "undefined" ? window : null,
  documentObject: typeof document !== "undefined" ? document : null
});
const EDGE_INTERACTION_LITE_CLASS = "is-edge-interaction-lite";
const EDGE_INTERACTION_LITE_MIN_ZOOM = 0.24;
const EDGE_INTERACTION_LITE_MAX_ZOOM = 0.48;
const EDGE_INTERACTION_LITE_MIN_EDGES = 3;
const PAN_ACTIVATION_DISTANCE_PX = 3;
function isDevModeOn() {
  return window.DEV_MODE === true || document.body?.classList?.contains("dev-mode");
}
function openCanvasUploadAt(_0x3b2878, _0x4a1dc6) {
  return openAppCanvasFilePicker({
    documentObject: document,
    projectId: window.currentProjectId || "default_v2_project",
    handleFileDrop: handleFileDrop,
    commit: commit,
    clientX: _0x3b2878,
    clientY: _0x4a1dc6,
    onUnsupported: () => {
      window.showToast?.(t("canvasInteraction.toasts.unsupportedUpload"), "warning");
    },
    onError: _0x1caa85 => {
      console.error("[Canvas] resource import failed:", _0x1caa85);
      window.showToast?.(t("previewUpload.uploadFailed"), "warning");
    }
  });
}
function _shouldUseEdgeInteractionLite(_0x348fb4) {
  const _0x1058a3 = Number(_0x348fb4?.viewport?.zoom) || 1;
  const _0x262cb8 = Object.keys(_0x348fb4?.edges || {}).length;
  const _0x5486dd = typeof window !== "undefined" ? window._edgeDomCache : null;
  return _0x1058a3 >= EDGE_INTERACTION_LITE_MIN_ZOOM && _0x1058a3 <= EDGE_INTERACTION_LITE_MAX_ZOOM && _0x262cb8 >= EDGE_INTERACTION_LITE_MIN_EDGES && _0x5486dd && _0x5486dd.size > 0;
}
function _setEdgeInteractionLite(_0x27fa1d) {
  if (typeof document === "undefined" || !document?.body?.classList) {
    return;
  }
  document.body.classList.toggle(EDGE_INTERACTION_LITE_CLASS, !!_0x27fa1d);
}
function getStateRaw() {
  return {
    ...graphStore.getStateRaw(),
    ...uiStore.getStateRaw(),
    ...workspaceStore.getStateRaw()
  };
}
function getState() {
  return {
    ...graphStore.getState(),
    ...uiStore.getState(),
    ...workspaceStore.getState()
  };
}
function nowMs() {
  if (typeof performance !== "undefined" && performance && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function getMountedNodeCountForPerf() {
  const _0x2f503a = typeof window !== "undefined" && typeof window.v2Renderer?.getMountedNodeCount === "function" ? window.v2Renderer.getMountedNodeCount() : 0;
  if (Number.isFinite(_0x2f503a)) {
    return _0x2f503a;
  } else {
    return 0;
  }
}
function markViewportInteractionBusyForRenderer() {
  try {
    window.v2Renderer?.markViewportInteractionBusy?.();
  } catch {}
}
function releaseViewportInteractionBusyForRenderer() {
  try {
    window.v2Renderer?.releaseViewportInteractionBusy?.();
  } catch {}
}
const VIEWPORT_MEDIA_PRELOAD_HOLD_MS = 900;
const VIEWPORT_MEDIA_PRELOAD_RESUME_AFTER_PAN_MS = 220;
let viewportMediaPreloadPauseHeld = false;
function holdViewportMediaPreloadsForPan() {
  viewportMediaPreloadPauseHeld = true;
  syncRendererViewportMediaPreloadPause(true, {
    autoResumeMs: VIEWPORT_MEDIA_PRELOAD_HOLD_MS
  });
}
function releaseViewportMediaPreloadsAfterPan() {
  if (!viewportMediaPreloadPauseHeld) {
    return;
  }
  viewportMediaPreloadPauseHeld = false;
  syncRendererViewportMediaPreloadPause(true, {
    autoResumeMs: VIEWPORT_MEDIA_PRELOAD_RESUME_AFTER_PAN_MS
  });
}
const edgeCuttingController = createEdgeCuttingController({
  graphStore: graphStore,
  getStateRaw: getStateRaw,
  commit: commit,
  checkBBoxIntersection: checkBBoxIntersection,
  checkLineIntersection: checkLineIntersection,
  getCutEdgeKeys: () => getShortcuts?.()?.["cut-edge"]?.keys
});
edgeCuttingController.install(typeof window !== "undefined" ? window : null);
function _createIdleDragContext() {
  return {
    isDragging: false,
    targetNodeId: null,
    lastWorldX: 0,
    lastWorldY: 0,
    pendingDx: 0,
    pendingDy: 0,
    hasMoved: false,
    wasSelectedOnDown: false,
    dragSource: null,
    titleDragPendingSelectNodeId: null,
    titleDragActivated: false,
    titleDragStartScreenX: 0,
    titleDragStartScreenY: 0,
    isPanning: false,
    panActivated: false,
    panStartX: 0,
    panStartY: 0,
    panStartViewportX: 0,
    panStartViewportY: 0,
    panStartZoom: 1,
    panStartPerf: 0,
    panMoveCount: 0,
    panMinimapPreviewCount: 0,
    assistPanActive: false,
    assistPanViewport: null,
    isConnecting: false,
    connectSourceId: null,
    isBoxSelecting: false,
    boxStartX: 0,
    boxStartY: 0,
    isDraggingCell: false,
    sourceCellIndex: -1,
    draggedCellData: null,
    ghostEl: null,
    sourceCellEl: null,
    lastHoverNodeId: null,
    lastHoverCellIndex: -1
  };
}
let dragContext = _createIdleDragContext();
function _clearStoryboardHighlight(_0x353538) {
  if (!_0x353538) {
    return;
  }
  window.v2Renderer?.highlightDropSlot?.(_0x353538, {
    kind: "storyboard",
    index: -1
  });
}
function _resetDragContext() {
  if (dragContext?.isDragging) {
    endDragFpsSession("node-drag");
  }
  if (dragContext?.isPanning && dragContext?.panActivated) {
    endPanFpsSession("canvas-pan");
  }
  const _0x3ab558 = dragContext?.lastHoverNodeId || null;
  if (_0x3ab558) {
    _clearStoryboardHighlight(_0x3ab558);
  }
  dragContext = _createIdleDragContext();
  document.body.classList.remove("is-panning", "is-dragging", "is-edge-interaction-lite", "is-dragging-heavy-edges");
  document.querySelectorAll(".is-ui-hidden").forEach(_0x5cda10 => _0x5cda10.classList.remove("is-ui-hidden"));
  document.querySelectorAll(".v2-node.is-dragging").forEach(_0x4a788c => _0x4a788c.classList.remove("is-dragging"));
  stopAutoPan();
  _sampledPointerMove?.cancel?.();
  cancelPendingViewportUpdate();
  cancelViewportPanPreview();
  releaseViewportMediaPreloadsAfterPan();
}
function _resetCellDragContext() {
  const _0x2b0e6d = dragContext?.lastHoverNodeId || null;
  if (_0x2b0e6d) {
    _clearStoryboardHighlight(_0x2b0e6d);
  }
  if (dragContext?.sourceCellEl) {
    dragContext.sourceCellEl.classList.remove("is-drag-source");
  }
  dragContext?.ghostEl?.remove?.();
  dragContext = _createIdleDragContext();
  document.body.classList.remove("is-panning", "is-dragging", "is-edge-interaction-lite", "is-dragging-heavy-edges");
  stopAutoPan();
  _sampledPointerMove?.cancel?.();
  cancelPendingViewportUpdate();
  cancelViewportPanPreview();
  releaseViewportMediaPreloadsAfterPan();
}
function _deferCommit() {
  requestAnimationFrame(() => {
    setTimeout(() => commit(), 0);
  });
}
const dragController = createDragController({
  store: a634_0xf65f46,
  isNodeType: isNodeType,
  getShortcuts: getShortcuts,
  hitTestNode: hitTestNode,
  screenToWorld: screenToWorld,
  generateId: generateId,
  cloneNodesWithEdges: cloneNodesWithEdges,
  commit: commit,
  isFullFidelityDragEdgesEnabled: () => typeof document !== "undefined" && document.body?.dataset?.canvasDragEdgeRendering === "full"
});
const edgeController = createEdgeController();
const selectionController = createSelectionController({
  store: a634_0xf65f46,
  screenToWorld: screenToWorld,
  isNodeType: isNodeType,
  isValidConnection: a634_0x5a1d37
});
const wheelViewportPreview = createViewportPreviewCoordinator({
  beginPreview: beginViewportPanPreview,
  updatePreview(_0x4547b1) {
    updateViewportPanPreview(_0x4547b1.x, _0x4547b1.y, _0x4547b1.zoom);
  },
  flushPreview: flushViewportPanPreview,
  getPreview: getViewportPanPreview,
  isPreviewActive: isViewportPanPreviewActive
});
const zoomController = createZoomController({
  store: a634_0xf65f46,
  viewportPreview: wheelViewportPreview
});
const wheelPanController = createWheelPanController({
  store: a634_0xf65f46,
  viewportPreview: wheelViewportPreview
});
setDragContextGetter(() => dragContext);
let viewportRafId = null;
let pendingViewportUpdate = null;
let assistPanMirrorTimer = 0;
let pendingAssistPanMirrorViewport = null;
function syncSidePlusToLastPointer(_0x4f082b = {}) {
  const _0xb9a45f = typeof window !== "undefined" && typeof window._v2UpdateSidePlusNow === "function" ? window._v2UpdateSidePlusNow : typeof window !== "undefined" ? window._v2UpdateSidePlus : null;
  if (typeof _0xb9a45f === "function") {
    _0xb9a45f(lastMouseScreenX, lastMouseScreenY, _0x4f082b);
  }
}
function updateViewportBatched(_0x2679d2, _0x3cdd39, _0x450f73) {
  pendingViewportUpdate = {
    x: _0x2679d2,
    y: _0x3cdd39,
    zoom: _0x450f73
  };
  if (!viewportRafId) {
    viewportRafId = requestAnimationFrame(flushViewportUpdate);
  }
}
function flushViewportUpdate() {
  viewportRafId = null;
  if (pendingViewportUpdate) {
    const {
      x: _0x23e90c,
      y: _0x23ffda,
      zoom: _0x154ea8
    } = pendingViewportUpdate;
    pendingViewportUpdate = null;
    graphStore.updateViewport(_0x23e90c, _0x23ffda, _0x154ea8);
    syncSidePlusToLastPointer();
  }
}
function cancelPendingViewportUpdate() {
  if (viewportRafId) {
    cancelAnimationFrame(viewportRafId);
    viewportRafId = null;
  }
  pendingViewportUpdate = null;
}
function flushAssistPanStoreMirror() {
  assistPanMirrorTimer = 0;
  const _0x6e8b5c = pendingAssistPanMirrorViewport;
  pendingAssistPanMirrorViewport = null;
  if (!_0x6e8b5c || !dragContext?.assistPanActive) {
    return;
  }
  graphStore.updateViewport(_0x6e8b5c.x, _0x6e8b5c.y, _0x6e8b5c.zoom);
  syncSidePlusToLastPointer();
}
function scheduleAssistPanStoreMirror(_0x128078) {
  pendingAssistPanMirrorViewport = _0x128078 ? {
    ..._0x128078
  } : null;
  if (assistPanMirrorTimer) {
    return;
  }
  assistPanMirrorTimer = window.setTimeout(flushAssistPanStoreMirror, 32);
}
function cancelAssistPanStoreMirror() {
  if (assistPanMirrorTimer) {
    window.clearTimeout(assistPanMirrorTimer);
    assistPanMirrorTimer = 0;
  }
  pendingAssistPanMirrorViewport = null;
}
function _commitAssistPanPreview() {
  if (!dragContext?.assistPanActive) {
    return null;
  }
  releaseViewportMediaPreloadsAfterPan();
  const _0x62ab2d = flushViewportPanPreview();
  cancelAssistPanStoreMirror();
  dragContext.assistPanActive = false;
  dragContext.assistPanViewport = null;
  cancelPendingViewportUpdate();
  window._v2FlushMinimapViewportPreview?.(_0x62ab2d);
  if (!_0x62ab2d) {
    syncSidePlusToLastPointer();
    return null;
  }
  const _0x12c7c3 = () => {
    graphStore.updateViewport(_0x62ab2d.x, _0x62ab2d.y, _0x62ab2d.zoom);
    graphStore.markViewportPersist?.();
  };
  if (typeof graphStore.batch === "function") {
    graphStore.batch(_0x12c7c3);
  } else {
    _0x12c7c3();
  }
  syncSidePlusToLastPointer();
  return _0x62ab2d;
}
let autoPanReqId = null;
let autoPanState = {
  dx: 0,
  dy: 0
};
let lastMouseScreenX = 0;
let lastMouseScreenY = 0;
let _autoPanPendingDx = null;
let _autoPanPendingDy = null;
export function stopAutoPan() {
  if (autoPanReqId) {
    cancelAnimationFrame(autoPanReqId);
    autoPanReqId = null;
  }
}
function autoPanLoop() {
  if (!autoPanReqId) {
    return;
  }
  const {
    viewport: _0x35e7ed
  } = getStateRaw();
  const {
    dx: _0x23d4f2,
    dy: _0x431fbe
  } = resolveAutoPanVelocity({
    dx: _autoPanPendingDx,
    dy: _autoPanPendingDy
  }, autoPanState);
  if (_0x23d4f2 !== autoPanState.dx || _0x431fbe !== autoPanState.dy) {
    autoPanState.dx = _0x23d4f2;
    autoPanState.dy = _0x431fbe;
  }
  _autoPanPendingDx = null;
  _autoPanPendingDy = null;
  const _0x48c5c8 = _0x35e7ed.x - autoPanState.dx;
  const _0xc030db = _0x35e7ed.y - autoPanState.dy;
  updateViewportBatched(_0x48c5c8, _0xc030db, _0x35e7ed.zoom);
  if (dragContext.isDragging) {
    const _0x2de12b = getStateRaw();
    const {
      nodes: _0x56a5fd
    } = _0x2de12b;
    const {
      x: _0x39849b,
      y: _0x32a659
    } = screenToWorld(lastMouseScreenX, lastMouseScreenY, {
      ..._0x35e7ed,
      x: _0x48c5c8,
      y: _0xc030db
    });
    dragController.updateDraggingNodes(dragContext, lastMouseScreenX, lastMouseScreenY, _0x39849b, _0x32a659, _0x39849b, _0x32a659, _0x2de12b);
  }
  autoPanReqId = requestAnimationFrame(autoPanLoop);
}
function checkAutoPan(_0x2392bb, _0x53d04c) {
  lastMouseScreenX = _0x2392bb;
  lastMouseScreenY = _0x53d04c;
  if (!dragContext.isDragging && !dragContext.isBoxSelecting && !dragContext.isConnecting) {
    stopAutoPan();
    return;
  }
  const _0x100cb1 = 60;
  const _0x809be7 = 15;
  let _0x1fc62e = 0;
  let _0xb0e203 = 0;
  const _0x1263af = getStateRaw().viewport || {};
  const _0x358663 = getViewportScreenBounds(_0x1263af, window.innerWidth, window.innerHeight);
  if (_0x2392bb < _0x358663.left + _0x100cb1) {
    _0x1fc62e = -_0x809be7;
  } else if (_0x2392bb > _0x358663.right - _0x100cb1) {
    _0x1fc62e = _0x809be7;
  }
  if (_0x53d04c < _0x358663.top + _0x100cb1) {
    _0xb0e203 = -_0x809be7;
  } else if (_0x53d04c > _0x358663.bottom - _0x100cb1) {
    _0xb0e203 = _0x809be7;
  }
  if (_0x1fc62e !== 0 || _0xb0e203 !== 0) {
    _autoPanPendingDx = _0x1fc62e;
    _autoPanPendingDy = _0xb0e203;
    if (!autoPanReqId) {
      autoPanReqId = requestAnimationFrame(autoPanLoop);
    }
  } else {
    stopAutoPan();
  }
}
export function handlePointerDown(_0xb20079, _0x7fa14d, _0x345fc8 = false, _0x901fac = false, _0x15e8ea = null) {
  zoomController.settleWheelZoom();
  lastMouseScreenX = _0xb20079;
  lastMouseScreenY = _0x7fa14d;
  const _0x419186 = getStateRaw();
  const {
    viewport: _0xbc3718
  } = _0x419186;
  const {
    x: _0x23dda7,
    y: _0x1c9015
  } = screenToWorld(_0xb20079, _0x7fa14d, _0xbc3718);
  const _0x55e8dc = _0x419186.pickConnectMode;
  if (_0x55e8dc && _0x55e8dc.active) {
    if (_0x15e8ea?.button === 2) {
      _0x15e8ea.stopPropagation?.();
      _0x15e8ea.stopImmediatePropagation?.();
      return;
    }
    const _0x20fb59 = _0x15e8ea && _0x15e8ea.target && _0x15e8ea.target.closest(".v2-node");
    if (_0x20fb59) {
      return;
    }
  }
  if (!_0x345fc8 && dragController.tryStartTitleDrag(dragContext, _0x15e8ea, _0x23dda7, _0x1c9015)) {
    beginDragFpsSession("node-drag");
    return;
  }
  if (!_0x345fc8 && edgeController.tryStartHandleConnect(dragContext, _0x15e8ea, _0x23dda7, _0x1c9015, _0xbc3718)) {
    return;
  }
  if (_0x345fc8) {
    dragContext.isPanning = true;
    dragContext.panActivated = false;
    dragContext.panStartX = _0xb20079;
    dragContext.panStartY = _0x7fa14d;
    dragContext.panStartViewportX = _0xbc3718.x;
    dragContext.panStartViewportY = _0xbc3718.y;
    dragContext.panStartZoom = _0xbc3718.zoom;
    dragContext.panStartPerf = 0;
    dragContext.panMoveCount = 0;
    dragContext.panMinimapPreviewCount = 0;
    return;
  }
  if (dragController.tryStartNodeDrag(dragContext, _0xb20079, _0x7fa14d, _0x23dda7, _0x1c9015, _0x901fac, _0x15e8ea)) {
    if (dragContext.isDragging) {
      beginDragFpsSession("node-drag");
    }
    return;
  }
  if (!_0x345fc8 && !_0x15e8ea?.ctrlKey) {
    selectionController.startBoxSelecting(dragContext, _0xb20079, _0x7fa14d);
    return;
  }
}
function _activateCanvasPanIfNeeded(_0x1e120a, _0x4ceb5a) {
  if (!dragContext.isPanning) {
    return false;
  }
  if (dragContext.panActivated) {
    return true;
  }
  const _0x3f02a9 = _0x1e120a - dragContext.panStartX;
  const _0x480a22 = _0x4ceb5a - dragContext.panStartY;
  if (Math.hypot(_0x3f02a9, _0x480a22) < PAN_ACTIVATION_DISTANCE_PX) {
    return false;
  }
  const _0x2f9527 = {
    x: dragContext.panStartViewportX,
    y: dragContext.panStartViewportY,
    zoom: dragContext.panStartZoom
  };
  dragContext.panActivated = true;
  dragContext.panStartPerf = nowMs();
  dragContext.panMinimapPreviewCount = Number(window._v2GetMinimapPreviewFlushCount?.()) || 0;
  markViewportInteractionBusyForRenderer();
  holdViewportMediaPreloadsForPan();
  beginPanFpsSession("canvas-pan");
  beginViewportPanPreview(_0x2f9527);
  window._v2ScheduleMinimapViewportPreview?.(_0x2f9527, {
    force: true
  });
  document.body.classList.add("is-panning");
  _setEdgeInteractionLite(_shouldUseEdgeInteractionLite(getStateRaw()));
  return true;
}
function _handlePointerMoveImpl(_0x5e1882, _0xdee37c, _0x59a4c7 = false, _0x5308a0 = null) {
  const _0x314ed3 = lastMouseScreenX;
  const _0x2f4586 = lastMouseScreenY;
  lastMouseScreenX = _0x5e1882;
  lastMouseScreenY = _0xdee37c;
  if (dragContext.isPanning) {
    if (!_activateCanvasPanIfNeeded(_0x5e1882, _0xdee37c)) {
      return;
    }
    const _0x4a3475 = _0x5e1882 - dragContext.panStartX;
    const _0x1d4203 = _0xdee37c - dragContext.panStartY;
    const _0x3c48f1 = {
      x: dragContext.panStartViewportX + _0x4a3475,
      y: dragContext.panStartViewportY + _0x1d4203,
      zoom: dragContext.panStartZoom
    };
    dragContext.panMoveCount = (dragContext.panMoveCount || 0) + 1;
    updateViewportPanPreview(_0x3c48f1.x, _0x3c48f1.y, _0x3c48f1.zoom);
    window._v2ScheduleMinimapViewportPreview?.(_0x3c48f1);
    return;
  }
  if (dragContext.assistPanActive && !_0x59a4c7) {
    _commitAssistPanPreview();
  }
  let _0x89cb7e = getStateRaw();
  let {
    viewport: _0x2dbbc3,
    nodes: _0x2c488c
  } = _0x89cb7e;
  if ((dragContext.isDragging || dragContext.isConnecting) && _0x59a4c7) {
    stopAutoPan();
    if (!dragContext.assistPanActive) {
      flushViewportUpdate();
      _0x89cb7e = getStateRaw();
      ({
        viewport: _0x2dbbc3,
        nodes: _0x2c488c
      } = _0x89cb7e);
      const _0x456d8a = {
        ..._0x2dbbc3
      };
      dragContext.assistPanActive = true;
      dragContext.assistPanViewport = _0x456d8a;
      holdViewportMediaPreloadsForPan();
      beginViewportPanPreview(_0x456d8a);
      window._v2ScheduleMinimapViewportPreview?.(_0x456d8a, {
        force: true
      });
    }
    const _0x4749b3 = _0x5e1882 - _0x314ed3;
    const _0x35fa59 = _0xdee37c - _0x2f4586;
    const _0x99f57b = dragContext.assistPanViewport || _0x2dbbc3;
    const _0xa471dc = {
      ..._0x99f57b,
      x: _0x99f57b.x + _0x4749b3,
      y: _0x99f57b.y + _0x35fa59,
      zoom: _0x99f57b.zoom
    };
    dragContext.assistPanViewport = _0xa471dc;
    updateViewportPanPreview(_0xa471dc.x, _0xa471dc.y, _0xa471dc.zoom);
    scheduleAssistPanStoreMirror(_0xa471dc);
    window._v2ScheduleMinimapViewportPreview?.(_0xa471dc);
    const {
      x: _0x18bb94,
      y: _0x473022
    } = screenToWorld(_0x5e1882, _0xdee37c, _0xa471dc);
    if (dragContext.isConnecting) {
      edgeController.updateHandleConnect(dragContext, _0x5e1882, _0xdee37c, _0x18bb94, _0x473022, _0xa471dc, _0x2c488c, _0x89cb7e.connOverlay);
      return;
    }
    const _0x5b4db2 = {
      ..._0x89cb7e,
      viewport: _0xa471dc
    };
    dragController.updateDraggingNodes(dragContext, _0x5e1882, _0xdee37c, _0x18bb94, _0x473022, _0x18bb94, _0x473022, _0x5b4db2);
    return;
  }
  let {
    x: _0x2b0357,
    y: _0x50e3f7
  } = screenToWorld(_0x5e1882, _0xdee37c, _0x2dbbc3);
  const _0x2ef7e9 = _0x2b0357;
  const _0x445968 = _0x50e3f7;
  if (edgeCuttingController.handlePointerMove({
    e: _0x5308a0,
    worldX: _0x2b0357,
    worldY: _0x50e3f7
  })) {
    return;
  }
  if (dragContext.isConnecting) {
    edgeController.updateHandleConnect(dragContext, _0x5e1882, _0xdee37c, _0x2b0357, _0x50e3f7, _0x2dbbc3, _0x2c488c, _0x89cb7e.connOverlay);
    return;
  }
  if (dragContext.isBoxSelecting) {
    selectionController.updateBoxSelecting(dragContext, _0x5e1882, _0xdee37c);
    return;
  }
  if (dragContext.isDraggingCell) {
    dragController.updateDraggingCell(dragContext, _0x5e1882, _0xdee37c, _0x2b0357, _0x50e3f7, _0x2c488c);
    return;
  }
  if (!dragContext.isDragging) {
    return;
  }
  dragController.updateDraggingNodes(dragContext, _0x5e1882, _0xdee37c, _0x2b0357, _0x50e3f7, _0x2ef7e9, _0x445968, _0x89cb7e);
  checkAutoPan(_0x5e1882, _0xdee37c);
}
const _sampledPointerMove = rafSampleLatest(_handlePointerMoveImpl);
export function handlePointerMove(_0x39d253, _0x94a6d1, _0xefe81 = null) {
  const _0x434bc0 = _0xefe81?.__aiCanvasLeftDragHeld === true;
  if (_0xefe81 && _0xefe81.buttons === 0 && !_0x434bc0) {
    if (dragContext.isDragging || dragContext.isPanning || dragContext.isConnecting || dragContext.isBoxSelecting || dragContext.isDraggingCell) {
      handlePointerUp(_0x39d253, _0x94a6d1);
      return;
    }
  }
  if (_0x434bc0 && dragContext.assistPanActive) {
    _sampledPointerMove.cancel?.();
    _handlePointerMoveImpl(_0x39d253, _0x94a6d1, false, _0xefe81);
    return;
  }
  const _0x3bf28b = !!_0xefe81 && (_0xefe81.buttons & 4) !== 0;
  const _0x1b583f = (dragContext.isDragging || dragContext.isConnecting) && (_0x3bf28b || window._spaceHeld === true);
  _sampledPointerMove(_0x39d253, _0x94a6d1, _0x1b583f, _0xefe81);
}
export function handlePointerUp(_0x3f7503 = 0, _0x383424 = 0) {
  if (!dragContext.isDragging && !dragContext.isPanning && !dragContext.isConnecting && !dragContext.isBoxSelecting && !dragContext.isDraggingCell) {
    if (edgeCuttingController.hasActiveSession()) {
      edgeCuttingController.finishSession();
    }
    return;
  }
  let _0x5dae81 = false;
  const _0x5762bc = !!dragContext.isPanning;
  const _0x585b34 = !!dragContext.isDragging;
  const _0x4e8deb = _0x5762bc && dragContext.panActivated === true;
  const _0x53f993 = dragContext.panStartPerf || nowMs();
  const _0x32e113 = dragContext.panMoveCount || 0;
  const _0x20c12e = dragContext.panMinimapPreviewCount || 0;
  stopAutoPan();
  if (_0x4e8deb) {
    markViewportInteractionBusyForRenderer();
    const _0x372db9 = flushViewportPanPreview();
    const _0xdb25f2 = Number(window._v2FlushMinimapViewportPreview?.(_0x372db9)) || Number(window._v2GetMinimapPreviewFlushCount?.()) || _0x20c12e;
    endPanFpsSession("canvas-pan");
    cancelPendingViewportUpdate();
    const _0x379bb3 = () => {
      if (_0x372db9) {
        graphStore.updateViewport(_0x372db9.x, _0x372db9.y, _0x372db9.zoom);
      }
      graphStore.markViewportPersist();
    };
    if (typeof graphStore.batch === "function") {
      graphStore.batch(_0x379bb3);
    } else {
      _0x379bb3();
    }
    const _0xf46d21 = typeof graphStore.getStateRaw === "function" && graphStore.getStateRaw() || getStateRaw();
    const _0xcf71f7 = _0x372db9 || _0xf46d21?.viewport || {};
    recordCanvasPanSample({
      durationMs: nowMs() - _0x53f993,
      moveCount: _0x32e113,
      committed: !!_0x372db9,
      nodeCount: Number.isFinite(_0xf46d21?._nodeCount) ? _0xf46d21._nodeCount : Object.keys(_0xf46d21?.nodes || {}).length,
      edgeCount: Object.keys(_0xf46d21?.edges || {}).length,
      mountedNodeCount: getMountedNodeCountForPerf(),
      minimapPreviewCount: Math.max(0, _0xdb25f2 - _0x20c12e),
      finalX: _0xcf71f7.x,
      finalY: _0xcf71f7.y,
      finalZoom: _0xcf71f7.zoom
    });
  } else if (dragContext.assistPanActive) {
    _commitAssistPanPreview();
  } else {
    flushViewportUpdate();
  }
  if (dragContext.isDraggingCell) {
    const _0x5b21c6 = dragController.finishDraggingCell(dragContext, _0x3f7503, _0x383424);
    _resetCellDragContext();
    if (_0x5b21c6.didAct) {
      _deferCommit();
    }
    return;
  }
  if (dragContext.isConnecting) {
    _0x5dae81 = edgeController.finishHandleConnect(dragContext, _0x3f7503, _0x383424) || _0x5dae81;
  } else if (dragContext.isBoxSelecting) {
    const _0x51efdd = selectionController.finishBoxSelecting(dragContext, _0x3f7503, _0x383424);
    _0x5dae81 = _0x51efdd.didAct || _0x5dae81;
  } else if (dragContext.isDragging) {
    const _0x5e4bb1 = dragController.finishDraggingNodes(dragContext, _0x3f7503, _0x383424);
    if (_0x5e4bb1.earlyCommit) {
      window._clearSnapGuideLines?.();
      _resetDragContext();
      releaseViewportMediaPreloadsAfterPan();
      return;
    }
    _0x5dae81 = _0x5e4bb1.didAct || _0x5dae81;
  }
  window._clearSnapGuideLines?.();
  _resetDragContext();
  if (_0x585b34) {
    const _0x186e5c = getStateRaw()?.selectedNodeIds || [];
    window.v2Renderer?.flushSelection?.(_0x186e5c, {
      settleInteraction: true
    });
  }
  if (_0x4e8deb) {
    releaseViewportInteractionBusyForRenderer();
    releaseViewportMediaPreloadsAfterPan();
    syncSidePlusToLastPointer();
  }
  if (_0x5dae81) {
    commit();
  }
}
export function handleWheel(_0x2bfbfc, _0x1b7a60, _0x29c8a3, _0x18fa0d) {
  zoomController.handleWheel(_0x2bfbfc, _0x1b7a60, _0x29c8a3, _0x18fa0d);
}
export function handleWheelPan(_0x127439, _0x128133, _0x4e39ce) {
  return wheelPanController.handleWheelPan(_0x127439, _0x128133, _0x4e39ce);
}
export function settleWheelZoom() {
  return zoomController.settleWheelZoom();
}
export function settleWheelPan() {
  return wheelPanController.settleWheelPan();
}
export function getDragContext() {
  return {
    ...dragContext
  };
}
export function getInteractionRenderState() {
  return {
    isDragging: !!dragContext.isDragging,
    isDraggingCell: !!dragContext.isDraggingCell,
    isCommittingDrag: dragContext.isCommittingDrag === true,
    isPanning: !!dragContext.isPanning && dragContext.panActivated === true,
    assistPanActive: !!dragContext.assistPanActive,
    targetNodeId: dragContext.targetNodeId || null,
    pendingDx: Number.isFinite(dragContext.pendingDx) ? dragContext.pendingDx : 0,
    pendingDy: Number.isFinite(dragContext.pendingDy) ? dragContext.pendingDy : 0,
    hasMoved: !!dragContext.hasMoved,
    wasSelectedOnDown: !!dragContext.wasSelectedOnDown
  };
}
export function handleDoubleClick(_0x5dc531, _0xf331b6) {
  const {
    viewport: _0x3bfd2a,
    nodes: _0x32cf9c
  } = getStateRaw();
  const {
    x: _0x51b153,
    y: _0x2a3eee
  } = screenToWorld(_0x5dc531, _0xf331b6, _0x3bfd2a);
  for (const _0x52e476 of Object.values(_0x32cf9c)) {
    const _0x2c1eb0 = isPointInRect(_0x51b153, _0x2a3eee, _0x52e476.x, _0x52e476.y, _0x52e476.width, _0x52e476.height);
    if (_0x2c1eb0) {
      return;
    }
  }
  uiStore.showPicker(_0x5dc531, _0xf331b6, _0x51b153, _0x2a3eee);
}
export function handleContextMenu(_0x425a16, _0x6307b1) {
  return canvasContextMenuController.handleNodeContextMenu(_0x425a16, _0x6307b1);
}
export function cloneNodesWithEdges(_0x135500, _0x588ad3 = 16, _0x5c96da = 16) {
  const _0x37ecf2 = interactionCommandAdapter.executeCanvasCommand("node.duplicate", {
    ids: _0x135500,
    dx: _0x588ad3,
    dy: _0x5c96da,
    edgePolicy: "all-touching"
  });
  if (_0x37ecf2.ok) {
    return _0x37ecf2.result?.idMap || {};
  } else {
    return {};
  }
}
export function executeCanvasCommand(_0x1c23f2, _0x14092f = {}) {
  return interactionCommandAdapter.executeCanvasCommand(_0x1c23f2, _0x14092f);
}
export function executeCommand(_0x2175b9, _0x52e56d = {}) {
  if (interactionCommandAdapter.execute(_0x2175b9, _0x52e56d)) {
    return;
  }
  console.warn("Unknown command: ", _0x2175b9);
}
export function isValidConnection(_0xcce584, _0x21fa52) {
  return a634_0x5a1d37(_0xcce584, _0x21fa52);
}
export function initConnectionHandles(_0x5a8ef6) {
  return a634_0x5934a4(_0x5a8ef6);
}
export function initPickConnect(_0x4b3e9a) {
  return a634_0x3cea00(_0x4b3e9a);
}
export function initCanvasContextMenu(_0x469735) {
  if (!_0x469735) {
    return;
  }
  _0x469735.addEventListener("contextmenu", _0x491113 => {
    if (!isEditableTextTargetInGroupedNode(_0x491113.target, getStateRaw().nodes)) {
      return;
    }
    _0x491113.__aiCanvasGroupedEditableContextMenu = true;
  }, {
    capture: true
  });
  function _0x3c3798(_0x45c492) {
    if (_0x45c492 === "ai-text" || _0x45c492 === "ai-image" || _0x45c492 === "ai-video" || _0x45c492 === "ai-audio") {
      return getAIGenerationDefaultSizeByType(_0x45c492);
    }
    if (_0x45c492 === "panorama-scene" || _0x45c492 === "panorama-360") {
      return PANORAMA_SCENE_DEFAULT_SIZE;
    }
    if (_0x45c492 === "storyboard-script") {
      return STORYBOARD_SCRIPT_DEFAULT_SIZE;
    }
    return getNodeDefaultSize(_0x45c492);
  }
  function _0x1e4a35(_0x12e6f1, _0x3d4583, _0x9bcae5) {
    const _0x539bc0 = _0x3c3798(_0x12e6f1.type);
    const _0x4f6ff9 = _0x12e6f1.type === "source-image" || _0x12e6f1.type === "source-video" ? {
      needsAutoResize: true
    } : {};
    executeCommand("create_node", {
      type: _0x12e6f1.type,
      x: _0x3d4583 - _0x539bc0.width / 2,
      y: _0x9bcae5 - _0x539bc0.height / 2,
      width: _0x539bc0.width,
      height: _0x539bc0.height,
      name: _0x12e6f1.defaultName || _0x12e6f1.label,
      extra: _0x4f6ff9
    });
  }
  function _0x2bb6b6(_0x397f8d, _0x119820, _0xc10220 = false) {
    document.querySelector("#v2PickerOverlay")?.remove();
    removeContextMenus();
    const {
      viewport: _0x3103d2
    } = getStateRaw();
    let _0x17126e;
    let _0x532f7c;
    if (_0xc10220) {
      const _0x3def75 = getViewportScreenCenter(_0x3103d2, window.innerWidth, window.innerHeight);
      const _0x2432df = screenToWorld(_0x3def75.x, _0x3def75.y, _0x3103d2);
      _0x17126e = _0x2432df.x;
      _0x532f7c = _0x2432df.y;
    } else {
      const _0x33938a = screenToWorld(_0x397f8d, _0x119820, _0x3103d2);
      _0x17126e = _0x33938a.x;
      _0x532f7c = _0x33938a.y;
    }
    const _0x17b95d = document.createElement("div");
    _0x17b95d.id = "v2PickerOverlay";
    const _0x2424e7 = getViewportScreenBounds(_0x3103d2, window.innerWidth, window.innerHeight);
    const _0x66994b = Math.min(440, Math.max(220, _0x2424e7.right - _0x2424e7.left - 24));
    const _0x51201f = Math.max(_0x2424e7.left + 12, Math.min(_0x397f8d, _0x2424e7.right - _0x66994b - 12));
    const _0x142c26 = _0x2424e7.top + 12;
    const _0x4fd447 = Math.max(_0x142c26, Math.min(_0x119820, _0x2424e7.bottom - 500));
    const _0x45483a = document.createElement("div");
    _0x45483a.className = "v2-node-picker v2-node-menu-compact";
    _0x45483a.style.left = _0x51201f + "px";
    _0x45483a.style.top = _0x4fd447 + "px";
    _0x45483a.style.width = _0x66994b + "px";
    const _0x469319 = _0x4c5ff9 => {
      const _0x2b8e25 = document.createElement("div");
      _0x2b8e25.className = "v2-menu-section";
      const _0x440ecf = document.createElement("div");
      _0x440ecf.className = "v2-menu-rule";
      const _0x159e81 = document.createElement("span");
      _0x159e81.className = "v2-menu-title";
      _0x159e81.textContent = _0x4c5ff9;
      _0x2b8e25.appendChild(_0x159e81);
      _0x2b8e25.appendChild(_0x440ecf);
      return _0x2b8e25;
    };
    const _0x39c143 = (_0x21033f, _0x122bc3) => {
      const _0x3ee8c8 = document.createElement("button");
      _0x3ee8c8.className = "v2-menu-row" + (_0x21033f.desc ? " has-desc" : "");
      const _0x389f5e = document.createElement("div");
      _0x389f5e.className = "v2-menu-ico";
      _0x389f5e.replaceChildren();
      if (_0x21033f.iconEl) {
        _0x389f5e.appendChild(_0x21033f.iconEl.cloneNode(true));
      }
      _0x3ee8c8.appendChild(_0x389f5e);
      const _0x474d19 = document.createElement("div");
      _0x474d19.className = "v2-menu-txt-wrap";
      const _0x10f57d = document.createElement("span");
      _0x10f57d.className = "v2-menu-lbl";
      _0x10f57d.textContent = _0x21033f.label;
      if (_0x21033f.badge) {
        const _0x20144b = document.createElement("span");
        _0x20144b.textContent = _0x21033f.badge;
        _0x20144b.className = "v2-badge-beta";
        _0x10f57d.appendChild(_0x20144b);
      }
      _0x474d19.appendChild(_0x10f57d);
      if (_0x21033f.desc) {
        const _0x253f5b = document.createElement("span");
        _0x253f5b.className = "v2-menu-sub";
        _0x253f5b.textContent = _0x21033f.desc;
        _0x474d19.appendChild(_0x253f5b);
      }
      _0x3ee8c8.appendChild(_0x474d19);
      _0x3ee8c8.addEventListener("click", _0x4f5546 => {
        _0x4f5546.stopPropagation();
        _0x122bc3(_0x4f5546);
      });
      return _0x3ee8c8;
    };
    const _0x400bf4 = "var(--white-50)";
    const _0x25f2c3 = "http://www.w3.org/2000/svg";
    const _0x5719e3 = (_0x554a88, _0x3231bd) => {
      const _0x44abc4 = document.createElementNS(_0x25f2c3, "svg");
      _0x44abc4.setAttribute("width", "18");
      _0x44abc4.setAttribute("height", "18");
      _0x44abc4.setAttribute("viewBox", "0 0 24 24");
      _0x44abc4.setAttribute("fill", "none");
      _0x44abc4.setAttribute("stroke", _0x554a88);
      _0x44abc4.setAttribute("stroke-width", String(_0x3231bd));
      return _0x44abc4;
    };
    const _0x5a8e1b = _0x37159c => {
      const _0x354b36 = _0x5719e3(_0x37159c, 1.8);
      const _0x123675 = document.createElementNS(_0x25f2c3, "rect");
      _0x123675.setAttribute("x", "4");
      _0x123675.setAttribute("y", "4");
      _0x123675.setAttribute("width", "16");
      _0x123675.setAttribute("height", "16");
      _0x123675.setAttribute("rx", "2");
      const _0x4b94e1 = document.createElementNS(_0x25f2c3, "path");
      _0x4b94e1.setAttribute("d", "M8 9h8");
      const _0x2cad26 = document.createElementNS(_0x25f2c3, "path");
      _0x2cad26.setAttribute("d", "M8 13h6");
      const _0x16fae5 = document.createElementNS(_0x25f2c3, "path");
      _0x16fae5.setAttribute("d", "M15 20v-4h5");
      _0x354b36.appendChild(_0x123675);
      _0x354b36.appendChild(_0x4b94e1);
      _0x354b36.appendChild(_0x2cad26);
      _0x354b36.appendChild(_0x16fae5);
      return _0x354b36;
    };
    const _0x18e156 = _0x5576e6 => {
      const _0x27a690 = _0x5719e3(_0x5576e6, 1.8);
      const _0x22349f = document.createElementNS(_0x25f2c3, "circle");
      _0x22349f.setAttribute("cx", "12");
      _0x22349f.setAttribute("cy", "12");
      _0x22349f.setAttribute("r", "8.5");
      const _0x47163 = document.createElementNS(_0x25f2c3, "path");
      _0x47163.setAttribute("d", "M3.5 12h17");
      const _0x287142 = document.createElementNS(_0x25f2c3, "path");
      _0x287142.setAttribute("d", "M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5S14.4 17.9 12 20.5");
      const _0x3bb700 = document.createElementNS(_0x25f2c3, "path");
      _0x3bb700.setAttribute("d", "M12 3.5C9.6 6.1 8.5 8.9 8.5 12s1.1 5.9 3.5 8.5");
      const _0x2ef51f = document.createElementNS(_0x25f2c3, "path");
      _0x2ef51f.setAttribute("d", "M6.1 6.1c3.4 1.8 8.4 1.8 11.8 0");
      const _0x506829 = document.createElementNS(_0x25f2c3, "path");
      _0x506829.setAttribute("d", "M6.1 17.9c3.4-1.8 8.4-1.8 11.8 0");
      _0x27a690.appendChild(_0x22349f);
      _0x27a690.appendChild(_0x47163);
      _0x27a690.appendChild(_0x287142);
      _0x27a690.appendChild(_0x3bb700);
      _0x27a690.appendChild(_0x2ef51f);
      _0x27a690.appendChild(_0x506829);
      return _0x27a690;
    };
    const _0x5d2572 = _0x270816 => {
      const _0xc73018 = _0x5719e3(_0x270816, 1.8);
      const _0x777eb6 = document.createElementNS(_0x25f2c3, "rect");
      _0x777eb6.setAttribute("x", "3");
      _0x777eb6.setAttribute("y", "4");
      _0x777eb6.setAttribute("width", "18");
      _0x777eb6.setAttribute("height", "16");
      _0x777eb6.setAttribute("rx", "2");
      _0xc73018.appendChild(_0x777eb6);
      ["9", "14"].forEach(_0x5df90d => {
        const _0x26fdeb = document.createElementNS(_0x25f2c3, "line");
        _0x26fdeb.setAttribute("x1", "3");
        _0x26fdeb.setAttribute("y1", _0x5df90d);
        _0x26fdeb.setAttribute("x2", "21");
        _0x26fdeb.setAttribute("y2", _0x5df90d);
        _0xc73018.appendChild(_0x26fdeb);
      });
      const _0x36e2b3 = document.createElementNS(_0x25f2c3, "line");
      _0x36e2b3.setAttribute("x1", "8");
      _0x36e2b3.setAttribute("y1", "4");
      _0x36e2b3.setAttribute("x2", "8");
      _0x36e2b3.setAttribute("y2", "20");
      _0xc73018.appendChild(_0x36e2b3);
      return _0xc73018;
    };
    const _0x587316 = _0xc2ab0c => {
      const _0x9d0265 = _0x5719e3(_0xc2ab0c, 1.8);
      const _0xbc9bff = document.createElementNS(_0x25f2c3, "rect");
      _0xbc9bff.setAttribute("x", "3");
      _0xbc9bff.setAttribute("y", "3");
      _0xbc9bff.setAttribute("width", "18");
      _0xbc9bff.setAttribute("height", "18");
      _0xbc9bff.setAttribute("rx", "2");
      _0x9d0265.appendChild(_0xbc9bff);
      ["9", "15"].forEach(_0x379ca7 => {
        const _0x167f24 = document.createElementNS(_0x25f2c3, "line");
        _0x167f24.setAttribute("x1", "3");
        _0x167f24.setAttribute("y1", _0x379ca7);
        _0x167f24.setAttribute("x2", "21");
        _0x167f24.setAttribute("y2", _0x379ca7);
        _0x9d0265.appendChild(_0x167f24);
        const _0x1a3371 = document.createElementNS(_0x25f2c3, "line");
        _0x1a3371.setAttribute("x1", _0x379ca7);
        _0x1a3371.setAttribute("y1", "3");
        _0x1a3371.setAttribute("x2", _0x379ca7);
        _0x1a3371.setAttribute("y2", "21");
        _0x9d0265.appendChild(_0x1a3371);
      });
      return _0x9d0265;
    };
    const _0x46c33b = () => {
      const _0x3c9618 = _0x5719e3("var(--gold)", 1.8);
      const _0x1d3e09 = document.createElementNS(_0x25f2c3, "path");
      _0x1d3e09.setAttribute("d", "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z");
      _0x3c9618.appendChild(_0x1d3e09);
      return _0x3c9618;
    };
    const _0x59859e = () => {
      const _0xcdbc2c = _0x5719e3("var(--white-50)", 1.8);
      const _0xc3da3 = document.createElementNS(_0x25f2c3, "path");
      _0xc3da3.setAttribute("d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4");
      const _0x227e85 = document.createElementNS(_0x25f2c3, "polyline");
      _0x227e85.setAttribute("points", "17 8 12 3 7 8");
      const _0x2b7fa4 = document.createElementNS(_0x25f2c3, "line");
      _0x2b7fa4.setAttribute("x1", "12");
      _0x2b7fa4.setAttribute("y1", "3");
      _0x2b7fa4.setAttribute("x2", "12");
      _0x2b7fa4.setAttribute("y2", "15");
      _0xcdbc2c.appendChild(_0xc3da3);
      _0xcdbc2c.appendChild(_0x227e85);
      _0xcdbc2c.appendChild(_0x2b7fa4);
      return _0xcdbc2c;
    };
    const _0x273cdc = _0x3c2739 => {
      const _0x2e6afc = _0x5719e3(_0x3c2739, 1.8);
      const _0x21174e = document.createElementNS(_0x25f2c3, "path");
      _0x21174e.setAttribute("d", "M6 3v12a3 3 0 0 0 3 3h12");
      const _0x242a38 = document.createElementNS(_0x25f2c3, "path");
      _0x242a38.setAttribute("d", "M3 6h12a3 3 0 0 1 3 3v12");
      const _0x5f219f = document.createElementNS(_0x25f2c3, "path");
      _0x5f219f.setAttribute("d", "M3 3l18 18");
      _0x2e6afc.appendChild(_0x21174e);
      _0x2e6afc.appendChild(_0x242a38);
      _0x2e6afc.appendChild(_0x5f219f);
      return _0x2e6afc;
    };
    const _0x2978aa = _0xbf82e4 => {
      const _0x3d1108 = _0x5719e3(_0xbf82e4, 1.8);
      const _0x2fbb90 = document.createElementNS(_0x25f2c3, "rect");
      _0x2fbb90.setAttribute("x", "3");
      _0x2fbb90.setAttribute("y", "4");
      _0x2fbb90.setAttribute("width", "18");
      _0x2fbb90.setAttribute("height", "16");
      _0x2fbb90.setAttribute("rx", "2");
      const _0x4d6ccc = document.createElementNS(_0x25f2c3, "path");
      _0x4d6ccc.setAttribute("d", "M3 10h18");
      const _0x55b690 = document.createElementNS(_0x25f2c3, "path");
      _0x55b690.setAttribute("d", "M12 10v10");
      _0x3d1108.appendChild(_0x2fbb90);
      _0x3d1108.appendChild(_0x4d6ccc);
      _0x3d1108.appendChild(_0x55b690);
      return _0x3d1108;
    };
    const _0x3ec7cd = _0x5f57a8 => {
      const _0x550c89 = _0x5719e3(_0x5f57a8, 1.8);
      const _0x24f11b = document.createElementNS(_0x25f2c3, "rect");
      _0x24f11b.setAttribute("x", "3");
      _0x24f11b.setAttribute("y", "4");
      _0x24f11b.setAttribute("width", "18");
      _0x24f11b.setAttribute("height", "16");
      _0x24f11b.setAttribute("rx", "2");
      const _0x5a07c5 = document.createElementNS(_0x25f2c3, "path");
      _0x5a07c5.setAttribute("d", "M7 8h10");
      const _0x14e7ba = document.createElementNS(_0x25f2c3, "path");
      _0x14e7ba.setAttribute("d", "M7 15c2.2-3 4.6-3 6.8 0 1.1 1.5 2.2 1.5 3.2 0");
      const _0x456354 = document.createElementNS(_0x25f2c3, "path");
      _0x456354.setAttribute("d", "M14.5 11.5l2.5-2.5 2 2-2.5 2.5-2.7.7.7-2.7z");
      _0x550c89.appendChild(_0x24f11b);
      _0x550c89.appendChild(_0x5a07c5);
      _0x550c89.appendChild(_0x14e7ba);
      _0x550c89.appendChild(_0x456354);
      return _0x550c89;
    };
    const _0xb74692 = _0x51d8fc => {
      const _0x3e5ec7 = _0x5719e3(_0x51d8fc, 1.8);
      const _0x4f8968 = document.createElementNS(_0x25f2c3, "circle");
      _0x4f8968.setAttribute("cx", "12");
      _0x4f8968.setAttribute("cy", "12");
      _0x4f8968.setAttribute("r", "9");
      const _0x549eba = document.createElementNS(_0x25f2c3, "path");
      _0x549eba.setAttribute("d", "M3 12h18");
      const _0x28004f = document.createElementNS(_0x25f2c3, "path");
      _0x28004f.setAttribute("d", "M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21");
      const _0x50e26a = document.createElementNS(_0x25f2c3, "path");
      _0x50e26a.setAttribute("d", "M12 3C9.7 5.5 8.5 8.5 8.5 12S9.7 18.5 12 21");
      _0x3e5ec7.appendChild(_0x4f8968);
      _0x3e5ec7.appendChild(_0x549eba);
      _0x3e5ec7.appendChild(_0x28004f);
      _0x3e5ec7.appendChild(_0x50e26a);
      return _0x3e5ec7;
    };
    const _0x31fa5e = {
      "ai-text": () => createNodeCreationMenuIcon("ai-text", {
        documentObject: document,
        stroke: _0x400bf4
      }),
      "ai-image": () => createNodeCreationMenuIcon("ai-image", {
        documentObject: document,
        stroke: _0x400bf4
      }),
      "ai-video": () => createNodeCreationMenuIcon("ai-video", {
        documentObject: document,
        stroke: _0x400bf4
      }),
      "ai-audio": () => createNodeCreationMenuIcon("ai-audio", {
        documentObject: document,
        stroke: _0x400bf4
      }),
      "comment-note": () => _0x5a8e1b(_0x400bf4),
      "panorama-scene": () => _0x18e156(_0x400bf4),
      "panorama-360": () => _0x18e156(_0x400bf4),
      storyboard: () => _0x587316(_0x400bf4),
      "storyboard-script": () => _0x5d2572(_0x400bf4),
      collage: () => _0x2978aa(_0x400bf4),
      whiteboard: () => _0x3ec7cd(_0x400bf4),
      "web-preview": () => _0xb74692(_0x400bf4),
      "media-clip": () => _0x273cdc(_0x400bf4),
      debug: () => _0x46c33b()
    };
    const _0x24aeef = getNodeCreationMenuSections(PICKER_NODE_CREATION_SECTION_IDS, {
      includeDevOnly: isDevModeOn()
    });
    const _0x54bde0 = document.createElement("div");
    _0x54bde0.className = "v2-node-picker-layout";
    const _0x577e07 = document.createElement("div");
    _0x577e07.className = "v2-node-picker-column v2-node-picker-column-primary";
    _0x577e07.dataset.nodePickerColumn = "primary";
    const _0x1a2360 = document.createElement("div");
    _0x1a2360.className = "v2-node-picker-column v2-node-picker-column-function";
    _0x1a2360.dataset.nodePickerColumn = "function";
    _0x54bde0.appendChild(_0x577e07);
    _0x54bde0.appendChild(_0x1a2360);
    _0x45483a.appendChild(_0x54bde0);
    _0x24aeef.forEach(_0x129473 => {
      const _0x295ec7 = document.createElement("section");
      _0x295ec7.className = "v2-node-picker-section v2-node-menu-section";
      _0x295ec7.dataset.nodePickerSection = _0x129473.id;
      _0x295ec7.appendChild(_0x469319(_0x129473.label));
      _0x129473.items.forEach(_0x2a51ed => {
        const _0x10bc79 = _0x3c3798(_0x2a51ed.type);
        _0x295ec7.appendChild(_0x39c143({
          key: _0x2a51ed.type,
          label: _0x2a51ed.label,
          w: _0x10bc79.width,
          h: _0x10bc79.height,
          badge: _0x2a51ed.badge,
          desc: _0x2a51ed.subtitle,
          iconEl: _0x31fa5e[_0x2a51ed.type]?.()
        }, () => {
          _0x17b95d.remove();
          _0x1e4a35(_0x2a51ed, _0x17126e, _0x532f7c);
        }));
      });
      const _0x3244ec = _0x129473.id === "function" ? _0x1a2360 : _0x577e07;
      _0x3244ec.appendChild(_0x295ec7);
    });
    const _0xf5c7 = document.createElement("section");
    _0xf5c7.className = "v2-node-picker-section v2-node-menu-section";
    _0xf5c7.dataset.nodePickerSection = "resource";
    _0xf5c7.appendChild(_0x469319(t("canvasInteraction.contextMenu.addResource")));
    _0xf5c7.appendChild(_0x39c143({
      label: NODE_CREATION_UPLOAD_ITEM.label,
      desc: NODE_CREATION_UPLOAD_ITEM.subtitle,
      iconBg: "var(--white-05)",
      iconEl: _0x59859e()
    }, () => {
      _0x17b95d.remove();
      openCanvasUploadAt(_0x397f8d, _0x119820);
    }));
    _0x577e07.appendChild(_0xf5c7);
    _0x17b95d.appendChild(_0x45483a);
    document.body.appendChild(_0x17b95d);
    const _0x17f6ef = _0x45483a.getBoundingClientRect();
    const _0x3247ef = Math.max(_0x142c26, _0x2424e7.bottom - _0x17f6ef.height - 12);
    const _0x5d2148 = Number.parseFloat(_0x45483a.style.top) || _0x119820;
    _0x45483a.style.top = Math.min(Math.max(_0x142c26, _0x5d2148), _0x3247ef) + "px";
    _0x17b95d.addEventListener("click", () => _0x17b95d.remove());
  }
  _0x469735.addEventListener("dblclick", _0x57d878 => {
    if (_0x57d878.target.closest(".v2-node")) {
      return;
    }
    _0x57d878.preventDefault();
    _0x57d878.stopPropagation();
    _0x2bb6b6(_0x57d878.clientX, _0x57d878.clientY);
  });
  _0x469735.addEventListener("contextmenu", _0x28f5c8 => {
    if (_0x28f5c8.defaultPrevented) {
      return;
    }
    const _0x2a6fb2 = _0x28f5c8.target.closest(".v2-node");
    const _0x48d2f8 = _0x28f5c8.target.closest(".v2-canvas-stage");
    if (!_0x2a6fb2 && !_0x48d2f8) {
      return;
    }
    const _0x3646ae = getEditableTextTarget(_0x28f5c8.target);
    if (!_0x3646ae && _0x28f5c8.target.closest(TEXT_CONTEXT_MENU_TARGET_SELECTOR)) {
      return;
    }
    _0x28f5c8.preventDefault();
    _0x28f5c8.stopPropagation();
    const _0x1aeecb = window.getSelection();
    if (!_0x2a6fb2 && _0x1aeecb && !_0x1aeecb.isCollapsed) {
      try {
        _0x1aeecb.removeAllRanges();
      } catch {}
    }
    const _0x91dcc = _0x1aeecb ? _0x1aeecb.toString().trim() : "";
    let _0x9dfe15 = false;
    if (_0x1aeecb && _0x91dcc && _0x1aeecb.rangeCount > 0 && !_0x1aeecb.isCollapsed) {
      const _0x3ef99e = _0x28f5c8.target;
      for (let _0x2de1be = 0; _0x2de1be < _0x1aeecb.rangeCount; _0x2de1be++) {
        const _0x41ede8 = _0x1aeecb.getRangeAt(_0x2de1be);
        try {
          if (_0x41ede8.intersectsNode(_0x3ef99e)) {
            _0x9dfe15 = true;
            break;
          }
        } catch {}
      }
    }
    if (_0x91dcc && _0x9dfe15) {
      canvasContextMenuController.handleTextContextMenu(_0x28f5c8.clientX, _0x28f5c8.clientY, _0x91dcc, {
        anchorNodeId: _0x2a6fb2?.dataset?.nodeId || _0x2a6fb2?.id || null,
        pasteTarget: _0x3646ae,
        pasteSelection: _0x3646ae ? captureEditableSelection(_0x3646ae) : null
      });
      return;
    }
    if (_0x3646ae) {
      showTextInputContextMenu({
        target: _0x3646ae,
        screenX: _0x28f5c8.clientX,
        screenY: _0x28f5c8.clientY,
        snapshot: captureEditableSelection(_0x3646ae)
      });
      return;
    }
    if (_0x2a6fb2) {
      handleContextMenu(_0x28f5c8.clientX, _0x28f5c8.clientY);
      return;
    }
    canvasContextMenuController.showCanvasContextMenu(_0x28f5c8.clientX, _0x28f5c8.clientY);
  });
  initCanvasContextMenu._showPicker = _0x2bb6b6;
}
export function handleTextContextMenu(_0x5bfdef, _0x33ed7f, _0x1d9cd7, _0x489150 = {}) {
  return canvasContextMenuController.handleTextContextMenu(_0x5bfdef, _0x33ed7f, _0x1d9cd7, _0x489150);
}