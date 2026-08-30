import { getProviderConfig } from "./configApi.js";
import { fetchRunningHubWorkflowQueueStatus } from "./runningHubQueueStatusApi.js";
import { getRunningHubProviderProfileId, RUNNINGHUB_DOMESTIC_PROFILE_ID, normalizeRunningHubModelApiProfileId, resolveRunningHubModelApiProfileId } from "../src/modules/runningHubProviderProfiles.js";
const DEFAULT_RUNNINGHUB_WORKFLOW_CONCURRENCY = 1;
const DEFAULT_RUNNINGHUB_WORKFLOW_QUEUE_POLL_INTERVAL_MS = 2000;
const PROVIDER_KEY = "runninghubwf";
const queues = new Map();
const sessionConcurrencyProbes = new Map();
let nextQueueItemId = 1;
function isPlainObject(_0x153619) {
  return !!_0x153619 && typeof _0x153619 === "object" && !Array.isArray(_0x153619);
}
function normalizeText(_0x217ab0) {
  return String(_0x217ab0 || "").trim();
}
function normalizeProviderId(_0x4cde9e) {
  return normalizeText(_0x4cde9e).toLowerCase();
}
function normalizeAdapterType(_0x10233b) {
  return normalizeText(_0x10233b).toLowerCase();
}
export function normalizeRunningHubWorkflowConcurrencyLimit(_0x11d155, _0x180065 = DEFAULT_RUNNINGHUB_WORKFLOW_CONCURRENCY) {
  const _0x30e0b4 = Math.max(1, Math.floor(Number(_0x180065) || DEFAULT_RUNNINGHUB_WORKFLOW_CONCURRENCY));
  const _0x4d786a = Number(_0x11d155);
  if (!Number.isFinite(_0x4d786a) || _0x4d786a <= 0) {
    return _0x30e0b4;
  }
  return Math.max(1, Math.floor(_0x4d786a));
}
function resolveRunningHubWorkflowProfileId(_0x32fd81 = {}) {
  const _0x11deac = getRunningHubProviderProfileId(_0x32fd81);
  const _0x33eeb0 = normalizeText(readProviderConfig("runninghubwf")?.providerProfileId);
  return resolveRunningHubModelApiProfileId(_0x32fd81?.model || _0x32fd81?.modelId, _0x11deac || _0x33eeb0);
}
function readProviderConfig(_0x4e3e4a) {
  try {
    return getProviderConfig(_0x4e3e4a) || {};
  } catch {
    return {};
  }
}
export function resolveRunningHubWorkflowQueueConfig({
  payload = {},
  providerConfig = null,
  concurrency = null
} = {}) {
  const _0x5e09a7 = resolveRunningHubWorkflowProfileId(payload);
  const _0x52fed3 = isPlainObject(providerConfig) ? providerConfig : readProviderConfig(_0x5e09a7);
  const _0x58209f = normalizeText(payload?.apiKey || _0x52fed3?.apiKey);
  const _0x2dc641 = concurrency ?? payload?.workflowConcurrentLimit ?? payload?.runninghubWorkflowConcurrentLimit ?? _0x52fed3?.workflowConcurrentLimit ?? _0x52fed3?.runninghubWorkflowConcurrentLimit ?? _0x52fed3?.concurrentLimit;
  return {
    apiKey: _0x58209f,
    providerProfileId: _0x5e09a7,
    concurrentLimit: normalizeRunningHubWorkflowConcurrencyLimit(_0x2dc641, 1),
    providerConfig: _0x52fed3
  };
}
export function isRunningHubWorkflowQueueTarget({
  providerId = "",
  provider = "",
  adapterType = "",
  executionManifest = null,
  payload = {}
} = {}) {
  const _0x2ca7d1 = normalizeProviderId(providerId || provider || executionManifest?.provider || payload?.provider);
  const _0x9de68c = normalizeAdapterType(adapterType || executionManifest?.adapterType || payload?.adapterType);
  const _0x42fb26 = normalizeText(payload?.model || payload?.modelId);
  return _0x2ca7d1 === "runninghubwf" || _0x2ca7d1 === "runninghub" && _0x9de68c === "workflow" || _0x9de68c === "workflow" && _0x42fb26.startsWith("runninghub/");
}
function createAbortError() {
  const _0x1b8f8b = new Error("CANCELLED");
  _0x1b8f8b.name = "AbortError";
  return _0x1b8f8b;
}
function normalizeQueueKey(_0x312fc5, _0x16f4b2) {
  const _0x2e2a7a = normalizeRunningHubModelApiProfileId(_0x16f4b2 || RUNNINGHUB_DOMESTIC_PROFILE_ID);
  const _0x5a1141 = normalizeText(_0x312fc5);
  if (_0x5a1141) {
    return PROVIDER_KEY + ":" + _0x2e2a7a + ":" + _0x5a1141;
  } else {
    return PROVIDER_KEY + ":" + _0x2e2a7a + ":default";
  }
}
function isMatchingLease(_0x4ca6ea, _0x3dccd7) {
  return isPlainObject(_0x4ca6ea) && _0x4ca6ea.provider === PROVIDER_KEY && _0x4ca6ea.queueKey === _0x3dccd7;
}
function getQueue(_0x589ce7) {
  let _0x4be0f6 = queues.get(_0x589ce7);
  if (!_0x4be0f6) {
    _0x4be0f6 = {
      queueKey: _0x589ce7,
      active: 0,
      concurrentLimit: DEFAULT_RUNNINGHUB_WORKFLOW_CONCURRENCY,
      remoteOccupiedCount: 0,
      remoteRunningCount: 0,
      remoteQueuedCount: 0,
      waiting: [],
      probeTimer: null,
      probeOptions: null
    };
    queues.set(_0x589ce7, _0x4be0f6);
  }
  return _0x4be0f6;
}
function getProbeKey(_0x4c0f59) {
  return _0x4c0f59 || PROVIDER_KEY + ":default";
}
function normalizeRemoteCount(_0x20f135) {
  const _0x2b9159 = Number(_0x20f135);
  if (Number.isFinite(_0x2b9159) && _0x2b9159 > 0) {
    return Math.floor(_0x2b9159);
  } else {
    return 0;
  }
}
function normalizeQueueStatus(_0x583c93, _0x4ebd54 = 1) {
  const _0x555327 = Number(_0x583c93?.concurrentLimit);
  if (!Number.isFinite(_0x555327) || _0x555327 <= 0) {
    return null;
  }
  const _0x1e8192 = normalizeRemoteCount(_0x583c93?.runningCount);
  const _0x125567 = normalizeRemoteCount(_0x583c93?.queuedCount);
  const _0x1ebd9e = Number(_0x583c93?.totalCurrentTasks);
  return {
    concurrentLimit: normalizeRunningHubWorkflowConcurrencyLimit(_0x555327, _0x4ebd54),
    runningCount: _0x1e8192,
    queuedCount: _0x125567,
    totalCurrentTasks: Number.isFinite(_0x1ebd9e) && _0x1ebd9e >= 0 ? Math.floor(_0x1ebd9e) : _0x1e8192 + _0x125567
  };
}
function applyRemoteQueueStatus(_0x3052a5, _0x5c91e9) {
  const _0x2104b8 = normalizeQueueStatus(_0x5c91e9, _0x3052a5.concurrentLimit);
  if (!_0x2104b8) {
    return false;
  }
  _0x3052a5.concurrentLimit = _0x2104b8.concurrentLimit;
  if (_0x3052a5.active === 0) {
    _0x3052a5.remoteRunningCount = _0x2104b8.runningCount;
    _0x3052a5.remoteQueuedCount = _0x2104b8.queuedCount;
    _0x3052a5.remoteOccupiedCount = _0x2104b8.totalCurrentTasks;
  }
  return true;
}
async function probeRunningHubWorkflowQueueStatus({
  apiKey = "",
  providerConfig = null,
  concurrencyProbe = null
} = {}) {
  const _0xc63821 = normalizeText(apiKey);
  if (!_0xc63821) {
    return null;
  }
  const _0x356224 = typeof concurrencyProbe === "function" ? concurrencyProbe : fetchRunningHubWorkflowQueueStatus;
  const _0x59c506 = await _0x356224({
    ...(isPlainObject(providerConfig) ? providerConfig : {}),
    apiKey: _0xc63821
  });
  return normalizeQueueStatus(_0x59c506);
}
async function ensureSessionQueueStatus(_0x43c7b1, _0x1f0b25 = {}) {
  const _0x46834c = normalizeText(_0x1f0b25.apiKey);
  if (!_0x46834c || _0x1f0b25.autoProbeConcurrency === false) {
    return {
      concurrentLimit: _0x43c7b1.concurrentLimit,
      runningCount: 0,
      queuedCount: 0,
      totalCurrentTasks: 0
    };
  }
  const _0x2ddd47 = getProbeKey(_0x43c7b1.queueKey);
  const _0x321547 = sessionConcurrencyProbes.get(_0x2ddd47);
  if (_0x321547?.promise) {
    const _0x57cb73 = await _0x321547.promise;
    applyRemoteQueueStatus(_0x43c7b1, _0x57cb73);
    return _0x57cb73;
  }
  const _0x315806 = probeRunningHubWorkflowQueueStatus(_0x1f0b25).then(_0x5462a1 => {
    if (!_0x5462a1) {
      throw new Error("RunningHub workflow concurrency probe returned no limit");
    }
    return _0x5462a1;
  }).catch(_0x383ce3 => {
    sessionConcurrencyProbes.delete(_0x2ddd47);
    throw _0x383ce3;
  }).finally(() => {
    if (sessionConcurrencyProbes.get(_0x2ddd47)?.promise === _0x315806) {
      sessionConcurrencyProbes.delete(_0x2ddd47);
    }
  });
  sessionConcurrencyProbes.set(_0x2ddd47, {
    status: "probing",
    promise: _0x315806
  });
  const _0xfe0d27 = await _0x315806;
  applyRemoteQueueStatus(_0x43c7b1, _0xfe0d27);
  return _0xfe0d27;
}
function buildQueueDetail(_0x2eecb3, _0x1f042c = {}) {
  return {
    queueLength: _0x2eecb3.waiting.length,
    activeCount: _0x2eecb3.active,
    concurrentLimit: _0x2eecb3.concurrentLimit,
    remoteOccupiedCount: _0x2eecb3.remoteOccupiedCount,
    remoteRunningCount: _0x2eecb3.remoteRunningCount,
    remoteQueuedCount: _0x2eecb3.remoteQueuedCount,
    ..._0x1f042c
  };
}
function emitWaiting(_0x426ba5, _0x5c349e = {}) {
  _0x426ba5.waiting.forEach((_0x4b1f86, _0x3310d8) => {
    _0x4b1f86.onQueueChange?.(buildQueueDetail(_0x426ba5, {
      status: "queued",
      queueIndex: _0x3310d8,
      ..._0x5c349e
    }));
  });
}
function removeWaitingItem(_0x48937a, _0x397e34) {
  const _0x357eda = _0x48937a.waiting.indexOf(_0x397e34);
  if (_0x357eda >= 0) {
    _0x48937a.waiting.splice(_0x357eda, 1);
    emitWaiting(_0x48937a);
    return true;
  }
  return false;
}
function resolveQueuePollIntervalMs(_0x73438e) {
  const _0x43fd06 = Number(_0x73438e);
  if (!Number.isFinite(_0x43fd06) || _0x43fd06 <= 0) {
    return DEFAULT_RUNNINGHUB_WORKFLOW_QUEUE_POLL_INTERVAL_MS;
  }
  return Math.max(1, Math.floor(_0x43fd06));
}
function getRunningHubErrorCode(_0x5b99b2) {
  const _0x1283ba = [_0x5b99b2?.code, _0x5b99b2?.status, _0x5b99b2?.raw?.code, _0x5b99b2?.response?.code, _0x5b99b2?.response?.data?.code, _0x5b99b2?.data?.code];
  for (const _0x463f7b of _0x1283ba) {
    const _0x2f7799 = Number(_0x463f7b);
    if (Number.isFinite(_0x2f7799)) {
      return _0x2f7799;
    }
  }
  return null;
}
function isRunningHubQueueMaxedError(_0x4846fd) {
  if (getRunningHubErrorCode(_0x4846fd) === 421) {
    return true;
  }
  const _0x3c1e5d = [_0x4846fd?.message, _0x4846fd?.raw?.message, _0x4846fd?.response?.data?.message].map(normalizeText).join(" ").toUpperCase();
  return _0x3c1e5d.includes("TASK_QUEUE_MAXED");
}
function clearProbeTimer(_0x57fd0c) {
  if (!_0x57fd0c.probeTimer) {
    return;
  }
  clearTimeout(_0x57fd0c.probeTimer);
  _0x57fd0c.probeTimer = null;
}
function scheduleQueueProbe(_0x289a3d) {
  if (_0x289a3d.probeTimer || _0x289a3d.waiting.length === 0 || _0x289a3d.active + _0x289a3d.remoteOccupiedCount < _0x289a3d.concurrentLimit) {
    return;
  }
  const _0x18c984 = _0x289a3d.probeOptions || {};
  const _0x3e466f = resolveQueuePollIntervalMs(_0x18c984.queuePollIntervalMs);
  _0x289a3d.probeTimer = setTimeout(async () => {
    _0x289a3d.probeTimer = null;
    if (_0x289a3d.waiting.length === 0) {
      return;
    }
    if (_0x18c984.autoProbeConcurrency !== false && normalizeText(_0x18c984.apiKey)) {
      try {
        const _0x4813ae = await probeRunningHubWorkflowQueueStatus(_0x18c984);
        if (!applyRemoteQueueStatus(_0x289a3d, _0x4813ae)) {
          _0x289a3d.remoteOccupiedCount = 0;
          _0x289a3d.remoteRunningCount = 0;
          _0x289a3d.remoteQueuedCount = 0;
        }
      } catch {
        _0x289a3d.remoteOccupiedCount = 0;
        _0x289a3d.remoteRunningCount = 0;
        _0x289a3d.remoteQueuedCount = 0;
      }
    } else {
      _0x289a3d.remoteOccupiedCount = 0;
      _0x289a3d.remoteRunningCount = 0;
      _0x289a3d.remoteQueuedCount = 0;
    }
    pumpQueue(_0x289a3d);
  }, _0x3e466f);
  _0x289a3d.probeTimer.unref?.();
}
function pumpQueue(_0x3610f1) {
  if (_0x3610f1.active + _0x3610f1.remoteOccupiedCount < _0x3610f1.concurrentLimit) {
    clearProbeTimer(_0x3610f1);
  }
  while (_0x3610f1.active + _0x3610f1.remoteOccupiedCount < _0x3610f1.concurrentLimit && _0x3610f1.waiting.length > 0) {
    const _0x4717b2 = _0x3610f1.waiting.shift();
    if (!_0x4717b2 || _0x4717b2.settled) {
      continue;
    }
    if (_0x4717b2.signal?.aborted) {
      _0x4717b2.settled = true;
      _0x4717b2.reject(createAbortError());
      continue;
    }
    _0x3610f1.active += 1;
    _0x4717b2.started = true;
    const _0x108373 = {
      provider: PROVIDER_KEY,
      queueKey: _0x3610f1.queueKey,
      itemId: _0x4717b2.id
    };
    _0x4717b2.onQueueChange?.(buildQueueDetail(_0x3610f1, {
      status: "running",
      queueIndex: -1
    }));
    Promise.resolve().then(() => _0x4717b2.runner(_0x108373)).then(_0x59c7ff => {
      _0x3610f1.active = Math.max(0, _0x3610f1.active - 1);
      _0x4717b2.settled = true;
      _0x4717b2.resolve(_0x59c7ff);
      pumpQueue(_0x3610f1);
      emitWaiting(_0x3610f1);
    }, _0xcbe7e9 => {
      _0x3610f1.active = Math.max(0, _0x3610f1.active - 1);
      if (isRunningHubQueueMaxedError(_0xcbe7e9) && !_0x4717b2.signal?.aborted) {
        _0x4717b2.started = false;
        _0x3610f1.remoteOccupiedCount = Math.max(1, _0x3610f1.concurrentLimit);
        _0x3610f1.remoteRunningCount = Math.max(_0x3610f1.remoteRunningCount, _0x3610f1.concurrentLimit);
        _0x3610f1.waiting.unshift(_0x4717b2);
        emitWaiting(_0x3610f1, {
          reason: "provider-queue-full"
        });
        scheduleQueueProbe(_0x3610f1);
        return;
      }
      _0x4717b2.settled = true;
      _0x4717b2.reject(_0xcbe7e9);
      pumpQueue(_0x3610f1);
      emitWaiting(_0x3610f1);
    });
  }
  emitWaiting(_0x3610f1);
  scheduleQueueProbe(_0x3610f1);
}
export async function runWithRunningHubWorkflowQueue({
  apiKey = "",
  providerProfileId = RUNNINGHUB_DOMESTIC_PROFILE_ID,
  concurrentLimit = DEFAULT_RUNNINGHUB_WORKFLOW_CONCURRENCY,
  providerConfig = null,
  signal = null,
  lease = null,
  onQueueChange = null,
  autoProbeConcurrency = true,
  concurrencyProbe = null,
  queuePollIntervalMs = DEFAULT_RUNNINGHUB_WORKFLOW_QUEUE_POLL_INTERVAL_MS
} = {}, _0x29b514) {
  if (typeof _0x29b514 !== "function") {
    throw new Error("RunningHub workflow queue runner is required");
  }
  const _0x1f3e01 = normalizeQueueKey(apiKey, providerProfileId);
  if (isMatchingLease(lease, _0x1f3e01)) {
    return _0x29b514(lease);
  }
  if (signal?.aborted) {
    throw createAbortError();
  }
  const _0x40f138 = getQueue(_0x1f3e01);
  _0x40f138.concurrentLimit = normalizeRunningHubWorkflowConcurrencyLimit(concurrentLimit, _0x40f138.concurrentLimit);
  _0x40f138.probeOptions = {
    apiKey: apiKey,
    providerConfig: providerConfig,
    autoProbeConcurrency: autoProbeConcurrency,
    concurrencyProbe: concurrencyProbe,
    queuePollIntervalMs: queuePollIntervalMs
  };
  if (autoProbeConcurrency !== false && normalizeText(apiKey)) {
    try {
      await ensureSessionQueueStatus(_0x40f138, {
        apiKey: apiKey,
        providerConfig: providerConfig,
        autoProbeConcurrency: autoProbeConcurrency,
        concurrencyProbe: concurrencyProbe,
        queuePollIntervalMs: queuePollIntervalMs
      });
    } catch {
      _0x40f138.concurrentLimit = normalizeRunningHubWorkflowConcurrencyLimit(concurrentLimit, _0x40f138.concurrentLimit);
    }
  }
  return new Promise((_0x1ab5d2, _0x2a54a1) => {
    const _0x6b17ef = {
      id: nextQueueItemId++,
      runner: _0x29b514,
      resolve: _0x1ab5d2,
      reject: _0x2a54a1,
      signal: signal,
      onQueueChange: typeof onQueueChange === "function" ? onQueueChange : null,
      started: false,
      settled: false
    };
    const _0x15a475 = () => {
      if (_0x6b17ef.started || _0x6b17ef.settled) {
        return;
      }
      _0x6b17ef.settled = true;
      removeWaitingItem(_0x40f138, _0x6b17ef);
      _0x2a54a1(createAbortError());
    };
    if (signal && typeof signal.addEventListener === "function") {
      signal.addEventListener("abort", _0x15a475, {
        once: true
      });
      const _0x5f2900 = () => signal.removeEventListener?.("abort", _0x15a475);
      const _0x1c97a5 = _0x6b17ef.resolve;
      const _0x4c56e0 = _0x6b17ef.reject;
      _0x6b17ef.resolve = _0x43031a => {
        _0x5f2900();
        _0x1c97a5(_0x43031a);
      };
      _0x6b17ef.reject = _0x228fb2 => {
        _0x5f2900();
        _0x4c56e0(_0x228fb2);
      };
    }
    _0x40f138.waiting.push(_0x6b17ef);
    pumpQueue(_0x40f138);
  });
}
export function __resetRunningHubWorkflowQueueForTest() {
  queues.forEach(clearProbeTimer);
  queues.clear();
  sessionConcurrencyProbes.clear();
  nextQueueItemId = 1;
}