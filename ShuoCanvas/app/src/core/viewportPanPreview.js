import { createPreviewCommitSession } from "../modules/interaction/previewCommitSession.js";
import { syncViewportGridDots } from "./viewportGridDots.js";
import { syncViewportZoomCssVars } from "./rendererViewportTransform.js";
const CANVAS_ID = "v2-canvas";
const SIDE_PLUS_HOLDER_ID = "v2-side-plus-holder";
export const VIEWPORT_PAN_PREVIEW_FRAME_EVENT = "aicanvas:viewport-pan-preview-frame";
let canvasEl = null;
let sidePlusHolderEl = null;
let sidePlusHolderInitialTransform = "";
let previewStartViewport = null;
function toFiniteNumber(_0x5bd14b, _0x2937be = 0) {
  const _0x187308 = Number(_0x5bd14b);
  if (Number.isFinite(_0x187308)) {
    return _0x187308;
  } else {
    return _0x2937be;
  }
}
function normalizeViewport(_0x270edc = {}) {
  const _0x497ef2 = toFiniteNumber(_0x270edc.zoom, 1);
  return {
    x: toFiniteNumber(_0x270edc.x, 0),
    y: toFiniteNumber(_0x270edc.y, 0),
    zoom: _0x497ef2 > 0 ? _0x497ef2 : 1
  };
}
function resolveCanvasEl(_0x5e01c1 = null) {
  if (_0x5e01c1) {
    return _0x5e01c1;
  }
  if (canvasEl) {
    return canvasEl;
  }
  if (typeof document === "undefined") {
    return null;
  }
  return document.getElementById?.(CANVAS_ID) || null;
}
function resolveSidePlusHolderEl(_0x400d67 = null) {
  if (_0x400d67) {
    return _0x400d67;
  }
  if (sidePlusHolderEl) {
    return sidePlusHolderEl;
  }
  if (typeof document === "undefined") {
    return null;
  }
  return document.getElementById?.(SIDE_PLUS_HOLDER_ID) || null;
}
function buildViewportTransform(_0x26f994) {
  return "translate3d(" + _0x26f994.x + "px, " + _0x26f994.y + "px, 0) scale(" + _0x26f994.zoom + ")";
}
function buildSidePlusPreviewTransform(_0x3a8f82) {
  if (!previewStartViewport) {
    return sidePlusHolderInitialTransform;
  }
  const _0x53f949 = _0x3a8f82.x - previewStartViewport.x;
  const _0x42a539 = _0x3a8f82.y - previewStartViewport.y;
  if (!_0x53f949 && !_0x42a539) {
    return sidePlusHolderInitialTransform;
  }
  return "translate3d(" + _0x53f949 + "px, " + _0x42a539 + "px, 0)";
}
function applySidePlusPreviewTransform(_0x302694) {
  const _0x4ee8eb = resolveSidePlusHolderEl();
  if (!_0x4ee8eb?.style) {
    return false;
  }
  const _0x74012b = resolveCanvasEl();
  if (_0x74012b?.contains?.(_0x4ee8eb)) {
    return false;
  }
  const _0x11dded = buildSidePlusPreviewTransform(_0x302694);
  if (_0x4ee8eb.style.transform !== _0x11dded) {
    _0x4ee8eb.style.transform = _0x11dded;
  }
  _0x4ee8eb._lastPanPreviewTransform = _0x11dded;
  return true;
}
function clearSidePlusPreviewTransform() {
  const _0x5a28ce = resolveSidePlusHolderEl();
  if (_0x5a28ce?.style) {
    _0x5a28ce.style.transform = sidePlusHolderInitialTransform;
    _0x5a28ce._lastPanPreviewTransform = "";
  }
  sidePlusHolderEl = null;
  sidePlusHolderInitialTransform = "";
}
function applyViewportTransform(_0xed9d8f) {
  const _0x5080c1 = resolveCanvasEl();
  if (!_0x5080c1) {
    return false;
  }
  const _0x23ab6d = buildViewportTransform(_0xed9d8f);
  if (_0x5080c1.style.transform !== _0x23ab6d) {
    _0x5080c1.style.transform = _0x23ab6d;
  }
  _0x5080c1._lastTransform = _0x23ab6d;
  syncViewportGridDots(_0x5080c1, _0xed9d8f);
  syncViewportZoomCssVars(_0xed9d8f.zoom);
  applySidePlusPreviewTransform(_0xed9d8f);
  return true;
}
function dispatchViewportPanPreviewFrame(_0x4b4f70) {
  const _0x44f5d7 = typeof window !== "undefined" ? window : null;
  if (!_0x44f5d7?.dispatchEvent) {
    return;
  }
  const _0xc83f4 = {
    viewport: {
      ..._0x4b4f70
    }
  };
  try {
    const _0x2e09f7 = typeof CustomEvent === "function" ? CustomEvent : null;
    _0x44f5d7.dispatchEvent(_0x2e09f7 ? new _0x2e09f7(VIEWPORT_PAN_PREVIEW_FRAME_EVENT, {
      detail: _0xc83f4
    }) : {
      type: VIEWPORT_PAN_PREVIEW_FRAME_EVENT,
      detail: _0xc83f4
    });
  } catch {}
}
const panPreviewSession = createPreviewCommitSession({
  applyPreview(_0x557ff1) {
    if (applyViewportTransform(_0x557ff1)) {
      dispatchViewportPanPreviewFrame(_0x557ff1);
    }
  }
});
export function beginViewportPanPreview(_0x3d306b, _0xbca682 = {}) {
  canvasEl = resolveCanvasEl(_0xbca682.canvasEl || null);
  sidePlusHolderEl = resolveSidePlusHolderEl(_0xbca682.sidePlusHolderEl || null);
  sidePlusHolderInitialTransform = sidePlusHolderEl?.style?.transform || "";
  const _0x1dcbab = normalizeViewport(_0x3d306b);
  previewStartViewport = _0x1dcbab;
  panPreviewSession.begin(_0x1dcbab);
}
export function updateViewportPanPreview(_0x463579, _0x55f52f, _0x2259f4) {
  if (!panPreviewSession.isActive()) {
    beginViewportPanPreview({
      x: _0x463579,
      y: _0x55f52f,
      zoom: _0x2259f4
    });
  }
  const _0xd860b5 = normalizeViewport({
    x: _0x463579,
    y: _0x55f52f,
    zoom: _0x2259f4
  });
  panPreviewSession.update(_0xd860b5);
}
export function getViewportPanPreview() {
  return panPreviewSession.getPreview();
}
export function flushViewportPanPreview() {
  const _0x2de76e = panPreviewSession.commit();
  previewStartViewport = null;
  canvasEl = null;
  clearSidePlusPreviewTransform();
  if (_0x2de76e) {
    return {
      ..._0x2de76e
    };
  } else {
    return null;
  }
}
export function cancelViewportPanPreview() {
  panPreviewSession.cancel();
  previewStartViewport = null;
  canvasEl = null;
  clearSidePlusPreviewTransform();
}
export function isViewportPanPreviewActive() {
  return panPreviewSession.isActive();
}