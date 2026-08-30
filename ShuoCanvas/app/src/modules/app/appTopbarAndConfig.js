import { registerSidebarSubmenu } from "../sidebarSubmenuController.js";
import { openExternalLink } from "../../services/externalLinkService.js";
import { t } from "../../i18n/index.js";
import { DEFAULT_APIMART_ROUTE_ID, getApimartApiUrlForRoute, getApimartRouteById, resolveApimartRouteByApiUrl } from "../providers.js";
import { bindVolcengineSpeechApiKeyGuideTriggers } from "../volcengineSpeechApiKeyGuide.js";
import { bindRunningHubApiKeyGuideTriggers } from "../runningHubApiKeyGuide.js";
import { bindProviderApiKeyGuideTriggers } from "../providerApiKeyGuide.js";
import { registerManifestBundle, unregisterManifestBundle } from "../../manifests/index.js";
import { trackRuntimeManifestLoad } from "../../manifests/runtimeManifestReadiness.js";
import { CUSTOM_PROVIDER_VIP_MODEL_ID } from "../subscriptionAccess.js";
import { applyCustomProviderModelSelectionState, captureCustomProviderModelSelectionScroll, getCustomProviderModelActionState, getCustomProviderModelsNeedingVerification, getCustomProviderSaveStatus, getRememberedCustomProviderConfigs, handleCustomProviderResultWheel, isCustomProviderAccessAllowed, isCustomProviderModelCapabilityRecognized, mergeCustomProviderDiscoveryCapabilities, mergeCustomProviderRecognizedProfiles, resolveCustomProviderDocumentationFailureKey, restoreCustomProviderModelSelectionScroll, scrollCustomProviderModelListFromWheel, stabilizeCustomProviderEditorListHeight } from "./appTopbarCustomProviderPolicy.js";
import { extractDreaminaManualLinksFromOutputLines, getDreaminaQrLoginButtonText, getDreaminaStatusSessionKey, getDreaminaWebLoginButtonText, mergeDreaminaLoginRuntimeStatus, reconcileDreaminaSessionUiState, shouldDreaminaManualGuideOpenByDefault } from "./appTopbarDreaminaSession.js";
import { formatProviderDiagnosticDetail as a862_0xd1caa0, isProviderConnectionVerified, mergePassedProviderApiConfig, reconcileProviderConnectionVerification, shouldPersistProviderConnectionResult } from "../../services/providerConnectionVerification.js";
import { createRunningHubDefaultSiteSettings } from "../settings/runningHubDefaultSiteSettings.js";
import { subscribeToSubscriptionState } from "./subscriptionStateWatcher.js";
import { bindModelCatalogProviderCardVisibility } from "./modelCatalogProviderCard.js";
import { createApiConfigAutoSaveController } from "./apiConfigAutoSave.js";
import { createProviderStatusTooltipController } from "./providerStatusTooltipController.js";
const DREAMINA_I18N_PREFIX = "settings.apiInput.providers.dreamina";
const CUSTOM_PROVIDER_DOCUMENTATION_MAX_BYTES = 2097152;
const CUSTOM_PROVIDER_DOCUMENTATION_EXTENSIONS = new Set([".md", ".txt", ".json", ".yaml", ".yml", ".html", ".htm"]);
function trTemplate(_0x116085, _0x411a75 = {}) {
  let _0x7302a9 = t(_0x116085);
  Object.entries(_0x411a75 || {}).forEach(([_0x173a33, _0x288f44]) => {
    _0x7302a9 = _0x7302a9.split("{" + _0x173a33 + "}").join(String(_0x288f44 ?? ""));
  });
  return _0x7302a9;
}
function trApiInput(_0x1631ea, _0x13e905 = {}) {
  return trTemplate("settings.apiInput." + _0x1631ea, _0x13e905);
}
function trDreamina(_0x336b7c, _0x217a18 = {}) {
  return trTemplate(DREAMINA_I18N_PREFIX + "." + _0x336b7c, _0x217a18);
}
function trCustomProvider(_0x1e70a2, _0x398b90 = {}) {
  return trApiInput("customProvider." + _0x1e70a2, _0x398b90);
}
function markNonLoginTextInput(_0x25a3eb) {
  if (!_0x25a3eb) {
    return;
  }
  _0x25a3eb.autocomplete = "off";
  _0x25a3eb.setAttribute("autocomplete", "off");
  _0x25a3eb.setAttribute("autocapitalize", "off");
  _0x25a3eb.setAttribute("spellcheck", "false");
  _0x25a3eb.setAttribute("data-form-type", "other");
}
function markApiSecretInput(_0x3b6926) {
  if (!_0x3b6926) {
    return;
  }
  _0x3b6926.autocomplete = "new-password";
  _0x3b6926.setAttribute("autocomplete", "new-password");
  _0x3b6926.setAttribute("autocapitalize", "off");
  _0x3b6926.setAttribute("spellcheck", "false");
  _0x3b6926.setAttribute("data-lpignore", "true");
  _0x3b6926.setAttribute("data-1p-ignore", "true");
  _0x3b6926.setAttribute("data-form-type", "other");
}
function hardenApiCredentialInputs(_0x346c25 = globalThis.document) {
  _0x346c25?.querySelectorAll?.("input[type=\"password\"], [data-custom-provider-api-key]")?.forEach(markApiSecretInput);
  _0x346c25?.querySelectorAll?.("#providerUrl-openai, #customProviderBaseUrl, [data-custom-provider-base-url]")?.forEach(markNonLoginTextInput);
  _0x346c25?.querySelectorAll?.("#customProviderDocumentationUrl, [data-custom-provider-documentation-url]")?.forEach(markNonLoginTextInput);
}
export function createAppTopbarAndConfig({
  store: _0x28bf1f,
  fetchApiConfigFromServer: _0x3f087b,
  saveApiConfigToServer: _0x56734f,
  testProviderConnections: _0x5d5fe2,
  discoverCustomProvider: _0x4fd02f,
  analyzeCustomProviderDocumentation: _0x2f5bb7,
  buildCustomProviderManifestDraft: _0x28aa81,
  validateCustomProviderManifestDraft: _0xba8a0d,
  saveCustomProviderManifestBundle: _0x4bfdb2,
  listCustomProviderManifestBundles: _0x18e7b5,
  deleteCustomProviderManifestBundle: _0x171e45,
  refreshManifestModelNodeUis: _0x1a2612,
  fetchDreaminaCliStatusFromServer: _0x4ba43f,
  fetchDreaminaCliLoginRuntimeFromServer: _0x2c24dd,
  startDreaminaHeadlessLoginFromServer: _0x116836,
  startDreaminaHeadlessReloginFromServer: _0x462753,
  startDreaminaWebLoginFromServer: _0x2e516c,
  importDreaminaLoginResponseFromServer: _0x41e916,
  logoutDreaminaFromServer: _0x452f05,
  buildDreaminaQrImageUrl: _0x407896,
  showError: _0xed9570
} = {}) {
  const _0x5ee7f9 = 85000;
  const _0x3f6b48 = {
    pollTimer: null,
    pollInFlight: false,
    pollInFlightGeneration: 0,
    pollGeneration: 0,
    lastToastKey: "",
    lastStatus: null,
    modalCloseTimer: null,
    currentSessionKey: "",
    dismissedSessionKey: "",
    qrImageLoadError: false,
    lastQrImageUrl: "",
    lastQrImageRequestedAt: 0,
    lastQrImageLoadedAt: 0,
    lastQrImageErrorAt: 0,
    lastQrImageErrorMessage: "",
    qrImageListenersBound: false,
    manualGuideOpen: false,
    loginLaunchRequestedAt: 0
  };
  let _0x1ff891 = {};
  let _0x4222d6 = null;
  let _0x372f3a = null;
  const _0x2a807c = ["runninghub", "runninghub-international"];
  const _0x45cc8c = ["grsai", "openai", "ppio", "apimart", "minimax", "minimax-international", "agnes-domestic", "agnes", "binghuo", "volcengine", "volcengine-speech", "runninghub", "runninghub-international", "comfyui"];
  const _0x5030ff = "127.0.0.1:8188";
  const _0x5f58a8 = ["settings-provider-status--testing", "settings-provider-status--success", "settings-provider-status--partial", "settings-provider-status--danger", "settings-provider-status--configured", "settings-provider-status--unconfigured"];
  const _0x25c277 = ["text", "image", "video", "audio"];
  const _0x443361 = ["all", ..._0x25c277, "unknown"];
  const _0x9d1fcd = {
    all: "kindAll",
    text: "kindText",
    image: "kindImage",
    video: "kindVideo",
    audio: "kindAudio",
    embedding: "kindEmbedding",
    unknown: "kindUnknown"
  };
  const _0x2cc33f = createProviderStatusTooltipController();
  const _0xcedc53 = new Map();
  function _0x339142(_0x3fc20b, _0x2111db = "") {
    const _0x1b7652 = String(_0x3fc20b || _0x2111db || "").trim();
    if (!_0x1b7652) {
      return "";
    }
    const _0x11ec64 = /^[a-z][a-z0-9+.-]*:\/\//i.test(_0x1b7652);
    try {
      const _0x3a3e88 = new URL(_0x11ec64 ? _0x1b7652 : "http://" + _0x1b7652);
      _0x3a3e88.search = "";
      _0x3a3e88.hash = "";
      return _0x3a3e88.toString().replace(/\/+$/, "");
    } catch {
      const _0xf3c248 = _0x1b7652.replace(/[?#].*$/, "").replace(/\/+$/, "");
      if (!_0xf3c248) {
        return "";
      }
      if (_0x11ec64) {
        return _0xf3c248;
      } else {
        return "http://" + _0xf3c248;
      }
    }
  }
  function _0x23fba2() {
    return {
      cardEl: document.getElementById("customProviderDiscoveryCard"),
      statusEl: document.getElementById("customProviderDiscoveryStatus"),
      editorListEl: document.getElementById("customProviderEditors"),
      addBtnEl: document.getElementById("btnCustomProviderAdd"),
      editorEl: document.getElementById("customProviderEditor")
    };
  }
  const _0x1255ce = {
    activeEditorId: "custom-provider-editor-1",
    editorSequence: 1,
    editorStates: new Map()
  };
  function _0x4c3ca2() {
    const {
      editorListEl: _0x3df599
    } = _0x23fba2();
    return Array.from(_0x3df599?.querySelectorAll?.("[data-custom-provider-editor-id]") || []);
  }
  function _0x177826(_0x4e7b4b) {
    return {
      baseUrlEl: _0x4e7b4b?.querySelector?.("[data-custom-provider-base-url]") || document.getElementById("customProviderBaseUrl"),
      apiKeyEl: _0x4e7b4b?.querySelector?.("[data-custom-provider-api-key]") || document.getElementById("customProviderApiKey"),
      documentationUrlEl: _0x4e7b4b?.querySelector?.("[data-custom-provider-documentation-url]") || document.getElementById("customProviderDocumentationUrl"),
      documentationFileEl: _0x4e7b4b?.querySelector?.("[data-custom-provider-documentation-file]") || document.querySelector("#customProviderDiscoveryCard [data-custom-provider-documentation-file]")
    };
  }
  function _0xbe6257(_0x4533b0) {
    return String(_0x4533b0?.dataset?.customProviderEditorId || "").trim();
  }
  function _0x24a663(_0x39c36a) {
    const _0x5ab22c = _0xbe6257(_0x39c36a);
    if (!_0x5ab22c) {
      return {
        discovery: null,
        provider: null,
        activeKindFilter: "all",
        selectedModelKeys: new Set(),
        assignedModelKinds: new Map(),
        verifyingModelKeys: new Set(),
        isAddingModels: false,
        documentationDocument: null,
        titleText: "",
        titleManuallyEdited: false
      };
    }
    if (!_0x1255ce.editorStates.has(_0x5ab22c)) {
      _0x1255ce.editorStates.set(_0x5ab22c, {
        discovery: null,
        provider: null,
        activeKindFilter: "all",
        selectedModelKeys: new Set(),
        assignedModelKinds: new Map(),
        verifyingModelKeys: new Set(),
        isAddingModels: false,
        documentationDocument: null,
        titleText: "",
        titleManuallyEdited: false
      });
    }
    return _0x1255ce.editorStates.get(_0x5ab22c);
  }
  function _0x3d8a1c(_0x56a789) {
    return {
      bodyEl: _0x56a789?.querySelector?.("[data-custom-provider-editor-body]"),
      tabBtnEl: _0x56a789?.querySelector?.("[data-custom-provider-editor-tab]"),
      deleteBtnEl: _0x56a789?.querySelector?.("[data-custom-provider-delete]"),
      discoverBtnEl: _0x56a789?.querySelector?.("[data-custom-provider-discover]"),
      resultEl: _0x56a789?.querySelector?.("[data-custom-provider-result]"),
      resultInnerEl: _0x56a789?.querySelector?.("[data-custom-provider-result-inner]"),
      actionsEl: _0x56a789?.querySelector?.("[data-custom-provider-actions]"),
      saveSelectedBtnEl: _0x56a789?.querySelector?.("[data-custom-provider-save-selected]"),
      verifyParamsBtnEl: _0x56a789?.querySelector?.("[data-custom-provider-verify-params]")
    };
  }
  function _0x4f93c8(_0xf38782 = null) {
    const _0x538943 = _0xbe6257(_0xf38782) || _0x1255ce.activeEditorId;
    _0x4c3ca2().forEach(_0x560238 => {
      const _0x25e79e = _0xbe6257(_0x560238) === _0x538943;
      const {
        bodyEl: _0x26e033,
        tabBtnEl: _0x597826
      } = _0x3d8a1c(_0x560238);
      _0x560238.classList.toggle("is-active", _0x25e79e);
      if (_0x26e033) {
        _0x26e033.hidden = !_0x25e79e;
        _0x26e033.setAttribute("aria-hidden", _0x25e79e ? "false" : "true");
      }
      if (_0x597826) {
        _0x597826.setAttribute("aria-selected", _0x25e79e ? "true" : "false");
      }
    });
  }
  function _0x7c10a6(_0x106f7c, _0x134661 = {}) {
    if (!_0x106f7c) {
      return;
    }
    const _0x368882 = String(_0x106f7c.dataset.customProviderEditorId || "").trim();
    if (!_0x368882) {
      return;
    }
    const _0x2fc7f4 = _0x1255ce.activeEditorId !== _0x368882;
    const {
      editorListEl: _0x57c6f6
    } = _0x23fba2();
    stabilizeCustomProviderEditorListHeight(_0x57c6f6);
    _0x1255ce.activeEditorId = _0x368882;
    _0x4f93c8(_0x106f7c);
    stabilizeCustomProviderEditorListHeight(_0x57c6f6);
    if (_0x2fc7f4 || _0x134661.clearStatus) {
      _0x59030b("", "");
    }
  }
  function _0x4eb28a() {
    const _0x2681ef = _0x4c3ca2();
    const _0x2101dd = _0x2681ef.find(_0x4e8857 => String(_0x4e8857.dataset.customProviderEditorId || "") === _0x1255ce.activeEditorId);
    return _0x2101dd || _0x2681ef.find(_0x489ed6 => _0x489ed6.classList.contains("is-active")) || _0x2681ef[0] || null;
  }
  function _0x1c542d() {
    return _0x177826(_0x4eb28a());
  }
  function _0x9a583f(_0xee1c17) {
    const _0xb2e347 = String(_0xee1c17 || "").trim();
    if (_0xb2e347) {
      return "custom-provider:" + _0xb2e347;
    } else {
      return "";
    }
  }
  function _0x4d812d(_0x17362b) {
    return _0xcedc53.get(_0x9a583f(_0x17362b)) || null;
  }
  function _0x1eec74(_0x557a3b) {
    const _0x6349b1 = _0x24a663(_0x557a3b);
    const _0x1d0149 = String(_0x6349b1.provider?.providerId || "").trim();
    if (_0x1d0149) {
      return _0x1d0149;
    }
    return String(_0x498c84(_0x557a3b).providerId || "").trim();
  }
  function _0x5e5eca(_0x4967f4) {
    const _0x3d368c = _0x1eec74(_0x4967f4);
    if (!_0x3d368c) {
      return false;
    }
    const _0x2eef86 = _0x24a663(_0x4967f4);
    const _0x52139c = _0x9a583f(_0x3d368c);
    return !!_0x2eef86.provider || _0xcedc53.has(_0x52139c);
  }
  function _0x3eb7dc(_0x1ea6a1) {
    return String(_0x1ea6a1 || "").trim().replace(/\s+/g, " ");
  }
  function _0x3cb449(_0x5f281e) {
    const _0x335f19 = _0x4c3ca2();
    const _0x1b5719 = Math.max(0, _0x335f19.indexOf(_0x5f281e));
    return trCustomProvider("providerDraftTitle", {
      index: _0x1b5719 + 1
    });
  }
  function _0x42b58a(_0x2af732) {
    const _0x4bfa09 = _0x24a663(_0x2af732);
    return _0x3eb7dc(_0x4bfa09.titleText) || _0x3cb449(_0x2af732);
  }
  function _0x402697(_0x326761) {
    const _0x169251 = _0x326761?.querySelector?.("[data-custom-provider-editor-title]");
    const _0x546919 = _0x326761?.querySelector?.("[data-custom-provider-editor-tab]");
    const _0x507a81 = _0x42b58a(_0x326761);
    if (_0x169251) {
      _0x169251.removeAttribute("data-i18n");
      _0x169251.textContent = _0x507a81;
    }
    _0x546919?.setAttribute("aria-label", _0x507a81);
  }
  function _0x11e308() {
    _0x4c3ca2().forEach(_0x1236b2 => {
      _0x402697(_0x1236b2);
    });
  }
  function _0x5ab135(_0x26bbb0, _0x14a327, _0x4802b7 = {}) {
    if (!_0x26bbb0) {
      return;
    }
    const _0x3a8b8f = _0x24a663(_0x26bbb0);
    const _0x280281 = _0x3eb7dc(_0x14a327);
    _0x3a8b8f.titleText = _0x280281;
    if (_0x4802b7.manual === true) {
      _0x3a8b8f.titleManuallyEdited = true;
    } else if (_0x4802b7.manual === false) {
      _0x3a8b8f.titleManuallyEdited = false;
    }
    _0x402697(_0x26bbb0);
  }
  function _0x511303(_0x1e7caa) {
    if (!_0x1e7caa) {
      return;
    }
    const _0x49197a = _0x24a663(_0x1e7caa);
    _0x49197a.titleText = "";
    _0x49197a.titleManuallyEdited = false;
    _0x402697(_0x1e7caa);
  }
  function _0x30bd62(_0x143df2, _0x4edc2a) {
    if (!_0x143df2) {
      return;
    }
    const _0xc6e54f = _0x24a663(_0x143df2);
    if (_0xc6e54f.titleManuallyEdited) {
      return;
    }
    const _0x2eb998 = _0x3eb7dc(_0x4edc2a);
    if (!_0x2eb998) {
      return;
    }
    _0xc6e54f.titleText = _0x2eb998;
    _0x402697(_0x143df2);
  }
  function _0x568a0b(_0x70e53c) {
    if (!_0x70e53c) {
      return;
    }
    const {
      tabBtnEl: _0x58fa5f,
      deleteBtnEl: _0x5a0f07
    } = _0x3d8a1c(_0x70e53c);
    if (!_0x58fa5f || _0x70e53c.querySelector("[data-custom-provider-editor-title-input]")) {
      return;
    }
    const _0xc374d = _0x24a663(_0x70e53c);
    const _0x401e5b = _0xc374d.titleText;
    const _0x43ac17 = !!_0xc374d.titleManuallyEdited;
    const _0x16564e = _0x42b58a(_0x70e53c);
    const _0x19ab4c = document.createElement("input");
    _0x19ab4c.type = "text";
    _0x19ab4c.className = "custom-provider-editor-title-input";
    _0x19ab4c.dataset.customProviderEditorTitleInput = "";
    _0x19ab4c.value = _0x16564e;
    _0x19ab4c.setAttribute("aria-label", _0x16564e);
    let _0x23b20e = false;
    const _0x438ee7 = _0x3c7acd => {
      if (_0x23b20e) {
        return;
      }
      _0x23b20e = true;
      _0x19ab4c.removeEventListener("blur", _0x2b6d2f);
      _0x19ab4c.removeEventListener("keydown", _0x127de0);
      if (_0x3c7acd) {
        const _0x2d9376 = _0x3eb7dc(_0x19ab4c.value);
        if (_0x2d9376) {
          if (_0x43ac17 || _0x2d9376 !== _0x16564e) {
            _0x5ab135(_0x70e53c, _0x2d9376, {
              manual: true
            });
          } else {
            _0xc374d.titleText = _0x401e5b;
            _0xc374d.titleManuallyEdited = _0x43ac17;
            _0x402697(_0x70e53c);
          }
        } else {
          _0xc374d.titleText = _0x401e5b;
          _0xc374d.titleManuallyEdited = _0x43ac17;
          _0x402697(_0x70e53c);
        }
      } else {
        _0xc374d.titleText = _0x401e5b;
        _0xc374d.titleManuallyEdited = _0x43ac17;
        _0x402697(_0x70e53c);
      }
      _0x58fa5f.hidden = false;
      _0x19ab4c.remove();
      _0x58fa5f.focus?.();
    };
    function _0x2b6d2f() {
      _0x438ee7(true);
    }
    function _0x127de0(_0x256b97) {
      if (_0x256b97.key === "Enter") {
        _0x256b97.preventDefault();
        _0x438ee7(true);
      } else if (_0x256b97.key === "Escape") {
        _0x256b97.preventDefault();
        _0x438ee7(false);
      }
    }
    _0x19ab4c.addEventListener("blur", _0x2b6d2f);
    _0x19ab4c.addEventListener("keydown", _0x127de0);
    _0x58fa5f.hidden = true;
    _0x58fa5f.parentElement?.insertBefore(_0x19ab4c, _0x5a0f07 || _0x58fa5f.nextSibling);
    _0x19ab4c.focus?.();
    _0x19ab4c.select?.();
  }
  function _0x538d81() {
    const _0x439c72 = _0x4c3ca2();
    _0x439c72.forEach(_0x63a5cb => {
      const {
        deleteBtnEl: _0x5d3b11
      } = _0x3d8a1c(_0x63a5cb);
      if (_0x5d3b11) {
        _0x5d3b11.hidden = _0x439c72.length <= 1 && !_0x5e5eca(_0x63a5cb);
      }
    });
  }
  function _0x268354(_0x4fb7f1) {
    const _0x55f501 = _0x4c3ca2();
    if (!_0x4fb7f1 || _0x55f501.length <= 1) {
      return;
    }
    const _0x592e6a = _0xbe6257(_0x4fb7f1);
    const _0x312f4c = _0x55f501.indexOf(_0x4fb7f1);
    const _0x518aa6 = _0x55f501[_0x312f4c + 1] || _0x55f501[_0x312f4c - 1] || null;
    _0x1255ce.editorStates.delete(_0x592e6a);
    _0x4fb7f1.remove();
    _0x11e308();
    _0x538d81();
    if (_0x518aa6) {
      _0x7c10a6(_0x518aa6, {
        clearStatus: true
      });
    }
  }
  async function _0x52983c(_0x3b7e5a) {
    if (typeof _0x56734f !== "function") {
      return;
    }
    const _0xf474a5 = String(_0x3b7e5a || "").trim();
    if (!_0xf474a5 || !_0x1ff891?.providers?.[_0xf474a5]) {
      return;
    }
    const _0x1ae662 = {
      ...(_0x1ff891.providers || {})
    };
    delete _0x1ae662[_0xf474a5];
    const _0x406663 = {
      ...(_0x1ff891 || {}),
      providers: _0x1ae662
    };
    await _0x56734f(_0x406663);
    _0x1ff891 = _0x406663;
    _0x1e0dbc(_0x406663);
    _0x1a2612?.();
  }
  async function _0x2d2706(_0x188f06) {
    const _0x4528c7 = String(_0x188f06 || "").trim();
    if (!_0x4528c7) {
      return;
    }
    const _0x2053a8 = _0x9a583f(_0x4528c7);
    const _0x1a5cdd = _0xcedc53.get(_0x2053a8);
    if (typeof _0x171e45 === "function" && _0x2053a8) {
      try {
        await _0x171e45(_0x2053a8);
      } catch (_0x4563e8) {
        const _0x3d2ce8 = String(_0x4563e8?.message || _0x4563e8 || "").toLowerCase();
        if (!_0x3d2ce8.includes("not found") && !_0x3d2ce8.includes("404")) {
          throw _0x4563e8;
        }
      }
    }
    if (_0x1a5cdd) {
      try {
        unregisterManifestBundle(_0x1a5cdd);
      } catch (_0x34f1f4) {
        console.warn("[Custom Provider] unregister deleted bundle failed:", _0x34f1f4);
      }
      _0xcedc53.delete(_0x2053a8);
    }
    await _0x52983c(_0x4528c7);
  }
  function _0x356149(_0x52dd4d) {
    const {
      baseUrlEl: _0x104ac2,
      apiKeyEl: _0x3e24a9,
      documentationUrlEl: _0x178600,
      documentationFileEl: _0x5dbdca
    } = _0x177826(_0x52dd4d);
    if (_0x104ac2) {
      _0x104ac2.value = "";
    }
    if (_0x3e24a9) {
      _0x3e24a9.value = "";
    }
    if (_0x178600) {
      _0x178600.value = "";
    }
    if (_0x5dbdca) {
      _0x5dbdca.value = "";
    }
    _0x24a663(_0x52dd4d).documentationDocument = null;
    if (_0x52dd4d?.dataset) {
      delete _0x52dd4d.dataset.customProviderProviderId;
      delete _0x52dd4d.dataset.customProviderSyncedBundle;
    }
    _0x13e278(_0x52dd4d);
    _0x511303(_0x52dd4d);
    _0x59030b("", "");
  }
  async function _0xab1de4(_0x3755ea, _0x1ce852) {
    if (!_0x3755ea) {
      return;
    }
    const _0x369fcd = _0x5e5eca(_0x3755ea);
    const _0x3b7280 = _0x369fcd ? _0x1eec74(_0x3755ea) : "";
    if (_0x1ce852) {
      _0x1ce852.disabled = true;
    }
    try {
      if (_0x369fcd) {
        await _0x2d2706(_0x3b7280);
      }
      const _0x3dd582 = _0x4c3ca2();
      if (_0x3dd582.length <= 1) {
        _0x356149(_0x3755ea);
        _0x11e308();
        _0x538d81();
        _0x7c10a6(_0x3755ea, {
          clearStatus: true
        });
      } else {
        _0x268354(_0x3755ea);
      }
      if (_0x3b7280) {
        const _0x458398 = trCustomProvider("deleteSuccess");
        _0x59030b("success", _0x458398);
        window.showToast?.(_0x458398, "success");
      }
    } catch (_0x20776b) {
      const _0x29447d = trCustomProvider("deleteFailed", {
        error: _0x20776b?.message || trApiInput("diagnostics.unknownError")
      });
      _0x59030b("danger", trApiInput("diagnostics.failed"), _0x29447d);
      window.showToast?.(_0x29447d, "error", 9000);
    } finally {
      if (_0x1ce852) {
        _0x1ce852.disabled = false;
      }
    }
  }
  function _0x310062() {
    const _0x2b4851 = "custom-provider-editor-" + (_0x1255ce.editorSequence + 1);
    _0x1255ce.editorSequence += 1;
    const _0x5bd324 = document.createElement("div");
    _0x5bd324.className = "custom-provider-editor-item";
    _0x5bd324.dataset.customProviderEditorId = _0x2b4851;
    const _0x440849 = document.createElement("div");
    _0x440849.className = "custom-provider-editor-item-head";
    const _0x4dee97 = document.createElement("button");
    _0x4dee97.type = "button";
    _0x4dee97.className = "custom-provider-editor-tab";
    _0x4dee97.dataset.customProviderEditorTab = "";
    _0x4dee97.setAttribute("aria-selected", "false");
    const _0x473ea2 = document.createElement("span");
    _0x473ea2.className = "custom-provider-editor-item-title";
    _0x473ea2.dataset.customProviderEditorTitle = "";
    _0x4dee97.append(_0x473ea2);
    const _0x38aa41 = document.createElement("div");
    _0x38aa41.className = "custom-provider-editor-item-actions";
    const _0xa5e489 = document.createElement("button");
    _0xa5e489.type = "button";
    _0xa5e489.className = "custom-provider-primary-btn custom-provider-discover-btn";
    _0xa5e489.dataset.customProviderDiscover = "";
    _0xa5e489.textContent = trCustomProvider("discover");
    const _0x231eb6 = document.createElement("button");
    _0x231eb6.type = "button";
    _0x231eb6.className = "custom-provider-delete-btn canvas-tab-close";
    _0x231eb6.dataset.customProviderDelete = "";
    _0x231eb6.setAttribute("aria-label", trCustomProvider("deleteProviderDraft"));
    _0x231eb6.textContent = "×";
    _0x38aa41.append(_0xa5e489);
    _0x440849.append(_0x4dee97, _0x231eb6);
    const _0x10a97a = document.createElement("div");
    _0x10a97a.className = "custom-provider-editor-item-body";
    _0x10a97a.dataset.customProviderEditorBody = "";
    _0x10a97a.hidden = true;
    _0x10a97a.setAttribute("aria-hidden", "true");
    const _0x2d2fcc = document.createElement("div");
    _0x2d2fcc.className = "custom-provider-discovery-grid";
    const _0x404be8 = document.createElement("div");
    _0x404be8.className = "custom-provider-discovery-field custom-provider-discovery-field--wide";
    const _0x2e7bec = _0x1abe80("settings-label", trCustomProvider("baseUrl"));
    const _0x52d67f = document.createElement("input");
    _0x52d67f.type = "text";
    _0x52d67f.className = "settings-input";
    _0x52d67f.placeholder = trCustomProvider("baseUrlPlaceholder");
    _0x52d67f.dataset.customProviderBaseUrl = "";
    markNonLoginTextInput(_0x52d67f);
    _0x404be8.append(_0x2e7bec, _0x52d67f);
    const _0x1c2fc5 = document.createElement("div");
    _0x1c2fc5.className = "custom-provider-discovery-field custom-provider-discovery-field--wide";
    const _0x132a89 = _0x1abe80("settings-label", trCustomProvider("apiKey"));
    const _0x427642 = document.createElement("input");
    _0x427642.type = "password";
    _0x427642.className = "settings-input";
    _0x427642.placeholder = trCustomProvider("apiKeyPlaceholder");
    _0x427642.dataset.customProviderApiKey = "";
    markApiSecretInput(_0x427642);
    _0x1c2fc5.append(_0x132a89, _0x427642);
    const _0x4a1f6f = document.createElement("div");
    _0x4a1f6f.className = "custom-provider-discovery-field custom-provider-discovery-field--wide";
    const _0x43b943 = _0x1abe80("settings-label", trCustomProvider("documentationUrl"));
    _0x43b943.append(_0x1ef43f(trCustomProvider("documentationAgentHint")));
    const _0x3fe9ba = document.createElement("input");
    _0x3fe9ba.type = "text";
    _0x3fe9ba.className = "settings-input";
    _0x3fe9ba.placeholder = trCustomProvider("documentationUrlPlaceholder");
    _0x3fe9ba.dataset.customProviderDocumentationUrl = "";
    markNonLoginTextInput(_0x3fe9ba);
    const _0x49c75f = document.createElement("div");
    _0x49c75f.className = "custom-provider-documentation-input-row";
    const _0x21e03c = document.createElement("button");
    _0x21e03c.type = "button";
    _0x21e03c.className = "settings-save-btn settings-btn-ghost custom-provider-documentation-file-btn";
    _0x21e03c.dataset.customProviderSelectDocument = "";
    _0x21e03c.textContent = trCustomProvider("selectDocumentationFile");
    const _0x241fc3 = document.createElement("input");
    _0x241fc3.type = "file";
    _0x241fc3.hidden = true;
    _0x241fc3.accept = ".md,.txt,.json,.yaml,.yml,.html,.htm";
    _0x241fc3.dataset.customProviderDocumentationFile = "";
    _0x49c75f.append(_0x3fe9ba, _0x21e03c, _0x241fc3);
    _0x4a1f6f.append(_0x43b943, _0x49c75f);
    _0x2d2fcc.append(_0x404be8, _0x1c2fc5, _0x4a1f6f);
    const _0x359243 = document.createElement("div");
    _0x359243.className = "custom-provider-discovery-result";
    _0x359243.dataset.customProviderResult = "";
    _0x359243.hidden = true;
    _0x359243.setAttribute("aria-hidden", "true");
    const _0x5e2f9d = document.createElement("div");
    _0x5e2f9d.className = "custom-provider-discovery-result-inner";
    _0x5e2f9d.dataset.customProviderResultInner = "";
    _0x359243.append(_0x5e2f9d);
    const _0x367917 = document.createElement("div");
    _0x367917.className = "custom-provider-discovery-actions";
    _0x367917.dataset.customProviderActions = "";
    _0x367917.hidden = true;
    const _0x876c11 = document.createElement("button");
    _0x876c11.type = "button";
    _0x876c11.className = "settings-save-btn settings-btn-ghost settings-api-test-btn";
    _0x876c11.dataset.customProviderVerifyParams = "";
    const _0xd51301 = document.querySelector("[data-provider-test] .settings-btn-icon")?.cloneNode(true);
    if (_0xd51301) {
      _0x876c11.append(_0xd51301);
    }
    const _0x69dcac = document.createElement("span");
    _0x69dcac.className = "settings-btn-label";
    _0x69dcac.dataset.i18n = "settings.apiInput.customProvider.verifyParameters";
    _0x69dcac.textContent = trCustomProvider("verifyParameters");
    _0x876c11.append(_0x69dcac);
    _0x876c11.hidden = true;
    _0x876c11.disabled = true;
    const _0x3ce532 = document.createElement("button");
    _0x3ce532.type = "button";
    _0x3ce532.className = "settings-save-btn";
    _0x3ce532.dataset.customProviderSaveSelected = "";
    _0x3ce532.dataset.i18n = "settings.apiInput.customProvider.addModels";
    _0x3ce532.textContent = trCustomProvider("addModels");
    _0x3ce532.hidden = true;
    _0x3ce532.disabled = true;
    _0x367917.append(_0x876c11, _0x3ce532);
    _0x10a97a.append(_0x2d2fcc, _0x359243, _0x367917);
    _0x5bd324.append(_0x440849, _0x38aa41, _0x10a97a);
    return _0x5bd324;
  }
  function _0x182436() {
    const _0x1fe1da = _0x4c3ca2();
    _0x1fe1da.forEach((_0x5941d9, _0x14fad7) => {
      if (!_0x5941d9.dataset.customProviderEditorId) {
        _0x5941d9.dataset.customProviderEditorId = "custom-provider-editor-" + (_0x14fad7 + 1);
      }
      const _0x495dba = String(_0x5941d9.dataset.customProviderEditorId || "").match(/(\d+)$/);
      if (_0x495dba) {
        _0x1255ce.editorSequence = Math.max(_0x1255ce.editorSequence, Number(_0x495dba[1]) || 1);
      }
    });
    _0x7c10a6(_0x4eb28a() || _0x1fe1da[0]);
    _0x11e308();
    _0x538d81();
    _0x4f93c8(_0x4eb28a());
  }
  function _0x832c82(_0x3af35b) {
    const _0x22ad71 = String(_0x3af35b || "").trim();
    if (!_0x22ad71) {
      return "";
    }
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(_0x22ad71)) {
      return _0x22ad71;
    }
    return "https://" + _0x22ad71;
  }
  function _0x35700a(_0x1720dd) {
    const _0x4390a1 = _0x832c82(_0x1720dd);
    if (!_0x4390a1) {
      return "";
    }
    try {
      return new URL(_0x4390a1).hostname.replace(/^www\./i, "");
    } catch {
      return String(_0x1720dd || "").trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split(/[/?#]/)[0].replace(/^www\./i, "");
    }
  }
  function _0x35eb2b(_0x252a0d) {
    return _0x35700a(_0x252a0d) || "";
  }
  function _0x1766d5(_0x5c97d8) {
    const _0x243095 = (_0x35700a(_0x5c97d8) || String(_0x5c97d8 || "").trim()).toLowerCase();
    const _0x394f34 = _0x243095.replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").replace(/_{2,}/g, "_");
    const _0x178fe1 = _0x394f34 || "provider";
    if (_0x178fe1.startsWith("custom_")) {
      return _0x178fe1;
    } else {
      return "custom_" + _0x178fe1;
    }
  }
  function _0xead749(_0x39881c) {
    const _0x42a0cf = _0x24a663(_0x39881c);
    const _0x67725c = String(_0x42a0cf.provider?.providerId || "").trim();
    if (_0x67725c) {
      return _0x67725c;
    }
    const _0x4cfadd = _0x498c84(_0x39881c);
    if (_0x4cfadd.baseUrl) {
      return String(_0x4cfadd.providerId || "").trim();
    } else {
      return "";
    }
  }
  function _0x169bf6(_0x446d3b, _0x5dd707) {
    const _0x58d9fa = String(_0x5dd707 || "").trim();
    if (!_0x58d9fa) {
      return false;
    }
    return _0x4c3ca2().some(_0x19c6ba => _0x19c6ba !== _0x446d3b && _0xead749(_0x19c6ba) === _0x58d9fa);
  }
  function _0x27c748(_0x4032c9, _0x442f50) {
    if (!_0x169bf6(_0x4032c9, _0x442f50)) {
      return false;
    }
    const _0x11dcd6 = trCustomProvider("duplicateProviderDomain");
    const {
      baseUrlEl: _0x181a84
    } = _0x177826(_0x4032c9);
    _0x59030b("danger", trApiInput("diagnostics.failed"), _0x11dcd6);
    window.showToast?.(_0x11dcd6, "warn", 7000);
    _0x181a84?.focus?.();
    return true;
  }
  function _0x325cdd(_0x2b673c) {
    const _0x488c5e = String(_0x2b673c || "unknown").trim().toLowerCase();
    const _0x10a68f = _0x9d1fcd[_0x488c5e] || _0x9d1fcd.unknown;
    return trCustomProvider(_0x10a68f);
  }
  function _0x4e25ed(_0x513ac3) {
    if (String(_0x513ac3 || "").trim().toLowerCase() === "documented") {
      return trCustomProvider("capabilityDocumented");
    } else {
      return trCustomProvider("capabilityUnverified");
    }
  }
  function _0x2156e9(_0x50d29e) {
    if (String(_0x50d29e || "").trim().toLowerCase() === "documented") {
      return trCustomProvider("capabilityDocumentedHint");
    } else {
      return trCustomProvider("capabilityUnverifiedHint");
    }
  }
  function _0x59030b(_0x1be272, _0x48dc8b, _0x34ca55 = "") {
    const {
      statusEl: _0x44eb65
    } = _0x23fba2();
    if (!_0x44eb65) {
      return;
    }
    _0x2cc33f.bind(_0x44eb65);
    _0x44eb65.classList.remove(..._0x5f58a8);
    const _0x154f8b = String(_0x48dc8b || "").trim();
    if (!_0x154f8b) {
      _0x2cc33f.hide(_0x44eb65);
      _0x44eb65.hidden = true;
      _0x44eb65.textContent = "";
      delete _0x44eb65.dataset.detail;
      _0x44eb65.removeAttribute("title");
      _0x44eb65.removeAttribute("aria-label");
      _0x44eb65.removeAttribute("tabindex");
      _0x44eb65.removeAttribute("data-provider-test-tooltip");
      return;
    }
    const _0x574366 = String(_0x1be272 || "").trim();
    if (_0x574366) {
      _0x44eb65.classList.add("settings-provider-status--" + _0x574366);
    }
    _0x44eb65.textContent = _0x154f8b;
    const _0x486326 = String(_0x34ca55 || "").trim();
    if (_0x486326) {
      _0x44eb65.dataset.detail = _0x486326;
      _0x44eb65.setAttribute("data-provider-test-tooltip", _0x486326);
      _0x44eb65.setAttribute("aria-label", _0x486326);
      _0x44eb65.setAttribute("tabindex", "0");
    } else {
      _0x2cc33f.hide(_0x44eb65);
      delete _0x44eb65.dataset.detail;
      _0x44eb65.removeAttribute("data-provider-test-tooltip");
      _0x44eb65.removeAttribute("aria-label");
      _0x44eb65.removeAttribute("tabindex");
    }
    _0x44eb65.removeAttribute("title");
    _0x44eb65.hidden = false;
  }
  function _0x3f2cef(_0x247a31, _0x2ff075) {
    if (!_0x247a31) {
      return () => {};
    }
    const _0x2ffc06 = _0x247a31.querySelector?.(".settings-btn-label");
    const _0x455f7d = _0x2ffc06?.textContent || _0x247a31.textContent;
    _0x247a31.disabled = true;
    if (_0x2ffc06) {
      _0x2ffc06.textContent = _0x2ff075;
    } else {
      _0x247a31.textContent = _0x2ff075;
    }
    return () => {
      _0x247a31.disabled = false;
      if (_0x2ffc06) {
        _0x2ffc06.textContent = _0x455f7d;
      } else {
        _0x247a31.textContent = _0x455f7d;
      }
    };
  }
  function _0x3b6b53(_0x1d9f3b) {
    const _0x486ea2 = String(_0x1d9f3b || "").trim().toLowerCase().match(/(\.[^.]+)$/);
    return _0x486ea2?.[1] || "";
  }
  function _0x5f5542(_0xf95603) {
    const _0x369680 = _0x24a663(_0xf95603);
    _0x369680.documentationDocument = null;
    const {
      documentationFileEl: _0x17b7f1
    } = _0x177826(_0xf95603);
    if (_0x17b7f1) {
      _0x17b7f1.value = "";
    }
  }
  async function _0x458e3f(_0x2b9b4b, _0x3f172f) {
    const _0x475e5e = _0x3f172f?.files?.[0];
    if (!_0x2b9b4b || !_0x475e5e) {
      return;
    }
    const _0x4a3fce = _0x3b6b53(_0x475e5e.name);
    if (!CUSTOM_PROVIDER_DOCUMENTATION_EXTENSIONS.has(_0x4a3fce)) {
      _0x5f5542(_0x2b9b4b);
      window.showToast?.(trCustomProvider("localDocumentationUnsupported"), "warn");
      return;
    }
    if (Number(_0x475e5e.size || 0) > CUSTOM_PROVIDER_DOCUMENTATION_MAX_BYTES) {
      _0x5f5542(_0x2b9b4b);
      window.showToast?.(trCustomProvider("localDocumentationTooLarge"), "warn");
      return;
    }
    try {
      const _0x1ded84 = await _0x475e5e.text();
      const _0x5684a = _0x24a663(_0x2b9b4b);
      _0x5684a.documentationDocument = {
        name: String(_0x475e5e.name || "").trim(),
        contentType: String(_0x475e5e.type || "").trim(),
        text: _0x1ded84
      };
      const {
        documentationUrlEl: _0x1348b3
      } = _0x177826(_0x2b9b4b);
      if (_0x1348b3) {
        _0x1348b3.value = trCustomProvider("localDocumentationSelected", {
          name: _0x475e5e.name
        });
      }
    } catch (_0x3bab66) {
      _0x5f5542(_0x2b9b4b);
      window.showToast?.(trCustomProvider("localDocumentationReadFailed", {
        error: _0x3bab66?.message || trApiInput("diagnostics.unknownError")
      }), "error");
    }
  }
  function _0x498c84(_0x28596e = _0x4eb28a()) {
    const {
      baseUrlEl: _0x8f6223,
      apiKeyEl: _0x3d1cd3,
      documentationUrlEl: _0x5ed608
    } = _0x177826(_0x28596e);
    const _0x4062ff = _0x832c82(_0x8f6223?.value);
    const _0x3f7398 = String(_0x3d1cd3?.value || "").trim();
    const _0x40d127 = _0x24a663(_0x28596e);
    const _0x377655 = _0x40d127.documentationDocument;
    const _0x3eb275 = _0x377655 ? "" : String(_0x5ed608?.value || "").trim();
    const _0x30a80b = _0x35eb2b(_0x4062ff);
    const _0x5efd98 = _0x1766d5(_0x4062ff);
    return {
      name: _0x30a80b,
      providerId: _0x5efd98,
      baseUrl: _0x4062ff,
      apiKey: _0x3f7398,
      documentationUrl: _0x3eb275,
      documentationDocument: _0x377655
    };
  }
  function _0x1d88bd(_0x312299 = {}) {
    const {
      baseUrlEl: _0x124723,
      apiKeyEl: _0x24d47a
    } = _0x177826(_0x4c3ca2()[0]);
    const _0xd4226e = _0x312299?.openai || {};
    if (_0x124723 && !String(_0x124723.value || "").trim() && _0xd4226e.apiUrl) {
      _0x124723.value = _0xd4226e.apiUrl;
    }
    if (_0x24d47a && !String(_0x24d47a.value || "").trim() && _0xd4226e.apiKey) {
      _0x24d47a.value = _0xd4226e.apiKey;
    }
  }
  function _0x1abe80(_0x26a244, _0xd8dcbf) {
    const _0x1ae2fe = document.createElement("div");
    _0x1ae2fe.className = _0x26a244;
    _0x1ae2fe.textContent = String(_0xd8dcbf || "");
    return _0x1ae2fe;
  }
  function _0x1ef43f(_0x3ed491) {
    const _0x41df44 = String(_0x3ed491 || "").trim();
    const _0x1188d7 = document.createElement("button");
    _0x1188d7.type = "button";
    _0x1188d7.className = "custom-provider-info-tip";
    _0x1188d7.setAttribute("aria-label", _0x41df44);
    _0x1188d7.textContent = "!";
    const _0x5e6a76 = document.createElement("span");
    _0x5e6a76.className = "custom-provider-info-tooltip";
    _0x5e6a76.setAttribute("aria-hidden", "true");
    _0x5e6a76.textContent = _0x41df44;
    _0x1188d7.append(_0x5e6a76);
    return _0x1188d7;
  }
  function _0x56a0b3(_0x55dbf9 = {}) {
    return String(_0x55dbf9?.upstreamModelId || "").trim();
  }
  function _0x4d63ec(_0xfed949 = {}) {
    const _0x111c4d = [...(Array.isArray(_0xfed949?.models) ? _0xfed949.models : []), ...(Array.isArray(_0xfed949?.unknown) ? _0xfed949.unknown : [])];
    const _0x2e6c87 = new Set();
    return _0x111c4d.filter(_0x5dc029 => {
      const _0x3682e0 = _0x56a0b3(_0x5dc029);
      if (!_0x3682e0 || _0x2e6c87.has(_0x3682e0)) {
        return false;
      }
      _0x2e6c87.add(_0x3682e0);
      return true;
    });
  }
  function _0xb47753(_0x405860, _0x50c95c = {}) {
    const _0x45d6dd = String(_0x50c95c?.kind || "unknown").trim().toLowerCase();
    if (_0x25c277.includes(_0x45d6dd)) {
      return _0x45d6dd;
    }
    const _0x4af145 = _0x24a663(_0x405860).assignedModelKinds.get(_0x56a0b3(_0x50c95c));
    if (_0x25c277.includes(_0x4af145)) {
      return _0x4af145;
    } else {
      return "unknown";
    }
  }
  function _0x2fc2e3(_0x5726b1, _0x605843 = []) {
    return (Array.isArray(_0x605843) ? _0x605843 : []).filter(_0x4a9b2c => _0x25c277.includes(_0xb47753(_0x5726b1, _0x4a9b2c)));
  }
  function _0x97c89d(_0x418f7c) {
    const _0x1a6343 = _0x24a663(_0x418f7c);
    _0x1a6343.activeKindFilter = "all";
    _0x1a6343.selectedModelKeys = new Set();
    _0x1a6343.assignedModelKinds = new Map();
    _0x1a6343.verifyingModelKeys = new Set();
  }
  function _0x124e15(_0x40018c, _0x428ae5 = []) {
    const _0x1cddf7 = _0x24a663(_0x40018c);
    const _0x256fc2 = _0x443361.includes(_0x1cddf7.activeKindFilter) ? _0x1cddf7.activeKindFilter : "all";
    const _0x397455 = Array.isArray(_0x428ae5) ? _0x428ae5 : [];
    if (_0x256fc2 === "all") {
      return _0x397455;
    }
    return _0x397455.filter(_0x36808e => String(_0x36808e?.kind || "").trim().toLowerCase() === _0x256fc2);
  }
  function _0x4622ff(_0xc9b8c4 = []) {
    const _0x220d59 = new Map(_0x443361.filter(_0xf6f17f => _0xf6f17f !== "all").map(_0xd6e624 => [_0xd6e624, 0]));
    (Array.isArray(_0xc9b8c4) ? _0xc9b8c4 : []).forEach(_0x4d0917 => {
      const _0x5b80d9 = String(_0x4d0917?.kind || "unknown").trim().toLowerCase();
      _0x220d59.set(_0x5b80d9, (_0x220d59.get(_0x5b80d9) || 0) + 1);
    });
    return _0x220d59;
  }
  function _0x20bd8a(_0x44fe7d = _0x4eb28a()) {
    const _0x2de16f = _0x24a663(_0x44fe7d);
    const _0x558183 = _0x2de16f.discovery || {};
    const _0x20adef = _0x2de16f.selectedModelKeys;
    const _0x54758f = _0x4d63ec(_0x558183);
    return _0x2fc2e3(_0x44fe7d, _0x54758f).filter(_0x3c0fd7 => _0x20adef.has(_0x56a0b3(_0x3c0fd7))).map(_0x3bbf82 => ({
      ..._0x3bbf82,
      kind: _0xb47753(_0x44fe7d, _0x3bbf82)
    }));
  }
  function _0x54e61c(_0x374c6c = _0x4eb28a()) {
    const {
      saveSelectedBtnEl: _0x136e58,
      verifyParamsBtnEl: _0x3b10c0,
      actionsEl: _0x5cf749
    } = _0x3d8a1c(_0x374c6c);
    if (!_0x136e58) {
      return;
    }
    const _0x19b969 = _0x20bd8a(_0x374c6c).length;
    const _0x224cf2 = _0x24a663(_0x374c6c);
    const _0x2f3b12 = !!_0x224cf2.discovery;
    const _0x2d723f = _0x374c6c?.dataset?.customProviderSyncedBundle === "true";
    const _0x317214 = getCustomProviderModelActionState({
      hasDiscovery: _0x2f3b12,
      hasSavedBundle: _0x2d723f,
      isAddingModels: _0x224cf2.isAddingModels === true,
      selectedCount: _0x19b969
    });
    _0x136e58.disabled = _0x317214.saveDisabled;
    _0x136e58.hidden = _0x317214.saveHidden;
    _0x136e58.dataset.i18n = "settings.apiInput.customProvider." + _0x317214.saveLabelKey;
    _0x136e58.textContent = trCustomProvider(_0x317214.saveLabelKey);
    if (_0x3b10c0) {
      _0x3b10c0.hidden = _0x317214.verifyHidden;
      _0x3b10c0.disabled = _0x317214.verifyDisabled;
    }
    if (_0x5cf749) {
      _0x5cf749.hidden = _0x317214.actionsHidden;
    }
  }
  function _0x489c46(_0x450201) {
    if (!_0x450201 || _0x450201.hidden) {
      return;
    }
    _0x450201.classList.remove("is-open");
    _0x450201.setAttribute("aria-hidden", "true");
    window.setTimeout?.(() => {
      if (!_0x450201.classList.contains("is-open")) {
        _0x450201.hidden = true;
      }
    }, 260);
  }
  function _0x55232e(_0x25c973) {
    if (!_0x25c973) {
      return;
    }
    _0x25c973.hidden = false;
    _0x25c973.setAttribute("aria-hidden", "false");
    if (!window.requestAnimationFrame?.(() => {
      _0x25c973.classList.add("is-open");
    })) {
      _0x25c973.classList.add("is-open");
    }
  }
  function _0x13e278(_0xd0a734 = _0x4eb28a()) {
    const {
      resultEl: _0x59cf2f,
      resultInnerEl: _0x19af33,
      saveSelectedBtnEl: _0x4dec41,
      verifyParamsBtnEl: _0x8a1084,
      actionsEl: _0x3d37c5
    } = _0x3d8a1c(_0xd0a734);
    _0x19af33?.replaceChildren();
    _0x489c46(_0x59cf2f);
    if (_0x4dec41) {
      _0x4dec41.hidden = true;
      _0x4dec41.disabled = true;
    }
    if (_0x8a1084) {
      _0x8a1084.hidden = true;
    }
    if (_0x3d37c5) {
      _0x3d37c5.hidden = true;
    }
    const _0x844fab = _0x24a663(_0xd0a734);
    _0x844fab.discovery = null;
    _0x844fab.provider = null;
    _0x844fab.activeKindFilter = "all";
    _0x844fab.selectedModelKeys = new Set();
    _0x844fab.assignedModelKinds = new Map();
    _0x844fab.verifyingModelKeys = new Set();
    _0x844fab.isAddingModels = false;
  }
  function _0x33b7b3(_0x45cb7b, _0x368727 = {}) {
    const _0x243195 = _0x56a0b3(_0x368727);
    const _0x122ac9 = _0x24a663(_0x45cb7b);
    const _0x42c2e8 = String(_0x368727?.kind || "unknown").trim().toLowerCase();
    const _0x19d6b9 = _0xb47753(_0x45cb7b, _0x368727);
    const _0x599f47 = _0x42c2e8 === "unknown" && _0x19d6b9 === "unknown";
    const _0x1fbbbe = _0x122ac9.selectedModelKeys.has(_0x243195) && !_0x599f47;
    const _0x5af942 = _0x122ac9.verifyingModelKeys?.has(_0x243195) === true;
    const _0x2cb946 = document.createElement("label");
    _0x2cb946.className = "custom-provider-model-option";
    _0x2cb946.dataset.customProviderModelKey = _0x243195;
    _0x2cb946.dataset.customProviderDetectedKind = _0x42c2e8;
    const _0x559520 = String(_0x368727?.capabilityStatus || "unverified").trim().toLowerCase();
    _0x2cb946.dataset.customProviderCapabilityStatus = _0x559520;
    if (_0x42c2e8 === "unknown") {
      _0x2cb946.tabIndex = 0;
    }
    _0x2cb946.classList.toggle("is-selected", _0x1fbbbe);
    _0x2cb946.classList.toggle("is-verifying", _0x5af942);
    if (_0x5af942) {
      _0x2cb946.setAttribute("aria-busy", "true");
    }
    const _0x42d0a3 = document.createElement("input");
    _0x42d0a3.type = "checkbox";
    _0x42d0a3.className = "custom-provider-model-option-checkbox";
    _0x42d0a3.dataset.customProviderModelCheckbox = "";
    _0x42d0a3.checked = _0x1fbbbe;
    _0x42d0a3.disabled = _0x599f47 || _0x5af942;
    _0x42d0a3.setAttribute("aria-label", _0x599f47 ? trCustomProvider("classifyBeforeSelecting") : String(_0x368727.upstreamModelId || ""));
    const _0x3c1280 = document.createElement("span");
    _0x3c1280.className = "custom-provider-model-option-title";
    _0x3c1280.textContent = String(_0x368727.upstreamModelId || "");
    _0x2cb946.append(_0x42d0a3, _0x3c1280);
    const _0x1226f7 = _0x368727?.isSaved === true;
    if (_0x5af942) {
      const _0x43bc41 = document.createElement("span");
      _0x43bc41.className = "custom-provider-model-verifying";
      _0x43bc41.setAttribute("aria-label", trCustomProvider("verifyingParameters"));
      _0x43bc41.title = trCustomProvider("verifyingParameters");
      const _0x5f51cb = document.createElement("span");
      _0x5f51cb.className = "custom-provider-model-loading-spinner";
      _0x5f51cb.setAttribute("aria-hidden", "true");
      _0x43bc41.append(_0x5f51cb);
      _0x2cb946.append(_0x43bc41);
    } else if (_0x1226f7 && _0x559520 !== "verified") {
      const _0x7b4c33 = document.createElement("span");
      _0x7b4c33.className = "custom-provider-model-kind-tag";
      _0x7b4c33.classList.toggle("is-success", isCustomProviderModelCapabilityRecognized(_0x368727));
      _0x7b4c33.textContent = _0x4e25ed(_0x559520);
      _0x7b4c33.title = _0x2156e9(_0x559520);
      _0x2cb946.append(_0x7b4c33);
    }
    if (_0x42c2e8 === "unknown" && _0x19d6b9 !== "unknown") {
      const _0x4c10e3 = document.createElement("span");
      _0x4c10e3.className = "custom-provider-model-kind-tag";
      _0x4c10e3.textContent = _0x325cdd(_0x19d6b9);
      _0x2cb946.append(_0x4c10e3);
    }
    if (_0x42c2e8 === "unknown") {
      const _0xa635c4 = _0x3a01b(_0x45cb7b, _0x368727);
      _0x2cb946.append(_0xa635c4);
    }
    return _0x2cb946;
  }
  function _0x42096f(_0x3f9cf4, _0xf7e4a = []) {
    const _0x9b9778 = _0x4622ff(_0xf7e4a);
    const _0x4fe04d = _0x24a663(_0x3f9cf4);
    const _0x54edeb = document.createElement("div");
    _0x54edeb.className = "custom-provider-kind-filter-row";
    _0x443361.forEach(_0x20974f => {
      if (_0x20974f === "unknown" && !(_0x9b9778.get("unknown") > 0)) {
        return;
      }
      const _0x55ccd6 = document.createElement("button");
      _0x55ccd6.type = "button";
      _0x55ccd6.className = "custom-provider-kind-filter";
      _0x55ccd6.dataset.customProviderKindFilter = _0x20974f;
      _0x55ccd6.classList.toggle("is-active", _0x20974f === _0x4fe04d.activeKindFilter);
      _0x55ccd6.setAttribute("aria-pressed", _0x20974f === _0x4fe04d.activeKindFilter ? "true" : "false");
      const _0x452623 = _0x20974f === "all" ? _0xf7e4a.length : _0x9b9778.get(_0x20974f) || 0;
      _0x55ccd6.textContent = _0x325cdd(_0x20974f) + " " + _0x452623;
      _0x54edeb.append(_0x55ccd6);
    });
    return _0x54edeb;
  }
  function _0x3a01b(_0x19951f, _0x16f66e = {}) {
    const _0x152bb6 = _0x56a0b3(_0x16f66e);
    const _0x23215d = _0xb47753(_0x19951f, _0x16f66e);
    const _0x599627 = document.createElement("div");
    _0x599627.className = "custom-provider-model-kind-toolbar";
    _0x599627.dataset.customProviderModelKindToolbar = _0x152bb6;
    _0x599627.setAttribute("aria-label", trCustomProvider("modelKindLabel"));
    const _0x525b7f = document.createElement("span");
    _0x525b7f.className = "custom-provider-model-kind-toolbar-label";
    _0x525b7f.textContent = trCustomProvider("modelKindLabel");
    _0x599627.append(_0x525b7f);
    _0x25c277.forEach(_0x14de62 => {
      const _0x3c8a23 = document.createElement("button");
      _0x3c8a23.type = "button";
      _0x3c8a23.className = "custom-provider-model-kind-button";
      _0x3c8a23.dataset.customProviderAssignKind = _0x14de62;
      const _0x5f2800 = _0x23215d === _0x14de62;
      _0x3c8a23.classList.toggle("is-active", _0x5f2800);
      _0x3c8a23.setAttribute("aria-pressed", String(_0x5f2800));
      _0x3c8a23.textContent = _0x325cdd(_0x14de62);
      _0x599627.append(_0x3c8a23);
    });
    return _0x599627;
  }
  function _0x5209f5() {
    const _0x1b582d = document.createElement("div");
    _0x1b582d.className = "custom-provider-selection-head";
    _0x1b582d.append(_0x1abe80("custom-provider-result-title", trCustomProvider("selectModels")));
    _0x1b582d.append(_0x1ef43f(trCustomProvider("selectionHint")));
    return _0x1b582d;
  }
  function _0x21d9b7(_0x4a3e4a) {
    const _0xccc4c3 = document.createElement("div");
    _0xccc4c3.className = "custom-provider-result-heading";
    _0xccc4c3.append(_0x5209f5(), _0x1abe80("custom-provider-result-title custom-provider-result-summary", _0x4a3e4a));
    return _0xccc4c3;
  }
  function _0x114566(_0x2be4b4, _0x3c25f6 = []) {
    const _0x36bfc3 = _0x124e15(_0x2be4b4, _0x3c25f6);
    const _0x1047bd = document.createElement("div");
    _0x1047bd.className = "custom-provider-selection";
    _0x1047bd.append(_0x42096f(_0x2be4b4, _0x3c25f6));
    const _0x2879b5 = document.createElement("div");
    _0x2879b5.className = "custom-provider-model-options";
    _0x2879b5.classList.toggle("has-kind-toolbar", _0x36bfc3.some(_0x40aaf9 => String(_0x40aaf9?.kind || "unknown").trim().toLowerCase() === "unknown"));
    _0x36bfc3.forEach(_0x17a4ff => _0x2879b5.append(_0x33b7b3(_0x2be4b4, _0x17a4ff)));
    if (_0x36bfc3.length > 0) {
      _0x1047bd.append(_0x2879b5);
    }
    if (_0x3c25f6.length === 0) {
      _0x1047bd.append(_0x1abe80("custom-provider-bundle-empty", trCustomProvider("noModelsDiscovered")));
    } else if (_0x36bfc3.length === 0) {
      _0x1047bd.append(_0x1abe80("custom-provider-bundle-empty", trCustomProvider("noModelsInFilter")));
    }
    return _0x1047bd;
  }
  function _0x36e960(_0x14544d, _0x50126b = {}, _0xe8340a = {}) {
    const {
      resultEl: _0x5ca000,
      resultInnerEl: _0x517ca9
    } = _0x3d8a1c(_0x14544d);
    if (!_0x5ca000 || !_0x517ca9) {
      return;
    }
    const _0x58d051 = _0x4d63ec(_0x50126b);
    const _0x1c745d = Array.isArray(_0x50126b.unknown) ? _0x50126b.unknown : [];
    const _0x516587 = _0x2fc2e3(_0x14544d, _0x58d051);
    _0x517ca9.replaceChildren();
    _0x517ca9.append(_0x21d9b7(trCustomProvider("resultSummary", {
      count: _0x58d051.length,
      supported: _0x516587.length,
      unknown: _0x1c745d.length
    })));
    _0x517ca9.append(_0x114566(_0x14544d, _0x58d051));
    _0x55232e(_0x5ca000);
    _0x54e61c(_0x14544d);
  }
  function _0x2da9d6(_0x42dced, _0xd98fed = {}, _0x13a116 = {}) {
    const {
      resultEl: _0x1a2595
    } = _0x3d8a1c(_0x42dced);
    const _0x120647 = captureCustomProviderModelSelectionScroll(_0x1a2595);
    _0x36e960(_0x42dced, _0xd98fed, _0x13a116);
    restoreCustomProviderModelSelectionScroll(_0x1a2595, _0x120647);
  }
  function _0x34473e() {
    const {
      editorListEl: _0x1de501,
      addBtnEl: _0x3b6d33
    } = _0x23fba2();
    if (!_0x1de501) {
      return;
    }
    const _0x415056 = _0x310062();
    _0x1de501.insertBefore(_0x415056, _0x3b6d33 || null);
    _0x11e308();
    _0x538d81();
    _0x7c10a6(_0x415056, {
      clearResult: true
    });
    _0x59030b("", "");
    const {
      baseUrlEl: _0x3bfda2
    } = _0x177826(_0x415056);
    _0x3bfda2?.focus?.();
  }
  function _0x5e74fd(_0x63fd5 = {}) {
    return String(_0x63fd5?.sourceId || _0x63fd5?.bundle?.sourceId || "").trim();
  }
  function _0x581843(_0x22621b) {
    return String(_0x22621b || "").replace(/^custom-provider:/, "").trim();
  }
  function _0x5b21ff(_0x550835 = {}) {
    const _0x2bc6d8 = _0x550835?.bundle && typeof _0x550835.bundle === "object" ? _0x550835.bundle : {};
    const _0x36bb2d = _0x2bc6d8.provider && typeof _0x2bc6d8.provider === "object" ? _0x2bc6d8.provider : {};
    const _0x5d7a99 = _0x581843(_0x5e74fd(_0x550835));
    const _0x139ea7 = String(_0x36bb2d.providerId || _0x550835.providerId || _0x5d7a99).trim();
    const _0x49bbc4 = String(_0x36bb2d.baseUrl || _0x36bb2d.apiUrl || "").trim();
    const _0x2075d6 = String(_0x36bb2d.name || _0x550835.displayName || _0x35eb2b(_0x49bbc4) || _0x139ea7).trim();
    return {
      ..._0x36bb2d,
      providerId: _0x139ea7,
      name: _0x2075d6,
      baseUrl: _0x49bbc4
    };
  }
  function _0x162e86(_0x16ab64) {
    if (!_0x16ab64) {
      return "";
    }
    const _0x3cca1e = _0x24a663(_0x16ab64);
    return String(_0x3cca1e.provider?.providerId || _0x16ab64.dataset?.customProviderProviderId || "").trim();
  }
  function _0x328b81(_0x534014) {
    const _0xa2aa7b = String(_0x534014 || "").trim();
    if (!_0xa2aa7b) {
      return null;
    }
    return _0x4c3ca2().find(_0x377598 => _0x162e86(_0x377598) === _0xa2aa7b) || null;
  }
  function _0x31d16b(_0x350805) {
    if (!_0x350805) {
      return false;
    }
    const _0x1ee5c9 = _0x24a663(_0x350805);
    const {
      baseUrlEl: _0x5e636b,
      apiKeyEl: _0x584215,
      documentationUrlEl: _0x6c9f22
    } = _0x177826(_0x350805);
    return !_0x1ee5c9.provider && !_0x1ee5c9.discovery && !_0x1ee5c9.titleText && !String(_0x5e636b?.value || "").trim() && !String(_0x584215?.value || "").trim() && !String(_0x6c9f22?.value || "").trim() && !_0x1ee5c9.documentationDocument;
  }
  function _0xf6cbb5() {
    return _0x4c3ca2().find(_0x31d16b) || null;
  }
  function _0x3341d8() {
    const {
      editorListEl: _0x4bdaca,
      addBtnEl: _0x3a5091
    } = _0x23fba2();
    if (!_0x4bdaca) {
      return null;
    }
    const _0x48ed09 = _0x310062();
    _0x4bdaca.insertBefore(_0x48ed09, _0x3a5091 || null);
    return _0x48ed09;
  }
  function _0x34eb50(_0x5541af = {}) {
    return getCustomProviderManifestUpstreamModelId(_0x5541af);
  }
  function _0x454c6c(_0x59ee00 = {}) {
    const _0x297012 = Array.isArray(_0x59ee00?.models) ? _0x59ee00.models.map(_0x5d71bb => {
      const _0x32368e = _0x5d71bb?.extensions?.customProvider?.capability || {};
      return {
        upstreamModelId: _0x34eb50(_0x5d71bb),
        kind: String(_0x5d71bb?.kind || "").trim().toLowerCase(),
        isSaved: true,
        capabilityStatus: String(_0x32368e?.status || "unverified").trim().toLowerCase(),
        capabilitySource: String(_0x32368e?.source || "stored-bundle").trim()
      };
    }).filter(_0x1de58b => _0x1de58b.upstreamModelId && _0x1de58b.kind) : [];
    return {
      provider: _0x59ee00?.provider || {},
      models: _0x297012,
      unknown: []
    };
  }
  function _0x311d78(_0x1fbec2, _0x14642e = {}) {
    if (!_0x1fbec2) {
      return;
    }
    const _0x3d6cda = _0x14642e?.bundle && typeof _0x14642e.bundle === "object" ? _0x14642e.bundle : {};
    const _0x5bd70c = _0x5b21ff(_0x14642e);
    if (!_0x5bd70c.providerId) {
      return;
    }
    const _0x44d185 = _0x454c6c(_0x3d6cda);
    _0x44d185.provider = _0x5bd70c;
    const _0x450e95 = _0x24a663(_0x1fbec2);
    const _0x14f2d7 = _0x162e86(_0x1fbec2);
    const _0x3deb40 = _0x14f2d7 === _0x5bd70c.providerId && _0x450e95.titleManuallyEdited && _0x3eb7dc(_0x450e95.titleText);
    const _0x2dbe85 = _0x14f2d7 === _0x5bd70c.providerId && !!_0x450e95.documentationDocument;
    const {
      baseUrlEl: _0x4eb89f,
      apiKeyEl: _0xb7c397,
      documentationUrlEl: _0x39f83b,
      documentationFileEl: _0x4d6653
    } = _0x177826(_0x1fbec2);
    const _0x14d234 = _0x1ff891?.providers?.[_0x5bd70c.providerId] || {};
    if (_0x4eb89f) {
      _0x4eb89f.value = _0x5bd70c.baseUrl || _0x14d234.apiUrl || "";
    }
    if (_0xb7c397) {
      _0xb7c397.value = _0x14d234.apiKey || "";
    }
    if (_0x39f83b && !_0x2dbe85) {
      _0x39f83b.value = String(_0x5bd70c.documentationUrl || _0x14d234.documentationUrl || "").trim();
    }
    if (!_0x2dbe85) {
      if (_0x4d6653) {
        _0x4d6653.value = "";
      }
      _0x450e95.documentationDocument = null;
    }
    _0x1fbec2.dataset.customProviderProviderId = _0x5bd70c.providerId;
    _0x1fbec2.dataset.customProviderSyncedBundle = "true";
    _0x450e95.provider = _0x5bd70c;
    _0x450e95.discovery = _0x44d185;
    _0x450e95.isAddingModels = false;
    const _0x4fff2e = _0x44d185.unknown.length > 0;
    _0x450e95.activeKindFilter = _0x443361.includes(_0x450e95.activeKindFilter) && (_0x450e95.activeKindFilter !== "unknown" || _0x4fff2e) ? _0x450e95.activeKindFilter : "all";
    _0x450e95.selectedModelKeys = new Set(_0x2fc2e3(_0x1fbec2, _0x44d185.models).map(_0x56a0b3));
    _0x450e95.assignedModelKinds = new Map();
    if (!_0x3deb40) {
      _0x5ab135(_0x1fbec2, _0x5bd70c.name, {
        manual: true
      });
    } else {
      _0x402697(_0x1fbec2);
    }
    _0x36e960(_0x1fbec2, _0x44d185, _0x5bd70c);
  }
  function _0xd7e333(_0x5561b9) {
    if (!_0x5561b9) {
      return;
    }
    if (_0x4c3ca2().length <= 1) {
      _0x356149(_0x5561b9);
      _0x7c10a6(_0x5561b9, {
        clearStatus: true
      });
      return;
    }
    _0x268354(_0x5561b9);
  }
  function _0x242920(_0x52a77e = []) {
    const {
      editorListEl: _0x4c4a48
    } = _0x23fba2();
    if (!_0x4c4a48) {
      return;
    }
    const _0x2a97ed = (Array.isArray(_0x52a77e) ? _0x52a77e : []).filter(_0x2e9ab5 => _0x2e9ab5?.bundle && _0x5b21ff(_0x2e9ab5).providerId);
    const _0x4c10bc = new Set(_0x2a97ed.map(_0x80f4c2 => _0x5b21ff(_0x80f4c2).providerId));
    _0x2a97ed.forEach(_0x1d4ddc => {
      const _0xe792e0 = _0x5b21ff(_0x1d4ddc);
      const _0xc1abd4 = _0x328b81(_0xe792e0.providerId) || _0xf6cbb5() || _0x3341d8();
      _0x311d78(_0xc1abd4, _0x1d4ddc);
    });
    _0x4c3ca2().forEach(_0x12c86b => {
      const _0x4e6aec = _0x162e86(_0x12c86b);
      if (_0x12c86b.dataset?.customProviderSyncedBundle === "true" && _0x4e6aec && !_0x4c10bc.has(_0x4e6aec)) {
        _0xd7e333(_0x12c86b);
      }
    });
    if (_0x4c3ca2().length === 0) {
      _0x3341d8();
    }
    _0x11e308();
    _0x538d81();
    _0x4f93c8(_0x4eb28a());
  }
  function _0x234616(_0x6c9e66 = {}) {
    getRememberedCustomProviderConfigs(_0x6c9e66).forEach(_0x569375 => {
      const _0x417800 = _0x328b81(_0x569375.providerId) || _0xf6cbb5() || _0x3341d8();
      if (!_0x417800) {
        return;
      }
      const _0x3a2829 = _0x24a663(_0x417800);
      const {
        baseUrlEl: _0x24d865,
        apiKeyEl: _0x3d7fc7,
        documentationUrlEl: _0x3ea5f2
      } = _0x177826(_0x417800);
      if (_0x24d865) {
        _0x24d865.value = _0x569375.baseUrl;
      }
      if (_0x3d7fc7) {
        _0x3d7fc7.value = _0x569375.apiKey;
      }
      if (_0x3ea5f2 && !_0x3a2829.documentationDocument) {
        _0x3ea5f2.value = _0x569375.documentationUrl;
      }
      _0x417800.dataset.customProviderProviderId = _0x569375.providerId;
      if (!_0x3a2829.provider) {
        _0x3a2829.provider = {
          providerId: _0x569375.providerId,
          name: _0x569375.name,
          baseUrl: _0x569375.baseUrl,
          documentationUrl: _0x569375.documentationUrl
        };
      }
      if (!_0x3a2829.discovery) {
        _0x5ab135(_0x417800, _0x569375.name, {
          manual: true
        });
      }
    });
    _0x4c3ca2().forEach(_0x2e946a => {
      const _0x5dc6e1 = _0x162e86(_0x2e946a);
      if (!_0x5dc6e1) {
        return;
      }
      const _0x1c96f3 = _0x6c9e66?.[_0x5dc6e1] || {};
      const {
        baseUrlEl: _0x2d8b89,
        apiKeyEl: _0x4ebfb1,
        documentationUrlEl: _0x5ee45a
      } = _0x177826(_0x2e946a);
      if (_0x2d8b89 && _0x1c96f3.apiUrl) {
        _0x2d8b89.value = _0x1c96f3.apiUrl;
      }
      if (_0x4ebfb1 && _0x1c96f3.apiKey) {
        _0x4ebfb1.value = _0x1c96f3.apiKey;
      }
      if (_0x5ee45a && !_0x24a663(_0x2e946a).documentationDocument && _0x1c96f3.documentationUrl) {
        _0x5ee45a.value = _0x1c96f3.documentationUrl;
      }
    });
    _0x11e308();
    _0x538d81();
    _0x4f93c8(_0x4eb28a());
  }
  function _0x5b2723(_0x101a8b = []) {
    let _0x1464cf = false;
    const _0x961afa = new Set();
    _0x101a8b.forEach(_0x10c48e => {
      const _0x3c5617 = _0x10c48e?.bundle;
      const _0x3999d9 = String(_0x10c48e?.sourceId || _0x3c5617?.sourceId || "").trim();
      if (!_0x3999d9 || !_0x3c5617) {
        return;
      }
      _0x961afa.add(_0x3999d9);
      const _0x31b7cb = _0xcedc53.get(_0x3999d9);
      if (_0x31b7cb) {
        try {
          unregisterManifestBundle(_0x31b7cb);
          _0x1464cf = true;
        } catch (_0x5da261) {
          console.warn("[Custom Provider] unregister previous bundle failed:", _0x5da261);
        }
      }
      try {
        registerManifestBundle(_0x3c5617);
        _0xcedc53.set(_0x3999d9, _0x3c5617);
        _0x1464cf = true;
      } catch (_0x6308d1) {
        console.warn("[Custom Provider] register bundle failed:", _0x6308d1);
        _0xcedc53.delete(_0x3999d9);
      }
    });
    [..._0xcedc53.entries()].forEach(([_0x5e205f, _0x4041d6]) => {
      if (_0x961afa.has(_0x5e205f)) {
        return;
      }
      try {
        unregisterManifestBundle(_0x4041d6);
        _0x1464cf = true;
      } catch (_0x449dfb) {
        console.warn("[Custom Provider] unregister stale bundle failed:", _0x449dfb);
      }
      _0xcedc53.delete(_0x5e205f);
    });
    return _0x1464cf;
  }
  async function _0x6fbe38(_0x31e209 = {}) {
    const _0x4c1fba = !!_0x31e209.silent;
    if (typeof _0x18e7b5 !== "function") {
      if (!_0x4c1fba) {
        _0x59030b("danger", trCustomProvider("apiUnsupported"));
      }
      return [];
    }
    try {
      const _0x5da359 = await _0x18e7b5();
      const _0x4e7716 = Array.isArray(_0x5da359?.items) ? _0x5da359.items : [];
      const _0x3e022f = _0x5b2723(_0x4e7716);
      _0x242920(_0x4e7716);
      if (_0x3e022f) {
        _0x1a2612?.();
      }
      if (!_0x4c1fba) {
        _0x59030b("", "");
      }
      return _0x4e7716;
    } catch (_0x50aab0) {
      const _0x5634a2 = trCustomProvider("loadBundlesFailed", {
        error: _0x50aab0?.message || trApiInput("diagnostics.unknownError")
      });
      if (!_0x4c1fba) {
        _0x59030b("danger", trApiInput("diagnostics.failed"), _0x5634a2);
        window.showToast?.(_0x5634a2, "error");
      }
      return [];
    }
  }
  async function _0x3eb249(_0x135d1e = {}, _0x5897e2 = "") {
    if (typeof _0x56734f !== "function") {
      return;
    }
    const _0xe61d42 = String(_0x135d1e.providerId || "").trim();
    if (!_0xe61d42) {
      return;
    }
    const _0x48b43d = {
      ...(_0x1ff891?.providers || {})
    };
    _0x48b43d[_0xe61d42] = {
      ...(_0x48b43d[_0xe61d42] || {}),
      apiUrl: String(_0x135d1e.baseUrl || _0x135d1e.apiUrl || "").trim(),
      apiKey: String(_0x5897e2 || "").trim(),
      label: String(_0x135d1e.name || _0xe61d42).trim(),
      documentationUrl: String(_0x135d1e.documentationUrl || "").trim()
    };
    const _0x30c330 = {
      ...(_0x1ff891 || {}),
      providers: _0x48b43d
    };
    await _0x56734f(_0x30c330);
    _0x1ff891 = _0x30c330;
    _0x1e0dbc(_0x30c330);
    _0x1a2612?.();
  }
  function _0x3bd505(_0x91cba1, _0x55f4a7 = {}) {
    return _0x3eb7dc(_0x42b58a(_0x91cba1)) || String(_0x55f4a7.name || "").trim() || _0x35eb2b(_0x55f4a7.baseUrl);
  }
  function _0x190e35(_0x469bd2 = null) {
    if (typeof window.openSubscriptionDialog === "function") {
      window.openSubscriptionDialog({
        modelId: CUSTOM_PROVIDER_VIP_MODEL_ID,
        provider: "aicanvas",
        onSuccess: _0x469bd2
      });
      return;
    }
    window.showToast?.(trCustomProvider("vipRequired"), "warn");
  }
  function _0x25f967(_0x5b7d52 = null) {
    const _0x254ef3 = _0x28bf1f?.getStateRaw?.().subscription || {};
    if (isCustomProviderAccessAllowed(_0x254ef3)) {
      return true;
    }
    _0x190e35(_0x5b7d52);
    return false;
  }
  async function _0x46c503(_0x1686ab, _0x153764) {
    if (!_0x25f967(() => {
      _0x46c503(_0x1686ab, _0x153764).catch(() => {});
    })) {
      return;
    }
    if (typeof _0x4fd02f !== "function") {
      _0x59030b("danger", trCustomProvider("apiUnsupported"));
      window.showToast?.(trCustomProvider("apiUnsupported"), "error");
      return;
    }
    _0x7c10a6(_0x1686ab);
    const _0x4a25d4 = _0x498c84(_0x1686ab);
    if (!_0x4a25d4.baseUrl || !_0x4a25d4.apiKey) {
      const {
        baseUrlEl: _0x5ee62c,
        apiKeyEl: _0x5cbba2
      } = _0x177826(_0x1686ab);
      _0x59030b("danger", trApiInput("diagnostics.failed"));
      window.showToast?.(trCustomProvider("fillRequired"), "warn");
      if (!_0x4a25d4.baseUrl) {
        _0x5ee62c?.focus?.();
      } else {
        _0x5cbba2?.focus?.();
      }
      return;
    }
    if (_0x27c748(_0x1686ab, _0x4a25d4.providerId)) {
      return;
    }
    const _0x421590 = _0x3f2cef(_0x153764, trCustomProvider("discovering"));
    try {
      _0x59030b("testing", trCustomProvider("discovering"));
      const {
        documentationDocument: _0xb1b724,
        ..._0x27a523
      } = _0x4a25d4;
      const _0x57c61c = _0x4d812d(_0x4a25d4.providerId);
      const _0x284628 = await _0x4fd02f(_0x27a523);
      const _0x4e0032 = mergeCustomProviderDiscoveryCapabilities(_0x284628, _0x57c61c);
      const _0x3df81f = {
        ...(_0x4e0032.provider || {}),
        name: _0x4a25d4.name,
        providerId: _0x4a25d4.providerId,
        baseUrl: _0x4e0032.provider?.baseUrl || _0x4a25d4.baseUrl,
        documentationUrl: _0x4a25d4.documentationUrl
      };
      _0x30bd62(_0x1686ab, _0x3df81f.name);
      const _0x4d792b = {
        ..._0x3df81f,
        name: _0x3bd505(_0x1686ab, _0x3df81f)
      };
      await _0x3eb249(_0x4d792b, _0x4a25d4.apiKey);
      _0x1686ab.dataset.customProviderProviderId = _0x4d792b.providerId;
      delete _0x1686ab.dataset.customProviderSyncedBundle;
      _0x97c89d(_0x1686ab);
      const _0x114397 = _0x24a663(_0x1686ab);
      _0x114397.discovery = _0x4e0032;
      _0x114397.provider = _0x4d792b;
      _0x114397.isAddingModels = true;
      _0x36e960(_0x1686ab, _0x4e0032, _0x4d792b);
      _0x538d81();
      const _0x4c97ac = _0x4d63ec(_0x4e0032);
      const _0x3238fe = _0x2fc2e3(_0x1686ab, _0x4c97ac).length;
      if (_0x3238fe === 0) {
        const _0x295209 = trCustomProvider("configSavedNoSupportedModels");
        _0x59030b("partial", _0x295209);
        window.showToast?.(_0x295209, "warn", 9000);
        return;
      }
      _0x59030b("success", trCustomProvider("resultSummary", {
        count: _0x4c97ac.length,
        supported: _0x3238fe,
        unknown: Array.isArray(_0x4e0032.unknown) ? _0x4e0032.unknown.length : 0
      }));
    } catch (_0x79034d) {
      const _0x33fddc = trCustomProvider("saveFailed", {
        error: _0x79034d?.message || trApiInput("diagnostics.unknownError")
      });
      _0x59030b("danger", trApiInput("diagnostics.failed"), _0x33fddc);
      window.showToast?.(_0x33fddc, "error", 9000);
    } finally {
      _0x421590();
    }
  }
  async function _0x51c65f(_0x1b0efb, _0x122bc9) {
    if (!_0x25f967(() => {
      _0x51c65f(_0x1b0efb, _0x122bc9).catch(() => {});
    })) {
      return;
    }
    if (typeof _0x28aa81 !== "function" || typeof _0xba8a0d !== "function" || typeof _0x4bfdb2 !== "function") {
      _0x59030b("danger", trCustomProvider("apiUnsupported"));
      window.showToast?.(trCustomProvider("apiUnsupported"), "error");
      return;
    }
    const _0x83661b = _0x20bd8a(_0x1b0efb);
    if (_0x83661b.length === 0) {
      window.showToast?.(trCustomProvider("noModelsSelected"), "warn");
      return;
    }
    const _0x47667f = _0x498c84(_0x1b0efb);
    if (_0x27c748(_0x1b0efb, _0x47667f.providerId)) {
      return;
    }
    const _0x43e5d4 = _0x24a663(_0x1b0efb);
    const _0x4b5ded = {
      ...(_0x43e5d4.provider || {}),
      name: _0x3bd505(_0x1b0efb, _0x43e5d4.provider),
      providerId: _0x43e5d4.provider?.providerId || _0x47667f.providerId,
      baseUrl: _0x43e5d4.provider?.baseUrl || _0x47667f.baseUrl,
      documentationUrl: _0x47667f.documentationUrl
    };
    const _0x3a100d = _0x4d812d(_0x4b5ded.providerId);
    const _0x761b79 = _0x3f2cef(_0x122bc9, trCustomProvider("validating"));
    try {
      _0x59030b("testing", trCustomProvider("validating"));
      const _0x48c418 = await _0x28aa81({
        provider: _0x4b5ded,
        models: _0x83661b
      });
      const _0x3f1ea = mergeCustomProviderRecognizedProfiles(_0x48c418?.bundle, _0x3a100d);
      const _0x3572a2 = Array.isArray(_0x3f1ea?.models) ? _0x3f1ea.models.length : 0;
      if (_0x3572a2 === 0) {
        throw new Error(trCustomProvider("noSupportedModels"));
      }
      const _0x41f02a = await _0xba8a0d(_0x3f1ea);
      if (!_0x41f02a?.ok) {
        throw new Error(Array.isArray(_0x41f02a?.errors) && _0x41f02a.errors.length ? _0x41f02a.errors.join("; ") : trApiInput("diagnostics.failed"));
      }
      const _0x121ad0 = _0x41f02a.bundle || _0x3f1ea;
      await _0x3eb249(_0x4b5ded, _0x47667f.apiKey);
      await _0x4bfdb2(_0x121ad0);
      _0x43e5d4.isAddingModels = false;
      _0x1b0efb.dataset.customProviderSyncedBundle = "true";
      await trackRuntimeManifestLoad(_0x6fbe38({
        silent: true
      }));
      _0x54e61c(_0x1b0efb);
      const _0x58cb51 = getCustomProviderSaveStatus(_0x121ad0?.models);
      const _0xfde512 = trCustomProvider(_0x58cb51.key, _0x58cb51);
      _0x59030b("success", _0xfde512);
      window.showToast?.(_0xfde512, "success");
    } catch (_0x253411) {
      const _0x3f27c4 = trCustomProvider("saveFailed", {
        error: _0x253411?.message || trApiInput("diagnostics.unknownError")
      });
      _0x59030b("danger", trApiInput("diagnostics.failed"), _0x3f27c4);
      window.showToast?.(_0x3f27c4, "error", 9000);
    } finally {
      _0x761b79();
    }
  }
  async function _0x115f58(_0x300eb9, _0x3d8880) {
    if (!_0x25f967(() => {
      _0x115f58(_0x300eb9, _0x3d8880).catch(() => {});
    })) {
      return;
    }
    if (typeof _0x2f5bb7 !== "function" || typeof _0x28aa81 !== "function" || typeof _0xba8a0d !== "function" || typeof _0x4bfdb2 !== "function") {
      _0x59030b("danger", trCustomProvider("apiUnsupported"));
      window.showToast?.(trCustomProvider("apiUnsupported"), "error");
      return;
    }
    const _0x5be294 = _0x498c84(_0x300eb9);
    const _0x2b82b8 = _0x20bd8a(_0x300eb9);
    if (_0x2b82b8.length === 0) {
      window.showToast?.(trCustomProvider("noModelsSelected"), "warn");
      return;
    }
    const _0x595e2b = _0x2b82b8;
    const _0x292c68 = _0x24a663(_0x300eb9);
    if (_0x27c748(_0x300eb9, _0x5be294.providerId)) {
      return;
    }
    const _0x5df263 = {
      ...(_0x292c68.provider || {}),
      name: _0x3bd505(_0x300eb9, _0x292c68.provider),
      providerId: _0x292c68.provider?.providerId || _0x5be294.providerId,
      baseUrl: _0x292c68.provider?.baseUrl || _0x5be294.baseUrl,
      documentationUrl: _0x5be294.documentationUrl
    };
    const _0x1ed99c = _0x4d812d(_0x5df263.providerId);
    const {
      resultEl: _0xe011d2
    } = _0x3d8a1c(_0x300eb9);
    const _0xd8a274 = captureCustomProviderModelSelectionScroll(_0xe011d2);
    _0x292c68.verifyingModelKeys = new Set(_0x2b82b8.map(_0x56a0b3).filter(Boolean));
    _0x36e960(_0x300eb9, _0x292c68.discovery, _0x292c68.provider);
    restoreCustomProviderModelSelectionScroll(_0xe011d2, _0xd8a274);
    const _0x4a1743 = _0x3f2cef(_0x3d8880, trCustomProvider("verifyingParameters"));
    try {
      _0x59030b("testing", trCustomProvider("analyzingDocumentation"));
      const _0x51255f = await _0x2f5bb7({
        provider: _0x5df263,
        models: _0x595e2b,
        documentationUrl: _0x5be294.documentationUrl,
        documentationDocument: _0x5be294.documentationDocument
      });
      if (_0x51255f?.agentUnavailable) {
        throw new Error(trCustomProvider("documentationAgentUnavailable"));
      }
      if (!_0x51255f?.bundle) {
        throw new Error(trCustomProvider("documentationNoMatchingProfile"));
      }
      const _0x59fbdb = Number(_0x51255f?.analysis?.documentedModels || 0);
      if (_0x59fbdb <= 0) {
        throw new Error(trCustomProvider(resolveCustomProviderDocumentationFailureKey(_0x51255f?.analysis)));
      }
      const _0x554f13 = await _0x28aa81({
        provider: _0x5df263,
        models: _0x2b82b8
      });
      const _0x59263f = mergeCustomProviderRecognizedProfiles(_0x554f13?.bundle, _0x1ed99c);
      const _0x4efcf2 = mergeCustomProviderRecognizedProfiles(_0x59263f, _0x51255f.bundle);
      const _0x5b8090 = await _0xba8a0d(_0x4efcf2);
      if (!_0x5b8090?.ok) {
        throw new Error(Array.isArray(_0x5b8090?.errors) && _0x5b8090.errors.length ? _0x5b8090.errors.join("; ") : trApiInput("diagnostics.failed"));
      }
      const _0x40fb36 = _0x5b8090.bundle || _0x4efcf2;
      const _0x33e87e = Array.isArray(_0x40fb36?.models) ? _0x40fb36.models.length : 0;
      const _0xd1fc43 = (Array.isArray(_0x40fb36?.models) ? _0x40fb36.models : []).filter(isCustomProviderModelCapabilityRecognized).length;
      await _0x3eb249(_0x5df263, _0x5be294.apiKey);
      await _0x4bfdb2(_0x40fb36);
      await trackRuntimeManifestLoad(_0x6fbe38({
        silent: true
      }));
      const _0x3437ae = _0xd1fc43 < _0x33e87e ? "parametersVerifiedPartial" : "parametersVerified";
      const _0x364193 = trCustomProvider(_0x3437ae, {
        count: _0x33e87e,
        documented: _0xd1fc43
      });
      _0x59030b(_0xd1fc43 < _0x33e87e ? "partial" : "success", _0x364193);
      window.showToast?.(_0x364193, _0xd1fc43 < _0x33e87e ? "warn" : "success", _0xd1fc43 < _0x33e87e ? 9000 : undefined);
    } catch (_0x14de13) {
      const _0x12fedc = _0x14de13?.message || trApiInput("diagnostics.unknownError");
      const _0x369f38 = _0x12fedc.includes("Automatic API documentation discovery failed") ? trCustomProvider("documentationAutoDiscoveryFailed") : _0x12fedc;
      const _0x1352b5 = trCustomProvider("parameterVerificationFailed", {
        error: _0x369f38
      });
      _0x59030b("danger", trApiInput("diagnostics.failed"), _0x1352b5);
      window.showToast?.(_0x1352b5, "error", 9000);
    } finally {
      _0x292c68.verifyingModelKeys = new Set();
      _0x36e960(_0x300eb9, _0x292c68.discovery, _0x292c68.provider);
      restoreCustomProviderModelSelectionScroll(_0xe011d2, _0xd8a274);
      _0x4a1743();
    }
  }
  function _0x55fb17() {
    const {
      cardEl: _0x869517,
      editorEl: _0x170ba9
    } = _0x23fba2();
    if (!_0x869517) {
      return;
    }
    _0x182436();
    _0x170ba9?.addEventListener("focusin", _0x18db28 => {
      const _0xed8f82 = _0x18db28.target?.closest?.("[data-custom-provider-editor-id]");
      if (_0xed8f82 && _0x170ba9.contains(_0xed8f82)) {
        _0x7c10a6(_0xed8f82);
      }
    });
    _0x170ba9?.addEventListener("wheel", _0x911daf => handleCustomProviderResultWheel(_0x911daf, _0x170ba9), {
      passive: false
    });
    _0x170ba9?.addEventListener("click", _0x17aabf => {
      const _0x347cdf = _0x17aabf.target?.closest?.("[data-custom-provider-editor-id]");
      if (_0x347cdf && _0x170ba9.contains(_0x347cdf)) {
        _0x7c10a6(_0x347cdf);
      }
      const _0x10a9f0 = _0x17aabf.target?.closest?.("[data-custom-provider-add]");
      if (_0x10a9f0 && _0x170ba9.contains(_0x10a9f0)) {
        _0x34473e();
        return;
      }
      const _0x4a16a4 = _0x17aabf.target?.closest?.("[data-custom-provider-delete]");
      if (_0x4a16a4 && _0x170ba9.contains(_0x4a16a4)) {
        const _0x5b9887 = _0x4a16a4.closest("[data-custom-provider-editor-id]");
        _0xab1de4(_0x5b9887, _0x4a16a4).catch(() => {});
        return;
      }
      const _0x13ab00 = _0x17aabf.target?.closest?.("[data-custom-provider-select-document]");
      if (_0x13ab00 && _0x170ba9.contains(_0x13ab00)) {
        const _0x170146 = _0x13ab00.closest("[data-custom-provider-editor-id]");
        const {
          documentationFileEl: _0x903e07
        } = _0x177826(_0x170146);
        if (_0x903e07) {
          _0x903e07.value = "";
        }
        _0x903e07?.click?.();
        return;
      }
      const _0x1650e5 = _0x17aabf.target?.closest?.("[data-custom-provider-discover]");
      if (_0x1650e5 && _0x170ba9.contains(_0x1650e5)) {
        const _0x47d56e = _0x1650e5.closest("[data-custom-provider-editor-id]");
        _0x46c503(_0x47d56e, _0x1650e5).catch(() => {});
        return;
      }
      const _0x43fc3c = _0x17aabf.target?.closest?.("[data-custom-provider-save-selected]");
      if (_0x43fc3c && _0x170ba9.contains(_0x43fc3c)) {
        const _0xed262f = _0x43fc3c.closest("[data-custom-provider-editor-id]");
        _0x51c65f(_0xed262f, _0x43fc3c).catch(() => {});
        return;
      }
      const _0x3a1536 = _0x17aabf.target?.closest?.("[data-custom-provider-verify-params]");
      if (_0x3a1536 && _0x170ba9.contains(_0x3a1536)) {
        const _0x3bd635 = _0x3a1536.closest("[data-custom-provider-editor-id]");
        _0x115f58(_0x3bd635, _0x3a1536).catch(() => {});
        return;
      }
      const _0x36926b = _0x17aabf.target?.closest?.("[data-custom-provider-kind-filter]");
      if (_0x36926b && _0x170ba9.contains(_0x36926b)) {
        const _0x499b71 = _0x36926b.closest("[data-custom-provider-editor-id]");
        const _0x24f2a7 = String(_0x36926b.dataset.customProviderKindFilter || "all");
        if (!_0x443361.includes(_0x24f2a7)) {
          return;
        }
        const _0x267479 = _0x24a663(_0x499b71);
        _0x267479.activeKindFilter = _0x24f2a7;
        _0x267479.provider = {
          ...(_0x267479.provider || {}),
          name: _0x3bd505(_0x499b71, _0x267479.provider)
        };
        _0x36e960(_0x499b71, _0x267479.discovery, _0x267479.provider);
        return;
      }
      const _0x5b00c0 = _0x17aabf.target?.closest?.("[data-custom-provider-assign-kind]");
      if (_0x5b00c0 && _0x170ba9.contains(_0x5b00c0)) {
        _0x17aabf.preventDefault();
        _0x17aabf.stopPropagation();
        const _0x218763 = _0x5b00c0.closest("[data-custom-provider-editor-id]");
        const _0x48fb9f = _0x5b00c0.closest("[data-custom-provider-model-kind-toolbar]");
        const _0x5487d0 = String(_0x48fb9f?.dataset.customProviderModelKindToolbar || "");
        const _0xc8ca15 = String(_0x5b00c0.dataset.customProviderAssignKind || "");
        if (!_0x218763 || !_0x5487d0 || !_0x25c277.includes(_0xc8ca15)) {
          return;
        }
        const _0x5ef021 = _0x24a663(_0x218763);
        _0x5ef021.assignedModelKinds.set(_0x5487d0, _0xc8ca15);
        _0x5ef021.selectedModelKeys.add(_0x5487d0);
        delete _0x218763.dataset.customProviderSyncedBundle;
        _0x2da9d6(_0x218763, _0x5ef021.discovery, _0x5ef021.provider);
        return;
      }
    });
    _0x170ba9?.addEventListener("dblclick", _0x4d660c => {
      const _0x114152 = _0x4d660c.target?.closest?.("[data-custom-provider-editor-tab]");
      if (!_0x114152 || !_0x170ba9.contains(_0x114152)) {
        return;
      }
      const _0x281008 = _0x114152.closest("[data-custom-provider-editor-id]");
      _0x7c10a6(_0x281008);
      _0x568a0b(_0x281008);
    });
    _0x170ba9.addEventListener("change", _0x262e06 => {
      const _0x34ff80 = _0x262e06.target?.closest?.("[data-custom-provider-documentation-file]");
      if (_0x34ff80 && _0x170ba9.contains(_0x34ff80)) {
        const _0x139ee6 = _0x34ff80.closest("[data-custom-provider-editor-id]");
        _0x458e3f(_0x139ee6, _0x34ff80).catch(() => {});
        return;
      }
      const _0x28712f = _0x262e06.target?.closest?.("[data-custom-provider-model-checkbox]");
      if (!_0x28712f || !_0x170ba9.contains(_0x28712f)) {
        return;
      }
      const _0x1f0942 = _0x28712f.closest("[data-custom-provider-model-key]");
      const _0x154311 = _0x28712f.closest("[data-custom-provider-editor-id]");
      if (_0x1f0942 && _0x154311) {
        const _0x503028 = String(_0x1f0942.dataset.customProviderModelKey || "");
        if (!_0x503028) {
          return;
        }
        const _0x21a51c = _0x24a663(_0x154311);
        const _0x2029ff = String(_0x1f0942.dataset.customProviderDetectedKind || "unknown");
        const _0x450c52 = !!_0x28712f.checked;
        const _0x3bc8aa = applyCustomProviderModelSelectionState(_0x21a51c, {
          modelKey: _0x503028,
          detectedKind: _0x2029ff,
          selected: _0x450c52
        });
        delete _0x154311.dataset.customProviderSyncedBundle;
        if (_0x3bc8aa) {
          _0x2da9d6(_0x154311, _0x21a51c.discovery, _0x21a51c.provider);
          return;
        }
        _0x1f0942.classList.toggle("is-selected", _0x450c52);
        _0x54e61c(_0x154311);
      }
    });
    _0x170ba9.addEventListener("input", _0x67e65a => {
      const _0x316ece = _0x67e65a.target?.closest?.("[data-custom-provider-documentation-url]");
      if (!_0x316ece || !_0x170ba9.contains(_0x316ece)) {
        return;
      }
      const _0x44b1e8 = _0x316ece.closest("[data-custom-provider-editor-id]");
      if (_0x24a663(_0x44b1e8).documentationDocument) {
        _0x5f5542(_0x44b1e8);
      }
    });
    trackRuntimeManifestLoad(_0x6fbe38({
      silent: true
    })).catch(() => {});
  }
  function _0x31d1c0() {
    return Array.from(document.querySelectorAll("[data-apimart-route]"));
  }
  function _0x484a1f(_0x4dbc4a, _0xb7d3a1 = false) {
    const _0x524f0a = document.getElementById("providerRouteUrl-apimart");
    if (!_0x524f0a) {
      return;
    }
    const _0x2824e9 = String(_0x4dbc4a || getApimartApiUrlForRoute(DEFAULT_APIMART_ROUTE_ID)).trim();
    _0x524f0a.textContent = _0xb7d3a1 ? trApiInput("route.custom", {
      value: _0x2824e9
    }) : _0x2824e9;
  }
  function _0xa80694() {
    const _0x40e810 = _0x31d1c0().find(_0xb7a3f => _0xb7a3f.classList.contains("is-active"));
    const _0x325a22 = String(_0x40e810?.dataset?.apimartRoute || "").trim();
    if (_0x325a22) {
      return getApimartRouteById(_0x325a22);
    } else {
      return null;
    }
  }
  function _0x52ed0f(_0xef76d0, _0x5cf472 = {}) {
    const _0x4ac762 = String(_0xef76d0 || "").trim();
    const _0x1be8c9 = _0x4ac762 ? getApimartRouteById(_0x4ac762) : null;
    const _0x44eba4 = String(_0x5cf472?.customUrl || "").trim();
    _0x31d1c0().forEach(_0x12e142 => {
      const _0x3a0150 = !!_0x1be8c9 && String(_0x12e142.dataset.apimartRoute || "") === _0x1be8c9.id;
      _0x12e142.classList.toggle("is-active", _0x3a0150);
      _0x12e142.setAttribute("aria-pressed", _0x3a0150 ? "true" : "false");
    });
    _0x484a1f(_0x1be8c9?.apiUrl || _0x44eba4, !!_0x44eba4 && !_0x1be8c9);
  }
  function _0x30db5a(_0x30d682 = {}) {
    const _0x5cc6fd = String(_0x30d682?.apiUrl || "").trim();
    const _0x2610a1 = resolveApimartRouteByApiUrl(_0x5cc6fd);
    if (_0x2610a1) {
      _0x52ed0f(_0x2610a1.id);
      return;
    }
    const _0x27260a = _0x30d682?.routeId ? getApimartRouteById(_0x30d682.routeId) : null;
    if (_0x27260a && !_0x5cc6fd) {
      _0x52ed0f(_0x27260a.id);
      return;
    }
    if (_0x5cc6fd) {
      _0x52ed0f("", {
        customUrl: _0x5cc6fd
      });
      return;
    }
    _0x52ed0f(DEFAULT_APIMART_ROUTE_ID);
  }
  function _0x1b967c(_0x2908f4 = {}) {
    const _0x16e953 = _0x2908f4 && typeof _0x2908f4 === "object" ? {
      ..._0x2908f4
    } : {};
    const _0x2625bb = _0xa80694();
    if (_0x2625bb) {
      _0x16e953.routeId = _0x2625bb.id;
      _0x16e953.apiUrl = _0x2625bb.apiUrl;
    } else if (_0x16e953.apiUrl) {
      delete _0x16e953.routeId;
    }
    return _0x16e953;
  }
  function _0x145156() {
    const _0x1d8567 = document.getElementById("projectNameText");
    if (_0x1d8567) {
      _0x1d8567.addEventListener("keydown", _0x49f6f9 => {
        if (_0x49f6f9.key === "Enter") {
          _0x49f6f9.preventDefault();
          _0x1d8567.blur();
        }
      });
      _0x1d8567.addEventListener("click", () => {
        _0x1d8567.focus();
      });
    }
    const _0x1fceb8 = document.getElementById("userAvatar");
    const _0x59da42 = document.getElementById("avatarMenu");
    if (_0x1fceb8 && _0x59da42) {
      registerSidebarSubmenu({
        key: "settings",
        button: _0x1fceb8,
        panel: _0x59da42,
        openClass: "open",
        isOpen: () => _0x59da42.classList.contains("open")
      });
    }
  }
  function _0x4878b4() {
    return {
      settingsCardEl: document.getElementById("dreaminaSettingsCard"),
      statusTextEl: document.getElementById("dreaminaStatusText"),
      messageTextEl: document.getElementById("dreaminaStatusMessage"),
      creditTextEl: document.getElementById("dreaminaCreditText"),
      btnAuthEl: document.getElementById("btnDreaminaAuth"),
      btnQrAuthEl: document.getElementById("btnDreaminaQrAuth"),
      btnLogoutEl: document.getElementById("btnDreaminaLogout"),
      modalOverlayEl: document.getElementById("dreaminaLoginModal"),
      modalCardEl: document.getElementById("dreaminaLoginModalCard"),
      modalCloseEl: document.getElementById("dreaminaModalClose"),
      modalMessageEl: document.getElementById("dreaminaModalMessage"),
      modalQrWrapEl: document.getElementById("dreaminaModalQrWrap"),
      modalQrImageEl: document.getElementById("dreaminaModalQrImage"),
      modalWaitEl: document.getElementById("dreaminaModalWait"),
      modalWaitTextEl: document.getElementById("dreaminaModalWaitText"),
      modalRetryEl: document.getElementById("dreaminaModalRetry"),
      manualGuideEl: document.getElementById("dreaminaManualGuide"),
      manualAuthUrlEl: document.getElementById("dreaminaManualAuthUrl"),
      manualImportJsonEl: document.getElementById("dreaminaManualImportJson"),
      manualOpenAuthEl: document.getElementById("dreaminaManualOpenAuth"),
      manualCopyAuthEl: document.getElementById("dreaminaManualCopyAuth"),
      manualImportJsonBtnEl: document.getElementById("dreaminaManualImportJsonBtn")
    };
  }
  function _0x30627f() {
    const {
      settingsCardEl: _0x297cb8
    } = _0x4878b4();
    if (!_0x297cb8) {
      return false;
    }
    const _0x11c45d = true;
    _0x297cb8.hidden = !_0x11c45d;
    if (!_0x11c45d) {
      _0x132c4c({
        force: true,
        rememberDismissal: false
      });
      _0x5c81f0();
    }
    return _0x11c45d;
  }
  function _0x5c81f0() {
    if (_0x3f6b48.pollTimer) {
      clearTimeout(_0x3f6b48.pollTimer);
      _0x3f6b48.pollTimer = null;
    }
    _0x3f6b48.pollGeneration += 1;
  }
  function _0x2ebf2e() {
    const _0x167852 = _0x3f6b48.pollGeneration;
    if (_0x3f6b48.pollTimer || _0x3f6b48.pollInFlight && _0x3f6b48.pollInFlightGeneration === _0x167852) {
      return;
    }
    const _0x35f1ea = async () => {
      if (_0x167852 !== _0x3f6b48.pollGeneration) {
        return;
      }
      _0x3f6b48.pollTimer = null;
      if (_0x3f6b48.pollInFlight && _0x3f6b48.pollInFlightGeneration === _0x167852) {
        return;
      }
      _0x3f6b48.pollInFlight = true;
      _0x3f6b48.pollInFlightGeneration = _0x167852;
      try {
        await _0x2c9975({
          silent: true
        });
      } finally {
        if (_0x3f6b48.pollInFlightGeneration === _0x167852) {
          _0x3f6b48.pollInFlight = false;
        }
        if (_0x167852 !== _0x3f6b48.pollGeneration) {
          return;
        }
        if (_0x3f6b48.lastStatus?.runtime?.active) {
          _0x3f6b48.pollTimer = setTimeout(_0x35f1ea, 800);
        }
      }
    };
    _0x35f1ea();
  }
  function _0x261d54() {
    _0x3f6b48.qrImageLoadError = false;
    _0x3f6b48.lastQrImageUrl = "";
    _0x3f6b48.lastQrImageRequestedAt = 0;
    _0x3f6b48.lastQrImageLoadedAt = 0;
    _0x3f6b48.lastQrImageErrorAt = 0;
    _0x3f6b48.lastQrImageErrorMessage = "";
  }
  function _0x1a18df(_0x4fd89e, _0x40db48 = Date.now()) {
    const _0xe3172 = String(_0x4fd89e || "").trim();
    if (!_0xe3172) {
      return "";
    }
    const _0x992ee0 = _0xe3172.includes("?") ? "&" : "?";
    return "" + _0xe3172 + _0x992ee0 + "cb=" + encodeURIComponent(String(_0x40db48));
  }
  function _0x5c4583(_0x512f37, {
    withCacheBust = false
  } = {}) {
    const _0xb4a9a9 = Number(_0x512f37?.qrVersion || 0);
    const _0x4e9033 = _0x407896?.(_0xb4a9a9 || Date.now()) || "";
    if (!_0x4e9033) {
      return "";
    }
    if (withCacheBust) {
      return _0x1a18df(_0x4e9033);
    } else {
      return _0x4e9033;
    }
  }
  function _0x5926c2(_0x166309) {
    const _0x26bba2 = _0x166309?.runtime || {};
    const _0x271e4b = String(_0x26bba2?.phase || "");
    const _0x11f328 = !!_0x26bba2?.qrAvailable;
    return _0x271e4b === "qr_ready" && _0x11f328 && !!_0x3f6b48.qrImageLoadError;
  }
  function _0x12e53f(_0x499e4b) {
    const _0x1ffa4f = _0x499e4b?.runtime || {};
    if (Array.isArray(_0x1ffa4f?.outputTail)) {
      return _0x1ffa4f.outputTail;
    } else {
      return [];
    }
  }
  function _0x228fdc(_0x4bc274) {
    const _0x2476f3 = _0x12e53f(_0x4bc274);
    return _0x2476f3.some(_0x5747b8 => {
      const _0x3bfd47 = String(_0x5747b8 || "").toLowerCase();
      return _0x3bfd47.includes("自动打开浏览器失败") || _0x3bfd47.includes("open headless login page") || _0x3bfd47.includes("executable file not found") || _0x3bfd47.includes("google-chrome");
    });
  }
  function _0x478d20(_0x30957a) {
    const _0x39c3da = _0x30957a?.runtime || {};
    const _0x4ff4bb = extractDreaminaManualLinksFromOutputLines(_0x12e53f(_0x30957a));
    return {
      ..._0x4ff4bb,
      authorizeUrl: String(_0x39c3da?.authorizeUrl || "").trim() || _0x4ff4bb.authorizeUrl,
      callbackUrl: String(_0x39c3da?.callbackUrl || "").trim() || _0x4ff4bb.callbackUrl
    };
  }
  function _0x52023f(_0x57285b) {
    const {
      manualAuthUrlEl: _0x45e2f1,
      manualOpenAuthEl: _0x3c22c6,
      manualCopyAuthEl: _0x54c444
    } = _0x4878b4();
    if (!_0x45e2f1 || !_0x3c22c6 || !_0x54c444) {
      return;
    }
    const _0x4a8728 = _0x478d20(_0x57285b || _0x3f6b48.lastStatus || {});
    const _0x216139 = String(_0x4a8728?.authorizeUrl || "").trim();
    _0x45e2f1.value = _0x216139 || trDreamina("waitingAuthUrl");
    _0x3c22c6.disabled = !_0x216139;
    _0x54c444.disabled = !_0x216139;
  }
  function _0x43472a(_0x57bc1f) {
    const {
      manualGuideEl: _0x3a6676
    } = _0x4878b4();
    if (!_0x3a6676) {
      return;
    }
    _0x52023f(_0x57bc1f || _0x3f6b48.lastStatus || {});
    _0x3a6676.hidden = !_0x3f6b48.manualGuideOpen;
  }
  function _0x34b327(_0xf5b88c = _0x3f6b48.lastStatus || {}) {
    const _0x106bfe = _0x478d20(_0xf5b88c);
    return String(_0x106bfe?.authorizeUrl || "").trim();
  }
  async function _0xd1c828(_0x575166, _0x2adf2b) {
    const _0x11a593 = String(_0x575166 || "").trim();
    if (!_0x11a593) {
      window.showToast?.(trDreamina("missingValue", {
        label: _0x2adf2b
      }), "warning");
      return false;
    }
    try {
      await openExternalLink(_0x11a593, {
        label: _0x2adf2b
      });
      return true;
    } catch (_0x281260) {}
    const _0x56569d = await _0x36d340(_0x11a593);
    if (_0x56569d) {
      window.showToast?.(trDreamina("browserOpenFailedCopied", {
        label: _0x2adf2b
      }), "warning");
    } else {
      window.showToast?.(trDreamina("browserOpenFailedCopyFirst", {
        label: _0x2adf2b
      }), "warning");
    }
    return false;
  }
  async function _0x5208b4(_0x21d64f, _0x276740) {
    const _0x48c907 = String(_0x21d64f || "").trim();
    if (!_0x48c907) {
      window.showToast?.(trDreamina("missingValue", {
        label: _0x276740
      }), "warning");
      return;
    }
    const _0x159a2 = await _0x36d340(_0x48c907);
    if (_0x159a2) {
      window.showToast?.(trDreamina("copySuccess", {
        label: _0x276740
      }), "success");
    } else {
      window.showToast?.(trDreamina("copyFailed", {
        label: _0x276740
      }), "error");
    }
  }
  async function _0x5d15eb() {
    await _0xd1c828(_0x34b327(), trDreamina("authLinkLabel"));
  }
  async function _0x38160e() {
    await _0x5208b4(_0x34b327(), trDreamina("authLinkLabel"));
  }
  function _0x5af600(_0x240e81) {
    const _0x3a1cce = String(_0x240e81 || "").trim();
    if (!_0x3a1cce) {
      throw new Error(trDreamina("jsonPasteRequired"));
    }
    const _0x5d7f61 = [];
    _0x5d7f61.push(_0x3a1cce);
    const _0x3d7eb0 = _0x3a1cce.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (_0x3d7eb0?.[1]) {
      _0x5d7f61.push(String(_0x3d7eb0[1]).trim());
    }
    const _0x1067eb = _0x3a1cce.indexOf("{");
    const _0x551abc = _0x3a1cce.lastIndexOf("}");
    if (_0x1067eb >= 0 && _0x551abc > _0x1067eb) {
      _0x5d7f61.push(_0x3a1cce.slice(_0x1067eb, _0x551abc + 1).trim());
    }
    for (const _0x286d28 of _0x5d7f61) {
      if (!_0x286d28) {
        continue;
      }
      try {
        const _0x78c897 = JSON.parse(_0x286d28);
        if (!_0x78c897 || typeof _0x78c897 !== "object" || Array.isArray(_0x78c897)) {
          throw new Error("INVALID_OBJECT");
        }
        return _0x78c897;
      } catch (_0x5eb22c) {
        if (_0x5eb22c?.message === "INVALID_OBJECT") {
          throw new Error(trDreamina("jsonMustBeObject"));
        }
      }
    }
    throw new Error(trDreamina("jsonFormatInvalid"));
  }
  async function _0x136d00() {
    if (typeof _0x41e916 !== "function") {
      window.showToast?.(trDreamina("jsonImportUnsupported"), "error");
      return;
    }
    const {
      manualImportJsonEl: _0x18bc84
    } = _0x4878b4();
    const _0x5e2520 = String(_0x18bc84?.value || "");
    let _0x4fea04 = null;
    try {
      _0x4fea04 = _0x5af600(_0x5e2520);
    } catch (_0x54ffa5) {
      window.showToast?.(_0x54ffa5?.message || trDreamina("jsonParseFailed"), "warning");
      return;
    }
    try {
      const _0x20b236 = await _0x41e916(_0x4fea04);
      if (_0x20b236?.success === false) {
        throw new Error(_0x20b236?.message || trDreamina("importFailed"));
      }
      if (_0x20b236?.status) {
        _0x93757d(_0x20b236.status);
      } else {
        await _0x2de842({
          force: true,
          silent: true
        });
      }
      if (_0x18bc84) {
        _0x18bc84.value = "";
      }
      _0x2ebf2e();
      window.showToast?.(trDreamina("importedSyncing"), "success");
    } catch (_0x44bb08) {
      window.showToast?.(_0x44bb08?.message || trDreamina("importFailed"), "error");
    }
  }
  function _0x32ba77(_0x986daf, _0x509a28 = {}) {
    _0x3f6b48.qrImageLoadError = !!_0x986daf;
    if (_0x986daf) {
      _0x3f6b48.lastQrImageErrorAt = Date.now();
      _0x3f6b48.lastQrImageErrorMessage = String(_0x509a28?.message || "").trim() || trDreamina("qrLoadFailed");
      return;
    }
    _0x3f6b48.lastQrImageLoadedAt = Date.now();
    _0x3f6b48.lastQrImageErrorAt = 0;
    _0x3f6b48.lastQrImageErrorMessage = "";
  }
  function _0x590e55(_0x165536, _0x49c29e, _0x113358 = {}) {
    if (!_0x165536) {
      return false;
    }
    const _0x1e2201 = !!_0x113358?.withCacheBust;
    const _0x39a2bc = _0x5c4583(_0x49c29e, {
      withCacheBust: _0x1e2201
    });
    if (!_0x39a2bc) {
      return false;
    }
    const _0x11799f = String(_0x165536.getAttribute("src") || "").trim();
    if (!_0x1e2201 && _0x11799f === _0x39a2bc) {
      return false;
    }
    _0x3f6b48.lastQrImageUrl = _0x39a2bc;
    _0x3f6b48.lastQrImageRequestedAt = Date.now();
    _0x3f6b48.qrImageLoadError = false;
    _0x3f6b48.lastQrImageErrorMessage = "";
    _0x165536.src = _0x39a2bc;
    return true;
  }
  function _0x8a048d(_0x53f6df) {
    if (!_0x53f6df || _0x3f6b48.qrImageListenersBound) {
      return;
    }
    _0x53f6df.addEventListener("load", () => {
      _0x32ba77(false);
      if (_0x3f6b48.lastStatus) {
        _0x314801(_0x3f6b48.lastStatus);
      }
    });
    _0x53f6df.addEventListener("error", () => {
      _0x32ba77(true, {
        message: trDreamina("qrLoadFailed")
      });
      if (_0x3f6b48.lastStatus) {
        _0x314801(_0x3f6b48.lastStatus);
      }
    });
    _0x3f6b48.qrImageListenersBound = true;
  }
  function _0x515429(_0x3646ae) {
    const _0x2b23b5 = Number(_0x3646ae?.startedAt || 0);
    if (_0x2b23b5 <= 0) {
      return 0;
    }
    const _0x43963a = Number(_0x3646ae?.completedAt || 0);
    const _0x3d4ee5 = _0x43963a > 0 ? _0x43963a : Date.now();
    return Math.max(0, _0x3d4ee5 - _0x2b23b5);
  }
  function _0x2b5eef(_0xdbce13) {
    const _0x4f3cc9 = _0xdbce13?.runtime || {};
    if (!_0x4f3cc9?.active) {
      return false;
    }
    const _0x24e247 = String(_0x4f3cc9?.phase || "");
    if (!["preparing", "starting"].includes(_0x24e247)) {
      return false;
    }
    return _0x515429(_0x4f3cc9) >= _0x5ee7f9;
  }
  async function _0x36d340(_0x1c9923) {
    const _0x4b5cc7 = String(_0x1c9923 || "");
    if (!_0x4b5cc7) {
      return false;
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(_0x4b5cc7);
        return true;
      }
    } catch (_0x1986d9) {}
    try {
      const _0x44f70b = document.createElement("textarea");
      _0x44f70b.value = _0x4b5cc7;
      _0x44f70b.setAttribute("readonly", "readonly");
      _0x44f70b.style.position = "fixed";
      _0x44f70b.style.left = "-9999px";
      document.body?.appendChild(_0x44f70b);
      _0x44f70b.select();
      const _0x35f4fe = document.execCommand("copy");
      _0x44f70b.remove();
      return !!_0x35f4fe;
    } catch (_0x453cdb) {
      return false;
    }
  }
  function _0x254b57(_0xb2437a) {
    if (!_0xb2437a || typeof _0xb2437a !== "object") {
      return trDreamina("creditPlaceholder");
    }
    const _0x283629 = Number(_0xb2437a.total_credit || 0);
    const _0x42fc56 = Number(_0xb2437a.vip_credit || 0);
    const _0x41f43a = Number(_0xb2437a.gift_credit || 0);
    const _0x3b6de0 = Number(_0xb2437a.purchase_credit || 0);
    return trDreamina("creditTotal", {
      total: _0x283629,
      vip: _0x42fc56,
      gift: _0x41f43a,
      purchase: _0x3b6de0
    });
  }
  function _0x1f39c6(_0x41ccb5) {
    const _0x1186c9 = String(_0x41ccb5?.phase || "");
    const _0x4bae05 = Number(_0x41ccb5?.completedAt || 0);
    const _0x263931 = _0x4bae05 > 0 ? _0x1186c9 + ":" + _0x4bae05 + ":" + (_0x41ccb5?.error || "") : "";
    if (!_0x263931 || _0x263931 === _0x3f6b48.lastToastKey) {
      return;
    }
    _0x3f6b48.lastToastKey = _0x263931;
    if (_0x1186c9 === "success") {
      window.showToast?.(trDreamina("loginSuccess"), "success");
      return;
    }
    if (_0x1186c9 === "reused") {
      window.showToast?.(trDreamina("loginReused"), "info");
      return;
    }
    if (_0x1186c9 === "failed") {
      window.showToast?.(_0x41ccb5?.error || trDreamina("loginFailed"), "error");
    }
  }
  function _0x36d613(_0xf2d8de) {
    const _0x2ca960 = _0xf2d8de?.runtime || {};
    const _0x5848e7 = !!_0xf2d8de?.loggedIn;
    const _0x15393a = !!_0x2ca960?.active;
    const _0x57a8b0 = String(_0x2ca960?.phase || "");
    if (_0x15393a && _0x57a8b0 === "preparing") {
      return trDreamina("statusPreparing");
    }
    if (_0x15393a && ["oauth_ready", "polling"].includes(_0x57a8b0)) {
      return trDreamina("statusWaitingAuth");
    }
    if (_0x15393a) {
      return trDreamina("statusLoggingIn");
    }
    if (_0x5848e7) {
      return trDreamina("statusLoggedIn");
    }
    return trDreamina("statusLoggedOut");
  }
  function _0x50b290(_0x2ae952) {
    return getDreaminaStatusSessionKey(_0x2ae952);
  }
  function _0x22adf0(_0x426f77) {
    if (reconcileDreaminaSessionUiState(_0x426f77, _0x3f6b48)) {
      _0x261d54();
    }
  }
  function _0x2bd731() {
    if (_0x3f6b48.modalCloseTimer) {
      clearTimeout(_0x3f6b48.modalCloseTimer);
      _0x3f6b48.modalCloseTimer = null;
    }
  }
  function _0x28c664({
    clearDismissed = false
  } = {}) {
    const {
      modalOverlayEl: _0x5954d6
    } = _0x4878b4();
    if (!_0x5954d6) {
      return;
    }
    _0x2bd731();
    if (clearDismissed) {
      _0x3f6b48.dismissedSessionKey = "";
    }
    _0x5954d6.hidden = false;
  }
  function _0x132c4c({
    force = false,
    rememberDismissal = true
  } = {}) {
    const {
      modalOverlayEl: _0x94f90c,
      modalQrImageEl: _0x18d276,
      manualImportJsonEl: _0x4111ca
    } = _0x4878b4();
    _0x2bd731();
    if (rememberDismissal) {
      const _0x4d9c61 = _0x50b290(_0x3f6b48.lastStatus);
      if (_0x4d9c61) {
        _0x3f6b48.dismissedSessionKey = _0x4d9c61;
      }
    }
    if (_0x94f90c) {
      _0x94f90c.hidden = true;
    }
    if (_0x18d276) {
      _0x18d276.removeAttribute("src");
    }
    if (_0x4111ca) {
      _0x4111ca.value = "";
    }
    _0x3f6b48.manualGuideOpen = false;
    _0x43472a(_0x3f6b48.lastStatus || {});
  }
  function _0x31f93e(_0x1c1d53 = 0) {
    _0x2bd731();
    _0x3f6b48.modalCloseTimer = setTimeout(() => {
      _0x132c4c({
        force: true,
        rememberDismissal: false
      });
    }, Math.max(0, Number(_0x1c1d53) || 0));
  }
  function _0x4353b7(_0x42128d) {
    const _0x28c0ee = _0x42128d?.runtime || {};
    const _0x359b67 = String(_0x28c0ee?.phase || "");
    const _0x4ab0a0 = ["oauth", "web", "headless"].includes(String(_0x28c0ee?.loginMode || ""));
    const _0x229628 = _0x2b5eef(_0x42128d);
    const _0x2cb20d = _0x5926c2(_0x42128d);
    const _0x435dbb = _0x228fdc(_0x42128d);
    if (_0x435dbb) {
      return trDreamina("waitBrowserFailed");
    }
    if (shouldDreaminaManualGuideOpenByDefault(_0x42128d, _0x3f6b48.dismissedSessionKey)) {
      return trDreamina("waitOpenAuth");
    }
    if (_0x229628) {
      return trDreamina("waitPendingTooLong");
    }
    if (_0x2cb20d) {
      return trDreamina("waitQrDeprecated");
    }
    if (_0x359b67 === "failed") {
      return trDreamina("waitFailed");
    }
    if (_0x359b67 === "oauth_ready" || _0x359b67 === "polling") {
      return trDreamina("waitConfirm");
    }
    if (_0x359b67 === "qr_ready") {
      return trDreamina("waitUseOAuth");
    }
    if (_0x359b67 === "success" || _0x359b67 === "reused") {
      return trDreamina("waitDone");
    }
    if (_0x4ab0a0) {
      return trDreamina("waitOAuthPreparing");
    }
    return trDreamina("waitPreparing");
  }
  function _0x314801(_0xfc57a) {
    const {
      modalCardEl: _0x1e5bbf,
      modalCloseEl: _0x1b44a2,
      modalMessageEl: _0x20ac0b,
      modalQrWrapEl: _0x340023,
      modalQrImageEl: _0x42e327,
      modalWaitEl: _0x5c945e,
      modalWaitTextEl: _0x45359d,
      modalRetryEl: _0x6d3542,
      manualGuideEl: _0x4c5337
    } = _0x4878b4();
    if (!_0x20ac0b) {
      return;
    }
    const _0x1b4e7e = _0xfc57a?.runtime || {};
    const _0x30eb79 = !!_0x1b4e7e?.active;
    const _0xe1e38a = String(_0x1b4e7e?.phase || "");
    const _0x5f522f = !!_0xfc57a?.loggedIn;
    const _0x59c22e = ["oauth", "web", "headless"].includes(String(_0x1b4e7e?.loginMode || ""));
    const _0x198faf = _0x2b5eef(_0xfc57a);
    const _0x11f853 = !_0x59c22e && !!_0x1b4e7e?.qrAvailable && _0xe1e38a === "qr_ready";
    const _0x4c1b57 = _0x5926c2(_0xfc57a);
    const _0xe9287f = _0x228fdc(_0xfc57a);
    const _0x135b39 = _0x5f522f || ["success", "reused", "done"].includes(_0xe1e38a);
    if (_0x135b39) {
      _0x3f6b48.manualGuideOpen = false;
    }
    if (!_0x135b39 && _0xe9287f) {
      _0x3f6b48.manualGuideOpen = true;
    }
    const _0x597aea = _0x50b290(_0xfc57a);
    const _0x19d005 = shouldDreaminaManualGuideOpenByDefault(_0xfc57a, _0x3f6b48.dismissedSessionKey);
    if (!_0x135b39 && _0x19d005) {
      _0x3f6b48.manualGuideOpen = true;
    }
    const _0x2fc9fe = _0x3f6b48.manualGuideOpen || (_0x30eb79 || _0x11f853) && (_0x597aea ? _0x3f6b48.dismissedSessionKey !== _0x597aea : true);
    if (_0x2fc9fe) {
      _0x28c664();
    } else if (["success", "reused", "failed", "done"].includes(_0xe1e38a)) {
      _0x31f93e(_0xe1e38a === "failed" ? 0 : 600);
    } else {
      _0x132c4c({
        force: true,
        rememberDismissal: false
      });
    }
    if (_0x1e5bbf) {
      _0x1e5bbf.classList.toggle("dreamina-login-modal--guide-open", !!_0x3f6b48.manualGuideOpen);
    }
    if (_0x20ac0b) {
      _0x20ac0b.textContent = _0x135b39 ? trDreamina("modalSynced") : _0xe9287f ? trDreamina("modalBrowserFailed") : _0x19d005 ? trDreamina("modalOAuthStarted") : _0x198faf ? trDreamina("modalPendingTooLong") : _0x4c1b57 ? trDreamina("modalQrAbnormal") : _0xe1e38a === "failed" ? trDreamina("modalRetryAuth") : _0xe1e38a === "oauth_ready" || _0xe1e38a === "polling" ? trDreamina("modalAuthorizeOnPage") : _0x11f853 ? trDreamina("modalScanQr") : String(_0x1b4e7e?.message || "").trim() || String(_0xfc57a?.message || "").trim() || trDreamina("modalProcessing");
    }
    if (_0x45359d) {
      _0x45359d.textContent = _0x4353b7(_0xfc57a);
    }
    if (_0x5c945e) {
      _0x5c945e.hidden = false;
    }
    if (_0x340023) {
      _0x340023.hidden = !_0x11f853;
    }
    if (_0x42e327) {
      if (_0x11f853) {
        _0x590e55(_0x42e327, _0x1b4e7e);
      } else {
        _0x42e327.removeAttribute("src");
      }
    }
    if (_0x1b44a2) {
      _0x1b44a2.disabled = false;
    }
    if (_0x6d3542) {
      _0x6d3542.hidden = false;
      _0x6d3542.disabled = false;
      if (_0x3f6b48.manualGuideOpen) {
        _0x6d3542.textContent = trDreamina("guideCollapse");
      } else {
        _0x6d3542.textContent = _0xe9287f ? trDreamina("guideRecommended") : trDreamina("guide");
      }
    }
    if (_0x4c5337) {
      _0x43472a(_0xfc57a);
    }
  }
  function _0x93757d(_0x401624) {
    const {
      statusTextEl: _0x540ce6,
      messageTextEl: _0x6072b6,
      creditTextEl: _0x1c6768,
      btnAuthEl: _0x3d35d8,
      btnQrAuthEl: _0x27eaeb,
      btnLogoutEl: _0x5937a4
    } = _0x4878b4();
    if (!_0x540ce6) {
      return;
    }
    if (!_0x30627f()) {
      return;
    }
    const _0x273fe5 = _0x401624?.runtime || {};
    const _0x2173d3 = !!_0x401624?.loggedIn;
    const _0x1fe6fe = !!_0x273fe5?.active;
    const _0x36a672 = String(_0x273fe5?.phase || "");
    const _0x4fbf5c = String(_0x273fe5?.message || "").trim() || String(_0x401624?.message || "").trim() || trDreamina("notLoggedInHint");
    _0x540ce6.textContent = _0x36d613(_0x401624);
    if (_0x6072b6) {
      _0x6072b6.textContent = _0x4fbf5c;
    }
    if (_0x1c6768) {
      _0x1c6768.textContent = _0x2173d3 ? _0x254b57(_0x401624?.credit) : trDreamina("creditPlaceholder");
    }
    if (_0x3d35d8) {
      _0x3d35d8.disabled = false;
      _0x3d35d8.textContent = getDreaminaWebLoginButtonText(_0x401624);
    }
    if (_0x27eaeb) {
      _0x27eaeb.hidden = true;
      _0x27eaeb.disabled = true;
      _0x27eaeb.textContent = getDreaminaQrLoginButtonText(_0x401624);
    }
    if (_0x5937a4) {
      _0x5937a4.disabled = _0x1fe6fe || !_0x2173d3;
    }
    if (_0x1fe6fe) {
      _0x2ebf2e();
    } else {
      _0x5c81f0();
    }
    _0x3f6b48.lastStatus = _0x401624;
    _0x22adf0(_0x401624);
    _0x314801(_0x401624);
    _0x1f39c6(_0x273fe5);
  }
  async function _0x2de842({
    force = false,
    silent = false
  } = {}) {
    if (!_0x30627f()) {
      return null;
    }
    if (typeof _0x4ba43f !== "function") {
      return null;
    }
    try {
      const _0x124886 = await _0x4ba43f({
        refresh: force
      });
      _0x93757d(_0x124886 || {});
      return _0x124886 || {};
    } catch (_0x343eef) {
      if (!silent) {
        const _0x2f8ad5 = _0x343eef?.message || trDreamina("fetchStatusFailed");
        window.showToast?.(_0x2f8ad5, "error");
      }
      return null;
    }
  }
  async function _0x2c9975({
    silent = false
  } = {}) {
    if (!_0x30627f()) {
      return null;
    }
    if (typeof _0x2c24dd !== "function") {
      return _0x2de842({
        silent: silent
      });
    }
    try {
      const _0x53cc75 = await _0x2c24dd();
      const _0x4d4cc0 = String(_0x53cc75?.phase || "");
      const _0x2edb71 = _0x4d4cc0 === "idle" && !_0x53cc75?.active && !Number(_0x53cc75?.startedAt || 0) && Number(_0x3f6b48.loginLaunchRequestedAt || 0) > 0;
      if (_0x2edb71) {
        return _0x3f6b48.lastStatus || null;
      }
      const _0x4a7dd4 = mergeDreaminaLoginRuntimeStatus(_0x3f6b48.lastStatus || {}, _0x53cc75 || {});
      _0x93757d(_0x4a7dd4);
      const _0xa18fb9 = ["success", "reused", "done"].includes(_0x4d4cc0);
      const _0x1acbad = _0xa18fb9 || _0x4d4cc0 === "failed";
      if (_0x1acbad) {
        _0x3f6b48.loginLaunchRequestedAt = 0;
      }
      if (_0xa18fb9) {
        _0x2de842({
          force: true,
          silent: true
        }).catch(() => {});
      }
      return _0x4a7dd4;
    } catch (_0x46b562) {
      if (!silent) {
        const _0x14f016 = _0x46b562?.message || trDreamina("fetchStatusFailed");
        window.showToast?.(_0x14f016, "error");
      }
      return null;
    }
  }
  async function _0x3b929f() {
    if (!_0x30627f()) {
      return;
    }
    const _0x490c8c = _0x3f6b48.lastStatus?.runtime || {};
    if (_0x490c8c?.active) {
      _0x28c664({
        clearDismissed: true
      });
      _0x3f6b48.manualGuideOpen = true;
      _0x314801(_0x3f6b48.lastStatus || {});
      return;
    }
    const _0x2114e8 = !!_0x3f6b48.lastStatus?.loggedIn;
    if (typeof _0x2e516c !== "function") {
      return;
    }
    _0x3f6b48.manualGuideOpen = true;
    _0x3f6b48.loginLaunchRequestedAt = Date.now();
    _0x28c664({
      clearDismissed: true
    });
    try {
      const _0x199a5b = await _0x2e516c({
        force: _0x2114e8
      });
      if (_0x199a5b?.success === false) {
        throw new Error(_0x199a5b?.message || trDreamina("startFailed"));
      }
      _0x3f6b48.manualGuideOpen = true;
      if (_0x199a5b?.status) {
        _0x93757d(_0x199a5b.status);
      }
      window.showToast?.(_0x2114e8 ? trDreamina("reloginStarted") : trDreamina("loginStarted"), "info");
      _0x2ebf2e();
    } catch (_0x5ae317) {
      window.showToast?.(_0x5ae317?.message || trDreamina("startFailed"), "error");
    }
  }
  async function _0x2ec55e() {
    await _0x3b929f();
  }
  function _0x364748() {
    _0x3f6b48.manualGuideOpen = !_0x3f6b48.manualGuideOpen;
    _0x314801(_0x3f6b48.lastStatus || {});
  }
  async function _0x2615f2() {
    if (!_0x30627f()) {
      return;
    }
    if (typeof _0x452f05 !== "function") {
      return;
    }
    try {
      const _0x21b452 = await _0x452f05();
      if (_0x21b452?.success === false) {
        throw new Error(_0x21b452?.message || trDreamina("logoutFailed"));
      }
      if (_0x21b452?.status) {
        _0x93757d(_0x21b452.status);
      } else {
        await _0x2de842({
          force: true,
          silent: true
        });
      }
      _0x5c81f0();
      window.showToast?.(trDreamina("loggedOut"), "success");
    } catch (_0x45f32e) {
      window.showToast?.(_0x45f32e?.message || trDreamina("logoutFailed"), "error");
    }
  }
  function _0x1366c7() {
    const {
      btnAuthEl: _0x9093a4,
      btnQrAuthEl: _0x4c601b,
      btnLogoutEl: _0x305a2b,
      modalOverlayEl: _0x2535cc,
      modalCloseEl: _0x8e0af3,
      modalQrImageEl: _0x5939c1,
      modalRetryEl: _0x582693,
      manualOpenAuthEl: _0x2f4fb4,
      manualCopyAuthEl: _0x8ea279,
      manualImportJsonBtnEl: _0x4a4e06
    } = _0x4878b4();
    _0x8a048d(_0x5939c1);
    _0x9093a4?.addEventListener("click", () => {
      _0x3b929f().catch(() => {});
    });
    _0x4c601b?.addEventListener("click", () => {
      _0x2ec55e().catch(() => {});
    });
    _0x305a2b?.addEventListener("click", () => {
      _0x2615f2().catch(() => {});
    });
    _0x8e0af3?.addEventListener("click", () => {
      _0x132c4c({
        force: true
      });
    });
    _0x582693?.addEventListener("click", () => {
      _0x364748();
    });
    _0x2f4fb4?.addEventListener("click", () => {
      _0x5d15eb().catch(() => {});
    });
    _0x8ea279?.addEventListener("click", () => {
      _0x38160e().catch(() => {});
    });
    _0x4a4e06?.addEventListener("click", () => {
      _0x136d00().catch(() => {});
    });
    _0x2535cc?.addEventListener("click", _0x553836 => {
      if (_0x553836.target !== _0x2535cc) {
        return;
      }
      _0x132c4c();
    });
    document.addEventListener("keydown", _0x4d823d => {
      if (_0x4d823d.key !== "Escape") {
        return;
      }
      _0x132c4c();
    });
    if (document.body) {
      const _0x5b173c = new MutationObserver(() => {
        const _0x17756c = _0x30627f();
        if (_0x17756c) {
          _0x2de842({
            force: true,
            silent: true
          }).catch(() => {});
        }
      });
      _0x5b173c.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  }
  function _0x36cef3() {
    const _0x23f908 = _0x26df1f => String(_0x26df1f || "").trim().replace(/^Bearer\s+/i, "");
    const _0x29dcce = {};
    Object.entries(_0x1ff891?.providers || {}).forEach(([_0x24f07e, _0xac2f2b]) => {
      const _0x43dca4 = String(_0x24f07e || "").trim();
      if (!_0x43dca4 || _0x45cc8c.includes(_0x43dca4)) {
        return;
      }
      _0x29dcce[_0x43dca4] = _0xac2f2b && typeof _0xac2f2b === "object" ? {
        ..._0xac2f2b
      } : _0xac2f2b;
    });
    _0x45cc8c.forEach(_0x3cc59a => {
      const _0x354c82 = document.getElementById("providerUrl-" + _0x3cc59a);
      const _0x50fd94 = document.getElementById("providerKey-" + _0x3cc59a);
      const _0x438bbf = _0x1ff891?.providers?.[_0x3cc59a];
      const _0x309a4b = _0x438bbf && typeof _0x438bbf === "object" ? {
        ..._0x438bbf
      } : {};
      if (_0x354c82) {
        _0x309a4b.apiUrl = _0x354c82.value.trim();
      }
      if (_0x50fd94) {
        _0x309a4b.apiKey = _0x23f908(_0x50fd94.value);
      }
      if (_0x3cc59a === "comfyui") {
        const _0x1b5551 = document.getElementById("providerUrl-comfyui-cloud");
        _0x309a4b.apiUrl = _0x339142(_0x309a4b.apiUrl, _0x5030ff);
        _0x309a4b.cloudApiUrl = _0x339142(_0x1b5551?.value || "");
      }
      if (_0x3cc59a === "apimart") {
        Object.assign(_0x309a4b, _0x1b967c(_0x309a4b));
      }
      _0x29dcce[_0x3cc59a] = _0x309a4b;
    });
    _0x2a807c.forEach(_0x1e4ec3 => {
      const _0x5e7b66 = document.getElementById("providerKey-" + _0x1e4ec3 + "-model");
      if (!_0x5e7b66) {
        return;
      }
      _0x29dcce[_0x1e4ec3] = _0x29dcce[_0x1e4ec3] || {};
      _0x29dcce[_0x1e4ec3].modelApiKey = _0x23f908(_0x5e7b66.value);
    });
    _0x45cc8c.forEach(_0x369fcc => {
      _0x29dcce[_0x369fcc] = reconcileProviderConnectionVerification(_0x1ff891?.providers?.[_0x369fcc] || {}, _0x29dcce[_0x369fcc] || {}, _0x369fcc);
    });
    const _0x5ad481 = {
      ...(_0x1ff891 || {}),
      providers: _0x29dcce
    };
    return _0x372f3a?.applyToConfig(_0x5ad481) || _0x5ad481;
  }
  function _0x2f9918(_0x14864c) {
    const _0x44fb80 = _0x14864c?.providers || {};
    return _0x45cc8c.filter(_0xfa88fc => {
      const _0x40bfe0 = _0x44fb80[_0xfa88fc] || {};
      if (_0xfa88fc === "comfyui") {
        return !!String(_0x40bfe0.apiUrl || _0x40bfe0.cloudApiUrl || "").trim();
      }
      return !!String(_0x40bfe0.apiKey || _0x40bfe0.modelApiKey || "").trim();
    });
  }
  function _0x322003(_0x26faf5, _0x4c1698) {
    const _0x24a3a8 = _0x26faf5?.providers?.[_0x4c1698] || {};
    if (_0x4c1698 === "comfyui") {
      return Number(Boolean(String(_0x24a3a8.apiUrl || _0x24a3a8.cloudApiUrl || "").trim()));
    }
    if (_0x2a807c.includes(_0x4c1698)) {
      return Number(Boolean(String(_0x24a3a8.apiKey || "").trim())) + Number(Boolean(String(_0x24a3a8.modelApiKey || "").trim()));
    }
    return Number(Boolean(String(_0x24a3a8.apiKey || "").trim()));
  }
  function _0x54fdfe(_0x22c331) {
    const _0x1c6dbd = _0x22c331?.providers || {};
    return Object.keys(_0x1c6dbd).filter(_0x1bb2a4 => {
      const _0x267119 = _0x1c6dbd[_0x1bb2a4] || {};
      if (_0x1bb2a4 === "comfyui") {
        return !!String(_0x267119.apiUrl || _0x267119.cloudApiUrl || "").trim();
      }
      return !!String(_0x267119.apiKey || _0x267119.modelApiKey || "").trim();
    });
  }
  function _0x5aef89(_0x31aef8, _0x3225cf) {
    const _0x2bc57d = _0x31aef8?.providers?.[_0x3225cf] || {};
    if (_0x3225cf === "comfyui") {
      return !!String(_0x2bc57d.apiUrl || _0x2bc57d.cloudApiUrl || "").trim();
    }
    return !!String(_0x2bc57d.apiKey || _0x2bc57d.modelApiKey || "").trim();
  }
  function _0x1c811c(_0x13f62e) {
    const _0x485c4a = document.getElementById("providerTestStatus-" + _0x13f62e);
    _0x2cc33f.bind(_0x485c4a);
    return _0x485c4a;
  }
  function _0xf80de8(_0x18643c) {
    const _0x58f315 = document.getElementById("providerBalance-" + _0x18643c);
    _0x2cc33f.bind(_0x58f315);
    return _0x58f315;
  }
  function _0x49c7b3(_0x3f3326) {
    const _0x365945 = _0x1c811c(_0x3f3326);
    if (_0x365945) {
      _0x2cc33f.hide(_0x365945);
      _0x365945.hidden = true;
      _0x365945.textContent = "";
      _0x365945.removeAttribute("title");
      _0x365945.removeAttribute("data-tooltip");
      _0x365945.removeAttribute("data-tooltip-source");
      _0x365945.removeAttribute("data-native-title");
      _0x365945.removeAttribute("data-provider-test-tooltip");
      _0x365945.removeAttribute("aria-label");
      _0x365945.removeAttribute("tabindex");
      _0x365945.setAttribute("aria-busy", "false");
      _0x365945.classList.remove(..._0x5f58a8);
    }
    _0x12d3be(_0x3f3326);
  }
  function _0x413c5d(_0x126d20, _0x446a47, _0x44d66d, _0x40bb76 = "") {
    const _0x32612e = _0x1c811c(_0x126d20);
    if (!_0x32612e) {
      return;
    }
    const _0x32a17e = String(_0x44d66d || "").trim();
    const _0x3d71b1 = String(_0x40bb76 || "").trim();
    _0x32612e.hidden = false;
    _0x32612e.textContent = _0x32a17e;
    _0x32612e.setAttribute("aria-busy", String(_0x446a47 === "testing"));
    _0x32612e.removeAttribute("title");
    _0x32612e.removeAttribute("data-tooltip");
    _0x32612e.removeAttribute("data-tooltip-source");
    _0x32612e.removeAttribute("data-native-title");
    if (_0x3d71b1 && _0x3d71b1 !== _0x32a17e) {
      _0x32612e.setAttribute("data-provider-test-tooltip", _0x3d71b1);
      _0x32612e.setAttribute("aria-label", _0x3d71b1);
      _0x32612e.setAttribute("tabindex", "0");
    } else {
      _0x2cc33f.hide(_0x32612e);
      _0x32612e.removeAttribute("data-provider-test-tooltip");
      _0x32612e.removeAttribute("aria-label");
      _0x32612e.removeAttribute("tabindex");
    }
    _0x32612e.classList.remove(..._0x5f58a8);
    if (_0x446a47 === "success") {
      _0x32612e.classList.add("settings-provider-status--success");
    } else if (_0x446a47 === "testing") {
      _0x32612e.classList.add("settings-provider-status--testing");
    } else if (_0x446a47 === "partial") {
      _0x32612e.classList.add("settings-provider-status--partial");
    } else if (_0x446a47 === "configured") {
      _0x32612e.classList.add("settings-provider-status--configured");
    } else if (_0x446a47 === "unconfigured") {
      _0x32612e.classList.add("settings-provider-status--unconfigured");
    } else {
      _0x32612e.classList.add("settings-provider-status--danger");
    }
  }
  function _0x20e3ad(_0x1e575a, _0x1ba13c) {
    const _0x3f36fd = _0x322003(_0x1e575a, _0x1ba13c);
    const _0x1307bb = _0x2a807c.includes(_0x1ba13c) ? 2 : 1;
    if (_0x3f36fd > 0) {
      if (isProviderConnectionVerified(_0x1e575a, _0x1ba13c)) {
        _0x413c5d(_0x1ba13c, "success", trApiInput("diagnostics.passed"));
        return;
      }
      if (_0x1e575a?.providers?.[_0x1ba13c]?.connectionVerification?.status === "partial") {
        _0x413c5d(_0x1ba13c, "partial", trApiInput("diagnostics.partialPassed"));
        return;
      }
      _0x413c5d(_0x1ba13c, "configured", _0x1307bb > 1 ? trApiInput("statuses.configuredCount", {
        count: _0x3f36fd,
        total: _0x1307bb
      }) : trApiInput("statuses.configured"));
      return;
    }
    _0x413c5d(_0x1ba13c, "unconfigured", trApiInput("statuses.unconfigured"));
  }
  function _0x48c605(_0x2b380e) {
    _0x45cc8c.forEach(_0x44d4fc => {
      _0x20e3ad(_0x2b380e, _0x44d4fc);
    });
  }
  function _0x1e0dbc(_0x3c2526) {
    const _0x33c11d = document.getElementById("modelServiceReadinessSummary");
    const _0x215b36 = document.getElementById("modelServiceReadinessDesc");
    const _0x5c28f0 = document.getElementById("modelServiceReadinessStatus");
    if (!_0x33c11d || !_0x215b36 || !_0x5c28f0) {
      return;
    }
    const _0x229c2b = _0x54fdfe(_0x3c2526).length;
    _0x33c11d.dataset.state = _0x229c2b > 0 ? "ready" : "empty";
    _0x215b36.textContent = trApiInput(_0x229c2b > 0 ? "readiness.ready" : "readiness.empty", {
      count: _0x229c2b
    });
    _0x5c28f0.textContent = trApiInput(_0x229c2b > 0 ? "readiness.readyShort" : "readiness.emptyShort", {
      count: _0x229c2b
    });
  }
  function _0x12d3be(_0x35e009) {
    const _0x5e8e68 = _0xf80de8(_0x35e009);
    if (!_0x5e8e68) {
      return;
    }
    _0x2cc33f.hide(_0x5e8e68);
    _0x5e8e68.hidden = true;
    _0x5e8e68.textContent = "";
    _0x5e8e68.removeAttribute("aria-label");
    _0x5e8e68.removeAttribute("data-provider-test-tooltip");
  }
  function _0x270bdb(_0x1e6024, _0x539771 = null) {
    const _0x51637a = _0xf80de8(_0x1e6024);
    if (!_0x51637a) {
      return;
    }
    const _0xee9b58 = String(_0x539771?.displayText || "").trim();
    if (!_0xee9b58) {
      _0x12d3be(_0x1e6024);
      return;
    }
    const _0x1025e5 = String(_0x539771?.detailText || _0xee9b58).trim();
    _0x51637a.hidden = false;
    _0x51637a.textContent = _0xee9b58;
    _0x51637a.setAttribute("aria-label", _0x1025e5);
    _0x51637a.setAttribute("data-provider-test-tooltip", _0x1025e5);
  }
  function _0x480284(_0x2bdd91) {
    const _0x138eef = Number(_0x2bdd91);
    if (!Number.isFinite(_0x138eef) || _0x138eef <= 0) {
      return null;
    }
    return Math.max(1, Math.floor(_0x138eef));
  }
  function _0x34622a(_0x458f42, _0x3ffe69 = null) {
    if (!_0x3ffe69 || typeof _0x3ffe69 !== "object") {
      return null;
    }
    const _0x314106 = String(_0x458f42 || "").trim().toLowerCase();
    if (_0x2a807c.includes(_0x314106)) {
      const _0x2cd48b = _0x480284(_0x3ffe69.workflowConcurrentLimit);
      const _0x46c4ab = _0x480284(_0x3ffe69.modelConcurrentLimit);
      const _0x56bd46 = {};
      if (_0x2cd48b !== null) {
        _0x56bd46.workflowConcurrentLimit = _0x2cd48b;
      }
      if (_0x46c4ab !== null) {
        _0x56bd46.modelConcurrentLimit = _0x46c4ab;
      }
      if (_0x3ffe69.workflowApiKeyType) {
        _0x56bd46.workflowApiKeyType = String(_0x3ffe69.workflowApiKeyType || "").trim();
      }
      if (_0x3ffe69.modelApiKeyType) {
        _0x56bd46.modelApiKeyType = String(_0x3ffe69.modelApiKeyType || "").trim();
      }
      if (Object.keys(_0x56bd46).length) {
        return _0x56bd46;
      } else {
        return null;
      }
    }
    const _0x3b1563 = _0x480284(_0x3ffe69.concurrentLimit);
    if (_0x3b1563 === null) {
      return null;
    } else {
      return {
        concurrentLimit: _0x3b1563
      };
    }
  }
  function _0x1de695(_0x2e184e = {}, _0x428827 = new Map()) {
    if (!(_0x428827 instanceof Map) || _0x428827.size <= 0) {
      return _0x2e184e;
    }
    const _0x6a7497 = {
      ...(_0x2e184e.providers || {})
    };
    _0x428827.forEach((_0x4fcd8e, _0x56e759) => {
      if (!_0x4fcd8e || typeof _0x4fcd8e !== "object") {
        return;
      }
      _0x6a7497[_0x56e759] = {
        ...(_0x6a7497[_0x56e759] || {}),
        ..._0x4fcd8e
      };
    });
    return {
      ..._0x2e184e,
      providers: _0x6a7497
    };
  }
  function _0x582207(_0x55416e = {}) {
    return a862_0xd1caa0(_0x55416e, {
      skipped: trApiInput("diagnostics.skipped"),
      passed: trApiInput("diagnostics.passed"),
      failed: trApiInput("diagnostics.failed"),
      step: trApiInput("diagnostics.step")
    });
  }
  function _0x488dcf(_0x1f7b81 = {}) {
    if (_0x1f7b81.partial) {
      return "partial";
    }
    if (_0x1f7b81.ok) {
      return "success";
    }
    return "danger";
  }
  function _0x333de8(_0x18cf3a = {}) {
    if (_0x18cf3a.partial) {
      return trApiInput("diagnostics.partialPassed");
    }
    if (_0x18cf3a.ok) {
      return trApiInput("diagnostics.passed");
    }
    return trApiInput("diagnostics.notPassed");
  }
  function _0x52d4e2() {
    _0x45cc8c.forEach(_0x49c7b3);
  }
  function _0x4b5f7e() {
    const _0x24845c = _0x277ecd => {
      const _0x6c01d6 = _0x36cef3();
      _0x49c7b3(_0x277ecd);
      _0x20e3ad(_0x6c01d6, _0x277ecd);
      _0x1e0dbc(_0x6c01d6);
      _0x4222d6?.schedule();
    };
    const _0x5a7262 = (_0x480909, _0x27cef5) => {
      _0x480909?.addEventListener("input", () => _0x24845c(_0x27cef5));
      _0x480909?.addEventListener("change", () => {
        _0x4222d6?.persist().catch(() => {});
      });
    };
    _0x45cc8c.forEach(_0x13c1c3 => {
      const _0x19c61a = document.getElementById("providerUrl-" + _0x13c1c3);
      const _0x2ae394 = document.getElementById("providerKey-" + _0x13c1c3);
      _0x5a7262(_0x19c61a, _0x13c1c3);
      _0x5a7262(_0x2ae394, _0x13c1c3);
    });
    _0x5a7262(document.getElementById("providerUrl-comfyui-cloud"), "comfyui");
    _0x31d1c0().forEach(_0x48bd74 => {
      _0x48bd74.addEventListener("click", () => {
        _0x52ed0f(_0x48bd74.dataset.apimartRoute);
        _0x24845c("apimart");
      });
    });
    _0x2a807c.forEach(_0x20a23c => {
      _0x5a7262(document.getElementById("providerKey-" + _0x20a23c + "-model"), _0x20a23c);
    });
  }
  async function _0x1cc1e8(_0x13bd2d, _0x492fd9 = {}) {
    if (typeof _0x5d5fe2 !== "function") {
      window.showToast?.(trApiInput("diagnostics.testUnsupported"), "error");
      return;
    }
    const _0x5767f6 = await _0x4222d6?.persist();
    if (!_0x5767f6) {
      return;
    }
    const _0x27893a = String(_0x492fd9?.providerId || "").trim().toLowerCase();
    const _0x3250cf = _0x27893a ? [_0x27893a] : _0x2f9918(_0x5767f6);
    if (_0x27893a) {
      _0x49c7b3(_0x27893a);
    } else {
      _0x52d4e2();
    }
    if (_0x27893a && !_0x5aef89(_0x5767f6, _0x27893a)) {
      _0x20e3ad(_0x5767f6, _0x27893a);
      window.showToast?.(trApiInput(_0x27893a === "comfyui" ? "diagnostics.fillProviderUrl" : "diagnostics.fillProviderKey"), "warn");
      return;
    }
    if (_0x3250cf.length === 0) {
      _0x48c605(_0x5767f6);
      _0x1e0dbc(_0x5767f6);
      window.showToast?.(trApiInput("diagnostics.fillOneProviderKey"), "warn");
      return;
    }
    _0x3250cf.forEach(_0x1b6b5a => _0x413c5d(_0x1b6b5a, "testing", trApiInput("diagnostics.testing")));
    const _0x220b4a = _0x13bd2d?.querySelector?.(".settings-btn-label");
    const _0x1022e7 = _0x220b4a?.textContent || _0x13bd2d?.textContent || trApiInput("testConnection");
    if (_0x13bd2d) {
      _0x13bd2d.disabled = true;
      if (_0x220b4a) {
        _0x220b4a.textContent = trApiInput("diagnostics.testingBusy");
      } else {
        _0x13bd2d.textContent = trApiInput("diagnostics.testingBusy");
      }
    }
    const _0x5a211e = {};
    const _0x2f0c00 = [];
    const _0x3bd99a = [];
    const _0x58d607 = new Map();
    try {
      await Promise.all(_0x3250cf.map(async _0x5ba80f => {
        try {
          const _0x30103f = await _0x5d5fe2(_0x5767f6, [_0x5ba80f]);
          _0x5a211e[_0x5ba80f] = _0x30103f?.[_0x5ba80f];
        } catch (_0x1784eb) {
          _0x5a211e[_0x5ba80f] = {
            ok: false,
            label: _0x5ba80f,
            error: _0x1784eb?.message || trApiInput("diagnostics.testFailed")
          };
        }
        const _0x250620 = _0x5a211e[_0x5ba80f];
        _0x270bdb(_0x5ba80f, _0x250620?.balance);
        const _0x174658 = _0x34622a(_0x5ba80f, _0x250620?.balance);
        if (_0x174658) {
          _0x58d607.set(_0x5ba80f, _0x174658);
        }
        if (shouldPersistProviderConnectionResult(_0x5ba80f, _0x250620)) {
          _0x3bd99a.push(_0x5ba80f);
        }
        if (_0x250620?.ok) {
          _0x413c5d(_0x5ba80f, "success", trApiInput("diagnostics.passed"), _0x582207(_0x250620) || trApiInput("diagnostics.testPassed"));
        } else {
          _0x2f0c00.push({
            label: _0x250620?.label || _0x5ba80f,
            error: _0x250620?.suggestion || _0x250620?.summary || _0x250620?.error || trApiInput("diagnostics.testNotPassed")
          });
          _0x413c5d(_0x5ba80f, _0x488dcf(_0x250620), _0x333de8(_0x250620), _0x582207(_0x250620) || _0x250620?.error || trApiInput("diagnostics.testNotPassed"));
        }
      }));
      if (_0x3bd99a.length > 0) {
        const _0x49cda2 = mergePassedProviderApiConfig(_0x1ff891, _0x1de695(_0x5767f6, _0x58d607), _0x3bd99a, _0x58d607, {
          providerResults: _0x5a211e
        });
        try {
          await _0x56734f(_0x49cda2);
          _0x1ff891 = _0x49cda2;
          _0x1e0dbc(_0x49cda2);
          _0x1a2612?.();
        } catch (_0x123e6a) {
          console.warn("[API Config] provider diagnostics save failed:", _0x123e6a);
          window.showToast?.(trApiInput("diagnostics.saveFailed", {
            error: _0x123e6a?.message || trApiInput("diagnostics.unknownError")
          }), "error");
          return;
        }
      }
      if (_0x2f0c00.length === 0) {
        const _0x60cc76 = _0x5a211e[_0x3250cf[0]];
        const _0x39a644 = _0x27893a ? trApiInput("diagnostics.providerPassed", {
          label: _0x60cc76?.label || _0x27893a
        }) : trApiInput("diagnostics.allPassed");
        window.showToast?.(_0x39a644, "success");
      } else {
        const _0x5401f0 = _0x2f0c00[0];
        window.showToast?.(trApiInput("diagnostics.providerFailed", {
          label: _0x5401f0.label,
          error: _0x5401f0.error
        }), "error", 9000);
      }
    } catch (_0x51da2c) {
      _0x3250cf.forEach(_0x2914fc => _0x413c5d(_0x2914fc, "danger", trApiInput("diagnostics.notPassed"), _0x51da2c?.message || trApiInput("diagnostics.testFailed")));
      window.showToast?.(trApiInput("diagnostics.testFailedWithDetail", {
        error: _0x51da2c?.message || trApiInput("diagnostics.unknownError")
      }), "error");
    } finally {
      if (_0x13bd2d) {
        _0x13bd2d.disabled = false;
        if (_0x220b4a) {
          _0x220b4a.textContent = _0x1022e7;
        } else {
          _0x13bd2d.textContent = _0x1022e7;
        }
      }
    }
  }
  function _0x21af4e() {
    const _0x2c776c = document.getElementById("btnApiSave");
    _0x4222d6 = createApiConfigAutoSaveController({
      collectConfig: _0x36cef3,
      saveConfig: _0x56734f,
      onSaved: (_0x1d7180, {
        showSuccess = false
      } = {}) => {
        _0x1ff891 = _0x1d7180;
        _0x48c605(_0x1d7180);
        _0x1e0dbc(_0x1d7180);
        _0x1a2612?.();
        if (showSuccess) {
          window.showToast?.(trApiInput("diagnostics.saveSuccess"));
        }
      },
      onError: _0x2426df => window.showToast?.(trApiInput("diagnostics.saveFailed", {
        error: _0x2426df?.message || trApiInput("diagnostics.unknownError")
      }), "error")
    });
    hardenApiCredentialInputs(document);
    _0x372f3a?.destroy?.();
    _0x372f3a = createRunningHubDefaultSiteSettings({
      root: document,
      onSelectionChange: () => {
        _0x4222d6?.persist().catch(() => {});
      }
    });
    _0x372f3a.bind();
    bindModelCatalogProviderCardVisibility({
      store: _0x28bf1f,
      card: document.querySelector("[data-subscription-provider-card=\"binghuo\"]"),
      providerId: "binghuo"
    });
    _0x3f087b().then(_0x467b49 => {
      if (!_0x467b49 || _0x467b49.error) {
        return;
      }
      _0x1ff891 = _0x467b49 || {};
      _0x372f3a?.loadConfig(_0x1ff891);
      const _0x258863 = _0x467b49.providers || {};
      _0x45cc8c.forEach(_0x27ef0e => {
        const _0x1fbb0e = document.getElementById("providerUrl-" + _0x27ef0e);
        const _0x5c6fbc = document.getElementById("providerKey-" + _0x27ef0e);
        const _0x5c9c32 = _0x258863[_0x27ef0e] || {};
        if (_0x1fbb0e && _0x5c9c32.apiUrl) {
          _0x1fbb0e.value = _0x5c9c32.apiUrl;
        }
        if (_0x27ef0e === "comfyui" && _0x1fbb0e && !_0x5c9c32.apiUrl) {
          _0x1fbb0e.value = _0x5030ff;
        }
        if (_0x5c6fbc && _0x5c9c32.apiKey) {
          _0x5c6fbc.value = _0x5c9c32.apiKey;
        }
      });
      const _0x5b9f1d = document.getElementById("providerUrl-comfyui-cloud");
      if (_0x5b9f1d) {
        _0x5b9f1d.value = _0x258863.comfyui?.cloudApiUrl || "";
      }
      _0x30db5a(_0x258863.apimart || {});
      _0x2a807c.forEach(_0x3850b7 => {
        const _0x383438 = document.getElementById("providerKey-" + _0x3850b7 + "-model");
        if (_0x383438 && _0x258863[_0x3850b7]?.modelApiKey) {
          _0x383438.value = _0x258863[_0x3850b7].modelApiKey;
        }
      });
      if (!_0x258863.grsai?.apiKey && _0x467b49.apiKey) {
        const _0x1e490c = document.getElementById("providerKey-grsai");
        if (_0x1e490c && !_0x1e490c.value) {
          _0x1e490c.value = _0x467b49.apiKey;
        }
      }
      _0x234616(_0x258863);
      _0x1d88bd(_0x258863);
      _0x48c605(_0x1ff891);
      _0x1e0dbc(_0x1ff891);
      _0x1a2612?.();
    }).catch(_0xdb5352 => {
      console.error("[API Config] 加载失败:", _0xdb5352);
      _0x48c605({});
      _0x1e0dbc({});
      _0xed9570?.(trApiInput("diagnostics.loadFailed", {
        error: _0xdb5352.message || trApiInput("diagnostics.unknownError")
      }));
    }).finally(() => {
      if (_0x30627f()) {
        _0x2de842({
          force: true,
          silent: true
        }).catch(() => {});
      }
    });
    if (_0x2c776c) {
      _0x2c776c.addEventListener("click", () => {
        _0x4222d6.persist({
          showSuccess: true
        }).then(_0x1d3c0d => {
          if (!_0x1d3c0d) {
            return;
          }
          _0x2de842({
            force: true,
            silent: true
          }).catch(() => {});
        });
      });
    }
    window.addEventListener("settings-panel-closed", () => {
      _0x4222d6?.flush().catch(() => {});
    });
    document.querySelectorAll("[data-provider-test]").forEach(_0x15fa30 => {
      const _0xecf32b = String(_0x15fa30.dataset.providerTest || "").trim();
      if (!_0xecf32b) {
        return;
      }
      _0x15fa30.addEventListener("click", () => {
        _0x1cc1e8(_0x15fa30, {
          providerId: _0xecf32b
        }).catch(() => {});
      });
    });
    _0x4b5f7e();
    bindProviderApiKeyGuideTriggers(document);
    bindVolcengineSpeechApiKeyGuideTriggers(document);
    bindRunningHubApiKeyGuideTriggers(document);
    _0x55fb17();
    _0x1366c7();
  }
  function _0x4ee0a4() {
    _0x145156();
    _0x30627f();
    _0x21af4e();
  }
  return {
    init: _0x4ee0a4
  };
}