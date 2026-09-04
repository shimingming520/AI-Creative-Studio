import { getModelManifest, getModelsByKind, resolveModelProvider } from "../manifests/index.js";
import { t } from "../i18n/index.js";
function getImageMenuMeta(_0x4746db) {
  const _0x1630a2 = _0x4746db?.extensions?.imageMenu;
  if (_0x1630a2 && typeof _0x1630a2 === "object") {
    return _0x1630a2;
  } else {
    return null;
  }
}
function buildManifestImageModelItem(_0x3683c4) {
  const _0x4cdb91 = getImageMenuMeta(_0x3683c4) || {};
  return {
    id: _0x3683c4.modelId,
    name: _0x4cdb91.title || _0x3683c4.displayName || _0x3683c4.modelId,
    description: _0x4cdb91.subtitle || _0x3683c4.description || "",
    icon: _0x4cdb91.icon || _0x3683c4.icon,
    vip: _0x3683c4.vip === true,
    devOnly: _0x3683c4.devOnly === true
  };
}
function getManifestImageModels({
  provider: _0x119db3,
  adapterType: _0x18d401,
  group: _0x4183cb
} = {}) {
  return getModelsByKind("image").filter(_0x374416 => {
    if (_0x119db3 && _0x374416.provider !== _0x119db3) {
      return false;
    }
    if (_0x18d401 && _0x374416.adapterType !== _0x18d401) {
      return false;
    }
    if (_0x4183cb && getImageMenuMeta(_0x374416)?.group !== _0x4183cb) {
      return false;
    }
    return true;
  }).sort((_0x43216d, _0x221a1f) => {
    const _0x14d2ec = getImageMenuMeta(_0x43216d);
    const _0x50c307 = getImageMenuMeta(_0x221a1f);
    return (_0x14d2ec?.order || 0) - (_0x50c307?.order || 0);
  }).map(buildManifestImageModelItem);
}
export const IMAGE_MODELS = {
  grsai: {
    name: "GRSAI",
    icon: "images/grsai.png",
    get description() {
      return t("imageModelConfig.providers.grsai.description");
    },
    models: getManifestImageModels({
      provider: "grsai",
      group: "grsaiModel"
    })
  },
  ppio: {
    get name() {
      return t("imageModelConfig.providers.ppio.name");
    },
    icon: "images/ppio.png",
    get description() {
      return t("imageModelConfig.providers.ppio.description");
    },
    models: getManifestImageModels({
      provider: "ppio"
    })
  },
  apimart: {
    name: "APIMart",
    icon: "AM",
    get description() {
      return t("imageModelConfig.providers.apimart.description");
    },
    isTextIcon: true,
    models: getManifestImageModels({
      provider: "apimart"
    })
  },
  runninghub: {
    name: "RunningHUB",
    icon: "images/RH.png",
    get description() {
      return t("imageModelConfig.providers.runninghub.description");
    },
    models: getManifestImageModels({
      provider: "runninghub",
      adapterType: "modelApi"
    })
  },
  aicanvas: {
    name: "SHUO Canvas",
    icon: "images/favicon.svg",
    get description() {
      return t("imageModelConfig.providers.aicanvas.description");
    },
    devOnly: true,
    get models() {
      const _0x430e79 = t("imageModelConfig.providers.aicanvas.placeholderImageModel");
      return [{
        id: "aicanvas/image-lite",
        name: "SHUO Canvas Image Lite",
        description: _0x430e79,
        icon: "images/favicon.svg"
      }, {
        id: "aicanvas/image-pro",
        name: "SHUO Canvas Image Pro",
        description: _0x430e79,
        icon: "images/favicon.svg"
      }];
    }
  }
};
export function getModelDisplayName(_0x15adde) {
  const _0x5d62b8 = getModelManifest(_0x15adde);
  if (_0x5d62b8?.displayName) {
    return _0x5d62b8.displayName;
  }
  for (const _0x490e89 of Object.values(IMAGE_MODELS)) {
    const _0x134203 = _0x490e89.models.find(_0x1eb466 => _0x1eb466.id === _0x15adde);
    if (_0x134203) {
      return _0x134203.name;
    }
  }
  return _0x15adde;
}
export function getModelProvider(_0x35228f) {
  const _0x149857 = resolveModelProvider(_0x35228f, "", {
    allowProviderHint: false,
    allowPrefixInference: false
  });
  if (_0x149857 === "runninghubwf") {
    return "runninghub";
  }
  if (_0x149857) {
    return _0x149857;
  }
  return Object.entries(IMAGE_MODELS).find(([, _0x3b662f]) => _0x3b662f.models.some(_0x2a9896 => _0x2a9896.id === _0x35228f))?.[0] || null;
}
export function getProviderIconHtml(_0x147eb1, _0x52c15f = 12) {
  const _0x7887d6 = IMAGE_MODELS[_0x147eb1];
  if (!_0x7887d6) {
    return "";
  }
  if (_0x7887d6.isTextIcon) {
    return "<div style=\"width:" + _0x52c15f + "px;height:" + _0x52c15f + "px;border-radius:2px;background:var(--bg-node);color:var(--text-primary);font-size:7px;font-weight:900;display:flex;align-items:center;justify-content:center;transform:scale(0.85);\">" + _0x7887d6.icon + "</div>";
  }
  if (_0x147eb1 === "aicanvas") {
    const _0x4a6d60 = Math.max(Number(_0x52c15f) || 12, 14);
    return "<img src=\"" + _0x7887d6.icon + "\" style=\"width:" + _0x4a6d60 + "px;height:" + _0x4a6d60 + "px;object-fit:contain;border-radius:2px;flex-shrink:0;\" alt=\"" + _0x147eb1 + "\">";
  }
  return "<img src=\"" + _0x7887d6.icon + "\" style=\"width:" + _0x52c15f + "px;height:" + _0x52c15f + "px;object-fit:contain;border-radius:2px;flex-shrink:0;background:var(--white-10);padding:2px;\" alt=\"" + _0x147eb1 + "\">";
}