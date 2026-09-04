export function createCanvasCommandsDebugApi({
  executeCanvasCommand: _0x1c8401,
  executeCanvasCommandPlan: _0x2e6498,
  commandContext: _0x6fea5d
} = {}) {
  return {
    executeCanvasCommand(_0xbe5bb4, _0x52035c = {}) {
      return _0x1c8401?.(_0xbe5bb4, _0x52035c, _0x6fea5d);
    },
    executeCanvasCommandPlan(_0x5293ce = []) {
      return _0x2e6498?.(_0x5293ce, _0x6fea5d);
    }
  };
}
export function createCanvasAgentDebugApi({
  agentRuntime: _0xa7c1ef,
  agentSessionStore: _0x29e7fd
} = {}) {
  return {
    handleUserMessage: (..._0x309d43) => _0xa7c1ef?.handleUserMessage?.(..._0x309d43),
    answerClarification: (..._0x131bc6) => _0xa7c1ef?.answerClarification?.(..._0x131bc6),
    confirmPendingPlan: (..._0x1801d1) => _0xa7c1ef?.confirmPendingPlan?.(..._0x1801d1),
    cancelPendingPlan: (..._0x2a215d) => _0xa7c1ef?.cancelPendingPlan?.(..._0x2a215d),
    retryFailedPlan: (..._0x18c0a2) => _0xa7c1ef?.retryFailedPlan?.(..._0x18c0a2),
    keepPreparedPlan: (..._0x5b2617) => _0xa7c1ef?.keepPreparedPlan?.(..._0x5b2617),
    discardInterruptedRun: (..._0x38dc48) => _0xa7c1ef?.discardInterruptedRun?.(..._0x38dc48),
    stop: (..._0x15709c) => _0xa7c1ef?.stop?.(..._0x15709c),
    resetSession: (..._0x2d7ba4) => _0xa7c1ef?.resetSession?.(..._0x2d7ba4),
    startNewConversation: (..._0xeb1174) => _0xa7c1ef?.startNewConversation?.(..._0xeb1174),
    switchConversation: (..._0xe93293) => _0xa7c1ef?.switchConversation?.(..._0xe93293),
    deleteConversation: (..._0x2da5b9) => _0xa7c1ef?.deleteConversation?.(..._0x2da5b9),
    listConversations: (..._0x498494) => _0xa7c1ef?.listConversations?.(..._0x498494),
    getActiveConversation: (..._0x240981) => _0xa7c1ef?.getActiveConversation?.(..._0x240981),
    getSessionState: () => _0x29e7fd?.getState?.()
  };
}
export function installAppDebugApis({
  windowObject = globalThis.window,
  canvasCommands: _0x46cc52,
  canvasAgent: _0x2120ec
} = {}) {
  if (windowObject?.DEV_MODE !== true) {
    return false;
  }
  windowObject.__aiCanvasDebug = {
    ...(windowObject.__aiCanvasDebug || {}),
    canvasCommands: _0x46cc52,
    canvasAgent: _0x2120ec
  };
  return true;
}