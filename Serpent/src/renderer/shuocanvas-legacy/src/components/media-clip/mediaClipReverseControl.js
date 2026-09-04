export const MEDIA_CLIP_REVERSE_ICON_PATHS = "<path d=\"M5 5v14\"/><path d=\"m11 8-6 4 6 4V8Z\"/><path d=\"m19 8-6 4 6 4V8Z\"/>";
function clamp(_0x38c7fb, _0x3a5df6, _0x1835c3) {
  return Math.max(_0x3a5df6, Math.min(_0x1835c3, _0x38c7fb));
}
export function resolveMediaClipReverseControlState({
  isReversed = false,
  pending = false
} = {}) {
  const _0x1be436 = isReversed === true;
  const _0x40227d = pending === true;
  return {
    isReversed: _0x1be436,
    pending: _0x40227d,
    label: _0x40227d ? "视频倒放中" : _0x1be436 ? "取消视频倒放" : "视频倒放",
    ariaPressed: String(_0x1be436),
    ariaBusy: String(_0x40227d)
  };
}
export function mirrorMediaClipRange({
  startSec = 0,
  endSec = 0,
  durationSec = 0
} = {}) {
  const _0xa8f5e1 = Math.max(0, Number(durationSec) || 0);
  if (!(_0xa8f5e1 > 0)) {
    return {
      startSec: 0,
      endSec: 0
    };
  }
  const _0x2336f5 = clamp(Number(startSec) || 0, 0, _0xa8f5e1);
  const _0x3ccd87 = clamp(Number(endSec) || 0, _0x2336f5, _0xa8f5e1);
  return {
    startSec: _0xa8f5e1 - _0x3ccd87,
    endSec: _0xa8f5e1 - _0x2336f5
  };
}
export function renderMediaClipReverseIcon({
  className = "",
  strokeWidth = 1.7
} = {}) {
  const _0x5b8518 = String(className || "").trim();
  const _0x2d8a23 = _0x5b8518 ? " class=\"" + _0x5b8518 + "\"" : "";
  return "<svg" + _0x2d8a23 + " viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"" + (Number(strokeWidth) || 1.7) + "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">" + MEDIA_CLIP_REVERSE_ICON_PATHS + "</svg>";
}