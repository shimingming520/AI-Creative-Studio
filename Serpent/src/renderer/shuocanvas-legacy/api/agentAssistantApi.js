import { generateText } from "./aiTextApi.js";
export const AGENT_ASSISTANT_PROMPT_MAX_CHARS = 36000;
const ASSISTANT_HISTORY_LIMIT = 20;
const ASSISTANT_HISTORY_ENTRY_LIMIT = 4000;
export const AGENT_ASSISTANT_SYSTEM_PROMPT = ["You are the SHUO Canvas creative assistant.", "Reply directly in the user's language using natural text or Markdown, never planner JSON.", "You can have ordinary conversations, write and revise copy, prompts, scripts, titles, outlines, and creative concepts.", "Use the retained conversation history for follow-up requests such as revising the second version or continuing the previous draft.", "Canvas context is read-only in this response channel. You may analyze it, but never claim that you created, changed, generated, selected, or arranged canvas content.", "When the user later asks to place content on the canvas, the product will route that turn to canvas tools."].join("\n");
function truncateText(_0x540a04, _0x22bdcc) {
  const _0x36c940 = String(_0x540a04 || "");
  if (_0x36c940.length <= _0x22bdcc) {
    return _0x36c940;
  }
  return _0x36c940.slice(0, Math.max(0, _0x22bdcc - 3)) + "...";
}
function normalizeLocale(_0x3cef40 = "") {
  if (String(_0x3cef40 || "").toLowerCase().startsWith("en")) {
    return "en-US";
  } else {
    return "zh-CN";
  }
}
function normalizeHistory(_0x475da0 = [], _0x34e38b = "") {
  if (!Array.isArray(_0x475da0)) {
    return [];
  }
  const _0x47d566 = _0x475da0.map((_0x311370 = {}) => ({
    role: String(_0x311370.role || "assistant") === "user" ? "user" : "assistant",
    content: truncateText(_0x311370.content || _0x311370.reply || _0x311370.message || _0x311370.question || "", ASSISTANT_HISTORY_ENTRY_LIMIT)
  })).filter(_0x543820 => _0x543820.content);
  const _0x27de47 = _0x47d566.at(-1);
  if (_0x27de47?.role === "user" && _0x27de47.content === String(_0x34e38b || "")) {
    _0x47d566.pop();
  }
  return _0x47d566.slice(-ASSISTANT_HISTORY_LIMIT);
}
function compactCanvasContext(_0x568753 = {}) {
  const _0x9ccc29 = _0x568753?.canvas || {};
  return {
    projectId: _0x9ccc29.projectId || "",
    selectedNodeIds: Array.isArray(_0x9ccc29.selectedNodeIds) ? _0x9ccc29.selectedNodeIds.slice(0, 12) : [],
    inputRefs: Array.isArray(_0x9ccc29.inputRefs) ? _0x9ccc29.inputRefs.slice(0, 12) : [],
    nodes: (Array.isArray(_0x9ccc29.nodes) ? _0x9ccc29.nodes : []).slice(0, 24).map((_0x114b33 = {}) => ({
      id: _0x114b33.id || _0x114b33.nodeId || "",
      type: _0x114b33.type || "",
      name: truncateText(_0x114b33.name || _0x114b33.label || "", 120),
      promptPreview: truncateText(_0x114b33.promptPreview || "", 800),
      contentPreview: truncateText(_0x114b33.contentPreview || "", 800),
      model: _0x114b33.model || "",
      provider: _0x114b33.provider || "",
      status: _0x114b33.status || _0x114b33.jobStatus || ""
    }))
  };
}
function buildAssistantPrompt({
  message: _0xda35f2,
  context: _0x158c6b,
  history: _0x3add70,
  locale: _0x2f1b0b
}) {
  const _0x407f61 = {
    languagePolicy: normalizeLocale(_0x2f1b0b) === "en-US" ? "Reply in English unless the user explicitly requests another language." : "使用简体中文回复，除非用户明确要求其他语言。",
    history: normalizeHistory(_0x3add70, _0xda35f2),
    canvas: compactCanvasContext(_0x158c6b),
    userMessage: String(_0xda35f2 || "")
  };
  let _0x139b5c = JSON.stringify(_0x407f61);
  if (_0x139b5c.length <= AGENT_ASSISTANT_PROMPT_MAX_CHARS) {
    return _0x139b5c;
  }
  _0x407f61.canvas.nodes = _0x407f61.canvas.nodes.slice(0, 8).map(_0x24953a => ({
    ..._0x24953a,
    promptPreview: truncateText(_0x24953a.promptPreview, 240),
    contentPreview: truncateText(_0x24953a.contentPreview, 240)
  }));
  _0x139b5c = JSON.stringify(_0x407f61);
  while (_0x139b5c.length > AGENT_ASSISTANT_PROMPT_MAX_CHARS && _0x407f61.history.length > 2) {
    _0x407f61.history.shift();
    _0x139b5c = JSON.stringify(_0x407f61);
  }
  return _0x139b5c.slice(0, AGENT_ASSISTANT_PROMPT_MAX_CHARS);
}
function getResultText(_0x1345e6) {
  if (typeof _0x1345e6 === "string") {
    return _0x1345e6;
  } else {
    return _0x1345e6?.text || _0x1345e6?.outputText || _0x1345e6?.content || "";
  }
}
export async function requestAgentAssistantReply({
  message: _0x4760cf,
  context: _0xb9451a,
  history = [],
  settings = {},
  request = generateText,
  signal = null,
  onTrace = null
} = {}) {
  const _0x30f7e8 = String(settings.model || "").trim();
  const _0x484ed7 = String(settings.provider || "").trim();
  const _0x30c35a = String(settings.providerProfileId || "").trim();
  if (!_0x30f7e8 || !_0x484ed7) {
    throw new Error("Agent model is not configured.");
  }
  onTrace?.({
    type: "agent_response_channel_selected",
    channel: "assistant.message",
    provider: _0x484ed7,
    model: _0x30f7e8
  });
  const _0x2f10eb = await request({
    model: _0x30f7e8,
    provider: _0x484ed7,
    ...(_0x30c35a ? {
      providerProfileId: _0x30c35a
    } : {}),
    prompt: buildAssistantPrompt({
      message: _0x4760cf,
      context: _0xb9451a,
      history: history,
      locale: settings.locale
    }),
    systemPrompt: AGENT_ASSISTANT_SYSTEM_PROMPT,
    temperature: Number.isFinite(Number(settings.temperature)) ? Number(settings.temperature) : 0.7,
    ...(signal ? {
      signal: signal
    } : {})
  });
  const _0x2c5eb7 = String(getResultText(_0x2f10eb) || "").trim();
  if (!_0x2c5eb7) {
    throw new Error("Agent assistant returned empty text.");
  }
  return {
    status: "chat",
    reply: _0x2c5eb7
  };
}