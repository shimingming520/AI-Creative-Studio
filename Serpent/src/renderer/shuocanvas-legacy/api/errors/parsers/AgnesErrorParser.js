import { ApiError, ErrorType } from "../ApiError.js";
const PROVIDER = "agnes";
const AGNES_SERVICE_BUSY_MESSAGE = "Agnes AI 服务繁忙，请稍后重试";
const AGNES_HTTP_STATUS_MAP = {
  400: {
    type: ErrorType.INVALID_PARAMS,
    message: "请求参数错误，请检查提示词、图片 URL 和视频参数",
    retryable: false
  },
  401: {
    type: ErrorType.AUTH_ERROR,
    message: "API Key 无效或未授权，请检查 Agnes AI 配置",
    retryable: false
  },
  404: {
    type: ErrorType.INVALID_PARAMS,
    message: "任务不存在或已过期，请重新提交生成任务",
    retryable: false
  },
  500: {
    type: ErrorType.SERVER_ERROR,
    message: "Agnes AI 服务器内部错误，请稍后重试",
    retryable: true
  },
  503: {
    type: ErrorType.SERVICE_UNAVAILABLE,
    message: AGNES_SERVICE_BUSY_MESSAGE,
    retryable: true
  }
};
function isPlainObject(_0x10e811) {
  return !!_0x10e811 && typeof _0x10e811 === "object" && !Array.isArray(_0x10e811);
}
function stringifyErrorValue(_0x4e1479) {
  if (_0x4e1479 === undefined || _0x4e1479 === null) {
    return "";
  }
  if (typeof _0x4e1479 === "string") {
    return _0x4e1479;
  }
  if (typeof _0x4e1479 === "number" || typeof _0x4e1479 === "boolean") {
    return String(_0x4e1479);
  }
  if (isPlainObject(_0x4e1479)) {
    const _0x5e0617 = _0x4e1479.message || _0x4e1479.errorMessage || _0x4e1479.error_message || _0x4e1479.reason || _0x4e1479.detail || _0x4e1479.details || _0x4e1479.msg;
    if (_0x5e0617 !== undefined && _0x5e0617 !== null && _0x5e0617 !== _0x4e1479) {
      const _0x554fc3 = stringifyErrorValue(_0x5e0617);
      if (_0x554fc3) {
        return _0x554fc3;
      }
    }
    try {
      return JSON.stringify(_0x4e1479);
    } catch {
      return "";
    }
  }
  return String(_0x4e1479 || "");
}
function firstErrorText(..._0x5ca8cf) {
  for (const _0x2d463b of _0x5ca8cf) {
    const _0x3f7734 = stringifyErrorValue(_0x2d463b).trim();
    if (_0x3f7734) {
      return _0x3f7734;
    }
  }
  return "";
}
function extractErrorMessage(_0x29fa8a) {
  return firstErrorText(_0x29fa8a?.error?.message, _0x29fa8a?.error, _0x29fa8a?.message, _0x29fa8a?.errorMessage, _0x29fa8a?.error_message, _0x29fa8a?.failure_reason, _0x29fa8a?.reason, _0x29fa8a?.detail, _0x29fa8a);
}
function extractErrorCode(_0x58dcbb, _0xa7fb24) {
  return _0x58dcbb?.error?.code ?? _0x58dcbb?.code ?? _0x58dcbb?.errorCode ?? _0x58dcbb?.error_code ?? _0xa7fb24;
}
function hasServiceUnavailableHint(_0x14f534, _0x27204b, _0x40e976) {
  const _0x10f498 = String(_0x14f534 || "").toUpperCase();
  const _0x2d55f2 = String(_0x27204b ?? "").trim().toUpperCase();
  const _0x2ebd42 = String(_0x40e976 ?? "").trim();
  return _0x2ebd42 === "503" || _0x2d55f2 === "503" || _0x10f498.includes("SERVICE BUSY") || _0x10f498.includes("SERVICEUNAVAILABLE") || _0x10f498.includes("SERVICE UNAVAILABLE") || _0x10f498.includes("SERVER_ERROR") && _0x10f498.includes("503") || _0x10f498.includes("SERVICE") && _0x10f498.includes("503");
}
function buildServiceUnavailableError(_0x4c2dc0, _0x5a00ec, _0x488f44, _0x3a289d) {
  if (!hasServiceUnavailableHint(_0x4c2dc0, _0x5a00ec, _0x3a289d)) {
    return null;
  }
  const _0x416e12 = _0x5a00ec ?? _0x3a289d ?? 503;
  const _0x48383a = Number(_0x3a289d ?? _0x416e12) === 503 ? 503 : _0x3a289d;
  return new ApiError({
    type: ErrorType.SERVICE_UNAVAILABLE,
    provider: PROVIDER,
    code: _0x416e12,
    status: _0x48383a,
    message: AGNES_SERVICE_BUSY_MESSAGE,
    raw: _0x488f44,
    retryable: true
  });
}
function buildKeywordError(_0x1a049d, _0x5ddc3e, _0x20e1d3, _0x120dd8) {
  const _0x25abfa = buildServiceUnavailableError(_0x1a049d, _0x5ddc3e, _0x20e1d3, _0x120dd8);
  if (_0x25abfa) {
    return _0x25abfa;
  }
  const _0x11897b = String(_0x1a049d || "").toUpperCase();
  if (_0x11897b.includes("BALANCE") || _0x11897b.includes("QUOTA")) {
    return ApiError.insufficientBalance(PROVIDER, _0x5ddc3e);
  }
  if (_0x11897b.includes("RATE") || _0x11897b.includes("LIMIT")) {
    return ApiError.rateLimit(PROVIDER, _0x5ddc3e);
  }
  if (_0x11897b.includes("AUTH") || _0x11897b.includes("UNAUTHORIZED") || _0x11897b.includes("API KEY") || _0x11897b.includes("API_KEY")) {
    return ApiError.authError(PROVIDER, _0x5ddc3e, _0x1a049d);
  }
  if (_0x11897b.includes("CONTENT") || _0x11897b.includes("SAFETY") || _0x11897b.includes("FILTER") || _0x11897b.includes("POLICY")) {
    return ApiError.contentFiltered(PROVIDER, _0x1a049d);
  }
  return null;
}
function extractTaskStatus(_0x14e4a6) {
  const _0xc94c22 = Array.isArray(_0x14e4a6?.data) ? _0x14e4a6.data[0] : null;
  return String(_0x14e4a6?.status || _0x14e4a6?.taskStatus || _0x14e4a6?.task_status || _0x14e4a6?.data?.status || _0x14e4a6?.data?.taskStatus || _0x14e4a6?.data?.task_status || _0x14e4a6?.output?.status || _0x14e4a6?.output?.taskStatus || _0x14e4a6?.output?.task_status || _0xc94c22?.status || _0xc94c22?.taskStatus || _0xc94c22?.task_status || "").trim().toLowerCase();
}
export function parseError(_0x2f36cb, _0x3f9b6f) {
  if (!_0x2f36cb && _0x3f9b6f < 400) {
    return null;
  }
  const _0x16ab9d = extractErrorMessage(_0x2f36cb);
  const _0x4c1693 = extractErrorCode(_0x2f36cb, _0x3f9b6f);
  const _0x31930c = buildKeywordError(_0x16ab9d, _0x4c1693, _0x2f36cb, _0x3f9b6f);
  if (_0x31930c) {
    return _0x31930c;
  }
  const _0xc55fff = AGNES_HTTP_STATUS_MAP[_0x3f9b6f];
  if (_0xc55fff) {
    return new ApiError({
      type: _0xc55fff.type,
      provider: PROVIDER,
      code: _0x4c1693,
      status: _0x3f9b6f,
      message: _0x16ab9d || _0xc55fff.message,
      raw: _0x2f36cb,
      retryable: _0xc55fff.retryable
    });
  }
  if (_0x3f9b6f >= 400) {
    return ApiError.fromHttpStatus(_0x3f9b6f, PROVIDER, _0x16ab9d);
  }
  return null;
}
export function parseTaskError(_0x1f34ef) {
  if (!_0x1f34ef) {
    return null;
  }
  const _0x47bd0e = extractTaskStatus(_0x1f34ef);
  if (_0x47bd0e !== "failed" && _0x47bd0e !== "fail" && _0x47bd0e !== "error") {
    return null;
  }
  const _0x37d11d = extractErrorMessage(_0x1f34ef) || firstErrorText(_0x1f34ef?.output?.error, _0x1f34ef?.output?.message) || "未知错误";
  const _0x341d32 = extractErrorCode(_0x1f34ef);
  const _0x13c46f = buildServiceUnavailableError(_0x37d11d, _0x341d32, _0x1f34ef);
  if (_0x13c46f) {
    return _0x13c46f;
  }
  return ApiError.taskFailed(PROVIDER, _0x37d11d);
}
export default {
  parseError: parseError,
  parseTaskError: parseTaskError
};