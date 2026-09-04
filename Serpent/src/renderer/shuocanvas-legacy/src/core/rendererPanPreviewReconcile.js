import { getInteractionRenderState } from "./interaction.js";
import { getViewportPanPreview, VIEWPORT_PAN_PREVIEW_FRAME_EVENT } from "./viewportPanPreview.js";
import { readViewportInteractionState } from "./viewportInteractionState.js";
import { getRendererStructuralReconcileDelayMs, RENDERER_VIRTUALIZATION_CONFIG } from "./rendererVirtualization.js";
import { resolveViewportInteractionReconcileDelay } from "./rendererInteractionRenderPolicy.js";
import { isRendererRuntimeDiagnosticsEnabled, recordRendererRuntimeDiagnostic } from "./rendererRuntimeDiagnostics.js";
const DENSE_PAN_PREVIEW_RECONCILE_INTERVAL_MS = 96;
const DENSE_PAN_PREVIEW_HIGH_ZOOM_BUCKET_PX = 240;
function getWindowLike() {
  if (typeof window !== "undefined") {
    return window;
  } else {
    return globalThis;
  }
}
function requestFrame(_0x4f7b29) {
  const _0x659538 = getWindowLike();
  if (typeof _0x659538?.requestAnimationFrame === "function") {
    return _0x659538.requestAnimationFrame(_0x4f7b29);
  }
  return setTimeout(() => _0x4f7b29(Date.now()), 16);
}
function cancelFrame(_0x47228a) {
  const _0x4b8eb1 = getWindowLike();
  if (typeof _0x4b8eb1?.cancelAnimationFrame === "function") {
    _0x4b8eb1.cancelAnimationFrame(_0x47228a);
    return;
  }
  clearTimeout(_0x47228a);
}
function normalizeViewport(_0x5cb154, _0x13ea4a = null) {
  const _0x281f77 = _0x5cb154 && typeof _0x5cb154 === "object" ? _0x5cb154 : {};
  const _0x13639c = _0x13ea4a && typeof _0x13ea4a === "object" ? _0x13ea4a : {};
  const _0x3bcd66 = Number(_0x281f77.x);
  const _0x4c7c7d = Number(_0x281f77.y);
  const _0x4effe5 = Number(_0x281f77.zoom);
  const _0x9fc440 = Number(_0x13639c.x);
  const _0x452513 = Number(_0x13639c.y);
  const _0x2489fc = Number(_0x13639c.zoom);
  const _0x546cb6 = Number.isFinite(_0x4effe5) ? _0x4effe5 : Number.isFinite(_0x2489fc) ? _0x2489fc : 1;
  return {
    x: Number.isFinite(_0x3bcd66) ? _0x3bcd66 : Number.isFinite(_0x9fc440) ? _0x9fc440 : 0,
    y: Number.isFinite(_0x4c7c7d) ? _0x4c7c7d : Number.isFinite(_0x452513) ? _0x452513 : 0,
    zoom: _0x546cb6 > 0 ? _0x546cb6 : 1
  };
}
function nowMs() {
  if (typeof performance !== "undefined" && performance && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function quantizeSigned(_0x4f197c, _0x4416f1) {
  const _0x26c3fa = Math.max(1, Number(_0x4416f1) || 1);
  return Math.trunc(Number(_0x4f197c || 0) / _0x26c3fa) * _0x26c3fa;
}
function getDensePanPreviewBucket(_0x2d10d6, _0x48ada5) {
  const _0x1b4017 = Number(_0x2d10d6?.zoom) || 1;
  const _0x3069c9 = Number(_0x48ada5) || 0;
  if (_0x3069c9 < RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return null;
  }
  const _0x2f40be = _0x1b4017 <= RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomThreshold && _0x3069c9 >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount;
  const _0x1f8f79 = _0x1b4017 <= RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold && _0x3069c9 >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount;
  const _0x4475a9 = _0x2f40be ? 192 : _0x1f8f79 ? 64 : DENSE_PAN_PREVIEW_HIGH_ZOOM_BUCKET_PX;
  return {
    key: quantizeSigned(_0x2d10d6.x, _0x4475a9) + ":" + quantizeSigned(_0x2d10d6.y, _0x4475a9) + ":" + _0x1b4017.toFixed(3),
    bucketSize: _0x4475a9
  };
}
function addNodeAndChildren(_0x273079, _0x55c458, _0x4b79d4) {
  if (!_0x55c458 || _0x273079.has(_0x55c458)) {
    return;
  }
  _0x273079.add(_0x55c458);
  const _0x265414 = _0x4b79d4?.[_0x55c458];
  if (!_0x265414) {
    return;
  }
  const _0x31edcc = _0x265414 instanceof Set ? _0x265414 : Array.isArray(_0x265414) ? _0x265414 : [];
  for (const _0x373e21 of _0x31edcc) {
    addNodeAndChildren(_0x273079, _0x373e21, _0x4b79d4);
  }
}
function collectActiveDragNodeIds({
  dragContext: _0x5310d8,
  selectedNodeIds: _0x21984e,
  parentToChildren: _0x1be812
} = {}) {
  const _0x199f7c = new Set();
  if (!_0x5310d8?.isDragging || _0x5310d8.isCommittingDrag === true) {
    return _0x199f7c;
  }
  const _0x20b746 = _0x5310d8.targetNodeId || null;
  const _0x47883d = Array.isArray(_0x21984e) ? _0x21984e : [];
  const _0x1c4fb3 = _0x20b746 && _0x47883d.includes(_0x20b746) ? _0x47883d : _0x20b746 ? [_0x20b746] : [];
  for (const _0x3ae46f of _0x1c4fb3) {
    addNodeAndChildren(_0x199f7c, _0x3ae46f, _0x1be812);
  }
  return _0x199f7c;
}
function omitNodeIds(_0x109e15, _0x3299eb) {
  if (!_0x3299eb || _0x3299eb.size === 0) {
    return _0x109e15;
  }
  const _0x31574a = {};
  for (const [_0x5a8f7f, _0x248346] of Object.entries(_0x109e15 || {})) {
    if (!_0x3299eb.has(_0x5a8f7f)) {
      _0x31574a[_0x5a8f7f] = _0x248346;
    }
  }
  return _0x31574a;
}
export function createRendererPanPreviewReconciler({
  canvasEl: _0x2c88b7,
  svgWrapper: _0x571410,
  getSnapshot: _0x788f74,
  hasPendingStoreRender: _0x19f1b3,
  markBusy: _0x4fd327,
  renderViewport: _0xfe10c,
  renderNodes: _0x23cd16,
  buildSelectionRelatedSets: _0x585c45,
  normalizeSelectionRelatedHighlightColor: _0x3cd67b,
  hasPriorityMediaWork: _0x477c00,
  scheduleDeferredReconcile: _0x428767
} = {}) {
  const _0x1e3e30 = getWindowLike();
  const _0x474c00 = isRendererRuntimeDiagnosticsEnabled();
  let _0x348fac = null;
  let _0x1907d0 = null;
  let _0xbf1dd6 = "";
  let _0x31813d = 0;
  function _0x169c46() {
    if (_0x348fac !== null) {
      cancelFrame(_0x348fac);
      _0x348fac = null;
    }
    _0x1907d0 = null;
  }
  function _0xe02743(_0x4cdc13, _0x3b493e, {
    allowIdleViewportOnly = false
  } = {}) {
    if (!_0x4cdc13 || !_0x3b493e) {
      return null;
    }
    const _0x4ac9ab = getInteractionRenderState();
    const _0x19dad8 = readViewportInteractionState({
      interactionState: _0x4ac9ab
    });
    const _0x2444f7 = _0x19dad8.isViewportBusy ? _0x19dad8 : readViewportInteractionState({
      interactionState: _0x4ac9ab,
      panPreviewActive: true
    });
    if (!allowIdleViewportOnly && !_0x2444f7.isPanning && !_0x2444f7.isZooming && !_0x2444f7.isViewportAnimating) {
      return null;
    }
    const _0x463f1a = typeof _0x4cdc13._nodeCount === "number" ? _0x4cdc13._nodeCount : Object.keys(_0x4cdc13.nodes || {}).length;
    const _0x5b1ea3 = _0x2444f7.isViewportAnimating || _0x2444f7.isZooming && !_0x2444f7.isPanning;
    const _0x48827e = _0x2444f7.isPanning && !_0x5b1ea3 ? getDensePanPreviewBucket(_0x3b493e, _0x463f1a) : null;
    if (_0x48827e) {
      const _0x159f90 = nowMs();
      if (_0x48827e.key === _0xbf1dd6 && _0x159f90 - _0x31813d < DENSE_PAN_PREVIEW_RECONCILE_INTERVAL_MS) {
        if (_0x474c00) {
          recordRendererRuntimeDiagnostic({
            kind: "pan-preview-reconcile-skip",
            nodeCount: _0x463f1a,
            bucketKey: _0x48827e.key
          });
        }
        return {
          skipped: true,
          hasPendingStructuralOps: false,
          nodeCount: _0x463f1a
        };
      }
      _0xbf1dd6 = _0x48827e.key;
      _0x31813d = _0x159f90;
    } else {
      _0xbf1dd6 = "";
      _0x31813d = 0;
    }
    _0x4fd327?.();
    _0xfe10c?.(_0x2c88b7, _0x3b493e, _0x4cdc13.ui?.titleFollowsCanvasZoom === true);
    if (_0x571410?.style?.display === "none") {
      _0x571410.style.display = "";
    }
    const _0x2737ef = _0x4cdc13.ui?.selectionRelatedHighlightEnabled === false ? {
      relatedNodeIds: new Set(),
      relatedEdgeIds: new Set()
    } : _0x585c45?.(_0x4cdc13.selectedNodeIds, _0x4cdc13.edges) || {
      relatedNodeIds: new Set(),
      relatedEdgeIds: new Set()
    };
    const _0xda231e = _0x3cd67b?.(_0x4cdc13.ui?.selectionRelatedHighlightColor);
    const _0x5c1066 = collectActiveDragNodeIds({
      dragContext: _0x4ac9ab,
      selectedNodeIds: _0x4cdc13.selectedNodeIds,
      parentToChildren: _0x4cdc13._parentToChildren
    });
    const _0x20a4b0 = omitNodeIds(_0x4cdc13.nodes, _0x5c1066);
    _0x477c00;
    const _0x2573bd = false;
    const _0x3f03d3 = false;
    const _0x1d58f3 = true;
    const _0x1a51e7 = _0x474c00 ? nowMs() : 0;
    const _0x512d04 = _0x474c00 ? nowMs() : 0;
    const _0x5bf9da = _0x23cd16?.(_0x2c88b7, _0x20a4b0, _0x4cdc13.selectedNodeIds, _0x2737ef.relatedNodeIds, _0xda231e, _0x4cdc13.connOverlay, _0x4cdc13.pickConnectMode, _0x3b493e, _0x4cdc13.edges, _0x4cdc13._parentToChildren, _0x4cdc13.ui && typeof _0x4cdc13.ui.showVideoMeta === "boolean" ? _0x4cdc13.ui.showVideoMeta : false, _0x4cdc13, {
      deferParking: true,
      previewOnly: _0x1d58f3,
      mode: _0x5b1ea3 ? "zoom-lod-preview" : "pan-preview",
      lockRasterParticipation: !_0x5b1ea3,
      suspendNewMediaSrc: !_0x3f03d3,
      viewportPriorityMediaOnly: _0x3f03d3
    });
    if (_0x474c00) {
      const _0x2e6675 = nowMs();
      recordRendererRuntimeDiagnostic({
        kind: "pan-preview-reconcile",
        nodeCount: _0x463f1a,
        previewOnly: _0x1d58f3,
        priorityMediaWork: _0x2573bd,
        renderNodesMs: _0x2e6675 - _0x512d04,
        durationMs: _0x2e6675 - _0x1a51e7,
        viewport: {
          ..._0x3b493e
        }
      });
    }
    const _0x572e10 = _0x5bf9da?.hasPendingStructuralOps === true;
    return {
      hasPendingStructuralOps: _0x572e10,
      priorityMediaWork: _0x2573bd,
      nodeCount: _0x463f1a
    };
  }
  function _0xa7020b(_0x1e5d69) {
    _0x1907d0 = _0x1e5d69 ? {
      ..._0x1e5d69
    } : null;
    if (_0x348fac !== null) {
      return;
    }
    _0x348fac = requestFrame(() => {
      _0x348fac = null;
      if (_0x19f1b3?.()) {
        const _0x3a0c0c = _0x1907d0;
        _0x1907d0 = null;
        if (_0x3a0c0c) {
          _0xa7020b(_0x3a0c0c);
        }
        return;
      }
      const _0x18c792 = _0x788f74?.();
      const _0x434c7b = _0x1907d0;
      _0x1907d0 = null;
      if (!_0x18c792) {
        return;
      }
      const _0x4a9757 = normalizeViewport(_0x434c7b || getViewportPanPreview(), _0x18c792.viewport);
      const _0x547c64 = _0xe02743(_0x18c792, _0x4a9757);
      if (_0x547c64?.hasPendingStructuralOps) {
        _0xa7020b(_0x4a9757);
      } else if (_0x547c64 && _0x547c64.skipped !== true) {
        _0x428767?.(resolveViewportInteractionReconcileDelay({
          hasPriorityMediaWork: _0x547c64.priorityMediaWork === true,
          fallbackDelayMs: getRendererStructuralReconcileDelayMs(_0x547c64.nodeCount)
        }));
      }
    });
  }
  const _0x5a16b3 = _0x3eda88 => {
    const _0x1138ce = _0x3eda88?.detail?.viewport || getViewportPanPreview() || null;
    if (!_0x1138ce) {
      return;
    }
    if (_0x19f1b3?.()) {
      _0xa7020b(_0x1138ce);
      return;
    }
    if (_0x348fac !== null) {
      cancelFrame(_0x348fac);
      _0x348fac = null;
      _0x1907d0 = null;
    }
    const _0x1a351f = _0x788f74?.();
    if (!_0x1a351f) {
      return;
    }
    const _0x2c44c6 = normalizeViewport(_0x1138ce, _0x1a351f.viewport);
    const _0x5db17f = _0xe02743(_0x1a351f, _0x2c44c6);
    if (_0x5db17f?.hasPendingStructuralOps) {
      _0xa7020b(_0x2c44c6);
    } else if (_0x5db17f && _0x5db17f.skipped !== true) {
      _0x428767?.(resolveViewportInteractionReconcileDelay({
        hasPriorityMediaWork: _0x5db17f.priorityMediaWork === true,
        fallbackDelayMs: getRendererStructuralReconcileDelayMs(_0x5db17f.nodeCount)
      }));
    }
  };
  _0x1e3e30?.addEventListener?.(VIEWPORT_PAN_PREVIEW_FRAME_EVENT, _0x5a16b3);
  return {
    reconcileViewportOnly(_0x3fee29, _0x2c4515) {
      return _0xe02743(_0x3fee29, _0x2c4515, {
        allowIdleViewportOnly: true
      });
    },
    dispose() {
      _0x169c46();
      _0xbf1dd6 = "";
      _0x31813d = 0;
      _0x1e3e30?.removeEventListener?.(VIEWPORT_PAN_PREVIEW_FRAME_EVENT, _0x5a16b3);
    }
  };
}