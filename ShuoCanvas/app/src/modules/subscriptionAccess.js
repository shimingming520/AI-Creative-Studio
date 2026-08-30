import { fetchUserSettingsFromServer, saveUserSettingsToServer } from "../../api/userSettingsApi.js";
import { fetchSubscriptionStatus, activateCdkey, clearSubscriptionAuthorization as a1425_0x184b0d } from "../../api/subscriptionApi.js";
import { t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
const subscriptionGateManifest = {
  schemaVersion: "1.0",
  gates: [{
    key: "runninghubVideoV54",
    modelId: "runninghub/2041741496667348994",
    workflowId: "2041741496667348994",
    displayName: "视频编辑V5.4",
    aliases: ["video_edit_v54", "video_edit.pro"],
    legacyAliases: [{
      value: "2041741496667348994",
      deleteWhen: "Remove after subscriptionAccess tests, backend subscription gate tests, entitlement payloads, and saved projects all stop accepting bare RunningHub workflow IDs for this gate."
    }]
  }, {
    key: "runninghubVideoBerniniV1",
    modelId: "runninghub/2062515720147259393",
    workflowId: "2062515720147259393",
    displayName: "新全能视频替换BERNINI V1",
    aliases: ["video_edit_v54", "video_edit.pro", "ai-app/2062515720147259393"]
  }, {
    key: "runninghubVideoScail2V1",
    modelId: "runninghub/2064961300823896065",
    workflowId: "2064961300823896065",
    displayName: "视频编辑Scail V1",
    aliases: ["video_edit_v54", "video_edit.pro", "ai-app/2064961300823896065"]
  }, {
    key: "runninghubVideoScailV2",
    modelId: "runninghub/2065463417577762818",
    workflowId: "2065463417577762818",
    additionalWorkflowIds: ["2086838666336784386"],
    displayName: "视频编辑Scail V2",
    aliases: ["video_edit_v54", "video_edit.pro", "ai-app/2065463417577762818", "ai-app/2086838666336784386"]
  }, {
    key: "runninghubVideoHd",
    modelId: "runninghub/2047787809091620866",
    workflowId: "2047787809091620866",
    displayName: "视频高清",
    aliases: ["video_hd_vip", "video_hd.pro", "ai-app/2047787809091620866"],
    legacyAliases: [{
      value: "2047787809091620866",
      deleteWhen: "Remove after subscriptionAccess tests, backend subscription gate tests, entitlement payloads, and saved projects all stop accepting bare RunningHub workflow IDs for this gate."
    }]
  }, {
    key: "runninghubCommercialDigitalHuman",
    modelId: "runninghub/2055639633148563458",
    workflowId: "2055639633148563458",
    displayName: "商业级数字人",
    aliases: ["commercial_digital_human", "commercial_digital_human.pro", "ai-app/2055639633148563458"]
  }, {
    key: "runninghubPersonFullAngleV4",
    modelId: "runninghub/1989779993284800514",
    workflowId: "1989779993284800514",
    displayName: "人物全角度V4",
    aliases: ["person_full_angle_v4", "person_full_angle.pro", "ai-app/1989779993284800514"]
  }, {
    key: "runninghubAdvancedVoiceClone",
    modelId: "runninghub/2050165249344585729",
    workflowId: "2050165249344585729",
    displayName: "进阶声音克隆",
    aliases: ["advanced_voice_clone", "voice_clone.pro", "ai-app/2050165249344585729"],
    legacyAliases: [{
      value: "2050165249344585729",
      deleteWhen: "Remove after subscriptionAccess tests, backend subscription gate tests, entitlement payloads, and saved projects all stop accepting bare RunningHub workflow IDs for this gate."
    }]
  }, {
    key: "dreaminaVideoVip",
    modelId: "dreamina/video_vip",
    workflowId: "",
    displayName: "即梦视频",
    aliases: ["dreamina_video_vip", "dreamina.video_vip"],
    providers: ["dreamina"],
    modelPrefixes: ["dreamina/"]
  }, {
    key: "audioVoiceStudio",
    modelId: "feature/audio_voice_studio",
    workflowId: "",
    displayName: "语音工作室",
    aliases: ["audio_voice_studio", "voice_studio.pro"],
    providers: ["aicanvas"],
    allowAnyActiveSubscription: true
  }, {
    key: "replacementStudio",
    modelId: "feature/replacement_studio",
    workflowId: "",
    displayName: "替换工作室",
    aliases: ["replacement_studio", "replacement_studio.pro"],
    providers: ["aicanvas"],
    allowAnyActiveSubscription: true
  }, {
    key: "runninghubAiApp",
    modelId: "feature/rh_ai_app",
    workflowId: "",
    displayName: "RH AI应用",
    aliases: ["rh_ai_app", "runninghub_ai_app.pro"],
    modelPrefixes: ["runninghub/ai-app-"],
    allowAnyActiveSubscription: true
  }, {
    key: "binghuoVideo",
    modelId: "feature/binghuo_video",
    workflowId: "",
    displayName: "便宜渠道视频",
    aliases: ["binghuo_video", "binghuo_video.pro"],
    providers: ["binghuo"],
    modelPrefixes: ["binghuo/"],
    allowAnyActiveSubscription: true
  }, {
    key: "customProvider",
    modelId: "feature/custom_provider",
    workflowId: "",
    displayName: "自定义中转站",
    aliases: ["custom_provider", "custom_provider.pro"],
    allowAnyActiveSubscription: true
  }]
};
function freezeSubscriptionGateLegacyAlias(_0x503ace, _0x139c72) {
  const _0x42e8fd = _0x503ace && typeof _0x503ace === "object" ? _0x503ace : {};
  const _0x4e426f = String(_0x42e8fd.value || "").trim();
  const _0x2ba59f = String(_0x42e8fd.deleteWhen || "").trim();
  if (!_0x4e426f || !_0x2ba59f) {
    throw new Error("Invalid subscription gate legacy alias: " + (_0x139c72 || "unknown"));
  }
  return Object.freeze({
    value: _0x4e426f,
    deleteWhen: _0x2ba59f
  });
}
function freezeSubscriptionGateEntry(_0x3423bc) {
  const _0x5739f8 = _0x3423bc && typeof _0x3423bc === "object" ? _0x3423bc : {};
  const _0xb78de9 = String(_0x5739f8.key || "").trim();
  return Object.freeze({
    key: _0xb78de9,
    modelId: String(_0x5739f8.modelId || "").trim(),
    workflowId: String(_0x5739f8.workflowId || "").trim(),
    additionalWorkflowIds: Object.freeze(Array.isArray(_0x5739f8.additionalWorkflowIds) ? _0x5739f8.additionalWorkflowIds.map(_0x3150bc => String(_0x3150bc || "").trim()).filter(Boolean) : []),
    displayName: String(_0x5739f8.displayName || "").trim(),
    aliases: Object.freeze(Array.isArray(_0x5739f8.aliases) ? _0x5739f8.aliases.map(_0x99523d => String(_0x99523d || "").trim()).filter(Boolean) : []),
    legacyAliases: Object.freeze(Array.isArray(_0x5739f8.legacyAliases) ? _0x5739f8.legacyAliases.map(_0x6bc7e7 => freezeSubscriptionGateLegacyAlias(_0x6bc7e7, _0xb78de9)) : []),
    providers: Object.freeze(Array.isArray(_0x5739f8.providers) ? _0x5739f8.providers.map(_0x35d09f => String(_0x35d09f || "").trim().toLowerCase()).filter(Boolean) : []),
    modelPrefixes: Object.freeze(Array.isArray(_0x5739f8.modelPrefixes) ? _0x5739f8.modelPrefixes.map(_0x5aaad9 => String(_0x5aaad9 || "").trim()).filter(Boolean) : []),
    allowAnyActiveSubscription: _0x5739f8.allowAnyActiveSubscription === true
  });
}
function requireSubscriptionGateEntries() {
  const _0x2c432b = String(subscriptionGateManifest?.schemaVersion || "").trim();
  const _0x3f9fb5 = subscriptionGateManifest?.gates;
  if (_0x2c432b !== "1.0" || !Array.isArray(_0x3f9fb5)) {
    throw new Error("Invalid subscription gate manifest");
  }
  const _0x42ecb2 = _0x3f9fb5.map(_0x15751e => freezeSubscriptionGateEntry(_0x15751e));
  if (_0x42ecb2.some(_0x404e35 => !_0x404e35.modelId)) {
    throw new Error("Invalid subscription gate manifest entry: missing modelId");
  }
  return Object.freeze(_0x42ecb2);
}
export const SUBSCRIPTION_GATE_MANIFESTS = requireSubscriptionGateEntries();
const SUBSCRIPTION_GATE_CANONICAL_EXCLUDES = new Set(Array.isArray(subscriptionGateManifest?.canonicalExcludes) ? subscriptionGateManifest.canonicalExcludes.map(_0x4834aa => String(_0x4834aa || "").trim()).filter(Boolean) : []);
const SUBSCRIPTION_GATE_BY_KEY = Object.freeze(Object.fromEntries(SUBSCRIPTION_GATE_MANIFESTS.filter(_0x1d015a => _0x1d015a.key).map(_0x5d93a6 => [_0x5d93a6.key, _0x5d93a6])));
function requireSubscriptionGateModelId(_0x14e7ca) {
  const _0x4e7e01 = SUBSCRIPTION_GATE_BY_KEY[_0x14e7ca];
  if (!_0x4e7e01?.modelId) {
    throw new Error("Missing subscription gate manifest entry: " + _0x14e7ca);
  }
  return _0x4e7e01.modelId;
}
function getSubscriptionGateAlias(_0x45b8b3, _0x3ae2ed) {
  const _0xe3d0a3 = String(_0x3ae2ed || "").trim();
  if (!_0xe3d0a3) {
    return "";
  }
  return getSubscriptionGateAliasValues(_0x45b8b3).find(_0x45180c => _0x45180c.startsWith(_0xe3d0a3)) || "";
}
function getSubscriptionGateAliasValues(_0x53122b) {
  return [...(Array.isArray(_0x53122b?.aliases) ? _0x53122b.aliases : []), ...(Array.isArray(_0x53122b?.legacyAliases) ? _0x53122b.legacyAliases.map(_0x245eab => _0x245eab.value) : [])].map(_0x10af0c => String(_0x10af0c || "").trim()).filter(Boolean);
}
export const DEFAULT_VIP_GATE_MODEL_ID = requireSubscriptionGateModelId("runninghubVideoV54");
export const V54_VIP_MODEL_ID = DEFAULT_VIP_GATE_MODEL_ID;
export const RH_VIDEO_HD_VIP_MODEL_ID = requireSubscriptionGateModelId("runninghubVideoHd");
export const RH_VIDEO_HD_VIP_AI_APP_MODEL_ID = getSubscriptionGateAlias(SUBSCRIPTION_GATE_BY_KEY.runninghubVideoHd, "ai-app/");
export const RH_ADVANCED_VOICE_CLONE_VIP_MODEL_ID = requireSubscriptionGateModelId("runninghubAdvancedVoiceClone");
export const RH_ADVANCED_VOICE_CLONE_VIP_AI_APP_MODEL_ID = getSubscriptionGateAlias(SUBSCRIPTION_GATE_BY_KEY.runninghubAdvancedVoiceClone, "ai-app/");
export const DREAMINA_VIDEO_VIP_MODEL_ID = requireSubscriptionGateModelId("dreaminaVideoVip");
export const AUDIO_VOICE_STUDIO_VIP_MODEL_ID = requireSubscriptionGateModelId("audioVoiceStudio");
export const REPLACEMENT_STUDIO_VIP_MODEL_ID = requireSubscriptionGateModelId("replacementStudio");
export const RH_AI_APP_VIP_MODEL_ID = requireSubscriptionGateModelId("runninghubAiApp");
export const CUSTOM_PROVIDER_VIP_MODEL_ID = requireSubscriptionGateModelId("customProvider");
export const VIDEO_VIP_MODEL_IDS = Array.from(new Set(SUBSCRIPTION_GATE_MANIFESTS.map(_0x695d9a => _0x695d9a.modelId)));
const VIDEO_VIP_MODEL_ID_SET = new Set(VIDEO_VIP_MODEL_IDS);
const SUBSCRIPTION_GATE_BY_MODEL_ID = Object.freeze(Object.fromEntries(SUBSCRIPTION_GATE_MANIFESTS.map(_0x44d061 => [_0x44d061.modelId, _0x44d061])));
const VIP_MODEL_ID_CANONICAL_ALIASES = Object.freeze(Object.fromEntries(SUBSCRIPTION_GATE_MANIFESTS.flatMap(_0x25b7fd => [[_0x25b7fd.modelId, _0x25b7fd.modelId], ...getSubscriptionGateAliasValues(_0x25b7fd).map(_0x4b0645 => [_0x4b0645, _0x25b7fd.modelId]), ...(_0x25b7fd.workflowId ? [["runninghub/" + _0x25b7fd.workflowId, _0x25b7fd.modelId]] : []), ..._0x25b7fd.additionalWorkflowIds.map(_0x253154 => ["runninghub/" + _0x253154, _0x25b7fd.modelId])]).filter(([_0x19339e, _0x1854d3]) => _0x19339e && _0x1854d3)));
const VIP_MODEL_PROVIDER_RULES = SUBSCRIPTION_GATE_MANIFESTS.flatMap(_0x265b4f => _0x265b4f.providers.map(_0xcb60fc => [_0xcb60fc, _0x265b4f.modelId]));
const VIP_MODEL_PREFIX_RULES = SUBSCRIPTION_GATE_MANIFESTS.flatMap(_0xd60958 => _0xd60958.modelPrefixes.map(_0x116324 => [_0x116324, _0xd60958.modelId]));
const VIP_MODEL_ID_CANONICAL_EXCLUDES = SUBSCRIPTION_GATE_CANONICAL_EXCLUDES;
const VIP_MODEL_DISPLAY_NAMES = Object.freeze(Object.fromEntries(SUBSCRIPTION_GATE_MANIFESTS.map(_0x3f7398 => [_0x3f7398.modelId, _0x3f7398.displayName || _0x3f7398.modelId])));
const VIP_MODEL_KEY_ALIAS_MAP = Object.freeze(Object.fromEntries(SUBSCRIPTION_GATE_MANIFESTS.map(_0x40f86e => [_0x40f86e.modelId, Object.freeze([_0x40f86e.modelId, ...getSubscriptionGateAliasValues(_0x40f86e)])])));
const normalizeVipModelId = _0x580182 => {
  const _0x1cbece = String(_0x580182 || "").trim();
  if (!_0x1cbece) {
    return "";
  }
  if (VIP_MODEL_ID_CANONICAL_EXCLUDES.has(_0x1cbece)) {
    return _0x1cbece;
  }
  const _0x3c20c2 = VIP_MODEL_ID_CANONICAL_ALIASES[_0x1cbece];
  if (_0x3c20c2) {
    return _0x3c20c2;
  }
  const _0x35ee20 = VIP_MODEL_PREFIX_RULES.find(([_0x308676]) => _0x1cbece.startsWith(_0x308676));
  if (_0x35ee20) {
    return _0x35ee20[1];
  }
  return _0x1cbece;
};
const INSTALL_ID_KEY = "aic-install-id";
const DEVICE_ID_KEY = "aic-device-id";
const V54_LOCAL_UNLOCK_KEY = "aic-v54-vip-unlocked";
const SUBSCRIPTION_CONTACT_IMAGE_URL_FALLBACK = "https://api.ashuoai.com/static/contact/wechat.png";
const SUBSCRIPTION_CONTACT_WECHAT_FALLBACK = "yumengashuo";
let _fetchSubscriptionStatusImpl = fetchSubscriptionStatus;
let _activateCdkeyImpl = activateCdkey;
let _clearSubscriptionAuthorizationImpl = a1425_0x184b0d;
function getSubscriptionContactTextFallback(_0x7b4ad6 = "") {
  return t("settings.subscription.contact", {}, _0x7b4ad6 ? {
    locale: _0x7b4ad6
  } : {});
}
function isDefaultSubscriptionContactText(_0x507dd8) {
  const _0x2b34c3 = String(_0x507dd8 || "").trim();
  if (!_0x2b34c3) {
    return true;
  }
  return _0x2b34c3 === getSubscriptionContactTextFallback("zh-CN") || _0x2b34c3 === getSubscriptionContactTextFallback("en-US");
}
function normalizeSubscriptionContactText(_0xbd66) {
  const _0x2e205b = String(_0xbd66 || "").trim();
  if (isDefaultSubscriptionContactText(_0x2e205b)) {
    return "";
  } else {
    return _0x2e205b;
  }
}
export function createDefaultSubscriptionState() {
  return {
    loading: false,
    status: "active",
    expiresAt: null,
    entitledModelKeys: [],
    entitledModelIds: [],
    planCodes: [],
    planNames: [],
    licensedProductCodes: [],
    authorizationTier: "unlimited",
    error: null,
    lastSyncAt: 0,
    contactText: "",
    contactUrl: SUBSCRIPTION_CONTACT_IMAGE_URL_FALLBACK,
    contactWechat: SUBSCRIPTION_CONTACT_WECHAT_FALLBACK,
    deviceId: ""
  };
}
function _normalizeStatus(_0x643ff3) {
  const _0x486b6a = String(_0x643ff3 || "").trim().toLowerCase();
  if (_0x486b6a === "active") {
    return "active";
  }
  if (_0x486b6a === "expired") {
    return "expired";
  }
  return "none";
}
export function isActivationRequestAccepted(_0x33f1a9) {
  return true;
}
export function isActivationConfirmed(_0x32ebb3, _0x2ddc2a) {
  return true;
}
function _toExpirySeconds(_0x411bd6) {
  if (_0x411bd6 == null || _0x411bd6 === "") {
    return null;
  }
  const _0x1a277c = Number(_0x411bd6);
  if (Number.isFinite(_0x1a277c) && _0x1a277c > 0) {
    if (_0x1a277c > 100000000000) {
      return Math.floor(_0x1a277c / 1000);
    } else {
      return Math.floor(_0x1a277c);
    }
  }
  const _0x32e23f = Date.parse(String(_0x411bd6));
  if (!Number.isFinite(_0x32e23f) || _0x32e23f <= 0) {
    return null;
  }
  return Math.floor(_0x32e23f / 1000);
}
export function extractSubscriptionExpiresAt(_0x24ec0d) {
  const _0x538977 = _0x24ec0d && typeof _0x24ec0d === "object" ? _0x24ec0d : {};
  const _0x4b2c2b = _0x538977.data && typeof _0x538977.data === "object" ? _0x538977.data : _0x538977;
  const _0x43445c = _0x4b2c2b?.expiresAt ?? _0x4b2c2b?.expires_at ?? _0x4b2c2b?.expireAt ?? _0x4b2c2b?.expire_at ?? _0x4b2c2b?.expiryAt ?? _0x4b2c2b?.expiry_at ?? _0x4b2c2b?.expiry ?? _0x4b2c2b?.expiredAt ?? _0x4b2c2b?.expired_at ?? _0x4b2c2b?.endAt ?? _0x4b2c2b?.end_at ?? _0x4b2c2b?.validUntil ?? _0x4b2c2b?.valid_until ?? _0x4b2c2b?.deadlineAt ?? _0x4b2c2b?.deadline_at ?? _0x4b2c2b?.deadline ?? null;
  return _toExpirySeconds(_0x43445c);
}
export function resolveSubscriptionAuthorizationTier(_0x110d44) {
  if (_normalizeStatus(_0x110d44?.status) !== "active") {
    return "none";
  }
  const _0x164724 = Array.isArray(_0x110d44?.licensedProductCodes) ? _0x110d44.licensedProductCodes.map(_0x49b151 => String(_0x49b151 || "").trim().toLowerCase()).filter(Boolean) : [];
  if (_0x164724.length === 0) {
    return "vip";
  }
  if (!_0x164724.includes("aicanvas")) {
    return "none";
  }
  if (_0x164724.includes("comfyui")) {
    return "annual-vip";
  } else {
    return "vip";
  }
}
export function isSubscriptionActive(_0xdf826d) {
  // 订阅功能已移除：所有模型均视为可用，不再依赖远程授权状态。
  return true;
}
export function resolveVipGateModelId(_0x5772ef, _0xf890d9 = "") {
  const _0x52b55d = normalizeVipModelId(_0x5772ef);
  if (VIP_MODEL_ID_CANONICAL_EXCLUDES.has(_0x52b55d)) {
    return _0x52b55d;
  }
  if (VIDEO_VIP_MODEL_ID_SET.has(_0x52b55d)) {
    return _0x52b55d;
  }
  const _0x227fa5 = String(_0xf890d9 || "").trim().toLowerCase();
  const _0x242c0e = _0x227fa5 ? VIP_MODEL_PROVIDER_RULES.find(([_0x35e6ee]) => _0x35e6ee === _0x227fa5) : null;
  if (_0x242c0e) {
    return _0x242c0e[1];
  }
  return _0x52b55d;
}
export function getVipModelDisplayName(_0x2c200b, _0x3ead7f = "") {
  const _0x218db8 = resolveVipGateModelId(_0x2c200b, _0x3ead7f);
  return VIP_MODEL_DISPLAY_NAMES[_0x218db8] || _0x218db8 || "model";
}
export function isVipModel(_0x430dc5, _0x107e31 = "") {
  // 保留兼容导出，但不再把模型标记为需要授权。
  return false;
}
function getVipModelKeyAliases(_0x3e9e96) {
  const _0x2fbda8 = normalizeVipModelId(_0x3e9e96);
  return Array.from(new Set(VIP_MODEL_KEY_ALIAS_MAP[_0x2fbda8] || []));
}
export function setLocalVipUnlocked(_0x1d3d1e) {
  try {
    if (_0x1d3d1e) {
      globalThis.localStorage?.setItem(V54_LOCAL_UNLOCK_KEY, "1");
    } else {
      globalThis.localStorage?.removeItem(V54_LOCAL_UNLOCK_KEY);
    }
  } catch {}
}
export function isModelAllowed(_0x2d59dc, _0x17f373, _0x2ece55 = "") {
  // 统一放行模型选择与任务提交，避免任何授权弹窗或 VIP 拦截。
  return true;
}
function _generateInstallId() {
  const _0x9b194e = Date.now() + "-" + Math.random();
  let _0x323d12 = 0;
  for (let _0x54274f = 0; _0x54274f < _0x9b194e.length; _0x54274f += 1) {
    _0x323d12 = _0x323d12 * 31 + _0x9b194e.charCodeAt(_0x54274f) >>> 0;
  }
  return "aic-" + Date.now().toString(36) + "-" + _0x323d12.toString(36);
}
function _generateDeviceId() {
  return "aicdev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}
function _publishInstallId(_0x492fc7) {
  const _0x42a131 = String(_0x492fc7 || "").trim();
  if (!_0x42a131) {
    return "";
  }
  try {
    window.__aicInstallId = _0x42a131;
  } catch {}
  try {
    globalThis.__aicInstallId = _0x42a131;
  } catch {}
  return _0x42a131;
}
function _publishDeviceId(_0x389bc1) {
  const _0x1b9735 = String(_0x389bc1 || "").trim();
  if (!_0x1b9735) {
    return "";
  }
  try {
    window.__aicDeviceId = _0x1b9735;
  } catch {}
  try {
    globalThis.__aicDeviceId = _0x1b9735;
  } catch {}
  try {
    localStorage.setItem(DEVICE_ID_KEY, _0x1b9735);
  } catch {}
  return _0x1b9735;
}
function _clearPublishedSubscriptionIdentity() {
  try {
    delete window.__aicInstallId;
  } catch {}
  try {
    delete window.__aicDeviceId;
  } catch {}
  try {
    delete globalThis.__aicInstallId;
  } catch {}
  try {
    delete globalThis.__aicDeviceId;
  } catch {}
}
function _clearLocalSubscriptionIdentity() {
  try {
    localStorage.removeItem(INSTALL_ID_KEY);
  } catch {}
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
  } catch {}
  setLocalVipUnlocked(false);
  _clearPublishedSubscriptionIdentity();
}
function readLocalInstallId() {
  try {
    return String(localStorage.getItem(INSTALL_ID_KEY) || "").trim();
  } catch {
    return "";
  }
}
async function readServerSettingsForSubscriptionIdentity() {
  try {
    return (await fetchUserSettingsFromServer()) || {};
  } catch {
    return {};
  }
}
export async function ensureDeviceId(_0x522962 = "") {
  const _0x17cb2e = String(_0x522962 || globalThis.window?.__aicInstallId || globalThis.__aicInstallId || "").trim();
  try {
    const _0x230b25 = await desktopBridge.app.getDeviceId({
      installId: _0x17cb2e
    });
    const _0x744117 = String(_0x230b25 || "").trim();
    if (_0x744117) {
      return _publishDeviceId(_0x744117);
    }
  } catch {}
  try {
    const _0x331c92 = String(localStorage.getItem(DEVICE_ID_KEY) || "").trim();
    if (_0x331c92) {
      return _publishDeviceId(_0x331c92);
    }
  } catch {}
  const _0x1376cf = _0x17cb2e || _generateDeviceId();
  return _publishDeviceId(_0x1376cf);
}
export async function ensureInstallId() {
  const _0xe494b3 = desktopBridge.isChromeShell;
  if (!_0xe494b3) {
    const _0x107212 = readLocalInstallId();
    if (_0x107212) {
      _publishInstallId(_0x107212);
      await ensureDeviceId(_0x107212);
      return _0x107212;
    }
  }
  const _0x2ef377 = await readServerSettingsForSubscriptionIdentity();
  const _0x4270de = String(_0x2ef377.installId || "").trim();
  if (_0x4270de) {
    try {
      localStorage.setItem(INSTALL_ID_KEY, _0x4270de);
    } catch {}
    _publishInstallId(_0x4270de);
    await ensureDeviceId(_0x4270de);
    return _0x4270de;
  }
  const _0x41dc9e = readLocalInstallId();
  if (_0x41dc9e) {
    try {
      await saveUserSettingsToServer({
        ..._0x2ef377,
        installId: _0x41dc9e
      });
    } catch {}
    _publishInstallId(_0x41dc9e);
    await ensureDeviceId(_0x41dc9e);
    return _0x41dc9e;
  }
  const _0x3571a9 = _generateInstallId();
  try {
    localStorage.setItem(INSTALL_ID_KEY, _0x3571a9);
  } catch {}
  try {
    await saveUserSettingsToServer({
      ..._0x2ef377,
      installId: _0x3571a9
    });
  } catch {}
  _publishInstallId(_0x3571a9);
  await ensureDeviceId(_0x3571a9);
  return _0x3571a9;
}
export function normalizeSubscriptionPayload(_0x304281) {
  const _0x49380c = createDefaultSubscriptionState();
  const _0x269b8a = _0x304281 && typeof _0x304281 === "object" ? _0x304281 : {};
  const _0xbbd39c = _0x269b8a.data && typeof _0x269b8a.data === "object" ? _0x269b8a.data : _0x269b8a;
  const _0x8a2c94 = String(_0xbbd39c?.status || _0xbbd39c?.subscriptionStatus || _0xbbd39c?.state || "").trim().toLowerCase();
  let _0x1b2b89 = _normalizeStatus(_0x8a2c94);
  const _0x164860 = extractSubscriptionExpiresAt(_0xbbd39c);
  const _0x49af11 = Array.isArray(_0xbbd39c?.entitledModelIds) ? _0xbbd39c.entitledModelIds : Array.isArray(_0xbbd39c?.entitled_model_ids) ? _0xbbd39c.entitled_model_ids : Array.isArray(_0xbbd39c?.modelIds) ? _0xbbd39c.modelIds : [];
  const _0x19e056 = _0x49af11.map(_0xde41a5 => normalizeVipModelId(_0xde41a5)).filter(Boolean);
  const _0x3c9ff1 = Array.isArray(_0xbbd39c?.entitledModelKeys) ? _0xbbd39c.entitledModelKeys : Array.isArray(_0xbbd39c?.entitled_model_keys) ? _0xbbd39c.entitled_model_keys : Array.isArray(_0xbbd39c?.modelKeys) ? _0xbbd39c.modelKeys : [];
  const _0x935745 = _0x3c9ff1.map(_0xf48fec => String(_0xf48fec || "").trim()).filter(Boolean);
  const _0x564288 = _0xbbd39c?.contactText ?? _0xbbd39c?.contact_text ?? _0x49380c.contactText;
  const _0x535a5a = _0xbbd39c?.contactUrl ?? _0xbbd39c?.contact_url ?? _0x49380c.contactUrl;
  const _0xbce4d3 = _0xbbd39c?.contactWechat ?? _0xbbd39c?.contact_wechat ?? _0xbbd39c?.wechatId ?? _0xbbd39c?.wechat_id ?? _0xbbd39c?.wechat ?? _0x49380c.contactWechat;
  const _0x2dde52 = _0xbbd39c?.deviceId ?? _0xbbd39c?.device_id ?? _0x49380c.deviceId;
  const _0x29f8c5 = Array.isArray(_0xbbd39c?.planCodes) ? _0xbbd39c.planCodes : Array.isArray(_0xbbd39c?.plan_codes) ? _0xbbd39c.plan_codes : [];
  const _0x5e1f4f = Array.isArray(_0xbbd39c?.planNames) ? _0xbbd39c.planNames : Array.isArray(_0xbbd39c?.plan_names) ? _0xbbd39c.plan_names : [];
  const _0x22e4be = Array.isArray(_0xbbd39c?.licensedProductCodes) || Array.isArray(_0xbbd39c?.licensed_product_codes) || Array.isArray(_0xbbd39c?.eligibleProductCodes) || Array.isArray(_0xbbd39c?.eligible_product_codes);
  const _0x425252 = Array.isArray(_0xbbd39c?.licensedProductCodes) ? _0xbbd39c.licensedProductCodes : Array.isArray(_0xbbd39c?.licensed_product_codes) ? _0xbbd39c.licensed_product_codes : Array.isArray(_0xbbd39c?.eligibleProductCodes) ? _0xbbd39c.eligibleProductCodes : Array.isArray(_0xbbd39c?.eligible_product_codes) ? _0xbbd39c.eligible_product_codes : [];
  const _0x3af107 = Array.from(new Set(_0x425252.map(_0x54fdd9 => String(_0x54fdd9 || "").trim().toLowerCase()).filter(Boolean)));
  if (_0x1b2b89 === "active" && _0x22e4be && !_0x3af107.includes("aicanvas")) {
    _0x1b2b89 = "none";
  }
  const _0x5190a2 = {
    ..._0x49380c,
    status: _0x1b2b89,
    expiresAt: _0x164860,
    entitledModelKeys: _0x935745,
    entitledModelIds: _0x19e056,
    planCodes: _0x29f8c5.map(_0x49a57e => String(_0x49a57e || "").trim()).filter(Boolean),
    planNames: _0x5e1f4f.map(_0x2cf7d1 => String(_0x2cf7d1 || "").trim()).filter(Boolean),
    licensedProductCodes: _0x3af107,
    contactText: normalizeSubscriptionContactText(_0x564288),
    contactUrl: String(_0x535a5a || _0x49380c.contactUrl),
    contactWechat: String(_0xbce4d3 || _0x49380c.contactWechat),
    deviceId: String(_0x2dde52 || "")
  };
  _0x5190a2.authorizationTier = resolveSubscriptionAuthorizationTier(_0x5190a2);
  return _0x5190a2;
}
export async function pullSubscriptionState(_0x12ca08, _0x369052 = "") {
  // 不再请求订阅服务，直接返回无限制状态。
  const _0x5f1d9e = createDefaultSubscriptionState();
  setLocalVipUnlocked(true);
  return _0x5f1d9e;
}
export async function submitCdkey(_0x30ceaf, _0x374a61, _0x11ce4c = "") {
  return {
    success: true,
    status: "active"
  };
}
export async function clearSubscriptionAuthorization() {
  return {
    success: true,
    status: "active"
  };
}
export function __setSubscriptionApiForTest({
  fetchSubscriptionStatusImpl: _0x574487,
  activateCdkeyImpl: _0x3a7642,
  clearSubscriptionAuthorizationImpl: _0x259da4
} = {}) {
  _fetchSubscriptionStatusImpl = typeof _0x574487 === "function" ? _0x574487 : fetchSubscriptionStatus;
  _activateCdkeyImpl = typeof _0x3a7642 === "function" ? _0x3a7642 : activateCdkey;
  _clearSubscriptionAuthorizationImpl = typeof _0x259da4 === "function" ? _0x259da4 : a1425_0x184b0d;
}
