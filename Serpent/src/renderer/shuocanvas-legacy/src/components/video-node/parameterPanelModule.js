import { APIMART_DREAMINA_VIDEO_DEFAULT_MODEL, buildDreaminaStyleVideoNodeNormalizationPatch, ensureDreaminaStyleVideoModelForTask, getDreaminaStyleVideoDurationRange, getDreaminaStyleVideoResolutionOptions, getDreaminaVideoTaskParamVisibility, isApimartDreaminaVideoModel, isDreaminaStyleVideoModel, isDreaminaVideoRouteModeEnabled, normalizeDreaminaVideoAspectRatio, normalizeDreaminaStyleVideoDuration, getDreaminaStyleVideoDefaultModel, normalizeDreaminaStyleVideoModel, normalizeDreaminaStyleVideoResolution, normalizeDreaminaVideoRouteMode, resolveDreaminaStyleVideoProvider, resolveDreaminaVideoTaskType, validateDreaminaVideoRouteSelection } from "../../modules/dreaminaVideoModelHelper.js";
import { normalizeProviderId, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { buildFixedInputAssetSlotMap, getFixedInputSlotConfigFromManifest, resolveFixedInputSlotForRef } from "../../modules/fixedInputAssetRefs.js";
import { flushPromptHtmlCommit, resolvePromptTextWithTextRefs } from "../../modules/nodePromptShared.js";
import { resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { getGenerationRatioSizeWithDom } from "../../modules/generationRatioSource.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../../utils/debugRequestPreview.js";
import { getNodeDefaultSize } from "../../services/fileService.js";
import { releasePayloadObjectUrlLease } from "../../services/payloadObjectUrlLease.js";
import { resolveGenerationButtonMode } from "../../core/generationTaskUiState.js";
import { showRunningHubMediaUploadGuideForError } from "../../modules/runningHubMediaUploadGuide.js";
import { applyModelCredentialButtonState, bindModelCredentialMenu, resetModelCredentialButtonState, syncModelCredentialMenu } from "../../modules/modelCredentialUi.js";
import { resetGenerateButtonIdleUi, setGenerateButtonCancellableUi, setGenerateButtonLoadingUi } from "../../modules/previewGenerateButtonUi.js";
import { evaluateGenerationPromptBoundary } from "../../modules/generationPromptPolicy.js";
import { bindUiSchemaFieldControls, bindModelUiSchemaControls, hasVisibleModelUiSchema, renderModelUiSchemaControls, renderUiSchemaFields, syncModelUiSchemaControls } from "../aigenImage/uiSchemaRenderer.js";
import { applyImageSchemaRatioResizeAnimation, buildGenerationModelSelectionPayload, buildImageSchemaAspectRatioDisplayPatch, GENERATION_MANUAL_DISPLAY_SIZE_FIELD } from "../shared/generationDisplayPolicy.js";
import { VIDEO_DISPLAY_RATIO_RESULT_FIELDS, buildVideoSchemaAspectRatioDisplayPatch } from "./videoSchemaAspectRatioDisplayPatch.js";
import { restoreLegacyVideoRatioPopupAfterSync, syncLegacyVideoRatioFooter } from "./legacyVideoRatioPopup.js";
import { isRunningHubVideoWorkflowModel, resolveVideoAdvancedSchemaTarget } from "./videoAdvancedSchemaTarget.js";
import { renderNodeModelTrigger } from "../shared/nodeModelMenu.js";
import { buildVideoModelMenuHTML, renderVideoModelTriggerIconHTML } from "./modelSelectorShared.js";
import { bindNodeFooterController, bindNodeSubmenus, closeNodeFooterMenus } from "../shared/nodeFooterControls.js";
import { RH_AI_APP_PERSISTENT_ADVANCED_CLASS, isCustomAiAppManifest, isRunningHubAiAppManifest, shouldAllowEmptyCustomAiAppInputs } from "../shared/rhAiAppNodeBehavior.js";
import { buildVideoWorkflowDisplayParamsPatch, buildVideoWorkflowGenerationParamsPatch, buildVideoWorkflowModelSelectionPatch, getRunningHubVideoWorkflowFpsOptions, getRunningHubVideoParameterPanelPolicy, getPlainGenerationParams, hasRunningHubVideoWorkflowUiPlacement, isRunningHubVideoWorkflowManifest } from "./runningHubVideoUiSchema.js";
import { arePlainObjectsEqual, buildAgnesVideoLogoHTML, buildAgnesVideoMenuItemsHtml, buildApimartVideoMenuItemsHtml, buildApimartVideoLogoHTML, buildCustomProviderVideoLogoHTML, buildCustomProviderVideoMenuGroups, getComfyUiVideoWorkflowIconHtml, buildComfyUiVideoWorkflowMenuGroups, buildDreaminaVideoLogoHTML, buildDreaminaOfficialVideoMenuItems, buildDreaminaTaskModelMenuHtml, buildRunningHubVideoModelApiMenuItems, buildRunningHubVideoWorkflowMenuItems, buildRhAiAppVideoMenuItems, buildVolcengineOfficialVideoMenuItems, buildVolcengineVideoLogoHTML, getDefaultRunningHubVideoWorkflowModelId, getDreaminaTaskModelMenuItems, getDreaminaTaskModelMenuMeta, getRhV54FpsOptions, normalizeRhStandardFps, normalizeRhV54Fps } from "./parameterPanelModelHelpers.js";
import { buildDreaminaParamPatch, buildDreaminaModelSelectionParamPatch, buildDreaminaParamSchemaFields, buildDreaminaRouteModeUpdate, buildDreaminaStorePatchFromNormalization, getDreaminaEffectiveNodeData, resolveDreaminaRememberedRouteModel } from "./dreaminaParameterSchema.js";
import { renderVideoFooterShell } from "./footerShell.js";
import { buildRhWorkflowFieldPatch, buildVideoModelApiModelSelectionPatch, getManifestInputPolicyEdgeIdsToRemove, getPanelModelManifest, isHappyHorsePanelModel, isRhAiAppPanelModel } from "./parameterPanelModelSelectionPolicy.js";
import { DEFAULT_VIDEO_MODEL_API_FOOTER_PLACEMENT_ORDER, VIDEO_MODE_ALL_REFERENCE_VALUE, VIDEO_MODE_FIRST_LAST_VALUE, formatVideoRatioResolutionLabel, getDreaminaProviderLabel, getVideoCancelTooltip, getVideoGenerateTitle, getVideoModeLabel, manifestFixedSlotVisibilityReferencesField, manifestHelpVariantsReferenceField, manifestPromptVariantsReferenceField, resolveVideoAdaptiveRatioSource, resolveVideoModelApiFooterPlacementOrder, resolveVideoPromptPlaceholder, shouldShowVideoPromptInput, videoPanelText, wrapUiSchemaPlacementControls } from "./parameterPanelPresentationPolicy.js";
function bindVideoPanelEvent(_0x7cf9ee, _0x44a9db, _0x4b52f8, _0x1b5003) {
  if (!_0x7cf9ee || typeof _0x1b5003 !== "function") {
    return;
  }
  const _0x4c6c73 = "__videoPanel_" + _0x44a9db + "_" + _0x4b52f8;
  const _0xf8f889 = _0x7cf9ee[_0x4c6c73];
  if (_0xf8f889) {
    _0x7cf9ee.removeEventListener(_0x44a9db, _0xf8f889);
  }
  _0x7cf9ee[_0x4c6c73] = _0x1b5003;
  _0x7cf9ee.addEventListener(_0x44a9db, _0x1b5003);
}
function bindVideoPanelClick(_0x444bb8, _0x225a44, _0x4064c0) {
  bindVideoPanelEvent(_0x444bb8, "click", _0x225a44, _0x4064c0);
}
function bindVideoPanelInput(_0x10e7c1, _0x5c6346, _0x5d9faa) {
  bindVideoPanelEvent(_0x10e7c1, "input", _0x5c6346, _0x5d9faa);
}
function getDefaultVideoModelId() {
  return getDefaultRunningHubVideoWorkflowModelId();
}
function normalizeRhVideoFpsByPolicy(_0x43ae1b, _0x56c0a2) {
  if (_0x43ae1b?.sourceFrameCountFps === "v54") {
    return normalizeRhV54Fps(_0x56c0a2);
  } else {
    return normalizeRhStandardFps(_0x56c0a2);
  }
}
function findPreferredVideoEdge(_0x359134, _0x17940e) {
  return _0x359134.find(_0x54ee2f => {
    const _0x289871 = _0x17940e?.nodes?.[_0x54ee2f?.sourceId];
    const _0x26032c = String(_0x289871?.type || "");
    return _0x26032c === "source-video" || _0x26032c === "video" || _0x26032c === "ai-video";
  });
}
export function createVideoNodeParameterPanelModule(_0x1f86c4) {
  const {
    store: _0x35358e,
    api: _0x2f3aff,
    getDisplayModelName: _0x41e201,
    PROVIDERS_META: _0x5a7f85,
    getAIGenerationNodeSize: _0x12374a,
    getDisplayedMediaSizeFromNode: _0x4d28c6,
    activateMenuKeyboard: _0x54438a,
    isVideoVipModel: _0x457e4e,
    readStoreState = () => _0x35358e.getStateRaw?.() || _0x35358e.getState?.() || {}
  } = _0x1f86c4;
  class _0x26ec7f {
    _getRhVideoAdvancedSchemaNodeData(_0x33cc2e = {}) {
      const _0x1813f4 = String(_0x33cc2e?.model || "").trim();
      const _0x1cbd87 = getRunningHubVideoParameterPanelPolicy(_0x1813f4);
      let _0x19527e = _0x33cc2e;
      if (_0x1cbd87.sourceFrameCountFps) {
        const _0x888329 = normalizeRhVideoFpsByPolicy(_0x1cbd87, _0x33cc2e?.rhVideoFps);
        _0x19527e = {
          ..._0x19527e,
          rhVideoSourceFrameCount: this._getRhV5SourceVideoFrameCount?.(_0x888329) || 0
        };
      }
      if (_0x1cbd87.maskVideoDisablesSubtractSubject !== true) {
        return _0x19527e;
      }
      const _0x293682 = (_0x35358e.getIncomingEdges(this.nodeId) || []).some(_0x57b71f => {
        const _0x509d92 = String(_0x57b71f?.refSlot || "").trim();
        return _0x509d92 === "videoMask" || _0x509d92 === "maskVideo";
      });
      if (!_0x293682) {
        return _0x19527e;
      }
      return {
        ..._0x19527e,
        rhV54HasMaskVideo: true,
        rhSubtractSubject: false,
        generationParams: {
          ...getPlainGenerationParams(_0x19527e?.generationParams),
          rhSubtractSubject: false
        }
      };
    }
    _buildVideoModelMenuHtml(_0x438bcf = "") {
      return buildVideoModelMenuHTML({
        activeModel: _0x438bcf || this._data?.model,
        provider: this._data?.provider,
        subscriptionState: (typeof _0x35358e.getStateRaw === "function" ? _0x35358e.getStateRaw() : _0x35358e.getState())?.subscription || {}
      });
    }
    _getVideoAdvancedSchemaTarget(_0x2e55dd = this._data) {
      return resolveVideoAdvancedSchemaTarget(_0x2e55dd, {
        fallbackNodeData: this._data,
        buildRunningHubNodeData: _0x17cf9b => this._getRhVideoAdvancedSchemaNodeData(_0x17cf9b)
      });
    }
    _renderVideoAdvancedControlsHtml(_0x4fe9a2 = this._data) {
      const _0x4ccf6a = this._getVideoAdvancedSchemaTarget(_0x4fe9a2);
      if (_0x4ccf6a) {
        return renderModelUiSchemaControls(_0x4ccf6a.modelId, _0x4ccf6a.nodeData, {
          placement: _0x4ccf6a.placement
        });
      } else {
        return "";
      }
    }
    _hasVisibleVideoAdvancedControls(_0xe07f36 = this._data) {
      const _0x535115 = this._getVideoAdvancedSchemaTarget(_0xe07f36);
      return !!_0x535115 && hasVisibleModelUiSchema(_0x535115.modelId, _0x535115.nodeData, {
        placement: _0x535115.placement
      });
    }
    _renderFooterShell(_0x5c8cef) {
      renderVideoFooterShell(this, _0x5c8cef, {
        DEBUG_WRENCH_ICON_HTML: DEBUG_WRENCH_ICON_HTML,
        getDefaultVideoModelId: getDefaultVideoModelId,
        getDisplayModelName: _0x41e201,
        getVideoCancelTooltip: getVideoCancelTooltip,
        getVideoGenerateTitle: getVideoGenerateTitle,
        renderNodeModelTrigger: renderNodeModelTrigger,
        videoPanelText: videoPanelText
      });
    }
    _renderFooterImpl(_0x157b8e) {
      if (_0x157b8e?.dataset) {
        delete _0x157b8e.dataset.deferredDetailsShell;
      }
      let _0x513ec6 = false;
      const _0x4377b6 = _0x157b8e.querySelector(".rh-vram-adv-panel");
      if (_0x4377b6) {
        _0x513ec6 = _0x4377b6.classList.contains("show");
      }
      const _0x4ecb3e = this._isDreaminaVideoNode(this._data) ? this._syncDreaminaTaskState(this._data, {
        syncStore: true
      }) : null;
      if (_0x4ecb3e?.nodeData) {
        this._data = _0x4ecb3e.nodeData;
      }
      const _0x3cde44 = Boolean(_0x4ecb3e);
      const _0x133a02 = String(this._data.model || "").trim() || getDefaultVideoModelId();
      const _0x555e91 = getPanelModelManifest({
        ...this._data,
        model: _0x133a02
      });
      const _0x1d23a9 = isRunningHubAiAppManifest(_0x555e91);
      const _0x6d0014 = isCustomAiAppManifest(_0x555e91);
      const _0x5805ab = !_0x3cde44 && _0x1d23a9;
      if (isRunningHubVideoWorkflowManifest(_0x133a02)) {
        const _0x90ce61 = buildVideoWorkflowGenerationParamsPatch(this._data, _0x133a02);
        const _0x160766 = buildVideoWorkflowDisplayParamsPatch(_0x133a02, _0x90ce61.generationParams, {
          v54FpsOptions: getRhV54FpsOptions()
        });
        const _0x56e230 = Object.entries(_0x160766).some(([_0x2503d5, _0x21cb73]) => this._data?.[_0x2503d5] !== _0x21cb73);
        if (_0x90ce61.generationParams && (!arePlainObjectsEqual(_0x90ce61.generationParams, getPlainGenerationParams(this._data.generationParams)) || !arePlainObjectsEqual(_0x90ce61.generationParamsByModel, getPlainGenerationParams(this._data.generationParamsByModel)) || _0x56e230)) {
          const _0x32cf6a = {
            ..._0x90ce61,
            ..._0x160766
          };
          _0x35358e.updateNodeData(this.nodeId, _0x32cf6a);
          this._data = {
            ...this._data,
            ..._0x32cf6a
          };
        }
      }
      const _0x35d936 = _0x133a02.includes("seedance");
      const _0x4c3582 = _0x4ecb3e?.nodeData?.resolution || this._data.resolution || (_0x35d936 ? "720p" : "1080p");
      const _0x543416 = this._getModelParamVisibility(_0x133a02, this._data.provider);
      const _0x5533d9 = this._isRunninghubWorkflowModel(_0x133a02, this._data.provider);
      const _0x360b69 = this._resolveModelExecution(_0x133a02, this._data.provider);
      const _0xd4c82e = !_0x3cde44 && _0x555e91?.kind !== "video";
      const _0x18cad0 = !_0x3cde44 && !_0x5533d9 && _0x360b69?.modelManifest?.adapterType === "modelApi" && _0x360b69?.modelManifest?.kind === "video";
      const _0x2be364 = !_0x3cde44 && !_0x5533d9 && !_0x1d23a9 && !_0x18cad0 && !_0xd4c82e;
      const _0x59f0e7 = _0x18cad0 ? String(_0x360b69?.canonicalModelId || _0x360b69?.modelManifest?.modelId || _0x133a02).trim() : _0x133a02;
      const _0x40f93c = _0x5533d9;
      const _0x129861 = _0x40f93c ? renderModelUiSchemaControls(_0x133a02, this._data, {
        placement: "instance",
        variant: "instanceToggle"
      }) : "";
      const _0x5f43b5 = hasRunningHubVideoWorkflowUiPlacement(_0x133a02, "videoParams");
      const _0xece04c = hasRunningHubVideoWorkflowUiPlacement(_0x133a02, "resolution");
      const _0x37c770 = _0x5f43b5 ? this._getRhVideoAdvancedSchemaNodeData(this._data) : this._data;
      const _0x25fab2 = _0x5f43b5 ? renderModelUiSchemaControls(_0x133a02, _0x37c770, {
        placement: "videoParams",
        unwrap: true,
        rhVideoFpsOptions: getRunningHubVideoWorkflowFpsOptions(_0x133a02, {
          v54FpsOptions: getRhV54FpsOptions()
        })
      }) : "";
      const _0x4d0fea = _0xece04c ? renderModelUiSchemaControls(_0x133a02, _0x37c770, {
        placement: "resolution"
      }) : "";
      const _0x15f7ed = _0x18cad0 ? renderModelUiSchemaControls(_0x59f0e7, this._data, {
        placement: "mode"
      }) : "";
      const _0x3fac7e = _0x18cad0 ? renderModelUiSchemaControls(_0x59f0e7, this._data, {
        placement: "resolution"
      }) : "";
      const _0x1591ee = _0x5533d9 || _0x1d23a9 ? renderModelUiSchemaControls(_0x133a02, this._data, {
        placement: "mode"
      }) : "";
      const _0x21082a = this._hasVisibleVideoAdvancedControls(this._data);
      const _0x254da6 = _0x21082a ? this._renderVideoAdvancedControlsHtml(this._data) : "";
      const _0x5dc868 = this._getModelIconHTML(_0x133a02, this._data.provider);
      const _0x17f3c7 = this._getRatioIconHTML(this._data.aspectRatio || "自适应");
      const _0x3679cd = formatVideoRatioResolutionLabel(this._data.aspectRatio, _0x4c3582);
      const _0x51ed7e = "\n                <div class=\"img-rp-quality-area\">\n                  <div class=\"img-rp-section-label\">" + videoPanelText("resolution") + "</div>\n                  <div class=\"img-rp-quality-segmented\">\n                    <button type=\"button\" class=\"img-rp-quality-item " + (_0x4c3582 === "480p" ? "active" : "") + " " + (_0x35d936 ? "is-disabled" : "") + "\" data-value=\"480p\" " + (_0x35d936 ? "disabled title=\"" + videoPanelText("resolutionUnavailable") + "\"" : "") + ">480p</button>\n                    <button type=\"button\" class=\"img-rp-quality-item " + (_0x4c3582 === "720p" ? "active" : "") + "\" data-value=\"720p\">720p</button>\n                    <button type=\"button\" class=\"img-rp-quality-item " + (_0x4c3582 === "1080p" ? "active" : "") + " " + (_0x35d936 ? "is-disabled" : "") + "\" data-value=\"1080p\" " + (_0x35d936 ? "disabled title=\"" + videoPanelText("resolutionUnavailable") + "\"" : "") + ">1080p</button>\n                  </div>\n                </div>\n                <div class=\"img-rp-ratio-area\">\n                  <div class=\"img-rp-section-label\">" + videoPanelText("aspectRatio") + "</div>\n                  <div class=\"img-rp-ratio-split\">\n                    <div class=\"img-rp-ratio-left\">\n                      <button type=\"button\" class=\"img-rp-large-adaptive active\" data-label=\"自适应\" data-w=\"1\" data-h=\"1\">\n                        <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M9 21V9\"/></svg>\n                        <span>" + videoPanelText("adaptive") + "</span>\n                      </button>\n                    </div>\n                    <div class=\"img-rp-ratio-right\">\n                      <button type=\"button\" class=\"img-rp-ratio-item\" data-label=\"1:1\" data-w=\"1\" data-h=\"1\"><span class=\"img-rp-icon img-rp-sq\"></span><span>1:1</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item\" data-label=\"9:16\" data-w=\"9\" data-h=\"16\"><span class=\"img-rp-icon img-rp-tall\"></span><span>9:16</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item\" data-label=\"16:9\" data-w=\"16\" data-h=\"9\"><span class=\"img-rp-icon img-rp-wide\"></span><span>16:9</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item\" data-label=\"3:4\" data-w=\"3\" data-h=\"4\"><span class=\"img-rp-icon img-rp-p34\"></span><span>3:4</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item\" data-label=\"4:3\" data-w=\"4\" data-h=\"3\"><span class=\"img-rp-icon img-rp-l43\"></span><span>4:3</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item is-disabled\" data-label=\"3:2\" data-w=\"3\" data-h=\"2\" disabled><span class=\"img-rp-icon img-rp-l32\"></span><span>3:2</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item is-disabled\" data-label=\"2:3\" data-w=\"2\" data-h=\"3\" disabled><span class=\"img-rp-icon img-rp-p23\"></span><span>2:3</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item is-disabled\" data-label=\"5:4\" data-w=\"5\" data-h=\"4\" disabled><span class=\"img-rp-icon img-rp-l54\"></span><span>5:4</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item is-disabled\" data-label=\"4:5\" data-w=\"4\" data-h=\"5\" disabled><span class=\"img-rp-icon img-rp-p45\"></span><span>4:5</span></button>\n                      <button type=\"button\" class=\"img-rp-ratio-item\" data-label=\"21:9\" data-w=\"21\" data-h=\"9\"><span class=\"img-rp-icon img-rp-ultra\"></span><span>21:9</span></button>\n                    </div>\n                  </div>\n                </div>\n      ";
      const _0x4852ca = _0x18cad0 ? resolveVideoModelApiFooterPlacementOrder(_0x360b69?.modelManifest) : DEFAULT_VIDEO_MODEL_API_FOOTER_PLACEMENT_ORDER;
      const _0x3e0dda = _0x4852ca.indexOf("mode");
      const _0x335ba9 = _0x4852ca.indexOf("resolution");
      const _0x34e1f6 = _0x18cad0 && _0x15f7ed && _0x3e0dda >= 0 && _0x335ba9 >= 0 && _0x3e0dda < _0x335ba9;
      const _0x2e950b = wrapUiSchemaPlacementControls(_0x15f7ed);
      const _0x27544c = wrapUiSchemaPlacementControls(_0x3fac7e);
      const _0x17e1d9 = wrapUiSchemaPlacementControls(_0x1591ee);
      _0x157b8e.innerHTML = "\n          <div class=\"img-model-pills\">\n            <div class=\"img-model-wrap\">\n              " + renderNodeModelTrigger({
        iconHtml: _0x5dc868,
        label: _0x41e201(_0x133a02)
      }) + "\n              <div class=\"floating-menu img-model-menu node-model-menu\" data-node-menu-kind=\"video\" data-lazy-model-menu=\"video\"></div>\n            </div>\n            " + (_0xd4c82e ? "<button type=\"button\" class=\"img-pill-btn\" data-video-model-unavailable=\"true\" disabled aria-disabled=\"true\" title=\"" + videoPanelText("modelUnavailable") + "\">" + videoPanelText("modelUnavailable") + "</button>" : "") + "\n            " + (_0x3cde44 ? "" : _0x17e1d9) + "\n            " + (_0x3cde44 || _0x5805ab ? "" : _0x34e1f6 ? _0x2e950b : "") + "\n            " + (_0x3cde44 || _0x5805ab ? "" : _0x5f43b5 && _0x25fab2 ? _0x25fab2 : "") + "\n            " + (_0x3cde44 || _0x5805ab ? "" : _0x4d0fea ? wrapUiSchemaPlacementControls(_0x4d0fea) : !_0x5f43b5 && _0x3fac7e ? _0x27544c : _0x2be364 ? "<div class=\"img-ratio-wrap\"" + (_0x543416.ratio ? "" : " hidden") + ">\n              <button type=\"button\" class=\"img-pill-btn img-ratio-btn\">\n                <span class=\"img-ratio-icon-slot\">" + _0x17f3c7 + "</span>\n                <span class=\"img-ratio-label\">" + _0x3679cd + "</span>\n              </button>\n              <div class=\"img-ratio-popup\">\n                " + _0x51ed7e + "\n              </div>\n            </div>" : "") + "\n            " + (_0x3cde44 || _0x5805ab || _0xd4c82e ? "" : _0x18cad0 ? _0x34e1f6 ? "" : _0x15f7ed ? _0x2e950b : "" : _0x2be364 ? "<div class=\"vid-mode-wrap\"" + (_0x543416.mode ? "" : " hidden") + ">\n              <button type=\"button\" class=\"img-pill-btn vid-mode-btn\">\n                <span class=\"vid-mode-label\">" + getVideoModeLabel(this._data.mode) + "</span>\n              </button>\n              <div class=\"floating-menu vid-mode-menu\">\n                <div class=\"floating-menu-item video-mode-item " + (!this._data.mode || this._data.mode === VIDEO_MODE_ALL_REFERENCE_VALUE ? "active" : "") + "\" data-value=\"" + VIDEO_MODE_ALL_REFERENCE_VALUE + "\">\n                  <svg class=\"video-mode-icon\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg>\n                  <span class=\"floating-menu-label\">" + videoPanelText("mode.allReference") + "</span>\n                </div>\n                <div class=\"floating-menu-item video-mode-item " + (this._data.mode === VIDEO_MODE_FIRST_LAST_VALUE ? "active" : "") + "\" data-value=\"" + VIDEO_MODE_FIRST_LAST_VALUE + "\">\n                  <svg class=\"video-mode-icon\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M7 7h10M7 17h10\"/></svg>\n                  <span class=\"floating-menu-label\">" + videoPanelText("mode.firstLastFrame") + "</span>\n                </div>\n              </div>\n            </div>" : "") + "\n            " + (_0x2be364 ? "<div class=\"vid-duration-wrap\"" + (_0x543416.duration ? "" : " hidden") + ">\n              <button type=\"button\" class=\"img-pill-btn vid-duration-btn\">\n                <span class=\"vid-duration-label\">" + (this._data.duration || "5") + "S</span>\n              </button>\n              <div class=\"floating-menu vid-duration-pop\">\n                <div class=\"vid-duration-title\">" + videoPanelText("duration") + "</div>\n                <input type=\"range\" class=\"vid-duration-slider\" min=\"4\" max=\"15\" step=\"1\" value=\"" + (this._data.duration || 5) + "\">\n                <div class=\"vid-duration-bounds\">\n                  <span class=\"vid-duration-min\">4S</span>\n                  <span class=\"vid-duration-max\">15S</span>\n                </div>\n              </div>\n            </div>" : "") + "\n          </div>\n          <div class=\"prompt-actions\">\n            <button type=\"button\" class=\"img-pill-btn rh-adv2-btn\"" + (_0x21082a && !_0x1d23a9 ? "" : " hidden") + ">\n              <span class=\"rh-adv2-label\">" + videoPanelText("advancedSettings") + "</span>\n            </button>\n            <div class=\"ui-schema-placement ui-schema-instance-slot\"" + (_0x40f93c && _0x129861 ? "" : " hidden") + ">\n              " + _0x129861 + "\n            </div>\n            <button type=\"button\" class=\"prompt-submit debug-wrench-btn\" title=\"" + videoPanelText("debugApiParams") + "\">\n              " + DEBUG_WRENCH_ICON_HTML + "\n            </button>\n                  <button type=\"button\" class=\"prompt-submit img-gen-btn\" " + (_0xd4c82e ? "disabled aria-disabled=\"true\" title=\"" + videoPanelText("modelUnavailable") + "\"" : _0x5533d9 ? "data-tooltip=\"" + getVideoCancelTooltip() + "\"" : "title=\"" + getVideoGenerateTitle() + "\"") + ">\n                    <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>\n                  </button>\n          </div>";
      const _0x286b11 = _0x254da6 ? "\n          <div class=\"rh-vram-adv-panel" + (_0x6d0014 ? " show " + RH_AI_APP_PERSISTENT_ADVANCED_CLASS : "") + "\">\n            " + _0x254da6 + "\n          </div>\n        " : "";
      if (_0x4ecb3e) {
        this._decorateDreaminaFooter(_0x157b8e, _0x4ecb3e);
      }
      if (_0x286b11) {
        _0x157b8e.insertAdjacentHTML("beforeend", _0x286b11);
      }
      this.rhVramAdvPanelEl = _0x157b8e.querySelector(".rh-vram-adv-panel");
      this._uiSchemaCleanup?.();
      this._uiSchemaCleanup = _0x4ecb3e ? bindUiSchemaFieldControls(_0x157b8e, {
        getNodeData: () => this._getDreaminaEffectiveNodeData(_0x35358e.getState?.().nodes?.[this.nodeId] || this._data || {}),
        commitFieldValue: (_0x5580e1, _0x38729d, _0x8f8d79) => this._commitDreaminaSchemaField(_0x5580e1, _0x38729d, _0x8f8d79)
      }) : bindModelUiSchemaControls(_0x157b8e, {
        nodeId: this.nodeId,
        nodeData: this._data,
        store: _0x35358e,
        decorateNodeData: _0x4eee55 => this._getRhVideoAdvancedSchemaNodeData(_0x4eee55),
        buildPatch: (_0x291907, _0x4b6061, _0x2239c2, _0x43bd32) => {
          const _0x424b88 = String(_0x4b6061 || "").trim();
          const _0x383b44 = _0x35358e.getState?.() || {};
          const _0x5b35a9 = getManifestInputPolicyEdgeIdsToRemove({
            latest: _0x291907,
            fieldId: _0x424b88,
            value: _0x2239c2,
            inEdges: _0x35358e.getIncomingEdges?.(this.nodeId) || [],
            nodes: _0x383b44.nodes || {}
          });
          const _0x1b4e7 = Array.isArray(_0x5b35a9) ? _0x5b35a9 : [];
          if (_0x1b4e7.length > 0) {
            const _0x5ad440 = () => {
              _0x1b4e7.forEach(_0x561bea => _0x35358e.removeEdge?.(_0x561bea));
            };
            if (typeof _0x35358e.batch === "function") {
              _0x35358e.batch(_0x5ad440);
            } else {
              _0x5ad440();
            }
          }
          return {
            ...buildRhWorkflowFieldPatch(_0x291907, _0x4b6061, _0x2239c2, _0x43bd32),
            ...this._buildModelApiAspectRatioDisplayPatch(_0x291907, _0x4b6061, _0x2239c2, _0x43bd32),
            ...this._buildRunningHubWorkflowAspectRatioDisplayPatch(_0x291907, _0x4b6061, _0x2239c2, _0x43bd32)
          };
        },
        afterCommit: (_0x196827, _0x4ff02f, _0x49cfb8) => {
          const _0x254092 = String(_0x196827 || "").trim();
          const _0x24663a = getPanelModelManifest(_0x49cfb8);
          const _0x17de8c = manifestHelpVariantsReferenceField(_0x24663a, _0x254092);
          const _0x1b856b = manifestPromptVariantsReferenceField(_0x24663a, _0x254092);
          const _0x1f21a0 = manifestFixedSlotVisibilityReferencesField(_0x24663a, _0x254092);
          if (_0x17de8c || _0x1b856b || _0x1f21a0) {
            this._data = {
              ...(this._data || {}),
              ...(_0x49cfb8 || {})
            };
            if (_0x17de8c) {
              this._syncGenerationNodeHelpTip?.();
            }
            if (_0x1b856b) {
              this._syncDreaminaPromptPlaceholder?.(this._data);
            }
            if (_0x1f21a0) {
              this._renderRefBar?.();
            }
            this._updateSubmitButtonState?.();
          }
        }
      });
      this._footerControllerCleanup?.();
      this._footerControllerCleanup = bindNodeFooterController(_0x157b8e);
      if ((_0x513ec6 && !_0x1d23a9 || _0x6d0014) && this.rhVramAdvPanelEl) {
        this.rhVramAdvPanelEl.classList.add("show");
      }
      this.btnEl = _0x157b8e.querySelector(".img-gen-btn");
      this._bindFooterEvents(_0x157b8e);
    }
    _ensureVideoAdvancedPanel(_0x246e4b) {
      if (!_0x246e4b) {
        return null;
      }
      const _0x512685 = (this.rhVramAdvPanelEl && (typeof _0x246e4b.contains !== "function" || _0x246e4b.contains(this.rhVramAdvPanelEl)) ? this.rhVramAdvPanelEl : null) || _0x246e4b.querySelector?.(".rh-vram-adv-panel");
      const _0x42d3e7 = _0x35358e.getState?.().nodes?.[this.nodeId] || this._data || {};
      const _0x34002f = isRhAiAppPanelModel(_0x42d3e7);
      const _0x3dbb2d = isCustomAiAppManifest(getPanelModelManifest(_0x42d3e7));
      if (!this._hasVisibleVideoAdvancedControls(_0x42d3e7)) {
        _0x512685?.classList?.remove("show", RH_AI_APP_PERSISTENT_ADVANCED_CLASS);
        return null;
      }
      if (_0x512685) {
        this.rhVramAdvPanelEl = _0x512685;
        _0x512685.classList.toggle(RH_AI_APP_PERSISTENT_ADVANCED_CLASS, _0x3dbb2d);
        if (_0x3dbb2d) {
          _0x512685.classList.add("show");
        }
        if (_0x34002f && !_0x3dbb2d) {
          _0x512685.classList.remove("show");
        }
        return _0x512685;
      }
      const _0x1dcce1 = this._renderVideoAdvancedControlsHtml(_0x42d3e7);
      _0x246e4b.insertAdjacentHTML?.("beforeend", "\n          <div class=\"rh-vram-adv-panel" + (_0x3dbb2d ? " show " + RH_AI_APP_PERSISTENT_ADVANCED_CLASS : "") + "\">\n            " + _0x1dcce1 + "\n          </div>\n        ");
      this.rhVramAdvPanelEl = _0x246e4b.querySelector?.(".rh-vram-adv-panel") || null;
      return this.rhVramAdvPanelEl;
    }
    _runVipRetryOnce(_0x462f18) {
      let _0x3a40e8 = false;
      return () => {
        if (_0x3a40e8) {
          return;
        }
        _0x3a40e8 = true;
        this._vipSelectionRetryInProgress = true;
        try {
          _0x462f18();
        } finally {
          this._vipSelectionRetryInProgress = false;
        }
      };
    }
    _guardVipSelection(_0x3fc640, _0x21593d = null, _0x38bf31 = null) {
      return true;
    }
    _bindFooterEvents(_0x4e7cdc) {
      const _0x8fbfc5 = _0x4e7cdc.querySelector(".img-model-btn-trigger");
      const _0x559748 = _0x4e7cdc.querySelector(".img-model-menu");
      const _0x1e3fb1 = {
        listenConfigChanges: false,
        getProviderProfileId: () => {
          const _0xfea71a = _0x35358e.getState?.()?.nodes?.[this.nodeId] || this._data || {};
          return _0xfea71a.providerProfileId || _0xfea71a.rhProviderProfileId || "";
        }
      };
      this._modelCredentialMenuCleanup?.();
      this._modelCredentialMenuCleanup = bindModelCredentialMenu(_0x559748, _0x1e3fb1);
      const _0x4e6c72 = _0x4e7cdc.querySelector(".dreamina-task-model-btn");
      const _0x1ed8bc = _0x4e7cdc.querySelector(".dreamina-task-model-menu");
      const _0x4d85c0 = _0x4e7cdc.querySelector(".img-ratio-btn:not([data-ui-schema-menu-trigger])");
      const _0x1a98fd = _0x4e7cdc.querySelector(".img-ratio-popup");
      const _0x1b6dc7 = _0x4e7cdc.querySelector(".img-ratio-label");
      const _0x75ffdc = _0x4e7cdc.querySelector(".img-ratio-icon-slot");
      const _0x396b3b = _0x4e7cdc.querySelector(".vid-mode-btn");
      const _0x9eed77 = _0x4e7cdc.querySelector(".vid-mode-menu");
      const _0x45eda0 = _0x4e7cdc.querySelector(".vid-mode-label");
      const _0xebd143 = _0x4e7cdc.querySelector(".vid-duration-btn");
      const _0x229a3c = _0x4e7cdc.querySelector(".vid-duration-pop");
      const _0x5e913b = _0x4e7cdc.querySelector(".vid-duration-slider");
      const _0x433664 = _0x4e7cdc.querySelector(".vid-duration-label");
      const _0x52f4c9 = _0x4e7cdc.querySelector(".rh-adv2-btn");
      const _0x314413 = () => this._ensureVideoAdvancedPanel(_0x4e7cdc);
      const _0x1498d8 = () => {
        _0x1a98fd?.classList.remove("show");
      };
      const _0x57c0ae = () => {
        _0x229a3c?.classList.remove("show");
      };
      const _0x2235c1 = this._isDreaminaVideoNode(this._data);
      const _0x28ec2c = _0x2235c1 ? this._getDreaminaEffectiveNodeData(this._data) : this._getRhVideoAdvancedSchemaNodeData(this._data);
      syncModelUiSchemaControls(_0x4e7cdc, _0x28ec2c);
      const _0x1a88f5 = _0x4cfdfd => {
        const _0x5eea91 = _0x35358e.getState().nodes?.[this.nodeId] || this._data || {};
        const {
          payload: _0x15ade6,
          displayPatch = {}
        } = buildGenerationModelSelectionPayload({
          payload: _0x4cfdfd,
          store: _0x35358e,
          nodeId: this.nodeId,
          nodeData: _0x5eea91,
          fallbackNodeData: this._data,
          minSide: _0x12374a().width,
          inputKinds: ["image", "video"],
          resultMediaElement: this.videoEl,
          resultFields: VIDEO_DISPLAY_RATIO_RESULT_FIELDS
        });
        if (Object.keys(displayPatch).length > 0) {
          applyImageSchemaRatioResizeAnimation(this, {
            nodeId: this.nodeId,
            previewEl: this.previewEl,
            nodeData: _0x5eea91,
            patch: displayPatch
          });
        }
        const _0x4ab10d = {
          ...(_0x35358e.getState().nodes?.[this.nodeId] || this._data || {}),
          ..._0x15ade6
        };
        _0x35358e.updateNodeData(this.nodeId, _0x15ade6);
        this._data = _0x4ab10d;
        this._lastFooterSig = "";
        this._renderFooter(_0x4e7cdc);
        return _0x4ab10d;
      };
      const _0xcfd5d8 = () => _0x35358e.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x2a79e2 = ({
        model: _0x4e8ba8,
        provider: _0x13e531,
        useRememberedRouteModel = false
      } = {}) => {
        const _0x2d1dee = String(_0x4e8ba8 || "").trim();
        if (!_0x2d1dee) {
          return null;
        }
        const _0x931630 = _0xcfd5d8();
        const _0x2b7a00 = this._getDreaminaEffectiveNodeData(_0x931630);
        const _0x566ce4 = this._syncDreaminaTaskState(_0x931630, {
          syncStore: false
        });
        const _0x3ec899 = _0x566ce4?.nodeData || _0x2b7a00 || _0x931630;
        const _0x5f38a8 = resolveDreaminaStyleVideoProvider(_0x2d1dee, _0x13e531 || _0x3ec899?.provider || "dreamina");
        const _0x23d7aa = _0x566ce4?.resolvedTaskType || this._getResolvedDreaminaTaskType(_0x3ec899, _0x566ce4?.summary);
        const _0xd89d59 = _0x566ce4?.routeMode || normalizeDreaminaVideoRouteMode(_0x3ec899?.dreaminaRouteMode, _0x3ec899?.mode);
        const _0x5bd9f9 = ensureDreaminaStyleVideoModelForTask(_0x23d7aa, _0x2d1dee, _0x5f38a8) || _0x2d1dee;
        const _0x5d7132 = useRememberedRouteModel ? resolveDreaminaRememberedRouteModel(_0x3ec899, {
          provider: _0x5f38a8,
          routeMode: _0xd89d59,
          taskType: _0x23d7aa,
          fallbackModel: _0x5bd9f9
        }) || _0x5bd9f9 : _0x5bd9f9;
        const _0x487b06 = normalizeDreaminaStyleVideoResolution(_0x23d7aa, _0x5d7132, _0x3ec899?.resolution || _0x3ec899?.videoSize, _0x5f38a8);
        const _0xaf9c75 = normalizeDreaminaStyleVideoDuration(_0x23d7aa, _0x5d7132, _0x3ec899?.duration, _0x5f38a8);
        const _0x19860c = {
          provider: _0x5f38a8,
          model: _0x5d7132
        };
        return _0x1a88f5({
          ..._0x19860c,
          ...this._buildDreaminaModelSelectionParamPatch(_0x3ec899, {
            model: _0x5d7132,
            provider: _0x5f38a8,
            taskType: _0x23d7aa,
            fallbackValues: {
              dreaminaRouteMode: _0xd89d59,
              aspectRatio: _0x3ec899?.aspectRatio,
              ...(_0x487b06 ? {
                resolution: _0x487b06
              } : {}),
              duration: _0xaf9c75
            }
          })
        });
      };
      let _0x21f2be = null;
      const _0x56bb12 = () => {
        if (!_0x559748) {
          return null;
        }
        const _0x19e12a = _0xcfd5d8();
        const _0xb1eccc = String(_0x19e12a?.model || this._data?.model || "").trim() || getDefaultVideoModelId();
        const _0x13fd72 = document.createElement("template");
        _0x13fd72.innerHTML = this._buildVideoModelMenuHtml(_0xb1eccc).trim();
        const _0x186644 = _0x13fd72.content.firstElementChild;
        _0x559748.innerHTML = _0x186644?.innerHTML || "";
        _0x559748.dataset.lazyMounted = "1";
        _0x559748.dataset.nodeMenuKind = _0x186644?.dataset?.nodeMenuKind || "video";
        _0x21f2be?.();
        _0x21f2be = bindNodeSubmenus(_0x559748);
        return _0x559748;
      };
      if (_0x8fbfc5 && _0x559748) {
        _0x8fbfc5.addEventListener("click", _0x9abce8 => {
          _0x9abce8.stopPropagation();
          const _0x428fba = _0x56bb12();
          if (!_0x428fba) {
            return;
          }
          syncModelCredentialMenu(_0x428fba, _0x1e3fb1);
          const _0x5e7efe = !_0x428fba.classList.contains("show");
          closeNodeFooterMenus(_0x4e7cdc, _0x559748);
          _0x1ed8bc?.classList.remove("show");
          _0x428fba.classList.toggle("show", _0x5e7efe);
          if (_0x5e7efe) {
            _0x54438a(_0x428fba);
          }
        });
      }
      if (_0x4d85c0 && _0x1a98fd) {
        bindVideoPanelClick(_0x4d85c0, "ratio-trigger", _0x332446 => {
          _0x332446.stopPropagation();
          if (_0x4d85c0.disabled || !String(_0x1a98fd.innerHTML || "").trim()) {
            return;
          }
          _0x1a98fd.classList.toggle("show");
          _0x559748.classList.remove("show");
          _0x1ed8bc?.classList.remove("show");
          if (_0x9eed77) {
            _0x9eed77.classList.remove("show");
          }
          _0x57c0ae();
          _0x314413()?.classList.remove("show");
        });
      }
      if (_0x4e6c72 && _0x1ed8bc) {
        bindVideoPanelClick(_0x4e6c72, "dreamina-task-model-trigger", _0x147a6f => {
          _0x147a6f.stopPropagation();
          if (_0x4e6c72.disabled) {
            return;
          }
          _0x1ed8bc.classList.toggle("show");
          _0x559748.classList.remove("show");
          _0x1498d8();
          if (_0x9eed77) {
            _0x9eed77.classList.remove("show");
          }
          _0x57c0ae();
          _0x314413()?.classList.remove("show");
          if (_0x1ed8bc.classList.contains("show")) {
            _0x54438a(_0x1ed8bc);
          }
        });
      }
      if (_0x396b3b && _0x9eed77) {
        bindVideoPanelClick(_0x396b3b, "mode-trigger", _0x1ef81f => {
          _0x1ef81f.stopPropagation();
          _0x9eed77.classList.toggle("show");
          _0x559748.classList.remove("show");
          _0x1ed8bc?.classList.remove("show");
          _0x1498d8();
          _0x57c0ae();
          _0x314413()?.classList.remove("show");
          if (_0x9eed77.classList.contains("show")) {
            _0x54438a(_0x9eed77);
          }
        });
      }
      if (_0xebd143 && _0x229a3c) {
        bindVideoPanelClick(_0xebd143, "duration-trigger", _0x4c40f7 => {
          _0x4c40f7.stopPropagation();
          _0x229a3c.classList.toggle("show");
          _0x559748.classList.remove("show");
          _0x1ed8bc?.classList.remove("show");
          _0x1498d8();
          if (_0x9eed77) {
            _0x9eed77.classList.remove("show");
          }
          _0x314413()?.classList.remove("show");
        });
      }
      const _0x419544 = () => {
        closeNodeFooterMenus(_0x4e7cdc);
      };
      _0x559748?.addEventListener("click", _0x292831 => {
        _0x292831.stopPropagation();
        const _0x5ab8a6 = _0x292831.target?.closest?.(".floating-menu-item");
        if (!_0x5ab8a6 || !_0x559748.contains(_0x5ab8a6)) {
          return;
        }
        if (_0x5ab8a6.hasAttribute("data-node-menu-submenu")) {
          return;
        }
        if (_0x5ab8a6.closest(".apimart-video-submenu")) {
          const _0x4ce6a2 = _0x5ab8a6.dataset.value || APIMART_DREAMINA_VIDEO_DEFAULT_MODEL;
          if (isApimartDreaminaVideoModel(_0x4ce6a2, "apimart")) {
            _0x2a79e2({
              model: _0x4ce6a2,
              provider: "apimart",
              useRememberedRouteModel: true
            });
            return;
          }
        }
        if (_0x5ab8a6.closest(".runninghub-submenu")) {
          if (_0x5ab8a6.dataset.disabled === "true") {
            window.showToast?.(videoPanelText("videoGenerationUnavailable"), "warn");
            _0x419544();
            return;
          }
          const _0x30751b = _0x5ab8a6.dataset.value;
          if (!_0x30751b) {
            return;
          }
          const _0x59b95d = this._runVipRetryOnce(() => _0x5ab8a6.click());
          if (!this._guardVipSelection(_0x30751b, _0x59b95d)) {
            _0x419544();
            return;
          }
          const _0x46a18e = _0x5ab8a6.dataset.provider || null;
          const _0x3bf705 = _0x35358e.getState().nodes?.[this.nodeId] || {};
          const _0x23a154 = {
            model: _0x30751b,
            provider: _0x46a18e,
            providerProfileId: _0x5ab8a6.dataset.credentialResolvedProviderProfileId || undefined
          };
          if (this._isRunninghubWorkflowModel(_0x30751b, _0x46a18e)) {
            Object.assign(_0x23a154, buildVideoWorkflowModelSelectionPatch(_0x3bf705, _0x30751b, {
              preserveMaskTouchedState: true,
              v54FpsOptions: getRhV54FpsOptions()
            }));
          } else {
            const _0x1886ae = resolveModelExecution(_0x30751b, {
              providerHint: _0x46a18e
            });
            if (_0x1886ae?.modelManifest?.kind === "video" && _0x1886ae?.modelManifest?.adapterType === "modelApi") {
              Object.assign(_0x23a154, buildVideoModelApiModelSelectionPatch(_0x3bf705, _0x1886ae.canonicalModelId || _0x30751b, _0x46a18e || _0x1886ae?.modelManifest?.provider || null, _0x23a154));
            }
          }
          _0x1a88f5(_0x23a154);
          return;
        }
        if (_0x5ab8a6.dataset.disabled === "true") {
          window.showToast?.(videoPanelText("videoGenerationUnavailable"), "warn");
          _0x419544();
          return;
        }
        const _0x36fdbb = _0x5ab8a6.dataset.value;
        if (!_0x36fdbb) {
          return;
        }
        const _0x4284ea = _0x5ab8a6.dataset.provider || "dreamina";
        if (isDreaminaStyleVideoModel(_0x36fdbb, _0x4284ea)) {
          const _0x46f6d4 = resolveDreaminaStyleVideoProvider(_0x36fdbb, _0x4284ea);
          const _0x58a384 = this._runVipRetryOnce(() => _0x5ab8a6.click());
          if (!this._guardVipSelection(_0x36fdbb, _0x46f6d4, _0x58a384)) {
            _0x419544();
            return;
          }
          _0x2a79e2({
            model: _0x36fdbb,
            provider: _0x46f6d4,
            useRememberedRouteModel: true
          });
          return;
        }
        const _0x5afa2c = this._runVipRetryOnce(() => _0x5ab8a6.click());
        if (!this._guardVipSelection(_0x36fdbb, _0x5afa2c)) {
          _0x419544();
          return;
        }
        const _0x10ddf6 = {
          model: _0x36fdbb
        };
        _0x10ddf6.provider = _0x5ab8a6.dataset.provider || null;
        const _0x5c1b28 = _0x35358e.getState().nodes?.[this.nodeId] || {};
        if (this._isRunninghubWorkflowModel(_0x36fdbb, _0x10ddf6.provider)) {
          Object.assign(_0x10ddf6, buildVideoWorkflowModelSelectionPatch(_0x5c1b28, _0x36fdbb, {
            v54FpsOptions: getRhV54FpsOptions()
          }));
        } else {
          const _0x5646bf = resolveModelExecution(_0x36fdbb, {
            providerHint: _0x10ddf6.provider
          });
          if (_0x5646bf?.modelManifest?.kind === "video" && _0x5646bf?.modelManifest?.adapterType === "modelApi") {
            Object.assign(_0x10ddf6, buildVideoModelApiModelSelectionPatch(_0x5c1b28, _0x5646bf.canonicalModelId || _0x36fdbb, _0x10ddf6.provider || _0x5646bf?.modelManifest?.provider || null, _0x10ddf6));
          }
        }
        if (_0x36fdbb.includes("seedance") && (!this._data.resolution || this._data.resolution !== "720p")) {
          _0x10ddf6.resolution = "720p";
        }
        _0x1a88f5(_0x10ddf6);
      });
      _0x1ed8bc?.querySelectorAll(".floating-menu-item").forEach(_0x391400 => bindVideoPanelClick(_0x391400, "dreamina-task-model-item", () => {
        if (_0x391400.dataset.disabled === "true") {
          window.showToast?.(videoPanelText("smartMultiframeUnavailable"), "warn");
          _0x1ed8bc.classList.remove("show");
          return;
        }
        const _0x1d8514 = String(_0x391400.dataset.value || "").trim();
        if (!_0x1d8514) {
          return;
        }
        const _0x4e53c8 = resolveDreaminaStyleVideoProvider(_0x1d8514, _0x391400.dataset.provider || this._data?.provider || "dreamina");
        const _0x5e80b9 = this._runVipRetryOnce(() => _0x391400.click());
        if (!this._guardVipSelection(_0x1d8514, _0x4e53c8, _0x5e80b9)) {
          _0x1ed8bc.classList.remove("show");
          return;
        }
        _0x2a79e2({
          model: _0x1d8514,
          provider: _0x4e53c8,
          useRememberedRouteModel: false
        });
      }));
      if (_0x52f4c9) {
        bindVideoPanelClick(_0x52f4c9, "rh-advanced-trigger", _0x18476e => {
          _0x18476e.stopPropagation();
          const _0x372a1f = _0x314413();
          if (!_0x372a1f) {
            return;
          }
          const _0x4a87be = !_0x372a1f.classList.contains("show");
          _0x372a1f.classList.toggle("show", _0x4a87be);
          _0x559748.classList.remove("show");
          _0x1498d8();
          if (_0x9eed77) {
            _0x9eed77.classList.remove("show");
          }
          _0x57c0ae();
        });
        const _0x4bd92b = _0x314413();
        if (_0x4bd92b) {
          bindVideoPanelClick(_0x4bd92b, "rh-advanced-panel-stop", _0x79864 => _0x79864.stopPropagation());
        }
      }
      if (_0x9eed77 && _0x45eda0) {
        _0x9eed77.querySelectorAll(".floating-menu-item").forEach(_0x4fc1ef => bindVideoPanelClick(_0x4fc1ef, "mode-item", () => {
          if (_0x2235c1) {
            const _0x5987d7 = normalizeDreaminaVideoRouteMode(_0x4fc1ef.dataset.routeMode || _0x4fc1ef.dataset.value);
            if (!_0x5987d7) {
              return;
            }
            this._commitDreaminaRouteMode(_0x5987d7, this._data);
            _0x9eed77.classList.remove("show");
            return;
          }
          const _0x5eb7db = _0x4fc1ef.dataset.value;
          _0x35358e.updateNodeData(this.nodeId, {
            mode: _0x5eb7db
          });
          _0x45eda0.textContent = getVideoModeLabel(_0x5eb7db);
          _0x9eed77.classList.remove("show");
          _0x9eed77.querySelectorAll(".floating-menu-item").forEach(_0x352cb3 => _0x352cb3.classList.toggle("active", _0x352cb3 === _0x4fc1ef));
        }));
      }
      if (_0x2235c1 && _0x9eed77) {
        const _0x51bbd1 = () => {
          const _0x15dff4 = [];
          _0x9eed77.querySelectorAll(".dreamina-transition-prompt").forEach(_0x2af728 => {
            const _0x4ace50 = Number(_0x2af728.dataset.index);
            if (Number.isFinite(_0x4ace50)) {
              _0x15dff4[_0x4ace50] = _0x2af728.value;
            }
          });
          const _0x2005d8 = [];
          _0x9eed77.querySelectorAll(".dreamina-transition-duration").forEach(_0x579759 => {
            const _0x1a2c86 = Number(_0x579759.dataset.index);
            if (Number.isFinite(_0x1a2c86)) {
              _0x2005d8[_0x1a2c86] = _0x579759.value;
            }
          });
          _0x35358e.updateNodeData(this.nodeId, {
            dreaminaTransitionPrompts: _0x15dff4,
            dreaminaTransitionDurations: _0x2005d8
          });
        };
        _0x9eed77.querySelectorAll(".dreamina-transition-prompt").forEach(_0x53161f => {
          _0x53161f.addEventListener("input", _0x51bbd1);
          _0x53161f.addEventListener("click", _0x4bf81b => _0x4bf81b.stopPropagation());
        });
        _0x9eed77.querySelectorAll(".dreamina-transition-duration").forEach(_0x1c804d => {
          _0x1c804d.addEventListener("input", _0x51bbd1);
          _0x1c804d.addEventListener("change", _0x51bbd1);
          _0x1c804d.addEventListener("click", _0x45f6ac => _0x45f6ac.stopPropagation());
        });
      }
      if (_0x5e913b && _0x433664) {
        bindVideoPanelInput(_0x5e913b, "duration-slider", () => {
          if (_0x2235c1) {
            const _0x58fc11 = this._syncDreaminaTaskState(this._data, {
              syncStore: false
            });
            const _0x3011d7 = _0x58fc11?.resolvedTaskType || this._getResolvedDreaminaTaskType();
            const _0x447086 = resolveDreaminaStyleVideoProvider(this._data?.model, this._data?.provider);
            const _0x5c4857 = ensureDreaminaStyleVideoModelForTask(_0x3011d7, this._data?.model, _0x447086);
            const _0x1e8192 = normalizeDreaminaStyleVideoDuration(_0x3011d7, _0x5c4857, _0x5e913b.value, _0x447086);
            _0x433664.textContent = _0x1e8192 + "S";
            this._commitDreaminaParamValues({
              duration: _0x1e8192
            }, this._data);
            return;
          }
          const _0x119c65 = _0x5e913b.value;
          _0x433664.textContent = _0x119c65 + "S";
          _0x35358e.updateNodeData(this.nodeId, {
            duration: parseInt(_0x119c65, 10)
          });
        });
      }
      if (_0x1b6dc7) {
        _0x1a98fd?.querySelectorAll(".img-rp-quality-item").forEach(_0x4f8d3f => bindVideoPanelClick(_0x4f8d3f, "ratio-quality-item", () => {
          if (_0x4f8d3f.hasAttribute("disabled")) {
            return;
          }
          if (_0x4f8d3f.closest("[data-ui-schema-field]")) {
            return;
          }
          if (_0x2235c1 && _0x4f8d3f.dataset.dreaminaKind === "resolution") {
            const _0x598378 = String(_0x4f8d3f.dataset.value || "").trim();
            if (!_0x598378) {
              return;
            }
            this._commitDreaminaParamValues({
              resolution: _0x598378
            }, this._data);
            const _0x902a95 = {
              ...this._getDreaminaEffectiveNodeData(_0x35358e.getState().nodes?.[this.nodeId] || this._data || {})
            };
            const _0x3227db = this._getDreaminaRatioDisplayState(_0x902a95);
            _0x1b6dc7.textContent = _0x3227db?.ratioLabelText || formatVideoRatioResolutionLabel(_0x902a95.aspectRatio || "1:1", _0x598378);
            if (_0x75ffdc) {
              _0x75ffdc.innerHTML = this._getRatioIconHTML(_0x3227db?.ratioIconLabel || _0x902a95.aspectRatio || "1:1");
            }
            const _0x3a3609 = _0x4f8d3f.parentElement;
            _0x3a3609?.querySelectorAll(".img-rp-quality-item").forEach(_0x363f02 => _0x363f02.classList.remove("active"));
            _0x4f8d3f.classList.add("active");
            return;
          }
          _0x35358e.updateNodeData(this.nodeId, {
            resolution: _0x4f8d3f.dataset.value
          });
          _0x1b6dc7.textContent = formatVideoRatioResolutionLabel(this._data.aspectRatio, _0x4f8d3f.dataset.value);
          const _0x45517b = _0x4f8d3f.parentElement;
          _0x45517b?.querySelectorAll(".img-rp-quality-item").forEach(_0x39e180 => _0x39e180.classList.remove("active"));
          _0x4f8d3f.classList.add("active");
        }));
      }
      const _0x303c31 = 280;
      const _0x183176 = _0x1187f6 => {
        const _0x6c4e4d = String(_0x1187f6 || "").trim();
        if (!_0x6c4e4d || _0x6c4e4d === "自适应") {
          return {
            w: 1,
            h: 1,
            label: "自适应"
          };
        }
        const _0xcf7d64 = _0x6c4e4d.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
        if (!_0xcf7d64) {
          return null;
        }
        return {
          w: parseFloat(_0xcf7d64[1]),
          h: parseFloat(_0xcf7d64[2]),
          label: _0xcf7d64[1] + ":" + _0xcf7d64[2]
        };
      };
      const _0x56dc1f = (_0x5bd326 = "", _0x70150e = false) => {
        const _0x3fc47f = String(_0x5bd326 || "").trim();
        const _0x47e598 = !!_0x70150e || _0x3fc47f === "自适应";
        _0x4e7cdc.querySelectorAll(".img-rp-ratio-item:not([data-ui-schema-value]),.img-rp-large-adaptive:not([data-ui-schema-value])").forEach(_0x49c3f2 => _0x49c3f2.classList.remove("active"));
        if (_0x47e598) {
          _0x4e7cdc.querySelector(".img-rp-large-adaptive:not([data-ui-schema-value])")?.classList.add("active");
          return;
        }
        _0x4e7cdc.querySelectorAll(".img-rp-ratio-item:not([data-ui-schema-value])").forEach(_0x38d9ab => _0x38d9ab.classList.toggle("active", String(_0x38d9ab.dataset.label || "").trim() === _0x3fc47f));
      };
      const _0x5ed8cd = (_0x43496a, _0x6a3383, _0xea3ebf, _0x423ecb = {}) => {
        const _0x14f5bc = _0x423ecb?.persistAspectRatio !== false;
        const _0x1aa3ea = _0x423ecb?.forceManualDisplaySize === true;
        const _0x3c597c = _0x35358e.getState().nodes?.[this.nodeId] || this._data || {};
        if (!_0x1aa3ea && _0x3c597c?.[GENERATION_MANUAL_DISPLAY_SIZE_FIELD] === true) {
          return;
        }
        const _0x4f87f5 = _0x252e83 => {
          const _0x3f969c = document.getElementById(this.nodeId);
          if (!_0x3f969c) {
            return;
          }
          _0x3f969c.classList.add("is-ratio-animating");
          if (this._ratioAnimTimer) {
            clearTimeout(this._ratioAnimTimer);
          }
          this._ratioAnimTimer = setTimeout(() => {
            const _0x51de57 = document.getElementById(this.nodeId);
            if (_0x51de57) {
              _0x51de57.classList.remove("is-ratio-animating");
            }
            this._ratioAnimTimer = null;
          }, _0x252e83 + 80);
        };
        const _0x2ad1ff = _0x3c597c.width || this._data.width || 300;
        const _0xa713f6 = _0x3c597c.height || this._data.height || 300;
        const _0x402cd2 = _0x12374a(_0x43496a, _0x6a3383);
        const _0x169e63 = _0x402cd2.width;
        const _0x1af0f2 = _0x402cd2.height;
        const _0x3afe9c = _0x169e63 - _0x2ad1ff;
        const _0xbac529 = _0x1af0f2 - _0xa713f6;
        if (_0x3afe9c !== 0 || _0xbac529 !== 0) {
          _0x4f87f5(_0x303c31);
        }
        const _0x4774b3 = {
          width: _0x169e63,
          height: _0x1af0f2,
          x: Math.round((_0x3c597c.x ?? this._data.x ?? 0) - _0x3afe9c / 2),
          y: Math.round((_0x3c597c.y ?? this._data.y ?? 0) - _0xbac529)
        };
        if (_0x1aa3ea) {
          _0x4774b3[GENERATION_MANUAL_DISPLAY_SIZE_FIELD] = false;
        }
        if (_0x14f5bc) {
          if (this._isDreaminaVideoNode(this._data)) {
            Object.assign(_0x4774b3, this._buildDreaminaParamPatch(this._data, {
              aspectRatio: _0xea3ebf
            }));
          } else {
            _0x4774b3.aspectRatio = _0xea3ebf;
          }
        }
        _0x35358e.updateNodeData(this.nodeId, _0x4774b3);
        const _0x1e8d85 = _0x35358e.getState().nodes?.[this.nodeId] || {
          ..._0x3c597c,
          ..._0x4774b3
        };
        this._data = _0x1e8d85;
        const _0x114b87 = this._getDreaminaRatioDisplayState(_0x1e8d85);
        const _0x40e887 = this.footerEl || _0x4e7cdc;
        const _0xbe08b2 = _0x114b87?.ratioLabelText || formatVideoRatioResolutionLabel(_0xea3ebf, _0x1e8d85.resolution || "1080p");
        const _0x59ae4f = this._getRatioIconHTML(_0x114b87?.ratioIconLabel || _0xea3ebf);
        syncLegacyVideoRatioFooter({
          footer: _0x40e887,
          fallbackLabel: _0x1b6dc7,
          fallbackIconSlot: _0x75ffdc,
          labelText: _0xbe08b2,
          iconHtml: _0x59ae4f
        });
        restoreLegacyVideoRatioPopupAfterSync({
          footer: _0x40e887,
          fallbackPopup: _0x1a98fd
        });
        if (!this.previewEl) {
          return;
        }
        this.previewEl.style.transition = "none";
        this.previewEl.style.transformOrigin = "bottom center";
        this.previewEl.style.transform = "scaleX(" + _0x2ad1ff / _0x169e63 + ") scaleY(" + _0xa713f6 / _0x1af0f2 + ")";
        this.previewEl.offsetWidth;
        if (this._ratioFlipAnim) {
          this._ratioFlipAnim.cancel();
        }
        const _0x3a6425 = "scaleX(" + _0x2ad1ff / _0x169e63 + ") scaleY(" + _0xa713f6 / _0x1af0f2 + ")";
        this._ratioFlipAnim = this.previewEl.animate([{
          transform: _0x3a6425
        }, {
          transform: "none"
        }], {
          duration: _0x303c31,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "forwards"
        });
        const _0x19350b = () => {
          this._ratioFlipAnim = null;
          this.previewEl.style.transformOrigin = "";
          this.previewEl.style.transform = "";
        };
        this._ratioFlipAnim.onfinish = _0x19350b;
        this._ratioFlipAnim.oncancel = _0x19350b;
      };
      const _0x1d9c7c = (_0x1ef703, _0x1e2c40 = {}) => {
        const _0x498758 = _0x183176(_0x1ef703);
        if (!_0x498758) {
          return;
        }
        _0x5ed8cd(_0x498758.w, _0x498758.h, _0x498758.label, _0x1e2c40);
        _0x56dc1f(_0x498758.label, false);
      };
      if (!_0x2235c1) {
        _0x4e7cdc.querySelectorAll(".img-rp-ratio-item:not([data-ui-schema-value])").forEach(_0x52e366 => bindVideoPanelClick(_0x52e366, "ratio-item", () => {
          if (_0x52e366.hasAttribute("disabled") || _0x52e366.classList.contains("disabled") || _0x52e366.getAttribute("aria-disabled") === "true") {
            return;
          }
          _0x1d9c7c(_0x52e366.dataset.label, {
            forceManualDisplaySize: true
          });
        }));
      }
      const _0x1526e2 = (_0x299b8f = {}) => {
        const _0x6da3bf = _0x35358e.getState();
        const _0x158eda = _0x6da3bf.nodes?.[this.nodeId];
        const _0x10e795 = String(_0x158eda?.model || "");
        const _0x1ea94d = getRunningHubVideoParameterPanelPolicy(_0x10e795).adaptiveRatio || {};
        let _0x2c31b0 = _0x35358e.getIncomingEdges(this.nodeId);
        if (_0x1ea94d.scopeTargetEdges === true) {
          _0x2c31b0 = _0x2c31b0.filter(_0x3f6a18 => _0x3f6a18?.targetId === this.nodeId);
        }
        _0x2c31b0 = _0x2c31b0.filter(_0x75a952 => {
          const _0xe46477 = String(_0x75a952?.refSlot || "").toLowerCase();
          if (_0xe46477.includes("mask")) {
            return false;
          }
          const _0x1bed19 = resolveEffectiveInputKind(_0x6da3bf.nodes?.[_0x75a952?.sourceId], _0x75a952);
          return _0x1bed19 === "image" || _0x1bed19 === "video";
        });
        const _0x1f12d2 = (_0x445bd1, _0x38424a) => {
          const _0x2a84de = Number(_0x445bd1);
          const _0xb90bab = Number(_0x38424a);
          if (!Number.isFinite(_0x2a84de) || !(_0x2a84de > 0)) {
            return false;
          }
          if (!Number.isFinite(_0xb90bab) || !(_0xb90bab > 0)) {
            return false;
          }
          _0x5ed8cd(_0x2a84de, _0xb90bab, "自适应", _0x299b8f);
          return true;
        };
        if (_0x2c31b0.length > 0) {
          const _0x105770 = resolveVideoAdaptiveRatioSource({
            inEdges: _0x2c31b0,
            nodes: _0x6da3bf.nodes,
            nodeData: _0x158eda,
            adaptivePolicy: _0x1ea94d
          });
          if (_0x105770.fallbackSquare) {
            _0x5ed8cd(1, 1, "自适应", _0x299b8f);
            return;
          }
          const _0x1bd1dd = _0x105770.edge;
          if (!_0x1bd1dd) {
            return;
          }
          const _0x5b4a70 = _0x1bd1dd.sourceId;
          const _0x80269b = _0x6da3bf.nodes[_0x5b4a70];
          const _0x2f2432 = getGenerationRatioSizeWithDom({
            nodeId: _0x5b4a70,
            nodeData: _0x80269b,
            edge: _0x1bd1dd,
            includeNodeFrame: true
          });
          if (_0x1f12d2(_0x2f2432?.width, _0x2f2432?.height)) {
            return;
          }
          const _0xaa5784 = String(_0x80269b?.type || "");
          const _0x22da11 = _0xaa5784 === "ai-video" || _0xaa5784 === "source-video" || _0xaa5784 === "video";
          if (_0x22da11) {
            const _0x1aec37 = _0x4d28c6(_0x5b4a70, "video");
            const _0x1b6fe7 = Number(_0x1aec37?.w || 0);
            const _0x14cbee = Number(_0x1aec37?.h || 0);
            if (_0x1f12d2(_0x1b6fe7, _0x14cbee)) {
              return;
            }
            const _0x3d4ac4 = Number(_0x1bd1dd?.sourceMediaW || 0);
            const _0x212260 = Number(_0x1bd1dd?.sourceMediaH || 0);
            if (_0x1f12d2(_0x3d4ac4, _0x212260)) {
              return;
            }
            const _0x383776 = Number(_0x80269b?.mainVideoIndex);
            const _0x5dc054 = Number.isFinite(_0x383776) ? Math.max(0, Math.trunc(_0x383776)) : 0;
            const _0x4b6e08 = Array.isArray(_0x80269b?.videos) ? _0x80269b.videos : [];
            let _0x42afef = _0x5dc054;
            const _0x4b055a = String(_0x1bd1dd?.sourceMediaKey || "").trim();
            if (_0x4b055a && _0x4b6e08.length) {
              const _0x5c5058 = _0x4b6e08.findIndex(_0x498615 => {
                const _0x1fd704 = String(_0x498615?.localPath || "").trim() || String(_0x498615?.videoUrl || "").trim();
                return _0x1fd704 === _0x4b055a;
              });
              if (_0x5c5058 >= 0) {
                _0x42afef = _0x5c5058;
              }
            }
            const _0x10756f = _0x4b6e08[_0x42afef];
            const _0x547554 = Number(_0x10756f?.videoWidth || 0);
            const _0x2818d0 = Number(_0x10756f?.videoHeight || 0);
            if (_0x1f12d2(_0x547554, _0x2818d0)) {
              return;
            }
            const _0x505fe3 = Number(_0x80269b?.selectedVideoWidth || 0);
            const _0x371595 = Number(_0x80269b?.selectedVideoHeight || 0);
            if (_0x1f12d2(_0x505fe3, _0x371595)) {
              return;
            }
            const _0x2c5690 = ++this._adaptiveSrcRetryToken;
            setTimeout(() => {
              if (_0x2c5690 !== this._adaptiveSrcRetryToken) {
                return;
              }
              const _0x4b42f6 = _0x35358e.getState().nodes?.[this.nodeId];
              if (!_0x4b42f6) {
                return;
              }
              const _0x201cef = this._getDreaminaEffectiveNodeData(_0x4b42f6);
              if (String(_0x201cef.aspectRatio || "自适应") !== "自适应") {
                return;
              }
              const _0x144ed2 = _0x35358e.getState().nodes?.[_0x5b4a70];
              if (_0x144ed2) {
                const _0x35f1a5 = Number(_0x1bd1dd?.sourceMediaW || 0);
                const _0x8d303d = Number(_0x1bd1dd?.sourceMediaH || 0);
                if (_0x1f12d2(_0x35f1a5, _0x8d303d)) {
                  return;
                }
                const _0x482a6a = Number(_0x144ed2.mainVideoIndex);
                const _0x1f5ed9 = Number.isFinite(_0x482a6a) ? Math.max(0, Math.trunc(_0x482a6a)) : 0;
                const _0xe44950 = Array.isArray(_0x144ed2.videos) ? _0x144ed2.videos : [];
                let _0x53369c = _0x1f5ed9;
                const _0x4e5320 = String(_0x1bd1dd?.sourceMediaKey || "").trim();
                if (_0x4e5320 && _0xe44950.length) {
                  const _0x324e4f = _0xe44950.findIndex(_0x57fdfb => {
                    const _0x518efb = String(_0x57fdfb?.localPath || "").trim() || String(_0x57fdfb?.videoUrl || "").trim();
                    return _0x518efb === _0x4e5320;
                  });
                  if (_0x324e4f >= 0) {
                    _0x53369c = _0x324e4f;
                  }
                }
                const _0x151151 = _0xe44950[_0x53369c];
                const _0x5ed216 = Number(_0x151151?.videoWidth || 0);
                const _0x61c193 = Number(_0x151151?.videoHeight || 0);
                if (_0x1f12d2(_0x5ed216, _0x61c193)) {
                  return;
                }
                const _0x36f0de = Number(_0x144ed2.selectedVideoWidth || 0);
                const _0x24c6b6 = Number(_0x144ed2.selectedVideoHeight || 0);
                if (_0x1f12d2(_0x36f0de, _0x24c6b6)) {
                  return;
                }
              }
              const _0x16c4f9 = _0x4d28c6(_0x5b4a70, "video");
              const _0x2a037d = Number(_0x16c4f9?.w || 0);
              const _0x3ff436 = Number(_0x16c4f9?.h || 0);
              if (_0x2a037d > 0 && _0x3ff436 > 0) {
                _0x5ed8cd(_0x2a037d, _0x3ff436, "自适应", _0x299b8f);
              }
            }, 160);
            _0x5ed8cd(1, 1, "自适应", _0x299b8f);
            return;
          }
          const _0x514acd = _0x4d28c6(_0x5b4a70, "image");
          const _0x3ac0c9 = Number(_0x514acd?.w || 0);
          const _0x1ebf04 = Number(_0x514acd?.h || 0);
          if (_0x1f12d2(_0x3ac0c9, _0x1ebf04)) {
            return;
          }
          if (_0x80269b) {
            const _0x13fd18 = Number(_0x80269b.width || 0);
            const _0x5a2730 = Number(_0x80269b.height || 0);
            if (_0x1f12d2(_0x13fd18, _0x5a2730)) {
              return;
            }
          }
          _0x5ed8cd(1, 1, "自适应", _0x299b8f);
          return;
        }
        const _0x470cb3 = Boolean(_0x158eda?.videos && _0x158eda.videos.length || _0x158eda?.localPath || _0x158eda?.thumbUrl || _0x158eda?.videoUrl || _0x158eda?.src);
        if (_0x470cb3) {
          const _0x323bbe = this.videoEl?.videoWidth || 0;
          const _0x5944a0 = this.videoEl?.videoHeight || 0;
          if (_0x1f12d2(_0x323bbe, _0x5944a0)) {
            return;
          }
          return;
        }
        _0x5ed8cd(1, 1, "自适应", _0x299b8f);
      };
      this._runAdaptiveRatio = (_0x4a5e99 = {}) => {
        const _0x4b1b0a = _0x35358e.getState().nodes?.[this.nodeId] || this._data || {};
        const _0x182c78 = _0x4e7cdc.querySelector(".img-rp-large-adaptive:not([data-ui-schema-value])");
        if (this._isDreaminaVideoNode(_0x4b1b0a)) {
          this._commitDreaminaSchemaAspectRatio("自适应", _0x4b1b0a, _0x4a5e99);
          _0x56dc1f("自适应", true);
          _0x182c78?.classList.add("active");
          return;
        }
        _0x1526e2(_0x4a5e99);
        _0x56dc1f("自适应", true);
        _0x182c78?.classList.add("active");
      };
      this._applyStoredAspectRatio = () => {
        const _0x32ed86 = _0x35358e.getState().nodes?.[this.nodeId] || this._data || {};
        const _0x39ff7a = this._getDreaminaRatioDisplayState(_0x32ed86);
        const _0x4c3931 = String(_0x39ff7a?.currentRatio || "").trim() || "自适应";
        if (_0x4c3931 === "自适应") {
          this._runAdaptiveRatio?.();
          return;
        }
        _0x1d9c7c(_0x4c3931, {
          persistAspectRatio: true
        });
      };
      this._applyDreaminaSchemaAspectRatio = _0x46e086 => {
        const _0x448fe1 = _0x35358e.getState().nodes?.[this.nodeId] || this._data || {};
        this._commitDreaminaSchemaAspectRatio(_0x46e086, _0x448fe1, {
          forceManualDisplaySize: true
        });
      };
      const _0x3622ef = _0x4e7cdc.querySelector(".img-rp-large-adaptive:not([data-ui-schema-value])");
      if (_0x3622ef && !_0x2235c1) {
        bindVideoPanelClick(_0x3622ef, "adaptive-ratio", () => this._runAdaptiveRatio({
          forceManualDisplaySize: true
        }));
      }
      bindVideoPanelClick(this.btnEl, "submit", () => {
        flushPromptHtmlCommit(this);
        this._handleGenerateOrCancel();
      });
      const _0x11f3be = _0x4e7cdc.querySelector(".debug-wrench-btn");
      _0x11f3be?.addEventListener("click", async _0x722d2c => {
        _0x722d2c.stopPropagation();
        flushPromptHtmlCommit(this);
        const _0x5a3c29 = await this._buildPayload();
        if (!_0x5a3c29) {
          window.showToast?.(videoPanelText("missingPromptOrReference"), "warn");
          return;
        }
        try {
          const _0x182759 = await _0x2f3aff.buildGenerateVideoRequest(_0x5a3c29);
          const _0x187af8 = formatFinalApiDebugRequest(_0x182759);
          const _0x122e39 = _0x35358e.getState();
          const _0x58368b = this._data.x + (this._data.width || 380) + 50;
          const _0x527ff2 = this._data.y;
          const _0x3e482e = getNodeDefaultSize("debug");
          let _0x407b26 = Object.values(_0x122e39.nodes).find(_0x513e28 => _0x513e28.type === "debug");
          if (!_0x407b26) {
            _0x35358e.addNode({
              id: "debug-" + Date.now(),
              type: "debug",
              x: _0x58368b,
              y: _0x527ff2,
              ..._0x3e482e,
              name: videoPanelText("debugNodeName"),
              outputText: _0x187af8
            });
          } else {
            _0x35358e.updateNodeData(_0x407b26.id, {
              outputText: _0x187af8,
              x: _0x58368b,
              y: _0x527ff2
            });
          }
          window.showToast?.(videoPanelText("debugParamsShown"), "warn");
        } catch (_0x530c62) {
          showRunningHubMediaUploadGuideForError(_0x530c62);
          window.showToast?.(videoPanelText("buildRequestFailed", {
            error: _0x530c62.message
          }), "error");
        } finally {
          releasePayloadObjectUrlLease(_0x5a3c29);
        }
      });
      if (!this._docClickBound) {
        document.addEventListener("click", () => {
          if (this._suppressDocClickOnce) {
            this._suppressDocClickOnce = false;
            return;
          }
          const _0x369c42 = this.footerEl;
          if (!_0x369c42) {
            return;
          }
          closeNodeFooterMenus(_0x369c42);
          _0x369c42.querySelector(".img-model-menu")?.classList.remove("show");
          _0x369c42.querySelector(".dreamina-task-model-menu")?.classList.remove("show");
          const _0x31479d = _0x369c42.querySelector(".img-ratio-popup");
          _0x31479d?.classList.remove("show");
          _0x369c42.querySelector(".vid-mode-menu")?.classList.remove("show");
          const _0x3aecd1 = _0x369c42.querySelector(".vid-duration-pop");
          _0x3aecd1?.classList.remove("show");
          const _0x20ed86 = _0x369c42.querySelector(".rh-vram-adv-panel");
          if (!_0x20ed86?.classList?.contains?.(RH_AI_APP_PERSISTENT_ADVANCED_CLASS)) {
            _0x20ed86?.classList.remove("show");
          }
        });
        this._docClickBound = true;
      }
      if (_0x1a98fd) {
        bindVideoPanelClick(_0x1a98fd, "ratio-popup-stop", _0x6041f5 => _0x6041f5.stopPropagation());
      }
      if (_0x229a3c) {
        bindVideoPanelClick(_0x229a3c, "duration-popup-stop", _0x20923e => _0x20923e.stopPropagation());
      }
      if (_0x9eed77) {
        bindVideoPanelClick(_0x9eed77, "mode-menu-stop", _0x24b2d7 => _0x24b2d7.stopPropagation());
      }
      if (_0x1ed8bc) {
        bindVideoPanelClick(_0x1ed8bc, "dreamina-task-model-menu-stop", _0x4a63e7 => _0x4a63e7.stopPropagation());
      }
    }
    _isDreaminaVideoNode(_0xf011ca = this._data) {
      return isDreaminaStyleVideoModel(_0xf011ca?.model, _0xf011ca?.provider);
    }
    _getDreaminaEffectiveNodeData(_0x2498bd = this._data) {
      return getDreaminaEffectiveNodeData(_0x2498bd);
    }
    _buildDreaminaParamPatch(_0xc4190c = this._data, _0x522181 = {}) {
      return buildDreaminaParamPatch(_0xc4190c, _0x522181);
    }
    _buildDreaminaModelSelectionParamPatch(_0x20ca37 = this._data, _0x34ebaa = {}) {
      return buildDreaminaModelSelectionParamPatch(_0x20ca37, _0x34ebaa);
    }
    _commitDreaminaParamValues(_0x1d4b23 = {}, _0x248eb2 = this._data, _0x494826 = {}) {
      const _0x32cd5d = this._getDreaminaEffectiveNodeData(_0x248eb2) || this._getDreaminaEffectiveNodeData(_0x35358e.getState().nodes?.[this.nodeId] || this._data || {});
      const _0x4c3d30 = {
        ..._0x32cd5d,
        ..._0x494826
      };
      const _0x2e272b = this._buildDreaminaParamPatch(_0x4c3d30, _0x1d4b23);
      const _0x4f27a8 = {
        ...(_0x494826 && typeof _0x494826 === "object" ? _0x494826 : {}),
        ..._0x2e272b
      };
      _0x35358e.updateNodeData(this.nodeId, _0x4f27a8);
      this._data = this._getDreaminaEffectiveNodeData({
        ..._0x32cd5d,
        ..._0x4f27a8
      });
      return this._data;
    }
    _commitDreaminaRouteMode(_0x36e890, _0x1235ad = this._data) {
      const _0x208e65 = _0x35358e.getState();
      const _0x22ae60 = buildDreaminaRouteModeUpdate({
        nextRouteMode: _0x36e890,
        baseNodeData: _0x1235ad,
        incoming: _0x35358e.getIncomingEdges(this.nodeId) || [],
        nodes: _0x208e65.nodes || {}
      });
      if (_0x22ae60.disabled) {
        window.showToast?.(videoPanelText("smartMultiframeUnavailable"), "warn");
        this._data = _0x22ae60.nodeData;
        return this._data;
      }
      const _0x1cfb76 = Array.isArray(_0x22ae60.edgeIdsToRemove) ? _0x22ae60.edgeIdsToRemove : [];
      const _0x491f84 = _0x22ae60.patch || {};
      if (_0x1cfb76.length > 0 || Object.keys(_0x491f84).length > 0) {
        _0x35358e.batch(() => {
          _0x1cfb76.forEach(_0x5cbfac => _0x35358e.removeEdge(_0x5cbfac));
          if (Object.keys(_0x491f84).length > 0) {
            _0x35358e.updateNodeData(this.nodeId, _0x491f84);
          }
        });
      }
      this._data = _0x22ae60.nodeData || this._getDreaminaEffectiveNodeData({
        ..._0x1235ad,
        ..._0x491f84
      });
      return this._data;
    }
    _commitDreaminaSchemaField(_0x19adfa, _0x2fedb1, _0x4bdfc4 = this._data) {
      const _0x45e369 = String(_0x19adfa || "").trim();
      const _0x2ce083 = this._getDreaminaEffectiveNodeData(_0x4bdfc4);
      if (_0x45e369 === "dreaminaRouteMode") {
        return this._commitDreaminaRouteMode(_0x2fedb1, _0x2ce083);
      }
      const _0x14c4d5 = this._getResolvedDreaminaTaskType(_0x2ce083);
      const _0x6028e4 = resolveDreaminaStyleVideoProvider(_0x2ce083?.model, _0x2ce083?.provider);
      const _0x3b74b6 = ensureDreaminaStyleVideoModelForTask(_0x14c4d5, _0x2ce083?.model, _0x6028e4);
      if (_0x45e369 === "resolution") {
        const _0x2ba415 = normalizeDreaminaStyleVideoResolution(_0x14c4d5, _0x3b74b6, _0x2fedb1, _0x6028e4);
        return this._commitDreaminaParamValues({
          resolution: _0x2ba415
        }, _0x2ce083);
      }
      if (_0x45e369 === "duration") {
        const _0x7bbc20 = normalizeDreaminaStyleVideoDuration(_0x14c4d5, _0x3b74b6, _0x2fedb1, _0x6028e4);
        return this._commitDreaminaParamValues({
          duration: _0x7bbc20
        }, _0x2ce083);
      }
      if (_0x45e369 === "aspectRatio") {
        return this._commitDreaminaSchemaAspectRatio(_0x2fedb1, _0x2ce083, {
          forceManualDisplaySize: true
        });
      }
      return _0x2ce083;
    }
    _normalizeDreaminaNodeData(_0x28d7d9, _0xe76e2b = {}) {
      const _0x573c40 = _0xe76e2b?.syncStore !== false;
      const _0x9f5163 = this._getDreaminaEffectiveNodeData(_0x28d7d9);
      const _0x36d263 = buildDreaminaStyleVideoNodeNormalizationPatch(_0x9f5163);
      if (!_0x36d263) {
        return _0x9f5163;
      }
      const _0x25cb7a = buildDreaminaStorePatchFromNormalization(_0x9f5163, _0x36d263);
      const _0x115e8a = this._getDreaminaEffectiveNodeData({
        ..._0x9f5163,
        ..._0x25cb7a
      });
      const _0x579da3 = readStoreState().nodes?.[this.nodeId];
      if (_0x573c40 && _0x579da3 && Object.keys(_0x25cb7a).length > 0) {
        _0x35358e.updateNodeData(this.nodeId, _0x25cb7a);
      }
      return _0x115e8a;
    }
    _getDreaminaReferenceSummary(_0x13e64b = this._data) {
      const _0x206903 = _0x35358e.getIncomingEdges(this.nodeId) || [];
      const _0x40f38e = readStoreState().nodes || {};
      const _0x442cf0 = [];
      for (const _0x54a8eb of _0x206903) {
        const _0x85f31a = _0x40f38e?.[_0x54a8eb.sourceId];
        if (!_0x85f31a) {
          continue;
        }
        const _0x26150d = String(_0x85f31a.type || "");
        let _0x22d801 = "";
        if (_0x26150d.includes("video")) {
          _0x22d801 = "video";
        } else if (_0x26150d.includes("audio")) {
          _0x22d801 = "audio";
        } else if (_0x26150d.includes("image")) {
          _0x22d801 = "image";
        } else if (_0x26150d.includes("text")) {
          _0x22d801 = "text";
        }
        if (!_0x22d801) {
          continue;
        }
        if (_0x22d801 === "image") {
          const _0x4165cb = !!_0x85f31a.thumbId || !!_0x85f31a.thumbUrl || !!_0x85f31a.imageUrl || !!_0x85f31a.src || !!_0x85f31a.localPath;
          if (!_0x4165cb) {
            continue;
          }
        } else if (_0x22d801 === "video") {
          const _0x125872 = Array.isArray(_0x85f31a.videos) && _0x85f31a.videos.length > 0 || !!_0x85f31a.thumbId || !!_0x85f31a.thumbUrl || !!_0x85f31a.videoUrl || !!_0x85f31a.src || !!_0x85f31a.localPath;
          if (!_0x125872) {
            continue;
          }
        } else if (_0x22d801 === "audio") {
          const _0x3424c4 = !!_0x85f31a.audioUrl || !!_0x85f31a.src || !!_0x85f31a.localPath;
          if (!_0x3424c4) {
            continue;
          }
        } else if (_0x22d801 === "text") {
          const _0x3a76f2 = !!String(_0x85f31a.outputText || _0x85f31a.text || _0x85f31a.content || "").trim();
          if (!_0x3a76f2) {
            continue;
          }
        }
        _0x442cf0.push({
          edgeId: String(_0x54a8eb.id || ""),
          sourceId: String(_0x54a8eb.sourceId || ""),
          kind: _0x22d801,
          refSlot: String(_0x54a8eb.refSlot || "")
        });
      }
      const _0x22c9c3 = _0x442cf0.filter(_0x20e09c => _0x20e09c.kind === "image");
      const _0xd43cc0 = _0x442cf0.filter(_0x44662b => _0x44662b.kind === "video");
      const _0x590955 = _0x442cf0.filter(_0x480a06 => _0x480a06.kind === "audio");
      const _0x2425ff = _0x442cf0.filter(_0x5043e3 => _0x5043e3.kind === "text");
      return {
        items: _0x442cf0,
        images: _0x22c9c3,
        videos: _0xd43cc0,
        audios: _0x590955,
        texts: _0x2425ff,
        imageCount: _0x22c9c3.length,
        videoCount: _0xd43cc0.length,
        audioCount: _0x590955.length,
        textCount: _0x2425ff.length,
        signature: _0x442cf0.map((_0x4a4132, _0x29b0b6) => _0x29b0b6 + ":" + _0x4a4132.edgeId + ":" + _0x4a4132.sourceId + ":" + _0x4a4132.kind + ":" + _0x4a4132.refSlot).join("|")
      };
    }
    _getResolvedDreaminaTaskType(_0x2c432d = this._data, _0x23d3ae = null) {
      if (!this._isDreaminaVideoNode(_0x2c432d)) {
        return "";
      }
      const _0x1a8560 = this._getDreaminaEffectiveNodeData(_0x2c432d);
      const _0x4f12cc = _0x23d3ae || this._getDreaminaReferenceSummary(_0x1a8560);
      return resolveDreaminaVideoTaskType({
        routeMode: normalizeDreaminaVideoRouteMode(_0x1a8560?.dreaminaRouteMode, _0x1a8560?.mode),
        imageCount: _0x4f12cc.imageCount,
        videoCount: _0x4f12cc.videoCount,
        audioCount: _0x4f12cc.audioCount
      });
    }
    _commitDreaminaSchemaAspectRatio(_0x175763, _0x901540 = this._data, _0x56c1d2 = {}) {
      const _0x22acbe = this._getDreaminaEffectiveNodeData(_0x901540);
      const _0x35c944 = _0x56c1d2?.forceManualDisplaySize === true;
      const _0x5a1b1c = normalizeDreaminaVideoAspectRatio(_0x175763, {
        preserveAdaptive: true
      });
      if (!_0x35c944 && _0x22acbe?.[GENERATION_MANUAL_DISPLAY_SIZE_FIELD] === true) {
        const _0x8f35f8 = this._buildDreaminaParamPatch(_0x22acbe, {
          aspectRatio: _0x5a1b1c
        });
        _0x35358e.updateNodeData(this.nodeId, _0x8f35f8);
        this._data = this._getDreaminaEffectiveNodeData({
          ..._0x22acbe,
          ..._0x8f35f8
        });
        return this._data;
      }
      const _0x539683 = buildImageSchemaAspectRatioDisplayPatch({
        store: _0x35358e,
        nodeId: this.nodeId,
        nodeData: _0x22acbe,
        fallbackNodeData: this._data,
        ratioValue: _0x5a1b1c,
        minSide: _0x12374a().width,
        inputKinds: ["image", "video"],
        resultMediaElement: this.videoEl,
        resultFields: VIDEO_DISPLAY_RATIO_RESULT_FIELDS
      });
      const _0x5e69fb = this._buildDreaminaParamPatch(_0x22acbe, {
        aspectRatio: _0x5a1b1c
      });
      const _0x592ff4 = {
        ...(_0x35c944 ? {
          [GENERATION_MANUAL_DISPLAY_SIZE_FIELD]: false
        } : {}),
        ..._0x539683,
        ..._0x5e69fb
      };
      applyImageSchemaRatioResizeAnimation(this, {
        nodeId: this.nodeId,
        previewEl: this.previewEl,
        nodeData: _0x22acbe,
        patch: _0x539683
      });
      _0x35358e.updateNodeData(this.nodeId, _0x592ff4);
      this._data = this._getDreaminaEffectiveNodeData({
        ..._0x22acbe,
        ..._0x592ff4
      });
      return this._data;
    }
    _buildModelApiAspectRatioDisplayPatch(_0x2eacd9, _0x485a7d, _0x36026f, _0x58f4f5 = {}) {
      const _0x2af967 = this._resolveModelExecution(_0x2eacd9?.model, _0x2eacd9?.provider);
      return buildVideoSchemaAspectRatioDisplayPatch({
        owner: this,
        store: _0x35358e,
        nodeId: this.nodeId,
        latestNodeData: _0x2eacd9,
        fallbackNodeData: this._data,
        resolved: _0x2af967,
        fieldId: _0x485a7d,
        value: _0x36026f,
        schemaPatch: _0x58f4f5,
        adapterType: "modelApi",
        minSide: _0x12374a().width,
        previewEl: this.previewEl,
        resultMediaElement: this.videoEl
      });
    }
    _buildRunningHubWorkflowAspectRatioDisplayPatch(_0x4593a3, _0x5c0bb9, _0x21940c, _0x1bed04 = {}) {
      const _0xc65e5d = this._resolveModelExecution(_0x4593a3?.model, _0x4593a3?.provider);
      return buildVideoSchemaAspectRatioDisplayPatch({
        owner: this,
        store: _0x35358e,
        nodeId: this.nodeId,
        latestNodeData: _0x4593a3,
        fallbackNodeData: this._data,
        resolved: _0xc65e5d,
        fieldId: _0x5c0bb9,
        value: _0x21940c,
        schemaPatch: _0x1bed04,
        adapterType: "workflow",
        minSide: _0x12374a().width,
        previewEl: this.previewEl,
        resultMediaElement: this.videoEl
      });
    }
    _getDreaminaRatioDisplayState(_0x37bb91 = this._data, _0x3faa9e = null) {
      if (!this._isDreaminaVideoNode(_0x37bb91)) {
        return null;
      }
      const _0x1fdb3e = _0x3faa9e || this._syncDreaminaTaskState(_0x37bb91, {
        syncStore: false
      });
      const _0x57c1af = _0x1fdb3e?.nodeData || _0x37bb91;
      const _0x959b9c = _0x1fdb3e?.summary || this._getDreaminaReferenceSummary(_0x57c1af);
      const _0x4c367e = _0x1fdb3e?.resolvedTaskType || this._getResolvedDreaminaTaskType(_0x57c1af, _0x959b9c);
      const _0x1feb6b = ensureDreaminaStyleVideoModelForTask(_0x4c367e, _0x57c1af?.model, _0x57c1af?.provider) || normalizeDreaminaStyleVideoModel(_0x57c1af?.model, _0x57c1af?.provider);
      const _0x3dc690 = normalizeDreaminaStyleVideoResolution(_0x4c367e, _0x1feb6b, _0x57c1af?.resolution || _0x57c1af?.videoSize, _0x57c1af?.provider);
      const _0x1b8142 = String(_0x57c1af?.aspectRatio || "").trim();
      const _0x45c10e = _0x1b8142 === "自适应" || _0x1b8142 === "自适应" || _0x1b8142 === "auto" ? "自适应" : _0x1b8142 === "5:4" ? "4:3" : _0x1b8142 === "4:5" ? "3:4" : _0x1b8142 ? normalizeDreaminaVideoAspectRatio(_0x1b8142) : "自适应";
      const _0x22adce = getDreaminaStyleVideoResolutionOptions(_0x4c367e, _0x1feb6b, _0x57c1af?.provider);
      const _0x22c11a = Number(_0x959b9c?.imageCount || 0) > 0;
      return {
        nodeData: _0x57c1af,
        summary: _0x959b9c,
        resolvedTaskType: _0x4c367e,
        currentModel: _0x1feb6b,
        currentResolution: _0x3dc690,
        currentRatio: _0x45c10e,
        resolutionOptions: _0x22adce,
        hasImageRefs: _0x22c11a,
        ratioLabelText: formatVideoRatioResolutionLabel(_0x45c10e, _0x3dc690 || "720p"),
        ratioIconLabel: _0x45c10e
      };
    }
    _syncDreaminaTaskState(_0x5e911a = this._data, _0x3dd69b = {}) {
      if (!this._isDreaminaVideoNode(_0x5e911a)) {
        return {
          nodeData: _0x5e911a,
          summary: this._getDreaminaReferenceSummary(_0x5e911a),
          resolvedTaskType: "",
          routeMode: ""
        };
      }
      const _0x2da924 = _0x3dd69b?.syncStore !== false;
      let _0x4a13fe = this._normalizeDreaminaNodeData(_0x5e911a, {
        syncStore: _0x2da924
      });
      const _0x2bd000 = this._getDreaminaReferenceSummary(_0x4a13fe);
      const _0x217901 = normalizeDreaminaVideoRouteMode(_0x4a13fe?.dreaminaRouteMode, _0x4a13fe?.mode);
      const _0x2553ed = resolveDreaminaVideoTaskType({
        routeMode: _0x217901,
        imageCount: _0x2bd000.imageCount,
        videoCount: _0x2bd000.videoCount,
        audioCount: _0x2bd000.audioCount
      });
      const _0x2849f8 = {};
      if (_0x2553ed !== "multiframe2video") {
        const _0x1a2c62 = resolveDreaminaStyleVideoProvider(_0x4a13fe?.model, _0x4a13fe?.provider);
        const _0x2ffcfc = ensureDreaminaStyleVideoModelForTask(_0x2553ed, _0x4a13fe?.model, _0x1a2c62);
        if (_0x2ffcfc && _0x2ffcfc !== String(_0x4a13fe?.model || "").trim()) {
          _0x2849f8.model = _0x2ffcfc;
        }
        const _0x5c2f54 = normalizeDreaminaStyleVideoResolution(_0x2553ed, _0x2ffcfc || _0x4a13fe?.model, _0x4a13fe?.resolution || _0x4a13fe?.videoSize, _0x1a2c62);
        if (_0x5c2f54 && _0x5c2f54 !== String(_0x4a13fe?.resolution || "").trim()) {
          _0x2849f8.resolution = _0x5c2f54;
        }
        const _0x177dc4 = normalizeDreaminaStyleVideoDuration(_0x2553ed, _0x2ffcfc || _0x4a13fe?.model, _0x4a13fe?.duration, _0x1a2c62);
        if (Number(_0x177dc4) !== Number(_0x4a13fe?.duration)) {
          _0x2849f8.duration = _0x177dc4;
        }
      }
      if (_0x2bd000.imageCount <= 0) {
        const _0x3fc2ba = normalizeDreaminaVideoAspectRatio(_0x4a13fe?.aspectRatio, {
          preserveAdaptive: true
        });
        if (_0x3fc2ba !== String(_0x4a13fe?.aspectRatio || "").trim() && String(_0x4a13fe?.aspectRatio || "").trim()) {
          _0x2849f8.aspectRatio = _0x3fc2ba;
        }
      }
      if (_0x217901 !== String(_0x4a13fe?.dreaminaRouteMode || "").trim()) {
        _0x2849f8.dreaminaRouteMode = _0x217901;
      }
      const _0x3e0156 = resolveDreaminaStyleVideoProvider(_0x4a13fe?.model, _0x4a13fe?.provider);
      if (String(_0x4a13fe?.provider || "").trim().toLowerCase() !== _0x3e0156) {
        _0x2849f8.provider = _0x3e0156;
      }
      if (Object.keys(_0x2849f8).length > 0) {
        const _0x437b57 = buildDreaminaStorePatchFromNormalization(_0x4a13fe, _0x2849f8);
        _0x4a13fe = this._getDreaminaEffectiveNodeData({
          ..._0x4a13fe,
          ..._0x437b57
        });
        const _0x5856c3 = _0x35358e.getState().nodes?.[this.nodeId];
        if (_0x2da924 && _0x5856c3) {
          _0x35358e.updateNodeData(this.nodeId, _0x437b57);
        }
      }
      return {
        nodeData: _0x4a13fe,
        summary: _0x2bd000,
        resolvedTaskType: _0x2553ed,
        routeMode: _0x217901
      };
    }
    _syncDreaminaPromptPlaceholder(_0x1edb64 = this._data) {
      if (!this.promptEl) {
        return;
      }
      const _0x58aebb = this.promptEl.dataset ||= {};
      if (!this._isDreaminaVideoNode(_0x1edb64)) {
        const _0x1cdfc2 = this._resolveModelExecution(_0x1edb64?.model, _0x1edb64?.provider);
        _0x58aebb.placeholder = resolveVideoPromptPlaceholder(_0x1cdfc2?.modelManifest, _0x1edb64);
        return;
      }
      const _0x13395a = this._getDreaminaEffectiveNodeData(_0x1edb64);
      const _0x1433bb = normalizeDreaminaVideoRouteMode(_0x13395a?.dreaminaRouteMode, _0x13395a?.mode);
      _0x58aebb.placeholder = _0x1433bb === "frames2video" ? videoPanelText("dreaminaPrompt.frames2video") : videoPanelText("dreaminaPrompt.reference");
    }
    _decorateDreaminaFooter(_0xdb4c83, _0x31799f) {
      const _0x5e41ad = _0x31799f || this._syncDreaminaTaskState(this._data, {
        syncStore: false
      });
      const _0x51b24b = _0x5e41ad?.nodeData || this._data;
      const _0x22cc8b = this._getDreaminaRatioDisplayState(_0x51b24b, _0x5e41ad);
      const _0x20c2e8 = _0x22cc8b?.resolvedTaskType || _0x5e41ad?.resolvedTaskType || "text2video";
      const _0x38ff60 = _0x5e41ad?.routeMode || "auto";
      const _0x15dc93 = _0x22cc8b?.summary || _0x5e41ad?.summary || this._getDreaminaReferenceSummary(_0x51b24b);
      const _0x4d8350 = getDreaminaVideoTaskParamVisibility(_0x20c2e8);
      const _0x4a70c0 = resolveDreaminaStyleVideoProvider(_0x51b24b?.model, _0x51b24b?.provider);
      const _0x5a563b = _0x22cc8b?.currentModel || ensureDreaminaStyleVideoModelForTask(_0x20c2e8, _0x51b24b?.model, _0x4a70c0) || normalizeDreaminaStyleVideoModel(_0x51b24b?.model, _0x4a70c0);
      const _0x555af1 = _0x22cc8b?.currentResolution || normalizeDreaminaStyleVideoResolution(_0x20c2e8, _0x5a563b, _0x51b24b?.resolution || _0x51b24b?.videoSize, _0x4a70c0);
      const _0x30e964 = _0x22cc8b?.currentRatio || normalizeDreaminaVideoAspectRatio(_0x51b24b?.aspectRatio);
      const _0x77461e = normalizeDreaminaStyleVideoDuration(_0x20c2e8, _0x5a563b, _0x51b24b?.duration, _0x4a70c0);
      const _0x5459f2 = getDreaminaStyleVideoDurationRange(_0x20c2e8, _0x5a563b, _0x4a70c0);
      const _0x4542b4 = _0xdb4c83.querySelector(".img-model-pills");
      const _0x594cfe = _0xdb4c83.querySelector(".img-model-wrap");
      const _0x139baa = _0xdb4c83.querySelector(".img-model-btn-trigger");
      const _0x52c87c = _0xdb4c83.querySelector(".img-model-label");
      const _0x1b4729 = _0xdb4c83.querySelector(".img-model-menu");
      if (_0x594cfe) {
        _0x594cfe.hidden = false;
      }
      if (_0x52c87c) {
        _0x52c87c.textContent = getDreaminaProviderLabel(_0x4a70c0);
      }
      if (_0x139baa) {
        const _0x339280 = this._getModelIconHTML(_0x5a563b, _0x4a70c0);
        const _0x386b8a = _0x139baa.firstElementChild;
        if (_0x386b8a) {
          _0x386b8a.outerHTML = _0x339280;
        } else {
          _0x139baa.insertAdjacentHTML("afterbegin", _0x339280);
        }
      }
      _0x1b4729?.querySelectorAll(".floating-menu-item").forEach(_0x9eda87 => {
        const _0x12bcaa = String(_0x9eda87.dataset.value || "").trim();
        const _0x515c23 = String(_0x9eda87.dataset.provider || "").trim().toLowerCase();
        const _0x10351b = _0x4a70c0 === "dreamina" ? _0x515c23 === "dreamina" || _0x12bcaa === "dreamina/text2video" : _0x4a70c0 === "apimart" ? _0x515c23 === "apimart" && isApimartDreaminaVideoModel(_0x12bcaa, _0x515c23) : _0x515c23 === _0x4a70c0 && isDreaminaStyleVideoModel(_0x12bcaa, _0x515c23);
        _0x9eda87.classList.toggle("active", _0x10351b);
      });
      let _0x449df0 = _0xdb4c83.querySelector(".dreamina-task-model-wrap");
      if (!_0x449df0) {
        _0x449df0 = document.createElement("div");
        _0x449df0.className = "dreamina-task-model-wrap";
        _0x449df0.innerHTML = "\n        <button type=\"button\" class=\"img-pill-btn dreamina-task-model-btn\">\n          <span class=\"dreamina-task-model-label\"></span>\n        </button>\n        <div class=\"floating-menu dreamina-task-model-menu\"></div>\n      ";
        _0x594cfe?.insertAdjacentElement("afterend", _0x449df0);
      }
      const _0x18fa71 = _0x449df0.querySelector(".dreamina-task-model-btn");
      const _0x358f15 = _0x449df0.querySelector(".dreamina-task-model-label");
      const _0x49da8f = _0x449df0.querySelector(".dreamina-task-model-menu");
      const _0x28159d = getDreaminaTaskModelMenuMeta(_0x5a563b, _0x4a70c0);
      if (_0x358f15) {
        _0x358f15.textContent = _0x28159d?.title || _0x41e201(_0x5a563b || getDreaminaStyleVideoDefaultModel(_0x20c2e8, _0x4a70c0));
      }
      if (_0x49da8f) {
        _0x49da8f.innerHTML = buildDreaminaTaskModelMenuHtml(_0x5a563b, _0x20c2e8, _0x4a70c0);
      }
      const _0x245753 = !isDreaminaVideoRouteModeEnabled(_0x38ff60) || getDreaminaTaskModelMenuItems(_0x20c2e8, _0x4a70c0).length <= 0;
      if (_0x18fa71) {
        _0x18fa71.disabled = _0x245753;
      }
      _0xdb4c83.querySelector(".img-ratio-wrap")?.remove();
      _0xdb4c83.querySelector(".vid-mode-wrap")?.remove();
      _0xdb4c83.querySelector(".vid-duration-wrap")?.remove();
      _0xdb4c83.querySelectorAll("[data-dreamina-video-param-schema]").forEach(_0x4e86a9 => _0x4e86a9.remove());
      const _0x4b80c5 = this._getDreaminaEffectiveNodeData({
        ..._0x51b24b,
        provider: _0x4a70c0,
        model: _0x5a563b,
        generationParams: {
          ...getPlainGenerationParams(_0x51b24b?.generationParams),
          dreaminaRouteMode: _0x38ff60,
          aspectRatio: _0x30e964,
          duration: _0x77461e,
          ...(_0x555af1 ? {
            resolution: _0x555af1
          } : {})
        }
      });
      const _0xa72ccf = buildDreaminaParamSchemaFields({
        routeMode: _0x38ff60,
        currentRatio: _0x30e964,
        currentResolution: _0x555af1,
        currentDuration: _0x77461e,
        durationRange: _0x5459f2,
        resolutionOptions: _0x22cc8b?.resolutionOptions || []
      });
      const _0x23497d = (_0x1adfdd, _0x149d4d, _0xe904f3 = {}) => {
        if (!_0x149d4d.length) {
          return null;
        }
        const _0x32652d = renderUiSchemaFields(_0x149d4d, _0x4b80c5, {
          sourceId: "dreamina-video-normal-params",
          ..._0xe904f3
        });
        if (!_0x32652d) {
          return null;
        }
        const _0x2281c7 = document.createElement("div");
        _0x2281c7.className = "ui-schema-placement " + _0x1adfdd;
        _0x2281c7.dataset.dreaminaVideoParamSchema = "1";
        _0x2281c7.innerHTML = _0x32652d;
        return _0x2281c7;
      };
      const _0x53cfc7 = _0x4d8350.mode ? _0x23497d("dreamina-video-mode-schema", [_0xa72ccf.mode]) : null;
      const _0x4fb644 = _0x4d8350.ratio ? _0x23497d("dreamina-video-ratio-schema", [_0xa72ccf.resolution, _0xa72ccf.aspectRatio], {
        placement: "resolution"
      }) : null;
      const _0x3ea9a9 = _0x4d8350.duration ? _0x23497d("dreamina-video-duration-schema", [_0xa72ccf.duration]) : null;
      if (_0x4542b4) {
        const _0x55b77b = [_0x594cfe, _0x449df0, _0x53cfc7, _0x4fb644, _0x3ea9a9].filter(Boolean);
        _0x55b77b.forEach(_0x5e23e4 => _0x4542b4.appendChild(_0x5e23e4));
      }
      this._syncDreaminaPromptPlaceholder(_0x4b80c5);
    }
    _resolveModelExecution(_0x132919, _0x396e07) {
      return resolveModelExecution(_0x132919, {
        providerHint: _0x396e07
      }) || resolveModelExecution(_0x132919) || null;
    }
    _getModelProviderId(_0x801222, _0x17ef3d) {
      const _0x479243 = this._resolveModelExecution(_0x801222, _0x17ef3d);
      const _0x26339a = normalizeProviderId(_0x479243?.modelManifest?.provider);
      if (_0x26339a) {
        return _0x26339a;
      }
      return resolveModelProvider(_0x801222, _0x17ef3d, {
        allowPrefixInference: false
      }) || null;
    }
    _isRunninghubWorkflowModel(_0x348f36, _0x5e9fe4) {
      return isRunningHubVideoWorkflowModel(_0x348f36, _0x5e9fe4);
    }
    _getModelIconHTML(_0x63e9a4, _0x21295b) {
      return renderVideoModelTriggerIconHTML({
        model: _0x63e9a4,
        provider: _0x21295b,
        providersMeta: _0x5a7f85,
        resolveExecution: (_0x2092a4, _0x5e7c30) => this._resolveModelExecution(_0x2092a4, _0x5e7c30),
        resolveProviderId: (_0x10073f, _0x58a1a4) => this._getModelProviderId(_0x10073f, _0x58a1a4)
      });
    }
    _getModelParamVisibility(_0x5a844b, _0x23b114) {
      if (isDreaminaStyleVideoModel(_0x5a844b, _0x23b114)) {
        const _0x231264 = this._getResolvedDreaminaTaskType();
        return getDreaminaVideoTaskParamVisibility(_0x231264);
      }
      const _0x5d6e01 = this._getModelProviderId(_0x5a844b, _0x23b114);
      if (_0x5d6e01 === "runninghub" || _0x5d6e01 === "runninghubwf") {
        return {
          ratio: true,
          mode: false,
          duration: false
        };
      }
      return {
        ratio: true,
        mode: true,
        duration: true
      };
    }
    _getRatioIconHTML(_0x3f96ca) {
      if (_0x3f96ca === "自适应") {
        return "<svg class=\"video-ratio-auto-icon\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M9 21V9\"/></svg>";
      }
      const _0x478504 = {
        "1:1": "img-rp-sq",
        "9:16": "img-rp-tall",
        "16:9": "img-rp-wide",
        "3:4": "img-rp-p34",
        "4:3": "img-rp-l43",
        "3:2": "img-rp-l32",
        "2:3": "img-rp-p23",
        "5:4": "img-rp-l54",
        "4:5": "img-rp-p45",
        "21:9": "img-rp-ultra"
      };
      const _0x59b377 = _0x478504[_0x3f96ca] || "img-rp-sq";
      return "<span class=\"img-rp-icon video-ratio-icon " + _0x59b377 + "\"></span>";
    }
    _updateSubmitButtonState() {
      if (!this.btnEl) {
        return;
      }
      const _0x401330 = typeof _0x35358e.getStateRaw === "function" ? _0x35358e.getStateRaw() : typeof _0x35358e.getState === "function" ? _0x35358e.getState() : {};
      const _0x398430 = _0x401330?.nodes || {};
      const _0x43c0c0 = typeof _0x35358e.getIncomingEdges === "function" ? _0x35358e.getIncomingEdges(this.nodeId) : [];
      const _0x2a4143 = _0x398430?.[this.nodeId] || this._data || {};
      const _0x512374 = this._isRunninghubWorkflowModel(_0x2a4143?.model, _0x2a4143?.provider);
      const _0x26db0c = resolveGenerationButtonMode(_0x2a4143, {
        cancellable: _0x512374,
        cancelInFlight: this._rhCancelInFlight === true
      });
      if (_0x26db0c.busy) {
        if (_0x512374) {
          const _0x4e55cb = getVideoCancelTooltip();
          setGenerateButtonCancellableUi(this.btnEl, {
            title: _0x4e55cb,
            tooltip: _0x4e55cb,
            ariaLabel: videoPanelText("cancelGenerateAria"),
            color: "var(--red)",
            busy: true
          });
        } else {
          const _0x134713 = getVideoGenerateTitle();
          setGenerateButtonLoadingUi(this.btnEl, {
            title: _0x134713,
            disabled: true,
            ariaLabel: _0x134713
          });
        }
        this.btnEl.disabled = _0x26db0c.disabled;
        return;
      }
      resetGenerateButtonIdleUi(this.btnEl, getVideoGenerateTitle());
      resetModelCredentialButtonState(this.btnEl);
      const _0x25514f = () => applyModelCredentialButtonState(this.btnEl, {
        modelId: _0x2a4143?.model,
        provider: _0x2a4143?.provider,
        providerProfileId: _0x2a4143?.providerProfileId || _0x2a4143?.rhProviderProfileId
      });
      if (!this._isDreaminaVideoNode(_0x2a4143) && getPanelModelManifest(_0x2a4143)?.kind !== "video") {
        const _0x3f8ab6 = videoPanelText("modelUnavailable");
        this.btnEl.disabled = true;
        this.btnEl.title = _0x3f8ab6;
        this.btnEl.setAttribute?.("aria-label", _0x3f8ab6);
        return;
      }
      const _0xa7c08a = resolvePromptTextWithTextRefs({
        promptEl: this.promptEl,
        inEdges: _0x43c0c0,
        nodes: _0x398430
      });
      if (this._isDreaminaVideoNode(_0x2a4143)) {
        const _0x2465af = this._syncDreaminaTaskState(_0x2a4143, {
          syncStore: true
        });
        this._data = _0x2465af.nodeData || this._data;
        const _0x2f8d25 = _0x2465af.summary || this._getDreaminaReferenceSummary();
        const _0x4be6b6 = _0x2465af.resolvedTaskType || this._getResolvedDreaminaTaskType();
        const _0x2e9eed = _0x2465af.routeMode || "multimodal2video";
        if (!isDreaminaVideoRouteModeEnabled(_0x2e9eed)) {
          this.btnEl.disabled = true;
          return;
        }
        const _0x19058f = validateDreaminaVideoRouteSelection({
          routeMode: _0x2e9eed,
          taskType: _0x4be6b6,
          model: _0x2a4143?.model,
          provider: _0x2a4143?.provider,
          imageCount: _0x2f8d25.imageCount,
          videoCount: _0x2f8d25.videoCount,
          audioCount: _0x2f8d25.audioCount
        });
        let _0x274e26 = !_0x19058f;
        if (_0x274e26) {
          if (_0x4be6b6 === "text2video") {
            _0x274e26 = !!_0xa7c08a;
          } else if (_0x4be6b6 === "image2video") {
            _0x274e26 = !!_0xa7c08a && _0x2f8d25.imageCount === 1;
          } else if (_0x4be6b6 === "frames2video") {
            _0x274e26 = !!_0xa7c08a && _0x2f8d25.imageCount === 2;
          } else if (_0x4be6b6 === "multiframe2video") {
            _0x274e26 = false;
          } else if (_0x4be6b6 === "multimodal2video") {
            _0x274e26 = !!_0xa7c08a && (_0x2f8d25.imageCount > 0 || _0x2f8d25.videoCount > 0 || _0x2f8d25.audioCount > 0);
          }
        }
        this.btnEl.disabled = !_0x274e26;
        if (_0x274e26) {
          _0x25514f();
        }
        return;
      }
      const _0x4726ff = () => evaluateGenerationPromptBoundary({
        model: _0x2a4143?.model,
        provider: _0x2a4143?.provider,
        promptText: _0xa7c08a,
        hasInput: false
      }).ok;
      if (isHappyHorsePanelModel(_0x2a4143)) {
        this.btnEl.disabled = !_0xa7c08a;
        if (_0xa7c08a) {
          _0x25514f();
        }
        return;
      }
      const _0x31dd74 = shouldAllowEmptyCustomAiAppInputs(getPanelModelManifest(_0x2a4143));
      const _0x58e08f = getFixedInputSlotConfigFromManifest(this._data || {});
      const _0x213bf2 = (_0x58e08f?.fixedSlots || []).filter(_0x3b0647 => _0x3b0647?.required === true);
      const _0x5dda12 = (_0x58e08f?.exclusiveGroups || []).filter(_0x24061b => _0x24061b?.required === true || Number(_0x24061b?.min || 0) > 0);
      if (!_0x31dd74 && (_0x213bf2.length > 0 || _0x5dda12.length > 0)) {
        const _0x1e9f9c = _0x398430?.[this.nodeId] || this._data || {};
        const _0x1bddb5 = new Set();
        const _0x2ab2f2 = new Set(_0x58e08f.visibleSlots || []);
        for (const _0x222247 of _0x43c0c0) {
          const _0xd0ede0 = _0x398430[_0x222247.sourceId];
          if (!_0xd0ede0) {
            continue;
          }
          const _0x35c887 = resolveEffectiveInputKind(_0xd0ede0, _0x222247);
          const {
            slot: _0x1cf35a
          } = resolveFixedInputSlotForRef({
            fixedInputConfig: _0x58e08f,
            refSlot: _0x222247?.refSlot,
            kind: _0x35c887,
            occupiedSlots: _0x1bddb5,
            sourceNode: _0xd0ede0
          });
          if (_0x1cf35a && _0x2ab2f2.has(_0x1cf35a)) {
            _0x1bddb5.add(_0x1cf35a);
          }
        }
        const _0x387e88 = buildFixedInputAssetSlotMap(this.promptEl, {
          slotOrderByType: _0x58e08f.slotOrderByType,
          visibleSlots: _0x58e08f.visibleSlots,
          exclusiveGroups: _0x58e08f.exclusiveGroups,
          slotById: _0x58e08f.slotById,
          occupiedSlots: _0x1bddb5,
          nodeData: _0x1e9f9c
        });
        const _0x46acc1 = _0x213bf2.every(_0x428fcb => {
          const _0xb7cea7 = String(_0x428fcb?.id || "").trim();
          return !!_0xb7cea7 && (_0x1bddb5.has(_0xb7cea7) || !!_0x387e88[_0xb7cea7]);
        });
        const _0x1c42a5 = _0x5dda12.every(_0x25f91e => {
          const _0x5d8041 = Array.isArray(_0x25f91e?.slots) ? _0x25f91e.slots : [];
          return _0x5d8041.some(_0x4f20c9 => _0x1bddb5.has(_0x4f20c9) || !!_0x387e88[_0x4f20c9]);
        });
        const _0x1b5869 = _0x46acc1 && _0x1c42a5;
        this.btnEl.disabled = !_0x1b5869 || !_0x4726ff();
        if (!this.btnEl.disabled) {
          _0x25514f();
        }
        return;
      }
      this.btnEl.disabled = !_0x4726ff();
      if (!this.btnEl.disabled) {
        _0x25514f();
      }
    }
  }
  return _0x26ec7f.prototype;
}
