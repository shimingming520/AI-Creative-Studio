import { PROVIDERS_META, getApimartApiUrlForRoute } from "../src/modules/providers.js";
import { post, request } from "./apiBase.js";
import { normalizeApimartBaseUrl } from "./apimartUploadApi.js";
import { buildRunningHubQueueStatusProbeUrl, fetchRunningHubWorkflowQueueStatus as a114_0x575911, normalizeRunningHubQueueStatusPayload } from "./runningHubQueueStatusApi.js";
import { isRunningHubUploadResponseSuccessful } from "./runningHubUploadResponse.js";
const TEST_TIMEOUT_MS = 30000;
const TEST_UPLOAD_TIMEOUT_MS = 60000;
const DEFAULT_PROVIDER_TEST_IDS = Object.freeze(["apimart", "minimax", "minimax-international", "binghuo", "volcengine", "volcengine-speech", "agnes-domestic", "agnes", "grsai", "ppio", "runninghub", "runninghub-international", "comfyui", "openai"]);
const COMPLETION_FALLBACKS = Object.freeze({
  apimart: {
    model: "deepseek-v4-flash",
    basePath: "v1",
    label: "DeepSeek V4 Flash"
  },
  agnes: {
    model: "agnes-2.0-flash",
    basePath: "v1",
    label: "Agnes 2.0 Flash"
  },
  "agnes-domestic": {
    model: "agnes-2.0-flash",
    basePath: "v1",
    label: "Agnes 2.0 Flash"
  },
  openai: {
    model: "gpt-4o-mini",
    basePath: "v1",
    label: "GPT-4o mini"
  },
  ppio: {
    basePath: "openai/v1"
  }
});
const VOLCENGINE_SPEECH_ASR_RESOURCE_ID = "volc.seedasr.auc";
const VOLCENGINE_SPEECH_TTS_RESOURCE_ID = "seed-tts-2.0";
const VOLCENGINE_SPEECH_TTS_PROBE_URL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const VOLCENGINE_DOUBAO_AUDIO_GENERATION_RESOURCE_ID = "volc.service_type.10074";
const VOLCENGINE_DOUBAO_AUDIO_GENERATION_PROBE_URL = "https://openspeech.bytedance.com/api/v3/tts/create";
const VOLCENGINE_SPEECH_CAPABILITIES = Object.freeze(["asr", "tts", "audioGeneration"]);
const PROBE_TEXT_RESPONSE_HEADERS = Object.freeze(["x-api-status", "x-api-message"]);
const RUNNINGHUB_AUTH_FAILURE_CODES = new Set(["801", "802", "806", "811", "1002", "1014"]);
const RUNNINGHUB_MODEL_API_KEY_TYPE = "SHARED";
const STEP_LABELS = Object.freeze({
  config: "配置",
  auth: "密钥",
  asr: "录音文件识别",
  tts: "doubao-seed-tts-2.0",
  audioGeneration: "doubao-seed-audio-1.0",
  service: "服务",
  cloud: "云端",
  model: "模型",
  balance: "余额",
  upload: "上传"
});
const SKIPPED_UPLOAD_PROVIDERS = Object.freeze({
  openai: "OpenAI 兼容接口通常直接接收远程 URL，本轮不做独立上传测试",
  ppio: "派欧云当前链路不需要独立厂商上传，本轮只检测密钥和模型列表",
  volcengine: "火山方舟当前先检测 API Key 和服务连通性，模型素材上传待模型接入时验证",
  agnes: "Agnes AI 兼容接口当前先检测 API Key 和服务连通性，素材沿模型链路上传",
  "agnes-domestic": "Agnes AI 兼容接口当前先检测 API Key 和服务连通性，素材沿模型链路上传",
  binghuo: "便宜渠道bh当前通过模型列表检测 API Token 和服务连通性，素材上传沿生成链路执行",
  minimax: "MiniMAX 官方模型通过模型列表检测 API Key，素材上传沿生成链路执行",
  "minimax-international": "MiniMAX 官方模型通过模型列表检测 API Key，素材上传沿生成链路执行"
});
const ONE_PIXEL_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";
function isPlainObject(_0x35d00d) {
  return !!_0x35d00d && typeof _0x35d00d === "object" && !Array.isArray(_0x35d00d);
}
function normalizeProviderId(_0x5b747f) {
  return String(_0x5b747f || "").trim().toLowerCase();
}
function trimSlashes(_0x475ca3) {
  return String(_0x475ca3 || "").replace(/^\/+|\/+$/g, "");
}
function normalizeBaseUrl(_0x2d3ed1) {
  return String(_0x2d3ed1 || "").trim().replace(/\/+$/, "");
}
function normalizeComfyUiBaseUrl(_0x3197ef, _0x3975e7 = "") {
  const _0x55b533 = String(_0x3197ef || _0x3975e7 || "").trim();
  if (!_0x55b533) {
    return "";
  }
  const _0x8db0d1 = /^[a-z][a-z0-9+.-]*:\/\//i.test(_0x55b533);
  try {
    const _0x3eee93 = new URL(_0x8db0d1 ? _0x55b533 : "http://" + _0x55b533);
    _0x3eee93.search = "";
    _0x3eee93.hash = "";
    return _0x3eee93.toString().replace(/\/+$/, "");
  } catch {
    const _0x2cab1e = _0x55b533.replace(/[?#].*$/, "").replace(/\/+$/, "");
    if (!_0x2cab1e) {
      return "";
    }
    if (_0x8db0d1) {
      return _0x2cab1e;
    } else {
      return "http://" + _0x2cab1e;
    }
  }
}
function isPrivateIpv4(_0x4d2fb9) {
  const _0x2a5e38 = String(_0x4d2fb9 || "").split(".").map(_0xb5c6 => Number(_0xb5c6));
  if (_0x2a5e38.length !== 4 || _0x2a5e38.some(_0x347353 => !Number.isInteger(_0x347353))) {
    return false;
  }
  const [_0x1b7d6f, _0x5c76f2] = _0x2a5e38;
  return _0x1b7d6f === 10 || _0x1b7d6f === 127 || _0x1b7d6f === 172 && _0x5c76f2 >= 16 && _0x5c76f2 <= 31 || _0x1b7d6f === 192 && _0x5c76f2 === 168 || _0x1b7d6f === 169 && _0x5c76f2 === 254;
}
function shouldAllowCloudComfyUiBaseUrl(_0x49c553) {
  try {
    const _0x39656e = new URL(normalizeBaseUrl(_0x49c553));
    const _0x2b98ca = _0x39656e.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (!_0x2b98ca || _0x2b98ca === "localhost" || _0x2b98ca.endsWith(".localhost")) {
      return false;
    }
    if (isPrivateIpv4(_0x2b98ca)) {
      return false;
    }
    if (_0x2b98ca === "::1" || _0x2b98ca.startsWith("fc") || _0x2b98ca.startsWith("fd")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
function joinUrl(_0x218a57, _0x1c0ad9) {
  const _0x531120 = normalizeBaseUrl(_0x218a57);
  const _0x26ef71 = trimSlashes(_0x1c0ad9);
  if (!_0x531120) {
    return _0x26ef71;
  }
  if (!_0x26ef71) {
    return _0x531120;
  }
  return _0x531120 + "/" + _0x26ef71;
}
function providerLabel(_0x4d63ef) {
  return PROVIDERS_META?.[_0x4d63ef]?.label || _0x4d63ef;
}
function providerConfigWithDefaults(_0x260b08, _0x50ba72 = {}) {
  const _0x3b8269 = isPlainObject(_0x50ba72) ? _0x50ba72 : {};
  const _0x3b9a63 = _0x260b08 === "grsai" ? PROVIDERS_META?.[_0x260b08]?.defaultUrl || "" : "";
  const _0xf90430 = _0x260b08 === "apimart" ? getApimartApiUrlForRoute(_0x3b8269.routeId) : "";
  const _0x35d820 = _0x3b9a63 || _0x3b8269.apiUrl || _0xf90430 || PROVIDERS_META?.[_0x260b08]?.defaultUrl || "";
  if (_0x260b08 === "comfyui") {
    return {
      apiUrl: normalizeComfyUiBaseUrl(_0x35d820),
      cloudApiUrl: normalizeComfyUiBaseUrl(_0x3b8269.cloudApiUrl || _0x3b8269.cloudBaseUrl || ""),
      apiKey: String(_0x3b8269.apiKey || "").trim().replace(/^Bearer\s+/i, ""),
      modelApiKey: String(_0x3b8269.modelApiKey || "").trim().replace(/^Bearer\s+/i, "")
    };
  }
  return {
    apiUrl: normalizeBaseUrl(_0x35d820),
    apiKey: String(_0x3b8269.apiKey || "").trim().replace(/^Bearer\s+/i, ""),
    modelApiKey: String(_0x3b8269.modelApiKey || "").trim().replace(/^Bearer\s+/i, "")
  };
}
function stripKnownOpenAiTail(_0x4d181f) {
  return normalizeBaseUrl(_0x4d181f).replace(/\/chat\/completions$/i, "").replace(/\/models$/i, "");
}
function buildModelsProbeUrl(_0xa0a02f, _0x34131b) {
  const _0x248b8d = normalizeProviderId(_0xa0a02f);
  const _0x2952de = stripKnownOpenAiTail(_0x34131b);
  if (!_0x2952de || _0x2952de.includes(":generateContent")) {
    return "";
  }
  if (_0x248b8d === "ppio") {
    return joinUrl(_0x2952de.replace(/\/openai\/v1$/i, ""), "openai/v1/models");
  }
  if (/\/v\d+(?:beta)?$/i.test(_0x2952de) || /\/openai\/v1$/i.test(_0x2952de)) {
    return joinUrl(_0x2952de, "models");
  }
  return joinUrl(_0x2952de, "v1/models");
}
function buildCompletionProbeUrl(_0x1314d9, _0x57d963) {
  const _0x461055 = COMPLETION_FALLBACKS[_0x1314d9];
  if (!_0x461055) {
    return "";
  }
  const _0x6ff2f0 = stripKnownOpenAiTail(_0x57d963);
  if (!_0x6ff2f0 || _0x6ff2f0.includes(":generateContent")) {
    return "";
  }
  if (_0x1314d9 === "ppio") {
    return joinUrl(_0x6ff2f0.replace(/\/openai\/v1$/i, ""), _0x461055.basePath);
  }
  if (/\/v\d+(?:beta)?$/i.test(_0x6ff2f0)) {
    return _0x6ff2f0;
  }
  return joinUrl(_0x6ff2f0, _0x461055.basePath);
}
function buildVolcenginePingProbeUrl(_0x1d829e) {
  const _0x833578 = stripKnownOpenAiTail(_0x1d829e);
  if (!_0x833578 || _0x833578.includes(":generateContent")) {
    return "";
  }
  const _0x4f2e51 = _0x833578.replace(/\/api\/v3$/i, "").replace(/\/api\/coding\/v3$/i, "");
  return joinUrl(_0x4f2e51, "ping");
}
function buildVolcengineSpeechAsrSubmitProbeUrl(_0x46c2d5) {
  const _0x20e864 = normalizeBaseUrl(_0x46c2d5 || PROVIDERS_META?.["volcengine-speech"]?.defaultUrl || "https://openspeech.bytedance.com/api/v3/auc/bigmodel").replace(/\/submit$/i, "").replace(/\/query$/i, "");
  return joinUrl(_0x20e864, "submit");
}
function buildApimartBalanceProbeUrls(_0x55b27a) {
  const _0x4b9d9d = stripKnownOpenAiTail(_0x55b27a);
  if (!_0x4b9d9d || _0x4b9d9d.includes(":generateContent")) {
    return [];
  }
  if (/\/v\d+(?:beta)?$/i.test(_0x4b9d9d)) {
    return [joinUrl(_0x4b9d9d, "user/balance"), joinUrl(_0x4b9d9d, "balance")];
  }
  return [joinUrl(_0x4b9d9d, "v1/user/balance"), joinUrl(_0x4b9d9d, "v1/balance")];
}
function buildRunningHubAccountStatusProbeUrl(_0x2a55b5) {
  const _0x46c72a = normalizeBaseUrl(_0x2a55b5 || PROVIDERS_META?.runninghub?.defaultUrl || "https://www.runninghub.cn").replace(/\/openapi\/v2(?:\/.*)?$/i, "").replace(/\/uc\/openapi\/accountStatus$/i, "");
  return joinUrl(_0x46c72a, "uc/openapi/accountStatus");
}
function buildComfyUiSystemStatsProbeUrl(_0x38887a) {
  const _0x44f9a1 = normalizeComfyUiBaseUrl(_0x38887a);
  const _0x550425 = new URLSearchParams({
    baseUrl: _0x44f9a1
  });
  if (shouldAllowCloudComfyUiBaseUrl(_0x44f9a1)) {
    _0x550425.set("allowCloudBaseUrl", "1");
  }
  return "/api/v2/comfyui/system-stats?" + _0x550425.toString();
}
function buildGrsaiApiKeyCreditsProbeUrl(_0x4eedbe) {
  const _0x998e59 = normalizeBaseUrl(_0x4eedbe || PROVIDERS_META?.grsai?.defaultUrl || "https://grsai.dakka.com.cn").replace(/\/v\d+(?:beta)?$/i, "").replace(/\/client\/openapi\/getAPIKeyCredits$/i, "");
  return joinUrl(_0x998e59, "client/openapi/getAPIKeyCredits");
}
function buildGrsaiAccountCreditsProbeUrl(_0x2b45f7, _0x224064) {
  const _0x1ac58d = normalizeBaseUrl(_0x2b45f7 || PROVIDERS_META?.grsai?.defaultUrl || "https://grsai.dakka.com.cn").replace(/\/v\d+(?:beta)?$/i, "").replace(/\/client\/common\/getCredits(?:\?.*)?$/i, "").replace(/\/client\/openapi\/getAPIKeyCredits$/i, "");
  return joinUrl(_0x1ac58d, "client/common/getCredits") + "?apikey=" + encodeURIComponent(_0x224064);
}
function toFiniteNumber(_0x596756) {
  if (_0x596756 === null || _0x596756 === undefined || _0x596756 === "") {
    return null;
  }
  const _0x1c4c68 = Number(_0x596756);
  if (Number.isFinite(_0x1c4c68)) {
    return _0x1c4c68;
  } else {
    return null;
  }
}
function formatBalanceNumber(_0x3cfa71) {
  const _0x47b4f6 = toFiniteNumber(_0x3cfa71);
  if (_0x47b4f6 === null) {
    return "";
  }
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 6
  }).format(_0x47b4f6);
}
function formatCurrencyLabel(_0x2532d9) {
  const _0x8526c8 = String(_0x2532d9 || "").trim().toUpperCase();
  if (!_0x8526c8 || _0x8526c8 === "CNY" || _0x8526c8 === "RMB" || _0x8526c8 === "CNH") {
    return "人民币";
  }
  return _0x8526c8;
}
export function normalizeApimartBalancePayload(_0x485b1d = {}) {
  const _0x3684c0 = isPlainObject(_0x485b1d?.data) && !Array.isArray(_0x485b1d.data) ? _0x485b1d.data : _0x485b1d;
  if (!isPlainObject(_0x3684c0) || _0x3684c0.success === false) {
    return null;
  }
  const _0x16c05d = _0x3684c0.unlimited_quota === true;
  const _0x1017a8 = toFiniteNumber(_0x3684c0.remain_balance ?? _0x3684c0.remaining_balance ?? _0x3684c0.balance);
  const _0x24886f = _0x16c05d ? null : _0x1017a8;
  const _0x4ba6e6 = toFiniteNumber(_0x3684c0.used_balance);
  if (!_0x16c05d && _0x24886f === null) {
    return null;
  }
  const _0x472bd0 = _0x24886f === null ? "" : formatBalanceNumber(_0x24886f);
  const _0x19496a = [];
  if (_0x16c05d) {
    _0x19496a.push("额度不限");
  }
  if (_0x472bd0) {
    _0x19496a.push("剩余余额：" + _0x472bd0 + " 美元");
  }
  return {
    unlimited: _0x16c05d,
    remaining: _0x24886f,
    used: _0x4ba6e6,
    displayText: _0x16c05d ? "余额 不限" : _0x472bd0 ? "余额 " + _0x472bd0 + " 美元" : "余额 已读取",
    detailText: _0x19496a.join("；") || "APIMart 余额已读取"
  };
}
function normalizeRunningHubAccountStatusPayload(_0x188ed1 = {}) {
  const _0x36401b = isPlainObject(_0x188ed1?.data) && !Array.isArray(_0x188ed1.data) ? _0x188ed1.data : _0x188ed1;
  if (!isPlainObject(_0x36401b)) {
    return null;
  }
  if (_0x36401b.success === false) {
    return null;
  }
  if (_0x36401b.code !== undefined && Number(_0x36401b.code) !== 0) {
    return null;
  }
  const _0x4afd30 = isPlainObject(_0x36401b.data) && !Array.isArray(_0x36401b.data) ? _0x36401b.data : _0x36401b;
  const _0x277953 = toFiniteNumber(_0x4afd30.remainCoins ?? _0x4afd30.remain_coins ?? _0x4afd30.coins);
  const _0x595dbe = toFiniteNumber(_0x4afd30.remainMoney ?? _0x4afd30.remain_money ?? _0x4afd30.money ?? _0x4afd30.balance);
  if (_0x277953 === null && _0x595dbe === null) {
    return null;
  }
  const _0x1413a4 = String(_0x4afd30.currency || "CNY").trim().toUpperCase() || "CNY";
  return {
    coins: _0x277953,
    money: _0x595dbe,
    currency: _0x1413a4,
    apiType: String(_0x4afd30.apiType || _0x4afd30.api_type || "").trim()
  };
}
export function normalizeRunningHubBalancePayload({
  workflow: _0x42cc2e,
  model: _0x379562,
  workflowQueue: _0x380b6e,
  modelQueue: _0x39e471
} = {}) {
  const _0x10ee29 = normalizeRunningHubAccountStatusPayload(_0x42cc2e);
  const _0x317116 = normalizeRunningHubAccountStatusPayload(_0x379562);
  const _0x2b584a = normalizeRunningHubQueueStatusPayload(_0x380b6e);
  const _0x4dc1eb = normalizeRunningHubQueueStatusPayload(_0x39e471);
  const _0x39ca2d = _0x10ee29?.coins ?? null;
  const _0x343e40 = _0x317116?.money ?? null;
  const _0x55e03b = _0x2b584a?.concurrentLimit ?? null;
  const _0x458648 = _0x4dc1eb?.concurrentLimit ?? null;
  if (_0x39ca2d === null && _0x343e40 === null && _0x55e03b === null && _0x458648 === null) {
    return null;
  }
  const _0x257e82 = _0x317116?.currency || _0x10ee29?.currency || "CNY";
  const _0x514a42 = formatCurrencyLabel(_0x257e82);
  const _0x56fd07 = formatBalanceNumber(_0x39ca2d);
  const _0x30e48a = formatBalanceNumber(_0x343e40);
  const _0x467c1c = formatBalanceNumber(_0x55e03b);
  const _0x5453f8 = formatBalanceNumber(_0x458648);
  const _0x415c70 = [];
  const _0x4b00bd = [];
  if (_0x467c1c && _0x5453f8) {
    _0x415c70.push("并发上限 " + _0x467c1c + "/" + _0x5453f8);
  } else if (_0x467c1c) {
    _0x415c70.push("工作流并发 " + _0x467c1c);
  } else if (_0x5453f8) {
    _0x415c70.push("模型并发 " + _0x5453f8);
  }
  if (_0x467c1c) {
    _0x4b00bd.push("工作流并发上限：" + _0x467c1c);
  }
  if (_0x5453f8) {
    _0x4b00bd.push("模型并发上限：" + _0x5453f8);
  }
  if (_0x56fd07) {
    _0x415c70.push("积分 " + _0x56fd07);
    _0x4b00bd.push("工作流积分：" + _0x56fd07);
  }
  if (_0x30e48a) {
    _0x415c70.push("钱包 " + _0x30e48a + " " + _0x514a42);
    _0x4b00bd.push("模型钱包：" + _0x30e48a + " " + _0x514a42);
  }
  return {
    workflowCredits: _0x39ca2d,
    modelWallet: _0x343e40,
    workflowConcurrentLimit: _0x55e03b,
    modelConcurrentLimit: _0x458648,
    workflowApiKeyType: _0x2b584a?.apiKeyType || "",
    modelApiKeyType: _0x4dc1eb?.apiKeyType || "",
    currency: _0x257e82,
    currencyLabel: _0x514a42,
    displayText: _0x415c70.join(" · ") || "余额 已读取",
    detailText: _0x4b00bd.join("；") || "RunningHUB 账户信息已读取"
  };
}
function isSuccessfulGrsaiPayload(_0x4e11c3) {
  if (!isPlainObject(_0x4e11c3)) {
    return true;
  }
  if (_0x4e11c3.success === false || _0x4e11c3.ok === false) {
    return false;
  }
  const _0x326975 = _0x4e11c3.code ?? _0x4e11c3.statusCode;
  if (_0x326975 !== undefined) {
    const _0x3a25e6 = Number(_0x326975);
    return _0x3a25e6 === 0 || _0x3a25e6 === 200;
  }
  return true;
}
function unwrapGrsaiCreditsPayload(_0x57ca99) {
  if (!isPlainObject(_0x57ca99)) {
    return _0x57ca99;
  }
  if (!isSuccessfulGrsaiPayload(_0x57ca99)) {
    return null;
  }
  if (_0x57ca99.data !== undefined) {
    return unwrapGrsaiCreditsPayload(_0x57ca99.data);
  }
  if (_0x57ca99.result !== undefined) {
    return unwrapGrsaiCreditsPayload(_0x57ca99.result);
  }
  return _0x57ca99;
}
function extractGrsaiCreditsValue(_0x2c0aca, _0x4d9b32 = new Set()) {
  const _0x37d519 = toFiniteNumber(_0x2c0aca);
  if (_0x37d519 !== null) {
    return _0x37d519;
  }
  if (!isPlainObject(_0x2c0aca) || _0x4d9b32.has(_0x2c0aca)) {
    return null;
  }
  _0x4d9b32.add(_0x2c0aca);
  const _0xa7f62f = ["currentCredits", "availableCredits", "remainingCredits", "remainCredits", "remain_credits", "remaining_credits", "accountCredits", "account_credits", "totalCredits", "total_credits", "apiKeyCredits", "api_key_credits", "credits", "credit", "balance", "amount"];
  for (const _0x1981f4 of _0xa7f62f) {
    if (_0x2c0aca[_0x1981f4] === undefined) {
      continue;
    }
    const _0x2af808 = extractGrsaiCreditsValue(_0x2c0aca[_0x1981f4], _0x4d9b32);
    if (_0x2af808 !== null) {
      return _0x2af808;
    }
  }
  for (const _0x157621 of ["account", "user", "wallet", "quota"]) {
    if (_0x2c0aca[_0x157621] === undefined) {
      continue;
    }
    const _0x539d89 = extractGrsaiCreditsValue(_0x2c0aca[_0x157621], _0x4d9b32);
    if (_0x539d89 !== null) {
      return _0x539d89;
    }
  }
  return null;
}
export function normalizeGrsaiBalancePayload(_0x423c7f = {}, _0x47484f = {}) {
  const _0xc26747 = unwrapGrsaiCreditsPayload(_0x423c7f);
  if (_0xc26747 === null) {
    return null;
  }
  const _0x7f330c = toFiniteNumber(extractGrsaiCreditsValue(_0xc26747));
  if (_0x7f330c === null) {
    return null;
  }
  const _0x1b4f69 = formatBalanceNumber(_0x7f330c);
  const _0x431ddf = _0x47484f.source || "account";
  const _0x4a5057 = _0x431ddf === "apiKey" ? "API Key 积分" : "账户积分";
  return {
    credits: _0x7f330c,
    source: _0x431ddf,
    displayText: _0x431ddf === "apiKey" ? "Key 积分 " + _0x1b4f69 : "账户积分 " + _0x1b4f69,
    detailText: _0x4a5057 + "：" + _0x1b4f69
  };
}
function stringifyProbePayload(_0x5af600) {
  if (_0x5af600 == null) {
    return "";
  }
  if (typeof _0x5af600 === "string") {
    return _0x5af600;
  }
  try {
    return JSON.stringify(_0x5af600);
  } catch {
    return String(_0x5af600 || "");
  }
}
function probeHeaderText(_0x12c6bb = {}) {
  if (!isPlainObject(_0x12c6bb)) {
    return "";
  }
  return PROBE_TEXT_RESPONSE_HEADERS.map(_0x245243 => {
    const _0x5e59ca = _0x12c6bb[_0x245243];
    if (_0x5e59ca) {
      return _0x245243 + ": " + _0x5e59ca;
    } else {
      return "";
    }
  }).filter(Boolean).join(" ");
}
function probeText(_0x4e36fb = {}) {
  return [_0x4e36fb.status ? "HTTP " + _0x4e36fb.status : "", _0x4e36fb.error || "", probeHeaderText(_0x4e36fb.headers), stringifyProbePayload(_0x4e36fb.data)].filter(Boolean).join(" ");
}
function normalizeErrorText(_0x57a31c = "") {
  return String(_0x57a31c || "").replace(/\s+/g, " ").trim();
}
function isAuthFailure(_0x4f4a4a = {}) {
  const _0x5b4b25 = Number(_0x4f4a4a.status || 0);
  if (_0x5b4b25 === 401 || _0x5b4b25 === 403) {
    return true;
  }
  const _0x13cb53 = probeText(_0x4f4a4a).toLowerCase();
  return /(?:\b401\b|\b403\b|unauthorized|forbidden|authentication\s*(?:failed|required|error)|authorization\s*(?:failed|required|error)|invalid\s+(?:x-)?api(?:-|\s*)?key|invalid\s+(?:bearer|access\s*)?token|(?:x-)?api(?:-|\s*)?key.{0,40}(?:invalid|expired|missing|required|revoked|denied)|(?:bearer|access\s*)?token.{0,40}(?:invalid|expired|missing|required|revoked|denied)|鉴权失败|认证失败|未授权|无权限|密钥.{0,20}(?:无效|过期|缺失|未配置)|令牌.{0,20}(?:无效|过期|缺失|未配置))/i.test(_0x13cb53);
}
function classifyProbeFailure(_0x30141b = {}, _0x6e98b1 = "provider_error") {
  const _0x3d2923 = Number(_0x30141b.status || 0);
  const _0x42ec3e = probeText(_0x30141b).toLowerCase();
  if (isAuthFailure(_0x30141b)) {
    return "auth_failed";
  }
  if (/blocked private\/reserved apiurl|unable to resolve apiurl host/i.test(_0x42ec3e)) {
    return "dns_or_proxy";
  }
  if (_0x3d2923 === 0 || /timeout|timed out|network|failed to fetch|dns|econn|请求超时|网络请求失败/i.test(_0x42ec3e)) {
    return "network_failed";
  }
  if (_0x3d2923 === 429 || /rate limit|too many requests|限流|请求过于频繁/i.test(_0x42ec3e)) {
    return "rate_limited";
  }
  if (/insufficient|quota|balance|billing|credit|payment|额度|余额|欠费|付费|账户余额/i.test(_0x42ec3e)) {
    return "quota_or_balance";
  }
  if (/model.+(?:not found|not exist|unavailable|no access)|模型.*(?:不存在|不可用|无权限|未开通)|no permission.*model/i.test(_0x42ec3e)) {
    return "model_unavailable";
  }
  if (_0x3d2923 === 404 || /not found|invalid url|unsupported endpoint|cannot post|cannot get|接口地址|地址不兼容/i.test(_0x42ec3e)) {
    return "bad_base_url";
  }
  return _0x6e98b1;
}
function getRunningHubBusinessCode(_0x47a8dd = {}) {
  const _0x51514d = _0x47a8dd?.data;
  const _0x503d87 = _0x51514d?.code ?? _0x51514d?.errorCode ?? _0x51514d?.error_code;
  if (_0x503d87 === undefined || _0x503d87 === null) {
    return "";
  } else {
    return String(_0x503d87).trim();
  }
}
function classifyRunningHubProbeFailure(_0x3f7126 = {}, _0x3501d3 = "provider_error") {
  const _0x150485 = getRunningHubBusinessCode(_0x3f7126);
  const _0x3a0cee = probeText(_0x3f7126);
  if (RUNNINGHUB_AUTH_FAILURE_CODES.has(_0x150485) || /(?:api(?:-|\s*)?key|apikey|密钥).{0,40}(?:不存在|无效|未授权|失效|user_not_found|unauthorized|invalid)/i.test(_0x3a0cee)) {
    return "auth_failed";
  }
  return classifyProbeFailure(_0x3f7126, _0x3501d3);
}
function humanizeCategory(_0x412b7e, _0x47e448, _0x3ea35e = "连接测试未通过") {
  const _0x1a0f0c = providerLabel(_0x47e448);
  const _0xebfc65 = {
    missing_key: _0x1a0f0c + " 的 API Key 还没填写。",
    missing_url: _0x1a0f0c + " 的接口地址未配置。",
    auth_failed: _0x1a0f0c + " 的 API Key 无效、过期，或没有访问权限。",
    dns_or_proxy: _0x1a0f0c + " 的域名解析被本地安全校验拦截，请检查 DNS 或系统代理设置。",
    network_failed: "无法连到 " + _0x1a0f0c + "，请检查网络、本地服务或防火墙。",
    rate_limited: _0x1a0f0c + " 返回限流，请稍后再试。",
    quota_or_balance: _0x1a0f0c + " 账户额度或余额可能不足。",
    model_unavailable: _0x1a0f0c + " 的测试模型不可访问，可能未开通该模型或模型名不兼容。",
    bad_base_url: _0x1a0f0c + " 的接口地址不兼容，请检查 Base URL 是否填对。",
    upload_failed: _0x1a0f0c + " 上传链路未通过，参考图/视频上传可能会失败。",
    provider_error: _0x1a0f0c + " 返回异常，稍后重试或查看厂商后台状态。",
    unsupported: _0x1a0f0c + " 暂不支持连接测试。"
  };
  return _0xebfc65[_0x412b7e] || _0x3ea35e;
}
function isSuccessfulProbe(_0x10f685 = {}) {
  if (!_0x10f685.success) {
    return false;
  }
  const _0x4de1a1 = Number(_0x10f685.status || 0);
  if (_0x4de1a1 && (_0x4de1a1 < 200 || _0x4de1a1 >= 300)) {
    return false;
  }
  return !isAuthFailure(_0x10f685);
}
function summarizeFailure(_0x5271bb = {}, _0x41718f = "连接测试未通过") {
  const _0x3f8036 = probeText(_0x5271bb).trim();
  if (!_0x3f8036) {
    return _0x41718f;
  }
  if (_0x3f8036.length > 180) {
    return _0x3f8036.slice(0, 177) + "...";
  } else {
    return _0x3f8036;
  }
}
function summarizeVolcengineSpeechFailure(_0x553513 = {}, _0x32053a = "ASR") {
  const _0xa1736f = probeText(_0x553513).trim();
  if (/invalid\s+x-api-key|x-api-key\s+invalid|api\s*key\s+invalid/i.test(_0xa1736f)) {
    return "火山语音返回 Invalid X-Api-Key：请填写火山语音 API Key 管理页里的 X-Api-Key，不要使用火山方舟 Key，并确认已开通录音文件识别。";
  }
  if (/(?:permission|denied|forbid|unauthor|not\s+authorized|no\s+access|无权限|未授权|鉴权)/i.test(_0xa1736f)) {
    return "火山语音 " + _0x32053a + " 权限未通过：请确认该服务已开通，并给这个 X-Api-Key 开启访问权限。";
  }
  return summarizeFailure(_0x553513, "火山语音 " + _0x32053a + " 测试未通过");
}
function isVolcengineSpeechValidationFailure(_0x89b28c = {}) {
  const _0x459c87 = Number(_0x89b28c.status || 0);
  if (isAuthFailure(_0x89b28c)) {
    return false;
  }
  if (_0x459c87 < 400 || _0x459c87 >= 500) {
    return false;
  }
  const _0x46a3b6 = probeText(_0x89b28c);
  return /(?:\btext(?:_prompt)?\b|\bprompt\b|speaker|req_params|model_name|文本|提示词|音色|audio|codec|payload|请求体|音频)/i.test(_0x46a3b6) || /(?:format|格式)(?!.*(?:url|endpoint|base\s*url|接口|地址))/i.test(_0x46a3b6) || /(?:parameter|params|参数)(?!.*(?:key|token|密钥|令牌))/i.test(_0x46a3b6) || /(?:request\s*body|body)(?!.*(?:key|token|auth))/i.test(_0x46a3b6);
}
function makeStep(_0x908ece, _0x58c2b1, _0x2ea26a, _0x160359 = "", _0x1ae6a1 = {}) {
  return {
    id: _0x908ece,
    label: STEP_LABELS[_0x908ece] || _0x908ece,
    ok: Boolean(_0x58c2b1),
    skipped: _0x1ae6a1.skipped === true,
    message: _0x2ea26a,
    detail: normalizeErrorText(_0x160359),
    category: _0x1ae6a1.category || ""
  };
}
function pass(_0x50f368, _0x5024fa = "连接测试通过", _0x45df6e = []) {
  return {
    ok: true,
    providerId: _0x50f368,
    label: providerLabel(_0x50f368),
    message: "通过",
    summary: "连接测试通过",
    detail: _0x5024fa,
    category: "",
    suggestion: "",
    steps: _0x45df6e
  };
}
function partialPass(_0xab91ac, _0x2bbb70, _0x4a2a48 = "", _0x48d007 = []) {
  return {
    ok: true,
    partial: true,
    providerId: _0xab91ac,
    label: providerLabel(_0xab91ac),
    message: "部分通过",
    summary: _0x2bbb70 || "连接测试部分通过",
    detail: _0x4a2a48,
    category: "",
    suggestion: "",
    steps: _0x48d007
  };
}
function fail(_0x25d064, _0x3e8b4f, _0x1aef9b = [], _0x58f7fc = "provider_error") {
  return {
    ok: false,
    providerId: _0x25d064,
    label: providerLabel(_0x25d064),
    message: "未通过",
    error: String(_0x3e8b4f || "连接测试未通过"),
    summary: String(_0x3e8b4f || "连接测试未通过"),
    category: _0x58f7fc,
    suggestion: humanizeCategory(_0x58f7fc, _0x25d064, _0x3e8b4f),
    steps: _0x1aef9b
  };
}
function finishProviderResult(_0x2c3221, _0x512128 = []) {
  const _0x236330 = _0x512128.find(_0x450eee => !_0x450eee.ok && !_0x450eee.skipped);
  const _0x341428 = _0x512128.filter(_0x28d378 => _0x28d378.ok && !_0x28d378.skipped && _0x28d378.id !== "config");
  const _0x5a5ed = _0x512128.filter(_0x17392d => _0x17392d.skipped);
  if (!_0x236330) {
    const _0x26c4da = _0x512128.map(_0x4191c7 => _0x4191c7.label + ": " + _0x4191c7.message).join("；");
    return pass(_0x2c3221, _0x26c4da || "连接测试通过", _0x512128);
  }
  const _0x2946f1 = _0x236330.category || "provider_error";
  const _0x57ac24 = _0x236330.message || humanizeCategory(_0x2946f1, _0x2c3221);
  const _0x26c45e = _0x512128.map(_0x59f2ef => {
    const _0x53dc11 = _0x59f2ef.skipped ? "跳过" : _0x59f2ef.ok ? "通过" : "失败";
    return "" + _0x59f2ef.label + _0x53dc11 + ": " + _0x59f2ef.message;
  });
  return {
    ok: false,
    partial: _0x341428.length > 0 || _0x5a5ed.length > 0,
    providerId: _0x2c3221,
    label: providerLabel(_0x2c3221),
    message: _0x341428.length > 0 ? "部分通过" : "未通过",
    error: _0x57ac24,
    summary: _0x57ac24,
    detail: _0x26c45e.join("；"),
    category: _0x2946f1,
    suggestion: humanizeCategory(_0x2946f1, _0x2c3221, _0x57ac24),
    steps: _0x512128
  };
}
async function getModelsProbe(_0x3c0b72, _0x593925, _0x234ab2) {
  const _0x5a5721 = await request("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x593925), {
    method: "GET",
    headers: {
      Authorization: "Bearer " + _0x234ab2
    }
  }, TEST_TIMEOUT_MS);
  if (isSuccessfulProbe(_0x5a5721)) {
    return makeStep("auth", true, "API Key 可用，模型列表可访问", "models");
  }
  const _0x4f97c2 = classifyProbeFailure(_0x5a5721);
  return {
    ...makeStep("auth", false, humanizeCategory(_0x4f97c2, _0x3c0b72), summarizeFailure(_0x5a5721), {
      category: _0x4f97c2
    }),
    authFailed: isAuthFailure(_0x5a5721)
  };
}
async function completionFallbackProbe(_0x57e8b1, _0x1f4b24, _0x47634f) {
  const _0x2fe305 = COMPLETION_FALLBACKS[_0x57e8b1];
  const _0x17949a = buildCompletionProbeUrl(_0x57e8b1, _0x1f4b24);
  if (!_0x2fe305?.model || !_0x17949a) {
    return makeStep("model", true, "模型列表可访问，未执行额外模型调用", "no completion fallback", {
      skipped: true
    });
  }
  const _0x2eaa07 = {
    apiUrl: _0x17949a,
    apiKey: _0x47634f,
    model: _0x2fe305.model,
    stream: false,
    messages: [{
      role: "user",
      content: "ping"
    }],
    max_tokens: 1
  };
  const _0x22f375 = await post("/api/v2/proxy/completions", _0x2eaa07, TEST_TIMEOUT_MS);
  if (isSuccessfulProbe(_0x22f375)) {
    return makeStep("model", true, "测试模型 " + (_0x2fe305.label || _0x2fe305.model) + " 可访问", "chat-completions");
  }
  const _0xe522b6 = classifyProbeFailure(_0x22f375, "model_unavailable");
  return makeStep("model", false, humanizeCategory(_0xe522b6, _0x57e8b1), summarizeFailure(_0x22f375), {
    category: _0xe522b6
  });
}
async function apimartBalanceProbe(_0x10ff8b, _0x26574f) {
  const _0x26a729 = buildApimartBalanceProbeUrls(_0x26574f.apiUrl);
  if (_0x26a729.length <= 0) {
    return {
      step: makeStep("balance", true, "余额接口地址不可用，已跳过", "no balance endpoint", {
        skipped: true
      }),
      balance: null
    };
  }
  let _0x3dbf4b = null;
  for (const _0x331b14 of _0x26a729) {
    const _0x513c00 = await request("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x331b14), {
      method: "GET",
      headers: {
        Authorization: "Bearer " + _0x26574f.apiKey
      }
    }, TEST_TIMEOUT_MS);
    _0x3dbf4b = _0x513c00;
    if (isSuccessfulProbe(_0x513c00)) {
      const _0x12883b = normalizeApimartBalancePayload(_0x513c00.data);
      if (_0x12883b) {
        return {
          step: makeStep("balance", true, _0x12883b.detailText || "APIMart 余额已读取", _0x331b14.includes("/user/balance") ? "apimart-user-balance" : "apimart-token-balance"),
          balance: _0x12883b
        };
      }
    }
  }
  return {
    step: makeStep("balance", true, "余额暂未返回，连接测试继续", summarizeFailure(_0x3dbf4b, "APIMart 余额接口未返回可识别数据"), {
      skipped: true
    }),
    balance: null
  };
}
async function grsaiCreditsProbe(_0x51218d) {
  const _0x2c8d12 = await request(buildGrsaiAccountCreditsProbeUrl(_0x51218d.apiUrl, _0x51218d.apiKey), {
    method: "GET",
    headers: {
      Authorization: "Bearer " + _0x51218d.apiKey
    }
  }, TEST_TIMEOUT_MS);
  if (isSuccessfulProbe(_0x2c8d12)) {
    const _0xe5504c = normalizeGrsaiBalancePayload(_0x2c8d12.data, {
      source: "account"
    });
    if (_0xe5504c) {
      return {
        step: makeStep("auth", true, "API Key 可用，账户积分已读取", _0xe5504c.detailText || "GRSAI 账户积分已读取"),
        balance: _0xe5504c
      };
    }
  }
  const _0xee5456 = await request(buildGrsaiApiKeyCreditsProbeUrl(_0x51218d.apiUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + _0x51218d.apiKey
    },
    body: JSON.stringify({
      apiKey: _0x51218d.apiKey
    })
  }, TEST_TIMEOUT_MS);
  if (!isSuccessfulProbe(_0xee5456)) {
    const _0x5e4df3 = classifyProbeFailure(_0xee5456);
    return {
      step: makeStep("auth", false, humanizeCategory(_0x5e4df3, "grsai"), summarizeFailure(_0xee5456, "GRSAI 积分接口请求失败"), {
        category: _0x5e4df3
      }),
      balance: null
    };
  }
  const _0x4a3340 = normalizeGrsaiBalancePayload(_0xee5456.data, {
    source: "apiKey"
  });
  if (!_0x4a3340) {
    return {
      step: makeStep("auth", false, "GRSAI API Key 积分接口未返回可识别数据。", stringifyProbePayload(_0xee5456.data), {
        category: "provider_error"
      }),
      balance: null
    };
  }
  return {
    step: makeStep("auth", true, "API Key 可用，积分已读取", _0x4a3340.detailText || "GRSAI API Key 积分已读取"),
    balance: _0x4a3340
  };
}
async function grsaiProviderProbe(_0x4d936c, _0x1ccaae, _0x234693) {
  const _0xd49648 = await grsaiCreditsProbe(_0x1ccaae);
  _0x234693.push(_0xd49648.step);
  const _0xb7d9ba = finishProviderResult(_0x4d936c, _0x234693);
  if (_0xd49648.balance) {
    return {
      ..._0xb7d9ba,
      balance: _0xd49648.balance
    };
  } else {
    return _0xb7d9ba;
  }
}
async function runningHubAccountStatusProbe(_0x2e9952, _0x423491) {
  const _0x132538 = String(_0x423491 || "").trim();
  if (!_0x132538) {
    return null;
  }
  const _0x3e303b = buildRunningHubAccountStatusProbeUrl(_0x2e9952.apiUrl);
  const _0x196a5d = await post("/api/v2/proxy/image", {
    apiUrl: _0x3e303b,
    apiKey: _0x132538,
    apikey: _0x132538
  }, TEST_TIMEOUT_MS);
  if (isSuccessfulProbe(_0x196a5d)) {
    return _0x196a5d.data;
  } else {
    return null;
  }
}
async function runningHubQueueStatusProbe(_0x1f23fb, _0x4011f2) {
  return a114_0x575911({
    ..._0x1f23fb,
    apiKey: _0x4011f2
  }, {
    timeoutMs: TEST_TIMEOUT_MS
  });
}
export async function fetchRunningHubWorkflowQueueStatus(_0x5b9e3b = {}) {
  const _0x50d2cf = providerConfigWithDefaults("runninghub", _0x5b9e3b);
  return runningHubQueueStatusProbe(_0x50d2cf, _0x50d2cf.apiKey);
}
async function runningHubBalanceProbe(_0x1dc6e8, _0x10030f = {}) {
  const [_0x54e944, _0x24a0bc] = await Promise.all([runningHubAccountStatusProbe(_0x1dc6e8, _0x1dc6e8.apiKey), runningHubAccountStatusProbe(_0x1dc6e8, _0x1dc6e8.modelApiKey)]);
  const _0x56bc7c = _0x10030f.workflow || null;
  const _0x13112d = _0x10030f.model || null;
  const _0xd3bad = normalizeRunningHubBalancePayload({
    workflow: _0x54e944,
    model: _0x24a0bc,
    workflowQueue: _0x56bc7c,
    modelQueue: _0x13112d
  });
  if (_0xd3bad) {
    return {
      step: makeStep("balance", true, _0xd3bad.detailText || "RunningHUB 账户信息已读取", "runninghub-account-status"),
      balance: _0xd3bad
    };
  }
  return {
    step: makeStep("balance", true, "账户信息暂未返回，连接测试继续", "RunningHUB 账户信息接口未返回可识别数据", {
      skipped: true
    }),
    balance: null
  };
}
function createTinyPngBlob() {
  const _0x329e5a = typeof atob === "function" ? atob(ONE_PIXEL_PNG_BASE64) : Buffer.from(ONE_PIXEL_PNG_BASE64, "base64").toString("binary");
  const _0x3ab644 = new Uint8Array(_0x329e5a.length);
  for (let _0x57920a = 0; _0x57920a < _0x329e5a.length; _0x57920a++) {
    _0x3ab644[_0x57920a] = _0x329e5a.charCodeAt(_0x57920a);
  }
  return new Blob([_0x3ab644], {
    type: "image/png"
  });
}
async function apimartUploadProbe(_0x508df8, _0x131b9f) {
  const _0x2ee60f = new FormData();
  _0x2ee60f.append("file", createTinyPngBlob(), "aic-connection-test.png");
  _0x2ee60f.append("contentType", "image/png");
  _0x2ee60f.append("fileExtension", "png");
  _0x2ee60f.append("permanent", "0");
  _0x2ee60f.append("apiKey", _0x131b9f.apiKey);
  _0x2ee60f.append("apiUrl", normalizeApimartBaseUrl(_0x131b9f.apiUrl));
  const _0xdb5583 = await post("/api/v2/proxy/apimart-upload", _0x2ee60f, TEST_UPLOAD_TIMEOUT_MS);
  if (isSuccessfulProbe(_0xdb5583) && (_0xdb5583.data?.cdnUrl || _0xdb5583.data?.url)) {
    return makeStep("upload", true, "上传链路可用", "apimart-upload");
  }
  const _0x1f4ace = classifyProbeFailure(_0xdb5583, "upload_failed");
  return makeStep("upload", false, humanizeCategory(_0x1f4ace === "provider_error" ? "upload_failed" : _0x1f4ace, _0x508df8), summarizeFailure(_0xdb5583, "APIMart 上传失败"), {
    category: _0x1f4ace === "provider_error" ? "upload_failed" : _0x1f4ace
  });
}
async function runningHubUploadProbe(_0x248247, _0x32113d) {
  if (!_0x32113d.modelApiKey) {
    return makeStep("upload", true, "未填写模型 API Key，跳过模型上传链路", "no model api key", {
      skipped: true
    });
  }
  const _0x5c6661 = joinUrl(_0x32113d.apiUrl, "openapi/v2/media/upload/binary");
  const _0x573284 = new FormData();
  _0x573284.append("file", createTinyPngBlob(), "aic-connection-test.png");
  const _0x2e35ce = await request("/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x5c6661), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + _0x32113d.modelApiKey
    },
    body: _0x573284
  }, TEST_UPLOAD_TIMEOUT_MS);
  if (isSuccessfulProbe(_0x2e35ce) && isRunningHubUploadResponseSuccessful(_0x2e35ce.data)) {
    return makeStep("upload", true, "上传链路可用", "runninghub-upload");
  }
  const _0x5f0973 = classifyRunningHubProbeFailure(_0x2e35ce, "upload_failed");
  return makeStep("upload", false, humanizeCategory(_0x5f0973 === "provider_error" ? "upload_failed" : _0x5f0973, _0x248247), summarizeFailure(_0x2e35ce, "RunningHUB 上传失败"), {
    category: _0x5f0973 === "provider_error" ? "upload_failed" : _0x5f0973
  });
}
async function uploadProbe(_0x423336, _0x459a38) {
  if (_0x423336 === "apimart") {
    return apimartUploadProbe(_0x423336, _0x459a38);
  }
  if (_0x423336 === "runninghub" || _0x423336 === "runninghub-international") {
    return runningHubUploadProbe(_0x423336, _0x459a38);
  }
  return makeStep("upload", true, SKIPPED_UPLOAD_PROVIDERS[_0x423336] || "当前厂商无需独立上传检测", "skipped", {
    skipped: true
  });
}
async function openAiLikeProviderProbe(_0x2d1383, _0x2cc13f) {
  const _0x5ce161 = providerConfigWithDefaults(_0x2d1383, _0x2cc13f);
  const _0xad904c = [];
  let _0x579c60 = null;
  let _0x1b2684 = false;
  if (!_0x5ce161.apiKey) {
    _0xad904c.push(makeStep("config", false, "API Key 未填写", "", {
      category: "missing_key"
    }));
    return finishProviderResult(_0x2d1383, _0xad904c);
  }
  if (!_0x5ce161.apiUrl) {
    _0xad904c.push(makeStep("config", false, "接口地址未配置", "", {
      category: "missing_url"
    }));
    return finishProviderResult(_0x2d1383, _0xad904c);
  }
  _0xad904c.push(makeStep("config", true, "接口地址和 API Key 已填写"));
  if (_0x2d1383 === "grsai") {
    return grsaiProviderProbe(_0x2d1383, _0x5ce161, _0xad904c);
  }
  const _0x549f2e = buildModelsProbeUrl(_0x2d1383, _0x5ce161.apiUrl);
  if (_0x549f2e) {
    const _0x24ae20 = await getModelsProbe(_0x2d1383, _0x549f2e, _0x5ce161.apiKey);
    if (_0x24ae20.ok) {
      _0xad904c.push(_0x24ae20);
      _0x1b2684 = true;
    } else if (_0x24ae20.authFailed || _0x24ae20.category === "dns_or_proxy" || !COMPLETION_FALLBACKS[_0x2d1383]?.model) {
      _0xad904c.push(_0x24ae20);
      return finishProviderResult(_0x2d1383, _0xad904c);
    } else {
      _0xad904c.push(makeStep("auth", true, "模型列表不可用，已改用轻量模型调用继续检测", _0x24ae20.detail, {
        skipped: true
      }));
    }
  }
  if (_0x2d1383 === "apimart" && _0x1b2684) {
    _0xad904c.push(makeStep("model", true, "模型列表可访问，未执行额外模型调用", "models", {
      skipped: true
    }));
  } else {
    _0xad904c.push(await completionFallbackProbe(_0x2d1383, _0x5ce161.apiUrl, _0x5ce161.apiKey));
  }
  if (_0xad904c.some(_0x2ef463 => !_0x2ef463.ok && !_0x2ef463.skipped)) {
    return finishProviderResult(_0x2d1383, _0xad904c);
  }
  if (_0x2d1383 === "apimart") {
    const _0x1ef5de = await apimartBalanceProbe(_0x2d1383, _0x5ce161);
    _0xad904c.push(_0x1ef5de.step);
    _0x579c60 = _0x1ef5de.balance;
  }
  _0xad904c.push(await uploadProbe(_0x2d1383, _0x5ce161));
  const _0x55c4a3 = finishProviderResult(_0x2d1383, _0xad904c);
  if (_0x579c60) {
    return {
      ..._0x55c4a3,
      balance: _0x579c60
    };
  } else {
    return _0x55c4a3;
  }
}
async function runningHubCredentialProbe(_0x48c761, _0x4fc0e7, _0x3c6c1a, {
  stepId: _0x8dd121,
  successMessage: _0x423bf9,
  requiredApiKeyType = ""
} = {}) {
  const _0x2c376c = buildRunningHubQueueStatusProbeUrl(_0x4fc0e7.apiUrl);
  const _0x3a9e40 = await request("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x2c376c), {
    method: "GET",
    headers: {
      Authorization: "Bearer " + _0x3c6c1a
    }
  }, TEST_TIMEOUT_MS);
  const _0x4de0ca = isSuccessfulProbe(_0x3a9e40) ? normalizeRunningHubQueueStatusPayload(_0x3a9e40.data) : null;
  if (isSuccessfulProbe(_0x3a9e40) && _0x4de0ca) {
    const _0x4172c7 = String(_0x4de0ca?.apiKeyType || "").trim().toUpperCase();
    if (requiredApiKeyType && _0x4172c7 !== requiredApiKeyType) {
      const _0x1a2fa5 = _0x4172c7 || "UNKNOWN";
      return {
        step: makeStep(_0x8dd121, false, "模型 API Key 必须使用企业级-共享 Key（当前类型：" + _0x1a2fa5 + "）。", "RunningHUB queue status apiKeyType=" + _0x1a2fa5, {
          category: "auth_failed"
        }),
        queueStatus: _0x4de0ca
      };
    }
    return {
      step: makeStep(_0x8dd121, true, _0x423bf9, "runninghub-queue-status"),
      queueStatus: _0x4de0ca
    };
  }
  const _0x1ee1e4 = _0x8dd121 === "model" ? "model_unavailable" : "provider_error";
  const _0x40132b = classifyRunningHubProbeFailure(_0x3a9e40, _0x1ee1e4);
  return {
    step: makeStep(_0x8dd121, false, humanizeCategory(_0x40132b, _0x48c761), summarizeFailure(_0x3a9e40, (_0x8dd121 === "model" ? "模型" : "工作流") + " API Key 测试未通过"), {
      category: _0x40132b
    }),
    queueStatus: null
  };
}
function runningHubWorkflowProbe(_0x3a436f, _0x1669b2) {
  return runningHubCredentialProbe(_0x3a436f, _0x1669b2, _0x1669b2.apiKey, {
    stepId: "auth",
    successMessage: "工作流 API Key 可用"
  });
}
function runningHubModelProbe(_0x266e24, _0x1af294) {
  return runningHubCredentialProbe(_0x266e24, _0x1af294, _0x1af294.modelApiKey, {
    stepId: "model",
    successMessage: "模型 API Key 可用",
    requiredApiKeyType: RUNNINGHUB_MODEL_API_KEY_TYPE
  });
}
async function runningHubProviderProbe(_0x42ef79, _0x4b60b7) {
  const _0x32ce9b = providerConfigWithDefaults(_0x42ef79, _0x4b60b7);
  const _0x53b113 = [];
  const _0xd3aca0 = [];
  let _0x531207 = null;
  if (_0x32ce9b.apiKey) {
    _0x53b113.push(runningHubWorkflowProbe(_0x42ef79, _0x32ce9b));
  }
  if (_0x32ce9b.modelApiKey) {
    _0x53b113.push(runningHubModelProbe(_0x42ef79, _0x32ce9b));
  }
  if (_0x53b113.length === 0) {
    _0xd3aca0.push(makeStep("config", false, "API Key 未填写", "", {
      category: "missing_key"
    }));
    return finishProviderResult(_0x42ef79, _0xd3aca0);
  }
  _0xd3aca0.push(makeStep("config", true, "已填写至少一个 RunningHUB API Key"));
  const _0x4a0eb0 = await Promise.all(_0x53b113);
  _0xd3aca0.push(..._0x4a0eb0.map(_0x2183f2 => _0x2183f2.step));
  if (!_0xd3aca0.some(_0x90ba5c => !_0x90ba5c.ok && !_0x90ba5c.skipped)) {
    let _0x1c67b6 = 0;
    const _0x28c316 = {
      workflow: _0x32ce9b.apiKey ? _0x4a0eb0[_0x1c67b6++]?.queueStatus : null,
      model: _0x32ce9b.modelApiKey ? _0x4a0eb0[_0x1c67b6]?.queueStatus : null
    };
    const _0x460ef9 = await runningHubBalanceProbe(_0x32ce9b, _0x28c316);
    _0xd3aca0.push(_0x460ef9.step);
    _0x531207 = _0x460ef9.balance;
  }
  if (!_0xd3aca0.some(_0x50cb43 => !_0x50cb43.ok && !_0x50cb43.skipped)) {
    _0xd3aca0.push(await uploadProbe(_0x42ef79, _0x32ce9b));
  }
  const _0x590f8f = finishProviderResult(_0x42ef79, _0xd3aca0);
  if (_0x531207) {
    return {
      ..._0x590f8f,
      balance: _0x531207
    };
  } else {
    return _0x590f8f;
  }
}
async function comfyUiProviderProbe(_0x1a11b3) {
  const _0x28f20c = providerConfigWithDefaults("comfyui", _0x1a11b3);
  const _0x3ff732 = [];
  if (!_0x28f20c.apiUrl) {
    _0x3ff732.push(makeStep("config", false, "ComfyUI 本地地址未配置", "", {
      category: "missing_url"
    }));
    return finishProviderResult("comfyui", _0x3ff732);
  }
  _0x3ff732.push(makeStep("config", true, _0x28f20c.cloudApiUrl ? "ComfyUI 本地和云端地址已填写" : "ComfyUI 本地地址已填写"));
  const _0x37b6d0 = async (_0x4d5413, _0x2c531b, _0x49f7b8) => {
    const _0x7174bd = await request(buildComfyUiSystemStatsProbeUrl(_0x49f7b8), {
      method: "GET"
    }, TEST_TIMEOUT_MS);
    if (isSuccessfulProbe(_0x7174bd)) {
      const _0x56bff1 = String(_0x7174bd?.data?.system?.comfyui_version || "").trim();
      _0x3ff732.push(makeStep(_0x4d5413, true, _0x56bff1 ? _0x2c531b + " ComfyUI 服务可访问（" + _0x56bff1 + "）" : _0x2c531b + " ComfyUI 服务可访问", "system_stats"));
      return;
    }
    const _0x1133b2 = classifyProbeFailure(_0x7174bd);
    _0x3ff732.push(makeStep(_0x4d5413, false, humanizeCategory(_0x1133b2, "comfyui"), summarizeFailure(_0x7174bd, _0x2c531b + " ComfyUI 连接测试未通过"), {
      category: _0x1133b2
    }));
  };
  await _0x37b6d0("service", "本地", _0x28f20c.apiUrl);
  if (_0x28f20c.cloudApiUrl) {
    await _0x37b6d0("cloud", "云端", _0x28f20c.cloudApiUrl);
  }
  return finishProviderResult("comfyui", _0x3ff732);
}
function buildVolcengineSpeechProbeRequestId(_0x237531) {
  return "aic-connection-test-" + _0x237531 + "-" + Date.now();
}
function buildVolcengineSpeechTtsProbeBody() {
  return {
    req_params: {
      text: "",
      speaker: "zh_female_vv_uranus_bigtts",
      audio_params: {
        format: "mp3",
        sample_rate: 24000
      }
    }
  };
}
function buildVolcengineDoubaoAudioGenerationProbeBody() {
  return {
    model: "seed-audio-1.0",
    text_prompt: "",
    audio_config: {
      format: "mp3",
      sample_rate: 24000,
      pitch_rate: 0,
      speech_rate: 0,
      loudness_rate: 0
    },
    watermark: {}
  };
}
async function requestVolcengineSpeechProbe({
  apiKey: _0x449787,
  apiUrl: _0x35778a,
  resourceId: _0x5d42e2,
  requestIdScope: _0x2b375f,
  body: _0x40d021
}) {
  return request("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x35778a), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": _0x449787,
      "X-Api-Resource-Id": _0x5d42e2,
      "X-Api-Request-Id": buildVolcengineSpeechProbeRequestId(_0x2b375f)
    },
    body: JSON.stringify(_0x40d021)
  }, TEST_TIMEOUT_MS);
}
function makeVolcengineSpeechServiceStep({
  stepId: _0x33dc68,
  serviceLabel: _0x1f5752,
  successMessage: _0x5bb246,
  successDetail: _0xc80e9b,
  result: _0x27ef59
}) {
  if (isSuccessfulProbe(_0x27ef59) || isVolcengineSpeechValidationFailure(_0x27ef59)) {
    return makeStep(_0x33dc68, true, _0x5bb246, _0xc80e9b);
  }
  const _0x5e49af = classifyProbeFailure(_0x27ef59);
  return makeStep(_0x33dc68, false, humanizeCategory(_0x5e49af, "volcengine-speech"), summarizeVolcengineSpeechFailure(_0x27ef59, _0x1f5752), {
    category: _0x5e49af
  });
}
async function volcengineSpeechAsrProbe(_0x2acea4) {
  const _0x5b2950 = await request("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(buildVolcengineSpeechAsrSubmitProbeUrl(_0x2acea4.apiUrl)), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": _0x2acea4.apiKey,
      "X-Api-Resource-Id": VOLCENGINE_SPEECH_ASR_RESOURCE_ID,
      "X-Api-Request-Id": buildVolcengineSpeechProbeRequestId("asr"),
      "X-Api-Sequence": "-1"
    },
    body: JSON.stringify({
      user: {
        uid: "ai-canvas-connection-test"
      },
      audio: {
        data: "",
        format: "mp3",
        codec: "mp3",
        rate: 16000
      },
      request: {
        model_name: "bigmodel"
      }
    })
  }, TEST_TIMEOUT_MS);
  return makeVolcengineSpeechServiceStep({
    stepId: "asr",
    serviceLabel: "录音文件识别",
    successMessage: "录音文件识别服务可访问",
    successDetail: "seed-asr-submit",
    result: _0x5b2950
  });
}
async function volcengineSpeechTtsProbe(_0x48c613) {
  const _0x10f021 = await requestVolcengineSpeechProbe({
    apiKey: _0x48c613.apiKey,
    apiUrl: VOLCENGINE_SPEECH_TTS_PROBE_URL,
    resourceId: VOLCENGINE_SPEECH_TTS_RESOURCE_ID,
    requestIdScope: "tts",
    body: buildVolcengineSpeechTtsProbeBody()
  });
  return makeVolcengineSpeechServiceStep({
    stepId: "tts",
    serviceLabel: "doubao-seed-tts-2.0",
    successMessage: "doubao-seed-tts-2.0 服务可访问",
    successDetail: "tts-unidirectional",
    result: _0x10f021
  });
}
async function volcengineDoubaoAudioGenerationProbe(_0x22b982) {
  const _0x23ec90 = await requestVolcengineSpeechProbe({
    apiKey: _0x22b982.apiKey,
    apiUrl: VOLCENGINE_DOUBAO_AUDIO_GENERATION_PROBE_URL,
    resourceId: VOLCENGINE_DOUBAO_AUDIO_GENERATION_RESOURCE_ID,
    requestIdScope: "seed-audio",
    body: buildVolcengineDoubaoAudioGenerationProbeBody()
  });
  return makeVolcengineSpeechServiceStep({
    stepId: "audioGeneration",
    serviceLabel: "doubao-seed-audio-1.0",
    successMessage: "doubao-seed-audio-1.0 服务可访问",
    successDetail: "tts-create",
    result: _0x23ec90
  });
}
function normalizeVolcengineSpeechCapabilityList(_0x43fd35, _0x594240 = VOLCENGINE_SPEECH_CAPABILITIES) {
  const _0x24e1bc = Array.isArray(_0x43fd35) ? _0x43fd35 : _0x43fd35 ? [_0x43fd35] : [];
  const _0x1808dc = [];
  _0x24e1bc.forEach(_0x5bcdd5 => {
    const _0x1f76e0 = String(_0x5bcdd5 || "").trim();
    if (VOLCENGINE_SPEECH_CAPABILITIES.includes(_0x1f76e0) && !_0x1808dc.includes(_0x1f76e0)) {
      _0x1808dc.push(_0x1f76e0);
    }
  });
  if (_0x1808dc.length > 0) {
    return _0x1808dc;
  } else {
    return [..._0x594240];
  }
}
function normalizeVolcengineSpeechRequiredCapabilities(_0x31f69a) {
  const _0x1ca1ba = Array.isArray(_0x31f69a) ? _0x31f69a : _0x31f69a ? [_0x31f69a] : [];
  const _0x7eae64 = [];
  _0x1ca1ba.forEach(_0x1fa8cc => {
    const _0x2258c6 = String(_0x1fa8cc || "").trim();
    if (VOLCENGINE_SPEECH_CAPABILITIES.includes(_0x2258c6) && !_0x7eae64.includes(_0x2258c6)) {
      _0x7eae64.push(_0x2258c6);
    }
  });
  return _0x7eae64;
}
function buildVolcengineSpeechCapabilityProbes(_0x364981 = VOLCENGINE_SPEECH_CAPABILITIES) {
  const _0x11d70b = {
    asr: volcengineSpeechAsrProbe,
    tts: volcengineSpeechTtsProbe,
    audioGeneration: volcengineDoubaoAudioGenerationProbe
  };
  return _0x364981.map(_0x10af40 => _0x11d70b[_0x10af40]).filter(_0x12237b => typeof _0x12237b === "function");
}
function finishVolcengineSpeechProviderResult(_0x365f95, _0x9d875e = [], {
  requiredCapabilities = []
} = {}) {
  const _0x1366d5 = new Set(["config", ...requiredCapabilities]);
  const _0x2dc329 = _0x9d875e.find(_0x22478e => !_0x22478e.ok && !_0x22478e.skipped && _0x1366d5.has(_0x22478e.id));
  if (_0x2dc329) {
    return finishProviderResult(_0x365f95, _0x9d875e);
  }
  const _0x3870cd = _0x9d875e.filter(_0xfd95fd => VOLCENGINE_SPEECH_CAPABILITIES.includes(_0xfd95fd.id));
  const _0x2168d2 = _0x3870cd.some(_0x4cc05c => _0x4cc05c.ok);
  const _0x5e30ae = _0x3870cd.some(_0x2f0907 => !_0x2f0907.ok && !_0x2f0907.skipped);
  if (_0x2168d2 && _0x5e30ae) {
    const _0x499908 = _0x9d875e.map(_0xf9d582 => {
      const _0xd06c1d = _0xf9d582.skipped ? "跳过" : _0xf9d582.ok ? "通过" : "失败";
      return "" + (_0xf9d582.label || _0xf9d582.id) + _0xd06c1d + ": " + _0xf9d582.message;
    }).join("；");
    return partialPass(_0x365f95, "豆包语音 API Key 可用，部分服务未开通或无权限。", _0x499908, _0x9d875e);
  }
  return finishProviderResult(_0x365f95, _0x9d875e);
}
async function volcengineProviderProbe(_0x1950d2) {
  const _0x24a452 = providerConfigWithDefaults("volcengine", _0x1950d2);
  const _0x4b494c = [];
  if (!_0x24a452.apiKey) {
    _0x4b494c.push(makeStep("config", false, "API Key 未填写", "", {
      category: "missing_key"
    }));
    return finishProviderResult("volcengine", _0x4b494c);
  }
  if (!_0x24a452.apiUrl) {
    _0x4b494c.push(makeStep("config", false, "接口地址未配置", "", {
      category: "missing_url"
    }));
    return finishProviderResult("volcengine", _0x4b494c);
  }
  _0x4b494c.push(makeStep("config", true, "接口地址和 API Key 已填写"));
  const _0x30560d = buildVolcenginePingProbeUrl(_0x24a452.apiUrl);
  if (!_0x30560d) {
    _0x4b494c.push(makeStep("auth", false, "接口地址不兼容", _0x24a452.apiUrl, {
      category: "bad_base_url"
    }));
    return finishProviderResult("volcengine", _0x4b494c);
  }
  const _0x1dda66 = await request("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x30560d), {
    method: "GET",
    headers: {
      Authorization: "Bearer " + _0x24a452.apiKey
    }
  }, TEST_TIMEOUT_MS);
  if (isSuccessfulProbe(_0x1dda66)) {
    _0x4b494c.push(makeStep("auth", true, "方舟 API Key 可用，服务可访问", "ping"));
    _0x4b494c.push(await uploadProbe("volcengine", _0x24a452));
    return finishProviderResult("volcengine", _0x4b494c);
  }
  const _0x1164d5 = classifyProbeFailure(_0x1dda66);
  _0x4b494c.push(makeStep("auth", false, humanizeCategory(_0x1164d5, "volcengine"), summarizeFailure(_0x1dda66, "火山方舟 ping 测试未通过"), {
    category: _0x1164d5
  }));
  return finishProviderResult("volcengine", _0x4b494c);
}
async function volcengineSpeechProviderProbe(_0x456f83, _0x6eac5b = {}) {
  const _0x41abcd = "volcengine-speech";
  const _0x35b525 = providerConfigWithDefaults(_0x41abcd, _0x456f83);
  const _0x3ceca0 = [];
  if (!_0x35b525.apiKey) {
    _0x3ceca0.push(makeStep("config", false, "API Key 未填写", "", {
      category: "missing_key"
    }));
    return finishProviderResult(_0x41abcd, _0x3ceca0);
  }
  if (!_0x35b525.apiUrl) {
    _0x3ceca0.push(makeStep("config", false, "接口地址未配置", "", {
      category: "missing_url"
    }));
    return finishProviderResult(_0x41abcd, _0x3ceca0);
  }
  _0x3ceca0.push(makeStep("config", true, "接口地址和 API Key 已填写"));
  const _0x23859e = normalizeVolcengineSpeechCapabilityList(_0x6eac5b?.probeCapabilities || _0x6eac5b?.requiredCapabilities);
  const _0x502afd = normalizeVolcengineSpeechRequiredCapabilities(_0x6eac5b?.requiredCapabilities);
  const _0x35bf85 = await Promise.all(buildVolcengineSpeechCapabilityProbes(_0x23859e).map(_0x3e9d7f => _0x3e9d7f(_0x35b525)));
  _0x3ceca0.push(..._0x35bf85);
  return finishVolcengineSpeechProviderResult(_0x41abcd, _0x3ceca0, {
    requiredCapabilities: _0x502afd
  });
}
export async function testProviderConnection(_0x427580, _0x58bf5a = {}, _0x3b1238 = {}) {
  const _0x398168 = normalizeProviderId(_0x427580);
  if (!DEFAULT_PROVIDER_TEST_IDS.includes(_0x398168)) {
    return fail(_0x398168 || "unknown", "暂不支持该厂商的连接测试");
  }
  if (_0x398168 === "runninghub" || _0x398168 === "runninghub-international") {
    return runningHubProviderProbe(_0x398168, _0x58bf5a);
  }
  if (_0x398168 === "comfyui") {
    return comfyUiProviderProbe(_0x58bf5a);
  }
  if (_0x398168 === "volcengine") {
    return volcengineProviderProbe(_0x58bf5a);
  }
  if (_0x398168 === "volcengine-speech") {
    return volcengineSpeechProviderProbe(_0x58bf5a, _0x3b1238);
  }
  return openAiLikeProviderProbe(_0x398168, _0x58bf5a);
}
export async function testProviderConnections(_0xf09acc = {}, _0xc52bef = DEFAULT_PROVIDER_TEST_IDS) {
  const _0x153dd4 = isPlainObject(_0xf09acc?.providers) ? _0xf09acc.providers : {};
  const _0x2ab3fd = await Promise.all(_0xc52bef.map(async _0x5a68ca => {
    const _0x1e26a4 = normalizeProviderId(_0x5a68ca);
    const _0x565117 = await testProviderConnection(_0x1e26a4, _0x153dd4[_0x1e26a4] || {});
    return [_0x1e26a4, _0x565117];
  }));
  return Object.fromEntries(_0x2ab3fd);
}