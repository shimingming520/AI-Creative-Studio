import { computeNodesWorldBounds, computeViewportForWorldBounds } from "./math.js";
import { jumpZoomPercentToViewportZoom } from "../modules/commentNoteJumpShortcut.js";
import { CANVAS_ZOOM_LIMITS } from "./canvasZoom.js";
function _getWindowObject(_0x374c0a) {
  if (_0x374c0a) {
    return _0x374c0a;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  return null;
}
function _getRaf() {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame.bind(globalThis);
  } else {
    return _0x52ebc1 => setTimeout(() => _0x52ebc1(Date.now()), 16);
  }
}
function _getCaf() {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    return globalThis.cancelAnimationFrame.bind(globalThis);
  } else {
    return _0x58f5ec => clearTimeout(_0x58f5ec);
  }
}
function _getDefaultViewport() {
  return {
    x: 0,
    y: 0,
    zoom: 1
  };
}
function _normalizeViewportRect(_0x46742e, _0x1f1a9e, _0x172dd6, _0xca46c5) {
  const _0x31e728 = Number.isFinite(Number(_0x46742e)) ? Number(_0x46742e) : 0;
  const _0x5bc3a6 = Number.isFinite(Number(_0x1f1a9e)) ? Number(_0x1f1a9e) : 0;
  const _0x58358f = Number.isFinite(Number(_0x172dd6)) ? Number(_0x172dd6) : 0;
  const _0x1a750f = Number.isFinite(Number(_0xca46c5)) ? Number(_0xca46c5) : 0;
  return {
    left: _0x31e728,
    top: _0x5bc3a6,
    width: _0x58358f,
    height: _0x1a750f,
    right: _0x31e728 + _0x58358f,
    bottom: _0x5bc3a6 + _0x1a750f,
    centerX: _0x31e728 + _0x58358f / 2,
    centerY: _0x5bc3a6 + _0x1a750f / 2
  };
}
export function getBrowserViewportRect({
  windowObject = undefined,
  containerEl = null,
  containerCoordinates = false
} = {}) {
  const _0x5ed77a = _getWindowObject(windowObject);
  if (containerCoordinates && containerEl && typeof containerEl.getBoundingClientRect === "function") {
    const _0x3d9735 = containerEl.getBoundingClientRect();
    if (Number.isFinite(Number(_0x3d9735?.width)) && Number.isFinite(Number(_0x3d9735?.height)) && Number(_0x3d9735.width) > 0 && Number(_0x3d9735.height) > 0) {
      return _normalizeViewportRect(0, 0, _0x3d9735.width, _0x3d9735.height);
    }
  }
  const _0x3a7733 = _0x5ed77a?.visualViewport || null;
  if (_0x3a7733 && Number.isFinite(Number(_0x3a7733.width)) && Number.isFinite(Number(_0x3a7733.height)) && Number(_0x3a7733.width) > 0 && Number(_0x3a7733.height) > 0) {
    return _normalizeViewportRect(_0x3a7733.offsetLeft, _0x3a7733.offsetTop, _0x3a7733.width, _0x3a7733.height);
  }
  if (containerEl && typeof containerEl.getBoundingClientRect === "function") {
    const _0xa01163 = containerEl.getBoundingClientRect();
    if (Number.isFinite(Number(_0xa01163?.width)) && Number.isFinite(Number(_0xa01163?.height)) && Number(_0xa01163.width) > 0 && Number(_0xa01163.height) > 0) {
      return _normalizeViewportRect(_0xa01163.left, _0xa01163.top, _0xa01163.width, _0xa01163.height);
    }
  }
  return _normalizeViewportRect(0, 0, Number(_0x5ed77a?.innerWidth) || 0, Number(_0x5ed77a?.innerHeight) || 0);
}
function _resolveMaxZoom(_0x2c8b59, _0xb0e852) {
  if (typeof _0x2c8b59 === "number" && Number.isFinite(_0x2c8b59)) {
    return _0x2c8b59;
  }
  if (_0x2c8b59 && typeof _0x2c8b59 === "object" && Number.isFinite(Number(_0x2c8b59.maxZoom))) {
    return Number(_0x2c8b59.maxZoom);
  }
  return _0xb0e852;
}
function _resolveViewportInset(_0x57f7dc) {
  const _0x331ae8 = Number(_0x57f7dc);
  if (Number.isFinite(_0x331ae8)) {
    return Math.max(0, _0x331ae8);
  } else {
    return 0;
  }
}
function _applyViewportInsets(_0x3da495, _0x123ad3) {
  if (!_0x123ad3 || typeof _0x123ad3 !== "object") {
    return _0x3da495;
  }
  const _0x4b3107 = _resolveViewportInset(_0x123ad3.top);
  const _0x349781 = _resolveViewportInset(_0x123ad3.right);
  const _0x5e8f28 = _resolveViewportInset(_0x123ad3.bottom);
  const _0x3f8a27 = _resolveViewportInset(_0x123ad3.left);
  return _normalizeViewportRect(_0x3da495.left + _0x3f8a27, _0x3da495.top + _0x4b3107, Math.max(0, _0x3da495.width - _0x3f8a27 - _0x349781), Math.max(0, _0x3da495.height - _0x4b3107 - _0x5e8f28));
}
export function createViewportFocusController({
  store: _0x53f3fe,
  animateViewport: _0x205294,
  cancelAnimation: _0x3bb2d2,
  containerEl = null,
  containerCoordinates = false,
  windowObject = undefined,
  minZoom = CANVAS_ZOOM_LIMITS.fitMin,
  maxZoom = CANVAS_ZOOM_LIMITS.fitMax,
  resolveZoomPercent = jumpZoomPercentToViewportZoom
} = {}) {
  const _0x222d72 = _getWindowObject(windowObject);
  const _0x9b3dc0 = _getRaf();
  const _0x3eae77 = _getCaf();
  let _0x59f0f2 = null;
  let _0x6a44f1 = null;
  const _0xe13ee4 = () => {
    if (typeof _0x53f3fe?.getStateRaw === "function") {
      return _0x53f3fe.getStateRaw();
    }
    if (typeof _0x53f3fe?.getState === "function") {
      return _0x53f3fe.getState();
    }
    return {};
  };
  const _0x533958 = (_0x30bd07, _0x2f0ad2, _0x27cc7a) => {
    _0x53f3fe?.updateViewport?.(_0x30bd07, _0x2f0ad2, _0x27cc7a);
  };
  const _0x110f9f = () => {
    _0x53f3fe?.markViewportPersist?.();
  };
  const _0xfed23d = () => {
    const _0x95c319 = typeof _0x222d72?._v2UpdateSidePlusNow === "function" ? _0x222d72._v2UpdateSidePlusNow : _0x222d72?._v2UpdateSidePlus;
    if (typeof _0x95c319 === "function") {
      const _0x147422 = Number(_0x222d72._lastMx);
      const _0x363770 = Number(_0x222d72._lastMy);
      _0x95c319(Number.isFinite(_0x147422) ? _0x147422 : undefined, Number.isFinite(_0x363770) ? _0x363770 : undefined);
    }
  };
  function _0x52c522() {
    _0x3bb2d2?.();
    _0x59f0f2 = null;
    if (_0x6a44f1 !== null) {
      _0x3eae77(_0x6a44f1);
      _0x6a44f1 = null;
    }
  }
  function _0x36306c() {
    if (_0x59f0f2) {
      return {
        ..._0x59f0f2
      };
    } else {
      return null;
    }
  }
  function _0x203032(_0x704763) {
    if (!_0x704763) {
      return null;
    }
    const _0x3ef1f1 = _0xe13ee4();
    const _0x487c0b = _0x3ef1f1?.nodes || {};
    let _0x495725 = getBrowserViewportRect({
      windowObject: _0x222d72,
      containerEl: containerEl,
      containerCoordinates: containerCoordinates
    });
    let _0x14b935 = null;
    let _0x50bf4e = {
      minZoom: minZoom,
      maxZoom: maxZoom
    };
    if (_0x704763.type === "node-zoom-percent") {
      _0x14b935 = computeNodesWorldBounds(_0x487c0b, [_0x704763.nodeId]);
      _0x50bf4e.fixedZoom = resolveZoomPercent(_0x704763.zoomPercent);
    } else {
      _0x14b935 = computeNodesWorldBounds(_0x487c0b, _0x704763.nodeIds);
      _0x50bf4e.padding = _0x704763.padding;
      _0x50bf4e.maxZoom = _resolveMaxZoom(_0x704763.options, maxZoom);
      _0x495725 = _applyViewportInsets(_0x495725, _0x704763.options?.viewportInsets);
    }
    if (!_0x14b935) {
      return null;
    }
    const _0x370aaf = computeViewportForWorldBounds(_0x14b935, _0x495725, _0x50bf4e);
    if (!_0x370aaf) {
      return null;
    }
    return {
      target: _0x370aaf,
      viewport: _0x3ef1f1?.viewport || _getDefaultViewport()
    };
  }
  function _0xe5ff29() {
    _0x6a44f1 = null;
    if (!_0x59f0f2) {
      return false;
    }
    const _0x3699c3 = _0x203032(_0x59f0f2);
    if (!_0x3699c3) {
      _0x52c522();
      return false;
    }
    const {
      target: _0x4bf0ba,
      viewport: _0x4d9af6
    } = _0x3699c3;
    if (_0x4d9af6.x === _0x4bf0ba.x && _0x4d9af6.y === _0x4bf0ba.y && _0x4d9af6.zoom === _0x4bf0ba.zoom) {
      return true;
    }
    _0x3bb2d2?.();
    _0x533958(_0x4bf0ba.x, _0x4bf0ba.y, _0x4bf0ba.zoom);
    _0x110f9f();
    _0xfed23d();
    return true;
  }
  function _0x405fcb() {
    if (!_0x59f0f2 || _0x6a44f1 !== null) {
      return;
    }
    _0x6a44f1 = _0x9b3dc0(() => {
      _0xe5ff29();
    });
  }
  function _0x3f8c6c(_0x4e4a0f) {
    const _0x323ee1 = _0x203032(_0x4e4a0f);
    if (!_0x323ee1) {
      _0x52c522();
      return false;
    }
    _0x59f0f2 = {
      ..._0x4e4a0f
    };
    const {
      viewport: _0x88dcdd,
      target: _0x3d5da0
    } = _0x323ee1;
    _0x205294?.(_0x88dcdd.x, _0x88dcdd.y, _0x88dcdd.zoom, _0x3d5da0.x, _0x3d5da0.y, _0x3d5da0.zoom, _0x4e4a0f.durationMs);
    return true;
  }
  function _0x5cdf79(_0x55c931, _0x1f6783 = 120, _0x5aad00 = 1500, _0x93185f = null) {
    return _0x3f8c6c({
      type: "nodes-fit",
      nodeIds: [_0x55c931],
      padding: _0x1f6783,
      durationMs: _0x5aad00,
      options: _0x93185f
    });
  }
  function _0x2ad45c(_0x3452f9, _0x4d642f = 80, _0x577a2c = 800, _0x2b2301 = null) {
    if (!Array.isArray(_0x3452f9) || _0x3452f9.length === 0) {
      _0x52c522();
      return false;
    }
    return _0x3f8c6c({
      type: "nodes-fit",
      nodeIds: [..._0x3452f9],
      padding: _0x4d642f,
      durationMs: _0x577a2c,
      options: _0x2b2301
    });
  }
  function _0x3a6f05(_0x221d97, _0x4d9efe = 60, _0x184ddb = 800) {
    return _0x3f8c6c({
      type: "node-zoom-percent",
      nodeId: _0x221d97,
      zoomPercent: _0x4d9efe,
      durationMs: _0x184ddb
    });
  }
  const _0x442ab1 = () => _0x405fcb();
  _0x222d72?.addEventListener?.("resize", _0x442ab1);
  _0x222d72?.visualViewport?.addEventListener?.("resize", _0x442ab1);
  _0x222d72?.visualViewport?.addEventListener?.("scroll", _0x442ab1);
  function _0xbe06d() {
    _0x52c522();
    _0x222d72?.removeEventListener?.("resize", _0x442ab1);
    _0x222d72?.visualViewport?.removeEventListener?.("resize", _0x442ab1);
    _0x222d72?.visualViewport?.removeEventListener?.("scroll", _0x442ab1);
  }
  return {
    focusNode: _0x5cdf79,
    focusNodes: _0x2ad45c,
    focusNodeAtZoomPercent: _0x3a6f05,
    clearTrackedFocus: _0x52c522,
    getTrackedFocusRequest: _0x36306c,
    reapplyTrackedFocusNow: _0xe5ff29,
    getBrowserViewportRect() {
      return getBrowserViewportRect({
        windowObject: _0x222d72,
        containerEl: containerEl,
        containerCoordinates: containerCoordinates
      });
    },
    destroy: _0xbe06d
  };
}