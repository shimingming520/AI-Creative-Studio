import { canvasCommandRegistry } from "../canvasCommands/index.js";
import { buildAgentContext } from "./agentContextBuilder.js";
import { validateAgentPlan } from "./agentPlanValidator.js";
import { executeAgentActions } from "./agentActionExecutor.js";
import { createAgentSessionStore } from "./agentSessionStore.js";
import { createAgentTaskBindingRuntime } from "./agentTaskBindingRuntime.js";
import { createAgentPlanLifecycle } from "./agentPlanLifecycle.js";
import { getLocale } from "../../i18n/index.js";
import { buildAgentToolResult, deriveAgentCapabilityDiscovery, deriveAgentRuntimeProvenance, fingerprintAgentAction } from "./agentToolResult.js";
import { registerAgentDiscoveryCommands } from "./agentDiscoveryCommands.js";
import { createAgentLoopActionBudget, isAgentLoopRecoveryEditMessage, isAgentLoopRetryMessage, recordAgentLoopActionBudgetResult, shouldRetryAgentLoopNoop, validateAgentLoopActionBudget } from "./agentLoopRecovery.js";
import { shouldUseCreativeDefaults } from "./agentClarificationPolicy.js";
import { verifyAgentLoopCompletionEvidence } from "./agentCompletionEvidence.js";
import { selectAgentLoopPlanAction } from "./agentLoopPlanSelection.js";
import { createAgentPrecreatedNodeRuntime, doesActionConsumePrecreatedNode, normalizeAgentPrecreatedNode } from "./agentPrecreatedNode.js";
import { buildAgentExecutionDiagnostic, buildAgentPlannerDiagnostic, buildAgentPlannerRecovery } from "./agentFailureDiagnostic.js";
import { hasAgentCanvasActionIntent, routeAgentTurn } from "./agentTurnRouter.js";
import { resolveAgentConversationCanvasTransfer } from "./agentConversationCanvasTransfer.js";
const DEFAULT_MAX_LOOP_STEPS = 16;
const PLANNER_NETWORK_RETRY_LIMIT = 1;
function isTransientPlannerNetworkError(_0xfd9ca2) {
  const _0xf8e99e = [_0xfd9ca2?.name, _0xfd9ca2?.code, _0xfd9ca2?.message].map(_0x3decd3 => String(_0x3decd3 || "").trim()).filter(Boolean).join(" ").toLowerCase();
  return /failed to fetch|fetch failed|network(?: request)? (?:error|failed|failure)|networkerror/.test(_0xf8e99e) || /econnreset|econnrefused|enotfound|enetunreach|socket hang up/.test(_0xf8e99e) || /网络(?:连接|请求)?失败|网络错误|无法连接/.test(_0xf8e99e);
}
const RUNTIME_TEXT = Object.freeze({
  "zh-CN": Object.freeze({
    actionExecutionFailed: "Agent 动作执行失败。",
    done: "已执行。",
    emptyMessage: "Agent 消息为空。",
    noPendingClarification: "当前没有待回答的问题。",
    noPendingPlan: "当前没有待确认的计划。",
    noPendingRecovery: "当前没有可恢复的失败计划。",
    noInterruptedRun: "当前没有需要结束的 Agent 任务。",
    noUndoableRun: "当前没有可撤销的 Agent 画布操作，或画布在任务后已经发生变化。",
    runResumed: "正在从上次中断的位置继续。",
    runDiscarded: "已结束上次 Agent 任务。已完成的画布操作不会撤销，已经提交的生成仍会继续。",
    runUndone: "已撤销 Agent 本轮对画布的修改。",
    recoveryKept: "已保留准备步骤。你可以修改提示词或换模型后重新规划。",
    planCancelled: "已取消执行。",
    plannerFailed: "Agent 规划失败。",
    plannerRetryAvailable: "Agent 规划失败，但原任务已保留。回复“重试”或“？”即可继续。",
    plannerReturnedNoAction: "Agent 没有返回可执行的画布动作，原任务已保留。回复“重试”继续。",
    plannerMissing: "Agent 文本模型尚未配置。",
    preActionsFailed: "Agent 准备步骤执行失败。",
    reset: "Agent 会话已重置。",
    runStopped: "Agent 已停止。",
    loopLimitReached: "Agent 已达到本轮最大步骤数，已停止以避免重复执行。",
    loopRepeatedAction: "Agent 尝试重复执行已完成的动作，已停止。",
    loopRepeatedActionCorrection: "这个动作已经成功完成。不要再次执行；请根据工具结果继续下一个尚未完成的动作，或在任务完成时返回空 actions。",
    loopDuplicateBudgetCorrection: "用户要求的副本数量已经满足，或这个复制动作会超过数量。不要再复制节点；请继续生成、拼贴等剩余步骤，完成后返回空 actions。",
    loopCompletionEvidenceCorrection: "尚未验证到本轮创建的目标节点。必须先成功执行节点创建，再声称已经创建；不要把查询、选择或计划当作完成。",
    loopResumeExpired: "待继续的 Agent 运行已失效，请重新发起。",
    creativeDefaultsInstruction: "请自行采用合理的专业默认值完成创作；风格、构图、配色和提示词由你决定，不要再次追问这些可推断细节。",
    confirmFallback: "请确认后继续执行。",
    cancelNotice: "取消只会取消待确认的生成，不会撤回已完成的创建、连接或排列。",
    retry: "重试",
    editPrompt: "修改提示词",
    changeModel: "换模型",
    keepPrepared: "只保留已创建节点",
    nodeCreate: "创建节点",
    nodeCreateImage: "创建图片节点",
    nodeCreateVideo: "创建视频节点",
    nodeCreateAudio: "创建音频节点",
    nodeCreateText: "创建文本节点",
    graphConnect: "连接节点",
    layoutAlign: "对齐节点",
    layoutArrangeRow: "横向排列节点",
    layoutArrangeColumn: "纵向排列节点",
    layoutArrangeGrid: "网格排列节点",
    generationRun: "开始生成",
    generationRunBatch: "批量开始生成",
    nodeSetParams: "设置生成参数",
    nodeSetPrompt: "写入提示词",
    nodeDelete: "删除节点",
    selectedImageInput: "当前选中的图片节点",
    inputNode: "输入节点",
    traceSummary: "策略摘要",
    noInputSource: "无输入节点",
    defaultModel: "节点默认模型",
    chatFallback: "可以，我们先聊。需要我创建、生成或修改画布时，请明确说出要执行的操作。",
    chatIntentRequired: "我先不动当前画布。可以继续讨论；如果需要我创建、生成、连接、排列或修改节点，请明确告诉我要执行的操作。",
    taskStarted: "生成已开始：{nodeLabel} 正在生成，完成后我会继续更新这里。",
    taskPending: "生成已提交：{nodeLabel} 正在排队或生成中。",
    taskWaiting: "生成任务正在执行，全部完成后 Agent 会自动继续后续步骤。",
    taskResumed: "生成任务已结束，Agent 正在继续后续步骤。",
    taskCompleted: "生成已完成：结果已写入 {nodeLabel}。",
    taskFailed: "生成失败：{nodeLabel}。{error}",
    taskCancelled: "生成已取消：{nodeLabel}。",
    textPlacedOnCanvas: "已将文案放入画布文本节点。",
    textSourceMissing: "没有找到可放入画布的上一条文案，请先让我生成或修改文案。"
  }),
  "en-US": Object.freeze({
    actionExecutionFailed: "Agent action execution failed.",
    done: "Done.",
    emptyMessage: "Agent message is empty.",
    noPendingClarification: "No pending clarification.",
    noPendingPlan: "No pending plan to confirm.",
    noPendingRecovery: "No failed plan can be recovered.",
    noInterruptedRun: "There is no Agent run to end.",
    noUndoableRun: "There is no undoable Agent canvas run, or the canvas changed after it.",
    runResumed: "Resuming from the interrupted Agent checkpoint.",
    runDiscarded: "Ended the previous Agent run. Completed canvas changes stay in place, and submitted generations keep running.",
    runUndone: "Undid the Agent's canvas changes from this run.",
    recoveryKept: "Prepared steps are kept. You can edit the prompt or switch model before replanning.",
    planCancelled: "Plan cancelled.",
    plannerFailed: "Agent planner failed.",
    plannerRetryAvailable: "Agent planning failed, but the original task was preserved. Reply “retry” or “?” to continue.",
    plannerReturnedNoAction: "The Agent returned no executable canvas action. The original task was preserved; reply “retry” to continue.",
    plannerMissing: "Agent planner is not configured.",
    preActionsFailed: "Agent pre-confirmation actions failed.",
    reset: "Agent session reset.",
    runStopped: "Agent run stopped.",
    loopLimitReached: "The Agent reached the step limit and stopped to avoid repeated actions.",
    loopRepeatedAction: "The Agent tried to repeat a completed action and was stopped.",
    loopRepeatedActionCorrection: "This action already succeeded. Do not execute it again; use the tool result to continue with the next unfinished action, or return empty actions when done.",
    loopDuplicateBudgetCorrection: "The requested copy count is already satisfied, or this action would exceed it. Do not duplicate more nodes; continue with generation, collage, or other unfinished work, then return empty actions.",
    loopCompletionEvidenceCorrection: "The requested node has not been verified as created in this run. Complete node creation before claiming success; do not treat discovery, selection, or planning as completion.",
    loopResumeExpired: "The pending Agent run is no longer valid. Please start it again.",
    creativeDefaultsInstruction: "Use reasonable professional defaults and make the creative choices yourself, including style, composition, color, and prompt. Do not ask again for inferable details.",
    confirmFallback: "Please confirm this action plan.",
    cancelNotice: "Cancel only cancels the pending generation. It will not undo created nodes, connections, or layout changes.",
    retry: "Retry",
    editPrompt: "Edit prompt",
    changeModel: "Switch model",
    keepPrepared: "Keep prepared nodes",
    nodeCreate: "Create node",
    nodeCreateImage: "Create image node",
    nodeCreateVideo: "Create video node",
    nodeCreateAudio: "Create audio node",
    nodeCreateText: "Create text node",
    graphConnect: "Connect nodes",
    layoutAlign: "Align nodes",
    layoutArrangeRow: "Arrange nodes horizontally",
    layoutArrangeColumn: "Arrange nodes vertically",
    layoutArrangeGrid: "Arrange nodes in a grid",
    generationRun: "Start generation",
    generationRunBatch: "Start batch generation",
    nodeSetParams: "Set generation parameters",
    nodeSetPrompt: "Set prompt",
    nodeDelete: "Delete node",
    selectedImageInput: "Selected image node",
    inputNode: "Input node",
    traceSummary: "Policy summary",
    noInputSource: "No input node",
    defaultModel: "Node default model",
    chatFallback: "Sure, we can talk first. Tell me explicitly when you want me to create, generate, or modify the canvas.",
    chatIntentRequired: "I will leave the canvas unchanged for now. We can keep discussing; tell me explicitly if you want me to create, generate, connect, arrange, or edit nodes.",
    taskStarted: "Generation started: {nodeLabel} is running. I will update this chat when it finishes.",
    taskPending: "Generation submitted: {nodeLabel} is queued or running.",
    taskWaiting: "Generation is running. The Agent will continue automatically when all tasks finish.",
    taskResumed: "Generation finished. The Agent is continuing with the remaining steps.",
    taskCompleted: "Generation complete: the result was written to {nodeLabel}.",
    taskFailed: "Generation failed: {nodeLabel}. {error}",
    taskCancelled: "Generation cancelled: {nodeLabel}.",
    textPlacedOnCanvas: "Placed the copy in a canvas text node.",
    textSourceMissing: "I could not find a previous assistant draft to place on the canvas."
  })
});
function normalizeRuntimeLocale(_0xf19481 = getLocale()) {
  if (String(_0xf19481 || "").toLowerCase().startsWith("en")) {
    return "en-US";
  } else {
    return "zh-CN";
  }
}
function runtimeText(_0x56cd08, _0x460e37 = getLocale()) {
  const _0xdce6ef = normalizeRuntimeLocale(_0x460e37);
  return RUNTIME_TEXT[_0xdce6ef]?.[_0x56cd08] || RUNTIME_TEXT["zh-CN"][_0x56cd08] || _0x56cd08;
}
function formatRuntimeText(_0x49803d, _0x578590 = {}, _0x2b02b2 = getLocale()) {
  return runtimeText(_0x49803d, _0x2b02b2).replace(/\{(\w+)\}/g, (_0x5e9149, _0xfc8f24) => _0x578590[_0xfc8f24] == null ? "" : String(_0x578590[_0xfc8f24]));
}
function createFailedReply(_0x3be138, _0x17f344 = {}) {
  return {
    ok: false,
    status: "failed",
    reply: _0x3be138,
    message: _0x3be138,
    ..._0x17f344
  };
}
function summarizeExecution(_0x367c91, _0x537f1d = getLocale()) {
  if (_0x367c91.ok) {
    return runtimeText("done", _0x537f1d);
  }
  return _0x367c91.message || runtimeText("actionExecutionFailed", _0x537f1d);
}
function isSafeAction(_0x42ff86 = {}) {
  return String(_0x42ff86.riskLevel || "safe") === "safe";
}
function createChatReply(_0x2bc389, _0x2504d8 = {}) {
  const _0xabf619 = String(_0x2bc389 || "");
  return {
    ok: true,
    status: "chat",
    reply: _0xabf619,
    message: _0xabf619,
    ..._0x2504d8
  };
}
function hasExplicitCanvasActionIntent(_0xc76c38 = "", _0x4a712b = {}) {
  return hasAgentCanvasActionIntent(_0xc76c38, _0x4a712b);
}
function shouldHoldCanvasActionsForChat(_0xcb74d1 = {}, _0x248a91 = "", _0xfaff17 = {}) {
  if (_0xcb74d1.status !== "ready" && _0xcb74d1.status !== "need_confirmation") {
    return false;
  }
  if (!Array.isArray(_0xcb74d1.plan?.actions) || _0xcb74d1.plan.actions.length === 0) {
    return false;
  }
  return !hasExplicitCanvasActionIntent(_0x248a91, _0xfaff17);
}
function getState({
  store: _0x1358ba,
  commandContext: _0x8159f4
} = {}) {
  return _0x1358ba?.getStateRaw?.() || _0x1358ba?.getState?.() || _0x8159f4?.store?.getStateRaw?.() || _0x8159f4?.store?.getState?.() || {};
}
function getProjectId(_0x1e9a90 = {}) {
  return String(_0x1e9a90.commandContext?.windowObject?.currentProjectId || globalThis.window?.currentProjectId || "default_v2_project");
}
function getCollectionSize(_0x1eb71e) {
  if (Array.isArray(_0x1eb71e)) {
    return _0x1eb71e.length;
  }
  if (_0x1eb71e && typeof _0x1eb71e === "object") {
    return Object.keys(_0x1eb71e).length;
  }
  return 0;
}
function buildCanvasSnapshotDigest(_0x415677 = {}) {
  const _0x259b41 = getState(_0x415677);
  return {
    projectId: getProjectId(_0x415677),
    nodeCount: getCollectionSize(_0x259b41.nodes),
    edgeCount: getCollectionSize(_0x259b41.edges),
    selectedNodeIds: Array.isArray(_0x259b41.selectedNodeIds) ? _0x259b41.selectedNodeIds.map(_0x3b8256 => String(_0x3b8256 || "")).filter(Boolean) : []
  };
}
function getPlainObject(_0x2f69b1) {
  if (_0x2f69b1 && typeof _0x2f69b1 === "object" && !Array.isArray(_0x2f69b1)) {
    return _0x2f69b1;
  } else {
    return {};
  }
}
export function createAgentRuntime({
  store: _0x57ac3c,
  commandContext: _0x52a644,
  commandRegistry = canvasCommandRegistry,
  sessionStore = createAgentSessionStore(),
  planner = null,
  buildContext = buildAgentContext,
  validatePlan = validateAgentPlan,
  executeActions = executeAgentActions,
  localeProvider = getLocale,
  assistant = null,
  loopMode = false,
  maxLoopSteps = DEFAULT_MAX_LOOP_STEPS
} = {}) {
  registerAgentDiscoveryCommands(commandRegistry);
  let _0x52c0de = 0;
  let _0xc86fe9 = null;
  let _0x24b395 = null;
  let _0x3026ea = null;
  let _0x4e55b0 = null;
  let _0x23a96d = null;
  let _0x57c3fc = 0;
  const _0x478b3a = new Map();
  let _0x577346 = null;
  function _0x11e441() {
    return normalizeRuntimeLocale(localeProvider?.() || getLocale());
  }
  const _0x5666d7 = createAgentPlanLifecycle({
    readCanvasState: () => getState({
      store: _0x57ac3c,
      commandContext: _0x52a644
    }),
    localeProvider: _0x11e441,
    formatText: _0x2d922b => runtimeText(_0x2d922b, _0x11e441()),
    isSafeAction: isSafeAction
  });
  const _0x46c50b = createAgentPrecreatedNodeRuntime({
    plannerAvailable: () => typeof planner === "function",
    hasCanvasActionIntent: hasExplicitCanvasActionIntent,
    readCanvasState: () => getState({
      store: _0x57ac3c,
      commandContext: _0x52a644
    }),
    executeActions: _0x115e56,
    buildExecutionOptions: _0x446a3a,
    isActiveRun: _0x46b333,
    sessionStore: sessionStore,
    markUnfinishedOperation: _0x573a65,
    commandContext: _0x52a644
  });
  function _0x3f701c() {
    return String(sessionStore.getActiveConversation?.()?.id || "").trim();
  }
  function _0x42ca83(_0x394dcd = "") {
    return String(sessionStore.getCurrentRun?.()?.id || _0x394dcd || "agent-turn-" + _0x52c0de).trim();
  }
  function _0x3a416c(_0x1a1838 = "agent-turn") {
    const _0x4d3c2f = String(sessionStore.getCurrentRun?.()?.id || "").trim();
    return _0x4d3c2f || _0x1a1838 + "-" + ++_0x52c0de;
  }
  function _0x46b333(_0x5cdc8e = "") {
    const _0x217a36 = String(_0x5cdc8e || "").trim();
    if (!_0x217a36) {
      return true;
    }
    const _0x38b1e1 = sessionStore.getCurrentRun?.();
    return _0x38b1e1?.id === _0x217a36 && _0x38b1e1.stopped !== true;
  }
  function _0x218fbd() {
    return createFailedReply(runtimeText("runStopped", _0x11e441()), {
      status: "stopped"
    });
  }
  function _0x446a3a(_0x201628 = "") {
    const _0x10c587 = String(_0x201628 || "").trim();
    if (!_0x10c587) {
      return {};
    }
    return {
      agentRunId: _0x10c587,
      shouldContinue: () => _0x46b333(_0x10c587),
      createNodeSequenceKey: "agent-command-plan-" + _0x10c587
    };
  }
  function _0x19e397(_0x3d02cd = "") {
    const _0xb2bc9 = String(_0x3d02cd || "").trim();
    if (!_0xb2bc9 || _0x478b3a.has(_0xb2bc9)) {
      return _0x478b3a.get(_0xb2bc9) || null;
    }
    const _0x429dd2 = _0x52a644?.history?.createCheckpoint?.() || null;
    const _0xd0cb10 = {
      runId: _0xb2bc9,
      conversationId: _0x3f701c(),
      projectId: getProjectId({
        commandContext: _0x52a644
      }),
      start: _0x429dd2,
      end: _0x429dd2
    };
    _0x478b3a.set(_0xb2bc9, _0xd0cb10);
    return _0xd0cb10;
  }
  function _0x4ab7f4(_0x38fa83 = "") {
    const _0x4448bb = _0x19e397(_0x38fa83);
    if (!_0x4448bb) {
      return null;
    }
    _0x4448bb.end = _0x52a644?.history?.createCheckpoint?.() || _0x4448bb.end;
    if (_0x4448bb.start?.id && _0x4448bb.end?.id && _0x4448bb.start.id !== _0x4448bb.end.id) {
      _0x577346 = {
        ..._0x4448bb
      };
    }
    return _0x4448bb;
  }
  async function _0x115e56(_0x4bb557 = [], _0x405ac8 = {}) {
    const _0x15caed = Array.isArray(_0x4bb557) ? _0x4bb557 : [];
    const _0x504ac2 = String(_0x405ac8.agentRunId || sessionStore.getCurrentRun?.()?.id || "agent-run-" + _0x52c0de).trim();
    const _0x3f914d = Math.max(0, Math.trunc(Number(sessionStore.getCurrentRun?.()?.step || 0)));
    _0x19e397(_0x504ac2);
    const _0x1c8dbe = _0x15caed.map((_0x355678, _0x322606) => {
      const _0x46e1b2 = fingerprintAgentAction(_0x355678);
      const _0xba607f = {
        id: _0x504ac2 + ":" + _0x3f914d + ":" + _0x322606 + ":" + _0x46e1b2 + ":" + ++_0x57c3fc,
        runId: _0x504ac2,
        conversationId: _0x3f701c(),
        projectId: getProjectId({
          commandContext: _0x52a644
        }),
        step: _0x3f914d,
        commandId: String(_0x355678?.type || _0x355678?.commandId || "").trim(),
        fingerprint: _0x46e1b2,
        status: "running",
        startedAt: Date.now()
      };
      sessionStore.upsertOperation?.(_0xba607f);
      return _0xba607f;
    });
    const _0x280632 = await executeActions(_0x15caed, _0x405ac8);
    const _0x237bcf = Array.isArray(_0x280632?.results) ? _0x280632.results : [];
    _0x1c8dbe.forEach((_0x2cf472, _0x2fec40) => {
      const _0x64e3d0 = _0x237bcf[_0x2fec40] || null;
      const _0x242f72 = _0x15caed[_0x2fec40] || {};
      const _0x3e8379 = _0x64e3d0 ? deriveAgentRuntimeProvenance({
        action: _0x242f72,
        execution: {
          ok: _0x64e3d0.ok === true,
          status: _0x64e3d0.ok === true ? "success" : "failed",
          results: [_0x64e3d0]
        }
      }) : {
        createdNodeIds: [],
        createdEdgeIds: []
      };
      sessionStore.upsertOperation?.({
        ..._0x2cf472,
        status: _0x64e3d0 ? _0x64e3d0.ok === true ? "success" : "failed" : "skipped",
        ok: _0x64e3d0 ? _0x64e3d0.ok === true : null,
        errorCode: String(_0x64e3d0?.errorCode || ""),
        verificationStatus: String(_0x64e3d0?.verification?.status || ""),
        repairAttempts: Math.max(0, Math.min(1, Math.trunc(Number(_0x64e3d0?.verification?.attempts || 0)))),
        createdNodeIds: _0x3e8379.createdNodeIds,
        createdEdgeIds: _0x3e8379.createdEdgeIds,
        completedAt: Date.now()
      });
    });
    _0x4ab7f4(_0x504ac2);
    return _0x280632;
  }
  function _0x195e57(_0x505345, {
    taskMessages = [],
    recoveryCheckpoint = null
  } = {}) {
    const _0x5db914 = _0x24b395.getPending(_0x505345.runId);
    if (_0x5db914.length === 0) {
      return null;
    }
    const _0x45fa03 = (sessionStore.getTaskBindings?.() || []).filter(_0x43d37d => _0x43d37d.turnId === _0x505345.runId);
    const _0x4593dd = {
      ..._0x505345,
      pendingKind: "task_wait",
      waitingTaskBindingIds: _0x45fa03.map(_0x542da2 => _0x542da2.id),
      ...(recoveryCheckpoint ? {
        taskRecoveryCheckpoint: recoveryCheckpoint
      } : {})
    };
    sessionStore.setPendingLoopRun?.(_0x4593dd);
    _0x573a65(_0x505345.originalMessage);
    sessionStore.setCurrentRun?.({
      id: _0x505345.runId,
      status: "waiting_tasks",
      stopped: false,
      step: _0x505345.step
    });
    sessionStore.recordRunEvent?.({
      runId: _0x505345.runId,
      type: "task.waiting",
      status: "waiting_tasks",
      step: _0x505345.step,
      message: runtimeText("taskWaiting", _0x11e441())
    });
    const _0x3a3db7 = runtimeText("taskWaiting", _0x11e441());
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "waiting_tasks",
      content: _0x3a3db7
    });
    return {
      ok: true,
      status: "waiting_tasks",
      reply: _0x3a3db7,
      taskMessages: taskMessages
    };
  }
  function _0x20713a() {
    if (_0x4e55b0) {
      return;
    }
    const _0x5913fe = sessionStore.getPendingLoopRun?.();
    if (_0x5913fe?.pendingKind !== "task_wait" || !_0x46b333(_0x5913fe.runId)) {
      return;
    }
    const _0x314839 = _0x24b395.getSettlement(_0x5913fe.waitingTaskBindingIds || []);
    if (!_0x314839.settled) {
      return;
    }
    sessionStore.clearPendingLoopRun?.();
    _0x4e55b0 = Promise.resolve().then(async () => {
      if (!_0x46b333(_0x5913fe.runId) || !_0x3829d4(_0x5913fe)) {
        return null;
      }
      const {
        allSucceeded: _0x640b56
      } = _0x314839;
      sessionStore.recordRunEvent?.({
        runId: _0x5913fe.runId,
        type: "task.resumed",
        status: _0x640b56 ? "planning" : "failed",
        step: _0x5913fe.step,
        message: runtimeText("taskResumed", _0x11e441())
      });
      if (!_0x640b56) {
        const _0x285d56 = _0x314839.failureMessage;
        const _0x5dade5 = _0x5913fe.taskRecoveryCheckpoint;
        if (_0x5dade5?.action && _0x5dade5?.loopState) {
          return _0x1c6589({
            ..._0x5dade5.loopState,
            runId: _0x5913fe.runId
          }, _0x5dade5.action, {
            ok: false,
            status: "failed",
            errorCode: "ASYNC_TASK_FAILED",
            message: _0x285d56,
            results: [{
              ok: false,
              errorCode: "ASYNC_TASK_FAILED",
              message: _0x285d56
            }],
            raw: {
              result: {
                failedIndex: 0
              }
            }
          });
        }
        return _0x19ad9d(_0x5913fe, _0x285d56);
      }
      _0x4126df();
      return _0x2230d3({
        ..._0x5913fe,
        pendingKind: "",
        waitingTaskBindingIds: [],
        taskRecoveryCheckpoint: null,
        validationFeedback: [...(_0x5913fe.validationFeedback || []), {
          step: _0x5913fe.step,
          commandId: "generation.run",
          status: "tasks_completed",
          ok: true,
          message: runtimeText("taskResumed", _0x11e441())
        }].slice(-4)
      });
    }).catch(_0x130ed8 => {
      if (_0x46b333(_0x5913fe.runId)) {
        _0x19ad9d(_0x5913fe, String(_0x130ed8?.message || runtimeText("actionExecutionFailed", _0x11e441())));
      }
    }).finally(() => {
      _0x4e55b0 = null;
    });
  }
  _0x24b395 = createAgentTaskBindingRuntime({
    store: _0x57ac3c,
    sessionStore: sessionStore,
    readCanvasState: () => getState({
      store: _0x57ac3c,
      commandContext: _0x52a644
    }),
    getActiveConversationId: _0x3f701c,
    getCurrentTurnId: _0x42ca83,
    formatText: (_0x4a8bb1, _0x45ae0f) => formatRuntimeText(_0x4a8bb1, _0x45ae0f, _0x11e441()),
    onBindingsChanged: _0x20713a
  });
  _0x24b395.start();
  const _0x50e7d7 = sessionStore.getPendingLoopRun?.();
  if (_0x50e7d7?.pendingKind === "task_wait" && _0x3829d4(_0x50e7d7)) {
    sessionStore.setCurrentRun?.({
      id: _0x50e7d7.runId,
      status: "waiting_tasks",
      stopped: false,
      step: _0x50e7d7.step
    });
    _0x24b395.sync(getState({
      store: _0x57ac3c,
      commandContext: _0x52a644
    }));
  }
  function _0x573a65(_0x358779) {
    sessionStore.markUnfinishedOperation?.({
      lastPlanSummary: _0x358779,
      lastCanvasSnapshotDigest: buildCanvasSnapshotDigest({
        store: _0x57ac3c,
        commandContext: _0x52a644
      })
    });
  }
  function _0x208864() {
    sessionStore.clearUnfinishedOperation?.();
  }
  function _0x33673b(_0x217dbc = "superseded") {
    const _0xb8a046 = _0x23a96d;
    _0x23a96d = null;
    if (!_0xb8a046 || _0xb8a046.signal.aborted) {
      return;
    }
    try {
      _0xb8a046.abort(_0x217dbc);
    } catch {
      _0xb8a046.abort();
    }
  }
  function _0x4126df() {
    _0x33673b("superseded");
    _0x23a96d = typeof AbortController === "function" ? new AbortController() : null;
    return _0x23a96d;
  }
  function _0x2f42d5() {
    return {
      conversationId: _0x3f701c(),
      projectId: getProjectId({
        commandContext: _0x52a644
      })
    };
  }
  function _0x3829d4(_0x55c3ea = {}) {
    const _0x1f1e82 = _0x2f42d5();
    return String(_0x55c3ea.conversationId || "") === _0x1f1e82.conversationId && String(_0x55c3ea.projectId || "") === _0x1f1e82.projectId;
  }
  function _0x1733be({
    runId: _0x375c17,
    message: _0x2103cc,
    plannerExtra = {}
  } = {}) {
    return {
      runId: _0x375c17,
      originalMessage: String(_0x2103cc || ""),
      plannerExtra: {
        ...plannerExtra
      },
      ..._0x2f42d5(),
      step: 0,
      toolResults: [],
      validationFeedback: [],
      runtimeProvenance: {
        createdNodeIds: [],
        createdEdgeIds: []
      },
      actionBudget: createAgentLoopActionBudget(_0x2103cc),
      completedFingerprints: [],
      failedFingerprints: {},
      validationFailureCounts: {},
      noActionRetryCount: 0,
      disclosedCommandIds: [],
      disclosedModelIds: []
    };
  }
  function _0x1c9366(_0x5b5178, _0x4f696e, _0x2c55d6) {
    const _0x2006f8 = deriveAgentCapabilityDiscovery({
      action: _0x4f696e,
      execution: _0x2c55d6
    });
    const _0x519e6f = [...new Set([...(_0x5b5178.disclosedCommandIds || []), ..._0x2006f8.commandIds])];
    const _0x4395f4 = [...new Set([...(_0x5b5178.disclosedModelIds || []), ..._0x2006f8.modelIds])];
    if (_0x519e6f.length !== (_0x5b5178.disclosedCommandIds || []).length || _0x4395f4.length !== (_0x5b5178.disclosedModelIds || []).length) {
      sessionStore.recordTrace?.({
        type: "agent_capability_discovered",
        step: _0x5b5178.step,
        sourceCommandId: _0x4f696e.type,
        commandIds: _0x2006f8.commandIds,
        modelIds: _0x2006f8.modelIds
      });
    }
    return {
      ..._0x5b5178,
      disclosedCommandIds: _0x519e6f,
      disclosedModelIds: _0x4395f4
    };
  }
  function _0xdb2c43(_0xa75b5a = {}) {
    const _0x598eb9 = normalizeAgentPrecreatedNode(_0xa75b5a.precreatedNode);
    return {
      enabled: true,
      step: Number(_0xa75b5a.step || 0),
      maxSteps: Math.max(1, Number(maxLoopSteps || DEFAULT_MAX_LOOP_STEPS)),
      toolResults: Array.isArray(_0xa75b5a.toolResults) ? _0xa75b5a.toolResults : [],
      validationFeedback: Array.isArray(_0xa75b5a.validationFeedback) ? _0xa75b5a.validationFeedback : [],
      runtimeProvenance: _0xa75b5a.runtimeProvenance || {},
      ...(_0x598eb9 ? {
        precreatedNode: _0x598eb9
      } : {}),
      ...(_0xa75b5a.recoveryInstruction ? {
        recoveryInstruction: String(_0xa75b5a.recoveryInstruction)
      } : {}),
      ...(_0xa75b5a.clarificationAnswer ? {
        clarificationAnswer: String(_0xa75b5a.clarificationAnswer)
      } : {}),
      instruction: "Return at most one canvas action. After a tool result, decide the next single action or finish with actions []. Never repeat a successful action."
    };
  }
  function _0x19ad9d(_0x410979, _0x40131f, _0x480939 = {}) {
    sessionStore.clearPendingLoopRun?.();
    sessionStore.clearPendingPlan?.();
    sessionStore.clearPendingClarification?.();
    _0x208864();
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "failed",
      content: _0x40131f
    });
    if (_0x46b333(_0x410979.runId)) {
      sessionStore.setCurrentRun?.({
        id: _0x410979.runId,
        status: "failed",
        stopped: false
      });
    }
    return createFailedReply(_0x40131f, _0x480939);
  }
  function _0xddd0ee(_0xb822ae, _0x38ebed, _0x328099 = {}) {
    const _0x6512cb = String(_0x38ebed || runtimeText("plannerRetryAvailable", _0x11e441()));
    const _0x41e4c5 = buildAgentPlannerDiagnostic({
      loopState: _0xb822ae,
      validation: _0x328099.validation || null,
      cause: _0x328099.cause || "",
      reason: _0x328099.diagnosticReason || "",
      locale: _0x11e441()
    });
    const _0x26225a = buildAgentPlannerRecovery({
      originalMessage: _0xb822ae.originalMessage,
      locale: _0x11e441()
    });
    const _0x5682fd = {
      ..._0xb822ae,
      pendingKind: "planner_retry",
      plannerFailureMessage: _0x6512cb,
      plannerDiagnostic: _0x41e4c5
    };
    sessionStore.setPendingLoopRun?.(_0x5682fd);
    sessionStore.clearPendingPlan?.();
    sessionStore.clearPendingClarification?.();
    _0x573a65(_0xb822ae.originalMessage);
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "failed",
      content: _0x6512cb,
      diagnostic: _0x41e4c5
    });
    if (_0x46b333(_0xb822ae.runId)) {
      sessionStore.setCurrentRun?.({
        id: _0xb822ae.runId,
        status: "failed",
        stopped: false,
        step: _0xb822ae.step
      });
    }
    sessionStore.recordRunEvent?.({
      runId: _0xb822ae.runId,
      type: "planner.retry_available",
      status: "failed",
      step: _0xb822ae.step,
      errorCode: _0x41e4c5.errorCode,
      message: _0x6512cb
    });
    return createFailedReply(_0x6512cb, {
      retryable: true,
      diagnostic: _0x41e4c5,
      recovery: _0x26225a
    });
  }
  function _0x1c6589(_0x13c685, _0x5238cf, _0x37bbb8) {
    const _0x24aa65 = String(_0x37bbb8?.message || runtimeText("actionExecutionFailed", _0x11e441()));
    const _0x476bf7 = {
      status: "ready",
      reply: _0x24aa65,
      actions: [_0x5238cf],
      requiresConfirmation: false
    };
    const {
      recovery: _0x19f7dc,
      retryPlan: _0xf02cc0
    } = _0x5666d7.recover(_0x37bbb8, _0x476bf7);
    const _0x208783 = buildAgentExecutionDiagnostic({
      execution: _0x37bbb8,
      recovery: _0x19f7dc,
      step: _0x13c685.step,
      completedSteps: (_0x13c685.toolResults || []).filter(_0x3c0786 => _0x3c0786?.ok === true).length,
      locale: _0x11e441()
    });
    sessionStore.clearPendingLoopRun?.();
    sessionStore.clearPendingPlan?.();
    sessionStore.clearPendingClarification?.();
    if (_0x19f7dc) {
      sessionStore.setPendingRecovery?.({
        plan: _0xf02cc0,
        recovery: _0x19f7dc,
        loopCheckpoint: {
          ..._0x13c685,
          pendingKind: "",
          pendingValidatedPlan: null
        },
        loopAction: _0x5238cf
      });
      _0x573a65(_0x5666d7.describe({
        recovery: _0x19f7dc
      }));
    } else {
      sessionStore.clearPendingRecovery?.();
      _0x208864();
    }
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "failed",
      content: _0x24aa65,
      execution: _0x37bbb8,
      recovery: _0x19f7dc,
      diagnostic: _0x208783
    });
    if (_0x46b333(_0x13c685.runId)) {
      sessionStore.setCurrentRun?.({
        id: _0x13c685.runId,
        status: "failed",
        stopped: false,
        step: _0x13c685.step
      });
    }
    sessionStore.recordRunEvent?.({
      runId: _0x13c685.runId,
      type: "action.recovery_available",
      status: "failed",
      step: _0x13c685.step,
      commandId: _0x5238cf?.type,
      errorCode: _0x208783.errorCode,
      message: _0x24aa65
    });
    return createFailedReply(_0x24aa65, {
      execution: _0x37bbb8,
      diagnostic: _0x208783,
      ...(_0x19f7dc ? {
        recovery: _0x19f7dc
      } : {})
    });
  }
  function _0x4d7ed6(_0x399caf, _0x5f0797, _0x3e0f05, {
    confirmed = false
  } = {}) {
    const _0x53243f = _0x24b395.registerExecution(_0x3e0f05, {
      turnId: _0x399caf.runId
    });
    const _0x5a5b7b = fingerprintAgentAction(_0x5f0797);
    const _0xcd54ad = buildAgentToolResult({
      step: _0x399caf.step,
      action: _0x5f0797,
      execution: _0x3e0f05
    });
    let _0x59c1af = {
      ..._0x399caf,
      pendingKind: "",
      pendingValidatedPlan: null,
      precreatedNode: _0x3e0f05.ok === true && doesActionConsumePrecreatedNode(_0x5f0797, _0x399caf.precreatedNode) ? null : _0x399caf.precreatedNode || null,
      step: _0x399caf.step + 1,
      toolResults: [...(_0x399caf.toolResults || []), _0xcd54ad],
      runtimeProvenance: deriveAgentRuntimeProvenance({
        action: _0x5f0797,
        execution: _0x3e0f05,
        previous: _0x399caf.runtimeProvenance
      }),
      actionBudget: recordAgentLoopActionBudgetResult(_0x399caf.actionBudget, _0x5f0797, _0x3e0f05),
      completedFingerprints: _0x3e0f05.ok ? [...(_0x399caf.completedFingerprints || []), _0x5a5b7b] : _0x399caf.completedFingerprints || [],
      failedFingerprints: _0x3e0f05.ok ? Object.fromEntries(Object.entries(_0x399caf.failedFingerprints || {}).filter(([_0x302fda]) => _0x302fda !== _0x5a5b7b)) : {
        ...(_0x399caf.failedFingerprints || {}),
        [_0x5a5b7b]: Number(_0x399caf.failedFingerprints?.[_0x5a5b7b] || 0) + 1
      }
    };
    _0x59c1af = _0x1c9366(_0x59c1af, _0x5f0797, _0x3e0f05);
    sessionStore.recordTrace?.({
      type: "agent_loop_tool_result",
      step: _0x59c1af.step,
      commandId: _0x5f0797.type,
      ok: _0x3e0f05.ok === true,
      ...(confirmed ? {
        confirmed: true
      } : {})
    });
    if (_0x3e0f05.ok === true) {
      sessionStore.setPendingLoopRun?.({
        ..._0x59c1af,
        pendingKind: "interrupted"
      });
      _0x573a65(_0x59c1af.originalMessage);
    }
    return {
      nextLoop: _0x59c1af,
      taskMessages: _0x53243f,
      recoveryCheckpoint: {
        loopState: {
          ..._0x399caf,
          pendingKind: "",
          pendingValidatedPlan: null
        },
        action: _0x5f0797
      }
    };
  }
  async function _0x230d72({
    checkpoint = null,
    displayMessage = "",
    recoveryInstruction = ""
  } = {}) {
    const _0x4b61f6 = checkpoint || sessionStore.getPendingLoopRun?.();
    if (_0x4b61f6?.pendingKind !== "planner_retry" || !_0x3829d4(_0x4b61f6)) {
      return createFailedReply(runtimeText("noPendingRecovery", _0x11e441()));
    }
    const _0x2dc4b4 = "agent-run-" + ++_0x52c0de;
    _0x4126df();
    sessionStore.clearPendingLoopRun?.();
    sessionStore.setCurrentRun?.({
      id: _0x2dc4b4,
      status: "planning",
      stopped: false
    });
    if (displayMessage) {
      sessionStore.pushHistory?.({
        role: "user",
        content: displayMessage
      });
    }
    return _0x2230d3({
      ..._0x4b61f6,
      runId: _0x2dc4b4,
      recoveryInstruction: String(recoveryInstruction || _0x4b61f6.recoveryInstruction || "").trim(),
      pendingKind: "",
      plannerFailureMessage: "",
      plannerDiagnostic: null,
      noActionRetryCount: 0
    });
  }
  async function _0x1b3d1e({
    displayMessage = ""
  } = {}) {
    const _0x28d873 = sessionStore.getPendingLoopRun?.();
    if (!_0x28d873 || !_0x3829d4(_0x28d873)) {
      return createFailedReply(runtimeText("noPendingRecovery", _0x11e441()));
    }
    if (_0x28d873.pendingKind === "planner_retry") {
      return _0x230d72({
        checkpoint: _0x28d873,
        displayMessage: displayMessage
      });
    }
    if (["clarification", "task_wait"].includes(String(_0x28d873.pendingKind || ""))) {
      return createFailedReply(runtimeText("noPendingRecovery", _0x11e441()));
    }
    const _0x3c56cc = "agent-run-" + ++_0x52c0de;
    _0x4126df();
    sessionStore.clearPendingLoopRun?.();
    sessionStore.clearPendingPlan?.();
    sessionStore.setCurrentRun?.({
      id: _0x3c56cc,
      status: "planning",
      stopped: false,
      step: _0x28d873.step
    });
    if (displayMessage) {
      sessionStore.pushHistory?.({
        role: "user",
        content: displayMessage
      });
    }
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "planning",
      content: runtimeText("runResumed", _0x11e441())
    });
    return _0x2230d3({
      ..._0x28d873,
      runId: _0x3c56cc,
      pendingKind: "",
      pendingValidatedPlan: null,
      validationFeedback: Array.isArray(_0x28d873.validationFeedback) ? _0x28d873.validationFeedback : [],
      validationFailureCounts: _0x28d873.validationFailureCounts || {}
    });
  }
  function _0x284a5d() {
    const _0x1a01ce = sessionStore.getPendingLoopRun?.();
    const _0x244e25 = sessionStore.getPendingPlan?.();
    const _0x2f8d4d = sessionStore.getPendingRecovery?.();
    const _0x24658c = sessionStore.getPendingClarification?.();
    const _0x32e93a = sessionStore.getActiveConversation?.();
    if (!_0x1a01ce && !_0x244e25 && !_0x2f8d4d && !_0x24658c && _0x32e93a?.hasUnfinishedOperation !== true) {
      return createFailedReply(runtimeText("noInterruptedRun", _0x11e441()));
    }
    _0x33673b("discarded");
    const _0x12b7ed = sessionStore.stopCurrentRun?.() || null;
    sessionStore.clearPendingLoopRun?.();
    sessionStore.clearPendingPlan?.();
    sessionStore.clearPendingRecovery?.();
    sessionStore.clearPendingClarification?.();
    _0x208864();
    const _0x184cc3 = runtimeText("runDiscarded", _0x11e441());
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "discarded",
      content: _0x184cc3
    });
    return {
      ok: true,
      status: "discarded",
      reply: _0x184cc3,
      run: _0x12b7ed
    };
  }
  function _0x3a5184() {
    const _0xb62bab = _0x577346;
    const _0x34a667 = Boolean(_0xb62bab && _0xb62bab.conversationId === _0x3f701c() && _0xb62bab.projectId === getProjectId({
      commandContext: _0x52a644
    }));
    const _0x1c86cb = _0x24b395.getPending(_0xb62bab?.runId);
    if (!_0x34a667 || !_0xb62bab?.start?.id || !_0xb62bab?.end?.id || _0x1c86cb.length > 0) {
      return createFailedReply(runtimeText("noUndoableRun", _0x11e441()));
    }
    const _0x2c0ee6 = _0x52a644?.history?.undoToCheckpoint?.(_0xb62bab.start, {
      expectedHead: _0xb62bab.end
    });
    if (_0x2c0ee6?.ok !== true) {
      return createFailedReply(runtimeText("noUndoableRun", _0x11e441()), {
        errorCode: _0x2c0ee6?.errorCode || "AGENT_UNDO_UNAVAILABLE"
      });
    }
    for (const _0xc61d7d of sessionStore.getOperationLedger?.() || []) {
      if (_0xc61d7d.runId !== _0xb62bab.runId || _0xc61d7d.status !== "success") {
        continue;
      }
      sessionStore.upsertOperation?.({
        ..._0xc61d7d,
        status: "undone"
      });
    }
    sessionStore.recordRunEvent?.({
      runId: _0xb62bab.runId,
      type: "run.undone",
      status: "undone",
      message: runtimeText("runUndone", _0x11e441())
    });
    sessionStore.pushHistory?.({
      role: "assistant",
      status: "success",
      content: runtimeText("runUndone", _0x11e441())
    });
    _0x577346 = null;
    return {
      ok: true,
      status: "undone",
      reply: runtimeText("runUndone", _0x11e441()),
      undone: _0x2c0ee6.undone
    };
  }
  function _0x22f593(_0x855bc3, _0x3c6bf8 = {}) {
    const _0x5eee68 = Object.values(_0x855bc3.failedFingerprints || {}).some(_0x191122 => Number(_0x191122 || 0) > 0);
    if (_0x5eee68) {
      const _0x2fa4de = [...(_0x855bc3.toolResults || [])].reverse().find(_0x5c7310 => _0x5c7310?.ok === false);
      return _0x19ad9d(_0x855bc3, String(_0x2fa4de?.message || runtimeText("actionExecutionFailed", _0x11e441())), {
        toolResults: _0x855bc3.toolResults
      });
    }
    const _0x84e7df = String(_0x3c6bf8.reply || runtimeText("done", _0x11e441()));
    const _0x14c9c3 = _0x855bc3.toolResults.length > 0;
    const _0x2d8cc9 = _0x14c9c3 ? "success" : "chat";
    sessionStore.clearPendingLoopRun?.();
    sessionStore.clearPendingPlan?.();
    sessionStore.clearPendingClarification?.();
    _0x208864();
    sessionStore.pushHistory?.({
      role: "assistant",
      status: _0x2d8cc9,
      content: _0x84e7df
    });
    if (_0x46b333(_0x855bc3.runId)) {
      sessionStore.setCurrentRun?.({
        id: _0x855bc3.runId,
        status: _0x2d8cc9,
        stopped: false
      });
    }
    return {
      ok: true,
      status: _0x2d8cc9,
      reply: _0x84e7df,
      message: _0x84e7df,
      plan: _0x3c6bf8,
      toolResults: _0x855bc3.toolResults
    };
  }
  async function _0x2230d3(_0x487501) {
    if (!_0x3829d4(_0x487501)) {
      return _0x19ad9d(_0x487501, runtimeText("loopResumeExpired", _0x11e441()));
    }
    const _0x320f6b = Math.max(1, Math.trunc(Number(maxLoopSteps || DEFAULT_MAX_LOOP_STEPS)));
    while (_0x487501.step <= _0x320f6b) {
      if (!_0x46b333(_0x487501.runId)) {
        return _0x218fbd();
      }
      sessionStore.setCurrentRun?.({
        id: _0x487501.runId,
        status: "planning",
        stopped: false,
        step: _0x487501.step
      });
      let _0xcce89d;
      try {
        _0xcce89d = await _0x54d146(_0x487501.originalMessage, {
          ..._0x487501.plannerExtra,
          loopState: _0xdb2c43(_0x487501),
          signal: _0x23a96d?.signal,
          disclosedCommandIds: _0x487501.disclosedCommandIds,
          disclosedModelIds: _0x487501.disclosedModelIds
        });
        _0x487501.plannerNetworkRetryCount = 0;
      } catch (_0x2ef0eb) {
        if (!_0x46b333(_0x487501.runId) || _0x23a96d?.signal?.aborted) {
          return _0x218fbd();
        }
        const _0xf004cf = Number(_0x487501.plannerNetworkRetryCount || 0);
        if (isTransientPlannerNetworkError(_0x2ef0eb) && _0xf004cf < PLANNER_NETWORK_RETRY_LIMIT) {
          _0x487501.plannerNetworkRetryCount = _0xf004cf + 1;
          sessionStore.recordTrace?.({
            type: "agent_loop_planner_network_retry",
            step: _0x487501.step,
            attempt: _0x487501.plannerNetworkRetryCount
          });
          continue;
        }
        return _0xddd0ee(_0x487501, runtimeText("plannerRetryAvailable", _0x11e441()), {
          cause: String(_0x2ef0eb?.message || runtimeText("plannerFailed", _0x11e441()))
        });
      }
      if (!_0x46b333(_0x487501.runId)) {
        return _0x218fbd();
      }
      const _0x444a61 = Array.isArray(_0xcce89d?.actions) ? _0xcce89d.actions : [];
      if (_0x444a61.length === 0 && !["need_clarification", "failed"].includes(_0xcce89d?.status)) {
        const _0x46e50b = hasExplicitCanvasActionIntent(_0x487501.originalMessage, _0x487501.plannerExtra);
        const _0x1a9b96 = verifyAgentLoopCompletionEvidence({
          userMessage: _0x487501.originalMessage,
          plannerExtra: _0x487501.plannerExtra,
          runtimeProvenance: _0x487501.runtimeProvenance,
          canvasState: getState({
            store: _0x57ac3c,
            commandContext: _0x52a644
          })
        });
        if (_0x46e50b && _0x1a9b96.ok === false) {
          const _0x1d35de = "completion:" + (_0x1a9b96.requestedNodeType || "unknown");
          const _0x5d3e57 = Number(_0x487501.validationFailureCounts?.[_0x1d35de] || 0) + 1;
          const _0x11f1dd = runtimeText("loopCompletionEvidenceCorrection", _0x11e441());
          if (_0x5d3e57 <= 2) {
            _0x487501.validationFailureCounts = {
              ..._0x487501.validationFailureCounts,
              [_0x1d35de]: _0x5d3e57
            };
            _0x487501.validationFeedback = [...(_0x487501.validationFeedback || []), {
              step: _0x487501.step,
              commandId: "agent.plan",
              status: "validation_failed",
              ok: false,
              errorCode: _0x1a9b96.errorCode,
              message: _0x11f1dd,
              details: _0x1a9b96
            }].slice(-4);
            sessionStore.recordTrace?.({
              type: "agent_loop_completion_evidence_retry",
              step: _0x487501.step,
              retryCount: _0x5d3e57,
              requestedNodeType: _0x1a9b96.requestedNodeType
            });
            continue;
          }
          return _0xddd0ee(_0x487501, runtimeText("plannerReturnedNoAction", _0x11e441()), {
            diagnosticReason: _0x1a9b96.errorCode
          });
        }
        if (_0x487501.toolResults.length > 0 || _0xcce89d?.status === "chat" || !_0x46e50b) {
          return _0x22f593(_0x487501, _0xcce89d);
        }
        if (shouldRetryAgentLoopNoop({
          hasActionIntent: _0x46e50b,
          toolResultCount: _0x487501.toolResults.length,
          retryCount: _0x487501.noActionRetryCount,
          status: _0xcce89d?.status
        })) {
          _0x487501.noActionRetryCount = Number(_0x487501.noActionRetryCount || 0) + 1;
          sessionStore.recordTrace?.({
            type: "agent_loop_no_action_retry",
            step: _0x487501.step,
            reply: String(_0xcce89d?.reply || "")
          });
          continue;
        }
        return _0xddd0ee(_0x487501, runtimeText("plannerReturnedNoAction", _0x11e441()), {
          diagnosticReason: "no_action"
        });
      }
      if (_0x487501.step >= _0x320f6b && _0x444a61.length > 0) {
        return _0x19ad9d(_0x487501, runtimeText("loopLimitReached", _0x11e441()));
      }
      if (_0x444a61.length > 1) {
        sessionStore.recordTrace?.({
          type: "agent_loop_multiple_actions_compacted",
          step: _0x487501.step,
          actionTypes: _0x444a61.map(_0x5775eb => _0x5775eb?.type)
        });
      }
      const _0x252d77 = [];
      const _0x529c65 = _0x4afe4d => validatePlan(_0x4afe4d, {
        commandRegistry: commandRegistry,
        commandContext: _0x52a644,
        agentContext: _0xc86fe9,
        userMessage: _0x487501.originalMessage,
        runtimeProvenance: _0x487501.runtimeProvenance,
        traceRecorder: _0x274499 => {
          _0x252d77.push(_0x274499);
          sessionStore.recordTrace?.(_0x274499);
        }
      });
      const _0x4afc96 = selectAgentLoopPlanAction({
        rawPlan: _0xcce89d,
        actions: _0x444a61,
        validate: _0x529c65,
        completedFingerprints: _0x487501.completedFingerprints,
        fingerprint: fingerprintAgentAction,
        onCompletedPrefix: (_0x5e8152, _0x1ba965) => sessionStore.recordTrace?.({
          type: "agent_loop_completed_prefix_skipped",
          step: _0x487501.step,
          commandId: _0x5e8152.type,
          actionIndex: _0x1ba965
        })
      });
      const _0x478d1e = _0x4afc96.plan;
      const _0x9c9d53 = _0x4afc96.validation;
      if (!_0x9c9d53.ok) {
        if (_0x9c9d53.errorCode === "AGENT_PLAN_FAILED") {
          return _0xddd0ee(_0x487501, runtimeText("plannerRetryAvailable", _0x11e441()), {
            validation: _0x9c9d53
          });
        }
        const _0x30aaf4 = _0x478d1e?.actions?.[0] || null;
        const _0x22a694 = !_0x30aaf4 && _0x9c9d53.errorCode === "AGENT_PLAN_INVALID";
        const _0x48e2a1 = ["UNKNOWN_AGENT_ACTION", "DEFERRED_AGENT_ACTION", "BLOCKED_AGENT_ACTION"].includes(String(_0x9c9d53.errorCode || ""));
        if ((_0x30aaf4 || _0x22a694) && !_0x48e2a1) {
          const _0x26f802 = _0x30aaf4?.type || "agent.plan";
          const _0x2530dd = _0x30aaf4 ? fingerprintAgentAction(_0x30aaf4) : "agent.plan:" + String(_0xcce89d?.status || "unknown") + ":" + _0x9c9d53.errorCode;
          const _0x9e2fd = Number(_0x487501.validationFailureCounts?.[_0x2530dd] || 0) + 1;
          if (_0x9e2fd <= 2) {
            _0x487501.validationFailureCounts = {
              ..._0x487501.validationFailureCounts,
              [_0x2530dd]: _0x9e2fd
            };
            _0x487501.validationFeedback = [...(_0x487501.validationFeedback || []), {
              step: _0x487501.step,
              commandId: _0x26f802,
              status: "validation_failed",
              ok: false,
              errorCode: _0x9c9d53.errorCode,
              message: _0x9c9d53.message
            }].slice(-4);
            sessionStore.recordTrace?.({
              type: "agent_loop_validation_retry",
              step: _0x487501.step,
              commandId: _0x26f802,
              errorCode: _0x9c9d53.errorCode
            });
            continue;
          }
          return _0xddd0ee(_0x487501, runtimeText("plannerRetryAvailable", _0x11e441()), {
            validation: _0x9c9d53
          });
        }
        return _0x19ad9d(_0x487501, _0x9c9d53.message, {
          validation: _0x9c9d53
        });
      }
      if (_0x487501.step === 0 && shouldHoldCanvasActionsForChat(_0x9c9d53, _0x487501.originalMessage, _0x487501.plannerExtra)) {
        return _0x22f593(_0x487501, {
          ..._0x9c9d53.plan,
          status: "chat",
          actions: [],
          reply: _0x9c9d53.plan.reply || runtimeText("chatIntentRequired", _0x11e441())
        });
      }
      if (_0x9c9d53.status === "chat") {
        return _0x22f593(_0x487501, _0x9c9d53.plan);
      }
      if (_0x9c9d53.status === "need_clarification") {
        if (shouldUseCreativeDefaults({
          userMessage: _0x487501.originalMessage,
          plan: _0x9c9d53.plan,
          agentContext: _0xc86fe9,
          toolResultCount: _0x487501.toolResults.length
        })) {
          const _0x5df360 = "agent.plan:unnecessary_clarification";
          const _0x2095e8 = Number(_0x487501.validationFailureCounts?.[_0x5df360] || 0) + 1;
          if (_0x2095e8 <= 2) {
            _0x487501.validationFailureCounts = {
              ..._0x487501.validationFailureCounts,
              [_0x5df360]: _0x2095e8
            };
            _0x487501.clarificationAnswer = runtimeText("creativeDefaultsInstruction", _0x11e441());
            _0x487501.validationFeedback = [...(_0x487501.validationFeedback || []), {
              step: _0x487501.step,
              commandId: "agent.plan",
              status: "validation_failed",
              ok: false,
              errorCode: "UNNECESSARY_CLARIFICATION",
              message: _0x487501.clarificationAnswer
            }].slice(-4);
            sessionStore.recordTrace?.({
              type: "agent_loop_clarification_replaced_with_defaults",
              step: _0x487501.step,
              retryCount: _0x2095e8
            });
            continue;
          }
        }
        const _0x4a3e12 = {
          ..._0x487501,
          pendingKind: "clarification"
        };
        const _0x4161db = {
          ..._0x9c9d53.plan,
          originalMessage: _0x487501.originalMessage,
          targetKind: _0x487501.plannerExtra?.targetKind || "",
          inputRefs: _0x487501.plannerExtra?.inputRefs || []
        };
        sessionStore.setPendingLoopRun?.(_0x4a3e12);
        sessionStore.setPendingClarification?.(_0x4161db);
        _0x573a65(_0x9c9d53.plan.question || _0x9c9d53.plan.reply);
        sessionStore.pushHistory?.({
          role: "assistant",
          status: "need_clarification",
          content: _0x9c9d53.plan.question
        });
        return {
          ok: true,
          status: "need_clarification",
          reply: _0x9c9d53.plan.reply || _0x9c9d53.plan.question,
          question: _0x9c9d53.plan.question,
          options: _0x9c9d53.plan.options,
          plan: _0x9c9d53.plan
        };
      }
      const _0x554360 = _0x9c9d53.plan.actions[0];
      const _0xe16be2 = fingerprintAgentAction(_0x554360);
      if (_0x487501.completedFingerprints.includes(_0xe16be2)) {
        const _0x377961 = "completed:" + _0xe16be2;
        const _0x5cf712 = Number(_0x487501.validationFailureCounts?.[_0x377961] || 0) + 1;
        if (_0x5cf712 <= 2) {
          const _0x41c3ea = runtimeText("loopRepeatedActionCorrection", _0x11e441());
          _0x487501.validationFailureCounts = {
            ..._0x487501.validationFailureCounts,
            [_0x377961]: _0x5cf712
          };
          _0x487501.validationFeedback = [...(_0x487501.validationFeedback || []), {
            step: _0x487501.step,
            commandId: _0x554360.type,
            status: "validation_failed",
            ok: false,
            errorCode: "ACTION_ALREADY_COMPLETED",
            message: _0x41c3ea
          }].slice(-4);
          sessionStore.recordTrace?.({
            type: "agent_loop_repeated_action_corrected",
            step: _0x487501.step,
            commandId: _0x554360.type,
            repeatCount: _0x5cf712
          });
          continue;
        }
        return _0x19ad9d(_0x487501, runtimeText("loopRepeatedAction", _0x11e441()));
      }
      const _0x3be01f = validateAgentLoopActionBudget(_0x554360, _0x487501.actionBudget);
      if (!_0x3be01f.ok) {
        const _0x2529b4 = "budget:" + _0x3be01f.errorCode;
        const _0x2a58fa = Number(_0x487501.validationFailureCounts?.[_0x2529b4] || 0) + 1;
        const _0x4385e9 = runtimeText("loopDuplicateBudgetCorrection", _0x11e441());
        _0x487501.validationFailureCounts = {
          ..._0x487501.validationFailureCounts,
          [_0x2529b4]: _0x2a58fa
        };
        _0x487501.validationFeedback = [...(_0x487501.validationFeedback || []), {
          step: _0x487501.step,
          commandId: _0x554360.type,
          status: "validation_failed",
          ok: false,
          errorCode: _0x3be01f.errorCode,
          message: _0x4385e9,
          details: _0x3be01f
        }].slice(-4);
        sessionStore.recordTrace?.({
          type: "agent_loop_action_budget_rejected",
          step: _0x487501.step,
          commandId: _0x554360.type,
          ..._0x3be01f
        });
        if (_0x2a58fa <= 2) {
          continue;
        }
        return _0xddd0ee(_0x487501, runtimeText("plannerRetryAvailable", _0x11e441()), {
          validation: {
            errorCode: _0x3be01f.errorCode,
            plan: {
              actions: [_0x554360]
            }
          }
        });
      }
      if (_0x9c9d53.status === "need_confirmation") {
        const _0x311fbe = _0x5666d7.review(_0x9c9d53.plan, {
          debugTrace: _0x252d77
        });
        const _0x1b0e62 = {
          ..._0x487501,
          pendingKind: "confirmation",
          pendingValidatedPlan: _0x311fbe
        };
        sessionStore.setPendingLoopRun?.(_0x1b0e62);
        sessionStore.setPendingPlan?.(_0x311fbe);
        _0x573a65(_0x5666d7.describe({
          plan: _0x311fbe
        }));
        sessionStore.pushHistory?.({
          role: "assistant",
          status: "need_confirmation",
          content: _0x311fbe.reply
        });
        return {
          ok: true,
          status: "need_confirmation",
          reply: _0x311fbe.reply || runtimeText("confirmFallback", _0x11e441()),
          riskLevel: _0x9c9d53.riskLevel,
          plan: _0x311fbe
        };
      }
      sessionStore.setCurrentRun?.({
        id: _0x487501.runId,
        status: "executing",
        stopped: false,
        step: _0x487501.step
      });
      const _0x3ca157 = await _0x115e56([_0x554360], {
        commandContext: _0x52a644,
        precreatedNode: _0x487501.precreatedNode,
        ..._0x446a3a(_0x487501.runId)
      });
      if (!_0x46b333(_0x487501.runId)) {
        return {
          ..._0x218fbd(),
          execution: _0x3ca157
        };
      }
      const _0x45cc5d = _0x24b395.registerExecution(_0x3ca157, {
        turnId: _0x487501.runId
      });
      const _0x318358 = buildAgentToolResult({
        step: _0x487501.step,
        action: _0x554360,
        execution: _0x3ca157
      });
      _0x487501.toolResults = [..._0x487501.toolResults, _0x318358];
      _0x487501.runtimeProvenance = deriveAgentRuntimeProvenance({
        action: _0x554360,
        execution: _0x3ca157,
        previous: _0x487501.runtimeProvenance
      });
      _0x487501.actionBudget = recordAgentLoopActionBudgetResult(_0x487501.actionBudget, _0x554360, _0x3ca157);
      _0x487501 = _0x1c9366(_0x487501, _0x554360, _0x3ca157);
      if (_0x3ca157.ok === true && doesActionConsumePrecreatedNode(_0x554360, _0x487501.precreatedNode)) {
        _0x487501.precreatedNode = null;
      }
      if (_0x3ca157.ok) {
        _0x487501.completedFingerprints = [..._0x487501.completedFingerprints, _0xe16be2];
        const _0x39d49f = {
          ..._0x487501.failedFingerprints
        };
        delete _0x39d49f[_0xe16be2];
        _0x487501.failedFingerprints = _0x39d49f;
      } else {
        const _0x2f0f46 = Number(_0x487501.failedFingerprints[_0xe16be2] || 0) + 1;
        _0x487501.failedFingerprints = {
          ..._0x487501.failedFingerprints,
          [_0xe16be2]: _0x2f0f46
        };
        if (_0x2f0f46 > 1) {
          return _0x19ad9d(_0x487501, _0x3ca157.message || runtimeText("actionExecutionFailed", _0x11e441()), {
            execution: _0x3ca157
          });
        }
      }
      _0x487501.step += 1;
      sessionStore.recordTrace?.({
        type: "agent_loop_tool_result",
        step: _0x487501.step,
        commandId: _0x554360.type,
        ok: _0x3ca157.ok === true
      });
      if (_0x3ca157.ok === true) {
        sessionStore.setPendingLoopRun?.({
          ..._0x487501,
          pendingKind: "interrupted"
        });
        _0x573a65(_0x487501.originalMessage);
      }
      const _0xc463db = _0x195e57(_0x487501, {
        taskMessages: _0x45cc5d
      });
      if (_0xc463db) {
        return _0xc463db;
      }
    }
    return _0x19ad9d(_0x487501, runtimeText("loopLimitReached", _0x11e441()));
  }
  async function _0x54d146(_0x15a419, _0x31a5a7 = {}) {
    if (typeof planner !== "function") {
      return createFailedReply(runtimeText("plannerMissing", _0x11e441()));
    }
    const _0x8358ea = String(_0x31a5a7.loopState?.recoveryInstruction || "").trim();
    const _0x43b556 = _0x8358ea ? String(_0x15a419 || "") + "\n" + _0x8358ea : _0x15a419;
    const _0xf0de80 = buildContext({
      store: _0x57ac3c || _0x52a644?.store,
      commandRegistry: commandRegistry,
      sessionStore: sessionStore,
      userMessage: _0x43b556,
      intent: _0x31a5a7.intent,
      targetKind: _0x31a5a7.targetKind,
      inputRefs: _0x31a5a7.inputRefs,
      contextBudgetChars: _0x31a5a7.contextBudgetChars,
      disclosedCommandIds: _0x31a5a7.disclosedCommandIds,
      disclosedModelIds: _0x31a5a7.disclosedModelIds
    });
    _0xc86fe9 = _0xf0de80;
    sessionStore.recordTrace?.({
      type: "capability_context_routed",
      namespaces: _0xf0de80.capabilityRouting?.selectedNamespaces || [],
      commandIds: (_0xf0de80.commands || []).map(_0x51eb7f => _0x51eb7f.id),
      skillIds: (_0xf0de80.skills || []).map(_0x2543fc => _0x2543fc.id),
      modelIds: (_0xf0de80.canvas?.availableModels || []).map(_0x5c662c => _0x5c662c.modelId),
      estimatedChars: Number(_0xf0de80.contextBudget?.estimatedChars || 0),
      schemaIntegrity: _0xf0de80.contextBudget?.schemaIntegrity !== false
    });
    return planner({
      message: _0x15a419,
      context: _0xf0de80,
      history: sessionStore.getHistory?.() || [],
      pendingClarification: sessionStore.getPendingClarification?.(),
      onTrace: _0x36c70a => sessionStore.recordTrace?.(_0x36c70a),
      ..._0x31a5a7
    });
  }
  async function _0xa58257(_0x57366b, _0x512d83 = {}) {
    if (typeof assistant !== "function") {
      return null;
    }
    const _0x38ffb1 = buildContext({
      store: _0x57ac3c || _0x52a644?.store,
      commandRegistry: commandRegistry,
      sessionStore: sessionStore,
      userMessage: _0x57366b,
      intent: _0x512d83.intent,
      targetKind: _0x512d83.targetKind,
      inputRefs: _0x512d83.inputRefs,
      contextBudgetChars: _0x512d83.contextBudgetChars
    });
    _0xc86fe9 = _0x38ffb1;
    const _0x79f32d = routeAgentTurn({
      message: _0x57366b,
      intent: _0x512d83.intent,
      clarificationAnswer: Boolean(_0x512d83.clarificationAnswer),
      pendingPlan: Boolean(_0x512d83.pendingPlan)
    });
    sessionStore.recordTrace?.({
      type: "agent_turn_routed",
      channel: _0x79f32d.channel,
      reason: _0x79f32d.reason
    });
    return assistant({
      message: _0x57366b,
      context: _0x38ffb1,
      history: sessionStore.getHistory?.() || [],
      signal: _0x23a96d?.signal,
      onTrace: _0xc07c09 => sessionStore.recordTrace?.(_0xc07c09),
      ..._0x512d83
    });
  }
  async function _0x433c38(_0x256d34, _0x5e994c) {
    const _0x1367fa = resolveAgentConversationCanvasTransfer({
      message: _0x256d34,
      history: sessionStore.getHistory?.() || []
    });
    if (!_0x1367fa) {
      return null;
    }
    sessionStore.recordTrace?.({
      type: "agent_turn_routed",
      channel: "canvas.tool",
      reason: "conversation-text-transfer"
    });
    if (!_0x1367fa.content) {
      const _0x12f639 = runtimeText("textSourceMissing", _0x11e441());
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "chat",
        content: _0x12f639
      });
      sessionStore.setCurrentRun?.({
        id: _0x5e994c,
        status: "chat",
        stopped: false
      });
      return createChatReply(_0x12f639, {
        responseChannel: "canvas.tool"
      });
    }
    const _0x560f4f = {
      type: "node.create",
      args: {
        type: _0x1367fa.nodeType,
        prompt: _0x1367fa.content
      }
    };
    const _0x3ddd9b = await _0x115e56([_0x560f4f], {
      commandContext: _0x52a644,
      ..._0x446a3a(_0x5e994c)
    });
    if (!_0x46b333(_0x5e994c)) {
      return _0x218fbd();
    }
    const _0xfadd36 = _0x3ddd9b.ok ? runtimeText("textPlacedOnCanvas", _0x11e441()) : _0x3ddd9b.message || runtimeText("actionExecutionFailed", _0x11e441());
    const _0x1b0fc9 = _0x3ddd9b.ok ? "success" : "failed";
    sessionStore.pushHistory?.({
      role: "assistant",
      status: _0x1b0fc9,
      content: _0xfadd36,
      execution: _0x3ddd9b
    });
    sessionStore.setCurrentRun?.({
      id: _0x5e994c,
      status: _0x1b0fc9,
      stopped: false
    });
    return {
      ok: _0x3ddd9b.ok,
      status: _0x1b0fc9,
      reply: _0xfadd36,
      message: _0xfadd36,
      responseChannel: "canvas.tool",
      plan: {
        status: "ready",
        reply: _0xfadd36,
        actions: [_0x560f4f]
      },
      execution: _0x3ddd9b
    };
  }
  async function _0x55423e(_0x32ffd2, {
    turnId = ""
  } = {}) {
    if (!_0x46b333(turnId)) {
      return _0x218fbd();
    }
    const _0x47e5a1 = await _0x115e56(_0x32ffd2.plan.actions, {
      commandContext: _0x52a644,
      initialScope: _0x32ffd2.plan.scope || _0x32ffd2.plan.aliases || {},
      ..._0x446a3a(turnId)
    });
    if (!_0x46b333(turnId)) {
      return {
        ..._0x218fbd(),
        execution: _0x47e5a1
      };
    }
    let _0x20fc7b = [];
    const _0x18e29f = _0x32ffd2.plan.preExecutedActions?.length > 0 ? summarizeExecution(_0x47e5a1, _0x11e441()) : _0x32ffd2.plan.reply || summarizeExecution(_0x47e5a1, _0x11e441());
    const _0x1d3609 = _0x47e5a1.ok ? {
      recovery: null,
      retryPlan: _0x32ffd2.plan
    } : _0x5666d7.recover(_0x47e5a1, _0x32ffd2.plan);
    const {
      recovery: _0xbc9374,
      retryPlan: _0x4a54ba
    } = _0x1d3609;
    const _0x53b2b6 = _0x47e5a1.ok ? null : buildAgentExecutionDiagnostic({
      execution: _0x47e5a1,
      recovery: _0xbc9374,
      step: sessionStore.getCurrentRun?.()?.step || 0,
      locale: _0x11e441()
    });
    if (_0x47e5a1.ok) {
      sessionStore.clearPendingPlan?.();
      sessionStore.clearPendingRecovery?.();
      _0x208864();
    } else if (_0xbc9374) {
      sessionStore.clearPendingPlan?.();
      sessionStore.setPendingRecovery?.({
        plan: _0x4a54ba,
        recovery: _0xbc9374
      });
      _0x573a65(_0x5666d7.describe({
        recovery: _0xbc9374
      }));
    } else {
      sessionStore.clearPendingPlan?.();
      sessionStore.clearPendingRecovery?.();
      _0x208864();
    }
    sessionStore.pushHistory?.({
      role: "assistant",
      status: _0x47e5a1.ok ? "success" : "failed",
      content: _0x18e29f,
      execution: _0x47e5a1,
      recovery: _0xbc9374,
      diagnostic: _0x53b2b6
    });
    _0x20fc7b = _0x24b395.registerExecution(_0x47e5a1, {
      turnId: _0x42ca83(turnId)
    });
    return {
      ok: _0x47e5a1.ok,
      status: _0x47e5a1.status,
      reply: _0x18e29f,
      plan: _0x32ffd2.plan,
      execution: _0x47e5a1,
      taskMessages: _0x20fc7b,
      ...(_0xbc9374 ? {
        recovery: _0xbc9374
      } : {}),
      ...(_0x53b2b6 ? {
        diagnostic: _0x53b2b6
      } : {})
    };
  }
  async function _0x3ed7a7(_0x469896, {
    turnId = ""
  } = {}) {
    if (!_0x46b333(turnId)) {
      return _0x218fbd();
    }
    const {
      prefix: _0x15d8e7,
      pending: _0x5bb3ad
    } = _0x5666d7.partition(_0x469896.plan);
    if (_0x15d8e7.length === 0) {
      return {
        ok: true,
        plan: _0x469896.plan,
        preExecution: null
      };
    }
    const _0x395918 = await _0x115e56(_0x15d8e7, {
      commandContext: _0x52a644,
      ..._0x446a3a(turnId)
    });
    if (!_0x46b333(turnId)) {
      return {
        ..._0x218fbd(),
        execution: _0x395918
      };
    }
    if (!_0x395918.ok) {
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "failed",
        content: _0x395918.message || runtimeText("preActionsFailed", _0x11e441()),
        execution: _0x395918
      });
      return {
        ok: false,
        status: "failed",
        reply: _0x395918.message || runtimeText("preActionsFailed", _0x11e441()),
        message: _0x395918.message || runtimeText("preActionsFailed", _0x11e441()),
        execution: _0x395918
      };
    }
    return {
      ok: true,
      preExecution: _0x395918,
      plan: {
        ..._0x469896.plan,
        actions: _0x5bb3ad,
        preExecutedActions: _0x15d8e7,
        scope: _0x395918.raw?.result?.aliases || {}
      }
    };
  }
  async function _0x8469ff(_0x836024, {
    agentContext = _0xc86fe9,
    userMessage = "",
    plannerExtra = {},
    turnId = ""
  } = {}) {
    if (!_0x46b333(turnId)) {
      return _0x218fbd();
    }
    const _0x320ac5 = [];
    const _0x59a292 = validatePlan(_0x836024, {
      commandRegistry: commandRegistry,
      commandContext: _0x52a644,
      agentContext: agentContext,
      userMessage: userMessage,
      traceRecorder: _0x27cdc8 => {
        _0x320ac5.push(_0x27cdc8);
        sessionStore.recordTrace?.(_0x27cdc8);
      }
    });
    if (!_0x59a292.ok) {
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "failed",
        content: _0x59a292.message
      });
      return createFailedReply(_0x59a292.message, {
        validation: _0x59a292
      });
    }
    if (_0x59a292.status === "chat") {
      const _0x1f4fe1 = _0x59a292.plan.reply || runtimeText("chatFallback", _0x11e441());
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "chat",
        content: _0x1f4fe1
      });
      return createChatReply(_0x1f4fe1, {
        plan: _0x59a292.plan
      });
    }
    if (shouldHoldCanvasActionsForChat(_0x59a292, userMessage, plannerExtra)) {
      const _0x445599 = _0x59a292.plan.reply || runtimeText("chatIntentRequired", _0x11e441());
      sessionStore.recordTrace?.({
        type: "canvas_action_held_for_chat",
        actionTypes: (_0x59a292.plan.actions || []).map(_0x3fbc3c => _0x3fbc3c.type),
        reason: "missing explicit canvas action intent"
      });
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "chat",
        content: _0x445599
      });
      return createChatReply(_0x445599, {
        plan: {
          ..._0x59a292.plan,
          status: "chat",
          actions: [],
          requiresConfirmation: false
        },
        heldActions: _0x59a292.plan.actions
      });
    }
    if (_0x59a292.status === "need_clarification") {
      sessionStore.setPendingClarification?.(_0x59a292.plan);
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "need_clarification",
        content: _0x59a292.plan.question
      });
      return {
        ok: true,
        status: "need_clarification",
        reply: _0x59a292.plan.reply || _0x59a292.plan.question,
        question: _0x59a292.plan.question,
        options: _0x59a292.plan.options,
        plan: _0x59a292.plan
      };
    }
    if (_0x59a292.status === "need_confirmation") {
      const _0x2e7937 = await _0x3ed7a7(_0x59a292, {
        turnId: turnId
      });
      if (!_0x2e7937.ok) {
        return _0x2e7937;
      }
      _0x2e7937.plan = _0x5666d7.review(_0x2e7937.plan, {
        debugTrace: _0x320ac5
      });
      sessionStore.setPendingPlan?.(_0x2e7937.plan);
      _0x573a65(_0x5666d7.describe({
        plan: _0x2e7937.plan
      }));
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "need_confirmation",
        content: _0x2e7937.plan.reply
      });
      return {
        ok: true,
        status: "need_confirmation",
        reply: _0x2e7937.plan.reply || runtimeText("confirmFallback", _0x11e441()),
        riskLevel: _0x59a292.riskLevel,
        plan: _0x2e7937.plan,
        preExecution: _0x2e7937.preExecution
      };
    }
    return _0x55423e(_0x59a292, {
      turnId: turnId
    });
  }
  async function _0x47cbf4(_0xcea287, _0x3c7ace = {}) {
    const _0x13462d = String(_0xcea287 || "").trim();
    if (!_0x13462d) {
      return createFailedReply(runtimeText("emptyMessage", _0x11e441()));
    }
    const _0xcab4b1 = loopMode === true ? sessionStore.getPendingLoopRun?.() : null;
    if (_0xcab4b1 && !["clarification", "task_wait"].includes(String(_0xcab4b1.pendingKind || "")) && isAgentLoopRetryMessage(_0x13462d) && _0x3829d4(_0xcab4b1)) {
      return _0x1b3d1e({
        displayMessage: _0x13462d
      });
    }
    if (sessionStore.getPendingClarification?.() && !_0x3c7ace.pendingPlan && !_0x3c7ace.clarificationAnswer) {
      return _0x3d3228(_0x13462d, {
        ..._0x3c7ace,
        displayAnswer: _0x13462d
      });
    }
    const _0x14ad12 = loopMode === true ? sessionStore.getPendingLoopRun?.() : null;
    if (_0x14ad12?.pendingKind === "planner_retry" && isAgentLoopRetryMessage(_0x13462d) && _0x3829d4(_0x14ad12)) {
      return _0x230d72({
        checkpoint: _0x14ad12,
        displayMessage: _0x13462d
      });
    }
    if (_0x14ad12?.pendingKind === "planner_retry" && isAgentLoopRecoveryEditMessage(_0x13462d) && _0x3829d4(_0x14ad12)) {
      return _0x230d72({
        checkpoint: _0x14ad12,
        displayMessage: _0x13462d,
        recoveryInstruction: _0x13462d
      });
    }
    const _0x1c388e = "agent-run-" + ++_0x52c0de;
    _0x4126df();
    sessionStore.clearPendingPlan?.();
    sessionStore.clearPendingRecovery?.();
    sessionStore.clearPendingClarification?.();
    sessionStore.clearPendingLoopRun?.();
    _0x208864();
    sessionStore.setCurrentRun?.({
      id: _0x1c388e,
      status: "planning",
      stopped: false
    });
    sessionStore.pushHistory?.({
      role: "user",
      content: _0x13462d,
      inputRefs: Array.isArray(_0x3c7ace.inputRefs) ? _0x3c7ace.inputRefs : []
    });
    const _0x1bafaa = await _0x433c38(_0x13462d, _0x1c388e);
    if (_0x1bafaa) {
      return _0x1bafaa;
    }
    if (typeof assistant === "function" && !hasExplicitCanvasActionIntent(_0x13462d, _0x3c7ace)) {
      try {
        const _0x37fd22 = await _0xa58257(_0x13462d, _0x3c7ace);
        if (!_0x46b333(_0x1c388e)) {
          return _0x218fbd();
        }
        const _0x343921 = String(_0x37fd22?.reply || _0x37fd22?.message || _0x37fd22 || "").trim();
        if (!_0x343921) {
          throw new Error(runtimeText("plannerFailed", _0x11e441()));
        }
        sessionStore.pushHistory?.({
          role: "assistant",
          status: "chat",
          content: _0x343921
        });
        sessionStore.setCurrentRun?.({
          id: _0x1c388e,
          status: "chat",
          stopped: false
        });
        return createChatReply(_0x343921, {
          responseChannel: "assistant.message"
        });
      } catch (_0x485fd9) {
        if (!_0x46b333(_0x1c388e) || _0x23a96d?.signal?.aborted) {
          return _0x218fbd();
        }
        const _0x1ba5b1 = _0x485fd9?.message || runtimeText("plannerFailed", _0x11e441());
        sessionStore.pushHistory?.({
          role: "assistant",
          status: "failed",
          content: _0x1ba5b1
        });
        sessionStore.setCurrentRun?.({
          id: _0x1c388e,
          status: "failed",
          stopped: false
        });
        return createFailedReply(_0x1ba5b1, {
          responseChannel: "assistant.message"
        });
      }
    }
    if (loopMode === true) {
      let _0x486e99 = _0x1733be({
        runId: _0x1c388e,
        message: _0x13462d,
        plannerExtra: _0x3c7ace
      });
      _0x486e99 = await _0x46c50b.reserve(_0x486e99);
      if (!_0x46b333(_0x1c388e)) {
        return _0x218fbd();
      }
      return _0x2230d3(_0x486e99);
    }
    let _0x224cfb;
    try {
      _0x224cfb = await _0x54d146(_0x13462d, {
        ..._0x3c7ace,
        signal: _0x23a96d?.signal
      });
    } catch (_0x429a26) {
      if (!_0x46b333(_0x1c388e) || _0x23a96d?.signal?.aborted) {
        return _0x218fbd();
      }
      const _0x3a8199 = _0x429a26?.message || runtimeText("plannerFailed", _0x11e441());
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "failed",
        content: _0x3a8199
      });
      sessionStore.setCurrentRun?.({
        id: _0x1c388e,
        status: "failed",
        stopped: false
      });
      return createFailedReply(_0x3a8199);
    }
    if (!_0x46b333(_0x1c388e)) {
      return _0x218fbd();
    }
    const _0x94944e = await _0x8469ff(_0x224cfb, {
      userMessage: _0x13462d,
      plannerExtra: _0x3c7ace,
      turnId: _0x1c388e
    });
    if (_0x46b333(_0x1c388e)) {
      sessionStore.setCurrentRun?.({
        id: _0x1c388e,
        status: _0x94944e.status,
        stopped: false
      });
    }
    return _0x94944e;
  }
  async function _0x3d3228(_0x26d620, _0x363afc = {}) {
    const _0x2fb56b = sessionStore.getPendingClarification?.();
    if (!_0x2fb56b) {
      return createFailedReply(runtimeText("noPendingClarification", _0x11e441()));
    }
    const _0x1e3ad2 = loopMode === true ? sessionStore.getPendingLoopRun?.() : null;
    sessionStore.clearPendingClarification?.();
    const _0x343773 = String(_0x363afc.displayAnswer || _0x26d620 || "").trim();
    if (_0x1e3ad2?.pendingKind === "clarification") {
      const _0x4d82a1 = "agent-run-" + ++_0x52c0de;
      _0x4126df();
      sessionStore.clearPendingLoopRun?.();
      sessionStore.setCurrentRun?.({
        id: _0x4d82a1,
        status: "planning",
        stopped: false
      });
      if (_0x343773) {
        sessionStore.pushHistory?.({
          role: "user",
          content: _0x343773
        });
      }
      return _0x2230d3({
        ..._0x1e3ad2,
        runId: _0x4d82a1,
        pendingKind: "",
        clarificationAnswer: String(_0x26d620 || _0x343773),
        plannerExtra: {
          ..._0x1e3ad2.plannerExtra,
          ..._0x363afc,
          clarificationAnswer: _0x26d620,
          pendingPlan: _0x2fb56b
        }
      });
    }
    if (loopMode === true && _0x2fb56b.originalMessage) {
      const _0x15f9a6 = "agent-run-" + ++_0x52c0de;
      _0x4126df();
      sessionStore.setCurrentRun?.({
        id: _0x15f9a6,
        status: "planning",
        stopped: false
      });
      if (_0x343773) {
        sessionStore.pushHistory?.({
          role: "user",
          content: _0x343773
        });
      }
      const _0x292293 = _0x1733be({
        runId: _0x15f9a6,
        message: _0x2fb56b.originalMessage,
        plannerExtra: {
          ..._0x363afc,
          targetKind: _0x2fb56b.targetKind || _0x363afc.targetKind,
          inputRefs: _0x2fb56b.inputRefs || _0x363afc.inputRefs || []
        }
      });
      return _0x2230d3({
        ..._0x292293,
        clarificationAnswer: String(_0x26d620 || _0x343773)
      });
    }
    const _0xb2915d = {
      ..._0x363afc,
      clarificationAnswer: _0x26d620,
      pendingPlan: _0x2fb56b
    };
    delete _0xb2915d.displayAnswer;
    return _0x47cbf4(_0x343773, _0xb2915d);
  }
  async function _0x34acfc(_0x17ecfb = {}) {
    const _0x19e2a1 = sessionStore.getPendingPlan?.();
    if (!_0x19e2a1) {
      return createFailedReply(runtimeText("noPendingPlan", _0x11e441()));
    }
    const _0x4e684d = getPlainObject(_0x17ecfb.params || _0x17ecfb);
    if (Object.keys(_0x4e684d).length === 0) {
      return createFailedReply(runtimeText("nodeSetParams", _0x11e441()));
    }
    const _0xb10104 = _0x19e2a1.confirmationSummary || _0x5666d7.review(_0x19e2a1).confirmationSummary;
    const _0x3e607c = (Array.isArray(_0xb10104.generation?.nodeIds) ? _0xb10104.generation.nodeIds : [_0xb10104.generation?.nodeId]).map(_0x5809e8 => String(_0x5809e8 || "").trim()).filter(Boolean);
    if (_0x3e607c.length === 0) {
      return createFailedReply(runtimeText("noPendingPlan", _0x11e441()));
    }
    const _0xd2e2ec = await _0x115e56(_0x3e607c.map(_0x2ce61c => ({
      type: "node.setParams",
      args: {
        nodeId: _0x2ce61c,
        params: _0x4e684d
      }
    })), {
      commandContext: _0x52a644
    });
    if (!_0xd2e2ec.ok) {
      return createFailedReply(_0xd2e2ec.message || runtimeText("actionExecutionFailed", _0x11e441()), {
        execution: _0xd2e2ec
      });
    }
    const _0x49a24a = _0x5666d7.review(_0x19e2a1, {
      debugTraceSummary: _0xb10104.debugTraceSummary || []
    });
    sessionStore.setPendingPlan?.(_0x49a24a);
    _0x573a65(_0x5666d7.describe({
      plan: _0x49a24a
    }));
    return {
      ok: true,
      status: "need_confirmation",
      reply: _0x49a24a.reply || runtimeText("confirmFallback", _0x11e441()),
      plan: _0x49a24a,
      execution: _0xd2e2ec
    };
  }
  return {
    sessionStore: sessionStore,
    handleUserMessage: _0x47cbf4,
    answerClarification: _0x3d3228,
    updatePendingGenerationParams: _0x34acfc,
    async confirmPendingPlan(_0x2c63e8 = {}) {
      if (_0x3026ea) {
        return _0x3026ea;
      }
      const _0x1658ae = loopMode === true ? sessionStore.getPendingLoopRun?.() : null;
      if (_0x1658ae?.pendingKind === "confirmation") {
        const _0x373209 = _0x1658ae.pendingValidatedPlan;
        const _0x1be8b9 = _0x373209?.actions?.[0];
        if (!_0x1be8b9 || !_0x3829d4(_0x1658ae)) {
          sessionStore.clearPendingLoopRun?.();
          sessionStore.clearPendingPlan?.();
          return createFailedReply(runtimeText("loopResumeExpired", _0x11e441()));
        }
        sessionStore.clearPendingLoopRun?.();
        sessionStore.clearPendingPlan?.();
        const _0x3c80c2 = String(_0x2c63e8.displayAnswer || "").trim();
        if (_0x3c80c2) {
          sessionStore.pushHistory?.({
            role: "user",
            content: _0x3c80c2
          });
        }
        _0x4126df();
        sessionStore.setCurrentRun?.({
          id: _0x1658ae.runId,
          status: "executing",
          stopped: false,
          step: _0x1658ae.step
        });
        _0x3026ea = (async () => {
          sessionStore.recordRunEvent?.({
            runId: _0x1658ae.runId,
            type: "approval.confirmed",
            status: "executing",
            step: _0x1658ae.step,
            commandId: _0x1be8b9.type
          });
          const _0x49af39 = await _0x115e56([_0x1be8b9], {
            commandContext: _0x52a644,
            precreatedNode: _0x1658ae.precreatedNode,
            ..._0x446a3a(_0x1658ae.runId)
          });
          if (!_0x46b333(_0x1658ae.runId)) {
            return {
              ..._0x218fbd(),
              execution: _0x49af39
            };
          }
          const {
            nextLoop: _0x24eac0,
            taskMessages: _0x1192f0,
            recoveryCheckpoint: _0x269709
          } = _0x4d7ed6(_0x1658ae, _0x1be8b9, _0x49af39, {
            confirmed: true
          });
          if (!_0x49af39.ok) {
            return _0x1c6589(_0x1658ae, _0x1be8b9, _0x49af39);
          }
          const _0x56a631 = _0x195e57(_0x24eac0, {
            taskMessages: _0x1192f0,
            recoveryCheckpoint: _0x269709
          });
          if (_0x56a631) {
            return _0x56a631;
          }
          return _0x2230d3(_0x24eac0);
        })();
        try {
          return await _0x3026ea;
        } finally {
          _0x3026ea = null;
        }
      }
      const _0x2cbb82 = sessionStore.getPendingPlan?.();
      if (!_0x2cbb82) {
        return createFailedReply(runtimeText("noPendingPlan", _0x11e441()));
      }
      sessionStore.clearPendingPlan?.();
      const _0x30675f = String(_0x2c63e8.displayAnswer || "").trim();
      if (_0x30675f) {
        sessionStore.pushHistory?.({
          role: "user",
          content: _0x30675f
        });
      }
      sessionStore.recordRunEvent?.({
        runId: sessionStore.getCurrentRun?.()?.id,
        type: "approval.confirmed",
        status: "executing",
        commandId: _0x2cbb82.actions?.[0]?.type
      });
      _0x3026ea = _0x55423e({
        ok: true,
        status: "ready",
        plan: {
          ..._0x2cbb82,
          status: "ready",
          requiresConfirmation: false
        }
      }, {
        turnId: _0x3a416c("agent-confirm")
      });
      try {
        return await _0x3026ea;
      } finally {
        _0x3026ea = null;
      }
    },
    async retryFailedPlan() {
      const _0x25d1a4 = sessionStore.getPendingRecovery?.();
      if (!_0x25d1a4?.plan) {
        return createFailedReply(runtimeText("noPendingRecovery", _0x11e441()));
      }
      if (_0x25d1a4.loopCheckpoint && _0x25d1a4.loopAction) {
        if (!_0x3829d4(_0x25d1a4.loopCheckpoint)) {
          sessionStore.clearPendingRecovery?.();
          _0x208864();
          return createFailedReply(runtimeText("loopResumeExpired", _0x11e441()));
        }
        const _0x4f3749 = "agent-run-" + ++_0x52c0de;
        const _0x57dc03 = {
          ..._0x25d1a4.loopCheckpoint,
          runId: _0x4f3749,
          pendingKind: "",
          pendingValidatedPlan: null
        };
        const _0x52fdb2 = _0x25d1a4.loopAction;
        _0x4126df();
        sessionStore.clearPendingRecovery?.();
        sessionStore.setCurrentRun?.({
          id: _0x4f3749,
          status: "executing",
          stopped: false,
          step: _0x57dc03.step
        });
        const _0x20b0ee = await _0x115e56([_0x52fdb2], {
          commandContext: _0x52a644,
          initialScope: _0x25d1a4.plan.scope || _0x25d1a4.plan.aliases || {},
          precreatedNode: _0x57dc03.precreatedNode,
          ..._0x446a3a(_0x4f3749)
        });
        if (!_0x46b333(_0x4f3749)) {
          return {
            ..._0x218fbd(),
            execution: _0x20b0ee
          };
        }
        const {
          nextLoop: _0x3ac21d,
          taskMessages: _0x8d9e4e,
          recoveryCheckpoint: _0x47e6b7
        } = _0x4d7ed6(_0x57dc03, _0x52fdb2, _0x20b0ee);
        if (!_0x20b0ee.ok) {
          return _0x1c6589(_0x57dc03, _0x52fdb2, _0x20b0ee);
        }
        const _0x51b150 = _0x195e57(_0x3ac21d, {
          taskMessages: _0x8d9e4e,
          recoveryCheckpoint: _0x47e6b7
        });
        if (_0x51b150) {
          return _0x51b150;
        }
        return _0x2230d3(_0x3ac21d);
      }
      return _0x55423e({
        ok: true,
        status: "ready",
        plan: {
          ..._0x25d1a4.plan,
          status: "ready",
          requiresConfirmation: false
        }
      }, {
        turnId: _0x3a416c("agent-retry")
      });
    },
    async retryPlannerRun() {
      return _0x230d72();
    },
    resumeInterruptedRun: _0x1b3d1e,
    discardInterruptedRun: _0x284a5d,
    undoLastAgentRun: _0x3a5184,
    getInterruptedRun() {
      const _0x1f952b = sessionStore.getPendingLoopRun?.();
      if (_0x1f952b && _0x3829d4(_0x1f952b)) {
        return _0x1f952b;
      } else {
        return null;
      }
    },
    getLastUndoableRun() {
      if (!_0x577346 || _0x577346.conversationId !== _0x3f701c() || _0x577346.projectId !== getProjectId({
        commandContext: _0x52a644
      })) {
        return null;
      }
      return {
        runId: _0x577346.runId
      };
    },
    keepPreparedPlan() {
      sessionStore.clearPendingRecovery?.();
      sessionStore.clearPendingPlan?.();
      _0x208864();
      const _0x116478 = runtimeText("recoveryKept", _0x11e441());
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "recovery_kept",
        content: _0x116478
      });
      return {
        ok: true,
        status: "recovery_kept",
        reply: _0x116478
      };
    },
    cancelPendingPlan() {
      const _0x2d677a = sessionStore.getPendingPlan?.();
      const _0x3c79f6 = sessionStore.getCurrentRun?.();
      sessionStore.recordRunEvent?.({
        runId: _0x3c79f6?.id,
        type: "approval.cancelled",
        status: "cancelled",
        step: _0x3c79f6?.step,
        commandId: _0x2d677a?.actions?.[0]?.type
      });
      sessionStore.clearPendingPlan?.();
      sessionStore.clearPendingLoopRun?.();
      sessionStore.clearPendingClarification?.();
      _0x208864();
      const _0x37a72c = runtimeText("planCancelled", _0x11e441());
      sessionStore.pushHistory?.({
        role: "assistant",
        status: "cancelled",
        content: _0x37a72c
      });
      return {
        ok: true,
        status: "cancelled",
        reply: _0x37a72c
      };
    },
    stop() {
      const _0x58322a = sessionStore.stopCurrentRun?.();
      _0x33673b("stopped");
      sessionStore.clearPendingLoopRun?.();
      sessionStore.clearPendingPlan?.();
      sessionStore.clearPendingClarification?.();
      _0x208864();
      const _0x2176a1 = runtimeText("runStopped", _0x11e441());
      if (_0x58322a) {
        sessionStore.pushHistory?.({
          role: "assistant",
          status: "stopped",
          content: _0x2176a1
        });
      }
      return {
        ok: true,
        status: "stopped",
        reply: _0x2176a1,
        run: _0x58322a
      };
    },
    resetSession() {
      _0x33673b("reset");
      sessionStore.reset?.();
      _0x208864();
      return {
        ok: true,
        status: "reset",
        reply: runtimeText("reset", _0x11e441())
      };
    },
    startNewConversation() {
      _0x33673b("conversation_changed");
      return sessionStore.startNewConversation?.() || null;
    },
    switchConversation(_0xe7776f) {
      _0x33673b("conversation_changed");
      return sessionStore.switchConversation?.(_0xe7776f) || null;
    },
    deleteConversation(_0x15a138) {
      _0x33673b("conversation_changed");
      return sessionStore.deleteConversation?.(_0x15a138) || null;
    },
    listConversations() {
      return sessionStore.listConversations?.() || [];
    },
    getActiveConversation() {
      return sessionStore.getActiveConversation?.() || null;
    },
    dispose() {
      _0x33673b("disposed");
      _0x24b395?.dispose?.();
    }
  };
}