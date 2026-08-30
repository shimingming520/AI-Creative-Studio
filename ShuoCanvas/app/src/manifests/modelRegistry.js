import { qwenImageEditExecutionManifest, qwenImageEditModelManifest } from "./image/runninghub/qwenImageEditManifest.js";
import { animeRealExecutionManifest, animeRealModelManifest } from "./image/runninghub/animeRealManifest.js";
import { animeRealV3ExecutionManifest, animeRealV3ModelManifest } from "./image/runninghub/animeRealV3Manifest.js";
import { personReplaceV21ExecutionManifest, personReplaceV21ModelManifest } from "./image/runninghub/personReplaceV21Manifest.js";
import { personReplaceV3ExecutionManifest, personReplaceV3ModelManifest } from "./image/runninghub/personReplaceV3Manifest.js";
import { personFullAngleV4ExecutionManifest, personFullAngleV4ModelManifest } from "./image/runninghub/personFullAngleV4Manifest.js";
import { controlCameraExecutionManifest, controlCameraModelManifest } from "./image/runninghub/controlCameraManifest.js";
import { krea2TextToImageExecutionManifest, krea2TextToImageModelManifest } from "./image/runninghub/krea2TextToImageManifest.js";
import { zImageTextToImageExecutionManifest, zImageTextToImageModelManifest } from "./image/runninghub/zImageTextToImageManifest.js";
import { rhVideoBasicExecutionManifest, rhVideoBasicModelManifest } from "./video/runninghub/runningHubVideoBasicManifest.js";
import { rhVideoLtx23ExecutionManifest, rhVideoLtx23ModelManifest } from "./video/runninghub/runningHubVideoLtx23Manifest.js";
import { rhVideoCommercialDigitalHumanExecutionManifest, rhVideoCommercialDigitalHumanModelManifest } from "./video/runninghub/runningHubVideoCommercialDigitalHumanManifest.js";
import { rhVideoLipSyncExecutionManifest, rhVideoLipSyncModelManifest } from "./video/runninghub/runningHubVideoLipSyncManifest.js";
import { rhVideoV54ExecutionManifest, rhVideoV54ModelManifest } from "./video/runninghub/runningHubVideoV54Manifest.js";
import { rhVideoAnimate2V1ExecutionManifest, rhVideoAnimate2V1ModelManifest } from "./video/runninghub/runningHubVideoAnimate2V1Manifest.js";
import { rhVideoHailuoH3OmniExecutionManifest, rhVideoHailuoH3OmniModelManifest } from "./video/runninghub/runningHubVideoHailuoH3OmniManifest.js";
import { rhVideoHailuoH3DualSamplingX2ExecutionManifest, rhVideoHailuoH3DualSamplingX2ModelManifest } from "./video/runninghub/runningHubVideoHailuoH3DualSamplingX2Manifest.js";
import { rhVideoHailuoH3EditV1ExecutionManifest, rhVideoHailuoH3EditV1ModelManifest } from "./video/runninghub/runningHubVideoHailuoH3EditV1Manifest.js";
import { rhVideoBerniniV1ExecutionManifest, rhVideoBerniniV1ModelManifest } from "./video/runninghub/runningHubVideoBerniniV1Manifest.js";
import { rhVideoWan22ExecutionManifest, rhVideoWan22ModelManifest } from "./video/runninghub/runningHubVideoWan22Manifest.js";
import { rhVideoScailV2ExecutionManifest, rhVideoScailV2ModelManifest, rhVideoScail2V1ExecutionManifest, rhVideoScail2V1ModelManifest } from "./video/runninghub/runningHubVideoScail2V1Manifest.js";
import { rhVideoWatermarkRemovalV2ExecutionManifest, rhVideoWatermarkRemovalV2ModelManifest } from "./video/runninghub/runningHubVideoWatermarkRemovalV2Manifest.js";
import { rhVideoMattingExecutionManifest, rhVideoMattingModelManifest } from "./video/runninghub/runningHubVideoMattingManifest.js";
import { rhVideoHdVipExecutionManifest, rhVideoHdVipModelManifest } from "./video/runninghub/runningHubVideoHdVipManifest.js";
import { rhVideoFrameInterpolationExecutionManifest, rhVideoFrameInterpolationModelManifest } from "./video/runninghub/runningHubVideoFrameInterpolationManifest.js";
import { rhAudioIndexTts2CloneExecutionManifest, rhAudioIndexTts2CloneModelManifest } from "./audio/runninghub/runningHubAudioIndexTts2CloneManifest.js";
import { rhAudioVoiceConvertExecutionManifest, rhAudioVoiceConvertModelManifest } from "./audio/runninghub/runningHubAudioVoiceConvertManifest.js";
import { rhAudioAdvancedVoiceCloneExecutionManifest, rhAudioAdvancedVoiceCloneModelManifest } from "./audio/runninghub/runningHubAudioAdvancedVoiceCloneManifest.js";
import { rhAudioSeparationExecutionManifest, rhAudioSeparationModelManifest } from "./audio/runninghub/runningHubAudioSeparationManifest.js";
import { vendorImageModelApiExecutionManifests, vendorImageModelApiModelManifests } from "./image/modelApi/index.js";
import { dreaminaImageExecutionManifests, dreaminaImageModelManifests } from "./image/dreamina/dreaminaImageManifest.js";
import { openAiCliImageExecutionManifests, openAiCliImageModelManifests } from "./image/localRuntime/openAiCliImageManifest.js";
import { vendorVideoModelApiExecutionManifests, vendorVideoModelApiModelManifests } from "./video/modelApi/vendorVideoModelApiManifests.js";
import { dreaminaVideoExecutionManifests, dreaminaVideoModelManifests } from "./video/dreamina/dreaminaVideoManifest.js";
import { vendorTextModelApiExecutionManifests, vendorTextModelApiModelManifests } from "./text/modelApi/vendorTextModelApiManifests.js";
import { cliTextExecutionManifests, cliTextModelManifests } from "./text/localRuntime/cliTextModelManifests.js";
import { volcengineAudioModelApiExecutionManifests, volcengineAudioModelApiModelManifests } from "./audio/modelApi/volcengineAudioModelApiManifests.js";
import { runningHubAudioModelApiExecutionManifests, runningHubAudioModelApiModelManifests } from "./audio/modelApi/runningHubAudioModelApiManifests.js";
const ALLOWED_ADAPTER_TYPES = new Set(["workflow", "modelApi", "localRuntime"]);
const ALLOWED_PROMPT_EMPTY_POLICIES = new Set(["block", "allowWithInput", "allow"]);
const SUPPORTED_UI_CONTROL_TYPES = new Set(["segmented", "select", "slider", "stepper", "toggle", "text", "textarea", "image input", "video input", "audio input"]);
const REQUIRED_MODEL_FIELDS = Object.freeze(["schemaVersion", "modelId", "provider", "kind", "adapterType", "executionId", "displayName", "uiSchema", "inputSlots", "outputType"]);
const REQUIRED_EXECUTION_FIELDS = Object.freeze(["schemaVersion", "id", "provider", "kind", "adapterType", "result"]);
const REQUIRED_WORKFLOW_EXECUTION_FIELDS = Object.freeze(["submitMode", "queryMode", "mapping"]);
const REQUIRED_MODEL_API_EXECUTION_FIELDS = Object.freeze(["endpoint", "method", "model", "bodyMapping", "responseMapping"]);
const REQUIRED_LOCAL_RUNTIME_EXECUTION_FIELDS = Object.freeze(["runtime"]);
const _models = new Map();
const _executions = new Map();
function assertPlainObject(_0x1ce46b, _0x5d00b9) {
  if (!_0x1ce46b || typeof _0x1ce46b !== "object" || Array.isArray(_0x1ce46b)) {
    throw new TypeError("[manifest] " + _0x5d00b9 + " must be an object");
  }
}
function isPlainObject(_0x308eb0) {
  if (!_0x308eb0 || typeof _0x308eb0 !== "object" || Array.isArray(_0x308eb0)) {
    return false;
  }
  const _0x35a0a1 = Object.getPrototypeOf(_0x308eb0);
  return _0x35a0a1 === Object.prototype || _0x35a0a1 === null;
}
function assertPlainData(_0x28d484, _0x1585dd, _0x18b73a = new WeakSet()) {
  if (_0x28d484 === null) {
    return;
  }
  const _0x367d85 = typeof _0x28d484;
  if (_0x367d85 === "string" || _0x367d85 === "number" || _0x367d85 === "boolean") {
    return;
  }
  if (_0x367d85 === "function" || _0x367d85 === "symbol" || _0x367d85 === "undefined" || _0x367d85 === "bigint") {
    throw new TypeError("[manifest] " + _0x1585dd + " must be plain data");
  }
  if (_0x18b73a.has(_0x28d484)) {
    throw new TypeError("[manifest] " + _0x1585dd + " cannot contain circular references");
  }
  _0x18b73a.add(_0x28d484);
  if (Array.isArray(_0x28d484)) {
    _0x28d484.forEach((_0x3e0e35, _0x12cd83) => {
      assertPlainData(_0x3e0e35, _0x1585dd + "[" + _0x12cd83 + "]", _0x18b73a);
    });
    return;
  }
  if (!isPlainObject(_0x28d484)) {
    throw new TypeError("[manifest] " + _0x1585dd + " must be plain data");
  }
  Object.entries(_0x28d484).forEach(([_0x583833, _0x131c3f]) => {
    assertPlainData(_0x131c3f, _0x1585dd + "." + _0x583833, _0x18b73a);
  });
}
function assertRequiredFields(_0x17adcd, _0x51e4f8, _0x43639a) {
  const _0x5eb908 = _0x51e4f8.filter(_0x5e784b => _0x17adcd[_0x5e784b] === undefined || _0x17adcd[_0x5e784b] === null || _0x17adcd[_0x5e784b] === "");
  if (_0x5eb908.length > 0) {
    throw new Error("[manifest] " + _0x43639a + " missing required fields: " + _0x5eb908.join(", "));
  }
}
function normalizeRegistryKey(_0x148462) {
  return String(_0x148462 || "").trim();
}
function getUiSchemaOptionValue(_0xa05961) {
  return String(_0xa05961?.value ?? _0xa05961);
}
function normalizeUiSchemaCompareValue(_0x491562) {
  return String(_0x491562 ?? "").trim().toLowerCase();
}
function isAdaptiveUiSchemaValue(_0x480277) {
  const _0x3e35ef = String(_0x480277 || "").trim();
  const _0x18b2c1 = _0x3e35ef.toLowerCase();
  return _0x18b2c1 === "auto" || _0x18b2c1 === "adaptive" || _0x18b2c1 === "default" || _0x3e35ef === "自适应" || _0x3e35ef === "默认";
}
function isAspectRatioUiSchemaField(_0x597385) {
  const _0x56f8aa = normalizeRegistryKey(_0x597385?.id).toLowerCase();
  const _0x32f879 = normalizeRegistryKey(_0x597385?.displayRole).toLowerCase();
  const _0xac5623 = normalizeRegistryKey(_0x597385?.variant).toLowerCase();
  return _0x56f8aa === "aspectratio" || _0x32f879 === "aspectratio" || _0xac5623 === "ratiopill";
}
function getUiSchemaDisableWhen(_0x398f49) {
  if (!_0x398f49 || typeof _0x398f49 !== "object" || Array.isArray(_0x398f49)) {
    return null;
  }
  const _0x2d8f22 = _0x398f49.disableWhen || _0x398f49.disabledWhen;
  if (_0x2d8f22 && (Array.isArray(_0x2d8f22) || typeof _0x2d8f22 === "object" && !Array.isArray(_0x2d8f22))) {
    return _0x2d8f22;
  } else {
    return null;
  }
}
function uiSchemaDisableWhenMatches(_0x5b5133, _0x47d612 = {}) {
  if (Array.isArray(_0x5b5133)) {
    return _0x5b5133.some(_0x3d3a26 => uiSchemaDisableWhenMatches(_0x3d3a26, _0x47d612));
  }
  if (!_0x5b5133 || typeof _0x5b5133 !== "object") {
    return false;
  }
  if (Array.isArray(_0x5b5133.any)) {
    return _0x5b5133.any.some(_0x16668d => uiSchemaDisableWhenMatches(_0x16668d, _0x47d612));
  }
  if (Array.isArray(_0x5b5133.all)) {
    return _0x5b5133.all.every(_0x4dd74e => uiSchemaDisableWhenMatches(_0x4dd74e, _0x47d612));
  }
  const _0x1cb5e3 = normalizeRegistryKey(_0x5b5133?.field || _0x5b5133?.param);
  if (!_0x1cb5e3) {
    return false;
  }
  const _0x2ab130 = _0x5b5133.values !== undefined ? _0x5b5133.values : _0x5b5133.value;
  const _0x5df806 = Array.isArray(_0x2ab130) ? _0x2ab130 : [_0x2ab130];
  const _0x36158f = _0x5df806.map(normalizeUiSchemaCompareValue);
  const _0x5a02cf = normalizeUiSchemaCompareValue(_0x47d612?.[_0x1cb5e3]);
  const _0xc1c3d9 = _0x36158f.includes(_0x5a02cf);
  if (_0x5b5133.not) {
    return !_0xc1c3d9;
  } else {
    return _0xc1c3d9;
  }
}
function isUiSchemaOptionDisabled(_0x3c52e9, _0x21df99, _0x57a7a0 = {}) {
  if (_0x3c52e9?.disabled === true || _0x3c52e9?.readOnly === true) {
    return true;
  }
  if (!_0x21df99 || typeof _0x21df99 !== "object" || Array.isArray(_0x21df99)) {
    return false;
  }
  if (_0x21df99.disabled === true) {
    return true;
  }
  const _0x5ba7bf = getUiSchemaDisableWhen(_0x21df99);
  if (_0x5ba7bf) {
    return uiSchemaDisableWhenMatches(_0x5ba7bf, _0x57a7a0);
  } else {
    return false;
  }
}
function getUiSchemaFieldOptions(_0x5beb42) {
  const _0x2b25a9 = Array.isArray(_0x5beb42?.options) ? _0x5beb42.options : [];
  const _0x3bace4 = Array.isArray(_0x5beb42?.developerOptions) ? _0x5beb42.developerOptions : [];
  return [..._0x2b25a9, ..._0x3bace4];
}
function findUiSchemaOptionByValue(_0x49bf4b, _0x5a8640) {
  const _0x36c8e7 = getUiSchemaFieldOptions(_0x49bf4b);
  const _0x3e7d2b = String(_0x5a8640 ?? "").trim();
  const _0x4f8a32 = _0x3e7d2b.toLowerCase();
  return _0x36c8e7.find(_0x2d2ecf => getUiSchemaOptionValue(_0x2d2ecf) === _0x3e7d2b) || _0x36c8e7.find(_0x104300 => getUiSchemaOptionValue(_0x104300).trim().toLowerCase() === _0x4f8a32) || null;
}
function findAdaptiveUiSchemaOption(_0xd278d6) {
  const _0x1f75e7 = getUiSchemaFieldOptions(_0xd278d6);
  return _0x1f75e7.find(_0x54b7e9 => {
    const _0x1a2cc6 = getUiSchemaOptionValue(_0x54b7e9);
    const _0x2e4e1d = String(_0x54b7e9?.label ?? _0x1a2cc6).trim();
    return isAdaptiveUiSchemaValue(_0x1a2cc6) || isAdaptiveUiSchemaValue(_0x2e4e1d);
  }) || null;
}
function findEnabledUiSchemaOption(_0x242ad7, _0x535281, _0x4db882 = {}) {
  const _0x221602 = findUiSchemaOptionByValue(_0x242ad7, _0x535281);
  if (_0x221602 && !isUiSchemaOptionDisabled(_0x242ad7, _0x221602, _0x4db882)) {
    return _0x221602;
  } else {
    return null;
  }
}
function findFirstEnabledUiSchemaOption(_0x42e709, _0x4cc37a = {}) {
  const _0x4e1cff = getUiSchemaFieldOptions(_0x42e709);
  return _0x4e1cff.find(_0x2874b8 => _0x2874b8?.hidden !== true && !isUiSchemaOptionDisabled(_0x42e709, _0x2874b8, _0x4cc37a)) || null;
}
function getUiSchemaDefaultValueAliases(_0x419b51) {
  return (Array.isArray(_0x419b51?.defaultValueAliases) ? _0x419b51.defaultValueAliases : []).map(_0x12f389 => String(_0x12f389 ?? "").trim().toLowerCase()).filter(Boolean);
}
export function normalizeUiSchemaFieldValue(_0x596e9f, _0x2ea817, {
  params = {}
} = {}) {
  const _0x2e929a = String(_0x596e9f?.type || "").trim().toLowerCase();
  if (_0x2ea817 === undefined || _0x2ea817 === null) {
    return _0x596e9f?.defaultValue ?? "";
  }
  if (String(_0x2ea817).trim() === "") {
    if (_0x596e9f?.allowEmpty === true && (_0x2e929a === "text" || _0x2e929a === "textarea")) {
      return "";
    } else {
      return _0x596e9f?.defaultValue ?? "";
    }
  }
  const _0x412075 = String(_0x2ea817).trim().toLowerCase();
  if (getUiSchemaDefaultValueAliases(_0x596e9f).includes(_0x412075)) {
    return _0x596e9f?.defaultValue ?? "";
  }
  if (_0x2e929a === "toggle") {
    if (_0x2ea817 === true || _0x2ea817 === false) {
      return _0x2ea817;
    }
    if (["true", "1", "yes", "on"].includes(_0x412075)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(_0x412075)) {
      return false;
    }
    return _0x596e9f?.defaultValue === true;
  }
  if (_0x2e929a === "slider" && Array.isArray(_0x596e9f?.options) && _0x596e9f.options.length) {
    const _0x26916f = findEnabledUiSchemaOption(_0x596e9f, _0x2ea817, params);
    if (_0x26916f) {
      return _0x26916f.value ?? _0x26916f;
    }
    const _0x1b2bde = findEnabledUiSchemaOption(_0x596e9f, _0x596e9f?.defaultValue, params);
    if (_0x1b2bde) {
      return _0x1b2bde.value ?? _0x1b2bde;
    }
    const _0x38fc94 = findFirstEnabledUiSchemaOption(_0x596e9f, params);
    if (_0x38fc94) {
      return _0x38fc94.value ?? _0x38fc94;
    }
    return _0x596e9f?.defaultValue ?? "";
  }
  if (_0x2e929a !== "segmented" && _0x2e929a !== "select") {
    return _0x2ea817;
  }
  const _0x15e4ef = findEnabledUiSchemaOption(_0x596e9f, _0x2ea817, params);
  if (_0x15e4ef) {
    return _0x15e4ef.value ?? _0x15e4ef;
  }
  if (isAdaptiveUiSchemaValue(_0x2ea817)) {
    const _0x1cead5 = findAdaptiveUiSchemaOption(_0x596e9f);
    if (_0x1cead5 && !isUiSchemaOptionDisabled(_0x596e9f, _0x1cead5, params)) {
      return _0x1cead5.value ?? _0x1cead5;
    }
    if (isAspectRatioUiSchemaField(_0x596e9f)) {
      return "自适应";
    }
  }
  const _0x187446 = findEnabledUiSchemaOption(_0x596e9f, _0x596e9f?.defaultValue, params);
  if (_0x187446) {
    return _0x187446.value ?? _0x187446;
  }
  const _0x272640 = findFirstEnabledUiSchemaOption(_0x596e9f, params);
  if (_0x272640) {
    return _0x272640.value ?? _0x272640;
  }
  return _0x596e9f?.defaultValue ?? "";
}
export function sanitizeModelUiSchemaParams(_0x3338b9, _0x4627e4 = {}, {
  includeDefaults = true
} = {}) {
  const _0x63722f = getModelManifest(_0x3338b9);
  const _0x41c8fa = Array.isArray(_0x63722f?.uiSchema?.fields) ? _0x63722f.uiSchema.fields : [];
  const _0x5cfa04 = _0x4627e4 && typeof _0x4627e4 === "object" && !Array.isArray(_0x4627e4) ? _0x4627e4 : {};
  const _0x3da823 = {};
  return _0x41c8fa.reduce((_0x6e450c, _0x180181) => {
    const _0x6ec19e = normalizeRegistryKey(_0x180181?.id);
    if (!_0x6ec19e) {
      return _0x6e450c;
    }
    const _0x46738a = {
      ..._0x5cfa04,
      ..._0x3da823,
      ..._0x6e450c
    };
    if (Object.prototype.hasOwnProperty.call(_0x5cfa04, _0x6ec19e)) {
      _0x6e450c[_0x6ec19e] = normalizeUiSchemaFieldValue(_0x180181, _0x5cfa04[_0x6ec19e], {
        params: _0x46738a
      });
      _0x3da823[_0x6ec19e] = _0x6e450c[_0x6ec19e];
    } else if (includeDefaults) {
      _0x6e450c[_0x6ec19e] = normalizeUiSchemaFieldValue(_0x180181, _0x180181?.defaultValue, {
        params: _0x46738a
      });
      _0x3da823[_0x6ec19e] = _0x6e450c[_0x6ec19e];
    } else {
      _0x3da823[_0x6ec19e] = normalizeUiSchemaFieldValue(_0x180181, _0x180181?.defaultValue, {
        params: _0x46738a
      });
    }
    return _0x6e450c;
  }, {});
}
function getManifestRegistryKeys(_0x34ff4d, _0x1c7858, _0x4764d5) {
  const _0x2738af = normalizeRegistryKey(_0x34ff4d[_0x1c7858]);
  if (!_0x2738af) {
    throw new Error("[manifest] " + _0x4764d5 + " has empty " + _0x1c7858);
  }
  const _0x2c25d1 = [_0x2738af];
  if (_0x34ff4d.aliases !== undefined) {
    if (!Array.isArray(_0x34ff4d.aliases)) {
      throw new Error("[manifest] " + _0x4764d5 + " aliases must be an array");
    }
    _0x34ff4d.aliases.forEach(_0x59a77d => {
      const _0x16ece7 = normalizeRegistryKey(_0x59a77d);
      if (_0x16ece7) {
        _0x2c25d1.push(_0x16ece7);
      }
    });
  }
  return _0x2c25d1;
}
function assertRegistryKeysAvailable(_0x3c2bda, _0x1c712e, _0x1f5578, _0x5d034d) {
  const _0x4a468f = new Set();
  _0x3c2bda.forEach((_0x14825b, _0x61a666) => {
    const _0x5c4f5d = getManifestRegistryKeys(_0x14825b, _0x1f5578, _0x5d034d + "[" + _0x61a666 + "]");
    _0x5c4f5d.forEach(_0x1c32a0 => {
      if (_0x1c712e.has(_0x1c32a0)) {
        throw new Error("[manifest] " + _0x5d034d + " duplicate key: " + _0x1c32a0);
      }
      if (_0x4a468f.has(_0x1c32a0)) {
        throw new Error("[manifest] " + _0x5d034d + " duplicate key in bundle: " + _0x1c32a0);
      }
      _0x4a468f.add(_0x1c32a0);
    });
  });
  return _0x4a468f;
}
function buildManifestKeyMap(_0x50f730, _0x2bb904, _0x33171d) {
  const _0x241894 = new Map();
  _0x50f730.forEach((_0x2321b0, _0x49ce62) => {
    getManifestRegistryKeys(_0x2321b0, _0x2bb904, _0x33171d + "[" + _0x49ce62 + "]").forEach(_0xaba691 => {
      _0x241894.set(_0xaba691, _0x2321b0);
    });
  });
  return _0x241894;
}
function assertModelExecutionContract(_0x3c76a2, _0x4a5385) {
  ["adapterType", "kind", "provider"].forEach(_0x636f77 => {
    const _0x4ec349 = normalizeRegistryKey(_0x3c76a2[_0x636f77]);
    const _0x300b39 = normalizeRegistryKey(_0x4a5385[_0x636f77]);
    if (_0x4ec349 !== _0x300b39) {
      throw new Error("[manifest] model manifest " + _0x3c76a2.modelId + " " + _0x636f77 + " (" + _0x3c76a2[_0x636f77] + ") does not match execution manifest " + _0x4a5385.id + " " + _0x636f77 + " (" + _0x4a5385[_0x636f77] + ")");
    }
  });
}
function assertBundleModelExecutionLinks(_0x478186, _0x137b3b) {
  _0x478186.forEach(_0x59219c => {
    const _0x426933 = normalizeRegistryKey(_0x59219c.executionId);
    const _0x18b0e1 = _executions.get(_0x426933) || _0x137b3b.get(_0x426933);
    if (!_0x18b0e1) {
      throw new Error("[manifest] model manifest " + _0x59219c.modelId + " references unknown executionId: " + _0x59219c.executionId);
    }
    assertModelExecutionContract(_0x59219c, _0x18b0e1);
  });
}
function assertAdapterType(_0x178266, _0x1527dc) {
  if (!ALLOWED_ADAPTER_TYPES.has(String(_0x178266 || ""))) {
    throw new Error("[manifest] " + _0x1527dc + " has unsupported adapterType: " + _0x178266);
  }
}
function assertExecutionTarget(_0xb4762a) {
  if (_0xb4762a.adapterType !== "workflow") {
    return;
  }
  if (!_0xb4762a.workflowId && !_0xb4762a.appId) {
    throw new Error("[manifest] workflow execution missing workflowId/appId");
  }
}
function assertUiSchema(_0x3ef83c) {
  const _0x242ac9 = _0x3ef83c.uiSchema;
  assertPlainObject(_0x242ac9, "model manifest uiSchema");
  if (!Array.isArray(_0x242ac9.fields)) {
    throw new Error("[manifest] model manifest uiSchema.fields must be an array");
  }
  _0x242ac9.fields.forEach((_0x10eff0, _0x29a86e) => {
    assertPlainObject(_0x10eff0, "model manifest uiSchema.fields[" + _0x29a86e + "]");
    assertRequiredFields(_0x10eff0, ["id", "type"], "model manifest uiSchema.fields[" + _0x29a86e + "]");
    const _0xee6c8d = String(_0x10eff0.type || "").trim().toLowerCase();
    if (_0xee6c8d === "text" || _0xee6c8d === "textarea") {
      if (_0x10eff0.defaultValue === undefined || _0x10eff0.defaultValue === null) {
        throw new Error("[manifest] model manifest uiSchema.fields[" + _0x29a86e + "] missing required fields: defaultValue");
      }
    } else {
      assertRequiredFields(_0x10eff0, ["defaultValue"], "model manifest uiSchema.fields[" + _0x29a86e + "]");
    }
    if (!SUPPORTED_UI_CONTROL_TYPES.has(_0xee6c8d)) {
      throw new Error("[manifest] unsupported uiSchema control type: " + _0x10eff0.type);
    }
    if ((_0xee6c8d === "segmented" || _0xee6c8d === "select") && (!Array.isArray(_0x10eff0.options) || _0x10eff0.options.length === 0)) {
      throw new Error("[manifest] uiSchema field " + _0x10eff0.id + " requires non-empty options");
    }
  });
}
function assertPromptConfig(_0x105050) {
  if (_0x105050.prompt === undefined || _0x105050.prompt === null) {
    return;
  }
  assertPlainObject(_0x105050.prompt, "model manifest prompt");
  if (_0x105050.prompt.emptyPolicy !== undefined && _0x105050.prompt.emptyPolicy !== null && !ALLOWED_PROMPT_EMPTY_POLICIES.has(String(_0x105050.prompt.emptyPolicy || ""))) {
    throw new Error("[manifest] model manifest " + _0x105050.modelId + " prompt.emptyPolicy must be one of: " + Array.from(ALLOWED_PROMPT_EMPTY_POLICIES).join(", "));
  }
  if (_0x105050.prompt.minLength !== undefined && _0x105050.prompt.minLength !== null) {
    const _0x3bad9d = Number(_0x105050.prompt.minLength);
    if (!Number.isInteger(_0x3bad9d) || _0x3bad9d < 0) {
      throw new Error("[manifest] model manifest " + _0x105050.modelId + " prompt.minLength must be a non-negative integer");
    }
  }
}
function assertInputPolicyCondition(_0x762ada, _0x8ff421) {
  if (Array.isArray(_0x762ada)) {
    if (_0x762ada.length === 0) {
      throw new Error("[manifest] " + _0x8ff421 + " must not be empty");
    }
    _0x762ada.forEach((_0xb77b04, _0x4ac719) => assertInputPolicyCondition(_0xb77b04, _0x8ff421 + "[" + _0x4ac719 + "]"));
    return;
  }
  assertPlainObject(_0x762ada, _0x8ff421);
  if (Array.isArray(_0x762ada.any) || Array.isArray(_0x762ada.all)) {
    const _0x364858 = Array.isArray(_0x762ada.any) ? "any" : "all";
    assertInputPolicyCondition(_0x762ada[_0x364858], _0x8ff421 + "." + _0x364858);
    return;
  }
  if (!normalizeRegistryKey(_0x762ada.field ?? _0x762ada.param)) {
    throw new Error("[manifest] " + _0x8ff421 + " must declare field or param");
  }
  if (_0x762ada.value === undefined && _0x762ada.values === undefined) {
    throw new Error("[manifest] " + _0x8ff421 + " must declare value or values");
  }
}
function assertInputPolicyExtensions(_0x42aa64) {
  const _0x48ea35 = _0x42aa64.inputSlots;
  if (_0x48ea35.preserveHiddenInputsByKind !== undefined && typeof _0x48ea35.preserveHiddenInputsByKind !== "boolean") {
    throw new Error("[manifest] model manifest inputSlots.preserveHiddenInputsByKind must be a boolean");
  }
  const _0x35b66b = _0x48ea35.preserveHiddenInputsByKindFields;
  if (_0x35b66b !== undefined && (!Array.isArray(_0x35b66b) || _0x35b66b.length === 0 || _0x35b66b.some(_0xce2619 => !String(_0xce2619 || "").trim()))) {
    throw new Error("[manifest] model manifest inputSlots.preserveHiddenInputsByKindFields must be a non-empty string array");
  }
  if (Array.isArray(_0x35b66b) && _0x48ea35.preserveHiddenInputsByKind !== true) {
    throw new Error("[manifest] model manifest inputSlots.preserveHiddenInputsByKindFields requires preserveHiddenInputsByKind");
  }
  const _0x52ef4e = _0x48ea35.policyVariants || [];
  if (_0x52ef4e && !Array.isArray(_0x52ef4e)) {
    throw new Error("[manifest] model manifest inputSlots.policyVariants must be an array");
  }
  (_0x52ef4e || []).forEach((_0x145911, _0x5a02e6) => {
    const _0x34355c = "model manifest inputSlots.policyVariants[" + _0x5a02e6 + "]";
    assertPlainObject(_0x145911, _0x34355c);
    assertInputPolicyCondition(_0x145911.when, _0x34355c + ".when");
    if (_0x145911.allowedKinds !== undefined && !Array.isArray(_0x145911.allowedKinds)) {
      throw new Error("[manifest] " + _0x34355c + ".allowedKinds must be an array");
    }
    if (_0x145911.maxByKind !== undefined && !isPlainObject(_0x145911.maxByKind)) {
      throw new Error("[manifest] " + _0x34355c + ".maxByKind must be an object");
    }
    Object.entries(_0x145911.maxByKind || {}).forEach(([_0x2f9b60, _0x1cb3be]) => {
      const _0x246660 = Number(_0x1cb3be);
      if (!Number.isFinite(_0x246660) || _0x246660 < 0) {
        throw new Error("[manifest] " + _0x34355c + ".maxByKind." + _0x2f9b60 + " must be a non-negative number");
      }
    });
  });
  const _0x14d4e9 = _0x48ea35.mediaConstraintsByKind || {};
  if (_0x14d4e9 && !isPlainObject(_0x14d4e9)) {
    throw new Error("[manifest] model manifest inputSlots.mediaConstraintsByKind must be an object");
  }
  Object.entries(_0x14d4e9 || {}).forEach(([_0x33117d, _0x877f38]) => {
    const _0x4e66db = "model manifest inputSlots.mediaConstraintsByKind." + _0x33117d;
    assertPlainObject(_0x877f38, _0x4e66db);
    ["minDurationSeconds", "maxDurationSeconds", "maxBytes"].forEach(_0x19f7a8 => {
      if (_0x877f38[_0x19f7a8] === undefined) {
        return;
      }
      const _0x46f346 = Number(_0x877f38[_0x19f7a8]);
      if (!Number.isFinite(_0x46f346) || _0x46f346 <= 0) {
        throw new Error("[manifest] " + _0x4e66db + "." + _0x19f7a8 + " must be positive");
      }
    });
    if (_0x877f38.minDurationSeconds !== undefined && _0x877f38.maxDurationSeconds !== undefined && Number(_0x877f38.minDurationSeconds) > Number(_0x877f38.maxDurationSeconds)) {
      throw new Error("[manifest] " + _0x4e66db + ".minDurationSeconds cannot exceed maxDurationSeconds");
    }
    if (_0x877f38.allowedExtensions !== undefined && (!Array.isArray(_0x877f38.allowedExtensions) || _0x877f38.allowedExtensions.some(_0x7c5207 => !String(_0x7c5207 || "").trim()))) {
      throw new Error("[manifest] " + _0x4e66db + ".allowedExtensions must be an array of non-empty strings");
    }
  });
}
function assertInputSlots(_0x5b0931) {
  const _0x372acf = _0x5b0931.inputSlots;
  assertPlainObject(_0x372acf, "model manifest inputSlots");
  assertInputPolicyExtensions(_0x5b0931);
  const _0xf74bb0 = _0x372acf.fixedSlots === undefined || _0x372acf.fixedSlots === null ? [] : _0x372acf.fixedSlots;
  if (!Array.isArray(_0xf74bb0)) {
    throw new Error("[manifest] model manifest inputSlots.fixedSlots must be an array");
  }
  const _0x1a0c70 = new Map();
  const _0xc3244b = new Map();
  const _0x2322b3 = new Set();
  _0xf74bb0.forEach((_0x3a94a2, _0x45c52c) => {
    assertPlainObject(_0x3a94a2, "model manifest inputSlots.fixedSlots[" + _0x45c52c + "]");
    assertRequiredFields(_0x3a94a2, ["id", "kind"], "model manifest inputSlots.fixedSlots[" + _0x45c52c + "]");
    const _0x398c6c = normalizeRegistryKey(_0x3a94a2.kind);
    const _0x3d5aff = String(_0x3a94a2.id || "").trim();
    if (_0x3d5aff) {
      _0x2322b3.add(_0x3d5aff);
    }
    _0x1a0c70.set(_0x398c6c, (_0x1a0c70.get(_0x398c6c) || 0) + 1);
    if (_0x3a94a2.required !== undefined && _0x3a94a2.required !== null && typeof _0x3a94a2.required !== "boolean") {
      throw new Error("[manifest] fixed slot " + _0x3a94a2.id + " required must be a boolean");
    }
    if (_0x3a94a2.required === true) {
      _0xc3244b.set(_0x398c6c, (_0xc3244b.get(_0x398c6c) || 0) + 1);
    }
  });
  const _0x397834 = _0x372acf.minByKind || {};
  if (_0x397834 && !isPlainObject(_0x397834)) {
    throw new Error("[manifest] model manifest inputSlots.minByKind must be an object");
  }
  Object.entries(_0x397834 || {}).forEach(([_0x766d34, _0x4cc6f5]) => {
    const _0xa690e5 = Number(_0x4cc6f5);
    if (!Number.isFinite(_0xa690e5) || _0xa690e5 < 0) {
      throw new Error("[manifest] model manifest inputSlots.minByKind." + _0x766d34 + " must be a non-negative number");
    }
    const _0x298314 = normalizeRegistryKey(_0x766d34);
    const _0x10ce0e = _0x1a0c70.get(_0x298314) || 0;
    if (_0x10ce0e === 0 || _0xa690e5 <= 0) {
      return;
    }
    const _0x120cdf = _0xc3244b.get(_0x298314) || 0;
    if (_0x120cdf < _0xa690e5) {
      throw new Error("[manifest] model manifest " + _0x5b0931.modelId + " inputSlots." + _0x298314 + " requires " + _0xa690e5 + " input(s), but only " + _0x120cdf + " fixed slot(s) are marked required");
    }
  });
  const _0x125052 = _0x372acf.maxTotalDurationSecondsByKind || {};
  if (_0x125052 && !isPlainObject(_0x125052)) {
    throw new Error("[manifest] model manifest inputSlots.maxTotalDurationSecondsByKind must be an object");
  }
  Object.entries(_0x125052).forEach(([_0x31f5e5, _0x18c2e6]) => {
    const _0xf77f82 = normalizeRegistryKey(_0x31f5e5);
    const _0x6656dc = Number(_0x18c2e6);
    if (_0xf77f82 !== "video" && _0xf77f82 !== "audio" || !Number.isFinite(_0x6656dc) || _0x6656dc <= 0) {
      throw new Error("[manifest] model manifest inputSlots.maxTotalDurationSecondsByKind." + _0x31f5e5 + " must be a positive number for video or audio");
    }
    if (!_0x372acf.allowedKinds?.includes(_0xf77f82)) {
      throw new Error("[manifest] model manifest inputSlots.maxTotalDurationSecondsByKind." + _0x31f5e5 + " requires " + _0xf77f82 + " in allowedKinds");
    }
  });
  const _0x4f1b7a = _0x372acf.exclusiveGroups || [];
  if (_0x4f1b7a && !Array.isArray(_0x4f1b7a)) {
    throw new Error("[manifest] model manifest inputSlots.exclusiveGroups must be an array");
  }
  (_0x4f1b7a || []).forEach((_0x401c76, _0x5f2eb8) => {
    assertPlainObject(_0x401c76, "model manifest inputSlots.exclusiveGroups[" + _0x5f2eb8 + "]");
    if (!Array.isArray(_0x401c76.slots) || _0x401c76.slots.length < 2) {
      throw new Error("[manifest] model manifest inputSlots.exclusiveGroups[" + _0x5f2eb8 + "].slots must contain at least two slots");
    }
    _0x401c76.slots.forEach(_0x2870c0 => {
      const _0x57eaae = String(_0x2870c0 || "").trim();
      if (!_0x2322b3.has(_0x57eaae)) {
        throw new Error("[manifest] model manifest inputSlots.exclusiveGroups[" + _0x5f2eb8 + "] references unknown fixed slot: " + _0x57eaae);
      }
    });
    ["min", "max"].forEach(_0x54c09e => {
      if (_0x401c76[_0x54c09e] === undefined || _0x401c76[_0x54c09e] === null) {
        return;
      }
      const _0xab3924 = Number(_0x401c76[_0x54c09e]);
      if (!Number.isFinite(_0xab3924) || _0xab3924 < 0) {
        throw new Error("[manifest] model manifest inputSlots.exclusiveGroups[" + _0x5f2eb8 + "]." + _0x54c09e + " must be a non-negative number");
      }
    });
  });
}
export function validateModelManifest(_0x94fbb3) {
  assertPlainObject(_0x94fbb3, "model manifest");
  assertRequiredFields(_0x94fbb3, REQUIRED_MODEL_FIELDS, "model manifest");
  assertAdapterType(_0x94fbb3.adapterType, "model manifest");
  assertUiSchema(_0x94fbb3);
  assertPromptConfig(_0x94fbb3);
  assertInputSlots(_0x94fbb3);
  return true;
}
export function validateExecutionManifest(_0x58b526) {
  assertPlainObject(_0x58b526, "execution manifest");
  assertRequiredFields(_0x58b526, REQUIRED_EXECUTION_FIELDS, "execution manifest");
  assertAdapterType(_0x58b526.adapterType, "execution manifest");
  if (_0x58b526.adapterType === "workflow") {
    assertRequiredFields(_0x58b526, REQUIRED_WORKFLOW_EXECUTION_FIELDS, "workflow execution manifest");
  }
  if (_0x58b526.adapterType === "modelApi") {
    assertRequiredFields(_0x58b526, REQUIRED_MODEL_API_EXECUTION_FIELDS, "modelApi execution manifest");
  }
  if (_0x58b526.adapterType === "localRuntime") {
    assertRequiredFields(_0x58b526, REQUIRED_LOCAL_RUNTIME_EXECUTION_FIELDS, "localRuntime execution manifest");
  }
  assertExecutionTarget(_0x58b526);
  return true;
}
function addModelManifestToRegistry(_0x5c3531) {
  // 模型清单中的 VIP 标记仅用于订阅门控；统一清除后，所有模型按普通模型处理。
  const _0x1f1a27 = Object.freeze({
    ..._0x5c3531,
    vip: false,
    subscriptionAliases: Object.freeze([])
  });
  const _0x1a18ed = String(_0x1f1a27.modelId || "").trim();
  _models.set(_0x1a18ed, _0x1f1a27);
  if (Array.isArray(_0x1f1a27.aliases)) {
    _0x1f1a27.aliases.forEach(_0x226e56 => {
      const _0xf65b49 = String(_0x226e56 || "").trim();
      if (_0xf65b49) {
        _models.set(_0xf65b49, _0x1f1a27);
      }
    });
  }
}
function addExecutionManifestToRegistry(_0x5de188) {
  _executions.set(String(_0x5de188.id), _0x5de188);
  if (Array.isArray(_0x5de188.aliases)) {
    _0x5de188.aliases.forEach(_0x433802 => {
      const _0x24d2d9 = String(_0x433802 || "").trim();
      if (_0x24d2d9) {
        _executions.set(_0x24d2d9, _0x5de188);
      }
    });
  }
}
function registerModelManifest(_0x543a78) {
  validateModelManifest(_0x543a78);
  const _0x3c130d = getExecutionManifest(_0x543a78.executionId);
  if (_0x3c130d) {
    assertModelExecutionContract(_0x543a78, _0x3c130d);
  }
  addModelManifestToRegistry(_0x543a78);
}
function registerExecutionManifest(_0x270c8a) {
  validateExecutionManifest(_0x270c8a);
  addExecutionManifestToRegistry(_0x270c8a);
}
function assertManifestBundle(_0x2af155) {
  assertPlainObject(_0x2af155, "manifest bundle");
  assertPlainData(_0x2af155, "manifest bundle");
  assertRequiredFields(_0x2af155, ["sourceId"], "manifest bundle");
  if (!normalizeRegistryKey(_0x2af155.sourceId)) {
    throw new Error("[manifest] manifest bundle sourceId must be non-empty");
  }
  if (!Array.isArray(_0x2af155.models)) {
    throw new TypeError("[manifest] manifest bundle.models must be an array");
  }
  if (!Array.isArray(_0x2af155.executions)) {
    throw new TypeError("[manifest] manifest bundle.executions must be an array");
  }
  const _0xf5e3f6 = _0x2af155.executions;
  const _0x201955 = _0x2af155.models;
  _0xf5e3f6.forEach(validateExecutionManifest);
  _0x201955.forEach(validateModelManifest);
  assertRegistryKeysAvailable(_0xf5e3f6, _executions, "id", "execution manifest");
  const _0xbbda2f = buildManifestKeyMap(_0xf5e3f6, "id", "execution manifest");
  assertRegistryKeysAvailable(_0x201955, _models, "modelId", "model manifest");
  assertBundleModelExecutionLinks(_0x201955, _0xbbda2f);
  return {
    executions: _0xf5e3f6,
    models: _0x201955
  };
}
export function validateManifestBundle(_0x144900) {
  assertManifestBundle(_0x144900);
  return true;
}
export function registerManifestBundle(_0x4ff306) {
  const {
    executions: _0x3f31f9,
    models: _0x57a940
  } = assertManifestBundle(_0x4ff306);
  _0x3f31f9.forEach(addExecutionManifestToRegistry);
  _0x57a940.forEach(addModelManifestToRegistry);
  return true;
}
function removeManifestFromRegistry(_0x14aa43, _0xcfade5, _0x3dd26b, _0x1b28c8) {
  const _0x277561 = String(_0x14aa43?.[_0x3dd26b] || "").trim();
  if (!_0x277561) {
    return;
  }
  getManifestRegistryKeys(_0x14aa43, _0x3dd26b, _0x1b28c8).forEach(_0x220252 => {
    const _0x4d0a6c = _0xcfade5.get(_0x220252);
    if (String(_0x4d0a6c?.[_0x3dd26b] || "").trim() === _0x277561) {
      _0xcfade5.delete(_0x220252);
    }
  });
}
export function unregisterManifestBundle(_0x46ff9e) {
  const _0xaf17f8 = Array.isArray(_0x46ff9e?.executions) ? _0x46ff9e.executions : [];
  const _0x3f7a28 = Array.isArray(_0x46ff9e?.models) ? _0x46ff9e.models : [];
  _0xaf17f8.forEach(_0x11d858 => removeManifestFromRegistry(_0x11d858, _executions, "id", "execution manifest"));
  _0x3f7a28.forEach(_0x191631 => removeManifestFromRegistry(_0x191631, _models, "modelId", "model manifest"));
  return true;
}
registerExecutionManifest(qwenImageEditExecutionManifest);
registerModelManifest(qwenImageEditModelManifest);
registerExecutionManifest(animeRealExecutionManifest);
registerModelManifest(animeRealModelManifest);
registerExecutionManifest(animeRealV3ExecutionManifest);
registerModelManifest(animeRealV3ModelManifest);
registerExecutionManifest(personReplaceV21ExecutionManifest);
registerModelManifest(personReplaceV21ModelManifest);
registerExecutionManifest(personReplaceV3ExecutionManifest);
registerModelManifest(personReplaceV3ModelManifest);
registerExecutionManifest(personFullAngleV4ExecutionManifest);
registerModelManifest(personFullAngleV4ModelManifest);
registerExecutionManifest(controlCameraExecutionManifest);
registerModelManifest(controlCameraModelManifest);
registerExecutionManifest(krea2TextToImageExecutionManifest);
registerModelManifest(krea2TextToImageModelManifest);
registerExecutionManifest(zImageTextToImageExecutionManifest);
registerModelManifest(zImageTextToImageModelManifest);
registerExecutionManifest(rhVideoBasicExecutionManifest);
registerModelManifest(rhVideoBasicModelManifest);
registerExecutionManifest(rhVideoLtx23ExecutionManifest);
registerModelManifest(rhVideoLtx23ModelManifest);
registerExecutionManifest(rhVideoCommercialDigitalHumanExecutionManifest);
registerModelManifest(rhVideoCommercialDigitalHumanModelManifest);
registerExecutionManifest(rhVideoLipSyncExecutionManifest);
registerModelManifest(rhVideoLipSyncModelManifest);
registerExecutionManifest(rhVideoV54ExecutionManifest);
registerModelManifest(rhVideoV54ModelManifest);
registerExecutionManifest(rhVideoAnimate2V1ExecutionManifest);
registerModelManifest(rhVideoAnimate2V1ModelManifest);
registerExecutionManifest(rhVideoHailuoH3OmniExecutionManifest);
registerModelManifest(rhVideoHailuoH3OmniModelManifest);
registerExecutionManifest(rhVideoHailuoH3DualSamplingX2ExecutionManifest);
registerModelManifest(rhVideoHailuoH3DualSamplingX2ModelManifest);
registerExecutionManifest(rhVideoHailuoH3EditV1ExecutionManifest);
registerModelManifest(rhVideoHailuoH3EditV1ModelManifest);
registerExecutionManifest(rhVideoBerniniV1ExecutionManifest);
registerModelManifest(rhVideoBerniniV1ModelManifest);
registerExecutionManifest(rhVideoWan22ExecutionManifest);
registerModelManifest(rhVideoWan22ModelManifest);
registerExecutionManifest(rhVideoScail2V1ExecutionManifest);
registerModelManifest(rhVideoScail2V1ModelManifest);
registerExecutionManifest(rhVideoScailV2ExecutionManifest);
registerModelManifest(rhVideoScailV2ModelManifest);
registerExecutionManifest(rhVideoWatermarkRemovalV2ExecutionManifest);
registerModelManifest(rhVideoWatermarkRemovalV2ModelManifest);
registerExecutionManifest(rhVideoMattingExecutionManifest);
registerModelManifest(rhVideoMattingModelManifest);
registerExecutionManifest(rhVideoHdVipExecutionManifest);
registerModelManifest(rhVideoHdVipModelManifest);
registerExecutionManifest(rhVideoFrameInterpolationExecutionManifest);
registerModelManifest(rhVideoFrameInterpolationModelManifest);
registerExecutionManifest(rhAudioIndexTts2CloneExecutionManifest);
registerModelManifest(rhAudioIndexTts2CloneModelManifest);
registerExecutionManifest(rhAudioVoiceConvertExecutionManifest);
registerModelManifest(rhAudioVoiceConvertModelManifest);
registerExecutionManifest(rhAudioAdvancedVoiceCloneExecutionManifest);
registerModelManifest(rhAudioAdvancedVoiceCloneModelManifest);
registerExecutionManifest(rhAudioSeparationExecutionManifest);
registerModelManifest(rhAudioSeparationModelManifest);
vendorImageModelApiExecutionManifests.forEach(registerExecutionManifest);
vendorImageModelApiModelManifests.forEach(registerModelManifest);
dreaminaImageExecutionManifests.forEach(registerExecutionManifest);
dreaminaImageModelManifests.forEach(registerModelManifest);
openAiCliImageExecutionManifests.forEach(registerExecutionManifest);
openAiCliImageModelManifests.forEach(registerModelManifest);
vendorVideoModelApiExecutionManifests.forEach(registerExecutionManifest);
vendorVideoModelApiModelManifests.forEach(registerModelManifest);
dreaminaVideoExecutionManifests.forEach(registerExecutionManifest);
dreaminaVideoModelManifests.forEach(registerModelManifest);
vendorTextModelApiExecutionManifests.forEach(registerExecutionManifest);
vendorTextModelApiModelManifests.forEach(registerModelManifest);
cliTextExecutionManifests.forEach(registerExecutionManifest);
cliTextModelManifests.forEach(registerModelManifest);
volcengineAudioModelApiExecutionManifests.forEach(registerExecutionManifest);
volcengineAudioModelApiModelManifests.forEach(registerModelManifest);
runningHubAudioModelApiExecutionManifests.forEach(registerExecutionManifest);
runningHubAudioModelApiModelManifests.forEach(registerModelManifest);
export function getModelManifest(_0x14d34b) {
  const _0x2583e1 = String(_0x14d34b || "").trim();
  return _models.get(_0x2583e1) || null;
}
export function resolveModelManifest(_0x5e05ea, _0x1acfb2 = "") {
  const _0x4e8166 = getModelManifest(_0x5e05ea);
  if (!_0x4e8166) {
    return null;
  }
  const _0x265f60 = String(_0x1acfb2 || "").trim();
  if (_0x265f60 && _0x4e8166.provider !== _0x265f60) {
    return null;
  }
  return _0x4e8166;
}
export function getExecutionManifest(_0x47c749) {
  return _executions.get(String(_0x47c749 || "").trim()) || null;
}
export function resolveExecutionManifest(_0x5c82f4) {
  return getExecutionManifest(_0x5c82f4);
}
const PROVIDER_PREFIXES = Object.freeze({
  "runninghub-model": "runninghub",
  runninghub: "runninghubwf",
  dreamina: "dreamina",
  apimart: "apimart",
  agnes: "agnes",
  ppio: "ppio",
  grsai: "grsai",
  volcengine: "volcengine",
  comfyui: "comfyui"
});
export function normalizeProviderId(_0x2b616b) {
  const _0x4a5089 = String(_0x2b616b || "").trim().toLowerCase();
  if (_0x4a5089 === "runninghub-workflow" || _0x4a5089 === "runninghubwf") {
    return "runninghubwf";
  }
  if (_0x4a5089 === "runninghub-model") {
    return "runninghub";
  }
  return _0x4a5089;
}
function inferProviderFromModelPrefix(_0x3b40a7) {
  const _0x4db7a8 = String(_0x3b40a7 || "").trim().toLowerCase();
  const _0x1474f7 = _0x4db7a8.includes("/") ? _0x4db7a8.split("/")[0] : "";
  return PROVIDER_PREFIXES[_0x1474f7] || "";
}
function resolveModelManifestCandidate(_0x49a4d4, _0x319ee0 = "") {
  const _0x11945d = normalizeRegistryKey(_0x49a4d4);
  const _0x73a41d = normalizeProviderId(_0x319ee0);
  if (!_0x11945d) {
    return null;
  }
  const _0x4f1d7a = getModelManifest(_0x11945d);
  if (_0x4f1d7a && (!_0x73a41d || normalizeProviderId(_0x4f1d7a.provider) === _0x73a41d)) {
    return {
      modelManifest: _0x4f1d7a,
      inputModelId: _0x11945d,
      canonicalModelId: _0x4f1d7a.modelId,
      source: "exact"
    };
  }
  if (_0x73a41d && _0x11945d.includes("/")) {
    const [_0x57a489, ..._0x6ac75] = _0x11945d.split("/");
    const _0x10515d = inferProviderFromModelPrefix(_0x11945d);
    const _0x38c813 = _0x6ac75.join("/");
    if (_0x38c813 && (!_0x10515d || _0x10515d === _0x73a41d)) {
      const _0x3a9b7d = getModelManifest(_0x38c813);
      if (_0x3a9b7d && normalizeProviderId(_0x3a9b7d.provider) === _0x73a41d) {
        return {
          modelManifest: _0x3a9b7d,
          inputModelId: _0x11945d,
          canonicalModelId: _0x3a9b7d.modelId,
          source: "stripped:" + _0x57a489
        };
      }
    }
  }
  if (_0x73a41d && !_0x11945d.includes("/")) {
    const _0x2e9f84 = getModelManifest(_0x73a41d + "/" + _0x11945d);
    if (_0x2e9f84 && normalizeProviderId(_0x2e9f84.provider) === _0x73a41d) {
      return {
        modelManifest: _0x2e9f84,
        inputModelId: _0x11945d,
        canonicalModelId: _0x2e9f84.modelId,
        source: "prefixed"
      };
    }
  }
  return null;
}
export function resolveModelProvider(_0x3e8b91, _0x2503d0 = "", {
  allowProviderHint = true,
  allowPrefixInference = true
} = {}) {
  const _0x424acc = normalizeProviderId(_0x2503d0);
  if (_0x424acc && allowProviderHint) {
    return _0x424acc;
  }
  const _0x5ce755 = resolveModelManifestCandidate(_0x3e8b91, _0x424acc);
  if (_0x5ce755?.modelManifest?.provider) {
    return normalizeProviderId(_0x5ce755.modelManifest.provider);
  }
  if (allowPrefixInference) {
    return inferProviderFromModelPrefix(_0x3e8b91);
  } else {
    return "";
  }
}
export function resolveModelExecution(_0x16bfe0, _0xea34d6 = {}) {
  const _0x1c4dcf = typeof _0xea34d6 === "string" ? _0xea34d6 : _0xea34d6?.providerHint || _0xea34d6?.provider || "";
  const _0x488fc3 = resolveModelManifestCandidate(_0x16bfe0, _0x1c4dcf);
  const _0x2733a7 = _0x488fc3?.modelManifest || null;
  if (!_0x2733a7) {
    return null;
  }
  const _0x1e3ac4 = getExecutionManifest(_0x2733a7.executionId);
  if (!_0x1e3ac4) {
    return null;
  }
  return {
    modelManifest: _0x2733a7,
    executionManifest: _0x1e3ac4,
    inputModelId: _0x488fc3.inputModelId,
    canonicalModelId: _0x488fc3.canonicalModelId,
    source: _0x488fc3.source
  };
}
export function isModelApiModel(_0x9c54e0, _0x46482c = "") {
  const _0x16bdf2 = resolveModelExecution(_0x9c54e0, {
    providerHint: _0x46482c
  });
  return _0x16bdf2?.modelManifest?.adapterType === "modelApi" && _0x16bdf2?.executionManifest?.adapterType === "modelApi";
}
export function isWorkflowModel(_0x5ad873, _0x1d1784 = "") {
  const _0x2cbbdc = resolveModelExecution(_0x5ad873, {
    providerHint: _0x1d1784
  });
  return _0x2cbbdc?.modelManifest?.adapterType === "workflow" && _0x2cbbdc?.executionManifest?.adapterType === "workflow";
}
export function isLocalRuntimeModel(_0x3ce6b0, _0x3929e9 = "") {
  const _0x40ea08 = resolveModelExecution(_0x3ce6b0, {
    providerHint: _0x3929e9
  });
  return _0x40ea08?.modelManifest?.adapterType === "localRuntime" && _0x40ea08?.executionManifest?.adapterType === "localRuntime";
}
export function getModelsByKind(_0x3c31ad) {
  const _0x565d51 = String(_0x3c31ad || "").trim();
  return Array.from(new Set(_models.values())).filter(_0x3f2c0d => !_0x565d51 || _0x3f2c0d.kind === _0x565d51);
}
export function listModelManifests() {
  return Array.from(new Set(_models.values()));
}
