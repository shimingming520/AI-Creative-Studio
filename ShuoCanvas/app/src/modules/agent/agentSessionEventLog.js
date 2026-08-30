import { normalizeAgentRunEvent } from "./agentRunEventLog.js";
import { normalizeAgentOperation, normalizeAgentTaskBinding } from "./agentDurableRunState.js";
const SESSION_EVENT_TYPES = new Set(["turn.started", "turn.updated", "turn.completed", "item.started", "item.updated", "item.completed", "audit.recorded"]);
const SESSION_ITEM_TYPES = new Set(["message", "tool", "approval", "task", "audit"]);
const TERMINAL_TURN_STATUSES = new Set(["cancelled", "chat", "completed", "failed", "need_clarification", "stopped", "success"]);
const TERMINAL_ITEM_STATUSES = new Set(["cancelled", "completed", "complete", "done", "error", "fail", "failed", "stopped", "success", "succeeded", "undone"]);
const MAX_MESSAGE_CONTENT_CHARS = 8000;
const MAX_PROJECTED_RUN_EVENTS = 120;
const MAX_PROJECTED_OPERATIONS = 120;
const MAX_PROJECTED_TASK_BINDINGS = 24;
function normalizeTimestamp(_0x19e61f, _0x36b5ed = Date.now()) {
  const _0x331745 = Number(_0x19e61f);
  if (Number.isFinite(_0x331745) && _0x331745 > 0) {
    return _0x331745;
  } else {
    return _0x36b5ed;
  }
}
function normalizeSequence(_0x112bec, _0x5c0b64 = 1) {
  const _0x1949ef = Math.trunc(Number(_0x112bec));
  if (Number.isFinite(_0x1949ef) && _0x1949ef > 0) {
    return _0x1949ef;
  } else {
    return _0x5c0b64;
  }
}
function truncateText(_0x2e50af, _0x1139e7 = MAX_MESSAGE_CONTENT_CHARS) {
  const _0x484a7b = String(_0x2e50af || "").trim();
  if (_0x484a7b.length <= _0x1139e7) {
    return _0x484a7b;
  } else {
    return _0x484a7b.slice(0, Math.max(0, _0x1139e7 - 3)) + "...";
  }
}
function cloneJson(_0x2fff3d, _0xc986f1 = null) {
  try {
    return JSON.parse(JSON.stringify(_0x2fff3d));
  } catch {
    return _0xc986f1;
  }
}
function normalizeMessageSnapshot(_0x442a90 = {}, _0x2502b4 = Date.now()) {
  if (!_0x442a90 || typeof _0x442a90 !== "object" || Array.isArray(_0x442a90)) {
    return null;
  }
  const _0x3427c5 = truncateText(_0x442a90.content || _0x442a90.reply || _0x442a90.message || _0x442a90.question || "");
  const _0x550546 = String(_0x442a90.status || "").trim().slice(0, 120);
  if (!_0x3427c5 && !_0x550546) {
    return null;
  }
  const _0x13c5b4 = {
    role: String(_0x442a90.role || "assistant").trim().slice(0, 32) || "assistant",
    content: _0x3427c5,
    status: _0x550546,
    ts: normalizeTimestamp(_0x442a90.ts, _0x2502b4)
  };
  const _0xe0d50a = String(_0x442a90.messageType || _0x442a90.type || "text").trim();
  if (_0xe0d50a && _0xe0d50a !== "text") {
    _0x13c5b4.messageType = _0xe0d50a.slice(0, 40);
  }
  if (_0x13c5b4.role === "user" && Array.isArray(_0x442a90.inputRefs)) {
    _0x13c5b4.inputRefs = cloneJson(_0x442a90.inputRefs.slice(0, 12), []);
  }
  if (_0x13c5b4.role === "assistant" && _0x442a90.diagnostic) {
    _0x13c5b4.diagnostic = cloneJson(_0x442a90.diagnostic, null);
  }
  if (_0x13c5b4.messageType && _0x442a90.task) {
    _0x13c5b4.task = cloneJson(_0x442a90.task, null);
  }
  return _0x13c5b4;
}
function normalizePayload(_0x318ca5 = {}, _0xdbb9ee = Date.now()) {
  const _0x59b4f4 = _0x318ca5.payload && typeof _0x318ca5.payload === "object" ? _0x318ca5.payload : {};
  if (_0x318ca5.itemType === "message") {
    const _0x4e4072 = normalizeMessageSnapshot(_0x59b4f4.message, _0xdbb9ee);
    if (_0x4e4072) {
      return {
        message: _0x4e4072
      };
    } else {
      return null;
    }
  }
  if (_0x318ca5.itemType === "tool") {
    const _0x37e896 = normalizeAgentOperation(_0x59b4f4.operation, _0xdbb9ee);
    if (_0x37e896) {
      return {
        operation: _0x37e896
      };
    } else {
      return null;
    }
  }
  if (_0x318ca5.itemType === "task") {
    const _0x67d6c2 = normalizeAgentTaskBinding(_0x59b4f4.taskBinding);
    if (_0x67d6c2) {
      return {
        taskBinding: _0x67d6c2
      };
    } else {
      return null;
    }
  }
  const _0x5355da = normalizeAgentRunEvent(_0x59b4f4.runEvent, _0xdbb9ee);
  if (_0x5355da) {
    return {
      runEvent: _0x5355da
    };
  } else {
    return null;
  }
}
export function normalizeAgentSessionEvent(_0x2f0766 = {}, {
  fallbackTs = Date.now(),
  fallbackSeq = 1
} = {}) {
  if (!_0x2f0766 || typeof _0x2f0766 !== "object" || Array.isArray(_0x2f0766)) {
    return null;
  }
  const _0x557025 = String(_0x2f0766.id || "").trim();
  const _0x1c2e4a = String(_0x2f0766.conversationId || "").trim();
  const _0x35638d = String(_0x2f0766.type || "").trim();
  const _0x394d05 = String(_0x2f0766.itemType || "audit").trim();
  if (!_0x557025 || !_0x1c2e4a || !SESSION_EVENT_TYPES.has(_0x35638d) || !SESSION_ITEM_TYPES.has(_0x394d05)) {
    return null;
  }
  const _0x4e0b8f = normalizeTimestamp(_0x2f0766.ts, fallbackTs);
  const _0x14f5db = normalizePayload({
    ..._0x2f0766,
    itemType: _0x394d05
  }, _0x4e0b8f);
  if (!_0x14f5db) {
    return null;
  }
  return {
    id: _0x557025,
    seq: normalizeSequence(_0x2f0766.seq, fallbackSeq),
    conversationId: _0x1c2e4a,
    projectId: String(_0x2f0766.projectId || "").trim(),
    turnId: String(_0x2f0766.turnId || "").trim(),
    itemId: String(_0x2f0766.itemId || "").trim(),
    type: _0x35638d,
    itemType: _0x394d05,
    status: String(_0x2f0766.status || "").trim().slice(0, 80),
    ts: _0x4e0b8f,
    payload: _0x14f5db
  };
}
export function createAgentMessageSessionEvent({
  id = "",
  seq = 0,
  conversationId = "",
  projectId = "",
  turnId = "",
  itemId = "",
  message = {}
} = {}) {
  return normalizeAgentSessionEvent({
    id: id,
    seq: seq,
    conversationId: conversationId,
    projectId: projectId,
    turnId: turnId,
    itemId: itemId,
    type: "item.completed",
    itemType: "message",
    status: String(message.status || "completed").trim() || "completed",
    ts: message.ts,
    payload: {
      message: message
    }
  });
}
function getRunSessionEventShape(_0x39080f = {}) {
  const _0x488408 = String(_0x39080f.type || "").trim();
  const _0x341eaf = String(_0x39080f.status || "").trim();
  if (_0x488408 === "run.status") {
    return {
      type: _0x341eaf === "planning" ? "turn.started" : TERMINAL_TURN_STATUSES.has(_0x341eaf) ? "turn.completed" : "turn.updated",
      itemType: "audit",
      itemId: ""
    };
  }
  if (_0x488408 === "approval.requested") {
    return {
      type: "item.started",
      itemType: "approval"
    };
  }
  if (_0x488408 === "approval.confirmed" || _0x488408 === "approval.cancelled") {
    return {
      type: "item.completed",
      itemType: "approval"
    };
  }
  return {
    type: "audit.recorded",
    itemType: "audit",
    itemId: ""
  };
}
export function createAgentRunSessionEvent({
  id = "",
  seq = 0,
  conversationId = "",
  projectId = "",
  itemId = "",
  runEvent = {}
} = {}) {
  const _0x4952b8 = getRunSessionEventShape(runEvent);
  const _0x3ae765 = String(runEvent.commandId || "").trim();
  const _0xf0e4b8 = Math.max(0, Math.trunc(Number(runEvent.step || 0)));
  const _0x182d32 = _0x4952b8.itemType === "approval" ? String(runEvent.runId || "").trim() + ":approval:" + _0xf0e4b8 + ":" + (_0x3ae765 || "plan") : "";
  return normalizeAgentSessionEvent({
    id: id,
    seq: seq,
    conversationId: conversationId,
    projectId: projectId,
    turnId: runEvent.runId,
    itemId: itemId || _0x182d32 || _0x4952b8.itemId,
    type: _0x4952b8.type,
    itemType: _0x4952b8.itemType,
    status: runEvent.status,
    ts: runEvent.ts,
    payload: {
      runEvent: runEvent
    }
  });
}
function getItemLifecycleType(_0x42d94a = "") {
  const _0x5ccc70 = String(_0x42d94a || "").trim();
  if (TERMINAL_ITEM_STATUSES.has(_0x5ccc70)) {
    return "item.completed";
  }
  if (["pending", "queued", "running", "submitted"].includes(_0x5ccc70)) {
    return "item.started";
  }
  return "item.updated";
}
export function createAgentOperationSessionEvent({
  id = "",
  seq = 0,
  conversationId = "",
  projectId = "",
  operation = {}
} = {}) {
  return normalizeAgentSessionEvent({
    id: id,
    seq: seq,
    conversationId: conversationId,
    projectId: projectId,
    turnId: operation.runId,
    itemId: operation.id || operation.operationId,
    type: getItemLifecycleType(operation.status),
    itemType: "tool",
    status: operation.status,
    ts: operation.completedAt || operation.startedAt,
    payload: {
      operation: operation
    }
  });
}
export function createAgentTaskSessionEvent({
  id = "",
  seq = 0,
  conversationId = "",
  projectId = "",
  taskBinding = {}
} = {}) {
  return normalizeAgentSessionEvent({
    id: id,
    seq: seq,
    conversationId: conversationId,
    projectId: projectId,
    turnId: taskBinding.turnId,
    itemId: taskBinding.id,
    type: getItemLifecycleType(taskBinding.status),
    itemType: "task",
    status: taskBinding.status,
    ts: taskBinding.updatedAt || taskBinding.createdAt,
    payload: {
      taskBinding: taskBinding
    }
  });
}
function sortSessionEvents(_0x40a15f = []) {
  return [..._0x40a15f].sort((_0x4298f6, _0x358204) => {
    const _0x70b4f8 = Number(_0x4298f6.seq || 0) - Number(_0x358204.seq || 0);
    if (_0x70b4f8 !== 0) {
      return _0x70b4f8;
    }
    const _0x5db69f = Number(_0x4298f6.ts || 0) - Number(_0x358204.ts || 0);
    if (_0x5db69f !== 0) {
      return _0x5db69f;
    }
    return String(_0x4298f6.id || "").localeCompare(String(_0x358204.id || ""));
  });
}
export function projectAgentSessionEvents(_0x302ee6 = []) {
  const _0x5b7d36 = sortSessionEvents((Array.isArray(_0x302ee6) ? _0x302ee6 : []).map((_0x427e34, _0x3dfc0c) => normalizeAgentSessionEvent(_0x427e34, {
    fallbackSeq: _0x3dfc0c + 1
  })).filter(Boolean));
  const _0x57b505 = [];
  const _0x5cd22f = [];
  const _0x207e3c = new Map();
  const _0x36acd3 = new Map();
  const _0x55018d = new Map();
  const _0x13b788 = new Map();
  for (const _0x55f7d6 of _0x5b7d36) {
    const _0x117617 = _0x55f7d6.turnId;
    if (_0x117617) {
      const _0x39bb0f = _0x55018d.get(_0x117617) || {
        id: _0x117617,
        status: "",
        startedAt: _0x55f7d6.ts,
        updatedAt: _0x55f7d6.ts,
        completedAt: 0,
        itemIds: []
      };
      _0x39bb0f.updatedAt = _0x55f7d6.ts;
      if (_0x55f7d6.status) {
        _0x39bb0f.status = _0x55f7d6.status;
      }
      if (_0x55f7d6.type === "turn.started") {
        _0x39bb0f.startedAt = _0x55f7d6.ts;
      }
      if (_0x55f7d6.type === "turn.completed") {
        _0x39bb0f.completedAt = _0x55f7d6.ts;
      }
      if (_0x55f7d6.itemId && !_0x39bb0f.itemIds.includes(_0x55f7d6.itemId)) {
        _0x39bb0f.itemIds.push(_0x55f7d6.itemId);
      }
      _0x55018d.set(_0x117617, _0x39bb0f);
    }
    if (_0x55f7d6.itemId) {
      const _0x5c6a77 = _0x13b788.get(_0x55f7d6.itemId) || {
        id: _0x55f7d6.itemId,
        turnId: _0x117617,
        type: _0x55f7d6.itemType,
        status: "",
        startedAt: _0x55f7d6.ts,
        updatedAt: _0x55f7d6.ts,
        completedAt: 0
      };
      _0x5c6a77.turnId = _0x117617 || _0x5c6a77.turnId;
      _0x5c6a77.type = _0x55f7d6.itemType;
      _0x5c6a77.status = _0x55f7d6.status || _0x5c6a77.status;
      _0x5c6a77.updatedAt = _0x55f7d6.ts;
      if (_0x55f7d6.type === "item.completed") {
        _0x5c6a77.completedAt = _0x55f7d6.ts;
      }
      _0x13b788.set(_0x55f7d6.itemId, _0x5c6a77);
    }
    if (_0x55f7d6.payload.message) {
      _0x57b505.push(cloneJson(_0x55f7d6.payload.message, {}));
    }
    if (_0x55f7d6.payload.runEvent) {
      _0x5cd22f.push(cloneJson(_0x55f7d6.payload.runEvent, {}));
    }
    if (_0x55f7d6.payload.operation) {
      _0x207e3c.set(_0x55f7d6.payload.operation.id, cloneJson(_0x55f7d6.payload.operation, {}));
    }
    if (_0x55f7d6.payload.taskBinding) {
      _0x36acd3.set(_0x55f7d6.payload.taskBinding.id, cloneJson(_0x55f7d6.payload.taskBinding, {}));
    }
  }
  return {
    events: _0x5b7d36.map(_0x36c427 => cloneJson(_0x36c427, {})),
    messages: _0x57b505,
    runEvents: _0x5cd22f.slice(-MAX_PROJECTED_RUN_EVENTS),
    operationLedger: [..._0x207e3c.values()].slice(-MAX_PROJECTED_OPERATIONS),
    taskBindings: [..._0x36acd3.values()].slice(-MAX_PROJECTED_TASK_BINDINGS),
    turns: [..._0x55018d.values()].map(_0x3209d8 => cloneJson(_0x3209d8, {})),
    items: [..._0x13b788.values()].map(_0x4b9c88 => cloneJson(_0x4b9c88, {}))
  };
}
function valuesMatch(_0x2e1f1a, _0x48d7ac) {
  return JSON.stringify(_0x2e1f1a) === JSON.stringify(_0x48d7ac);
}
export function compareAgentSessionProjection({
  projection = {},
  messages = [],
  runEvents = [],
  operationLedger = [],
  taskBindings = []
} = {}) {
  const _0x5a9846 = (Array.isArray(messages) ? messages : []).map(_0x2d6e5a => normalizeMessageSnapshot(_0x2d6e5a, _0x2d6e5a?.ts)).filter(Boolean);
  const _0x4aec43 = (Array.isArray(runEvents) ? runEvents : []).map(_0x1a540c => normalizeAgentRunEvent(_0x1a540c, _0x1a540c?.ts)).filter(Boolean);
  const _0x2adf32 = (Array.isArray(operationLedger) ? operationLedger : []).map(_0x22253b => normalizeAgentOperation(_0x22253b, _0x22253b?.startedAt)).filter(Boolean);
  const _0x576242 = (Array.isArray(taskBindings) ? taskBindings : []).map(_0xf6acd1 => normalizeAgentTaskBinding(_0xf6acd1)).filter(Boolean);
  const _0xcd84 = {
    messages: valuesMatch(projection.messages || [], _0x5a9846),
    runEvents: valuesMatch(projection.runEvents || [], _0x4aec43),
    operationLedger: valuesMatch(projection.operationLedger || [], _0x2adf32),
    taskBindings: valuesMatch(projection.taskBindings || [], _0x576242)
  };
  return {
    ..._0xcd84,
    ok: Object.values(_0xcd84).every(Boolean),
    mismatches: Object.entries(_0xcd84).filter(([, _0x24ccc3]) => !_0x24ccc3).map(([_0x1192ae]) => _0x1192ae)
  };
}
export function createAgentSessionEventsFromLegacyState({
  conversationId = "",
  projectId = "",
  messages = [],
  runEvents = [],
  operationLedger = [],
  taskBindings = []
} = {}) {
  const _0x278981 = [];
  let _0x4983ff = 0;
  const _0x1aece5 = (_0x202641, _0x42cdd1, _0xb548be, _0x56680c) => {
    const _0x375a78 = ++_0x4983ff;
    const _0x4f4acc = _0x202641({
      id: conversationId + ":migrated:" + _0xb548be + ":" + (_0x56680c + 1),
      seq: _0x375a78,
      conversationId: conversationId,
      projectId: projectId,
      ...(_0xb548be === "message" ? {
        itemId: conversationId + ":message:" + (_0x56680c + 1)
      } : {}),
      ...(_0xb548be === "message" ? {
        message: _0x42cdd1
      } : {}),
      ...(_0xb548be === "run" ? {
        runEvent: _0x42cdd1
      } : {}),
      ...(_0xb548be === "operation" ? {
        operation: _0x42cdd1
      } : {}),
      ...(_0xb548be === "task" ? {
        taskBinding: _0x42cdd1
      } : {})
    });
    if (_0x4f4acc) {
      _0x278981.push(_0x4f4acc);
    }
  };
  messages.forEach((_0x5a0bfb, _0x2ee859) => _0x1aece5(createAgentMessageSessionEvent, _0x5a0bfb, "message", _0x2ee859));
  runEvents.forEach((_0x29cce6, _0x2ee0b4) => _0x1aece5(createAgentRunSessionEvent, _0x29cce6, "run", _0x2ee0b4));
  operationLedger.forEach((_0x5e7877, _0x1efea6) => _0x1aece5(createAgentOperationSessionEvent, _0x5e7877, "operation", _0x1efea6));
  taskBindings.forEach((_0x1d389b, _0x105d4e) => _0x1aece5(createAgentTaskSessionEvent, _0x1d389b, "task", _0x105d4e));
  return _0x278981;
}