import a491_0x284028 from "../core/stores/appStore.js";
import { addPanoramaSceneCamera, addPanoramaSceneCameraKeyframe, addPanoramaSceneCube, addPanoramaSceneMannequin, addPanoramaSceneMannequinGrid, capturePanoramaSceneViewport, applyPanoramaSceneMannequinPose, clearPanoramaSceneSelection, deletePanoramaSceneCamera, deletePanoramaSceneCameraKeyframe, deleteSelectedPanoramaSceneObject, focusPanoramaSceneSelection, resetPanoramaSceneView, setPanoramaSceneCollapsed, setPanoramaSceneCaptureMode, setPanoramaSceneEditing, setPanoramaSceneEnvironmentMode, setPanoramaSceneGridPlacement, setPanoramaSceneInteractionOptions, setPanoramaSceneMode, setPanoramaSceneSelection, setPanoramaSceneSelectionBatch, setPanoramaSceneSelectionObjects, setPanoramaSceneTool, updatePanoramaSceneLoadState, updatePanoramaSceneCameraTimeline, updatePanoramaSceneObjectTransform, uploadPanoramaSceneImage, applyPanoramaSceneViewCommit, syncPanorama360FromIncomingImageEdge, upsertPanoramaSceneCameraAtSlot } from "../modules/panoramaSceneNode/sceneNodeActions.js";
import { getPanoramaSceneState } from "../modules/panoramaSceneNode/sceneNodeSelectors.js";
import { PanoramaScene3DBridge } from "../modules/panoramaSceneNode/scene3dBridge.js";
import { preloadPanoramaCharacterModels } from "../modules/panoramaSceneNode/characterModelRegistry.js";
import { PanoramaSceneInteraction } from "../modules/interaction/PanoramaSceneInteraction.js";
import { PANORAMA_SCENE_TOOLBAR_HTML } from "./panoramaScene/PanoramaSceneToolbar.js";
import { PANORAMA_360_MODE_TOOLBAR_HTML, PANORAMA_SCENE_MODE_TOOLBAR_HTML } from "./panoramaScene/PanoramaModeToolbar.js";
import { PANORAMA_SCENE_CORNER_TOOLBAR_HTML } from "./panoramaScene/PanoramaSceneCornerToolbar.js";
import { PANORAMA_SCENE_BOTTOM_TOOLBAR_HTML } from "./panoramaScene/PanoramaSceneBottomToolbar.js";
import { createCameraPresetList, renderCameraPresetList } from "./panoramaScene/CameraPresetList.js";
import { createMannequinQuickMenu, getPanoramaMannequinColorLabel, getPanoramaMannequinGenderLabel, PANORAMA_MANNEQUIN_COLOR_OPTIONS, PANORAMA_MANNEQUIN_GENDER_OPTIONS, resolvePanoramaSceneColorToken, renderMannequinQuickMenu } from "./panoramaScene/MannequinQuickMenu.js";
import { createSceneAssetBrowser, renderSceneAssetBrowser } from "./panoramaScene/SceneAssetBrowser.js";
import { createMannequinPosePanel, renderMannequinPosePanel } from "./panoramaScene/MannequinPosePanel.js";
import { createCameraTimelinePanel, renderCameraTimelinePanel, setCameraTimelineDisplayTime } from "./panoramaScene/CameraTimelinePanel.js";
import { normalizeCameraTimeline, sampleCameraTimeline } from "../modules/panoramaSceneNode/cameraTimeline.js";
import { getShortcuts } from "../modules/shortcuts.js";
import * as a491_0x1eb6d4 from "../modules/panoramaSceneNode/threeRuntime.js";
import { createDefaultSceneView, PANORAMA_360_NODE_TYPE } from "../modules/panoramaSceneNode/sceneNode.js";
import { SCENE_DEFAULT_FOCAL_LENGTH_MM, SCENE_FOCAL_LENGTH_MAX_MM, SCENE_FOCAL_LENGTH_MIN_MM, cameraPoseToSceneViewFromReference, focalLengthToFov } from "../core/panoramaSceneMath.js";
import { onLocaleChange, t } from "../i18n/index.js";
const POINTER_TOOL_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"m5 3 10 8-6 1 2 7-3 1-2-7-4 3z\"/></svg>";
const BOX_SELECT_TOOL_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"/><path d=\"M8 9h8v6H8z\" stroke-dasharray=\"2 2\"/></svg>";
const PANORAMA_360_IMAGE_SOURCE_TYPES = new Set(["source-image", "ai-image", "image"]);
function panoramaSceneText(_0x4ff134, _0x33563c = {}) {
  return t("panoramaSceneNode." + _0x4ff134, _0x33563c);
}
function isPanorama360ImageSourceType(_0x58a408) {
  return PANORAMA_360_IMAGE_SOURCE_TYPES.has(String(_0x58a408 || "").trim());
}
function createElementFromHtml(_0x5def5d) {
  const _0x31cfa4 = document.createElement("template");
  _0x31cfa4.innerHTML = _0x5def5d.trim();
  return _0x31cfa4.content.firstElementChild;
}
function removeConfiguredToolbarActions(_0x12ef11, _0x2b3dec = []) {
  if (!_0x12ef11) {
    return;
  }
  const _0x1ae249 = new Set((Array.isArray(_0x2b3dec) ? _0x2b3dec : []).map(_0x23bb55 => String(_0x23bb55 || "").trim()).filter(Boolean));
  if (_0x1ae249.size < 1) {
    return;
  }
  _0x12ef11.querySelectorAll("button").forEach(_0x1d4236 => {
    const _0x53dfb2 = [..._0x1ae249].some(_0x484395 => _0x1d4236.classList.contains("act-" + _0x484395));
    if (_0x53dfb2) {
      _0x1d4236.remove();
    }
  });
}
function attachUiStop(_0x288159, {
  wheel = false
} = {}) {
  if (!_0x288159) {
    return;
  }
  _0x288159.dataset.uiStop = "1";
  _0x288159.addEventListener("pointerdown", _0x15a174 => _0x15a174.stopPropagation());
  if (wheel) {
    _0x288159.addEventListener("wheel", _0x2d8a7e => {
      _0x2d8a7e.stopPropagation();
    }, {
      passive: false
    });
  }
}
function getShortcutLabel(_0x223426) {
  const _0x483184 = getShortcuts()?.[_0x223426];
  const _0x198bba = Array.isArray(_0x483184?.keys) ? _0x483184.keys.filter(Boolean) : [];
  if (_0x198bba.length > 0) {
    return "[" + _0x198bba.join("+") + "]";
  } else {
    return "";
  }
}
function buildTooltipText(_0xa19b74, _0x4a2c48) {
  const _0x260be2 = getShortcutLabel(_0x4a2c48);
  if (_0x260be2) {
    return _0xa19b74 + " " + _0x260be2;
  } else {
    return _0xa19b74;
  }
}
function cameraTimelineSampleToDraft(_0x48adf2) {
  if (!_0x48adf2) {
    return null;
  }
  const _0x1ee821 = new a491_0x1eb6d4.Vector3(_0x48adf2.position.x, _0x48adf2.position.y, _0x48adf2.position.z);
  const _0x10f73b = new a491_0x1eb6d4.Vector3(_0x48adf2.target.x, _0x48adf2.target.y, _0x48adf2.target.z);
  const _0x4b9ca5 = new a491_0x1eb6d4.Matrix4().lookAt(_0x1ee821, _0x10f73b, new a491_0x1eb6d4.Vector3(0, 1, 0));
  const _0x18fd8f = new a491_0x1eb6d4.Quaternion().setFromRotationMatrix(_0x4b9ca5).normalize();
  const _0xf6a4c6 = new a491_0x1eb6d4.Euler().setFromQuaternion(_0x18fd8f, "YXZ");
  return {
    kind: "camera",
    position: {
      ..._0x48adf2.position
    },
    target: {
      ..._0x48adf2.target
    },
    quaternion: {
      x: _0x18fd8f.x,
      y: _0x18fd8f.y,
      z: _0x18fd8f.z,
      w: _0x18fd8f.w
    },
    rotation: {
      x: _0xf6a4c6.x,
      y: _0xf6a4c6.y,
      z: _0xf6a4c6.z
    },
    fov: _0x48adf2.fov,
    disableSmoothing: true
  };
}
function normalizeCameraSlot(_0x529bbc) {
  const _0x3e866d = Number(_0x529bbc);
  if (!Number.isInteger(_0x3e866d)) {
    return null;
  }
  if (_0x3e866d < 1 || _0x3e866d > 10) {
    return null;
  }
  return _0x3e866d;
}
function resolveCameraSlotEntries(_0x4518ed = []) {
  const _0x196e45 = Array.isArray(_0x4518ed) ? _0x4518ed : [];
  const _0x39a164 = new Set();
  const _0x3d66b0 = [];
  _0x196e45.forEach(_0x273131 => {
    const _0xc18e3b = normalizeCameraSlot(_0x273131?.slot);
    if (!_0xc18e3b || _0x39a164.has(_0xc18e3b)) {
      return;
    }
    _0x39a164.add(_0xc18e3b);
    _0x3d66b0.push({
      camera: _0x273131,
      slot: _0xc18e3b
    });
  });
  _0x196e45.forEach(_0x5a3450 => {
    if (_0x3d66b0.some(_0x420047 => _0x420047.camera?.id === _0x5a3450?.id)) {
      return;
    }
    for (let _0x223b8e = 1; _0x223b8e <= 10; _0x223b8e += 1) {
      if (_0x39a164.has(_0x223b8e)) {
        continue;
      }
      _0x39a164.add(_0x223b8e);
      _0x3d66b0.push({
        camera: _0x5a3450,
        slot: _0x223b8e
      });
      break;
    }
  });
  return _0x3d66b0.sort((_0x402b2a, _0x13bac3) => _0x402b2a.slot - _0x13bac3.slot);
}
function lerp(_0x21239f, _0x1975b1, _0x51593c) {
  return _0x21239f + (_0x1975b1 - _0x21239f) * _0x51593c;
}
function smootherstep(_0x47f195) {
  const _0x80c951 = Math.max(0, Math.min(1, Number(_0x47f195) || 0));
  return _0x80c951 * _0x80c951 * _0x80c951 * (_0x80c951 * (_0x80c951 * 6 - 15) + 10);
}
function interpolateVector3(_0x164b6c, _0x43632f, _0xe6cff3) {
  return {
    x: lerp(Number(_0x164b6c?.x) || 0, Number(_0x43632f?.x) || 0, _0xe6cff3),
    y: lerp(Number(_0x164b6c?.y) || 0, Number(_0x43632f?.y) || 0, _0xe6cff3),
    z: lerp(Number(_0x164b6c?.z) || 0, Number(_0x43632f?.z) || 0, _0xe6cff3)
  };
}
function cloneVector3(_0x79b661) {
  return interpolateVector3(_0x79b661, _0x79b661, 1);
}
function quaternionToRotation(_0x30f475) {
  const _0x185b1d = _0x30f475?.clone?.() || new a491_0x1eb6d4.Quaternion();
  const _0x40b041 = new a491_0x1eb6d4.Euler(0, 0, 0, "YXZ").setFromQuaternion(_0x185b1d, "YXZ");
  return {
    x: _0x40b041.x,
    y: _0x40b041.y,
    z: _0x40b041.z
  };
}
function areSceneViewsEquivalent(_0x2d0563, _0xa59e15, _0x23fcbc = 0.00001) {
  if (!_0x2d0563 || !_0xa59e15) {
    return false;
  }
  return Math.abs((Number(_0x2d0563?.target?.x) || 0) - (Number(_0xa59e15?.target?.x) || 0)) <= _0x23fcbc && Math.abs((Number(_0x2d0563?.target?.y) || 0) - (Number(_0xa59e15?.target?.y) || 0)) <= _0x23fcbc && Math.abs((Number(_0x2d0563?.target?.z) || 0) - (Number(_0xa59e15?.target?.z) || 0)) <= _0x23fcbc && Math.abs((Number(_0x2d0563?.orbitYaw) || 0) - (Number(_0xa59e15?.orbitYaw) || 0)) <= _0x23fcbc && Math.abs((Number(_0x2d0563?.orbitPitch) || 0) - (Number(_0xa59e15?.orbitPitch) || 0)) <= _0x23fcbc && Math.abs((Number(_0x2d0563?.orbitDistance) || 0) - (Number(_0xa59e15?.orbitDistance) || 0)) <= _0x23fcbc;
}
const PANORAMA_CAPTURE_MODE_OPTIONS = [{
  key: "adaptive",
  labelKey: "adaptive",
  iconClass: "is-adaptive"
}, {
  key: "9:16",
  labelKey: "vertical",
  ratio: 9 / 16,
  iconClass: "is-9-16"
}, {
  key: "2.35:1",
  labelKey: "cinema",
  ratio: 2.35,
  iconClass: "is-2-35-1"
}];
function normalizeCaptureMode(_0xa6e7f6) {
  if (PANORAMA_CAPTURE_MODE_OPTIONS.some(_0x195583 => _0x195583.key === _0xa6e7f6)) {
    return _0xa6e7f6;
  } else {
    return "adaptive";
  }
}
function getCaptureModeMeta(_0x4b8890) {
  const _0x52bddd = normalizeCaptureMode(_0x4b8890);
  return PANORAMA_CAPTURE_MODE_OPTIONS.find(_0x2a9108 => _0x2a9108.key === _0x52bddd) || PANORAMA_CAPTURE_MODE_OPTIONS[0];
}
function getCaptureModeLabel(_0x1c6c81) {
  const _0x3957e7 = typeof _0x1c6c81 === "string" ? getCaptureModeMeta(_0x1c6c81) : _0x1c6c81;
  const _0x426498 = String(_0x3957e7?.labelKey || "").trim();
  if (_0x426498) {
    return panoramaSceneText("capture.modes." + _0x426498);
  } else {
    return String(_0x3957e7?.key || "");
  }
}
function computeCaptureFrameRect(_0x563dbc, _0x1e16d9, _0x2ff14d) {
  const _0x15f5bd = Math.max(0, Number(_0x563dbc) || 0);
  const _0x810811 = Math.max(0, Number(_0x1e16d9) || 0);
  if (_0x15f5bd <= 0 || _0x810811 <= 0) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
  const _0xe1fd66 = normalizeCaptureMode(_0x2ff14d);
  if (_0xe1fd66 === "adaptive") {
    return {
      x: 0,
      y: 0,
      width: _0x15f5bd,
      height: _0x810811
    };
  }
  const _0x339b98 = getCaptureModeMeta(_0xe1fd66).ratio;
  if (!(_0x339b98 > 0)) {
    return {
      x: 0,
      y: 0,
      width: _0x15f5bd,
      height: _0x810811
    };
  }
  const _0x16aeb6 = _0x15f5bd / _0x810811;
  if (_0x16aeb6 >= _0x339b98) {
    const _0x430354 = _0x810811 * _0x339b98;
    return {
      x: (_0x15f5bd - _0x430354) / 2,
      y: 0,
      width: _0x430354,
      height: _0x810811
    };
  }
  const _0x45a962 = _0x15f5bd / _0x339b98;
  return {
    x: 0,
    y: (_0x810811 - _0x45a962) / 2,
    width: _0x15f5bd,
    height: _0x45a962
  };
}
export function resolveNextPanoramaMouseTool(_0xec7945) {
  if (String(_0xec7945 || "").trim() === "box-select") {
    return "navigate";
  } else {
    return "box-select";
  }
}
async function decodeImageBlob(_0x16bb66) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(_0x16bb66);
  }
  const _0x259c58 = await new Promise((_0x4f16e4, _0x963e4f) => {
    const _0x3e9aab = URL.createObjectURL(_0x16bb66);
    const _0x3a31ba = new Image();
    _0x3a31ba.onload = () => {
      URL.revokeObjectURL(_0x3e9aab);
      _0x4f16e4(_0x3a31ba);
    };
    _0x3a31ba.onerror = _0x3f332f => {
      URL.revokeObjectURL(_0x3e9aab);
      _0x963e4f(_0x3f332f);
    };
    _0x3a31ba.src = _0x3e9aab;
  });
  return _0x259c58;
}
function closeDecodedImage(_0x3fd30d) {
  if (_0x3fd30d && typeof _0x3fd30d.close === "function") {
    _0x3fd30d.close();
  }
}
async function canvasToPngBlob(_0x182330) {
  return new Promise((_0x3484f6, _0x2c0425) => {
    _0x182330.toBlob(_0x54926c => {
      if (_0x54926c) {
        _0x3484f6(_0x54926c);
        return;
      }
      _0x2c0425(new Error(panoramaSceneText("errors.captureCropFailed")));
    }, "image/png");
  });
}
async function cropCaptureBlobToFrame({
  blob: _0x8732e2,
  viewportWidth: _0x2e377a,
  viewportHeight: _0x20fadd,
  mode: _0x9a99f4
}) {
  if (!(_0x8732e2 instanceof Blob)) {
    return null;
  }
  const _0x4bba88 = normalizeCaptureMode(_0x9a99f4);
  if (_0x4bba88 === "adaptive") {
    return _0x8732e2;
  }
  const _0x4ac003 = computeCaptureFrameRect(_0x2e377a, _0x20fadd, _0x4bba88);
  if (_0x4ac003.width <= 0 || _0x4ac003.height <= 0) {
    return _0x8732e2;
  }
  const _0x441c67 = await decodeImageBlob(_0x8732e2);
  try {
    const _0x4381e1 = Number(_0x441c67.width) || Number(_0x441c67.videoWidth) || 0;
    const _0x27249d = Number(_0x441c67.height) || Number(_0x441c67.videoHeight) || 0;
    if (_0x4381e1 <= 0 || _0x27249d <= 0) {
      return _0x8732e2;
    }
    const _0x2bfd07 = _0x4381e1 / Math.max(1, _0x2e377a);
    const _0x3dd226 = _0x27249d / Math.max(1, _0x20fadd);
    const _0x4f6717 = Math.max(0, Math.round(_0x4ac003.x * _0x2bfd07));
    const _0x36bdb1 = Math.max(0, Math.round(_0x4ac003.y * _0x3dd226));
    const _0x5a89a9 = Math.min(_0x4381e1 - _0x4f6717, Math.max(1, Math.round(_0x4ac003.width * _0x2bfd07)));
    const _0x5839c6 = Math.min(_0x27249d - _0x36bdb1, Math.max(1, Math.round(_0x4ac003.height * _0x3dd226)));
    const _0x48c415 = document.createElement("canvas");
    _0x48c415.width = _0x5a89a9;
    _0x48c415.height = _0x5839c6;
    const _0x35bf76 = _0x48c415.getContext("2d");
    if (!_0x35bf76) {
      throw new Error(panoramaSceneText("errors.captureCropFailed"));
    }
    _0x35bf76.drawImage(_0x441c67, _0x4f6717, _0x36bdb1, _0x5a89a9, _0x5839c6, 0, 0, _0x5a89a9, _0x5839c6);
    return canvasToPngBlob(_0x48c415);
  } finally {
    closeDecodedImage(_0x441c67);
  }
}
export class PanoramaSceneNode {
  constructor(_0x1c8d77) {
    this._data = _0x1c8d77;
    this.id = _0x1c8d77.id;
    this._isPanorama360 = String(_0x1c8d77?.type || "").trim() === PANORAMA_360_NODE_TYPE;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component panorama-scene-component";
    this.el.classList.toggle("is-panorama-360", this._isPanorama360);
    this._sceneState = getPanoramaSceneState(_0x1c8d77);
    this._openMenuKey = null;
    this._menuHideTimer = null;
    this._resizeObserver = null;
    this._bridge = null;
    this._interaction = null;
    this._unsubscribeViewport = null;
    this._unsubscribeSelection = null;
    this._unsubscribePanoramaIncomingSync = null;
    this._isSelected = false;
    this._isNodeHovered = false;
    this._isUnmounted = false;
    this._contextMenuTarget = null;
    this._cameraJumpRaf = 0;
    this._cameraJumpToken = 0;
    this._pendingCameraJumpCommit = null;
    this._pendingCameraJumpReleaseRaf = 0;
    this._timelinePlaybackRaf = 0;
    this._timelinePlaybackStartedAt = 0;
    this._timelinePlaybackStartTime = 0;
    this._timelinePreviewTime = 0;
    this._isTimelinePlaying = false;
    this._hasRequestedCharacterPreload = false;
    this._defaultSceneFocalLength = SCENE_DEFAULT_FOCAL_LENGTH_MM;
    this._browserFullscreenOverlayEl = null;
    this._browserFullscreenAnchorEl = null;
    this._browserFullscreenExitBtnEl = null;
    this._unsubscribeLocale = null;
    this._handleToolbarClick = this._handleToolbarClick.bind(this);
    this._handleFileInputChange = this._handleFileInputChange.bind(this);
    this._handleViewportPointerDown = this._handleViewportPointerDown.bind(this);
    this._handleViewportContextMenu = this._handleViewportContextMenu.bind(this);
    this._handleGlobalPointerDown = this._handleGlobalPointerDown.bind(this);
    this._handleViewportDoubleClick = this._handleViewportDoubleClick.bind(this);
    this._handleNodePointerEnter = this._handleNodePointerEnter.bind(this);
    this._handleNodePointerLeave = this._handleNodePointerLeave.bind(this);
    this._handleBottomToolbarPointerEnter = this._handleBottomToolbarPointerEnter.bind(this);
    this._handleBottomToolbarPointerLeave = this._handleBottomToolbarPointerLeave.bind(this);
    this._handleCaptureMenuClick = this._handleCaptureMenuClick.bind(this);
    this._handleWindowResize = this._handleWindowResize.bind(this);
    this._handleShortcutsUpdated = this._handleShortcutsUpdated.bind(this);
    this._handleCameraShortcutEvent = this._handleCameraShortcutEvent.bind(this);
    this._handleCaptureShortcutEvent = this._handleCaptureShortcutEvent.bind(this);
    this._handleWindowKeyDown = this._handleWindowKeyDown.bind(this);
    this._handleWindowKeyUp = this._handleWindowKeyUp.bind(this);
    this._handleWindowBlur = this._handleWindowBlur.bind(this);
  }
  mount() {
    this._isUnmounted = false;
    Object.assign(this.el.style, {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "visible",
      pointerEvents: "auto",
      cursor: "default",
      position: "relative"
    });
    this._shellEl = document.createElement("div");
    this._shellEl.className = "panorama-scene-shell";
    this._viewportEl = document.createElement("div");
    this._viewportEl.className = "panorama-scene-viewport";
    this._viewportEl.dataset.sceneInteraction = "panorama";
    this._viewportEl.tabIndex = 0;
    this._viewportEl.addEventListener("pointerdown", this._handleViewportPointerDown);
    this._viewportEl.addEventListener("contextmenu", this._handleViewportContextMenu);
    this._viewportEl.addEventListener("dblclick", this._handleViewportDoubleClick);
    this._overlayEl = document.createElement("div");
    this._overlayEl.className = "panorama-scene-overlay";
    this._infoDockEl = document.createElement("div");
    this._infoDockEl.className = "panorama-scene-fixed-info-dock";
    this._infoDockEl.style.transform = "none";
    this._sceneToolbarEl = createElementFromHtml(PANORAMA_SCENE_TOOLBAR_HTML);
    removeConfiguredToolbarActions(this._sceneToolbarEl, this._data?.panoramaToolbar?.hiddenActions);
    this._sceneToolbarEl.addEventListener("click", this._handleToolbarClick);
    attachUiStop(this._sceneToolbarEl);
    const _0x514772 = this._isPanorama360 ? PANORAMA_360_MODE_TOOLBAR_HTML : PANORAMA_SCENE_MODE_TOOLBAR_HTML;
    this._editToolbarEl = createElementFromHtml(_0x514772);
    removeConfiguredToolbarActions(this._editToolbarEl, this._data?.panoramaToolbar?.hiddenActions);
    this._editToolbarEl.addEventListener("click", this._handleToolbarClick);
    attachUiStop(this._editToolbarEl);
    this._cornerToolbarEl = createElementFromHtml(PANORAMA_SCENE_CORNER_TOOLBAR_HTML);
    this._cornerToolbarEl.addEventListener("click", this._handleToolbarClick);
    attachUiStop(this._cornerToolbarEl);
    this._bottomToolbarEl = createElementFromHtml(PANORAMA_SCENE_BOTTOM_TOOLBAR_HTML);
    this._bottomToolbarEl.addEventListener("click", this._handleToolbarClick);
    this._bottomToolbarEl.addEventListener("pointerover", this._handleBottomToolbarPointerEnter);
    this._bottomToolbarEl.addEventListener("pointerout", this._handleBottomToolbarPointerLeave);
    attachUiStop(this._bottomToolbarEl);
    this._bottomToolbarAnchorEl = document.createElement("div");
    this._bottomToolbarAnchorEl.className = "panorama-scene-bottom-toolbar-anchor";
    this._bottomToolbarAnchorEl.appendChild(this._bottomToolbarEl);
    this._bottomToolbarPopoverLayerEl = document.createElement("div");
    this._bottomToolbarPopoverLayerEl.className = "panorama-scene-bottom-toolbar-popovers";
    this._bottomToolbarEl.appendChild(this._bottomToolbarPopoverLayerEl);
    this._cameraListEl = createCameraPresetList();
    attachUiStop(this._cameraListEl);
    this._cameraListEl.addEventListener("mouseenter", () => this._openMenu("camera"));
    this._cameraListEl.addEventListener("mouseleave", () => this._scheduleMenuHide("camera"));
    this._mannequinMenuEl = createMannequinQuickMenu({
      onSelectGender: ({
        gender: _0x5184b0
      }) => {
        setPanoramaSceneGridPlacement({
          nodeId: this.id,
          patch: {
            gender: _0x5184b0 === "female" ? "female" : "male"
          }
        });
      },
      onSelectColor: ({
        colorKey: _0x161da4,
        gender: _0xe39c48
      }) => {
        const _0x8a847c = _0xe39c48 === "female" ? "female" : "male";
        this._selectNodeOnCanvas();
        setPanoramaSceneGridPlacement({
          nodeId: this.id,
          patch: {
            colorKey: _0x161da4,
            gender: _0x8a847c
          }
        });
        addPanoramaSceneMannequin({
          nodeId: this.id,
          gender: _0x8a847c,
          colorKey: _0x161da4,
          viewPose: this._bridge?.readCurrentViewPose?.()
        });
        this._closeMenus();
      }
    });
    attachUiStop(this._mannequinMenuEl);
    this._mannequinMenuEl.addEventListener("mouseenter", () => this._openMenu("mannequin"));
    this._mannequinMenuEl.addEventListener("mouseleave", () => this._scheduleMenuHide("mannequin"));
    this._assetBrowserEl = createSceneAssetBrowser({
      onSelect: _0x1c900c => {
        this._selectNodeOnCanvas();
        addPanoramaSceneCube({
          nodeId: this.id,
          assetId: _0x1c900c,
          viewPose: this._bridge?.readCurrentViewPose?.()
        });
        this._closeMenus();
      }
    });
    attachUiStop(this._assetBrowserEl, {
      wheel: true
    });
    this._assetBrowserEl.addEventListener("mouseenter", () => this._openMenu("assets"));
    this._assetBrowserEl.addEventListener("mouseleave", () => this._scheduleMenuHide("assets"));
    const _0x4400c3 = () => this._sceneState?.selection?.selectedObjectType === "mannequin" ? this._sceneState.selection.selectedObjectId : null;
    this._posePanelEl = createMannequinPosePanel({
      onApplyPreset: _0x429a5a => {
        const _0xd56542 = _0x4400c3();
        if (!_0xd56542) {
          return;
        }
        applyPanoramaSceneMannequinPose({
          nodeId: this.id,
          mannequinId: _0xd56542,
          poseId: _0x429a5a
        });
        this._bridge?.clearDraftMannequinBonePose?.(_0xd56542);
      },
      onPreview: _0x53f557 => {
        const _0xdba18e = _0x4400c3();
        if (!_0xdba18e) {
          return;
        }
        this._bridge?.setDraftMannequinBonePose?.(_0xdba18e, _0x53f557);
      },
      onCommit: _0x15174f => {
        const _0x29468f = _0x4400c3();
        if (!_0x29468f) {
          return;
        }
        applyPanoramaSceneMannequinPose({
          nodeId: this.id,
          mannequinId: _0x29468f,
          poseId: "custom",
          bonePose: _0x15174f
        });
        this._bridge?.clearDraftMannequinBonePose?.(_0x29468f);
      },
      onSaveCustom: _0x1908fb => {
        const _0x18bd0b = _0x4400c3();
        if (!_0x18bd0b) {
          return;
        }
        applyPanoramaSceneMannequinPose({
          nodeId: this.id,
          mannequinId: _0x18bd0b,
          poseId: "custom",
          customPose: {
            ..._0x1908fb,
            id: "custom-pose-" + Date.now()
          }
        });
        this._bridge?.clearDraftMannequinBonePose?.(_0x18bd0b);
      }
    });
    attachUiStop(this._posePanelEl, {
      wheel: true
    });
    this._posePanelEl.addEventListener("mouseenter", () => this._openMenu("pose"));
    this._posePanelEl.addEventListener("mouseleave", () => this._scheduleMenuHide("pose"));
    this._timelinePanelEl = createCameraTimelinePanel({
      onAddKeyframe: _0x57c9b1 => {
        addPanoramaSceneCameraKeyframe({
          nodeId: this.id,
          keyframe: {
            time: _0x57c9b1
          },
          viewPose: this._bridge?.readCurrentViewPose?.()
        });
      },
      onPlayToggle: () => this._toggleCameraTimelinePlayback(),
      onScrub: _0x1bbb08 => this._previewCameraTimelineAt(_0x1bbb08),
      onScrubCommit: _0x3604c8 => {
        this._timelinePreviewTime = _0x3604c8;
        updatePanoramaSceneCameraTimeline({
          nodeId: this.id,
          patch: {
            currentTime: _0x3604c8
          }
        });
      },
      onDeleteKeyframe: _0x58a08f => {
        deletePanoramaSceneCameraKeyframe({
          nodeId: this.id,
          keyframeId: _0x58a08f
        });
      },
      onSettingsChange: _0xe5e27 => {
        updatePanoramaSceneCameraTimeline({
          nodeId: this.id,
          patch: _0xe5e27
        });
      }
    });
    attachUiStop(this._timelinePanelEl, {
      wheel: true
    });
    this._gridPanelEl = this._createGridPanel();
    attachUiStop(this._gridPanelEl, {
      wheel: true
    });
    this._gridPanelEl.addEventListener("mouseenter", () => this._openMenu("grid"));
    this._gridPanelEl.addEventListener("mouseleave", () => this._scheduleMenuHide("grid"));
    this._captureMenuEl = this._createCaptureMenu();
    attachUiStop(this._captureMenuEl);
    this._captureMenuEl.addEventListener("mouseenter", () => this._openMenu("capture"));
    this._captureMenuEl.addEventListener("mouseleave", () => this._scheduleMenuHide("capture"));
    this._captureMenuEl.addEventListener("click", this._handleCaptureMenuClick);
    this._focusMenuEl = this._createFocusMenu();
    attachUiStop(this._focusMenuEl, {
      wheel: true
    });
    this._focusMenuEl.addEventListener("mouseenter", () => this._openMenu("focus"));
    this._focusMenuEl.addEventListener("mouseleave", () => this._scheduleMenuHide("focus"));
    this._statusEl = document.createElement("div");
    this._statusEl.className = "panorama-scene-fixed-status";
    this._statusEl.style.transform = "none";
    this._statusContentEl = document.createElement("div");
    this._statusContentEl.className = "panorama-scene-fixed-status__content";
    this._statusEl.appendChild(this._statusContentEl);
    attachUiStop(this._statusEl);
    this._errorEl = document.createElement("div");
    this._errorEl.className = "panorama-scene-error";
    attachUiStop(this._errorEl);
    this._hintEl = document.createElement("div");
    this._hintEl.className = "panorama-scene-fixed-hint";
    this._hintEl.style.transform = "none";
    this._hintContentEl = document.createElement("div");
    this._hintContentEl.className = "panorama-scene-fixed-hint__content";
    this._hintEl.appendChild(this._hintContentEl);
    attachUiStop(this._hintEl);
    this._contextMenuEl = document.createElement("div");
    this._contextMenuEl.className = "panorama-scene-object-menu";
    this._contextMenuEl.hidden = true;
    this._contextMenuEl.innerHTML = "\n      <button type=\"button\" class=\"panorama-scene-object-menu__item act-delete-selected\">" + panoramaSceneText("contextMenu.deleteObject") + "</button>\n    ";
    attachUiStop(this._contextMenuEl);
    this._contextMenuEl.querySelector(".act-delete-selected")?.addEventListener("click", () => {
      if (this._contextMenuTarget?.type === "camera" && this._contextMenuTarget?.cameraId) {
        deletePanoramaSceneCamera({
          nodeId: this.id,
          cameraId: this._contextMenuTarget.cameraId
        });
      } else {
        deleteSelectedPanoramaSceneObject({
          nodeId: this.id
        });
      }
      this._closeObjectContextMenu();
    });
    this._captureSafeFrameEl = document.createElement("div");
    this._captureSafeFrameEl.className = "panorama-scene-capture-safe-frame";
    this._captureSafeFrameEl.hidden = true;
    this._captureSafeFrameLabelEl = document.createElement("div");
    this._captureSafeFrameLabelEl.className = "panorama-scene-capture-safe-frame__label";
    this._captureSafeFrameEl.appendChild(this._captureSafeFrameLabelEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._captureMenuEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._cameraListEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._focusMenuEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._mannequinMenuEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._assetBrowserEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._posePanelEl);
    this._bottomToolbarPopoverLayerEl.appendChild(this._gridPanelEl);
    this._overlayEl.appendChild(this._captureSafeFrameEl);
    this._overlayEl.appendChild(this._timelinePanelEl);
    this._overlayEl.appendChild(this._contextMenuEl);
    this._overlayEl.appendChild(this._errorEl);
    this._infoDockEl.appendChild(this._hintEl);
    this._infoDockEl.appendChild(this._statusEl);
    this._shellEl.appendChild(this._viewportEl);
    this._shellEl.appendChild(this._overlayEl);
    this._shellEl.appendChild(this._cornerToolbarEl);
    this._shellEl.appendChild(this._infoDockEl);
    this._shellEl.appendChild(this._bottomToolbarAnchorEl);
    this.el.appendChild(this._sceneToolbarEl);
    this.el.appendChild(this._editToolbarEl);
    this._browserFullscreenAnchorEl = document.createElement("div");
    this._browserFullscreenAnchorEl.className = "panorama-scene-browser-fullscreen-anchor";
    this._browserFullscreenAnchorEl.hidden = true;
    this.el.appendChild(this._browserFullscreenAnchorEl);
    this.el.appendChild(this._shellEl);
    this.el.addEventListener("pointerenter", this._handleNodePointerEnter);
    this.el.addEventListener("pointerleave", this._handleNodePointerLeave);
    this._fileInput = document.createElement("input");
    this._fileInput.className = "panorama-scene-file-input";
    this._fileInput.type = "file";
    this._fileInput.accept = "image/*";
    this._fileInput.style.display = "none";
    this._fileInput.addEventListener("change", this._handleFileInputChange);
    this.el.appendChild(this._fileInput);
    this._bridge = new PanoramaScene3DBridge({
      container: this._viewportEl,
      onPanoramaStatusChange: ({
        isLoaded: _0x5a8f53,
        error: _0xc4ea1
      }) => {
        updatePanoramaSceneLoadState({
          nodeId: this.id,
          isLoaded: _0x5a8f53,
          error: _0xc4ea1
        });
      }
    });
    this._bridge.setDefaultSceneFocalLength?.(this._defaultSceneFocalLength);
    this._interaction = new PanoramaSceneInteraction({
      viewportEl: this._viewportEl,
      overlayEl: this._overlayEl,
      bridge: this._bridge,
      getSceneState: () => getPanoramaSceneState(a491_0x284028.getStateRaw().nodes[this.id]),
      onViewCommit: _0x305cc3 => {
        applyPanoramaSceneViewCommit({
          nodeId: this.id,
          ..._0x305cc3
        });
      },
      onObjectCommit: ({
        objectType: _0x1fbd54,
        objectId: _0x58a9e7,
        pose: _0x577561
      }) => {
        updatePanoramaSceneObjectTransform({
          nodeId: this.id,
          objectType: _0x1fbd54,
          objectId: _0x58a9e7,
          pose: _0x577561
        });
      },
      onSelectionChange: (_0x1ed319, _0x10f594) => {
        this._selectNodeOnCanvas();
        setPanoramaSceneSelection({
          nodeId: this.id,
          objectType: _0x1ed319,
          objectId: _0x10f594
        });
      },
      onSelectionBatchChange: (_0xf7362e, _0x2314d3, _0x5c0be0 = null) => {
        this._selectNodeOnCanvas();
        setPanoramaSceneSelectionBatch({
          nodeId: this.id,
          objectType: _0xf7362e,
          objectIds: _0x2314d3,
          groupId: _0x5c0be0
        });
      },
      onSelectionObjectsChange: (_0x5a88d2, _0x475059 = {}) => {
        this._selectNodeOnCanvas();
        setPanoramaSceneSelectionObjects({
          nodeId: this.id,
          objects: _0x5a88d2,
          activeObjectType: _0x475059.activeObjectType || null,
          activeObjectId: _0x475059.activeObjectId || null,
          groupId: _0x475059.groupId || null
        });
      },
      onSelectionClear: () => {
        clearPanoramaSceneSelection({
          nodeId: this.id
        });
      },
      onObjectBatchCommit: ({
        targets: _0x4ddf4d
      }) => {
        updatePanoramaSceneObjectTransform({
          nodeId: this.id,
          targets: _0x4ddf4d
        });
      }
    });
    this._interaction.attach();
    this._resizeObserver = new ResizeObserver(_0x4dc8cf => {
      const _0x2977b7 = _0x4dc8cf?.[0]?.contentRect;
      this._bridge?.resize(_0x2977b7?.width, _0x2977b7?.height);
      this._positionMenus();
    });
    this._resizeObserver.observe(this._viewportEl);
    this._unsubscribeSelection = a491_0x284028.subscribeSelector(_0x32e248 => {
      const _0x149d23 = Array.isArray(_0x32e248.selectedNodeIds) ? _0x32e248.selectedNodeIds : [];
      return _0x149d23.includes(this.id);
    }, _0x2e530e => {
      const _0x41b83d = this._isSelected === true;
      const _0x47b45a = _0x2e530e === true;
      this._isSelected = _0x47b45a;
      if (_0x41b83d && !_0x47b45a && this._sceneState?.ui?.isEditing === true) {
        this._exitEditing();
      }
      this._syncAttachedUiVisibility(this._shouldShowBottomToolbar());
    });
    this._unsubscribeViewport = a491_0x284028.subscribeSelector(_0x2d50a6 => {
      const _0x3aa880 = _0x2d50a6.viewport || {
        x: 0,
        y: 0,
        zoom: 1
      };
      return (_0x3aa880.x || 0) + "|" + (_0x3aa880.y || 0) + "|" + (_0x3aa880.zoom || 1);
    }, () => {
      this._positionMenus();
    });
    if (this._isPanorama360) {
      this._unsubscribePanoramaIncomingSync = a491_0x284028.subscribeSelector(_0x512601 => this._buildPanorama360IncomingImageSignature(_0x512601), () => {
        syncPanorama360FromIncomingImageEdge({
          nodeId: this.id
        });
      });
    }
    window.addEventListener("resize", this._handleWindowResize);
    window.addEventListener("pointerdown", this._handleGlobalPointerDown, true);
    window.addEventListener("keydown", this._handleWindowKeyDown, true);
    window.addEventListener("keyup", this._handleWindowKeyUp, true);
    window.addEventListener("blur", this._handleWindowBlur);
    window.addEventListener("shortcuts-updated", this._handleShortcutsUpdated);
    window.addEventListener("panorama-scene:camera-shortcut", this._handleCameraShortcutEvent);
    window.addEventListener("panorama-scene:capture-shortcut", this._handleCaptureShortcutEvent);
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    this.update(this._data);
    if (this._isPanorama360) {
      syncPanorama360FromIncomingImageEdge({
        nodeId: this.id
      });
    }
    return this.el;
  }
  _handleShortcutsUpdated() {
    this._syncToolbarState();
  }
  _resolveCameraBySlot(_0x6c751e) {
    const _0x285ec7 = normalizeCameraSlot(_0x6c751e);
    if (!_0x285ec7) {
      return null;
    }
    const _0x3bffc8 = resolveCameraSlotEntries(this._sceneState?.cameras || []);
    const _0x25dfda = _0x3bffc8.find(_0x182dd1 => _0x182dd1.slot === _0x285ec7);
    if (_0x25dfda) {
      return {
        ..._0x25dfda
      };
    } else {
      return null;
    }
  }
  _cancelCameraJumpAnimation({
    clearDraft = true
  } = {}) {
    this._cameraJumpToken += 1;
    if (this._cameraJumpRaf) {
      cancelAnimationFrame(this._cameraJumpRaf);
      this._cameraJumpRaf = 0;
    }
    if (this._pendingCameraJumpReleaseRaf) {
      cancelAnimationFrame(this._pendingCameraJumpReleaseRaf);
      this._pendingCameraJumpReleaseRaf = 0;
    }
    this._pendingCameraJumpCommit = null;
    if (clearDraft) {
      this._bridge?.clearDraftView?.();
    }
  }
  _setDefaultSceneFocalLength(_0x5ccf88) {
    const _0x4e2378 = Math.max(SCENE_FOCAL_LENGTH_MIN_MM, Math.min(SCENE_FOCAL_LENGTH_MAX_MM, Number(_0x5ccf88) || SCENE_DEFAULT_FOCAL_LENGTH_MM));
    this._defaultSceneFocalLength = _0x4e2378;
    this._bridge?.setDefaultSceneFocalLength?.(_0x4e2378);
  }
  _getDefaultSceneFocalLength() {
    return this._bridge?.getDefaultSceneFocalLength?.() || this._defaultSceneFocalLength || SCENE_DEFAULT_FOCAL_LENGTH_MM;
  }
  _isDefaultSceneView(_0xefba74) {
    const _0x38fc77 = createDefaultSceneView();
    return Math.abs((Number(_0xefba74?.target?.x) || 0) - _0x38fc77.target.x) < 1e-9 && Math.abs((Number(_0xefba74?.target?.y) || 0) - _0x38fc77.target.y) < 1e-9 && Math.abs((Number(_0xefba74?.target?.z) || 0) - _0x38fc77.target.z) < 1e-9 && Math.abs((Number(_0xefba74?.orbitYaw) || 0) - _0x38fc77.orbitYaw) < 1e-9 && Math.abs((Number(_0xefba74?.orbitPitch) || 0) - _0x38fc77.orbitPitch) < 1e-9 && Math.abs((Number(_0xefba74?.orbitDistance) || 0) - _0x38fc77.orbitDistance) < 1e-9;
  }
  _maybeReleasePendingCameraJumpDraft() {
    const _0x5576d4 = this._pendingCameraJumpCommit;
    if (!_0x5576d4 || this._pendingCameraJumpReleaseRaf) {
      return;
    }
    const _0x45fbc1 = this._sceneState?.viewport?.sceneView || null;
    const _0x2f536f = this._getDefaultSceneFocalLength();
    if (!areSceneViewsEquivalent(_0x45fbc1, _0x5576d4.targetSceneView)) {
      return;
    }
    if (Math.abs(_0x2f536f - _0x5576d4.targetFocalLength) > 0.000001) {
      return;
    }
    const _0x1c7ebd = _0x5576d4.token;
    this._pendingCameraJumpReleaseRaf = requestAnimationFrame(() => {
      this._pendingCameraJumpReleaseRaf = 0;
      const _0x596052 = this._pendingCameraJumpCommit;
      if (!_0x596052 || _0x596052.token !== _0x1c7ebd) {
        return;
      }
      const _0x552283 = this._sceneState?.viewport?.sceneView || null;
      const _0x34f86f = this._getDefaultSceneFocalLength();
      if (!areSceneViewsEquivalent(_0x552283, _0x596052.targetSceneView)) {
        return;
      }
      if (Math.abs(_0x34f86f - _0x596052.targetFocalLength) > 0.000001) {
        return;
      }
      this._pendingCameraJumpCommit = null;
      this._bridge?.clearDraftView?.();
    });
  }
  _maybePreloadCharacterModels(_0xde9524 = null) {
    if (this._isPanorama360) {
      return;
    }
    if (this._hasRequestedCharacterPreload) {
      return;
    }
    const _0x293794 = this._sceneState?.ui?.isEditing === true;
    const _0x39000e = _0xde9524?.ui?.isEditing === true;
    if (!_0x293794 || _0x39000e) {
      return;
    }
    this._hasRequestedCharacterPreload = true;
    preloadPanoramaCharacterModels().catch(() => {});
  }
  _commitCameraJumpTarget({
    targetPose: _0xb041b7,
    referenceSceneView: _0x49381a,
    targetFocalLength: _0x5d8410
  }) {
    const _0x230202 = cameraPoseToSceneViewFromReference(_0xb041b7, _0x49381a);
    this._pendingCameraJumpCommit = {
      token: this._cameraJumpToken,
      targetSceneView: _0x230202,
      targetFocalLength: _0x5d8410
    };
    this._setDefaultSceneFocalLength(_0x5d8410);
    applyPanoramaSceneViewCommit({
      nodeId: this.id,
      sceneView: _0x230202,
      activeView: "default",
      activeCameraId: null
    });
    return _0x230202;
  }
  _animateCameraActivation(_0x2bc8a3) {
    if (!this._supportsCameraFeatures()) {
      return;
    }
    const _0xd72d89 = (this._sceneState?.cameras || []).find(_0x450079 => _0x450079.id === _0x2bc8a3) || null;
    if (!_0xd72d89 || this._sceneState?.mode !== "scene") {
      return;
    }
    const _0x58c553 = _0x2e5375 => {
      const _0xe07606 = _0x2e5375?.quaternion;
      if (Number.isFinite(Number(_0xe07606?.x)) && Number.isFinite(Number(_0xe07606?.y)) && Number.isFinite(Number(_0xe07606?.z)) && Number.isFinite(Number(_0xe07606?.w))) {
        return new a491_0x1eb6d4.Quaternion(Number(_0xe07606.x), Number(_0xe07606.y), Number(_0xe07606.z), Number(_0xe07606.w)).normalize();
      }
      const _0x660674 = _0x2e5375?.rotation || {
        x: 0,
        y: 0,
        z: 0
      };
      return new a491_0x1eb6d4.Quaternion().setFromEuler(new a491_0x1eb6d4.Euler(Number(_0x660674.x) || 0, Number(_0x660674.y) || 0, Number(_0x660674.z) || 0, "YXZ"));
    };
    const _0x3b6a1a = _0x58c553(_0xd72d89);
    const _0x357a60 = this._sceneState?.viewport?.sceneView || createDefaultSceneView();
    const _0x2b8fba = {
      kind: "camera",
      position: cloneVector3(_0xd72d89.position),
      quaternion: {
        x: _0x3b6a1a.x,
        y: _0x3b6a1a.y,
        z: _0x3b6a1a.z,
        w: _0x3b6a1a.w
      },
      rotation: _0xd72d89.rotation || quaternionToRotation(_0x3b6a1a)
    };
    const _0x49f1fa = Number.isFinite(Number(_0xd72d89?.focalLength)) ? Number(_0xd72d89.focalLength) : SCENE_DEFAULT_FOCAL_LENGTH_MM;
    const _0x110d2a = focalLengthToFov(_0x49f1fa);
    _0x2b8fba.fov = _0x110d2a;
    this._cancelCameraJumpAnimation({
      clearDraft: false
    });
    const _0x5e9832 = this._bridge?.readCurrentViewPose?.();
    if (!_0x5e9832?.position) {
      this._commitCameraJumpTarget({
        targetPose: _0x2b8fba,
        referenceSceneView: _0x357a60,
        targetFocalLength: _0x49f1fa
      });
      return;
    }
    const _0x1dc078 = this._cameraJumpToken;
    const _0x4c829c = _0x58c553(_0x5e9832);
    const _0xd58ec2 = {
      kind: "camera",
      position: cloneVector3(_0x5e9832.position),
      quaternion: {
        x: _0x4c829c.x,
        y: _0x4c829c.y,
        z: _0x4c829c.z,
        w: _0x4c829c.w
      },
      rotation: _0x5e9832.rotation || quaternionToRotation(_0x4c829c),
      fov: Number.isFinite(Number(_0x5e9832.fov)) ? Number(_0x5e9832.fov) : 58
    };
    const _0x2aa17f = 450;
    const _0x1d9fc3 = performance.now();
    const _0x146430 = _0x158fde => {
      const _0x1b600c = interpolateVector3(_0xd58ec2.position, _0x2b8fba.position, _0x158fde);
      const _0x68142d = new a491_0x1eb6d4.Quaternion(_0xd58ec2.quaternion.x, _0xd58ec2.quaternion.y, _0xd58ec2.quaternion.z, _0xd58ec2.quaternion.w).slerp(new a491_0x1eb6d4.Quaternion(_0x2b8fba.quaternion.x, _0x2b8fba.quaternion.y, _0x2b8fba.quaternion.z, _0x2b8fba.quaternion.w), _0x158fde);
      const _0x425fbf = lerp(_0xd58ec2.fov, _0x2b8fba.fov, _0x158fde);
      this._bridge?.setDraftView?.({
        kind: "camera",
        position: _0x1b600c,
        quaternion: {
          x: _0x68142d.x,
          y: _0x68142d.y,
          z: _0x68142d.z,
          w: _0x68142d.w
        },
        rotation: quaternionToRotation(_0x68142d),
        fov: _0x425fbf,
        disableSmoothing: true
      });
    };
    _0x146430(0);
    const _0x2b5d26 = _0xdd14b => {
      if (_0x1dc078 !== this._cameraJumpToken) {
        return;
      }
      const _0x551bbc = Math.max(0, _0xdd14b - _0x1d9fc3);
      const _0x35b9fa = Math.min(1, _0x551bbc / _0x2aa17f);
      const _0x18d185 = smootherstep(_0x35b9fa);
      _0x146430(_0x18d185);
      if (_0x35b9fa < 1) {
        this._cameraJumpRaf = requestAnimationFrame(_0x2b5d26);
        return;
      }
      this._cameraJumpRaf = 0;
      this._commitCameraJumpTarget({
        targetPose: _0x2b8fba,
        referenceSceneView: _0x357a60,
        targetFocalLength: _0x49f1fa
      });
      this._maybeReleasePendingCameraJumpDraft();
    };
    this._cameraJumpRaf = requestAnimationFrame(_0x2b5d26);
  }
  _saveCurrentViewToCameraSlot(_0x3fa681) {
    if (!this._supportsCameraFeatures()) {
      return;
    }
    const _0x5a009d = this._bridge?.readCurrentViewPose?.();
    if (!_0x5a009d) {
      return;
    }
    upsertPanoramaSceneCameraAtSlot({
      nodeId: this.id,
      slot: _0x3fa681,
      viewPose: _0x5a009d
    });
  }
  _previewCameraTimelineAt(_0x3ef219, {
    fromPlayback = false
  } = {}) {
    if (!fromPlayback) {
      this._stopCameraTimelinePlayback({
        clearDraft: false
      });
    }
    const _0x1bbd0f = normalizeCameraTimeline(this._sceneState?.cameraTimeline);
    const _0x417d28 = sampleCameraTimeline(_0x1bbd0f, _0x3ef219);
    if (!_0x417d28) {
      return;
    }
    const _0x362e67 = cameraTimelineSampleToDraft(_0x417d28);
    if (!_0x362e67) {
      return;
    }
    this._timelinePreviewTime = _0x417d28.time;
    this._bridge?.setDraftView?.(_0x362e67);
    setCameraTimelineDisplayTime(this._timelinePanelEl, _0x417d28.time);
  }
  _stopCameraTimelinePlayback({
    clearDraft = false
  } = {}) {
    if (this._timelinePlaybackRaf) {
      cancelAnimationFrame(this._timelinePlaybackRaf);
      this._timelinePlaybackRaf = 0;
    }
    this._isTimelinePlaying = false;
    if (clearDraft) {
      this._bridge?.clearDraftView?.();
    }
    renderCameraTimelinePanel(this._timelinePanelEl, this._sceneState?.cameraTimeline, {
      currentTime: this._timelinePreviewTime,
      isPlaying: false
    });
  }
  _toggleCameraTimelinePlayback() {
    if (this._isTimelinePlaying) {
      this._stopCameraTimelinePlayback({
        clearDraft: false
      });
      return;
    }
    const _0x4243dc = normalizeCameraTimeline(this._sceneState?.cameraTimeline);
    if (_0x4243dc.keyframes.length < 2) {
      return;
    }
    this._isTimelinePlaying = true;
    this._timelinePlaybackStartTime = this._timelinePreviewTime >= _0x4243dc.duration ? 0 : this._timelinePreviewTime || _0x4243dc.currentTime;
    this._timelinePlaybackStartedAt = performance.now();
    const _0xc332fa = _0x1964e4 => {
      if (!this._isTimelinePlaying) {
        return;
      }
      const _0x4c57c1 = normalizeCameraTimeline(this._sceneState?.cameraTimeline);
      const _0x38535f = (_0x1964e4 - this._timelinePlaybackStartedAt) / 1000;
      let _0x2a0cb7 = this._timelinePlaybackStartTime + _0x38535f;
      if (_0x4c57c1.loop && _0x4c57c1.duration > 0) {
        _0x2a0cb7 %= _0x4c57c1.duration;
      } else if (_0x2a0cb7 >= _0x4c57c1.duration) {
        this._previewCameraTimelineAt(_0x4c57c1.duration, {
          fromPlayback: true
        });
        this._stopCameraTimelinePlayback({
          clearDraft: false
        });
        return;
      }
      this._previewCameraTimelineAt(_0x2a0cb7, {
        fromPlayback: true
      });
      this._timelinePlaybackRaf = requestAnimationFrame(_0xc332fa);
    };
    renderCameraTimelinePanel(this._timelinePanelEl, _0x4243dc, {
      currentTime: this._timelinePreviewTime,
      isPlaying: true
    });
    this._timelinePlaybackRaf = requestAnimationFrame(_0xc332fa);
  }
  _handleCameraShortcutEvent(_0x4d730b) {
    if (!this._supportsCameraFeatures()) {
      return;
    }
    const _0x43b593 = _0x4d730b?.detail || {};
    if (_0x43b593.nodeId !== this.id) {
      return;
    }
    if (!this._isEditing()) {
      return;
    }
    const _0x1d78d1 = normalizeCameraSlot(_0x43b593.slot);
    if (!_0x1d78d1) {
      return;
    }
    if (_0x43b593.mode === "save") {
      this._saveCurrentViewToCameraSlot(_0x1d78d1);
      return;
    }
    const _0x3ec6fa = this._resolveCameraBySlot(_0x1d78d1);
    if (!_0x3ec6fa?.camera?.id) {
      return;
    }
    this._animateCameraActivation(_0x3ec6fa.camera.id);
  }
  _handleCaptureShortcutEvent(_0x195092) {
    const _0x4fc9dd = _0x195092?.detail || {};
    if (_0x4fc9dd.nodeId !== this.id) {
      return;
    }
    if (!this._isEditing()) {
      return;
    }
    this._handleToolbarAction("capture");
  }
  _createCaptureMenu() {
    const _0x579ca4 = document.createElement("div");
    _0x579ca4.className = "panorama-capture-menu";
    _0x579ca4.hidden = true;
    _0x579ca4.innerHTML = "\n      <div class=\"panorama-capture-menu__grid\">\n        " + PANORAMA_CAPTURE_MODE_OPTIONS.map(_0x15dc75 => {
      const _0x53f8ba = getCaptureModeLabel(_0x15dc75);
      return "\n            <button\n              type=\"button\"\n              class=\"panorama-capture-menu__item\"\n              data-capture-mode=\"" + _0x15dc75.key + "\"\n              aria-label=\"" + panoramaSceneText("capture.modeAria", {
        label: _0x53f8ba
      }) + "\"\n            >\n              <span class=\"panorama-capture-menu__icon " + _0x15dc75.iconClass + "\" aria-hidden=\"true\">\n                <span class=\"panorama-capture-menu__icon-shape\"></span>\n              </span>\n              <span class=\"panorama-capture-menu__label\">" + _0x53f8ba + "</span>\n            </button>\n          ";
    }).join("") + "\n      </div>\n    ";
    return _0x579ca4;
  }
  _handleCaptureMenuClick(_0x312431) {
    const _0x36e987 = _0x312431.target?.closest?.("[data-capture-mode]");
    if (!(_0x36e987 instanceof HTMLButtonElement)) {
      return;
    }
    const _0x5edd52 = _0x36e987.dataset.captureMode || "adaptive";
    this._selectNodeOnCanvas();
    setPanoramaSceneCaptureMode({
      nodeId: this.id,
      mode: _0x5edd52,
      showSafeFrame: _0x5edd52 !== "adaptive"
    });
  }
  _createFocusMenu() {
    const _0x30e1c2 = document.createElement("div");
    _0x30e1c2.className = "panorama-scene-focus-menu";
    _0x30e1c2.hidden = true;
    const _0x2a852c = document.createElement("div");
    _0x2a852c.className = "panorama-scene-focus-menu__header";
    const _0x597852 = document.createElement("span");
    _0x597852.className = "panorama-scene-focus-menu__title";
    _0x597852.textContent = panoramaSceneText("focus.title");
    _0x2a852c.appendChild(_0x597852);
    const _0x16c19e = document.createElement("span");
    _0x16c19e.className = "panorama-scene-focus-menu__value";
    _0x2a852c.appendChild(_0x16c19e);
    const _0x5e92a7 = document.createElement("input");
    _0x5e92a7.className = "panorama-scene-focus-menu__slider";
    _0x5e92a7.type = "range";
    _0x5e92a7.min = String(SCENE_FOCAL_LENGTH_MIN_MM);
    _0x5e92a7.max = String(SCENE_FOCAL_LENGTH_MAX_MM);
    _0x5e92a7.step = "1";
    _0x5e92a7.setAttribute("aria-label", panoramaSceneText("focus.sliderAria"));
    const _0x57ac41 = () => {
      const _0x5ebea0 = Math.max(SCENE_FOCAL_LENGTH_MIN_MM, Math.min(SCENE_FOCAL_LENGTH_MAX_MM, Number(this._getDefaultSceneFocalLength()) || SCENE_DEFAULT_FOCAL_LENGTH_MM));
      _0x5e92a7.value = String(_0x5ebea0);
      _0x16c19e.textContent = String(Math.round(_0x5ebea0));
    };
    _0x5e92a7.addEventListener("input", _0x3d521f => {
      const _0x2bd07c = Math.max(SCENE_FOCAL_LENGTH_MIN_MM, Math.min(SCENE_FOCAL_LENGTH_MAX_MM, Number(_0x3d521f.currentTarget?.value) || SCENE_DEFAULT_FOCAL_LENGTH_MM));
      _0x16c19e.textContent = String(Math.round(_0x2bd07c));
      this._setDefaultSceneFocalLength(_0x2bd07c);
    });
    _0x30e1c2.appendChild(_0x2a852c);
    _0x30e1c2.appendChild(_0x5e92a7);
    _0x30e1c2._syncValue = _0x57ac41;
    _0x57ac41();
    return _0x30e1c2;
  }
  _resolveCaptureMode() {
    return normalizeCaptureMode(this._sceneState?.capture?.mode);
  }
  _resolveCaptureFrameRect() {
    const _0x4f8fc0 = this._viewportEl?.clientWidth || 0;
    const _0x34995d = this._viewportEl?.clientHeight || 0;
    return computeCaptureFrameRect(_0x4f8fc0, _0x34995d, this._resolveCaptureMode());
  }
  _syncCaptureMenuState() {
    if (!this._captureMenuEl) {
      return;
    }
    const _0x4244ae = this._resolveCaptureMode();
    this._captureMenuEl.querySelectorAll("[data-capture-mode]").forEach(_0x44d5cd => {
      const _0xadcbd4 = _0x44d5cd.dataset.captureMode === _0x4244ae;
      _0x44d5cd.classList.toggle("is-active", _0xadcbd4);
      _0x44d5cd.setAttribute("aria-pressed", _0xadcbd4 ? "true" : "false");
    });
  }
  _syncCaptureSafeFrame() {
    if (!this._captureSafeFrameEl || !this._captureSafeFrameLabelEl) {
      return;
    }
    const _0x1aa5b0 = this._resolveCaptureMode();
    const _0x36277a = this._isEditing() && this._isNodeSelected() && _0x1aa5b0 !== "adaptive" && this._sceneState?.capture?.showSafeFrame === true;
    this._captureSafeFrameEl.hidden = !_0x36277a;
    this._captureSafeFrameEl.classList.toggle("is-visible", _0x36277a);
    this._captureSafeFrameEl.classList.toggle("is-adaptive", _0x1aa5b0 === "adaptive");
    if (!_0x36277a) {
      return;
    }
    const _0x541d05 = this._resolveCaptureFrameRect();
    this._captureSafeFrameEl.style.left = _0x541d05.x + "px";
    this._captureSafeFrameEl.style.top = _0x541d05.y + "px";
    this._captureSafeFrameEl.style.width = _0x541d05.width + "px";
    this._captureSafeFrameEl.style.height = _0x541d05.height + "px";
    this._captureSafeFrameLabelEl.textContent = getCaptureModeLabel(_0x1aa5b0);
  }
  async _captureViewportByCurrentMode() {
    const _0x426e43 = await this._bridge?.captureBlob?.({
      includeEditorOverlays: false
    });
    if (!_0x426e43) {
      return null;
    }
    return cropCaptureBlobToFrame({
      blob: _0x426e43,
      viewportWidth: this._viewportEl?.clientWidth || 0,
      viewportHeight: this._viewportEl?.clientHeight || 0,
      mode: this._resolveCaptureMode()
    });
  }
  _createGridPanel() {
    const _0x444af7 = document.createElement("div");
    _0x444af7.className = "panorama-grid-panel";
    _0x444af7.innerHTML = "\n      <div class=\"panorama-grid-panel__title\">" + panoramaSceneText("grid.title") + "</div>\n      <div class=\"panorama-grid-panel__metrics-row\">\n        <label class=\"panorama-grid-panel__metric-item\">\n          <span class=\"panorama-grid-panel__metric-label\" data-grid-label=\"rows\">" + panoramaSceneText("grid.rows") + "</span>\n          <div class=\"panorama-grid-panel__metric-control rh-stepper\">\n            <div class=\"rh-stepper-value panorama-grid-panel__metric-stepper\" data-grid-field=\"rows\" role=\"spinbutton\" aria-label=\"" + panoramaSceneText("grid.rowsAria") + "\" aria-valuenow=\"1\" tabindex=\"0\">1</div>\n          </div>\n        </label>\n        <label class=\"panorama-grid-panel__metric-item\">\n          <span class=\"panorama-grid-panel__metric-label\" data-grid-label=\"cols\">" + panoramaSceneText("grid.cols") + "</span>\n          <div class=\"panorama-grid-panel__metric-control rh-stepper\">\n            <div class=\"rh-stepper-value panorama-grid-panel__metric-stepper\" data-grid-field=\"cols\" role=\"spinbutton\" aria-label=\"" + panoramaSceneText("grid.colsAria") + "\" aria-valuenow=\"1\" tabindex=\"0\">1</div>\n          </div>\n        </label>\n      </div>\n      <div class=\"panorama-grid-panel__metrics-row\">\n        <label class=\"panorama-grid-panel__metric-item\">\n          <span class=\"panorama-grid-panel__metric-label\" data-grid-label=\"spacingX\">" + panoramaSceneText("grid.spacingX") + "</span>\n          <div class=\"panorama-grid-panel__metric-control rh-stepper\">\n            <div class=\"rh-stepper-value panorama-grid-panel__metric-stepper\" data-grid-field=\"spacingX\" role=\"spinbutton\" aria-label=\"" + panoramaSceneText("grid.spacingXAria") + "\" aria-valuenow=\"1.0\" tabindex=\"0\">1.0</div>\n          </div>\n        </label>\n        <label class=\"panorama-grid-panel__metric-item\">\n          <span class=\"panorama-grid-panel__metric-label\" data-grid-label=\"spacingZ\">" + panoramaSceneText("grid.spacingZ") + "</span>\n          <div class=\"panorama-grid-panel__metric-control rh-stepper\">\n            <div class=\"rh-stepper-value panorama-grid-panel__metric-stepper\" data-grid-field=\"spacingZ\" role=\"spinbutton\" aria-label=\"" + panoramaSceneText("grid.spacingZAria") + "\" aria-valuenow=\"1.0\" tabindex=\"0\">1.0</div>\n          </div>\n        </label>\n      </div>\n      <div class=\"panorama-grid-panel__appearance-row\">\n        <div class=\"panorama-grid-panel__appearance-group panorama-grid-panel__appearance-group--gender\">\n          <span class=\"panorama-grid-panel__appearance-label\" data-grid-label=\"gender\">" + panoramaSceneText("grid.gender") + "</span>\n          <div class=\"panorama-grid-panel__appearance-options panorama-grid-panel__appearance-options--gender\">\n            " + PANORAMA_MANNEQUIN_GENDER_OPTIONS.map(([_0x377668,, _0x2bd2b3]) => {
      const _0xe70f40 = getPanoramaMannequinGenderLabel(_0x377668);
      return "<button type=\"button\" class=\"panorama-mannequin-menu__gender-btn\" data-grid-gender=\"" + _0x377668 + "\" aria-label=\"" + panoramaSceneText("grid.setGenderAria", {
        label: _0xe70f40
      }) + "\">" + _0x2bd2b3 + "</button>";
    }).join("") + "\n          </div>\n        </div>\n        <div class=\"panorama-grid-panel__appearance-group panorama-grid-panel__appearance-group--color\">\n          <span class=\"panorama-grid-panel__appearance-label\" data-grid-label=\"color\">" + panoramaSceneText("grid.color") + "</span>\n          <div class=\"panorama-grid-panel__appearance-options panorama-grid-panel__appearance-options--color\">\n            " + PANORAMA_MANNEQUIN_COLOR_OPTIONS.map(([_0xa60267]) => {
      const _0x83e811 = getPanoramaMannequinColorLabel(_0xa60267);
      return "<button type=\"button\" class=\"panorama-mannequin-menu__color-btn\" data-grid-color=\"" + _0xa60267 + "\" aria-label=\"" + panoramaSceneText("grid.setColorAria", {
        label: _0x83e811
      }) + "\"></button>";
    }).join("") + "\n          </div>\n        </div>\n      </div>\n      <button type=\"button\" class=\"panorama-grid-panel__apply\">" + panoramaSceneText("grid.apply") + "</button>\n    ";
    const _0x1e79f0 = {
      rows: {
        min: 1,
        max: 12,
        step: 1,
        precision: 0
      },
      cols: {
        min: 1,
        max: 12,
        step: 1,
        precision: 0
      },
      spacingX: {
        min: 0.5,
        max: 8,
        step: 0.1,
        precision: 1
      },
      spacingZ: {
        min: 0.5,
        max: 8,
        step: 0.1,
        precision: 1
      }
    };
    const _0x249f3b = (_0xbc2d5b, _0x3b98ea) => {
      const _0x3ca06 = _0x1e79f0[_0xbc2d5b];
      if (!_0x3ca06) {
        return null;
      }
      const _0x3d2fed = Number(_0x3b98ea);
      if (!Number.isFinite(_0x3d2fed)) {
        return null;
      }
      const _0x22c51f = Math.min(_0x3ca06.max, Math.max(_0x3ca06.min, _0x3d2fed));
      if (_0x3ca06.precision === 0) {
        return Math.round(_0x22c51f);
      }
      return Number(_0x22c51f.toFixed(_0x3ca06.precision));
    };
    const _0x4791cc = (_0x5a52c0, _0x22e58) => {
      const _0x3a6ebf = _0x1e79f0[_0x5a52c0];
      if (!_0x3a6ebf || !Number.isFinite(Number(_0x22e58))) {
        return "";
      }
      if (_0x3a6ebf.precision === 0) {
        return String(Math.round(Number(_0x22e58)));
      } else {
        return Number(_0x22e58).toFixed(_0x3a6ebf.precision);
      }
    };
    const _0x39dc50 = (_0x43c279, _0x4a4b28, _0x30bbcb) => {
      if (!_0x43c279) {
        return;
      }
      const _0x1ae7b3 = _0x4791cc(_0x4a4b28, _0x30bbcb);
      if (_0x43c279.tagName === "INPUT") {
        _0x43c279.value = _0x1ae7b3;
      } else {
        _0x43c279.textContent = _0x1ae7b3;
        _0x43c279.setAttribute("aria-valuenow", String(_0x30bbcb));
      }
    };
    const _0x4b758e = (_0x1418d8, _0x340323) => {
      const _0x350aa9 = _0x249f3b(_0x1418d8, _0x340323);
      if (!Number.isFinite(_0x350aa9)) {
        return;
      }
      setPanoramaSceneGridPlacement({
        nodeId: this.id,
        patch: {
          [_0x1418d8]: _0x350aa9
        }
      });
      const _0x34beeb = _0x444af7.querySelector("[data-grid-field=\"" + _0x1418d8 + "\"]");
      _0x39dc50(_0x34beeb, _0x1418d8, _0x350aa9);
    };
    Object.keys(_0x1e79f0).forEach(_0x1c48a8 => {
      const _0x125f15 = _0x1e79f0[_0x1c48a8];
      const _0x59cd4e = _0x444af7.querySelector("[data-grid-field=\"" + _0x1c48a8 + "\"]");
      if (!_0x59cd4e) {
        return;
      }
      let _0x3628a3 = null;
      let _0xcc9aef = false;
      const _0x30e823 = () => {
        const _0x14c21e = _0x249f3b(_0x1c48a8, this._sceneState?.gridPlacement?.[_0x1c48a8]);
        if (Number.isFinite(_0x14c21e)) {
          return _0x14c21e;
        }
        const _0x1048b0 = _0x249f3b(_0x1c48a8, _0x59cd4e.getAttribute("aria-valuenow"));
        if (Number.isFinite(_0x1048b0)) {
          return _0x1048b0;
        }
        return _0x125f15.min;
      };
      const _0x18490b = _0x2c15f7 => {
        if (!_0x3628a3) {
          return;
        }
        const _0x2e12b6 = _0x2c15f7.clientX - _0x3628a3.x;
        if (!_0x3628a3.moved && Math.abs(_0x2e12b6) >= 3) {
          _0x3628a3.moved = true;
        }
        const _0x293db = Math.trunc(_0x2e12b6 / 6);
        const _0x5c08de = _0x3628a3.v + _0x293db * _0x125f15.step;
        if (_0x5c08de === _0x3628a3.last) {
          return;
        }
        _0x3628a3.last = _0x5c08de;
        _0x4b758e(_0x1c48a8, _0x5c08de);
      };
      const _0x486c5d = () => {
        if (!_0x3628a3) {
          return;
        }
        const _0x3d4316 = _0x3628a3.moved;
        _0x3628a3.el.classList.remove("is-dragging");
        document.removeEventListener("mousemove", _0x18490b);
        document.removeEventListener("mouseup", _0x486c5d);
        if (_0x3d4316) {
          _0xcc9aef = true;
          this._suppressDocClickOnce = true;
        }
        _0x3628a3 = null;
      };
      const _0x16a85f = _0x3c750e => {
        const _0x5be120 = _0x30e823();
        const _0x2d4104 = document.createElement("input");
        _0x2d4104.className = "rh-stepper-input panorama-grid-panel__metric-stepper-input";
        _0x2d4104.type = "number";
        _0x2d4104.step = String(_0x125f15.step);
        _0x2d4104.min = String(_0x125f15.min);
        _0x2d4104.max = String(_0x125f15.max);
        _0x2d4104.value = _0x4791cc(_0x1c48a8, _0x5be120);
        _0x3c750e.replaceWith(_0x2d4104);
        _0x2d4104.focus();
        _0x2d4104.select();
        const _0xe87817 = _0x34b77e => {
          const _0x4b99c3 = _0x34b77e ? _0x2d4104.value : _0x5be120;
          const _0x133da9 = _0x249f3b(_0x1c48a8, _0x4b99c3);
          const _0x5ebb84 = Number.isFinite(_0x133da9) ? _0x133da9 : _0x5be120;
          const _0x474a7f = document.createElement("div");
          _0x474a7f.className = "rh-stepper-value panorama-grid-panel__metric-stepper";
          _0x474a7f.dataset.gridField = _0x1c48a8;
          _0x474a7f.setAttribute("role", "spinbutton");
          _0x474a7f.setAttribute("tabindex", "0");
          const _0x3de747 = _0x3c750e.getAttribute("aria-label") || _0x1c48a8;
          _0x474a7f.setAttribute("aria-label", _0x3de747);
          _0x474a7f.setAttribute("aria-valuenow", String(_0x5ebb84));
          _0x474a7f.textContent = _0x4791cc(_0x1c48a8, _0x5ebb84);
          _0x2d4104.replaceWith(_0x474a7f);
          if (_0x34b77e) {
            _0x4b758e(_0x1c48a8, _0x5ebb84);
          } else {
            _0x39dc50(_0x474a7f, _0x1c48a8, _0x5ebb84);
          }
          _0x2c1fc8(_0x474a7f);
        };
        _0x2d4104.onkeydown = _0x3dd379 => {
          if (_0x3dd379.key === "Enter") {
            _0xe87817(true);
          }
          if (_0x3dd379.key === "Escape") {
            _0xe87817(false);
          }
        };
        _0x2d4104.onblur = () => _0xe87817(true);
      };
      const _0x2c1fc8 = _0x69b9ad => {
        _0x69b9ad.onclick = _0x5eeb36 => {
          _0x5eeb36.stopPropagation();
          if (_0xcc9aef) {
            _0xcc9aef = false;
            return;
          }
          _0x16a85f(_0x69b9ad);
        };
        _0x69b9ad.onkeydown = _0x3cb1a9 => {
          const _0x38b4d4 = _0x3cb1a9.key === "ArrowRight" ? 1 : _0x3cb1a9.key === "ArrowLeft" ? -1 : 0;
          if (_0x38b4d4) {
            _0x3cb1a9.preventDefault();
            _0x3cb1a9.stopPropagation();
            const _0x108824 = _0x30e823();
            _0x4b758e(_0x1c48a8, _0x108824 + _0x38b4d4 * _0x125f15.step);
            return;
          }
          if (_0x3cb1a9.key === "Enter" || _0x3cb1a9.key === " ") {
            _0x3cb1a9.preventDefault();
            _0x3cb1a9.stopPropagation();
            _0x16a85f(_0x69b9ad);
          }
        };
        _0x69b9ad.onmousedown = _0x25ad3f => {
          if (_0x25ad3f.button !== 0) {
            return;
          }
          _0x25ad3f.preventDefault();
          _0xcc9aef = false;
          const _0x796d6a = _0x30e823();
          _0x3628a3 = {
            x: _0x25ad3f.clientX,
            v: _0x796d6a,
            moved: false,
            last: _0x796d6a,
            el: _0x69b9ad
          };
          _0x69b9ad.classList.add("is-dragging");
          document.addEventListener("mousemove", _0x18490b);
          document.addEventListener("mouseup", _0x486c5d);
        };
      };
      _0x2c1fc8(_0x59cd4e);
    });
    _0x444af7.querySelectorAll("[data-grid-gender]").forEach(_0x192c96 => {
      _0x192c96.addEventListener("click", () => {
        const _0x5e6b9c = _0x192c96.dataset.gridGender === "female" ? "female" : "male";
        setPanoramaSceneGridPlacement({
          nodeId: this.id,
          patch: {
            gender: _0x5e6b9c
          }
        });
      });
    });
    _0x444af7.querySelectorAll("[data-grid-color]").forEach(_0x166202 => {
      _0x166202.addEventListener("click", () => {
        const _0x5e4a90 = _0x166202.dataset.gridColor || "blue";
        setPanoramaSceneGridPlacement({
          nodeId: this.id,
          patch: {
            colorKey: _0x5e4a90
          }
        });
      });
    });
    _0x444af7.querySelector(".panorama-grid-panel__apply")?.addEventListener("click", () => {
      this._selectNodeOnCanvas();
      addPanoramaSceneMannequinGrid({
        nodeId: this.id,
        viewPose: this._bridge?.readCurrentViewPose?.()
      });
      this._openMenuKey = null;
      this._syncOverlayState();
    });
    return _0x444af7;
  }
  _isNodeSelected() {
    return this._isSelected === true;
  }
  _handleWindowResize() {
    this._positionMenus();
    this._syncCaptureSafeFrame();
  }
  _isBrowserFullscreen() {
    return !!this._browserFullscreenOverlayEl;
  }
  async _enterBrowserFullscreen() {
    if (this._isBrowserFullscreen() || !this._shellEl) {
      return;
    }
    const _0x2575b2 = document.createElement("div");
    _0x2575b2.className = "panorama-scene-browser-fullscreen";
    const _0xc7d019 = document.createElement("button");
    _0xc7d019.type = "button";
    _0xc7d019.className = "panorama-scene-browser-fullscreen__exit";
    _0xc7d019.textContent = panoramaSceneText("toolbar.exitFullscreen");
    _0xc7d019.setAttribute("aria-label", panoramaSceneText("toolbar.exitFullscreen"));
    _0xc7d019.addEventListener("click", () => {
      this._exitBrowserFullscreen();
    });
    this._browserFullscreenExitBtnEl = _0xc7d019;
    _0x2575b2.appendChild(_0xc7d019);
    _0x2575b2.appendChild(this._shellEl);
    document.body.appendChild(_0x2575b2);
    this._browserFullscreenOverlayEl = _0x2575b2;
    this._syncToolbarState();
    this._syncOverlayState();
    this._positionMenus();
    this._bridge?.resize();
  }
  async _exitBrowserFullscreen({
    skipSync = false
  } = {}) {
    if (!this._isBrowserFullscreen()) {
      return;
    }
    const _0x2fdcd4 = this._browserFullscreenOverlayEl;
    this._browserFullscreenOverlayEl = null;
    this._browserFullscreenExitBtnEl = null;
    if (this._shellEl && this.el?.isConnected) {
      if (this._browserFullscreenAnchorEl?.parentElement === this.el) {
        this.el.insertBefore(this._shellEl, this._browserFullscreenAnchorEl.nextSibling);
      } else {
        this.el.appendChild(this._shellEl);
      }
    }
    _0x2fdcd4?.remove?.();
    if (skipSync) {
      return;
    }
    this._syncToolbarState();
    this._syncOverlayState();
    this._positionMenus();
    this._bridge?.resize();
  }
  _handleOwnedNavigationKeyDown(_0x4da416, _0x90e300) {
    if (!_0x90e300 || _0x4da416.ctrlKey || _0x4da416.metaKey || _0x4da416.altKey) {
      return false;
    }
    if (!_0x4da416.repeat && (_0x4da416.key === "f" || _0x4da416.key === "F")) {
      _0x4da416.preventDefault();
      _0x4da416.stopPropagation();
      if (_0x4da416.shiftKey) {
        setPanoramaSceneInteractionOptions({
          nodeId: this.id,
          patch: {
            navigationMode: this._sceneState?.ui?.navigationMode === "fly" ? "orbit" : "fly"
          }
        });
      } else {
        focusPanoramaSceneSelection({
          nodeId: this.id,
          frame: this._bridge?.readSelectionFrame?.()
        });
      }
      return true;
    }
    return this._sceneState?.ui?.navigationMode === "fly" && this._interaction?.handleFlightKeyDown?.(_0x4da416) === true;
  }
  _handleWindowKeyDown(_0x5d45b4) {
    if (_0x5d45b4.key === "Escape" && this._isBrowserFullscreen()) {
      _0x5d45b4.preventDefault();
      _0x5d45b4.stopPropagation();
      _0x5d45b4.stopImmediatePropagation?.();
      this._exitBrowserFullscreen();
      return;
    }
    if (!this._isEditing()) {
      return;
    }
    const _0x45a5bd = _0x5d45b4.target;
    const _0x37acdd = _0x45a5bd instanceof HTMLElement && (_0x45a5bd.isContentEditable || _0x45a5bd.tagName === "INPUT" || _0x45a5bd.tagName === "TEXTAREA" || _0x45a5bd.tagName === "SELECT");
    const _0x1b5c45 = _0x45a5bd instanceof HTMLElement && (this.el?.contains?.(_0x45a5bd) || this._browserFullscreenOverlayEl?.contains?.(_0x45a5bd));
    if (!_0x37acdd && this._handleOwnedNavigationKeyDown(_0x5d45b4, _0x1b5c45)) {
      _0x5d45b4.stopImmediatePropagation?.();
      return;
    }
    if (_0x5d45b4.defaultPrevented) {
      return;
    }
    if (_0x37acdd) {
      return;
    }
  }
  _handleWindowKeyUp(_0x197433) {
    if (!this._isEditing()) {
      return;
    }
    if (this._interaction?.handleFlightKeyUp?.(_0x197433)) {
      _0x197433.stopImmediatePropagation?.();
    }
  }
  _handleWindowBlur() {
    this._interaction?.cancelFlightNavigation?.({
      commit: true
    });
  }
  _syncAttachedUiVisibility(_0x66e47a) {
    if (this._bottomToolbarAnchorEl) {
      this._bottomToolbarAnchorEl.hidden = !_0x66e47a;
    }
    const _0x16b9cf = this._isNodeSelected() || this._isNodeHovered;
    if (this._infoDockEl) {
      this._infoDockEl.hidden = !_0x16b9cf;
    }
  }
  _handleNodePointerEnter() {
    this._isNodeHovered = true;
    this._syncAttachedUiVisibility(this._shouldShowBottomToolbar());
  }
  _handleNodePointerLeave(_0xd9b852) {
    const _0x2b752e = _0xd9b852.relatedTarget;
    if (_0x2b752e && this.el.contains(_0x2b752e)) {
      return;
    }
    this._isNodeHovered = false;
    this._closeObjectContextMenu();
    this._syncAttachedUiVisibility(this._shouldShowBottomToolbar());
  }
  _selectNodeOnCanvas({
    preserveExistingSelection = false
  } = {}) {
    const _0x4da80d = a491_0x284028.getStateRaw().selectedNodeIds || [];
    if (preserveExistingSelection && _0x4da80d.includes(this.id)) {
      return;
    }
    if (_0x4da80d.length === 1 && _0x4da80d[0] === this.id) {
      return;
    }
    a491_0x284028.setSelectedNodes([this.id]);
  }
  _isEditing() {
    return this._sceneState?.ui?.isEditing === true && this._data?.isCollapsed !== true;
  }
  _shouldShowBottomToolbar() {
    const _0x175b39 = this._isNodeSelected();
    return this._isEditing() && _0x175b39;
  }
  _resolveMouseTool() {
    return this._sceneState?.ui?.mouseTool || (this._sceneState?.ui?.activeTool === "box-select" ? "box-select" : "navigate");
  }
  _toggleMouseTool() {
    const _0x9addc0 = String(this._sceneState?.ui?.mouseTool || this._sceneState?.ui?.activeTool || "").trim();
    const _0x16b712 = resolveNextPanoramaMouseTool(_0x9addc0);
    setPanoramaSceneTool({
      nodeId: this.id,
      tool: _0x16b712
    });
  }
  _resolveTransformTool() {
    return this._sceneState?.ui?.transformTool || (this._sceneState?.ui?.activeTool === "move" || this._sceneState?.ui?.activeTool === "rotate" || this._sceneState?.ui?.activeTool === "scale" ? this._sceneState.ui.activeTool : "move");
  }
  _supportsPanoramaUpload() {
    return this._isPanorama360 === true;
  }
  _supportsCubeCreation() {
    return this._isPanorama360 !== true;
  }
  _supportsCameraFeatures() {
    return this._isPanorama360 !== true;
  }
  _buildPanorama360IncomingImageSignature(_0x173494) {
    if (!this._isPanorama360) {
      return "";
    }
    const _0x17ca63 = _0x173494?.nodes || {};
    const _0x5eb939 = _0x17ca63[this.id];
    if (!_0x5eb939) {
      return "";
    }
    const _0x2aae42 = String(_0x5eb939.parentId || "").trim();
    const _0x58a41c = Object.values(_0x173494?.edges || {});
    const _0x152973 = [];
    _0x58a41c.forEach(_0x1c592f => {
      if (!_0x1c592f) {
        return;
      }
      const _0x5e0321 = _0x1c592f.targetId === this.id;
      const _0x1d6cc1 = !!_0x2aae42 && _0x1c592f.targetId === _0x2aae42;
      if (!_0x5e0321 && !_0x1d6cc1) {
        return;
      }
      const _0x6dc972 = _0x17ca63[_0x1c592f.sourceId];
      if (!_0x6dc972 || !isPanorama360ImageSourceType(_0x6dc972.type)) {
        return;
      }
      const _0x58f318 = typeof _0x6dc972._bizRev === "number" || typeof _0x6dc972._bizRev === "string" ? String(_0x6dc972._bizRev) : "";
      const _0x5fe992 = Array.isArray(_0x6dc972.images) ? _0x6dc972.images : [];
      const _0x4f910f = Number(_0x6dc972.mainImageIndex);
      const _0xc062d = Number.isFinite(_0x4f910f) ? Math.max(0, Math.min(_0x5fe992.length - 1, Math.trunc(_0x4f910f))) : 0;
      const _0x34351b = _0x5fe992[_0xc062d] || _0x5fe992[0] || null;
      const _0x2965b8 = [String(_0x6dc972.localPath || "").trim(), String(_0x6dc972.originalLocalPath || "").trim(), String(_0x6dc972.displayLocalPath || "").trim(), String(_0x6dc972.thumbLocalPath || "").trim(), String(_0x6dc972.imageUrl || "").trim(), String(_0x6dc972.src || "").trim(), String(_0x6dc972.thumbUrl || "").trim(), String(_0x6dc972.fileName || "").trim(), String(_0x6dc972.mainImageIndex || "").trim(), String(_0x34351b?.localPath || "").trim(), String(_0x34351b?.originalLocalPath || "").trim(), String(_0x34351b?.displayLocalPath || "").trim(), String(_0x34351b?.thumbLocalPath || "").trim(), String(_0x34351b?.imageUrl || "").trim(), String(_0x34351b?.thumbUrl || "").trim()].join(":");
      _0x152973.push(_0x1c592f.id + ":" + _0x1c592f.sourceId + ":" + Number(_0x1c592f.createdAt || 0) + ":" + _0x58f318 + ":" + _0x2965b8);
    });
    _0x152973.sort((_0xdf7186, _0x875715) => _0xdf7186.localeCompare(_0x875715));
    return _0x152973.join("|");
  }
  _enterEditing() {
    this._selectNodeOnCanvas();
    if (this._data?.isCollapsed) {
      setPanoramaSceneCollapsed({
        nodeId: this.id,
        isCollapsed: false
      });
    }
    setPanoramaSceneEditing({
      nodeId: this.id,
      isEditing: true
    });
    requestAnimationFrame(() => this._viewportEl?.focus());
  }
  _exitEditing() {
    this._closeMenus();
    this._interaction?.cancelFlightNavigation?.({
      commit: true
    });
    setPanoramaSceneEditing({
      nodeId: this.id,
      isEditing: false
    });
  }
  async _handleFileInputChange(_0x51128d) {
    if (!this._supportsPanoramaUpload()) {
      _0x51128d.target.value = "";
      return;
    }
    const _0x18bfb6 = _0x51128d.target.files?.[0];
    if (!_0x18bfb6) {
      return;
    }
    this._selectNodeOnCanvas();
    const _0x45d5db = await uploadPanoramaSceneImage({
      nodeId: this.id,
      file: _0x18bfb6
    });
    if (_0x45d5db && this._isPanorama360) {
      this._enterEditing();
    }
    _0x51128d.target.value = "";
  }
  _handleViewportPointerDown(_0x2296d3) {
    const _0x48b85d = this._isEditing();
    this._selectNodeOnCanvas({
      preserveExistingSelection: !_0x48b85d
    });
    this._closeObjectContextMenu();
    if (!_0x48b85d) {
      return;
    }
    if (this._openMenuKey) {
      this._openMenuKey = null;
      this._syncOverlayState();
    }
    this._viewportEl.focus?.();
    _0x2296d3.stopPropagation();
  }
  _handleViewportContextMenu(_0x4f628d) {
    if (!this._isEditing()) {
      return;
    }
    _0x4f628d.preventDefault();
    _0x4f628d.stopPropagation();
    if (this._sceneState?.ui?.navigationMode === "fly") {
      this._closeObjectContextMenu();
      return;
    }
    this._selectNodeOnCanvas();
    const _0x328e8f = this._bridge?.pick?.(_0x4f628d.clientX, _0x4f628d.clientY);
    if (_0x328e8f?.objectType && _0x328e8f?.objectId) {
      setPanoramaSceneSelection({
        nodeId: this.id,
        objectType: _0x328e8f.objectType,
        objectId: _0x328e8f.objectId
      });
    } else if (!this._sceneState?.selection?.selectedObjectId) {
      this._closeObjectContextMenu();
      return;
    }
    this._openObjectContextMenu(_0x4f628d.clientX, _0x4f628d.clientY, {
      type: "selection"
    });
  }
  _handleGlobalPointerDown(_0x1633ca) {
    if (!this._contextMenuEl || this._contextMenuEl.hidden) {
      return;
    }
    if (this._contextMenuEl.contains(_0x1633ca.target)) {
      return;
    }
    this._closeObjectContextMenu();
  }
  _openObjectContextMenu(_0x3afc7e, _0x41c9fe, _0x295858 = {
    type: "selection"
  }) {
    if (!this._contextMenuEl || !this._overlayEl) {
      return;
    }
    const _0x5895d4 = this._overlayEl.getBoundingClientRect();
    if (!_0x5895d4.width || !_0x5895d4.height) {
      return;
    }
    const _0x348534 = this._contextMenuEl.offsetWidth || 132;
    const _0x293988 = this._contextMenuEl.offsetHeight || 44;
    const _0x509e2e = Math.max(0, Math.min(_0x3afc7e - _0x5895d4.left, _0x5895d4.width - _0x348534));
    const _0x5bec83 = Math.max(0, Math.min(_0x41c9fe - _0x5895d4.top, _0x5895d4.height - _0x293988));
    this._contextMenuEl.style.left = _0x509e2e + "px";
    this._contextMenuEl.style.top = _0x5bec83 + "px";
    this._contextMenuTarget = _0x295858;
    this._contextMenuEl.hidden = false;
    this._contextMenuEl.classList.add("is-visible");
  }
  _closeObjectContextMenu() {
    if (!this._contextMenuEl) {
      return;
    }
    this._contextMenuTarget = null;
    this._contextMenuEl.classList.remove("is-visible");
    this._contextMenuEl.hidden = true;
  }
  _handleViewportDoubleClick(_0x3dc2e2) {
    _0x3dc2e2.preventDefault();
    _0x3dc2e2.stopPropagation();
    if (this._isEditing() && this._sceneState?.mode === "scene") {
      const _0x2d405d = this._bridge?.pick?.(_0x3dc2e2.clientX, _0x3dc2e2.clientY);
      if (_0x2d405d?.objectType && _0x2d405d?.objectId) {
        this._selectNodeOnCanvas();
        setPanoramaSceneSelection({
          nodeId: this.id,
          objectType: _0x2d405d.objectType,
          objectId: _0x2d405d.objectId
        });
        focusPanoramaSceneSelection({
          nodeId: this.id,
          frame: this._bridge?.readObjectFrame?.(_0x2d405d.objectType, _0x2d405d.objectId)
        });
        return;
      }
    }
    this._enterEditing();
  }
  _openPanoramaFilePicker() {
    if (!this._supportsPanoramaUpload()) {
      return;
    }
    this._fileInput?.click();
  }
  _openMenu(_0x5aad84) {
    if (!_0x5aad84) {
      return;
    }
    clearTimeout(this._menuHideTimer);
    this._openMenuKey = _0x5aad84;
    this._positionMenus();
    this._syncOverlayState();
  }
  _closeMenus() {
    clearTimeout(this._menuHideTimer);
    this._openMenuKey = null;
    this._syncOverlayState();
  }
  _scheduleMenuHide(_0x5d7fdb) {
    clearTimeout(this._menuHideTimer);
    if (this._openMenuKey === _0x5d7fdb) {
      this._openMenuKey = null;
      this._syncOverlayState();
    }
  }
  _handleBottomToolbarPointerEnter(_0x55d889) {
    const _0x44132d = _0x55d889.target?.closest?.("button");
    if (!_0x44132d) {
      return;
    }
    if (_0x44132d.classList.contains("act-capture")) {
      this._openMenu("capture");
      return;
    }
    if (!this._isPanorama360 && _0x44132d.classList.contains("act-focus")) {
      this._openMenu("focus");
      return;
    }
    if (_0x44132d.classList.contains("act-mannequin-entry")) {
      if (!this._supportsCubeCreation()) {
        return;
      }
      this._openMenu("mannequin");
      return;
    }
    if (_0x44132d.classList.contains("act-asset-library")) {
      if (!this._supportsCubeCreation()) {
        return;
      }
      this._openMenu("assets");
      return;
    }
    if (_0x44132d.classList.contains("act-pose-editor")) {
      if (!this._supportsCubeCreation()) {
        return;
      }
      this._openMenu("pose");
      return;
    }
    if (_0x44132d.classList.contains("act-grid")) {
      if (!this._supportsCubeCreation()) {
        return;
      }
      this._openMenu("grid");
      return;
    }
    if (this._supportsCameraFeatures() && _0x44132d.classList.contains("act-camera")) {
      this._openMenu("camera");
      return;
    }
  }
  _handleBottomToolbarPointerLeave(_0x1ce841) {
    const _0x250b2d = _0x1ce841.relatedTarget;
    if (_0x250b2d && (this._bottomToolbarEl?.contains(_0x250b2d) || this._captureMenuEl?.contains(_0x250b2d) || this._cameraListEl?.contains(_0x250b2d) || this._focusMenuEl?.contains(_0x250b2d) || this._mannequinMenuEl?.contains(_0x250b2d) || this._assetBrowserEl?.contains(_0x250b2d) || this._posePanelEl?.contains(_0x250b2d) || this._gridPanelEl?.contains(_0x250b2d))) {
      return;
    }
    const _0x3e30f6 = _0x1ce841.target?.closest?.("button");
    if (!_0x3e30f6) {
      return;
    }
    if (_0x3e30f6.classList.contains("act-capture")) {
      this._scheduleMenuHide("capture");
      return;
    }
    if (!this._isPanorama360 && _0x3e30f6.classList.contains("act-focus")) {
      this._scheduleMenuHide("focus");
      return;
    }
    if (_0x3e30f6.classList.contains("act-mannequin-entry")) {
      if (!this._supportsCubeCreation()) {
        return;
      }
      this._scheduleMenuHide("mannequin");
      return;
    }
    if (_0x3e30f6.classList.contains("act-asset-library")) {
      this._scheduleMenuHide("assets");
      return;
    }
    if (_0x3e30f6.classList.contains("act-pose-editor")) {
      this._scheduleMenuHide("pose");
      return;
    }
    if (_0x3e30f6.classList.contains("act-grid")) {
      if (!this._supportsCubeCreation()) {
        return;
      }
      this._scheduleMenuHide("grid");
      return;
    }
    if (this._supportsCameraFeatures() && _0x3e30f6.classList.contains("act-camera")) {
      this._scheduleMenuHide("camera");
    }
  }
  async _handleToolbarAction(_0x1b0abf) {
    const _0x15832a = this._sceneState;
    switch (_0x1b0abf) {
      case "enter-edit":
        this._enterEditing();
        return;
      case "exit-edit":
        this._exitEditing();
        return;
      case "upload-panorama":
        if (!this._supportsPanoramaUpload()) {
          return;
        }
        this._openPanoramaFilePicker();
        return;
      case "fullscreen":
        if (!this._isEditing()) {
          this._enterEditing();
        }
        if (this._isBrowserFullscreen()) {
          await this._exitBrowserFullscreen();
        } else {
          await this._enterBrowserFullscreen();
        }
        return;
      case "navigate":
        {
          this._toggleMouseTool();
        }
        return;
      case "fly-mode":
        setPanoramaSceneInteractionOptions({
          nodeId: this.id,
          patch: {
            navigationMode: _0x15832a?.ui?.navigationMode === "fly" ? "orbit" : "fly"
          }
        });
        requestAnimationFrame(() => this._viewportEl?.focus());
        return;
      case "frame-selection":
        focusPanoramaSceneSelection({
          nodeId: this.id,
          frame: this._bridge?.readSelectionFrame?.()
        });
        return;
      case "move":
      case "rotate":
      case "scale":
        this._closeMenus();
        setPanoramaSceneTool({
          nodeId: this.id,
          tool: _0x1b0abf
        });
        return;
      case "transform-space":
        setPanoramaSceneInteractionOptions({
          nodeId: this.id,
          patch: {
            transformSpace: _0x15832a?.ui?.transformSpace === "local" ? "world" : "local"
          }
        });
        return;
      case "snap-toggle":
        setPanoramaSceneInteractionOptions({
          nodeId: this.id,
          patch: {
            snapEnabled: _0x15832a?.ui?.snapEnabled !== true
          }
        });
        return;
      case "ground-lock":
        setPanoramaSceneInteractionOptions({
          nodeId: this.id,
          patch: {
            groundLock: _0x15832a?.ui?.groundLock !== true
          }
        });
        return;
      case "uniform-scale":
        setPanoramaSceneInteractionOptions({
          nodeId: this.id,
          patch: {
            uniformScale: _0x15832a?.ui?.uniformScale !== true
          }
        });
        return;
      case "environment-toggle":
        setPanoramaSceneEnvironmentMode({
          nodeId: this.id,
          environmentMode: _0x15832a.environmentMode === "day" ? "night" : "day"
        });
        return;
      case "collapse-node":
        {
          const _0x3d8a18 = this._data?.isCollapsed === true;
          setPanoramaSceneCollapsed({
            nodeId: this.id,
            isCollapsed: !_0x3d8a18,
            enterEditingOnExpand: _0x3d8a18
          });
          if (_0x3d8a18) {
            requestAnimationFrame(() => this._viewportEl?.focus());
          }
        }
        return;
      case "cube":
        if (!this._supportsCubeCreation()) {
          return;
        }
        addPanoramaSceneCube({
          nodeId: this.id,
          viewPose: this._bridge?.readCurrentViewPose?.()
        });
        return;
      case "asset-library":
        if (!this._supportsCubeCreation()) {
          return;
        }
        this._openMenu("assets");
        return;
      case "mannequin-entry":
        if (!this._supportsCubeCreation()) {
          return;
        }
        this._openMenu("mannequin");
        return;
      case "pose-editor":
        if (!this._supportsCubeCreation()) {
          return;
        }
        this._openMenu("pose");
        return;
      case "camera":
        if (!this._supportsCameraFeatures()) {
          return;
        }
        {
          addPanoramaSceneCamera({
            nodeId: this.id,
            viewPose: this._bridge?.readCurrentViewPose?.()
          });
        }
        this._openMenuKey = "camera";
        this._syncOverlayState();
        return;
      case "timeline":
        if (!this._supportsCameraFeatures()) {
          return;
        }
        {
          const _0x1eeba6 = _0x15832a?.ui?.showTimeline !== true;
          setPanoramaSceneInteractionOptions({
            nodeId: this.id,
            patch: {
              showTimeline: _0x1eeba6
            }
          });
          if (!_0x1eeba6) {
            this._stopCameraTimelinePlayback({
              clearDraft: true
            });
          }
        }
        return;
      case "focus":
        if (this._isPanorama360 || this._sceneState?.mode !== "scene") {
          return;
        }
        if (this._openMenuKey === "focus") {
          this._setDefaultSceneFocalLength(SCENE_DEFAULT_FOCAL_LENGTH_MM);
          this._focusMenuEl?._syncValue?.();
          return;
        }
        this._openMenu("focus");
        return;
      case "capture":
        await capturePanoramaSceneViewport({
          nodeId: this.id,
          captureBlob: () => this._captureViewportByCurrentMode()
        });
        return;
      case "reset-view":
        this._setDefaultSceneFocalLength(SCENE_DEFAULT_FOCAL_LENGTH_MM);
        resetPanoramaSceneView({
          nodeId: this.id
        });
        return;
      case "grid":
        if (!this._supportsCubeCreation()) {
          return;
        }
        this._openMenu("grid");
        return;
      case "toggle-panorama-mode":
        this._closeMenus();
        setPanoramaSceneMode({
          nodeId: this.id,
          mode: this._supportsPanoramaUpload() ? "panorama" : "scene"
        });
        return;
      default:
        return;
    }
  }
  _handleToolbarClick(_0x1458b3) {
    const _0x379c6c = _0x1458b3.target.closest("button");
    if (!_0x379c6c) {
      return;
    }
    const _0x5b9cef = Array.from(_0x379c6c.classList).find(_0x144075 => _0x144075.startsWith("act-"));
    if (!_0x5b9cef) {
      return;
    }
    _0x1458b3.preventDefault();
    _0x1458b3.stopPropagation();
    this._selectNodeOnCanvas();
    const _0x5316fa = _0x5b9cef.slice(4);
    this._handleToolbarAction(_0x5316fa);
  }
  _syncGridPanelValues() {
    if (!this._gridPanelEl) {
      return;
    }
    const _0x3ff80f = this._sceneState.gridPlacement;
    const _0x2e2f01 = (_0x2aa339, _0x2b392e, _0x26bb2d = 0) => {
      const _0x5986a2 = this._gridPanelEl.querySelector("[data-grid-field=\"" + _0x2aa339 + "\"]");
      if (!_0x5986a2) {
        return;
      }
      if (!Number.isFinite(Number(_0x2b392e))) {
        return;
      }
      const _0x4681c2 = _0x26bb2d > 0 ? Number(_0x2b392e).toFixed(_0x26bb2d) : String(Math.round(Number(_0x2b392e)));
      if (_0x5986a2.tagName === "INPUT") {
        _0x5986a2.value = _0x4681c2;
      } else {
        _0x5986a2.textContent = _0x4681c2;
        _0x5986a2.setAttribute("aria-valuenow", String(_0x2b392e));
      }
    };
    _0x2e2f01("rows", _0x3ff80f.rows, 0);
    _0x2e2f01("cols", _0x3ff80f.cols, 0);
    _0x2e2f01("spacingX", _0x3ff80f.spacingX, 1);
    _0x2e2f01("spacingZ", _0x3ff80f.spacingZ, 1);
    const _0x5bddf0 = _0x3ff80f.gender === "female" ? "female" : "male";
    this._gridPanelEl.querySelectorAll("[data-grid-gender]").forEach(_0x59f73f => {
      _0x59f73f.classList.toggle("is-active", _0x59f73f.dataset.gridGender === _0x5bddf0);
    });
    const _0x63f5c2 = new Set(PANORAMA_MANNEQUIN_COLOR_OPTIONS.map(([_0xee3991]) => _0xee3991));
    const _0x31531c = _0x63f5c2.has(_0x3ff80f.colorKey) ? _0x3ff80f.colorKey : "blue";
    this._gridPanelEl.querySelectorAll("[data-grid-color]").forEach(_0x954f61 => {
      const _0x55c2a3 = _0x954f61.dataset.gridColor;
      _0x954f61.classList.toggle("is-active", _0x55c2a3 === _0x31531c);
      _0x954f61.style.setProperty("--panorama-scene-swatch-token", "var(--" + resolvePanoramaSceneColorToken(_0x55c2a3) + ")");
    });
  }
  _syncLocaleTexts() {
    const _0x5dddb6 = (_0x2511ff, _0x492a37) => {
      if (!_0x2511ff) {
        return;
      }
      _0x2511ff.dataset.tooltip = _0x492a37;
      _0x2511ff.setAttribute("aria-label", _0x492a37);
    };
    const _0x4d1607 = (_0x42b60b, _0x52978d) => {
      const _0xbad979 = [this.el, this._browserFullscreenOverlayEl].filter(Boolean);
      _0xbad979.forEach(_0x17f8c1 => {
        _0x17f8c1.querySelectorAll?.(_0x42b60b)?.forEach(_0xdef249 => _0x5dddb6(_0xdef249, _0x52978d));
      });
    };
    const _0x5a5be4 = (_0x4c0a8d, _0x53334c) => {
      const _0x528348 = this.el?.querySelector?.(_0x4c0a8d) || this._browserFullscreenOverlayEl?.querySelector?.(_0x4c0a8d);
      if (_0x528348) {
        _0x528348.textContent = _0x53334c;
      }
    };
    _0x4d1607(".act-enter-edit", panoramaSceneText("toolbar.edit"));
    _0x4d1607(".act-exit-edit", panoramaSceneText("toolbar.closeEdit"));
    _0x4d1607(".act-fly-mode", panoramaSceneText("toolbar.flyMode"));
    _0x4d1607(".act-frame-selection", panoramaSceneText("toolbar.frameSelection"));
    _0x4d1607(".act-upload-panorama", panoramaSceneText("toolbar.uploadPanorama"));
    _0x4d1607(".act-cube", panoramaSceneText("toolbar.createCube"));
    _0x4d1607(".act-mannequin-entry", panoramaSceneText("toolbar.mannequin"));
    _0x4d1607(".act-grid", panoramaSceneText("toolbar.grid"));
    _0x4d1607(".act-capture", panoramaSceneText("toolbar.capture"));
    _0x4d1607(".act-camera", panoramaSceneText("toolbar.createCameraBookmark"));
    _0x4d1607(".act-focus", panoramaSceneText("toolbar.focus"));
    _0x4d1607(".act-reset-view", panoramaSceneText("toolbar.resetView"));
    _0x4d1607(".act-environment-toggle", panoramaSceneText("toolbar.switchEnvironment"));
    const _0x5675d5 = this._contextMenuEl?.querySelector?.(".act-delete-selected");
    if (_0x5675d5) {
      _0x5675d5.textContent = panoramaSceneText("contextMenu.deleteObject");
    }
    this._browserFullscreenExitBtnEl?.setAttribute("aria-label", panoramaSceneText("toolbar.exitFullscreen"));
    if (this._browserFullscreenExitBtnEl) {
      this._browserFullscreenExitBtnEl.textContent = panoramaSceneText("toolbar.exitFullscreen");
    }
    this._captureMenuEl?.querySelectorAll?.("[data-capture-mode]")?.forEach(_0x5655ee => {
      const _0x2e7018 = getCaptureModeLabel(_0x5655ee.dataset.captureMode || "adaptive");
      _0x5655ee.setAttribute("aria-label", panoramaSceneText("capture.modeAria", {
        label: _0x2e7018
      }));
      const _0x4a7636 = _0x5655ee.querySelector(".panorama-capture-menu__label");
      if (_0x4a7636) {
        _0x4a7636.textContent = _0x2e7018;
      }
    });
    _0x5a5be4(".panorama-scene-focus-menu__title", panoramaSceneText("focus.title"));
    this._focusMenuEl?.querySelector?.(".panorama-scene-focus-menu__slider")?.setAttribute("aria-label", panoramaSceneText("focus.sliderAria"));
    _0x5a5be4(".panorama-grid-panel__title", panoramaSceneText("grid.title"));
    _0x5a5be4("[data-grid-label=\"rows\"]", panoramaSceneText("grid.rows"));
    _0x5a5be4("[data-grid-label=\"cols\"]", panoramaSceneText("grid.cols"));
    _0x5a5be4("[data-grid-label=\"spacingX\"]", panoramaSceneText("grid.spacingX"));
    _0x5a5be4("[data-grid-label=\"spacingZ\"]", panoramaSceneText("grid.spacingZ"));
    _0x5a5be4("[data-grid-label=\"gender\"]", panoramaSceneText("grid.gender"));
    _0x5a5be4("[data-grid-label=\"color\"]", panoramaSceneText("grid.color"));
    this._gridPanelEl?.querySelector?.("[data-grid-field=\"rows\"]")?.setAttribute("aria-label", panoramaSceneText("grid.rowsAria"));
    this._gridPanelEl?.querySelector?.("[data-grid-field=\"cols\"]")?.setAttribute("aria-label", panoramaSceneText("grid.colsAria"));
    this._gridPanelEl?.querySelector?.("[data-grid-field=\"spacingX\"]")?.setAttribute("aria-label", panoramaSceneText("grid.spacingXAria"));
    this._gridPanelEl?.querySelector?.("[data-grid-field=\"spacingZ\"]")?.setAttribute("aria-label", panoramaSceneText("grid.spacingZAria"));
    this._gridPanelEl?.querySelectorAll?.("[data-grid-gender]")?.forEach(_0x33b86f => {
      const _0x3f18ec = getPanoramaMannequinGenderLabel(_0x33b86f.dataset.gridGender);
      _0x33b86f.setAttribute("aria-label", panoramaSceneText("grid.setGenderAria", {
        label: _0x3f18ec
      }));
    });
    this._gridPanelEl?.querySelectorAll?.("[data-grid-color]")?.forEach(_0x452724 => {
      const _0x3d279f = getPanoramaMannequinColorLabel(_0x452724.dataset.gridColor);
      _0x452724.setAttribute("aria-label", panoramaSceneText("grid.setColorAria", {
        label: _0x3d279f
      }));
    });
    _0x5a5be4(".panorama-grid-panel__apply", panoramaSceneText("grid.apply"));
    renderMannequinQuickMenu(this._mannequinMenuEl, this._sceneState);
    renderSceneAssetBrowser(this._assetBrowserEl);
    renderMannequinPosePanel(this._posePanelEl, this._sceneState);
    renderCameraTimelinePanel(this._timelinePanelEl, this._sceneState?.cameraTimeline, {
      currentTime: this._timelinePreviewTime,
      isPlaying: this._isTimelinePlaying
    });
    this._renderCameraPresetList();
    this._syncToolbarState();
    this._syncHintAndStatus();
    this._syncCaptureSafeFrame();
  }
  _renderCameraPresetList() {
    renderCameraPresetList(this._cameraListEl, this._sceneState, {
      onActivate: _0x1b282a => {
        this._animateCameraActivation(_0x1b282a);
        this._openMenuKey = null;
        this._syncOverlayState();
      },
      onDelete: _0x29155f => {
        deletePanoramaSceneCamera({
          nodeId: this.id,
          cameraId: _0x29155f
        });
      },
      onContextMenu: ({
        cameraId: _0x46a47b,
        clientX: _0x418f1a,
        clientY: _0x85a5bc
      }) => {
        this._openObjectContextMenu(_0x418f1a, _0x85a5bc, {
          type: "camera",
          cameraId: _0x46a47b
        });
      }
    });
  }
  _syncToolbarState() {
    const _0x22ac84 = this._resolveMouseTool();
    const _0x26afe9 = this._resolveTransformTool();
    this._editToolbarEl.querySelectorAll(".act-navigate, .act-move, .act-rotate, .act-scale").forEach(_0x54c24d => {
      const _0x4fccfc = Array.from(_0x54c24d.classList).find(_0x32cad4 => _0x32cad4.startsWith("act-"));
      const _0x52ce4e = _0x4fccfc?.slice(4);
      const _0xbfb204 = _0x52ce4e === "navigate";
      const _0x305174 = _0xbfb204 ? _0x22ac84 === "navigate" || _0x22ac84 === "box-select" : _0x52ce4e === _0x26afe9;
      _0x54c24d.classList.toggle("active", _0x305174);
    });
    const _0x2a4bae = this._editToolbarEl.querySelector(".act-navigate");
    if (_0x2a4bae) {
      const _0x459540 = _0x22ac84 === "box-select";
      _0x2a4bae.classList.toggle("is-box-select", _0x459540);
      const _0x275ebc = buildTooltipText(_0x459540 ? panoramaSceneText("toolbar.boxSelectMouse") : panoramaSceneText("toolbar.mouseMode"), "panorama-scene-tool-toggle-mouse");
      _0x2a4bae.dataset.tooltip = _0x275ebc;
      _0x2a4bae.setAttribute("aria-label", _0x275ebc);
      const _0x24dc38 = _0x459540 ? BOX_SELECT_TOOL_ICON : POINTER_TOOL_ICON;
      if (_0x2a4bae.innerHTML !== _0x24dc38) {
        _0x2a4bae.innerHTML = _0x24dc38;
      }
    }
    const _0x52233b = this._editToolbarEl.querySelector(".act-fly-mode");
    if (_0x52233b) {
      const _0x5c091e = this._sceneState?.ui?.navigationMode === "fly";
      const _0x40d251 = panoramaSceneText("toolbar.flyMode");
      _0x52233b.classList.toggle("active", _0x5c091e);
      _0x52233b.dataset.tooltip = _0x40d251;
      _0x52233b.setAttribute("aria-label", _0x40d251);
    }
    const _0x3998c5 = this._editToolbarEl.querySelector(".act-frame-selection");
    if (_0x3998c5) {
      const _0x3c3387 = Boolean(this._sceneState?.selection?.selectedObjectId);
      const _0x1c1bc2 = panoramaSceneText("toolbar.frameSelection");
      _0x3998c5.disabled = !_0x3c3387;
      _0x3998c5.dataset.tooltip = _0x1c1bc2;
      _0x3998c5.setAttribute("aria-label", _0x1c1bc2);
    }
    const _0x3f7dc4 = this._editToolbarEl.querySelector(".act-move");
    if (_0x3f7dc4) {
      const _0x9f0f3d = buildTooltipText(panoramaSceneText("toolbar.move"), "panorama-scene-tool-move");
      _0x3f7dc4.dataset.tooltip = _0x9f0f3d;
      _0x3f7dc4.setAttribute("aria-label", _0x9f0f3d);
    }
    const _0x22c046 = this._editToolbarEl.querySelector(".act-rotate");
    if (_0x22c046) {
      const _0x2638a5 = buildTooltipText(panoramaSceneText("toolbar.rotate"), "panorama-scene-tool-rotate");
      _0x22c046.dataset.tooltip = _0x2638a5;
      _0x22c046.setAttribute("aria-label", _0x2638a5);
    }
    const _0x2a99ae = this._editToolbarEl.querySelector(".act-scale");
    if (_0x2a99ae) {
      const _0x5affb1 = buildTooltipText(panoramaSceneText("toolbar.scale"), "panorama-scene-tool-scale");
      _0x2a99ae.dataset.tooltip = _0x5affb1;
      _0x2a99ae.setAttribute("aria-label", _0x5affb1);
    }
    const _0x1cd111 = this._editToolbarEl.querySelector(".act-transform-space");
    if (_0x1cd111) {
      const _0x4c5feb = this._sceneState?.ui?.transformSpace === "local";
      const _0x1d2f7a = panoramaSceneText(_0x4c5feb ? "toolbar.transformLocal" : "toolbar.transformWorld");
      _0x1cd111.classList.toggle("active", _0x4c5feb);
      _0x1cd111.dataset.tooltip = _0x1d2f7a;
      _0x1cd111.setAttribute("aria-label", _0x1d2f7a);
    }
    const _0x49f50d = this._editToolbarEl.querySelector(".act-snap-toggle");
    if (_0x49f50d) {
      _0x49f50d.classList.toggle("active", this._sceneState?.ui?.snapEnabled === true);
    }
    const _0x17094d = this._editToolbarEl.querySelector(".act-ground-lock");
    if (_0x17094d) {
      _0x17094d.classList.toggle("active", this._sceneState?.ui?.groundLock === true);
      _0x17094d.hidden = _0x26afe9 !== "move";
    }
    const _0x5ea23e = this._editToolbarEl.querySelector(".act-uniform-scale");
    if (_0x5ea23e) {
      _0x5ea23e.classList.toggle("active", this._sceneState?.ui?.uniformScale === true);
      _0x5ea23e.hidden = _0x26afe9 !== "scale";
    }
    const _0x5962eb = this._cornerToolbarEl.querySelector(".act-environment-toggle");
    if (_0x5962eb) {
      const _0x2445ac = this._sceneState.environmentMode === "day" ? panoramaSceneText("toolbar.switchToNight") : panoramaSceneText("toolbar.switchToDay");
      _0x5962eb.dataset.tooltip = _0x2445ac;
      _0x5962eb.setAttribute("aria-label", _0x2445ac);
      _0x5962eb.hidden = false;
      _0x5962eb.setAttribute("aria-hidden", "false");
    }
    const _0x387b45 = this._sceneToolbarEl.querySelector(".act-upload-panorama");
    if (_0x387b45) {
      const _0x24555d = this._supportsPanoramaUpload();
      _0x387b45.hidden = !_0x24555d;
      _0x387b45.setAttribute("aria-hidden", _0x24555d ? "false" : "true");
    }
    const _0x455dea = this._bottomToolbarEl.querySelector(".act-cube");
    if (_0x455dea) {
      const _0x92af4c = this._supportsCubeCreation();
      _0x455dea.hidden = !_0x92af4c;
      _0x455dea.setAttribute("aria-hidden", _0x92af4c ? "false" : "true");
    }
    const _0x1acbbc = this._bottomToolbarEl.querySelector(".act-asset-library");
    if (_0x1acbbc) {
      const _0xf03b2e = this._supportsCubeCreation();
      _0x1acbbc.hidden = !_0xf03b2e;
      _0x1acbbc.disabled = !_0xf03b2e;
    }
    const _0x29107d = this._bottomToolbarEl.querySelector(".act-mannequin-entry");
    if (_0x29107d) {
      const _0x369d6e = this._supportsCubeCreation();
      _0x29107d.hidden = !_0x369d6e;
      _0x29107d.setAttribute("aria-hidden", _0x369d6e ? "false" : "true");
      _0x29107d.disabled = !_0x369d6e;
      if (!_0x369d6e && this._openMenuKey === "mannequin") {
        this._openMenuKey = null;
      }
    }
    const _0x22fc7f = this._bottomToolbarEl.querySelector(".act-pose-editor");
    if (_0x22fc7f) {
      const _0x1d8482 = this._sceneState?.selection?.selectedObjectType === "mannequin" && Boolean(this._sceneState?.selection?.selectedObjectId);
      _0x22fc7f.hidden = !this._supportsCubeCreation();
      _0x22fc7f.disabled = !_0x1d8482;
    }
    const _0x31a2ae = this._bottomToolbarEl.querySelector(".act-grid");
    if (_0x31a2ae) {
      const _0x14df21 = this._supportsCubeCreation();
      _0x31a2ae.hidden = !_0x14df21;
      _0x31a2ae.setAttribute("aria-hidden", _0x14df21 ? "false" : "true");
      _0x31a2ae.disabled = !_0x14df21;
      const _0x471f0c = panoramaSceneText("toolbar.grid");
      _0x31a2ae.dataset.tooltip = _0x471f0c;
      _0x31a2ae.setAttribute("aria-label", _0x471f0c);
      if (!_0x14df21 && this._openMenuKey === "grid") {
        this._openMenuKey = null;
      }
    }
    const _0x242fd4 = this._bottomToolbarEl.querySelector(".act-camera");
    if (_0x242fd4) {
      const _0x1723a3 = this._supportsCameraFeatures();
      const _0x4fbe90 = this._sceneState.cameras.length >= 10;
      _0x242fd4.hidden = !_0x1723a3;
      _0x242fd4.setAttribute("aria-hidden", _0x1723a3 ? "false" : "true");
      _0x242fd4.disabled = !_0x1723a3;
      _0x242fd4.classList.toggle("is-limit-reached", _0x1723a3 && _0x4fbe90);
      _0x242fd4.setAttribute("aria-disabled", !_0x1723a3 || _0x4fbe90 ? "true" : "false");
      const _0x1b1ac5 = buildTooltipText(panoramaSceneText("toolbar.createCameraBookmark"), "panorama-scene-camera-create");
      _0x242fd4.dataset.tooltip = _0x1b1ac5;
      _0x242fd4.setAttribute("aria-label", _0x1b1ac5);
      if (!_0x1723a3 && this._openMenuKey === "camera") {
        this._openMenuKey = null;
      }
    }
    const _0x302a82 = this._bottomToolbarEl.querySelector(".act-timeline");
    if (_0x302a82) {
      const _0x507711 = this._supportsCameraFeatures();
      _0x302a82.hidden = !_0x507711;
      _0x302a82.disabled = !_0x507711;
      _0x302a82.classList.toggle("active", this._sceneState?.ui?.showTimeline === true);
    }
    const _0x32c4e8 = this._bottomToolbarEl.querySelector(".act-focus");
    if (_0x32c4e8) {
      const _0x18d266 = !this._isPanorama360 && this._sceneState?.mode === "scene";
      _0x32c4e8.hidden = !_0x18d266;
      _0x32c4e8.setAttribute("aria-hidden", _0x18d266 ? "false" : "true");
      _0x32c4e8.disabled = !_0x18d266;
      const _0x40494f = panoramaSceneText("toolbar.focus");
      _0x32c4e8.dataset.tooltip = _0x40494f;
      _0x32c4e8.setAttribute("aria-label", _0x40494f);
      if (!_0x18d266 && this._openMenuKey === "focus") {
        this._openMenuKey = null;
      }
    }
    const _0x23f87e = this._bottomToolbarEl.querySelector(".act-reset-view");
    if (_0x23f87e) {
      const _0x4622dc = buildTooltipText(panoramaSceneText("toolbar.resetView"), "panorama-scene-reset-view");
      _0x23f87e.dataset.tooltip = _0x4622dc;
      _0x23f87e.setAttribute("aria-label", _0x4622dc);
    }
    const _0x4e1c73 = this._bottomToolbarEl.querySelector(".act-capture");
    if (_0x4e1c73) {
      const _0x3e3d9d = getCaptureModeMeta(this._resolveCaptureMode());
      const _0x5623c2 = buildTooltipText(panoramaSceneText("toolbar.captureWithMode", {
        mode: getCaptureModeLabel(_0x3e3d9d)
      }), "panorama-scene-capture");
      _0x4e1c73.dataset.tooltip = _0x5623c2;
      _0x4e1c73.setAttribute("aria-label", _0x5623c2);
    }
    this._syncCaptureMenuState();
    const _0x4fe0c6 = [this._sceneToolbarEl?.querySelector(".act-collapse-node"), this._editToolbarEl?.querySelector(".act-collapse-node")].filter(Boolean);
    _0x4fe0c6.forEach(_0x4eebba => {
      const _0x47c143 = this._data?.isCollapsed === true;
      const _0x37b8eb = _0x47c143 ? panoramaSceneText("toolbar.expand") : panoramaSceneText("toolbar.collapse");
      _0x4eebba.dataset.tooltip = _0x37b8eb;
      _0x4eebba.setAttribute("aria-label", _0x37b8eb);
      _0x4eebba.classList.toggle("is-collapsed", _0x47c143);
    });
    const _0x62a216 = this.el?.querySelectorAll?.(".act-fullscreen") || [];
    if (_0x62a216.length > 0) {
      const _0x3b84e0 = this._isBrowserFullscreen();
      const _0x5d8fe5 = _0x3b84e0 ? panoramaSceneText("toolbar.exitFullscreen") : panoramaSceneText("toolbar.fullscreen");
      _0x62a216.forEach(_0x316ae2 => {
        _0x316ae2.dataset.tooltip = _0x5d8fe5;
        _0x316ae2.setAttribute("aria-label", _0x5d8fe5);
        _0x316ae2.classList.toggle("active", _0x3b84e0);
      });
    }
  }
  _syncHintAndStatus() {
    const _0x34d664 = this._isEditing();
    const _0x2b231f = this._sceneState.selection;
    const _0x499d85 = this._resolveMouseTool();
    if (_0x34d664) {
      const _0x59fa74 = _0x2b231f.selectedObjectId ? _0x2b231f.selectedObjectType === "camera" ? panoramaSceneText("status.cameraSelected") : panoramaSceneText("status.objectSelected") : panoramaSceneText("status.noObjectSelected");
      const _0x466e5d = this._supportsPanoramaUpload() ? panoramaSceneText("status.panoramaMode") : panoramaSceneText("status.sceneMode");
      this._statusContentEl.textContent = panoramaSceneText("status.editing", {
        mode: _0x466e5d,
        selection: _0x59fa74
      });
    } else if (this._data?.isCollapsed) {
      this._statusContentEl.textContent = panoramaSceneText("status.collapsed");
    } else {
      this._statusContentEl.textContent = panoramaSceneText("status.normalNode");
    }
    const _0x32f2a2 = this._sceneState.panorama.error || this._sceneState.capture.error || "";
    this._errorEl.textContent = _0x32f2a2;
    this._errorEl.classList.toggle("is-visible", !!_0x32f2a2);
    if (this._data?.isCollapsed) {
      this._hintContentEl.textContent = panoramaSceneText("hint.doubleClickEdit");
    } else if (!_0x34d664) {
      this._hintContentEl.textContent = this._supportsPanoramaUpload() ? panoramaSceneText("hint.clickEditPanorama") : panoramaSceneText("hint.clickEditScene");
    } else if (this._supportsPanoramaUpload() || this._sceneState.mode === "panorama") {
      this._hintContentEl.textContent = panoramaSceneText("hint.panoramaControls");
    } else if (_0x499d85 === "box-select") {
      this._hintContentEl.textContent = panoramaSceneText("hint.boxSelect");
    } else if (this._sceneState?.ui?.navigationMode === "fly") {
      this._hintContentEl.textContent = panoramaSceneText("hint.flyControls");
    } else {
      this._hintContentEl.textContent = panoramaSceneText("hint.defaultMouse");
    }
  }
  _positionMenus() {
    if (!this._bottomToolbarPopoverLayerEl || !this._bottomToolbarEl) {
      return;
    }
    if (this._bottomToolbarEl.offsetWidth <= 0 || this._bottomToolbarEl.offsetHeight <= 0) {
      return;
    }
    const _0xd78fd6 = _0x563754 => {
      if (!(_0x563754 instanceof HTMLElement)) {
        return null;
      }
      const _0x24df1b = _0x563754.offsetWidth || 0;
      const _0x4d7c74 = _0x563754.offsetHeight || 0;
      if (_0x24df1b <= 0 || _0x4d7c74 <= 0) {
        return null;
      }
      return {
        x: (_0x563754.offsetLeft || 0) + _0x24df1b / 2,
        y: _0x563754.offsetTop || 0
      };
    };
    const _0x15beee = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-mannequin-entry"));
    if (_0x15beee) {
      this._mannequinMenuEl.style.left = _0x15beee.x + "px";
      this._mannequinMenuEl.style.top = _0x15beee.y + "px";
    }
    const _0x1cc92d = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-asset-library"));
    if (_0x1cc92d) {
      this._assetBrowserEl.style.left = _0x1cc92d.x + "px";
      this._assetBrowserEl.style.top = _0x1cc92d.y + "px";
    }
    const _0x5bca25 = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-pose-editor"));
    if (_0x5bca25) {
      this._posePanelEl.style.left = _0x5bca25.x + "px";
      this._posePanelEl.style.top = _0x5bca25.y + "px";
    }
    const _0x412760 = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-grid"));
    if (_0x412760) {
      this._gridPanelEl.style.left = _0x412760.x + "px";
      this._gridPanelEl.style.top = _0x412760.y + "px";
    }
    const _0x55cc72 = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-capture"));
    if (_0x55cc72) {
      this._captureMenuEl.style.left = _0x55cc72.x + "px";
      this._captureMenuEl.style.top = _0x55cc72.y + "px";
    }
    const _0x35c38a = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-focus"));
    if (_0x35c38a) {
      this._focusMenuEl.style.left = _0x35c38a.x + "px";
      this._focusMenuEl.style.top = _0x35c38a.y + "px";
    }
    const _0x5ab269 = _0xd78fd6(this._bottomToolbarEl.querySelector(".act-camera"));
    if (_0x5ab269) {
      this._cameraListEl.style.left = _0x5ab269.x + "px";
      this._cameraListEl.style.top = _0x5ab269.y + "px";
    }
  }
  _syncOverlayState() {
    const _0x10c0a6 = this._isEditing();
    const _0x636e33 = this._data?.isCollapsed === true;
    const _0x1586fb = this._isNodeSelected();
    const _0x5b6178 = !_0x10c0a6;
    const _0x28725f = _0x10c0a6 && !_0x636e33 && _0x1586fb;
    const _0x37e11b = _0x28725f;
    const _0x56aa38 = _0x28725f;
    this.el.classList.toggle("is-editing", _0x10c0a6);
    this.el.classList.toggle("is-collapsed", _0x636e33);
    this.el.classList.toggle("is-panorama-mode", this._sceneState.mode === "panorama");
    const _0x21c0a3 = this._sceneState?.environmentMode === "day" ? "day" : "night";
    this.el.dataset.panoramaEnv = _0x21c0a3;
    this._viewportEl.dataset.envMode = _0x21c0a3;
    this._viewportEl.dataset.sceneType = this._sceneState?.type || "";
    this._sceneToolbarEl.classList.toggle("is-hidden", !_0x5b6178);
    this._sceneToolbarEl.classList.remove("is-node-collapsed");
    this._editToolbarEl.classList.toggle("is-hidden", !_0x28725f);
    this._editToolbarEl.classList.remove("is-node-collapsed");
    this._cornerToolbarEl.classList.toggle("is-hidden", !_0x56aa38);
    this._cornerToolbarEl.classList.toggle("is-collapsed-state", _0x636e33);
    this._bottomToolbarEl.classList.toggle("is-hidden", !_0x37e11b);
    this._statusEl.style.transform = "none";
    this._hintEl.style.transform = "none";
    if (!_0x28725f) {
      this._closeObjectContextMenu();
    }
    const _0x3af8df = _0x28725f && this._supportsCameraFeatures() && this._sceneState.cameras.length > 0 && this._openMenuKey === "camera";
    const _0x43005a = _0x28725f && !this._isPanorama360 && this._sceneState?.mode === "scene" && this._openMenuKey === "focus";
    const _0x447f46 = _0x28725f && this._openMenuKey === "capture";
    const _0x2a1356 = _0x28725f && this._supportsCubeCreation() && this._openMenuKey === "grid";
    const _0x54dc67 = _0x28725f && this._supportsCubeCreation() && this._openMenuKey === "mannequin";
    const _0x4346e9 = _0x28725f && this._supportsCubeCreation() && this._openMenuKey === "assets";
    const _0x9031a1 = _0x28725f && this._supportsCubeCreation() && this._openMenuKey === "pose" && this._sceneState?.selection?.selectedObjectType === "mannequin";
    const _0x4cace2 = _0x28725f && this._supportsCameraFeatures() && this._sceneState?.ui?.showTimeline === true;
    this.el.classList.toggle("has-camera-timeline", _0x4cace2);
    this._captureMenuEl.classList.toggle("is-visible", _0x447f46);
    this._cameraListEl.classList.toggle("is-visible", _0x3af8df);
    this._focusMenuEl.classList.toggle("is-visible", _0x43005a);
    this._gridPanelEl.classList.toggle("is-visible", _0x2a1356);
    this._mannequinMenuEl.classList.toggle("is-visible", _0x54dc67);
    this._assetBrowserEl.classList.toggle("is-visible", _0x4346e9);
    this._posePanelEl.classList.toggle("is-visible", _0x9031a1);
    this._timelinePanelEl.classList.toggle("is-visible", _0x4cace2);
    this._captureMenuEl.hidden = !_0x447f46;
    this._cameraListEl.hidden = !_0x3af8df;
    this._focusMenuEl.hidden = !_0x43005a;
    this._gridPanelEl.hidden = !_0x2a1356;
    this._mannequinMenuEl.hidden = !_0x54dc67;
    this._assetBrowserEl.hidden = !_0x4346e9;
    this._posePanelEl.hidden = !_0x9031a1;
    this._timelinePanelEl.hidden = !_0x4cace2;
    if (!_0x4cace2 && this._isTimelinePlaying) {
      this._stopCameraTimelinePlayback({
        clearDraft: true
      });
    }
    if (_0x43005a) {
      this._focusMenuEl?._syncValue?.();
    }
    this._statusEl.classList.toggle("is-visible", true);
    this._hintEl.classList.toggle("is-visible", true);
    this._syncAttachedUiVisibility(_0x37e11b);
    this._syncCaptureSafeFrame();
    const _0x3816e9 = this._bottomToolbarEl?.querySelector(".act-focus");
    if (_0x3816e9) {
      const _0x491a3f = _0x43005a ? "" : panoramaSceneText("toolbar.focus");
      if (_0x491a3f) {
        _0x3816e9.dataset.tooltip = _0x491a3f;
      } else {
        _0x3816e9.removeAttribute("data-tooltip");
      }
      _0x3816e9.setAttribute("aria-label", panoramaSceneText("toolbar.focus"));
    }
    this._positionMenus();
  }
  update(_0x9bd74) {
    const _0x34cc1c = this._sceneState;
    this._data = _0x9bd74;
    this._isPanorama360 = String(_0x9bd74?.type || "").trim() === PANORAMA_360_NODE_TYPE;
    this.el.classList.toggle("is-panorama-360", this._isPanorama360);
    this._sceneState = getPanoramaSceneState(_0x9bd74);
    if (!this._sceneState.ui.isEditing) {
      this._openMenuKey = null;
    }
    this._maybePreloadCharacterModels(_0x34cc1c);
    if (!this._isPanorama360 && this._sceneState?.mode === "scene" && (!_0x34cc1c || !this._isDefaultSceneView(_0x34cc1c?.viewport?.sceneView) && this._isDefaultSceneView(this._sceneState?.viewport?.sceneView))) {
      this._setDefaultSceneFocalLength(SCENE_DEFAULT_FOCAL_LENGTH_MM);
    } else {
      this._bridge?.setDefaultSceneFocalLength?.(this._defaultSceneFocalLength);
    }
    this._syncToolbarState();
    this._syncGridPanelValues();
    renderMannequinQuickMenu(this._mannequinMenuEl, this._sceneState);
    renderSceneAssetBrowser(this._assetBrowserEl);
    renderMannequinPosePanel(this._posePanelEl, this._sceneState);
    const _0x2acf1e = normalizeCameraTimeline(this._sceneState?.cameraTimeline);
    if (!this._isTimelinePlaying) {
      this._timelinePreviewTime = _0x2acf1e.currentTime;
    }
    renderCameraTimelinePanel(this._timelinePanelEl, _0x2acf1e, {
      currentTime: this._timelinePreviewTime,
      isPlaying: this._isTimelinePlaying
    });
    this._renderCameraPresetList();
    this._syncHintAndStatus();
    this._syncCaptureMenuState();
    this._syncOverlayState();
    this._bridge?.sync?.(this._sceneState);
    this._maybeReleasePendingCameraJumpDraft();
  }
  unmount() {
    this._isUnmounted = true;
    clearTimeout(this._menuHideTimer);
    this._fileInput?.removeEventListener("change", this._handleFileInputChange);
    this._viewportEl?.removeEventListener("pointerdown", this._handleViewportPointerDown);
    this._viewportEl?.removeEventListener("contextmenu", this._handleViewportContextMenu);
    this._viewportEl?.removeEventListener("dblclick", this._handleViewportDoubleClick);
    this.el?.removeEventListener("pointerenter", this._handleNodePointerEnter);
    this.el?.removeEventListener("pointerleave", this._handleNodePointerLeave);
    this._sceneToolbarEl?.removeEventListener("click", this._handleToolbarClick);
    this._editToolbarEl?.removeEventListener("click", this._handleToolbarClick);
    this._cornerToolbarEl?.removeEventListener("click", this._handleToolbarClick);
    this._bottomToolbarEl?.removeEventListener("click", this._handleToolbarClick);
    this._bottomToolbarEl?.removeEventListener("pointerover", this._handleBottomToolbarPointerEnter);
    this._bottomToolbarEl?.removeEventListener("pointerout", this._handleBottomToolbarPointerLeave);
    this._captureMenuEl?.removeEventListener("click", this._handleCaptureMenuClick);
    this._unsubscribeSelection?.();
    this._unsubscribeSelection = null;
    this._unsubscribeViewport?.();
    this._unsubscribeViewport = null;
    this._unsubscribePanoramaIncomingSync?.();
    this._unsubscribePanoramaIncomingSync = null;
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    window.removeEventListener("resize", this._handleWindowResize);
    window.removeEventListener("pointerdown", this._handleGlobalPointerDown, true);
    window.removeEventListener("keydown", this._handleWindowKeyDown, true);
    window.removeEventListener("keyup", this._handleWindowKeyUp, true);
    window.removeEventListener("blur", this._handleWindowBlur);
    window.removeEventListener("shortcuts-updated", this._handleShortcutsUpdated);
    window.removeEventListener("panorama-scene:camera-shortcut", this._handleCameraShortcutEvent);
    window.removeEventListener("panorama-scene:capture-shortcut", this._handleCaptureShortcutEvent);
    this._exitBrowserFullscreen({
      skipSync: true
    });
    if (this._cameraJumpRaf) {
      cancelAnimationFrame(this._cameraJumpRaf);
      this._cameraJumpRaf = 0;
    }
    if (this._pendingCameraJumpReleaseRaf) {
      cancelAnimationFrame(this._pendingCameraJumpReleaseRaf);
      this._pendingCameraJumpReleaseRaf = 0;
    }
    this._pendingCameraJumpCommit = null;
    this._stopCameraTimelinePlayback({
      clearDraft: true
    });
    this._resizeObserver?.disconnect();
    this._interaction?.detach?.();
    this._bridge?.dispose?.();
  }
}