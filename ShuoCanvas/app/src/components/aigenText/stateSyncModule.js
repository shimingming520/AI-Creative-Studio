import { sanitizePromptHtml } from "../../utils/dom.js";
import { clearVirtualizedPromptCommit, isVirtualizedPromptEditorCurrent } from "../../modules/promptPasteVirtualization.js";
import { createReferenceMaskBadgeHtml, getReferenceMaskSignaturePart, hasReferenceMask } from "../../modules/refThumbMaskBadge.js";
import { createReferenceInputThumbnailHtml, resolveReferenceVideoThumbnail } from "../../modules/referenceInputThumbnail.js";
import { resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { createPromptAttachmentButtonHTML } from "../refAttachmentButton.js";
import { bindRefThumbOrderDrag } from "../../modules/refThumbDragController.js";
import { resolvePromptTextWithTextRefs, resolveTextReferenceContent } from "../../modules/nodePromptShared.js";
import { isTaskTerminal, resolveGenerationButtonMode, shouldShowGenerationBusyUi } from "../../core/generationTaskUiState.js";
import { resetGenerateButtonIdleUi, setGenerateButtonLoadingUi } from "../../modules/previewGenerateButtonUi.js";
import { t } from "../../i18n/index.js";
import { applyModelCredentialButtonState, resetModelCredentialButtonState } from "../../modules/modelCredentialUi.js";
export function createAIGenTextNodeStateSyncModule(_0x543389) {
  const {
    store: _0x1dd8f8,
    api: _0x27816b,
    getDisplayModelName: _0x853465,
    ensureThumbDecoded: _0x1c4707,
    revealRefThumbMedia: _0x1a65fc,
    commit: _0x4ac7e3,
    TEXT_TOOLBAR_HTML: _0x313838,
    bindTextToolbarEvents: _0x3c97,
    getPromptPresets: _0x17043f,
    openCustomPresetsManager: _0x10b857,
    startLoading: _0x202925,
    stopLoading: _0x58986e,
    bindRefThumbHoverPreview: _0x4849c6,
    checkSlashTrigger: _0x29a62c,
    handleSlashKeyboardNavigation: _0x26c00e,
    closeSlashMenu: _0x56df5b,
    activateMenuKeyboard: _0x472577,
    _checkAtTrigger: _0x4bfd6f,
    _populateMentionMenu: _0x4196d9,
    _handleMentionMenuKeyboard: _0x44657c,
    _handlePillKeyboard: _0x1c075d,
    _rehydratePromptPills: _0x2e26fb,
    _handlePillHover: _0x1783ce,
    _handlePillOut: _0x13b178,
    _syncEdgesOrderFromPills: _0xd14ad5,
    _syncPillLabels: _0x1f5a38,
    getCustomTextModels: _0x80b94e,
    saveCustomTextModels: _0x69ff6c
  } = _0x543389;
  class _0x5c4458 {
    _getStoreStateForRead() {
      if (typeof _0x1dd8f8.getStateRaw === "function") {
        return _0x1dd8f8.getStateRaw();
      }
      if (typeof _0x1dd8f8.getState === "function") {
        return _0x1dd8f8.getState();
      }
      return {};
    }
    _getEffectiveSubmitPromptText() {
      const _0xfbb974 = this._getStoreStateForRead();
      return resolvePromptTextWithTextRefs({
        promptEl: this.promptEl,
        inEdges: typeof _0x1dd8f8.getIncomingEdges === "function" ? _0x1dd8f8.getIncomingEdges(this.nodeId) : [],
        nodes: _0xfbb974?.nodes || {}
      });
    }
    _updateSubmitButtonState() {
      if (!this.btnEl) {
        return;
      }
      const _0x441dc1 = this._getEffectiveSubmitPromptText();
      const _0x1deb34 = this._getStoreStateForRead().nodes?.[this.nodeId] || this._data || {};
      const _0x5a6721 = resolveGenerationButtonMode(this._isGenerating && _0x1deb34?.jobStatus !== "error" ? {
        ..._0x1deb34,
        isGenerating: true,
        jobStatus: _0x1deb34.jobStatus || "running"
      } : _0x1deb34, {
        cancellable: _0x1deb34?.taskCancellable === true
      });
      if (_0x5a6721.busy) {
        setGenerateButtonLoadingUi(this.btnEl, {
          title: t("aigenText.generate"),
          disabled: _0x5a6721.disabled,
          ariaLabel: t("aigenText.generate")
        });
        this.btnEl.disabled = _0x5a6721.disabled;
        this.btnEl.style.cursor = _0x5a6721.cursor;
        return;
      }
      resetGenerateButtonIdleUi(this.btnEl, t("aigenText.generate"));
      resetModelCredentialButtonState(this.btnEl);
      if (!_0x441dc1) {
        this.btnEl.disabled = true;
        this.btnEl.style.cursor = "var(--unavailable-cursor)";
      } else {
        this.btnEl.disabled = false;
        this.btnEl.style.cursor = "";
        applyModelCredentialButtonState(this.btnEl, {
          modelId: _0x1deb34?.model,
          provider: _0x1deb34?.provider,
          providerProfileId: _0x1deb34?.providerProfileId || _0x1deb34?.rhProviderProfileId
        });
      }
    }
    update(_0xe55930) {
      this._data = _0xe55930;
      if (shouldShowGenerationBusyUi(_0xe55930)) {
        this._isGenerating = true;
        if (this.previewEl && typeof _0x202925 === "function") {
          _0x202925(this.previewEl);
        }
      } else if (isTaskTerminal(_0xe55930)) {
        this._isGenerating = false;
        if (this.previewEl && typeof _0x58986e === "function") {
          _0x58986e(this.previewEl);
        }
      }
      const _0x95ef2a = this.outputEl?.classList?.contains?.("is-text-selection-active") === true;
      const _0x2bb32f = this._outputScrollTopDirty === true;
      const _0x28243e = String(_0xe55930.outputText || "");
      const _0x5e8cda = _0x28243e !== this._lastRenderedOutputText;
      if (!_0x95ef2a && !_0x2bb32f && Number.isFinite(_0xe55930.outputScrollTop)) {
        this._outputScrollTop = Math.max(0, _0xe55930.outputScrollTop);
      }
      const _0x54624b = this.outputEl && document.activeElement === this.outputEl && this.outputEl.getAttribute?.("contenteditable") === "true";
      if (!_0x54624b && !_0x95ef2a && _0x5e8cda && this.outputEl) {
        this._renderOutputText?.(_0x28243e);
      }
      if (this.outputEl && document.activeElement !== this.outputEl && !_0x95ef2a && !_0x2bb32f) {
        this.outputEl.scrollTop = this._outputScrollTop;
      }
      const _0x5131dd = this._getStoreStateForRead().pickConnectMode;
      if (this._placeholderEl) {
        const _0x2dd44c = this._placeholderEl.querySelector(".placeholder-icon-svg");
        if (_0x2dd44c) {
          if (_0x5131dd.active && _0x5131dd.sourceNodeId === this.nodeId) {
            _0x2dd44c.classList.add("is-pick-connecting");
          } else {
            _0x2dd44c.classList.remove("is-pick-connecting");
          }
        }
      }
      const _0x77d1fe = this.refBarEl?.querySelector(".prompt-attachment-btn");
      if (_0x77d1fe) {
        const _0x72eafb = _0x77d1fe.querySelector(".btn-icon");
        if (_0x72eafb) {
          const _0x21edcc = _0x5131dd.active && _0x5131dd.sourceNodeId === this.nodeId;
          _0x72eafb.style.transition = "opacity 0.2s ease, transform 0.2s ease";
          _0x72eafb.style.opacity = _0x21edcc ? "0" : "";
          _0x72eafb.style.transform = _0x21edcc ? "scale(0.4)" : "";
        }
      }
      if (document.activeElement !== this.promptEl && _0xe55930.prompt !== undefined) {
        if (!isVirtualizedPromptEditorCurrent(this, _0xe55930.prompt)) {
          const _0x4baa26 = sanitizePromptHtml(_0xe55930.prompt || "");
          if (this.promptEl?.innerHTML !== _0x4baa26) {
            clearVirtualizedPromptCommit(this);
            this.promptEl.innerHTML = _0x4baa26;
            _0x2e26fb(this);
          }
        }
      }
      this._syncPromptBoxSizeFromData?.(_0xe55930);
      this._modelProviderProfileControl?.sync();
      const _0x58b483 = this.modelWrap?.querySelector(".img-model-label");
      if (_0x58b483 && _0xe55930.model) {
        _0x58b483.textContent = _0x853465(_0xe55930.model);
      }
      const _0x4c6f03 = this._getStoreStateForRead();
      const _0x4a9a8a = _0x4c6f03.nodes || {};
      const _0x59f265 = _0x1dd8f8.getIncomingEdges(this.nodeId);
      const _0x551685 = (_0x306295, _0x33c35c) => {
        if (!_0x306295) {
          return "0";
        }
        const _0x45fc88 = resolveEffectiveInputKind(_0x306295, _0x33c35c);
        const _0x2768fb = _0x306295._bizRev ?? "";
        const _0x43f5d6 = hasReferenceMask(_0x306295);
        const _0x12a447 = !!resolveTextReferenceContent(_0x306295);
        const _0x5e1c0c = !!_0x306295.thumbId || !!_0x306295.thumbUrl || !!_0x306295.imageUrl || !!_0x306295.src || !!_0x306295.localPath;
        const _0x1491f9 = Array.isArray(_0x306295.videos) && _0x306295.videos.length > 0 || !!_0x306295.thumbId || !!_0x306295.thumbUrl || !!_0x306295.videoUrl || !!_0x306295.src || !!_0x306295.localPath;
        const _0x45509f = !!_0x306295.audioUrl || !!_0x306295.src || !!_0x306295.localPath;
        if (_0x45fc88 === "text") {
          return "t:" + _0x2768fb + ":" + (_0x12a447 ? 1 : 0);
        }
        if (_0x45fc88 === "video") {
          const _0x157745 = resolveReferenceVideoThumbnail(_0x306295, _0x33c35c).thumbUrl;
          return "v:" + _0x2768fb + ":" + (_0x1491f9 ? 1 : 0) + ":" + _0x157745;
        }
        if (_0x45fc88 === "audio") {
          return "a:" + _0x2768fb + ":" + (_0x45509f ? 1 : 0);
        }
        return "i:" + _0x2768fb + ":" + (_0x5e1c0c ? 1 : 0) + ":" + (_0x43f5d6 ? 1 : 0);
      };
      const _0x9c4967 = [..._0x59f265];
      const _0x247564 = _0x9c4967.map(_0x497074 => _0x497074.id + ":" + _0x497074.sourceId + ":" + String(_0x497074?.refSlot || "") + ":" + String(_0x497074?.sourceMediaKey || "") + ":" + _0x551685(_0x4a9a8a[_0x497074.sourceId], _0x497074)).join("|");
      if (_0x247564 !== this._lastEdgeSig) {
        this._lastEdgeSig = _0x247564;
        this._renderRefBar();
      }
      this._updateSubmitButtonState();
    }
    _renderRefBar() {
      if (!this.refBarEl) {
        return;
      }
      const _0x321aeb = _0x1dd8f8.getState();
      const _0x5e4736 = _0x321aeb.nodes || {};
      const _0x27fb87 = _0x1dd8f8.getIncomingEdges(this.nodeId);
      this._lastInEdgeCount = _0x27fb87.length;
      const _0x1b51a5 = createPromptAttachmentButtonHTML();
      if (_0x27fb87.length === 0) {
        const _0x8ccf61 = _0x1b51a5;
        if (this._lastRefHTML !== _0x8ccf61) {
          this._lastRefHTML = _0x8ccf61;
          this.refBarEl.classList.remove("active");
          this.refBarEl.innerHTML = _0x8ccf61;
        }
        this._syncBtnIconState();
        return;
      }
      const _0x3c9e0e = {
        text: 0,
        image: 0,
        video: 0,
        audio: 0
      };
      const _0x1626d0 = [];
      const _0x85aa27 = {};
      _0x27fb87.forEach(_0x3bc8df => {
        const _0x647601 = _0x5e4736[_0x3bc8df.sourceId];
        if (!_0x647601) {
          return;
        }
        const _0x29c1e4 = resolveEffectiveInputKind(_0x647601, _0x3bc8df) || "other";
        _0x3c9e0e[_0x29c1e4] = (_0x3c9e0e[_0x29c1e4] || 0) + 1;
        const _0x10e046 = {
          text: t("aigenText.refs.types.text"),
          image: t("aigenText.refs.types.image"),
          video: t("aigenText.refs.types.video"),
          audio: t("aigenText.refs.types.audio"),
          group: t("aigenText.refs.types.group"),
          other: t("aigenText.refs.types.other")
        };
        const _0x2f5f45 = "@" + _0x10e046[_0x29c1e4] + _0x3c9e0e[_0x29c1e4];
        _0x85aa27[_0x3bc8df.sourceId] = _0x2f5f45;
        let _0x544d2c = "";
        const _0x508a8d = String(_0x647601.src || _0x647601.imageUrl || _0x647601.thumbUrl || "").trim();
        if (_0x29c1e4 === "image" && _0x508a8d) {
          _0x1c4707(_0x508a8d);
          _0x544d2c = createReferenceInputThumbnailHtml({
            kind: "image",
            thumbnailUrl: _0x508a8d,
            extraHtml: createReferenceMaskBadgeHtml(_0x647601)
          });
        } else if (_0x29c1e4 === "text") {
          const _0x557731 = resolveTextReferenceContent(_0x647601);
          if (!_0x557731) {
            return;
          }
          _0x544d2c = createReferenceInputThumbnailHtml({
            kind: "text"
          });
        } else if (_0x29c1e4 === "video") {
          const _0x42e90f = Array.isArray(_0x647601.videos) && _0x647601.videos.length > 0 || !!_0x647601.thumbId || !!_0x647601.thumbUrl || !!_0x647601.videoUrl || !!_0x647601.src || !!_0x647601.localPath;
          if (!_0x42e90f) {
            return;
          }
          const _0x4ba718 = resolveReferenceVideoThumbnail(_0x647601, _0x3bc8df).thumbUrl;
          if (_0x4ba718) {
            _0x1c4707(_0x4ba718);
          }
          _0x544d2c = createReferenceInputThumbnailHtml({
            kind: "video",
            thumbnailUrl: _0x4ba718
          });
        } else if (_0x29c1e4 === "audio") {
          const _0x46d17c = !!_0x647601.audioUrl || !!_0x647601.src || !!_0x647601.localPath;
          if (!_0x46d17c) {
            return;
          }
          _0x544d2c = createReferenceInputThumbnailHtml({
            kind: "audio"
          });
        } else if (_0x29c1e4 === "group" || _0x29c1e4 === "other") {
          const _0x1e178f = _0x29c1e4 === "group";
          const _0x5ad061 = _0x1e178f ? _0x647601.color || "var(--indigo)" : "var(--text-muted)";
          const _0x29d563 = (_0x647601.name || (_0x1e178f ? t("aigenText.refs.groupShortName") : t("aigenText.refs.nodeShortName"))).substring(0, 2).toUpperCase();
          _0x544d2c = "<div class=\"ref-thumb-media\" style=\"display:flex;align-items:center;justify-content:center;background:" + _0x5ad061 + "33;border:1px solid " + _0x5ad061 + "80;box-sizing:border-box;\">\n                    <span style=\"color:" + _0x5ad061 + ";font-size:12px;font-weight:bold;letter-spacing:1px;user-select:none;\">" + _0x29d563 + "</span>\n                </div>";
        }
        if (_0x544d2c) {
          _0x1626d0.push({
            edgeId: _0x3bc8df.id,
            sourceId: _0x3bc8df.sourceId,
            type: _0x29c1e4,
            label: _0x2f5f45,
            index: _0x1626d0.length,
            sig: _0x29c1e4 + "|" + _0x3bc8df.id + "|" + _0x3bc8df.sourceId + "|" + _0x544d2c + "|" + getReferenceMaskSignaturePart(_0x647601),
            thumbHTML: _0x544d2c
          });
        }
      });
      if (_0x1626d0.length === 0) {
        const _0xbcb674 = _0x1b51a5;
        if (this._lastRefHTML !== _0xbcb674) {
          this._lastRefHTML = _0xbcb674;
          this.refBarEl.classList.remove("active");
          this.refBarEl.innerHTML = _0xbcb674;
        }
        this._syncBtnIconState();
        _0x1f5a38(this, _0x85aa27);
        return;
      }
      if (this._isDraggingSorting) {
        this._syncBtnIconState();
        _0x1f5a38(this, _0x85aa27);
        return;
      }
      this._lastRefHTML = "__has-items__";
      this.refBarEl.classList.add("active");
      let _0x45cb48 = this.refBarEl.querySelector(".prompt-attachment-btn");
      let _0x1e1499 = this.refBarEl.querySelector(".ref-thumb-container");
      if (!_0x45cb48 || !_0x1e1499) {
        this.refBarEl.innerHTML = _0x1b51a5 + " <div class=\"ref-thumb-container\"></div>";
        _0x45cb48 = this.refBarEl.querySelector(".prompt-attachment-btn");
        _0x1e1499 = this.refBarEl.querySelector(".ref-thumb-container");
      }
      const _0x538d3a = new Map();
      _0x1e1499.querySelectorAll(".ref-thumb-wrap").forEach(_0x3518eb => _0x538d3a.set(String(_0x3518eb?.dataset?.edgeId || ""), _0x3518eb));
      const _0x2a0c72 = new Set();
      for (const _0x5dadee of _0x1626d0) {
        const _0x5e1563 = String(_0x5dadee.edgeId || "");
        if (!_0x5e1563) {
          continue;
        }
        let _0x393b70 = _0x538d3a.get(_0x5e1563);
        if (!_0x393b70) {
          _0x393b70 = document.createElement("div");
          _0x393b70.className = "ref-thumb-wrap";
        }
        _0x393b70.setAttribute("draggable", "true");
        if (_0x393b70.dataset.sig !== _0x5dadee.sig) {
          _0x393b70.innerHTML = _0x5dadee.thumbHTML + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + t("aigenText.refs.removeReference") + "\">&times;</button>";
          _0x393b70.dataset.sig = _0x5dadee.sig;
          _0x1a65fc(_0x393b70, _0x5dadee.sig);
        }
        _0x393b70.dataset.edgeId = _0x5e1563;
        _0x393b70.dataset.sourceId = _0x5dadee.sourceId || "";
        _0x393b70.dataset.type = _0x5dadee.type || "";
        _0x393b70.dataset.label = _0x5dadee.label || "";
        _0x393b70.dataset.index = String(_0x5dadee.index ?? "");
        _0x1e1499.appendChild(_0x393b70);
        _0x2a0c72.add(_0x5e1563);
      }
      for (const [_0x12de3d, _0x5dc327] of _0x538d3a.entries()) {
        if (!_0x2a0c72.has(_0x12de3d)) {
          _0x5dc327.remove();
        }
      }
      this._bindDragSort(this.refBarEl);
      this._syncBtnIconState();
      _0x1f5a38(this, _0x85aa27);
    }
    _syncBtnIconState() {
      const _0xfe455a = _0x1dd8f8.getState().pickConnectMode;
      const _0x2688ad = this.refBarEl?.querySelector(".btn-icon");
      if (!_0x2688ad) {
        return;
      }
      if (_0xfe455a && _0xfe455a.active && _0xfe455a.sourceNodeId === this.nodeId) {
        _0x2688ad.style.opacity = "0";
        _0x2688ad.style.transform = "scale(0.4)";
        _0x2688ad.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      } else {
        _0x2688ad.style.opacity = "";
        _0x2688ad.style.transform = "";
      }
    }
    _bindDragSort(_0x25cdb9) {
      bindRefThumbOrderDrag({
        owner: this,
        container: _0x25cdb9,
        store: _0x1dd8f8,
        nodeId: this.nodeId
      });
    }
  }
  return _0x5c4458.prototype;
}