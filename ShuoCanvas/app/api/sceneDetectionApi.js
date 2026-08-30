import { requester } from "./requester.js";
import { ensureConfig, getProviderConfig } from "./configApi.js";
import { ApiError, ErrorType, parseError, parseTaskError, parseNetworkError } from "./errors/index.js";
import { hasRunningHubWorkflowPollingTimedOut, resolveRunningHubWorkflowPollingPolicy } from "./runningHubWorkflowPollingPolicy.js";
const DETECTION_TIMEOUT = 300000;
export async function buildSceneDetectionRequest(_0x51778b) {
  await ensureConfig();
  const _0x5a4154 = _0x51778b.provider || "grsai";
  const _0x286b1c = getProviderConfig(_0x5a4154);
  const _0x535016 = _0x286b1c.apiUrl.replace(/\/+$/, "");
  const _0x373c62 = _0x51778b.apiKey || _0x286b1c.apiKey;
  if (!_0x373c62) {
    throw ApiError.authError(_0x5a4154, null, "API Key 未配置（厂商：" + _0x5a4154 + "），无法发起场景检测请求");
  }
  if (_0x5a4154 === "grsai") {
    return {
      url: "/api/v2/proxy/image",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        apiUrl: _0x535016 + "/v1/video/scene-detection",
        apiKey: _0x373c62,
        videoUrl: _0x51778b.videoUrl,
        sensitivity: _0x51778b.sensitivity || 0.5
      }
    };
  }
  if (_0x5a4154 === "runninghubwf") {
    return {
      url: "/api/v2/runninghubwf/scene-detection",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        apiKey: _0x373c62,
        videoUrl: _0x51778b.videoUrl,
        sensitivity: _0x51778b.sensitivity || 0.5
      }
    };
  }
  throw new ApiError({
    type: "UNSUPPORTED_PROVIDER",
    provider: _0x5a4154,
    message: "暂不支持厂商 " + _0x5a4154 + " 的场景检测",
    retryable: false
  });
}
async function pollSceneDetectionTask(_0x264280, _0x3913f6, _0x2875eb, _0x24a771 = {}) {
  const _0x55b86e = getProviderConfig(_0x3913f6);
  const _0x24ca17 = _0x3913f6 === "runninghubwf" ? resolveRunningHubWorkflowPollingPolicy(_0x24a771) : null;
  const _0x536c53 = _0x24ca17?.pollIntervalMs ?? 2000;
  const _0x31a9c1 = _0x24ca17?.pollTimeoutMs ?? null;
  const _0x477b93 = _0x24ca17?.maxPolls ?? 300;
  const _0x3fc276 = Date.now();
  for (let _0x55bd40 = 0; _0x55bd40 < _0x477b93; _0x55bd40++) {
    if (_0x31a9c1 !== null && hasRunningHubWorkflowPollingTimedOut(_0x3fc276, _0x31a9c1)) {
      break;
    }
    if (_0x536c53 > 0) {
      await new Promise(_0x48e9d1 => setTimeout(_0x48e9d1, _0x536c53));
    }
    if (_0x31a9c1 !== null && hasRunningHubWorkflowPollingTimedOut(_0x3fc276, _0x31a9c1)) {
      break;
    }
    const _0x53f100 = _0x3913f6 === "runninghubwf" ? "/api/v2/runninghubwf/query" : _0x55b86e.apiUrl + "/v1/tasks/" + _0x264280;
    try {
      const _0x2698ba = await requester({
        url: _0x53f100,
        method: "POST",
        provider: _0x3913f6,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
        body: _0x3913f6 === "runninghubwf" ? JSON.stringify({
          apiKey: _0x2875eb,
          taskId: _0x264280
        }) : JSON.stringify({
          apiUrl: _0x53f100,
          apiKey: _0x2875eb
        })
      });
      const _0x158269 = _0x2698ba.data || _0x2698ba;
      const _0x6a1b2 = parseError(_0x3913f6, _0x158269, 200);
      if (_0x6a1b2) {
        throw _0x6a1b2;
      }
      const _0x471dc5 = (_0x158269.status || "").toUpperCase();
      if (["COMPLETED", "SUCCEEDED", "SUCCESS"].includes(_0x471dc5)) {
        return _0x158269;
      }
    } catch (_0x355fd4) {
      if (_0x355fd4 instanceof ApiError) {
        if (_0x355fd4.type === ErrorType.TASK_FAILED || _0x355fd4.type === ErrorType.TASK_TIMEOUT || _0x355fd4.type === ErrorType.AUTH_ERROR || _0x355fd4.type === ErrorType.FORBIDDEN || _0x355fd4.type === ErrorType.INVALID_PARAMS || _0x355fd4.type === ErrorType.INSUFFICIENT_BALANCE) {
          throw _0x355fd4;
        }
      }
    }
  }
  throw ApiError.taskTimeout(_0x3913f6);
}
function extractSceneChanges(_0x58b0b6) {
  if (_0x58b0b6.result?.sceneChanges) {
    return _0x58b0b6.result.sceneChanges;
  } else if (_0x58b0b6.data?.sceneChanges) {
    return _0x58b0b6.data.sceneChanges;
  } else if (_0x58b0b6.sceneChanges) {
    return _0x58b0b6.sceneChanges;
  }
  return [];
}
function processSceneDetectionResult(_0x58d525, _0x4240f9) {
  const _0x114546 = extractSceneChanges(_0x58d525);
  if (!Array.isArray(_0x114546)) {
    const _0x2cbbd4 = parseError(_0x4240f9, _0x58d525, 200);
    if (_0x2cbbd4) {
      throw _0x2cbbd4;
    }
    const _0x328c2a = parseTaskError(_0x4240f9, _0x58d525);
    if (_0x328c2a) {
      throw new ApiError({
        type: "TASK_FAILED",
        provider: _0x4240f9,
        message: _0x328c2a.getUserMessage(),
        retryable: false
      });
    }
    const _0x41de79 = _0x58d525.error || _0x58d525.errorMessage || _0x58d525.message || _0x58d525.failure_reason;
    if (_0x41de79) {
      throw new ApiError({
        type: "TASK_FAILED",
        provider: _0x4240f9,
        message: _0x41de79,
        retryable: false
      });
    }
    throw new ApiError({
      type: "PARSE_ERROR",
      provider: _0x4240f9,
      message: "无法从服务器响应中提取场景检测结果",
      raw: _0x58d525,
      retryable: false
    });
  }
  return {
    sceneChanges: _0x114546,
    sceneCount: _0x114546.length + 1
  };
}
export async function detectScenes(_0x5ba499, _0x1f6023) {
  const _0x46be6b = _0x5ba499.provider || "grsai";
  const _0x13955b = await buildSceneDetectionRequest(_0x5ba499);
  let _0x1b1ab3;
  try {
    _0x1b1ab3 = await requester({
      url: _0x13955b.url,
      method: "POST",
      provider: _0x46be6b,
      timeout: DETECTION_TIMEOUT,
      headers: _0x13955b.headers,
      body: JSON.stringify(_0x13955b.body)
    });
  } catch (_0x1aff7a) {
    if (_0x1aff7a instanceof ApiError) {
      throw _0x1aff7a;
    }
    throw parseNetworkError(_0x46be6b, _0x1aff7a, DETECTION_TIMEOUT);
  }
  let _0x433dd3 = _0x1b1ab3;
  let _0xf5f5 = null;
  if (_0x433dd3.task_id || _0x433dd3.taskId) {
    const _0x29d5e9 = _0x433dd3.task_id || _0x433dd3.taskId;
    _0x1f6023?.onTaskId?.(String(_0x29d5e9));
    const _0x225bc1 = getProviderConfig(_0x46be6b);
    const _0xaafeed = _0x5ba499.apiKey || _0x225bc1.apiKey;
    const _0x12216c = await pollSceneDetectionTask(_0x29d5e9, _0x46be6b, _0xaafeed, _0x1f6023);
    _0xf5f5 = processSceneDetectionResult(_0x12216c, _0x46be6b);
  } else {
    _0xf5f5 = processSceneDetectionResult(_0x433dd3, _0x46be6b);
  }
  return _0xf5f5;
}