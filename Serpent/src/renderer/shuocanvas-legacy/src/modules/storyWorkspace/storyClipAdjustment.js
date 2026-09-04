import { normalizeStoryPromptMode } from "./storyPromptModes.js";
export const STORY_CLIP_ADJUSTMENT_SCOPES = Object.freeze(["selection", "prompt", "clip"]);
export const STORY_CLIP_PROMPT_HISTORY_LIMIT = 20;
function normalizeText(_0xdaa09e) {
  return String(_0xdaa09e || "").trim();
}
export function buildStoryClipAdjustmentGenerationKey(_0x431730 = "", _0x3233f1 = "", _0x2a07c1 = "") {
  const _0x10057f = [_0x431730, _0x3233f1, _0x2a07c1].map(normalizeText);
  if (_0x10057f.every(Boolean)) {
    return JSON.stringify(_0x10057f);
  } else {
    return "";
  }
}
export function isStoryClipAdjustmentGenerating(_0x13dda9 = {}, _0x2cc6b5 = {}, _0x35161a = {}) {
  const _0x2f0829 = buildStoryClipAdjustmentGenerationKey(_0x13dda9?.data?.project?.id, _0x2cc6b5?.id, _0x35161a?.id);
  return Boolean(_0x2f0829 && Array.isArray(_0x13dda9?.clipAdjustmentGeneratingIds) && _0x13dda9.clipAdjustmentGeneratingIds.includes(_0x2f0829));
}
function normalizeDurationSeconds(_0xad0307) {
  const _0x195b84 = String(_0xad0307 ?? "").match(/\d+(?:\.\d+)?/);
  const _0x584967 = Number(_0x195b84?.[0]);
  if (Number.isFinite(_0x584967) && _0x584967 > 0) {
    return Number(_0x584967.toFixed(1));
  } else {
    return 0;
  }
}
function formatDurationSeconds(_0x40b689) {
  const _0x30e973 = normalizeDurationSeconds(_0x40b689);
  if (_0x30e973 > 0) {
    return _0x30e973.toFixed(1) + "s";
  } else {
    return "";
  }
}
function hashPromptHistoryValue(_0xbb51da) {
  let _0x473e53 = 2166136261;
  const _0x303ffa = String(_0xbb51da || "");
  for (let _0x5ba4e5 = 0; _0x5ba4e5 < _0x303ffa.length; _0x5ba4e5 += 1) {
    _0x473e53 ^= _0x303ffa.charCodeAt(_0x5ba4e5);
    _0x473e53 = Math.imul(_0x473e53, 16777619);
  }
  return (_0x473e53 >>> 0).toString(36);
}
function getPromptHistoryEntryKey(_0x317203 = {}) {
  return [normalizeText(_0x317203.promptHtml), normalizeStoryPromptMode(_0x317203.promptMode, {
    allowDeveloperModes: true
  }), normalizeDurationSeconds(_0x317203.durationSec || _0x317203.duration)].join("\0");
}
export function normalizeStoryClipPromptHistory(_0x3c760b = []) {
  const _0x4fbaa6 = [];
  const _0x3c5e1b = new Set();
  for (const _0x3ff238 of Array.isArray(_0x3c760b) ? _0x3c760b : []) {
    if (!_0x3ff238 || typeof _0x3ff238 !== "object") {
      continue;
    }
    const _0x1a7a7f = normalizeText(_0x3ff238.promptHtml || _0x3ff238.prompt);
    if (!_0x1a7a7f) {
      continue;
    }
    const _0x36d6e7 = normalizeStoryPromptMode(_0x3ff238.promptMode, {
      allowDeveloperModes: true
    });
    const _0x2314c6 = normalizeDurationSeconds(_0x3ff238.durationSec || _0x3ff238.durationSeconds || _0x3ff238.duration);
    const _0x50366b = Number(_0x3ff238.savedAt || _0x3ff238.createdAt);
    const _0x33f666 = Number.isFinite(_0x50366b) && _0x50366b > 0 ? Math.trunc(_0x50366b) : 0;
    const _0x350f7c = {
      id: normalizeText(_0x3ff238.id) || "prompt-history-" + _0x33f666 + "-" + hashPromptHistoryValue(_0x1a7a7f + "\0" + _0x36d6e7 + "\0" + _0x2314c6),
      promptHtml: _0x1a7a7f,
      promptMode: _0x36d6e7,
      durationSec: _0x2314c6,
      duration: _0x2314c6 > 0 ? formatDurationSeconds(_0x2314c6) : normalizeText(_0x3ff238.duration),
      instruction: normalizeText(_0x3ff238.instruction),
      source: normalizeText(_0x3ff238.source) || "ai-adjustment",
      savedAt: _0x33f666
    };
    const _0x2d3d45 = getPromptHistoryEntryKey(_0x350f7c);
    if (_0x3c5e1b.has(_0x2d3d45)) {
      continue;
    }
    _0x3c5e1b.add(_0x2d3d45);
    _0x4fbaa6.push(_0x350f7c);
    if (_0x4fbaa6.length >= STORY_CLIP_PROMPT_HISTORY_LIMIT) {
      break;
    }
  }
  return _0x4fbaa6;
}
export function createStoryClipPromptHistoryEntry(_0xeb20a4, {
  instruction = "",
  promptMode = "",
  source = "ai-adjustment",
  savedAt = Date.now()
} = {}) {
  const _0x424690 = normalizeText(_0xeb20a4?.prompt);
  if (!_0x424690) {
    return null;
  }
  const _0x17767c = normalizeStoryPromptMode(promptMode || _0xeb20a4?.promptMode, {
    allowDeveloperModes: true
  });
  const _0x3a41d6 = normalizeDurationSeconds(_0xeb20a4?.durationSec || _0xeb20a4?.durationSeconds || _0xeb20a4?.duration);
  const _0x475be8 = Number.isFinite(Number(savedAt)) && Number(savedAt) > 0 ? Math.trunc(Number(savedAt)) : Date.now();
  return {
    id: "prompt-history-" + _0x475be8 + "-" + hashPromptHistoryValue(_0x424690 + "\0" + _0x17767c + "\0" + _0x3a41d6),
    promptHtml: _0x424690,
    promptMode: _0x17767c,
    durationSec: _0x3a41d6,
    duration: _0x3a41d6 > 0 ? formatDurationSeconds(_0x3a41d6) : normalizeText(_0xeb20a4?.duration),
    instruction: normalizeText(instruction),
    source: normalizeText(source) || "ai-adjustment",
    savedAt: _0x475be8
  };
}
export function saveCurrentStoryClipPromptToHistory(_0xf0d303, _0xd14ec5 = {}) {
  if (!_0xf0d303 || typeof _0xf0d303 !== "object") {
    return null;
  }
  const _0x5d949f = createStoryClipPromptHistoryEntry(_0xf0d303, _0xd14ec5);
  if (!_0x5d949f) {
    return null;
  }
  _0xf0d303.promptHistory = normalizeStoryClipPromptHistory([_0x5d949f, ...normalizeStoryClipPromptHistory(_0xf0d303.promptHistory)]);
  return _0x5d949f;
}
export function restoreStoryClipPromptHistoryEntry(_0x399827, _0x2d9f35, _0x367994 = Date.now()) {
  if (!_0x399827 || typeof _0x399827 !== "object") {
    return null;
  }
  const _0x8352e2 = normalizeStoryClipPromptHistory(_0x399827.promptHistory);
  const _0x1656fa = _0x8352e2.find(_0x2bbcfd => _0x2bbcfd.id === normalizeText(_0x2d9f35));
  if (!_0x1656fa) {
    return null;
  }
  const _0x3cce0d = createStoryClipPromptHistoryEntry(_0x399827, {
    instruction: "恢复历史版本前自动保存",
    source: "history-restore",
    savedAt: _0x367994
  });
  _0x399827.prompt = _0x1656fa.promptHtml;
  _0x399827.promptMode = _0x1656fa.promptMode;
  if (_0x1656fa.durationSec > 0) {
    _0x399827.durationSec = _0x1656fa.durationSec;
    _0x399827.duration = formatDurationSeconds(_0x1656fa.durationSec);
  }
  _0x399827.promptHistory = normalizeStoryClipPromptHistory([_0x3cce0d, ..._0x8352e2.filter(_0x2eb586 => _0x2eb586.id !== _0x1656fa.id)].filter(Boolean));
  _0x399827.promptAdjustment = {
    ...getAdjustmentState(_0x399827),
    candidate: null,
    lastApplied: null
  };
  return _0x1656fa;
}
function normalizePromptText(_0x4e864e) {
  return String(_0x4e864e || "").replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();
}
function normalizePromptTextRaw(_0x3ad57d) {
  return String(_0x3ad57d || "").replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ");
}
function getNodeChildren(_0x214f47) {
  return Array.from(_0x214f47?.childNodes || []);
}
function getNodeTagName(_0x2b66f3) {
  return String(_0x2b66f3?.tagName || _0x2b66f3?.nodeName || "").toLowerCase();
}
function nodeHasClass(_0x5a9403, _0x11b3c8) {
  if (_0x5a9403?.classList?.contains?.(_0x11b3c8)) {
    return true;
  }
  return String(_0x5a9403?.className || "").split(/\s+/).includes(_0x11b3c8);
}
function getNodeData(_0xa8cff6, _0x56bf1d, _0x15d8f2) {
  return String(_0xa8cff6?.dataset?.[_0x56bf1d] || _0xa8cff6?.getAttribute?.(_0x15d8f2) || "").trim();
}
function serializeStoryPromptNode(_0x1a62d9) {
  if (!_0x1a62d9) {
    return "";
  }
  if (Number(_0x1a62d9.nodeType) === 3) {
    return String(_0x1a62d9.textContent || "");
  }
  if (nodeHasClass(_0x1a62d9, "ref-pill")) {
    const _0x4d6a64 = getNodeData(_0x1a62d9, "label", "data-label") || normalizeText(_0x1a62d9.textContent);
    const _0x4e5bf0 = getNodeData(_0x1a62d9, "promptPillKind", "data-prompt-pill-kind");
    const _0x5f21df = getNodeData(_0x1a62d9, "assetId", "data-asset-id");
    if (_0x4e5bf0 === "time" || _0x5f21df === "story-meta:time") {
      if (_0x4d6a64) {
        return "⏱ " + _0x4d6a64;
      } else {
        return "";
      }
    }
    if (!_0x4d6a64) {
      return "";
    }
    if (_0x4d6a64.startsWith("@")) {
      return _0x4d6a64;
    } else {
      return "@" + _0x4d6a64;
    }
  }
  const _0x35d3d1 = getNodeTagName(_0x1a62d9);
  if (_0x35d3d1 === "br") {
    return "\n";
  }
  const _0x4012dd = getNodeChildren(_0x1a62d9).map(serializeStoryPromptNode).join("");
  if (["div", "p", "section", "article", "blockquote", "li"].includes(_0x35d3d1)) {
    return _0x4012dd + "\n";
  } else {
    return _0x4012dd;
  }
}
export function serializeStoryClipPromptElement(_0x475645) {
  return normalizePromptText(serializeStoryPromptNode(_0x475645));
}
export function getStoryClipPromptLockedTokens(_0x3d1584) {
  const _0x23ec2a = [];
  const _0x1205f8 = [];
  const _0x2e52a0 = new Set();
  const _0x4c7d29 = new Set();
  _0x3d1584?.querySelectorAll?.(".ref-pill")?.forEach?.(_0x301e38 => {
    const _0x2a48e2 = normalizeText(serializeStoryPromptNode(_0x301e38));
    if (!_0x2a48e2) {
      return;
    }
    const _0x222f24 = getNodeData(_0x301e38, "promptPillKind", "data-prompt-pill-kind");
    const _0x20fb75 = getNodeData(_0x301e38, "assetId", "data-asset-id");
    const _0x386b7d = _0x222f24 === "time" || _0x20fb75 === "story-meta:time";
    const _0x40729b = _0x386b7d ? _0x1205f8 : _0x23ec2a;
    const _0x29ae71 = _0x386b7d ? _0x4c7d29 : _0x2e52a0;
    if (_0x29ae71.has(_0x2a48e2)) {
      return;
    }
    _0x29ae71.add(_0x2a48e2);
    _0x40729b.push(_0x2a48e2);
  });
  return {
    assetTokens: _0x23ec2a,
    durationTokens: _0x1205f8
  };
}
function isNodeInside(_0x2cf7c4, _0x372366) {
  if (!_0x2cf7c4 || !_0x372366) {
    return false;
  }
  return _0x2cf7c4 === _0x372366 || _0x2cf7c4.contains?.(_0x372366) === true;
}
export function captureStoryClipPromptSelection({
  promptEl: _0x54bc1b,
  selection: _0x415b6f,
  documentObject = globalThis.document
} = {}) {
  if (!_0x54bc1b || !_0x415b6f || _0x415b6f.rangeCount < 1 || _0x415b6f.isCollapsed) {
    return null;
  }
  const _0x2afdca = _0x415b6f.getRangeAt(0);
  if (!isNodeInside(_0x54bc1b, _0x2afdca.startContainer) || !isNodeInside(_0x54bc1b, _0x2afdca.endContainer)) {
    return null;
  }
  const _0x1acb07 = normalizePromptTextRaw(serializeStoryPromptNode(_0x2afdca.cloneContents?.()));
  const _0x4550ac = _0x1acb07.trim();
  if (!_0x4550ac) {
    return null;
  }
  const _0x4266e7 = normalizePromptTextRaw(serializeStoryPromptNode(_0x54bc1b));
  const _0x502605 = _0x4266e7.trim();
  if (!_0x502605) {
    return null;
  }
  let _0x5028b4 = -1;
  if (typeof documentObject?.createRange === "function") {
    const _0x5eefed = documentObject.createRange();
    _0x5eefed.selectNodeContents(_0x54bc1b);
    _0x5eefed.setEnd(_0x2afdca.startContainer, _0x2afdca.startOffset);
    const _0x368577 = normalizePromptTextRaw(serializeStoryPromptNode(_0x5eefed.cloneContents?.()));
    const _0x358f91 = _0x4266e7.length - _0x4266e7.trimStart().length;
    const _0x394da7 = _0x1acb07.length - _0x1acb07.trimStart().length;
    _0x5028b4 = _0x368577.length + _0x394da7 - _0x358f91;
  }
  if (_0x5028b4 < 0 || _0x502605.slice(_0x5028b4, _0x5028b4 + _0x4550ac.length) !== _0x4550ac) {
    _0x5028b4 = _0x502605.indexOf(_0x4550ac);
  }
  if (_0x5028b4 < 0) {
    return null;
  }
  return {
    start: _0x5028b4,
    end: _0x5028b4 + _0x4550ac.length,
    text: _0x4550ac,
    sourcePromptText: _0x502605
  };
}
export function normalizeStoryClipAdjustmentScope(_0x2e65a9, _0x3f387c = false) {
  const _0x346780 = normalizeText(_0x2e65a9);
  if (_0x346780 === "selection" && !_0x3f387c) {
    return "prompt";
  }
  if (STORY_CLIP_ADJUSTMENT_SCOPES.includes(_0x346780)) {
    return _0x346780;
  } else {
    return "prompt";
  }
}
export function buildStoryClipAdjustmentCandidateText({
  sourcePromptText = "",
  generatedText = "",
  scope = "prompt",
  selection = null
} = {}) {
  const _0x3ad218 = normalizePromptText(sourcePromptText);
  const _0x1ceaef = normalizePromptText(generatedText);
  if (!_0x3ad218) {
    throw new Error("当前片段还没有可调整的视频提示词。");
  }
  if (!_0x1ceaef) {
    throw new Error("AI 没有返回可用的候选内容。");
  }
  if (normalizeStoryClipAdjustmentScope(scope, Boolean(selection)) !== "selection") {
    return _0x1ceaef;
  }
  const _0x1dc772 = Math.max(0, Math.trunc(Number(selection?.start) || 0));
  const _0x510d41 = Math.max(_0x1dc772, Math.trunc(Number(selection?.end) || _0x1dc772));
  if (_0x510d41 > _0x3ad218.length || !normalizeText(_0x3ad218.slice(_0x1dc772, _0x510d41))) {
    throw new Error("选中文字已经变化，请重新选择后再调整。");
  }
  return normalizePromptText("" + _0x3ad218.slice(0, _0x1dc772) + _0x1ceaef + _0x3ad218.slice(_0x510d41));
}
function getAdjustmentState(_0x172bf7) {
  if (_0x172bf7?.promptAdjustment && typeof _0x172bf7.promptAdjustment === "object") {
    return _0x172bf7.promptAdjustment;
  } else {
    return {};
  }
}
export function setStoryClipAdjustmentCandidate(_0x13b5b3, _0x15aa40) {
  if (!_0x13b5b3 || typeof _0x13b5b3 !== "object" || !_0x15aa40?.promptHtml) {
    return false;
  }
  _0x13b5b3.promptAdjustment = {
    ...getAdjustmentState(_0x13b5b3),
    candidate: {
      ..._0x15aa40
    }
  };
  return true;
}
export function discardStoryClipAdjustmentCandidate(_0x35a96d) {
  if (!_0x35a96d || typeof _0x35a96d !== "object") {
    return false;
  }
  const _0x3e83d8 = getAdjustmentState(_0x35a96d);
  if (!_0x3e83d8.candidate) {
    return false;
  }
  _0x35a96d.promptAdjustment = {
    ..._0x3e83d8,
    candidate: null
  };
  return true;
}
export function applyStoryClipAdjustmentCandidate(_0x2d6c48, _0x110788 = Date.now()) {
  const _0x3064f5 = getAdjustmentState(_0x2d6c48).candidate;
  if (!_0x2d6c48 || !_0x3064f5?.promptHtml) {
    return false;
  }
  const _0x299244 = String(_0x2d6c48.prompt || "");
  const _0x484f8e = String(_0x2d6c48.duration || "");
  const _0x484c93 = normalizeDurationSeconds(_0x2d6c48.durationSec || _0x2d6c48.durationSeconds || _0x2d6c48.duration);
  const _0x46364c = normalizeDurationSeconds(_0x3064f5.candidateDurationSeconds);
  const _0x3f6c8e = normalizeStoryPromptMode(_0x3064f5.sourcePromptMode || _0x2d6c48.promptMode, {
    allowDeveloperModes: true
  });
  const _0x1b3daa = normalizeStoryPromptMode(_0x3064f5.targetPromptMode || _0x3f6c8e, {
    allowDeveloperModes: true
  });
  const _0x222a54 = normalizeText(_0x3064f5.promptHtml) !== normalizeText(_0x299244) || _0x1b3daa !== _0x3f6c8e || _0x46364c > 0 && _0x46364c !== _0x484c93;
  if (_0x222a54) {
    saveCurrentStoryClipPromptToHistory(_0x2d6c48, {
      instruction: _0x3064f5.instruction,
      promptMode: _0x3f6c8e,
      source: "ai-adjustment",
      savedAt: _0x110788
    });
  }
  _0x2d6c48.prompt = String(_0x3064f5.promptHtml);
  _0x2d6c48.promptMode = _0x1b3daa;
  if (_0x46364c > 0) {
    _0x2d6c48.durationSec = _0x46364c;
    _0x2d6c48.duration = formatDurationSeconds(_0x46364c);
  }
  _0x2d6c48.promptAdjustment = {
    candidate: null,
    lastApplied: {
      previousPromptHtml: _0x299244,
      appliedPromptHtml: _0x2d6c48.prompt,
      previousDuration: _0x484f8e,
      previousDurationSec: _0x484c93,
      appliedDuration: String(_0x2d6c48.duration || ""),
      appliedDurationSec: normalizeDurationSeconds(_0x2d6c48.durationSec || _0x2d6c48.duration),
      instruction: normalizeText(_0x3064f5.instruction),
      previousPromptMode: _0x3f6c8e,
      appliedPromptMode: _0x1b3daa,
      scope: normalizeStoryClipAdjustmentScope(_0x3064f5.scope),
      appliedAt: Number(_0x110788) || Date.now()
    }
  };
  return true;
}
export function undoStoryClipAdjustment(_0xaac6d1) {
  const _0x47f5ac = getAdjustmentState(_0xaac6d1);
  if (!_0xaac6d1 || !_0x47f5ac.lastApplied?.previousPromptHtml) {
    return false;
  }
  _0xaac6d1.prompt = String(_0x47f5ac.lastApplied.previousPromptHtml);
  _0xaac6d1.promptMode = normalizeStoryPromptMode(_0x47f5ac.lastApplied.previousPromptMode || _0xaac6d1.promptMode, {
    allowDeveloperModes: true
  });
  const _0x364a12 = normalizeDurationSeconds(_0x47f5ac.lastApplied.previousDurationSec || _0x47f5ac.lastApplied.previousDuration);
  if (_0x364a12 > 0) {
    _0xaac6d1.durationSec = _0x364a12;
    _0xaac6d1.duration = formatDurationSeconds(_0x364a12);
  }
  _0xaac6d1.promptAdjustment = {
    candidate: _0x47f5ac.candidate || null,
    lastApplied: null
  };
  return true;
}
export function clearStoryClipAdjustmentUndo(_0x9fe52) {
  const _0xfe90b5 = getAdjustmentState(_0x9fe52);
  if (!_0x9fe52 || !_0xfe90b5.lastApplied) {
    return false;
  }
  _0x9fe52.promptAdjustment = {
    ..._0xfe90b5,
    lastApplied: null
  };
  return true;
}