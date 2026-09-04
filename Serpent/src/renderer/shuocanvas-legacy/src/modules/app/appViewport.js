import { createViewportFocusController } from "../../core/viewportFocus.js";
import { beginViewportPanPreview, flushViewportPanPreview, getViewportPanPreview, isViewportPanPreviewActive, updateViewportPanPreview } from "../../core/viewportPanPreview.js";
import { createViewportPreviewCoordinator } from "../interaction/viewportPreviewCoordinator.js";
import { CANVAS_LOW_ZOOM_LOD_THRESHOLD } from "../canvasImageLod.js";
import { installProviderIconLodController } from "../providerIconLod.js";
import { getViewportScreenOrigin } from "../../core/math.js";
import { canvasZoomToDisplayPercent, canvasZoomToSliderValue, sliderValueToCanvasZoom } from "../../core/canvasZoom.js";
const TEXT_LOD_ZOOM = CANVAS_LOW_ZOOM_LOD_THRESHOLD;
const ZOOM_SLIDER_END_DELAY_MS = 160;
const APP_VIEWPORT_ANIMATION_PREVIEW_OWNER = "app-viewport-animation";
export function createAppViewport({
  graphStore: _0x5e5981,
  uiStore: _0x4f3606,
  wrap: _0x181c30,
  canvasViewportEl = null,
  debugEl: _0x489cc6,
  zoomSliderEl: _0x528baa,
  zoomPercentEl: _0x214dca,
  fitActionEl: _0x30674e,
  viewportPreview = null
} = {}) {
  let _0x5a3265 = false;
  let _0x435479 = null;
  let _0x151500 = 0;
  let _0x1d256b = null;
  let _0x280314 = true;
  let _0x17ad34 = 0;
  let _0x93d77a = null;
  let _0x507fb2 = null;
  const _0x573d01 = installProviderIconLodController({
    rootEl: _0x181c30 || document,
    store: _0x5e5981
  });
  const _0x254f36 = viewportPreview || createViewportPreviewCoordinator({
    beginPreview: beginViewportPanPreview,
    updatePreview(_0x5ed358) {
      updateViewportPanPreview(_0x5ed358.x, _0x5ed358.y, _0x5ed358.zoom);
    },
    flushPreview: flushViewportPanPreview,
    getPreview: getViewportPanPreview,
    isPreviewActive: isViewportPanPreviewActive
  });
  function _0x6645d8() {
    if (typeof _0x5e5981?.getStateRaw === "function") {
      return _0x5e5981.getStateRaw();
    }
    return _0x5e5981?.getState?.() || {};
  }
  function _0x4ea825(_0x232003, _0x54bf51 = true) {
    if (!_0x232003) {
      return;
    }
    const _0xe8091f = () => {
      _0x5e5981.updateViewport(_0x232003.x, _0x232003.y, _0x232003.zoom);
      if (_0x54bf51) {
        _0x5e5981.markViewportPersist?.();
      }
    };
    if (typeof _0x5e5981.batch === "function") {
      _0x5e5981.batch(_0xe8091f);
    } else {
      _0xe8091f();
    }
  }
  function _0x26e418(_0xc62dcb) {
    document.body.classList.toggle("is-zoom-low", _0xc62dcb);
    _0x573d01?.scheduleSync?.();
  }
  function _0x3fa891(_0x29b97b) {
    const _0x2786bd = canvasZoomToSliderValue(_0x29b97b);
    const _0x2b0a4e = canvasZoomToDisplayPercent(_0x29b97b);
    if (_0x214dca) {
      _0x214dca.textContent = _0x2b0a4e + "%";
    }
    if (_0x528baa) {
      _0x528baa.value = String(_0x2786bd);
      _0x528baa.setAttribute?.("aria-valuetext", _0x2b0a4e + "%");
    }
  }
  function _0x4e3948(_0x184b4b) {
    if (_0x280314 === _0x184b4b) {
      return;
    }
    _0x280314 = _0x184b4b;
    const _0x313bff = document.getElementById("v2-server-disconnect-alert");
    if (_0x313bff) {
      _0x313bff.style.display = _0x184b4b ? "none" : "block";
    }
  }
  function _0x41c1df() {
    const _0x9438e2 = typeof window._v2UpdateSidePlusNow === "function" ? window._v2UpdateSidePlusNow : window._v2UpdateSidePlus;
    if (typeof _0x9438e2 !== "function") {
      return;
    }
    const _0x2ad15c = Number(window._lastMx);
    const _0x3d3c97 = Number(window._lastMy);
    _0x9438e2(Number.isFinite(_0x2ad15c) ? _0x2ad15c : undefined, Number.isFinite(_0x3d3c97) ? _0x3d3c97 : undefined);
  }
  function _0x525ff2() {
    document.body.classList.add("is-zooming");
    if (_0x93d77a) {
      clearTimeout(_0x93d77a);
    }
    _0x93d77a = setTimeout(() => {
      _0x93d77a = null;
      document.body.classList.remove("is-zooming");
    }, ZOOM_SLIDER_END_DELAY_MS);
  }
  _0x5e5981.subscribeSelector(_0x299eca => _0x299eca.viewport?.zoom, _0x48221e => {
    if (typeof _0x48221e !== "number") {
      return;
    }
    if (!_0x5a3265) {
      _0x3fa891(_0x48221e);
    }
    const _0x4a6aa0 = _0x48221e <= TEXT_LOD_ZOOM;
    if (_0x5a3265) {
      _0x1d256b = _0x4a6aa0;
    } else {
      _0x1d256b = null;
      _0x26e418(_0x4a6aa0);
    }
  });
  _0x4f3606.subscribeSelector(_0x4f87c4 => _0x4f87c4.isServerConnected, _0x1e77df => {
    _0x4e3948(_0x1e77df);
  });
  _0x5e5981.subscribeSelector(_0x444d2b => {
    const _0x102f3d = _0x444d2b.viewport ?? {};
    const _0x5c3440 = Number(_0x102f3d.x) || 0;
    const _0x4646cf = Number(_0x102f3d.y) || 0;
    const _0x499e23 = Number(_0x102f3d.zoom) || 1;
    const _0x11178b = _0x444d2b._nodeCount ?? Object.keys(_0x444d2b.nodes || {}).length;
    return _0x5c3440 + "|" + _0x4646cf + "|" + _0x499e23 + "|" + _0x11178b;
  }, _0x4d30e8 => {
    if (!_0x489cc6) {
      return;
    }
    const _0x5bb080 = performance.now();
    if (_0x5bb080 - _0x17ad34 < 120) {
      return;
    }
    _0x17ad34 = _0x5bb080;
    const [_0xf9ad46, _0x232409, _0x4d1599, _0x197382] = String(_0x4d30e8 || "").split("|");
    const _0x3687e8 = Number(_0xf9ad46) || 0;
    const _0x21f8fb = Number(_0x232409) || 0;
    const _0x49990c = Number(_0x4d1599) || 1;
    const _0xaec1b7 = Number(_0x197382) || 0;
    _0x489cc6.textContent = "V2 Sandbox | Nodes: " + _0xaec1b7 + " | x: " + _0x3687e8.toFixed(0) + " y: " + _0x21f8fb.toFixed(0) + " z: " + _0x49990c.toFixed(2) + " ";
  });
  function _0x283622(_0x56993d, _0x2a9594, _0x38a398, _0x4c22ca, _0x3e7d1a, _0x38dccb, _0x3df594 = 800) {
    if (Number(_0x3df594) <= 0) {
      _0x4f8c5f({
        commitPreview: false
      });
      _0x4ea825({
        x: _0x4c22ca,
        y: _0x3e7d1a,
        zoom: _0x38dccb
      });
      _0x3fa891(_0x38dccb);
      _0x41c1df();
      return;
    }
    let _0x57a130 = {
      x: _0x56993d,
      y: _0x2a9594,
      zoom: _0x38a398
    };
    if (_0x435479 !== null) {
      cancelAnimationFrame(_0x435479);
      _0x435479 = null;
    }
    if (_0x5a3265) {
      _0x57a130 = _0x254f36.commit(APP_VIEWPORT_ANIMATION_PREVIEW_OWNER) || _0x507fb2 || _0x57a130;
      window._v2FlushMinimapViewportPreview?.(_0x57a130);
      _0x507fb2 = null;
    }
    const _0x36df16 = _0x254f36.acquire(APP_VIEWPORT_ANIMATION_PREVIEW_OWNER, _0x57a130);
    if (!_0x36df16) {
      return;
    }
    _0x57a130 = _0x36df16;
    window._v2ScheduleMinimapViewportPreview?.(_0x57a130, {
      force: true
    });
    const _0x71fd61 = ++_0x151500;
    const _0x540b29 = performance.now();
    _0x5a3265 = true;
    document.body.classList.add("is-viewport-animating");
    const _0x1c8190 = _0x3cdbb6 => 1 - Math.pow(1 - _0x3cdbb6, 3);
    function _0x3e6baf(_0x45c318) {
      if (_0x71fd61 !== _0x151500) {
        return;
      }
      const _0x470a7b = _0x45c318 - _0x540b29;
      const _0x4b58f6 = Math.min(_0x470a7b / _0x3df594, 1);
      const _0x241bdd = _0x1c8190(_0x4b58f6);
      const _0xe048eb = {
        x: _0x57a130.x + (_0x4c22ca - _0x57a130.x) * _0x241bdd,
        y: _0x57a130.y + (_0x3e7d1a - _0x57a130.y) * _0x241bdd,
        zoom: _0x57a130.zoom + (_0x38dccb - _0x57a130.zoom) * _0x241bdd
      };
      _0x507fb2 = _0xe048eb;
      _0x254f36.update(APP_VIEWPORT_ANIMATION_PREVIEW_OWNER, _0xe048eb);
      window._v2ScheduleMinimapViewportPreview?.(_0xe048eb);
      _0x1d256b = _0xe048eb.zoom <= TEXT_LOD_ZOOM;
      _0x41c1df();
      if (_0x4b58f6 < 1) {
        _0x435479 = requestAnimationFrame(_0x3e6baf);
        return;
      }
      _0x435479 = null;
      const _0x2010ce = _0x254f36.commit(APP_VIEWPORT_ANIMATION_PREVIEW_OWNER) || _0x507fb2 || _0xe048eb;
      _0x507fb2 = null;
      window._v2FlushMinimapViewportPreview?.(_0x2010ce);
      _0x4ea825(_0x2010ce);
      _0x5a3265 = false;
      document.body.classList.remove("is-viewport-animating");
      if (_0x1d256b !== null) {
        _0x26e418(_0x1d256b);
        _0x1d256b = null;
      }
      _0x3fa891(_0x2010ce.zoom);
      _0x41c1df();
    }
    _0x435479 = requestAnimationFrame(_0x3e6baf);
  }
  function _0x4f8c5f({
    commitPreview = true
  } = {}) {
    if (_0x435479 !== null) {
      cancelAnimationFrame(_0x435479);
      _0x435479 = null;
    }
    _0x151500 += 1;
    const _0x133baa = _0x5a3265 ? _0x254f36.commit(APP_VIEWPORT_ANIMATION_PREVIEW_OWNER) || _0x507fb2 : null;
    _0x507fb2 = null;
    if (_0x133baa) {
      window._v2FlushMinimapViewportPreview?.(_0x133baa);
    }
    _0x5a3265 = false;
    document.body.classList.remove("is-viewport-animating");
    if (commitPreview && _0x133baa) {
      _0x4ea825(_0x133baa, false);
      _0x3fa891(_0x133baa.zoom);
      _0x41c1df();
    }
    if (_0x1d256b !== null) {
      if (commitPreview) {
        _0x26e418(_0x1d256b);
      }
      _0x1d256b = null;
    }
  }
  const _0x215b33 = createViewportFocusController({
    store: _0x5e5981,
    animateViewport: _0x283622,
    cancelAnimation: _0x4f8c5f,
    containerEl: canvasViewportEl || _0x181c30,
    containerCoordinates: !!canvasViewportEl
  });
  if (_0x528baa) {
    _0x528baa.addEventListener("input", _0x8ee6c4 => {
      const _0x23680c = Number.parseFloat(_0x8ee6c4.target.value);
      const _0x5f59a9 = sliderValueToCanvasZoom(_0x23680c);
      const _0x556f4e = canvasZoomToDisplayPercent(_0x5f59a9);
      _0x215b33?.clearTrackedFocus("zoom-slider");
      const {
        viewport = {
          x: 0,
          y: 0,
          zoom: 1
        }
      } = _0x6645d8();
      _0x525ff2();
      if (_0x214dca) {
        _0x214dca.textContent = _0x556f4e + "%";
      }
      _0x528baa.setAttribute?.("aria-valuetext", _0x556f4e + "%");
      const _0xe2f9c0 = getViewportScreenOrigin(viewport);
      const _0x28e8fe = Math.max(0, window.innerWidth - _0xe2f9c0.x) / 2;
      const _0x5bf8be = Math.max(0, window.innerHeight - _0xe2f9c0.y) / 2;
      const _0x47ed2c = _0x28e8fe - (_0x28e8fe - viewport.x) * (_0x5f59a9 / viewport.zoom);
      const _0x183574 = _0x5bf8be - (_0x5bf8be - viewport.y) * (_0x5f59a9 / viewport.zoom);
      _0x5e5981.updateViewport(_0x47ed2c, _0x183574, _0x5f59a9);
    });
  }
  _0x30674e?.addEventListener("click", () => {
    const _0x375161 = Object.keys(_0x5e5981.getState().nodes || {});
    _0x215b33?.focusNodes(_0x375161, 80, 800);
  });
  return {
    animateViewport: _0x283622,
    cancelViewportAnimation: _0x4f8c5f,
    focusNode: (..._0x128f6f) => _0x215b33?.focusNode(..._0x128f6f),
    focusNodeAtZoomPercent: (..._0x3a1ea2) => _0x215b33?.focusNodeAtZoomPercent(..._0x3a1ea2),
    focusNodes: (..._0x21516e) => _0x215b33?.focusNodes(..._0x21516e),
    clearTrackedFocus: (..._0xb67a4d) => _0x215b33?.clearTrackedFocus(..._0xb67a4d),
    installWindowBindings(_0x78465 = window) {
      _0x78465.v2AnimateViewport = _0x283622;
      _0x78465.v2ClearTrackedViewportFocus = (..._0x32d83a) => _0x215b33?.clearTrackedFocus(..._0x32d83a);
      _0x78465.v2FocusOnNode = (_0x15e871, _0x45192e = 120, _0x19148d = 1500, _0x4f834e) => _0x215b33?.focusNode(_0x15e871, _0x45192e, _0x19148d, _0x4f834e);
      _0x78465.v2FocusOnNodeAtZoomPercent = (_0x272960, _0x36b35f = 60, _0x30f961 = 800) => _0x215b33?.focusNodeAtZoomPercent(_0x272960, _0x36b35f, _0x30f961);
      _0x78465.v2FocusOnNodes = (_0x20bba1, _0x565736 = 80, _0x39799e = 800, _0x363dc3) => _0x215b33?.focusNodes(_0x20bba1, _0x565736, _0x39799e, _0x363dc3);
    }
  };
}