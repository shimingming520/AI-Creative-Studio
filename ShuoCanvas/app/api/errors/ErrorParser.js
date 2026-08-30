import * as a73_0x2b4c1c from "./parsers/PpioErrorParser.js";
import * as a73_0x1bdff9 from "./parsers/ApimartErrorParser.js";
import * as a73_0x4b9a6b from "./parsers/RunningHubErrorParser.js";
import * as a73_0x4580de from "./parsers/RunningHubModelErrorParser.js";
import * as a73_0x320bbe from "./parsers/GrsaiErrorParser.js";
import * as a73_0x57cc2b from "./parsers/AgnesErrorParser.js";
import * as a73_0x58f359 from "./parsers/ComfyUiErrorParser.js";
import * as a73_0x250d47 from "./parsers/VolcengineSpeechErrorParser.js";
import * as a73_0x5676e1 from "./parsers/VolcengineErrorParser.js";
import { ApiError, ErrorType } from "./ApiError.js";
const PARSERS = {
  ppio: a73_0x2b4c1c,
  apimart: a73_0x1bdff9,
  runninghub: a73_0x4580de,
  runninghubwf: a73_0x4b9a6b,
  grsai: a73_0x320bbe,
  agnes: a73_0x57cc2b,
  comfyui: a73_0x58f359,
  "volcengine-speech": a73_0x250d47,
  volcengine: a73_0x5676e1,
  "ppio/gemini": a73_0x2b4c1c,
  "runninghub-model": a73_0x4580de
};
function getParser(_0x199c9a) {
  if (!_0x199c9a) {
    return null;
  }
  const _0x5b8a79 = _0x199c9a.toLowerCase().trim();
  return PARSERS[_0x5b8a79] || null;
}
function isPlainObject(_0x134311) {
  return !!_0x134311 && typeof _0x134311 === "object" && !Array.isArray(_0x134311);
}
function stringifyErrorValue(_0x2dd5a9) {
  if (_0x2dd5a9 === undefined || _0x2dd5a9 === null) {
    return "";
  }
  if (typeof _0x2dd5a9 === "string") {
    return _0x2dd5a9;
  }
  if (typeof _0x2dd5a9 === "number" || typeof _0x2dd5a9 === "boolean") {
    return String(_0x2dd5a9);
  }
  if (isPlainObject(_0x2dd5a9)) {
    const _0x2e02e3 = _0x2dd5a9.message || _0x2dd5a9.errorMessage || _0x2dd5a9.error_message || _0x2dd5a9.reason || _0x2dd5a9.detail || _0x2dd5a9.details || _0x2dd5a9.msg;
    if (_0x2e02e3 !== undefined && _0x2e02e3 !== null && _0x2e02e3 !== _0x2dd5a9) {
      const _0x5b784f = stringifyErrorValue(_0x2e02e3);
      if (_0x5b784f) {
        return _0x5b784f;
      }
    }
    try {
      return JSON.stringify(_0x2dd5a9);
    } catch {
      return "";
    }
  }
  return String(_0x2dd5a9 || "");
}
function firstErrorText(..._0x421bda) {
  for (const _0x4b5ba0 of _0x421bda) {
    const _0x3b9f89 = stringifyErrorValue(_0x4b5ba0).trim();
    if (_0x3b9f89) {
      return _0x3b9f89;
    }
  }
  return "";
}
function preserveRawErrorContext(_0x3e3e4c, _0xe24b49, _0x5782e1) {
  if (!_0x3e3e4c) {
    return _0x3e3e4c;
  }
  if (_0x3e3e4c.raw === undefined) {
    _0x3e3e4c.raw = _0xe24b49;
  }
  const _0x2cf6db = Number(_0x5782e1);
  if (_0x3e3e4c.status == null && _0x5782e1 !== null && _0x5782e1 !== undefined && _0x5782e1 !== "" && Number.isFinite(_0x2cf6db)) {
    _0x3e3e4c.status = _0x2cf6db;
  }
  return _0x3e3e4c;
}
export function parseError(_0x5787ca, _0x5572fe, _0x4570bf) {
  const _0x13c82a = getParser(_0x5787ca);
  if (_0x13c82a?.parseError) {
    const _0x4184de = _0x13c82a.parseError(_0x5572fe, _0x4570bf);
    if (_0x4184de) {
      return preserveRawErrorContext(_0x4184de, _0x5572fe, _0x4570bf);
    }
    if (Number(_0x4570bf) < 400) {
      return null;
    }
  }
  return preserveRawErrorContext(parseGenericError(_0x5787ca, _0x5572fe, _0x4570bf), _0x5572fe, _0x4570bf);
}
export function parseTaskError(_0x4b0b5d, _0x35da0a) {
  const _0x348846 = getParser(_0x4b0b5d);
  if (_0x348846?.parseTaskError) {
    return _0x348846.parseTaskError(_0x35da0a);
  }
  if (_0x35da0a) {
    const _0x2c6c90 = (_0x35da0a.status || "").toLowerCase();
    if (_0x2c6c90 === "failed" || _0x2c6c90 === "error") {
      const _0x53dbac = firstErrorText(_0x35da0a.error, _0x35da0a.errorMessage, _0x35da0a.message, _0x35da0a.failure_reason, "未知错误");
      return ApiError.taskFailed(_0x4b0b5d, _0x53dbac);
    }
  }
  return null;
}
export function parseNetworkError(_0x38dc92, _0x542869, _0x247c85) {
  const _0x1873e0 = _0x542869?.message || "";
  if (_0x542869?.name === "AbortError" || _0x1873e0.includes("timeout") || _0x1873e0.includes("TIMEOUT")) {
    return ApiError.timeout(_0x38dc92, _0x247c85);
  }
  if (_0x1873e0.includes("DNS") || _0x1873e0.includes("ENOTFOUND") || _0x1873e0.includes("getaddrinfo")) {
    return new ApiError({
      type: ErrorType.DNS_ERROR,
      provider: _0x38dc92,
      message: "无法解析服务器地址，请检查网络配置",
      raw: _0x542869,
      retryable: true
    });
  }
  if (_0x1873e0.includes("Failed to fetch") || _0x1873e0.includes("NETWORK") || _0x1873e0.includes("ECONNREFUSED") || _0x1873e0.includes("ECONNRESET")) {
    return new ApiError({
      type: ErrorType.NETWORK_ERROR,
      provider: _0x38dc92,
      message: "网络连接失败，请检查网络或代理设置",
      raw: _0x542869,
      retryable: true
    });
  }
  return ApiError.networkError(_0x38dc92, _0x542869);
}
export function applyManifestErrorRules(_0x1066a9, _0x5f2118, _0xc154c2 = {}) {
  if (!_0x1066a9 || !Array.isArray(_0x5f2118) || _0x5f2118.length === 0) {
    return _0x1066a9;
  }
  const _0x3d5882 = String(_0xc154c2.phase || "any").trim().toLowerCase();
  const _0x21098d = String(_0xc154c2.provider || _0x1066a9.provider || "unknown").trim();
  const _0xbfa5f9 = Number(_0x1066a9.status ?? _0x1066a9.code);
  const _0x23aa4f = Number.isInteger(_0xbfa5f9) ? _0xbfa5f9 : null;
  const _0x4a5133 = firstErrorText(_0x1066a9.message, _0x1066a9.raw?.error?.message, _0x1066a9.raw?.error, _0x1066a9.raw?.message, _0x1066a9.raw);
  const _0x57def6 = _0x4a5133.toLocaleLowerCase();
  for (const _0xc85831 of _0x5f2118) {
    if (!_0xc85831 || typeof _0xc85831 !== "object" || Array.isArray(_0xc85831)) {
      continue;
    }
    const _0x5e2236 = String(_0xc85831.phase || "any").trim().toLowerCase();
    if (_0x5e2236 !== "any" && _0x5e2236 !== _0x3d5882) {
      continue;
    }
    const _0x415b8d = Array.isArray(_0xc85831.httpStatuses) ? _0xc85831.httpStatuses.map(Number).filter(Number.isInteger) : [];
    if (_0x415b8d.length > 0 && (_0x23aa4f === null || !_0x415b8d.includes(_0x23aa4f))) {
      continue;
    }
    const _0x480f64 = Array.isArray(_0xc85831.messageIncludesAny) ? _0xc85831.messageIncludesAny.map(_0x5731cb => String(_0x5731cb || "").trim().toLocaleLowerCase()).filter(Boolean) : [];
    if (_0x480f64.length > 0 && !_0x480f64.some(_0x1e363f => _0x57def6.includes(_0x1e363f))) {
      continue;
    }
    if (_0x415b8d.length === 0 && _0x480f64.length === 0) {
      continue;
    }
    const _0x251ba9 = String(_0xc85831.userMessage || "").trim();
    const _0x492043 = String(_0xc85831.hint || "").trim();
    const _0x4211fb = _0x251ba9 || _0x4a5133 || _0x1066a9.message || "请求失败";
    const _0x343ce1 = _0x492043 && !_0x4211fb.includes(_0x492043) ? _0x4211fb + "；" + _0x492043 : _0x4211fb;
    const _0x4f442e = new ApiError({
      type: String(_0xc85831.type || ErrorType.UNKNOWN).trim().toUpperCase(),
      provider: _0x21098d,
      code: _0x1066a9.code,
      status: _0x23aa4f ?? _0x1066a9.status,
      message: _0x343ce1,
      retryable: _0xc85831.retryable === true,
      raw: _0x1066a9.raw ?? _0x1066a9
    });
    _0x4f442e.hint = _0x492043;
    _0x4f442e.manifestRuleMatched = true;
    return _0x4f442e;
  }
  return _0x1066a9;
}
function parseGenericError(_0x66906f, _0x5a4c78, _0x562dde) {
  let _0x2a8ebd = "";
  let _0x41ac99 = _0x562dde;
  if (typeof _0x5a4c78 === "string") {
    _0x2a8ebd = _0x5a4c78;
  } else if (_0x5a4c78 && typeof _0x5a4c78 === "object") {
    _0x2a8ebd = firstErrorText(_0x5a4c78.error?.message, _0x5a4c78.error, _0x5a4c78.message, _0x5a4c78.errorMessage, _0x5a4c78.error_message, _0x5a4c78.failure_reason, _0x5a4c78.reason, _0x5a4c78);
    _0x41ac99 = _0x5a4c78.code || _0x5a4c78.error?.code || _0x5a4c78.errorCode || _0x5a4c78.error_code || _0x562dde;
  }
  const _0x2a1ded = String(_0x2a8ebd).toUpperCase();
  if (_0x2a1ded.includes("BALANCE") || _0x2a1ded.includes("余额") || _0x2a1ded.includes("QUOTA")) {
    return ApiError.insufficientBalance(_0x66906f, _0x41ac99);
  }
  if (_0x2a1ded.includes("RATE") || _0x2a1ded.includes("LIMIT") || _0x562dde === 429) {
    return ApiError.rateLimit(_0x66906f, _0x41ac99);
  }
  if (_0x2a1ded.includes("AUTH") || _0x2a1ded.includes("KEY") || _0x562dde === 401) {
    return ApiError.authError(_0x66906f, _0x41ac99, _0x2a8ebd);
  }
  if (_0x2a1ded.includes("CONTENT") || _0x2a1ded.includes("FILTER") || _0x2a1ded.includes("SAFETY")) {
    return ApiError.contentFiltered(_0x66906f, _0x2a8ebd);
  }
  if (_0x562dde >= 400) {
    return ApiError.fromHttpStatus(_0x562dde, _0x66906f, _0x2a8ebd);
  }
  return new ApiError({
    type: ErrorType.UNKNOWN,
    provider: _0x66906f,
    code: _0x41ac99,
    message: _0x2a8ebd || "未知错误",
    status: _0x562dde
  });
}
export function parseBatchErrors(_0x4982ad, _0x487284) {
  return _0x487284.map((_0x500a4b, _0x4c2039) => {
    if (_0x500a4b.success) {
      return null;
    }
    const _0x1b6a44 = parseError(_0x4982ad, _0x500a4b.error, _0x500a4b.status);
    _0x1b6a44.batchIndex = _0x4c2039;
    return _0x1b6a44;
  }).filter(Boolean);
}
export default {
  parseError: parseError,
  parseTaskError: parseTaskError,
  parseNetworkError: parseNetworkError,
  applyManifestErrorRules: applyManifestErrorRules,
  parseBatchErrors: parseBatchErrors
};