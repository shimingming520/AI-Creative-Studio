import a1022_0x335c91, { graphStore as a1022_0x12ecb7, uiStore as a1022_0x46b171, workspaceStore as a1022_0x276678 } from "../../core/stores/appStore.js";
import { isNodeType } from "../registry.js";
import { commit } from "../history.js";
import { screenToWorld, worldToScreen, isPointInRect, hitTestNode, findClosestNode, generateId, getNodeScreenRect, createNodeSpatialIndex, queryNodeSpatialIndexAtWorldPoint } from "../../core/math.js";
import { readViewportInteractionState } from "../../core/viewportInteractionState.js";
import { createNodeGeometryOverlay } from "../../core/nodeGeometryOverlay.js";
import { beginViewportPanPreview, flushViewportPanPreview, getViewportPanPreview, isViewportPanPreviewActive, updateViewportPanPreview } from "../../core/viewportPanPreview.js";
import { createViewportPreviewCoordinator } from "./viewportPreviewCoordinator.js";
import { createGroupSidePlusCandidateIdCache, findClosestNodeWithGeometryOverrides } from "./sidePlusGeometry.js";
import { buildConnectionPathGeometry, normalizeConnectionLineStyle } from "../../core/edgePathGeometry.js";
import { createLinkCursor, getCursorSize } from "../cursorUtils.js";
import { rafSampleLatest, getDisplayedMediaSizeFromNode, getDisplayedVideoMetaFromNode } from "../../utils/dom.js";
import { buildSourceMediaNodePayload, getAIGenerationDefaultSizeByType, getAIGenerationNodeSize, getNodeDefaultSize } from "../../services/fileService.js";
import { createPanorama360NodeData, PANORAMA_SCENE_DEFAULT_SIZE } from "../panoramaSceneNode/sceneNode.js";
import { createStoryboardScriptNodeData, STORYBOARD_SCRIPT_DEFAULT_SIZE } from "../../core/storyboardScriptFactory.js";
import { createWhiteboardNodeData, WHITEBOARD_DEFAULT_SIZE } from "../whiteboard/whiteboardNodeData.js";
import { isDreaminaStyleVideoModel, normalizeDreaminaVideoRouteMode } from "../dreaminaVideoModelHelper.js";
import { getTargetInputPolicy, hasUsableInputNodeSource, isInputKindAllowed, isRhPersonReplaceWorkflowModel, normalizeInputKind, resolveEffectiveInputKind } from "../modelInputPolicy.js";
import { getMediaClipInputKind, isMediaClipNodeType, isSupportedMediaClipInput } from "../../components/media-clip/mediaClipState.js";
import { removeCoveredAssetInputRefForConnection } from "../promptAssetInputOverride.js";
import { getNodeCreationMenuItem } from "../nodeCreationMenuCatalog.js";
import { t } from "../../i18n/index.js";
import { fixedInputSlotAcceptsSource, getExclusiveSlotsForFixedSlot, getFixedInputSlotConfigFromManifest, resolveFixedInputSlotForRef } from "../fixedInputAssetRefs.js";
import { stripImageGenerationResultStateForDerivedNode } from "../../core/imageTaskRuntimeState.js";
import { wouldCreateGroupOutputCycle } from "../groupDynamicOutput.js";
import { ANIME_REAL_MODEL_ID } from "../../manifests/index.js";
const graphStore = a1022_0x335c91?.graphStore || a1022_0x12ecb7 || a1022_0x335c91;
const uiStore = a1022_0x335c91?.uiStore || a1022_0x46b171 || a1022_0x335c91;
const workspaceStore = a1022_0x335c91?.workspaceStore || a1022_0x276678 || a1022_0x335c91;
const SIDE_PLUS_EXIT_REMOVAL_DELAY_MS = 140;
const SIDE_PLUS_ASSIST_PAN_PREVIEW_OWNER = "side-plus-connect-assist-pan";
function getStateRaw() {
  return {
    ...graphStore.getStateRaw(),
    ...uiStore.getStateRaw(),
    ...workspaceStore.getStateRaw()
  };
}
function getState() {
  return {
    ...graphStore.getState(),
    ...uiStore.getState(),
    ...workspaceStore.getState()
  };
}
function _buildOutEdgeMap(_0x5095b8) {
  const _0x34a7f5 = new Map();
  for (const _0x2a50de of _0x5095b8) {
    if (!_0x2a50de) {
      continue;
    }
    const _0x1d4721 = _0x2a50de.sourceId;
    const _0x243b6c = _0x2a50de.targetId;
    if (!_0x1d4721 || !_0x243b6c) {
      continue;
    }
    let _0x2f3959 = _0x34a7f5.get(_0x1d4721);
    if (!_0x2f3959) {
      _0x2f3959 = new Set();
      _0x34a7f5.set(_0x1d4721, _0x2f3959);
    }
    _0x2f3959.add(_0x243b6c);
  }
  return _0x34a7f5;
}
const _edgeIndexCache = {
  edges: null,
  edgesRev: -1,
  outMap: new Map(),
  incomingByTarget: new Map()
};
function _applyNodeCreationMenuMeta(_0x49beb7) {
  const _0x5a2395 = getNodeCreationMenuItem(_0x49beb7?.type);
  if (!_0x5a2395) {
    return _0x49beb7;
  }
  return {
    ..._0x49beb7,
    label: _0x5a2395.label || _0x49beb7.label,
    desc: _0x5a2395.subtitle || _0x49beb7.desc,
    badge: _0x5a2395.badge ?? _0x49beb7.badge,
    defaultName: _0x5a2395.defaultName || _0x5a2395.label || _0x49beb7.label
  };
}
function _buildEdgeIndexes(_0xfa567c) {
  const _0x5c0ed1 = new Map();
  const _0x5c31fc = new Map();
  for (const _0x8d7192 of Object.values(_0xfa567c || {})) {
    if (!_0x8d7192) {
      continue;
    }
    const _0x408217 = _0x8d7192.sourceId;
    const _0x514e7b = _0x8d7192.targetId;
    if (_0x408217 && _0x514e7b) {
      let _0x2b7a30 = _0x5c0ed1.get(_0x408217);
      if (!_0x2b7a30) {
        _0x2b7a30 = new Set();
        _0x5c0ed1.set(_0x408217, _0x2b7a30);
      }
      _0x2b7a30.add(_0x514e7b);
    }
    if (_0x514e7b) {
      let _0x53aa27 = _0x5c31fc.get(_0x514e7b);
      if (!_0x53aa27) {
        _0x53aa27 = [];
        _0x5c31fc.set(_0x514e7b, _0x53aa27);
      }
      _0x53aa27.push(_0x8d7192);
    }
  }
  return {
    outMap: _0x5c0ed1,
    incomingByTarget: _0x5c31fc
  };
}
function _getEdgeIndexes(_0x3928f2, _0x2eff75) {
  if (!_0x3928f2 || typeof _0x3928f2 !== "object") {
    _edgeIndexCache.edges = null;
    _edgeIndexCache.edgesRev = -1;
    _edgeIndexCache.outMap = new Map();
    _edgeIndexCache.incomingByTarget = new Map();
    return _edgeIndexCache;
  }
  const _0x10a54c = Number.isFinite(_0x2eff75) ? _0x2eff75 : -1;
  if (_edgeIndexCache.edges === _0x3928f2 && _edgeIndexCache.edgesRev === _0x10a54c) {
    return _edgeIndexCache;
  }
  const {
    outMap: _0x5b7f77,
    incomingByTarget: _0x537502
  } = _buildEdgeIndexes(_0x3928f2);
  _edgeIndexCache.edges = _0x3928f2;
  _edgeIndexCache.edgesRev = _0x10a54c;
  _edgeIndexCache.outMap = _0x5b7f77;
  _edgeIndexCache.incomingByTarget = _0x537502;
  return _edgeIndexCache;
}
function _getOutEdgeMap(_0x313256, _0x268e7a) {
  return _getEdgeIndexes(_0x313256, _0x268e7a).outMap;
}
function _getIncomingEdgesByTarget(_0x14a958, _0x3d2390, _0x567388) {
  if (!_0x567388) {
    return [];
  }
  return _getEdgeIndexes(_0x14a958, _0x3d2390).incomingByTarget.get(_0x567388) || [];
}
let _getDragContext = () => ({});
const _SVG_NS = "http://www.w3.org/2000/svg";
const _AI_TEXT_DEFAULT_SIZE = getAIGenerationDefaultSizeByType("ai-text");
const _AI_IMAGE_DEFAULT_SIZE = getAIGenerationDefaultSizeByType("ai-image");
const _AI_VIDEO_DEFAULT_SIZE = getAIGenerationDefaultSizeByType("ai-video");
const _AI_AUDIO_DEFAULT_SIZE = getAIGenerationDefaultSizeByType("ai-audio");
const _PANORAMA_360_TARGET_TYPES = new Set(["panorama-360", "panorama_360", "panorama360"]);
const _PANORAMA_SOURCE_BLOCKED_TYPES = new Set(["panorama-scene", "panorama_scene", "panorama-360", "panorama_360", "panorama360"]);
const _PANORAMA_360_IMAGE_SOURCE_TYPES = new Set(["source-image", "ai-image", "image"]);
const _NODE_SPATIAL_INDEX_DEFAULT_KEY = "default";
const _NODE_SPATIAL_INDEX_EDGE_HOVER_KEY = "edge-hover";
const _nodeSpatialIndexCache = new Map();
function _resolveEdgeHoverNodeRect(_0x212b5b) {
  if (!_0x212b5b || typeof _0x212b5b !== "object") {
    return null;
  }
  return {
    x: _0x212b5b.x,
    y: _0x212b5b.y,
    width: _0x212b5b.width || (isNodeType(_0x212b5b, "group") ? 400 : 260),
    height: _0x212b5b.height || (isNodeType(_0x212b5b, "group") ? 300 : 80)
  };
}
function _getNodeSpatialIndex(_0x18fdfe, _0x1a745b, _0x14aa5c = _NODE_SPATIAL_INDEX_DEFAULT_KEY) {
  if (!_0x18fdfe || typeof _0x18fdfe !== "object") {
    return null;
  }
  const _0x4d774a = Number.isFinite(_0x1a745b) ? _0x1a745b : -1;
  const _0x40b7a5 = _nodeSpatialIndexCache.get(_0x14aa5c);
  if (_0x40b7a5 && _0x40b7a5.nodes === _0x18fdfe && _0x40b7a5.persistRev === _0x4d774a) {
    return _0x40b7a5.index;
  }
  const _0xb43dcd = _0x14aa5c === _NODE_SPATIAL_INDEX_EDGE_HOVER_KEY ? createNodeSpatialIndex(_0x18fdfe, {
    resolveRect: _resolveEdgeHoverNodeRect
  }) : createNodeSpatialIndex(_0x18fdfe);
  _nodeSpatialIndexCache.set(_0x14aa5c, {
    nodes: _0x18fdfe,
    persistRev: _0x4d774a,
    index: _0xb43dcd
  });
  return _0xb43dcd;
}
function _svgEl(_0x4b7ada, _0x3f6327, _0x56c68f, _0x31fdce) {
  const _0x27be1e = document.createElementNS(_SVG_NS, "svg");
  _0x27be1e.setAttribute("width", String(_0x4b7ada));
  _0x27be1e.setAttribute("height", String(_0x3f6327));
  _0x27be1e.setAttribute("viewBox", "0 0 24 24");
  _0x27be1e.setAttribute("fill", "none");
  _0x27be1e.setAttribute("stroke", _0x56c68f);
  _0x27be1e.setAttribute("stroke-width", String(_0x31fdce));
  return _0x27be1e;
}
function _iconAiText(_0xbdc912) {
  const _0x517cc4 = _svgEl(18, 18, _0xbdc912, 1.8);
  const _0x24b9b7 = document.createElementNS(_SVG_NS, "path");
  _0x24b9b7.setAttribute("d", "M12 20h9");
  const _0x3d1437 = document.createElementNS(_SVG_NS, "path");
  _0x3d1437.setAttribute("d", "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z");
  _0x517cc4.appendChild(_0x24b9b7);
  _0x517cc4.appendChild(_0x3d1437);
  return _0x517cc4;
}
function _iconAiImage(_0x9eed10) {
  const _0x484901 = _svgEl(18, 18, _0x9eed10, 1.8);
  const _0x164b91 = document.createElementNS(_SVG_NS, "rect");
  _0x164b91.setAttribute("x", "3");
  _0x164b91.setAttribute("y", "3");
  _0x164b91.setAttribute("width", "18");
  _0x164b91.setAttribute("height", "18");
  _0x164b91.setAttribute("rx", "3");
  const _0x394b6c = document.createElementNS(_SVG_NS, "circle");
  _0x394b6c.setAttribute("cx", "8.5");
  _0x394b6c.setAttribute("cy", "8.5");
  _0x394b6c.setAttribute("r", "1.5");
  _0x394b6c.setAttribute("fill", _0x9eed10);
  const _0x4c7f41 = document.createElementNS(_SVG_NS, "polyline");
  _0x4c7f41.setAttribute("points", "21 15 16 10 5 21");
  _0x484901.appendChild(_0x164b91);
  _0x484901.appendChild(_0x394b6c);
  _0x484901.appendChild(_0x4c7f41);
  return _0x484901;
}
function _iconAiVideo(_0x54d8c3) {
  const _0x560ef0 = _svgEl(18, 18, _0x54d8c3, 1.8);
  const _0x5ae8b4 = document.createElementNS(_SVG_NS, "rect");
  _0x5ae8b4.setAttribute("x", "2");
  _0x5ae8b4.setAttribute("y", "6");
  _0x5ae8b4.setAttribute("width", "15");
  _0x5ae8b4.setAttribute("height", "12");
  _0x5ae8b4.setAttribute("rx", "2");
  const _0x57c43d = document.createElementNS(_SVG_NS, "path");
  _0x57c43d.setAttribute("d", "M17 9l5-3v12l-5-3V9z");
  _0x560ef0.appendChild(_0x5ae8b4);
  _0x560ef0.appendChild(_0x57c43d);
  return _0x560ef0;
}
function _iconAiAudio(_0x58d3b3) {
  const _0x9b00eb = _svgEl(18, 18, _0x58d3b3, 1.8);
  const _0x24e142 = document.createElementNS(_SVG_NS, "path");
  _0x24e142.setAttribute("d", "M9 18V5l12-2v13");
  const _0x30a0f1 = document.createElementNS(_SVG_NS, "circle");
  _0x30a0f1.setAttribute("cx", "6");
  _0x30a0f1.setAttribute("cy", "18");
  _0x30a0f1.setAttribute("r", "3");
  const _0x164625 = document.createElementNS(_SVG_NS, "circle");
  _0x164625.setAttribute("cx", "18");
  _0x164625.setAttribute("cy", "16");
  _0x164625.setAttribute("r", "3");
  _0x9b00eb.appendChild(_0x24e142);
  _0x9b00eb.appendChild(_0x30a0f1);
  _0x9b00eb.appendChild(_0x164625);
  return _0x9b00eb;
}
function _iconStoryboardScript(_0x49b8da) {
  const _0x4f9c1b = _svgEl(18, 18, _0x49b8da, 1.8);
  const _0x3cb447 = document.createElementNS(_SVG_NS, "rect");
  _0x3cb447.setAttribute("x", "3");
  _0x3cb447.setAttribute("y", "4");
  _0x3cb447.setAttribute("width", "18");
  _0x3cb447.setAttribute("height", "16");
  _0x3cb447.setAttribute("rx", "2");
  const _0x3438c6 = document.createElementNS(_SVG_NS, "line");
  _0x3438c6.setAttribute("x1", "3");
  _0x3438c6.setAttribute("y1", "9");
  _0x3438c6.setAttribute("x2", "21");
  _0x3438c6.setAttribute("y2", "9");
  const _0x38d57b = document.createElementNS(_SVG_NS, "line");
  _0x38d57b.setAttribute("x1", "3");
  _0x38d57b.setAttribute("y1", "14");
  _0x38d57b.setAttribute("x2", "21");
  _0x38d57b.setAttribute("y2", "14");
  const _0x436219 = document.createElementNS(_SVG_NS, "line");
  _0x436219.setAttribute("x1", "8");
  _0x436219.setAttribute("y1", "4");
  _0x436219.setAttribute("x2", "8");
  _0x436219.setAttribute("y2", "20");
  _0x4f9c1b.appendChild(_0x3cb447);
  _0x4f9c1b.appendChild(_0x3438c6);
  _0x4f9c1b.appendChild(_0x38d57b);
  _0x4f9c1b.appendChild(_0x436219);
  return _0x4f9c1b;
}
function _iconWhiteboard(_0x59dc94) {
  const _0x3c01f7 = _svgEl(18, 18, _0x59dc94, 1.8);
  const _0x5bed5d = document.createElementNS(_SVG_NS, "rect");
  _0x5bed5d.setAttribute("x", "3");
  _0x5bed5d.setAttribute("y", "4");
  _0x5bed5d.setAttribute("width", "18");
  _0x5bed5d.setAttribute("height", "16");
  _0x5bed5d.setAttribute("rx", "2");
  const _0x81658f = document.createElementNS(_SVG_NS, "path");
  _0x81658f.setAttribute("d", "M7 8h10");
  const _0x2dd3b3 = document.createElementNS(_SVG_NS, "path");
  _0x2dd3b3.setAttribute("d", "M7 15c2.2-3 4.6-3 6.8 0 1.1 1.5 2.2 1.5 3.2 0");
  const _0x38dc3c = document.createElementNS(_SVG_NS, "path");
  _0x38dc3c.setAttribute("d", "M14.5 11.5l2.5-2.5 2 2-2.5 2.5-2.7.7.7-2.7z");
  _0x3c01f7.appendChild(_0x5bed5d);
  _0x3c01f7.appendChild(_0x81658f);
  _0x3c01f7.appendChild(_0x2dd3b3);
  _0x3c01f7.appendChild(_0x38dc3c);
  return _0x3c01f7;
}
function _iconSourceText(_0x4b84de) {
  const _0xfc38c6 = _svgEl(18, 18, _0x4b84de, 1.8);
  const _0xa190aa = document.createElementNS(_SVG_NS, "polyline");
  _0xa190aa.setAttribute("points", "4 7 4 4 20 4 20 7");
  const _0x6ea9d8 = document.createElementNS(_SVG_NS, "line");
  _0x6ea9d8.setAttribute("x1", "9");
  _0x6ea9d8.setAttribute("y1", "20");
  _0x6ea9d8.setAttribute("x2", "15");
  _0x6ea9d8.setAttribute("y2", "20");
  const _0x29bdc3 = document.createElementNS(_SVG_NS, "line");
  _0x29bdc3.setAttribute("x1", "12");
  _0x29bdc3.setAttribute("y1", "4");
  _0x29bdc3.setAttribute("x2", "12");
  _0x29bdc3.setAttribute("y2", "20");
  _0xfc38c6.appendChild(_0xa190aa);
  _0xfc38c6.appendChild(_0x6ea9d8);
  _0xfc38c6.appendChild(_0x29bdc3);
  return _0xfc38c6;
}
function _isPanorama360TargetType(_0x182cd0) {
  return _PANORAMA_360_TARGET_TYPES.has(String(_0x182cd0 || "").trim());
}
function _isBlockedOutputNodeType(_0x5694c7) {
  return _PANORAMA_SOURCE_BLOCKED_TYPES.has(String(_0x5694c7 || "").trim());
}
function _isPanorama360ImageSourceType(_0x1f4d48) {
  return _PANORAMA_360_IMAGE_SOURCE_TYPES.has(String(_0x1f4d48 || "").trim());
}
function _isStoryboardInputTargetType(_0x32ecd6) {
  const _0x21bfe3 = String(_0x32ecd6 || "").trim();
  return _0x21bfe3 === "storyboard" || _0x21bfe3 === "storyboard-script";
}
function _isModelPolicyTargetType(_0x30ed22) {
  const _0x143246 = String(_0x30ed22 || "").trim();
  return _0x143246 === "ai-image" || _0x143246 === "ai-text" || _0x143246 === "ai-video" || _0x143246 === "ai-audio";
}
function _isSharedInputPolicyTargetType(_0x5933f1) {
  return _isModelPolicyTargetType(_0x5933f1) || _isStoryboardInputTargetType(_0x5933f1);
}
export function getAllowedInputNodeTypesForSidePlus(_0x4fd030) {
  const _0x307d77 = _0x4fd030 && typeof _0x4fd030 === "object" && !Array.isArray(_0x4fd030) ? _0x4fd030 : null;
  const _0x2d53e8 = String(_0x307d77?.type || _0x4fd030 || "").trim();
  const _0x1b303a = {
    "source-image": ["source-image", "ai-image"],
    "ai-image": ["source-image", "ai-image"],
    whiteboard: ["source-image", "ai-image"],
    "ai-audio": ["source-text", "ai-text", "source-audio", "source-video", "ai-audio", "ai-video"],
    "ai-video": ["source-text", "source-video", "ai-image", "ai-audio", "ai-video"],
    "ai-text": ["source-text", "source-video", "ai-image", "ai-video", "ai-audio"],
    "media-clip": ["source-image", "ai-image", "source-video", "ai-video", "source-audio", "ai-audio"],
    storyboard: ["source-text", "source-image", "source-video", "ai-text", "ai-image", "ai-video"],
    "storyboard-script": ["source-text", "source-image", "source-video", "ai-text", "ai-image", "ai-video"],
    "panorama-360": ["source-image", "ai-image"],
    panorama_360: ["source-image", "ai-image"],
    panorama360: ["source-image", "ai-image"]
  };
  const _0x33bb96 = _0x1b303a[_0x2d53e8] || ["source-text"];
  if (!_0x307d77 || !_isSharedInputPolicyTargetType(_0x2d53e8)) {
    return _0x33bb96;
  }
  const _0x349075 = getTargetInputPolicy(_0x307d77);
  return _0x33bb96.filter(_0x5bd56d => isInputKindAllowed(_0x349075, normalizeInputKind(_0x5bd56d)));
}
export function getAllowedGenerationNodeTypesForQuoteMenu(_0x10ea19 = []) {
  const _0x33aa73 = ["ai-text", "ai-image", "ai-video", "ai-audio", "storyboard-script", "panorama-360", "whiteboard"];
  const _0x54ff93 = Array.isArray(_0x10ea19) ? _0x10ea19.filter(Boolean) : [];
  return _0x33aa73.filter(_0x5027a7 => _0x54ff93.some(_0x5325e7 => isValidConnection(_0x5325e7, {
    id: "__fake_" + _0x5027a7,
    type: _0x5027a7
  })));
}
export function setDragContextGetter(_0x5b6458) {
  _getDragContext = typeof _0x5b6458 === "function" ? _0x5b6458 : () => ({});
}
export function isValidConnection(_0x2ac7ee, _0x3d2d40) {
  if (!_0x2ac7ee || !_0x3d2d40) {
    return false;
  }
  if (_0x2ac7ee.id === _0x3d2d40.id) {
    return false;
  }
  const _0x472055 = _0x2ac7ee.type || "";
  const _0x46dd73 = _0x3d2d40.type || "";
  if (_0x472055 === "debug" || _isBlockedOutputNodeType(_0x472055)) {
    return false;
  }
  const _0x5352cb = _0x5b0543 => _0x5b0543 === "ai-image" || _0x5b0543 === "ai-text" || _0x5b0543 === "ai-video" || _0x5b0543 === "ai-audio" || _0x5b0543 === "media-clip" || _isStoryboardInputTargetType(_0x5b0543) || _0x5b0543 === "group" || _isPanorama360TargetType(_0x5b0543) || _0x5b0543 === "whiteboard";
  if (!_0x5352cb(_0x46dd73)) {
    return false;
  }
  if (_0x46dd73 === "whiteboard") {
    return _0x472055 === "source-image" || _0x472055 === "ai-image";
  }
  if (_0x472055 === "group") {
    return _0x46dd73 === "group" || _isSharedInputPolicyTargetType(_0x46dd73);
  }
  if (_isPanorama360TargetType(_0x46dd73)) {
    if (!_isPanorama360ImageSourceType(_0x472055)) {
      return false;
    }
  }
  if (isMediaClipNodeType(_0x46dd73)) {
    return isSupportedMediaClipInput(_0x2ac7ee);
  }
  if (_0x46dd73 === "ai-image") {
    const _0x429d2a = ["source-image", "image", "ai-image", "source-text", "text", "ai-text"];
    if (!_0x429d2a.includes(_0x472055)) {
      return false;
    }
  }
  if (_0x46dd73 === "ai-audio") {
    if (_0x472055 === "source-image" || _0x472055 === "image" || _0x472055 === "ai-image") {
      return false;
    }
  }
  if (_isSharedInputPolicyTargetType(_0x46dd73)) {
    const _0x1eeea0 = resolveEffectiveInputKind(_0x2ac7ee);
    if (_0x1eeea0 && !isInputKindAllowed(getTargetInputPolicy(_0x3d2d40), _0x1eeea0)) {
      return false;
    }
    const _0x2585ca = getFixedInputSlotConfigFromManifest(_0x3d2d40);
    if (_0x2585ca && _0x1eeea0 && _0x1eeea0 !== "text") {
      const _0x59da39 = new Set(_0x2585ca.visibleSlots || []);
      const _0x50bb92 = _0x2585ca.slotOrderByType?.[_0x1eeea0] || [];
      const _0x349fbc = _0x50bb92.filter(_0x37217f => _0x59da39.has(_0x37217f));
      const _0x21d658 = _0x349fbc.length > 0 ? _0x349fbc : _0x50bb92;
      if (_0x21d658.length > 0 && !_0x21d658.some(_0x509b5f => fixedInputSlotAcceptsSource(_0x2585ca, _0x509b5f, _0x2ac7ee))) {
        return false;
      }
    }
  }
  if (resolveEffectiveInputKind(_0x2ac7ee) === "video" && !hasUsableInputNodeSource(_0x2ac7ee)) {
    return false;
  }
  return true;
}
function _videoSourceKey(_0x505794) {
  if (!_0x505794 || typeof _0x505794 !== "object") {
    return "";
  }
  return String(_0x505794.localPath || "").trim() || String(_0x505794.displayLocalPath || "").trim() || String(_0x505794.originalLocalPath || "").trim() || String(_0x505794.videoLocalPath || "").trim() || String(_0x505794.videoUrl || "").trim() || String(_0x505794.src || "").trim() || String(_0x505794.url || "").trim() || String(_0x505794.resultUrl || "").trim() || String(_0x505794.sourceUrl || "").trim() || String(_0x505794.thumbId || "").trim();
}
function _isUnavailableVideoRecord(_0x2f8a0a) {
  const _0x36c4ee = _videoSourceKey(_0x2f8a0a);
  if (!_0x36c4ee) {
    return false;
  }
  return _0x2f8a0a?.mediaUnavailable === true && String(_0x2f8a0a?.mediaUnavailableSource || "").trim() === _0x36c4ee;
}
const SIDE_PLUS_POINTER_BLOCKER_SELECTOR = [".floating-menu", ".img-model-menu", ".model-menu", ".fa-model-menu", ".img-ratio-popup", ".rh-res-popup", ".rh-adv-panel", ".rh-vram-adv-panel", ".node-floating-toolbar", "[data-ui-stop=\"1\"]"].join(",");
export function isSidePlusPointerBlockedByElement(_0x4e6908) {
  const _0x4c35d2 = _0x4e6908 && typeof _0x4e6908.closest === "function" ? _0x4e6908 : _0x4e6908?.parentElement || null;
  if (!_0x4c35d2) {
    return false;
  }
  if (_0x4c35d2.closest(".side-plus-btn, #v2-side-plus-holder")) {
    return false;
  }
  return !!_0x4c35d2.closest(SIDE_PLUS_POINTER_BLOCKER_SELECTOR);
}
function _isSidePlusPointerOnCanvasSurface(_0x248a2e) {
  const _0x32dbeb = _0x248a2e && typeof _0x248a2e.closest === "function" ? _0x248a2e : _0x248a2e?.parentElement || null;
  if (!_0x32dbeb || typeof document === "undefined") {
    return true;
  }
  const _0x685c7d = document.getElementById?.("v2-canvas");
  if (!_0x685c7d) {
    return true;
  }
  const _0x493bc8 = _0x685c7d.closest?.(".v2-canvas-stage") || null;
  return _0x32dbeb === _0x685c7d || _0x685c7d.contains?.(_0x32dbeb) === true || _0x32dbeb === _0x493bc8 || _0x493bc8?.contains?.(_0x32dbeb) === true;
}
function _resolveSidePlusPointerElementAt(_0xb4bafb, _0x208797, _0x369874) {
  if (_0x369874 !== undefined) {
    return _0x369874;
  }
  if (typeof document === "undefined") {
    return null;
  }
  if (!Number.isFinite(_0xb4bafb) || !Number.isFinite(_0x208797)) {
    return null;
  }
  return document.elementFromPoint?.(_0xb4bafb, _0x208797) || null;
}
function _resolveSidePlusPointerNodeIdByElement(_0x41e88b) {
  const _0x25caf7 = _0x41e88b && typeof _0x41e88b.closest === "function" ? _0x41e88b : _0x41e88b?.parentElement || null;
  const _0x215e75 = _0x25caf7?.closest?.(".v2-node");
  return String(_0x215e75?.dataset?.nodeId || _0x215e75?.id || "").trim();
}
function _resolveSidePlusPointerContextAt(_0x1dce44, _0x2edede, _0x2e794e) {
  const _0x5562f2 = _resolveSidePlusPointerElementAt(_0x1dce44, _0x2edede, _0x2e794e);
  let _0x25b232 = "allow";
  if (isSidePlusPointerBlockedByElement(_0x5562f2)) {
    _0x25b232 = "block";
  } else if (!_isSidePlusPointerOnCanvasSurface(_0x5562f2)) {
    _0x25b232 = "selection-only";
  }
  return {
    policy: _0x25b232,
    nodeId: _resolveSidePlusPointerNodeIdByElement(_0x5562f2)
  };
}
export function resolveSidePlusPointerPolicyAt(_0x165f5f, _0x5d8e46, _0x195b87) {
  return _resolveSidePlusPointerContextAt(_0x165f5f, _0x5d8e46, _0x195b87).policy;
}
export function isSidePlusPointerBlockedAt(_0x110741, _0x3ae093, _0x4067c3) {
  return resolveSidePlusPointerPolicyAt(_0x110741, _0x3ae093, _0x4067c3) === "block";
}
export function resolveSidePlusLayerZIndex(_0x82310c) {
  const _0x155359 = Number.parseInt(String(_0x82310c ?? ""), 10);
  const _0xa3a114 = Number.isFinite(_0x155359) ? _0x155359 : 10;
  return String(Math.max(0, _0xa3a114 - 1));
}
export function resolveSidePlusButtonPosition({
  screenX: _0x3c53af,
  screenY: _0x3a897f,
  screenRadius: _0x21c152,
  cssRadius: _0x40816c,
  viewport: _0x449aee,
  holderUsesWorldCoordinates: _0x482534
}) {
  if (_0x482534) {
    const _0x4b88c3 = screenToWorld(_0x3c53af, _0x3a897f, _0x449aee);
    return {
      left: _0x4b88c3.x - _0x40816c,
      top: _0x4b88c3.y - _0x40816c
    };
  }
  return {
    left: _0x3c53af - _0x21c152,
    top: _0x3a897f - _0x21c152
  };
}
export function resolveSidePlusRenderState({
  isDraggingPlus = false,
  isNodeDragging = false,
  isBoxSelecting = false,
  isConnecting = false,
  isPanning = false,
  isZooming = false,
  isViewportAnimating = false,
  isSpaceHeld = false,
  selectedCount = 0,
  requestedSelectionOnly = false
} = {}) {
  const _0x2e84b8 = Number(selectedCount) || 0;
  const _0x524c20 = _0x2e84b8 > 0;
  const _0x547220 = _0x2e84b8 >= 2;
  if (isDraggingPlus) {
    return {
      shouldClear: true,
      selectionOnly: false
    };
  }
  if (isNodeDragging) {
    return {
      shouldClear: true,
      selectionOnly: false
    };
  }
  if (_0x524c20 && (isBoxSelecting || isConnecting || isSpaceHeld)) {
    return {
      shouldClear: false,
      selectionOnly: true
    };
  }
  if (isBoxSelecting || isConnecting) {
    return {
      shouldClear: true,
      selectionOnly: false
    };
  }
  const _0x4625de = requestedSelectionOnly || _0x547220;
  if (isSpaceHeld && !isPanning && !_0x4625de) {
    return {
      shouldClear: true,
      selectionOnly: false
    };
  }
  return {
    shouldClear: false,
    selectionOnly: _0x4625de
  };
}
export function shouldShowSidePlusForNode({
  sideDistance: _0x36b1bd,
  threshold: _0x2add1d,
  isSelected = false,
  isHovered = false,
  isInside = false,
  nodeType = ""
} = {}) {
  if (isSelected) {
    return true;
  }
  if (!isHovered) {
    return false;
  }
  const _0x4b22f4 = Number(_0x36b1bd);
  const _0x21f1c9 = Number(_0x2add1d);
  if (Number.isFinite(_0x4b22f4) && Number.isFinite(_0x21f1c9) && _0x4b22f4 < _0x21f1c9) {
    return true;
  }
  return !!isInside && String(nodeType || "").trim() !== "group";
}
export function shouldUseInlineMediaClipAddSlot(_0x44acd7 = "") {
  return isMediaClipNodeType(_0x44acd7);
}
export function shouldShowRightSidePlusForNodeType(_0x535ae1 = "") {
  const _0x26a730 = String(_0x535ae1 || "").trim();
  if (_0x26a730 === "debug") {
    return false;
  }
  if (_0x26a730 === "comment-note") {
    return false;
  }
  if (_0x26a730 === "whiteboard") {
    return false;
  }
  if (_0x26a730 === "storyboard") {
    return false;
  }
  if (_0x26a730 === "collage") {
    return false;
  }
  return !_isBlockedOutputNodeType(_0x26a730) && !shouldUseInlineMediaClipAddSlot(_0x26a730);
}
export function getGroupSidePlusAnchorCandidateIds({
  nodes: _0x4cdcbc,
  candidateIds: _0x5cfe16,
  viewport: _0x2a84af,
  mx: _0x5d3972,
  my: _0x1c0c62,
  threshold: _0x4445a9,
  gap = 36
} = {}) {
  if (!Number.isFinite(_0x5d3972) || !Number.isFinite(_0x1c0c62)) {
    return [];
  }
  const _0x300842 = Number(_0x2a84af?.zoom) || 1;
  const _0x1f6457 = Number(_0x4445a9);
  if (!Number.isFinite(_0x1f6457)) {
    return [];
  }
  const _0x3b5945 = [];
  const _0x51e4e4 = Array.isArray(_0x5cfe16) ? _0x5cfe16.map(_0x3429f0 => [_0x3429f0, _0x4cdcbc?.[_0x3429f0]]) : Object.entries(_0x4cdcbc || {});
  for (const [_0x2cccb0, _0x3ca933] of _0x51e4e4) {
    if (!isNodeType(_0x3ca933, "group")) {
      continue;
    }
    const _0x45e895 = String(_0x3ca933?.id || _0x2cccb0 || "").trim();
    if (!_0x45e895) {
      continue;
    }
    const _0x32cdf4 = _0x3ca933.width || 400;
    const _0x14360e = _0x3ca933.height || 300;
    const _0xecd114 = getNodeScreenRect({
      x: _0x3ca933.x,
      y: _0x3ca933.y,
      width: _0x32cdf4,
      height: _0x14360e
    }, _0x2a84af);
    const _0x53dc23 = _0xecd114.right + gap * _0x300842;
    const _0x330395 = _0xecd114.top + _0xecd114.height / 2;
    if (Math.hypot(_0x5d3972 - _0x53dc23, _0x1c0c62 - _0x330395) < _0x1f6457) {
      _0x3b5945.push(_0x45e895);
    }
  }
  return _0x3b5945;
}
export function resolveSidePlusCandidateIds({
  selectedIds = [],
  isMultiSelection = false,
  selectionOnly = false,
  hoverNodeId = null,
  groupAnchorIds = []
} = {}) {
  const _0x11d536 = Array.isArray(groupAnchorIds) ? groupAnchorIds.filter(Boolean) : [];
  const _0x31dde9 = Array.isArray(selectedIds) ? selectedIds.filter(Boolean) : [];
  const _0x69b2fc = isMultiSelection ? new Set() : new Set(_0x31dde9);
  const _0x11ef3e = new Set();
  const _0x3c1de2 = !isMultiSelection && !selectionOnly && _0x11d536.length > 0;
  if (!isMultiSelection && !selectionOnly && hoverNodeId && !_0x3c1de2) {
    _0x69b2fc.add(hoverNodeId);
  }
  if (!isMultiSelection && !selectionOnly) {
    for (const _0xdf63b of _0x11d536) {
      _0x69b2fc.add(_0xdf63b);
      _0x11ef3e.add(_0xdf63b);
    }
  }
  return {
    candidateIds: _0x69b2fc,
    sideAnchorHoverIds: _0x11ef3e
  };
}
export function computeMultiSelectionBoundsForSidePlus(_0x239155, _0x1903d6, _0x120491 = {}) {
  const _0x427da8 = Array.isArray(_0x239155) ? _0x239155 : [];
  if (_0x427da8.length < 2) {
    return null;
  }
  const _0x3abfa5 = _0x120491?.movedNodeIds && typeof _0x120491.movedNodeIds[Symbol.iterator] === "function" ? new Set(_0x120491.movedNodeIds) : null;
  const _0x17a1ef = Number.isFinite(_0x120491?.offsetX) ? _0x120491.offsetX : 0;
  const _0x56bdbd = Number.isFinite(_0x120491?.offsetY) ? _0x120491.offsetY : 0;
  let _0x58c97e = Infinity;
  let _0x4b4e56 = Infinity;
  let _0x22bdcd = -Infinity;
  let _0x48324c = -Infinity;
  let _0x151ade = 0;
  for (const _0x38cbcb of _0x427da8) {
    const _0x40a5d6 = _0x1903d6?.[_0x38cbcb];
    if (!_0x40a5d6) {
      continue;
    }
    const _0x1a5dda = _0x3abfa5?.has(_0x38cbcb) === true;
    const _0x1b1d64 = _0x40a5d6.x + (_0x1a5dda ? _0x17a1ef : 0);
    const _0x5c1cb6 = _0x40a5d6.y + (_0x1a5dda ? _0x56bdbd : 0);
    _0x151ade += 1;
    const _0x1797fe = _0x40a5d6.width || 260;
    const _0x3e9c0f = _0x40a5d6.height || 100;
    const _0x2bc905 = _0x1b1d64;
    const _0x42b8c7 = _0x40a5d6.type !== "group" ? _0x5c1cb6 - 30 : _0x5c1cb6;
    const _0xeb5ca3 = _0x1b1d64 + _0x1797fe;
    const _0x5c9d64 = _0x5c1cb6 + _0x3e9c0f;
    _0x58c97e = Math.min(_0x58c97e, _0x2bc905);
    _0x4b4e56 = Math.min(_0x4b4e56, _0x42b8c7);
    _0x22bdcd = Math.max(_0x22bdcd, _0xeb5ca3);
    _0x48324c = Math.max(_0x48324c, _0x5c9d64);
  }
  if (_0x151ade < 2 || !Number.isFinite(_0x58c97e) || !Number.isFinite(_0x4b4e56)) {
    return null;
  }
  return {
    minX: _0x58c97e,
    minY: _0x4b4e56,
    maxX: _0x22bdcd,
    maxY: _0x48324c
  };
}
let _draftEdgeCache = {
  pathEl: null,
  lastStartX: 0,
  lastStartY: 0,
  lastEndX: 0,
  lastEndY: 0,
  lastSide: "",
  lastPathStyle: "",
  lastZoom: 0
};
function _resetDraftEdgeCache(_0x5cc5db = null) {
  _draftEdgeCache = {
    pathEl: _0x5cc5db,
    lastStartX: 0,
    lastStartY: 0,
    lastEndX: 0,
    lastEndY: 0,
    lastSide: "",
    lastPathStyle: "",
    lastZoom: 0
  };
}
function _getDraftEdgePath() {
  if (typeof document === "undefined") {
    _resetDraftEdgeCache();
    return null;
  }
  const _0x2a96df = document.getElementById("v2-edges");
  if (!_0x2a96df) {
    _resetDraftEdgeCache();
    return null;
  }
  let _0x237a4e = _draftEdgeCache.pathEl;
  if (_0x237a4e && (_0x237a4e.parentNode !== _0x2a96df || _0x237a4e.isConnected === false)) {
    _0x237a4e.remove?.();
    _0x237a4e = null;
  }
  if (!_0x237a4e) {
    _0x237a4e = _0x2a96df.querySelector?.("#v2-draft-edge") || null;
    if (_0x237a4e && (_0x237a4e.parentNode !== _0x2a96df || _0x237a4e.isConnected === false)) {
      _0x237a4e = null;
    }
  }
  if (!_0x237a4e) {
    _0x237a4e = document.createElementNS("http://www.w3.org/2000/svg", "path");
    _0x237a4e.id = "v2-draft-edge";
    _0x237a4e.setAttribute("class", "conn-drag-path");
    _0x237a4e.setAttribute("fill", "none");
    _0x237a4e.setAttribute("stroke", "var(--indigo-70)");
    _0x237a4e.setAttribute("stroke-linecap", "round");
    _0x2a96df.appendChild(_0x237a4e);
  }
  if (_draftEdgeCache.pathEl !== _0x237a4e) {
    _resetDraftEdgeCache(_0x237a4e);
  }
  return _0x237a4e;
}
function _renderDraftEdgeDirectly(_0x634f4c, _0x5c99a8, _0x37de84, _0x1a65a9, _0x5ce3e3, _0xe29a99) {
  const _0x49a83f = _getDraftEdgePath();
  if (!_0x49a83f) {
    return;
  }
  const _0x519264 = Math.hypot(_0x37de84 - _0x634f4c, _0x1a65a9 - _0x5c99a8);
  if (_0x519264 < 5) {
    _0x49a83f.style.display = "none";
    return;
  }
  const _0x1d63d2 = normalizeConnectionLineStyle(uiStore.getStateRaw()?.ui?.connectionLineStyle);
  const _0x3de8c1 = _0x634f4c !== _draftEdgeCache.lastStartX || _0x5c99a8 !== _draftEdgeCache.lastStartY || _0x37de84 !== _draftEdgeCache.lastEndX || _0x1a65a9 !== _draftEdgeCache.lastEndY || _0x5ce3e3 !== _draftEdgeCache.lastSide || _0x1d63d2 !== _draftEdgeCache.lastPathStyle;
  const _0x5bc2a0 = _0xe29a99.zoom !== _draftEdgeCache.lastZoom;
  if (_0x3de8c1) {
    const _0x498651 = Math.abs(_0x37de84 - _0x634f4c);
    const _0x3d0272 = Math.min(_0x498651 * 0.75, 80);
    const _0x3a930d = buildConnectionPathGeometry({
      startX: _0x634f4c,
      startY: _0x5c99a8,
      endX: _0x37de84,
      endY: _0x1a65a9,
      style: _0x1d63d2,
      startSide: _0x5ce3e3,
      curveOffset: _0x3d0272
    });
    _0x49a83f.setAttribute("d", _0x3a930d.d);
    _draftEdgeCache.lastStartX = _0x634f4c;
    _draftEdgeCache.lastStartY = _0x5c99a8;
    _draftEdgeCache.lastEndX = _0x37de84;
    _draftEdgeCache.lastEndY = _0x1a65a9;
    _draftEdgeCache.lastSide = _0x5ce3e3;
    _draftEdgeCache.lastPathStyle = _0x1d63d2;
  }
  if (_0x5bc2a0) {
    _0x49a83f.setAttribute("stroke-width", "" + 2 / _0xe29a99.zoom);
    _0x49a83f.style.strokeDasharray = 6 / _0xe29a99.zoom + " " + 4 / _0xe29a99.zoom;
    _draftEdgeCache.lastZoom = _0xe29a99.zoom;
  }
  _0x49a83f.style.display = "block";
}
function _clearDraftEdgeDirectly() {
  const _0x2cb1d5 = document.getElementById("v2-draft-edge");
  if (_0x2cb1d5) {
    _0x2cb1d5.style.display = "none";
  }
}
export function createEdgeController() {
  function _0x10b882(_0x32c7be, _0x114cb9, _0x3ea085, _0x323c8d, _0x2ee602) {
    if (!_0x114cb9 || !_0x114cb9.target) {
      return false;
    }
    const _0x5c665e = _0x114cb9.target.closest(".v2-handle");
    if (!_0x5c665e) {
      return false;
    }
    _0x114cb9.preventDefault();
    _0x114cb9.stopPropagation();
    _0x32c7be.isConnecting = true;
    _0x32c7be.connectSourceId = _0x5c665e.dataset.nodeId;
    _0x32c7be.connectStartX = _0x3ea085;
    _0x32c7be.connectStartY = _0x323c8d;
    _0x32c7be.connectSide = "left";
    _renderDraftEdgeDirectly(_0x3ea085, _0x323c8d, _0x3ea085, _0x323c8d, "left", _0x2ee602);
    return true;
  }
  function _0xd5d827(_0x5f4fb0, _0x186a3a, _0x1f589a, _0x1514d2, _0x138e9d, _0x34fa03, _0xe46ee8, _0x14e52f) {
    _renderDraftEdgeDirectly(_0x5f4fb0.connectStartX || _0x1514d2, _0x5f4fb0.connectStartY || _0x138e9d, _0x1514d2, _0x138e9d, _0x5f4fb0.connectSide || "left", _0x34fa03);
    const _0x1ea5c8 = _getNodeSpatialIndex(_0xe46ee8, getStateRaw()._persistRev, _NODE_SPATIAL_INDEX_DEFAULT_KEY);
    let _0x78f2d9 = hitTestNode(_0x186a3a, _0x1f589a, _0xe46ee8, _0x34fa03, _0x5f4fb0.connectSourceId, false, {
      spatialIndex: _0x1ea5c8
    });
    if (_0x78f2d9 && _0x14e52f?.invalidNodeIds?.includes(_0x78f2d9)) {
      _0x78f2d9 = null;
    }
    if ((_0x14e52f?.hoverId || null) !== _0x78f2d9) {
      graphStore.setConnOverlay({
        hoverId: _0x78f2d9,
        side: _0x5f4fb0.connectSide
      });
    }
    return true;
  }
  function _0x4a8433(_0x470025, _0x1f8969, _0x5d3e4f) {
    const _0x2c91fd = getStateRaw();
    const {
      viewport: _0x1ea9da,
      nodes: _0x42a000
    } = _0x2c91fd;
    const _0x319a56 = _getNodeSpatialIndex(_0x42a000, _0x2c91fd._persistRev, _NODE_SPATIAL_INDEX_DEFAULT_KEY);
    const _0x41ec3a = hitTestNode(_0x1f8969, _0x5d3e4f, _0x42a000, _0x1ea9da, _0x470025.connectSourceId, false, {
      spatialIndex: _0x319a56
    });
    const _0x5a53b7 = _0x41ec3a ? _0x42a000[_0x41ec3a] : null;
    let _0x37a315 = false;
    if (_0x5a53b7) {
      _0x37a315 = addEdgeWithPolicies({
        sourceId: _0x470025.connectSourceId,
        targetId: _0x5a53b7.id
      });
    }
    _clearDraftEdgeDirectly();
    graphStore.clearConnOverlay();
    return _0x37a315;
  }
  return {
    tryStartHandleConnect: _0x10b882,
    updateHandleConnect: _0xd5d827,
    finishHandleConnect: _0x4a8433
  };
}
export function initConnectionHandles(_0x2d84bf) {
  const _0x31600a = document.createElement("div");
  _0x31600a.id = "v2-side-plus-holder";
  const _0x27142c = document.getElementById("v2-canvas");
  const _0x4e1178 = !!_0x27142c;
  Object.assign(_0x31600a.style, _0x4e1178 ? {
    position: "absolute",
    left: "0",
    top: "0",
    width: "0",
    height: "0",
    pointerEvents: "none",
    zIndex: "auto",
    overflow: "visible"
  } : {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "95",
    overflow: "visible"
  });
  (_0x27142c || document.body).appendChild(_0x31600a);
  const _0x197b4e = new Map();
  const _0x4a6b64 = new Map();
  const _0x7ca476 = new Map();
  const _0x3f2c00 = createGroupSidePlusCandidateIdCache();
  let _0x19ad96 = {
    dragging: false,
    srcId: null,
    sourceNodeIds: [],
    plusKind: "node",
    side: "right",
    ax: 0,
    ay: 0,
    sx: 0,
    sy: 0,
    lastX: 0,
    lastY: 0,
    anchorWorldX: null,
    anchorWorldY: null,
    didAssistPan: false,
    assistPanViewport: null
  };
  const _0xd82613 = createViewportPreviewCoordinator({
    beginPreview: beginViewportPanPreview,
    updatePreview(_0x4ef878) {
      updateViewportPanPreview(_0x4ef878.x, _0x4ef878.y, _0x4ef878.zoom);
    },
    flushPreview: flushViewportPanPreview,
    getPreview: getViewportPanPreview,
    isPreviewActive: isViewportPanPreviewActive
  });
  function _0x227453(_0x35f660, _0x31b92a = null) {
    const _0x304182 = [];
    const _0x2f58e4 = new Set();
    const _0x28c505 = Array.isArray(_0x35f660) ? _0x35f660 : [];
    for (const _0x30a33a of _0x28c505) {
      const _0x1c90f0 = String(_0x30a33a || "").trim();
      if (!_0x1c90f0 || _0x2f58e4.has(_0x1c90f0)) {
        continue;
      }
      _0x2f58e4.add(_0x1c90f0);
      _0x304182.push(_0x1c90f0);
    }
    const _0x442755 = String(_0x31b92a || "").trim();
    if (_0x304182.length === 0 && _0x442755) {
      _0x304182.push(_0x442755);
    }
    return _0x304182;
  }
  function _0x848a78({
    sourceNodeId: _0x5d54dd,
    targetNodeId: _0x2362c8,
    side: _0x3c9fa5,
    nodes: _0x234296,
    edges: _0x5e86fc,
    outMap: _0x42e52c
  }) {
    if (!_0x5d54dd || !_0x2362c8 || _0x5d54dd === _0x2362c8) {
      return false;
    }
    const _0x5f3c50 = _0x234296?.[_0x5d54dd];
    const _0x229188 = _0x234296?.[_0x2362c8];
    if (!_0x5f3c50 || !_0x229188) {
      return false;
    }
    const _0x2ec58e = _0x3c9fa5 === "right" ? _0x5f3c50 : _0x229188;
    const _0x508fb5 = _0x3c9fa5 === "right" ? _0x229188 : _0x5f3c50;
    if (!_0x2ec58e?.id || !_0x508fb5?.id) {
      return false;
    }
    const _0xf936bb = !!_0x42e52c.get(_0x2ec58e.id)?.has(_0x508fb5.id);
    if (_0xf936bb) {
      return false;
    }
    if (String(_0x2ec58e.type || "").trim() === "group" && String(_0x508fb5.type || "").trim() === "group" && wouldCreateGroupOutputCycle({
      sourceId: _0x2ec58e.id,
      targetId: _0x508fb5.id,
      nodes: _0x234296,
      edges: _0x5e86fc
    })) {
      return false;
    }
    return isValidConnection(_0x2ec58e, _0x508fb5);
  }
  function _0x5c07a0(_0x129954, _0x2d1d61, _0x10e5a9, _0x3d8b5c, _0x1d1dd0) {
    if (_0x1d1dd0 !== "right") {
      return;
    }
    if (String(_0x10e5a9?.type || "") !== "ai-video") {
      return;
    }
    if (String(_0x3d8b5c?.type || "") !== "ai-video") {
      return;
    }
    const _0x40b946 = getFixedInputSlotConfigFromManifest(_0x3d8b5c);
    if (_0x40b946?.slotKindById?.sourceVideo === "video" && _0x40b946?.slotKindById?.refImage === "image") {
      return;
    }
    const _0x334711 = Number(_0x3d8b5c.width || 0);
    const _0x19c913 = Number(_0x3d8b5c.height || 0);
    const _0x4437da = Array.isArray(_0x3d8b5c.videos) && _0x3d8b5c.videos.length > 0 || String(_0x3d8b5c.videoUrl || "").trim() || String(_0x3d8b5c.localPath || "").trim() || String(_0x3d8b5c.thumbId || "").trim();
    if (_0x334711 !== 300 || _0x19c913 !== 300 || _0x4437da) {
      return;
    }
    const _0x2448f0 = getStateRaw();
    const _0x2ae6a5 = _0x2448f0.nodes?.[_0x2d1d61];
    if (!_0x2ae6a5) {
      return;
    }
    const _0x44b3ad = Number(_0x2ae6a5.x || 0) + Number(_0x2ae6a5.width || 0) / 2;
    const _0x32c2fd = Number(_0x2ae6a5.y || 0) + Number(_0x2ae6a5.height || 0) / 2;
    const _0x55ef38 = Date.now();
    const _0x4a127f = () => {
      const _0xe11764 = getDisplayedMediaSizeFromNode(_0x129954, "video");
      const _0xdf8973 = Number(_0xe11764?.w || 0);
      const _0x4baa53 = Number(_0xe11764?.h || 0);
      let _0x4cd05e = _0xdf8973;
      let _0x548cef = _0x4baa53;
      if (!(_0x4cd05e > 0) || !(_0x548cef > 0)) {
        const _0x4fe62d = getStateRaw();
        const _0x249f51 = _0x4fe62d.nodes?.[_0x129954];
        if (_0x249f51) {
          const _0x2237e6 = Number(_0x249f51.mainVideoIndex);
          const _0x470804 = Number.isFinite(_0x2237e6) ? Math.max(0, Math.trunc(_0x2237e6)) : 0;
          const _0x570ae5 = Array.isArray(_0x249f51.videos) ? _0x249f51.videos : [];
          const _0x3c00ef = _0x570ae5[_0x470804];
          const _0x3db3ff = Number(_0x3c00ef?.videoWidth || 0);
          const _0x42775b = Number(_0x3c00ef?.videoHeight || 0);
          const _0x13f82f = Number(_0x249f51.selectedVideoWidth || 0);
          const _0x3a6a0a = Number(_0x249f51.selectedVideoHeight || 0);
          const _0x15473e = Number(_0x249f51.videoWidth || 0);
          const _0x5f43dc = Number(_0x249f51.videoHeight || 0);
          if (_0x3db3ff > 0 && _0x42775b > 0) {
            _0x4cd05e = _0x3db3ff;
            _0x548cef = _0x42775b;
          } else if (_0x13f82f > 0 && _0x3a6a0a > 0) {
            _0x4cd05e = _0x13f82f;
            _0x548cef = _0x3a6a0a;
          } else if (_0x15473e > 0 && _0x5f43dc > 0) {
            _0x4cd05e = _0x15473e;
            _0x548cef = _0x5f43dc;
          }
        }
      }
      if (_0x4cd05e > 0 && _0x548cef > 0) {
        const _0x4854fc = _0x4cd05e / _0x548cef;
        if (Number.isFinite(_0x4854fc) && _0x4854fc > 0) {
          const _0x54faac = getAIGenerationNodeSize(_0x4cd05e, _0x548cef);
          const _0xa4b202 = _0x54faac.width;
          const _0x33bba1 = _0x54faac.height;
          graphStore.updateNodeData(_0x2d1d61, {
            width: _0xa4b202,
            height: _0x33bba1,
            x: _0x44b3ad - _0xa4b202 / 2,
            y: _0x32c2fd - _0x33bba1 / 2
          });
          commit();
        }
        return;
      }
      if (Date.now() - _0x55ef38 < 1200) {
        requestAnimationFrame(_0x4a127f);
      }
    };
    requestAnimationFrame(_0x4a127f);
  }
  function _0x594221() {
    const {
      nodes: _0x5b1d7e,
      edges: _0x2e52b7,
      _edgesRev: _0x3ece0c
    } = getStateRaw();
    const _0x87d212 = _getOutEdgeMap(_0x2e52b7, _0x3ece0c);
    const _0x2bcfd1 = _0x227453(_0x19ad96.sourceNodeIds, _0x19ad96.srcId);
    const _0x3c7673 = new Set(_0x2bcfd1);
    const _0x2278fd = [];
    for (const [_0x2cd716, _0x4bc4ed] of Object.entries(_0x5b1d7e)) {
      if (_0x3c7673.has(_0x2cd716)) {
        _0x2278fd.push(_0x2cd716);
        continue;
      }
      let _0x17e66a = false;
      for (const _0x4ab661 of _0x2bcfd1) {
        if (!_0x848a78({
          sourceNodeId: _0x4ab661,
          targetNodeId: _0x2cd716,
          side: _0x19ad96.side,
          nodes: _0x5b1d7e,
          edges: _0x2e52b7,
          outMap: _0x87d212
        })) {
          continue;
        }
        _0x17e66a = true;
        break;
      }
      if (!_0x17e66a) {
        _0x2278fd.push(_0x2cd716);
      }
    }
    graphStore.setConnOverlay({
      srcId: _0x19ad96.srcId,
      invalidNodeIds: _0x2278fd,
      side: _0x19ad96.side
    });
  }
  function _0x23e0c1() {
    graphStore.clearConnOverlay();
  }
  function _0x4f09c6(_0x195659, _0x7b298a) {
    const _0x4c4638 = _0x7ca476.get(_0x195659);
    if (_0x4c4638 !== undefined) {
      window.clearTimeout(_0x4c4638);
      _0x7ca476.delete(_0x195659);
    }
    _0x7b298a.classList.remove("is-exiting");
  }
  function _0x4ae48a(_0x1d6616, _0x1bfa17) {
    if (_0x7ca476.has(_0x1d6616)) {
      return;
    }
    _0x1bfa17.classList.add("is-exiting");
    const _0x2334ef = window.setTimeout(() => {
      _0x7ca476.delete(_0x1d6616);
      if (_0x197b4e.get(_0x1d6616) !== _0x1bfa17 || !_0x1bfa17.classList.contains("is-exiting")) {
        return;
      }
      _0x1bfa17.remove();
      _0x197b4e.delete(_0x1d6616);
      _0x4a6b64.delete(_0x1d6616);
    }, SIDE_PLUS_EXIT_REMOVAL_DELAY_MS);
    _0x7ca476.set(_0x1d6616, _0x2334ef);
  }
  function _0x2ec567() {
    for (const _0x581b04 of _0x7ca476.values()) {
      window.clearTimeout(_0x581b04);
    }
    _0x7ca476.clear();
    for (const _0xd6dc42 of _0x197b4e.values()) {
      _0xd6dc42.remove();
    }
    _0x197b4e.clear();
    _0x4a6b64.clear();
    _0x31600a.classList.remove("is-selection-plus-visible");
  }
  function _0x5a122b(_0xb2d3af, _0x3e04b8, _0x19750d) {
    const _0x552de6 = _0x197b4e.get(_0xb2d3af);
    if (_0x552de6) {
      return _0x552de6;
    }
    const _0x2dc694 = document.createElement("button");
    _0x2dc694.type = "button";
    _0x2dc694.className = "side-plus-btn";
    _0x2dc694.textContent = "";
    _0x2dc694.dataset.plusKind = "node";
    _0x2dc694.setAttribute("aria-label", t("edgeController.addConnection"));
    _0x2dc694.addEventListener("pointerdown", _0x4327ee => {
      if (_0x4327ee.button === 1 || window._spaceHeld) {
        return;
      }
      if (_0x4327ee.button !== 0) {
        return;
      }
      window.v2ClearTrackedViewportFocus?.("side-plus-start");
      const _0x62317a = _0x4a6b64.get(_0xb2d3af);
      if (!_0x62317a) {
        return;
      }
      const _0x6b5380 = _0x227453(_0x62317a.sourceNodeIds, _0x62317a.nodeId);
      const _0x50f671 = getStateRaw();
      const _0x5e68b4 = _0x62317a.plusKind === "multi" ? screenToWorld(_0x62317a.ax, _0x62317a.ay, _0x50f671.viewport) : null;
      _0x4327ee.stopPropagation();
      _0x4327ee.preventDefault();
      _0x19ad96 = {
        dragging: true,
        srcId: _0x62317a.nodeId,
        sourceNodeIds: _0x6b5380,
        plusKind: _0x62317a.plusKind === "multi" ? "multi" : "node",
        side: _0x62317a.side,
        ax: _0x62317a.ax,
        ay: _0x62317a.ay,
        sx: _0x4327ee.clientX,
        sy: _0x4327ee.clientY,
        lastX: _0x4327ee.clientX,
        lastY: _0x4327ee.clientY,
        anchorWorldX: _0x5e68b4?.x ?? null,
        anchorWorldY: _0x5e68b4?.y ?? null,
        didAssistPan: false,
        assistPanViewport: null
      };
      _0x594221();
      _0x2ec567();
    });
    _0x31600a.appendChild(_0x2dc694);
    _0x197b4e.set(_0xb2d3af, _0x2dc694);
    _0x4a6b64.set(_0xb2d3af, {
      nodeId: _0x3e04b8,
      side: _0x19750d,
      sourceNodeIds: _0x3e04b8 ? [_0x3e04b8] : [],
      plusKind: "node",
      ax: 0,
      ay: 0
    });
    return _0x2dc694;
  }
  function _0x49bd6e(_0x4d363d, _0x5efb6d, _0x16cb92, _0x3944c5, _0x5e5de5, _0xa5f735, _0x408b4e, _0x2767f5, _0x4f8ee1, _0x18111c = {}) {
    const _0x1efd81 = Number(_0x18111c?.sizeMultiplier);
    const _0x2e2781 = Number.isFinite(_0x1efd81) && _0x1efd81 > 0 ? _0x1efd81 : 1;
    const _0x5d4d49 = _0xa5f735 * 20 * _0x2e2781;
    const _0x17b57c = _0x5d4d49 / 2;
    const _0x39915f = _0x4e1178 ? _0x5d4d49 / Math.max(_0xa5f735, Number.EPSILON) : _0x5d4d49;
    const _0x1d8ede = _0x39915f / 2;
    const _0x3f025d = String(_0x18111c?.key || _0x5efb6d + ":" + _0x16cb92);
    const _0x547ab2 = _0x18111c?.plusKind === "multi" ? "multi" : "node";
    const _0x39f867 = _0x227453(_0x18111c?.sourceNodeIds, _0x5efb6d);
    const _0x44397b = _0x5a122b(_0x3f025d, _0x5efb6d, _0x16cb92);
    _0x4f09c6(_0x3f025d, _0x44397b);
    _0x44397b.dataset.plusKind = _0x547ab2;
    _0x44397b.dataset.side = _0x16cb92;
    _0x44397b.classList.toggle("side-plus-btn--multi", _0x547ab2 === "multi");
    const _0xf71769 = _0x5efb6d ? document.getElementById(_0x5efb6d) : null;
    const _0xe29079 = _0xf71769?.style?.zIndex || (_0xf71769 && typeof getComputedStyle === "function" ? getComputedStyle(_0xf71769).zIndex : "");
    _0x44397b.style.zIndex = resolveSidePlusLayerZIndex(_0xe29079);
    _0x44397b.style.width = _0x39915f + "px";
    _0x44397b.style.height = _0x39915f + "px";
    _0x44397b.style.fontSize = _0x39915f + "px";
    _0x44397b.style.display = "flex";
    _0x44397b.style.alignItems = "center";
    _0x44397b.style.justifyContent = "center";
    let _0x542d53 = _0x3944c5;
    let _0x2b4aea = _0x5e5de5;
    let _0x87f8cc = false;
    if (_0x408b4e !== undefined && _0x2767f5 !== undefined) {
      const _0x429c77 = _0x408b4e - _0x3944c5;
      const _0x2af638 = _0x2767f5 - _0x5e5de5;
      const _0x55c2a8 = Math.hypot(_0x429c77, _0x2af638);
      const _0x52d37a = _0xa5f735 * 100;
      if (_0x55c2a8 < _0x52d37a && !_0x4f8ee1) {
        const _0x3ae846 = Math.min(_0x55c2a8, _0xa5f735 * 45);
        const _0x44c5e3 = Math.atan2(_0x2af638, _0x429c77);
        _0x542d53 += Math.cos(_0x44c5e3) * _0x3ae846;
        _0x2b4aea += Math.sin(_0x44c5e3) * _0x3ae846;
        _0x44397b.style.background = "var(--white-10)";
        _0x87f8cc = true;
      }
    }
    if (!_0x87f8cc) {
      _0x44397b.style.background = "";
    }
    const _0x47336e = resolveSidePlusButtonPosition({
      screenX: _0x542d53,
      screenY: _0x2b4aea,
      screenRadius: _0x17b57c,
      cssRadius: _0x1d8ede,
      viewport: _0x18111c?.viewport || getStateRaw().viewport,
      holderUsesWorldCoordinates: _0x4e1178
    });
    _0x44397b.style.left = _0x47336e.left + "px";
    _0x44397b.style.top = _0x47336e.top + "px";
    const _0x577c87 = _0x4a6b64.get(_0x3f025d);
    if (_0x577c87) {
      _0x577c87.nodeId = _0x5efb6d;
      _0x577c87.side = _0x16cb92;
      _0x577c87.sourceNodeIds = _0x39f867;
      _0x577c87.plusKind = _0x547ab2;
      _0x577c87.ax = _0x542d53;
      _0x577c87.ay = _0x2b4aea;
    }
    _0x4d363d.add(_0x3f025d);
  }
  function _0x42b0fe(_0xdbaff3, _0x4e3a11, _0x4eedce = {}) {
    const _0x5ec8db = _getDragContext();
    const _0x8e791a = _0x4eedce && typeof _0x4eedce === "object" ? _0x4eedce : {};
    const _0x18bec2 = _0x19ad96.dragging ? {
      policy: "allow",
      nodeId: ""
    } : _resolveSidePlusPointerContextAt(_0xdbaff3, _0x4e3a11, _0x8e791a.pointerTarget);
    const _0x5ceb45 = _0x18bec2.policy;
    const _0x1f0b97 = ["settingsModal", "aboutModal", "historyModal"];
    if (_0x1f0b97.some(_0x459f68 => {
      const _0x366516 = document.getElementById(_0x459f68);
      return _0x366516 && _0x366516.style.display === "flex";
    })) {
      _0x2ec567();
      return;
    }
    if (!_0x19ad96.dragging && _0x5ceb45 === "block") {
      _0x2ec567();
      return;
    }
    const _0x3b238e = getStateRaw();
    const {
      nodes: _0x25f4ce,
      selectedNodeIds: _0x3b8fef,
      _nodeCount: _0x559cfa,
      _nodesRev: _0x50085e,
      _nodeGeometryRev: _0x49fc5d,
      _persistRev: _0x3da604
    } = _0x3b238e;
    const _0x243253 = getViewportPanPreview() || _0x3b238e.viewport;
    if ((Number.isFinite(_0x559cfa) ? _0x559cfa : Object.keys(_0x25f4ce).length) === 0) {
      _0x2ec567();
      return;
    }
    const _0x290193 = _0x8e791a.nodeSizeOverrides && typeof _0x8e791a.nodeSizeOverrides === "object" ? _0x8e791a.nodeSizeOverrides : null;
    const _0x142a69 = createNodeGeometryOverlay(_0x25f4ce, _0x290193);
    const _0x2b273f = _0x142a69 !== _0x25f4ce;
    const _0xb68aff = _0x2b273f ? Object.keys(_0x142a69) : [];
    const _0x15b11a = _0x18bec2.nodeId && _0x142a69[_0x18bec2.nodeId] ? _0x18bec2.nodeId : null;
    const _0x446d3b = Array.isArray(_0x3b8fef) ? _0x3b8fef : [];
    const _0x5a5aad = new Set(_0x446d3b);
    const _0xed773f = readViewportInteractionState({
      interactionState: _0x5ec8db
    });
    const _0x342d57 = resolveSidePlusRenderState({
      isDraggingPlus: _0x19ad96.dragging,
      isNodeDragging: !!_0x5ec8db.isDragging,
      isBoxSelecting: !!_0x5ec8db.isBoxSelecting,
      isConnecting: !!_0x5ec8db.isConnecting,
      isPanning: _0xed773f.isPanning,
      isZooming: _0xed773f.isZooming,
      isViewportAnimating: _0xed773f.isViewportAnimating,
      isSpaceHeld: !!window._spaceHeld,
      selectedCount: _0x5a5aad.size,
      requestedSelectionOnly: _0x8e791a.selectionOnly === true || _0x5ceb45 === "selection-only"
    });
    _0x31600a.classList.toggle("is-selection-plus-visible", _0x342d57.selectionOnly && _0x5a5aad.size > 0);
    if (_0x342d57.shouldClear) {
      _0x2ec567();
      return;
    }
    const _0x4cd3d1 = _0x342d57.selectionOnly;
    let _0x2bb6ab = null;
    let _0x42104f = false;
    if (_0x4cd3d1) {
      _0x2bb6ab = null;
      _0x42104f = false;
    } else if (_0x5ec8db.isDragging && _0x5ec8db.targetNodeId) {
      _0x2bb6ab = _0x5ec8db.targetNodeId;
      _0x42104f = true;
    } else if (_0x15b11a) {
      _0x2bb6ab = _0x15b11a;
      _0x42104f = true;
    } else {
      const _0x1f480d = _getNodeSpatialIndex(_0x25f4ce, Number.isFinite(_0x49fc5d) ? _0x49fc5d : _0x3da604, _NODE_SPATIAL_INDEX_DEFAULT_KEY);
      const _0x1c5c92 = findClosestNodeWithGeometryOverrides({
        screenX: _0xdbaff3,
        screenY: _0x4e3a11,
        nodes: _0x25f4ce,
        geometryNodes: _0x142a69,
        overrideNodeIds: _0xb68aff,
        viewport: _0x243253,
        spatialIndex: _0x1f480d,
        ignoreGroup: true
      });
      if (_0x1c5c92) {
        _0x2bb6ab = _0x1c5c92.nodeId;
        _0x42104f = _0x1c5c92.isInside;
      }
    }
    const _0x2200ff = _0x243253.zoom || 1;
    const _0xa167de = 36;
    const _0x1281c0 = _0x2200ff * 70;
    let _0x2fb424 = Number.isFinite(_0xdbaff3) ? _0xdbaff3 : undefined;
    let _0x32efe4 = Number.isFinite(_0x4e3a11) ? _0x4e3a11 : undefined;
    if (_0x4cd3d1) {
      _0x2fb424 = undefined;
      _0x32efe4 = undefined;
    }
    const _0x180f8b = _0x5a5aad.size >= 2;
    const _0x49ab19 = _0x3f2c00.get(_0x25f4ce, Number.isFinite(_0x50085e) ? _0x50085e : _0x3da604);
    const _0x28c4b8 = !_0x180f8b && !_0x4cd3d1 ? getGroupSidePlusAnchorCandidateIds({
      nodes: _0x142a69,
      candidateIds: _0x49ab19,
      viewport: _0x243253,
      mx: _0xdbaff3,
      my: _0x4e3a11,
      threshold: _0x1281c0,
      gap: _0xa167de
    }) : [];
    const {
      candidateIds: _0x40c5c7,
      sideAnchorHoverIds: _0x3b47aa
    } = resolveSidePlusCandidateIds({
      selectedIds: _0x446d3b,
      isMultiSelection: _0x180f8b,
      selectionOnly: _0x4cd3d1,
      hoverNodeId: _0x2bb6ab,
      groupAnchorIds: _0x28c4b8
    });
    const _0x3027f2 = new Set();
    const _0x47abb0 = shouldShowRightSidePlusForNodeType;
    for (const _0xd1180 of _0x40c5c7) {
      const _0x25e197 = _0x142a69[_0xd1180];
      if (!_0x25e197) {
        continue;
      }
      if (shouldUseInlineMediaClipAddSlot(_0x25e197.type)) {
        continue;
      }
      const _0xbc9523 = _0x5ec8db.isDragging && (_0x5a5aad.has(_0xd1180) || _0x5ec8db.targetNodeId === _0xd1180);
      const _0x1e0617 = _0xbc9523 && Number.isFinite(_0x5ec8db.pendingDx) ? _0x5ec8db.pendingDx : 0;
      const _0x32b67c = _0xbc9523 && Number.isFinite(_0x5ec8db.pendingDy) ? _0x5ec8db.pendingDy : 0;
      const _0xf9b54f = _0x25e197.width || (isNodeType(_0x25e197, "group") ? 400 : 260);
      const _0x28383c = _0x25e197.height || (isNodeType(_0x25e197, "group") ? 300 : 80);
      const _0x5f04f4 = getNodeScreenRect({
        x: _0x25e197.x + _0x1e0617,
        y: _0x25e197.y + _0x32b67c,
        width: _0xf9b54f,
        height: _0x28383c
      }, _0x243253);
      const _0x4884ce = _0x5f04f4.top + _0x5f04f4.height / 2;
      const _0x2da6c7 = _0x5f04f4.left - _0xa167de * _0x2200ff;
      const _0x5a3f71 = _0x5f04f4.right + _0xa167de * _0x2200ff;
      const _0x54732d = Math.hypot(_0xdbaff3 - _0x2da6c7, _0x4e3a11 - _0x4884ce);
      const _0x2f2297 = Math.hypot(_0xdbaff3 - _0x5a3f71, _0x4e3a11 - _0x4884ce);
      const _0x2f7948 = _0xd1180 === _0x2bb6ab || _0x3b47aa.has(_0xd1180);
      const _0x3a71e1 = _0x5a5aad.has(_0xd1180);
      const _0x1a58bc = _0xd1180 === _0x2bb6ab ? _0x42104f : false;
      const _0x504dd4 = _0x1a58bc || _0x5ec8db.isDragging && _0xd1180 === _0x5ec8db.targetNodeId;
      const _0x11f2f3 = shouldShowSidePlusForNode({
        sideDistance: _0x54732d,
        threshold: _0x1281c0,
        isSelected: _0x3a71e1,
        isHovered: _0x2f7948,
        isInside: _0x1a58bc,
        nodeType: _0x25e197.type
      });
      const _0x54e9ee = shouldShowSidePlusForNode({
        sideDistance: _0x2f2297,
        threshold: _0x1281c0,
        isSelected: _0x3a71e1,
        isHovered: _0x2f7948,
        isInside: _0x1a58bc,
        nodeType: _0x25e197.type
      });
      const _0x342b84 = _0x330f78 => _0x330f78 === "ai-image" || _0x330f78 === "ai-text" || _0x330f78 === "ai-video" || _0x330f78 === "ai-audio" || _isPanorama360TargetType(_0x330f78) || _0x330f78 === "whiteboard";
      if (_0x342b84(_0x25e197.type) && _0x11f2f3) {
        _0x49bd6e(_0x3027f2, _0xd1180, "left", _0x2da6c7, _0x4884ce, _0x2200ff, _0x2fb424, _0x32efe4, _0x504dd4, {
          viewport: _0x243253
        });
      }
      if (_0x47abb0(_0x25e197.type) && _0x54e9ee) {
        _0x49bd6e(_0x3027f2, _0xd1180, "right", _0x5a3f71, _0x4884ce, _0x2200ff, _0x2fb424, _0x32efe4, _0x504dd4, {
          viewport: _0x243253
        });
      }
    }
    const _0x365c7a = _0x446d3b.filter(_0x43e96b => {
      const _0xc95058 = _0x142a69[_0x43e96b];
      return !!_0xc95058 && _0x47abb0(_0xc95058.type);
    });
    if (_0x446d3b.length >= 2 && _0x365c7a.length > 0) {
      const _0x5cc845 = _0x5ec8db.isDragging && _0x5a5aad.has(_0x5ec8db.targetNodeId);
      const _0x11260f = computeMultiSelectionBoundsForSidePlus(_0x446d3b, _0x142a69, _0x5cc845 ? {
        movedNodeIds: _0x446d3b,
        offsetX: Number.isFinite(_0x5ec8db.pendingDx) ? _0x5ec8db.pendingDx : 0,
        offsetY: Number.isFinite(_0x5ec8db.pendingDy) ? _0x5ec8db.pendingDy : 0
      } : undefined);
      if (_0x11260f) {
        const _0x480eff = 18;
        const _0x1bf92d = getNodeScreenRect({
          x: _0x11260f.minX - _0x480eff,
          y: _0x11260f.minY - _0x480eff,
          width: _0x11260f.maxX - _0x11260f.minX + _0x480eff * 2,
          height: _0x11260f.maxY - _0x11260f.minY + _0x480eff * 2
        }, _0x243253);
        const _0x46432b = _0x1bf92d.right + _0xa167de * _0x2200ff;
        const _0x46e851 = _0x1bf92d.top + _0x1bf92d.height / 2;
        const _0x2fd47d = Number.isFinite(_0xdbaff3) && Number.isFinite(_0x4e3a11) && _0xdbaff3 >= _0x1bf92d.left && _0xdbaff3 <= _0x1bf92d.right && _0x4e3a11 >= _0x1bf92d.top && _0x4e3a11 <= _0x1bf92d.bottom;
        _0x49bd6e(_0x3027f2, _0x365c7a[0], "right", _0x46432b, _0x46e851, _0x2200ff, _0x2fb424, _0x32efe4, _0x2fd47d, {
          key: "multi:right",
          plusKind: "multi",
          sourceNodeIds: _0x365c7a,
          sizeMultiplier: 1.5,
          viewport: _0x243253
        });
      }
    }
    for (const [_0xcd4c2a, _0x5b05f7] of _0x197b4e.entries()) {
      if (_0x3027f2.has(_0xcd4c2a)) {
        continue;
      }
      _0x4ae48a(_0xcd4c2a, _0x5b05f7);
    }
  }
  const _0x52b131 = rafSampleLatest(_0x42b0fe);
  window._v2UpdateSidePlus = _0x52b131;
  window._v2UpdateSidePlusNow = _0x42b0fe;
  function _0x57c369() {
    const _0x2db42e = _0xd82613.commit(SIDE_PLUS_ASSIST_PAN_PREVIEW_OWNER);
    _0x19ad96.assistPanViewport = null;
    if (!_0x2db42e) {
      return null;
    }
    window._v2FlushMinimapViewportPreview?.(_0x2db42e);
    const _0x5b9753 = () => {
      graphStore.updateViewport(_0x2db42e.x, _0x2db42e.y, _0x2db42e.zoom);
      graphStore.markViewportPersist?.();
    };
    if (typeof graphStore.batch === "function") {
      graphStore.batch(_0x5b9753);
    } else {
      _0x5b9753();
    }
    return _0x2db42e;
  }
  const _0x513db4 = rafSampleLatest((_0x46c4ef, _0x5e450f) => {
    _0x26f046({
      clientX: _0x46c4ef,
      clientY: _0x5e450f
    }, true);
  });
  function _0x4533c1() {
    const _0x28b4af = {
      ..._0x19ad96,
      sourceNodeIds: _0x227453(_0x19ad96.sourceNodeIds, _0x19ad96.srcId)
    };
    _0x19ad96.dragging = false;
    _0x19ad96.srcId = null;
    _0x19ad96.sourceNodeIds = [];
    _0x19ad96.plusKind = "node";
    _0x19ad96.anchorWorldX = null;
    _0x19ad96.anchorWorldY = null;
    _0x19ad96.didAssistPan = false;
    _0x19ad96.assistPanViewport = null;
    _0x23e0c1();
    return _0x28b4af;
  }
  function _0x355d3e() {
    if (!_0x19ad96.dragging) {
      return false;
    }
    _0x513db4.cancel?.();
    _0x57c369();
    _0x4533c1();
    _clearDraftEdgeDirectly();
    return true;
  }
  function _0x26f046(_0x2ed53b, _0x2d579f = false) {
    if (_0x19ad96.dragging && !_0x2d579f && _0x2ed53b?.buttons === 0) {
      _0x355d3e();
      return;
    }
    if (_0x19ad96.dragging && !_0x2d579f) {
      _0x513db4(_0x2ed53b.clientX, _0x2ed53b.clientY);
      return;
    }
    if (_0x19ad96.dragging) {
      let {
        viewport: _0x2377d8,
        nodes: _0x4f74b0,
        connOverlay: _0x39cf8e,
        _persistRev: _0x1f3c9b
      } = getStateRaw();
      _0x2377d8 = _0x19ad96.assistPanViewport || _0x2377d8;
      if (window._spaceHeld === true) {
        const _0x3ca883 = _0x2ed53b.clientX - _0x19ad96.lastX;
        const _0x414aa7 = _0x2ed53b.clientY - _0x19ad96.lastY;
        if (_0x3ca883 || _0x414aa7) {
          const _0x25ba06 = !!_0x19ad96.assistPanViewport;
          const _0x45f98b = _0x19ad96.assistPanViewport || _0xd82613.acquire(SIDE_PLUS_ASSIST_PAN_PREVIEW_OWNER, _0x2377d8);
          if (_0x45f98b) {
            _0x2377d8 = {
              x: (Number(_0x45f98b.x) || 0) + _0x3ca883,
              y: (Number(_0x45f98b.y) || 0) + _0x414aa7,
              zoom: Number(_0x45f98b.zoom) || 1
            };
            _0x19ad96.assistPanViewport = _0x2377d8;
            _0xd82613.update(SIDE_PLUS_ASSIST_PAN_PREVIEW_OWNER, _0x2377d8);
            _0x19ad96.didAssistPan = true;
            if (!_0x25ba06) {
              window._v2ScheduleMinimapViewportPreview?.(_0x45f98b, {
                force: true
              });
            }
            window._v2ScheduleMinimapViewportPreview?.(_0x2377d8);
          }
        }
      }
      _0x19ad96.lastX = _0x2ed53b.clientX;
      _0x19ad96.lastY = _0x2ed53b.clientY;
      const _0x3f6008 = new Set(_0x39cf8e?.invalidNodeIds || []);
      const _0x34bcab = _0x227453(_0x19ad96.sourceNodeIds, _0x19ad96.srcId);
      const _0x3fbedb = new Set(_0x34bcab);
      const _0x5597b4 = _0x4f74b0[_0x19ad96.srcId];
      let _0x44853d = 0;
      let _0x508021 = 0;
      if (_0x19ad96.plusKind === "multi") {
        if (Number.isFinite(_0x19ad96.anchorWorldX) && Number.isFinite(_0x19ad96.anchorWorldY)) {
          _0x44853d = _0x19ad96.anchorWorldX;
          _0x508021 = _0x19ad96.anchorWorldY;
        } else {
          const _0x2cf6e7 = screenToWorld(_0x19ad96.ax, _0x19ad96.ay, _0x2377d8);
          _0x44853d = _0x2cf6e7.x;
          _0x508021 = _0x2cf6e7.y;
        }
      } else if (_0x5597b4) {
        _0x44853d = _0x19ad96.side === "right" ? _0x5597b4.x + (_0x5597b4.width || 0) : _0x5597b4.x;
        _0x508021 = _0x5597b4.y + (_0x5597b4.height || 0) / 2;
      }
      const {
        x: _0x282665,
        y: _0x5f021e
      } = screenToWorld(_0x2ed53b.clientX, _0x2ed53b.clientY, _0x2377d8);
      _renderDraftEdgeDirectly(_0x44853d, _0x508021, _0x282665, _0x5f021e, _0x19ad96.side, _0x2377d8);
      const _0x1becbd = _getNodeSpatialIndex(_0x4f74b0, _0x1f3c9b, _NODE_SPATIAL_INDEX_EDGE_HOVER_KEY);
      const _0x14351e = queryNodeSpatialIndexAtWorldPoint(_0x1becbd, _0x282665, _0x5f021e);
      let _0x66e4c0 = null;
      for (const _0x26f60d of _0x14351e) {
        const _0x2d04bc = _0x4f74b0[_0x26f60d];
        if (!_0x2d04bc) {
          continue;
        }
        if (_0x3fbedb.has(_0x26f60d)) {
          continue;
        }
        if (_0x3f6008.has(_0x26f60d)) {
          continue;
        }
        const _0x401f14 = _resolveEdgeHoverNodeRect(_0x2d04bc);
        if (!_0x401f14) {
          continue;
        }
        if (isPointInRect(_0x282665, _0x5f021e, _0x401f14.x, _0x401f14.y, _0x401f14.width, _0x401f14.height)) {
          _0x66e4c0 = _0x26f60d;
          break;
        }
      }
      if ((_0x39cf8e?.hoverId || null) !== _0x66e4c0) {
        graphStore.setConnOverlay({
          hoverId: _0x66e4c0,
          side: _0x19ad96.side
        });
      }
    } else {
      _0x52b131(_0x2ed53b.clientX, _0x2ed53b.clientY, {
        pointerTarget: _0x2ed53b.target || null
      });
    }
  }
  window.addEventListener("pointermove", _0x26f046);
  function _0x368881(_0x313865) {
    if (!_0x19ad96.dragging) {
      return;
    }
    _0x513db4.cancel?.();
    _0x26f046({
      clientX: _0x313865.clientX,
      clientY: _0x313865.clientY
    }, true);
    _0x57c369();
    const {
      srcId: _0x1a196a,
      sourceNodeIds: _0x128d0c,
      plusKind: _0xc38a1e,
      side: _0x1f2d57,
      sx: _0x1e601c,
      sy: _0x48a36e,
      didAssistPan: _0x2cb8e7
    } = _0x4533c1();
    const _0x1f10d6 = new Set(_0x128d0c);
    const _0x23bfd2 = () => {
      _clearDraftEdgeDirectly();
      graphStore.clearConnOverlay();
    };
    if (!_0x2cb8e7 && Math.abs(_0x313865.clientX - _0x1e601c) < 5 && Math.abs(_0x313865.clientY - _0x48a36e) < 5) {
      return _0x23bfd2();
    }
    const {
      viewport: _0x38cf3c,
      nodes: _0x3c8c3a,
      edges: _0x328bbc,
      _persistRev: _0x2a0261,
      _edgesRev: _0x52c810
    } = getStateRaw();
    const _0x284f09 = _getNodeSpatialIndex(_0x3c8c3a, _0x2a0261, _NODE_SPATIAL_INDEX_DEFAULT_KEY);
    let _0x444093 = hitTestNode(_0x313865.clientX, _0x313865.clientY, _0x3c8c3a, _0x38cf3c, _0x1a196a, false, {
      spatialIndex: _0x284f09
    });
    if (_0x444093 && _0x1f10d6.has(_0x444093)) {
      _0x444093 = null;
    }
    if (_0x444093) {
      _0x23bfd2();
      if (_0xc38a1e === "multi") {
        if (_0x1f2d57 !== "right") {
          return;
        }
        let _0x2906c1 = false;
        for (const _0x18ad3d of _0x128d0c) {
          if (!_0x18ad3d || _0x18ad3d === _0x444093) {
            continue;
          }
          const _0x5a1a98 = getStateRaw();
          const _0x581e8a = _0x5a1a98.nodes?.[_0x18ad3d];
          const _0x2059b5 = _0x5a1a98.nodes?.[_0x444093];
          if (!_0x581e8a || !_0x2059b5) {
            continue;
          }
          if (!isValidConnection(_0x581e8a, _0x2059b5)) {
            continue;
          }
          const _0x113320 = addEdgeWithPolicies({
            sourceId: _0x18ad3d,
            targetId: _0x444093
          });
          if (!_0x113320) {
            continue;
          }
          _0x2906c1 = true;
          _0x5c07a0(_0x18ad3d, _0x444093, _0x581e8a, _0x2059b5, _0x1f2d57);
        }
        if (!_0x2906c1) {
          return;
        }
        return;
      }
      const _0x5a00f5 = _0x1f2d57 === "right" ? _0x1a196a : _0x444093;
      const _0x73b160 = _0x1f2d57 === "right" ? _0x444093 : _0x1a196a;
      const _0x56c086 = _0x3c8c3a[_0x5a00f5];
      const _0x38faa7 = _0x3c8c3a[_0x73b160];
      const _0x25ce84 = _getOutEdgeMap(_0x328bbc, _0x52c810);
      const _0x14c1bf = _getIncomingEdgesByTarget(_0x328bbc, _0x52c810, _0x73b160);
      const _0x2e63b1 = !!_0x25ce84.get(_0x5a00f5)?.has(_0x73b160);
      if (!isValidConnection(_0x56c086, _0x38faa7) || _0x2e63b1) {
        return;
      }
      const _0x4a4e8c = String(_0x56c086?.type || "").trim() === "group";
      if (_0x4a4e8c) {
        const _0x291083 = addEdgeWithPolicies({
          sourceId: _0x5a00f5,
          targetId: _0x73b160
        });
        if (!_0x291083) {
          return;
        }
        _0x5c07a0(_0x5a00f5, _0x73b160, _0x56c086, _0x38faa7, _0x1f2d57);
        return;
      }
      if (_isAnimeRealTarget(_0x38faa7)) {
        if (!_isAnimeRealImageSrc(_0x56c086)) {
          return;
        }
        for (const _0x11e1ea of _0x14c1bf) {
          graphStore.removeEdge(_0x11e1ea.id);
        }
        if (_0x38faa7.rhAnimeRealRefUrl) {
          graphStore.updateNodeData(_0x73b160, {
            rhAnimeRealRefUrl: "",
            rhAnimeRealRefLocalPath: "",
            rhAnimeRealRefFileName: ""
          });
        }
      }
      const _0x34c487 = _applyRhPersonReplaceV3FixedInputs({
        srcData: _0x56c086,
        tgtData: _0x38faa7,
        incomingEdges: _0x14c1bf,
        nodes: _0x3c8c3a,
        targetId: _0x73b160
      });
      if (!_0x34c487.ok) {
        return;
      }
      const _0x271244 = addEdgeWithPolicies({
        sourceId: _0x5a00f5,
        targetId: _0x73b160
      });
      if (!_0x271244) {
        return;
      }
      _0x5c07a0(_0x5a00f5, _0x73b160, _0x56c086, _0x38faa7, _0x1f2d57);
      return;
    }
    if (_0x1f2d57 === "left") {
      _showLeftQuoteMenu(_0x313865.clientX, _0x313865.clientY, _0x1a196a, _0x38cf3c, _0x23bfd2);
      return;
    }
    if (_0x1f2d57 !== "right") {
      _0x23bfd2();
      return;
    }
    if (_0xc38a1e === "multi") {
      const _0x3111cb = _0x128d0c.filter(_0xa6cfa4 => !!_0x3c8c3a[_0xa6cfa4]);
      if (_0x3111cb.length === 0) {
        _0x23bfd2();
        return;
      }
      _showQuoteMenu(_0x313865.clientX, _0x313865.clientY, _0x3111cb[0], _0x38cf3c, _0x23bfd2, {
        sourceIds: _0x3111cb
      });
      return;
    }
    const _0x5d0521 = _0x3c8c3a[_0x1a196a];
    if (!_0x5d0521) {
      _0x23bfd2();
      return;
    }
    _showQuoteMenu(_0x313865.clientX, _0x313865.clientY, _0x1a196a, _0x38cf3c, _0x23bfd2);
  }
  window.addEventListener("pointerup", _0x368881, {
    capture: true
  });
  window.addEventListener("pointercancel", _0x355d3e, {
    capture: true
  });
  window.addEventListener("blur", _0x355d3e);
}
const _RH_ANIME_REAL_MODEL = ANIME_REAL_MODEL_ID;
const _isAnimeRealTarget = _0x4bcb53 => !!_0x4bcb53 && _0x4bcb53.type === "ai-image" && String(_0x4bcb53.model || "") === _RH_ANIME_REAL_MODEL;
const _isAnimeRealImageSrc = _0x24d695 => {
  const _0x363ead = String(_0x24d695?.type || "");
  return _0x363ead === "source-image" || _0x363ead === "image" || _0x363ead === "ai-image";
};
const _isRhPersonReplaceV3Target = _0x138867 => !!_0x138867 && _0x138867.type === "ai-image" && isRhPersonReplaceWorkflowModel(_0x138867.model);
const _getRhV54RefKind = _0x6f07c0 => {
  return resolveEffectiveInputKind(_0x6f07c0) || "image";
};
const _getAiAudioWorkflowKey = _0xa2223e => {
  if (!_0xa2223e || String(_0xa2223e.type || "") !== "ai-audio") {
    return "";
  }
  const _0x48f311 = String(_0xa2223e.audioWorkflowKey || "").trim();
  if (_0x48f311) {
    return _0x48f311;
  }
  const _0x36bbc9 = String(_0xa2223e.model || "").trim();
  return _0x36bbc9;
};
const _getManifestFixedInputConfig = _0x251dcc => {
  const _0x3d8a33 = String(_0x251dcc?.type || "").trim();
  if (_0x3d8a33 === "ai-audio") {
    const _0x1b3616 = _getAiAudioWorkflowKey(_0x251dcc);
    return getFixedInputSlotConfigFromManifest({
      ..._0x251dcc,
      audioWorkflowKey: _0x1b3616,
      model: _0x1b3616
    });
  }
  return getFixedInputSlotConfigFromManifest(_0x251dcc);
};
const _edgeTimeKey = _0x41f909 => {
  const _0x132549 = Number(_0x41f909?.createdAt);
  if (Number.isFinite(_0x132549)) {
    return _0x132549;
  }
  const _0x59035c = String(_0x41f909?.id || "");
  const _0x26a0e2 = _0x59035c.match(/(\d{10,})/g);
  if (_0x26a0e2 && _0x26a0e2.length) {
    return Number(_0x26a0e2[_0x26a0e2.length - 1]) || 0;
  }
  return 0;
};
function _finishManifestFixedInputResult(_0x6951f, _0x4906fc, _0x121d9c) {
  const _0x5d0522 = String(_0x121d9c || "").trim();
  if (!_0x5d0522) {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x3517bd = getExclusiveSlotsForFixedSlot(_0x6951f?.exclusiveGroups, _0x5d0522);
  if (_0x3517bd.length > 1) {
    const _0x4a04e5 = new Set(_0x3517bd);
    for (const _0xe58e34 of Array.isArray(_0x4906fc) ? _0x4906fc : []) {
      const _0x212846 = String(_0xe58e34?.refSlot || "").trim();
      if (_0xe58e34?.id && _0x212846 !== _0x5d0522 && _0x4a04e5.has(_0x212846)) {
        graphStore.removeEdge(_0xe58e34.id);
      }
    }
  }
  return {
    ok: true,
    refSlot: _0x5d0522
  };
}
function _canUseManifestFixedInputOverflow({
  config: _0x5790de,
  srcKind: _0x208d57,
  tgtData: _0x374685,
  incomingEdges: _0x42aa40,
  nodes: _0xbdc8b1
}) {
  const _0x148fea = String(_0x208d57 || "").trim();
  if (!_0x148fea || _0x148fea === "text") {
    return false;
  }
  const _0x4509c0 = new Set(_0x5790de?.visibleSlots || []);
  const _0x1f9aff = (_0x5790de?.slotOrderByType?.[_0x148fea] || []).filter(_0x5bc5be => _0x4509c0.has(_0x5bc5be)).length;
  const _0x31e51f = getTargetInputPolicy(_0x374685);
  const _0x15200b = Number(_0x31e51f?.maxByKind?.[_0x148fea]);
  if (!Number.isFinite(_0x15200b) || _0x15200b <= _0x1f9aff) {
    return false;
  }
  const _0x59e3fc = (Array.isArray(_0x42aa40) ? _0x42aa40 : []).filter(_0x1fb1a7 => _getRhV54RefKind(_0xbdc8b1?.[_0x1fb1a7?.sourceId]) === _0x148fea).length;
  return _0x59e3fc < _0x15200b;
}
function _allowsManifestFixedInputOverflow({
  config: _0x5bb297,
  srcKind: _0x5a5eb9,
  tgtData: _0x2295f9
}) {
  const _0x147779 = String(_0x5a5eb9 || "").trim();
  if (!_0x147779 || _0x147779 === "text") {
    return false;
  }
  const _0x8659c1 = new Set(_0x5bb297?.visibleSlots || []);
  const _0x319519 = (_0x5bb297?.slotOrderByType?.[_0x147779] || []).filter(_0xcc8c20 => _0x8659c1.has(_0xcc8c20)).length;
  const _0x515ee1 = getTargetInputPolicy(_0x2295f9);
  const _0x763115 = Number(_0x515ee1?.maxByKind?.[_0x147779]);
  return Number.isFinite(_0x763115) && _0x763115 > _0x319519;
}
function _cycleManifestFixedInputWhenFull({
  config: _0x4686d5,
  srcKind: _0x46c23c,
  tgtData: _0x413128,
  incomingEdges: _0x3290c6,
  nodes: _0x1b92fc,
  slotOrder: _0x8519e,
  resolvedSlotByEdgeId = null
}) {
  const _0x2c0551 = String(_0x46c23c || "").trim();
  if (!_0x2c0551 || _0x2c0551 === "text") {
    return null;
  }
  if (_0x4686d5?.manifest?.inputSlots?.cycleFixedInputWhenFull !== true) {
    return null;
  }
  const _0x39c643 = getTargetInputPolicy(_0x413128);
  const _0x567651 = Number(_0x39c643?.maxByKind?.[_0x2c0551]);
  if (!Number.isFinite(_0x567651) || _0x567651 <= 0) {
    return null;
  }
  const _0xb671d6 = new Set(_0x4686d5?.visibleSlots || []);
  const _0x440991 = (_0x4686d5?.slotOrderByType?.[_0x2c0551] || []).filter(_0xde442c => _0xb671d6.has(_0xde442c)).length;
  const _0x4931d4 = (Array.isArray(_0x3290c6) ? _0x3290c6 : []).filter(_0x20f0a8 => _getRhV54RefKind(_0x1b92fc?.[_0x20f0a8?.sourceId]) === _0x2c0551).sort((_0x19d038, _0x1801c4) => _edgeTimeKey(_0x19d038) - _edgeTimeKey(_0x1801c4));
  if (_0x4931d4.length < _0x567651) {
    return null;
  }
  const _0x461ce1 = _0x4931d4[0];
  if (!_0x461ce1?.id) {
    return null;
  }
  const _0x47b780 = String(resolvedSlotByEdgeId?.get(_0x461ce1.id) || _0x461ce1.refSlot || "");
  graphStore.removeEdge(_0x461ce1.id);
  const _0x5c16ff = _0x567651 <= _0x440991 && Array.isArray(_0x8519e) && _0x8519e.includes(_0x47b780) ? _0x47b780 : "";
  return {
    ok: true,
    refSlot: _0x5c16ff
  };
}
function _applyRhPersonReplaceV3FixedInputs({
  srcData: _0x17059d,
  tgtData: _0x2e2408,
  incomingEdges: _0x5611a6,
  nodes: _0x2d2188,
  targetId: _0x5a1f85
}) {
  if (!_isRhPersonReplaceV3Target(_0x2e2408)) {
    return {
      ok: true,
      refSlot: ""
    };
  }
  if (!_isAnimeRealImageSrc(_0x17059d)) {
    return {
      ok: false,
      refSlot: ""
    };
  }
  const _0x588a5b = ["replaceTarget", "replacedImage"];
  const _0x3a76f7 = Array.isArray(_0x5611a6) ? _0x5611a6 : [];
  const _0x2eb7d1 = _0x3a76f7.filter(_0x28c00b => {
    const _0x327daa = _0x2d2188?.[_0x28c00b.sourceId];
    return _isAnimeRealImageSrc(_0x327daa);
  });
  const _0x3b233f = new Set(_0x2eb7d1.map(_0x374751 => String(_0x374751.refSlot || "")).filter(_0x5b0075 => _0x588a5b.includes(_0x5b0075)));
  const _0x4608bf = _0x588a5b.find(_0x2e7abe => !_0x3b233f.has(_0x2e7abe)) || "";
  if (_0x4608bf) {
    return {
      ok: true,
      refSlot: _0x4608bf
    };
  }
  let _0x375b02 = null;
  for (const _0x101523 of _0x2eb7d1) {
    if (_0x588a5b.includes(String(_0x101523.refSlot || ""))) {
      if (!_0x375b02 || _edgeTimeKey(_0x101523) < _edgeTimeKey(_0x375b02)) {
        _0x375b02 = _0x101523;
      }
    }
  }
  if (!_0x375b02) {
    for (const _0x222b4e of _0x2eb7d1) {
      if (!_0x375b02 || _edgeTimeKey(_0x222b4e) < _edgeTimeKey(_0x375b02)) {
        _0x375b02 = _0x222b4e;
      }
    }
  }
  if (_0x375b02) {
    graphStore.removeEdge(_0x375b02.id);
  }
  const _0x296ae8 = _0x375b02 && _0x588a5b.includes(String(_0x375b02.refSlot || "")) ? String(_0x375b02.refSlot) : _0x588a5b[0];
  return {
    ok: true,
    refSlot: _0x296ae8
  };
}
function _applyManifestFixedInputs({
  srcData: _0x308185,
  tgtData: _0x76dcff,
  incomingEdges: _0x394f72,
  nodes: _0x5dc8e6,
  targetId: _0x508496,
  preferredRefSlot: _0x3c9e92
}) {
  const _0x52bc54 = String(_0x76dcff?.type || "").trim();
  if (_0x52bc54 !== "ai-video" && _0x52bc54 !== "ai-audio" && _0x52bc54 !== "ai-image") {
    return {
      ok: true,
      refSlot: ""
    };
  }
  if (_0x52bc54 === "ai-image" && _isRhPersonReplaceV3Target(_0x76dcff)) {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x1124b1 = _getManifestFixedInputConfig(_0x76dcff);
  if (!_0x1124b1) {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x34471f = _getRhV54RefKind(_0x308185);
  if (_0x34471f === "text") {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x4d7885 = new Set(_0x1124b1.visibleSlots || []);
  const _0x208581 = _0x1124b1.slotOrderByType?.[_0x34471f] || [];
  const _0x28399f = _0x208581.filter(_0x31ec05 => _0x4d7885.has(_0x31ec05) && fixedInputSlotAcceptsSource(_0x1124b1, _0x31ec05, _0x308185));
  const _0x59ddd4 = _0x208581.filter(_0x2e5752 => !_0x4d7885.has(_0x2e5752) && fixedInputSlotAcceptsSource(_0x1124b1, _0x2e5752, _0x308185));
  const _0x494748 = _0x28399f.length > 0 ? _0x28399f : _0x59ddd4;
  if (_0x494748.length === 0) {
    if (_canUseManifestFixedInputOverflow({
      config: _0x1124b1,
      srcKind: _0x34471f,
      tgtData: _0x76dcff,
      incomingEdges: _0x394f72,
      nodes: _0x5dc8e6
    })) {
      return {
        ok: true,
        refSlot: ""
      };
    }
    return {
      ok: false,
      refSlot: ""
    };
  }
  const _0x289c6d = _0x494748.includes(String(_0x3c9e92 || "")) ? String(_0x3c9e92 || "") : "";
  const _0x18de99 = Array.isArray(_0x394f72) ? _0x394f72 : [];
  const _0x2ad6ec = _0x18de99.filter(_0x25e571 => {
    const _0x45c792 = _0x5dc8e6?.[_0x25e571.sourceId];
    return _getRhV54RefKind(_0x45c792) === _0x34471f;
  });
  const _0x56378a = _allowsManifestFixedInputOverflow({
    config: _0x1124b1,
    srcKind: _0x34471f,
    tgtData: _0x76dcff
  });
  const _0x16036c = new Map();
  const _0x3b989a = new Set();
  const _0x117af3 = [];
  for (const _0x4df66b of _0x2ad6ec) {
    const _0xc769d8 = resolveFixedInputSlotForRef({
      fixedInputConfig: _0x1124b1,
      refSlot: _0x4df66b?.refSlot,
      kind: _0x34471f,
      occupiedSlots: _0x3b989a,
      sourceNode: _0x5dc8e6?.[_0x4df66b.sourceId]
    });
    const _0x4c8f86 = String(_0xc769d8.slot || "");
    if (_0x4c8f86 && _0x494748.includes(_0x4c8f86)) {
      _0x16036c.set(_0x4df66b.id, _0x4c8f86);
      _0x3b989a.add(_0x4c8f86);
      _0x117af3.push(_0x4df66b);
      continue;
    }
    if (_0x56378a && (_0xc769d8.reason === "occupied" || _0xc769d8.reason === "overflow" || !String(_0x4df66b?.refSlot || "").trim())) {
      continue;
    }
    graphStore.removeEdge(_0x4df66b.id);
  }
  const _0x4caf9f = _0x41824c => String(_0x16036c.get(_0x41824c?.id) || _0x41824c?.refSlot || "");
  const _0x1abd58 = new Set(_0x117af3.map(_0x56ebe1 => _0x4caf9f(_0x56ebe1)).filter(_0x25fa33 => _0x494748.includes(_0x25fa33)));
  const _0xb574e6 = _0x494748.find(_0xe8105a => !_0x1abd58.has(_0xe8105a)) || "";
  if (_0x289c6d && !_0x1abd58.has(_0x289c6d)) {
    return _finishManifestFixedInputResult(_0x1124b1, _0x18de99, _0x289c6d);
  }
  if (_0xb574e6) {
    return _finishManifestFixedInputResult(_0x1124b1, _0x18de99, _0xb574e6);
  }
  if (_canUseManifestFixedInputOverflow({
    config: _0x1124b1,
    srcKind: _0x34471f,
    tgtData: _0x76dcff,
    incomingEdges: _0x18de99,
    nodes: _0x5dc8e6
  })) {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x2509c7 = _cycleManifestFixedInputWhenFull({
    config: _0x1124b1,
    srcKind: _0x34471f,
    tgtData: _0x76dcff,
    incomingEdges: _0x18de99,
    nodes: _0x5dc8e6,
    slotOrder: _0x494748,
    resolvedSlotByEdgeId: _0x16036c
  });
  if (_0x2509c7) {
    return _finishManifestFixedInputResult(_0x1124b1, _0x18de99, _0x2509c7.refSlot);
  }
  if (_0x494748.length === 1) {
    _0x117af3.forEach(_0x492d96 => graphStore.removeEdge(_0x492d96.id));
    return _finishManifestFixedInputResult(_0x1124b1, _0x18de99, _0x494748[0]);
  }
  if (_0x289c6d) {
    const _0x42360b = _0x117af3.find(_0x8ea52f => _0x4caf9f(_0x8ea52f) === _0x289c6d);
    if (_0x42360b) {
      graphStore.removeEdge(_0x42360b.id);
    }
    return _finishManifestFixedInputResult(_0x1124b1, _0x18de99, _0x289c6d);
  }
  const _0x9ac7e = _0x117af3.reduce((_0x4a6d03, _0x2d19b4) => !_edgeTimeKey(_0x4a6d03) || _edgeTimeKey(_0x2d19b4) > _edgeTimeKey(_0x4a6d03) ? _0x2d19b4 : _0x4a6d03, null);
  const _0x22e30c = _0x4caf9f(_0x9ac7e);
  const _0x399a3e = _0x494748.indexOf(_0x22e30c);
  const _0x185382 = _0x399a3e >= 0 ? _0x494748[(_0x399a3e + 1) % _0x494748.length] : _0x494748[0];
  let _0x1b0a52 = null;
  for (const _0x1f9ea4 of _0x117af3) {
    if (_0x4caf9f(_0x1f9ea4) !== _0x185382) {
      continue;
    }
    if (!_0x1b0a52 || _edgeTimeKey(_0x1f9ea4) < _edgeTimeKey(_0x1b0a52)) {
      _0x1b0a52 = _0x1f9ea4;
    }
  }
  if (!_0x1b0a52) {
    for (const _0x2b6b2f of _0x117af3) {
      if (!_0x1b0a52 || _edgeTimeKey(_0x2b6b2f) < _edgeTimeKey(_0x1b0a52)) {
        _0x1b0a52 = _0x2b6b2f;
      }
    }
  }
  if (_0x1b0a52) {
    graphStore.removeEdge(_0x1b0a52.id);
  }
  const _0x346dba = _0x1b0a52 && _0x494748.includes(_0x4caf9f(_0x1b0a52)) ? _0x4caf9f(_0x1b0a52) : _0x185382;
  return _finishManifestFixedInputResult(_0x1124b1, _0x18de99, _0x346dba);
}
function _isDreaminaVideoTarget(_0xa0fba7) {
  return !!_0xa0fba7 && String(_0xa0fba7.type || "") === "ai-video" && isDreaminaStyleVideoModel(_0xa0fba7.model, _0xa0fba7.provider);
}
function _applyDreaminaVideoFixedInputs({
  srcData: _0x1732c8,
  tgtData: _0x45d822,
  incomingEdges: _0x519df0,
  nodes: _0x46c59b,
  targetId: _0x2d374d
}) {
  if (!_isDreaminaVideoTarget(_0x45d822)) {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x3dff04 = normalizeDreaminaVideoRouteMode(_0x45d822?.dreaminaRouteMode, _0x45d822?.mode);
  const _0xbaa111 = _getRhV54RefKind(_0x1732c8);
  const _0x1abb40 = Array.isArray(_0x519df0) ? _0x519df0 : [];
  if (_0x3dff04 === "frames2video") {
    if (_0xbaa111 !== "image") {
      return {
        ok: false,
        refSlot: ""
      };
    }
    for (const _0x57fdfa of _0x1abb40) {
      const _0x3a15f1 = _0x46c59b?.[_0x57fdfa.sourceId];
      if (_getRhV54RefKind(_0x3a15f1) !== "image") {
        graphStore.removeEdge(_0x57fdfa.id);
      }
    }
    const _0x26cf52 = _0x1abb40.filter(_0x474ab6 => _getRhV54RefKind(_0x46c59b?.[_0x474ab6.sourceId]) === "image").sort((_0x4c978b, _0x8ca8a7) => _edgeTimeKey(_0x4c978b) - _edgeTimeKey(_0x8ca8a7));
    while (_0x26cf52.length >= 2) {
      const _0xa44c28 = _0x26cf52.shift();
      if (_0xa44c28?.id) {
        graphStore.removeEdge(_0xa44c28.id);
      }
    }
    return {
      ok: true,
      refSlot: ""
    };
  }
  if (_0x3dff04 === "multiframe2video") {
    if (_0xbaa111 !== "image") {
      return {
        ok: false,
        refSlot: ""
      };
    }
    const _0x338225 = _0x1abb40.filter(_0x104907 => _getRhV54RefKind(_0x46c59b?.[_0x104907.sourceId]) === "image").sort((_0x1dc5cd, _0x49cc86) => _edgeTimeKey(_0x1dc5cd) - _edgeTimeKey(_0x49cc86));
    while (_0x338225.length >= 20) {
      const _0x56f5d2 = _0x338225.shift();
      if (_0x56f5d2?.id) {
        graphStore.removeEdge(_0x56f5d2.id);
      }
    }
    return {
      ok: true,
      refSlot: ""
    };
  }
  if (!["image", "video", "audio", "text"].includes(_0xbaa111)) {
    return {
      ok: false,
      refSlot: ""
    };
  }
  if (_0xbaa111 === "text") {
    return {
      ok: true,
      refSlot: ""
    };
  }
  const _0x2ab15d = getTargetInputPolicy(_0x45d822);
  const _0x3897c6 = Number(_0x2ab15d?.maxByKind?.[_0xbaa111]);
  if (!Number.isFinite(_0x3897c6) || _0x3897c6 <= 0) {
    return {
      ok: false,
      refSlot: ""
    };
  }
  const _0x3b0f25 = _0x1abb40.filter(_0xbbfc19 => _getRhV54RefKind(_0x46c59b?.[_0xbbfc19.sourceId]) === _0xbaa111).sort((_0x5d6b10, _0x266a5f) => _edgeTimeKey(_0x5d6b10) - _edgeTimeKey(_0x266a5f));
  while (_0x3b0f25.length >= _0x3897c6) {
    const _0x1db34b = _0x3b0f25.shift();
    if (_0x1db34b?.id) {
      graphStore.removeEdge(_0x1db34b.id);
    }
  }
  return {
    ok: true,
    refSlot: ""
  };
}
function _applyGenericInputKindLimit({
  srcData: _0x22efc1,
  tgtData: _0x2dc9ed,
  incomingEdges: _0x46486a,
  nodes: _0x2541fb,
  sourceId: _0x518d27
}) {
  if (!_isModelPolicyTargetType(_0x2dc9ed?.type)) {
    return {
      ok: true
    };
  }
  if (_getManifestFixedInputConfig(_0x2dc9ed)) {
    return {
      ok: true
    };
  }
  if (_isDreaminaVideoTarget(_0x2dc9ed)) {
    return {
      ok: true
    };
  }
  const _0x4220c4 = resolveEffectiveInputKind(_0x22efc1);
  if (!_0x4220c4 || _0x4220c4 === "text") {
    return {
      ok: true
    };
  }
  const _0x1a31f8 = getTargetInputPolicy(_0x2dc9ed);
  if (!isInputKindAllowed(_0x1a31f8, _0x4220c4)) {
    return {
      ok: false
    };
  }
  const _0x3c329a = Number(_0x1a31f8?.maxByKind?.[_0x4220c4]);
  if (!Number.isFinite(_0x3c329a)) {
    return {
      ok: true
    };
  }
  if (_0x3c329a <= 0) {
    return {
      ok: false
    };
  }
  const _0x5295df = (Array.isArray(_0x46486a) ? _0x46486a : []).some(_0x5cb819 => _0x5cb819?.sourceId === _0x518d27);
  if (_0x5295df) {
    return {
      ok: true
    };
  }
  const _0x13c287 = (Array.isArray(_0x46486a) ? _0x46486a : []).filter(_0x2fd740 => _getRhV54RefKind(_0x2541fb?.[_0x2fd740?.sourceId]) === _0x4220c4).sort((_0x5261fc, _0x333945) => _edgeTimeKey(_0x5261fc) - _edgeTimeKey(_0x333945));
  while (_0x13c287.length >= _0x3c329a) {
    const _0x12ddc5 = _0x13c287.shift();
    if (_0x12ddc5?.id) {
      graphStore.removeEdge(_0x12ddc5.id);
    }
  }
  return {
    ok: true
  };
}
function _applyMediaClipInputLimit({
  srcData: _0x3ce11d,
  tgtData: _0x3ad5df
}) {
  if (!isMediaClipNodeType(_0x3ad5df?.type)) {
    return {
      ok: true
    };
  }
  const _0x5dd745 = getMediaClipInputKind(_0x3ce11d);
  if (_0x5dd745 !== "video" && _0x5dd745 !== "image" && _0x5dd745 !== "audio") {
    return {
      ok: false
    };
  }
  if (!isSupportedMediaClipInput(_0x3ce11d)) {
    return {
      ok: false
    };
  }
  return {
    ok: true
  };
}
function _replacePanorama360IncomingEdges({
  tgtData: _0x5abda8,
  incomingEdges: _0x304217
}) {
  if (!_isPanorama360TargetType(_0x5abda8?.type)) {
    return;
  }
  const _0x347c2c = Array.isArray(_0x304217) ? _0x304217 : [];
  for (const _0x21217f of _0x347c2c) {
    if (_0x21217f?.id) {
      graphStore.removeEdge(_0x21217f.id);
    }
  }
}
function _replaceWhiteboardIncomingEdges({
  tgtData: _0x304bcd,
  incomingEdges: _0x4ea806
}) {
  if (String(_0x304bcd?.type || "").trim() !== "whiteboard") {
    return;
  }
  const _0x1537ba = Array.isArray(_0x4ea806) ? _0x4ea806 : [];
  for (const _0x3798ce of _0x1537ba) {
    if (_0x3798ce?.id) {
      graphStore.removeEdge(_0x3798ce.id);
    }
  }
}
export function addEdgeWithPolicies({
  sourceId: _0x2933a,
  targetId: _0x4b8862,
  preferredRefSlot: _0x59f26d
}) {
  const _0x10e21b = getStateRaw();
  const _0x559658 = _0x10e21b.nodes || {};
  const _0x12c3e9 = _0x559658[_0x2933a];
  const _0x214d90 = _0x559658[_0x4b8862];
  if (!_0x12c3e9 || !_0x214d90) {
    return false;
  }
  if (!isValidConnection(_0x12c3e9, _0x214d90)) {
    return false;
  }
  const _0x5e4bb7 = String(_0x12c3e9.type || "").trim() === "group";
  if (_0x5e4bb7) {
    if (String(_0x214d90.type || "").trim() === "group" && wouldCreateGroupOutputCycle({
      sourceId: _0x2933a,
      targetId: _0x4b8862,
      nodes: _0x559658,
      edges: _0x10e21b.edges || {}
    })) {
      return false;
    }
    const _0x357886 = getStateRaw();
    const _0x3b32b9 = !!_getOutEdgeMap(_0x357886.edges, _0x357886._edgesRev).get(_0x2933a)?.has(_0x4b8862);
    if (_0x3b32b9) {
      return false;
    }
    graphStore.addEdge({
      id: "edge-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      sourceId: _0x2933a,
      targetId: _0x4b8862,
      isGroupOutputLink: true,
      createdAt: Date.now()
    });
    return true;
  }
  const _0x7658e0 = _getIncomingEdgesByTarget(_0x10e21b.edges, _0x10e21b._edgesRev, _0x4b8862);
  _replacePanorama360IncomingEdges({
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0
  });
  _replaceWhiteboardIncomingEdges({
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0
  });
  if (_isAnimeRealTarget(_0x214d90)) {
    if (!_isAnimeRealImageSrc(_0x12c3e9)) {
      return false;
    }
    for (const _0x5350f7 of _0x7658e0) {
      graphStore.removeEdge(_0x5350f7.id);
    }
    if (_0x214d90.rhAnimeRealRefUrl) {
      graphStore.updateNodeData(_0x4b8862, {
        rhAnimeRealRefUrl: "",
        rhAnimeRealRefLocalPath: "",
        rhAnimeRealRefFileName: ""
      });
    }
  }
  const _0x3d1b15 = _applyRhPersonReplaceV3FixedInputs({
    srcData: _0x12c3e9,
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0,
    nodes: _0x559658,
    targetId: _0x4b8862
  });
  if (!_0x3d1b15.ok) {
    return false;
  }
  const _0x33845a = _applyManifestFixedInputs({
    srcData: _0x12c3e9,
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0,
    nodes: _0x559658,
    targetId: _0x4b8862,
    preferredRefSlot: _0x59f26d
  });
  if (!_0x33845a.ok) {
    return false;
  }
  const _0x3bf1a0 = _applyDreaminaVideoFixedInputs({
    srcData: _0x12c3e9,
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0,
    nodes: _0x559658,
    targetId: _0x4b8862
  });
  if (!_0x3bf1a0.ok) {
    return false;
  }
  const _0x415a58 = _applyMediaClipInputLimit({
    srcData: _0x12c3e9,
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0,
    nodes: _0x559658,
    sourceId: _0x2933a
  });
  if (!_0x415a58.ok) {
    return false;
  }
  const _0xeb832c = _applyGenericInputKindLimit({
    srcData: _0x12c3e9,
    tgtData: _0x214d90,
    incomingEdges: _0x7658e0,
    nodes: _0x559658,
    sourceId: _0x2933a
  });
  if (!_0xeb832c.ok) {
    return false;
  }
  const _0x4fdf91 = getStateRaw();
  const _0x1228b1 = !!_getOutEdgeMap(_0x4fdf91.edges, _0x4fdf91._edgesRev).get(_0x2933a)?.has(_0x4b8862);
  if (_0x1228b1) {
    return false;
  }
  let _0x2e8dc5 = "";
  let _0x45c693 = 0;
  let _0x13127f = 0;
  if (String(_0x12c3e9.type || "").includes("video")) {
    const _0x1d30aa = Array.isArray(_0x12c3e9.videos) ? _0x12c3e9.videos : [];
    const _0x2fe031 = Number(_0x12c3e9.mainVideoIndex);
    const _0x49bbf7 = Number.isFinite(_0x2fe031) ? Math.max(0, Math.trunc(_0x2fe031)) : 0;
    const _0x489d3d = _0x1d30aa[_0x49bbf7] || null;
    const _0x546b4c = _0x1d30aa.find(_0x5d21dd => _videoSourceKey(_0x5d21dd) && !_isUnavailableVideoRecord(_0x5d21dd));
    const _0x1fe56f = _0x489d3d && !_isUnavailableVideoRecord(_0x489d3d) ? _0x489d3d : _0x546b4c;
    const _0x18d424 = String(_0x1fe56f?.localPath || "").trim() || String(_0x1fe56f?.displayLocalPath || "").trim() || String(_0x1fe56f?.originalLocalPath || "").trim() || String(_0x1fe56f?.videoLocalPath || "").trim() || String(_0x1fe56f?.videoUrl || "").trim() || (!_isUnavailableVideoRecord(_0x12c3e9) ? String(_0x12c3e9.localPath || "").trim() || String(_0x12c3e9.displayLocalPath || "").trim() || String(_0x12c3e9.originalLocalPath || "").trim() || String(_0x12c3e9.videoLocalPath || "").trim() || String(_0x12c3e9.videoUrl || "").trim() || String(_0x12c3e9.src || "").trim() || String(_0x12c3e9.url || "").trim() || String(_0x12c3e9.resultUrl || "").trim() || String(_0x12c3e9.sourceUrl || "").trim() : "");
    if (_0x18d424) {
      _0x2e8dc5 = _0x18d424;
    }
    const _0x55c352 = Number(_0x489d3d?.videoWidth || 0);
    const _0x5b5dc3 = Number(_0x489d3d?.videoHeight || 0);
    const _0x3eb5d3 = Number(_0x12c3e9.selectedVideoWidth || 0);
    const _0x122e10 = Number(_0x12c3e9.selectedVideoHeight || 0);
    const _0x34bd3d = Number(_0x12c3e9.videoWidth || 0);
    const _0x3516fb = Number(_0x12c3e9.videoHeight || 0);
    if (_0x55c352 > 0 && _0x5b5dc3 > 0) {
      _0x45c693 = _0x55c352;
      _0x13127f = _0x5b5dc3;
    } else if (_0x3eb5d3 > 0 && _0x122e10 > 0) {
      _0x45c693 = _0x3eb5d3;
      _0x13127f = _0x122e10;
    } else if (_0x34bd3d > 0 && _0x3516fb > 0) {
      _0x45c693 = _0x34bd3d;
      _0x13127f = _0x3516fb;
    }
    if (!(_0x45c693 > 0) || !(_0x13127f > 0) || !_0x2e8dc5) {
      try {
        const _0x5101ea = getDisplayedVideoMetaFromNode(_0x2933a);
        const _0x57906a = String(_0x5101ea?.src || "").trim();
        const _0x3e45f6 = Number(_0x5101ea?.w || 0);
        const _0x361a90 = Number(_0x5101ea?.h || 0);
        if (_0x3e45f6 > 0 && _0x361a90 > 0) {
          _0x45c693 = _0x3e45f6;
          _0x13127f = _0x361a90;
        }
        if (_0x57906a) {
          try {
            const _0x3f3bf7 = new URL(_0x57906a, window.location.origin);
            const _0x219816 = String(_0x3f3bf7.pathname || "");
            if (_0x219816.startsWith("/output/")) {
              _0x2e8dc5 = _0x219816.replace(/^\/+/, "");
            } else if (_0x219816.startsWith("/data/")) {
              _0x2e8dc5 = _0x219816.replace(/^\/+/, "");
            } else if (_0x219816.startsWith("/")) {
              _0x2e8dc5 = _0x219816.replace(/^\/+/, "");
            }
          } catch {
            if (_0x57906a.startsWith("/")) {
              _0x2e8dc5 = _0x57906a.replace(/^\/+/, "");
            }
          }
        }
      } catch {}
    }
  }
  const _0x4e5835 = _0x3d1b15.refSlot || _0x33845a.refSlot || _0x3bf1a0.refSlot || "";
  removeCoveredAssetInputRefForConnection({
    targetId: _0x4b8862,
    targetNode: _0x4fdf91.nodes?.[_0x4b8862] || _0x214d90,
    sourceNode: _0x12c3e9,
    sourceKind: resolveEffectiveInputKind(_0x12c3e9),
    refSlot: _0x4e5835,
    incomingEdges: _getIncomingEdgesByTarget(_0x4fdf91.edges, _0x4fdf91._edgesRev, _0x4b8862),
    nodes: _0x4fdf91.nodes || _0x559658
  });
  graphStore.addEdge({
    id: "edge-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    sourceId: _0x2933a,
    targetId: _0x4b8862,
    ...(_0x4e5835 ? {
      refSlot: _0x4e5835
    } : null),
    ...(_0x2e8dc5 ? {
      sourceMediaKey: _0x2e8dc5
    } : null),
    ...(_0x45c693 > 0 && _0x13127f > 0 ? {
      sourceMediaW: _0x45c693,
      sourceMediaH: _0x13127f
    } : null),
    createdAt: Date.now()
  });
  try {
    const _0x41cff9 = _getManifestFixedInputConfig(_0x214d90);
    const _0x1a3ac2 = String(_0x214d90?.type || "") === "ai-video" && (_0x41cff9?.slotOrderByType?.video || []).includes("sourceVideo");
    if (_0x1a3ac2 && _0x45c693 > 0 && _0x13127f > 0) {
      const _0x414b49 = Array.isArray(_0x214d90.videos) && _0x214d90.videos.length > 0 || String(_0x214d90.videoUrl || "").trim() || String(_0x214d90.localPath || "").trim() || String(_0x214d90.thumbId || "").trim();
      const _0x3a13d4 = String(_0x214d90.aspectRatio || "自适应");
      if (!_0x414b49 && _0x3a13d4 === "自适应") {
        const _0xaa576 = getStateRaw();
        const _0x3dbc7c = _0xaa576.nodes?.[_0x4b8862];
        if (_0x3dbc7c) {
          const _0x1941c9 = _0x45c693 / _0x13127f;
          if (Number.isFinite(_0x1941c9) && _0x1941c9 > 0) {
            const _0x44be24 = getAIGenerationNodeSize(_0x45c693, _0x13127f);
            const _0x244f7b = _0x44be24.width;
            const _0x23fb59 = _0x44be24.height;
            const _0x291acc = Number(_0x3dbc7c.x || 0) + Number(_0x3dbc7c.width || 0) / 2;
            const _0x2032ce = Number(_0x3dbc7c.y || 0) + Number(_0x3dbc7c.height || 0) / 2;
            graphStore.updateNodeData(_0x4b8862, {
              width: _0x244f7b,
              height: _0x23fb59,
              x: _0x291acc - _0x244f7b / 2,
              y: _0x2032ce - _0x23fb59 / 2
            });
          }
        }
      }
    }
  } catch {}
  return true;
}
export function initPickConnect(_0xaa6f46) {
  function _0x4e2755(_0x56ca9b, _0x24efd1, _0x20df5b, _0x2a3590, _0x2914c7) {
    const _0x5120c0 = _getOutEdgeMap(_0x2a3590, _0x2914c7);
    const _0x58bb0f = _0x20df5b[_0x56ca9b];
    const _0x23c81c = [];
    const _0x423844 = _0x24efd1 === "left";
    const _0x297bdc = _0x24efd1 === "left" && _isAnimeRealTarget(_0x58bb0f);
    const _0x210413 = _0x24efd1 === "left" && _isRhPersonReplaceV3Target(_0x58bb0f);
    const _0x4b9914 = _0x24efd1 === "left" ? _getManifestFixedInputConfig(_0x58bb0f) : null;
    const _0x34fd0e = new Set(_0x4b9914?.visibleSlots || []);
    for (const [_0x1b9e59, _0x8a523f] of Object.entries(_0x20df5b)) {
      if (_0x1b9e59 === _0x56ca9b) {
        continue;
      }
      const _0x16e131 = String(_0x8a523f?.type || "").trim() === "group";
      if (_0x297bdc) {
        if (!_0x16e131 && !_isAnimeRealImageSrc(_0x8a523f)) {
          _0x23c81c.push(_0x1b9e59);
          continue;
        }
      }
      if (_0x210413) {
        if (!_0x16e131 && !_isAnimeRealImageSrc(_0x8a523f)) {
          _0x23c81c.push(_0x1b9e59);
          continue;
        }
      }
      if (_0x4b9914 && !_0x16e131) {
        const _0x4d705f = _getRhV54RefKind(_0x8a523f);
        const _0x489c2f = (_0x4b9914.slotOrderByType?.[_0x4d705f] || []).filter(_0x4e35ce => _0x34fd0e.has(_0x4e35ce));
        if (_0x4d705f !== "text" && _0x489c2f.length === 0) {
          _0x23c81c.push(_0x1b9e59);
          continue;
        }
      }
      const _0x3716a3 = _0x423844 ? _0x8a523f : _0x58bb0f;
      const _0x29e019 = _0x423844 ? _0x58bb0f : _0x8a523f;
      const _0x4312a4 = !!_0x3716a3?.id && !!_0x29e019?.id && !!_0x5120c0.get(_0x3716a3.id)?.has(_0x29e019.id);
      if (!isValidConnection(_0x3716a3, _0x29e019) || _0x4312a4) {
        _0x23c81c.push(_0x1b9e59);
      }
    }
    return _0x23c81c;
  }
  function _0xc1b026(_0x5aa41a, _0x2d5c75) {
    const {
      pickConnectMode: _0x5660c6
    } = getStateRaw();
    const _0x5c7398 = String(_0x5660c6?.preferredRefSlot || "").trim();
    const _0x53c668 = addEdgeWithPolicies({
      sourceId: _0x5aa41a,
      targetId: _0x2d5c75,
      preferredRefSlot: _0x5c7398
    });
    if (!_0x53c668) {
      return false;
    }
    const {
      pickConnectMode: _0x488197,
      nodes: _0x1265ea,
      edges: _0x46cedf,
      _edgesRev: _0x50fe06
    } = getStateRaw();
    if (_0x488197 && _0x488197.active) {
      const _0x194577 = _0x4e2755(_0x488197.sourceNodeId, _0x488197.handleDirection, _0x1265ea, _0x46cedf, _0x50fe06);
      graphStore.setConnOverlay({
        srcId: _0x488197.sourceNodeId,
        invalidNodeIds: _0x194577
      });
    }
    return true;
  }
  _0xaa6f46.addEventListener("contextmenu", _0x46c58b => {
    const {
      pickConnectMode: _0x4a570f
    } = getStateRaw();
    if (!_0x4a570f || !_0x4a570f.active) {
      return;
    }
    _0x46c58b.preventDefault?.();
    _0x46c58b.stopPropagation?.();
    _0x46c58b.stopImmediatePropagation?.();
    _0x46c58b._pickConnectHandled = true;
    uiStore.setPickConnectMode({
      active: false
    });
  }, true);
  _0xaa6f46.addEventListener("click", _0x5d9d16 => {
    const {
      pickConnectMode: _0x115bed
    } = getStateRaw();
    if (!_0x115bed || !_0x115bed.active) {
      return;
    }
    const _0x4bb3cd = _0x5d9d16.target.closest(".prompt-attachment-btn");
    if (_0x4bb3cd) {
      const _0x1186cd = _0x4bb3cd.closest(".v2-node");
      if (_0x1186cd && _0x1186cd.id === _0x115bed.sourceNodeId) {
        _0x5d9d16._pickConnectHandled = true;
        _0x5d9d16.stopImmediatePropagation();
        uiStore.setPickConnectMode({
          active: false
        });
        return;
      }
    }
    const _0x4dee8d = getStateRaw();
    const _0x3db1cd = _0x5d9d16.target.closest(".v2-node");
    let _0x105998 = _0x3db1cd?.id || "";
    if (!_0x105998) {
      const _0x1622e3 = _getNodeSpatialIndex(_0x4dee8d.nodes, _0x4dee8d._persistRev, _NODE_SPATIAL_INDEX_DEFAULT_KEY);
      _0x105998 = hitTestNode(_0x5d9d16.clientX, _0x5d9d16.clientY, _0x4dee8d.nodes, _0x4dee8d.viewport, _0x115bed.sourceNodeId, false, {
        spatialIndex: _0x1622e3
      });
    }
    if (!_0x105998 || _0x105998 === _0x115bed.sourceNodeId) {
      return;
    }
    const _0x3ea084 = _0x4dee8d.nodes[_0x105998];
    if (!_0x3ea084) {
      return;
    }
    const _0x4867ac = _0x115bed.handleDirection === "left";
    const _0x2d1716 = _0x4867ac ? _0x3ea084.id : _0x115bed.sourceNodeId;
    const _0x35c89a = _0x4867ac ? _0x115bed.sourceNodeId : _0x3ea084.id;
    const _0x21cc08 = _0x4dee8d.nodes[_0x2d1716];
    const _0x187359 = _0x4dee8d.nodes[_0x35c89a];
    if (!isValidConnection(_0x21cc08, _0x187359)) {
      return;
    }
    if (_0xc1b026(_0x2d1716, _0x35c89a)) {
      _0x5d9d16._pickConnectHandled = true;
      _0x5d9d16.stopImmediatePropagation();
    }
  }, true);
  _0xaa6f46.addEventListener("pointermove", _0x39a56c => {
    const {
      pickConnectMode: _0xc72879,
      nodes: _0x3d45a8,
      viewport: _0x24a2f1,
      connOverlay: _0x24049b,
      _persistRev: _0x10f5ca
    } = getStateRaw();
    if (!_0xc72879 || !_0xc72879.active) {
      return;
    }
    const _0x464ff7 = _getNodeSpatialIndex(_0x3d45a8, _0x10f5ca, _NODE_SPATIAL_INDEX_DEFAULT_KEY);
    let _0x592627 = hitTestNode(_0x39a56c.clientX, _0x39a56c.clientY, _0x3d45a8, _0x24a2f1, _0xc72879.sourceNodeId, false, {
      spatialIndex: _0x464ff7
    });
    if (_0x592627 && _0x24049b && _0x24049b.invalidNodeIds && _0x24049b.invalidNodeIds.includes(_0x592627)) {
      _0x592627 = null;
    }
    if (_0xc72879.hoverNodeId !== _0x592627) {
      uiStore.setPickConnectHover(_0x592627);
    }
  });
  const _0x372726 = _0x3c727f => {
    if (_0x3c727f.target.closest("[contenteditable=\"true\"]")) {
      _0x3c727f.target.blur();
    }
  };
  function _0x3f0257(_0xab3876) {
    document?.body?.classList?.toggle?.("pick-connect-active", _0xab3876 === true);
  }
  let _0x1ac5fd = false;
  let _0x53d4d7 = null;
  let _0xbb732a = null;
  uiStore.subscribeSelector(_0x5816cd => ({
    active: !!_0x5816cd.pickConnectMode?.active,
    sourceNodeId: _0x5816cd.pickConnectMode?.sourceNodeId || null,
    handleDirection: _0x5816cd.pickConnectMode?.handleDirection || null
  }), ({
    active: _0x6c61a9,
    sourceNodeId: _0x534747,
    handleDirection: _0x553f89
  }) => {
    _0x3f0257(_0x6c61a9);
    if (_0x6c61a9) {
      _0xaa6f46.classList.add("is-connecting");
      document.addEventListener("focusin", _0x372726, true);
      const _0xe61535 = getCursorSize();
      const _0x347a04 = createLinkCursor({
        size: _0xe61535
      });
      document.documentElement.classList.add("is-connecting-mode");
      document.documentElement.style.setProperty("--connect-cursor", _0x347a04);
      if (!_0x1ac5fd || _0x53d4d7 !== _0x534747 || _0xbb732a !== _0x553f89) {
        _0x1ac5fd = true;
        _0x53d4d7 = _0x534747;
        _0xbb732a = _0x553f89;
        const {
          nodes: _0x2383fd,
          edges: _0x571eb3,
          _edgesRev: _0xf7f47f
        } = getStateRaw();
        const _0x43a60b = _0x4e2755(_0x534747, _0x553f89, _0x2383fd, _0x571eb3, _0xf7f47f);
        graphStore.setConnOverlay({
          srcId: _0x534747,
          invalidNodeIds: _0x43a60b
        });
      }
    } else {
      _0xaa6f46.classList.remove("is-connecting");
      document.removeEventListener("focusin", _0x372726, true);
      document.documentElement.classList.remove("is-connecting-mode");
      document.documentElement.style.removeProperty("--connect-cursor");
      if (_0x1ac5fd) {
        _0x1ac5fd = false;
        _0x53d4d7 = null;
        graphStore.setSelectionBox({
          active: false
        });
        uiStore.setPickConnectHover(null);
        graphStore.clearConnOverlay();
      }
    }
  });
}
function _createSidePlusCreationMenu(_0x2c2a5b) {
  const _0x1df7fa = document.createElement("div");
  _0x1df7fa.className = "v2-quote-menu v2-node-menu-section v2-node-menu-compact";
  const _0x10d5b6 = document.createElement("div");
  _0x10d5b6.className = "v2-menu-section";
  const _0x4346b1 = document.createElement("span");
  _0x4346b1.className = "v2-menu-title";
  _0x4346b1.textContent = _0x2c2a5b;
  const _0x5a221e = document.createElement("div");
  _0x5a221e.className = "v2-menu-rule";
  _0x10d5b6.appendChild(_0x4346b1);
  _0x10d5b6.appendChild(_0x5a221e);
  _0x1df7fa.appendChild(_0x10d5b6);
  return _0x1df7fa;
}
function _showQuoteMenu(_0x44df06, _0x18b5c0, _0x30f2f4, _0x5ab827, _0xf33303, _0x227dee = {}) {
  document.querySelector(".v2-quote-menu")?.remove();
  const {
    nodes: _0x700023
  } = getStateRaw();
  const _0x87bc0f = (_0x201d06, _0x5504f0 = null) => {
    const _0x45fe8a = [];
    const _0x1e3566 = new Set();
    const _0x115f8d = Array.isArray(_0x201d06) ? _0x201d06 : [];
    for (const _0x41e6dc of _0x115f8d) {
      const _0x2bdc93 = String(_0x41e6dc || "").trim();
      if (!_0x2bdc93 || _0x1e3566.has(_0x2bdc93)) {
        continue;
      }
      _0x1e3566.add(_0x2bdc93);
      _0x45fe8a.push(_0x2bdc93);
    }
    const _0x3ddf34 = String(_0x5504f0 || "").trim();
    if (_0x45fe8a.length === 0 && _0x3ddf34) {
      _0x45fe8a.push(_0x3ddf34);
    }
    return _0x45fe8a;
  };
  const _0x3f16f8 = _0x87bc0f(_0x227dee?.sourceIds, _0x30f2f4).filter(_0x3158b2 => !!_0x700023[_0x3158b2]);
  const _0x2cd7d1 = _0x3f16f8.includes(_0x30f2f4) ? _0x30f2f4 : _0x3f16f8[0];
  const _0x499164 = _0x2cd7d1 ? _0x700023[_0x2cd7d1] : null;
  if (!_0x499164) {
    _0xf33303?.();
    return;
  }
  const _0x3e415d = _0x3f16f8.map(_0x489ac2 => _0x700023[_0x489ac2]).filter(Boolean);
  const _0x426eda = (_0x4ed358, _0xcb8be6) => {
    const _0x2d1c03 = getDisplayedMediaSizeFromNode(_0x4ed358, _0xcb8be6);
    const _0xc62e47 = Number(_0x2d1c03?.w || 0);
    const _0xcc1507 = Number(_0x2d1c03?.h || 0);
    const _0x589f3e = _0xc62e47 > 0 && _0xcc1507 > 0 ? _0xc62e47 / _0xcc1507 : 0;
    if (Number.isFinite(_0x589f3e) && _0x589f3e > 0) {
      return _0x589f3e;
    } else {
      return 0;
    }
  };
  const _0x27a6a8 = (_0x45203c, _0x54914e, _0x3f24b8, _0x3bb97a) => {
    const _0x32fc43 = Number(_0x3bb97a);
    if (!Number.isFinite(_0x32fc43) || !(_0x32fc43 > 0)) {
      return false;
    }
    const _0x28a245 = getAIGenerationNodeSize(_0x32fc43 >= 1 ? _0x32fc43 : 1, _0x32fc43 >= 1 ? 1 : 1 / _0x32fc43);
    const _0x310d29 = _0x28a245.width;
    const _0x81e373 = _0x28a245.height;
    const _0x17c9e0 = getStateRaw();
    const _0x426a84 = _0x17c9e0.nodes?.[_0x45203c];
    if (!_0x426a84) {
      return false;
    }
    graphStore.updateNodeData(_0x45203c, {
      width: _0x310d29,
      height: _0x81e373,
      x: _0x54914e - _0x310d29 / 2,
      y: _0x3f24b8 - _0x81e373 / 2
    });
    commit();
    return true;
  };
  const _0xa49bac = (_0x167eb8, _0x2cb7ea) => {
    const _0x6ea547 = getStateRaw();
    const _0x33358f = _0x6ea547.nodes || {};
    const _0x489fdc = _0x33358f[_0x167eb8];
    const _0x50d8f9 = _0x33358f[_0x2cb7ea];
    if (!_0x489fdc || !_0x50d8f9) {
      return;
    }
    if (String(_0x489fdc.type || "") !== "ai-video") {
      return;
    }
    if (String(_0x50d8f9.type || "") !== "ai-video") {
      return;
    }
    const _0x4bc630 = Number(_0x50d8f9.width || 0);
    const _0x409c0b = Number(_0x50d8f9.height || 0);
    if (_0x4bc630 !== _AI_VIDEO_DEFAULT_SIZE.width || _0x409c0b !== _AI_VIDEO_DEFAULT_SIZE.height) {
      return;
    }
    const _0x425b6a = Array.isArray(_0x50d8f9.videos) && _0x50d8f9.videos.length > 0 || String(_0x50d8f9.videoUrl || "").trim() || String(_0x50d8f9.localPath || "").trim() || String(_0x50d8f9.thumbId || "").trim();
    if (_0x425b6a) {
      return;
    }
    const _0x37cc7e = Number(_0x50d8f9.x || 0) + _0x4bc630 / 2;
    const _0x4daef2 = Number(_0x50d8f9.y || 0) + _0x409c0b / 2;
    const _0x3d96de = Date.now();
    const _0x18b61a = () => {
      const _0x4fc28e = getDisplayedMediaSizeFromNode(_0x167eb8, "video");
      const _0x5d15c7 = Number(_0x4fc28e?.w || 0);
      const _0x2d5de0 = Number(_0x4fc28e?.h || 0);
      let _0x2b9b61 = _0x5d15c7;
      let _0x3f8fe8 = _0x2d5de0;
      if (!(_0x2b9b61 > 0) || !(_0x3f8fe8 > 0)) {
        const _0x3c476f = getStateRaw();
        const _0x4ec048 = _0x3c476f.nodes?.[_0x167eb8];
        if (_0x4ec048) {
          const _0x50dbd0 = Number(_0x4ec048.mainVideoIndex);
          const _0x3accb6 = Number.isFinite(_0x50dbd0) ? Math.max(0, Math.trunc(_0x50dbd0)) : 0;
          const _0x4e845c = Array.isArray(_0x4ec048.videos) ? _0x4ec048.videos : [];
          const _0x219628 = _0x4e845c[_0x3accb6];
          const _0x590ce6 = Number(_0x219628?.videoWidth || 0);
          const _0x43919a = Number(_0x219628?.videoHeight || 0);
          const _0x31aa28 = Number(_0x4ec048.selectedVideoWidth || 0);
          const _0x23c15a = Number(_0x4ec048.selectedVideoHeight || 0);
          const _0x33bb8a = Number(_0x4ec048.videoWidth || 0);
          const _0x32cc8b = Number(_0x4ec048.videoHeight || 0);
          if (_0x590ce6 > 0 && _0x43919a > 0) {
            _0x2b9b61 = _0x590ce6;
            _0x3f8fe8 = _0x43919a;
          } else if (_0x31aa28 > 0 && _0x23c15a > 0) {
            _0x2b9b61 = _0x31aa28;
            _0x3f8fe8 = _0x23c15a;
          } else if (_0x33bb8a > 0 && _0x32cc8b > 0) {
            _0x2b9b61 = _0x33bb8a;
            _0x3f8fe8 = _0x32cc8b;
          }
        }
      }
      if (_0x2b9b61 > 0 && _0x3f8fe8 > 0) {
        _0x27a6a8(_0x2cb7ea, _0x37cc7e, _0x4daef2, _0x2b9b61 / _0x3f8fe8);
        return;
      }
      if (Date.now() - _0x3d96de < 1200) {
        requestAnimationFrame(_0x18b61a);
      }
    };
    requestAnimationFrame(_0x18b61a);
  };
  const _0xc835a8 = screenToWorld(_0x44df06, _0x18b5c0, _0x5ab827);
  const _0x43dfb8 = _createSidePlusCreationMenu(t("edgeController.quoteMenuTitle"));
  const _0x39be4c = "var(--white-50)";
  const _0xee2123 = "var(--white-05)";
  const _0x3bccab = [{
    iconEl: _iconAiText(_0x39be4c),
    iconBg: _0xee2123,
    label: "文本",
    desc: "文案、脚本、提示词",
    type: "ai-text",
    w: _AI_TEXT_DEFAULT_SIZE.width,
    h: _AI_TEXT_DEFAULT_SIZE.height
  }, {
    iconEl: _iconAiImage(_0x39be4c),
    iconBg: _0xee2123,
    label: "图像",
    desc: "图片、海报、角色素材",
    type: "ai-image",
    w: _AI_IMAGE_DEFAULT_SIZE.width,
    h: _AI_IMAGE_DEFAULT_SIZE.height
  }, {
    iconEl: _iconAiVideo(_0x39be4c),
    iconBg: _0xee2123,
    label: "视频",
    desc: "短片、转场、动态镜头",
    type: "ai-video",
    w: _AI_VIDEO_DEFAULT_SIZE.width,
    h: _AI_VIDEO_DEFAULT_SIZE.height
  }, {
    iconEl: _iconAiAudio(_0x39be4c),
    iconBg: _0xee2123,
    label: "音频",
    desc: "配音、音效、音乐",
    type: "ai-audio",
    w: _AI_AUDIO_DEFAULT_SIZE.width,
    h: _AI_AUDIO_DEFAULT_SIZE.height
  }, {
    iconEl: _iconStoryboardScript(_0x39be4c),
    iconBg: _0xee2123,
    label: "分镜脚本",
    desc: "镜头表、提示词、节奏",
    type: "storyboard-script",
    w: STORYBOARD_SCRIPT_DEFAULT_SIZE.width,
    h: STORYBOARD_SCRIPT_DEFAULT_SIZE.height,
    badge: "BETA"
  }, {
    iconEl: _iconAiImage(_0x39be4c),
    iconBg: _0xee2123,
    label: "360全景图",
    desc: "全景画面与空间关系",
    type: "panorama-360",
    w: PANORAMA_SCENE_DEFAULT_SIZE.width,
    h: PANORAMA_SCENE_DEFAULT_SIZE.height
  }, {
    iconEl: _iconWhiteboard(_0x39be4c),
    iconBg: _0xee2123,
    label: "白板",
    desc: "画图、标注、文字说明",
    type: "whiteboard",
    w: WHITEBOARD_DEFAULT_SIZE.width,
    h: WHITEBOARD_DEFAULT_SIZE.height
  }].map(_applyNodeCreationMenuMeta);
  const _0x5ae67d = new Set(getAllowedGenerationNodeTypesForQuoteMenu(_0x3e415d));
  const _0x203734 = _0x3bccab.filter(_0x548ef1 => _0x5ae67d.has(_0x548ef1.type));
  _0x203734.forEach(_0x1aa5ef => {
    const _0x4e954e = document.createElement("button");
    _0x4e954e.className = "v2-menu-row" + (_0x1aa5ef.desc ? " has-desc" : "");
    const _0x44a821 = document.createElement("div");
    _0x44a821.className = "v2-menu-ico";
    _0x44a821.replaceChildren();
    if (_0x1aa5ef.iconEl) {
      _0x44a821.appendChild(_0x1aa5ef.iconEl.cloneNode(true));
    }
    if (_0x1aa5ef.iconBg) {
      _0x44a821.style.background = _0x1aa5ef.iconBg;
    }
    const _0x53af21 = document.createElement("div");
    _0x53af21.className = "v2-menu-txt-wrap";
    const _0x445d5f = document.createElement("span");
    _0x445d5f.className = "v2-menu-lbl";
    _0x445d5f.textContent = _0x1aa5ef.label;
    if (_0x1aa5ef.badge) {
      const _0x1d33c0 = document.createElement("span");
      _0x1d33c0.textContent = _0x1aa5ef.badge;
      _0x1d33c0.className = "v2-badge-beta";
      _0x445d5f.appendChild(_0x1d33c0);
    }
    _0x53af21.appendChild(_0x445d5f);
    if (_0x1aa5ef.desc) {
      const _0x31f153 = document.createElement("span");
      _0x31f153.className = "v2-menu-sub";
      _0x31f153.textContent = _0x1aa5ef.desc;
      _0x53af21.appendChild(_0x31f153);
    }
    _0x4e954e.appendChild(_0x44a821);
    _0x4e954e.appendChild(_0x53af21);
    _0x4e954e.addEventListener("click", _0x1d6fe3 => {
      _0x1d6fe3.stopPropagation();
      const _0x57191f = generateId(_0x1aa5ef.type);
      let _0x539aa5 = _0x1aa5ef.w;
      let _0x20b9e4 = _0x1aa5ef.h;
      if ((_0x1aa5ef.type === "ai-image" || _0x1aa5ef.type === "ai-video") && (_0x499164.width && _0x499164.height || _0x499164.videoWidth && _0x499164.videoHeight)) {
        let _0x4b5faa = 0;
        if (_0x1aa5ef.type === "ai-video" && String(_0x499164.type || "") !== "ai-video") {
          const _0x589bf3 = Number(_0x499164.mainVideoIndex) || 0;
          const _0x5c7ed0 = Math.max(0, Math.trunc(_0x589bf3));
          const _0x1eab88 = Array.isArray(_0x499164.videos) ? _0x499164.videos : [];
          const _0xc761c2 = String(_0x499164.localPath || "").trim();
          const _0x116a6a = String(_0x499164.videoUrl || "").trim();
          const _0x486956 = Number(_0x499164.selectedVideoWidth || 0);
          const _0x5793ef = Number(_0x499164.selectedVideoHeight || 0);
          let _0x58430c = _0x5c7ed0;
          if (_0x1eab88.length) {
            let _0x4673c0 = -1;
            if (_0xc761c2) {
              _0x4673c0 = _0x1eab88.findIndex(_0x165459 => String(_0x165459?.localPath || "").trim() === _0xc761c2);
            }
            if (_0x4673c0 < 0 && _0x116a6a) {
              _0x4673c0 = _0x1eab88.findIndex(_0x5dcad0 => String(_0x5dcad0?.videoUrl || "").trim() === _0x116a6a);
            }
            if (_0x4673c0 >= 0) {
              _0x58430c = _0x4673c0;
            } else if (_0x5c7ed0 >= _0x1eab88.length) {
              _0x58430c = 0;
            }
          } else {
            _0x58430c = 0;
          }
          const _0x4154fb = _0x1eab88[_0x58430c] || _0x1eab88[0] || null;
          const _0xd93334 = _0x4154fb ? Number(_0x4154fb.videoWidth || _0x4154fb.width || 0) : 0;
          const _0x3d3240 = _0x4154fb ? Number(_0x4154fb.videoHeight || _0x4154fb.height || 0) : 0;
          _0x4b5faa = (_0x486956 > 0 && _0x5793ef > 0 ? _0x486956 / _0x5793ef : 0) || _0x426eda(_0x2cd7d1, "video") || (_0xd93334 > 0 && _0x3d3240 > 0 ? _0xd93334 / _0x3d3240 : 0) || (_0x499164.videoWidth && _0x499164.videoHeight ? _0x499164.videoWidth / _0x499164.videoHeight : 0) || (_0x499164.width && _0x499164.height ? _0x499164.width / _0x499164.height : 0);
        } else {
          _0x4b5faa = _0x426eda(_0x2cd7d1, "image") || (_0x499164.width && _0x499164.height ? _0x499164.width / _0x499164.height : 0);
        }
        if (!Number.isFinite(_0x4b5faa) || !(_0x4b5faa > 0)) {
          _0x4b5faa = 1;
        }
        const _0x2fa13b = getAIGenerationNodeSize(_0x4b5faa >= 1 ? _0x4b5faa : 1, _0x4b5faa >= 1 ? 1 : 1 / _0x4b5faa);
        _0x539aa5 = _0x2fa13b.width;
        _0x20b9e4 = _0x2fa13b.height;
      }
      let _0x7075b6 = {
        id: _0x57191f,
        type: _0x1aa5ef.type,
        x: _0xc835a8.x - _0x539aa5 / 2,
        y: _0xc835a8.y - _0x20b9e4 / 2,
        width: _0x539aa5,
        height: _0x20b9e4,
        name: _0x1aa5ef.defaultName || _0x1aa5ef.label
      };
      if ((_0x1aa5ef.type === "ai-image" || _0x1aa5ef.type === "ai-video") && !Object.prototype.hasOwnProperty.call(_0x7075b6, "aspectRatio")) {
        _0x7075b6.aspectRatio = "自适应";
      }
      if (_0x499164.type === _0x1aa5ef.type) {
        const _0x5e88da = {
          ..._0x499164
        };
        delete _0x5e88da.id;
        delete _0x5e88da.x;
        delete _0x5e88da.y;
        delete _0x5e88da.width;
        delete _0x5e88da.height;
        delete _0x5e88da.name;
        delete _0x5e88da.prompt;
        delete _0x5e88da.outputText;
        stripImageGenerationResultStateForDerivedNode(_0x5e88da);
        delete _0x5e88da.batchSize;
        _0x7075b6 = {
          ..._0x5e88da,
          ..._0x7075b6
        };
      }
      if (_isPanorama360TargetType(_0x7075b6.type)) {
        _0x7075b6 = createPanorama360NodeData({
          id: _0x7075b6.id,
          x: _0x7075b6.x,
          y: _0x7075b6.y,
          width: _0x7075b6.width,
          height: _0x7075b6.height,
          name: _0x7075b6.name
        });
      }
      if (_0x7075b6.type === "storyboard-script") {
        _0x7075b6 = createStoryboardScriptNodeData({
          id: _0x7075b6.id,
          x: _0x7075b6.x,
          y: _0x7075b6.y,
          width: _0x7075b6.width,
          height: _0x7075b6.height,
          name: _0x7075b6.name
        });
      }
      if (_0x7075b6.type === "whiteboard") {
        _0x7075b6 = createWhiteboardNodeData({
          id: _0x7075b6.id,
          x: _0x7075b6.x,
          y: _0x7075b6.y,
          width: _0x7075b6.width,
          height: _0x7075b6.height,
          name: _0x7075b6.name
        });
      }
      graphStore.addNode(_0x7075b6);
      let _0x38c9f1 = false;
      let _0x554dde = "";
      for (const _0x5076f4 of _0x3f16f8) {
        const _0x6f1ceb = getStateRaw();
        const _0x37ad3a = _0x6f1ceb.nodes?.[_0x5076f4];
        const _0x49804d = _0x6f1ceb.nodes?.[_0x57191f];
        if (!_0x37ad3a || !_0x49804d) {
          continue;
        }
        if (!isValidConnection(_0x37ad3a, _0x49804d)) {
          continue;
        }
        const _0x4fed4c = addEdgeWithPolicies({
          sourceId: _0x5076f4,
          targetId: _0x57191f
        });
        if (!_0x4fed4c) {
          continue;
        }
        _0x38c9f1 = true;
        if (!_0x554dde) {
          _0x554dde = _0x5076f4;
        }
      }
      if (!_0x38c9f1 && _0x3f16f8.length === 1) {
        const _0x53851a = generateId("edge");
        graphStore.addEdge({
          id: _0x53851a,
          sourceId: _0x3f16f8[0],
          targetId: _0x57191f,
          createdAt: Date.now()
        });
        _0x38c9f1 = true;
        _0x554dde = _0x3f16f8[0];
      }
      graphStore.setSelectedNodes([_0x57191f]);
      commit();
      if (_0x1aa5ef.type === "ai-video" && _0x554dde) {
        _0xa49bac(_0x554dde, _0x57191f);
      }
      _0x1b8fcd?.();
      _0x43dfb8.remove();
      _0xf33303?.();
    });
    _0x43dfb8.appendChild(_0x4e954e);
  });
  document.body.appendChild(_0x43dfb8);
  const _0x273af8 = () => {
    const _0x28117c = getStateRaw().viewport || _0x5ab827;
    const _0x4df668 = worldToScreen(_0xc835a8.x, _0xc835a8.y, _0x28117c);
    _0x43dfb8.style.left = _0x4df668.x + "px";
    _0x43dfb8.style.top = _0x4df668.y + "px";
  };
  _0x273af8();
  const _0x1b8fcd = graphStore.subscribeSelector(_0x3512c7 => _0x3512c7.viewport, () => _0x273af8());
  const _0x1888ae = _0x1eba31 => {
    if (_0x43dfb8.contains(_0x1eba31.target)) {
      return;
    }
    _0x1b8fcd?.();
    _0x43dfb8.remove();
    document.removeEventListener("mousedown", _0x1888ae, true);
    _0xf33303?.();
  };
  requestAnimationFrame(() => document.addEventListener("mousedown", _0x1888ae, true));
}
function _showLeftQuoteMenu(_0x1b4336, _0x4ac5bb, _0x4c5da7, _0x4a0757, _0x492371) {
  document.querySelector(".v2-quote-menu")?.remove();
  const {
    nodes: _0x5d1c5b
  } = getState();
  const _0x2410d6 = _0x5d1c5b[_0x4c5da7];
  if (!_0x2410d6) {
    _0x492371?.();
    return;
  }
  const _0x2423bf = screenToWorld(_0x1b4336, _0x4ac5bb, _0x4a0757);
  const _0x2c664e = _createSidePlusCreationMenu(t("edgeController.inputMenuTitle"));
  const _0x8fc128 = [{
    iconEl: _iconSourceText("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "源文本",
    desc: "纯文本片段",
    type: "source-text",
    ...getNodeDefaultSize("source-text")
  }, {
    iconEl: _iconAiImage("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "源图像",
    desc: "参考图、首帧、素材",
    type: "source-image",
    ...getNodeDefaultSize("source-image")
  }, {
    iconEl: _iconAiAudio("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "源音频",
    desc: "本地或上传音频",
    type: "source-audio",
    ...getNodeDefaultSize("source-audio")
  }, {
    iconEl: _iconAiVideo("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "源视频",
    desc: "本地或上传视频",
    type: "source-video",
    ...getNodeDefaultSize("source-video")
  }, {
    iconEl: _iconAiText("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "文本",
    desc: "文案、脚本、提示词",
    type: "ai-text",
    w: _AI_TEXT_DEFAULT_SIZE.width,
    h: _AI_TEXT_DEFAULT_SIZE.height
  }, {
    iconEl: _iconAiImage("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "图像",
    desc: "图片、海报、角色素材",
    type: "ai-image",
    w: _AI_IMAGE_DEFAULT_SIZE.width,
    h: _AI_IMAGE_DEFAULT_SIZE.height
  }, {
    iconEl: _iconAiVideo("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "视频",
    desc: "短片、转场、动态镜头",
    type: "ai-video",
    w: _AI_VIDEO_DEFAULT_SIZE.width,
    h: _AI_VIDEO_DEFAULT_SIZE.height
  }, {
    iconEl: _iconAiAudio("var(--white-50)"),
    iconBg: "var(--white-05)",
    label: "音频",
    desc: "配音、音效、音乐",
    type: "ai-audio",
    w: _AI_AUDIO_DEFAULT_SIZE.width,
    h: _AI_AUDIO_DEFAULT_SIZE.height
  }].map(_applyNodeCreationMenuMeta);
  const _0x4fc5ce = getAllowedInputNodeTypesForSidePlus(_0x2410d6);
  const _0x24e275 = _0x8fc128.filter(_0x2ab495 => _0x4fc5ce.includes(_0x2ab495.type));
  _0x24e275.forEach(_0x5751da => {
    const _0x1bf788 = document.createElement("button");
    _0x1bf788.className = "v2-menu-row" + (_0x5751da.desc ? " has-desc" : "");
    const _0xfa4371 = document.createElement("div");
    _0xfa4371.className = "v2-menu-ico";
    _0xfa4371.replaceChildren();
    if (_0x5751da.iconEl) {
      _0xfa4371.appendChild(_0x5751da.iconEl.cloneNode(true));
    }
    if (_0x5751da.iconBg) {
      _0xfa4371.style.background = _0x5751da.iconBg;
    }
    const _0x2b450b = document.createElement("div");
    _0x2b450b.className = "v2-menu-txt-wrap";
    const _0x2a25ed = document.createElement("span");
    _0x2a25ed.className = "v2-menu-lbl";
    _0x2a25ed.textContent = _0x5751da.label;
    if (_0x5751da.badge) {
      const _0x5d3f0c = document.createElement("span");
      _0x5d3f0c.textContent = _0x5751da.badge;
      _0x5d3f0c.className = "v2-badge-beta";
      _0x2a25ed.appendChild(_0x5d3f0c);
    }
    _0x2b450b.appendChild(_0x2a25ed);
    if (_0x5751da.desc) {
      const _0x521191 = document.createElement("span");
      _0x521191.className = "v2-menu-sub";
      _0x521191.textContent = _0x5751da.desc;
      _0x2b450b.appendChild(_0x521191);
    }
    _0x1bf788.appendChild(_0xfa4371);
    _0x1bf788.appendChild(_0x2b450b);
    _0x1bf788.addEventListener("click", _0x5d55e2 => {
      _0x5d55e2.stopPropagation();
      const _0x55951a = generateId(_0x5751da.type);
      let _0x2aebd2 = {
        id: _0x55951a,
        type: _0x5751da.type,
        x: _0x2423bf.x - 150,
        y: _0x2423bf.y,
        width: _0x5751da.width ?? _0x5751da.w,
        height: _0x5751da.height ?? _0x5751da.h,
        name: _0x5751da.defaultName || _0x5751da.label
      };
      if ((_0x5751da.type === "ai-image" || _0x5751da.type === "ai-video") && !Object.prototype.hasOwnProperty.call(_0x2aebd2, "aspectRatio")) {
        _0x2aebd2.aspectRatio = "自适应";
      }
      if (_0x2410d6.type === _0x5751da.type) {
        const _0x4e2dbd = {
          ..._0x2410d6
        };
        delete _0x4e2dbd.id;
        delete _0x4e2dbd.x;
        delete _0x4e2dbd.y;
        delete _0x4e2dbd.width;
        delete _0x4e2dbd.height;
        delete _0x4e2dbd.name;
        delete _0x4e2dbd.prompt;
        delete _0x4e2dbd.outputText;
        stripImageGenerationResultStateForDerivedNode(_0x4e2dbd);
        delete _0x4e2dbd.batchSize;
        _0x2aebd2 = {
          ..._0x4e2dbd,
          ..._0x2aebd2
        };
      }
      if (_0x2aebd2.type === "source-image" || _0x2aebd2.type === "source-video") {
        _0x2aebd2 = buildSourceMediaNodePayload(_0x2aebd2);
      } else if (_isPanorama360TargetType(_0x2aebd2.type)) {
        _0x2aebd2 = createPanorama360NodeData({
          id: _0x2aebd2.id,
          x: _0x2aebd2.x,
          y: _0x2aebd2.y,
          width: _0x2aebd2.width,
          height: _0x2aebd2.height
        });
      }
      graphStore.addNode(_0x2aebd2);
      const _0x58fe7a = addEdgeWithPolicies({
        sourceId: _0x55951a,
        targetId: _0x4c5da7
      });
      if (!_0x58fe7a) {
        const _0x5ae33a = generateId("edge");
        graphStore.addEdge({
          id: _0x5ae33a,
          sourceId: _0x55951a,
          targetId: _0x4c5da7,
          createdAt: Date.now()
        });
      }
      graphStore.setSelectedNodes([_0x55951a]);
      commit();
      _0x32ae8a?.();
      _0x2c664e.remove();
      _0x492371?.();
    });
    _0x2c664e.appendChild(_0x1bf788);
  });
  document.body.appendChild(_0x2c664e);
  const _0x1feb81 = () => {
    const _0x2c1f10 = getStateRaw().viewport || _0x4a0757;
    const _0x39b0fc = worldToScreen(_0x2423bf.x, _0x2423bf.y, _0x2c1f10);
    _0x2c664e.style.left = _0x39b0fc.x + "px";
    _0x2c664e.style.top = _0x39b0fc.y + "px";
  };
  _0x1feb81();
  const _0x32ae8a = graphStore.subscribeSelector(_0x427f20 => _0x427f20.viewport, () => _0x1feb81());
  const _0x5e8eb3 = _0x341e1d => {
    if (_0x2c664e.contains(_0x341e1d.target)) {
      return;
    }
    _0x32ae8a?.();
    _0x2c664e.remove();
    document.removeEventListener("mousedown", _0x5e8eb3, true);
    _0x492371?.();
  };
  requestAnimationFrame(() => document.addEventListener("mousedown", _0x5e8eb3, true));
}