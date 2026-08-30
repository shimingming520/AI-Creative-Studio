const MAX_EVENT_MESSAGE_CHARS = 320;
const MAX_EVENT_IDS = 24;
function truncateText(_0x1f0be0, _0x1f0827 = MAX_EVENT_MESSAGE_CHARS) {
  const _0x538452 = String(_0x1f0be0 || "").replace(/\s+/g, " ").trim();
  if (_0x538452.length <= _0x1f0827) {
    return _0x538452;
  } else {
    return _0x538452.slice(0, Math.max(0, _0x1f0827 - 3)) + "...";
  }
}
function normalizeStringArray(_0x37bd1c) {
  if (Array.isArray(_0x37bd1c)) {
    return [...new Set(_0x37bd1c.map(_0x38716d => String(_0x38716d || "").trim()).filter(Boolean))].slice(0, MAX_EVENT_IDS);
  } else {
    return [];
  }
}
function normalizeTimestamp(_0x575949, _0xa61e9d = Date.now()) {
  const _0x5aa211 = Number(_0x575949);
  if (Number.isFinite(_0x5aa211) && _0x5aa211 > 0) {
    return _0x5aa211;
  } else {
    return _0xa61e9d;
  }
}
export function normalizeAgentRunEvent(_0x168e7a = {}, _0x7cc014 = Date.now()) {
  const _0x97a2c4 = String(_0x168e7a.type || "").trim();
  if (!_0x97a2c4) {
    return null;
  }
  const _0x4d2f91 = normalizeTimestamp(_0x168e7a.ts, _0x7cc014);
  const _0x3476c3 = {
    id: String(_0x168e7a.id || "").trim(),
    runId: String(_0x168e7a.runId || "").trim(),
    conversationId: String(_0x168e7a.conversationId || "").trim(),
    projectId: String(_0x168e7a.projectId || "").trim(),
    type: _0x97a2c4,
    status: String(_0x168e7a.status || "").trim(),
    step: Math.max(0, Math.trunc(Number(_0x168e7a.step || 0))),
    commandId: String(_0x168e7a.commandId || "").trim(),
    ok: _0x168e7a.ok === true ? true : _0x168e7a.ok === false ? false : null,
    errorCode: String(_0x168e7a.errorCode || "").trim(),
    message: truncateText(_0x168e7a.message || _0x168e7a.reason || ""),
    ts: _0x4d2f91
  };
  const _0x4e2d23 = normalizeStringArray(_0x168e7a.commandIds);
  const _0x159f78 = normalizeStringArray(_0x168e7a.modelIds);
  if (_0x4e2d23.length > 0) {
    _0x3476c3.commandIds = _0x4e2d23;
  }
  if (_0x159f78.length > 0) {
    _0x3476c3.modelIds = _0x159f78;
  }
  if (_0x168e7a.confirmed === true) {
    _0x3476c3.confirmed = true;
  }
  return _0x3476c3;
}
export function replayAgentRunEvents(_0x170eb0 = [], {
  runId = ""
} = {}) {
  const _0x48cd3e = String(runId || "").trim();
  const _0x5a81b5 = (Array.isArray(_0x170eb0) ? _0x170eb0 : []).map(_0x522014 => normalizeAgentRunEvent(_0x522014)).filter(_0x4576ad => _0x4576ad && (!_0x48cd3e || _0x4576ad.runId === _0x48cd3e)).sort((_0x3cd362, _0x5969ae) => _0x3cd362.ts - _0x5969ae.ts);
  const _0x11a28e = _0x5a81b5[0] || null;
  const _0xc55d95 = _0x5a81b5.at(-1) || null;
  const _0x5d62e3 = _0x5a81b5.filter(_0x177b02 => _0x177b02.type === "tool.completed" && _0x177b02.commandId).map(_0x3f01cd => ({
    commandId: _0x3f01cd.commandId,
    ok: _0x3f01cd.ok,
    step: _0x3f01cd.step,
    confirmed: _0x3f01cd.confirmed === true
  }));
  const _0x4ef6d1 = _0x5a81b5.filter(_0x4c98c3 => _0x4c98c3.type.startsWith("approval."));
  const _0x46a7d2 = _0x5a81b5.filter(_0x27eca9 => _0x27eca9.ok === false || _0x27eca9.status === "failed" || _0x27eca9.errorCode);
  const _0x1dd73b = [..._0x5a81b5].reverse().find(_0x26ca6e => _0x26ca6e.type === "run.status" && _0x26ca6e.status)?.status || "";
  return {
    runId: _0x48cd3e || _0x11a28e?.runId || "",
    status: _0x1dd73b,
    startedAt: _0x11a28e?.ts || 0,
    endedAt: _0xc55d95?.ts || 0,
    durationMs: _0x11a28e && _0xc55d95 ? Math.max(0, _0xc55d95.ts - _0x11a28e.ts) : 0,
    eventCount: _0x5a81b5.length,
    commandSequence: _0x5d62e3,
    toolSuccessCount: _0x5d62e3.filter(_0x18516c => _0x18516c.ok === true).length,
    toolFailureCount: _0x5d62e3.filter(_0x1585ee => _0x1585ee.ok === false).length,
    approvalRequestedCount: _0x4ef6d1.filter(_0xfc8213 => _0xfc8213.type === "approval.requested").length,
    approvalConfirmedCount: _0x4ef6d1.filter(_0x53224b => _0x53224b.type === "approval.confirmed").length,
    approvalCancelledCount: _0x4ef6d1.filter(_0x17c91d => _0x17c91d.type === "approval.cancelled").length,
    discoveryCount: _0x5a81b5.filter(_0x22b1f8 => _0x22b1f8.type === "capability.discovered").length,
    errors: _0x46a7d2.map(_0x11b2f1 => ({
      type: _0x11b2f1.type,
      commandId: _0x11b2f1.commandId,
      errorCode: _0x11b2f1.errorCode,
      message: _0x11b2f1.message
    })),
    events: _0x5a81b5
  };
}