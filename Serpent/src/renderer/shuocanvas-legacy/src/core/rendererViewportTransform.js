import { syncViewportGridDots } from "./viewportGridDots.js";
let lastZoomInv = null;
let lastZoomInvRaw = null;
let lastNodeLabelComp = null;
export function renderViewport(_0x9ad009, _0x3777f0, _0x467e4d = false) {
  const _0x427156 = "0 0";
  if (_0x9ad009.style.transformOrigin !== _0x427156) {
    _0x9ad009.style.transformOrigin = _0x427156;
  }
  const _0x41edc3 = "translate3d(" + _0x3777f0.x + "px, " + _0x3777f0.y + "px, 0) scale(" + _0x3777f0.zoom + ")";
  if (_0x9ad009._lastTransform !== _0x41edc3) {
    _0x9ad009.style.transform = _0x41edc3;
    _0x9ad009._lastTransform = _0x41edc3;
  }
  syncViewportGridDots(_0x9ad009, _0x3777f0);
  syncViewportZoomCssVars(_0x3777f0.zoom, _0x467e4d);
}
export function syncViewportZoomCssVars(_0x2ae649, _0x23087a) {
  const _0x1aa6b2 = typeof document !== "undefined" ? document.documentElement : null;
  if (!_0x1aa6b2) {
    return;
  }
  const _0x222548 = 0.29000000000000004;
  const _0x423725 = typeof _0x2ae649 === "number" && isFinite(_0x2ae649) ? _0x2ae649 : 1;
  const _0x2d5e52 = _0x423725 > 0 ? _0x423725 : 1;
  const _0x864159 = Math.min(1 / _0x2d5e52, 1 / _0x222548);
  const _0x43aa5a = 1 / _0x2d5e52;
  const _0xb50295 = _0x423725 > 0 ? Math.pow(1 / _0x423725, 0.35) : 1;
  const _0x52f2cd = typeof _0x23087a === "boolean";
  const _0x4f6938 = _0x23087a === true ? Math.min(_0xb50295, 1.6) : 1;
  if (lastZoomInv !== _0x864159) {
    lastZoomInv = _0x864159;
    _0x1aa6b2.style.setProperty("--zoom-inv", _0x864159);
  }
  if (lastZoomInvRaw !== _0x43aa5a) {
    lastZoomInvRaw = _0x43aa5a;
    _0x1aa6b2.style.setProperty("--zoom-inv-raw", _0x43aa5a);
  }
  if (_0x52f2cd && lastNodeLabelComp !== _0x4f6938) {
    lastNodeLabelComp = _0x4f6938;
    _0x1aa6b2.style.setProperty("--node-label-comp", _0x4f6938);
  }
}