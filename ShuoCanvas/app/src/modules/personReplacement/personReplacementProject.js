import { normalizeSmartClipFps, normalizeSmartClipMode } from "../../services/smartClipJobService.js";
import { resolveModelProvider } from "../../manifests/index.js";
import { buildModelProviderProfileSelectionPatch } from "../modelProviderProfileSelection.js";
import { RH_VIDEO_V54_MODEL_ID } from "../../manifests/video/runninghub/runningHubVideoV54Manifest.js";
import { RH_VIDEO_ANIMATE2_V1_MODEL_ID } from "../../manifests/video/runninghub/runningHubVideoAnimate2V1Manifest.js";
import { RH_VIDEO_BERNINI_V1_MODEL_ID } from "../../manifests/video/runninghub/runningHubVideoBerniniV1Manifest.js";
import { RH_VIDEO_HAILUO_H3_EDIT_V1_MODEL_ID } from "../../manifests/video/runninghub/runningHubVideoHailuoH3EditV1Manifest.js";
import { RH_VIDEO_SCAIL2_V1_MODEL_ID, RH_VIDEO_SCAIL_V2_MODEL_ID } from "../../manifests/video/runninghub/runningHubVideoScail2V1Manifest.js";
import { normalizePersonReplacementVoiceSeparationsBySourceId } from "./personReplacementVoiceSeparationState.js";
export const PERSON_REPLACEMENT_SCHEMA_VERSION = 6;
export const PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID = "apimart/gpt-image-2";
export const PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID = RH_VIDEO_SCAIL2_V1_MODEL_ID;
export const PERSON_REPLACEMENT_DEFAULT_VIDEO_PROMPT = "保持源视频动作、镜头和构图，使用参考图中的人物形象替换对应人物。";
export const PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME = "first-frame";
export const PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE = "character-reference";
export const PERSON_REPLACEMENT_VIDEO_INPUT_MODES = Object.freeze([PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE]);
export const PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_REPLACEMENT_IMAGE = "replacement-image";
export const PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE = "character-reference";
export const PERSON_REPLACEMENT_VIDEO_MODEL_IDS = Object.freeze([RH_VIDEO_V54_MODEL_ID, RH_VIDEO_ANIMATE2_V1_MODEL_ID, RH_VIDEO_BERNINI_V1_MODEL_ID, RH_VIDEO_HAILUO_H3_EDIT_V1_MODEL_ID, RH_VIDEO_SCAIL2_V1_MODEL_ID, RH_VIDEO_SCAIL_V2_MODEL_ID]);
const PERSON_REPLACEMENT_VIDEO_PARAMETER_POLICIES = Object.freeze({
  [RH_VIDEO_V54_MODEL_ID]: Object.freeze({
    [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME]: Object.freeze({
      defaultParams: Object.freeze({
        rhSubtractSubject: false
      }),
      transitionParams: Object.freeze({
        rhSubtractSubject: false
      })
    }),
    [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE]: Object.freeze({
      transitionParams: Object.freeze({
        rhSubtractSubject: true
      })
    })
  }),
  [RH_VIDEO_SCAIL2_V1_MODEL_ID]: Object.freeze({
    [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME]: Object.freeze({
      defaultParams: Object.freeze({
        rhScail2ReplaceSubject: false
      }),
      transitionParams: Object.freeze({
        rhScail2ReplaceSubject: false
      })
    }),
    [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE]: Object.freeze({
      forcedParams: Object.freeze({
        rhScail2ReplaceSubject: true
      }),
      lockedFields: Object.freeze(["rhScail2ReplaceSubject"])
    })
  }),
  [RH_VIDEO_SCAIL_V2_MODEL_ID]: Object.freeze({
    [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME]: Object.freeze({
      defaultParams: Object.freeze({
        rhScail2ReplaceSubject: false
      }),
      transitionParams: Object.freeze({
        rhScail2ReplaceSubject: false
      })
    }),
    [PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE]: Object.freeze({
      forcedParams: Object.freeze({
        rhScail2ReplaceSubject: true
      }),
      lockedFields: Object.freeze(["rhScail2ReplaceSubject"])
    })
  })
});
export const PERSON_REPLACEMENT_PROJECT_STATUSES = Object.freeze(["draft", "analyzing", "character_mapping", "shot_review", "ready", "generating", "composing", "completed"]);
export const PERSON_REPLACEMENT_ORIENTATIONS = Object.freeze(["front", "back", "side", "left_profile", "right_profile", "three_quarter_left", "three_quarter_right", "over_shoulder_left", "over_shoulder_right", "unknown"]);
export const PERSON_REPLACEMENT_SCOPES = Object.freeze(["full-person", "visible-part", "clothing", "arm-hand", "face-hair", "feet"]);
export const PERSON_REPLACEMENT_DEFAULT_SCOPE = "full-person";
const PERSON_REPLACEMENT_SCOPE_LABELS = Object.freeze({
  "full-person": "完整人物",
  "visible-part": "仅可见部分",
  clothing: "衣服",
  "arm-hand": "手臂手部",
  "face-hair": "脸发",
  feet: "脚部"
});
export function formatPersonReplacementPersonLabel(_0x1fae0c = 0) {
  let _0x2d3391 = Math.max(0, Math.trunc(Number(_0x1fae0c) || 0));
  let _0x1657a0 = "";
  do {
    _0x1657a0 = String.fromCharCode(65 + _0x2d3391 % 26) + _0x1657a0;
    _0x2d3391 = Math.floor(_0x2d3391 / 26) - 1;
  } while (_0x2d3391 >= 0);
  return "人物" + _0x1657a0;
}
export function isGeneratedPersonReplacementLabel(_0xe5014c) {
  return /^人物(?:[A-Z]+|\d+)$/u.test(normalizeText(_0xe5014c));
}
const STATUS_INDEX = new Map(PERSON_REPLACEMENT_PROJECT_STATUSES.map((_0x1da6f7, _0x31a781) => [_0x1da6f7, _0x31a781]));
const ORIENTATION_SET = new Set(PERSON_REPLACEMENT_ORIENTATIONS);
const REPLACEMENT_SCOPE_SET = new Set(PERSON_REPLACEMENT_SCOPES);
const AUDIO_TRACKS = new Set(["original", "replacement"]);
const IDENTITY_REVIEW_STATUSES = new Set(["auto", "needs_review", "confirmed"]);
const IDENTITY_METHODS = new Set(["osnet", "manual", "fallback", "unassigned"]);
function normalizeText(_0xc69d6e) {
  return String(_0xc69d6e ?? "").trim();
}
export function normalizePersonReplacementScope(_0x4212f8) {
  const _0x4b9e04 = normalizeText(_0x4212f8);
  if (REPLACEMENT_SCOPE_SET.has(_0x4b9e04)) {
    return _0x4b9e04;
  } else {
    return PERSON_REPLACEMENT_DEFAULT_SCOPE;
  }
}
export function formatPersonReplacementScopeLabel(_0x919da8) {
  return PERSON_REPLACEMENT_SCOPE_LABELS[normalizePersonReplacementScope(_0x919da8)];
}
export function resolvePersonReplacementVideoModelId(_0x5cef8b) {
  const _0x2ad04e = normalizeText(_0x5cef8b);
  if (PERSON_REPLACEMENT_VIDEO_MODEL_IDS.includes(_0x2ad04e)) {
    return _0x2ad04e;
  } else {
    return PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID;
  }
}
export function resolvePersonReplacementVideoGenerationFps(_0x22e00f = {}) {
  if (_0x22e00f?.processingMode === "skip") {
    return 24;
  }
  return normalizeSmartClipFps(_0x22e00f?.smartClipFps);
}
export function normalizePersonReplacementVideoInputMode(_0x2c223d) {
  const _0xf4dcd1 = normalizeText(_0x2c223d);
  if (PERSON_REPLACEMENT_VIDEO_INPUT_MODES.includes(_0xf4dcd1)) {
    return _0xf4dcd1;
  } else {
    return PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME;
  }
}
function normalizePlainObject(_0x3876f5) {
  if (_0x3876f5 && typeof _0x3876f5 === "object" && !Array.isArray(_0x3876f5)) {
    return {
      ..._0x3876f5
    };
  } else {
    return {};
  }
}
export function resolvePersonReplacementVideoParameterPolicy({
  modelId = PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID,
  inputMode = PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME,
  generationParams = {},
  resetModeDefaults = false
} = {}) {
  const _0x11fc92 = resolvePersonReplacementVideoModelId(modelId);
  const _0x4f105f = normalizePersonReplacementVideoInputMode(inputMode);
  const _0x2dcf12 = PERSON_REPLACEMENT_VIDEO_PARAMETER_POLICIES[_0x11fc92]?.[_0x4f105f] || {};
  const _0x56dd99 = {
    ...normalizePlainObject(_0x2dcf12.defaultParams),
    ...normalizePlainObject(generationParams),
    ...(resetModeDefaults ? normalizePlainObject(_0x2dcf12.transitionParams) : {}),
    ...normalizePlainObject(_0x2dcf12.forcedParams)
  };
  const _0x4d6701 = {};
  (Array.isArray(_0x2dcf12.lockedFields) ? _0x2dcf12.lockedFields : []).forEach(_0x4128c1 => {
    const _0x186626 = normalizeText(_0x4128c1);
    if (_0x186626) {
      _0x4d6701[_0x186626] = {
        disabled: true
      };
    }
  });
  return {
    modelId: _0x11fc92,
    inputMode: _0x4f105f,
    generationParams: _0x56dd99,
    uiSchemaFieldState: _0x4d6701
  };
}
function normalizeParamsByModel(_0x535717) {
  const _0x300fda = normalizePlainObject(_0x535717);
  return Object.fromEntries(Object.entries(_0x300fda).map(([_0x3e6a0f, _0x5e5b07]) => [normalizeText(_0x3e6a0f), normalizePlainObject(_0x5e5b07)]).filter(([_0x22a27c]) => _0x22a27c));
}
function firstDefined(..._0x53eb3a) {
  return _0x53eb3a.find(_0x14ffdc => _0x14ffdc !== undefined && _0x14ffdc !== null);
}
function toArray(_0x5e1948) {
  if (Array.isArray(_0x5e1948)) {
    return _0x5e1948;
  }
  if (_0x5e1948 && typeof _0x5e1948 === "object") {
    return [_0x5e1948];
  } else {
    return [];
  }
}
function normalizeNonNegativeNumber(_0x1f0b00, _0x716bfe = 0) {
  const _0x2b7147 = Number(_0x1f0b00);
  if (Number.isFinite(_0x2b7147) && _0x2b7147 >= 0) {
    return _0x2b7147;
  } else {
    return _0x716bfe;
  }
}
function normalizeConfidence(_0x59f221) {
  const _0x3aed97 = Number(_0x59f221);
  if (!Number.isFinite(_0x3aed97)) {
    return 0;
  }
  const _0x5afc4b = _0x3aed97 > 1 && _0x3aed97 <= 100 ? _0x3aed97 / 100 : _0x3aed97;
  return Math.max(0, Math.min(1, _0x5afc4b));
}
function normalizeStringArray(_0x54fcb6) {
  const _0x5cde51 = [];
  const _0x51cf21 = new Set();
  toArray(_0x54fcb6).forEach(_0x28a12f => {
    const _0x4542a6 = normalizeText(_0x28a12f);
    if (!_0x4542a6 || _0x51cf21.has(_0x4542a6)) {
      return;
    }
    _0x51cf21.add(_0x4542a6);
    _0x5cde51.push(_0x4542a6);
  });
  return _0x5cde51;
}
function normalizeImageRefs(_0x5c833d) {
  const _0xbb9cd9 = [];
  const _0x3d2c0c = new Set();
  const _0x1cca2a = Array.isArray(_0x5c833d) ? _0x5c833d : _0x5c833d === undefined || _0x5c833d === null ? [] : [_0x5c833d];
  _0x1cca2a.forEach(_0x1371b9 => {
    const _0x386077 = normalizeText(_0x1371b9 && typeof _0x1371b9 === "object" ? firstDefined(_0x1371b9.ref, _0x1371b9.id, _0x1371b9.assetRef, _0x1371b9.url, _0x1371b9.path) : _0x1371b9);
    if (!_0x386077 || _0x3d2c0c.has(_0x386077)) {
      return;
    }
    _0x3d2c0c.add(_0x386077);
    _0xbb9cd9.push(_0x386077);
  });
  return _0xbb9cd9;
}
function parseJsonLike(_0x56227b) {
  if (typeof _0x56227b !== "string") {
    return _0x56227b;
  }
  const _0xb628ae = _0x56227b.trim();
  if (!_0xb628ae) {
    return {};
  }
  const _0x3c534f = _0xb628ae.replace(/^```(?:json)?\s*/iu, "").replace(/\s*```$/u, "").trim();
  try {
    return JSON.parse(_0x3c534f);
  } catch {
    const _0x349696 = Math.min(...[_0x3c534f.indexOf("{"), _0x3c534f.indexOf("[")].filter(_0x567b53 => _0x567b53 >= 0));
    const _0x167ba1 = _0x3c534f.lastIndexOf("}");
    const _0x5072b9 = _0x3c534f.lastIndexOf("]");
    const _0x3e0fee = Math.max(_0x167ba1, _0x5072b9);
    if (Number.isFinite(_0x349696) && _0x349696 >= 0 && _0x3e0fee > _0x349696) {
      try {
        return JSON.parse(_0x3c534f.slice(_0x349696, _0x3e0fee + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}
function unwrapAiAnalysis(_0x34617e) {
  let _0x4866d1 = parseJsonLike(_0x34617e);
  for (let _0x4c641b = 0; _0x4c641b < 5; _0x4c641b += 1) {
    if (!_0x4866d1 || typeof _0x4866d1 !== "object" || Array.isArray(_0x4866d1)) {
      break;
    }
    const _0xfab23d = firstDefined(_0x4866d1.analysis, _0x4866d1.result, _0x4866d1.output, _0x4866d1.data, _0x4866d1.response);
    if (_0xfab23d === undefined || _0xfab23d === _0x4866d1) {
      break;
    }
    _0x4866d1 = parseJsonLike(_0xfab23d);
  }
  return _0x4866d1;
}
const ORIENTATION_ALIASES = new Map([["front", "front"], ["frontal", "front"], ["正面", "front"], ["正脸", "front"], ["面向镜头", "front"], ["back", "back"], ["back_facing", "back"], ["rear", "back"], ["背面", "back"], ["背身", "back"], ["背对镜头", "back"], ["side", "side"], ["profile", "side"], ["侧面", "side"], ["侧身", "side"], ["left_profile", "left_profile"], ["profile_left", "left_profile"], ["左侧面", "left_profile"], ["左侧脸", "left_profile"], ["right_profile", "right_profile"], ["profile_right", "right_profile"], ["右侧面", "right_profile"], ["右侧脸", "right_profile"], ["three_quarter_left", "three_quarter_left"], ["3_4_left", "three_quarter_left"], ["左三分之四", "three_quarter_left"], ["左前侧", "three_quarter_left"], ["three_quarter_right", "three_quarter_right"], ["3_4_right", "three_quarter_right"], ["右三分之四", "three_quarter_right"], ["右前侧", "three_quarter_right"], ["over_shoulder_left", "over_shoulder_left"], ["over_the_shoulder_left", "over_shoulder_left"], ["左侧过肩", "over_shoulder_left"], ["左过肩", "over_shoulder_left"], ["over_shoulder_right", "over_shoulder_right"], ["over_the_shoulder_right", "over_shoulder_right"], ["右侧过肩", "over_shoulder_right"], ["右过肩", "over_shoulder_right"], ["unknown", "unknown"], ["未知", "unknown"]]);
export function normalizePersonReplacementOrientation(_0x56429d) {
  const _0x33e7df = normalizeText(_0x56429d).toLowerCase();
  if (!_0x33e7df) {
    return "unknown";
  }
  const _0xbc4564 = _0x33e7df.replace(/[\s/-]+/gu, "_");
  if (ORIENTATION_SET.has(_0xbc4564)) {
    return _0xbc4564;
  }
  if (ORIENTATION_ALIASES.has(_0xbc4564)) {
    return ORIENTATION_ALIASES.get(_0xbc4564);
  }
  if (/过肩|over.*shoulder/iu.test(_0x33e7df)) {
    if (/左|left/iu.test(_0x33e7df)) {
      return "over_shoulder_left";
    }
    if (/右|right/iu.test(_0x33e7df)) {
      return "over_shoulder_right";
    }
  }
  if (/背|back|rear/iu.test(_0x33e7df)) {
    return "back";
  }
  if (/正|front/iu.test(_0x33e7df)) {
    return "front";
  }
  if (/左.*(?:侧|profile)|(?:left).*profile/iu.test(_0x33e7df)) {
    return "left_profile";
  }
  if (/右.*(?:侧|profile)|(?:right).*profile/iu.test(_0x33e7df)) {
    return "right_profile";
  }
  if (/侧|side|profile/iu.test(_0x33e7df)) {
    return "side";
  }
  return "unknown";
}
function normalizeHorizontal(_0x771103) {
  const _0x57de71 = normalizeText(_0x771103).toLowerCase();
  if (/左|left/iu.test(_0x57de71)) {
    return "left";
  }
  if (/右|right/iu.test(_0x57de71)) {
    return "right";
  }
  if (/中|center|centre|middle/iu.test(_0x57de71)) {
    return "center";
  }
  return "unknown";
}
function normalizeDepth(_0xb7358b) {
  const _0x273070 = normalizeText(_0xb7358b).toLowerCase();
  if (/前景|foreground|near|close/iu.test(_0x273070)) {
    return "foreground";
  }
  if (/后景|背景|background|far/iu.test(_0x273070)) {
    return "background";
  }
  if (/中景|midground|middle/iu.test(_0x273070)) {
    return "midground";
  }
  return "unknown";
}
function normalizeOcclusion(_0x23693e) {
  if (_0x23693e === true) {
    return "partial";
  }
  if (_0x23693e === false) {
    return "none";
  }
  const _0x4b6c86 = normalizeText(_0x23693e && typeof _0x23693e === "object" ? firstDefined(_0x23693e.level, _0x23693e.type, _0x23693e.status) : _0x23693e).toLowerCase();
  if (/heavy|severe|large|大面积|严重|高度/iu.test(_0x4b6c86)) {
    return "heavy";
  }
  if (/partial|partly|medium|局部|部分|遮挡/iu.test(_0x4b6c86)) {
    return "partial";
  }
  return "none";
}
function normalizeBoundingBox(_0x4813a2, _0x725f90 = {}) {
  if (!_0x4813a2) {
    return null;
  }
  let _0x4e5cf9;
  let _0x5050b9;
  let _0x53f0d9;
  let _0x4a80c5;
  if (Array.isArray(_0x4813a2)) {
    [_0x4e5cf9, _0x5050b9, _0x53f0d9, _0x4a80c5] = _0x4813a2;
  } else if (typeof _0x4813a2 === "object") {
    _0x4e5cf9 = firstDefined(_0x4813a2.x, _0x4813a2.left, _0x4813a2.xmin, _0x4813a2.xMin);
    _0x5050b9 = firstDefined(_0x4813a2.y, _0x4813a2.top, _0x4813a2.ymin, _0x4813a2.yMin);
    _0x53f0d9 = firstDefined(_0x4813a2.width, _0x4813a2.w);
    _0x4a80c5 = firstDefined(_0x4813a2.height, _0x4813a2.h);
    const _0x3d35c4 = firstDefined(_0x4813a2.right, _0x4813a2.xmax, _0x4813a2.xMax);
    const _0x578570 = firstDefined(_0x4813a2.bottom, _0x4813a2.ymax, _0x4813a2.yMax);
    if (_0x53f0d9 === undefined && _0x3d35c4 !== undefined) {
      _0x53f0d9 = Number(_0x3d35c4) - Number(_0x4e5cf9);
    }
    if (_0x4a80c5 === undefined && _0x578570 !== undefined) {
      _0x4a80c5 = Number(_0x578570) - Number(_0x5050b9);
    }
  }
  const _0x57fc59 = [_0x4e5cf9, _0x5050b9, _0x53f0d9, _0x4a80c5].map(Number);
  if (_0x57fc59.some(_0x36d8ea => !Number.isFinite(_0x36d8ea))) {
    return null;
  }
  let [_0xb14fd5, _0x5a6b7a, _0x546c04, _0x8ba34e] = _0x57fc59;
  const _0x331c92 = Number(firstDefined(_0x725f90.width, _0x725f90.frameWidth, _0x725f90.imageWidth));
  const _0x448a21 = Number(firstDefined(_0x725f90.height, _0x725f90.frameHeight, _0x725f90.imageHeight));
  if (_0x331c92 > 0 && _0x448a21 > 0 && _0x57fc59.some(_0x575ef1 => _0x575ef1 > 1)) {
    _0xb14fd5 /= _0x331c92;
    _0x546c04 /= _0x331c92;
    _0x5a6b7a /= _0x448a21;
    _0x8ba34e /= _0x448a21;
  } else if (_0x57fc59.every(_0x532999 => _0x532999 >= 0 && _0x532999 <= 100) && _0x57fc59.some(_0x5e7b6a => _0x5e7b6a > 1)) {
    _0xb14fd5 /= 100;
    _0x5a6b7a /= 100;
    _0x546c04 /= 100;
    _0x8ba34e /= 100;
  }
  return {
    x: Math.max(0, Math.min(1, _0xb14fd5)),
    y: Math.max(0, Math.min(1, _0x5a6b7a)),
    width: Math.max(0, Math.min(1 - Math.max(0, _0xb14fd5), _0x546c04)),
    height: Math.max(0, Math.min(1 - Math.max(0, _0x5a6b7a), _0x8ba34e))
  };
}
function inferHorizontal(_0x479ca8) {
  if (!_0x479ca8) {
    return "unknown";
  }
  const _0x28920f = _0x479ca8.x + _0x479ca8.width / 2;
  if (_0x28920f < 0.4) {
    return "left";
  }
  if (_0x28920f > 0.6) {
    return "right";
  }
  return "center";
}
function normalizeAnalysisStatus(_0x15ed50, _0xc91a99 = "pending") {
  const _0x4caf14 = normalizeText(_0x15ed50).toLowerCase();
  if (["pending", "running", "succeeded", "failed", "needs_review"].includes(_0x4caf14)) {
    return _0x4caf14;
  } else {
    return _0xc91a99;
  }
}
function normalizeGenerationStatus(_0x1dee93) {
  const _0x5a35e6 = normalizeText(_0x1dee93).toLowerCase();
  if (["pending", "queued", "submitting", "running", "succeeded", "failed", "cancelled", "needs_review"].includes(_0x5a35e6)) {
    return _0x5a35e6;
  } else {
    return "pending";
  }
}
function normalizeMaterializationStatus(_0x595ccb, _0x87ae54 = false) {
  const _0x5835b4 = normalizeText(_0x595ccb).toLowerCase();
  if (["pending", "running", "succeeded", "failed"].includes(_0x5835b4)) {
    return _0x5835b4;
  }
  if (_0x87ae54) {
    return "succeeded";
  } else {
    return "pending";
  }
}
export function normalizePersonReplacementPerson(_0x2f58cc = {}, {
  shotId = "shot-1",
  index = 0,
  frame = {}
} = {}) {
  const _0x493e26 = normalizeBoundingBox(firstDefined(_0x2f58cc.bbox, _0x2f58cc.box, _0x2f58cc.boundingBox, _0x2f58cc.bounding_box, _0x2f58cc.region, _0x2f58cc.locator?.bbox), frame);
  const _0x15b470 = normalizeHorizontal(firstDefined(_0x2f58cc.horizontal, _0x2f58cc.side, _0x2f58cc.position, _0x2f58cc.location, _0x2f58cc.locator?.horizontal));
  const _0x292b10 = normalizeText(firstDefined(_0x2f58cc.sourceCharacterId, _0x2f58cc.source_character_id, _0x2f58cc.identityId, _0x2f58cc.identity_id, _0x2f58cc.clusterId, _0x2f58cc.cluster_id, _0x2f58cc.trackId, _0x2f58cc.track_id));
  return {
    id: normalizeText(firstDefined(_0x2f58cc.id, _0x2f58cc.personId, _0x2f58cc.person_id)) || shotId + "-person-" + (index + 1),
    sourceCharacterId: _0x292b10,
    targetCharacterId: normalizeText(firstDefined(_0x2f58cc.targetCharacterId, _0x2f58cc.target_character_id)),
    targetAppearanceId: normalizeText(firstDefined(_0x2f58cc.targetAppearanceId, _0x2f58cc.target_appearance_id)),
    ...(_0x2f58cc.projectMappingDisabled === true || _0x2f58cc.project_mapping_disabled === true ? {
      projectMappingDisabled: true
    } : {}),
    replacementScope: normalizePersonReplacementScope(firstDefined(_0x2f58cc.replacementScope, _0x2f58cc.replacement_scope)),
    detectionClass: normalizeText(firstDefined(_0x2f58cc.detectionClass, _0x2f58cc.detection_class, _0x2f58cc.className)) || "person",
    detectionMethod: ["automatic", "manual"].includes(normalizeText(firstDefined(_0x2f58cc.detectionMethod, _0x2f58cc.detection_method))) ? normalizeText(firstDefined(_0x2f58cc.detectionMethod, _0x2f58cc.detection_method)) : "automatic",
    label: normalizeText(firstDefined(_0x2f58cc.label, _0x2f58cc.personLabel, _0x2f58cc.name)),
    genderHint: normalizeText(firstDefined(_0x2f58cc.genderHint, _0x2f58cc.gender, _0x2f58cc.perceivedGender, _0x2f58cc.sex)),
    locator: {
      horizontal: _0x15b470 === "unknown" ? inferHorizontal(_0x493e26) : _0x15b470,
      depth: normalizeDepth(firstDefined(_0x2f58cc.depth, _0x2f58cc.layer, _0x2f58cc.position, _0x2f58cc.location, _0x2f58cc.locator?.depth)),
      bbox: _0x493e26
    },
    orientation: normalizePersonReplacementOrientation(firstDefined(_0x2f58cc.orientation, _0x2f58cc.facing, _0x2f58cc.direction, _0x2f58cc.pose?.orientation)),
    orientationModelId: normalizeText(firstDefined(_0x2f58cc.orientationModelId, _0x2f58cc.orientation_model_id)),
    identityConfidence: normalizeConfidence(firstDefined(_0x2f58cc.identityConfidence, _0x2f58cc.identity_confidence, _0x2f58cc.characterConfidence, _0x2f58cc.character_confidence)),
    detectionConfidence: normalizeConfidence(firstDefined(_0x2f58cc.detectionConfidence, _0x2f58cc.detection_confidence, _0x2f58cc.detectorConfidence, _0x2f58cc.detector_confidence)),
    identityMatchSimilarity: normalizeConfidence(firstDefined(_0x2f58cc.identityMatchSimilarity, _0x2f58cc.matchSimilarity, _0x2f58cc.match_similarity)),
    identityReviewStatus: IDENTITY_REVIEW_STATUSES.has(normalizeText(_0x2f58cc.identityReviewStatus)) ? normalizeText(_0x2f58cc.identityReviewStatus) : firstDefined(_0x2f58cc.reviewRequired, _0x2f58cc.needsReview, false) ? "needs_review" : "auto",
    identityMethod: IDENTITY_METHODS.has(normalizeText(_0x2f58cc.identityMethod)) ? normalizeText(_0x2f58cc.identityMethod) : _0x292b10 ? "fallback" : "unassigned",
    identityReviewRequired: Boolean(firstDefined(_0x2f58cc.identityReviewRequired, _0x2f58cc.reviewRequired, _0x2f58cc.needsReview, false)),
    ambiguousIdentityIds: toArray(firstDefined(_0x2f58cc.ambiguousIdentityIds, _0x2f58cc.ambiguous_identity_ids, [])).map(normalizeText).filter(Boolean),
    orientationConfidence: normalizeConfidence(firstDefined(_0x2f58cc.orientationConfidence, _0x2f58cc.orientation_confidence, _0x2f58cc.facingConfidence, _0x2f58cc.facing_confidence)),
    occlusion: normalizeOcclusion(firstDefined(_0x2f58cc.occlusion, _0x2f58cc.occluded, _0x2f58cc.visibility)),
    notes: normalizeText(firstDefined(_0x2f58cc.notes, _0x2f58cc.note, _0x2f58cc.description))
  };
}
function extractPeople(_0x5f552a) {
  return firstDefined(_0x5f552a.people, _0x5f552a.persons, _0x5f552a.characters, _0x5f552a.subjects, _0x5f552a.detections?.people, _0x5f552a.detection?.people, _0x5f552a.人物, []);
}
export function resolvePersonReplacementImageResultRef(_0x33011c = {}) {
  if (typeof _0x33011c === "string") {
    return normalizeText(_0x33011c);
  }
  if (!_0x33011c || typeof _0x33011c !== "object" || Array.isArray(_0x33011c)) {
    return "";
  }
  return [_0x33011c.displayLocalPath, _0x33011c.localPath, _0x33011c.imageUrl, _0x33011c.url, _0x33011c.displayUrl, _0x33011c.ref].map(normalizeText).find(Boolean) || "";
}
function normalizePersonReplacementImageResult(_0x96f54b = {}) {
  if (typeof _0x96f54b === "string") {
    const _0x448ae2 = normalizeText(_0x96f54b);
    if (_0x448ae2) {
      return {
        imageUrl: _0x448ae2
      };
    } else {
      return null;
    }
  }
  if (!_0x96f54b || typeof _0x96f54b !== "object" || Array.isArray(_0x96f54b)) {
    return null;
  }
  const _0xe85ca7 = resolvePersonReplacementImageResultRef(_0x96f54b);
  if (!_0xe85ca7) {
    return null;
  }
  return {
    ..._0x96f54b,
    ...(_0x96f54b.displayLocalPath !== undefined ? {
      displayLocalPath: normalizeText(_0x96f54b.displayLocalPath)
    } : {}),
    ...(_0x96f54b.localPath !== undefined ? {
      localPath: normalizeText(_0x96f54b.localPath)
    } : {}),
    ...(_0x96f54b.imageUrl !== undefined ? {
      imageUrl: normalizeText(_0x96f54b.imageUrl)
    } : {}),
    ...(_0x96f54b.url !== undefined ? {
      url: normalizeText(_0x96f54b.url)
    } : {}),
    ...(_0x96f54b.displayUrl !== undefined ? {
      displayUrl: normalizeText(_0x96f54b.displayUrl)
    } : {}),
    ...(_0x96f54b.ref !== undefined ? {
      ref: normalizeText(_0x96f54b.ref)
    } : {}),
    ...(_0x96f54b.prompt !== undefined ? {
      prompt: normalizeText(_0x96f54b.prompt)
    } : {}),
    ...(_0x96f54b.userPrompt !== undefined ? {
      userPrompt: normalizeText(_0x96f54b.userPrompt)
    } : {}),
    ...(_0x96f54b.modelId !== undefined ? {
      modelId: normalizeText(_0x96f54b.modelId)
    } : {}),
    ...(_0x96f54b.provider !== undefined ? {
      provider: normalizeText(_0x96f54b.provider)
    } : {}),
    ...(_0x96f54b.createdAt !== undefined ? {
      createdAt: normalizeText(_0x96f54b.createdAt)
    } : {})
  };
}
export function getPersonReplacementImageResults(_0x16fde9 = {}) {
  const _0x503964 = _0x16fde9?.replacementImage;
  const _0x10030d = _0x503964 && typeof _0x503964 === "object" && !Array.isArray(_0x503964) ? _0x503964.results : [];
  if (Array.isArray(_0x10030d)) {
    return _0x10030d.map(normalizePersonReplacementImageResult).filter(Boolean);
  } else {
    return [];
  }
}
export function getPersonReplacementActiveImageResultIndex(_0x3d3e6a = {}, _0x28c23f = getPersonReplacementImageResults(_0x3d3e6a)) {
  if (!_0x28c23f.length) {
    return 0;
  }
  const _0x5b959b = Math.trunc(Number(_0x3d3e6a?.replacementImage?.activeIndex) || 0);
  return Math.max(0, Math.min(_0x28c23f.length - 1, _0x5b959b));
}
export function getPersonReplacementActiveImageResult(_0x4bf658 = {}, _0x50c321 = getPersonReplacementImageResults(_0x4bf658)) {
  return _0x50c321[getPersonReplacementActiveImageResultIndex(_0x4bf658, _0x50c321)] || null;
}
export function resolvePersonReplacementImageSourceRef(_0x146e00 = {}) {
  return normalizeText(_0x146e00?.imageIterationReferenceRef) || normalizeText(_0x146e00?.keyframeRef);
}
function normalizePersonReplacementImage(_0x4ee5d = {}) {
  const _0x3302ab = _0x4ee5d.replacementImage && typeof _0x4ee5d.replacementImage === "object" && !Array.isArray(_0x4ee5d.replacementImage) ? _0x4ee5d.replacementImage : {};
  const _0x167f36 = getPersonReplacementImageResults({
    replacementImage: _0x3302ab
  });
  const _0x46eccc = normalizeText(firstDefined(_0x4ee5d.replacementImageRef, _0x4ee5d.generatedKeyframeRef, _0x4ee5d.replacedFrameRef));
  if (_0x46eccc && !_0x167f36.length) {
    _0x167f36.push({
      imageUrl: _0x46eccc
    });
  }
  const _0x47b17a = Number(_0x3302ab.activeIndex);
  const _0x82c9c5 = _0x46eccc ? _0x167f36.findIndex(_0x1edf0d => resolvePersonReplacementImageResultRef(_0x1edf0d) === _0x46eccc) : -1;
  const _0x643f7a = _0x167f36.length ? Number.isFinite(_0x47b17a) ? Math.max(0, Math.min(_0x167f36.length - 1, Math.trunc(_0x47b17a))) : Math.max(0, _0x82c9c5) : 0;
  return {
    results: _0x167f36,
    activeIndex: _0x643f7a
  };
}
export function resolvePersonReplacementVideoResultRef(_0x47e4fb = {}) {
  if (typeof _0x47e4fb === "string") {
    return normalizeText(_0x47e4fb);
  }
  if (!_0x47e4fb || typeof _0x47e4fb !== "object" || Array.isArray(_0x47e4fb)) {
    return "";
  }
  return [_0x47e4fb.displayLocalPath, _0x47e4fb.localPath, _0x47e4fb.videoUrl, _0x47e4fb.url, _0x47e4fb.displayUrl, _0x47e4fb.ref].map(normalizeText).find(Boolean) || "";
}
function normalizePersonReplacementVideoResult(_0x5bc291 = {}) {
  if (typeof _0x5bc291 === "string") {
    const _0x2fa084 = normalizeText(_0x5bc291);
    if (_0x2fa084) {
      return {
        videoUrl: _0x2fa084
      };
    } else {
      return null;
    }
  }
  if (!_0x5bc291 || typeof _0x5bc291 !== "object" || Array.isArray(_0x5bc291)) {
    return null;
  }
  const _0xd49d06 = resolvePersonReplacementVideoResultRef(_0x5bc291);
  if (!_0xd49d06) {
    return null;
  }
  return {
    ..._0x5bc291,
    ...(_0x5bc291.displayLocalPath !== undefined ? {
      displayLocalPath: normalizeText(_0x5bc291.displayLocalPath)
    } : {}),
    ...(_0x5bc291.localPath !== undefined ? {
      localPath: normalizeText(_0x5bc291.localPath)
    } : {}),
    ...(_0x5bc291.videoUrl !== undefined ? {
      videoUrl: normalizeText(_0x5bc291.videoUrl)
    } : {}),
    ...(_0x5bc291.url !== undefined ? {
      url: normalizeText(_0x5bc291.url)
    } : {}),
    ...(_0x5bc291.displayUrl !== undefined ? {
      displayUrl: normalizeText(_0x5bc291.displayUrl)
    } : {}),
    ...(_0x5bc291.ref !== undefined ? {
      ref: normalizeText(_0x5bc291.ref)
    } : {}),
    ...(_0x5bc291.thumbUrl !== undefined ? {
      thumbUrl: normalizeText(_0x5bc291.thumbUrl)
    } : {}),
    ...(_0x5bc291.prompt !== undefined ? {
      prompt: normalizeText(_0x5bc291.prompt)
    } : {}),
    ...(_0x5bc291.modelId !== undefined ? {
      modelId: normalizeText(_0x5bc291.modelId)
    } : {}),
    ...(_0x5bc291.provider !== undefined ? {
      provider: normalizeText(_0x5bc291.provider)
    } : {}),
    ...(_0x5bc291.createdAt !== undefined ? {
      createdAt: normalizeText(_0x5bc291.createdAt)
    } : {})
  };
}
export function getPersonReplacementVideoResults(_0x1907ae = {}) {
  const _0xb795ec = _0x1907ae?.replacementVideo;
  const _0x269632 = _0xb795ec && typeof _0xb795ec === "object" && !Array.isArray(_0xb795ec) ? _0xb795ec.results : [];
  if (Array.isArray(_0x269632)) {
    return _0x269632.map(normalizePersonReplacementVideoResult).filter(Boolean);
  } else {
    return [];
  }
}
export function getPersonReplacementActiveVideoResultIndex(_0x12df96 = {}, _0x1d5f2e = getPersonReplacementVideoResults(_0x12df96)) {
  if (!_0x1d5f2e.length) {
    return 0;
  }
  const _0x3e44cd = Math.trunc(Number(_0x12df96?.replacementVideo?.activeIndex) || 0);
  return Math.max(0, Math.min(_0x1d5f2e.length - 1, _0x3e44cd));
}
export function getPersonReplacementActiveVideoResult(_0x2b0d1a = {}, _0x3c3d3a = getPersonReplacementVideoResults(_0x2b0d1a)) {
  return _0x3c3d3a[getPersonReplacementActiveVideoResultIndex(_0x2b0d1a, _0x3c3d3a)] || null;
}
function normalizePersonReplacementVideo(_0x31e615 = {}) {
  const _0x4c9abc = _0x31e615.replacementVideo && typeof _0x31e615.replacementVideo === "object" && !Array.isArray(_0x31e615.replacementVideo) ? _0x31e615.replacementVideo : {};
  const _0x1758ed = getPersonReplacementVideoResults({
    replacementVideo: _0x4c9abc
  });
  const _0x3f0657 = normalizeText(firstDefined(_0x31e615.resultVideoRef, _0x31e615.outputVideoRef, _0x31e615.resultRef));
  if (_0x3f0657 && !_0x1758ed.length) {
    _0x1758ed.push({
      videoUrl: _0x3f0657
    });
  }
  const _0x1443e5 = Number(_0x4c9abc.activeIndex);
  const _0x12c047 = _0x3f0657 ? _0x1758ed.findIndex(_0x369c8f => resolvePersonReplacementVideoResultRef(_0x369c8f) === _0x3f0657) : -1;
  const _0x29619c = _0x1758ed.length ? Number.isFinite(_0x1443e5) ? Math.max(0, Math.min(_0x1758ed.length - 1, Math.trunc(_0x1443e5))) : Math.max(0, _0x12c047) : 0;
  return {
    results: _0x1758ed,
    activeIndex: _0x29619c
  };
}
export function normalizePersonReplacementShot(_0x5c4951 = {}, _0x10704e = 0) {
  const _0x1278ed = normalizeText(firstDefined(_0x5c4951.id, _0x5c4951.shotId, _0x5c4951.shot_id, _0x5c4951.segmentId, _0x5c4951.clipId)) || "shot-" + (_0x10704e + 1);
  const _0x335a09 = normalizeNonNegativeNumber(firstDefined(_0x5c4951.startTimeSec, _0x5c4951.start_time, _0x5c4951.start, _0x5c4951.in));
  const _0x3c36fe = Number(firstDefined(_0x5c4951.endTimeSec, _0x5c4951.end_time, _0x5c4951.end, _0x5c4951.out));
  const _0x16d6c8 = normalizeNonNegativeNumber(firstDefined(_0x5c4951.durationSec, _0x5c4951.duration, _0x5c4951.length));
  const _0x32f983 = Number.isFinite(_0x3c36fe) && _0x3c36fe >= _0x335a09 ? _0x3c36fe : _0x335a09 + _0x16d6c8;
  const _0x4a0bcb = firstDefined(_0x5c4951.frame, _0x5c4951.frameSize, _0x5c4951.imageSize, {});
  const _0x3c2dad = toArray(extractPeople(_0x5c4951)).map((_0x2d312b, _0x44c388) => normalizePersonReplacementPerson(_0x2d312b, {
    shotId: _0x1278ed,
    index: _0x44c388,
    frame: _0x4a0bcb
  }));
  const _0x54b3bb = normalizeText(firstDefined(_0x5c4951.videoRef, _0x5c4951.clipRef, _0x5c4951.segmentRef, _0x5c4951.video));
  const _0x35490c = normalizeText(firstDefined(_0x5c4951.keyframeRef, _0x5c4951.keyFrameRef, _0x5c4951.firstFrameRef, _0x5c4951.frameRef, _0x5c4951.imageRef));
  const _0x15adee = normalizeText(_0x5c4951.imageIterationOriginalKeyframeRef);
  const _0x323c87 = normalizePersonReplacementImage(_0x5c4951);
  const _0x106097 = normalizeText(_0x5c4951.imageIterationReferenceRef) || (_0x15adee ? _0x35490c : "");
  const _0x3ab1a6 = _0x323c87.results.some(_0x1fb701 => resolvePersonReplacementImageResultRef(_0x1fb701) === _0x106097) ? _0x106097 : "";
  const _0x9976a7 = getPersonReplacementActiveImageResult({
    replacementImage: _0x323c87
  }, _0x323c87.results);
  const _0xc84a5e = normalizePersonReplacementVideo(_0x5c4951);
  const _0x6d3f0c = getPersonReplacementActiveVideoResult({
    replacementVideo: _0xc84a5e
  }, _0xc84a5e.results);
  return {
    id: _0x1278ed,
    sourceId: normalizeText(firstDefined(_0x5c4951.sourceId, _0x5c4951.source_id)),
    index: Number.isInteger(Number(_0x5c4951.index)) ? Number(_0x5c4951.index) : _0x10704e,
    frame: {
      width: normalizeNonNegativeNumber(firstDefined(_0x4a0bcb.width, _0x4a0bcb.frameWidth, _0x4a0bcb.imageWidth)),
      height: normalizeNonNegativeNumber(firstDefined(_0x4a0bcb.height, _0x4a0bcb.frameHeight, _0x4a0bcb.imageHeight))
    },
    startTimeSec: _0x335a09,
    endTimeSec: _0x32f983,
    durationSec: Math.max(0, _0x32f983 - _0x335a09),
    sourceVideoRef: normalizeText(firstDefined(_0x5c4951.sourceVideoRef, _0x5c4951.sourceRef, _0x5c4951.originalVideoRef)),
    videoRef: _0x54b3bb,
    ...(_0x5c4951.videoRefIsCropped === true ? {
      videoRefIsCropped: true
    } : {}),
    ...(_0x5c4951.isReversed === true ? {
      isReversed: true
    } : {}),
    materializedIsReversed: typeof _0x5c4951.materializedIsReversed === "boolean" ? _0x5c4951.materializedIsReversed : Boolean(_0x54b3bb) && _0x5c4951.isReversed === true,
    keyframeRef: _0x15adee || _0x35490c,
    ...(_0x3ab1a6 ? {
      imageIterationReferenceRef: _0x3ab1a6
    } : {}),
    keyframeIndex: Math.max(0, Math.trunc(normalizeNonNegativeNumber(firstDefined(_0x5c4951.keyframeIndex, _0x5c4951.frameIndex)))),
    keyframeTimeSec: normalizeNonNegativeNumber(firstDefined(_0x5c4951.keyframeTimeSec, _0x5c4951.frameTimeSec, _0x335a09)),
    ...(_0x5c4951.keyframeManuallySelected === true ? {
      keyframeManuallySelected: true
    } : {}),
    outputFps: normalizeNonNegativeNumber(firstDefined(_0x5c4951.outputFps, _0x5c4951.fps, _0x5c4951.frameRate)),
    materializationStatus: normalizeMaterializationStatus(firstDefined(_0x5c4951.materializationStatus, _0x5c4951.clipStatus), Boolean(_0x54b3bb)),
    materializationProgress: Math.max(0, Math.min(100, normalizeNonNegativeNumber(_0x5c4951.materializationProgress))),
    replacementImage: _0x323c87,
    replacementImageRef: resolvePersonReplacementImageResultRef(_0x9976a7),
    replacementVideoReferenceKind: normalizeText(_0x5c4951.replacementVideoReferenceKind) === PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE ? PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE : PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_REPLACEMENT_IMAGE,
    people: _0x3c2dad,
    analysisStatus: normalizeAnalysisStatus(firstDefined(_0x5c4951.analysisStatus, _0x5c4951.analysis_status), _0x3c2dad.length ? "succeeded" : "pending"),
    reviewRequired: Boolean(firstDefined(_0x5c4951.reviewRequired, _0x5c4951.needsReview, _0x5c4951.needs_review, false)),
    imagePrompt: normalizeText(firstDefined(_0x5c4951.imagePrompt, _0x5c4951.replacementImagePrompt, _0x5c4951.prompt, _0x5c4951.replacementPrompt)),
    sceneReference: {
      sceneId: normalizeText(firstDefined(_0x5c4951.sceneReference?.sceneId, _0x5c4951.sceneReferenceId)),
      appearanceId: normalizeText(firstDefined(_0x5c4951.sceneReference?.appearanceId, _0x5c4951.sceneReferenceAppearanceId))
    },
    videoPrompt: normalizeText(firstDefined(_0x5c4951.videoPrompt, _0x5c4951.replacementVideoPrompt)),
    replacementVideoInputsBySlot: Object.fromEntries(Object.entries(normalizePlainObject(_0x5c4951.replacementVideoInputsBySlot)).map(([_0x342905, _0x1fcd6d]) => {
      const _0x1aa4d2 = typeof _0x1fcd6d === "string" ? {
        url: _0x1fcd6d
      } : normalizePlainObject(_0x1fcd6d);
      const _0x15ce8f = normalizeText(_0x342905);
      const _0x412f96 = normalizeText(firstDefined(_0x1aa4d2.url, _0x1aa4d2.localUrl, _0x1aa4d2.imageUrl, _0x1aa4d2.videoUrl, _0x1aa4d2.localPath));
      const _0x3e810a = normalizeText(_0x1aa4d2.kind);
      if (!_0x15ce8f || !_0x412f96 || !["image", "video", "audio"].includes(_0x3e810a)) {
        return null;
      }
      return [_0x15ce8f, {
        kind: _0x3e810a,
        url: _0x412f96,
        modelId: normalizeText(_0x1aa4d2.modelId),
        fileName: normalizeText(firstDefined(_0x1aa4d2.fileName, _0x1aa4d2.name)),
        mimeType: normalizeText(_0x1aa4d2.mimeType),
        thumbUrl: normalizeText(_0x1aa4d2.thumbUrl)
      }];
    }).filter(Boolean)),
    generationStatus: normalizeGenerationStatus(firstDefined(_0x5c4951.generationStatus, _0x5c4951.generation_status, _0x5c4951.status)),
    replacementVideo: _0xc84a5e,
    resultVideoRef: resolvePersonReplacementVideoResultRef(_0x6d3f0c),
    error: normalizeText(firstDefined(_0x5c4951.error, _0x5c4951.errorMessage))
  };
}
function normalizeVoiceReference(_0x2380fc, _0x184d5f = "") {
  const _0x1d4ece = _0x2380fc && typeof _0x2380fc === "object" ? _0x2380fc : {};
  const _0x30ac64 = normalizeText(_0x1d4ece.source) || "upload";
  const _0xc6e46 = normalizeText(firstDefined(_0x1d4ece.audioUrl, _0x1d4ece.localPath, _0x1d4ece.url, _0x184d5f, typeof _0x2380fc === "string" ? _0x2380fc : ""));
  if (!_0xc6e46) {
    return null;
  }
  return {
    audioUrl: normalizeText(firstDefined(_0x1d4ece.audioUrl, _0x1d4ece.url, _0xc6e46)),
    localPath: normalizeText(firstDefined(_0x1d4ece.localPath, _0xc6e46)),
    fileName: normalizeText(firstDefined(_0x1d4ece.fileName, _0x1d4ece.name, "上传声音")),
    source: _0x30ac64,
    ...(_0x30ac64 === "library" ? {
      libraryAssetId: normalizeText(_0x1d4ece.libraryAssetId),
      sourceAssetId: normalizeText(_0x1d4ece.sourceAssetId),
      sourceItemIndex: Math.max(0, Math.trunc(Number(_0x1d4ece.sourceItemIndex) || 0))
    } : {}),
    updatedAt: normalizeNonNegativeNumber(_0x1d4ece.updatedAt, Date.now())
  };
}
function normalizeCharacterAppearances(_0x47ca31 = {}) {
  const _0x12e382 = Array.isArray(_0x47ca31.appearances) ? _0x47ca31.appearances : normalizeImageRefs(firstDefined(_0x47ca31.imageRefs, _0x47ca31.referenceImages, _0x47ca31.images, _0x47ca31.imageRef)).map((_0x18cbd, _0x188304) => ({
    id: (normalizeText(_0x47ca31.id) || "target-character") + "-appearance-" + (_0x188304 + 1),
    name: _0x188304 === 0 ? "基础形象" : "形象 " + (_0x188304 + 1),
    imageUrl: _0x18cbd
  }));
  return _0x12e382.map((_0x8af148, _0x21f826) => ({
    ...(_0x8af148 && typeof _0x8af148 === "object" ? _0x8af148 : {}),
    id: normalizeText(_0x8af148?.id) || (normalizeText(_0x47ca31.id) || "target-character") + "-appearance-" + (_0x21f826 + 1),
    name: normalizeText(_0x8af148?.name) || (_0x21f826 === 0 ? "基础形象" : "形象 " + (_0x21f826 + 1)),
    imageUrl: normalizeText(firstDefined(_0x8af148?.imageUrl, _0x8af148?.imageRef, _0x8af148?.url, typeof _0x8af148 === "string" ? _0x8af148 : "")),
    prompt: normalizeText(firstDefined(_0x8af148?.prompt, _0x47ca31.description)),
    occurrences: normalizeText(_0x8af148?.occurrences) || "当前项目",
    generationStatus: normalizeGenerationStatus(_0x8af148?.generationStatus),
    error: normalizeText(_0x8af148?.error)
  }));
}
function normalizeTargetCharacter(_0x3fe49c = {}, _0x56b80c = 0) {
  const _0x5dacd6 = normalizeText(firstDefined(_0x3fe49c.id, _0x3fe49c.ref, _0x3fe49c.characterId)) || "target-character-" + (_0x56b80c + 1);
  const _0x2ba012 = normalizeCharacterAppearances({
    ..._0x3fe49c,
    id: _0x5dacd6
  });
  const _0x37a6de = _0x2ba012.some(_0x4bed51 => _0x4bed51.id === normalizeText(_0x3fe49c.baseAppearanceId)) ? normalizeText(_0x3fe49c.baseAppearanceId) : _0x2ba012[0]?.id || "";
  const _0x14cef1 = normalizeVoiceReference(_0x3fe49c.voiceReference, firstDefined(_0x3fe49c.voiceRef, _0x3fe49c.audioRef));
  return {
    ...normalizePlainObject(_0x3fe49c),
    id: _0x5dacd6,
    kind: "character",
    name: normalizeText(firstDefined(_0x3fe49c.name, _0x3fe49c.label, _0x3fe49c.title)) || "目标角色" + (_0x56b80c + 1),
    role: normalizeText(_0x3fe49c.role) || "人物",
    appearances: _0x2ba012,
    baseAppearanceId: _0x37a6de,
    imageRefs: _0x2ba012.map(_0x513f64 => _0x513f64.imageUrl).filter(Boolean),
    voiceReference: _0x14cef1,
    voiceRef: normalizeText(firstDefined(_0x14cef1?.localPath, _0x14cef1?.audioUrl)),
    description: normalizeText(firstDefined(_0x3fe49c.description, _0x3fe49c.prompt))
  };
}
function normalizeTargetScene(_0x5df009 = {}, _0x2c3b5e = 0) {
  const _0x48b9c6 = normalizeText(firstDefined(_0x5df009.id, _0x5df009.ref, _0x5df009.sceneId)) || "target-scene-" + (_0x2c3b5e + 1);
  const _0x3801fc = normalizeCharacterAppearances({
    ..._0x5df009,
    id: _0x48b9c6
  });
  const _0x353b04 = _0x3801fc.some(_0x168144 => _0x168144.id === normalizeText(_0x5df009.baseAppearanceId)) ? normalizeText(_0x5df009.baseAppearanceId) : _0x3801fc[0]?.id || "";
  return {
    ...normalizePlainObject(_0x5df009),
    id: _0x48b9c6,
    kind: "scene",
    name: normalizeText(firstDefined(_0x5df009.name, _0x5df009.label, _0x5df009.title)) || "场景" + (_0x2c3b5e + 1),
    role: normalizeText(_0x5df009.role) || "场景",
    appearances: _0x3801fc,
    baseAppearanceId: _0x353b04,
    imageRefs: _0x3801fc.map(_0x5e4ebb => _0x5e4ebb.imageUrl).filter(Boolean),
    description: normalizeText(firstDefined(_0x5df009.description, _0x5df009.prompt))
  };
}
function normalizeProjectAudioAsset(_0x16c226 = {}, _0x3424fa = 0) {
  const _0x37f8a1 = normalizePlainObject(_0x16c226);
  const _0xf432b3 = normalizeText(firstDefined(_0x16c226.sourceAssetId, _0x16c226.assetId));
  const _0x2dd1a5 = Math.max(0, Math.trunc(Number(firstDefined(_0x16c226.sourceItemIndex, _0x16c226.itemIndex, 0)) || 0));
  const _0x4b636a = normalizeText(firstDefined(_0x16c226.audioUrl, _0x16c226.sourceUrl, _0x16c226.url, _0x16c226.localPath));
  const _0x3536c5 = normalizeText(_0x16c226.description);
  const _0x5540e6 = normalizeText(_0x3536c5.match(/^来自画布素材「(.+)」$/u)?.[1]);
  const _0x139d95 = normalizeText(_0x16c226.savedName) || _0x5540e6;
  const _0x319e75 = _0x139d95 || normalizeText(firstDefined(_0x16c226.name, _0x16c226.assetName, _0x16c226.fileName)) || "音频 " + (_0x3424fa + 1);
  return {
    ..._0x37f8a1,
    id: normalizeText(firstDefined(_0x16c226.id, _0x16c226.audioAssetId)) || "project-audio-" + (_0x3424fa + 1),
    kind: "audio",
    mediaKind: "audio",
    name: _0x319e75,
    ...(_0x139d95 ? {
      savedName: _0x139d95
    } : {}),
    role: "音频素材",
    sourceOrigin: normalizeText(_0x16c226.sourceOrigin) || (_0xf432b3 ? "library" : "project"),
    sourceAssetId: _0xf432b3,
    sourceItemIndex: _0x2dd1a5,
    sourceUrl: _0x4b636a,
    audioUrl: _0x4b636a,
    assetName: normalizeText(_0x16c226.assetName) || _0x319e75,
    occurrences: normalizeText(_0x16c226.occurrences) || "当前项目",
    description: _0x3536c5,
    isLibraryAsset: false
  };
}
export function getPersonReplacementCharacterBaseImageRef(_0x1b1bd5 = {}) {
  const _0x29a64d = normalizeCharacterAppearances(_0x1b1bd5);
  const _0x4e8936 = normalizeText(_0x1b1bd5.baseAppearanceId);
  const _0x4e8bad = _0x29a64d.find(_0x3b4fdf => _0x3b4fdf.id === _0x4e8936) || _0x29a64d[0];
  if (_0x4e8bad?.imageUrl) {
    return _0x4e8bad.imageUrl;
  }
  return normalizeImageRefs(firstDefined(_0x1b1bd5.imageRefs, _0x1b1bd5.referenceImages, _0x1b1bd5.images, _0x1b1bd5.imageRef))[0] || "";
}
export function getPersonReplacementShotCharacterReferences(_0x106aeb = {}, _0x31a3a7 = {}) {
  const _0x1dafb0 = Array.isArray(_0x106aeb?.characters) ? _0x106aeb.characters : [];
  const _0x30cd00 = new Map(_0x1dafb0.map(_0x2d1fc3 => [normalizeText(_0x2d1fc3?.id), _0x2d1fc3]));
  const _0x491faa = new Map((Array.isArray(_0x106aeb?.mappings) ? _0x106aeb.mappings : []).map(_0x3bfb22 => [normalizeText(_0x3bfb22?.sourceCharacterId), normalizeText(_0x3bfb22?.targetCharacterId)]).filter(([_0xf5ac07, _0xac728d]) => _0xf5ac07 && _0xac728d));
  return (Array.isArray(_0x31a3a7?.people) ? _0x31a3a7.people : []).map(_0x29c314 => {
    const _0x2c4345 = normalizeText(_0x29c314?.targetCharacterId);
    const _0x12e90e = _0x2c4345 || (_0x29c314?.projectMappingDisabled === true ? "" : _0x491faa.get(normalizeText(_0x29c314?.sourceCharacterId))) || "";
    if (!_0x12e90e) {
      return null;
    }
    const _0x255381 = _0x30cd00.get(_0x12e90e);
    if (!_0x255381) {
      return null;
    }
    const _0x520a0f = normalizeCharacterAppearances(_0x255381);
    const _0x5077a1 = normalizeText(_0x29c314?.targetAppearanceId);
    const _0x540d7e = _0x520a0f.find(_0x53d1eb => normalizeText(_0x53d1eb?.id) === _0x5077a1) || _0x520a0f.find(_0x5d6dab => normalizeText(_0x5d6dab?.id) === normalizeText(_0x255381.baseAppearanceId)) || _0x520a0f[0] || null;
    return {
      personId: normalizeText(_0x29c314?.id),
      characterId: _0x12e90e,
      characterName: normalizeText(_0x255381.name) || "人物参考",
      appearanceId: normalizeText(_0x540d7e?.id),
      appearanceName: normalizeText(_0x540d7e?.name) || "基础形象",
      imageRef: normalizeText(_0x540d7e?.imageUrl || getPersonReplacementCharacterBaseImageRef(_0x255381))
    };
  }).filter(Boolean);
}
export function resolvePersonReplacementVideoImageInput(_0x53686b = {}, _0xc9276c = {}, _0x1f39d0 = _0x53686b?.settings?.replacementVideoInputMode) {
  const _0x506331 = normalizePersonReplacementVideoInputMode(_0x1f39d0);
  const _0x31b485 = getPersonReplacementImageResults(_0xc9276c);
  const _0x4367fb = getPersonReplacementActiveImageResultIndex(_0xc9276c, _0x31b485);
  const _0x105146 = resolvePersonReplacementImageResultRef(_0x31b485[_0x4367fb]);
  const _0x3925a0 = normalizeText(_0xc9276c?.replacementImageRef || _0x105146);
  const _0xd0f3fe = _0x3925a0 ? [{
    kind: PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_REPLACEMENT_IMAGE,
    imageRef: _0x3925a0
  }] : [];
  const _0x2b4a1a = _0xd0f3fe[0] || null;
  if (_0x506331 === PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE) {
    const _0x106901 = getPersonReplacementShotCharacterReferences(_0x53686b, _0xc9276c);
    const _0x461342 = _0x106901[0] || null;
    const _0x17d7b1 = _0x106901.length === 1 && _0x461342?.imageRef ? {
      kind: PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE,
      imageRef: _0x461342.imageRef,
      reference: _0x461342
    } : null;
    const _0x568f39 = [..._0xd0f3fe, ...(_0x17d7b1 ? [_0x17d7b1] : [])];
    const _0x33e4c3 = normalizeText(_0xc9276c?.replacementVideoReferenceKind);
    const _0x128e2f = (_0x33e4c3 === PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE ? _0x17d7b1 : _0x2b4a1a) || _0x2b4a1a || _0x17d7b1 || null;
    const _0x2860bc = Math.max(0, _0x568f39.indexOf(_0x128e2f));
    const _0x276b2f = _0x128e2f?.imageRef || "";
    const _0x52b7ab = _0x128e2f?.kind === PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE;
    return {
      mode: _0x506331,
      status: _0x276b2f ? "ready" : _0x106901.length > 1 ? "multiple" : "missing",
      imageRef: _0x276b2f,
      selectedImageRef: _0x276b2f,
      referenceKind: _0x128e2f?.kind || "",
      referenceOptions: _0x568f39,
      activeReferenceIndex: _0x2860bc,
      reference: _0x461342,
      references: _0x106901,
      message: _0x52b7ab ? _0x461342.characterName + " · " + _0x461342.appearanceName : _0x276b2f ? "替换首帧" : _0x106901.length > 1 ? "人物参考图模式目前仅支持单个人物" : "未绑定人物参考图"
    };
  }
  const _0x25f10a = _0xd0f3fe;
  const _0x1a5e63 = _0x2b4a1a;
  const _0x225f28 = _0x1a5e63?.imageRef || _0x3925a0;
  const _0x2cd0be = Math.max(0, _0x25f10a.indexOf(_0x1a5e63));
  return {
    mode: _0x506331,
    status: _0x225f28 ? "ready" : "missing",
    imageRef: _0x225f28,
    selectedImageRef: _0x225f28,
    referenceKind: _0x1a5e63?.kind || PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_REPLACEMENT_IMAGE,
    referenceOptions: _0x25f10a,
    activeReferenceIndex: _0x2cd0be,
    references: [],
    message: _0x225f28 ? "替换首帧" : "缺少替换首帧"
  };
}
function normalizeSource(_0x3c1ac2 = {}, _0x20cd43 = 0) {
  const _0x16d4f4 = normalizeText(firstDefined(_0x3c1ac2.videoRef, _0x3c1ac2.ref, _0x3c1ac2.url));
  return {
    id: normalizeText(_0x3c1ac2.id) || "source-" + (_0x20cd43 + 1),
    assetId: normalizeText(_0x3c1ac2.assetId),
    videoRef: _0x16d4f4,
    playbackVideoRef: normalizeText(firstDefined(_0x3c1ac2.playbackVideoRef, _0x3c1ac2.displayLocalPath, _0x3c1ac2.displayUrl)),
    thumbnailRef: normalizeText(firstDefined(_0x3c1ac2.thumbnailRef, _0x3c1ac2.posterLocalPath, _0x3c1ac2.thumbLocalPath, _0x3c1ac2.posterUrl, _0x3c1ac2.thumbUrl)),
    fileName: normalizeText(firstDefined(_0x3c1ac2.fileName, _0x3c1ac2.name)),
    durationSec: normalizeNonNegativeNumber(_0x3c1ac2.durationSec),
    processingStatus: normalizeText(firstDefined(_0x3c1ac2.processingStatus, _0x3c1ac2.analysisStatus)) || "idle",
    processingProgress: Math.max(0, Math.min(100, normalizeNonNegativeNumber(firstDefined(_0x3c1ac2.processingProgress, _0x3c1ac2.analysisProgress)))),
    order: Number.isInteger(Number(_0x3c1ac2.order)) ? Number(_0x3c1ac2.order) : _0x20cd43,
    error: normalizeText(_0x3c1ac2.error)
  };
}
function normalizeSourceCharacter(_0x7baca5 = {}, _0x1e89e0 = 0) {
  return {
    id: normalizeText(firstDefined(_0x7baca5.id, _0x7baca5.ref, _0x7baca5.sourceCharacterId)) || "source-character-" + (_0x1e89e0 + 1),
    name: normalizeText(firstDefined(_0x7baca5.name, _0x7baca5.label, _0x7baca5.title)) || "原人物" + (_0x1e89e0 + 1),
    imageRefs: normalizeImageRefs(firstDefined(_0x7baca5.imageRefs, _0x7baca5.keyframeRefs, _0x7baca5.images)),
    confidence: normalizeConfidence(firstDefined(_0x7baca5.confidence, _0x7baca5.identityConfidence)),
    reviewRequired: Boolean(firstDefined(_0x7baca5.reviewRequired, _0x7baca5.needsReview, false)),
    identityReviewStatus: IDENTITY_REVIEW_STATUSES.has(normalizeText(_0x7baca5.identityReviewStatus)) ? normalizeText(_0x7baca5.identityReviewStatus) : firstDefined(_0x7baca5.reviewRequired, _0x7baca5.needsReview, false) ? "needs_review" : "auto",
    memberCount: Math.max(0, Math.trunc(normalizeNonNegativeNumber(_0x7baca5.memberCount))),
    exemplarShotId: normalizeText(_0x7baca5.exemplarShotId),
    exemplarPersonId: normalizeText(_0x7baca5.exemplarPersonId),
    ambiguousIdentityIds: toArray(_0x7baca5.ambiguousIdentityIds).map(normalizeText).filter(Boolean),
    notes: normalizeText(firstDefined(_0x7baca5.notes, _0x7baca5.description))
  };
}
function normalizeMappings(_0x4b7104) {
  const _0x18d176 = Array.isArray(_0x4b7104) ? _0x4b7104 : _0x4b7104 && typeof _0x4b7104 === "object" ? Object.entries(_0x4b7104).map(([_0x406d24, _0x10cee7]) => ({
    sourceCharacterId: _0x406d24,
    targetCharacterId: _0x10cee7
  })) : [];
  const _0x556f9d = new Map();
  _0x18d176.forEach(_0x3759d3 => {
    const _0x490e1d = normalizeText(firstDefined(_0x3759d3?.sourceCharacterId, _0x3759d3?.source_character_id, _0x3759d3?.source));
    const _0x17b358 = normalizeText(firstDefined(_0x3759d3?.targetCharacterId, _0x3759d3?.target_character_id, _0x3759d3?.target));
    if (!_0x490e1d || !_0x17b358) {
      return;
    }
    _0x556f9d.set(_0x490e1d, {
      sourceCharacterId: _0x490e1d,
      targetCharacterId: _0x17b358
    });
  });
  return [..._0x556f9d.values()];
}
function normalizeAudio(_0x29ac3a = {}) {
  return {
    strategy: "full_replace",
    originalAudioRef: normalizeText(_0x29ac3a.originalAudioRef),
    replacementAudioRef: normalizeText(_0x29ac3a.replacementAudioRef),
    previewTrack: AUDIO_TRACKS.has(_0x29ac3a.previewTrack) ? _0x29ac3a.previewTrack : "replacement",
    exportTrack: AUDIO_TRACKS.has(_0x29ac3a.exportTrack) ? _0x29ac3a.exportTrack : "replacement",
    composeStatus: normalizeGenerationStatus(_0x29ac3a.composeStatus),
    selectedSourceId: normalizeText(_0x29ac3a.selectedSourceId),
    voiceStudioState: normalizePlainObject(_0x29ac3a.voiceStudioState),
    voiceSeparationsBySourceId: normalizePersonReplacementVoiceSeparationsBySourceId(_0x29ac3a.voiceSeparationsBySourceId)
  };
}
export function normalizePersonReplacementProject(_0x370e42 = {}) {
  const _0x15a675 = normalizeText(_0x370e42.status);
  const _0x560a37 = toArray(firstDefined(_0x370e42.characters, _0x370e42.targetCharacters, [])).map(normalizeTargetCharacter);
  const _0x490f3d = normalizeSource({
    ...(_0x370e42.source || {}),
    videoRef: firstDefined(_0x370e42.source?.videoRef, _0x370e42.videoRef, _0x370e42.sourceVideoRef),
    fileName: firstDefined(_0x370e42.source?.fileName, _0x370e42.source?.name, _0x370e42.fileName),
    durationSec: firstDefined(_0x370e42.source?.durationSec, _0x370e42.durationSec)
  });
  const _0x295653 = (Array.isArray(_0x370e42.sources) && _0x370e42.sources.length ? _0x370e42.sources : _0x490f3d.videoRef || _0x490f3d.fileName ? [_0x490f3d] : []).map(normalizeSource).sort((_0x31ae6e, _0x1e6c57) => _0x31ae6e.order - _0x1e6c57.order);
  const _0x13acd5 = _0x295653[0] || _0x490f3d;
  const _0x46371d = normalizeText(_0x370e42.settings?.replacementImageModelId) || PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID;
  const _0x1557dc = resolveModelProvider(_0x46371d, normalizeText(_0x370e42.settings?.replacementImageProvider));
  const _0x24ee28 = buildModelProviderProfileSelectionPatch({
    model: _0x46371d,
    providerProfileId: _0x370e42.settings?.replacementImageProviderProfileId,
    providerProfileIdByModel: _0x370e42.settings?.replacementImageProviderProfileIdByModel
  }, _0x46371d, _0x370e42.settings?.replacementImageProviderProfileId);
  const _0x542958 = normalizeText(_0x370e42.settings?.characterImageModelId) || PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID;
  const _0x35b3fd = buildModelProviderProfileSelectionPatch({
    model: _0x542958,
    providerProfileId: _0x370e42.settings?.characterImageProviderProfileId,
    providerProfileIdByModel: _0x370e42.settings?.characterImageProviderProfileIdByModel
  }, _0x542958, _0x370e42.settings?.characterImageProviderProfileId);
  const _0xb3a0ea = normalizeText(_0x370e42.settings?.replacementModelId);
  const _0x38e56b = resolvePersonReplacementVideoModelId(_0xb3a0ea);
  const _0x43b5be = Boolean(_0xb3a0ea && _0xb3a0ea !== _0x38e56b);
  const _0x9d8c43 = normalizePersonReplacementVideoInputMode(_0x370e42.settings?.replacementVideoInputMode);
  const _0x3b3ec1 = resolvePersonReplacementVideoParameterPolicy({
    modelId: _0x38e56b,
    inputMode: _0x9d8c43,
    generationParams: _0x43b5be ? {} : normalizePlainObject(_0x370e42.settings?.replacementVideoGenerationParams)
  });
  const _0xdec79b = buildModelProviderProfileSelectionPatch({
    model: _0x38e56b,
    providerProfileId: _0x370e42.settings?.replacementVideoProviderProfileId,
    providerProfileIdByModel: _0x370e42.settings?.replacementVideoProviderProfileIdByModel
  }, _0x38e56b, _0x370e42.settings?.replacementVideoProviderProfileId);
  return {
    schemaVersion: PERSON_REPLACEMENT_SCHEMA_VERSION,
    id: normalizeText(_0x370e42.id),
    title: normalizeText(_0x370e42.title) || "未命名人物替换项目",
    status: STATUS_INDEX.has(_0x15a675) ? _0x15a675 : "draft",
    source: _0x13acd5,
    sources: _0x295653,
    settings: {
      replacementModelId: _0x38e56b,
      replacementVideoInputMode: _0x9d8c43,
      replacementImageModelId: _0x46371d,
      replacementImageProvider: _0x1557dc,
      replacementImageProviderProfileId: _0x24ee28.providerProfileId,
      replacementImageProviderProfileIdByModel: _0x24ee28.providerProfileIdByModel,
      replacementVideoProviderProfileId: _0xdec79b.providerProfileId,
      replacementVideoProviderProfileIdByModel: _0xdec79b.providerProfileIdByModel,
      characterImageModelId: _0x542958,
      characterImageProvider: normalizeText(_0x370e42.settings?.characterImageProvider) || "apimart",
      characterImageProviderProfileId: _0x35b3fd.providerProfileId,
      characterImageProviderProfileIdByModel: _0x35b3fd.providerProfileIdByModel,
      characterImageGenerationParams: normalizePlainObject(_0x370e42.settings?.characterImageGenerationParams),
      characterImageGenerationParamsByModel: normalizeParamsByModel(_0x370e42.settings?.characterImageGenerationParamsByModel),
      replacementImageGenerationParams: normalizePlainObject(_0x370e42.settings?.replacementImageGenerationParams),
      replacementImageGenerationParamsByModel: normalizeParamsByModel(_0x370e42.settings?.replacementImageGenerationParamsByModel),
      replacementVideoGenerationParams: _0x3b3ec1.generationParams,
      smartClipMode: normalizeSmartClipMode(firstDefined(_0x370e42.settings?.smartClipMode, "balanced")),
      smartClipFps: normalizeSmartClipFps(_0x370e42.settings?.smartClipFps),
      processingMode: _0x370e42.settings?.processingMode === "skip" ? "skip" : "cut",
      automationMode: _0x370e42.settings?.automationMode === "auto" ? "auto" : "review",
      confidenceThreshold: normalizeConfidence(firstDefined(_0x370e42.settings?.confidenceThreshold, 0.75)),
      identityAutoThreshold: normalizeConfidence(firstDefined(_0x370e42.settings?.identityAutoThreshold, 0.78)),
      identityReviewThreshold: normalizeConfidence(firstDefined(_0x370e42.settings?.identityReviewThreshold, 0.68)),
      identityAmbiguityMargin: normalizeConfidence(firstDefined(_0x370e42.settings?.identityAmbiguityMargin, 0.06))
    },
    characters: _0x560a37,
    scenes: toArray(_0x370e42.scenes).map(normalizeTargetScene),
    audioAssets: toArray(_0x370e42.audioAssets).map(normalizeProjectAudioAsset).filter(_0x1ef850 => _0x1ef850.audioUrl),
    sourceCharacters: toArray(_0x370e42.sourceCharacters).map(normalizeSourceCharacter),
    mappings: normalizeMappings(_0x370e42.mappings),
    shots: toArray(_0x370e42.shots).map(normalizePersonReplacementShot),
    audio: normalizeAudio(_0x370e42.audio),
    output: {
      originalMasterRef: normalizeText(_0x370e42.output?.originalMasterRef),
      visualMasterRef: normalizeText(_0x370e42.output?.visualMasterRef),
      finalVideoRef: normalizeText(_0x370e42.output?.finalVideoRef),
      finalAudioTrack: AUDIO_TRACKS.has(_0x370e42.output?.finalAudioTrack) ? _0x370e42.output.finalAudioTrack : "",
      composeStatus: normalizeGenerationStatus(_0x370e42.output?.composeStatus),
      composedShotIds: toArray(_0x370e42.output?.composedShotIds).map(normalizeText).filter(Boolean),
      canvasBinding: normalizePlainObject(_0x370e42.output?.canvasBinding)
    },
    archivedAt: normalizeNonNegativeNumber(_0x370e42.archivedAt),
    createdAt: normalizeText(_0x370e42.createdAt),
    updatedAt: normalizeText(_0x370e42.updatedAt)
  };
}
export function createPersonReplacementProject(_0x453635 = {}) {
  return normalizePersonReplacementProject(_0x453635);
}
export function canTransitionPersonReplacementProject(_0x335725, _0x1bbd25) {
  const _0xe498d5 = STATUS_INDEX.get(normalizeText(_0x335725));
  const _0x41386d = STATUS_INDEX.get(normalizeText(_0x1bbd25));
  if (_0xe498d5 === undefined || _0x41386d === undefined) {
    return false;
  }
  return _0x41386d === _0xe498d5 || _0x41386d === _0xe498d5 + 1;
}
export function transitionPersonReplacementProject(_0x4ed233, _0x445fd3) {
  const _0x30db15 = normalizePersonReplacementProject(_0x4ed233);
  if (!canTransitionPersonReplacementProject(_0x30db15.status, _0x445fd3)) {
    throw new Error("[personReplacementProject] invalid status transition: " + _0x30db15.status + " -> " + normalizeText(_0x445fd3));
  }
  return {
    ..._0x30db15,
    status: normalizeText(_0x445fd3)
  };
}
export function setPersonReplacementCharacterMapping(_0x1443df, {
  sourceCharacterId: _0x411f26,
  targetCharacterId: _0x409904
} = {}) {
  const _0xedd08c = normalizePersonReplacementProject(_0x1443df);
  const _0x4d2864 = normalizeText(_0x411f26);
  const _0x41972a = normalizeText(_0x409904);
  if (!_0x4d2864) {
    throw new Error("[personReplacementProject] sourceCharacterId is required");
  }
  const _0x375060 = _0xedd08c.mappings.filter(_0x5b6131 => _0x5b6131.sourceCharacterId !== _0x4d2864);
  if (_0x41972a) {
    _0x375060.push({
      sourceCharacterId: _0x4d2864,
      targetCharacterId: _0x41972a
    });
  }
  return {
    ..._0xedd08c,
    mappings: _0x375060
  };
}
export function resolvePersonReplacementTargetCharacterId(_0x35af8f, _0x4cafa3) {
  const _0x410f12 = normalizePersonReplacementProject(_0x35af8f);
  const _0x38db5f = _0x4cafa3 && typeof _0x4cafa3 === "object" ? _0x4cafa3 : null;
  const _0x260402 = normalizeText(_0x38db5f?.targetCharacterId);
  if (_0x260402) {
    return _0x260402;
  }
  if (_0x38db5f?.projectMappingDisabled === true) {
    return "";
  }
  const _0x1cbe0f = normalizeText(_0x38db5f ? _0x38db5f.sourceCharacterId : _0x4cafa3);
  return _0x410f12.mappings.find(_0x59e059 => _0x59e059.sourceCharacterId === _0x1cbe0f)?.targetCharacterId || "";
}
export function getPersonReplacementCrossRoleSourceCharacterIds(_0x1d4d6a = {}) {
  const _0x4247ca = new Map();
  toArray(_0x1d4d6a?.shots).forEach(_0x2add25 => {
    toArray(_0x2add25?.people).forEach(_0x9380ca => {
      const _0x10d21c = normalizeText(_0x9380ca?.sourceCharacterId);
      const _0x3c97da = normalizeText(_0x9380ca?.label);
      if (!_0x10d21c || !_0x3c97da) {
        return;
      }
      const _0x16bf4b = _0x4247ca.get(_0x10d21c) || new Set();
      _0x16bf4b.add(_0x3c97da);
      _0x4247ca.set(_0x10d21c, _0x16bf4b);
    });
  });
  return new Set([..._0x4247ca.entries()].filter(([, _0x4433d1]) => _0x4433d1.size > 1).map(([_0x26b699]) => _0x26b699));
}
export function getPersonReplacementBindingOccurrences(_0x328d7d, {
  shotId = "",
  personId = ""
} = {}) {
  const _0x1958a2 = normalizeText(shotId);
  const _0x4d48de = normalizeText(personId);
  const _0x1deda9 = toArray(_0x328d7d?.shots);
  const _0x48a4b4 = _0x1deda9.find(_0x32ed13 => normalizeText(_0x32ed13?.id) === _0x1958a2);
  const _0x2b6ecf = toArray(_0x48a4b4?.people).find(_0x58ffa8 => normalizeText(_0x58ffa8?.id) === _0x4d48de);
  if (!_0x2b6ecf) {
    return [];
  }
  const _0x140107 = normalizeText(_0x2b6ecf.sourceCharacterId);
  const _0x12388f = normalizeText(_0x2b6ecf.label);
  return _0x1deda9.flatMap(_0x23886d => toArray(_0x23886d?.people).flatMap(_0x26edf1 => {
    const _0x50deb9 = normalizeText(_0x23886d?.id);
    const _0x335899 = normalizeText(_0x26edf1?.id);
    const _0x33e33c = _0x50deb9 === _0x1958a2 && _0x335899 === _0x4d48de;
    const _0x25b7d6 = _0x12388f ? normalizeText(_0x26edf1?.label) === _0x12388f : Boolean(_0x140107 && normalizeText(_0x26edf1?.sourceCharacterId) === _0x140107);
    if (!_0x33e33c && !_0x25b7d6) {
      return [];
    }
    return [{
      shotId: _0x50deb9,
      personId: _0x335899,
      sourceCharacterId: normalizeText(_0x26edf1?.sourceCharacterId)
    }];
  }));
}
function collectSourceIdentityOccurrences(_0x2400e9, _0x2ee3de) {
  const _0x2c4854 = normalizeText(_0x2ee3de);
  return toArray(_0x2400e9?.shots).flatMap(_0x5d1047 => toArray(_0x5d1047?.people).filter(_0x5c5dbb => normalizeText(_0x5c5dbb?.sourceCharacterId) === _0x2c4854).map(_0x2056c0 => ({
    shot: _0x5d1047,
    person: _0x2056c0
  })));
}
export function mergePersonReplacementSourceCharacters(_0x160541, {
  sourceCharacterIds = [],
  keepSourceCharacterId = ""
} = {}) {
  const _0x1c1ac4 = [...new Set(toArray(sourceCharacterIds).map(normalizeText).filter(Boolean))];
  if (_0x1c1ac4.length < 2) {
    throw new Error("合并人物至少需要选择两个身份");
  }
  const _0x59f8ee = new Set(_0x1c1ac4);
  const _0xa844e6 = _0x59f8ee.has(normalizeText(keepSourceCharacterId)) ? normalizeText(keepSourceCharacterId) : _0x1c1ac4[0];
  for (const _0x40300a of toArray(_0x160541?.shots)) {
    const _0x34d35e = toArray(_0x40300a?.people).filter(_0x1aa37a => _0x59f8ee.has(normalizeText(_0x1aa37a?.sourceCharacterId)));
    if (_0x34d35e.length > 1) {
      throw new Error("同一镜头中同时出现的人物不能合并为同一身份");
    }
  }
  const _0x46c341 = new Set();
  toArray(_0x160541?.mappings).forEach(_0x50a9fd => {
    if (_0x59f8ee.has(normalizeText(_0x50a9fd?.sourceCharacterId)) && _0x50a9fd?.targetCharacterId) {
      _0x46c341.add(normalizeText(_0x50a9fd.targetCharacterId));
    }
  });
  toArray(_0x160541?.shots).forEach(_0x3774cf => toArray(_0x3774cf?.people).forEach(_0x5b81da => {
    if (_0x59f8ee.has(normalizeText(_0x5b81da?.sourceCharacterId)) && _0x5b81da?.targetCharacterId) {
      _0x46c341.add(normalizeText(_0x5b81da.targetCharacterId));
    }
  }));
  if (_0x46c341.size > 1) {
    throw new Error("所选人物已经映射到不同目标人物，请先统一映射后再合并");
  }
  const _0x428f6f = [..._0x46c341][0] || "";
  const _0x4e74b3 = toArray(_0x160541?.sourceCharacters);
  const _0x157fa8 = _0x4e74b3.filter(_0x2b3feb => _0x59f8ee.has(_0x2b3feb.id));
  const _0xf11458 = _0x157fa8.find(_0x50c806 => _0x50c806.id === _0xa844e6) || _0x157fa8[0] || {
    id: _0xa844e6,
    name: "原人物"
  };
  const _0x527f21 = {
    ..._0xf11458,
    id: _0xa844e6,
    imageRefs: [...new Set(_0x157fa8.flatMap(_0x5dd7e0 => toArray(_0x5dd7e0.imageRefs)))],
    confidence: _0x157fa8.length ? Math.min(..._0x157fa8.map(_0x562219 => normalizeConfidence(_0x562219.confidence))) : 0,
    reviewRequired: false,
    identityReviewStatus: "confirmed",
    memberCount: _0x157fa8.reduce((_0x312b10, _0x4b1591) => _0x312b10 + Math.max(0, Number(_0x4b1591.memberCount) || 0), 0),
    ambiguousIdentityIds: [...new Set(_0x157fa8.flatMap(_0x4d2252 => toArray(_0x4d2252.ambiguousIdentityIds)))].filter(_0x74d7b7 => !_0x59f8ee.has(_0x74d7b7)),
    notes: "人工合并人物身份"
  };
  const _0xec1ddc = toArray(_0x160541?.mappings).filter(_0x17fd51 => !_0x59f8ee.has(normalizeText(_0x17fd51?.sourceCharacterId)));
  if (_0x428f6f) {
    _0xec1ddc.push({
      sourceCharacterId: _0xa844e6,
      targetCharacterId: _0x428f6f
    });
  }
  return {
    ..._0x160541,
    shots: toArray(_0x160541?.shots).map(_0x236615 => ({
      ..._0x236615,
      people: toArray(_0x236615?.people).map(_0x374918 => _0x59f8ee.has(normalizeText(_0x374918?.sourceCharacterId)) ? {
        ..._0x374918,
        sourceCharacterId: _0xa844e6,
        label: _0xf11458.name || _0x374918.label,
        targetCharacterId: _0x428f6f || _0x374918.targetCharacterId || "",
        identityReviewStatus: "confirmed",
        identityReviewRequired: false,
        identityMethod: "manual",
        ambiguousIdentityIds: toArray(_0x374918.ambiguousIdentityIds).filter(_0x55b3bc => !_0x59f8ee.has(_0x55b3bc))
      } : _0x374918)
    })),
    sourceCharacters: [..._0x4e74b3.filter(_0x322844 => !_0x59f8ee.has(_0x322844.id)), _0x527f21],
    mappings: _0xec1ddc
  };
}
export function splitPersonReplacementSourceCharacter(_0x3cd129, {
  sourceCharacterId: _0x2793a7,
  occurrences = [],
  newSourceCharacterId = ""
} = {}) {
  const _0x2dd82f = normalizeText(_0x2793a7);
  if (!_0x2dd82f) {
    throw new Error("拆分人物缺少原身份");
  }
  const _0x12e818 = new Set(toArray(occurrences).map(_0x423b0f => normalizeText(_0x423b0f?.shotId) + ":" + normalizeText(_0x423b0f?.personId)).filter(_0x47da37 => _0x47da37 !== ":"));
  if (!_0x12e818.size) {
    throw new Error("请先选择要拆分的人物框");
  }
  const _0x577a31 = collectSourceIdentityOccurrences(_0x3cd129, _0x2dd82f);
  const _0x333e85 = _0x577a31.filter(({
    shot: _0x5c11f1,
    person: _0x399a56
  }) => _0x12e818.has(_0x5c11f1.id + ":" + _0x399a56.id));
  if (!_0x333e85.length) {
    throw new Error("没有找到要拆分的人物框");
  }
  if (_0x333e85.length >= _0x577a31.length && _0x577a31.length > 1) {
    throw new Error("不能把该身份的全部人物框拆分出去");
  }
  if (_0x577a31.length === 1) {
    const _0x57ca7b = _0x333e85[0].person;
    const _0x4f091a = normalizeText(_0x57ca7b.label) || formatPersonReplacementPersonLabel(0);
    return {
      ..._0x3cd129,
      shots: toArray(_0x3cd129?.shots).map(_0x55c381 => ({
        ..._0x55c381,
        people: toArray(_0x55c381?.people).map(_0x1bd5b0 => normalizeText(_0x1bd5b0?.sourceCharacterId) === _0x2dd82f ? {
          ..._0x1bd5b0,
          label: _0x4f091a,
          identityReviewStatus: "needs_review",
          identityReviewRequired: true,
          identityMethod: "manual",
          ambiguousIdentityIds: []
        } : _0x1bd5b0)
      })),
      sourceCharacters: toArray(_0x3cd129?.sourceCharacters).map(_0x26be96 => _0x26be96.id === _0x2dd82f ? {
        ..._0x26be96,
        name: _0x4f091a,
        reviewRequired: true,
        identityReviewStatus: "needs_review",
        ambiguousIdentityIds: [],
        notes: "人工纠正人物身份"
      } : _0x26be96)
    };
  }
  const _0x56a481 = new Set(toArray(_0x3cd129?.sourceCharacters).map(_0x587d2e => _0x587d2e.id));
  let _0x44371a = normalizeText(newSourceCharacterId) || _0x2dd82f + "-split-" + (_0x56a481.size + 1);
  let _0x5e3f58 = 2;
  while (_0x56a481.has(_0x44371a)) {
    _0x44371a = _0x2dd82f + "-split-" + (_0x56a481.size + _0x5e3f58);
    _0x5e3f58 += 1;
  }
  const _0x120f9b = toArray(_0x3cd129?.sourceCharacters).find(_0x38a5c5 => _0x38a5c5.id === _0x2dd82f) || {
    id: _0x2dd82f,
    name: "原人物"
  };
  const _0x5e6b55 = [...new Set(_0x333e85.map(({
    shot: _0x5c777a
  }) => _0x5c777a.keyframeRef).filter(Boolean))];
  const _0x488021 = normalizeText(_0x333e85[0].person.label) || normalizeText(_0x120f9b.name) || formatPersonReplacementPersonLabel(0);
  return {
    ..._0x3cd129,
    shots: toArray(_0x3cd129?.shots).map(_0x1d489a => ({
      ..._0x1d489a,
      people: toArray(_0x1d489a?.people).map(_0x34a132 => normalizeText(_0x34a132?.sourceCharacterId) === _0x2dd82f && _0x12e818.has(_0x1d489a.id + ":" + _0x34a132.id) ? {
        ..._0x34a132,
        sourceCharacterId: _0x44371a,
        label: _0x488021,
        targetCharacterId: "",
        targetAppearanceId: "",
        identityReviewStatus: "needs_review",
        identityReviewRequired: true,
        identityMethod: "manual",
        ambiguousIdentityIds: []
      } : _0x34a132)
    })),
    sourceCharacters: [...toArray(_0x3cd129?.sourceCharacters).map(_0x11633d => _0x11633d.id === _0x2dd82f ? {
      ..._0x11633d,
      memberCount: Math.max(0, (Number(_0x11633d.memberCount) || _0x577a31.length) - _0x333e85.length)
    } : _0x11633d), {
      id: _0x44371a,
      name: _0x488021,
      imageRefs: _0x5e6b55,
      confidence: Math.min(..._0x333e85.map(({
        person: _0x551993
      }) => normalizeConfidence(_0x551993.identityConfidence))),
      reviewRequired: true,
      identityReviewStatus: "needs_review",
      memberCount: _0x333e85.length,
      exemplarShotId: _0x333e85[0].shot.id,
      exemplarPersonId: _0x333e85[0].person.id,
      ambiguousIdentityIds: [],
      notes: "人工拆分人物身份"
    }],
    mappings: toArray(_0x3cd129?.mappings).filter(_0x119027 => normalizeText(_0x119027?.sourceCharacterId) !== _0x44371a)
  };
}
export function confirmPersonReplacementSourceCharacter(_0x57416b, {
  sourceCharacterId: _0x249e58,
  targetSourceCharacterId = "",
  shotId = "",
  personId = "",
  label = "",
  orientation = ""
} = {}) {
  const _0x661b2a = normalizeText(_0x249e58);
  if (!_0x661b2a) {
    throw new Error("确认人物缺少身份");
  }
  const _0x27872f = normalizeText(targetSourceCharacterId) || _0x661b2a;
  const _0x473dc6 = normalizeText(shotId);
  const _0x576b9b = normalizeText(personId);
  const _0x3eba2e = normalizeText(label);
  const _0x5f37eb = normalizePersonReplacementOrientation(orientation);
  const _0x314c5b = _0x27872f !== _0x661b2a;
  if (_0x314c5b && (!_0x473dc6 || !_0x576b9b)) {
    throw new Error("切换人物身份时必须指定当前人物框");
  }
  const _0x207923 = toArray(_0x57416b?.sourceCharacters);
  const _0x1930da = _0x207923.some(_0x27fecd => normalizeText(_0x27fecd?.id) === _0x27872f) || toArray(_0x57416b?.shots).some(_0x371e87 => toArray(_0x371e87?.people).some(_0x104a38 => normalizeText(_0x104a38?.sourceCharacterId) === _0x27872f));
  if (_0x314c5b && !_0x1930da) {
    throw new Error("选择的人物身份不存在");
  }
  const _0x43ceca = toArray(_0x57416b?.shots).find(_0x15c2b8 => normalizeText(_0x15c2b8?.id) === _0x473dc6);
  const _0xa7180c = toArray(_0x43ceca?.people).find(_0x18e92c => normalizeText(_0x18e92c?.id) === _0x576b9b);
  if (_0x314c5b && (!_0xa7180c || normalizeText(_0xa7180c.sourceCharacterId) !== _0x661b2a)) {
    throw new Error("没有找到要切换身份的人物框");
  }
  const _0x2c57b3 = _0x314c5b && toArray(_0x43ceca?.people).some(_0x593a8a => normalizeText(_0x593a8a?.id) !== _0x576b9b && normalizeText(_0x593a8a?.sourceCharacterId) === _0x27872f);
  const _0x4e6da2 = toArray(_0x57416b?.mappings).find(_0x1786e5 => normalizeText(_0x1786e5?.sourceCharacterId) === _0x27872f);
  const _0x38313d = toArray(_0x57416b?.shots).flatMap(_0xe55ce8 => toArray(_0xe55ce8?.people)).find(_0x50f435 => normalizeText(_0x50f435?.sourceCharacterId) === _0x27872f && normalizeText(_0x50f435?.targetCharacterId));
  const _0x26b14a = normalizeText(_0x4e6da2?.targetCharacterId) || normalizeText(_0x38313d?.targetCharacterId);
  const _0x2aa57e = _0x26b14a ? normalizeText(toArray(_0x57416b?.shots).flatMap(_0x4d0e6c => toArray(_0x4d0e6c?.people)).find(_0x1863b1 => normalizeText(_0x1863b1?.sourceCharacterId) === _0x27872f && normalizeText(_0x1863b1?.targetCharacterId) === _0x26b14a && normalizeText(_0x1863b1?.targetAppearanceId))?.targetAppearanceId) : "";
  const _0x34a984 = toArray(_0x57416b?.shots).map(_0x2e36e7 => ({
    ..._0x2e36e7,
    people: toArray(_0x2e36e7?.people).map(_0x279055 => {
      const _0x181741 = normalizeText(_0x279055?.sourceCharacterId) === _0x661b2a;
      if (!_0x181741) {
        return _0x279055;
      }
      const _0x14b589 = (!_0x473dc6 || _0x2e36e7.id === _0x473dc6) && (!_0x576b9b || _0x279055.id === _0x576b9b);
      if (_0x314c5b && !_0x14b589) {
        return _0x279055;
      }
      const _0x4a7a1e = _0x314c5b && !_0x2c57b3;
      return {
        ..._0x279055,
        ...(_0x14b589 ? {
          sourceCharacterId: _0x4a7a1e ? _0x27872f : _0x279055.sourceCharacterId,
          label: _0x3eba2e || _0x279055.label,
          ...(_0x4a7a1e ? {
            targetCharacterId: _0x26b14a,
            targetAppearanceId: _0x2aa57e,
            identityMethod: "manual"
          } : {})
        } : {}),
        orientation: orientation && _0x14b589 ? _0x5f37eb : _0x279055.orientation,
        orientationConfidence: orientation && _0x14b589 ? 1 : _0x279055.orientationConfidence,
        orientationModelId: orientation && _0x14b589 ? "" : _0x279055.orientationModelId,
        identityReviewStatus: "confirmed",
        identityReviewRequired: false,
        ambiguousIdentityIds: []
      };
    })
  }));
  const _0x531ce9 = new Set(_0x34a984.flatMap(_0x43c671 => toArray(_0x43c671.people).map(_0x97fb86 => normalizeText(_0x97fb86?.sourceCharacterId))).filter(Boolean));
  return {
    ..._0x57416b,
    shots: _0x34a984,
    sourceCharacters: _0x207923.map(_0x550676 => normalizeText(_0x550676?.id) === _0x27872f ? {
      ..._0x550676,
      name: _0x3eba2e || _0x550676.name,
      reviewRequired: false,
      identityReviewStatus: "confirmed",
      ambiguousIdentityIds: []
    } : _0x550676).filter(_0xd83407 => !_0x314c5b || normalizeText(_0xd83407?.id) !== _0x661b2a || _0x531ce9.has(_0x661b2a)),
    mappings: toArray(_0x57416b?.mappings).filter(_0x40afff => !_0x314c5b || normalizeText(_0x40afff?.sourceCharacterId) !== _0x661b2a || _0x531ce9.has(_0x661b2a))
  };
}
export function normalizePersonReplacementAiAnalysis(_0x45f8ca, {
  existingShots = []
} = {}) {
  const _0x1276cf = unwrapAiAnalysis(_0x45f8ca);
  let _0x336b14;
  if (Array.isArray(_0x1276cf)) {
    _0x336b14 = _0x1276cf;
  } else {
    _0x336b14 = firstDefined(_0x1276cf?.shots, _0x1276cf?.segments, _0x1276cf?.clips, _0x1276cf?.keyframes);
    if (!Array.isArray(_0x336b14)) {
      _0x336b14 = _0x1276cf && typeof _0x1276cf === "object" ? [_0x1276cf] : [];
    }
  }
  const _0x59960f = toArray(existingShots).map(normalizePersonReplacementShot);
  return _0x336b14.map((_0x37128f, _0x21e4fb) => {
    const _0x19305d = normalizeText(firstDefined(_0x37128f?.id, _0x37128f?.shotId, _0x37128f?.shot_id, _0x37128f?.segmentId, _0x37128f?.clipId));
    const _0x55ab98 = _0x59960f.find(_0x3c9b27 => _0x3c9b27.id === _0x19305d) || _0x59960f[_0x21e4fb] || {};
    return normalizePersonReplacementShot({
      ..._0x55ab98,
      ..._0x37128f,
      id: _0x19305d || _0x55ab98.id,
      people: extractPeople(_0x37128f),
      analysisStatus: "succeeded"
    }, _0x21e4fb);
  });
}