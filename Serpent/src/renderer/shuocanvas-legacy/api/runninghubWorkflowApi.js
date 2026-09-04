import { post as a122_0x26281b } from "./requester.js";
import { ensureConfig, getProviderConfig } from "./configApi.js";
import { runTaskSingleFlight } from "./taskSingleFlight.js";
import { resolveRunningHubWorkflowQueueConfig, runWithRunningHubWorkflowQueue } from "./runningHubWorkflowQueue.js";
import { getRunningHubProviderProfileId, normalizeRunningHubModelApiProfileId, resolveRunningHubModelApiBaseUrl } from "../src/modules/runningHubProviderProfiles.js";
import { formatRunningHubFailureMessage, parseTaskError as a122_0x4fab52 } from "./errors/parsers/RunningHubErrorParser.js";
import { resolveRunningHubTaskLifecycleStatus } from "./runninghubTaskLifecycle.js";
import { hasRunningHubWorkflowPollingTimedOut, resolveRunningHubWorkflowPollingPolicy } from "./runningHubWorkflowPollingPolicy.js";
const RH_PENDING_CODES = new Set([804, 813]);
function getRhErrorMessage(_0x119bce, _0x3f7793) {
  return formatRunningHubFailureMessage(_0x119bce, _0x3f7793);
}
function hasRhResult(_0xe68f74) {
  if (typeof _0xe68f74 === "string") {
    return !!_0xe68f74.trim();
  }
  if (Array.isArray(_0xe68f74?.data)) {
    return _0xe68f74.data.some(_0x5ac0ea => hasRhResult(_0x5ac0ea));
  }
  const _0x165cea = _0xe68f74?.data && typeof _0xe68f74.data === "object" && !Array.isArray(_0xe68f74.data) ? _0xe68f74.data : _0xe68f74;
  if (Array.isArray(_0x165cea?.results)) {
    return _0x165cea.results.some(_0x1028d0 => hasRhResult(_0x1028d0));
  }
  return !!_0x165cea?.url || !!_0x165cea?.videoUrl || !!_0x165cea?.fileUrl || !!_0x165cea?.download_url;
}
function getInstallId(_0x4c491e) {
  return String(_0x4c491e?.installId || globalThis.window?.__aicInstallId || globalThis.__aicInstallId || "").trim();
}
function buildInstallIdHeaders(_0xa83d38) {
  const _0x57563a = getInstallId(_0xa83d38);
  if (_0x57563a) {
    return {
      "X-AIC-Install-Id": _0x57563a
    };
  } else {
    return {};
  }
}
function getRunningHubWorkflowBaseUrl(_0x3ccb9b = {}) {
  const _0x10af5b = String(_0x3ccb9b?.runningHubApiUrl || "").trim();
  if (_0x10af5b) {
    return _0x10af5b.replace(/\/+$/, "");
  }
  const _0x36134a = getRunningHubProviderProfileId(_0x3ccb9b);
  const _0xab65cb = _0x36134a ? normalizeRunningHubModelApiProfileId(_0x36134a) : "";
  return resolveRunningHubModelApiBaseUrl(_0xab65cb);
}
export async function runRunninghubWorkflow(_0xa2bfe2, _0x33d568 = {}) {
  const {
    installId: _0xa658f4,
    ..._0x168ee4
  } = _0xa2bfe2 || {};
  const _0x29bda0 = resolveRunningHubWorkflowQueueConfig({
    payload: _0xa2bfe2,
    concurrency: _0x33d568?.runningHubWorkflowConcurrency
  });
  return runWithRunningHubWorkflowQueue({
    ..._0x29bda0,
    signal: _0x33d568?.signal,
    lease: _0x33d568?.runningHubWorkflowQueueLease,
    onQueueChange: _0x33d568?.onRunningHubWorkflowQueueChange,
    autoProbeConcurrency: _0x33d568?.autoProbeConcurrency,
    concurrencyProbe: _0x33d568?.runningHubWorkflowConcurrencyProbe
  }, () => a122_0x26281b("/api/v2/runninghubwf/run", _0x168ee4, {
    provider: "runninghubwf",
    signal: _0x33d568?.signal,
    headers: buildInstallIdHeaders(_0xa2bfe2)
  }));
}
export async function runRunninghubAiApp(_0x184931, _0x19fa7b = {}) {
  const _0x314c0e = String(_0x184931?.appId || _0x184931?.workflowId || "").trim();
  const _0x196e29 = String(_0x184931?.apiKey || "").trim();
  if (!_0x314c0e) {
    throw new Error("缺少 RunningHub appId");
  }
  if (!_0x196e29) {
    throw new Error("RunningHub API Key 未配置");
  }
  const {
    appId: _0x273307,
    workflowId: _0x2f3ee8,
    installId: _0x248674,
    ..._0x2df1b4
  } = _0x184931 || {};
  const _0x4772b1 = resolveRunningHubWorkflowQueueConfig({
    payload: {
      ..._0x184931,
      apiKey: _0x196e29
    },
    concurrency: _0x19fa7b?.runningHubWorkflowConcurrency
  });
  return runWithRunningHubWorkflowQueue({
    ..._0x4772b1,
    signal: _0x19fa7b?.signal,
    lease: _0x19fa7b?.runningHubWorkflowQueueLease,
    onQueueChange: _0x19fa7b?.onRunningHubWorkflowQueueChange,
    autoProbeConcurrency: _0x19fa7b?.autoProbeConcurrency,
    concurrencyProbe: _0x19fa7b?.runningHubWorkflowConcurrencyProbe
  }, () => a122_0x26281b("/api/v2/proxy/image", {
    ..._0x2df1b4,
    apiUrl: getRunningHubWorkflowBaseUrl(_0x184931) + "/openapi/v2/run/ai-app/" + _0x314c0e,
    apiKey: _0x196e29
  }, {
    provider: "runninghubwf",
    signal: _0x19fa7b?.signal,
    headers: buildInstallIdHeaders(_0x184931),
    timeout: 900000
  }));
}
export async function queryRunninghubWorkflow(_0xc0c977, _0x549157 = {}) {
  const _0x1327a8 = _0x549157?.useOpenapiQuery === true;
  const _0x65fc2a = await a122_0x26281b(_0x1327a8 ? "/api/v2/proxy/image" : "/api/v2/runninghubwf/query", _0x1327a8 ? {
    apiUrl: getRunningHubWorkflowBaseUrl(_0xc0c977) + "/openapi/v2/query",
    ...(_0xc0c977 || {})
  } : _0xc0c977 || {}, {
    provider: "runninghubwf",
    signal: _0x549157?.signal
  });
  return _0x65fc2a;
}
export async function resumeRunninghubWorkflowTask(_0xd5e73e, _0x47f135 = {}) {
  const _0x29abb3 = String(_0xd5e73e?.taskId || "").trim();
  if (!_0x29abb3) {
    throw new Error("缺少 RunningHub 任务ID");
  }
  const _0xf915d9 = String(_0xd5e73e?.apiKey || "").trim();
  if (!_0xf915d9) {
    await ensureConfig();
  }
  const _0x124820 = getRunningHubProviderProfileId(_0xd5e73e);
  const _0x3e7335 = getProviderConfig(_0x124820 || "runninghubwf");
  const _0x5b10be = String(_0x124820 || _0x3e7335?.providerProfileId || "").trim();
  const _0x5ee2b5 = String(_0xf915d9 || _0x3e7335?.apiKey || "").trim();
  if (!_0x5ee2b5) {
    throw new Error("RunningHub API Key 未配置");
  }
  return runTaskSingleFlight({
    provider: "runninghubwf",
    kind: String(_0x47f135?.taskKind || _0x47f135?.kind || "video").trim() || "video",
    taskId: _0x29abb3
  }, async () => resumeRunninghubWorkflowTaskOnce({
    apiKey: _0x5ee2b5,
    taskId: _0x29abb3,
    providerProfileId: _0x5b10be,
    rhProviderProfileId: _0x5b10be,
    runningHubApiUrl: _0xd5e73e?.runningHubApiUrl || _0x3e7335?.apiUrl
  }, _0x47f135));
}
async function resumeRunninghubWorkflowTaskOnce(_0x432d14, _0xd44d69 = {}) {
  const _0xdbc5dd = String(_0x432d14?.apiKey || "").trim();
  const _0x149268 = String(_0x432d14?.taskId || "").trim();
  const {
    pollIntervalMs: _0x38283c,
    pollTimeoutMs: _0x5075d9,
    maxPolls: _0x43b31b
  } = resolveRunningHubWorkflowPollingPolicy(_0xd44d69);
  const _0x5dbb2d = Date.now();
  for (let _0x10019d = 0; _0x10019d < _0x43b31b; _0x10019d++) {
    if (hasRunningHubWorkflowPollingTimedOut(_0x5dbb2d, _0x5075d9)) {
      break;
    }
    if (_0xd44d69?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0x38283c > 0) {
      await new Promise(_0x552ff7 => setTimeout(_0x552ff7, _0x38283c));
      if (_0xd44d69?.signal?.aborted) {
        throw new Error("CANCELLED");
      }
      if (hasRunningHubWorkflowPollingTimedOut(_0x5dbb2d, _0x5075d9)) {
        break;
      }
    }
    const _0x577ee4 = await queryRunninghubWorkflow({
      apiKey: _0xdbc5dd,
      taskId: _0x149268,
      providerProfileId: _0x432d14?.providerProfileId,
      rhProviderProfileId: _0x432d14?.rhProviderProfileId,
      runningHubApiUrl: _0x432d14?.runningHubApiUrl
    }, {
      signal: _0xd44d69?.signal,
      useOpenapiQuery: _0xd44d69?.useOpenapiQuery === true
    });
    const _0x41305f = typeof _0x577ee4?.code === "number" ? _0x577ee4.code : null;
    if (_0x41305f !== null && RH_PENDING_CODES.has(_0x41305f)) {
      continue;
    }
    if (_0x41305f !== null && _0x41305f !== 0) {
      throw new Error(getRhErrorMessage(_0x577ee4, "任务轮询失败 (code: " + _0x41305f + ")"));
    }
    const _0xb53552 = resolveRunningHubTaskLifecycleStatus(_0x577ee4);
    if (_0xb53552 === "cancelled") {
      throw new Error("CANCELLED");
    }
    const _0xa6e42b = a122_0x4fab52(_0x577ee4);
    if (_0xa6e42b) {
      throw _0xa6e42b;
    }
    if (_0xb53552 === "error") {
      throw new Error(getRhErrorMessage(_0x577ee4, "任务执行失败"));
    }
    if (_0xb53552 === "success" || hasRhResult(_0x577ee4)) {
      return _0x577ee4;
    }
    if (_0xb53552 === "running" || _0xb53552 === "") {
      continue;
    }
  }
  throw new Error("任务超时，请稍后重试");
}