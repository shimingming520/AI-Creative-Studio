import { sanitizePromptHtml } from "../../utils/dom.js";
import { clearVirtualizedPromptCommit, isVirtualizedPromptEditorCurrent } from "../../modules/promptPasteVirtualization.js";
import { createReferenceInputThumbnailHtml, resolveReferenceVideoThumbnail } from "../../modules/referenceInputThumbnail.js";
import { createReferenceMaskBadgeHtml } from "../../modules/refThumbMaskBadge.js";
import { getAssetInputRefsFromPromptAndNode, isRunningHubWorkflowNode } from "../../modules/nodePromptShared.js";
import { getFixedInputSlotConfigFromManifest } from "../../modules/fixedInputAssetRefs.js";
import { stopPreviewNodeLoading } from "../../modules/previewMode.js";
import { resolveCanvasImageDisplayUrl } from "../../services/canvasMediaLocalService.js";
import { shouldShowGenerationBusyUi } from "../../core/generationTaskUiState.js";
import { getTargetInputPolicy, isRhPersonReplaceWorkflowModel, isInputKindAllowed, resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { collectRefThumbIds, resolveRefImageCandidateUrls, resolveVersionedRefImageRenderSources } from "./referenceImageSources.js";
import { isDreaminaTerminalGenerationState, isFailureGenerationUiState, isTerminalGenerationUiState, resetGenerateButtonIdleUi } from "./generationUiState.js";
import { bindRefThumbFixedSlotDrag } from "../../modules/refThumbDragController.js";
import { createPromptAttachmentButtonHTML } from "../refAttachmentButton.js";
import { syncAdaptiveImageInputRatio } from "./adaptiveImageInputRatio.js";
import { t } from "../../i18n/index.js";
import { getImageInputGateUploadedUrl, getImageNodeInputGate, getImageNodeRootClass, shouldAlwaysShowImageRefBar } from "./imageNodeManifestPolicies.js";
import { renderManifestFixedImageRefBar } from "./fixedImageRefBar.js";
import { bindImageRefThumbOrderDrag, escapeRefBarHtml, formatRefUploadLabel, syncImageRefBarButtonIcon } from "./refBarUiHelpers.js";
import { syncImageModelTriggerIcon } from "./uiModuleModelHelpers.js";
import { scheduleCurrentRefThumbObjectUrl, syncRefThumbObjectUrlScope } from "./refThumbObjectUrlScope.js";
export { resolveRefImageCandidateUrls, resolveRefImageRenderSources } from "./referenceImageSources.js";
export function createAIGenerateNodeStateSyncModule(_0x1a548e) {
  const {
    store: _0x5b5c8f,
    api: _0x4ccdb8,
    getDisplayModelName: _0x563b40,
    _handlePillHover: _0x4a50ec,
    _handlePillOut: _0x377931,
    _syncEdgesOrderFromPills: _0xc75bf2,
    _syncPillLabels: _0x9107f6,
    _checkAtTrigger: _0x10d546,
    _populateMentionMenu: _0x28a91f,
    _insertMentionPill: _0x2aff94,
    _handlePillKeyboard: _0x3d0212,
    _rehydratePromptPills: _0x34c615,
    _handleMentionMenuKeyboard: _0x23f764,
    TEXT_TOOLBAR_HTML: _0xd90eae,
    bindTextToolbarEvents: _0x49aac7,
    IMAGE_TOOLBAR_HTML: _0x3c37ab,
    bindImageToolbarEvents: _0x459c4e,
    showDevToast: _0x38fa68,
    getImage: _0xbc4f46,
    openNodeImagePreview: _0x147fc6,
    getPromptPresets: _0x614a39,
    openCustomPresetsManager: _0x540690,
    startLoading: _0x1f5683,
    stopLoading: _0x37a41e,
    bindRefThumbHoverPreview: _0xea6607,
    ensureThumbDecoded: _0x5f3291,
    revealRefThumbMedia: _0x21513a,
    getRefKindByNodeType: _0x46f7ce,
    uploadFile: _0x2c9c39,
    ensureConfig: _0x28e778,
    getProviderConfig: _0x4d3d58,
    generateId: _0x2a839d,
    checkSlashTrigger: _0x25573f,
    handleSlashKeyboardNavigation: _0x2979be,
    closeSlashMenu: _0x1dabc0,
    activateMenuKeyboard: _0x1d2a1e,
    ImageFreeAngleController: _0x11512a
  } = _0x1a548e;
  class _0x525278 {
    _getStoreStateForRead() {
      if (typeof _0x5b5c8f.getStateRaw === "function") {
        return _0x5b5c8f.getStateRaw();
      } else {
        return _0x5b5c8f.getState();
      }
    }
    _syncRefThumbObjectUrlScope(_0x8ce06, _0x5899e8) {
      return syncRefThumbObjectUrlScope(this, _0x8ce06, _0x5899e8, collectRefThumbIds);
    }
    _scheduleRefThumbObjectUrl(_0x2135e5) {
      return scheduleCurrentRefThumbObjectUrl(this, _0x2135e5, {
        store: _0x5b5c8f,
        getImage: _0xbc4f46,
        collectRefThumbIds: collectRefThumbIds
      });
    }
    _shouldRenderRefBarNow(_0x5241bb, _0x1456c7) {
      const _0x3d652f = Array.isArray(_0x5241bb?.selectedNodeIds) ? _0x5241bb.selectedNodeIds : [];
      if (_0x3d652f.includes(this.nodeId)) {
        return true;
      }
      if (_0x1456c7?.active && _0x1456c7?.sourceNodeId === this.nodeId) {
        return true;
      }
      return shouldAlwaysShowImageRefBar(this._data?.model);
    }
    update(_0x94f4df) {
      const _0x1699cf = Number(_0x94f4df?._bizRev);
      const _0x51745f = Number(this._data?._bizRev);
      if (Number.isFinite(_0x1699cf) && Number.isFinite(_0x51745f) && _0x1699cf < _0x51745f) {
        return;
      }
      const _0x2c1f09 = this._normalizeDreaminaNodeData(_0x94f4df);
      const _0x1b31ea = this._data?.model;
      const _0x26c9ff = this._data?.rhAnimeRealRefUrl;
      _0x94f4df = _0x2c1f09;
      this._data = _0x94f4df;
      const _0x1f4d87 = _0x1b31ea !== _0x94f4df?.model;
      const _0x3a8540 = _0x26c9ff !== _0x94f4df?.rhAnimeRealRefUrl;
      const _0xcde7ab = shouldShowGenerationBusyUi(_0x94f4df);
      const _0x29b80f = isTerminalGenerationUiState(_0x94f4df);
      const _0x22506c = isFailureGenerationUiState(_0x94f4df);
      if (_0xcde7ab) {
        this._isGenerating = true;
        if (this.previewEl && typeof _0x1f5683 === "function") {
          _0x1f5683(this.previewEl);
        }
      } else if (_0x29b80f) {
        this._isGenerating = false;
        if (isDreaminaTerminalGenerationState(_0x94f4df)) {
          this._dreaminaActiveSubmitId = "";
          this._stopDreaminaRecovery?.(false);
        }
        stopPreviewNodeLoading(this.nodeId);
        if (this.previewEl) {
          _0x37a41e(this.previewEl);
        }
        resetGenerateButtonIdleUi(this.btnEl);
      }
      if (this._rendererMediaDeferred !== true) {
        this._loadAndDisplayImage();
        this._applyMaskPreview(_0x94f4df.maskPreviewUrl || _0x94f4df.maskPreview);
      }
      const _0x332a83 = this._getStoreStateForRead();
      const _0x1a9b2d = _0x332a83.pickConnectMode || {};
      if (this._placeholderEl) {
        const _0x4a6839 = this._placeholderEl.querySelector(".placeholder-icon-svg");
        if (_0x4a6839) {
          if (_0x1a9b2d.active && _0x1a9b2d.sourceNodeId === this.nodeId) {
            _0x4a6839.classList.add("is-pick-connecting");
          } else {
            _0x4a6839.classList.remove("is-pick-connecting");
          }
        }
      }
      const _0x44e866 = this._attachBtnIcon;
      if (_0x44e866) {
        const _0x3f4aad = _0x1a9b2d.active && _0x1a9b2d.sourceNodeId === this.nodeId;
        _0x44e866.style.transition = "opacity 0.2s ease, transform 0.2s ease";
        _0x44e866.style.opacity = _0x3f4aad ? "0" : "";
        _0x44e866.style.transform = _0x3f4aad ? "scale(0.4)" : "";
        _0x44e866.style.pointerEvents = _0x3f4aad ? "none" : "";
      }
      if (document.activeElement !== this.promptEl && _0x94f4df.prompt !== undefined) {
        if (!isVirtualizedPromptEditorCurrent(this, _0x94f4df.prompt)) {
          const _0x40d550 = sanitizePromptHtml(_0x94f4df.prompt || "");
          if (this.promptEl.innerHTML !== _0x40d550) {
            clearVirtualizedPromptCommit(this);
            this.promptEl.innerHTML = _0x40d550;
            _0x34c615(this);
          }
        }
      }
      this._syncPromptPlaceholder?.(_0x94f4df);
      this._syncPromptInputVisibility?.(_0x94f4df);
      this._syncPromptBoxSizeFromData?.(_0x94f4df);
      this._generationNodeHelpTip?.sync();
      this._modelProviderProfileControl?.sync();
      const _0x284729 = this.modelWrap?.querySelector(".img-model-label");
      if (_0x284729 && _0x94f4df.model) {
        _0x284729.textContent = _0x563b40(_0x94f4df.model);
      }
      syncImageModelTriggerIcon(this.modelWrap?.querySelector(".img-model-btn-trigger"), _0x94f4df);
      this._applyModelParamVisibility(_0x94f4df);
      const _0x21bd22 = getImageNodeRootClass(_0x94f4df.model);
      const _0x509631 = isRhPersonReplaceWorkflowModel(_0x94f4df.model);
      if (this._root) {
        this._root.classList.toggle("rh-anime-real-node", _0x21bd22 === "rh-anime-real-node");
        if (_0x21bd22 && _0x21bd22 !== "rh-anime-real-node") {
          this._root.classList.add(_0x21bd22);
        }
        if (_0x509631) {
          this._root.classList.add("rh-person-replace-v3-node");
        } else {
          this._root.classList.remove("rh-person-replace-v3-node");
        }
      }
      const _0x35156b = this._shouldRenderRefBarNow(_0x332a83, _0x1a9b2d);
      const _0x5d2418 = _0x5b5c8f.getIncomingEdges(this.nodeId);
      const _0x5d9348 = _0x332a83.nodes || {};
      this._syncRefThumbObjectUrlScope(_0x5d2418, _0x5d9348);
      syncAdaptiveImageInputRatio(this, {
        store: _0x5b5c8f,
        nodeId: this.nodeId,
        inEdges: _0x5d2418,
        nodes: _0x5d9348,
        targetNodeData: _0x5d9348?.[this.nodeId] || _0x94f4df || {}
      });
      if (this._rendererMediaDeferred === true || !_0x35156b) {
        this._renderRefBarPendingWhenVisible = true;
      } else {
        const _0x1c9a31 = [..._0x5d2418];
        const _0x434c5b = _0x1c9a31.map(_0x4bfca9 => {
          const _0x127d4e = _0x5d9348[_0x4bfca9.sourceId] || null;
          const _0x3049a7 = _0x127d4e && (typeof _0x127d4e._bizRev === "number" || typeof _0x127d4e._bizRev === "string") ? String(_0x127d4e._bizRev) : "";
          const _0x1dec58 = _0x127d4e?.thumbId ? String(_0x127d4e.thumbId) : "";
          const _0x79df03 = String(_0x127d4e?.mask || "").trim() ? "m1" : "m0";
          const _0x3dc2c7 = String(_0x4bfca9?.refSlot || "");
          const _0x1de8e4 = String(_0x4bfca9?.sourceMediaKey || "");
          return _0x4bfca9.id + ":" + _0x4bfca9.sourceId + ":" + _0x3dc2c7 + ":" + _0x1de8e4 + ":" + _0x3049a7 + ":" + _0x1dec58 + ":" + _0x79df03;
        }).join("|");
        if (_0x1f4d87 || _0x3a8540 || this._renderRefBarPendingWhenVisible || _0x434c5b !== this._lastEdgeSig) {
          this._renderRefBarPendingWhenVisible = false;
          this._lastEdgeSig = _0x434c5b;
          this._renderRefBar();
        }
      }
      if (!_0x22506c && typeof this._maybeResumeRunningHubTaskImpl === "function") {
        this._maybeResumeRunningHubTaskImpl();
      }
      if (!_0x22506c && typeof this._maybeResumeDreaminaTaskImpl === "function") {
        this._maybeResumeDreaminaTaskImpl();
      }
      if (!_0x22506c && typeof this._maybeResumeAsyncTaskImpl === "function") {
        this._maybeResumeAsyncTaskImpl();
      }
      this._updateSubmitButtonState();
    }
    async _renderRefBar() {
      if (!this.refBarEl) {
        return;
      }
      if (this._rendererMediaDeferred === true) {
        this._renderRefBarPendingWhenVisible = true;
        return;
      }
      const _0x107fac = this._getStoreStateForRead();
      const _0x42d503 = _0x107fac?.pickConnectMode || {};
      if (!this._shouldRenderRefBarNow(_0x107fac, _0x42d503)) {
        this._renderRefBarPendingWhenVisible = true;
        return;
      }
      if (this._renderRefBarLock) {
        this._renderRefBarPending = true;
        return;
      }
      this._renderRefBarLock = true;
      this._renderRefBarPending = false;
      try {
        await this._renderRefBarImpl();
      } finally {
        this._renderRefBarLock = false;
        if (this._renderRefBarPending) {
          this._renderRefBarPending = false;
          this._renderRefBar();
        }
      }
    }
    async _renderRefBarImpl() {
      if (!this.refBarEl) {
        return;
      }
      const _0x56072b = this._getStoreStateForRead();
      const _0x5b9287 = Object.values(_0x56072b.edges || {});
      const _0x261f24 = _0x56072b.nodes || {};
      const _0x43385e = _0x5b5c8f.getIncomingEdges(this.nodeId);
      this._syncRefThumbObjectUrlScope(_0x43385e, _0x261f24);
      const _0x11a141 = getImageNodeInputGate(this._data?.model);
      const _0x44fc2e = String(_0x11a141.kind || "").trim();
      const _0x1cbd58 = Number(_0x11a141.max);
      const _0x427650 = isRhPersonReplaceWorkflowModel(this._data?.model);
      const _0x3334cb = getImageInputGateUploadedUrl(this._data, _0x11a141);
      const _0x4325a6 = _0x261f24?.[this.nodeId] || this._data || {};
      const _0x1edcab = getTargetInputPolicy(_0x4325a6);
      const _0x418ebd = getFixedInputSlotConfigFromManifest(_0x4325a6);
      syncAdaptiveImageInputRatio(this, {
        store: _0x5b5c8f,
        nodeId: this.nodeId,
        inEdges: _0x43385e,
        nodes: _0x261f24,
        targetNodeData: _0x4325a6
      });
      const _0x45b445 = createPromptAttachmentButtonHTML({
        stroke: "var(--white-80)"
      });
      const _0x1c1a2 = () => {
        let _0x327e47 = this.refBarEl.querySelector(".prompt-attachment-btn");
        let _0x5d4035 = this.refBarEl.querySelector(".ref-thumb-container");
        if (!_0x327e47 || !_0x5d4035) {
          this.refBarEl.innerHTML = _0x45b445 + " <div class=\"ref-thumb-container\"></div>";
          _0x327e47 = this.refBarEl.querySelector(".prompt-attachment-btn");
          _0x5d4035 = this.refBarEl.querySelector(".ref-thumb-container");
          this._attachBtnIcon = _0x327e47 ? _0x327e47.querySelector(".btn-icon") : null;
        }
        return {
          attachBtn: _0x327e47,
          thumbContainer: _0x5d4035
        };
      };
      let _0x3f3131 = [];
      const _0x2d812c = {
        text: 0,
        image: 0,
        video: 0,
        audio: 0
      };
      const _0x49d408 = {};
      for (const _0x4c2659 of _0x43385e) {
        const _0x1a98d4 = _0x261f24[_0x4c2659.sourceId];
        if (!_0x1a98d4) {
          continue;
        }
        const _0xfb80cc = resolveEffectiveInputKind(_0x1a98d4, _0x4c2659);
        if (!_0xfb80cc) {
          continue;
        }
        if (!isInputKindAllowed(_0x1edcab, _0xfb80cc)) {
          continue;
        }
        if (_0x44fc2e && _0xfb80cc !== _0x44fc2e) {
          continue;
        }
        if (_0x44fc2e && Number.isFinite(_0x1cbd58) && _0x2d812c[_0x44fc2e] >= _0x1cbd58) {
          continue;
        }
        if (_0x427650 && _0xfb80cc !== "image") {
          continue;
        }
        if (_0x427650 && _0x2d812c.image >= 2) {
          continue;
        }
        _0x2d812c[_0xfb80cc]++;
        const _0x3b0099 = {
          text: t("aigenImage.refs.types.text"),
          image: t("aigenImage.refs.types.image"),
          video: t("aigenImage.refs.types.video"),
          audio: t("aigenImage.refs.types.audio")
        };
        const _0x513728 = "@" + _0x3b0099[_0xfb80cc] + _0x2d812c[_0xfb80cc];
        _0x49d408[_0x4c2659.sourceId] = _0x513728;
        let _0x1315c8 = "";
        let _0x25e2b4 = "";
        let _0x44ebda = "";
        let _0x41bdf5 = "";
        if (_0xfb80cc === "image") {
          let _0x5bf2e6 = "";
          for (const _0x1a81c6 of collectRefThumbIds(_0x1a98d4)) {
            _0x5bf2e6 = this._refThumbObjectUrls.get(_0x1a81c6) || "";
            if (!_0x5bf2e6) {
              this._scheduleRefThumbObjectUrl(_0x1a81c6);
            }
            if (_0x5bf2e6) {
              break;
            }
          }
          ({
            thumbSrc: _0x25e2b4,
            previewSrc: _0x44ebda,
            mediaIdentityKey: _0x41bdf5
          } = resolveVersionedRefImageRenderSources(_0x1a98d4, _0x4c2659, {
            thumbBlobUrl: _0x5bf2e6
          }));
        }
        let _0x25b005 = resolveCanvasImageDisplayUrl(_0x1a98d4);
        if (!_0x25b005 && _0x1a98d4.thumbId) {
          if (this._refThumbObjectUrls.has(_0x1a98d4.thumbId)) {
            _0x25b005 = this._refThumbObjectUrls.get(_0x1a98d4.thumbId);
          } else {
            this._scheduleRefThumbObjectUrl(_0x1a98d4.thumbId);
          }
        }
        if (!_0x25b005) {
          const _0x83b802 = resolveRefImageCandidateUrls(_0x1a98d4);
          _0x25b005 = _0x83b802[0] || "";
        }
        if (_0xfb80cc === "image") {
          _0x25b005 = _0x25e2b4 || _0x25b005;
        }
        if (_0xfb80cc === "image" && _0x25b005) {
          _0x5f3291(_0x25b005);
          if (_0x44ebda && _0x44ebda !== _0x25b005) {
            _0x5f3291(_0x44ebda);
          }
          _0x1315c8 = createReferenceInputThumbnailHtml({
            kind: "image",
            thumbnailUrl: _0x25b005,
            extraHtml: createReferenceMaskBadgeHtml(_0x1a98d4)
          });
        } else if (_0xfb80cc === "text") {
          const _0x4f0f2c = _0x1a98d4.type === "ai-text";
          if (_0x4f0f2c && !_0x1a98d4.outputText) {
            continue;
          }
          _0x1315c8 = createReferenceInputThumbnailHtml({
            kind: "text"
          });
        } else if (_0xfb80cc === "video") {
          _0x25b005 = resolveReferenceVideoThumbnail(_0x1a98d4, _0x4c2659).thumbUrl;
          if (_0x25b005) {
            _0x5f3291(_0x25b005);
          }
          _0x1315c8 = createReferenceInputThumbnailHtml({
            kind: "video",
            thumbnailUrl: _0x25b005
          });
        } else if (_0xfb80cc === "audio") {
          _0x1315c8 = createReferenceInputThumbnailHtml({
            kind: "audio"
          });
        }
        if (_0x1315c8) {
          const _0x23715e = String(_0x1a98d4.mask || "").trim() ? "m1" : "m0";
          const _0x36eeab = _0xfb80cc + "|" + _0x4c2659.id + "|" + _0x4c2659.sourceId + "|" + (_0x25b005 || "") + "|" + (_0x44ebda || "") + "|" + _0x41bdf5 + "|" + _0x23715e;
          _0x3f3131.push({
            key: "edge:" + _0x4c2659.id,
            edgeId: _0x4c2659.id,
            sourceId: _0x4c2659.sourceId,
            refSlot: _0x4c2659.refSlot || "",
            type: _0xfb80cc,
            label: _0x513728,
            sig: _0x36eeab,
            thumbHTML: _0x1315c8,
            thumbSrc: _0x25e2b4 || _0x25b005 || "",
            previewSrc: _0x44ebda || _0x25b005 || ""
          });
        }
      }
      if (isRunningHubWorkflowNode(_0x4325a6) || _0x418ebd) {
        getAssetInputRefsFromPromptAndNode(this.promptEl, {
          nodeData: _0x4325a6,
          allowedTypes: ["image"]
        }).forEach((_0x28ab8b, _0x335d99) => {
          const _0x382f44 = resolveEffectiveInputKind(_0x28ab8b);
          if (_0x382f44 !== "image" || !isInputKindAllowed(_0x1edcab, _0x382f44)) {
            return;
          }
          const _0x30c120 = String(_0x28ab8b.thumbUrl || _0x28ab8b.url || "").trim();
          if (!_0x30c120) {
            return;
          }
          _0x5f3291(_0x30c120);
          const _0x29979d = String(_0x28ab8b.assetId || "");
          const _0x5d905b = String(_0x28ab8b.itemIndex ?? "");
          const _0x5ad7a4 = String(_0x28ab8b.assetMentionOccurrence ?? "");
          const _0x144bc7 = String(_0x28ab8b.assetRefSource || "prompt");
          const _0x1b3654 = "asset:" + _0x29979d + ":" + _0x5d905b;
          const _0x36d9b8 = "asset:" + _0x144bc7 + ":" + _0x29979d + ":" + _0x5d905b + ":image:" + _0x335d99;
          _0x3f3131.push({
            key: _0x36d9b8,
            edgeId: "",
            sourceId: _0x1b3654,
            refSlot: "",
            type: "image",
            label: _0x28ab8b.label || _0x28ab8b.name || t("aigenImage.refs.referenceImage"),
            sig: _0x36d9b8 + "|" + String(_0x28ab8b.url || "") + "|" + _0x30c120,
            thumbHTML: createReferenceInputThumbnailHtml({
              kind: "image",
              thumbnailUrl: _0x30c120
            }),
            thumbSrc: _0x30c120,
            previewSrc: String(_0x28ab8b.url || _0x30c120),
            virtual: true,
            assetId: _0x29979d,
            assetIndex: _0x5d905b,
            assetOccurrence: _0x5ad7a4,
            assetRefSource: _0x144bc7,
            refType: "image"
          });
        });
      }
      if (_0x427650) {
        const _0x4b36bb = ["replaceTarget", "replacedImage"];
        const _0x482d87 = () => {
          const _0x158865 = !!this.refBarEl.querySelector("[data-ref-slot=\"replaceTarget\"]");
          const _0x443a5f = !!this.refBarEl.querySelector("[data-ref-slot=\"replacedImage\"]");
          let _0x21698a = this.refBarEl.querySelector(".prompt-attachment-btn");
          let _0x5919a7 = this.refBarEl.querySelector(".ref-thumb-container");
          if (!_0x21698a || !_0x5919a7 || !_0x158865 || !_0x443a5f) {
            const _0x1fa365 = t("aigenImage.refs.replaceTarget");
            const _0x1f7c62 = t("aigenImage.refs.replacedImage");
            this.refBarEl.innerHTML = _0x45b445 + " <div class=\"ref-thumb-container\"><div class=\"ref-thumb-wrap ref-upload-slot\" data-ref-slot=\"replaceTarget\" data-slot=\"replaceTarget\" data-kind=\"image\" draggable=\"false\" title=\"" + escapeRefBarHtml(_0x1fa365) + "\"><span class=\"ref-upload-label\">" + formatRefUploadLabel(_0x1fa365) + "</span></div><div class=\"ref-thumb-wrap ref-upload-slot\" data-ref-slot=\"replacedImage\" data-slot=\"replacedImage\" data-kind=\"image\" draggable=\"false\" title=\"" + escapeRefBarHtml(_0x1f7c62) + "\"><span class=\"ref-upload-label\">" + formatRefUploadLabel(_0x1f7c62) + "</span></div></div>";
            _0x21698a = this.refBarEl.querySelector(".prompt-attachment-btn");
            _0x5919a7 = this.refBarEl.querySelector(".ref-thumb-container");
            this._attachBtnIcon = _0x21698a ? _0x21698a.querySelector(".btn-icon") : null;
          }
          const _0xfa1418 = this.refBarEl.querySelector("[data-ref-slot=\"replaceTarget\"]");
          const _0x53006d = this.refBarEl.querySelector("[data-ref-slot=\"replacedImage\"]");
          return {
            targetEl: _0xfa1418,
            sourceEl: _0x53006d,
            container: _0x5919a7
          };
        };
        const {
          targetEl: _0x363c4c,
          sourceEl: _0x127d8b,
          container: _0x5e62c1
        } = _0x482d87();
        this._lastRefHTML = "__rh-person-replace-v3__";
        this.refBarEl.classList.add("active");
        const _0x2a3889 = _0xf37275 => String(_0xf37275?.key || _0xf37275?.edgeId || "");
        const _0xd3afdb = new Set();
        const _0x1c8bca = new Map();
        const _0x2b0625 = [{
          key: _0x4b36bb[0],
          el: _0x363c4c,
          title: t("aigenImage.refs.replaceTarget"),
          emptyHtml: formatRefUploadLabel(t("aigenImage.refs.replaceTarget"))
        }, {
          key: _0x4b36bb[1],
          el: _0x127d8b,
          title: t("aigenImage.refs.replacedImage"),
          emptyHtml: formatRefUploadLabel(t("aigenImage.refs.replacedImage"))
        }];
        for (const _0x573792 of _0x3f3131) {
          const _0x42c705 = _0x2a3889(_0x573792);
          if (!_0x42c705 || _0xd3afdb.has(_0x42c705)) {
            continue;
          }
          const _0x35e6c8 = String(_0x573792.refSlot || "");
          if (!_0x4b36bb.includes(_0x35e6c8)) {
            continue;
          }
          if (_0x1c8bca.has(_0x35e6c8)) {
            continue;
          }
          _0x1c8bca.set(_0x35e6c8, _0x573792);
          _0xd3afdb.add(_0x42c705);
        }
        for (const _0x2ea48b of _0x3f3131) {
          const _0x1aac87 = _0x2a3889(_0x2ea48b);
          if (!_0x1aac87 || _0xd3afdb.has(_0x1aac87)) {
            continue;
          }
          for (const _0x29a9fc of _0x4b36bb) {
            if (!_0x1c8bca.has(_0x29a9fc)) {
              _0x1c8bca.set(_0x29a9fc, _0x2ea48b);
              _0xd3afdb.add(_0x1aac87);
              break;
            }
          }
        }
        const _0x4cae4c = (_0x303290, _0x5cfef2, _0x1a7eb8) => {
          const _0x36a98c = document.createElement("div");
          _0x36a98c.className = "ref-thumb-wrap ref-upload-slot";
          _0x36a98c.dataset.refSlot = _0x303290;
          _0x36a98c.dataset.slot = _0x303290;
          _0x36a98c.dataset.kind = "image";
          _0x36a98c.title = _0x5cfef2;
          _0x36a98c.setAttribute("draggable", "false");
          _0x36a98c.innerHTML = "<span class=\"ref-upload-label\">" + _0x1a7eb8 + "</span>";
          return _0x36a98c;
        };
        const _0x53f97b = (_0xab5129, _0x4651aa, _0x3ab3e5) => {
          const _0x314812 = document.createElement("div");
          _0x314812.className = "ref-thumb-wrap" + (_0x3ab3e5.virtual ? " ref-thumb-wrap--asset" : "");
          _0x314812.dataset.refSlot = _0xab5129;
          _0x314812.dataset.slot = _0xab5129;
          _0x314812.dataset.kind = "image";
          _0x314812.title = _0x4651aa;
          _0x314812.setAttribute("draggable", _0x3ab3e5.virtual ? "false" : "true");
          return _0x314812;
        };
        for (const _0x2e8597 of _0x2b0625) {
          const _0x3b52b6 = _0x1c8bca.get(_0x2e8597.key) || null;
          let _0x35fd92 = _0x2e8597.el;
          if (!_0x35fd92) {
            continue;
          }
          if (_0x3b52b6 && _0x35fd92.classList?.contains?.("ref-upload-slot")) {
            const _0xbc7835 = _0x53f97b(_0x2e8597.key, _0x2e8597.title, _0x3b52b6);
            _0x35fd92.replaceWith(_0xbc7835);
            _0x35fd92 = _0xbc7835;
            _0x2e8597.el = _0xbc7835;
          } else if (!_0x3b52b6 && !_0x35fd92.classList?.contains?.("ref-upload-slot")) {
            const _0x154ba3 = _0x4cae4c(_0x2e8597.key, _0x2e8597.title, _0x2e8597.emptyHtml);
            _0x35fd92.replaceWith(_0x154ba3);
            _0x35fd92 = _0x154ba3;
            _0x2e8597.el = _0x154ba3;
          }
          _0x35fd92.dataset.refSlot = _0x2e8597.key;
          _0x35fd92.dataset.slot = _0x2e8597.key;
          _0x35fd92.dataset.kind = "image";
          _0x35fd92.title = _0x2e8597.title;
          if (_0x3b52b6) {
            _0x35fd92.className = "ref-thumb-wrap" + (_0x3b52b6.virtual ? " ref-thumb-wrap--asset" : "");
            _0x35fd92.classList?.remove?.("ref-upload-slot");
            _0x35fd92.setAttribute("draggable", _0x3b52b6.virtual ? "false" : "true");
            _0x35fd92.dataset.refKey = _0x2a3889(_0x3b52b6);
            _0x35fd92.dataset.edgeId = _0x3b52b6.edgeId || "";
            _0x35fd92.dataset.sourceId = _0x3b52b6.sourceId || "";
            _0x35fd92.dataset.refOrigin = _0x3b52b6.virtual ? "asset" : "node";
            if (_0x3b52b6.virtual) {
              _0x35fd92.dataset.assetId = _0x3b52b6.assetId || "";
              _0x35fd92.dataset.assetIndex = _0x3b52b6.assetIndex || "";
              _0x35fd92.dataset.assetOccurrence = _0x3b52b6.assetOccurrence || "";
              _0x35fd92.dataset.assetRefSource = _0x3b52b6.assetRefSource || "prompt";
              _0x35fd92.dataset.refType = _0x3b52b6.refType || _0x3b52b6.type || "";
            } else {
              delete _0x35fd92.dataset.assetId;
              delete _0x35fd92.dataset.assetIndex;
              delete _0x35fd92.dataset.assetOccurrence;
              delete _0x35fd92.dataset.assetRefSource;
              delete _0x35fd92.dataset.refType;
            }
            if (_0x35fd92.dataset.sig !== _0x3b52b6.sig) {
              _0x35fd92.innerHTML = _0x3b52b6.thumbHTML + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + t("aigenImage.refs.removeReference") + "\">&times;</button>";
              _0x35fd92.dataset.sig = _0x3b52b6.sig;
              _0x21513a(_0x35fd92, _0x3b52b6.sig);
            }
            if (_0x3b52b6.thumbSrc) {
              _0x35fd92.dataset.thumbSrc = _0x3b52b6.thumbSrc;
            } else {
              delete _0x35fd92.dataset.thumbSrc;
            }
            if (_0x3b52b6.previewSrc) {
              _0x35fd92.dataset.previewSrc = _0x3b52b6.previewSrc;
            } else {
              delete _0x35fd92.dataset.previewSrc;
            }
          } else {
            _0x35fd92.className = "ref-thumb-wrap ref-upload-slot";
            _0x35fd92.setAttribute("draggable", "false");
            if (_0x35fd92.dataset.refKey) {
              delete _0x35fd92.dataset.refKey;
            }
            if (_0x35fd92.dataset.edgeId) {
              delete _0x35fd92.dataset.edgeId;
            }
            if (_0x35fd92.dataset.sourceId) {
              delete _0x35fd92.dataset.sourceId;
            }
            if (_0x35fd92.dataset.refOrigin) {
              delete _0x35fd92.dataset.refOrigin;
            }
            if (_0x35fd92.dataset.assetId) {
              delete _0x35fd92.dataset.assetId;
            }
            if (_0x35fd92.dataset.assetIndex) {
              delete _0x35fd92.dataset.assetIndex;
            }
            if (_0x35fd92.dataset.assetOccurrence) {
              delete _0x35fd92.dataset.assetOccurrence;
            }
            if (_0x35fd92.dataset.assetRefSource) {
              delete _0x35fd92.dataset.assetRefSource;
            }
            if (_0x35fd92.dataset.refType) {
              delete _0x35fd92.dataset.refType;
            }
            if (_0x35fd92.dataset.sig) {
              delete _0x35fd92.dataset.sig;
            }
            if (_0x35fd92.dataset.thumbSrc) {
              delete _0x35fd92.dataset.thumbSrc;
            }
            if (_0x35fd92.dataset.previewSrc) {
              delete _0x35fd92.dataset.previewSrc;
            }
            const _0x43bb2d = "<span class=\"ref-upload-label\">" + _0x2e8597.emptyHtml + "</span>";
            if (_0x35fd92.innerHTML !== _0x43bb2d) {
              _0x35fd92.innerHTML = _0x43bb2d;
            }
          }
        }
        bindRefThumbFixedSlotDrag({
          owner: this,
          container: _0x5e62c1,
          store: _0x5b5c8f,
          nodeId: this.nodeId,
          acceptMap: {
            replaceTarget: "image",
            replacedImage: "image"
          }
        });
        this._syncBtnIconState();
        _0x9107f6(this, {});
        return;
      }
      if (_0x418ebd && renderManifestFixedImageRefBar({
        owner: this,
        refBarEl: this.refBarEl,
        promptEl: this.promptEl,
        attachBtnHTML: _0x45b445,
        fixedInputConfig: _0x418ebd,
        items: _0x3f3131,
        targetNodeData: _0x4325a6,
        sourceIdToLabel: _0x49d408,
        store: _0x5b5c8f,
        nodeId: this.nodeId,
        ensureThumbDecoded: _0x5f3291,
        revealRefThumbMedia: _0x21513a,
        syncPillLabels: _0x9107f6
      })) {
        return;
      }
      if (this._isDraggingSorting) {
        this._syncBtnIconState();
        _0x9107f6(this, _0x49d408);
        return;
      }
      if (_0x3f3131.length > 0) {
        this.refBarEl.classList.add("active");
        this.refBarEl.classList.remove("rh-v5-refbar");
        const _0x171029 = this._lastRefHTML;
        this._lastRefHTML = "__has-items__";
        const {
          thumbContainer: _0xdfe622
        } = _0x1c1a2();
        if (String(_0x171029 || "").startsWith("__rh-")) {
          _0xdfe622.querySelectorAll(".ref-thumb-wrap").forEach(_0x134da8 => _0x134da8.remove());
        }
        _0xdfe622.querySelectorAll(".ref-upload-slot").forEach(_0x504336 => _0x504336.remove());
        _0xdfe622.querySelectorAll(".ref-thumb-wrap").forEach(_0xa85134 => {
          const _0xd86232 = String(_0xa85134?.dataset?.refKey || "").trim() || (String(_0xa85134?.dataset?.edgeId || "").trim() ? "edge:" + String(_0xa85134.dataset.edgeId).trim() : "");
          if (!_0xd86232) {
            _0xa85134.remove();
          }
        });
        const _0x28105d = new Map();
        _0xdfe622.querySelectorAll(".ref-thumb-wrap").forEach(_0x5243a9 => {
          const _0x204f08 = String(_0x5243a9?.dataset?.edgeId || "").trim();
          const _0x60cbaa = String(_0x5243a9?.dataset?.refKey || "").trim() || (_0x204f08 ? "edge:" + _0x204f08 : "");
          if (!_0x60cbaa) {
            return;
          }
          _0x28105d.set(_0x60cbaa, _0x5243a9);
        });
        const _0x27722a = new Set();
        for (let _0x2cac38 = 0; _0x2cac38 < _0x3f3131.length; _0x2cac38++) {
          const _0x32b561 = _0x3f3131[_0x2cac38];
          const _0x30279b = String(_0x32b561.key || _0x32b561.edgeId || "");
          if (!_0x30279b) {
            continue;
          }
          let _0x8dc458 = _0x28105d.get(_0x30279b);
          if (!_0x8dc458) {
            _0x8dc458 = document.createElement("div");
            _0x8dc458.className = "ref-thumb-wrap" + (_0x32b561.virtual ? " ref-thumb-wrap--asset" : "");
          }
          _0x8dc458.setAttribute("draggable", _0x32b561.virtual ? "false" : "true");
          if (_0x8dc458.dataset.sig !== _0x32b561.sig) {
            _0x8dc458.innerHTML = _0x32b561.thumbHTML + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + t("aigenImage.refs.removeReference") + "\">&times;</button>";
            _0x8dc458.dataset.sig = _0x32b561.sig;
            _0x21513a(_0x8dc458, _0x32b561.sig);
          }
          _0x8dc458.dataset.refKey = _0x30279b;
          _0x8dc458.dataset.edgeId = _0x32b561.edgeId || "";
          _0x8dc458.dataset.sourceId = _0x32b561.sourceId;
          _0x8dc458.dataset.refOrigin = _0x32b561.virtual ? "asset" : "node";
          if (_0x32b561.virtual) {
            _0x8dc458.dataset.assetId = _0x32b561.assetId || "";
            _0x8dc458.dataset.assetIndex = _0x32b561.assetIndex || "";
            _0x8dc458.dataset.assetOccurrence = _0x32b561.assetOccurrence || "";
            _0x8dc458.dataset.assetRefSource = _0x32b561.assetRefSource || "prompt";
            _0x8dc458.dataset.refType = _0x32b561.refType || _0x32b561.type || "";
          } else {
            delete _0x8dc458.dataset.assetId;
            delete _0x8dc458.dataset.assetIndex;
            delete _0x8dc458.dataset.assetOccurrence;
            delete _0x8dc458.dataset.assetRefSource;
            delete _0x8dc458.dataset.refType;
          }
          _0x8dc458.dataset.type = _0x32b561.type;
          _0x8dc458.dataset.label = _0x32b561.label;
          _0x8dc458.dataset.index = String(_0x2cac38);
          if (_0x32b561.thumbSrc) {
            _0x8dc458.dataset.thumbSrc = _0x32b561.thumbSrc;
          } else {
            delete _0x8dc458.dataset.thumbSrc;
          }
          if (_0x32b561.previewSrc) {
            _0x8dc458.dataset.previewSrc = _0x32b561.previewSrc;
          } else {
            delete _0x8dc458.dataset.previewSrc;
          }
          _0xdfe622.appendChild(_0x8dc458);
          _0x27722a.add(_0x30279b);
        }
        for (const [_0x4cc2c1, _0x1e93d1] of _0x28105d.entries()) {
          if (!_0x27722a.has(_0x4cc2c1)) {
            _0x1e93d1.remove();
          }
        }
        this._bindDragSort(this.refBarEl);
      } else if (_0x44fc2e === "image") {
        this.refBarEl.classList.remove("rh-v5-refbar");
        const _0x460deb = t("aigenImage.refs.uploadReference");
        const _0x2dbee2 = _0x45b445 + " <div class=\"ref-thumb-container\">" + (_0x3334cb ? "<div class=\"ref-thumb-wrap ref-upload-slot\" data-ref-src=\"upload\">" + createReferenceInputThumbnailHtml({
          kind: "image",
          thumbnailUrl: _0x3334cb
        }) + "<button type=\"button\" class=\"ref-upload-delete\" title=\"" + t("aigenImage.refs.removeReference") + "\">&times;</button></div>" : "<button type=\"button\" class=\"ref-thumb-wrap ref-upload-slot\" title=\"" + escapeRefBarHtml(_0x460deb) + "\"><span class=\"ref-upload-label\">" + formatRefUploadLabel(_0x460deb) + "</span></button>") + "</div>";
        if (this._lastRefHTML !== _0x2dbee2) {
          this._lastRefHTML = _0x2dbee2;
          this.refBarEl.classList.add("active");
          this.refBarEl.innerHTML = _0x2dbee2;
          const _0x496f43 = this.refBarEl.querySelector(".prompt-attachment-btn");
          this._attachBtnIcon = _0x496f43 ? _0x496f43.querySelector(".btn-icon") : null;
        }
      } else {
        this.refBarEl.classList.remove("active");
        this.refBarEl.classList.remove("rh-v5-refbar");
        this._lastRefHTML = "__empty__";
        const {
          thumbContainer: _0x1202a3
        } = _0x1c1a2();
        _0x1202a3.querySelectorAll(".ref-thumb-wrap").forEach(_0x8f439a => _0x8f439a.remove());
      }
      this._syncBtnIconState();
      _0x9107f6(this, _0x49d408);
    }
    _syncBtnIconState() {
      syncImageRefBarButtonIcon({
        refBarEl: this.refBarEl,
        pickMode: _0x5b5c8f.getState().pickConnectMode,
        nodeId: this.nodeId
      });
    }
    _bindDragSort(_0x408b4) {
      bindImageRefThumbOrderDrag({
        owner: this,
        refBar: _0x408b4,
        store: _0x5b5c8f,
        nodeId: this.nodeId
      });
    }
  }
  return _0x525278.prototype;
}