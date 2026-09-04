import a745_0x123b82 from "../core/stores/appStore.js";
import { computeNodesWorldBounds, computeViewportForWorldBounds, getViewportScreenOrigin, screenToViewportPoint } from "../core/math.js";
import { getBrowserViewportRect } from "../core/viewportFocus.js";
import { CANVAS_ZOOM_LIMITS, clampCanvasZoom } from "../core/canvasZoom.js";
import { jumpZoomPercentToViewportZoom } from "../modules/commentNoteJumpShortcut.js";
let _isAnimating = false;
function _getStateSnapshot() {
  if (typeof a745_0x123b82.getStateRaw === "function") {
    return a745_0x123b82.getStateRaw();
  } else {
    return a745_0x123b82.getState();
  }
}
function _getCurrentViewportRect() {
  const _0x1c5616 = typeof document !== "undefined" ? document.querySelector(".v2-canvas-stage") : null;
  return getBrowserViewportRect({
    containerEl: _0x1c5616,
    containerCoordinates: !!_0x1c5616
  });
}
function _resolveFocusTarget({
  nodes: _0x535fbd,
  nodeIds: _0x6117fc,
  padding = 0,
  fixedZoom = undefined,
  maxZoom = CANVAS_ZOOM_LIMITS.fitMax
}) {
  const _0x2042f9 = computeNodesWorldBounds(_0x535fbd, _0x6117fc);
  if (!_0x2042f9) {
    return null;
  }
  return computeViewportForWorldBounds(_0x2042f9, _getCurrentViewportRect(), {
    padding: padding,
    fixedZoom: fixedZoom,
    maxZoom: maxZoom,
    minZoom: CANVAS_ZOOM_LIMITS.fitMin
  });
}
export function getViewport() {
  return {
    ...(_getStateSnapshot().viewport || {})
  };
}
export function setViewport(_0xa0b0a8, _0x95794e, _0x35f755) {
  a745_0x123b82.updateViewport(_0xa0b0a8, _0x95794e, _0x35f755);
}
export function zoomAt(_0x9c16a1, _0x2f2a00, _0x224c34) {
  const {
    viewport: _0xe4e5f7
  } = _getStateSnapshot();
  const _0xf89894 = _0xe4e5f7.zoom;
  const _0x5e324a = clampCanvasZoom(_0x224c34);
  const _0x5761b1 = screenToViewportPoint(_0x9c16a1, _0x2f2a00, _0xe4e5f7);
  const _0x2669bb = (_0x5761b1.x - _0xe4e5f7.x) / _0xf89894;
  const _0x52d2f5 = (_0x5761b1.y - _0xe4e5f7.y) / _0xf89894;
  const _0x5f470a = _0x5761b1.x - _0x2669bb * _0x5e324a;
  const _0x56952d = _0x5761b1.y - _0x52d2f5 * _0x5e324a;
  a745_0x123b82.updateViewport(_0x5f470a, _0x56952d, _0x5e324a);
}
export function zoomBy(_0x2b7a74, _0x38aa4b, _0x25fa80) {
  const {
    viewport: _0x519710
  } = _getStateSnapshot();
  const _0x69783f = clampCanvasZoom(_0x519710.zoom + _0x25fa80);
  zoomAt(_0x2b7a74, _0x38aa4b, _0x69783f);
}
export function zoomIn(_0x4bdae7 = 0.1) {
  const _0x7c3ece = _getCurrentViewportRect();
  const _0x1b7901 = getViewportScreenOrigin(_getStateSnapshot().viewport);
  zoomBy(_0x7c3ece.centerX + _0x1b7901.x, _0x7c3ece.centerY + _0x1b7901.y, _0x4bdae7);
}
export function zoomOut(_0x2453dc = 0.1) {
  const _0x14921e = _getCurrentViewportRect();
  const _0x578241 = getViewportScreenOrigin(_getStateSnapshot().viewport);
  zoomBy(_0x14921e.centerX + _0x578241.x, _0x14921e.centerY + _0x578241.y, -_0x2453dc);
}
export function fitToCanvas(_0xfdab7f = 120, _0x1022b7 = 800) {
  const {
    nodes: _0x297b65,
    viewport: _0x62db4f
  } = _getStateSnapshot();
  const _0x21cdba = Object.keys(_0x297b65 || {});
  if (_0x21cdba.length === 0) {
    animateViewport(_0x62db4f.x, _0x62db4f.y, _0x62db4f.zoom, 0, 0, 1.1, _0x1022b7);
    return;
  }
  const _0x2b4301 = _resolveFocusTarget({
    nodes: _0x297b65,
    nodeIds: _0x21cdba,
    padding: _0xfdab7f,
    maxZoom: CANVAS_ZOOM_LIMITS.fitMax
  });
  if (!_0x2b4301) {
    return;
  }
  animateViewport(_0x62db4f.x, _0x62db4f.y, _0x62db4f.zoom, _0x2b4301.x, _0x2b4301.y, _0x2b4301.zoom, _0x1022b7);
}
export function focusOnNode(_0x4cc7c9, _0x3a26c1 = 120, _0x59dc43 = 800, _0x261774) {
  const {
    nodes: _0x43d151,
    viewport: _0x20fc18
  } = _getStateSnapshot();
  const _0x266a85 = _resolveFocusTarget({
    nodes: _0x43d151,
    nodeIds: [_0x4cc7c9],
    padding: _0x3a26c1,
    maxZoom: typeof _0x261774 === "number" ? _0x261774 : Number.isFinite(Number(_0x261774?.maxZoom)) ? Number(_0x261774.maxZoom) : CANVAS_ZOOM_LIMITS.fitMax
  });
  if (!_0x266a85) {
    console.warn("[useViewport] 节点 " + _0x4cc7c9 + " 不存在");
    return;
  }
  animateViewport(_0x20fc18.x, _0x20fc18.y, _0x20fc18.zoom, _0x266a85.x, _0x266a85.y, _0x266a85.zoom, _0x59dc43);
}
export function focusOnNodeAtZoom(_0x4a1e3c, _0x1a6ffa = 60, _0x263e50 = 800) {
  const {
    nodes: _0x95e1af,
    viewport: _0x4869e7
  } = _getStateSnapshot();
  const _0x36ee56 = _resolveFocusTarget({
    nodes: _0x95e1af,
    nodeIds: [_0x4a1e3c],
    fixedZoom: jumpZoomPercentToViewportZoom(_0x1a6ffa),
    maxZoom: CANVAS_ZOOM_LIMITS.fitMax
  });
  if (!_0x36ee56) {
    return;
  }
  animateViewport(_0x4869e7.x, _0x4869e7.y, _0x4869e7.zoom, _0x36ee56.x, _0x36ee56.y, _0x36ee56.zoom, _0x263e50);
}
export function animateViewport(_0x5c47b9, _0x19703d, _0x47e85a, _0x556a5b, _0x2b4082, _0x2cdc5a, _0x40d42c = 800) {
  if (_isAnimating) {
    return;
  }
  _isAnimating = true;
  const _0x8390d0 = performance.now();
  const _0xe4fcd2 = _0x5ea0a1 => 1 - Math.pow(1 - _0x5ea0a1, 3);
  function _0xeac241(_0x8f5674) {
    const _0x48a903 = _0x8f5674 - _0x8390d0;
    const _0x5b9fd6 = Math.min(_0x48a903 / _0x40d42c, 1);
    const _0xc15224 = _0xe4fcd2(_0x5b9fd6);
    const _0x28fce1 = _0x5c47b9 + (_0x556a5b - _0x5c47b9) * _0xc15224;
    const _0x16c92f = _0x19703d + (_0x2b4082 - _0x19703d) * _0xc15224;
    const _0x43fcaa = _0x47e85a + (_0x2cdc5a - _0x47e85a) * _0xc15224;
    a745_0x123b82.updateViewport(_0x28fce1, _0x16c92f, _0x43fcaa);
    if (_0x5b9fd6 < 1) {
      requestAnimationFrame(_0xeac241);
    } else {
      _isAnimating = false;
    }
  }
  requestAnimationFrame(_0xeac241);
}
export function isAnimating() {
  return _isAnimating;
}
export function subscribeToViewport(_0x497208) {
  return a745_0x123b82.subscribeSelector(_0x5d3508 => _0x5d3508.viewport, _0x36b897 => _0x497208(_0x36b897));
}
export function initViewportHook() {
  window.v2AnimateViewport = animateViewport;
  window.v2FocusOnNode = focusOnNode;
  window.v2FocusOnNodeAtZoom = focusOnNodeAtZoom;
}