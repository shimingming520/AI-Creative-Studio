import { API_CONFIG_CHANGED_EVENT, ensureConfig, isApiConfigLoaded } from "../../api/configApi.js";
import { CLI_PROVIDER_STATUS_CHANGED_EVENT } from "../../api/cliProviderApi.js";
import { DREAMINA_CLI_STATUS_CHANGED_EVENT } from "../../api/dreaminaCliApi.js";
import { ensureModelGenerationReadiness, getModelGenerationReadiness } from "../services/modelGenerationReadiness.js";
import { getModelProviderProfileIds, resolveReadyModelProviderProfileId } from "./modelProviderProfileSelection.js";
import { t } from "../i18n/index.js";
import { showCliLoginMissingToast } from "./cliLoginMissingToast.js";
import { showProviderApiKeyMissingToast } from "./providerApiKeyMissingToast.js";
const CREDENTIAL_BUTTON_CLASS = "is-credential-required";
const CREDENTIAL_BADGE_SELECTOR = "[data-model-credential-badge]";
const CREDENTIAL_MENU_ITEM_SELECTOR = [".node-menu-item[data-value]", ".node-menu-item[data-credential-model]"].join(", ");
function getMenuItemCredentialContext(_0x507097) {
  return {
    modelId: String(_0x507097?.dataset?.credentialModel || _0x507097?.dataset?.value || "").trim(),
    providerId: String(_0x507097?.dataset?.provider || "").trim()
  };
}
function showMissingCredential(_0x197122) {
  if (!_0x197122 || _0x197122.status !== "missing") {
    return false;
  }
  if (_0x197122.requirementType === "cliLogin") {
    showCliLoginMissingToast(_0x197122.message, {
      providerId: _0x197122.cliProviderId,
      fieldIds: _0x197122.fieldIds
    });
    return true;
  }
  showProviderApiKeyMissingToast(_0x197122.message, {
    providerId: _0x197122.configProviderId || _0x197122.providerId,
    fieldIds: _0x197122.fieldIds,
    keyType: _0x197122.keyType,
    adapterType: _0x197122.adapterType,
    model: _0x197122.modelId
  });
  return true;
}
export function guardModelGenerationCredentials(_0x165d5e = {}) {
  let _0x459147 = getModelGenerationReadiness(_0x165d5e);
  if (_0x459147.status === "loading" && _0x165d5e.waitForConfig === true) {
    return ensureModelGenerationReadiness(_0x165d5e).then(_0x230fb5 => {
      if (_0x230fb5.ready) {
        return _0x230fb5;
      }
      showMissingCredential(_0x230fb5);
      return _0x230fb5;
    });
  }
  if (_0x459147.status === "loading") {
    return {
      ..._0x459147,
      ready: true,
      status: "deferred",
      reason: "runtime-check-pending"
    };
  }
  if (_0x459147.ready) {
    return _0x459147;
  }
  showMissingCredential(_0x459147);
  return _0x459147;
}
export function resetModelCredentialButtonState(_0x5dbcb6) {
  if (!_0x5dbcb6) {
    return;
  }
  const _0x101434 = _0x5dbcb6.dataset || {};
  _0x5dbcb6.classList?.remove(CREDENTIAL_BUTTON_CLASS);
  if (_0x101434.credentialUiApplied === "true") {
    if (_0x101434.credentialHadTitle === "true") {
      _0x5dbcb6.setAttribute?.("title", _0x101434.credentialOriginalTitle || "");
    } else {
      _0x5dbcb6.removeAttribute?.("title");
    }
    if (_0x101434.credentialHadAriaLabel === "true") {
      _0x5dbcb6.setAttribute?.("aria-label", _0x101434.credentialOriginalAriaLabel || "");
    } else {
      _0x5dbcb6.removeAttribute?.("aria-label");
    }
    if (_0x5dbcb6.style) {
      _0x5dbcb6.style.cursor = _0x101434.credentialOriginalCursor || "";
    }
  }
  delete _0x101434.credentialProvider;
  delete _0x101434.credentialField;
  delete _0x101434.credentialUiApplied;
  delete _0x101434.credentialHadTitle;
  delete _0x101434.credentialOriginalTitle;
  delete _0x101434.credentialHadAriaLabel;
  delete _0x101434.credentialOriginalAriaLabel;
  delete _0x101434.credentialOriginalCursor;
}
export function applyModelCredentialButtonState(_0x49f5d0, _0x5748a3 = {}) {
  if (!_0x49f5d0) {
    return null;
  }
  const _0x43c608 = getModelGenerationReadiness(_0x5748a3);
  resetModelCredentialButtonState(_0x49f5d0);
  if (_0x43c608.status !== "missing") {
    return _0x43c608;
  }
  const _0x14daa4 = _0x49f5d0.dataset || {};
  _0x14daa4.credentialUiApplied = "true";
  _0x14daa4.credentialHadTitle = String(_0x49f5d0.hasAttribute?.("title"));
  _0x14daa4.credentialOriginalTitle = _0x49f5d0.getAttribute?.("title") || "";
  _0x14daa4.credentialHadAriaLabel = String(_0x49f5d0.hasAttribute?.("aria-label"));
  _0x14daa4.credentialOriginalAriaLabel = _0x49f5d0.getAttribute?.("aria-label") || "";
  _0x14daa4.credentialOriginalCursor = _0x49f5d0.style?.cursor || "";
  _0x49f5d0.classList?.add(CREDENTIAL_BUTTON_CLASS);
  _0x14daa4.credentialProvider = _0x43c608.configProviderId || _0x43c608.providerId;
  _0x14daa4.credentialField = _0x43c608.credentialField;
  _0x49f5d0.disabled = false;
  _0x49f5d0.title = _0x43c608.message;
  _0x49f5d0.setAttribute?.("aria-label", _0x43c608.message);
  _0x49f5d0.style.cursor = "var(--link-cursor)";
  return _0x43c608;
}
function clearMenuItemCredentialState(_0x4b084e) {
  _0x4b084e.classList?.remove("needs-model-credential");
  _0x4b084e.classList?.remove("needs-model-api-authorization");
  if (_0x4b084e.dataset.credentialHadTitle === "true") {
    _0x4b084e.setAttribute?.("title", _0x4b084e.dataset.credentialOriginalTitle || "");
  } else if (_0x4b084e.dataset.credentialStateApplied === "true") {
    _0x4b084e.removeAttribute?.("title");
  }
  delete _0x4b084e.dataset.credentialMissing;
  delete _0x4b084e.dataset.credentialProvider;
  delete _0x4b084e.dataset.credentialField;
  delete _0x4b084e.dataset.credentialKeyType;
  delete _0x4b084e.dataset.credentialFieldIds;
  delete _0x4b084e.dataset.credentialMessage;
  delete _0x4b084e.dataset.credentialResolvedProviderProfileId;
  delete _0x4b084e.dataset.credentialStateApplied;
  delete _0x4b084e.dataset.credentialHadTitle;
  delete _0x4b084e.dataset.credentialOriginalTitle;
  _0x4b084e.querySelector?.(CREDENTIAL_BADGE_SELECTOR)?.remove?.();
}
function markMenuItemCredentialMissing(_0x103523, _0x3d22a6, _0xf4f973) {
  _0x103523.dataset.credentialStateApplied = "true";
  _0x103523.dataset.credentialHadTitle = String(_0x103523.hasAttribute?.("title"));
  _0x103523.dataset.credentialOriginalTitle = _0x103523.getAttribute?.("title") || "";
  _0x103523.classList?.add("needs-model-credential");
  const _0x2c8bb3 = _0x3d22a6.requirementType !== "cliLogin";
  if (_0x2c8bb3) {
    _0x103523.classList?.add("needs-model-api-authorization");
  }
  _0x103523.dataset.credentialMissing = "true";
  _0x103523.dataset.credentialProvider = _0x3d22a6.configProviderId || _0x3d22a6.providerId;
  _0x103523.dataset.credentialField = _0x3d22a6.credentialField;
  _0x103523.dataset.credentialKeyType = _0x3d22a6.keyType || "";
  _0x103523.dataset.credentialFieldIds = JSON.stringify(_0x3d22a6.fieldIds || []);
  _0x103523.dataset.credentialMessage = _0x3d22a6.message;
  _0x103523.setAttribute?.("title", _0x3d22a6.message);
  const _0x322e6a = _0xf4f973?.createElement?.("span");
  if (!_0x322e6a) {
    return;
  }
  _0x322e6a.className = "floating-menu-badge floating-menu-badge-warning model-credential-badge";
  _0x322e6a.dataset.modelCredentialBadge = "true";
  _0x322e6a.textContent = t("settings.apiInput.readiness.requiredShort");
  _0x103523.appendChild?.(_0x322e6a);
}
function getMenuItemProviderProfileId(_0xa6b841, _0x864f4e, _0xb7a5e3, _0x41fcad) {
  const _0x16970a = _0x864f4e.getProviderProfileId?.({
    item: _0xa6b841,
    modelId: _0xb7a5e3,
    providerId: _0x41fcad
  }) || _0xa6b841.dataset?.providerProfileId || "";
  const _0x1d0d32 = getModelProviderProfileIds(_0xb7a5e3);
  if (_0x1d0d32.length === 0) {
    return _0x16970a;
  }
  if (_0x1d0d32.length === 1) {
    return _0x1d0d32[0];
  }
  return resolveReadyModelProviderProfileId(_0xb7a5e3, _0x16970a, _0x576a04 => {
    const _0x1546e1 = getModelGenerationReadiness({
      modelId: _0xb7a5e3,
      provider: _0x41fcad,
      providerProfileId: _0x576a04
    });
    if (_0x1546e1.status === "loading") {
      return null;
    }
    return _0x1546e1.ready;
  });
}
export function syncModelCredentialMenu(_0x3dca4a, _0x1a340b = {}) {
  if (!_0x3dca4a?.querySelectorAll) {
    return;
  }
  const _0x158cf9 = async () => {
    const _0x49846f = _0x1a340b.documentObject || globalThis.document;
    const _0x46c3d0 = [..._0x3dca4a.querySelectorAll(CREDENTIAL_MENU_ITEM_SELECTOR)];
    await Promise.all(_0x46c3d0.map(async _0x1d6b34 => {
      clearMenuItemCredentialState(_0x1d6b34);
      const {
        modelId: _0x238a25,
        providerId: _0x8743ab
      } = getMenuItemCredentialContext(_0x1d6b34);
      const _0x2d1854 = {
        modelId: _0x238a25,
        provider: _0x8743ab,
        providerProfileId: getMenuItemProviderProfileId(_0x1d6b34, _0x1a340b, _0x238a25, _0x8743ab)
      };
      if (_0x2d1854.providerProfileId) {
        _0x1d6b34.dataset.credentialResolvedProviderProfileId = _0x2d1854.providerProfileId;
      }
      let _0x4e919d = getModelGenerationReadiness(_0x2d1854);
      if (_0x4e919d.reason === "cli-status-loading") {
        _0x4e919d = await ensureModelGenerationReadiness(_0x2d1854).catch(() => _0x4e919d);
      }
      if (_0x4e919d.status === "missing") {
        markMenuItemCredentialMissing(_0x1d6b34, _0x4e919d, _0x49846f);
      }
    }));
  };
  if (isApiConfigLoaded()) {
    return _0x158cf9();
  }
  return ensureConfig().catch(() => {}).then(_0x158cf9);
}
export function bindModelCredentialMenu(_0x247183, _0x4b9c92 = {}) {
  if (!_0x247183?.addEventListener) {
    return () => {};
  }
  const _0x95abd9 = () => {
    syncModelCredentialMenu(_0x247183, _0x4b9c92);
  };
  const _0x512f86 = _0x5a22f3 => {
    const _0x40ade6 = _0x5a22f3.target?.closest?.(CREDENTIAL_MENU_ITEM_SELECTOR);
    if (!_0x40ade6 || !_0x247183.contains?.(_0x40ade6)) {
      return;
    }
    const {
      modelId: _0x2eb82,
      providerId: _0x13416d
    } = getMenuItemCredentialContext(_0x40ade6);
    const _0xff69cf = getMenuItemProviderProfileId(_0x40ade6, _0x4b9c92, _0x2eb82, _0x13416d);
    if (_0xff69cf) {
      _0x40ade6.dataset.credentialResolvedProviderProfileId = _0xff69cf;
    }
    const _0x671cd = getModelGenerationReadiness({
      modelId: _0x2eb82,
      provider: _0x13416d,
      providerProfileId: _0xff69cf
    });
    if (_0x671cd.status !== "missing") {
      return;
    }
    _0x5a22f3.preventDefault?.();
    _0x5a22f3.stopImmediatePropagation?.();
    _0x5a22f3.stopPropagation?.();
    showMissingCredential(_0x671cd);
  };
  _0x247183.addEventListener("click", _0x512f86, true);
  if (_0x4b9c92.listenConfigChanges !== false) {
    globalThis.window?.addEventListener?.(API_CONFIG_CHANGED_EVENT, _0x95abd9);
    globalThis.window?.addEventListener?.(CLI_PROVIDER_STATUS_CHANGED_EVENT, _0x95abd9);
    globalThis.window?.addEventListener?.(DREAMINA_CLI_STATUS_CHANGED_EVENT, _0x95abd9);
  }
  _0x95abd9();
  return () => {
    _0x247183.removeEventListener?.("click", _0x512f86, true);
    if (_0x4b9c92.listenConfigChanges !== false) {
      globalThis.window?.removeEventListener?.(API_CONFIG_CHANGED_EVENT, _0x95abd9);
      globalThis.window?.removeEventListener?.(CLI_PROVIDER_STATUS_CHANGED_EVENT, _0x95abd9);
      globalThis.window?.removeEventListener?.(DREAMINA_CLI_STATUS_CHANGED_EVENT, _0x95abd9);
    }
  };
}