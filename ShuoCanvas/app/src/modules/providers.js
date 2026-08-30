import { getModelManifest } from "../manifests/index.js";
import { translateManifestText } from "../i18n/manifestText.js";
import { AGNES_DOMESTIC_PROFILE_ID, AGNES_INTERNATIONAL_PROFILE_ID, AGNES_MODEL_API_PROFILES } from "./agnesProviderProfiles.js";
import { MINIMAX_DOMESTIC_PROFILE_ID, MINIMAX_INTERNATIONAL_PROFILE_ID, MINIMAX_MODEL_API_PROFILES } from "./minimaxProviderProfiles.js";
import { RUNNINGHUB_DOMESTIC_PROFILE_ID, RUNNINGHUB_INTERNATIONAL_PROFILE_ID, RUNNINGHUB_MODEL_API_PROFILES } from "./runningHubProviderProfiles.js";
export const APIMART_ROUTE_IDS = Object.freeze({
  DOMESTIC_1: "domestic1",
  DOMESTIC_2: "domestic2",
  OVERSEAS: "overseas"
});
export const APIMART_API_ROUTES = Object.freeze([Object.freeze({
  id: APIMART_ROUTE_IDS.DOMESTIC_1,
  label: "国内线路1",
  apiUrl: "https://api.apib.ai"
}), Object.freeze({
  id: APIMART_ROUTE_IDS.DOMESTIC_2,
  label: "国内线路2",
  apiUrl: "https://api.aishuch.com"
}), Object.freeze({
  id: APIMART_ROUTE_IDS.OVERSEAS,
  label: "海外线路",
  apiUrl: "https://api.apimart.ai"
})]);
export const DEFAULT_APIMART_ROUTE_ID = APIMART_ROUTE_IDS.DOMESTIC_1;
export const DEFAULT_APIMART_API_URL = APIMART_API_ROUTES.find(_0x10ecc2 => _0x10ecc2.id === DEFAULT_APIMART_ROUTE_ID)?.apiUrl || "https://api.apib.ai";
function normalizeRouteApiUrl(_0x56c9fa) {
  return String(_0x56c9fa || "").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
export function getApimartRouteById(_0x1ed992) {
  const _0x125220 = String(_0x1ed992 || "").trim();
  return APIMART_API_ROUTES.find(_0x165934 => _0x165934.id === _0x125220) || APIMART_API_ROUTES.find(_0x35cd69 => _0x35cd69.id === DEFAULT_APIMART_ROUTE_ID);
}
export function getApimartApiUrlForRoute(_0x2a10b1) {
  return getApimartRouteById(_0x2a10b1)?.apiUrl || DEFAULT_APIMART_API_URL;
}
export function resolveApimartRouteByApiUrl(_0x5e17c0) {
  const _0x4960cd = normalizeRouteApiUrl(_0x5e17c0);
  if (!_0x4960cd) {
    return null;
  }
  return APIMART_API_ROUTES.find(_0x8e3678 => normalizeRouteApiUrl(_0x8e3678.apiUrl) === _0x4960cd) || null;
}
export const getDisplayModelName = _0x5f5d1f => {
  if (!_0x5f5d1f) {
    return "";
  }
  const _0x21876c = getModelManifest(_0x5f5d1f);
  if (_0x21876c?.displayName) {
    return translateManifestText(_0x21876c.displayName);
  }
  const _0x52dc3b = {
    "minimax/minimax-m2.5-highspeed": "MiniMax M2.5-highspeed",
    "qwen/qwen3.5-397b-a17b": "Qwen3.5-397B-A17B",
    "deepseek/deepseek-v3.2": "DeepSeek-V3.2",
    "moonshotai/kimi-k2.5": "Kimi K2.5",
    "apimart/gemini-3.1-pro-preview": "Gemini 3.1 Pro Preview",
    "apimart/gemini-3-flash-preview-nothinking": "Gemini 3 Flash (No Thinking)",
    "gpt-image-2": "GPT image 2",
    "gpt-image-2-vip": "GPT image 2",
    "nano-banana-fast": "Nanobanana",
    "nano-banana-pro": "NanobananaPRO",
    "nano-banana-pro-vt": "NanobananaPRO",
    "nano-banana-pro-cl": "NanobananaPRO",
    "nano-banana-pro-vip": "NanobananaPRO",
    "nano-banana-pro-4k-vip": "NanobananaPRO",
    "nano-banana-2": "Nanobanana2",
    "nano-banana-2-cl": "Nanobanana2",
    "nano-banana-2-4k-cl": "Nanobanana2",
    "apimart/gpt-5.4": "GPT-5.4",
    "seedance-2.0-fast": "Seedance 2.0 Fast",
    "seedance-2.0": "Seedance 2.0",
    "aicanvas/text-lite": "SHUO Canvas Text Lite",
    "aicanvas/text-pro": "SHUO Canvas Text Pro",
    "aicanvas/image-lite": "SHUO Canvas Image Lite",
    "aicanvas/image-pro": "SHUO Canvas Image Pro"
  };
  return translateManifestText(_0x52dc3b[_0x5f5d1f] || _0x5f5d1f);
};
export const PROVIDERS_META = {
  grsai: {
    id: "grsai",
    label: "GRSAI",
    defaultUrl: "https://grsai.dakka.com.cn",
    logoPath: "images/grsai.png"
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    defaultUrl: "https://api.openai.com",
    logoPath: null
  },
  ppio: {
    id: "ppio",
    label: "派欧云",
    defaultUrl: "https://api.ppio.com",
    logoPath: "images/ppio.png"
  },
  apimart: {
    id: "apimart",
    label: "APIMart",
    defaultUrl: DEFAULT_APIMART_API_URL,
    logoPath: null
  },
  [MINIMAX_DOMESTIC_PROFILE_ID]: {
    id: MINIMAX_DOMESTIC_PROFILE_ID,
    label: "MiniMAX官方（国内版）",
    defaultUrl: MINIMAX_MODEL_API_PROFILES[MINIMAX_DOMESTIC_PROFILE_ID].apiUrl,
    logoPath: "images/minimax-logo.avif"
  },
  [MINIMAX_INTERNATIONAL_PROFILE_ID]: {
    id: MINIMAX_INTERNATIONAL_PROFILE_ID,
    label: "MiniMAX官方（国际版）",
    defaultUrl: MINIMAX_MODEL_API_PROFILES[MINIMAX_INTERNATIONAL_PROFILE_ID].apiUrl,
    logoPath: "images/minimax-logo.avif"
  },
  [AGNES_DOMESTIC_PROFILE_ID]: {
    id: AGNES_DOMESTIC_PROFILE_ID,
    label: "Agnes AI（国内版）",
    defaultUrl: AGNES_MODEL_API_PROFILES[AGNES_DOMESTIC_PROFILE_ID].apiUrl,
    logoPath: null
  },
  [AGNES_INTERNATIONAL_PROFILE_ID]: {
    id: AGNES_INTERNATIONAL_PROFILE_ID,
    label: "Agnes AI（国际版）",
    defaultUrl: AGNES_MODEL_API_PROFILES[AGNES_INTERNATIONAL_PROFILE_ID].apiUrl,
    logoPath: null
  },
  binghuo: {
    id: "binghuo",
    label: "便宜渠道bh",
    defaultUrl: "https://api.7tai.cc",
    logoPath: null
  },
  volcengine: {
    id: "volcengine",
    label: "火山方舟",
    defaultUrl: "https://ark.cn-beijing.volces.com/api/v3",
    logoPath: "images/volcengine.svg"
  },
  "volcengine-speech": {
    id: "volcengine-speech",
    label: "豆包语音",
    defaultUrl: "https://openspeech.bytedance.com/api/v3/auc/bigmodel",
    logoPath: "images/volcengine.svg"
  },
  [RUNNINGHUB_DOMESTIC_PROFILE_ID]: {
    id: RUNNINGHUB_DOMESTIC_PROFILE_ID,
    label: "RunningHUB（国内版）",
    defaultUrl: RUNNINGHUB_MODEL_API_PROFILES[RUNNINGHUB_DOMESTIC_PROFILE_ID].apiUrl,
    logoPath: "images/RH.png"
  },
  [RUNNINGHUB_INTERNATIONAL_PROFILE_ID]: {
    id: RUNNINGHUB_INTERNATIONAL_PROFILE_ID,
    label: "RunningHUB（国际版）",
    defaultUrl: RUNNINGHUB_MODEL_API_PROFILES[RUNNINGHUB_INTERNATIONAL_PROFILE_ID].apiUrl,
    logoPath: "images/RH.png"
  },
  runninghubwf: {
    id: "runninghubwf",
    label: "RunningHUB工作流",
    defaultUrl: "https://www.runninghub.cn",
    logoPath: "images/RH.png"
  },
  comfyui: {
    id: "comfyui",
    label: "ComfyUI 本地/云端",
    defaultUrl: "http://127.0.0.1:8188",
    logoPath: null
  },
  dreamina: {
    id: "dreamina",
    label: "即梦",
    defaultUrl: "",
    logoPath: null
  },
  aicanvas: {
    id: "aicanvas",
    label: "SHUO Canvas",
    defaultUrl: "",
    logoPath: "images/favicon.svg"
  }
};
export function getAllProviderIds() {
  return Object.keys(PROVIDERS_META);
}