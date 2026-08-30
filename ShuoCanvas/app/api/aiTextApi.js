import * as a40_0x33b075 from "./adapters/PpioAdapter.js";
import { buildTextRequestFromManifest } from "./adapters/ModelApiManifestNormalizer.js";
import { ensureConfig, getProviderConfig } from "./configApi.js";
import { applyCameraAngleToPrompt } from "./cameraPromptApi.js";
import { fetchWithTimeout, fetchWithTimeoutWithSignal, buildApiUrl } from "./apiBase.js";
import { resolveMappedResponseValue } from "./adapters/modelApiMappingEngine.js";
import { processInputImages, processInputImagesPreserveOrder, uploadToRunningHub } from "./imageUploadApi.js";
import { processInputVideos } from "./videoUploadApi.js";
import { uploadModelApiMediaInputs } from "./mediaInputUploadRouter.js";
import { uploadInputsToVolcengineFiles } from "./volcengineFileApi.js";
import { get as a40_0x91257f } from "./requester.js";
import { generateTextWithCliProvider } from "./cliProviderApi.js";
import { isModelApiModel, normalizeProviderId, resolveModelExecution } from "../src/manifests/index.js";
import { buildChatCompletionsStructuredOutput, getTextStructuredOutputRequestMeta, shouldFallbackTextStructuredOutput } from "./adapters/textStructuredOutput.js";
import { ApiError, parseError, parseNetworkError } from "./errors/index.js";
import { buildRunningHubModelApiUrl, resolveRunningHubModelApiProfileId, resolveRunningHubModelApiBaseUrl } from "../src/modules/runningHubProviderProfiles.js";
import { normalizeModelProviderProfileId } from "../src/modules/modelProviderProfileSelection.js";
const GENERATION_TIMEOUT = 300000;
const MIN_GENERATION_TIMEOUT = 30000;
const MAX_GENERATION_TIMEOUT = 900000;
const IMAGE_MENTION_RE = /@图片\d+/g;
const VIDEO_MENTION_RE = /@视频\d+/g;
const AUDIO_MENTION_RE = /@音频\d+/g;
const GPT_TEXT_VIDEO_MEDIA_RE = /\.(?:mp4|mov|m4v|webm|mkv|avi|mpeg|mpg|3gp)(?:[?#].*)?$/i;
const GPT_TEXT_AUDIO_MEDIA_RE = /\.(?:mp3|wav|m4a|aac|flac|ogg|opus|wma)(?:[?#].*)?$/i;
const GPT_TEXT_UNSUPPORTED_MEDIA_RE = /\.(?:mp4|mov|m4v|webm|mkv|avi|mpeg|mpg|3gp|mp3|wav|m4a|aac|flac|ogg|opus|wma)(?:[?#].*)?$/i;
const RUNNINGHUB_CONTACT_SHEET_MAX_SIDE_PX = 2048;
const RUNNINGHUB_CONTACT_SHEET_GAP_PX = 24;
const RUNNINGHUB_CONTACT_SHEET_MIN_CELL_PX = 256;
const RUNNINGHUB_CONTACT_SHEET_COLOR_TOKENS = Object.freeze({
  background: "--canvas-contact-sheet-bg",
  cellBackground: "--canvas-contact-sheet-cell-bg",
  cellStroke: "--canvas-contact-sheet-cell-stroke",
  badgeBackground: "--canvas-contact-sheet-badge-bg",
  badgeText: "--canvas-contact-sheet-badge-text"
});
const RUNNINGHUB_CONTACT_SHEET_COLOR_FALLBACKS = Object.freeze({
  background: "white",
  cellBackground: "whitesmoke",
  cellStroke: "gainsboro",
  badgeBackground: "midnightblue",
  badgeText: "white"
});
function normalizeInputUrls(_0x130318) {
  if (Array.isArray(_0x130318)) {
    return _0x130318.map(_0x5c2872 => String(_0x5c2872 || "").trim()).filter(Boolean);
  } else {
    return [];
  }
}
function hasUnsupportedGptTextMediaUrl(_0x462b58) {
  return normalizeInputUrls(_0x462b58).some(_0x510ddd => GPT_TEXT_UNSUPPORTED_MEDIA_RE.test(_0x510ddd));
}
function isLikelyVideoUrl(_0x31eb60) {
  return GPT_TEXT_VIDEO_MEDIA_RE.test(String(_0x31eb60 || "").trim());
}
function isLikelyAudioUrl(_0x4d1934) {
  return GPT_TEXT_AUDIO_MEDIA_RE.test(String(_0x4d1934 || "").trim());
}
function hasUnsupportedGptTextAudioUrl(_0x5124f5) {
  return normalizeInputUrls(_0x5124f5).some(_0x46dff6 => isLikelyAudioUrl(_0x46dff6));
}
function splitChatCompletionInputUrls(_0x58a1d4) {
  const _0x47a707 = [];
  const _0x10744e = [];
  const _0xdaa1e9 = [];
  for (const _0x46d03c of normalizeInputUrls(_0x58a1d4)) {
    if (isLikelyVideoUrl(_0x46d03c)) {
      _0x10744e.push(_0x46d03c);
    } else if (isLikelyAudioUrl(_0x46d03c)) {
      _0xdaa1e9.push(_0x46d03c);
    } else {
      _0x47a707.push(_0x46d03c);
    }
  }
  return {
    imageUrls: _0x47a707,
    videoUrls: _0x10744e,
    audioUrls: _0xdaa1e9
  };
}
function resolveChatCompletionInputUrls({
  providerId = "",
  mediaPolicy = "",
  inputUrls: _0x4ec99c,
  inputImageUrls: _0x482a36,
  inputVideoUrls: _0x22c75f,
  inputAudioUrls: _0x474549
}) {
  const _0x288c07 = String(mediaPolicy || "").trim().toLowerCase();
  const _0x1fd4c5 = normalizeInputUrls(_0x4ec99c);
  const _0x2b93e4 = normalizeInputUrls(_0x482a36);
  const _0x49fbe4 = normalizeInputUrls(_0x22c75f);
  const _0x1d67f7 = normalizeInputUrls(_0x474549);
  const _0x4738e3 = splitChatCompletionInputUrls(_0x1fd4c5);
  if (_0x288c07 === "text-only") {
    if (_0x1fd4c5.length > 0 || _0x2b93e4.length > 0 || _0x49fbe4.length > 0 || _0x1d67f7.length > 0) {
      const _0x37d8a4 = formatTextProviderLabel(providerId);
      throw new Error(_0x37d8a4 + " 文本模型暂不支持图片、视频或音频参考，请仅输入文本");
    }
    return [];
  }
  if (_0x288c07 === "image-video-audio") {
    return {
      inputUrls: _0x1fd4c5,
      inputImageUrls: _0x2b93e4.length > 0 ? _0x2b93e4 : _0x4738e3.imageUrls,
      inputVideoUrls: _0x49fbe4.length > 0 ? _0x49fbe4 : _0x4738e3.videoUrls,
      inputAudioUrls: _0x1d67f7.length > 0 ? _0x1d67f7 : _0x4738e3.audioUrls,
      allowVideo: true,
      allowAudio: true,
      mediaPolicy: _0x288c07
    };
  }
  if (_0x288c07 === "image-video") {
    if (_0x4738e3.audioUrls.length > 0 || _0x1d67f7.length > 0 || hasUnsupportedGptTextAudioUrl(_0x2b93e4) || hasUnsupportedGptTextAudioUrl(_0x49fbe4)) {
      const _0x510cf1 = formatTextProviderLabel(providerId);
      throw new Error(_0x510cf1 + " 文本模型暂不支持音频参考，请改用图片或视频参考");
    }
    return {
      inputUrls: _0x1fd4c5,
      inputImageUrls: _0x2b93e4.length > 0 ? _0x2b93e4 : _0x4738e3.imageUrls,
      inputVideoUrls: _0x49fbe4.length > 0 ? _0x49fbe4 : _0x4738e3.videoUrls,
      allowVideo: true,
      mediaPolicy: _0x288c07
    };
  }
  if (_0x288c07 !== "image-only") {
    return _0x1fd4c5;
  }
  if (_0x49fbe4.length > 0 || hasUnsupportedGptTextMediaUrl(_0x1fd4c5) || hasUnsupportedGptTextMediaUrl(_0x2b93e4)) {
    const _0x1dd6e9 = formatTextProviderLabel(providerId);
    throw new Error(_0x1dd6e9 + " 文本模型已统一使用 GPT 图文格式，暂不支持视频或音频参考，请改用图片参考");
  }
  if (_0x2b93e4.length > 0) {
    return _0x2b93e4;
  } else {
    return _0x1fd4c5;
  }
}
const RUNNINGHUB_POLL_INTERVAL_MS = 3000;
function sleep(_0x26088a, _0x173c7c = null) {
  if (!_0x173c7c) {
    return new Promise(_0x50f415 => setTimeout(_0x50f415, _0x26088a));
  }
  if (_0x173c7c.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }
  return new Promise((_0x2de30e, _0x2681d6) => {
    const _0xc506f5 = setTimeout(() => {
      _0x173c7c.removeEventListener("abort", _0xf04382);
      _0x2de30e();
    }, _0x26088a);
    const _0xf04382 = () => {
      clearTimeout(_0xc506f5);
      _0x2681d6(new DOMException("Aborted", "AbortError"));
    };
    _0x173c7c.addEventListener("abort", _0xf04382, {
      once: true
    });
  });
}
function resolveGenerationTimeoutMs(_0x54158f = {}) {
  if (_0x54158f?.disableRequestTimeout === true) {
    return null;
  }
  const _0x5b64cd = _0x54158f?.requestTimeoutMs ?? _0x54158f?.timeoutMs;
  const _0x3724e0 = Number(_0x5b64cd);
  if (!Number.isFinite(_0x3724e0) || _0x3724e0 <= 0) {
    return GENERATION_TIMEOUT;
  }
  return Math.min(MAX_GENERATION_TIMEOUT, Math.max(MIN_GENERATION_TIMEOUT, Math.trunc(_0x3724e0)));
}
function resolveCssColorValue(_0x11fa04, _0x1609cc = new Set()) {
  const _0x48dd22 = String(_0x11fa04 || "").trim();
  if (!_0x48dd22) {
    return "";
  }
  const _0x33365c = /^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^)]+?)\s*)?\)$/.exec(_0x48dd22);
  if (!_0x33365c) {
    return _0x48dd22;
  }
  const _0x537fb5 = _0x33365c[1];
  const _0x34288e = (_0x33365c[2] || "").trim();
  if (_0x1609cc.has(_0x537fb5)) {
    return resolveCssColorValue(_0x34288e, _0x1609cc);
  }
  _0x1609cc.add(_0x537fb5);
  return readDocumentCssColorToken(_0x537fb5, _0x1609cc) || resolveCssColorValue(_0x34288e, _0x1609cc);
}
function readDocumentCssColorToken(_0x47e927, _0x1f480f = new Set()) {
  const _0x4bf686 = globalThis?.document?.documentElement;
  const _0x488ddd = globalThis?.getComputedStyle || globalThis?.window?.getComputedStyle;
  if (!_0x4bf686 || typeof _0x488ddd !== "function") {
    return "";
  }
  const _0x5e9d46 = _0x488ddd(_0x4bf686).getPropertyValue(_0x47e927).trim();
  if (!_0x5e9d46) {
    return "";
  }
  return resolveCssColorValue(_0x5e9d46, _0x1f480f);
}
function getRunningHubContactSheetPalette() {
  return {
    background: readDocumentCssColorToken(RUNNINGHUB_CONTACT_SHEET_COLOR_TOKENS.background) || RUNNINGHUB_CONTACT_SHEET_COLOR_FALLBACKS.background,
    cellBackground: readDocumentCssColorToken(RUNNINGHUB_CONTACT_SHEET_COLOR_TOKENS.cellBackground) || RUNNINGHUB_CONTACT_SHEET_COLOR_FALLBACKS.cellBackground,
    cellStroke: readDocumentCssColorToken(RUNNINGHUB_CONTACT_SHEET_COLOR_TOKENS.cellStroke) || RUNNINGHUB_CONTACT_SHEET_COLOR_FALLBACKS.cellStroke,
    badgeBackground: readDocumentCssColorToken(RUNNINGHUB_CONTACT_SHEET_COLOR_TOKENS.badgeBackground) || RUNNINGHUB_CONTACT_SHEET_COLOR_FALLBACKS.badgeBackground,
    badgeText: readDocumentCssColorToken(RUNNINGHUB_CONTACT_SHEET_COLOR_TOKENS.badgeText) || RUNNINGHUB_CONTACT_SHEET_COLOR_FALLBACKS.badgeText
  };
}
function pickFirstNonEmptyString(_0x5f4e3e) {
  for (const _0x63a911 of _0x5f4e3e) {
    if (typeof _0x63a911 === "string" && _0x63a911.trim()) {
      return _0x63a911.trim();
    }
  }
  return "";
}
function extractChatMessageText(_0x653966) {
  if (typeof _0x653966 === "string") {
    return _0x653966.trim();
  }
  if (!Array.isArray(_0x653966)) {
    return "";
  }
  return _0x653966.map(_0xe2bfe => {
    if (typeof _0xe2bfe === "string") {
      return _0xe2bfe.trim();
    }
    if (typeof _0xe2bfe?.text === "string") {
      return _0xe2bfe.text.trim();
    }
    if (typeof _0xe2bfe?.content === "string") {
      return _0xe2bfe.content.trim();
    }
    return "";
  }).filter(Boolean).join("\n");
}
function isRunningHubTextModel(_0x591d17, _0x7cbfe1) {
  return _0x591d17 === "runninghub" && isModelApiModel(_0x7cbfe1, "runninghub");
}
const MANIFEST_REQUIRED_TEXT_PROVIDERS = Object.freeze(new Set(["agnes", "apimart", "grsai", "ppio", "runninghub", "volcengine"]));
function formatTextProviderLabel(_0x5729a7) {
  const _0x5255c5 = normalizeProviderId(_0x5729a7);
  if (_0x5255c5 === "agnes") {
    return "Agnes AI";
  }
  if (_0x5255c5 === "apimart") {
    return "APIMart";
  }
  if (_0x5255c5 === "grsai") {
    return "GRSAI";
  }
  if (_0x5255c5 === "ppio") {
    return "PPIO";
  }
  if (_0x5255c5 === "runninghub") {
    return "RunningHub";
  }
  if (_0x5255c5 === "volcengine") {
    return "Volcengine";
  }
  return _0x5255c5 || "Text";
}
function resolveTextExecution(_0x75ee63 = {}, _0x3becc1 = "") {
  const _0x2815cb = normalizeProviderId(_0x75ee63?.provider);
  if (_0x2815cb === "custom" || _0x2815cb === "openai") {
    return null;
  }
  return resolveModelExecution(_0x3becc1 || _0x75ee63?.model, {
    providerHint: _0x2815cb
  }) || resolveModelExecution(_0x3becc1 || _0x75ee63?.model);
}
function resolveTextProviderId(_0xb14bb3 = {}, _0x4abc65 = "", _0x48a82a = null) {
  if (_0xb14bb3.provider === "custom") {
    return "openai";
  }
  return normalizeProviderId(_0x48a82a?.modelManifest?.provider || _0xb14bb3.provider);
}
function isManifestBackedTextExecution(_0x1b3ca6) {
  return _0x1b3ca6?.modelManifest?.kind === "text" && _0x1b3ca6?.executionManifest?.kind === "text" && _0x1b3ca6?.modelManifest?.adapterType === "modelApi" && _0x1b3ca6?.executionManifest?.adapterType === "modelApi";
}
function isCliTextRuntimeExecution(_0x53556d) {
  return _0x53556d?.modelManifest?.kind === "text" && _0x53556d?.executionManifest?.kind === "text" && _0x53556d?.modelManifest?.adapterType === "localRuntime" && _0x53556d?.executionManifest?.adapterType === "localRuntime" && _0x53556d?.executionManifest?.runtime === "cliText" && !!_0x53556d?.executionManifest?.extensions?.cliProvider;
}
function buildFinalTextPrompt(_0x1b5f24 = {}) {
  return applyCameraAngleToPrompt(_0x1b5f24.prompt, _0x1b5f24.cameraAngle);
}
function assertCliTextOnlyInputs(_0x220d85 = {}) {
  const _0x4050c6 = [_0x220d85.inputUrls, _0x220d85.inputImageUrls, _0x220d85.inputVideoUrls, _0x220d85.inputAudioUrls].reduce((_0x49c807, _0xc934af) => _0x49c807 + normalizeInputUrls(_0xc934af).length, 0);
  if (_0x4050c6 > 0) {
    throw new Error("CLI 文本模型当前仅支持文本输入，请移除图片、视频或音频参考");
  }
}
async function generateCliRuntimeText(_0x74bf86, _0x27964a) {
  assertCliTextOnlyInputs(_0x74bf86);
  const _0x1e9015 = String(_0x27964a?.executionManifest?.extensions?.cliProvider || "").trim();
  if (!_0x1e9015) {
    throw new Error("CLI text runtime manifest missing cliProvider");
  }
  return generateTextWithCliProvider({
    provider: _0x1e9015,
    prompt: buildFinalTextPrompt(_0x74bf86),
    systemPrompt: String(_0x74bf86?.systemPrompt || "").trim(),
    ...(_0x74bf86?.cliModel ? {
      model: String(_0x74bf86.cliModel).trim()
    } : {}),
    timeoutMs: resolveGenerationTimeoutMs(_0x74bf86),
    disableRequestTimeout: _0x74bf86?.disableRequestTimeout === true
  });
}
function getTextManifestMissingError(_0x322b6f, _0x15222a = "") {
  const _0x53d659 = formatTextProviderLabel(_0x15222a);
  if (_0x15222a) {
    return new Error(_0x53d659 + " text model API manifest missing: " + _0x322b6f);
  }
  return new Error("Text model API manifest missing: " + _0x322b6f);
}
function assertTextManifestResolution(_0x1aee89, _0x30ecf8, _0x5ded4a) {
  if (isManifestBackedTextExecution(_0x5ded4a)) {
    return;
  }
  if (!_0x30ecf8 || MANIFEST_REQUIRED_TEXT_PROVIDERS.has(normalizeProviderId(_0x30ecf8))) {
    throw getTextManifestMissingError(_0x1aee89, _0x30ecf8);
  }
}
function parseRunningHubResponseData(_0x434abe) {
  if (!_0x434abe) {
    return {};
  }
  if (typeof _0x434abe === "object") {
    return _0x434abe;
  }
  const _0xa42c09 = String(_0x434abe || "").trim();
  if (!_0xa42c09) {
    return {};
  }
  try {
    return JSON.parse(_0xa42c09);
  } catch {}
  const _0x3c3541 = extractSseJsonSnapshots(_0xa42c09);
  if (_0x3c3541.length > 0) {
    const _0x325071 = normalizeChatCompletionSnapshots(_0x3c3541);
    if (_0x325071) {
      return _0x325071;
    }
    for (const _0x3a4897 of _0x3c3541) {
      if (getRunningHubTaskId(_0x3a4897)) {
        return _0x3a4897;
      }
    }
    return _0x3c3541[_0x3c3541.length - 1];
  }
  throw new Error("无法解析 RunningHUB 文本接口响应");
}
function extractSseJsonSnapshots(_0x5a139a) {
  const _0x2ec532 = String(_0x5a139a || "").split("\n").filter(_0x287c13 => _0x287c13.trim().startsWith("data:"));
  if (_0x2ec532.length === 0) {
    return [];
  }
  const _0xa75b61 = [];
  for (const _0x7b5add of _0x2ec532) {
    const _0x5f391a = String(_0x7b5add || "").trim().replace(/^data:\s*/, "").trim();
    if (!_0x5f391a || _0x5f391a === "[DONE]") {
      continue;
    }
    try {
      _0xa75b61.push(JSON.parse(_0x5f391a));
    } catch {}
  }
  return _0xa75b61;
}
function normalizeChatCompletionSnapshots(_0x46bd79) {
  const _0x3e4d1c = [];
  let _0x5bdd58 = null;
  let _0x41ba6a = "";
  let _0xa4b426 = "assistant";
  for (const _0x14ee79 of _0x46bd79 || []) {
    if (!_0x14ee79 || typeof _0x14ee79 !== "object") {
      continue;
    }
    const _0x169951 = _0x14ee79.choices || _0x14ee79.data?.choices || [];
    if (!Array.isArray(_0x169951) || _0x169951.length === 0) {
      continue;
    }
    _0x5bdd58 = _0x14ee79;
    for (const _0x4cc40e of _0x169951) {
      if (!_0x4cc40e || typeof _0x4cc40e !== "object") {
        continue;
      }
      if (_0x4cc40e.finish_reason) {
        _0x41ba6a = _0x4cc40e.finish_reason;
      }
      if (typeof _0x4cc40e.delta?.role === "string") {
        _0xa4b426 = _0x4cc40e.delta.role || _0xa4b426;
      }
      if (typeof _0x4cc40e.message?.role === "string") {
        _0xa4b426 = _0x4cc40e.message.role || _0xa4b426;
      }
      if (typeof _0x4cc40e.delta?.content === "string") {
        _0x3e4d1c.push(_0x4cc40e.delta.content);
      }
      if (typeof _0x4cc40e.message?.content === "string") {
        _0x3e4d1c.push(_0x4cc40e.message.content);
      }
      if (typeof _0x4cc40e.text === "string") {
        _0x3e4d1c.push(_0x4cc40e.text);
      }
    }
  }
  const _0x1e660d = _0x3e4d1c.join("");
  if (!_0x1e660d) {
    return null;
  }
  return {
    id: _0x5bdd58?.id || "",
    object: "chat.completion",
    choices: [{
      index: 0,
      message: {
        role: _0xa4b426,
        content: _0x1e660d
      },
      finish_reason: _0x41ba6a || "stop"
    }]
  };
}
function getRunningHubTaskId(_0x317eb9) {
  return String(_0x317eb9?.taskId || _0x317eb9?.task_id || _0x317eb9?.data?.taskId || _0x317eb9?.data?.task_id || _0x317eb9?.data?.id || _0x317eb9?.id || "").trim();
}
function isChatCompletionResponse(_0x25a97d) {
  const _0x38d8a8 = _0x25a97d?.choices || _0x25a97d?.data?.choices;
  if (Array.isArray(_0x38d8a8)) {
    return true;
  }
  const _0x446cdc = String(_0x25a97d?.object || _0x25a97d?.data?.object || "");
  return _0x446cdc.startsWith("chat.completion");
}
function stringifyRunningHubReason(_0x56bc55) {
  if (_0x56bc55 == null) {
    return "";
  }
  if (typeof _0x56bc55 === "string") {
    return _0x56bc55.trim();
  }
  if (typeof _0x56bc55 === "object") {
    const _0x530863 = pickFirstNonEmptyString([_0x56bc55.message, _0x56bc55.errorMessage, _0x56bc55.error, _0x56bc55.msg, _0x56bc55.reason, _0x56bc55.detail]);
    if (_0x530863) {
      return _0x530863;
    }
    try {
      return JSON.stringify(_0x56bc55);
    } catch {}
  }
  return String(_0x56bc55 || "").trim();
}
function getRunningHubTextErrorMessage(_0x184262, _0x2bed0e = "文本生成失败") {
  return pickFirstNonEmptyString([_0x184262?.errorMessage, _0x184262?.message, _0x184262?.error, _0x184262?.msg, stringifyRunningHubReason(_0x184262?.failedReason), stringifyRunningHubReason(_0x184262?.reason)]) || _0x2bed0e;
}
function sanitizeGeneratedText(_0x81af4c) {
  return String(_0x81af4c || "").replace(/<think>[\s\S]*?<\/think>\n?/g, "").trim();
}
function hasImageMentions(_0x2b76e3) {
  return /@图片\d+/.test(String(_0x2b76e3 || ""));
}
function hasVideoMentions(_0x5e8c97) {
  return /@视频\d+/.test(String(_0x5e8c97 || ""));
}
function hasAudioMentions(_0xbeea40) {
  return /@音频\d+/.test(String(_0xbeea40 || ""));
}
function resolveInputFetchUrl(_0x5d94cf) {
  const _0x335bc4 = String(_0x5d94cf || "").trim();
  if (!_0x335bc4) {
    return "";
  }
  if (/^(?:https?:|data:|blob:)/i.test(_0x335bc4)) {
    return _0x335bc4;
  }
  if (_0x335bc4.startsWith("/")) {
    return buildApiUrl(_0x335bc4);
  }
  return _0x335bc4;
}
function loadCanvasImageFromObjectUrl(_0x5cedeb) {
  return new Promise((_0x3596a1, _0x392092) => {
    const _0x434f13 = globalThis?.Image;
    if (typeof _0x434f13 !== "function") {
      _0x392092(new Error("当前环境不支持图片加载"));
      return;
    }
    const _0x1f2675 = new _0x434f13();
    if ("crossOrigin" in _0x1f2675) {
      _0x1f2675.crossOrigin = "anonymous";
    }
    _0x1f2675.onload = () => _0x3596a1(_0x1f2675);
    _0x1f2675.onerror = () => _0x392092(new Error("图片加载失败"));
    _0x1f2675.src = _0x5cedeb;
  });
}
async function loadCanvasImageSource(_0x2020ec) {
  const _0x47ab02 = globalThis?.createImageBitmap;
  if (typeof _0x47ab02 === "function") {
    const _0x2a1ef7 = await _0x47ab02(_0x2020ec);
    const _0x51dc97 = Number(_0x2a1ef7?.width || 0);
    const _0x115c81 = Number(_0x2a1ef7?.height || 0);
    if (_0x51dc97 > 0 && _0x115c81 > 0) {
      return {
        handle: _0x2a1ef7,
        width: _0x51dc97,
        height: _0x115c81,
        dispose: () => _0x2a1ef7?.close?.()
      };
    }
    _0x2a1ef7?.close?.();
  }
  const _0x2e768b = globalThis?.URL;
  if (typeof _0x2e768b?.createObjectURL !== "function") {
    throw new Error("当前环境不支持多图合成");
  }
  const _0x12bb12 = _0x2e768b.createObjectURL(_0x2020ec);
  try {
    const _0x4fc59e = await loadCanvasImageFromObjectUrl(_0x12bb12);
    const _0x1129c6 = Number(_0x4fc59e?.naturalWidth || _0x4fc59e?.width || 0);
    const _0x29b7f1 = Number(_0x4fc59e?.naturalHeight || _0x4fc59e?.height || 0);
    if (!(_0x1129c6 > 0) || !(_0x29b7f1 > 0)) {
      throw new Error("图片尺寸无效");
    }
    return {
      handle: _0x4fc59e,
      width: _0x1129c6,
      height: _0x29b7f1,
      dispose: () => _0x2e768b.revokeObjectURL?.(_0x12bb12)
    };
  } catch (_0x2cde11) {
    _0x2e768b.revokeObjectURL?.(_0x12bb12);
    throw _0x2cde11;
  }
}
function createCanvasTarget(_0x3eeefd, _0x5c3b15) {
  const _0x3a9d27 = globalThis?.OffscreenCanvas;
  if (typeof _0x3a9d27 === "function") {
    const _0x559a1a = new _0x3a9d27(_0x3eeefd, _0x5c3b15);
    return {
      canvas: _0x559a1a,
      toBlob: async () => {
        if (typeof _0x559a1a.convertToBlob === "function") {
          return await _0x559a1a.convertToBlob({
            type: "image/png"
          });
        }
        return null;
      }
    };
  }
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const _0x220770 = document.createElement("canvas");
    _0x220770.width = _0x3eeefd;
    _0x220770.height = _0x5c3b15;
    return {
      canvas: _0x220770,
      toBlob: async () => await new Promise(_0x25f130 => {
        if (typeof _0x220770.toBlob !== "function") {
          _0x25f130(null);
          return;
        }
        _0x220770.toBlob(_0x569deb => _0x25f130(_0x569deb), "image/png");
      })
    };
  }
  throw new Error("当前环境不支持多图合成");
}
function resolveRunningHubContactSheetGrid(_0x431341) {
  const _0x36b6bf = Math.max(1, Math.trunc(Number(_0x431341) || 1));
  const _0x5bb06b = _0x36b6bf === 2 ? 2 : Math.ceil(Math.sqrt(_0x36b6bf));
  const _0x97a54d = Math.ceil(_0x36b6bf / _0x5bb06b);
  return {
    cols: _0x5bb06b,
    rows: _0x97a54d
  };
}
function resolveRunningHubContactSheetCellSize(_0x31800e, _0x2d6767) {
  const _0x2cce7c = RUNNINGHUB_CONTACT_SHEET_MAX_SIDE_PX;
  const _0x4bf779 = RUNNINGHUB_CONTACT_SHEET_GAP_PX;
  const _0x12251e = Math.floor((_0x2cce7c - _0x4bf779 * (_0x31800e + 1)) / _0x31800e);
  const _0x4be96d = Math.floor((_0x2cce7c - _0x4bf779 * (_0x2d6767 + 1)) / _0x2d6767);
  return Math.max(RUNNINGHUB_CONTACT_SHEET_MIN_CELL_PX, Math.min(_0x12251e, _0x4be96d));
}
async function composeRunningHubMultiImageBlob(_0x1b360f) {
  const _0x103ef1 = normalizeInputUrls(_0x1b360f);
  const _0x460fd2 = [];
  for (const _0x24944b of _0x103ef1) {
    try {
      const _0x109e39 = await a40_0x91257f(resolveInputFetchUrl(_0x24944b), {
        provider: "remote",
        buildUrl: false,
        responseType: "blob"
      });
      const _0x32917a = await loadCanvasImageSource(_0x109e39);
      _0x460fd2.push({
        blob: _0x109e39,
        source: _0x32917a
      });
    } catch {}
  }
  if (_0x460fd2.length === 0) {
    throw new Error("参考图片处理失败，无法合成多图输入");
  }
  if (_0x460fd2.length === 1) {
    const _0x155fea = _0x460fd2[0].blob;
    _0x460fd2[0].source?.dispose?.();
    return _0x155fea;
  }
  try {
    const {
      cols: _0x5394c6,
      rows: _0x1cc531
    } = resolveRunningHubContactSheetGrid(_0x460fd2.length);
    const _0x5d3d1b = RUNNINGHUB_CONTACT_SHEET_GAP_PX;
    const _0x49b6e4 = resolveRunningHubContactSheetCellSize(_0x5394c6, _0x1cc531);
    const _0x442f06 = getRunningHubContactSheetPalette();
    const _0x456287 = _0x5394c6 * _0x49b6e4 + _0x5d3d1b * (_0x5394c6 + 1);
    const _0x1e2dbc = _0x1cc531 * _0x49b6e4 + _0x5d3d1b * (_0x1cc531 + 1);
    const {
      canvas: _0x3e9cd0,
      toBlob: _0x5b3d4d
    } = createCanvasTarget(_0x456287, _0x1e2dbc);
    const _0x507f0e = _0x3e9cd0?.getContext?.("2d");
    if (!_0x507f0e || typeof _0x507f0e.drawImage !== "function") {
      throw new Error("当前环境不支持多图合成");
    }
    _0x507f0e.fillStyle = _0x442f06.background;
    _0x507f0e.fillRect?.(0, 0, _0x456287, _0x1e2dbc);
    const _0x19b85c = Math.max(30, Math.round(_0x49b6e4 * 0.14));
    const _0x15f139 = Math.max(16, Math.round(_0x19b85c * 0.48));
    _0x460fd2.forEach((_0xae178c, _0x14c09b) => {
      const _0x5831a4 = Math.floor(_0x14c09b / _0x5394c6);
      const _0x258b19 = _0x14c09b % _0x5394c6;
      const _0x3cf44f = _0x5d3d1b + _0x258b19 * (_0x49b6e4 + _0x5d3d1b);
      const _0x366a2d = _0x5d3d1b + _0x5831a4 * (_0x49b6e4 + _0x5d3d1b);
      _0x507f0e.fillStyle = _0x442f06.cellBackground;
      _0x507f0e.fillRect?.(_0x3cf44f, _0x366a2d, _0x49b6e4, _0x49b6e4);
      const _0x120c4e = Math.max(1, Number(_0xae178c.source.width || 1));
      const _0x314eb4 = Math.max(1, Number(_0xae178c.source.height || 1));
      const _0x1a8887 = Math.min(_0x49b6e4 / _0x120c4e, _0x49b6e4 / _0x314eb4);
      const _0x5d7aaf = Math.max(1, Math.round(_0x120c4e * _0x1a8887));
      const _0x1d764c = Math.max(1, Math.round(_0x314eb4 * _0x1a8887));
      const _0x13fbc5 = _0x3cf44f + Math.round((_0x49b6e4 - _0x5d7aaf) / 2);
      const _0x32eef6 = _0x366a2d + Math.round((_0x49b6e4 - _0x1d764c) / 2);
      _0x507f0e.drawImage(_0xae178c.source.handle, _0x13fbc5, _0x32eef6, _0x5d7aaf, _0x1d764c);
      _0x507f0e.strokeStyle = _0x442f06.cellStroke;
      _0x507f0e.lineWidth = 2;
      _0x507f0e.strokeRect?.(_0x3cf44f + 1, _0x366a2d + 1, _0x49b6e4 - 2, _0x49b6e4 - 2);
      _0x507f0e.fillStyle = _0x442f06.badgeBackground;
      _0x507f0e.fillRect?.(_0x3cf44f + 12, _0x366a2d + 12, _0x19b85c, _0x19b85c);
      _0x507f0e.fillStyle = _0x442f06.badgeText;
      _0x507f0e.font = "600 " + _0x15f139 + "px sans-serif";
      _0x507f0e.textAlign = "center";
      _0x507f0e.textBaseline = "middle";
      _0x507f0e.fillText?.(String(_0x14c09b + 1), _0x3cf44f + 12 + _0x19b85c / 2, _0x366a2d + 12 + _0x19b85c / 2);
    });
    const _0xa40140 = await _0x5b3d4d();
    if (!_0xa40140) {
      throw new Error("多图合成失败");
    }
    return _0xa40140;
  } finally {
    _0x460fd2.forEach(_0x4569cf => {
      _0x4569cf.source?.dispose?.();
    });
  }
}
async function buildRunningHubTextImageUrl(_0x1c3bf9, _0x38e44b, _0x58ac9a = {}) {
  const _0x5dc887 = normalizeInputUrls(_0x1c3bf9);
  if (_0x5dc887.length === 0) {
    return "";
  }
  if (_0x5dc887.length === 1) {
    const _0x14350d = await processInputImages(_0x5dc887, _0x38e44b, {
      applyInputQualityProfile: true,
      provider: "runninghub",
      preferFree: false,
      strictUpload: true,
      apiUrl: _0x58ac9a.apiUrl
    });
    return String(_0x14350d[0] || "").trim();
  }
  const _0x41738e = await composeRunningHubMultiImageBlob(_0x5dc887);
  return String(await uploadToRunningHub(_0x41738e, _0x38e44b, {
    apiUrl: _0x58ac9a.apiUrl
  })).trim();
}
function mergeAdjacentTextParts(_0x469f12, {
  createTextPart: _0x27652d,
  isTextPart: _0x37c95f
}) {
  const _0x1f13f3 = [];
  let _0x5bb770 = "";
  const _0x45bfc4 = () => {
    if (!_0x5bb770) {
      return;
    }
    _0x1f13f3.push(_0x27652d(_0x5bb770));
    _0x5bb770 = "";
  };
  for (const _0x695c88 of _0x469f12) {
    if (!_0x695c88) {
      continue;
    }
    if (_0x37c95f(_0x695c88)) {
      _0x5bb770 += String(_0x695c88.text || "");
      continue;
    }
    _0x45bfc4();
    _0x1f13f3.push(_0x695c88);
  }
  _0x45bfc4();
  return _0x1f13f3;
}
function buildPromptMediaParts(_0x515c30, _0x43ffa4, {
  createTextPart: _0x4f7747,
  isTextPart: _0x25f193
}, _0x747fff = {}) {
  const _0x5e59c6 = String(_0x515c30 || "");
  const _0x103ead = normalizePromptMediaGroups(_0x43ffa4, _0x747fff);
  const _0x360ea9 = _0x103ead.some(_0x35eaea => _0x35eaea.parts.length > 0);
  if (!_0x360ea9) {
    if (_0x5e59c6) {
      return [_0x4f7747(_0x5e59c6)];
    } else {
      return [];
    }
  }
  const _0x2962c6 = [];
  const _0x387a25 = new Set();
  const _0x425edb = [];
  for (const _0x16a509 of _0x103ead) {
    _0x16a509.mentionRe.lastIndex = 0;
    let _0x47b48f;
    while (_0x47b48f = _0x16a509.mentionRe.exec(_0x5e59c6)) {
      const _0x16b33c = Number.parseInt(_0x47b48f[0].replace(/\D+/g, ""), 10);
      const _0x5920c2 = Number.isFinite(_0x16b33c) ? Math.max(0, _0x16b33c - 1) : -1;
      _0x425edb.push({
        index: _0x47b48f.index,
        endIndex: _0x47b48f.index + _0x47b48f[0].length,
        text: _0x47b48f[0],
        group: _0x16a509,
        mediaIndex: _0x5920c2
      });
    }
  }
  _0x425edb.sort((_0x35e90c, _0x1346b1) => _0x35e90c.index - _0x1346b1.index || _0x35e90c.endIndex - _0x1346b1.endIndex);
  let _0x250467 = 0;
  for (const _0x2a245f of _0x425edb) {
    if (_0x2a245f.index < _0x250467) {
      continue;
    }
    const _0x28abde = _0x5e59c6.slice(_0x250467, _0x2a245f.index);
    if (_0x28abde) {
      _0x2962c6.push(_0x4f7747(_0x28abde));
    }
    const _0x54c9c = _0x2a245f.group.parts[_0x2a245f.mediaIndex];
    if (_0x54c9c) {
      _0x2962c6.push(_0x54c9c);
      _0x387a25.add(_0x2a245f.group.kind + ":" + _0x2a245f.mediaIndex);
    } else {
      _0x2962c6.push(_0x4f7747(_0x2a245f.text));
    }
    _0x250467 = _0x2a245f.endIndex;
  }
  const _0x3fc806 = _0x5e59c6.slice(_0x250467);
  if (_0x3fc806) {
    _0x2962c6.push(_0x4f7747(_0x3fc806));
  }
  _0x103ead.forEach(_0x27f3f2 => {
    _0x27f3f2.parts.forEach((_0x37f353, _0xe95251) => {
      if (_0x37f353 && !_0x387a25.has(_0x27f3f2.kind + ":" + _0xe95251)) {
        _0x2962c6.push(_0x37f353);
      }
    });
  });
  if (_0x2962c6.length === 0) {
    return _0x103ead.flatMap(_0xc22def => _0xc22def.parts.filter(Boolean));
  }
  return mergeAdjacentTextParts(_0x2962c6, {
    createTextPart: _0x4f7747,
    isTextPart: _0x25f193
  });
}
function normalizePromptMediaGroups(_0x194b95, _0x2aa1a3 = {}) {
  const _0x58671f = Array.isArray(_0x194b95) && _0x194b95.some(_0x15b880 => _0x15b880 && Array.isArray(_0x15b880.parts)) ? _0x194b95 : [{
    kind: "image",
    mentionRe: IMAGE_MENTION_RE,
    parts: _0x194b95,
    preserveSlots: _0x2aa1a3?.preserveSlots === true
  }];
  return _0x58671f.map((_0x30bc04, _0x3d2cef) => {
    const _0x4d20fe = _0x30bc04?.preserveSlots === true || _0x2aa1a3?.preserveSlots === true;
    const _0x3257bc = Array.isArray(_0x30bc04?.parts) ? _0x4d20fe ? _0x30bc04.parts.slice() : _0x30bc04.parts.filter(Boolean) : [];
    return {
      kind: String(_0x30bc04?.kind || "media" + _0x3d2cef),
      mentionRe: _0x30bc04?.mentionRe || IMAGE_MENTION_RE,
      parts: _0x3257bc
    };
  });
}
function normalizeChatCompletionMediaInput(_0x19bea0, _0x2c17f8 = {}) {
  const _0x13fe85 = _0x19bea0 && typeof _0x19bea0 === "object" && !Array.isArray(_0x19bea0) ? _0x19bea0 : {};
  const _0x38ef56 = normalizeInputUrls(_0x13fe85.inputUrls !== undefined ? _0x13fe85.inputUrls : _0x19bea0);
  const _0x2df698 = String(_0x2c17f8.mediaPolicy || _0x13fe85.mediaPolicy || "").trim().toLowerCase();
  const _0xd180bb = _0x2c17f8.allowVideo === true || _0x13fe85.allowVideo === true || _0x2df698 === "image-video" || _0x2df698 === "image-video-audio";
  const _0x57e373 = _0x2c17f8.allowAudio === true || _0x13fe85.allowAudio === true || _0x2df698 === "image-video-audio";
  const _0x1de5b3 = normalizeInputUrls(_0x2c17f8.inputImageUrls);
  const _0x354729 = normalizeInputUrls(_0x13fe85.inputImageUrls);
  const _0x59e01a = normalizeInputUrls(_0x2c17f8.inputVideoUrls);
  const _0x3b2cb8 = normalizeInputUrls(_0x13fe85.inputVideoUrls);
  const _0x2b8e90 = normalizeInputUrls(_0x2c17f8.inputAudioUrls);
  const _0x279caf = normalizeInputUrls(_0x13fe85.inputAudioUrls);
  const _0x202a5d = splitChatCompletionInputUrls(_0x38ef56);
  return {
    inputImageUrls: _0x1de5b3.length > 0 ? _0x1de5b3 : _0x354729.length > 0 ? _0x354729 : _0xd180bb ? _0x202a5d.imageUrls : _0x38ef56,
    inputVideoUrls: _0xd180bb ? _0x59e01a.length > 0 ? _0x59e01a : _0x3b2cb8.length > 0 ? _0x3b2cb8 : _0x202a5d.videoUrls : [],
    inputAudioUrls: _0x57e373 ? _0x2b8e90.length > 0 ? _0x2b8e90 : _0x279caf.length > 0 ? _0x279caf : _0x202a5d.audioUrls : []
  };
}
function resolveChatCompletionVideoUrl(_0x5da8aa, _0x5926dd) {
  const _0x5bf4eb = String(_0x5da8aa || "").trim();
  if (!_0x5bf4eb) {
    return "";
  }
  const _0x3e3430 = normalizeProviderId(_0x5926dd);
  if (_0x3e3430 === "volcengine") {
    if (/^https?:\/\//i.test(_0x5bf4eb)) {
      return _0x5bf4eb;
    }
    throw new Error("火山方舟视频输入需要公网可访问的视频 URL，当前本地视频无法直接发送");
  }
  if (_0x3e3430 === "grsai") {
    if (/^https?:\/\//i.test(_0x5bf4eb)) {
      return _0x5bf4eb;
    }
    throw new Error("GRSAI 视频理解需要公网视频 URL；请配置 RunningHub 上传或启用对象存储");
  }
  return resolveInputFetchUrl(_0x5bf4eb);
}
function inferGeminiNativeMediaMimeType(_0x8f0e67, _0x470814) {
  const _0x1fdaad = String(_0x8f0e67 || "").trim().toLowerCase().split(/[?#]/, 1)[0];
  if (_0x470814 === "image") {
    if (_0x1fdaad.endsWith(".png")) {
      return "image/png";
    }
    if (_0x1fdaad.endsWith(".webp")) {
      return "image/webp";
    }
    if (_0x1fdaad.endsWith(".gif")) {
      return "image/gif";
    }
    return "image/jpeg";
  }
  if (_0x1fdaad.endsWith(".webm")) {
    return "video/webm";
  }
  if (_0x1fdaad.endsWith(".mov")) {
    return "video/quicktime";
  }
  if (_0x1fdaad.endsWith(".mpeg") || _0x1fdaad.endsWith(".mpg")) {
    return "video/mpeg";
  }
  return "video/mp4";
}
function createGeminiNativeFilePart(_0x2d84cd, _0x53e8d4) {
  const _0x591a5d = String(_0x2d84cd || "").trim();
  if (!/^https?:\/\//i.test(_0x591a5d)) {
    throw new Error("Gemini 原生" + (_0x53e8d4 === "video" ? "视频" : "图片") + "输入需要公网可访问的 URL");
  }
  return {
    fileData: {
      mimeType: inferGeminiNativeMediaMimeType(_0x591a5d, _0x53e8d4),
      fileUri: _0x591a5d
    }
  };
}
async function buildGeminiNativeVideoUserParts(_0x5a6429, _0x353e20, _0x5b1289, _0x398c2c, _0x2cccb0 = {}) {
  const _0x184ba0 = normalizeChatCompletionMediaInput(_0x353e20, {
    ..._0x2cccb0,
    allowVideo: true,
    mediaPolicy: _0x2cccb0.mediaPolicy || "image-video"
  });
  const _0x4d273f = String(_0x2cccb0.uploadProvider || _0x398c2c).trim();
  const _0x10de2b = String(_0x2cccb0.imageUploadProvider || _0x4d273f).trim();
  const _0x1b01ee = String(_0x2cccb0.videoUploadProvider || _0x4d273f).trim();
  const _0x46503c = {
    getProviderConfig: getProviderConfig,
    processInputImages: processInputImages,
    processInputVideos: processInputVideos
  };
  const _0x326354 = _0x40c00c => {
    const _0x31c0c8 = normalizeProviderId(_0x40c00c) === normalizeProviderId(_0x398c2c);
    return {
      fallbackProvider: _0x40c00c,
      ...(_0x31c0c8 ? {
        apiKey: _0x5b1289,
        apiUrl: _0x2cccb0.apiUrl
      } : {}),
      reusePublicUrls: true,
      strictUpload: true
    };
  };
  const _0x31204c = _0x184ba0.inputImageUrls.length > 0 ? await uploadModelApiMediaInputs("image", _0x184ba0.inputImageUrls, _0x46503c, _0x326354(_0x10de2b)) : [];
  const _0xf2d493 = _0x184ba0.inputVideoUrls.length > 0 ? await uploadModelApiMediaInputs("video", _0x184ba0.inputVideoUrls, _0x46503c, _0x326354(_0x1b01ee)) : [];
  const _0x10facf = _0x31204c.map(_0x279394 => createGeminiNativeFilePart(_0x279394, "image"));
  const _0x5f0c04 = _0xf2d493.map(_0x4d1f46 => createGeminiNativeFilePart(_0x4d1f46, "video"));
  if (hasImageMentions(_0x5a6429) && _0x184ba0.inputImageUrls.length > 0 && _0x10facf.length === 0) {
    throw new Error("参考图片处理失败，无法映射 @图片 引用");
  }
  if (hasVideoMentions(_0x5a6429) && _0x184ba0.inputVideoUrls.length > 0 && _0x5f0c04.length === 0) {
    throw new Error("参考视频处理失败，无法映射 @视频 引用");
  }
  return buildPromptMediaParts(_0x5a6429, [{
    kind: "image",
    mentionRe: IMAGE_MENTION_RE,
    parts: _0x10facf,
    preserveSlots: true
  }, {
    kind: "video",
    mentionRe: VIDEO_MENTION_RE,
    parts: _0x5f0c04,
    preserveSlots: true
  }], {
    createTextPart: _0x56b52c => ({
      text: _0x56b52c
    }),
    isTextPart: _0x56036a => !!_0x56036a && typeof _0x56036a.text === "string"
  });
}
async function buildVolcengineResponsesUserContent(_0x4ded22, _0x1e905d, _0x4e3ec0, _0x17be78, _0x15a403 = {}) {
  const _0x4f8c76 = String(_0x15a403.mediaPolicy || "image-video").trim().toLowerCase();
  const _0x34078f = normalizeChatCompletionMediaInput(_0x1e905d, {
    ..._0x15a403,
    allowVideo: true,
    allowAudio: _0x15a403.allowAudio === true || _0x4f8c76 === "image-video-audio",
    mediaPolicy: _0x4f8c76
  });
  const _0x55926c = String(_0x15a403.model || "").trim();
  const _0x5789b1 = _0x15a403.forceCustomProviderFreeImageHost === true;
  const _0x417758 = _0x34078f.inputImageUrls.length > 0 ? _0x5789b1 ? await processInputImagesPreserveOrder(_0x34078f.inputImageUrls, "", {
    applyInputQualityProfile: true,
    provider: "freeImageHost",
    strictUpload: true
  }) : await uploadInputsToVolcengineFiles(_0x34078f.inputImageUrls, _0x4e3ec0, {
    baseUrl: _0x15a403.baseUrl,
    kind: "image",
    model: _0x55926c
  }) : [];
  const _0x316a2d = _0x34078f.inputVideoUrls.length > 0 ? await uploadInputsToVolcengineFiles(_0x34078f.inputVideoUrls, _0x4e3ec0, {
    baseUrl: _0x15a403.baseUrl,
    kind: "video",
    model: _0x55926c,
    videoFps: _0x15a403.videoFps ?? 0.3
  }) : [];
  const _0x5015ce = _0x34078f.inputAudioUrls.length > 0 ? await uploadInputsToVolcengineFiles(_0x34078f.inputAudioUrls, _0x4e3ec0, {
    baseUrl: _0x15a403.baseUrl,
    kind: "audio",
    model: _0x55926c
  }) : [];
  const _0x59f1dd = _0x417758.map(_0x4483d4 => {
    const _0x53989e = String(_0x4483d4 || "").trim();
    if (!_0x53989e) {
      return null;
    }
    if (_0x5789b1) {
      return {
        type: "input_image",
        image_url: _0x53989e
      };
    } else {
      return {
        type: "input_image",
        file_id: _0x53989e
      };
    }
  });
  const _0x915d06 = _0x316a2d.map(_0x41c7cb => String(_0x41c7cb || "").trim() ? {
    type: "input_video",
    file_id: _0x41c7cb
  } : null);
  const _0x59fc75 = _0x5015ce.map(_0x40aa62 => String(_0x40aa62 || "").trim() ? {
    type: "input_audio",
    file_id: _0x40aa62
  } : null);
  if (hasImageMentions(_0x4ded22) && _0x34078f.inputImageUrls.length > 0 && _0x59f1dd.filter(Boolean).length === 0) {
    throw new Error("参考图片处理失败，无法映射 @图片 引用");
  }
  if (hasVideoMentions(_0x4ded22) && _0x34078f.inputVideoUrls.length > 0 && _0x915d06.filter(Boolean).length === 0) {
    throw new Error("参考视频处理失败，无法映射 @视频 引用");
  }
  if (hasAudioMentions(_0x4ded22) && _0x34078f.inputAudioUrls.length > 0 && _0x59fc75.filter(Boolean).length === 0) {
    throw new Error("参考音频处理失败，无法映射 @音频 引用");
  }
  return buildPromptMediaParts(_0x4ded22, [{
    kind: "image",
    mentionRe: IMAGE_MENTION_RE,
    parts: _0x59f1dd,
    preserveSlots: true
  }, {
    kind: "video",
    mentionRe: VIDEO_MENTION_RE,
    parts: _0x915d06,
    preserveSlots: true
  }, {
    kind: "audio",
    mentionRe: AUDIO_MENTION_RE,
    parts: _0x59fc75,
    preserveSlots: true
  }], {
    createTextPart: _0x26a044 => ({
      type: "input_text",
      text: _0x26a044
    }),
    isTextPart: _0x468bac => !!_0x468bac && _0x468bac.type === "input_text"
  });
}
async function buildChatCompletionUserContent(_0x572cbc, _0x504a13, _0x474e99, _0x47afcc, _0xd56dac = {}) {
  const _0xc6e869 = normalizeChatCompletionMediaInput(_0x504a13, _0xd56dac);
  const _0xfc5b0e = _0xc6e869.inputImageUrls;
  const _0x28f6ff = _0xc6e869.inputVideoUrls;
  const _0x353bcc = normalizeProviderId(_0x47afcc);
  const _0x545587 = _0xd56dac.forceCustomProviderFreeImageHost === true || _0x353bcc === "custom";
  const _0x2033db = _0x353bcc === "apimart" || _0x353bcc === "grsai" || _0x353bcc === "runninghub";
  const _0x3743f0 = _0x545587 || !_0x2033db ? "freeImageHost" : _0x353bcc;
  const _0x484d7e = _0x2033db && !_0x545587 ? _0x474e99 : "";
  const _0x14d28 = _0xfc5b0e.length > 0 ? await processInputImagesPreserveOrder(_0xfc5b0e, _0x484d7e, {
    applyInputQualityProfile: true,
    provider: _0x3743f0,
    preferFree: _0x3743f0 === "freeImageHost",
    strictUpload: _0x545587 || _0x353bcc === "agnes"
  }) : [];
  const _0x11e194 = _0x28f6ff.length > 0 ? await uploadModelApiMediaInputs("video", _0x28f6ff, {
    getProviderConfig: getProviderConfig,
    processInputVideos: processInputVideos
  }, {
    fallbackProvider: "runninghub",
    ...(_0x353bcc === "runninghub" ? {
      apiKey: _0x474e99,
      apiUrl: _0xd56dac.apiUrl,
      providerProfileId: _0xd56dac.providerProfileId
    } : {}),
    strictUpload: true,
    reusePublicUrls: true
  }) : _0x28f6ff;
  const _0x495d7e = _0x14d28.map(_0x5ac23f => String(_0x5ac23f || "").trim() ? {
    type: "image_url",
    image_url: {
      url: _0x5ac23f
    }
  } : null);
  const _0x489319 = _0x495d7e.filter(Boolean);
  if (hasImageMentions(_0x572cbc) && _0xfc5b0e.length > 0 && _0x489319.length === 0) {
    throw new Error("参考图片处理失败，无法映射 @图片 引用");
  }
  const _0x26547a = _0x11e194.map(_0x32bc64 => {
    const _0x582ad2 = resolveChatCompletionVideoUrl(_0x32bc64, _0x47afcc);
    if (_0x582ad2) {
      return {
        type: "video_url",
        video_url: {
          url: _0x582ad2
        }
      };
    } else {
      return null;
    }
  });
  const _0x15e690 = _0x26547a.filter(Boolean);
  if (hasVideoMentions(_0x572cbc) && _0x28f6ff.length > 0 && _0x15e690.length === 0) {
    throw new Error("参考视频处理失败，无法映射 @视频 引用");
  }
  const _0x287ea9 = buildPromptMediaParts(_0x572cbc, [{
    kind: "image",
    mentionRe: IMAGE_MENTION_RE,
    parts: _0x495d7e,
    preserveSlots: true
  }, {
    kind: "video",
    mentionRe: VIDEO_MENTION_RE,
    parts: _0x26547a,
    preserveSlots: true
  }], {
    createTextPart: _0x554dff => ({
      type: "text",
      text: _0x554dff
    }),
    isTextPart: _0x5afa84 => !!_0x5afa84 && _0x5afa84.type === "text"
  });
  if (_0x287ea9.length === 1 && _0x287ea9[0]?.type === "text") {
    return _0x287ea9[0].text;
  }
  if (_0x287ea9.length > 0) {
    return _0x287ea9;
  } else {
    return String(_0x572cbc || "");
  }
}
export async function buildGenerateTextRequest(_0x6a2ce) {
  await ensureConfig();
  const _0x1c0d59 = buildFinalTextPrompt(_0x6a2ce);
  const _0xc4c68d = _0x6a2ce.model || "gemini-3.1-pro";
  const _0xe63442 = resolveTextExecution(_0x6a2ce, _0xc4c68d);
  const _0x3c8b40 = resolveTextProviderId(_0x6a2ce, _0xc4c68d, _0xe63442);
  assertTextManifestResolution(_0xc4c68d, _0x3c8b40, _0xe63442);
  const _0x5a8646 = normalizeModelProviderProfileId(_0xe63442?.modelManifest || _0xc4c68d, _0x6a2ce.providerProfileId);
  const _0xb80a36 = isRunningHubTextModel(_0x3c8b40, _0xc4c68d) ? _0x5a8646 || resolveRunningHubModelApiProfileId(_0xe63442?.modelManifest?.modelId || _0xc4c68d, _0x6a2ce.providerProfileId) : "";
  const _0x3155ed = getProviderConfig(_0x5a8646 || _0xb80a36 || _0x3c8b40);
  const _0x1c3a70 = _0xb80a36 ? {
    ..._0x3155ed,
    apiUrl: resolveRunningHubModelApiBaseUrl(_0xb80a36)
  } : _0x3155ed;
  const _0x5250e4 = _0x1c3a70.apiUrl.replace(/\/v1\/?$/, "");
  const _0x1ae817 = isRunningHubTextModel(_0x3c8b40, _0xc4c68d) ? _0x1c3a70.modelApiKey || _0x6a2ce.apiKey : _0x6a2ce.apiKey || _0x1c3a70.apiKey;
  if (!_0x1ae817) {
    throw ApiError.authError(_0x3c8b40, null, "API Key 未配置（厂商：" + _0x3c8b40 + "），无法发起文本生成请求");
  }
  const _0x5836b5 = normalizeInputUrls(_0x6a2ce.inputUrls);
  const _0x3eeaa2 = normalizeInputUrls(_0x6a2ce.inputImageUrls);
  const _0x11eb19 = normalizeInputUrls(_0x6a2ce.inputVideoUrls);
  const _0x32c238 = normalizeInputUrls(_0x6a2ce.inputAudioUrls);
  if (isManifestBackedTextExecution(_0xe63442)) {
    const _0x2c81ad = await buildTextRequestFromManifest({
      ..._0x6a2ce,
      model: _0xc4c68d,
      inputUrls: _0x5836b5,
      inputImageUrls: _0x3eeaa2,
      inputVideoUrls: _0x11eb19,
      inputAudioUrls: _0x32c238
    }, _0x1c0d59, {
      getProviderConfig: getProviderConfig,
      buildRunningHubTextImageUrl: buildRunningHubTextImageUrl,
      resolveChatCompletionInputUrls: resolveChatCompletionInputUrls,
      buildChatCompletionUserContent: buildChatCompletionUserContent,
      buildGeminiNativeVideoUserParts: buildGeminiNativeVideoUserParts,
      buildVolcengineResponsesUserContent: buildVolcengineResponsesUserContent
    }, {
      expectedProvider: _0x3c8b40
    });
    if (_0x2c81ad) {
      return _0x2c81ad;
    }
    throw getTextManifestMissingError(_0xc4c68d, _0x3c8b40);
  }
  const _0x2c21eb = resolveChatCompletionInputUrls({
    providerId: _0x3c8b40,
    inputUrls: _0x5836b5,
    inputImageUrls: _0x3eeaa2,
    inputVideoUrls: _0x11eb19,
    inputAudioUrls: _0x32c238
  });
  const _0x1d33d2 = await buildChatCompletionUserContent(_0x1c0d59, _0x2c21eb, _0x1ae817, _0x3c8b40);
  const _0x116cb4 = {
    model: _0xc4c68d,
    stream: false,
    messages: [{
      role: "system",
      content: _0x6a2ce.systemPrompt || "You are a helpful assistant."
    }, {
      role: "user",
      content: _0x1d33d2
    }],
    ...(Math.trunc(Number(_0x6a2ce.maxOutputTokens) || 0) > 0 ? {
      max_tokens: Math.trunc(Number(_0x6a2ce.maxOutputTokens))
    } : {}),
    ...buildChatCompletionsStructuredOutput(_0x6a2ce.structuredOutput)
  };
  const _0x543689 = getTextStructuredOutputRequestMeta(_0x6a2ce.structuredOutput);
  if (_0x3c8b40 === "ppio" || _0x3c8b40 === "openai" || _0x3c8b40 === "grsai") {
    let _0x49f79a;
    if (_0x3c8b40 === "ppio") {
      _0x49f79a = a40_0x33b075.getTextProxyApiUrl(_0x5250e4);
    } else if (_0x5250e4.includes(":generateContent") || _0x5250e4.includes("/v1beta/models") || _0x5250e4.endsWith("/chat/completions") || _0x5250e4.includes("/api/") && _0x5250e4.split("/api/").length > 1) {
      _0x49f79a = _0x5250e4;
    } else if (_0x5250e4.endsWith("/api")) {
      _0x49f79a = _0x5250e4;
    } else if (_0x5250e4.endsWith("/v1")) {
      _0x49f79a = _0x5250e4;
    } else {
      _0x49f79a = _0x5250e4 + "/v1";
    }
    return {
      url: "/api/v2/proxy/completions",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        apiUrl: _0x49f79a,
        apiKey: _0x1ae817,
        ..._0x116cb4
      },
      isProxy: true,
      structuredOutput: _0x543689
    };
  }
  let _0x3cbc46;
  if (_0x5250e4.includes(":generateContent") || _0x5250e4.includes("/v1beta/models") || _0x5250e4.endsWith("/chat/completions") || _0x5250e4.includes("/api/") && _0x5250e4.split("/api/").length > 1) {
    _0x3cbc46 = _0x5250e4;
  } else if (_0x5250e4.endsWith("/api")) {
    _0x3cbc46 = _0x5250e4 + "/v1/chat/completions";
  } else if (_0x5250e4.endsWith("/v1")) {
    _0x3cbc46 = _0x5250e4 + "/chat/completions";
  } else {
    _0x3cbc46 = _0x5250e4 + "/v1/chat/completions";
  }
  return {
    url: _0x3cbc46,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + _0x1ae817
    },
    body: _0x116cb4,
    isProxy: false,
    structuredOutput: _0x543689
  };
}
function parseTextResponse(_0x2ba067, _0x5ad7d6) {
  const _0x4c6915 = "";
  const _0x33623e = _0x2ba067.length;
  const _0x2b86f4 = _0x2ba067.slice(0, 400);
  const _0x240d93 = _0x2ba067.slice(Math.max(0, _0x33623e - 400));
  const _0x3ec39b = /<!doctype\s+html|<html[\s>]/i.test(_0x2b86f4);
  const _0x47d596 = _0x2ba067.replace(/^\uFEFF/, "").trim();
  let _0x416ea2;
  try {
    _0x416ea2 = JSON.parse(_0x47d596);
  } catch (_0x3e72a6) {
    const _0x1655fc = _0x47d596.indexOf("{");
    const _0x272ab3 = _0x47d596.lastIndexOf("}");
    if (_0x1655fc !== -1 && _0x272ab3 > _0x1655fc) {
      try {
        _0x416ea2 = JSON.parse(_0x47d596.slice(_0x1655fc, _0x272ab3 + 1));
      } catch {}
    }
    if (!_0x416ea2) {
      const _0x586e11 = _0x47d596.split("\n").filter(_0xdd70dc => _0xdd70dc.trim().startsWith("data:"));
      if (_0x586e11.length > 0) {
        const _0x3be91f = _0x586e11[_0x586e11.length - 1].replace(/^data:\s*/, "").trim();
        if (_0x3be91f === "[DONE]") {
          const _0x3239b9 = _0x586e11.filter(_0x1eb5b2 => _0x1eb5b2.replace(/^data:\s*/, "").trim() !== "[DONE]");
          if (_0x3239b9.length > 0) {
            const _0x406191 = _0x3239b9[_0x3239b9.length - 1].replace(/^data:\s*/, "").trim();
            _0x416ea2 = JSON.parse(_0x406191);
          } else {
            throw new ApiError({
              type: "PARSE_ERROR",
              message: "服务端返回了空响应",
              status: _0x5ad7d6,
              retryable: false
            });
          }
        } else {
          try {
            _0x416ea2 = JSON.parse(_0x3be91f);
          } catch (_0x4f914a) {
            throw new ApiError({
              type: "PARSE_ERROR",
              message: "无法解析服务端响应: " + _0x4f914a.message,
              status: _0x5ad7d6,
              retryable: false
            });
          }
        }
      } else {
        throw new ApiError({
          type: "PARSE_ERROR",
          message: "服务端返回的不是可解析的 JSON。HTTP " + _0x5ad7d6 + (_0x4c6915 ? " (" + _0x4c6915 + ")" : "") + "，长度 " + _0x33623e + "。\n" + (_0x3ec39b ? "响应看起来像 HTML（常见原因：网关/防火墙拦截、API 地址错误、上游返回了错误页）。\n" : "") + "响应片段(截断)：\n[开头]\n" + _0x2b86f4 + "\n[结尾]\n" + _0x240d93,
          status: _0x5ad7d6,
          retryable: false
        });
      }
    }
  }
  return _0x416ea2;
}
function extractTextContent(_0x8b81a9, _0x11f42b = null) {
  const _0x4e5879 = Array.isArray(_0x8b81a9?.output) ? _0x8b81a9.output : Array.isArray(_0x8b81a9?.data?.output) ? _0x8b81a9.data.output : [];
  const _0x2f7d64 = _0x4e5879.filter(_0x3333b2 => (_0x3333b2?.type === "message" || _0x3333b2?.role === "assistant") && Array.isArray(_0x3333b2?.content)).at(-1);
  const _0x5c7e93 = (_0x2f7d64?.content || []).map(_0x3daa4b => typeof _0x3daa4b?.text === "string" ? _0x3daa4b.text.trim() : typeof _0x3daa4b?.content === "string" ? _0x3daa4b.content.trim() : "").filter(Boolean).join("\n");
  if (_0x5c7e93) {
    return _0x5c7e93;
  }
  const _0x42c81c = resolveMappedResponseValue(_0x8b81a9, _0x11f42b?.resultPaths || _0x11f42b?.textFields || []);
  if (_0x42c81c) {
    return _0x42c81c;
  }
  const _0x5845d2 = _0x8b81a9?.choices || _0x8b81a9?.data?.choices;
  let _0xc1d0a0 = extractChatMessageText(_0x5845d2?.[0]?.message?.content);
  if (!_0xc1d0a0) {
    _0xc1d0a0 = extractChatMessageText(_0x5845d2?.[0]?.delta?.content);
  }
  if (!_0xc1d0a0) {
    _0xc1d0a0 = extractChatMessageText(_0x5845d2?.[0]?.message?.reasoning_content);
  }
  if (!_0xc1d0a0) {
    _0xc1d0a0 = extractChatMessageText(_0x5845d2?.[0]?.delta?.reasoning_content);
  }
  if (!_0xc1d0a0) {
    const _0x237017 = _0x8b81a9?.data?.candidates?.[0]?.content?.parts || _0x8b81a9?.candidates?.[0]?.content?.parts || [];
    if (Array.isArray(_0x237017)) {
      const _0x528620 = _0x237017.filter(_0x69b762 => _0x69b762?.thought !== true).map(_0x1a6de1 => String(_0x1a6de1?.text || "").trim()).filter(Boolean).join("\n");
      _0xc1d0a0 = _0x528620 || _0x237017.map(_0x412a00 => String(_0x412a00?.text || "").trim()).filter(Boolean).at(-1) || "";
    }
  }
  if (!_0xc1d0a0) {
    const _0x40dff4 = _0x4e5879.flatMap(_0x26038a => Array.isArray(_0x26038a?.content) ? _0x26038a.content : []);
    _0xc1d0a0 = pickFirstNonEmptyString(_0x40dff4.map(_0x12c859 => _0x12c859?.text)) || pickFirstNonEmptyString(_0x40dff4.map(_0xade73b => _0xade73b?.content)) || pickFirstNonEmptyString([_0x8b81a9?.output_text, _0x8b81a9?.data?.output_text]);
  }
  if (!_0xc1d0a0) {
    const _0x7ac90b = Array.isArray(_0x8b81a9?.results) ? _0x8b81a9.results : Array.isArray(_0x8b81a9?.data?.results) ? _0x8b81a9.data.results : [];
    _0xc1d0a0 = pickFirstNonEmptyString(_0x7ac90b.map(_0x11562e => _0x11562e?.text)) || pickFirstNonEmptyString([_0x8b81a9?.text, _0x8b81a9?.output, typeof _0x8b81a9?.content === "string" ? _0x8b81a9.content : "", _0x8b81a9?.markdown, _0x8b81a9?.caption, _0x8b81a9?.data?.text, _0x8b81a9?.data?.output, typeof _0x8b81a9?.data?.content === "string" ? _0x8b81a9.data.content : ""]);
  }
  return _0xc1d0a0;
}
async function pollRunningHubTextTask(_0x52b6ac, _0x446ff5, _0x5af7be, _0x5078f8, _0x14588f = GENERATION_TIMEOUT, _0x348e12 = null) {
  const _0x2003b3 = Date.now();
  while (_0x14588f === null || Date.now() - _0x2003b3 < _0x14588f) {
    await sleep(RUNNINGHUB_POLL_INTERVAL_MS, _0x348e12);
    const _0x2683f7 = await fetchWithOptionalTimeout(buildApiUrl("/api/v2/proxy/image"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apiUrl: buildRunningHubModelApiUrl(_0x5078f8, "/openapi/v2/query"),
        apiKey: _0x446ff5,
        taskId: _0x52b6ac
      })
    }, _0x14588f === null ? null : 30000, _0x348e12);
    if (!_0x2683f7.ok) {
      const _0x281f1d = await _0x2683f7.text().catch(() => "");
      let _0x57eef6;
      try {
        _0x57eef6 = JSON.parse(_0x281f1d);
      } catch {
        _0x57eef6 = {
          error: _0x281f1d
        };
      }
      throw parseError(_0x5af7be, _0x57eef6, _0x2683f7.status);
    }
    const _0x41b09c = parseRunningHubResponseData(await _0x2683f7.text());
    const _0x50e854 = Number(_0x41b09c?.code);
    if (Number.isFinite(_0x50e854)) {
      if (_0x50e854 === 804 || _0x50e854 === 813) {
        continue;
      }
      if (_0x50e854 !== 0) {
        throw new Error(getRunningHubTextErrorMessage(_0x41b09c, "文本任务轮询失败"));
      }
    }
    const _0x411086 = _0x41b09c?.data && typeof _0x41b09c.data === "object" ? _0x41b09c.data : _0x41b09c;
    const _0x29da19 = String(_0x411086?.status || "").toUpperCase();
    if (["SUCCESS", "SUCCEEDED", "COMPLETED"].includes(_0x29da19)) {
      return _0x411086;
    }
    if (["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(_0x29da19)) {
      throw new Error(getRunningHubTextErrorMessage(_0x411086, "文本任务执行失败"));
    }
  }
  throw new Error("文本任务超时，请稍后重试");
}
function fetchWithOptionalTimeout(_0x5b17e7, _0x29c837, _0x28a7d6, _0x94e4cb = null) {
  if (_0x94e4cb) {
    return fetchWithTimeoutWithSignal(_0x5b17e7, _0x29c837, _0x28a7d6, _0x94e4cb);
  }
  if (_0x28a7d6 === null) {
    return fetch(_0x5b17e7, _0x29c837);
  }
  return fetchWithTimeout(_0x5b17e7, _0x29c837, _0x28a7d6);
}
async function sendGenerateTextRequest(_0x4327d9, _0x3b898a, _0x1c310b = null) {
  const _0x2dd87f = _0x4327d9.isProxy ? buildApiUrl(_0x4327d9.url) : _0x4327d9.url;
  const _0x18024b = _0x4327d9.isProxy && _0x4327d9.body && typeof _0x4327d9.body === "object" && !Array.isArray(_0x4327d9.body) ? {
    ..._0x4327d9.body
  } : _0x4327d9.body;
  if (_0x4327d9.isProxy && _0x18024b && typeof _0x18024b === "object" && !Array.isArray(_0x18024b)) {
    if (_0x3b898a === null) {
      _0x18024b.disableRequestTimeout = true;
    } else if (_0x3b898a !== GENERATION_TIMEOUT) {
      _0x18024b.requestTimeoutMs = _0x3b898a;
    }
  }
  return await fetchWithOptionalTimeout(_0x2dd87f, {
    method: "POST",
    headers: _0x4327d9.headers,
    body: JSON.stringify(_0x18024b)
  }, _0x3b898a, _0x1c310b);
}
function createGeneratedTextResult(_0xebf333, _0x4924b4 = null, _0x1f68be = null, _0x28be99 = "") {
  const _0x278998 = String(_0x28be99 || "").trim();
  return {
    text: sanitizeGeneratedText(_0xebf333),
    ...(_0x4924b4 ? {
      structuredOutputFallback: _0x4924b4
    } : {}),
    ...(_0x1f68be ? {
      transportTiming: _0x1f68be
    } : {}),
    ...(_0x278998 ? {
      finishReason: _0x278998
    } : {})
  };
}
function getGeneratedTextFinishReason(_0x4672c5) {
  return String(_0x4672c5?.finishReason || _0x4672c5?.finish_reason || _0x4672c5?.choices?.[0]?.finish_reason || _0x4672c5?.data?.choices?.[0]?.finish_reason || _0x4672c5?.candidates?.[0]?.finishReason || _0x4672c5?.data?.candidates?.[0]?.finishReason || _0x4672c5?.output?.at?.(-1)?.status || _0x4672c5?.data?.output?.at?.(-1)?.status || "").trim();
}
function getTextTransportTimeMs() {
  if (typeof globalThis.performance?.now === "function") {
    return globalThis.performance.now();
  } else {
    return Date.now();
  }
}
export async function generateText(_0x34fbb2) {
  const _0x3ca743 = _0x34fbb2?.model || "gemini-3.1-pro";
  const _0x2f433e = resolveTextExecution(_0x34fbb2, _0x3ca743);
  if (isCliTextRuntimeExecution(_0x2f433e)) {
    return generateCliRuntimeText(_0x34fbb2, _0x2f433e);
  }
  let _0x42affc = await buildGenerateTextRequest(_0x34fbb2);
  const _0x27eca6 = resolveTextProviderId(_0x34fbb2, _0x3ca743, _0x2f433e);
  const _0x318ec3 = resolveGenerationTimeoutMs(_0x34fbb2);
  let _0x4fb146 = null;
  const _0x36df46 = getTextTransportTimeMs();
  let _0x4aa36c = _0x36df46;
  let _0x3b9bac = _0x36df46;
  let _0x297fa5 = _0x36df46;
  const _0x2bb88f = () => ({
    responseHeadersMs: Math.max(0, _0x4aa36c - _0x36df46),
    responseBodyMs: Math.max(0, _0x297fa5 - _0x3b9bac),
    totalMs: Math.max(0, getTextTransportTimeMs() - _0x36df46)
  });
  let _0x459685;
  try {
    _0x459685 = await sendGenerateTextRequest(_0x42affc, _0x318ec3, _0x34fbb2?.signal);
    _0x4aa36c = getTextTransportTimeMs();
  } catch (_0x2e6be6) {
    throw parseNetworkError(_0x27eca6, _0x2e6be6, _0x318ec3);
  }
  let _0x3737a0 = "";
  if (!_0x459685.ok) {
    _0x3737a0 = await _0x459685.text().catch(() => "");
    if (shouldFallbackTextStructuredOutput(_0x42affc.structuredOutput, _0x459685.status)) {
      _0x4fb146 = {
        mode: "prompt",
        status: Number(_0x459685.status) || 0
      };
      _0x42affc = await buildGenerateTextRequest({
        ..._0x34fbb2,
        structuredOutput: null
      });
      try {
        _0x459685 = await sendGenerateTextRequest(_0x42affc, _0x318ec3, _0x34fbb2?.signal);
        _0x4aa36c = getTextTransportTimeMs();
      } catch (_0x3fefc1) {
        throw parseNetworkError(_0x27eca6, _0x3fefc1, _0x318ec3);
      }
      _0x3737a0 = _0x459685.ok ? "" : await _0x459685.text().catch(() => "");
    }
  }
  if (!_0x459685.ok) {
    let _0x56149f;
    try {
      _0x56149f = JSON.parse(_0x3737a0);
    } catch {
      _0x56149f = {
        error: _0x3737a0
      };
    }
    throw parseError(_0x27eca6, _0x56149f, _0x459685.status);
  }
  _0x3b9bac = getTextTransportTimeMs();
  const _0xfe2bb3 = await _0x459685.text();
  _0x297fa5 = getTextTransportTimeMs();
  if (isRunningHubTextModel(_0x27eca6, _0x34fbb2.model)) {
    const _0x774edd = parseRunningHubResponseData(_0xfe2bb3);
    const _0x23eb6b = Number(_0x774edd?.code);
    if (Number.isFinite(_0x23eb6b) && _0x23eb6b !== 0) {
      throw new Error(getRunningHubTextErrorMessage(_0x774edd, "文本任务创建失败"));
    }
    const _0x4508c2 = extractTextContent(_0x774edd, _0x42affc.responseMapping);
    if (_0x4508c2) {
      return createGeneratedTextResult(_0x4508c2, _0x4fb146, _0x2bb88f(), getGeneratedTextFinishReason(_0x774edd));
    }
    let _0x4cdac2 = _0x774edd;
    const _0x30d78e = String(_0x774edd?.status || _0x774edd?.data?.status || "").toUpperCase();
    const _0x2e3ac6 = isChatCompletionResponse(_0x774edd) ? "" : getRunningHubTaskId(_0x774edd);
    if (["RUNNING", "PENDING", "QUEUED", "SUBMITTED"].includes(_0x30d78e) || _0x2e3ac6 && !["SUCCESS", "SUCCEEDED", "COMPLETED"].includes(_0x30d78e)) {
      if (!_0x2e3ac6) {
        throw new Error("RunningHUB 文本任务创建成功但未返回 taskId");
      }
      _0x4cdac2 = await pollRunningHubTextTask(_0x2e3ac6, _0x42affc.body.apiKey, _0x27eca6, resolveRunningHubModelApiProfileId(resolveTextExecution(_0x34fbb2, _0x34fbb2.model)?.modelManifest?.modelId || _0x34fbb2.model, _0x34fbb2?.providerProfileId), _0x318ec3, _0x34fbb2?.signal);
    } else if (["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(_0x30d78e)) {
      throw new Error(getRunningHubTextErrorMessage(_0x774edd, "文本任务创建失败"));
    }
    const _0x11eb23 = extractTextContent(_0x4cdac2, _0x42affc.responseMapping);
    if (!_0x11eb23) {
      throw new ApiError({
        type: "PARSE_ERROR",
        provider: _0x27eca6,
        message: "RunningHUB 未返回文本内容",
        raw: _0x4cdac2,
        retryable: false
      });
    }
    return createGeneratedTextResult(_0x11eb23, _0x4fb146, _0x2bb88f(), getGeneratedTextFinishReason(_0x4cdac2));
  }
  const _0xe45f33 = parseTextResponse(_0xfe2bb3, _0x459685.status);
  const _0x29a482 = extractTextContent(_0xe45f33, _0x42affc.responseMapping);
  if (!_0x29a482) {
    throw new ApiError({
      type: "PARSE_ERROR",
      provider: _0x27eca6,
      message: "服务端未返回文本内容",
      raw: _0xe45f33,
      retryable: false
    });
  }
  return createGeneratedTextResult(_0x29a482, _0x4fb146, _0x2bb88f(), getGeneratedTextFinishReason(_0xe45f33));
}