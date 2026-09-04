import { NANO_BANANA_FAMILIES, getDefaultModeForNanoBananaFamily, getNanoBananaModeOptions, isNanoBananaFamily, resolveNanoBananaModelBySelection, resolveNanoBananaSelectionFromModel } from "../../modules/nanoBananaModeRules.js";
import { getDreaminaImageMenuGroupHTML, getDreaminaImageTriggerIconHTML } from "./dreaminaModelMenuHelper.js";
import { isRunningHubGptImage2OfficialModel, normalizeImageSizeForProviderModel } from "../../modules/imageModelCapabilities.js";
import { getAllowedRatiosForProviderModel, pickClosestRatioForProviderModel } from "../../../api/imageRatioPolicy.js";
import { ANIME_REAL_MODEL_ID, PERSON_REPLACE_V21_MODEL_ID, PERSON_REPLACE_V3_MODEL_ID, QWEN_IMAGE_EDIT_MODEL_ID, getModelsByKind, getModelManifest, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { renderNodeMenuGroup, renderNodeMenuItem } from "../shared/nodeModelMenu.js";
import { buildModelProviderProfileBadgesHtml } from "../shared/modelProviderProfileControl.js";
import { positionNodeSubmenu } from "../shared/nodeFooterControls.js";
import { isAdaptiveImageAspectRatioValue } from "../shared/generationDisplayPolicy.js";
import { renderComfyUiCloudWorkflowLogoHtml, renderComfyUiLocalWorkflowLogoHtml, renderComfyUiWorkflowLogoHtmlFromIconKind } from "../shared/customAiAppLogo.js";
import { t } from "../../i18n/index.js";
import { buildModelProviderProfileSelectionPatch } from "../../modules/modelProviderProfileSelection.js";
export const GRSAI_GPT_IMAGE_2_MODEL = "gpt-image-2";
const GRSAI_GPT_IMAGE_2_VIP_MODEL = "gpt-image-2-vip";
export const APIMART_GPT_IMAGE_2_MODEL = "apimart/gpt-image-2";
export const APIMART_QWEN_IMAGE_MODEL = "apimart/qwen-image-2.0";
export const APIMART_Z_IMAGE_TURBO_MODEL = "apimart/z-image-turbo";
export const APIMART_WAN_IMAGE_MODEL = "apimart/wan2.7-image";
export const VOLCENGINE_SEEDREAM_5_PRO_MODEL = "volcengine/seedream-5.0-pro";
export const VOLCENGINE_SEEDREAM_5_MODEL = "volcengine/seedream-5.0";
export const VOLCENGINE_SEEDREAM_4_5_MODEL = "volcengine/seedream-4.5";
export const VOLCENGINE_SEEDREAM_4_MODEL = "volcengine/seedream-4.0";
export const RH_ANIME_REAL_MODEL = ANIME_REAL_MODEL_ID;
const GRSAI_IMAGE_MENU_ICON_HTML = "<img src=\"images/grsai.png\" class=\"node-menu-icon node-menu-icon-padded\" alt=\"grsai\">";
const AGNES_BADGE_ICON_HTML = "<div class=\"node-menu-icon node-menu-icon-badge node-menu-icon-badge-dark\">AG</div>";
const OPENAI_CLI_BADGE_ICON_HTML = "<div class=\"node-menu-icon node-menu-icon-badge node-menu-icon-badge-dark\">OA</div>";
const VOLCENGINE_IMAGE_MENU_ICON_HTML = "<img src=\"images/volcengine.svg\" class=\"node-menu-icon\" alt=\"volcengine\">";
const COMFYUI_CLOUD_WORKFLOW_ICON_HTML = renderComfyUiCloudWorkflowLogoHtml({
  className: "node-menu-icon"
});
const COMFYUI_LOCAL_WORKFLOW_ICON_HTML = renderComfyUiLocalWorkflowLogoHtml({
  className: "node-menu-icon"
});
function getDefaultImagePromptPlaceholder() {
  return t("aigenImage.prompt.placeholder");
}
function normalizeGrsaiModelToken(_0x4807b2) {
  let _0x206907 = String(_0x4807b2 || "").trim().toLowerCase();
  if (_0x206907.startsWith("grsai/")) {
    _0x206907 = _0x206907.slice("grsai/".length).trim();
  }
  return _0x206907;
}
function isAdvancedModeEnabled() {
  return typeof window !== "undefined" && window.ADVANCED_MODE === true;
}
function getManifestUiField(_0x3317e8, _0x403873) {
  const _0x2f22fb = getModelManifest(_0x3317e8)?.uiSchema?.fields;
  if (Array.isArray(_0x2f22fb)) {
    return _0x2f22fb.find(_0x275fa5 => _0x275fa5?.id === _0x403873) || null;
  } else {
    return null;
  }
}
const IMAGE_SIZE_ORDER = Object.freeze(["1K", "2K", "3K", "4K"]);
function normalizeImageSizeToken(_0x3bcb4a) {
  return String(_0x3bcb4a || "").trim().toUpperCase();
}
function pickSupportedImageSize(_0x25022a, _0x2291ff) {
  const _0x4daee9 = (Array.isArray(_0x2291ff?.options) ? _0x2291ff.options : []).map(_0x5de03e => normalizeImageSizeToken(_0x5de03e?.value ?? _0x5de03e)).filter(Boolean);
  const _0x55ad06 = normalizeImageSizeToken(_0x25022a);
  if (!_0x4daee9.length || !_0x55ad06 || _0x4daee9.includes(_0x55ad06)) {
    return "";
  }
  const _0x5188b9 = IMAGE_SIZE_ORDER.indexOf(_0x55ad06);
  const _0x4f6d19 = _0x4daee9.map(_0x11dee0 => ({
    value: _0x11dee0,
    rank: IMAGE_SIZE_ORDER.indexOf(_0x11dee0)
  })).filter(_0x3012a7 => _0x3012a7.rank >= 0).sort((_0x383e89, _0x1e15f6) => _0x383e89.rank - _0x1e15f6.rank);
  if (_0x5188b9 >= 0 && _0x4f6d19.length > 0) {
    const _0x7fc066 = _0x4f6d19.filter(_0x48aacc => _0x48aacc.rank <= _0x5188b9).at(-1);
    return _0x7fc066?.value || _0x4f6d19[0].value;
  }
  const _0x8e5641 = normalizeImageSizeToken(_0x2291ff?.defaultValue);
  if (_0x4daee9.includes(_0x8e5641)) {
    return _0x8e5641;
  } else {
    return _0x4daee9[0];
  }
}
function pickNearestNumber(_0x75678f, _0x3e99ee, _0x5add32) {
  const _0x41bd12 = (Array.isArray(_0x3e99ee) ? _0x3e99ee : []).map(_0x54622c => Number(_0x54622c)).filter(Number.isFinite);
  if (_0x41bd12.length === 0) {
    return _0x5add32;
  }
  const _0x34749c = Number(_0x75678f);
  if (!Number.isFinite(_0x34749c)) {
    return _0x5add32;
  }
  return _0x41bd12.reduce((_0x2b01d5, _0x48346d) => Math.abs(_0x48346d - _0x34749c) < Math.abs(_0x2b01d5 - _0x34749c) ? _0x48346d : _0x2b01d5, _0x41bd12[0]);
}
export function isGrsaiGptImage2ModelToken(_0x4e4ce7) {
  const _0x5eee1f = normalizeGrsaiModelToken(_0x4e4ce7);
  return _0x5eee1f === GRSAI_GPT_IMAGE_2_MODEL || _0x5eee1f === GRSAI_GPT_IMAGE_2_VIP_MODEL;
}
export function isGrsaiGptImage2Selection(_0x10d80a, _0x47dc37) {
  const _0x3fec9c = String(_0x10d80a || "").trim().toLowerCase();
  const _0x10f33b = String(_0x47dc37 || "").trim().toLowerCase();
  const _0x24ca07 = normalizeGrsaiModelToken(_0x10f33b);
  if (!isGrsaiGptImage2ModelToken(_0x24ca07)) {
    return false;
  }
  return _0x3fec9c === "grsai" || _0x10f33b.startsWith("grsai/") || !_0x3fec9c && !_0x10f33b.includes("/");
}
export function isApimartGptImage2Selection(_0x4e80d7, _0x3bdcd4) {
  const _0x30397c = String(_0x4e80d7 || "").trim().toLowerCase();
  const _0x5b23be = String(_0x3bdcd4 || "").trim().toLowerCase();
  return _0x5b23be === APIMART_GPT_IMAGE_2_MODEL || _0x30397c === "apimart" && _0x5b23be === GRSAI_GPT_IMAGE_2_MODEL;
}
export function isRunningHubGptImage2Selection(_0x17b632, _0x4e24b8) {
  const _0x4aa651 = String(_0x17b632 || "").trim().toLowerCase();
  const _0x7d9aa5 = resolveNanoBananaSelectionFromModel(_0x4e24b8, "2K", _0x4aa651 || "runninghub");
  return _0x7d9aa5?.provider === "runninghub" && _0x7d9aa5.family === NANO_BANANA_FAMILIES.GPT_IMAGE_2;
}
export function getImageSizeCapabilityProvider(_0x339ee0, _0x4ba4a3) {
  if (isGrsaiGptImage2Selection(_0x339ee0, _0x4ba4a3)) {
    return "grsai";
  } else {
    return _0x339ee0;
  }
}
export function getEffectiveImageSizeForUi(_0xc431a1, _0x436626, _0x10abcf) {
  const _0x5c2b5f = String(_0x10abcf || "").trim();
  if (_0x5c2b5f) {
    return _0x5c2b5f.toUpperCase();
  }
  if (isGrsaiGptImage2Selection(_0xc431a1, _0x436626)) {
    return "1K";
  } else {
    return "2K";
  }
}
function getPlainSchemaParams(_0x461634) {
  if (_0x461634 && typeof _0x461634 === "object" && !Array.isArray(_0x461634)) {
    return {
      ..._0x461634
    };
  } else {
    return {};
  }
}
export function normalizeQwenImageEditMode(_0x2a71ac) {
  const _0x24c918 = String(_0x2a71ac || "").trim().toLowerCase();
  if (_0x24c918 === "qwen2509" || _0x24c918 === "qwen-edit2509" || _0x24c918 === "2509" || _0x24c918 === "0") {
    return "qwen2509";
  } else {
    return "qwen2511";
  }
}
export function getQwenImageEditModeLabel(_0x533a08) {
  if (normalizeQwenImageEditMode(_0x533a08) === "qwen2509") {
    return "2509";
  } else {
    return "2511";
  }
}
export function getQwenImageEditModeTooltip(_0xf7ca73) {
  const _0x4680c0 = normalizeQwenImageEditMode(_0xf7ca73);
  const _0x5d4ee6 = getQwenUiFieldOptions("rhQwenEditMode").find(_0x24099a => _0x24099a.value === _0x4680c0);
  if (_0x5d4ee6?.tooltip) {
    return _0x5d4ee6.tooltip;
  }
  if (_0x4680c0 === "qwen2509") {
    return t("aigenImage.qwen.versionTooltips.qwen2509");
  } else {
    return t("aigenImage.qwen.versionTooltips.qwen2511");
  }
}
export function normalizeQwenFirstImageMode(_0x211651) {
  const _0x1edb1a = String(_0x211651 || "").trim().toLowerCase();
  if (_0x1edb1a === "pose" || _0x1edb1a === "1" || _0x1edb1a === "姿势图") {
    return "pose";
  }
  if (_0x1edb1a === "depth" || _0x1edb1a === "2" || _0x1edb1a === "深度图") {
    return "depth";
  }
  return "original";
}
export function getQwenFirstImageModeLabel(_0x40d1b4) {
  const _0x21a600 = normalizeQwenFirstImageMode(_0x40d1b4);
  const _0x2eac77 = getQwenUiFieldOptions("rhQwenFirstImageMode").find(_0x35c3c3 => _0x35c3c3.value === _0x21a600);
  if (_0x2eac77?.label) {
    return _0x2eac77.label;
  }
  if (_0x21a600 === "pose") {
    return t("aigenImage.qwen.firstImageModes.pose");
  }
  if (_0x21a600 === "depth") {
    return t("aigenImage.qwen.firstImageModes.depth");
  }
  return t("aigenImage.qwen.firstImageModes.original");
}
function getQwenModelManifest() {
  return getModelManifest(QWEN_IMAGE_EDIT_MODEL_ID);
}
function getQwenUiField(_0x5ac2c7) {
  const _0x54b23 = getQwenModelManifest()?.uiSchema?.fields;
  if (Array.isArray(_0x54b23)) {
    return _0x54b23.find(_0x3cb73d => _0x3cb73d?.id === _0x5ac2c7) || null;
  } else {
    return null;
  }
}
function getQwenUiFieldOptions(_0x4183d5) {
  const _0x597761 = getQwenUiField(_0x4183d5)?.options;
  if (Array.isArray(_0x597761)) {
    return _0x597761;
  } else {
    return [];
  }
}
export function getQwenImageEditModelManifest() {
  return getQwenModelManifest();
}
export function getQwenFirstImageModeOptions() {
  const _0x31ca49 = getQwenUiFieldOptions("rhQwenFirstImageMode");
  if (_0x31ca49.length) {
    return _0x31ca49;
  } else {
    return [{
      value: "original",
      label: t("aigenImage.qwen.firstImageModes.original")
    }, {
      value: "pose",
      label: t("aigenImage.qwen.firstImageModes.pose")
    }, {
      value: "depth",
      label: t("aigenImage.qwen.firstImageModes.depth")
    }];
  }
}
export function getPersonReplaceV21ResolutionOptions() {
  const _0xcd3d5d = getManifestUiField(PERSON_REPLACE_V21_MODEL_ID, "rhResolution");
  const _0x7682c7 = Array.isArray(_0xcd3d5d?.options) ? _0xcd3d5d.options : [];
  const _0x1c0be3 = isAdvancedModeEnabled() && Array.isArray(_0xcd3d5d?.advancedOptions) ? _0xcd3d5d.advancedOptions : [];
  return [..._0x7682c7, ..._0x1c0be3].map(_0x52ebb6 => Number(_0x52ebb6)).filter(Number.isFinite);
}
export function normalizePersonReplaceV21Resolution(_0x5a5827) {
  const _0x522e06 = getManifestUiField(PERSON_REPLACE_V21_MODEL_ID, "rhResolution");
  const _0x2dde00 = getPersonReplaceV21ResolutionOptions();
  const _0x12f4eb = Number(_0x522e06?.defaultValue) || 1280;
  return pickNearestNumber(_0x5a5827, _0x2dde00, _0x12f4eb);
}
export function buildRunningHubGptImage2OfficialPatch({
  provider = "",
  model = "",
  imageSize = "",
  aspectRatio = ""
} = {}) {
  if (!isRunningHubGptImage2OfficialModel(model, provider)) {
    return {};
  }
  const _0x3ab015 = normalizeImageSizeForProviderModel({
    model: model,
    provider: provider,
    imageSize: imageSize
  });
  const _0x19c9fa = {};
  const _0x436a01 = String(imageSize || "").trim().toUpperCase();
  if (_0x3ab015 && _0x3ab015 !== _0x436a01) {
    _0x19c9fa.imageSize = _0x3ab015;
  }
  if (!isAdaptiveImageAspectRatioValue(aspectRatio)) {
    const _0x4ea955 = String(aspectRatio || "").trim().replace(/[：∶]/g, ":").replace(/\s+/g, "");
    const _0x5c9e03 = new Set(getAllowedRatiosForProviderModel(provider, model, _0x3ab015).map(_0x4efc4a => _0x4efc4a.label));
    if (_0x4ea955 && !_0x5c9e03.has(_0x4ea955)) {
      _0x19c9fa.aspectRatio = pickClosestRatioForProviderModel({
        provider: provider,
        model: model,
        ratioLabel: _0x4ea955,
        imageSize: _0x3ab015
      });
    }
  }
  return _0x19c9fa;
}
export function getImagePromptPlaceholderForModel(_0x2f90ab) {
  const _0x146283 = resolveModelProvider(_0x2f90ab);
  const _0x3fa122 = getModelManifest(_0x2f90ab) || resolveModelExecution(_0x2f90ab, {
    providerHint: _0x146283
  })?.modelManifest || null;
  const _0x16c130 = String(_0x3fa122?.prompt?.placeholder || "").trim();
  if (_0x16c130) {
    return _0x16c130;
  }
  return getDefaultImagePromptPlaceholder();
}
export function escapeHtmlAttr(_0xe86521) {
  return String(_0xe86521 ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const APIMART_BADGE_ICON_HTML = "<div class=\"node-menu-icon node-menu-icon-badge node-menu-icon-apimart\">AM</div>";
const BINGHUO_BADGE_ICON_HTML = "<div class=\"node-menu-icon node-menu-icon-badge\">BH</div>";
function isSavedRhAiAppManifest(_0x37cc25) {
  return Boolean(String(_0x37cc25?.extensions?.rhAiApp?.appKey || "").trim());
}
function isSavedComfyUiWorkflowManifest(_0x54baed) {
  return Boolean(String(_0x54baed?.extensions?.comfyUiWorkflow?.appKey || "").trim());
}
function getImageMenuMeta(_0x537f83) {
  if (_0x537f83?.extensions?.rhAiApp && !isSavedRhAiAppManifest(_0x537f83)) {
    return null;
  }
  if (_0x537f83?.extensions?.comfyUiWorkflow && !isSavedComfyUiWorkflowManifest(_0x537f83)) {
    return null;
  }
  const _0x2bae09 = _0x537f83?.extensions?.imageMenu;
  if (_0x2bae09 && typeof _0x2bae09 === "object") {
    return _0x2bae09;
  }
  if (_0x537f83?.extensions?.rhAiApp) {
    return {
      group: "rhAiApp",
      order: 999,
      title: "RH AI应用",
      subtitle: _0x537f83.description || "",
      icon: _0x537f83.icon || "images/RH.png",
      iconAlt: "runninghub"
    };
  }
  return null;
}
function getCustomProviderMeta(_0x20aa45) {
  const _0x31a387 = _0x20aa45?.extensions?.customProvider;
  if (_0x31a387 && typeof _0x31a387 === "object") {
    return _0x31a387;
  } else {
    return null;
  }
}
function getCustomProviderBadgeText(_0x3ffa2e, _0x4bc954 = {}) {
  return String(getCustomProviderMeta(_0x3ffa2e)?.badge || _0x4bc954.badge || "CP").trim().slice(0, 2) || "CP";
}
export function getImageModelMenuManifests(_0x596937) {
  const _0x3ed57b = String(_0x596937 || "").trim();
  return getModelsByKind("image").filter(_0x372f27 => getImageMenuMeta(_0x372f27)?.group === _0x3ed57b).sort((_0x5c2cca, _0x27c6a2) => {
    const _0x314e47 = getImageMenuMeta(_0x5c2cca);
    const _0x3c821d = getImageMenuMeta(_0x27c6a2);
    return (_0x314e47?.order || 0) - (_0x3c821d?.order || 0);
  });
}
function renderImageMenuGroupHTML({
  headerClass: _0x16bf20,
  toggleAttr: _0x368b50,
  submenuClass: _0x431057,
  iconHtml: _0x77403a,
  title: _0xfbf17f,
  subtitle: _0x82a4d,
  vip = false,
  badgeHtml = "",
  itemsHtml = "",
  attrs: _0x4e640d,
  developerOnly = false
}) {
  return renderNodeMenuGroup({
    id: _0x431057,
    headerClass: _0x16bf20,
    toggleAttr: _0x368b50,
    submenuClass: _0x431057,
    iconHtml: _0x77403a,
    label: _0xfbf17f,
    subtitle: _0x82a4d,
    vip: vip,
    badgeHtml: badgeHtml,
    itemsHtml: itemsHtml,
    attrs: _0x4e640d,
    developerOnly: developerOnly
  });
}
function renderImageManifestIconHTML(_0x2e96da, _0x28a2a = {}) {
  if (_0x28a2a.iconKind === "customProviderBadge") {
    const _0x42f32a = getCustomProviderBadgeText(_0x2e96da, _0x28a2a);
    return "<div class=\"node-menu-icon node-menu-icon-badge\">" + escapeHtmlAttr(_0x42f32a) + "</div>";
  }
  if (_0x28a2a.iconKind === "openAiBadge") {
    return OPENAI_CLI_BADGE_ICON_HTML;
  }
  if (_0x28a2a.iconKind === "apimartBadge") {
    return APIMART_BADGE_ICON_HTML;
  }
  if (_0x28a2a.iconKind === "binghuoBadge") {
    return BINGHUO_BADGE_ICON_HTML;
  }
  if (_0x28a2a.iconKind === "agnesBadge") {
    return AGNES_BADGE_ICON_HTML;
  }
  if (_0x28a2a.iconKind === "comfyUiCloudWorkflowBadge") {
    return COMFYUI_CLOUD_WORKFLOW_ICON_HTML;
  }
  if (_0x28a2a.iconKind === "comfyUiLocalWorkflowBadge") {
    return COMFYUI_LOCAL_WORKFLOW_ICON_HTML;
  }
  const _0xaef216 = _0x28a2a.icon || _0x2e96da?.icon || "";
  if (!_0xaef216) {
    return "";
  }
  const _0x153d1f = _0x28a2a.iconAlt || _0x2e96da?.provider || _0x2e96da?.displayName || "";
  return "<img src=\"" + escapeHtmlAttr(_0xaef216) + "\" class=\"node-menu-icon\" alt=\"" + escapeHtmlAttr(_0x153d1f) + "\">";
}
function getCustomProviderImageGroups(_0x3d55b1 = "") {
  const _0xafd6d2 = new Map();
  getModelsByKind("image").forEach(_0x198ebf => {
    const _0x4f45c6 = getImageMenuMeta(_0x198ebf);
    const _0x2dd470 = getCustomProviderMeta(_0x198ebf);
    const _0x21e310 = String(_0x4f45c6?.group || _0x198ebf?.provider || "").trim();
    if (!_0x4f45c6 || !_0x2dd470 || !_0x21e310) {
      return;
    }
    if (!_0xafd6d2.has(_0x21e310)) {
      _0xafd6d2.set(_0x21e310, {
        providerId: _0x21e310,
        displayName: _0x2dd470.displayName || _0x21e310,
        subtitle: _0x4f45c6.subtitle || "自定义中转站",
        badge: _0x2dd470.badge || _0x4f45c6.badge || "CP",
        items: []
      });
    }
    _0xafd6d2.get(_0x21e310).items.push(_0x198ebf);
  });
  return Array.from(_0xafd6d2.values()).map(_0x5d3306 => {
    const _0x16e8d7 = _0x5d3306.providerId.replace(/[^A-Za-z0-9_-]/g, "-");
    return renderImageMenuGroupHTML({
      headerClass: "custom-provider-image-group-header custom-provider-image-group-" + _0x16e8d7,
      toggleAttr: "data-custom-provider-image-toggle",
      submenuClass: "custom-provider-image-submenu-" + _0x16e8d7,
      iconHtml: "<div class=\"node-menu-icon node-menu-icon-badge\">" + escapeHtmlAttr(_0x5d3306.badge) + "</div>",
      title: _0x5d3306.displayName,
      subtitle: _0x5d3306.subtitle,
      attrs: {
        "data-custom-provider-image-group": _0x5d3306.providerId
      },
      itemsHtml: _0x5d3306.items.sort((_0x308854, _0x31f32e) => Number(getImageMenuMeta(_0x308854)?.order || 0) - Number(getImageMenuMeta(_0x31f32e)?.order || 0)).map(_0x3c462d => renderImageManifestMenuItemHTML(_0x3c462d, _0x3d55b1)).join("")
    });
  });
}
function renderImageManifestMenuItemHTML(_0x4223dd, _0x2d67f7) {
  const _0x14f711 = getImageMenuMeta(_0x4223dd) || {};
  const _0x501769 = _0x4223dd?.modelId || "";
  const _0x48feac = _0x4223dd?.provider || "";
  const _0x38c3e3 = String(_0x2d67f7 || "") === _0x501769;
  const _0x751c07 = _0x4223dd?.vip === true && _0x14f711.showVipBadge !== false;
  const _0x36fe4e = Array.isArray(_0x4223dd?.extensions?.providerProfiles) && _0x4223dd.extensions.providerProfiles.length ? buildModelProviderProfileBadgesHtml(_0x4223dd, {
    vip: _0x751c07
  }) : "";
  return renderNodeMenuItem({
    modelId: _0x501769,
    provider: _0x48feac,
    label: _0x14f711.title || _0x4223dd?.displayName || _0x501769,
    description: _0x14f711.subtitle || _0x4223dd?.description || "",
    iconHtml: renderImageManifestIconHTML(_0x4223dd, _0x14f711),
    active: _0x38c3e3,
    vip: _0x751c07,
    badgeHtml: _0x36fe4e
  });
}
export function buildGrsaiImageMenuGroupHTML(_0x362820, _0x4d13e5 = "") {
  return renderImageMenuGroupHTML({
    headerClass: "grsai-group-header",
    toggleAttr: "data-grsai-toggle",
    submenuClass: "grsai-submenu",
    iconHtml: GRSAI_IMAGE_MENU_ICON_HTML,
    title: "GRSAI",
    subtitle: "高性能 AI 图像生成服务",
    itemsHtml: buildNanoBananaFamilyMenuHTML(_0x362820, _0x4d13e5)
  });
}
export function buildApimartImageMenuGroupHTML(_0x10065f) {
  const _0x3b5a1b = getImageModelMenuManifests("apimart").map(_0x548680 => renderImageManifestMenuItemHTML(_0x548680, _0x10065f)).join("");
  return renderImageMenuGroupHTML({
    headerClass: "apimart-group-header",
    toggleAttr: "data-apimart-toggle",
    submenuClass: "apimart-submenu",
    iconHtml: APIMART_BADGE_ICON_HTML,
    title: "APIMart",
    subtitle: "一个 API 搞定一切——节省 30-70%",
    itemsHtml: _0x3b5a1b
  });
}
export function buildAgnesImageMenuGroupHTML(_0x2c50c8) {
  const _0x8c63e1 = getImageModelMenuManifests("agnes").map(_0x46f65f => renderImageManifestMenuItemHTML(_0x46f65f, _0x2c50c8)).join("");
  return renderImageMenuGroupHTML({
    headerClass: "agnes-group-header",
    toggleAttr: "data-agnes-toggle",
    submenuClass: "agnes-submenu",
    iconHtml: AGNES_BADGE_ICON_HTML,
    title: "Agnes AI",
    subtitle: "Agnes Image model API",
    itemsHtml: _0x8c63e1
  });
}
export function buildBinghuoImageMenuGroupHTML(_0x4837fe) {
  const _0x37042f = getImageModelMenuManifests("binghuo").map(_0x5ac58c => renderImageManifestMenuItemHTML(_0x5ac58c, _0x4837fe)).join("");
  if (!_0x37042f) {
    return "";
  }
  return renderImageMenuGroupHTML({
    headerClass: "binghuo-image-group-header",
    toggleAttr: "data-binghuo-image-toggle",
    submenuClass: "binghuo-image-submenu",
    iconHtml: BINGHUO_BADGE_ICON_HTML,
    title: "便宜渠道bh",
    subtitle: "炳火图片生成 API",
    itemsHtml: _0x37042f
  });
}
export function buildVolcengineImageMenuGroupHTML(_0x2898dd) {
  const _0x2c23e0 = getImageModelMenuManifests("volcengine").map(_0x27bf05 => renderImageManifestMenuItemHTML(_0x27bf05, _0x2898dd)).join("");
  return renderImageMenuGroupHTML({
    headerClass: "volcengine-group-header",
    toggleAttr: "data-volcengine-toggle",
    submenuClass: "volcengine-submenu",
    iconHtml: VOLCENGINE_IMAGE_MENU_ICON_HTML,
    title: "火山方舟",
    subtitle: "Ark Seedream 图像生成 API",
    itemsHtml: _0x2c23e0
  });
}
export function buildOpenAiCliImageMenuGroupHTML(_0x260e3c) {
  const _0x4cfd1c = getImageModelMenuManifests("openai-cli").map(_0x2a2a9c => renderImageManifestMenuItemHTML(_0x2a2a9c, _0x260e3c)).join("");
  if (!_0x4cfd1c) {
    return "";
  }
  return renderImageMenuGroupHTML({
    headerClass: "openai-cli-image-group-header",
    toggleAttr: "data-openai-cli-image-toggle",
    submenuClass: "openai-cli-image-submenu",
    iconHtml: OPENAI_CLI_BADGE_ICON_HTML,
    title: "OpenAI CLI",
    subtitle: "使用本机已登录的 OpenAI CLI 账号",
    itemsHtml: _0x4cfd1c,
    developerOnly: true
  });
}
export function buildRunningHubImageModelMenuGroupHTML(_0x5be50a, _0x5c7a20 = "") {
  return renderImageMenuGroupHTML({
    headerClass: "runninghub-group-header",
    toggleAttr: "data-runninghub-toggle",
    submenuClass: "runninghub-submenu",
    iconHtml: "<img src=\"images/RH.png\" class=\"node-menu-icon\" alt=\"runninghub\">",
    title: "RunningHub模型",
    subtitle: "模型 API：文生图/图生图/图片编辑",
    itemsHtml: buildRunningHubNanoBananaFamilyMenuHTML(_0x5be50a, _0x5c7a20)
  });
}
export function buildRunningHubWorkflowImageMenuGroupHTML(_0x18187a) {
  const _0x55458f = getImageModelMenuManifests("runninghubWorkflow").map(_0x4cb58e => buildManifestModelMenuItemHTML(_0x4cb58e.modelId, _0x18187a)).join("");
  return renderImageMenuGroupHTML({
    headerClass: "runninghubwf-group-header",
    toggleAttr: "data-runninghubwf-toggle",
    submenuClass: "runninghubwf-submenu",
    iconHtml: "<img src=\"images/RH.png\" class=\"node-menu-icon\" alt=\"runninghub\">",
    title: "RunningHUB工作流",
    subtitle: "工作流模板：替换/风格迁移，结果更可控",
    itemsHtml: _0x55458f
  });
}
export function buildRhAiAppImageMenuGroupHTML(_0x29f8d9) {
  const _0x51b2fc = getImageModelMenuManifests("rhAiApp").map(_0x3a7395 => renderImageManifestMenuItemHTML(_0x3a7395, _0x29f8d9)).join("");
  if (!_0x51b2fc) {
    return "";
  }
  return renderImageMenuGroupHTML({
    headerClass: "rh-ai-app-image-group-header",
    toggleAttr: "data-rh-ai-app-toggle",
    submenuClass: "rh-ai-app-image-submenu",
    iconHtml: "<img src=\"images/RH.png\" class=\"node-menu-icon\" alt=\"runninghub\">",
    title: "RH AI应用",
    subtitle: "自定义 RunningHub AI App",
    vip: false,
    itemsHtml: _0x51b2fc
  });
}
function buildComfyUiWorkflowImageMenuGroupHTML({
  activeModel: _0x354dc0,
  group: _0x35b15d,
  headerClass: _0x4e7876,
  toggleAttr: _0x3c1bcb,
  submenuClass: _0x46fbc0,
  iconHtml: _0x298291,
  title: _0x5197e5,
  subtitle: _0x5a8362
} = {}) {
  const _0x335a72 = getImageModelMenuManifests(_0x35b15d).map(_0x2e081f => renderImageManifestMenuItemHTML(_0x2e081f, _0x354dc0)).join("");
  if (!_0x335a72) {
    return "";
  }
  return renderImageMenuGroupHTML({
    headerClass: _0x4e7876,
    toggleAttr: _0x3c1bcb,
    submenuClass: _0x46fbc0,
    iconHtml: _0x298291,
    title: _0x5197e5,
    subtitle: _0x5a8362,
    itemsHtml: _0x335a72
  });
}
export function buildComfyUiCloudWorkflowImageMenuGroupHTML(_0x4b1874) {
  return buildComfyUiWorkflowImageMenuGroupHTML({
    activeModel: _0x4b1874,
    group: "comfyUiCloudWorkflow",
    headerClass: "comfyui-cloud-workflow-group-header",
    toggleAttr: "data-comfyui-cloud-workflow-toggle",
    submenuClass: "comfyui-cloud-workflow-submenu",
    iconHtml: COMFYUI_CLOUD_WORKFLOW_ICON_HTML,
    title: "云端工作流",
    subtitle: "保存的 ComfyUI 云端工作流"
  });
}
export function buildComfyUiLocalWorkflowImageMenuGroupHTML(_0x1e836b) {
  return buildComfyUiWorkflowImageMenuGroupHTML({
    activeModel: _0x1e836b,
    group: "comfyUiLocalWorkflow",
    headerClass: "comfyui-local-workflow-group-header",
    toggleAttr: "data-comfyui-local-workflow-toggle",
    submenuClass: "comfyui-local-workflow-submenu",
    iconHtml: COMFYUI_LOCAL_WORKFLOW_ICON_HTML,
    title: "本地工作流",
    subtitle: "保存的 ComfyUI 本地工作流"
  });
}
export function buildImageModelMenuHTML({
  activeModel = "",
  nanoSelection = null
} = {}) {
  return "<div class=\"floating-menu img-model-menu\">\n                " + buildGrsaiImageMenuGroupHTML(nanoSelection, activeModel) + "\n                " + getDreaminaImageMenuGroupHTML(activeModel) + "\n                " + buildOpenAiCliImageMenuGroupHTML(activeModel) + "\n                " + buildApimartImageMenuGroupHTML(activeModel) + "\n                " + buildBinghuoImageMenuGroupHTML(activeModel) + "\n                " + buildAgnesImageMenuGroupHTML(activeModel) + "\n                " + buildVolcengineImageMenuGroupHTML(activeModel) + "\n                " + getCustomProviderImageGroups(activeModel).join("") + "\n                " + buildRhAiAppImageMenuGroupHTML(activeModel) + "\n                " + buildComfyUiCloudWorkflowImageMenuGroupHTML(activeModel) + "\n                " + buildComfyUiLocalWorkflowImageMenuGroupHTML(activeModel) + "\n                " + buildRunningHubImageModelMenuGroupHTML(nanoSelection, activeModel) + "\n                " + buildRunningHubWorkflowImageMenuGroupHTML(activeModel) + "\n              </div>";
}
function getLatestImageMenuNodeData(_0x9e5c54, _0x18fda4, _0x55bfc4 = {}) {
  return (_0x9e5c54?.getState?.() || {}).nodes?.[_0x18fda4] || _0x55bfc4 || {};
}
function getImageMenuItemTitle(_0x526879, _0x205856 = "") {
  const _0x35f9a6 = _0x526879?.querySelector?.(".fmi-title") || _0x526879?.querySelector?.(".floating-menu-label");
  if (_0x35f9a6) {
    return _0x35f9a6.textContent;
  } else {
    return _0x205856;
  }
}
function clearImageModelMenuActive(_0x1f5782) {
  _0x1f5782?.querySelectorAll?.(".floating-menu-item")?.forEach(_0x4626e9 => _0x4626e9.classList.remove("active"));
}
export function bindImageModelMenuSubmenu({
  modelMenu: _0x1b55c9,
  modelTrigger: _0x3d1f03,
  modelLabel: _0x38f66e,
  nodeId: _0x4b5b28,
  store: _0xf022,
  fallbackNodeData = {},
  toggleSelector = "",
  submenuSelector = "",
  headerEl = null,
  submenuEl = null,
  defaultProvider = "",
  buildModelPatch: _0x2fd68,
  resolveSelection: _0x268690,
  beforeSelect: _0x4404b5,
  onDisabled: _0x453664,
  afterSelect: _0x5c986a
} = {}) {
  if (!_0x1b55c9 || !_0x38f66e || !_0x4b5b28 || !_0xf022) {
    return null;
  }
  const _0x4a6b2c = headerEl || _0x1b55c9.querySelector(toggleSelector);
  const _0x501202 = submenuEl || _0x1b55c9.querySelector(submenuSelector);
  if (!_0x4a6b2c || !_0x501202) {
    return null;
  }
  let _0x2f22fa = null;
  const _0x1476f2 = () => {
    if (_0x2f22fa) {
      clearTimeout(_0x2f22fa);
      _0x2f22fa = null;
    }
    positionNodeSubmenu(_0x4a6b2c, _0x501202);
  };
  const _0x251ca2 = (_0xf8bae9 = 120) => {
    if (_0x2f22fa) {
      clearTimeout(_0x2f22fa);
    }
    _0x2f22fa = setTimeout(() => {
      _0x501202.style.display = "none";
    }, _0xf8bae9);
  };
  _0x4a6b2c.addEventListener("mouseenter", _0x1476f2);
  _0x4a6b2c.addEventListener("mouseleave", () => _0x251ca2());
  _0x501202.addEventListener("mouseenter", _0x1476f2);
  _0x501202.addEventListener("mouseleave", () => _0x251ca2());
  _0x501202.querySelectorAll(".floating-menu-item").forEach(_0x1d9980 => {
    _0x1d9980.addEventListener("click", _0x4502be => {
      _0x4502be.stopPropagation();
      if (_0x1d9980.dataset.disabled === "true") {
        _0x453664?.({
          item: _0x1d9980,
          modelMenu: _0x1b55c9,
          submenu: _0x501202,
          modelTrigger: _0x3d1f03
        });
        return;
      }
      const _0x29174c = getLatestImageMenuNodeData(_0xf022, _0x4b5b28, fallbackNodeData);
      const _0x41c7f2 = (typeof _0x268690 === "function" ? _0x268690({
        item: _0x1d9980,
        latestNode: _0x29174c,
        defaultProvider: defaultProvider
      }) : null) || {
        model: _0x1d9980.dataset.value,
        provider: _0x1d9980.dataset.provider || defaultProvider
      };
      const _0x381329 = String(_0x41c7f2.model || "").trim();
      const _0x28fd55 = String(_0x41c7f2.provider || defaultProvider).trim();
      if (!_0x381329 || !_0x28fd55) {
        return;
      }
      if (typeof _0x4404b5 === "function" && _0x4404b5({
        item: _0x1d9980,
        model: _0x381329,
        provider: _0x28fd55,
        latestNode: _0x29174c,
        selection: _0x41c7f2
      }) === false) {
        return;
      }
      _0x38f66e.textContent = _0x41c7f2.label || getImageMenuItemTitle(_0x1d9980, _0x381329);
      clearImageModelMenuActive(_0x1b55c9);
      _0x1d9980.classList.add("active");
      _0x1b55c9.classList.remove("show");
      _0x501202.style.display = "none";
      const _0x5704d1 = _0x41c7f2.patch && typeof _0x41c7f2.patch === "object" ? _0x41c7f2.patch : {
        model: _0x381329,
        provider: _0x28fd55
      };
      const _0x20f516 = typeof _0x2fd68 === "function" ? _0x2fd68(_0x29174c, _0x381329, _0x28fd55, _0x5704d1) : {
        ..._0x5704d1,
        model: _0x381329,
        provider: _0x28fd55
      };
      _0xf022.updateNodeData(_0x4b5b28, _0x20f516);
      _0x5c986a?.({
        item: _0x1d9980,
        model: _0x381329,
        provider: _0x28fd55,
        latestNode: _0x29174c,
        patch: _0x20f516,
        selection: _0x41c7f2,
        modelMenu: _0x1b55c9,
        submenu: _0x501202,
        modelTrigger: _0x3d1f03
      });
    });
  });
  return {
    header: _0x4a6b2c,
    submenu: _0x501202
  };
}
export function resolveGrsaiImageMenuSelection({
  item: _0x5f2bdb,
  latestNode: _0x544f55
} = {}) {
  const _0x60bc2e = "grsai";
  const _0xeadccc = String(_0x5f2bdb?.dataset?.value || "").trim();
  let _0x23e213 = _0xeadccc;
  let _0x49a8d0 = {
    model: _0x23e213,
    provider: _0x60bc2e
  };
  if (isGrsaiGptImage2ModelToken(_0x23e213)) {
    _0x23e213 = GRSAI_GPT_IMAGE_2_MODEL;
    _0x49a8d0 = {
      model: _0x23e213,
      provider: _0x60bc2e,
      imageSize: "1K"
    };
  } else if (!_0x23e213) {
    const _0x361e22 = String(_0x5f2bdb?.dataset?.nbFamily || "").trim();
    if (!_0x361e22) {
      return null;
    }
    const _0x2f4b9c = getPlainSchemaParams(_0x544f55?.generationParams).imageSize || "2K";
    const _0x47140d = getDefaultModeForNanoBananaFamily(_0x361e22, _0x60bc2e);
    _0x23e213 = resolveNanoBananaModelBySelection({
      family: _0x361e22,
      mode: _0x47140d,
      imageSize: _0x2f4b9c,
      provider: _0x60bc2e
    });
    _0x49a8d0 = {
      model: _0x23e213,
      provider: _0x60bc2e
    };
  }
  return {
    model: _0x23e213,
    provider: _0x60bc2e,
    patch: _0x49a8d0
  };
}
export function resolveApimartImageMenuSelection({
  item: _0x47ac59,
  latestNode: _0x58774a
} = {}) {
  const _0x39499e = String(_0x47ac59?.dataset?.value || "").trim();
  const _0x1677e1 = String(_0x47ac59?.dataset?.provider || "apimart").trim();
  const _0x363661 = {
    model: _0x39499e,
    provider: _0x1677e1
  };
  if (_0x39499e === "apimart/seedream-4.5" || _0x39499e === "apimart/seedream-5.0-lite" || _0x39499e === APIMART_GPT_IMAGE_2_MODEL || _0x39499e === APIMART_QWEN_IMAGE_MODEL || _0x39499e === APIMART_Z_IMAGE_TURBO_MODEL || _0x39499e === APIMART_WAN_IMAGE_MODEL) {
    const _0x13895e = getPlainSchemaParams(_0x58774a?.generationParams).imageSize || _0x58774a?.imageSize || "2K";
    if ((_0x39499e === "apimart/seedream-4.5" || _0x39499e === "apimart/seedream-5.0-lite") && _0x13895e === "1K") {
      _0x363661.imageSize = "2K";
    }
    if (_0x39499e === "apimart/seedream-5.0-lite" && _0x13895e === "4K") {
      _0x363661.imageSize = "3K";
    }
    if (_0x39499e === APIMART_GPT_IMAGE_2_MODEL && _0x13895e === "3K") {
      _0x363661.imageSize = "2K";
    }
    if ((_0x39499e === APIMART_QWEN_IMAGE_MODEL || _0x39499e === APIMART_Z_IMAGE_TURBO_MODEL) && _0x13895e !== "1K" && _0x13895e !== "2K") {
      _0x363661.imageSize = "1K";
    }
    if (_0x39499e === APIMART_WAN_IMAGE_MODEL && _0x13895e !== "1K" && _0x13895e !== "2K") {
      _0x363661.imageSize = "2K";
    }
  }
  return {
    model: _0x39499e,
    provider: _0x1677e1,
    patch: _0x363661
  };
}
export function resolveVolcengineImageMenuSelection({
  item: _0xf51535,
  latestNode: _0x334df7
} = {}) {
  const _0xfb6355 = String(_0xf51535?.dataset?.value || "").trim();
  const _0x1d7e58 = String(_0xf51535?.dataset?.provider || "volcengine").trim();
  const _0x51b6c9 = {
    model: _0xfb6355,
    provider: _0x1d7e58
  };
  const _0x47632b = getPlainSchemaParams(_0x334df7?.generationParams).imageSize || _0x334df7?.imageSize || "2K";
  const _0x320abb = pickSupportedImageSize(_0x47632b, getManifestUiField(_0xfb6355, "imageSize"));
  if (_0x320abb) {
    _0x51b6c9.imageSize = _0x320abb;
  }
  return {
    model: _0xfb6355,
    provider: _0x1d7e58,
    patch: _0x51b6c9
  };
}
export function resolveRunningHubWorkflowImageMenuSelection({
  item: _0x55947d
} = {}) {
  return {
    model: _0x55947d?.dataset?.value,
    provider: _0x55947d?.dataset?.provider || "runninghubwf"
  };
}
export function resolveRunningHubModelImageMenuSelection({
  item: _0x26b482,
  latestNode: _0x631ded
} = {}) {
  const _0xc74516 = String(_0x26b482?.dataset?.nbFamily || "").trim();
  let _0x46a5aa = _0x26b482?.dataset?.value;
  let _0x13afa5 = _0x26b482?.dataset?.provider || "runninghubwf";
  if (_0xc74516) {
    _0x13afa5 = "runninghub";
    const _0x1874af = getPlainSchemaParams(_0x631ded?.generationParams).imageSize || "2K";
    const _0x2bf04d = getDefaultModeForNanoBananaFamily(_0xc74516, _0x13afa5);
    _0x46a5aa = resolveNanoBananaModelBySelection({
      family: _0xc74516,
      mode: _0x2bf04d,
      imageSize: _0x1874af,
      provider: _0x13afa5
    });
  }
  if (!_0x46a5aa || !_0x13afa5) {
    return null;
  }
  const _0x3d9737 = buildModelProviderProfileSelectionPatch(_0x631ded, _0x46a5aa, _0x26b482?.dataset?.credentialResolvedProviderProfileId);
  if (_0x3d9737.rhProviderProfileId === "" && !Object.hasOwn(_0x631ded || {}, "rhProviderProfileId")) {
    delete _0x3d9737.rhProviderProfileId;
  }
  return {
    model: _0x46a5aa,
    provider: _0x13afa5,
    patch: _0x3d9737
  };
}
function createImageTriggerIcon(_0x21bd8b, _0x532137 = "img") {
  const _0x4dc28a = _0x21bd8b?.ownerDocument || (typeof document !== "undefined" ? document : null);
  return _0x4dc28a?.createElement?.(_0x532137) || null;
}
function replaceImageModelTriggerFirstIcon(_0x2ff4a4, _0x673b26) {
  const _0x2a0bbf = _0x2ff4a4?.firstElementChild;
  if (!_0x2a0bbf || !_0x673b26) {
    return;
  }
  _0x2a0bbf.replaceWith(_0x673b26);
}
function createImageTriggerIconFromHTML(_0x49eea8, _0x44c80e) {
  const _0x4ddbcb = _0x49eea8?.ownerDocument || (typeof document !== "undefined" ? document : null);
  const _0x868495 = _0x4ddbcb?.createElement?.("template");
  if (!_0x868495) {
    return null;
  }
  _0x868495.innerHTML = String(_0x44c80e || "").trim();
  return _0x868495.content?.firstElementChild || null;
}
function setSimpleImageModelTriggerIcon(_0x3a96aa, _0x5cbee5 = {}) {
  const _0x160493 = createImageTriggerIcon(_0x3a96aa, "img");
  if (!_0x160493) {
    return;
  }
  _0x160493.src = _0x5cbee5.src || "";
  if (_0x5cbee5.alt) {
    _0x160493.alt = _0x5cbee5.alt;
  }
  _0x160493.className = ["image-model-trigger-icon", _0x5cbee5.className || ""].filter(Boolean).join(" ");
  replaceImageModelTriggerFirstIcon(_0x3a96aa, _0x160493);
}
function setApimartImageModelTriggerIcon(_0xead00b) {
  const _0x3462ef = createImageTriggerIcon(_0xead00b, "div");
  if (!_0x3462ef) {
    return;
  }
  _0x3462ef.className = "image-model-trigger-icon image-model-trigger-badge image-model-trigger-icon-apimart";
  _0x3462ef.innerText = "AM";
  replaceImageModelTriggerFirstIcon(_0xead00b, _0x3462ef);
}
function setAgnesImageModelTriggerIcon(_0x34da6b) {
  const _0x285ab2 = createImageTriggerIcon(_0x34da6b, "div");
  if (!_0x285ab2) {
    return;
  }
  _0x285ab2.className = "image-model-trigger-icon image-model-trigger-badge";
  _0x285ab2.innerText = "AG";
  replaceImageModelTriggerFirstIcon(_0x34da6b, _0x285ab2);
}
function setOpenAiCliImageModelTriggerIcon(_0x5b788c) {
  const _0x1c8c09 = createImageTriggerIcon(_0x5b788c, "div");
  if (!_0x1c8c09) {
    return;
  }
  _0x1c8c09.className = "image-model-trigger-icon image-model-trigger-badge";
  _0x1c8c09.innerText = "OA";
  replaceImageModelTriggerFirstIcon(_0x5b788c, _0x1c8c09);
}
function getComfyUiWorkflowIconKind(_0xd2c788 = "", _0x37ba57 = null) {
  const _0x1aab72 = _0x37ba57?.querySelector?.(".custom-ai-app-logo");
  if (_0x1aab72?.classList?.contains("custom-ai-app-logo--comfyui-cloud")) {
    return "comfyUiCloudWorkflowBadge";
  }
  if (_0x1aab72?.classList?.contains("custom-ai-app-logo--comfyui-local")) {
    return "comfyUiLocalWorkflowBadge";
  }
  const _0x321260 = String(_0xd2c788 || "").trim() || String(_0x37ba57?.dataset?.value || _0x37ba57?.getAttribute?.("data-value") || "").trim();
  const _0xc536c7 = String(getModelManifest(_0x321260)?.extensions?.imageMenu?.iconKind || "").trim();
  return _0xc536c7;
}
function renderComfyUiWorkflowTriggerIconHTML(_0x2709b1 = "") {
  return renderComfyUiWorkflowLogoHtmlFromIconKind(getComfyUiWorkflowIconKind(_0x2709b1), {
    className: "image-model-trigger-icon"
  });
}
function setComfyUiWorkflowTriggerIcon(_0x135c8f, _0x52aebd = null) {
  const _0x564c9c = createImageTriggerIconFromHTML(_0x135c8f, renderComfyUiWorkflowLogoHtmlFromIconKind(getComfyUiWorkflowIconKind("", _0x52aebd), {
    className: "image-model-trigger-icon"
  }));
  if (!_0x564c9c) {
    return;
  }
  replaceImageModelTriggerFirstIcon(_0x135c8f, _0x564c9c);
}
function resolveImageTriggerManifest(_0x300516 = "", _0x545cd3 = "") {
  const _0xb1a105 = String(_0x300516 || "").trim();
  if (_0xb1a105) {
    const _0x4486c7 = getModelManifest(_0xb1a105);
    if (_0x4486c7) {
      return _0x4486c7;
    }
  }
  const _0x2e2763 = String(_0x545cd3 || "").trim();
  if (!_0xb1a105 && !_0x2e2763) {
    return null;
  }
  try {
    return resolveModelExecution(_0xb1a105, {
      providerHint: _0x2e2763
    })?.modelManifest || resolveModelExecution(_0xb1a105)?.modelManifest || null;
  } catch {
    return null;
  }
}
function renderCustomProviderTriggerBadgeHTML(_0x419c08, _0x1febca = {}) {
  const _0x259418 = getCustomProviderBadgeText(_0x419c08, _0x1febca);
  return "<div class=\"image-model-trigger-icon image-model-trigger-badge\">" + escapeHtmlAttr(_0x259418) + "</div>";
}
function setCustomProviderImageModelTriggerIcon(_0x215472, _0x18b108, _0x2820b9 = {}) {
  const _0x2c5746 = createImageTriggerIcon(_0x215472, "div");
  if (!_0x2c5746) {
    return;
  }
  _0x2c5746.className = "image-model-trigger-icon image-model-trigger-badge";
  _0x2c5746.innerText = getCustomProviderBadgeText(_0x18b108, _0x2820b9);
  replaceImageModelTriggerFirstIcon(_0x215472, _0x2c5746);
}
export function setImageModelTriggerIcon(_0x7bb9af, _0x1dc6b5, _0x18bdfe = null) {
  const _0x44642c = String(_0x18bdfe?.dataset?.value || "").trim();
  const _0x82145c = resolveImageTriggerManifest(_0x44642c, _0x1dc6b5);
  const _0x169556 = getImageMenuMeta(_0x82145c) || {};
  if (_0x169556.iconKind === "customProviderBadge") {
    setCustomProviderImageModelTriggerIcon(_0x7bb9af, _0x82145c, _0x169556);
    return;
  }
  if (_0x169556.iconKind === "binghuoBadge") {
    setCustomProviderImageModelTriggerIcon(_0x7bb9af, _0x82145c, _0x169556);
    return;
  }
  if (_0x169556.iconKind === "openAiBadge") {
    setOpenAiCliImageModelTriggerIcon(_0x7bb9af);
    return;
  }
  const _0x336aa3 = String(_0x1dc6b5 || "").trim().toLowerCase();
  if (_0x336aa3 === "apimart") {
    setApimartImageModelTriggerIcon(_0x7bb9af, _0x18bdfe);
    return;
  }
  if (_0x336aa3 === "agnes") {
    setAgnesImageModelTriggerIcon(_0x7bb9af, _0x18bdfe);
    return;
  }
  if (_0x336aa3 === "binghuo") {
    setCustomProviderImageModelTriggerIcon(_0x7bb9af, _0x82145c, {
      badge: "BH"
    });
    return;
  }
  if (_0x336aa3 === "aicanvas") {
    setSimpleImageModelTriggerIcon(_0x7bb9af, {
      src: "images/favicon.svg",
      alt: "aicanvas",
      className: "image-model-trigger-icon-large"
    });
    return;
  }
  if (_0x336aa3 === "runninghub" || _0x336aa3 === "runninghubwf") {
    setSimpleImageModelTriggerIcon(_0x7bb9af, {
      src: "images/RH.png",
      alt: "runninghub",
      className: "image-model-trigger-icon-soft"
    });
    return;
  }
  if (_0x336aa3 === "comfyui") {
    setComfyUiWorkflowTriggerIcon(_0x7bb9af, _0x18bdfe);
    return;
  }
  if (_0x336aa3 === "ppio") {
    setSimpleImageModelTriggerIcon(_0x7bb9af, {
      src: "images/gemini.svg",
      alt: "ppio"
    });
    return;
  }
  if (_0x336aa3 === "volcengine") {
    setSimpleImageModelTriggerIcon(_0x7bb9af, {
      src: "images/volcengine.svg",
      alt: "volcengine"
    });
    return;
  }
  setSimpleImageModelTriggerIcon(_0x7bb9af, {
    src: "images/grsai.png",
    alt: "grsai",
    className: "image-model-trigger-icon-padded"
  });
}
export function renderImageModelTriggerIconHTML({
  model = "",
  provider = ""
} = {}) {
  const _0x5a7a2c = String(model || "").trim();
  const _0x4da958 = resolveImageTriggerManifest(_0x5a7a2c, provider);
  const _0x47a7b9 = getImageMenuMeta(_0x4da958) || {};
  if (_0x47a7b9.iconKind === "customProviderBadge") {
    return renderCustomProviderTriggerBadgeHTML(_0x4da958, _0x47a7b9);
  }
  if (_0x47a7b9.iconKind === "binghuoBadge") {
    return renderCustomProviderTriggerBadgeHTML(_0x4da958, _0x47a7b9);
  }
  if (_0x47a7b9.iconKind === "openAiBadge") {
    return "<div class=\"image-model-trigger-icon image-model-trigger-badge\">OA</div>";
  }
  const _0x9aeb8a = String(resolveModelProvider(_0x5a7a2c, provider) || provider || "").trim().toLowerCase();
  if (_0x9aeb8a === "apimart") {
    return "<div class=\"image-model-trigger-icon image-model-trigger-badge image-model-trigger-icon-apimart\">AM</div>";
  }
  if (_0x9aeb8a === "agnes") {
    return "<div class=\"image-model-trigger-icon image-model-trigger-badge\">AG</div>";
  }
  if (_0x9aeb8a === "binghuo") {
    return "<div class=\"image-model-trigger-icon image-model-trigger-badge\">BH</div>";
  }
  if (_0x9aeb8a === "aicanvas" || _0x5a7a2c.startsWith("aicanvas/")) {
    return "<img src=\"images/favicon.svg\" class=\"image-model-trigger-icon image-model-trigger-icon-large\" alt=\"aicanvas\">";
  }
  if (_0x9aeb8a === "dreamina") {
    return getDreaminaImageTriggerIconHTML();
  }
  if (_0x9aeb8a === "runninghub" || _0x9aeb8a === "runninghubwf") {
    return "<img src=\"images/RH.png\" class=\"image-model-trigger-icon image-model-trigger-icon-soft\" alt=\"runninghub\">";
  }
  if (_0x9aeb8a === "comfyui") {
    return renderComfyUiWorkflowTriggerIconHTML(_0x5a7a2c);
  }
  if (_0x9aeb8a === "ppio") {
    return "<img src=\"images/gemini.svg\" class=\"image-model-trigger-icon\" alt=\"ppio\">";
  }
  if (_0x9aeb8a === "volcengine") {
    return "<img src=\"images/volcengine.svg\" class=\"image-model-trigger-icon\" alt=\"volcengine\">";
  }
  return "<img src=\"images/grsai.png\" class=\"image-model-trigger-icon image-model-trigger-icon-padded\" alt=\"grsai\">";
}
export function syncImageModelTriggerIcon(_0x5d457d, _0x58d6b9 = {}) {
  if (!_0x5d457d || !_0x58d6b9?.model) {
    return;
  }
  const _0x10434a = createImageTriggerIconFromHTML(_0x5d457d, renderImageModelTriggerIconHTML({
    model: _0x58d6b9.model,
    provider: _0x58d6b9.provider
  }));
  const _0xee9817 = _0x5d457d.firstElementChild;
  if (_0x10434a && _0xee9817?.outerHTML !== _0x10434a.outerHTML) {
    _0xee9817?.replaceWith?.(_0x10434a);
  }
}
export function buildNanoBananaFamilyMenuHTML(_0x1e6ed2, _0x1fb817 = "") {
  const _0x30fced = _0x1e6ed2?.provider === "grsai" ? _0x1e6ed2?.family || "" : "";
  const _0x5b1374 = normalizeGrsaiModelToken(_0x1fb817);
  return getImageModelMenuManifests("grsaiModel").map(_0x1493c8 => {
    const _0x2b0655 = getImageMenuMeta(_0x1493c8) || {};
    if (_0x2b0655.role === "directModel") {
      const _0x42c6fd = _0x1493c8.modelId || GRSAI_GPT_IMAGE_2_MODEL;
      const _0x5ada48 = normalizeGrsaiModelToken(_0x42c6fd);
      const _0x1cb5c0 = isGrsaiGptImage2ModelToken(_0x5ada48) ? isGrsaiGptImage2ModelToken(_0x5b1374) : _0x5b1374 === _0x5ada48;
      return renderNodeMenuItem({
        modelId: _0x42c6fd,
        provider: "grsai",
        label: _0x2b0655.title || _0x1493c8.displayName || "GPT image 2",
        description: _0x2b0655.subtitle || _0x1493c8.description || "",
        iconHtml: GRSAI_IMAGE_MENU_ICON_HTML,
        active: _0x1cb5c0
      });
    }
    const _0x28b40a = String(_0x2b0655.family || "").trim();
    const _0x13e8d7 = _0x2b0655.disabled === true;
    const _0x4b420f = _0x30fced === _0x28b40a;
    return renderNodeMenuItem({
      provider: "grsai",
      label: _0x2b0655.title || _0x1493c8.displayName || _0x28b40a,
      description: _0x2b0655.subtitle || "",
      iconHtml: GRSAI_IMAGE_MENU_ICON_HTML,
      active: _0x4b420f,
      disabled: _0x13e8d7,
      credentialModelId: _0x1493c8.modelId || "",
      attrs: {
        "data-nb-family": _0x28b40a || undefined
      }
    });
  }).join("");
}
export function buildRunningHubNanoBananaFamilyMenuHTML(_0x33d9f2, _0x27fde1 = "") {
  const _0x44af8d = _0x33d9f2?.provider === "runninghub" ? _0x33d9f2?.family || "" : "";
  return getImageModelMenuManifests("runninghubModel").map(_0x5c81d4 => {
    const _0x8aba8f = getImageMenuMeta(_0x5c81d4) || {};
    if (_0x8aba8f.role === "directModel") {
      return renderNodeMenuItem({
        modelId: _0x5c81d4.modelId || "",
        provider: _0x5c81d4.provider || "runninghub",
        label: _0x8aba8f.title || _0x5c81d4.displayName || _0x5c81d4.modelId || "",
        description: _0x8aba8f.subtitle || _0x5c81d4.description || "",
        iconHtml: renderImageManifestIconHTML(_0x5c81d4, _0x8aba8f),
        active: String(_0x27fde1 || "") === _0x5c81d4.modelId,
        vip: _0x5c81d4?.vip === true,
        badgeHtml: buildModelProviderProfileBadgesHtml(_0x5c81d4, {
          vip: _0x5c81d4?.vip === true
        })
      });
    }
    const _0x292932 = String(_0x8aba8f.family || "").trim();
    return renderNodeMenuItem({
      provider: "runninghub",
      label: _0x8aba8f.title || _0x5c81d4.displayName || _0x292932,
      description: _0x8aba8f.subtitle || _0x5c81d4.description || "",
      icon: _0x8aba8f.icon || _0x5c81d4.icon || "images/gemini.svg",
      iconAlt: _0x8aba8f.alt || _0x292932,
      active: _0x44af8d === _0x292932,
      credentialModelId: _0x5c81d4.modelId || "",
      badgeHtml: buildModelProviderProfileBadgesHtml(_0x5c81d4, {
        vip: _0x5c81d4?.vip === true
      }),
      attrs: {
        "data-nb-family": _0x292932 || undefined
      }
    });
  }).join("");
}
export function shouldShowNanoBananaModeSelector({
  family: _0x289b75,
  provider = "",
  isModelApiManifest = false
} = {}) {
  if (!isNanoBananaFamily(_0x289b75)) {
    return false;
  }
  if (String(provider || "").trim().toLowerCase() === "runninghub") {
    return true;
  } else {
    return !isModelApiManifest;
  }
}
export function buildNanoBananaModeMenuHTML(_0x2228c5, _0x29c0d0, _0x44a960 = "") {
  if (!isNanoBananaFamily(_0x2228c5)) {
    return "";
  }
  const _0xdc14a8 = getNanoBananaModeOptions(_0x2228c5, _0x44a960);
  return _0xdc14a8.map(_0x1428b3 => {
    const _0x33d785 = _0x1428b3.tooltip ? " title=\"" + escapeHtmlAttr(_0x1428b3.tooltip) + "\" data-tooltip=\"" + escapeHtmlAttr(_0x1428b3.tooltip) + "\"" : "";
    const _0xc015b = _0x1428b3.mode === _0x29c0d0;
    return "<div class=\"floating-menu-item " + (_0xc015b ? "active" : "") + "\" data-nb-mode=\"" + _0x1428b3.mode + "\"" + _0x33d785 + "><span class=\"floating-menu-label\">" + _0x1428b3.label + "</span></div>";
  }).join("");
}
export function buildQwenImageEditModeMenuHTML(_0x47f8ab) {
  const _0x522804 = normalizeQwenImageEditMode(_0x47f8ab);
  const _0x4559e5 = getQwenUiFieldOptions("rhQwenEditMode");
  const _0x5b57aa = _0x4559e5.length ? _0x4559e5 : [{
    value: "qwen2511",
    label: "2511"
  }, {
    value: "qwen2509",
    label: "2509"
  }];
  return _0x5b57aa.map(_0x369ae6 => {
    const _0x17c32a = escapeHtmlAttr(getQwenImageEditModeTooltip(_0x369ae6.value));
    return "<div class=\"floating-menu-item " + (_0x522804 === _0x369ae6.value ? "active" : "") + "\" data-qwen-mode=\"" + _0x369ae6.value + "\" title=\"" + _0x17c32a + "\" data-tooltip=\"" + _0x17c32a + "\"><span class=\"floating-menu-label\">" + _0x369ae6.label + "</span></div>";
  }).join("");
}
export function buildQwenImageEditModelMenuItemHTML(_0x3edb26) {
  return buildManifestModelMenuItemHTML(QWEN_IMAGE_EDIT_MODEL_ID, _0x3edb26, {
    title: t("aigenImage.modelMenu.qwenEdit.title"),
    description: t("aigenImage.modelMenu.qwenEdit.description")
  });
}
export function buildAnimeRealModelMenuItemHTML(_0x566bff) {
  return buildManifestModelMenuItemHTML(ANIME_REAL_MODEL_ID, _0x566bff, {
    title: t("aigenImage.modelMenu.animeReal.title"),
    description: t("aigenImage.modelMenu.animeReal.description")
  });
}
export function buildPersonReplaceV21ModelMenuItemHTML(_0x401298) {
  return buildManifestModelMenuItemHTML(PERSON_REPLACE_V21_MODEL_ID, _0x401298, {
    title: t("aigenImage.modelMenu.personReplaceV21.title"),
    description: t("aigenImage.modelMenu.personReplaceV21.description")
  });
}
export function buildPersonReplaceV3ModelMenuItemHTML(_0x3f0c69) {
  return buildManifestModelMenuItemHTML(PERSON_REPLACE_V3_MODEL_ID, _0x3f0c69, {
    title: t("aigenImage.modelMenu.personReplaceV3.title"),
    description: t("aigenImage.modelMenu.personReplaceV3.description")
  });
}
function buildManifestModelMenuItemHTML(_0x3c77fa, _0x16332a, _0x320c10 = {}) {
  const _0x13edc7 = getModelManifest(_0x3c77fa);
  const _0x310c05 = _0x13edc7?.modelId || _0x3c77fa;
  const _0x5dca39 = _0x13edc7?.provider || "runninghubwf";
  const _0x1685e7 = _0x13edc7?.icon || "images/RH.png";
  const _0x45cfb3 = _0x13edc7?.displayName || _0x320c10.title || _0x310c05;
  const _0x266cbe = _0x13edc7?.description || _0x320c10.description || "";
  const _0x410b73 = _0x13edc7?.vip === true || _0x320c10.vip === true;
  const _0x209b1a = getModelManifest(_0x16332a);
  const _0x58eb51 = _0x16332a === _0x3c77fa || _0x16332a === _0x310c05 || _0x209b1a?.modelId === _0x310c05;
  return renderNodeMenuItem({
    modelId: _0x310c05,
    provider: _0x5dca39,
    label: _0x45cfb3,
    description: _0x266cbe,
    icon: _0x1685e7,
    iconAlt: "runninghub",
    vip: _0x410b73,
    active: _0x58eb51
  }, {
    activeModel: _0x16332a
  });
}
export function buildQwenFirstImageModeControlsHTML(_0x49fcd9) {
  const _0x30a8b8 = normalizeQwenFirstImageMode(_0x49fcd9);
  return getQwenFirstImageModeOptions().map(_0x585e37 => {
    const _0x5eda42 = normalizeQwenFirstImageMode(_0x585e37.value);
    return "<button type=\"button\" class=\"img-rp-quality-item qwen-first-image-mode-opt " + (_0x30a8b8 === _0x5eda42 ? "active" : "") + "\" data-value=\"" + escapeHtmlAttr(_0x5eda42) + "\">" + escapeHtmlAttr(_0x585e37.label) + "</button>";
  }).join("");
}
