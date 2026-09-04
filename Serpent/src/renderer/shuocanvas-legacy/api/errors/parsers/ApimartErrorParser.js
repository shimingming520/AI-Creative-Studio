import { ApiError, ErrorType } from "../ApiError.js";
const APIMART_HTTP_STATUS_MAP = {
  400: {
    type: ErrorType.INVALID_PARAMS,
    message: "无效的请求参数：请检查请求参数是否正确",
    retryable: false
  },
  401: {
    type: ErrorType.AUTH_ERROR,
    message: "认证失败：请检查 API Key 是否正确",
    retryable: false
  },
  402: {
    type: ErrorType.INSUFFICIENT_BALANCE,
    message: "余额不足：请充值",
    retryable: false
  },
  403: {
    type: ErrorType.FORBIDDEN,
    message: "没有访问权限：无法访问该资源",
    retryable: false
  },
  404: {
    type: ErrorType.MODEL_UNAVAILABLE,
    message: "找不到指定的模型：请检查模型 ID 是否正确",
    retryable: false
  },
  429: {
    type: ErrorType.RATE_LIMIT,
    message: "请求过于频繁：请稍后重试",
    retryable: true
  },
  500: {
    type: ErrorType.SERVER_ERROR,
    message: "服务器内部错误：请稍后重试",
    retryable: true
  },
  502: {
    type: ErrorType.SERVICE_UNAVAILABLE,
    message: "网关错误：服务暂时不可用，请稍后重试",
    retryable: true
  },
  503: {
    type: ErrorType.SERVICE_UNAVAILABLE,
    message: "服务暂时不可用：请稍后重试",
    retryable: true
  }
};
const APIMART_BUSINESS_CODES = {
  605: {
    type: ErrorType.INSUFFICIENT_BALANCE,
    message: "账户余额不足：请充值或更换 API Key",
    retryable: false
  }
};
const APIMART_ERROR_KEYWORDS = {
  NOT_ENOUGH_BALANCE: {
    type: ErrorType.INSUFFICIENT_BALANCE,
    message: "账户余额不足"
  },
  INVALID_API_KEY: {
    type: ErrorType.AUTH_ERROR,
    message: "API Key 无效"
  },
  RATE_LIMIT_EXCEEDED: {
    type: ErrorType.RATE_LIMIT,
    message: "请求过于频繁"
  },
  INVALID_PARAMETERS: {
    type: ErrorType.INVALID_PARAMS,
    message: "请求参数错误"
  },
  MODEL_NOT_AVAILABLE: {
    type: ErrorType.MODEL_UNAVAILABLE,
    message: "模型不可用"
  },
  CONTENT_VIOLATION: {
    type: ErrorType.CONTENT_FILTERED,
    message: "内容违规"
  },
  TASK_FAILED: {
    type: ErrorType.TASK_FAILED,
    message: "任务执行失败"
  },
  INVALID_ARGUMENT: {
    type: ErrorType.INVALID_PARAMS,
    message: "无效的请求参数"
  }
};
function extractErrorCode(_0x3704c2, _0x4c977d) {
  if (APIMART_HTTP_STATUS_MAP[_0x4c977d]) {
    return _0x4c977d;
  }
  const _0x503f1d = _0x3704c2?.error?.code ?? _0x3704c2?.code ?? _0x3704c2?.errorCode ?? _0x3704c2?.error_code ?? _0x3704c2?.errCode ?? _0x4c977d;
  return _0x503f1d;
}
function extractErrorMessage(_0x39d2a4) {
  if (typeof _0x39d2a4 === "string") {
    return normalizeApimartFailureReason(_0x39d2a4);
  }
  if (_0x39d2a4?.error?.message) {
    return normalizeApimartFailureReason(_0x39d2a4.error.message);
  }
  return normalizeApimartFailureReason(_0x39d2a4?.errorMessage || _0x39d2a4?.error_message || _0x39d2a4?.message || _0x39d2a4?.msg || (typeof _0x39d2a4?.error === "string" ? _0x39d2a4.error : "") || "");
}
function stringifyErrorValue(_0x56afc8) {
  if (_0x56afc8 == null) {
    return "";
  }
  if (typeof _0x56afc8 === "string") {
    return _0x56afc8.trim();
  }
  if (typeof _0x56afc8 === "number" || typeof _0x56afc8 === "boolean") {
    return String(_0x56afc8);
  }
  if (typeof _0x56afc8 === "object") {
    const _0x2cf596 = _0x56afc8.message || _0x56afc8.errorMessage || _0x56afc8.error_message || _0x56afc8.detail || _0x56afc8.reason || _0x56afc8.type || _0x56afc8.status || _0x56afc8.code;
    if (_0x2cf596) {
      return stringifyErrorValue(_0x2cf596);
    }
    try {
      return JSON.stringify(_0x56afc8);
    } catch {
      return String(_0x56afc8 || "").trim();
    }
  }
  return String(_0x56afc8 || "").trim();
}
function extractTaskStatus(_0x1754b5) {
  return String(_0x1754b5?.status || _0x1754b5?.taskStatus || _0x1754b5?.task_status || _0x1754b5?.state || _0x1754b5?.phase || _0x1754b5?.data?.status || _0x1754b5?.data?.taskStatus || _0x1754b5?.data?.task_status || "").trim().toLowerCase();
}
function extractTaskFailureReason(_0x7855cc) {
  const _0x253463 = [_0x7855cc?.error?.message, _0x7855cc?.error?.error?.message, _0x7855cc?.errorMessage, _0x7855cc?.error_message, _0x7855cc?.message, _0x7855cc?.failedReason, _0x7855cc?.failReason, _0x7855cc?.failure_reason, _0x7855cc?.data?.error?.message, _0x7855cc?.data?.error?.error?.message, _0x7855cc?.data?.errorMessage, _0x7855cc?.data?.error_message, _0x7855cc?.data?.message, _0x7855cc?.data?.failedReason, _0x7855cc?.data?.failReason, _0x7855cc?.data?.failure_reason, _0x7855cc?.result?.error?.message, _0x7855cc?.result?.errorMessage, _0x7855cc?.result?.message];
  for (const _0x550ea7 of _0x253463) {
    const _0x2e2484 = stringifyErrorValue(_0x550ea7);
    if (_0x2e2484) {
      return normalizeApimartFailureReason(_0x2e2484);
    }
  }
  return normalizeApimartFailureReason(stringifyErrorValue(_0x7855cc?.error) || stringifyErrorValue(_0x7855cc?.data?.error) || stringifyErrorValue(_0x7855cc?.result?.error) || "");
}
function looksLikeHtmlDocument(_0x5e997d) {
  const _0x22f3a7 = String(_0x5e997d || "");
  return /<!doctype\s+html|<html[\s>]/i.test(_0x22f3a7) || /&lt;!doctype\s+html|&lt;html/i.test(_0x22f3a7);
}
function looksLikeHtmlChallenge(_0x563d03) {
  const _0x449764 = String(_0x563d03 || "");
  return looksLikeHtmlDocument(_0x449764) && /请稍等|just a moment|challenge-error|cloudflare|noindex,nofollow/i.test(_0x449764);
}
function looksLikeMediaReverseFailure(_0x5b088e) {
  return /MediaPostReverse|媒体发布|上游主体|media post reverse/i.test(String(_0x5b088e || ""));
}
function normalizeApimartFailureReason(_0x47a5d2) {
  const _0x3b486b = String(_0x47a5d2 || "").trim();
  if (!_0x3b486b) {
    return "";
  }
  if (looksLikeHtmlChallenge(_0x3b486b) || looksLikeHtmlDocument(_0x3b486b) && looksLikeMediaReverseFailure(_0x3b486b)) {
    return "上游媒体拉取失败：输入图片或视频 URL 被源站拒绝访问（403/防护页）。请重新连接原始素材，或改用 APIMart 上传后的公网 URL 后重试";
  }
  if (looksLikeHtmlDocument(_0x3b486b)) {
    return "APIMart 上游返回了 HTML 页面，可能是线路防护页或网关异常，请稍后重试";
  }
  return _0x3b486b;
}
export function parseError(_0x5e96f4, _0x296bce) {
  if (!_0x5e96f4) {
    return null;
  }
  const _0x139dfa = extractErrorCode(_0x5e96f4, _0x296bce);
  const _0x1daf9e = extractErrorMessage(_0x5e96f4);
  const _0x513a16 = String(_0x1daf9e).toUpperCase();
  if (APIMART_HTTP_STATUS_MAP[_0x139dfa]) {
    const _0x14de3d = APIMART_HTTP_STATUS_MAP[_0x139dfa];
    return new ApiError({
      type: _0x14de3d.type,
      provider: "apimart",
      code: _0x139dfa,
      message: _0x1daf9e || _0x14de3d.message,
      status: _0x296bce,
      retryable: _0x14de3d.retryable
    });
  }
  if (APIMART_BUSINESS_CODES[_0x139dfa]) {
    const _0x39ed4e = APIMART_BUSINESS_CODES[_0x139dfa];
    return new ApiError({
      type: _0x39ed4e.type,
      provider: "apimart",
      code: _0x139dfa,
      message: _0x1daf9e || _0x39ed4e.message,
      status: _0x296bce,
      retryable: _0x39ed4e.retryable
    });
  }
  for (const [_0x5bd832, _0x2f36a1] of Object.entries(APIMART_ERROR_KEYWORDS)) {
    if (_0x513a16.includes(_0x5bd832)) {
      return new ApiError({
        type: _0x2f36a1.type,
        provider: "apimart",
        code: _0x139dfa,
        message: _0x1daf9e || _0x2f36a1.message,
        status: _0x296bce,
        retryable: false
      });
    }
  }
  if (_0x296bce >= 400) {
    return ApiError.fromHttpStatus(_0x296bce, "apimart", _0x1daf9e);
  }
  return null;
}
export function parseTaskError(_0x3e67af) {
  if (!_0x3e67af) {
    return null;
  }
  const _0x42fc9b = extractTaskStatus(_0x3e67af);
  if (_0x42fc9b === "failed" || _0x42fc9b === "failure" || _0x42fc9b === "fail" || _0x42fc9b === "error" || _0x42fc9b === "cancelled" || _0x42fc9b === "canceled") {
    const _0x581ee7 = extractTaskFailureReason(_0x3e67af) || (_0x42fc9b === "cancelled" || _0x42fc9b === "canceled" ? "任务已取消" : "未知错误");
    const _0x29f85d = String(_0x581ee7).toUpperCase();
    for (const [_0x4a5597, _0x14cc3d] of Object.entries(APIMART_ERROR_KEYWORDS)) {
      if (_0x29f85d.includes(_0x4a5597)) {
        return new ApiError({
          type: _0x14cc3d.type,
          provider: "apimart",
          message: _0x14cc3d.message + ": " + _0x581ee7,
          retryable: false
        });
      }
    }
    return ApiError.taskFailed("apimart", _0x581ee7);
  }
  return null;
}
export default {
  parseError: parseError,
  parseTaskError: parseTaskError
};