import { AI_GENERATION_NODE_SHORT_SIDE } from "../../services/fileService.js";
import { getGenerationRatioSizeWithDom, pickGenerationRatioSourceEdge } from "../../modules/generationRatioSource.js";
import { getModelManifest, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
export const AI_IMAGE_MIN_SIZE = 150;
export const GENERATION_MANUAL_DISPLAY_SIZE_FIELD = "manualDisplaySize";
function isAdaptiveImageRatio(_0x4d42fb) {
  const _0x31d9dd = String(_0x4d42fb || "").trim();
  const _0x377f93 = _0x31d9dd.toLowerCase();
  return !_0x31d9dd || _0x31d9dd === "自适应" || _0x377f93 === "auto" || _0x377f93 === "adaptive";
}
export function isAdaptiveImageAspectRatioValue(_0x52698e) {
  return isAdaptiveImageRatio(_0x52698e);
}
function getPlainObject(_0x1d2cec) {
  if (_0x1d2cec && typeof _0x1d2cec === "object" && !Array.isArray(_0x1d2cec)) {
    return {
      ..._0x1d2cec
    };
  } else {
    return {};
  }
}
function getAspectRatioFieldForModel(_0x42d3f4) {
  const _0x610bc3 = getModelManifest(_0x42d3f4) || resolveModelExecution(_0x42d3f4)?.modelManifest || null;
  const _0x5eaf34 = Array.isArray(_0x610bc3?.uiSchema?.fields) ? _0x610bc3.uiSchema.fields : [];
  return _0x5eaf34.find(_0x2243d6 => {
    const _0x26b682 = String(_0x2243d6?.id || "").trim();
    const _0x2fb99d = String(_0x2243d6?.displayRole || "").trim();
    return _0x26b682 === "aspectRatio" || _0x2fb99d === "aspectRatio";
  }) || null;
}
export function resolveGenerationModelDisplayAspectRatio({
  modelId = "",
  generationParams = {},
  nodeData = {}
} = {}) {
  const _0x393fff = getPlainObject(generationParams);
  const _0x6277c = getAspectRatioFieldForModel(modelId);
  const _0x4ccaff = String(_0x6277c?.id || "").trim();
  if (_0x4ccaff && Object.prototype.hasOwnProperty.call(_0x393fff, _0x4ccaff)) {
    return _0x393fff[_0x4ccaff];
  }
  if (Object.prototype.hasOwnProperty.call(_0x393fff, "aspectRatio")) {
    return _0x393fff.aspectRatio;
  }
  if (_0x4ccaff && Object.prototype.hasOwnProperty.call(nodeData, _0x4ccaff)) {
    return nodeData[_0x4ccaff];
  }
  if (Object.prototype.hasOwnProperty.call(nodeData, "aspectRatio")) {
    return nodeData.aspectRatio;
  }
  return _0x6277c?.defaultValue;
}
export function isGenerationDisplaySizeManual(_0x1376a9 = {}) {
  return _0x1376a9?.[GENERATION_MANUAL_DISPLAY_SIZE_FIELD] === true;
}
export function buildGenerationModelSelectionDisplayPatch({
  store: _0xe2c7fd,
  nodeId = "",
  nodeData = {},
  fallbackNodeData = {},
  modelId = "",
  generationParams = {},
  ratioValue: _0x102865,
  minSide = AI_GENERATION_NODE_SHORT_SIDE,
  getRefKindByNodeType: _0x2f0b0c,
  inputKinds: _0x28d883,
  resultMediaElement: _0x8e6c75,
  resultFields: _0x2d5d2e,
  mediaSelector: _0x70e4d4,
  respectManualDisplaySize = true
} = {}) {
  if (respectManualDisplaySize && isGenerationDisplaySizeManual(nodeData)) {
    return {};
  }
  const _0x3f39cc = _0x102865 !== undefined ? _0x102865 : resolveGenerationModelDisplayAspectRatio({
    modelId: modelId,
    generationParams: generationParams,
    nodeData: nodeData
  });
  const _0x5aa7b1 = String(_0x3f39cc || "").trim();
  if (!_0x5aa7b1) {
    return {};
  }
  const _0x323adc = {
    ...(nodeData || {}),
    ...(modelId ? {
      model: modelId
    } : {}),
    ...(modelId ? {
      provider: resolveModelProvider(modelId) || nodeData?.provider
    } : {}),
    generationParams: getPlainObject(generationParams)
  };
  const _0x7b74a9 = buildImageSchemaAspectRatioDisplayPatch({
    store: _0xe2c7fd,
    nodeId: nodeId,
    nodeData: _0x323adc,
    fallbackNodeData: fallbackNodeData,
    ratioValue: _0x5aa7b1,
    minSide: minSide,
    getRefKindByNodeType: _0x2f0b0c,
    inputKinds: _0x28d883,
    resultMediaElement: _0x8e6c75,
    resultFields: _0x2d5d2e,
    mediaSelector: _0x70e4d4
  });
  if (Object.keys(_0x7b74a9).length === 0 && String(nodeData?.aspectRatio || "").trim() === _0x5aa7b1) {
    return {};
  }
  return {
    aspectRatio: _0x5aa7b1,
    ..._0x7b74a9
  };
}
export function buildGenerationModelSelectionPayload({
  payload = {},
  store: _0x1d3832,
  nodeId = "",
  nodeData = {},
  fallbackNodeData = {},
  modelId = "",
  generationParams: _0x52139a,
  minSide = AI_GENERATION_NODE_SHORT_SIDE,
  getRefKindByNodeType: _0x5004f9,
  inputKinds: _0x19c47a,
  resultMediaElement: _0x45f897,
  resultFields: _0x1d46ba,
  mediaSelector: _0x256a8c
} = {}) {
  const _0x235a4e = getPlainObject(payload);
  const _0x24bde8 = String(modelId || _0x235a4e.model || nodeData?.model || "").trim();
  const _0x9f538c = _0x52139a !== undefined ? getPlainObject(_0x52139a) : getPlainObject(_0x235a4e.generationParams || nodeData?.generationParams);
  if (!_0x24bde8 || Object.keys(_0x9f538c).length === 0) {
    return {
      payload: _0x235a4e,
      displayPatch: {}
    };
  }
  const _0x2371b4 = buildGenerationModelSelectionDisplayPatch({
    store: _0x1d3832,
    nodeId: nodeId,
    nodeData: nodeData,
    fallbackNodeData: fallbackNodeData,
    modelId: _0x24bde8,
    generationParams: _0x9f538c,
    minSide: minSide,
    getRefKindByNodeType: _0x5004f9,
    inputKinds: _0x19c47a,
    resultMediaElement: _0x45f897,
    resultFields: _0x1d46ba,
    mediaSelector: _0x256a8c
  });
  return {
    payload: {
      ..._0x235a4e,
      ..._0x2371b4
    },
    displayPatch: _0x2371b4
  };
}
export function parseImageDisplayAspectRatio(_0x89ae50) {
  if (isAdaptiveImageRatio(_0x89ae50)) {
    return null;
  }
  const _0x170f31 = String(_0x89ae50 || "").trim().replace(/[：∶﹕]/g, ":").replace(/\s+/g, "");
  const _0x45e145 = _0x170f31.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!_0x45e145) {
    return null;
  }
  const _0x3f02b3 = Number.parseFloat(_0x45e145[1]);
  const _0x181295 = Number.parseFloat(_0x45e145[2]);
  if (!Number.isFinite(_0x3f02b3) || !Number.isFinite(_0x181295)) {
    return null;
  }
  if (_0x3f02b3 <= 0 || _0x181295 <= 0) {
    return null;
  }
  return {
    width: _0x3f02b3,
    height: _0x181295,
    label: _0x3f02b3 + ":" + _0x181295
  };
}
export function buildImageDisplayRatioResizePatch({
  nodeData = {},
  ratioValue = "",
  minSide = AI_GENERATION_NODE_SHORT_SIDE
} = {}) {
  const _0x3dc214 = parseImageDisplayAspectRatio(ratioValue);
  if (!_0x3dc214) {
    return {};
  }
  const _0x1912c1 = Math.max(1, Math.round(Number(minSide) || AI_GENERATION_NODE_SHORT_SIDE));
  const _0x32b0b8 = Math.max(1, Math.round(Number(nodeData?.width) || _0x1912c1));
  const _0x3708f4 = Math.max(1, Math.round(Number(nodeData?.height) || _0x1912c1));
  const _0x5dbcfb = Number.isFinite(Number(nodeData?.x)) ? Number(nodeData.x) : 0;
  const _0x4885fd = Number.isFinite(Number(nodeData?.y)) ? Number(nodeData.y) : 0;
  let _0x307f97;
  let _0x1ea4a2;
  if (_0x3dc214.width >= _0x3dc214.height) {
    _0x1ea4a2 = _0x1912c1;
    _0x307f97 = Math.round(_0x3dc214.width / _0x3dc214.height * _0x1912c1);
  } else {
    _0x307f97 = _0x1912c1;
    _0x1ea4a2 = Math.round(_0x3dc214.height / _0x3dc214.width * _0x1912c1);
  }
  if (_0x307f97 === _0x32b0b8 && _0x1ea4a2 === _0x3708f4) {
    return {};
  }
  const _0x5d3da1 = _0x307f97 - _0x32b0b8;
  const _0x3858a6 = _0x1ea4a2 - _0x3708f4;
  return {
    width: _0x307f97,
    height: _0x1ea4a2,
    x: Math.round(_0x5dbcfb - _0x5d3da1 / 2),
    y: Math.round(_0x4885fd - _0x3858a6)
  };
}
function buildExactRatioLabelForDisplay(_0xe80d40, _0x41cb44) {
  const _0xbac3e6 = Number(_0xe80d40) || 0;
  const _0x8bd246 = Number(_0x41cb44) || 0;
  if (_0xbac3e6 <= 0 || _0x8bd246 <= 0) {
    return null;
  }
  return _0xbac3e6 + ":" + _0x8bd246;
}
function getMediaSizeForRatioDisplay(_0x115e8f, _0xcaa7e4, _0x2662e8 = null, _0x5a3d1a = "img, video") {
  return getGenerationRatioSizeWithDom({
    nodeId: _0x115e8f,
    nodeData: _0xcaa7e4,
    edge: _0x2662e8,
    mediaSelector: _0x5a3d1a,
    includeNodeFrame: true
  }) || {
    width: 0,
    height: 0
  };
}
function isAcceptedRatioInputKind(_0x3d40ab, _0x4da47e, _0x4b8371, _0x90a7a) {
  const _0x15c928 = String(_0x3d40ab?.refSlot || "").toLowerCase();
  if (_0x15c928.includes("mask")) {
    return false;
  }
  const _0x1ff20a = _0x4da47e?.[_0x3d40ab?.sourceId];
  const _0x2af16c = String(_0x1ff20a?.type || "");
  const _0x3a2b13 = typeof _0x90a7a === "function" ? _0x90a7a(_0x2af16c) : "";
  if (_0x3a2b13 && _0x4b8371.has(_0x3a2b13)) {
    return true;
  }
  const _0x6d5627 = _0x2af16c.toLowerCase();
  return Array.from(_0x4b8371).some(_0x59aef7 => _0x6d5627 === _0x59aef7 || _0x6d5627 === "source-" + _0x59aef7 || _0x6d5627 === "ai-" + _0x59aef7);
}
export function resolveImageSchemaAdaptiveRatioDisplayValue({
  store: _0x5c598b,
  nodeId: _0x393b0d,
  nodeData: _0x489578,
  fallbackNodeData: _0x662b15,
  getRefKindByNodeType: _0x34a687,
  inputKinds = ["image"],
  resultMediaElement = null,
  resultFields = ["images", "localPath", "thumbUrl", "imageUrl", "sourceUrl", "thumbId", "sourceId"],
  mediaSelector = "img, video"
} = {}) {
  const _0x1eaaed = _0x5c598b?.getState?.() || {};
  const _0x43e64a = _0x1eaaed.nodes || {};
  const _0x33b401 = _0x489578 || _0x43e64a?.[_0x393b0d] || _0x662b15 || {};
  const _0x528d50 = new Set((Array.isArray(inputKinds) ? inputKinds : ["image"]).map(_0x445057 => String(_0x445057 || "").trim()).filter(Boolean));
  const _0x4d7b58 = typeof _0x5c598b?.getIncomingEdges === "function" ? _0x5c598b.getIncomingEdges(_0x393b0d) : [];
  const _0x5ef56b = _0x4d7b58.filter(_0x344e96 => isAcceptedRatioInputKind(_0x344e96, _0x43e64a, _0x528d50, _0x34a687));
  if (_0x5ef56b.length > 0) {
    const _0x3ce5fe = pickGenerationRatioSourceEdge(_0x5ef56b, _0x33b401);
    const _0x4ce35c = _0x43e64a?.[_0x3ce5fe?.sourceId];
    const _0x55894c = getMediaSizeForRatioDisplay(_0x3ce5fe?.sourceId, _0x4ce35c, _0x3ce5fe, mediaSelector);
    return buildExactRatioLabelForDisplay(_0x55894c.width, _0x55894c.height) || "1:1";
  }
  const _0x37d09d = resultFields.some(_0x4290f3 => {
    const _0x169025 = _0x33b401?.[_0x4290f3];
    if (Array.isArray(_0x169025)) {
      return _0x169025.length > 0;
    } else {
      return Boolean(_0x169025);
    }
  });
  if (_0x37d09d) {
    const _0x53ae21 = resultMediaElement?.naturalWidth || resultMediaElement?.videoWidth || Number(_0x33b401?.width) || 0;
    const _0x586d58 = resultMediaElement?.naturalHeight || resultMediaElement?.videoHeight || Number(_0x33b401?.height) || 0;
    return buildExactRatioLabelForDisplay(_0x53ae21, _0x586d58) || "1:1";
  }
  return "1:1";
}
export function buildImageSchemaAspectRatioDisplayPatch({
  store: _0xd72fa3,
  nodeId: _0x61a1f1,
  nodeData: _0x153944,
  fallbackNodeData: _0x1af3e4,
  ratioValue = "",
  minSide = AI_GENERATION_NODE_SHORT_SIDE,
  getRefKindByNodeType: _0x2a15f9,
  inputKinds: _0x2b1232,
  resultMediaElement: _0x30fa3e,
  resultFields: _0x599e29,
  mediaSelector: _0x514bf1
} = {}) {
  const _0x1f858a = _0xd72fa3?.getState?.().nodes?.[_0x61a1f1];
  if (!_0x1f858a && !_0x153944 && !_0x1af3e4) {
    return {};
  }
  const _0x206ef7 = _0x153944 || _0x1f858a || _0x1af3e4 || {};
  const _0x3c82fe = isAdaptiveImageAspectRatioValue(ratioValue) ? resolveImageSchemaAdaptiveRatioDisplayValue({
    store: _0xd72fa3,
    nodeId: _0x61a1f1,
    nodeData: _0x206ef7,
    fallbackNodeData: _0x1af3e4,
    getRefKindByNodeType: _0x2a15f9,
    inputKinds: _0x2b1232,
    resultMediaElement: _0x30fa3e,
    resultFields: _0x599e29,
    mediaSelector: _0x514bf1
  }) : ratioValue;
  return buildImageDisplayRatioResizePatch({
    nodeData: _0x206ef7,
    ratioValue: _0x3c82fe,
    minSide: minSide
  });
}
export function armImageSchemaRatioResizeAnimation(_0x35f910, _0x42f122, _0x57edf0 = 280) {
  const _0x582f7c = typeof document !== "undefined" ? document.getElementById(_0x42f122) : null;
  if (!_0x582f7c || !_0x35f910) {
    return;
  }
  _0x582f7c.classList.add("is-ratio-animating");
  if (_0x35f910._ratioAnimTimer) {
    clearTimeout(_0x35f910._ratioAnimTimer);
  }
  _0x35f910._ratioAnimTimer = setTimeout(() => {
    const _0x5f5c1a = typeof document !== "undefined" ? document.getElementById(_0x42f122) : null;
    _0x5f5c1a?.classList.remove("is-ratio-animating");
    _0x35f910._ratioAnimTimer = null;
  }, _0x57edf0 + 80);
}
export function animateImageSchemaRatioResizeFlip(_0x3dbe0d, {
  nodeId: _0x1cf4ad,
  previewEl: _0x3356b4,
  nodeData: _0x571e5b,
  patch: _0x28b162,
  ms = 280
} = {}) {
  if (!_0x3dbe0d || !_0x3356b4 || typeof _0x3356b4.animate !== "function") {
    return;
  }
  const _0x1b6bb9 = Math.max(1, Number(_0x571e5b?.width) || Number(_0x28b162?.width) || 1);
  const _0x27d97c = Math.max(1, Number(_0x571e5b?.height) || Number(_0x28b162?.height) || 1);
  const _0x47f8eb = Math.max(1, Number(_0x28b162?.width) || _0x1b6bb9);
  const _0x366cdc = Math.max(1, Number(_0x28b162?.height) || _0x27d97c);
  if (_0x1b6bb9 === _0x47f8eb && _0x27d97c === _0x366cdc) {
    return;
  }
  const _0x1ed921 = _0x1b6bb9 / _0x47f8eb;
  const _0x1308fb = _0x27d97c / _0x366cdc;
  const _0x4ff603 = "scaleX(" + _0x1ed921 + ") scaleY(" + _0x1308fb + ")";
  const _0x24c6ae = () => {
    _0x3dbe0d._ratioFlipAnim = null;
    _0x3356b4.style.transformOrigin = "";
    _0x3356b4.style.transform = "";
  };
  if (_0x3dbe0d._ratioFlipAnim) {
    _0x3dbe0d._ratioFlipAnim.cancel();
  }
  _0x3356b4.style.transition = "none";
  _0x3356b4.style.transformOrigin = "bottom center";
  _0x3356b4.style.transform = _0x4ff603;
  _0x3356b4.offsetWidth;
  const _0x12e226 = () => {
    if (typeof document !== "undefined" && !document.getElementById(_0x1cf4ad)) {
      _0x24c6ae();
      return;
    }
    _0x3dbe0d._ratioFlipAnim = _0x3356b4.animate([{
      transform: _0x4ff603
    }, {
      transform: "none"
    }], {
      duration: ms,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      fill: "forwards"
    });
    _0x3dbe0d._ratioFlipAnim.onfinish = _0x24c6ae;
    _0x3dbe0d._ratioFlipAnim.oncancel = _0x24c6ae;
  };
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(_0x12e226);
  } else {
    setTimeout(_0x12e226, 0);
  }
}
export function applyImageSchemaRatioResizeAnimation(_0x49474c, {
  nodeId: _0x1c5bd4,
  previewEl: _0x4dfaf,
  nodeData: _0x3a4f9e,
  patch: _0x2790c3,
  ms = 280
} = {}) {
  if (!_0x2790c3 || Object.keys(_0x2790c3).length === 0) {
    return;
  }
  armImageSchemaRatioResizeAnimation(_0x49474c, _0x1c5bd4, ms);
  animateImageSchemaRatioResizeFlip(_0x49474c, {
    nodeId: _0x1c5bd4,
    previewEl: _0x4dfaf,
    nodeData: _0x3a4f9e,
    patch: _0x2790c3,
    ms: ms
  });
}