import { buildSourceMediaNodePayload, getAIGenerationNodeSize, getAutoMediaSizeByShortSide, getNodeDefaultSize } from "../../services/fileService.js";
import { revokeTrackedMediaObjectUrl } from "../../services/mediaObjectUrlRegistry.js";
import { releasePayloadObjectUrlLease } from "../../services/payloadObjectUrlLease.js";
import { disposeImageObjectUrls, hydrateStoredImageThumbsInBackground } from "./imageObjectUrlLifecycle.js";
import { buildImageNodeStorageFields, pickCanvasImageLocalPath, pickCanvasThumbLocalPath, toLocalPathUrl } from "../../services/imageDerivativeService.js";
import { buildCanvasImageResultIdentityKey, isCanvasLowZoomActive, pickImageLodUrl, setNodeMediaLodHoverPromoted, shouldUseLowZoomImageThumbnail, versionCanvasImageDisplayUrl } from "../../modules/canvasImageLod.js";
import { preloadCanvasImage } from "../../modules/canvasMediaScheduler.js";
import { assignCanvasImageDisplaySource, clearCanvasImageDisplayHandoff, deferCanvasImageDisplayFallbackRelease } from "../../modules/canvasImageDisplayHandoff.js";
import { commit } from "../../modules/history.js";
import { startNodeResizePreview } from "../../modules/interaction/nodeResizePreview.js";
import { applyPromptBoxHeight, getPromptBoxHeightBounds, normalizePromptBoxHeight } from "../promptBoxResize.js";
import { buildDreaminaImageNodeNormalizationPatch, bindDreaminaImageMenu, normalizeDreaminaImageModel } from "./dreaminaModelMenuHelper.js";
import { getNanoBananaModeLabel, getNanoBananaModeOptions, getNanoBananaSelectionFromModel, getNanoBananaAllowedRatioLabels, isNanoBananaFamily, normalizeNanoBananaRatioForFamily } from "../../modules/nanoBananaModeRules.js";
import { buildMainImageRatioLabel, isImageSizeOptionDisabledForProviderModel, isRunningHubGptImage2OfficialModel, normalizeImageSizeForProviderModel, shouldDisableImageSizeControl } from "../../modules/imageModelCapabilities.js";
import { syncPreviewNodeLoading } from "../../modules/previewMode.js";
import { subscribeAssetMentionRegistry } from "../../modules/assetMentionRegistry.js";
import { removeCoveredAssetInputRefForConnection } from "../../modules/promptAssetInputOverride.js";
import { getExclusiveSlotsForFixedSlot, getFixedInputSlotConfigFromManifest } from "../../modules/fixedInputAssetRefs.js";
import { flushPromptHtmlCommit, getPromptAssetInputRefsFromNode, handlePromptPaste, handlePromptSelectAll, removeAssetMentionPillFromPrompt, removePromptAssetInputRefFromNode, resolvePromptTextWithTextRefs, schedulePromptHtmlCommit, shouldSubmitPromptByKeyboard } from "../../modules/nodePromptShared.js";
import { shouldSkipPromptTriggerForBulkInput } from "../../modules/promptTriggerComposition.js";
import { getTargetInputPolicy, isInputKindAllowed, isRhPersonReplaceV3Model, isRhPersonReplaceWorkflowModel, isRhQwenImageEditModel, resolveEffectiveInputKind, RH_QWEN_IMAGE_EDIT_MODEL } from "../../modules/modelInputPolicy.js";
import { isImageFreeAngleOnlyModel } from "../../modules/imageFunctionModelMenu.js";
import { sanitizePromptHtml } from "../../utils/dom.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../../utils/debugRequestPreview.js";
import { createPromptAttachmentButtonHTML } from "../refAttachmentButton.js";
import { attachGenerationNodePromptTools } from "../generationNodeHelpTip.js";
import { createModelProviderProfileControl } from "../shared/modelProviderProfileControl.js";
import { buildModelProviderProfileSelectionPatch } from "../../modules/modelProviderProfileSelection.js";
import { applyModelCredentialButtonState, bindModelCredentialMenu, resetModelCredentialButtonState, syncModelCredentialMenu } from "../../modules/modelCredentialUi.js";
import { isVipModel as a330_0x59a142 } from "../../modules/subscriptionAccess.js";
import { bindImageModelMenuSubmenu, buildImageModelMenuHTML, buildNanoBananaModeMenuHTML, buildRunningHubGptImage2OfficialPatch, escapeHtmlAttr, getImagePromptPlaceholderForModel, getImageSizeCapabilityProvider, isApimartGptImage2Selection, isGrsaiGptImage2Selection, isRunningHubGptImage2Selection, resolveApimartImageMenuSelection, resolveGrsaiImageMenuSelection, resolveRunningHubModelImageMenuSelection, resolveRunningHubWorkflowImageMenuSelection, resolveVolcengineImageMenuSelection, renderImageModelTriggerIconHTML, setImageModelTriggerIcon, shouldShowNanoBananaModeSelector } from "./uiModuleModelHelpers.js";
import { AI_IMAGE_MIN_SIZE, GENERATION_MANUAL_DISPLAY_SIZE_FIELD, applyImageSchemaRatioResizeAnimation, buildGenerationModelSelectionDisplayPatch, buildImageSchemaAspectRatioDisplayPatch } from "../shared/generationDisplayPolicy.js";
import { buildImageInputGateClearPatch, getImageInputGateUploadedUrl, getImageNodeInputGate, getImageNodeRootClass, shouldUseImageWorkflowBusyButton } from "./imageNodeManifestPolicies.js";
import { bindModelUiSchemaControls, buildModelUiSchemaDefaultParams, renderModelUiSchemaControls, sanitizeModelUiSchemaParams, syncModelUiSchemaControls } from "./uiSchemaRenderer.js";
import { buildUiSchemaVisibilitySignature } from "./uiSchemaVisibility.js";
import { bindNodeFooterController, closeNodeFooterMenus } from "../shared/nodeFooterControls.js";
import { RH_AI_APP_PERSISTENT_ADVANCED_CLASS, buildRhAiAppResultDisplayPatch, isCustomAiAppManifest, isRunningHubAiAppManifest, resolveCustomAiAppNodeManifest, shouldAllowEmptyCustomAiAppInputs } from "../shared/rhAiAppNodeBehavior.js";
import { bindResultImageDragOutGesture } from "./resultImageDragOut.js";
import { buildFixedSlotOccupancy, countManifestInputRecords, getMissingManifestInputRequirement } from "./manifestInputRequirements.js";
import { MULTI_RESULT_BACKPLATE_CLASS, MULTI_RESULT_STACK_WRAP_CLASS, buildMultiResultCollapsedFrame, buildMultiResultExpandedSlotMap, buildMultiResultBackplateItems, clearMultiResultStackClasses, createMultiResultBackplates, getMultiResultBackplateCount, getMultiResultBackplateDomIdentityKey, getMultiResultBackplateIdentityKey, getMultiResultBackplateKey, resolveMultiResultMainSwap, shouldRefreshMultiResultStackDom, shouldEnableMultiResultLayerDragOut, syncMultiResultStackClasses } from "./multiResultStackBackplates.js";
import { getModelManifest, isWorkflowModel } from "../../manifests/index.js";
import { resetGenerateButtonIdleUi, setGenerateButtonCancellableUi, setGenerateButtonLoadingUi } from "../../modules/previewGenerateButtonUi.js";
import { evaluateGenerationPromptBoundary } from "../../modules/generationPromptPolicy.js";
import { onLocaleChange, t } from "../../i18n/index.js";
import { getTaskMessage, resolveGenerationButtonMode } from "../../core/generationTaskUiState.js";
import { DEFAULT_IMAGE_NODE_MODEL, DEFAULT_IMAGE_NODE_PROVIDER } from "./defaults.js";
const AIGEN_IMAGE_HIDDEN_SOURCE_CLEAR_DELAY_MS = 1200;
const AIGEN_IMAGE_LOD_HOVER_REFRESH_DELAY_MS = 160;
const AIGEN_IMAGE_MULTI_STACK_MOTION_DURATION_MS = 500;
const AIGEN_IMAGE_BACKPLATE_MEDIA_HIDE_CLEAR_DELAY_MS = 180;
function getPlainUiSchemaParams(_0x35c787) {
  if (_0x35c787 && typeof _0x35c787 === "object" && !Array.isArray(_0x35c787)) {
    return _0x35c787;
  } else {
    return {};
  }
}
export function shouldShowImagePromptInput(_0x2e55de) {
  if (!_0x2e55de || typeof _0x2e55de !== "object") {
    return true;
  }
  if (_0x2e55de?.prompt?.visible === false) {
    return false;
  }
  if (_0x2e55de?.prompt?.hidden === true) {
    return false;
  }
  return true;
}
function getRhAiAppImageResultMediaKey(_0x56abda = {}) {
  const _0xead744 = Array.isArray(_0x56abda?.images) ? _0x56abda.images : [];
  const _0x1a0cb3 = Number(_0x56abda?.mainImageIndex);
  const _0x327ad7 = Number.isFinite(_0x1a0cb3) ? Math.max(0, Math.trunc(_0x1a0cb3)) : 0;
  const _0x1317f1 = _0xead744[Math.min(_0x327ad7, Math.max(0, _0xead744.length - 1))] || {};
  return [_0x1317f1.displayLocalPath, _0x1317f1.localPath, _0x1317f1.originalLocalPath, _0x1317f1.imageUrl, _0x1317f1.sourceUrl, _0x1317f1.thumbUrl, _0x1317f1.thumbId, _0x56abda?.imageUrl, _0x56abda?.sourceUrl, _0x56abda?.thumbUrl].map(_0x4f9885 => String(_0x4f9885 || "").trim()).find(Boolean) || "";
}
export function resolveUploadedImageReferenceUrl(_0x3ff4c3 = {}) {
  const _0x4225ae = buildImageNodeStorageFields(_0x3ff4c3);
  return String(_0x3ff4c3?.displayUrl || "").trim() || String(_0x3ff4c3?.originalUrl || "").trim() || String(_0x3ff4c3?.url || "").trim() || toLocalPathUrl(_0x4225ae.displayLocalPath || _0x4225ae.originalLocalPath || _0x4225ae.localPath);
}
function flushAIGenImageReferenceUploadNodes(_0x16b61b = []) {
  const _0xc5cab = Array.from(new Set(_0x16b61b.map(_0x28fbb8 => String(_0x28fbb8 || "").trim()).filter(Boolean)));
  if (_0xc5cab.length === 0) {
    return false;
  }
  const _0x35bead = globalThis.window?.v2Renderer;
  if (typeof _0x35bead?.flushNodes === "function") {
    try {
      if (_0x35bead.flushNodes(_0xc5cab) === true) {
        return true;
      }
    } catch {}
  }
  if (typeof _0x35bead?.flushNode !== "function") {
    return false;
  }
  let _0x178a80 = false;
  for (const _0x29b7a3 of _0xc5cab) {
    try {
      _0x178a80 = _0x35bead.flushNode(_0x29b7a3) === true || _0x178a80;
    } catch {}
  }
  return _0x178a80;
}
export function hasImageInputForUiSchemaNodeData({
  nodeId = "",
  nodeData = {},
  state = {},
  incomingEdges = null
} = {}) {
  if (!nodeData || typeof nodeData !== "object") {
    return false;
  }
  if (nodeData.hasInputImages === true) {
    return true;
  }
  const _0x563828 = [nodeData.inputUrls, nodeData.image_urls, nodeData.inputImageUrls, nodeData.referenceImageUrls];
  if (_0x563828.some(_0x45c087 => Array.isArray(_0x45c087) ? _0x45c087.some(_0x40ed5d => String(_0x40ed5d || "").trim()) : String(_0x45c087 || "").trim())) {
    return true;
  }
  if (getPromptAssetInputRefsFromNode(nodeData, {
    allowedTypes: ["image"]
  }).some(_0x2b50d1 => String(_0x2b50d1?.url || "").trim())) {
    return true;
  }
  const _0xb4ba4d = state?.nodes || {};
  const _0x57f985 = getTargetInputPolicy({
    ...nodeData,
    type: nodeData.type || "ai-image"
  });
  const _0x3fd383 = Array.isArray(incomingEdges) ? incomingEdges : Object.values(state?.edges || {});
  return _0x3fd383.some(_0x4b2d61 => {
    if (!_0x4b2d61 || String(_0x4b2d61.targetId || "") !== String(nodeId || "")) {
      return false;
    }
    const _0x2d440f = _0xb4ba4d[_0x4b2d61.sourceId];
    if (!_0x2d440f) {
      return false;
    }
    const _0x558599 = resolveEffectiveInputKind(_0x2d440f, _0x4b2d61);
    return _0x558599 === "image" && isInputKindAllowed(_0x57f985, _0x558599);
  });
}
function collectSubmitButtonInputRecords({
  latestNode = {},
  nodes = {},
  inEdges = [],
  imageInputGate = {}
} = {}) {
  const _0x5d4150 = getTargetInputPolicy({
    ...latestNode,
    type: latestNode?.type || "ai-image"
  });
  const _0x2a43fa = String(imageInputGate?.kind || "").trim();
  const _0x41d67d = [];
  if (_0x2a43fa === "image" && getImageInputGateUploadedUrl(latestNode, imageInputGate)) {
    _0x41d67d.push({
      kind: "image",
      refSlot: ""
    });
  }
  (Array.isArray(inEdges) ? inEdges : []).forEach(_0x25090f => {
    const _0x22737f = nodes?.[_0x25090f?.sourceId];
    if (!_0x22737f) {
      return;
    }
    const _0x1434c2 = resolveEffectiveInputKind(_0x22737f, _0x25090f);
    if (!_0x1434c2 || !isInputKindAllowed(_0x5d4150, _0x1434c2)) {
      return;
    }
    if (_0x2a43fa && _0x1434c2 !== _0x2a43fa) {
      return;
    }
    if (_0x1434c2 === "text") {
      const _0x2320f = String(_0x22737f.outputText || _0x22737f.text || _0x22737f.content || _0x22737f.prompt || _0x22737f.label || "").trim();
      if (!_0x2320f) {
        return;
      }
    }
    _0x41d67d.push({
      kind: _0x1434c2,
      refSlot: _0x25090f?.refSlot || ""
    });
  });
  return _0x41d67d;
}
export function createAIGenerateNodeUiModule(_0x5494e1) {
  const {
    store: _0x3ca44d,
    api: _0x1f857d,
    getDisplayModelName: _0x2c0dca,
    _handlePillHover: _0x2c1eda,
    _handlePillOut: _0x209597,
    _syncEdgesOrderFromPills: _0xe34b8,
    _syncPillLabels: _0x2930eb,
    _checkAtTrigger: _0x5c16b0,
    _populateMentionMenu: _0x4373d6,
    _insertMentionPill: _0x2751f2,
    _handlePillKeyboard: _0x2b4633,
    _rehydratePromptPills: _0x4c81c9,
    _handleMentionMenuKeyboard: _0x274a45,
    TEXT_TOOLBAR_HTML: _0x4a5901,
    bindTextToolbarEvents: _0x3a2b7e,
    IMAGE_TOOLBAR_HTML: _0x53de02,
    bindImageToolbarEvents: _0x3f5184,
    showDevToast: _0x159b45,
    getImage: _0x460823,
    openNodeImagePreview: _0xd1f0e2,
    getPromptPresets: _0xd6a86,
    openCustomPresetsManager: _0x10386b,
    startLoading: _0x4289aa,
    stopLoading: _0xdf6b45,
    bindRefThumbHoverPreview: _0x3ff32a,
    ensureThumbDecoded: _0x17a60d,
    revealRefThumbMedia: _0x1e6eaf,
    getRefKindByNodeType: _0x746cd6,
    uploadFile: _0x3ee360,
    ensureConfig: _0x53e8a5,
    getProviderConfig: _0x1e9bfd,
    generateId: _0x21092c,
    checkSlashTrigger: _0x47df0e,
    handleSlashKeyboardNavigation: _0x1cdafa,
    closeSlashMenu: _0x9ff3f5,
    activateMenuKeyboard: _0x3b5997,
    ImageFreeAngleController: _0x98bc0a
  } = _0x5494e1;
  const _0x4ff423 = () => typeof _0x3ca44d.getStateRaw === "function" ? _0x3ca44d.getStateRaw() : _0x3ca44d.getState();
  class _0x44616b {
    refreshModelRegistryUi() {
      return this._refreshModelRegistryUi?.() === true;
    }
    _getUiSchemaRenderNodeData(_0x405f94 = this._data) {
      return {
        ...(_0x405f94 || {}),
        hasInputImages: hasImageInputForUiSchemaNodeData({
          nodeId: this.nodeId,
          nodeData: _0x405f94 || {},
          state: _0x4ff423() || {}
        })
      };
    }
    _shouldUseLowZoomThumbnail() {
      return shouldUseLowZoomImageThumbnail({
        nodeId: this.nodeId,
        rootEl: this._root,
        store: _0x3ca44d
      });
    }
    _pickImageDisplayUrl(_0x307a12 = "", _0x231ec7 = "", _0x32104f = {}) {
      const _0x257f13 = _0x32104f && Object.prototype.hasOwnProperty.call(_0x32104f, "lowZoomThumbnail");
      return pickImageLodUrl({
        mainUrl: _0x307a12,
        thumbUrl: _0x231ec7,
        lowZoomThumbnail: _0x257f13 ? !!_0x32104f.lowZoomThumbnail : this._shouldUseLowZoomThumbnail()
      });
    }
    _applyImageElementLod(_0x1df449, _0x54f179 = "full") {
      if (!_0x1df449) {
        return;
      }
      _0x1df449.dataset.lodSrc = _0x54f179 === "thumb" ? "thumb" : "full";
    }
    _getImageDisplayElements() {
      const _0x59f456 = [];
      if (this.imgEl) {
        _0x59f456.push(this.imgEl);
      }
      for (const _0x5c91f7 of this._multiImagesContainer?.querySelectorAll?.("img") || []) {
        if (_0x5c91f7 && !_0x59f456.includes(_0x5c91f7)) {
          _0x59f456.push(_0x5c91f7);
        }
      }
      return _0x59f456;
    }
    _isImageObjectUrlReferenced(_0x1a7c7b, _0x29581f) {
      if (!_0x1a7c7b || !_0x29581f) {
        return false;
      }
      return [_0x1a7c7b.getAttribute?.("src"), _0x1a7c7b.currentSrc, _0x1a7c7b.src, _0x1a7c7b.dataset?.lazySrc, _0x1a7c7b.dataset?.lazyPreviewSrc].some(_0x44d592 => String(_0x44d592 || "").trim() === _0x29581f);
    }
    _queueImageObjectUrlRelease(_0x5d3a4) {
      const _0x559c94 = String(_0x5d3a4 || "").trim();
      if (!_0x559c94.startsWith("blob:")) {
        return false;
      }
      if (!this._pendingImageObjectUrlReleases) {
        this._pendingImageObjectUrlReleases = new Set();
      }
      if (!this._imageObjectUrlReleaseCallbacks) {
        this._imageObjectUrlReleaseCallbacks = new Map();
      }
      this._pendingImageObjectUrlReleases.add(_0x559c94);
      if (!this._imageObjectUrlReleaseCallbacks.has(_0x559c94)) {
        this._imageObjectUrlReleaseCallbacks.set(_0x559c94, () => {
          this._flushPendingImageObjectUrlReleases();
        });
      }
      this._flushPendingImageObjectUrlReleases();
      return true;
    }
    _flushPendingImageObjectUrlReleases() {
      const _0x53824d = this._pendingImageObjectUrlReleases;
      if (!_0x53824d?.size) {
        return 0;
      }
      const _0xb8974 = this._getImageDisplayElements();
      let _0x4af99c = 0;
      for (const _0x2cbac8 of [..._0x53824d]) {
        const _0x2b780c = this._imageObjectUrlReleaseCallbacks?.get(_0x2cbac8);
        const _0x14c9b8 = _0xb8974.some(_0x507da => deferCanvasImageDisplayFallbackRelease(_0x507da, _0x2cbac8, _0x2b780c));
        const _0x2b03fa = _0xb8974.some(_0x5b146e => this._isImageObjectUrlReferenced(_0x5b146e, _0x2cbac8));
        if (_0x14c9b8 || _0x2b03fa) {
          continue;
        }
        revokeTrackedMediaObjectUrl(_0x2cbac8);
        _0x53824d.delete(_0x2cbac8);
        this._imageObjectUrlReleaseCallbacks?.delete(_0x2cbac8);
        _0x4af99c += 1;
      }
      return _0x4af99c;
    }
    _disposeImageObjectUrls() {
      disposeImageObjectUrls(this);
    }
    _syncReferenceUploadUi(_0x349521 = "") {
      if (typeof this._renderRefBar === "function") {
        Promise.resolve(this._renderRefBar()).catch(() => {});
      }
      if (typeof this._updateSubmitButtonState === "function") {
        this._updateSubmitButtonState();
      }
      flushAIGenImageReferenceUploadNodes([this.nodeId, _0x349521]);
    }
    async _handleReferenceUploadFile(_0xcc8bcd) {
      const _0x1cca62 = window.currentProjectId || "default_v2_project";
      const _0x16a6c7 = await _0x3ee360(_0xcc8bcd, _0x1cca62);
      const _0x1303f1 = resolveUploadedImageReferenceUrl(_0x16a6c7);
      if (!_0x1303f1) {
        throw new Error(t("aigenImage.upload.missingUrl"));
      }
      const _0x372175 = _0x3ca44d.getState().nodes?.[this.nodeId];
      const _0x30f0ca = getImageNodeInputGate(_0x372175?.model);
      const _0x312c59 = String(_0x30f0ca.kind || "") === "image";
      const _0x3785f9 = isRhPersonReplaceWorkflowModel(_0x372175?.model);
      const _0xbd7fc3 = isRhQwenImageEditModel(_0x372175?.model);
      const _0x3999f9 = getFixedInputSlotConfigFromManifest(_0x372175 || {});
      const _0x5a2f71 = Number(_0x372175?.x) || 0;
      const _0xca7592 = Number(_0x372175?.y) || 0;
      const _0x2fdd1e = Number(_0x372175?.width) || 360;
      const _0x3ac874 = Number(_0x372175?.height) || 360;
      const _0x5a097a = buildImageNodeStorageFields(_0x16a6c7);
      const _0x5dd9a4 = _0x16a6c7.localPath || _0x5a097a.localPath || _0x5a097a.originalLocalPath || String(_0x1303f1 || "").replace(/^\//, "");
      const _0x3e7ed7 = _0x21092c("source-image");
      const _0x60ab51 = 260;
      const _0xcc69cd = 260;
      const _0x4a6e04 = 24;
      const _0x520b3c = _0x5a2f71 - _0x4a6e04 - _0x60ab51;
      const _0x13a23d = _0xca7592 + Math.round((_0x3ac874 - _0xcc69cd) / 2);
      let _0x11380e = _0x13a23d;
      const _0x522996 = String(this._pendingRefSlot || "").trim();
      let _0x58b559 = _0x522996;
      const _0x5ac868 = (_0x3999f9?.visibleSlots || []).filter(_0x5c6211 => _0x3999f9?.slotKindById?.[_0x5c6211] === "image");
      const _0x1be32e = !!_0x522996 && _0x5ac868.includes(_0x522996);
      if (_0x3785f9) {
        const _0x23f80e = _0x522996 === "replacedImage" ? 1 : 0;
        const _0x2e0fd2 = _0x23f80e === 0 ? -Math.round(_0xcc69cd / 2) - 12 : Math.round(_0xcc69cd / 2) + 12;
        _0x11380e = _0x13a23d + _0x2e0fd2;
      } else if (_0x1be32e) {
        const _0x4ff3fc = Math.max(0, _0x5ac868.indexOf(_0x522996));
        const _0x3da025 = (_0x5ac868.length - 1) / 2;
        _0x11380e = _0x13a23d + Math.round((_0x4ff3fc - _0x3da025) * (_0xcc69cd + 24));
      }
      _0x3ca44d.batch(() => {
        const _0x5e590f = _0x3ca44d.getIncomingEdges(this.nodeId);
        if (_0x312c59) {
          for (const _0x221f3c of _0x5e590f) {
            _0x3ca44d.removeEdge(_0x221f3c.id);
          }
        } else if (_0x3785f9) {
          const _0x4efef2 = ["replaceTarget", "replacedImage"];
          let _0x203bb1 = _0x4efef2.includes(_0x522996) ? _0x522996 : "";
          if (!_0x203bb1) {
            const _0x5276fd = new Set(_0x5e590f.map(_0x25f06e => String(_0x25f06e.refSlot || "")).filter(_0x20d0a3 => _0x4efef2.includes(_0x20d0a3)));
            _0x203bb1 = _0x4efef2.find(_0x20ae60 => !_0x5276fd.has(_0x20ae60)) || "";
            if (!_0x203bb1) {
              let _0x5e9861 = null;
              for (const _0x48f531 of _0x5e590f) {
                const _0x276a47 = String(_0x48f531.refSlot || "");
                if (!_0x4efef2.includes(_0x276a47)) {
                  continue;
                }
                const _0x168802 = Number(_0x48f531.createdAt) || 0;
                if (!_0x5e9861 || _0x168802 < (Number(_0x5e9861.createdAt) || 0)) {
                  _0x5e9861 = _0x48f531;
                }
              }
              if (!_0x5e9861 && _0x5e590f.length > 0) {
                _0x5e9861 = _0x5e590f[0];
              }
              if (_0x5e9861) {
                _0x203bb1 = String(_0x5e9861.refSlot || "") || _0x4efef2[0];
                _0x3ca44d.removeEdge(_0x5e9861.id);
              } else {
                _0x203bb1 = _0x4efef2[0];
              }
            }
          } else {
            for (const _0x3860a4 of _0x5e590f) {
              if (String(_0x3860a4.refSlot || "") === _0x203bb1) {
                _0x3ca44d.removeEdge(_0x3860a4.id);
              }
            }
          }
          _0x58b559 = _0x203bb1;
        } else if (_0x1be32e) {
          const _0x55154a = getExclusiveSlotsForFixedSlot(_0x3999f9?.exclusiveGroups, _0x58b559);
          const _0xf09010 = new Set(_0x55154a.length ? _0x55154a : [_0x58b559]);
          for (const _0x107390 of _0x5e590f) {
            if (_0xf09010.has(String(_0x107390.refSlot || ""))) {
              _0x3ca44d.removeEdge(_0x107390.id);
            }
          }
        } else if (_0xbd7fc3) {
          const _0x3bf685 = _0x5e590f.filter(_0x1a942e => {
            const _0x3dc747 = _0x3ca44d.getState().nodes?.[_0x1a942e.sourceId];
            return _0x746cd6(_0x3dc747?.type || "") === "image";
          });
          if (_0x3bf685.length >= 3) {
            const _0xc6e246 = _0x3bf685.reduce((_0x114309, _0x1588c6) => (Number(_0x1588c6.createdAt) || 0) < (Number(_0x114309.createdAt) || 0) ? _0x1588c6 : _0x114309);
            if (_0xc6e246?.id) {
              _0x3ca44d.removeEdge(_0xc6e246.id);
            }
          }
        } else {
          for (const _0x1be5bf of _0x5e590f) {
            _0x3ca44d.removeEdge(_0x1be5bf.id);
          }
        }
        if (_0x312c59) {
          _0x3ca44d.updateNodeData(this.nodeId, buildImageInputGateClearPatch(_0x30f0ca));
        }
        removeCoveredAssetInputRefForConnection({
          targetId: this.nodeId,
          sourceKind: "image",
          refSlot: _0x3785f9 || _0x1be32e ? _0x58b559 : ""
        });
        _0x3ca44d.addNode(buildSourceMediaNodePayload({
          id: _0x3e7ed7,
          type: "source-image",
          x: _0x520b3c,
          y: _0x11380e,
          width: _0x60ab51,
          height: _0xcc69cd,
          src: _0x1303f1,
          localPath: _0x5dd9a4,
          assetId: _0x16a6c7.assetId || "",
          derivativeStatus: _0x16a6c7.derivativeStatus || _0x16a6c7.status || "",
          ..._0x5a097a,
          fileName: _0x16a6c7.filename || _0xcc8bcd.name || "",
          thumbUrl: null,
          needsAutoResize: true
        }));
        _0x3ca44d.addEdge({
          id: _0x21092c("edge"),
          sourceId: _0x3e7ed7,
          targetId: this.nodeId,
          ...((_0x3785f9 || _0x1be32e) && _0x58b559 ? {
            refSlot: _0x58b559,
            createdAt: Date.now()
          } : {
            createdAt: Date.now()
          })
        });
        _0x3ca44d.setSelectedNodes([this.nodeId]);
      });
      this._syncReferenceUploadUi(_0x3e7ed7);
      await new Promise(_0x4631d6 => {
        const _0xecb16a = new Image();
        _0xecb16a.onload = () => {
          const _0x5f4647 = _0xecb16a.naturalWidth || 1000;
          const _0x426a69 = _0xecb16a.naturalHeight || 1000;
          const {
            width: _0x1cf45a,
            height: _0x3421a4
          } = getAutoMediaSizeByShortSide(_0x5f4647, _0x426a69);
          if (_0x3ca44d.getState().nodes?.[_0x3e7ed7]) {
            _0x3ca44d.updateNodeData(_0x3e7ed7, {
              width: _0x1cf45a,
              height: _0x3421a4,
              needsAutoResize: false,
              x: _0x5a2f71 - _0x4a6e04 - _0x1cf45a,
              y: (_0x3785f9 || _0x1be32e) && _0x58b559 ? _0x11380e + Math.round((_0xcc69cd - _0x3421a4) / 2) : _0xca7592 + Math.round((_0x3ac874 - _0x3421a4) / 2)
            });
            this._syncReferenceUploadUi(_0x3e7ed7);
          }
          _0x4631d6();
        };
        _0xecb16a.onerror = () => _0x4631d6();
        _0xecb16a.src = _0x1303f1;
      });
      return _0x3e7ed7;
    }
    _ensureImageDisplayDecoded(_0x27fc4c = "") {
      const _0x49715f = String(_0x27fc4c || "").trim();
      if (!_0x49715f || typeof Image !== "function") {
        return Promise.resolve(true);
      }
      return preloadCanvasImage(_0x49715f, {
        decode: true,
        priority: 30,
        fetchPriority: "auto"
      }).then(() => true);
    }
    _setImageElementDisplaySource(_0x55fdb0, _0x5ec5b5 = {}, _0xd8bb76 = {}) {
      if (!_0x55fdb0?.dataset) {
        return;
      }
      const _0x5a7ba3 = String(_0x5ec5b5?.url || "").trim();
      const _0x2c7f0d = versionCanvasImageDisplayUrl(_0x5a7ba3, _0xd8bb76?.versionKey);
      const _0x539732 = _0x5ec5b5?.lod === "thumb" ? "thumb" : "full";
      const _0x1730ed = String(_0xd8bb76?.previewLod?.url || "").trim();
      const _0x5b416a = versionCanvasImageDisplayUrl(_0x1730ed, _0xd8bb76?.versionKey);
      const _0x4cec53 = _0xd8bb76?.previewLod?.lod === "full" ? "full" : "thumb";
      const _0x1bbb82 = _0xd8bb76?.display !== false;
      if (!_0x2c7f0d) {
        this._clearLazyImageDisplaySource(_0x55fdb0);
        if (_0x1bbb82) {
          _0x55fdb0.style.display = "none";
        }
        return;
      }
      const _0x2fbc38 = String(_0x55fdb0.getAttribute?.("src") || "").trim();
      const _0x4c2f39 = !!_0x2fbc38 && _0x2fbc38 !== _0x2c7f0d && _0x55fdb0.style.display !== "none";
      const _0x455922 = (Number(_0x55fdb0._imageDisplayDecodeToken) || 0) + 1;
      _0x55fdb0._imageDisplayDecodeToken = _0x455922;
      if (_0x4c2f39 && _0x5b416a && _0x5b416a !== _0x2c7f0d && _0x2fbc38 !== _0x5b416a) {
        this._cancelLazyImageDisplayClear(_0x55fdb0);
        assignCanvasImageDisplaySource(_0x55fdb0, _0x5b416a);
        this._applyImageElementLod(_0x55fdb0, _0x4cec53);
        if (_0x1bbb82) {
          _0x55fdb0.style.display = "block";
        }
      }
      let _0x19cadc = false;
      const _0x2acf71 = () => {
        if (_0x19cadc) {
          return;
        }
        if (_0x55fdb0._imageDisplayDecodeToken !== _0x455922) {
          return;
        }
        _0x19cadc = true;
        this._cancelLazyImageDisplayClear(_0x55fdb0);
        if (_0x55fdb0.getAttribute?.("src") !== _0x2c7f0d) {
          assignCanvasImageDisplaySource(_0x55fdb0, _0x2c7f0d);
        }
        this._flushPendingImageObjectUrlReleases();
        this._applyImageElementLod(_0x55fdb0, _0x539732);
        if (_0x1bbb82) {
          _0x55fdb0.style.display = "block";
        }
      };
      if (_0x2fbc38 === _0x2c7f0d || !_0x4c2f39) {
        _0x2acf71();
        return;
      }
      this._ensureImageDisplayDecoded(_0x2c7f0d).then(_0x2acf71).catch(_0x2acf71);
    }
    _setLazyImageDisplaySource(_0x208e53, _0x2b38de = {}, _0x5500fc = {}) {
      if (!_0x208e53?.dataset) {
        return;
      }
      const _0x3bcf99 = String(_0x2b38de?.url || "").trim();
      const _0x5f1811 = _0x2b38de?.lod === "thumb" ? "thumb" : "full";
      if (_0x3bcf99) {
        _0x208e53.dataset.lazySrc = _0x3bcf99;
      } else {
        delete _0x208e53.dataset.lazySrc;
      }
      const _0x4f6ce9 = String(_0x5500fc?.previewLod?.url || "").trim();
      if (_0x4f6ce9) {
        _0x208e53.dataset.lazyPreviewSrc = _0x4f6ce9;
      } else {
        delete _0x208e53.dataset.lazyPreviewSrc;
      }
      _0x208e53.dataset.lazyPreviewLodSrc = _0x5500fc?.previewLod?.lod === "full" ? "full" : "thumb";
      const _0xf70698 = String(_0x5500fc?.versionKey || "").trim();
      if (_0xf70698) {
        _0x208e53.dataset.lazyVersionKey = _0xf70698;
      } else {
        delete _0x208e53.dataset.lazyVersionKey;
      }
      _0x208e53.dataset.lazyLodSrc = _0x5f1811;
      this._applyImageElementLod(_0x208e53, _0x5f1811);
    }
    _cancelLazyImageDisplayClear(_0x45c4bb) {
      if (!_0x45c4bb?._lazyImageDisplayClearTimer) {
        return;
      }
      clearTimeout(_0x45c4bb._lazyImageDisplayClearTimer);
      _0x45c4bb._lazyImageDisplayClearTimer = null;
    }
    _loadLazyImageDisplaySource(_0x223475) {
      if (!_0x223475?.dataset) {
        return;
      }
      const _0x24933d = String(_0x223475.dataset.lazySrc || "").trim();
      if (!_0x24933d) {
        this._clearLazyImageDisplaySource(_0x223475);
        return;
      }
      this._cancelLazyImageDisplayClear(_0x223475);
      this._setImageElementDisplaySource(_0x223475, {
        url: _0x24933d,
        lod: _0x223475.dataset.lazyLodSrc || "full"
      }, {
        versionKey: _0x223475.dataset.lazyVersionKey || "",
        previewLod: {
          url: _0x223475.dataset.lazyPreviewSrc || "",
          lod: _0x223475.dataset.lazyPreviewLodSrc || "thumb"
        }
      });
    }
    _clearLazyImageDisplaySource(_0x368ebe) {
      if (!_0x368ebe) {
        return;
      }
      this._cancelLazyImageDisplayClear(_0x368ebe);
      _0x368ebe._imageDisplayDecodeToken = (Number(_0x368ebe._imageDisplayDecodeToken) || 0) + 1;
      clearCanvasImageDisplayHandoff(_0x368ebe);
      if (typeof _0x368ebe.removeAttribute === "function") {
        _0x368ebe.removeAttribute("src");
      }
      this._flushPendingImageObjectUrlReleases();
    }
    _scheduleClearLazyImageDisplaySource(_0x502adf, _0x4ba7d9 = 0) {
      if (!_0x502adf) {
        return;
      }
      this._cancelLazyImageDisplayClear(_0x502adf);
      const _0x591199 = Math.max(0, Number(_0x4ba7d9) || 0);
      _0x502adf._lazyImageDisplayClearTimer = setTimeout(() => {
        _0x502adf._lazyImageDisplayClearTimer = null;
        this._clearLazyImageDisplaySource(_0x502adf);
      }, _0x591199);
    }
    _getResultImageDragOutNodeData() {
      const _0x22ae0a = typeof _0x3ca44d.getStateRaw === "function" ? _0x3ca44d.getStateRaw() : typeof _0x3ca44d.getState === "function" ? _0x3ca44d.getState() : {};
      return _0x22ae0a?.nodes?.[this.nodeId] || this._data || {};
    }
    _removeCurrentNodeFromSelection() {
      const _0x21a729 = typeof _0x3ca44d.getStateRaw === "function" ? _0x3ca44d.getStateRaw() : typeof _0x3ca44d.getState === "function" ? _0x3ca44d.getState() : {};
      const _0x25dadd = Array.isArray(_0x21a729?.selectedNodeIds) ? _0x21a729.selectedNodeIds : [];
      if (!_0x25dadd.includes(this.nodeId)) {
        return;
      }
      _0x3ca44d.setSelectedNodes?.(_0x25dadd.filter(_0x464f81 => _0x464f81 !== this.nodeId));
    }
    _bindResultImageDragOut(_0x7e849d, _0x5765bc = {}) {
      if (!_0x7e849d) {
        return () => false;
      }
      let _0x3c8e85 = false;
      const _0x14fd41 = () => {
        _0x3c8e85 = true;
        setTimeout(() => {
          _0x3c8e85 = false;
        }, 450);
      };
      const _0x28d725 = () => {
        const _0x58ba5d = this._getResultImageDragOutNodeData();
        const _0x24a6d4 = Array.isArray(_0x58ba5d?.images) ? _0x58ba5d.images : [];
        const _0x4ffcdb = typeof _0x5765bc.getImageIndex === "function" ? _0x5765bc.getImageIndex() : _0x5765bc.imageIndex;
        const _0x4a06f7 = Number.isFinite(Number(_0x4ffcdb)) ? Math.floor(Number(_0x4ffcdb)) : -1;
        return _0x24a6d4[_0x4a06f7] || null;
      };
      const _0x1ebef7 = () => {
        const _0x326581 = typeof _0x5765bc.getFallbackSize === "function" ? _0x5765bc.getFallbackSize() : null;
        return {
          width: Number(_0x326581?.width) || Number(this.previewEl?.offsetWidth) || Number(this._data?.width) || 320,
          height: Number(_0x326581?.height) || Number(this.previewEl?.offsetHeight) || Number(this._data?.height) || 320
        };
      };
      bindResultImageDragOutGesture(_0x7e849d, {
        image: _0x28d725,
        isEnabled: () => {
          const _0x255a22 = this._getResultImageDragOutNodeData();
          const _0x402eb2 = !!_0x255a22?.isImagesExpanded && Array.isArray(_0x255a22.images) && _0x255a22.images.length > 1;
          if (!_0x402eb2) {
            return false;
          }
          if (typeof _0x5765bc.isEnabled === "function") {
            return _0x5765bc.isEnabled(_0x255a22) !== false;
          } else {
            return true;
          }
        },
        getViewport: () => {
          const _0x4f6e0a = typeof _0x3ca44d.getStateRaw === "function" ? _0x3ca44d.getStateRaw() : typeof _0x3ca44d.getState === "function" ? _0x3ca44d.getState() : {};
          return _0x4f6e0a?.viewport || {
            x: 0,
            y: 0,
            zoom: 1
          };
        },
        getGhostSourceElement: _0x5765bc.getGhostSourceElement,
        getFallbackSrc: _0x5765bc.getFallbackSrc,
        getGhostSize: () => {
          const _0x5480d4 = _0x5765bc.getGhostSourceElement?.() || _0x7e849d;
          if (_0x5480d4 && typeof _0x5480d4.getBoundingClientRect === "function") {
            const _0x4b3ec4 = _0x5480d4.getBoundingClientRect();
            if (_0x4b3ec4.width > 0 && _0x4b3ec4.height > 0) {
              return {
                width: _0x4b3ec4.width,
                height: _0x4b3ec4.height
              };
            }
          }
          return _0x1ebef7();
        },
        getNodeFallbackSize: _0x1ebef7,
        createId: () => _0x21092c("source-image"),
        addNode: _0x7a85fa => _0x3ca44d.addNode?.(_0x7a85fa),
        setSelectedNodes: _0x5e2d1d => _0x3ca44d.setSelectedNodes?.(_0x5e2d1d),
        commit: commit,
        showToast: (_0xa03f15, _0x519d4e) => {
          if (typeof globalThis.window?.showToast === "function") {
            globalThis.window.showToast(_0xa03f15, _0x519d4e);
          } else if (typeof _0x159b45 === "function") {
            _0x159b45(_0xa03f15);
          }
        },
        markClickSuppressed: _0x14fd41,
        onDragStart: () => {
          _0x7e849d.classList?.add("is-result-drag-source");
        },
        onDragEnd: () => {
          _0x7e849d.classList?.remove("is-result-drag-source");
        }
      });
      return () => _0x3c8e85;
    }
    _runVipRetryOnce(_0x2fa047) {
      let _0x30f984 = false;
      return () => {
        if (_0x30f984) {
          return;
        }
        _0x30f984 = true;
        this._vipSelectionRetryInProgress = true;
        try {
          _0x2fa047();
        } finally {
          this._vipSelectionRetryInProgress = false;
        }
      };
    }
    _guardVipSelection(_0x2c1977, _0x350308 = "", _0x5c4930 = null) {
      return true;
    }
    mount() {
      this._data = this._normalizeLegacySeedreamModel(this._data);
      this._data = this._normalizeDreaminaNodeData(this._data, {
        syncStore: false
      });
      const _0x42b54c = document.createElement("div");
      _0x42b54c.className = "aigen-node-root aigen-image-node-root";
      if (this.isNoResult) {
        _0x42b54c.classList.add("no-result");
      }
      this._root = _0x42b54c;
      _0x42b54c.innerHTML = _0x53de02;
      this.previewEl = document.createElement("div");
      this.previewEl.className = "img-node-preview aigen-node-preview-fill aigen-image-preview";
      this.imgEl = document.createElement("img");
      this.imgEl.draggable = false;
      this.imgEl.className = "v2-media-preview aigen-image-media";
      const _0x4661c8 = document.createElement("div");
      _0x4661c8.className = "img-node-placeholder aigen-media-placeholder";
      _0x4661c8.innerHTML = "\n            <svg class=\"placeholder-icon-svg\" width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" style=\"transition:all 0.2s;\">\n                <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/>\n                <circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/>\n                <polyline points=\"21 15 16 10 5 21\"/>\n            </svg>";
      this._maskOverlay = document.createElement("img");
      this._maskOverlay.className = "node-img-mask-overlay aigen-image-mask-overlay";
      this.previewEl.appendChild(this.imgEl);
      this.previewEl.appendChild(this._maskOverlay);
      this.previewEl.appendChild(_0x4661c8);
      this._placeholderEl = _0x4661c8;
      syncPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions?.());
      _0x42b54c.appendChild(this.previewEl);
      const _0xc899c5 = document.createElement("div");
      _0xc899c5.className = "node-resizer";
      _0x42b54c.appendChild(_0xc899c5);
      this._applyMaskPreview(this._data?.maskPreviewUrl || this._data?.maskPreview);
      this.imgEl.addEventListener("load", () => {
        if (this.imgEl?.dataset?.lodSrc === "thumb") {
          return;
        }
        const _0x133d8d = Number(this.imgEl?.naturalWidth || 0);
        const _0x48e752 = Number(this.imgEl?.naturalHeight || 0);
        if (!(_0x133d8d > 0) || !(_0x48e752 > 0)) {
          return;
        }
        const _0x2136d5 = _0x3ca44d.getState().nodes?.[this.nodeId];
        if (!_0x2136d5) {
          return;
        }
        const _0x5bb4c2 = {};
        if (Number(_0x2136d5.imageWidth || 0) !== _0x133d8d) {
          _0x5bb4c2.imageWidth = _0x133d8d;
        }
        if (Number(_0x2136d5.imageHeight || 0) !== _0x48e752) {
          _0x5bb4c2.imageHeight = _0x48e752;
        }
        if (isRunningHubAiAppManifest(getModelManifest(_0x2136d5?.model))) {
          Object.assign(_0x5bb4c2, buildRhAiAppResultDisplayPatch({
            nodeData: _0x2136d5,
            mediaWidth: _0x133d8d,
            mediaHeight: _0x48e752,
            mediaKey: getRhAiAppImageResultMediaKey(_0x2136d5),
            shortSide: getAIGenerationNodeSize().width
          }));
        }
        if (Object.keys(_0x5bb4c2).length > 0) {
          _0x3ca44d.updateNodeData(this.nodeId, _0x5bb4c2);
        }
      });
      if (this._rendererMediaDeferred !== true) {
        this._loadAndDisplayImage();
      }
      const _0x508357 = () => {
        if (this._rendererMediaDeferred === true) {
          return;
        }
        const _0x2b2234 = Array.isArray(this._data?.images) ? this._data.images : [];
        if (_0x2b2234.length > 1) {
          this._loadAndDisplayImage({
            force: true
          });
        }
      };
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(_0x508357);
      } else {
        setTimeout(_0x508357, 0);
      }
      const _0x4d9572 = () => Array.isArray(this._data?.images) && this._data.images.length > 1;
      const _0x51a796 = () => !_0x4d9572() && (isCanvasLowZoomActive() || this.imgEl?.dataset?.lodSrc === "thumb");
      const _0x3837da = () => {
        if (!_0x51a796()) {
          return;
        }
        this._loadAndDisplayImage({
          force: true
        });
      };
      const _0x363302 = (_0x43c26f = 0) => {
        if (this._lowZoomHoverRefreshTimer) {
          clearTimeout(this._lowZoomHoverRefreshTimer);
          this._lowZoomHoverRefreshTimer = null;
        }
        if (_0x43c26f > 0) {
          this._lowZoomHoverRefreshTimer = setTimeout(() => {
            this._lowZoomHoverRefreshTimer = null;
            if (_0x51a796()) {
              setNodeMediaLodHoverPromoted(this._root, true);
            }
            _0x3837da();
          }, _0x43c26f);
          return;
        }
        setNodeMediaLodHoverPromoted(this._root, false);
        _0x3837da();
      };
      _0x42b54c.addEventListener("pointerenter", () => _0x363302(AIGEN_IMAGE_LOD_HOVER_REFRESH_DELAY_MS));
      _0x42b54c.addEventListener("pointerleave", () => _0x363302(0));
      this.imgEl.addEventListener("dblclick", async _0x5f36b1 => {
        _0x5f36b1.stopPropagation();
        await _0xd1f0e2(this._data, {
          currentSrc: this.imgEl.currentSrc || this.imgEl.src || ""
        });
      });
      const _0x3de390 = document.createElement("div");
      _0x3de390.className = "text-prompt-panel";
      _0x3de390.addEventListener("pointerdown", _0x2a57ba => {
        _0x2a57ba.stopPropagation();
      });
      this._promptPanel = _0x3de390;
      _0x42b54c.addEventListener("v2-node:free-angle", _0x32945a => {
        _0x32945a.stopPropagation();
        this._switchToFreeAngle();
      });
      _0x3de390.addEventListener("dblclick", _0x56d1b2 => {
        if (!_0x56d1b2.target.closest(".prompt-textarea")) {
          _0x56d1b2.preventDefault();
          _0x56d1b2.stopPropagation();
        }
      });
      this.refBarEl = document.createElement("div");
      this.refBarEl.className = "node-ref-bar";
      this.refBarEl.innerHTML = createPromptAttachmentButtonHTML({
        stroke: "var(--white-90)"
      });
      _0x3de390.appendChild(this.refBarEl);
      this.refBarEl.addEventListener("click", _0x459099 => {
        const _0x4e4702 = _0x459099.target.closest(".prompt-attachment-btn");
        if (!_0x4e4702) {
          return;
        }
        if (_0x459099._pickConnectHandled) {
          return;
        }
        _0x459099.stopPropagation();
        _0x459099.preventDefault();
        const _0x2c092f = _0x3ca44d.getState().pickConnectMode;
        if (_0x2c092f && _0x2c092f.active && _0x2c092f.sourceNodeId === this.nodeId) {
          _0x3ca44d.setPickConnectMode({
            active: false
          });
        } else {
          _0x3ca44d.setPickConnectMode({
            active: true,
            sourceNodeId: this.nodeId,
            handleDirection: "left"
          });
        }
      });
      this.refBarEl.addEventListener("pointerdown", _0x3051cf => {
        const _0xfd1f6a = _0x3051cf.target.closest(".prompt-attachment-btn");
        if (_0xfd1f6a) {
          _0x3051cf.stopPropagation();
        }
      });
      this._unbindRefThumbHoverPreview = _0x3ff32a(this.refBarEl);
      this._refUploadInput = document.createElement("input");
      this._refUploadInput.type = "file";
      this._refUploadInput.accept = "image/*";
      this._refUploadInput.style.display = "none";
      _0x3de390.appendChild(this._refUploadInput);
      this._refUploadInput.addEventListener("change", async _0x514911 => {
        const _0x16b2b5 = _0x514911.target.files?.[0];
        if (!_0x16b2b5) {
          return;
        }
        try {
          await this._handleReferenceUploadFile(_0x16b2b5);
        } catch (_0xb30f10) {
          window.showToast?.(_0xb30f10?.message || t("aigenImage.upload.failedRetry"), "error");
        } finally {
          this._pendingRefSlot = "";
          this._refUploadInput.value = "";
        }
      });
      this.refBarEl.addEventListener("click", _0x199290 => {
        const _0x4ec970 = _0x199290.target.closest(".ref-thumb-delete");
        if (_0x4ec970) {
          _0x199290.stopPropagation();
          _0x199290.preventDefault();
          const _0x34af20 = _0x4ec970.closest(".ref-thumb-wrap");
          if (_0x34af20?.dataset?.refOrigin === "asset") {
            const _0x3d2cb7 = {
              assetId: _0x34af20.dataset.assetId,
              assetIndex: _0x34af20.dataset.assetIndex,
              type: _0x34af20.dataset.refType || _0x34af20.dataset.type || _0x34af20.dataset.kind,
              occurrence: _0x34af20.dataset.assetOccurrence
            };
            const _0xf7a558 = String(_0x34af20.dataset.assetRefSource || "").trim();
            const _0x21d117 = _0xf7a558 === "hidden" ? removePromptAssetInputRefFromNode(this, _0x3d2cb7) : removeAssetMentionPillFromPrompt(this, _0x3d2cb7) || removePromptAssetInputRefFromNode(this, _0x3d2cb7);
            if (_0x21d117) {
              return;
            }
          }
          const _0x127ff5 = _0x34af20?.dataset.edgeId;
          if (_0x127ff5) {
            _0x3ca44d.removeEdge(_0x127ff5);
          }
          return;
        }
        const _0x5a396b = _0x199290.target.closest(".ref-upload-delete");
        if (_0x5a396b) {
          _0x199290.stopPropagation();
          _0x199290.preventDefault();
          _0x3ca44d.updateNodeData(this.nodeId, buildImageInputGateClearPatch(getImageNodeInputGate(this._data?.model)));
          return;
        }
        const _0x30b3c8 = _0x199290.target.closest(".ref-upload-slot");
        if (_0x30b3c8) {
          _0x199290.stopPropagation();
          _0x199290.preventDefault();
          const _0x5266cd = _0x3ca44d.getState().nodes?.[this.nodeId];
          const _0xe4b325 = String(getImageNodeInputGate(_0x5266cd?.model).kind || "") === "image";
          const _0x240638 = isRhPersonReplaceWorkflowModel(_0x5266cd?.model);
          const _0x15ae04 = getFixedInputSlotConfigFromManifest(_0x5266cd || {});
          const _0x38b70a = String(_0x30b3c8.dataset.refSlot || _0x30b3c8.dataset.slot || "").trim();
          const _0x4bcbed = !!_0x38b70a && _0x15ae04?.visibleSlots?.includes(_0x38b70a) && _0x15ae04?.slotKindById?.[_0x38b70a] === "image";
          if (_0xe4b325 || _0x240638 || _0x4bcbed) {
            this._pendingRefSlot = _0x38b70a;
            this._refUploadInput?.click();
          }
        }
      });
      this.refBarEl.addEventListener("pointerdown", _0xa43356 => {
        if (_0xa43356.target.closest(".ref-thumb-wrap, .ref-upload-slot, .ref-upload-delete, .ref-thumb-delete")) {
          _0xa43356.stopPropagation();
        }
      });
      const _0xc7a7f3 = document.createElement("div");
      _0xc7a7f3.className = "prompt-input-wrapper";
      _0xc7a7f3.classList.add("is-resizable");
      this._promptInputWrap = _0xc7a7f3;
      this.promptEl = document.createElement("div");
      this.promptEl.className = "prompt-textarea custom-textarea";
      this.promptEl.contentEditable = "true";
      this.promptEl.spellcheck = false;
      this._syncPromptPlaceholder(this._data);
      if (!document.head.querySelector("#v2-gen-node-css")) {
        const _0x2e0a10 = document.createElement("style");
        _0x2e0a10.id = "v2-gen-node-css";
        _0x2e0a10.textContent = "\n                .prompt-textarea:empty::before {\n                    content: attr(data-placeholder);\n                    color: var(--text-placeholder);\n                    pointer-events: none;\n                }\n                .ref-pill {\n                    display: inline-flex; align-items: center; gap: 3px;\n                    background: transparent; border: none;\n                    border-radius: 4px; padding: 1px 6px; font-size: 14px; /* 原 12px -> 14px */\n                    color: var(--text-secondary); cursor: var(--pointer-cursor); user-select: text; -webkit-user-select: text; font-weight: 500;\n                    vertical-align: middle;\n                }\n                .ref-pill .pill-del {\n                    font-size: 16px; /* 原 14px -> 16px */ color: var(--text-muted);\n                    cursor: var(--link-cursor); margin-left: 2px; line-height: 1;\n                }\n                .ref-pill .pill-del:hover { color: var(--red); }\n                .ref-thumb-wrap.dragging { opacity: 0.3; }\n\n                .v2-slash-item {\n                    display: flex; flex-direction: column; justify-content: center;\n                    padding: 10px 12px; border-radius: 12px; cursor: var(--link-cursor);\n                    background: transparent; border: none;\n                    transition: all 0.2s; position: relative; height: 54px; overflow: hidden; box-sizing: border-box;\n                }\n                .v2-slash-item:hover, .v2-slash-item.active { background: var(--white-05); }\n                .v2-slash-title {\n                    color: var(--text-primary); font-size: 13px; font-weight: 600;\n                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);\n                    transform: translateY(10px);\n                }\n                .v2-slash-desc {\n                    color: var(--text-muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace; margin-top: 4px;\n                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;\n                    transform: translateY(16px);\n                    opacity: 0;\n                }\n                .v2-slash-item:hover > .v2-slash-title, .v2-slash-item.active > .v2-slash-title,\n                .v2-slash-item:hover > .v2-slash-desc, .v2-slash-item.active > .v2-slash-desc {\n                    transform: translateY(0);\n                }\n                .v2-slash-item:hover > .v2-slash-desc, .v2-slash-item.active > .v2-slash-desc {\n                    opacity: 1;\n                }\n            ";
        document.head.appendChild(_0x2e0a10);
      }
      this._flushPromptHtmlCommit = () => flushPromptHtmlCommit(this);
      this.promptEl.addEventListener("input", _0x412eb2 => {
        schedulePromptHtmlCommit(this);
        this._checkAtTrigger(_0x412eb2);
        _0x47df0e(_0x412eb2, {
          promptEl: this.promptEl,
          nodeType: this._data.type,
          nodeId: this.nodeId,
          onGenerate: (_0x4023c7, _0x4c6b0b) => this._onGenerate(_0x4023c7, _0x4c6b0b)
        });
        if (shouldSkipPromptTriggerForBulkInput(_0x412eb2)) {
          return;
        }
        _0xe34b8(this);
        this._updateSubmitButtonState();
      });
      this.promptEl.addEventListener("blur", () => {
        flushPromptHtmlCommit(this);
      });
      this.promptEl.addEventListener("mouseover", _0x45aac1 => {
        _0x2c1eda(_0x45aac1, this);
      });
      this.promptEl.addEventListener("mouseout", _0x6ca92d => {
        _0x209597(_0x6ca92d, this);
      });
      this.promptEl.addEventListener("keydown", _0x13b89c => {
        if (handlePromptSelectAll(this, _0x13b89c)) {
          return;
        }
        if (_0x274a45(_0x13b89c)) {
          return;
        }
        if (_0x1cdafa(_0x13b89c)) {
          return;
        }
        if (shouldSubmitPromptByKeyboard(_0x13b89c)) {
          _0x13b89c.preventDefault();
          flushPromptHtmlCommit(this);
          this.btnEl?.click();
          return;
        }
        _0x2b4633(this, _0x13b89c);
      });
      this.promptEl.addEventListener("paste", _0x2eb47d => {
        handlePromptPaste(this, _0x2eb47d);
      });
      _0xc7a7f3.appendChild(this.promptEl);
      this._syncPromptBoxSizeFromData(this._data);
      this._setupPromptBoxResize();
      if (this._data.prompt) {
        this.promptEl.innerHTML = sanitizePromptHtml(this._data.prompt);
        _0x4c81c9(this);
      }
      this._syncPromptInputVisibility(this._data);
      _0x3de390.appendChild(_0xc7a7f3);
      if (isImageFreeAngleOnlyModel(this._data?.model)) {
        const _0x355c17 = {
          model: DEFAULT_IMAGE_NODE_MODEL,
          provider: DEFAULT_IMAGE_NODE_PROVIDER
        };
        this._data = {
          ...this._data,
          ..._0x355c17
        };
        _0x3ca44d.updateNodeData(this.nodeId, _0x355c17);
      }
      attachGenerationNodePromptTools(this, {
        panel: _0x3de390,
        kind: "image",
        getKey: () => this._data?.model,
        getLabel: () => _0x2c0dca(this._data?.model)
      });
      this._modelProviderProfileControl?.remove?.();
      this._modelProviderProfileControl = createModelProviderProfileControl({
        panel: _0x3de390,
        getNodeData: () => _0x4ff423().nodes?.[this.nodeId] || this._data || {},
        onChange: _0x4f229f => _0x3ca44d.updateNodeData(this.nodeId, _0x4f229f)
      });
      const _0x1be7b3 = document.createElement("div");
      _0x1be7b3.className = "prompt-panel-footer";
      this.footerEl = _0x1be7b3;
      const _0x5e080d = normalizeDreaminaImageModel(this._data.model || DEFAULT_IMAGE_NODE_MODEL, this._data?.provider);
      const _0x450cce = resolveCustomAiAppNodeManifest({
        ...this._data,
        model: _0x5e080d
      });
      const _0x238ba2 = isCustomAiAppManifest(_0x450cce);
      const _0x1a06a7 = _0x238ba2;
      const _0x1ab701 = isRhQwenImageEditModel(_0x5e080d);
      const _0x10d3f2 = this._data?.generationParams && typeof this._data.generationParams === "object" && !Array.isArray(this._data.generationParams) ? this._data.generationParams : {};
      const _0x1b5a55 = _0x10d3f2.imageSize;
      const _0xb43aa6 = getNanoBananaSelectionFromModel(_0x5e080d, _0x1b5a55 || "2K", this._data?.provider) || null;
      const _0x2abe21 = this._getUiSchemaRenderNodeData(this._data);
      const _0x399a3d = renderModelUiSchemaControls(_0x5e080d, _0x2abe21, {
        placement: "mode",
        variant: "pillMenu"
      });
      const _0x4ad0cd = renderModelUiSchemaControls(_0x5e080d, _0x2abe21, {
        placement: "resolution",
        variant: "resolutionPill"
      });
      const _0x220b21 = renderModelUiSchemaControls(_0x5e080d, _0x2abe21, {
        placement: "advanced",
        variant: "advancedRow"
      });
      const _0x3a0c82 = renderModelUiSchemaControls(_0x5e080d, _0x2abe21, {
        placement: "instance",
        variant: "instanceToggle"
      });
      const _0x158819 = renderModelUiSchemaControls(_0x5e080d, _0x2abe21, {
        placement: "batch",
        variant: "pillMenu"
      });
      const _0x304b21 = Boolean(_0x220b21.trim());
      _0x1be7b3.innerHTML = "\n          <div class=\"img-model-pills\">\n            <div class=\"img-model-wrap\" style=\"position:relative;\">\n              <button type=\"button\" class=\"img-pill-btn img-model-btn-trigger\">\n                " + renderImageModelTriggerIconHTML({
        model: _0x5e080d,
        provider: this._data?.provider
      }) + "\n                <span class=\"img-model-label\">" + _0x2c0dca(_0x5e080d) + "</span>\n              </button>\n              <span class=\"img-model-menu-lazy-anchor\" data-lazy-model-menu=\"image\"></span>\n            </div>\n            <div class=\"ui-schema-placement ui-schema-mode-slot\" style=\"" + (_0x399a3d ? "" : "display:none;") + "\">\n              " + _0x399a3d + "\n            </div>\n            <div class=\"ui-schema-placement ui-schema-resolution-slot\" style=\"" + (_0x4ad0cd ? "" : "display:none;") + "\">\n              " + _0x4ad0cd + "\n            </div>\n          </div>\n          <div class=\"prompt-actions\">\n            <div class=\"rh-adv-wrap\" style=\"position:relative;" + (_0x304b21 && !_0x238ba2 ? "" : "display:none;") + "\">\n              <button type=\"button\" class=\"img-pill-btn rh-adv-btn\">\n                <span class=\"rh-adv-btn-label\">" + t("aigenImage.controls.advancedSettings") + "</span>\n              </button>\n            </div>\n            <div class=\"ui-schema-placement ui-schema-batch-slot\" style=\"" + (_0x158819 ? "" : "display:none;") + "\">\n              " + _0x158819 + "\n            </div>\n            <div class=\"ui-schema-placement ui-schema-instance-slot\" style=\"" + (_0x3a0c82 ? "" : "display:none;") + "\">\n              " + _0x3a0c82 + "\n            </div>\n            <button type=\"button\" class=\"prompt-submit debug-wrench-btn\" title=\"" + t("aigenImage.controls.debugApiParams") + "\">\n              " + DEBUG_WRENCH_ICON_HTML + "\n            </button>\n            <button type=\"button\" class=\"prompt-submit img-gen-btn\" title=\"" + t("aigenImage.controls.generate") + "\">\n              <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>\n            </button>\n          </div>";
      _0x1be7b3.insertAdjacentHTML("beforeend", "\n            <div class=\"rh-adv-panel" + (_0x1a06a7 && _0x304b21 ? " show " + RH_AI_APP_PERSISTENT_ADVANCED_CLASS : "") + "\">\n              " + _0x220b21 + "\n            </div>\n      ");
      const _0x247ec8 = _0x1be7b3.querySelector(".rh-adv-panel");
      this.rhAdvPanelEl = _0x247ec8;
      this.modelWrap = _0x1be7b3.querySelector(".img-model-wrap");
      this.rhAdvWrap = _0x1be7b3.querySelector(".rh-adv-wrap");
      this.uiSchemaModeSlot = _0x1be7b3.querySelector(".ui-schema-mode-slot");
      this.uiSchemaResolutionSlot = _0x1be7b3.querySelector(".ui-schema-resolution-slot");
      this.uiSchemaInstanceSlot = _0x1be7b3.querySelector(".ui-schema-instance-slot");
      this.uiSchemaBatchSlot = _0x1be7b3.querySelector(".ui-schema-batch-slot");
      this.btnEl = _0x1be7b3.querySelector(".img-gen-btn");
      const _0x569e23 = _0x1be7b3.querySelector(".debug-wrench-btn");
      this._syncImageLocale = () => {
        _0x1be7b3.querySelector(".rh-adv-btn-label")?.replaceChildren(document.createTextNode(t("aigenImage.controls.advancedSettings")));
        _0x569e23?.setAttribute("title", t("aigenImage.controls.debugApiParams"));
        this.btnEl?.setAttribute("title", t("aigenImage.controls.generate"));
        this._syncPromptPlaceholder?.(this._data);
        this._lastRefHTML = "";
        this._renderRefBar?.();
        this._updateSubmitButtonState?.();
      };
      this._unbindImageLocaleChange?.();
      this._unbindImageLocaleChange = onLocaleChange(() => this._syncImageLocale?.());
      this._syncImageLocale();
      this._uiSchemaCleanup?.();
      this._uiSchemaCleanup = bindModelUiSchemaControls(_0x1be7b3, {
        nodeId: this.nodeId,
        nodeData: this._data,
        store: _0x3ca44d,
        buildPatch: (_0x4185b1, _0x58d2d5, _0x58b79a) => {
          if (_0x58d2d5 !== "aspectRatio") {
            return {};
          }
          return this._buildSchemaAspectRatioDisplayPatch(_0x4185b1, _0x58b79a, {
            forceManualDisplaySize: true
          });
        },
        afterCommit: (_0x4b68d4, _0x51005f, _0x57a064, _0x2d9d63 = {}) => {
          if (_0x4b68d4 === "aspectRatio") {
            this._applySchemaAspectRatioResizeAnimation(_0x2d9d63.latest, _0x2d9d63.patch);
          }
        },
        decorateNodeData: _0x33eeb3 => this._getUiSchemaRenderNodeData(_0x33eeb3)
      });
      this._footerControllerCleanup?.();
      this._footerControllerCleanup = bindNodeFooterController(_0x1be7b3);
      this._uiSchemaModel = _0x5e080d;
      this._applyModelParamVisibility();
      _0x569e23?.addEventListener("click", async _0xf81898 => {
        _0xf81898.stopPropagation();
        flushPromptHtmlCommit(this);
        const _0x5bcce2 = await this._buildPayload();
        if (!_0x5bcce2) {
          window.showToast?.(t("aigenImage.debug.missingPayload"), "warn");
          return;
        }
        try {
          const _0x1cb9a1 = await _0x1f857d.buildGenerateImageRequest(_0x5bcce2);
          const _0x3d67e2 = formatFinalApiDebugRequest(_0x1cb9a1);
          const _0x478bf7 = _0x3ca44d.getState();
          const _0x5870b2 = this._data.x + (this._data.width || 380) + 50;
          const _0x20e86d = this._data.y;
          const _0x409e25 = getNodeDefaultSize("debug");
          let _0x47d893 = Object.values(_0x478bf7.nodes).find(_0x5e2fd1 => _0x5e2fd1.type === "debug");
          if (!_0x47d893) {
            _0x3ca44d.addNode({
              id: "debug-" + Date.now(),
              type: "debug",
              x: _0x5870b2,
              y: _0x20e86d,
              ..._0x409e25,
              name: t("aigenImage.debug.nodeName"),
              outputText: _0x3d67e2
            });
          } else {
            _0x3ca44d.updateNodeData(_0x47d893.id, {
              outputText: _0x3d67e2,
              x: _0x5870b2,
              y: _0x20e86d
            });
          }
          window.showToast?.(t("aigenImage.debug.paramsShown"), "warn");
        } catch (_0x1aa5b3) {
          window.showToast?.(t("aigenImage.debug.buildRequestFailed", {
            error: _0x1aa5b3?.message || _0x1aa5b3
          }), "error");
        } finally {
          releasePayloadObjectUrlLease(_0x5bcce2);
        }
      });
      const _0x2d7288 = _0x1be7b3.querySelector(".img-model-btn-trigger");
      let _0x24ce97 = null;
      const _0x3f875e = _0x1be7b3.querySelector(".img-model-label");
      const _0x4915b9 = _0x1be7b3.querySelector(".rh-res-popup");
      const _0x5629f0 = _0x1be7b3.querySelector(".rh-adv-btn");
      const _0x5e179f = () => {
        _0x1be7b3.querySelectorAll(".ui-schema-floating-menu").forEach(_0x1d9b80 => _0x1d9b80.classList.remove("show"));
        _0x1be7b3.querySelectorAll(".ui-schema-popup").forEach(_0x59d309 => {
          _0x59d309.style.display = "none";
        });
      };
      const _0x5b60c8 = () => _0x24ce97 && _0x24ce97.isConnected ? _0x24ce97 : null;
      const _0x25ddaf = ({
        keepModelMenu = false
      } = {}) => {
        if (!keepModelMenu) {
          _0x5b60c8()?.classList.remove("show");
        }
        if (_0x4915b9) {
          _0x4915b9.style.display = "none";
        }
        if (_0x247ec8 && !_0x247ec8.classList.contains(RH_AI_APP_PERSISTENT_ADVANCED_CLASS)) {
          _0x247ec8.classList.remove("show");
        }
      };
      const _0xfe8596 = _0x3f2341 => _0x3f2341 && typeof _0x3f2341 === "object" && !Array.isArray(_0x3f2341) ? {
        ..._0x3f2341
      } : {};
      const _0x42d9d2 = (_0x25b49a, _0x41250, _0x76a3f9, _0x4cbd9b = {}) => {
        const _0x3c5639 = String(_0x25b49a?.model || "").trim();
        const _0x25d06e = String(_0x41250 || "").trim();
        const _0x5e8f4e = _0xfe8596(_0x25b49a?.generationParamsByModel);
        if (_0x3c5639) {
          _0x5e8f4e[_0x3c5639] = _0xfe8596(_0x25b49a?.generationParams);
        }
        const _0x265d16 = Object.prototype.hasOwnProperty.call(_0x4cbd9b, "generationParams");
        const _0x39fc30 = _0x265d16 ? _0xfe8596(_0x4cbd9b.generationParams) : {};
        const _0x123525 = _0x25d06e ? _0x5e8f4e[_0x25d06e] : undefined;
        const _0x45b716 = buildModelUiSchemaDefaultParams(_0x25d06e);
        const _0x5923ba = getModelManifest(_0x25d06e);
        const _0x556b25 = new Set((_0x5923ba?.uiSchema?.fields || []).map(_0x577b4b => String(_0x577b4b?.id || "").trim()));
        const _0x796fc5 = {};
        ["imageSize", "aspectRatio", "mode", "batchSize"].forEach(_0x3767df => {
          if (_0x556b25.has(_0x3767df) && Object.prototype.hasOwnProperty.call(_0x4cbd9b, _0x3767df)) {
            _0x796fc5[_0x3767df] = _0x4cbd9b[_0x3767df];
          }
        });
        const _0x3ac25a = {
          ..._0x45b716,
          ..._0xfe8596(_0x123525),
          ...(_0x265d16 ? _0x39fc30 : {}),
          ..._0x796fc5
        };
        const _0x111514 = sanitizeModelUiSchemaParams(_0x25d06e, Object.fromEntries(Object.entries(_0x3ac25a).filter(([_0x1169d1]) => _0x556b25.has(_0x1169d1))));
        const {
          generationParams: _0x47ab8e,
          ..._0x2d50bb
        } = _0x4cbd9b;
        const _0x289ddf = {
          ..._0x2d50bb
        };
        _0x556b25.forEach(_0x5d5072 => {
          delete _0x289ddf[_0x5d5072];
        });
        const _0x20285b = buildModelProviderProfileSelectionPatch(_0x25b49a, _0x25d06e, _0x4cbd9b?.providerProfileId);
        const _0x432b47 = buildGenerationModelSelectionDisplayPatch({
          store: _0x3ca44d,
          nodeId: this.nodeId,
          nodeData: _0x25b49a,
          fallbackNodeData: this._data,
          modelId: _0x25d06e,
          generationParams: _0x111514,
          minSide: getAIGenerationNodeSize().width,
          getRefKindByNodeType: _0x746cd6,
          resultMediaElement: this.imgEl
        });
        return {
          ..._0x289ddf,
          ..._0x20285b,
          model: _0x25d06e,
          provider: _0x76a3f9,
          generationParams: _0x111514,
          generationParamsByModel: _0x5e8f4e,
          ..._0x432b47
        };
      };
      const _0x16a0f2 = _0x132447 => {
        this._modelCredentialMenuCleanup?.();
        this._modelCredentialMenuCleanup = bindModelCredentialMenu(_0x132447, {
          listenConfigChanges: false,
          getProviderProfileId: () => {
            const _0x1a7190 = (_0x3ca44d.getState?.() || {}).nodes?.[this.nodeId] || this._data || {};
            return _0x1a7190.providerProfileId || _0x1a7190.rhProviderProfileId || "";
          }
        });
        const _0x4c0d32 = ({
          latestNode: _0x43026e,
          patch: _0x50bab9
        } = {}) => this._applySchemaAspectRatioResizeAnimation(_0x43026e, _0x50bab9);
        const _0x35d7f4 = _0x545b44 => ({
          item: _0x28c871,
          latestNode: _0x2f1b01,
          patch: _0x2d2e12
        }) => {
          _0x4c0d32({
            latestNode: _0x2f1b01,
            patch: _0x2d2e12
          });
          setImageModelTriggerIcon(_0x2d7288, _0x545b44, _0x28c871);
        };
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-grsai-toggle]",
          submenuSelector: ".grsai-submenu",
          defaultProvider: "grsai",
          buildModelPatch: _0x42d9d2,
          resolveSelection: resolveGrsaiImageMenuSelection,
          afterSelect: _0x35d7f4("grsai")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-ppio-toggle]",
          submenuSelector: ".ppio-submenu",
          defaultProvider: "ppio",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("ppio")
        });
        bindDreaminaImageMenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x4c0d32
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-openai-cli-image-toggle]",
          submenuSelector: ".openai-cli-image-submenu",
          defaultProvider: "openai-cli",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("openai-cli")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-apimart-toggle]",
          submenuSelector: ".apimart-submenu",
          defaultProvider: "apimart",
          buildModelPatch: _0x42d9d2,
          resolveSelection: resolveApimartImageMenuSelection,
          afterSelect: _0x35d7f4("apimart")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-binghuo-image-toggle]",
          submenuSelector: ".binghuo-image-submenu",
          defaultProvider: "binghuo",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("binghuo")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-agnes-toggle]",
          submenuSelector: ".agnes-submenu",
          defaultProvider: "agnes",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("agnes")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-volcengine-toggle]",
          submenuSelector: ".volcengine-submenu",
          defaultProvider: "volcengine",
          buildModelPatch: _0x42d9d2,
          resolveSelection: resolveVolcengineImageMenuSelection,
          afterSelect: _0x35d7f4("volcengine")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-rh-ai-app-toggle]",
          submenuSelector: ".rh-ai-app-image-submenu",
          defaultProvider: "runninghubwf",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("runninghubwf")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-comfyui-cloud-workflow-toggle]",
          submenuSelector: ".comfyui-cloud-workflow-submenu",
          defaultProvider: "comfyui",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("comfyui")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-comfyui-local-workflow-toggle]",
          submenuSelector: ".comfyui-local-workflow-submenu",
          defaultProvider: "comfyui",
          buildModelPatch: _0x42d9d2,
          afterSelect: _0x35d7f4("comfyui")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-runninghubwf-toggle]",
          submenuSelector: ".runninghubwf-submenu",
          defaultProvider: "runninghubwf",
          buildModelPatch: _0x42d9d2,
          resolveSelection: resolveRunningHubWorkflowImageMenuSelection,
          onDisabled: () => window.showToast?.(t("aigenImage.modelMenu.unavailable", {
            model: t("aigenImage.modelMenu.personReplaceV3.title")
          }), "warn"),
          beforeSelect: ({
            item: _0x34a89d,
            model: _0x529af3,
            provider: _0x3e5090
          }) => {
            const _0x435205 = this._runVipRetryOnce(() => _0x34a89d.click());
            return this._guardVipSelection(_0x529af3, _0x3e5090, _0x435205);
          },
          afterSelect: _0x35d7f4("runninghubwf")
        });
        bindImageModelMenuSubmenu({
          modelMenu: _0x132447,
          modelTrigger: _0x2d7288,
          modelLabel: _0x3f875e,
          nodeId: this.nodeId,
          store: _0x3ca44d,
          fallbackNodeData: this._data,
          toggleSelector: "[data-runninghub-toggle]",
          submenuSelector: ".runninghub-submenu",
          defaultProvider: "runninghub",
          buildModelPatch: _0x42d9d2,
          resolveSelection: resolveRunningHubModelImageMenuSelection,
          afterSelect: ({
            item: _0x220f5c,
            provider: _0xc429b2,
            latestNode: _0x374907,
            patch: _0x2d7d23
          }) => {
            _0x4c0d32({
              latestNode: _0x374907,
              patch: _0x2d7d23
            });
            setImageModelTriggerIcon(_0x2d7288, _0xc429b2, _0x220f5c);
          }
        });
        _0x132447.querySelectorAll("[data-custom-provider-image-group]").forEach(_0x51b46a => {
          const _0x553b81 = _0x51b46a.dataset.nodeMenuSubmenu || "";
          const _0x108c41 = _0x553b81 ? _0x132447.querySelector(_0x553b81) : null;
          const _0x2c1a5e = String(_0x51b46a.dataset.customProviderImageGroup || "");
          bindImageModelMenuSubmenu({
            modelMenu: _0x132447,
            modelTrigger: _0x2d7288,
            modelLabel: _0x3f875e,
            nodeId: this.nodeId,
            store: _0x3ca44d,
            fallbackNodeData: this._data,
            headerEl: _0x51b46a,
            submenuEl: _0x108c41,
            defaultProvider: _0x2c1a5e,
            buildModelPatch: _0x42d9d2,
            afterSelect: ({
              item: _0x5a9510,
              provider: _0x114a7b,
              latestNode: _0x43805e,
              patch: _0x1a636d
            }) => {
              _0x4c0d32({
                latestNode: _0x43805e,
                patch: _0x1a636d
              });
              setImageModelTriggerIcon(_0x2d7288, _0x114a7b, _0x5a9510);
            }
          });
        });
      };
      const _0x2bf18a = () => {
        const _0x1ed978 = _0x5b60c8();
        if (_0x1ed978) {
          return _0x1ed978;
        }
        if (!this.modelWrap) {
          return null;
        }
        const _0x2bfd40 = (_0x3ca44d.getState?.() || {}).nodes?.[this.nodeId] || this._data || {};
        const _0x5a2dad = normalizeDreaminaImageModel(_0x2bfd40.model || DEFAULT_IMAGE_NODE_MODEL, _0x2bfd40.provider);
        const _0x1e98eb = _0x2bfd40?.generationParams && typeof _0x2bfd40.generationParams === "object" && !Array.isArray(_0x2bfd40.generationParams) ? _0x2bfd40.generationParams : {};
        const _0x421aad = getNanoBananaSelectionFromModel(_0x5a2dad, _0x1e98eb.imageSize || "2K", _0x2bfd40?.provider) || null;
        const _0x2fa7a2 = document.createElement("template");
        _0x2fa7a2.innerHTML = buildImageModelMenuHTML({
          activeModel: _0x5a2dad,
          nanoSelection: _0x421aad
        }).trim();
        const _0x106b95 = _0x2fa7a2.content.firstElementChild;
        if (!_0x106b95) {
          return null;
        }
        const _0x56ff81 = this.modelWrap.querySelector("[data-lazy-model-menu='image']");
        if (_0x56ff81) {
          _0x56ff81.replaceWith(_0x106b95);
        } else {
          this.modelWrap.appendChild(_0x106b95);
        }
        _0x24ce97 = _0x106b95;
        _0x16a0f2(_0x106b95);
        return _0x106b95;
      };
      this._refreshModelRegistryUi = () => {
        this._modelCredentialMenuCleanup?.();
        this._modelCredentialMenuCleanup = null;
        _0x5b60c8()?.remove();
        _0x24ce97 = null;
        const _0x45d721 = (_0x3ca44d.getState?.() || {}).nodes?.[this.nodeId] || this._data || {};
        const _0x2424f5 = document.createElement("template");
        _0x2424f5.innerHTML = renderImageModelTriggerIconHTML({
          model: _0x45d721.model || DEFAULT_IMAGE_NODE_MODEL,
          provider: _0x45d721.provider
        }).trim();
        const _0x1eb92b = _0x2424f5.content.firstElementChild;
        const _0xce716 = _0x2d7288?.firstElementChild;
        if (_0x1eb92b && _0xce716) {
          _0xce716.replaceWith(_0x1eb92b);
        }
        if (this.modelWrap && !this.modelWrap.querySelector("[data-lazy-model-menu='image']")) {
          const _0x1daf75 = document.createElement("span");
          _0x1daf75.className = "img-model-menu-lazy-anchor";
          _0x1daf75.dataset.lazyModelMenu = "image";
          this.modelWrap.appendChild(_0x1daf75);
        }
        this._updateSubmitButtonState?.();
        return true;
      };
      _0x2d7288?.addEventListener("click", _0x3783e3 => {
        _0x3783e3.stopPropagation();
        const _0x2fbce1 = _0x2bf18a();
        if (!_0x2fbce1) {
          return;
        }
        const _0x1dbfd0 = !_0x2fbce1.classList.contains("show");
        if (_0x1dbfd0) {
          syncModelCredentialMenu(_0x2fbce1);
        }
        closeNodeFooterMenus(_0x1be7b3, _0x2fbce1);
        _0x25ddaf({
          keepModelMenu: true
        });
        _0x5e179f();
        _0x2fbce1.classList.toggle("show", _0x1dbfd0);
        if (_0x1dbfd0 && typeof _0x3b5997 === "function") {
          _0x3b5997(_0x2fbce1);
        }
      });
      if (_0x5629f0 && _0x247ec8) {
        _0x5629f0.addEventListener("click", _0xdc5e93 => {
          _0xdc5e93.stopPropagation();
          _0x247ec8.classList.toggle("show");
          _0x5b60c8()?.classList.remove("show");
          if (_0x4915b9) {
            _0x4915b9.style.display = "none";
          }
          _0x5e179f();
        });
        _0x247ec8.addEventListener("click", _0x4aed41 => _0x4aed41.stopPropagation());
      }
      this.btnEl.addEventListener("click", () => {
        flushPromptHtmlCommit(this);
        this._handleGenerateOrCancel();
      });
      document.addEventListener("click", () => {
        _0x5b60c8()?.classList.remove("show");
        if (_0x4915b9) {
          _0x4915b9.style.display = "none";
        }
        _0x5e179f();
      });
      _0x1be7b3.appendChild(document.createTextNode(""));
      _0x3de390.appendChild(_0x1be7b3);
      _0x42b54c.appendChild(_0x3de390);
      if (this._rendererMediaDeferred === true) {
        this._renderRefBarPendingWhenVisible = true;
      } else {
        this._renderRefBar();
      }
      this._assetMentionRegistryUnsubscribe?.();
      this._assetMentionRegistryUnsubscribe = subscribeAssetMentionRegistry(() => {
        if (this._assetMentionRegistryRefreshPending) {
          return;
        }
        this._assetMentionRegistryRefreshPending = true;
        queueMicrotask(() => {
          this._assetMentionRegistryRefreshPending = false;
          if (!_0x3ca44d.getState().nodes?.[this.nodeId]) {
            return;
          }
          _0x4c81c9(this);
          if (this._rendererMediaDeferred === true) {
            this._renderRefBarPendingWhenVisible = true;
            return;
          }
          this._renderRefBar();
          this._updateSubmitButtonState();
        });
      });
      const _0x375bee = getImageNodeRootClass(this._data?.model);
      if (_0x375bee) {
        _0x42b54c.classList.add(_0x375bee);
      }
      if (isRhPersonReplaceWorkflowModel(this._data?.model)) {
        _0x42b54c.classList.add("rh-person-replace-v3-node");
      }
      const _0x40f6d6 = _0x42b54c.querySelector(".node-floating-toolbar");
      _0x3f5184(_0x40f6d6, this.nodeId);
      this._qualityBtns = _0x42b54c ? Array.from(_0x42b54c.querySelectorAll(".img-rp-quality-item")) : [];
      const _0x3a7455 = this.refBarEl?.querySelector(".prompt-attachment-btn");
      this._attachBtnIcon = _0x3a7455 ? _0x3a7455.querySelector(".btn-icon") : null;
      if (_0xc899c5) {
        _0xc899c5.addEventListener("pointerdown", _0x16602d => {
          const _0x5c9493 = _0x3ca44d.getStateRaw().ui?.imageVideoNodeResizeEnabled === true;
          const _0x4ee6cf = document.getElementById("v2-wrap")?.classList.contains("v2-media-node-resize-enabled");
          if (!_0x5c9493 || !_0x4ee6cf) {
            return;
          }
          if (_0x16602d.button !== 0) {
            return;
          }
          _0x16602d.preventDefault();
          _0x16602d.stopPropagation();
          startNodeResizePreview({
            event: _0x16602d,
            nodeId: this.nodeId,
            getNode: () => _0x3ca44d.getStateRaw().nodes?.[this.nodeId] || this._data,
            getViewport: () => _0x3ca44d.getStateRaw().viewport,
            resolveSize: ({
              startWidth: _0x301d17,
              startHeight: _0x1ec0b6,
              dx: _0x57b638,
              dy: _0x59a920
            }) => {
              const _0x8370df = _0x301d17 / _0x1ec0b6;
              const _0x57e21e = Math.max(_0x57b638 / _0x301d17, _0x59a920 / _0x1ec0b6);
              const _0x153393 = Math.max(AI_IMAGE_MIN_SIZE / _0x301d17, AI_IMAGE_MIN_SIZE / _0x1ec0b6);
              const _0x1c5dac = Math.max(_0x153393, 1 + _0x57e21e);
              const _0x144044 = Math.max(AI_IMAGE_MIN_SIZE, Math.round(_0x301d17 * _0x1c5dac));
              const _0x47c8e6 = Math.max(AI_IMAGE_MIN_SIZE, Math.round(_0x144044 / _0x8370df));
              return {
                width: _0x144044,
                height: _0x47c8e6
              };
            },
            buildFinalPatch: ({
              startNode: _0x18f4ff,
              startSize: _0x2e958c,
              finalSize: _0x317947
            }) => {
              const _0x152e54 = {};
              if (_0x18f4ff?.needsAutoResize) {
                _0x152e54.needsAutoResize = false;
              }
              const _0x56f673 = Math.round(Number(_0x2e958c?.width) || 0) !== Math.round(Number(_0x317947?.width) || 0) || Math.round(Number(_0x2e958c?.height) || 0) !== Math.round(Number(_0x317947?.height) || 0);
              if (_0x56f673) {
                _0x152e54[GENERATION_MANUAL_DISPLAY_SIZE_FIELD] = true;
              }
              return _0x152e54;
            },
            applyPatch: _0x2653f2 => _0x3ca44d.updateNodeData(this.nodeId, _0x2653f2),
            commit: commit
          });
        });
      }
      this._updateSubmitButtonState();
      if (typeof this._maybeResumeDreaminaTaskImpl === "function") {
        queueMicrotask(() => {
          if (_0x3ca44d.getState().nodes?.[this.nodeId]) {
            this._maybeResumeDreaminaTaskImpl();
          }
        });
      }
      if (typeof this._maybeResumeAsyncTaskImpl === "function") {
        queueMicrotask(() => {
          if (_0x3ca44d.getState().nodes?.[this.nodeId]) {
            this._maybeResumeAsyncTaskImpl();
          }
        });
      }
      if (typeof this._maybeResumeRunningHubTaskImpl === "function") {
        queueMicrotask(() => {
          if (_0x3ca44d.getState().nodes?.[this.nodeId]) {
            this._maybeResumeRunningHubTaskImpl();
          }
        });
      }
      return _0x42b54c;
    }
    hydrateDeferredMedia() {
      if (this._rendererMediaDeferred !== true) {
        return;
      }
      this._rendererMediaDeferred = false;
      this._loadAndDisplayImage({
        force: true
      });
      this._applyMaskPreview(this._data?.maskPreviewUrl || this._data?.maskPreview);
      this._renderRefBarPendingWhenVisible = false;
      this._renderRefBar?.();
    }
    async _switchToFreeAngle() {
      if (!this._promptPanel) {
        return;
      }
      if (_0x98bc0a.active && _0x98bc0a.nodeId === this.nodeId) {
        _0x98bc0a._exit();
        return;
      }
      if (window.v2FocusOnNodeAtZoomPercent) {
        window.v2FocusOnNodeAtZoomPercent(this.nodeId, 60);
      }
      const _0x2d27bc = this._root.querySelector(".act-multiangle");
      await _0x98bc0a.render(this.nodeId, this._promptPanel, () => this._switchToPrompt(), () => this._onGenerate(), _0x2d27bc);
    }
    _switchToPrompt() {
      if (!this._promptPanel) {
        return;
      }
      this._promptPanel.innerHTML = "";
      const _0x1808e3 = this.modelWrap?.closest(".prompt-panel-footer");
      const _0x8e486e = this.promptEl?.closest(".prompt-input-wrapper");
      if (this.refBarEl) {
        this._promptPanel.appendChild(this.refBarEl);
      }
      if (_0x8e486e) {
        this._promptPanel.appendChild(_0x8e486e);
      }
      if (_0x1808e3) {
        this._promptPanel.appendChild(_0x1808e3);
      }
      this._renderRefBar();
      this._generationNodeHelpTip?.sync();
      this._modelProviderProfileControl?.sync();
    }
    _updateSubmitButtonState() {
      if (!this.btnEl) {
        return;
      }
      const _0x4d76e7 = _0x4ff423() || {};
      const _0x493272 = _0x4d76e7?.nodes || {};
      const _0x3a5edc = _0x493272?.[this.nodeId] || this._data || {};
      const _0xa0354e = typeof _0x3ca44d.getIncomingEdges === "function" ? _0x3ca44d.getIncomingEdges(this.nodeId) : [];
      const _0x2ec51d = resolvePromptTextWithTextRefs({
        promptEl: this.promptEl,
        inEdges: _0xa0354e,
        nodes: _0x493272
      });
      const _0xfd9b6a = this._isRunninghubWorkflowModel(_0x3a5edc?.model, _0x3a5edc?.provider);
      const _0xc6fa54 = getImageNodeInputGate(_0x3a5edc?.model);
      const _0x391bd7 = String(_0xc6fa54.kind || "") === "image";
      const _0x9f2a72 = resolveCustomAiAppNodeManifest(_0x3a5edc);
      const _0x536966 = _0x9f2a72 || getModelManifest(_0x3a5edc?.model);
      const _0x37f576 = shouldAllowEmptyCustomAiAppInputs(_0x536966);
      const _0x33c1af = getFixedInputSlotConfigFromManifest(_0x3a5edc, {
        manifest: _0x536966
      });
      const _0x1bde06 = collectSubmitButtonInputRecords({
        latestNode: _0x3a5edc,
        nodes: _0x493272,
        inEdges: _0xa0354e,
        imageInputGate: _0xc6fa54
      });
      const _0x466f7b = countManifestInputRecords(_0x1bde06);
      const _0x54737d = buildFixedSlotOccupancy({
        fixedInputConfig: _0x33c1af,
        inputRecords: _0x1bde06
      });
      const _0x409793 = _0x37f576 ? null : getMissingManifestInputRequirement({
        inputSlots: _0x536966?.inputSlots,
        fixedInputConfig: _0x33c1af,
        inputCounts: _0x466f7b,
        occupiedFixedSlots: _0x54737d
      });
      const _0x5cd184 = Object.values(_0x466f7b).some(_0x2be4d1 => Number(_0x2be4d1) > 0);
      const _0x381dfe = shouldUseImageWorkflowBusyButton(_0x3a5edc?.model);
      const _0x60518 = resolveGenerationButtonMode(_0x3a5edc, {
        cancellable: _0xfd9b6a,
        cancelInFlight: this._rhCancelInFlight === true
      });
      if (_0x60518.busy) {
        if (_0xfd9b6a) {
          setGenerateButtonCancellableUi(this.btnEl, {
            title: t("aigenImage.controls.cancelTaskTooltip"),
            tooltip: t("aigenImage.controls.cancelTaskTooltip"),
            ariaLabel: t("aigenImage.controls.cancelGenerate"),
            busy: _0x381dfe
          });
        } else {
          setGenerateButtonLoadingUi(this.btnEl, {
            title: t("aigenImage.controls.generate"),
            disabled: true,
            ariaLabel: t("aigenImage.controls.generate")
          });
        }
        this.btnEl.disabled = _0x60518.disabled;
        this.btnEl.style.cursor = _0x60518.cursor;
        return;
      }
      resetGenerateButtonIdleUi(this.btnEl, t("aigenImage.controls.generate"));
      resetModelCredentialButtonState(this.btnEl);
      const _0x3b78f8 = () => applyModelCredentialButtonState(this.btnEl, {
        modelId: _0x3a5edc?.model,
        provider: _0x3a5edc?.provider,
        providerProfileId: _0x3a5edc?.providerProfileId || _0x3a5edc?.rhProviderProfileId
      });
      if (_0xfd9b6a) {
        if (_0x409793) {
          this.btnEl.disabled = true;
          this.btnEl.style.cursor = "var(--unavailable-cursor)";
          return;
        }
        if (_0x391bd7) {
          const _0xae49b3 = !!getImageInputGateUploadedUrl(_0x3a5edc, _0xc6fa54);
          const _0xf22dd2 = _0xa0354e.some(_0x585bd0 => _0x746cd6(_0x493272[_0x585bd0.sourceId]?.type || "") === "image");
          const _0x5b25f8 = _0xae49b3 || _0xf22dd2;
          this.btnEl.disabled = !_0x5b25f8;
          this.btnEl.style.cursor = _0x5b25f8 ? "" : "var(--unavailable-cursor)";
          if (_0x5b25f8) {
            _0x3b78f8();
          }
          return;
        }
        this.btnEl.disabled = false;
        this.btnEl.style.cursor = "";
        _0x3b78f8();
        return;
      }
      const _0x285e9c = evaluateGenerationPromptBoundary({
        model: _0x3a5edc?.model,
        provider: _0x3a5edc?.provider,
        promptText: _0x2ec51d,
        hasInput: _0x5cd184
      });
      this.btnEl.disabled = !_0x285e9c.ok;
      this.btnEl.style.cursor = _0x285e9c.ok ? "" : "var(--unavailable-cursor)";
      if (_0x285e9c.ok) {
        _0x3b78f8();
      }
    }
    _hydrateStoredThumbsInBackground(_0xa9e2fb, _0xc7ab2e) {
      return hydrateStoredImageThumbsInBackground(this, _0xa9e2fb, _0xc7ab2e, _0x460823);
    }
    async _loadAndDisplayImage(_0x3acfa1 = {}) {
      if (this._rendererMediaDeferred === true && _0x3acfa1?.force !== true) {
        return;
      }
      const _0x90b818 = (Number(this._imageDisplayLoadToken) || 0) + 1;
      this._imageDisplayLoadToken = _0x90b818;
      const _0x5ab67c = () => this._imageDisplayLoadToken !== _0x90b818;
      const _0x2da21d = _0x3acfa1?.force === true;
      const _0x27f3f0 = this._data.images || [];
      if (_0x27f3f0.length === 0 && (this._data.imageUrl || this._data.localPath || this._data.thumbUrl || this._data.thumbId)) {
        _0x27f3f0.push({
          imageUrl: this._data.imageUrl,
          sourceUrl: this._data.sourceUrl,
          thumbUrl: this._data.thumbUrl,
          sourceId: this._data.sourceId,
          thumbId: this._data.thumbId,
          localPath: this._data.localPath,
          originalLocalPath: this._data.originalLocalPath,
          displayLocalPath: this._data.displayLocalPath,
          thumbLocalPath: this._data.thumbLocalPath
        });
      }
      const _0x181635 = String(this._data.rhStatusMessage || "").trim() || (String(this._data.jobStatus || "").toLowerCase() === "error" ? getTaskMessage(this._data) : "");
      const _0x1dbad0 = this._data.rhStatusCode;
      if (_0x181635 && _0x27f3f0.length === 0) {
        this.imgEl.style.display = "none";
        delete this.imgEl.dataset.lodSrc;
        clearCanvasImageDisplayHandoff(this.imgEl);
        this.imgEl.src = "";
        if (this._placeholderEl) {
          this._placeholderEl.style.display = "none";
        }
        if (this._multiImagesContainer) {
          this._multiImagesContainer.querySelectorAll?.("img").forEach(_0x2c9827 => clearCanvasImageDisplayHandoff(_0x2c9827));
          this._multiImagesContainer.remove();
          this._multiImagesContainer = null;
        }
        this._flushPendingImageObjectUrlReleases();
        clearMultiResultStackClasses({
          previewEl: this.previewEl,
          stackWrap: this._multiStackWrap
        });
        this._multiStackWrap = null;
        this._multiBackdropWrap = null;
        this._multiBackplateKeyStr = "";
        if (!this._statusOverlayEl) {
          this._statusOverlayEl = document.createElement("div");
          Object.assign(this._statusOverlayEl.style, {
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          });
          this.previewEl.appendChild(this._statusOverlayEl);
        }
        this._statusOverlayEl.innerHTML = "";
        this._statusOverlayEl.appendChild(this._createStatusCard(_0x181635, _0x1dbad0));
        return;
      }
      if (this._statusOverlayEl) {
        this._statusOverlayEl.remove();
        this._statusOverlayEl = null;
      }
      const _0x2ca4bf = this._data.isImagesExpanded || false;
      let _0x5e1ca3 = this._data.mainImageIndex || 0;
      if (_0x5e1ca3 >= _0x27f3f0.length) {
        _0x5e1ca3 = 0;
      }
      const _0x4bed9d = buildMultiResultBackplateItems({
        imageCount: _0x27f3f0.length,
        mainIndex: _0x5e1ca3
      });
      const _0x4dbb90 = _0x27f3f0.map((_0x2c74ab, _0x21b6e8) => buildCanvasImageResultIdentityKey(_0x2c74ab, this._data, _0x21b6e8)).join(",");
      const _0x3f9672 = _0x27f3f0.map((_0x212a40, _0x14cce9) => buildCanvasImageResultIdentityKey(_0x212a40, this._data, _0x14cce9));
      const _0x42acb7 = _0x4dbb90 !== this._lastImagesKeyStr;
      const _0x8a5495 = _0x5e1ca3 !== this._lastMainIdx;
      const _0x24d2b7 = _0x2ca4bf !== this._lastIsExpanded;
      const _0x5ed9fd = this._shouldUseLowZoomThumbnail() ? "thumb" : "full";
      const _0x19e0a3 = _0x5ed9fd !== this._lastImageLodMode;
      const _0x2eec67 = shouldRefreshMultiResultStackDom({
        imageCount: _0x27f3f0.length,
        previewEl: this.previewEl,
        containerEl: this._multiImagesContainer,
        stackWrap: this._multiStackWrap,
        backdropWrap: this._multiBackdropWrap,
        backplateItems: _0x4bed9d
      });
      if (!_0x2da21d && !_0x42acb7 && !_0x8a5495 && !_0x24d2b7 && !_0x19e0a3 && !_0x2eec67) {
        return;
      }
      this._lastImagesKeyStr = _0x4dbb90;
      this._lastMainIdx = _0x5e1ca3;
      this._lastIsExpanded = _0x2ca4bf;
      this._lastImageLodMode = _0x5ed9fd;
      if (this._currentSourceId !== this._data.sourceId || this._currentLocalPath !== pickCanvasImageLocalPath(this._data)) {
        if (this._cachedSourceUrl && this._cachedSourceUrl.startsWith("blob:")) {
          this._queueImageObjectUrlRelease(this._cachedSourceUrl);
        }
        this._cachedSourceUrl = null;
        this._currentSourceId = this._data.sourceId;
        this._currentLocalPath = pickCanvasImageLocalPath(this._data);
      }
      if (_0x27f3f0.length === 0) {
        this.imgEl.style.display = "none";
        delete this.imgEl.dataset.lodSrc;
        clearCanvasImageDisplayHandoff(this.imgEl);
        this.imgEl.src = "";
        if (this._placeholderEl) {
          this._placeholderEl.style.display = "flex";
        }
        if (this._multiImagesContainer) {
          this._multiImagesContainer.querySelectorAll?.("img").forEach(_0x4b792b => clearCanvasImageDisplayHandoff(_0x4b792b));
          this._multiImagesContainer.remove();
          this._multiImagesContainer = null;
        }
        this._flushPendingImageObjectUrlReleases();
        clearMultiResultStackClasses({
          previewEl: this.previewEl,
          stackWrap: this._multiStackWrap
        });
        this._multiStackWrap = null;
        this._multiBackdropWrap = null;
        this._multiBackplateKeyStr = "";
        return;
      }
      if (_0x4dbb90 !== this._resolvedUrlsKey || !this._resolvedMainUrls || !this._resolvedAuxUrls) {
        const _0x2ba341 = new Set(_0x27f3f0.map(_0x4e6914 => _0x4e6914.thumbId).filter(Boolean));
        for (const [_0x264378, _0x81e352] of this._thumbObjectUrls.entries()) {
          if (!_0x2ba341.has(_0x264378)) {
            if (_0x81e352 && String(_0x81e352).startsWith("blob:")) {
              this._queueImageObjectUrlRelease(_0x81e352);
            }
            this._thumbObjectUrls.delete(_0x264378);
          }
        }
        const _0x10eabb = [];
        const _0x15c1eb = [];
        const _0x267151 = [];
        for (const _0x145365 of _0x27f3f0) {
          const _0x17a1ae = toLocalPathUrl(pickCanvasImageLocalPath(_0x145365));
          const _0x24e42b = toLocalPathUrl(pickCanvasThumbLocalPath(_0x145365));
          const _0x58fb65 = /^(?:https?:)?\/\//i.test(String(_0x145365.remoteFallbackUrl || "").trim()) ? String(_0x145365.remoteFallbackUrl || "").trim() : "";
          const _0x4693bf = String(_0x145365.imageUrl || _0x145365.sourceUrl || _0x145365.thumbUrl || "").trim();
          const _0x239d15 = _0x145365.thumbId ? this._thumbObjectUrls.get(_0x145365.thumbId) || "" : "";
          const _0x43f7cf = _0x17a1ae || _0x58fb65 || _0x4693bf || _0x239d15;
          const _0x593c6c = _0x24e42b || _0x43f7cf || _0x58fb65 || _0x4693bf || _0x239d15;
          if (_0x145365.thumbId && !_0x239d15) {
            _0x267151.push(_0x145365.thumbId);
          }
          _0x10eabb.push(_0x43f7cf);
          _0x15c1eb.push(_0x593c6c);
        }
        if (_0x5ab67c()) {
          return;
        }
        this._resolvedUrlsKey = _0x4dbb90;
        this._resolvedMainUrls = _0x10eabb;
        this._resolvedAuxUrls = _0x15c1eb;
        this._hydrateStoredThumbsInBackground(_0x267151, _0x4dbb90);
      }
      const _0x4a392e = this._resolvedMainUrls || [];
      const _0x4951a5 = this._resolvedAuxUrls || _0x4a392e;
      if (this._placeholderEl) {
        const _0x1f09bc = [..._0x4a392e, ..._0x4951a5].some(Boolean);
        const _0x51197b = _0x27f3f0.some(_0x1c914d => Boolean(_0x1c914d?.error));
        this._placeholderEl.style.display = _0x1f09bc || _0x51197b ? "none" : "flex";
      }
      if (_0x27f3f0.length === 1) {
        if (this._multiImagesContainer) {
          this._multiImagesContainer.querySelectorAll?.("img").forEach(_0x39be54 => clearCanvasImageDisplayHandoff(_0x39be54));
          this._multiImagesContainer.remove();
          this._multiImagesContainer = null;
          this._flushPendingImageObjectUrlReleases();
        }
        clearMultiResultStackClasses({
          previewEl: this.previewEl,
          stackWrap: this._multiStackWrap
        });
        this._multiStackWrap = null;
        this._multiBackdropWrap = null;
        this._multiBackplateKeyStr = "";
        const _0xb15dfb = _0x27f3f0[0];
        if (_0xb15dfb.error) {
          this.imgEl.style.display = "none";
          delete this.imgEl.dataset.lodSrc;
          clearCanvasImageDisplayHandoff(this.imgEl);
          this.imgEl.src = "";
          this._flushPendingImageObjectUrlReleases();
          this._multiImagesContainer = document.createElement("div");
          Object.assign(this._multiImagesContainer.style, {
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          });
          this._multiImagesContainer.appendChild(this._createErrorCard(_0xb15dfb.error));
          this.previewEl.appendChild(this._multiImagesContainer);
        } else {
          const _0x21d6e9 = this._pickImageDisplayUrl(_0x4a392e[0], _0x4951a5[0], {
            lowZoomThumbnail: true
          });
          const _0x36765d = this._pickImageDisplayUrl(_0x4a392e[0], _0x4951a5[0]);
          this._setImageElementDisplaySource(this.imgEl, _0x36765d, {
            versionKey: _0x3f9672[0],
            previewLod: _0x21d6e9
          });
        }
        return;
      }
      this.imgEl.style.display = "none";
      this._root?.style.setProperty("overflow", "visible");
      const _0x4bc7b3 = this._pickImageDisplayUrl(_0x4a392e[_0x5e1ca3], _0x4951a5[_0x5e1ca3]);
      this._setImageElementDisplaySource(this.imgEl, _0x4bc7b3, {
        display: false,
        versionKey: _0x3f9672[_0x5e1ca3]
      });
      if (!this._multiImagesContainer) {
        this._multiImagesContainer = document.createElement("div");
        this._multiImagesContainer.className = "multi-images-container";
        this._multiImagesContainer.style.width = "100%";
        this._multiImagesContainer.style.height = "100%";
        this._multiImagesContainer.style.position = "absolute";
        this._multiImagesContainer.style.top = "0";
        this._multiImagesContainer.style.left = "0";
        this.previewEl.appendChild(this._multiImagesContainer);
      }
      this._multiImagesContainer.style.width = "100%";
      this._multiImagesContainer.style.height = "100%";
      this._multiImagesContainer.style.display = "block";
      const _0xcdf252 = _0x27f3f0.length;
      const _0x1560be = AIGEN_IMAGE_MULTI_STACK_MOTION_DURATION_MS;
      let _0x39e663 = () => {};
      const _0x15e656 = getMultiResultBackplateKey(_0x4bed9d);
      const _0x1fabde = getMultiResultBackplateIdentityKey(_0x4bed9d);
      const _0xb2336e = this._data.width || this._root.clientWidth || 320;
      const _0x671b61 = this._data.height || this._root.clientHeight || Math.round(_0xb2336e * 9 / 16);
      const _0xfc52ea = (_0x6d79f9, _0x406048 = {}) => {
        const _0x24b009 = _0x406048?.immediateDisplayLod;
        for (let _0x510546 = 0; _0x510546 < _0xcdf252; _0x510546 += 1) {
          const _0xa05fc6 = _0x510546 === _0x6d79f9;
          const _0x11f72c = this._multiLayerEls[_0x510546];
          const _0x27f62e = this._multiErrorEls[_0x510546];
          if (_0x11f72c) {
            if (_0xa05fc6) {
              if (_0x24b009?.url) {
                this._setImageElementDisplaySource(_0x11f72c, _0x24b009, {
                  display: true,
                  versionKey: _0x3f9672[_0x510546]
                });
              }
              this._loadLazyImageDisplaySource(_0x11f72c);
            } else {
              this._scheduleClearLazyImageDisplaySource(_0x11f72c, AIGEN_IMAGE_HIDDEN_SOURCE_CLEAR_DELAY_MS);
            }
            _0x11f72c.style.display = _0xa05fc6 ? "block" : "none";
            _0x11f72c.style.pointerEvents = _0xa05fc6 ? "" : "none";
            if (_0xa05fc6) {
              _0x11f72c.style.transform = "rotate(0deg) scale(1)";
              _0x11f72c.style.opacity = "1";
              _0x11f72c.style.zIndex = _0xcdf252 + 1;
              _0x11f72c.style.boxShadow = "0 4px 12px var(--black-40)";
            }
          }
          if (_0x27f62e) {
            _0x27f62e.style.display = _0xa05fc6 ? "flex" : "none";
            _0x27f62e.style.zIndex = _0xa05fc6 ? _0xcdf252 + 1 : _0x510546;
          }
        }
        this._lastMainIdx = _0x6d79f9;
      };
      const _0x104d84 = _0xff7368 => {
        if (!_0xff7368?._multiBackplateMediaHideTimer) {
          return;
        }
        clearTimeout(_0xff7368._multiBackplateMediaHideTimer);
        _0xff7368._multiBackplateMediaHideTimer = null;
      };
      const _0x475e2a = (_0x55cb84, _0x352c81 = {}) => {
        if (!_0x55cb84) {
          return false;
        }
        const _0x28bf65 = Number(_0x55cb84.consumedImageIndex);
        const _0x16910e = Number(_0x55cb84.replacementImageIndex);
        if (!Number.isFinite(_0x28bf65) || !Number.isFinite(_0x16910e)) {
          return false;
        }
        const _0x417ad6 = this._multiBackplateEls?.[_0x28bf65];
        if (!_0x417ad6) {
          return false;
        }
        if (_0x417ad6._multiBackplateRetargetMediaTimer) {
          clearTimeout(_0x417ad6._multiBackplateRetargetMediaTimer);
          _0x417ad6._multiBackplateRetargetMediaTimer = null;
        }
        this._multiBackplateEls[_0x28bf65] = null;
        this._multiBackplateEls[_0x16910e] = _0x417ad6;
        _0x417ad6.dataset.imageIndex = String(_0x16910e);
        const _0x1e736a = () => {
          const _0x79b8c5 = _0x27f3f0[_0x16910e];
          const _0x162efb = _0x417ad6.querySelector(".multi-stack-backplate-media");
          if (_0x79b8c5?.error) {
            if (_0x162efb) {
              _0x104d84(_0x162efb);
              this._clearLazyImageDisplaySource(_0x162efb);
              _0x162efb.remove?.();
            }
            return;
          }
          const _0x15d283 = this._pickImageDisplayUrl(_0x4a392e[_0x16910e], _0x4951a5[_0x16910e], {
            lowZoomThumbnail: false
          });
          const _0x157ec2 = _0x162efb || (() => {
            const _0xe528ec = document.createElement("img");
            _0xe528ec.className = "multi-stack-backplate-media";
            _0xe528ec.decoding = "async";
            _0xe528ec.draggable = false;
            _0xe528ec.addEventListener("dragstart", _0x41353c => _0x41353c.preventDefault());
            _0x417ad6.appendChild(_0xe528ec);
            return _0xe528ec;
          })();
          _0x104d84(_0x157ec2);
          this._setLazyImageDisplaySource(_0x157ec2, _0x15d283, {
            versionKey: _0x3f9672[_0x16910e]
          });
          this._clearLazyImageDisplaySource(_0x157ec2);
          _0x157ec2.style.opacity = "0";
          _0x157ec2.style.transform = "scale(1.02)";
        };
        const _0x51a327 = Math.max(0, Number(_0x352c81?.deferMediaSwitchMs) || 0);
        if (_0x51a327 > 0 && _0x417ad6.classList?.contains("is-expanded-card")) {
          _0x417ad6._multiBackplateRetargetMediaTimer = setTimeout(() => {
            _0x417ad6._multiBackplateRetargetMediaTimer = null;
            _0x1e736a();
          }, _0x51a327);
          return true;
        }
        _0x1e736a();
        return true;
      };
      const _0x1faee6 = _0x5743a3 => {
        const _0x17bf89 = _0x3ca44d.getState().nodes[this.nodeId];
        const _0x4acb43 = _0x17bf89.images || [];
        if (_0x4acb43.length === 0) {
          return;
        }
        const _0x58b183 = _0x4acb43[_0x5743a3] ? _0x5743a3 : 0;
        const _0x3d0a99 = _0x4acb43[_0x58b183] || _0x4acb43[0];
        const _0xf84a20 = this._multiBackplateEls?.[_0x58b183];
        const _0x213a14 = _0xf84a20?.querySelector(".multi-stack-backplate-media");
        const _0x22b158 = _0x213a14 ? {
          url: _0x213a14.currentSrc || _0x213a14.src || _0x213a14.dataset?.lazySrc || "",
          lod: _0x213a14.dataset?.lazyLodSrc || "full"
        } : null;
        const _0x8fc2c2 = resolveMultiResultMainSwap({
          imageCount: _0x4acb43.length,
          previousMainIndex: _0x5e1ca3,
          nextMainIndex: _0x58b183
        });
        _0xfc52ea(_0x58b183, {
          immediateDisplayLod: _0x22b158
        });
        if (_0x475e2a(_0x8fc2c2, {
          deferMediaSwitchMs: _0x1560be + AIGEN_IMAGE_BACKPLATE_MEDIA_HIDE_CLEAR_DELAY_MS + 40
        })) {
          const _0x5b4cc1 = buildMultiResultBackplateItems({
            imageCount: _0x4acb43.length,
            mainIndex: _0x58b183
          });
          this._multiBackplateKeyStr = getMultiResultBackplateKey(_0x5b4cc1);
        }
        syncMultiResultStackClasses({
          previewEl: this.previewEl,
          stackWrap: this._multiStackWrap,
          isActive: _0xcdf252 > 1,
          isExpanded: false
        });
        _0x1b3383(this._multiToggleBtn, false);
        _0x39e663(false);
        setTimeout(() => {
          _0x3ca44d.updateNodeData(this.nodeId, {
            mainImageIndex: _0x58b183,
            isImagesExpanded: false,
            imageUrl: _0x3d0a99.imageUrl,
            sourceUrl: _0x3d0a99.sourceUrl,
            thumbUrl: _0x3d0a99.thumbUrl,
            sourceId: _0x3d0a99.sourceId,
            thumbId: _0x3d0a99.thumbId,
            ...buildImageNodeStorageFields(_0x3d0a99)
          });
        }, _0x1560be);
      };
      const _0x1b3383 = (_0x122b78, _0x4ee1c9) => {
        if (!_0x122b78) {
          return;
        }
        const _0x25aeb3 = {
          bg: "var(--black-45)",
          color: "var(--white-90)",
          border: "1px solid var(--white-15)"
        };
        const _0x1792e3 = {
          bg: "var(--black-70)",
          color: "var(--white-80)",
          border: "1px solid transparent"
        };
        const _0x4cb354 = _0x4ee1c9 ? _0x1792e3 : _0x25aeb3;
        _0x122b78.innerHTML = _0x4ee1c9 ? "<span>" + t("aigenImage.result.imageCount", {
          count: _0xcdf252
        }) + "</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>" : "<span>" + t("aigenImage.result.imageCount", {
          count: _0xcdf252
        }) + "</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
        _0x122b78.style.background = _0x4cb354.bg;
        _0x122b78.style.color = _0x4cb354.color;
        _0x122b78.style.border = _0x4cb354.border;
      };
      const _0x46b53f = getMultiResultBackplateCount(_0xcdf252);
      const _0x33f1f5 = this._multiStackWrap?.parentNode === this._multiImagesContainer;
      const _0x5663e8 = Number(this._multiBackdropWrap?.children?.length) || 0;
      const _0x56a6d5 = getMultiResultBackplateDomIdentityKey(this._multiBackdropWrap);
      const _0x25a8a0 = _0x42acb7 || _0x8a5495 || !_0x33f1f5 || _0x5663e8 !== _0x46b53f || _0x56a6d5 !== _0x1fabde || this._multiBackplateKeyStr !== _0x15e656;
      if (_0x25a8a0) {
        this._multiImagesContainer.querySelectorAll?.("img").forEach(_0x7acd10 => clearCanvasImageDisplayHandoff(_0x7acd10));
        this._multiImagesContainer.innerHTML = "";
        this._flushPendingImageObjectUrlReleases();
        this._multiLayerEls = [];
        this._multiErrorEls = [];
        this._multiBackplateEls = [];
        this._multiToggleBtn = null;
        this._multiBackdropWrap = null;
        this._multiStackCardsLaidOut = false;
        this._multiStackWrap = document.createElement("div");
        this._multiStackWrap.className = MULTI_RESULT_STACK_WRAP_CLASS;
        Object.assign(this._multiStackWrap.style, {
          position: "relative",
          width: "100%",
          height: "100%"
        });
        this._multiBackdropWrap = createMultiResultBackplates(document, _0xcdf252, {
          items: _0x4bed9d
        });
        if (this._multiBackdropWrap) {
          this._multiStackWrap.appendChild(this._multiBackdropWrap);
          this._multiBackdropWrap.querySelectorAll("." + MULTI_RESULT_BACKPLATE_CLASS).forEach(_0x3c2120 => {
            const _0x1e2a64 = Number(_0x3c2120.dataset?.imageIndex);
            if (!Number.isFinite(_0x1e2a64)) {
              return;
            }
            this._multiBackplateEls[_0x1e2a64] = _0x3c2120;
            const _0x939ffb = this._pickImageDisplayUrl(_0x4a392e[_0x1e2a64], _0x4951a5[_0x1e2a64], {
              lowZoomThumbnail: false
            });
            const _0x1b7395 = _0x27f3f0[_0x1e2a64];
            if (!_0x1b7395?.error) {
              const _0x2e6b63 = document.createElement("img");
              _0x2e6b63.className = "multi-stack-backplate-media";
              this._setLazyImageDisplaySource(_0x2e6b63, _0x939ffb, {
                versionKey: _0x3f9672[_0x1e2a64]
              });
              _0x2e6b63.decoding = "async";
              _0x2e6b63.draggable = false;
              _0x2e6b63.addEventListener("dragstart", _0x349c19 => _0x349c19.preventDefault());
              _0x3c2120.appendChild(_0x2e6b63);
            }
            const _0x523e2c = this._bindResultImageDragOut(_0x3c2120, {
              imageIndex: _0x1e2a64,
              getImageIndex: () => Number(_0x3c2120.dataset?.imageIndex),
              getGhostSourceElement: () => _0x3c2120.querySelector("img") || _0x3c2120,
              getFallbackSrc: () => {
                const _0x245bf5 = Number(_0x3c2120.dataset?.imageIndex);
                const _0x1e6cdf = this._pickImageDisplayUrl(_0x4a392e[_0x245bf5], _0x4951a5[_0x245bf5], {
                  lowZoomThumbnail: false
                });
                return _0x3c2120.querySelector("img")?.currentSrc || _0x3c2120.querySelector("img")?.src || _0x1e6cdf.url || "";
              },
              getFallbackSize: () => ({
                width: this.previewEl?.offsetWidth || this._data?.width || 320,
                height: this.previewEl?.offsetHeight || this._data?.height || 320
              })
            });
            _0x3c2120.addEventListener("pointerdown", _0x4881b7 => {
              const _0x19c738 = _0x3ca44d.getState().nodes[this.nodeId];
              if (_0x19c738?.isImagesExpanded) {
                _0x4881b7.stopPropagation();
              }
            });
            _0x3c2120.addEventListener("click", _0x59e3d9 => {
              if (_0x523e2c()) {
                _0x59e3d9.preventDefault();
                _0x59e3d9.stopPropagation();
                return;
              }
              const _0x47ad40 = _0x3ca44d.getState().nodes[this.nodeId];
              if (!_0x47ad40?.isImagesExpanded) {
                return;
              }
              _0x59e3d9.stopPropagation();
              const _0x454215 = Number(_0x3c2120.dataset?.imageIndex);
              _0x1faee6(_0x454215);
            });
          });
        }
        this._multiBackplateKeyStr = _0x15e656;
        for (let _0x287ce9 = _0xcdf252 - 1; _0x287ce9 >= 0; _0x287ce9--) {
          const _0x5098df = document.createElement("img");
          const _0x816ca5 = this._pickImageDisplayUrl(_0x4a392e[_0x287ce9], _0x4951a5[_0x287ce9]);
          this._setLazyImageDisplaySource(_0x5098df, _0x816ca5, {
            versionKey: _0x3f9672[_0x287ce9],
            previewLod: this._pickImageDisplayUrl(_0x4a392e[_0x287ce9], _0x4951a5[_0x287ce9], {
              lowZoomThumbnail: true
            })
          });
          this._applyImageElementLod(_0x5098df, _0x816ca5.lod);
          _0x5098df.decoding = "async";
          _0x5098df.draggable = false;
          _0x5098df.addEventListener("dragstart", _0x67a80b => _0x67a80b.preventDefault());
          _0x5098df.style.position = "absolute";
          _0x5098df.style.top = "0";
          _0x5098df.style.left = "0";
          _0x5098df.style.width = "100%";
          _0x5098df.style.height = "100%";
          _0x5098df.style.objectFit = "contain";
          _0x5098df.style.borderRadius = "18px";
          _0x5098df.style.transition = "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)";
          _0x5098df.style.transformOrigin = "top left";
          _0x5098df.classList.add("v2-media-preview");
          const _0x5641df = this._bindResultImageDragOut(_0x5098df, {
            imageIndex: _0x287ce9,
            isEnabled: _0x488a85 => shouldEnableMultiResultLayerDragOut({
              isImagesExpanded: _0x488a85?.isImagesExpanded,
              imageCount: _0x488a85?.images?.length,
              imageIndex: _0x287ce9,
              mainImageIndex: _0x488a85?.mainImageIndex
            }),
            getGhostSourceElement: () => _0x5098df,
            getFallbackSrc: () => _0x5098df.currentSrc || _0x5098df.src || "",
            getFallbackSize: () => ({
              width: this.previewEl?.offsetWidth || this._data?.width || 320,
              height: this.previewEl?.offsetHeight || this._data?.height || 320
            })
          });
          _0x5098df.addEventListener("click", _0x36e3ae => {
            if (_0x5641df()) {
              _0x36e3ae.preventDefault();
              _0x36e3ae.stopPropagation();
              return;
            }
            const _0x4f29a2 = _0x3ca44d.getState().nodes[this.nodeId];
            if (_0x4f29a2.isImagesExpanded) {
              _0x36e3ae.stopPropagation();
              _0x1faee6(this._lastMainIdx || 0);
            }
          });
          _0x5098df.addEventListener("dblclick", async _0x1088be => {
            _0x1088be.stopPropagation();
            const _0x3554e2 = this._lastMainIdx || 0;
            const _0x17cc6a = _0x3ca44d.getState().nodes[this.nodeId];
            const _0x3aca95 = _0x17cc6a.images || [];
            const _0x24fda8 = _0x3aca95[_0x3554e2] || _0x3aca95[0];
            await _0xd1f0e2(_0x24fda8, {
              currentSrc: _0x5098df.currentSrc || _0x5098df.src || ""
            });
          });
          if (_0x27f3f0[_0x287ce9].error) {
            const _0x529fb1 = this._createErrorCard(_0x27f3f0[_0x287ce9].error);
            _0x529fb1.style.position = "absolute";
            _0x529fb1.style.inset = "0";
            this._multiErrorEls[_0x287ce9] = _0x529fb1;
            this._multiStackWrap.appendChild(_0x529fb1);
          } else {
            this._multiLayerEls[_0x287ce9] = _0x5098df;
            this._multiStackWrap.appendChild(_0x5098df);
          }
        }
        this._multiToggleBtn = document.createElement("div");
        this._multiToggleBtn.className = "multi-toggle-btn";
        Object.assign(this._multiToggleBtn.style, {
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 1005,
          padding: "6px 12px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "15px",
          fontWeight: "500",
          backdropFilter: "blur(4px)",
          transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)"
        });
        this._multiToggleBtn.addEventListener("pointerdown", _0x1c322f => {
          if (_0x1c322f.button !== 0) {
            return;
          }
          _0x1c322f.preventDefault();
          _0x1c322f.stopPropagation();
          const _0x5e1b0d = _0x3ca44d.getState().nodes[this.nodeId];
          const _0x5ad1e8 = !!_0x5e1b0d.isImagesExpanded;
          if (_0x5ad1e8) {
            _0x1faee6(_0x5e1b0d.mainImageIndex ?? this._lastMainIdx ?? 0);
          } else {
            this._removeCurrentNodeFromSelection();
            _0x3ca44d.updateNodeData(this.nodeId, {
              isImagesExpanded: true
            });
          }
        });
        this._multiToggleBtn.addEventListener("mouseenter", () => _0x1b3383(this._multiToggleBtn, true));
        this._multiToggleBtn.addEventListener("mouseleave", () => {
          const _0x60568f = _0x3ca44d.getState().nodes[this.nodeId];
          _0x1b3383(this._multiToggleBtn, !!_0x60568f.isImagesExpanded);
        });
        this._multiToggleBtn.addEventListener("click", _0x14aff1 => {
          _0x14aff1.preventDefault();
          _0x14aff1.stopPropagation();
        });
        this._multiStackWrap.appendChild(this._multiToggleBtn);
        this._multiImagesContainer.appendChild(this._multiStackWrap);
      }
      syncMultiResultStackClasses({
        previewEl: this.previewEl,
        stackWrap: this._multiStackWrap,
        isActive: _0xcdf252 > 1,
        isExpanded: _0x2ca4bf
      });
      _0x1b3383(this._multiToggleBtn, _0x2ca4bf);
      for (let _0x1eee43 = 0; _0x1eee43 < _0xcdf252; _0x1eee43++) {
        const _0x3c9eb6 = _0x1eee43 === _0x5e1ca3;
        const _0x4e6f81 = this._multiLayerEls[_0x1eee43];
        const _0x1e4ee7 = this._multiErrorEls[_0x1eee43];
        if (_0x4e6f81) {
          const _0x186c06 = this._pickImageDisplayUrl(_0x4a392e[_0x1eee43], _0x4951a5[_0x1eee43]);
          this._setLazyImageDisplaySource(_0x4e6f81, _0x186c06, {
            versionKey: _0x3f9672[_0x1eee43],
            previewLod: this._pickImageDisplayUrl(_0x4a392e[_0x1eee43], _0x4951a5[_0x1eee43], {
              lowZoomThumbnail: true
            })
          });
          this._applyImageElementLod(_0x4e6f81, _0x186c06.lod);
          if (_0x3c9eb6) {
            this._loadLazyImageDisplaySource(_0x4e6f81);
          } else {
            this._scheduleClearLazyImageDisplaySource(_0x4e6f81, AIGEN_IMAGE_HIDDEN_SOURCE_CLEAR_DELAY_MS);
          }
          _0x4e6f81.style.display = _0x3c9eb6 ? "block" : "none";
          _0x4e6f81.style.pointerEvents = _0x3c9eb6 ? "" : "none";
          if (_0x3c9eb6) {
            _0x4e6f81.style.transform = "rotate(0deg) scale(1)";
            _0x4e6f81.style.opacity = "1";
            _0x4e6f81.style.zIndex = _0xcdf252 + 1;
            _0x4e6f81.style.boxShadow = "0 4px 12px var(--black-40)";
          }
        }
        if (_0x1e4ee7) {
          _0x1e4ee7.style.display = _0x3c9eb6 ? "flex" : "none";
          _0x1e4ee7.style.zIndex = _0x3c9eb6 ? _0xcdf252 + 1 : _0x1eee43;
        }
      }
      const _0x310868 = this.previewEl.offsetWidth || _0xb2336e;
      const _0x987c22 = this.previewEl.offsetHeight || _0x671b61;
      const _0x3b1988 = 12;
      const _0x1a94cc = 38;
      const _0x1992a6 = 18;
      const _0x5b880b = Math.max(1, _0x310868 - _0x1a94cc - 4);
      const _0x15cddf = Math.max(1, _0x987c22 - _0x1992a6 * 2);
      const _0x3de10e = (_0x44649c, _0x3f1b01) => {
        const _0x4ba818 = Number.parseFloat(_0x44649c);
        if (Number.isFinite(_0x4ba818)) {
          return _0x4ba818;
        } else {
          return _0x3f1b01;
        }
      };
      const _0x481420 = _0x4d1714 => "translate(" + _0x4d1714.x + "px, " + _0x4d1714.y + "px) rotate(" + _0x4d1714.rotate + "deg) scale(" + _0x4d1714.scale + ")";
      const _0x397b58 = "all 0.46s cubic-bezier(0.175, 0.885, 0.32, 1.27), filter 0.4s ease-out";
      const _0x45ac78 = (_0x345e3b, _0x8dc71c) => {
        Object.assign(_0x345e3b.style, {
          top: _0x8dc71c.top + "px",
          left: _0x8dc71c.left + "px",
          width: _0x8dc71c.width + "px",
          height: _0x8dc71c.height + "px",
          opacity: String(_0x8dc71c.opacity),
          pointerEvents: _0x8dc71c.pointerEvents,
          zIndex: String(_0x8dc71c.zIndex),
          borderRadius: _0x8dc71c.borderRadius,
          transform: _0x8dc71c.transform,
          filter: _0x8dc71c.filter,
          transformOrigin: _0x8dc71c.transformOrigin
        });
      };
      const _0x471846 = ({
        plate: _0x11d87e,
        fromFrame: _0x52b23c,
        toFrame: _0x401460
      }) => {
        if (!_0x11d87e) {
          return;
        }
        _0x11d87e.style.transition = "none";
        _0x45ac78(_0x11d87e, _0x52b23c);
        _0x11d87e.getBoundingClientRect?.();
        requestAnimationFrame(() => {
          _0x11d87e.style.transition = _0x397b58;
          _0x45ac78(_0x11d87e, _0x401460);
        });
      };
      const _0x28c93b = () => {
        return buildMultiResultExpandedSlotMap({
          imageCount: _0xcdf252,
          mainIndex: _0x5e1ca3,
          previewWidth: _0x310868,
          previewHeight: _0x987c22,
          gap: _0x3b1988
        });
      };
      _0x39e663 = _0x8a6e04 => {
        const _0x40f7b6 = _0x28c93b();
        const _0x5efaa0 = this._multiBackdropWrap?.querySelectorAll?.("." + MULTI_RESULT_BACKPLATE_CLASS);
        _0x5efaa0?.forEach(_0xee3f95 => {
          const _0xf6420a = Number(_0xee3f95.dataset?.imageIndex);
          const _0x557be2 = Math.max(1, Number(_0xee3f95.dataset?.stackIndex) || 1);
          const _0x2d6a16 = buildMultiResultCollapsedFrame(_0x557be2);
          const _0x3ff17e = _0x40f7b6.get(_0xf6420a);
          const _0x4099ec = !!_0x8a6e04 && !!_0x3ff17e;
          const _0x537431 = _0xee3f95.querySelector(".multi-stack-backplate-media");
          const _0x2a6975 = _0xee3f95.classList.contains("is-expanded-card");
          const _0x5a4e1f = !_0x4099ec && _0x2a6975 && this._multiStackCardsLaidOut;
          const _0x4591e1 = {
            top: _0x3de10e(_0xee3f95.style.top, _0x1992a6),
            left: _0x3de10e(_0xee3f95.style.left, _0x1a94cc),
            width: _0x3de10e(_0xee3f95.style.width, _0x5b880b),
            height: _0x3de10e(_0xee3f95.style.height, _0x15cddf)
          };
          const _0x5a93f4 = _0x481420(_0x2d6a16);
          const _0x34042a = {
            top: _0x1992a6,
            left: _0x1a94cc,
            width: _0x5b880b,
            height: _0x15cddf,
            opacity: _0x2d6a16.opacity,
            pointerEvents: "none",
            zIndex: _0x557be2,
            borderRadius: "0 var(--radius-16) var(--radius-16) 0",
            transform: _0x5a93f4,
            filter: "brightness(0.86) saturate(0.92)",
            transformOrigin: "center right"
          };
          const _0x114425 = {
            top: _0x4099ec ? _0x3ff17e.top : _0x4591e1.top,
            left: _0x4099ec ? _0x3ff17e.left : _0x4591e1.left,
            width: _0x310868,
            height: _0x987c22,
            opacity: 1,
            pointerEvents: "auto",
            zIndex: _0x4099ec ? 2 + _0x3ff17e.order : _0x557be2,
            borderRadius: "18px",
            transform: "translate(0px, 0px) rotate(0deg) scale(1)",
            filter: "brightness(1) saturate(1)",
            transformOrigin: "bottom left"
          };
          const _0x691006 = _0x2a6975 ? _0x114425 : _0x34042a;
          const _0x2baf79 = _0x4099ec ? _0x114425 : _0x34042a;
          const _0x8e0783 = !!this._multiStackCardsLaidOut && _0x2a6975 !== _0x4099ec;
          _0xee3f95.classList.toggle("is-expanded-card", _0x4099ec);
          _0xee3f95.style.display = "block";
          if (_0x537431) {
            if (_0x4099ec) {
              _0x104d84(_0x537431);
              this._loadLazyImageDisplaySource(_0x537431);
            } else if (_0x5a4e1f) {
              this._cancelLazyImageDisplayClear(_0x537431);
              _0x104d84(_0x537431);
              _0x537431._multiBackplateMediaHideTimer = setTimeout(() => {
                _0x537431._multiBackplateMediaHideTimer = null;
                if (_0xee3f95.classList.contains("is-expanded-card")) {
                  return;
                }
                _0x537431.style.opacity = "0";
                _0x537431.style.transform = "scale(1.02)";
                this._scheduleClearLazyImageDisplaySource(_0x537431, AIGEN_IMAGE_BACKPLATE_MEDIA_HIDE_CLEAR_DELAY_MS);
              }, _0x1560be);
            } else {
              _0x104d84(_0x537431);
              this._clearLazyImageDisplaySource(_0x537431);
            }
            _0x537431.style.opacity = _0x4099ec || _0x5a4e1f ? "1" : "0";
            _0x537431.style.transform = _0x4099ec || _0x5a4e1f ? "scale(1)" : "scale(1.02)";
          }
          if (_0x8e0783) {
            _0x471846({
              plate: _0xee3f95,
              fromFrame: _0x691006,
              toFrame: _0x2baf79
            });
          } else {
            _0xee3f95.style.transition = _0x397b58;
            _0x45ac78(_0xee3f95, _0x2baf79);
          }
        });
        this._multiStackCardsLaidOut = true;
      };
      if (this._expandPanel && this._expandPanel.parentNode) {
        this._expandPanel.parentNode.removeChild(this._expandPanel);
      }
      this._expandPanel = null;
      if (_0x2ca4bf) {
        this._root.style.position = "relative";
        this._root.style.setProperty("overflow", "visible");
      }
      _0x39e663(_0x2ca4bf);
    }
    _createErrorCard(_0x2dfb24) {
      const _0x550602 = document.createElement("div");
      _0x550602.className = "gen-error-card";
      Object.assign(_0x550602.style, {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: "8px",
        padding: "16px",
        boxSizing: "border-box",
        background: "var(--bg-panel-card)",
        textAlign: "center"
      });
      _0x550602.innerHTML = "\n            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--red)\" stroke-width=\"2\">\n                <circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/>\n            </svg>\n            <span style=\"color:var(--red);font-size:12px;font-weight:600;line-height:1.4;\">" + t("aigenImage.result.restrictedOrFailed") + "</span>\n        ";
      const _0x172e0e = document.createElement("span");
      Object.assign(_0x172e0e.style, {
        color: "var(--white-50)",
        fontSize: "11px",
        lineHeight: "1.5",
        wordBreak: "break-all"
      });
      _0x172e0e.textContent = String(_0x2dfb24 || "");
      _0x550602.appendChild(_0x172e0e);
      return _0x550602;
    }
    _createStatusCard(_0x181fef, _0x2ab04c) {
      const _0x37a72e = document.createElement("div");
      _0x37a72e.className = "gen-status-card";
      Object.assign(_0x37a72e.style, {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: "8px",
        padding: "16px",
        boxSizing: "border-box",
        background: "var(--bg-panel-card)",
        textAlign: "center"
      });
      const _0x3f1feb = Number(_0x2ab04c) === 0;
      const _0x188d9d = _0x3f1feb ? "var(--green)" : "var(--white-80)";
      const _0x24316f = _0x181fef;
      _0x37a72e.innerHTML = "\n            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"" + _0x188d9d + "\" stroke-width=\"2\">\n                <circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"" + (_0x3f1feb ? "M8 12l2.5 2.5L16 9" : "M12 8v5") + "\" />" + (_0x3f1feb ? "" : "<line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\" />") + "\n            </svg>\n            <span style=\"color:" + _0x188d9d + ";font-size:12px;font-weight:600;line-height:1.4;\">" + _0x24316f + "</span>\n        ";
      return _0x37a72e;
    }
    _syncPromptPlaceholder(_0x55fdb7 = this._data) {
      if (!this.promptEl) {
        return;
      }
      this.promptEl.dataset.placeholder = getImagePromptPlaceholderForModel(_0x55fdb7?.model);
    }
    _syncPromptBoxSizeFromData(_0x4c22eb = this._data) {
      if (!this.promptEl || this._isPromptBoxResizing) {
        return;
      }
      const _0x2443ed = getPromptBoxHeightBounds(this._promptPanel);
      const _0x2a3142 = normalizePromptBoxHeight(_0x4c22eb?.promptBoxHeight, _0x2443ed);
      applyPromptBoxHeight(this.promptEl, _0x2a3142);
    }
    _syncPromptInputVisibility(_0x37ae28 = this._data) {
      if (!this._promptInputWrap) {
        return true;
      }
      const _0x11531b = shouldShowImagePromptInput(getModelManifest(_0x37ae28?.model));
      this._promptInputWrap.hidden = !_0x11531b;
      this._promptInputWrap.classList?.toggle("is-hidden-by-model", !_0x11531b);
      if (this.promptEl) {
        this.promptEl.contentEditable = _0x11531b ? "true" : "false";
        this.promptEl.setAttribute?.("aria-hidden", _0x11531b ? "false" : "true");
        if (!_0x11531b && typeof document !== "undefined" && document.activeElement === this.promptEl) {
          this.promptEl.blur?.();
        }
      }
      if (!_0x11531b) {
        this._promptPanel?.classList?.remove("is-resize-hover");
      }
      return _0x11531b;
    }
    _setupPromptBoxResize() {
      if (!this._promptPanel || this._promptResizeHandle) {
        return;
      }
      this._promptResizeHandle = true;
      const _0x564ed1 = 20;
      const _0x298fc8 = 10;
      const _0x7479ad = () => _0x3ca44d.getStateRaw().ui?.promptBoxResizeEnabled !== false;
      const _0x5398ac = () => this._promptInputWrap?.hidden === true || this._promptInputWrap?.classList?.contains("is-hidden-by-model");
      const _0x1b0f57 = _0x17efda => !!_0x17efda?.closest(".floating-menu, .img-model-menu");
      const _0xcaed38 = _0x5577e4 => {
        const _0x5ed957 = this._promptPanel.getBoundingClientRect();
        return _0x5577e4 >= _0x5ed957.bottom - _0x564ed1 && _0x5577e4 <= _0x5ed957.bottom + _0x298fc8;
      };
      const _0x3349d6 = _0x1b5bbe => {
        if (!this._promptPanel) {
          return;
        }
        if (!_0x7479ad()) {
          this._promptPanel.classList.remove("is-resize-hover");
          return;
        }
        if (_0x5398ac()) {
          this._promptPanel.classList.remove("is-resize-hover");
          return;
        }
        if (this._isPromptBoxResizing) {
          this._promptPanel.classList.add("is-resize-hover");
          return;
        }
        const _0x5bb85f = !_0x1b0f57(_0x1b5bbe?.target) && _0xcaed38(_0x1b5bbe.clientY);
        this._promptPanel.classList.toggle("is-resize-hover", _0x5bb85f);
      };
      this._promptPanel.addEventListener("pointermove", _0x3349d6);
      this._promptPanel.addEventListener("pointerleave", () => {
        if (!this._isPromptBoxResizing) {
          this._promptPanel?.classList.remove("is-resize-hover");
        }
      });
      const _0xe133cf = _0x5d104c => {
        if (!this._promptInputWrap || !this.promptEl) {
          return;
        }
        if (!_0x7479ad()) {
          return;
        }
        if (_0x5398ac()) {
          return;
        }
        if (_0x5d104c.button !== 0) {
          return;
        }
        if (!_0xcaed38(_0x5d104c.clientY)) {
          return;
        }
        if (_0x5d104c.target?.closest(".prompt-submit") || _0x1b0f57(_0x5d104c.target)) {
          return;
        }
        _0x5d104c.stopPropagation();
        _0x5d104c.preventDefault();
        const _0x46b161 = getPromptBoxHeightBounds(this._promptPanel);
        const _0x305936 = _0x5d104c.clientY;
        const _0x1988de = this.promptEl.getBoundingClientRect().height;
        this._isPromptBoxResizing = true;
        this._promptInputWrap.classList.add("is-resizing");
        this._promptPanel.classList.add("is-resize-hover");
        const _0x1dd525 = _0x4a8951 => {
          _0x4a8951.preventDefault();
          const _0xb9fc42 = normalizePromptBoxHeight(_0x1988de + (_0x4a8951.clientY - _0x305936), _0x46b161);
          applyPromptBoxHeight(this.promptEl, _0xb9fc42);
        };
        const _0x5d0ca5 = _0xc51d45 => {
          _0xc51d45.preventDefault();
          window.removeEventListener("pointermove", _0x1dd525);
          window.removeEventListener("pointerup", _0x5d0ca5);
          window.removeEventListener("pointercancel", _0x5d0ca5);
          const _0x140ba2 = normalizePromptBoxHeight(this.promptEl?.getBoundingClientRect().height, _0x46b161);
          applyPromptBoxHeight(this.promptEl, _0x140ba2);
          this._promptInputWrap.classList.remove("is-resizing");
          this._isPromptBoxResizing = false;
          this._promptPanel.classList.remove("is-resize-hover");
          _0x3349d6(_0xc51d45);
          _0x3ca44d.updateNodeData(this.nodeId, {
            promptBoxHeight: _0x140ba2
          });
        };
        window.addEventListener("pointermove", _0x1dd525);
        window.addEventListener("pointerup", _0x5d0ca5);
        window.addEventListener("pointercancel", _0x5d0ca5);
      };
      this._promptPanel.addEventListener("pointerdown", _0xe133cf);
    }
    _isRunninghubWorkflowModel(_0x38a5a2, _0x483d1c) {
      return isWorkflowModel(_0x38a5a2, _0x483d1c || "runninghubwf");
    }
    _normalizeLegacySeedreamModel(_0x550b75, _0x2ac060 = {}) {
      const _0x14c161 = _0x2ac060?.syncStore !== false;
      const _0x4df065 = _0x550b75 || {};
      const _0x99d11f = String(_0x4df065.model || "").trim();
      const _0x4e818a = _0x99d11f.toLowerCase();
      let _0x311afd = "";
      let _0x3082e1 = "";
      if (_0x4e818a.startsWith("apimart/seedream-")) {
        return _0x550b75;
      } else if (_0x4e818a.startsWith("ppio/seedream-")) {
        _0x311afd = "nano-banana-2";
        _0x3082e1 = "grsai";
      } else {
        return _0x550b75;
      }
      const _0x53fdc7 = {};
      if (_0x99d11f !== _0x311afd) {
        _0x53fdc7.model = _0x311afd;
      }
      if (String(_0x4df065.provider || "").trim() !== _0x3082e1) {
        _0x53fdc7.provider = _0x3082e1;
      }
      if (String(_0x4df065.imageSize || "").trim().toUpperCase() === "3K") {
        _0x53fdc7.imageSize = "2K";
      }
      if (Object.keys(_0x53fdc7).length === 0) {
        return _0x4df065;
      }
      const _0x4c817b = {
        ..._0x4df065,
        ..._0x53fdc7
      };
      const _0x10884c = _0x3ca44d.getState().nodes?.[this.nodeId];
      if (_0x14c161 && _0x10884c) {
        _0x3ca44d.updateNodeData(this.nodeId, _0x53fdc7);
      }
      return _0x4c817b;
    }
    _normalizeDreaminaNodeData(_0x5b0686, _0x147aca = {}) {
      const _0x84faf5 = _0x147aca?.syncStore !== false;
      const _0x46a73f = this._normalizeLegacySeedreamModel(_0x5b0686, {
        syncStore: _0x84faf5
      });
      const _0x13cd37 = buildDreaminaImageNodeNormalizationPatch(_0x46a73f);
      if (!_0x13cd37) {
        return _0x46a73f;
      }
      const _0x11db98 = {
        ...(_0x46a73f || {}),
        ..._0x13cd37
      };
      const _0x1669e0 = _0x3ca44d.getState().nodes?.[this.nodeId];
      if (_0x84faf5 && _0x1669e0) {
        _0x3ca44d.updateNodeData(this.nodeId, _0x13cd37);
      }
      return _0x11db98;
    }
    _buildSchemaAspectRatioDisplayPatch(_0x17c2b4, _0x23f06c, _0x3bacb3 = {}) {
      const _0x2f9331 = _0x17c2b4 || (_0x3ca44d.getState?.() || {}).nodes?.[this.nodeId] || this._data || {};
      const _0x4586d4 = _0x3bacb3?.forceManualDisplaySize === true;
      if (!_0x4586d4 && _0x2f9331?.[GENERATION_MANUAL_DISPLAY_SIZE_FIELD] === true) {
        return {};
      }
      const _0x4fc4c7 = buildImageSchemaAspectRatioDisplayPatch({
        store: _0x3ca44d,
        nodeId: this.nodeId,
        nodeData: _0x2f9331,
        ratioValue: _0x23f06c,
        minSide: getAIGenerationNodeSize().width,
        getRefKindByNodeType: _0x746cd6,
        resultMediaElement: this.imgEl
      });
      if (_0x4586d4) {
        return {
          [GENERATION_MANUAL_DISPLAY_SIZE_FIELD]: false,
          ..._0x4fc4c7
        };
      } else {
        return _0x4fc4c7;
      }
    }
    _applySchemaAspectRatioResizeAnimation(_0x4f9856, _0x2673f6) {
      if (!_0x2673f6 || _0x2673f6.width === undefined || _0x2673f6.height === undefined) {
        return;
      }
      applyImageSchemaRatioResizeAnimation(this, {
        nodeId: this.nodeId,
        previewEl: this.previewEl,
        nodeData: _0x4f9856,
        patch: _0x2673f6
      });
    }
    runAdaptiveRatio() {
      const _0x312849 = (_0x3ca44d.getState?.() || {}).nodes?.[this.nodeId] || this._data || {};
      const _0x486382 = this._buildSchemaAspectRatioDisplayPatch(_0x312849, "自适应");
      if (Object.keys(_0x486382).length > 0) {
        _0x3ca44d.updateNodeData(this.nodeId, _0x486382);
        this._applySchemaAspectRatioResizeAnimation(_0x312849, _0x486382);
      }
    }
    _applyModelParamVisibility(_0x22877f = this._data) {
      if (!_0x22877f) {
        return;
      }
      const _0x16ed2d = this._getUiSchemaRenderNodeData(_0x22877f);
      const _0xd21b38 = buildUiSchemaVisibilitySignature(_0x22877f.model, _0x16ed2d);
      const _0x4d17b = resolveCustomAiAppNodeManifest(_0x22877f);
      const _0x313ec4 = isCustomAiAppManifest(_0x4d17b);
      const _0x1efe0d = _0x313ec4;
      const _0x5a3c61 = (_0x1aed52, _0x43f282) => {
        if (!_0x1aed52) {
          return;
        }
        const _0x29d71a = renderModelUiSchemaControls(_0x22877f.model, _0x16ed2d, {
          placement: _0x43f282,
          variant: _0x43f282 === "mode" ? "pillMenu" : _0x43f282 === "resolution" ? "resolutionPill" : _0x43f282 === "advanced" ? "advancedRow" : _0x43f282 === "instance" ? "instanceToggle" : _0x43f282 === "batch" ? "pillMenu" : undefined
        });
        _0x1aed52.innerHTML = _0x29d71a;
        _0x1aed52.style.display = _0x29d71a ? "" : "none";
      };
      if (this._uiSchemaModel !== _0x22877f.model || this._uiSchemaVisibilitySignature !== _0xd21b38) {
        _0x5a3c61(this.uiSchemaModeSlot, "mode");
        _0x5a3c61(this.uiSchemaResolutionSlot, "resolution");
        _0x5a3c61(this.rhAdvPanelEl, "advanced");
        _0x5a3c61(this.uiSchemaInstanceSlot, "instance");
        _0x5a3c61(this.uiSchemaBatchSlot, "batch");
        this._uiSchemaModel = _0x22877f.model;
        this._uiSchemaVisibilitySignature = _0xd21b38;
        this._qwenFirstImageModeBtns = [];
      }
      syncModelUiSchemaControls(this.modelWrap?.closest(".prompt-panel-footer"), _0x16ed2d);
      const _0x1250cb = renderModelUiSchemaControls(_0x22877f.model, _0x16ed2d, {
        placement: "advanced",
        variant: "advancedRow"
      });
      const _0x4bdba0 = Boolean(_0x1250cb.trim());
      if (this.rhAdvWrap) {
        this.rhAdvWrap.style.display = _0x4bdba0 && !_0x313ec4 ? "" : "none";
      }
      const _0xeb84fe = this.rhAdvPanelEl?.classList?.contains(RH_AI_APP_PERSISTENT_ADVANCED_CLASS);
      if (this.rhAdvPanelEl) {
        this.rhAdvPanelEl.classList.toggle(RH_AI_APP_PERSISTENT_ADVANCED_CLASS, _0x1efe0d && _0x4bdba0);
      }
      if (this.rhAdvPanelEl && _0x1efe0d && _0x4bdba0) {
        this.rhAdvPanelEl.classList.add("show");
      }
      if (this.rhAdvPanelEl && !_0x1efe0d && _0xeb84fe) {
        this.rhAdvPanelEl.classList.remove("show");
      }
      if (this.rhAdvPanelEl && !_0x4bdba0) {
        this.rhAdvPanelEl.classList.remove("show");
      }
    }
  }
  return _0x44616b.prototype;
}
