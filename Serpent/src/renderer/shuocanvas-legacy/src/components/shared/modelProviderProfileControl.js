import { buildModelProviderProfileSelectionPatch, getModelProviderProfileIds, getNextModelProviderProfileId, resolveReadyModelProviderProfileId, resolveModelProviderProfileId } from "../../modules/modelProviderProfileSelection.js";
import { getModelProviderProfile } from "../../modules/modelProviderProfiles.js";
import { RUNNINGHUB_DOMESTIC_PROFILE_ID, RUNNINGHUB_INTERNATIONAL_PROFILE_ID } from "../../modules/runningHubProviderProfiles.js";
import { API_CONFIG_CHANGED_EVENT } from "../../../api/configApi.js";
import { ensureModelGenerationReadiness, getModelGenerationReadiness } from "../../services/modelGenerationReadiness.js";
import { getModelManifest } from "../../manifests/index.js";
import { showProviderApiKeyMissingToast } from "../../modules/providerApiKeyMissingToast.js";
import { escapeNodeMenuHtml } from "./nodeModelMenu.js";
export function getModelProviderProfileShortLabel(_0x292f83) {
  const _0x31ac3f = String(_0x292f83 || "").trim();
  const _0x4f2f2a = getModelProviderProfile(_0x31ac3f);
  return String(_0x4f2f2a?.shortLabel || "").trim() || _0x31ac3f;
}
export function getModelProviderProfileStyleId(_0x17ecb6) {
  const _0x521999 = String(_0x17ecb6 || "").trim();
  const _0x25f71a = getModelProviderProfile(_0x521999)?.region;
  if (_0x25f71a === "domestic") {
    return RUNNINGHUB_DOMESTIC_PROFILE_ID;
  }
  if (_0x25f71a === "international") {
    return RUNNINGHUB_INTERNATIONAL_PROFILE_ID;
  }
  return _0x521999;
}
export function buildModelProviderProfileBadgesHtml(_0x4a20c8, {
  vip = false
} = {}) {
  const _0x48f530 = getModelProviderProfileIds(_0x4a20c8);
  if (!_0x48f530.length && !vip) {
    return "";
  }
  const _0x227fe7 = _0x48f530.map(_0x46fd83 => {
    const _0x3c8751 = getModelProviderProfile(_0x46fd83);
    const _0x3995e8 = _0x3c8751?.region ? _0x3c8751.region === "international" : _0x46fd83.endsWith("-international");
    const _0x6a1c2 = _0x3995e8 ? "model-provider-profile-badge--international" : "model-provider-profile-badge--domestic";
    return "<span class=\"floating-menu-badge floating-menu-badge-inline model-provider-profile-badge " + _0x6a1c2 + "\">" + escapeNodeMenuHtml(getModelProviderProfileShortLabel(_0x46fd83)) + "</span>";
  }).join("");
  const _0x2bac75 = vip ? "<span class=\"floating-menu-badge floating-menu-badge-inline floating-menu-badge-warning\">VIP</span>" : "";
  return "<span class=\"model-provider-profile-badges\">" + _0x227fe7 + _0x2bac75 + "</span>";
}
function getProviderProfileAdapterType(_0x1f93dd) {
  if (getModelManifest(_0x1f93dd)?.adapterType === "workflow") {
    return "workflow";
  } else {
    return "modelApi";
  }
}
export function getModelProviderProfileReadiness(_0x4380c0, _0x195867) {
  return getModelGenerationReadiness({
    modelId: _0x4380c0,
    providerProfileId: _0x195867,
    adapterType: getProviderProfileAdapterType(_0x4380c0)
  });
}
function ensureProfileReadiness(_0x22ed8c, _0x2ae299) {
  return ensureModelGenerationReadiness({
    modelId: _0x22ed8c,
    providerProfileId: _0x2ae299,
    adapterType: getProviderProfileAdapterType(_0x22ed8c)
  });
}
function readinessToAvailability(_0x35c0f8) {
  if (_0x35c0f8?.status === "loading") {
    return null;
  }
  return _0x35c0f8?.ready === true;
}
export function resolveConfiguredModelProviderProfileId(_0x4d410c = {}, _0x14adcc = getModelProviderProfileReadiness) {
  const _0x5704f3 = resolveModelProviderProfileId(_0x4d410c);
  return resolveReadyModelProviderProfileId(_0x4d410c?.model, _0x5704f3, _0x549065 => readinessToAvailability(_0x14adcc(_0x4d410c?.model, _0x549065)));
}
export function getProfileSwitchConfigurationMessage(_0x318da7, _0x1ae01e = "") {
  const _0xdc2383 = getModelProviderProfile(_0x318da7);
  const _0x4a94e7 = String(_0xdc2383?.switchLabel || "").trim() || getModelProviderProfileShortLabel(_0x318da7) + "线路";
  const _0x54db1f = getProviderProfileAdapterType(_0x1ae01e) === "workflow" ? "工作流 API Key" : String(_0xdc2383?.credentialLabel || "模型 API Key").trim();
  const _0x537794 = /^[A-Za-z]/.test(_0x54db1f) ? " " : "";
  return "切换到 " + _0x4a94e7 + "需配置" + _0x537794 + _0x54db1f;
}
function showProfileConfigurationRequired(_0x548efc, _0x3d10ae, _0x512ecd) {
  const _0x43142e = getProviderProfileAdapterType(_0x512ecd);
  showProviderApiKeyMissingToast(getProfileSwitchConfigurationMessage(_0x3d10ae, _0x512ecd), {
    providerId: _0x3d10ae,
    fieldIds: _0x548efc?.fieldIds,
    keyType: _0x43142e === "workflow" ? "workflow" : "modelApi",
    adapterType: _0x43142e,
    model: _0x512ecd
  });
}
export async function requestModelProviderProfileSelection({
  nodeData = {},
  targetProfileId: _0x2e8b86,
  getProfileReadiness = getModelProviderProfileReadiness,
  ensureProfileReady = ensureProfileReadiness,
  onChange: _0x4b5f08,
  onUnavailable = showProfileConfigurationRequired
} = {}) {
  const _0x527f25 = String(nodeData?.model || "").trim();
  const _0x2df758 = String(_0x2e8b86 || "").trim();
  if (!_0x527f25 || !_0x2df758) {
    return {
      changed: false,
      readiness: null
    };
  }
  let _0x2a957a = getProfileReadiness(_0x527f25, _0x2df758);
  if (_0x2a957a?.status === "loading") {
    _0x2a957a = await ensureProfileReady(_0x527f25, _0x2df758).catch(() => _0x2a957a);
  }
  if (!_0x2a957a?.ready) {
    onUnavailable?.(_0x2a957a, _0x2df758, _0x527f25);
    return {
      changed: false,
      readiness: _0x2a957a
    };
  }
  const _0x579b09 = buildModelProviderProfileSelectionPatch(nodeData, _0x527f25, _0x2df758);
  _0x4b5f08?.(_0x579b09);
  return {
    changed: true,
    readiness: _0x2a957a,
    patch: _0x579b09
  };
}
export function createModelProviderProfileControl({
  panel: _0x4d6f69,
  getNodeData: _0x17cee1,
  onChange: _0x373d26,
  getProfileReadiness = getModelProviderProfileReadiness,
  ensureProfileReady = ensureProfileReadiness,
  onUnavailable = showProfileConfigurationRequired
} = {}) {
  let _0xff0e25 = null;
  const _0x4b3890 = () => {
    if (!_0x4d6f69) {
      return null;
    }
    if (_0xff0e25?.parentNode === _0x4d6f69) {
      return _0xff0e25;
    }
    const _0x3a9743 = _0x4d6f69.querySelector?.(".model-provider-profile-toggle");
    if (_0x3a9743) {
      _0xff0e25 = _0x3a9743;
      return _0xff0e25;
    }
    const _0x303898 = _0x4d6f69.ownerDocument?.createElement?.("button");
    if (!_0x303898) {
      return null;
    }
    _0x303898.type = "button";
    _0x303898.className = "model-provider-profile-toggle";
    _0x303898.addEventListener("pointerdown", _0x262874 => {
      _0x262874.preventDefault();
      _0x262874.stopPropagation();
    });
    _0x303898.addEventListener("click", _0x4813a4 => {
      _0x4813a4.preventDefault();
      _0x4813a4.stopPropagation();
      const _0x5dd897 = _0x17cee1?.() || {};
      const _0x2caabd = getNextModelProviderProfileId(_0x5dd897);
      if (!_0x2caabd) {
        return;
      }
      requestModelProviderProfileSelection({
        nodeData: _0x5dd897,
        targetProfileId: _0x2caabd,
        getProfileReadiness: getProfileReadiness,
        ensureProfileReady: ensureProfileReady,
        onChange: _0x373d26,
        onUnavailable: onUnavailable
      });
    });
    _0x4d6f69.appendChild(_0x303898);
    _0xff0e25 = _0x303898;
    return _0xff0e25;
  };
  const _0x5c1653 = () => {
    if (!_0x4d6f69) {
      return;
    }
    const _0x230d1b = _0x17cee1?.() || {};
    const _0x3936b0 = getModelProviderProfileIds(_0x230d1b?.model);
    const _0x382460 = _0x3936b0.length > 1;
    _0x4d6f69.classList?.toggle("has-model-provider-profile-toggle", _0x382460);
    if (!_0x382460) {
      _0xff0e25?.classList?.add("is-hidden");
      return;
    }
    const _0xe0c874 = _0x4b3890();
    if (!_0xe0c874) {
      return;
    }
    const _0x386865 = resolveModelProviderProfileId(_0x230d1b);
    const _0x294155 = resolveConfiguredModelProviderProfileId(_0x230d1b, getProfileReadiness);
    let _0x2b73e4 = _0x230d1b;
    if (_0x294155 && _0x294155 !== _0x386865) {
      const _0x3c66ea = buildModelProviderProfileSelectionPatch(_0x230d1b, _0x230d1b?.model, _0x294155);
      _0x373d26?.(_0x3c66ea);
      _0x2b73e4 = {
        ..._0x230d1b,
        ..._0x3c66ea
      };
    }
    const _0x28b0b1 = getNextModelProviderProfileId(_0x2b73e4);
    const _0x26b71c = getModelProviderProfileShortLabel(_0x294155);
    const _0x1193ec = getModelProviderProfileShortLabel(_0x28b0b1);
    const _0x3677dc = getProfileReadiness(_0x2b73e4?.model, _0x28b0b1);
    const _0x349a4d = readinessToAvailability(_0x3677dc) === false;
    _0xe0c874.classList.remove("is-hidden");
    _0xe0c874.textContent = _0x26b71c;
    _0xe0c874.dataset.providerProfileId = getModelProviderProfileStyleId(_0x294155);
    _0xe0c874.dataset.providerProfileValue = _0x294155;
    _0xe0c874.title = _0x349a4d ? getProfileSwitchConfigurationMessage(_0x28b0b1, _0x2b73e4?.model) : "当前" + _0x26b71c + "线路，点击切换到" + _0x1193ec;
    _0xe0c874.setAttribute("aria-label", _0xe0c874.title);
  };
  const _0x5101f7 = () => {
    globalThis.window?.removeEventListener?.(API_CONFIG_CHANGED_EVENT, _0x5c1653);
    _0x4d6f69?.classList?.remove("has-model-provider-profile-toggle");
    _0xff0e25?.remove?.();
    _0xff0e25 = null;
  };
  _0x5c1653();
  globalThis.window?.addEventListener?.(API_CONFIG_CHANGED_EVENT, _0x5c1653);
  return {
    sync: _0x5c1653,
    remove: _0x5101f7
  };
}