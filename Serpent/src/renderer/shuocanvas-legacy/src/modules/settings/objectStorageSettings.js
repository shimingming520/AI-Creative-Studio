import { API_CONFIG_CHANGED_EVENT, getApiConfigSnapshot, getObjectStorageConfig, saveApiConfigToServer } from "../../../api/configApi.js";
import { normalizeObjectStorageConfig, testObjectStorageConnection, validateObjectStorageConfig } from "../../../api/objectStorageApi.js";
import { getObjectStorageProviderProfile, isObjectStorageProviderVerified, markObjectStorageProviderVerified, normalizeObjectStorageSettings, serializeObjectStorageSettings, updateObjectStorageProviderProfile } from "../../../api/objectStorageProfiles.js";
import { t } from "../../i18n/index.js";
const FIELD_IDS = Object.freeze(["objectStorageEndpoint", "objectStorageRegion", "objectStorageBucket", "objectStorageAccessKeyId", "objectStorageSecretAccessKey", "objectStoragePublicBaseUrl"]);
const PROVIDER_UI = Object.freeze({
  "cloudflare-r2": Object.freeze({
    i18nKey: "cloudflareR2",
    badge: "R2",
    consoleUrl: "https://dash.cloudflare.com/?to=%2F%3Aaccount%2Fr2%2Foverview",
    tutorialUrl: "https://acn2d4t93dcs.feishu.cn/wiki/EBmdwmAUNiHIuKkzIVLcoOK2n2g?from=from_copylink",
    showEndpoint: true,
    showRegion: false,
    showAddressingStyle: false,
    endpointPlaceholder: "https://<account-id>.r2.cloudflarestorage.com",
    regionPlaceholder: "auto",
    bucketPlaceholder: "aicanvas-assets",
    publicUrlPlaceholder: "https://assets.example.com"
  }),
  "tencent-cos": Object.freeze({
    i18nKey: "tencentCos",
    badge: "COS",
    consoleUrl: "https://console.cloud.tencent.com/cos",
    tutorialUrl: "https://cloud.tencent.com/document/product/436/34688",
    showEndpoint: false,
    showRegion: true,
    showAddressingStyle: false,
    endpointPlaceholder: "",
    regionPlaceholder: "ap-guangzhou",
    bucketPlaceholder: "examplebucket-1250000000",
    publicUrlPlaceholder: "https://examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com"
  }),
  "aliyun-oss": Object.freeze({
    i18nKey: "aliyunOss",
    badge: "OSS",
    consoleUrl: "https://oss.console.aliyun.com/overview",
    tutorialUrl: "https://help.aliyun.com/zh/oss/developer-reference/use-aws-sdks-to-access-oss",
    showEndpoint: false,
    showRegion: true,
    showAddressingStyle: false,
    endpointPlaceholder: "",
    regionPlaceholder: "cn-hangzhou",
    bucketPlaceholder: "aicanvas-assets",
    publicUrlPlaceholder: "https://aicanvas-assets.oss-cn-hangzhou.aliyuncs.com"
  }),
  "s3-compatible": Object.freeze({
    i18nKey: "s3Compatible",
    badge: "S3",
    consoleUrl: "",
    tutorialUrl: "",
    showEndpoint: true,
    showRegion: true,
    showAddressingStyle: true,
    endpointPlaceholder: "https://storage.example.com",
    regionPlaceholder: "us-east-1",
    bucketPlaceholder: "aicanvas-assets",
    publicUrlPlaceholder: "https://assets.example.com"
  })
});
function tr(_0x864f04, _0x556da2 = {}) {
  let _0x4a20c6 = t("settings.objectStorage." + _0x864f04);
  Object.entries(_0x556da2).forEach(([_0x54dfd1, _0xdf8a2d]) => {
    _0x4a20c6 = _0x4a20c6.split("{" + _0x54dfd1 + "}").join(String(_0xdf8a2d ?? ""));
  });
  return _0x4a20c6;
}
function getElements(_0x74cd07 = globalThis.document) {
  if (!_0x74cd07) {
    return {};
  }
  const _0xdfb973 = {
    card: _0x74cd07.getElementById("objectStorageConfigCard"),
    enabledOn: _0x74cd07.getElementById("btnObjectStorageEnabledOn"),
    enabledOff: _0x74cd07.getElementById("btnObjectStorageEnabledOff"),
    test: _0x74cd07.getElementById("btnObjectStorageTest"),
    status: _0x74cd07.getElementById("objectStorageStatus"),
    providerButtons: Array.from(_0x74cd07.querySelectorAll?.("[data-object-storage-provider]") || []),
    providerBadge: _0x74cd07.getElementById("objectStorageProviderBadge"),
    providerTitle: _0x74cd07.getElementById("objectStorageProviderTitle"),
    providerConsole: _0x74cd07.getElementById("objectStorageProviderConsole"),
    providerTutorial: _0x74cd07.getElementById("objectStorageProviderTutorial"),
    providerDescription: _0x74cd07.getElementById("objectStorageProviderDescription"),
    endpointField: _0x74cd07.getElementById("objectStorageEndpointField"),
    regionField: _0x74cd07.getElementById("objectStorageRegionField"),
    addressingStyleField: _0x74cd07.getElementById("objectStorageAddressingStyleField"),
    addressingPath: _0x74cd07.getElementById("objectStorageAddressingPath"),
    addressingVirtualHosted: _0x74cd07.getElementById("objectStorageAddressingVirtualHosted"),
    accessKeyIdLabel: _0x74cd07.getElementById("objectStorageAccessKeyIdLabel"),
    secretAccessKeyLabel: _0x74cd07.getElementById("objectStorageSecretAccessKeyLabel")
  };
  FIELD_IDS.forEach(_0x432d5d => {
    _0xdfb973[_0x432d5d] = _0x74cd07.getElementById(_0x432d5d);
  });
  return _0xdfb973;
}
function setToggleButtonState(_0x5369f8, _0x5f0084) {
  if (!_0x5369f8) {
    return;
  }
  _0x5369f8.classList?.toggle("active", _0x5f0084);
  _0x5369f8.setAttribute?.("aria-pressed", _0x5f0084 ? "true" : "false");
}
function isObjectStorageBusy(_0x42ab36) {
  return _0x42ab36.card?.dataset?.objectStorageToggleBusy === "true";
}
export function setObjectStorageFormEnabled(_0x4c7f6c, _0x48a770) {
  const _0x127958 = _0x48a770 === true;
  setToggleButtonState(_0x4c7f6c.enabledOn, _0x127958);
  setToggleButtonState(_0x4c7f6c.enabledOff, !_0x127958);
  FIELD_IDS.forEach(_0x2075e1 => {
    if (_0x4c7f6c[_0x2075e1]) {
      _0x4c7f6c[_0x2075e1].disabled = isObjectStorageBusy(_0x4c7f6c);
    }
  });
  if (_0x4c7f6c.test) {
    _0x4c7f6c.test.disabled = isObjectStorageBusy(_0x4c7f6c);
  }
  if (_0x4c7f6c.card?.dataset) {
    _0x4c7f6c.card.dataset.objectStorageEnabled = _0x127958 ? "true" : "false";
  }
}
function setStatus(_0x3f8a3e, _0x1866e0, _0x27c32f) {
  const _0xe8699b = _0x3f8a3e.status;
  if (!_0xe8699b) {
    return;
  }
  _0xe8699b.textContent = String(_0x27c32f || "");
  _0xe8699b.classList?.toggle("is-success", _0x1866e0 === "success");
  _0xe8699b.classList?.toggle("is-error", _0x1866e0 === "error");
  _0xe8699b.classList?.toggle("is-warning", _0x1866e0 === "warning");
}
function setObjectStorageToggleBusy(_0x4c5433, _0x3b25dc) {
  const _0x132959 = _0x3b25dc === true;
  if (_0x4c5433.enabledOn) {
    _0x4c5433.enabledOn.disabled = _0x132959;
  }
  if (_0x4c5433.enabledOff) {
    _0x4c5433.enabledOff.disabled = _0x132959;
  }
  FIELD_IDS.forEach(_0x469df2 => {
    if (_0x4c5433[_0x469df2]) {
      _0x4c5433[_0x469df2].disabled = _0x132959;
    }
  });
  _0x4c5433.providerButtons?.forEach(_0x510443 => {
    _0x510443.disabled = _0x132959;
  });
  if (_0x4c5433.addressingPath) {
    _0x4c5433.addressingPath.disabled = _0x132959;
  }
  if (_0x4c5433.addressingVirtualHosted) {
    _0x4c5433.addressingVirtualHosted.disabled = _0x132959;
  }
  if (_0x4c5433.test) {
    _0x4c5433.test.disabled = _0x132959;
  }
  if (_0x4c5433.card?.dataset) {
    _0x4c5433.card.dataset.objectStorageToggleBusy = _0x132959 ? "true" : "false";
  }
  if (_0x132959) {
    _0x4c5433.card?.setAttribute?.("aria-busy", "true");
  } else {
    _0x4c5433.card?.removeAttribute?.("aria-busy");
  }
}
function getSelectedProviderId(_0x5d1713, _0x205c55 = {}) {
  const _0x3cd83f = _0x5d1713.providerButtons?.find(_0x349959 => _0x349959.classList?.contains("is-active") || _0x349959.getAttribute?.("aria-pressed") === "true");
  if (_0x3cd83f?.dataset?.objectStorageProvider) {
    return _0x3cd83f.dataset.objectStorageProvider;
  }
  return normalizeObjectStorageSettings(_0x205c55).providerId;
}
function setProviderButtonState(_0x4e7f81, _0x852e81, _0x790a95) {
  _0x4e7f81.providerButtons?.forEach(_0x1de910 => {
    const _0x79800e = _0x1de910.dataset?.objectStorageProvider;
    const _0x307a51 = _0x79800e === _0x852e81;
    const _0x133599 = isObjectStorageProviderVerified(_0x790a95, _0x79800e);
    const _0x529b77 = PROVIDER_UI[_0x79800e];
    _0x1de910.classList?.toggle("is-active", _0x307a51);
    _0x1de910.classList?.toggle("is-verified", _0x133599);
    _0x1de910.setAttribute?.("aria-pressed", _0x307a51 ? "true" : "false");
    if (_0x1de910.dataset) {
      _0x1de910.dataset.objectStorageVerified = _0x133599 ? "true" : "false";
    }
    if (_0x529b77) {
      const _0x19d86f = tr("providers." + _0x529b77.i18nKey + ".title");
      _0x1de910.setAttribute?.("aria-label", _0x133599 ? _0x19d86f + "，" + tr("status.ready") : _0x19d86f);
    }
  });
}
function setAddressingStyleState(_0xbd07bd, _0x2e9406) {
  const _0x3045f3 = _0x2e9406 === "virtual-hosted";
  setToggleButtonState(_0xbd07bd.addressingPath, !_0x3045f3);
  setToggleButtonState(_0xbd07bd.addressingVirtualHosted, _0x3045f3);
}
function getAddressingStyle(_0x205c02) {
  if (_0x205c02.addressingVirtualHosted?.classList?.contains("active")) {
    return "virtual-hosted";
  } else {
    return "path";
  }
}
function setHidden(_0x1ce319, _0x23a805) {
  if (_0x1ce319) {
    _0x1ce319.hidden = _0x23a805 === true;
  }
}
function setPlaceholder(_0x539d17, _0x58f0f2) {
  if (!_0x539d17) {
    return;
  }
  _0x539d17.placeholder = String(_0x58f0f2 || "");
  _0x539d17.removeAttribute?.("data-i18n-placeholder");
}
function renderProviderPresentation(_0x457581, _0x5359fa, _0x5f13cc) {
  const _0x439ded = PROVIDER_UI[_0x5359fa] || PROVIDER_UI["cloudflare-r2"];
  const _0x4599b2 = "providers." + _0x439ded.i18nKey;
  if (_0x457581.providerBadge) {
    _0x457581.providerBadge.textContent = _0x439ded.badge;
  }
  if (_0x457581.providerTitle) {
    _0x457581.providerTitle.textContent = tr(_0x4599b2 + ".title");
    _0x457581.providerTitle.setAttribute?.("data-i18n", "settings.objectStorage." + _0x4599b2 + ".title");
  }
  if (_0x457581.providerDescription) {
    _0x457581.providerDescription.textContent = tr(_0x4599b2 + ".desc");
    _0x457581.providerDescription.setAttribute?.("data-i18n", "settings.objectStorage." + _0x4599b2 + ".desc");
  }
  [["accessKeyIdLabel", _0x457581.accessKeyIdLabel], ["secretAccessKeyLabel", _0x457581.secretAccessKeyLabel]].forEach(([_0x587d86, _0x22cc2b]) => {
    if (!_0x22cc2b) {
      return;
    }
    _0x22cc2b.textContent = tr(_0x4599b2 + "." + _0x587d86);
    _0x22cc2b.setAttribute?.("data-i18n", "settings.objectStorage." + _0x4599b2 + "." + _0x587d86);
  });
  if (_0x457581.providerConsole) {
    setHidden(_0x457581.providerConsole, !_0x439ded.consoleUrl);
    _0x457581.providerConsole.dataset.externalUrl = _0x439ded.consoleUrl;
    _0x457581.providerConsole.setAttribute?.("data-external-url", _0x439ded.consoleUrl);
    if (_0x439ded.consoleUrl) {
      _0x457581.providerConsole.textContent = tr(_0x4599b2 + ".console");
      _0x457581.providerConsole.setAttribute?.("data-i18n", "settings.objectStorage." + _0x4599b2 + ".console");
    } else {
      _0x457581.providerConsole.textContent = "";
      _0x457581.providerConsole.removeAttribute?.("data-i18n");
    }
  }
  if (_0x457581.providerTutorial) {
    setHidden(_0x457581.providerTutorial, !_0x439ded.tutorialUrl);
    _0x457581.providerTutorial.dataset.externalUrl = _0x439ded.tutorialUrl;
    _0x457581.providerTutorial.setAttribute?.("data-external-url", _0x439ded.tutorialUrl);
  }
  setHidden(_0x457581.endpointField, !_0x439ded.showEndpoint);
  setHidden(_0x457581.regionField, !_0x439ded.showRegion);
  setHidden(_0x457581.addressingStyleField, !_0x439ded.showAddressingStyle);
  setPlaceholder(_0x457581.objectStorageEndpoint, _0x439ded.endpointPlaceholder);
  setPlaceholder(_0x457581.objectStorageRegion, _0x439ded.regionPlaceholder);
  setPlaceholder(_0x457581.objectStorageBucket, _0x439ded.bucketPlaceholder);
  setPlaceholder(_0x457581.objectStoragePublicBaseUrl, _0x439ded.publicUrlPlaceholder);
  setAddressingStyleState(_0x457581, _0x5f13cc.addressingStyle);
}
export function collectObjectStorageFormConfig(_0x3edebb, _0x584dac = getObjectStorageConfig()) {
  const _0x49158e = normalizeObjectStorageSettings(_0x584dac);
  const _0x1c50c3 = getSelectedProviderId(_0x3edebb, _0x49158e);
  const _0x144a80 = getObjectStorageProviderProfile(_0x49158e, _0x1c50c3);
  const _0x5f3bc2 = updateObjectStorageProviderProfile(_0x49158e, _0x1c50c3, {
    endpoint: _0x3edebb.objectStorageEndpoint?.value,
    region: _0x3edebb.objectStorageRegion?.value,
    bucket: _0x3edebb.objectStorageBucket?.value,
    accessKeyId: _0x3edebb.objectStorageAccessKeyId?.value,
    secretAccessKey: _0x3edebb.objectStorageSecretAccessKey?.value,
    sessionToken: _0x144a80.sessionToken,
    publicBaseUrl: _0x3edebb.objectStoragePublicBaseUrl?.value,
    addressingStyle: getAddressingStyle(_0x3edebb)
  });
  return serializeObjectStorageSettings({
    ..._0x5f3bc2,
    enabled: _0x3edebb.enabledOn?.classList?.contains("active") === true
  });
}
export function renderObjectStorageForm(_0x8433c1, _0x4786c0 = {}) {
  const _0x5a0f2d = normalizeObjectStorageSettings(_0x4786c0);
  const _0x16d0e2 = getObjectStorageProviderProfile(_0x5a0f2d, _0x5a0f2d.providerId);
  setProviderButtonState(_0x8433c1, _0x5a0f2d.providerId, _0x5a0f2d);
  renderProviderPresentation(_0x8433c1, _0x5a0f2d.providerId, _0x16d0e2);
  if (_0x8433c1.objectStorageEndpoint) {
    _0x8433c1.objectStorageEndpoint.value = _0x16d0e2.endpoint;
  }
  if (_0x8433c1.objectStorageRegion) {
    _0x8433c1.objectStorageRegion.value = _0x16d0e2.region;
  }
  if (_0x8433c1.objectStorageBucket) {
    _0x8433c1.objectStorageBucket.value = _0x16d0e2.bucket;
  }
  if (_0x8433c1.objectStorageAccessKeyId) {
    _0x8433c1.objectStorageAccessKeyId.value = _0x16d0e2.accessKeyId;
  }
  if (_0x8433c1.objectStorageSecretAccessKey) {
    _0x8433c1.objectStorageSecretAccessKey.value = _0x16d0e2.secretAccessKey;
  }
  if (_0x8433c1.objectStoragePublicBaseUrl) {
    _0x8433c1.objectStoragePublicBaseUrl.value = _0x16d0e2.publicBaseUrl;
  }
  setObjectStorageFormEnabled(_0x8433c1, _0x5a0f2d.enabled);
  setStatus(_0x8433c1, _0x5a0f2d.enabled ? "warning" : "", _0x5a0f2d.enabled ? tr("status.enabled") : tr("status.disabled"));
}
function setTestButtonBusy(_0x4adafc, _0x3e847f, _0x3e824a, _0x108a91) {
  if (!_0x4adafc) {
    return;
  }
  _0x4adafc.classList?.toggle("is-testing", _0x3e847f === true);
  _0x4adafc.setAttribute?.("aria-busy", _0x3e847f ? "true" : "false");
  _0x4adafc.textContent = _0x3e847f ? _0x3e824a : _0x108a91;
}
export async function saveObjectStorageEnabledState(_0x539369, _0xb1cc0, {
  getCurrentConfig = getObjectStorageConfig,
  getCurrentSnapshot = getApiConfigSnapshot,
  saveConfig = saveApiConfigToServer
} = {}) {
  if (isObjectStorageBusy(_0x539369)) {
    return {
      ok: false,
      ignored: true
    };
  }
  const _0x5b87a1 = getCurrentConfig();
  setObjectStorageFormEnabled(_0x539369, _0xb1cc0);
  const _0x268646 = collectObjectStorageFormConfig(_0x539369, _0x5b87a1);
  if (_0xb1cc0 && !isObjectStorageProviderVerified(_0x268646, _0x268646.providerId)) {
    const _0x5452c6 = serializeObjectStorageSettings({
      ..._0x268646,
      enabled: false
    });
    renderObjectStorageForm(_0x539369, _0x5452c6);
    const _0x4b73cf = tr("status.testRequired");
    setStatus(_0x539369, "warning", _0x4b73cf);
    return {
      ok: false,
      blocked: true,
      message: _0x4b73cf,
      objectStorage: _0x5452c6
    };
  }
  setObjectStorageToggleBusy(_0x539369, true);
  setStatus(_0x539369, "warning", tr("actions.saving"));
  try {
    const _0x5cc9ca = _0xb1cc0 ? serializeObjectStorageSettings({
      ..._0x268646,
      enabled: true
    }) : serializeObjectStorageSettings({
      ..._0x268646,
      enabled: false
    });
    if (_0xb1cc0) {
      validateObjectStorageConfig(_0x5cc9ca);
    }
    await saveConfig({
      ...getCurrentSnapshot(),
      objectStorage: _0x5cc9ca
    });
    const _0x2eea84 = _0xb1cc0 ? tr("status.savedEnabled") : tr("status.savedDisabled");
    setStatus(_0x539369, _0xb1cc0 ? "success" : "", _0x2eea84);
    return {
      ok: true,
      message: _0x2eea84,
      objectStorage: _0x5cc9ca
    };
  } catch (_0x33aaef) {
    renderObjectStorageForm(_0x539369, _0x5b87a1);
    const _0x4e29be = tr("status.saveFailed", {
      error: _0x33aaef?.message || tr("status.unknownError")
    });
    setStatus(_0x539369, "error", _0x4e29be);
    return {
      ok: false,
      error: _0x33aaef,
      message: _0x4e29be
    };
  } finally {
    setObjectStorageToggleBusy(_0x539369, false);
  }
}
export async function saveObjectStorageFieldChanges(_0x3a859e, {
  getCurrentConfig = getObjectStorageConfig,
  getCurrentSnapshot = getApiConfigSnapshot,
  saveConfig = saveApiConfigToServer
} = {}) {
  if (isObjectStorageBusy(_0x3a859e)) {
    return {
      ok: false,
      ignored: true
    };
  }
  const _0x3060db = getCurrentConfig();
  const _0x2419ab = normalizeObjectStorageSettings(_0x3060db).enabled;
  setObjectStorageToggleBusy(_0x3a859e, true);
  setStatus(_0x3a859e, "warning", tr("actions.saving"));
  try {
    const _0x4cca9e = collectObjectStorageFormConfig(_0x3a859e, _0x3060db);
    const _0x22454d = _0x2419ab && !_0x4cca9e.enabled;
    if (_0x4cca9e.enabled) {
      validateObjectStorageConfig(_0x4cca9e);
    }
    await saveConfig({
      ...getCurrentSnapshot(),
      objectStorage: _0x4cca9e
    });
    renderObjectStorageForm(_0x3a859e, _0x4cca9e);
    const _0x4fd3fe = _0x22454d ? tr("status.changedRequiresRetest") : tr("status.saveSuccess");
    setStatus(_0x3a859e, _0x22454d ? "warning" : "success", _0x4fd3fe);
    return {
      ok: true,
      disabledAfterChange: _0x22454d,
      message: _0x4fd3fe,
      objectStorage: _0x4cca9e
    };
  } catch (_0x4e1a80) {
    renderObjectStorageForm(_0x3a859e, _0x3060db);
    const _0x5af2a1 = tr("status.saveFailed", {
      error: _0x4e1a80?.message || tr("status.unknownError")
    });
    setStatus(_0x3a859e, "error", _0x5af2a1);
    return {
      ok: false,
      error: _0x4e1a80,
      message: _0x5af2a1
    };
  } finally {
    setObjectStorageToggleBusy(_0x3a859e, false);
  }
}
export async function saveObjectStorageProviderSelection(_0x1c9ec1, _0x7086c4, {
  getCurrentConfig = getObjectStorageConfig,
  getCurrentSnapshot = getApiConfigSnapshot,
  saveConfig = saveApiConfigToServer
} = {}) {
  if (isObjectStorageBusy(_0x1c9ec1) || !Object.prototype.hasOwnProperty.call(PROVIDER_UI, _0x7086c4)) {
    return {
      ok: false,
      ignored: true
    };
  }
  const _0xe56cdf = getCurrentConfig();
  const _0x2b7a80 = normalizeObjectStorageSettings(_0xe56cdf).enabled;
  const _0x17bf1b = collectObjectStorageFormConfig(_0x1c9ec1, _0xe56cdf);
  if (_0x17bf1b.providerId === _0x7086c4) {
    return {
      ok: true,
      ignored: true,
      objectStorage: _0x17bf1b
    };
  }
  let _0x1b4b3a = serializeObjectStorageSettings({
    ..._0x17bf1b,
    providerId: _0x7086c4,
    enabled: _0x2b7a80
  });
  let _0x465ea6 = _0x2b7a80 && !_0x1b4b3a.enabled;
  if (_0x1b4b3a.enabled) {
    try {
      validateObjectStorageConfig(_0x1b4b3a);
    } catch {
      _0x1b4b3a = serializeObjectStorageSettings({
        ..._0x1b4b3a,
        enabled: false
      });
      _0x465ea6 = true;
    }
  }
  renderObjectStorageForm(_0x1c9ec1, _0x1b4b3a);
  setObjectStorageToggleBusy(_0x1c9ec1, true);
  setStatus(_0x1c9ec1, "warning", tr("actions.saving"));
  try {
    await saveConfig({
      ...getCurrentSnapshot(),
      objectStorage: _0x1b4b3a
    });
    renderObjectStorageForm(_0x1c9ec1, _0x1b4b3a);
    const _0x1c5f6f = PROVIDER_UI[_0x7086c4];
    const _0x54d77f = tr("providers." + _0x1c5f6f.i18nKey + ".title");
    const _0xe9a213 = _0x465ea6 ? tr("status.providerSelectedDisabled", {
      provider: _0x54d77f
    }) : tr("status.providerSelected", {
      provider: _0x54d77f
    });
    setStatus(_0x1c9ec1, _0x465ea6 ? "warning" : "success", _0xe9a213);
    return {
      ok: true,
      disabledAfterSelection: _0x465ea6,
      message: _0xe9a213,
      objectStorage: _0x1b4b3a
    };
  } catch (_0x443013) {
    renderObjectStorageForm(_0x1c9ec1, _0xe56cdf);
    const _0x47bd19 = tr("status.saveFailed", {
      error: _0x443013?.message || tr("status.unknownError")
    });
    setStatus(_0x1c9ec1, "error", _0x47bd19);
    return {
      ok: false,
      error: _0x443013,
      message: _0x47bd19
    };
  } finally {
    setObjectStorageToggleBusy(_0x1c9ec1, false);
  }
}
export async function verifyObjectStorageConnection(_0x1a4427, {
  getCurrentConfig = getObjectStorageConfig,
  getCurrentSnapshot = getApiConfigSnapshot,
  testConnection = testObjectStorageConnection,
  saveConfig = saveApiConfigToServer,
  now = Date.now
} = {}) {
  if (isObjectStorageBusy(_0x1a4427)) {
    return {
      ok: false,
      ignored: true
    };
  }
  const _0x176b3e = tr("actions.test");
  const _0x8505cb = getCurrentConfig();
  let _0x26b04e;
  try {
    _0x26b04e = collectObjectStorageFormConfig(_0x1a4427, _0x8505cb);
    validateObjectStorageConfig(_0x26b04e, {
      requireEnabled: false
    });
    setObjectStorageToggleBusy(_0x1a4427, true);
    setTestButtonBusy(_0x1a4427.test, true, tr("actions.testing"), _0x176b3e);
    setStatus(_0x1a4427, "warning", tr("status.testing"));
    const _0xf93a64 = await testConnection(_0x26b04e);
    const _0xba7162 = serializeObjectStorageSettings(markObjectStorageProviderVerified(_0x26b04e, _0x26b04e.providerId, {
      verifiedAt: now()
    }));
    await saveConfig({
      ...getCurrentSnapshot(),
      objectStorage: _0xba7162
    });
    renderObjectStorageForm(_0x1a4427, _0xba7162);
    const _0x37e3ec = _0xf93a64?.cleanupOk === false ? " " + tr("status.testCleanupWarning") : "";
    const _0x53d07f = "" + tr("status.testSuccess") + _0x37e3ec;
    setStatus(_0x1a4427, "success", _0x53d07f);
    return {
      ok: true,
      message: _0x53d07f,
      objectStorage: _0xba7162,
      result: _0xf93a64
    };
  } catch (_0x35ac5b) {
    const _0x34a125 = tr("status.testFailed", {
      error: _0x35ac5b?.message || tr("status.unknownError")
    });
    setStatus(_0x1a4427, "error", _0x34a125);
    return {
      ok: false,
      error: _0x35ac5b,
      message: _0x34a125,
      objectStorage: _0x26b04e
    };
  } finally {
    setTestButtonBusy(_0x1a4427.test, false, tr("actions.testing"), _0x176b3e);
    setObjectStorageToggleBusy(_0x1a4427, false);
  }
}
function showToast(_0x2c5063, _0x271c6f = "") {
  globalThis.window?.showToast?.(_0x2c5063, _0x271c6f);
}
export function initObjectStorageSettings({
  documentObject = globalThis.document,
  windowObject = globalThis.window
} = {}) {
  const _0x20c864 = getElements(documentObject);
  if (!_0x20c864.card || _0x20c864.card.dataset?.objectStorageBound === "true") {
    return false;
  }
  _0x20c864.card.dataset.objectStorageBound = "true";
  renderObjectStorageForm(_0x20c864, getObjectStorageConfig());
  const _0x37b1d2 = async _0x1e39b7 => {
    const _0x35461b = await saveObjectStorageEnabledState(_0x20c864, _0x1e39b7);
    if (_0x35461b.ignored) {
      return;
    }
    showToast(_0x35461b.ok ? tr("status.saveSuccess") : _0x35461b.message, _0x35461b.ok ? "" : _0x35461b.blocked ? "warning" : "error");
  };
  _0x20c864.enabledOn?.addEventListener("click", () => {
    _0x37b1d2(true);
  });
  _0x20c864.enabledOff?.addEventListener("click", () => {
    _0x37b1d2(false);
  });
  _0x20c864.providerButtons?.forEach(_0x5315e8 => {
    _0x5315e8.addEventListener?.("click", async () => {
      const _0xf59995 = await saveObjectStorageProviderSelection(_0x20c864, _0x5315e8.dataset?.objectStorageProvider);
      if (!_0xf59995.ok && !_0xf59995.ignored) {
        showToast(_0xf59995.message, "error");
      }
    });
  });
  FIELD_IDS.forEach(_0x18db41 => {
    _0x20c864[_0x18db41]?.addEventListener("change", async () => {
      const _0x19715d = await saveObjectStorageFieldChanges(_0x20c864);
      if (!_0x19715d.ok && !_0x19715d.ignored) {
        showToast(_0x19715d.message, "error");
      }
    });
  });
  const _0x146b70 = _0x33625f => {
    setAddressingStyleState(_0x20c864, _0x33625f);
    saveObjectStorageFieldChanges(_0x20c864).then(_0x173b0f => {
      if (!_0x173b0f.ok && !_0x173b0f.ignored) {
        showToast(_0x173b0f.message, "error");
      }
    });
  };
  _0x20c864.addressingPath?.addEventListener("click", () => {
    _0x146b70("path");
  });
  _0x20c864.addressingVirtualHosted?.addEventListener("click", () => {
    _0x146b70("virtual-hosted");
  });
  _0x20c864.test?.addEventListener("click", async () => {
    const _0x22c596 = await verifyObjectStorageConnection(_0x20c864);
    if (_0x22c596.ignored) {
      return;
    }
    showToast(_0x22c596.message, _0x22c596.ok ? "" : "error");
  });
  windowObject?.addEventListener?.(API_CONFIG_CHANGED_EVENT, () => {
    renderObjectStorageForm(_0x20c864, getObjectStorageConfig());
  });
  return true;
}
export const __objectStorageSettingsForTest = Object.freeze({
  FIELD_IDS: FIELD_IDS,
  PROVIDER_UI: PROVIDER_UI,
  getElements: getElements
});