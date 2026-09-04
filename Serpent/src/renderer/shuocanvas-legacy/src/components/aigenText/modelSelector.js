import { onLocaleChange, t } from "../../i18n/index.js";
import { activateMenuKeyboard } from "../../modules/floatingMenuKeyboard.js";
import { bindNodeFooterController, bindNodeModelMenuTrigger, closeNodeFooterMenus } from "../shared/nodeFooterControls.js";
import { escapeNodeMenuHtml } from "../shared/nodeModelMenu.js";
import { buildTextModelSmallIconHTML, buildTextProviderMenuGroupsHTML, findTextModelMenuItem } from "./apimartTextModelMenu.js";
import { getCustomTextModels, saveCustomTextModels } from "./customTextModels.js";
import { API_CONFIG_CHANGED_EVENT } from "../../../api/configApi.js";
import { buildModelProviderProfileSelectionPatch, getModelProviderProfileIds, getNextModelProviderProfileId, resolveModelProviderProfileId } from "../../modules/modelProviderProfileSelection.js";
import { getModelProviderProfileReadiness, getModelProviderProfileShortLabel, getModelProviderProfileStyleId, requestModelProviderProfileSelection, resolveConfiguredModelProviderProfileId } from "../shared/modelProviderProfileControl.js";
import { bindModelCredentialMenu, syncModelCredentialMenu } from "../../modules/modelCredentialUi.js";
export const DEFAULT_AIGEN_TEXT_MODEL_ID = "apimart/kimi-k2-instruct";
const CARET_HTML = "<svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"node-menu-caret\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
const FALLBACK_ICON_HTML = "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>";
function resolveModelLabel(_0x5a8efb, _0xd48422) {
  return _0xd48422?.(_0x5a8efb) || findTextModelMenuItem(_0x5a8efb)?.title || _0x5a8efb || "选择模型";
}
function resolveTriggerIcon(_0x43ab8e, _0x28ecd5) {
  const _0x5e3cdc = buildTextModelSmallIconHTML(_0x43ab8e);
  if (_0x5e3cdc) {
    return _0x5e3cdc;
  }
  if (["custom", "openai"].includes(String(_0x28ecd5 || "").toLowerCase())) {
    return "<div class=\"text-model-icon-small text-model-icon-badge\">OA</div>";
  }
  return FALLBACK_ICON_HTML;
}
export function buildAIGenTextModelMenuMarkup({
  activeModel = DEFAULT_AIGEN_TEXT_MODEL_ID,
  allowedModelIds: _0x13af00
} = {}) {
  const _0xe55614 = Array.isArray(_0x13af00);
  const _0x5a1276 = _0xe55614 ? "" : "<div class=\"custom-group-header floating-menu-item node-menu-group-header\" data-custom-toggle data-node-menu-submenu=\".custom-submenu\">\n          <div class=\"text-model-icon text-model-icon-badge\">OA</div>\n          <div class=\"fmi-content\">\n            <div class=\"fmi-title\" data-aigen-text-locale=\"customModelTitle\">" + t("aigenText.customModelTitle") + "</div>\n            <div class=\"fmi-sub\" data-aigen-text-locale=\"customModelSubtitle\">" + t("aigenText.customModelSubtitle") + "</div>\n          </div>\n          <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" class=\"node-menu-caret\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>\n        </div>\n        <div class=\"custom-submenu node-model-submenu node-menu-submenu\"></div>";
  return _0x5a1276 + "\n        " + buildTextProviderMenuGroupsHTML(activeModel, {
    allowedModelIds: _0x13af00
  });
}
export function renderAIGenTextModelSelectorMarkup({
  modelId = DEFAULT_AIGEN_TEXT_MODEL_ID,
  provider = "",
  providerProfileId = "",
  includeRunningHubInternational = false,
  getDisplayModelName: _0x4c95df,
  className = "",
  allowedModelIds: _0x3dfd1a
} = {}) {
  const _0x3cb3c8 = String(modelId || DEFAULT_AIGEN_TEXT_MODEL_ID);
  const _0x2da6c5 = resolveModelProviderProfileId({
    model: _0x3cb3c8,
    providerProfileId: providerProfileId
  });
  const _0x720f6d = includeRunningHubInternational ? "<button type=\"button\" class=\"model-provider-profile-selector-toggle" + (getModelProviderProfileIds(_0x3cb3c8).length > 1 ? "" : " is-hidden") + "\" data-provider-profile-id=\"" + escapeNodeMenuHtml(getModelProviderProfileStyleId(_0x2da6c5)) + "\" data-provider-profile-value=\"" + escapeNodeMenuHtml(_0x2da6c5) + "\">" + escapeNodeMenuHtml(getModelProviderProfileShortLabel(_0x2da6c5)) + "</button>" : "";
  const _0x14b130 = ["img-model-pills", "aigen-text-model-selector", className].filter(Boolean).join(" ");
  return "<div class=\"" + escapeNodeMenuHtml(_0x14b130) + "\" data-aigen-text-model-selector>\n    <div class=\"img-model-wrap\">\n      <button type=\"button\" class=\"img-pill-btn img-model-btn-trigger\">\n        " + resolveTriggerIcon(_0x3cb3c8, provider) + "\n        <span class=\"img-model-label\">" + escapeNodeMenuHtml(resolveModelLabel(_0x3cb3c8, _0x4c95df)) + "</span>\n        " + CARET_HTML + "\n      </button>\n      <div class=\"floating-menu img-model-menu node-model-menu\">\n        " + buildAIGenTextModelMenuMarkup({
    activeModel: _0x3cb3c8,
    allowedModelIds: _0x3dfd1a
  }) + "\n      </div>\n    </div>\n    " + _0x720f6d + "\n  </div>";
}
function createCustomModelItem(_0x5ae110, _0x34894a, _0x131c80) {
  const _0x4e5e = _0x5ae110.createElement("div");
  _0x4e5e.className = "floating-menu-item custom-model-item" + (_0x131c80 === _0x34894a ? " active" : "");
  _0x4e5e.dataset.value = _0x34894a;
  _0x4e5e.dataset.provider = "custom";
  const _0x23713b = _0x5ae110.createElement("div");
  _0x23713b.className = "text-model-icon text-model-icon-badge custom-model-icon";
  _0x23713b.textContent = "OA";
  const _0x3d4bb3 = _0x5ae110.createElement("span");
  _0x3d4bb3.className = "custom-model-label";
  _0x3d4bb3.textContent = _0x34894a;
  const _0xa6b414 = _0x5ae110.createElement("span");
  _0xa6b414.className = "custom-model-del";
  _0xa6b414.textContent = "×";
  _0x4e5e.addEventListener("mouseenter", () => _0xa6b414.classList.add("show"));
  _0x4e5e.addEventListener("mouseleave", () => _0xa6b414.classList.remove("show"));
  _0x4e5e.append(_0x23713b, _0x3d4bb3, _0xa6b414);
  return {
    item: _0x4e5e,
    remove: _0xa6b414
  };
}
export function bindAIGenTextModelSelector(_0xa0f4e6, {
  modelId = DEFAULT_AIGEN_TEXT_MODEL_ID,
  provider = "",
  providerProfileId = "",
  providerProfileIdByModel: _0x495fc3 = {},
  getDisplayModelName: _0x4cfbbd,
  onChange: _0x2147c0,
  getProfileReadiness = getModelProviderProfileReadiness,
  ensureProfileReady: _0x436dd9,
  onProfileUnavailable: _0x5479e9,
  documentObject = globalThis.document
} = {}) {
  const _0x4085e4 = _0xa0f4e6?.matches?.("[data-aigen-text-model-selector]") || _0xa0f4e6?.dataset?.aigenTextModelSelector !== undefined;
  const _0x1b8e0a = _0x4085e4 ? _0xa0f4e6 : _0xa0f4e6?.querySelector?.("[data-aigen-text-model-selector]");
  if (!_0x1b8e0a || !documentObject) {
    return {
      destroy() {}
    };
  }
  const _0x5a5de6 = _0x1b8e0a.querySelector(".img-model-wrap");
  const _0x2e3b27 = _0x1b8e0a.querySelector(".img-model-btn-trigger");
  const _0x646bf2 = _0x1b8e0a.querySelector(".img-model-menu");
  const _0x56b364 = _0x1b8e0a.querySelector(".img-model-label");
  const _0x2a45c1 = _0x1b8e0a.querySelector(".custom-submenu");
  const _0x3d8e64 = _0x1b8e0a.querySelector(".model-provider-profile-selector-toggle");
  let _0x2b6885 = String(modelId || DEFAULT_AIGEN_TEXT_MODEL_ID);
  let _0x31b836 = String(provider || findTextModelMenuItem(_0x2b6885)?.provider || "");
  let _0x241392 = _0x495fc3 && typeof _0x495fc3 === "object" ? {
    ..._0x495fc3
  } : {};
  let _0x351d0f = resolveModelProviderProfileId({
    model: _0x2b6885,
    providerProfileId: providerProfileId
  });
  const _0x5ee783 = [];
  const _0x4e7421 = _0x290806 => _0x290806.stopPropagation();
  _0x1b8e0a.addEventListener("pointerdown", _0x4e7421);
  _0x5ee783.push(() => _0x1b8e0a.removeEventListener("pointerdown", _0x4e7421));
  const _0x20356f = () => {
    if (_0x56b364) {
      _0x56b364.textContent = resolveModelLabel(_0x2b6885, _0x4cfbbd);
    }
    const _0x13a214 = resolveTriggerIcon(_0x2b6885, _0x31b836);
    const _0x2dc835 = documentObject.createElement("template");
    _0x2dc835.innerHTML = _0x13a214.trim();
    const _0x215dec = _0x2dc835.content?.firstElementChild;
    const _0x52130b = _0x2e3b27?.firstElementChild;
    if (_0x52130b && _0x215dec) {
      _0x52130b.replaceWith(_0x215dec);
    }
  };
  const _0xdeb64d = () => {
    if (!_0x3d8e64) {
      return;
    }
    const _0x1c3b8c = getModelProviderProfileIds(_0x2b6885);
    const _0x51701a = _0x1c3b8c.length > 1;
    _0x3d8e64.classList.toggle("is-hidden", !_0x51701a);
    if (!_0x51701a) {
      return;
    }
    const _0x308444 = {
      model: _0x2b6885,
      providerProfileId: _0x351d0f,
      providerProfileIdByModel: _0x241392
    };
    const _0x178895 = resolveModelProviderProfileId(_0x308444);
    const _0x18ac2c = resolveConfiguredModelProviderProfileId(_0x308444, getProfileReadiness);
    let _0x3de8a6 = _0x308444;
    if (_0x18ac2c && _0x18ac2c !== _0x178895) {
      const _0x3e3708 = buildModelProviderProfileSelectionPatch(_0x308444, _0x2b6885, _0x18ac2c);
      _0x351d0f = _0x3e3708.providerProfileId;
      _0x241392 = _0x3e3708.providerProfileIdByModel || {};
      _0x3de8a6 = {
        ..._0x308444,
        ..._0x3e3708
      };
    }
    const _0x4297a6 = getNextModelProviderProfileId(_0x3de8a6);
    const _0x5b04c1 = getModelProviderProfileShortLabel(_0x18ac2c);
    const _0x9786a9 = getModelProviderProfileShortLabel(_0x4297a6);
    _0x3d8e64.textContent = _0x5b04c1;
    _0x3d8e64.dataset.providerProfileId = getModelProviderProfileStyleId(_0x18ac2c);
    _0x3d8e64.dataset.providerProfileValue = _0x18ac2c;
    _0x3d8e64.title = "当前" + _0x5b04c1 + "线路，点击切换到" + _0x9786a9;
    _0x3d8e64.setAttribute("aria-label", "当前" + _0x5b04c1 + "线路，点击切换到" + _0x9786a9);
  };
  const _0x2e2efd = (_0x3c8eb8, _0x4a0aad, _0x42847b) => {
    const _0x2c5b1a = String(_0x3c8eb8 || "").trim();
    if (!_0x2c5b1a) {
      return;
    }
    const _0x54a593 = buildModelProviderProfileSelectionPatch({
      model: _0x2b6885,
      providerProfileId: _0x351d0f,
      providerProfileIdByModel: _0x241392
    }, _0x2c5b1a, _0x42847b);
    _0x2b6885 = _0x2c5b1a;
    _0x31b836 = String(_0x4a0aad || findTextModelMenuItem(_0x2c5b1a)?.provider || "").trim();
    _0x351d0f = _0x54a593.providerProfileId;
    _0x241392 = _0x54a593.providerProfileIdByModel || {};
    _0x646bf2?.querySelectorAll(".floating-menu-item[data-value]").forEach(_0x20d99b => {
      _0x20d99b.classList.toggle("active", _0x20d99b.dataset.value === _0x2b6885);
    });
    _0x646bf2?.classList.remove("show");
    _0x20356f();
    _0xdeb64d();
    _0x2147c0?.({
      modelId: _0x2b6885,
      provider: _0x31b836,
      providerProfileId: _0x351d0f,
      providerProfileIdByModel: _0x241392
    });
  };
  const _0x11b2b9 = () => {
    if (!_0x2a45c1) {
      return;
    }
    _0x2a45c1.replaceChildren();
    const _0x42d245 = getCustomTextModels();
    _0x42d245.forEach((_0x582ede, _0x5767a0) => {
      const {
        item: _0x336328,
        remove: _0x493744
      } = createCustomModelItem(documentObject, _0x582ede, _0x2b6885);
      _0x493744.addEventListener("click", _0x2e33ed => {
        _0x2e33ed.preventDefault();
        _0x2e33ed.stopPropagation();
        saveCustomTextModels(_0x42d245.filter((_0x3056ba, _0x59f5bf) => _0x59f5bf !== _0x5767a0));
        _0x11b2b9();
      });
      _0x2a45c1.appendChild(_0x336328);
    });
    if (_0x42d245.length) {
      const _0xf6197f = documentObject.createElement("div");
      _0xf6197f.className = "custom-model-separator";
      _0x2a45c1.appendChild(_0xf6197f);
    }
    const _0x4773c7 = documentObject.createElement("div");
    _0x4773c7.className = "floating-menu-item custom-model-add";
    _0x4773c7.innerHTML = "<svg class=\"custom-model-add-icon\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg><span class=\"custom-model-add-label\">" + t("aigenText.customModel.addModel") + "</span>";
    _0x4773c7.addEventListener("click", _0x2ed412 => {
      _0x2ed412.preventDefault();
      _0x2ed412.stopPropagation();
      _0x4773c7.replaceChildren();
      _0x4773c7.classList.add("editing");
      const _0x3f83b9 = documentObject.createElement("input");
      _0x3f83b9.type = "text";
      _0x3f83b9.className = "custom-model-input";
      _0x3f83b9.placeholder = t("aigenText.customModel.namePlaceholder");
      const _0x12e264 = documentObject.createElement("button");
      _0x12e264.type = "button";
      _0x12e264.className = "custom-model-confirm";
      _0x12e264.textContent = t("aigenText.customModel.confirm");
      const _0x4b95fb = () => {
        const _0x4c8261 = _0x3f83b9.value.trim();
        if (!_0x4c8261) {
          return;
        }
        const _0x50cc4b = getCustomTextModels();
        if (!_0x50cc4b.includes(_0x4c8261)) {
          saveCustomTextModels([..._0x50cc4b, _0x4c8261]);
        }
        _0x11b2b9();
      };
      _0x3f83b9.addEventListener("keydown", _0xc3ef0a => {
        _0xc3ef0a.stopPropagation();
        if (_0xc3ef0a.key === "Enter") {
          _0x4b95fb();
        }
      });
      _0x3f83b9.addEventListener("click", _0x50a7ba => _0x50a7ba.stopPropagation());
      _0x12e264.addEventListener("click", _0x54d1de => {
        _0x54d1de.stopPropagation();
        _0x4b95fb();
      });
      _0x4773c7.append(_0x3f83b9, _0x12e264);
      _0x3f83b9.focus();
    });
    _0x2a45c1.appendChild(_0x4773c7);
  };
  const _0x2bacb9 = _0x3a64d4 => {
    const _0x4e6166 = _0x3a64d4.target?.closest?.(".floating-menu-item[data-value]");
    if (!_0x4e6166 || !_0x646bf2?.contains(_0x4e6166) || _0x4e6166.dataset.disabled === "true") {
      return;
    }
    _0x3a64d4.stopPropagation();
    _0x2e2efd(_0x4e6166.dataset.value, _0x4e6166.dataset.provider, _0x4e6166.dataset.credentialResolvedProviderProfileId);
  };
  _0x646bf2?.addEventListener("click", _0x2bacb9);
  _0x5ee783.push(() => _0x646bf2?.removeEventListener("click", _0x2bacb9));
  const _0x15e3ed = _0x5cb62c => {
    _0x5cb62c.preventDefault();
    _0x5cb62c.stopPropagation();
    const _0x54e2fe = {
      model: _0x2b6885,
      providerProfileId: _0x351d0f,
      providerProfileIdByModel: _0x241392
    };
    const _0x5ebc92 = getNextModelProviderProfileId(_0x54e2fe);
    if (!_0x5ebc92) {
      return;
    }
    requestModelProviderProfileSelection({
      nodeData: _0x54e2fe,
      targetProfileId: _0x5ebc92,
      getProfileReadiness: getProfileReadiness,
      ensureProfileReady: _0x436dd9,
      onUnavailable: _0x5479e9,
      onChange: _0x3cd49b => {
        _0x351d0f = _0x3cd49b.providerProfileId;
        _0x241392 = _0x3cd49b.providerProfileIdByModel || {};
        _0xdeb64d();
        syncModelCredentialMenu(_0x646bf2, {
          documentObject: documentObject,
          getProviderProfileId: () => _0x351d0f
        });
        _0x2147c0?.({
          modelId: _0x2b6885,
          provider: _0x31b836,
          providerProfileId: _0x351d0f,
          providerProfileIdByModel: _0x241392
        });
      }
    });
  };
  _0x3d8e64?.addEventListener("click", _0x15e3ed);
  _0x5ee783.push(() => _0x3d8e64?.removeEventListener("click", _0x15e3ed));
  _0x5ee783.push(bindNodeFooterController(_0x1b8e0a));
  _0x5ee783.push(bindNodeModelMenuTrigger({
    root: _0x1b8e0a,
    trigger: _0x2e3b27,
    menu: _0x646bf2,
    closeOthers: () => closeNodeFooterMenus(_0x1b8e0a, _0x646bf2),
    activateMenuKeyboard: activateMenuKeyboard
  }));
  const _0x3d5b52 = onLocaleChange(() => {
    _0x1b8e0a.querySelector("[data-aigen-text-locale=\"customModelTitle\"]")?.replaceChildren(documentObject.createTextNode(t("aigenText.customModelTitle")));
    _0x1b8e0a.querySelector("[data-aigen-text-locale=\"customModelSubtitle\"]")?.replaceChildren(documentObject.createTextNode(t("aigenText.customModelSubtitle")));
    _0x11b2b9();
    _0x20356f();
  });
  _0x5ee783.push(_0x3d5b52);
  const _0x15bdb0 = () => {
    _0xdeb64d();
  };
  globalThis.window?.addEventListener?.(API_CONFIG_CHANGED_EVENT, _0x15bdb0);
  _0x5ee783.push(() => globalThis.window?.removeEventListener?.(API_CONFIG_CHANGED_EVENT, _0x15bdb0));
  _0x11b2b9();
  _0x20356f();
  _0xdeb64d();
  const _0x477f89 = bindModelCredentialMenu(_0x646bf2, {
    documentObject: documentObject,
    getProviderProfileId: () => _0x351d0f
  });
  return {
    modelWrap: _0x5a5de6,
    trigger: _0x2e3b27,
    menu: _0x646bf2,
    getSelection: () => ({
      modelId: _0x2b6885,
      provider: _0x31b836,
      providerProfileId: _0x351d0f,
      providerProfileIdByModel: _0x241392
    }),
    setSelection: ({
      modelId: _0x57d2ca,
      provider: _0x3b199f,
      providerProfileId: _0x2a91a8,
      providerProfileIdByModel: _0x4a4dcf
    } = {}) => {
      const _0x295b3c = _0x2b6885;
      _0x2b6885 = String(_0x57d2ca || _0x2b6885);
      _0x31b836 = String(_0x3b199f || findTextModelMenuItem(_0x2b6885)?.provider || _0x31b836);
      const _0x26d862 = buildModelProviderProfileSelectionPatch({
        model: _0x295b3c,
        providerProfileId: _0x351d0f,
        providerProfileIdByModel: _0x4a4dcf || _0x241392
      }, _0x2b6885, _0x2a91a8);
      _0x351d0f = _0x26d862.providerProfileId;
      _0x241392 = _0x26d862.providerProfileIdByModel || {};
      _0x11b2b9();
      _0x20356f();
      _0xdeb64d();
    },
    destroy() {
      _0x477f89?.();
      _0x5ee783.forEach(_0x2e39db => _0x2e39db?.());
    }
  };
}