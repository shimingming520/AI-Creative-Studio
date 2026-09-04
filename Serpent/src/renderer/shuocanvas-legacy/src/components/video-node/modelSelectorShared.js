import { getModelManifest, normalizeProviderId, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { renderNodeModelMenu } from "../shared/nodeModelMenu.js";
import { buildAgnesVideoLogoHTML, buildAgnesVideoMenuItemsHtml, buildBinghuoVideoLogoHTML, buildBinghuoVideoMenuItemsHtml, buildApimartVideoLogoHTML, buildApimartVideoMenuItemsHtml, buildMinimaxVideoLogoHTML, buildMinimaxVideoMenuItemsHtml, buildComfyUiVideoWorkflowMenuGroups, buildCustomProviderVideoLogoHTML, buildCustomProviderVideoMenuGroups, buildDreaminaOfficialVideoMenuItems, buildDreaminaVideoLogoHTML, buildRhAiAppVideoMenuItems, buildRunningHubVideoModelApiMenuItems, buildRunningHubVideoWorkflowMenuItems, buildVolcengineOfficialVideoMenuItems, buildVolcengineVideoLogoHTML, getComfyUiVideoWorkflowIconHtml, getDefaultRunningHubVideoWorkflowModelId } from "./parameterPanelModelHelpers.js";
import { isModelAllowed } from "../../modules/subscriptionAccess.js";
export const BINGHUO_VIDEO_GATE_MODEL_ID = "feature/binghuo_video";
export function isBinghuoVideoChannelVisible(_0x16d03e = {}) {
  return isModelAllowed(BINGHUO_VIDEO_GATE_MODEL_ID, _0x16d03e, "binghuo");
}
export function buildVideoModelMenuHTML({
  activeModel = "",
  provider = "",
  subscriptionState = {},
  allowedModelIds = [],
  runningHubWorkflowAllowedModelIds = []
} = {}) {
  const _0x123fd0 = [...new Set((Array.isArray(allowedModelIds) ? allowedModelIds : []).map(_0xcfb206 => String(_0xcfb206 || "").trim()).filter(Boolean))];
  const _0x4c2e97 = String(activeModel || "").trim();
  const _0x2ca8ab = _0x123fd0.includes(_0x4c2e97) || /^custom-[^/]+\/.+$/i.test(_0x4c2e97) ? _0x4c2e97 : _0x123fd0[0] || _0x4c2e97 || getDefaultRunningHubVideoWorkflowModelId();
  const _0x26ed72 = buildBinghuoVideoMenuItemsHtml(_0x2ca8ab);
  if (_0x123fd0.length) {
    const _0x2cb693 = _0x123fd0.map(_0x1c306f => getModelManifest(_0x1c306f)).filter(_0x1ce30b => _0x1ce30b?.kind === "video");
    const _0x4cfd22 = _0x2cb693.every(_0x3ca184 => _0x3ca184.provider === "runninghubwf" && _0x3ca184.adapterType === "workflow");
    // 自定义中转模型由独立的供应商分组渲染，避免同时出现在“可用视频模型”中造成重复。
    const _0x44f004 = _0x2cb693.filter(_0x1ec8e3 => !_0x1ec8e3?.extensions?.customProvider).map(_0x1ec8e3 => ({
      modelId: _0x1ec8e3.modelId,
      provider: _0x1ec8e3.provider || "runninghubwf",
      label: _0x1ec8e3.displayName || _0x1ec8e3.modelId,
      description: _0x1ec8e3.description || "",
      icon: _0x1ec8e3.icon || (_0x4cfd22 ? "images/RH.png" : ""),
      iconAlt: _0x1ec8e3.provider || "video",
      vip: _0x1ec8e3.vip === true
    }));
    const _0x7adf4e = buildCustomProviderVideoMenuGroups(_0x2ca8ab);
    return renderNodeModelMenu({
      kind: "video",
      activeModel: _0x2ca8ab,
      groups: [...(_0x44f004.length ? [{
        id: "runninghub",
        label: _0x4cfd22 ? "RunningHUB工作流" : "可用视频模型",
        subtitle: _0x4cfd22 ? "人物视频替换工作流" : "当前场景可选",
        icon: _0x4cfd22 ? "images/RH.png" : "",
        iconAlt: _0x4cfd22 ? "runninghub" : "video",
        items: _0x44f004
      }] : []), ..._0x7adf4e]
    });
  }
  const _0x367e41 = buildRhAiAppVideoMenuItems(_0x2ca8ab, {
    allowedModelIds: runningHubWorkflowAllowedModelIds
  });
  const _0x162bcf = buildRunningHubVideoWorkflowMenuItems(_0x2ca8ab, {
    allowedModelIds: runningHubWorkflowAllowedModelIds
  });
  return renderNodeModelMenu({
    kind: "video",
    activeModel: _0x2ca8ab,
    items: [...buildDreaminaOfficialVideoMenuItems(), ...buildVolcengineOfficialVideoMenuItems(_0x2ca8ab, provider)],
    groups: [{
      id: "minimax-video",
      headerClass: "minimax-video-group-header",
      submenuClass: "minimax-video-submenu",
      toggleAttr: "data-minimax-video-toggle",
      label: "MiniMAX官方",
      subtitle: "视频生成模型",
      iconHtml: buildMinimaxVideoLogoHTML(20),
      itemsHtml: buildMinimaxVideoMenuItemsHtml(_0x2ca8ab)
    }, {
      id: "apimart-video",
      headerClass: "apimart-video-group-header",
      submenuClass: "apimart-video-submenu",
      toggleAttr: "data-apimart-video-toggle",
      label: "APIMart",
      subtitle: "视频生成模型",
      iconHtml: buildApimartVideoLogoHTML(20),
      itemsHtml: buildApimartVideoMenuItemsHtml(_0x2ca8ab, provider)
    }, {
      id: "agnes-video",
      headerClass: "agnes-video-group-header",
      submenuClass: "agnes-video-submenu",
      toggleAttr: "data-agnes-video-toggle",
      label: "Agnes AI",
      subtitle: "Video model API",
      iconHtml: buildAgnesVideoLogoHTML(20),
      itemsHtml: buildAgnesVideoMenuItemsHtml(_0x2ca8ab)
    }, ...(isBinghuoVideoChannelVisible(subscriptionState) && _0x26ed72 ? [{
      id: "binghuo-video",
      headerClass: "binghuo-video-group-header",
      submenuClass: "binghuo-video-submenu",
      toggleAttr: "data-binghuo-video-toggle",
      label: "便宜渠道bh",
      subtitle: "视频生成模型",
      iconHtml: buildBinghuoVideoLogoHTML(20),
      itemsHtml: _0x26ed72
    }] : []), ...(_0x367e41 ? [{
      id: "rh-ai-app",
      label: "RH AI应用",
      subtitle: "自定义 RunningHub AI App",
      icon: "images/RH.png",
      iconAlt: "runninghub",
      vip: false,
      itemsHtml: _0x367e41
    }] : []), ...buildCustomProviderVideoMenuGroups(_0x2ca8ab), ...buildComfyUiVideoWorkflowMenuGroups(_0x2ca8ab), ...(_0x162bcf ? [{
      id: "runninghub",
      label: "RunningHUB工作流",
      subtitle: "AI 工作流",
      icon: "images/RH.png",
      iconAlt: "runninghub",
      itemsHtml: _0x162bcf
    }] : []), {
      id: "runninghub-model",
      label: "RunningHub模型",
      subtitle: "标准模型 API",
      icon: "images/RH.png",
      iconAlt: "runninghub",
      itemsHtml: buildRunningHubVideoModelApiMenuItems(_0x2ca8ab)
    }]
  });
}
export function renderVideoModelTriggerIconHTML({
  model = "",
  provider = "",
  providersMeta = {},
  resolveExecution = (_0x25f1a5, _0x356ba5) => resolveModelExecution(_0x25f1a5, {
    providerHint: _0x356ba5
  }) || resolveModelExecution(_0x25f1a5) || null,
  resolveProviderId = (_0x334d0f, _0x2fc131, _0x200398) => normalizeProviderId(_0x200398?.modelManifest?.provider) || resolveModelProvider(_0x334d0f, _0x2fc131, {
    allowPrefixInference: false
  }) || ""
} = {}) {
  const _0x5636c7 = resolveExecution(model, provider);
  const _0x35e7ef = resolveProviderId(model, provider, _0x5636c7);
  if (_0x35e7ef === "minimax") {
    return buildMinimaxVideoLogoHTML(12);
  }
  if (_0x35e7ef === "apimart") {
    return buildApimartVideoLogoHTML(12);
  }
  if (_0x35e7ef === "binghuo") {
    return buildBinghuoVideoLogoHTML(12);
  }
  if (_0x35e7ef === "volcengine") {
    return buildVolcengineVideoLogoHTML(12);
  }
  if (_0x35e7ef === "dreamina" || _0x5636c7?.modelManifest?.extensions?.dreaminaStyleVideo) {
    return buildDreaminaVideoLogoHTML(12);
  }
  if (_0x35e7ef === "comfyui") {
    return getComfyUiVideoWorkflowIconHtml(_0x5636c7?.modelManifest?.extensions?.videoMenu || {}, 12);
  }
  if (_0x35e7ef && /^custom[-_][a-z0-9_-]+$/i.test(_0x35e7ef)) {
    return buildCustomProviderVideoLogoHTML(_0x5636c7?.modelManifest || {}, 12);
  }
  const _0x163499 = _0x35e7ef ? providersMeta?.[_0x35e7ef]?.logoPath : null;
  if (_0x163499) {
    return "<img src=\"" + _0x163499 + "\" class=\"node-menu-icon-small\" alt=\"" + _0x35e7ef + "\" loading=\"eager\" decoding=\"async\" fetchpriority=\"high\" draggable=\"false\">";
  }
  return "<div class=\"node-menu-icon-small node-menu-icon-badge video-model-fallback-icon\">VM</div>";
}
