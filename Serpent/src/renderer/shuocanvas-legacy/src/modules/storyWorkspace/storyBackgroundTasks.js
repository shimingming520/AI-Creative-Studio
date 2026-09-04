import { getWorkspaceProjectTaskPresentation } from "../workspaceProjectHome.js";
const ACTIVE_STATUSES = new Set(["queued", "submitting", "pending", "running", "recovering"]);
const TERMINAL_STATUSES = new Set(["succeeded", "failed", "cancelled", "interrupted"]);
const MAX_PERSISTED_TASKS = 60;
const RUNTIME_ACTIVE_TASKS_KEY = "__yuhStoryRuntimeActiveTasks";
function getRuntimeActiveTasks() {
  const root = globalThis;
  if (!(root[RUNTIME_ACTIVE_TASKS_KEY] instanceof Set)) root[RUNTIME_ACTIVE_TASKS_KEY] = new Set();
  return root[RUNTIME_ACTIVE_TASKS_KEY];
}
function runtimeTaskKey(projectId, taskId) {
  const project = normalizeText(projectId);
  const task = normalizeText(taskId);
  return project && task ? project + "::" + task : "";
}
function syncRuntimeTaskMarker(projectData = {}, task = {}) {
  const key = runtimeTaskKey(projectData?.project?.id, task?.id);
  if (!key) return;
  if (ACTIVE_STATUSES.has(normalizeText(task?.status).toLowerCase())) getRuntimeActiveTasks().add(key);
  else getRuntimeActiveTasks().delete(key);
}
export function hasStoryBackgroundTaskRuntime(projectData = {}) {
  const projectId = normalizeText(projectData?.project?.id);
  if (!projectId) return false;
  const prefix = projectId + "::";
  for (const key of getRuntimeActiveTasks()) if (key.startsWith(prefix)) return true;
  return false;
}
function normalizeText(_0x29a19c) {
  return String(_0x29a19c || "").trim();
}
function normalizeStatus(_0x5356dc, _0x1c06c2 = "running") {
  const _0x33c512 = normalizeText(_0x5356dc).toLowerCase();
  if (ACTIVE_STATUSES.has(_0x33c512) || TERMINAL_STATUSES.has(_0x33c512)) {
    return _0x33c512;
  }
  return _0x1c06c2;
}
function normalizeScope(_0x1f0bae = {}) {
  const _0x249183 = _0x1f0bae && typeof _0x1f0bae === "object" && !Array.isArray(_0x1f0bae) ? _0x1f0bae : {};
  return Object.fromEntries(Object.entries(_0x249183).map(([_0x47466f, _0x28bcd5]) => [normalizeText(_0x47466f), normalizeText(_0x28bcd5)]).filter(([_0x597f96, _0x4623ea]) => _0x597f96 && _0x4623ea));
}
function getProject(_0x5221b4 = {}) {
  if (_0x5221b4?.project && typeof _0x5221b4.project === "object" && !Array.isArray(_0x5221b4.project)) {
    return _0x5221b4.project;
  } else {
    return null;
  }
}
function cloneSerializable(_0x50fa6a) {
  if (!_0x50fa6a || typeof _0x50fa6a !== "object") {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(_0x50fa6a));
  } catch {
    return null;
  }
}
function normalizeBatch(_0x789b46) {
  const _0x40ee07 = cloneSerializable(_0x789b46);
  if (!_0x40ee07 || Array.isArray(_0x40ee07)) {
    return null;
  }
  const _0x3e7344 = normalizeText(_0x40ee07.id);
  const _0x13541e = normalizeText(_0x40ee07.type);
  if (!_0x3e7344 || !_0x13541e) {
    return null;
  }
  const _0x7c8764 = Math.max(0, Math.trunc(Number(_0x40ee07.total) || 0));
  const _0x28cbdd = Math.max(0, Math.min(_0x7c8764 || Number.MAX_SAFE_INTEGER, Math.trunc(Number(_0x40ee07.completed) || 0)));
  return {
    ..._0x40ee07,
    id: _0x3e7344,
    type: _0x13541e,
    total: _0x7c8764,
    completed: _0x28cbdd,
    label: normalizeText(_0x40ee07.label)
  };
}
function countLogicalTasks(_0x2d24d2 = []) {
  return new Set(_0x2d24d2.map(_0x535cc0 => _0x535cc0.batch?.id ? "batch:" + _0x535cc0.batch.id : "task:" + _0x535cc0.id)).size;
}
function pruneTasks(_0x3a616d = []) {
  const _0x364aea = _0x3a616d.filter(_0x258ad8 => ACTIVE_STATUSES.has(_0x258ad8.status));
  const _0x2878dc = _0x3a616d.filter(_0x138719 => !ACTIVE_STATUSES.has(_0x138719.status)).sort((_0x467eb3, _0x339f74) => Number(_0x339f74.updatedAt || 0) - Number(_0x467eb3.updatedAt || 0));
  return [..._0x364aea, ..._0x2878dc].slice(0, MAX_PERSISTED_TASKS);
}
export function buildStoryBackgroundTaskId(_0x5823a7, _0x56532e = {}) {
  const _0x2c9efd = normalizeText(_0x5823a7) || "task";
  const _0x597a96 = normalizeScope(_0x56532e);
  const _0x5e6458 = Object.keys(_0x597a96).sort().map(_0x2a1ad9 => _0x2a1ad9 + ":" + _0x597a96[_0x2a1ad9]).join(":");
  if (_0x5e6458) {
    return _0x2c9efd + ":" + _0x5e6458;
  } else {
    return _0x2c9efd;
  }
}
export function normalizeStoryBackgroundTask(_0x5aa7e6 = {}) {
  const _0x332680 = _0x5aa7e6 && typeof _0x5aa7e6 === "object" && !Array.isArray(_0x5aa7e6) ? _0x5aa7e6 : {};
  const _0x1615c8 = normalizeText(_0x332680.type) || "task";
  const _0x45bbe7 = normalizeScope(_0x332680.scope);
  const _0x47df43 = normalizeText(_0x332680.id) || buildStoryBackgroundTaskId(_0x1615c8, _0x45bbe7);
  const _0x550ad1 = normalizeStatus(_0x332680.status);
  const _0x573b4c = Math.max(0, Number(_0x332680.startedAt || 0)) || Date.now();
  const _0x106f01 = Math.max(_0x573b4c, Number(_0x332680.updatedAt || 0) || _0x573b4c);
  const _0x945121 = TERMINAL_STATUSES.has(_0x550ad1) ? Math.max(_0x106f01, Number(_0x332680.finishedAt || 0) || _0x106f01) : 0;
  return {
    id: _0x47df43,
    type: _0x1615c8,
    scope: _0x45bbe7,
    label: normalizeText(_0x332680.label) || "生成任务",
    message: normalizeText(_0x332680.message),
    status: _0x550ad1,
    resumable: _0x332680.resumable === true,
    remoteTaskId: normalizeText(_0x332680.remoteTaskId || _0x332680.taskId),
    modelId: normalizeText(_0x332680.modelId),
    provider: normalizeText(_0x332680.provider),
    executionId: normalizeText(_0x332680.executionId),
    resumePayload: cloneSerializable(_0x332680.resumePayload),
    batch: normalizeBatch(_0x332680.batch),
    error: normalizeText(_0x332680.error),
    startedAt: _0x573b4c,
    updatedAt: _0x106f01,
    finishedAt: _0x945121
  };
}
export function getStoryBackgroundTasks(_0x325709 = {}) {
  const _0x15277d = getProject(_0x325709);
  if (!_0x15277d || !Array.isArray(_0x15277d.backgroundTasks)) {
    return [];
  }
  return _0x15277d.backgroundTasks.map(_0x30059e => normalizeStoryBackgroundTask(_0x30059e)).filter(_0x192641 => _0x192641.id);
}
export function setStoryBackgroundTasks(_0x3e896f = {}, _0x35c7e8 = []) {
  const _0x570592 = getProject(_0x3e896f);
  if (!_0x570592) {
    return [];
  }
  const _0x18ae4e = pruneTasks((Array.isArray(_0x35c7e8) ? _0x35c7e8 : []).map(_0x33e734 => normalizeStoryBackgroundTask(_0x33e734)).filter(_0x312a4f => _0x312a4f.id));
  _0x570592.backgroundTasks = _0x18ae4e;
  return _0x18ae4e;
}
export function startStoryBackgroundTask(_0x2833fb = {}, _0x7bd3da = {}) {
  const _0x28760d = Date.now();
  const _0x24943c = normalizeStoryBackgroundTask({
    ..._0x7bd3da,
    status: normalizeStatus(_0x7bd3da.status, "running"),
    startedAt: Number(_0x7bd3da.startedAt || 0) || _0x28760d,
    updatedAt: _0x28760d,
    finishedAt: 0,
    error: ""
  });
  const _0x19309c = getStoryBackgroundTasks(_0x2833fb).filter(_0x459dcb => _0x459dcb.id !== _0x24943c.id);
  setStoryBackgroundTasks(_0x2833fb, [_0x24943c, ..._0x19309c]);
  syncRuntimeTaskMarker(_0x2833fb, _0x24943c);
  return _0x24943c;
}
export function updateStoryBackgroundTask(_0x3face5 = {}, _0x387335 = "", _0x130524 = {}) {
  const _0x4655fe = normalizeText(_0x387335);
  if (!_0x4655fe) {
    return null;
  }
  const _0x5ada97 = getStoryBackgroundTasks(_0x3face5);
  const _0x42d72e = _0x5ada97.findIndex(_0x19d1b9 => _0x19d1b9.id === _0x4655fe);
  if (_0x42d72e < 0) {
    return null;
  }
  const _0x30b552 = _0x5ada97[_0x42d72e];
  const _0x2b8166 = _0x130524.status ? normalizeStatus(_0x130524.status, _0x30b552.status) : _0x30b552.status;
  const _0x51fc7e = Date.now();
  const _0x127c12 = TERMINAL_STATUSES.has(_0x30b552.status) && ACTIVE_STATUSES.has(_0x2b8166);
  const _0x33ce0a = normalizeStoryBackgroundTask({
    ..._0x30b552,
    ...(_0x127c12 ? {
      batch: null,
      error: "",
      startedAt: _0x51fc7e,
      finishedAt: 0
    } : {}),
    ..._0x130524,
    id: _0x4655fe,
    status: _0x2b8166,
    startedAt: _0x127c12 ? Number(_0x130524.startedAt || 0) || _0x51fc7e : _0x30b552.startedAt,
    updatedAt: _0x51fc7e,
    finishedAt: TERMINAL_STATUSES.has(_0x2b8166) ? Number(_0x130524.finishedAt || 0) || _0x51fc7e : 0
  });
  _0x5ada97[_0x42d72e] = _0x33ce0a;
  setStoryBackgroundTasks(_0x3face5, _0x5ada97);
  syncRuntimeTaskMarker(_0x3face5, _0x33ce0a);
  return _0x33ce0a;
}
export function updateStoryBackgroundTaskBatch(_0x159ec4 = {}, _0x127eff = "", _0x207c8e = {}) {
  const _0x422d48 = normalizeText(_0x127eff);
  const _0x1d02c9 = cloneSerializable(_0x207c8e);
  if (!_0x422d48 || !_0x1d02c9 || Array.isArray(_0x1d02c9)) {
    return 0;
  }
  const _0x4808ba = getStoryBackgroundTasks(_0x159ec4);
  let _0x1d5048 = 0;
  const _0x3c3a41 = Date.now();
  const _0x547287 = _0x4808ba.map(_0xf30652 => {
    if (!ACTIVE_STATUSES.has(_0xf30652.status) || _0xf30652.batch?.id !== _0x422d48) {
      return _0xf30652;
    }
    _0x1d5048 += 1;
    return normalizeStoryBackgroundTask({
      ..._0xf30652,
      batch: {
        ..._0xf30652.batch,
        ..._0x1d02c9,
        id: _0x422d48
      },
      updatedAt: _0x3c3a41
    });
  });
  if (_0x1d5048) {
    setStoryBackgroundTasks(_0x159ec4, _0x547287);
  }
  return _0x1d5048;
}
export function finishStoryBackgroundTask(_0x16ac46 = {}, _0x59ba3a = "", {
  status = "succeeded",
  message = "",
  error = "",
  ..._0x263736
} = {}) {
  const _0x599219 = TERMINAL_STATUSES.has(normalizeText(status).toLowerCase()) ? normalizeText(status).toLowerCase() : "succeeded";
  return updateStoryBackgroundTask(_0x16ac46, _0x59ba3a, {
    ..._0x263736,
    status: _0x599219,
    message: message,
    error: error,
    finishedAt: Date.now()
  });
}
export function interruptStoryBackgroundTasks(_0x55ea4f = {}, {
  includeResumable = false,
  message = "应用已关闭或项目上下文已切换，请重新发起任务。"
} = {}) {
  const _0x2f8296 = getStoryBackgroundTasks(_0x55ea4f);
  let _0xe9f57b = 0;
  const _0x4fe563 = _0x2f8296.map(_0x30a433 => {
    if (!ACTIVE_STATUSES.has(_0x30a433.status)) {
      return _0x30a433;
    }
    if (!includeResumable && _0x30a433.resumable && _0x30a433.remoteTaskId) {
      return _0x30a433;
    }
    _0xe9f57b += 1;
    return normalizeStoryBackgroundTask({
      ..._0x30a433,
      status: "interrupted",
      message: message,
      error: message,
      updatedAt: Date.now(),
      finishedAt: Date.now()
    });
  });
  if (_0xe9f57b) {
    setStoryBackgroundTasks(_0x55ea4f, _0x4fe563);
    _0x4fe563.forEach(_0x30a433 => syncRuntimeTaskMarker(_0x55ea4f, _0x30a433));
  }
  return _0xe9f57b;
}
export function getStoryBackgroundTaskSummary(_0x2b7fa8 = {}) {
  const _0x4f5933 = getStoryBackgroundTasks(_0x2b7fa8);
  const _0x377b9d = _0x4f5933.filter(_0x5b2056 => ACTIVE_STATUSES.has(_0x5b2056.status));
  const _0x49994e = _0x4f5933.filter(_0x2550c9 => _0x2550c9.status === "failed" || _0x2550c9.status === "interrupted");
  const _0x3cfefd = countLogicalTasks(_0x377b9d);
  const _0x27efb7 = countLogicalTasks(_0x49994e);
  return {
    ...getWorkspaceProjectTaskPresentation({
      activeCount: _0x3cfefd,
      failedCount: _0x27efb7
    }),
    activeTasks: _0x377b9d,
    failedTasks: _0x49994e
  };
}
export function isStoryBackgroundTaskActive(_0x15dc18 = {}) {
  return ACTIVE_STATUSES.has(normalizeStatus(_0x15dc18.status));
}