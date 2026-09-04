import { getModelManifest, getModelsByKind } from "../../manifests/index.js";
import { APIMART_DREAMINA_VIDEO_DEFAULT_MODEL, resolveDreaminaStyleVideoProvider, isApimartDreaminaVideoModel } from "../../modules/dreaminaVideoModelHelper.js";
import { renderNodeMenuItem } from "../shared/nodeModelMenu.js";
import { renderComfyUiCloudWorkflowLogoHtml, renderComfyUiLocalWorkflowLogoHtml, renderComfyUiWorkflowLogoHtmlFromIconKind } from "../shared/customAiAppLogo.js";
import { translateManifestText } from "../../i18n/manifestText.js";
import { buildModelProviderProfileBadgesHtml } from "../shared/modelProviderProfileControl.js";
export const RH_VIDEO_RESOLUTION_OPTIONS = Object.freeze([832, 1024, 1280, 1440, 1600, 1760, 1920]);
const RH_STANDARD_FPS_OPTIONS = Object.freeze([16, 24]);
const RH_V54_FPS_OPTIONS = Object.freeze([16, 24, 30]);
const RH_MIN_VIDEO_RESOLUTION = 832;
export function escapeHtml(_0x13a3b4) {
  return String(_0x13a3b4 || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function isAllowedRunningHubWorkflowModel(_0xe7ce78, _0x1a7797 = []) {
  const _0x4a533b = (Array.isArray(_0x1a7797) ? _0x1a7797 : []).map(_0x432199 => String(_0x432199 || "").trim()).filter(Boolean);
  return !_0x4a533b.length || _0x4a533b.includes(String(_0xe7ce78 || "").trim());
}
export function buildRunningHubVideoWorkflowMenuItems(_0xf47385, {
  allowedModelIds = []
} = {}) {
  const _0x342337 = getModelsByKind("video").filter(_0xf3fd4 => _0xf3fd4?.provider === "runninghubwf" && _0xf3fd4?.adapterType === "workflow" && _0xf3fd4?.extensions?.rhAiApp === undefined && isAllowedRunningHubWorkflowModel(_0xf3fd4?.modelId, allowedModelIds) && (!_0xf3fd4?.uiPlacement?.includes("toolbar") || !!_0xf3fd4?.uiPlacement?.includes("modelMenu")));
  return _0x342337.map(_0x2afe63 => {
    return renderNodeMenuItem({
      modelId: _0x2afe63.modelId,
      provider: _0x2afe63.provider || "runninghubwf",
      label: _0x2afe63.displayName,
      description: _0x2afe63.description || "",
      icon: _0x2afe63.icon || "images/RH.png",
      iconAlt: "runninghub",
      vip: _0x2afe63.vip === true
    }, {
      activeModel: _0xf47385
    });
  }).join("");
}
export function buildRhAiAppVideoMenuItems(_0x244acb, {
  allowedModelIds = []
} = {}) {
  const _0x46ba26 = getModelsByKind("video").filter(_0x4a0d98 => _0x4a0d98?.provider === "runninghubwf" && _0x4a0d98?.adapterType === "workflow" && _0x4a0d98?.extensions?.rhAiApp !== undefined && String(_0x4a0d98?.extensions?.rhAiApp?.appKey || "").trim() && isAllowedRunningHubWorkflowModel(_0x4a0d98?.modelId, allowedModelIds) && (!_0x4a0d98?.uiPlacement?.includes("toolbar") || !!_0x4a0d98?.uiPlacement?.includes("modelMenu"))).sort((_0x5eb3da, _0x95105) => Number(getManifestVideoMenu(_0x5eb3da)?.order || 0) - Number(getManifestVideoMenu(_0x95105)?.order || 0));
  return _0x46ba26.map(_0x2ecee0 => {
    const _0xa8e236 = getManifestVideoMenu(_0x2ecee0);
    return renderNodeMenuItem({
      modelId: _0x2ecee0.modelId,
      provider: _0x2ecee0.provider || "runninghubwf",
      label: _0xa8e236?.label || _0x2ecee0.displayName,
      description: _0xa8e236?.subtitle || _0x2ecee0.description || "",
      icon: _0x2ecee0.icon || "images/RH.png",
      iconAlt: "runninghub",
      vip: _0x2ecee0.vip === true
    }, {
      activeModel: _0x244acb
    });
  }).join("");
}
export function buildRunningHubVideoModelApiMenuItems(_0x4dcb84) {
  const _0x3e7af6 = getModelsByKind("video").filter(_0x7cca20 => {
    if (_0x7cca20?.provider !== "runninghub") {
      return false;
    }
    if (_0x7cca20?.adapterType !== "modelApi") {
      return false;
    }
    if (_0x7cca20?.uiPlacement?.includes("toolbar") && !_0x7cca20?.uiPlacement?.includes("modelMenu")) {
      return false;
    }
    return getManifestVideoMenu(_0x7cca20)?.role === "runninghubModel";
  }).sort((_0x780315, _0x11722e) => Number(getManifestVideoMenu(_0x780315)?.order || 0) - Number(getManifestVideoMenu(_0x11722e)?.order || 0));
  return _0x3e7af6.map(_0x2c0824 => renderNodeMenuItem({
    modelId: _0x2c0824.modelId,
    provider: _0x2c0824.provider || "runninghub",
    label: getManifestVideoMenu(_0x2c0824)?.label || _0x2c0824.displayName,
    description: getManifestVideoMenu(_0x2c0824)?.subtitle || _0x2c0824.description || "",
    icon: _0x2c0824.icon || "images/RH.png",
    iconAlt: "runninghub",
    vip: _0x2c0824.vip === true,
    badgeHtml: buildModelProviderProfileBadgesHtml(_0x2c0824, {
      vip: _0x2c0824.vip === true
    })
  }, {
    activeModel: _0x4dcb84
  })).join("");
}
export function getDefaultRunningHubVideoWorkflowModelId() {
  return getModelsByKind("video").find(_0x46af37 => _0x46af37?.provider === "runninghubwf" && _0x46af37?.adapterType === "workflow" && (!_0x46af37?.uiPlacement?.includes("toolbar") || !!_0x46af37?.uiPlacement?.includes("modelMenu")))?.modelId || "";
}
export function buildApimartVideoLogoHTML(_0x183e21 = 20) {
  const _0x293e75 = Number(_0x183e21) || 20;
  const _0x1d2ee8 = _0x293e75 <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<div class=\"" + _0x1d2ee8 + " node-menu-icon-badge node-menu-icon-apimart\">AM</div>";
}
export function buildMinimaxVideoLogoHTML(_0x2c61b7 = 20) {
  const _0x5ef211 = Number(_0x2c61b7) || 20;
  const _0x4b33ae = _0x5ef211 <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<img src=\"images/minimax-logo.avif\" class=\"" + _0x4b33ae + "\" alt=\"MiniMAX\">";
}
export function buildAgnesVideoLogoHTML(_0x15abdd = 20) {
  const _0x2a4e22 = Number(_0x15abdd) || 20;
  const _0x19d46d = _0x2a4e22 <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<div class=\"" + _0x19d46d + " node-menu-icon-badge node-menu-icon-badge-dark\">AG</div>";
}
export function buildBinghuoVideoLogoHTML(_0x30b8c9 = 20) {
  const _0x4f5c6f = Number(_0x30b8c9) || 20;
  const _0x3a3e7b = _0x4f5c6f <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<div class=\"" + _0x3a3e7b + " node-menu-icon-badge\">BH</div>";
}
export function buildDreaminaVideoLogoHTML(_0x5c4966 = 20) {
  const _0x7f0c7f = Number(_0x5c4966) || 20;
  if (_0x7f0c7f <= 12) {
    return "<img src=\"images/jimeng.png\" class=\"image-model-trigger-icon image-model-trigger-icon-dreamina\" alt=\"dreamina\">";
  }
  return "<img src=\"images/jimeng.png\" class=\"node-menu-icon\" alt=\"dreamina\">";
}
export function buildVolcengineVideoLogoHTML(_0xff8f7b = 20) {
  const _0x596af9 = Number(_0xff8f7b) || 20;
  const _0x799137 = _0x596af9 <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<img src=\"images/volcengine.svg\" class=\"" + _0x799137 + "\" alt=\"volcengine\">";
}
function getManifestVideoMenu(_0x37f21d) {
  return _0x37f21d?.extensions?.videoMenu || null;
}
function getCustomProviderMeta(_0x2460a4) {
  const _0x3c640b = _0x2460a4?.extensions?.customProvider;
  if (_0x3c640b && typeof _0x3c640b === "object") {
    return _0x3c640b;
  } else {
    return null;
  }
}
export function buildCustomProviderVideoLogoHTML(_0x4a2786 = {}, _0x28d561 = 20) {
  const _0x46fa97 = _0x4a2786?.extensions ? getCustomProviderMeta(_0x4a2786) : _0x4a2786;
  const _0x4dac50 = String(_0x46fa97?.badge || "CP").trim().slice(0, 2) || "CP";
  const _0x3b0e20 = Number(_0x28d561) || 20;
  const _0x5c5227 = _0x3b0e20 <= 12 ? "node-menu-icon-small" : "node-menu-icon";
  return "<div class=\"" + _0x5c5227 + " node-menu-icon-badge\">" + escapeHtml(_0x4dac50) + "</div>";
}
function getComfyUiVideoWorkflowLogoClassName(_0x2205ea = 20) {
  const _0xe5451c = Number(_0x2205ea) || 20;
  if (_0xe5451c <= 12) {
    return "node-menu-icon-small";
  } else {
    return "node-menu-icon";
  }
}
export function buildComfyUiCloudVideoLogoHTML(_0x5a0cb8 = 20) {
  return renderComfyUiCloudWorkflowLogoHtml({
    className: getComfyUiVideoWorkflowLogoClassName(_0x5a0cb8)
  });
}
export function buildComfyUiLocalVideoLogoHTML(_0x2c509e = 20) {
  return renderComfyUiLocalWorkflowLogoHtml({
    className: getComfyUiVideoWorkflowLogoClassName(_0x2c509e)
  });
}
export function getComfyUiVideoWorkflowIconHtml(_0x2fe4e2 = {}, _0x34356f = 20) {
  const _0x2d14d8 = String(_0x2fe4e2?.iconKind || "").trim();
  return renderComfyUiWorkflowLogoHtmlFromIconKind(_0x2d14d8, {
    className: getComfyUiVideoWorkflowLogoClassName(_0x34356f)
  });
}
function buildComfyUiVideoWorkflowMenuItems(_0xe7073c, _0x47485b) {
  const _0x4b2ac7 = String(_0x47485b || "").trim();
  return getModelsByKind("video").filter(_0x198168 => {
    const _0x20c988 = getManifestVideoMenu(_0x198168);
    return _0x198168?.provider === "comfyui" && _0x198168?.adapterType === "workflow" && String(_0x198168?.extensions?.comfyUiWorkflow?.appKey || "").trim() && _0x20c988?.group === _0x4b2ac7 && (!_0x198168?.uiPlacement?.includes("toolbar") || !!_0x198168?.uiPlacement?.includes("modelMenu"));
  }).sort((_0x253393, _0x460869) => Number(getManifestVideoMenu(_0x253393)?.order || 0) - Number(getManifestVideoMenu(_0x460869)?.order || 0)).map(_0x572dd2 => {
    const _0x320a57 = getManifestVideoMenu(_0x572dd2);
    return renderNodeMenuItem({
      modelId: _0x572dd2.modelId,
      provider: _0x572dd2.provider || "comfyui",
      label: _0x320a57?.label || _0x572dd2.displayName,
      description: _0x320a57?.subtitle || _0x572dd2.description || "",
      iconHtml: getComfyUiVideoWorkflowIconHtml(_0x320a57),
      vip: _0x572dd2.vip === true
    }, {
      activeModel: _0xe7073c
    });
  }).join("");
}
export function buildComfyUiCloudVideoWorkflowMenuItems(_0x39d984) {
  return buildComfyUiVideoWorkflowMenuItems(_0x39d984, "comfyUiCloudWorkflow");
}
export function buildComfyUiLocalVideoWorkflowMenuItems(_0x419644) {
  return buildComfyUiVideoWorkflowMenuItems(_0x419644, "comfyUiLocalWorkflow");
}
export function buildComfyUiVideoWorkflowMenuGroups(_0x31ca3d) {
  const _0xd628b1 = buildComfyUiCloudVideoWorkflowMenuItems(_0x31ca3d);
  const _0x3f6006 = buildComfyUiLocalVideoWorkflowMenuItems(_0x31ca3d);
  return [...(_0xd628b1 ? [{
    id: "comfyui-cloud-workflow",
    headerClass: "comfyui-cloud-workflow-group-header",
    submenuClass: "comfyui-cloud-workflow-submenu",
    toggleAttr: "data-comfyui-cloud-workflow-toggle",
    label: "云端工作流",
    subtitle: "保存的 ComfyUI 云端工作流",
    iconHtml: buildComfyUiCloudVideoLogoHTML(),
    itemsHtml: _0xd628b1
  }] : []), ...(_0x3f6006 ? [{
    id: "comfyui-local-workflow",
    headerClass: "comfyui-local-workflow-group-header",
    submenuClass: "comfyui-local-workflow-submenu",
    toggleAttr: "data-comfyui-local-workflow-toggle",
    label: "本地工作流",
    subtitle: "保存的 ComfyUI 本地工作流",
    iconHtml: buildComfyUiLocalVideoLogoHTML(),
    itemsHtml: _0x3f6006
  }] : [])];
}
export function buildCustomProviderVideoMenuGroups(_0x482031) {
  const _0x59d280 = new Map();
  getModelsByKind("video").forEach(_0x9f6636 => {
    const _0x137033 = getManifestVideoMenu(_0x9f6636);
    const _0x3816fd = getCustomProviderMeta(_0x9f6636);
    if (!_0x137033 || !_0x3816fd) {
      return;
    }
    if (_0x137033.role && _0x137033.role !== "customProviderModel") {
      return;
    }
    const _0x186ac9 = String(_0x9f6636?.provider || _0x137033.group || "").trim();
    if (!_0x186ac9) {
      return;
    }
    if (!_0x59d280.has(_0x186ac9)) {
      _0x59d280.set(_0x186ac9, {
        providerId: _0x186ac9,
        displayName: _0x3816fd.displayName || _0x186ac9,
        subtitle: _0x137033.subtitle || "Custom provider",
        badge: _0x3816fd.badge || _0x137033.badge || "CP",
        items: []
      });
    }
    _0x59d280.get(_0x186ac9).items.push(_0x9f6636);
  });
  return Array.from(_0x59d280.values()).map(_0x310977 => {
    const _0x5d93bd = _0x310977.providerId.replace(/[^A-Za-z0-9_-]/g, "-");
    const _0x410937 = {
      badge: _0x310977.badge
    };
    return {
      id: "custom-provider-video-" + _0x5d93bd,
      headerClass: "custom-provider-video-group-header custom-provider-video-group-" + _0x5d93bd,
      submenuClass: "custom-provider-video-submenu-" + _0x5d93bd,
      toggleAttr: "data-custom-provider-video-toggle",
      label: _0x310977.displayName,
      subtitle: _0x310977.subtitle,
      iconHtml: buildCustomProviderVideoLogoHTML(_0x410937),
      itemsHtml: _0x310977.items.sort((_0x16b38c, _0x403ed3) => Number(getManifestVideoMenu(_0x16b38c)?.order || 0) - Number(getManifestVideoMenu(_0x403ed3)?.order || 0)).map(_0x1f3b27 => {
        const _0x4a6b90 = getManifestVideoMenu(_0x1f3b27);
        return renderNodeMenuItem({
          modelId: _0x1f3b27.modelId,
          provider: _0x1f3b27.provider,
          label: _0x4a6b90?.label || _0x1f3b27.displayName,
          description: _0x4a6b90?.subtitle || _0x1f3b27.description || "",
          iconHtml: buildCustomProviderVideoLogoHTML(_0x1f3b27),
          vip: _0x1f3b27.vip === true
        }, {
          activeModel: _0x482031
        });
      }).join("")
    };
  });
}
function getManifestDreaminaStyleVideo(_0x4bb7a2) {
  return _0x4bb7a2?.extensions?.dreaminaStyleVideo || null;
}
function getVideoManifestByMenuRole(_0x36bf9c) {
  return getModelsByKind("video").filter(_0xa5a86e => getManifestVideoMenu(_0xa5a86e)?.role === _0x36bf9c).sort((_0x3ab00e, _0x118ba3) => Number(getManifestVideoMenu(_0x3ab00e)?.order || 0) - Number(getManifestVideoMenu(_0x118ba3)?.order || 0))[0] || null;
}
function getApimartVideoModelMenuManifests() {
  return getModelsByKind("video").filter(_0x487e8b => {
    if (_0x487e8b?.provider !== "apimart") {
      return false;
    }
    if (_0x487e8b?.adapterType !== "modelApi") {
      return false;
    }
    return getManifestVideoMenu(_0x487e8b)?.role === "apimartModel";
  }).sort((_0x4a4325, _0x3462b7) => Number(getManifestVideoMenu(_0x4a4325)?.order || 0) - Number(getManifestVideoMenu(_0x3462b7)?.order || 0));
}
function getMinimaxVideoModelMenuManifests() {
  return getModelsByKind("video").filter(_0x124cd3 => {
    if (_0x124cd3?.provider !== "minimax") {
      return false;
    }
    if (_0x124cd3?.adapterType !== "modelApi") {
      return false;
    }
    return getManifestVideoMenu(_0x124cd3)?.role === "minimaxOfficialModel";
  }).sort((_0x42f7ca, _0x433c15) => Number(getManifestVideoMenu(_0x42f7ca)?.order || 0) - Number(getManifestVideoMenu(_0x433c15)?.order || 0));
}
function getAgnesVideoModelMenuManifests() {
  return getModelsByKind("video").filter(_0x5be000 => {
    if (_0x5be000?.provider !== "agnes") {
      return false;
    }
    if (_0x5be000?.adapterType !== "modelApi") {
      return false;
    }
    return getManifestVideoMenu(_0x5be000)?.role === "agnesModel";
  }).sort((_0x237e37, _0x19ecb2) => Number(getManifestVideoMenu(_0x237e37)?.order || 0) - Number(getManifestVideoMenu(_0x19ecb2)?.order || 0));
}
function getBinghuoVideoModelMenuManifests() {
  return getModelsByKind("video").filter(_0x48521d => {
    if (_0x48521d?.provider !== "binghuo") {
      return false;
    }
    if (_0x48521d?.adapterType !== "modelApi") {
      return false;
    }
    return getManifestVideoMenu(_0x48521d)?.role === "binghuoModel";
  }).sort((_0xe45a44, _0x3a24b4) => Number(getManifestVideoMenu(_0xe45a44)?.order || 0) - Number(getManifestVideoMenu(_0x3a24b4)?.order || 0));
}
export function getDreaminaTaskModelMenuItems(_0x496012, _0x1e976f = "dreamina") {
  const _0x15dacd = String(_0x1e976f || "dreamina").trim().toLowerCase();
  const _0x15c7e1 = String(_0x496012 || "").trim();
  return getModelsByKind("video").filter(_0xa7de30 => {
    if (_0xa7de30?.provider !== _0x15dacd) {
      return false;
    }
    const _0x1e000a = getManifestDreaminaStyleVideo(_0xa7de30);
    if (!_0x1e000a) {
      return false;
    }
    return Array.isArray(_0x1e000a.taskTypes) && _0x1e000a.taskTypes.includes(_0x15c7e1);
  }).sort((_0x42d208, _0x29956e) => Number(getManifestDreaminaStyleVideo(_0x42d208)?.order || 0) - Number(getManifestDreaminaStyleVideo(_0x29956e)?.order || 0)).map(_0x243d7e => {
    const _0x5d255a = getManifestDreaminaStyleVideo(_0x243d7e);
    return {
      model: _0x243d7e.modelId,
      title: translateManifestText(_0x5d255a.title || _0x243d7e.displayName || _0x243d7e.modelId),
      subtitle: translateManifestText(_0x5d255a.subtitleByTaskType?.[_0x15c7e1] || _0x5d255a.subtitle || _0x243d7e.description || "")
    };
  });
}
export function getDreaminaTaskModelMenuMeta(_0x184e25, _0x837016 = "") {
  const _0x10f0fc = getModelManifest(_0x184e25);
  const _0x3823cd = resolveDreaminaStyleVideoProvider(_0x184e25, _0x837016);
  if (!_0x10f0fc || _0x10f0fc.provider !== _0x3823cd) {
    return null;
  }
  const _0x59e466 = getManifestDreaminaStyleVideo(_0x10f0fc);
  if (!_0x59e466) {
    return null;
  }
  return {
    title: translateManifestText(_0x59e466.title || _0x10f0fc.displayName || _0x10f0fc.modelId),
    subtitle: translateManifestText(_0x59e466.subtitle || _0x10f0fc.description || "")
  };
}
export function buildDreaminaOfficialVideoMenuItems() {
  const _0x344fbe = getVideoManifestByMenuRole("dreaminaOfficial");
  const _0x27979d = getManifestVideoMenu(_0x344fbe);
  if (!_0x344fbe || !_0x27979d) {
    return [];
  }
  return [{
    modelId: _0x344fbe.modelId,
    provider: _0x344fbe.provider,
    label: _0x27979d.label || _0x344fbe.displayName,
    subtitle: _0x27979d.subtitle || _0x344fbe.description || "",
    iconHtml: buildDreaminaVideoLogoHTML(20),
    vip: _0x344fbe.vip === true
  }];
}
export function buildVolcengineOfficialVideoMenuItems(_0x4ec92e = "", _0x5a7f69 = "") {
  const _0x528bb9 = getVideoManifestByMenuRole("volcengineOfficial");
  const _0x7a6985 = getManifestVideoMenu(_0x528bb9);
  if (!_0x528bb9 || !_0x7a6985) {
    return [];
  }
  const _0x355c03 = resolveDreaminaStyleVideoProvider(_0x4ec92e, _0x5a7f69);
  const _0x2a8002 = getModelManifest(_0x4ec92e);
  return [{
    modelId: _0x528bb9.modelId,
    provider: _0x528bb9.provider,
    label: _0x7a6985.label || _0x528bb9.displayName,
    subtitle: _0x7a6985.subtitle || _0x528bb9.description || "",
    iconHtml: buildVolcengineVideoLogoHTML(20),
    active: _0x355c03 === "volcengine" && !!_0x2a8002?.extensions?.dreaminaStyleVideo,
    vip: _0x528bb9.vip === true
  }];
}
export function buildApimartVideoMenuItemsHtml(_0x36407, _0x2ca38f) {
  const _0x2cffb7 = getVideoManifestByMenuRole("apimartDreaminaEntry");
  const _0x383483 = getManifestVideoMenu(_0x2cffb7);
  const _0x4535fd = _0x2cffb7?.modelId || APIMART_DREAMINA_VIDEO_DEFAULT_MODEL;
  return [renderNodeMenuItem({
    modelId: _0x4535fd,
    provider: "apimart",
    label: _0x383483?.label || "即梦视频",
    description: _0x383483?.subtitle || "",
    iconHtml: buildDreaminaVideoLogoHTML(20),
    active: isApimartDreaminaVideoModel(_0x36407, _0x2ca38f),
    attrs: {
      "data-apimart-jimeng": "1"
    }
  }), ...getApimartVideoModelMenuManifests().map(_0x5c9c3b => {
    const _0x4a84cc = getManifestVideoMenu(_0x5c9c3b);
    return renderNodeMenuItem({
      modelId: _0x5c9c3b.modelId,
      provider: "apimart",
      label: _0x5c9c3b.displayName,
      description: _0x4a84cc?.disabledValue ? _0x5c9c3b.description || "" : _0x4a84cc?.subtitle || _0x5c9c3b.description || "",
      iconHtml: buildApimartVideoLogoHTML(20),
      vip: _0x5c9c3b.vip === true,
      attrs: {
        "data-apimart-video-model": "1"
      }
    }, {
      activeModel: _0x36407
    });
  })].join("");
}
export function buildMinimaxVideoMenuItemsHtml(_0x169be4) {
  return getMinimaxVideoModelMenuManifests().map(_0x475b82 => {
    const _0x5582d9 = getManifestVideoMenu(_0x475b82);
    return renderNodeMenuItem({
      modelId: _0x475b82.modelId,
      provider: "minimax",
      label: _0x5582d9?.label || _0x475b82.displayName,
      description: _0x5582d9?.subtitle || _0x475b82.description || "",
      iconHtml: buildMinimaxVideoLogoHTML(20)
    }, {
      activeModel: _0x169be4
    });
  }).join("");
}
export function buildAgnesVideoMenuItemsHtml(_0x11b13a) {
  return getAgnesVideoModelMenuManifests().map(_0x30e01f => {
    const _0x380d07 = getManifestVideoMenu(_0x30e01f);
    return renderNodeMenuItem({
      modelId: _0x30e01f.modelId,
      provider: "agnes",
      label: _0x380d07?.label || _0x30e01f.displayName,
      description: _0x380d07?.subtitle || _0x30e01f.description || "",
      iconHtml: buildAgnesVideoLogoHTML(20),
      vip: _0x30e01f.vip === true,
      badgeHtml: buildModelProviderProfileBadgesHtml(_0x30e01f, {
        vip: _0x30e01f.vip === true
      })
    }, {
      activeModel: _0x11b13a
    });
  }).join("");
}
export function buildBinghuoVideoMenuItemsHtml(_0x588701) {
  return getBinghuoVideoModelMenuManifests().map(_0x418902 => {
    const _0x2ce2a6 = getManifestVideoMenu(_0x418902);
    return renderNodeMenuItem({
      modelId: _0x418902.modelId,
      provider: "binghuo",
      label: _0x2ce2a6?.label || _0x418902.displayName,
      description: _0x2ce2a6?.subtitle || _0x418902.description || "",
      iconHtml: buildBinghuoVideoLogoHTML(20),
      disabled: _0x2ce2a6?.disabled === true
    }, {
      activeModel: _0x588701
    });
  }).join("");
}
export function buildDreaminaTaskModelMenuHtml(_0x177f1d, _0x565597, _0x2be63f = "dreamina") {
  const _0x2feed1 = resolveDreaminaStyleVideoProvider(_0x177f1d, _0x2be63f);
  const _0x38728f = getDreaminaTaskModelMenuItems(_0x565597, _0x2feed1);
  const _0x1025a3 = _0x2feed1 === "apimart" ? buildApimartVideoLogoHTML(20) : _0x2feed1 === "volcengine" ? buildVolcengineVideoLogoHTML(20) : "<img src=\"images/jimeng.png\" class=\"node-menu-icon\" alt=\"dreamina\">";
  if (!_0x38728f.length) {
    return renderNodeMenuItem({
      label: "智能多帧",
      description: "暂未开放模型切换",
      iconHtml: _0x1025a3,
      disabled: true
    });
  }
  return _0x38728f.map(_0x21c874 => renderNodeMenuItem({
    modelId: _0x21c874.model,
    provider: _0x2feed1,
    label: _0x21c874.title,
    description: _0x21c874.subtitle,
    iconHtml: _0x1025a3,
    active: _0x177f1d === _0x21c874.model,
    attrs: {
      "data-dreamina-task-model": "1"
    }
  })).join("");
}
export function getRhV54FpsOptions() {
  return RH_V54_FPS_OPTIONS;
}
export function normalizeRhStandardFps(_0x18daab) {
  const _0x1c58a5 = Number(_0x18daab);
  if (RH_STANDARD_FPS_OPTIONS.includes(_0x1c58a5)) {
    return _0x1c58a5;
  } else {
    return 24;
  }
}
export function normalizeRhV54Fps(_0x951600) {
  const _0xcbe44d = Number(_0x951600);
  if (getRhV54FpsOptions().includes(_0xcbe44d)) {
    return _0xcbe44d;
  } else {
    return 24;
  }
}
export function normalizeRhVideoResolution(_0x20b8cd) {
  const _0x3af2a2 = Number(_0x20b8cd);
  if (Number.isFinite(_0x3af2a2)) {
    return Math.max(RH_MIN_VIDEO_RESOLUTION, Math.trunc(_0x3af2a2));
  } else {
    return RH_MIN_VIDEO_RESOLUTION;
  }
}
export function arePlainObjectsEqual(_0x108005, _0x57bde5) {
  return JSON.stringify(_0x108005 || {}) === JSON.stringify(_0x57bde5 || {});
}