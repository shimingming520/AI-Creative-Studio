export const RUNNINGHUB_DOMESTIC_PROFILE_ID = "runninghub";
export const RUNNINGHUB_INTERNATIONAL_PROFILE_ID = "runninghub-international";
export const RUNNINGHUB_SITE_PROFILE_IDS = Object.freeze([RUNNINGHUB_DOMESTIC_PROFILE_ID, RUNNINGHUB_INTERNATIONAL_PROFILE_ID]);
export const RUNNINGHUB_MODEL_API_PROFILE_IDS = RUNNINGHUB_SITE_PROFILE_IDS;
export const RUNNINGHUB_WORKFLOW_SETTINGS_KEY = "runningHubWorkflow";
export const RUNNINGHUB_WORKFLOW_DEFAULT_PROFILE_FIELD = "defaultProviderProfileId";
const RUNNINGHUB_INTERNATIONAL_ONLY_PROFILE_IDS = Object.freeze([RUNNINGHUB_INTERNATIONAL_PROFILE_ID]);
export const RUNNINGHUB_INTERNATIONAL_ONLY_MODEL_IDS = Object.freeze(["runninghub-model/rhart-image-v1", "runninghub-model/rhart-image-v1-official", "runninghub-model/rhart-image-n-pro", "runninghub-model/rhart-image-n-pro-official", "runninghub-model/veo3", "runninghub-model/youchuan-v6", "runninghub-model/youchuan-v7", "runninghub-model/youchuan-v81", "runninghub-model/rhart-image-n-g31-flash", "runninghub-model/rhart-image-n-g31-flash-official", "runninghub-model/rhart-image-g", "runninghub-model/rhart-text-g-3-pro-preview-cv/image-to-text", "runninghub-model/rhart-text-g-3-flash-preview-cv/image-to-text", "runninghub-model/rhart-image-g-2", "runninghub-model/rhart-image-g-2-official", "runninghub/suno-single-v5.5", "runninghub/suno-custom-v5.5", "runninghub/suno-single-v5", "runninghub/suno-custom-v5"]);
const RUNNINGHUB_INTERNATIONAL_ONLY_MODEL_ID_SET = new Set(RUNNINGHUB_INTERNATIONAL_ONLY_MODEL_IDS);
export const RUNNINGHUB_MODEL_API_PROFILES = Object.freeze({
  [RUNNINGHUB_DOMESTIC_PROFILE_ID]: Object.freeze({
    id: RUNNINGHUB_DOMESTIC_PROFILE_ID,
    label: "RunningHUB（国内）",
    shortLabel: "国内",
    switchLabel: "RunningHUB 国内版",
    credentialLabel: "模型 API Key",
    apiUrl: "https://www.runninghub.cn"
  }),
  [RUNNINGHUB_INTERNATIONAL_PROFILE_ID]: Object.freeze({
    id: RUNNINGHUB_INTERNATIONAL_PROFILE_ID,
    label: "RunningHUB（国际）",
    shortLabel: "国际",
    switchLabel: "RunningHUB 国际版",
    credentialLabel: "模型 API Key",
    apiUrl: "https://www.runninghub.ai"
  })
});
export function normalizeRunningHubModelApiProfileId(_0x110745) {
  const _0x32f43e = String(_0x110745 || "").trim().toLowerCase();
  if (_0x32f43e === RUNNINGHUB_INTERNATIONAL_PROFILE_ID) {
    return RUNNINGHUB_INTERNATIONAL_PROFILE_ID;
  } else {
    return RUNNINGHUB_DOMESTIC_PROFILE_ID;
  }
}
export function getRunningHubProviderProfileId(_0x40bb54 = {}) {
  const _0x55cdb3 = String(_0x40bb54?.providerProfileId || "").trim();
  return _0x55cdb3 || String(_0x40bb54?.rhProviderProfileId || "").trim() || String(_0x40bb54?.taskProviderProfileId || "").trim();
}
export function getRunningHubTaskProviderProfileId(_0x5ca758 = {}) {
  return String(_0x5ca758?.taskProviderProfileId || "").trim() || getRunningHubProviderProfileId(_0x5ca758);
}
export function resolveRunningHubSiteProfileIdFromUrl(_0x261752) {
  const _0x109c87 = String(_0x261752 || "").match(/https?:\/\/[^\s'"`\\]+/i);
  if (!_0x109c87) {
    return "";
  }
  try {
    const _0xfee3b8 = new URL(_0x109c87[0]).hostname.toLowerCase();
    if (/(^|\.)runninghub\.ai$/.test(_0xfee3b8)) {
      return RUNNINGHUB_INTERNATIONAL_PROFILE_ID;
    }
    if (/(^|\.)runninghub\.cn$/.test(_0xfee3b8)) {
      return RUNNINGHUB_DOMESTIC_PROFILE_ID;
    }
  } catch {
    return "";
  }
  return "";
}
export function getRunningHubWorkflowDefaultProfileId(_0x1b857b = {}) {
  return normalizeRunningHubModelApiProfileId(_0x1b857b?.[RUNNINGHUB_WORKFLOW_SETTINGS_KEY]?.[RUNNINGHUB_WORKFLOW_DEFAULT_PROFILE_FIELD]);
}
export function applyRunningHubWorkflowDefaultProfileId(_0x58e9eb = {}, _0x120eb3 = RUNNINGHUB_DOMESTIC_PROFILE_ID) {
  return {
    ...(_0x58e9eb || {}),
    [RUNNINGHUB_WORKFLOW_SETTINGS_KEY]: {
      ...(_0x58e9eb?.[RUNNINGHUB_WORKFLOW_SETTINGS_KEY] || {}),
      [RUNNINGHUB_WORKFLOW_DEFAULT_PROFILE_FIELD]: normalizeRunningHubModelApiProfileId(_0x120eb3)
    }
  };
}
export function isRunningHubInternationalOnlyModel(_0x3fd847) {
  return RUNNINGHUB_INTERNATIONAL_ONLY_MODEL_ID_SET.has(String(_0x3fd847 || "").trim());
}
export function getRunningHubModelApiProfileIds(_0x389fef) {
  if (isRunningHubInternationalOnlyModel(_0x389fef)) {
    return RUNNINGHUB_INTERNATIONAL_ONLY_PROFILE_IDS;
  } else {
    return RUNNINGHUB_MODEL_API_PROFILE_IDS;
  }
}
export function resolveRunningHubModelApiProfileId(_0x560240, _0x2ce6be) {
  if (isRunningHubInternationalOnlyModel(_0x560240)) {
    return RUNNINGHUB_INTERNATIONAL_PROFILE_ID;
  } else {
    return normalizeRunningHubModelApiProfileId(_0x2ce6be);
  }
}
export function getRunningHubModelApiProfile(_0x3e9d2d) {
  return RUNNINGHUB_MODEL_API_PROFILES[normalizeRunningHubModelApiProfileId(_0x3e9d2d)];
}
export function resolveRunningHubModelApiBaseUrl(_0x297d08, _0x346ab1 = "") {
  const _0x4f1091 = getRunningHubModelApiProfile(_0x297d08);
  return String(_0x346ab1 || _0x4f1091.apiUrl).trim().replace(/\/+$/, "");
}
export function buildRunningHubModelApiUrl(_0x2a586f, _0x2a126f, _0x5d6a6c = "") {
  const _0x236aa8 = resolveRunningHubModelApiBaseUrl(_0x2a586f, _0x5d6a6c);
  const _0x4867bc = String(_0x2a126f || "").trim();
  if (!_0x4867bc) {
    return _0x236aa8;
  }
  return _0x236aa8 + "/" + _0x4867bc.replace(/^\/+/, "");
}
export function remapRunningHubModelApiUrl(_0x14ff62, _0x214eff, _0x3c743d = "") {
  const _0x338f62 = String(_0x14ff62 || "").trim();
  if (!_0x338f62) {
    return "";
  }
  const _0x169abc = resolveRunningHubModelApiBaseUrl(_0x214eff, _0x3c743d);
  try {
    const _0x2d9260 = new URL(_0x338f62, _0x169abc + "/");
    const _0x4b1c86 = new URL(_0x169abc).hostname;
    if (/(^|\.)runninghub\.(?:cn|ai)$/i.test(_0x2d9260.hostname)) {
      const _0x2cef36 = _0x2d9260.hostname.replace(/runninghub\.(?:cn|ai)$/i, "");
      const _0x2e6880 = _0x4b1c86.endsWith(".ai") ? "runninghub.ai" : "runninghub.cn";
      _0x2d9260.hostname = "" + _0x2cef36 + _0x2e6880;
    }
    return _0x2d9260.toString().replace(/\/$/, "");
  } catch {
    return buildRunningHubModelApiUrl(_0x214eff, _0x338f62, _0x3c743d);
  }
}