import * as a42_0x31eee3 from "./adapters/RunningHubAdapter.js";
import * as a42_0x398e09 from "./adapters/ComfyUiAdapter.js";
import { buildVideoRequestFromManifest, resolveManifestErrorRules, resolveManifestTaskPolling } from "./adapters/ModelApiManifestNormalizer.js";
import { resolveMappedResponseValue, resolveMappedResponseValues } from "./adapters/modelApiMappingEngine.js";
import { ensureConfig, getProviderConfig } from "./configApi.js";
import { applyCameraAngleToPrompt } from "./cameraPromptApi.js";
import { processInputImages } from "./imageUploadApi.js";
import { processInputVideos } from "./videoUploadApi.js";
import { processInputAudios } from "./audioUploadApi.js";
import { uploadInputToComfyUi } from "./comfyUiUploadApi.js";
import { uploadInputsToVolcengineFiles } from "./volcengineFileApi.js";
import { fetchRemoteBlob, SAVE_OUTPUT_FROM_URL_TIMEOUT_MS } from "./projectsV2Api.js";
import { cancelRunningHubTask } from "./runninghubTaskApi.js";
import { buildDreaminaVideoSubmitRequest, normalizeDreaminaTaskSnapshot, pollDreaminaUntilDone, queryDreaminaResult, runDreaminaVideoGeneration } from "./dreaminaGenApi.js";
import { isModelApiModel, normalizeProviderId, resolveModelExecution } from "../src/manifests/index.js";
import { localPathToUrl, pickResultLocalPath, urlToLocalPath } from "../src/utils/localMediaPath.js";
import { requester } from "./requester.js";
import { runTaskSingleFlight } from "./taskSingleFlight.js";
import { ensureVideoResultThumbnail } from "./videoResultThumbnailApi.js";
import { isRunningHubWorkflowQueueTarget, resolveRunningHubWorkflowQueueConfig, runWithRunningHubWorkflowQueue } from "./runningHubWorkflowQueue.js";
import { hasRunningHubWorkflowPollingTimedOut, resolveRunningHubWorkflowPollingPolicy } from "./runningHubWorkflowPollingPolicy.js";
import { ApiError, ErrorType, parseError, parseTaskError, parseNetworkError, applyManifestErrorRules } from "./errors/index.js";
import { buildRunningHubModelApiUrl, getRunningHubTaskProviderProfileId, normalizeRunningHubModelApiProfileId, resolveRunningHubModelApiProfileId, resolveRunningHubModelApiBaseUrl } from "../src/modules/runningHubProviderProfiles.js";
import { normalizeModelProviderProfileId } from "../src/modules/modelProviderProfileSelection.js";
const GENERATION_TIMEOUT = 600000;
const VIDEO_RESULT_SAVE_TIMEOUT_MS = SAVE_OUTPUT_FROM_URL_TIMEOUT_MS;
const VIDEO_RESULT_SAVE_RETRIES = 3;
const VIDEO_RESULT_SAVE_RETRY_DELAY_MS = 1000;
export async function cancelRunningHubVideoTask(_0x122a20 = {}) {
  return cancelRunningHubTask(_0x122a20);
}
function resolveVideoExecution(_0x242047 = {}) {
  const _0x496b31 = normalizeProviderId(_0x242047?.provider);
  return resolveModelExecution(_0x242047?.model, {
    providerHint: _0x496b31
  });
}
function resolveVideoProviderId(_0x3bf19e = {}, _0x1ed14a = null) {
  return normalizeProviderId(_0x1ed14a?.modelManifest?.provider || _0x3bf19e?.provider);
}
function resolveVideoRuntimeProviderKey(_0x2bc2b5 = {}, _0x3a7eb3 = "") {
  const _0x3275a8 = getRunningHubTaskProviderProfileId(_0x2bc2b5);
  const _0x214f04 = resolveVideoExecution(_0x2bc2b5);
  const _0x4bf049 = normalizeModelProviderProfileId(_0x214f04?.modelManifest || _0x2bc2b5?.model, _0x3275a8);
  if (_0x4bf049) {
    return _0x4bf049;
  }
  if (_0x3a7eb3 === "runninghubwf") {
    if (_0x3275a8) {
      return normalizeRunningHubModelApiProfileId(_0x3275a8);
    }
  }
  if (_0x3a7eb3 === "runninghub" && isModelApiModel(_0x2bc2b5?.model, "runninghub")) {
    return resolveRunningHubModelApiProfileId(_0x214f04?.modelManifest?.modelId || _0x2bc2b5?.model, _0x3275a8);
  } else {
    return _0x3a7eb3;
  }
}
function resolveVideoProviderConfig(_0x2d37f1 = {}, _0x162942 = "") {
  const _0x377321 = resolveVideoRuntimeProviderKey(_0x2d37f1, _0x162942);
  const _0xae14f1 = getProviderConfig(_0x377321) || {};
  if (_0x162942 === "runninghub") {
    return {
      ..._0xae14f1,
      apiUrl: resolveRunningHubModelApiBaseUrl(_0x377321)
    };
  } else {
    return _0xae14f1;
  }
}
function resolveVideoTaskRuntimeOptions(_0x5d57cd = {}, _0x49ba13 = "", _0x23a307 = {}) {
  const _0x3b50b1 = String(_0x5d57cd?.model || "").trim();
  if (!_0x3b50b1) {
    return _0x23a307 || {};
  }
  const _0x1b58d0 = normalizeProviderId(_0x49ba13 || _0x5d57cd?.provider);
  const _0x2b4ede = resolveModelExecution(_0x3b50b1, {
    providerHint: _0x1b58d0
  });
  const _0x4ff01f = _0x2b4ede?.executionManifest;
  if (!_0x4ff01f || _0x4ff01f.adapterType !== "modelApi" || _0x4ff01f.kind !== "video") {
    return _0x23a307 || {};
  }
  const _0x2743d3 = normalizeProviderId(_0x4ff01f.provider || _0x1b58d0);
  const _0x79fc53 = resolveVideoProviderConfig(_0x5d57cd, _0x2743d3);
  const _0x4fd84b = resolveManifestTaskPolling(_0x2743d3, _0x79fc53, _0x4ff01f, {
    modelManifest: _0x2b4ede?.modelManifest || null,
    payload: _0x5d57cd
  });
  const _0x3d8523 = resolveManifestErrorRules(_0x4ff01f);
  return {
    ...(_0x23a307 || {}),
    ...(!_0x23a307?.responseMapping && _0x4ff01f.responseMapping ? {
      responseMapping: _0x4ff01f.responseMapping
    } : {}),
    ...(!_0x23a307?.taskPolling && _0x4fd84b ? {
      taskPolling: _0x4fd84b
    } : {}),
    ...(!_0x23a307?.errorRules && _0x3d8523.length > 0 ? {
      errorRules: _0x3d8523
    } : {})
  };
}
export async function buildGenerateVideoRequest(_0x2cb547) {
  const _0x34d42e = applyCameraAngleToPrompt(_0x2cb547.prompt, _0x2cb547.cameraAngle);
  const _0x429c96 = resolveVideoExecution(_0x2cb547);
  const _0x5d9571 = resolveVideoProviderId(_0x2cb547, _0x429c96);
  const _0x48079c = _0x429c96?.executionManifest;
  const _0x37fec6 = _0x429c96?.modelManifest;
  if (_0x48079c?.adapterType === "localRuntime" && _0x48079c?.runtime === "dreaminaVideo") {
    const _0x2cac92 = buildDreaminaVideoSubmitRequest({
      ..._0x2cb547,
      prompt: _0x34d42e
    });
    return {
      url: _0x2cac92.url,
      headers: {
        "Content-Type": "application/json"
      },
      body: _0x2cac92.body
    };
  }
  if (!_0x5d9571 || !_0x48079c) {
    const _0x17cc59 = String(_0x2cb547?.model || "").trim() || "(empty)";
    throw new Error("Video model API manifest missing: " + _0x17cc59);
  }
  await ensureConfig();
  if (_0x48079c.adapterType === "modelApi") {
    const _0x51188b = await buildVideoRequestFromManifest(_0x2cb547, _0x34d42e, {
      getProviderConfig: getProviderConfig,
      processInputImages: processInputImages,
      processInputVideos: processInputVideos,
      processInputAudios: processInputAudios,
      uploadInputsToVolcengineFiles: uploadInputsToVolcengineFiles
    }, {
      expectedProvider: _0x37fec6?.provider || _0x5d9571
    });
    if (_0x51188b) {
      return _0x51188b;
    }
    throw new Error((_0x37fec6?.provider || _0x5d9571) + " video model API manifest missing: " + _0x2cb547.model);
  }
  if (_0x48079c.adapterType === "workflow") {
    if (_0x37fec6?.provider === "comfyui" || _0x5d9571 === "comfyui") {
      return a42_0x398e09.buildVideoRequest(_0x2cb547, _0x34d42e, {
        getProviderConfig: getProviderConfig,
        processInputImages: processInputImages,
        processInputVideos: processInputVideos,
        processInputAudios: processInputAudios,
        uploadInputToComfyUi: uploadInputToComfyUi
      });
    }
    return a42_0x31eee3.buildVideoRequest(_0x2cb547, _0x34d42e, {
      getProviderConfig: getProviderConfig,
      processInputImages: processInputImages,
      processInputVideos: processInputVideos,
      processInputAudios: processInputAudios
    });
  }
  throw new ApiError({
    type: "UNSUPPORTED_PROVIDER",
    provider: _0x5d9571,
    message: "暂不支持厂商 " + _0x5d9571 + " 的视频生成",
    retryable: false
  });
}
async function pollRunningHubVideoTask(_0x10232d, _0x33ce52, _0x4fb112, _0x353e41) {
  const _0x52364e = createRunningHubWorkflowQueueChangeEmitter(_0x353e41?.onRunningHubWorkflowQueueChange);
  const _0x15b192 = (_0x1c00fb, _0xe69bb4 = {}) => {
    _0x52364e?.({
      status: _0x1c00fb,
      queueIndex: _0x1c00fb === "queued" ? 0 : -1,
      queueLength: _0x1c00fb === "queued" ? 1 : 0,
      reason: "provider-task-status",
      taskId: String(_0x10232d || ""),
      ..._0xe69bb4
    });
  };
  const _0x88451 = isModelApiModel(_0x33ce52.model, "runninghub");
  const _0x4b078f = _0x4fb112 === "runninghubwf" && !_0x88451 ? resolveRunningHubWorkflowPollingPolicy(_0x353e41) : null;
  const _0xcf3214 = _0x4b078f?.pollIntervalMs ?? 2000;
  const _0xca40bd = _0x4b078f?.pollTimeoutMs ?? null;
  const _0x2f9bd3 = _0x4b078f?.maxPolls ?? 1200;
  const _0x45c087 = Date.now();
  const _0x4e7756 = _0x353e41?.useOpenapiQuery === true || _0x88451;
  const _0x4359f4 = getRunningHubTaskProviderProfileId(_0x33ce52);
  const _0x146775 = _0x88451 ? null : getProviderConfig(_0x4359f4 || "runninghubwf");
  const _0x42677c = _0x88451 ? resolveRunningHubModelApiProfileId(resolveVideoExecution(_0x33ce52)?.modelManifest?.modelId || _0x33ce52?.model, _0x4359f4) : normalizeRunningHubModelApiProfileId(_0x4359f4 || _0x146775?.providerProfileId);
  const _0x1d155c = _0x88451 ? resolveVideoProviderConfig(_0x33ce52, "runninghub") : _0x146775;
  const _0x3501ed = _0x88451 ? _0x1d155c.modelApiKey || _0x33ce52.apiKey : _0x1d155c.apiKey || _0x33ce52.apiKey;
  for (let _0x15a842 = 0; _0x15a842 < _0x2f9bd3; _0x15a842++) {
    if (_0xca40bd !== null && hasRunningHubWorkflowPollingTimedOut(_0x45c087, _0xca40bd)) {
      break;
    }
    if (_0x353e41?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0xcf3214 > 0) {
      await new Promise(_0x4b4e07 => setTimeout(_0x4b4e07, _0xcf3214));
    }
    if (_0xca40bd !== null && hasRunningHubWorkflowPollingTimedOut(_0x45c087, _0xca40bd)) {
      break;
    }
    try {
      const _0x197dd5 = await requester({
        url: _0x4e7756 ? "/api/v2/proxy/image" : "/api/v2/runninghubwf/query",
        method: "POST",
        provider: _0x4fb112,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(_0x4e7756 ? {
          apiUrl: buildRunningHubModelApiUrl(_0x42677c, "/openapi/v2/query"),
          apiKey: _0x3501ed,
          taskId: _0x10232d
        } : {
          apiKey: _0x3501ed,
          taskId: _0x10232d,
          providerProfileId: _0x42677c
        })
      });
      if (_0x4e7756) {
        const _0x3b0a7b = Number(_0x197dd5?.code);
        const _0xbf8f9 = _0x197dd5?.code !== undefined && _0x197dd5?.code !== null && Number.isFinite(_0x3b0a7b) ? _0x3b0a7b : null;
        if (_0xbf8f9 === 813) {
          _0x15b192("queued");
          continue;
        }
        if (_0xbf8f9 === 804) {
          _0x15b192("running");
          continue;
        }
        if (_0xbf8f9 !== null && _0xbf8f9 !== 0) {
          throw parseError(_0x4fb112, _0x197dd5, 200);
        }
        if (extractVideoUrls(_0x197dd5, _0x353e41?.responseMapping).length > 0) {
          return _0x197dd5;
        }
      }
      if (!_0x4e7756) {
        const _0x1c8b18 = Number(_0x197dd5?.code);
        const _0x338f98 = _0x197dd5?.code !== undefined && _0x197dd5?.code !== null && Number.isFinite(_0x1c8b18) ? _0x1c8b18 : null;
        if (_0x338f98 === 0 && Array.isArray(_0x197dd5.data) && _0x197dd5.data.length > 0) {
          if (extractVideoUrls(_0x197dd5, _0x353e41?.responseMapping).length > 0) {
            return _0x197dd5;
          }
          const _0x5a9efe = _0x197dd5.data.map(_0x51b7da => String(_0x51b7da?.status || _0x51b7da?.taskStatus || "").trim().toUpperCase()).filter(Boolean);
          if (_0x5a9efe.some(_0x155a3f => ["QUEUED", "QUEUEING", "PENDING", "WAITING", "SUBMITTED"].includes(_0x155a3f))) {
            _0x15b192("queued");
          } else if (_0x5a9efe.some(_0x2e2ba0 => ["RUNNING", "PROCESSING", "IN_PROGRESS"].includes(_0x2e2ba0))) {
            _0x15b192("running");
          }
          if (_0x5a9efe.some(_0x1935a8 => ["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(_0x1935a8))) {
            const _0x9e85b0 = parseError(_0x4fb112, _0x197dd5, 200);
            throw _0x9e85b0 || new ApiError({
              type: "TASK_FAILED",
              provider: _0x4fb112,
              message: "视频任务执行失败",
              raw: _0x197dd5,
              retryable: false
            });
          }
          continue;
        }
        if (_0x338f98 === 813) {
          _0x15b192("queued");
          continue;
        }
        if (_0x338f98 === 804) {
          _0x15b192("running");
          continue;
        }
        if (_0x338f98 !== null && _0x338f98 !== 0) {
          throw parseError(_0x4fb112, _0x197dd5, 200);
        }
      }
      const _0x1e21ce = _0x197dd5.data && Object.keys(_0x197dd5.data).length > 0 ? _0x197dd5.data : _0x197dd5;
      if (extractVideoUrls(_0x1e21ce, _0x353e41?.responseMapping).length > 0) {
        return _0x1e21ce;
      }
      const _0x5780e4 = parseTaskError(_0x4fb112, _0x1e21ce);
      if (_0x5780e4) {
        throw _0x5780e4;
      }
      const _0x49c508 = (_0x1e21ce.status || "").toUpperCase();
      if (["QUEUED", "QUEUEING", "PENDING", "WAITING", "SUBMITTED"].includes(_0x49c508)) {
        _0x15b192("queued");
      } else if (["RUNNING", "PROCESSING", "IN_PROGRESS"].includes(_0x49c508)) {
        _0x15b192("running");
      }
      if (["COMPLETED", "SUCCEEDED", "SUCCESS"].includes(_0x49c508)) {
        if (extractVideoUrls(_0x1e21ce, _0x353e41?.responseMapping).length === 0) {
          continue;
        }
        return _0x1e21ce;
      }
    } catch (_0x59043e) {
      if (_0x59043e instanceof ApiError) {
        if (_0x59043e.retryable === false || _0x59043e.type === ErrorType.TASK_FAILED || _0x59043e.type === ErrorType.TASK_TIMEOUT || _0x59043e.type === ErrorType.AUTH_ERROR || _0x59043e.type === ErrorType.FORBIDDEN || _0x59043e.type === ErrorType.INVALID_PARAMS || _0x59043e.type === ErrorType.INSUFFICIENT_BALANCE) {
          throw _0x59043e;
        }
      }
    }
  }
  throw ApiError.taskTimeout(_0x4fb112);
}
function parseVideoResponseData(_0x4814bb) {
  if (!_0x4814bb) {
    return {};
  }
  if (typeof _0x4814bb === "object") {
    return _0x4814bb;
  }
  const _0xc974dc = String(_0x4814bb || "").trim();
  if (!_0xc974dc) {
    return {};
  }
  try {
    return JSON.parse(_0xc974dc.replace(/^data:\s*/, ""));
  } catch {
    const _0x1cf374 = extractSseJsonSnapshots(_0xc974dc);
    if (_0x1cf374.length > 0) {
      for (const _0x2ed992 of _0x1cf374) {
        if (resolveAsyncVideoTaskId(_0x2ed992)) {
          return _0x2ed992;
        }
      }
      return _0x1cf374[_0x1cf374.length - 1];
    }
    throw new ApiError({
      type: "PARSE_ERROR",
      message: "无法解析服务端响应",
      retryable: false
    });
  }
}
function extractSseJsonSnapshots(_0x546f73) {
  const _0x548dfa = String(_0x546f73 || "").split("\n").filter(_0x4136e6 => _0x4136e6.trim().startsWith("data:"));
  if (_0x548dfa.length === 0) {
    return [];
  }
  const _0x334e29 = [];
  for (const _0x5a6972 of _0x548dfa) {
    const _0x267a86 = String(_0x5a6972 || "").trim().replace(/^data:\s*/, "").trim();
    if (!_0x267a86 || _0x267a86 === "[DONE]") {
      continue;
    }
    try {
      _0x334e29.push(JSON.parse(_0x267a86));
    } catch {}
  }
  return _0x334e29;
}
function extractRunningHubTaskIdFromRawText(_0xd44999) {
  const _0x1131ca = String(_0xd44999 || "");
  if (!_0x1131ca) {
    return "";
  }
  const _0x5568cf = [/"task_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskid"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /\btask[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /(?:\?|&)(?:task_id|taskId|taskid)=([a-zA-Z0-9._:-]+)/i];
  for (const _0x5b198e of _0x5568cf) {
    const _0x34207b = _0x1131ca.match(_0x5b198e);
    const _0x5447f8 = String(_0x34207b?.[1] || "").replace(/,/g, "").trim();
    if (_0x5447f8) {
      return _0x5447f8;
    }
  }
  return "";
}
function extractTaskIdFromResponseHeaders(_0x504709) {
  if (!_0x504709 || typeof _0x504709.get !== "function") {
    return "";
  }
  const _0x534d97 = ["x-task-id", "x-taskid", "x-request-id", "x-requestid", "x-job-id", "x-jobid", "task-id", "taskid", "request-id", "requestid", "job-id", "jobid"];
  for (const _0x5d6b4f of _0x534d97) {
    const _0x4a2f0c = String(_0x504709.get(_0x5d6b4f) || "").trim();
    if (_0x4a2f0c) {
      return _0x4a2f0c;
    }
  }
  if (typeof _0x504709.forEach === "function") {
    let _0x310e95 = "";
    _0x504709.forEach((_0x2e8c2d, _0x39c83b) => {
      if (_0x310e95) {
        return;
      }
      const _0x2cdde5 = String(_0x39c83b || "").trim().toLowerCase();
      const _0x6dd23d = String(_0x2e8c2d || "").trim();
      if (!_0x6dd23d) {
        return;
      }
      if (_0x2cdde5.includes("task") && _0x2cdde5.includes("id") || _0x2cdde5.includes("job") && _0x2cdde5.includes("id") || _0x2cdde5.includes("request") && _0x2cdde5.includes("id")) {
        _0x310e95 = _0x6dd23d;
      }
    });
    if (_0x310e95) {
      return _0x310e95;
    }
  }
  return "";
}
function normalizeTaskIdValue(_0x5b54ad) {
  return String(_0x5b54ad ?? "").replace(/,/g, "").trim();
}
function looksLikeTaskToken(_0x406bea) {
  const _0x467f7b = String(_0x406bea ?? "").trim();
  if (!_0x467f7b || _0x467f7b.length < 8) {
    return false;
  }
  const _0xf20801 = _0x467f7b.toLowerCase();
  if (["pending", "running", "success", "succeeded", "completed", "failed", "queued", "submitted"].includes(_0xf20801)) {
    return false;
  }
  return /^[a-zA-Z0-9._:-]+$/.test(_0x467f7b);
}
function findFirstDeepValueByKeyPattern(_0x21d602, _0x27b1cf, _0x57f124 = 8) {
  if (!_0x21d602 || typeof _0x21d602 !== "object") {
    return "";
  }
  const _0x162209 = new WeakSet();
  const _0xda72b3 = [{
    value: _0x21d602,
    depth: 0
  }];
  while (_0xda72b3.length > 0) {
    const {
      value: _0x271686,
      depth: _0x3b1310
    } = _0xda72b3.shift();
    if (!_0x271686 || typeof _0x271686 !== "object") {
      continue;
    }
    if (_0x162209.has(_0x271686)) {
      continue;
    }
    _0x162209.add(_0x271686);
    if (_0x3b1310 > _0x57f124) {
      continue;
    }
    const _0x4283a3 = Array.isArray(_0x271686) ? _0x271686.map((_0x35ba16, _0x576dc7) => [String(_0x576dc7), _0x35ba16]) : Object.entries(_0x271686);
    for (const [_0x5bae7a, _0x48ca35] of _0x4283a3) {
      const _0x5474df = String(_0x5bae7a || "").trim().toLowerCase();
      if (_0x27b1cf.test(_0x5474df)) {
        const _0x96786b = String(_0x48ca35 ?? "").trim();
        if (_0x96786b) {
          return _0x96786b;
        }
      }
      if (_0x48ca35 && typeof _0x48ca35 === "object") {
        _0xda72b3.push({
          value: _0x48ca35,
          depth: _0x3b1310 + 1
        });
      }
    }
  }
  return "";
}
function resolveRunningHubVideoTaskId(_0x44a75b, _0xedc5a = "", _0x14533f = null, _0x5860c9 = null) {
  const _0x2b729c = resolveMappedResponseValue(_0x44a75b, _0x5860c9?.taskIdPath);
  if (_0x2b729c) {
    return normalizeTaskIdValue(_0x2b729c);
  }
  const _0x1fb2a9 = extractRunningHubTaskIdFromRawText(_0xedc5a);
  if (_0x1fb2a9) {
    return _0x1fb2a9;
  }
  const _0x4fa853 = resolveAsyncVideoTaskId(_0x44a75b, _0x5860c9);
  if (_0x4fa853) {
    return normalizeTaskIdValue(_0x4fa853);
  }
  return normalizeTaskIdValue(extractTaskIdFromResponseHeaders(_0x14533f));
}
function normalizeVideoSubmitDiagnosticToken(_0x507aaa) {
  if (_0x507aaa === null || _0x507aaa === undefined || typeof _0x507aaa === "object") {
    return "";
  }
  return String(_0x507aaa).trim().replace(/[^a-zA-Z0-9._:-]/g, "").slice(0, 80);
}
function getVideoSubmitDiagnosticCandidates(_0x6e8563) {
  return [_0x6e8563, _0x6e8563?.data, _0x6e8563?.result, _0x6e8563?.output, _0x6e8563?.response, _0x6e8563?.results].flatMap(_0x13b7f3 => Array.isArray(_0x13b7f3) ? _0x13b7f3 : [_0x13b7f3]).filter(_0x5b5670 => _0x5b5670 && typeof _0x5b5670 === "object");
}
function getVideoSubmitDiagnosticToken(_0xb766d1, _0x30be9c = []) {
  const _0x42a487 = getVideoSubmitDiagnosticCandidates(_0xb766d1);
  for (const _0x27e7d2 of _0x42a487) {
    for (const _0x3056d4 of _0x30be9c) {
      const _0x224ff2 = normalizeVideoSubmitDiagnosticToken(_0x27e7d2?.[_0x3056d4]);
      if (_0x224ff2) {
        return _0x224ff2;
      }
    }
  }
  return "";
}
function isVideoSubmitSuccessCode(_0x3d7e59) {
  return ["", "0", "200", "201", "202", "ok", "success"].includes(String(_0x3d7e59 || "").trim().toLowerCase());
}
function hasExplicitVideoSubmitFailureSignal(_0x35a83f) {
  const _0x123fce = getVideoSubmitDiagnosticCandidates(_0x35a83f);
  const _0x4a3b85 = new Set(["failed", "failure", "error", "cancelled", "canceled", "rejected", "denied", "expired"]);
  const _0x3d6130 = new Set(["ok", "success", "succeeded", "submitted", "accepted", "queued", "running", "processing", "提交成功", "任务已提交", "已受理", "排队中", "处理中"]);
  for (const _0x46f5e9 of _0x123fce) {
    if (_0x46f5e9.success === false || _0x46f5e9.ok === false) {
      return true;
    }
    const _0x2ca61e = String(_0x46f5e9.status || _0x46f5e9.taskStatus || _0x46f5e9.task_status || "").trim().toLowerCase();
    if (_0x4a3b85.has(_0x2ca61e)) {
      return true;
    }
    const _0x153f1e = normalizeVideoSubmitDiagnosticToken(_0x46f5e9.errorCode ?? _0x46f5e9.error_code);
    if (_0x153f1e && _0x153f1e !== "0") {
      return true;
    }
    const _0x350e7a = normalizeVideoSubmitDiagnosticToken(_0x46f5e9.code);
    if (_0x350e7a && !isVideoSubmitSuccessCode(_0x350e7a)) {
      return true;
    }
    for (const _0x1ff8b5 of ["error", "errorMessage", "error_message", "failedReason", "failReason", "fail_reason", "failure_reason"]) {
      const _0x22e247 = _0x46f5e9[_0x1ff8b5];
      if (_0x22e247 !== null && _0x22e247 !== undefined && _0x22e247 !== "") {
        return true;
      }
    }
    const _0x5d1a6f = String(_0x46f5e9.message || _0x46f5e9.msg || "").trim();
    if (_0x5d1a6f && !_0x3d6130.has(_0x5d1a6f.toLowerCase())) {
      return true;
    }
  }
  return false;
}
function buildVideoSubmitMissingResultError(_0x5bf14d, _0x3e6626, {
  expectsTaskId = true
} = {}) {
  const _0x5365b2 = getVideoSubmitDiagnosticToken(_0x3e6626, ["status", "taskStatus", "task_status"]);
  const _0x235f11 = getVideoSubmitDiagnosticToken(_0x3e6626, ["errorCode", "error_code"]);
  const _0x2ad528 = getVideoSubmitDiagnosticToken(_0x3e6626, ["code"]);
  const _0x397be1 = _0x235f11 || (!isVideoSubmitSuccessCode(_0x2ad528) ? _0x2ad528 : "");
  const _0x304537 = _0x3e6626 === null ? "null" : _0x3e6626 === undefined ? "undefined" : Array.isArray(_0x3e6626) ? "array-" + _0x3e6626.length : typeof _0x3e6626;
  const _0x480480 = _0x3e6626 && typeof _0x3e6626 === "object" && !Array.isArray(_0x3e6626) ? Object.keys(_0x3e6626).map(_0xd0fd81 => normalizeVideoSubmitDiagnosticToken(_0xd0fd81)).filter(Boolean).slice(0, 12) : [];
  const _0x281bdc = [_0x5365b2 ? "状态：" + _0x5365b2 : "", _0x397be1 ? "错误码：" + _0x397be1 : "", "响应类型：" + _0x304537, _0x480480.length ? "响应字段：" + _0x480480.join(",") : ""].filter(Boolean);
  const _0x2ba0b1 = expectsTaskId ? "任务创建响应异常：服务端未返回任务 ID" : "视频生成响应异常：服务端未返回视频结果";
  return new ApiError({
    type: "PARSE_ERROR",
    provider: _0x5bf14d,
    code: _0x397be1 || undefined,
    message: "" + _0x2ba0b1 + (_0x281bdc.length ? "（" + _0x281bdc.join("；") + "）" : ""),
    raw: _0x3e6626,
    retryable: false
  });
}
export async function resumeRunningHubVideoTask(_0x49b741, _0x10fd3a, _0x5ca0e5 = {}) {
  const _0x124fd8 = resolveVideoExecution(_0x10fd3a);
  const _0x527a02 = resolveVideoProviderId(_0x10fd3a, _0x124fd8);
  if (_0x527a02 !== "runninghubwf") {
    throw new Error("仅支持恢复 RunningHub 工作流视频任务");
  }
  const _0x55569a = String(_0x49b741 || "").trim();
  if (!_0x55569a) {
    throw new Error("缺少 RunningHub 视频任务ID，无法恢复");
  }
  if (!String(_0x10fd3a?.apiKey || "").trim()) {
    await ensureConfig();
  }
  const _0x1b4ff2 = _0x5ca0e5?.useOpenapiQuery === true;
  return runTaskSingleFlight({
    provider: resolveVideoRuntimeProviderKey(_0x10fd3a, _0x527a02),
    kind: "video",
    taskId: _0x55569a
  }, async () => {
    const _0x4cb3d8 = await pollRunningHubVideoTask(_0x55569a, _0x10fd3a || {}, _0x527a02, {
      ..._0x5ca0e5,
      useOpenapiQuery: _0x1b4ff2
    });
    const _0xdd692a = processVideoTaskResult(_0x4cb3d8, _0x527a02, _0x5ca0e5);
    return await postProcessVideoResult(_0xdd692a, {
      providerId: _0x527a02,
      taskKey: _0x527a02 + ":video:" + _0x55569a,
      signal: _0x5ca0e5?.signal,
      saveTimeoutMs: _0x5ca0e5?.saveTimeoutMs
    });
  });
}
export async function resumeAsyncVideoTask(_0x1f210f, _0x262478 = {}, _0x424a3e = {}) {
  const _0x10530a = resolveVideoExecution(_0x262478);
  const _0x2766a6 = resolveVideoProviderId(_0x262478, _0x10530a);
  if (_0x2766a6 === "runninghubwf" || _0x2766a6 === "dreamina") {
    throw new Error("仅支持恢复非 RunningHub/Dreamina 的异步视频任务");
  }
  const _0x1cc80f = String(_0x1f210f || "").trim();
  if (!_0x1cc80f) {
    throw new Error("缺少异步视频任务ID，无法恢复");
  }
  await ensureConfig();
  const _0x287860 = resolveVideoTaskRuntimeOptions(_0x262478 || {}, _0x2766a6, _0x424a3e);
  const _0x20b1f8 = resolveVideoProviderConfig(_0x262478, _0x2766a6);
  const _0x4dd1d3 = String(_0x262478?.apiKey || (_0x2766a6 === "runninghub" ? _0x20b1f8?.modelApiKey : "") || _0x20b1f8?.apiKey || "").trim();
  if (!_0x4dd1d3) {
    throw new Error("API Key 未配置（厂商：" + _0x2766a6 + "），无法恢复视频任务");
  }
  return runTaskSingleFlight({
    provider: resolveVideoRuntimeProviderKey(_0x262478, _0x2766a6),
    kind: "video",
    taskId: _0x1cc80f
  }, async () => {
    if (_0x2766a6 === "runninghub") {
      const _0x5c7d55 = await pollRunningHubVideoTask(_0x1cc80f, {
        ..._0x262478,
        apiKey: _0x4dd1d3
      }, _0x2766a6, {
        ..._0x287860,
        useOpenapiQuery: true
      });
      const _0x4bb9a0 = processVideoTaskResult(_0x5c7d55, _0x2766a6, _0x287860);
      return await postProcessVideoResult(_0x4bb9a0, {
        providerId: _0x2766a6,
        taskKey: resolveVideoRuntimeProviderKey(_0x262478, _0x2766a6) + ":video:" + _0x1cc80f,
        signal: _0x424a3e?.signal,
        saveTimeoutMs: _0x424a3e?.saveTimeoutMs
      });
    }
    const _0x2bd980 = await pollVideoTask(_0x1cc80f, _0x2766a6, _0x4dd1d3, _0x287860);
    return await postProcessVideoResult(_0x2bd980, {
      providerId: _0x2766a6,
      taskKey: _0x2766a6 + ":video:" + _0x1cc80f,
      signal: _0x424a3e?.signal,
      saveTimeoutMs: _0x424a3e?.saveTimeoutMs
    });
  });
}
function normalizeDreaminaVideoTaskResult(_0x1dacff, _0x142421, {
  allowPending = false
} = {}) {
  const _0x555a19 = normalizeDreaminaTaskSnapshot(_0x1dacff, {
    submitId: _0x142421
  });
  if (_0x555a19?.phase === "failed") {
    const _0x76d2b = new Error(_0x555a19?.failReason || _0x555a19?.label || "查询失败");
    _0x76d2b.dreaminaSnapshot = _0x555a19;
    throw _0x76d2b;
  }
  if (allowPending && _0x555a19?.phase !== "done") {
    return {
      pending: true,
      message: _0x555a19?.label || "",
      dreaminaSnapshot: _0x555a19
    };
  }
  const _0x4c224f = Array.isArray(_0x555a19?.outputs) ? _0x555a19.outputs : [];
  const _0x19c3c1 = _0x4c224f.map(_0x143ce9 => {
    const _0x511220 = pickResultLocalPath(_0x143ce9);
    return {
      videoUrl: localPathToUrl(_0x511220) || _0x143ce9.localUrl || _0x143ce9.url,
      localPath: _0x511220
    };
  });
  return {
    isBatch: _0x19c3c1.length > 1,
    dreaminaSnapshot: _0x555a19,
    videos: _0x19c3c1,
    videoUrl: localPathToUrl(pickResultLocalPath(_0x4c224f[0])) || _0x4c224f[0]?.localUrl || _0x4c224f[0]?.url || "",
    localPath: pickResultLocalPath(_0x4c224f[0])
  };
}
export async function probeDreaminaVideoTask(_0x451ffc, _0x1ac9ba = {}) {
  const _0x1f19ce = String(_0x451ffc || "").trim();
  if (!_0x1f19ce) {
    throw new Error("缺少 Dreamina 提交ID，无法核验视频任务");
  }
  const _0x57dd69 = await queryDreaminaResult(_0x1f19ce, {
    autoDownload: true,
    retries: _0x1ac9ba?.retries,
    retryDelay: _0x1ac9ba?.retryDelay,
    signal: _0x1ac9ba?.signal
  });
  return normalizeDreaminaVideoTaskResult(_0x57dd69, _0x1f19ce, {
    allowPending: true
  });
}
export async function resumeDreaminaVideoTask(_0x4d9cf5, _0xe6b181 = {}) {
  const _0x4685c7 = String(_0x4d9cf5 || "").trim();
  if (!_0x4685c7) {
    throw new Error("缺少 Dreamina 提交ID，无法恢复视频任务");
  }
  const _0x550420 = await pollDreaminaUntilDone(_0x4685c7, {
    ..._0xe6b181,
    taskKind: "video"
  });
  return normalizeDreaminaVideoTaskResult(_0x550420, _0x4685c7);
}
function buildManifestVideoTaskPollUrls(_0x35a847, _0x3edb85) {
  const _0x4c5758 = [];
  const _0x2e4361 = _0x2d26c9 => {
    const _0x55adf9 = String(_0x2d26c9 || "").trim();
    if (!_0x55adf9) {
      return;
    }
    const _0x30b248 = _0x55adf9.replace("{taskId}", encodeURIComponent(String(_0x35a847)));
    if (_0x30b248 && !_0x4c5758.includes(_0x30b248)) {
      _0x4c5758.push(_0x30b248);
    }
  };
  _0x2e4361(_0x3edb85?.urlTemplate);
  if (Array.isArray(_0x3edb85?.fallbackUrlTemplates)) {
    _0x3edb85.fallbackUrlTemplates.forEach(_0x2e4361);
  }
  return _0x4c5758;
}
const ASYNC_VIDEO_SUCCESS_STATUSES = new Set(["completed", "complete", "done", "finished", "succeeded", "success"]);
const ASYNC_VIDEO_FAILURE_STATUSES = new Set(["failed", "failure", "fail", "error", "cancelled", "canceled", "expired"]);
function shouldRethrowVideoPollingError(_0x98edae) {
  if (!(_0x98edae instanceof ApiError)) {
    return false;
  }
  return _0x98edae.type === ErrorType.TASK_FAILED || _0x98edae.type === ErrorType.CONTENT_FILTERED || _0x98edae.type === ErrorType.TASK_TIMEOUT || _0x98edae.type === ErrorType.AUTH_ERROR || _0x98edae.type === ErrorType.FORBIDDEN || _0x98edae.type === ErrorType.INVALID_PARAMS || _0x98edae.type === ErrorType.INSUFFICIENT_BALANCE || _0x98edae.type === ErrorType.MODEL_UNAVAILABLE || _0x98edae.type === "PARSE_ERROR";
}
function isAgnesTaskNotExistError(_0x49c2b8) {
  if (!(_0x49c2b8 instanceof ApiError)) {
    return false;
  }
  const _0x1d97d0 = String(_0x49c2b8.message || "").trim().toLowerCase();
  return _0x1d97d0.includes("task_not_exist") || _0x1d97d0.includes("task not exist") || _0x1d97d0.includes("task not found") || _0x1d97d0.includes("video not found") || _0x1d97d0.includes("任务不存在") || _0x1d97d0.includes("任务或视频未找到");
}
function isAgnesVideoId(_0xf0deec) {
  return /^video_/i.test(String(_0xf0deec || "").trim());
}
function shouldTryManifestPollFallback({
  err: _0x5849b7,
  pollIndex: _0xc4b4b5,
  pollUrls: _0x232a92,
  providerId: _0x14366a,
  pollUrl: _0x355eb9,
  taskId: _0x442be5
} = {}) {
  if (_0xc4b4b5 >= _0x232a92.length - 1 || !(_0x5849b7 instanceof ApiError)) {
    return false;
  }
  const _0x5477f9 = String(_0x14366a || "").trim().toLowerCase();
  if (_0x5477f9 === "agnes" && isAgnesVideoId(_0x442be5)) {
    return false;
  }
  if (Number(_0x5849b7.status || _0x5849b7.code || 0) === 404) {
    return true;
  }
  return _0x5477f9 === "agnes" && String(_0x355eb9 || "").includes("/agnesapi?") && isAgnesTaskNotExistError(_0x5849b7);
}
function resolveVideoPollIntervalMs(_0x56152a = {}) {
  const _0x550e11 = Number(_0x56152a?.taskPolling?.pollIntervalMs || _0x56152a?.pollIntervalMs || 2000);
  if (!Number.isFinite(_0x550e11)) {
    return 2000;
  }
  return Math.min(30000, Math.max(1000, Math.trunc(_0x550e11)));
}
function resolveVideoPollAttempts(_0x42bcec = {}, _0x46e955 = 2000) {
  const _0x2fd0cc = Number(_0x42bcec?.taskPolling?.maxWaitMs || _0x42bcec?.maxWaitMs);
  if (!Number.isFinite(_0x2fd0cc) || _0x2fd0cc <= 0) {
    return 600;
  }
  const _0x4f4aa2 = Math.min(7200000, Math.max(60000, Math.trunc(_0x2fd0cc)));
  return Math.max(1, Math.ceil(_0x4f4aa2 / Math.max(1, _0x46e955)));
}
function resolveVideoTransportErrorPolicy(_0x4f9812 = {}) {
  const _0x1999fa = _0x4f9812?.taskPolling?.transportErrorPolicy;
  if (!_0x1999fa || typeof _0x1999fa !== "object" || Array.isArray(_0x1999fa)) {
    return null;
  }
  const _0x14e8e3 = _0x1cdd89 => new Set((Array.isArray(_0x1cdd89) ? _0x1cdd89 : []).map(_0x4f651a => Number(_0x4f651a)).filter(_0x241bbf => Number.isInteger(_0x241bbf) && _0x241bbf >= 400 && _0x241bbf <= 599));
  return {
    maxConsecutiveErrors: Math.min(10, Math.max(1, Math.trunc(Number(_0x1999fa.maxConsecutiveErrors) || 3))),
    retryableStatuses: _0x14e8e3(_0x1999fa.retryableStatuses),
    terminalStatuses: _0x14e8e3(_0x1999fa.terminalStatuses),
    surfaceLastError: _0x1999fa.surfaceLastError !== false
  };
}
function getVideoPollingErrorStatus(_0x2eb6a0) {
  const _0x3bff76 = Number(_0x2eb6a0?.status ?? _0x2eb6a0?.code);
  if (Number.isInteger(_0x3bff76)) {
    return _0x3bff76;
  } else {
    return null;
  }
}
async function pollVideoTask(_0x159434, _0x4184da, _0x2b76e9, _0x31b08a = {}) {
  const _0x21b551 = getProviderConfig(_0x4184da);
  const _0x170386 = resolveVideoPollIntervalMs(_0x31b08a);
  const _0x222c7f = _0x31b08a?.taskPolling?.waitUntilTerminal === true;
  const _0x295792 = _0x222c7f ? Number.POSITIVE_INFINITY : resolveVideoPollAttempts(_0x31b08a, _0x170386);
  const _0x3eaad4 = Number.isFinite(_0x295792) ? _0x295792 * _0x170386 : Number.POSITIVE_INFINITY;
  const _0x34d438 = Date.now();
  const _0x2837e2 = resolveVideoTransportErrorPolicy(_0x31b08a);
  let _0x38455b = 0;
  let _0x4a4b2e = null;
  for (let _0xf427e2 = 0; _0xf427e2 < _0x295792; _0xf427e2++) {
    if (Date.now() - _0x34d438 >= _0x3eaad4) {
      break;
    }
    if (_0x31b08a?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    await new Promise(_0x517de3 => setTimeout(_0x517de3, _0x170386));
    if (_0x31b08a?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    const _0x5c654f = encodeURIComponent(String(_0x159434));
    const _0x395928 = String(_0x21b551.apiUrl || "").replace(/\/+$/, "") + "/v1/tasks/" + _0x5c654f + (String(_0x4184da || "").trim().toLowerCase() === "apimart" ? "?language=zh" : "");
    const _0x4ec1b3 = buildManifestVideoTaskPollUrls(_0x159434, _0x31b08a?.taskPolling);
    const _0x50892f = _0x4ec1b3.length > 0 ? _0x4ec1b3 : [_0x395928];
    for (let _0x25ef37 = 0; _0x25ef37 < _0x50892f.length; _0x25ef37 += 1) {
      const _0x5a132e = _0x50892f[_0x25ef37];
      try {
        const _0x15ffb8 = await requester({
          url: "/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x5a132e),
          method: "GET",
          headers: {
            Authorization: "Bearer " + _0x2b76e9
          },
          provider: _0x4184da,
          timeout: 30000,
          signal: _0x31b08a?.signal
        });
        _0x38455b = 0;
        _0x4a4b2e = null;
        const _0x4461e3 = normalizeAsyncVideoTaskInfo(_0x15ffb8);
        const _0x3c9f0e = resolveAsyncVideoTaskStatus(_0x4461e3, _0x31b08a?.responseMapping);
        const _0x509a7d = parseTaskError(_0x4184da, _0x4461e3);
        if (_0x509a7d) {
          throw _0x509a7d;
        }
        const _0x4f78ba = isAsyncVideoTaskSuccessStatus(_0x3c9f0e, _0x31b08a?.taskPolling?.successStatuses);
        const _0x5d2612 = extractVideoUrls(_0x4461e3, _0x31b08a?.responseMapping).length > 0;
        if (_0x5d2612 && (!_0x3c9f0e || _0x4f78ba)) {
          return processVideoTaskResult(_0x4461e3, _0x4184da, _0x31b08a);
        }
        if (_0x4f78ba) {
          if (_0x31b08a?.taskPolling?.continuePollingOnSuccessWithoutResult === true) {
            break;
          }
          throw new ApiError({
            type: "PARSE_ERROR",
            provider: _0x4184da,
            message: "无法从服务器响应中提取视频地址",
            raw: _0x4461e3,
            retryable: false
          });
        }
        if (isAsyncVideoTaskFailureStatus(_0x3c9f0e, _0x31b08a?.taskPolling?.failedStatuses)) {
          throw ApiError.taskFailed(_0x4184da, extractAsyncVideoTaskFailureReason(_0x4461e3, _0x31b08a?.responseMapping) || "任务状态异常");
        }
        break;
      } catch (_0x22bda1) {
        const _0x38550b = applyManifestErrorRules(_0x22bda1, _0x31b08a?.errorRules, {
          provider: _0x4184da,
          phase: "poll"
        });
        const _0x54237d = shouldTryManifestPollFallback({
          err: _0x38550b,
          pollIndex: _0x25ef37,
          pollUrls: _0x50892f,
          providerId: _0x4184da,
          pollUrl: _0x5a132e,
          taskId: _0x159434
        });
        if (_0x54237d) {
          continue;
        }
        if (shouldRethrowVideoPollingError(_0x38550b)) {
          throw _0x38550b;
        }
        if (!_0x2837e2) {
          break;
        }
        const _0x1c5995 = getVideoPollingErrorStatus(_0x38550b);
        if (_0x38550b?.manifestRuleMatched === true && _0x38550b?.retryable === false) {
          throw _0x38550b;
        }
        const _0x1ffdf3 = _0x38550b?.type === ErrorType.RATE_LIMIT;
        if (!_0x1ffdf3 && _0x1c5995 !== null && _0x2837e2.terminalStatuses.has(_0x1c5995)) {
          throw _0x38550b;
        }
        const _0xa73b8b = _0x1ffdf3 || (_0x1c5995 === null ? _0x38550b?.retryable !== false : _0x2837e2.retryableStatuses.has(_0x1c5995));
        if (!_0xa73b8b) {
          throw _0x38550b;
        }
        _0x4a4b2e = _0x38550b;
        _0x38455b += 1;
        if (_0x38455b >= _0x2837e2.maxConsecutiveErrors) {
          throw _0x38550b;
        }
        break;
      }
    }
  }
  if (_0x2837e2?.surfaceLastError && _0x4a4b2e) {
    throw _0x4a4b2e;
  }
  throw ApiError.taskTimeout(_0x4184da);
}
function normalizeTaskSnapshotPayload(_0x4b0f9b) {
  if (_0x4b0f9b && typeof _0x4b0f9b === "object") {
    return _0x4b0f9b;
  }
  const _0x3bbd94 = String(_0x4b0f9b || "").trim();
  if (!_0x3bbd94) {
    return {};
  }
  try {
    return JSON.parse(_0x3bbd94);
  } catch {
    return {
      rawText: _0x3bbd94
    };
  }
}
function normalizeAsyncVideoTaskInfo(_0x8a4784) {
  const _0x408f76 = normalizeTaskSnapshotPayload(_0x8a4784);
  const _0x51b592 = _0x408f76 && typeof _0x408f76 === "object" && _0x408f76.data && typeof _0x408f76.data === "object" && !Array.isArray(_0x408f76.data);
  if (_0x51b592) {
    return {
      ..._0x408f76,
      ..._0x408f76.data
    };
  } else {
    return normalizeTaskSnapshotPayload(_0x408f76?.data || _0x408f76);
  }
}
function resolveAsyncVideoTaskStatus(_0x265baf, _0x1df43a = null) {
  const _0x560662 = resolveMappedResponseValue(_0x265baf, _0x1df43a?.statusPath);
  if (_0x560662) {
    return String(_0x560662).trim().toLowerCase();
  }
  const _0x10082a = Array.isArray(_0x265baf?.data) ? _0x265baf.data[0] : _0x265baf?.data && typeof _0x265baf.data === "object" ? _0x265baf.data : null;
  const _0x328eda = Array.isArray(_0x265baf?.results) ? _0x265baf.results[0] : _0x265baf?.results && typeof _0x265baf.results === "object" ? _0x265baf.results : null;
  const _0xe9a499 = _0x265baf?.result && typeof _0x265baf.result === "object" ? _0x265baf.result : null;
  const _0x41973a = _0x265baf?.output && typeof _0x265baf.output === "object" ? _0x265baf.output : null;
  return String(_0x10082a?.status || _0x265baf?.status || _0x265baf?.taskStatus || _0x265baf?.task_status || _0x265baf?.data?.status || _0xe9a499?.status || _0xe9a499?.taskStatus || _0xe9a499?.task_status || _0x41973a?.status || _0x41973a?.taskStatus || _0x41973a?.task_status || _0x328eda?.status || _0x265baf?.state || _0x265baf?.phase || "").trim().toLowerCase();
}
function resolveAsyncVideoTaskStatuses(_0x4ab123, _0x4a4ed7) {
  const _0x559aae = Array.isArray(_0x4ab123) ? _0x4ab123.map(_0x13362a => String(_0x13362a || "").trim().toLowerCase()).filter(_0x5c0977 => /^[a-z][a-z0-9_-]{0,63}$/.test(_0x5c0977)) : [];
  if (_0x559aae.length > 0) {
    return new Set(_0x559aae);
  } else {
    return _0x4a4ed7;
  }
}
function isAsyncVideoTaskSuccessStatus(_0x282ccf, _0xa28656 = null) {
  return resolveAsyncVideoTaskStatuses(_0xa28656, ASYNC_VIDEO_SUCCESS_STATUSES).has(String(_0x282ccf || "").trim().toLowerCase());
}
function isAsyncVideoTaskFailureStatus(_0xf84f1f, _0x3d012b = null) {
  const _0x4df80f = String(_0xf84f1f || "").trim().toLowerCase();
  return ASYNC_VIDEO_FAILURE_STATUSES.has(_0x4df80f) || resolveAsyncVideoTaskStatuses(_0x3d012b, ASYNC_VIDEO_FAILURE_STATUSES).has(_0x4df80f);
}
function stringifyTaskFailureValue(_0x2e1290) {
  if (_0x2e1290 == null) {
    return "";
  }
  if (typeof _0x2e1290 === "string") {
    return _0x2e1290.trim();
  }
  if (typeof _0x2e1290 === "number" || typeof _0x2e1290 === "boolean") {
    return String(_0x2e1290);
  }
  if (typeof _0x2e1290 === "object") {
    const _0x5cc6e2 = _0x2e1290.message || _0x2e1290.errorMessage || _0x2e1290.error_message || _0x2e1290.detail || _0x2e1290.reason || _0x2e1290.type || _0x2e1290.status || _0x2e1290.code;
    if (_0x5cc6e2) {
      return stringifyTaskFailureValue(_0x5cc6e2);
    }
    try {
      return JSON.stringify(_0x2e1290);
    } catch {
      return String(_0x2e1290 || "").trim();
    }
  }
  return String(_0x2e1290 || "").trim();
}
function extractAsyncVideoTaskFailureReason(_0x49e93a, _0x22881a = null) {
  const _0x4ce7a1 = resolveMappedResponseValues(_0x49e93a, _0x22881a?.errorPaths);
  const _0x5bc841 = [..._0x4ce7a1, _0x49e93a?.error, _0x49e93a?.error?.message, _0x49e93a?.error?.error?.message, _0x49e93a?.errorMessage, _0x49e93a?.error_message, _0x49e93a?.message, _0x49e93a?.failedReason, _0x49e93a?.failReason, _0x49e93a?.fail_reason, _0x49e93a?.failure_reason, _0x49e93a?.data?.error, _0x49e93a?.data?.error?.message, _0x49e93a?.data?.error?.error?.message, _0x49e93a?.data?.errorMessage, _0x49e93a?.data?.error_message, _0x49e93a?.data?.message, _0x49e93a?.data?.failedReason, _0x49e93a?.data?.failReason, _0x49e93a?.data?.fail_reason, _0x49e93a?.data?.failure_reason, _0x49e93a?.result?.error, _0x49e93a?.result?.error?.message, _0x49e93a?.result?.errorMessage, _0x49e93a?.result?.message, _0x49e93a?.rawText];
  for (const _0x28d441 of _0x5bc841) {
    const _0x1616db = stringifyTaskFailureValue(_0x28d441);
    if (_0x1616db) {
      return _0x1616db;
    }
  }
  return stringifyTaskFailureValue(_0x49e93a?.error) || stringifyTaskFailureValue(_0x49e93a?.data?.error) || stringifyTaskFailureValue(_0x49e93a?.result?.error) || "";
}
function isLikelyVideoUrl(_0x60b535) {
  const _0x28e5bd = String(_0x60b535 || "").trim();
  if (!_0x28e5bd) {
    return false;
  }
  if (!/^https?:\/\//i.test(_0x28e5bd) && !_0x28e5bd.startsWith("/")) {
    return false;
  }
  return /\.(mp4|mov|webm|mkv|avi|m4v|m3u8)(\?|#|$)/i.test(_0x28e5bd);
}
const RESULT_MEDIA_KIND_FIELDS = ["mediaKind", "mediaType", "mimeType", "contentType", "fileType", "outputType", "type", "format", "extension", "ext"];
function inferVideoResultMediaKind(_0x115b67 = {}, _0x109069 = "") {
  const _0x3e152e = String(_0x109069 || "").toLowerCase();
  if (/(^|[_-])video($|[_-])/.test(_0x3e152e) || _0x3e152e === "videourl") {
    return "video";
  }
  if (/(^|[_-])audio($|[_-])/.test(_0x3e152e) || _0x3e152e === "audiourl") {
    return "audio";
  }
  if (/(^|[_-])(image|img|thumb|thumbnail|poster|cover)($|[_-])/.test(_0x3e152e)) {
    return "image";
  }
  if (!_0x115b67 || typeof _0x115b67 !== "object" || Array.isArray(_0x115b67)) {
    return "";
  }
  for (const _0x15e256 of RESULT_MEDIA_KIND_FIELDS) {
    const _0x6358d7 = String(_0x115b67[_0x15e256] || "").trim().toLowerCase();
    if (!_0x6358d7) {
      continue;
    }
    if (/video|mp4|mov|webm|mkv|avi|m4v|m3u8/.test(_0x6358d7)) {
      return "video";
    }
    if (/audio|mp3|wav|aac|m4a|flac|ogg/.test(_0x6358d7)) {
      return "audio";
    }
    if (/image|png|jpe?g|webp|gif/.test(_0x6358d7)) {
      return "image";
    }
  }
  return "";
}
function extractVideoResultEntries(_0x5c7bdf) {
  const _0x5963cc = [];
  const _0x5d3c34 = new WeakSet();
  const _0x7d11c4 = ["videoUrl", "video_url", "url", "fileUrl", "file_url", "downloadUrl", "download_url", "contentUrl", "content_url", "output", "mediaUrl", "media_url", "resultUrl", "result_url", "video"];
  const _0x309b61 = ["thumbUrl", "thumbnailUrl", "thumbnail_url", "posterUrl", "poster_url"];
  const _0x2b195a = (_0x1aa9f0, _0x140809 = "") => {
    if (!_0x1aa9f0 || typeof _0x1aa9f0 !== "object" || Array.isArray(_0x1aa9f0)) {
      return String(_0x140809 || "").trim();
    }
    for (const _0x1fb071 of _0x309b61) {
      const _0x62b793 = String(_0x1aa9f0[_0x1fb071] || "").trim();
      if (_0x62b793) {
        return _0x62b793;
      }
    }
    return String(_0x140809 || "").trim();
  };
  const _0x350b81 = (_0xfabd9, _0x1acf79 = {}, _0x4ac1b5 = "") => {
    if (_0xfabd9 == null) {
      return;
    }
    if (Array.isArray(_0xfabd9)) {
      _0xfabd9.forEach(_0x509755 => _0x350b81(_0x509755, _0x1acf79, _0x4ac1b5));
      return;
    }
    if (typeof _0xfabd9 === "object") {
      _0x3c21b3(_0xfabd9, _0x1acf79);
      return;
    }
    const _0x2b5858 = String(_0xfabd9 || "").trim();
    if (!_0x2b5858) {
      return;
    }
    _0x5963cc.push({
      videoUrl: _0x2b5858,
      thumbUrl: _0x2b195a(_0x1acf79),
      mediaKind: inferVideoResultMediaKind(_0x1acf79, _0x4ac1b5)
    });
  };
  const _0x3c21b3 = (_0xde1452, _0x16bf05 = {}) => {
    if (_0xde1452 == null) {
      return;
    }
    if (Array.isArray(_0xde1452)) {
      _0xde1452.forEach(_0x2bbad1 => _0x3c21b3(_0x2bbad1, _0x16bf05));
      return;
    }
    if (typeof _0xde1452 !== "object") {
      return;
    }
    if (_0x5d3c34.has(_0xde1452)) {
      return;
    }
    _0x5d3c34.add(_0xde1452);
    const _0x20f812 = {
      ..._0x16bf05,
      ..._0xde1452,
      thumbUrl: _0x2b195a(_0xde1452, _0x2b195a(_0x16bf05)),
      mediaKind: inferVideoResultMediaKind(_0xde1452) || inferVideoResultMediaKind(_0x16bf05)
    };
    _0x7d11c4.forEach(_0x15c817 => {
      if (Object.prototype.hasOwnProperty.call(_0xde1452, _0x15c817)) {
        _0x350b81(_0xde1452[_0x15c817], _0x20f812, _0x15c817);
      }
    });
    Object.entries(_0xde1452).forEach(([_0x13c376, _0x47a152]) => {
      if (_0x7d11c4.includes(_0x13c376) || _0x309b61.includes(_0x13c376)) {
        return;
      }
      if (_0x47a152 && typeof _0x47a152 === "object") {
        _0x3c21b3(_0x47a152, _0x20f812);
      }
    });
  };
  _0x3c21b3(_0x5c7bdf);
  const _0x2a5c86 = [];
  const _0x293832 = new Set();
  for (const _0x1da8f8 of _0x5963cc) {
    const _0x3cf679 = String(_0x1da8f8?.videoUrl || "").trim();
    if (!_0x3cf679 || _0x293832.has(_0x3cf679)) {
      continue;
    }
    _0x293832.add(_0x3cf679);
    const _0x4d2296 = String(_0x1da8f8?.thumbUrl || "").trim();
    _0x2a5c86.push({
      videoUrl: _0x3cf679,
      ...(_0x4d2296 ? {
        thumbUrl: _0x4d2296
      } : {}),
      mediaKind: String(_0x1da8f8?.mediaKind || "").trim()
    });
  }
  const _0x4f22b0 = _0x2a5c86.filter(_0x2e0a72 => _0x2e0a72.mediaKind === "video" || isLikelyVideoUrl(_0x2e0a72.videoUrl));
  const _0xaa748c = _0x4f22b0.length ? _0x4f22b0 : _0x2a5c86;
  return _0xaa748c.map(({
    mediaKind: _0x5e35d2,
    ..._0x2a7218
  }) => _0x2a7218);
}
function resolveAsyncVideoTaskId(_0xfb3355, _0x3de672 = null) {
  const _0x4cca7e = resolveMappedResponseValue(_0xfb3355, _0x3de672?.taskIdPath);
  if (_0x4cca7e) {
    return _0x4cca7e;
  }
  if (typeof _0xfb3355?.data === "string" || typeof _0xfb3355?.data === "number") {
    const _0x590186 = String(_0xfb3355.data).trim();
    if (looksLikeTaskToken(_0x590186)) {
      return _0x590186;
    }
  }
  if (typeof _0xfb3355 === "string" || typeof _0xfb3355 === "number") {
    const _0x1d0d05 = String(_0xfb3355).trim();
    if (looksLikeTaskToken(_0x1d0d05)) {
      return _0x1d0d05;
    }
  }
  const _0x51d94e = Array.isArray(_0xfb3355?.data) ? _0xfb3355.data[0] : _0xfb3355?.data && typeof _0xfb3355.data === "object" ? _0xfb3355.data : Array.isArray(_0xfb3355?.results) ? _0xfb3355.results[0] : _0xfb3355?.results && typeof _0xfb3355.results === "object" ? _0xfb3355.results : null;
  const _0x30cee9 = _0xfb3355?.result && typeof _0xfb3355.result === "object" ? _0xfb3355.result : null;
  const _0x206cdd = _0xfb3355?.output && typeof _0xfb3355.output === "object" ? _0xfb3355.output : null;
  const _0x4655cb = _0xfb3355?.response && typeof _0xfb3355.response === "object" ? _0xfb3355.response : null;
  const _0x5423bd = _0x51d94e?.task_id || _0x51d94e?.taskId || _0x51d94e?.id || _0xfb3355?.task_id || _0xfb3355?.taskId || _0xfb3355?.id || _0xfb3355?.data?.task_id || _0xfb3355?.data?.taskId || _0xfb3355?.data?.id || _0x30cee9?.task_id || _0x30cee9?.taskId || _0x30cee9?.id || _0x206cdd?.task_id || _0x206cdd?.taskId || _0x206cdd?.id || _0x4655cb?.task_id || _0x4655cb?.taskId || _0x4655cb?.id || findFirstDeepValueByKeyPattern(_0xfb3355, /^(task_?id|taskid|request_?id|requestid)$/i) || findFirstDeepValueByKeyPattern(_0xfb3355, /^id$/i) || "";
  return String(_0x5423bd || "").trim();
}
function extractVideoUrls(_0x33bd29, _0x12bb6a = null) {
  if (_0x33bd29 === null || _0x33bd29 === undefined) {
    return [];
  }
  const _0x1fe01c = resolveMappedResponseValues(_0x33bd29, _0x12bb6a?.resultPaths);
  if (_0x1fe01c.length > 0) {
    return _0x1fe01c;
  }
  const _0x546c66 = extractVideoResultEntries(_0x33bd29);
  if (_0x546c66.length > 0) {
    return _0x546c66.map(_0xe263de => _0xe263de.videoUrl);
  }
  const _0x557334 = [];
  const _0x56ae5b = _0x303470 => {
    if (_0x303470 == null) {
      return;
    }
    if (Array.isArray(_0x303470)) {
      for (const _0x157696 of _0x303470) {
        _0x56ae5b(_0x157696);
      }
      return;
    }
    if (typeof _0x303470 === "object") {
      _0x56ae5b(_0x303470.videoUrl || _0x303470.video_url || _0x303470.url || _0x303470.fileUrl || _0x303470.video || _0x303470.output || _0x303470.mediaUrl);
      return;
    }
    const _0x27bb58 = String(_0x303470 || "").trim();
    if (_0x27bb58) {
      _0x557334.push(_0x27bb58);
    }
  };
  const _0x33a047 = _0x2a9599 => {
    const _0x5d0222 = [];
    const _0x4cdca5 = new Set();
    let _0x16de1b = 0;
    const _0x273796 = (_0x2dd3bd, _0x361458) => {
      if (_0x16de1b > 8000) {
        return;
      }
      if (_0x361458 > 6) {
        return;
      }
      _0x16de1b++;
      if (!_0x2dd3bd) {
        return;
      }
      if (typeof _0x2dd3bd === "string") {
        const _0x6387f9 = _0x2dd3bd.trim();
        if (isLikelyVideoUrl(_0x6387f9) && !_0x4cdca5.has(_0x6387f9)) {
          _0x4cdca5.add(_0x6387f9);
          _0x5d0222.push(_0x6387f9);
        }
        return;
      }
      if (Array.isArray(_0x2dd3bd)) {
        for (const _0x2a47d2 of _0x2dd3bd) {
          _0x273796(_0x2a47d2, _0x361458 + 1);
        }
        return;
      }
      if (typeof _0x2dd3bd === "object") {
        for (const _0x25165b of Object.values(_0x2dd3bd)) {
          _0x273796(_0x25165b, _0x361458 + 1);
        }
      }
    };
    _0x273796(_0x2a9599, 0);
    return _0x5d0222;
  };
  if (_0x33bd29.result?.videos && Array.isArray(_0x33bd29.result.videos)) {
    for (const _0x36b01c of _0x33bd29.result.videos) {
      _0x56ae5b(_0x36b01c?.url || _0x36b01c);
    }
  } else if (_0x33bd29.status === "succeeded" && _0x33bd29.results) {
    for (const _0x494438 of _0x33bd29.results) {
      _0x56ae5b(_0x494438);
    }
  } else if (_0x33bd29.data?.[0]?.url) {
    for (const _0x37a89a of _0x33bd29.data) {
      _0x56ae5b(_0x37a89a);
    }
  } else if (_0x33bd29.data?.[0]?.fileUrl) {
    for (const _0x41b7f6 of _0x33bd29.data) {
      _0x56ae5b(_0x41b7f6?.fileUrl);
    }
  } else if (_0x33bd29.data?.results) {
    for (const _0x23ac84 of _0x33bd29.data.results) {
      _0x56ae5b(_0x23ac84);
    }
  } else if (_0x33bd29.data?.[0]?.video) {
    for (const _0x2e5d07 of _0x33bd29.data) {
      _0x56ae5b(_0x2e5d07?.video);
    }
  } else if (Array.isArray(_0x33bd29.data)) {
    for (const _0x1fd180 of _0x33bd29.data) {
      _0x56ae5b(_0x1fd180);
    }
  } else if (Array.isArray(_0x33bd29.videos)) {
    for (const _0x47c170 of _0x33bd29.videos) {
      _0x56ae5b(_0x47c170);
    }
  } else if (_0x33bd29.status === "COMPLETED" && _0x33bd29.results) {
    for (const _0x556ed3 of _0x33bd29.results) {
      _0x56ae5b(_0x556ed3);
    }
  }
  const _0x1063e6 = _0x557334.filter(Boolean);
  const _0x302587 = _0x1063e6.filter(isLikelyVideoUrl);
  if (_0x302587.length > 0) {
    return Array.from(new Set(_0x302587));
  }
  if (_0x1063e6.length > 0) {
    return Array.from(new Set(_0x1063e6));
  }
  return _0x33a047(_0x33bd29);
}
function extractVideoEntries(_0xab5975, _0x3f77e2 = null) {
  const _0x29cdee = extractVideoResultEntries(_0xab5975);
  if (_0x29cdee.length > 0) {
    return _0x29cdee;
  }
  const _0x2f4b19 = resolveMappedResponseValues(_0xab5975, _0x3f77e2?.resultPaths);
  if (_0x2f4b19.length > 0) {
    return _0x2f4b19.map(_0x1ed706 => ({
      videoUrl: String(_0x1ed706 || "").trim()
    })).filter(_0x3425bf => _0x3425bf.videoUrl);
  }
  return extractVideoUrls(_0xab5975, _0x3f77e2).map(_0x21724e => ({
    videoUrl: String(_0x21724e || "").trim()
  })).filter(_0x507e32 => _0x507e32.videoUrl);
}
function processVideoTaskResult(_0x3406a2, _0x27e64d, _0x37a926 = {}) {
  const _0x3db39c = extractVideoEntries(_0x3406a2, _0x37a926?.responseMapping);
  if (_0x3db39c.length === 0) {
    const _0x38e26c = parseError(_0x27e64d, _0x3406a2, 200);
    if (_0x38e26c) {
      throw _0x38e26c;
    }
    const _0x2cab71 = parseTaskError(_0x27e64d, _0x3406a2);
    if (_0x2cab71) {
      throw new ApiError({
        type: "TASK_FAILED",
        provider: _0x27e64d,
        message: _0x2cab71.getUserMessage(),
        retryable: false
      });
    }
    const _0x5caf24 = extractAsyncVideoTaskFailureReason(_0x3406a2, _0x37a926?.responseMapping);
    if (_0x5caf24) {
      throw new ApiError({
        type: "TASK_FAILED",
        provider: _0x27e64d,
        message: _0x5caf24,
        retryable: false
      });
    }
    throw new ApiError({
      type: "PARSE_ERROR",
      provider: _0x27e64d,
      message: "无法从服务器响应中提取视频地址",
      raw: _0x3406a2,
      retryable: false
    });
  }
  return {
    videoUrl: _0x3db39c[0].videoUrl,
    thumbUrl: _0x3db39c[0].thumbUrl,
    isBatch: _0x3db39c.length > 1,
    videos: _0x3db39c
  };
}
function extractVideoUrl(_0x46adc0) {
  if (_0x46adc0 === null || _0x46adc0 === undefined) {
    return null;
  }
  return _0x46adc0.videoUrl || _0x46adc0.url || _0x46adc0.data && _0x46adc0.data[0]?.url || null;
}
function _normalizeRemoteUrl(_0xbde3a0) {
  const _0x48b3ae = String(_0xbde3a0 || "").trim();
  if (!_0x48b3ae) {
    return "";
  }
  if (_0x48b3ae.startsWith("//")) {
    return "https:" + _0x48b3ae;
  }
  if (_0x48b3ae.startsWith("/")) {
    return _0x48b3ae;
  }
  if (/^data:/i.test(_0x48b3ae)) {
    return _0x48b3ae;
  }
  if (/^blob:/i.test(_0x48b3ae)) {
    return _0x48b3ae;
  }
  if (/^https?:\/\//i.test(_0x48b3ae)) {
    return _0x48b3ae;
  }
  return "https://" + _0x48b3ae.replace(/^\/+/, "");
}
function _guessExtFromUrl(_0x19bdec, _0x693dbb) {
  try {
    const _0x3b1ad6 = new URL(String(_0x19bdec || ""), location?.href || undefined);
    const _0xfbf0eb = String(_0x3b1ad6.pathname || "");
    const _0x2012e2 = _0xfbf0eb.split("/").filter(Boolean).pop() || "";
    const _0x19bc45 = _0x2012e2.lastIndexOf(".");
    if (_0x19bc45 > 0 && _0x19bc45 < _0x2012e2.length - 1) {
      const _0x52cdb1 = _0x2012e2.slice(_0x19bc45 + 1).toLowerCase();
      if (/^[a-z0-9]{1,5}$/.test(_0x52cdb1)) {
        return _0x52cdb1;
      }
    }
  } catch {}
  return _0x693dbb;
}
function _toLocalPathIfSameOrigin(_0x2b8e96) {
  return urlToLocalPath(_0x2b8e96);
}
function _isRelativeApiUrl(_0x39c0b0) {
  const _0x42d135 = String(_0x39c0b0 || "").trim();
  return _0x42d135.startsWith("/") && !_0x42d135.startsWith("//");
}
function _canFetchOutputUrl(_0x5334fa) {
  const _0x2f3413 = String(_0x5334fa || "").trim();
  return /^https?:\/\//i.test(_0x2f3413) || /^data:/i.test(_0x2f3413) || /^blob:/i.test(_0x2f3413) || _isRelativeApiUrl(_0x2f3413);
}
async function _fetchOutputBlob(_0x52a5f7, _0x286a8f, _0x69b037 = 120000) {
  if (_isRelativeApiUrl(_0x52a5f7)) {
    return await requester({
      url: _0x52a5f7,
      method: "GET",
      provider: "local",
      responseType: "blob",
      signal: _0x286a8f,
      timeout: _0x69b037
    });
  }
  return await fetchRemoteBlob(_0x52a5f7, {
    signal: _0x286a8f,
    timeout: _0x69b037
  });
}
async function _trySaveOutputByClientDownload(_0x5b6f74, _0x271f4d, _0x3f0e96 = {}) {
  const _0x5503f5 = String(_0x5b6f74 || "").trim();
  if (!_canFetchOutputUrl(_0x5503f5)) {
    return {
      localPath: null,
      error: "invalid url"
    };
  }
  const _0x140e3e = _0x3f0e96?.signal;
  const _0x42d462 = Number(_0x3f0e96?.timeoutMs) > 0 ? Number(_0x3f0e96.timeoutMs) : 120000;
  let _0x1d6b1d = null;
  try {
    _0x1d6b1d = await _fetchOutputBlob(_0x5503f5, _0x140e3e, _0x42d462);
  } catch (_0x49f972) {
    const _0x11fe74 = _0x49f972 instanceof Error ? _0x49f972.message : String(_0x49f972 || "");
    return {
      localPath: null,
      error: _0x11fe74 || "client download failed"
    };
  }
  if (!_0x1d6b1d) {
    return {
      localPath: null,
      error: "empty blob"
    };
  }
  const _0x2192ac = String(_0x271f4d || "").trim().toLowerCase() || "bin";
  const _0x4eb215 = new URLSearchParams({
    ext: _0x2192ac
  });
  try {
    const _0x21973a = await requester({
      url: "/api/v2/save_output?" + _0x4eb215.toString(),
      method: "POST",
      provider: "local",
      timeout: _0x42d462,
      signal: _0x140e3e,
      headers: {
        "Content-Type": "application/octet-stream"
      },
      body: _0x1d6b1d
    });
    return {
      localPath: pickResultLocalPath(_0x21973a) || null,
      error: null
    };
  } catch (_0x4f899b) {
    const _0x2b48b2 = _0x4f899b instanceof Error ? _0x4f899b.message : String(_0x4f899b || "");
    return {
      localPath: null,
      error: _0x2b48b2 || "save failed"
    };
  }
}
async function trySaveOutputFromUrl(_0x293051, _0x515558 = {}) {
  const _0x5e98c4 = _toLocalPathIfSameOrigin(_0x293051);
  if (_0x5e98c4) {
    return {
      localPath: _0x5e98c4,
      error: null
    };
  }
  const _0x35497a = _normalizeRemoteUrl(_0x293051);
  if (!_0x35497a) {
    return {
      localPath: null,
      error: "empty url"
    };
  }
  const _0x47fee6 = _guessExtFromUrl(_0x35497a, "mp4");
  const _0xd1e800 = Number(_0x515558?.timeoutMs) > 0 ? Number(_0x515558.timeoutMs) : VIDEO_RESULT_SAVE_TIMEOUT_MS;
  const _0x1f1678 = _0x515558?.signal;
  try {
    if (_isRelativeApiUrl(_0x35497a)) {
      return await _trySaveOutputByClientDownload(_0x35497a, _0x47fee6, {
        signal: _0x1f1678,
        timeoutMs: _0xd1e800
      });
    }
    const _0x2e4200 = await requester({
      url: "/api/v2/save_output_from_url",
      method: "POST",
      provider: "local",
      timeout: _0xd1e800,
      signal: _0x1f1678,
      retries: VIDEO_RESULT_SAVE_RETRIES,
      retryDelay: VIDEO_RESULT_SAVE_RETRY_DELAY_MS,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: _0x35497a,
        ext: _0x47fee6,
        maxBytes: 1073741824,
        dedupeKey: _0x515558?.dedupeKey
      })
    });
    return {
      localPath: pickResultLocalPath(_0x2e4200) || null,
      error: null
    };
  } catch (_0x3dd2b2) {
    const _0x4ba0b7 = _0x3dd2b2 instanceof Error ? String(_0x3dd2b2.message || "") : String(_0x3dd2b2 || "");
    const _0x57b11d = _0x3dd2b2 instanceof ApiError ? _0x3dd2b2.status : null;
    const _0x194887 = _0x57b11d === 400 || _0x57b11d === 401 || _0x57b11d === 403 || _0x57b11d === 502 || _0x57b11d === 504;
    if (_0x194887) {
      const _0x5de17e = await _trySaveOutputByClientDownload(_0x35497a, _0x47fee6, {
        signal: _0x1f1678,
        timeoutMs: _0xd1e800
      });
      if (_0x5de17e.localPath) {
        return _0x5de17e;
      }
      if (_0x5de17e.error) {
        return {
          localPath: null,
          error: "" + _0x4ba0b7 + (_0x5de17e.error ? "；浏览器兜底失败：" + _0x5de17e.error : "")
        };
      }
    }
    return {
      localPath: null,
      error: _0x4ba0b7 || "save failed"
    };
  }
}
function getVideoResultSourceUrl(_0x37e1a0) {
  if (typeof _0x37e1a0 === "string") {
    return String(_0x37e1a0 || "").trim();
  }
  if (!_0x37e1a0 || typeof _0x37e1a0 !== "object" || Array.isArray(_0x37e1a0)) {
    return "";
  }
  return String(_0x37e1a0.videoUrl || _0x37e1a0.url || _0x37e1a0.localUrl || localPathToUrl(_0x37e1a0.localPath) || "").trim();
}
function buildPostProcessedVideoItem(_0x50f664, _0x47b934 = {}) {
  const _0x5bd1fc = _0x50f664 && typeof _0x50f664 === "object" && !Array.isArray(_0x50f664) ? _0x50f664 : {
    videoUrl: _0x50f664
  };
  const _0x3e58d7 = getVideoResultSourceUrl(_0x5bd1fc);
  const _0x1a7154 = pickResultLocalPath(_0x47b934) || pickResultLocalPath(_0x5bd1fc);
  const _0x10cdea = localPathToUrl(_0x1a7154);
  const _0x52d074 = _0x10cdea || _0x3e58d7;
  const _0x1b990f = {
    ..._0x5bd1fc,
    videoUrl: _0x52d074
  };
  if (_0x3e58d7 && _0x3e58d7 !== _0x52d074 && !String(_0x1b990f.sourceUrl || "").trim()) {
    _0x1b990f.sourceUrl = _0x3e58d7;
  }
  if (_0x1a7154) {
    _0x1b990f.localPath = _0x1a7154;
  } else {
    delete _0x1b990f.localPath;
  }
  for (const _0x48ed0b of ["displayLocalPath", "posterUrl", "thumbUrl", "posterLocalPath", "thumbLocalPath", "videoThumbSrc", "videoProxyStatus", "videoCodec"]) {
    if (_0x47b934?.[_0x48ed0b]) {
      _0x1b990f[_0x48ed0b] = _0x47b934[_0x48ed0b];
    }
  }
  if (_0x47b934?.error) {
    _0x1b990f.saveError = _0x47b934.error;
  } else {
    delete _0x1b990f.saveError;
  }
  if (_0x47b934?.error && _0x3e58d7 && !_0x1a7154) {
    _0x1b990f.remoteFallbackUrl = _0x3e58d7;
    _0x1b990f.localSaveError = _0x47b934.error;
  } else {
    delete _0x1b990f.remoteFallbackUrl;
    delete _0x1b990f.localSaveError;
  }
  return _0x1b990f;
}
async function finalizePostProcessedVideoItem(_0x299149, _0x450fb2 = {}) {
  const _0x35035e = buildPostProcessedVideoItem(_0x299149, _0x450fb2);
  try {
    return await ensureVideoResultThumbnail(_0x35035e);
  } catch {
    return _0x35035e;
  }
}
async function postProcessVideoResult(_0x378464, _0xc9f888 = {}) {
  if (!_0x378464) {
    return _0x378464;
  }
  if (Array.isArray(_0x378464.videos)) {
    const _0x575c68 = [];
    for (const _0x2d8ca3 of _0x378464.videos) {
      const _0xa94ee8 = getVideoResultSourceUrl(_0x2d8ca3);
      if (!_0xa94ee8) {
        continue;
      }
      const _0x378bef = await trySaveOutputFromUrl(_0xa94ee8, {
        dedupeKey: _0xc9f888?.taskKey ? _0xc9f888.taskKey + ":" + _0xa94ee8 : undefined,
        signal: _0xc9f888?.signal,
        timeoutMs: _0xc9f888?.saveTimeoutMs
      });
      _0x575c68.push(await finalizePostProcessedVideoItem(_0x2d8ca3, _0x378bef));
    }
    if (_0x575c68.length === 0 && getVideoResultSourceUrl(_0x378464)) {
      const _0x3d6ce8 = {
        ..._0x378464
      };
      delete _0x3d6ce8.isBatch;
      delete _0x3d6ce8.videos;
      return await postProcessVideoResult(_0x3d6ce8, _0xc9f888);
    }
    if (_0x575c68.length === 0) {
      throw new ApiError({
        type: "PARSE_ERROR",
        provider: _0xc9f888?.providerId || "unknown",
        message: "无法从服务器响应中提取视频地址",
        raw: _0x378464,
        retryable: false
      });
    }
    return {
      isBatch: Boolean(_0x378464.isBatch || _0x575c68.length > 1),
      videos: _0x575c68,
      videoUrl: _0x575c68[0]?.videoUrl,
      sourceUrl: _0x575c68[0]?.sourceUrl,
      posterUrl: _0x575c68[0]?.posterUrl,
      thumbUrl: _0x575c68[0]?.thumbUrl,
      localPath: _0x575c68[0]?.localPath,
      displayLocalPath: _0x575c68[0]?.displayLocalPath,
      posterLocalPath: _0x575c68[0]?.posterLocalPath,
      thumbLocalPath: _0x575c68[0]?.thumbLocalPath,
      videoThumbSrc: _0x575c68[0]?.videoThumbSrc,
      videoProxyStatus: _0x575c68[0]?.videoProxyStatus,
      videoCodec: _0x575c68[0]?.videoCodec,
      saveError: _0x575c68[0]?.saveError,
      remoteFallbackUrl: _0x575c68[0]?.remoteFallbackUrl,
      localSaveError: _0x575c68[0]?.localSaveError
    };
  }
  if (_0x378464.videoUrl) {
    const _0x531dc5 = await trySaveOutputFromUrl(_0x378464.videoUrl, {
      dedupeKey: _0xc9f888?.taskKey ? _0xc9f888.taskKey + ":" + _0x378464.videoUrl : undefined,
      signal: _0xc9f888?.signal,
      timeoutMs: _0xc9f888?.saveTimeoutMs
    });
    return await finalizePostProcessedVideoItem(_0x378464, _0x531dc5);
  }
  return _0x378464;
}
function isComfyUiHistoryPolling(_0x50f938 = {}) {
  return String(_0x50f938?.mode || "").trim() === "comfyui-history";
}
async function pollComfyUiVideoTask(_0x2dd7e2, _0x17f15e = {}) {
  const _0x433e6a = String(_0x2dd7e2 || "").trim();
  const _0x441079 = _0x17f15e?.taskPolling || {};
  const _0x5508e1 = String(_0x441079.baseUrl || "").trim();
  for (let _0x36870a = 0; _0x36870a < 600; _0x36870a++) {
    if (_0x17f15e?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    await new Promise(_0x21b9f7 => setTimeout(_0x21b9f7, 2000));
    if (_0x17f15e?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    const _0x187a10 = new URLSearchParams({
      promptId: _0x433e6a,
      ...(_0x5508e1 ? {
        baseUrl: _0x5508e1
      } : {}),
      ...(_0x441079.allowCloudBaseUrl ? {
        allowCloudBaseUrl: "1"
      } : {})
    });
    const _0x1d8449 = await requester({
      url: "/api/v2/comfyui/history?" + _0x187a10.toString(),
      method: "GET",
      provider: "comfyui",
      timeout: 30000,
      signal: _0x17f15e?.signal
    });
    const _0x1bea18 = typeof _0x17f15e?.resultExtractor === "function" ? _0x17f15e.resultExtractor(_0x1d8449) : _0x1d8449;
    if (extractVideoUrls(_0x1bea18, _0x17f15e?.responseMapping).length > 0) {
      return _0x1bea18;
    }
    const _0x229e1c = resolveAsyncVideoTaskStatus(_0x1bea18, _0x17f15e?.responseMapping);
    if (isAsyncVideoTaskFailureStatus(_0x229e1c, _0x17f15e?.taskPolling?.failedStatuses)) {
      const _0x4ac412 = parseError("comfyui", _0x1bea18, 200);
      if (_0x4ac412) {
        throw _0x4ac412;
      }
      throw ApiError.taskFailed("comfyui", extractAsyncVideoTaskFailureReason(_0x1bea18, _0x17f15e?.responseMapping) || "ComfyUI 任务执行失败");
    }
  }
  throw ApiError.taskTimeout("comfyui");
}
async function generateVideoUnqueued(_0x572138, _0x3ba791 = {}) {
  const _0xc16ad2 = resolveVideoExecution(_0x572138);
  const _0x8e6763 = resolveVideoProviderId(_0x572138, _0xc16ad2);
  const _0x4afa45 = _0xc16ad2?.executionManifest;
  const _0xd3f41f = _0x4afa45?.adapterType === "workflow";
  if (_0x4afa45?.adapterType === "localRuntime" && _0x4afa45?.runtime === "dreaminaVideo") {
    const _0x4d5300 = {
      ..._0x572138,
      prompt: applyCameraAngleToPrompt(_0x572138.prompt, _0x572138.cameraAngle)
    };
    return await runDreaminaVideoGeneration(_0x4d5300, _0x3ba791);
  }
  const _0x3564b1 = await buildGenerateVideoRequest(_0x572138);
  const _0x5982e2 = String(_0x3564b1?.providerProfileId || _0x3564b1?.rhProviderProfileId || _0x572138?.providerProfileId || _0x572138?.rhProviderProfileId || "").trim();
  const _0x168a71 = _0x8e6763 === "runninghubwf" && _0x5982e2 ? {
    ..._0x572138,
    providerProfileId: _0x5982e2,
    rhProviderProfileId: _0x5982e2
  } : _0x572138;
  const _0x57737d = _0x3564b1?.responseMapping || null;
  const _0x38b016 = {
    ...(_0x3ba791 || {}),
    ...(_0x57737d ? {
      responseMapping: _0x57737d
    } : {}),
    ...(_0x3564b1?.taskPolling ? {
      taskPolling: _0x3564b1.taskPolling
    } : {}),
    ...(Array.isArray(_0x3564b1?.errorRules) && _0x3564b1.errorRules.length > 0 ? {
      errorRules: _0x3564b1.errorRules
    } : {}),
    ...(typeof _0x3564b1?.resultExtractor === "function" ? {
      resultExtractor: _0x3564b1.resultExtractor
    } : {})
  };
  const _0x1521fd = {
    ...(_0x3564b1.headers || {})
  };
  const _0x776ef6 = String(_0x572138?.installId || "").trim();
  if (_0x776ef6) {
    _0x1521fd["X-AIC-Install-Id"] = _0x776ef6;
  }
  let _0x530b82;
  let _0x187b18 = "";
  let _0x10f3d2 = null;
  try {
    if (_0xd3f41f) {
      const _0x2d86ce = await requester({
        url: _0x3564b1.url,
        method: "POST",
        provider: _0x8e6763,
        timeout: GENERATION_TIMEOUT,
        signal: _0x3ba791?.signal,
        headers: _0x1521fd,
        body: JSON.stringify(_0x3564b1.body),
        responseType: "text",
        returnMeta: true
      });
      _0x187b18 = String(_0x2d86ce?.data ?? "");
      _0x10f3d2 = _0x2d86ce?.headers || null;
      _0x530b82 = parseVideoResponseData(_0x187b18);
    } else {
      _0x530b82 = await requester({
        url: _0x3564b1.url,
        method: "POST",
        provider: _0x8e6763,
        timeout: GENERATION_TIMEOUT,
        signal: _0x3ba791?.signal,
        headers: _0x1521fd,
        body: JSON.stringify(_0x3564b1.body)
      });
    }
  } catch (_0x43f9fb) {
    const _0x539f7b = _0x43f9fb instanceof ApiError ? _0x43f9fb : parseNetworkError(_0x8e6763, _0x43f9fb, GENERATION_TIMEOUT);
    throw applyManifestErrorRules(_0x539f7b, _0x38b016.errorRules, {
      provider: _0x8e6763,
      phase: "submit"
    });
  }
  let _0xd878a2 = null;
  let _0x35e17d = "";
  if (_0xd3f41f) {
    const _0x15b63c = Number(_0x530b82?.code);
    const _0x274f36 = _0x530b82?.code !== undefined && _0x530b82?.code !== null && Number.isFinite(_0x15b63c) ? _0x15b63c : null;
    const _0xd533f = resolveRunningHubVideoTaskId(_0x530b82, _0x187b18, _0x10f3d2, _0x57737d) || null;
    const _0x15f2f8 = _0xd533f && (_0x274f36 === 804 || _0x274f36 === 813);
    if (_0x274f36 !== null && _0x274f36 !== 0 && !_0x15f2f8) {
      const _0x5bde22 = parseError(_0x8e6763, _0x530b82, 200);
      throw _0x5bde22 || new ApiError({
        type: "TASK_FAILED",
        provider: _0x8e6763,
        code: _0x274f36,
        message: String(_0x530b82?.message || _0x530b82?.msg || "RunningHub 任务提交失败"),
        raw: _0x530b82,
        retryable: _0x274f36 === 421
      });
    }
    if (_0x8e6763 === "comfyui") {
      const _0x146716 = parseError(_0x8e6763, _0x530b82, 200);
      if (_0x146716) {
        throw _0x146716;
      }
    }
    if (_0xd533f) {
      const _0x4a1ce0 = String(_0xd533f);
      if (_0x274f36 === 813) {
        _0x3ba791?.onRunningHubWorkflowQueueChange?.({
          status: "queued",
          queueIndex: 0,
          queueLength: 1,
          reason: "provider-accepted-queue",
          taskId: _0x4a1ce0
        });
      }
      _0x35e17d = resolveVideoRuntimeProviderKey(_0x168a71, _0x8e6763) + ":video:" + _0x4a1ce0;
      const _0x18d51c = _0x3564b1.useOpenapiQuery === true || _0x3564b1.url === "/api/v2/proxy/image";
      _0x3ba791?.onTaskMeta?.({
        taskId: _0x4a1ce0,
        useOpenapiQuery: _0x18d51c,
        ...(_0x5982e2 ? {
          providerProfileId: _0x5982e2,
          rhProviderProfileId: _0x5982e2
        } : {})
      });
      _0x3ba791?.onTaskId?.(_0x4a1ce0);
      const _0x3f9a6f = _0x8e6763 === "comfyui" || isComfyUiHistoryPolling(_0x38b016.taskPolling) ? await pollComfyUiVideoTask(_0x4a1ce0, _0x38b016) : await pollRunningHubVideoTask(_0x4a1ce0, _0x168a71, _0x8e6763, {
        ..._0x38b016,
        useOpenapiQuery: _0x18d51c
      });
      _0xd878a2 = processVideoTaskResult(_0x3f9a6f, _0x8e6763, _0x38b016);
    }
  }
  if (!_0xd878a2) {
    const _0x33b501 = resolveAsyncVideoTaskId(_0x530b82, _0x57737d);
    if (_0x33b501) {
      const _0x4a8438 = String(_0x33b501);
      _0x35e17d = resolveVideoRuntimeProviderKey(_0x572138, _0x8e6763) + ":video:" + _0x4a8438;
      const _0x216094 = resolveVideoProviderConfig(_0x572138, _0x8e6763);
      const _0x180789 = _0x3564b1.useOpenapiQuery === true || _0x8e6763 === "runninghub" && _0x3564b1.url === "/api/v2/proxy/image";
      const _0x398467 = _0x572138.apiKey || (_0x8e6763 === "runninghub" ? _0x216094.modelApiKey : "") || _0x216094.apiKey;
      _0x3ba791?.onTaskMeta?.({
        taskId: _0x4a8438,
        provider: _0x8e6763,
        kind: "video",
        ...(_0x180789 ? {
          useOpenapiQuery: true
        } : {})
      });
      _0x3ba791?.onTaskId?.(_0x4a8438);
      if (_0x180789) {
        const _0x480b80 = await pollRunningHubVideoTask(_0x4a8438, {
          ..._0x572138,
          apiKey: _0x398467
        }, _0x8e6763, {
          ..._0x38b016,
          useOpenapiQuery: true
        });
        _0xd878a2 = processVideoTaskResult(_0x480b80, _0x8e6763, _0x38b016);
      } else {
        _0xd878a2 = await pollVideoTask(_0x4a8438, _0x8e6763, _0x398467, _0x38b016);
      }
    }
  }
  if (!_0xd878a2) {
    const _0x117abe = extractVideoUrls(_0x530b82, _0x57737d)[0] || extractVideoUrl(_0x530b82);
    if (!_0x117abe) {
      if (hasExplicitVideoSubmitFailureSignal(_0x530b82)) {
        const _0x428386 = parseError(_0x8e6763, _0x530b82, 200);
        if (_0x428386) {
          _0x428386.message = _0x428386.getUserMessage();
          throw _0x428386;
        }
        const _0x54d180 = extractAsyncVideoTaskFailureReason(_0x530b82, _0x57737d);
        if (_0x54d180) {
          throw new ApiError({
            type: "TASK_FAILED",
            provider: _0x8e6763,
            message: _0x54d180,
            raw: _0x530b82,
            retryable: false
          });
        }
      }
      throw buildVideoSubmitMissingResultError(_0x8e6763, _0x530b82, {
        expectsTaskId: _0xd3f41f || _0x3564b1?.isAsync === true || Boolean(_0x38b016.taskPolling) || Boolean(_0x57737d?.taskIdPath)
      });
    }
    _0xd878a2 = {
      videoUrl: _0x117abe
    };
  }
  return await postProcessVideoResult(_0xd878a2, {
    providerId: _0x8e6763,
    ...(_0x35e17d ? {
      taskKey: _0x35e17d
    } : {}),
    signal: _0x3ba791?.signal,
    saveTimeoutMs: _0x3ba791?.saveTimeoutMs
  });
}
function createRunningHubWorkflowQueueChangeEmitter(_0x3a862a) {
  if (typeof _0x3a862a !== "function") {
    return null;
  }
  let _0xf1adbd = "";
  return (_0x1c1d25 = {}) => {
    const _0x3b4693 = String(_0x1c1d25?.status || "").trim().toLowerCase();
    const _0x2774b0 = Number(_0x1c1d25?.queueIndex ?? -1);
    const _0x20849e = Number(_0x1c1d25?.queueLength ?? 0);
    const _0xa1da7f = _0x3b4693 + ":" + _0x2774b0 + ":" + _0x20849e;
    if (_0xa1da7f === _0xf1adbd) {
      return false;
    }
    _0xf1adbd = _0xa1da7f;
    _0x3a862a(_0x1c1d25);
    return true;
  };
}
export async function generateVideo(_0x2cb41b, _0x4f0d2b = {}) {
  const _0x18dfe9 = createRunningHubWorkflowQueueChangeEmitter(_0x4f0d2b?.onRunningHubWorkflowQueueChange);
  const _0x35bac4 = _0x18dfe9 ? {
    ..._0x4f0d2b,
    onRunningHubWorkflowQueueChange: _0x18dfe9
  } : _0x4f0d2b;
  const _0x359b3a = resolveVideoExecution(_0x2cb41b);
  const _0x352878 = resolveVideoProviderId(_0x2cb41b, _0x359b3a);
  const _0xc117da = _0x359b3a?.executionManifest;
  if (isRunningHubWorkflowQueueTarget({
    providerId: _0x352878,
    adapterType: _0xc117da?.adapterType,
    executionManifest: _0xc117da,
    payload: _0x2cb41b
  })) {
    await ensureConfig();
    const _0x23efef = resolveRunningHubWorkflowQueueConfig({
      payload: _0x2cb41b,
      concurrency: _0x4f0d2b?.runningHubWorkflowConcurrency
    });
    return runWithRunningHubWorkflowQueue({
      ..._0x23efef,
      signal: _0x35bac4?.signal,
      lease: _0x35bac4?.runningHubWorkflowQueueLease,
      onQueueChange: _0x35bac4?.onRunningHubWorkflowQueueChange,
      autoProbeConcurrency: _0x35bac4?.autoProbeConcurrency,
      concurrencyProbe: _0x35bac4?.runningHubWorkflowConcurrencyProbe,
      queuePollIntervalMs: _0x35bac4?.runningHubWorkflowQueuePollIntervalMs
    }, _0x54c408 => generateVideoUnqueued(_0x2cb41b, {
      ..._0x35bac4,
      runningHubWorkflowQueueLease: _0x54c408
    }));
  }
  return generateVideoUnqueued(_0x2cb41b, _0x35bac4);
}
export const __test__ = {
  extractVideoEntries: extractVideoEntries,
  extractVideoUrls: extractVideoUrls,
  processVideoTaskResult: processVideoTaskResult
};
