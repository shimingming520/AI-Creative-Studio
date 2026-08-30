import { resolveStoryboardCellAssetSrc, resolveStoryboardCellPreviewSrc } from "../../core/storyboardCellUtils.js";
import { localPathToUrl, normalizeLocalPath } from "../../utils/localMediaPath.js";
import { IMAGE_RATIO_OPTIONS, parseRatioLabel } from "../../../api/imageRatioPolicy.js";
import { AI_GENERATION_NODE_SHORT_SIDE } from "../../services/mediaSizingPolicy.js";
export const COLLAGE_NODE_TYPE = "collage";
export const COLLAGE_SCHEMA_VERSION = "collage.v1";
export const COLLAGE_COLLAPSED_SHORT_SIDE = 300;
export const COLLAGE_SLOT_SHORT_SIDE = AI_GENERATION_NODE_SHORT_SIDE;
export const COLLAGE_EXPANDED_SHORT_SIDE = COLLAGE_SLOT_SHORT_SIDE * 2;
export const COLLAGE_DEFAULT_SIZE = Object.freeze({
  width: COLLAGE_EXPANDED_SHORT_SIDE,
  height: COLLAGE_EXPANDED_SHORT_SIDE
});
export const COLLAGE_INITIAL_ASPECT_RATIO = "1:1";
export const COLLAGE_INITIAL_LAYOUT_PRESET_ID = "puzzle-2-rows";
export const COLLAGE_EXPORT_RESOLUTIONS = Object.freeze([{
  label: "1K",
  longSide: 1024
}, {
  label: "2K",
  longSide: 2048
}, {
  label: "4K",
  longSide: 4096
}]);
const COLLAGE_ASPECT_RATIO_LABELS = Object.freeze(["1:1", "16:9", "9:16", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9"]);
const imageRatioOptionsByLabel = new Map(IMAGE_RATIO_OPTIONS.map(_0x360aca => [_0x360aca.label, _0x360aca]));
function createCollageAspectRatioOption(_0x2eaabb) {
  const _0xb6d68a = imageRatioOptionsByLabel.get(_0x2eaabb);
  const _0x123863 = parseRatioLabel(_0xb6d68a?.label || _0x2eaabb);
  if (!_0x123863) {
    return null;
  }
  return Object.freeze({
    label: _0x123863.label,
    value: _0x123863.label,
    w: _0x123863.w,
    h: _0x123863.h
  });
}
export const COLLAGE_ASPECT_RATIO_OPTIONS = Object.freeze(COLLAGE_ASPECT_RATIO_LABELS.map(createCollageAspectRatioOption).filter(Boolean));
export const COLLAGE_BACKGROUND_TRANSPARENT = "transparent";
export const COLLAGE_BACKGROUND_DEFAULT = COLLAGE_BACKGROUND_TRANSPARENT;
export const COLLAGE_BACKGROUND_OPTIONS = Object.freeze([{
  id: "transparent",
  label: "透明",
  value: COLLAGE_BACKGROUND_TRANSPARENT
}, {
  id: "white",
  label: "白色",
  value: "var(--white)"
}, {
  id: "black",
  label: "黑色",
  value: "var(--black)"
}, {
  id: "indigo",
  label: "靛蓝",
  value: "var(--indigo)"
}, {
  id: "green",
  label: "绿色",
  value: "var(--green)"
}, {
  id: "gold",
  label: "金色",
  value: "var(--gold)"
}, {
  id: "red",
  label: "红色",
  value: "var(--red)"
}, {
  id: "purple",
  label: "紫色",
  value: "var(--purple)"
}, {
  id: "pink",
  label: "粉色",
  value: "var(--group-pink)"
}, {
  id: "slate",
  label: "灰蓝",
  value: "var(--group-slate)"
}, {
  id: "cyan",
  label: "青色",
  value: "var(--cyan)"
}]);
export const COLLAGE_LAYOUT_STYLE_DEFAULTS = Object.freeze({
  outerPadding: 20,
  gap: 10,
  cornerRadius: 0
});
export const COLLAGE_IMAGE_SCALE_DEFAULT = 1;
export const COLLAGE_IMAGE_SCALE_MIN = 1;
export const COLLAGE_IMAGE_SCALE_MAX = 4;
const COLLAGE_DIVIDER_MIN_SIZE = 4;
const COLLAGE_DIVIDER_MAX_MIN_SIZE = 24;
const COLLAGE_DIVIDER_MIN_SIZE_RATIO = 0.02;
const slot = (_0x13ffa4, _0x4e92dd, _0x4bbf86, _0x511d4e) => ({
  x: _0x13ffa4,
  y: _0x4e92dd,
  width: _0x4bbf86,
  height: _0x511d4e
});
export const COLLAGE_LAYOUT_PRESETS = Object.freeze([{
  id: "freeform",
  label: "自由",
  slotCount: 0
}, {
  id: "puzzle-2-rows",
  label: "上下",
  slotCount: 2,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 500), slot(0, 500, 1000, 500)]
}, {
  id: "puzzle-2-cols",
  label: "左右",
  slotCount: 2,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 1000), slot(500, 0, 500, 1000)]
}, {
  id: "puzzle-3-rows",
  label: "三横",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 333.333), slot(0, 333.333, 1000, 333.334), slot(0, 666.667, 1000, 333.333)]
}, {
  id: "puzzle-3-cols",
  label: "三竖",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 333.333, 1000), slot(333.333, 0, 333.334, 1000), slot(666.667, 0, 333.333, 1000)]
}, {
  id: "puzzle-3-top-wide",
  label: "上1下2",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 500), slot(0, 500, 500, 500), slot(500, 500, 500, 500)]
}, {
  id: "puzzle-3-bottom-wide",
  label: "上2下1",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 500), slot(500, 0, 500, 500), slot(0, 500, 1000, 500)]
}, {
  id: "puzzle-3-left-tall",
  label: "左1右2",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 1000), slot(500, 0, 500, 500), slot(500, 500, 500, 500)]
}, {
  id: "puzzle-3-right-tall",
  label: "左2右1",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 500), slot(0, 500, 500, 500), slot(500, 0, 500, 1000)]
}, {
  id: "puzzle-3-hero-top",
  label: "大上",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 640), slot(0, 640, 360, 360), slot(360, 640, 640, 360)]
}, {
  id: "puzzle-3-hero-left",
  label: "大左",
  slotCount: 3,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 640, 1000), slot(640, 0, 360, 500), slot(640, 500, 360, 500)]
}, {
  id: "puzzle-4-even",
  label: "四宫格",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 500), slot(500, 0, 500, 500), slot(0, 500, 500, 500), slot(500, 500, 500, 500)]
}, {
  id: "puzzle-4-rows",
  label: "四横",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 250), slot(0, 250, 1000, 250), slot(0, 500, 1000, 250), slot(0, 750, 1000, 250)]
}, {
  id: "puzzle-4-cols",
  label: "四竖",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 250, 1000), slot(250, 0, 250, 1000), slot(500, 0, 250, 1000), slot(750, 0, 250, 1000)]
}, {
  id: "puzzle-4-top-wide",
  label: "上1下3",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 500), slot(0, 500, 333.333, 500), slot(333.333, 500, 333.334, 500), slot(666.667, 500, 333.333, 500)]
}, {
  id: "puzzle-4-bottom-wide",
  label: "上3下1",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 333.333, 500), slot(333.333, 0, 333.334, 500), slot(666.667, 0, 333.333, 500), slot(0, 500, 1000, 500)]
}, {
  id: "puzzle-4-left-wide",
  label: "左1右3",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 1000), slot(500, 0, 500, 333.333), slot(500, 333.333, 500, 333.334), slot(500, 666.667, 500, 333.333)]
}, {
  id: "puzzle-4-right-wide",
  label: "左3右1",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 500, 333.333), slot(0, 333.333, 500, 333.334), slot(0, 666.667, 500, 333.333), slot(500, 0, 500, 1000)]
}, {
  id: "puzzle-4-bands",
  label: "横向组合",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 300), slot(0, 300, 500, 400), slot(500, 300, 500, 400), slot(0, 700, 1000, 300)]
}, {
  id: "puzzle-4-hero-top",
  label: "大上",
  slotCount: 4,
  width: 1000,
  height: 1000,
  slots: [slot(0, 0, 1000, 600), slot(0, 600, 333.333, 400), slot(333.333, 600, 333.334, 400), slot(666.667, 600, 333.333, 400)]
}]);
export const COLLAGE_TEMPLATE_GROUPS = Object.freeze([2, 3, 4].map(_0x55a7c1 => ({
  slotCount: _0x55a7c1,
  label: String(_0x55a7c1),
  presets: COLLAGE_LAYOUT_PRESETS.filter(_0x3f2fd1 => _0x3f2fd1.slotCount === _0x55a7c1)
})));
function trimString(_0x2c395d) {
  if (typeof _0x2c395d === "string") {
    return _0x2c395d.trim();
  } else {
    return "";
  }
}
function toPositiveNumber(_0x3d73cc, _0x3d2d79 = 0) {
  const _0x31998a = Number(_0x3d73cc);
  if (Number.isFinite(_0x31998a) && _0x31998a > 0) {
    return _0x31998a;
  } else {
    return _0x3d2d79;
  }
}
function roundDimension(_0x2f6631, _0x56fba7 = 1) {
  return Math.max(1, Math.round(toPositiveNumber(_0x2f6631, _0x56fba7)));
}
export function resolveCollageSizeByShortSide({
  width: _0x375083,
  height: _0x31ddcc,
  shortSide = COLLAGE_EXPANDED_SHORT_SIDE
} = {}) {
  const _0x336d5a = roundDimension(shortSide, COLLAGE_EXPANDED_SHORT_SIDE);
  const _0x5cac42 = toPositiveNumber(_0x375083, 0);
  const _0x5a8aea = toPositiveNumber(_0x31ddcc, 0);
  if (!(_0x5cac42 > 0) || !(_0x5a8aea > 0)) {
    return {
      width: _0x336d5a,
      height: _0x336d5a
    };
  }
  const _0x1a26f8 = _0x5cac42 / _0x5a8aea;
  if (!Number.isFinite(_0x1a26f8) || _0x1a26f8 <= 0) {
    return {
      width: _0x336d5a,
      height: _0x336d5a
    };
  }
  if (_0x1a26f8 >= 1) {
    return {
      width: roundDimension(_0x336d5a * _0x1a26f8, _0x336d5a),
      height: _0x336d5a
    };
  }
  return {
    width: _0x336d5a,
    height: roundDimension(_0x336d5a / _0x1a26f8, _0x336d5a)
  };
}
export function resolveCollagePresetSizeBySlotShortSide(_0x38b187, {
  aspectRatio = "",
  slotShortSide = COLLAGE_SLOT_SHORT_SIDE
} = {}) {
  const _0x4df6f2 = _0x38b187 && typeof _0x38b187 === "object" ? _0x38b187 : {};
  const _0x3aece4 = toPositiveNumber(_0x4df6f2.width, COLLAGE_DEFAULT_SIZE.width);
  const _0x115956 = toPositiveNumber(_0x4df6f2.height, COLLAGE_DEFAULT_SIZE.height);
  const _0x58d34c = getCollageAspectRatioOption(aspectRatio);
  const _0x57280b = _0x58d34c?.w || _0x3aece4;
  const _0x5700e4 = _0x58d34c?.h || _0x115956;
  const _0x2255fe = _0x5700e4 / _0x57280b;
  const _0x1d94ad = roundDimension(slotShortSide, COLLAGE_SLOT_SHORT_SIDE);
  const _0x450beb = Array.isArray(_0x4df6f2.slots) ? _0x4df6f2.slots : [];
  let _0x19b457 = Infinity;
  for (const _0x3bb0bd of _0x450beb) {
    const _0x2d6159 = toPositiveNumber(_0x3bb0bd?.width, 0) / _0x3aece4;
    const _0xa51b38 = toPositiveNumber(_0x3bb0bd?.height, 0) / _0x115956 * _0x2255fe;
    const _0xce55fb = Math.min(_0x2d6159, _0xa51b38);
    if (Number.isFinite(_0xce55fb) && _0xce55fb > 0) {
      _0x19b457 = Math.min(_0x19b457, _0xce55fb);
    }
  }
  if (!Number.isFinite(_0x19b457) || _0x19b457 <= 0) {
    _0x19b457 = Math.min(1, _0x2255fe);
  }
  const _0x541e82 = _0x1d94ad / _0x19b457;
  const _0x1fc46b = _0x541e82 * _0x2255fe;
  return {
    width: roundDimension(_0x541e82, COLLAGE_DEFAULT_SIZE.width),
    height: roundDimension(_0x1fc46b, COLLAGE_DEFAULT_SIZE.height)
  };
}
function normalizeMediaUrl(_0x3d5a5a) {
  const _0x5712b5 = trimString(_0x3d5a5a);
  if (!_0x5712b5) {
    return "";
  }
  if (/^(https?:|blob:|data:)/i.test(_0x5712b5)) {
    return _0x5712b5;
  }
  const _0x20a9fe = localPathToUrl(_0x5712b5);
  return _0x20a9fe || "";
}
function pickMediaUrl(..._0x1c24a9) {
  for (const _0x505ee0 of _0x1c24a9) {
    const _0x3ebde1 = normalizeMediaUrl(_0x505ee0);
    if (_0x3ebde1) {
      return _0x3ebde1;
    }
  }
  return "";
}
function pickLocalPath(..._0x437caa) {
  for (const _0xd58e0 of _0x437caa) {
    const _0x1247c3 = normalizeLocalPath(_0xd58e0);
    if (_0x1247c3) {
      return _0x1247c3;
    }
  }
  return "";
}
export function resolveCollageItemPreviewUrl(_0x3af860) {
  return pickMediaUrl(_0x3af860?.url, _0x3af860?.localPath, _0x3af860?.thumbLocalPath, _0x3af860?.sourceUrl, _0x3af860?.sourceLocalPath);
}
export function resolveCollageItemSourceImage(_0x393c97) {
  const _0x440760 = pickLocalPath(_0x393c97?.sourceLocalPath);
  const _0x45f6c5 = normalizeMediaUrl(_0x393c97?.sourceUrl);
  const _0x79b928 = toPositiveNumber(_0x393c97?.sourceWidth, 0);
  const _0x1f08e1 = toPositiveNumber(_0x393c97?.sourceHeight, 0);
  const _0x2582c7 = toPositiveNumber(_0x393c97?.imageWidth, 0);
  const _0x59d5da = toPositiveNumber(_0x393c97?.imageHeight, 0);
  const _0x320437 = _0x79b928 || _0x2582c7;
  const _0x594c2a = _0x1f08e1 || _0x59d5da;
  const _0x51246c = _0x320437 > 0 && _0x594c2a > 0;
  const _0x2beb08 = !!_0x440760 || !!_0x45f6c5;
  if (_0x2beb08) {
    return {
      src: _0x45f6c5 || normalizeMediaUrl(_0x440760),
      localPath: _0x440760 || pickLocalPath(_0x45f6c5),
      width: _0x320437 || toPositiveNumber(_0x393c97?.width, 0),
      height: _0x594c2a || toPositiveNumber(_0x393c97?.height, 0),
      hasIntrinsicSize: _0x51246c,
      isOriginalSource: true
    };
  }
  const _0x3e5395 = pickLocalPath(_0x393c97?.localPath, _0x393c97?.url, _0x393c97?.thumbLocalPath);
  return {
    src: pickMediaUrl(_0x393c97?.url, _0x393c97?.localPath, _0x393c97?.thumbLocalPath),
    localPath: _0x3e5395,
    width: _0x2582c7 || toPositiveNumber(_0x393c97?.width, 0),
    height: _0x59d5da || toPositiveNumber(_0x393c97?.height, 0),
    hasIntrinsicSize: _0x2582c7 > 0 && _0x59d5da > 0,
    isOriginalSource: false
  };
}
function pickMainImageItem(_0x217786, _0x230203) {
  if (!Array.isArray(_0x217786) || _0x217786.length === 0) {
    return null;
  }
  const _0x59d1a1 = Number(_0x230203);
  const _0x56a700 = Number.isFinite(_0x59d1a1) ? Math.max(0, Math.trunc(_0x59d1a1)) : 0;
  return _0x217786[_0x56a700] || _0x217786[0] || null;
}
export function getCollageLayoutPreset(_0x983059) {
  const _0x4c573f = trimString(_0x983059) || "freeform";
  return COLLAGE_LAYOUT_PRESETS.find(_0xfc520a => _0xfc520a.id === _0x4c573f) || COLLAGE_LAYOUT_PRESETS[0];
}
export function getCollageExportResolution(_0x3fe1ca) {
  const _0x4f5dc8 = roundDimension(_0x3fe1ca, 2048);
  return COLLAGE_EXPORT_RESOLUTIONS.find(_0x591992 => _0x591992.longSide === _0x4f5dc8) || COLLAGE_EXPORT_RESOLUTIONS[1];
}
export function getCollageAspectRatioOption(_0xb8b30d) {
  const _0x526055 = parseRatioLabel(_0xb8b30d);
  if (!_0x526055) {
    return null;
  }
  return COLLAGE_ASPECT_RATIO_OPTIONS.find(_0x22073e => _0x22073e.label === _0x526055.label) || null;
}
export function getCollageBackgroundOption(_0x370601) {
  const _0x2105ca = trimString(_0x370601);
  const _0x41bda8 = _0x2105ca || COLLAGE_BACKGROUND_DEFAULT;
  return COLLAGE_BACKGROUND_OPTIONS.find(_0x54d291 => _0x54d291.id === _0x41bda8 || _0x54d291.value === _0x41bda8) || COLLAGE_BACKGROUND_OPTIONS.find(_0x23d0af => _0x23d0af.value === COLLAGE_BACKGROUND_DEFAULT);
}
export function normalizeCollageBackgroundColor(_0x190990) {
  return getCollageBackgroundOption(_0x190990).value;
}
export function isCollageBackgroundTransparent(_0x376654) {
  return getCollageBackgroundOption(_0x376654).id === "transparent";
}
export function normalizeCollageStyleValue(_0x2f020d, _0x2159c4 = 0) {
  const _0x5e19c9 = Number(_0x2f020d);
  if (!Number.isFinite(_0x5e19c9)) {
    return _0x2159c4;
  }
  return Math.min(100, Math.max(0, Math.round(_0x5e19c9)));
}
export function normalizeCollageImageScale(_0x3e8cb7, _0x3eaa0f = COLLAGE_IMAGE_SCALE_DEFAULT) {
  const _0x432e63 = Number(_0x3e8cb7);
  const _0xab1f1f = Number.isFinite(Number(_0x3eaa0f)) ? Number(_0x3eaa0f) : COLLAGE_IMAGE_SCALE_DEFAULT;
  const _0x5b5c68 = Number.isFinite(_0x432e63) ? _0x432e63 : _0xab1f1f;
  const _0x15500b = Math.min(COLLAGE_IMAGE_SCALE_MAX, Math.max(COLLAGE_IMAGE_SCALE_MIN, _0x5b5c68));
  return Math.round(_0x15500b * 100) / 100;
}
export function getCollageLayoutStyle(_0x2af0df) {
  return {
    outerPadding: normalizeCollageStyleValue(_0x2af0df?.outerPadding, COLLAGE_LAYOUT_STYLE_DEFAULTS.outerPadding),
    gap: normalizeCollageStyleValue(_0x2af0df?.gap, COLLAGE_LAYOUT_STYLE_DEFAULTS.gap),
    cornerRadius: normalizeCollageStyleValue(_0x2af0df?.cornerRadius, COLLAGE_LAYOUT_STYLE_DEFAULTS.cornerRadius)
  };
}
export function isCollageItemEmpty(_0x1b5d68) {
  return !trimString(_0x1b5d68?.url) && !trimString(_0x1b5d68?.localPath) && !trimString(_0x1b5d68?.thumbLocalPath) && !trimString(_0x1b5d68?.sourceUrl) && !trimString(_0x1b5d68?.sourceLocalPath);
}
export function normalizeEmptyCollageItem(_0x542aba = {}, _0x3c5113 = 0) {
  return {
    id: trimString(_0x542aba?.id) || "collage-slot-" + _0x3c5113,
    slotIndex: Number.isFinite(Number(_0x542aba?.slotIndex)) ? Number(_0x542aba.slotIndex) : _0x3c5113,
    isEmpty: true,
    x: Number(_0x542aba?.x) || 0,
    y: Number(_0x542aba?.y) || 0,
    width: toPositiveNumber(_0x542aba?.width, 1),
    height: toPositiveNumber(_0x542aba?.height, 1),
    fit: trimString(_0x542aba?.fit) || "cover",
    focusX: 0.5,
    focusY: 0.5,
    imageScale: COLLAGE_IMAGE_SCALE_DEFAULT,
    sourceNodeId: "",
    url: "",
    localPath: "",
    thumbLocalPath: "",
    sourceLocalPath: "",
    sourceUrl: "",
    sourceDisplayWidth: null,
    sourceDisplayHeight: null,
    label: ""
  };
}
function resolveSlotInset(_0x2e7235, _0x528d04) {
  const _0x432915 = Math.min(normalizeCollageStyleValue(_0x528d04, 0), Math.max(0, _0x2e7235.width * 0.45), Math.max(0, _0x2e7235.height * 0.45));
  return _0x432915 / 2;
}
export function resolveCollageItemFrames(_0x3463f8) {
  const _0x5f4f14 = toPositiveNumber(_0x3463f8?.width, COLLAGE_DEFAULT_SIZE.width);
  const _0x3bef6b = toPositiveNumber(_0x3463f8?.height, COLLAGE_DEFAULT_SIZE.height);
  const {
    outerPadding: _0x14c789,
    gap: _0x2d6b6b,
    cornerRadius: _0x51c979
  } = getCollageLayoutStyle(_0x3463f8);
  const _0x1c1f26 = Math.min(_0x14c789, Math.max(0, _0x5f4f14 * 0.45), Math.max(0, _0x3bef6b * 0.45));
  const _0x459450 = Math.max(1, _0x5f4f14 - _0x1c1f26 * 2);
  const _0x5552b2 = Math.max(1, _0x3bef6b - _0x1c1f26 * 2);
  const _0x5488ec = _0x459450 / _0x5f4f14;
  const _0x1a21cf = _0x5552b2 / _0x3bef6b;
  const _0x1a9ddd = Array.isArray(_0x3463f8?.items) ? _0x3463f8.items : [];
  return _0x1a9ddd.map((_0x2ebc81, _0x356a7c) => {
    const _0x226d58 = {
      x: _0x1c1f26 + (Number(_0x2ebc81?.x) || 0) * _0x5488ec,
      y: _0x1c1f26 + (Number(_0x2ebc81?.y) || 0) * _0x1a21cf,
      width: toPositiveNumber(_0x2ebc81?.width, 1) * _0x5488ec,
      height: toPositiveNumber(_0x2ebc81?.height, 1) * _0x1a21cf
    };
    const _0x1a2efa = resolveSlotInset(_0x226d58, _0x2d6b6b);
    const _0x555848 = {
      x: _0x226d58.x + _0x1a2efa,
      y: _0x226d58.y + _0x1a2efa,
      width: Math.max(1, _0x226d58.width - _0x1a2efa * 2),
      height: Math.max(1, _0x226d58.height - _0x1a2efa * 2)
    };
    return {
      item: _0x2ebc81,
      index: _0x356a7c,
      frame: _0x555848,
      style: {
        outerPadding: _0x1c1f26,
        gap: _0x2d6b6b,
        cornerRadius: _0x51c979
      },
      isEmpty: isCollageItemEmpty(_0x2ebc81)
    };
  });
}
export function getCollageItemIndexAtWorldPoint(_0x8a7c87, _0x4615e6, _0x9e205) {
  if (!_0x8a7c87 || _0x8a7c87.type !== COLLAGE_NODE_TYPE) {
    return -1;
  }
  const _0x2f92a4 = Number(_0x4615e6) - (Number(_0x8a7c87.x) || 0);
  const _0x3f930e = Number(_0x9e205) - (Number(_0x8a7c87.y) || 0);
  if (!Number.isFinite(_0x2f92a4) || !Number.isFinite(_0x3f930e)) {
    return -1;
  }
  const _0x26279a = resolveCollageItemFrames(_0x8a7c87);
  for (let _0x1a69d3 = _0x26279a.length - 1; _0x1a69d3 >= 0; _0x1a69d3 -= 1) {
    const {
      frame: _0xa99626
    } = _0x26279a[_0x1a69d3];
    if (_0x2f92a4 >= _0xa99626.x && _0x2f92a4 <= _0xa99626.x + _0xa99626.width && _0x3f930e >= _0xa99626.y && _0x3f930e <= _0xa99626.y + _0xa99626.height) {
      return _0x26279a[_0x1a69d3].index;
    }
  }
  return -1;
}
function getCollageSlotGeometry(_0x2b7296, _0x2c5553) {
  const _0x549eb5 = getRawCollageItemFrame(_0x2b7296);
  return {
    slotIndex: _0x2c5553,
    x: _0x549eb5.x,
    y: _0x549eb5.y,
    width: _0x549eb5.width,
    height: _0x549eb5.height,
    freeformX: Number.isFinite(Number(_0x2b7296?.freeformX)) ? Number(_0x2b7296.freeformX) : _0x549eb5.x,
    freeformY: Number.isFinite(Number(_0x2b7296?.freeformY)) ? Number(_0x2b7296.freeformY) : _0x549eb5.y,
    freeformWidth: toPositiveNumber(_0x2b7296?.freeformWidth, _0x549eb5.width),
    freeformHeight: toPositiveNumber(_0x2b7296?.freeformHeight, _0x549eb5.height)
  };
}
function createEmptyCollageSlotFromGeometry(_0x10e3b7, _0x85a1a0) {
  return {
    ...normalizeEmptyCollageItem({
      ..._0x10e3b7,
      id: "collage-slot-" + _0x85a1a0
    }, _0x85a1a0),
    freeformX: _0x10e3b7.freeformX,
    freeformY: _0x10e3b7.freeformY,
    freeformWidth: _0x10e3b7.freeformWidth,
    freeformHeight: _0x10e3b7.freeformHeight
  };
}
function placeCollageItemIntoSlot(_0x3633f6, _0x32806e, _0x567a2e) {
  return {
    ..._0x3633f6,
    slotIndex: _0x567a2e,
    isEmpty: false,
    x: _0x32806e.x,
    y: _0x32806e.y,
    width: _0x32806e.width,
    height: _0x32806e.height,
    freeformX: _0x32806e.freeformX,
    freeformY: _0x32806e.freeformY,
    freeformWidth: _0x32806e.freeformWidth,
    freeformHeight: _0x32806e.freeformHeight
  };
}
export function buildCollageItemSwapPatch(_0x54d5e4, _0x277626, _0x4d3cfb) {
  const _0x180738 = (Array.isArray(_0x54d5e4?.items) ? _0x54d5e4.items : []).map(_0x622bf => ({
    ..._0x622bf
  }));
  const _0x314927 = _0x180738[_0x277626];
  const _0x18645b = _0x180738[_0x4d3cfb];
  if (!_0x314927 || !_0x18645b || _0x277626 === _0x4d3cfb || isCollageItemEmpty(_0x314927)) {
    return null;
  }
  const _0x1dcc8b = getCollageSlotGeometry(_0x314927, _0x277626);
  const _0x5cdb86 = getCollageSlotGeometry(_0x18645b, _0x4d3cfb);
  _0x180738[_0x4d3cfb] = placeCollageItemIntoSlot(_0x314927, _0x5cdb86, _0x4d3cfb);
  _0x180738[_0x277626] = isCollageItemEmpty(_0x18645b) ? createEmptyCollageSlotFromGeometry(_0x1dcc8b, _0x277626) : placeCollageItemIntoSlot(_0x18645b, _0x1dcc8b, _0x277626);
  return {
    items: _0x180738
  };
}
function roundCollageGeometryValue(_0x3f30a9) {
  return Math.round((Number(_0x3f30a9) || 0) * 100) / 100;
}
function getRawCollageItemFrame(_0x4bc5a8) {
  return {
    x: Number(_0x4bc5a8?.x) || 0,
    y: Number(_0x4bc5a8?.y) || 0,
    width: toPositiveNumber(_0x4bc5a8?.width, 1),
    height: toPositiveNumber(_0x4bc5a8?.height, 1)
  };
}
function getCollageDividerMinSize(_0x291344) {
  const _0x566564 = toPositiveNumber(_0x291344, 1);
  return Math.min(COLLAGE_DIVIDER_MAX_MIN_SIZE, Math.max(COLLAGE_DIVIDER_MIN_SIZE, _0x566564 * COLLAGE_DIVIDER_MIN_SIZE_RATIO), _0x566564 * 0.45);
}
function collectCollageDividerBoundary(_0x4c7050, _0x2ff591, _0x1fc336, _0x5aca74) {
  const _0x2129fc = 0.5;
  const _0x5e85c9 = [];
  const _0x7d5154 = [];
  const _0x11b1ac = [];
  const _0x1274a2 = _0x2ff591 === "x";
  const _0x166d59 = _0x1274a2 ? "y" : "x";
  const _0x532f63 = _0x1274a2 ? "height" : "width";
  const _0x44d421 = _0x1274a2 ? "x" : "y";
  const _0x464f18 = _0x1274a2 ? "width" : "height";
  if (_0x1fc336 <= _0x2129fc || _0x1fc336 >= _0x5aca74 - _0x2129fc) {
    return null;
  }
  _0x4c7050.forEach((_0x226a17, _0x52bd2b) => {
    const _0x4c2177 = getRawCollageItemFrame(_0x226a17);
    const _0xd4af9a = _0x4c2177[_0x44d421];
    const _0x10c353 = _0xd4af9a + _0x4c2177[_0x464f18];
    if (Math.abs(_0x10c353 - _0x1fc336) <= _0x2129fc) {
      _0x5e85c9.push(_0x52bd2b);
    }
    if (Math.abs(_0xd4af9a - _0x1fc336) <= _0x2129fc) {
      _0x7d5154.push(_0x52bd2b);
    }
  });
  if (_0x5e85c9.length === 0 || _0x7d5154.length === 0) {
    return null;
  }
  for (const _0x3a27a7 of _0x5e85c9) {
    const _0x20f9cc = getRawCollageItemFrame(_0x4c7050[_0x3a27a7]);
    for (const _0x5f1de8 of _0x7d5154) {
      const _0x5e4f64 = getRawCollageItemFrame(_0x4c7050[_0x5f1de8]);
      const _0x3ecc31 = Math.max(_0x20f9cc[_0x166d59], _0x5e4f64[_0x166d59]);
      const _0x3cdca1 = Math.min(_0x20f9cc[_0x166d59] + _0x20f9cc[_0x532f63], _0x5e4f64[_0x166d59] + _0x5e4f64[_0x532f63]);
      if (_0x3cdca1 - _0x3ecc31 > 1) {
        _0x11b1ac.push({
          start: _0x3ecc31,
          end: _0x3cdca1
        });
      }
    }
  }
  if (_0x11b1ac.length === 0) {
    return null;
  }
  const _0x544c23 = Math.min(..._0x11b1ac.map(_0x49ef84 => _0x49ef84.start));
  const _0x5ee10e = Math.max(..._0x11b1ac.map(_0x11b9d => _0x11b9d.end));
  const _0x4ab045 = roundCollageGeometryValue(_0x1fc336);
  return {
    id: _0x2ff591 + "-" + _0x4ab045,
    axis: _0x2ff591,
    position: _0x4ab045,
    spanStart: roundCollageGeometryValue(_0x544c23),
    spanEnd: roundCollageGeometryValue(_0x5ee10e),
    beforeIndexes: Array.from(new Set(_0x5e85c9)),
    afterIndexes: Array.from(new Set(_0x7d5154))
  };
}
function rawFrameRangesOverlap(_0x42c788, _0x2f169b, _0x1148c4, _0x487f62) {
  const _0x3b93da = Math.max(_0x42c788[_0x1148c4], _0x2f169b[_0x1148c4]);
  const _0x3cdcf3 = Math.min(_0x42c788[_0x1148c4] + _0x42c788[_0x487f62], _0x2f169b[_0x1148c4] + _0x2f169b[_0x487f62]);
  return _0x3cdcf3 - _0x3b93da > 1;
}
function collectCollageAxisDividers(_0x34cf01, _0x468b3a, _0x3f28ad) {
  const _0x1ce2e1 = 0.5;
  const _0xf91c1b = _0x468b3a === "x";
  const _0x489732 = _0xf91c1b ? "x" : "y";
  const _0x1dfa91 = _0xf91c1b ? "width" : "height";
  const _0x54e85f = _0xf91c1b ? "y" : "x";
  const _0x25450a = _0xf91c1b ? "height" : "width";
  const _0x201fd4 = new Map();
  _0x34cf01.forEach((_0x631ac2, _0x1f54a6) => {
    const _0x536d81 = getRawCollageItemFrame(_0x631ac2);
    const _0x528f22 = _0x536d81[_0x489732];
    if (_0x528f22 <= _0x1ce2e1 || _0x528f22 >= _0x3f28ad - _0x1ce2e1) {
      return;
    }
    let _0xb1595c = -Infinity;
    let _0x59f94e = [];
    _0x34cf01.forEach((_0x21166c, _0x4b9f7a) => {
      if (_0x4b9f7a === _0x1f54a6) {
        return;
      }
      const _0x19443d = getRawCollageItemFrame(_0x21166c);
      const _0x4573f2 = _0x19443d[_0x489732] + _0x19443d[_0x1dfa91];
      if (_0x4573f2 > _0x528f22 + _0x1ce2e1) {
        return;
      }
      if (!rawFrameRangesOverlap(_0x19443d, _0x536d81, _0x54e85f, _0x25450a)) {
        return;
      }
      if (_0x4573f2 > _0xb1595c + _0x1ce2e1) {
        _0xb1595c = _0x4573f2;
        _0x59f94e = [_0x4b9f7a];
      } else if (Math.abs(_0x4573f2 - _0xb1595c) <= _0x1ce2e1) {
        _0x59f94e.push(_0x4b9f7a);
      }
    });
    if (_0x59f94e.length === 0) {
      return;
    }
    const _0x13d1ea = _0x468b3a + "-" + roundCollageGeometryValue(_0x528f22);
    const _0x1574c3 = _0x201fd4.get(_0x13d1ea) || {
      id: _0x13d1ea,
      axis: _0x468b3a,
      position: roundCollageGeometryValue(_0x528f22),
      spanStart: Infinity,
      spanEnd: -Infinity,
      beforeIndexes: new Set(),
      afterIndexes: new Set()
    };
    _0x1574c3.afterIndexes.add(_0x1f54a6);
    for (const _0x24e71b of _0x59f94e) {
      _0x1574c3.beforeIndexes.add(_0x24e71b);
      const _0x660d55 = getRawCollageItemFrame(_0x34cf01[_0x24e71b]);
      _0x1574c3.spanStart = Math.min(_0x1574c3.spanStart, Math.max(_0x660d55[_0x54e85f], _0x536d81[_0x54e85f]));
      _0x1574c3.spanEnd = Math.max(_0x1574c3.spanEnd, Math.min(_0x660d55[_0x54e85f] + _0x660d55[_0x25450a], _0x536d81[_0x54e85f] + _0x536d81[_0x25450a]));
    }
    _0x201fd4.set(_0x13d1ea, _0x1574c3);
  });
  return Array.from(_0x201fd4.values()).filter(_0x17fe75 => _0x17fe75.spanEnd - _0x17fe75.spanStart > 1).map(_0x20507c => ({
    ..._0x20507c,
    spanStart: roundCollageGeometryValue(_0x20507c.spanStart),
    spanEnd: roundCollageGeometryValue(_0x20507c.spanEnd),
    beforeIndexes: Array.from(_0x20507c.beforeIndexes),
    afterIndexes: Array.from(_0x20507c.afterIndexes)
  }));
}
export function resolveCollageEditableDividers(_0x4a3b31) {
  const _0x2e54be = toPositiveNumber(_0x4a3b31?.width, COLLAGE_DEFAULT_SIZE.width);
  const _0x27b247 = toPositiveNumber(_0x4a3b31?.height, COLLAGE_DEFAULT_SIZE.height);
  const _0x4f981a = Array.isArray(_0x4a3b31?.items) ? _0x4a3b31.items : [];
  const _0x532ef0 = [...collectCollageAxisDividers(_0x4f981a, "x", _0x2e54be), ...collectCollageAxisDividers(_0x4f981a, "y", _0x27b247)];
  return _0x532ef0.sort((_0x42a677, _0x2c021e) => _0x42a677.axis === _0x2c021e.axis ? _0x42a677.position - _0x2c021e.position : _0x42a677.axis.localeCompare(_0x2c021e.axis));
}
export function buildCollageDividerDragPatch(_0x3cd10d, _0x18e7b0, _0x41c071) {
  const _0x571478 = _0x18e7b0?.axis === "y" ? "y" : "x";
  const _0x4cac7f = _0x571478 === "x" ? "width" : "height";
  const _0x57cd61 = _0x571478 === "x" ? "x" : "y";
  const _0x4a38e3 = toPositiveNumber(_0x571478 === "x" ? _0x3cd10d?.width : _0x3cd10d?.height, _0x571478 === "x" ? COLLAGE_DEFAULT_SIZE.width : COLLAGE_DEFAULT_SIZE.height);
  const _0x31cf88 = (Array.isArray(_0x3cd10d?.items) ? _0x3cd10d.items : []).map(_0x4a25e7 => ({
    ..._0x4a25e7
  }));
  const _0xf1b2d5 = Array.isArray(_0x18e7b0?.beforeIndexes) ? _0x18e7b0.beforeIndexes : [];
  const _0x2ea6f9 = Array.isArray(_0x18e7b0?.afterIndexes) ? _0x18e7b0.afterIndexes : [];
  if (_0xf1b2d5.length === 0 || _0x2ea6f9.length === 0) {
    return {
      items: _0x31cf88,
      delta: 0
    };
  }
  const _0x892481 = new Set(_0xf1b2d5);
  const _0xbc85d = new Set(_0x2ea6f9);
  const _0xfa49c7 = new Set([..._0x892481, ..._0xbc85d]);
  const _0xb00df5 = Number(_0x18e7b0?.position) || 0;
  const _0x134f69 = getCollageDividerMinSize(_0x4a38e3);
  let _0x3cd4f4 = -Infinity;
  let _0x54796c = Infinity;
  for (const _0x11a693 of _0x892481) {
    const _0x9edfdc = _0x31cf88[_0x11a693];
    if (!_0x9edfdc) {
      continue;
    }
    const _0x3f0812 = getRawCollageItemFrame(_0x9edfdc);
    _0x3cd4f4 = Math.max(_0x3cd4f4, _0x134f69 - _0x3f0812[_0x4cac7f]);
    _0x54796c = Math.min(_0x54796c, _0x4a38e3 - (_0x3f0812[_0x57cd61] + _0x3f0812[_0x4cac7f]));
  }
  for (const _0x43c9a4 of _0xbc85d) {
    const _0x87f7a3 = _0x31cf88[_0x43c9a4];
    if (!_0x87f7a3) {
      continue;
    }
    const _0x325704 = getRawCollageItemFrame(_0x87f7a3);
    _0x3cd4f4 = Math.max(_0x3cd4f4, -_0x325704[_0x57cd61]);
    _0x54796c = Math.min(_0x54796c, _0x325704[_0x4cac7f] - _0x134f69);
  }
  const _0x54bdf4 = Math.min(_0x54796c, Math.max(_0x3cd4f4, Number(_0x41c071) || 0));
  for (const _0x4a8918 of _0x892481) {
    const _0x1588e8 = _0x31cf88[_0x4a8918];
    if (!_0x1588e8) {
      continue;
    }
    const _0x220d98 = getRawCollageItemFrame(_0x1588e8);
    _0x31cf88[_0x4a8918] = {
      ..._0x1588e8,
      [_0x4cac7f]: roundCollageGeometryValue(_0x220d98[_0x4cac7f] + _0x54bdf4)
    };
  }
  for (const _0x5485ea of _0xbc85d) {
    const _0xbba28b = _0x31cf88[_0x5485ea];
    if (!_0xbba28b) {
      continue;
    }
    const _0x18741b = getRawCollageItemFrame(_0xbba28b);
    _0x31cf88[_0x5485ea] = {
      ..._0xbba28b,
      [_0x57cd61]: roundCollageGeometryValue(_0x18741b[_0x57cd61] + _0x54bdf4),
      [_0x4cac7f]: roundCollageGeometryValue(_0x18741b[_0x4cac7f] - _0x54bdf4)
    };
  }
  return {
    items: _0x31cf88,
    delta: roundCollageGeometryValue(_0x54bdf4),
    moveIndexes: Array.from(_0xfa49c7)
  };
}
export function resolveCollageNodeImage(_0x1dd50c) {
  if (!_0x1dd50c || typeof _0x1dd50c !== "object") {
    return {
      url: "",
      localPath: "",
      label: ""
    };
  }
  const _0xa54e58 = trimString(_0x1dd50c.type);
  let _0x4b595f = "";
  let _0x155961 = "";
  let _0x437fc4 = "";
  let _0xf93ca = "";
  let _0x29b92e = "";
  let _0x6fe875 = 0;
  let _0x19d014 = 0;
  let _0x45195b = 0;
  let _0x10b72f = 0;
  if (_0xa54e58 === "source-image") {
    _0x4b595f = pickMediaUrl(_0x1dd50c.displayLocalPath, _0x1dd50c.localPath, _0x1dd50c.originalLocalPath, _0x1dd50c.src, _0x1dd50c.sourceUrl, _0x1dd50c.imageUrl, _0x1dd50c.thumbLocalPath, _0x1dd50c.thumbUrl);
    _0x155961 = pickLocalPath(_0x1dd50c.displayLocalPath, _0x1dd50c.localPath, _0x1dd50c.originalLocalPath, _0x1dd50c.src, _0x1dd50c.sourceUrl, _0x1dd50c.imageUrl, _0x1dd50c.thumbLocalPath, _0x1dd50c.thumbUrl);
    _0x437fc4 = pickLocalPath(_0x1dd50c.thumbLocalPath, _0x1dd50c.thumbUrl);
    _0xf93ca = pickLocalPath(_0x1dd50c.sourceLocalPath);
    _0x29b92e = normalizeMediaUrl(_0x1dd50c.sourceUrl);
    _0x6fe875 = toPositiveNumber(_0x1dd50c.sourceWidth, 0);
    _0x19d014 = toPositiveNumber(_0x1dd50c.sourceHeight, 0);
    _0x45195b = toPositiveNumber(_0x1dd50c.imageWidth, 0);
    _0x10b72f = toPositiveNumber(_0x1dd50c.imageHeight, 0);
  } else if (_0xa54e58 === "ai-image") {
    const _0x166535 = pickMainImageItem(_0x1dd50c.images, _0x1dd50c.mainImageIndex);
    _0x4b595f = pickMediaUrl(_0x166535?.displayLocalPath, _0x166535?.localPath, _0x166535?.originalLocalPath, _0x166535?.sourceUrl, _0x166535?.imageUrl, _0x166535?.url, _0x166535?.thumbLocalPath, _0x166535?.thumbUrl, _0x1dd50c.displayLocalPath, _0x1dd50c.localPath, _0x1dd50c.originalLocalPath, _0x1dd50c.sourceUrl, _0x1dd50c.imageUrl, _0x1dd50c.src, _0x1dd50c.thumbLocalPath, _0x1dd50c.thumbUrl);
    _0x155961 = pickLocalPath(_0x166535?.displayLocalPath, _0x166535?.localPath, _0x166535?.originalLocalPath, _0x166535?.sourceUrl, _0x166535?.imageUrl, _0x166535?.url, _0x166535?.thumbLocalPath, _0x166535?.thumbUrl, _0x1dd50c.displayLocalPath, _0x1dd50c.localPath, _0x1dd50c.originalLocalPath, _0x1dd50c.sourceUrl, _0x1dd50c.imageUrl, _0x1dd50c.src, _0x1dd50c.thumbLocalPath, _0x1dd50c.thumbUrl);
    _0x437fc4 = pickLocalPath(_0x166535?.thumbLocalPath, _0x166535?.thumbUrl, _0x1dd50c.thumbLocalPath, _0x1dd50c.thumbUrl);
    _0xf93ca = pickLocalPath(_0x166535?.sourceLocalPath, _0x1dd50c.sourceLocalPath);
    _0x29b92e = normalizeMediaUrl(_0x166535?.sourceUrl || _0x1dd50c.sourceUrl);
    _0x6fe875 = toPositiveNumber(_0x166535?.sourceWidth, 0) || toPositiveNumber(_0x1dd50c.sourceWidth, 0);
    _0x19d014 = toPositiveNumber(_0x166535?.sourceHeight, 0) || toPositiveNumber(_0x1dd50c.sourceHeight, 0);
    _0x45195b = toPositiveNumber(_0x166535?.imageWidth || _0x166535?.width, 0) || toPositiveNumber(_0x1dd50c.imageWidth || _0x1dd50c.width, 0);
    _0x10b72f = toPositiveNumber(_0x166535?.imageHeight || _0x166535?.height, 0) || toPositiveNumber(_0x1dd50c.imageHeight || _0x1dd50c.height, 0);
  } else if (_0xa54e58 === "storyboard") {
    const _0x448fc0 = Array.isArray(_0x1dd50c.cells) ? _0x1dd50c.cells : [];
    const _0xa10735 = _0x448fc0.find(_0x6c84ed => resolveStoryboardCellAssetSrc(_0x6c84ed) || resolveStoryboardCellPreviewSrc(_0x6c84ed));
    const _0x7d8ad4 = resolveStoryboardCellAssetSrc(_0xa10735) || resolveStoryboardCellPreviewSrc(_0xa10735);
    _0x4b595f = pickMediaUrl(_0x7d8ad4, _0x1dd50c.localPath, _0x1dd50c.sourceUrl, _0x1dd50c.imageUrl, _0x1dd50c.src);
    _0x155961 = pickLocalPath(_0xa10735?.localPath, _0xa10735?.displayLocalPath, _0xa10735?.originalLocalPath, _0x7d8ad4, _0x1dd50c.localPath, _0x1dd50c.sourceUrl, _0x1dd50c.imageUrl, _0x1dd50c.src);
    _0x437fc4 = pickLocalPath(_0xa10735?.thumbLocalPath, _0x1dd50c.thumbLocalPath);
    _0xf93ca = pickLocalPath(_0xa10735?.sourceLocalPath, _0x1dd50c.sourceLocalPath);
    _0x29b92e = normalizeMediaUrl(_0xa10735?.sourceUrl || _0x1dd50c.sourceUrl);
    _0x6fe875 = toPositiveNumber(_0xa10735?.sourceWidth, 0) || toPositiveNumber(_0x1dd50c.sourceWidth, 0);
    _0x19d014 = toPositiveNumber(_0xa10735?.sourceHeight, 0) || toPositiveNumber(_0x1dd50c.sourceHeight, 0);
    _0x45195b = toPositiveNumber(_0xa10735?.imageWidth, 0) || toPositiveNumber(_0x1dd50c.imageWidth, 0);
    _0x10b72f = toPositiveNumber(_0xa10735?.imageHeight, 0) || toPositiveNumber(_0x1dd50c.imageHeight, 0);
  }
  return {
    url: _0x4b595f,
    localPath: _0x155961,
    thumbLocalPath: _0x437fc4,
    sourceLocalPath: _0xf93ca,
    sourceUrl: _0x29b92e,
    sourceWidth: _0x6fe875,
    sourceHeight: _0x19d014,
    imageWidth: _0x45195b,
    imageHeight: _0x10b72f,
    label: trimString(_0x1dd50c.name) || trimString(_0x1dd50c.fileName) || ""
  };
}
export function isCollageImageNode(_0x2bc950) {
  return !!resolveCollageNodeImage(_0x2bc950).url;
}
export function computeCollageBounds(_0x2c2f6c) {
  if (!Array.isArray(_0x2c2f6c) || _0x2c2f6c.length === 0) {
    return null;
  }
  let _0x32cc05 = Infinity;
  let _0x2407e1 = Infinity;
  let _0x1804f6 = -Infinity;
  let _0x2b65a3 = -Infinity;
  for (const _0x4b68a9 of _0x2c2f6c) {
    if (!_0x4b68a9 || typeof _0x4b68a9 !== "object") {
      continue;
    }
    const _0x14b608 = Number(_0x4b68a9.x);
    const _0xbebde1 = Number(_0x4b68a9.y);
    const _0x526c10 = toPositiveNumber(_0x4b68a9.width, 0);
    const _0x3c095a = toPositiveNumber(_0x4b68a9.height, 0);
    if (!Number.isFinite(_0x14b608) || !Number.isFinite(_0xbebde1) || _0x526c10 <= 0 || _0x3c095a <= 0) {
      continue;
    }
    _0x32cc05 = Math.min(_0x32cc05, _0x14b608);
    _0x2407e1 = Math.min(_0x2407e1, _0xbebde1);
    _0x1804f6 = Math.max(_0x1804f6, _0x14b608 + _0x526c10);
    _0x2b65a3 = Math.max(_0x2b65a3, _0xbebde1 + _0x3c095a);
  }
  if (!Number.isFinite(_0x32cc05) || !Number.isFinite(_0x2407e1)) {
    return null;
  }
  return {
    x: _0x32cc05,
    y: _0x2407e1,
    width: Math.max(1, _0x1804f6 - _0x32cc05),
    height: Math.max(1, _0x2b65a3 - _0x2407e1)
  };
}
export function buildCollageItemsFromNodes(_0x1d20df, _0x3bfedf, _0xfde651 = null) {
  const _0x500edd = _0x3bfedf || computeCollageBounds(_0x1d20df);
  if (!_0x500edd) {
    return [];
  }
  const _0x2f4b11 = toPositiveNumber(_0xfde651?.width, _0x500edd.width);
  const _0x410e44 = toPositiveNumber(_0xfde651?.height, _0x500edd.height);
  const _0x502180 = _0x2f4b11 / _0x500edd.width;
  const _0xdb5d06 = _0x410e44 / _0x500edd.height;
  return (Array.isArray(_0x1d20df) ? _0x1d20df : []).map((_0x457f78, _0x3c4b46) => {
    const _0xb9f775 = resolveCollageNodeImage(_0x457f78);
    if (!_0xb9f775.url) {
      return null;
    }
    const _0x29a1dd = Number(_0x457f78.x) || 0;
    const _0x1b2911 = Number(_0x457f78.y) || 0;
    const _0x5e743e = toPositiveNumber(_0x457f78.width, 1);
    const _0x1a513c = toPositiveNumber(_0x457f78.height, 1);
    const _0x3bb397 = {
      id: "item-" + (trimString(_0x457f78.id) || _0x3c4b46),
      sourceNodeId: trimString(_0x457f78.id),
      url: _0xb9f775.url,
      localPath: _0xb9f775.localPath,
      thumbLocalPath: _0xb9f775.thumbLocalPath,
      sourceLocalPath: _0xb9f775.sourceLocalPath,
      sourceUrl: _0xb9f775.sourceUrl,
      sourceWidth: _0xb9f775.sourceWidth || null,
      sourceHeight: _0xb9f775.sourceHeight || null,
      imageWidth: _0xb9f775.imageWidth || null,
      imageHeight: _0xb9f775.imageHeight || null,
      sourceDisplayWidth: _0x5e743e,
      sourceDisplayHeight: _0x1a513c,
      label: _0xb9f775.label,
      x: roundCollageGeometryValue((_0x29a1dd - _0x500edd.x) * _0x502180),
      y: roundCollageGeometryValue((_0x1b2911 - _0x500edd.y) * _0xdb5d06),
      width: roundCollageGeometryValue(_0x5e743e * _0x502180),
      height: roundCollageGeometryValue(_0x1a513c * _0xdb5d06),
      fit: "cover",
      focusX: 0.5,
      focusY: 0.5
    };
    return {
      ..._0x3bb397,
      freeformX: _0x3bb397.x,
      freeformY: _0x3bb397.y,
      freeformWidth: _0x3bb397.width,
      freeformHeight: _0x3bb397.height
    };
  }).filter(Boolean);
}
function createCollageBaseNodeData({
  id: _0x3be37c,
  x = 0,
  y = 0,
  width = COLLAGE_DEFAULT_SIZE.width,
  height = COLLAGE_DEFAULT_SIZE.height,
  name = "拼图"
} = {}) {
  return {
    id: _0x3be37c,
    type: COLLAGE_NODE_TYPE,
    schemaVersion: COLLAGE_SCHEMA_VERSION,
    name: name,
    x: x,
    y: y,
    width: roundDimension(width, COLLAGE_DEFAULT_SIZE.width),
    height: roundDimension(height, COLLAGE_DEFAULT_SIZE.height),
    aspectRatio: "",
    layoutPresetId: "freeform",
    exportLongSide: 2048,
    backgroundColor: COLLAGE_BACKGROUND_DEFAULT,
    outerPadding: COLLAGE_LAYOUT_STYLE_DEFAULTS.outerPadding,
    gap: COLLAGE_LAYOUT_STYLE_DEFAULTS.gap,
    cornerRadius: COLLAGE_LAYOUT_STYLE_DEFAULTS.cornerRadius,
    items: []
  };
}
export function createEmptyCollageNodeData(_0x27d46f = {}) {
  const _0x2180ef = {
    ...createCollageBaseNodeData(_0x27d46f),
    aspectRatio: COLLAGE_INITIAL_ASPECT_RATIO,
    layoutPresetId: COLLAGE_INITIAL_LAYOUT_PRESET_ID
  };
  return {
    ..._0x2180ef,
    ...buildCollageLayoutPatch(_0x2180ef, COLLAGE_INITIAL_LAYOUT_PRESET_ID)
  };
}
export function buildCollageNodeDataFromSelection({
  id: _0x476d5d,
  nodes: _0x77fd5f,
  name = "拼图"
} = {}) {
  const _0x3a8ff4 = (Array.isArray(_0x77fd5f) ? _0x77fd5f : []).filter(isCollageImageNode);
  const _0x2cc449 = computeCollageBounds(_0x3a8ff4);
  if (!_0x2cc449) {
    return null;
  }
  return {
    ...createCollageBaseNodeData({
      id: _0x476d5d,
      name: name,
      x: _0x2cc449.x,
      y: _0x2cc449.y,
      width: _0x2cc449.width,
      height: _0x2cc449.height
    }),
    aspectRatio: "",
    layoutPresetId: "freeform",
    sourceBounds: {
      width: _0x2cc449.width,
      height: _0x2cc449.height
    },
    items: buildCollageItemsFromNodes(_0x3a8ff4, _0x2cc449)
  };
}
function cloneFreeformItem(_0x42c6ca) {
  const _0x36d0d1 = Number.isFinite(Number(_0x42c6ca.freeformX)) ? Number(_0x42c6ca.freeformX) : Number(_0x42c6ca.x) || 0;
  const _0x5a6b2c = Number.isFinite(Number(_0x42c6ca.freeformY)) ? Number(_0x42c6ca.freeformY) : Number(_0x42c6ca.y) || 0;
  const _0x1c1a7e = toPositiveNumber(_0x42c6ca.freeformWidth, _0x42c6ca.width || 1);
  const _0xa0d6f1 = toPositiveNumber(_0x42c6ca.freeformHeight, _0x42c6ca.height || 1);
  return {
    ..._0x42c6ca,
    x: _0x36d0d1,
    y: _0x5a6b2c,
    width: _0x1c1a7e,
    height: _0xa0d6f1,
    freeformX: _0x36d0d1,
    freeformY: _0x5a6b2c,
    freeformWidth: _0x1c1a7e,
    freeformHeight: _0xa0d6f1
  };
}
function getFreeformSize(_0x204cfa) {
  const _0x146044 = toPositiveNumber(_0x204cfa?.sourceBounds?.width, 0);
  const _0x50edae = toPositiveNumber(_0x204cfa?.sourceBounds?.height, 0);
  return {
    width: roundDimension(_0x146044 || _0x204cfa?.width, COLLAGE_DEFAULT_SIZE.width),
    height: roundDimension(_0x50edae || _0x204cfa?.height, COLLAGE_DEFAULT_SIZE.height)
  };
}
function buildLayoutSlotItem({
  item: _0x44f479,
  preset: _0x3d8f94,
  slotIndex: _0x162465,
  slotBounds: _0x15235b,
  scaleX: _0x257ea8,
  scaleY: _0x5cac85
}) {
  const _0x3e4056 = _0x44f479 && !isCollageItemEmpty(_0x44f479);
  return {
    ...(_0x3e4056 ? _0x44f479 : {}),
    id: trimString(_0x44f479?.id) || _0x3d8f94.id + "-slot-" + _0x162465,
    sourceNodeId: trimString(_0x44f479?.sourceNodeId),
    url: trimString(_0x44f479?.url),
    localPath: trimString(_0x44f479?.localPath),
    label: trimString(_0x44f479?.label),
    fit: trimString(_0x44f479?.fit) || "cover",
    focusX: Number.isFinite(Number(_0x44f479?.focusX)) ? Number(_0x44f479.focusX) : 0.5,
    focusY: Number.isFinite(Number(_0x44f479?.focusY)) ? Number(_0x44f479.focusY) : 0.5,
    imageScale: normalizeCollageImageScale(_0x44f479?.imageScale),
    slotIndex: _0x162465,
    isEmpty: !_0x3e4056,
    x: _0x15235b.x * _0x257ea8,
    y: _0x15235b.y * _0x5cac85,
    width: _0x15235b.width * _0x257ea8,
    height: _0x15235b.height * _0x5cac85
  };
}
function scaleCollageItemGeometry(_0x550ef4, _0x38b0c0, _0x51336c, _0x1eed1b) {
  const _0x3ad545 = {
    ..._0x550ef4,
    x: (Number(_0x550ef4?.x) || 0) * _0x38b0c0,
    y: (Number(_0x550ef4?.y) || 0) * _0x51336c,
    width: toPositiveNumber(_0x550ef4?.width, 1) * _0x38b0c0,
    height: toPositiveNumber(_0x550ef4?.height, 1) * _0x51336c
  };
  if (!_0x1eed1b) {
    return _0x3ad545;
  }
  return {
    ..._0x3ad545,
    freeformX: (Number(_0x550ef4?.freeformX) || 0) * _0x38b0c0,
    freeformY: (Number(_0x550ef4?.freeformY) || 0) * _0x51336c,
    freeformWidth: toPositiveNumber(_0x550ef4?.freeformWidth, _0x550ef4?.width || 1) * _0x38b0c0,
    freeformHeight: toPositiveNumber(_0x550ef4?.freeformHeight, _0x550ef4?.height || 1) * _0x51336c
  };
}
function getCollageCurrentSize(_0x597a02) {
  return {
    width: roundDimension(_0x597a02?.width, COLLAGE_DEFAULT_SIZE.width),
    height: roundDimension(_0x597a02?.height, COLLAGE_DEFAULT_SIZE.height)
  };
}
function getCollageCurrentShortSide(_0xb6b556) {
  const _0x5bc01e = getCollageCurrentSize(_0xb6b556);
  return Math.max(1, Math.min(_0x5bc01e.width, _0x5bc01e.height));
}
function buildCollageResizePatch(_0x5c6f75, _0x5891bd, {
  includeFreeform = false
} = {}) {
  const _0x55bcfc = getCollageCurrentSize(_0x5c6f75);
  const _0x67ab13 = {
    width: roundDimension(_0x5891bd?.width, _0x55bcfc.width),
    height: roundDimension(_0x5891bd?.height, _0x55bcfc.height)
  };
  const _0x8437b5 = _0x67ab13.width / _0x55bcfc.width;
  const _0x4339e9 = _0x67ab13.height / _0x55bcfc.height;
  const _0x5f1d48 = Array.isArray(_0x5c6f75?.items) ? _0x5c6f75.items : [];
  return {
    width: _0x67ab13.width,
    height: _0x67ab13.height,
    items: _0x5f1d48.map(_0x2edaa5 => scaleCollageItemGeometry(_0x2edaa5, _0x8437b5, _0x4339e9, includeFreeform))
  };
}
export function buildCollageCollapsePatch(_0x3459de, _0x3a2890) {
  const _0x3f01f9 = !!_0x3a2890;
  const _0x4189f2 = getCollageCurrentSize(_0x3459de);
  const _0x52eb13 = getCollageLayoutPreset(_0x3459de?.layoutPresetId);
  const _0x1728a4 = _0x52eb13.id === "freeform";
  if (_0x3f01f9) {
    const _0x324a98 = resolveCollageSizeByShortSide({
      width: _0x4189f2.width,
      height: _0x4189f2.height,
      shortSide: COLLAGE_COLLAPSED_SHORT_SIDE
    });
    return {
      ...buildCollageResizePatch(_0x3459de, _0x324a98, {
        includeFreeform: _0x1728a4
      }),
      isCollapsed: true,
      isEditing: false,
      _originalWidth: _0x4189f2.width,
      _originalHeight: _0x4189f2.height
    };
  }
  const _0x51c446 = toPositiveNumber(_0x3459de?._originalWidth, 0) > 0 && toPositiveNumber(_0x3459de?._originalHeight, 0) > 0;
  const _0x16dfcd = {
    ...(_0x51c446 ? {
      width: roundDimension(_0x3459de?._originalWidth, _0x4189f2.width),
      height: roundDimension(_0x3459de?._originalHeight, _0x4189f2.height)
    } : resolveCollageSizeByShortSide({
      width: _0x4189f2.width,
      height: _0x4189f2.height,
      shortSide: COLLAGE_EXPANDED_SHORT_SIDE
    }))
  };
  return {
    ...buildCollageResizePatch(_0x3459de, _0x16dfcd, {
      includeFreeform: _0x1728a4
    }),
    isCollapsed: false
  };
}
export function buildCollageAspectRatioPatch(_0x558142, _0xfafacb) {
  const _0x319cf3 = getCollageAspectRatioOption(_0xfafacb) || COLLAGE_ASPECT_RATIO_OPTIONS[0];
  const _0x411182 = getCollageLayoutPreset(_0x558142?.layoutPresetId);
  const _0x41988c = _0x411182.id === "freeform" || !Array.isArray(_0x411182.slots) ? resolveCollageSizeByShortSide({
    width: _0x319cf3.w,
    height: _0x319cf3.h,
    shortSide: getCollageCurrentShortSide(_0x558142)
  }) : resolveCollagePresetSizeBySlotShortSide(_0x411182, {
    aspectRatio: _0x319cf3.label
  });
  return {
    ...buildCollageResizePatch(_0x558142, _0x41988c, {
      includeFreeform: _0x411182.id === "freeform"
    }),
    aspectRatio: _0x319cf3.label
  };
}
export function buildCollageLayoutPatch(_0x2ef089, _0x34d606, {
  slotShortSide = COLLAGE_SLOT_SHORT_SIDE
} = {}) {
  const _0x5a3699 = getCollageLayoutPreset(_0x34d606);
  const _0x31ebff = Array.isArray(_0x2ef089?.items) ? _0x2ef089.items : [];
  if (_0x5a3699.id === "freeform" || !Array.isArray(_0x5a3699.slots)) {
    const _0x5beab7 = getFreeformSize(_0x2ef089);
    return {
      layoutPresetId: "freeform",
      aspectRatio: "",
      width: _0x5beab7.width,
      height: _0x5beab7.height,
      items: _0x31ebff.map(cloneFreeformItem)
    };
  }
  const _0x3e0acd = toPositiveNumber(_0x5a3699.width, COLLAGE_DEFAULT_SIZE.width);
  const _0x2f8026 = toPositiveNumber(_0x5a3699.height, COLLAGE_DEFAULT_SIZE.height);
  const _0x2afd3d = getCollageAspectRatioOption(_0x2ef089?.aspectRatio);
  const _0x5dcffd = resolveCollagePresetSizeBySlotShortSide(_0x5a3699, {
    aspectRatio: _0x2afd3d?.label || "",
    slotShortSide: slotShortSide
  });
  const _0x34eee4 = _0x5dcffd.width;
  const _0x4f4614 = _0x5dcffd.height;
  const _0x3edc45 = _0x34eee4 / _0x3e0acd;
  const _0x22e288 = _0x4f4614 / _0x2f8026;
  const _0x13c24e = _0x31ebff.filter(_0x5d5f21 => !isCollageItemEmpty(_0x5d5f21));
  const _0x11bc78 = _0x5a3699.slots.map((_0x2db04b, _0x37fa97) => buildLayoutSlotItem({
    item: _0x13c24e[_0x37fa97],
    preset: _0x5a3699,
    slotIndex: _0x37fa97,
    slotBounds: _0x2db04b,
    scaleX: _0x3edc45,
    scaleY: _0x22e288
  }));
  return {
    layoutPresetId: _0x5a3699.id,
    aspectRatio: _0x2afd3d?.label || "",
    width: _0x34eee4,
    height: _0x4f4614,
    items: _0x11bc78
  };
}
export function resolveCollageExportSize(_0x7331df, _0x741c39) {
  const _0x5e491f = toPositiveNumber(_0x7331df?.width, COLLAGE_DEFAULT_SIZE.width);
  const _0x2e1c15 = toPositiveNumber(_0x7331df?.height, COLLAGE_DEFAULT_SIZE.height);
  const _0x3c2b8a = getCollageExportResolution(_0x741c39).longSide;
  const _0xcf9aff = _0x5e491f / _0x2e1c15;
  if (!Number.isFinite(_0xcf9aff) || _0xcf9aff <= 0) {
    return {
      width: _0x3c2b8a,
      height: _0x3c2b8a
    };
  }
  if (_0xcf9aff >= 1) {
    return {
      width: _0x3c2b8a,
      height: roundDimension(_0x3c2b8a / _0xcf9aff, _0x3c2b8a)
    };
  }
  return {
    width: roundDimension(_0x3c2b8a * _0xcf9aff, _0x3c2b8a),
    height: _0x3c2b8a
  };
}