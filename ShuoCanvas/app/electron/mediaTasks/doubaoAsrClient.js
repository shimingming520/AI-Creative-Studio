import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
export const DOUBAO_ASR_RESOURCE_ID = "volc.seedasr.auc";
export const DOUBAO_ASR_DEFAULT_BASE_URL = "https://openspeech.bytedance.com/api/v3/auc/bigmodel";
const DOUBAO_ASR_DEFAULT_POLL_INTERVAL_MS = 2000;
const DOUBAO_ASR_DEFAULT_TIMEOUT_MS = 600000;
const DOUBAO_ASR_INVALID_KEY_MESSAGE = "火山语音 ASR Key 无效或无权限。请在设置 > API Key > 火山语音填写语音服务的 X-Api-Key，不要使用火山方舟 Key，并确认已开通录音文件识别。";
const DOUBAO_ASR_PERMISSION_MESSAGE = "火山语音 ASR Key 没有录音文件识别权限。请确认火山语音服务已开通，并给该 X-Api-Key 开启 ASR 访问权限。";
function firstText(..._0x1ffe0c) {
  for (const _0xfe0e3a of _0x1ffe0c) {
    if (_0xfe0e3a == null) {
      continue;
    }
    const _0x571c64 = String(_0xfe0e3a).trim();
    if (_0x571c64) {
      return _0x571c64;
    }
  }
  return "";
}
function normalizeBaseUrl(_0x1c6525 = "") {
  const _0x1e684 = String(_0x1c6525 || DOUBAO_ASR_DEFAULT_BASE_URL).trim();
  const _0x3355ac = _0x1e684 || DOUBAO_ASR_DEFAULT_BASE_URL;
  return _0x3355ac.replace(/\/+$/, "").replace(/\/submit$/i, "").replace(/\/query$/i, "");
}
function normalizePositiveMs(_0x37ac0d, _0x1eadae) {
  const _0x28a832 = Number(_0x37ac0d);
  if (!Number.isFinite(_0x28a832) || _0x28a832 <= 0) {
    return _0x1eadae;
  }
  return Math.max(1, Math.round(_0x28a832));
}
function normalizeAsrTimeMs(_0x3bd7c6, _0x20cc58 = 0) {
  const _0x39b129 = Number(_0x3bd7c6);
  if (!Number.isFinite(_0x39b129) || _0x39b129 < 0) {
    return 0;
  }
  if (_0x20cc58 > 0 && _0x39b129 <= _0x20cc58 / 1000 + 5) {
    return Math.max(0, Math.round(_0x39b129 * 1000));
  }
  return Math.max(0, Math.round(_0x39b129));
}
function normalizeSpeakerLabel(_0x1cfc7b) {
  if (_0x1cfc7b == null) {
    return "";
  }
  return String(_0x1cfc7b).trim();
}
function parseJsonText(_0x2eed3a = "") {
  const _0x3409d7 = String(_0x2eed3a || "").trim();
  if (!_0x3409d7) {
    return {};
  }
  try {
    return JSON.parse(_0x3409d7);
  } catch {
    return {};
  }
}
function extractResultPayload(_0xf70825 = {}) {
  if (!_0xf70825 || typeof _0xf70825 !== "object") {
    return {};
  }
  const _0x5920e3 = _0xf70825.data && typeof _0xf70825.data === "object" ? _0xf70825.data : {};
  if (_0xf70825.result && typeof _0xf70825.result === "object") {
    return _0xf70825.result;
  }
  if (_0x5920e3.result && typeof _0x5920e3.result === "object") {
    return _0x5920e3.result;
  }
  if (_0x5920e3.utterances || _0x5920e3.text || _0x5920e3.segments) {
    return _0x5920e3;
  }
  return _0xf70825;
}
function readHeader(_0x47f514, _0x5dec52) {
  if (!_0x47f514) {
    return "";
  }
  if (typeof _0x47f514.get === "function") {
    return String(_0x47f514.get(_0x5dec52) || "").trim();
  }
  const _0xfa1c96 = String(_0x5dec52 || "").toLowerCase();
  const _0x334816 = Object.keys(_0x47f514 || {}).find(_0x4a3277 => _0x4a3277.toLowerCase() === _0xfa1c96);
  if (_0x334816) {
    return String(_0x47f514[_0x334816] || "").trim();
  } else {
    return "";
  }
}
function isSuccessPayload(_0x1f3d9c = {}) {
  const _0x1bbe54 = String(_0x1f3d9c?.status || _0x1f3d9c?.message || _0x1f3d9c?.code || "").toLowerCase();
  if (_0x1bbe54 === "success" || _0x1bbe54 === "succeeded" || _0x1bbe54 === "done") {
    return true;
  }
  const _0x374b94 = extractResultPayload(_0x1f3d9c);
  return !!_0x374b94?.utterances || !!_0x374b94?.segments || !!_0x374b94?.text;
}
function isFailureStatus(_0x505c47 = "") {
  return /fail|error|invalid|denied|forbid|unauthor|expired/i.test(String(_0x505c47 || ""));
}
function sanitizeErrorMessage(_0x1f9ac9 = "") {
  const _0x84f897 = String(_0x1f9ac9 || "").trim();
  if (!_0x84f897) {
    return "Doubao ASR request failed";
  }
  if (_0x84f897 === DOUBAO_ASR_INVALID_KEY_MESSAGE || _0x84f897 === DOUBAO_ASR_PERMISSION_MESSAGE) {
    return _0x84f897;
  }
  const _0x3d2ada = _0x84f897.replace(/Bearer\s+[A-Za-z0-9._~-]+/g, "Bearer ***").replace(/(X-Api-Key["':\s]+)[A-Za-z0-9._~-]+/gi, "$1***").replace(/(X-Api-Access-Key["':\s]+)[A-Za-z0-9._~-]+/gi, "$1***");
  if (/invalid\s+x-api-key|x-api-key\s+invalid|api\s*key\s+invalid/i.test(_0x3d2ada)) {
    return DOUBAO_ASR_INVALID_KEY_MESSAGE;
  }
  if (/(?:permission|denied|forbid|unauthor|not\s+authorized|no\s+access|无权限|未授权|鉴权)/i.test(_0x3d2ada)) {
    return DOUBAO_ASR_PERMISSION_MESSAGE;
  }
  return _0x3d2ada;
}
function buildAuthHeaders(_0x2e5a5a = {}) {
  const _0x1b9ccf = firstText(_0x2e5a5a.apiKey, _0x2e5a5a.volcengineApiKey);
  if (_0x1b9ccf) {
    return {
      "X-Api-Key": _0x1b9ccf
    };
  }
  const _0x219761 = firstText(_0x2e5a5a.appKey, _0x2e5a5a.apiAppKey);
  const _0x206c1a = firstText(_0x2e5a5a.accessKey, _0x2e5a5a.apiAccessKey);
  if (_0x219761 && _0x206c1a) {
    return {
      "X-Api-App-Key": _0x219761,
      "X-Api-Access-Key": _0x206c1a
    };
  }
  throw new Error("火山语音 ASR Key 未配置或无权限");
}
export function buildDoubaoAsrSubmitBody({
  audioBase64 = "",
  uid = "ai-canvas"
} = {}) {
  return {
    user: {
      uid: String(uid || "ai-canvas")
    },
    audio: {
      data: String(audioBase64 || ""),
      format: "mp3",
      codec: "mp3",
      rate: 16000
    },
    request: {
      model_name: "bigmodel",
      show_utterances: true,
      enable_speaker_info: true,
      enable_itn: true,
      enable_punc: true,
      enable_ddc: false
    }
  };
}
export function buildDoubaoAsrHeaders({
  credentials = {},
  requestId = "",
  resourceId = DOUBAO_ASR_RESOURCE_ID
} = {}) {
  const _0xbc8fee = String(requestId || randomUUID()).trim();
  return {
    "Content-Type": "application/json",
    "X-Api-Resource-Id": String(resourceId || DOUBAO_ASR_RESOURCE_ID),
    "X-Api-Request-Id": _0xbc8fee,
    "X-Api-Sequence": "-1",
    ...buildAuthHeaders(credentials)
  };
}
async function postDoubaoJson({
  body = {},
  fetchImpl: _0x1cf078,
  headers = {},
  timeoutMs = 30000,
  url = ""
} = {}) {
  if (typeof _0x1cf078 !== "function") {
    throw new Error("fetch is unavailable");
  }
  const _0x32b24e = typeof AbortController === "function" ? new AbortController() : null;
  const _0x30d892 = _0x32b24e ? setTimeout(() => _0x32b24e.abort(), normalizePositiveMs(timeoutMs, 30000)) : null;
  try {
    const _0x1b8695 = await _0x1cf078(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body || {}),
      signal: _0x32b24e?.signal
    });
    const _0x4da58c = typeof _0x1b8695?.text === "function" ? await _0x1b8695.text() : "";
    const _0x5e56e4 = parseJsonText(_0x4da58c);
    const _0x2eaf9e = firstText(readHeader(_0x1b8695?.headers, "x-api-status"), readHeader(_0x1b8695?.headers, "X-Api-Status"), _0x5e56e4.status, _0x5e56e4.message);
    const _0x49e34 = firstText(readHeader(_0x1b8695?.headers, "x-api-message"), readHeader(_0x1b8695?.headers, "X-Api-Message"), _0x5e56e4.message, _0x5e56e4.error?.message, _0x5e56e4.error);
    if (!_0x1b8695?.ok) {
      throw new Error(sanitizeErrorMessage(_0x49e34 || "Doubao ASR HTTP " + (_0x1b8695?.status || "error")));
    }
    if (isFailureStatus(_0x2eaf9e)) {
      throw new Error(sanitizeErrorMessage(_0x49e34 || _0x2eaf9e));
    }
    if (_0x5e56e4 && typeof _0x5e56e4 === "object" && _0x5e56e4.code && Number(_0x5e56e4.code) !== 0) {
      throw new Error(sanitizeErrorMessage(_0x49e34 || _0x5e56e4.message || _0x5e56e4.code));
    }
    return {
      apiMessage: _0x49e34,
      apiStatus: _0x2eaf9e,
      data: _0x5e56e4
    };
  } catch (_0x207e68) {
    const _0x2e5990 = String(_0x207e68?.name || "") === "AbortError" ? "Doubao ASR request timed out" : _0x207e68?.message || _0x207e68;
    throw new Error(sanitizeErrorMessage(_0x2e5990));
  } finally {
    if (_0x30d892) {
      clearTimeout(_0x30d892);
    }
  }
}
function getWordsText(_0x3a1cb0 = []) {
  if (!Array.isArray(_0x3a1cb0)) {
    return "";
  }
  return _0x3a1cb0.map(_0x54be35 => firstText(_0x54be35?.text, _0x54be35?.word)).filter(Boolean).join("");
}
export function normalizeDoubaoAsrSegments(_0x14125f = {}, _0x14a093 = 0) {
  const _0x32bbf1 = Math.max(0, Math.round(Number(_0x14a093 || 0) * 1000));
  const _0x52cd05 = extractResultPayload(_0x14125f);
  const _0x4a1492 = Array.isArray(_0x52cd05?.utterances) ? _0x52cd05.utterances : Array.isArray(_0x52cd05?.segments) ? _0x52cd05.segments : Array.isArray(_0x14125f?.segments) ? _0x14125f.segments : [];
  const _0x7cb023 = [];
  for (const _0x4b5a6f of _0x4a1492) {
    if (!_0x4b5a6f || typeof _0x4b5a6f !== "object") {
      continue;
    }
    const _0x3fdeec = normalizeAsrTimeMs(_0x4b5a6f.startMs ?? _0x4b5a6f.start_time ?? _0x4b5a6f.startTime ?? _0x4b5a6f.start, _0x32bbf1);
    const _0x735695 = normalizeAsrTimeMs(_0x4b5a6f.endMs ?? _0x4b5a6f.end_time ?? _0x4b5a6f.endTime ?? _0x4b5a6f.end, _0x32bbf1);
    if (_0x735695 <= _0x3fdeec) {
      continue;
    }
    const _0xb1179f = firstText(_0x4b5a6f.sourceText, _0x4b5a6f.text, _0x4b5a6f.utterance, getWordsText(_0x4b5a6f.words));
    const _0x178b6d = normalizeSpeakerLabel(_0x4b5a6f.speaker ?? _0x4b5a6f.speaker_id ?? _0x4b5a6f.speakerId ?? _0x4b5a6f.speaker_info?.speaker_id ?? _0x4b5a6f.speaker_info?.speakerId ?? _0x4b5a6f.speaker_info?.speaker);
    const _0x510408 = {
      startMs: _0x3fdeec,
      endMs: _0x735695,
      sourceText: _0xb1179f
    };
    if (_0x178b6d) {
      _0x510408.speaker = _0x178b6d;
    }
    _0x7cb023.push(_0x510408);
  }
  if (!_0x7cb023.length) {
    const _0x4ba7e4 = firstText(_0x52cd05?.text, _0x14125f?.text);
    if (_0x4ba7e4 && _0x32bbf1 > 0) {
      _0x7cb023.push({
        startMs: 0,
        endMs: _0x32bbf1,
        sourceText: _0x4ba7e4
      });
    }
  }
  return _0x7cb023.sort((_0x179604, _0x21e49c) => _0x179604.startMs - _0x21e49c.startMs);
}
export async function runDoubaoAsrTranscription({
  audioAbs = "",
  credentials = {},
  durationSec = 0,
  fetchImpl = globalThis.fetch,
  pollIntervalMs = DOUBAO_ASR_DEFAULT_POLL_INTERVAL_MS,
  queue: _0x2d8a69,
  readFile = readFileSync,
  requestId = "",
  resourceId = DOUBAO_ASR_RESOURCE_ID,
  sleep = _0xa8d5f0 => new Promise(_0x1b4883 => setTimeout(_0x1b4883, _0xa8d5f0)),
  task: _0x57b6f5,
  timeoutMs = DOUBAO_ASR_DEFAULT_TIMEOUT_MS
} = {}) {
  const _0x3b7d9f = normalizeBaseUrl(credentials.baseUrl || credentials.apiUrl);
  const _0x288643 = String(requestId || randomUUID()).trim();
  const _0x1fdb37 = buildDoubaoAsrHeaders({
    credentials: credentials,
    requestId: _0x288643,
    resourceId: resourceId
  });
  const _0x591235 = readFile(audioAbs).toString("base64");
  const _0x547b99 = Date.now();
  const _0x4ead30 = normalizePositiveMs(timeoutMs, DOUBAO_ASR_DEFAULT_TIMEOUT_MS);
  const _0x3c57be = normalizePositiveMs(pollIntervalMs, DOUBAO_ASR_DEFAULT_POLL_INTERVAL_MS);
  _0x2d8a69?.emitProgress?.(_0x57b6f5, 0.16, "Submitting Doubao subtitle recognition", {
    stage: "transcribe"
  });
  const _0xe72a7d = await postDoubaoJson({
    body: buildDoubaoAsrSubmitBody({
      audioBase64: _0x591235
    }),
    fetchImpl: fetchImpl,
    headers: _0x1fdb37,
    timeoutMs: 60000,
    url: _0x3b7d9f + "/submit"
  });
  if (isSuccessPayload(_0xe72a7d.data) || String(_0xe72a7d.apiStatus).toLowerCase() === "success") {
    const _0xeb284e = normalizeDoubaoAsrSegments(_0xe72a7d.data, durationSec);
    return {
      raw: _0xe72a7d.data,
      segments: _0xeb284e
    };
  }
  let _0x5dfcde = 0.22;
  while (Date.now() - _0x547b99 <= _0x4ead30) {
    _0x2d8a69?.throwIfCancelled?.(_0x57b6f5);
    await sleep(_0x3c57be);
    _0x5dfcde = Math.min(0.52, _0x5dfcde + 0.035);
    _0x2d8a69?.emitProgress?.(_0x57b6f5, _0x5dfcde, "Recognizing subtitles with Doubao", {
      stage: "transcribe"
    });
    const _0x24a8f0 = await postDoubaoJson({
      body: {},
      fetchImpl: fetchImpl,
      headers: _0x1fdb37,
      timeoutMs: 30000,
      url: _0x3b7d9f + "/query"
    });
    if (isSuccessPayload(_0x24a8f0.data) || String(_0x24a8f0.apiStatus).toLowerCase() === "success") {
      const _0x223cba = normalizeDoubaoAsrSegments(_0x24a8f0.data, durationSec);
      return {
        raw: _0x24a8f0.data,
        segments: _0x223cba
      };
    }
    if (isFailureStatus(_0x24a8f0.apiStatus)) {
      throw new Error(sanitizeErrorMessage(_0x24a8f0.apiMessage || _0x24a8f0.apiStatus));
    }
  }
  throw new Error("Doubao ASR recognition timed out");
}