export const CANVAS_ZOOM_LIMITS = Object.freeze({
  min: 0.05,
  max: 4,
  default: 1,
  fitMin: 0.01,
  fitMax: 2
});
export const CANVAS_ZOOM_SLIDER_RANGE = Object.freeze({
  min: 0,
  max: 100,
  step: 0.1
});
const ZOOM_RATIO = CANVAS_ZOOM_LIMITS.max / CANVAS_ZOOM_LIMITS.min;
const LOG_ZOOM_RATIO = Math.log(ZOOM_RATIO);
function toFiniteNumber(_0x184693, _0x10d086) {
  const _0x4b24c2 = Number(_0x184693);
  if (Number.isFinite(_0x4b24c2)) {
    return _0x4b24c2;
  } else {
    return _0x10d086;
  }
}
function clamp(_0x5095b6, _0x4b1a83, _0x535267) {
  return Math.max(_0x4b1a83, Math.min(_0x5095b6, _0x535267));
}
export function clampCanvasZoom(_0x15a745) {
  return clamp(toFiniteNumber(_0x15a745, CANVAS_ZOOM_LIMITS.default), CANVAS_ZOOM_LIMITS.min, CANVAS_ZOOM_LIMITS.max);
}
export function canvasZoomToSliderValue(_0x24c72) {
  const _0x1000d4 = clampCanvasZoom(_0x24c72);
  if (_0x1000d4 === CANVAS_ZOOM_LIMITS.min) {
    return CANVAS_ZOOM_SLIDER_RANGE.min;
  }
  if (_0x1000d4 === CANVAS_ZOOM_LIMITS.max) {
    return CANVAS_ZOOM_SLIDER_RANGE.max;
  }
  const _0x3ce4a9 = Math.log(_0x1000d4 / CANVAS_ZOOM_LIMITS.min) / LOG_ZOOM_RATIO;
  return Math.round(_0x3ce4a9 * CANVAS_ZOOM_SLIDER_RANGE.max * 10) / 10;
}
export function sliderValueToCanvasZoom(_0x3edf43) {
  const _0x29fe40 = clamp(toFiniteNumber(_0x3edf43, CANVAS_ZOOM_SLIDER_RANGE.min), CANVAS_ZOOM_SLIDER_RANGE.min, CANVAS_ZOOM_SLIDER_RANGE.max);
  if (_0x29fe40 === CANVAS_ZOOM_SLIDER_RANGE.min) {
    return CANVAS_ZOOM_LIMITS.min;
  }
  if (_0x29fe40 === CANVAS_ZOOM_SLIDER_RANGE.max) {
    return CANVAS_ZOOM_LIMITS.max;
  }
  const _0x2ef6bc = _0x29fe40 / CANVAS_ZOOM_SLIDER_RANGE.max;
  return CANVAS_ZOOM_LIMITS.min * Math.exp(LOG_ZOOM_RATIO * _0x2ef6bc);
}
export function canvasZoomToDisplayPercent(_0x3492da) {
  const _0x389882 = clamp(toFiniteNumber(_0x3492da, CANVAS_ZOOM_LIMITS.default), CANVAS_ZOOM_LIMITS.fitMin, CANVAS_ZOOM_LIMITS.max);
  return Math.round(_0x389882 * 100);
}