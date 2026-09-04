import { findTextModelMenuItem } from "../../components/aigenText/apimartTextModelMenu.js";
import { bindAIGenTextModelSelector, buildAIGenTextModelMenuMarkup } from "../../components/aigenText/modelSelector.js";
import { createPromptAttachmentButtonHTML } from "../../components/refAttachmentButton.js";
import { closeNodeFooterMenus } from "../../components/shared/nodeFooterControls.js";
import { getLocale, onLocaleChange } from "../../i18n/index.js";
import { openImagePreview } from "../imagePreview.js";
import { createLinkCursor, getCursorSize } from "../cursorUtils.js";
import { createReferenceFallbackThumbElement } from "../referenceThumbnailFallback.js";
import { showContextMenu } from "../interaction/contextMenuPresenter.js";
import { AGENT_CONVERSATION_INPUT_REF_LIMIT as a832_0x321a57, createAgentConversationPresentation, normalizeAgentRenderableMediaUrl as a832_0xe4d0af } from "./agentConversationPresentation.js";
import { AGENT_PANEL_LOCALES as a832_0x3e3231, agentPanelText as a832_0x15436d, formatAgentPanelText as a832_0x532d52 } from "./agentPanelText.js";
export { formatAgentAssistantMarkdown } from "./agentConversationPresentation.js";
const AGENT_QUICK_ACTIONS = Object.freeze([{
  id: "expand-prompt",
  labelKey: "quickActionCanvasReviewLabel",
  promptKey: "quickActionCanvasReviewPrompt"
}, {
  id: "canvas-gap-check",
  labelKey: "quickActionGapCheckLabel",
  promptKey: "quickActionGapCheckPrompt"
}, {
  id: "storyboard-plan",
  labelKey: "quickActionStoryboardLabel",
  promptKey: "quickActionStoryboardPrompt"
}, {
  id: "selected-node-tune",
  labelKey: "quickActionSelectedTuneLabel",
  promptKey: "quickActionSelectedTunePrompt"
}]);
const AGENT_LEGACY_QUICK_ACTIONS = Object.freeze([{
  id: "expand-prompt",
  labelKey: "legacyQuickActionExpandPromptLabel",
  promptKey: "legacyQuickActionExpandPromptPrompt"
}, {
  id: "storyboard-plan",
  labelKey: "legacyQuickActionStoryboardLabel",
  promptKey: "legacyQuickActionStoryboardPrompt"
}, {
  id: "canvas-gap-check",
  labelKey: "legacyQuickActionGapCheckLabel",
  promptKey: "legacyQuickActionGapCheckPrompt"
}]);
const PLACEHOLDER_ACTION_MESSAGES = Object.freeze({
  upload: "placeholderUpload",
  custom: "placeholderCustom"
});
const AGENT_PANEL_WIDTH_STORAGE_KEY = "aiCanvas.agentSidebarWidth.v1";
const AGENT_CUSTOM_QUICK_ACTIONS_STORAGE_KEY = "aiCanvas.agentCustomQuickActions.v1";
const AGENT_CUSTOM_QUICK_ACTIONS_SEEDED_STORAGE_KEY = "aiCanvas.agentCustomQuickActionsSeeded.v1";
const AGENT_CUSTOM_QUICK_ACTIONS_VERSION_STORAGE_KEY = "aiCanvas.agentCustomQuickActionsVersion.v1";
const AGENT_CUSTOM_QUICK_ACTIONS_VERSION = "canvas-defaults-v2";
const AGENT_PANEL_WIDTH_LIMITS = Object.freeze({
  min: 560,
  max: 860
});
const AGENT_CUSTOM_QUICK_ACTION_LIMIT = 8;
const AGENT_NOTICE_AUTO_HIDE_MS = 3200;
function createEl(_0xbb3319, _0x3bede5 = "", _0x112035 = "") {
  const _0x1772b9 = document.createElement(_0xbb3319);
  if (_0x3bede5) {
    _0x1772b9.className = _0x3bede5;
  }
  if (_0x112035) {
    _0x1772b9.textContent = _0x112035;
  }
  return _0x1772b9;
}
function createButton(_0x3c4991, _0x484558, {
  title = "",
  icon = "",
  disabled = false
} = {}) {
  const _0x2b2366 = createEl("button", _0x3c4991);
  _0x2b2366.type = "button";
  if (title) {
    _0x2b2366.title = title;
    _0x2b2366.setAttribute("aria-label", title);
  }
  if (icon) {
    _0x2b2366.innerHTML = icon;
    if (_0x484558) {
      const _0x15be6c = createEl("span", "agent-btn-label", _0x484558);
      _0x2b2366.appendChild(_0x15be6c);
    }
  } else {
    _0x2b2366.textContent = _0x484558;
  }
  _0x2b2366.disabled = disabled;
  if (disabled) {
    _0x2b2366.setAttribute("aria-disabled", "true");
  }
  return _0x2b2366;
}
function iconSvg(_0x2e1797) {
  const _0x1a9358 = "viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"";
  const _0x22d999 = {
    plus: "<path d=\"M12 5v14\"></path><path d=\"M5 12h14\"></path>",
    history: "<path d=\"M21 12a9 9 0 1 1-3-6.7\"></path><path d=\"M21 3v6h-6\"></path><path d=\"M12 7v5l3 2\"></path>",
    close: "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>",
    send: "<path d=\"M12 19V5\"></path><path d=\"m5 12 7-7 7 7\"></path>",
    stop: "<g class=\"v2-task-cancel-spin\"><path d=\"M21 12a9 9 0 1 1-6.219-8.56\"></path></g><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\" fill=\"currentColor\" stroke=\"none\"></rect>",
    cursor: "<path d=\"m4 4 7.5 16 2.5-6 6-2.5L4 4Z\"></path>",
    grid: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect>",
    scan: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"></path><path d=\"M16 3h3a2 2 0 0 1 2 2v3\"></path><path d=\"M8 21H5a2 2 0 0 1-2-2v-3\"></path><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"></path><path d=\"M9 12h6\"></path>",
    flow: "<path d=\"M6 3v6\"></path><path d=\"M18 15v6\"></path><circle cx=\"6\" cy=\"15\" r=\"3\"></circle><circle cx=\"18\" cy=\"9\" r=\"3\"></circle><path d=\"M9 15h3a3 3 0 0 0 3-3V9\"></path>",
    model: "<path d=\"M13 2 3 14h8l-1 8 11-14h-8l0-6Z\"></path>",
    mode: "<path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"m4.93 4.93 2.83 2.83\"></path><path d=\"m16.24 16.24 2.83 2.83\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path><path d=\"m4.93 19.07 2.83-2.83\"></path><path d=\"m16.24 7.76 2.83-2.83\"></path>",
    check: "<path d=\"m20 6-11 11-5-5\"></path>",
    upload: "<path d=\"M12 16V4\"></path><path d=\"m7 9 5-5 5 5\"></path><path d=\"M20 20H4\"></path>",
    wand: "<path d=\"M15 4V2\"></path><path d=\"M15 10v-2\"></path><path d=\"M12 5h2\"></path><path d=\"M18 5h-2\"></path><path d=\"m5 19 14-14\"></path><path d=\"m9 15-4-4\"></path>",
    copy: "<rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"></rect><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"></path>"
  };
  return "<svg class=\"agent-icon\" width=\"18\" height=\"18\" " + _0x1a9358 + ">" + (_0x22d999[_0x2e1797] || "") + "</svg>";
}
function createAgentPromptAttachmentButton({
  title = "",
  className = ""
} = {}) {
  const _0x422763 = document.createElement("div");
  _0x422763.innerHTML = createPromptAttachmentButtonHTML({
    tooltip: title,
    stroke: "currentColor",
    fill: "var(--white-05)",
    circleFill: "currentColor"
  });
  const _0x2fc4f1 = _0x422763.firstElementChild;
  if (_0x2fc4f1) {
    className.split(/\s+/).filter(Boolean).forEach(_0x3f786a => _0x2fc4f1.classList.add(_0x3f786a));
    _0x2fc4f1.setAttribute("role", "button");
    _0x2fc4f1.tabIndex = 0;
    return _0x2fc4f1;
  }
  const _0x1e9155 = createEl("div", ["prompt-attachment-btn", className].filter(Boolean).join(" "));
  if (title) {
    _0x1e9155.title = title;
    _0x1e9155.setAttribute("aria-label", title);
  }
  _0x1e9155.setAttribute("role", "button");
  _0x1e9155.tabIndex = 0;
  const _0x21a9cf = createEl("span", "btn-icon");
  _0x21a9cf.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z\" fill=\"var(--white-05)\" /><circle cx=\"20\" cy=\"20\" r=\"2.5\" fill=\"currentColor\" /><path d=\"M12 12 Q 17 12 19 18\" stroke-dasharray=\"3 3\" /></svg>";
  _0x1e9155.appendChild(_0x21a9cf);
  return _0x1e9155;
}
function setEditorText(_0xdf9635, _0x2bea7a = "") {
  _0xdf9635.textContent = String(_0x2bea7a || "");
  _0xdf9635.dispatchEvent?.(new Event("input", {
    bubbles: true
  }));
}
function getEditorText(_0x4872f7) {
  return String(_0x4872f7?.innerText || _0x4872f7?.textContent || "").trim();
}
function truncateUiText(_0xddc2a, _0xa1d533 = 40) {
  const _0x48045c = String(_0xddc2a || "").replace(/\s+/g, " ").trim();
  if (_0x48045c.length <= _0xa1d533) {
    return _0x48045c;
  } else {
    return _0x48045c.slice(0, Math.max(0, _0xa1d533 - 3)) + "...";
  }
}
function writeJsonArrayToStorage(_0x5eca13, _0x190f93, _0x599b52) {
  try {
    _0x5eca13?.localStorage?.setItem?.(_0x190f93, JSON.stringify(_0x599b52));
  } catch {}
}
function normalizeQuickAction(_0x12a1cc = {}, _0x561d33 = "", _0x3bc70c = getLocale()) {
  const _0x43fe40 = String(_0x12a1cc.promptKey ? a832_0x15436d(_0x12a1cc.promptKey, _0x3bc70c) : _0x12a1cc.prompt || "").trim();
  if (!_0x43fe40) {
    return null;
  }
  const _0x11bd09 = String(_0x12a1cc.id || _0x561d33 || "").trim() || "custom-" + Date.now();
  const _0x5f2ff9 = _0x12a1cc.labelKey ? a832_0x15436d(_0x12a1cc.labelKey, _0x3bc70c) : _0x12a1cc.label;
  return {
    id: _0x11bd09,
    label: truncateUiText(_0x5f2ff9 || _0x43fe40, 28),
    prompt: _0x43fe40,
    custom: _0x12a1cc.custom === true
  };
}
function normalizeQuickActionList(_0x16c838 = [], _0x3d63b5 = getLocale()) {
  return _0x16c838.map((_0x682fd2, _0x101861) => normalizeQuickAction(_0x682fd2, "custom-" + _0x101861, _0x3d63b5)).filter(Boolean).slice(0, AGENT_CUSTOM_QUICK_ACTION_LIMIT);
}
function getDefaultQuickActions(_0x33e231 = getLocale()) {
  return normalizeQuickActionList(AGENT_QUICK_ACTIONS, _0x33e231);
}
function getLegacyQuickActions(_0x16c267 = getLocale()) {
  return normalizeQuickActionList(AGENT_LEGACY_QUICK_ACTIONS, _0x16c267);
}
function isSameQuickActionContent(_0x5e0bcb = {}, _0x16b3c0 = {}) {
  return String(_0x5e0bcb.id || "") === String(_0x16b3c0.id || "") && String(_0x5e0bcb.label || "") === String(_0x16b3c0.label || "") && String(_0x5e0bcb.prompt || "") === String(_0x16b3c0.prompt || "");
}
function mergeSeedQuickActions(_0x24d3f8 = []) {
  const _0x22899e = new Set();
  const _0x519016 = [];
  [...getDefaultQuickActions(), ...normalizeQuickActionList(_0x24d3f8)].forEach(_0xc54bae => {
    const _0x29c130 = String(_0xc54bae?.id || "").trim();
    if (!_0x29c130 || _0x22899e.has(_0x29c130)) {
      return;
    }
    _0x22899e.add(_0x29c130);
    _0x519016.push(_0xc54bae);
  });
  return _0x519016.slice(0, AGENT_CUSTOM_QUICK_ACTION_LIMIT);
}
function migrateQuickActionsToCurrentDefaults(_0x13f840 = []) {
  const _0x34f91a = getDefaultQuickActions();
  const _0x4f5603 = new Map(_0x34f91a.map(_0x4730a8 => [_0x4730a8.id, _0x4730a8]));
  const _0x499a09 = new Map(getLegacyQuickActions().map(_0x2a2c3f => [_0x2a2c3f.id, _0x2a2c3f]));
  const _0x2f9731 = normalizeQuickActionList(_0x13f840).map(_0x5a1fe0 => {
    const _0x465911 = _0x4f5603.get(_0x5a1fe0.id);
    const _0xf4c32 = _0x499a09.get(_0x5a1fe0.id);
    if (_0x465911 && _0xf4c32 && isSameQuickActionContent(_0x5a1fe0, _0xf4c32)) {
      return _0x465911;
    }
    return _0x5a1fe0;
  });
  const _0x2a6561 = new Set(_0x2f9731.map(_0x1e28b7 => _0x1e28b7.id));
  _0x34f91a.forEach(_0x2c3129 => {
    if (_0x2a6561.has(_0x2c3129.id)) {
      return;
    }
    if (_0x499a09.has(_0x2c3129.id)) {
      return;
    }
    _0x2f9731.push(_0x2c3129);
    _0x2a6561.add(_0x2c3129.id);
  });
  return _0x2f9731.slice(0, AGENT_CUSTOM_QUICK_ACTION_LIMIT);
}
function isKnownDefaultQuickActionContent(_0x309fb4 = {}) {
  if (_0x309fb4.custom === true) {
    return false;
  }
  return a832_0x3e3231.some(_0x4f1a37 => [...getDefaultQuickActions(_0x4f1a37), ...getLegacyQuickActions(_0x4f1a37)].some(_0x489d31 => isSameQuickActionContent(_0x309fb4, _0x489d31)));
}
function localizeStoredDefaultQuickActions(_0x595a16 = []) {
  const _0x1d2b54 = new Map(getDefaultQuickActions().map(_0x54e174 => [_0x54e174.id, _0x54e174]));
  return normalizeQuickActionList(_0x595a16).map(_0x2c2ae4 => {
    const _0x2a5587 = _0x1d2b54.get(_0x2c2ae4.id);
    if (_0x2a5587 && isKnownDefaultQuickActionContent(_0x2c2ae4)) {
      return _0x2a5587;
    } else {
      return _0x2c2ae4;
    }
  });
}
function readQuickActionsStorage(_0xe345d = globalThis.window) {
  try {
    const _0x132714 = _0xe345d?.localStorage?.getItem?.(AGENT_CUSTOM_QUICK_ACTIONS_STORAGE_KEY);
    if (_0x132714 == null) {
      return null;
    }
    const _0x53d72f = JSON.parse(_0x132714);
    if (Array.isArray(_0x53d72f)) {
      return _0x53d72f;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function markCustomQuickActionsSeeded(_0x4be241 = globalThis.window) {
  try {
    _0x4be241?.localStorage?.setItem?.(AGENT_CUSTOM_QUICK_ACTIONS_SEEDED_STORAGE_KEY, "true");
    _0x4be241?.localStorage?.setItem?.(AGENT_CUSTOM_QUICK_ACTIONS_VERSION_STORAGE_KEY, AGENT_CUSTOM_QUICK_ACTIONS_VERSION);
  } catch {}
}
function seedCustomQuickActionsIfNeeded(_0x125d0d = globalThis.window) {
  try {
    const _0x2b6973 = _0x125d0d?.localStorage?.getItem?.(AGENT_CUSTOM_QUICK_ACTIONS_SEEDED_STORAGE_KEY) === "true";
    const _0x1ea004 = _0x125d0d?.localStorage?.getItem?.(AGENT_CUSTOM_QUICK_ACTIONS_VERSION_STORAGE_KEY);
    if (_0x2b6973 && _0x1ea004 === AGENT_CUSTOM_QUICK_ACTIONS_VERSION) {
      return;
    }
    const _0x3a7fb2 = readQuickActionsStorage(_0x125d0d) || [];
    const _0x1806de = _0x2b6973 ? migrateQuickActionsToCurrentDefaults(_0x3a7fb2) : mergeSeedQuickActions(_0x3a7fb2);
    writeJsonArrayToStorage(_0x125d0d, AGENT_CUSTOM_QUICK_ACTIONS_STORAGE_KEY, _0x1806de);
    markCustomQuickActionsSeeded(_0x125d0d);
  } catch {}
}
function readCustomQuickActions(_0x3a2c86 = globalThis.window) {
  const _0x11c1f4 = readQuickActionsStorage(_0x3a2c86);
  if (_0x11c1f4 === null) {
    return getDefaultQuickActions();
  } else {
    return localizeStoredDefaultQuickActions(_0x11c1f4);
  }
}
function writeCustomQuickActions(_0x236458 = [], _0x2abba2 = globalThis.window) {
  const _0x3b5d63 = normalizeQuickActionList(_0x236458);
  writeJsonArrayToStorage(_0x2abba2, AGENT_CUSTOM_QUICK_ACTIONS_STORAGE_KEY, _0x3b5d63);
  markCustomQuickActionsSeeded(_0x2abba2);
  return _0x3b5d63;
}
function inferAgentInputKind(_0x41cd52 = "") {
  const _0x291e5d = String(_0x41cd52 || "").trim();
  if (_0x291e5d.includes("image")) {
    return "image";
  }
  if (_0x291e5d.includes("video")) {
    return "video";
  }
  if (_0x291e5d.includes("audio")) {
    return "audio";
  }
  if (_0x291e5d.includes("text")) {
    return "text";
  }
  return _0x291e5d || "node";
}
function isLikelyRenderableImageUrl(_0x281046 = "") {
  const _0x355efa = String(_0x281046 || "").trim().toLowerCase();
  if (!_0x355efa) {
    return false;
  }
  if (_0x355efa.startsWith("data:image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(_0x355efa);
}
function resolveFirstAgentThumbUrl(_0x5c1480 = [], {
  imageLikeOnly = false
} = {}) {
  for (const _0x58e0a3 of _0x5c1480) {
    const _0x40c817 = a832_0xe4d0af(_0x58e0a3);
    if (imageLikeOnly && !isLikelyRenderableImageUrl(_0x40c817)) {
      continue;
    }
    if (_0x40c817) {
      return _0x40c817;
    }
  }
  return "";
}
function getPrimaryVideoItem(_0x995388 = {}) {
  const _0x385cca = Array.isArray(_0x995388.videos) ? _0x995388.videos : [];
  if (_0x385cca.length === 0) {
    return null;
  }
  const _0x3c5da6 = Number.isFinite(Number(_0x995388.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x995388.mainVideoIndex))) : 0;
  return _0x385cca[_0x3c5da6] || _0x385cca[0] || null;
}
function resolveAgentInputRefThumbUrl(_0x5281c9 = {}, _0x2378f4 = inferAgentInputKind(_0x5281c9?.type)) {
  const _0x3a81af = String(_0x2378f4 || "").trim();
  if (_0x3a81af === "audio") {
    return resolveFirstAgentThumbUrl([_0x5281c9.thumbUrl, _0x5281c9.thumbnailUrl, _0x5281c9.imageUrl, _0x5281c9.coverUrl, _0x5281c9.posterUrl, _0x5281c9.waveformThumbUrl, _0x5281c9.waveformImageUrl, _0x5281c9.thumbLocalPath, _0x5281c9.posterLocalPath], {
      imageLikeOnly: true
    });
  }
  if (_0x3a81af === "video") {
    const _0xfa1c62 = getPrimaryVideoItem(_0x5281c9);
    return resolveFirstAgentThumbUrl([_0xfa1c62?.thumbUrl, _0xfa1c62?.thumbLocalPath, _0x5281c9.thumbUrl, _0x5281c9.thumbnailUrl, _0x5281c9.posterUrl, _0x5281c9.videoThumbSrc, _0x5281c9.firstFrameUrl, _0x5281c9.firstFrameThumbUrl, _0x5281c9.imageUrl, _0x5281c9.coverUrl, _0x5281c9.thumbLocalPath, _0x5281c9.posterLocalPath], {
      imageLikeOnly: true
    });
  }
  return resolveFirstAgentThumbUrl([_0x5281c9.thumbUrl, _0x5281c9.thumbnailUrl, _0x5281c9.imageUrl, _0x5281c9.src, _0x5281c9.coverUrl, _0x5281c9.thumbLocalPath, _0x5281c9.displayLocalPath, _0x5281c9.localPath, _0x5281c9.originalLocalPath]);
}
function normalizeAgentInputRefFromNode(_0x54a663 = {}, {
  source = "canvas"
} = {}) {
  const _0x48793f = String(_0x54a663.id || _0x54a663.nodeId || "").trim();
  if (!_0x48793f) {
    return null;
  }
  const _0x924095 = String(_0x54a663.type || "").trim();
  const _0x3e620d = inferAgentInputKind(_0x924095);
  const _0x16cc07 = truncateUiText(_0x54a663.name || _0x54a663.label || _0x54a663.title || _0x48793f, 60);
  const _0x35b883 = Number(_0x54a663.width);
  const _0xc9ff42 = Number(_0x54a663.height);
  const _0xca1310 = {
    id: _0x48793f,
    nodeId: _0x48793f,
    type: _0x924095,
    kind: _0x3e620d,
    name: _0x16cc07,
    label: _0x16cc07,
    source: source,
    thumbUrl: resolveAgentInputRefThumbUrl(_0x54a663, _0x3e620d)
  };
  if (Number.isFinite(_0x35b883) && _0x35b883 > 0) {
    _0xca1310.width = Math.round(_0x35b883);
  }
  if (Number.isFinite(_0xc9ff42) && _0xc9ff42 > 0) {
    _0xca1310.height = Math.round(_0xc9ff42);
  }
  return _0xca1310;
}
function isAgentMaterialRef(_0x28fca8 = {}) {
  return ["image", "video", "audio", "text"].includes(String(_0x28fca8.kind || ""));
}
function getImageFileFromClipboardData(_0x2925ec = null) {
  const _0x673b88 = Array.from(_0x2925ec?.files || []);
  const _0x2fed1b = _0x673b88.find(_0x435472 => String(_0x435472?.type || "").startsWith("image/"));
  if (_0x2fed1b) {
    return _0x2fed1b;
  }
  const _0x1d660f = Array.from(_0x2925ec?.items || []);
  for (const _0x32ee8e of _0x1d660f) {
    if (String(_0x32ee8e?.kind || "") !== "file") {
      continue;
    }
    if (!String(_0x32ee8e?.type || "").startsWith("image/")) {
      continue;
    }
    const _0x147e45 = _0x32ee8e.getAsFile?.();
    if (_0x147e45) {
      return _0x147e45;
    }
  }
  return null;
}
function normalizePastedImageFile(_0x2e228e = null) {
  if (!_0x2e228e || !String(_0x2e228e.type || "").startsWith("image/")) {
    return null;
  }
  if (String(_0x2e228e.name || "").trim()) {
    return _0x2e228e;
  }
  try {
    const _0x7f9e70 = String(_0x2e228e.type || "").split("/")[1] || "png";
    return new File([_0x2e228e], "agent-paste-image." + _0x7f9e70, {
      type: _0x2e228e.type
    });
  } catch {
    return _0x2e228e;
  }
}
function getStoreState(_0x173c5e) {
  return _0x173c5e?.getStateRaw?.() || _0x173c5e?.getState?.() || {};
}
function clampAgentSidebarWidth(_0x2ec8a5, _0x314cca = globalThis.window?.innerWidth) {
  const _0x278989 = Number(_0x2ec8a5);
  const _0x3557dc = Number.isFinite(Number(_0x314cca)) ? Math.max(320, Number(_0x314cca) - 24) : AGENT_PANEL_WIDTH_LIMITS.max;
  const _0x366119 = Math.min(AGENT_PANEL_WIDTH_LIMITS.max, _0x3557dc);
  const _0x483307 = Math.min(AGENT_PANEL_WIDTH_LIMITS.min, _0x366119);
  return Math.max(_0x483307, Math.min(_0x366119, _0x278989));
}
function readStoredSidebarWidth(_0x1ad979 = globalThis.window) {
  const _0x79eea0 = Number(_0x1ad979?.localStorage?.getItem?.(AGENT_PANEL_WIDTH_STORAGE_KEY));
  if (Number.isFinite(_0x79eea0) && _0x79eea0 > 0) {
    return _0x79eea0;
  } else {
    return null;
  }
}
function writeStoredSidebarWidth(_0x5682b8, _0x559368 = globalThis.window) {
  try {
    _0x559368?.localStorage?.setItem?.(AGENT_PANEL_WIDTH_STORAGE_KEY, String(Math.round(_0x5682b8)));
  } catch {}
}
export function normalizeAgentSidebarWidth(_0x15c56a, _0x364133) {
  return clampAgentSidebarWidth(_0x15c56a, _0x364133);
}
export function normalizeAgentExecutionMode(_0x42e04a) {
  if (String(_0x42e04a || "").trim() === "auto") {
    return "auto";
  } else {
    return "manual";
  }
}
export function getAgentExecutionModeLabel(_0x164209) {
  if (normalizeAgentExecutionMode(_0x164209) === "auto") {
    return a832_0x15436d("executionModeAuto");
  } else {
    return a832_0x15436d("executionModeManual");
  }
}
export function getAgentPlaceholderActionMessage(_0x2faead) {
  const _0x1204e1 = PLACEHOLDER_ACTION_MESSAGES[_0x2faead] || "placeholderFallback";
  return a832_0x15436d(_0x1204e1);
}
export function resolveAgentModelLabel(_0x4ceb5c) {
  const _0x14b49e = String(_0x4ceb5c || "").trim();
  if (!_0x14b49e) {
    return a832_0x15436d("modelSelection");
  }
  return findTextModelMenuItem(_0x14b49e)?.title || _0x14b49e;
}
export function commitAgentModelSelection(_0x3e192e, _0xa602 = {}) {
  const _0x56b6d7 = String(_0xa602.model || _0xa602.modelId || "").trim();
  const _0x4751b0 = String(_0xa602.provider || "").trim();
  if (!_0x56b6d7) {
    return null;
  }
  const _0x15ed4b = String(_0xa602.providerProfileId || "").trim();
  const _0x3bf40c = _0xa602.providerProfileIdByModel && typeof _0xa602.providerProfileIdByModel === "object" ? _0xa602.providerProfileIdByModel : {};
  return _0x3e192e?.updateSettings?.({
    model: _0x56b6d7,
    provider: _0x4751b0,
    providerProfileId: _0x15ed4b,
    providerProfileIdByModel: _0x3bf40c
  }) || {
    model: _0x56b6d7,
    provider: _0x4751b0,
    providerProfileId: _0x15ed4b,
    providerProfileIdByModel: _0x3bf40c
  };
}
function getCreateActionLabel(_0x59a8a6) {
  const _0x1ba1e7 = String(_0x59a8a6 || "");
  if (_0x1ba1e7 === "ai-image") {
    return a832_0x15436d("nodeCreateImage");
  }
  if (_0x1ba1e7 === "ai-video") {
    return a832_0x15436d("nodeCreateVideo");
  }
  if (_0x1ba1e7 === "ai-audio") {
    return a832_0x15436d("nodeCreateAudio");
  }
  if (_0x1ba1e7 === "ai-text" || _0x1ba1e7 === "source-text") {
    return a832_0x15436d("nodeCreateText");
  }
  return a832_0x15436d("nodeCreate");
}
function formatActionSummary(_0x17a7d2 = {}) {
  if (_0x17a7d2.label) {
    const _0x2e639 = [];
    if (_0x17a7d2.promptSummary) {
      _0x2e639.push("“" + _0x17a7d2.promptSummary + "”");
    }
    if (Number.isFinite(Number(_0x17a7d2.args?.gap))) {
      _0x2e639.push(a832_0x532d52("gapValue", {
        value: Number(_0x17a7d2.args.gap)
      }));
    }
    if (_0x2e639.length) {
      return _0x17a7d2.label + "：" + _0x2e639.join("，");
    } else {
      return _0x17a7d2.label;
    }
  }
  const _0x52412c = String(_0x17a7d2.type || "");
  const _0x47e179 = _0x17a7d2.args || {};
  const _0x3b2a19 = _0x52412c === "node.create" ? getCreateActionLabel(_0x47e179.type) : _0x52412c === "node.setPrompt" || _0x52412c === "node.appendPrompt" ? a832_0x15436d("nodeSetPrompt") : _0x52412c === "node.setParams" ? a832_0x15436d("nodeSetParams") : _0x52412c === "graph.connect" ? a832_0x15436d("graphConnect") : _0x52412c === "layout.arrangeRow" ? a832_0x15436d("layoutArrangeRow") : _0x52412c === "layout.align" ? a832_0x15436d("layoutAlign") : _0x52412c === "generation.run" ? a832_0x15436d("generate") : _0x52412c === "generation.runBatch" ? a832_0x15436d("generateBatch") : _0x52412c === "node.delete" ? a832_0x15436d("nodeDelete") : _0x52412c;
  const _0x1398ab = [];
  const _0x5a9264 = _0x47e179.prompt || _0x47e179.text;
  if (_0x5a9264) {
    _0x1398ab.push("“" + String(_0x5a9264).slice(0, 36) + "”");
  }
  if (Number.isFinite(Number(_0x47e179.gap))) {
    _0x1398ab.push(a832_0x532d52("gapValue", {
      value: Number(_0x47e179.gap)
    }));
  }
  if (_0x1398ab.length) {
    return _0x3b2a19 + "：" + _0x1398ab.join("，");
  } else {
    return _0x3b2a19;
  }
}
function readParamControlValue(_0x5357b9, _0x1491d9 = {}) {
  const _0x13b1b8 = String(_0x1491d9.type || "").toLowerCase();
  if (_0x13b1b8 === "toggle") {
    return _0x5357b9.checked === true;
  }
  if (_0x13b1b8 === "slider" || _0x13b1b8 === "stepper") {
    const _0x21e0e7 = Number(_0x5357b9.value);
    if (Number.isFinite(_0x21e0e7)) {
      return _0x21e0e7;
    } else {
      return _0x5357b9.value;
    }
  }
  return _0x5357b9.value;
}
function getSelectedParamOption(_0x4e21a1 = {}) {
  const _0x1f82dd = _0x4e21a1.value;
  return (Array.isArray(_0x4e21a1.options) ? _0x4e21a1.options : []).find(_0x34ae22 => String(_0x34ae22?.value ?? "") === String(_0x1f82dd ?? "")) || null;
}
function getParamOptionLabel(_0x1bf12a = {}, {
  selected = false
} = {}) {
  const _0x5a44ce = selected ? _0x1bf12a.displayLabel ?? _0x1bf12a.selectedLabel ?? _0x1bf12a.label : _0x1bf12a.label ?? _0x1bf12a.selectedLabel ?? _0x1bf12a.displayLabel;
  return String(_0x5a44ce ?? "");
}
function createParamControl(_0x173560 = {}, _0x123f02 = null, _0x43a70d = null) {
  const _0x3f9131 = String(_0x173560.id || "").trim();
  if (!_0x3f9131) {
    return null;
  }
  const _0x592dbc = createEl("div", "agent-param-control");
  _0x592dbc.dataset.agentParamId = _0x3f9131;
  const _0x2a15b5 = String(_0x173560.label || "").trim();
  if (!_0x2a15b5) {
    return null;
  }
  _0x592dbc.appendChild(createEl("span", "agent-param-label", _0x2a15b5));
  const _0x2f04ae = String(_0x173560.type || "").toLowerCase();
  let _0x17d625;
  let _0x379b8e = _0x2a15b5;
  if (Array.isArray(_0x173560.options) && _0x173560.options.length > 0) {
    _0x17d625 = createButton("agent-param-input agent-param-select-trigger", "");
    _0x17d625.value = _0x173560.value;
    _0x17d625.setAttribute("aria-haspopup", "menu");
    _0x17d625.setAttribute("aria-expanded", "false");
    const _0x56cecc = getSelectedParamOption(_0x173560);
    const _0x3f7ad6 = _0x56cecc ? getParamOptionLabel(_0x56cecc, {
      selected: true
    }) : "—";
    _0x379b8e = _0x2a15b5 + "：" + _0x3f7ad6;
    _0x17d625.append(createEl("span", "agent-param-select-value", _0x3f7ad6), createEl("span", "agent-caret agent-param-select-caret"));
    const _0x56b35e = _0x17d625.querySelector(".agent-param-select-caret");
    if (_0x56b35e) {
      _0x56b35e.innerHTML = "<svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
    }
    _0x17d625.addEventListener("click", _0x13f217 => {
      _0x13f217.preventDefault?.();
      _0x13f217.stopPropagation?.();
      _0x43a70d?.({
        trigger: _0x17d625,
        field: _0x173560,
        onSelect: _0xbc192f => _0x123f02?.(_0x3f9131, _0xbc192f, _0x173560)
      });
    });
  } else if (_0x2f04ae === "toggle") {
    _0x17d625 = createEl("input", "agent-param-input agent-param-checkbox");
    _0x17d625.type = "checkbox";
    _0x17d625.checked = _0x173560.value === true;
  } else {
    _0x17d625 = createEl("input", "agent-param-input agent-param-number");
    _0x17d625.type = _0x2f04ae === "slider" || _0x2f04ae === "stepper" ? "number" : "text";
    _0x17d625.value = String(_0x173560.value ?? "");
    if (_0x173560.min !== undefined) {
      _0x17d625.setAttribute("min", _0x173560.min);
    }
    if (_0x173560.max !== undefined) {
      _0x17d625.setAttribute("max", _0x173560.max);
    }
    if (_0x173560.step !== undefined) {
      _0x17d625.setAttribute("step", _0x173560.step);
    }
  }
  _0x17d625.dataset.agentParamId = _0x3f9131;
  _0x17d625.setAttribute("aria-label", _0x379b8e);
  if (!Array.isArray(_0x173560.options) || _0x173560.options.length === 0) {
    _0x17d625.addEventListener("change", () => {
      _0x123f02?.(_0x3f9131, readParamControlValue(_0x17d625, _0x173560), _0x173560);
    });
  }
  _0x592dbc.appendChild(_0x17d625);
  return _0x592dbc;
}
function isAdvancedEditableParam(_0x3c5c5e = {}) {
  return String(_0x3c5c5e.placement || "").trim().toLowerCase().endsWith("advanced");
}
function renderEditableParams(_0xb1c1a4, _0x3aaaf9 = [], _0x346b7c = null, _0x4f1253 = null, {
  advancedExpanded = false,
  onAdvancedExpandedChange = null
} = {}) {
  if (!Array.isArray(_0x3aaaf9) || _0x3aaaf9.length === 0) {
    return;
  }
  const _0x43cc15 = _0x3aaaf9.filter(isAdvancedEditableParam);
  const _0x227f9a = _0x3aaaf9.filter(_0x7e9c2d => !isAdvancedEditableParam(_0x7e9c2d));
  const _0x55073c = createEl("div", "agent-param-editor");
  _0x55073c.appendChild(createEl("div", "agent-plan-group-title", a832_0x15436d("editableParams")));
  const _0x3453c8 = (_0x377eec, _0x3d13e1 = "agent-param-list") => {
    if (_0x377eec.length === 0) {
      return null;
    }
    const _0x23d3ce = createEl("div", _0x3d13e1);
    _0x377eec.map(_0x3cf56f => createParamControl(_0x3cf56f, _0x346b7c, _0x4f1253)).filter(Boolean).forEach(_0x1c9661 => _0x23d3ce.appendChild(_0x1c9661));
    _0x55073c.appendChild(_0x23d3ce);
    return _0x23d3ce;
  };
  _0x3453c8(_0x227f9a);
  if (_0x43cc15.length > 0) {
    const _0x3e9419 = createEl("button", "agent-param-advanced-toggle");
    _0x3e9419.type = "button";
    _0x3e9419.setAttribute("aria-expanded", advancedExpanded ? "true" : "false");
    _0x3e9419.append(createEl("span", "agent-param-advanced-label", a832_0x15436d("advancedSettings")), createEl("span", "agent-param-advanced-caret", "⌄"));
    _0x3e9419.querySelector(".agent-param-advanced-caret")?.setAttribute("aria-hidden", "true");
    _0x55073c.appendChild(_0x3e9419);
    const _0x305441 = _0x3453c8(_0x43cc15, "agent-param-list agent-param-advanced-list");
    _0x305441.hidden = !advancedExpanded;
    _0x3e9419.addEventListener("click", () => {
      const _0x705811 = _0x305441.hidden;
      _0x305441.hidden = !_0x705811;
      _0x3e9419.setAttribute("aria-expanded", _0x705811 ? "true" : "false");
      onAdvancedExpandedChange?.(_0x705811);
    });
  } else {
    onAdvancedExpandedChange?.(false);
  }
  _0xb1c1a4.appendChild(_0x55073c);
}
function renderActionGroup(_0x2a27db, _0x3b3c43, _0xe6b6b9 = []) {
  if (!Array.isArray(_0xe6b6b9) || _0xe6b6b9.length === 0) {
    return;
  }
  const _0x589c84 = createEl("div", "agent-plan-group");
  _0x589c84.appendChild(createEl("div", "agent-plan-group-title", _0x3b3c43));
  const _0x31d072 = createEl("div", "agent-plan-list");
  _0xe6b6b9.forEach(_0x4c9ad3 => {
    _0x31d072.appendChild(createEl("div", "agent-plan-item", formatActionSummary(_0x4c9ad3)));
  });
  _0x589c84.appendChild(_0x31d072);
  _0x2a27db.appendChild(_0x589c84);
}
function renderTraceSummary(_0x1151dc, _0x547b21, _0x331347 = []) {
  if (!Array.isArray(_0x331347) || _0x331347.length === 0) {
    return;
  }
  const _0x4b92cd = createEl("div", "agent-plan-group");
  _0x4b92cd.appendChild(createEl("div", "agent-plan-group-title", _0x547b21));
  const _0x4d2f20 = createEl("div", "agent-plan-list");
  _0x331347.forEach(_0x41ba21 => {
    _0x4d2f20.appendChild(createEl("div", "agent-plan-item", _0x41ba21));
  });
  _0x4b92cd.appendChild(_0x4d2f20);
  _0x1151dc.appendChild(_0x4b92cd);
}
function renderPlanPreview(_0x2d2437, _0x41128c, {
  onParamChange = null,
  onOpenParamOptions = null
} = {}) {
  _0x2d2437.replaceChildren();
  if (!_0x41128c) {
    delete _0x2d2437.dataset.agentAdvancedExpanded;
    _0x2d2437.hidden = true;
    return;
  }
  const _0x4c93bf = _0x41128c.confirmationSummary || null;
  const _0x5048d4 = Array.isArray(_0x41128c.actions) ? _0x41128c.actions : [];
  if (!_0x4c93bf && _0x5048d4.length === 0) {
    _0x2d2437.hidden = true;
    return;
  }
  _0x2d2437.hidden = false;
  const _0x3da39f = createEl("div", "agent-plan-title", a832_0x15436d("confirmTitle"));
  const _0x451836 = createEl("div", "agent-plan-body");
  if (_0x4c93bf) {
    renderActionGroup(_0x451836, a832_0x15436d("completed"), _0x4c93bf.completedActions || []);
    renderActionGroup(_0x451836, a832_0x15436d("pending"), _0x4c93bf.pendingActions || []);
    renderTraceSummary(_0x451836, a832_0x15436d("traceSummary"), _0x4c93bf.debugTraceSummary || []);
    if (_0x4c93bf.generation) {
      const _0x149316 = createEl("div", "agent-plan-meta");
      [[a832_0x15436d("batchNodes"), Number(_0x4c93bf.generation.batchSize || 0) > 1 ? "" + _0x4c93bf.generation.batchSize : ""], [a832_0x15436d("model"), _0x4c93bf.generation.modelLabel || _0x4c93bf.generation.model || ""], [a832_0x15436d("prompt"), _0x4c93bf.generation.promptSummary || ""], [a832_0x15436d("inputSource"), _0x4c93bf.generation.inputSource || ""]].forEach(([_0x2e7fc0, _0x5ad24c]) => {
        if (!_0x5ad24c) {
          return;
        }
        const _0x38f65d = createEl("div", "agent-plan-meta-row");
        _0x38f65d.append(createEl("span", "agent-plan-meta-label", _0x2e7fc0), createEl("span", "agent-plan-meta-value", _0x5ad24c));
        _0x149316.appendChild(_0x38f65d);
      });
      _0x451836.appendChild(_0x149316);
      renderEditableParams(_0x451836, _0x4c93bf.generation.editableParams || [], onParamChange, onOpenParamOptions, {
        advancedExpanded: _0x2d2437.dataset.agentAdvancedExpanded === "true",
        onAdvancedExpandedChange: _0x3c1525 => {
          _0x2d2437.dataset.agentAdvancedExpanded = _0x3c1525 ? "true" : "false";
        }
      });
    }
    if (_0x4c93bf.cancelNotice) {
      _0x451836.appendChild(createEl("div", "agent-plan-notice", _0x4c93bf.cancelNotice));
    }
  } else {
    const _0x166b97 = createEl("div", "agent-plan-list");
    _0x5048d4.forEach(_0x2d6956 => {
      _0x166b97.appendChild(createEl("div", "agent-plan-item", formatActionSummary(_0x2d6956)));
    });
    _0x451836.appendChild(_0x166b97);
  }
  _0x2d2437.append(_0x3da39f, _0x451836);
}
function renderClarification(_0xc791a1, _0x48c4d4, _0x57be10, _0xf7d52f, _0x36890e = null, {
  onAnswer = null,
  onWaitingStart = null,
  onWaitingEnd = null
} = {}) {
  _0xc791a1.replaceChildren();
  const _0x937ffd = Array.isArray(_0x48c4d4?.options) ? _0x48c4d4.options : [];
  _0xc791a1.hidden = _0x937ffd.length === 0;
  for (const _0x1e937e of _0x937ffd) {
    const _0x22deed = createEl("button", "agent-option-btn", _0x1e937e.label);
    _0x22deed.type = "button";
    _0x22deed.addEventListener("click", async () => {
      const _0x190666 = String(_0x1e937e.label || _0x1e937e.id || "").trim();
      onAnswer?.(_0x190666);
      _0xc791a1.hidden = true;
      const _0xb0b4b5 = onWaitingStart?.();
      _0x36890e?.(true);
      try {
        const _0x2a556d = await _0x57be10.answerClarification(_0x1e937e.id, {
          displayAnswer: _0x190666
        });
        _0xf7d52f(_0x2a556d);
      } catch (_0x9f99c6) {
        _0xf7d52f({
          ok: false,
          status: "failed",
          reply: _0x9f99c6?.message || "Agent clarification failed."
        });
      } finally {
        onWaitingEnd?.(_0xb0b4b5);
        _0x36890e?.(false);
      }
    });
    _0xc791a1.appendChild(_0x22deed);
  }
}
function renderRecovery(_0x342797, _0x3730c9, _0x423a1b, _0x1a412d, _0x43f152 = null, {
  editor = null,
  setNotice = null
} = {}) {
  _0x342797.replaceChildren();
  const _0x14e254 = _0x3730c9?.recovery || null;
  const _0x5e51ed = Array.isArray(_0x14e254?.options) ? _0x14e254.options : [];
  _0x342797.hidden = _0x5e51ed.length === 0;
  if (_0x5e51ed.length === 0) {
    return;
  }
  _0x342797.appendChild(createEl("div", "agent-recovery-title", a832_0x15436d("recoveryTitle")));
  const _0xd6e111 = createEl("div", "agent-recovery-actions");
  for (const _0x50f35e of _0x5e51ed) {
    const _0x4c7d7e = createEl("button", "agent-recovery-btn", _0x50f35e.label || _0x50f35e.id);
    _0x4c7d7e.type = "button";
    _0x4c7d7e.dataset.recoveryAction = _0x50f35e.id;
    _0x4c7d7e.addEventListener("click", async () => {
      const _0x29cca8 = String(_0x50f35e.id || "");
      if (_0x29cca8 === "editPrompt") {
        setEditorText(editor, a832_0x15436d("recoveryEditPromptDraft"));
        editor?.focus?.();
        setNotice?.(a832_0x15436d("recoveryEditPromptNotice"));
        _0x342797.hidden = true;
        return;
      }
      if (_0x29cca8 === "changeModel") {
        setEditorText(editor, a832_0x15436d("recoveryChangeModelDraft"));
        editor?.focus?.();
        setNotice?.(a832_0x15436d("recoveryChangeModelNotice"));
        _0x342797.hidden = true;
        return;
      }
      if (_0x29cca8 === "editRequest") {
        setEditorText(editor, _0x50f35e.draft || "");
        editor?.focus?.();
        setNotice?.(a832_0x15436d("recoveryEditRequestNotice"));
        _0x342797.hidden = true;
        return;
      }
      _0x43f152?.(true, {
        stoppable: true
      });
      try {
        const _0x666e1 = _0x29cca8 === "keepPrepared" ? await _0x423a1b.keepPreparedPlan?.() : _0x29cca8 === "retryPlanner" ? await _0x423a1b.retryPlannerRun?.() : await _0x423a1b.retryFailedPlan?.();
        _0x1a412d(_0x666e1 || {
          ok: false,
          status: "failed",
          reply: "Recovery failed."
        });
      } catch (_0x32abc8) {
        _0x1a412d({
          ok: false,
          status: "failed",
          reply: _0x32abc8?.message || "Agent recovery failed."
        });
      } finally {
        _0x43f152?.(false, {
          stoppable: false
        });
      }
    });
    _0xd6e111.appendChild(_0x4c7d7e);
  }
  _0x342797.appendChild(_0xd6e111);
}
function formatHistoryTime(_0x5c3687) {
  const _0x273023 = new Date(Number(_0x5c3687) || Date.now());
  return _0x273023.toLocaleString(getLocale(), {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function getLastMessageSummary(_0x205851 = {}) {
  const _0x38c4f2 = Array.isArray(_0x205851.messages) ? _0x205851.messages : [];
  const _0x22f108 = _0x38c4f2[_0x38c4f2.length - 1] || null;
  return String(_0x22f108?.content || _0x205851.lastPlanSummary || _0x205851.title || "").trim();
}
function renderHistory(_0x384362, _0x3ea7c2, {
  onSelect = null,
  onDelete = null
} = {}) {
  _0x384362.replaceChildren();
  const _0x1ac5e7 = createEl("div", "agent-history-title", a832_0x15436d("historyTitle"));
  const _0x4d06d0 = _0x3ea7c2?.listConversations?.() || [];
  const _0x37c504 = _0x3ea7c2?.getActiveConversation?.() || null;
  if (!_0x4d06d0.length) {
    _0x384362.append(_0x1ac5e7, createEl("div", "agent-history-empty", a832_0x15436d("historyEmpty")));
    return;
  }
  const _0x198cb3 = createEl("div", "agent-history-list");
  _0x4d06d0.forEach(_0x1b145d => {
    const _0x1f9a56 = createEl("div", "agent-history-item");
    _0x1f9a56.dataset.conversationId = _0x1b145d.id;
    _0x1f9a56.classList.toggle("is-active", _0x1b145d.id === _0x37c504?.id);
    const _0x447be0 = createEl("button", "agent-history-main");
    _0x447be0.type = "button";
    _0x447be0.append(createEl("span", "agent-history-name", _0x1b145d.title || a832_0x15436d("newConversationFallback")), createEl("span", "agent-history-time", formatHistoryTime(_0x1b145d.updatedAt)), createEl("span", "agent-history-content", getLastMessageSummary(_0x1b145d)));
    _0x447be0.addEventListener("click", () => onSelect?.(_0x1b145d.id));
    const _0x206e8f = createButton("agent-history-delete", "×", {
      title: a832_0x15436d("historyDelete")
    });
    _0x206e8f.addEventListener("click", _0x331d32 => {
      _0x331d32.preventDefault?.();
      _0x331d32.stopPropagation?.();
      onDelete?.(_0x1b145d.id);
    });
    _0x1f9a56.append(_0x447be0, _0x206e8f);
    _0x198cb3.appendChild(_0x1f9a56);
  });
  _0x384362.append(_0x1ac5e7, _0x198cb3);
}
function isAgentPopoverOpen(_0x2a7822) {
  if (!_0x2a7822) {
    return false;
  }
  if (_0x2a7822.classList?.contains("agent-history-popover")) {
    return _0x2a7822.hidden !== true;
  }
  return _0x2a7822.classList?.contains("show");
}
function hideAgentPopover(_0x39ad01) {
  if (!_0x39ad01) {
    return;
  }
  if (_0x39ad01.classList?.contains("agent-history-popover")) {
    _0x39ad01.hidden = true;
    _0x39ad01.classList?.remove?.("show");
    return;
  }
  _0x39ad01.classList?.remove?.("show");
}
function showAgentPopover(_0x52f0e1) {
  if (!_0x52f0e1) {
    return;
  }
  if (_0x52f0e1.classList?.contains("agent-history-popover")) {
    _0x52f0e1.hidden = false;
    _0x52f0e1.classList?.add?.("show");
    return;
  }
  _0x52f0e1.classList?.add?.("show");
}
function closeFloatingMenus(_0x130623, _0x56f4b5 = null) {
  _0x130623?.querySelectorAll?.(".agent-floating-menu.show, .agent-model-menu.show, .agent-history-popover")?.forEach(_0x304a77 => {
    if (_0x304a77 !== _0x56f4b5) {
      hideAgentPopover(_0x304a77);
    }
  });
  if (!_0x56f4b5) {
    closeNodeFooterMenus(_0x130623);
  }
}
function setMenuOpen(_0x171bda, _0x499902, _0x678ccc) {
  closeFloatingMenus(_0x678ccc, _0x499902 ? _0x171bda : null);
  if (_0x499902) {
    showAgentPopover(_0x171bda);
  } else {
    hideAgentPopover(_0x171bda);
  }
}
function isAgentMenuSurface(_0x2c749b) {
  return !!_0x2c749b?.closest?.(".agent-menu-wrap, .agent-floating-menu, .agent-model-menu, .agent-history-popover, .agent-history-btn");
}
function hasOpenFloatingMenus(_0x1e2d45) {
  return Array.from(_0x1e2d45?.querySelectorAll?.(".agent-floating-menu.show, .agent-model-menu.show, .agent-history-popover") || []).some(isAgentPopoverOpen);
}
export function initAgentPanel({
  runtime: _0x5152eb,
  modelSettings: _0x557298,
  store = null,
  uploadMaterial = null,
  fabBtnEl = document.getElementById("fabBtn"),
  root = document.body
} = {}) {
  if (!_0x5152eb || !fabBtnEl || !root) {
    return null;
  }
  const _0x5d746d = createEl("aside", "agent-sidebar");
  _0x5d746d.setAttribute("aria-label", a832_0x15436d("panelAria"));
  _0x5d746d.setAttribute("aria-hidden", "true");
  _0x5d746d.dataset.readonlyTextSelectionRoot = "true";
  const _0xbc9f60 = createEl("div", "agent-sidebar-resize-handle");
  _0xbc9f60.setAttribute("role", "separator");
  _0xbc9f60.setAttribute("aria-orientation", "vertical");
  _0xbc9f60.setAttribute("aria-label", a832_0x15436d("resizeAria"));
  _0xbc9f60.tabIndex = 0;
  const _0x5c004e = createEl("div", "agent-sidebar-header");
  const _0x5ce15a = createEl("div", "agent-sidebar-title");
  _0x5ce15a.append(createEl("span", "agent-sidebar-title-main", "Shuo Canvas Agent"), createEl("span", "agent-sidebar-title-badge", a832_0x15436d("betaBadge")));
  const _0x812b69 = createEl("div", "agent-header-actions");
  const _0x31bc03 = createButton("agent-icon-btn agent-new-chat-btn", "", {
    title: a832_0x15436d("newConversation"),
    icon: iconSvg("plus")
  });
  const _0x1c94f5 = createButton("agent-icon-btn agent-history-btn", "", {
    title: a832_0x15436d("historyTitle"),
    icon: iconSvg("history")
  });
  const _0x390a68 = createButton("agent-icon-btn agent-close-btn", "", {
    title: a832_0x15436d("close"),
    icon: iconSvg("close")
  });
  _0x812b69.append(_0x31bc03, _0x1c94f5, _0x390a68);
  _0x5c004e.append(_0x5ce15a, _0x812b69);
  const _0x11d9f4 = createEl("div", "agent-sidebar-main");
  const _0x570a51 = createEl("div", "agent-greeting");
  _0x570a51.append(createEl("div", "agent-greeting-kicker", a832_0x15436d("greetingKicker")), createEl("div", "agent-greeting-title", a832_0x15436d("greetingTitle")));
  const _0x176e36 = createEl("div", "agent-messages");
  const _0x4790a4 = createEl("div", "agent-run-steps");
  _0x4790a4.hidden = true;
  const _0x20d98d = createEl("div", "agent-run-controls");
  _0x20d98d.hidden = true;
  const _0x3e2164 = createButton("agent-secondary-btn agent-resume-run-btn", a832_0x15436d("resumeInterruptedRun"));
  const _0xb64a07 = createButton("agent-secondary-btn agent-discard-run-btn", a832_0x15436d("discardInterruptedRun"));
  const _0x36dc1a = createButton("agent-secondary-btn agent-undo-run-btn", a832_0x15436d("undoLastRun"));
  _0x20d98d.append(_0x3e2164, _0xb64a07, _0x36dc1a);
  const _0x40afaf = createEl("div", "agent-history-popover");
  _0x40afaf.hidden = true;
  _0x11d9f4.append(_0x570a51, _0x176e36, _0x4790a4, _0x20d98d, _0x40afaf);
  const _0x246e33 = createEl("div", "agent-quick-actions-shell");
  const _0x2c4656 = createEl("div", "agent-quick-actions");
  _0x246e33.appendChild(_0x2c4656);
  const _0x4c67a0 = globalThis.window;
  let _0x50ec45 = null;
  const _0x49d722 = () => {
    _0x50ec45?.close?.();
    _0x50ec45 = null;
  };
  const _0x360187 = (_0x13e90a, _0x2f985b) => {
    if (!Array.isArray(_0x2f985b) || _0x2f985b.length === 0) {
      return;
    }
    _0x13e90a.preventDefault?.();
    _0x13e90a.stopPropagation?.();
    closeFloatingMenus(_0x5d746d);
    _0x49d722();
    _0x50ec45 = showContextMenu(Number(_0x13e90a.clientX) || 0, Number(_0x13e90a.clientY) || 0, _0x2f985b, {
      className: "v2-canvas-ctx-menu agent-context-menu",
      ownerElement: _0x13e90a.target,
      ownerRoot: _0x5d746d
    });
  };
  const _0x2ba5cb = ({
    trigger: _0x28a05f,
    field: _0x1f12e6,
    onSelect: _0xc28362
  } = {}) => {
    if (!_0x28a05f || !Array.isArray(_0x1f12e6?.options) || _0x1f12e6.options.length === 0) {
      return;
    }
    if (_0x28a05f.getAttribute("aria-expanded") === "true") {
      _0x49d722();
      return;
    }
    closeFloatingMenus(_0x5d746d);
    _0x49d722();
    const _0x244fa9 = _0x1f12e6.options.map(_0x350870 => {
      const _0x11f63b = getParamOptionLabel(_0x350870);
      if (!_0x11f63b) {
        return null;
      }
      return {
        label: _0x11f63b,
        checked: String(_0x350870?.value ?? "") === String(_0x1f12e6.value ?? ""),
        disabled: _0x350870?.disabled === true,
        action: () => _0xc28362?.(_0x350870.value),
        paramValue: _0x350870.value
      };
    }).filter(Boolean);
    if (_0x244fa9.length === 0) {
      return;
    }
    const _0x521d08 = _0x28a05f.getBoundingClientRect?.() || {};
    _0x28a05f.setAttribute("aria-expanded", "true");
    let _0x9bed57 = null;
    _0x9bed57 = showContextMenu(Number(_0x521d08.left) || 0, (Number(_0x521d08.bottom) || 0) + 4, _0x244fa9, {
      className: "v2-canvas-ctx-menu v2-sb-dropdown agent-param-dropdown-menu",
      restoreTarget: _0x28a05f,
      ownerElement: _0x28a05f,
      ownerRoot: _0x5d746d,
      dismissOnOwnerPointerDown: false,
      ariaLabel: String(_0x1f12e6.label || ""),
      onClose: () => {
        _0x28a05f.setAttribute("aria-expanded", "false");
        if (_0x50ec45 === _0x9bed57) {
          _0x50ec45 = null;
        }
      }
    });
    _0x50ec45 = _0x9bed57;
    _0x9bed57.menu.dataset.agentParamId = String(_0x1f12e6.id || "");
    _0x9bed57.menu.querySelectorAll?.(".v2-menu-row")?.forEach((_0x4704da, _0x5cbf9c) => {
      _0x4704da.dataset.agentParamValue = String(_0x244fa9[_0x5cbf9c]?.paramValue ?? "");
    });
  };
  seedCustomQuickActionsIfNeeded(_0x4c67a0);
  function _0x13af9c() {
    _0x2c4656.replaceChildren();
    readCustomQuickActions(_0x4c67a0).forEach(_0x576268 => {
      const _0x3eb52d = createButton("agent-quick-card", _0x576268.label, {
        icon: _0x576268.custom === true ? iconSvg("wand") : _0x576268.id === "canvas-gap-check" ? iconSvg("scan") : _0x576268.id === "storyboard-plan" ? iconSvg("flow") : iconSvg("wand")
      });
      _0x3eb52d.dataset.prompt = _0x576268.prompt;
      _0x2c4656.appendChild(_0x3eb52d);
    });
    _0x3bab59();
  }
  _0x13af9c();
  const _0x48a03f = createEl("div", "agent-custom-panel");
  _0x48a03f.hidden = true;
  _0x48a03f.setAttribute("aria-hidden", "true");
  const _0x369dfd = createEl("div", "agent-custom-panel-header");
  const _0xdd202f = createEl("div", "agent-custom-panel-copy");
  _0xdd202f.append(createEl("div", "agent-custom-panel-title", a832_0x15436d("customShortcutPanelTitle")), createEl("div", "agent-custom-panel-desc", a832_0x15436d("customShortcutPanelDesc")));
  const _0x521173 = createButton("agent-custom-close-btn", "×", {
    title: a832_0x15436d("customShortcutClose")
  });
  _0x369dfd.append(_0xdd202f, _0x521173);
  const _0x17732b = createButton("agent-secondary-btn agent-custom-new-btn", a832_0x15436d("customShortcutNew"));
  const _0x373942 = createEl("div", "agent-custom-panel-body");
  const _0x4191ab = createEl("div", "agent-custom-sidebar");
  const _0x3ae2a9 = createEl("div", "agent-custom-list");
  _0x3ae2a9.setAttribute("role", "list");
  _0x4191ab.append(_0x17732b, _0x3ae2a9);
  const _0x21aa06 = createEl("div", "agent-custom-editor");
  const _0x2ed93b = createEl("label", "agent-custom-field");
  _0x2ed93b.appendChild(createEl("span", "agent-custom-label", a832_0x15436d("customShortcutNameLabel")));
  const _0xd3cdc8 = createEl("input", "agent-custom-input");
  _0xd3cdc8.type = "text";
  _0xd3cdc8.maxLength = 28;
  _0xd3cdc8.placeholder = a832_0x15436d("customShortcutNamePlaceholder");
  _0x2ed93b.appendChild(_0xd3cdc8);
  const _0x46ac02 = createEl("label", "agent-custom-field");
  _0x46ac02.appendChild(createEl("span", "agent-custom-label", a832_0x15436d("customShortcutPromptLabel")));
  const _0x14bf9a = createEl("textarea", "agent-custom-textarea");
  _0x14bf9a.rows = 4;
  _0x14bf9a.placeholder = a832_0x15436d("customShortcutPromptPlaceholder");
  _0x46ac02.appendChild(_0x14bf9a);
  const _0x443172 = createEl("div", "agent-custom-editor-actions");
  const _0x56f7e5 = createButton("agent-primary-btn agent-custom-save-btn", a832_0x15436d("customShortcutSave"));
  _0x443172.append(_0x56f7e5);
  _0x21aa06.append(_0x2ed93b, _0x46ac02, _0x443172);
  _0x373942.append(_0x4191ab, _0x21aa06);
  _0x48a03f.append(_0x369dfd, _0x373942);
  const _0x4c8155 = createEl("div", "agent-notice");
  _0x4c8155.hidden = true;
  const _0x836250 = createEl("div", "agent-plan-preview");
  _0x836250.hidden = true;
  const _0x3ac943 = createEl("div", "agent-options");
  _0x3ac943.hidden = true;
  const _0x3cddea = createEl("div", "agent-recovery");
  _0x3cddea.hidden = true;
  const _0x410c1e = createEl("div", "agent-actions");
  _0x410c1e.hidden = true;
  const _0x6d523e = createButton("agent-primary-btn", a832_0x15436d("confirmExecute"));
  const _0x2701c6 = createButton("agent-secondary-btn", a832_0x15436d("cancel"));
  _0x410c1e.append(_0x6d523e, _0x2701c6);
  const _0x40bbef = createEl("form", "agent-compose");
  const _0x22a84e = createEl("div", "agent-prompt-panel text-prompt-panel");
  const _0x492764 = createEl("div", "agent-ref-bar node-ref-bar active");
  const _0x3017cc = createAgentPromptAttachmentButton({
    title: a832_0x15436d("addSelectedReference"),
    className: "agent-connect-btn"
  });
  const _0x11020c = createEl("div", "agent-ref-placeholder", a832_0x15436d("addReference"));
  const _0x3a155a = createEl("div", "ref-thumb-container agent-input-ref-list");
  _0x3a155a.setAttribute("role", "list");
  _0x492764.append(_0x3017cc, _0x11020c, _0x3a155a);
  const _0x13e578 = createEl("div", "agent-input-wrapper prompt-input-wrapper");
  const _0x4cad3c = createEl("div", "agent-compose-input prompt-textarea custom-textarea");
  _0x4cad3c.contentEditable = "true";
  _0x4cad3c.spellcheck = false;
  _0x4cad3c.dataset.placeholder = a832_0x15436d("inputPlaceholder");
  _0x13e578.appendChild(_0x4cad3c);
  const _0x2550fe = createEl("div", "agent-compose-footer prompt-panel-footer");
  const _0x32b2be = createEl("div", "agent-compose-left");
  const _0x594aaa = createEl("div", "agent-menu-wrap");
  const _0x3b523e = createButton("agent-round-btn", "", {
    title: a832_0x15436d("add"),
    icon: iconSvg("plus")
  });
  const _0x2fdb70 = createEl("div", "agent-floating-menu agent-add-menu");
  [["upload", a832_0x15436d("uploadMaterial"), "upload"], ["custom", a832_0x15436d("customShortcutPanelTitle"), "wand"]].forEach(([_0x444318, _0xa39b31, _0x35427c]) => {
    const _0x6b2e46 = createButton("agent-menu-item", _0xa39b31, {
      icon: iconSvg(_0x35427c)
    });
    _0x6b2e46.dataset.placeholderAction = _0x444318;
    _0x2fdb70.appendChild(_0x6b2e46);
  });
  _0x594aaa.append(_0x3b523e, _0x2fdb70);
  const _0x115a40 = createEl("input", "agent-upload-input");
  _0x115a40.type = "file";
  _0x115a40.accept = "image/*,video/*,audio/*";
  _0x115a40.multiple = false;
  const _0x44594e = _0x557298?.getSettings?.() || {};
  const _0x24a239 = createEl("div", "img-model-pills aigen-text-model-selector agent-text-model-selector");
  _0x24a239.dataset.aigenTextModelSelector = "";
  const _0x10eecc = createEl("div", "agent-menu-wrap agent-model-wrap img-model-wrap");
  const _0x4eb231 = createButton("agent-pill-btn agent-model-btn img-model-btn-trigger", "", {
    title: a832_0x15436d("modelSelection")
  });
  const _0x1d2a3c = createEl("span", "agent-model-icon-slot");
  _0x1d2a3c.innerHTML = iconSvg("model");
  const _0x1d77e5 = createEl("span", "agent-model-label img-model-label", resolveAgentModelLabel(_0x44594e.model));
  const _0x1229a8 = createEl("span", "agent-caret node-menu-caret");
  _0x1229a8.innerHTML = "<svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
  _0x4eb231.append(_0x1d2a3c, _0x1d77e5, _0x1229a8);
  const _0x5af53c = createEl("div", "floating-menu img-model-menu node-model-menu agent-model-menu");
  _0x5af53c.innerHTML = buildAIGenTextModelMenuMarkup({
    activeModel: _0x44594e.model
  });
  _0x10eecc.append(_0x4eb231, _0x5af53c);
  const _0x1b3702 = createButton("model-provider-profile-selector-toggle is-hidden", "");
  _0x24a239.append(_0x10eecc, _0x1b3702);
  const _0x5043c3 = createEl("div", "agent-menu-wrap");
  const _0x210c83 = createButton("agent-pill-btn agent-mode-btn", "", {
    title: a832_0x15436d("agentMode"),
    icon: iconSvg("mode")
  });
  const _0x42b1fe = createEl("span", "agent-mode-label", getAgentExecutionModeLabel(_0x44594e.executionMode));
  const _0x3e2075 = createEl("span", "agent-caret");
  _0x3e2075.innerHTML = "<svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
  _0x210c83.append(_0x42b1fe, _0x3e2075);
  const _0x2d87b8 = createEl("div", "agent-floating-menu agent-mode-menu");
  [["manual", getAgentExecutionModeLabel("manual")], ["auto", getAgentExecutionModeLabel("auto")]].forEach(([_0x5e40d5, _0x135110]) => {
    const _0x2f7243 = createButton("agent-menu-item", _0x135110, {
      icon: iconSvg("check")
    });
    _0x2f7243.dataset.executionMode = _0x5e40d5;
    _0x2f7243.classList.toggle("active", normalizeAgentExecutionMode(_0x44594e.executionMode) === _0x5e40d5);
    _0x2d87b8.appendChild(_0x2f7243);
  });
  _0x5043c3.append(_0x210c83, _0x2d87b8);
  _0x5043c3.hidden = true;
  _0x32b2be.append(_0x594aaa, _0x24a239);
  const _0x15ba80 = createButton("agent-send-btn", "", {
    title: a832_0x15436d("send"),
    icon: iconSvg("send")
  });
  _0x15ba80.type = "submit";
  const _0x2c2dff = createButton("agent-stop-btn", "", {
    title: a832_0x15436d("stop"),
    icon: iconSvg("stop")
  });
  _0x2c2dff.type = "button";
  _0x2c2dff.hidden = true;
  _0x2550fe.append(_0x32b2be, _0x15ba80, _0x2c2dff);
  _0x22a84e.append(_0x492764, _0x13e578, _0x2550fe);
  _0x40bbef.append(_0x246e33, _0x48a03f, _0x836250, _0x3ac943, _0x3cddea, _0x410c1e, _0x22a84e, _0x115a40);
  _0x5d746d.append(_0xbc9f60, _0x5c004e, _0x11d9f4, _0x40bbef);
  root.appendChild(_0x5d746d);
  (document?.body || root).appendChild(_0x4c8155);
  let _0x26e64c = null;
  _0x4eb231.addEventListener("click", () => {
    if (_0x5af53c.classList.contains("show")) {
      return;
    }
    closeFloatingMenus(_0x5d746d, _0x5af53c);
    const _0x4a5d91 = _0x557298?.getSettings?.() || _0x44594e;
    _0x26e64c?.setSelection?.({
      modelId: _0x4a5d91.model,
      provider: _0x4a5d91.provider,
      providerProfileId: _0x4a5d91.providerProfileId,
      providerProfileIdByModel: _0x4a5d91.providerProfileIdByModel
    });
  });
  _0x26e64c = bindAIGenTextModelSelector(_0x24a239, {
    modelId: _0x44594e.model,
    provider: _0x44594e.provider,
    providerProfileId: _0x44594e.providerProfileId,
    providerProfileIdByModel: _0x44594e.providerProfileIdByModel,
    documentObject: document,
    onChange: _0x27ecc8 => commitAgentModelSelection(_0x557298, _0x27ecc8)
  });
  let _0x5ba4c5 = false;
  let _0x370407 = null;
  let _0x187a48 = null;
  const _0x43b5ba = readStoredSidebarWidth(_0x4c67a0);
  if (_0x43b5ba) {
    document?.body?.style?.setProperty?.("--agent-sidebar-width", clampAgentSidebarWidth(_0x43b5ba) + "px");
  }
  function _0x2a32fe() {
    if (_0x187a48 !== null) {
      clearTimeout(_0x187a48);
      _0x187a48 = null;
    }
  }
  function _0x5a6c5(_0x40d8e0, {
    sticky = false
  } = {}) {
    _0x2a32fe();
    _0x4c8155.textContent = String(_0x40d8e0 || "");
    _0x4c8155.hidden = !_0x4c8155.textContent;
    if (_0x4c8155.textContent && !sticky) {
      _0x187a48 = setTimeout(() => {
        _0x187a48 = null;
        _0x4c8155.textContent = "";
        _0x4c8155.hidden = true;
      }, AGENT_NOTICE_AUTO_HIDE_MS);
      _0x187a48?.unref?.();
    }
  }
  async function _0x31844f(_0x3c316b = "") {
    const _0x47d439 = String(_0x3c316b || "").trim();
    if (!_0x47d439) {
      return false;
    }
    try {
      const _0x553ecc = _0x4c67a0?.navigator?.clipboard || globalThis.navigator?.clipboard;
      if (!_0x553ecc?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await _0x553ecc.writeText(_0x47d439);
      _0x5a6c5(a832_0x15436d("copyMessageDone"));
      return true;
    } catch {
      _0x5a6c5(a832_0x15436d("copyMessageFailed"));
      return false;
    }
  }
  function _0x310728(_0x303eb6 = "", _0x40807d = "") {
    const _0xe9d175 = String(_0x303eb6 || "").trim();
    if (!_0xe9d175) {
      return;
    }
    openImagePreview(_0xe9d175, {
      alt: _0x40807d || a832_0x15436d("imageResultOpen"),
      sidebarSubmenuOwner: "agent"
    });
  }
  function _0x258510(_0x18b394 = _0x5d746d) {
    const _0x4979cc = document?.getSelection?.() || _0x4c67a0?.getSelection?.() || globalThis.getSelection?.();
    const _0x4ddf7e = String(_0x4979cc?.toString?.() || "").trim();
    if (!_0x4ddf7e || _0x4979cc?.isCollapsed === true) {
      return "";
    }
    const _0x31e086 = Number(_0x4979cc?.rangeCount) || 0;
    if (_0x31e086 > 0 && typeof _0x4979cc.getRangeAt === "function") {
      for (let _0x1e5571 = 0; _0x1e5571 < _0x31e086; _0x1e5571 += 1) {
        const _0xbede6e = _0x4979cc.getRangeAt(_0x1e5571);
        if (_0x18b394.contains(_0xbede6e.commonAncestorContainer) || _0x18b394.contains(_0xbede6e.startContainer) || _0x18b394.contains(_0xbede6e.endContainer)) {
          return _0x4ddf7e;
        }
      }
      return "";
    }
    if (_0x18b394.contains(_0x4979cc?.anchorNode) || _0x18b394.contains(_0x4979cc?.focusNode)) {
      return _0x4ddf7e;
    } else {
      return "";
    }
  }
  function _0x102fb9(_0xe62fe6) {
    const _0xb903ec = _0x258510();
    if (!_0xb903ec) {
      return;
    }
    _0xe62fe6.stopPropagation?.();
    if (_0xe62fe6.clipboardData?.setData) {
      _0xe62fe6.preventDefault?.();
      _0xe62fe6.clipboardData.setData("text/plain", _0xb903ec);
    }
  }
  function _0x5894e7() {
    const _0x6dae5e = Math.max(0, Number(_0x2c4656.scrollWidth) || 0);
    const _0x159f1e = Number(_0x2c4656.getBoundingClientRect?.().width) || 0;
    const _0x46d6ef = Math.max(0, Number(_0x2c4656.clientWidth) || _0x159f1e || Number(_0x2c4656.offsetWidth) || 0);
    const _0x447ca0 = Math.max(0, _0x6dae5e - _0x46d6ef);
    const _0x2da65d = Math.min(_0x447ca0, Math.max(0, Number(_0x2c4656.scrollLeft) || 0));
    return {
      clientWidth: _0x46d6ef,
      maxScroll: _0x447ca0,
      scrollLeft: _0x2da65d,
      scrollWidth: _0x6dae5e
    };
  }
  function _0x3bab59() {
    const {
      maxScroll: _0x26c369,
      scrollLeft: _0x442456
    } = _0x5894e7();
    const _0x17c4b1 = _0x26c369 > 1;
    _0x246e33.classList.toggle("has-overflow", _0x17c4b1);
    _0x246e33.classList.toggle("has-left-fade", _0x17c4b1 && _0x442456 > 1);
    _0x246e33.classList.toggle("has-right-fade", _0x17c4b1 && _0x442456 < _0x26c369 - 1);
  }
  function _0x1d4a77(_0x146d89) {
    const _0x489a5f = _0x146d89 === true;
    _0x2c4656.hidden = _0x489a5f;
    _0x246e33.hidden = _0x489a5f;
    _0x3bab59();
  }
  function _0x2a21f5(_0x392995) {
    const {
      maxScroll: _0x7ccf7a,
      scrollLeft: _0x55d308
    } = _0x5894e7();
    if (_0x7ccf7a <= 1) {
      return;
    }
    const _0x5e66c7 = Number(_0x392995?.deltaY) || 0;
    const _0x8196fd = Number(_0x392995?.deltaX) || 0;
    const _0x5ca159 = Math.abs(_0x8196fd) > Math.abs(_0x5e66c7) && _0x8196fd !== 0 ? _0x8196fd : _0x5e66c7;
    if (!_0x5ca159) {
      return;
    }
    const _0x4c5114 = _0x5ca159 < 0 && _0x55d308 > 1;
    const _0x5e5a28 = _0x5ca159 > 0 && _0x55d308 < _0x7ccf7a - 1;
    if (!_0x4c5114 && !_0x5e5a28) {
      return;
    }
    _0x392995?.preventDefault?.();
    _0x2c4656.scrollLeft = Math.min(_0x7ccf7a, Math.max(0, _0x55d308 + _0x5ca159));
    _0x3bab59();
  }
  function _0x43bb4d(_0x1ee7e0) {
    if (_0x1ee7e0) {
      _0x48a03f.hidden = false;
      _0x48a03f.setAttribute("aria-hidden", "false");
      _0x48a03f.classList.remove("is-open");
      _0x48a03f.offsetWidth;
      _0x48a03f.classList.add("is-open");
      return;
    }
    _0x48a03f.classList.remove("is-open");
    _0x48a03f.setAttribute("aria-hidden", "true");
    _0x48a03f.hidden = true;
  }
  let _0x16eeef = false;
  let _0x4afc2b = [];
  let _0x908b1c = false;
  let _0x4038cf = null;
  function _0x2cfa78(_0x3eddcd, _0x38767b) {
    if (!_0x3eddcd) {
      return;
    }
    const _0x522e7f = String(_0x38767b || "");
    if (_0x522e7f) {
      _0x3eddcd.title = _0x522e7f;
      _0x3eddcd.setAttribute?.("aria-label", _0x522e7f);
    } else {
      _0x3eddcd.title = "";
      _0x3eddcd.removeAttribute?.("aria-label");
    }
  }
  function _0x2d48ea(_0xde5fc4, _0x11d0f2) {
    if (!_0xde5fc4) {
      return;
    }
    const _0x84218a = _0xde5fc4.querySelector?.(".agent-btn-label");
    if (_0x84218a) {
      _0x84218a.textContent = _0x11d0f2;
      return;
    }
    _0xde5fc4.textContent = _0x11d0f2;
  }
  function _0xfa4ddb() {
    const _0x297e9c = _0x557298?.getSettings?.() || _0x44594e;
    _0x5d746d.setAttribute("aria-label", a832_0x15436d("panelAria"));
    _0xbc9f60.setAttribute("aria-label", a832_0x15436d("resizeAria"));
    _0x5d746d.querySelector(".agent-sidebar-title-badge").textContent = a832_0x15436d("betaBadge");
    _0x2cfa78(_0x31bc03, a832_0x15436d("newConversation"));
    _0x2cfa78(_0x1c94f5, a832_0x15436d("historyTitle"));
    _0x2cfa78(_0x390a68, a832_0x15436d("close"));
    _0x570a51.querySelector(".agent-greeting-kicker").textContent = a832_0x15436d("greetingKicker");
    _0x570a51.querySelector(".agent-greeting-title").textContent = a832_0x15436d("greetingTitle");
    _0x48a03f.querySelector(".agent-custom-panel-title").textContent = a832_0x15436d("customShortcutPanelTitle");
    _0x48a03f.querySelector(".agent-custom-panel-desc").textContent = a832_0x15436d("customShortcutPanelDesc");
    _0x2cfa78(_0x521173, a832_0x15436d("customShortcutClose"));
    _0x2d48ea(_0x17732b, a832_0x15436d("customShortcutNew"));
    const _0x30bd67 = _0x21aa06.querySelectorAll(".agent-custom-label");
    if (_0x30bd67[0]) {
      _0x30bd67[0].textContent = a832_0x15436d("customShortcutNameLabel");
    }
    if (_0x30bd67[1]) {
      _0x30bd67[1].textContent = a832_0x15436d("customShortcutPromptLabel");
    }
    _0xd3cdc8.placeholder = a832_0x15436d("customShortcutNamePlaceholder");
    _0x14bf9a.placeholder = a832_0x15436d("customShortcutPromptPlaceholder");
    _0x2d48ea(_0x56f7e5, a832_0x15436d("customShortcutSave"));
    _0x2d48ea(_0x6d523e, a832_0x15436d("confirmExecute"));
    _0x2d48ea(_0x2701c6, a832_0x15436d("cancel"));
    _0x2d48ea(_0x3e2164, a832_0x15436d("resumeInterruptedRun"));
    _0x2d48ea(_0xb64a07, a832_0x15436d("discardInterruptedRun"));
    _0x2d48ea(_0x36dc1a, a832_0x15436d("undoLastRun"));
    _0x2cfa78(_0x3017cc, a832_0x15436d("addSelectedReference"));
    _0x3017cc.setAttribute?.("data-tooltip", a832_0x15436d("addSelectedReference"));
    _0x11020c.textContent = a832_0x15436d("addReference");
    _0x4cad3c.dataset.placeholder = a832_0x15436d("inputPlaceholder");
    _0x2cfa78(_0x3b523e, a832_0x15436d("add"));
    _0x2fdb70.querySelectorAll(".agent-menu-item").forEach(_0x435370 => {
      const _0x1a2737 = _0x435370.dataset?.placeholderAction;
      if (_0x1a2737 === "upload") {
        _0x2d48ea(_0x435370, a832_0x15436d("uploadMaterial"));
      }
      if (_0x1a2737 === "custom") {
        _0x2d48ea(_0x435370, a832_0x15436d("customShortcutPanelTitle"));
      }
    });
    _0x2cfa78(_0x4eb231, a832_0x15436d("modelSelection"));
    _0x26e64c?.setSelection?.({
      modelId: _0x297e9c.model,
      provider: _0x297e9c.provider,
      providerProfileId: _0x297e9c.providerProfileId,
      providerProfileIdByModel: _0x297e9c.providerProfileIdByModel
    });
    _0x2cfa78(_0x210c83, a832_0x15436d("agentMode"));
    _0x42b1fe.textContent = getAgentExecutionModeLabel(_0x297e9c.executionMode);
    _0x2d87b8.querySelectorAll("[data-execution-mode]").forEach(_0x2dd5a7 => {
      _0x2d48ea(_0x2dd5a7, getAgentExecutionModeLabel(_0x2dd5a7.dataset.executionMode));
    });
    _0x2cfa78(_0x15ba80, a832_0x15436d("send"));
    _0x2cfa78(_0x2c2dff, a832_0x15436d("stop"));
    _0x13af9c();
    _0x4c42f4();
    if (isAgentPopoverOpen(_0x40afaf)) {
      renderHistory(_0x40afaf, _0x5152eb, {
        onSelect: _0x5b7a63,
        onDelete: _0x485fc3
      });
    }
    if (!_0x48a03f.hidden) {
      renderCustomShortcutList();
    }
    if (_0x908b1c) {
      _0x5a6c5(a832_0x15436d("materialPickStarted"), {
        sticky: true
      });
    }
  }
  function _0x1e6db0(_0x30adb5 = {}) {
    if (_0x30adb5.thumbUrl) {
      const _0x3e0778 = createEl("img", "ref-thumb-media agent-input-ref-media");
      _0x3e0778.src = _0x30adb5.thumbUrl;
      _0x3e0778.alt = _0x30adb5.label || _0x30adb5.nodeId || "";
      _0x3e0778.draggable = false;
      return _0x3e0778;
    }
    if (String(_0x30adb5.kind || "") === "audio") {
      const _0x5b686d = createReferenceFallbackThumbElement("audio", "ref-thumb-media agent-input-ref-fallback") || createEl("div", "ref-thumb-media ref-thumb-fallback agent-input-ref-fallback");
      _0x5b686d.classList?.add?.("agent-input-ref-audio-thumb");
      _0x5b686d.textContent = "";
      const _0x2bf721 = createEl("span", "agent-audio-thumb-bars");
      for (let _0x42151f = 0; _0x42151f < 9; _0x42151f += 1) {
        _0x2bf721.appendChild(createEl("span", "agent-audio-thumb-bar"));
      }
      _0x5b686d.appendChild(_0x2bf721);
      return _0x5b686d;
    }
    const _0x42b0a7 = createEl("div", "ref-thumb-media ref-thumb-fallback agent-input-ref-fallback", String(_0x30adb5.kind || "node").slice(0, 3).toUpperCase());
    _0x42b0a7.setAttribute("aria-hidden", "true");
    return _0x42b0a7;
  }
  function _0x4c42f4() {
    _0x3a155a.replaceChildren();
    _0x4afc2b.forEach(_0x119d70 => {
      const _0x53fc17 = createEl("div", "ref-thumb-wrap agent-input-ref-thumb");
      const _0x43f150 = String(_0x119d70.label || _0x119d70.name || _0x119d70.nodeId || "").trim();
      _0x53fc17.title = _0x43f150;
      _0x53fc17.setAttribute("aria-label", _0x43f150);
      _0x53fc17.setAttribute("role", "listitem");
      _0x53fc17.dataset.inputRefId = _0x119d70.nodeId;
      _0x53fc17.appendChild(_0x1e6db0(_0x119d70));
      const _0x2c2280 = a832_0x15436d("removeReference");
      const _0x4496d7 = createEl("button", "ref-thumb-delete agent-input-ref-remove", "×");
      _0x4496d7.type = "button";
      _0x4496d7.title = _0x2c2280;
      _0x4496d7.setAttribute("aria-label", _0x2c2280);
      _0x4496d7.dataset.inputRefRemove = _0x119d70.nodeId;
      _0x53fc17.appendChild(_0x4496d7);
      _0x3a155a.appendChild(_0x53fc17);
    });
    _0x492764.classList.add("active");
    _0x492764.classList.toggle("has-input-refs", _0x4afc2b.length > 0);
    _0x11020c.hidden = _0x4afc2b.length > 0;
  }
  function _0x5b3f76(_0x3c65ac = []) {
    const _0x2cdb55 = new Map(_0x4afc2b.map(_0x27b09a => [_0x27b09a.nodeId, _0x27b09a]));
    _0x3c65ac.filter(Boolean).forEach(_0x304ac6 => {
      if (!_0x304ac6.nodeId || _0x2cdb55.has(_0x304ac6.nodeId)) {
        return;
      }
      _0x2cdb55.set(_0x304ac6.nodeId, _0x304ac6);
    });
    _0x4afc2b = Array.from(_0x2cdb55.values()).slice(0, a832_0x321a57);
    _0x4c42f4();
    return _0x4afc2b.length;
  }
  function _0x35d212() {
    _0x4afc2b = [];
    _0x4c42f4();
  }
  function _0x267e6f({
    clearWhenMissing = false
  } = {}) {
    const _0x5c6089 = _0x5152eb?.sessionStore?.getPendingClarification?.() || _0x5152eb?.sessionStore?.getState?.().pendingClarification || null;
    const _0x514ef5 = (Array.isArray(_0x5c6089?.inputRefs) ? _0x5c6089.inputRefs : []).filter(_0x3bcff1 => String(_0x3bcff1?.nodeId || _0x3bcff1?.id || "").trim()).map(_0xb36501 => ({
      ..._0xb36501,
      id: String(_0xb36501.nodeId || _0xb36501.id || "").trim(),
      nodeId: String(_0xb36501.nodeId || _0xb36501.id || "").trim()
    })).slice(0, a832_0x321a57);
    if (_0x514ef5.length === 0 && !clearWhenMissing) {
      return false;
    }
    _0x4afc2b = _0x514ef5;
    _0x4c42f4();
    return _0x514ef5.length > 0;
  }
  function _0x3c30ff() {
    return document?.getElementById?.("v2-wrap") || null;
  }
  function _0x58f674() {
    return document?.documentElement || globalThis.document?.documentElement || null;
  }
  function _0xc5ab37() {
    try {
      return createLinkCursor({
        size: getCursorSize()
      });
    } catch {
      return createLinkCursor({
        size: "small"
      });
    }
  }
  function _0x3dff9e() {
    _0x4038cf?.classList?.remove?.("agent-material-pick-hover");
    _0x4038cf = null;
  }
  function _0x3f0bf6(_0x3f8b53) {
    if (_0x4038cf === _0x3f8b53) {
      return;
    }
    _0x3dff9e();
    _0x4038cf = _0x3f8b53 || null;
    _0x4038cf?.classList?.add?.("agent-material-pick-hover");
  }
  function _0x4d2b4a({
    noticeText = ""
  } = {}) {
    if (!_0x908b1c) {
      return;
    }
    _0x908b1c = false;
    _0x3dff9e();
    _0x5d746d.classList.remove("is-material-picking");
    _0x3017cc.classList.remove("is-picking", "is-connecting-active");
    _0x3017cc.setAttribute("aria-pressed", "false");
    const _0x3369d8 = _0x3c30ff();
    _0x3369d8?.classList?.remove?.("is-connecting", "agent-material-pick-mode");
    const _0x164111 = _0x58f674();
    _0x164111?.classList?.remove?.("is-connecting-mode");
    _0x164111?.style?.removeProperty?.("--connect-cursor");
    document?.removeEventListener?.("click", _0x56b331, true);
    document?.removeEventListener?.("pointermove", _0xfa5c9f, true);
    document?.removeEventListener?.("keydown", _0x496196, true);
    if (noticeText) {
      _0x5a6c5(noticeText);
    }
  }
  function _0x1ae42a({
    toggle = true
  } = {}) {
    if (_0x908b1c) {
      if (toggle) {
        _0x4d2b4a({
          noticeText: a832_0x15436d("materialPickCancelled")
        });
      }
      return;
    }
    _0x908b1c = true;
    _0x5d746d.classList.add("is-material-picking");
    _0x3017cc.classList.add("is-picking", "is-connecting-active");
    _0x3017cc.setAttribute("aria-pressed", "true");
    const _0x3bd2fc = _0x3c30ff();
    _0x3bd2fc?.classList?.add?.("is-connecting", "agent-material-pick-mode");
    const _0x48ac64 = _0x58f674();
    _0x48ac64?.classList?.add?.("is-connecting-mode");
    _0x48ac64?.style?.setProperty?.("--connect-cursor", _0xc5ab37());
    document?.addEventListener?.("click", _0x56b331, true);
    document?.addEventListener?.("pointermove", _0xfa5c9f, true);
    document?.addEventListener?.("keydown", _0x496196, true);
    _0x5a6c5(a832_0x15436d("materialPickStarted"), {
      sticky: true
    });
  }
  function _0x69d753(_0x11493b) {
    const _0x1e0d56 = _0x11493b?.closest?.(".v2-node") || null;
    const _0x5b23d9 = String(_0x1e0d56?.id || "").trim();
    if (!_0x5b23d9) {
      return {
        nodeEl: null,
        node: null,
        ref: null
      };
    }
    const _0x3cd5d6 = getStoreState(store).nodes?.[_0x5b23d9] || null;
    const _0x569171 = normalizeAgentInputRefFromNode(_0x3cd5d6, {
      source: "canvas-pick"
    });
    return {
      nodeEl: _0x1e0d56,
      node: _0x3cd5d6,
      ref: _0x569171
    };
  }
  function _0xfa5c9f(_0x2a7003) {
    if (!_0x908b1c || _0x5d746d.contains(_0x2a7003.target)) {
      return;
    }
    const {
      nodeEl: _0x44ba91,
      ref: _0x41a1db
    } = _0x69d753(_0x2a7003.target);
    _0x3f0bf6(_0x44ba91 && isAgentMaterialRef(_0x41a1db) ? _0x44ba91 : null);
  }
  function _0x56b331(_0x3b8c0c) {
    if (!_0x908b1c) {
      return;
    }
    if (_0x5d746d.contains(_0x3b8c0c.target)) {
      return;
    }
    const {
      ref: _0x1a7922
    } = _0x69d753(_0x3b8c0c.target);
    if (!_0x1a7922) {
      return;
    }
    _0x3b8c0c.preventDefault?.();
    _0x3b8c0c.stopPropagation?.();
    _0x3b8c0c.stopImmediatePropagation?.();
    if (!isAgentMaterialRef(_0x1a7922)) {
      _0x5a6c5(a832_0x15436d("materialPickUnsupported"), {
        sticky: true
      });
      return;
    }
    _0x5b3f76([_0x1a7922]);
    _0x5a6c5(a832_0x532d52("attachSelected", {
      count: 1
    }), {
      sticky: true
    });
  }
  function _0x496196(_0x4cdcf5) {
    if (!_0x908b1c || _0x4cdcf5.key !== "Escape") {
      return;
    }
    _0x4cdcf5.preventDefault?.();
    _0x4cdcf5.stopPropagation?.();
    _0x4d2b4a({
      noticeText: a832_0x15436d("materialPickCancelled")
    });
  }
  function _0x1e657d() {
    const _0x1b9c37 = getStoreState(store);
    const _0x3e68a2 = Array.isArray(_0x1b9c37.selectedNodeIds) ? _0x1b9c37.selectedNodeIds.map(_0xd6cfb => String(_0xd6cfb || "")).filter(Boolean) : [];
    const _0x3abc91 = _0x3e68a2.map(_0x23dcb3 => normalizeAgentInputRefFromNode(_0x1b9c37.nodes?.[_0x23dcb3], {
      source: "canvas-selection"
    })).filter(Boolean);
    const _0x5b67aa = _0x3abc91.filter(isAgentMaterialRef);
    if (_0x5b67aa.length === 0) {
      _0x5a6c5(a832_0x15436d("attachSelectedEmpty"));
      return 0;
    }
    const _0x1e79f7 = _0x4afc2b.length;
    _0x5b3f76(_0x5b67aa);
    const _0x38ae1f = Math.max(0, _0x4afc2b.length - _0x1e79f7);
    _0x5a6c5(a832_0x532d52("attachSelected", {
      count: _0x38ae1f || _0x5b67aa.length
    }));
    _0x4cad3c.focus();
    return _0x38ae1f || _0x5b67aa.length;
  }
  function _0x4cdfbd({
    toggle = true
  } = {}) {
    if (_0x908b1c) {
      _0x1ae42a({
        toggle: toggle
      });
      return 0;
    }
    const _0xb520b6 = _0x1e657d();
    if (_0xb520b6 > 0) {
      return _0xb520b6;
    }
    _0x1ae42a({
      toggle: false
    });
    return 0;
  }
  let _0x31dd3e = "";
  function _0x400867() {
    const _0x3f9c57 = readCustomQuickActions(_0x4c67a0);
    _0x3ae2a9.replaceChildren();
    if (_0x3f9c57.length === 0) {
      const _0x900c4e = createEl("div", "agent-custom-empty", a832_0x15436d("customShortcutEmpty"));
      _0x3ae2a9.appendChild(_0x900c4e);
      return _0x3f9c57;
    }
    _0x3f9c57.forEach(_0x15e1c4 => {
      const _0x56d6c8 = String(_0x15e1c4.label || _0x15e1c4.prompt || "").trim();
      const _0x5da1fd = createEl("div", "agent-custom-item");
      const _0x261a96 = createButton("agent-custom-item-main", _0x56d6c8);
      const _0x51de1d = createButton("agent-custom-item-delete", "×");
      _0x5da1fd.dataset.agentCustomActionId = _0x15e1c4.id;
      _0x5da1fd.setAttribute("role", "listitem");
      _0x5da1fd.classList.toggle("is-active", _0x15e1c4.id === _0x31dd3e);
      _0x51de1d.setAttribute("aria-label", a832_0x15436d("customShortcutDelete"));
      _0x51de1d.dataset.agentCustomDeleteActionId = _0x15e1c4.id;
      _0x5da1fd.append(_0x261a96, _0x51de1d);
      _0x3ae2a9.appendChild(_0x5da1fd);
    });
    return _0x3f9c57;
  }
  function _0x52658e(_0x2fba3d) {
    const _0x3b9777 = String(_0x2fba3d || "").trim();
    if (!_0x3b9777) {
      return null;
    }
    const _0x34e5d4 = readCustomQuickActions(_0x4c67a0).find(_0x948547 => _0x948547.id === _0x3b9777);
    if (!_0x34e5d4) {
      return null;
    }
    _0x2feef2(_0x34e5d4);
    return _0x34e5d4;
  }
  function _0x2feef2(_0x562b6f = {}) {
    _0x31dd3e = String(_0x562b6f.id || "").trim();
    const _0x3b4ffc = String(_0x562b6f.prompt || "").trim();
    _0xd3cdc8.value = String(_0x562b6f.label || "").trim();
    _0x14bf9a.value = _0x3b4ffc;
    _0x400867();
    if (!_0xd3cdc8.value && _0x3b4ffc) {
      _0xd3cdc8.value = truncateUiText(_0x3b4ffc, 18);
    }
  }
  function _0x132a01({
    prefillFromInput = false
  } = {}) {
    _0x43bb4d(true);
    const _0x399dd4 = readCustomQuickActions(_0x4c67a0);
    const _0x4a49a9 = prefillFromInput ? getEditorText(_0x4cad3c) : "";
    if (_0x4a49a9) {
      _0x2feef2({
        label: truncateUiText(_0x4a49a9, 18),
        prompt: _0x4a49a9
      });
    } else {
      _0x2feef2(_0x399dd4[0] || {});
    }
    _0x14bf9a.focus?.();
  }
  function _0x5072b9() {
    const _0x50a9f2 = String(_0x14bf9a.value || "").trim();
    if (!_0x50a9f2) {
      _0x5a6c5(a832_0x15436d("customShortcutEmpty"));
      _0x14bf9a.focus?.();
      return;
    }
    const _0x41abf2 = truncateUiText(_0xd3cdc8.value || _0x50a9f2, 28);
    const _0x4b8c99 = readCustomQuickActions(_0x4c67a0);
    const _0x557ad2 = _0x4b8c99.find(_0x44af76 => _0x44af76.id === _0x31dd3e);
    const _0x2c1848 = {
      id: _0x31dd3e || "custom-" + Date.now(),
      label: _0x41abf2,
      prompt: _0x50a9f2,
      custom: _0x557ad2 ? _0x557ad2.custom === true : true
    };
    const _0x386620 = _0x4b8c99.findIndex(_0x4eaab3 => _0x4eaab3.id === _0x2c1848.id);
    const _0x2579b3 = _0x386620 >= 0 ? _0x4b8c99.map(_0x4dad2f => _0x4dad2f.id === _0x2c1848.id ? _0x2c1848 : _0x4dad2f) : [_0x2c1848, ..._0x4b8c99.filter(_0x5afec9 => _0x5afec9.prompt !== _0x50a9f2)];
    const _0x450549 = writeCustomQuickActions(_0x2579b3, _0x4c67a0);
    _0x31dd3e = _0x2c1848.id;
    _0x13af9c();
    _0x400867();
    _0x1d4a77(_0x176e36.children.length > 0);
    _0x5a6c5(a832_0x15436d("customShortcutSaved"));
    return _0x450549;
  }
  function _0x2aa875(_0x1717df) {
    const _0x355850 = String(_0x1717df || "").trim();
    if (!_0x355850) {
      return [];
    }
    const _0x21885b = writeCustomQuickActions(readCustomQuickActions(_0x4c67a0).filter(_0x349403 => _0x349403.id !== _0x355850), _0x4c67a0);
    _0x13af9c();
    _0x1d4a77(_0x176e36.children.length > 0);
    if (_0x31dd3e === _0x355850) {
      _0x2feef2(_0x21885b[0] || {});
    } else {
      _0x400867();
    }
    _0x5a6c5(a832_0x15436d("customShortcutDeleted"));
    return _0x21885b;
  }
  async function _0x3be03b(_0x18b146) {
    if (!_0x18b146) {
      return;
    }
    if (typeof uploadMaterial !== "function") {
      _0x5a6c5(a832_0x15436d("uploadMaterialMissing"));
      return;
    }
    _0x4e41c6(true);
    try {
      const _0x528d3c = await uploadMaterial(_0x18b146);
      const _0x3308ef = Array.isArray(_0x528d3c) ? _0x528d3c : [_0x528d3c];
      const _0x38cf8f = _0x3308ef.map(_0x3d5a44 => normalizeAgentInputRefFromNode(_0x3d5a44, {
        source: "upload"
      })).filter(Boolean);
      if (_0x38cf8f.length === 0) {
        _0x5a6c5(a832_0x15436d("uploadMaterialFailed"));
        return;
      }
      _0x5b3f76(_0x38cf8f);
      _0x5a6c5(a832_0x15436d("uploadMaterialReady"));
      _0x4cad3c.focus();
    } catch (_0x5005d7) {
      _0x5a6c5(_0x5005d7?.message || a832_0x15436d("uploadMaterialFailed"));
    } finally {
      _0x4e41c6(false);
    }
  }
  function _0x59b317() {
    return _0x5152eb?.sessionStore?.getHistory?.() || _0x5152eb?.sessionStore?.getState?.().history || [];
  }
  function _0x204e62() {
    _0x49d722();
    renderPlanPreview(_0x836250, null);
    _0x3ac943.replaceChildren();
    _0x3ac943.hidden = true;
    _0x3cddea.replaceChildren();
    _0x3cddea.hidden = true;
    _0x410c1e.hidden = true;
  }
  function _0x34e36b(_0x4427b8 = {}) {
    _0x370407?.appendEntry(_0x4427b8);
  }
  function _0xddd7ed({
    hasMessages: _0x445ce9
  } = {}) {
    const _0x2f0599 = _0x445ce9 ?? _0x176e36.children.length > 0;
    _0x570a51.hidden = _0x2f0599;
    _0x1d4a77(_0x2f0599);
    if (_0x2f0599) {
      _0x43bb4d(false);
    }
  }
  function _0x1d07a0({
    preserveNotice = false
  } = {}) {
    if (!_0x5d746d.classList.contains("is-open")) {
      _0x5a6c5("");
      return;
    }
    const _0x16fa28 = _0x5152eb?.getActiveConversation?.() || _0x5152eb?.sessionStore?.getState?.().activeConversation || null;
    if (_0x16fa28?.hasUnfinishedOperation) {
      _0x5a6c5(a832_0x15436d("unfinishedNotice"), {
        sticky: true
      });
      return;
    }
    if (!preserveNotice) {
      _0x5a6c5("");
    }
  }
  function _0x4ff450() {
    const _0x184e3b = _0x5152eb?.getInterruptedRun?.() || null;
    const _0x52a788 = _0x5152eb?.getActiveConversation?.() || _0x5152eb?.sessionStore?.getState?.().activeConversation || null;
    const _0x19335a = Boolean(_0x184e3b && !["clarification", "task_wait"].includes(_0x184e3b.pendingKind));
    const _0x17ca80 = Boolean((_0x184e3b || _0x52a788?.hasUnfinishedOperation) && typeof _0x5152eb?.discardInterruptedRun === "function");
    const _0x4afa4b = Boolean(_0x5152eb?.getLastUndoableRun?.());
    _0x3e2164.hidden = !_0x19335a;
    _0xb64a07.hidden = !_0x17ca80;
    _0x36dc1a.hidden = !_0x4afa4b;
    _0x20d98d.hidden = !_0x19335a && !_0x17ca80 && !_0x4afa4b;
  }
  function _0x3e5528({
    preserveNotice = false,
    restorePendingInputRefs = false
  } = {}) {
    _0x204e62();
    const _0x35d243 = _0x5152eb?.sessionStore?.getState?.() || {};
    _0x370407?.render({
      history: _0x59b317(),
      sessionSnapshot: _0x35d243
    });
    _0x4ff450();
    const _0x16721b = _0x35d243.pendingPlan || null;
    if (_0x16721b) {
      renderPlanPreview(_0x836250, _0x16721b, {
        onParamChange: _0x470016,
        onOpenParamOptions: _0x2ba5cb
      });
      _0x410c1e.hidden = false;
    }
    if (restorePendingInputRefs) {
      _0x267e6f({
        clearWhenMissing: true
      });
    }
    _0xddd7ed();
    _0x1d07a0({
      preserveNotice: preserveNotice
    });
  }
  function _0x41bfa9() {
    const _0x19bdf1 = _0x59b317();
    const _0x2408ae = Array.isArray(_0x19bdf1) ? _0x19bdf1 : [];
    _0x370407?.renderMessages(_0x2408ae);
    _0xddd7ed();
    _0x4ff450();
    return _0x2408ae.length > 0;
  }
  function _0x4e41c6(_0x5cb269, {
    stoppable = false
  } = {}) {
    _0x5ba4c5 = _0x5cb269 === true;
    if (_0x5ba4c5) {
      _0x49d722();
    }
    _0x40bbef.setAttribute("aria-busy", _0x5ba4c5 ? "true" : "false");
    _0x2c2dff.setAttribute("aria-busy", _0x5ba4c5 && stoppable ? "true" : "false");
    _0x15ba80.disabled = _0x5ba4c5;
    _0x3e2164.disabled = _0x5ba4c5;
    _0xb64a07.disabled = _0x5ba4c5;
    _0x36dc1a.disabled = _0x5ba4c5;
    _0x15ba80.hidden = _0x5ba4c5 && stoppable;
    _0x2c2dff.hidden = !_0x5ba4c5 || !stoppable;
    _0x6d523e.disabled = _0x5ba4c5;
    _0x2701c6.disabled = _0x5ba4c5;
    _0x3ac943.querySelectorAll?.(".agent-option-btn")?.forEach(_0xcd0e9f => {
      _0xcd0e9f.disabled = _0x5ba4c5;
    });
    _0x3cddea.querySelectorAll?.(".agent-recovery-btn")?.forEach(_0x58bf28 => {
      _0x58bf28.disabled = _0x5ba4c5;
    });
    _0x836250.querySelectorAll?.(".agent-param-input")?.forEach(_0x148725 => {
      _0x148725.disabled = _0x5ba4c5;
    });
    _0x5d746d.classList.toggle("is-busy", _0x5ba4c5);
    _0x370407?.setBusy(_0x5ba4c5);
  }
  function _0x5bb403(_0xc64e71) {
    _0x5d746d.classList.toggle("is-open", _0xc64e71);
    _0x5d746d.setAttribute("aria-hidden", _0xc64e71 ? "false" : "true");
    document?.body?.classList?.toggle("agent-sidebar-open", _0xc64e71);
    document?.body?.classList?.toggle("agent-sidebar-collapsed", _0xc64e71 && _0x16eeef);
    fabBtnEl.classList.toggle("is-agent-open", _0xc64e71);
    if (_0xc64e71) {
      _0x3e5528({
        preserveNotice: true,
        restorePendingInputRefs: true
      });
      _0x3bab59();
      if (!_0x16eeef) {
        _0x4cad3c.focus();
      }
      _0x1d07a0({
        preserveNotice: true
      });
    } else {
      _0x4d2b4a();
      _0x49d722();
      closeFloatingMenus(_0x5d746d);
      _0x5a6c5("");
    }
  }
  function _0x543ca5() {
    _0x5bb403(!_0x5d746d.classList.contains("is-open"));
  }
  function _0x52d2a1(_0x49b0fe) {
    _0x16eeef = _0x49b0fe === true;
    _0x5d746d.classList.toggle("is-collapsed", _0x16eeef);
    document?.body?.classList?.toggle("agent-sidebar-collapsed", _0x16eeef && _0x5d746d.classList.contains("is-open"));
    if (!_0x16eeef && _0x5d746d.classList.contains("is-open")) {
      _0x4cad3c.focus();
    }
    if (_0x16eeef) {
      _0x4d2b4a();
      closeFloatingMenus(_0x5d746d);
      _0x5a6c5("");
    }
  }
  function _0x3a3fd6(_0x2666fe, {
    persist = false
  } = {}) {
    const _0x4d831e = clampAgentSidebarWidth(_0x2666fe);
    document?.body?.style?.setProperty?.("--agent-sidebar-width", _0x4d831e + "px");
    if (persist) {
      writeStoredSidebarWidth(_0x4d831e, _0x4c67a0);
    }
    _0x3bab59();
    return _0x4d831e;
  }
  function _0x18d136(_0x1c7d9b) {
    _0x1c7d9b.preventDefault?.();
    _0x1c7d9b.stopPropagation?.();
    const _0x54d479 = Number(_0x1c7d9b.clientX);
    const _0x49c2db = _0x5d746d.getBoundingClientRect?.().width || _0x5d746d.offsetWidth || 0;
    if (!Number.isFinite(_0x54d479) || !_0x49c2db) {
      return;
    }
    document?.body?.classList?.add?.("agent-sidebar-resizing");
    const _0x3a20d4 = _0x158159 => {
      const _0x3dc74c = Number(_0x158159.clientX);
      if (!Number.isFinite(_0x3dc74c)) {
        return;
      }
      _0x3a3fd6(_0x49c2db + (_0x54d479 - _0x3dc74c));
    };
    const _0x46284a = _0x8d315a => {
      document?.removeEventListener?.("pointermove", _0x3a20d4);
      document?.removeEventListener?.("pointerup", _0x46284a);
      document?.body?.classList?.remove?.("agent-sidebar-resizing");
      const _0x407b68 = Number(_0x8d315a.clientX);
      if (Number.isFinite(_0x407b68)) {
        _0x3a3fd6(_0x49c2db + (_0x54d479 - _0x407b68), {
          persist: true
        });
      }
    };
    document?.addEventListener?.("pointermove", _0x3a20d4);
    document?.addEventListener?.("pointerup", _0x46284a);
  }
  function _0x35d965() {
    _0x4d2b4a();
    _0x5152eb.startNewConversation?.();
    _0x3e5528({
      preserveNotice: true,
      restorePendingInputRefs: true
    });
    setEditorText(_0x4cad3c, "");
    _0x35d212();
    _0x43bb4d(false);
    _0x40afaf.hidden = true;
    _0x5a6c5(a832_0x15436d("newConversationNotice"));
  }
  function _0x5b7a63(_0x3bb9fe) {
    if (!_0x5152eb.switchConversation?.(_0x3bb9fe)) {
      return;
    }
    _0x4d2b4a();
    setEditorText(_0x4cad3c, "");
    _0x35d212();
    _0x43bb4d(false);
    _0x40afaf.hidden = true;
    _0x3e5528({
      restorePendingInputRefs: true
    });
  }
  function _0x485fc3(_0x70da4c) {
    _0x4d2b4a();
    _0x5152eb.deleteConversation?.(_0x70da4c);
    setEditorText(_0x4cad3c, "");
    _0x35d212();
    _0x43bb4d(false);
    _0x3e5528({
      restorePendingInputRefs: true
    });
    renderHistory(_0x40afaf, _0x5152eb, {
      onSelect: _0x5b7a63,
      onDelete: _0x485fc3
    });
  }
  async function _0x470016(_0x572b3c, _0x3b6c8d) {
    if (typeof _0x5152eb?.updatePendingGenerationParams !== "function") {
      return;
    }
    _0x4e41c6(true);
    try {
      const _0x53c60a = await _0x5152eb.updatePendingGenerationParams({
        params: {
          [_0x572b3c]: _0x3b6c8d
        }
      });
      if (_0x53c60a?.ok && _0x53c60a.plan) {
        renderPlanPreview(_0x836250, _0x53c60a.plan, {
          onParamChange: _0x470016,
          onOpenParamOptions: _0x2ba5cb
        });
        _0x370407?.acknowledgeSessionState?.();
        _0x5a6c5("");
        return;
      }
      _0x5a6c5(_0x53c60a?.message || _0x53c60a?.reply || a832_0x15436d("paramUpdateFailed"));
    } catch (_0x421be7) {
      _0x5a6c5(_0x421be7?.message || a832_0x15436d("paramUpdateFailed"));
    } finally {
      _0x4e41c6(false);
    }
  }
  function _0x246b3b(_0x62f12e) {
    if (_0x62f12e?.reply) {
      _0x370407.appendMessage("assistant", _0x62f12e.reply, {
        diagnostic: _0x62f12e.diagnostic || null
      });
    }
    if (Array.isArray(_0x62f12e?.taskMessages)) {
      _0x62f12e.taskMessages.forEach(_0x249e59 => _0x34e36b(_0x249e59));
    }
    _0x570a51.hidden = _0x176e36.children.length > 0;
    const _0x2b39ca = _0x62f12e?.status === "need_confirmation" ? _0x62f12e?.plan || null : null;
    renderPlanPreview(_0x836250, _0x2b39ca, {
      onParamChange: _0x470016,
      onOpenParamOptions: _0x2ba5cb
    });
    renderClarification(_0x3ac943, _0x62f12e, _0x5152eb, _0x246b3b, _0x2b6fda => _0x4e41c6(_0x2b6fda, {
      stoppable: _0x2b6fda === true
    }), {
      onAnswer: _0x2fe28e => {
        if (!_0x2fe28e) {
          return;
        }
        const _0x313bca = _0x4afc2b.slice();
        _0x35d212();
        _0x370407.appendMessage("user", _0x2fe28e, {
          inputRefs: _0x313bca
        });
        _0x570a51.hidden = true;
      },
      onWaitingStart: () => _0x370407.appendWaiting(),
      onWaitingEnd: _0x4bd93d => _0x370407.removeWaiting(_0x4bd93d)
    });
    renderRecovery(_0x3cddea, _0x62f12e, _0x5152eb, _0x246b3b, _0x4e41c6, {
      editor: _0x4cad3c,
      setNotice: _0x5a6c5
    });
    _0x410c1e.hidden = _0x62f12e?.status !== "need_confirmation";
    _0x370407.renderRunSteps(_0x5152eb?.sessionStore?.getState?.() || {});
    _0x4ff450();
    _0x267e6f({
      clearWhenMissing: true
    });
    _0x370407?.acknowledgeSessionState?.({
      taskMessages: _0x62f12e?.taskMessages || []
    });
  }
  async function _0x21446b() {
    const _0x3bbf6a = getEditorText(_0x4cad3c);
    if (!_0x3bbf6a) {
      return;
    }
    _0x41bfa9();
    _0x5a6c5("");
    _0x4d2b4a();
    const _0x435494 = _0x4afc2b.slice();
    _0x35d212();
    setEditorText(_0x4cad3c, "");
    _0x43bb4d(false);
    _0x1d4a77(true);
    _0x370407.appendMessage("user", _0x3bbf6a, {
      inputRefs: _0x435494
    });
    _0x570a51.hidden = true;
    _0x4e41c6(true, {
      stoppable: true
    });
    const _0x10e007 = _0x370407.appendWaiting();
    try {
      _0x246b3b(await _0x5152eb.handleUserMessage(_0x3bbf6a, {
        inputRefs: _0x435494
      }));
    } catch (_0x4bd0c9) {
      _0x370407.appendMessage("assistant", _0x4bd0c9?.message || "Agent failed.");
    } finally {
      _0x370407.removeWaiting(_0x10e007);
      _0x4e41c6(false);
    }
  }
  fabBtnEl.addEventListener("click", _0x59b1d8 => {
    _0x59b1d8.stopPropagation();
    _0x543ca5();
  });
  _0x390a68.addEventListener("click", () => _0x5bb403(false));
  _0x31bc03.addEventListener("click", _0x35d965);
  _0x1c94f5.addEventListener("click", _0x12516a => {
    _0x12516a.stopPropagation?.();
    const _0x33415e = !isAgentPopoverOpen(_0x40afaf);
    setMenuOpen(_0x40afaf, _0x33415e, _0x5d746d);
    if (_0x33415e) {
      renderHistory(_0x40afaf, _0x5152eb, {
        onSelect: _0x5b7a63,
        onDelete: _0x485fc3
      });
    }
  });
  _0x2c4656.addEventListener("click", _0x22da06 => {
    const _0x3f6390 = _0x22da06.target?.closest?.(".agent-quick-card");
    if (!_0x3f6390) {
      return;
    }
    setEditorText(_0x4cad3c, _0x3f6390.dataset.prompt || _0x3f6390.textContent || "");
    _0x4cad3c.focus();
  });
  _0x2c4656.addEventListener("scroll", _0x3bab59);
  _0x2c4656.addEventListener("wheel", _0x2a21f5);
  _0x4c67a0?.addEventListener?.("resize", _0x3bab59);
  _0x3ae2a9.addEventListener("click", _0x17cb02 => {
    const _0x3a3502 = _0x17cb02.target?.closest?.("[data-agent-custom-delete-action-id]");
    if (_0x3a3502) {
      _0x17cb02.preventDefault?.();
      _0x17cb02.stopPropagation?.();
      _0x2aa875(_0x3a3502.dataset.agentCustomDeleteActionId);
      return;
    }
    const _0x4e486b = _0x17cb02.target?.closest?.("[data-agent-custom-action-id]");
    const _0x4a70a9 = String(_0x4e486b?.dataset?.agentCustomActionId || "").trim();
    _0x52658e(_0x4a70a9);
  });
  _0x17732b.addEventListener("click", () => {
    const _0x8a49f3 = getEditorText(_0x4cad3c);
    _0x2feef2(_0x8a49f3 ? {
      label: truncateUiText(_0x8a49f3, 18),
      prompt: _0x8a49f3
    } : {});
    _0x14bf9a.focus?.();
  });
  _0x56f7e5.addEventListener("click", _0x5072b9);
  _0x521173.addEventListener("click", () => {
    _0x43bb4d(false);
    _0x4cad3c.focus();
  });
  _0x3b523e.addEventListener("click", _0xcf2807 => {
    _0xcf2807.stopPropagation();
    setMenuOpen(_0x2fdb70, !_0x2fdb70.classList.contains("show"), _0x5d746d);
  });
  _0x2fdb70.addEventListener("click", _0x233903 => {
    const _0x25db1e = _0x233903.target?.closest?.("[data-placeholder-action]");
    if (!_0x25db1e) {
      return;
    }
    _0x233903.stopPropagation?.();
    const _0x535d78 = _0x25db1e.dataset.placeholderAction;
    if (_0x535d78 === "upload") {
      _0x115a40.value = "";
      _0x115a40.click?.();
      _0x5a6c5(a832_0x15436d("uploadMaterial"));
    } else if (_0x535d78 === "custom") {
      _0x132a01({
        prefillFromInput: true
      });
    }
    _0x2fdb70.classList.remove("show");
  });
  _0x3017cc.addEventListener("click", _0x1c0799 => {
    _0x1c0799.stopPropagation?.();
    _0x4cdfbd();
  });
  _0x3017cc.addEventListener("keydown", _0x1cd693 => {
    if (_0x1cd693.key !== "Enter" && _0x1cd693.key !== " ") {
      return;
    }
    _0x1cd693.preventDefault?.();
    _0x4cdfbd();
  });
  _0x3a155a.addEventListener("click", _0x145adf => {
    const _0x1010b3 = _0x145adf.target?.closest?.("[data-input-ref-remove]");
    const _0x143b39 = String(_0x1010b3?.dataset?.inputRefRemove || "").trim();
    if (!_0x143b39) {
      return;
    }
    _0x4afc2b = _0x4afc2b.filter(_0x2a9c9e => _0x2a9c9e.nodeId !== _0x143b39);
    _0x4c42f4();
  });
  _0x115a40.addEventListener("change", () => {
    const _0x2f127d = _0x115a40.files?.[0];
    _0x3be03b(_0x2f127d);
    _0x115a40.value = "";
  });
  _0x210c83.addEventListener("click", _0x230123 => {
    if (_0x5043c3.hidden) {
      return;
    }
    _0x230123.stopPropagation();
    setMenuOpen(_0x2d87b8, !_0x2d87b8.classList.contains("show"), _0x5d746d);
  });
  _0x2d87b8.addEventListener("click", _0x53952c => {
    const _0x1c475c = _0x53952c.target?.closest?.("[data-execution-mode]");
    if (!_0x1c475c) {
      return;
    }
    const _0x7db7ca = normalizeAgentExecutionMode(_0x1c475c.dataset.executionMode);
    const _0x2c3e57 = _0x557298?.updateSettings?.({
      executionMode: _0x7db7ca
    }) || {
      executionMode: _0x7db7ca
    };
    _0x42b1fe.textContent = getAgentExecutionModeLabel(_0x2c3e57.executionMode);
    _0x2d87b8.querySelectorAll("[data-execution-mode]").forEach(_0x342612 => _0x342612.classList.toggle("active", _0x342612.dataset.executionMode === _0x2c3e57.executionMode));
    _0x2d87b8.classList.remove("show");
    _0x5a6c5(a832_0x15436d("executionModeSaved"));
  });
  _0x40bbef.addEventListener("submit", _0x227fbc => {
    _0x227fbc.preventDefault();
    if (_0x5ba4c5) {
      return;
    }
    _0x21446b();
  });
  _0x2c2dff.addEventListener("click", () => {
    _0x5152eb.stop?.();
    _0x176e36.querySelectorAll?.(".agent-message--typing")?.forEach(_0xad9086 => _0x370407.removeWaiting(_0xad9086));
    _0x4e41c6(false);
    _0x5a6c5(a832_0x15436d("stopRequested"));
  });
  _0x4cad3c.addEventListener("keydown", _0x335a76 => {
    if (_0x335a76.key === "Enter" && !_0x335a76.shiftKey) {
      _0x335a76.preventDefault();
      if (_0x5ba4c5) {
        return;
      }
      _0x21446b();
    }
  });
  _0x4cad3c.addEventListener("paste", _0xbb21fe => {
    const _0x11ff97 = normalizePastedImageFile(getImageFileFromClipboardData(_0xbb21fe.clipboardData));
    if (!_0x11ff97) {
      return;
    }
    _0xbb21fe.preventDefault?.();
    _0x3be03b(_0x11ff97);
  });
  _0x5d746d.addEventListener("copy", _0x102fb9);
  _0x5d746d.addEventListener("contextmenu", _0x33b712 => {
    const _0x2911a9 = _0x33b712.target?.closest?.(".agent-message-media-card");
    if (_0x2911a9) {
      _0x360187(_0x33b712, [{
        label: a832_0x15436d("imageResultOpen"),
        action: () => _0x310728(_0x2911a9.dataset.imageUrl || "", _0x2911a9.dataset.imageName || "")
      }]);
      return;
    }
    const _0x166f76 = _0x33b712.target?.closest?.(".agent-history-item");
    if (_0x166f76) {
      const _0x1c8bc8 = String(_0x166f76.dataset.conversationId || "").trim();
      if (!_0x1c8bc8) {
        return;
      }
      _0x360187(_0x33b712, [{
        label: a832_0x15436d("historyOpen"),
        action: () => _0x5b7a63(_0x1c8bc8)
      }, "sep", {
        label: a832_0x15436d("historyDelete"),
        danger: true,
        action: () => _0x485fc3(_0x1c8bc8)
      }]);
      return;
    }
    const _0x4b9c0b = _0x33b712.target?.closest?.(".agent-message");
    const _0x4a3bc4 = _0x4b9c0b ? _0x258510(_0x4b9c0b) : "";
    const _0x5766ea = _0x4a3bc4 || String(_0x4b9c0b?.agentMessageCopyText || "").trim();
    if (!_0x5766ea) {
      return;
    }
    _0x360187(_0x33b712, [{
      label: a832_0x15436d(_0x4a3bc4 ? "copySelection" : "copyMessage"),
      kbd: "Ctrl C",
      action: () => void _0x31844f(_0x5766ea)
    }]);
  });
  _0x5d746d.addEventListener("pointerdown", _0x240ee5 => _0x240ee5.stopPropagation());
  _0x5d746d.addEventListener("click", _0x392e00 => {
    if (isAgentMenuSurface(_0x392e00.target)) {
      return;
    }
    closeFloatingMenus(_0x5d746d);
  });
  document?.addEventListener?.("click", _0x52cbab => {
    if (!_0x5d746d.contains(_0x52cbab.target)) {
      closeFloatingMenus(_0x5d746d);
    }
  });
  document?.addEventListener?.("keydown", _0x5ef86a => {
    if (_0x5ef86a.key !== "Escape") {
      return;
    }
    if (!hasOpenFloatingMenus(_0x5d746d)) {
      return;
    }
    _0x5ef86a.preventDefault?.();
    closeFloatingMenus(_0x5d746d);
  });
  _0xbc9f60.addEventListener("pointerdown", _0x18d136);
  _0xbc9f60.addEventListener("keydown", _0x16aaa2 => {
    if (_0x16aaa2.key !== "ArrowLeft" && _0x16aaa2.key !== "ArrowRight") {
      return;
    }
    _0x16aaa2.preventDefault();
    const _0x563578 = _0x5d746d.getBoundingClientRect?.().width || _0x5d746d.offsetWidth || 0;
    const _0x2d7241 = _0x16aaa2.key === "ArrowLeft" ? 24 : -24;
    _0x3a3fd6(_0x563578 + _0x2d7241, {
      persist: true
    });
  });
  _0x6d523e.addEventListener("click", async () => {
    if (_0x5ba4c5) {
      return;
    }
    const _0x132573 = a832_0x15436d("confirmUserMessage");
    _0x370407.appendMessage("user", _0x132573);
    _0x570a51.hidden = true;
    _0x410c1e.hidden = true;
    _0x4e41c6(true, {
      stoppable: true
    });
    const _0x34771c = _0x370407.appendWaiting();
    try {
      _0x246b3b(await _0x5152eb.confirmPendingPlan({
        displayAnswer: _0x132573
      }));
    } catch (_0x54daba) {
      _0x370407.appendMessage("assistant", _0x54daba?.message || "Agent confirmation failed.");
    } finally {
      _0x370407.removeWaiting(_0x34771c);
      _0x4e41c6(false);
    }
  });
  _0x2701c6.addEventListener("click", () => {
    if (_0x5ba4c5) {
      return;
    }
    _0x410c1e.hidden = true;
    _0x4e41c6(true);
    try {
      _0x246b3b(_0x5152eb.cancelPendingPlan());
    } finally {
      _0x4e41c6(false);
    }
  });
  _0x3e2164.addEventListener("click", async () => {
    if (_0x5ba4c5 || typeof _0x5152eb?.resumeInterruptedRun !== "function") {
      return;
    }
    _0x4e41c6(true, {
      stoppable: true
    });
    const _0x195376 = _0x370407.appendWaiting();
    try {
      _0x246b3b(await _0x5152eb.resumeInterruptedRun());
    } catch (_0x506211) {
      _0x246b3b({
        ok: false,
        status: "failed",
        reply: _0x506211?.message || "Agent resume failed."
      });
    } finally {
      _0x370407.removeWaiting(_0x195376);
      _0x4e41c6(false);
      _0x4ff450();
    }
  });
  _0xb64a07.addEventListener("click", () => {
    if (_0x5ba4c5 || typeof _0x5152eb?.discardInterruptedRun !== "function") {
      return;
    }
    _0x4e41c6(true);
    try {
      _0x246b3b(_0x5152eb.discardInterruptedRun());
    } finally {
      _0x4e41c6(false);
      _0x1d07a0();
      _0x4ff450();
    }
  });
  _0x36dc1a.addEventListener("click", () => {
    if (_0x5ba4c5 || typeof _0x5152eb?.undoLastAgentRun !== "function") {
      return;
    }
    _0x4e41c6(true);
    try {
      _0x246b3b(_0x5152eb.undoLastAgentRun());
    } finally {
      _0x4e41c6(false);
      _0x4ff450();
    }
  });
  _0x370407 = createAgentConversationPresentation({
    messagesEl: _0x176e36,
    runStepsEl: _0x4790a4,
    sessionStore: _0x5152eb.sessionStore,
    getHistory: _0x59b317,
    onCopy: _0x31844f,
    onImagePreview: _0x310728,
    copyIconHtml: iconSvg("copy"),
    onMessagesChanged: _0xddd7ed,
    onConversationInvalidated: ({
      historyOnly = false
    } = {}) => {
      if (!historyOnly) {
        return _0x3e5528({
          preserveNotice: true
        });
      }
      _0x370407?.render({
        history: _0x59b317(),
        sessionSnapshot: _0x5152eb?.sessionStore?.getState?.() || {}
      });
      _0xddd7ed();
      _0x4ff450();
    }
  });
  const _0x1ed7ca = onLocaleChange(_0xfa4ddb);
  _0x3e5528({
    restorePendingInputRefs: true
  });
  return {
    panel: _0x5d746d,
    open: () => _0x5bb403(true),
    close: () => _0x5bb403(false),
    toggle: _0x543ca5,
    collapse: () => _0x52d2a1(true),
    expand: () => _0x52d2a1(false),
    reset: _0x35d965,
    setWidth: _0xa1cbef => _0x3a3fd6(_0xa1cbef, {
      persist: true
    }),
    destroy: () => {
      _0x49d722();
      _0x26e64c?.destroy?.();
      _0x370407?.destroy?.();
      _0x1ed7ca();
      _0x4d2b4a();
      _0x2a32fe();
      document?.body?.classList?.remove?.("agent-sidebar-open", "agent-sidebar-collapsed", "agent-sidebar-resizing");
      fabBtnEl.classList?.remove?.("is-agent-open");
      _0x5d746d.remove?.();
      _0x4c8155.remove?.();
    }
  };
}