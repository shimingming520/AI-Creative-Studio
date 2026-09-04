import { graphStore } from "../../core/stores/appStore.js";
import { generateId, screenToWorld } from "../../core/math.js";
import { sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { getAIGenerationDefaultSizeByType } from "../../services/fileService.js";
import { bindUiSchemaFieldControls, renderModelUiSchemaControls, renderUiSchemaFields } from "../../components/aigenImage/uiSchemaRenderer.js";
import { commit } from "../history.js";
import { closeAllSidebarSubmenus } from "../sidebarSubmenuController.js";
import { createRunningHubAiAppContextMenuController } from "./runningHubAiAppContextMenu.js";
import { RH_AI_APP_FOOTER_PARAM_LIMIT, buildRunningHubAiAppManifestBundle, createRunningHubAiAppComponentDrafts, summarizeRunningHubAiAppBundle } from "./rhAiAppImport.js";
import { buildComfyUiWorkflowManifestBundle, createComfyUiWorkflowComponentDrafts, formatComfyUiComponentLabel, summarizeComfyUiWorkflowBundle } from "../comfyuiWorkflow/comfyUiWorkflowImport.js";
import { renderComfyUiLocalWorkflowLogoHtml, renderRunningHubAiAppLogoHtml } from "../../components/shared/customAiAppLogo.js";
import { RH_AI_APP_VIP_MODEL_ID } from "../subscriptionAccess.js";
import { RUNNINGHUB_DOMESTIC_PROFILE_ID, RUNNINGHUB_INTERNATIONAL_PROFILE_ID, normalizeRunningHubModelApiProfileId } from "../runningHubProviderProfiles.js";
import { getRunningHubInstanceTypeLabel } from "../runningHubInstanceTypes.js";
import { createRhAiAppConfigRepository } from "./rhAiAppConfigRepository.js";
import { createRhAiAppPreviewDragController } from "./rhAiAppPreviewDragController.js";
import { createRhAiAppPreviewPresentation } from "./rhAiAppPreviewPresentation.js";
import { getDefaultRunningHubProfileId, getRunningHubProfileShortLabel, syncRunningHubProfileBadge } from "./rhAiAppRunningHubProfile.js";
import { createCustomAiAppNodeBundleRegistry, getCustomAiAppBundleKey as a1198_0x19751b, getCustomAiAppBundleModelId as a1198_0x86bd7d, projectCustomAiAppBundleForNodeRuntime, registerCustomAiAppBundle as a1198_0x19c24e, unregisterCustomAiAppBundle as a1198_0x3b122f } from "./customAiAppNodeBundleRegistry.js";
const OUTPUT_KIND_LABELS = Object.freeze({
  image: "图像",
  video: "视频",
  audio: "音频"
});
const NODE_TYPE_BY_KIND = Object.freeze({
  image: "ai-image",
  video: "ai-video",
  audio: "ai-audio"
});
const COMPONENT_KIND_LABELS = Object.freeze({
  image: "图像入参",
  video: "视频入参",
  audio: "音频入参",
  prompt: "提示词",
  param: "参数"
});
const COMPONENT_KIND_OPTIONS = Object.freeze([["image", "图像入参"], ["video", "视频入参"], ["audio", "音频入参"], ["prompt", "提示词"], ["param", "参数"]]);
const CONTROL_TYPE_LABELS = Object.freeze({
  text: "短文本",
  textarea: "长文本",
  stepper: "整数",
  float: "浮点数",
  toggle: "布尔",
  prompt: "提示词"
});
const CONTROL_TYPE_OPTIONS = Object.freeze([["text", "短文本"], ["textarea", "长文本"], ["stepper", "整数"], ["float", "浮点数"], ["toggle", "布尔"], ["prompt", "提示词"]]);
const MEDIA_COMPONENT_KINDS = new Set(["image", "video", "audio"]);
const SOURCE_TYPES = Object.freeze({
  runninghub: "runninghub-ai-app",
  comfyuiLocal: "comfyui-local-workflow",
  comfyuiCloud: "comfyui-cloud-workflow"
});
const SOURCE_TYPE_KEYS = Object.freeze(Object.values(SOURCE_TYPES));
const COMFYUI_WORKFLOW_STATE_SCOPE = "comfyui-workflow";
const COMFY_UI_WORKFLOW_SHARED_SOURCE_META = Object.freeze({
  label: "ComfyUI 工作流",
  subtitle: "粘贴 ComfyUI API workflow，选择本地或云端运行环境",
  inputLabel: "ComfyUI API workflow JSON",
  inputPlaceholder: "粘贴 ComfyUI API format workflow JSON",
  emptyText: "粘贴 ComfyUI API workflow JSON 后，点击添加组件逐行加入节点组件编辑。",
  saveSuccess: "ComfyUI 工作流配置已保存",
  saveFailed: "ComfyUI 工作流配置保存失败",
  deleteSuccess: "ComfyUI 工作流配置已删除",
  createSuccess: "ComfyUI 工作流节点已创建",
  createFailed: "ComfyUI 工作流节点创建失败"
});
const SOURCE_TYPE_META = Object.freeze({
  [SOURCE_TYPES.runninghub]: Object.freeze({
    id: SOURCE_TYPES.runninghub,
    label: "RH AI应用",
    subtitle: "RunningHub AI App 生成节点界面",
    inputLabel: "RunningHub 请求",
    inputPlaceholder: "粘贴 openapi/v2/run/ai-app 的 curl 或 JSON",
    emptyText: "粘贴 RunningHub AI App curl 或 JSON 后自动解析。",
    saveSuccess: "RH AI应用配置已保存",
    saveFailed: "RH AI应用配置保存失败",
    deleteSuccess: "RH AI应用配置已删除",
    createSuccess: "RH AI应用节点已创建",
    createFailed: "RH AI应用节点创建失败"
  }),
  [SOURCE_TYPES.comfyuiLocal]: Object.freeze({
    id: SOURCE_TYPES.comfyuiLocal,
    ...COMFY_UI_WORKFLOW_SHARED_SOURCE_META
  }),
  [SOURCE_TYPES.comfyuiCloud]: Object.freeze({
    id: SOURCE_TYPES.comfyuiCloud,
    ...COMFY_UI_WORKFLOW_SHARED_SOURCE_META
  })
});
const PREVIEW_CUSTOM_COMPONENT_LIMIT = RH_AI_APP_FOOTER_PARAM_LIMIT;
const PREVIEW_DROP_ZONES = Object.freeze(["input", "prompt", "params", "advanced"]);
const PREVIEW_TEXT_TYPE_VALUES = Object.freeze(["prompt", "text", "textarea"]);
const PREVIEW_PARAM_TEXT_TYPE_VALUES = Object.freeze(["text", "textarea"]);
const PREVIEW_PROMPT_HELP_FIELD_NAMES = Object.freeze(["提示词", "prompt", "提示词.value", "prompt.value", "positive prompt", "positive_prompt"]);
const PREVIEW_DRAG_START_THRESHOLD_PX = 10;
const PREVIEW_RENAME_CLICK_TOLERANCE_PX = 3;
const PREVIEW_MOVE_ANIMATION_MS = 260;
const INPUT_SLOT_LABEL_MAX_WIDTH_UNITS = 18;
const INPUT_SLOT_LABEL_INPUT_MAX_LENGTH = 24;
const INPUT_SLOT_LABEL_WIDE_CHAR_RE = /[^\u0000-\u00ff]/u;
const INPUT_SLOT_LABEL_LATIN_RE = /^[\u0000-\u007f]+$/u;
const SOURCE_PAGE_ANIMATION_MS = 280;
const RH_AI_APP_EXIT_MOTION_MS = 180;
const DEFAULT_AI_APP_NAME = "未命名 AI应用";
const JSON_FILE_EXTENSION_RE = /\.json$/i;
const RH_AI_APP_VIP_PROVIDER = "runninghubwf";
function escapeHtml(_0x2eee90) {
  return String(_0x2eee90 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeKind(_0x3c8123) {
  if (Object.hasOwn(OUTPUT_KIND_LABELS, _0x3c8123)) {
    return _0x3c8123;
  } else {
    return "image";
  }
}
function normalizeSourceType(_0x375f5b) {
  const _0x57e751 = String(_0x375f5b || "").trim();
  if (SOURCE_TYPE_KEYS.includes(_0x57e751)) {
    return _0x57e751;
  } else {
    return "";
  }
}
function getSourceMeta(_0xbf9ac5) {
  return SOURCE_TYPE_META[normalizeSourceType(_0xbf9ac5)] || null;
}
function isComfyUiSource(_0x2b974b) {
  const _0x2c9c68 = normalizeSourceType(_0x2b974b);
  return _0x2c9c68 === SOURCE_TYPES.comfyuiLocal || _0x2c9c68 === SOURCE_TYPES.comfyuiCloud;
}
function getComfyUiBaseUrlMode(_0x3860e3) {
  if (normalizeSourceType(_0x3860e3) === SOURCE_TYPES.comfyuiCloud) {
    return "cloud";
  } else {
    return "local";
  }
}
function getComfyUiSourceTypeFromBaseUrlMode(_0x8e72dd) {
  if (String(_0x8e72dd || "").trim().toLowerCase() === "cloud") {
    return SOURCE_TYPES.comfyuiCloud;
  } else {
    return SOURCE_TYPES.comfyuiLocal;
  }
}
function getComfyUiBaseUrlModeLabel(_0xf0e902) {
  if (getComfyUiBaseUrlMode(_0xf0e902) === "cloud") {
    return "云端";
  } else {
    return "本地";
  }
}
function shouldReduceMotion() {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  } catch {
    return false;
  }
}
function normalizeComponentKind(_0x5c0d8c) {
  if (Object.hasOwn(COMPONENT_KIND_LABELS, _0x5c0d8c)) {
    return _0x5c0d8c;
  } else {
    return "param";
  }
}
function normalizeControlType(_0x5ba354) {
  const _0x1e1eef = String(_0x5ba354 || "").trim().toLowerCase();
  if (_0x1e1eef === "integer" || _0x1e1eef === "number") {
    return "stepper";
  }
  if (_0x1e1eef === "decimal") {
    return "float";
  }
  if (_0x1e1eef === "boolean" || _0x1e1eef === "bool") {
    return "toggle";
  }
  if (Object.hasOwn(CONTROL_TYPE_LABELS, _0x1e1eef)) {
    return _0x1e1eef;
  } else {
    return "text";
  }
}
function cloneComponentDrafts(_0x463475 = []) {
  if (Array.isArray(_0x463475)) {
    return _0x463475.map(_0x37cc9c => ({
      ..._0x37cc9c
    }));
  } else {
    return [];
  }
}
function normalizeAppName(_0x59ef3e) {
  const _0x88b294 = String(_0x59ef3e || "").trim();
  return _0x88b294 || DEFAULT_AI_APP_NAME;
}
function normalizeDroppedJsonAppName(_0x293b2d) {
  const _0x4f8e32 = String(_0x293b2d || "").split(/[\\/]/).pop().replace(JSON_FILE_EXTENSION_RE, "").trim();
  return normalizeAppName(_0x4f8e32);
}
function isJsonFile(_0x5f47ed) {
  const _0x48edbe = String(_0x5f47ed?.name || "").trim();
  const _0x530e65 = String(_0x5f47ed?.type || "").trim().toLowerCase();
  return JSON_FILE_EXTENSION_RE.test(_0x48edbe) || _0x530e65 === "application/json";
}
function hasFileDragPayload(_0x59fdea) {
  return Array.from(_0x59fdea?.dataTransfer?.types || []).some(_0x38e1b2 => String(_0x38e1b2 || "").toLowerCase() === "files");
}
function normalizeAppDescription(_0x11f9bf) {
  return String(_0x11f9bf || "").trim();
}
function normalizePromptHelpTooltip(_0x348c3f) {
  return String(_0x348c3f || "").trim();
}
function getBundleDisplayName(_0x147cd4) {
  return normalizeAppName(_0x147cd4?.models?.[0]?.displayName);
}
function getCanvasCenterWorld(_0xdae680 = null) {
  const {
    viewport: _0x1f736d
  } = graphStore.getState();
  const _0x541625 = window.innerWidth / 2;
  const _0x5855eb = window.innerHeight / 2;
  const _0x52b6f4 = document.documentElement?.clientWidth || window.innerWidth || 0;
  const _0x38dde7 = document.documentElement?.clientHeight || window.innerHeight || 0;
  if (!_0x52b6f4 || !_0x38dde7) {
    return screenToWorld(_0x541625, _0x5855eb, _0x1f736d);
  }
  let _0x5c2333 = 0;
  let _0x2df250 = 0;
  let _0xd611a5 = _0x52b6f4;
  let _0x21d144 = _0x38dde7;
  const _0x53441d = [document.querySelector("header"), document.querySelector(".sidebar-floating"), _0xdae680?.classList?.contains("is-open") ? _0xdae680 : null].filter(Boolean);
  const _0x449602 = 8;
  for (const _0x11322c of _0x53441d) {
    if (!_0x11322c?.isConnected) {
      continue;
    }
    const _0x211b12 = _0x11322c.getBoundingClientRect();
    const _0x399d34 = Math.max(_0x5c2333, _0x211b12.left);
    const _0xb794c1 = Math.max(_0x2df250, _0x211b12.top);
    const _0x3ae37a = Math.min(_0xd611a5, _0x211b12.right);
    const _0xca6782 = Math.min(_0x21d144, _0x211b12.bottom);
    if (_0x3ae37a <= _0x399d34 || _0xca6782 <= _0xb794c1) {
      continue;
    }
    if (_0x211b12.left <= _0x5c2333 + _0x449602 && _0x211b12.right > _0x5c2333 + _0x449602) {
      _0x5c2333 = Math.max(_0x5c2333, _0x211b12.right);
      continue;
    }
    if (_0x211b12.right >= _0xd611a5 - _0x449602 && _0x211b12.left < _0xd611a5 - _0x449602) {
      _0xd611a5 = Math.min(_0xd611a5, _0x211b12.left);
      continue;
    }
    if (_0x211b12.top <= _0x2df250 + _0x449602 && _0x211b12.bottom > _0x2df250 + _0x449602) {
      _0x2df250 = Math.max(_0x2df250, _0x211b12.bottom);
      continue;
    }
    if (_0x211b12.bottom >= _0x21d144 - _0x449602 && _0x211b12.top < _0x21d144 - _0x449602) {
      _0x21d144 = Math.min(_0x21d144, _0x211b12.top);
    }
  }
  const _0x28d86e = _0xd611a5 - _0x5c2333;
  const _0x521929 = _0x21d144 - _0x2df250;
  const _0x3180ad = _0x28d86e > 40 ? _0x5c2333 + _0x28d86e / 2 : _0x541625;
  const _0x5b87e1 = _0x521929 > 40 ? _0x2df250 + _0x521929 / 2 : _0x5855eb;
  return screenToWorld(_0x3180ad, _0x5b87e1, _0x1f736d);
}
function getGenerationNodeSize(_0x44a232) {
  if (_0x44a232 === "ai-audio") {
    return {
      width: 420,
      height: 180
    };
  }
  return getAIGenerationDefaultSizeByType(_0x44a232);
}
function buildRhAiAppNodeData({
  bundle: _0x401aee,
  kind: _0x1ec7d0,
  center: _0x504b05,
  runningHubProfileId = ""
}) {
  const _0x325325 = NODE_TYPE_BY_KIND[_0x1ec7d0] || "ai-image";
  const _0x35a3ac = a1198_0x86bd7d(_0x401aee);
  const _0x128530 = getBundleDisplayName(_0x401aee);
  const _0x5add05 = _0x401aee?.models?.[0]?.provider || "runninghubwf";
  const _0x3de92b = _0x5add05 === "runninghubwf" ? normalizeRunningHubModelApiProfileId(runningHubProfileId) : "";
  const _0x6ea95d = getGenerationNodeSize(_0x325325);
  const _0x5522f9 = sanitizeModelUiSchemaParams(_0x35a3ac, {}, {
    includeDefaults: true
  });
  const _0x3d0a0b = {
    id: generateId(_0x325325),
    type: _0x325325,
    x: Math.round(_0x504b05.x - _0x6ea95d.width / 2),
    y: Math.round(_0x504b05.y - _0x6ea95d.height / 2),
    width: _0x6ea95d.width,
    height: _0x6ea95d.height,
    name: _0x128530,
    model: _0x35a3ac,
    provider: _0x5add05,
    generationParams: _0x5522f9,
    generationParamsByModel: {
      [_0x35a3ac]: _0x5522f9
    },
    ...(_0x3de92b ? {
      providerProfileId: _0x3de92b,
      rhProviderProfileId: _0x3de92b
    } : {}),
    rhAiAppManifestBundle: projectCustomAiAppBundleForNodeRuntime(_0x401aee)
  };
  if (_0x325325 === "ai-image" || _0x325325 === "ai-video") {
    _0x3d0a0b.aspectRatio = "自适应";
  }
  if (_0x325325 === "ai-audio") {
    _0x3d0a0b.audioWorkflowKey = _0x35a3ac;
    _0x3d0a0b.audioWorkflowLabel = _0x128530;
  }
  return _0x3d0a0b;
}
function renderSummaryHtml(_0x2e5e81, _0x3d034a = SOURCE_TYPE_META[SOURCE_TYPES.runninghub].emptyText) {
  if (!_0x2e5e81?.modelId) {
    return "<div class=\"rh-ai-app-empty\">" + escapeHtml(_0x3d034a) + "</div>";
  }
  const _0x17aa63 = _0x2e5e81.slots.length ? _0x2e5e81.slots.map(_0x431d91 => "<span class=\"rh-ai-app-chip\">" + escapeHtml(OUTPUT_KIND_LABELS[_0x431d91.kind] || _0x431d91.kind) + " · " + escapeHtml(_0x431d91.label) + "</span>").join("") : "<span class=\"rh-ai-app-muted\">无媒体入参槽</span>";
  const _0x1bc22a = _0x2e5e81.params.length ? _0x2e5e81.params.map(_0xa2edcd => "<span class=\"rh-ai-app-chip\">" + escapeHtml(_0xa2edcd.label) + "</span>").join("") : "<span class=\"rh-ai-app-muted\">无额外参数</span>";
  return "\n    <div class=\"rh-ai-app-summary-card\">\n      <div class=\"rh-ai-app-summary-top\">\n        <span>App ID</span>\n        <strong>" + escapeHtml(_0x2e5e81.appId) + "</strong>\n      </div>\n      <div class=\"rh-ai-app-summary-row\">\n        <span>节点类型</span>\n        <strong>" + escapeHtml(OUTPUT_KIND_LABELS[_0x2e5e81.kind] || _0x2e5e81.kind) + "</strong>\n      </div>\n      <div class=\"rh-ai-app-summary-group\">\n        <div class=\"rh-ai-app-summary-label\">入参槽</div>\n        <div class=\"rh-ai-app-chip-row\">" + _0x17aa63 + "</div>\n      </div>\n      <div class=\"rh-ai-app-summary-group\">\n        <div class=\"rh-ai-app-summary-label\">参数</div>\n        <div class=\"rh-ai-app-chip-row\">" + _0x1bc22a + "</div>\n      </div>\n    </div>";
}
function renderOptionsHtml(_0x583f0a, _0x504b6d) {
  const _0x167b06 = String(_0x504b6d || "");
  return _0x583f0a.map(([_0x1613af, _0x30d667]) => {
    const _0x15dabb = String(_0x1613af) === _0x167b06 ? " selected" : "";
    return "<option value=\"" + escapeHtml(_0x1613af) + "\"" + _0x15dabb + ">" + escapeHtml(_0x30d667) + "</option>";
  }).join("");
}
function getOptionLabel(_0x535bc6 = [], _0x2e8329 = "") {
  const _0xf420c = String(_0x2e8329 || "");
  const _0x547ef7 = _0x535bc6.find(([_0x47ae74]) => String(_0x47ae74) === _0xf420c);
  return String(_0x547ef7?.[1] || _0xf420c || "");
}
function buildOptionsFromValues(_0x3837c7 = [], _0x2e1215 = {}) {
  return (Array.isArray(_0x3837c7) ? _0x3837c7 : []).map(_0x50446e => String(_0x50446e || "").trim()).filter((_0x560585, _0x2031e1, _0xdafe96) => _0x560585 && _0xdafe96.indexOf(_0x560585) === _0x2031e1).filter(_0xcb5bd0 => Object.hasOwn(_0x2e1215, _0xcb5bd0)).map(_0x25dd1b => [_0x25dd1b, _0x2e1215[_0x25dd1b]]);
}
function getComponentKindOptions(_0x190120, _0x49b747) {
  const _0x19e534 = buildOptionsFromValues(_0x190120?.componentKindOptions, COMPONENT_KIND_LABELS);
  if (_0x19e534.length) {
    return _0x19e534;
  }
  if (_0x190120?.componentKindLocked === true || isMediaComponent(_0x190120)) {
    return [[_0x49b747, COMPONENT_KIND_LABELS[_0x49b747] || _0x49b747]];
  }
  return COMPONENT_KIND_OPTIONS.filter(([_0x4fa130]) => _0x4fa130 === "param" || _0x4fa130 === "prompt");
}
function getControlTypeOptions(_0x2876f4, _0x63918) {
  const _0x48d4d6 = buildOptionsFromValues(_0x2876f4?.controlTypeOptions, CONTROL_TYPE_LABELS);
  if (_0x48d4d6.length) {
    return _0x48d4d6;
  }
  if (_0x2876f4?.controlTypeLocked === true) {
    return [[_0x63918, CONTROL_TYPE_LABELS[_0x63918] || _0x63918]];
  }
  return CONTROL_TYPE_OPTIONS.filter(([_0x42e582]) => _0x42e582 !== "toggle" && _0x42e582 !== "prompt");
}
function getPreviewTextTypeOptions(_0x586e00) {
  if (!_0x586e00 || isMediaComponent(_0x586e00)) {
    return [];
  }
  const _0x3fd3cf = normalizeComponentKind(_0x586e00.componentKind);
  const _0x16b00a = normalizeControlType(_0x586e00.controlType);
  const _0x25fd5e = getControlTypeOptions(_0x586e00, _0x16b00a);
  const _0xe3ffa2 = getComponentKindOptions(_0x586e00, _0x3fd3cf);
  return PREVIEW_TEXT_TYPE_VALUES.filter(_0x1d00da => {
    if (_0x1d00da === "prompt") {
      return _0x16b00a === "prompt" || optionValuesInclude(_0x25fd5e, "prompt") || optionValuesInclude(_0xe3ffa2, "prompt");
    }
    return _0x16b00a === _0x1d00da || optionValuesInclude(_0x25fd5e, _0x1d00da);
  }).map(_0x40acc2 => [_0x40acc2, CONTROL_TYPE_LABELS[_0x40acc2] || _0x40acc2]);
}
function optionValuesInclude(_0x4e7380 = [], _0x1a770c = "") {
  const _0x1c5e16 = String(_0x1a770c || "").trim();
  return _0x4e7380.some(([_0x22ebfe]) => String(_0x22ebfe) === _0x1c5e16);
}
function previewTextTypeOptionsInclude(_0x5e7abc, _0x31bd24) {
  return optionValuesInclude(getPreviewTextTypeOptions(_0x5e7abc), _0x31bd24);
}
function canPreviewComponentBecomePrompt(_0x2600bb) {
  if (!_0x2600bb || isMediaComponent(_0x2600bb)) {
    return false;
  }
  if (normalizeComponentKind(_0x2600bb.componentKind) === "prompt") {
    return true;
  }
  const _0x2c7f1f = normalizeControlType(_0x2600bb.controlType);
  if (!PREVIEW_PARAM_TEXT_TYPE_VALUES.includes(_0x2c7f1f)) {
    return false;
  }
  return previewTextTypeOptionsInclude(_0x2600bb, "prompt");
}
function canPreviewPromptBecomeParam(_0x4212e0) {
  if (normalizeComponentKind(_0x4212e0?.componentKind) !== "prompt") {
    return false;
  }
  return PREVIEW_PARAM_TEXT_TYPE_VALUES.some(_0x1b08b0 => previewTextTypeOptionsInclude(_0x4212e0, _0x1b08b0));
}
function getPreviewPromptReturnControlType(_0x35fdd1, _0x25b95b = "") {
  const _0x53a770 = normalizeControlType(_0x25b95b);
  if (PREVIEW_PARAM_TEXT_TYPE_VALUES.includes(_0x53a770) && previewTextTypeOptionsInclude(_0x35fdd1, _0x53a770)) {
    return _0x53a770;
  }
  return PREVIEW_PARAM_TEXT_TYPE_VALUES.find(_0x3ad0ec => previewTextTypeOptionsInclude(_0x35fdd1, _0x3ad0ec)) || "";
}
function renderPreviewTypeBarHtml(_0x550985, {
  canRemove = false
} = {}) {
  const _0x26fd4d = Number(_0x550985?.index);
  if (!Number.isInteger(_0x26fd4d)) {
    return "";
  }
  const _0x279a02 = getPreviewTextTypeOptions(_0x550985);
  const _0x488fd8 = isParamComponent(_0x550985);
  const _0x5a46ff = isMediaComponent(_0x550985);
  const _0x5b8f68 = _0x488fd8 || _0x5a46ff;
  const _0x36695b = _0x488fd8 || normalizeComponentKind(_0x550985?.componentKind) === "prompt";
  const _0x37f6d5 = _0x488fd8 && canRemove === true;
  const _0x390db1 = _0x5a46ff && canRemove === true;
  if (!_0x279a02.length && !_0x5b8f68 && !_0x36695b && !_0x390db1) {
    return "";
  }
  const _0x4bb41b = normalizeComponentKind(_0x550985.componentKind) === "prompt" ? "prompt" : normalizeControlType(_0x550985.controlType);
  const _0x2863ca = _0x5a46ff ? "入参槽" : "参数";
  const _0x290bca = _0x550985?.label || _0x550985?.fieldName || _0x2863ca;
  const _0x5eac46 = _0x5b8f68 ? "<button type=\"button\" class=\"rh-ai-app-preview-typebar-action rh-ai-app-preview-typebar-rename\" data-action=\"rename-preview-param\" data-preview-component-index=\"" + _0x26fd4d + "\" aria-label=\"重命名" + _0x2863ca + " " + escapeHtml(_0x290bca) + "\">重命名</button>" : "";
  const _0x2a81e9 = _0x36695b ? "<button type=\"button\" class=\"rh-ai-app-preview-typebar-action rh-ai-app-preview-typebar-remark\" data-action=\"edit-preview-description\" data-preview-component-index=\"" + _0x26fd4d + "\" aria-label=\"修改备注 " + escapeHtml(_0x290bca) + "\">改备注</button>" : "";
  const _0x443589 = _0x279a02.map(([_0x305377, _0x1ea0d2]) => {
    const _0x443fe2 = String(_0x305377) === _0x4bb41b;
    return "<button type=\"button\" class=\"rh-ai-app-preview-typebar-option " + (_0x443fe2 ? "active" : "") + "\" data-action=\"choose-preview-control-type\" data-preview-component-index=\"" + _0x26fd4d + "\" data-value=\"" + escapeHtml(_0x305377) + "\" aria-pressed=\"" + (_0x443fe2 ? "true" : "false") + "\">" + escapeHtml(_0x1ea0d2) + "</button>";
  }).join("");
  const _0xf49457 = (_0x37f6d5 || _0x390db1) && !_0x443589 ? "<span class=\"rh-ai-app-preview-typebar-separator\" aria-hidden=\"true\">|</span>" : "";
  const _0x9ea4f9 = _0x5a46ff ? "remove-preview-input" : "remove-preview-param";
  const _0x585309 = _0x37f6d5 || _0x390db1 ? "<button type=\"button\" class=\"rh-ai-app-preview-typebar-action rh-ai-app-preview-typebar-delete\" data-action=\"" + _0x9ea4f9 + "\" data-preview-component-index=\"" + _0x26fd4d + "\" aria-label=\"删除" + _0x2863ca + " " + escapeHtml(_0x290bca) + "\">×</button>" : "";
  return "<div class=\"rh-ai-app-preview-typebar\" aria-label=\"组件工具栏\">" + _0x5eac46 + _0x2a81e9 + _0x443589 + _0xf49457 + _0x585309 + "</div>";
}
function renderFixedTypeLabelHtml(_0x3e6657, _0x11db16 = "") {
  return "<div class=\"rh-ai-app-component-fixed-type " + _0x11db16 + "\" aria-disabled=\"true\">\n    <span>" + escapeHtml(_0x3e6657) + "</span>\n  </div>";
}
function renderComponentSelectHtml({
  className = "",
  ariaLabel = "",
  prop = "",
  options = [],
  activeValue = ""
} = {}) {
  const _0x238aad = String(activeValue || "");
  const _0x4e1259 = getOptionLabel(options, _0x238aad);
  const _0x548da1 = options.map(([_0x3e8168, _0x3ae6fe]) => {
    const _0x3e974b = String(_0x3e8168) === _0x238aad;
    return "\n        <button type=\"button\" class=\"rh-ai-app-select-option " + (_0x3e974b ? "active" : "") + "\" data-action=\"choose-component-select\" data-component-prop=\"" + escapeHtml(prop) + "\" data-value=\"" + escapeHtml(_0x3e8168) + "\" role=\"option\" aria-selected=\"" + (_0x3e974b ? "true" : "false") + "\" tabindex=\"-1\">\n          <span>" + escapeHtml(_0x3ae6fe) + "</span>\n        </button>";
  }).join("");
  return "\n    <div class=\"rh-ai-app-select " + className + "\" data-component-select data-component-prop=\"" + escapeHtml(prop) + "\">\n      <button type=\"button\" class=\"rh-ai-app-select-trigger\" data-action=\"toggle-component-select\" data-component-prop=\"" + escapeHtml(prop) + "\" aria-label=\"" + escapeHtml(ariaLabel) + "\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n        <span>" + escapeHtml(_0x4e1259) + "</span>\n        <svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"m4 6 4 4 4-4\"></path></svg>\n      </button>\n      <div class=\"rh-ai-app-select-menu\" role=\"listbox\">\n        " + _0x548da1 + "\n      </div>\n    </div>";
}
function isMediaComponent(_0x4465d6) {
  return MEDIA_COMPONENT_KINDS.has(normalizeComponentKind(_0x4465d6?.componentKind));
}
function isParamComponent(_0x50cbf0) {
  return normalizeComponentKind(_0x50cbf0?.componentKind) === "param";
}
function getParamComponents(_0x404b98 = []) {
  return _0x404b98.filter(_0x199b30 => {
    if (!_0x199b30 || !Number.isInteger(Number(_0x199b30.index))) {
      return false;
    }
    return isParamComponent(_0x199b30);
  });
}
function getPreviewParamText(_0x1f23ca) {
  return String(_0x1f23ca?.label || _0x1f23ca?.fieldName || "参数").trim();
}
function getPreviewResolutionText(_0x377bad = []) {
  const _0x4d999c = getParamComponents(_0x377bad).find(_0x176d4a => {
    const _0x38036e = String(_0x176d4a?.defaultValue || "").trim();
    return _0x38036e && /^\d+(?:\.\d+)?$/.test(_0x38036e);
  });
  if (!_0x4d999c) {
    return "自适应";
  }
  return getPreviewParamText(_0x4d999c);
}
function getPreviewInstanceText(_0x242187) {
  const _0x233551 = _0x242187?.models?.[0]?.uiSchema?.fields || [];
  const _0x2d9e67 = _0x233551.find(_0x59ac84 => _0x59ac84?.id === "rhInstanceType");
  if (!_0x2d9e67) {
    return "";
  }
  return getRunningHubInstanceTypeLabel(_0x2d9e67?.defaultValue);
}
function normalizeOrderValue(_0x4824d4, _0x28acf5) {
  const _0x44aeb6 = Number(_0x4824d4);
  if (Number.isFinite(_0x44aeb6)) {
    return _0x44aeb6;
  } else {
    return _0x28acf5;
  }
}
function sortComponentsByOrder(_0x10bc01 = [], _0x2fab84) {
  return [..._0x10bc01].sort((_0x424148, _0x1b314e) => {
    const _0x31b6f6 = Number(_0x424148?.index);
    const _0x28aac1 = Number(_0x1b314e?.index);
    const _0x1db05e = normalizeOrderValue(_0x424148?.[_0x2fab84], _0x31b6f6);
    const _0x23f45c = normalizeOrderValue(_0x1b314e?.[_0x2fab84], _0x28aac1);
    if (_0x1db05e !== _0x23f45c) {
      return _0x1db05e - _0x23f45c;
    }
    return _0x31b6f6 - _0x28aac1;
  });
}
function getPreviewInputComponents(_0x2b6860 = []) {
  return sortComponentsByOrder(_0x2b6860.filter(_0x65ac7e => _0x65ac7e && Number.isInteger(Number(_0x65ac7e.index)) && isMediaComponent(_0x65ac7e)), "inputOrder");
}
function getInputSlotLabelWidthUnits(_0xb3703) {
  if (!_0xb3703) {
    return 0;
  }
  if (/\s/u.test(_0xb3703)) {
    return 0.5;
  }
  if (INPUT_SLOT_LABEL_WIDE_CHAR_RE.test(_0xb3703)) {
    return 2;
  } else {
    return 1;
  }
}
function clampInputSlotLabel(_0x6e7c42, _0x32f074 = INPUT_SLOT_LABEL_MAX_WIDTH_UNITS) {
  let _0x190786 = 0;
  let _0x2e31bc = "";
  for (const _0x227d35 of Array.from(String(_0x6e7c42 ?? "").trim())) {
    const _0x13ca49 = getInputSlotLabelWidthUnits(_0x227d35);
    if (_0x190786 + _0x13ca49 > _0x32f074) {
      break;
    }
    _0x2e31bc += _0x227d35;
    _0x190786 += _0x13ca49;
  }
  return _0x2e31bc;
}
function normalizeInputSlotLabel(_0x55f125, _0x4d647e = "组件") {
  const _0x3fa390 = clampInputSlotLabel(_0x55f125);
  if (_0x3fa390) {
    return _0x3fa390;
  }
  if (_0x4d647e === "") {
    return "";
  }
  return clampInputSlotLabel(_0x4d647e) || "组件";
}
function getInputSlotLabelClass(_0x151e8c) {
  if (INPUT_SLOT_LABEL_LATIN_RE.test(String(_0x151e8c || ""))) {
    return " rh-ai-app-preview-input-label--latin";
  } else {
    return "";
  }
}
function getPreviewHomeParamComponents(_0x562fd7 = []) {
  return sortComponentsByOrder(getParamComponents(_0x562fd7).filter(_0x29d7f4 => _0x29d7f4.previewPlacement === "home"), "homeParamOrder").slice(0, PREVIEW_CUSTOM_COMPONENT_LIMIT);
}
function getPreviewAdvancedParamComponents(_0xd5e779 = []) {
  const _0x14e94b = new Set(getPreviewHomeParamComponents(_0xd5e779).map(_0x39bc8e => Number(_0x39bc8e.index)));
  return sortComponentsByOrder(getParamComponents(_0xd5e779).filter(_0x3a1427 => !_0x14e94b.has(Number(_0x3a1427.index))), "advancedParamOrder");
}
function normalizePromptHelpFieldName(_0x3dad4b) {
  return String(_0x3dad4b || "").trim().toLowerCase();
}
function isPreviewPromptHelpFieldName(_0x5487d1) {
  const _0x5f490f = normalizePromptHelpFieldName(_0x5487d1);
  return PREVIEW_PROMPT_HELP_FIELD_NAMES.some(_0x2d8356 => normalizePromptHelpFieldName(_0x2d8356) === _0x5f490f);
}
function isPreviewPromptHelpTextComponent(_0x254b89 = {}) {
  const _0x5a9697 = normalizeControlType(_0x254b89.controlType);
  if (!PREVIEW_TEXT_TYPE_VALUES.includes(_0x5a9697)) {
    return false;
  }
  return [_0x254b89.label, _0x254b89.fieldName, _0x254b89.name, _0x254b89.id, _0x254b89.path].some(isPreviewPromptHelpFieldName);
}
function getPreviewPromptHelpComponent(_0x4a04fc = []) {
  return _0x4a04fc.find(_0xdb7ffc => normalizeComponentKind(_0xdb7ffc?.componentKind) === "prompt") || _0x4a04fc.find(isPreviewPromptHelpTextComponent) || null;
}
function shouldRefreshPreviewPromptForDraft(_0x4671c0, _0x424206) {
  if (_0x424206 === "componentKind" || _0x424206 === "controlType" || _0x424206 === "label") {
    return true;
  }
  if (_0x424206 === "description") {
    return normalizeComponentKind(_0x4671c0?.componentKind) === "prompt" || isPreviewPromptHelpTextComponent(_0x4671c0);
  }
  return false;
}
function buildComponentByIndex(_0x17158 = []) {
  const _0x4bb81a = new Map();
  _0x17158.forEach(_0x1ba6c8 => {
    const _0x195204 = Number(_0x1ba6c8?.index);
    if (Number.isInteger(_0x195204)) {
      _0x4bb81a.set(_0x195204, _0x1ba6c8);
    }
  });
  return _0x4bb81a;
}
function isPreviewSystemField(_0x10d98a = {}) {
  const _0x5d77c9 = String(_0x10d98a?.id || "").trim();
  const _0x35793c = String(_0x10d98a?.placement || "").trim();
  return _0x5d77c9 === "rhInstanceType" || _0x35793c === "batch" || _0x10d98a?.comfyUiSystemField === true;
}
function getBundleParamFields(_0x12a462) {
  const _0x5cc052 = Array.isArray(_0x12a462?.models?.[0]?.uiSchema?.fields) ? _0x12a462.models[0].uiSchema.fields : [];
  return _0x5cc052.filter(_0x1f4990 => !isPreviewSystemField(_0x1f4990));
}
function getCustomAiAppComponentIndex(_0x655f54 = {}) {
  const _0x4e1cf9 = Number(_0x655f54?.customAiAppComponentIndex);
  if (Number.isInteger(_0x4e1cf9)) {
    return _0x4e1cf9;
  }
  const _0x490164 = Number(_0x655f54?.rhAiAppComponentIndex);
  if (Number.isInteger(_0x490164)) {
    return _0x490164;
  }
  const _0x1a2d3b = Number(_0x655f54?.comfyUiComponentIndex);
  if (Number.isInteger(_0x1a2d3b)) {
    return _0x1a2d3b;
  }
  return NaN;
}
function getPreviewAdvancedParamFields({
  bundle = null,
  components = []
} = {}) {
  const _0x4e3fa6 = new Set(getPreviewHomeParamComponents(components).map(_0x49f81a => Number(_0x49f81a.index)));
  const _0x4b92b5 = buildComponentByIndex(components);
  const _0x5df4dc = new Map();
  return getBundleParamFields(bundle).filter((_0x3274c3, _0x1fcfb0) => {
    _0x5df4dc.set(_0x3274c3, _0x1fcfb0);
    const _0x343d5b = getCustomAiAppComponentIndex(_0x3274c3);
    if (!Number.isInteger(_0x343d5b)) {
      return true;
    }
    if (!_0x4b92b5.has(_0x343d5b)) {
      return true;
    }
    return !_0x4e3fa6.has(_0x343d5b);
  }).sort((_0x306b1d, _0x4bde8b) => {
    const _0x18a470 = getCustomAiAppComponentIndex(_0x306b1d);
    const _0x2faca8 = getCustomAiAppComponentIndex(_0x4bde8b);
    const _0x37c666 = Number.isInteger(_0x18a470) ? _0x4b92b5.get(_0x18a470) : null;
    const _0x59cef8 = Number.isInteger(_0x2faca8) ? _0x4b92b5.get(_0x2faca8) : null;
    const _0x42800f = _0x37c666 ? normalizeOrderValue(_0x37c666.advancedParamOrder, _0x18a470) : normalizeOrderValue(_0x306b1d?.displayOrder, _0x5df4dc.get(_0x306b1d) ?? Number.MAX_SAFE_INTEGER);
    const _0x29f4d7 = _0x59cef8 ? normalizeOrderValue(_0x59cef8.advancedParamOrder, _0x2faca8) : normalizeOrderValue(_0x4bde8b?.displayOrder, _0x5df4dc.get(_0x4bde8b) ?? Number.MAX_SAFE_INTEGER);
    if (_0x42800f !== _0x29f4d7) {
      return _0x42800f - _0x29f4d7;
    }
    return (_0x5df4dc.get(_0x306b1d) ?? 0) - (_0x5df4dc.get(_0x4bde8b) ?? 0);
  });
}
function buildPreviewUiSchemaNodeData(_0x32d870 = null) {
  const _0x40f1b5 = getBundleParamFields(_0x32d870);
  return {
    model: a1198_0x86bd7d(_0x32d870),
    generationParams: _0x40f1b5.reduce((_0x39e80a, _0x5bedb0) => {
      _0x39e80a[_0x5bedb0.id] = _0x5bedb0.defaultValue;
      return _0x39e80a;
    }, {})
  };
}
function renderPreviewBatchControlsHtml(_0x1dd651 = null) {
  const _0x16e505 = a1198_0x86bd7d(_0x1dd651);
  if (!_0x16e505) {
    return "";
  }
  return renderModelUiSchemaControls(_0x16e505, buildPreviewUiSchemaNodeData(_0x1dd651), {
    placement: "batch",
    variant: "pillMenu"
  });
}
function renderPreviewInputComponentsHtml(_0x55e6c3 = [], {
  canRemovePreviewInputs = true
} = {}) {
  const _0x27e0c8 = getPreviewInputComponents(_0x55e6c3);
  if (!_0x27e0c8.length) {
    return "";
  }
  return _0x27e0c8.map((_0x5a14ca, _0x40f3e6) => {
    const _0x5633a8 = normalizeComponentKind(_0x5a14ca.componentKind);
    const _0x23ee5e = String(_0x5a14ca.label || _0x5a14ca.fieldName || COMPONENT_KIND_LABELS[_0x5633a8] || "组件").trim();
    const _0x57fb7a = normalizeInputSlotLabel(_0x23ee5e);
    const _0x27a550 = getInputSlotLabelClass(_0x57fb7a);
    return "\n        <div role=\"button\" tabindex=\"0\" class=\"rh-ai-app-preview-component rh-ai-app-preview-draggable rh-ai-app-preview-input-slot ref-thumb-wrap ref-upload-slot rh-v5-ref-box\" data-preview-drag-kind=\"input\" data-preview-component-index=\"" + Number(_0x5a14ca.index) + "\" data-preview-order=\"" + _0x40f3e6 + "\" aria-label=\"拖动调整入参顺序：" + escapeHtml(_0x23ee5e || _0x57fb7a) + "\">\n          " + renderPreviewTypeBarHtml(_0x5a14ca, {
      canRemove: canRemovePreviewInputs
    }) + "\n          <span class=\"rh-ai-app-preview-input-slot-content\">\n            <span class=\"ref-upload-label rh-ai-app-preview-rename-target" + _0x27a550 + "\" data-preview-component-index=\"" + Number(_0x5a14ca.index) + "\">" + escapeHtml(_0x57fb7a) + "</span>\n          </span>\n        </div>";
  }).join("");
}
function getPreviewComponentDescription(_0x1f11f1, _0x33f203 = "参数说明") {
  return String(_0x1f11f1?.description || _0x1f11f1?.label || _0x1f11f1?.fieldName || _0x33f203).trim() || _0x33f203;
}
function getPreviewBundlePromptHelpTooltip(_0x5a8961 = null) {
  return String(_0x5a8961?.models?.[0]?.help?.tooltip || _0x5a8961?.help?.tooltip || "").trim();
}
function renderPreviewDescriptionTipHtml(_0x31c239, {
  className = "",
  ariaLabel = "编辑参数说明",
  fallback = "参数说明"
} = {}) {
  const _0x2cb595 = Number(_0x31c239?.index);
  if (!Number.isInteger(_0x2cb595)) {
    return "";
  }
  const _0x5b63e5 = getPreviewComponentDescription(_0x31c239, fallback);
  const _0x181b6b = ["rh-tip", "ui-schema-info-tip", "rh-ai-app-preview-description-target", className].filter(Boolean).join(" ");
  return "<span role=\"button\" tabindex=\"0\" class=\"" + _0x181b6b + "\" data-preview-component-index=\"" + _0x2cb595 + "\" data-tooltip=\"" + escapeHtml(_0x5b63e5) + "\" title=\"" + escapeHtml(_0x5b63e5) + "\" aria-label=\"" + escapeHtml(ariaLabel) + "\">!</span>";
}
function renderPreviewPromptHelpTipHtml(_0x23c6bf, {
  bundle = null
} = {}) {
  const _0x11fd03 = Number(_0x23c6bf?.index);
  const _0x106559 = Number.isInteger(_0x11fd03);
  const _0x276f2c = getPreviewBundlePromptHelpTooltip(bundle) || getPreviewComponentDescription(_0x23c6bf, "提示词说明");
  const _0x31e08c = ["rh-tip", "rh-ai-app-preview-description-target", "rh-ai-app-preview-prompt-help-tip"].filter(Boolean).join(" ");
  const _0x156165 = _0x106559 ? " data-preview-component-index=\"" + _0x11fd03 + "\"" : "";
  const _0x31f3aa = " data-preview-description-scope=\"prompt-help\"";
  return "<button type=\"button\" class=\"" + _0x31e08c + "\"" + _0x156165 + _0x31f3aa + " data-tooltip=\"" + escapeHtml(_0x276f2c) + "\" title=\"" + escapeHtml(_0x276f2c) + "\" aria-label=\"编辑提示词说明\">!</button>";
}
function isPreviewToggleOn(_0x4a480e) {
  if (_0x4a480e === true) {
    return true;
  }
  if (_0x4a480e === false) {
    return false;
  }
  const _0x13eaf5 = String(_0x4a480e ?? "").trim().toLowerCase();
  return ["true", "1", "yes", "on"].includes(_0x13eaf5);
}
function getPreviewToggleLabel(_0x2015d4) {
  if (isPreviewToggleOn(_0x2015d4)) {
    return "是";
  } else {
    return "否";
  }
}
function renderPreviewHomeParamsHtml(_0x5f29a1 = [], _0x53881f = null, {
  canRemovePreviewParams = true
} = {}) {
  const _0x598590 = getPreviewHomeParamComponents(_0x5f29a1);
  if (!_0x598590.length) {
    return "";
  }
  return _0x598590.map((_0x4de1c2, _0x3540c4) => {
    const _0xe78e60 = Number(_0x4de1c2.index);
    const _0x2c948e = _0x4de1c2.label || _0x4de1c2.fieldName || "参数";
    const _0x19c6ba = normalizeControlType(_0x4de1c2.controlType) === "toggle";
    const _0x3cf3f7 = getPreviewToggleLabel(_0x4de1c2.defaultValue);
    const _0x199b13 = _0x19c6ba ? " is-toggle" : "";
    const _0x383e5e = _0x19c6ba ? "<button type=\"button\" class=\"rh-ai-app-preview-param-toggle\" data-action=\"toggle-preview-param-default\" data-preview-component-index=\"" + _0xe78e60 + "\" aria-label=\"切换 " + escapeHtml(_0x2c948e) + "，当前" + escapeHtml(_0x3cf3f7) + "\"><span class=\"rh-ai-app-preview-param-toggle-separator\" aria-hidden=\"true\">·</span><span class=\"rh-ai-app-preview-param-toggle-value\">" + escapeHtml(_0x3cf3f7) + "</span></button>" : "";
    return "\n        <div class=\"img-pill-btn ui-schema-menu-trigger rh-ai-app-preview-component rh-ai-app-preview-draggable rh-ai-app-preview-param-chip" + _0x199b13 + "\" data-preview-drag-kind=\"param\" data-preview-component-index=\"" + _0xe78e60 + "\" data-preview-order=\"" + _0x3540c4 + "\">\n          " + renderPreviewTypeBarHtml(_0x4de1c2, {
      canRemove: canRemovePreviewParams
    }) + "\n          <span class=\"rh-ai-app-preview-rename-target rh-ai-app-preview-param-label\" data-preview-component-index=\"" + _0xe78e60 + "\">" + escapeHtml(_0x2c948e) + "</span>\n          " + _0x383e5e + "\n          <span class=\"rh-ai-app-preview-drag-pad\" aria-hidden=\"true\"></span>\n        </div>";
  }).join("");
}
function renderPreviewAdvancedPanelHtml({
  components = [],
  bundle = null
} = {}) {
  const _0x7041c6 = getPreviewAdvancedParamFields({
    bundle: bundle,
    components: components
  });
  const _0x8c7114 = _0x7041c6.length > 0 || getParamComponents(components).length > 0;
  if (!_0x8c7114) {
    return "";
  }
  const _0xb6b08f = buildPreviewUiSchemaNodeData(bundle);
  const _0x35963f = _0x7041c6.length ? "" : " is-empty";
  return "\n    <div class=\"rh-adv-panel show rh-ai-app-preview-advanced-panel" + _0x35963f + "\" data-preview-zone=\"advanced\">\n      " + (_0x7041c6.length ? renderUiSchemaFields(_0x7041c6, _0xb6b08f, {
    placement: "advanced"
  }) : "<div class=\"rh-ai-app-preview-advanced-empty\">拖回这里可放回高级设置</div>") + "\n    </div>";
}
function renderControlTypeOptionsHtml(_0x205305) {
  return renderOptionsHtml(CONTROL_TYPE_OPTIONS, normalizeControlType(_0x205305));
}
function renderDefaultValueInputHtml(_0x3d01b2, _0x509d99) {
  const _0x1a59f0 = String(_0x3d01b2.defaultValue ?? "");
  if (_0x509d99 === "toggle") {
    const _0x3287d1 = String(_0x1a59f0).trim().toLowerCase() === "true" ? "true" : "false";
    return renderComponentSelectHtml({
      className: "rh-ai-app-component-default",
      ariaLabel: "默认值",
      prop: "defaultValue",
      options: [["true", "true"], ["false", "false"]],
      activeValue: _0x3287d1
    });
  }
  const _0x35efe5 = _0x509d99 === "stepper" || _0x509d99 === "float" ? "number" : "text";
  const _0x15b5f7 = _0x509d99 === "stepper" ? " step=\"1\"" : _0x509d99 === "float" ? " step=\"any\"" : "";
  return "<input type=\"" + _0x35efe5 + "\"" + _0x15b5f7 + " class=\"rh-ai-app-component-default\" aria-label=\"默认值\" data-component-prop=\"defaultValue\" value=\"" + escapeHtml(_0x1a59f0) + "\">";
}
function getNextHomeParamOrder(_0x134b26 = []) {
  return Math.min(getPreviewHomeParamComponents(_0x134b26).length, PREVIEW_CUSTOM_COMPONENT_LIMIT - 1);
}
function assignSequentialOrder(_0x28a325 = [], _0x1087fa) {
  _0x28a325.forEach((_0x4395a5, _0x1b023f) => {
    _0x4395a5[_0x1087fa] = _0x1b023f;
  });
}
function getComponentByIndex(_0xf26c76 = [], _0x2ff971) {
  return _0xf26c76.find(_0x1ac988 => Number(_0x1ac988?.index) === Number(_0x2ff971)) || null;
}
function getComfyComponentDraftKey(_0x4eb28b = {}) {
  const _0x538b91 = String(_0x4eb28b?.componentKey || "").trim();
  if (_0x538b91) {
    return _0x538b91;
  }
  return [_0x4eb28b?.nodeId, _0x4eb28b?.classType, _0x4eb28b?.inputName].map(_0x29174e => String(_0x29174e || "").trim().toLowerCase()).join("::");
}
function mergeComfyComponentDraft(_0x507baf = {}, _0xc71e99 = {}) {
  const _0x40e286 = {
    ..._0x507baf
  };
  ["label", "defaultValue", "inputOrder", "homeParamOrder", "advancedParamOrder", "previewPlacement", "required"].forEach(_0x107089 => {
    if (Object.hasOwn(_0xc71e99, _0x107089)) {
      _0x40e286[_0x107089] = _0xc71e99[_0x107089];
    }
  });
  if (_0x507baf.componentKindLocked !== true && Object.hasOwn(_0xc71e99, "componentKind")) {
    _0x40e286.componentKind = _0xc71e99.componentKind;
  }
  if (_0x507baf.controlTypeLocked !== true && Object.hasOwn(_0xc71e99, "controlType")) {
    _0x40e286.controlType = _0xc71e99.controlType;
  }
  return _0x40e286;
}
function preserveComfyComponentDrafts(_0x16db31 = [], _0x589cab = []) {
  const _0x158d5a = new Map();
  const _0x3b280b = new Map();
  _0x589cab.forEach(_0x664b02 => {
    const _0x47330e = Number(_0x664b02?.index);
    if (Number.isInteger(_0x47330e)) {
      _0x158d5a.set(_0x47330e, _0x664b02);
    }
    const _0x36ac4c = getComfyComponentDraftKey(_0x664b02);
    if (_0x36ac4c) {
      _0x3b280b.set(_0x36ac4c, _0x664b02);
    }
  });
  const _0x1557d2 = new Set();
  return cloneComponentDrafts(_0x16db31).map(_0x597943 => {
    const _0x55a9fc = getComfyComponentDraftKey(_0x597943);
    const _0x5c9e84 = _0x55a9fc ? _0x3b280b.get(_0x55a9fc) : null;
    const _0x490734 = _0x158d5a.get(Number(_0x597943?.index));
    const _0x459637 = _0x5c9e84 || _0x490734 || null;
    const _0x2bff4e = Number(_0x459637?.index);
    if (!_0x459637 || _0x1557d2.has(_0x2bff4e)) {
      return null;
    }
    _0x1557d2.add(_0x2bff4e);
    return mergeComfyComponentDraft(_0x459637, _0x597943);
  }).filter(Boolean);
}
function moveComponentToOrder(_0x3f9312 = [], _0x26919e, _0x4278ab, _0x333c4e) {
  const _0x10373c = getComponentByIndex(_0x3f9312, _0x26919e);
  if (!_0x10373c) {
    return false;
  }
  const _0x395469 = sortComponentsByOrder(_0x3f9312, _0x4278ab).filter(_0x37df3f => Number(_0x37df3f.index) !== Number(_0x26919e));
  const _0xc2cc1 = Math.max(0, Math.min(_0x395469.length, Number(_0x333c4e) || 0));
  _0x395469.splice(_0xc2cc1, 0, _0x10373c);
  assignSequentialOrder(_0x395469, _0x4278ab);
  return true;
}
function renderSavedAppsMenuHtml({
  savedApps = [],
  pendingDeleteSavedAppId = "",
  pendingOverwriteSavedAppId = "",
  pendingOverwriteIntent = ""
} = {}) {
  if (!savedApps.length) {
    return "<div class=\"rh-ai-app-saved-app-empty\">暂无已保存子应用</div>";
  }
  return savedApps.map(_0x28b6a4 => {
    const _0x41a7db = String(_0x28b6a4.id || "");
    const _0x528927 = normalizeAppName(_0x28b6a4.name);
    if (_0x41a7db === pendingDeleteSavedAppId) {
      return "\n          <div class=\"rh-ai-app-saved-app-row is-confirming\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\">\n            <div class=\"rh-ai-app-saved-app-confirm-text\">是否删除「" + escapeHtml(_0x528927) + "」？</div>\n            <div class=\"rh-ai-app-saved-app-confirm-actions\">\n              <button type=\"button\" data-action=\"confirm-delete-app\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\">删除</button>\n              <button type=\"button\" data-action=\"cancel-delete-app\">取消</button>\n            </div>\n          </div>";
    }
    if (_0x41a7db === pendingOverwriteSavedAppId) {
      const _0x428d7c = pendingOverwriteIntent === "create" ? "覆盖后继续生成节点。" : "覆盖后保存当前配置。";
      return "\n          <div class=\"rh-ai-app-saved-app-row is-confirming is-overwrite-confirming\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\">\n            <div class=\"rh-ai-app-saved-app-confirm-text\">已存在同名应用「" + escapeHtml(_0x528927) + "」，是否覆盖？</div>\n            <div class=\"rh-ai-app-saved-app-confirm-note\">" + escapeHtml(_0x428d7c) + "</div>\n            <div class=\"rh-ai-app-saved-app-confirm-actions\">\n              <button type=\"button\" data-action=\"confirm-overwrite-app\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\">覆盖</button>\n              <button type=\"button\" data-action=\"cancel-overwrite-app\">取消</button>\n            </div>\n          </div>";
    }
    const _0x1662fb = OUTPUT_KIND_LABELS[_0x28b6a4.kind] || _0x28b6a4.kind || "";
    const _0x18ab0e = normalizeSourceType(_0x28b6a4.sourceType) || SOURCE_TYPES.runninghub;
    const _0x3b8175 = isComfyUiSource(_0x18ab0e) ? getComfyUiBaseUrlModeLabel(_0x18ab0e) : getRunningHubProfileShortLabel(_0x28b6a4.runningHubProfileId);
    const _0x28028a = [_0x1662fb, _0x3b8175].filter(Boolean).join(" · ");
    return "\n        <div class=\"rh-ai-app-saved-app-row\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\">\n          <button type=\"button\" class=\"rh-ai-app-saved-app-item\" data-action=\"load-saved-app\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\">\n            <span>" + escapeHtml(_0x528927) + "</span>\n            <small>" + escapeHtml(_0x28028a) + "</small>\n          </button>\n          <button type=\"button\" class=\"rh-ai-app-saved-app-delete\" data-action=\"request-delete-app\" data-saved-app-id=\"" + escapeHtml(_0x41a7db) + "\" aria-label=\"删除 " + escapeHtml(_0x528927) + "\">×</button>\n        </div>";
  }).join("");
}
function renderSaveConfigOverwriteMenuHtml({
  savedApp = null,
  intent = "save"
} = {}) {
  const _0x16e42a = String(savedApp?.id || "").trim();
  if (!_0x16e42a) {
    return "";
  }
  const _0x39675c = normalizeAppName(savedApp.name);
  const _0x4e486c = intent === "create" ? "覆盖后继续生成节点。" : "覆盖后保存当前配置。";
  return "\n    <div class=\"rh-ai-app-save-config-overwrite\" data-saved-app-id=\"" + escapeHtml(_0x16e42a) + "\">\n      <div class=\"rh-ai-app-saved-app-confirm-text\">已存在同名应用「" + escapeHtml(_0x39675c) + "」，是否覆盖？</div>\n      <div class=\"rh-ai-app-saved-app-confirm-note\">" + escapeHtml(_0x4e486c) + "</div>\n      <div class=\"rh-ai-app-saved-app-confirm-actions\">\n        <button type=\"button\" data-action=\"confirm-overwrite-app\" data-saved-app-id=\"" + escapeHtml(_0x16e42a) + "\">覆盖</button>\n        <button type=\"button\" data-action=\"cancel-overwrite-app\">取消</button>\n      </div>\n    </div>";
}
function getComfyUiCandidateSearchText(_0x39aae8 = {}) {
  return [_0x39aae8.label, _0x39aae8.nodeId, _0x39aae8.nodeTitle, _0x39aae8.classType, _0x39aae8.inputName].map(_0x111a82 => String(_0x111a82 || "").trim().toLowerCase()).filter(Boolean).join(" ");
}
function filterComfyUiCandidates(_0x409e8 = [], _0x16f759 = new Set(), _0x22311e = "") {
  const _0x1aecd8 = String(_0x22311e || "").trim().toLowerCase();
  return (Array.isArray(_0x409e8) ? _0x409e8 : []).filter(_0x57b931 => {
    const _0x217fdf = Number(_0x57b931?.index);
    if (!Number.isInteger(_0x217fdf) || _0x16f759.has(_0x217fdf)) {
      return false;
    }
    return !_0x1aecd8 || getComfyUiCandidateSearchText(_0x57b931).includes(_0x1aecd8);
  });
}
function getComfyUiCandidateDefaultComponentName(_0x313750 = {}) {
  return formatComfyUiComponentLabel(_0x313750);
}
function getComfyUiCandidateMenuMeta(_0x536ecb = {}) {
  return [_0x536ecb.nodeId, _0x536ecb.classType, _0x536ecb.inputName].filter(_0x1c8a55 => String(_0x1c8a55 || "").trim()).join(" / ") || getComfyUiCandidateDefaultComponentName(_0x536ecb);
}
function renderComfyUiCandidateMenuHtml(_0x2c9125 = [], _0xb9dd72 = new Set(), _0x253bd8 = "") {
  const _0x248835 = (Array.isArray(_0x2c9125) ? _0x2c9125 : []).filter(_0x4439ea => {
    const _0x27d13f = Number(_0x4439ea?.index);
    return Number.isInteger(_0x27d13f) && !_0xb9dd72.has(_0x27d13f);
  });
  const _0x5ac86e = filterComfyUiCandidates(_0x2c9125, _0xb9dd72, _0x253bd8);
  if (!_0x248835.length) {
    return "<div class=\"rh-ai-app-candidate-empty\">暂无可添加组件</div>";
  }
  if (!_0x5ac86e.length) {
    return "<div class=\"rh-ai-app-candidate-empty\">没有匹配的节点输入</div>";
  }
  const _0x5717ed = _0x5ac86e.map(_0x3d52b6 => {
    const _0x238a5e = Number(_0x3d52b6.index);
    const _0x20f0ac = getComfyUiCandidateDefaultComponentName(_0x3d52b6);
    const _0x230622 = getComfyUiCandidateMenuMeta(_0x3d52b6);
    const _0x26a9cd = _0x230622 ? "<span class=\"rh-ai-app-candidate-meta\">" + escapeHtml(_0x230622) + "</span>" : "";
    return "\n        <button type=\"button\" class=\"rh-ai-app-candidate-option\" data-action=\"choose-comfy-candidate\" data-component-index=\"" + _0x238a5e + "\">\n          <span class=\"rh-ai-app-candidate-topline\">\n            <span class=\"rh-ai-app-candidate-title\">" + escapeHtml(_0x20f0ac) + "</span>\n            " + _0x26a9cd + "\n          </span>\n        </button>";
  }).join("");
  return "<div class=\"rh-ai-app-candidate-options\">" + _0x5717ed + "</div>";
}
function renderComfyUiComponentAddPanelHtml({
  show = false,
  canAdd = true,
  hasComponents = false,
  emptyText = "",
  isOpen = false,
  searchText = ""
} = {}) {
  if (!show) {
    return "";
  }
  const _0x3be263 = hasComponents ? "继续选择工作流输入，新增组件会直接加入节点组件编辑。" : emptyText || "点击添加组件，逐行选择要暴露到节点上的工作流输入。";
  const _0x2d7e2b = isOpen ? "收起组件" : "点击添加组件";
  const _0xaeac36 = canAdd ? "" : " disabled";
  return "\n    <div class=\"rh-ai-app-comfy-add-panel " + (isOpen ? "is-open" : "") + "\">\n      <div class=\"rh-ai-app-comfy-add-panel-head\">\n        <button type=\"button\" class=\"rh-ai-app-secondary rh-ai-app-add-component\" data-action=\"toggle-comfy-candidate-select\" aria-expanded=\"" + (isOpen ? "true" : "false") + "\"" + _0xaeac36 + ">" + _0x2d7e2b + "</button>\n        <div class=\"rh-ai-app-comfy-head-slot\">\n          <div class=\"rh-ai-app-comfy-add-hint\">" + escapeHtml(_0x3be263) + "</div>\n          <label class=\"rh-ai-app-candidate-search\">\n            <span>搜索组件</span>\n            <input type=\"search\" data-role=\"comfyui-candidate-search\" value=\"" + escapeHtml(searchText) + "\" placeholder=\"搜索节点 ID、节点名字、输入名\" aria-label=\"搜索组件\">\n          </label>\n        </div>\n      </div>\n      <div class=\"rh-ai-app-candidate-menu\" data-role=\"comfyui-candidate-menu\" aria-hidden=\"" + (isOpen ? "false" : "true") + "\"></div>\n    </div>";
}
function renderPreviewAppMenuHtml({
  appName = DEFAULT_AI_APP_NAME,
  savedApps = [],
  isOpen = false,
  pendingDeleteSavedAppId = "",
  pendingOverwriteSavedAppId = "",
  pendingOverwriteIntent = "",
  sourceLabel = "RH AI应用"
} = {}) {
  if (!isOpen) {
    return "";
  }
  const _0x18e11d = normalizeAppName(appName);
  return "\n    <div class=\"rh-ai-app-preview-app-menu\" data-role=\"saved-app-menu\">\n      <div class=\"rh-ai-app-preview-app-menu-title\">" + escapeHtml(sourceLabel) + "</div>\n      <div class=\"rh-ai-app-current-app-row\">\n        <button type=\"button\" class=\"rh-ai-app-current-app-item active\" data-action=\"rename-current-app\">\n          <span>" + escapeHtml(_0x18e11d) + "</span>\n          <small>当前创建</small>\n        </button>\n      </div>\n      <div class=\"rh-ai-app-preview-app-menu-subtitle\">已保存子应用</div>\n      " + renderSavedAppsMenuHtml({
    savedApps: savedApps,
    pendingDeleteSavedAppId: pendingDeleteSavedAppId,
    pendingOverwriteSavedAppId: pendingOverwriteSavedAppId,
    pendingOverwriteIntent: pendingOverwriteIntent
  }) + "\n    </div>";
}
function renderRhAiAppNodePreviewHtml({
  components = [],
  kind = "image",
  bundle = null,
  appName = DEFAULT_AI_APP_NAME,
  savedApps = [],
  isAppMenuOpen = false,
  pendingDeleteSavedAppId = "",
  pendingOverwriteSavedAppId = "",
  pendingOverwriteIntent = "",
  sourceLabel = "RH AI应用",
  runningHubProfileLabel = "",
  showComfyAddPanel = false,
  canAddComfyComponents = true,
  comfyCandidatePickerOpen = false,
  comfyCandidateSearchText = "",
  comfyCandidateEmptyText = "",
  canRemovePreviewParams = true,
  canRemovePreviewInputs = true
} = {}) {
  const _0x5df408 = components.find(_0xf61e91 => normalizeComponentKind(_0xf61e91?.componentKind) === "prompt");
  const _0x3dcd15 = getPreviewPromptHelpComponent(components);
  const _0x34f461 = (_0x5df408 || _0x3dcd15)?.label ? "填写" + (_0x5df408 || _0x3dcd15).label + "，按 @ 引用素材，/呼出指令..." : "描述" + (OUTPUT_KIND_LABELS[kind] || "生成") + "内容，按 @ 引用素材，/呼出指令...";
  const _0x53c8f7 = Number(_0x5df408?.index);
  const _0x433269 = Number.isInteger(_0x53c8f7) ? " data-preview-component-index=\"" + _0x53c8f7 + "\"" : "";
  const _0x590a4a = Number.isInteger(_0x53c8f7) ? " rh-ai-app-preview-prompt-target" : "";
  const _0x346541 = _0x5df408 && canPreviewPromptBecomeParam(_0x5df408) ? " rh-ai-app-preview-draggable rh-ai-app-preview-prompt-draggable" : "";
  const _0x263cd5 = _0x5df408 && canPreviewPromptBecomeParam(_0x5df408) ? " data-preview-drag-kind=\"prompt\"" : "";
  const _0x22801f = getPreviewInstanceText(bundle);
  const _0x5b6c63 = renderPreviewBatchControlsHtml(bundle);
  const _0x560a4f = renderComfyUiComponentAddPanelHtml({
    show: showComfyAddPanel,
    canAdd: canAddComfyComponents,
    hasComponents: components.length > 0,
    emptyText: comfyCandidateEmptyText,
    isOpen: canAddComfyComponents && comfyCandidatePickerOpen === true,
    searchText: comfyCandidateSearchText
  });
  return "\n    " + _0x560a4f + "\n    <div class=\"rh-ai-app-node-preview-card rh-ai-app-preview-node\" data-preview-node-kind=\"" + escapeHtml(kind) + "\">\n      <div class=\"text-prompt-panel rh-ai-app-real-preview-panel\" data-role=\"preview-canvas\">\n        " + renderPreviewPromptHelpTipHtml(_0x3dcd15, {
    bundle: bundle
  }) + "\n        <div class=\"node-ref-bar active rh-v5-refbar rh-ai-app-preview-input-zone\" data-preview-zone=\"input\">\n          " + renderPreviewInputComponentsHtml(components, {
    canRemovePreviewInputs: canRemovePreviewInputs
  }) + "\n        </div>\n        <div class=\"prompt-input-wrapper rh-ai-app-preview-input rh-ai-app-preview-prompt-zone" + _0x590a4a + _0x346541 + "\" data-preview-zone=\"prompt\"" + _0x433269 + _0x263cd5 + ">\n          " + (_0x5df408 ? renderPreviewTypeBarHtml(_0x5df408, {
    canRemove: canRemovePreviewParams
  }) : "") + "\n          <div class=\"prompt-textarea rh-ai-app-preview-prompt\" data-placeholder=\"" + escapeHtml(_0x34f461) + "\"></div>\n        </div>\n        <div class=\"prompt-panel-footer\">\n          <div class=\"img-model-pills\">\n            <div class=\"img-model-wrap\">\n              <button type=\"button\" class=\"img-pill-btn img-model-btn-trigger rh-ai-app-preview-model-trigger\" data-action=\"toggle-app-menu\" title=\"单击打开 " + escapeHtml(sourceLabel) + " 菜单，双击修改名字\">\n                <img class=\"image-model-trigger-icon\" src=\"images/RH.png\" alt=\"\">\n                <span class=\"rh-ai-app-preview-runtime-badge\" data-role=\"preview-runninghub-runtime-label\"" + (runningHubProfileLabel ? "" : " hidden") + ">" + escapeHtml(runningHubProfileLabel) + "</span>\n                <span class=\"img-model-label\">" + escapeHtml(normalizeAppName(appName)) + "</span>\n              </button>\n              " + renderPreviewAppMenuHtml({
    appName: appName,
    savedApps: savedApps,
    isOpen: isAppMenuOpen,
    pendingDeleteSavedAppId: pendingDeleteSavedAppId,
    pendingOverwriteSavedAppId: pendingOverwriteSavedAppId,
    pendingOverwriteIntent: pendingOverwriteIntent,
    sourceLabel: sourceLabel
  }) + "\n            </div>\n          </div>\n          <div class=\"ui-schema-placement rh-ai-app-preview-param-zone\" data-preview-zone=\"params\">\n            " + renderPreviewHomeParamsHtml(components, bundle, {
    canRemovePreviewParams: canRemovePreviewParams
  }) + "\n          </div>\n          <div class=\"prompt-actions\">\n            <div class=\"rh-adv-wrap rh-ai-app-preview-adv-wrap\">\n              <button type=\"button\" class=\"img-pill-btn rh-adv-btn\" tabindex=\"-1\">\n                <span class=\"rh-adv-btn-label\"></span>\n              </button>\n            </div>\n            <div class=\"ui-schema-placement ui-schema-instance-slot\"" + (_0x22801f ? "" : " hidden") + ">\n              <button type=\"button\" class=\"img-pill-btn rh-vram-btn\" tabindex=\"-1\">\n                <span class=\"rh-vram-label\">" + escapeHtml(_0x22801f) + "</span>\n              </button>\n            </div>\n            <div class=\"ui-schema-placement ui-schema-batch-slot\"" + (_0x5b6c63 ? "" : " hidden") + ">\n              " + _0x5b6c63 + "\n            </div>\n            <button type=\"button\" class=\"prompt-submit img-gen-btn\" tabindex=\"-1\" aria-label=\"生成\">\n              <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"></line><polyline points=\"5 12 12 5 19 12\"></polyline></svg>\n            </button>\n          </div>\n        </div>\n        " + renderPreviewAdvancedPanelHtml({
    components: components,
    bundle: bundle
  }) + "\n      </div>\n    </div>";
}
function renderAppNameConfigHtml(_0x2543d8 = DEFAULT_AI_APP_NAME, _0x16741c = "") {
  return "\n    <div class=\"rh-ai-app-component-row rh-ai-app-app-name-row\">\n      <label class=\"rh-ai-app-meta-field\">\n        <span class=\"rh-ai-app-component-static-label\">AI应用名称</span>\n        <input type=\"text\" class=\"rh-ai-app-name-input\" aria-label=\"AI应用名称\" data-app-prop=\"appName\" value=\"" + escapeHtml(_0x2543d8) + "\">\n      </label>\n      <label class=\"rh-ai-app-meta-field\">\n        <span class=\"rh-ai-app-component-static-label\">简介</span>\n        <input type=\"text\" class=\"rh-ai-app-description-input\" aria-label=\"简介\" data-app-prop=\"appDescription\" value=\"" + escapeHtml(_0x16741c) + "\" placeholder=\"填写应用简介\">\n      </label>\n    </div>";
}
function renderComponentConfigHtml(_0x14e6d7 = [], _0xbbe6b3 = DEFAULT_AI_APP_NAME, _0x4dc209 = "", _0x5d1a76 = {}) {
  return renderAppNameConfigHtml(_0xbbe6b3, _0x4dc209);
}
class RunningHubAiAppManager {
  constructor() {
    this.panel = null;
    this.button = null;
    this.textarea = null;
    this.builderEl = null;
    this.sourceSelectEl = null;
    this.workbenchEl = null;
    this.bodyEl = null;
    this.kindTabsEl = null;
    this.sourceBackBtn = null;
    this.nodePreviewEl = null;
    this.componentListEl = null;
    this.componentPickerEl = null;
    this.summaryEl = null;
    this.errorEl = null;
    this.saveBtn = null;
    this.saveConfigMenuEl = null;
    this.createConfigMenuEl = null;
    this.createBtn = null;
    this.runtimeToggleEl = null;
    this.runningHubRuntimeToggleEl = null;
    this.sourceType = "";
    this.kind = "image";
    this.runningHubProfileId = getDefaultRunningHubProfileId();
    this.appName = DEFAULT_AI_APP_NAME;
    this.appDescription = "";
    this.promptHelpTooltip = "";
    this.savedAppId = "";
    this.currentBundle = null;
    this.componentDrafts = [];
    this.componentCandidates = [];
    this.componentDraftKey = "";
    this.comfyCandidateSearchText = "";
    this.comfyCandidatePickerOpen = false;
    this.workflowInputCollapsed = false;
    this.errorMessage = "";
    this.configRepository = createRhAiAppConfigRepository({
      getSnapshot: () => this._getConfigRepositorySnapshot(),
      applyExternalSnapshot: _0x3c48e0 => this._applyExternalStoragePayload(_0x3c48e0)
    });
    const _0x210d9d = this.configRepository.loadLocalSeed();
    this.kindStates = this.configRepository.createInitialKindStates();
    const _0x17c65e = _0x210d9d.panelDraft;
    if (_0x17c65e) {
      this.sourceType = _0x17c65e.sourceType || "";
      this.kind = _0x17c65e.kind;
      this.kindStates = _0x17c65e.kindStates;
    }
    this.savedApps = _0x210d9d.savedApps;
    this.localStorageSeedHasData = _0x210d9d.hasData;
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this.parseTimer = 0;
    this.saveSuccessTimer = 0;
    this.sourceViewAnimationTimer = 0;
    this.sourceViewTransitionDirection = "";
    this.workflowJsonDragDepth = 0;
    this.registeredBundleKeys = new Set();
    this.nodeBundleRegistry = createCustomAiAppNodeBundleRegistry({
      registerBundle: (_0x1c7920, _0x415f45) => a1198_0x19c24e(_0x1c7920, this.registeredBundleKeys, _0x415f45),
      unregisterBundle: _0x53056d => a1198_0x3b122f(_0x53056d, this.registeredBundleKeys),
      isBundleRegistered: _0x19a690 => this.registeredBundleKeys.has(_0x19a690)
    });
    this.unsubscribeNodes = null;
    this.previewPresentation = createRhAiAppPreviewPresentation({
      readState: () => ({
        nodePreviewEl: this.nodePreviewEl,
        componentDrafts: this.componentDrafts,
        kind: this.kind,
        currentBundle: this.currentBundle,
        appName: this.appName,
        runningHubProfileLabel: this._isRunningHubAiAppSource() ? getRunningHubProfileShortLabel(this.runningHubProfileId) : "",
        previewAppMenuOpen: this.previewAppMenuOpen,
        pendingDeleteSavedAppId: this.pendingDeleteSavedAppId,
        pendingOverwriteSavedAppId: this.pendingOverwriteSavedAppId,
        pendingOverwriteIntent: this.pendingOverwriteIntent,
        componentDraftKey: this.componentDraftKey,
        comfyCandidatePickerOpen: this.comfyCandidatePickerOpen,
        comfyCandidateSearchText: this.comfyCandidateSearchText,
        saveConfigMenuEl: this.saveConfigMenuEl,
        createConfigMenuEl: this.createConfigMenuEl
      }),
      writeState: _0x3984bb => Object.assign(this, _0x3984bb),
      actions: {
        getSavedAppsForKind: () => this._getSavedAppsForKind(),
        getSourceMeta: () => this._getSourceMeta(),
        syncRunningHubProfileBadge: _0x2fe224 => syncRunningHubProfileBadge(_0x2fe224, this.runningHubProfileId, this._isRunningHubAiAppSource()),
        shouldShowManualComponentPicker: () => this._shouldShowManualComponentPicker(),
        canRemovePreviewParams: () => this._canRemovePreviewParams(),
        canRemovePreviewInputs: () => this._canRemovePreviewInputs(),
        renderComfyCandidatePicker: _0x5bad9a => this._renderComfyCandidatePicker(_0x5bad9a),
        findSavedApp: _0x1c91d7 => this._findSavedApp(_0x1c91d7),
        commitPreviewUiSchemaValue: (_0x6ace59, _0xda0052) => this._commitPreviewUiSchemaValue(_0x6ace59, _0xda0052)
      },
      primitives: {
        OUTPUT_KIND_LABELS: OUTPUT_KIND_LABELS,
        RH_AI_APP_EXIT_MOTION_MS: RH_AI_APP_EXIT_MOTION_MS,
        bindUiSchemaFieldControls: bindUiSchemaFieldControls,
        buildPreviewUiSchemaNodeData: buildPreviewUiSchemaNodeData,
        canPreviewPromptBecomeParam: canPreviewPromptBecomeParam,
        getBundleParamFields: getBundleParamFields,
        getComponentByIndex: getComponentByIndex,
        getCustomAiAppComponentIndex: getCustomAiAppComponentIndex,
        getPreviewComponentDescription: getPreviewComponentDescription,
        getPreviewInstanceText: getPreviewInstanceText,
        getPreviewPromptHelpComponent: getPreviewPromptHelpComponent,
        normalizeAppName: normalizeAppName,
        normalizeComponentKind: normalizeComponentKind,
        normalizeKind: normalizeKind,
        renderPreviewAdvancedPanelHtml: renderPreviewAdvancedPanelHtml,
        renderPreviewAppMenuHtml: renderPreviewAppMenuHtml,
        renderPreviewBatchControlsHtml: renderPreviewBatchControlsHtml,
        renderPreviewHomeParamsHtml: renderPreviewHomeParamsHtml,
        renderPreviewInputComponentsHtml: renderPreviewInputComponentsHtml,
        renderPreviewPromptHelpTipHtml: renderPreviewPromptHelpTipHtml,
        renderPreviewTypeBarHtml: renderPreviewTypeBarHtml,
        renderRhAiAppNodePreviewHtml: renderRhAiAppNodePreviewHtml,
        renderSaveConfigOverwriteMenuHtml: renderSaveConfigOverwriteMenuHtml,
        shouldReduceMotion: shouldReduceMotion
      }
    });
    this.previewDragController = createRhAiAppPreviewDragController({
      readState: () => ({
        panel: this.panel,
        nodePreviewEl: this.nodePreviewEl,
        componentDrafts: this.componentDrafts
      }),
      actions: {
        getPreviewZoneElement: _0x1d9b11 => this.previewPresentation._getPreviewZoneElement(_0x1d9b11),
        isPreviewControlTarget: _0x10c2a5 => this._isPreviewControlTarget(_0x10c2a5),
        startPreviewInlineRename: (_0x27b375, _0x15d0c9) => this._startPreviewInlineRename(_0x27b375, _0x15d0c9),
        refreshBundleFromComponents: _0x1561e9 => this._refreshBundleFromComponents(_0x1561e9),
        patchPreviewWithoutRebuild: (_0x1bd01c, _0x2ff551) => this._patchPreviewWithoutRebuild(_0x1bd01c, _0x2ff551)
      },
      primitives: {
        PREVIEW_CUSTOM_COMPONENT_LIMIT: PREVIEW_CUSTOM_COMPONENT_LIMIT,
        PREVIEW_DRAG_START_THRESHOLD_PX: PREVIEW_DRAG_START_THRESHOLD_PX,
        PREVIEW_DROP_ZONES: PREVIEW_DROP_ZONES,
        PREVIEW_MOVE_ANIMATION_MS: PREVIEW_MOVE_ANIMATION_MS,
        PREVIEW_RENAME_CLICK_TOLERANCE_PX: PREVIEW_RENAME_CLICK_TOLERANCE_PX,
        assignSequentialOrder: assignSequentialOrder,
        buildComponentByIndex: buildComponentByIndex,
        canPreviewComponentBecomePrompt: canPreviewComponentBecomePrompt,
        canPreviewPromptBecomeParam: canPreviewPromptBecomeParam,
        getComponentByIndex: getComponentByIndex,
        getPreviewAdvancedParamComponents: getPreviewAdvancedParamComponents,
        getPreviewHomeParamComponents: getPreviewHomeParamComponents,
        getPreviewInputComponents: getPreviewInputComponents,
        getPreviewParamText: getPreviewParamText,
        getPreviewPromptReturnControlType: getPreviewPromptReturnControlType,
        isParamComponent: isParamComponent,
        moveComponentToOrder: moveComponentToOrder,
        shouldReduceMotion: shouldReduceMotion
      }
    });
    this.contextMenuController = createRunningHubAiAppContextMenuController({
      getPanel: () => this.panel,
      beforeOpen: () => this._closeInlineMenusBeforeContextMenu()
    });
    this._createPanel();
    this._syncSourceView();
    if (this.sourceType) {
      this._restoreKindState(this.kind);
    }
    this._bindButton();
    this._bindGlobalEvents();
    this._registerSavedAppBundles();
    this._watchExistingNodeBundles();
    this._hydrateExternalStorage();
  }
  _createPanel() {
    this.panel = document.createElement("section");
    this.panel.className = "rh-ai-app-panel";
    this.panel.setAttribute("aria-label", "自定义AI应用");
    this.panel.setAttribute("aria-hidden", "true");
    this.panel.innerHTML = "\n      <div class=\"rh-ai-app-header\">\n        <div>\n          <div class=\"rh-ai-app-title\" data-role=\"panel-title\">自定义AI应用</div>\n          <div class=\"rh-ai-app-subtitle\" data-role=\"panel-subtitle\">选择一种自定义应用来源</div>\n        </div>\n        <div class=\"rh-ai-app-header-actions\">\n          <button type=\"button\" class=\"rh-ai-app-back-to-sources\" data-action=\"back-to-source-types\" aria-label=\"返回自定义AI应用\" title=\"返回自定义AI应用\" hidden>\n            <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\"></path><path d=\"M20 12H9\"></path></svg>\n          </button>\n          <button type=\"button\" class=\"rh-ai-app-back\" data-action=\"close\" aria-label=\"关闭\">\n            <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>\n          </button>\n        </div>\n      </div>\n      <div class=\"rh-ai-app-body\">\n        <div class=\"rh-ai-app-source-select\" data-role=\"source-select\">\n          <button type=\"button\" class=\"rh-ai-app-source-option rh-ai-app-source-option--rh\" data-action=\"select-source-type\" data-source-type=\"runninghub-ai-app\" data-vip-model-id=\"" + escapeHtml(RH_AI_APP_VIP_MODEL_ID) + "\" data-provider=\"" + escapeHtml(RH_AI_APP_VIP_PROVIDER) + "\">\n            <span class=\"rh-ai-app-source-content\">\n              " + renderRunningHubAiAppLogoHtml({
      className: "rh-ai-app-source-icon rh-ai-app-source-icon--rh"
    }) + "\n              <span class=\"rh-ai-app-source-copy\">\n                <span class=\"rh-ai-app-source-title\">\n                  <span>RH AI应用</span>\n                  <span class=\"floating-menu-badge floating-menu-badge-warning floating-menu-badge-inline rh-ai-app-source-vip\">VIP</span>\n                </span>\n                <span class=\"rh-ai-app-source-subtitle\">接入 RunningHub AI App，保存为自定义生成节点</span>\n              </span>\n            </span>\n            <span class=\"rh-ai-app-source-arrow\" aria-hidden=\"true\">\n              <svg viewBox=\"0 0 24 24\"><path d=\"m9 18 6-6-6-6\"></path></svg>\n            </span>\n          </button>\n          <button type=\"button\" class=\"rh-ai-app-source-option rh-ai-app-source-option--comfyui\" data-action=\"select-source-type\" data-source-type=\"comfyui-local-workflow\">\n            <span class=\"rh-ai-app-source-content\">\n              " + renderComfyUiLocalWorkflowLogoHtml({
      className: "rh-ai-app-source-icon"
    }) + "\n              <span class=\"rh-ai-app-source-copy\">\n                <span class=\"rh-ai-app-source-title\">ComfyUI 工作流</span>\n                <span class=\"rh-ai-app-source-subtitle\">粘贴 ComfyUI API workflow，选择本地或云端运行环境</span>\n              </span>\n            </span>\n            <span class=\"rh-ai-app-source-arrow\" aria-hidden=\"true\">\n              <svg viewBox=\"0 0 24 24\"><path d=\"m9 18 6-6-6-6\"></path></svg>\n            </span>\n          </button>\n        </div>\n        <div class=\"rh-ai-app-workbench\" data-role=\"workbench\" hidden>\n          <div class=\"rh-ai-app-field rh-ai-app-kind-field\">\n            <div class=\"rh-ai-app-label\">节点类型</div>\n            <div class=\"rh-ai-app-kind-tabs is-kind-image\" role=\"tablist\" aria-label=\"节点类型\">\n              <button type=\"button\" class=\"active\" data-kind=\"image\" aria-pressed=\"true\">图像</button>\n              <button type=\"button\" data-kind=\"video\" aria-pressed=\"false\">视频</button>\n              <button type=\"button\" data-kind=\"audio\" aria-pressed=\"false\">音频</button>\n            </div>\n          </div>\n          <div class=\"rh-ai-app-field rh-ai-app-workflow-field\" data-role=\"workflow-input-field\">\n            <div class=\"rh-ai-app-input-head\">\n              <span class=\"rh-ai-app-label\" data-role=\"input-label\">RunningHub 请求</span>\n              <div class=\"rh-ai-app-input-actions\">\n                <div class=\"rh-ai-app-runtime-toggle\" data-role=\"comfyui-runtime-toggle\" role=\"radiogroup\" aria-label=\"运行环境\" hidden>\n                  <span class=\"rh-ai-app-runtime-label\">运行环境</span>\n                  <button type=\"button\" data-action=\"select-comfyui-runtime\" data-comfyui-runtime=\"local\" aria-pressed=\"true\">本地工作流</button>\n                  <button type=\"button\" data-action=\"select-comfyui-runtime\" data-comfyui-runtime=\"cloud\" aria-pressed=\"false\">云端工作流</button>\n                </div>\n                <div class=\"rh-ai-app-runtime-toggle\" data-role=\"runninghub-runtime-toggle\" role=\"radiogroup\" aria-label=\"运行环境\" hidden>\n                  <span class=\"rh-ai-app-runtime-label\">运行环境</span>\n                  <button type=\"button\" data-action=\"select-runninghub-runtime\" data-runninghub-runtime=\"" + escapeHtml(RUNNINGHUB_DOMESTIC_PROFILE_ID) + "\" aria-pressed=\"true\">国内</button>\n                  <button type=\"button\" data-action=\"select-runninghub-runtime\" data-runninghub-runtime=\"" + escapeHtml(RUNNINGHUB_INTERNATIONAL_PROFILE_ID) + "\" aria-pressed=\"false\">国际</button>\n                </div>\n                <button type=\"button\" class=\"rh-ai-app-input-toggle\" data-action=\"toggle-workflow-input\" hidden>收起 JSON</button>\n              </div>\n            </div>\n            <div class=\"rh-ai-app-input-summary\" data-role=\"workflow-input-summary\" hidden></div>\n            <div class=\"rh-ai-app-input-shell\" data-role=\"workflow-input-shell\">\n              <div class=\"rh-ai-app-input-shell-inner\">\n                <textarea class=\"rh-ai-app-input\" spellcheck=\"false\" placeholder=\"粘贴 openapi/v2/run/ai-app 的 curl 或 JSON\"></textarea>\n              </div>\n            </div>\n          </div>\n          <div class=\"rh-ai-app-builder\" data-role=\"builder\" hidden>\n            <div class=\"rh-ai-app-section-head\">\n              <div class=\"rh-ai-app-section-title\">应用信息</div>\n            </div>\n            <div class=\"rh-ai-app-component-list\" data-role=\"components\"></div>\n            <div class=\"rh-ai-app-section-title\">节点组件编辑</div>\n            <div data-role=\"node-preview\"></div>\n          </div>\n          <div class=\"rh-ai-app-preview\" data-role=\"summary\">\n            " + renderSummaryHtml(null) + "\n          </div>\n        </div>\n        <div class=\"rh-ai-app-error\" data-role=\"error\" hidden></div>\n      </div>\n      <div class=\"rh-ai-app-footer\" data-role=\"footer\">\n        <button type=\"button\" class=\"rh-ai-app-secondary\" data-action=\"parse\">解析</button>\n        <span class=\"rh-ai-app-save-config-wrap\">\n          <button type=\"button\" class=\"rh-ai-app-secondary\" data-action=\"save-config\" disabled>保存配置</button>\n          <div class=\"rh-ai-app-save-config-menu\" data-role=\"save-config-menu\" aria-hidden=\"true\" hidden></div>\n        </span>\n        <span class=\"rh-ai-app-create-config-wrap\">\n          <button type=\"button\" class=\"rh-ai-app-primary\" data-action=\"create\" disabled>生成节点</button>\n          <div class=\"rh-ai-app-create-config-menu\" data-role=\"create-config-menu\" aria-hidden=\"true\" hidden></div>\n        </span>\n      </div>";
    const _0x392e7c = document.body || document.documentElement;
    _0x392e7c.appendChild(this.panel);
    this.bodyEl = this.panel.querySelector(".rh-ai-app-body");
    this.sourceSelectEl = this.panel.querySelector("[data-role='source-select']");
    this.workbenchEl = this.panel.querySelector("[data-role='workbench']");
    this.kindTabsEl = this.panel.querySelector(".rh-ai-app-kind-tabs");
    this.sourceBackBtn = this.panel.querySelector("[data-action='back-to-source-types']");
    this.workflowInputFieldEl = this.panel.querySelector("[data-role='workflow-input-field']");
    this.workflowInputSummaryEl = this.panel.querySelector("[data-role='workflow-input-summary']");
    this.runtimeToggleEl = this.panel.querySelector("[data-role='comfyui-runtime-toggle']");
    this.runningHubRuntimeToggleEl = this.panel.querySelector("[data-role='runninghub-runtime-toggle']");
    this.workflowInputToggleBtn = this.panel.querySelector("[data-action='toggle-workflow-input']");
    this.textarea = this.panel.querySelector(".rh-ai-app-input");
    this.builderEl = this.panel.querySelector("[data-role='builder']");
    this.nodePreviewEl = this.panel.querySelector("[data-role='node-preview']");
    this.componentListEl = this.panel.querySelector("[data-role='components']");
    this.componentPickerEl = this.panel.querySelector("[data-role='comfyui-candidate-menu']");
    this.summaryEl = this.panel.querySelector("[data-role='summary']");
    this.errorEl = this.panel.querySelector("[data-role='error']");
    this.saveBtn = this.panel.querySelector("[data-action='save-config']");
    this.saveConfigMenuEl = this.panel.querySelector("[data-role='save-config-menu']");
    this.createConfigMenuEl = this.panel.querySelector("[data-role='create-config-menu']");
    this.createBtn = this.panel.querySelector("[data-action='create']");
    this.panel.addEventListener("click", _0x360e85 => this._handlePanelClick(_0x360e85));
    this.panel.addEventListener("contextmenu", _0x328d12 => this.contextMenuController.handleContextMenu(_0x328d12));
    this.panel.addEventListener("dblclick", _0x599673 => this._handlePanelDoubleClick(_0x599673));
    this.panel.addEventListener("keydown", _0x6d870c => this._handlePanelKeyDown(_0x6d870c));
    this.panel.addEventListener("focusout", _0x2b972d => this._handlePanelFocusOut(_0x2b972d));
    this.panel.addEventListener("pointerdown", _0x4fdaf6 => {
      _0x4fdaf6.stopPropagation();
      this.previewDragController.handlePointerDown(_0x4fdaf6);
    });
    this.panel.addEventListener("input", _0x19a2f8 => this._handleComponentInput(_0x19a2f8));
    this.panel.addEventListener("change", _0x139d34 => this._handleComponentInput(_0x139d34));
    this.bodyEl?.addEventListener("scroll", () => this._syncStickyHeaderShadow());
    this.workflowInputFieldEl?.addEventListener("dragenter", _0xa3ad69 => this._handleWorkflowJsonFileDragEnter(_0xa3ad69));
    this.workflowInputFieldEl?.addEventListener("dragover", _0x3d143 => this._handleWorkflowJsonFileDragOver(_0x3d143));
    this.workflowInputFieldEl?.addEventListener("dragleave", _0x1d8180 => this._handleWorkflowJsonFileDragLeave(_0x1d8180));
    this.workflowInputFieldEl?.addEventListener("drop", _0xcf863c => void this._handleWorkflowJsonFileDrop(_0xcf863c));
    this.textarea?.addEventListener("input", () => {
      this.workflowInputCollapsed = false;
      this._syncWorkflowInputCollapsed();
      this._scheduleParse();
    });
  }
  _bindButton() {
    this.button = document.getElementById("btnRunningHubAiApp");
    if (!this.button || !this.panel) {
      return;
    }
    this.button.setAttribute("aria-haspopup", "dialog");
    this.button.setAttribute("aria-expanded", "false");
    this.button.addEventListener("click", _0x527750 => {
      _0x527750.preventDefault();
      _0x527750.stopPropagation();
      if (Number(_0x527750.detail || 0) > 1) {
        return;
      }
      this._toggle();
    });
    this.button.addEventListener("dblclick", _0x187382 => {
      _0x187382.preventDefault();
      _0x187382.stopPropagation();
      this._close();
    });
  }
  _bindGlobalEvents() {
    document.addEventListener("keydown", _0xa8f38 => {
      if (_0xa8f38.key !== "Escape" || !this._isOpen()) {
        return;
      }
      if (this.previewAppMenuOpen) {
        this.previewAppMenuOpen = false;
        this.pendingDeleteSavedAppId = "";
        this.pendingOverwriteSavedAppId = "";
        this.pendingOverwriteIntent = "";
        this._patchPreviewAppChrome();
        return;
      }
      this._close();
    });
    document.addEventListener("pointerdown", _0x2b187f => {
      if (!this.previewAppMenuOpen || !this._isOpen()) {
        return;
      }
      if (this.panel?.contains(_0x2b187f.target)) {
        return;
      }
      this.previewAppMenuOpen = false;
      this.pendingDeleteSavedAppId = "";
      this.pendingOverwriteSavedAppId = "";
      this.pendingOverwriteIntent = "";
      this._patchPreviewAppChrome();
    });
    document.addEventListener("pointermove", _0x8a4d82 => this.previewDragController.handlePointerMove(_0x8a4d82));
    document.addEventListener("pointerup", _0x2803b5 => this.previewDragController.handlePointerEnd(_0x2803b5));
    document.addEventListener("pointercancel", _0x33ab0d => this.previewDragController.handlePointerEnd(_0x33ab0d));
    window.addEventListener("custom-ai-app:open", () => this._openSourceSelect());
    window.addEventListener("custom-ai-app:toggle", () => this._toggleSourceSelect());
  }
  _watchExistingNodeBundles() {
    this.unsubscribeNodes = graphStore.subscribeSelector(_0x503cb1 => Number(_0x503cb1?._persistRev || 0), () => this._registerBundlesFromNodes());
  }
  _registerBundlesFromNodes() {
    const _0x4a41ec = graphStore.getStateRaw?.()?.nodes || graphStore.getState?.()?.nodes || {};
    const _0x1d28d0 = Object.values(_0x4a41ec).map(_0x35790a => _0x35790a?.rhAiAppManifestBundle).filter(Boolean);
    const _0x3998db = this.savedApps.map(_0x1500aa => a1198_0x19751b(_0x1500aa?.bundle)).filter(Boolean);
    return this.nodeBundleRegistry.reconcile({
      bundles: _0x1d28d0,
      savedBundleKeys: _0x3998db
    });
  }
  _getSavedAppsForKind(_0x2d6433 = this.kind) {
    const _0xd81e37 = normalizeKind(_0x2d6433);
    const _0x2fc521 = normalizeSourceType(this.sourceType) || SOURCE_TYPES.runninghub;
    return this.savedApps.filter(_0x925ce8 => {
      if (normalizeKind(_0x925ce8.kind) !== _0xd81e37) {
        return false;
      }
      const _0x269df0 = normalizeSourceType(_0x925ce8.sourceType) || SOURCE_TYPES.runninghub;
      if (isComfyUiSource(_0x2fc521)) {
        return isComfyUiSource(_0x269df0);
      }
      return _0x269df0 === _0x2fc521;
    });
  }
  _getSavedAppsForExactSource(_0x346fb3 = this.kind, _0x2cdc19 = this.sourceType) {
    const _0x14caed = normalizeKind(_0x346fb3);
    const _0x13a48e = normalizeSourceType(_0x2cdc19) || SOURCE_TYPES.runninghub;
    return this.savedApps.filter(_0x536626 => {
      if (normalizeKind(_0x536626.kind) !== _0x14caed) {
        return false;
      }
      const _0x3e9194 = normalizeSourceType(_0x536626.sourceType) || SOURCE_TYPES.runninghub;
      return _0x3e9194 === _0x13a48e;
    });
  }
  _findSavedApp(_0xd744d2) {
    const _0x311d80 = String(_0xd744d2 || "").trim();
    if (!_0x311d80) {
      return null;
    }
    return this.savedApps.find(_0x228bce => _0x228bce.id === _0x311d80) || null;
  }
  _findSameNameSavedAppForCurrentScope(_0xa82dcc = this.appName) {
    const _0x1454fc = normalizeAppName(_0xa82dcc);
    return this._getSavedAppsForExactSource(this.kind, this.sourceType).find(_0x40a5db => normalizeAppName(_0x40a5db.name) === _0x1454fc) || null;
  }
  _clearPendingOverwrite({
    keepMenuOpen = false,
    render = true
  } = {}) {
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    if (keepMenuOpen) {
      this.previewAppMenuOpen = true;
    }
    if (render) {
      this._patchPreviewAppChrome();
      this._patchSaveConfigMenu();
      this._patchCreateConfigMenu();
    }
  }
  _showOverwriteConfirm(_0x227d7b, _0x53c462 = "save") {
    const _0x5ae3e9 = String(_0x227d7b || "").trim();
    if (!_0x5ae3e9) {
      return false;
    }
    this.pendingOverwriteSavedAppId = _0x5ae3e9;
    this.pendingOverwriteIntent = _0x53c462 === "create" ? "create" : "save";
    this.pendingDeleteSavedAppId = "";
    this.previewAppMenuOpen = false;
    this._patchPreviewAppChrome();
    this._patchSaveConfigMenu();
    this._patchCreateConfigMenu();
    return true;
  }
  _getConfigRepositorySnapshot() {
    return {
      savedApps: this.savedApps,
      sourceType: this.sourceType,
      kind: this.kind,
      kindStates: this.kindStates
    };
  }
  _persistSavedApps() {
    this.configRepository.saveSavedApps(this.savedApps);
  }
  async _hydrateExternalStorage() {
    return await this.configRepository.hydrateExternalStorage({
      hasLocalSeed: this.localStorageSeedHasData
    });
  }
  _applyExternalStoragePayload(_0x2700e4) {
    this.savedApps.forEach(_0x562103 => {
      if (_0x562103?.bundle) {
        a1198_0x3b122f(_0x562103.bundle, this.registeredBundleKeys);
      }
    });
    this.savedApps = Array.isArray(_0x2700e4?.savedApps) ? _0x2700e4.savedApps : [];
    this._registerSavedAppBundles();
    this._registerBundlesFromNodes();
    if (_0x2700e4?.panelDraft) {
      this.sourceType = _0x2700e4.panelDraft.sourceType || "";
      this.kind = _0x2700e4.panelDraft.kind;
      this.kindStates = _0x2700e4.panelDraft.kindStates;
    }
    this._dropUnauthorizedRunningHubAiAppSource();
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._syncSourceView();
    if (this.sourceType) {
      this._restoreKindState(this.kind);
    } else {
      this._patchPreviewAppChrome();
    }
  }
  _buildBundleForSavedApp(_0x5c7c6e) {
    const _0x2e6569 = normalizeSourceType(_0x5c7c6e.sourceType || this.sourceType) || SOURCE_TYPES.runninghub;
    if (isComfyUiSource(_0x2e6569)) {
      return buildComfyUiWorkflowManifestBundle({
        input: _0x5c7c6e.input,
        kind: _0x5c7c6e.kind,
        components: _0x5c7c6e.componentDrafts,
        displayName: _0x5c7c6e.name,
        description: _0x5c7c6e.description,
        promptHelpTooltip: normalizePromptHelpTooltip(_0x5c7c6e.promptHelpTooltip),
        appKey: _0x5c7c6e.id,
        baseUrlMode: getComfyUiBaseUrlMode(_0x2e6569),
        componentSelectionMode: "manual"
      });
    }
    return buildRunningHubAiAppManifestBundle({
      input: _0x5c7c6e.input,
      appId: this._getAppIdText(),
      kind: _0x5c7c6e.kind,
      components: _0x5c7c6e.componentDrafts,
      displayName: _0x5c7c6e.name,
      description: _0x5c7c6e.description,
      promptHelpTooltip: normalizePromptHelpTooltip(_0x5c7c6e.promptHelpTooltip),
      appKey: _0x5c7c6e.id
    });
  }
  _registerSavedAppBundles() {
    this.savedApps.forEach(_0x2da13d => {
      try {
        const _0x4a4410 = this._buildBundleForSavedApp(_0x2da13d);
        _0x2da13d.bundle = _0x4a4410;
        a1198_0x19c24e(_0x4a4410, this.registeredBundleKeys, {
          replace: true
        });
      } catch (_0x448f84) {
        console.warn("[RH AI App] register saved app failed:", _0x448f84);
      }
    });
  }
  _setActionButtonsEnabled(_0x4bf3b1) {
    if (!_0x4bf3b1) {
      this._resetSaveSuccessFeedback();
    }
    if (this.saveBtn) {
      this.saveBtn.disabled = !_0x4bf3b1;
    }
    if (this.createBtn) {
      this.createBtn.disabled = !_0x4bf3b1;
    }
  }
  _resetSaveSuccessFeedback() {
    window.clearTimeout(this.saveSuccessTimer);
    this.saveSuccessTimer = 0;
    if (!this.saveBtn) {
      return;
    }
    this.saveBtn.classList.remove("is-save-success");
    this.saveBtn.textContent = this.saveBtn.dataset.defaultText || "保存配置";
  }
  _flashSaveSuccessFeedback() {
    if (!this.saveBtn) {
      return;
    }
    const _0x414ae5 = this.saveBtn.dataset.defaultText || this.saveBtn.textContent || "保存配置";
    this.saveBtn.dataset.defaultText = _0x414ae5;
    window.clearTimeout(this.saveSuccessTimer);
    this.saveBtn.classList.add("is-save-success");
    this.saveBtn.textContent = "已保存";
    this.saveSuccessTimer = window.setTimeout(() => this._resetSaveSuccessFeedback(), 1200);
  }
  _getStateKey(_0x25d329 = this.kind, _0x764db6 = this.sourceType) {
    return this.configRepository.getKindStateKey(_0x764db6, _0x25d329);
  }
  _getSourceMeta() {
    return getSourceMeta(this.sourceType);
  }
  _isComfyUiSource() {
    return isComfyUiSource(this.sourceType);
  }
  _isRunningHubAiAppSource(_0x3577e3 = this.sourceType) {
    return normalizeSourceType(_0x3577e3) === SOURCE_TYPES.runninghub;
  }
  _isRunningHubAiAppAuthorized() {
    return true;
    const _0x2635c3 = globalThis.window;
    const _0x1671cc = _0x2635c3?.isModelAllowedBySubscription;
    if (typeof _0x1671cc !== "function") {
      return false;
    }
    return _0x1671cc(RH_AI_APP_VIP_MODEL_ID, RH_AI_APP_VIP_PROVIDER) === true;
  }
  _requestRunningHubAiAppAuthorization(_0x5c9de3 = null) {
    const _0x9e8b2a = globalThis.window;
    if (typeof _0x9e8b2a?.openSubscriptionDialog === "function") {
      _0x9e8b2a.openSubscriptionDialog({
        modelId: RH_AI_APP_VIP_MODEL_ID,
        provider: RH_AI_APP_VIP_PROVIDER,
        onSuccess: _0x5c9de3
      });
      return;
    }
    _0x9e8b2a?.showToast?.("需要VIP授权，请先激活CDKEY", "warn");
  }
  _guardRunningHubAiAppAccess(_0x38b2c5 = null) {
    return true;
    if (this._isRunningHubAiAppAuthorized()) {
      return true;
    }
    this._requestRunningHubAiAppAuthorization(_0x38b2c5);
    return false;
  }
  _dropUnauthorizedRunningHubAiAppSource() {
    if (!this._isRunningHubAiAppSource()) {
      return false;
    }
    if (this._isRunningHubAiAppAuthorized()) {
      return false;
    }
    this.sourceType = "";
    return true;
  }
  _shouldShowManualComponentPicker() {
    return this._isComfyUiSource();
  }
  _canRemovePreviewParams() {
    return this._isComfyUiSource();
  }
  _canRemovePreviewInputs() {
    return this._isComfyUiSource();
  }
  _clearSourceViewAnimation() {
    window.clearTimeout(this.sourceViewAnimationTimer);
    this.sourceViewAnimationTimer = 0;
    this.bodyEl?.classList.remove("is-view-transitioning");
    this.sourceSelectEl?.classList.remove("is-page-enter-left", "is-page-exit-left", "is-page-enter-right", "is-page-exit-right");
    this.workbenchEl?.classList.remove("is-page-enter-left", "is-page-exit-left", "is-page-enter-right", "is-page-exit-right");
  }
  _setSourceViewHiddenState(_0x421156) {
    if (this.sourceSelectEl) {
      this.sourceSelectEl.hidden = _0x421156;
    }
    if (this.workbenchEl) {
      this.workbenchEl.hidden = !_0x421156;
    }
  }
  _applySourceViewTransition(_0xbfd58e, _0x1c37b1) {
    if (shouldReduceMotion() || !_0x1c37b1 || !this.sourceSelectEl || !this.workbenchEl) {
      this._setSourceViewHiddenState(_0xbfd58e);
      return false;
    }
    const _0x1be76f = _0x1c37b1 === "forward" && _0xbfd58e;
    const _0xa1826 = _0x1c37b1 === "back" && !_0xbfd58e;
    if (!_0x1be76f && !_0xa1826) {
      this._setSourceViewHiddenState(_0xbfd58e);
      return false;
    }
    this.sourceSelectEl.hidden = false;
    this.workbenchEl.hidden = false;
    this.bodyEl?.classList.add("is-view-transitioning");
    if (_0x1be76f) {
      this.sourceSelectEl.classList.add("is-page-exit-left");
      this.workbenchEl.classList.add("is-page-enter-right");
    } else {
      this.sourceSelectEl.classList.add("is-page-enter-left");
      this.workbenchEl.classList.add("is-page-exit-right");
    }
    this.sourceViewAnimationTimer = window.setTimeout(() => {
      this._clearSourceViewAnimation();
      this._setSourceViewHiddenState(_0xbfd58e);
    }, SOURCE_PAGE_ANIMATION_MS);
    return true;
  }
  _syncSourceView() {
    const _0x25c097 = Boolean(normalizeSourceType(this.sourceType));
    const _0xbe9689 = this._getSourceMeta();
    const _0x5df22c = this.sourceViewTransitionDirection;
    this.sourceViewTransitionDirection = "";
    this._clearSourceViewAnimation();
    this._applySourceViewTransition(_0x25c097, _0x5df22c);
    if (this.sourceBackBtn) {
      this.sourceBackBtn.hidden = !_0x25c097;
    }
    const _0x365101 = this.panel?.querySelector?.("[data-role='footer']");
    if (_0x365101) {
      _0x365101.hidden = !_0x25c097;
    }
    const _0x30f388 = this.panel?.querySelector?.("[data-role='panel-title']");
    const _0xc2845f = this.panel?.querySelector?.("[data-role='panel-subtitle']");
    const _0x49e9ca = this.panel?.querySelector?.("[data-role='input-label']");
    if (_0x30f388) {
      _0x30f388.textContent = _0x25c097 ? _0xbe9689?.label || "自定义AI应用" : "自定义AI应用";
    }
    if (_0xc2845f) {
      _0xc2845f.textContent = _0x25c097 ? _0xbe9689?.subtitle || "" : "选择一种自定义应用来源";
    }
    if (_0x49e9ca && _0xbe9689?.inputLabel) {
      _0x49e9ca.textContent = _0xbe9689.inputLabel;
    }
    if (this.textarea && _0xbe9689?.inputPlaceholder) {
      this.textarea.placeholder = _0xbe9689.inputPlaceholder;
    }
    this._syncComfyUiRuntimeControl();
    this._syncRunningHubRuntimeControl();
    if (!_0x25c097) {
      this._setActionButtonsEnabled(false);
      this._setError("");
    }
    this._syncStickyHeaderShadow();
  }
  _syncComfyUiRuntimeControl() {
    const _0x5d82c6 = this._isComfyUiSource();
    if (!this.runtimeToggleEl) {
      return;
    }
    this.runtimeToggleEl.hidden = !_0x5d82c6;
    const _0x55db42 = getComfyUiBaseUrlMode(this.sourceType);
    this.runtimeToggleEl.querySelectorAll("[data-comfyui-runtime]").forEach(_0x4dae21 => {
      const _0xad8976 = _0x4dae21.dataset.comfyuiRuntime === _0x55db42;
      _0x4dae21.classList.toggle("active", _0xad8976);
      _0x4dae21.setAttribute("aria-pressed", _0xad8976 ? "true" : "false");
    });
  }
  _syncRunningHubRuntimeControl() {
    const _0xee7b0f = this._isRunningHubAiAppSource();
    if (!this.runningHubRuntimeToggleEl) {
      return;
    }
    this.runningHubRuntimeToggleEl.hidden = !_0xee7b0f;
    const _0x203492 = normalizeRunningHubModelApiProfileId(this.runningHubProfileId);
    this.runningHubRuntimeToggleEl.querySelectorAll("[data-runninghub-runtime]").forEach(_0x589e7c => {
      const _0x52bd57 = normalizeRunningHubModelApiProfileId(_0x589e7c.dataset.runninghubRuntime) === _0x203492;
      _0x589e7c.classList.toggle("active", _0x52bd57);
      _0x589e7c.setAttribute("aria-pressed", _0x52bd57 ? "true" : "false");
    });
  }
  _syncStickyHeaderShadow() {
    const _0x27c53f = Boolean(normalizeSourceType(this.sourceType)) && Number(this.bodyEl?.scrollTop || 0) > 4;
    this.panel?.classList.toggle("has-sticky-kind-shadow", _0x27c53f);
  }
  _selectSourceType(_0x34ba9b) {
    const _0x29a01e = normalizeSourceType(_0x34ba9b);
    if (!_0x29a01e) {
      return;
    }
    if (_0x29a01e === SOURCE_TYPES.runninghub && !this._guardRunningHubAiAppAccess(() => this._selectSourceType(SOURCE_TYPES.runninghub))) {
      return;
    }
    window.clearTimeout(this.parseTimer);
    if (this.sourceType) {
      this._saveKindState();
    }
    this.sourceType = _0x29a01e;
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this.sourceViewTransitionDirection = "forward";
    this._restoreKindState(this.kind);
    requestAnimationFrame(() => this.textarea?.focus());
  }
  _selectComfyUiRuntime(_0x442a52) {
    if (!this._isComfyUiSource()) {
      return;
    }
    const _0x3ab12e = getComfyUiSourceTypeFromBaseUrlMode(_0x442a52);
    if (_0x3ab12e === this.sourceType) {
      this._syncComfyUiRuntimeControl();
      return;
    }
    window.clearTimeout(this.parseTimer);
    this._saveKindState();
    this.sourceType = _0x3ab12e;
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._syncSourceView();
    if (this._getInputText().trim()) {
      const _0x5c6e08 = this._refreshBundleFromComponents({
        renderPreview: false
      });
      this._patchPreviewWithoutRebuild(_0x5c6e08 || this.currentBundle, {
        renderInputs: true,
        renderParams: true,
        renderAdvanced: true,
        renderPrompt: true,
        renderAppChrome: true,
        renderActionControls: true
      });
      return;
    }
    this._patchPreviewAppChrome();
    this._saveKindState();
  }
  _selectRunningHubRuntime(_0x40d189) {
    if (!this._isRunningHubAiAppSource()) {
      return;
    }
    const _0x5827a0 = normalizeRunningHubModelApiProfileId(_0x40d189);
    if (_0x5827a0 === this.runningHubProfileId) {
      this._syncRunningHubRuntimeControl();
      return;
    }
    window.clearTimeout(this.parseTimer);
    this.runningHubProfileId = _0x5827a0;
    this._syncRunningHubRuntimeControl();
    this._saveKindState();
    this._patchPreviewAppChrome();
  }
  _showSourceSelect() {
    window.clearTimeout(this.parseTimer);
    if (this.sourceType) {
      this._saveKindState();
    }
    this.sourceType = "";
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._closeComponentSelectMenus();
    this.sourceViewTransitionDirection = "back";
    this._syncSourceView();
    this._persistPanelDraft();
  }
  _openSourceSelect() {
    window.clearTimeout(this.parseTimer);
    const _0x20dbbb = this._isOpen();
    if (this.sourceType) {
      this._saveKindState();
    }
    this.sourceType = "";
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._closeComponentSelectMenus();
    this.sourceViewTransitionDirection = _0x20dbbb ? "back" : "";
    this._syncSourceView();
    this._persistPanelDraft();
    if (!_0x20dbbb) {
      this._open();
    }
  }
  _toggleSourceSelect() {
    if (this._isOpen()) {
      this._close();
      return;
    }
    this._openSourceSelect();
  }
  _isOpen() {
    return this.panel?.classList.contains("is-open") === true;
  }
  _open() {
    closeAllSidebarSubmenus();
    this._dropUnauthorizedRunningHubAiAppSource();
    this._syncSourceView();
    if (this.sourceType) {
      this._restoreKindState(this.kind);
    }
    this.panel?.classList.add("is-open");
    this.panel?.setAttribute("aria-hidden", "false");
    document.body?.classList?.add("rh-ai-app-panel-open");
    this.button?.classList.add("active");
    this.button?.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => this._syncStickyHeaderShadow());
    if (this.sourceType) {
      requestAnimationFrame(() => this.textarea?.focus());
    }
  }
  _close() {
    window.clearTimeout(this.parseTimer);
    this._resetSaveSuccessFeedback();
    this._saveKindState();
    this._clearSourceViewAnimation();
    this._closeComponentSelectMenus();
    this.contextMenuController.close();
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this.panel?.classList.remove("is-open");
    this.panel?.classList.remove("has-sticky-kind-shadow");
    this.panel?.setAttribute("aria-hidden", "true");
    document.body?.classList?.remove("rh-ai-app-panel-open");
    this.button?.classList.remove("active");
    this.button?.setAttribute("aria-expanded", "false");
  }
  _toggle() {
    if (this._isOpen()) {
      this._close();
    } else {
      this._open();
    }
  }
  _handlePanelClick(_0x46e8a7) {
    const _0xed50 = _0x46e8a7.target?.closest?.("[data-action]");
    if (_0xed50 && this.panel?.contains(_0xed50)) {
      const _0xe077b4 = _0xed50.dataset.action || "";
      if (_0xe077b4 === "close") {
        this._close();
        return;
      }
      if (_0xe077b4 === "select-source-type") {
        this._selectSourceType(_0xed50.dataset.sourceType);
        return;
      }
      if (_0xe077b4 === "back-to-source-types") {
        this._showSourceSelect();
        return;
      }
      if (_0xe077b4 === "select-comfyui-runtime") {
        this._selectComfyUiRuntime(_0xed50.dataset.comfyuiRuntime);
        return;
      }
      if (_0xe077b4 === "select-runninghub-runtime") {
        this._selectRunningHubRuntime(_0xed50.dataset.runninghubRuntime);
        return;
      }
      if (_0xe077b4 === "toggle-workflow-input") {
        this._toggleWorkflowInputCollapsed();
        return;
      }
      if (_0xe077b4 === "parse") {
        this._parseNow();
        return;
      }
      if (_0xe077b4 === "save-config") {
        this._closeComponentSelectMenus();
        this._saveConfigFromCurrentInput();
        return;
      }
      if (_0xe077b4 === "create") {
        this._closeComponentSelectMenus();
        this._createNodeFromCurrentInput();
        return;
      }
      if (_0xe077b4 === "toggle-component-select") {
        this._toggleComponentSelect(_0xed50);
        return;
      }
      if (_0xe077b4 === "choose-component-select") {
        this._chooseComponentSelect(_0xed50);
        return;
      }
      if (_0xe077b4 === "choose-preview-control-type") {
        this._choosePreviewControlType(_0xed50);
        return;
      }
      if (_0xe077b4 === "confirm-preview-rename") {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        const _0x572c07 = _0xed50.closest?.(".rh-ai-app-preview-rename-target")?.querySelector?.("[data-role='preview-rename-input']");
        this._commitPreviewInlineRename(_0x572c07);
        return;
      }
      if (_0xe077b4 === "rename-preview-param") {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._renamePreviewParamFromTypebar(_0xed50);
        return;
      }
      if (_0xe077b4 === "edit-preview-description") {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._editPreviewDescriptionFromTypebar(_0xed50);
        return;
      }
      if (_0xe077b4 === "toggle-preview-param-default") {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._togglePreviewParamDefault(_0xed50);
        return;
      }
      if (_0xe077b4 === "remove-preview-param") {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._removePreviewParam(_0xed50);
        return;
      }
      if (_0xe077b4 === "remove-preview-input") {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._removePreviewInput(_0xed50);
        return;
      }
      if (_0xe077b4 === "toggle-comfy-candidate-select") {
        this._toggleComfyCandidateMenu();
        return;
      }
      if (_0xe077b4 === "choose-comfy-candidate") {
        this._chooseComfyCandidate(_0xed50);
        return;
      }
      if (_0xe077b4 === "toggle-app-menu") {
        this._closeComponentSelectMenus();
        if (Number(_0x46e8a7.detail || 0) > 1) {
          return;
        }
        this.previewAppMenuOpen = !this.previewAppMenuOpen;
        this.pendingDeleteSavedAppId = "";
        this.pendingOverwriteSavedAppId = "";
        this.pendingOverwriteIntent = "";
        this._patchPreviewAppChrome();
        return;
      }
      if (_0xe077b4 === "load-saved-app") {
        this._closeComponentSelectMenus();
        this._loadSavedApp(_0xed50.dataset.savedAppId);
        return;
      }
      if (_0xe077b4 === "rename-current-app") {
        this._closeComponentSelectMenus();
        this.previewAppMenuOpen = false;
        this.pendingDeleteSavedAppId = "";
        this.pendingOverwriteSavedAppId = "";
        this.pendingOverwriteIntent = "";
        this._patchPreviewAppChrome();
        this._focusAppNameInput();
        return;
      }
      if (_0xe077b4 === "request-delete-app") {
        this._closeComponentSelectMenus();
        this.pendingDeleteSavedAppId = String(_0xed50.dataset.savedAppId || "");
        this.pendingOverwriteSavedAppId = "";
        this.pendingOverwriteIntent = "";
        this.previewAppMenuOpen = true;
        this._patchPreviewAppChrome();
        return;
      }
      if (_0xe077b4 === "confirm-delete-app") {
        this._closeComponentSelectMenus();
        this._deleteSavedApp(_0xed50.dataset.savedAppId);
        return;
      }
      if (_0xe077b4 === "cancel-delete-app") {
        this._closeComponentSelectMenus();
        this.pendingDeleteSavedAppId = "";
        this.previewAppMenuOpen = true;
        this._patchPreviewAppChrome();
        return;
      }
      if (_0xe077b4 === "confirm-overwrite-app") {
        this._closeComponentSelectMenus();
        this._confirmOverwriteSavedApp(_0xed50.dataset.savedAppId);
        return;
      }
      if (_0xe077b4 === "cancel-overwrite-app") {
        this._closeComponentSelectMenus();
        const _0xddf72 = Boolean(_0xed50.closest?.("[data-role='save-config-menu'], [data-role='create-config-menu']"));
        this._clearPendingOverwrite({
          keepMenuOpen: !_0xddf72
        });
        return;
      }
    }
    const _0x5801b8 = _0x46e8a7.target?.closest?.(".rh-ai-app-preview-description-target");
    if (_0x5801b8 && this.panel?.contains(_0x5801b8)) {
      const _0x35b160 = Number(_0x5801b8.dataset.previewComponentIndex);
      const _0x560784 = _0x5801b8.classList.contains("rh-ai-app-preview-prompt-help-tip");
      if (Number.isInteger(_0x35b160) || _0x560784) {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._startPreviewInlineDescriptionEdit(_0x5801b8, _0x35b160);
        return;
      }
    }
    if (this._isPreviewControlTarget(_0x46e8a7.target)) {
      return;
    }
    if (this.previewDragController.consumeSuppressedRenameClickForTarget(_0x46e8a7)) {
      return;
    }
    const _0x1d2bf8 = _0x46e8a7.target?.closest?.(".rh-ai-app-preview-rename-target");
    if (_0x1d2bf8 && this.panel?.contains(_0x1d2bf8)) {
      const _0x1f1089 = Number(_0x1d2bf8.dataset.previewComponentIndex);
      if (Number.isInteger(_0x1f1089)) {
        _0x46e8a7.preventDefault();
        _0x46e8a7.stopPropagation();
        this._startPreviewInlineRename(_0x1d2bf8, _0x1f1089);
        return;
      }
    }
    const _0x4f5eeb = _0x46e8a7.target?.closest?.(".rh-ai-app-kind-tabs [data-kind]");
    if (!_0x4f5eeb || !this.panel?.contains(_0x4f5eeb)) {
      const _0x394f09 = _0x46e8a7.target?.closest?.("[data-role='saved-app-menu']");
      const _0x3f1296 = _0x46e8a7.target?.closest?.("[data-role='save-config-menu'], [data-action='save-config']");
      const _0x3c4ff8 = _0x46e8a7.target?.closest?.("[data-role='create-config-menu'], [data-action='create']");
      const _0xee629d = _0x46e8a7.target?.closest?.(".rh-ai-app-preview-model-trigger");
      const _0x3acec1 = _0x46e8a7.target?.closest?.("[data-component-select]");
      const _0x5943da = _0x46e8a7.target?.closest?.(".rh-ai-app-comfy-add-panel, [data-role='comfyui-candidate-menu']");
      if (!_0x3acec1 && !_0x5943da) {
        this._closeComponentSelectMenus();
      }
      if (!_0x394f09 && !_0xee629d && this.previewAppMenuOpen) {
        this.previewAppMenuOpen = false;
        this.pendingDeleteSavedAppId = "";
        this.pendingOverwriteSavedAppId = "";
        this.pendingOverwriteIntent = "";
        this._patchPreviewAppChrome();
      }
      if (!_0x3f1296 && this.pendingOverwriteIntent === "save" && this.pendingOverwriteSavedAppId) {
        this._clearPendingOverwrite();
      }
      if (!_0x3c4ff8 && this.pendingOverwriteIntent === "create" && this.pendingOverwriteSavedAppId) {
        this._clearPendingOverwrite();
      }
      return;
    }
    const _0x2fbfcb = _0x4f5eeb.dataset.kind;
    if (_0x2fbfcb) {
      this._closeComponentSelectMenus();
      this._setKind(_0x2fbfcb);
    }
  }
  _handlePanelDoubleClick(_0x64676e) {
    const _0x47ad7f = _0x64676e.target?.closest?.(".rh-ai-app-preview-model-trigger");
    if (_0x47ad7f && this.panel?.contains(_0x47ad7f)) {
      _0x64676e.preventDefault();
      _0x64676e.stopPropagation();
      this.previewAppMenuOpen = false;
      this.pendingDeleteSavedAppId = "";
      this.pendingOverwriteSavedAppId = "";
      this.pendingOverwriteIntent = "";
      this._patchPreviewAppChrome();
      this._focusAppNameInput();
      return;
    }
    if (this._isPreviewControlTarget(_0x64676e.target) || this._isPreviewRenameTarget(_0x64676e.target)) {
      return;
    }
    const _0x1f0003 = _0x64676e.target?.closest?.(".rh-ai-app-preview-rename-target");
    if (!_0x1f0003 || !this.panel?.contains(_0x1f0003)) {
      return;
    }
    const _0x493515 = _0x1f0003.closest?.("[data-preview-component-index]");
    const _0xc1b090 = Number(_0x493515?.dataset?.previewComponentIndex || _0x1f0003.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0xc1b090)) {
      return;
    }
    _0x64676e.preventDefault();
    _0x64676e.stopPropagation();
    this._startPreviewInlineRename(_0x1f0003, _0xc1b090);
  }
  _syncKindTabs() {
    const _0x5dad34 = normalizeKind(this.kind);
    this.kindTabsEl?.classList.toggle("is-kind-image", _0x5dad34 === "image");
    this.kindTabsEl?.classList.toggle("is-kind-video", _0x5dad34 === "video");
    this.kindTabsEl?.classList.toggle("is-kind-audio", _0x5dad34 === "audio");
    this.panel?.querySelectorAll(".rh-ai-app-kind-tabs button").forEach(_0xdfd0d2 => {
      const _0x79f045 = _0xdfd0d2.dataset.kind === _0x5dad34;
      _0xdfd0d2.classList.toggle("active", _0x79f045);
      _0xdfd0d2.setAttribute("aria-pressed", _0x79f045 ? "true" : "false");
    });
  }
  _setKind(_0x275232) {
    const _0xb4f671 = normalizeKind(_0x275232);
    if (_0xb4f671 === this.kind) {
      return;
    }
    window.clearTimeout(this.parseTimer);
    this._saveKindState();
    this.kind = _0xb4f671;
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._syncKindTabs();
    this._restoreKindState(_0xb4f671);
  }
  _saveKindState(_0x2c877a = this.kind) {
    if (!this.sourceType) {
      this._persistPanelDraft();
      return;
    }
    const _0x45c6a9 = normalizeKind(_0x2c877a);
    this.kindStates[this._getStateKey(_0x45c6a9)] = {
      input: this._getInputText(),
      appName: this.appName,
      appDescription: this.appDescription,
      promptHelpTooltip: this.promptHelpTooltip,
      runningHubProfileId: this.runningHubProfileId,
      savedAppId: this.savedAppId,
      componentDraftKey: this.componentDraftKey,
      componentDrafts: cloneComponentDrafts(this.componentDrafts),
      componentCandidates: cloneComponentDrafts(this.componentCandidates),
      currentBundle: this.currentBundle,
      errorMessage: this.errorMessage || ""
    };
    this._persistPanelDraft();
  }
  _persistPanelDraft() {
    this.configRepository.savePanelDraft({
      sourceType: this.sourceType,
      kind: this.kind,
      kindStates: this.kindStates
    });
  }
  _restoreKindState(_0x56d86d = this.kind) {
    if (!this.sourceType) {
      this._syncSourceView();
      return;
    }
    const _0x7afb0 = normalizeKind(_0x56d86d);
    const _0x2fc822 = this._getStateKey(_0x7afb0);
    const _0x218d59 = isComfyUiSource(this.sourceType) ? this.configRepository.getLegacyKindStateKey(this.sourceType, _0x7afb0) : "";
    const _0x2bea96 = this.sourceType === SOURCE_TYPES.runninghub ? this.kindStates[_0x7afb0] : null;
    const _0x3b02d8 = this.kindStates[_0x2fc822] || (_0x218d59 ? this.kindStates[_0x218d59] : null) || _0x2bea96 || this.configRepository.createEmptyKindState();
    this.kindStates[_0x2fc822] = _0x3b02d8;
    this.kind = _0x7afb0;
    this._syncSourceView();
    this._syncKindTabs();
    if (this.textarea) {
      this.textarea.value = _0x3b02d8.input || "";
    }
    this.appName = _0x3b02d8.appName || DEFAULT_AI_APP_NAME;
    this.appDescription = normalizeAppDescription(_0x3b02d8.appDescription);
    this.promptHelpTooltip = normalizePromptHelpTooltip(_0x3b02d8.promptHelpTooltip);
    this.runningHubProfileId = normalizeRunningHubModelApiProfileId(_0x3b02d8.runningHubProfileId || getDefaultRunningHubProfileId());
    this._syncRunningHubRuntimeControl();
    this.savedAppId = _0x3b02d8.savedAppId || "";
    this.componentDraftKey = _0x3b02d8.componentDraftKey || "";
    this.componentDrafts = cloneComponentDrafts(_0x3b02d8.componentDrafts);
    this.componentCandidates = cloneComponentDrafts(_0x3b02d8.componentCandidates);
    this.currentBundle = _0x3b02d8.currentBundle || null;
    let _0x3140ad = _0x3b02d8.errorMessage || "";
    if (!this.currentBundle && this._getInputText().trim()) {
      try {
        this.currentBundle = this._buildCurrentBundle({
          syncComponents: this.componentDrafts.length === 0
        });
        _0x3140ad = "";
      } catch (_0x193f8d) {
        this.currentBundle = null;
        _0x3140ad = _0x3140ad || _0x193f8d?.message || "解析失败";
      }
    }
    this._renderComponentConfig();
    this._patchPreviewWithoutRebuild(this.currentBundle, {
      renderInputs: true,
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: true,
      renderAppChrome: true,
      renderActionControls: true
    });
    this._setSummary(this.currentBundle);
    this._setError(_0x3140ad);
    this._setActionButtonsEnabled(!!this.currentBundle);
    this._saveKindState(_0x7afb0);
  }
  _focusAppNameInput() {
    const _0x25f4d5 = this.componentListEl?.querySelector?.("[data-app-prop='appName']");
    if (!_0x25f4d5) {
      return;
    }
    _0x25f4d5.scrollIntoView?.({
      block: "nearest",
      inline: "nearest"
    });
    _0x25f4d5.focus();
    _0x25f4d5.select?.();
  }
  _startPreviewInlineRename(_0xb96000, _0x502d69) {
    const _0xdc474f = Number(_0x502d69);
    if (!Number.isInteger(_0xdc474f)) {
      return;
    }
    const _0x5b298c = _0xb96000?.closest?.(".rh-ai-app-preview-rename-target");
    if (!_0x5b298c || !this.nodePreviewEl?.contains?.(_0x5b298c)) {
      return;
    }
    if (_0x5b298c.querySelector?.("[data-role='preview-rename-input']")) {
      return;
    }
    const _0x21d189 = getComponentByIndex(this.componentDrafts, _0xdc474f);
    if (!_0x21d189) {
      return;
    }
    const _0x40659b = _0x5b298c.closest?.(".rh-ai-app-preview-input-slot");
    const _0x42dece = String(_0x21d189.label || _0x21d189.fieldName || "组件").trim() || "组件";
    const _0x4873e2 = _0x40659b && isMediaComponent(_0x21d189) ? normalizeInputSlotLabel(_0x42dece) : _0x42dece;
    const _0xaec54c = _0x40659b ? " maxlength=\"" + INPUT_SLOT_LABEL_INPUT_MAX_LENGTH + "\"" : "";
    _0x40659b?.classList?.add("is-inline-editing");
    _0x5b298c.classList.add("is-renaming");
    const _0x33e437 = "<input type=\"text\" class=\"rh-ai-app-preview-rename-input\" data-role=\"preview-rename-input\" data-preview-component-index=\"" + _0xdc474f + "\" data-original-label=\"" + escapeHtml(_0x4873e2) + "\" value=\"" + escapeHtml(_0x4873e2) + "\" aria-label=\"组件名\"" + _0xaec54c + ">";
    _0x5b298c.innerHTML = _0x40659b ? "<span class=\"rh-ai-app-preview-slot-rename-shell\">" + _0x33e437 + "<button type=\"button\" class=\"rh-ai-app-preview-rename-confirm\" data-action=\"confirm-preview-rename\" data-preview-component-index=\"" + _0xdc474f + "\" aria-label=\"确认重命名\">&#10003;</button></span>" : _0x33e437;
    const _0x1ae884 = _0x5b298c.querySelector("[data-role='preview-rename-input']");
    if (!_0x1ae884) {
      return;
    }
    const _0x275ea3 = () => {
      _0x1ae884.focus();
      _0x1ae884.select?.();
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(_0x275ea3);
    } else {
      _0x275ea3();
    }
  }
  _restorePreviewInlineRename(_0x192ed2) {
    const _0x5647e8 = Number(_0x192ed2?.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0x5647e8)) {
      return;
    }
    const _0x54ff89 = _0x192ed2.closest?.(".rh-ai-app-preview-rename-target");
    const _0x559ab6 = getComponentByIndex(this.componentDrafts, _0x5647e8);
    if (!_0x54ff89 || !_0x559ab6) {
      return;
    }
    const _0x30f0b2 = String(_0x559ab6.label || _0x559ab6.fieldName || _0x192ed2.dataset.originalLabel || "组件").trim() || "组件";
    const _0x1762f0 = isMediaComponent(_0x559ab6) ? normalizeInputSlotLabel(_0x30f0b2) : _0x30f0b2;
    _0x54ff89.closest?.(".rh-ai-app-preview-input-slot")?.classList?.remove("is-inline-editing");
    _0x54ff89.classList.remove("is-renaming");
    _0x54ff89.classList.toggle("rh-ai-app-preview-input-label--latin", isMediaComponent(_0x559ab6) && INPUT_SLOT_LABEL_LATIN_RE.test(_0x1762f0));
    _0x54ff89.textContent = _0x1762f0;
  }
  _commitPreviewInlineRename(_0x43019a, {
    cancel = false
  } = {}) {
    if (!_0x43019a || _0x43019a.dataset.committing === "true") {
      return;
    }
    _0x43019a.dataset.committing = "true";
    const _0x85859c = Number(_0x43019a.dataset.previewComponentIndex);
    if (!Number.isInteger(_0x85859c)) {
      return;
    }
    const _0x20beb3 = String(_0x43019a.dataset.originalLabel || "").trim();
    const _0x564368 = getComponentByIndex(this.componentDrafts, _0x85859c);
    const _0x147c15 = _0x564368 && isMediaComponent(_0x564368) ? normalizeInputSlotLabel(_0x43019a.value, "") : String(_0x43019a.value || "").trim();
    if (_0x564368 && isMediaComponent(_0x564368) && _0x43019a.value !== _0x147c15) {
      _0x43019a.value = _0x147c15;
    }
    if (cancel || !_0x147c15 || _0x147c15 === _0x20beb3) {
      this._restorePreviewInlineRename(_0x43019a);
      return;
    }
    this._updateComponentDraft(_0x85859c, "label", _0x147c15);
  }
  _startPreviewInlineDescriptionEdit(_0x53cacd, _0x167b69 = NaN) {
    const _0x1ff6d3 = Number(_0x167b69);
    const _0x6a0d5e = _0x53cacd?.closest?.(".rh-ai-app-preview-description-target");
    if (!_0x6a0d5e || !this.nodePreviewEl?.contains?.(_0x6a0d5e)) {
      return;
    }
    const _0x14aa6f = _0x6a0d5e.classList.contains("rh-ai-app-preview-prompt-help-tip");
    if (!Number.isInteger(_0x1ff6d3) && !_0x14aa6f) {
      return;
    }
    const _0x25b63f = this.nodePreviewEl?.querySelector?.("[data-role='preview-description-input']");
    if (_0x25b63f) {
      this._commitPreviewInlineDescriptionEdit(_0x25b63f);
    }
    const _0x12f180 = Number.isInteger(_0x1ff6d3) ? getComponentByIndex(this.componentDrafts, _0x1ff6d3) : null;
    if (Number.isInteger(_0x1ff6d3) && !_0x12f180) {
      return;
    }
    const _0x2f1d3d = Boolean(_0x6a0d5e.closest?.(".rh-ai-app-preview-advanced-param") || _0x6a0d5e.classList.contains("rh-ai-app-preview-param-description-tip"));
    const _0x1f70b0 = _0x14aa6f ? "提示词说明" : "参数说明";
    const _0x4d9f8f = _0x14aa6f ? String(_0x6a0d5e.getAttribute("data-tooltip") || getPreviewComponentDescription(_0x12f180, _0x1f70b0)).trim() || _0x1f70b0 : getPreviewComponentDescription(_0x12f180, _0x1f70b0);
    const _0x3a0652 = document.createElement("input");
    _0x3a0652.type = "text";
    _0x3a0652.className = ["rh-ai-app-preview-description-input", _0x14aa6f ? "rh-ai-app-preview-description-input--prompt" : "", _0x2f1d3d ? "rh-ai-app-preview-description-input--param" : ""].filter(Boolean).join(" ");
    _0x3a0652.dataset.role = "preview-description-input";
    if (Number.isInteger(_0x1ff6d3)) {
      _0x3a0652.dataset.previewComponentIndex = String(_0x1ff6d3);
    }
    if (_0x14aa6f) {
      _0x3a0652.dataset.previewDescriptionScope = "prompt-help";
    }
    _0x3a0652.dataset.originalDescription = _0x4d9f8f;
    _0x3a0652.value = _0x4d9f8f;
    _0x3a0652.placeholder = _0x1f70b0;
    _0x3a0652.setAttribute("aria-label", _0x1f70b0);
    _0x6a0d5e.replaceWith(_0x3a0652);
    const _0x4d6d1e = () => {
      _0x3a0652.focus();
      _0x3a0652.select?.();
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(_0x4d6d1e);
    } else {
      _0x4d6d1e();
    }
  }
  _restorePreviewInlineDescriptionEdit() {
    const _0x100cda = this._refreshBundleFromComponents({
      renderPreview: false
    });
    this._patchPreviewWithoutRebuild(_0x100cda, {
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: true
    });
  }
  _commitPreviewInlineDescriptionEdit(_0x145c0b, {
    cancel = false
  } = {}) {
    if (!_0x145c0b || _0x145c0b.dataset.committing === "true") {
      return;
    }
    _0x145c0b.dataset.committing = "true";
    const _0x2a3121 = Number(_0x145c0b.dataset.previewComponentIndex);
    const _0xb47a2b = _0x145c0b.dataset.previewDescriptionScope === "prompt-help";
    if (!Number.isInteger(_0x2a3121) && !_0xb47a2b) {
      return;
    }
    const _0x13c15d = String(_0x145c0b.dataset.originalDescription || "").trim();
    const _0x46ebb = String(_0x145c0b.value || "").trim();
    if (cancel || !_0x46ebb || _0x46ebb === _0x13c15d) {
      this._restorePreviewInlineDescriptionEdit();
      return;
    }
    if (!Number.isInteger(_0x2a3121) && _0xb47a2b) {
      this._updatePromptHelpTooltip(_0x46ebb);
      return;
    }
    this._updateComponentDraft(_0x2a3121, "description", _0x46ebb);
  }
  _handlePanelKeyDown(_0x4974be) {
    const _0x41c502 = _0x4974be.target?.closest?.(".rh-ai-app-preview-description-target");
    if (_0x41c502 && this.panel?.contains(_0x41c502)) {
      if (_0x4974be.key === "Enter" || _0x4974be.key === " ") {
        const _0x52721b = Number(_0x41c502.dataset.previewComponentIndex);
        const _0x2beef8 = _0x41c502.classList.contains("rh-ai-app-preview-prompt-help-tip");
        if (Number.isInteger(_0x52721b) || _0x2beef8) {
          _0x4974be.preventDefault();
          _0x4974be.stopPropagation();
          this._startPreviewInlineDescriptionEdit(_0x41c502, _0x52721b);
        }
      }
      return;
    }
    const _0x51d003 = _0x4974be.target?.closest?.("[data-role='preview-description-input']");
    if (_0x51d003 && this.panel?.contains(_0x51d003)) {
      if (_0x4974be.key === "Enter") {
        _0x4974be.preventDefault();
        _0x4974be.stopPropagation();
        this._commitPreviewInlineDescriptionEdit(_0x51d003);
        return;
      }
      if (_0x4974be.key === "Escape") {
        _0x4974be.preventDefault();
        _0x4974be.stopPropagation();
        this._commitPreviewInlineDescriptionEdit(_0x51d003, {
          cancel: true
        });
      }
      return;
    }
    const _0x279253 = _0x4974be.target?.closest?.("[data-role='preview-rename-input']");
    if (!_0x279253 || !this.panel?.contains(_0x279253)) {
      return;
    }
    if (_0x4974be.key === "Enter") {
      _0x4974be.preventDefault();
      _0x4974be.stopPropagation();
      this._commitPreviewInlineRename(_0x279253);
      return;
    }
    if (_0x4974be.key === "Escape") {
      _0x4974be.preventDefault();
      _0x4974be.stopPropagation();
      this._commitPreviewInlineRename(_0x279253, {
        cancel: true
      });
    }
  }
  _handlePanelFocusOut(_0x152b52) {
    const _0xea6074 = _0x152b52.target?.closest?.("[data-role='preview-description-input']");
    if (_0xea6074 && this.panel?.contains(_0xea6074)) {
      this._commitPreviewInlineDescriptionEdit(_0xea6074);
      return;
    }
    const _0x5cc148 = _0x152b52.target?.closest?.("[data-role='preview-rename-input']");
    if (!_0x5cc148 || !this.panel?.contains(_0x5cc148)) {
      return;
    }
    const _0x45554f = _0x152b52.relatedTarget?.closest?.("[data-action='confirm-preview-rename']");
    if (_0x45554f && this.panel?.contains(_0x45554f)) {
      return;
    }
    this._commitPreviewInlineRename(_0x5cc148);
  }
  _closeComponentSelectMenus(_0x190932 = null, {
    preserveComfyPicker = false
  } = {}) {
    this.componentListEl?.querySelectorAll?.("[data-component-select].is-open").forEach(_0x572ba4 => {
      if (_0x190932 && _0x572ba4 === _0x190932) {
        return;
      }
      _0x572ba4.classList.remove("is-open");
      _0x572ba4.querySelector(".rh-ai-app-select-trigger")?.setAttribute("aria-expanded", "false");
    });
    if (preserveComfyPicker) {
      return;
    }
    this.comfyCandidatePickerOpen = false;
    if (this.componentPickerEl) {
      this.componentPickerEl.hidden = false;
      this.componentPickerEl.setAttribute("aria-hidden", "true");
      const _0x20fa24 = this.componentPickerEl.closest?.(".rh-ai-app-comfy-add-panel");
      _0x20fa24?.classList?.remove("is-open");
      const _0x184e29 = _0x20fa24?.querySelector?.("[data-action='toggle-comfy-candidate-select']");
      _0x184e29?.setAttribute("aria-expanded", "false");
      if (_0x184e29) {
        _0x184e29.textContent = "点击添加组件";
      }
    }
  }
  _closeInlineMenusBeforeContextMenu() {
    this._closeComponentSelectMenus();
    if (!this.previewAppMenuOpen) {
      return;
    }
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    const _0x592be5 = this.panel?.querySelector?.("[data-role='saved-app-menu']");
    if (_0x592be5) {
      _0x592be5.hidden = true;
    }
  }
  _toggleComponentSelect(_0x2ab3f4) {
    const _0x2840c8 = _0x2ab3f4?.closest?.("[data-component-select]");
    if (!_0x2840c8 || !this.panel?.contains(_0x2840c8)) {
      return;
    }
    const _0x33b4c7 = !_0x2840c8.classList.contains("is-open");
    this._closeComponentSelectMenus(_0x2840c8);
    _0x2840c8.classList.toggle("is-open", _0x33b4c7);
    _0x2ab3f4.setAttribute("aria-expanded", _0x33b4c7 ? "true" : "false");
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._patchPreviewAppChrome();
  }
  _chooseComponentSelect(_0x2f9c1f) {
    const _0x316570 = _0x2f9c1f?.closest?.("[data-component-index]");
    const _0x24dceb = Number(_0x316570?.dataset.componentIndex);
    const _0x37fa75 = String(_0x2f9c1f?.dataset?.componentProp || "");
    if (!Number.isInteger(_0x24dceb) || !_0x37fa75) {
      return;
    }
    this._closeComponentSelectMenus();
    this._updateComponentDraft(_0x24dceb, _0x37fa75, _0x2f9c1f.dataset.value);
  }
  _choosePreviewControlType(_0x514d6b) {
    const _0x42a0f7 = Number(_0x514d6b?.dataset?.previewComponentIndex);
    const _0x1182de = String(_0x514d6b?.dataset?.value || "");
    if (!Number.isInteger(_0x42a0f7) || !_0x1182de) {
      return;
    }
    const _0x1e9e56 = getComponentByIndex(this.componentDrafts, _0x42a0f7);
    const _0xfdb201 = normalizeControlType(_0x1182de);
    const _0x2340ba = _0xfdb201 === "prompt" && _0x1e9e56 && normalizeComponentKind(_0x1e9e56.componentKind) !== "prompt";
    const _0x2faf7a = PREVIEW_PARAM_TEXT_TYPE_VALUES.includes(_0xfdb201) && _0x1e9e56 && normalizeComponentKind(_0x1e9e56.componentKind) === "prompt";
    const _0x11799e = _0x2340ba || _0x2faf7a ? this.previewDragController.captureComponentRect(_0x42a0f7) : null;
    this._closeComponentSelectMenus();
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    const _0x3b2f35 = normalizeControlType(_0x1182de) === "prompt" ? "componentKind" : "controlType";
    this._updateComponentDraft(_0x42a0f7, _0x3b2f35, _0x1182de, {
      animatePreviewMoveFromRect: _0x11799e,
      preferredPreviewPlacement: _0x2faf7a ? "advanced" : ""
    });
  }
  _setError(_0xfe0093) {
    const _0x430088 = String(_0xfe0093 || "").trim();
    this.errorMessage = _0x430088;
    if (!this.errorEl) {
      return;
    }
    this.errorEl.hidden = !_0x430088;
    this.errorEl.textContent = _0x430088;
  }
  _setSummary(_0x3e6d5c) {
    if (!this.summaryEl) {
      return;
    }
    const _0x43a762 = _0x3e6d5c ? this._isComfyUiSource() ? summarizeComfyUiWorkflowBundle(_0x3e6d5c) : summarizeRunningHubAiAppBundle(_0x3e6d5c) : null;
    this.summaryEl.innerHTML = renderSummaryHtml(_0x43a762, this._getSourceMeta()?.emptyText);
    this._syncWorkflowInputCollapsed();
  }
  _getWorkflowInputSummaryText(_0x556a44 = this.currentBundle) {
    if (!_0x556a44) {
      return "";
    }
    const _0xa04bec = this._isComfyUiSource() ? summarizeComfyUiWorkflowBundle(_0x556a44) : summarizeRunningHubAiAppBundle(_0x556a44);
    if (!_0xa04bec?.modelId) {
      return "";
    }
    const _0x142a22 = this._getSourceMeta()?.label || "工作流";
    const _0x3faf06 = OUTPUT_KIND_LABELS[_0xa04bec.kind] || _0xa04bec.kind;
    const _0x59a97e = Number(_0xa04bec.slotCount ?? _0xa04bec.slots?.length ?? 0);
    const _0x30b117 = Number(_0xa04bec.paramCount ?? _0xa04bec.params?.length ?? 0);
    return _0x142a22 + " · " + _0x3faf06 + " · " + _0x59a97e + " 个入参 · " + _0x30b117 + " 个参数";
  }
  _syncWorkflowInputCollapsed() {
    const _0x3a464e = Boolean(this.currentBundle);
    if (!_0x3a464e) {
      this.workflowInputCollapsed = false;
    }
    this.workflowInputFieldEl?.classList?.toggle("is-collapsed", _0x3a464e && this.workflowInputCollapsed);
    if (this.workflowInputToggleBtn) {
      this.workflowInputToggleBtn.hidden = !_0x3a464e;
      this.workflowInputToggleBtn.textContent = this.workflowInputCollapsed ? "展开 JSON" : "收起 JSON";
      this.workflowInputToggleBtn.setAttribute("aria-expanded", this.workflowInputCollapsed ? "false" : "true");
    }
    if (this.workflowInputSummaryEl) {
      const _0x5ae646 = this._getWorkflowInputSummaryText();
      const _0xaf75e2 = Boolean(_0x5ae646);
      const _0x3332c5 = _0x3a464e && this.workflowInputCollapsed && _0xaf75e2;
      this.workflowInputSummaryEl.hidden = !_0xaf75e2;
      this.workflowInputSummaryEl.classList?.toggle("is-visible", _0x3332c5);
      this.workflowInputSummaryEl.setAttribute("aria-hidden", _0x3332c5 ? "false" : "true");
      if (_0xaf75e2) {
        this.workflowInputSummaryEl.textContent = _0x5ae646;
      }
    }
  }
  _toggleWorkflowInputCollapsed() {
    if (!this.currentBundle) {
      return;
    }
    this.workflowInputCollapsed = !this.workflowInputCollapsed;
    this._syncWorkflowInputCollapsed();
  }
  _getInputText() {
    return this.textarea?.value || "";
  }
  _getAppIdText() {
    return "";
  }
  _setWorkflowJsonDropActive(_0x9efc05) {
    if (!_0x9efc05) {
      this.workflowJsonDragDepth = 0;
    }
    this.workflowInputFieldEl?.classList?.toggle("is-json-drag-over", _0x9efc05 === true);
  }
  _canAcceptWorkflowJsonDrop(_0x1ee7af) {
    return Boolean(this.sourceType && hasFileDragPayload(_0x1ee7af));
  }
  _handleWorkflowJsonFileDragEnter(_0x45881b) {
    if (!this._canAcceptWorkflowJsonDrop(_0x45881b)) {
      return;
    }
    _0x45881b.preventDefault();
    _0x45881b.stopPropagation();
    this.workflowJsonDragDepth += 1;
    this._setWorkflowJsonDropActive(true);
    if (_0x45881b.dataTransfer) {
      _0x45881b.dataTransfer.dropEffect = "copy";
    }
  }
  _handleWorkflowJsonFileDragOver(_0x88e5fb) {
    if (!this._canAcceptWorkflowJsonDrop(_0x88e5fb)) {
      return;
    }
    _0x88e5fb.preventDefault();
    _0x88e5fb.stopPropagation();
    this._setWorkflowJsonDropActive(true);
    if (_0x88e5fb.dataTransfer) {
      _0x88e5fb.dataTransfer.dropEffect = "copy";
    }
  }
  _handleWorkflowJsonFileDragLeave(_0x4f2b6a) {
    if (!this._canAcceptWorkflowJsonDrop(_0x4f2b6a)) {
      return;
    }
    _0x4f2b6a.preventDefault();
    _0x4f2b6a.stopPropagation();
    this.workflowJsonDragDepth = Math.max(0, this.workflowJsonDragDepth - 1);
    if (this.workflowJsonDragDepth === 0) {
      this._setWorkflowJsonDropActive(false);
    }
  }
  async _handleWorkflowJsonFileDrop(_0x2ce884) {
    if (!this._canAcceptWorkflowJsonDrop(_0x2ce884)) {
      return;
    }
    _0x2ce884.preventDefault();
    _0x2ce884.stopPropagation();
    this._setWorkflowJsonDropActive(false);
    const [_0x133ddc] = Array.from(_0x2ce884.dataTransfer?.files || []);
    if (!_0x133ddc) {
      return;
    }
    if (!isJsonFile(_0x133ddc)) {
      const _0x2a0c56 = "请拖入 .json 文件";
      this._setError(_0x2a0c56);
      window.showToast?.(_0x2a0c56, "error");
      return;
    }
    try {
      const _0x53a946 = await _0x133ddc.text();
      window.clearTimeout(this.parseTimer);
      if (this.textarea) {
        this.textarea.value = String(_0x53a946 || "");
      }
      this.appName = normalizeDroppedJsonAppName(_0x133ddc.name);
      this.savedAppId = "";
      this.workflowInputCollapsed = false;
      this.previewAppMenuOpen = false;
      this.pendingDeleteSavedAppId = "";
      this.pendingOverwriteSavedAppId = "";
      this.pendingOverwriteIntent = "";
      this._closeComponentSelectMenus();
      const _0x35a606 = this._parseNow();
      if (_0x35a606) {
        window.showToast?.("JSON 文件已载入", "success");
      }
    } catch (_0x4eea17) {
      const _0x738e25 = _0x4eea17?.message || "JSON 文件读取失败";
      this._setError(_0x738e25);
      window.showToast?.(_0x738e25, "error");
    }
  }
  _getComponentDraftKey(_0x2f9507 = this._getInputText(), _0x54d157 = this._getAppIdText()) {
    const _0x2b3fcd = isComfyUiSource(this.sourceType) ? COMFYUI_WORKFLOW_STATE_SCOPE : String(this.sourceType || "").trim();
    return _0x2b3fcd + "\n" + String(_0x54d157 || "").trim() + "\n" + String(_0x2f9507 || "").trim();
  }
  _syncComponentDrafts({
    force = false
  } = {}) {
    const _0x40d9c6 = this._getInputText();
    const _0x4ef457 = this._getAppIdText();
    const _0x5b174 = this._getComponentDraftKey(_0x40d9c6, _0x4ef457);
    if (!force && _0x5b174 === this.componentDraftKey && (this.componentDrafts.length || this.componentCandidates.length)) {
      return;
    }
    if (this._isComfyUiSource()) {
      const {
        components: _0x178597
      } = createComfyUiWorkflowComponentDrafts(_0x40d9c6);
      this.componentDraftKey = _0x5b174;
      this.comfyCandidateSearchText = "";
      this.comfyCandidatePickerOpen = false;
      this.componentCandidates = cloneComponentDrafts(_0x178597);
      this.componentDrafts = preserveComfyComponentDrafts(this.componentDrafts, _0x178597);
      this._renderComponentConfig();
      return;
    }
    const {
      parsed: _0x44caa1,
      components: _0x2bc336
    } = createRunningHubAiAppComponentDrafts(_0x40d9c6, {
      appId: _0x4ef457
    });
    if (_0x44caa1.providerProfileId) {
      this.runningHubProfileId = normalizeRunningHubModelApiProfileId(_0x44caa1.providerProfileId);
      this._syncRunningHubRuntimeControl();
    }
    this.componentDraftKey = _0x5b174;
    this.componentDrafts = cloneComponentDrafts(_0x2bc336);
    this.componentCandidates = [];
    this.comfyCandidatePickerOpen = false;
    this._renderComponentConfig();
  }
  _renderComponentConfig() {
    if (this.componentListEl) {
      this.componentListEl.innerHTML = renderComponentConfigHtml(this.componentDrafts, this.appName, this.appDescription, {});
    }
    if (this.builderEl) {
      this.builderEl.hidden = false;
    }
  }
  _renderComfyCandidatePicker({
    open = false,
    preserveSearchFocus = false
  } = {}) {
    if (!this.componentPickerEl) {
      return;
    }
    const _0x29f4d6 = this._isComfyUiSource() && Boolean(this.componentDraftKey);
    if (!_0x29f4d6) {
      this.comfyCandidatePickerOpen = false;
      this.componentPickerEl.hidden = true;
      this.componentPickerEl.setAttribute("aria-hidden", "true");
      this.componentPickerEl.innerHTML = "";
      return;
    }
    this.comfyCandidatePickerOpen = open === true;
    const _0x40c180 = new Set(this.componentDrafts.map(_0x10ac14 => Number(_0x10ac14?.index)).filter(_0x269f01 => Number.isInteger(_0x269f01)));
    this.componentPickerEl.innerHTML = renderComfyUiCandidateMenuHtml(this.componentCandidates, _0x40c180, this.comfyCandidateSearchText);
    this.componentPickerEl.hidden = false;
    this.componentPickerEl.setAttribute("aria-hidden", open === true ? "false" : "true");
    const _0x5dd2d2 = this.componentPickerEl.closest?.(".rh-ai-app-comfy-add-panel");
    _0x5dd2d2?.classList?.toggle("is-open", open === true);
    const _0x17820b = _0x5dd2d2?.querySelector?.("[data-action='toggle-comfy-candidate-select']");
    _0x17820b?.setAttribute("aria-expanded", open === true ? "true" : "false");
    if (_0x17820b) {
      _0x17820b.textContent = open === true ? "收起组件" : "点击添加组件";
    }
    if (open && preserveSearchFocus) {
      const _0x1e6158 = _0x5dd2d2?.querySelector("[data-role='comfyui-candidate-search']");
      const _0x538daf = String(this.comfyCandidateSearchText || "").length;
      _0x1e6158?.focus?.();
      _0x1e6158?.setSelectionRange?.(_0x538daf, _0x538daf);
    }
  }
  _toggleComfyCandidateMenu() {
    if (!this._isComfyUiSource()) {
      return;
    }
    if (!this.componentDraftKey) {
      this.comfyCandidatePickerOpen = false;
      this._renderComfyCandidatePicker({
        open: false
      });
      return;
    }
    const _0x117cb8 = this.comfyCandidatePickerOpen !== true;
    this._closeComponentSelectMenus(null, {
      preserveComfyPicker: true
    });
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    if (_0x117cb8) {
      this.comfyCandidateSearchText = "";
    }
    this.comfyCandidatePickerOpen = _0x117cb8;
    this._renderComfyCandidatePicker({
      open: _0x117cb8
    });
  }
  _captureComfyCandidateScrollState(_0x4d1800 = null) {
    const _0x292b72 = _0x4d1800?.closest?.(".rh-ai-app-candidate-options");
    return {
      panelScrollTop: Number(this.bodyEl?.scrollTop || 0),
      candidateScrollTop: Number(_0x292b72?.scrollTop || 0)
    };
  }
  _restoreComfyCandidateScrollState(_0x28d156 = {}) {
    if (this.bodyEl && Number.isFinite(_0x28d156.panelScrollTop)) {
      this.bodyEl.scrollTop = _0x28d156.panelScrollTop;
    }
    const _0x20ecad = this.componentPickerEl?.querySelector?.(".rh-ai-app-candidate-options");
    if (_0x20ecad && Number.isFinite(_0x28d156.candidateScrollTop)) {
      _0x20ecad.scrollTop = _0x28d156.candidateScrollTop;
    }
    this._syncStickyHeaderShadow();
  }
  _chooseComfyCandidate(_0x5a5cef) {
    if (!this._isComfyUiSource()) {
      return;
    }
    const _0x3e2ec1 = Number(_0x5a5cef?.dataset?.componentIndex);
    if (!Number.isInteger(_0x3e2ec1)) {
      return;
    }
    const _0x4ede23 = this.componentDrafts.some(_0x108b10 => Number(_0x108b10?.index) === _0x3e2ec1);
    if (_0x4ede23) {
      return;
    }
    const _0x558afd = this.componentCandidates.find(_0x5f43ac => Number(_0x5f43ac?.index) === _0x3e2ec1);
    if (!_0x558afd) {
      return;
    }
    const _0x4e6ce4 = this._captureComfyCandidateScrollState(_0x5a5cef);
    this.componentDrafts.push({
      ..._0x558afd,
      label: getComfyUiCandidateDefaultComponentName(_0x558afd)
    });
    this.comfyCandidatePickerOpen = true;
    const _0x188198 = this._refreshBundleFromComponents({
      renderPreview: false
    });
    this._patchPreviewWithoutRebuild(_0x188198, {
      renderInputs: true,
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: true,
      renderAppChrome: true,
      renderActionControls: true
    });
    this._renderComfyCandidatePicker({
      open: true
    });
    this._restoreComfyCandidateScrollState(_0x4e6ce4);
    requestAnimationFrame(() => this._restoreComfyCandidateScrollState(_0x4e6ce4));
  }
  _renderNodePreview(_0x2cca9b = this.currentBundle) {
    return this.previewPresentation._renderNodePreview(_0x2cca9b);
  }
  _closePreviewAppMenuElement(_0x1e5af7) {
    return this.previewPresentation._closePreviewAppMenuElement(_0x1e5af7);
  }
  _patchPreviewAppChrome() {
    return this.previewPresentation._patchPreviewAppChrome();
  }
  _patchSaveConfigMenu() {
    return this.previewPresentation._patchSaveConfigMenu();
  }
  _patchCreateConfigMenu() {
    return this.previewPresentation._patchCreateConfigMenu();
  }
  _patchFooterOverwriteMenu(_0x45a7e1, _0x98f677) {
    return this.previewPresentation._patchFooterOverwriteMenu(_0x45a7e1, _0x98f677);
  }
  _patchPreviewPromptArea() {
    return this.previewPresentation._patchPreviewPromptArea();
  }
  _patchPreviewActionControls(_0x582ca0 = this.currentBundle) {
    return this.previewPresentation._patchPreviewActionControls(_0x582ca0);
  }
  _patchPreviewWithoutRebuild(_0x3175e8 = this.currentBundle, _0x52eb34 = {}) {
    return this.previewPresentation._patchPreviewWithoutRebuild(_0x3175e8, _0x52eb34);
  }
  _renderPreviewMutableZones(_0x1375de = this.currentBundle, _0x423a48 = {}) {
    return this.previewPresentation._renderPreviewMutableZones(_0x1375de, _0x423a48);
  }
  _clearBuilder() {
    this.componentDraftKey = "";
    this.componentDrafts = [];
    this.componentCandidates = [];
    this.promptHelpTooltip = "";
    this.comfyCandidateSearchText = "";
    this.comfyCandidatePickerOpen = false;
    this.workflowInputCollapsed = false;
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this.previewPresentation.clearUiSchemaBinding();
    this._renderComponentConfig();
    this._renderNodePreview(null);
    this._syncWorkflowInputCollapsed();
    this._setActionButtonsEnabled(false);
  }
  _clearCurrentDraftIdentity() {
    this.savedAppId = "";
    this.appName = DEFAULT_AI_APP_NAME;
    this.appDescription = "";
    this.promptHelpTooltip = "";
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
  }
  _buildCurrentBundle({
    syncComponents = true
  } = {}) {
    if (syncComponents) {
      this._syncComponentDrafts();
    }
    if (this._isComfyUiSource()) {
      return buildComfyUiWorkflowManifestBundle({
        input: this._getInputText(),
        kind: this.kind,
        components: this.componentDrafts,
        displayName: normalizeAppName(this.appName),
        description: normalizeAppDescription(this.appDescription),
        promptHelpTooltip: normalizePromptHelpTooltip(this.promptHelpTooltip),
        appKey: this.savedAppId,
        baseUrlMode: getComfyUiBaseUrlMode(this.sourceType),
        componentSelectionMode: "manual"
      });
    }
    return buildRunningHubAiAppManifestBundle({
      input: this._getInputText(),
      appId: this._getAppIdText(),
      kind: this.kind,
      components: this.componentDrafts,
      displayName: normalizeAppName(this.appName),
      description: normalizeAppDescription(this.appDescription),
      promptHelpTooltip: normalizePromptHelpTooltip(this.promptHelpTooltip),
      appKey: this.savedAppId
    });
  }
  _refreshBundleFromComponents({
    renderPreview = true
  } = {}) {
    try {
      const _0x46f2d6 = this._buildCurrentBundle({
        syncComponents: false
      });
      this.currentBundle = _0x46f2d6;
      this._setSummary(_0x46f2d6);
      this._setError("");
      if (renderPreview) {
        this._renderNodePreview(_0x46f2d6);
      }
      this._setActionButtonsEnabled(true);
      this._saveKindState();
      return _0x46f2d6;
    } catch (_0xad03ca) {
      this.currentBundle = null;
      this._setActionButtonsEnabled(false);
      this._setError(_0xad03ca?.message || "解析失败");
      this._saveKindState();
      return null;
    }
  }
  _bindPreviewUiSchemaControls() {
    return this.previewPresentation._bindPreviewUiSchemaControls();
  }
  _commitPreviewUiSchemaValue(_0x307a50, _0x36ebcd) {
    const _0x4f92a7 = String(_0x307a50 || "").trim();
    if (!_0x4f92a7) {
      return buildPreviewUiSchemaNodeData(this.currentBundle);
    }
    const _0x2cfbf4 = getBundleParamFields(this.currentBundle).find(_0x5af694 => String(_0x5af694?.id || "").trim() === _0x4f92a7);
    const _0x5f5a2c = getCustomAiAppComponentIndex(_0x2cfbf4);
    const _0x1ebbbc = Number.isInteger(_0x5f5a2c) ? getComponentByIndex(this.componentDrafts, _0x5f5a2c) : null;
    if (!_0x1ebbbc || !isParamComponent(_0x1ebbbc)) {
      return buildPreviewUiSchemaNodeData(this.currentBundle);
    }
    const _0x267808 = normalizeControlType(_0x1ebbbc.controlType);
    if (_0x267808 === "toggle") {
      _0x1ebbbc.defaultValue = _0x36ebcd === true || String(_0x36ebcd).toLowerCase() === "true" ? "true" : "false";
    } else if (_0x267808 === "stepper") {
      _0x1ebbbc.defaultValue = String(Math.trunc(Number(_0x36ebcd) || 0));
    } else if (_0x267808 === "float") {
      const _0x3a2391 = Number(_0x36ebcd);
      _0x1ebbbc.defaultValue = Number.isFinite(_0x3a2391) ? String(_0x3a2391) : "0";
    } else {
      _0x1ebbbc.defaultValue = String(_0x36ebcd ?? "");
    }
    const _0x257adf = this._refreshBundleFromComponents({
      renderPreview: false
    });
    return buildPreviewUiSchemaNodeData(_0x257adf || this.currentBundle);
  }
  _decoratePreviewAdvancedFields(_0x5fd058 = this.currentBundle) {
    return this.previewPresentation._decoratePreviewAdvancedFields(_0x5fd058);
  }
  _isPreviewRenameTarget(_0x2d6ef4) {
    return !!_0x2d6ef4?.closest?.(".rh-ai-app-preview-rename-target");
  }
  _isPreviewControlTarget(_0x1989bc) {
    return !!_0x1989bc?.closest?.("[data-role='preview-rename-input'], [data-role='preview-description-input'], .rh-ai-app-preview-description-target, .rh-ai-app-preview-param-toggle, [data-action='confirm-preview-rename'], .rh-ai-app-preview-param-zone input, .rh-ai-app-preview-param-zone textarea, .rh-ai-app-preview-param-zone select, .rh-ai-app-preview-param-zone button:not(.rh-ai-app-preview-draggable), .rh-ai-app-preview-param-zone [contenteditable='true'], .rh-ai-app-preview-param-zone [data-ui-schema-input], .rh-ai-app-preview-param-zone [data-ui-schema-value], .rh-ai-app-preview-param-zone [data-ui-schema-menu-trigger], .rh-ai-app-preview-param-zone .rh-stepper-value, .rh-ai-app-preview-param-zone .rh-stepper-input, .rh-ai-app-preview-param-zone .ui-schema-option, .rh-ai-app-preview-advanced-panel input, .rh-ai-app-preview-advanced-panel textarea, .rh-ai-app-preview-advanced-panel select, .rh-ai-app-preview-advanced-panel button:not(.rh-ai-app-preview-draggable), .rh-ai-app-preview-advanced-panel [contenteditable='true'], .rh-ai-app-preview-advanced-panel [data-ui-schema-input], .rh-ai-app-preview-advanced-panel [data-ui-schema-value], .rh-ai-app-preview-advanced-panel [data-ui-schema-menu-trigger], .rh-ai-app-preview-advanced-panel .rh-stepper-value, .rh-ai-app-preview-advanced-panel .rh-stepper-input, .rh-ai-app-preview-advanced-panel .ui-schema-option, .rh-ai-app-preview-advanced-panel .rh-tip, .rh-ai-app-preview-advanced-panel .ui-schema-info-tip, .rh-ai-app-preview-typebar-action, .rh-ai-app-preview-typebar-option");
  }
  _handleComponentInput(_0x4f2b10) {
    const _0x5554f5 = _0x4f2b10.target?.closest?.("[data-role='preview-rename-input']");
    if (_0x5554f5 && this.panel?.contains(_0x5554f5)) {
      const _0x5408ac = Number(_0x5554f5.dataset.previewComponentIndex);
      const _0x538802 = getComponentByIndex(this.componentDrafts, _0x5408ac);
      if (_0x538802 && isMediaComponent(_0x538802)) {
        const _0x30da28 = normalizeInputSlotLabel(_0x5554f5.value, "");
        if (_0x5554f5.value !== _0x30da28) {
          _0x5554f5.value = _0x30da28;
        }
      }
      return;
    }
    const _0x170014 = _0x4f2b10.target?.closest?.("[data-role='comfyui-candidate-search']");
    if (_0x170014 && this.panel?.contains(_0x170014)) {
      this.comfyCandidateSearchText = String(_0x170014.value || "");
      this._renderComfyCandidatePicker({
        open: true,
        preserveSearchFocus: true
      });
      return;
    }
    const _0x33faa0 = _0x4f2b10.target?.closest?.("[data-app-prop]");
    if (_0x33faa0 && this.panel?.contains(_0x33faa0)) {
      const _0x332055 = String(_0x33faa0.dataset.appProp || "");
      if (_0x332055 === "appName") {
        this.appName = String(_0x33faa0.value || "");
        this.pendingDeleteSavedAppId = "";
        this.pendingOverwriteSavedAppId = "";
        this.pendingOverwriteIntent = "";
      } else if (_0x332055 === "appDescription") {
        this.appDescription = String(_0x33faa0.value || "");
      } else {
        return;
      }
      this._refreshBundleFromComponents({
        renderPreview: false
      });
      this._patchPreviewAppChrome();
      return;
    }
    const _0x2267b1 = _0x4f2b10.target?.closest?.("[data-component-prop]");
    if (!_0x2267b1 || !this.panel?.contains(_0x2267b1)) {
      return;
    }
    const _0x46c520 = _0x2267b1.closest("[data-component-index]");
    const _0x5e56e3 = Number(_0x46c520?.dataset.componentIndex);
    const _0x423808 = String(_0x2267b1.dataset.componentProp || "");
    if (!Number.isInteger(_0x5e56e3) || !_0x423808) {
      return;
    }
    let _0x389a3e = _0x2267b1.value;
    const _0x5f213e = getComponentByIndex(this.componentDrafts, _0x5e56e3);
    if (_0x423808 === "label" && _0x5f213e && isMediaComponent(_0x5f213e)) {
      _0x389a3e = normalizeInputSlotLabel(_0x389a3e, "");
      if (_0x2267b1.value !== _0x389a3e) {
        _0x2267b1.value = _0x389a3e;
      }
    }
    this._updateComponentDraft(_0x5e56e3, _0x423808, _0x389a3e);
  }
  _updatePromptHelpTooltip(_0x1889a1) {
    this.promptHelpTooltip = normalizePromptHelpTooltip(_0x1889a1);
    const _0x51d189 = this._refreshBundleFromComponents({
      renderPreview: false
    });
    this._patchPreviewWithoutRebuild(_0x51d189, {
      renderPrompt: true
    });
  }
  _updateComponentDraft(_0x18f86b, _0x394f87, _0x300391, {
    animatePreviewMoveFromRect = null,
    preferredPreviewPlacement = ""
  } = {}) {
    const _0x1ab1b6 = this.componentDrafts.find(_0x11106f => Number(_0x11106f.index) === _0x18f86b);
    if (!_0x1ab1b6) {
      return;
    }
    if (_0x394f87 === "componentKind") {
      if (_0x1ab1b6.componentKindLocked === true) {
        return;
      }
      const _0x531fbd = normalizeComponentKind(_0x300391);
      const _0x5af216 = getComponentKindOptions(_0x1ab1b6, normalizeComponentKind(_0x1ab1b6.componentKind));
      if (!optionValuesInclude(_0x5af216, _0x531fbd)) {
        return;
      }
      _0x1ab1b6.componentKind = _0x531fbd;
      if (_0x531fbd === "prompt") {
        _0x1ab1b6.controlType = "prompt";
      }
      if (_0x531fbd === "param" && normalizeControlType(_0x1ab1b6.controlType) === "prompt") {
        const _0x39175d = getControlTypeOptions(_0x1ab1b6, normalizeControlType(_0x1ab1b6.controlType));
        _0x1ab1b6.controlType = _0x39175d.find(([_0x77b653]) => _0x77b653 !== "prompt")?.[0] || "text";
      }
      if (!isMediaComponent(_0x1ab1b6)) {
        delete _0x1ab1b6.inputOrder;
      }
      if (!isParamComponent(_0x1ab1b6)) {
        delete _0x1ab1b6.homeParamOrder;
        delete _0x1ab1b6.advancedParamOrder;
        delete _0x1ab1b6.previewPlacement;
      }
    } else if (_0x394f87 === "controlType") {
      if (_0x1ab1b6.controlTypeLocked === true) {
        return;
      }
      const _0x5ed158 = normalizeControlType(_0x300391);
      const _0x3a0f6b = getControlTypeOptions(_0x1ab1b6, normalizeControlType(_0x1ab1b6.controlType));
      if (!optionValuesInclude(_0x3a0f6b, _0x5ed158)) {
        return;
      }
      if (_0x5ed158 === "prompt") {
        _0x1ab1b6.componentKind = "prompt";
        _0x1ab1b6.controlType = "prompt";
        delete _0x1ab1b6.homeParamOrder;
        delete _0x1ab1b6.advancedParamOrder;
        delete _0x1ab1b6.previewPlacement;
      } else {
        _0x1ab1b6.componentKind = "param";
        _0x1ab1b6.controlType = _0x5ed158;
        if (preferredPreviewPlacement) {
          this.previewDragController.placeParamDraft(_0x1ab1b6, preferredPreviewPlacement);
          if (_0x1ab1b6.previewPlacement !== preferredPreviewPlacement) {
            this.previewDragController.placeParamDraft(_0x1ab1b6, "advanced");
          }
        }
      }
    } else if (_0x394f87 === "label") {
      _0x1ab1b6.label = isMediaComponent(_0x1ab1b6) ? normalizeInputSlotLabel(_0x300391, "") : String(_0x300391 || "").trim();
    } else if (_0x394f87 === "description") {
      _0x1ab1b6.description = String(_0x300391 || "").trim();
    } else if (_0x394f87 === "defaultValue") {
      _0x1ab1b6.defaultValue = String(_0x300391 ?? "");
    } else {
      return;
    }
    if (_0x394f87 === "componentKind" || _0x394f87 === "controlType") {
      this._renderComponentConfig();
    }
    const _0x5f2f1e = shouldRefreshPreviewPromptForDraft(_0x1ab1b6, _0x394f87);
    const _0x10f79b = this._refreshBundleFromComponents({
      renderPreview: false
    });
    this._patchPreviewWithoutRebuild(_0x10f79b, {
      renderInputs: _0x394f87 === "componentKind" || _0x394f87 === "label",
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: _0x5f2f1e
    });
    if (animatePreviewMoveFromRect) {
      this.previewDragController.animateComponentFromRect(_0x18f86b, animatePreviewMoveFromRect);
    }
  }
  _renamePreviewParamFromTypebar(_0x359b7a) {
    const _0x4fa998 = Number(_0x359b7a?.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0x4fa998)) {
      return;
    }
    const _0x4117b8 = _0x359b7a.closest?.(".rh-ai-app-preview-input-slot, .rh-ai-app-preview-param-chip, .rh-ai-app-preview-advanced-param, .rh-ai-app-preview-prompt-target");
    const _0x3362da = _0x4117b8?.querySelector?.(".rh-ai-app-preview-rename-target[data-preview-component-index=\"" + _0x4fa998 + "\"]");
    if (_0x3362da) {
      this._startPreviewInlineRename(_0x3362da, _0x4fa998);
    }
  }
  _editPreviewDescriptionFromTypebar(_0x5b0c8d) {
    const _0x5e2202 = Number(_0x5b0c8d?.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0x5e2202)) {
      return;
    }
    const _0x413f6b = _0x5b0c8d.closest?.(".rh-ai-app-preview-param-chip, .rh-ai-app-preview-advanced-param, .rh-ai-app-preview-prompt-target, .rh-ai-app-real-preview-panel");
    let _0x494f19 = _0x413f6b?.querySelector?.(".rh-ai-app-preview-description-target[data-preview-component-index=\"" + _0x5e2202 + "\"]") || this.nodePreviewEl?.querySelector?.(".rh-ai-app-preview-description-target[data-preview-component-index=\"" + _0x5e2202 + "\"]");
    if (!_0x494f19 && _0x413f6b?.classList?.contains("rh-ai-app-preview-param-chip")) {
      const _0x3bda41 = _0x413f6b.querySelector?.(".rh-ai-app-preview-param-label[data-preview-component-index=\"" + _0x5e2202 + "\"]");
      if (_0x3bda41) {
        const _0x1e0ca9 = getComponentByIndex(this.componentDrafts, _0x5e2202);
        const _0x5598 = getPreviewComponentDescription(_0x1e0ca9, "参数说明");
        _0x494f19 = document.createElement("span");
        _0x494f19.className = "rh-tip ui-schema-info-tip rh-ai-app-preview-description-target rh-ai-app-preview-param-description-tip";
        _0x494f19.dataset.previewComponentIndex = String(_0x5e2202);
        _0x494f19.textContent = "!";
        _0x494f19.setAttribute("role", "button");
        _0x494f19.setAttribute("tabindex", "0");
        _0x494f19.setAttribute("aria-label", "编辑参数说明");
        _0x494f19.setAttribute("data-tooltip", _0x5598);
        _0x494f19.setAttribute("title", _0x5598);
        _0x3bda41.insertAdjacentElement("afterend", _0x494f19);
      }
    }
    if (_0x494f19) {
      this._startPreviewInlineDescriptionEdit(_0x494f19, _0x5e2202);
    }
  }
  _togglePreviewParamDefault(_0x552af4) {
    const _0x1fe6ea = Number(_0x552af4?.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0x1fe6ea)) {
      return;
    }
    const _0x37ae22 = getComponentByIndex(this.componentDrafts, _0x1fe6ea);
    if (!_0x37ae22 || !isParamComponent(_0x37ae22)) {
      return;
    }
    if (normalizeControlType(_0x37ae22.controlType) !== "toggle") {
      return;
    }
    const _0x23fc10 = isPreviewToggleOn(_0x37ae22.defaultValue) ? "false" : "true";
    this._updateComponentDraft(_0x1fe6ea, "defaultValue", _0x23fc10);
  }
  _removePreviewParam(_0x8b902a) {
    if (!this._canRemovePreviewParams()) {
      return;
    }
    const _0x4699f9 = Number(_0x8b902a?.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0x4699f9)) {
      return;
    }
    const _0x2f46ea = getComponentByIndex(this.componentDrafts, _0x4699f9);
    if (!_0x2f46ea || !isParamComponent(_0x2f46ea)) {
      return;
    }
    this.componentDrafts = this.componentDrafts.filter(_0x442939 => Number(_0x442939?.index) !== _0x4699f9);
    const _0x205c49 = this._refreshBundleFromComponents({
      renderPreview: false
    });
    this._patchPreviewWithoutRebuild(_0x205c49, {
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: true,
      renderAppChrome: true,
      renderActionControls: true
    });
    this._renderComfyCandidatePicker({
      open: this.comfyCandidatePickerOpen
    });
  }
  _removePreviewInput(_0x2a82df) {
    if (!this._canRemovePreviewInputs()) {
      return;
    }
    const _0x450c40 = Number(_0x2a82df?.dataset?.previewComponentIndex);
    if (!Number.isInteger(_0x450c40)) {
      return;
    }
    const _0x408572 = getComponentByIndex(this.componentDrafts, _0x450c40);
    if (!_0x408572 || !isMediaComponent(_0x408572)) {
      return;
    }
    this.componentDrafts = this.componentDrafts.filter(_0x288202 => Number(_0x288202?.index) !== _0x450c40);
    const _0x1ae8db = this._refreshBundleFromComponents({
      renderPreview: false
    });
    this._patchPreviewWithoutRebuild(_0x1ae8db, {
      renderInputs: true,
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: true,
      renderAppChrome: true,
      renderActionControls: true
    });
    this._renderComfyCandidatePicker({
      open: this.comfyCandidatePickerOpen
    });
  }
  _scheduleParse() {
    window.clearTimeout(this.parseTimer);
    if (!this._getInputText().trim()) {
      this.currentBundle = null;
      this._clearCurrentDraftIdentity();
      this._setSummary(null);
      this._setError("");
      this._clearBuilder();
      this._saveKindState();
      return;
    }
    this._saveKindState();
    this.parseTimer = window.setTimeout(() => this._parseNow({
      silent: true
    }), 180);
  }
  _parseNow({
    silent = false
  } = {}) {
    window.clearTimeout(this.parseTimer);
    const _0x1f880f = this._getInputText();
    try {
      const _0x57b353 = this._buildCurrentBundle();
      this.currentBundle = _0x57b353;
      if (!silent) {
        this.workflowInputCollapsed = true;
      }
      this._setSummary(_0x57b353);
      this._setError("");
      this._renderNodePreview(_0x57b353);
      this._setActionButtonsEnabled(true);
      this._saveKindState();
      return _0x57b353;
    } catch (_0x2726e9) {
      this.currentBundle = null;
      const _0x2a80a0 = !_0x1f880f.trim();
      const _0x2ec6ae = !_0x2a80a0 && silent && this._isComfyUiSource() && Boolean(this.componentDraftKey || this.componentDrafts.length || this.componentCandidates.length);
      if (_0x2a80a0) {
        this._clearCurrentDraftIdentity();
      }
      if (_0x2a80a0 || !_0x2ec6ae) {
        this._clearBuilder();
      }
      this._setSummary(null);
      this._setActionButtonsEnabled(false);
      if (!silent || _0x1f880f.trim()) {
        this._setError(_0x2726e9?.message || "解析失败");
      } else {
        this._setError("");
      }
      this._saveKindState();
      return null;
    }
  }
  _buildSavedAppRecordFromCurrentInput(_0x491738 = null) {
    return this.configRepository.buildSavedAppRecord({
      sourceType: this.sourceType,
      kind: this.kind,
      runningHubProfileId: this.runningHubProfileId,
      name: normalizeAppName(this.appName),
      description: normalizeAppDescription(this.appDescription),
      promptHelpTooltip: normalizePromptHelpTooltip(this.promptHelpTooltip),
      input: this._getInputText(),
      componentDraftKey: this._getComponentDraftKey(),
      componentDrafts: this.componentDrafts
    }, _0x491738);
  }
  _saveCurrentConfigAsSavedApp({
    overwriteSavedAppId = ""
  } = {}) {
    const _0x47e342 = String(overwriteSavedAppId || "").trim();
    const _0x43fff0 = _0x47e342 ? this._findSavedApp(_0x47e342) : null;
    if (_0x47e342 && !_0x43fff0) {
      throw new Error("覆盖目标应用不存在");
    }
    const _0x38a83b = _0x43fff0?.bundle || null;
    const _0x5d21cd = this._buildSavedAppRecordFromCurrentInput(_0x43fff0);
    const _0x2529d3 = this._buildBundleForSavedApp(_0x5d21cd);
    if (_0x38a83b) {
      a1198_0x3b122f(_0x38a83b, this.registeredBundleKeys);
    }
    _0x5d21cd.bundle = _0x2529d3;
    const _0x48378f = this.savedApps.findIndex(_0x5ac56a => _0x5ac56a.id === _0x5d21cd.id);
    if (_0x48378f >= 0) {
      this.savedApps.splice(_0x48378f, 1, _0x5d21cd);
    } else {
      this.savedApps.unshift(_0x5d21cd);
    }
    a1198_0x19c24e(_0x2529d3, this.registeredBundleKeys, {
      replace: true
    });
    this._registerBundlesFromNodes();
    this.savedAppId = _0x5d21cd.id;
    this.currentBundle = _0x2529d3;
    this.appName = _0x5d21cd.name;
    this.appDescription = _0x5d21cd.description;
    this.promptHelpTooltip = normalizePromptHelpTooltip(_0x5d21cd.promptHelpTooltip);
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    this._persistSavedApps();
    this._setSummary(_0x2529d3);
    this._setActionButtonsEnabled(true);
    this._saveKindState();
    return {
      record: _0x5d21cd,
      bundle: _0x2529d3
    };
  }
  _saveCurrentConfigWithOverwritePolicy(_0x43bb83 = "save") {
    const _0x5df999 = this._findSameNameSavedAppForCurrentScope();
    if (_0x5df999) {
      this._showOverwriteConfirm(_0x5df999.id, _0x43bb83);
      return null;
    }
    return this._saveCurrentConfigAsSavedApp({
      overwriteSavedAppId: ""
    });
  }
  _patchSavedConfigSuccessPreview(_0x12a07d) {
    this._renderComponentConfig();
    this._patchPreviewWithoutRebuild(_0x12a07d, {
      renderInputs: true,
      renderParams: true,
      renderAdvanced: true,
      renderPrompt: true,
      renderAppChrome: true,
      renderActionControls: true
    });
  }
  _saveConfigFromCurrentInput() {
    try {
      const _0x152013 = this._saveCurrentConfigWithOverwritePolicy("save");
      if (!_0x152013) {
        return null;
      }
      const {
        record: _0x1ddc4c,
        bundle: _0x36ecf5
      } = _0x152013;
      this._patchSavedConfigSuccessPreview(_0x36ecf5);
      this._flashSaveSuccessFeedback();
      window.showToast?.(this._getSourceMeta()?.saveSuccess || "配置已保存", "success");
      return _0x1ddc4c;
    } catch (_0x5e23da) {
      console.error("[RH AI App] save config failed:", _0x5e23da);
      this._setError(_0x5e23da?.message || "配置保存失败");
      this._saveKindState();
      window.showToast?.(_0x5e23da?.message || this._getSourceMeta()?.saveFailed || "配置保存失败", "error");
      return null;
    }
  }
  async _confirmOverwriteSavedApp(_0x5c771b) {
    const _0x53f08b = String(_0x5c771b || "").trim();
    if (!_0x53f08b || _0x53f08b !== this.pendingOverwriteSavedAppId) {
      return null;
    }
    const _0x1a3fad = this.pendingOverwriteIntent === "create" ? "create" : "save";
    try {
      const {
        record: _0x404941,
        bundle: _0x33c620
      } = this._saveCurrentConfigAsSavedApp({
        overwriteSavedAppId: _0x53f08b
      });
      if (_0x1a3fad === "create") {
        this._patchPreviewAppChrome();
        this._createNodeFromSavedBundle(_0x33c620);
        return _0x404941;
      }
      this._patchSavedConfigSuccessPreview(_0x33c620);
      this._flashSaveSuccessFeedback();
      window.showToast?.(this._getSourceMeta()?.saveSuccess || "配置已保存", "success");
      return _0x404941;
    } catch (_0x334af0) {
      console.error("[RH AI App] overwrite config failed:", _0x334af0);
      const _0x3bb2a1 = this._getSourceMeta();
      const _0x56a796 = _0x1a3fad === "create" ? _0x3bb2a1?.createFailed : _0x3bb2a1?.saveFailed;
      window.showToast?.(_0x334af0?.message || _0x56a796 || "配置覆盖失败", "error");
      this._setError(_0x334af0?.message || "配置覆盖失败");
      this._saveKindState();
      return null;
    }
  }
  _loadSavedApp(_0x3fb7f7) {
    const _0x3463df = this._findSavedApp(_0x3fb7f7);
    if (!_0x3463df) {
      return;
    }
    window.clearTimeout(this.parseTimer);
    this._saveKindState();
    this.sourceType = normalizeSourceType(_0x3463df.sourceType) || SOURCE_TYPES.runninghub;
    this.kind = normalizeKind(_0x3463df.kind);
    this.runningHubProfileId = normalizeRunningHubModelApiProfileId(_0x3463df.runningHubProfileId);
    this._syncSourceView();
    this._syncKindTabs();
    this.appName = normalizeAppName(_0x3463df.name);
    this.appDescription = normalizeAppDescription(_0x3463df.description);
    this.promptHelpTooltip = normalizePromptHelpTooltip(_0x3463df.promptHelpTooltip);
    this.savedAppId = _0x3463df.id;
    if (this.textarea) {
      this.textarea.value = _0x3463df.input || "";
    }
    this.componentDraftKey = _0x3463df.componentDraftKey || this._getComponentDraftKey();
    this.componentDrafts = cloneComponentDrafts(_0x3463df.componentDrafts);
    if ((this._isComfyUiSource() || !this.componentDrafts.length) && _0x3463df.input.trim()) {
      this._syncComponentDrafts({
        force: true
      });
    }
    this.previewAppMenuOpen = false;
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    try {
      const _0x2255c8 = _0x3463df.bundle || this._buildBundleForSavedApp(_0x3463df);
      _0x3463df.bundle = _0x2255c8;
      a1198_0x19c24e(_0x2255c8, this.registeredBundleKeys);
      this.currentBundle = _0x2255c8;
      this._setSummary(_0x2255c8);
      this._setError("");
      this._renderComponentConfig();
      this._patchPreviewWithoutRebuild(_0x2255c8, {
        renderInputs: true,
        renderParams: true,
        renderAdvanced: true,
        renderPrompt: true,
        renderAppChrome: true,
        renderActionControls: true
      });
      this._setActionButtonsEnabled(true);
    } catch (_0x49aba7) {
      this.currentBundle = null;
      this._setSummary(null);
      this._setError(_0x49aba7?.message || "配置载入失败");
      this._setActionButtonsEnabled(false);
    }
    this._saveKindState();
  }
  _deleteSavedApp(_0x4924bd) {
    const _0x4b2983 = this._findSavedApp(_0x4924bd);
    if (!_0x4b2983) {
      return;
    }
    const _0x2b432e = this.savedAppId === _0x4b2983.id;
    if (_0x4b2983.bundle) {
      a1198_0x3b122f(_0x4b2983.bundle, this.registeredBundleKeys);
    }
    this.savedApps = this.savedApps.filter(_0x422480 => _0x422480.id !== _0x4b2983.id);
    this._registerBundlesFromNodes();
    this.pendingDeleteSavedAppId = "";
    this.pendingOverwriteSavedAppId = "";
    this.pendingOverwriteIntent = "";
    if (_0x2b432e) {
      this.savedAppId = "";
      if (this.textarea) {
        this.textarea.value = "";
      }
      this.appName = DEFAULT_AI_APP_NAME;
      this.appDescription = "";
      this.currentBundle = null;
      this._clearBuilder();
      this._setSummary(null);
      this._setError("");
    } else {
      this.previewAppMenuOpen = true;
      this._patchPreviewAppChrome();
    }
    this._persistSavedApps();
    this._saveKindState();
    window.showToast?.(this._getSourceMeta()?.deleteSuccess || "配置已删除", "success");
  }
  _createNodeFromSavedBundle(_0x2e65c2) {
    const _0xd17153 = getCanvasCenterWorld(this.panel);
    const _0xd02940 = buildRhAiAppNodeData({
      bundle: _0x2e65c2,
      kind: this.kind,
      center: _0xd17153,
      runningHubProfileId: this.runningHubProfileId
    });
    graphStore.batch?.(() => {
      graphStore.addNode(_0xd02940);
      graphStore.setSelectedNodes([_0xd02940.id]);
    });
    if (typeof graphStore.batch !== "function") {
      graphStore.addNode(_0xd02940);
      graphStore.setSelectedNodes([_0xd02940.id]);
    }
    commit();
    window.showToast?.(this._getSourceMeta()?.createSuccess || "节点已创建", "success");
    return _0xd02940;
  }
  async _createNodeFromCurrentInput() {
    const _0x132e2d = this._refreshBundleFromComponents({
      renderPreview: false
    }) || this.currentBundle || this._parseNow();
    if (!_0x132e2d) {
      return;
    }
    try {
      const _0x295f43 = this._saveCurrentConfigWithOverwritePolicy("create");
      if (!_0x295f43) {
        return;
      }
      this._patchPreviewAppChrome();
      this._createNodeFromSavedBundle(_0x295f43.bundle);
    } catch (_0x4dc4bf) {
      console.error("[RH AI App] create node failed:", _0x4dc4bf);
      window.showToast?.(_0x4dc4bf?.message || this._getSourceMeta()?.createFailed || "节点创建失败", "error");
      this._setError(_0x4dc4bf?.message || "节点创建失败");
      this._saveKindState();
    }
  }
}
export const runningHubAiAppManager = new RunningHubAiAppManager();
