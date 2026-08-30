import { getModelsByKind, normalizeProviderId, resolveModelExecution } from "../manifests/index.js";
import { translateManifestText } from "../i18n/manifestText.js";
import { t } from "../i18n/index.js";
export const DREAMINA_VIDEO_ROUTE_MODES = ["multimodal2video", "frames2video", "multiframe2video"];
export const DREAMINA_VIDEO_TASK_TYPES = ["text2video", "image2video", "frames2video", "multiframe2video", "multimodal2video"];
export const DREAMINA_VIDEO_ALLOWED_RATIOS = ["1:1", "3:4", "16:9", "4:3", "9:16", "21:9"];
export const DREAMINA_VIDEO_ADAPTIVE_RATIO_OPTIONS = [{
  label: "1:1",
  w: 1,
  h: 1,
  calc: 1
}, {
  label: "3:4",
  w: 3,
  h: 4,
  calc: 3 / 4
}, {
  label: "16:9",
  w: 16,
  h: 9,
  calc: 16 / 9
}, {
  label: "4:3",
  w: 4,
  h: 3,
  calc: 4 / 3
}, {
  label: "9:16",
  w: 9,
  h: 16,
  calc: 9 / 16
}, {
  label: "21:9",
  w: 21,
  h: 9,
  calc: 21 / 9
}];
function getDreaminaStyleVideoExtension(_0x13ddad) {
  const _0x36a15d = _0x13ddad?.extensions?.dreaminaStyleVideo;
  if (_0x36a15d && typeof _0x36a15d === "object") {
    return _0x36a15d;
  } else {
    return null;
  }
}
function getDreaminaStyleVideoCounterpartKey(_0x516686) {
  return String(getDreaminaStyleVideoExtension(_0x516686)?.counterpartKey || "").trim();
}
function normalizeStyleProvider(_0x1e7c16) {
  const _0x26068f = normalizeProviderId(_0x1e7c16);
  if (_0x26068f === "apimart" || _0x26068f === "dreamina" || _0x26068f === "volcengine") {
    return _0x26068f;
  } else {
    return "";
  }
}
function toDreaminaStyleVideoOption(_0x1442f6) {
  const _0x4bd413 = getDreaminaStyleVideoExtension(_0x1442f6) || {};
  return Object.freeze({
    model: _0x1442f6.modelId,
    title: translateManifestText(_0x4bd413.title || _0x1442f6.displayName || _0x1442f6.modelId),
    subtitle: translateManifestText(_0x4bd413.subtitle || _0x1442f6.description || ""),
    subtitleByTaskType: _0x4bd413.subtitleByTaskType || Object.freeze({}),
    taskTypes: Array.isArray(_0x4bd413.taskTypes) ? Object.freeze(_0x4bd413.taskTypes.slice()) : Object.freeze([]),
    order: Number(_0x4bd413.order || 0),
    counterpartKey: getDreaminaStyleVideoCounterpartKey(_0x1442f6),
    vip: _0x1442f6.vip === true
  });
}
function getDreaminaStyleVideoOptions(_0x39b263) {
  const _0x158dd7 = normalizeStyleProvider(_0x39b263);
  return getModelsByKind("video").filter(_0x280f32 => {
    if (!getDreaminaStyleVideoExtension(_0x280f32)) {
      return false;
    }
    if (_0x158dd7 && _0x280f32.provider !== _0x158dd7) {
      return false;
    }
    return true;
  }).sort((_0x4f81d3, _0x47c1f2) => {
    const _0x4da6e6 = getDreaminaStyleVideoExtension(_0x4f81d3) || {};
    const _0x43c713 = getDreaminaStyleVideoExtension(_0x47c1f2) || {};
    return (Number(_0x4da6e6.order || 0) || 0) - (Number(_0x43c713.order || 0) || 0);
  }).map(toDreaminaStyleVideoOption);
}
function resolveDreaminaStyleVideoManifest(_0xc012a4, _0x44fb5f = "") {
  const _0x397735 = String(_0xc012a4 || "").trim();
  const _0x458997 = normalizeStyleProvider(_0x44fb5f);
  const _0x58d086 = Array.from(new Set([_0x458997, ""].filter(Boolean)));
  for (const _0x365096 of _0x58d086) {
    const _0x57d665 = resolveModelExecution(_0x397735, {
      providerHint: _0x365096
    });
    const _0x33686a = _0x57d665?.modelManifest || null;
    if (!_0x33686a || !getDreaminaStyleVideoExtension(_0x33686a)) {
      continue;
    }
    if (_0x458997 && _0x33686a.provider !== _0x458997) {
      continue;
    }
    return _0x33686a;
  }
  if (!_0x397735) {
    return null;
  }
  const _0x5ee873 = resolveModelExecution(_0x397735);
  const _0x12ec53 = _0x5ee873?.modelManifest || null;
  if (!_0x12ec53 || !getDreaminaStyleVideoExtension(_0x12ec53)) {
    return null;
  }
  if (_0x458997 && _0x12ec53.provider !== _0x458997) {
    return null;
  }
  return _0x12ec53;
}
export function getDreaminaStyleVideoInputLimits(_0x380e52, _0x391f12 = "") {
  const _0xf3ee8c = resolveDreaminaStyleVideoManifest(_0x380e52, _0x391f12);
  const _0x4e211b = (_0x5e4e4d, _0xbb1e05) => {
    const _0x6eeedd = Number(_0x5e4e4d);
    if (Number.isFinite(_0x6eeedd) && _0x6eeedd >= 0) {
      return Math.trunc(_0x6eeedd);
    } else {
      return _0xbb1e05;
    }
  };
  return Object.freeze({
    image: _0x4e211b(_0xf3ee8c?.inputSlots?.maxByKind?.image, 9),
    video: _0x4e211b(_0xf3ee8c?.inputSlots?.maxByKind?.video, 3),
    audio: _0x4e211b(_0xf3ee8c?.inputSlots?.maxByKind?.audio, 3)
  });
}
function getDefaultDreaminaStyleVideoModel(_0x3cbd55, _0x505523) {
  const _0x31f3d3 = normalizeStyleProvider(_0x505523) || "dreamina";
  const _0x20d928 = String(_0x3cbd55 || "").trim();
  const _0x3cd745 = getDreaminaStyleVideoOptions(_0x31f3d3);
  const _0x18e1db = _0x3cd745.find(_0x256918 => {
    const _0x5151c9 = resolveDreaminaStyleVideoManifest(_0x256918.model, _0x31f3d3);
    const _0x5a37a0 = getDreaminaStyleVideoExtension(_0x5151c9)?.defaultForTaskTypes || [];
    return Array.isArray(_0x5a37a0) && _0x5a37a0.includes(_0x20d928);
  });
  if (_0x18e1db) {
    return _0x18e1db.model;
  }
  const _0x453448 = _0x3cd745.find(_0x260d3c => _0x260d3c.taskTypes.includes(_0x20d928));
  return _0x453448?.model || "";
}
export const APIMART_DREAMINA_VIDEO_DEFAULT_MODEL = getDefaultDreaminaStyleVideoModel("text2video", "apimart");
export const APIMART_DREAMINA_VIDEO_MODEL_OPTIONS = Object.freeze(getDreaminaStyleVideoOptions("apimart"));
export const VOLCENGINE_DREAMINA_VIDEO_MODEL_OPTIONS = Object.freeze(getDreaminaStyleVideoOptions("volcengine"));
export const DREAMINA_VIDEO_MODEL_OPTIONS = Object.freeze(getDreaminaStyleVideoOptions("dreamina"));
const IMAGE_ROUTE_EXTRA_MODELS = DREAMINA_VIDEO_MODEL_OPTIONS.filter(_0x490bb2 => _0x490bb2.taskTypes.includes("image2video"));
const FRAMES_ROUTE_EXTRA_MODELS = DREAMINA_VIDEO_MODEL_OPTIONS.filter(_0x114631 => _0x114631.taskTypes.includes("frames2video"));
const DREAMINA_VIDEO_MODEL_META = new Map(DREAMINA_VIDEO_MODEL_OPTIONS.map(_0x418cd3 => [_0x418cd3.model, _0x418cd3]));
const APIMART_DREAMINA_VIDEO_MODEL_META = new Map(APIMART_DREAMINA_VIDEO_MODEL_OPTIONS.map(_0x2619da => [_0x2619da.model, _0x2619da]));
const VOLCENGINE_DREAMINA_VIDEO_MODEL_META = new Map(VOLCENGINE_DREAMINA_VIDEO_MODEL_OPTIONS.map(_0x454e01 => [_0x454e01.model, _0x454e01]));
const DREAMINA_ROUTE_LABEL_KEYS = {
  multimodal2video: "route.multimodal2video",
  frames2video: "route.frames2video",
  multiframe2video: "route.multiframe2video"
};
const DREAMINA_TASK_LABEL_KEYS = {
  text2video: "task.text2video",
  image2video: "task.image2video",
  frames2video: "task.frames2video",
  multiframe2video: "task.multiframe2video",
  multimodal2video: "task.multimodal2video"
};
const DREAMINA_MODE_DISABLED_MAP = {
  multimodal2video: false,
  frames2video: false,
  multiframe2video: true
};
function pickFirstNonEmpty(..._0x260d16) {
  for (const _0x1ce018 of _0x260d16) {
    const _0x14b9a4 = String(_0x1ce018 || "").trim();
    if (_0x14b9a4) {
      return _0x14b9a4;
    }
  }
  return "";
}
function pickCanonicalOptionValue(_0x3c1286, _0x17b07c, _0x1a122d) {
  if (!Array.isArray(_0x3c1286) || _0x3c1286.length === 0) {
    return "";
  }
  const _0x45b0dc = pickFirstNonEmpty(_0x17b07c, _0x1a122d, _0x3c1286[0]);
  const _0x5bd0d8 = _0x45b0dc.toLowerCase();
  const _0x1470d6 = _0x3c1286.find(_0x105752 => String(_0x105752 || "").trim().toLowerCase() === _0x5bd0d8);
  return _0x1470d6 || _0x3c1286[0];
}
function dreaminaVideoText(_0x53f4b9, _0x2c658a = {}) {
  return t("dreaminaVideo." + _0x53f4b9, _0x2c658a);
}
export function isDreaminaVideoModel(_0x1eb933, _0x934922) {
  const _0x17eaf6 = normalizeStyleProvider(_0x934922);
  if (_0x17eaf6 === "dreamina") {
    return true;
  }
  return resolveDreaminaStyleVideoManifest(_0x1eb933, "dreamina") !== null;
}
export function isApimartDreaminaVideoModel(_0x51745a, _0x4bfc2e) {
  const _0x57f63c = normalizeStyleProvider(_0x4bfc2e);
  if (_0x57f63c === "apimart" && !String(_0x51745a || "").trim()) {
    return true;
  }
  return resolveDreaminaStyleVideoManifest(_0x51745a, "apimart") !== null;
}
export function isDreaminaStyleVideoModel(_0xe55284, _0x238253) {
  return isDreaminaVideoModel(_0xe55284, _0x238253) || isApimartDreaminaVideoModel(_0xe55284, _0x238253) || resolveDreaminaStyleVideoManifest(_0xe55284, "volcengine") !== null || normalizeStyleProvider(_0x238253) === "volcengine" && resolveDreaminaStyleVideoManifest(_0xe55284, "volcengine") !== null;
}
export function resolveDreaminaStyleVideoProvider(_0xa0e654, _0x11fc0f) {
  const _0x1e14a0 = normalizeStyleProvider(_0x11fc0f);
  if (_0x1e14a0) {
    return _0x1e14a0;
  }
  const _0x277fe1 = resolveDreaminaStyleVideoManifest(_0xa0e654);
  return normalizeStyleProvider(_0x277fe1?.provider) || "dreamina";
}
export function resolveDreaminaStyleVideoCounterpartModel(_0x3bda52, _0x152829, {
  taskType = ""
} = {}) {
  const _0x38a6df = resolveDreaminaStyleVideoManifest(_0x3bda52);
  const _0x2e43a4 = getDreaminaStyleVideoCounterpartKey(_0x38a6df);
  const _0x414952 = normalizeStyleProvider(_0x152829);
  if (!_0x38a6df || !_0x2e43a4 || !_0x414952) {
    return "";
  }
  const _0x4d9954 = String(taskType || "").trim();
  const _0x337e37 = _0x38a6df.vip === true;
  const _0x3d6403 = getModelsByKind("video").filter(_0x3220e6 => {
    if (_0x3220e6.provider !== _0x414952) {
      return false;
    }
    const _0x3c65c4 = getDreaminaStyleVideoExtension(_0x3220e6);
    if (!_0x3c65c4) {
      return false;
    }
    if (getDreaminaStyleVideoCounterpartKey(_0x3220e6) !== _0x2e43a4) {
      return false;
    }
    const _0x4e2dc6 = Array.isArray(_0x3c65c4.taskTypes) ? _0x3c65c4.taskTypes : [];
    return !_0x4d9954 || _0x4e2dc6.includes(_0x4d9954);
  }).sort((_0x14e065, _0x2b2d09) => {
    const _0x232e76 = _0x14e065.vip === _0x337e37 ? 0 : 1;
    const _0x4bd808 = _0x2b2d09.vip === _0x337e37 ? 0 : 1;
    if (_0x232e76 !== _0x4bd808) {
      return _0x232e76 - _0x4bd808;
    }
    const _0x35d758 = Number(getDreaminaStyleVideoExtension(_0x14e065)?.order || 0) || 0;
    const _0x5da3fb = Number(getDreaminaStyleVideoExtension(_0x2b2d09)?.order || 0) || 0;
    return _0x35d758 - _0x5da3fb;
  });
  return _0x3d6403[0]?.modelId || "";
}
export function isDreaminaVideoRouteModeEnabled(_0x1a455a) {
  const _0x5f09c3 = normalizeDreaminaVideoRouteMode(_0x1a455a);
  return DREAMINA_MODE_DISABLED_MAP[_0x5f09c3] !== true;
}
export function normalizeDreaminaVideoRouteMode(_0x312d3f, _0x2b5c12 = "") {
  const _0x1e0484 = String(_0x312d3f || "").trim();
  if (DREAMINA_VIDEO_ROUTE_MODES.includes(_0x1e0484)) {
    return _0x1e0484;
  }
  const _0x2d9de3 = String(_0x2b5c12 || "").trim();
  if (_0x2d9de3 === "首尾帧") {
    return "frames2video";
  }
  if (_0x2d9de3 === "智能多帧") {
    return "multiframe2video";
  }
  return "multimodal2video";
}
export function normalizeDreaminaVideoModel(_0x4155aa, _0x4e6c24) {
  const _0x10dd4d = String(_0x4155aa || "").trim();
  const _0x2b782c = resolveDreaminaStyleVideoManifest(_0x10dd4d, "dreamina");
  if (_0x2b782c) {
    return _0x2b782c.modelId;
  }
  if (normalizeStyleProvider(_0x4e6c24) === "dreamina" && (!_0x10dd4d || _0x10dd4d === "dreamina/text2video")) {
    return getDefaultDreaminaStyleVideoModel("text2video", "dreamina");
  }
  return _0x10dd4d;
}
export function getDreaminaVideoModelVersion(_0x2a5c14, _0x2094a8) {
  const _0x38984b = normalizeDreaminaVideoModel(_0x2a5c14, _0x2094a8);
  const _0x37f3f8 = resolveModelExecution(_0x38984b, {
    providerHint: "dreamina"
  });
  if (!getDreaminaStyleVideoExtension(_0x37f3f8?.modelManifest)) {
    return "";
  }
  return String(_0x37f3f8?.executionManifest?.extensions?.dreaminaVideo?.modelVersion || "").trim();
}
export function getDreaminaVideoModelMeta(_0x2d4f03, _0x49d8ba) {
  const _0x24b850 = normalizeDreaminaVideoModel(_0x2d4f03, _0x49d8ba);
  return DREAMINA_VIDEO_MODEL_META.get(_0x24b850) || null;
}
export function getDreaminaVideoTaskDisplayName(_0x4a6350) {
  return dreaminaVideoText(DREAMINA_TASK_LABEL_KEYS[String(_0x4a6350 || "").trim()] || "task.video");
}
export function getDreaminaVideoRouteDisplayName(_0x1e6444) {
  return dreaminaVideoText(DREAMINA_ROUTE_LABEL_KEYS[normalizeDreaminaVideoRouteMode(_0x1e6444)] || "route.multimodal2video");
}
export function buildDreaminaVideoRouteLabel(_0x40d1de) {
  return getDreaminaVideoRouteDisplayName(_0x40d1de);
}
export function resolveDreaminaVideoTaskType({
  routeMode = "multimodal2video",
  imageCount = 0,
  videoCount = 0,
  audioCount = 0
} = {}) {
  const _0x38f7d1 = normalizeDreaminaVideoRouteMode(routeMode);
  const _0x687d44 = Number(imageCount) || 0;
  const _0x169668 = Number(videoCount) || 0;
  const _0x4cba88 = Number(audioCount) || 0;
  if (_0x38f7d1 === "frames2video") {
    if (_0x687d44 >= 2) {
      return "frames2video";
    }
    if (_0x687d44 === 1) {
      return "image2video";
    }
    return "text2video";
  }
  if (_0x38f7d1 === "multiframe2video") {
    return "multiframe2video";
  }
  if (_0x687d44 <= 0 && _0x169668 <= 0) {
    if (_0x4cba88 > 0) {
      return "multimodal2video";
    } else {
      return "text2video";
    }
  }
  return "multimodal2video";
}
export function getDreaminaVideoAllowedModels(_0x50b3d8) {
  const _0xff3444 = String(_0x50b3d8 || "").trim();
  return DREAMINA_VIDEO_MODEL_OPTIONS.filter(_0x3a101c => _0x3a101c.taskTypes.includes(_0xff3444));
}
export function getDreaminaVideoDefaultModel(_0x263cff) {
  const _0x5d7dab = String(_0x263cff || "").trim();
  return getDefaultDreaminaStyleVideoModel(_0x5d7dab, "dreamina");
}
export function isDreaminaVideoTaskModelSupported(_0x199108, _0x8a5f60, _0x27f70e) {
  const _0x209b47 = normalizeDreaminaVideoModel(_0x8a5f60, _0x27f70e);
  return getDreaminaVideoAllowedModels(_0x199108).some(_0x2b78d9 => _0x2b78d9.model === _0x209b47);
}
export function ensureDreaminaVideoModelForTask(_0x4a9f8e, _0x1ca8ae, _0x3c8f9) {
  const _0x71afdd = String(_0x4a9f8e || "").trim();
  const _0x16db41 = normalizeDreaminaVideoModel(_0x1ca8ae, _0x3c8f9);
  if (_0x16db41 && isDreaminaVideoTaskModelSupported(_0x71afdd, _0x16db41, "dreamina")) {
    return _0x16db41;
  }
  return getDreaminaVideoDefaultModel(_0x71afdd);
}
export function normalizeDreaminaVideoAspectRatio(_0xccc608, _0x159434 = {}) {
  const _0x71ad43 = _0x159434 === true || _0x159434 && typeof _0x159434 === "object" && _0x159434.preserveAdaptive === true;
  const _0x41d15f = String(_0xccc608 || "").trim();
  if (!_0x41d15f) {
    if (_0x71ad43) {
      return "自适应";
    } else {
      return "1:1";
    }
  }
  if (_0x41d15f === "自适应" || _0x41d15f === "自适应" || _0x41d15f === "auto") {
    if (_0x71ad43) {
      return "自适应";
    } else {
      return "1:1";
    }
  }
  if (_0x41d15f === "5:4") {
    return "4:3";
  }
  if (_0x41d15f === "4:5") {
    return "3:4";
  }
  if (DREAMINA_VIDEO_ALLOWED_RATIOS.includes(_0x41d15f)) {
    return _0x41d15f;
  }
  if (_0x71ad43) {
    return "自适应";
  } else {
    return "1:1";
  }
}
export function pickClosestDreaminaVideoAdaptiveRatio(_0x377059, _0x408a93) {
  const _0x2fca8b = Number(_0x377059);
  const _0x2acd01 = Number(_0x408a93);
  if (!Number.isFinite(_0x2fca8b) || !(_0x2fca8b > 0) || !Number.isFinite(_0x2acd01) || !(_0x2acd01 > 0)) {
    return DREAMINA_VIDEO_ADAPTIVE_RATIO_OPTIONS[0];
  }
  const _0x5abe07 = _0x2fca8b / _0x2acd01;
  let _0xbb9a44 = DREAMINA_VIDEO_ADAPTIVE_RATIO_OPTIONS[0];
  let _0x36d902 = Math.abs(_0x5abe07 - _0xbb9a44.calc);
  for (let _0x15b693 = 1; _0x15b693 < DREAMINA_VIDEO_ADAPTIVE_RATIO_OPTIONS.length; _0x15b693 += 1) {
    const _0x3e004e = DREAMINA_VIDEO_ADAPTIVE_RATIO_OPTIONS[_0x15b693];
    const _0x194b22 = Math.abs(_0x5abe07 - _0x3e004e.calc);
    if (_0x194b22 < _0x36d902) {
      _0x36d902 = _0x194b22;
      _0xbb9a44 = _0x3e004e;
    }
  }
  return _0xbb9a44;
}
export function getDreaminaVideoTaskParamVisibility(_0x4b37c5) {
  const _0x13ce7a = String(_0x4b37c5 || "").trim();
  return {
    ratio: true,
    duration: _0x13ce7a !== "multiframe2video",
    mode: true,
    model: true,
    multiframeAdvanced: false,
    ratioChoices: _0x13ce7a !== "image2video" && _0x13ce7a !== "frames2video"
  };
}
export function getDreaminaVideoResolutionOptions(_0x307469, _0x3f4d94, _0x3088a5) {
  const _0x4de751 = String(_0x307469 || "").trim();
  const _0x27e6ff = ensureDreaminaVideoModelForTask(_0x4de751, _0x3f4d94, _0x3088a5);
  const _0x31e43a = resolveDreaminaStyleVideoManifest(_0x27e6ff, "dreamina");
  const _0x3a7e63 = getDreaminaStyleVideoExtension(_0x31e43a)?.resolutionOptionsByTaskType?.[_0x4de751];
  if (Array.isArray(_0x3a7e63)) {
    return _0x3a7e63.slice();
  } else {
    return [];
  }
}
export function normalizeDreaminaVideoResolution(_0x1617d6, _0xc82ac4, _0xc6a2f4, _0xf1a33a) {
  const _0x2b7a08 = getDreaminaVideoResolutionOptions(_0x1617d6, _0xc82ac4, _0xf1a33a);
  if (!_0x2b7a08.length) {
    return "";
  }
  return pickCanonicalOptionValue(_0x2b7a08, _0xc6a2f4, _0x2b7a08[0]);
}
export function getDreaminaVideoDurationRange(_0x5b9363, _0x5cc4d4, _0x575a48) {
  const _0x3f1d82 = String(_0x5b9363 || "").trim();
  if (_0x3f1d82 === "multiframe2video") {
    return {
      min: 3,
      max: 3,
      step: 1
    };
  }
  const _0x1e187a = ensureDreaminaVideoModelForTask(_0x3f1d82, _0x5cc4d4, _0x575a48);
  const _0x33c0dc = resolveDreaminaStyleVideoManifest(_0x1e187a, "dreamina");
  const _0x291b67 = getDreaminaStyleVideoExtension(_0x33c0dc)?.durationRangeByTaskType?.[_0x3f1d82];
  if (_0x291b67 && typeof _0x291b67 === "object") {
    return {
      min: _0x291b67.min,
      max: _0x291b67.max,
      step: _0x291b67.step || 1
    };
  } else {
    return {
      min: 4,
      max: 15,
      step: 1
    };
  }
}
export function normalizeDreaminaVideoDuration(_0x109901, _0x6d9194, _0x4ae510, _0x4e4ae1) {
  const _0x302eeb = getDreaminaVideoDurationRange(_0x109901, _0x6d9194, _0x4e4ae1);
  const _0xaed6c2 = Number(_0x4ae510);
  if (!Number.isFinite(_0xaed6c2)) {
    return _0x302eeb.min;
  }
  return Math.max(_0x302eeb.min, Math.min(_0x302eeb.max, Math.trunc(_0xaed6c2)));
}
export function validateDreaminaVideoRouteSelection({
  routeMode = "multimodal2video",
  taskType = "",
  model = "",
  provider = "",
  imageCount = 0,
  videoCount = 0,
  audioCount = 0
} = {}) {
  const _0x177229 = normalizeDreaminaVideoRouteMode(routeMode);
  const _0x5f5b1c = String(taskType || "").trim();
  const _0x27ac5c = Number(imageCount) || 0;
  const _0x48e6d3 = Number(videoCount) || 0;
  const _0x19ea82 = Number(audioCount) || 0;
  const _0x84145 = resolveDreaminaStyleVideoManifest(model, provider);
  const _0x25a88a = _0x84145 ? resolveModelExecution(_0x84145.modelId, {
    providerHint: _0x84145.provider
  }) : null;
  const _0x315ce2 = _0x25a88a?.executionManifest?.extensions?.seedanceVideo || {};
  const _0x3b162a = getDreaminaStyleVideoInputLimits(model, provider);
  const _0x373510 = _0x3b162a.image;
  const _0x3ae1f2 = _0x3b162a.video;
  const _0xfa4738 = _0x3b162a.audio;
  const _0x21a267 = _0x315ce2.allowAudioOnlyReferences === true;
  if (_0x177229 === "frames2video") {
    if (_0x48e6d3 > 0 || _0x19ea82 > 0) {
      return dreaminaVideoText("validation.framesOnlyImages");
    }
  }
  if (_0x5f5b1c === "text2video") {
    return "";
  }
  if (_0x5f5b1c === "image2video") {
    if (_0x48e6d3 > 0 || _0x19ea82 > 0) {
      return dreaminaVideoText("validation.framesOnlyImages");
    }
    if (_0x27ac5c < 1) {
      return dreaminaVideoText("validation.imageAtLeastOne");
    }
    if (_0x27ac5c > 1) {
      return dreaminaVideoText("validation.imageAtMostOneSingle");
    }
    return "";
  }
  if (_0x5f5b1c === "frames2video") {
    if (_0x48e6d3 > 0 || _0x19ea82 > 0) {
      return dreaminaVideoText("validation.framesOnlyImages");
    }
    if (_0x27ac5c < 2) {
      return dreaminaVideoText("validation.framesNeedTwo");
    }
    if (_0x27ac5c > 2) {
      return dreaminaVideoText("validation.framesAtMostTwo");
    }
    return "";
  }
  if (_0x5f5b1c === "multimodal2video") {
    if (_0x27ac5c <= 0 && _0x48e6d3 <= 0 && (!_0x21a267 || !(_0x19ea82 > 0))) {
      if (_0x19ea82 > 0) {
        return dreaminaVideoText("validation.allReferenceNeedsVisual");
      } else {
        return "";
      }
    }
    if (_0x27ac5c > _0x373510) {
      return dreaminaVideoText("validation.allReferenceMaxImages", {
        max: _0x373510
      });
    }
    if (_0x48e6d3 > _0x3ae1f2) {
      return dreaminaVideoText("validation.allReferenceMaxVideos", {
        max: _0x3ae1f2
      });
    }
    if (_0x19ea82 > _0xfa4738) {
      return dreaminaVideoText("validation.allReferenceMaxAudios", {
        max: _0xfa4738
      });
    }
    return "";
  }
  if (_0x5f5b1c === "multiframe2video") {
    if (_0x48e6d3 > 0 || _0x19ea82 > 0) {
      return dreaminaVideoText("validation.multiframeOnlyImages");
    }
    if (_0x27ac5c < 2) {
      return dreaminaVideoText("validation.multiframeAtLeastTwo");
    }
    if (_0x27ac5c > 20) {
      return dreaminaVideoText("validation.multiframeMaxImages");
    }
    return "";
  }
  return "";
}
export function normalizeDreaminaStyleVideoModel(_0x23f96a, _0x5484ec) {
  const _0x5d8553 = resolveDreaminaStyleVideoProvider(_0x23f96a, _0x5484ec);
  if (_0x5d8553 === "dreamina") {
    return normalizeDreaminaVideoModel(_0x23f96a, _0x5484ec);
  }
  const _0x22017c = resolveDreaminaStyleVideoManifest(_0x23f96a, _0x5d8553);
  return _0x22017c?.modelId || getDefaultDreaminaStyleVideoModel("text2video", _0x5d8553);
}
export function getDreaminaStyleVideoModelVersion(_0x3e86c8, _0xdc8a65) {
  const _0x1f4e5a = resolveDreaminaStyleVideoProvider(_0x3e86c8, _0xdc8a65);
  if (_0x1f4e5a === "dreamina") {
    return getDreaminaVideoModelVersion(_0x3e86c8, _0xdc8a65);
  }
  const _0x38dc09 = normalizeDreaminaStyleVideoModel(_0x3e86c8, _0x1f4e5a);
  const _0x21879f = resolveDreaminaStyleVideoManifest(_0x38dc09, _0x1f4e5a);
  if (_0x21879f) {
    return _0x38dc09.replace(new RegExp("^" + _0x1f4e5a + "/"), "").trim();
  } else {
    return "";
  }
}
export function getDreaminaStyleVideoModelMeta(_0x368fc7, _0x69e157) {
  const _0x5ada0e = resolveDreaminaStyleVideoProvider(_0x368fc7, _0x69e157);
  if (_0x5ada0e === "dreamina") {
    return getDreaminaVideoModelMeta(_0x368fc7, _0x69e157);
  }
  const _0x2a329b = normalizeDreaminaStyleVideoModel(_0x368fc7, _0x5ada0e);
  if (_0x5ada0e === "apimart") {
    return APIMART_DREAMINA_VIDEO_MODEL_META.get(_0x2a329b) || null;
  }
  if (_0x5ada0e === "volcengine") {
    return VOLCENGINE_DREAMINA_VIDEO_MODEL_META.get(_0x2a329b) || null;
  }
  return null;
}
export function getDreaminaStyleVideoAllowedModels(_0xf7572b, _0x572293) {
  const _0x204cd6 = normalizeStyleProvider(_0x572293) || "dreamina";
  if (_0x204cd6 === "dreamina") {
    return getDreaminaVideoAllowedModels(_0xf7572b);
  }
  const _0x2db3af = String(_0xf7572b || "").trim();
  return getDreaminaStyleVideoOptions(_0x204cd6).filter(_0xa684aa => _0xa684aa.taskTypes.includes(_0x2db3af));
}
export function getDreaminaStyleVideoDefaultModel(_0x3cfb8c, _0x5254d5) {
  const _0x4f4c00 = normalizeStyleProvider(_0x5254d5) || "dreamina";
  if (_0x4f4c00 === "dreamina") {
    return getDreaminaVideoDefaultModel(_0x3cfb8c);
  }
  return getDefaultDreaminaStyleVideoModel(_0x3cfb8c, _0x4f4c00);
}
export function isDreaminaStyleVideoTaskModelSupported(_0x3543bc, _0x2e59df, _0x566af6) {
  const _0x12e5f7 = resolveDreaminaStyleVideoProvider(_0x2e59df, _0x566af6);
  const _0x1e74f1 = normalizeDreaminaStyleVideoModel(_0x2e59df, _0x12e5f7);
  return getDreaminaStyleVideoAllowedModels(_0x3543bc, _0x12e5f7).some(_0x270413 => _0x270413.model === _0x1e74f1);
}
export function ensureDreaminaStyleVideoModelForTask(_0x531ac7, _0x383743, _0x1bf4c8) {
  const _0x156754 = resolveDreaminaStyleVideoProvider(_0x383743, _0x1bf4c8);
  if (_0x156754 === "dreamina") {
    return ensureDreaminaVideoModelForTask(_0x531ac7, _0x383743, _0x1bf4c8);
  }
  const _0xd2597c = String(_0x531ac7 || "").trim();
  const _0x53f692 = normalizeDreaminaStyleVideoModel(_0x383743, _0x156754);
  if (_0x53f692 && isDreaminaStyleVideoTaskModelSupported(_0xd2597c, _0x53f692, _0x156754)) {
    return _0x53f692;
  }
  return getDreaminaStyleVideoDefaultModel(_0xd2597c, _0x156754);
}
export function getDreaminaStyleVideoResolutionOptions(_0x10b811, _0x6d875a, _0x5911ff) {
  const _0x3f875d = resolveDreaminaStyleVideoProvider(_0x6d875a, _0x5911ff);
  if (_0x3f875d === "dreamina") {
    return getDreaminaVideoResolutionOptions(_0x10b811, _0x6d875a, _0x5911ff);
  }
  const _0xcfb63 = String(_0x10b811 || "").trim();
  const _0x19bcd4 = ensureDreaminaStyleVideoModelForTask(_0xcfb63, _0x6d875a, _0x3f875d);
  const _0x1bc2ab = resolveDreaminaStyleVideoManifest(_0x19bcd4, _0x3f875d);
  const _0x4736d6 = getDreaminaStyleVideoExtension(_0x1bc2ab)?.resolutionOptionsByTaskType?.[_0xcfb63];
  if (Array.isArray(_0x4736d6)) {
    return _0x4736d6.slice();
  } else {
    return [];
  }
}
export function normalizeDreaminaStyleVideoResolution(_0x46fa30, _0x50d465, _0x594a3a, _0x4f619a) {
  const _0x5921f0 = getDreaminaStyleVideoResolutionOptions(_0x46fa30, _0x50d465, _0x4f619a);
  if (!_0x5921f0.length) {
    return "";
  }
  return pickCanonicalOptionValue(_0x5921f0, _0x594a3a, _0x5921f0.includes("720p") ? "720p" : _0x5921f0[0]);
}
export function getDreaminaStyleVideoDurationRange(_0x1edd88, _0x5414a9, _0x2c545f) {
  const _0x55378a = resolveDreaminaStyleVideoProvider(_0x5414a9, _0x2c545f);
  if (_0x55378a === "dreamina") {
    return getDreaminaVideoDurationRange(_0x1edd88, _0x5414a9, _0x2c545f);
  }
  const _0x5d7a70 = String(_0x1edd88 || "").trim();
  if (_0x5d7a70 === "multiframe2video") {
    return {
      min: 3,
      max: 3,
      step: 1
    };
  }
  const _0x12aa62 = normalizeDreaminaStyleVideoModel(_0x5414a9, _0x55378a);
  const _0x556567 = resolveDreaminaStyleVideoManifest(_0x12aa62, _0x55378a);
  const _0x2ae2bc = getDreaminaStyleVideoExtension(_0x556567)?.durationRangeByTaskType?.[_0x5d7a70];
  if (!_0x2ae2bc || typeof _0x2ae2bc !== "object" || Array.isArray(_0x2ae2bc)) {
    return {
      min: 4,
      max: 15,
      step: 1
    };
  }
  const _0x61022 = Array.isArray(_0x2ae2bc.values) ? _0x2ae2bc.values.map(Number).filter(Number.isFinite) : [];
  return {
    min: _0x2ae2bc.min,
    max: _0x2ae2bc.max,
    step: _0x2ae2bc.step || 1,
    ...(Number.isFinite(Number(_0x2ae2bc.defaultValue)) ? {
      defaultValue: Number(_0x2ae2bc.defaultValue)
    } : {}),
    ...(_0x61022.length > 0 ? {
      values: _0x61022
    } : {}),
    ...(_0x2ae2bc.optionLabels && typeof _0x2ae2bc.optionLabels === "object" && !Array.isArray(_0x2ae2bc.optionLabels) ? {
      optionLabels: {
        ..._0x2ae2bc.optionLabels
      }
    } : {})
  };
}
export function normalizeDreaminaStyleVideoDuration(_0xa515a6, _0x28e541, _0x3cc079, _0x58362a) {
  const _0x23749c = getDreaminaStyleVideoDurationRange(_0xa515a6, _0x28e541, _0x58362a);
  const _0x4e2282 = Number(_0x3cc079);
  if (Array.isArray(_0x23749c.values) && _0x23749c.values.length > 0) {
    const _0x3e34a0 = Number(_0x23749c.defaultValue);
    const _0x2329c0 = Number.isFinite(_0x3e34a0) && _0x23749c.values.includes(_0x3e34a0) ? _0x3e34a0 : _0x23749c.values.includes(5) ? 5 : _0x23749c.values[0];
    if (!Number.isFinite(_0x4e2282)) {
      return _0x2329c0;
    }
    const _0x18e784 = Math.trunc(_0x4e2282);
    if (_0x23749c.values.includes(_0x18e784)) {
      return _0x18e784;
    }
  }
  if (!Number.isFinite(_0x4e2282)) {
    return _0x23749c.min;
  }
  return Math.max(_0x23749c.min, Math.min(_0x23749c.max, Math.trunc(_0x4e2282)));
}
export function buildDreaminaStyleVideoNodeNormalizationPatch(_0x48aa46) {
  const _0x2f36ac = _0x48aa46 && typeof _0x48aa46 === "object" ? _0x48aa46 : {};
  if (!isDreaminaStyleVideoModel(_0x2f36ac.model, _0x2f36ac.provider)) {
    return null;
  }
  const _0x3880ab = resolveDreaminaStyleVideoProvider(_0x2f36ac.model, _0x2f36ac.provider);
  if (_0x3880ab === "dreamina") {
    return buildDreaminaVideoNodeNormalizationPatch(_0x48aa46);
  }
  const _0x56601a = normalizeDreaminaStyleVideoModel(_0x2f36ac.model, _0x3880ab);
  const _0x1b6434 = normalizeDreaminaVideoRouteMode(_0x2f36ac.dreaminaRouteMode, _0x2f36ac.mode);
  const _0x58b221 = normalizeDreaminaVideoAspectRatio(_0x2f36ac.aspectRatio, {
    preserveAdaptive: true
  });
  const _0x4d2d32 = resolveDreaminaVideoTaskType({
    routeMode: _0x1b6434
  });
  const _0x12bbef = normalizeDreaminaStyleVideoResolution(_0x4d2d32, _0x56601a, _0x2f36ac.resolution || _0x2f36ac.videoSize, _0x3880ab);
  const _0x37f5bf = normalizeDreaminaStyleVideoDuration(_0x4d2d32, _0x56601a, _0x2f36ac.duration, _0x3880ab);
  const _0x1fbbdb = {};
  if (String(_0x2f36ac.provider || "").trim().toLowerCase() !== _0x3880ab) {
    _0x1fbbdb.provider = _0x3880ab;
  }
  if (_0x56601a && _0x56601a !== String(_0x2f36ac.model || "").trim()) {
    _0x1fbbdb.model = _0x56601a;
  }
  if (_0x1b6434 !== String(_0x2f36ac.dreaminaRouteMode || "").trim()) {
    _0x1fbbdb.dreaminaRouteMode = _0x1b6434;
  }
  if (_0x58b221 !== String(_0x2f36ac.aspectRatio || "").trim() && String(_0x2f36ac.aspectRatio || "").trim()) {
    _0x1fbbdb.aspectRatio = _0x58b221;
  }
  if (_0x12bbef && _0x12bbef !== String(_0x2f36ac.resolution || "").trim()) {
    _0x1fbbdb.resolution = _0x12bbef;
  }
  if (Number(_0x37f5bf) !== Number(_0x2f36ac.duration)) {
    _0x1fbbdb.duration = _0x37f5bf;
  }
  if (Object.keys(_0x1fbbdb).length > 0) {
    return _0x1fbbdb;
  } else {
    return null;
  }
}
export function buildDreaminaVideoNodeNormalizationPatch(_0x563df2) {
  const _0x26c26b = _0x563df2 && typeof _0x563df2 === "object" ? _0x563df2 : {};
  if (!isDreaminaVideoModel(_0x26c26b.model, _0x26c26b.provider)) {
    return null;
  }
  const _0xfeb1cc = normalizeDreaminaVideoModel(_0x26c26b.model, _0x26c26b.provider);
  const _0x5547d3 = normalizeDreaminaVideoRouteMode(_0x26c26b.dreaminaRouteMode, _0x26c26b.mode);
  const _0x7071d7 = normalizeDreaminaVideoAspectRatio(_0x26c26b.aspectRatio, {
    preserveAdaptive: true
  });
  const _0x3d1ae7 = {};
  if (String(_0x26c26b.provider || "").trim().toLowerCase() !== "dreamina") {
    _0x3d1ae7.provider = "dreamina";
  }
  if (_0xfeb1cc && _0xfeb1cc !== String(_0x26c26b.model || "").trim()) {
    _0x3d1ae7.model = _0xfeb1cc;
  }
  if (_0x5547d3 !== String(_0x26c26b.dreaminaRouteMode || "").trim()) {
    _0x3d1ae7.dreaminaRouteMode = _0x5547d3;
  }
  if (_0x7071d7 !== String(_0x26c26b.aspectRatio || "").trim() && String(_0x26c26b.aspectRatio || "").trim()) {
    _0x3d1ae7.aspectRatio = _0x7071d7;
  }
  if (Object.keys(_0x3d1ae7).length > 0) {
    return _0x3d1ae7;
  } else {
    return null;
  }
}