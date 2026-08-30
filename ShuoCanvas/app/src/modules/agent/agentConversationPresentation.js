import { renderMarkdownToHtml } from "../../components/aigenText/markdownRenderer.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { buildAgentRunSteps } from "./agentRunSteps.js";
import { agentPanelText, formatAgentPanelText } from "./agentPanelText.js";
import { scrollAgentMessageListToEnd } from "./agentConversationScroll.js";
export const AGENT_CONVERSATION_INPUT_REF_LIMIT = 12;
function getTaskResultEntryKey(_0xf673e3 = {}) {
  const _0x30674f = String(_0xf673e3.messageType || _0xf673e3.type || "").trim();
  if (_0x30674f !== "task_result") {
    return "";
  }
  const _0x57ed93 = _0xf673e3.task && typeof _0xf673e3.task === "object" ? _0xf673e3.task : {};
  const _0x2c85cd = String(_0x57ed93.taskId || "").trim();
  const _0x2a1d26 = String(_0x57ed93.nodeId || "").trim();
  const _0x450362 = String(_0x57ed93.status || _0xf673e3.status || "").trim();
  if (!_0x2c85cd && !_0x2a1d26) {
    return "";
  }
  return _0x2c85cd + "\0" + _0x2a1d26 + "\0" + _0x450362;
}
function createEl(_0x1f8a22, _0x12a89d = "", _0x13abf9 = "") {
  const _0x42be37 = document.createElement(_0x1f8a22);
  if (_0x12a89d) {
    _0x42be37.className = _0x12a89d;
  }
  if (_0x13abf9) {
    _0x42be37.textContent = _0x13abf9;
  }
  return _0x42be37;
}
function normalizeMessageClassSegment(_0x2c8d2e = "") {
  return String(_0x2c8d2e || "").trim().toLowerCase().replace(/_/g, "-").replace(/[^a-z0-9_-]+/g, "-");
}
export function normalizeAgentRenderableMediaUrl(_0x518ef8) {
  const _0x272a70 = String(_0x518ef8 || "").trim();
  if (!_0x272a70) {
    return "";
  }
  if (/^https?:\/\//i.test(_0x272a70) || _0x272a70.startsWith("/")) {
    return _0x272a70;
  }
  if (/^data:image\//i.test(_0x272a70) && _0x272a70.length <= 50000) {
    return _0x272a70;
  }
  return localPathToUrl(_0x272a70) || "";
}
export function formatAgentAssistantMarkdown(_0x2355a3 = "") {
  const _0x32f6f6 = String(_0x2355a3 || "").replace(/\r\n?/g, "\n").trim();
  if (!_0x32f6f6 || _0x32f6f6.includes("```")) {
    return _0x32f6f6;
  }
  return _0x32f6f6.replace(/([。！？；])\s+(\*\*[^*\n]{2,48}\*\*[：:])/g, "$1\n\n$2").replace(/([：:])\s*(\*\*[^*\n]{2,48}\*\*[：:])/g, "$1\n\n$2").replace(/([。！？；])\s*(?=[^\n。！？；]{2,32}[：:])/g, "$1\n\n").replace(/([。！？；])\s+(?=(?:创作目标|素材分组|当前进展|项目概览|后续建议|下一步[^：:\n]{0,24})[：:])/g, "$1\n\n").replace(/([：:])\s+(?=\d+[.)]\s+)/g, "$1\n").replace(/([。！？；])\s+(?=\d+[.)]\s+)/g, "$1\n").replace(/([^\n])\s+(\d+[.)]\s+)/g, "$1\n$2").replace(/\n{3,}/g, "\n\n");
}
function normalizeTaskImageMediaItems(_0x287003 = {}) {
  const _0x1f5a1b = _0x287003?.media;
  if (!_0x1f5a1b || _0x1f5a1b.kind !== "image") {
    return [];
  }
  const _0x3268d3 = Array.isArray(_0x1f5a1b.items) && _0x1f5a1b.items.length > 0 ? _0x1f5a1b.items : [_0x1f5a1b];
  return _0x3268d3.map(_0x33a7ed => {
    const _0x11e985 = normalizeAgentRenderableMediaUrl(_0x33a7ed?.url || _0x33a7ed?.thumbUrl);
    const _0x4a9276 = normalizeAgentRenderableMediaUrl(_0x33a7ed?.thumbUrl || _0x33a7ed?.url);
    if (!_0x11e985 && !_0x4a9276) {
      return null;
    }
    return {
      url: _0x11e985 || _0x4a9276,
      thumbUrl: _0x4a9276 || _0x11e985,
      name: String(_0x33a7ed?.name || _0x1f5a1b.name || _0x287003.nodeId || "").trim()
    };
  }).filter(Boolean);
}
function buildAgentMessageCopyText(_0x5b3113 = "", _0x15f93e = null) {
  const _0x57713b = [String(_0x5b3113 || "").trim()].filter(Boolean);
  const _0xcc1671 = _0x15f93e?.media?.kind === "image" ? Array.isArray(_0x15f93e.media.items) && _0x15f93e.media.items.length > 0 ? _0x15f93e.media.items : [_0x15f93e.media] : [];
  const _0x187289 = String(_0x15f93e?.media?.name || _0x15f93e?.nodeId || "").trim();
  if (_0x187289) {
    _0x57713b.push("" + agentPanelText("copyMessageNodeLabel") + agentPanelText("copyMessageSeparator") + _0x187289);
  }
  _0xcc1671.forEach((_0x1ebbd6, _0x209a5c) => {
    const _0x644e8c = String(_0x1ebbd6?.url || _0x1ebbd6?.thumbUrl || "").trim();
    if (!_0x644e8c) {
      return;
    }
    _0x57713b.push("" + agentPanelText("copyMessageImageLabel") + (_0xcc1671.length > 1 ? _0x209a5c + 1 : "") + agentPanelText("copyMessageSeparator") + _0x644e8c);
  });
  return _0x57713b.join("\n");
}
function appendTaskImageMedia(_0x47ccfe, _0x484bc3 = {}, {
  onImagePreview = null
} = {}) {
  const _0x3b0981 = normalizeTaskImageMediaItems(_0x484bc3);
  if (_0x3b0981.length === 0) {
    return;
  }
  const _0x33be99 = createEl("div", "agent-message-media-grid");
  _0x33be99.classList.toggle("is-multiple", _0x3b0981.length > 1);
  _0x3b0981.forEach((_0x28027c, _0xb1f14c) => {
    const _0x4e7110 = createEl("button", "agent-message-media-card");
    _0x4e7110.type = "button";
    _0x4e7110.title = agentPanelText("imageResultOpen");
    _0x4e7110.setAttribute("aria-label", _0x28027c.name || agentPanelText("imageResultOpen"));
    _0x4e7110.dataset.imageUrl = _0x28027c.url;
    _0x4e7110.dataset.imageName = _0x28027c.name || _0x484bc3.nodeId || "";
    const _0x44be3a = createEl("img", "agent-message-media-image");
    _0x44be3a.src = _0x28027c.thumbUrl;
    _0x44be3a.alt = _0x28027c.name || _0x484bc3.nodeId || "";
    _0x44be3a.draggable = false;
    _0x4e7110.appendChild(_0x44be3a);
    if (_0x28027c.name) {
      _0x4e7110.appendChild(createEl("span", "agent-message-media-name", _0x3b0981.length > 1 ? _0x28027c.name + " " + (_0xb1f14c + 1) : _0x28027c.name));
    }
    _0x4e7110.addEventListener("click", _0x4dc1f1 => {
      _0x4dc1f1.preventDefault?.();
      _0x4dc1f1.stopPropagation?.();
      onImagePreview?.(_0x28027c.url, _0x28027c.name || _0x484bc3.nodeId || "");
    });
    _0x33be99.appendChild(_0x4e7110);
  });
  _0x47ccfe.appendChild(_0x33be99);
}
function appendMessageInputRefs(_0x5a6387, _0x3183a3 = []) {
  const _0x279402 = (Array.isArray(_0x3183a3) ? _0x3183a3 : []).filter(_0x149346 => String(_0x149346?.nodeId || _0x149346?.id || "").trim()).slice(0, AGENT_CONVERSATION_INPUT_REF_LIMIT);
  if (_0x279402.length === 0) {
    return;
  }
  const _0x18ac8a = createEl("div", "agent-message-input-refs");
  _0x18ac8a.setAttribute("role", "list");
  _0x279402.forEach(_0x3975f0 => {
    const _0x2e3247 = String(_0x3975f0.nodeId || _0x3975f0.id || "").trim();
    const _0x119520 = String(_0x3975f0.label || _0x3975f0.name || _0x2e3247).trim();
    const _0x56678f = createEl("div", "agent-message-input-ref");
    _0x56678f.dataset.inputRefId = _0x2e3247;
    _0x56678f.setAttribute("role", "listitem");
    _0x56678f.title = _0x119520;
    if (_0x3975f0.thumbUrl) {
      const _0x1de12b = createEl("img", "agent-message-input-ref-thumb");
      _0x1de12b.src = _0x3975f0.thumbUrl;
      _0x1de12b.alt = _0x119520;
      _0x1de12b.draggable = false;
      _0x56678f.appendChild(_0x1de12b);
    } else {
      const _0x4e5be9 = createEl("div", "agent-message-input-ref-fallback", String(_0x3975f0.kind || "node").slice(0, 3).toUpperCase());
      _0x4e5be9.setAttribute("aria-hidden", "true");
      _0x56678f.appendChild(_0x4e5be9);
    }
    if (_0x119520) {
      _0x56678f.appendChild(createEl("span", "agent-message-input-ref-name", _0x119520));
    }
    _0x18ac8a.appendChild(_0x56678f);
  });
  _0x5a6387.appendChild(_0x18ac8a);
}
function appendFailureDiagnostic(_0x4348b3, _0x5c2923 = null) {
  if (!_0x5c2923 || typeof _0x5c2923 !== "object" || !_0x5c2923.summary) {
    return;
  }
  const _0x2564fc = createEl("section", "agent-diagnostic");
  _0x2564fc.hidden = false;
  _0x2564fc.setAttribute("aria-label", agentPanelText("diagnosticTitle"));
  const _0x31fb5a = createEl("div", "agent-diagnostic-header");
  _0x31fb5a.append(createEl("span", "agent-diagnostic-title", agentPanelText("diagnosticTitle")), createEl("span", "agent-diagnostic-phase", _0x5c2923.phaseLabel || _0x5c2923.phase || ""));
  const _0xb429c2 = createEl("div", "agent-diagnostic-summary", _0x5c2923.summary);
  const _0x395640 = createEl("div", "agent-diagnostic-meta");
  _0x395640.append(createEl("span", "agent-diagnostic-meta-item", formatAgentPanelText("diagnosticStep", {
    step: Math.max(1, Number(_0x5c2923.step || 1))
  })), createEl("span", "agent-diagnostic-meta-item", formatAgentPanelText("diagnosticCompleted", {
    count: Math.max(0, Number(_0x5c2923.completedSteps || 0))
  })));
  const _0x30c56 = createEl("div", "agent-diagnostic-detail");
  _0x30c56.hidden = true;
  if (_0x5c2923.detail) {
    _0x30c56.appendChild(createEl("div", "", _0x5c2923.detail));
  }
  if (_0x5c2923.errorCode) {
    _0x30c56.appendChild(createEl("code", "agent-diagnostic-code", formatAgentPanelText("diagnosticErrorCode", {
      code: _0x5c2923.errorCode
    })));
  }
  const _0x398ccb = createEl("button", "agent-diagnostic-toggle", agentPanelText("diagnosticDetails"));
  _0x398ccb.type = "button";
  _0x398ccb.setAttribute("aria-expanded", "false");
  _0x398ccb.addEventListener("click", () => {
    const _0x5d4cc1 = _0x30c56.hidden === true;
    _0x30c56.hidden = !_0x5d4cc1;
    _0x398ccb.setAttribute("aria-expanded", _0x5d4cc1 ? "true" : "false");
    _0x398ccb.textContent = agentPanelText(_0x5d4cc1 ? "diagnosticDetailsHide" : "diagnosticDetails");
  });
  _0x2564fc.append(_0x31fb5a, _0xb429c2, _0x395640, _0x398ccb, _0x30c56);
  _0x4348b3.appendChild(_0x2564fc);
}
function appendMessageToList(_0x1dc75f, _0x3e527c, _0x59bd63, {
  messageType = "text",
  status = "",
  task = null,
  inputRefs = [],
  diagnostic = null,
  onCopy = null,
  onImagePreview = null,
  copyIconHtml = ""
} = {}) {
  const _0x5cb3aa = String(_0x3e527c || "") === "user" ? "user" : "assistant";
  const _0x42d3b5 = ["agent-message", "agent-message--" + _0x5cb3aa];
  const _0x312bd5 = normalizeMessageClassSegment(messageType);
  if (_0x312bd5 && _0x312bd5 !== "text") {
    _0x42d3b5.push("agent-message--" + _0x312bd5);
  }
  const _0x1106ee = normalizeMessageClassSegment(status);
  if (_0x1106ee) {
    _0x42d3b5.push("agent-message--status-" + _0x1106ee);
  }
  const _0x48834c = createEl("div", _0x42d3b5.join(" "));
  const _0x4febde = String(_0x59bd63 || "");
  if (typeof HTMLElement === "undefined" || !(_0x48834c instanceof HTMLElement)) {
    _0x48834c.textContent = _0x4febde;
  }
  const _0x12c56b = createEl("div", "agent-message-body");
  _0x12c56b.textContent = _0x4febde;
  if (_0x5cb3aa === "assistant" && (!_0x312bd5 || _0x312bd5 === "text")) {
    _0x48834c.classList.add("agent-message--rich");
    const _0x346ba2 = renderMarkdownToHtml(formatAgentAssistantMarkdown(_0x4febde));
    if (_0x346ba2) {
      _0x12c56b.innerHTML = _0x346ba2;
    }
  }
  _0x48834c.appendChild(_0x12c56b);
  appendFailureDiagnostic(_0x48834c, diagnostic);
  appendMessageInputRefs(_0x48834c, inputRefs);
  appendTaskImageMedia(_0x48834c, task, {
    onImagePreview: onImagePreview
  });
  const _0x354fa2 = buildAgentMessageCopyText(_0x4febde, task);
  _0x48834c.agentMessageCopyText = _0x354fa2;
  if (_0x354fa2) {
    const _0x331534 = createEl("button", "agent-message-copy-btn");
    _0x331534.type = "button";
    _0x331534.title = agentPanelText("copyMessage");
    _0x331534.setAttribute("aria-label", agentPanelText("copyMessage"));
    _0x331534.innerHTML = copyIconHtml;
    _0x331534.addEventListener("click", _0x31a6cd => {
      _0x31a6cd.preventDefault?.();
      _0x31a6cd.stopPropagation?.();
      onCopy?.(_0x354fa2);
    });
    _0x48834c.appendChild(_0x331534);
  }
  _0x1dc75f.appendChild(_0x48834c);
  scrollAgentMessageListToEnd(_0x1dc75f);
  return _0x48834c;
}
function removeElement(_0x212e3e) {
  if (!_0x212e3e?.parentNode) {
    return;
  }
  if (typeof _0x212e3e.remove === "function") {
    _0x212e3e.remove();
    return;
  }
  const _0x5ba84b = _0x212e3e.parentNode;
  const _0x2a67b7 = _0x5ba84b.children?.indexOf?.(_0x212e3e) ?? -1;
  if (_0x2a67b7 >= 0) {
    _0x5ba84b.children.splice(_0x2a67b7, 1);
  }
  _0x212e3e.parentNode = null;
}
export function createAgentConversationPresentation({
  messagesEl: _0x4898dd,
  runStepsEl: _0x206251,
  sessionStore = null,
  getHistory = () => [],
  onCopy = null,
  onImagePreview = null,
  copyIconHtml = "",
  onMessagesChanged = null,
  onConversationInvalidated = null
} = {}) {
  if (!_0x4898dd || !_0x206251) {
    throw new TypeError("[agentConversationPresentation] messagesEl and runStepsEl are required");
  }
  let _0x487f76 = false;
  let _0x3a4e84 = false;
  let _0xf278dc = false;
  const _0x5111aa = new Set();
  let _0x363a22 = false;
  function _0x3cb682() {
    onMessagesChanged?.({
      hasMessages: _0x4898dd.children.length > 0
    });
  }
  function _0x547fef(_0x193d60, _0x2ddd4a, _0x5d57d2 = {}) {
    const _0x54ee42 = appendMessageToList(_0x4898dd, _0x193d60, _0x2ddd4a, {
      ..._0x5d57d2,
      onCopy: _0x5d57d2.onCopy || onCopy,
      onImagePreview: _0x5d57d2.onImagePreview || onImagePreview,
      copyIconHtml: _0x5d57d2.copyIconHtml || copyIconHtml
    });
    _0x3cb682();
    return _0x54ee42;
  }
  function _0x2c4f70(_0x267440 = {}) {
    return _0x547fef(_0x267440.role, _0x267440.content || _0x267440.status || "", {
      messageType: _0x267440.messageType || _0x267440.type || "text",
      status: _0x267440.status || "",
      task: _0x267440.task || null,
      inputRefs: _0x267440.inputRefs || [],
      diagnostic: _0x267440.diagnostic || null
    });
  }
  function _0x2a1209(_0x52218d = getHistory()) {
    _0x4898dd.replaceChildren();
    (Array.isArray(_0x52218d) ? _0x52218d : []).forEach(_0x273aaf => {
      appendMessageToList(_0x4898dd, _0x273aaf.role, _0x273aaf.content || _0x273aaf.status || "", {
        messageType: _0x273aaf.messageType || _0x273aaf.type || "text",
        status: _0x273aaf.status || "",
        task: _0x273aaf.task || null,
        inputRefs: _0x273aaf.inputRefs || [],
        diagnostic: _0x273aaf.diagnostic || null,
        onCopy: onCopy,
        onImagePreview: onImagePreview,
        copyIconHtml: copyIconHtml
      });
    });
    _0x3cb682();
  }
  function _0x3b51af(_0x2f7551 = {}) {
    const _0x31ef05 = buildAgentRunSteps({
      runEvents: _0x2f7551.runEvents || [],
      currentRun: _0x2f7551.currentRun || null
    });
    _0x206251.replaceChildren();
    _0x206251.hidden = _0x31ef05.length === 0;
    if (_0x31ef05.length === 0) {
      return;
    }
    const _0xb5e818 = createEl("div", "agent-run-steps-title", agentPanelText("runStepsTitle"));
    const _0xfbfa3 = createEl("div", "agent-run-steps-list");
    _0xfbfa3.setAttribute("role", "list");
    for (const _0x19f7ee of _0x31ef05) {
      const _0x1adcda = createEl("div", "agent-run-step");
      _0x1adcda.dataset.status = _0x19f7ee.status;
      _0x1adcda.setAttribute("role", "listitem");
      const _0x43b696 = createEl("span", "agent-run-step-dot");
      _0x43b696.setAttribute("aria-hidden", "true");
      _0x1adcda.append(_0x43b696, createEl("span", "agent-run-step-label", _0x19f7ee.label));
      _0xfbfa3.appendChild(_0x1adcda);
    }
    _0x206251.append(_0xb5e818, _0xfbfa3);
  }
  function _0x22a18f(_0x2e2dcd = {}) {
    const _0x2b76b6 = _0x2e2dcd.sessionProjectionParity;
    if (!_0x2b76b6 || typeof _0x2b76b6 !== "object") {
      delete _0x4898dd.dataset.sessionProjection;
      delete _0x4898dd.dataset.sessionProjectionMismatches;
      return;
    }
    _0x4898dd.dataset.sessionProjection = _0x2b76b6.ok === true ? "matched" : "mismatch";
    if (Array.isArray(_0x2b76b6.mismatches) && _0x2b76b6.mismatches.length > 0) {
      _0x4898dd.dataset.sessionProjectionMismatches = _0x2b76b6.mismatches.join(",");
    } else {
      delete _0x4898dd.dataset.sessionProjectionMismatches;
    }
  }
  function _0x54953b({
    history = getHistory(),
    sessionSnapshot = {}
  } = {}) {
    _0x2a1209(history);
    _0x3b51af(sessionSnapshot);
    _0x22a18f(sessionSnapshot);
  }
  function _0x2cc2ac() {
    const _0x161c60 = createEl("div", "agent-message agent-message--assistant agent-message--typing");
    const _0x5c2061 = createEl("span", "agent-typing-label", agentPanelText("waiting"));
    const _0x10cd03 = createEl("span", "agent-typing-dots");
    _0x10cd03.append(createEl("span"), createEl("span"), createEl("span"));
    _0x161c60.append(_0x5c2061, _0x10cd03);
    _0x4898dd.appendChild(_0x161c60);
    scrollAgentMessageListToEnd(_0x4898dd);
    _0x3cb682();
    return _0x161c60;
  }
  function _0x1e65ab(_0x17772f) {
    removeElement(_0x17772f);
    _0x3cb682();
  }
  function _0x124a8b(_0xa88ef4) {
    _0x487f76 = _0xa88ef4 === true;
    if (_0x487f76 || !_0x3a4e84 || _0x363a22) {
      return;
    }
    _0x3a4e84 = false;
    _0xf278dc = false;
    _0x5111aa.clear();
    onConversationInvalidated?.({
      historyOnly: true
    });
  }
  function _0x167c09({
    taskMessages = []
  } = {}) {
    (Array.isArray(taskMessages) ? taskMessages : []).forEach(_0x44a157 => {
      const _0x3198a0 = getTaskResultEntryKey(_0x44a157);
      if (_0x3198a0) {
        _0x5111aa.delete(_0x3198a0);
      }
    });
    _0x3a4e84 = _0xf278dc || _0x5111aa.size > 0;
  }
  let _0x969eee = true;
  const _0x4cd2c4 = sessionStore?.subscribe?.((_0x477904, _0x3b86e0 = {}) => {
    if (_0x969eee) {
      _0x969eee = false;
      return;
    }
    if (_0x363a22) {
      return;
    }
    _0x22a18f(_0x477904 || {});
    if (_0x487f76) {
      const _0x8e834 = getTaskResultEntryKey(_0x3b86e0?.entry);
      if (_0x8e834) {
        _0x3a4e84 = true;
        _0x5111aa.add(_0x8e834);
      } else if (_0x3b86e0?.type === "history" && _0x3b86e0.entry) {
        _0x3a4e84 = true;
        _0xf278dc = true;
      }
      return;
    }
    if (_0x3b86e0?.type === "history" && _0x3b86e0.entry) {
      _0x2c4f70(_0x3b86e0.entry);
      _0x3b51af(_0x477904 || {});
      return;
    }
    onConversationInvalidated?.();
  });
  return Object.freeze({
    appendEntry: _0x2c4f70,
    appendMessage: _0x547fef,
    appendWaiting: _0x2cc2ac,
    removeWaiting: _0x1e65ab,
    render: _0x54953b,
    renderMessages: _0x2a1209,
    renderRunSteps: _0x3b51af,
    setBusy: _0x124a8b,
    acknowledgeSessionState: _0x167c09,
    destroy() {
      _0x363a22 = true;
      _0x3a4e84 = false;
      _0xf278dc = false;
      _0x5111aa.clear();
      _0x4cd2c4?.();
    }
  });
}