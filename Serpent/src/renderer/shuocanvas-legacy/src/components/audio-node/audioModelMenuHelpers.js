import { getModelsByKind } from "../../manifests/index.js";
import { escapeNodeMenuHtml, renderNodeModelMenu, renderNodeModelTrigger } from "../shared/nodeModelMenu.js";
import { renderComfyUiCloudWorkflowLogoHtml, renderComfyUiLocalWorkflowLogoHtml, renderComfyUiWorkflowLogoHtmlFromIconKind } from "../shared/customAiAppLogo.js";
import { t } from "../../i18n/index.js";
function audioModelMenuText(_0xd7560e, _0xe0a138 = {}) {
  return t("audioModelMenu." + _0xd7560e, _0xe0a138);
}
function isSavedRhAiAppManifest(_0x48ae9e) {
  return Boolean(String(_0x48ae9e?.extensions?.rhAiApp?.appKey || "").trim());
}
function isSavedComfyUiWorkflowManifest(_0xe4d6d0) {
  return Boolean(String(_0xe4d6d0?.extensions?.comfyUiWorkflow?.appKey || "").trim());
}
function buildComfyUiAudioWorkflowIconHtml(_0x32f8dd) {
  return renderComfyUiWorkflowLogoHtmlFromIconKind(_0x32f8dd, {
    className: "node-menu-icon"
  });
}
function getCustomProviderMeta(_0x41bcb3) {
  const _0x59f59c = _0x41bcb3?.extensions?.customProvider;
  if (_0x59f59c && typeof _0x59f59c === "object") {
    return _0x59f59c;
  } else {
    return null;
  }
}
function buildCustomProviderAudioLogoHtml(_0x974be0 = {}, _0x55dcd7 = "node-menu-icon") {
  const _0x35a959 = String(_0x974be0?.badge || "CP").trim().slice(0, 2) || "CP";
  return "<div class=\"" + escapeNodeMenuHtml(_0x55dcd7) + " node-menu-icon-badge\">" + escapeNodeMenuHtml(_0x35a959) + "</div>";
}
function getAudioMenuIconHtml(_0x145923 = {}) {
  const _0x152a53 = String(_0x145923?.iconKind || "").trim();
  if (_0x152a53 === "comfyUiCloudWorkflowBadge" || _0x152a53 === "comfyUiLocalWorkflowBadge") {
    return buildComfyUiAudioWorkflowIconHtml(_0x152a53);
  }
  if (_0x152a53 === "customProviderBadge") {
    return buildCustomProviderAudioLogoHtml(_0x145923);
  }
  return "";
}
function getAudioMenuMeta(_0x30e427) {
  if (_0x30e427?.extensions?.rhAiApp && !isSavedRhAiAppManifest(_0x30e427)) {
    return null;
  }
  if (_0x30e427?.extensions?.comfyUiWorkflow && !isSavedComfyUiWorkflowManifest(_0x30e427)) {
    return null;
  }
  const _0x2f7e16 = _0x30e427?.extensions?.audioMenu;
  if (_0x2f7e16 && typeof _0x2f7e16 === "object") {
    if (_0x30e427?.extensions?.rhAiApp) {
      return {
        ..._0x2f7e16,
        group: "rhAiApp"
      };
    } else {
      return _0x2f7e16;
    }
  }
  if (_0x30e427?.extensions?.rhAiApp) {
    return {
      group: "rhAiApp",
      order: 999
    };
  }
  return null;
}
const AUDIO_MENU_GROUP_CONFIG = Object.freeze({
  rhAiApp: Object.freeze({
    id: "rhAiApp",
    label: "RH AI应用",
    subtitle: "自定义 RunningHub AI App",
    icon: "images/RH.png",
    iconAlt: "runninghub",
    vip: false,
    order: 5
  }),
  comfyUiCloudWorkflow: Object.freeze({
    id: "comfyUiCloudWorkflow",
    label: "云端工作流",
    subtitle: "保存的 ComfyUI 云端工作流",
    iconHtml: renderComfyUiCloudWorkflowLogoHtml({
      className: "node-menu-icon"
    }),
    order: 6
  }),
  comfyUiLocalWorkflow: Object.freeze({
    id: "comfyUiLocalWorkflow",
    label: "本地工作流",
    subtitle: "保存的 ComfyUI 本地工作流",
    iconHtml: renderComfyUiLocalWorkflowLogoHtml({
      className: "node-menu-icon"
    }),
    order: 7
  }),
  runninghubWorkflow: Object.freeze({
    id: "runninghub",
    labelKey: "runninghub.label",
    subtitleKey: "runninghub.subtitle",
    icon: "images/RH.png",
    iconAlt: "runninghub",
    order: 10
  }),
  runninghubModel: Object.freeze({
    id: "runninghubModel",
    label: "RunningHub模型",
    subtitle: "Suno音乐生成 · MiniMax语音合成",
    icon: "images/RH.png",
    iconAlt: "runninghub",
    order: 15
  }),
  volcengineSpeech: Object.freeze({
    id: "volcengineSpeech",
    label: "火山语音",
    subtitle: "豆包语音大模型",
    icon: "images/volcengine.svg",
    iconAlt: "volcengine-speech",
    order: 20
  })
});
function getGroupConfig(_0x4a552f) {
  const _0x23eff0 = String(_0x4a552f || "").trim();
  if (AUDIO_MENU_GROUP_CONFIG[_0x23eff0]) {
    return AUDIO_MENU_GROUP_CONFIG[_0x23eff0];
  }
  return Object.freeze({
    id: _0x23eff0 || "other",
    label: _0x23eff0 || "其他",
    subtitle: "",
    icon: "images/RH.png",
    iconAlt: _0x23eff0 || "",
    order: 100
  });
}
function isAudioModelMenuManifest(_0xfe9bef) {
  const _0x34011f = getAudioMenuMeta(_0xfe9bef);
  if (!_0x34011f?.group) {
    return false;
  }
  if (!_0xfe9bef?.provider) {
    return false;
  }
  if (_0xfe9bef?.kind !== "audio") {
    return false;
  }
  const _0x3ca2be = Array.isArray(_0xfe9bef?.uiPlacement) ? _0xfe9bef.uiPlacement : ["modelMenu"];
  return !_0x3ca2be.includes("toolbar") || !!_0x3ca2be.includes("modelMenu");
}
export function getAudioWorkflowMenuManifests() {
  return getModelsByKind("audio").filter(isAudioModelMenuManifest).sort((_0x4cc3fe, _0x4f6949) => {
    const _0x144dd4 = Number(getGroupConfig(getAudioMenuMeta(_0x4cc3fe)?.group)?.order);
    const _0x4c89a5 = Number(getGroupConfig(getAudioMenuMeta(_0x4f6949)?.group)?.order);
    const _0x5fbd07 = Number.isFinite(_0x144dd4) ? _0x144dd4 : 0;
    const _0xab0918 = Number.isFinite(_0x4c89a5) ? _0x4c89a5 : 0;
    if (_0x5fbd07 !== _0xab0918) {
      return _0x5fbd07 - _0xab0918;
    }
    const _0x197327 = Number(getAudioMenuMeta(_0x4cc3fe)?.order);
    const _0x454bcd = Number(getAudioMenuMeta(_0x4f6949)?.order);
    const _0x403f87 = Number.isFinite(_0x197327) ? _0x197327 : 0;
    const _0x4af48a = Number.isFinite(_0x454bcd) ? _0x454bcd : 0;
    if (_0x403f87 !== _0x4af48a) {
      return _0x403f87 - _0x4af48a;
    }
    return String(_0x4cc3fe.modelId || "").localeCompare(String(_0x4f6949.modelId || ""));
  });
}
function getGroupLabel(_0x52c615) {
  if (_0x52c615.labelKey) {
    return audioModelMenuText(_0x52c615.labelKey);
  }
  return _0x52c615.label || _0x52c615.id;
}
function getGroupSubtitle(_0x2b6ea3) {
  if (_0x2b6ea3.subtitleKey) {
    return audioModelMenuText(_0x2b6ea3.subtitleKey);
  }
  return _0x2b6ea3.subtitle || "";
}
export function buildAudioWorkflowItems(_0x25153f = {}) {
  return getAudioWorkflowMenuManifests().map(_0x9d3077 => {
    const _0x19a93f = getAudioMenuMeta(_0x9d3077) || {};
    const _0x4cd3d2 = getCustomProviderMeta(_0x9d3077);
    const _0x421197 = getAudioMenuIconHtml({
      ..._0x19a93f,
      ...(_0x4cd3d2?.badge ? {
        badge: _0x4cd3d2.badge
      } : {})
    });
    return Object.freeze({
      key: _0x9d3077.modelId,
      label: _0x19a93f.label || _0x9d3077.displayName,
      subtitle: _0x19a93f.subtitle || _0x9d3077.description || "",
      icon: _0x19a93f.icon || _0x9d3077.icon || "images/RH.png",
      iconAlt: _0x19a93f.iconAlt || (_0x9d3077.provider === "runninghubwf" ? "runninghub" : _0x9d3077.provider || ""),
      iconHtml: _0x421197,
      provider: _0x9d3077.provider || "",
      providerDisplayName: _0x4cd3d2?.displayName || "",
      providerBadge: _0x4cd3d2?.badge || "",
      adapterType: _0x9d3077.adapterType || "",
      executionId: _0x9d3077.executionId || "",
      async: _0x9d3077.async === true,
      cancellable: _0x9d3077.cancellable === true,
      vip: _0x9d3077.vip === true,
      group: _0x19a93f.group || "",
      validate: _0x25153f[_0x9d3077.modelId] || (() => "")
    });
  });
}
function groupWorkflowItems(_0x415d58 = []) {
  const _0x4bfda3 = new Map();
  _0x415d58.forEach(_0x429a9e => {
    const _0x45a0fe = String(_0x429a9e?.group || "runninghubWorkflow");
    const _0x13728e = getGroupConfig(_0x45a0fe);
    const _0x40fe75 = !AUDIO_MENU_GROUP_CONFIG[_0x45a0fe] && String(_0x429a9e?.providerDisplayName || "").trim();
    if (!_0x4bfda3.has(_0x13728e.id)) {
      _0x4bfda3.set(_0x13728e.id, {
        ..._0x13728e,
        label: _0x40fe75 ? _0x429a9e.providerDisplayName : getGroupLabel(_0x13728e),
        subtitle: _0x40fe75 ? "Custom provider" : getGroupSubtitle(_0x13728e),
        iconHtml: _0x40fe75 ? buildCustomProviderAudioLogoHtml({
          badge: _0x429a9e.providerBadge || "CP"
        }) : _0x13728e.iconHtml,
        icon: _0x40fe75 ? undefined : _0x13728e.icon,
        iconAlt: _0x40fe75 ? "" : _0x13728e.iconAlt,
        order: _0x40fe75 ? 30 : _0x13728e.order,
        items: []
      });
    }
    _0x4bfda3.get(_0x13728e.id).items.push({
      modelId: _0x429a9e.key,
      provider: _0x429a9e.provider || "",
      label: _0x429a9e.label,
      subtitle: _0x429a9e.subtitle,
      iconHtml: _0x429a9e.iconHtml || undefined,
      icon: _0x429a9e.icon || _0x13728e.icon,
      iconAlt: _0x429a9e.iconAlt || _0x13728e.iconAlt,
      vip: _0x429a9e.vip === true
    });
  });
  return Array.from(_0x4bfda3.values()).sort((_0x435d32, _0x272563) => {
    const _0x661894 = Number(_0x435d32.order);
    const _0x704158 = Number(_0x272563.order);
    return (Number.isFinite(_0x661894) ? _0x661894 : 0) - (Number.isFinite(_0x704158) ? _0x704158 : 0);
  });
}
export function buildAudioWorkflowMenuGroups(_0x46db63 = []) {
  return groupWorkflowItems(_0x46db63);
}
export function buildAudioModelMenuHtml({
  activeModel = "",
  workflowItems = []
} = {}) {
  return renderNodeModelMenu({
    kind: "audio",
    activeModel: activeModel,
    groups: groupWorkflowItems(workflowItems)
  });
}
export function buildAudioModelTriggerHtml({
  label = "",
  activeProvider = "",
  icon = "",
  iconAlt = "",
  iconHtml = ""
} = {}) {
  const _0x433d71 = String(activeProvider || "").trim();
  const _0x4eccb2 = String(icon || "").trim() || (_0x433d71 === "volcengine-speech" ? "images/volcengine.svg" : "images/RH.png");
  const _0x4c5a8e = String(iconAlt || "").trim() || (_0x433d71 === "volcengine-speech" ? "volcengine-speech" : "runninghub");
  const _0x51b366 = String(iconHtml || "").trim() || "<img src=\"" + escapeNodeMenuHtml(_0x4eccb2) + "\" style=\"width:14px;height:14px;object-fit:contain;border-radius:3px;flex-shrink:0;\" alt=\"" + escapeNodeMenuHtml(_0x4c5a8e) + "\">";
  return renderNodeModelTrigger({
    iconHtml: _0x51b366,
    label: label
  });
}
