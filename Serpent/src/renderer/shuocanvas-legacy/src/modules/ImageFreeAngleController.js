import a1004_0x1d806d from "../core/stores/appStore.js";
import { generateId } from "../core/math.js";
import { getImage } from "./storage.js";
import { buildGenerateImageRequest, generateImage } from "../../api/aiImageApi.js";
import { isAdaptiveRatioLabel } from "../../api/imageRatioPolicy.js";
import { cancelRunningHubTask } from "../../api/runninghubTaskApi.js";
import { ensureConfig, getProviderConfig } from "../../api/configApi.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide, getNodeDefaultSize } from "../services/fileService.js";
import { bindImageFunctionModeMenu, buildImageFreeAngleModelCatalog, bindImageFunctionModelMenu, buildImageFunctionModeControlHTML, buildImageFunctionModelMenuHTML, closeImageFunctionModelSubmenus, getDefaultImageFreeAngleModelState, getImageFunctionModelDisplayName, getImageFunctionModelTriggerIconHTML, isImageFreeAngleOnlyModel, resolveImageFunctionModelByMode, syncImageFunctionModeControl, syncImageFunctionModelMenuActive } from "./imageFunctionModelMenu.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../utils/debugRequestPreview.js";
import { localPathToUrl, pickResultLocalPath } from "../utils/localMediaPath.js";
import { GENERATE_CANCEL_ICON_HTML } from "./previewGenerateButtonUi.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch } from "../components/aigenImage/imageGenerationResultRenderer.js";
import { buildGenerationCancelledPatch, buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { buildAsyncTaskPatch as a1004_0x544f8a, buildDreaminaTaskPatch as a1004_0xc4e38d, buildRunningHubTaskPatch as a1004_0xbcfd39 } from "../core/generationTaskProtocolState.js";
import { isTaskCancelled } from "../core/generationTaskUiState.js";
import { isDreaminaImageTaskModel, isRunningHubImageTaskModel, isRunningHubModelApiImageTask, resolveImageTaskProvider, shouldUseRunningHubOpenapiQuery } from "./imageTaskModelResolver.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { resolveImageFreeAngleAspectRatio, resolveImageFreeAngleSourceSize } from "./imageFreeAngleAspectRatio.js";
const FREE_ANGLE_DISTANCE_MIN = 0.1;
const FREE_ANGLE_DISTANCE_MAX = 2;
const FREE_ANGLE_VISUAL_SCALE_MIN = 0.7;
const FREE_ANGLE_PREVIOUS_DISTANCE_ONE_VISUAL_SCALE = FREE_ANGLE_VISUAL_SCALE_MIN + (1 - FREE_ANGLE_DISTANCE_MIN) * (2.65 / (FREE_ANGLE_DISTANCE_MAX - FREE_ANGLE_DISTANCE_MIN));
function _computeGenerationDuration(_0x220849) {
  if (!_0x220849) {
    return 0;
  }
  if (typeof _0x220849.generationDuration === "number") {
    return _0x220849.generationDuration;
  }
  const _0x5eb96d = Number(_0x220849.generationStartTime);
  if (!Number.isFinite(_0x5eb96d) || _0x5eb96d <= 0) {
    return 0;
  }
  return Math.max(0, Date.now() - _0x5eb96d);
}
function _isRunningHubTaskModel(_0x594755, _0x1b5148) {
  return isRunningHubImageTaskModel(_0x594755, _0x1b5148);
}
function _isDreaminaTaskModel(_0xbddec1, _0xabc972) {
  return isDreaminaImageTaskModel(_0xbddec1, _0xabc972);
}
function freeAngleText(_0x3a78e6, _0x1bd01b = {}) {
  return t("imageFreeAngle." + _0x3a78e6, _0x1bd01b);
}
function buildFreeAngleOutputText(_0x2686e0, {
  rotation: _0x14ad6d,
  pitch: _0x336fce,
  scale: _0x46b472
} = {}) {
  return freeAngleText("output.angle", {
    model: _0x2686e0,
    rotation: _0x14ad6d,
    pitch: _0x336fce,
    scale: _0x46b472
  });
}
function _resolveImageProvider(_0xa68367, _0x171cd2 = "") {
  return resolveImageTaskProvider(_0xa68367, _0x171cd2, "grsai");
}
function _buildRunningHubTaskPatch({
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false,
  useOpenapiQuery = false
} = {}) {
  return a1004_0xbcfd39({
    taskId: taskId,
    status: status,
    startedAt: startedAt,
    recovering: recovering,
    useOpenapiQuery: useOpenapiQuery
  });
}
function _buildDreaminaTaskPatch({
  submitId = "",
  status = "pending",
  phase = "generating",
  label = freeAngleText("task.generating"),
  startedAt = 0,
  recovering = false
} = {}) {
  return a1004_0xc4e38d({
    submitId: submitId,
    status: status,
    phase: phase,
    label: label,
    startedAt: startedAt,
    recovering: recovering,
    defaultLabel: freeAngleText("task.generating")
  });
}
function _buildAsyncTaskPatch({
  provider = "",
  kind = "image",
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false
} = {}) {
  return a1004_0x544f8a({
    provider: provider,
    kind: kind,
    taskId: taskId,
    status: status,
    startedAt: startedAt,
    recovering: recovering
  });
}
function _persistRunningHubResumeCache() {
  try {
    window._triggerLocalCacheSave?.();
  } catch {}
}
export function createRunningHubTaskStateMachine() {
  const _0x1e894a = {
    active: false,
    cancelRequested: false,
    apiKey: "",
    providerProfileId: "",
    taskId: "",
    abortController: null,
    outNodeId: "",
    originHtml: "",
    originColor: "",
    originTooltip: "",
    originAria: "",
    originTitle: ""
  };
  const _0x36c5c2 = _0x37272e => {
    if (!_0x37272e || _0x1e894a.originHtml) {
      return;
    }
    _0x1e894a.originHtml = _0x37272e.innerHTML;
    _0x1e894a.originColor = _0x37272e.style.color || "";
    _0x1e894a.originTooltip = _0x37272e.dataset.tooltip || "";
    _0x1e894a.originAria = _0x37272e.getAttribute("aria-label") || "";
    _0x1e894a.originTitle = _0x37272e.title || "";
  };
  const _0x2e9147 = _0x5b5518 => {
    if (!_0x5b5518) {
      return;
    }
    _0x36c5c2(_0x5b5518);
    _0x5b5518.style.color = "var(--red)";
    _0x5b5518.dataset.tooltip = freeAngleText("runningTask.clickCancel");
    _0x5b5518.setAttribute("aria-label", freeAngleText("runningTask.cancel"));
    _0x5b5518.title = freeAngleText("runningTask.clickCancelTask");
    _0x5b5518.innerHTML = GENERATE_CANCEL_ICON_HTML;
  };
  const _0x3a1882 = _0x17b8f7 => {
    if (!_0x17b8f7) {
      return;
    }
    if (_0x1e894a.originHtml) {
      _0x17b8f7.innerHTML = _0x1e894a.originHtml;
    }
    _0x17b8f7.style.color = _0x1e894a.originColor || "";
    if (_0x1e894a.originTooltip) {
      _0x17b8f7.dataset.tooltip = _0x1e894a.originTooltip;
    } else {
      delete _0x17b8f7.dataset.tooltip;
    }
    if (_0x1e894a.originAria) {
      _0x17b8f7.setAttribute("aria-label", _0x1e894a.originAria);
    } else {
      _0x17b8f7.removeAttribute("aria-label");
    }
    _0x17b8f7.title = _0x1e894a.originTitle || "";
  };
  const _0x1d7857 = ({
    button: _0xfdd244,
    apiKey: _0x52f461,
    providerProfileId: _0x1722ec,
    abortController: _0x4068dd,
    outNodeId: _0x5917a2
  }) => {
    _0x1e894a.active = true;
    _0x1e894a.cancelRequested = false;
    _0x1e894a.apiKey = _0x52f461 || "";
    _0x1e894a.providerProfileId = String(_0x1722ec || "").trim();
    _0x1e894a.taskId = "";
    _0x1e894a.abortController = _0x4068dd || null;
    _0x1e894a.outNodeId = _0x5917a2 || "";
    _0x2e9147(_0xfdd244);
  };
  const _0x3a6e1a = _0xe88994 => {
    _0x1e894a.taskId = _0xe88994 ? String(_0xe88994) : "";
  };
  const _0x3d804f = () => !!_0x1e894a.cancelRequested || !!_0x1e894a.abortController?.signal?.aborted;
  const _0x24920c = async () => {
    _0x1e894a.cancelRequested = true;
    try {
      _0x1e894a.abortController?.abort?.();
    } catch {}
    if (_0x1e894a.apiKey && _0x1e894a.taskId) {
      await cancelRunningHubTask({
        apiKey: _0x1e894a.apiKey,
        taskId: _0x1e894a.taskId,
        providerProfileId: _0x1e894a.providerProfileId
      });
    }
  };
  const _0x26b10f = ({
    nodeId: _0x163eea,
    name: _0x58c711,
    outputText: _0x404982
  }) => {
    const _0x29aa7a = _0x163eea || _0x1e894a.outNodeId;
    if (!_0x29aa7a) {
      return;
    }
    const _0x7ea3d = a1004_0x1d806d.getState().nodes?.[_0x29aa7a];
    if (!_0x7ea3d) {
      return;
    }
    const _0x1ec3d7 = _computeGenerationDuration(_0x7ea3d);
    a1004_0x1d806d.updateNodeData(_0x29aa7a, {
      ...buildGenerationCancelledPatch({
        duration: _0x1ec3d7
      }),
      name: _0x58c711,
      outputText: _0x404982,
      jobStatus: null
    });
  };
  const _0x1c3694 = _0x3dd764 => {
    _0x1e894a.active = false;
    _0x1e894a.cancelRequested = false;
    _0x1e894a.apiKey = "";
    _0x1e894a.providerProfileId = "";
    _0x1e894a.taskId = "";
    _0x1e894a.abortController = null;
    _0x1e894a.outNodeId = "";
    _0x3a1882(_0x3dd764);
  };
  return {
    state: _0x1e894a,
    bindButton: _0x36c5c2,
    activate: _0x1d7857,
    setTaskId: _0x3a6e1a,
    isCancelled: _0x3d804f,
    cancel: _0x24920c,
    finalizeCancelledNode: _0x26b10f,
    reset: _0x1c3694
  };
}
const ImageFreeAngleController = {
  active: false,
  nodeId: null,
  nodeData: null,
  state: {
    rotation: 35,
    pitch: 20,
    scale: 0.5,
    pan: {
      x: 0,
      y: 0
    }
  },
  containerEl: null,
  cubeEl: null,
  imageWrapEl: null,
  onDone: null,
  _unsubscribeLocale: null,
  async render(_0xe972c8, _0x193f2d, _0x2248fb, _0x3f0527, _0x5984a6) {
    const _0x38b55a = a1004_0x1d806d.getStateRaw();
    const _0x4deb9a = _0x38b55a.nodes?.[_0xe972c8];
    if (!_0x4deb9a) {
      return;
    }
    if (this.active && this.nodeId === _0xe972c8) {
      return;
    }
    if (this.active && this.nodeId !== _0xe972c8) {
      this._exit();
    }
    this.active = true;
    this.nodeId = _0xe972c8;
    this.nodeData = _0x4deb9a;
    this.containerEl = _0x193f2d;
    this.onDone = _0x2248fb;
    this.onGenerate = _0x3f0527;
    this.triggerBtn = _0x5984a6;
    if (this.triggerBtn) {
      this._oldTriggerContent = this.triggerBtn.innerHTML;
      this._oldTriggerTooltip = this.triggerBtn.getAttribute("data-tooltip");
      this._oldTriggerAriaLabel = this.triggerBtn.getAttribute("aria-label");
      this._oldTriggerTitle = this.triggerBtn.getAttribute("title");
      this.triggerBtn.innerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></svg>";
      this.triggerBtn.setAttribute("data-tooltip", freeAngleText("actions.exit"));
      this.triggerBtn.setAttribute("aria-label", freeAngleText("actions.exitControl"));
      this.triggerBtn.setAttribute("title", freeAngleText("actions.exitControl"));
      this.triggerBtn.classList.add("ftb-btn-exit");
    }
    this.state = {
      rotation: 35,
      pitch: 20,
      scale: 0.5,
      pan: {
        x: 0,
        y: 0
      }
    };
    this._modelCatalog = buildImageFreeAngleModelCatalog();
    const _0x353ade = getDefaultImageFreeAngleModelState(this._modelCatalog);
    this._currentModel = _0x353ade.model || "nano-banana-2-lite";
    this._currentProvider = _0x353ade.provider || "grsai";
    this._createUI();
    this._bindEvents();
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    this._syncLocaleTexts();
    this._updateView();
  },
  _createUI() {
    const _0x8be178 = this.containerEl;
    _0x8be178.innerHTML = "";
    const _0x41631c = document.createElement("div");
    _0x41631c.className = "v2-free-angle-embedded";
    let _0x44bb8c = this.nodeData.imageUrl || this.nodeData.sourceUrl || this.nodeData.thumbUrl || this.nodeData.src || localPathToUrl(this.nodeData.localPath);
    const _0x4e7bab = this._modelCatalog || buildImageFreeAngleModelCatalog();
    this._modelCatalog = _0x4e7bab;
    const _0xd76e8e = buildImageFunctionModelMenuHTML({
      activeModel: this._currentModel,
      activeProvider: this._currentProvider,
      modelCatalog: _0x4e7bab
    });
    _0x41631c.innerHTML = "\n      <div class=\"fa-header\">\n        <span class=\"fa-title\">" + freeAngleText("panel.title") + "</span>\n        <button class=\"fa-close-btn\">×</button>\n      </div>\n      <div class=\"fa-content\">\n        <div class=\"fa-preview-area\">\n          <button class=\"fa-reset-btn\">" + freeAngleText("actions.reset") + "</button>\n          <div class=\"fa-cube-container\">\n            <div class=\"fa-cube\">\n              <div class=\"fa-cube-face face-front\">\n                <img src=\"" + _0x44bb8c + "\" class=\"fa-face-img\" />\n              </div>\n              <div class=\"fa-cube-face face-back\">" + freeAngleText("cube.back") + "</div>\n              <div class=\"fa-cube-face face-right\">" + freeAngleText("cube.right") + "</div>\n              <div class=\"fa-cube-face face-left\">" + freeAngleText("cube.left") + "</div>\n              <div class=\"fa-cube-face face-top\">" + freeAngleText("cube.top") + "</div>\n              <div class=\"fa-cube-face face-bottom\">" + freeAngleText("cube.bottom") + "</div>\n            </div>\n          </div>\n        </div>\n        <div class=\"fa-controls\">\n          <div class=\"fa-control-item\">\n            <div class=\"fa-control-label-row\" style=\"display:flex;justify-content:space-between;\">\n              <span class=\"fa-label fa-label-rotation\">" + freeAngleText("controls.rotation") + "</span>\n              <span class=\"fa-value\" id=\"val-rotation\">35.0°</span>\n            </div>\n            <input type=\"range\" class=\"fa-slider\" id=\"sld-rotation\" min=\"0\" max=\"360\" step=\"0.5\" value=\"35\">\n          </div>\n          <div class=\"fa-control-item\">\n            <div class=\"fa-control-label-row\" style=\"display:flex;justify-content:space-between;\">\n              <span class=\"fa-label fa-label-pitch\">" + freeAngleText("controls.pitch") + "</span>\n              <span class=\"fa-value\" id=\"val-pitch\">20.0°</span>\n            </div>\n            <input type=\"range\" class=\"fa-slider\" id=\"sld-pitch\" min=\"-30\" max=\"60\" step=\"0.5\" value=\"20\">\n          </div>\n          <div class=\"fa-control-item\">\n             <div class=\"fa-control-label-row\" style=\"display:flex;justify-content:space-between;\">\n              <span class=\"fa-label fa-label-distance\">" + freeAngleText("controls.distance") + "</span>\n              <span class=\"fa-value\" id=\"val-scale\">0.50</span>\n            </div>\n            <input type=\"range\" class=\"fa-slider\" id=\"sld-scale\" min=\"0.1\" max=\"2\" step=\"0.05\" value=\"0.5\">\n          </div>\n          <div class=\"fa-footer\">\n            <div class=\"fa-model-select image-function-model-select\">\n              <button type=\"button\" class=\"fa-model-btn img-pill-btn image-function-model-trigger\">\n                " + this._getModelIconHtml(this._currentModel, this._currentProvider) + "\n                <span class=\"fa-model-label\">" + getImageFunctionModelDisplayName(this._currentModel, _0x4e7bab) + "</span>\n                <svg class=\"fa-model-chevron image-function-model-chevron\" width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"/></svg>\n              </button>\n              <div class=\"fa-model-menu floating-menu image-function-model-menu\">\n                " + _0xd76e8e + "\n              </div>\n            </div>\n            " + buildImageFunctionModeControlHTML({
      model: this._currentModel,
      provider: this._currentProvider,
      imageSize: this.nodeData?.imageSize || "2K",
      wrapClass: "fa-mode-select",
      buttonClass: "fa-mode-btn img-pill-btn"
    }) + "\n            <div class=\"fa-footer-actions\">\n              <button type=\"button\" class=\"fa-debug-btn debug-wrench-btn\" title=\"" + freeAngleText("actions.debugApiParams") + "\">\n                " + DEBUG_WRENCH_ICON_HTML + "\n              </button>\n              <button class=\"fa-gen-btn img-gen-btn\" title=\"" + freeAngleText("actions.generate") + "\">\n                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>\n    ";
    _0x41631c.querySelector(".fa-close-btn").onclick = () => this._exit();
    _0x41631c.addEventListener("click", _0x40b538 => {
      _0x40b538.stopPropagation();
    });
    _0x41631c.addEventListener("mousedown", _0x32fda7 => {
      _0x32fda7.stopPropagation();
    });
    _0x8be178.appendChild(_0x41631c);
    this.cubeEl = _0x41631c.querySelector(".fa-cube");
    this.wrapperEl = _0x41631c;
    const _0x1367e5 = _0x41631c.querySelector(".fa-face-img");
    if (this.nodeData.thumbId && _0x1367e5) {
      this._hydrateFaceImageFromStorage({
        nodeId: this.nodeId,
        thumbId: this.nodeData.thumbId,
        imageEl: _0x1367e5
      });
    }
  },
  async _hydrateFaceImageFromStorage({
    nodeId: _0x3feed6,
    thumbId: _0x6ee6db,
    imageEl: _0x1dd123
  }) {
    try {
      const _0x3777dc = await getImage(_0x6ee6db);
      if (!_0x3777dc) {
        return;
      }
      const _0x2f89ef = URL.createObjectURL(_0x3777dc);
      if (!this.active || this.nodeId !== _0x3feed6 || _0x1dd123?.isConnected === false) {
        URL.revokeObjectURL(_0x2f89ef);
        return;
      }
      if (String(this._faceImageObjectUrl || "").startsWith("blob:")) {
        URL.revokeObjectURL(this._faceImageObjectUrl);
      }
      this._faceImageObjectUrl = _0x2f89ef;
      _0x1dd123.src = _0x2f89ef;
    } catch (_0x50efc6) {}
  },
  _syncLocaleTexts() {
    if (this.triggerBtn?.classList?.contains("ftb-btn-exit")) {
      this.triggerBtn.setAttribute("data-tooltip", freeAngleText("actions.exit"));
      this.triggerBtn.setAttribute("aria-label", freeAngleText("actions.exitControl"));
      this.triggerBtn.setAttribute("title", freeAngleText("actions.exitControl"));
    }
    if (!this.wrapperEl) {
      return;
    }
    const _0x1f633b = (_0x1744e6, _0x27e52d) => {
      const _0x2a2a7e = this.wrapperEl.querySelector(_0x1744e6);
      if (_0x2a2a7e) {
        _0x2a2a7e.textContent = _0x27e52d;
      }
    };
    const _0x17f764 = (_0x4c81a9, _0x48e123) => {
      const _0x5920c5 = this.wrapperEl.querySelector(_0x4c81a9);
      if (_0x5920c5) {
        _0x5920c5.title = _0x48e123;
      }
    };
    _0x1f633b(".fa-title", freeAngleText("panel.title"));
    _0x1f633b(".fa-reset-btn", freeAngleText("actions.reset"));
    _0x1f633b(".face-back", freeAngleText("cube.back"));
    _0x1f633b(".face-right", freeAngleText("cube.right"));
    _0x1f633b(".face-left", freeAngleText("cube.left"));
    _0x1f633b(".face-top", freeAngleText("cube.top"));
    _0x1f633b(".face-bottom", freeAngleText("cube.bottom"));
    _0x1f633b(".fa-label-rotation", freeAngleText("controls.rotation"));
    _0x1f633b(".fa-label-pitch", freeAngleText("controls.pitch"));
    _0x1f633b(".fa-label-distance", freeAngleText("controls.distance"));
    _0x17f764(".fa-debug-btn", freeAngleText("actions.debugApiParams"));
    _0x17f764(".fa-gen-btn", freeAngleText("actions.generate"));
  },
  _updateView() {
    if (!this.active) {
      return;
    }
    const {
      rotation: _0x5da258,
      pitch: _0x5e0728,
      scale: _0x228a83
    } = this.state;
    const _0x2c9c54 = (_0x5da258 % 360 + 360) % 360;
    this.wrapperEl.querySelector("#val-rotation").textContent = _0x2c9c54.toFixed(1) + "°";
    this.wrapperEl.querySelector("#val-pitch").textContent = _0x5e0728.toFixed(1) + "°";
    this.wrapperEl.querySelector("#val-scale").textContent = "" + _0x228a83.toFixed(2);
    this.wrapperEl.querySelector("#sld-rotation").value = _0x2c9c54;
    this.wrapperEl.querySelector("#sld-pitch").value = _0x5e0728;
    this.wrapperEl.querySelector("#sld-scale").value = _0x228a83;
    this.cubeEl.style.transform = "rotateX(" + -_0x5e0728 + "deg) rotateY(" + (_0x2c9c54 - 360) + "deg)";
    const _0x2563a3 = FREE_ANGLE_VISUAL_SCALE_MIN + (_0x228a83 - FREE_ANGLE_DISTANCE_MIN) * ((FREE_ANGLE_PREVIOUS_DISTANCE_ONE_VISUAL_SCALE - FREE_ANGLE_VISUAL_SCALE_MIN) / (FREE_ANGLE_DISTANCE_MAX - FREE_ANGLE_DISTANCE_MIN));
    this.cubeEl.parentElement.style.transform = "scale(" + _0x2563a3 + ")";
  },
  _bindEvents() {
    const _0x7fd2a1 = this.wrapperEl;
    _0x7fd2a1.querySelector("#sld-rotation").oninput = _0x45ea01 => {
      this.state.rotation = parseFloat(_0x45ea01.target.value);
      this._updateView();
    };
    _0x7fd2a1.querySelector("#sld-pitch").oninput = _0x5991bb => {
      this.state.pitch = parseFloat(_0x5991bb.target.value);
      this._updateView();
    };
    _0x7fd2a1.querySelector("#sld-scale").oninput = _0x52ad47 => {
      this.state.scale = parseFloat(_0x52ad47.target.value);
      this._updateView();
    };
    _0x7fd2a1.querySelector(".fa-reset-btn").onclick = () => {
      this.state = {
        rotation: 35,
        pitch: 20,
        scale: 0.5,
        pan: {
          x: 0,
          y: 0
        }
      };
      this._updateView();
    };
    const _0xf9f8a0 = _0x7fd2a1.querySelector(".fa-preview-area");
    let _0x303599 = false;
    let _0x2cd5e3 = false;
    let _0x39702c = {
      x: 0,
      y: 0
    };
    _0xf9f8a0.onmousedown = _0x1f314e => {
      _0x303599 = true;
      if (_0x1f314e.button === 2) {
        _0x2cd5e3 = true;
      }
      _0x39702c = {
        x: _0x1f314e.clientX,
        y: _0x1f314e.clientY
      };
      _0x1f314e.preventDefault();
      _0x1f314e.stopPropagation();
    };
    const _0x746c57 = _0x2c6a4e => {
      if (!_0x303599) {
        return;
      }
      const _0x2f30ca = _0x2c6a4e.clientX - _0x39702c.x;
      const _0x264df7 = _0x2c6a4e.clientY - _0x39702c.y;
      _0x39702c = {
        x: _0x2c6a4e.clientX,
        y: _0x2c6a4e.clientY
      };
      if (_0x2cd5e3) {
        this.state.pan.x += _0x2f30ca;
        this.state.pan.y += _0x264df7;
      }
      if (!_0x2cd5e3) {
        this.state.rotation += _0x2f30ca * 0.5;
        this.state.pitch += _0x264df7 * 0.5;
        this.state.pitch = Math.max(-30, Math.min(60, this.state.pitch));
      }
      this._updateView();
    };
    const _0xda066 = () => {
      _0x303599 = false;
      _0x2cd5e3 = false;
    };
    window.addEventListener("mousemove", _0x746c57);
    window.addEventListener("mouseup", _0xda066);
    this._cleanupHandlers = () => {
      window.removeEventListener("mousemove", _0x746c57);
      window.removeEventListener("mouseup", _0xda066);
    };
    _0xf9f8a0.onwheel = _0x24e90 => {
      _0x24e90.preventDefault();
      _0x24e90.stopPropagation();
      const _0xe3964e = _0x24e90.deltaY > 0 ? -0.05 : 0.05;
      this.state.scale = Math.max(0.1, Math.min(2, this.state.scale + _0xe3964e));
      this._updateView();
    };
    _0xf9f8a0.oncontextmenu = _0x5b6f33 => _0x5b6f33.preventDefault();
    _0x7fd2a1.querySelector(".fa-gen-btn").onclick = () => this._handleGenerate();
    _0x7fd2a1.querySelector(".fa-debug-btn").onclick = _0x304489 => {
      _0x304489.stopPropagation();
      this._handleDebug();
    };
    const _0x5dab6f = _0x7fd2a1.querySelector(".fa-model-btn");
    const _0x5c24e2 = _0x7fd2a1.querySelector(".fa-model-menu");
    const _0x422fe8 = _0x7fd2a1.querySelector(".fa-mode-btn");
    const _0x5ea40d = _0x7fd2a1.querySelector(".image-function-mode-menu");
    const _0x5da9b0 = this._modelCatalog || buildImageFreeAngleModelCatalog();
    const _0x425115 = () => this.nodeData?.imageSize || "2K";
    _0x5dab6f.onclick = _0x145087 => {
      _0x145087.stopPropagation();
      const _0x21fbf0 = _0x5c24e2.style.display === "block" || _0x5c24e2.style.display === "flex";
      if (_0x21fbf0) {
        _0x5c24e2.style.display = "none";
        closeImageFunctionModelSubmenus(_0x5c24e2);
      } else {
        _0x5c24e2.style.display = "block";
        _0x5ea40d?.classList.remove("show");
      }
    };
    const _0x3397a1 = () => syncImageFunctionModeControl({
      root: _0x7fd2a1,
      model: this._currentModel,
      provider: this._currentProvider,
      imageSize: _0x425115()
    });
    const _0xc78a4a = (_0x1d1b10, _0x1c6e48) => {
      const _0x49e5c2 = String(_0x1d1b10 || "").trim();
      const _0x5db4e3 = _resolveImageProvider(_0x49e5c2, _0x1c6e48);
      if (!_0x49e5c2 || !_0x5db4e3) {
        return;
      }
      this._currentModel = _0x49e5c2;
      this._currentProvider = _0x5db4e3;
      const _0xa57cf0 = this._getModelIconHtml(_0x49e5c2, _0x5db4e3);
      const _0x2d82b1 = getImageFunctionModelDisplayName(_0x49e5c2, _0x5da9b0);
      _0x5dab6f.innerHTML = "\n        " + _0xa57cf0 + "\n        <span class=\"fa-model-label\">" + _0x2d82b1 + "</span>\n        <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"opacity:0.5;margin-left:2px;\"><polyline points=\"6 9 12 15 18 9\"/></svg>\n      ";
      syncImageFunctionModelMenuActive({
        modelMenu: _0x5c24e2,
        model: _0x49e5c2,
        provider: _0x5db4e3
      });
      _0x3397a1();
      _0x5c24e2.style.display = "none";
      closeImageFunctionModelSubmenus(_0x5c24e2);
      if (this.nodeId && !isImageFreeAngleOnlyModel(_0x49e5c2)) {
        a1004_0x1d806d.updateNodeData(this.nodeId, {
          model: _0x49e5c2,
          provider: _0x5db4e3
        });
      }
    };
    const _0x4dc2c5 = bindImageFunctionModelMenu({
      modelMenu: _0x5c24e2,
      onSelect: ({
        model: _0x37abaf,
        provider: _0x8e3451
      }) => _0xc78a4a(_0x37abaf, _0x8e3451),
      closeMenu: () => {
        _0x5c24e2.style.display = "none";
      }
    });
    const _0x3e275c = bindImageFunctionModeMenu({
      modeMenu: _0x5ea40d,
      onSelect: ({
        mode: _0x4ab53c
      }) => {
        const _0x4b4c0b = resolveImageFunctionModelByMode({
          model: this._currentModel,
          provider: this._currentProvider,
          imageSize: _0x425115(),
          mode: _0x4ab53c
        });
        if (!_0x4b4c0b?.model) {
          return;
        }
        _0xc78a4a(_0x4b4c0b.model, _0x4b4c0b.provider);
        _0x5ea40d?.classList.remove("show");
      }
    });
    this._cleanupSubmenuClick = () => {
      _0x4dc2c5?.();
      _0x3e275c?.();
    };
    _0x422fe8?.addEventListener("click", _0x5af722 => {
      _0x5af722.stopPropagation();
      if (_0x422fe8.closest(".image-function-mode-wrap")?.classList.contains("is-hidden")) {
        return;
      }
      _0x5ea40d?.classList.toggle("show");
      _0x5c24e2.style.display = "none";
      closeImageFunctionModelSubmenus(_0x5c24e2);
    });
    _0x3397a1();
    const _0x3b2531 = _0x4ad142 => {
      if (!_0x5dab6f.contains(_0x4ad142.target) && !_0x5c24e2.contains(_0x4ad142.target) && !_0x422fe8?.contains(_0x4ad142.target) && !_0x5ea40d?.contains(_0x4ad142.target)) {
        _0x5c24e2.style.display = "none";
        _0x5ea40d?.classList.remove("show");
        closeImageFunctionModelSubmenus(_0x5c24e2);
      }
    };
    document.addEventListener("mousedown", _0x3b2531);
    this._cleanupModelMenu = () => {
      document.removeEventListener("mousedown", _0x3b2531);
    };
  },
  _getModelIconHtml(_0x3c048c, _0x323ce1 = "") {
    return getImageFunctionModelTriggerIconHTML(_0x3c048c, _resolveImageProvider(_0x3c048c, _0x323ce1), this._modelCatalog || buildImageFreeAngleModelCatalog());
  },
  _exit() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.nodeId = null;
    if (String(this._faceImageObjectUrl || "").startsWith("blob:")) {
      URL.revokeObjectURL(this._faceImageObjectUrl);
    }
    this._faceImageObjectUrl = "";
    if (this._unsubscribeLocale) {
      this._unsubscribeLocale();
      this._unsubscribeLocale = null;
    }
    if (this._cleanupHandlers) {
      this._cleanupHandlers();
    }
    if (this._cleanupModelMenu) {
      this._cleanupModelMenu();
    }
    if (this._cleanupSubmenuClick) {
      this._cleanupSubmenuClick();
    }
    if (this.containerEl) {
      this.containerEl.innerHTML = "";
    }
    if (this.triggerBtn) {
      this.triggerBtn.innerHTML = this._oldTriggerContent;
      if (this._oldTriggerTooltip != null) {
        this.triggerBtn.setAttribute("data-tooltip", this._oldTriggerTooltip);
      } else {
        this.triggerBtn.removeAttribute("data-tooltip");
      }
      if (this._oldTriggerAriaLabel != null) {
        this.triggerBtn.setAttribute("aria-label", this._oldTriggerAriaLabel);
      } else {
        this.triggerBtn.removeAttribute("aria-label");
      }
      if (this._oldTriggerTitle != null) {
        this.triggerBtn.setAttribute("title", this._oldTriggerTitle);
      } else {
        this.triggerBtn.removeAttribute("title");
      }
      this.triggerBtn.classList.remove("ftb-btn-exit");
    }
    this._oldTriggerContent = null;
    this._oldTriggerTooltip = null;
    this._oldTriggerAriaLabel = null;
    this._oldTriggerTitle = null;
    this._modelCatalog = null;
    if (this.onDone) {
      this.onDone();
    }
  },
  async _handleGenerate() {
    if (!this.nodeId) {
      return;
    }
    const {
      rotation: _0x3a4023,
      pitch: _0x2f5cee,
      scale: _0x3d3072
    } = this.state;
    a1004_0x1d806d.updateNodeData(this.nodeId, {
      cameraAngle: {
        rotation: _0x3a4023,
        pitch: _0x2f5cee,
        scale: _0x3d3072
      }
    });
    const _0x1805dc = a1004_0x1d806d.getStateRaw();
    const _0x1fcde7 = _0x1805dc.nodes?.[this.nodeId];
    if (!_0x1fcde7) {
      return;
    }
    let _0x3d898d = this._currentModel || "nano-banana-2";
    const _0x14a77b = _resolveImageProvider(_0x3d898d, this._currentProvider || _0x1fcde7.provider);
    let _0x2ef598 = null;
    const _0x3a85df = document.getElementById(this.nodeId);
    if (_0x3a85df) {
      const _0x258c75 = _0x3a85df.querySelector("img");
      if (_0x258c75) {
        _0x2ef598 = _0x258c75.src;
      }
    }
    if (!_0x2ef598 && _0x1fcde7.imageUrl) {
      _0x2ef598 = _0x1fcde7.imageUrl;
    }
    if (!_0x2ef598 && _0x1fcde7.outputImage) {
      _0x2ef598 = _0x1fcde7.outputImage;
    }
    const _0x4dad44 = _0x1fcde7.aspectRatio || "";
    const _0x63b38b = isAdaptiveRatioLabel(_0x4dad44);
    const _0x32049f = resolveImageFreeAngleSourceSize(_0x1fcde7, _0x3a85df?.querySelector("img"));
    const _0x521f83 = resolveImageFreeAngleAspectRatio({
      aspectRatio: _0x4dad44,
      provider: _0x14a77b,
      model: _0x3d898d,
      imageSize: _0x1fcde7.imageSize || "2K",
      sourceSize: _0x32049f
    });
    await ensureConfig();
    const _0x54330a = getProviderConfig(_0x14a77b);
    let _0x29a334 = "";
    if (_0x14a77b === "runninghub") {
      _0x29a334 = isRunningHubModelApiImageTask(_0x3d898d, _0x14a77b) ? _0x54330a.modelApiKey || "" : _0x54330a.apiKey || "";
    } else if (_0x14a77b === "runninghubwf") {
      _0x29a334 = _0x54330a.apiKey || "";
    } else {
      _0x29a334 = _0x54330a.apiKey || window._appApiKey || "";
    }
    const _0x2c8165 = {
      prompt: "",
      model: _0x3d898d,
      aspectRatio: _0x521f83,
      imageSize: _0x1fcde7.imageSize || "2K",
      batchSize: 1,
      inputUrls: _0x2ef598 ? [_0x2ef598] : [],
      apiKey: _0x29a334,
      provider: _0x14a77b,
      cameraAngle: {
        rotation: _0x3a4023,
        pitch: _0x2f5cee,
        scale: _0x3d3072
      }
    };
    const _0x10e9c8 = Date.now();
    const _0x25ad8d = _isRunningHubTaskModel(_0x3d898d, _0x14a77b);
    const _0x2fc861 = _isDreaminaTaskModel(_0x3d898d, _0x14a77b);
    const _0x1fbc08 = !_0x25ad8d && !_0x2fc861;
    const _0x44e28a = String(_0x14a77b || "").trim().toLowerCase();
    const _0x3fcd6d = shouldUseRunningHubOpenapiQuery(_0x3d898d, _0x14a77b);
    let _0x26250b = 288;
    let _0x1178f5 = 288;
    const _0x4c8cf7 = _0x521f83.split(":");
    const _0x2361f0 = _0x63b38b && _0x32049f ? _0x32049f : {
      width: parseFloat(_0x4c8cf7[0]),
      height: parseFloat(_0x4c8cf7[1])
    };
    if (_0x2361f0.width > 0 && _0x2361f0.height > 0) {
      const _0xe25e07 = getAutoMediaSizeByShortSide(_0x2361f0.width, _0x2361f0.height);
      _0x26250b = _0xe25e07.width;
      _0x1178f5 = _0xe25e07.height;
    }
    const {
      x: _0x989189,
      y: _0x446829
    } = calcSafeSpawnPosNearNode(_0x1805dc.nodes, _0x1fcde7, _0x26250b, _0x1178f5);
    const _0x372bc9 = generateId("source-image-rotate");
    const _0x3fe457 = () => {
      return isTaskCancelled(a1004_0x1d806d.getState().nodes?.[_0x372bc9]);
    };
    const _0x5c7cf7 = getImageFunctionModelDisplayName(_0x3d898d, this._modelCatalog || buildImageFreeAngleModelCatalog());
    a1004_0x1d806d.addNode(buildSourceMediaNodePayload({
      id: _0x372bc9,
      type: "source-image",
      x: _0x989189,
      y: _0x446829,
      width: _0x26250b,
      height: _0x1178f5,
      name: freeAngleText("output.generatingName"),
      src: "",
      ...buildGenerationStartPatch({
        startedAt: _0x10e9c8
      }),
      ...(_0x25ad8d || _0x2fc861 || _0x1fbc08 ? {
        provider: _0x14a77b,
        model: _0x3d898d
      } : {}),
      ...(_0x25ad8d ? {
        rhSourceNodeId: _0x1fcde7.id,
        rhToolbarTaskType: "image-free-angle"
      } : {}),
      ...(_0x25ad8d ? _buildRunningHubTaskPatch({
        taskId: "",
        status: "pending",
        startedAt: _0x10e9c8,
        recovering: false,
        useOpenapiQuery: _0x3fcd6d
      }) : {}),
      ...(_0x2fc861 ? _buildDreaminaTaskPatch({
        submitId: "",
        status: "pending",
        phase: "generating",
        label: freeAngleText("task.submitting"),
        startedAt: _0x10e9c8,
        recovering: false
      }) : {}),
      ...(_0x1fbc08 ? _buildAsyncTaskPatch({
        provider: _0x44e28a,
        kind: "image",
        taskId: "",
        status: "pending",
        startedAt: _0x10e9c8,
        recovering: false
      }) : {}),
      outputText: buildFreeAngleOutputText(_0x5c7cf7, {
        rotation: _0x3a4023,
        pitch: _0x2f5cee,
        scale: _0x3d3072
      })
    }));
    if (_0x25ad8d || _0x2fc861 || _0x1fbc08) {
      _persistRunningHubResumeCache();
    }
    a1004_0x1d806d.setSelectedNodes([_0x372bc9]);
    try {
      const _0x4fa954 = await generateImage(_0x2c8165, {
        onTaskMeta: ({
          taskId: _0x28df5a,
          useOpenapiQuery: _0x4994ea,
          provider: _0x421875,
          providerProfileId: _0x4e8c0f,
          rhProviderProfileId: _0x5e8e94
        }) => {
          const _0x135397 = String(_0x28df5a || "").trim();
          if (!_0x135397) {
            return;
          }
          const _0x389e25 = a1004_0x1d806d.getState().nodes?.[_0x372bc9];
          if (!_0x389e25) {
            return;
          }
          if (_0x3fe457()) {
            return;
          }
          if (_0x25ad8d) {
            const _0x46d50b = String(_0x4e8c0f || _0x5e8e94 || "").trim();
            a1004_0x1d806d.updateNodeData(_0x372bc9, {
              ...(_0x46d50b ? {
                taskProviderProfileId: _0x46d50b,
                providerProfileId: _0x46d50b,
                rhProviderProfileId: _0x46d50b
              } : {}),
              ..._buildRunningHubTaskPatch({
                taskId: _0x135397,
                status: "running",
                startedAt: _0x10e9c8,
                recovering: false,
                useOpenapiQuery: _0x4994ea === true
              })
            });
            _persistRunningHubResumeCache();
            return;
          }
          if (_0x2fc861) {
            a1004_0x1d806d.updateNodeData(_0x372bc9, {
              ..._buildDreaminaTaskPatch({
                submitId: _0x135397,
                status: "pending",
                phase: "generating",
                label: freeAngleText("task.generating"),
                startedAt: _0x10e9c8,
                recovering: false
              })
            });
            _persistRunningHubResumeCache();
            return;
          }
          if (_0x1fbc08) {
            a1004_0x1d806d.updateNodeData(_0x372bc9, {
              ..._buildAsyncTaskPatch({
                provider: String(_0x421875 || _0x389e25?.asyncTaskProvider || _0x44e28a).trim(),
                kind: "image",
                taskId: _0x135397,
                status: "running",
                startedAt: _0x10e9c8,
                recovering: false
              })
            });
            _persistRunningHubResumeCache();
          }
        },
        onTaskId: _0x14b398 => {
          const _0x484618 = String(_0x14b398 || "").trim();
          if (!_0x484618) {
            return;
          }
          const _0x21a138 = a1004_0x1d806d.getState().nodes?.[_0x372bc9];
          if (!_0x21a138) {
            return;
          }
          if (_0x3fe457()) {
            return;
          }
          if (_0x25ad8d) {
            a1004_0x1d806d.updateNodeData(_0x372bc9, {
              ..._buildRunningHubTaskPatch({
                taskId: _0x484618,
                status: "running",
                startedAt: _0x10e9c8,
                recovering: false,
                useOpenapiQuery: _0x21a138?.rhTaskUseOpenapiQuery === true || _0x3fcd6d
              })
            });
            _persistRunningHubResumeCache();
            return;
          }
          if (_0x2fc861) {
            a1004_0x1d806d.updateNodeData(_0x372bc9, {
              ..._buildDreaminaTaskPatch({
                submitId: _0x484618,
                status: "pending",
                phase: "generating",
                label: freeAngleText("task.generating"),
                startedAt: _0x10e9c8,
                recovering: false
              })
            });
            _persistRunningHubResumeCache();
            return;
          }
          if (_0x1fbc08) {
            a1004_0x1d806d.updateNodeData(_0x372bc9, {
              ..._buildAsyncTaskPatch({
                provider: String(_0x21a138?.asyncTaskProvider || _0x44e28a).trim(),
                kind: "image",
                taskId: _0x484618,
                status: "running",
                startedAt: _0x10e9c8,
                recovering: false
              })
            });
            _persistRunningHubResumeCache();
          }
        }
      });
      if (_0x3fe457()) {
        return;
      }
      const _0x4695d7 = _0x4fa954 && _0x4fa954.isBatch && Array.isArray(_0x4fa954.images) && _0x4fa954.images[0] ? _0x4fa954.images[0] : _0x4fa954;
      if (_0x4695d7?.error) {
        throw new Error(String(_0x4695d7.error));
      }
      const _0x527331 = pickResultLocalPath(_0x4695d7);
      const _0xb049eb = localPathToUrl(_0x527331) || _0x4695d7?.sourceUrl || _0x4695d7?.imageUrl || _0x4695d7?.url || "";
      if (!_0xb049eb) {
        throw new Error(freeAngleText("errors.noGeneratedImageUrl"));
      }
      const _0x480b42 = _0x8e563c => {
        const _0x7ee450 = String(_0x8e563c || "");
        const _0x59560d = _0x7ee450.split("/").pop() || "";
        return _0x59560d;
      };
      const _0xd11428 = a1004_0x1d806d.getState().nodes?.[_0x372bc9];
      const _0x523197 = _0xd11428?.generationStartTime ? Date.now() - _0xd11428.generationStartTime : 0;
      const _0x14cab5 = buildImageGenerationResultPatch({
        ..._0x4695d7,
        localPath: _0x527331,
        sourceUrl: _0x4695d7?.sourceUrl || _0x4695d7?.imageUrl || _0xb049eb,
        imageUrl: _0x4695d7?.imageUrl || _0x4695d7?.sourceUrl || _0xb049eb,
        thumbUrl: _0x4695d7?.thumbUrl || _0x4695d7?.sourceUrl || _0x4695d7?.imageUrl || ""
      }, {
        startedAt: _0x10e9c8,
        duration: _0x523197
      });
      a1004_0x1d806d.updateNodeData(_0x372bc9, {
        ..._0x14cab5,
        name: freeAngleText("output.resultName"),
        src: _0xb049eb,
        fileName: _0x527331 ? _0x480b42(_0x527331) : "",
        ...(_0x25ad8d ? _buildRunningHubTaskPatch({
          taskId: _0xd11428?.rhTaskId || "",
          status: "success",
          startedAt: _0x10e9c8,
          recovering: false,
          useOpenapiQuery: _0xd11428?.rhTaskUseOpenapiQuery === true || _0x3fcd6d
        }) : {}),
        ...(_0x2fc861 ? _buildDreaminaTaskPatch({
          submitId: _0xd11428?.dreaminaSubmitId || "",
          status: "success",
          phase: "done",
          label: freeAngleText("task.completed"),
          startedAt: _0x10e9c8,
          recovering: false
        }) : {}),
        ...(_0x1fbc08 ? _buildAsyncTaskPatch({
          provider: _0xd11428?.asyncTaskProvider || _0x44e28a,
          kind: "image",
          taskId: _0xd11428?.asyncTaskId || "",
          status: "success",
          startedAt: _0x10e9c8,
          recovering: false
        }) : {})
      });
      if (_0x25ad8d || _0x2fc861 || _0x1fbc08) {
        _persistRunningHubResumeCache();
      }
      window.showToast?.(freeAngleText("toasts.success"), "success");
    } catch (_0x43baff) {
      if (_0x3fe457()) {
        return;
      }
      const _0x275f13 = a1004_0x1d806d.getState().nodes?.[_0x372bc9];
      if (_0x275f13) {
        const _0x5e20fe = _0x275f13?.generationStartTime ? Date.now() - _0x275f13.generationStartTime : 0;
        const _0x15d230 = _0x43baff?.message || freeAngleText("errors.unknown");
        a1004_0x1d806d.updateNodeData(_0x372bc9, {
          ...buildImageGenerationFailurePatch({
            error: _0x15d230,
            startedAt: _0x10e9c8,
            duration: _0x5e20fe
          }),
          name: freeAngleText("output.failedName"),
          src: "",
          ...(_0x25ad8d ? _buildRunningHubTaskPatch({
            taskId: _0x275f13?.rhTaskId || "",
            status: "failed",
            startedAt: _0x10e9c8,
            recovering: false,
            useOpenapiQuery: _0x275f13?.rhTaskUseOpenapiQuery === true || _0x3fcd6d
          }) : {}),
          ...(_0x2fc861 ? _buildDreaminaTaskPatch({
            submitId: _0x275f13?.dreaminaSubmitId || "",
            status: "failed",
            phase: "failed",
            label: _0x15d230 || freeAngleText("task.failed"),
            startedAt: _0x10e9c8,
            recovering: false
          }) : {}),
          ...(_0x1fbc08 ? _buildAsyncTaskPatch({
            provider: _0x275f13?.asyncTaskProvider || _0x44e28a,
            kind: "image",
            taskId: _0x275f13?.asyncTaskId || "",
            status: "failed",
            startedAt: _0x10e9c8,
            recovering: false
          }) : {}),
          outputText: freeAngleText("output.failedReason", {
            error: _0x15d230
          })
        });
        if (_0x25ad8d || _0x2fc861 || _0x1fbc08) {
          _persistRunningHubResumeCache();
        }
      }
      window.showToast?.(freeAngleText("toasts.failed", {
        error: _0x43baff?.message || freeAngleText("errors.unknown")
      }), "error");
    }
  },
  async _handleDebug() {
    if (!this.nodeId) {
      return;
    }
    const _0x50fc02 = a1004_0x1d806d.getStateRaw();
    const _0x47299b = _0x50fc02.nodes?.[this.nodeId];
    if (!_0x47299b) {
      return;
    }
    const _0x238c8f = getNodeDefaultSize("debug");
    let _0x44e297 = this._currentModel || "nano-banana-2";
    const _0xe744df = _resolveImageProvider(_0x44e297, this._currentProvider || _0x47299b.provider);
    const {
      rotation: _0x5d031a,
      pitch: _0x108601,
      scale: _0x122923
    } = this.state;
    let _0x444ffd = null;
    const _0x310b33 = document.getElementById(this.nodeId);
    if (_0x310b33) {
      const _0x486d6c = _0x310b33.querySelector("img");
      if (_0x486d6c) {
        _0x444ffd = _0x486d6c.src;
      }
    }
    if (!_0x444ffd && _0x47299b.imageUrl) {
      _0x444ffd = _0x47299b.imageUrl;
    }
    if (!_0x444ffd && _0x47299b.outputImage) {
      _0x444ffd = _0x47299b.outputImage;
    }
    const _0x5f19c2 = resolveImageFreeAngleSourceSize(_0x47299b, _0x310b33?.querySelector("img"));
    const _0xb05ba = resolveImageFreeAngleAspectRatio({
      aspectRatio: _0x47299b.aspectRatio || "",
      provider: _0xe744df,
      model: _0x44e297,
      imageSize: _0x47299b.imageSize || "2K",
      sourceSize: _0x5f19c2
    });
    await ensureConfig();
    const _0x3b5409 = getProviderConfig(_0xe744df);
    let _0x49126f = "";
    if (_0xe744df === "runninghub") {
      _0x49126f = isRunningHubModelApiImageTask(_0x44e297, _0xe744df) ? _0x3b5409.modelApiKey || "" : _0x3b5409.apiKey || "";
    } else if (_0xe744df === "runninghubwf") {
      _0x49126f = _0x3b5409.apiKey || "";
    } else {
      _0x49126f = _0x3b5409.apiKey || window._appApiKey || "";
    }
    const _0x4c5ee0 = {
      prompt: "",
      model: _0x44e297,
      aspectRatio: _0xb05ba,
      imageSize: _0x47299b.imageSize || "2K",
      batchSize: 1,
      inputUrls: _0x444ffd ? [_0x444ffd] : [],
      apiKey: _0x49126f,
      provider: _0xe744df,
      cameraAngle: {
        rotation: _0x5d031a,
        pitch: _0x108601,
        scale: _0x122923
      }
    };
    try {
      const _0x2ebeb9 = await buildGenerateImageRequest(_0x4c5ee0);
      const _0x411241 = formatFinalApiDebugRequest(_0x2ebeb9);
      const {
        x: _0xad7b20,
        y: _0x4b8e2d
      } = calcSafeSpawnPosNearNode(_0x50fc02.nodes, _0x47299b, _0x238c8f.width, _0x238c8f.height);
      let _0x255359 = Object.values(_0x50fc02.nodes).find(_0x18618f => _0x18618f.type === "debug");
      if (!_0x255359) {
        a1004_0x1d806d.addNode({
          id: "debug-" + Date.now(),
          type: "debug",
          x: _0xad7b20,
          y: _0x4b8e2d,
          ..._0x238c8f,
          name: freeAngleText("debug.nodeName"),
          outputText: _0x411241
        });
      } else {
        a1004_0x1d806d.updateNodeData(_0x255359.id, {
          outputText: _0x411241,
          x: _0xad7b20,
          y: _0x4b8e2d
        });
      }
    } catch (_0x2b1de5) {
      console.error("[ImageFreeAngleController] 调试请求构建失败:", _0x2b1de5);
      window.showToast?.(freeAngleText("toasts.debugBuildFailed", {
        error: _0x2b1de5?.message || freeAngleText("errors.unknown")
      }), "error");
    }
  }
};
export default ImageFreeAngleController;