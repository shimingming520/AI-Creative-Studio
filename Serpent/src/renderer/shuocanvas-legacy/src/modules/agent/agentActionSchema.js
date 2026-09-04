export const AGENT_PLAN_STATUSES = Object.freeze(["chat", "ready", "need_clarification", "need_confirmation", "failed"]);
export const AGENT_RISK_LEVELS = Object.freeze(["safe", "confirm", "danger", "blocked"]);
export const AGENT_BATCH_CONFIRM_THRESHOLD = 5;
const AGENT_ACTION_ALIAS_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const AGENT_ACTION_CONTROL_KEYS = new Set(["type", "commandId", "id", "alias", "resultAlias", "as", "args", "riskLevel", "riskReason", "label"]);
export function normalizeAgentActionAlias(_0x2ff319) {
  const _0x3e5754 = String(_0x2ff319 || "").trim();
  if (AGENT_ACTION_ALIAS_PATTERN.test(_0x3e5754)) {
    return _0x3e5754;
  } else {
    return "";
  }
}
function normalizeAgentActionArgs(_0x4856ab = {}) {
  const _0x5f07d0 = {};
  for (const [_0x3d836, _0x304972] of Object.entries(_0x4856ab)) {
    if (!AGENT_ACTION_CONTROL_KEYS.has(_0x3d836) && _0x304972 !== undefined) {
      _0x5f07d0[_0x3d836] = _0x304972;
    }
  }
  const _0x30a18f = _0x4856ab.args && typeof _0x4856ab.args === "object" && !Array.isArray(_0x4856ab.args) ? _0x4856ab.args : {};
  return {
    ..._0x5f07d0,
    ..._0x30a18f
  };
}
export function normalizeAgentAction(_0xf1c23a = {}) {
  if (!_0xf1c23a || typeof _0xf1c23a !== "object" || Array.isArray(_0xf1c23a)) {
    return null;
  }
  const _0x1c6721 = String(_0xf1c23a.type || _0xf1c23a.commandId || _0xf1c23a.id || "").trim();
  if (!_0x1c6721) {
    return null;
  }
  const _0x2003f7 = normalizeAgentActionAlias(_0xf1c23a.alias ?? _0xf1c23a.resultAlias ?? _0xf1c23a.as);
  return {
    type: _0x1c6721,
    ...(_0x2003f7 ? {
      alias: _0x2003f7
    } : {}),
    args: normalizeAgentActionArgs(_0xf1c23a)
  };
}
export function normalizeAgentPlan(_0x41802b = {}) {
  const _0x44557e = typeof _0x41802b === "string" ? safeParseJson(_0x41802b) : _0x41802b && typeof _0x41802b === "object" ? _0x41802b : {};
  const _0x4e214d = AGENT_PLAN_STATUSES.includes(_0x44557e.status) ? _0x44557e.status : "failed";
  return {
    reply: String(_0x44557e.reply || ""),
    status: _0x4e214d,
    question: String(_0x44557e.question || ""),
    options: Array.isArray(_0x44557e.options) ? _0x44557e.options.map(_0x30825b => ({
      id: String(_0x30825b?.id || ""),
      label: String(_0x30825b?.label || _0x30825b?.id || "")
    })).filter(_0x3bed20 => _0x3bed20.id && _0x3bed20.label) : [],
    requiresConfirmation: _0x44557e.requiresConfirmation === true,
    riskLevel: AGENT_RISK_LEVELS.includes(_0x44557e.riskLevel) ? _0x44557e.riskLevel : "safe",
    actions: Array.isArray(_0x44557e.actions) ? _0x44557e.actions.map(normalizeAgentAction).filter(Boolean) : [],
    raw: _0x44557e
  };
}
function safeParseJson(_0x371ce8) {
  try {
    return JSON.parse(_0x371ce8);
  } catch {
    return {
      status: "failed",
      reply: "Agent planner returned invalid JSON."
    };
  }
}