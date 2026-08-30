import { activateMenuKeyboard } from "../../modules/floatingMenuKeyboard.js";
import { t } from "../../i18n/index.js";
import { getDisplayModelName, PROVIDERS_META } from "../../modules/providers.js";
import { getModelManifest, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { bindUiSchemaFieldControls, bindModelUiSchemaControls, renderModelUiSchemaControls, renderUiSchemaFields } from "../aigenImage/uiSchemaRenderer.js";
import { buildUiSchemaVisibilitySignature } from "../aigenImage/uiSchemaVisibility.js";
import { renderNodeModelTrigger } from "../shared/nodeModelMenu.js";
import { bindNodeSubmenus, closeNodeFooterMenus, createFloatingModelMenuPortal, createFloatingUiSchemaPopupPortal } from "../shared/nodeFooterControls.js";
import { buildVideoModelMenuHTML, renderVideoModelTriggerIconHTML } from "../video-node/modelSelectorShared.js";
import { buildRhWorkflowFieldPatch, buildVideoModelApiModelSelectionPatch } from "../video-node/parameterPanelModelSelectionPolicy.js";
import { buildVideoWorkflowDisplayParamsPatch, buildVideoWorkflowGenerationParamsPatch, buildVideoWorkflowModelSelectionPatch, buildVideoWorkflowReferenceSummaryParamsPatch, getRunningHubVideoWorkflowFpsOptions, hasRunningHubVideoWorkflowUiPlacement, isRunningHubVideoWorkflowManifest } from "../video-node/runningHubVideoUiSchema.js";
import { resolveVideoAdvancedSchemaTarget } from "../video-node/videoAdvancedSchemaTarget.js";
import { buildDreaminaModelSelectionParamPatch, buildDreaminaParamPatch, buildDreaminaParamSchemaFields, getDreaminaEffectiveNodeData } from "../video-node/dreaminaParameterSchema.js";
import { buildDreaminaTaskModelMenuHtml, getDreaminaTaskModelMenuMeta, getRhV54FpsOptions } from "../video-node/parameterPanelModelHelpers.js";
import { ensureDreaminaStyleVideoModelForTask, getDreaminaStyleVideoDurationRange, getDreaminaStyleVideoResolutionOptions, getDreaminaVideoTaskParamVisibility, isDreaminaStyleVideoModel, normalizeDreaminaStyleVideoDuration, normalizeDreaminaStyleVideoResolution, normalizeDreaminaVideoAspectRatio, normalizeDreaminaVideoRouteMode, resolveDreaminaStyleVideoProvider, resolveDreaminaVideoTaskType } from "../../modules/dreaminaVideoModelHelper.js";
import { bindModelCredentialMenu, syncModelCredentialMenu } from "../../modules/modelCredentialUi.js";
import { buildModelProviderProfileSelectionPatch } from "../../modules/modelProviderProfileSelection.js";
function escapeHtml(_0x499684) {
  return String(_0x499684 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function getPlainObject(_0x1c118b) {
  if (_0x1c118b && typeof _0x1c118b === "object" && !Array.isArray(_0x1c118b)) {
    return {
      ..._0x1c118b
    };
  } else {
    return {};
  }
}
function normalizeAllowedModelIds(_0x4b6185 = []) {
  return [...new Set((Array.isArray(_0x4b6185) ? _0x4b6185 : []).map(_0x2b0173 => String(_0x2b0173 || "").trim()).filter(Boolean))];
}
function resolveAllowedModelId(_0x3f31e4, _0x5b3a19 = []) {
  const _0x3a90da = String(_0x3f31e4 || "").trim();
  if (_0x5b3a19.length && !_0x5b3a19.includes(_0x3a90da)) {
    return _0x5b3a19[0];
  } else {
    return _0x3a90da;
  }
}
function resolveRunningHubWorkflowAllowedModelId(_0x368475, _0x35ff43 = []) {
  const _0x45155a = String(_0x368475 || "").trim();
  const _0x445fba = getModelManifest(_0x45155a);
  if (_0x35ff43.length && _0x445fba?.provider === "runninghubwf" && _0x445fba?.adapterType === "workflow" && !_0x35ff43.includes(_0x45155a)) {
    return _0x35ff43[0];
  } else {
    return _0x45155a;
  }
}
const DEFAULT_VIDEO_FOOTER_PLACEMENT_ORDER = Object.freeze(["resolution", "mode"]);
function normalizeReferenceCounts(_0x4a0483 = {}) {
  return {
    imageCount: Math.max(0, Number(_0x4a0483?.imageCount) || 0),
    videoCount: Math.max(0, Number(_0x4a0483?.videoCount) || 0),
    audioCount: Math.max(0, Number(_0x4a0483?.audioCount) || 0)
  };
}
function wrapSchemaPlacement(_0x46e92d, _0x1fc8dc) {
  if (_0x1fc8dc) {
    return "<div class=\"ui-schema-placement " + _0x46e92d + "\">" + _0x1fc8dc + "</div>";
  } else {
    return "";
  }
}
function renderVideoAdvancedControlsMarkup(_0x38fb12) {
  if (!_0x38fb12) {
    return "";
  }
  return "<div class=\"rh-adv-wrap\"><button type=\"button\" class=\"img-pill-btn rh-adv2-btn\"><span class=\"rh-adv2-label\">高级设置</span></button></div>\n    <div class=\"rh-vram-adv-panel\">" + _0x38fb12 + "</div>";
}
function getDreaminaProviderLabel(_0x39dd45) {
  const _0x1c154a = String(_0x39dd45 || "").trim().toLowerCase();
  if (_0x1c154a === "dreamina") {
    return t("videoNode.parameterPanel.providers.dreamina");
  }
  if (_0x1c154a === "volcengine") {
    return t("videoNode.parameterPanel.providers.volcengine");
  }
  return t("videoNode.parameterPanel.providers.default");
}
function resolveDreaminaSelectorLayout(_0x4a6586, _0xa670e2) {
  const _0x2bc81b = getDreaminaEffectiveNodeData(_0x4a6586);
  const _0x11da15 = resolveDreaminaStyleVideoProvider(_0x2bc81b.model, _0x2bc81b.provider);
  const _0x1e86ae = normalizeDreaminaVideoRouteMode(_0x2bc81b.dreaminaRouteMode, _0x2bc81b.mode);
  const _0x4a216c = resolveDreaminaVideoTaskType({
    routeMode: _0x1e86ae,
    ...normalizeReferenceCounts(_0xa670e2)
  });
  const _0x339b57 = ensureDreaminaStyleVideoModelForTask(_0x4a216c, _0x2bc81b.model, _0x11da15);
  const _0x44f3e0 = normalizeDreaminaStyleVideoResolution(_0x4a216c, _0x339b57, _0x2bc81b.resolution || _0x2bc81b.videoSize, _0x11da15);
  const _0x5430de = normalizeDreaminaVideoAspectRatio(_0x2bc81b.aspectRatio, {
    preserveAdaptive: true
  });
  const _0x5cabb9 = normalizeDreaminaStyleVideoDuration(_0x4a216c, _0x339b57, _0x2bc81b.duration, _0x11da15);
  const _0x390daf = {
    ...getPlainObject(_0x2bc81b.generationParams),
    dreaminaRouteMode: _0x1e86ae,
    aspectRatio: _0x5430de,
    duration: _0x5cabb9,
    ...(_0x44f3e0 ? {
      resolution: _0x44f3e0
    } : {})
  };
  const _0x282473 = {
    ..._0x2bc81b,
    model: _0x339b57,
    provider: _0x11da15,
    dreaminaRouteMode: _0x1e86ae,
    aspectRatio: _0x5430de,
    duration: _0x5cabb9,
    ...(_0x44f3e0 ? {
      resolution: _0x44f3e0,
      videoSize: _0x44f3e0
    } : {}),
    generationParams: _0x390daf
  };
  const _0x2456d0 = getDreaminaVideoTaskParamVisibility(_0x4a216c);
  const _0x4e5dd7 = buildDreaminaParamSchemaFields({
    routeMode: _0x1e86ae,
    currentRatio: _0x5430de,
    currentResolution: _0x44f3e0,
    currentDuration: _0x5cabb9,
    durationRange: getDreaminaStyleVideoDurationRange(_0x4a216c, _0x339b57, _0x11da15),
    resolutionOptions: getDreaminaStyleVideoResolutionOptions(_0x4a216c, _0x339b57, _0x11da15)
  });
  const _0x595fa7 = (_0x1bba85, _0x33f4fc = {}) => renderUiSchemaFields(_0x1bba85.filter(Boolean), _0x282473, {
    sourceId: "dreamina-video-normal-params",
    ..._0x33f4fc
  });
  const _0x75447f = getDreaminaTaskModelMenuMeta(_0x339b57, _0x11da15);
  const _0x347652 = "<div class=\"dreamina-task-model-wrap\">\n    <button type=\"button\" class=\"img-pill-btn dreamina-task-model-btn\">\n      <span class=\"dreamina-task-model-label\">" + escapeHtml(_0x75447f?.title || getDisplayModelName(_0x339b57)) + "</span>\n    </button>\n    <div class=\"floating-menu dreamina-task-model-menu\">" + buildDreaminaTaskModelMenuHtml(_0x339b57, _0x4a216c, _0x11da15) + "</div>\n  </div>";
  const _0x4ef103 = [_0x347652, _0x2456d0.mode ? wrapSchemaPlacement("ui-schema-mode-slot dreamina-video-mode-schema", _0x595fa7([_0x4e5dd7.mode])) : "", _0x2456d0.ratio ? wrapSchemaPlacement("ui-schema-resolution-slot dreamina-video-ratio-schema", _0x595fa7([_0x4e5dd7.resolution, _0x4e5dd7.aspectRatio], {
    placement: "resolution"
  })) : "", _0x2456d0.duration ? wrapSchemaPlacement("ui-schema-duration-slot dreamina-video-duration-schema", _0x595fa7([_0x4e5dd7.duration])) : ""].join("");
  return {
    kind: "dreamina",
    model: _0x339b57,
    provider: _0x11da15,
    modelLabel: getDreaminaProviderLabel(_0x11da15),
    nodeData: _0x282473,
    taskType: _0x4a216c,
    controlsHtml: _0x4ef103,
    advanced: ""
  };
}
export function resolveVideoSelectorSchemaLayout(_0x7d18ca, _0x461155 = {}, {
  referenceCounts = {}
} = {}) {
  const _0x4edefc = String(_0x7d18ca || _0x461155?.model || "").trim();
  const _0x48b80e = resolveModelProvider(_0x4edefc, _0x461155?.provider || "");
  const _0x45ad34 = {
    ..._0x461155,
    model: _0x4edefc,
    provider: _0x48b80e
  };
  if (isDreaminaStyleVideoModel(_0x4edefc, _0x48b80e)) {
    return resolveDreaminaSelectorLayout(_0x45ad34, referenceCounts);
  }
  const _0x50cade = resolveModelExecution(_0x4edefc, {
    providerHint: _0x48b80e
  }) || resolveModelExecution(_0x4edefc);
  const _0x2863ee = _0x50cade?.modelManifest || getModelManifest(_0x4edefc);
  const _0xab2906 = String(_0x50cade?.canonicalModelId || _0x2863ee?.modelId || _0x4edefc).trim();
  const _0x4d951a = isRunningHubVideoWorkflowManifest(_0xab2906);
  let _0x39eccd = {
    ..._0x45ad34,
    model: _0xab2906
  };
  if (_0x4d951a) {
    const _0x385ccc = buildVideoWorkflowReferenceSummaryParamsPatch(_0x39eccd, _0xab2906, referenceCounts);
    const _0x42ff68 = buildVideoWorkflowGenerationParamsPatch(_0x39eccd, _0xab2906, _0x385ccc);
    _0x39eccd = {
      ..._0x39eccd,
      ..._0x42ff68,
      ...buildVideoWorkflowDisplayParamsPatch(_0xab2906, _0x42ff68.generationParams, {
        v54FpsOptions: getRhV54FpsOptions()
      })
    };
  }
  const _0x427ddf = (_0x22f1b0, _0x2b9a7a = {}) => renderModelUiSchemaControls(_0xab2906, _0x39eccd, {
    placement: _0x22f1b0,
    ..._0x2b9a7a
  });
  const _0x4a7c70 = [];
  if (_0x4d951a) {
    if (hasRunningHubVideoWorkflowUiPlacement(_0xab2906, "mode")) {
      _0x4a7c70.push(wrapSchemaPlacement("ui-schema-mode-slot", _0x427ddf("mode")));
    }
    if (hasRunningHubVideoWorkflowUiPlacement(_0xab2906, "videoParams")) {
      _0x4a7c70.push(wrapSchemaPlacement("ui-schema-video-params-slot", _0x427ddf("videoParams", {
        unwrap: true,
        rhVideoFpsOptions: getRunningHubVideoWorkflowFpsOptions(_0xab2906, {
          v54FpsOptions: getRhV54FpsOptions()
        })
      })));
    }
    if (hasRunningHubVideoWorkflowUiPlacement(_0xab2906, "resolution")) {
      _0x4a7c70.push(wrapSchemaPlacement("ui-schema-resolution-slot", _0x427ddf("resolution")));
    }
    _0x4a7c70.push(wrapSchemaPlacement("ui-schema-instance-slot", _0x427ddf("instance", {
      variant: "instanceToggle"
    })));
  } else if (_0x2863ee?.adapterType === "modelApi" && _0x2863ee?.kind === "video") {
    const _0x30f77e = Array.isArray(_0x2863ee?.uiSchema?.footerPlacementOrder) ? _0x2863ee.uiSchema.footerPlacementOrder : [];
    const _0x37aa04 = [..._0x30f77e.filter(_0x1724d0 => DEFAULT_VIDEO_FOOTER_PLACEMENT_ORDER.includes(String(_0x1724d0 || "").trim())), ...DEFAULT_VIDEO_FOOTER_PLACEMENT_ORDER].filter((_0x301a53, _0xac2d6b, _0x556e07) => _0x556e07.indexOf(_0x301a53) === _0xac2d6b);
    _0x37aa04.forEach(_0x169941 => {
      _0x4a7c70.push(wrapSchemaPlacement("ui-schema-" + _0x169941 + "-slot", _0x427ddf(_0x169941)));
    });
  }
  const _0x6afeec = resolveVideoAdvancedSchemaTarget(_0x39eccd, {
    fallbackNodeData: _0x39eccd,
    buildRunningHubNodeData: _0x3ce92a => _0x3ce92a
  });
  const _0x3239d0 = _0x6afeec ? renderModelUiSchemaControls(_0x6afeec.modelId, _0x6afeec.nodeData, {
    placement: _0x6afeec.placement
  }) : "";
  return {
    kind: _0x4d951a ? "workflow" : "modelApi",
    model: _0xab2906,
    provider: _0x48b80e,
    modelLabel: getDisplayModelName(_0xab2906),
    nodeData: _0x39eccd,
    controlsHtml: _0x4a7c70.join(""),
    advanced: _0x3239d0
  };
}
export function renderAIGenVideoModelSelectorMarkup({
  modelId = "",
  provider = "",
  className = "",
  generationParams = {},
  generationParamsByModel = {},
  uiSchemaFieldState = {},
  providerProfileId = "",
  providerProfileIdByModel = {},
  referenceCounts = {},
  showSchemaControls = true,
  allowedModelIds = [],
  runningHubWorkflowAllowedModelIds = []
} = {}) {
  const _0x486946 = normalizeAllowedModelIds(allowedModelIds);
  const _0x3f0ccf = normalizeAllowedModelIds(runningHubWorkflowAllowedModelIds);
  const _0x3f0010 = resolveRunningHubWorkflowAllowedModelId(resolveAllowedModelId(modelId, _0x486946), _0x3f0ccf);
  const _0x395a7d = {
    model: _0x3f0010,
    provider: provider,
    generationParams: getPlainObject(generationParams),
    generationParamsByModel: getPlainObject(generationParamsByModel),
    uiSchemaFieldState: getPlainObject(uiSchemaFieldState),
    providerProfileId: String(providerProfileId || "").trim(),
    providerProfileIdByModel: getPlainObject(providerProfileIdByModel)
  };
  const _0x158daf = resolveVideoSelectorSchemaLayout(_0x3f0010, _0x395a7d, {
    referenceCounts: referenceCounts
  });
  return "<div class=\"img-model-pills aigen-video-model-selector " + escapeHtml(className) + "\" data-aigen-video-model-selector>\n    <div class=\"img-model-wrap\">\n      " + renderNodeModelTrigger({
    iconHtml: renderVideoModelTriggerIconHTML({
      model: _0x158daf.model,
      provider: _0x158daf.provider,
      providersMeta: PROVIDERS_META
    }),
    label: _0x158daf.modelLabel
  }) + "\n      " + buildVideoModelMenuHTML({
    activeModel: _0x158daf.model,
    provider: _0x158daf.provider,
    allowedModelIds: _0x486946,
    runningHubWorkflowAllowedModelIds: _0x3f0ccf
  }) + "\n    </div>\n    " + (showSchemaControls ? "<div class=\"aigen-video-schema-controls\">" + _0x158daf.controlsHtml + "</div>\n    " + renderVideoAdvancedControlsMarkup(_0x158daf.advanced) : "") + "\n  </div>";
}
function createVideoModelMenuPortal({
  menu: _0x180128,
  trigger: _0x1a2601,
  host: _0x50b2ab,
  documentObject: _0x299054,
  windowObject: _0x2085ae,
  submenuPlacement = "viewport-auto"
} = {}) {
  return createFloatingModelMenuPortal({
    menu: _0x180128,
    trigger: _0x1a2601,
    host: _0x50b2ab,
    documentObject: _0x299054,
    windowObject: _0x2085ae,
    portalClass: "aigen-video-model-menu-portal",
    submenuPlacement: submenuPlacement
  });
}
function createSchemaPopupViewportPositioner({
  selector: _0x457f27,
  documentObject: _0x41deaa,
  windowObject: _0x4e0bed,
  placement = "inline"
} = {}) {
  if (!_0x457f27 || placement !== "viewport-auto-up") {
    return {
      destroy() {}
    };
  }
  let _0x305299 = null;
  let _0x4ecbcb = null;
  let _0x4ae38f = 0;
  const _0x1bca70 = 16;
  const _0x203af8 = 8;
  const _0x5bed45 = () => {
    _0x4ae38f = 0;
    if (!_0x305299?.isConnected || !_0x305299.classList?.contains?.("show")) {
      return;
    }
    const _0x146c02 = _0x4ecbcb?.querySelector?.("[data-ui-schema-menu-trigger]") || _0x4ecbcb;
    const _0x3b5404 = _0x146c02?.getBoundingClientRect?.();
    const _0x481823 = _0x305299.getBoundingClientRect?.();
    const _0x4fb41d = Number(_0x4e0bed?.innerWidth) || Number(_0x41deaa?.documentElement?.clientWidth) || 0;
    const _0x489663 = Number(_0x4e0bed?.innerHeight) || Number(_0x41deaa?.documentElement?.clientHeight) || 0;
    if (!_0x3b5404 || !_0x481823 || _0x4fb41d <= 0 || _0x489663 <= 0) {
      return;
    }
    const _0x43e240 = Math.max(_0x1bca70, _0x4fb41d - _0x1bca70 - _0x481823.width);
    const _0x260cf0 = Math.min(Math.max(_0x3b5404.right - _0x481823.width, _0x1bca70), _0x43e240);
    const _0x12502d = Math.max(_0x1bca70, _0x489663 - _0x1bca70 - _0x481823.height);
    const _0x559a1f = _0x3b5404.top - _0x203af8 - _0x481823.height;
    const _0x45e320 = _0x3b5404.bottom + _0x203af8;
    const _0x15f00e = _0x559a1f >= _0x1bca70 ? Math.min(_0x559a1f, _0x12502d) : Math.min(Math.max(_0x45e320, _0x1bca70), _0x12502d);
    _0x305299.style?.setProperty?.("position", "fixed");
    _0x305299.style?.setProperty?.("left", Math.round(_0x260cf0) + "px");
    _0x305299.style?.setProperty?.("top", Math.round(_0x15f00e) + "px");
    _0x305299.style?.setProperty?.("right", "auto");
    _0x305299.style?.setProperty?.("bottom", "auto");
  };
  const _0x23e4ce = () => {
    if (_0x4ae38f) {
      _0x4e0bed?.cancelAnimationFrame?.(_0x4ae38f);
    }
    const _0x55395e = _0x4e0bed?.requestAnimationFrame?.bind?.(_0x4e0bed) || (_0x2fd798 => _0x4e0bed?.setTimeout?.(_0x2fd798, 0));
    _0x4ae38f = _0x55395e(_0x5bed45);
  };
  const _0x566e45 = _0x241030 => {
    const _0x162235 = _0x241030?.detail?.popup || null;
    const _0x2eb55c = _0x241030?.detail?.fieldEl || null;
    if (!_0x162235 || !_0x2eb55c || !_0x457f27.contains?.(_0x2eb55c)) {
      return;
    }
    if (!_0x241030.detail?.shouldOpen) {
      if (_0x162235 === _0x305299) {
        _0x305299 = null;
        _0x4ecbcb = null;
      }
      return;
    }
    _0x305299 = _0x162235;
    _0x4ecbcb = _0x2eb55c;
    _0x23e4ce();
  };
  _0x457f27.addEventListener?.("ui-schema-menu-before-open", _0x566e45);
  _0x41deaa?.addEventListener?.("scroll", _0x23e4ce, true);
  _0x4e0bed?.addEventListener?.("resize", _0x23e4ce);
  return {
    destroy() {
      if (_0x4ae38f) {
        _0x4e0bed?.cancelAnimationFrame?.(_0x4ae38f);
        _0x4ae38f = 0;
      }
      _0x457f27.removeEventListener?.("ui-schema-menu-before-open", _0x566e45);
      _0x41deaa?.removeEventListener?.("scroll", _0x23e4ce, true);
      _0x4e0bed?.removeEventListener?.("resize", _0x23e4ce);
      _0x305299 = null;
      _0x4ecbcb = null;
    }
  };
}
export function bindAIGenVideoModelSelector(_0x294f5b, {
  modelId = "",
  provider = "",
  generationParams = {},
  generationParamsByModel = {},
  uiSchemaFieldState = {},
  providerProfileId = "",
  providerProfileIdByModel = {},
  referenceCounts = {},
  showSchemaControls = true,
  allowedModelIds = [],
  runningHubWorkflowAllowedModelIds = [],
  onChange: _0xad9e85,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  floatingMenuHost = null,
  modelSubmenuPlacement = "viewport-auto",
  schemaPopupPlacement = "inline"
} = {}) {
  const _0x440ab1 = _0x294f5b?.matches?.("[data-aigen-video-model-selector]") ? _0x294f5b : _0x294f5b?.querySelector?.("[data-aigen-video-model-selector]");
  if (!_0x440ab1 || !documentObject) {
    return {
      destroy() {}
    };
  }
  const _0x3c1e04 = _0x440ab1.querySelector(".img-model-btn-trigger");
  const _0x24aa6d = _0x440ab1.querySelector(".img-model-label");
  const _0x154b88 = _0x440ab1.querySelector(".img-model-menu");
  const _0x55a6d5 = createVideoModelMenuPortal({
    menu: _0x154b88,
    trigger: _0x3c1e04,
    host: floatingMenuHost,
    documentObject: documentObject,
    windowObject: windowObject,
    submenuPlacement: modelSubmenuPlacement
  });
  const _0x3aac65 = createSchemaPopupViewportPositioner({
    selector: _0x440ab1,
    documentObject: documentObject,
    windowObject: windowObject,
    placement: schemaPopupPlacement
  });
  const _0x414368 = createFloatingUiSchemaPopupPortal({
    selector: _0x440ab1,
    host: floatingMenuHost,
    documentObject: documentObject,
    windowObject: windowObject,
    placement: schemaPopupPlacement
  });
  const _0x523d4e = "standalone-video-model-selector";
  const _0x1e95a1 = normalizeAllowedModelIds(allowedModelIds);
  const _0x4e6a4c = normalizeAllowedModelIds(runningHubWorkflowAllowedModelIds);
  let _0x4e0f9f = resolveRunningHubWorkflowAllowedModelId(resolveAllowedModelId(modelId, _0x1e95a1), _0x4e6a4c);
  let _0x548189 = String(provider || "").trim();
  let _0x45616d = {
    model: _0x4e0f9f,
    provider: _0x548189,
    generationParams: getPlainObject(generationParams),
    generationParamsByModel: getPlainObject(generationParamsByModel),
    uiSchemaFieldState: getPlainObject(uiSchemaFieldState),
    providerProfileId: String(providerProfileId || "").trim(),
    providerProfileIdByModel: getPlainObject(providerProfileIdByModel)
  };
  const _0x4e341a = normalizeReferenceCounts(referenceCounts);
  let _0x5cdf63 = resolveVideoSelectorSchemaLayout(_0x4e0f9f, _0x45616d, {
    referenceCounts: _0x4e341a
  });
  let _0x365317 = null;
  let _0x4073ce = "";
  let _0x38e810 = null;
  const _0x4ea14e = () => {
    const _0x371fb3 = documentObject.createElement("template");
    _0x371fb3.innerHTML = buildVideoModelMenuHTML({
      activeModel: _0x5cdf63?.model || _0x4e0f9f,
      provider: _0x5cdf63?.provider || _0x548189,
      subscriptionState: typeof windowObject?.getSubscriptionState === "function" ? windowObject.getSubscriptionState() : {},
      allowedModelIds: _0x1e95a1,
      runningHubWorkflowAllowedModelIds: _0x4e6a4c
    }).trim();
    const _0x32d274 = _0x371fb3.content.firstElementChild;
    if (_0x154b88 && _0x32d274) {
      _0x154b88.innerHTML = _0x32d274.innerHTML;
    }
    _0x38e810?.();
    _0x38e810 = bindNodeSubmenus(_0x154b88);
    syncModelCredentialMenu(_0x154b88, {
      documentObject: documentObject,
      getProviderProfileId: () => String(_0x45616d.providerProfileId || "").trim()
    });
  };
  const _0x4e262f = () => {
    if (_0x24aa6d) {
      _0x24aa6d.textContent = _0x5cdf63?.modelLabel || getDisplayModelName(_0x4e0f9f);
    }
    const _0x446ff5 = documentObject.createElement("template");
    _0x446ff5.innerHTML = renderVideoModelTriggerIconHTML({
      model: _0x5cdf63?.model || _0x4e0f9f,
      provider: _0x5cdf63?.provider || _0x548189,
      providersMeta: PROVIDERS_META
    }).trim();
    const _0x1d31c1 = _0x446ff5.content.firstElementChild;
    if (_0x1d31c1 && _0x3c1e04?.firstElementChild) {
      _0x3c1e04.firstElementChild.replaceWith(_0x1d31c1);
    }
  };
  const _0x246e2e = {
    getState: () => ({
      nodes: {
        [_0x523d4e]: _0x45616d
      }
    }),
    getIncomingEdges: () => [],
    updateNodeData: (_0x476993, _0x1885e8 = {}) => {
      _0x45616d = {
        ..._0x45616d,
        ..._0x1885e8
      };
      _0x4e0f9f = String(_0x45616d.model || _0x4e0f9f).trim();
      _0x548189 = String(_0x45616d.provider || _0x548189).trim();
      const _0x1007a9 = buildUiSchemaVisibilitySignature(_0x4e0f9f, _0x45616d);
      if (_0x1885e8?.model || _0x1007a9 !== _0x4073ce) {
        _0x2b02cf();
      } else {
        _0x5cdf63 = resolveVideoSelectorSchemaLayout(_0x4e0f9f, _0x45616d, {
          referenceCounts: _0x4e341a
        });
        _0x4e262f();
      }
      _0xad9e85?.({
        modelId: _0x4e0f9f,
        provider: _0x548189,
        generationParams: getPlainObject(_0x45616d.generationParams),
        generationParamsByModel: getPlainObject(_0x45616d.generationParamsByModel),
        providerProfileId: String(_0x45616d.providerProfileId || "").trim(),
        providerProfileIdByModel: getPlainObject(_0x45616d.providerProfileIdByModel),
        patch: {
          ..._0x1885e8
        }
      });
    }
  };
  const _0x2b02cf = () => {
    if (!showSchemaControls) {
      return;
    }
    _0x414368.close();
    _0x5cdf63 = resolveVideoSelectorSchemaLayout(_0x4e0f9f, _0x45616d, {
      referenceCounts: _0x4e341a
    });
    _0x45616d = {
      ..._0x45616d,
      ..._0x5cdf63.nodeData,
      generationParamsByModel: getPlainObject(_0x5cdf63.nodeData?.generationParamsByModel || _0x45616d.generationParamsByModel)
    };
    _0x4e0f9f = String(_0x5cdf63.model || _0x4e0f9f).trim();
    _0x548189 = String(_0x5cdf63.provider || _0x548189).trim();
    _0x4073ce = buildUiSchemaVisibilitySignature(_0x4e0f9f, _0x45616d);
    _0x4e262f();
    const _0x221122 = _0x440ab1.querySelector(".aigen-video-schema-controls");
    if (_0x221122) {
      _0x221122.innerHTML = _0x5cdf63.controlsHtml;
    }
    _0x440ab1.querySelectorAll(":scope > .rh-adv-wrap, :scope > .rh-vram-adv-panel").forEach(_0x50db5d => _0x50db5d.remove());
    if (_0x221122 && _0x5cdf63.advanced) {
      _0x221122.insertAdjacentHTML("afterend", renderVideoAdvancedControlsMarkup(_0x5cdf63.advanced));
    }
    _0x365317?.();
    if (_0x5cdf63.kind === "dreamina") {
      _0x365317 = bindUiSchemaFieldControls(_0x440ab1, {
        getNodeData: () => _0x45616d,
        commitFieldValue: (_0x6d47b1, _0x78ac8c, _0x2c8eea) => {
          const _0x2d517c = String(_0x6d47b1 || "").trim();
          const _0x2a0bca = getDreaminaEffectiveNodeData(_0x2c8eea);
          const _0x6e5dc2 = resolveDreaminaStyleVideoProvider(_0x2a0bca.model, _0x2a0bca.provider);
          const _0x3af1ef = _0x2d517c === "dreaminaRouteMode" ? normalizeDreaminaVideoRouteMode(_0x78ac8c) : normalizeDreaminaVideoRouteMode(_0x2a0bca.dreaminaRouteMode, _0x2a0bca.mode);
          const _0x38f610 = resolveDreaminaVideoTaskType({
            routeMode: _0x3af1ef,
            ..._0x4e341a
          });
          let _0xa2a49a;
          if (_0x2d517c === "dreaminaRouteMode") {
            const _0x13219b = ensureDreaminaStyleVideoModelForTask(_0x38f610, _0x2a0bca.model, _0x6e5dc2);
            _0xa2a49a = {
              ...buildDreaminaModelSelectionParamPatch({
                ..._0x2a0bca,
                generationParams: {
                  ...getPlainObject(_0x2a0bca.generationParams),
                  dreaminaRouteMode: _0x3af1ef
                }
              }, {
                model: _0x13219b,
                provider: _0x6e5dc2,
                taskType: _0x38f610,
                fallbackValues: {
                  dreaminaRouteMode: _0x3af1ef
                }
              }),
              model: _0x13219b,
              provider: _0x6e5dc2
            };
          } else {
            let _0x5cc8c9 = _0x78ac8c;
            if (_0x2d517c === "resolution") {
              _0x5cc8c9 = normalizeDreaminaStyleVideoResolution(_0x38f610, _0x2a0bca.model, _0x78ac8c, _0x6e5dc2);
            } else if (_0x2d517c === "duration") {
              _0x5cc8c9 = normalizeDreaminaStyleVideoDuration(_0x38f610, _0x2a0bca.model, _0x78ac8c, _0x6e5dc2);
            } else if (_0x2d517c === "aspectRatio") {
              _0x5cc8c9 = normalizeDreaminaVideoAspectRatio(_0x78ac8c, {
                preserveAdaptive: true
              });
            }
            _0xa2a49a = buildDreaminaParamPatch(_0x2a0bca, {
              [_0x2d517c]: _0x5cc8c9
            });
          }
          _0x246e2e.updateNodeData(_0x523d4e, _0xa2a49a);
          return _0x45616d;
        }
      });
    } else {
      _0x365317 = bindModelUiSchemaControls(_0x440ab1, {
        nodeId: _0x523d4e,
        nodeData: _0x45616d,
        store: _0x246e2e,
        buildPatch: (_0x12ac9b, _0x2de426, _0x212112, _0x232209) => buildRhWorkflowFieldPatch(_0x12ac9b, _0x2de426, _0x212112, _0x232209)
      });
    }
  };
  const _0x418cee = _0x2f352b => _0x2f352b.stopPropagation();
  const _0x33a1b5 = _0x3a4ba0 => {
    _0x3a4ba0.stopPropagation();
    const _0x4fb7fd = !_0x55a6d5.isOpen();
    _0x414368.close();
    closeNodeFooterMenus(_0x440ab1, _0x154b88);
    if (_0x4fb7fd) {
      _0x4ea14e();
      _0x55a6d5.open();
      activateMenuKeyboard(_0x154b88);
    } else {
      _0x55a6d5.close();
    }
  };
  const _0x1069da = _0x32b577 => {
    const _0x3993e1 = _0x32b577.target.closest?.(".node-menu-item[data-value]");
    if (!_0x3993e1 || _0x3993e1.dataset.disabled === "true") {
      return;
    }
    const _0x4c7ab6 = String(_0x3993e1.dataset.value || "").trim();
    if (!_0x4c7ab6) {
      return;
    }
    if (_0x1e95a1.length && !_0x1e95a1.includes(_0x4c7ab6)) {
      return;
    }
    const _0x313566 = getModelManifest(_0x4c7ab6);
    if (_0x4e6a4c.length && _0x313566?.provider === "runninghubwf" && _0x313566?.adapterType === "workflow" && !_0x4e6a4c.includes(_0x4c7ab6)) {
      return;
    }
    const _0x59bd06 = resolveModelProvider(_0x4c7ab6, _0x3993e1.dataset.provider || _0x548189);
    if (getModelManifest(_0x4c7ab6)?.vip === true && typeof windowObject?.isModelAllowedBySubscription === "function" && !windowObject.isModelAllowedBySubscription(_0x4c7ab6, _0x59bd06)) {
      windowObject.openSubscriptionDialog?.({
        modelId: _0x4c7ab6,
        provider: _0x59bd06
      });
      return;
    }
    let _0x204afa;
    if (isDreaminaStyleVideoModel(_0x4c7ab6, _0x59bd06)) {
      const _0x449c40 = getDreaminaEffectiveNodeData(_0x45616d);
      const _0x27c13c = normalizeDreaminaVideoRouteMode(_0x449c40.dreaminaRouteMode, _0x449c40.mode);
      const _0x1e7de3 = resolveDreaminaVideoTaskType({
        routeMode: _0x27c13c,
        ..._0x4e341a
      });
      const _0x2edad4 = ensureDreaminaStyleVideoModelForTask(_0x1e7de3, _0x4c7ab6, _0x59bd06);
      _0x204afa = {
        ...buildDreaminaModelSelectionParamPatch(_0x45616d, {
          model: _0x2edad4,
          provider: _0x59bd06,
          taskType: _0x1e7de3
        }),
        model: _0x2edad4,
        provider: _0x59bd06
      };
    } else {
      _0x204afa = isRunningHubVideoWorkflowManifest(_0x4c7ab6) ? buildVideoWorkflowModelSelectionPatch(_0x45616d, _0x4c7ab6) : buildVideoModelApiModelSelectionPatch(_0x45616d, _0x4c7ab6, _0x59bd06);
    }
    const _0x54b5a4 = buildModelProviderProfileSelectionPatch(_0x45616d, _0x204afa.model || _0x4c7ab6, _0x3993e1.dataset.credentialResolvedProviderProfileId);
    _0x246e2e.updateNodeData(_0x523d4e, {
      ..._0x204afa,
      ..._0x54b5a4,
      model: _0x204afa.model || _0x4c7ab6,
      provider: _0x204afa.provider || _0x59bd06
    });
    _0x55a6d5.close();
    _0x4ea14e();
  };
  const _0x21c725 = _0x2bdb74 => {
    const _0x28b760 = _0x2bdb74.target.closest?.(".dreamina-task-model-btn");
    if (_0x28b760) {
      _0x2bdb74.stopPropagation();
      const _0x20ffe9 = _0x28b760.parentElement?.querySelector?.(".dreamina-task-model-menu");
      const _0x4a9cf0 = !_0x20ffe9?.classList.contains("show");
      closeNodeFooterMenus(_0x440ab1, _0x20ffe9);
      _0x20ffe9?.classList.toggle("show", _0x4a9cf0);
      if (_0x4a9cf0) {
        activateMenuKeyboard(_0x20ffe9);
      }
      return;
    }
    const _0x44696e = _0x2bdb74.target.closest?.(".dreamina-task-model-menu .node-menu-item[data-value]");
    if (!_0x44696e || _0x44696e.dataset.disabled === "true") {
      return;
    }
    _0x2bdb74.stopPropagation();
    const _0x28f460 = String(_0x44696e.dataset.value || "").trim();
    if (!_0x28f460) {
      return;
    }
    const _0x4a7f62 = resolveDreaminaStyleVideoProvider(_0x28f460, _0x44696e.dataset.provider || _0x548189);
    if (getModelManifest(_0x28f460)?.vip === true && typeof windowObject?.isModelAllowedBySubscription === "function" && !windowObject.isModelAllowedBySubscription(_0x28f460, _0x4a7f62)) {
      windowObject.openSubscriptionDialog?.({
        modelId: _0x28f460,
        provider: _0x4a7f62
      });
      return;
    }
    const _0x3506d0 = _0x5cdf63?.taskType || resolveDreaminaVideoTaskType({
      routeMode: _0x45616d?.generationParams?.dreaminaRouteMode,
      ..._0x4e341a
    });
    _0x246e2e.updateNodeData(_0x523d4e, {
      ...buildDreaminaModelSelectionParamPatch(_0x45616d, {
        model: _0x28f460,
        provider: _0x4a7f62,
        taskType: _0x3506d0
      }),
      ...buildModelProviderProfileSelectionPatch(_0x45616d, _0x28f460),
      model: _0x28f460,
      provider: _0x4a7f62
    });
    _0x4ea14e();
  };
  const _0x42cb1d = _0x40b31b => {
    const _0x4efc7f = _0x40b31b.target.closest?.(".rh-adv2-btn");
    if (!_0x4efc7f || !_0x440ab1.contains(_0x4efc7f)) {
      return;
    }
    _0x40b31b.stopPropagation();
    const _0x2acc41 = _0x440ab1.querySelector(".rh-vram-adv-panel");
    _0x414368.close();
    closeNodeFooterMenus(_0x440ab1, _0x2acc41);
    _0x2acc41?.classList.toggle("show");
    _0x55a6d5.close();
  };
  const _0xd3900d = _0x210d1c => {
    if (_0x440ab1.contains(_0x210d1c.target) || _0x55a6d5.contains(_0x210d1c.target) || _0x414368.contains(_0x210d1c.target)) {
      return;
    }
    _0x55a6d5.close();
    _0x414368.close();
    closeNodeFooterMenus(_0x440ab1);
  };
  const _0x506f02 = () => _0x55a6d5.close();
  _0x440ab1.addEventListener("pointerdown", _0x418cee);
  _0x154b88?.addEventListener("pointerdown", _0x418cee);
  _0x3c1e04?.addEventListener("click", _0x33a1b5);
  _0x154b88?.addEventListener("click", _0x1069da);
  _0x440ab1.addEventListener("click", _0x21c725);
  _0x440ab1.addEventListener("click", _0x42cb1d);
  _0x440ab1.addEventListener("ui-schema-menu-before-open", _0x506f02);
  documentObject.addEventListener("click", _0xd3900d);
  const _0x50c6e9 = bindModelCredentialMenu(_0x154b88, {
    documentObject: documentObject,
    getProviderProfileId: () => String(_0x45616d.providerProfileId || "").trim()
  });
  _0x4ea14e();
  _0x2b02cf();
  return {
    applyProviderProfilePatch(_0x530d39 = {}) {
      _0x246e2e.updateNodeData(_0x523d4e, {
        providerProfileId: String(_0x530d39.providerProfileId || "").trim(),
        providerProfileIdByModel: getPlainObject(_0x530d39.providerProfileIdByModel || _0x45616d.providerProfileIdByModel)
      });
      syncModelCredentialMenu(_0x154b88, {
        documentObject: documentObject,
        getProviderProfileId: () => String(_0x45616d.providerProfileId || "").trim()
      });
      return true;
    },
    destroy() {
      _0x414368.destroy();
      _0x365317?.();
      _0x38e810?.();
      _0x50c6e9?.();
      _0x55a6d5.destroy();
      _0x3aac65.destroy();
      _0x440ab1.removeEventListener("pointerdown", _0x418cee);
      _0x154b88?.removeEventListener("pointerdown", _0x418cee);
      _0x3c1e04?.removeEventListener("click", _0x33a1b5);
      _0x154b88?.removeEventListener("click", _0x1069da);
      _0x440ab1.removeEventListener("click", _0x21c725);
      _0x440ab1.removeEventListener("click", _0x42cb1d);
      _0x440ab1.removeEventListener("ui-schema-menu-before-open", _0x506f02);
      documentObject.removeEventListener("click", _0xd3900d);
    }
  };
}