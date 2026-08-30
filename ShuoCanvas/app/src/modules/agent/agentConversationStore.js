import { normalizeAgentRunEvent } from "./agentRunEventLog.js";
import { normalizeAgentOperationLedger, normalizeAgentResumeCheckpoint, normalizeAgentTaskBindings } from "./agentDurableRunState.js";
import { createAgentMessageSessionEvent, createAgentOperationSessionEvent, createAgentRunSessionEvent, createAgentSessionEventsFromLegacyState, createAgentTaskSessionEvent, normalizeAgentSessionEvent } from "./agentSessionEventLog.js";
export const AGENT_CONVERSATION_STORAGE_KEY = "aiCanvas.agentConversations.v1";
const AGENT_CONVERSATION_SCHEMA_VERSION = 2;
const DEFAULT_PROJECT_ID = "default_v2_project";
const DEFAULT_CONVERSATION_TITLE = "新对话";
const MAX_MESSAGE_CONTENT_CHARS = 8000;
const MAX_TITLE_CHARS = 40;
const MAX_SUMMARY_CHARS = 240;
const MAX_MEDIA_URL_CHARS = 2000;
const MAX_MEDIA_NAME_CHARS = 120;
const MAX_MEDIA_ITEMS = 12;
const MAX_RUN_EVENTS = 120;
const MAX_PENDING_ORIGINAL_MESSAGE_CHARS = 4000;
const MAX_PENDING_QUESTION_CHARS = 1200;
const MAX_PENDING_OPTIONS = 12;
const MAX_PENDING_INPUT_REFS = 12;
const MAX_MESSAGE_INPUT_REFS = 12;
const MAX_DIAGNOSTIC_TEXT_CHARS = 360;
const MESSAGE_TYPES = new Set(["text", "task_status", "task_result"]);
function getWindowObject(_0x556d65) {
  if (_0x556d65) {
    return _0x556d65;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  return null;
}
function normalizeProjectId(_0x2546b4) {
  return String(_0x2546b4 || "").trim() || DEFAULT_PROJECT_ID;
}
function normalizeTimestamp(_0x4dc87d, _0x2c82b0) {
  const _0x5343ba = Number(_0x4dc87d);
  if (Number.isFinite(_0x5343ba) && _0x5343ba > 0) {
    return _0x5343ba;
  } else {
    return _0x2c82b0;
  }
}
function normalizeBoolean(_0x45bb2c) {
  return _0x45bb2c === true;
}
function normalizeMessageType(_0x9e2127) {
  const _0x46d8a6 = String(_0x9e2127 || "text").trim();
  if (MESSAGE_TYPES.has(_0x46d8a6)) {
    return _0x46d8a6;
  } else {
    return "text";
  }
}
function stripText(_0x2afa19) {
  return String(_0x2afa19 || "").replace(/\s+/g, " ").trim();
}
function truncateText(_0x1918aa, _0x39b07e) {
  const _0x1dd5c7 = stripText(_0x1918aa);
  if (_0x1dd5c7.length <= _0x39b07e) {
    return _0x1dd5c7;
  }
  return _0x1dd5c7.slice(0, Math.max(0, _0x39b07e - 3)) + "...";
}
function cloneJson(_0x47b575) {
  try {
    return JSON.parse(JSON.stringify(_0x47b575));
  } catch {
    return null;
  }
}
function normalizeTaskMediaText(_0x566393 = "", _0x395aa3 = MAX_MEDIA_URL_CHARS) {
  const _0x312bc0 = String(_0x566393 || "").trim();
  if (!_0x312bc0 || /^data:/i.test(_0x312bc0)) {
    return "";
  }
  if (_0x312bc0.length <= _0x395aa3) {
    return _0x312bc0;
  }
  return _0x312bc0.slice(0, _0x395aa3);
}
function normalizeTaskMediaItem(_0x4c47c3 = {}, _0x4244b4 = "") {
  if (!_0x4c47c3 || typeof _0x4c47c3 !== "object" || Array.isArray(_0x4c47c3)) {
    return null;
  }
  const _0x519e1f = normalizeTaskMediaText(_0x4c47c3.url);
  const _0x8fc228 = normalizeTaskMediaText(_0x4c47c3.thumbUrl);
  if (!_0x519e1f && !_0x8fc228) {
    return null;
  }
  const _0x1b12ab = {
    url: _0x519e1f || _0x8fc228,
    thumbUrl: _0x8fc228 || _0x519e1f
  };
  const _0x4ee436 = normalizeTaskMediaText(_0x4c47c3.name || _0x4244b4, MAX_MEDIA_NAME_CHARS);
  if (_0x4ee436) {
    _0x1b12ab.name = _0x4ee436;
  }
  return _0x1b12ab;
}
function normalizeTaskMedia(_0x31f2eb = {}) {
  if (!_0x31f2eb || typeof _0x31f2eb !== "object" || Array.isArray(_0x31f2eb)) {
    return null;
  }
  const _0xc287c4 = String(_0x31f2eb.kind || "").trim();
  if (_0xc287c4 !== "image") {
    return null;
  }
  const _0x40b464 = normalizeTaskMediaText(_0x31f2eb.name, MAX_MEDIA_NAME_CHARS);
  const _0x2841de = (Array.isArray(_0x31f2eb.items) ? _0x31f2eb.items : []).map(_0x44b699 => normalizeTaskMediaItem(_0x44b699, _0x40b464)).filter(Boolean).slice(0, MAX_MEDIA_ITEMS);
  const _0x227cb0 = normalizeTaskMediaItem(_0x31f2eb, _0x40b464);
  const _0x3e9697 = _0x2841de.length > 0 ? _0x2841de : _0x227cb0 ? [_0x227cb0] : [];
  if (_0x3e9697.length === 0) {
    return null;
  }
  const _0x21dba3 = _0x3e9697[0];
  const _0x365fde = {
    kind: "image"
  };
  _0x365fde.url = _0x21dba3.url;
  _0x365fde.thumbUrl = _0x21dba3.thumbUrl;
  if (_0x40b464) {
    _0x365fde.name = _0x40b464;
  }
  if (_0x3e9697.length > 1 || Array.isArray(_0x31f2eb.items)) {
    _0x365fde.items = _0x3e9697;
  }
  return _0x365fde;
}
function normalizeTaskSummary(_0x3d1fc1 = {}) {
  if (!_0x3d1fc1 || typeof _0x3d1fc1 !== "object" || Array.isArray(_0x3d1fc1)) {
    return null;
  }
  const _0xf48886 = String(_0x3d1fc1.nodeId || _0x3d1fc1.targetNodeId || "").trim();
  if (!_0xf48886) {
    return null;
  }
  const _0x506e87 = {
    nodeId: _0xf48886,
    taskId: String(_0x3d1fc1.taskId || "").trim(),
    commandId: String(_0x3d1fc1.commandId || "generation.run").trim(),
    status: String(_0x3d1fc1.status || "").trim(),
    resultKind: String(_0x3d1fc1.resultKind || _0x3d1fc1.kind || "").trim()
  };
  const _0x16b8af = normalizeTaskMedia(_0x3d1fc1.media);
  if (_0x16b8af) {
    _0x506e87.media = _0x16b8af;
  }
  return _0x506e87;
}
function normalizePendingInputRef(_0x3a0227 = {}) {
  if (!_0x3a0227 || typeof _0x3a0227 !== "object" || Array.isArray(_0x3a0227)) {
    return null;
  }
  const _0x267e13 = String(_0x3a0227.nodeId || _0x3a0227.id || "").trim();
  if (!_0x267e13) {
    return null;
  }
  const _0x59c2b3 = {
    nodeId: _0x267e13,
    type: String(_0x3a0227.type || "").trim(),
    kind: String(_0x3a0227.kind || "").trim(),
    name: truncateText(_0x3a0227.name || "", MAX_MEDIA_NAME_CHARS),
    label: truncateText(_0x3a0227.label || _0x3a0227.name || "", MAX_MEDIA_NAME_CHARS),
    source: String(_0x3a0227.source || "").trim()
  };
  const _0x25fb30 = normalizeTaskMediaText(_0x3a0227.thumbUrl);
  if (_0x25fb30) {
    _0x59c2b3.thumbUrl = _0x25fb30;
  }
  return _0x59c2b3;
}
function normalizeMessageInputRef(_0x6710cf = {}) {
  if (!_0x6710cf || typeof _0x6710cf !== "object" || Array.isArray(_0x6710cf)) {
    return null;
  }
  const _0x28b06e = String(_0x6710cf.nodeId || _0x6710cf.id || "").trim();
  if (!_0x28b06e) {
    return null;
  }
  const _0x139602 = {
    nodeId: _0x28b06e,
    type: String(_0x6710cf.type || "").trim(),
    kind: String(_0x6710cf.kind || "").trim(),
    name: truncateText(_0x6710cf.name || "", MAX_MEDIA_NAME_CHARS),
    label: truncateText(_0x6710cf.label || _0x6710cf.name || "", MAX_MEDIA_NAME_CHARS),
    source: String(_0x6710cf.source || "").trim()
  };
  const _0x8d2cde = normalizeTaskMediaText(_0x6710cf.thumbUrl);
  if (_0x8d2cde) {
    _0x139602.thumbUrl = _0x8d2cde;
  }
  return _0x139602;
}
function normalizePendingClarification(_0x17aef2 = {}) {
  if (!_0x17aef2 || typeof _0x17aef2 !== "object" || Array.isArray(_0x17aef2)) {
    return null;
  }
  const _0x59d44c = truncateText(_0x17aef2.originalMessage || "", MAX_PENDING_ORIGINAL_MESSAGE_CHARS);
  const _0xe2e060 = truncateText(_0x17aef2.question || _0x17aef2.reply || "", MAX_PENDING_QUESTION_CHARS);
  if (!_0x59d44c || !_0xe2e060) {
    return null;
  }
  return {
    originalMessage: _0x59d44c,
    question: _0xe2e060,
    reply: truncateText(_0x17aef2.reply || _0xe2e060, MAX_PENDING_QUESTION_CHARS),
    options: (Array.isArray(_0x17aef2.options) ? _0x17aef2.options : []).map(_0x338783 => ({
      id: String(_0x338783?.id || "").trim(),
      label: truncateText(_0x338783?.label || _0x338783?.id || "", MAX_TITLE_CHARS)
    })).filter(_0x4482aa => _0x4482aa.id && _0x4482aa.label).slice(0, MAX_PENDING_OPTIONS),
    targetKind: String(_0x17aef2.targetKind || "").trim(),
    inputRefs: (Array.isArray(_0x17aef2.inputRefs) ? _0x17aef2.inputRefs : []).map(normalizePendingInputRef).filter(Boolean).slice(0, MAX_PENDING_INPUT_REFS)
  };
}
function normalizeFailureDiagnostic(_0x3cdd9b = {}) {
  if (!_0x3cdd9b || typeof _0x3cdd9b !== "object" || Array.isArray(_0x3cdd9b)) {
    return null;
  }
  const _0x454b0c = String(_0x3cdd9b.phase || "").trim();
  const _0x343867 = truncateText(_0x3cdd9b.summary || "", MAX_DIAGNOSTIC_TEXT_CHARS);
  if (!_0x454b0c || !_0x343867) {
    return null;
  }
  const _0xb11d68 = {
    phase: _0x454b0c,
    phaseLabel: truncateText(_0x3cdd9b.phaseLabel || _0x454b0c, MAX_TITLE_CHARS),
    summary: _0x343867,
    detail: truncateText(_0x3cdd9b.detail || "", MAX_DIAGNOSTIC_TEXT_CHARS),
    errorCode: String(_0x3cdd9b.errorCode || "").trim().slice(0, 80),
    step: Math.max(1, Math.trunc(Number(_0x3cdd9b.step || 1))),
    completedSteps: Math.max(0, Math.trunc(Number(_0x3cdd9b.completedSteps || 0))),
    retryable: _0x3cdd9b.retryable === true
  };
  const _0x7f66df = String(_0x3cdd9b.sourceErrorCode || "").trim().slice(0, 80);
  const _0x397f02 = String(_0x3cdd9b.commandId || "").trim().slice(0, 120);
  if (_0x7f66df) {
    _0xb11d68.sourceErrorCode = _0x7f66df;
  }
  if (_0x397f02) {
    _0xb11d68.commandId = _0x397f02;
  }
  return _0xb11d68;
}
function createDefaultId(_0x23d91c) {
  return "agent-conv-" + Number(_0x23d91c || Date.now()).toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}
function normalizeMessage(_0x75ddb = {}, _0x37eebe = Date.now()) {
  const _0x7e59be = String(_0x75ddb.role || "assistant").trim() || "assistant";
  const _0x121528 = truncateText(_0x75ddb.content || _0x75ddb.reply || _0x75ddb.message || _0x75ddb.question || "", MAX_MESSAGE_CONTENT_CHARS);
  const _0x444832 = String(_0x75ddb.status || "").trim();
  const _0xc163ab = normalizeTimestamp(_0x75ddb.ts, _0x37eebe);
  if (!_0x121528 && !_0x444832) {
    return null;
  }
  const _0x55ae3a = normalizeMessageType(_0x75ddb.messageType || _0x75ddb.type);
  const _0x4e23f3 = {
    role: _0x7e59be,
    content: _0x121528,
    status: _0x444832,
    ts: _0xc163ab
  };
  const _0x45dd70 = String(_0x75ddb.itemId || "").trim();
  const _0x126d2c = String(_0x75ddb.turnId || "").trim();
  if (_0x45dd70) {
    _0x4e23f3.itemId = _0x45dd70;
  }
  if (_0x126d2c) {
    _0x4e23f3.turnId = _0x126d2c;
  }
  if (_0x7e59be === "user") {
    const _0x34221c = (Array.isArray(_0x75ddb.inputRefs) ? _0x75ddb.inputRefs : []).map(normalizeMessageInputRef).filter(Boolean).slice(0, MAX_MESSAGE_INPUT_REFS);
    if (_0x34221c.length > 0) {
      _0x4e23f3.inputRefs = _0x34221c;
    }
  }
  if (_0x7e59be === "assistant") {
    const _0x92378c = normalizeFailureDiagnostic(_0x75ddb.diagnostic);
    if (_0x92378c) {
      _0x4e23f3.diagnostic = _0x92378c;
    }
  }
  if (_0x55ae3a !== "text") {
    _0x4e23f3.messageType = _0x55ae3a;
    const _0x4f86ff = normalizeTaskSummary(_0x75ddb.task || _0x75ddb.taskBinding);
    if (_0x4f86ff) {
      _0x4e23f3.task = _0x4f86ff;
    }
  }
  return _0x4e23f3;
}
function inferLegacyPendingClarification(_0x1c9f1f = []) {
  for (let _0xe22f78 = _0x1c9f1f.length - 1; _0xe22f78 >= 0; _0xe22f78 -= 1) {
    const _0x4ad68e = _0x1c9f1f[_0xe22f78];
    if (_0x4ad68e?.role !== "assistant" || _0x4ad68e?.status !== "need_clarification" || !_0x4ad68e?.content) {
      continue;
    }
    const _0x38ecd8 = _0x1c9f1f.slice(_0xe22f78 + 1).some(_0x89ed50 => _0x89ed50?.role === "assistant" && ["success", "chat", "need_confirmation", "cancelled", "stopped"].includes(String(_0x89ed50?.status || "")));
    if (_0x38ecd8) {
      return null;
    }
    for (let _0x182b62 = _0xe22f78 - 1; _0x182b62 >= 0; _0x182b62 -= 1) {
      const _0x2d819b = _0x1c9f1f[_0x182b62];
      if (_0x2d819b?.role !== "user" || !_0x2d819b?.content) {
        continue;
      }
      return normalizePendingClarification({
        originalMessage: _0x2d819b.content,
        question: _0x4ad68e.content,
        reply: _0x4ad68e.content
      });
    }
    return null;
  }
  return null;
}
function createTitleFromMessage(_0x1eaaac = {}) {
  if (String(_0x1eaaac.role || "") !== "user") {
    return "";
  }
  return truncateText(_0x1eaaac.content, MAX_TITLE_CHARS);
}
function normalizeConversation(_0xe76dbf = {}, _0x10e11b = Date.now()) {
  const _0x44edba = String(_0xe76dbf.id || "").trim();
  if (!_0x44edba) {
    return null;
  }
  const _0x46ccde = normalizeProjectId(_0xe76dbf.projectId);
  const _0x24137a = normalizeTimestamp(_0xe76dbf.createdAt, _0x10e11b);
  const _0x24dfaa = normalizeTimestamp(_0xe76dbf.updatedAt, _0x24137a);
  const _0x2df0ee = Array.isArray(_0xe76dbf.messages) ? _0xe76dbf.messages.map((_0x57bfb0, _0x5ebfdd) => normalizeMessage({
    ..._0x57bfb0,
    itemId: String(_0x57bfb0?.itemId || "").trim() || _0x44edba + ":message:" + (_0x5ebfdd + 1)
  }, _0x24dfaa)).filter(Boolean) : [];
  const _0x185825 = Array.isArray(_0xe76dbf.runEvents) ? _0xe76dbf.runEvents.map(_0x10a32c => normalizeAgentRunEvent(_0x10a32c, _0x24dfaa)).filter(Boolean).slice(-MAX_RUN_EVENTS) : [];
  const _0x3db0dd = normalizeAgentOperationLedger(_0xe76dbf.operationLedger, _0x24dfaa);
  const _0x3c24f6 = normalizeAgentTaskBindings(_0xe76dbf.taskBindings);
  const _0xc4ea4c = Array.isArray(_0xe76dbf.sessionEvents) ? _0xe76dbf.sessionEvents.map((_0x10a2e4, _0x1587a7) => normalizeAgentSessionEvent(_0x10a2e4, {
    fallbackTs: _0x24dfaa,
    fallbackSeq: _0x1587a7 + 1
  })).filter(Boolean) : [];
  const _0x11c553 = _0xc4ea4c.length > 0 ? _0xc4ea4c : createAgentSessionEventsFromLegacyState({
    conversationId: _0x44edba,
    projectId: _0x46ccde,
    messages: _0x2df0ee,
    runEvents: _0x185825,
    operationLedger: _0x3db0dd,
    taskBindings: _0x3c24f6
  });
  const _0x82b64d = Object.prototype.hasOwnProperty.call(_0xe76dbf, "pendingClarification");
  return {
    id: _0x44edba,
    projectId: _0x46ccde,
    title: truncateText(_0xe76dbf.title || DEFAULT_CONVERSATION_TITLE, MAX_TITLE_CHARS) || DEFAULT_CONVERSATION_TITLE,
    createdAt: _0x24137a,
    updatedAt: _0x24dfaa,
    messages: _0x2df0ee,
    runEvents: _0x185825,
    operationLedger: _0x3db0dd,
    taskBindings: _0x3c24f6,
    sessionEvents: _0x11c553,
    resumeCheckpoint: normalizeAgentResumeCheckpoint(_0xe76dbf.resumeCheckpoint),
    pendingClarification: _0x82b64d ? normalizePendingClarification(_0xe76dbf.pendingClarification) : inferLegacyPendingClarification(_0x2df0ee),
    lastPlanSummary: truncateText(_0xe76dbf.lastPlanSummary || "", MAX_SUMMARY_CHARS),
    lastCanvasSnapshotDigest: _0xe76dbf.lastCanvasSnapshotDigest && typeof _0xe76dbf.lastCanvasSnapshotDigest === "object" ? cloneJson(_0xe76dbf.lastCanvasSnapshotDigest) || null : null,
    hasUnfinishedOperation: normalizeBoolean(_0xe76dbf.hasUnfinishedOperation),
    archived: normalizeBoolean(_0xe76dbf.archived)
  };
}
function normalizeStorageState(_0x1a8043 = {}, _0x334584 = Date.now()) {
  const _0x133849 = _0x1a8043.activeByProjectId && typeof _0x1a8043.activeByProjectId === "object" ? Object.fromEntries(Object.entries(_0x1a8043.activeByProjectId).map(([_0x1f9211, _0x251d41]) => [normalizeProjectId(_0x1f9211), String(_0x251d41 || "").trim()]).filter(([, _0x5faff3]) => _0x5faff3)) : {};
  const _0x3751e2 = Array.isArray(_0x1a8043.conversations) ? _0x1a8043.conversations.map(_0x52c6e7 => normalizeConversation(_0x52c6e7, _0x334584)).filter(Boolean) : [];
  return {
    schemaVersion: AGENT_CONVERSATION_SCHEMA_VERSION,
    activeByProjectId: _0x133849,
    conversations: _0x3751e2
  };
}
function getNextSessionEventSequence(_0x673e33 = []) {
  return (Array.isArray(_0x673e33) ? _0x673e33 : []).reduce((_0x585a40, _0x13f342) => Math.max(_0x585a40, Number(_0x13f342?.seq || 0)), 0) + 1;
}
function appendSessionEventSnapshot(_0x3d7961, _0x53a072, _0xaed894 = {}, _0x529bd5 = Date.now()) {
  const _0x5f5461 = Array.isArray(_0x3d7961?.sessionEvents) ? _0x3d7961.sessionEvents : [];
  const _0xdc88db = getNextSessionEventSequence(_0x5f5461);
  const _0x4aff34 = _0x53a072({
    id: _0x3d7961.id + ":event:" + _0xdc88db,
    seq: _0xdc88db,
    conversationId: _0x3d7961.id,
    projectId: _0x3d7961.projectId,
    ..._0xaed894
  });
  if (!_0x4aff34) {
    return _0x5f5461;
  }
  return [..._0x5f5461, {
    ..._0x4aff34,
    ts: _0x4aff34.ts || _0x529bd5
  }];
}
function appendChangedDurableStateEvents(_0x3465fb, _0x2a759e, _0x8a8f8d = {}, _0x4d8650 = Date.now()) {
  let _0x4156d2 = Array.isArray(_0x3465fb.sessionEvents) ? _0x3465fb.sessionEvents : [];
  const _0x301f0c = (_0x261538, _0x14c902) => {
    _0x4156d2 = appendSessionEventSnapshot({
      ..._0x3465fb,
      sessionEvents: _0x4156d2
    }, _0x261538, _0x14c902, _0x4d8650);
  };
  if (Array.isArray(_0x8a8f8d.operationLedger)) {
    const _0xa9a862 = new Map((_0x3465fb.operationLedger || []).map(_0x12dc1b => [_0x12dc1b.id, _0x12dc1b]));
    for (const _0x5832c7 of _0x2a759e.operationLedger || []) {
      if (JSON.stringify(_0xa9a862.get(_0x5832c7.id) || null) === JSON.stringify(_0x5832c7)) {
        continue;
      }
      _0x301f0c(createAgentOperationSessionEvent, {
        operation: _0x5832c7
      });
    }
  }
  if (Array.isArray(_0x8a8f8d.taskBindings)) {
    const _0x558588 = new Map((_0x3465fb.taskBindings || []).map(_0x5daa21 => [_0x5daa21.id, _0x5daa21]));
    for (const _0x227f25 of _0x2a759e.taskBindings || []) {
      if (JSON.stringify(_0x558588.get(_0x227f25.id) || null) === JSON.stringify(_0x227f25)) {
        continue;
      }
      _0x301f0c(createAgentTaskSessionEvent, {
        taskBinding: _0x227f25
      });
    }
  }
  return _0x4156d2;
}
function sortConversations(_0x24a069 = []) {
  return [..._0x24a069].sort((_0x56c7ea, _0x4661a1) => Number(_0x4661a1.updatedAt || 0) - Number(_0x56c7ea.updatedAt || 0));
}
function hasMessages(_0x2cc891 = {}) {
  return Array.isArray(_0x2cc891.messages) && _0x2cc891.messages.length > 0;
}
function findLatestConversationWithMessages(_0x1f25c9 = []) {
  return _0x1f25c9.find(_0x7cd4c7 => hasMessages(_0x7cd4c7)) || null;
}
export function createAgentConversationStore({
  windowObject = undefined,
  getProjectId = () => DEFAULT_PROJECT_ID,
  now = () => Date.now(),
  idFactory = undefined
} = {}) {
  const _0x5188ba = getWindowObject(windowObject);
  function _0x377301() {
    try {
      return normalizeProjectId(getProjectId?.());
    } catch {
      return DEFAULT_PROJECT_ID;
    }
  }
  function _0x14635a(_0x23974c) {
    if (typeof idFactory === "function") {
      const _0x5d7298 = String(idFactory({
        now: _0x23974c,
        projectId: _0x377301()
      }) || "").trim();
      if (_0x5d7298) {
        return _0x5d7298;
      }
    }
    return createDefaultId(_0x23974c);
  }
  function _0x1f5a90() {
    try {
      const _0x36d1d1 = _0x5188ba?.localStorage?.getItem?.(AGENT_CONVERSATION_STORAGE_KEY);
      if (!_0x36d1d1) {
        return normalizeStorageState({}, now());
      }
      return normalizeStorageState(JSON.parse(_0x36d1d1), now());
    } catch {
      return normalizeStorageState({}, now());
    }
  }
  function _0x2ae8ef(_0x631186) {
    const _0x5e7e89 = normalizeStorageState(_0x631186, now());
    try {
      _0x5188ba?.localStorage?.setItem?.(AGENT_CONVERSATION_STORAGE_KEY, JSON.stringify(_0x5e7e89));
    } catch {}
    return _0x5e7e89;
  }
  function _0x41774f(_0xec1fcc = {}) {
    const _0x52f5cb = normalizeTimestamp(_0xec1fcc.createdAt || _0xec1fcc.updatedAt, now());
    return normalizeConversation({
      id: _0xec1fcc.id || _0x14635a(_0x52f5cb),
      projectId: _0xec1fcc.projectId || _0x377301(),
      title: _0xec1fcc.title || DEFAULT_CONVERSATION_TITLE,
      createdAt: _0x52f5cb,
      updatedAt: _0x52f5cb,
      messages: _0xec1fcc.messages || [],
      runEvents: _0xec1fcc.runEvents || [],
      operationLedger: _0xec1fcc.operationLedger || [],
      taskBindings: _0xec1fcc.taskBindings || [],
      sessionEvents: _0xec1fcc.sessionEvents || [],
      resumeCheckpoint: _0xec1fcc.resumeCheckpoint || null,
      pendingClarification: _0xec1fcc.pendingClarification || null,
      lastPlanSummary: _0xec1fcc.lastPlanSummary || "",
      lastCanvasSnapshotDigest: _0xec1fcc.lastCanvasSnapshotDigest || null,
      hasUnfinishedOperation: _0xec1fcc.hasUnfinishedOperation === true,
      archived: _0xec1fcc.archived === true
    }, _0x52f5cb);
  }
  function _0x45e20e(_0x533d7b = _0x1f5a90()) {
    const _0x3f40a8 = _0x377301();
    return sortConversations(_0x533d7b.conversations.filter(_0x3f202a => _0x3f202a.projectId === _0x3f40a8 && _0x3f202a.archived !== true));
  }
  function _0x3ad8c8(_0x588783, _0x5cb67f) {
    const _0x577acb = String(_0x5cb67f || "").trim();
    return _0x588783.conversations.find(_0x27295f => _0x27295f.id === _0x577acb) || null;
  }
  function _0x5b81d9({
    preferLatestWithMessages = false
  } = {}) {
    const _0x653872 = _0x1f5a90();
    const _0x378c66 = _0x377301();
    const _0x46921a = _0x653872.activeByProjectId[_0x378c66] || "";
    const _0x5ad238 = _0x46921a ? _0x3ad8c8(_0x653872, _0x46921a) : null;
    const _0x49f8a6 = _0x45e20e(_0x653872);
    const _0x2b7820 = findLatestConversationWithMessages(_0x49f8a6);
    if (_0x5ad238 && _0x5ad238.projectId === _0x378c66 && _0x5ad238.archived !== true) {
      if (preferLatestWithMessages && !hasMessages(_0x5ad238) && _0x2b7820 && _0x2b7820.id !== _0x5ad238.id) {
        _0x653872.activeByProjectId[_0x378c66] = _0x2b7820.id;
        _0x2ae8ef(_0x653872);
        return cloneJson(_0x2b7820);
      }
      return cloneJson(_0x5ad238);
    }
    const _0x144590 = _0x2b7820 || _0x49f8a6[0] || null;
    if (_0x144590) {
      _0x653872.activeByProjectId[_0x378c66] = _0x144590.id;
      _0x2ae8ef(_0x653872);
      return cloneJson(_0x144590);
    }
    const _0x15cbbb = _0x41774f({
      projectId: _0x378c66
    });
    _0x653872.conversations.push(_0x15cbbb);
    _0x653872.activeByProjectId[_0x378c66] = _0x15cbbb.id;
    _0x2ae8ef(_0x653872);
    return cloneJson(_0x15cbbb);
  }
  function _0x48b3d1() {
    return _0x45e20e().map(_0x3146cc => cloneJson(_0x3146cc));
  }
  function _0x509624(_0x1bfd76) {
    const _0x2cd0c8 = _0x1f5a90();
    const _0xddf89b = _0x3ad8c8(_0x2cd0c8, _0x1bfd76);
    if (_0xddf89b) {
      return cloneJson(_0xddf89b);
    } else {
      return null;
    }
  }
  function _0x367766(_0x18effc = {}) {
    const _0x16a2eb = _0x1f5a90();
    const _0x500f80 = _0x41774f(_0x18effc);
    _0x16a2eb.conversations.push(_0x500f80);
    _0x16a2eb.activeByProjectId[_0x500f80.projectId] = _0x500f80.id;
    _0x2ae8ef(_0x16a2eb);
    return cloneJson(_0x500f80);
  }
  function _0x10b18e(_0x3e950b, _0x333013 = {}) {
    const _0xe584a2 = _0x1f5a90();
    const _0x1440a4 = String(_0x3e950b || "").trim();
    const _0x309b70 = _0xe584a2.conversations.findIndex(_0x505eea => _0x505eea.id === _0x1440a4);
    if (_0x309b70 < 0) {
      return null;
    }
    const _0x271c7a = _0xe584a2.conversations[_0x309b70];
    const _0x16da7e = normalizeTimestamp(_0x333013.updatedAt, now());
    const _0x177b72 = normalizeConversation({
      ..._0x271c7a,
      ..._0x333013,
      id: _0x271c7a.id,
      projectId: _0x271c7a.projectId,
      createdAt: _0x271c7a.createdAt,
      updatedAt: _0x16da7e,
      messages: Array.isArray(_0x333013.messages) ? _0x333013.messages : _0x271c7a.messages,
      runEvents: Array.isArray(_0x333013.runEvents) ? _0x333013.runEvents : _0x271c7a.runEvents,
      operationLedger: Array.isArray(_0x333013.operationLedger) ? _0x333013.operationLedger : _0x271c7a.operationLedger,
      taskBindings: Array.isArray(_0x333013.taskBindings) ? _0x333013.taskBindings : _0x271c7a.taskBindings,
      sessionEvents: Array.isArray(_0x333013.sessionEvents) ? _0x333013.sessionEvents : _0x271c7a.sessionEvents
    }, _0x16da7e);
    if (!Array.isArray(_0x333013.sessionEvents)) {
      _0x177b72.sessionEvents = appendChangedDurableStateEvents(_0x271c7a, _0x177b72, _0x333013, _0x16da7e);
    }
    _0xe584a2.conversations[_0x309b70] = _0x177b72;
    _0x2ae8ef(_0xe584a2);
    return cloneJson(_0x177b72);
  }
  function _0x488071(_0x175b28, _0x365140 = {}) {
    const _0x784912 = _0x1f5a90();
    const _0x3ec0ec = String(_0x175b28 || "").trim();
    const _0x2989bb = _0x784912.conversations.findIndex(_0x1f84dc => _0x1f84dc.id === _0x3ec0ec);
    if (_0x2989bb < 0) {
      return null;
    }
    const _0x57114a = _0x784912.conversations[_0x2989bb];
    const _0x225931 = normalizeTimestamp(_0x365140.ts, now());
    const _0x35322e = normalizeMessage({
      ..._0x365140,
      itemId: String(_0x365140.itemId || "").trim() || _0x3ec0ec + ":message:" + (_0x57114a.messages.length + 1)
    }, _0x225931);
    if (!_0x35322e) {
      return cloneJson(_0x784912.conversations[_0x2989bb]);
    }
    const _0x378429 = [..._0x57114a.messages, _0x35322e];
    const _0x104af0 = _0x57114a.title === DEFAULT_CONVERSATION_TITLE ? createTitleFromMessage(_0x35322e) : "";
    const _0x175be4 = normalizeConversation({
      ..._0x57114a,
      title: _0x104af0 || _0x57114a.title,
      updatedAt: _0x225931,
      messages: _0x378429,
      sessionEvents: appendSessionEventSnapshot(_0x57114a, createAgentMessageSessionEvent, {
        turnId: String(_0x365140.turnId || "").trim(),
        itemId: String(_0x365140.itemId || "").trim() || _0x3ec0ec + ":message:" + _0x378429.length,
        message: _0x35322e
      }, _0x225931)
    }, _0x225931);
    _0x784912.conversations[_0x2989bb] = _0x175be4;
    _0x2ae8ef(_0x784912);
    return cloneJson(_0x175be4);
  }
  function _0x4a6337(_0x582c48, _0x2440a6 = {}) {
    const _0xc14523 = _0x1f5a90();
    const _0x5d2035 = String(_0x582c48 || "").trim();
    const _0x405d3d = _0xc14523.conversations.findIndex(_0x4a146f => _0x4a146f.id === _0x5d2035);
    if (_0x405d3d < 0) {
      return null;
    }
    const _0xe15736 = normalizeTimestamp(_0x2440a6.ts, now());
    const _0xcf63d5 = normalizeAgentRunEvent(_0x2440a6, _0xe15736);
    if (!_0xcf63d5) {
      return cloneJson(_0xc14523.conversations[_0x405d3d]);
    }
    const _0x4ba619 = _0xc14523.conversations[_0x405d3d];
    const _0x2dbcbe = normalizeConversation({
      ..._0x4ba619,
      updatedAt: _0xe15736,
      runEvents: [...(_0x4ba619.runEvents || []), _0xcf63d5].slice(-MAX_RUN_EVENTS),
      sessionEvents: appendSessionEventSnapshot(_0x4ba619, createAgentRunSessionEvent, {
        runEvent: _0xcf63d5
      }, _0xe15736)
    }, _0xe15736);
    _0xc14523.conversations[_0x405d3d] = _0x2dbcbe;
    _0x2ae8ef(_0xc14523);
    return cloneJson(_0x2dbcbe);
  }
  function _0x32f67f(_0x25da75) {
    const _0x3253d7 = _0x1f5a90();
    const _0x58592b = String(_0x25da75 || "").trim();
    if (!_0x58592b) {
      return _0x5b81d9();
    }
    _0x3253d7.conversations = _0x3253d7.conversations.filter(_0x2bbdd0 => _0x2bbdd0.id !== _0x58592b);
    for (const [_0x3f3da2, _0x51b545] of Object.entries(_0x3253d7.activeByProjectId)) {
      if (_0x51b545 === _0x58592b) {
        delete _0x3253d7.activeByProjectId[_0x3f3da2];
      }
    }
    _0x2ae8ef(_0x3253d7);
    return _0x5b81d9();
  }
  function _0x36615c(_0x27b841) {
    const _0x555ebf = _0x1f5a90();
    const _0x3e50c7 = _0x377301();
    const _0x35365f = _0x3ad8c8(_0x555ebf, _0x27b841);
    if (!_0x35365f || _0x35365f.projectId !== _0x3e50c7 || _0x35365f.archived === true) {
      return null;
    }
    _0x555ebf.activeByProjectId[_0x3e50c7] = _0x35365f.id;
    _0x2ae8ef(_0x555ebf);
    return cloneJson(_0x35365f);
  }
  function _0x4b6d8f() {
    return _0x5b81d9()?.id || "";
  }
  return {
    listConversations: _0x48b3d1,
    getConversation: _0x509624,
    createConversation: _0x367766,
    updateConversation: _0x10b18e,
    appendMessage: _0x488071,
    appendRunEvent: _0x4a6337,
    deleteConversation: _0x32f67f,
    setActiveConversationId: _0x36615c,
    getActiveConversationId: _0x4b6d8f,
    ensureActiveConversation: _0x5b81d9
  };
}