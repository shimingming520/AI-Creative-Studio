import { ApiError, ErrorType } from "../ApiError.js";
const MODEL_ERROR_CODE_MAP = {
  1000: {
    type: ErrorType.SERVER_ERROR,
    message: "未知错误，请联系技术支持排查。",
    retryable: false
  },
  1001: {
    type: ErrorType.INVALID_PARAMS,
    message: "请求链接无效，请检查调用的 API Endpoint 是否正确。",
    retryable: false
  },
  1002: {
    type: ErrorType.AUTH_ERROR,
    message: "API Key 无效，请检查 API Key 是否配置正确或已被禁用。",
    retryable: false
  },
  1003: {
    type: ErrorType.RATE_LIMIT,
    message: "请求频率超限，请降低并发请求频率。",
    retryable: true
  },
  1004: {
    type: ErrorType.TASK_FAILED,
    message: "任务不存在或已过期，请确认任务 ID 是否正确。",
    retryable: false
  },
  1005: {
    type: ErrorType.SERVER_ERROR,
    message: "系统内部错误，请稍后重试。",
    retryable: true
  },
  1006: {
    type: ErrorType.TASK_TIMEOUT,
    message: "任务执行超时，请尝试重新提交。",
    retryable: true
  },
  1007: {
    type: ErrorType.INVALID_PARAMS,
    message: "请求参数校验失败，请检查参数格式、类型或文件有效性。",
    retryable: false
  },
  1008: {
    type: ErrorType.INVALID_PARAMS,
    message: "文件大小超出限制，请参考文档中的文件大小上限。",
    retryable: false
  },
  1009: {
    type: ErrorType.INVALID_PARAMS,
    message: "请求方法不支持，请确认请求方式是否正确。",
    retryable: false
  },
  1010: {
    type: ErrorType.SERVICE_UNAVAILABLE,
    message: "服务暂不可用，系统维护或临时故障，请稍后重试。",
    retryable: true
  },
  1011: {
    type: ErrorType.RATE_LIMIT,
    message: "模型负载较高，请稍后重试。",
    retryable: true
  },
  1012: {
    type: ErrorType.SERVER_ERROR,
    message: "模型响应异常，请重试。",
    retryable: true
  },
  1013: {
    type: ErrorType.SERVER_ERROR,
    message: "文件处理失败，请检查输入文件链接或文件完整性。",
    retryable: true
  },
  1014: {
    type: ErrorType.FORBIDDEN,
    message: "权限不足，标准模型 API 仅限企业级共享 API Key 调用。",
    retryable: false
  },
  1015: {
    type: ErrorType.TASK_FAILED,
    message: "生成失败，任务处理过程中出现异常，请尝试重新提交。",
    retryable: true
  },
  1501: {
    type: ErrorType.CONTENT_FILTERED,
    message: "内容安全审查未通过，请修改提示词或图片。",
    retryable: false
  },
  1504: {
    type: ErrorType.TIMEOUT,
    message: "模型响应超时，请稍后重试。",
    retryable: true
  },
  1505: {
    type: ErrorType.CONTENT_FILTERED,
    message: "不支持真人图像处理，请修改提示词或参考图。",
    retryable: false
  },
  1506: {
    type: ErrorType.INVALID_PARAMS,
    message: "音频克隆 ID 重复，请更换唯一的 voiceId。",
    retryable: false
  },
  1516: {
    type: ErrorType.INVALID_PARAMS,
    message: "外部文件下载失败，请检查 URL 是否可访问后重试。",
    retryable: true
  },
  1517: {
    type: ErrorType.SERVER_ERROR,
    message: "文件上传失败，请重试。",
    retryable: true
  },
  1518: {
    type: ErrorType.INVALID_PARAMS,
    message: "Base64 解码失败，请检查 Base64 字符串格式。",
    retryable: false
  },
  1519: {
    type: ErrorType.SERVER_ERROR,
    message: "内容处理异常，处理输入内容时出现非预期错误，请重试。",
    retryable: true
  },
  1520: {
    type: ErrorType.RATE_LIMIT,
    message: "账号并发达到上限，请等待已有任务完成后再发起新请求。",
    retryable: true
  }
};
const MESSAGE_HINT_TO_CODE = {
  "UNKNOWN ERROR": 1000,
  "INVALID URL": 1001,
  "INVALID API KEY": 1002,
  "RATE LIMIT EXCEEDED": 1003,
  "TASK NOT FOUND": 1004,
  "INTERNAL SERVER ERROR": 1005,
  "TASK EXECUTION TIMED OUT": 1006,
  "INVALID PARAMETERS": 1007,
  "FILE SIZE LIMIT EXCEEDED": 1008,
  "HTTP METHOD NOT SUPPORTED": 1009,
  "SERVICE UNAVAILABLE": 1010,
  "MODEL IS CURRENTLY BUSY": 1011,
  "MODEL RESPONSE EXCEPTION": 1012,
  "FILE PROCESSING FAILED": 1013,
  "ACCESS DENIED": 1014,
  "GENERATION FAILED": 1015,
  "CONTENT SECURITY AUDIT FAILED": 1501,
  "MODEL TIMED OUT": 1504,
  "UPSTREAM SERVICE TIMED OUT": 1504,
  "REAL PEOPLE PROHIBITED": 1505,
  "VOICE ID DUPLICATE": 1506,
  "EXTERNAL DOWNLOAD FAILED": 1516,
  "UPLOAD FAILED": 1517,
  "BASE64 DECODE FAILED": 1518,
  "CONTENT PROCESSING EXCEPTION": 1519,
  "CONCURRENCY LIMIT REACHED": 1520
};
function toNumberCode(_0x4786b6) {
  if (typeof _0x4786b6 === "number" && Number.isFinite(_0x4786b6)) {
    return _0x4786b6;
  }
  if (typeof _0x4786b6 === "string") {
    const _0x24a33a = _0x4786b6.trim();
    if (/^\d+$/.test(_0x24a33a)) {
      return Number(_0x24a33a);
    }
  }
  return null;
}
function toMessageString(_0x225114, _0x1252a9 = new Set()) {
  if (_0x225114 === undefined || _0x225114 === null) {
    return "";
  }
  if (typeof _0x225114 === "string") {
    return _0x225114.trim();
  }
  if (typeof _0x225114 === "number" || typeof _0x225114 === "boolean") {
    return String(_0x225114);
  }
  if (typeof _0x225114 !== "object" || _0x1252a9.has(_0x225114)) {
    return "";
  }
  _0x1252a9.add(_0x225114);
  const _0x524241 = [_0x225114.message, _0x225114.errorMessage, _0x225114.error_message, _0x225114.msg, _0x225114.reason, _0x225114.detail, _0x225114.details];
  for (const _0x53e9f4 of _0x524241) {
    if (_0x53e9f4 === _0x225114) {
      continue;
    }
    const _0x488042 = toMessageString(_0x53e9f4, _0x1252a9);
    if (_0x488042) {
      return _0x488042;
    }
  }
  try {
    return JSON.stringify(_0x225114);
  } catch {
    return "";
  }
}
function collectCandidateObjects(_0x131751) {
  if (!_0x131751 || typeof _0x131751 !== "object") {
    return [];
  }
  const _0x522ebf = [];
  const _0x4be392 = [_0x131751];
  const _0x5387d7 = new Set();
  while (_0x4be392.length && _0x522ebf.length < 100) {
    const _0x584253 = _0x4be392.shift();
    if (!_0x584253 || typeof _0x584253 !== "object" || _0x5387d7.has(_0x584253)) {
      continue;
    }
    _0x5387d7.add(_0x584253);
    if (Array.isArray(_0x584253)) {
      _0x4be392.push(..._0x584253);
      continue;
    }
    _0x522ebf.push(_0x584253);
    _0x4be392.push(_0x584253.data, _0x584253.result, _0x584253.output, _0x584253.response, _0x584253.error, _0x584253.failedReason, _0x584253.reason, _0x584253.results);
  }
  return _0x522ebf;
}
function extractMessage(_0x3cd367) {
  const _0x3d6d5b = collectCandidateObjects(_0x3cd367);
  for (const _0x343617 of _0x3d6d5b) {
    const _0x47681d = [_0x343617?.errorMessage, _0x343617?.message, _0x343617?.error, _0x343617?.msg, _0x343617?.reason, _0x343617?.detail];
    for (const _0x4631c6 of _0x47681d) {
      const _0x1c8ce7 = toMessageString(_0x4631c6);
      if (_0x1c8ce7) {
        return _0x1c8ce7;
      }
    }
  }
  return "";
}
function extractErrorCode(_0x29cc91) {
  const _0x3f6f35 = collectCandidateObjects(_0x29cc91);
  for (const _0x5a4cc9 of _0x3f6f35) {
    const _0x140e8d = toNumberCode(_0x5a4cc9.errorCode) ?? toNumberCode(_0x5a4cc9.error_code);
    if (_0x140e8d !== null && _0x140e8d !== 0) {
      return _0x140e8d;
    }
  }
  for (const _0x584285 of _0x3f6f35) {
    const _0x47d3a8 = toNumberCode(_0x584285.code);
    if (_0x47d3a8 !== null && _0x47d3a8 !== 0) {
      return _0x47d3a8;
    }
  }
  for (const _0x4a2b4a of _0x3f6f35) {
    const _0x56fe5f = toMessageString(_0x4a2b4a.errorMessage || _0x4a2b4a.message || _0x4a2b4a.error || _0x4a2b4a.msg).toUpperCase();
    if (!_0x56fe5f) {
      continue;
    }
    for (const [_0x327e0f, _0x2004b8] of Object.entries(MESSAGE_HINT_TO_CODE)) {
      if (_0x56fe5f.includes(_0x327e0f)) {
        return _0x2004b8;
      }
    }
  }
  return null;
}
function buildMappedError(_0x226522, _0x430d8f, _0x119f6a) {
  const _0x36a6e4 = MODEL_ERROR_CODE_MAP[_0x226522];
  if (!_0x36a6e4) {
    return null;
  }
  const _0x109354 = toMessageString(_0x119f6a);
  const _0x208279 = _0x226522 === 1504 && _0x109354.toUpperCase().includes("UPSTREAM SERVICE TIMED OUT");
  const _0x3386d1 = _0x109354 && !_0x208279 && !_0x36a6e4.message.includes(_0x109354) ? _0x36a6e4.message + " 上游详情：" + _0x109354 : _0x36a6e4.message;
  return new ApiError({
    type: _0x36a6e4.type,
    provider: "runninghub",
    code: _0x226522,
    message: _0x3386d1,
    status: _0x430d8f,
    retryable: _0x36a6e4.retryable
  });
}
export function parseError(_0x4ca971, _0x261770) {
  if (!_0x4ca971) {
    return null;
  }
  const _0xdb4e04 = extractMessage(_0x4ca971);
  const _0x188609 = extractErrorCode(_0x4ca971);
  if (_0x188609 !== null) {
    const _0x479a09 = buildMappedError(_0x188609, _0x261770, _0xdb4e04);
    if (_0x479a09) {
      return _0x479a09;
    }
  }
  if (_0x261770 >= 400) {
    return ApiError.fromHttpStatus(_0x261770, "runninghub", _0xdb4e04);
  }
  return null;
}
export function parseTaskError(_0x8107e7) {
  if (!_0x8107e7 || typeof _0x8107e7 !== "object") {
    return null;
  }
  const _0x3c7556 = extractMessage(_0x8107e7);
  const _0xbc98e1 = extractErrorCode(_0x8107e7);
  if (_0xbc98e1 !== null) {
    const _0x203f70 = buildMappedError(_0xbc98e1, null, _0x3c7556);
    if (_0x203f70) {
      return _0x203f70;
    }
  }
  const _0x1dc027 = collectCandidateObjects(_0x8107e7).map(_0x208fc0 => String(_0x208fc0.status || _0x208fc0.taskStatus || _0x208fc0.task_status || "").toUpperCase()).filter(Boolean);
  const _0x5768c0 = _0x1dc027[0] || "";
  if (_0x5768c0 === "TIMEOUT") {
    return ApiError.taskTimeout("runninghub");
  }
  if (_0x5768c0 === "FAILED" || _0x5768c0 === "ERROR") {
    const _0x38b2ac = _0x3c7556 || "任务执行失败";
    return ApiError.taskFailed("runninghub", _0x38b2ac);
  }
  return null;
}
export default {
  parseError: parseError,
  parseTaskError: parseTaskError
};