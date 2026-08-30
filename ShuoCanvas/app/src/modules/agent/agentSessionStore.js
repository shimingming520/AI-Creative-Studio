import { normalizeAgentRunEvent, replayAgentRunEvents } from "./agentRunEventLog.js";
import { normalizeAgentOperation } from "./agentDurableRunState.js";
import { compareAgentSessionProjection, createAgentMessageSessionEvent, createAgentOperationSessionEvent, createAgentRunSessionEvent, createAgentTaskSessionEvent, projectAgentSessionEvents } from "./agentSessionEventLog.js";
const DEFAULT_RECENT_COMMAND_LIMIT = 50;
const DEFAULT_TRACE_LIMIT = 80;
const DEFAULT_RUN_EVENT_LIMIT = 240;
export function createAgentSessionStore({
  recentCommandLimit = DEFAULT_RECENT_COMMAND_LIMIT,
  traceLimit = DEFAULT_TRACE_LIMIT,
  runEventLimit = DEFAULT_RUN_EVENT_LIMIT,
  conversationStore = null
} = {}) {
  const _0x4f509b = {
    history: [],
    recentCommands: [],
    debugTrace: [],
    runEvents: [],
    sessionEvents: [],
    operationLedger: [],
    taskBindings: [],
    pendingPlan: null,
    pendingRecovery: null,
    pendingClarification: null,
    pendingLoopRun: null,
    currentRun: null
  };
  const _0x396244 = new Set();
  let _0x3df18a = "";
  let _0x130a49 = "";
  let _0x3a0bd4 = 0;
  function _0x37e655(_0x3d0359, _0x53e395 = null) {
    try {
      return JSON.parse(JSON.stringify(_0x3d0359));
    } catch {
      return _0x53e395;
    }
  }
  function _0x51ab6d(_0x4442ab = null, {
    preserveRuntime = false
  } = {}) {
    _0x130a49 = String(_0x4442ab?.projectId || "");
    _0x3df18a = _0x4442ab ? _0x130a49 + "::" + String(_0x4442ab.id || "") : "";
    _0x4f509b.history = Array.isArray(_0x4442ab?.messages) ? _0x4442ab.messages.map(_0x4a407c => ({
      ..._0x4a407c
    })) : [];
    _0x4f509b.runEvents = Array.isArray(_0x4442ab?.runEvents) ? _0x4442ab.runEvents.map(_0x11c018 => ({
      ..._0x11c018
    })) : [];
    _0x4f509b.sessionEvents = Array.isArray(_0x4442ab?.sessionEvents) ? _0x37e655(_0x4442ab.sessionEvents, []) : [];
    _0x3a0bd4 = _0x4f509b.sessionEvents.reduce((_0x2b2ae6, _0x960d7) => Math.max(_0x2b2ae6, Number(_0x960d7?.seq || 0)), 0);
    _0x4f509b.operationLedger = Array.isArray(_0x4442ab?.operationLedger) ? _0x4442ab.operationLedger.map(_0x5c2b3b => ({
      ..._0x5c2b3b
    })) : [];
    _0x4f509b.taskBindings = Array.isArray(_0x4442ab?.taskBindings) ? _0x37e655(_0x4442ab.taskBindings, []) : [];
    if (!preserveRuntime) {
      _0x4f509b.pendingLoopRun = _0x4442ab?.resumeCheckpoint ? _0x37e655(_0x4442ab.resumeCheckpoint, null) : null;
      _0x4f509b.pendingClarification = _0x4442ab?.pendingClarification ? _0x37e655(_0x4442ab.pendingClarification, null) : null;
    }
  }
  function _0x43af91() {
    _0x4f509b.recentCommands = [];
    _0x4f509b.debugTrace = [];
    _0x4f509b.taskBindings = [];
    _0x4f509b.pendingPlan = null;
    _0x4f509b.pendingRecovery = null;
    _0x4f509b.pendingLoopRun = null;
    _0x4f509b.currentRun = null;
  }
  function _0x4df85a() {
    const _0x53bd3e = conversationStore?.ensureActiveConversation?.({
      preferLatestWithMessages: true
    }) || null;
    if (_0x53bd3e) {
      _0x51ab6d(_0x53bd3e);
    }
    return _0x53bd3e;
  }
  function _0xb1651e() {
    const _0x3de552 = conversationStore?.getActiveConversationId?.();
    if (_0x3de552) {
      return conversationStore?.getConversation?.(_0x3de552) || null;
    } else {
      return null;
    }
  }
  function _0xa25142() {
    const _0x42c108 = _0xb1651e();
    const _0x3ac1a2 = Boolean(_0x42c108?.projectId && String(_0x42c108.projectId) !== _0x130a49);
    const _0x3703df = _0x3ac1a2 ? conversationStore?.ensureActiveConversation?.({
      preferLatestWithMessages: true
    }) || null : _0x42c108 || conversationStore?.ensureActiveConversation?.() || null;
    const _0x5b3d62 = _0x3703df ? String(_0x3703df.projectId || "") + "::" + String(_0x3703df.id || "") : "";
    if (_0x5b3d62 !== _0x3df18a) {
      _0x43af91();
      _0x51ab6d(_0x3703df);
    }
    return _0x3703df;
  }
  function _0x3986e2() {
    return _0xa25142();
  }
  function _0x410aa0() {
    const _0x226f47 = projectAgentSessionEvents(_0x4f509b.sessionEvents);
    return {
      history: [..._0x4f509b.history],
      recentCommands: [..._0x4f509b.recentCommands],
      debugTrace: [..._0x4f509b.debugTrace],
      runEvents: [..._0x4f509b.runEvents],
      sessionEvents: _0x37e655(_0x4f509b.sessionEvents, []),
      sessionProjection: _0x226f47,
      sessionProjectionParity: compareAgentSessionProjection({
        projection: _0x226f47,
        messages: _0x4f509b.history,
        runEvents: _0x4f509b.runEvents,
        operationLedger: _0x4f509b.operationLedger,
        taskBindings: _0x4f509b.taskBindings
      }),
      operationLedger: _0x37e655(_0x4f509b.operationLedger, []),
      taskBindings: _0x37e655(_0x4f509b.taskBindings, []),
      pendingPlan: _0x4f509b.pendingPlan,
      pendingRecovery: _0x4f509b.pendingRecovery,
      pendingClarification: _0x4f509b.pendingClarification,
      pendingLoopRun: _0x4f509b.pendingLoopRun,
      currentRun: _0x4f509b.currentRun,
      activeConversation: _0x3986e2()
    };
  }
  function _0x5fcee6(_0x2dc177 = {}) {
    const _0x13f390 = _0x410aa0();
    for (const _0x4b8069 of _0x396244) {
      try {
        _0x4b8069(_0x13f390, _0x2dc177);
      } catch {}
    }
  }
  function _0x5805d0(_0x54cc9c = {}) {
    _0xa25142();
    const _0x16a8e3 = conversationStore?.getActiveConversationId?.();
    if (!_0x16a8e3) {
      return null;
    }
    const _0x53ded5 = conversationStore?.updateConversation?.(_0x16a8e3, _0x54cc9c) || null;
    if (_0x53ded5?.sessionEvents) {
      _0x4f509b.sessionEvents = _0x37e655(_0x53ded5.sessionEvents, []);
      _0x3a0bd4 = _0x4f509b.sessionEvents.reduce((_0x4bd663, _0x281e34) => Math.max(_0x4bd663, Number(_0x281e34?.seq || 0)), 0);
    }
    return _0x53ded5;
  }
  function _0x1d19f0(_0x426084, _0x1a6f81 = {}) {
    const _0x17b6db = _0xb1651e();
    const _0x448b44 = ++_0x3a0bd4;
    const _0x4ad6c2 = _0x426084({
      id: (_0x17b6db?.id || "agent-session") + ":event:" + _0x448b44,
      seq: _0x448b44,
      conversationId: _0x17b6db?.id || "in-memory",
      projectId: _0x17b6db?.projectId || "",
      ..._0x1a6f81
    });
    if (!_0x4ad6c2) {
      return null;
    }
    _0x4f509b.sessionEvents.push(_0x4ad6c2);
    return _0x4ad6c2;
  }
  function _0x44ec01() {
    _0x43af91();
    _0x4f509b.runEvents = [];
    _0x4f509b.pendingClarification = null;
    _0x5fcee6({
      type: "runtime_cleared"
    });
  }
  _0x4df85a();
  function _0x4cd737(_0x324890 = {}) {
    _0xa25142();
    const _0x1f38e9 = {
      ..._0x324890,
      ts: _0x324890.ts || Date.now()
    };
    _0x4f509b.history.push(_0x1f38e9);
    if (_0x4f509b.history.length > 100) {
      _0x4f509b.history.splice(0, _0x4f509b.history.length - 100);
    }
    const _0x2ef9c3 = conversationStore?.getActiveConversationId?.();
    if (_0x2ef9c3) {
      const _0x9088ce = conversationStore?.appendMessage?.(_0x2ef9c3, {
        ..._0x1f38e9,
        turnId: String(_0x324890.turnId || _0x4f509b.currentRun?.id || "").trim(),
        itemId: String(_0x324890.itemId || "").trim()
      });
      if (_0x9088ce) {
        _0x51ab6d(_0x9088ce, {
          preserveRuntime: true
        });
      }
    } else {
      _0x1d19f0(createAgentMessageSessionEvent, {
        turnId: String(_0x324890.turnId || _0x4f509b.currentRun?.id || "").trim(),
        itemId: String(_0x324890.itemId || "agent-message-" + _0x4f509b.history.length).trim(),
        message: _0x1f38e9
      });
    }
    _0x5fcee6({
      type: "history",
      entry: _0x1f38e9
    });
  }
  let _0x177c8d = 0;
  function _0x185e37(_0x111528 = {}) {
    _0xa25142();
    const _0x2b81b4 = _0x3986e2();
    const _0x2fd88c = normalizeAgentRunEvent({
      ..._0x111528,
      id: _0x111528.id || "agent-event-" + Date.now().toString(36) + "-" + ++_0x177c8d,
      conversationId: _0x111528.conversationId || _0x2b81b4?.id || "",
      projectId: _0x111528.projectId || _0x2b81b4?.projectId || ""
    });
    if (!_0x2fd88c) {
      return null;
    }
    _0x4f509b.runEvents.push(_0x2fd88c);
    if (_0x4f509b.runEvents.length > runEventLimit) {
      _0x4f509b.runEvents.splice(0, _0x4f509b.runEvents.length - runEventLimit);
    }
    const _0x3aab81 = conversationStore?.getActiveConversationId?.();
    if (_0x3aab81) {
      const _0x4c2bbb = conversationStore?.appendRunEvent?.(_0x3aab81, _0x2fd88c);
      if (_0x4c2bbb) {
        _0x4f509b.runEvents = [...(_0x4c2bbb.runEvents || [])];
        _0x4f509b.sessionEvents = _0x37e655(_0x4c2bbb.sessionEvents, []);
      }
    } else {
      _0x1d19f0(createAgentRunSessionEvent, {
        runEvent: _0x2fd88c
      });
    }
    _0x5fcee6({
      type: "run_event",
      event: _0x2fd88c
    });
    return {
      ..._0x2fd88c
    };
  }
  function _0x54714e(_0x147ccd = {}) {
    const _0xd8e708 = String(_0x147ccd.id || "").trim();
    const _0x2a139e = String(_0x147ccd.nodeId || _0x147ccd.targetNodeId || "").trim();
    if (!_0xd8e708 || !_0x2a139e) {
      return null;
    }
    return {
      id: _0xd8e708,
      conversationId: String(_0x147ccd.conversationId || "").trim(),
      turnId: String(_0x147ccd.turnId || "").trim(),
      nodeId: _0x2a139e,
      targetNodeId: String(_0x147ccd.targetNodeId || _0x2a139e).trim(),
      taskId: String(_0x147ccd.taskId || "").trim(),
      commandId: String(_0x147ccd.commandId || "generation.run").trim(),
      status: String(_0x147ccd.status || "").trim(),
      messageStatus: String(_0x147ccd.messageStatus || "").trim(),
      createdAt: Number(_0x147ccd.createdAt || Date.now()) || Date.now(),
      updatedAt: Number(_0x147ccd.updatedAt || Date.now()) || Date.now(),
      notifiedTerminal: _0x147ccd.notifiedTerminal === true
    };
  }
  function _0xe6e933(_0x25269f = {}) {
    return _0x59569d([_0x25269f])[0] || null;
  }
  function _0x59569d(_0x54511e = []) {
    _0xa25142();
    const _0x510364 = [];
    for (const _0x506d8b of Array.isArray(_0x54511e) ? _0x54511e : []) {
      const _0x41c37d = _0x54714e(_0x506d8b);
      if (!_0x41c37d) {
        continue;
      }
      const _0x59cc51 = _0x4f509b.taskBindings.findIndex(_0xd0b268 => _0xd0b268.id === _0x41c37d.id);
      if (_0x59cc51 >= 0) {
        _0x4f509b.taskBindings[_0x59cc51] = {
          ..._0x4f509b.taskBindings[_0x59cc51],
          ..._0x41c37d,
          updatedAt: _0x41c37d.updatedAt || Date.now()
        };
        _0x510364.push({
          ..._0x4f509b.taskBindings[_0x59cc51]
        });
      } else {
        _0x4f509b.taskBindings.push(_0x41c37d);
        _0x510364.push({
          ..._0x41c37d
        });
      }
    }
    if (_0x510364.length === 0) {
      return [];
    }
    const _0x13f839 = _0x5805d0({
      taskBindings: _0x4f509b.taskBindings
    });
    if (!_0x13f839) {
      _0x510364.forEach(_0x54bd3c => {
        _0x1d19f0(createAgentTaskSessionEvent, {
          taskBinding: _0x54bd3c
        });
      });
    }
    _0x5fcee6({
      type: "task_bindings",
      bindings: _0x510364
    });
    return _0x510364;
  }
  function _0x4c5517(_0x32c3e5, _0x38cc98 = {}) {
    const _0xf7ef8a = String(_0x32c3e5 || "").trim();
    const _0x26286f = _0x4f509b.taskBindings.findIndex(_0x175276 => _0x175276.id === _0xf7ef8a);
    if (_0x26286f < 0) {
      return null;
    }
    _0x4f509b.taskBindings[_0x26286f] = _0x54714e({
      ..._0x4f509b.taskBindings[_0x26286f],
      ..._0x38cc98,
      id: _0xf7ef8a,
      updatedAt: Date.now()
    });
    const _0x275765 = _0x5805d0({
      taskBindings: _0x4f509b.taskBindings
    });
    if (!_0x275765) {
      _0x1d19f0(createAgentTaskSessionEvent, {
        taskBinding: _0x4f509b.taskBindings[_0x26286f]
      });
    }
    _0x5fcee6({
      type: "task_binding",
      binding: _0x4f509b.taskBindings[_0x26286f]
    });
    return {
      ..._0x4f509b.taskBindings[_0x26286f]
    };
  }
  return {
    subscribe(_0xf7cb4a) {
      if (typeof _0xf7cb4a !== "function") {
        throw new TypeError("[agentSessionStore] subscribe() requires a function");
      }
      _0x396244.add(_0xf7cb4a);
      _0xf7cb4a(null, {
        type: "init"
      });
      return () => _0x396244.delete(_0xf7cb4a);
    },
    getState() {
      _0xa25142();
      return _0x410aa0();
    },
    pushHistory: _0x4cd737,
    getHistory() {
      _0xa25142();
      return [..._0x4f509b.history];
    },
    recordCommand(_0xa951cf = {}) {
      _0x4f509b.recentCommands.push({
        commandId: String(_0xa951cf.commandId || ""),
        ok: _0xa951cf.result?.ok !== false,
        errorCode: _0xa951cf.result?.errorCode || "",
        message: _0xa951cf.result?.message || "",
        riskLevel: _0xa951cf.riskLevel || "",
        ts: _0xa951cf.ts || Date.now()
      });
      if (_0x4f509b.recentCommands.length > recentCommandLimit) {
        _0x4f509b.recentCommands.splice(0, _0x4f509b.recentCommands.length - recentCommandLimit);
      }
    },
    getRecentCommands() {
      return [..._0x4f509b.recentCommands];
    },
    recordTrace(_0x5b4e56 = {}) {
      const _0x131373 = String(_0x5b4e56.type || "").trim();
      if (!_0x131373) {
        return;
      }
      _0x4f509b.debugTrace.push({
        ..._0x5b4e56,
        type: _0x131373,
        ts: _0x5b4e56.ts || Date.now()
      });
      if (_0x4f509b.debugTrace.length > traceLimit) {
        _0x4f509b.debugTrace.splice(0, _0x4f509b.debugTrace.length - traceLimit);
      }
      if (_0x131373 === "agent_loop_tool_result") {
        _0x185e37({
          runId: _0x4f509b.currentRun?.id,
          type: "tool.completed",
          step: _0x5b4e56.step,
          commandId: _0x5b4e56.commandId,
          ok: _0x5b4e56.ok,
          confirmed: _0x5b4e56.confirmed
        });
      } else if (_0x131373 === "agent_capability_discovered") {
        _0x185e37({
          runId: _0x4f509b.currentRun?.id,
          type: "capability.discovered",
          step: _0x5b4e56.step,
          commandId: _0x5b4e56.sourceCommandId,
          commandIds: _0x5b4e56.commandIds,
          modelIds: _0x5b4e56.modelIds
        });
      } else if (_0x131373 === "canvas_action_held_for_chat") {
        _0x185e37({
          runId: _0x4f509b.currentRun?.id,
          type: "action.held",
          message: _0x5b4e56.reason
        });
      }
    },
    getDebugTrace() {
      return [..._0x4f509b.debugTrace];
    },
    upsertOperation(_0x3585cd = {}) {
      _0xa25142();
      const _0x1946ff = normalizeAgentOperation(_0x3585cd);
      if (!_0x1946ff) {
        return null;
      }
      const _0x19b2b1 = _0x4f509b.operationLedger.findIndex(_0x39f8df => _0x39f8df.id === _0x1946ff.id);
      if (_0x19b2b1 >= 0) {
        _0x4f509b.operationLedger[_0x19b2b1] = {
          ..._0x4f509b.operationLedger[_0x19b2b1],
          ..._0x1946ff
        };
      } else {
        _0x4f509b.operationLedger.push(_0x1946ff);
      }
      _0x4f509b.operationLedger = _0x4f509b.operationLedger.slice(-120);
      const _0x21e1c4 = _0x5805d0({
        operationLedger: _0x4f509b.operationLedger
      });
      if (!_0x21e1c4) {
        _0x1d19f0(createAgentOperationSessionEvent, {
          operation: _0x19b2b1 >= 0 ? _0x4f509b.operationLedger[_0x19b2b1] : _0x1946ff
        });
      }
      _0x5fcee6({
        type: "operation",
        operation: _0x1946ff
      });
      return _0x37e655(_0x19b2b1 >= 0 ? _0x4f509b.operationLedger[_0x19b2b1] : _0x1946ff, null);
    },
    getOperationLedger() {
      _0xa25142();
      return _0x37e655(_0x4f509b.operationLedger, []);
    },
    getSessionEvents() {
      _0xa25142();
      return _0x37e655(_0x4f509b.sessionEvents, []);
    },
    getSessionProjection() {
      _0xa25142();
      return projectAgentSessionEvents(_0x4f509b.sessionEvents);
    },
    getSessionProjectionParity() {
      _0xa25142();
      return _0x410aa0().sessionProjectionParity;
    },
    recordRunEvent: _0x185e37,
    getRunEvents({
      runId = ""
    } = {}) {
      _0xa25142();
      const _0xbdb6b6 = String(runId || "").trim();
      return _0x4f509b.runEvents.filter(_0x5dd8bb => !_0xbdb6b6 || _0x5dd8bb.runId === _0xbdb6b6).map(_0x5e3af5 => ({
        ..._0x5e3af5
      }));
    },
    replayRun(_0x12e10e = "") {
      _0xa25142();
      return replayAgentRunEvents(_0x4f509b.runEvents, {
        runId: _0x12e10e
      });
    },
    upsertTaskBinding: _0xe6e933,
    upsertTaskBindings: _0x59569d,
    updateTaskBinding: _0x4c5517,
    getTaskBindings() {
      return _0x37e655(_0x4f509b.taskBindings, []);
    },
    setPendingPlan(_0x344ba3) {
      _0x4f509b.pendingPlan = _0x344ba3 || null;
      if (_0x344ba3) {
        _0x185e37({
          runId: _0x4f509b.currentRun?.id,
          type: "approval.requested",
          status: "need_confirmation"
        });
      }
    },
    getPendingPlan() {
      return _0x4f509b.pendingPlan;
    },
    clearPendingPlan() {
      _0x4f509b.pendingPlan = null;
    },
    setPendingRecovery(_0x33c50b) {
      _0x4f509b.pendingRecovery = _0x33c50b || null;
    },
    getPendingRecovery() {
      return _0x4f509b.pendingRecovery;
    },
    clearPendingRecovery() {
      _0x4f509b.pendingRecovery = null;
    },
    setPendingClarification(_0x25953e) {
      _0xa25142();
      _0x4f509b.pendingClarification = _0x25953e || null;
      _0x5805d0({
        pendingClarification: _0x25953e || null
      });
    },
    getPendingClarification() {
      _0xa25142();
      return _0x4f509b.pendingClarification;
    },
    clearPendingClarification() {
      _0xa25142();
      _0x4f509b.pendingClarification = null;
      _0x5805d0({
        pendingClarification: null
      });
    },
    setPendingLoopRun(_0x5af771) {
      _0xa25142();
      _0x4f509b.pendingLoopRun = _0x5af771 || null;
      _0x5805d0({
        resumeCheckpoint: _0x5af771 || null
      });
    },
    getPendingLoopRun() {
      _0xa25142();
      return _0x4f509b.pendingLoopRun;
    },
    clearPendingLoopRun() {
      _0xa25142();
      _0x4f509b.pendingLoopRun = null;
      _0x5805d0({
        resumeCheckpoint: null
      });
    },
    setCurrentRun(_0x286efd) {
      _0x4f509b.currentRun = _0x286efd || null;
      if (_0x286efd) {
        _0x185e37({
          runId: _0x286efd.id,
          type: "run.status",
          status: _0x286efd.status,
          step: _0x286efd.step
        });
      }
    },
    getCurrentRun() {
      return _0x4f509b.currentRun;
    },
    stopCurrentRun() {
      _0x4f509b.currentRun &&= {
        ..._0x4f509b.currentRun,
        stopped: true,
        status: "stopped"
      };
      if (_0x4f509b.currentRun) {
        _0x185e37({
          runId: _0x4f509b.currentRun.id,
          type: "run.status",
          status: "stopped",
          step: _0x4f509b.currentRun.step
        });
      }
      return _0x4f509b.currentRun;
    },
    updateActiveConversation: _0x5805d0,
    markUnfinishedOperation({
      lastPlanSummary = "",
      lastCanvasSnapshotDigest = null
    } = {}) {
      return _0x5805d0({
        hasUnfinishedOperation: true,
        lastPlanSummary: lastPlanSummary,
        lastCanvasSnapshotDigest: lastCanvasSnapshotDigest
      });
    },
    clearUnfinishedOperation() {
      return _0x5805d0({
        hasUnfinishedOperation: false,
        lastPlanSummary: ""
      });
    },
    getActiveConversation: _0x3986e2,
    listConversations() {
      return conversationStore?.listConversations?.() || [];
    },
    startNewConversation() {
      _0x44ec01();
      const _0x35177a = conversationStore?.createConversation?.() || null;
      _0x51ab6d(_0x35177a);
      return _0x35177a;
    },
    switchConversation(_0x572cb2) {
      const _0x574cd3 = conversationStore?.setActiveConversationId?.(_0x572cb2);
      if (!_0x574cd3) {
        return null;
      }
      _0x44ec01();
      _0x51ab6d(_0x574cd3);
      return _0x574cd3;
    },
    deleteConversation(_0x46c1d0) {
      _0x44ec01();
      const _0x590cd8 = conversationStore?.deleteConversation?.(_0x46c1d0) || null;
      _0x51ab6d(_0x590cd8);
      return _0x590cd8;
    },
    reset() {
      _0x44ec01();
    }
  };
}