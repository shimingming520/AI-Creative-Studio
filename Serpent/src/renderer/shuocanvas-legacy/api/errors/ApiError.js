export const ErrorType = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  DNS_ERROR: "DNS_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMIT: "RATE_LIMIT",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  INVALID_PARAMS: "INVALID_PARAMS",
  CONTENT_FILTERED: "CONTENT_FILTERED",
  MODEL_UNAVAILABLE: "MODEL_UNAVAILABLE",
  SERVER_ERROR: "SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  TASK_FAILED: "TASK_FAILED",
  TASK_TIMEOUT: "TASK_TIMEOUT",
  UNKNOWN: "UNKNOWN"
};
const ERROR_MESSAGES = {
  [ErrorType.NETWORK_ERROR]: "网络连接失败，请检查网络或代理设置",
  [ErrorType.TIMEOUT]: "请求超时，请稍后重试",
  [ErrorType.DNS_ERROR]: "无法解析服务器地址，请检查网络配置",
  [ErrorType.AUTH_ERROR]: "API Key 无效或已过期，请检查配置",
  [ErrorType.FORBIDDEN]: "权限不足，无法访问该资源",
  [ErrorType.RATE_LIMIT]: "请求过于频繁，请稍后再试",
  [ErrorType.INSUFFICIENT_BALANCE]: "账户余额不足，请充值",
  [ErrorType.INVALID_PARAMS]: "请求参数错误，请检查输入",
  [ErrorType.CONTENT_FILTERED]: "生成内容被安全过滤，请修改提示词",
  [ErrorType.MODEL_UNAVAILABLE]: "当前模型不可用，请更换模型或稍后再试",
  [ErrorType.SERVER_ERROR]: "服务器内部错误，请稍后再试",
  [ErrorType.SERVICE_UNAVAILABLE]: "服务暂时不可用，请稍后再试",
  [ErrorType.TASK_FAILED]: "生成任务执行失败",
  [ErrorType.TASK_TIMEOUT]: "任务处理超时，请稍后查询结果",
  [ErrorType.UNKNOWN]: "发生未知错误，请稍后重试"
};
export class ApiError extends Error {
  constructor(_0x2d83c0) {
    const {
      type: _0x377d83,
      message: _0x22104f,
      provider: _0x2cdea5,
      code: _0x470fda,
      retryable: _0xed3b4b,
      raw: _0x261942,
      status: _0x605ece
    } = _0x2d83c0;
    super(_0x22104f || ERROR_MESSAGES[_0x377d83] || ERROR_MESSAGES[ErrorType.UNKNOWN]);
    this.name = "ApiError";
    this.type = _0x377d83 || ErrorType.UNKNOWN;
    this.provider = _0x2cdea5 || "unknown";
    this.code = _0x470fda;
    this.retryable = _0xed3b4b ?? this._isRetryable(_0x377d83);
    this.raw = _0x261942;
    this.status = _0x605ece;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  _isRetryable(_0x53ee14) {
    const _0x13c55b = [ErrorType.TIMEOUT, ErrorType.RATE_LIMIT, ErrorType.SERVER_ERROR, ErrorType.SERVICE_UNAVAILABLE, ErrorType.NETWORK_ERROR];
    return _0x13c55b.includes(_0x53ee14);
  }
  getUserMessage(_0x1b1ab8 = true) {
    let _0x2757d2 = this.message;
    if (_0x1b1ab8 && this.provider && this.provider !== "unknown") {
      const _0x5208f0 = {
        grsai: "GRSAI",
        ppio: "PPIO",
        apimart: "APIMart",
        agnes: "Agnes AI",
        comfyui: "ComfyUI",
        volcengine: "火山方舟",
        "volcengine-speech": "火山语音",
        runninghub: "RunningHUB",
        gemini: "Gemini",
        openai: "OpenAI"
      };
      const _0x1c8387 = _0x5208f0[this.provider] || this.provider;
      _0x2757d2 = "[" + _0x1c8387 + "] " + _0x2757d2;
    }
    if (this.code) {
      _0x2757d2 += " (错误码: " + this.code + ")";
    }
    return _0x2757d2;
  }
  toLogString() {
    return "[" + this.provider + "] " + this.type + "(" + (this.code || "N/A") + "): " + this.message;
  }
  static networkError(_0x592634, _0x3f6200) {
    return new ApiError({
      type: ErrorType.NETWORK_ERROR,
      provider: _0x592634,
      message: "网络请求失败: " + (_0x3f6200?.message || "未知网络错误"),
      raw: _0x3f6200,
      retryable: true
    });
  }
  static timeout(_0x4fe005, _0x15f0d7) {
    return new ApiError({
      type: ErrorType.TIMEOUT,
      provider: _0x4fe005,
      message: "请求超时（" + (_0x15f0d7 ? Math.round(_0x15f0d7 / 1000) + "秒" : "未知") + "），请检查网络连接或稍后重试",
      retryable: true
    });
  }
  static insufficientBalance(_0x312203, _0x5c6944) {
    return new ApiError({
      type: ErrorType.INSUFFICIENT_BALANCE,
      provider: _0x312203,
      code: _0x5c6944,
      message: "账户余额不足，请充值或更换 API Key",
      retryable: false
    });
  }
  static authError(_0x54428f, _0x1d5401, _0x684097) {
    return new ApiError({
      type: ErrorType.AUTH_ERROR,
      provider: _0x54428f,
      code: _0x1d5401,
      message: _0x684097 || "API Key 无效或已过期",
      retryable: false
    });
  }
  static rateLimit(_0x9c3d19, _0x464d5f) {
    return new ApiError({
      type: ErrorType.RATE_LIMIT,
      provider: _0x9c3d19,
      code: _0x464d5f,
      message: "请求过于频繁，请稍后再试",
      retryable: true
    });
  }
  static contentFiltered(_0x568fe4, _0x12ce62) {
    return new ApiError({
      type: ErrorType.CONTENT_FILTERED,
      provider: _0x568fe4,
      message: _0x12ce62 || "生成内容被安全过滤，请修改提示词后重试",
      retryable: false
    });
  }
  static taskFailed(_0x5bf80e, _0x1967bf) {
    return new ApiError({
      type: ErrorType.TASK_FAILED,
      provider: _0x5bf80e,
      message: "生成任务失败: " + (_0x1967bf || "未知原因"),
      retryable: false
    });
  }
  static taskTimeout(_0x474522) {
    return new ApiError({
      type: ErrorType.TASK_TIMEOUT,
      provider: _0x474522,
      message: "任务处理超时，请稍后查询结果",
      retryable: false
    });
  }
  static fromHttpStatus(_0x498345, _0x5e288d, _0x3582dc) {
    let _0x32bedd = ErrorType.UNKNOWN;
    switch (_0x498345) {
      case 400:
        _0x32bedd = ErrorType.INVALID_PARAMS;
        break;
      case 401:
        _0x32bedd = ErrorType.AUTH_ERROR;
        break;
      case 403:
        _0x32bedd = ErrorType.FORBIDDEN;
        break;
      case 429:
        _0x32bedd = ErrorType.RATE_LIMIT;
        break;
      case 500:
        _0x32bedd = ErrorType.SERVER_ERROR;
        break;
      case 503:
        _0x32bedd = ErrorType.SERVICE_UNAVAILABLE;
        break;
    }
    return new ApiError({
      type: _0x32bedd,
      provider: _0x5e288d,
      status: _0x498345,
      message: _0x3582dc || ERROR_MESSAGES[_0x32bedd],
      retryable: _0x498345 >= 500 || _0x498345 === 429
    });
  }
}
export default ApiError;