import a359_0x3eace0 from "../core/stores/appStore.js";
import { getDisplayModelName } from "../modules/providers.js";
import { ensureThumbDecoded, revealRefThumbMedia } from "../modules/refThumbMediaReveal.js";
import { commit } from "../modules/history.js";
import { TEXT_TOOLBAR_HTML, bindTextToolbarEvents } from "./NodeToolbarConfig.js";
import { getPromptPresets, openCustomPresetsManager } from "../modules/promptPresets.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import { buildGenerateTextRequest, generateText } from "../../api/aiTextApi.js";
import { getCustomTextModels, saveCustomTextModels } from "./aigenText/customTextModels.js";
import { bindRefThumbHoverPreview } from "../modules/refThumbHoverPreview.js";
import { createReferenceMaskBadgeHtml } from "../modules/refThumbMaskBadge.js";
import { createReferenceInputThumbnailHtml, resolveReferenceVideoThumbnail } from "../modules/referenceInputThumbnail.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { t as a359_0x22368b } from "../i18n/index.js";
import { checkSlashTrigger, handleSlashKeyboardNavigation, closeSlashMenu } from "../modules/slashMenu.js";
import { activateMenuKeyboard } from "../modules/floatingMenuKeyboard.js";
import { createPromptAttachmentButtonHTML } from "./refAttachmentButton.js";
import { _checkAtTrigger, _populateMentionMenu, _handleMentionMenuKeyboard, _handlePillKeyboard, _rehydratePromptPills, _handlePillHover, _handlePillOut, _syncEdgesOrderFromPills, _syncPillLabels, flushPromptHtmlCommit, handlePromptPaste, handlePromptSelectAll, schedulePromptHtmlCommit } from "../modules/nodePromptShared.js";
import { createAIGenTextNodeUiModule } from "./aigenText/uiModule.js";
import { createAIGenTextNodeStateSyncModule } from "./aigenText/stateSyncModule.js";
import { createAIGenTextNodeTaskOrchestrationModule } from "./aigenText/taskOrchestrationModule.js";
const api = {
  buildGenerateTextRequest: buildGenerateTextRequest,
  generateText: generateText
};
const AI_GEN_TEXT_NODE_MODULE_DEPS = {
  store: a359_0x3eace0,
  api: api,
  getDisplayModelName: getDisplayModelName,
  ensureThumbDecoded: ensureThumbDecoded,
  revealRefThumbMedia: revealRefThumbMedia,
  commit: commit,
  TEXT_TOOLBAR_HTML: TEXT_TOOLBAR_HTML,
  bindTextToolbarEvents: bindTextToolbarEvents,
  getPromptPresets: getPromptPresets,
  openCustomPresetsManager: openCustomPresetsManager,
  startLoading: startLoading,
  stopLoading: stopLoading,
  bindRefThumbHoverPreview: bindRefThumbHoverPreview,
  checkSlashTrigger: checkSlashTrigger,
  handleSlashKeyboardNavigation: handleSlashKeyboardNavigation,
  closeSlashMenu: closeSlashMenu,
  activateMenuKeyboard: activateMenuKeyboard,
  _checkAtTrigger: _checkAtTrigger,
  _populateMentionMenu: _populateMentionMenu,
  _handleMentionMenuKeyboard: _handleMentionMenuKeyboard,
  _handlePillKeyboard: _handlePillKeyboard,
  _rehydratePromptPills: _rehydratePromptPills,
  _handlePillHover: _handlePillHover,
  _handlePillOut: _handlePillOut,
  _syncEdgesOrderFromPills: _syncEdgesOrderFromPills,
  _syncPillLabels: _syncPillLabels,
  handlePromptPaste: handlePromptPaste,
  handlePromptSelectAll: handlePromptSelectAll,
  getCustomTextModels: getCustomTextModels,
  saveCustomTextModels: saveCustomTextModels
};
export class AIGenTextNode {
  constructor(_0x14a42a) {
    this._data = _0x14a42a;
    this.nodeId = _0x14a42a.id;
    this.previewEl = null;
    this.outputEl = null;
    this.refBarEl = null;
    this.promptEl = null;
    this.btnEl = null;
    this.modelWrap = null;
    this._dragSrcIdx = null;
    this._dragBounds = [];
    this._lastEdgeSig = null;
    this._outputScrollTop = Number.isFinite(_0x14a42a?.outputScrollTop) ? Math.max(0, _0x14a42a.outputScrollTop) : 0;
    this._outputScrollTopDirty = false;
    this._outputScrollTopCommitTimer = null;
    this._lastRenderedOutputText = "";
    this._footerControllerCleanup = null;
    this._modelProviderProfileControl = null;
  }
  _checkAtTrigger(_0x4d238c) {
    return _checkAtTrigger(this, _0x4d238c);
  }
  _populateMentionMenu(_0x13b233, _0x58bdec, _0x4c84e0, _0x4e6a2f = "", _0x20f7d3 = -1, _0x18105a = null) {
    return _populateMentionMenu(this, {
      x: _0x13b233,
      y: _0x58bdec,
      triggerRange: _0x4c84e0,
      query: _0x4e6a2f,
      atIndex: _0x20f7d3,
      pillToEdit: _0x18105a
    });
  }
  _handlePillKeyboard(_0x18fcd2) {
    return _handlePillKeyboard(this, _0x18fcd2);
  }
  unmount() {
    this._commitOutputScrollTop?.();
    this._flushPromptHtmlCommit?.();
    this._unbindOutputTextSelection?.();
    this._unbindOutputTextSelection = null;
    this._unbindLocaleChange?.();
    this._unbindLocaleChange = null;
    this._footerControllerCleanup?.();
    this._footerControllerCleanup = null;
    this._modelProviderProfileControl?.remove();
    this._modelProviderProfileControl = null;
    this._promptPresetTrigger?.remove();
    this._promptPresetTrigger = null;
  }
}
const aiGenTextNodeUiModule = createAIGenTextNodeUiModule(AI_GEN_TEXT_NODE_MODULE_DEPS);
const aiGenTextNodeStateSyncModule = createAIGenTextNodeStateSyncModule(AI_GEN_TEXT_NODE_MODULE_DEPS);
const aiGenTextNodeTaskOrchestrationModule = createAIGenTextNodeTaskOrchestrationModule(AI_GEN_TEXT_NODE_MODULE_DEPS);
function applyClassPrototypeMethods(_0x101f59, _0x11bb6b) {
  if (!_0x11bb6b) {
    return;
  }
  const _0x3e66ee = Object.getOwnPropertyDescriptors(_0x11bb6b);
  delete _0x3e66ee.constructor;
  Object.defineProperties(_0x101f59, _0x3e66ee);
}
applyClassPrototypeMethods(AIGenTextNode.prototype, aiGenTextNodeUiModule);
applyClassPrototypeMethods(AIGenTextNode.prototype, aiGenTextNodeStateSyncModule);
applyClassPrototypeMethods(AIGenTextNode.prototype, aiGenTextNodeTaskOrchestrationModule);
export function _renderSharedRefBar(_0x165bfa) {
  if (!_0x165bfa.refBarEl) {
    return;
  }
  const _0xc2845 = a359_0x3eace0.getState();
  const _0x5f2d46 = _0xc2845.nodes || {};
  const _0x3ab7ad = a359_0x3eace0.getIncomingEdges(_0x165bfa.nodeId);
  let _0x2f946e = {
    text: 0,
    image: 0,
    video: 0,
    audio: 0
  };
  const _0x4bb1d3 = {};
  const _0x232041 = createPromptAttachmentButtonHTML();
  if (_0x165bfa._isDraggingSorting) {
    _syncPillLabels(_0x165bfa, _0x4bb1d3);
    return;
  }
  const _0x1705c2 = _0x18a430 => {
    return localPathToUrl(_0x18a430);
  };
  const _0x40cba4 = _0x10984a => {
    const _0x513e33 = String(_0x10984a || "").trim().toLowerCase();
    if (!_0x513e33) {
      return false;
    }
    if (_0x513e33.startsWith("data:image/")) {
      return true;
    }
    return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(_0x513e33);
  };
  const _0x21b0a1 = _0x2de3c2 => {
    return String(_0x2de3c2?.src || "").trim() || _0x1705c2(_0x2de3c2?.localPath) || String(_0x2de3c2?.imageUrl || "").trim() || String(_0x2de3c2?.thumbUrl || "").trim();
  };
  const _0x4db262 = _0x90091 => {
    const _0x1d98c6 = [String(_0x90091?.thumbUrl || "").trim(), String(_0x90091?.imageUrl || "").trim(), String(_0x90091?.src || "").trim(), _0x1705c2(_0x90091?.localPath), String(_0x90091?.audioUrl || "").trim()].filter(Boolean);
    return _0x1d98c6.find(_0x1b3333 => _0x40cba4(_0x1b3333)) || "";
  };
  const _0x3d4887 = [];
  for (const _0x22fdb8 of _0x3ab7ad) {
    const _0x2b1cf9 = _0x5f2d46[_0x22fdb8.sourceId];
    if (!_0x2b1cf9) {
      continue;
    }
    const _0xe87cec = _0x2b1cf9.type || "";
    let _0x2bedeb = "";
    if (_0xe87cec === "text" || _0xe87cec === "source-text" || _0xe87cec === "ai-text") {
      _0x2f946e.text++;
      _0x2bedeb = "text";
    } else if (_0xe87cec === "source-image" || _0xe87cec === "ai-image") {
      _0x2f946e.image++;
      _0x2bedeb = "image";
    } else if (_0xe87cec === "source-video" || _0xe87cec === "video" || _0xe87cec === "ai-video") {
      _0x2f946e.video++;
      _0x2bedeb = "video";
    } else if (_0xe87cec === "source-audio" || _0xe87cec === "audio" || _0xe87cec === "ai-audio") {
      _0x2f946e.audio++;
      _0x2bedeb = "audio";
    }
    if (_0x2bedeb) {
      const _0x2049ff = {
        text: a359_0x22368b("aigenText.refs.types.text"),
        image: a359_0x22368b("aigenText.refs.types.image"),
        video: a359_0x22368b("aigenText.refs.types.video"),
        audio: a359_0x22368b("aigenText.refs.types.audio")
      };
      const _0x27434f = "@" + (_0x2049ff[_0x2bedeb] || _0x2bedeb) + _0x2f946e[_0x2bedeb];
      _0x4bb1d3[_0x22fdb8.sourceId] = _0x27434f;
    }
    let _0xe46015 = "";
    if (_0xe87cec === "source-image") {
      const _0x16fa7d = _0x21b0a1(_0x2b1cf9);
      if (_0x16fa7d) {
        ensureThumbDecoded(_0x16fa7d);
      }
      _0xe46015 = createReferenceInputThumbnailHtml({
        kind: "image",
        thumbnailUrl: _0x16fa7d,
        extraHtml: createReferenceMaskBadgeHtml(_0x2b1cf9)
      });
    } else if (_0xe87cec === "ai-image") {
      const _0x19e8d0 = _0x21b0a1(_0x2b1cf9);
      if (_0x19e8d0) {
        ensureThumbDecoded(_0x19e8d0);
      }
      _0xe46015 = createReferenceInputThumbnailHtml({
        kind: "image",
        thumbnailUrl: _0x19e8d0,
        extraHtml: createReferenceMaskBadgeHtml(_0x2b1cf9)
      });
    } else if (_0xe87cec === "source-text" || _0xe87cec === "text") {
      _0xe46015 = createReferenceInputThumbnailHtml({
        kind: "text"
      });
    } else if (_0xe87cec === "ai-text") {
      const _0x37ed5a = String(_0x2b1cf9.outputText || _0x2b1cf9.text || _0x2b1cf9.content || _0x2b1cf9.prompt || "").trim();
      if (!_0x37ed5a) {
        continue;
      }
      _0xe46015 = createReferenceInputThumbnailHtml({
        kind: "text"
      });
    } else if (_0xe87cec === "source-video" || _0xe87cec === "video" || _0xe87cec === "ai-video") {
      const _0x27e740 = resolveReferenceVideoThumbnail(_0x2b1cf9, _0x22fdb8).thumbUrl;
      if (_0x27e740) {
        ensureThumbDecoded(_0x27e740);
      }
      _0xe46015 = createReferenceInputThumbnailHtml({
        kind: "video",
        thumbnailUrl: _0x27e740
      });
    } else if (_0xe87cec === "source-audio" || _0xe87cec === "audio" || _0xe87cec === "ai-audio") {
      const _0x48b01d = _0x4db262(_0x2b1cf9);
      if (_0x48b01d) {
        ensureThumbDecoded(_0x48b01d);
      }
      _0xe46015 = createReferenceInputThumbnailHtml({
        kind: "audio",
        thumbnailUrl: _0x48b01d
      });
    }
    if (!_0xe46015) {
      continue;
    }
    const _0x5e1fa4 = String(_0x2b1cf9.mask || "").trim() ? "m1" : "m0";
    const _0x215b61 = Number.isFinite(Number(_0x2b1cf9.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x2b1cf9.mainVideoIndex))) : 0;
    const _0x54685c = Array.isArray(_0x2b1cf9.videos) ? _0x2b1cf9.videos[_0x215b61] || _0x2b1cf9.videos[0] : null;
    const _0x54341f = _0xe87cec + "|" + _0x22fdb8.id + "|" + _0x22fdb8.sourceId + "|" + (_0x2b1cf9.src || _0x2b1cf9.imageUrl || _0x2b1cf9.thumbUrl || _0x2b1cf9.videoUrl || _0x2b1cf9.audioUrl || "") + "|" + (_0x2b1cf9.localPath || "") + "|" + (_0x2b1cf9.thumbId || "") + "|" + (_0x54685c?.thumbUrl || "") + "|" + (_0x54685c?.localPath || "") + "|" + (_0x54685c?.videoUrl || "") + "|" + _0x5e1fa4;
    _0x3d4887.push({
      edgeId: _0x22fdb8.id,
      sourceId: _0x22fdb8.sourceId,
      sig: _0x54341f,
      thumb: _0xe46015
    });
  }
  if (_0x3d4887.length === 0) {
    const _0x21d8f3 = !!_0x165bfa.refBarEl.querySelector(".ref-thumb-wrap");
    const _0x46a1fe = !!_0x165bfa.refBarEl.querySelector(".ref-thumb-container");
    if (_0x165bfa._lastRefHTML !== _0x232041 || _0x21d8f3 || _0x46a1fe) {
      _0x165bfa._lastRefHTML = _0x232041;
      _0x165bfa.refBarEl.classList.remove("active");
      _0x165bfa.refBarEl.innerHTML = _0x232041;
    }
    _syncPillLabels(_0x165bfa, _0x4bb1d3);
    return;
  }
  _0x165bfa._lastRefHTML = "__has-items__";
  _0x165bfa.refBarEl.classList.add("active");
  let _0x78aae9 = _0x165bfa.refBarEl.querySelector(".prompt-attachment-btn");
  let _0x49a787 = _0x165bfa.refBarEl.querySelector(".ref-thumb-container");
  if (!_0x78aae9 || !_0x49a787) {
    _0x165bfa.refBarEl.innerHTML = _0x232041 + " <div class=\"ref-thumb-container\"></div>";
    _0x78aae9 = _0x165bfa.refBarEl.querySelector(".prompt-attachment-btn");
    _0x49a787 = _0x165bfa.refBarEl.querySelector(".ref-thumb-container");
  }
  const _0xf1ae85 = new Map();
  _0x49a787.querySelectorAll(".ref-thumb-wrap").forEach(_0x1fc6f3 => _0xf1ae85.set(_0x1fc6f3.dataset.edgeId, _0x1fc6f3));
  const _0x29a28a = new Set();
  for (const _0x2fdc6d of _0x3d4887) {
    let _0x3f9306 = _0xf1ae85.get(_0x2fdc6d.edgeId);
    if (!_0x3f9306) {
      _0x3f9306 = document.createElement("div");
      _0x3f9306.className = "ref-thumb-wrap";
    }
    if (_0x3f9306.dataset.sig !== _0x2fdc6d.sig) {
      _0x3f9306.innerHTML = _0x2fdc6d.thumb + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + a359_0x22368b("aigenText.refs.remove") + "\">×</button>";
      _0x3f9306.dataset.sig = _0x2fdc6d.sig;
      revealRefThumbMedia(_0x3f9306, _0x2fdc6d.sig);
    }
    _0x3f9306.dataset.edgeId = _0x2fdc6d.edgeId;
    _0x3f9306.dataset.sourceId = _0x2fdc6d.sourceId;
    _0x49a787.appendChild(_0x3f9306);
    _0x29a28a.add(_0x2fdc6d.edgeId);
  }
  for (const [_0x413b, _0x2b8ab9] of _0xf1ae85.entries()) {
    if (!_0x29a28a.has(_0x413b)) {
      _0x2b8ab9.remove();
    }
  }
  _syncPillLabels(_0x165bfa, _0x4bb1d3);
}