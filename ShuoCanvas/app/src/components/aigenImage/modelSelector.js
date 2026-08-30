import { getDisplayModelName } from "../../modules/providers.js";
import { activateMenuKeyboard } from "../../modules/floatingMenuKeyboard.js";
import { getModelManifest } from "../../manifests/index.js";
import { t } from "../../i18n/index.js";
import { bindDreaminaImageMenu } from "./dreaminaModelMenuHelper.js";
import { bindModelUiSchemaControls, buildModelUiSchemaDefaultParams, renderModelUiSchemaControls, sanitizeModelUiSchemaParams } from "./uiSchemaRenderer.js";
import { buildUiSchemaVisibilitySignature } from "./uiSchemaVisibility.js";
import { closeNodeFooterMenus, createFloatingModelMenuPortal, createFloatingUiSchemaPopupPortal } from "../shared/nodeFooterControls.js";
import { buildModelProviderProfileSelectionPatch } from "../../modules/modelProviderProfileSelection.js";
import { bindModelCredentialMenu } from "../../modules/modelCredentialUi.js";
import { bindImageModelMenuSubmenu, buildImageModelMenuHTML, resolveApimartImageMenuSelection, resolveGrsaiImageMenuSelection, resolveRunningHubModelImageMenuSelection, resolveRunningHubWorkflowImageMenuSelection, resolveVolcengineImageMenuSelection, renderImageModelTriggerIconHTML } from "./uiModuleModelHelpers.js";
function escapeHtml(_0x1b58b0) {
  return String(_0x1b58b0 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function getPlainObject(_0x592d06) {
  if (_0x592d06 && typeof _0x592d06 === "object" && !Array.isArray(_0x592d06)) {
    return {
      ..._0x592d06
    };
  } else {
    return {};
  }
}
function renderStandaloneSchemaControls(_0x312e3c, _0x2ddded = {}) {
  const _0xcc8f68 = renderModelUiSchemaControls(_0x312e3c, _0x2ddded, {
    placement: "mode",
    variant: "pillMenu"
  });
  const _0x24cb7e = renderModelUiSchemaControls(_0x312e3c, _0x2ddded, {
    placement: "resolution",
    variant: "resolutionPill"
  });
  const _0x2bb0ba = renderModelUiSchemaControls(_0x312e3c, _0x2ddded, {
    placement: "advanced",
    variant: "advancedRow"
  });
  const _0xd1ef8 = renderModelUiSchemaControls(_0x312e3c, _0x2ddded, {
    placement: "instance",
    variant: "instanceToggle"
  });
  return {
    mode: _0xcc8f68,
    resolution: _0x24cb7e,
    advanced: _0x2bb0ba,
    instance: _0xd1ef8
  };
}
export function renderAIGenImageModelSelectorMarkup({
  modelId = "",
  provider = "",
  className = "",
  generationParams = {},
  providerProfileId = "",
  providerProfileIdByModel = {},
  showSchemaControls = false
} = {}) {
  const _0x3ec1dd = String(modelId || "").trim();
  const _0x491e3d = {
    model: _0x3ec1dd,
    provider: provider,
    generationParams: getPlainObject(generationParams),
    providerProfileId: String(providerProfileId || "").trim(),
    providerProfileIdByModel: getPlainObject(providerProfileIdByModel)
  };
  const _0x57ac8b = showSchemaControls ? renderStandaloneSchemaControls(_0x3ec1dd, _0x491e3d) : {
    mode: "",
    resolution: "",
    advanced: "",
    instance: ""
  };
  return "<div class=\"img-model-pills aigen-image-model-selector " + escapeHtml(className) + "\" data-aigen-image-model-selector>\n    <div class=\"img-model-wrap\">\n      <button type=\"button\" class=\"img-pill-btn img-model-btn-trigger\">\n        " + renderImageModelTriggerIconHTML({
    model: _0x3ec1dd,
    provider: provider
  }) + "\n        <span class=\"img-model-label\">" + escapeHtml(getDisplayModelName(_0x3ec1dd)) + "</span>\n      </button>\n      " + buildImageModelMenuHTML({
    activeModel: _0x3ec1dd
  }) + "\n    </div>\n    " + (showSchemaControls ? "<div class=\"ui-schema-placement ui-schema-mode-slot\" style=\"" + (_0x57ac8b.mode ? "" : "display:none;") + "\">" + _0x57ac8b.mode + "</div>\n    <div class=\"ui-schema-placement ui-schema-resolution-slot\" style=\"" + (_0x57ac8b.resolution ? "" : "display:none;") + "\">" + _0x57ac8b.resolution + "</div>\n    <div class=\"rh-adv-wrap\" style=\"position:relative;" + (_0x57ac8b.advanced ? "" : "display:none;") + "\">\n      <button type=\"button\" class=\"img-pill-btn rh-adv-btn\"><span class=\"rh-adv-btn-label\">" + escapeHtml(t("aigenImage.controls.advancedSettings")) + "</span></button>\n    </div>\n    <div class=\"ui-schema-placement ui-schema-instance-slot\" style=\"" + (_0x57ac8b.instance ? "" : "display:none;") + "\">" + _0x57ac8b.instance + "</div>\n    <div class=\"rh-adv-panel\">" + _0x57ac8b.advanced + "</div>" : "") + "\n  </div>";
}
export function bindAIGenImageModelSelector(_0x387f18, {
  modelId = "",
  provider = "",
  generationParams = {},
  generationParamsByModel = {},
  providerProfileId = "",
  providerProfileIdByModel = {},
  showSchemaControls = false,
  onChange: _0x4b400d,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  floatingMenuHost = null,
  modelSubmenuPlacement = "viewport-auto",
  schemaPopupPlacement = "inline"
} = {}) {
  const _0x5d48e8 = _0x387f18?.matches?.("[data-aigen-image-model-selector]") ? _0x387f18 : _0x387f18?.querySelector?.("[data-aigen-image-model-selector]");
  if (!_0x5d48e8 || !documentObject) {
    return {
      destroy() {}
    };
  }
  const _0x58c895 = _0x5d48e8.querySelector(".img-model-btn-trigger");
  const _0x4da5c9 = _0x5d48e8.querySelector(".img-model-label");
  const _0x2035b9 = _0x5d48e8.querySelector(".img-model-menu");
  const _0x53fd56 = createFloatingModelMenuPortal({
    menu: _0x2035b9,
    trigger: _0x58c895,
    host: floatingMenuHost,
    documentObject: documentObject,
    windowObject: windowObject,
    portalClass: "aigen-image-model-menu-portal",
    submenuPlacement: modelSubmenuPlacement
  });
  const _0x198128 = createFloatingUiSchemaPopupPortal({
    selector: _0x5d48e8,
    host: floatingMenuHost,
    documentObject: documentObject,
    windowObject: windowObject,
    placement: schemaPopupPlacement,
    contextClass: "aigen-image-menu-context"
  });
  let _0x4256f1 = String(modelId || "").trim();
  let _0xa1c28f = String(provider || "").trim();
  const _0xffce81 = "standalone-image-model-selector";
  let _0x3d33cb = {
    model: _0x4256f1,
    provider: _0xa1c28f,
    generationParams: getPlainObject(generationParams),
    generationParamsByModel: getPlainObject(generationParamsByModel),
    providerProfileId: String(providerProfileId || "").trim(),
    providerProfileIdByModel: getPlainObject(providerProfileIdByModel)
  };
  let _0x146afc = null;
  let _0x39cacb = "";
  const _0x558b59 = () => {
    if (_0x4da5c9) {
      _0x4da5c9.textContent = getDisplayModelName(_0x4256f1);
    }
    const _0x3f6572 = documentObject.createElement("template");
    _0x3f6572.innerHTML = renderImageModelTriggerIconHTML({
      model: _0x4256f1,
      provider: _0xa1c28f
    }).trim();
    const _0x48f961 = _0x3f6572.content.firstElementChild;
    if (_0x48f961 && _0x58c895?.firstElementChild) {
      _0x58c895.firstElementChild.replaceWith(_0x48f961);
    }
  };
  const _0x1eaf05 = _0x49abda => _0x49abda.stopPropagation();
  const _0x230f3e = () => {
    _0x198128.close();
    _0x5d48e8.querySelectorAll(".ui-schema-floating-menu").forEach(_0x5c1cae => _0x5c1cae.classList.remove("show"));
    _0x5d48e8.querySelectorAll(".ui-schema-popup").forEach(_0x4025f8 => {
      _0x4025f8.style.display = "none";
    });
  };
  const _0x310736 = _0x1f369a => {
    _0x1f369a.stopPropagation();
    const _0x3b8786 = !_0x53fd56.isOpen();
    _0x230f3e();
    _0x5d48e8.querySelector(".rh-adv-panel")?.classList.remove("show");
    if (_0x3b8786) {
      _0x53fd56.open();
      activateMenuKeyboard(_0x2035b9);
    } else {
      _0x53fd56.close();
    }
  };
  const _0x418307 = _0x3f83f8 => {
    if (_0x5d48e8.contains(_0x3f83f8.target) || _0x53fd56.contains(_0x3f83f8.target) || _0x198128.contains(_0x3f83f8.target)) {
      return;
    }
    _0x53fd56.close();
    _0x230f3e();
    _0x5d48e8.querySelector(".rh-adv-panel")?.classList.remove("show");
  };
  const _0x4532c3 = (_0x5e568b, _0x8d7b66, _0x16c28e, _0x5235ed = {}) => {
    const _0x42b236 = String(_0x5e568b?.model || "").trim();
    const _0x21f186 = String(_0x8d7b66 || "").trim();
    const _0x4ea3a4 = getPlainObject(_0x5e568b?.generationParamsByModel);
    if (_0x42b236) {
      _0x4ea3a4[_0x42b236] = getPlainObject(_0x5e568b?.generationParams);
    }
    const _0x229405 = _0x21f186 ? _0x4ea3a4[_0x21f186] : undefined;
    const _0x856e62 = buildModelUiSchemaDefaultParams(_0x21f186);
    const _0x3cf330 = new Set((getModelManifest(_0x21f186)?.uiSchema?.fields || []).map(_0x4aeef8 => String(_0x4aeef8?.id || "").trim()));
    const _0x5163e3 = {};
    _0x3cf330.forEach(_0x4acc8f => {
      if (Object.prototype.hasOwnProperty.call(_0x5235ed, _0x4acc8f)) {
        _0x5163e3[_0x4acc8f] = _0x5235ed[_0x4acc8f];
      }
    });
    const _0x1d50a2 = sanitizeModelUiSchemaParams(_0x21f186, {
      ..._0x856e62,
      ...getPlainObject(_0x229405),
      ...getPlainObject(_0x5235ed.generationParams),
      ..._0x5163e3
    });
    const {
      generationParams: _0xe86d7c,
      ..._0x39ab20
    } = _0x5235ed;
    _0x3cf330.forEach(_0x371c23 => delete _0x39ab20[_0x371c23]);
    const _0x5e6b01 = buildModelProviderProfileSelectionPatch(_0x5e568b, _0x21f186, _0x5235ed?.providerProfileId);
    return {
      ..._0x39ab20,
      ..._0x5e6b01,
      model: _0x21f186,
      provider: _0x16c28e,
      generationParams: _0x1d50a2,
      generationParamsByModel: _0x4ea3a4
    };
  };
  const _0x2181c2 = () => {
    if (!showSchemaControls) {
      return;
    }
    _0x198128.close();
    _0x39cacb = buildUiSchemaVisibilitySignature(_0x4256f1, _0x3d33cb);
    const _0x16c34e = renderStandaloneSchemaControls(_0x4256f1, _0x3d33cb);
    const _0x157eff = (_0x4664cf, _0x3b819a) => {
      const _0x23bc6d = _0x5d48e8.querySelector(_0x4664cf);
      if (!_0x23bc6d) {
        return;
      }
      _0x23bc6d.innerHTML = _0x3b819a;
      _0x23bc6d.style.display = _0x3b819a ? "" : "none";
    };
    _0x157eff(".ui-schema-mode-slot", _0x16c34e.mode);
    _0x157eff(".ui-schema-resolution-slot", _0x16c34e.resolution);
    _0x157eff(".ui-schema-instance-slot", _0x16c34e.instance);
    const _0x151216 = _0x5d48e8.querySelector(".rh-adv-panel");
    if (_0x151216) {
      _0x151216.innerHTML = _0x16c34e.advanced;
    }
    const _0x342d5b = _0x5d48e8.querySelector(".rh-adv-wrap");
    if (_0x342d5b) {
      _0x342d5b.style.display = _0x16c34e.advanced ? "" : "none";
    }
    _0x146afc?.();
    _0x146afc = bindModelUiSchemaControls(_0x5d48e8, {
      nodeId: _0xffce81,
      nodeData: _0x3d33cb,
      store: _0x3cf50b
    });
  };
  const _0x3cf50b = {
    getState: () => ({
      nodes: {
        [_0xffce81]: _0x3d33cb
      }
    }),
    updateNodeData: (_0x2d043a, _0xfab725 = {}) => {
      _0x3d33cb = {
        ..._0x3d33cb,
        ..._0xfab725
      };
      _0x4256f1 = String(_0x3d33cb.model || _0x4256f1).trim();
      _0xa1c28f = String(_0x3d33cb.provider || _0xa1c28f).trim();
      _0x558b59();
      const _0x55cdc8 = buildUiSchemaVisibilitySignature(_0x4256f1, _0x3d33cb);
      if (_0x55cdc8 !== _0x39cacb) {
        _0x2181c2();
      }
      _0x4b400d?.({
        modelId: _0x4256f1,
        provider: _0xa1c28f,
        generationParams: getPlainObject(_0x3d33cb.generationParams),
        generationParamsByModel: getPlainObject(_0x3d33cb.generationParamsByModel),
        providerProfileId: String(_0x3d33cb.providerProfileId || "").trim(),
        providerProfileIdByModel: getPlainObject(_0x3d33cb.providerProfileIdByModel),
        patch: {
          ..._0xfab725
        }
      });
    }
  };
  const _0x32eb33 = ({
    toggleSelector: _0x584a7f,
    submenuSelector: _0x50bd58,
    defaultProvider: _0x5cea50,
    resolveSelection: _0x5582df,
    headerEl: _0x1a551f,
    submenuEl: _0x4c9f40
  }) => bindImageModelMenuSubmenu({
    modelMenu: _0x2035b9,
    modelTrigger: _0x58c895,
    modelLabel: _0x4da5c9,
    nodeId: _0xffce81,
    store: _0x3cf50b,
    fallbackNodeData: _0x3d33cb,
    toggleSelector: _0x584a7f,
    submenuSelector: _0x50bd58,
    defaultProvider: _0x5cea50,
    resolveSelection: _0x5582df,
    buildModelPatch: _0x4532c3,
    headerEl: _0x1a551f,
    submenuEl: _0x4c9f40,
    afterSelect: () => _0x53fd56.close()
  });
  _0x32eb33({
    toggleSelector: "[data-grsai-toggle]",
    submenuSelector: ".grsai-submenu",
    defaultProvider: "grsai",
    resolveSelection: resolveGrsaiImageMenuSelection
  });
  _0x32eb33({
    toggleSelector: "[data-ppio-toggle]",
    submenuSelector: ".ppio-submenu",
    defaultProvider: "ppio"
  });
  bindDreaminaImageMenu({
    modelMenu: _0x2035b9,
    modelTrigger: _0x58c895,
    modelLabel: _0x4da5c9,
    nodeId: _0xffce81,
    store: _0x3cf50b,
    buildModelPatch: _0x4532c3,
    afterSelect: () => _0x53fd56.close()
  });
  _0x32eb33({
    toggleSelector: "[data-apimart-toggle]",
    submenuSelector: ".apimart-submenu",
    defaultProvider: "apimart",
    resolveSelection: resolveApimartImageMenuSelection
  });
  _0x32eb33({
    toggleSelector: "[data-binghuo-image-toggle]",
    submenuSelector: ".binghuo-image-submenu",
    defaultProvider: "binghuo"
  });
  _0x32eb33({
    toggleSelector: "[data-agnes-toggle]",
    submenuSelector: ".agnes-submenu",
    defaultProvider: "agnes"
  });
  _0x32eb33({
    toggleSelector: "[data-volcengine-toggle]",
    submenuSelector: ".volcengine-submenu",
    defaultProvider: "volcengine",
    resolveSelection: resolveVolcengineImageMenuSelection
  });
  _0x32eb33({
    toggleSelector: "[data-rh-ai-app-toggle]",
    submenuSelector: ".rh-ai-app-image-submenu",
    defaultProvider: "runninghubwf"
  });
  _0x32eb33({
    toggleSelector: "[data-comfyui-cloud-workflow-toggle]",
    submenuSelector: ".comfyui-cloud-workflow-submenu",
    defaultProvider: "comfyui"
  });
  _0x32eb33({
    toggleSelector: "[data-comfyui-local-workflow-toggle]",
    submenuSelector: ".comfyui-local-workflow-submenu",
    defaultProvider: "comfyui"
  });
  _0x32eb33({
    toggleSelector: "[data-runninghubwf-toggle]",
    submenuSelector: ".runninghubwf-submenu",
    defaultProvider: "runninghubwf",
    resolveSelection: resolveRunningHubWorkflowImageMenuSelection
  });
  _0x32eb33({
    toggleSelector: "[data-runninghub-toggle]",
    submenuSelector: ".runninghub-submenu",
    defaultProvider: "runninghub",
    resolveSelection: resolveRunningHubModelImageMenuSelection
  });
  _0x2035b9?.querySelectorAll("[data-custom-provider-image-group]").forEach(_0x379c0e => {
    const _0x4bc0c1 = _0x379c0e.dataset.nodeMenuSubmenu || "";
    _0x32eb33({
      headerEl: _0x379c0e,
      submenuEl: _0x4bc0c1 ? _0x2035b9.querySelector(_0x4bc0c1) : null,
      defaultProvider: String(_0x379c0e.dataset.customProviderImageGroup || "")
    });
  });
  const _0x312782 = bindModelCredentialMenu(_0x2035b9, {
    documentObject: documentObject,
    getProviderProfileId: () => String(_0x3d33cb.providerProfileId || _0x3d33cb.rhProviderProfileId || "").trim()
  });
  _0x5d48e8.addEventListener("pointerdown", _0x1eaf05);
  _0x2035b9?.addEventListener("pointerdown", _0x1eaf05);
  _0x58c895?.addEventListener("click", _0x310736);
  const _0x1e77ed = _0x5d48e8.querySelector(".rh-adv-btn");
  const _0x26a775 = _0x5d48e8.querySelector(".rh-adv-panel");
  const _0x2ac0a8 = _0x5e6ef7 => {
    _0x5e6ef7.stopPropagation();
    _0x230f3e();
    _0x26a775?.classList.toggle("show");
    _0x53fd56.close();
  };
  const _0x1c8ac7 = _0x1b24cb => {
    _0x53fd56.close();
    closeNodeFooterMenus(_0x5d48e8, null, {
      preserveAdvPanel: _0x1b24cb?.detail?.fieldEl || null
    });
  };
  _0x1e77ed?.addEventListener("click", _0x2ac0a8);
  _0x26a775?.addEventListener("click", _0x1eaf05);
  _0x5d48e8.addEventListener("ui-schema-menu-before-open", _0x1c8ac7);
  documentObject.addEventListener("click", _0x418307);
  _0x2181c2();
  return {
    destroy() {
      _0x198128.destroy();
      _0x146afc?.();
      _0x312782?.();
      _0x53fd56.destroy();
      _0x5d48e8.removeEventListener("pointerdown", _0x1eaf05);
      _0x2035b9?.removeEventListener("pointerdown", _0x1eaf05);
      _0x58c895?.removeEventListener("click", _0x310736);
      _0x1e77ed?.removeEventListener("click", _0x2ac0a8);
      _0x26a775?.removeEventListener("click", _0x1eaf05);
      _0x5d48e8.removeEventListener("ui-schema-menu-before-open", _0x1c8ac7);
      documentObject.removeEventListener("click", _0x418307);
    }
  };
}