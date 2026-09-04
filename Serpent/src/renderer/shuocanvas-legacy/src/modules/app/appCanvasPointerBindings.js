import { findClosestNode, getViewportScreenCenter, hitTestNode, worldToScreen } from "../../core/math.js";
import { getShortcuts } from "../shortcuts.js";
import { CANVAS_WHEEL_BEHAVIOR_PAN, readCanvasWheelBehavior } from "../settings/canvasControlSettings.js";
const CANVAS_UI_EXCLUSION_SELECTOR = ".header, .sidebar-floating, .canvas-controls-floating, .empty-hint, .fab-btn, .mascot-wrap, .node-add-menu, .minimap-wrapper, [data-ui-stop=\"1\"]";
const CANVAS_PAN_OVERLAY_SELECTOR = ".side-plus-btn";
const ACTIVE_WHITEBOARD_INTERACTION_SELECTOR = ".whiteboard-node-component.is-whiteboard-editing";
function selectVideoInteractionLockState(_0x4fc406 = {}) {
  const _0x29fcca = _0x4fc406.videoKeying || null;
  const _0x5259d8 = _0x4fc406.videoClip || null;
  const _0x7f7ef = _0x29fcca?.active ? _0x29fcca : _0x5259d8?.active ? _0x5259d8 : null;
  return {
    active: !!_0x7f7ef?.active,
    nodeId: _0x7f7ef?.nodeId || null
  };
}
function getInitialState(_0x2e12d9) {
  if (typeof _0x2e12d9?.getState === "function") {
    return _0x2e12d9.getState() || {};
  }
  return {};
}
function subscribeSelectorOrPrime(_0x21d19a, _0x4f1305, _0x153b6e) {
  if (typeof _0x21d19a?.subscribeSelector === "function") {
    return _0x21d19a.subscribeSelector(_0x4f1305, _0x153b6e);
  }
  _0x153b6e(_0x4f1305(getInitialState(_0x21d19a)));
  return () => {};
}
function subscribeRawOrPrime(_0x23b204, _0x564ff2) {
  if (typeof _0x23b204?.subscribeRaw === "function") {
    return _0x23b204.subscribeRaw(_0x564ff2);
  }
  _0x564ff2(getInitialState(_0x23b204));
  return () => {};
}
function getRequiredInteractionFunction(_0x27b179, _0x506585) {
  const _0x16e2ce = _0x27b179?.[_0x506585];
  if (typeof _0x16e2ce !== "function") {
    throw new TypeError("[appCanvasPointerBindings] missing interaction." + _0x506585);
  }
  return _0x16e2ce;
}
export function createCanvasPointerStateCache({
  graphStore: _0x42c613,
  uiStore: _0x5d380e
} = {}) {
  const _0xc0bff0 = {
    nodes: {},
    videoInteractionLock: null,
    pickerVisible: false,
    annotateActive: false
  };
  const _0x410baf = [subscribeRawOrPrime(_0x42c613, _0xf4c08a => {
    _0xc0bff0.nodes = _0xf4c08a?.nodes || {};
  }), subscribeSelectorOrPrime(_0x5d380e, selectVideoInteractionLockState, _0x4e3fc7 => {
    _0xc0bff0.videoInteractionLock = _0x4e3fc7?.active ? _0x4e3fc7 : null;
  }), subscribeSelectorOrPrime(_0x5d380e, _0x5501d1 => !!_0x5501d1.picker?.visible, _0x3f001f => {
    _0xc0bff0.pickerVisible = !!_0x3f001f;
  }), subscribeSelectorOrPrime(_0x5d380e, _0x1fea95 => !!_0x1fea95.annotate?.active, _0x2ed001 => {
    _0xc0bff0.annotateActive = !!_0x2ed001;
  })];
  return {
    cache: _0xc0bff0,
    dispose() {
      _0x410baf.forEach(_0x5a5d51 => _0x5a5d51?.());
    }
  };
}
function isVideoInteractionLocked(_0xfa3c95) {
  return !!_0xfa3c95.videoInteractionLock?.active;
}
function isPanoramaEditing(_0x6f0863) {
  const _0x43f28b = _0x6f0863?.type === "panorama-360" ? _0x6f0863?.panorama360Node : _0x6f0863?.sceneNode;
  return (_0x6f0863?.type === "panorama-scene" || _0x6f0863?.type === "panorama-360") && _0x6f0863?.isCollapsed !== true && _0x43f28b?.ui?.isEditing === true;
}
function blurActiveEditableForCanvasPointer(_0xe1a117, _0x41f24e) {
  if (!_0xe1a117) {
    return;
  }
  if (_0xe1a117.closest?.("input, textarea, [contenteditable='true']")) {
    return;
  }
  const _0x20d426 = _0x41f24e?.activeElement;
  if (!_0x20d426) {
    return;
  }
  const _0x28c3a6 = _0x20d426.tagName === "INPUT" || _0x20d426.tagName === "TEXTAREA" || _0x20d426.contentEditable === "true";
  if (_0x28c3a6 && typeof _0x20d426.blur === "function") {
    _0x20d426.blur();
  }
}
function isScrollableTextEditWheel(_0x52ae8e, _0x599740) {
  const _0x4e2806 = _0x52ae8e?.closest?.(".source-text-content");
  if (!_0x4e2806 || _0x599740?.activeElement !== _0x4e2806) {
    return false;
  }
  return _0x4e2806.scrollHeight > _0x4e2806.clientHeight;
}
function getWheelDeltaScale(_0x4f844b, _0x460bf4) {
  if (_0x4f844b === 1) {
    return 16;
  }
  if (_0x4f844b === 2) {
    return Math.max(1, Number(_0x460bf4) || 800);
  }
  return 1;
}
function normalizeWheelDelta(_0x49b55c, _0x80cbe0, _0x2f03e6) {
  const _0x172eaf = Number(_0x49b55c);
  if (!Number.isFinite(_0x172eaf)) {
    return 0;
  }
  return _0x172eaf * getWheelDeltaScale(_0x80cbe0, _0x2f03e6);
}
export function resolveCanvasWheelGesture(_0x3eac8c, _0x291b3f = readCanvasWheelBehavior(), _0x162b3f = {}) {
  const _0x1b42e5 = _0x291b3f === CANVAS_WHEEL_BEHAVIOR_PAN ? "pan" : "zoom";
  const _0x47881b = Number(_0x3eac8c?.deltaMode) || 0;
  const _0x1797f9 = Number(_0x3eac8c?.deltaX) || 0;
  const _0x15e47c = Number(_0x3eac8c?.deltaY) || 0;
  if (_0x1b42e5 !== "pan" || _0x3eac8c?.ctrlKey || _0x3eac8c?.metaKey) {
    const _0x3fd401 = _0x15e47c || _0x1797f9;
    return {
      type: "zoom",
      deltaY: _0x3fd401
    };
  }
  if (_0x3eac8c?.shiftKey) {
    const _0x4a132c = _0x1797f9 || _0x15e47c;
    return {
      type: "pan",
      deltaX: normalizeWheelDelta(_0x4a132c, _0x47881b, _0x162b3f.width),
      deltaY: 0
    };
  }
  return {
    type: "pan",
    deltaX: normalizeWheelDelta(_0x1797f9, _0x47881b, _0x162b3f.width),
    deltaY: normalizeWheelDelta(_0x15e47c, _0x47881b, _0x162b3f.height)
  };
}
function getElementComputedStyle(_0x34a4c3, _0x3a0c75) {
  const _0xb17ce8 = _0x34a4c3?.ownerDocument?.defaultView?.getComputedStyle || _0x3a0c75?.getComputedStyle;
  if (typeof _0xb17ce8 !== "function") {
    return null;
  }
  try {
    return _0xb17ce8.call(_0x34a4c3?.ownerDocument?.defaultView || _0x3a0c75, _0x34a4c3);
  } catch {
    return null;
  }
}
function isScrollableOverflowValue(_0x2a5eae) {
  return _0x2a5eae === "auto" || _0x2a5eae === "scroll" || _0x2a5eae === "overlay";
}
export function findScrollableWheelAncestor(_0x176da9, _0x523dd4, _0x1043fe) {
  let _0x471b68 = _0x176da9?.nodeType === 3 ? _0x176da9.parentElement : _0x176da9;
  while (_0x471b68 && _0x471b68 !== _0x523dd4) {
    const _0x17fbc3 = Number(_0x471b68.scrollHeight) > Number(_0x471b68.clientHeight);
    const _0x4a1be0 = Number(_0x471b68.scrollWidth) > Number(_0x471b68.clientWidth);
    if (_0x4a1be0 || _0x17fbc3) {
      const _0x268f67 = getElementComputedStyle(_0x471b68, _0x1043fe);
      const _0x3cbbfc = _0x268f67?.overflow;
      const _0x609865 = _0x17fbc3 && (isScrollableOverflowValue(_0x268f67?.overflowY) || isScrollableOverflowValue(_0x3cbbfc));
      const _0x29dfad = _0x4a1be0 && (isScrollableOverflowValue(_0x268f67?.overflowX) || isScrollableOverflowValue(_0x3cbbfc));
      if (_0x29dfad || _0x609865) {
        return _0x471b68;
      }
    }
    _0x471b68 = _0x471b68.parentElement || null;
  }
  return null;
}
function isCanvasPanSurfaceTarget(_0x5167cd, _0x26fd02) {
  if (!_0x5167cd || !_0x26fd02) {
    return false;
  }
  if (_0x26fd02.contains?.(_0x5167cd)) {
    return true;
  }
  return !!_0x5167cd.closest?.(CANVAS_PAN_OVERLAY_SELECTOR);
}
function isActiveWhiteboardInteractionTarget(_0x50682f) {
  return !!_0x50682f?.closest?.(ACTIVE_WHITEBOARD_INTERACTION_SELECTOR);
}
function normalizeModifierShortcutToken(_0x37ecb5) {
  const _0x5cf758 = String(_0x37ecb5 || "").trim().toLowerCase();
  if (_0x5cf758 === "ctrl" || _0x5cf758 === "control" || _0x5cf758 === "meta") {
    return "Ctrl";
  }
  if (_0x5cf758 === "shift") {
    return "Shift";
  }
  if (_0x5cf758 === "alt" || _0x5cf758 === "option") {
    return "Alt";
  }
  return "";
}
function isPointerModifierShortcutActive(_0x361a28, _0x81572c, _0x2e45c8) {
  const _0x3694e4 = getShortcuts?.()?.[_0x81572c]?.keys;
  const _0x414c11 = Array.isArray(_0x3694e4) && _0x3694e4.length > 0 ? _0x3694e4 : [_0x2e45c8];
  if (_0x414c11.length !== 1) {
    return false;
  }
  const _0x4e3f41 = normalizeModifierShortcutToken(_0x414c11[0]);
  if (_0x4e3f41 === "Ctrl") {
    return !!_0x361a28?.ctrlKey || !!_0x361a28?.metaKey;
  }
  if (_0x4e3f41 === "Shift") {
    return _0x361a28?.shiftKey === true;
  }
  if (_0x4e3f41 === "Alt") {
    return _0x361a28?.altKey === true;
  }
  return false;
}
function createLastPointerTracker(_0x1325f6, _0x71e51d = {}) {
  const _0x31853c = getViewportScreenCenter(_0x71e51d, Number(_0x1325f6?.innerWidth) || 0, Number(_0x1325f6?.innerHeight) || 0);
  const _0x528059 = {
    x: _0x31853c.x,
    y: _0x31853c.y
  };
  function _0x333ddf() {
    if (!_0x1325f6) {
      return;
    }
    _0x1325f6._lastMx = _0x528059.x;
    _0x1325f6._lastMy = _0x528059.y;
  }
  function _0x15cd96(_0x18bcea) {
    _0x528059.x = _0x18bcea.clientX;
    _0x528059.y = _0x18bcea.clientY;
    _0x333ddf();
  }
  _0x333ddf();
  return {
    updateFromEvent: _0x15cd96,
    getCursorScreenPosition() {
      return {
        x: _0x528059.x,
        y: _0x528059.y
      };
    }
  };
}
export function installAppCanvasPointerBindings({
  graphStore: _0x2fb5ac,
  uiStore: _0x1482fb,
  wrap: _0x3556b7,
  appViewport: _0x5b0f71,
  interaction: _0x1011c3,
  targetWindow = typeof window === "undefined" ? null : window,
  targetDocument = typeof document === "undefined" ? null : document,
  getCanvasWheelBehavior = readCanvasWheelBehavior
} = {}) {
  const _0x2db9c0 = getRequiredInteractionFunction(_0x1011c3, "getDragContext");
  const _0x21a35b = getRequiredInteractionFunction(_0x1011c3, "handlePointerDown");
  const _0x46f0f8 = getRequiredInteractionFunction(_0x1011c3, "handlePointerMove");
  const _0x5b19ee = getRequiredInteractionFunction(_0x1011c3, "handlePointerUp");
  const _0x212265 = getRequiredInteractionFunction(_0x1011c3, "handleWheel");
  const _0x5880c4 = getRequiredInteractionFunction(_0x1011c3, "handleWheelPan");
  const _0x5b8ab9 = typeof _0x1011c3?.settleWheelZoom === "function" ? _0x1011c3.settleWheelZoom : null;
  const _0x4e8b3e = typeof _0x1011c3?.settleWheelPan === "function" ? _0x1011c3.settleWheelPan : null;
  const _0x1cb038 = getRequiredInteractionFunction(_0x1011c3, "initConnectionHandles");
  const _0x50c87e = getRequiredInteractionFunction(_0x1011c3, "initPickConnect");
  const _0x131afd = createCanvasPointerStateCache({
    graphStore: _0x2fb5ac,
    uiStore: _0x1482fb
  });
  const {
    cache: _0x3ee818
  } = _0x131afd;
  const _0x101410 = createLastPointerTracker(targetWindow, _0x2fb5ac?.getState?.()?.viewport || {});
  const _0x147d81 = [];
  let _0x4c19b8 = null;
  let _0xda426d = false;
  function _0x5a5113() {
    return targetDocument?.getElementById?.("v2-wrap") || _0x3556b7 || null;
  }
  function _0x16263f(_0x5a9316, _0x547938, _0x1ae692, _0x227501) {
    if (!_0x5a9316 || typeof _0x5a9316.addEventListener !== "function") {
      return;
    }
    _0x5a9316.addEventListener(_0x547938, _0x1ae692, _0x227501);
    _0x147d81.push(() => _0x5a9316.removeEventListener?.(_0x547938, _0x1ae692, _0x227501));
  }
  function _0x5077b4() {
    const _0x5e028d = _0x2db9c0();
    return _0x4c19b8 != null || !!_0x5e028d?.isPanning || !!_0x5e028d?.isDragging || !!_0x5e028d?.isConnecting || !!_0x5e028d?.isBoxSelecting || !!_0x5e028d?.isDraggingCell;
  }
  function _0x2356d9(_0x3dfaed, _0x9dcb78) {
    const _0x5e2991 = resolveCanvasWheelGesture(_0x3dfaed, getCanvasWheelBehavior?.(), {
      width: Number(targetWindow?.innerWidth) || 0,
      height: Number(targetWindow?.innerHeight) || 0
    });
    const _0x222155 = _0x5e2991.type === "zoom" ? _0x5e2991.deltaY !== 0 : _0x5e2991.deltaX !== 0 || _0x5e2991.deltaY !== 0;
    if (!_0x222155) {
      return false;
    }
    _0x3dfaed.preventDefault();
    _0x3dfaed.__aiCanvasWheelHandled = true;
    if (isVideoInteractionLocked(_0x3ee818)) {
      return true;
    }
    if (_0x5e2991.type === "zoom") {
      _0x4e8b3e?.();
      _0x5b0f71?.clearTrackedFocus?.("wheel-zoom");
      _0x212265(_0x3dfaed.clientX, _0x3dfaed.clientY, _0x5e2991.deltaY, _0x9dcb78);
    } else {
      _0x5b8ab9?.();
      _0x5b0f71?.clearTrackedFocus?.("wheel-pan");
      _0x5880c4(_0x5e2991.deltaX, _0x5e2991.deltaY, _0x9dcb78);
    }
    return true;
  }
  if (targetWindow) {
    targetWindow._mathImports = {
      findClosestNode: findClosestNode,
      worldToScreen: worldToScreen,
      hitTestNode: hitTestNode
    };
  }
  const _0x48cd41 = _0x5a5113();
  _0x50c87e(_0x48cd41);
  _0x1cb038(_0x48cd41);
  _0x16263f(targetWindow, "pointerdown", _0x529157 => {
    if (_0x529157.button === 0 || _0x529157.button === 1 || _0x529157.button === 2) {
      _0x5b8ab9?.();
      _0x4e8b3e?.();
    }
    const _0x7c7950 = _0x5a5113();
    if (!isCanvasPanSurfaceTarget(_0x529157.target, _0x7c7950)) {
      return;
    }
    if (isActiveWhiteboardInteractionTarget(_0x529157.target)) {
      if (_0x529157.button === 0 || _0x529157.button === 1) {
        _0x5b0f71?.clearTrackedFocus?.("whiteboard-geometry-start");
      }
      return;
    }
    const _0x513fa9 = _0x529157.target?.closest?.(".panorama-scene-viewport");
    if (_0x513fa9) {
      const _0x280993 = _0x513fa9.closest(".v2-node");
      const _0x5ca955 = _0x280993?.id || "";
      const _0x269434 = _0x5ca955 ? _0x3ee818.nodes?.[_0x5ca955] : null;
      if (isPanoramaEditing(_0x269434)) {
        return;
      }
    }
    const _0x1c2b05 = _0x3ee818.videoInteractionLock;
    if (_0x1c2b05?.active) {
      const _0x1d491a = _0x1c2b05.nodeId ? targetDocument?.getElementById?.(_0x1c2b05.nodeId) : null;
      if (_0x1d491a && _0x1d491a.contains(_0x529157.target)) {
        return;
      }
      _0x529157.preventDefault();
      _0x529157.stopPropagation();
      return;
    }
    const _0x374ec9 = _0x529157.button === 1 || targetWindow?._spaceHeld && _0x529157.button === 0;
    if (!_0x374ec9) {
      return;
    }
    _0x529157.preventDefault();
    _0x529157.stopPropagation();
    _0x5b0f71?.clearTrackedFocus?.("pan-start");
    if (targetWindow?._spaceHeld) {
      _0x7c7950.style.cursor = "var(--grab-cursor)";
    }
    const _0x5d50fc = _0x2db9c0();
    const _0x2722f5 = !!_0x5d50fc?.isDragging;
    try {
      _0x7c7950.setPointerCapture(_0x529157.pointerId);
      _0x4c19b8 = _0x529157.pointerId;
    } catch {}
    if (!_0x2722f5) {
      _0x21a35b(_0x529157.clientX, _0x529157.clientY, true, false, _0x529157);
    }
  }, {
    capture: true
  });
  _0x16263f(_0x3556b7, "pointerdown", _0x9b5850 => {
    _0x101410.updateFromEvent(_0x9b5850);
    if (isActiveWhiteboardInteractionTarget(_0x9b5850.target)) {
      return;
    }
    const _0x4358ee = _0x9b5850.target?.closest?.(CANVAS_UI_EXCLUSION_SELECTOR);
    if (_0x4358ee) {
      return;
    }
    blurActiveEditableForCanvasPointer(_0x9b5850.target, targetDocument);
    _0x1482fb?.hideContextMenu?.();
    const _0x2a6fa4 = _0x3ee818.videoInteractionLock;
    if (_0x2a6fa4?.active) {
      const _0x4a7479 = _0x2a6fa4.nodeId ? targetDocument?.getElementById?.(_0x2a6fa4.nodeId) : null;
      if (!_0x4a7479 || !_0x4a7479.contains(_0x9b5850.target)) {
        return;
      }
      return;
    }
    const _0x4779ff = isPointerModifierShortcutActive(_0x9b5850, "duplicate-with-edges", "Alt") && !targetWindow?._spaceHeld;
    if (_0x3ee818.pickerVisible) {
      _0x1482fb?.hidePicker?.();
      return;
    }
    if (_0x9b5850.button === 0 || _0x9b5850.button === 1) {
      _0x5b0f71?.clearTrackedFocus?.("canvas-geometry-start");
    }
    _0x21a35b(_0x9b5850.clientX, _0x9b5850.clientY, false, _0x4779ff, _0x9b5850);
    if (_0x4c19b8 != null) {
      return;
    }
    const _0x3c88a2 = _0x2db9c0();
    if (_0x3c88a2.isPanning) {
      _0x5b0f71?.clearTrackedFocus?.("pan-start");
    }
    if (_0x3c88a2.isPanning || _0x3c88a2.isConnecting || _0x3c88a2.isBoxSelecting || _0x3c88a2.isDraggingCell) {
      try {
        _0x3556b7.setPointerCapture(_0x9b5850.pointerId);
        _0x4c19b8 = _0x9b5850.pointerId;
      } catch {}
    }
  });
  _0x16263f(_0x3556b7, "dblclick", () => {});
  _0x16263f(_0x3556b7, "pointermove", _0x505451 => {
    _0x101410.updateFromEvent(_0x505451);
    if (isActiveWhiteboardInteractionTarget(_0x505451.target) && !_0x5077b4()) {
      return;
    }
    if (isVideoInteractionLocked(_0x3ee818)) {
      return;
    }
    if (_0xda426d && _0x2db9c0()?.isDragging) {
      _0x505451.__aiCanvasLeftDragHeld = true;
    }
    _0x46f0f8(_0x505451.clientX, _0x505451.clientY, _0x505451);
    if (_0x4c19b8 != null) {
      return;
    }
    const _0x30bbea = _0x2db9c0();
    if (_0x30bbea.isDragging && _0x30bbea.hasMoved) {
      try {
        _0x3556b7.setPointerCapture(_0x505451.pointerId);
        _0x4c19b8 = _0x505451.pointerId;
      } catch {}
    }
  });
  _0x16263f(_0x3556b7, "pointerup", _0x47e422 => {
    if (isVideoInteractionLocked(_0x3ee818)) {
      return;
    }
    const _0x525cd8 = _0x2db9c0();
    const _0x38f21e = !!_0x525cd8?.isDragging && _0x47e422.button !== 0 && (_0x47e422.buttons & 1) !== 0;
    if (_0x38f21e) {
      _0xda426d = true;
      _0x47e422.__aiCanvasLeftDragHeld = true;
      _0x46f0f8(_0x47e422.clientX, _0x47e422.clientY, _0x47e422);
      if (targetWindow?._spaceHeld) {
        _0x3556b7.style.cursor = "var(--grab-cursor)";
      }
      return;
    }
    _0xda426d = false;
    _0x4c19b8 = null;
    _0x5b19ee(_0x47e422.clientX, _0x47e422.clientY);
    if (targetWindow?._spaceHeld) {
      _0x3556b7.style.cursor = "var(--grab-cursor)";
    }
  });
  _0x16263f(_0x3556b7, "pointercancel", _0x9703b4 => {
    _0xda426d = false;
    _0x4c19b8 = null;
    if (isVideoInteractionLocked(_0x3ee818)) {
      return;
    }
    _0x5b19ee(_0x9703b4.clientX, _0x9703b4.clientY);
    if (targetWindow?._spaceHeld) {
      _0x3556b7.style.cursor = "var(--grab-cursor)";
    }
  });
  _0x16263f(targetDocument, "pointerup", _0x52e61b => {
    const _0x39f43f = _0x5a5113();
    const _0x442728 = _0x2db9c0();
    const _0x362e59 = !!_0x442728?.isDragging && _0x52e61b.button !== 0 && (_0x52e61b.buttons & 1) !== 0;
    if (_0x4c19b8 != null) {
      if (_0x362e59) {
        _0xda426d = true;
        _0x52e61b.__aiCanvasLeftDragHeld = true;
        _0x46f0f8(_0x52e61b.clientX, _0x52e61b.clientY, _0x52e61b);
        return;
      }
      _0xda426d = false;
      _0x4c19b8 = null;
      return;
    }
    if (_0x39f43f && _0x39f43f.contains(_0x52e61b.target)) {
      return;
    }
    if (_0x362e59) {
      _0xda426d = true;
      _0x52e61b.__aiCanvasLeftDragHeld = true;
      _0x46f0f8(_0x52e61b.clientX, _0x52e61b.clientY, _0x52e61b);
      return;
    }
    _0xda426d = false;
    _0x5b19ee();
    if (targetWindow?._spaceHeld && _0x39f43f) {
      _0x39f43f.style.cursor = "var(--grab-cursor)";
    }
  });
  _0x16263f(_0x3556b7, "wheel", _0x196983 => {
    if (_0x196983.__aiCanvasWheelHandled) {
      return;
    }
    _0x101410.updateFromEvent(_0x196983);
    const _0x5e7be9 = _0x196983.target;
    if (isActiveWhiteboardInteractionTarget(_0x5e7be9)) {
      return;
    }
    if (findScrollableWheelAncestor(_0x5e7be9, _0x3556b7, targetWindow)) {
      return;
    }
    const _0x309d3e = _0x5e7be9?.tagName;
    const _0x136e64 = _0x309d3e === "INPUT" || _0x309d3e === "TEXTAREA" || _0x5e7be9?.contentEditable === "true" || _0x5e7be9?.closest?.("[contenteditable=\"true\"]");
    if (_0x136e64 || isScrollableTextEditWheel(_0x5e7be9, targetDocument)) {
      return;
    }
    _0x2356d9(_0x196983, _0x5e7be9);
  }, {
    passive: false
  });
  _0x16263f(targetDocument, "wheel", _0x22e56d => {
    if (_0x22e56d.ctrlKey || _0x22e56d.metaKey) {
      _0x22e56d.preventDefault();
    }
    const _0x41c2ed = _0x22e56d.target;
    if (!_0x41c2ed) {
      return;
    }
    _0x101410.updateFromEvent(_0x22e56d);
    const _0x437b96 = _0x41c2ed.closest?.(".side-plus-btn");
    const _0x5aa71d = _0x41c2ed.closest?.("#v2-conn-scissor-btn") || _0x41c2ed.closest?.(".conn-scissor-btn");
    if (!_0x437b96 && !_0x5aa71d) {
      return;
    }
    if (_0x3ee818.annotateActive) {
      return;
    }
    _0x2356d9(_0x22e56d, _0x41c2ed);
  }, {
    passive: false,
    capture: true
  });
  _0x16263f(_0x3556b7, "mousedown", _0x48204a => {
    if (_0x48204a.button === 1) {
      _0x48204a.preventDefault();
    }
  });
  return {
    getCursorScreenPosition: _0x101410.getCursorScreenPosition,
    dispose() {
      _0x147d81.splice(0).forEach(_0x35b364 => _0x35b364());
      _0x131afd.dispose();
    }
  };
}