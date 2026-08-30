import { IMAGE_MODELS, getModelDisplayName, getModelProvider } from "../config/modelConfig.js";
import { positionAnchoredSubmenu } from "../utils/submenuPosition.js";
import { bindToolbarUpMenus, renderToolbarUpMenu } from "./imageToolbarUpMenu.js";
import { NANO_BANANA_FAMILIES, getDefaultModeForNanoBananaFamily, getNanoBananaModeLabel, getNanoBananaModeOptions, getNanoBananaSelectionFromModel, isNanoBananaFamily, resolveNanoBananaModelBySelection } from "./nanoBananaModeRules.js";
import { CONTROL_CAMERA_MODEL_ID, getModelManifest, getModelsByKind } from "../manifests/index.js";
import { t } from "../i18n/index.js";
const IMAGE_FUNCTION_PROVIDER_META = Object.freeze({
  grsai: Object.freeze({
    name: "GRSAI",
    icon: "images/grsai.png",
    get description() {
      return t("imageFunctionMenu.providers.grsai.description");
    }
  }),
  apimart: Object.freeze({
    name: "APIMart",
    icon: "AM",
    get description() {
      return t("imageFunctionMenu.providers.apimart.description");
    },
    isTextIcon: true,
    modelIconStrategy: "provider"
  }),
  runninghub: Object.freeze({
    get name() {
      return t("imageFunctionMenu.providers.runninghub.name");
    },
    icon: "images/RH.png",
    get description() {
      return t("imageFunctionMenu.providers.runninghub.description");
    },
    modelIconStrategy: "provider"
  })
});
const IMAGE_FUNCTION_MENU_PROVIDER_BY_GROUP = Object.freeze({
  grsaiModel: "grsai",
  apimart: "apimart",
  runninghubModel: "runninghub"
});
const DEFAULT_IMAGE_FUNCTION_PROVIDER = "runninghub";
const DEFAULT_FREE_ANGLE_PROVIDER = "runninghubwf";
const DEFAULT_FREE_ANGLE_MODEL = CONTROL_CAMERA_MODEL_ID;
const FREE_ANGLE_ONLY_MODEL_IDS = Object.freeze([CONTROL_CAMERA_MODEL_ID]);
const IMAGE_FUNCTION_ALLOWED_FAMILIES = Object.freeze(new Set([NANO_BANANA_FAMILIES.NANOBANANA_2, NANO_BANANA_FAMILIES.NANOBANANA_PRO, NANO_BANANA_FAMILIES.GPT_IMAGE_2]));
export function isImageFreeAngleOnlyModel(_0x3c90f4) {
  const _0x5e4e2e = String(_0x3c90f4 || "").trim();
  return FREE_ANGLE_ONLY_MODEL_IDS.includes(_0x5e4e2e);
}
const escapeHtmlAttr = _0x1efa98 => String(_0x1efa98 || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeHtmlText = _0x14c1b7 => String(_0x14c1b7 || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const canShowDevOnlyModels = () => typeof window !== "undefined" && window.DEV_MODE === true;
function buildImageFunctionModelFromManifest(_0x492fee) {
  if (!_0x492fee) {
    return null;
  }
  const _0x52b550 = _0x492fee.extensions?.imageMenu || {};
  const _0x44866e = _0x52b550.icon || _0x492fee.icon || "images/RH.png";
  return {
    id: _0x492fee.modelId,
    family: _0x52b550.family || "",
    name: _0x52b550.title || _0x492fee.displayName || _0x492fee.modelId,
    description: _0x52b550.subtitle || _0x492fee.description || "",
    icon: _0x44866e,
    isTextIcon: _0x52b550.isTextIcon === true || !/\.(?:png|svg|jpg|jpeg|webp)$/i.test(String(_0x44866e || ""))
  };
}
function getImageFunctionFamily(_0x24f7d4) {
  return String(_0x24f7d4?.extensions?.imageFunctionMenu?.family || _0x24f7d4?.extensions?.nanoBanana?.family || "").trim();
}
function isAllowedImageFunctionManifest(_0x59c87f) {
  return IMAGE_FUNCTION_ALLOWED_FAMILIES.has(getImageFunctionFamily(_0x59c87f));
}
function isAllowedImageFunctionModel(_0x53054a) {
  return isAllowedImageFunctionManifest(getModelManifest(_0x53054a));
}
function hasManifestModeField(_0x232d2d) {
  const _0x190e99 = getModelManifest(_0x232d2d)?.uiSchema?.fields;
  return Array.isArray(_0x190e99) && _0x190e99.some(_0x1d3c9c => _0x1d3c9c?.id === "mode");
}
function buildImageGenerationNodeCatalog() {
  const _0x57e7fa = {};
  getModelsByKind("image").map(_0x1728b8 => ({
    manifest: _0x1728b8,
    imageMenu: _0x1728b8?.extensions?.imageMenu || null
  })).filter(({
    manifest: _0x3d1718,
    imageMenu: _0x2d0326
  }) => _0x2d0326?.group && isAllowedImageFunctionManifest(_0x3d1718)).sort((_0xfaafb5, _0x568844) => {
    const _0x39cb07 = Number(_0xfaafb5.imageMenu?.order ?? 999);
    const _0x40796e = Number(_0x568844.imageMenu?.order ?? 999);
    return _0x39cb07 - _0x40796e;
  }).forEach(({
    manifest: _0x46d881,
    imageMenu: _0x53bfd8
  }) => {
    const _0x4e241c = IMAGE_FUNCTION_MENU_PROVIDER_BY_GROUP[_0x53bfd8.group] || _0x46d881.provider;
    const _0x49c7b3 = IMAGE_FUNCTION_PROVIDER_META[_0x4e241c];
    if (!_0x49c7b3) {
      return;
    }
    if (!_0x57e7fa[_0x4e241c]) {
      _0x57e7fa[_0x4e241c] = {
        ..._0x49c7b3,
        models: []
      };
    }
    const _0x312add = buildImageFunctionModelFromManifest(_0x46d881);
    if (_0x312add) {
      _0x57e7fa[_0x4e241c].models.push(_0x312add);
    }
  });
  return _0x57e7fa;
}
function buildFreeAngleOnlyProvider() {
  const _0xdc1e3f = FREE_ANGLE_ONLY_MODEL_IDS.map(_0x42f234 => buildImageFunctionModelFromManifest(getModelManifest(_0x42f234))).filter(Boolean);
  return {
    name: t("imageFunctionMenu.providers.runninghubWorkflow.name"),
    icon: "images/RH.png",
    description: t("imageFunctionMenu.providers.runninghubWorkflow.description"),
    models: _0xdc1e3f
  };
}
export function buildImageFreeAngleModelCatalog() {
  const _0x465f71 = buildImageGenerationNodeCatalog();
  const _0x19bdbf = buildFreeAngleOnlyProvider();
  if (_0x19bdbf.models.length > 0) {
    _0x465f71.runninghubwf = _0x19bdbf;
  }
  return _0x465f71;
}
export function getDefaultImageFreeAngleModelState(_0x2c27f0 = buildImageFreeAngleModelCatalog()) {
  const _0x4850ac = _0x2c27f0?.[DEFAULT_FREE_ANGLE_PROVIDER]?.models?.find(_0x790690 => _0x790690?.id === DEFAULT_FREE_ANGLE_MODEL);
  if (_0x4850ac) {
    return {
      provider: DEFAULT_FREE_ANGLE_PROVIDER,
      model: _0x4850ac.id
    };
  }
  return getDefaultImageFunctionModelState(_0x2c27f0);
}
function buildRawImageModelCatalog(_0x108fc4 = IMAGE_MODELS) {
  const _0x3e48e2 = {};
  Object.entries(_0x108fc4 || {}).forEach(([_0x434570, _0x1e22ff]) => {
    if (_0x1e22ff?.devOnly && !canShowDevOnlyModels()) {
      return;
    }
    const _0x379e20 = Array.isArray(_0x1e22ff?.models) ? _0x1e22ff.models : [];
    const _0x234a6a = _0x379e20.filter(_0x2565b0 => {
      if (!_0x2565b0 || typeof _0x2565b0 !== "object") {
        return false;
      }
      return _0x2565b0.disabled !== true;
    });
    if (_0x234a6a.length === 0) {
      return;
    }
    _0x3e48e2[_0x434570] = {
      ..._0x1e22ff,
      models: _0x234a6a
    };
  });
  return _0x3e48e2;
}
export function buildImageFunctionModelCatalog(_0x308f61 = IMAGE_MODELS) {
  if (_0x308f61 === IMAGE_MODELS) {
    return buildImageGenerationNodeCatalog();
  }
  return buildRawImageModelCatalog(_0x308f61);
}
export function findImageFunctionProviderByModel(_0x4a69fe, _0x37ba4c) {
  const _0x1b09b2 = String(_0x37ba4c || "").trim();
  if (!_0x1b09b2) {
    return null;
  }
  for (const [_0x196684, _0x143d0d] of Object.entries(_0x4a69fe || {})) {
    const _0x1aa311 = Array.isArray(_0x143d0d?.models) ? _0x143d0d.models : [];
    if (_0x1aa311.some(_0x369a95 => _0x369a95?.id === _0x1b09b2)) {
      return _0x196684;
    }
  }
  const _0x14934b = getModelProvider(_0x1b09b2);
  if (_0x4a69fe?.[_0x14934b] && isAllowedImageFunctionModel(_0x1b09b2)) {
    return _0x14934b;
  } else {
    return null;
  }
}
export function getDefaultImageFunctionModelState(_0xf547e5 = buildImageFunctionModelCatalog()) {
  const _0x1a593b = _0xf547e5?.[DEFAULT_IMAGE_FUNCTION_PROVIDER]?.models?.find(_0x476444 => _0x476444?.family === "nanobanana-pro")?.id || "";
  const _0x53914a = _0xf547e5?.[DEFAULT_IMAGE_FUNCTION_PROVIDER]?.models?.find(_0x4e94ae => _0x4e94ae?.id === _0x1a593b);
  if (_0x53914a) {
    return {
      provider: DEFAULT_IMAGE_FUNCTION_PROVIDER,
      model: _0x53914a.id
    };
  }
  const _0xcc4fde = Object.keys(_0xf547e5 || {});
  const _0x498a4b = _0xcc4fde[0] || Object.keys(IMAGE_MODELS)[0] || "";
  const _0x2d4ddc = _0xf547e5?.[_0x498a4b]?.models?.[0];
  return {
    provider: _0x498a4b || null,
    model: _0x2d4ddc?.id || null
  };
}
export function getImageFunctionModelDisplayName(_0x1642cc, _0x395c94 = buildImageFunctionModelCatalog()) {
  const _0x57f519 = String(_0x1642cc || "").trim();
  if (!_0x57f519) {
    return "";
  }
  for (const _0x5a39b3 of Object.values(_0x395c94 || {})) {
    const _0x44f9a6 = Array.isArray(_0x5a39b3?.models) ? _0x5a39b3.models : [];
    const _0x273cb9 = _0x44f9a6.find(_0x48740c => _0x48740c?.id === _0x57f519);
    if (_0x273cb9) {
      return _0x273cb9.name || _0x273cb9.id || _0x57f519;
    }
  }
  return getModelDisplayName(_0x57f519);
}
export function getImageFunctionNanoSelection(_0x5bf8a8, _0x225762 = "", _0xedfe4f = "2K") {
  const _0xef5a93 = getNanoBananaSelectionFromModel(_0x5bf8a8, _0xedfe4f, _0x225762);
  if (!_0xef5a93 || !isNanoBananaFamily(_0xef5a93.family)) {
    return null;
  }
  if (_0xef5a93.family === "gpt-image-2") {
    return null;
  }
  const _0x475f7a = String(_0x225762 || "").trim().toLowerCase();
  const _0x3693b1 = String(_0xef5a93.provider || "").trim().toLowerCase();
  if (_0x475f7a && _0x3693b1 !== _0x475f7a) {
    return null;
  }
  if (_0x3693b1 === "grsai" && !hasManifestModeField(_0xef5a93.rawModel)) {
    return null;
  }
  return _0xef5a93;
}
export function resolveImageFunctionModelFromMenuItem({
  model: _0x436a92,
  provider: _0x294c5b,
  family: _0x89d2a,
  imageSize = "2K"
} = {}) {
  const _0x4e13a7 = String(_0x294c5b || "").trim();
  const _0x2e621a = String(_0x89d2a || "").trim();
  if (_0x2e621a && isNanoBananaFamily(_0x2e621a)) {
    const _0x7119a5 = getDefaultModeForNanoBananaFamily(_0x2e621a, _0x4e13a7);
    return {
      model: resolveNanoBananaModelBySelection({
        family: _0x2e621a,
        mode: _0x7119a5,
        imageSize: imageSize,
        provider: _0x4e13a7
      }),
      provider: _0x4e13a7,
      family: _0x2e621a,
      mode: _0x7119a5
    };
  }
  return {
    model: String(_0x436a92 || "").trim(),
    provider: _0x4e13a7,
    family: "",
    mode: ""
  };
}
export function resolveImageFunctionModelByMode({
  model: _0x3c7344,
  provider: _0x520405,
  imageSize = "2K",
  mode: _0x2d029d
} = {}) {
  const _0x554686 = getImageFunctionNanoSelection(_0x3c7344, _0x520405, imageSize);
  if (!_0x554686) {
    return null;
  }
  const _0x427337 = String(_0x2d029d || "").trim();
  if (!_0x427337) {
    return null;
  }
  return {
    model: resolveNanoBananaModelBySelection({
      family: _0x554686.family,
      mode: _0x427337,
      imageSize: imageSize,
      provider: _0x554686.provider
    }),
    provider: _0x554686.provider,
    family: _0x554686.family,
    mode: _0x427337
  };
}
export function buildImageFunctionModeMenuHTML({
  model = "",
  provider = "",
  imageSize = "2K"
} = {}) {
  const _0xf1e655 = getImageFunctionNanoSelection(model, provider, imageSize);
  if (!_0xf1e655) {
    return "";
  }
  return renderToolbarUpMenu({
    fieldId: "mode",
    value: _0xf1e655.mode,
    options: getNanoBananaModeOptions(_0xf1e655.family, _0xf1e655.provider).map(_0x34c8e6 => ({
      value: _0x34c8e6.mode,
      label: _0x34c8e6.label,
      tooltip: _0x34c8e6.tooltip
    })),
    itemClass: "",
    itemsOnly: true,
    itemValueAttrs: ["data-nb-mode"]
  });
}
export function getImageFunctionModeLabel({
  model = "",
  provider = "",
  imageSize = "2K"
} = {}) {
  const _0x43a41e = getImageFunctionNanoSelection(model, provider, imageSize);
  if (!_0x43a41e) {
    return t("imageFunctionMenu.modes.normal");
  }
  return getNanoBananaModeLabel(_0x43a41e.family, _0x43a41e.mode, _0x43a41e.provider);
}
export function isImageFunctionModeVisible({
  model = "",
  provider = "",
  imageSize = "2K"
} = {}) {
  return !!getImageFunctionNanoSelection(model, provider, imageSize);
}
export function buildImageFunctionModeControlHTML({
  model = "",
  provider = "",
  imageSize = "2K",
  wrapClass = "v2-expand-wrap",
  buttonClass = "v2-expand-toolbar-btn"
} = {}) {
  const _0x447282 = isImageFunctionModeVisible({
    model: model,
    provider: provider,
    imageSize: imageSize
  });
  const _0x4343af = getImageFunctionModeLabel({
    model: model,
    provider: provider,
    imageSize: imageSize
  });
  const _0x14fc3c = getImageFunctionNanoSelection(model, provider, imageSize);
  return "\n    " + renderToolbarUpMenu({
    fieldId: "mode",
    value: _0x14fc3c?.mode || "",
    options: _0x14fc3c ? getNanoBananaModeOptions(_0x14fc3c.family, _0x14fc3c.provider).map(_0x9623c7 => ({
      value: _0x9623c7.mode,
      label: _0x9623c7.label,
      tooltip: _0x9623c7.tooltip
    })) : [],
    wrapClass: wrapClass + " image-function-mode-wrap " + (_0x447282 ? "" : "is-hidden"),
    buttonClass: buttonClass + " image-function-mode-toggle",
    labelClass: "image-function-mode-label",
    menuClass: "nb-mode-menu image-function-mode-menu",
    openClass: "show",
    selectedLabel: _0x4343af,
    itemClass: "",
    itemValueAttrs: ["data-nb-mode"]
  });
}
export function syncImageFunctionModeControl({
  root: _0x243abb,
  model: _0x555a44,
  provider = "",
  imageSize = "2K"
} = {}) {
  if (!_0x243abb) {
    return null;
  }
  const _0x183434 = _0x243abb.querySelector(".image-function-mode-wrap");
  const _0x7196b2 = _0x243abb.querySelector(".image-function-mode-label");
  const _0x556f5b = _0x243abb.querySelector(".image-function-mode-menu");
  const _0x5af0d9 = isImageFunctionModeVisible({
    model: _0x555a44,
    provider: provider,
    imageSize: imageSize
  });
  _0x183434?.classList.toggle("is-hidden", !_0x5af0d9);
  if (_0x7196b2) {
    _0x7196b2.textContent = getImageFunctionModeLabel({
      model: _0x555a44,
      provider: provider,
      imageSize: imageSize
    });
  }
  if (_0x556f5b) {
    _0x556f5b.innerHTML = buildImageFunctionModeMenuHTML({
      model: _0x555a44,
      provider: provider,
      imageSize: imageSize
    });
    if (!_0x5af0d9) {
      _0x556f5b.classList.remove("show");
    }
  }
  return getImageFunctionNanoSelection(_0x555a44, provider, imageSize);
}
export function bindImageFunctionModeMenu({
  modeMenu: _0x284721,
  onSelect: _0x43e76a
} = {}) {
  if (!_0x284721 || typeof _0x43e76a !== "function") {
    return () => {};
  }
  return bindToolbarUpMenus(_0x284721, {
    onSelect: ({
      value: _0x208b34,
      item: _0x6dd78a
    }) => {
      const _0x591cf2 = String(_0x208b34 || _0x6dd78a?.dataset?.nbMode || "").trim();
      if (!_0x591cf2) {
        return;
      }
      _0x43e76a({
        mode: _0x591cf2,
        item: _0x6dd78a
      });
    }
  });
}
function getProviderIconHtml(_0x2ca3d4, _0xfdb30b, _0x18f3b7 = "") {
  if (_0x2ca3d4?.isTextIcon) {
    return "<span class=\"image-function-model-icon image-function-model-icon-text " + escapeHtmlAttr(_0x18f3b7) + "\">" + escapeHtmlText(_0x2ca3d4.icon) + "</span>";
  }
  const _0x14c444 = _0x2ca3d4?.icon || "";
  if (!_0x14c444) {
    return "";
  }
  return "<img class=\"image-function-model-icon " + escapeHtmlAttr(_0x18f3b7) + "\" src=\"" + escapeHtmlAttr(_0x14c444) + "\" alt=\"" + escapeHtmlAttr(_0xfdb30b) + "\">";
}
function getModelIconHtml(_0x5673c4, _0xd905b6, _0x2e29c8, _0x4f61d2 = "") {
  if (_0xd905b6?.modelIconStrategy === "provider") {
    return getProviderIconHtml(_0xd905b6, _0x2e29c8, _0x4f61d2);
  }
  const _0x49638c = _0x5673c4?.icon || _0xd905b6?.icon || "";
  if (_0x5673c4?.isTextIcon) {
    return "<span class=\"image-function-model-icon image-function-model-icon-text " + escapeHtmlAttr(_0x4f61d2) + "\">" + escapeHtmlText(_0x5673c4.icon || _0x5673c4.name || _0xd905b6?.icon || "") + "</span>";
  }
  if (_0xd905b6?.isTextIcon && !_0x49638c) {
    return "<span class=\"image-function-model-icon image-function-model-icon-text " + escapeHtmlAttr(_0x4f61d2) + "\">" + escapeHtmlText(_0xd905b6.icon) + "</span>";
  }
  if (!_0x49638c) {
    return "";
  }
  return "<img class=\"image-function-model-icon " + escapeHtmlAttr(_0x4f61d2) + "\" src=\"" + escapeHtmlAttr(_0x49638c) + "\" alt=\"" + escapeHtmlAttr(_0x2e29c8) + "\">";
}
export function getImageFunctionModelTriggerIconHTML(_0x25f71f, _0x57d144 = "", _0x399978 = buildImageFunctionModelCatalog()) {
  const _0x1b60bf = _0x399978;
  const _0x3b6db5 = _0x57d144 || findImageFunctionProviderByModel(_0x1b60bf, _0x25f71f) || "grsai";
  const _0x22b954 = _0x1b60bf[_0x3b6db5] || _0x1b60bf.grsai;
  return getProviderIconHtml(_0x22b954, _0x3b6db5, "image-function-model-trigger-icon");
}
export function buildImageFunctionModelMenuHTML({
  activeModel = "",
  activeProvider = "",
  modelCatalog = buildImageFunctionModelCatalog()
} = {}) {
  const _0x785a81 = String(activeModel || "").trim();
  const _0x282a4f = String(activeProvider || "").trim();
  return Object.entries(modelCatalog || {}).map(([_0x244feb, _0x3d3a17]) => {
    const _0x2ce3ec = _0x3d3a17?.devOnly === true;
    if (_0x2ce3ec) {
      return "";
    }
    const _0x28f3fb = _0x3d3a17?.disabled === true;
    const _0x40d8d8 = getProviderIconHtml(_0x3d3a17, _0x244feb);
    const _0x3cd6f3 = (_0x3d3a17.models || []).map(_0x547492 => {
      const _0x40111b = _0x28f3fb || _0x547492?.disabled === true;
      const _0x5e4002 = _0x785a81 === _0x547492.id || _0x547492.family && getImageFunctionNanoSelection(_0x785a81, _0x244feb)?.family === _0x547492.family || !_0x785a81 && _0x282a4f && _0x282a4f === _0x244feb;
      return "\n            <div class=\"floating-menu-item " + (_0x5e4002 ? "active" : "") + "\" data-value=\"" + escapeHtmlAttr(_0x547492.id) + "\" data-provider=\"" + escapeHtmlAttr(_0x244feb) + "\" " + (_0x547492.family ? "data-image-function-family=\"" + escapeHtmlAttr(_0x547492.family) + "\"" : "") + " " + (_0x40111b ? "data-disabled=\"true\"" : "") + ">\n              " + getModelIconHtml(_0x547492, _0x3d3a17, _0x244feb) + "\n              <div class=\"fmi-content\">\n                <div class=\"fmi-title\">" + escapeHtmlText(_0x547492.name || _0x547492.id) + "</div>\n                <div class=\"fmi-sub\">" + escapeHtmlText(_0x547492.description || _0x3d3a17.description || "") + "</div>\n              </div>\n              " + (_0x40111b ? "<span class=\"floating-menu-badge floating-menu-badge-danger\">不可用</span>" : "") + "\n            </div>";
    }).join("");
    return "\n        <div class=\"" + escapeHtmlAttr(_0x244feb) + "-group-header floating-menu-item\" data-image-function-provider=\"" + escapeHtmlAttr(_0x244feb) + "\" data-" + escapeHtmlAttr(_0x244feb) + "-toggle>\n          " + _0x40d8d8 + "\n          <div class=\"fmi-content\">\n            <div class=\"fmi-title\">" + escapeHtmlText(_0x3d3a17.name || _0x244feb) + "</div>\n            <div class=\"fmi-sub\">" + escapeHtmlText(_0x3d3a17.description || "") + "</div>\n          </div>\n          " + (_0x28f3fb ? "<span class=\"floating-menu-badge floating-menu-badge-danger floating-menu-badge-inline\">不可用</span>" : "") + "\n          <svg class=\"image-function-model-chevron\" width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" aria-hidden=\"true\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>\n        </div>\n        <div class=\"" + escapeHtmlAttr(_0x244feb) + "-submenu image-function-model-submenu\">\n          " + _0x3cd6f3 + "\n        </div>";
  }).join("");
}
export function syncImageFunctionModelMenuActive({
  modelMenu: _0x28d30f,
  model: _0x2b5a45,
  provider = ""
} = {}) {
  if (!_0x28d30f) {
    return;
  }
  const _0x1d3b0c = String(_0x2b5a45 || "").trim();
  const _0x216f51 = String(provider || "").trim();
  const _0x46d822 = getImageFunctionNanoSelection(_0x1d3b0c, _0x216f51);
  _0x28d30f.querySelectorAll(".floating-menu-item").forEach(_0x7c36bd => {
    if (!_0x7c36bd.dataset.value) {
      _0x7c36bd.classList.remove("active");
      return;
    }
    const _0x1c5ae4 = String(_0x7c36bd.dataset.imageFunctionFamily || "").trim();
    const _0x50cceb = _0x7c36bd.dataset.value === _0x1d3b0c || !!_0x1c5ae4 && _0x46d822?.provider === _0x7c36bd.dataset.provider && _0x46d822?.family === _0x1c5ae4 || !_0x1d3b0c && _0x216f51 && _0x7c36bd.dataset.provider === _0x216f51;
    _0x7c36bd.classList.toggle("active", _0x50cceb);
  });
}
export function closeImageFunctionModelSubmenus(_0xff14b) {
  _0xff14b?.querySelectorAll(".image-function-model-submenu").forEach(_0x5135d6 => {
    _0x5135d6.style.display = "none";
  });
}
export function bindImageFunctionModelMenu({
  modelMenu: _0x536912,
  onSelect: _0x5a1f1f,
  closeMenu: _0x5131e1,
  onOpenSubmenu: _0x4bb220
} = {}) {
  if (!_0x536912 || typeof _0x5a1f1f !== "function") {
    return () => {};
  }
  const _0x12a52e = [];
  let _0x591317 = 0;
  const _0x2da040 = () => {
    if (_0x591317) {
      clearTimeout(_0x591317);
    }
    _0x591317 = 0;
  };
  const _0x449884 = (_0x2b16ca, _0x12334a = 120) => {
    _0x2da040();
    _0x591317 = setTimeout(() => {
      _0x2b16ca.style.display = "none";
      _0x591317 = 0;
    }, _0x12334a);
  };
  _0x536912.querySelectorAll("[data-image-function-provider]").forEach(_0x5f0fd1 => {
    const _0x28e2e9 = _0x5f0fd1.dataset.imageFunctionProvider;
    const _0x2db2fb = _0x536912.querySelector("." + _0x28e2e9 + "-submenu");
    if (!_0x2db2fb) {
      return;
    }
    const _0x2738d8 = () => {
      _0x2da040();
      closeImageFunctionModelSubmenus(_0x536912);
      _0x2db2fb.style.display = "flex";
      const _0x228e89 = _0x5f0fd1.getBoundingClientRect?.();
      const _0x434196 = _0x536912.getBoundingClientRect?.();
      if (_0x228e89 && _0x434196) {
        positionAnchoredSubmenu({
          submenu: _0x2db2fb,
          anchorRect: _0x228e89,
          horizontalAnchorRect: _0x434196,
          containerRect: _0x434196,
          preferredSide: "right",
          position: "absolute"
        });
      }
      _0x4bb220?.({
        header: _0x5f0fd1,
        submenu: _0x2db2fb,
        providerKey: _0x28e2e9
      });
    };
    const _0x3c5de4 = () => _0x449884(_0x2db2fb);
    _0x5f0fd1.addEventListener("mouseenter", _0x2738d8);
    _0x5f0fd1.addEventListener("mouseleave", _0x3c5de4);
    _0x2db2fb.addEventListener("mouseenter", _0x2738d8);
    _0x2db2fb.addEventListener("mouseleave", _0x3c5de4);
    _0x12a52e.push(() => {
      _0x5f0fd1.removeEventListener("mouseenter", _0x2738d8);
      _0x5f0fd1.removeEventListener("mouseleave", _0x3c5de4);
      _0x2db2fb.removeEventListener("mouseenter", _0x2738d8);
      _0x2db2fb.removeEventListener("mouseleave", _0x3c5de4);
    });
  });
  const _0x3fd247 = _0x4037e5 => {
    const _0x5e14ad = _0x4037e5.target.closest(".floating-menu-item[data-value]");
    if (!_0x5e14ad || !_0x536912.contains(_0x5e14ad)) {
      return;
    }
    _0x4037e5.stopPropagation();
    if (_0x5e14ad.dataset.disabled === "true") {
      return;
    }
    const _0x1dc32e = String(_0x5e14ad.dataset.value || "").trim();
    const _0x1d3ccb = String(_0x5e14ad.dataset.provider || getModelProvider(_0x1dc32e) || "").trim();
    const _0x4e26f1 = resolveImageFunctionModelFromMenuItem({
      model: _0x1dc32e,
      provider: _0x1d3ccb,
      family: _0x5e14ad.dataset.imageFunctionFamily
    });
    if (!_0x4e26f1.model || !_0x4e26f1.provider) {
      return;
    }
    _0x5a1f1f({
      ..._0x4e26f1,
      item: _0x5e14ad
    });
    syncImageFunctionModelMenuActive({
      modelMenu: _0x536912,
      model: _0x4e26f1.model,
      provider: _0x4e26f1.provider
    });
    closeImageFunctionModelSubmenus(_0x536912);
    _0x5131e1?.();
  };
  _0x536912.addEventListener("click", _0x3fd247);
  _0x12a52e.push(() => _0x536912.removeEventListener("click", _0x3fd247));
  return () => {
    _0x2da040();
    _0x12a52e.forEach(_0x1fe9b9 => _0x1fe9b9());
  };
}
export { getModelDisplayName };