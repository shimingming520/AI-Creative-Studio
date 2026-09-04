export const MEDIA_CLIP_TIMELINE_TICK_COUNT = 6;
export const MEDIA_CLIP_TIMELINE_TICK_MIN_SPACING_PX = 130;
export const MEDIA_CLIP_TIMELINE_FRAME_MIN_WIDTH_PX = 54;
export const MEDIA_CLIP_TIMELINE_SCROLL_PX_PER_SEC = 108;
export const MEDIA_CLIP_TIMELINE_ADD_SLOT_WIDTH_PX = 46;
export const MEDIA_CLIP_TIMELINE_ADD_SLOT_GAP_PX = 4;
export const MEDIA_CLIP_TIMELINE_ZOOM_WHEEL_FACTOR = 1.12;
export const MEDIA_CLIP_TIMELINE_MIN_DISPLAY_SEC = 5;
export const MEDIA_CLIP_TIMELINE_MIN_WIDTH_PX = 240;
export const MEDIA_CLIP_TIMELINE_MIN_SEGMENT_WIDTH_PCT = 2;
export const MEDIA_CLIP_TIMELINE_FRAME_COUNT_MIN = 8;
export const MEDIA_CLIP_TIMELINE_FRAME_COUNT_MAX = 22;
export const MEDIA_CLIP_TIMELINE_TICK_STEPS_SEC = Object.freeze([15, 10, 5, 2, 1]);
export const MEDIA_CLIP_TIMELINE_RULER_MARK_MIN_SPACING_PX = 44;
export const MEDIA_CLIP_TIMELINE_RULER_MARK_MAX_COUNT = 2000;
export const MEDIA_CLIP_TIMELINE_FRAME_MARK_MIN_SPACING_PX = 12;
export const MEDIA_CLIP_TIMELINE_FRAME_MARK_MAX_COUNT = 12000;
const MEDIA_CLIP_TIMELINE_TICK_STEPS_ASC = Object.freeze([1, 2, 5, 10, 15]);
const MEDIA_CLIP_TIMELINE_RULER_MARK_STEPS_ASC = Object.freeze([0.1, 0.2, 0.5, 1, 2, 5, 10, 15]);
const MEDIA_CLIP_TIMELINE_MIN_RULER_INTERVALS = 4;
function toNumber(_0x1464be, _0x4eda04 = 0) {
  const _0x25aa67 = Number(_0x1464be);
  if (Number.isFinite(_0x25aa67)) {
    return _0x25aa67;
  } else {
    return _0x4eda04;
  }
}
function clamp(_0x3bb5e2, _0x16b5d9, _0x325423) {
  return Math.max(_0x16b5d9, Math.min(_0x325423, _0x3bb5e2));
}
function roundMs(_0x37c20e) {
  return Math.round(toNumber(_0x37c20e, 0) * 1000) / 1000;
}
export function getMediaClipTimelineDisplayDuration(_0x47f923 = 0) {
  return Math.max(MEDIA_CLIP_TIMELINE_MIN_DISPLAY_SEC, toNumber(_0x47f923, 0));
}
export function getMediaClipTimelineRatio(_0x426c2c = 0, _0x459505 = 0) {
  const _0x6b8780 = getMediaClipTimelineDisplayDuration(_0x459505);
  return clamp(toNumber(_0x426c2c, 0) / _0x6b8780, 0, 1);
}
export function getMediaClipTimelinePercent(_0x7dfe91 = 0, _0x132f38 = 0) {
  return getMediaClipTimelineRatio(_0x7dfe91, _0x132f38) * 100;
}
export function getMediaClipTimelinePx(_0x3985b8 = 0, _0x11b229 = {}) {
  const _0xf59c50 = Math.max(1, toNumber(_0x11b229.trackWidthPx, 1));
  return getMediaClipTimelineRatio(_0x3985b8, _0x11b229.durationSec) * _0xf59c50;
}
export function getMediaClipTimelineSecFromPx(_0x3da064 = 0, _0x1b1196 = {}) {
  const _0x2073e4 = Math.max(1, toNumber(_0x1b1196.trackWidthPx, 1));
  const _0x344525 = getMediaClipTimelineDisplayDuration(_0x1b1196.durationSec);
  return roundMs(clamp(toNumber(_0x3da064, 0) / _0x2073e4, 0, 1) * _0x344525);
}
export function getMediaClipTimelineSecFromClientX(_0x3672be = 0, _0x4d0917 = {}) {
  const _0x552b3f = toNumber(_0x4d0917.trackLeftPx, 0);
  return getMediaClipTimelineSecFromPx(toNumber(_0x3672be, _0x552b3f) - _0x552b3f, _0x4d0917);
}
export function getMediaClipTimelineDeltaSecFromPx(_0x3fb46d = 0, _0x260eb1 = {}) {
  const _0x459a54 = Math.max(1, toNumber(_0x260eb1.trackWidthPx, 1));
  const _0x4db659 = getMediaClipTimelineDisplayDuration(_0x260eb1.durationSec);
  return toNumber(_0x3fb46d, 0) / _0x459a54 * _0x4db659;
}
export function getMediaClipTimelineRangeRect(_0x44e9da = {}) {
  const _0x2ea91f = getMediaClipTimelineDisplayDuration(_0x44e9da.durationSec);
  const _0x4b245c = clamp(toNumber(_0x44e9da.startSec, 0), 0, _0x2ea91f);
  const _0x35cac2 = clamp(toNumber(_0x44e9da.endSec, _0x4b245c), _0x4b245c, _0x2ea91f);
  const _0x5e5e00 = getMediaClipTimelinePercent(_0x4b245c, _0x2ea91f);
  const _0x106445 = Math.max(_0x5e5e00, getMediaClipTimelinePercent(_0x35cac2, _0x2ea91f));
  const _0x4f10e9 = Math.max(toNumber(_0x44e9da.minWidthPct, MEDIA_CLIP_TIMELINE_MIN_SEGMENT_WIDTH_PCT), _0x106445 - _0x5e5e00);
  const _0x2df3a1 = Math.max(0, toNumber(_0x44e9da.trackWidthPx, 0));
  return {
    startSec: _0x4b245c,
    endSec: _0x35cac2,
    leftPct: _0x5e5e00,
    rightPct: _0x106445,
    widthPct: Math.min(100 - _0x5e5e00, _0x4f10e9),
    leftPx: _0x2df3a1 > 0 ? _0x5e5e00 / 100 * _0x2df3a1 : 0,
    widthPx: _0x2df3a1 > 0 ? (_0x106445 - _0x5e5e00) / 100 * _0x2df3a1 : 0
  };
}
export function getMediaClipTimelinePlayheadModel(_0x588db0 = {}) {
  const _0x35e807 = clamp(toNumber(_0x588db0.playheadSec, 0), 0, getMediaClipTimelineDisplayDuration(_0x588db0.durationSec));
  return {
    sec: _0x35e807,
    leftPct: getMediaClipTimelinePercent(_0x35e807, _0x588db0.durationSec),
    leftPx: getMediaClipTimelinePx(_0x35e807, _0x588db0)
  };
}
export function getMediaClipTimelineTrackWidthPx(_0x43d81f = {}) {
  const _0xeb961b = Math.max(MEDIA_CLIP_TIMELINE_MIN_WIDTH_PX, Math.ceil(toNumber(_0x43d81f.viewportWidthPx, 0)));
  const _0x3f59e2 = getMediaClipTimelineDisplayDuration(_0x43d81f.durationSec);
  const _0x443c06 = Math.max(1, toNumber(_0x43d81f.pxPerSec, MEDIA_CLIP_TIMELINE_SCROLL_PX_PER_SEC));
  const _0x1a2691 = Math.max(0.001, toNumber(_0x43d81f.zoom, 1));
  const _0x768998 = Math.max(_0xeb961b, _0x3f59e2 * _0x443c06);
  return Math.ceil(Math.max(_0xeb961b, _0x768998 * _0x1a2691));
}
export function getMediaClipFrameCount(_0x56ac41 = 0) {
  const _0x3375fa = Math.max(MEDIA_CLIP_TIMELINE_MIN_WIDTH_PX, toNumber(_0x56ac41, 0));
  return Math.max(MEDIA_CLIP_TIMELINE_FRAME_COUNT_MIN, Math.min(MEDIA_CLIP_TIMELINE_FRAME_COUNT_MAX, Math.ceil(_0x3375fa / MEDIA_CLIP_TIMELINE_FRAME_MIN_WIDTH_PX)));
}
export function shouldLockMediaClipTimelineWheelScroll(_0x24f5f2 = {}) {
  const _0x544b5a = Math.max(0, toNumber(_0x24f5f2.trackWidthPx, 0));
  const _0x3aeb9c = Math.max(1, toNumber(_0x24f5f2.viewportWidthPx, 1));
  const _0xb4a844 = Math.max(0, toNumber(_0x24f5f2.maxScrollPx, 0));
  const _0x296c08 = MEDIA_CLIP_TIMELINE_ADD_SLOT_GAP_PX + MEDIA_CLIP_TIMELINE_ADD_SLOT_WIDTH_PX;
  return _0xb4a844 > 0 && _0x544b5a <= _0x3aeb9c + 1 && _0xb4a844 <= _0x296c08 + 4;
}
export function getMediaClipTimelineAddSlotLeftPx(_0x32b472 = {}) {
  const _0x3fb6dc = Math.max(0, toNumber(_0x32b472.trackWidthPx, 0));
  const _0x57631e = getMediaClipTimelineDisplayDuration(_0x32b472.displayDurationSec);
  const _0x327b8c = clamp(toNumber(_0x32b472.materialEndSec, 0), 0, _0x57631e);
  if (_0x57631e <= 0 || _0x3fb6dc <= 0) {
    return MEDIA_CLIP_TIMELINE_ADD_SLOT_GAP_PX;
  }
  return Math.round(_0x327b8c / _0x57631e * _0x3fb6dc + MEDIA_CLIP_TIMELINE_ADD_SLOT_GAP_PX);
}
export function getMediaClipTimelineContentWidthPx(_0x2df028 = {}) {
  const _0x3efa70 = Math.max(MEDIA_CLIP_TIMELINE_MIN_WIDTH_PX, Math.ceil(toNumber(_0x2df028.trackWidthPx, 0)));
  return Math.max(_0x3efa70, getMediaClipTimelineAddSlotLeftPx(_0x2df028) + MEDIA_CLIP_TIMELINE_ADD_SLOT_WIDTH_PX);
}
export function getMediaClipTimelineNextZoom(_0x2b49c0 = {}) {
  const _0x402aa2 = Math.max(0.001, toNumber(_0x2b49c0.currentZoom, 1));
  const _0x767ff9 = Math.max(0.001, toNumber(_0x2b49c0.minZoom, 0.5));
  const _0x23ebf7 = Math.max(_0x767ff9, toNumber(_0x2b49c0.maxZoom, 6));
  const _0x56db38 = Math.max(1.001, toNumber(_0x2b49c0.factor, MEDIA_CLIP_TIMELINE_ZOOM_WHEEL_FACTOR));
  const _0x166e51 = toNumber(_0x2b49c0.delta, 0);
  if (!_0x166e51) {
    return clamp(_0x402aa2, _0x767ff9, _0x23ebf7);
  }
  return clamp(_0x402aa2 * (_0x166e51 > 0 ? 1 / _0x56db38 : _0x56db38), _0x767ff9, _0x23ebf7);
}
export function getMediaClipTimelineZoomScrollLeft(_0xeaf179 = {}) {
  const _0x21ff8f = Math.max(1, toNumber(_0xeaf179.viewportWidthPx, 1));
  const _0x1ab208 = clamp(toNumber(_0xeaf179.anchorX, _0x21ff8f / 2), 0, _0x21ff8f);
  const _0x564537 = Math.max(1, toNumber(_0xeaf179.nextContentWidthPx, 1));
  const _0x881089 = Math.max(0, _0x564537 - _0x21ff8f);
  const _0x1bd524 = toNumber(_0xeaf179.anchorSec, NaN);
  const _0x295f30 = Math.max(1, toNumber(_0xeaf179.trackWidthPx, 1));
  if (Number.isFinite(_0x1bd524)) {
    const _0x1830df = getMediaClipTimelineDisplayDuration(_0xeaf179.durationSec);
    const _0x542961 = clamp(_0x1bd524 / _0x1830df, 0, 1);
    return Math.max(0, Math.min(_0x881089, Math.round(_0x542961 * _0x295f30 - _0x1ab208)));
  }
  const _0x4ebb11 = clamp(toNumber(_0xeaf179.anchorRatio, 0), 0, 1);
  return Math.max(0, Math.min(_0x881089, Math.round(_0x4ebb11 * _0x564537 - _0x1ab208)));
}
function chooseTimelineTickStep(_0x8956cf, _0x3c5010 = 0) {
  const _0x14162a = getMediaClipTimelineDisplayDuration(_0x8956cf);
  const _0x2aae25 = Math.max(MEDIA_CLIP_TIMELINE_MIN_WIDTH_PX, toNumber(_0x3c5010, 0));
  const _0x5a2208 = _0x2aae25 / Math.max(1, _0x14162a);
  const _0x3e261c = MEDIA_CLIP_TIMELINE_TICK_MIN_SPACING_PX / Math.max(0.001, _0x5a2208);
  const _0x4f49b2 = MEDIA_CLIP_TIMELINE_TICK_STEPS_ASC.find(_0x311142 => _0x311142 >= _0x3e261c) || MEDIA_CLIP_TIMELINE_TICK_STEPS_SEC[0];
  const _0x4c6c4d = Math.max(0, MEDIA_CLIP_TIMELINE_TICK_STEPS_SEC.indexOf(_0x4f49b2));
  for (let _0x1fad7f = _0x4c6c4d; _0x1fad7f < MEDIA_CLIP_TIMELINE_TICK_STEPS_SEC.length; _0x1fad7f += 1) {
    const _0x498c46 = MEDIA_CLIP_TIMELINE_TICK_STEPS_SEC[_0x1fad7f];
    if (_0x498c46 === 1 || _0x14162a / _0x498c46 >= MEDIA_CLIP_TIMELINE_MIN_RULER_INTERVALS) {
      return _0x498c46;
    }
  }
  return 1;
}
export function buildMediaClipTimelineTicks(_0x497efa, _0x228846 = 0) {
  const _0x55a421 = getMediaClipTimelineDisplayDuration(_0x497efa);
  const _0x3a87e3 = chooseTimelineTickStep(_0x55a421, _0x228846);
  const _0x33ca62 = [];
  for (let _0x112125 = 0; _0x112125 <= _0x55a421 + 0.001; _0x112125 += _0x3a87e3) {
    _0x33ca62.push(roundMs(_0x112125));
  }
  return _0x33ca62;
}
export function buildMediaClipTimelineRulerMarks(_0x3286cf, _0x32cfd9 = 0, _0x198149 = {}) {
  const _0x272a65 = getMediaClipTimelineDisplayDuration(_0x3286cf);
  const _0x24442c = Math.max(MEDIA_CLIP_TIMELINE_MIN_WIDTH_PX, toNumber(_0x32cfd9, 0));
  const _0x89c8ff = _0x24442c / Math.max(1, _0x272a65);
  const _0x393edb = Math.max(0, Math.round(toNumber(_0x198149.frameRate, 0)));
  const _0x4ca16b = _0x393edb > 0 ? Math.floor(_0x272a65 * _0x393edb + 0.0001) : 0;
  const _0x344628 = _0x393edb > 0 && _0x89c8ff / _0x393edb >= MEDIA_CLIP_TIMELINE_FRAME_MARK_MIN_SPACING_PX && _0x4ca16b + 1 <= MEDIA_CLIP_TIMELINE_FRAME_MARK_MAX_COUNT;
  if (_0x344628) {
    const _0x109030 = _0x393edb % 2 === 0 ? _0x393edb / 2 : 0;
    return Array.from({
      length: _0x4ca16b + 1
    }, (_0x33078e, _0x3386f4) => ({
      sec: _0x3386f4 / _0x393edb,
      frameIndex: _0x3386f4,
      isFrame: true,
      isMajor: _0x3386f4 % _0x393edb === 0,
      isMid: _0x3386f4 > 0 && _0x109030 > 0 && _0x3386f4 % _0x109030 === 0 && _0x3386f4 % _0x393edb !== 0
    }));
  }
  const _0x42eba4 = buildMediaClipTimelineTicks(_0x272a65, _0x24442c);
  const _0x358a70 = Math.max(0.1, Number(_0x42eba4[1]) - Number(_0x42eba4[0]) || 1);
  const _0x551afb = MEDIA_CLIP_TIMELINE_RULER_MARK_STEPS_ASC.find(_0xbfd14a => {
    const _0x10034d = _0x358a70 / _0xbfd14a;
    return _0xbfd14a <= _0x358a70 && Math.abs(_0x10034d - Math.round(_0x10034d)) < 0.0001 && _0xbfd14a * _0x89c8ff >= MEDIA_CLIP_TIMELINE_RULER_MARK_MIN_SPACING_PX && Math.ceil(_0x272a65 / _0xbfd14a) + 1 <= MEDIA_CLIP_TIMELINE_RULER_MARK_MAX_COUNT;
  }) || _0x358a70;
  const _0xd26c9a = new Set(_0x42eba4.map(_0x316834 => _0x316834.toFixed(3)));
  const _0x10c087 = _0x358a70 / 2;
  const _0x3b2659 = [];
  for (let _0x1f81fa = 0; _0x1f81fa <= _0x272a65 + 0.001; _0x1f81fa += _0x551afb) {
    const _0x18a14a = roundMs(_0x1f81fa);
    const _0x311df9 = _0xd26c9a.has(_0x18a14a.toFixed(3));
    const _0x25588b = _0x10c087 > 0 ? _0x18a14a / _0x10c087 : 0;
    _0x3b2659.push({
      sec: _0x18a14a,
      frameIndex: -1,
      isFrame: false,
      isMajor: _0x311df9,
      isMid: !_0x311df9 && _0x10c087 >= _0x551afb && Math.abs(_0x25588b - Math.round(_0x25588b)) < 0.0001
    });
  }
  return _0x3b2659;
}