import { resolveModelExecution } from "../../src/manifests/index.js";
import { normalizeRatioLabelText } from "../imageRatioPolicy.js";
import { buildImageRequestFromManifest } from "./ModelApiManifestNormalizer.js";
import { buildRunningHubNodeInfoListFromManifest as a27_0x1b284f } from "./RunningHubWorkflowMappingAdapter.js";
import { getRunningHubWorkflowPayloadResolver } from "./runninghubWorkflowResolvers/index.js";
import { getRunningHubProviderProfileId, normalizeRunningHubModelApiProfileId, resolveRunningHubModelApiBaseUrl } from "../../src/modules/runningHubProviderProfiles.js";
import { normalizeRunningHubInstanceType } from "../../src/modules/runningHubInstanceTypes.js";
import { uploadModelApiMediaInputs } from "../mediaInputUploadRouter.js";
const RH_V54_SOURCE_VIDEO_MISSING_MESSAGE = "未获取到源视频 URL，请重新连接或重新上传源视频后再生成。";
const RH_V54_SOURCE_VIDEO_UPLOAD_FAILED_MESSAGE = "源视频上传失败，可能是网络延迟或视频文件暂时无法访问，请稍后重试，或重新上传源视频。";
const RH_VIDEO_FPS_OPTIONS = Object.freeze([16, 24, 30]);
const RH_MIN_VIDEO_RESOLUTION = 832;
const RUNNINGHUB_WORKFLOW_DEFAULT_RATIO = "1:1";
const RUNNINGHUB_WORKFLOW_RATIO_SET = new Set(["1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9"]);
const CUSTOM_AI_APP_MEDIA_NODE_SOURCES = new Set(["imageInput", "videoInput", "audioInput"]);
function getRunningHubWorkflowProfileId(_0x429986 = {}) {
  const _0x32828b = getRunningHubProviderProfileId(_0x429986);
  if (_0x32828b) {
    return normalizeRunningHubModelApiProfileId(_0x32828b);
  } else {
    return "";
  }
}
function getRunningHubWorkflowBaseUrl(_0xc8cfbb = {}) {
  const _0x4316f9 = String(_0xc8cfbb?.runningHubApiUrl || "").trim();
  if (_0x4316f9) {
    return _0x4316f9.replace(/\/+$/, "");
  }
  return resolveRunningHubModelApiBaseUrl(getRunningHubWorkflowProfileId(_0xc8cfbb));
}
function resolveRunningHubWorkflowResourceId(_0x2d0dbb, _0x540847 = {}) {
  const _0x596100 = getRunningHubWorkflowProfileId(_0x540847) || "runninghub";
  const _0x4f098a = _0x2d0dbb?.extensions?.providerProfileBindings?.[_0x596100];
  const _0x48bf95 = _0x2d0dbb?.submitMode === "runninghub-task-create";
  const _0x3324a0 = _0x48bf95 ? _0x4f098a?.workflowId || _0x4f098a?.appId : _0x4f098a?.appId || _0x4f098a?.workflowId;
  const _0x1ee917 = _0x48bf95 ? _0x2d0dbb?.workflowId || _0x2d0dbb?.appId : _0x2d0dbb?.appId || _0x2d0dbb?.workflowId;
  return String(_0x3324a0 || _0x1ee917 || "").trim();
}
function isImportedRunningHubAiAppManifest(_0x440ab6) {
  return Boolean(_0x440ab6?.extensions?.rhAiApp);
}
function relaxCustomAiAppMediaNodeMappings(_0x4485db = null, {
  enabled = false
} = {}) {
  if (!enabled || !_0x4485db || typeof _0x4485db !== "object" || Array.isArray(_0x4485db)) {
    return _0x4485db;
  }
  const _0x26dcec = Array.isArray(_0x4485db.nodeInfoList) ? _0x4485db.nodeInfoList.map(_0x117689 => CUSTOM_AI_APP_MEDIA_NODE_SOURCES.has(String(_0x117689?.source || "").trim()) ? {
    ..._0x117689,
    required: false
  } : _0x117689) : _0x4485db.nodeInfoList;
  return {
    ..._0x4485db,
    nodeInfoList: _0x26dcec
  };
}
function isAdvancedModeEnabled() {
  return typeof window !== "undefined" && window.ADVANCED_MODE === true;
}
function normalizeRhVideoFps(_0x15af69) {
  const _0xa9c448 = Math.trunc(Number(_0x15af69));
  if (RH_VIDEO_FPS_OPTIONS.includes(_0xa9c448)) {
    return _0xa9c448;
  } else {
    return 24;
  }
}
function normalizeRhVideoResolution(_0x2c219e, _0x52c480 = RH_MIN_VIDEO_RESOLUTION) {
  const _0x5a17e1 = Number(_0x2c219e);
  if (Number.isFinite(_0x5a17e1)) {
    return Math.max(RH_MIN_VIDEO_RESOLUTION, Math.trunc(_0x5a17e1));
  } else {
    return _0x52c480;
  }
}
function normalizeRunningHubWorkflowRatio(_0x19d0b0, _0x5d32fb = RUNNINGHUB_WORKFLOW_DEFAULT_RATIO) {
  const _0x2ca3ab = String(_0x19d0b0 || "").trim();
  const _0x24456d = RUNNINGHUB_WORKFLOW_RATIO_SET.has(String(_0x5d32fb || "").trim()) ? String(_0x5d32fb || "").trim() : RUNNINGHUB_WORKFLOW_DEFAULT_RATIO;
  if (!_0x2ca3ab) {
    return _0x24456d;
  }
  const _0x50afb2 = normalizeRatioLabelText(_0x2ca3ab);
  const _0x421585 = _0x50afb2.toLowerCase();
  if (_0x421585 === "auto" || _0x421585 === "default" || _0x50afb2 === "默认" || _0x50afb2 === "自适应" || _0x421585 === "original" || _0x50afb2 === "原图比例") {
    return _0x24456d;
  }
  if (!_0x50afb2.includes(":")) {
    return _0x24456d;
  }
  const [_0xa263bb, _0x5c577d] = _0x50afb2.split(":");
  const _0x5e9b55 = Number.parseFloat(_0xa263bb);
  const _0x16a32d = Number.parseFloat(_0x5c577d);
  if (!(_0x5e9b55 > 0) || !(_0x16a32d > 0)) {
    return _0x24456d;
  }
  const _0xabf2cf = _0x5e9b55 + ":" + _0x16a32d;
  if (RUNNINGHUB_WORKFLOW_RATIO_SET.has(_0xabf2cf)) {
    return _0xabf2cf;
  } else {
    return _0x24456d;
  }
}
function normalizeQwenImageEditModeIndex(_0x5ad81d) {
  const _0x35d5c0 = String(_0x5ad81d || "").trim().toLowerCase();
  if (_0x35d5c0 === "0" || _0x35d5c0 === "qwen2509" || _0x35d5c0 === "2509") {
    return "0";
  }
  return "1";
}
function normalizeQwenFirstImageModeIndex(_0x3021b4) {
  const _0x21a5b6 = String(_0x3021b4 || "").trim().toLowerCase();
  if (_0x21a5b6 === "1" || _0x21a5b6 === "pose" || _0x21a5b6 === "姿势图") {
    return "1";
  }
  if (_0x21a5b6 === "2" || _0x21a5b6 === "depth" || _0x21a5b6 === "深度图") {
    return "2";
  }
  return "0";
}
function getImageWorkflowLongSideMap(_0x3b3213 = {}) {
  const _0x2b0d9e = _0x3b3213?.longSideByImageSize && typeof _0x3b3213.longSideByImageSize === "object" ? _0x3b3213.longSideByImageSize : null;
  return _0x2b0d9e || Object.freeze({
    "1K": 1024,
    "1.5K": 1536,
    "2K": 1920
  });
}
function resolveImageWorkflowQualityKey(_0x186385, _0x572b8a = {}) {
  const _0x2d0d70 = getImageWorkflowLongSideMap(_0x572b8a);
  const _0x523d61 = String(_0x572b8a?.defaultImageSize || "2K").trim().toUpperCase();
  const _0x406faa = String(_0x186385 || _0x523d61).trim().toUpperCase();
  const _0x4abfe7 = Object.keys(_0x2d0d70);
  return _0x4abfe7.find(_0x15da2f => String(_0x15da2f).trim().toUpperCase() === _0x406faa) || _0x4abfe7.find(_0xf00a35 => String(_0xf00a35).trim().toUpperCase() === _0x523d61) || _0x4abfe7[0] || "2K";
}
function resolveImageWorkflowDimensions(_0x1807b5, _0x50d688, _0x110dfb = {}) {
  const _0x29c5d6 = resolveImageWorkflowQualityKey(_0x1807b5, _0x110dfb);
  const _0x2fa54b = Number(getImageWorkflowLongSideMap(_0x110dfb)[_0x29c5d6]) || 1920;
  const _0x461b23 = String(_0x110dfb?.defaultAspectRatio || RUNNINGHUB_WORKFLOW_DEFAULT_RATIO).trim();
  const _0x1c5263 = normalizeRunningHubWorkflowRatio(_0x50d688, _0x461b23);
  const [_0x419ff6, _0xd83360] = _0x1c5263.split(":");
  const _0x40b32c = Number.parseFloat(_0x419ff6) || 1;
  const _0x84d0e5 = Number.parseFloat(_0xd83360) || 1;
  const _0x194e79 = _0x40b32c >= _0x84d0e5;
  const _0x6ba0db = _0x194e79 ? _0x2fa54b : _0x2fa54b * _0x40b32c / _0x84d0e5;
  const _0x5b7cc3 = _0x194e79 ? _0x2fa54b * _0x84d0e5 / _0x40b32c : _0x2fa54b;
  const _0x486e53 = Math.max(1, Number(_0x110dfb?.align) || 64);
  const _0x4ffe30 = Math.max(1, Number(_0x110dfb?.minDimension) || 512);
  const _0x37d577 = _0xa88ab2 => Math.max(_0x4ffe30, Math.round(Number(_0xa88ab2 || 0) / _0x486e53) * _0x486e53);
  return {
    width: _0x37d577(_0x6ba0db),
    height: _0x37d577(_0x5b7cc3)
  };
}
function resolveManifestDimensionsValue(_0x59bc60, _0x5ae014, _0x10f42d, _0xf8aae0) {
  const _0x5358cc = [...(Array.isArray(_0x5ae014?.[_0x10f42d + "Fields"]) ? _0x5ae014[_0x10f42d + "Fields"] : []), _0x5ae014?.[_0x10f42d + "Field"], _0x10f42d === "imageSize" ? "imageSize" : "resolvedRatioLabel", _0x10f42d === "imageSize" ? "generationParams.imageSize" : "aspectRatio", _0x10f42d === "aspectRatio" ? "generationParams.aspectRatio" : ""].filter(Boolean);
  return resolveManifestPayloadValue(_0x59bc60, _0x5358cc, _0xf8aae0);
}
function normalizeManifestDimensionNode(_0x36f837, _0x3a7579, _0x2c5035) {
  if (_0x36f837 && typeof _0x36f837 === "object" && !Array.isArray(_0x36f837)) {
    return {
      nodeId: String(_0x36f837.nodeId || "").trim(),
      fieldName: String(_0x36f837.fieldName || _0x2c5035).trim() || _0x2c5035,
      description: _0x36f837.description || _0x2c5035
    };
  }
  return {
    nodeId: String(_0x3a7579?.nodeId || "").trim(),
    fieldName: String(_0x2c5035 === "width" ? _0x3a7579?.widthFieldName || "width" : _0x3a7579?.heightFieldName || "height").trim(),
    description: _0x2c5035
  };
}
function pushManifestDimensionsNodes(_0xe235b7, _0x3a9eaa, _0x44841b) {
  const _0x1304aa = normalizeManifestDimensionNode(_0x3a9eaa?.widthNode, _0x3a9eaa, "width");
  const _0x171aaa = normalizeManifestDimensionNode(_0x3a9eaa?.heightNode, _0x3a9eaa, "height");
  [[_0x1304aa, _0x44841b.width], [_0x171aaa, _0x44841b.height]].forEach(([_0x5424a2, _0x3b487a]) => {
    if (!_0x5424a2.nodeId || !_0x5424a2.fieldName) {
      return;
    }
    _0xe235b7.push({
      nodeId: _0x5424a2.nodeId,
      fieldName: _0x5424a2.fieldName,
      fieldValue: String(_0x3b487a),
      description: _0x5424a2.description
    });
  });
}
function normalizeManifestMappedValue(_0x573b9e, _0x436e09) {
  const _0x9ff1f8 = String(_0x573b9e ?? _0x436e09?.defaultValue ?? "").trim();
  const _0x5701d0 = _0x436e09?.valueMap || {};
  return _0x5701d0[_0x9ff1f8] || _0x5701d0[_0x9ff1f8.toLowerCase()] || _0x5701d0[String(_0x436e09?.defaultValue || "")] || _0x9ff1f8;
}
function formatManifestPromptNodeValue(_0x5cb5e3, _0x5d5025) {
  const _0x371f1f = String(_0x5cb5e3 || "").trim();
  const _0x3e31bb = String(_0x5d5025?.defaultValue ?? "");
  const _0x595c6c = _0x371f1f || _0x3e31bb;
  if (!_0x595c6c) {
    return "";
  }
  return "" + String(_0x5d5025?.prefix ?? "") + _0x595c6c + String(_0x5d5025?.suffix ?? "");
}
function normalizeManifestImageNode(_0x805cc9, _0x2acc66) {
  if (_0x805cc9 && typeof _0x805cc9 === "object" && !Array.isArray(_0x805cc9)) {
    return {
      nodeId: String(_0x805cc9.nodeId || "").trim(),
      fieldName: String(_0x805cc9.fieldName || "image").trim() || "image",
      description: _0x805cc9.description || "图" + (_0x2acc66 + 1)
    };
  }
  return {
    nodeId: String(_0x805cc9 || "").trim(),
    fieldName: "image",
    description: "图" + (_0x2acc66 + 1)
  };
}
function getManifestPayloadPathValue(_0x1dd404, _0x3cd0dc) {
  const _0x41cdbe = String(_0x3cd0dc || "").trim();
  if (!_0x41cdbe) {
    return undefined;
  }
  return _0x41cdbe.split(".").reduce((_0x219ec6, _0x41d2a5) => {
    if (_0x219ec6 === undefined || _0x219ec6 === null) {
      return undefined;
    }
    return _0x219ec6[_0x41d2a5];
  }, _0x1dd404);
}
function resolveManifestPayloadValue(_0x5c0f3d, _0x256bc9 = [], _0x16a07e = undefined, {
  allowEmpty = false
} = {}) {
  const _0x1e39d2 = Array.isArray(_0x256bc9) ? _0x256bc9 : [_0x256bc9];
  for (const _0x9a9d3c of _0x1e39d2.filter(Boolean)) {
    const _0x2ac6d4 = getManifestPayloadPathValue(_0x5c0f3d, _0x9a9d3c);
    if (allowEmpty && _0x2ac6d4 !== undefined && _0x2ac6d4 !== null) {
      return _0x2ac6d4;
    }
    if (_0x2ac6d4 !== undefined && _0x2ac6d4 !== null && String(_0x2ac6d4).trim() !== "") {
      return _0x2ac6d4;
    }
  }
  return _0x16a07e;
}
function normalizeManifestValueNodeValue(_0x22a201, _0x559715) {
  const _0x40c36d = [...(Array.isArray(_0x559715?.allowedValues) ? _0x559715.allowedValues : []), ...(isAdvancedModeEnabled() && Array.isArray(_0x559715?.advancedAllowedValues) ? _0x559715.advancedAllowedValues : [])].map(_0x59d3a0 => Number(_0x59d3a0)).filter(Number.isFinite);
  if (_0x40c36d.length === 0) {
    return _0x22a201;
  }
  const _0x1c051c = Number(_0x22a201);
  const _0xe8e72 = Number(_0x559715?.defaultValue);
  const _0x3b7ab0 = Number.isFinite(_0x1c051c) ? _0x1c051c : Number.isFinite(_0xe8e72) ? _0xe8e72 : _0x40c36d[0];
  return _0x40c36d.reduce((_0x4c8adc, _0x17cacf) => Math.abs(_0x17cacf - _0x3b7ab0) < Math.abs(_0x4c8adc - _0x3b7ab0) ? _0x17cacf : _0x4c8adc, _0x40c36d[0]);
}
function buildRunningHubImageResultExtractor() {
  return _0x10ef29 => {
    if (_0x10ef29.status === "COMPLETED" && Array.isArray(_0x10ef29.results)) {
      return _0x10ef29.results.map(_0x28784c => _0x28784c.url || _0x28784c.imageUrl).filter(Boolean);
    }
    return [];
  };
}
function buildOpenApiImageWorkflowRequest({
  executionManifest: _0x5e8640,
  payload: _0x17224c,
  apiKey: _0x1202cb,
  nodeInfoList: _0x89c37a
}) {
  const _0x3dc5a5 = normalizeRunningHubInstanceType(_0x17224c[_0x5e8640.instanceType?.field]);
  const _0x426a1f = resolveRunningHubWorkflowResourceId(_0x5e8640, _0x17224c);
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: getRunningHubWorkflowBaseUrl(_0x17224c) + "/openapi/v2/run/ai-app/" + _0x426a1f,
      apiKey: _0x1202cb,
      nodeInfoList: _0x89c37a,
      instanceType: _0x3dc5a5,
      usePersonalQueue: "false"
    },
    isAsync: true,
    taskIdPath: _0x5e8640.result?.taskIdPath || "taskId",
    adapterTrace: {
      source: "manifest",
      executionId: _0x5e8640.id,
      modelId: _0x17224c.model
    },
    pollUrlBuilder: () => getRunningHubWorkflowBaseUrl(_0x17224c) + "/openapi/v2/query",
    resultExtractor: buildRunningHubImageResultExtractor()
  };
}
async function buildOpenApiAiAppWorkflowRequestFromManifest({
  executionManifest: _0x91c24a,
  modelManifest = null,
  payload: _0x36a3da,
  finalPrompt: _0x3dac2e,
  finalUrls: _0x198a3a,
  apiKey: _0x29fe43,
  ctx: _0x3816f8
}) {
  if (!_0x91c24a || _0x91c24a.adapterType !== "workflow" || _0x91c24a.submitMode !== "openapi-v2-ai-app") {
    return null;
  }
  const _0x4455ea = relaxCustomAiAppMediaNodeMappings(_0x91c24a.mapping || {}, {
    enabled: isImportedRunningHubAiAppManifest(modelManifest)
  });
  if (Array.isArray(_0x4455ea.nodeInfoList)) {
    const _0x1aad87 = await a27_0x1b284f({
      mapping: _0x4455ea,
      payload: _0x36a3da,
      finalPrompt: _0x3dac2e,
      sourceResolvers: {
        imageInput: ({
          item: _0x3fae7d
        }) => resolveRunningHubFirstImageInput(_0x36a3da, _0x29fe43, _0x3816f8, {
          field: String(_0x3fae7d?.field || "inputUrls").trim(),
          required: _0x3fae7d?.required === true,
          missingMessage: _0x3fae7d?.missingMessage || "请接入参考图",
          uploadFailedMessage: _0x3fae7d?.uploadFailedMessage || "参考图上传失败",
          compress: _0x3fae7d?.compress !== false
        }),
        videoInput: ({
          item: _0x327753
        }) => {
          const _0x51bf95 = String(_0x327753?.urlField || _0x327753?.field || "videoUrl").trim();
          const _0x5de9af = String(_0x327753?.fileField || "videoFile").trim();
          const _0x5eb612 = String(getManifestPayloadPathValue(_0x36a3da, _0x51bf95) || "").trim();
          const _0x4929f7 = getManifestPayloadPathValue(_0x36a3da, _0x5de9af);
          if (!_0x327753?.required && !_0x5eb612 && !_0x4929f7) {
            return "";
          }
          return resolveRunningHubVideoInput(_0x36a3da, _0x29fe43, {
            urlField: _0x51bf95,
            fileField: _0x5de9af,
            missingMessage: _0x327753?.missingMessage || "请接入源视频",
            uploadFailedMessage: _0x327753?.uploadFailedMessage || "源视频上传失败"
          });
        },
        audioInput: ({
          item: _0x590dfc
        }) => {
          const _0x66afc0 = String(_0x590dfc?.urlField || _0x590dfc?.field || "audioUrl").trim();
          const _0x1bd68e = String(_0x590dfc?.fileField || "audioFile").trim();
          const _0x33be62 = String(getManifestPayloadPathValue(_0x36a3da, _0x66afc0) || "").trim();
          const _0x59957b = getManifestPayloadPathValue(_0x36a3da, _0x1bd68e);
          if (!_0x590dfc?.required && !_0x33be62 && !_0x59957b) {
            return "";
          }
          return resolveRunningHubAudioInput(_0x36a3da, _0x29fe43, {
            urlField: _0x66afc0,
            fileField: _0x1bd68e,
            required: _0x590dfc?.required === true,
            missingMessage: _0x590dfc?.missingMessage || "请接入音频"
          });
        }
      },
      transforms: {
        normalizeRhVideoFps: _0x211ab7 => normalizeRhVideoFps(_0x211ab7),
        normalizeRhVideoResolution: (_0x54ab74, _0x5d72ca) => normalizeRhVideoResolution(_0x54ab74, Number.isFinite(Number(_0x5d72ca.fallback)) ? Number(_0x5d72ca.fallback) : RH_MIN_VIDEO_RESOLUTION)
      }
    });
    if (!_0x1aad87) {
      return null;
    }
    return buildOpenApiImageWorkflowRequest({
      executionManifest: _0x91c24a,
      payload: _0x36a3da,
      apiKey: _0x29fe43,
      nodeInfoList: _0x1aad87
    });
  }
  const _0x28fe9c = _0x91c24a.validation || {};
  const _0x4a6dfb = Math.max(1, Number(_0x4455ea.maxInputImages) || 1);
  const _0x184f44 = _0x198a3a.filter(Boolean).slice(0, _0x4a6dfb);
  const _0x8b14ea = Math.max(0, Number(_0x28fe9c.minInputImages) || 0);
  if (_0x184f44.length < _0x8b14ea) {
    throw new Error(_0x28fe9c.missingInputMessage || "请先添加至少一张参考图再生成");
  }
  const _0x4cad6b = [];
  const _0x45bac5 = Array.isArray(_0x4455ea.imageNodes) ? _0x4455ea.imageNodes : [];
  _0x184f44.forEach((_0xe9206f, _0xf7482b) => {
    const _0x3fe69d = normalizeManifestImageNode(_0x45bac5[_0xf7482b], _0xf7482b);
    const _0x44330e = _0x3fe69d.nodeId;
    if (!_0x44330e) {
      return;
    }
    _0x4cad6b.push({
      nodeId: _0x44330e,
      fieldName: _0x3fe69d.fieldName,
      fieldValue: _0xe9206f,
      description: _0x3fe69d.description
    });
  });
  const _0x3521b1 = Array.isArray(_0x4455ea.optionalImageNodes) ? _0x4455ea.optionalImageNodes : [];
  if (_0x3521b1.length > 0) {
    const _0x1e0088 = _0x3521b1.map(_0x1707c0 => String(resolveManifestPayloadValue(_0x36a3da, _0x1707c0.fields, "") || "").trim());
    const _0x356d97 = _0x3816f8?.processInputImagesPreserveOrder && _0x1e0088.some(Boolean) ? await _0x3816f8.processInputImagesPreserveOrder(_0x1e0088, _0x29fe43, {
      compress: false,
      provider: "runninghub",
      strictUpload: true,
      apiUrl: getRunningHubWorkflowBaseUrl(_0x36a3da)
    }) : _0x1e0088;
    _0x3521b1.forEach((_0x14a7da, _0x2f7c1a) => {
      const _0x4da4ad = String(_0x1e0088[_0x2f7c1a] || "").trim();
      const _0x58690e = String(_0x356d97?.[_0x2f7c1a] || "").trim();
      if (_0x4da4ad && !_0x58690e) {
        throw new Error(_0x14a7da?.uploadFailedMessage || "可选参考图上传失败");
      }
      if (!_0x58690e || !_0x14a7da?.nodeId || !_0x14a7da?.fieldName) {
        return;
      }
      _0x4cad6b.push({
        nodeId: String(_0x14a7da.nodeId),
        fieldName: String(_0x14a7da.fieldName),
        fieldValue: _0x58690e,
        description: _0x14a7da.description || String(_0x14a7da.fieldName)
      });
      if (_0x14a7da.enableNode?.nodeId && _0x14a7da.enableNode?.fieldName) {
        _0x4cad6b.push({
          nodeId: String(_0x14a7da.enableNode.nodeId),
          fieldName: String(_0x14a7da.enableNode.fieldName),
          fieldValue: String(_0x14a7da.enableNode.value ?? "true"),
          description: _0x14a7da.enableNode.description || String(_0x14a7da.enableNode.fieldName)
        });
      }
    });
  }
  if (_0x4455ea.promptNode?.nodeId && _0x4455ea.promptNode?.fieldName) {
    _0x4cad6b.push({
      nodeId: String(_0x4455ea.promptNode.nodeId),
      fieldName: String(_0x4455ea.promptNode.fieldName),
      fieldValue: formatManifestPromptNodeValue(_0x3dac2e, _0x4455ea.promptNode),
      description: _0x4455ea.promptNode.description || "提示词"
    });
  }
  if (_0x4455ea.dimensionsNode?.nodeId || _0x4455ea.dimensionsNode?.widthNode?.nodeId || _0x4455ea.dimensionsNode?.heightNode?.nodeId) {
    const _0x524a6a = _0x4455ea.dimensionsNode;
    const _0x567c6c = resolveImageWorkflowDimensions(resolveManifestDimensionsValue(_0x36a3da, _0x524a6a, "imageSize", _0x524a6a.defaultImageSize), resolveManifestDimensionsValue(_0x36a3da, _0x524a6a, "aspectRatio", _0x524a6a.defaultAspectRatio), _0x524a6a);
    pushManifestDimensionsNodes(_0x4cad6b, _0x524a6a, _0x567c6c);
  }
  [_0x4455ea.firstImageModeNode, _0x4455ea.editModeNode].forEach(_0x87b9fd => {
    if (!_0x87b9fd?.nodeId || !_0x87b9fd?.fieldName || !_0x87b9fd?.field) {
      return;
    }
    _0x4cad6b.push({
      nodeId: String(_0x87b9fd.nodeId),
      fieldName: String(_0x87b9fd.fieldName),
      fieldValue: normalizeManifestMappedValue(_0x36a3da[_0x87b9fd.field], _0x87b9fd),
      description: _0x87b9fd === _0x4455ea.firstImageModeNode ? "把第一张图变为" : "模式选择"
    });
  });
  if (Array.isArray(_0x4455ea.valueNodes)) {
    _0x4455ea.valueNodes.forEach(_0x410626 => {
      if (!_0x410626?.nodeId || !_0x410626?.fieldName) {
        return;
      }
      const _0x5312d9 = [_0x410626.field, ...(Array.isArray(_0x410626.fallbackFields) ? _0x410626.fallbackFields : [])].filter(Boolean);
      let _0x1dd3a3 = "";
      for (const _0x2d97df of _0x5312d9) {
        const _0x1fa2a1 = getManifestPayloadPathValue(_0x36a3da, _0x2d97df);
        if (_0x1fa2a1 !== undefined && _0x1fa2a1 !== null && String(_0x1fa2a1).trim() !== "") {
          _0x1dd3a3 = _0x1fa2a1;
          break;
        }
      }
      if (_0x1dd3a3 === "") {
        _0x1dd3a3 = _0x410626.defaultValue ?? "";
      }
      _0x1dd3a3 = normalizeManifestValueNodeValue(_0x1dd3a3, _0x410626);
      _0x4cad6b.push({
        nodeId: String(_0x410626.nodeId),
        fieldName: String(_0x410626.fieldName),
        fieldValue: String(_0x1dd3a3),
        description: _0x410626.description || String(_0x410626.fieldName)
      });
    });
  }
  if (_0x4455ea.imageCountNode?.nodeId && _0x4455ea.imageCountNode?.fieldName) {
    const _0x5adb98 = Number(_0x4455ea.imageCountNode.offset) || 0;
    _0x4cad6b.push({
      nodeId: String(_0x4455ea.imageCountNode.nodeId),
      fieldName: String(_0x4455ea.imageCountNode.fieldName),
      fieldValue: String(Math.max(0, _0x184f44.length + _0x5adb98)),
      description: "入参多少张图片"
    });
  }
  return buildOpenApiImageWorkflowRequest({
    executionManifest: _0x91c24a,
    payload: _0x36a3da,
    apiKey: _0x29fe43,
    nodeInfoList: _0x4cad6b
  });
}
function normalizeVideoMattingMaskModeIndex(_0x3a322b) {
  const _0x2d85ed = String(_0x3a322b || "").trim();
  if (!_0x2d85ed || _0x2d85ed === "0") {
    return "0";
  }
  if (_0x2d85ed === "1") {
    return "1";
  }
  if (_0x2d85ed === "2") {
    return "2";
  }
  const _0x144a26 = _0x2d85ed.toLowerCase();
  if (_0x144a26 === "sam3") {
    return "1";
  }
  if (_0x144a26 === "ma2" || _0x144a26 === "matanyone2") {
    return "2";
  }
  return "0";
}
function buildRunningHubVideoResultExtractor() {
  return _0x2b96a6 => {
    if (_0x2b96a6.status === "COMPLETED" && Array.isArray(_0x2b96a6.results)) {
      return _0x2b96a6.results.map(_0x23896c => _0x23896c.videoUrl || _0x23896c.url).filter(Boolean);
    }
    return [];
  };
}
function buildOpenApiVideoWorkflowRequest({
  executionManifest: _0x249f9e,
  payload: _0x23df31,
  apiKey: _0x4cdfa3,
  nodeInfoList: _0x1a2a08
}) {
  const _0x3cd8ed = normalizeRunningHubInstanceType(_0x23df31[_0x249f9e.instanceType?.field]);
  const _0x53c250 = resolveRunningHubWorkflowResourceId(_0x249f9e, _0x23df31);
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: getRunningHubWorkflowBaseUrl(_0x23df31) + "/openapi/v2/run/ai-app/" + _0x53c250,
      apiKey: _0x4cdfa3,
      nodeInfoList: _0x1a2a08,
      instanceType: _0x3cd8ed,
      usePersonalQueue: "false"
    },
    isAsync: true,
    taskIdPath: _0x249f9e.result?.taskIdPath || "taskId",
    adapterTrace: {
      source: "manifest",
      executionId: _0x249f9e.id,
      modelId: _0x23df31.model
    },
    pollUrlBuilder: () => getRunningHubWorkflowBaseUrl(_0x23df31) + "/openapi/v2/query",
    resultExtractor: buildRunningHubVideoResultExtractor()
  };
}
function buildTaskCreateVideoWorkflowRequest({
  executionManifest: _0x385b56,
  payload: _0x5256f9,
  apiKey: _0x1a3178,
  nodeInfoList: _0x50f6f3
}) {
  const _0x31097d = normalizeRunningHubInstanceType(_0x5256f9[_0x385b56.instanceType?.field]);
  const _0x356c38 = Number(_0x385b56.extensions?.taskCreate?.retainSeconds);
  const _0x4bea09 = (Array.isArray(_0x50f6f3) ? _0x50f6f3 : []).map(({
    nodeId: _0x3b798b,
    fieldName: _0x279049,
    fieldValue: _0x9d75d2
  }) => ({
    nodeId: _0x3b798b,
    fieldName: _0x279049,
    fieldValue: _0x9d75d2
  }));
  return {
    url: "/api/v2/runninghubwf/run",
    apiUrl: getRunningHubWorkflowBaseUrl(_0x5256f9) + "/task/openapi/create",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiKey: _0x1a3178,
      providerProfileId: getRunningHubWorkflowProfileId(_0x5256f9) || "runninghub",
      workflowId: resolveRunningHubWorkflowResourceId(_0x385b56, _0x5256f9),
      addMetadata: false,
      nodeInfoList: _0x4bea09,
      instanceType: _0x31097d,
      usePersonalQueue: "false",
      ...(Number.isFinite(_0x356c38) && _0x356c38 > 0 ? {
        retainSeconds: _0x356c38
      } : {})
    },
    isAsync: true,
    taskIdPath: _0x385b56.result?.taskIdPath || "taskId",
    adapterTrace: {
      source: "manifest",
      executionId: _0x385b56.id,
      modelId: _0x5256f9.model
    },
    pollUrlBuilder: () => getRunningHubWorkflowBaseUrl(_0x5256f9) + "/openapi/v2/query",
    resultExtractor: buildRunningHubVideoResultExtractor()
  };
}
function pushManifestNode(_0x4e0ced, _0x47959c, _0x13a2b7, _0x5cc3c2 = {}) {
  if (!_0x47959c?.nodeId || !_0x47959c?.fieldName) {
    return;
  }
  _0x4e0ced.push({
    nodeId: String(_0x47959c.nodeId),
    fieldName: String(_0x5cc3c2.fieldName || _0x47959c.fieldName),
    fieldValue: _0x13a2b7 === null ? null : String(_0x13a2b7),
    ...(_0x47959c.description || _0x5cc3c2.description ? {
      description: _0x5cc3c2.description || _0x47959c.description
    } : {})
  });
}
function getMappedValue(_0x2f5851, _0x58914b, _0x54b2f7 = "") {
  const _0x5d739c = String(_0x2f5851 ?? "").trim();
  const _0x35aa88 = _0x58914b?.valueMap || {};
  if (_0x5d739c && _0x35aa88[_0x5d739c] !== undefined) {
    return _0x35aa88[_0x5d739c];
  }
  if (_0x5d739c && _0x35aa88[_0x5d739c.toLowerCase()] !== undefined) {
    return _0x35aa88[_0x5d739c.toLowerCase()];
  }
  return _0x58914b?.defaultValue ?? _0x54b2f7;
}
async function resolveRunningHubVideoInput(_0x41ae06, _0x170b2e, {
  urlField = "videoUrl",
  fileField = "videoFile",
  missingMessage = "请接入源视频",
  uploadFailedMessage = "源视频上传失败"
} = {}) {
  let _0xe0ae7d = "";
  const _0x39edef = String(_0x41ae06[urlField] || "").trim();
  if (_0x39edef) {
    const {
      processInputVideos: _0x535e86
    } = await import("../videoUploadApi.js");
    try {
      const _0x3dc3a3 = await _0x535e86([_0x39edef], _0x170b2e, {
        strictUpload: true,
        apiUrl: getRunningHubWorkflowBaseUrl(_0x41ae06)
      });
      if (_0x3dc3a3.length > 0) {
        _0xe0ae7d = _0x3dc3a3[0];
      }
    } catch (_0x167719) {
      throw new Error(uploadFailedMessage, {
        cause: _0x167719
      });
    }
  } else if (_0x41ae06[fileField]) {
    const {
      uploadVideoToRunningHub: _0x1b523a
    } = await import("../videoUploadApi.js");
    _0xe0ae7d = await _0x1b523a(_0x41ae06[fileField], _0x170b2e, {
      apiUrl: getRunningHubWorkflowBaseUrl(_0x41ae06)
    });
  }
  if (!_0xe0ae7d) {
    throw new Error(_0x39edef || _0x41ae06[fileField] ? uploadFailedMessage : missingMessage);
  }
  return _0xe0ae7d;
}
async function resolveRunningHubOptionalVideoInput(_0x509fc8, _0x100799, _0x356e95) {
  const _0x24c006 = String(_0x509fc8[_0x356e95] || "").trim();
  if (!_0x24c006) {
    return "";
  }
  const {
    processInputVideos: _0x931b23
  } = await import("../videoUploadApi.js");
  const _0x1c53bc = await _0x931b23([_0x24c006], _0x100799, {
    strictUpload: true,
    apiUrl: getRunningHubWorkflowBaseUrl(_0x509fc8)
  });
  return String(_0x1c53bc?.[0] || "").trim();
}
async function resolveRunningHubAudioInput(_0x1fd02a, _0x25a9e5, {
  urlField = "audioUrl",
  fileField = "audioFile",
  required = false,
  missingMessage = "请接入音频"
} = {}) {
  let _0x4ace4b = "";
  const _0x5bb08a = String(_0x1fd02a[urlField] || "").trim();
  if (_0x5bb08a) {
    const {
      processInputAudios: _0x561e3f
    } = await import("../audioUploadApi.js");
    const _0x434c12 = await _0x561e3f([_0x5bb08a], _0x25a9e5, {
      apiUrl: getRunningHubWorkflowBaseUrl(_0x1fd02a)
    });
    if (_0x434c12.length > 0) {
      _0x4ace4b = _0x434c12[0];
    }
  } else if (_0x1fd02a[fileField]) {
    const {
      uploadAudioToRunningHub: _0x19a58a
    } = await import("../audioUploadApi.js");
    _0x4ace4b = await _0x19a58a(_0x1fd02a[fileField], _0x25a9e5, {
      apiUrl: getRunningHubWorkflowBaseUrl(_0x1fd02a)
    });
  }
  if (required && !_0x4ace4b) {
    throw new Error(missingMessage);
  }
  return _0x4ace4b;
}
async function resolveRunningHubFirstImageInput(_0x4e0ebf, _0x147789, _0x54b2cd, {
  field = "inputUrls",
  required = false,
  missingMessage = "请接入参考图",
  uploadFailedMessage = "参考图上传失败",
  compress = true
} = {}) {
  const _0xf0b9d0 = getManifestPayloadPathValue(_0x4e0ebf, field);
  const _0x3f245a = Array.isArray(_0xf0b9d0) ? _0xf0b9d0 : String(_0xf0b9d0 || "").trim() ? [_0xf0b9d0] : [];
  if (!_0x3f245a.length) {
    if (required) {
      throw new Error(missingMessage);
    }
    return "";
  }
  let _0x582d8d;
  try {
    _0x582d8d = await uploadModelApiMediaInputs("image", _0x3f245a, _0x54b2cd, {
      apiKey: _0x147789,
      apiUrl: getRunningHubWorkflowBaseUrl(_0x4e0ebf),
      fallbackProvider: "runninghub",
      strictUpload: true,
      uploadOptions: {
        applyInputQualityProfile: compress
      }
    });
  } catch (_0x54c300) {
    throw new Error(uploadFailedMessage, {
      cause: _0x54c300
    });
  }
  const _0x3274ed = String(_0x582d8d?.[0] || "").trim();
  if (!_0x3274ed) {
    throw new Error(uploadFailedMessage);
  }
  return _0x3274ed;
}
async function uploadRunningHubMediaInputs(_0x4fe383, _0x221ab0, _0xf0cbc7, _0x2f73f1, _0x2e6736, {
  uploadFailedMessage = "RunningHUB 素材上传失败"
} = {}) {
  try {
    return await uploadModelApiMediaInputs(_0x4fe383, _0x221ab0, _0x2e6736, {
      apiKey: _0x2f73f1,
      apiUrl: getRunningHubWorkflowBaseUrl(_0xf0cbc7),
      fallbackProvider: "runninghub",
      strictUpload: true
    });
  } catch (_0x172035) {
    throw new Error(uploadFailedMessage, {
      cause: _0x172035
    });
  }
}
function getRunningHubWorkflowResolverHelpers() {
  return {
    buildOpenApiVideoWorkflowRequest: buildOpenApiVideoWorkflowRequest,
    buildTaskCreateVideoWorkflowRequest: buildTaskCreateVideoWorkflowRequest,
    getMappedValue: getMappedValue,
    getRunningHubWorkflowBaseUrl: getRunningHubWorkflowBaseUrl,
    normalizeRhVideoFps: normalizeRhVideoFps,
    normalizeRhVideoResolution: normalizeRhVideoResolution,
    normalizeVideoMattingMaskModeIndex: normalizeVideoMattingMaskModeIndex,
    pushManifestNode: pushManifestNode,
    resolveRunningHubAudioInput: resolveRunningHubAudioInput,
    resolveRunningHubFirstImageInput: resolveRunningHubFirstImageInput,
    resolveRunningHubOptionalVideoInput: resolveRunningHubOptionalVideoInput,
    resolveRunningHubVideoInput: resolveRunningHubVideoInput,
    sourceVideoMissingMessage: RH_V54_SOURCE_VIDEO_MISSING_MESSAGE,
    sourceVideoUploadFailedMessage: RH_V54_SOURCE_VIDEO_UPLOAD_FAILED_MESSAGE,
    uploadRunningHubMediaInputs: uploadRunningHubMediaInputs
  };
}
async function buildVideoWorkflowRequestFromManifest({
  executionManifest: _0x476045,
  modelManifest = null,
  payload: _0x5efff9,
  finalPrompt: _0x19adee,
  apiKey: _0x3f8b20,
  ctx: _0x36f3d2
}) {
  if (!_0x476045 || _0x476045.adapterType !== "workflow") {
    return null;
  }
  const _0x19b153 = relaxCustomAiAppMediaNodeMappings(_0x476045.mapping || {}, {
    enabled: isImportedRunningHubAiAppManifest(modelManifest)
  });
  const _0x3ecd26 = String(_0x476045.extensions?.payloadResolver || "").trim();
  if (_0x3ecd26) {
    const _0x4c830d = getRunningHubWorkflowPayloadResolver(_0x3ecd26);
    if (!_0x4c830d) {
      throw new Error("Unsupported RunningHub workflow payloadResolver: " + _0x3ecd26);
    }
    return _0x4c830d({
      executionManifest: _0x476045,
      payload: _0x5efff9,
      finalPrompt: _0x19adee,
      apiKey: _0x3f8b20,
      ctx: _0x36f3d2,
      helpers: getRunningHubWorkflowResolverHelpers()
    });
  }
  const _0x483008 = await a27_0x1b284f({
    mapping: _0x19b153,
    payload: _0x5efff9,
    finalPrompt: _0x19adee,
    sourceResolvers: {
      imageInput: ({
        item: _0x563a28
      }) => resolveRunningHubFirstImageInput(_0x5efff9, _0x3f8b20, _0x36f3d2, {
        field: String(_0x563a28?.field || "inputUrls").trim(),
        required: _0x563a28?.required === true,
        missingMessage: _0x563a28?.missingMessage || "请接入参考图",
        uploadFailedMessage: _0x563a28?.uploadFailedMessage || "参考图上传失败",
        compress: _0x563a28?.compress !== false
      }),
      videoInput: ({
        item: _0x2e46d9
      }) => {
        const _0x3dc190 = String(_0x2e46d9?.urlField || _0x2e46d9?.field || "videoUrl").trim();
        const _0x2205a0 = String(_0x2e46d9?.fileField || "videoFile").trim();
        const _0x3527ff = String(_0x5efff9[_0x3dc190] || "").trim();
        const _0x3325bd = _0x5efff9[_0x2205a0];
        if (!_0x2e46d9?.required && !_0x3527ff && !_0x3325bd) {
          return "";
        }
        return resolveRunningHubVideoInput(_0x5efff9, _0x3f8b20, {
          urlField: _0x3dc190,
          fileField: _0x2205a0,
          missingMessage: _0x2e46d9?.missingMessage || "请接入源视频",
          uploadFailedMessage: _0x2e46d9?.uploadFailedMessage || "源视频上传失败"
        });
      },
      audioInput: ({
        item: _0x1b12bb
      }) => {
        const _0x294324 = String(_0x1b12bb?.urlField || _0x1b12bb?.field || "audioUrl").trim();
        const _0x179337 = String(_0x1b12bb?.fileField || "audioFile").trim();
        const _0x363a74 = String(_0x5efff9[_0x294324] || "").trim();
        const _0x427510 = _0x5efff9[_0x179337];
        if (!_0x1b12bb?.required && !_0x363a74 && !_0x427510) {
          return "";
        }
        return resolveRunningHubAudioInput(_0x5efff9, _0x3f8b20, {
          urlField: _0x294324,
          fileField: _0x179337,
          required: _0x1b12bb?.required === true,
          missingMessage: _0x1b12bb?.missingMessage || "请接入音频"
        });
      }
    },
    transforms: {
      normalizeRhVideoFps: _0x3e48ef => normalizeRhVideoFps(_0x3e48ef),
      normalizeRhVideoResolution: (_0x2fa2fc, _0x439209) => normalizeRhVideoResolution(_0x2fa2fc, Number.isFinite(Number(_0x439209.fallback)) ? Number(_0x439209.fallback) : RH_MIN_VIDEO_RESOLUTION)
    }
  });
  if (!_0x483008) {
    return null;
  }
  if (_0x476045.submitMode === "openapi-v2-ai-app") {
    return buildOpenApiVideoWorkflowRequest({
      executionManifest: _0x476045,
      payload: _0x5efff9,
      apiKey: _0x3f8b20,
      nodeInfoList: _0x483008
    });
  }
  if (_0x476045.submitMode === "runninghub-task-create") {
    return buildTaskCreateVideoWorkflowRequest({
      executionManifest: _0x476045,
      payload: _0x5efff9,
      apiKey: _0x3f8b20,
      nodeInfoList: _0x483008
    });
  }
  throw new Error("Unsupported RunningHub video workflow submitMode: " + _0x476045.submitMode);
}
export async function buildImageRequest(_0x387906, _0x33d0d1, _0x4e4901) {
  if (!_0x387906.model) {
    throw new Error("未指定模型，无法发起图像生成请求");
  }
  const _0x247fd8 = getRunningHubWorkflowProfileId(_0x387906);
  const _0x430764 = _0x4e4901.getProviderConfig(_0x247fd8 || "runninghubwf");
  const _0x4db035 = normalizeRunningHubModelApiProfileId(_0x247fd8 || _0x430764?.providerProfileId);
  const _0x1b27de = _0x387906.apiKey || _0x430764.apiKey;
  const _0x3e9c45 = {
    ..._0x387906,
    providerProfileId: _0x4db035,
    rhProviderProfileId: _0x4db035,
    runningHubApiUrl: resolveRunningHubModelApiBaseUrl(_0x4db035)
  };
  if (!_0x1b27de) {
    throw new Error("API Key 未配置，无法发起 RunningHUB 请求");
  }
  const _0x254900 = _0x4e4901.processInputImagesPreserveOrder || _0x4e4901.processInputImages;
  const _0x4a8cc3 = await _0x254900(_0x3e9c45.inputUrls, _0x1b27de, {
    applyInputQualityProfile: true,
    provider: "runninghub",
    strictUpload: true,
    apiUrl: _0x3e9c45.runningHubApiUrl
  });
  const _0x5e7b55 = Array.isArray(_0x4a8cc3) ? _0x4a8cc3.map(_0x361b80 => String(_0x361b80 || "").trim()) : [];
  const _0x11f6af = resolveModelExecution(_0x387906.model);
  const _0x58753f = await buildOpenApiAiAppWorkflowRequestFromManifest({
    executionManifest: _0x11f6af?.executionManifest,
    modelManifest: _0x11f6af?.modelManifest,
    payload: _0x3e9c45,
    finalPrompt: _0x33d0d1,
    finalUrls: _0x5e7b55,
    apiKey: _0x1b27de,
    ctx: _0x4e4901
  });
  if (_0x58753f) {
    return {
      ..._0x58753f,
      providerProfileId: _0x4db035,
      rhProviderProfileId: _0x4db035,
      runningHubApiUrl: _0x3e9c45.runningHubApiUrl
    };
  }
  throw new Error("RunningHub workflow manifest missing: " + _0x387906.model);
}
export async function buildVideoRequest(_0x197f4d, _0x275d53, _0xce044d) {
  const _0x1d69b4 = getRunningHubWorkflowProfileId(_0x197f4d);
  const _0x437271 = _0xce044d.getProviderConfig(_0x1d69b4 || "runninghubwf");
  const _0x59a656 = normalizeRunningHubModelApiProfileId(_0x1d69b4 || _0x437271?.providerProfileId);
  const _0x176509 = _0x197f4d.apiKey || _0x437271.apiKey;
  const _0x2d674d = {
    ..._0x197f4d,
    providerProfileId: _0x59a656,
    rhProviderProfileId: _0x59a656,
    runningHubApiUrl: resolveRunningHubModelApiBaseUrl(_0x59a656)
  };
  if (!_0x176509) {
    throw new Error("API Key 未配置，无法发起 RunningHUB 视频生成请求");
  }
  const _0x9c4d64 = resolveModelExecution(_0x197f4d.model);
  const _0xbdacb3 = await buildVideoWorkflowRequestFromManifest({
    executionManifest: _0x9c4d64?.executionManifest,
    modelManifest: _0x9c4d64?.modelManifest,
    payload: _0x2d674d,
    finalPrompt: _0x275d53,
    apiKey: _0x176509,
    ctx: _0xce044d
  });
  if (_0xbdacb3) {
    return {
      ..._0xbdacb3,
      providerProfileId: _0x59a656,
      rhProviderProfileId: _0x59a656,
      runningHubApiUrl: _0x2d674d.runningHubApiUrl
    };
  }
  throw new Error("RunningHub video workflow manifest missing: " + _0x197f4d.model);
}
export async function buildModelRequest(_0x5e8af6, _0x2a6fff, _0x58adf6) {
  const _0x1909f0 = await buildImageRequestFromManifest(_0x5e8af6, _0x2a6fff, _0x58adf6, {
    expectedProvider: "runninghub"
  });
  if (_0x1909f0) {
    return _0x1909f0;
  }
  throw new Error("RunningHub model API manifest missing: " + _0x5e8af6.model);
}