import { beginZoomFpsSession, endZoomFpsSession } from "../perf/perfProbe.js";
import { setCanvasMediaSchedulerPaused } from "../canvasMediaScheduler.js";
import { screenToViewportPoint } from "../../core/math.js";
import { clampCanvasZoom } from "../../core/canvasZoom.js";
const WHEEL_ZOOM_PREVIEW_OWNER = "wheel-zoom";
export function createZoomController({
  store: _0x5682c5,
  viewportPreview: _0x540660
}) {
  if (typeof _0x540660?.acquire !== "function" || typeof _0x540660?.update !== "function" || typeof _0x540660?.commit !== "function") {
    throw new TypeError("[ZoomController] viewportPreview is required");
  }
  let _0x509fde = 0;
  let _0x1f5be2 = 0;
  let _0x53209a = 0;
  let _0xb0e7eb = 0;
  let _0x29f3d0 = 0;
  let _0x2cd451;
  let _0xe6ef80 = false;
  const _0x394c53 = "is-edge-interaction-lite";
  const _0x433ba4 = 0.24;
  const _0x1e1ee2 = 0.48;
  const _0x21bbff = 3;
  const _0x1883ce = 160;
  const _0x10cebc = 120;
  const _0x176cbe = "wheel-zoom";
  function _0x2b8a6f(_0x40b24b, _0x362171) {
    const _0x19192d = Object.keys(_0x40b24b?.edges || {}).length;
    const _0x1e3547 = typeof window !== "undefined" ? window._edgeDomCache : null;
    return _0x362171 >= _0x433ba4 && _0x362171 <= _0x1e1ee2 && _0x19192d >= _0x21bbff && _0x1e3547 && _0x1e3547.size > 0;
  }
  function _0x3ec9c0(_0x58ae4e) {
    if (typeof document === "undefined" || !document?.body?.classList) {
      return;
    }
    document.body.classList.toggle(_0x394c53, !!_0x58ae4e);
  }
  function _0x400e60(_0x1b08e4) {
    if (typeof requestAnimationFrame === "function") {
      return requestAnimationFrame(_0x1b08e4);
    }
    return setTimeout(_0x1b08e4, 0);
  }
  function _0x4ab9fb() {
    if (_0x1f5be2) {
      clearTimeout(_0x1f5be2);
      _0x1f5be2 = 0;
    }
    setCanvasMediaSchedulerPaused(true, {
      bypassPriority: 1000,
      source: _0x176cbe
    });
  }
  function _0x27e1ee() {
    if (_0x1f5be2) {
      clearTimeout(_0x1f5be2);
    }
    _0x1f5be2 = setTimeout(() => {
      _0x1f5be2 = 0;
      setCanvasMediaSchedulerPaused(false, {
        source: _0x176cbe
      });
    }, _0x10cebc);
  }
  function _0x356643(_0x4e6e36) {
    const _0x1f2715 = typeof _0x4e6e36?._v2UpdateSidePlusNow === "function" ? _0x4e6e36._v2UpdateSidePlusNow : _0x4e6e36?._v2UpdateSidePlus;
    if (typeof _0x1f2715 !== "function") {
      return;
    }
    if (_0x2cd451 !== undefined) {
      _0x1f2715(_0xb0e7eb, _0x29f3d0, {
        pointerTarget: _0x2cd451
      });
      return;
    }
    _0x1f2715(_0xb0e7eb, _0x29f3d0);
  }
  function _0x1570ed() {
    if (!_0x53209a) {
      return;
    }
    const _0x79091b = _0x53209a;
    _0x53209a = 0;
    if (typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(_0x79091b);
      return;
    }
    clearTimeout(_0x79091b);
  }
  function _0x58bf17() {
    if (!_0xe6ef80) {
      return null;
    }
    _0xe6ef80 = false;
    if (_0x509fde) {
      clearTimeout(_0x509fde);
      _0x509fde = 0;
    }
    const _0x1e3b8e = typeof document !== "undefined" && document && document.body;
    const _0x39ade4 = typeof window !== "undefined" ? window : null;
    const _0x10f158 = _0x540660.commit(WHEEL_ZOOM_PREVIEW_OWNER);
    if (_0x1e3b8e) {
      document.body.classList.remove("is-zooming");
    }
    _0x3ec9c0(false);
    endZoomFpsSession("wheel-zoom");
    _0x1570ed();
    if (_0x10f158) {
      _0x39ade4?._v2FlushMinimapViewportPreview?.(_0x10f158);
      _0x5682c5.updateViewport(_0x10f158.x, _0x10f158.y, _0x10f158.zoom);
      _0x5682c5.markViewportPersist();
      _0x356643(_0x39ade4);
    }
    _0x39ade4?.v2Renderer?.releaseViewportInteractionBusy?.();
    _0x27e1ee();
    return _0x10f158;
  }
  function _0x46dcf2() {
    if (_0x509fde) {
      clearTimeout(_0x509fde);
    }
    const _0x53f777 = setTimeout(() => {
      if (_0x509fde !== _0x53f777) {
        return;
      }
      _0x509fde = 0;
      _0x58bf17();
    }, _0x1883ce);
    _0x509fde = _0x53f777;
  }
  function _0x18e947(_0x1549a1, _0x1e3112, _0x420ba8, _0x439ce1) {
    const _0x59dab3 = _0x5682c5.getStateRaw();
    const _0x9ff861 = _0x540660.acquire(WHEEL_ZOOM_PREVIEW_OWNER, _0x59dab3?.viewport);
    if (!_0x9ff861) {
      return false;
    }
    const _0x1818e1 = typeof document !== "undefined" && document && document.body;
    const _0x11a2b2 = typeof window !== "undefined" ? window : null;
    if (_0x1818e1) {
      document.body.classList.add("is-zooming");
    }
    _0x11a2b2?.v2Renderer?.markViewportInteractionBusy?.();
    _0x4ab9fb();
    beginZoomFpsSession("wheel-zoom");
    const _0x11595a = _0x9ff861;
    const _0x1291bf = screenToViewportPoint(_0x1549a1, _0x1e3112, _0x11595a);
    const _0xafd570 = _0x420ba8 > 0 ? 0.9 : 1.1;
    const _0x2a5529 = clampCanvasZoom(_0x11595a.zoom * _0xafd570);
    const _0x8045c2 = _0x1291bf.x - (_0x1291bf.x - _0x11595a.x) * (_0x2a5529 / _0x11595a.zoom);
    const _0xd514b = _0x1291bf.y - (_0x1291bf.y - _0x11595a.y) * (_0x2a5529 / _0x11595a.zoom);
    const _0x5462c3 = {
      ..._0x11595a,
      x: _0x8045c2,
      y: _0xd514b,
      zoom: _0x2a5529
    };
    _0x540660.update(WHEEL_ZOOM_PREVIEW_OWNER, _0x5462c3);
    _0x11a2b2?._v2ScheduleMinimapViewportPreview?.(_0x5462c3);
    _0x3ec9c0(_0x2b8a6f(_0x59dab3, _0x2a5529));
    _0xe6ef80 = true;
    _0x46dcf2();
    _0xb0e7eb = _0x11a2b2?._lastMx || _0x1549a1;
    _0x29f3d0 = _0x11a2b2?._lastMy || _0x1e3112;
    _0x2cd451 = _0x439ce1;
    if (!_0x53209a) {
      const _0x4e85b0 = _0x400e60(() => {
        if (_0x53209a !== _0x4e85b0) {
          return;
        }
        _0x53209a = 0;
        _0x356643(_0x11a2b2);
      });
      _0x53209a = _0x4e85b0;
    }
    return true;
  }
  return {
    handleWheel: _0x18e947,
    settleWheelZoom: _0x58bf17
  };
}