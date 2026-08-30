import { normalizeWebPreviewUrl } from "../modules/webPreviewUrl.js";
import { normalizeWebPreviewTabs } from "../modules/webPreviewTabs.js";
import { isViewportPanPreviewActive, VIEWPORT_PAN_PREVIEW_FRAME_EVENT } from "../core/viewportPanPreview.js";
import { readViewportInteractionState } from "../core/viewportInteractionState.js";
import { desktopBridge } from "./desktopBridge.js";
const SOFT_OCCLUSION_SELECTOR = ".header";
const HARD_OCCLUSION_SELECTOR = "#settingsOverlay, #aboutOverlay, #feedbackGroupOverlay, #v2PickerOverlay, #nodePickerOverlay, .settings-overlay, .save-dialog-overlay.open, .preset-modal-overlay, .custom-confirm-overlay, .v2-asset-sidebar-panel.show, .v2-workflow-sidebar-panel.show, .sidebar-floating #avatarMenu.open, .sidebar-floating .avatar-menu.open, .node-add-menu, .v2-node-picker, .canvas-proj-dropdown, .web-preview-image-picker-overlay";
const FULLSCREEN_OCCLUSION_SELECTOR = ".web-preview-image-picker-overlay, .v2-image-preview-overlay, .v2-material-comparison-overlay, .storyboard-3d-editor-overlay";
const CANVAS_NODE_OCCLUDER_SELECTOR = ".v2-node, .multi-stack-backplate.is-expanded-card, .multi-flyout-panel > *";
const OCCLUSION_OBSERVER_SELECTOR = [SOFT_OCCLUSION_SELECTOR, HARD_OCCLUSION_SELECTOR, ".sidebar-floating, .canvas-controls-floating, .minimap-wrapper, .save-dialog-overlay, .v2-asset-sidebar-panel, .v2-workflow-sidebar-panel, .v2-crop-overlay, .v2-annotate-overlay, .v2-matting-overlay, .v2-expand-overlay", FULLSCREEN_OCCLUSION_SELECTOR].join(", ");
const BACKGROUND_SYNC_INTERVAL_MS = 50;
const FINAL_INTERACTION_SYNC_DELAY_MS = 40;
const FREEZE_SETTLE_HOLD_MS = 360;
const PENDING_PAN_FREEZE_MS = 240;
const MIN_VISIBLE_INTERSECTION_SIZE = 16;
const SOFT_OCCLUSION_HIDE_RATIO = 0.35;
const FREEZE_ACTIVE_BODY_CLASS = "is-web-preview-freeze-active";
const FREEZE_SETTLING_BODY_CLASS = "is-web-preview-freeze-settling";
const WEB_PREVIEW_FREEZE_BODY_CLASSES = new Set([FREEZE_ACTIVE_BODY_CLASS, FREEZE_SETTLING_BODY_CLASS]);
const DOM_OCCLUSION_SAMPLE_RATIOS = [0.02, 0.1, 0.5, 0.9, 0.98];
const registeredSlotsByNodeId = new Map();
function normalizeNodeId(_0x1b7558) {
  return String(_0x1b7558 || "").trim();
}
function getViewKey(_0x4e8904 = {}) {
  return normalizeNodeId(_0x4e8904.nodeId) + "\n" + String(_0x4e8904.tabId || "").trim();
}
function getNowMs() {
  const _0x59a5e4 = globalThis.performance?.now?.();
  if (Number.isFinite(_0x59a5e4)) {
    return _0x59a5e4;
  } else {
    return Date.now();
  }
}
function readCanvasSpaceHeld() {
  return globalThis.window?._spaceHeld === true;
}
function getRequestAnimationFrame() {
  return globalThis.window?.requestAnimationFrame?.bind(globalThis.window) || (_0x1daa3c => setTimeout(_0x1daa3c, 16));
}
function getCancelAnimationFrame() {
  return globalThis.window?.cancelAnimationFrame?.bind(globalThis.window) || clearTimeout;
}
function rectIntersects(_0x4d6b86, _0xba5bda) {
  return _0x4d6b86.left < _0xba5bda.right && _0x4d6b86.right > _0xba5bda.left && _0x4d6b86.top < _0xba5bda.bottom && _0x4d6b86.bottom > _0xba5bda.top;
}
function getRectArea(_0x3a80d4) {
  return Math.max(0, Number(_0x3a80d4?.width) || 0) * Math.max(0, Number(_0x3a80d4?.height) || 0);
}
function getIntersectionArea(_0x150494, _0xba0aa1) {
  if (!rectIntersects(_0x150494, _0xba0aa1)) {
    return 0;
  }
  const _0x2745dd = Math.min(_0x150494.right, _0xba0aa1.right) - Math.max(_0x150494.left, _0xba0aa1.left);
  const _0x3faf2e = Math.min(_0x150494.bottom, _0xba0aa1.bottom) - Math.max(_0x150494.top, _0xba0aa1.top);
  return Math.max(0, _0x2745dd) * Math.max(0, _0x3faf2e);
}
function parseStackingZIndex(_0x11ebde) {
  const _0x185fd0 = String(_0x11ebde ?? "").trim();
  if (!_0x185fd0 || _0x185fd0 === "auto") {
    return 0;
  }
  const _0x158727 = Number.parseInt(_0x185fd0, 10);
  if (Number.isFinite(_0x158727)) {
    return _0x158727;
  } else {
    return 0;
  }
}
function getElementZIndex(_0xa5440b) {
  const _0x63351d = globalThis.window?.getComputedStyle?.(_0xa5440b);
  if (_0x63351d?.display === "none" || _0x63351d?.visibility === "hidden") {
    return null;
  }
  const _0x5248cd = Number(_0x63351d?.opacity);
  if (Number.isFinite(_0x5248cd) && _0x5248cd <= 0) {
    return null;
  }
  return parseStackingZIndex(_0x63351d?.zIndex || _0xa5440b?.style?.zIndex);
}
function getElementVisibleRect(_0x5aff5a) {
  if (!_0x5aff5a || _0x5aff5a.hidden || _0x5aff5a.isConnected === false) {
    return null;
  }
  const _0x1e3889 = globalThis.window?.getComputedStyle?.(_0x5aff5a);
  if (_0x1e3889?.display === "none" || _0x1e3889?.visibility === "hidden") {
    return null;
  }
  const _0x406800 = Number(_0x1e3889?.opacity);
  if (Number.isFinite(_0x406800) && _0x406800 <= 0) {
    return null;
  }
  const _0x27d5a8 = _0x5aff5a.getBoundingClientRect?.();
  if (!_0x27d5a8 || (Number(_0x27d5a8.width) || 0) <= 0 || (Number(_0x27d5a8.height) || 0) <= 0) {
    return null;
  }
  return _0x27d5a8;
}
function isPotentialNativeViewOccluderElement(_0xd8f4d5) {
  if (!_0xd8f4d5 || _0xd8f4d5.nodeType === 3 || _0xd8f4d5.hidden) {
    return false;
  }
  const _0x28bf86 = globalThis.window?.getComputedStyle?.(_0xd8f4d5);
  if (_0x28bf86?.display === "none" || _0x28bf86?.visibility === "hidden") {
    return false;
  }
  const _0x2338d4 = Number(_0x28bf86?.opacity);
  if (Number.isFinite(_0x2338d4) && _0x2338d4 <= 0) {
    return false;
  }
  const _0x52004e = String(_0x28bf86?.position || _0xd8f4d5?.style?.position || "").trim();
  const _0x33817a = parseStackingZIndex(_0x28bf86?.zIndex || _0xd8f4d5?.style?.zIndex);
  if (!["fixed", "sticky", "absolute"].includes(_0x52004e) && _0x33817a <= 0) {
    return false;
  }
  const _0x14a5de = _0xd8f4d5.getBoundingClientRect?.();
  if (!_0x14a5de || (Number(_0x14a5de.width) || 0) <= 0 || (Number(_0x14a5de.height) || 0) <= 0) {
    return false;
  }
  return hasVisibleViewportIntersection(_0x14a5de);
}
function getCanvasOccluderHostElement(_0x284c74) {
  try {
    if (_0x284c74?.matches?.(".v2-node")) {
      return _0x284c74;
    }
  } catch {}
  return _0x284c74?.closest?.(".v2-node") || null;
}
function getCanvasOccluderZIndex(_0x18cbf8, _0x5e59fc) {
  const _0x16e64e = getElementZIndex(_0x18cbf8);
  if (_0x16e64e === null) {
    return null;
  }
  if (!_0x5e59fc || _0x5e59fc === _0x18cbf8) {
    return _0x16e64e;
  }
  const _0x19d08a = getElementZIndex(_0x5e59fc);
  if (_0x19d08a === null) {
    return null;
  }
  return Math.max(_0x16e64e, _0x19d08a);
}
function collectCanvasNodeOccluders(_0x377fa6 = document) {
  const _0x45e176 = _0x377fa6.querySelectorAll?.(CANVAS_NODE_OCCLUDER_SELECTOR) || [];
  const _0x278cbf = [];
  for (const _0x139307 of _0x45e176) {
    const _0x4245ce = getElementVisibleRect(_0x139307);
    if (!_0x4245ce) {
      continue;
    }
    const _0x4aaa03 = getCanvasOccluderHostElement(_0x139307);
    const _0x35e185 = getCanvasOccluderZIndex(_0x139307, _0x4aaa03);
    if (_0x35e185 === null) {
      continue;
    }
    _0x278cbf.push({
      element: _0x139307,
      nodeId: normalizeNodeId(_0x4aaa03?.dataset?.nodeId || _0x139307?.dataset?.nodeId || _0x139307?.id),
      rect: _0x4245ce,
      zIndex: _0x35e185
    });
  }
  return _0x278cbf;
}
function getSlotHostNodeElement(_0x2449bd) {
  return _0x2449bd?.closest?.(".v2-node") || null;
}
function isOccludedByHigherCanvasNode(_0x324337, _0x53aa29, _0x15169c = []) {
  if (!_0x324337 || !_0x53aa29 || !_0x15169c.length) {
    return false;
  }
  const _0x3a2edf = getSlotHostNodeElement(_0x324337);
  const _0x2773f = normalizeNodeId(_0x324337?.dataset?.nodeId);
  const _0xfc43b1 = getElementZIndex(_0x3a2edf) ?? 0;
  for (const _0x255258 of _0x15169c) {
    if (!_0x255258?.element || _0x255258.element === _0x3a2edf) {
      continue;
    }
    if (_0x2773f && _0x255258.nodeId === _0x2773f) {
      continue;
    }
    if (_0x255258.zIndex <= _0xfc43b1) {
      continue;
    }
    if (rectIntersects(_0x53aa29, _0x255258.rect)) {
      return true;
    }
  }
  return false;
}
function getDomOcclusionSamplePoints(_0x395783) {
  const _0x2cc1f7 = globalThis.window || {};
  const _0x2b9659 = Number(_0x2cc1f7.innerWidth) || 0;
  const _0x1d317f = Number(_0x2cc1f7.innerHeight) || 0;
  if (_0x2b9659 <= 0 || _0x1d317f <= 0) {
    return [];
  }
  const _0x198e59 = Math.max(0, Number(_0x395783?.left) || 0);
  const _0x37bf57 = Math.max(0, Number(_0x395783?.top) || 0);
  const _0x216f59 = Math.min(_0x2b9659, Number(_0x395783?.right) || 0);
  const _0x5a4323 = Math.min(_0x1d317f, Number(_0x395783?.bottom) || 0);
  const _0x2c1569 = _0x216f59 - _0x198e59;
  const _0x23a30d = _0x5a4323 - _0x37bf57;
  if (_0x2c1569 < MIN_VISIBLE_INTERSECTION_SIZE || _0x23a30d < MIN_VISIBLE_INTERSECTION_SIZE) {
    return [];
  }
  const _0x49f6b8 = [];
  const _0x1c398c = new Set();
  for (const _0x4ac5ea of DOM_OCCLUSION_SAMPLE_RATIOS) {
    for (const _0x1170f2 of DOM_OCCLUSION_SAMPLE_RATIOS) {
      const _0x1ed08b = Math.round(_0x198e59 + _0x2c1569 * _0x1170f2);
      const _0xf58f97 = Math.round(_0x37bf57 + _0x23a30d * _0x4ac5ea);
      const _0x592f9 = _0x1ed08b + "," + _0xf58f97;
      if (_0x1c398c.has(_0x592f9)) {
        continue;
      }
      _0x1c398c.add(_0x592f9);
      _0x49f6b8.push({
        x: _0x1ed08b,
        y: _0xf58f97
      });
    }
  }
  return _0x49f6b8;
}
function getElementsFromPoint(_0x467e29, _0x1d3337, _0x3b147a) {
  const _0xa23890 = _0x467e29?.elementsFromPoint ? _0x467e29 : globalThis.document;
  const _0x5e42c8 = _0xa23890?.elementsFromPoint;
  if (typeof _0x5e42c8 !== "function") {
    return [];
  }
  try {
    return Array.from(_0x5e42c8.call(_0xa23890, _0x1d3337, _0x3b147a) || []);
  } catch {
    return [];
  }
}
function isDocumentRootHitElement(_0x3df6a2) {
  const _0x29b217 = String(_0x3df6a2?.tagName || "").toLowerCase();
  return _0x29b217 === "html" || _0x29b217 === "body";
}
function isRenderableHitElement(_0x36fd0c) {
  if (!_0x36fd0c || _0x36fd0c.nodeType && _0x36fd0c.nodeType !== 1) {
    return false;
  }
  if (isDocumentRootHitElement(_0x36fd0c) || _0x36fd0c.hidden) {
    return false;
  }
  const _0x4c0b4c = globalThis.window?.getComputedStyle?.(_0x36fd0c);
  if (_0x4c0b4c?.display === "none" || _0x4c0b4c?.visibility === "hidden") {
    return false;
  }
  const _0x13884b = Number(_0x4c0b4c?.opacity);
  return !Number.isFinite(_0x13884b) || !(_0x13884b <= 0);
}
function elementOwnsHit(_0x3d73c6, _0x10417c) {
  return Boolean(_0x3d73c6 && (_0x3d73c6 === _0x10417c || _0x3d73c6.contains?.(_0x10417c)));
}
function isOwnedByWebPreviewSlot(_0x4b6ab4, _0x4c10db) {
  if (!_0x4b6ab4 || !_0x4c10db) {
    return false;
  }
  const _0xd21c6a = getSlotHostNodeElement(_0x4c10db);
  return elementOwnsHit(_0x4c10db, _0x4b6ab4) || elementOwnsHit(_0xd21c6a, _0x4b6ab4);
}
function getTopRenderableHitElement(_0x4254f3 = []) {
  for (const _0x26e64d of _0x4254f3) {
    if (isRenderableHitElement(_0x26e64d)) {
      return _0x26e64d;
    }
  }
  return null;
}
function isOccludedByRendererStack(_0x4e9ed5, _0x446dc3, _0x541fd7 = document) {
  if (!_0x4e9ed5 || !_0x446dc3) {
    return false;
  }
  const _0x5a9742 = getDomOcclusionSamplePoints(_0x446dc3);
  if (!_0x5a9742.length) {
    return false;
  }
  for (const _0x3a0411 of _0x5a9742) {
    const _0x5e6940 = getTopRenderableHitElement(getElementsFromPoint(_0x541fd7, _0x3a0411.x, _0x3a0411.y));
    if (!_0x5e6940) {
      continue;
    }
    if (!isOwnedByWebPreviewSlot(_0x5e6940, _0x4e9ed5)) {
      return true;
    }
  }
  return false;
}
function hasVisibleViewportIntersection(_0x480269) {
  const _0x11ba27 = Number(_0x480269?.width) || 0;
  const _0x4f6bae = Number(_0x480269?.height) || 0;
  if (_0x11ba27 < 16 || _0x4f6bae < 16) {
    return false;
  }
  const _0x2eb947 = globalThis.window || {};
  const _0xdf603a = Number(_0x2eb947.innerWidth) || 0;
  const _0xe8c4c4 = Number(_0x2eb947.innerHeight) || 0;
  if (_0xdf603a <= 0 || _0xe8c4c4 <= 0) {
    return false;
  }
  const _0x389268 = Math.min(_0x480269.right, _0xdf603a) - Math.max(_0x480269.left, 0);
  const _0x18d7e3 = Math.min(_0x480269.bottom, _0xe8c4c4) - Math.max(_0x480269.top, 0);
  return _0x389268 >= MIN_VISIBLE_INTERSECTION_SIZE && _0x18d7e3 >= MIN_VISIBLE_INTERSECTION_SIZE;
}
function collectOcclusionRects(_0x292f60 = document, _0x9503b3 = SOFT_OCCLUSION_SELECTOR) {
  const _0x202dcf = _0x292f60.querySelectorAll?.(_0x9503b3) || [];
  const _0x466bd9 = [];
  for (const _0x567158 of _0x202dcf) {
    if (!_0x567158 || _0x567158.hidden) {
      continue;
    }
    const _0x40ef90 = globalThis.window?.getComputedStyle?.(_0x567158);
    if (_0x40ef90?.display === "none" || _0x40ef90?.visibility === "hidden") {
      continue;
    }
    const _0x2ba0f8 = Number(_0x40ef90?.opacity);
    if (Number.isFinite(_0x2ba0f8) && _0x2ba0f8 <= 0) {
      continue;
    }
    if (_0x40ef90?.pointerEvents === "none") {
      continue;
    }
    const _0xd63595 = _0x567158.getBoundingClientRect?.();
    if (_0xd63595) {
      _0x466bd9.push(_0xd63595);
    }
  }
  return _0x466bd9;
}
function isOccludedByRects(_0x163ee4, _0x1061dc = []) {
  return _0x1061dc.some(_0x46c562 => rectIntersects(_0x163ee4, _0x46c562));
}
function isSignificantlyOccludedByRects(_0x567046, _0x5aacdf = []) {
  const _0x1270ef = getRectArea(_0x567046);
  if (_0x1270ef <= 0) {
    return false;
  }
  let _0x1ae326 = 0;
  for (const _0x2ad6ed of _0x5aacdf) {
    _0x1ae326 += getIntersectionArea(_0x567046, _0x2ad6ed);
    if (_0x1ae326 / _0x1270ef >= SOFT_OCCLUSION_HIDE_RATIO) {
      return true;
    }
  }
  return false;
}
function nodeMatchesOcclusionSelector(_0x2a817d, {
  includeDescendants = true
} = {}) {
  if (!_0x2a817d || _0x2a817d.nodeType === 3) {
    return false;
  }
  try {
    if (typeof _0x2a817d.matches === "function" && _0x2a817d.matches(OCCLUSION_OBSERVER_SELECTOR)) {
      return true;
    }
    if (isPotentialNativeViewOccluderElement(_0x2a817d)) {
      return true;
    }
    if (includeDescendants) {
      return Boolean(_0x2a817d.querySelector?.(OCCLUSION_OBSERVER_SELECTOR));
    } else {
      return false;
    }
  } catch {
    return false;
  }
}
function isCanvasPanSurfaceTarget(_0x2e19aa) {
  if (!_0x2e19aa) {
    return false;
  }
  const _0x18def4 = globalThis.document?.getElementById?.("v2-wrap");
  if (_0x18def4?.contains?.(_0x2e19aa)) {
    return true;
  }
  return Boolean(_0x2e19aa.closest?.(".side-plus-btn"));
}
function isPotentialCanvasPanStartEvent(_0x386d54) {
  if (!isCanvasPanSurfaceTarget(_0x386d54?.target)) {
    return false;
  }
  const _0x2d4f02 = Number(_0x386d54?.button);
  if (_0x2d4f02 === 1) {
    return true;
  }
  return _0x2d4f02 === 0 && globalThis.window?._spaceHeld === true;
}
function isNativePanStartPreviewEvent(_0x414889) {
  return _0x414889?.type === "pan-start-preview";
}
function normalizeObservedClassName(_0x3f7cce = "") {
  return String(_0x3f7cce || "").split(/\s+/).map(_0x2f4de3 => _0x2f4de3.trim()).filter(_0xa56eec => _0xa56eec && !WEB_PREVIEW_FREEZE_BODY_CLASSES.has(_0xa56eec)).sort().join(" ");
}
function isOwnFreezeClassMutation(_0x17271b) {
  if (_0x17271b?.type !== "attributes" || _0x17271b?.attributeName !== "class") {
    return false;
  }
  if (_0x17271b.target !== globalThis.document?.body) {
    return false;
  }
  return normalizeObservedClassName(_0x17271b.oldValue) === normalizeObservedClassName(_0x17271b.target?.className);
}
function shouldSyncForOcclusionMutation(_0x296d22 = []) {
  for (const _0x141375 of _0x296d22) {
    if (isOwnFreezeClassMutation(_0x141375)) {
      continue;
    }
    if (_0x141375?.type === "attributes" && nodeMatchesOcclusionSelector(_0x141375?.target, {
      includeDescendants: false
    })) {
      return true;
    }
    if (_0x141375?.type === "childList" && nodeMatchesOcclusionSelector(_0x141375?.target, {
      includeDescendants: false
    })) {
      return true;
    }
    for (const _0x284ef8 of _0x141375?.addedNodes || []) {
      if (nodeMatchesOcclusionSelector(_0x284ef8)) {
        return true;
      }
    }
    for (const _0xac74e2 of _0x141375?.removedNodes || []) {
      if (nodeMatchesOcclusionSelector(_0xac74e2)) {
        return true;
      }
    }
  }
  return false;
}
function appendSlotToIndex(_0x2c725f, _0x4dce5d) {
  const _0x303b9c = _0x4dce5d?.dataset?.nodeId;
  if (!_0x303b9c) {
    return;
  }
  const _0x172d18 = _0x2c725f.get(_0x303b9c);
  if (_0x4dce5d.dataset.webPreviewFullscreen === "true") {
    _0x2c725f.set(_0x303b9c, _0x4dce5d);
    return;
  }
  if (!_0x172d18) {
    _0x2c725f.set(_0x303b9c, _0x4dce5d);
  }
}
function buildSlotIndex(_0x252efe = document, _0x16e069 = []) {
  const _0x5e26c6 = new Map();
  const _0xce4e86 = new Set();
  for (const _0x46c865 of registeredSlotsByNodeId.values()) {
    for (const _0x17af08 of _0x46c865) {
      if (!_0x17af08 || _0x17af08.isConnected === false || _0xce4e86.has(_0x17af08)) {
        continue;
      }
      _0xce4e86.add(_0x17af08);
      appendSlotToIndex(_0x5e26c6, _0x17af08);
    }
  }
  if (_0x16e069.length > 0 && _0x16e069.every(_0x2878a3 => _0x5e26c6.has(_0x2878a3))) {
    return _0x5e26c6;
  }
  const _0x437d23 = _0x252efe.querySelectorAll?.("[data-web-preview-slot='true']") || [];
  for (const _0x1e28f5 of _0x437d23) {
    if (!_0x1e28f5 || _0xce4e86.has(_0x1e28f5)) {
      continue;
    }
    _0xce4e86.add(_0x1e28f5);
    appendSlotToIndex(_0x5e26c6, _0x1e28f5);
  }
  return _0x5e26c6;
}
export function registerWebPreviewSlot(_0xe1b835, _0x465652) {
  const _0xc7b52b = normalizeNodeId(_0xe1b835);
  if (!_0xc7b52b || !_0x465652) {
    return () => {};
  }
  let _0x447f30 = registeredSlotsByNodeId.get(_0xc7b52b);
  if (!_0x447f30) {
    _0x447f30 = new Set();
    registeredSlotsByNodeId.set(_0xc7b52b, _0x447f30);
  }
  _0x447f30.add(_0x465652);
  return () => {
    const _0x41d482 = registeredSlotsByNodeId.get(_0xc7b52b);
    if (!_0x41d482) {
      return;
    }
    _0x41d482.delete(_0x465652);
    if (_0x41d482.size === 0) {
      registeredSlotsByNodeId.delete(_0xc7b52b);
    }
  };
}
export function _clearWebPreviewSlotRegistryForTest() {
  registeredSlotsByNodeId.clear();
}
function readGraphStoreState(_0x1cba06) {
  if (typeof _0x1cba06?.getStateRaw === "function") {
    return _0x1cba06.getStateRaw();
  } else {
    return _0x1cba06?.getState?.() || {};
  }
}
function hasActiveWebPreviewNodes(_0x6875d8 = {}) {
  return Object.values(_0x6875d8.nodes || {}).some(_0x5af992 => _0x5af992?.type === "web-preview" && normalizeWebPreviewTabs(_0x5af992).tabs.some(_0x20fd89 => normalizeWebPreviewUrl(_0x20fd89.url) || _0x20fd89.pendingPopup === true));
}
export function createWebPreviewNodeActivityTracker(_0x488e62) {
  const _0x4eb284 = readGraphStoreState(_0x488e62);
  let _0x286b97 = Number(_0x4eb284?._persistRev);
  let _0x56872c = Number.isFinite(_0x286b97);
  let _0x182a92 = hasActiveWebPreviewNodes(_0x4eb284);
  return {
    get hasActiveNodes() {
      return _0x182a92;
    },
    refresh(_0x4a2032) {
      const _0x582ad7 = _0x4a2032 || readGraphStoreState(_0x488e62);
      const _0xce5a6b = Number(_0x582ad7?._persistRev);
      const _0x4db539 = Number.isFinite(_0xce5a6b);
      if (!_0x4db539 || !_0x56872c || _0xce5a6b !== _0x286b97) {
        _0x182a92 = hasActiveWebPreviewNodes(_0x582ad7);
        _0x286b97 = _0xce5a6b;
        _0x56872c = _0x4db539;
      }
      return _0x182a92;
    }
  };
}
function normalizeCanvasZoom(_0x36b521) {
  const _0xddbddc = Number(_0x36b521);
  if (!Number.isFinite(_0xddbddc) || _0xddbddc <= 0) {
    return 1;
  }
  return Math.min(5, Math.max(0.25, _0xddbddc));
}
function isPendingPanFreezeActive(_0x2a1344) {
  return Number(_0x2a1344?.pendingPanFreezeUntil || 0) > getNowMs();
}
function clearPendingPanFreeze(_0x17fb75) {
  if (!_0x17fb75) {
    return;
  }
  if (_0x17fb75.pendingPanFreezeTimer) {
    clearTimeout(_0x17fb75.pendingPanFreezeTimer);
    _0x17fb75.pendingPanFreezeTimer = null;
  }
  _0x17fb75.pendingPanFreezeUntil = 0;
}
function startPendingPanFreeze(_0x9b9498) {
  if (!_0x9b9498) {
    return;
  }
  clearPendingPanFreeze(_0x9b9498);
  _0x9b9498.pendingPanFreezeUntil = getNowMs() + PENDING_PAN_FREEZE_MS;
  _0x9b9498.pendingPanFreezeTimer = setTimeout(() => {
    _0x9b9498.pendingPanFreezeTimer = null;
    _0x9b9498.pendingPanFreezeUntil = 0;
    _0x9b9498.scheduleFinalSync();
  }, PENDING_PAN_FREEZE_MS);
}
function getCanvasInteractionState(_0x440603) {
  const _0x49f855 = readViewportInteractionState({
    panPreviewActive: isViewportPanPreviewActive(),
    pendingPanFreezeActive: isPendingPanFreezeActive(_0x440603)
  });
  const _0x53c457 = _0x49f855.isViewportBusy;
  return {
    frozen: _0x53c457,
    deferZoomFactor: _0x49f855.isViewportAnimating || _0x49f855.isZooming,
    settleSnapshot: _0x49f855.isViewportAnimating,
    showSnapshot: _0x53c457
  };
}
function getSlotFullscreen(_0x216842) {
  return _0x216842?.dataset?.webPreviewFullscreen === "true";
}
function getSlotSnapshotComponent(_0x5c208b) {
  return _0x5c208b?.closest?.(".web-preview-component") || null;
}
function getSlotSnapshotReady(_0x853279, _0x5872d0 = "", {
  allowAnyToken = false
} = {}) {
  const _0x224e75 = getSlotSnapshotComponent(_0x853279);
  if (!_0x224e75?.classList?.contains?.("has-freeze-snapshot")) {
    return false;
  }
  if (allowAnyToken) {
    return true;
  }
  const _0x36d546 = String(_0x5872d0 || "").trim();
  if (!_0x36d546) {
    return true;
  }
  return getSlotSnapshotToken(_0x853279) === _0x36d546;
}
function getSlotSnapshotToken(_0x21f23a) {
  const _0x3cf4a5 = getSlotSnapshotComponent(_0x21f23a);
  if (!_0x3cf4a5?.classList?.contains?.("has-freeze-snapshot")) {
    return "";
  }
  return String(_0x3cf4a5?.dataset?.webPreviewSnapshotToken || "").trim();
}
function readPositiveNumber(_0x44d417) {
  const _0x374fd3 = Number(_0x44d417);
  if (Number.isFinite(_0x374fd3) && _0x374fd3 > 0) {
    return _0x374fd3;
  } else {
    return 0;
  }
}
function getSlotSnapshotMetrics(_0x4db4ca) {
  const _0x1cfaf9 = getSlotSnapshotComponent(_0x4db4ca);
  if (!_0x1cfaf9?.classList?.contains?.("has-freeze-snapshot")) {
    return null;
  }
  const _0xf0dec2 = _0x1cfaf9?.dataset || {};
  const _0x52b6d8 = readPositiveNumber(_0xf0dec2.webPreviewSnapshotWidth);
  const _0x3e50bf = readPositiveNumber(_0xf0dec2.webPreviewSnapshotHeight);
  const _0x3ec962 = readPositiveNumber(_0xf0dec2.webPreviewSnapshotZoomFactor);
  if (!_0x52b6d8 || !_0x3e50bf || !_0x3ec962) {
    return null;
  }
  return {
    width: _0x52b6d8,
    height: _0x3e50bf,
    zoomFactor: _0x3ec962
  };
}
function readySnapshotMatchesBounds(_0x52b62b, _0x2c7534, _0x27a682) {
  if (!_0x2c7534) {
    return false;
  }
  if (getSlotSnapshotToken(_0x52b62b) !== "ready") {
    return false;
  }
  const _0x112e40 = getSlotSnapshotMetrics(_0x52b62b);
  if (!_0x112e40) {
    return false;
  }
  const _0x349b61 = Math.round(_0x112e40.width) === Math.round(_0x2c7534.width);
  const _0xf26295 = Math.round(_0x112e40.height) === Math.round(_0x2c7534.height);
  const _0x22b49c = readPositiveNumber(_0x27a682) || 1;
  const _0x57d966 = Math.abs(_0x112e40.zoomFactor - _0x22b49c) < 0.001;
  return _0x349b61 && _0xf26295 && _0x57d966;
}
function getSlotSnapshotHold(_0x26ccc0) {
  return Boolean(getSlotSnapshotComponent(_0x26ccc0)?.classList?.contains?.("is-web-preview-loading"));
}
function buildViewPayload({
  node: _0x44c558,
  tabId: _0x56fb16,
  webUrl: _0x4e3e02,
  slot: _0x108846,
  active: _0x373a05,
  selected: _0x48c0bb,
  canvasZoom: _0xc54eda,
  interactionState: _0x13f2d8,
  freezeToken: _0x14440b,
  fullscreenBlockerRects: _0x52924d,
  softBlockerRects: _0x37d850,
  hardBlockerRects: _0x2d0acd,
  canvasNodeOccluders = [],
  root = document,
  canvasSpaceHeld = false,
  pendingPopup = false
}) {
  let _0x48657f = false;
  let _0x3f10ba = null;
  let _0x10ae1e = null;
  let _0x31b30d = false;
  let _0x413ae4 = false;
  let _0x469c7d = false;
  let _0x5cf5a3 = false;
  let _0x1b5995 = false;
  const _0x51d622 = getSlotFullscreen(_0x108846);
  if (_0x108846?.isConnected !== false) {
    const _0xdf9e4d = _0x108846?.getBoundingClientRect?.();
    _0x10ae1e = _0xdf9e4d || null;
    const _0x4941c1 = _0xdf9e4d ? {
      width: Math.round(_0xdf9e4d.width),
      height: Math.round(_0xdf9e4d.height)
    } : null;
    const _0x848c43 = Boolean(_0x51d622 || _0x48c0bb);
    _0x1b5995 = Boolean(_0xdf9e4d && !_0x51d622 && !_0x848c43 && readySnapshotMatchesBounds(_0x108846, _0x4941c1, _0xc54eda));
    const _0x34ca43 = _0xdf9e4d ? isOccludedByRects(_0xdf9e4d, _0x52924d) : false;
    _0x31b30d = _0xdf9e4d && !_0x51d622 ? isOccludedByRects(_0xdf9e4d, _0x2d0acd) : false;
    _0x413ae4 = _0xdf9e4d && !_0x51d622 ? isSignificantlyOccludedByRects(_0xdf9e4d, _0x37d850) : false;
    _0x469c7d = Boolean(_0xdf9e4d && !_0x51d622 && isOccludedByHigherCanvasNode(_0x108846, _0xdf9e4d, canvasNodeOccluders));
    _0x5cf5a3 = Boolean(_0xdf9e4d && !_0x51d622 && isOccludedByRendererStack(_0x108846, _0xdf9e4d, root));
    if (_0xdf9e4d && hasVisibleViewportIntersection(_0xdf9e4d) && !_0x34ca43 && !_0x31b30d && !_0x413ae4 && !_0x469c7d && !_0x5cf5a3 && !_0x1b5995) {
      _0x48657f = true;
      _0x3f10ba = {
        x: Math.round(_0xdf9e4d.left),
        y: Math.round(_0xdf9e4d.top),
        width: Math.round(_0xdf9e4d.width),
        height: Math.round(_0xdf9e4d.height)
      };
    }
  }
  const _0x3a8c80 = getSlotSnapshotHold(_0x108846);
  const _0x11d8a4 = Boolean((_0x31b30d || _0x413ae4 || _0x469c7d || _0x5cf5a3) && !_0x51d622);
  const _0xbb2b63 = Boolean(_0x11d8a4 || _0x1b5995);
  const _0x10013e = Boolean((_0x13f2d8.frozen || _0x3a8c80) && !_0x51d622 && _0x48657f || _0xbb2b63);
  const _0x5946d8 = _0xbb2b63 && _0x10ae1e && hasVisibleViewportIntersection(_0x10ae1e) ? {
    x: Math.round(_0x10ae1e.left),
    y: Math.round(_0x10ae1e.top),
    width: Math.round(_0x10ae1e.width),
    height: Math.round(_0x10ae1e.height)
  } : null;
  const _0x2be6b7 = Boolean(_0x11d8a4 && _0x13f2d8.frozen);
  const _0x200efa = _0x11d8a4 && _0x5946d8 ? _0x2be6b7 ? String(_0x14440b || "0") : ["occlusion", _0x5946d8.width, _0x5946d8.height, Number(_0xc54eda || 1).toFixed(3)].join(":") : "";
  const _0xb9a34c = _0x1b5995 && !_0x11d8a4 && _0x5946d8 ? ["passive", _0x5946d8.width, _0x5946d8.height, Number(_0xc54eda || 1).toFixed(3)].join(":") : "";
  const _0x2250b5 = _0x10013e ? _0x200efa || _0xb9a34c || String(_0x14440b || "0") : "";
  const _0xf6ef40 = Boolean(_0xbb2b63 || _0x10013e && (_0x13f2d8.showSnapshot || _0x3a8c80));
  const _0x460c56 = getSlotSnapshotToken(_0x108846);
  const _0x244c2f = Boolean(_0xf6ef40 && _0xbb2b63 && (_0x1b5995 || !_0x2be6b7 && readySnapshotMatchesBounds(_0x108846, _0x5946d8, _0xc54eda)));
  const _0xad2ee7 = Boolean(_0xf6ef40 && (!_0xbb2b63 || _0x2be6b7 || _0x244c2f));
  return {
    nodeId: _0x44c558.id,
    tabId: _0x56fb16,
    webUrl: _0x4e3e02,
    pendingPopup: pendingPopup,
    browserProfileId: _0x44c558.browserProfileId || "",
    active: _0x373a05,
    visible: _0x48657f,
    bounds: _0x3f10ba,
    snapshotBounds: _0x5946d8,
    zoomFactor: _0x51d622 ? 1 : _0xc54eda,
    deferZoomFactor: _0x51d622 ? false : _0x13f2d8.deferZoomFactor,
    frozen: _0x10013e,
    freezeToken: _0x2250b5,
    snapshotReady: _0xf6ef40 ? getSlotSnapshotReady(_0x108846, _0x2250b5, {
      allowAnyToken: _0xad2ee7
    }) : false,
    snapshotToken: _0x460c56,
    allowReusableSnapshot: _0xad2ee7,
    snapshotHold: _0x3a8c80,
    showSnapshot: _0xf6ef40,
    fullscreen: _0x51d622,
    selected: _0x48c0bb,
    canvasSpaceHeld: canvasSpaceHeld === true
  };
}
function syncCachedViewsForBudget(_0x2c90fe, _0x3cf897) {
  if (!_0x3cf897) {
    return _0x2c90fe;
  }
  const _0x83490 = getNowMs();
  const _0x5162ba = _0x2c90fe.some(_0x3b397f => _0x3b397f?.frozen || _0x3b397f?.deferZoomFactor);
  const _0x29b0ce = new Set(_0x2c90fe.map(getViewKey));
  for (const _0x21c830 of [..._0x3cf897.cachedViewsByNodeId.keys()]) {
    if (!_0x29b0ce.has(_0x21c830)) {
      _0x3cf897.cachedViewsByNodeId.delete(_0x21c830);
    }
  }
  if (!_0x5162ba) {
    _0x3cf897.lastBackgroundSyncAt = _0x83490;
    for (const _0x1c5c5d of _0x2c90fe) {
      _0x3cf897.cachedViewsByNodeId.set(getViewKey(_0x1c5c5d), _0x1c5c5d);
    }
    return _0x2c90fe;
  }
  const _0x49c570 = _0x83490 - _0x3cf897.lastBackgroundSyncAt >= BACKGROUND_SYNC_INTERVAL_MS;
  if (_0x49c570) {
    _0x3cf897.lastBackgroundSyncAt = _0x83490;
  }
  return _0x2c90fe.map(_0x1060d5 => {
    const _0x32142c = getViewKey(_0x1060d5);
    const _0x1ae5a1 = _0x3cf897.cachedViewsByNodeId.get(_0x32142c);
    const _0x75650f = _0x1060d5.frozen === true && _0x1060d5.visible === true && _0x1ae5a1?.visible === true && _0x1ae5a1?.bounds && _0x1ae5a1.webUrl === _0x1060d5.webUrl && _0x1ae5a1.pendingPopup === _0x1060d5.pendingPopup && _0x1ae5a1.active === _0x1060d5.active;
    if (_0x75650f) {
      const _0x2c05a6 = {
        ..._0x1ae5a1,
        selected: _0x1060d5.selected,
        zoomFactor: _0x1060d5.zoomFactor,
        deferZoomFactor: _0x1060d5.deferZoomFactor,
        frozen: true,
        freezeToken: _0x1060d5.freezeToken,
        snapshotReady: _0x1060d5.snapshotReady,
        snapshotToken: _0x1060d5.snapshotToken,
        allowReusableSnapshot: _0x1060d5.allowReusableSnapshot,
        snapshotHold: _0x1060d5.snapshotHold,
        showSnapshot: _0x1060d5.showSnapshot,
        syncPriority: _0x1ae5a1.frozen === true ? "background-throttled" : undefined
      };
      _0x3cf897.cachedViewsByNodeId.set(_0x32142c, _0x2c05a6);
      return _0x2c05a6;
    }
    const _0xd8ba7d = _0x49c570 && _0x1060d5.frozen !== true;
    const _0x2ed72f = _0x1060d5.deferZoomFactor === true && _0x1060d5.frozen !== true && _0x1060d5.visible === true;
    const _0x4dfa59 = _0x1060d5.fullscreen || _0x1060d5.selected && !_0x1060d5.frozen || _0x2ed72f || _0xd8ba7d || !_0x1ae5a1 || _0x1ae5a1.active !== _0x1060d5.active || _0x1ae5a1.webUrl !== _0x1060d5.webUrl || _0x1ae5a1.pendingPopup !== _0x1060d5.pendingPopup || _0x1ae5a1.visible !== _0x1060d5.visible || _0x1ae5a1.frozen !== _0x1060d5.frozen || _0x1ae5a1.freezeToken !== _0x1060d5.freezeToken || _0x1ae5a1.snapshotReady !== _0x1060d5.snapshotReady || _0x1ae5a1.snapshotToken !== _0x1060d5.snapshotToken || _0x1ae5a1.allowReusableSnapshot !== _0x1060d5.allowReusableSnapshot || _0x1ae5a1.snapshotHold !== _0x1060d5.snapshotHold;
    if (_0x4dfa59) {
      _0x3cf897.cachedViewsByNodeId.set(_0x32142c, _0x1060d5);
      return _0x1060d5;
    }
    return {
      ..._0x1ae5a1,
      webUrl: _0x1060d5.webUrl,
      pendingPopup: _0x1060d5.pendingPopup,
      active: _0x1060d5.active,
      selected: _0x1060d5.selected,
      zoomFactor: _0x1060d5.zoomFactor,
      deferZoomFactor: _0x1060d5.deferZoomFactor,
      frozen: _0x1060d5.frozen,
      freezeToken: _0x1060d5.freezeToken,
      snapshotReady: _0x1060d5.snapshotReady,
      snapshotToken: _0x1060d5.snapshotToken,
      allowReusableSnapshot: _0x1060d5.allowReusableSnapshot,
      snapshotHold: _0x1060d5.snapshotHold,
      showSnapshot: _0x1060d5.showSnapshot,
      syncPriority: "background-throttled"
    };
  });
}
function buildViewsSignature(_0x8e83f1 = []) {
  return _0x8e83f1.map(_0x10b2a7 => {
    const _0x5eb018 = _0x10b2a7?.bounds || {};
    return [_0x10b2a7?.nodeId || "", _0x10b2a7?.tabId || "", _0x10b2a7?.webUrl || "", _0x10b2a7?.pendingPopup === true ? 1 : 0, _0x10b2a7?.browserProfileId || "", _0x10b2a7?.active === true ? 1 : 0, _0x10b2a7?.visible === true ? 1 : 0, Number(_0x5eb018.x || 0), Number(_0x5eb018.y || 0), Number(_0x5eb018.width || 0), Number(_0x5eb018.height || 0), Number(_0x10b2a7?.zoomFactor || 1).toFixed(3), _0x10b2a7?.deferZoomFactor === true ? 1 : 0, _0x10b2a7?.frozen === true ? 1 : 0, _0x10b2a7?.freezeToken || "", _0x10b2a7?.snapshotReady === true ? 1 : 0, _0x10b2a7?.snapshotToken || "", _0x10b2a7?.allowReusableSnapshot === true ? 1 : 0, _0x10b2a7?.snapshotHold === true ? 1 : 0, _0x10b2a7?.showSnapshot === true ? 1 : 0, _0x10b2a7?.fullscreen === true ? 1 : 0, _0x10b2a7?.selected === true ? 1 : 0, _0x10b2a7?.canvasSpaceHeld === true ? 1 : 0].join(":");
  }).join("|");
}
function clearFinalSyncTimer(_0x5ddf49) {
  if (!_0x5ddf49?.finalSyncTimer) {
    return;
  }
  clearTimeout(_0x5ddf49.finalSyncTimer);
  _0x5ddf49.finalSyncTimer = null;
}
function setBodyClass(_0x1ca27d, _0x248281) {
  const _0x7913c8 = globalThis.document?.body?.classList;
  if (!_0x7913c8) {
    return;
  }
  const _0x38e777 = Boolean(_0x7913c8.contains?.(_0x1ca27d));
  if (_0x248281) {
    if (!_0x38e777) {
      _0x7913c8.add?.(_0x1ca27d);
    }
  } else if (_0x38e777) {
    _0x7913c8.remove?.(_0x1ca27d);
  }
}
function setFreezeActiveClass(_0x1e4651) {
  setBodyClass(FREEZE_ACTIVE_BODY_CLASS, _0x1e4651);
}
function setFreezeSettlingClass(_0x2eb349) {
  setBodyClass(FREEZE_SETTLING_BODY_CLASS, _0x2eb349);
}
function clearFreezeSettlingTimer(_0x3f21f0) {
  if (!_0x3f21f0?.freezeSettlingTimer) {
    return;
  }
  clearTimeout(_0x3f21f0.freezeSettlingTimer);
  _0x3f21f0.freezeSettlingTimer = null;
}
function scheduleFreezeSettlingClear(_0x1b109d) {
  if (!_0x1b109d) {
    return;
  }
  setFreezeSettlingClass(true);
  clearFreezeSettlingTimer(_0x1b109d);
  _0x1b109d.freezeSettlingUntil = getNowMs() + FREEZE_SETTLE_HOLD_MS;
  _0x1b109d.freezeSettlingTimer = setTimeout(() => {
    _0x1b109d.freezeSettlingTimer = null;
    _0x1b109d.freezeSettlingUntil = 0;
    setFreezeSettlingClass(false);
    if (!getCanvasInteractionState().frozen) {
      setFreezeActiveClass(false);
    }
    _0x1b109d.scheduleFinalSync();
  }, FREEZE_SETTLE_HOLD_MS);
}
function createSyncBudgetState(_0x3a8022) {
  const _0x3966d1 = {
    cachedViewsByNodeId: new Map(),
    finalSyncTimer: null,
    freezeSettlingTimer: null,
    freezeSettlingUntil: 0,
    freezeActive: false,
    snapshotFreezeActive: false,
    snapshotSettleActive: false,
    pendingPanFreezeTimer: null,
    pendingPanFreezeUntil: 0,
    canvasSpaceHeld: readCanvasSpaceHeld(),
    freezeToken: 0,
    lastBackgroundSyncAt: 0,
    lastViewsSignature: "",
    scheduleFinalSync() {
      clearFinalSyncTimer(_0x3966d1);
      _0x3966d1.finalSyncTimer = setTimeout(() => {
        _0x3966d1.finalSyncTimer = null;
        _0x3a8022();
      }, FINAL_INTERACTION_SYNC_DELAY_MS);
    }
  };
  return _0x3966d1;
}
function markInteractionTransition(_0x5f122d, _0x2f85cf) {
  if (!_0x5f122d) {
    return;
  }
  const _0xce4fa2 = Boolean(_0x2f85cf?.frozen);
  const _0x742842 = Boolean(_0x2f85cf?.showSnapshot);
  const _0x2ea38b = Boolean(_0x2f85cf?.settleSnapshot);
  const _0x433234 = _0xce4fa2 && !_0x5f122d.freezeActive;
  const _0x337e50 = _0xce4fa2 && _0x742842 && !_0x5f122d.snapshotFreezeActive;
  if (_0x433234 || _0x337e50) {
    clearFreezeSettlingTimer(_0x5f122d);
    _0x5f122d.freezeSettlingUntil = 0;
    setFreezeSettlingClass(false);
    _0x5f122d.freezeToken += 1;
    _0x5f122d.lastBackgroundSyncAt = 0;
  } else if (!_0xce4fa2 && _0x5f122d.freezeActive) {
    _0x5f122d.lastBackgroundSyncAt = 0;
    if (_0x5f122d.snapshotSettleActive) {
      scheduleFreezeSettlingClear(_0x5f122d);
    } else {
      _0x5f122d.freezeSettlingUntil = 0;
      setFreezeSettlingClass(false);
      setFreezeActiveClass(false);
      _0x5f122d.scheduleFinalSync();
    }
  }
  _0x5f122d.freezeActive = _0xce4fa2;
  _0x5f122d.snapshotFreezeActive = _0xce4fa2 && _0x742842;
  _0x5f122d.snapshotSettleActive = _0xce4fa2 && _0x2ea38b;
}
function getEffectiveInteractionState(_0x3be724, _0x3d9989) {
  const _0x5f13c4 = !_0x3be724?.frozen && Number(_0x3d9989?.freezeSettlingUntil || 0) > getNowMs();
  if (!_0x5f13c4) {
    return _0x3be724;
  }
  return {
    frozen: true,
    deferZoomFactor: true,
    settleSnapshot: true,
    showSnapshot: true
  };
}
function collectWebPreviewViews({
  graphStore: _0x4691da,
  root = document,
  freezeToken = 0,
  interactionState = getCanvasInteractionState(),
  canvasSpaceHeld = readCanvasSpaceHeld()
} = {}) {
  const _0x16570a = typeof _0x4691da?.getStateRaw === "function" ? _0x4691da.getStateRaw() : _0x4691da?.getState?.() || {};
  const _0x4f2964 = new Set(_0x16570a.selectedNodeIds || []);
  const _0x3cd42e = Object.values(_0x16570a.nodes || {}).filter(_0x52952b => _0x52952b?.type === "web-preview").map(_0x29a4c8 => {
    const _0x3874d5 = normalizeWebPreviewTabs(_0x29a4c8);
    return {
      node: _0x29a4c8,
      tabState: _0x3874d5,
      tabs: _0x3874d5.tabs.map(_0x1259e1 => ({
        tab: _0x1259e1,
        webUrl: normalizeWebPreviewUrl(_0x1259e1.url),
        pendingPopup: _0x1259e1.pendingPopup === true,
        active: _0x1259e1.id === _0x3874d5.activeTabId
      })).filter(_0xfab3a2 => _0xfab3a2.webUrl || _0xfab3a2.pendingPopup)
    };
  }).filter(_0x132ed5 => _0x132ed5.tabs.length > 0);
  const _0x11f12c = normalizeCanvasZoom(_0x16570a.viewport?.zoom);
  const _0x3a280e = buildSlotIndex(root, _0x3cd42e.map(_0x193441 => _0x193441.node.id));
  const _0x11023e = collectOcclusionRects(root, SOFT_OCCLUSION_SELECTOR);
  const _0x112f43 = collectOcclusionRects(root, HARD_OCCLUSION_SELECTOR);
  const _0x50d4bf = collectOcclusionRects(root, FULLSCREEN_OCCLUSION_SELECTOR);
  const _0xe92d06 = collectCanvasNodeOccluders(root);
  const _0x3b1308 = [];
  for (const {
    node: _0x3ebef0,
    tabs: _0x2306a0
  } of _0x3cd42e) {
    const _0x4395b7 = _0x3a280e.get(_0x3ebef0.id);
    for (const {
      tab: _0x1c1bf7,
      webUrl: _0x574e65,
      pendingPopup: _0x4c1dd5,
      active: _0x6c767a
    } of _0x2306a0) {
      _0x3b1308.push(buildViewPayload({
        node: _0x3ebef0,
        tabId: _0x1c1bf7.id,
        webUrl: _0x574e65,
        pendingPopup: _0x4c1dd5,
        slot: _0x6c767a ? _0x4395b7 : null,
        active: _0x6c767a,
        selected: _0x6c767a && _0x4f2964.has(_0x3ebef0.id),
        canvasZoom: _0x11f12c,
        interactionState: interactionState,
        freezeToken: freezeToken,
        canvasSpaceHeld: canvasSpaceHeld,
        fullscreenBlockerRects: _0x50d4bf,
        softBlockerRects: _0x11023e,
        hardBlockerRects: _0x112f43,
        canvasNodeOccluders: _0xe92d06,
        root: root
      }));
    }
  }
  _0x3b1308.sort((_0x4581a4, _0x50a921) => Number(_0x4581a4.selected) - Number(_0x50a921.selected));
  return _0x3b1308;
}
export function initWebPreviewViewSyncService({
  graphStore: _0x5ed1c0,
  root = document
} = {}) {
  const _0x195f3c = desktopBridge.webPreview;
  if (!_0x195f3c.isAvailable()) {
    return {
      dispose() {}
    };
  }
  const _0x21ade0 = getRequestAnimationFrame();
  const _0x4cd724 = getCancelAnimationFrame();
  const _0x560eb8 = typeof _0x195f3c.syncViewsFast === "function" ? _0x195f3c.syncViewsFast : _0x195f3c.syncViews;
  let _0x2c01fc = null;
  let _0x429e70 = false;
  const _0x241d7c = createWebPreviewNodeActivityTracker(_0x5ed1c0);
  let _0x332c14 = _0x241d7c.hasActiveNodes;
  let _0xe51595 = null;
  const _0x520d49 = () => {
    _0x2c01fc = null;
    if (_0x429e70) {
      return;
    }
    const _0x584da7 = getCanvasInteractionState(_0xe51595);
    markInteractionTransition(_0xe51595, _0x584da7);
    const _0x26b6be = getEffectiveInteractionState(_0x584da7, _0xe51595);
    const _0x2d1a09 = syncCachedViewsForBudget(collectWebPreviewViews({
      graphStore: _0x5ed1c0,
      root: root,
      freezeToken: _0xe51595?.freezeToken || 0,
      interactionState: _0x26b6be,
      canvasSpaceHeld: _0xe51595?.canvasSpaceHeld === true
    }), _0xe51595);
    setFreezeActiveClass(_0x2d1a09.some(_0x3a3887 => _0x3a3887?.showSnapshot === true));
    const _0x7babbc = buildViewsSignature(_0x2d1a09);
    if (_0x7babbc === _0xe51595?.lastViewsSignature) {
      return;
    }
    if (_0xe51595) {
      _0xe51595.lastViewsSignature = _0x7babbc;
    }
    try {
      const _0x587328 = _0x560eb8({
        views: _0x2d1a09
      });
      if (_0x587328 && typeof _0x587328.catch === "function") {
        _0x587328.catch(() => {});
      }
    } catch {}
  };
  const _0x3df0ee = () => {
    if (_0x429e70 || !_0x332c14 || _0x2c01fc !== null) {
      return;
    }
    _0x2c01fc = _0x21ade0(_0x520d49);
  };
  const _0x3fa859 = () => {
    if (_0x429e70) {
      return;
    }
    if (_0x2c01fc !== null) {
      _0x4cd724(_0x2c01fc);
      _0x2c01fc = null;
    }
    _0x520d49();
  };
  const _0x428baa = () => {
    const _0x3deacc = getCanvasInteractionState(_0xe51595);
    return _0x3deacc.frozen || _0x3deacc.deferZoomFactor || _0xe51595?.freezeActive === true || Number(_0xe51595?.freezeSettlingUntil || 0) > getNowMs();
  };
  const _0x2703aa = () => {
    if (_0x428baa()) {
      _0x3fa859();
      return;
    }
    _0x3df0ee();
  };
  const _0x274ba4 = () => {
    if (!_0x332c14) {
      return;
    }
    _0x3df0ee();
  };
  _0xe51595 = createSyncBudgetState(_0x3df0ee);
  const _0x558e26 = () => {
    if (!_0x332c14) {
      return;
    }
    if (isViewportPanPreviewActive()) {
      return;
    }
    _0x3df0ee();
  };
  const _0x69216 = () => {
    if (!_0x332c14) {
      return;
    }
    _0x3fa859();
  };
  const _0x3cdcce = () => {
    if (!_0x332c14) {
      return;
    }
    startPendingPanFreeze(_0xe51595);
    _0x3fa859();
  };
  const _0x39d4ac = _0xbdd9f3 => {
    if (!_0x332c14) {
      return;
    }
    if (isPotentialCanvasPanStartEvent(_0xbdd9f3)) {
      _0x3cdcce();
      return;
    }
    _0x3df0ee();
  };
  const _0x3bacd9 = () => {
    clearPendingPanFreeze(_0xe51595);
    _0x558e26();
  };
  const _0x2be117 = () => {
    if (!_0x332c14 || !_0xe51595) {
      return;
    }
    const _0x2d58fd = readCanvasSpaceHeld();
    if (_0xe51595.canvasSpaceHeld === _0x2d58fd) {
      return;
    }
    _0xe51595.canvasSpaceHeld = _0x2d58fd;
    _0x3fa859();
  };
  const _0x189149 = _0x2ca58d => {
    const _0x4006b3 = _0x332c14;
    _0x332c14 = _0x241d7c.refresh(_0x2ca58d);
    if (!_0x332c14) {
      if (_0x4006b3) {
        _0x3fa859();
      }
      return;
    }
    _0x2703aa();
  };
  const _0x4311cf = typeof _0x5ed1c0?.subscribeRaw === "function" ? _0x5ed1c0.subscribeRaw(_0x189149) : () => {};
  const _0x43b923 = typeof _0x195f3c.onEvent === "function" ? _0x195f3c.onEvent(_0x3fbf41 => {
    if (isNativePanStartPreviewEvent(_0x3fbf41)) {
      _0x3cdcce();
    }
    globalThis.window?.dispatchEvent?.(new CustomEvent("web-preview:native-event", {
      detail: _0x3fbf41
    }));
  }) : () => {};
  const _0x197126 = globalThis.window?.MutationObserver || globalThis.MutationObserver;
  const _0x9b3a86 = typeof _0x197126 === "function" ? new _0x197126(_0x47a243 => {
    if (!_0x332c14) {
      return;
    }
    if (shouldSyncForOcclusionMutation(_0x47a243)) {
      _0x274ba4();
    }
  }) : null;
  const _0x38eb78 = root?.body || root?.documentElement || root;
  try {
    _0x9b3a86?.observe?.(_0x38eb78, {
      attributes: true,
      attributeFilter: ["class", "style", "hidden"],
      attributeOldValue: true,
      childList: true,
      subtree: true
    });
  } catch {}
  globalThis.window?.addEventListener?.("resize", _0x3df0ee);
  globalThis.window?.addEventListener?.("scroll", _0x3df0ee, true);
  globalThis.window?.addEventListener?.(VIEWPORT_PAN_PREVIEW_FRAME_EVENT, _0x69216);
  globalThis.window?.addEventListener?.("pointerdown", _0x39d4ac, true);
  globalThis.window?.addEventListener?.("pointermove", _0x558e26);
  globalThis.window?.addEventListener?.("pointerup", _0x3bacd9);
  globalThis.window?.addEventListener?.("pointercancel", _0x3bacd9);
  globalThis.window?.addEventListener?.("keydown", _0x2be117);
  globalThis.window?.addEventListener?.("keyup", _0x2be117);
  globalThis.window?.addEventListener?.("blur", _0x2be117);
  globalThis.window?.addEventListener?.("wheel", _0x558e26, {
    passive: true
  });
  globalThis.window?.addEventListener?.("web-preview:force-sync", _0x3fa859);
  _0x3df0ee();
  return {
    dispose() {
      _0x429e70 = true;
      clearFinalSyncTimer(_0xe51595);
      clearFreezeSettlingTimer(_0xe51595);
      clearPendingPanFreeze(_0xe51595);
      if (_0xe51595) {
        _0xe51595.freezeSettlingUntil = 0;
      }
      setFreezeActiveClass(false);
      setFreezeSettlingClass(false);
      if (_0x2c01fc !== null) {
        _0x4cd724(_0x2c01fc);
      }
      _0x2c01fc = null;
      _0x4311cf?.();
      _0x43b923?.();
      globalThis.window?.removeEventListener?.("resize", _0x3df0ee);
      globalThis.window?.removeEventListener?.("scroll", _0x3df0ee, true);
      globalThis.window?.removeEventListener?.(VIEWPORT_PAN_PREVIEW_FRAME_EVENT, _0x69216);
      globalThis.window?.removeEventListener?.("pointerdown", _0x39d4ac, true);
      globalThis.window?.removeEventListener?.("pointermove", _0x558e26);
      globalThis.window?.removeEventListener?.("pointerup", _0x3bacd9);
      globalThis.window?.removeEventListener?.("pointercancel", _0x3bacd9);
      globalThis.window?.removeEventListener?.("keydown", _0x2be117);
      globalThis.window?.removeEventListener?.("keyup", _0x2be117);
      globalThis.window?.removeEventListener?.("blur", _0x2be117);
      globalThis.window?.removeEventListener?.("wheel", _0x558e26, {
        passive: true
      });
      globalThis.window?.removeEventListener?.("web-preview:force-sync", _0x3fa859);
      _0x9b3a86?.disconnect?.();
      _0x195f3c.disposeViews?.();
    }
  };
}
export { collectWebPreviewViews };