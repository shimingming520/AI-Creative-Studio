import { isRendererInteractionBusy } from "./viewportInteractionState.js";
export function createRendererInteractionGraceController({
  delayMs = 0,
  getNow = defaultNow,
  getDragContext = null,
  onBusyStateChange = null
} = {}) {
  let _0x14b55f = 0;
  let _0x30accd = false;
  function _0x2848da(_0x407744) {
    const _0x79cc80 = _0x407744 === true;
    if (_0x30accd === _0x79cc80) {
      return;
    }
    _0x30accd = _0x79cc80;
    onBusyStateChange?.(_0x79cc80);
  }
  function _0x2d5cef() {
    _0x14b55f = getNow();
    _0x2848da(true);
  }
  function _0xc83420() {
    _0x2848da(false);
  }
  function _0x460bc3() {
    const _0x828b2c = Number(delayMs);
    if (!Number.isFinite(_0x828b2c) || _0x828b2c <= 0 || !_0x14b55f) {
      return 0;
    }
    const _0xf2fb81 = getNow() - _0x14b55f;
    return Math.max(0, _0x828b2c - Math.max(0, _0xf2fb81));
  }
  function _0x18d916() {
    _0x14b55f = 0;
    _0x2848da(false);
  }
  function _0x5e91bc() {
    const _0x5bf902 = typeof getDragContext === "function" ? getDragContext() || {} : {};
    return isRendererInteractionBusy({
      interactionState: _0x5bf902
    });
  }
  return {
    getRemainingMs: _0x460bc3,
    isBusy: _0x5e91bc,
    markIdle: _0xc83420,
    markBusy: _0x2d5cef,
    reset: _0x18d916
  };
}
function defaultNow() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}