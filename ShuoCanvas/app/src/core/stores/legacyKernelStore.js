import { generateId } from "../math.js";
import { applyFeatureSelectionsToNodeData, captureFeatureSelectionsFromNodePatch, sanitizeFeatureSelectionsRecord } from "../../modules/featureSelectionMemory.js";
import { normalizeImageToolbarLayout, serializeImageToolbarLayout } from "../../modules/imageToolbarLayoutMemory.js";
import { normalizeVideoToolbarLayout, serializeVideoToolbarLayout } from "../../modules/videoToolbarLayoutMemory.js";
import { normalizeCommentNoteJumpShortcut } from "../../modules/commentNoteJumpShortcut.js";
import { sanitizeSerializedCanvasData } from "../../utils/thumbnailPersistence.js";
import { sanitizePromptHtml } from "../../utils/dom.js";
import { isGenerationTaskTerminalStatus, resolveJobStatusFromTaskStatus } from "../generationTaskLifecycle.js";
import { createDefaultStoryboardScriptState } from "../storyboardScriptFactory.js";
import { cloneStoryboardCellForSwap, cloneStoryboardCellForSwapDestination, isStoryboardCellEmpty, normalizeEmptyStoryboardCell, resolveStoryboardCellSourceIndex } from "../storyboardCellUtils.js";
import { cloneStoryboard3DProjects, createStoryboard3DProjectActions } from "./storyboard3dProjectState.js";
import { createViewportScreenFrame } from "./viewportScreenFrame.js";
import { sanitizeCanvasNodeMediaPatchForStore } from "../../services/canvasMediaLocalService.js";
import { createRendererStateRevisionTracker } from "./rendererStateRevisions.js";
import { canAppendInputKindWithinLimit, canTargetReceiveInputs, getTargetInputPolicy, hasUsableInputNodeSource, isInputKindAllowed, resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { collectGroupOutputIncomingEdges, isGroupNodeData } from "../../modules/groupDynamicOutput.js";
import { getFixedInputSlotConfigFromManifest } from "../../modules/fixedInputAssetRefs.js";
import { isModelApiModel, isWorkflowModel as a724_0x3c0467, RH_VIDEO_V54_MODEL_ID, resolveModelProvider } from "../../manifests/index.js";
import { createInitialState, createInitialWorkflowDraftState, createInitialWorkflowUiState } from "./legacyInitialState.js";
import { emitNodeDeletions } from "../nodeDeletionEvents.js";
import { normalizeConnectionLineStyle } from "../edgePathGeometry.js";
import { normalizeCanvasToolbarPlacement } from "../../modules/canvasToolbarPlacement.js";
import { normalizeNodeManagerPlacement } from "../../modules/nodeManager/nodeManagerPlacement.js";
function deepClone(_0x53c1d9) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(_0x53c1d9);
    } catch {}
  }
  return JSON.parse(JSON.stringify(_0x53c1d9));
}
function stripPersistedRichText(_0x4835a5) {
  if (typeof _0x4835a5 !== "string") {
    return _0x4835a5;
  }
  return _0x4835a5.replace(/<[^>]*>/g, "");
}
function sanitizePersistedPromptHtml(_0xc7073f) {
  if (typeof _0xc7073f !== "string") {
    return _0xc7073f;
  }
  return sanitizePromptHtml(_0xc7073f);
}
function cloneShallowObjectArray(_0x3de137) {
  if (!Array.isArray(_0x3de137)) {
    return _0x3de137;
  }
  return _0x3de137.map(_0x36670a => _0x36670a && typeof _0x36670a === "object" ? {
    ..._0x36670a
  } : _0x36670a);
}
function cloneViewportSnapshot(_0x53e671) {
  if (!_0x53e671 || typeof _0x53e671 !== "object") {
    return _0x53e671;
  }
  return {
    ..._0x53e671
  };
}
function cloneEdgeSnapshot(_0xf449f6) {
  if (!_0xf449f6 || typeof _0xf449f6 !== "object") {
    return _0xf449f6;
  }
  return {
    ..._0xf449f6
  };
}
function cloneAssetSnapshot(_0x33f86a) {
  if (!_0x33f86a || typeof _0x33f86a !== "object") {
    return _0x33f86a;
  }
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(_0x33f86a);
    } catch {}
  }
  try {
    return JSON.parse(JSON.stringify(_0x33f86a));
  } catch {}
  return {
    ..._0x33f86a
  };
}
function cloneWorkflowSnapshot(_0x75504a) {
  if (!_0x75504a || typeof _0x75504a !== "object") {
    return _0x75504a;
  }
  return deepClone(_0x75504a);
}
function isBlobLikeUrl(_0x4a6ec) {
  return typeof _0x4a6ec === "string" && /^blob:/i.test(_0x4a6ec.trim());
}
function sanitizePanoramaStateForPersistence(_0x3ec5e0) {
  if (!_0x3ec5e0 || typeof _0x3ec5e0 !== "object") {
    return _0x3ec5e0;
  }
  const _0x31d1ff = deepClone(_0x3ec5e0);
  if (_0x31d1ff.ui && typeof _0x31d1ff.ui === "object") {
    delete _0x31d1ff.ui.isEditing;
  }
  if (_0x31d1ff.panorama && typeof _0x31d1ff.panorama === "object") {
    delete _0x31d1ff.panorama.isLoaded;
    delete _0x31d1ff.panorama.error;
    if (isBlobLikeUrl(_0x31d1ff.panorama.imageUrl)) {
      delete _0x31d1ff.panorama.imageUrl;
    }
    if (isBlobLikeUrl(_0x31d1ff.panorama.localPath)) {
      delete _0x31d1ff.panorama.localPath;
    }
  }
  if (_0x31d1ff.capture && typeof _0x31d1ff.capture === "object") {
    delete _0x31d1ff.capture.pending;
    delete _0x31d1ff.capture.error;
    delete _0x31d1ff.capture.lastCaptureAt;
  }
  return _0x31d1ff;
}
function sanitizePanoramaStateForHistory(_0x14b1b5) {
  const _0x4ebd43 = sanitizePanoramaStateForPersistence(_0x14b1b5);
  if (!_0x4ebd43 || typeof _0x4ebd43 !== "object") {
    return _0x4ebd43;
  }
  delete _0x4ebd43.viewport;
  return _0x4ebd43;
}
function cloneNodeSnapshot(_0x2310e0, {
  stripRichText = false,
  hydratedAt = null,
  featureSelections = null,
  stripPanoramaViewport = false,
  preserveLiveGeneration = false
} = {}) {
  if (!_0x2310e0 || typeof _0x2310e0 !== "object") {
    return _0x2310e0;
  }
  const _0x1f8041 = {
    ..._0x2310e0
  };
  normalizeNodeModel(_0x1f8041);
  if (stripRichText) {
    if (_0x1f8041.content !== undefined) {
      _0x1f8041.content = stripPersistedRichText(_0x1f8041.content);
    }
    if (_0x1f8041.prompt !== undefined) {
      _0x1f8041.prompt = sanitizePersistedPromptHtml(_0x1f8041.prompt);
    }
  }
  if (Array.isArray(_0x2310e0.cells)) {
    _0x1f8041.cells = cloneShallowObjectArray(_0x2310e0.cells);
  }
  if (Array.isArray(_0x2310e0.images)) {
    _0x1f8041.images = cloneShallowObjectArray(_0x2310e0.images);
  }
  if (Array.isArray(_0x2310e0.videos)) {
    _0x1f8041.videos = cloneShallowObjectArray(_0x2310e0.videos);
  }
  if (_0x2310e0.sceneNode && typeof _0x2310e0.sceneNode === "object") {
    _0x1f8041.sceneNode = stripPanoramaViewport ? sanitizePanoramaStateForHistory(_0x2310e0.sceneNode) : sanitizePanoramaStateForPersistence(_0x2310e0.sceneNode);
  }
  if (_0x2310e0.panorama360Node && typeof _0x2310e0.panorama360Node === "object") {
    _0x1f8041.panorama360Node = stripPanoramaViewport ? sanitizePanoramaStateForHistory(_0x2310e0.panorama360Node) : sanitizePanoramaStateForPersistence(_0x2310e0.panorama360Node);
  }
  if (_0x2310e0.storyboard3d && typeof _0x2310e0.storyboard3d === "object") {
    _0x1f8041.storyboard3d = deepClone(_0x2310e0.storyboard3d);
  }
  if (typeof hydratedAt === "number" && Number.isFinite(hydratedAt) && typeof _0x1f8041.generationStartTime === "number" && Number.isFinite(_0x1f8041.generationStartTime) && _0x1f8041.generationDuration == null && !shouldPreserveRunningGenerationOnHydrate(_0x1f8041, {
    preserveLiveGeneration: preserveLiveGeneration
  })) {
    finalizeHydratedGenerationSnapshot(_0x1f8041, Math.max(1, hydratedAt - _0x1f8041.generationStartTime));
  }
  if (typeof _0x1f8041._bizRev !== "number") {
    _0x1f8041._bizRev = 1;
  }
  if (featureSelections) {
    return applyFeatureSelectionsToNodeData(_0x1f8041, featureSelections);
  } else {
    return _0x1f8041;
  }
}
function shallowEqual(_0x4c73bf, _0x387a0e) {
  if (_0x4c73bf === _0x387a0e) {
    return true;
  }
  if (typeof _0x4c73bf !== typeof _0x387a0e) {
    return false;
  }
  if (typeof _0x4c73bf !== "object" || _0x4c73bf === null || _0x387a0e === null) {
    return false;
  }
  const _0x4f5f22 = Object.keys(_0x4c73bf);
  const _0x3dd427 = Object.keys(_0x387a0e);
  if (_0x4f5f22.length !== _0x3dd427.length) {
    return false;
  }
  for (const _0xc989ce of _0x4f5f22) {
    if (!Object.prototype.hasOwnProperty.call(_0x387a0e, _0xc989ce) || _0x4c73bf[_0xc989ce] !== _0x387a0e[_0xc989ce]) {
      return false;
    }
  }
  return true;
}
function isPlainObject(_0x20a281) {
  if (!_0x20a281 || typeof _0x20a281 !== "object" || Array.isArray(_0x20a281)) {
    return false;
  }
  const _0x3df082 = Object.getPrototypeOf(_0x20a281);
  return _0x3df082 === Object.prototype || _0x3df082 === null;
}
function snapshotSelectorValue(_0x92d9c5) {
  if (_0x92d9c5 == null || typeof _0x92d9c5 !== "object") {
    return _0x92d9c5;
  }
  if (Array.isArray(_0x92d9c5)) {
    return _0x92d9c5.slice();
  }
  if (isPlainObject(_0x92d9c5)) {
    return {
      ..._0x92d9c5
    };
  }
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(_0x92d9c5);
    } catch {}
  }
  return _0x92d9c5;
}
function _isSameStoreValue(_0x2c3eed, _0x2ad52f) {
  return Object.is(_0x2c3eed, _0x2ad52f);
}
function _isPatchNoop(_0x157bdc, _0x31f732) {
  if (!_0x157bdc || !_0x31f732 || typeof _0x31f732 !== "object") {
    return false;
  }
  const _0x57882e = Object.keys(_0x31f732);
  if (_0x57882e.length === 0) {
    return true;
  }
  return _0x57882e.every(_0x87cd39 => _isSameStoreValue(_0x157bdc[_0x87cd39], _0x31f732[_0x87cd39]));
}
function _trimText(_0xdf4235) {
  if (typeof _0xdf4235 === "string") {
    return _0xdf4235.trim();
  } else {
    return "";
  }
}
const HISTORY_RUNNING_STATUSES = new Set(["pending", "queued", "queueing", "waiting", "submitted", "submitting", "submit", "running", "processing", "generating", "in_progress", "in-progress", "recovering"]);
const HISTORY_GENERATION_STATUS_FIELDS = Object.freeze(["jobStatus", "rhTaskStatus", "dreaminaTaskStatus", "dreaminaTaskPhase", "asyncTaskStatus"]);
function normalizeHistoryStatus(_0x230038) {
  return String(_0x230038 || "").trim().toLowerCase();
}
function hasUsableImageResultItem(_0x2a143a) {
  if (!_0x2a143a || typeof _0x2a143a !== "object") {
    return false;
  }
  if (_trimText(_0x2a143a.error)) {
    return false;
  }
  return !!_trimText(_0x2a143a.imageUrl) || !!_trimText(_0x2a143a.sourceUrl) || !!_trimText(_0x2a143a.thumbUrl) || !!_trimText(_0x2a143a.localPath) || !!_trimText(_0x2a143a.originalLocalPath) || !!_trimText(_0x2a143a.displayLocalPath) || !!_trimText(_0x2a143a.thumbLocalPath) || !!_trimText(_0x2a143a.thumbId) || !!_trimText(_0x2a143a.sourceId);
}
function hasResolvedAiImageResultSnapshot(_0x534b2b) {
  if (!_0x534b2b || typeof _0x534b2b !== "object") {
    return false;
  }
  if (String(_0x534b2b.type || "") !== "ai-image") {
    return false;
  }
  const _0x309a83 = Array.isArray(_0x534b2b.images) ? _0x534b2b.images : [];
  if (_0x309a83.some(_0x54fa0e => hasUsableImageResultItem(_0x54fa0e))) {
    return true;
  }
  return hasUsableImageResultItem(_0x534b2b);
}
function isRunningAiImageHistorySnapshot(_0x27c87d) {
  if (!_0x27c87d || typeof _0x27c87d !== "object") {
    return false;
  }
  if (String(_0x27c87d.type || "") !== "ai-image") {
    return false;
  }
  if (_0x27c87d.isGenerating === true) {
    return true;
  }
  if (_0x27c87d.rhTaskRecovering === true || _0x27c87d.dreaminaTaskRecovering === true || _0x27c87d.asyncTaskRecovering === true) {
    return true;
  }
  return HISTORY_GENERATION_STATUS_FIELDS.some(_0x12fffc => HISTORY_RUNNING_STATUSES.has(normalizeHistoryStatus(_0x27c87d[_0x12fffc])));
}
function normalizeAiImageRunningHistorySnapshot(_0x4d4060) {
  if (!isRunningAiImageHistorySnapshot(_0x4d4060)) {
    return _0x4d4060;
  }
  const _0x3df4e6 = hasResolvedAiImageResultSnapshot(_0x4d4060);
  _0x4d4060.isGenerating = false;
  _0x4d4060.jobStatus = _0x3df4e6 ? "success" : null;
  _0x4d4060.jobError = null;
  _0x4d4060.rhStatusMessage = null;
  _0x4d4060.rhStatusCode = null;
  _0x4d4060.rhTaskId = "";
  _0x4d4060.rhTaskStatus = "idle";
  _0x4d4060.rhTaskRecovering = false;
  _0x4d4060.dreaminaSubmitId = "";
  _0x4d4060.dreaminaTaskStatus = "idle";
  _0x4d4060.dreaminaTaskPhase = "done";
  _0x4d4060.dreaminaTaskLabel = "";
  _0x4d4060.dreaminaTaskRecovering = false;
  _0x4d4060.dreaminaTaskLastRaw = {};
  _0x4d4060.asyncTaskId = "";
  _0x4d4060.asyncTaskStatus = "idle";
  _0x4d4060.asyncTaskRecovering = false;
  return _0x4d4060;
}
function _getStoryboardCellPosition(_0x566582, _0x117bd9) {
  const _0x152466 = Math.max(1, Math.round(Number(_0x566582?.cols) || 1));
  return {
    col: _0x117bd9 % _0x152466,
    row: Math.floor(_0x117bd9 / _0x152466)
  };
}
function _placeStoryboardCellForSwap(_0x26049b, _0x2d45b2, _0x46776a, _0x1b24d7, _0x36043b, _0x29998d) {
  Object.assign(_0x26049b, _getStoryboardCellPosition(_0x36043b, _0x29998d));
  if (isStoryboardCellEmpty(_0x2d45b2)) {
    return normalizeEmptyStoryboardCell(_0x26049b);
  }
  _0x26049b.storyboardSourceIndex = resolveStoryboardCellSourceIndex(_0x2d45b2, _0x1b24d7, _0x46776a);
  return _0x26049b;
}
function _isValidStoryboardCellTarget(_0x968cde, _0x573d5b) {
  return _0x968cde && _0x968cde.type === "storyboard" && Array.isArray(_0x968cde.cells) && Number.isInteger(_0x573d5b) && _0x573d5b >= 0 && _0x573d5b < _0x968cde.cells.length;
}
const LEGACY_VIDEO_EDIT_V52_MODEL_ID = "runninghub/2037339851183366146";
function normalizeNodeModel(_0x543e16) {
  if (!_0x543e16 || typeof _0x543e16 !== "object") {
    return;
  }
  if (String(_0x543e16.model || "") === LEGACY_VIDEO_EDIT_V52_MODEL_ID) {
    _0x543e16.model = RH_VIDEO_V54_MODEL_ID;
  }
}
function normalizeNodesCollection(_0x4e808a) {
  if (!_0x4e808a) {
    return;
  }
  if (Array.isArray(_0x4e808a)) {
    _0x4e808a.forEach(normalizeNodeModel);
    return;
  }
  if (typeof _0x4e808a === "object") {
    Object.values(_0x4e808a).forEach(normalizeNodeModel);
  }
}
function isDreaminaTaskNodeSnapshot(_0xbfcd18) {
  if (!_0xbfcd18 || typeof _0xbfcd18 !== "object") {
    return false;
  }
  const _0x4030ba = String(_0xbfcd18.type || "").trim().toLowerCase();
  if (!["ai-video", "ai-image", "source-image", "source-video"].includes(_0x4030ba)) {
    return false;
  }
  const _0x4ebfd0 = String(_0xbfcd18.provider || "").trim().toLowerCase();
  const _0x290543 = String(_0xbfcd18.model || "").trim();
  return _0x4ebfd0 === "dreamina" || resolveModelProvider(_0x290543, _0x4ebfd0) === "dreamina";
}
function inferAsyncProviderByModel(_0x4008e8, _0x2de35c = "") {
  const _0x34ffff = resolveModelProvider(_0x4008e8, "", {
    allowProviderHint: false
  });
  if (_0x34ffff) {
    return _0x34ffff;
  }
  const _0x1bb8c3 = String(_0x2de35c || "").trim().toLowerCase();
  if (_0x1bb8c3) {
    return _0x1bb8c3;
  }
  const _0x283fe9 = String(_0x4008e8 || "").trim();
  if (_0x283fe9 && !_0x283fe9.includes("/")) {
    return "grsai";
  }
  return "grsai";
}
function isAsyncTaskNodeSnapshot(_0xb7ac2a) {
  if (!_0xb7ac2a || typeof _0xb7ac2a !== "object") {
    return false;
  }
  const _0x347769 = String(_0xb7ac2a.type || "").trim().toLowerCase();
  if (!["ai-video", "ai-image", "source-video", "source-image"].includes(_0x347769)) {
    return false;
  }
  const _0x34accf = inferAsyncProviderByModel(_0xb7ac2a.model, _0xb7ac2a.asyncTaskProvider || _0xb7ac2a.provider || "");
  if (!_0x34accf || _0x34accf === "runninghubwf" || _0x34accf === "runninghub" || _0x34accf === "dreamina") {
    return false;
  }
  return true;
}
function isRunningHubTaskNodeSnapshot(_0xf95fe7) {
  if (!_0xf95fe7 || typeof _0xf95fe7 !== "object") {
    return false;
  }
  const _0x325ecc = String(_0xf95fe7.type || "").trim().toLowerCase();
  const _0x3a3f9a = String(_0xf95fe7.provider || "").trim().toLowerCase();
  const _0x55fdb4 = String(_0xf95fe7.model || "").trim();
  const _0x1e97da = resolveModelProvider(_0x55fdb4, _0x3a3f9a, {
    allowProviderHint: false
  });
  const _0x4511d0 = a724_0x3c0467(_0x55fdb4, _0x3a3f9a || "runninghubwf");
  const _0x1f96ed = _0x1e97da === "runninghub" && isModelApiModel(_0x55fdb4, "runninghub");
  if (_0x325ecc === "ai-audio") {
    return _0x3a3f9a === "runninghubwf";
  }
  if (_0x325ecc === "source-video") {
    return _0x3a3f9a === "runninghubwf" || _0x4511d0;
  }
  if (_0x325ecc === "source-image") {
    return _0x3a3f9a === "runninghubwf" || _0x3a3f9a === "runninghub" || _0x4511d0 || _0x1f96ed;
  }
  if (_0x325ecc === "source-audio") {
    return _0x3a3f9a === "runninghubwf" && _0x4511d0;
  }
  if (_0x325ecc === "ai-video") {
    return _0x3a3f9a === "runninghubwf" && _0x4511d0;
  }
  if (_0x325ecc === "ai-image") {
    return _0x4511d0 || _0x1f96ed || _0x3a3f9a === "runninghub" || _0x3a3f9a === "runninghubwf";
  }
  return false;
}
function hasResolvedVideoResultSnapshot(_0xf664f4) {
  if (!_0xf664f4 || typeof _0xf664f4 !== "object") {
    return false;
  }
  const _0x47c4c8 = Array.isArray(_0xf664f4.videos) ? _0xf664f4.videos : [];
  if (_0x47c4c8.length > 0) {
    return true;
  }
  return !!String(_0xf664f4.videoUrl || "").trim() || !!String(_0xf664f4.localPath || "").trim();
}
const HYDRATE_ACTIVE_STATUS_FIELDS = Object.freeze(["jobStatus", "rhTaskStatus", "dreaminaTaskStatus", "dreaminaTaskPhase", "asyncTaskStatus", "mediaTaskStatus"]);
const HYDRATE_RECOVERING_FIELDS = Object.freeze(["rhTaskRecovering", "dreaminaTaskRecovering", "asyncTaskRecovering"]);
function finalizeHydratedGenerationSnapshot(_0xa7edb5, _0xa1bf84) {
  _0xa7edb5.generationDuration = _0xa1bf84;
  if (_0xa7edb5.isGenerating === true) {
    _0xa7edb5.isGenerating = false;
  }
  for (const _0x12882e of HYDRATE_ACTIVE_STATUS_FIELDS) {
    const _0xd82109 = String(_0xa7edb5[_0x12882e] || "").trim();
    if (_0xd82109 && !isGenerationTaskTerminalStatus(_0xd82109)) {
      _0xa7edb5[_0x12882e] = "cancelled";
    }
  }
  for (const _0x89cbe3 of HYDRATE_RECOVERING_FIELDS) {
    if (_0xa7edb5[_0x89cbe3] === true) {
      _0xa7edb5[_0x89cbe3] = false;
    }
  }
}
function shouldPreserveRunningGenerationOnHydrate(_0x4c68db, {
  preserveLiveGeneration = false
} = {}) {
  if (preserveLiveGeneration && _0x4c68db?.isGenerating === true) {
    const _0x41a23c = [_0x4c68db.dreaminaTaskPhase, _0x4c68db.dreaminaTaskStatus, _0x4c68db.asyncTaskStatus, _0x4c68db.rhTaskStatus, _0x4c68db.mediaTaskStatus, _0x4c68db.jobStatus].some(_0x58fd82 => {
      const _0x44a80b = String(_0x58fd82 || "").trim().toLowerCase();
      return !!_0x44a80b && _0x44a80b !== "idle" && isGenerationTaskTerminalStatus(_0x44a80b);
    });
    if (!_0x41a23c) {
      return true;
    }
  }
  if (isDreaminaTaskNodeSnapshot(_0x4c68db)) {
    const _0x584c46 = String(_0x4c68db.dreaminaSubmitId || "").trim();
    if (!_0x584c46) {
      return false;
    }
    const _0x1ef6b4 = String(_0x4c68db.dreaminaTaskPhase || "").trim().toLowerCase();
    const _0x70a507 = String(_0x4c68db.dreaminaTaskStatus || "").trim().toLowerCase();
    if (isGenerationTaskTerminalStatus(_0x1ef6b4)) {
      return false;
    }
    if (isGenerationTaskTerminalStatus(_0x70a507)) {
      return false;
    }
    return true;
  }
  if (isAsyncTaskNodeSnapshot(_0x4c68db)) {
    const _0x57257c = String(_0x4c68db.asyncTaskId || "").trim();
    if (!_0x57257c) {
      return false;
    }
    const _0x3e4ac7 = String(_0x4c68db.asyncTaskKind || "").trim().toLowerCase();
    const _0x33fa4d = String(_0x4c68db.type || "").trim().toLowerCase();
    if (_0x3e4ac7 === "image" && !["ai-image", "source-image"].includes(_0x33fa4d)) {
      return false;
    }
    if (_0x3e4ac7 === "video" && !["ai-video", "source-video"].includes(_0x33fa4d)) {
      return false;
    }
    const _0x4743c4 = String(_0x4c68db.asyncTaskStatus || "").trim().toLowerCase();
    if (isGenerationTaskTerminalStatus(_0x4743c4)) {
      return false;
    }
    return true;
  }
  if (!isRunningHubTaskNodeSnapshot(_0x4c68db)) {
    return false;
  }
  const _0x11bc8f = String(_0x4c68db.rhTaskId || "").trim();
  if (!_0x11bc8f) {
    return false;
  }
  const _0x730052 = String(_0x4c68db.rhTaskStatus || "").trim().toLowerCase();
  if (isGenerationTaskTerminalStatus(_0x730052)) {
    return false;
  }
  return true;
}
function createStore() {
  let _0x1fd0a6 = createInitialState();
  const _0x19e343 = createRendererStateRevisionTracker(_0x1fd0a6);
  const _0x5169a8 = createViewportScreenFrame();
  const _0x4eb4ab = [];
  const _0x15ead8 = [];
  const _0x5740a0 = [];
  let _0x5e209c = 0;
  let _0xa6d75f = false;
  let _0x53d24b = () => true;
  function _0x2b88d0() {
    _0x1fd0a6._persistRev = (_0x1fd0a6._persistRev || 0) + 1;
  }
  function _0x435079() {
    _0x1fd0a6._edgesRev = (_0x1fd0a6._edgesRev || 0) + 1;
  }
  function _0x218d6a(_0x312a76) {
    _0x53d24b = typeof _0x312a76 === "function" ? _0x312a76 : () => true;
  }
  function _0x3620d2(_0x36aca2, _0x32905c) {
    if (!_0x5169a8.set(_0x36aca2, _0x32905c)) {
      return;
    }
    _0x1fd0a6.viewport = _0x5169a8.attach(_0x1fd0a6.viewport);
    _0x4ece68();
  }
  function _0xf8d38d(_0x49acb1, _0xdf7f24) {
    if (!_0xdf7f24 || typeof _0xdf7f24 !== "object") {
      return _0xdf7f24;
    }
    const _0x552490 = {
      ..._0xdf7f24
    };
    const _0x208a48 = _0x483ed5 => Object.prototype.hasOwnProperty.call(_0x552490, _0x483ed5);
    const _0x13afc2 = () => {
      const _0x43e5d8 = [_0x552490.images, _0x552490.videos].filter(Array.isArray);
      for (const _0x487173 of _0x43e5d8) {
        let _0x3cc49d = "";
        let _0x27b433 = false;
        for (const _0x26db22 of _0x487173) {
          if (!_0x26db22 || typeof _0x26db22 !== "object") {
            continue;
          }
          const _0x46c144 = String(_0x26db22.error || _0x26db22.message || "").trim();
          if (_0x46c144 && !_0x3cc49d) {
            _0x3cc49d = _0x46c144;
          }
          if (String(_0x26db22.localPath || _0x26db22.originalLocalPath || _0x26db22.displayLocalPath || _0x26db22.thumbLocalPath || _0x26db22.imageUrl || _0x26db22.videoUrl || _0x26db22.thumbUrl || _0x26db22.sourceUrl || "").trim()) {
            _0x27b433 = true;
          }
        }
        if (_0x3cc49d && !_0x27b433) {
          return _0x3cc49d;
        }
      }
      return String(_0x552490.jobError || "").trim();
    };
    const _0x1d90ed = _0x208a48("isGenerating");
    const _0x947119 = _0x13afc2();
    const _0x3dceda = _0x35f596 => String(_0x35f596 || "").trim().toLowerCase();
    const _0x360da5 = _0xfcfd33 => ["error", "failed", "fail", "cancelled", "canceled"].includes(_0x3dceda(_0xfcfd33));
    const _0x375882 = _0x459ba9 => {
      if (_0x208a48(_0x459ba9)) {
        return String(_0x552490[_0x459ba9] || "").trim();
      }
      return String(_0x49acb1?.[_0x459ba9] || "").trim();
    };
    const _0x39bac5 = () => !!_0x375882("dreaminaSubmitId");
    const _0x285e30 = _0x427083 => {
      if (_0x360da5(_0x427083)) {
        return true;
      }
      if (_0x39bac5()) {
        return true;
      }
      if (_0x3dceda(_0x427083) === "idle") {
        return false;
      }
      return _0x3dceda(_0x552490.dreaminaTaskStatus) !== "idle";
    };
    const _0x298fa0 = [{
      status: _0x208a48("asyncTaskStatus") ? _0x552490.asyncTaskStatus : null,
      active: _0x360da5(_0x552490.asyncTaskStatus) || !!_0x375882("asyncTaskId") || _0x3dceda(_0x552490.asyncTaskStatus) !== "idle"
    }, {
      status: _0x208a48("rhTaskStatus") ? _0x552490.rhTaskStatus : null,
      active: _0x360da5(_0x552490.rhTaskStatus) || !!_0x375882("rhTaskId") || _0x3dceda(_0x552490.rhTaskStatus) !== "idle"
    }, {
      status: _0x208a48("dreaminaTaskStatus") ? _0x552490.dreaminaTaskStatus : null,
      active: _0x285e30(_0x552490.dreaminaTaskStatus)
    }, {
      status: _0x208a48("dreaminaTaskPhase") ? _0x552490.dreaminaTaskPhase : null,
      active: _0x285e30(_0x552490.dreaminaTaskPhase)
    }, {
      status: _0x208a48("mediaTaskStatus") ? _0x552490.mediaTaskStatus : null,
      active: true
    }].filter(_0x4f2790 => _0x4f2790.active === true && String(_0x4f2790.status || "").trim());
    const _0x567b7d = _0x298fa0.find(_0x3858aa => isGenerationTaskTerminalStatus(_0x3858aa.status))?.status;
    const _0x11b0b1 = _0x208a48("mediaTaskStatus") ? String(_0x552490.mediaTaskStatus || "").trim().toLowerCase() : "";
    if (!_0x1d90ed && (_0x11b0b1 === "waiting" || _0x11b0b1 === "processing")) {
      _0x552490.isGenerating = true;
    }
    if (_0x947119) {
      _0x552490.isGenerating = false;
      _0x552490.jobStatus = "error";
      _0x552490.jobError = _0x947119;
      if (_0x208a48("dreaminaTaskStatus")) {
        _0x552490.dreaminaTaskStatus = "failed";
      }
      if (_0x208a48("dreaminaTaskPhase")) {
        _0x552490.dreaminaTaskPhase = "failed";
      }
      if (_0x208a48("dreaminaTaskLabel")) {
        _0x552490.dreaminaTaskLabel = _0x947119;
      }
      if (_0x208a48("dreaminaTaskRecovering")) {
        _0x552490.dreaminaTaskRecovering = false;
      }
      if (_0x208a48("asyncTaskStatus")) {
        _0x552490.asyncTaskStatus = "failed";
      }
      if (_0x208a48("asyncTaskRecovering")) {
        _0x552490.asyncTaskRecovering = false;
      }
      if (_0x208a48("rhTaskStatus")) {
        _0x552490.rhTaskStatus = "failed";
      }
      if (_0x208a48("rhTaskRecovering")) {
        _0x552490.rhTaskRecovering = false;
      }
    }
    if (_0x567b7d) {
      _0x552490.isGenerating = false;
      const _0x4cfcf7 = resolveJobStatusFromTaskStatus(_0x567b7d, _0x552490.jobStatus ?? null);
      if (_0x4cfcf7 !== undefined) {
        _0x552490.jobStatus = _0x4cfcf7;
      }
      if (_0x208a48("dreaminaTaskStatus") || _0x208a48("dreaminaTaskPhase")) {
        _0x552490.dreaminaTaskRecovering = false;
      }
      if (_0x208a48("asyncTaskStatus")) {
        _0x552490.asyncTaskRecovering = false;
      }
      if (_0x208a48("rhTaskStatus")) {
        _0x552490.rhTaskRecovering = false;
      }
    }
    if (_0x552490.isGenerating === true) {
      if (!_0x208a48("jobStatus")) {
        _0x552490.jobStatus = "running";
      }
      const _0x4fe8a2 = Number(_0x552490.generationStartTime);
      if (!Number.isFinite(_0x4fe8a2) || _0x4fe8a2 <= 0) {
        const _0x40bbe9 = Number(_0x49acb1?.generationStartTime);
        _0x552490.generationStartTime = Number.isFinite(_0x40bbe9) && _0x40bbe9 > 0 ? _0x40bbe9 : Date.now();
      }
      _0x552490.generationDuration = null;
      return _0x552490;
    }
    const _0x1d69e2 = _0x49acb1?.isGenerating === true;
    const _0x59b02a = _0x552490.isGenerating === false && _0x552490.generationDuration == null && (_0x1d69e2 || !!_0x947119 || !!_0x567b7d);
    if (_0x59b02a) {
      const _0x41cc55 = _0x208a48("generationStartTime") ? Number(_0x552490.generationStartTime) : Number(_0x49acb1?.generationStartTime);
      _0x552490.generationDuration = Number.isFinite(_0x41cc55) && _0x41cc55 > 0 ? Math.max(0, Date.now() - _0x41cc55) : _0x1d69e2 ? 0 : _0x552490.generationDuration;
    }
    return _0x552490;
  }
  function _0x4ece68() {
    if (_0x5e209c > 0) {
      _0xa6d75f = true;
      return;
    }
    for (const _0x278df3 of _0x15ead8) {
      _0x278df3(_0x1fd0a6);
    }
    if (_0x4eb4ab.length > 0) {
      const _0x2988f9 = deepClone(_0x1fd0a6);
      for (const _0x28b87f of _0x4eb4ab) {
        _0x28b87f(_0x2988f9);
      }
    }
    for (const {
      selector: _0x417d06,
      callback: _0x6993a6,
      isEqual: _0x447c7b,
      lastValue: _0x511219
    } of _0x5740a0) {
      const _0x40aa22 = _0x417d06(_0x1fd0a6);
      if (!_0x447c7b(_0x511219.value, _0x40aa22)) {
        _0x511219.value = snapshotSelectorValue(_0x40aa22);
        _0x6993a6(_0x40aa22);
      }
    }
  }
  function _0x20a039(_0xfd6af1) {
    if (typeof _0xfd6af1 !== "function") {
      throw new TypeError("[store] batch() 的参数必须是函数");
    }
    _0x5e209c++;
    try {
      return _0xfd6af1();
    } finally {
      _0x5e209c--;
      if (_0x5e209c === 0 && _0xa6d75f) {
        _0xa6d75f = false;
        _0x4ece68();
      }
    }
  }
  function _0x145f9e() {
    _0x19e343.renderRequest();
    _0x4ece68();
  }
  function _0x4b897a() {
    _0x19e343.renderRequest();
    _0x4ece68();
  }
  function _0x173431(_0x5990d5) {
    if (typeof _0x5990d5 !== "function") {
      throw new TypeError("[store] subscribe() 的参数必须是一个函数");
    }
    _0x4eb4ab.push(_0x5990d5);
    _0x5990d5(deepClone(_0x1fd0a6));
    return function _0x4b06e7() {
      const _0x250384 = _0x4eb4ab.indexOf(_0x5990d5);
      if (_0x250384 !== -1) {
        _0x4eb4ab.splice(_0x250384, 1);
      }
    };
  }
  function _0x329bf1(_0x58f69d) {
    if (typeof _0x58f69d !== "function") {
      throw new TypeError("[store] subscribeRaw() 的参数必须是一个函数");
    }
    _0x15ead8.push(_0x58f69d);
    _0x58f69d(_0x1fd0a6);
    return function _0x1a271d() {
      const _0x48ab60 = _0x15ead8.indexOf(_0x58f69d);
      if (_0x48ab60 !== -1) {
        _0x15ead8.splice(_0x48ab60, 1);
      }
    };
  }
  function _0x28c1a5(_0x917593, _0x201bfb, _0x45f54f = {}) {
    if (typeof _0x917593 !== "function") {
      throw new TypeError("[store] subscribeSelector() 的 selector 必须是函数");
    }
    if (typeof _0x201bfb !== "function") {
      throw new TypeError("[store] subscribeSelector() 的 callback 必须是函数");
    }
    const _0x1888f7 = _0x45f54f.isEqual || shallowEqual;
    const _0x34f494 = _0x917593(_0x1fd0a6);
    const _0x5299d6 = {
      selector: _0x917593,
      callback: _0x201bfb,
      isEqual: _0x1888f7,
      lastValue: {
        value: snapshotSelectorValue(_0x34f494)
      }
    };
    _0x5740a0.push(_0x5299d6);
    _0x201bfb(_0x34f494);
    return function _0x145ef5() {
      const _0x5bf75d = _0x5740a0.indexOf(_0x5299d6);
      if (_0x5bf75d !== -1) {
        _0x5740a0.splice(_0x5bf75d, 1);
      }
    };
  }
  function _0x5ae55c(_0x5e3b9c) {
    if (!_0x5e3b9c || !_0x5e3b9c.id) {
      throw new Error("[store] addNode() 需要提供含有 id 字段的节点数据");
    }
    const _0x42467a = applyFeatureSelectionsToNodeData(JSON.parse(JSON.stringify(_0x5e3b9c)), _0x1fd0a6.ui?.featureSelections || {});
    const _0x6d16d = sanitizeCanvasNodeMediaPatchForStore(_0x42467a);
    const _0x21a86e = {
      text: "文本块",
      "ai-text": "生成文本",
      "ai-image": "生成图像",
      "ai-video": "生成视频",
      "ai-audio": "生成音频",
      "source-text": "源文本",
      "comment-note": "",
      "source-image": "源图像",
      "source-video": "源视频",
      "source-audio": "源音频",
      "panorama-scene": "3D导演台",
      "panorama-360": "360全景图",
      "storyboard-script": "分镜脚本",
      group: "组合",
      storyboard: "宫格分镜",
      image: "源图像",
      audio: "源音频",
      video: "源视频"
    };
    const _0x4fffb3 = Object.prototype.hasOwnProperty.call(_0x21a86e, _0x6d16d.type) ? _0x21a86e[_0x6d16d.type] : "未命名";
    if (_0x6d16d.type === "storyboard") {
      if (!Array.isArray(_0x6d16d.cells)) {
        _0x6d16d.cells = [];
      } else {
        _0x6d16d.cells = _0x6d16d.cells.map(_0x151a12 => ({
          ..._0x151a12,
          id: generateId("cell")
        }));
      }
    }
    if (_0x6d16d.type === "storyboard-script") {
      _0x6d16d.storyboardScript = createDefaultStoryboardScriptState(_0x6d16d.storyboardScript);
    }
    if (_0x6d16d.type === "comment-note") {
      _0x6d16d.jumpShortcut = normalizeCommentNoteJumpShortcut(_0x6d16d.jumpShortcut);
    }
    const {
      _bizRev: _0xfd52f9,
      ..._0x48a033
    } = _0x6d16d;
    const _0x61a60f = _0xf8d38d(null, _0x48a033);
    const _0x1e2f3a = {
      parentId: null,
      name: _0x4fffb3,
      _bizRev: 1,
      ..._0x61a60f
    };
    captureFeatureSelectionsFromNodePatch(_0x1e2f3a, _0x1e2f3a, _0x1fd0a6.ui?.featureSelections || {});
    _0x19e343.add(_0x1fd0a6.nodes[_0x1e2f3a.id], _0x1e2f3a);
    _0x1fd0a6.nodes[_0x1e2f3a.id] = _0x1e2f3a;
    _0x1fd0a6._nodeCount = (_0x1fd0a6._nodeCount || 0) + 1;
    _0x2b88d0();
    if (_0x1e2f3a.parentId) {
      _0x6fa055(_0x1e2f3a.id, _0x1e2f3a.parentId);
    }
    _0x4ece68();
  }
  function _0x6fa055(_0x2cc701, _0x4741c0, _0x5bdef1 = null) {
    if (_0x5bdef1) {
      _0x1fd0a6._parentToChildren[_0x5bdef1]?.delete(_0x2cc701);
    }
    if (_0x4741c0) {
      if (!_0x1fd0a6._parentToChildren[_0x4741c0]) {
        _0x1fd0a6._parentToChildren[_0x4741c0] = new Set();
      }
      _0x1fd0a6._parentToChildren[_0x4741c0].add(_0x2cc701);
    }
  }
  function _0x3c5935(_0x577835, _0x3997e9 = null) {
    if (_0x3997e9) {
      const _0x2b6011 = _0x1fd0a6._parentToChildren[_0x3997e9];
      if (_0x2b6011) {
        _0x2b6011.delete(_0x577835);
        if (_0x2b6011.size === 0) {
          delete _0x1fd0a6._parentToChildren[_0x3997e9];
        }
      }
    }
    if (_0x1fd0a6._parentToChildren[_0x577835]) {
      delete _0x1fd0a6._parentToChildren[_0x577835];
    }
  }
  function _0x3e9b82(_0x63e098) {
    const _0x4ead71 = new Set(_0x63e098);
    const _0x38ce5e = [..._0x63e098];
    while (_0x38ce5e.length > 0) {
      const _0x19880a = _0x38ce5e.pop();
      const _0x4cc0f9 = _0x1fd0a6._parentToChildren[_0x19880a];
      if (!_0x4cc0f9) {
        continue;
      }
      for (const _0x550ca6 of _0x4cc0f9) {
        if (!_0x1fd0a6.nodes[_0x550ca6]) {
          continue;
        }
        if (_0x4ead71.has(_0x550ca6)) {
          continue;
        }
        _0x4ead71.add(_0x550ca6);
        _0x38ce5e.push(_0x550ca6);
      }
    }
    return _0x4ead71;
  }
  function _0x3b47a7(_0xd974f5, _0x1df9bb, _0x142f84) {
    _0x2ef2ad([_0xd974f5], _0x1df9bb, _0x142f84);
  }
  function _0x2ef2ad(_0x227ce5, _0x4a48ab, _0x1cfce4) {
    if (!_0x227ce5 || _0x227ce5.length === 0) {
      return;
    }
    const _0x44a501 = Number(_0x4a48ab);
    const _0x3a35a3 = Number(_0x1cfce4);
    if (!Number.isFinite(_0x44a501) || !Number.isFinite(_0x3a35a3)) {
      return;
    }
    if (_0x44a501 === 0 && _0x3a35a3 === 0) {
      return;
    }
    const _0x380fb8 = _0x3e9b82(_0x227ce5);
    let _0x2d678a = false;
    for (const _0x4101c7 of _0x380fb8) {
      const _0x279754 = _0x1fd0a6.nodes[_0x4101c7];
      if (!_0x279754) {
        continue;
      }
      const _0x44b427 = (_0x279754.x || 0) + _0x44a501;
      const _0xc81722 = (_0x279754.y || 0) + _0x3a35a3;
      if (_0x44b427 === _0x279754.x && _0xc81722 === _0x279754.y) {
        continue;
      }
      _0x279754.x = _0x44b427;
      _0x279754.y = _0xc81722;
      _0x2d678a = true;
    }
    if (!_0x2d678a) {
      return;
    }
    _0x19e343.geometry();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x19307a(_0x510d39, _0x5a411c, _0x326da5, _0x49f54d) {
    if (!_0x5a411c) {
      return;
    }
    const _0x42b419 = _0x510d39[_0x5a411c];
    if (_0x42b419) {
      _0x42b419.dx += _0x326da5;
      _0x42b419.dy += _0x49f54d;
      return;
    }
    _0x510d39[_0x5a411c] = {
      dx: _0x326da5,
      dy: _0x49f54d
    };
  }
  function _0x27e7e2(_0x4355d4) {
    if (!_0x4355d4 || typeof _0x4355d4 !== "object") {
      return;
    }
    const _0x416750 = {};
    for (const [_0x3cc287, _0x134844] of Object.entries(_0x4355d4)) {
      if (!_0x3cc287 || !_0x134844 || !_0x1fd0a6.nodes[_0x3cc287]) {
        continue;
      }
      const _0x44bc4b = Number(_0x134844.dx);
      const _0x55ae87 = Number(_0x134844.dy);
      if (!Number.isFinite(_0x44bc4b) || !Number.isFinite(_0x55ae87)) {
        continue;
      }
      if (_0x44bc4b === 0 && _0x55ae87 === 0) {
        continue;
      }
      _0x416750[_0x3cc287] = {
        dx: _0x44bc4b,
        dy: _0x55ae87
      };
    }
    const _0x40f766 = Object.keys(_0x416750);
    if (_0x40f766.length === 0) {
      return;
    }
    const _0x6cb18 = new Set(_0x40f766);
    const _0x2e089a = {};
    for (const _0xae2a8e of _0x40f766) {
      const _0xbad90f = _0x416750[_0xae2a8e];
      _0x19307a(_0x2e089a, _0xae2a8e, _0xbad90f.dx, _0xbad90f.dy);
      const _0x5395eb = [_0xae2a8e];
      while (_0x5395eb.length > 0) {
        const _0x26dca4 = _0x5395eb.pop();
        const _0x38bf78 = _0x1fd0a6._parentToChildren[_0x26dca4];
        if (!_0x38bf78) {
          continue;
        }
        for (const _0x6b4f31 of _0x38bf78) {
          if (!_0x1fd0a6.nodes[_0x6b4f31]) {
            continue;
          }
          if (_0x6cb18.has(_0x6b4f31)) {
            continue;
          }
          _0x19307a(_0x2e089a, _0x6b4f31, _0xbad90f.dx, _0xbad90f.dy);
          _0x5395eb.push(_0x6b4f31);
        }
      }
    }
    let _0x379192 = false;
    for (const [_0x22e7bc, _0x4136a4] of Object.entries(_0x2e089a)) {
      const _0x27429e = _0x1fd0a6.nodes[_0x22e7bc];
      if (!_0x27429e) {
        continue;
      }
      const _0x4d067e = (_0x27429e.x || 0) + _0x4136a4.dx;
      const _0xf73afa = (_0x27429e.y || 0) + _0x4136a4.dy;
      if (_0x4d067e === _0x27429e.x && _0xf73afa === _0x27429e.y) {
        continue;
      }
      _0x27429e.x = _0x4d067e;
      _0x27429e.y = _0xf73afa;
      _0x379192 = true;
    }
    if (!_0x379192) {
      return;
    }
    _0x19e343.geometry();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x5ae23e(_0x416a70, _0x17fed8) {
    if (!Array.isArray(_0x416a70) || _0x416a70.length === 0) {
      return;
    }
    const _0x1fa4c1 = _0x17fed8 || null;
    let _0x37202f = false;
    _0x416a70.forEach(_0x443953 => {
      const _0x2458a2 = _0x1fd0a6.nodes[_0x443953];
      if (_0x2458a2) {
        const _0x6a41a2 = _0x2458a2.parentId || null;
        if (_0x6a41a2 === _0x1fa4c1) {
          return;
        }
        _0x2458a2.parentId = _0x1fa4c1;
        _0x2458a2._bizRev = (typeof _0x2458a2._bizRev === "number" ? _0x2458a2._bizRev : 0) + 1;
        _0x6fa055(_0x443953, _0x1fa4c1, _0x6a41a2);
        _0x37202f = true;
      }
    });
    if (!_0x37202f) {
      return;
    }
    _0x19e343.content();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x233159(_0x34f82a = {}) {
    const _0x204203 = getFixedInputSlotConfigFromManifest(_0x34f82a);
    if (!_0x204203) {
      return null;
    }
    const _0x161a24 = getTargetInputPolicy(_0x34f82a);
    const _0x34ddd0 = new Set(_0x204203.visibleSlots || []);
    const _0x579d4e = new Set();
    const _0x16f49f = new Set();
    const _0x480fdf = {};
    const _0x3461aa = new Map();
    (_0x204203.exclusiveGroups || []).forEach(_0x890cb6 => {
      (_0x890cb6.slots || []).forEach(_0x5e1f0d => {
        _0x3461aa.set(_0x5e1f0d, _0x890cb6.id);
      });
    });
    const _0x484b96 = (_0x4b70fc, _0x14a05b) => {
      const _0x52ebe2 = Number(_0x161a24?.maxByKind?.[_0x4b70fc]);
      const _0x28b326 = Number(_0x480fdf[_0x4b70fc] || 0);
      if (!Number.isFinite(_0x52ebe2) || _0x52ebe2 <= _0x14a05b || _0x28b326 >= _0x52ebe2) {
        return false;
      }
      _0x480fdf[_0x4b70fc] = _0x28b326 + 1;
      return true;
    };
    return {
      reserveSlot(_0x25d38b, _0x11747c = null) {
        const _0x1a6dd1 = String(_0x25d38b || "").trim();
        if (_0x1a6dd1 === "text") {
          return true;
        }
        const _0x1450dc = String(_0x11747c?.refSlot || "").trim();
        const _0x48267d = (_0x204203.slotOrderByType?.[_0x1a6dd1] || []).filter(_0x37bb7c => _0x34ddd0.has(_0x37bb7c));
        if (_0x48267d.length === 0) {
          return _0x484b96(_0x1a6dd1, 0);
        }
        const _0xe2df50 = _0x1450dc && _0x48267d.includes(_0x1450dc) && _0x34ddd0.has(_0x1450dc) ? _0x1450dc : _0x48267d.find(_0x5c2f1e => !_0x579d4e.has(_0x5c2f1e));
        if (!_0xe2df50 || _0x579d4e.has(_0xe2df50)) {
          return _0x484b96(_0x1a6dd1, _0x48267d.length);
        }
        const _0x2af745 = _0x3461aa.get(_0xe2df50);
        if (_0x2af745 && _0x16f49f.has(_0x2af745)) {
          return _0x484b96(_0x1a6dd1, _0x48267d.length);
        }
        _0x579d4e.add(_0xe2df50);
        if (_0x2af745) {
          _0x16f49f.add(_0x2af745);
        }
        _0x480fdf[_0x1a6dd1] = Number(_0x480fdf[_0x1a6dd1] || 0) + 1;
        return _0xe2df50;
      },
      reserve(_0x14133a, _0x5bffba = null) {
        return !!this.reserveSlot(_0x14133a, _0x5bffba);
      }
    };
  }
  function _0x5ef073(_0x56c383) {
    const _0x248c97 = _0x1fd0a6;
    const _0x59643e = _0x248c97.nodes[_0x56c383];
    if (!_0x59643e) {
      return [];
    }
    if (!canTargetReceiveInputs(_0x59643e)) {
      return [];
    }
    const _0x1730b4 = _0x59643e.parentId;
    const _0x5d3a92 = getTargetInputPolicy(_0x59643e);
    const _0x13c6a1 = _0x233159(_0x59643e);
    const _0x3f4c09 = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0
    };
    const _0xbededa = [];
    const _0x1e8173 = [];
    const _0xc56d04 = new Set();
    const _0x252296 = (_0x137564, _0x26c307 = null) => {
      const _0x1a958f = resolveEffectiveInputKind(_0x137564, _0x26c307);
      if (!_0x1a958f) {
        return "";
      }
      if (!isInputKindAllowed(_0x5d3a92, _0x1a958f)) {
        return "";
      }
      if (!hasUsableInputNodeSource(_0x137564, {
        edge: _0x26c307,
        kind: _0x1a958f
      })) {
        return "";
      }
      return _0x1a958f;
    };
    Object.values(_0x248c97.edges || {}).forEach(_0x161a8f => {
      if (!_0x161a8f || _0x161a8f.targetId !== _0x56c383) {
        return;
      }
      const _0x55823e = _0x248c97.nodes[_0x161a8f.sourceId];
      if (!_0x55823e) {
        return;
      }
      if (isGroupNodeData(_0x55823e)) {
        return;
      }
      const _0x576d7c = _0x252296(_0x55823e, _0x161a8f);
      if (!_0x576d7c) {
        return;
      }
      const _0x259dc5 = _0x13c6a1 ? _0x13c6a1.reserveSlot(_0x576d7c, _0x161a8f) : "";
      if (_0x13c6a1 && !_0x259dc5) {
        return;
      }
      if (_0x259dc5 && typeof _0x259dc5 === "string" && !_0x161a8f.refSlot) {
        _0xbededa.push({
          ..._0x161a8f,
          refSlot: _0x259dc5
        });
      } else {
        _0xbededa.push(_0x161a8f);
      }
      _0xc56d04.add(_0x161a8f.sourceId);
      _0x3f4c09[_0x576d7c] = (_0x3f4c09[_0x576d7c] || 0) + 1;
    });
    Object.values(_0x248c97.edges || {}).forEach(_0x5af7ad => {
      if (!_0x5af7ad || _0x5af7ad.targetId !== _0x56c383) {
        return;
      }
      const _0x4921ac = _0x248c97.nodes[_0x5af7ad.sourceId];
      if (!isGroupNodeData(_0x4921ac)) {
        return;
      }
      _0xbededa.push(...collectGroupOutputIncomingEdges({
        edge: _0x5af7ad,
        groupNode: _0x4921ac,
        nodes: _0x248c97.nodes,
        targetId: _0x56c383,
        policy: _0x5d3a92,
        counts: _0x3f4c09,
        directSourceIds: _0xc56d04,
        acceptSource: _0x252296,
        canAppendInputKindWithinLimit: canAppendInputKindWithinLimit,
        reserveInputSlot: _0x13c6a1 ? (_0x4b34f2, _0x2db700) => _0x13c6a1.reserveSlot(_0x4b34f2, _0x2db700) : null
      }));
    });
    if (_0x1730b4) {
      Object.values(_0x248c97.edges || {}).forEach(_0x402be5 => {
        if (!_0x402be5 || _0x402be5.targetId !== _0x1730b4) {
          return;
        }
        const _0x5d35c9 = _0x248c97.nodes[_0x402be5.sourceId];
        if (!_0x5d35c9) {
          return;
        }
        if (isGroupNodeData(_0x5d35c9)) {
          const _0x15d912 = collectGroupOutputIncomingEdges({
            edge: _0x402be5,
            groupNode: _0x5d35c9,
            nodes: _0x248c97.nodes,
            targetId: _0x56c383,
            policy: _0x5d3a92,
            counts: _0x3f4c09,
            directSourceIds: _0xc56d04,
            acceptSource: _0x252296,
            canAppendInputKindWithinLimit: canAppendInputKindWithinLimit,
            reserveInputSlot: _0x13c6a1 ? (_0x4fe3cd, _0x485e00) => _0x13c6a1.reserveSlot(_0x4fe3cd, _0x485e00) : null
          });
          _0x1e8173.push(..._0x15d912.map(_0x3daa5f => ({
            ..._0x3daa5f,
            isGroupShared: true,
            sharedGroupId: _0x1730b4
          })));
          return;
        }
        const _0x38cdf2 = _0x252296(_0x5d35c9, _0x402be5);
        if (!_0x38cdf2) {
          return;
        }
        if (!canAppendInputKindWithinLimit(_0x5d3a92, _0x38cdf2, _0x3f4c09)) {
          return;
        }
        const _0x50a5e1 = _0x13c6a1 ? _0x13c6a1.reserveSlot(_0x38cdf2, _0x402be5) : "";
        if (_0x13c6a1 && !_0x50a5e1) {
          return;
        }
        _0x1e8173.push({
          ..._0x402be5,
          ...(_0x50a5e1 && typeof _0x50a5e1 === "string" && !_0x402be5.refSlot ? {
            refSlot: _0x50a5e1
          } : null),
          isGroupShared: true,
          sharedGroupId: _0x1730b4,
          effectiveTargetId: _0x56c383
        });
        _0x3f4c09[_0x38cdf2] = (_0x3f4c09[_0x38cdf2] || 0) + 1;
      });
    }
    return [..._0xbededa, ..._0x1e8173].map(_0x30f1b0 => cloneEdgeSnapshot(_0x30f1b0));
  }
  function _0x34c25b(_0x58c781) {
    const _0x3e4688 = new Set(_0x58c781);
    const _0x39731d = [];
    _0x19e343.remove(_0x58c781);
    for (const _0x314aea of _0x58c781) {
      const _0x49ffe4 = _0x1fd0a6.nodes[_0x314aea];
      if (!_0x49ffe4) {
        continue;
      }
      _0x39731d.push({
        id: _0x314aea,
        parentId: _0x49ffe4.parentId || null
      });
    }
    for (const _0x3615e2 of _0x58c781) {
      delete _0x1fd0a6.nodes[_0x3615e2];
    }
    _0x1fd0a6._nodeCount = Object.keys(_0x1fd0a6.nodes).length;
    for (const {
      id: _0x5a2a4b,
      parentId: _0x5a287
    } of _0x39731d) {
      _0x3c5935(_0x5a2a4b, _0x5a287);
    }
    let _0x552c31 = false;
    for (const _0x7851db of Object.keys(_0x1fd0a6.edges)) {
      const _0x2a9ac3 = _0x1fd0a6.edges[_0x7851db];
      if (_0x3e4688.has(_0x2a9ac3.sourceId) || _0x3e4688.has(_0x2a9ac3.targetId)) {
        delete _0x1fd0a6.edges[_0x7851db];
        _0x552c31 = true;
      }
    }
    if (_0x552c31) {
      _0x435079();
    }
    _0x2b88d0();
    emitNodeDeletions(_0x39731d);
    _0x4ece68();
  }
  function _0x485e03(_0x5e701d) {
    if (!_0x5e701d || !_0x5e701d.id) {
      throw new Error("[store] addEdge() 需要提供含有 id 字段的连线数据");
    }
    _0x1fd0a6.edges[_0x5e701d.id] = {
      isThumbnailActive: true,
      type: null,
      ..._0x5e701d
    };
    _0x435079();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x37e122(_0x87b52a, _0x3c30e0) {
    _0x87b52a.forEach(_0x3768a0 => {
      if (_0x1fd0a6.edges[_0x3768a0]) {
        delete _0x1fd0a6.edges[_0x3768a0];
      }
    });
    _0x3c30e0.forEach(_0x1765c6 => {
      const {
        isGroupShared: _0x3b3b2d,
        sharedGroupId: _0x53dfec,
        effectiveTargetId: _0x2558b7,
        ..._0x51bd67
      } = _0x1765c6 || {};
      if (!_0x51bd67.id) {
        return;
      }
      _0x1fd0a6.edges[_0x51bd67.id] = _0x51bd67;
    });
    _0x435079();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x1d744d(_0x235f19, _0xaced82, _0x37024a) {
    const _0x31a8a3 = _0x1fd0a6.viewport || {};
    if (_0x31a8a3.x === _0x235f19 && _0x31a8a3.y === _0xaced82 && _0x31a8a3.zoom === _0x37024a) {
      return;
    }
    const _0x1452bd = _0x31a8a3.zoom;
    _0x1fd0a6.viewport = _0x5169a8.attach({
      x: _0x235f19,
      y: _0xaced82,
      zoom: _0x37024a
    });
    if (_0x1452bd !== _0x37024a) {
      if (_0x53d24b()) {
        _0x2b88d0();
      }
    }
    _0x4ece68();
  }
  function _0xb2f9a8() {
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x5d3283(_0x3b8608, _0x36443f) {
    const _0x1c494b = _0x1fd0a6.nodes[_0x3b8608];
    if (!_0x1c494b) {
      throw new Error("[store] updateNodeData() 找不到 id 为 \"" + _0x3b8608 + "\" 的节点");
    }
    const _0x13f8d5 = JSON.parse(JSON.stringify(_0x36443f));
    const {
      _bizRev: _0x1f091c,
      ..._0x192c6b
    } = _0x13f8d5;
    if (_0x192c6b.cells && Array.isArray(_0x192c6b.cells)) {
      _0x192c6b.cells = _0x192c6b.cells.map(_0x193652 => ({
        ..._0x193652
      }));
    }
    const _0x4329ca = sanitizeCanvasNodeMediaPatchForStore(_0x192c6b, _0x1c494b);
    const _0x375ae0 = _0xf8d38d(_0x1c494b, _0x4329ca);
    if (_isPatchNoop(_0x1c494b, _0x375ae0)) {
      return;
    }
    const _0x5c1415 = Object.prototype.hasOwnProperty.call(_0x375ae0, "parentId") ? _0x375ae0.parentId : _0x1c494b.parentId;
    captureFeatureSelectionsFromNodePatch(_0x1c494b, _0x375ae0, _0x1fd0a6.ui?.featureSelections || {});
    const _0x27eae9 = (typeof _0x1c494b._bizRev === "number" ? _0x1c494b._bizRev : 0) + 1;
    _0x1fd0a6.nodes[_0x3b8608] = {
      ..._0x1c494b,
      ..._0x375ae0,
      _bizRev: _0x27eae9
    };
    if (_0x5c1415 !== _0x1c494b.parentId) {
      _0x6fa055(_0x3b8608, _0x5c1415, _0x1c494b.parentId);
    }
    _0x19e343.patch(_0x1c494b, _0x1fd0a6.nodes[_0x3b8608]);
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x56a199(_0x400e52) {
    let _0x78cf76 = false;
    const _0x278d7d = _0x19e343.batch();
    for (const [_0x55f542, _0x2c5fb4] of Object.entries(_0x400e52)) {
      const _0xe34395 = _0x1fd0a6.nodes[_0x55f542];
      if (_0xe34395) {
        const _0x2f4f2a = JSON.parse(JSON.stringify(_0x2c5fb4));
        const {
          _bizRev: _0x3ba323,
          ..._0x2c5959
        } = _0x2f4f2a;
        if (_0x2c5959.cells && Array.isArray(_0x2c5959.cells)) {
          _0x2c5959.cells = _0x2c5959.cells.map(_0x464053 => ({
            ..._0x464053
          }));
        }
        const _0x2c94a1 = sanitizeCanvasNodeMediaPatchForStore(_0x2c5959, _0xe34395);
        const _0x8a7c07 = _0xf8d38d(_0xe34395, _0x2c94a1);
        if (_isPatchNoop(_0xe34395, _0x8a7c07)) {
          continue;
        }
        const _0x15166e = Object.prototype.hasOwnProperty.call(_0x8a7c07, "parentId") ? _0x8a7c07.parentId : _0xe34395.parentId;
        captureFeatureSelectionsFromNodePatch(_0xe34395, _0x8a7c07, _0x1fd0a6.ui?.featureSelections || {});
        const _0x3f012c = (typeof _0xe34395._bizRev === "number" ? _0xe34395._bizRev : 0) + 1;
        _0x1fd0a6.nodes[_0x55f542] = {
          ..._0xe34395,
          ..._0x8a7c07,
          _bizRev: _0x3f012c
        };
        _0x278d7d.patch(_0xe34395, _0x1fd0a6.nodes[_0x55f542]);
        if (_0x15166e !== _0xe34395.parentId) {
          _0x6fa055(_0x55f542, _0x15166e, _0xe34395.parentId);
        }
        _0x78cf76 = true;
      }
    }
    if (_0x78cf76) {
      _0x278d7d.commit();
      _0x2b88d0();
      _0x4ece68();
    }
  }
  function _0xd465e4(_0x6f1044, _0x1c0363, _0x34d00c, _0x3b5d38) {
    const _0x548413 = _0x1fd0a6.nodes[_0x6f1044];
    const _0x3e72b8 = _0x1fd0a6.nodes[_0x34d00c];
    const _0x91065 = Number(_0x1c0363);
    const _0x1a9f9f = Number(_0x3b5d38);
    if (!_isValidStoryboardCellTarget(_0x548413, _0x91065) || !_isValidStoryboardCellTarget(_0x3e72b8, _0x1a9f9f)) {
      return false;
    }
    if (_0x6f1044 === _0x34d00c && _0x91065 === _0x1a9f9f) {
      return false;
    }
    const _0x382f44 = _0x548413.cells.slice();
    const _0x85ec26 = _0x548413.cells[_0x91065];
    const _0x35b1ac = _0x3e72b8.cells[_0x1a9f9f];
    if (_0x6f1044 === _0x34d00c) {
      _0x382f44[_0x1a9f9f] = _placeStoryboardCellForSwap(cloneStoryboardCellForSwapDestination(_0x85ec26), _0x85ec26, _0x548413, _0x91065, _0x548413, _0x1a9f9f);
      _0x382f44[_0x91065] = _placeStoryboardCellForSwap(cloneStoryboardCellForSwapDestination(_0x35b1ac), _0x35b1ac, _0x548413, _0x1a9f9f, _0x548413, _0x91065);
      _0x1fd0a6.nodes[_0x6f1044] = {
        ..._0x548413,
        cells: _0x382f44,
        _bizRev: (typeof _0x548413._bizRev === "number" ? _0x548413._bizRev : 0) + 1
      };
    } else {
      const _0x5ebaaf = _0x3e72b8.cells.slice();
      _0x5ebaaf[_0x1a9f9f] = _placeStoryboardCellForSwap(cloneStoryboardCellForSwapDestination(_0x85ec26), _0x85ec26, _0x548413, _0x91065, _0x3e72b8, _0x1a9f9f);
      _0x382f44[_0x91065] = normalizeEmptyStoryboardCell({
        ...cloneStoryboardCellForSwap(_0x85ec26),
        ..._getStoryboardCellPosition(_0x548413, _0x91065)
      });
      _0x1fd0a6.nodes[_0x6f1044] = {
        ..._0x548413,
        cells: _0x382f44,
        _bizRev: (typeof _0x548413._bizRev === "number" ? _0x548413._bizRev : 0) + 1
      };
      _0x1fd0a6.nodes[_0x34d00c] = {
        ..._0x3e72b8,
        cells: _0x5ebaaf,
        _bizRev: (typeof _0x3e72b8._bizRev === "number" ? _0x3e72b8._bizRev : 0) + 1
      };
    }
    _0x19e343.content();
    _0x2b88d0();
    _0x4ece68();
    return true;
  }
  function _0x552b66(_0x41fd34, _0x1c9d3a) {
    const _0x29bbaa = _0x1fd0a6.nodes[_0x41fd34];
    if (!_0x29bbaa) {
      return;
    }
    if (_0x29bbaa.name === _0x1c9d3a) {
      return;
    }
    const _0x4f424c = (typeof _0x29bbaa._bizRev === "number" ? _0x29bbaa._bizRev : 0) + 1;
    _0x1fd0a6.nodes[_0x41fd34] = {
      ..._0x29bbaa,
      name: _0x1c9d3a,
      _bizRev: _0x4f424c
    };
    _0x19e343.content();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x593e3b(_0x1ffee2) {
    if (_0x1fd0a6.edges[_0x1ffee2]) {
      delete _0x1fd0a6.edges[_0x1ffee2];
      _0x435079();
      _0x2b88d0();
      _0x4ece68();
    }
  }
  function _0x3696c1(_0x4aa773, _0x4c7946, _0x52e68a, _0x1f2478) {
    _0x1fd0a6.picker = {
      visible: true,
      x: _0x52e68a,
      y: _0x1f2478,
      screenX: _0x4aa773,
      screenY: _0x4c7946
    };
    _0x4ece68();
  }
  function _0x27d077() {
    if (_0x1fd0a6.picker?.visible === false) {
      return;
    }
    _0x1fd0a6.picker = {
      ..._0x1fd0a6.picker,
      visible: false
    };
    _0x4ece68();
  }
  function _0x1f88cb() {
    return deepClone(_0x1fd0a6);
  }
  function _0x47be2d() {
    return _0x1fd0a6;
  }
  function _0x251632(_0x200c89) {
    if (!_0x200c89) {
      return;
    }
    _0x1fd0a6.nodes = deepClone(_0x200c89.nodes ?? {});
    for (const [_0x38914b, _0x3afbbc] of Object.entries(_0x1fd0a6.nodes)) {
      _0x1fd0a6.nodes[_0x38914b] = applyFeatureSelectionsToNodeData(_0x3afbbc, _0x1fd0a6.ui?.featureSelections || {});
    }
    normalizeNodesCollection(_0x1fd0a6.nodes);
    _0x1fd0a6.edges = deepClone(_0x200c89.edges ?? {});
    _0x1fd0a6.viewport = _0x5169a8.attach(deepClone(_0x200c89.viewport ?? {
      x: 0,
      y: 0,
      zoom: 1
    }));
    _0x1fd0a6._nodeCount = Object.keys(_0x1fd0a6.nodes).length;
    for (const _0x3994e3 of Object.values(_0x1fd0a6.nodes)) {
      if (!_0x3994e3 || typeof _0x3994e3 !== "object") {
        continue;
      }
      if (typeof _0x3994e3._bizRev !== "number") {
        _0x3994e3._bizRev = 1;
      }
    }
    _0x1fd0a6._parentToChildren = {};
    for (const [_0x598fe2, _0x581a9] of Object.entries(_0x1fd0a6.nodes)) {
      if (_0x581a9.parentId) {
        _0x6fa055(_0x598fe2, _0x581a9.parentId);
      }
    }
    _0x435079();
    _0x19e343.reload();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x4fec79() {
    const _0x24c447 = {};
    for (const [_0x118e55, _0x287fa6] of Object.entries(_0x1fd0a6.nodes || {})) {
      _0x24c447[_0x118e55] = cloneNodeSnapshot(_0x287fa6, {
        stripPanoramaViewport: true
      });
    }
    const _0x3b488e = {};
    for (const [_0x3ce8f8, _0x2c44a3] of Object.entries(_0x1fd0a6.edges || {})) {
      _0x3b488e[_0x3ce8f8] = cloneEdgeSnapshot(_0x2c44a3);
    }
    return {
      nodes: _0x24c447,
      edges: _0x3b488e
    };
  }
  function _0x3f7501(_0x1f5853) {
    if (!_0x1f5853) {
      return;
    }
    const _0x425a6b = _0x1fd0a6.nodes || {};
    const _0x2446f7 = deepClone(_0x1f5853.nodes ?? {});
    for (const [_0x1086f0, _0x1fb57d] of Object.entries(_0x2446f7)) {
      if (!_0x1fb57d || typeof _0x1fb57d !== "object") {
        continue;
      }
      const _0x40c395 = _0x425a6b[_0x1086f0];
      if (_0x1fb57d.type === "panorama-scene") {
        const _0x2a065e = _0x40c395?.sceneNode?.viewport;
        if (_0x2a065e) {
          _0x1fb57d.sceneNode = {
            ...(_0x1fb57d.sceneNode || {}),
            viewport: deepClone(_0x2a065e)
          };
        }
      } else if (_0x1fb57d.type === "panorama-360") {
        const _0x5507f2 = _0x40c395?.panorama360Node?.viewport;
        if (_0x5507f2) {
          _0x1fb57d.panorama360Node = {
            ...(_0x1fb57d.panorama360Node || {}),
            viewport: deepClone(_0x5507f2)
          };
        }
      } else if (_0x1fb57d.type === "ai-image") {
        normalizeAiImageRunningHistorySnapshot(_0x1fb57d);
      }
    }
    _0x251632({
      ..._0x1f5853,
      nodes: _0x2446f7,
      viewport: cloneViewportSnapshot(_0x1fd0a6.viewport)
    });
  }
  function _0x100e37(_0x53073c) {
    const _0x3abb02 = Object.values(_0x1fd0a6.edges).filter(_0x2b7c0a => _0x2b7c0a.targetId === _0x53073c);
    return _0x3abb02.map(_0x5b072c => _0x1fd0a6.nodes[_0x5b072c.sourceId]).filter(_0x45cfdd => !!_0x45cfdd);
  }
  function _0x4fa077(_0x459ff0, _0xf99933) {
    if (!_0xf99933 || typeof _0xf99933 !== "object") {
      return false;
    }
    for (const [_0x4816e0, _0x1fec51] of Object.entries(_0xf99933)) {
      if (_0x459ff0?.[_0x4816e0] !== _0x1fec51) {
        return true;
      }
    }
    return false;
  }
  function _0x39892e(_0x4f513a, _0x45492a) {
    if (_0x4f513a === _0x45492a) {
      return true;
    }
    if (!Array.isArray(_0x4f513a) || !Array.isArray(_0x45492a)) {
      return false;
    }
    if (_0x4f513a.length !== _0x45492a.length) {
      return false;
    }
    for (let _0x582f56 = 0; _0x582f56 < _0x4f513a.length; _0x582f56 += 1) {
      if (!Object.is(_0x4f513a[_0x582f56], _0x45492a[_0x582f56])) {
        return false;
      }
    }
    return true;
  }
  function _0x4fb35a(_0x4d1dea, _0x3e4610) {
    if (_0x4d1dea === _0x3e4610) {
      return true;
    }
    if (!_0x4d1dea || !_0x3e4610 || typeof _0x4d1dea !== "object" || typeof _0x3e4610 !== "object" || Array.isArray(_0x4d1dea) || Array.isArray(_0x3e4610)) {
      return false;
    }
    const _0x4f5bf3 = Object.keys(_0x4d1dea);
    const _0x22a586 = Object.keys(_0x3e4610);
    if (_0x4f5bf3.length !== _0x22a586.length) {
      return false;
    }
    for (const _0x24b080 of _0x4f5bf3) {
      if (!Object.prototype.hasOwnProperty.call(_0x3e4610, _0x24b080)) {
        return false;
      }
      const _0x228906 = _0x4d1dea[_0x24b080];
      const _0x422524 = _0x3e4610[_0x24b080];
      if (Array.isArray(_0x228906) || Array.isArray(_0x422524)) {
        if (!_0x39892e(_0x228906, _0x422524)) {
          return false;
        }
      } else if (!Object.is(_0x228906, _0x422524)) {
        return false;
      }
    }
    return true;
  }
  function _0xc1dca(_0x473cbb) {
    if (!_0x473cbb || typeof _0x473cbb !== "object") {
      return;
    }
    if (!_0x4fa077(_0x1fd0a6.selectionBox, _0x473cbb)) {
      return;
    }
    _0x1fd0a6.selectionBox = {
      ..._0x1fd0a6.selectionBox,
      ..._0x473cbb
    };
    _0x4ece68();
  }
  function _0x358889(_0x500fa5) {
    const _0x223a6c = _0x500fa5 || {};
    if (!_0x4fa077(_0x1fd0a6.selectionMeta, _0x223a6c)) {
      return;
    }
    _0x1fd0a6.selectionMeta = {
      ..._0x1fd0a6.selectionMeta,
      ..._0x223a6c
    };
    _0x4ece68();
  }
  function _0x4c354a(_0x450b52) {
    const _0x3001b9 = Array.from(_0x450b52 || []);
    if (_0x39892e(_0x1fd0a6.selectedNodeIds, _0x3001b9)) {
      return;
    }
    _0x1fd0a6.selectedNodeIds = _0x3001b9;
    _0x4ece68();
  }
  function _0x121023() {
    const _0x414c6e = _0x1fd0a6.selectionBox?.active === true;
    const _0x1d3645 = Array.isArray(_0x1fd0a6.selectedNodeIds) ? _0x1fd0a6.selectedNodeIds.length > 0 : false;
    const _0x2169e9 = _0x1fd0a6.selectionMeta?.source != null;
    if (!_0x414c6e && !_0x1d3645 && !_0x2169e9) {
      return;
    }
    _0x1fd0a6.selectionBox.active = false;
    _0x1fd0a6.selectedNodeIds = [];
    _0x1fd0a6.selectionMeta.source = null;
    _0x4ece68();
  }
  function _0x15d090(_0x1987fe, _0x105767, _0x27b4e8) {
    _0x1fd0a6.contextMenu = {
      visible: true,
      x: _0x1987fe,
      y: _0x105767,
      items: _0x27b4e8
    };
    _0x4ece68();
  }
  function _0x19916b() {
    if (_0x1fd0a6.contextMenu?.visible !== true) {
      return;
    }
    _0x1fd0a6.contextMenu = {
      visible: false,
      x: 0,
      y: 0,
      items: []
    };
    _0x4ece68();
  }
  function _0x34db29({
    srcId: _0x71c5c9,
    invalidNodeIds: _0x1ebaf9,
    hoverId: _0x3cff91,
    side: _0x42058b
  }) {
    const _0x3f620e = {
      srcId: _0x71c5c9 !== undefined ? _0x71c5c9 : _0x1fd0a6.connOverlay.srcId,
      invalidNodeIds: _0x1ebaf9 !== undefined ? Array.isArray(_0x1ebaf9) ? _0x1ebaf9 : [] : _0x1fd0a6.connOverlay.invalidNodeIds,
      hoverId: _0x3cff91 !== undefined ? _0x3cff91 : _0x1fd0a6.connOverlay.hoverId,
      side: _0x42058b !== undefined ? _0x42058b : _0x1fd0a6.connOverlay.side
    };
    if (_0x4fb35a(_0x1fd0a6.connOverlay, _0x3f620e)) {
      return;
    }
    _0x1fd0a6.connOverlay = _0x3f620e;
    _0x4ece68();
  }
  function _0x210470() {
    const _0x2c5e1c = {
      srcId: null,
      invalidNodeIds: [],
      hoverId: null,
      side: null
    };
    if (_0x4fb35a(_0x1fd0a6.connOverlay, _0x2c5e1c)) {
      return;
    }
    _0x1fd0a6.connOverlay = _0x2c5e1c;
    _0x4ece68();
  }
  function _0x2302fc() {
    const _0x3094b0 = Object.values(_0x1fd0a6.nodes || {}).map(_0x354efd => cloneNodeSnapshot(_0x354efd, {
      stripRichText: true
    }));
    const _0x645dea = Object.values(_0x1fd0a6.edges || {}).map(_0xb380d4 => cloneEdgeSnapshot(_0xb380d4));
    const _0x196db6 = {
      nodes: _0x3094b0,
      edges: _0x645dea,
      viewport: _0x5169a8.strip(_0x1fd0a6.viewport),
      assets: Array.isArray(_0x1fd0a6.assets) ? _0x1fd0a6.assets.map(_0x4cb8af => cloneAssetSnapshot(_0x4cb8af)) : [],
      storyboard3dProjects: cloneStoryboard3DProjects(_0x1fd0a6.storyboard3dProjects, deepClone)
    };
    return sanitizeSerializedCanvasData(_0x196db6);
  }
  function _0x49ee63(_0x2689b7, {
    preserveLiveGeneration = false
  } = {}) {
    if (!_0x2689b7) {
      return;
    }
    const _0x310b34 = Date.now();
    const _0x2473aa = _0x1fd0a6.ui?.featureSelections || {};
    if (_0x2689b7.viewport) {
      _0x1fd0a6.viewport = _0x5169a8.attach(cloneViewportSnapshot(_0x2689b7.viewport));
    }
    _0x1fd0a6.nodes = {};
    _0x1fd0a6._parentToChildren = {};
    let _0x331cff = 0;
    if (Array.isArray(_0x2689b7.nodes)) {
      _0x2689b7.nodes.forEach(_0x3341f2 => {
        if (!_0x3341f2 || typeof _0x3341f2 !== "object") {
          return;
        }
        const _0x23b079 = cloneNodeSnapshot(_0x3341f2, {
          hydratedAt: _0x310b34,
          featureSelections: _0x2473aa,
          preserveLiveGeneration: preserveLiveGeneration
        });
        _0x1fd0a6.nodes[_0x23b079.id] = _0x23b079;
        _0x331cff += 1;
        if (_0x23b079.parentId) {
          _0x6fa055(_0x23b079.id, _0x23b079.parentId);
        }
      });
    } else if (_0x2689b7.nodes && typeof _0x2689b7.nodes === "object") {
      for (const [_0x1153f2, _0x444d9f] of Object.entries(_0x2689b7.nodes)) {
        if (!_0x444d9f || typeof _0x444d9f !== "object") {
          continue;
        }
        const _0x2ecf7d = cloneNodeSnapshot(_0x444d9f.id ? _0x444d9f : {
          ..._0x444d9f,
          id: _0x1153f2
        }, {
          hydratedAt: _0x310b34,
          featureSelections: _0x2473aa,
          preserveLiveGeneration: preserveLiveGeneration
        });
        _0x1fd0a6.nodes[_0x1153f2] = _0x2ecf7d;
        _0x331cff += 1;
        if (_0x2ecf7d.parentId) {
          _0x6fa055(_0x1153f2, _0x2ecf7d.parentId);
        }
      }
    }
    _0x1fd0a6._nodeCount = _0x331cff;
    const _0x3d11f9 = {};
    if (Array.isArray(_0x2689b7.edges)) {
      for (const _0x45796e of _0x2689b7.edges) {
        if (!_0x45796e || typeof _0x45796e !== "object") {
          continue;
        }
        _0x3d11f9[_0x45796e.id] = cloneEdgeSnapshot(_0x45796e);
      }
    } else if (_0x2689b7.edges && typeof _0x2689b7.edges === "object") {
      for (const [_0x5e33d0, _0x45a604] of Object.entries(_0x2689b7.edges)) {
        if (!_0x45a604 || typeof _0x45a604 !== "object") {
          continue;
        }
        const _0x1a40dc = cloneEdgeSnapshot(_0x45a604);
        if (_0x1a40dc.id == null) {
          _0x1a40dc.id = _0x5e33d0;
        }
        _0x3d11f9[_0x1a40dc.id] = _0x1a40dc;
      }
    }
    _0x1fd0a6.edges = _0x3d11f9;
    _0x435079();
    _0x1fd0a6.assets = Array.isArray(_0x2689b7.assets) ? _0x2689b7.assets.map(_0x5ae94b => cloneAssetSnapshot(_0x5ae94b)) : [];
    _0x1fd0a6.storyboard3dProjects = cloneStoryboard3DProjects(_0x2689b7.storyboard3dProjects, deepClone);
    _0x19e343.reload();
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x156c4d(_0x1c66a6, _0x5115d0 = {}) {
    _0x49ee63(_0x1c66a6, _0x5115d0);
  }
  function _0x50f4fc(_0x1fe0a9) {
    if (!_0x1fe0a9) {
      return;
    }
    const _0x4c57d7 = deepClone(_0x1fe0a9);
    _0x49ee63(_0x4c57d7);
  }
  function _0x221b0a({
    active: _0x35f4c0,
    sourceNodeId = null,
    handleDirection = null,
    hoverNodeId = null
  }) {
    _0x1fd0a6.pickConnectMode = {
      active: _0x35f4c0,
      sourceNodeId: sourceNodeId,
      handleDirection: handleDirection,
      hoverNodeId: hoverNodeId
    };
    _0x4ece68();
  }
  function _0x4fb6bd(_0x1f926e) {
    if (_0x1fd0a6.isServerConnected === _0x1f926e) {
      return;
    }
    _0x1fd0a6.isServerConnected = _0x1f926e;
    _0x4ece68();
  }
  function _0x16123d(_0x574825) {
    if (!_0x1fd0a6.pickConnectMode || !_0x1fd0a6.pickConnectMode.active) {
      return;
    }
    if (_0x1fd0a6.pickConnectMode.hoverNodeId === _0x574825) {
      return;
    }
    _0x1fd0a6.pickConnectMode = {
      ..._0x1fd0a6.pickConnectMode,
      hoverNodeId: _0x574825
    };
    _0x4ece68();
  }
  function _0x4607b4(_0x3150d0) {
    const _0x508f1b = _0x1fd0a6.annotate || {};
    const _0xbe2a96 = _0x3150d0 || {};
    if (!_0x4fa077(_0x508f1b, _0xbe2a96)) {
      return;
    }
    const _0x2760b5 = {
      ..._0x508f1b,
      ..._0xbe2a96
    };
    _0x1fd0a6.annotate = _0x2760b5;
    _0x4ece68();
  }
  function _0x315853(_0x4c25d9) {
    const _0x307805 = _0x1fd0a6.matting || {};
    const _0x3f4d12 = _0x4c25d9 || {};
    if (!_0x4fa077(_0x307805, _0x3f4d12)) {
      return;
    }
    const _0x4161d6 = {
      ..._0x307805,
      ..._0x3f4d12
    };
    _0x1fd0a6.matting = _0x4161d6;
    _0x4ece68();
  }
  function _0x5d9598(_0x29b5cd) {
    const _0x5541df = _0x1fd0a6.videoKeying || {};
    const _0x3a1507 = _0x29b5cd || {};
    if (!_0x4fa077(_0x5541df, _0x3a1507)) {
      return;
    }
    const _0x4b0e15 = {
      ..._0x5541df,
      ..._0x3a1507
    };
    _0x1fd0a6.videoKeying = _0x4b0e15;
    _0x4ece68();
  }
  function _0x339b4c(_0x2f844d) {
    const _0x54d621 = _0x1fd0a6.videoClip || {};
    const _0x113471 = _0x2f844d || {};
    if (!_0x4fa077(_0x54d621, _0x113471)) {
      return;
    }
    const _0x40f8e1 = {
      ..._0x54d621,
      ..._0x113471
    };
    _0x1fd0a6.videoClip = _0x40f8e1;
    _0x4ece68();
  }
  function _0x4ad8ae(_0x3d3753) {
    if (_0x1fd0a6.theme === _0x3d3753) {
      return;
    }
    _0x1fd0a6.theme = _0x3d3753;
    _0x4ece68();
  }
  function _0x4210c9() {
    const _0x1da0af = _0x1fd0a6.theme === "dark" ? "light" : "dark";
    _0x4ad8ae(_0x1da0af);
  }
  function _0x5f3970(_0x5a2bd2 = "dark") {
    const _0x3725dc = _0x5a2bd2 === "light" ? "light" : "dark";
    _0x1fd0a6.theme = _0x3725dc;
  }
  function _0x2c0e77(_0x4b36d9 = {}) {
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.featureSelections = sanitizeFeatureSelectionsRecord(_0x4b36d9);
  }
  function _0x308635(_0x48c933, _0x55222b, _0x5db66d = undefined) {
    const _0x3f4266 = String(_0x48c933 || "").trim();
    const _0x6ef1 = String(_0x55222b || "").trim();
    if (!_0x3f4266 || !_0x6ef1) {
      return _0x5db66d;
    }
    const _0xd3af2c = _0x1fd0a6.ui?.featureSelections?.[_0x3f4266]?.[_0x6ef1];
    if (_0xd3af2c === undefined) {
      return _0x5db66d;
    } else {
      return _0xd3af2c;
    }
  }
  function _0x357bc7(_0x2bc606, _0x22b752, _0x4362ef) {
    const _0x3fb39d = String(_0x2bc606 || "").trim();
    const _0x32d3f4 = String(_0x22b752 || "").trim();
    if (!_0x3fb39d || !_0x32d3f4) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    if (!_0x1fd0a6.ui.featureSelections || typeof _0x1fd0a6.ui.featureSelections !== "object") {
      _0x1fd0a6.ui.featureSelections = {};
    }
    const _0x2a02af = _0x1fd0a6.ui.featureSelections[_0x3fb39d] || {};
    if (_0x2a02af[_0x32d3f4] === _0x4362ef) {
      return;
    }
    _0x1fd0a6.ui.featureSelections = {
      ..._0x1fd0a6.ui.featureSelections,
      [_0x3fb39d]: {
        ..._0x2a02af,
        [_0x32d3f4]: _0x4362ef
      }
    };
    _0x4ece68();
  }
  function _0x281f5e(_0x189b05, _0x3f4a17) {
    if (_0x1fd0a6.ui && _0x1fd0a6.ui[_0x189b05] === _0x3f4a17) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui[_0x189b05] = _0x3f4a17;
    _0x4ece68();
  }
  function _0x1aaa40(_0x4eb040) {
    _0x281f5e("showVideoMeta", _0x4eb040 === true);
  }
  function _0x5cc6d2(_0x1b10ae) {
    _0x281f5e("showSelectionMediaProperties", _0x1b10ae !== false);
  }
  function _0x2fb396(_0x2db20b) {
    _0x281f5e("titleFollowsCanvasZoom", _0x2db20b === true);
  }
  function _0x184fe6(_0x486002) {
    _0x281f5e("promptBoxResizeEnabled", _0x486002 !== false);
  }
  function _0x14b794(_0x2fdb5f) {
    _0x281f5e("promptEnterBehavior", _0x2fdb5f === "newline" ? "newline" : "submit");
  }
  function _0x3aa103(_0x1c1ef0) {
    _0x281f5e("promptAttachmentButtonHidden", _0x1c1ef0 === true);
  }
  function _0x484f5c(_0x532465) {
    _0x281f5e("promptPresetButtonHidden", _0x532465 === true);
  }
  function _0x36c0d4(_0x6a457) {
    _0x281f5e("videoAudioDefaultEnabled", _0x6a457 === true);
  }
  function _0x428ec5(_0x2692fc) {
    _0x281f5e("canvasToolbarPlacement", normalizeCanvasToolbarPlacement(_0x2692fc));
  }
  function _0x377091(_0x5045ef) {
    _0x281f5e("nodeManagerPlacement", normalizeNodeManagerPlacement(_0x5045ef));
  }
  function _0x374586(_0x3868ca) {
    _0x281f5e("leftSidebarAutoHideEnabled", _0x3868ca === true);
  }
  function _0x4852d0(_0x20d25a) {
    _0x281f5e("bottomLeftBarAutoHideEnabled", _0x20d25a === true);
  }
  function _0x2b6388(_0x374cb0) {
    _0x281f5e("imageVideoNodeResizeEnabled", _0x374cb0 === true);
  }
  function _0x2e4801(_0x2fb8bd, _0x3d2aa9, _0x5897d6, _0x5b97ea) {
    const _0x32e618 = _0x5897d6(_0x3d2aa9);
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    if (_0x5b97ea(_0x1fd0a6.ui[_0x2fb8bd]) === _0x5b97ea(_0x32e618)) {
      return;
    }
    _0x1fd0a6.ui[_0x2fb8bd] = _0x32e618;
    _0x4ece68();
  }
  function _0x55b17c(_0x193854) {
    _0x2e4801("imageToolbarLayout", _0x193854, normalizeImageToolbarLayout, serializeImageToolbarLayout);
  }
  function _0x5b30bd(_0x3e6323) {
    _0x2e4801("videoToolbarLayout", _0x3e6323, normalizeVideoToolbarLayout, serializeVideoToolbarLayout);
  }
  function _0x248260(_0x371bdc) {
    const _0x22eff2 = _0x371bdc !== false;
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.alignFeatureEnabled === _0x22eff2) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.alignFeatureEnabled = _0x22eff2;
    if (!_0x22eff2) {
      _0x1fd0a6.ui.alignFeatureTriggerMode = "off";
      _0x1fd0a6.ui.alignPanelVisible = false;
      _0x1fd0a6.ui.alignPanelAnchorWorld = null;
    } else if (_0x1fd0a6.ui.alignFeatureTriggerMode === "off") {
      _0x1fd0a6.ui.alignFeatureTriggerMode = "click";
    }
    _0x4ece68();
  }
  function _0x2de264(_0x35775e) {
    const _0x7b8bad = _0x35775e === "hold" || _0x35775e === "click" || _0x35775e === "off" ? _0x35775e : "click";
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    if (_0x1fd0a6.ui.alignFeatureTriggerMode === _0x7b8bad) {
      return;
    }
    _0x1fd0a6.ui.alignFeatureTriggerMode = _0x7b8bad;
    _0x1fd0a6.ui.alignFeatureEnabled = _0x7b8bad !== "off";
    if (_0x7b8bad === "off") {
      _0x1fd0a6.ui.alignPanelVisible = false;
      _0x1fd0a6.ui.alignPanelAnchorWorld = null;
    }
    _0x4ece68();
  }
  function _0x368a78(_0x240ee5) {
    const _0x41d10c = Number(_0x240ee5);
    const _0x46009c = Number.isFinite(_0x41d10c) ? Math.max(0, Math.min(200, Math.round(_0x41d10c))) : 40;
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.alignDistributeGap === _0x46009c) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.alignDistributeGap = _0x46009c;
    _0x4ece68();
  }
  function _0x398169(_0x692d57) {
    const _0x310dbc = _0x692d57 === true;
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    if (!_0x310dbc) {
      const _0x5cee2a = !!_0x1fd0a6.ui.alignPanelAnchorWorld;
      if (_0x1fd0a6.ui.alignPanelVisible === _0x310dbc && !_0x5cee2a) {
        return;
      }
      _0x1fd0a6.ui.alignPanelVisible = false;
      _0x1fd0a6.ui.alignPanelAnchorWorld = null;
      _0x4ece68();
      return;
    }
    if (_0x1fd0a6.ui.alignPanelVisible === _0x310dbc) {
      return;
    }
    _0x1fd0a6.ui.alignPanelVisible = _0x310dbc;
    _0x4ece68();
  }
  function _0x57e049(_0xb31a1e) {
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    let _0x312bbb = null;
    if (_0xb31a1e && Number.isFinite(_0xb31a1e.x) && Number.isFinite(_0xb31a1e.y)) {
      _0x312bbb = {
        x: Number(_0xb31a1e.x),
        y: Number(_0xb31a1e.y)
      };
    }
    const _0x2c6384 = _0x1fd0a6.ui.alignPanelAnchorWorld;
    const _0x4f7a1c = !_0x2c6384 && !_0x312bbb || _0x2c6384 && _0x312bbb && Number(_0x2c6384.x) === Number(_0x312bbb.x) && Number(_0x2c6384.y) === Number(_0x312bbb.y);
    if (_0x4f7a1c) {
      return;
    }
    _0x1fd0a6.ui.alignPanelAnchorWorld = _0x312bbb;
    _0x4ece68();
  }
  function _0x11794b(_0x54aab7) {
    const _0x1c85ed = _0x54aab7 !== false;
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.snapGuidesEnabled === _0x1c85ed) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.snapGuidesEnabled = _0x1c85ed;
    _0x4ece68();
  }
  function _0x49d2ef(_0x3b4518) {
    const _0x4592c8 = _0x3b4518 !== false;
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.selectionRelatedHighlightEnabled === _0x4592c8) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.selectionRelatedHighlightEnabled = _0x4592c8;
    _0x4ece68();
  }
  function _0x3bf470(_0x209eb5) {
    const _0x4bc93b = String(_0x209eb5 || "").trim();
    if (["white", "blue", "green", "cyan", "purple", "red", "yellow"].includes(_0x4bc93b)) {
      return _0x4bc93b;
    } else {
      return "white";
    }
  }
  function _0x2522e6(_0x21e02f) {
    const _0x3d959b = _0x3bf470(_0x21e02f);
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.selectionRelatedHighlightColor === _0x3d959b) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.selectionRelatedHighlightColor = _0x3d959b;
    _0x4ece68();
  }
  function _0x3c8e28(_0x76c58a) {
    const _0x39802f = _0x76c58a !== false;
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.connectionLinesVisible === _0x39802f) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.connectionLinesVisible = _0x39802f;
    _0x4ece68();
  }
  function _0x26aeb8(_0x276529) {
    const _0x26522f = normalizeConnectionLineStyle(_0x276529);
    if (_0x1fd0a6.ui && _0x1fd0a6.ui.connectionLineStyle === _0x26522f) {
      return;
    }
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.connectionLineStyle = _0x26522f;
    _0x4ece68();
  }
  function _0x2bdd65(_0x2ba0fe = {}) {
    const _0x14242a = _0x2ba0fe?.showSelectionMediaProperties !== false;
    const _0x36b17a = _0x2ba0fe?.titleFollowsCanvasZoom === true;
    const _0x43d84b = _0x2ba0fe?.promptBoxResizeEnabled !== false;
    const _0x48e528 = _0x2ba0fe?.promptAttachmentButtonHidden === true;
    const _0x3dadf8 = _0x2ba0fe?.imageVideoNodeResizeEnabled === true;
    const _0x11efc0 = _0x2ba0fe?.selectionRelatedHighlightEnabled !== false;
    const _0x1dd5d7 = _0x3bf470(_0x2ba0fe?.selectionRelatedHighlightColor);
    const _0x35100c = _0x2ba0fe?.connectionLinesVisible !== false;
    const _0x19cbf9 = normalizeConnectionLineStyle(_0x2ba0fe?.connectionLineStyle);
    const _0x5c4ff0 = String(_0x2ba0fe?.alignFeatureTriggerMode || "").trim();
    const _0x9d2126 = _0x5c4ff0 === "hold" || _0x5c4ff0 === "click" || _0x5c4ff0 === "off" ? _0x5c4ff0 : _0x2ba0fe?.alignFeatureEnabled === false ? "off" : "click";
    const _0x3ce27d = _0x2ba0fe?.alignFeatureEnabled === false ? false : _0x9d2126 !== "off";
    const _0x5d0bb5 = Number(_0x2ba0fe?.alignDistributeGap);
    const _0x46f35d = Number.isFinite(_0x5d0bb5) ? Math.max(0, Math.min(200, Math.round(_0x5d0bb5))) : 40;
    const _0x4266e7 = _0x2ba0fe?.snapGuidesEnabled !== false;
    if (!_0x1fd0a6.ui) {
      _0x1fd0a6.ui = {};
    }
    _0x1fd0a6.ui.showVideoMeta = false;
    _0x1fd0a6.ui.showSelectionMediaProperties = _0x14242a;
    _0x1fd0a6.ui.titleFollowsCanvasZoom = _0x36b17a;
    _0x1fd0a6.ui.promptBoxResizeEnabled = _0x43d84b;
    _0x1fd0a6.ui.promptEnterBehavior = _0x2ba0fe?.promptEnterBehavior === "newline" ? "newline" : "submit";
    _0x1fd0a6.ui.promptAttachmentButtonHidden = _0x48e528;
    _0x1fd0a6.ui.promptPresetButtonHidden = _0x2ba0fe?.promptPresetButtonHidden === true;
    _0x1fd0a6.ui.videoAudioDefaultEnabled = _0x2ba0fe?.videoAudioDefaultEnabled === true;
    _0x1fd0a6.ui.canvasToolbarPlacement = normalizeCanvasToolbarPlacement(_0x2ba0fe?.canvasToolbarPlacement);
    _0x1fd0a6.ui.nodeManagerPlacement = normalizeNodeManagerPlacement(_0x2ba0fe?.nodeManagerPlacement);
    _0x1fd0a6.ui.leftSidebarAutoHideEnabled = _0x2ba0fe?.leftSidebarAutoHideEnabled === true;
    _0x1fd0a6.ui.bottomLeftBarAutoHideEnabled = _0x2ba0fe?.bottomLeftBarAutoHideEnabled === true;
    _0x1fd0a6.ui.imageVideoNodeResizeEnabled = _0x3dadf8;
    _0x1fd0a6.ui.imageToolbarLayout = normalizeImageToolbarLayout(_0x2ba0fe?.imageToolbarLayout);
    _0x1fd0a6.ui.videoToolbarLayout = normalizeVideoToolbarLayout(_0x2ba0fe?.videoToolbarLayout);
    _0x1fd0a6.ui.selectionRelatedHighlightEnabled = _0x11efc0;
    _0x1fd0a6.ui.selectionRelatedHighlightColor = _0x1dd5d7;
    _0x1fd0a6.ui.connectionLinesVisible = _0x35100c;
    _0x1fd0a6.ui.connectionLineStyle = _0x19cbf9;
    _0x1fd0a6.ui.alignFeatureEnabled = _0x3ce27d;
    _0x1fd0a6.ui.alignFeatureTriggerMode = _0x9d2126;
    _0x1fd0a6.ui.alignDistributeGap = _0x46f35d;
    _0x1fd0a6.ui.alignPanelVisible = false;
    _0x1fd0a6.ui.alignPanelAnchorWorld = null;
    _0x1fd0a6.ui.snapGuidesEnabled = _0x4266e7;
    _0x2c0e77(_0x2ba0fe?.featureSelections || {});
    _0x4ece68();
  }
  function _0x160942(_0x5a7a7a, _0x360d16) {
    const _0x36840b = _0x1fd0a6[_0x5a7a7a] || {};
    _0x1fd0a6[_0x5a7a7a] = {
      ..._0x36840b,
      ...(_0x360d16 || {})
    };
    _0x4ece68();
  }
  const _0x4de147 = _0x588d7b => _0x160942("subscription", _0x588d7b);
  const _0x12ce75 = _0x39901e => _0x160942("modelCatalog", _0x39901e);
  const {
    upsertStoryboard3DProject: _0x36d66f,
    deleteStoryboard3DProject: _0x32ba2f
  } = createStoryboard3DProjectActions({
    readProjects: () => _0x1fd0a6.storyboard3dProjects,
    writeProjects: _0x40284d => {
      _0x1fd0a6.storyboard3dProjects = _0x40284d;
      _0x2b88d0();
      _0x4ece68();
    },
    clone: deepClone
  });
  function _0x37563b(_0x13c6b4) {
    if (!_0x13c6b4 || !_0x13c6b4.id) {
      throw new Error("[store] addAsset() 需要提供含有 id 字段的资产数据");
    }
    const _0x251d48 = JSON.parse(JSON.stringify(_0x13c6b4));
    if (!_0x1fd0a6.assets) {
      _0x1fd0a6.assets = [];
    }
    _0x1fd0a6.assets.unshift(_0x251d48);
    _0x2b88d0();
    _0x4ece68();
  }
  function _0x1674bd(_0x4191d1) {
    if (!_0x1fd0a6.assets) {
      return;
    }
    const _0x4e447d = _0x1fd0a6.assets.length;
    _0x1fd0a6.assets = _0x1fd0a6.assets.filter(_0x1bd000 => _0x1bd000.id !== _0x4191d1);
    if (_0x1fd0a6.assets.length !== _0x4e447d) {
      _0x2b88d0();
      _0x4ece68();
    }
  }
  function _0x1eef29(_0x5480de, _0x295464) {
    if (!_0x1fd0a6.assets) {
      return;
    }
    const _0x5ad6e3 = _0x1fd0a6.assets.findIndex(_0x49f073 => _0x49f073.id === _0x5480de);
    if (_0x5ad6e3 !== -1) {
      const _0x11af30 = _0x1fd0a6.assets[_0x5ad6e3];
      const _0x50f4d9 = {
        ..._0x11af30,
        ..._0x295464
      };
      if (shallowEqual(_0x11af30, _0x50f4d9)) {
        return;
      }
      _0x1fd0a6.assets[_0x5ad6e3] = _0x50f4d9;
      _0x2b88d0();
      _0x4ece68();
    }
  }
  function _0x3cf471() {
    if (!_0x1fd0a6.workflows || typeof _0x1fd0a6.workflows !== "object") {
      _0x1fd0a6.workflows = {
        items: [],
        loading: false,
        error: null,
        loadedAt: 0
      };
    }
    if (!Array.isArray(_0x1fd0a6.workflows.items)) {
      _0x1fd0a6.workflows.items = [];
    }
    if (!_0x1fd0a6.workflowUi || typeof _0x1fd0a6.workflowUi !== "object") {
      _0x1fd0a6.workflowUi = createInitialWorkflowUiState();
    }
  }
  function _0x5b53fd(_0x21c9c3, _0x1e4df5 = null) {
    _0x3cf471();
    _0x1fd0a6.workflows = {
      ..._0x1fd0a6.workflows,
      loading: _0x21c9c3 === true,
      error: _0x1e4df5 == null ? null : String(_0x1e4df5)
    };
    _0x4ece68();
  }
  function _0x78db31(_0x597f0b) {
    _0x3cf471();
    _0x1fd0a6.workflows = {
      ..._0x1fd0a6.workflows,
      items: Array.isArray(_0x597f0b) ? _0x597f0b.map(_0x1f03c7 => cloneWorkflowSnapshot(_0x1f03c7)) : [],
      loading: false,
      error: null,
      loadedAt: Date.now()
    };
    _0x4ece68();
  }
  function _0x660587(_0x15ef75) {
    if (!_0x15ef75 || !_0x15ef75.id) {
      return;
    }
    _0x3cf471();
    const _0x210a06 = cloneWorkflowSnapshot(_0x15ef75);
    const _0x12a02d = _0x1fd0a6.workflows.items.findIndex(_0x54383e => _0x54383e?.id === _0x210a06.id);
    if (_0x12a02d >= 0) {
      _0x1fd0a6.workflows.items[_0x12a02d] = {
        ..._0x1fd0a6.workflows.items[_0x12a02d],
        ..._0x210a06
      };
    } else {
      _0x1fd0a6.workflows.items.unshift(_0x210a06);
    }
    _0x4ece68();
  }
  function _0x420117(_0x2e9d19, _0x5ac099) {
    const _0x25032d = String(_0x2e9d19 || "").trim();
    if (!_0x25032d || !_0x5ac099 || typeof _0x5ac099 !== "object") {
      return;
    }
    _0x3cf471();
    const _0x5dc85c = _0x1fd0a6.workflows.items.findIndex(_0x9b9a9d => _0x9b9a9d?.id === _0x25032d);
    if (_0x5dc85c < 0) {
      return;
    }
    _0x1fd0a6.workflows.items[_0x5dc85c] = {
      ..._0x1fd0a6.workflows.items[_0x5dc85c],
      ...cloneWorkflowSnapshot(_0x5ac099)
    };
    _0x4ece68();
  }
  function _0x1c82df(_0x1f12ca, _0x48f42e = Date.now()) {
    _0x420117(_0x1f12ca, {
      lastUsedAt: _0x48f42e
    });
  }
  function _0x2283b7(_0x29b171) {
    if (!_0x29b171 || typeof _0x29b171 !== "object") {
      return;
    }
    _0x3cf471();
    const _0x432414 = {
      ..._0x1fd0a6.workflowUi
    };
    for (const [_0x7e052a, _0xe6e1a9] of Object.entries(_0x29b171)) {
      if (_0x7e052a === "draft" && _0xe6e1a9 && typeof _0xe6e1a9 === "object") {
        _0x432414.draft = {
          ..._0x432414.draft,
          ...cloneWorkflowSnapshot(_0xe6e1a9)
        };
      } else {
        _0x432414[_0x7e052a] = cloneWorkflowSnapshot(_0xe6e1a9);
      }
    }
    _0x1fd0a6.workflowUi = _0x432414;
    _0x4ece68();
  }
  function _0x387776(_0x500a0d) {
    if (!_0x500a0d || typeof _0x500a0d !== "object") {
      return;
    }
    _0x3cf471();
    _0x1fd0a6.workflowUi = {
      ..._0x1fd0a6.workflowUi,
      draft: {
        ...(_0x1fd0a6.workflowUi.draft || createInitialWorkflowDraftState()),
        ...cloneWorkflowSnapshot(_0x500a0d)
      }
    };
    _0x4ece68();
  }
  function _0xe47209(_0x14562b = {}) {
    _0x3cf471();
    _0x1fd0a6.workflowUi = {
      ..._0x1fd0a6.workflowUi,
      draft: {
        ...createInitialWorkflowDraftState(),
        ...cloneWorkflowSnapshot(_0x14562b)
      },
      tagDraft: "",
      updateConfirmOpen: false,
      error: null
    };
    _0x4ece68();
  }
  function _0x7bcba6({
    tab = "create",
    sourceGroupId = null
  } = {}) {
    _0x3cf471();
    _0x1fd0a6.workflowUi = {
      ..._0x1fd0a6.workflowUi,
      modalOpen: true,
      modalTab: tab === "update" ? "update" : "create",
      sourceGroupId: sourceGroupId == null ? null : String(sourceGroupId || "").trim() || null,
      draft: createInitialWorkflowDraftState(),
      tagDraft: "",
      updateTargetId: null,
      updateSearchKeyword: "",
      updateConfirmOpen: false,
      saving: false,
      error: null
    };
    _0x4ece68();
  }
  function _0x49b427() {
    _0x3cf471();
    _0x1fd0a6.workflowUi = {
      ..._0x1fd0a6.workflowUi,
      modalOpen: false,
      modalTab: "create",
      sourceGroupId: null,
      draft: createInitialWorkflowDraftState(),
      tagDraft: "",
      updateTargetId: null,
      updateSearchKeyword: "",
      updateConfirmOpen: false,
      saving: false,
      error: null
    };
    _0x4ece68();
  }
  function _0x52769b(_0x5c97e0) {
    _0x2283b7({
      saving: _0x5c97e0 === true
    });
  }
  function _0x32e2d2(_0x33fee6) {
    const _0xd80650 = _0x33fee6 == null ? null : String(_0x33fee6);
    _0x2283b7({
      applyingWorkflowId: _0xd80650 || null
    });
  }
  return {
    subscribe: _0x173431,
    subscribeRaw: _0x329bf1,
    subscribeSelector: _0x28c1a5,
    batch: _0x20a039,
    requestRender: _0x145f9e,
    invalidateUi: _0x4b897a,
    addNode: _0x5ae55c,
    updateNodePosition: _0x3b47a7,
    moveNodes: _0x2ef2ad,
    moveNodesByOffsets: _0x27e7e2,
    deleteNodes: _0x34c25b,
    updateNodeData: _0x5d3283,
    updateNodesData: _0x56a199,
    swapStoryboardCells: _0xd465e4,
    addEdge: _0x485e03,
    removeEdge: _0x593e3b,
    updateEdgesBatch: _0x37e122,
    updateViewport: _0x1d744d,
    setViewportScreenOrigin: _0x3620d2,
    setViewportPersistPolicy: _0x218d6a,
    markViewportPersist: _0xb2f9a8,
    showPicker: _0x3696c1,
    hidePicker: _0x27d077,
    loadState: _0x251632,
    loadHistorySnapshot: _0x3f7501,
    getState: _0x1f88cb,
    getStateRaw: _0x47be2d,
    getHistorySnapshot: _0x4fec79,
    getSourcesForNode: _0x100e37,
    setSelectionBox: _0xc1dca,
    setSelectionMeta: _0x358889,
    setSelectedNodes: _0x4c354a,
    groupNodes: _0x5ae23e,
    getIncomingEdges: _0x5ef073,
    renameNode: _0x552b66,
    clearSelection: _0x121023,
    showContextMenu: _0x15d090,
    hideContextMenu: _0x19916b,
    setConnOverlay: _0x34db29,
    clearConnOverlay: _0x210470,
    setPickConnectMode: _0x221b0a,
    setPickConnectHover: _0x16123d,
    setServerConnection: _0x4fb6bd,
    setAnnotateState: _0x4607b4,
    setMattingState: _0x315853,
    setVideoKeyingState: _0x5d9598,
    setVideoClipState: _0x339b4c,
    setTheme: _0x4ad8ae,
    toggleTheme: _0x4210c9,
    initTheme: _0x5f3970,
    setFeatureSelection: _0x357bc7,
    getFeatureSelection: _0x308635,
    initFeatureSelections: _0x2c0e77,
    setShowVideoMeta: _0x1aaa40,
    setShowSelectionMediaProperties: _0x5cc6d2,
    setTitleFollowsCanvasZoom: _0x2fb396,
    setPromptBoxResizeEnabled: _0x184fe6,
    setPromptEnterBehavior: _0x14b794,
    setPromptAttachmentButtonHidden: _0x3aa103,
    setPromptPresetButtonHidden: _0x484f5c,
    setVideoAudioDefaultEnabled: _0x36c0d4,
    setCanvasToolbarPlacement: _0x428ec5,
    setNodeManagerPlacement: _0x377091,
    setLeftSidebarAutoHideEnabled: _0x374586,
    setBottomLeftBarAutoHideEnabled: _0x4852d0,
    setImageVideoNodeResizeEnabled: _0x2b6388,
    setImageToolbarLayout: _0x55b17c,
    setVideoToolbarLayout: _0x5b30bd,
    setAlignFeatureEnabled: _0x248260,
    setAlignFeatureTriggerMode: _0x2de264,
    setAlignDistributeGap: _0x368a78,
    setAlignPanelVisible: _0x398169,
    setAlignPanelAnchorWorld: _0x57e049,
    setSnapGuidesEnabled: _0x11794b,
    setSelectionRelatedHighlightEnabled: _0x49d2ef,
    setSelectionRelatedHighlightColor: _0x2522e6,
    setConnectionLinesVisible: _0x3c8e28,
    setConnectionLineStyle: _0x26aeb8,
    setSubscriptionState: _0x4de147,
    setModelCatalogState: _0x12ce75,
    initUiPrefs: _0x2bdd65,
    addAsset: _0x37563b,
    deleteAsset: _0x1674bd,
    updateAsset: _0x1eef29,
    upsertStoryboard3DProject: _0x36d66f,
    deleteStoryboard3DProject: _0x32ba2f,
    setWorkflowsLoading: _0x5b53fd,
    setWorkflows: _0x78db31,
    upsertWorkflow: _0x660587,
    updateWorkflowLocal: _0x420117,
    markWorkflowUsed: _0x1c82df,
    setWorkflowUi: _0x2283b7,
    setWorkflowDraft: _0x387776,
    resetWorkflowDraft: _0xe47209,
    openWorkflowModal: _0x7bcba6,
    closeWorkflowModal: _0x49b427,
    setWorkflowSaving: _0x52769b,
    setWorkflowApplying: _0x32e2d2,
    serialize: _0x2302fc,
    hydrate: _0x50f4fc,
    hydrateTrustedSnapshot: _0x156c4d
  };
}
const legacyKernelStore = createStore();
export default legacyKernelStore;
export { createStore, createStore as createLegacyKernelStore };