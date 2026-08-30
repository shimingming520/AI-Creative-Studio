import { t } from "../../i18n/index.js";
import { bindAIGenTextModelSelector, renderAIGenTextModelSelectorMarkup } from "../../components/aigenText/modelSelector.js";
import { fetchStoryboard3DModelPackAssetFile, getStoryboard3DModelPackStatus } from "../../../api/storyboard3dModelPackApi.js";
import { applyOrbitDelta, applySceneFlyLookDelta, applySceneFlyMovement, applySceneDollyDelta, applyScenePanDelta, applySceneZoomDelta, normalizeWheelDelta, resolveSceneCameraPose } from "../../core/panoramaSceneMath.js";
import { createStoryboard3DEditorStore } from "./editorStore.js";
import { createDefaultStoryboard3DCameraState, createStoryboard3DScene, getActiveStoryboard3DScene, getActiveStoryboard3DShot, summarizeStoryboard3DProject, syncStoryboard3DCameraObjectFromShot, syncStoryboard3DShotFromCameraObject } from "./projectModel.js";
import { createStoryboard3DProjectStore } from "./projectStore.js";
import { createStoryboard3DSceneRuntime } from "./sceneRuntime.js";
import { createStoryboard3DShotTimelineController } from "./shotTimelineController.js";
import { upsertStoryboard3DCameraKeyframe } from "./shotAnimation.js";
import { createCommandHistory, createStoryboard3DProjectMutationCommand, createStoryboard3DTransformCommand } from "./commandHistory.js";
import { appendShotFromCurrentView, appendStoryboard3DShotCandidate, duplicateStoryboard3DShot, deleteStoryboard3DShot, describeStoryboard3DShot, renameStoryboard3DShot, reorderStoryboard3DShot, replaceStoryboard3DShotCamera, replaceStoryboard3DShotWithCandidate, setStoryboard3DCameraFocalLength, STORYBOARD_3D_FOCAL_LENGTH_PRESETS } from "./cameraShotSystem.js";
import { generateStoryboard3DShotCandidates } from "./shotExploration.js";
import { createStoryboard3DExportController } from "./exportController.js";
import { createStoryboard3DAssetLibrary, getStoryboard3DAssetCategoryLabel, STORYBOARD_3D_ASSET_CATEGORIES } from "./assetLibrary.js";
import { getStoryboard3DAssetSpatialExtent } from "./spatialLayout.js";
import { createStoryboard3DBuiltinAssetThumbnailModel, createStoryboard3DAssetThumbnailRenderer, disposeStoryboard3DAssetThumbnailModel, storyboard3DAssetThumbnailCache } from "./assetThumbnailRenderer.js";
import { STORYBOARD_3D_MODEL_ACCEPT, importStoryboard3DModelFile, setStoryboard3DModelNormalization } from "./modelImport.js";
import { createThreeStoryboard3DModelParsers } from "./legacyModelImportAdapters.js";
import { createThreeWorkerBackedStoryboard3DModelParsers } from "./workerModelImportAdapters.js";
import { createStoryboard3DBoneOverridesSignature, createStoryboard3DCharacterImagePoseController } from "./characterImagePoseController.js";
import { applyStoryboard3DTexturePolicy, preflightStoryboard3DImageFile } from "./texturePolicy.js";
import { STORYBOARD_3D_ACTIONS, STORYBOARD_3D_BODY_PRESETS, STORYBOARD_3D_HAND_POSES, seekStoryboard3DCharacterAction, setStoryboard3DCharacterActionPlayback, quaternionToStoryboard3DEuler, setStoryboard3DBoneOverride } from "./characterRig.js";
import { computeStoryboard3DMiniMapObjectDrag, createStoryboard3DMiniMapCameraMarker, createStoryboard3DMiniMapProjection, projectStoryboard3DTopViewFootprint, projectStoryboard3DWorldToMiniMapRatio } from "./miniMapMath.js";
import { deriveStoryboard3DBackgroundCamera, guardStoryboard3DBackgroundCameraChange, normalizeStoryboard3DBackgroundCalibration, setStoryboard3DBackgroundCameraLock, updateStoryboard3DBackgroundCalibration } from "./backgroundCalibration.js";
import { computeStoryboard3DBackgroundGuideGeometry, createStoryboard3DBackgroundCalibrationInteraction } from "./backgroundCalibrationInteraction.js";
import { analyzeStoryboard3DBackgroundImage } from "./backgroundPerspectiveEstimator.js";
import { createStoryboard3DAIVoiceController, createStoryboard3DSafeToolExecutor } from "./aiVoiceController.js";
import { getStoryWorkspaceModelChoice, resolveStoryWorkspaceModelId } from "../storyWorkspace/storyWorkspaceModelCatalog.js";
import { getDisplayModelName } from "../providers.js";
import { createStoryboard3DViewportControlSystem, normalizeStoryboard3DViewportSettings } from "./viewportControlSystem.js";
import { createStoryboard3DTransformSession, updateStoryboard3DTransformSession } from "./transformSession.js";
import { canStoryboard3DObjectEditTransformField, canStoryboard3DObjectUseTransformTool, getStoryboard3DObjectTransformCapabilities } from "./objectTransformCapabilities.js";
import { getStoryboard3DNavigationHelpText, resolveStoryboard3DNavigationMode } from "./viewportNavigationProtocol.js";
import { STORYBOARD_3D_NAVIGATION_PRESETS, createStoryboard3DNavigationPresetSettings, getStoryboard3DToolShortcut, loadStoryboard3DNavigationSettings, resolveStoryboard3DToolFromShortcut, saveStoryboard3DNavigationSettings } from "./viewportNavigationSettings.js";
import { loadStoryboard3DTransformSettings, saveStoryboard3DTransformSettings } from "./viewportTransformSettings.js";
import { createStoryboard3DSelectionRect, hasStoryboard3DSelectionDragMoved, mergeStoryboard3DBoxSelection } from "./selectionBox.js";
import { trapStoryboard3DTabKey } from "./focusTrap.js";
import { applyStoryboard3DEnvironmentPreset, deleteStoryboard3DScene, duplicateStoryboard3DScene, renameStoryboard3DScene, reorderStoryboard3DScene, replaceStoryboard3DShotFromCurrentView, createStoryboard3DShotThumbnailToken, applyStoryboard3DShotThumbnail } from "./sceneProjectOperations.js";
import { createStoryboard3DBackgroundImageController } from "./backgroundImageController.js";
import { STORYBOARD_3D_BINARY_ASSET_DB_NAME, STORYBOARD_3D_BINARY_ASSET_STORE_NAME, createStoryboard3DBinaryAssetRepository } from "./binaryAssetRepository.js";
import { createCanonicalStoryboard3DAssetId, createStoryboard3DAssetRecord } from "./assetRecord.js";
import { containWorkspaceContextMenu } from "../workspaceContextMenuGuard.js";
import { deleteStoryboard3DSceneGroup, groupStoryboard3DSceneObjects, setStoryboard3DObjectParent, ungroupStoryboard3DSceneGroup } from "./sceneHierarchy.js";
import { createStoryboard3DModelImportJob, disposeCancelledStoryboard3DModelImportResult } from "./modelImportJob.js";
function escapeHtml(_0x31e3aa) {
  return String(_0x31e3aa ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function dispatchWorkspaceEvent(_0x349aa4, _0x639618, _0x1a4bfd) {
  if (!_0x349aa4?.dispatchEvent || typeof _0x349aa4.CustomEvent !== "function") {
    return;
  }
  _0x349aa4.dispatchEvent(new _0x349aa4.CustomEvent(_0x639618, {
    detail: _0x1a4bfd
  }));
}
function setStoryboard3DShotInitialCamera(_0x529569, _0x5113ca, _0x320e85) {
  if (!_0x529569 || !_0x5113ca || !_0x320e85) {
    return;
  }
  _0x5113ca.camera = {
    ..._0x5113ca.camera,
    ..._0x320e85,
    position: [..._0x320e85.position],
    target: [..._0x320e85.target]
  };
  _0x5113ca.animation = upsertStoryboard3DCameraKeyframe(_0x5113ca.animation, {
    time: 0,
    camera: _0x5113ca.camera
  });
  syncStoryboard3DCameraObjectFromShot(_0x529569, _0x5113ca);
}
function restoreStoryboard3DStoredFile(_0x1d8dbf, _0x46ebde = globalThis.window) {
  if (!_0x1d8dbf?.blob) {
    return null;
  }
  const _0x155b05 = _0x46ebde?.File || globalThis.File;
  if (typeof _0x155b05 === "function") {
    const _0xb938c4 = new _0x155b05([_0x1d8dbf.blob], _0x1d8dbf.name, {
      type: _0x1d8dbf.type || _0x1d8dbf.blob.type,
      lastModified: _0x1d8dbf.lastModified || 0
    });
    if (_0x1d8dbf.relativePath && _0x1d8dbf.relativePath !== _0x1d8dbf.name) {
      Object.defineProperty(_0xb938c4, "webkitRelativePath", {
        configurable: true,
        value: _0x1d8dbf.relativePath
      });
    }
    return _0xb938c4;
  }
  const _0x330542 = _0x1d8dbf.blob;
  for (const [_0x2991fa, _0x46d205] of Object.entries({
    name: _0x1d8dbf.name,
    lastModified: _0x1d8dbf.lastModified || 0,
    webkitRelativePath: _0x1d8dbf.relativePath || _0x1d8dbf.name
  })) {
    try {
      Object.defineProperty(_0x330542, _0x2991fa, {
        configurable: true,
        value: _0x46d205
      });
    } catch {}
  }
  return _0x330542;
}
function getSaveStatusLabel(_0x3bcdc0) {
  if (_0x3bcdc0 === "saving") {
    return t("storyboard3d.saveStatus.saving");
  }
  if (_0x3bcdc0 === "error") {
    return t("storyboard3d.saveStatus.error");
  }
  return t("storyboard3d.saveStatus.saved");
}
function renderObjectOutline(_0x22f4b3, _0x16ad10 = [], {
  query = "",
  type = "all"
} = {}) {
  if (!_0x22f4b3 || _0x22f4b3.objects.length === 0) {
    return "<div class=\"storyboard-3d-empty-state\">\n      <strong>" + escapeHtml(t("storyboard3d.editor.emptyOutlineTitle")) + "</strong>\n      <span>" + escapeHtml(t("storyboard3d.editor.emptyOutlineDescription")) + "</span>\n    </div>";
  }
  const _0x32bd41 = String(query || "").trim().toLocaleLowerCase();
  const _0x218ed1 = _0x22f4b3.objects.filter(_0x14cf9d => {
    if (type !== "all" && _0x14cf9d.type !== type) {
      return false;
    }
    return !_0x32bd41 || (_0x14cf9d.name + " " + _0x14cf9d.type).toLocaleLowerCase().includes(_0x32bd41);
  });
  if (_0x218ed1.length === 0) {
    return "<div class=\"storyboard-3d-empty-state\"><strong>没有匹配对象</strong><span>调整名称或类型筛选。</span></div>";
  }
  const _0x565653 = new Map(_0x22f4b3.objects.map(_0xe60558 => [_0xe60558.id, _0xe60558]));
  const _0x15ea64 = _0x400b62 => {
    let _0x57a96f = 0;
    let _0x3dbd2d = _0x400b62.parentId;
    const _0x1b9564 = new Set([_0x400b62.id]);
    while (_0x3dbd2d && _0x565653.has(_0x3dbd2d) && !_0x1b9564.has(_0x3dbd2d) && _0x57a96f < 4) {
      _0x1b9564.add(_0x3dbd2d);
      _0x57a96f += 1;
      _0x3dbd2d = _0x565653.get(_0x3dbd2d)?.parentId;
    }
    return _0x57a96f;
  };
  return _0x218ed1.map(_0x8e97fe => {
    const _0x24b79d = _0x8e97fe.visible !== false;
    const _0x47acea = _0x8e97fe.locked === true;
    const _0x1054be = escapeHtml(_0x8e97fe.name);
    return "<div draggable=\"true\" class=\"storyboard-3d-object-row is-depth-" + _0x15ea64(_0x8e97fe) + " " + (_0x16ad10.includes(_0x8e97fe.id) ? "is-active" : "") + "\" data-object-type=\"" + escapeHtml(_0x8e97fe.type) + "\" data-object-id=\"" + escapeHtml(_0x8e97fe.id) + "\">\n          <button type=\"button\" class=\"storyboard-3d-object-row-select\" data-storyboard-3d-action=\"select-object\" data-object-id=\"" + escapeHtml(_0x8e97fe.id) + "\" data-object-type=\"" + escapeHtml(_0x8e97fe.type) + "\" aria-pressed=\"" + _0x16ad10.includes(_0x8e97fe.id) + "\" aria-label=\"选择 " + _0x1054be + "\">\n            <span class=\"storyboard-3d-object-type\">" + escapeHtml(_0x8e97fe.type) + "</span>\n          </button>\n          <input type=\"text\" class=\"storyboard-3d-object-row-name-input\" value=\"" + _0x1054be + "\" maxlength=\"120\" draggable=\"false\" data-storyboard-3d-action=\"edit-object-name\" data-storyboard-3d-outline-name data-storyboard-3d-object-name data-object-id=\"" + escapeHtml(_0x8e97fe.id) + "\" data-object-type=\"" + escapeHtml(_0x8e97fe.type) + "\" aria-label=\"重命名 " + _0x1054be + "\" title=\"点击重命名\">\n          <span class=\"storyboard-3d-object-row-actions\" role=\"group\" aria-label=\"" + _0x1054be + " 对象状态\">\n            <button type=\"button\" class=\"storyboard-3d-object-state-button " + (_0x24b79d ? "" : "is-off") + "\" data-storyboard-3d-action=\"toggle-object-visibility\" data-object-id=\"" + escapeHtml(_0x8e97fe.id) + "\" aria-pressed=\"" + _0x24b79d + "\" aria-label=\"" + (_0x24b79d ? "隐藏" : "显示") + " " + _0x1054be + "\" title=\"" + (_0x24b79d ? "隐藏对象" : "显示对象") + "\">" + renderStoryboard3DControlIcon(_0x24b79d ? "eye" : "eyeOff") + "</button>\n            <button type=\"button\" class=\"storyboard-3d-object-state-button " + (_0x47acea ? "is-locked" : "") + "\" data-storyboard-3d-action=\"toggle-object-lock\" data-object-id=\"" + escapeHtml(_0x8e97fe.id) + "\" aria-pressed=\"" + _0x47acea + "\" aria-label=\"" + (_0x47acea ? "解锁" : "锁定") + " " + _0x1054be + "\" title=\"" + (_0x47acea ? "解锁对象" : "锁定对象") + "\">" + renderStoryboard3DControlIcon(_0x47acea ? "lock" : "unlock") + "</button>\n            <button type=\"button\" class=\"storyboard-3d-object-state-button is-delete\" data-storyboard-3d-action=\"delete-object\" data-object-id=\"" + escapeHtml(_0x8e97fe.id) + "\" aria-label=\"删除 " + _0x1054be + "\" title=\"删除对象\">×</button>\n          </span>\n        </div>";
  }).join("");
}
function renderShotStrip(_0x1dc86f, {
  timelineOpen = false
} = {}) {
  if (!_0x1dc86f) {
    return "";
  }
  const _0x545359 = "<div class=\"storyboard-3d-shot-strip-heading\">\n    <strong>" + escapeHtml(t("storyboard3d.editor.shots")) + "</strong>\n    <button type=\"button\" class=\"storyboard-3d-shot-keyframe-trigger " + (timelineOpen ? "is-active" : "") + "\" data-storyboard-3d-action=\"timeline-toggle-drawer\" aria-expanded=\"" + timelineOpen + "\">关键帧</button>\n  </div>";
  const _0x38d9f = _0x1dc86f.shots.map((_0x1c98fb, _0x427417) => "<button type=\"button\" draggable=\"true\" class=\"storyboard-3d-shot-card " + (_0x1c98fb.id === _0x1dc86f.activeShotId ? "is-active" : "") + "\" data-storyboard-3d-action=\"select-shot\" data-shot-id=\"" + escapeHtml(_0x1c98fb.id) + "\" aria-pressed=\"" + (_0x1c98fb.id === _0x1dc86f.activeShotId) + "\">\n        <span class=\"storyboard-3d-shot-thumb\">\n          " + (_0x1c98fb.thumbnailUrl ? "<img src=\"" + escapeHtml(_0x1c98fb.thumbnailUrl) + "\" alt=\"" + escapeHtml(_0x1c98fb.name) + "\">" : "<span>" + escapeHtml(t("storyboard3d.editor.previewPending")) + "</span>") + "\n        </span>\n        <span class=\"storyboard-3d-shot-copy\">\n          <small>" + escapeHtml(t("storyboard3d.editor.shotNumber", {
    index: _0x427417 + 1
  })) + "</small>\n          <strong>" + escapeHtml(_0x1c98fb.name) + "</strong>\n          <span>" + escapeHtml(formatFocalLength(_0x1c98fb.camera.focalLength) + "mm · " + _0x1c98fb.shotSize) + "</span>\n        </span>\n      </button>").join("");
  const _0x29f800 = escapeHtml(t("storyboard3d.editor.addShot"));
  const _0x4f9e5b = escapeHtml(t("storyboard3d.editor.addShotDescription"));
  return "" + _0x545359 + _0x38d9f + "<button type=\"button\" class=\"storyboard-3d-shot-add-card\" data-storyboard-3d-action=\"add-shot\" aria-label=\"" + _0x29f800 + "\" title=\"" + _0x4f9e5b + "\">" + renderStoryboard3DControlIcon("camera") + "<strong>" + _0x29f800 + "</strong></button>";
}
function renderShotTimelineDrawerHandle(_0x48479a, _0x535f23) {
  const _0x3660c1 = _0x48479a ? "拖拽调整关键帧区域高度，点击收起" : "向上拖拽调整关键帧区域高度，点击展开";
  return "<button type=\"button\" class=\"storyboard-3d-timeline-drawer-handle " + (_0x48479a ? "is-open" : "") + "\" data-storyboard-3d-action=\"timeline-toggle-drawer\" data-storyboard-3d-timeline-resize-handle role=\"separator\" aria-orientation=\"horizontal\" aria-valuemin=\"120\" aria-valuemax=\"720\" aria-valuenow=\"" + _0x535f23 + "\" aria-expanded=\"" + _0x48479a + "\" aria-label=\"" + _0x3660c1 + "\">\n    <span class=\"storyboard-3d-timeline-drawer-grip\" aria-hidden=\"true\"></span>\n  </button>";
}
function formatFocalLength(_0x3ca560) {
  const _0x184b04 = Number(_0x3ca560);
  if (!Number.isFinite(_0x184b04)) {
    return "35";
  }
  const _0x59b764 = Math.round(_0x184b04 * 10) / 10;
  if (Number.isInteger(_0x59b764)) {
    return String(_0x59b764);
  } else {
    return _0x59b764.toFixed(1);
  }
}
function resolveStoryboard3DFocalPresetIndex(_0x5afde4) {
  const _0x3b0103 = Number(_0x5afde4);
  if (!Number.isFinite(_0x3b0103)) {
    return STORYBOARD_3D_FOCAL_LENGTH_PRESETS.indexOf(35);
  }
  return STORYBOARD_3D_FOCAL_LENGTH_PRESETS.reduce((_0x5b3f7e, _0x54d387, _0x24d405) => Math.abs(_0x54d387 - _0x3b0103) < Math.abs(STORYBOARD_3D_FOCAL_LENGTH_PRESETS[_0x5b3f7e] - _0x3b0103) ? _0x24d405 : _0x5b3f7e, 0);
}
function getStoryboard3DFocalPreset(_0x5baa3a) {
  const _0x1b9aee = Math.max(0, Math.min(STORYBOARD_3D_FOCAL_LENGTH_PRESETS.length - 1, Math.round(Number(_0x5baa3a) || 0)));
  return STORYBOARD_3D_FOCAL_LENGTH_PRESETS[_0x1b9aee];
}
function renderStoryboard3DFocalControl(_0x3e7a5c, _0xd8a48c) {
  if (!_0x3e7a5c) {
    return "";
  }
  const _0x391f83 = resolveStoryboard3DFocalPresetIndex(_0xd8a48c);
  const _0x20c3ba = STORYBOARD_3D_FOCAL_LENGTH_PRESETS[_0x391f83];
  const _0x1cf5d4 = _0x3e7a5c?.background?.lockedCamera === true;
  const _0x492b33 = _0x1cf5d4 ? "背景机位已锁定，请先解除锁定再调整视口焦距" : "拖动调整视口焦距；添加摄像机时才会保存";
  const _0x76a961 = [...STORYBOARD_3D_FOCAL_LENGTH_PRESETS].reverse().map(_0x390ca7 => {
    const _0xd56a62 = _0x390ca7 === _0x20c3ba ? " is-active" : "";
    if (_0x390ca7 === 35) {
      return "<button type=\"button\" class=\"storyboard-3d-focal-tick is-default" + _0xd56a62 + "\" data-storyboard-3d-action=\"reset-focal-length\" data-focal-length=\"35\" aria-label=\"恢复默认焦距 35mm\"><span aria-hidden=\"true\">35</span><small aria-hidden=\"true\">默认</small></button>";
    } else {
      return "<span class=\"storyboard-3d-focal-tick" + _0xd56a62 + "\" data-focal-length=\"" + _0x390ca7 + "\" aria-hidden=\"true\">" + _0x390ca7 + "</span>";
    }
  }).join("");
  return "<div class=\"storyboard-3d-focal-control\" title=\"" + _0x492b33 + "\">\n    <span class=\"storyboard-3d-focal-value\">焦距 <output data-storyboard-3d-focal-output>" + _0x20c3ba + "mm</output></span>\n    <span class=\"storyboard-3d-focal-slider-wrap\">\n      <input type=\"range\" min=\"0\" max=\"" + (STORYBOARD_3D_FOCAL_LENGTH_PRESETS.length - 1) + "\" step=\"1\" value=\"" + _0x391f83 + "\" data-storyboard-3d-focal-slider aria-label=\"镜头焦距\" aria-valuetext=\"" + _0x20c3ba + "mm\" " + (_0x1cf5d4 ? "disabled" : "") + ">\n      <span class=\"storyboard-3d-focal-ticks\">" + _0x76a961 + "</span>\n    </span>\n  </div>";
}
function createLocalId(_0x115a46) {
  const _0x225b8f = globalThis.crypto;
  if (typeof _0x225b8f?.randomUUID === "function") {
    return _0x115a46 + "-" + _0x225b8f.randomUUID();
  }
  return _0x115a46 + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}
function renderVectorInputs(_0x34671f, _0x13783c, _0x5660ce = []) {
  const _0x50b45c = _0x13783c === "rotation";
  return ["x", "y", "z"].map((_0x3cc658, _0x47cb4a) => "<label><span>" + _0x3cc658.toUpperCase() + (_0x50b45c ? "°" : "") + "</span><input type=\"number\" step=\"" + (_0x50b45c ? "1" : "0.01") + "\" value=\"" + escapeHtml((_0x50b45c ? Number(_0x5660ce[_0x47cb4a] || 0) * 180 / Math.PI : Number(_0x5660ce[_0x47cb4a] || 0)).toFixed(_0x50b45c ? 1 : 2)) + "\" data-storyboard-3d-transform-input data-object-id=\"" + escapeHtml(_0x34671f) + "\" data-transform-field=\"" + _0x13783c + "\" data-transform-axis=\"" + _0x47cb4a + "\"></label>").join("");
}
function renderSelectedObjectInspector(_0x81b8d3, _0x4c4cb1 = "Head", _0x524b9 = null, _0x3ed265 = [], _0x4c670e = null) {
  if (!_0x81b8d3) {
    return "<section class=\"storyboard-3d-inspector-card is-muted\">\n      <small>" + escapeHtml(t("storyboard3d.editor.selection")) + "</small>\n      <strong>" + escapeHtml(t("storyboard3d.editor.noSelection")) + "</strong>\n      <p>" + escapeHtml(t("storyboard3d.editor.noSelectionDescription")) + "</p>\n    </section>";
  }
  const _0x1339e3 = getStoryboard3DObjectTransformCapabilities(_0x81b8d3);
  const _0x431e48 = {
    position: "位置",
    rotation: "旋转",
    scale: "缩放"
  };
  const _0x55a368 = _0x1339e3.fields.length > 0 ? _0x1339e3.fields.map(_0x15b2b3 => "<div class=\"storyboard-3d-transform-group\"><strong>" + _0x431e48[_0x15b2b3] + "</strong><div>" + renderVectorInputs(_0x81b8d3.id, _0x15b2b3, _0x81b8d3.transform?.[_0x15b2b3]) + "</div></div>").join("") : "<p class=\"storyboard-3d-transform-unavailable\">该对象没有可生效的空间变换；请编辑下方对象参数。</p>";
  return "<section class=\"storyboard-3d-inspector-card storyboard-3d-object-inspector\">\n    <small>当前选择 · " + escapeHtml(_0x81b8d3.type) + "</small>\n    <input class=\"storyboard-3d-object-name-input\" value=\"" + escapeHtml(_0x81b8d3.name) + "\" maxlength=\"120\" data-storyboard-3d-object-name data-object-id=\"" + escapeHtml(_0x81b8d3.id) + "\" aria-label=\"对象名称\">\n    <label class=\"storyboard-3d-object-parent\"><span>所属分组</span><select data-storyboard-3d-object-parent data-object-id=\"" + escapeHtml(_0x81b8d3.id) + "\"><option value=\"\">无分组</option>" + _0x3ed265.filter(_0x2f5c4 => _0x2f5c4.id !== _0x81b8d3.id).map(_0x84bf2f => "<option value=\"" + escapeHtml(_0x84bf2f.id) + "\" " + (_0x81b8d3.parentId === _0x84bf2f.id ? "selected" : "") + ">" + escapeHtml(_0x84bf2f.name) + "</option>").join("") + "</select></label>\n    " + _0x55a368 + "\n    " + (_0x81b8d3.type === "prop" ? renderPropControls(_0x81b8d3, _0x524b9) : "") + "\n    " + (_0x81b8d3.type === "character" ? renderCharacterControls(_0x81b8d3, _0x4c4cb1, _0x4c670e) : "") + "\n    " + (_0x81b8d3.type === "light" ? renderLightControls(_0x81b8d3) : "") + "\n    " + (_0x81b8d3.type === "camera" ? renderCameraControls(_0x81b8d3) : "") + "\n    <div class=\"storyboard-3d-object-actions\">\n      " + (_0x81b8d3.type === "group" ? "<button type=\"button\" data-storyboard-3d-action=\"ungroup-object\" data-object-id=\"" + escapeHtml(_0x81b8d3.id) + "\">解除分组</button>" : "") + "\n      <button type=\"button\" data-storyboard-3d-action=\"duplicate-object\" data-object-id=\"" + escapeHtml(_0x81b8d3.id) + "\">复制</button>\n      <button type=\"button\" data-storyboard-3d-action=\"delete-object\" data-object-id=\"" + escapeHtml(_0x81b8d3.id) + "\">删除</button>\n    </div>\n  </section>";
}
function renderCameraControls(_0x405d90) {
  return "<div class=\"storyboard-3d-character-controls storyboard-3d-camera-controls\">\n    <label><span>焦距 mm</span><input type=\"number\" min=\"1\" max=\"200\" step=\"1\" value=\"" + escapeHtml(_0x405d90.focalLength ?? 35) + "\" data-storyboard-3d-camera-field=\"focalLength\" data-object-id=\"" + escapeHtml(_0x405d90.id) + "\"></label>\n    <label><span>宽高比</span><input type=\"text\" value=\"" + escapeHtml(_0x405d90.aspectRatio || "16:9") + "\" data-storyboard-3d-camera-field=\"aspectRatio\" data-object-id=\"" + escapeHtml(_0x405d90.id) + "\"></label>\n    <label><span>近裁剪面</span><input type=\"number\" min=\"0.001\" step=\"0.01\" value=\"" + escapeHtml(_0x405d90.near ?? 0.1) + "\" data-storyboard-3d-camera-field=\"near\" data-object-id=\"" + escapeHtml(_0x405d90.id) + "\"></label>\n    <label><span>远裁剪面</span><input type=\"number\" min=\"1\" step=\"1\" value=\"" + escapeHtml(_0x405d90.far ?? 1000) + "\" data-storyboard-3d-camera-field=\"far\" data-object-id=\"" + escapeHtml(_0x405d90.id) + "\"></label>\n    <p>该摄像机与对应 Shot 一对一绑定；移动、旋转和焦距修改会同步到镜头与摄像机关键帧。</p>\n  </div>";
}
function renderPropControls(_0x3e73fe, _0xdde7d7) {
  const _0xf142ca = _0xdde7d7?.assetRecord;
  return "<div class=\"storyboard-3d-character-controls storyboard-3d-prop-controls\">\n    <label><span>分类</span><input type=\"text\" value=\"" + escapeHtml(_0xdde7d7?.category || "道具") + "\" readonly></label>\n    " + (_0xf142ca ? "<label><span>格式 / 三角面</span><input type=\"text\" value=\"" + escapeHtml(_0xf142ca.sourceFormat.toUpperCase() + " · " + _0xf142ca.triangleCount) + "\" readonly></label>" : "") + "\n    <label><span>色调覆盖</span><input type=\"color\" value=\"" + escapeHtml(_0x3e73fe.tint || "#ffffff") + "\" data-storyboard-3d-prop-field=\"tint\" data-object-id=\"" + escapeHtml(_0x3e73fe.id) + "\"></label>\n    <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-prop-field=\"castShadow\" data-object-id=\"" + escapeHtml(_0x3e73fe.id) + "\" " + (_0x3e73fe.castShadow !== false ? "checked" : "") + ">投射阴影</label>\n    <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-prop-field=\"receiveShadow\" data-object-id=\"" + escapeHtml(_0x3e73fe.id) + "\" " + (_0x3e73fe.receiveShadow !== false ? "checked" : "") + ">接收阴影</label>\n  </div>";
}
function renderSelectOptions(_0x46e606, _0x1d268e) {
  return _0x46e606.map(_0xa13178 => "<option value=\"" + escapeHtml(_0xa13178.id) + "\" " + (_0xa13178.id === _0x1d268e ? "selected" : "") + ">" + escapeHtml(_0xa13178.name) + "</option>").join("");
}
const STORYBOARD_3D_EDITABLE_BONES = Object.freeze([["Head", "头部"], ["spine_02", "胸腔"], ["pelvis", "骨盆"], ["hand_l", "左手"], ["hand_r", "右手"], ["lowerarm_l", "左肘"], ["lowerarm_r", "右肘"], ["foot_l", "左脚"], ["foot_r", "右脚"], ["calf_l", "左膝"], ["calf_r", "右膝"]]);
const STORYBOARD_3D_INSPECTOR_MIN_WIDTH = 280;
const STORYBOARD_3D_INSPECTOR_MAX_WIDTH = 560;
const STORYBOARD_3D_VIEWPORT_MIN_WIDTH = 420;
const STORYBOARD_3D_INSPECTOR_SPLITTER_WIDTH = 14;
const STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH = 360;
const STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH = 1800;
const STORYBOARD_3D_RIGHT_SIDEBAR_VIEWPORT_MIN_WIDTH = 280;
const STORYBOARD_3D_TIMELINE_MIN_HEIGHT = 220;
const STORYBOARD_3D_TIMELINE_MAX_HEIGHT = 720;
const STORYBOARD_3D_TIMELINE_DEFAULT_HEIGHT = 340;
const STORYBOARD_3D_VIEWPORT_MIN_HEIGHT = 160;
export function normalizeStoryboard3DInspectorWidth(_0x5e61b5, _0x21626a = 1200) {
  const _0x348d56 = Number(_0x21626a);
  const _0x76c4e3 = Number.isFinite(_0x348d56) ? _0x348d56 - STORYBOARD_3D_VIEWPORT_MIN_WIDTH - STORYBOARD_3D_INSPECTOR_SPLITTER_WIDTH : STORYBOARD_3D_INSPECTOR_MAX_WIDTH;
  const _0x3d58ee = Math.max(STORYBOARD_3D_INSPECTOR_MIN_WIDTH, Math.min(STORYBOARD_3D_INSPECTOR_MAX_WIDTH, _0x76c4e3));
  const _0x37fa6b = Number(_0x5e61b5);
  const _0x211c8d = Math.min(360, _0x3d58ee);
  return Math.round(Math.max(STORYBOARD_3D_INSPECTOR_MIN_WIDTH, Math.min(_0x3d58ee, Number.isFinite(_0x37fa6b) ? _0x37fa6b : _0x211c8d)));
}
export function resolveStoryboard3DViewportCenterPosition(_0xf59468) {
  const _0x11ad5a = _0xf59468?.target;
  const _0x5c8559 = Array.isArray(_0x11ad5a) ? Number(_0x11ad5a[0]) : Number(_0x11ad5a?.x);
  const _0x455e1a = Array.isArray(_0x11ad5a) ? Number(_0x11ad5a[2]) : Number(_0x11ad5a?.z);
  return [Number.isFinite(_0x5c8559) ? _0x5c8559 : 0, 0, Number.isFinite(_0x455e1a) ? _0x455e1a : 0];
}
export function normalizeStoryboard3DRightSidebarWidth(_0x4c5c10, _0x2b8249 = 1440, _0x30c200 = "assets") {
  const _0x2ec310 = Number(_0x2b8249);
  const _0x4a81ca = Number.isFinite(_0x2ec310) ? _0x2ec310 - STORYBOARD_3D_RIGHT_SIDEBAR_VIEWPORT_MIN_WIDTH : STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH;
  const _0x5b08c7 = Math.max(STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH, Math.min(STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH, _0x4a81ca));
  const _0x5b82be = _0x4c5c10 == null ? Number.NaN : Number(_0x4c5c10);
  const _0x2415a6 = _0x30c200 !== "assets";
  const _0x199061 = Math.min(_0x2415a6 ? 480 : 960, Math.max(STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH, Number.isFinite(_0x2ec310) ? _0x2ec310 * (_0x2415a6 ? 0.21 : 0.42) : _0x2415a6 ? 360 : 720));
  return Math.round(Math.max(STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH, Math.min(_0x5b08c7, Number.isFinite(_0x5b82be) ? _0x5b82be : _0x199061)));
}
export function normalizeStoryboard3DTimelineHeight(_0x202e7b, _0x46af02 = 900) {
  const _0x2ed038 = Number(_0x46af02);
  const _0x84ba64 = Number.isFinite(_0x2ed038) ? Math.min(STORYBOARD_3D_TIMELINE_MIN_HEIGHT, Math.max(120, _0x2ed038 - STORYBOARD_3D_VIEWPORT_MIN_HEIGHT)) : STORYBOARD_3D_TIMELINE_MIN_HEIGHT;
  const _0xd5199b = Number.isFinite(_0x2ed038) ? _0x2ed038 - STORYBOARD_3D_VIEWPORT_MIN_HEIGHT : STORYBOARD_3D_TIMELINE_MAX_HEIGHT;
  const _0x2c74bd = Math.max(_0x84ba64, Math.min(STORYBOARD_3D_TIMELINE_MAX_HEIGHT, _0xd5199b));
  const _0x2c0909 = _0x202e7b == null ? Number.NaN : Number(_0x202e7b);
  const _0x172b54 = Math.min(STORYBOARD_3D_TIMELINE_DEFAULT_HEIGHT, _0x2c74bd);
  return Math.round(Math.max(_0x84ba64, Math.min(_0x2c74bd, Number.isFinite(_0x2c0909) ? _0x2c0909 : _0x172b54)));
}
function getCharacterPoseStatusText(_0xe11537 = {}) {
  if (_0xe11537.status === "running") {
    return "正在本地识别“" + (_0xe11537.fileName || "参考图") + "”…";
  }
  if (_0xe11537.status === "error") {
    return _0xe11537.error || "姿势识别失败。";
  }
  if (_0xe11537.status === "success") {
    const _0x515d11 = Math.round((Number(_0xe11537.confidence) || 0) * 100);
    const _0x9319d7 = _0xe11537.warningCount > 0 ? " · 部分遮挡关节已跳过" : "";
    return "已应用 " + (Number(_0xe11537.boneCount) || 0) + " 个骨骼 · 置信度 " + _0x515d11 + "%" + _0x9319d7;
  }
  return "支持单人全身 JPG、PNG、WebP；图片仅在本机处理。";
}
function reconcileCharacterPoseState(_0x49c70e, _0x351332) {
  if (_0x351332?.status === "success" && _0x351332.poseSignature !== createStoryboard3DBoneOverridesSignature(_0x49c70e?.boneOverrides)) {
    return {
      status: "idle",
      objectId: String(_0x49c70e?.id || "")
    };
  }
  return _0x351332;
}
function renderCharacterControls(_0x510853, _0x3e23c7 = "Head", _0x1ca555 = null) {
  const _0xf18864 = STORYBOARD_3D_ACTIONS.find(_0x4732b4 => _0x4732b4.id === _0x510853.actionId) || STORYBOARD_3D_ACTIONS[0];
  const _0x4690a2 = quaternionToStoryboard3DEuler(_0x510853.boneOverrides?.[_0x3e23c7]);
  const _0x2ee035 = _0x1ca555 || {
    status: "idle"
  };
  const _0x1dde49 = _0x2ee035.status === "running";
  const _0x6440a5 = Object.keys(_0x510853.boneOverrides || {}).length > 0;
  return "<div class=\"storyboard-3d-character-controls\">\n    <label><span>体型</span><select data-storyboard-3d-character-field=\"bodyPresetId\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\">" + renderSelectOptions(STORYBOARD_3D_BODY_PRESETS, _0x510853.bodyPresetId) + "</select></label>\n    <label><span>动作</span><select data-storyboard-3d-character-field=\"actionId\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\">" + renderSelectOptions(STORYBOARD_3D_ACTIONS, _0x510853.actionId) + "</select></label>\n    <label><span>左手</span><select data-storyboard-3d-character-field=\"leftHandPoseId\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\">" + renderSelectOptions(STORYBOARD_3D_HAND_POSES, _0x510853.leftHandPoseId) + "</select></label>\n    <label><span>右手</span><select data-storyboard-3d-character-field=\"rightHandPoseId\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\">" + renderSelectOptions(STORYBOARD_3D_HAND_POSES, _0x510853.rightHandPoseId) + "</select></label>\n    <label><span>发型</span><input type=\"text\" maxlength=\"80\" value=\"" + escapeHtml(_0x510853.hairId || "") + "\" placeholder=\"默认\" data-storyboard-3d-character-field=\"hairId\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\"></label>\n    <label class=\"is-wide\"><span>附件 ID（逗号分隔）</span><input type=\"text\" maxlength=\"500\" value=\"" + escapeHtml((_0x510853.attachmentIds || []).join(", ")) + "\" placeholder=\"hat-01, bag-02\" data-storyboard-3d-character-attachments data-object-id=\"" + escapeHtml(_0x510853.id) + "\"></label>\n    <label class=\"is-wide\"><span>动作时间 " + Number(_0x510853.actionTime || 0).toFixed(2) + "s</span><input type=\"range\" min=\"0\" max=\"" + escapeHtml(_0xf18864.duration || 1) + "\" step=\"0.01\" value=\"" + escapeHtml(_0x510853.actionTime || 0) + "\" data-storyboard-3d-character-time data-object-id=\"" + escapeHtml(_0x510853.id) + "\"></label>\n    <button type=\"button\" data-storyboard-3d-action=\"toggle-character-play\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\">" + (_0x510853.actionPlaying ? "暂停动作" : "播放动作") + "</button>\n    <section class=\"storyboard-3d-character-pose-from-image\" data-storyboard-3d-character-pose data-object-id=\"" + escapeHtml(_0x510853.id) + "\" data-pose-status=\"" + escapeHtml(_0x2ee035.status || "idle") + "\" data-has-pose=\"" + _0x6440a5 + "\" aria-busy=\"" + _0x1dde49 + "\">\n      <div>\n        <strong>参考图姿势</strong>\n        <small>MediaPipe Heavy · 本地单人识别</small>\n      </div>\n      <div class=\"storyboard-3d-character-pose-actions\">\n        <button type=\"button\" class=\"is-primary\" data-storyboard-3d-action=\"extract-character-pose\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\" " + (_0x1dde49 ? "disabled" : "") + ">" + (_0x1dde49 ? "识别中…" : "从图片提取姿势") + "</button>\n        <button type=\"button\" data-storyboard-3d-action=\"" + (_0x1dde49 ? "cancel-character-pose" : "reset-character-pose") + "\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\" " + (!_0x1dde49 && !_0x6440a5 ? "disabled" : "") + ">" + (_0x1dde49 ? "取消识别" : "重置骨骼") + "</button>\n      </div>\n      <p data-storyboard-3d-character-pose-status role=\"status\" aria-live=\"polite\">" + escapeHtml(getCharacterPoseStatusText(_0x2ee035)) + "</p>\n    </section>\n    <div class=\"storyboard-3d-bone-editor\">\n      <label><span>骨骼微调</span><select data-storyboard-3d-bone-select data-object-id=\"" + escapeHtml(_0x510853.id) + "\">" + STORYBOARD_3D_EDITABLE_BONES.map(([_0x1f6e1e, _0x4b8c90]) => "<option value=\"" + _0x1f6e1e + "\" " + (_0x1f6e1e === _0x3e23c7 ? "selected" : "") + ">" + _0x4b8c90 + "</option>").join("") + "</select></label>\n      <div>" + ["x", "y", "z"].map(_0x35ad1d => "<label><span>" + _0x35ad1d.toUpperCase() + "°</span><input type=\"number\" min=\"-180\" max=\"180\" step=\"1\" value=\"" + escapeHtml(Math.round((_0x4690a2[_0x35ad1d] || 0) * 180 / Math.PI)) + "\" data-storyboard-3d-bone-axis=\"" + _0x35ad1d + "\" data-bone-name=\"" + escapeHtml(_0x3e23c7) + "\" data-object-id=\"" + escapeHtml(_0x510853.id) + "\"></label>").join("") + "</div>\n    </div>\n  </div>";
}
function renderLightControls(_0x867bba) {
  return "<div class=\"storyboard-3d-character-controls storyboard-3d-light-controls\">\n    <label><span>类型</span><select data-storyboard-3d-light-field=\"lightType\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\">\n      " + ["ambient", "directional", "point", "spot"].map(_0xd6546 => "<option value=\"" + _0xd6546 + "\" " + (_0x867bba.lightType === _0xd6546 ? "selected" : "") + ">" + _0xd6546 + "</option>").join("") + "\n    </select></label>\n    <label><span>强度</span><input type=\"number\" min=\"0\" max=\"100\" step=\"0.1\" value=\"" + escapeHtml(_0x867bba.intensity ?? 1) + "\" data-storyboard-3d-light-field=\"intensity\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\"></label>\n    <label><span>颜色</span><input type=\"color\" value=\"" + escapeHtml(_0x867bba.color || "#ffffff") + "\" data-storyboard-3d-light-field=\"color\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\"></label>\n    <label><span>衰减距离</span><input type=\"number\" min=\"0\" max=\"10000\" step=\"0.1\" value=\"" + escapeHtml(_0x867bba.distance ?? 0) + "\" data-storyboard-3d-light-field=\"distance\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\"></label>\n    <label><span>衰减系数</span><input type=\"number\" min=\"0\" max=\"10\" step=\"0.1\" value=\"" + escapeHtml(_0x867bba.decay ?? 2) + "\" data-storyboard-3d-light-field=\"decay\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\"></label>\n    <label><span>聚光角度°</span><input type=\"number\" min=\"1\" max=\"179\" step=\"1\" value=\"" + escapeHtml(Math.round((_0x867bba.angle ?? Math.PI / 6) * 180 / Math.PI)) + "\" data-storyboard-3d-light-field=\"angleDegrees\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\"></label>\n    <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-light-field=\"castShadow\" data-object-id=\"" + escapeHtml(_0x867bba.id) + "\" " + (_0x867bba.castShadow === true ? "checked" : "") + ">投射阴影</label>\n  </div>";
}
function renderBackgroundCalibrationGuide(_0x2f5678) {
  const _0x2f0bb1 = normalizeStoryboard3DBackgroundCalibration(_0x2f5678);
  if (!_0x2f0bb1.imageUrl) {
    return "";
  }
  const _0x158b8e = computeStoryboard3DBackgroundGuideGeometry(_0x2f0bb1);
  const [_0xec3fb9, _0xe07787] = _0x158b8e.vanishingPoint;
  const _0x3172f0 = Math.round(_0x2f0bb1.calibrationConfidence * 100);
  return "<div class=\"storyboard-3d-background-calibration-guide\" aria-hidden=\"true\">\n    <svg viewBox=\"0 0 1000 1000\" preserveAspectRatio=\"none\">\n      <polygon class=\"storyboard-3d-background-ground-region\" data-storyboard-3d-background-ground-region points=\"" + _0x158b8e.groundPoints + "\"></polygon>\n      <line class=\"storyboard-3d-background-axis\" data-storyboard-3d-background-axis-left x1=\"" + _0xec3fb9 + "\" y1=\"" + _0xe07787 + "\" x2=\"0\" y2=\"1000\"></line>\n      <line class=\"storyboard-3d-background-axis\" data-storyboard-3d-background-axis-right x1=\"" + _0xec3fb9 + "\" y1=\"" + _0xe07787 + "\" x2=\"1000\" y2=\"1000\"></line>\n      <line class=\"storyboard-3d-background-horizon\" data-storyboard-3d-background-horizon-line x1=\"0\" y1=\"" + _0x158b8e.leftY + "\" x2=\"1000\" y2=\"" + _0x158b8e.rightY + "\"></line>\n      <line class=\"storyboard-3d-background-horizon-hit\" data-storyboard-3d-background-horizon-line data-storyboard-3d-background-drag=\"horizon\" x1=\"0\" y1=\"" + _0x158b8e.leftY + "\" x2=\"1000\" y2=\"" + _0x158b8e.rightY + "\"></line>\n      <circle class=\"storyboard-3d-background-vanishing-point\" data-storyboard-3d-background-vanishing-point cx=\"" + _0xec3fb9 + "\" cy=\"" + _0xe07787 + "\" r=\"9\"></circle>\n      <circle class=\"storyboard-3d-background-vanishing-point-hit\" data-storyboard-3d-background-vanishing-point data-storyboard-3d-background-drag=\"vanishing-point\" cx=\"" + _0xec3fb9 + "\" cy=\"" + _0xe07787 + "\" r=\"24\"></circle>\n    </svg>\n    <span data-storyboard-3d-background-guide-status>拖动青线或黄点调整 · " + _0x3172f0 + "%</span>\n  </div>";
}
function renderSceneControls(_0x4c29fe, _0x46bedf, _0x178299 = {}, _0xc9eba4 = false) {
  const _0x54b6ad = normalizeStoryboard3DBackgroundCalibration(_0x4c29fe?.background);
  const _0x2fd07f = Math.max(0, Math.min(1, _0x54b6ad.horizonY + _0x54b6ad.horizonSlope * (_0x54b6ad.vanishingPoint[0] - 0.5)));
  return "<section class=\"storyboard-3d-inspector-card storyboard-3d-scene-controls\">\n    <small>场景设置</small>\n    <input class=\"storyboard-3d-scene-name-input\" type=\"text\" maxlength=\"120\" value=\"" + escapeHtml(_0x4c29fe?.name || "") + "\" data-storyboard-3d-scene-name data-scene-id=\"" + escapeHtml(_0x4c29fe?.id || "") + "\" aria-label=\"场景名称\">\n    <details class=\"storyboard-3d-scene-environment\" data-storyboard-3d-scene-environment " + (_0xc9eba4 ? "open" : "") + ">\n      <summary data-storyboard-3d-action=\"toggle-scene-environment\"><span>环境与参考背景</span><small>展开设置</small></summary>\n      <div class=\"storyboard-3d-scene-control-grid\">\n      <label><span>环境</span><select data-storyboard-3d-scene-field=\"environmentType\">\n        " + ["empty", "outdoor", "indoor", "studio"].map(_0x427b2d => "<option value=\"" + _0x427b2d + "\" " + (_0x4c29fe?.environment?.type === _0x427b2d ? "selected" : "") + ">" + _0x427b2d + "</option>").join("") + "\n      </select></label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-scene-field=\"showGrid\" " + (_0x4c29fe?.environment?.showGrid !== false ? "checked" : "") + ">显示网格</label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-scene-field=\"showOutline\" " + (_0x4c29fe?.environment?.showOutline !== false ? "checked" : "") + ">选择描边</label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-scene-field=\"enableShadows\" " + (_0x4c29fe?.environment?.enableShadows !== false ? "checked" : "") + ">启用阴影</label>\n      <label class=\"is-wide\"><span>参考背景 URL</span><input type=\"url\" value=\"" + escapeHtml(_0x54b6ad.imageUrl) + "\" placeholder=\"https://…\" data-storyboard-3d-background-field=\"imageUrl\"></label>\n      <label><span>水平 FOV</span><input type=\"number\" min=\"10\" max=\"170\" step=\"1\" value=\"" + _0x54b6ad.horizontalFov + "\" data-storyboard-3d-background-field=\"horizontalFov\"></label>\n      <label><span>垂直 FOV</span><input type=\"number\" min=\"10\" max=\"170\" step=\"1\" value=\"" + (_0x54b6ad.verticalFov || 40) + "\" data-storyboard-3d-background-field=\"verticalFov\"></label>\n      <label><span>地平线</span><input type=\"number\" min=\"0\" max=\"1\" step=\"0.01\" value=\"" + _0x54b6ad.horizonY + "\" data-storyboard-3d-background-field=\"horizonY\"></label>\n      <label><span>地平线倾斜</span><input type=\"number\" min=\"-1\" max=\"1\" step=\"0.01\" value=\"" + _0x54b6ad.horizonSlope + "\" data-storyboard-3d-background-field=\"horizonSlope\"></label>\n      <label><span>相机高度 m</span><input type=\"number\" min=\"0.2\" max=\"20\" step=\"0.1\" value=\"" + _0x54b6ad.cameraHeight + "\" data-storyboard-3d-background-field=\"cameraHeight\"></label>\n      <label><span>背景缩放</span><input type=\"number\" min=\"0.1\" max=\"10\" step=\"0.1\" value=\"" + _0x54b6ad.imageScale + "\" data-storyboard-3d-background-field=\"imageScale\"></label>\n      <label><span>消失点 X</span><input type=\"number\" min=\"0\" max=\"1\" step=\"0.01\" value=\"" + _0x54b6ad.vanishingPoint[0] + "\" data-storyboard-3d-background-field=\"vanishingPointX\"></label>\n      <label><span>消失点 Y（自动）</span><input type=\"number\" value=\"" + _0x2fd07f.toFixed(3) + "\" disabled></label>\n      <label><span>背景偏移 X</span><input type=\"number\" min=\"-2\" max=\"2\" step=\"0.01\" value=\"" + _0x54b6ad.imageOffset[0] + "\" data-storyboard-3d-background-field=\"imageOffsetX\"></label>\n      <label><span>背景偏移 Y</span><input type=\"number\" min=\"-2\" max=\"2\" step=\"0.01\" value=\"" + _0x54b6ad.imageOffset[1] + "\" data-storyboard-3d-background-field=\"imageOffsetY\"></label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-background-lock " + (_0x54b6ad.lockedCamera ? "checked" : "") + " " + (!_0x54b6ad.imageUrl ? "disabled" : "") + ">锁定背景机位</label>\n      </div>\n    </details>\n    <div class=\"storyboard-3d-viewport-settings\">\n      <label><span>变换空间</span><select data-storyboard-3d-viewport-setting=\"transformSpace\"><option value=\"world\" " + (_0x178299.transformSpace !== "local" ? "selected" : "") + ">世界</option><option value=\"local\" " + (_0x178299.transformSpace === "local" ? "selected" : "") + ">本地</option></select></label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-viewport-setting=\"groundLock\" " + (_0x178299.groundLock ? "checked" : "") + ">地面吸附</label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-viewport-setting=\"uniformScale\" " + (_0x178299.uniformScale ? "checked" : "") + ">均匀缩放</label>\n      <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-viewport-setting=\"snapEnabled\" " + (_0x178299.snapEnabled ? "checked" : "") + ">启用吸附</label>\n      <label><span>移动步长</span><input type=\"number\" min=\"0.01\" max=\"10\" step=\"0.01\" value=\"" + escapeHtml(_0x178299.translationSnap || 0.25) + "\" data-storyboard-3d-viewport-setting=\"translationSnap\"></label>\n      <label><span>旋转步长°</span><input type=\"number\" min=\"1\" max=\"180\" step=\"1\" value=\"" + escapeHtml(Math.round((_0x178299.rotationSnap || Math.PI / 12) * 180 / Math.PI)) + "\" data-storyboard-3d-viewport-setting=\"rotationSnapDegrees\"></label>\n      <label><span>缩放步长</span><input type=\"number\" min=\"0.01\" max=\"10\" step=\"0.01\" value=\"" + escapeHtml(_0x178299.scaleSnap || 0.1) + "\" data-storyboard-3d-viewport-setting=\"scaleSnap\"></label>\n    </div>\n    <div class=\"storyboard-3d-scene-control-actions\">\n      <button type=\"button\" data-storyboard-3d-action=\"add-light\">添加灯光</button>\n      <button type=\"button\" data-storyboard-3d-action=\"upload-background\">上传背景</button>\n      <button type=\"button\" data-storyboard-3d-action=\"analyze-background\" " + (_0x54b6ad.binaryAssetId ? "" : "disabled") + ">重新自动匹配</button>\n      <button type=\"button\" data-storyboard-3d-action=\"clear-background\" " + (_0x54b6ad.imageUrl ? "" : "disabled") + ">清除背景</button>\n      <small>" + (_0x54b6ad.lockedCamera ? "已锁定 " + escapeHtml(formatFocalLength(_0x46bedf?.camera?.focalLength) + "mm") + " · 匹配度 " + Math.round(_0x54b6ad.calibrationConfidence * 100) + "%" : "调整地平线、消失点和相机高度后再锁定") + "</small>\n    </div>\n  </section>";
}
function renderNavigationSettings(_0x1eaceb, {
  open = false,
  viewportSettings = {}
} = {}) {
  const _0xcd70a5 = STORYBOARD_3D_NAVIGATION_PRESETS[_0x1eaceb.preset] || STORYBOARD_3D_NAVIGATION_PRESETS.unity;
  const _0x4fa1bf = Object.values(STORYBOARD_3D_NAVIGATION_PRESETS).map(_0x538012 => "<label class=\"storyboard-3d-navigation-preset " + (_0x538012.id === _0xcd70a5.id ? "is-active" : "") + "\">\n      <input type=\"radio\" name=\"storyboard-3d-navigation-preset\" value=\"" + escapeHtml(_0x538012.id) + "\" data-storyboard-3d-navigation-preset " + (_0x538012.id === _0xcd70a5.id ? "checked" : "") + ">\n      <strong>" + escapeHtml(_0x538012.label) + "</strong>\n      <span>" + escapeHtml(_0x538012.summary) + "</span>\n    </label>").join("");
  const _0x5360bc = (_0x2d58bb, _0x4902e7) => "<label class=\"storyboard-3d-navigation-slider\">\n    <span>" + escapeHtml(_0x4902e7) + " <output data-storyboard-3d-navigation-output=\"" + _0x2d58bb + "\">" + Number(_0x1eaceb[_0x2d58bb]).toFixed(2) + "×</output></span>\n    <input type=\"range\" min=\"0.2\" max=\"3\" step=\"0.05\" value=\"" + escapeHtml(_0x1eaceb[_0x2d58bb]) + "\" data-storyboard-3d-navigation-setting=\"" + _0x2d58bb + "\">\n  </label>";
  return "<details class=\"storyboard-3d-global-settings\" " + (open ? "open" : "") + ">\n    <summary title=\"3D 操作习惯设置 (K)\" aria-keyshortcuts=\"K\"><span aria-hidden=\"true\">⚙</span>全局设置<small data-storyboard-3d-navigation-current>" + escapeHtml(_0xcd70a5.label) + "</small></summary>\n    <section class=\"storyboard-3d-global-settings-panel\" aria-label=\"3D 全局操作设置\">\n      <header><div><strong>视口操作习惯</strong><span>每次只启用一套映射，设置会保存到本机。</span></div></header>\n      <div class=\"storyboard-3d-navigation-presets\">" + _0x4fa1bf + "</div>\n      <div class=\"storyboard-3d-navigation-tuning\">\n        " + _0x5360bc("orbitSensitivity", "环绕灵敏度") + "\n        " + _0x5360bc("panSensitivity", "平移灵敏度") + "\n        " + _0x5360bc("zoomSensitivity", "缩放灵敏度") + "\n        <label><input type=\"checkbox\" data-storyboard-3d-navigation-setting=\"invertOrbitX\" " + (_0x1eaceb.invertOrbitX ? "checked" : "") + ">反向环绕 X</label>\n        <label><input type=\"checkbox\" data-storyboard-3d-navigation-setting=\"invertOrbitY\" " + (_0x1eaceb.invertOrbitY ? "checked" : "") + ">反向环绕 Y</label>\n        <label><input type=\"checkbox\" data-storyboard-3d-navigation-setting=\"invertWheel\" " + (_0x1eaceb.invertWheel ? "checked" : "") + ">反向滚轮缩放</label>\n      </div>\n      <header><div><strong>对象变换</strong><span>吸附与变换偏好会保存到本机；地面吸附按模型可见底部对齐。</span></div></header>\n      <div class=\"storyboard-3d-viewport-settings\">\n        <label><span>变换空间</span><select data-storyboard-3d-viewport-setting=\"transformSpace\"><option value=\"world\" " + (viewportSettings.transformSpace !== "local" ? "selected" : "") + ">世界</option><option value=\"local\" " + (viewportSettings.transformSpace === "local" ? "selected" : "") + ">本地</option></select></label>\n        <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-viewport-setting=\"groundLock\" " + (viewportSettings.groundLock ? "checked" : "") + ">地面吸附</label>\n        <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-viewport-setting=\"uniformScale\" " + (viewportSettings.uniformScale ? "checked" : "") + ">均匀缩放</label>\n        <label class=\"is-check\"><input type=\"checkbox\" data-storyboard-3d-viewport-setting=\"snapEnabled\" " + (viewportSettings.snapEnabled ? "checked" : "") + ">启用步进吸附</label>\n        <label><span>移动步长</span><input type=\"number\" min=\"0.01\" max=\"10\" step=\"0.01\" value=\"" + escapeHtml(viewportSettings.translationSnap || 0.25) + "\" data-storyboard-3d-viewport-setting=\"translationSnap\"></label>\n        <label><span>旋转步长°</span><input type=\"number\" min=\"1\" max=\"180\" step=\"1\" value=\"" + escapeHtml(Math.round((viewportSettings.rotationSnap || Math.PI / 12) * 180 / Math.PI)) + "\" data-storyboard-3d-viewport-setting=\"rotationSnapDegrees\"></label>\n        <label><span>缩放步长</span><input type=\"number\" min=\"0.01\" max=\"10\" step=\"0.01\" value=\"" + escapeHtml(viewportSettings.scaleSnap || 0.1) + "\" data-storyboard-3d-viewport-setting=\"scaleSnap\"></label>\n      </div>\n    </section>\n  </details>";
}
const STORYBOARD_3D_TOOL_LABELS = Object.freeze({
  select: "选择 / 框选",
  move: "移动",
  rotate: "旋转",
  scale: "缩放"
});
const STORYBOARD_3D_SELECT_MOVE_TOOLS = new Set(["select", "move"]);
function renderStoryboard3DControlIcon(_0x1b30d5) {
  const _0x5256b5 = {
    select: "<path d=\"M5 3.5 16.5 12l-5.1 1.2L9.2 19 5 3.5Z\"/><path d=\"M18 5h2v2M20 17v2h-2M6 19H4v-2\"/>",
    move: "<path d=\"M12 3v18M3 12h18\"/><path d=\"m12 3-2.5 2.5M12 3l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5\"/>",
    rotate: "<path d=\"M19 10a7.5 7.5 0 1 0 .2 4.7\"/><path d=\"m15 5 4.8.2L19.5 10\"/>",
    scale: "<path d=\"M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4\"/><path d=\"m9 9-4-4m10 4 4-4m-4 10 4 4M9 15l-4 4\"/>",
    camera: "<rect x=\"3\" y=\"7\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"m17 10 4-2v9l-4-2\"/><circle cx=\"10\" cy=\"12.5\" r=\"2.5\"/>",
    eye: "<path d=\"M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z\"/><circle cx=\"12\" cy=\"12\" r=\"2.7\"/>",
    eyeOff: "<path d=\"M3 3l18 18M10.6 6.1A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a15.7 15.7 0 0 1-2.7 3.3M6.2 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5M9.9 9.8a3 3 0 0 0 4.2 4.2\"/>",
    lock: "<rect x=\"5\" y=\"10\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3M12 14v2\"/>",
    unlock: "<rect x=\"5\" y=\"10\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 7.5-2M12 14v2\"/>",
    light: "<circle cx=\"12\" cy=\"12\" r=\"3.5\"/><path d=\"M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4\"/>",
    background: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"8\" cy=\"9\" r=\"1.5\"/><path d=\"m4.5 18 5-5 3.5 3 2.5-2.5 4 4\"/>",
    fly: "<path d=\"m4 12 16-7-5.5 14-2.2-5.1L7 11.7 4 12Z\"/><path d=\"m12.3 13.9 2.2-8.9\"/>",
    perspective: "<path d=\"m5 7 7-4 7 4v10l-7 4-7-4V7Z\"/><path d=\"m5 7 7 4 7-4M12 11v10\"/>",
    top: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"1.5\"/><path d=\"M8 8h8v8H8z\"/>",
    front: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"1.5\"/><path d=\"M8 8h8v8H8zM8 12h8\"/>",
    right: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"1.5\"/><path d=\"M12 8v8M8 8h8v8H8z\"/>",
    fit: "<path d=\"M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4\"/><path d=\"m4 8 5-5m7 0 5 5m0 8-5 5M9 21l-5-5\"/>",
    focus: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    transformSpace: "<path d=\"M5 19V8m0 11h11\"/><path d=\"m5 8-2 3m2-3 2 3M16 19l-3-2m3 2-3 2\"/><circle cx=\"5\" cy=\"19\" r=\"1\"/>",
    snap: "<path d=\"M6 3v8a6 6 0 0 0 12 0V3\"/><path d=\"M6 7h4M14 7h4\"/>",
    ground: "<path d=\"M3 18h18M6 14h12\"/><path d=\"M12 3v11m-4-4 4 4 4-4\"/>",
    uniform: "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\"/><path d=\"M9 5V3m6 2V3M9 21v-2m6 2v-2M5 9H3m2 6H3m18-6h-2m2 6h-2\"/>"
  };
  return "<svg class=\"storyboard-3d-control-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\">" + (_0x5256b5[_0x1b30d5] || "") + "</svg>";
}
function renderStoryboard3DIconButton({
  action: _0x16a627,
  icon: _0x4f7528,
  label: _0x5da72c,
  shortcut = "",
  active = null,
  dataTool = "",
  dataView = "",
  dataShortcutTool = "",
  dataSetting = "",
  className = "",
  disabled = false,
  hidden = false,
  title = ""
}) {
  const _0x5c7cde = ["storyboard-3d-icon-button", className, active === true ? "is-active" : ""].filter(Boolean).join(" ");
  const _0x5e3102 = dataTool ? " data-tool=\"" + escapeHtml(dataTool) + "\"" : "";
  const _0x170cdd = dataView ? " data-view=\"" + escapeHtml(dataView) + "\"" : "";
  const _0x7fd79 = dataShortcutTool ? " data-storyboard-3d-tool-shortcut=\"" + escapeHtml(dataShortcutTool) + "\"" : "";
  const _0x346c78 = dataSetting ? " data-storyboard-3d-viewport-setting-toggle=\"" + escapeHtml(dataSetting) + "\"" : "";
  const _0x268823 = active === null ? "" : " aria-pressed=\"" + active + "\"";
  const _0xdd9edc = disabled ? " disabled" : "";
  const _0xe5afaf = hidden ? " hidden" : "";
  const _0x204619 = shortcut ? "<span class=\"storyboard-3d-control-shortcut\" aria-hidden=\"true\">" + escapeHtml(shortcut) + "</span>" : "";
  const _0x30d307 = shortcut ? " aria-keyshortcuts=\"" + escapeHtml(shortcut) + "\"" : "";
  const _0x585b76 = title || (shortcut ? _0x5da72c + " (" + shortcut + ")" : _0x5da72c);
  return "<button type=\"button\" class=\"" + _0x5c7cde + "\" data-storyboard-3d-action=\"" + escapeHtml(_0x16a627) + "\"" + _0x5e3102 + _0x170cdd + _0x7fd79 + _0x346c78 + _0x268823 + _0xdd9edc + _0xe5afaf + _0x30d307 + " aria-label=\"" + escapeHtml(_0x5da72c) + "\" title=\"" + escapeHtml(_0x585b76) + "\">" + renderStoryboard3DControlIcon(_0x4f7528) + _0x204619 + "</button>";
}
function renderStoryboard3DToolButton(_0x626175, _0x3b12a7, _0x2c8fd8) {
  const _0x50ea69 = _0x626175;
  return renderStoryboard3DIconButton({
    action: "set-tool",
    icon: _0x626175,
    label: STORYBOARD_3D_TOOL_LABELS[_0x626175] || _0x626175,
    shortcut: getStoryboard3DToolShortcut(_0x2c8fd8, _0x50ea69),
    active: _0x3b12a7,
    dataTool: _0x626175,
    dataShortcutTool: _0x50ea69
  });
}
function renderStoryboard3DViewportSettingButton({
  field: _0xe7d014,
  icon: _0x4cc04c,
  label: _0x34c0c5,
  active: _0x9a73f8,
  hidden = false
}) {
  return renderStoryboard3DIconButton({
    action: "toggle-viewport-setting",
    icon: _0x4cc04c,
    label: _0x34c0c5,
    active: _0x9a73f8,
    dataSetting: _0xe7d014,
    hidden: hidden
  });
}
function renderShotInspector(_0x536336, _0x3cfa9e) {
  if (!_0x536336 || !_0x3cfa9e) {
    return "";
  }
  const _0x5d8ee4 = _0x536336.shots.findIndex(_0x23d6b3 => _0x23d6b3.id === _0x3cfa9e.id);
  return "<section class=\"storyboard-3d-inspector-card storyboard-3d-shot-inspector\">\n    <small>当前镜头 · " + (_0x5d8ee4 + 1) + "/" + _0x536336.shots.length + "</small>\n    <input type=\"text\" maxlength=\"120\" value=\"" + escapeHtml(_0x3cfa9e.name) + "\" data-storyboard-3d-shot-field=\"name\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\" aria-label=\"镜头名称\">\n    <textarea rows=\"2\" maxlength=\"1000\" placeholder=\"镜头说明\" data-storyboard-3d-shot-field=\"description\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\">" + escapeHtml(_0x3cfa9e.description || "") + "</textarea>\n    <div class=\"storyboard-3d-shot-inspector-meta\"><span>" + escapeHtml(_0x3cfa9e.shotSize) + "</span><span>" + escapeHtml(_0x3cfa9e.shotAngle) + "</span><strong>" + escapeHtml(formatFocalLength(_0x3cfa9e.camera.focalLength) + "mm") + "</strong></div>\n    <div class=\"storyboard-3d-shot-inspector-actions\">\n      <button type=\"button\" data-storyboard-3d-action=\"replace-shot-camera\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\">更新当前镜头</button>\n      <button type=\"button\" data-storyboard-3d-action=\"move-shot\" data-direction=\"-1\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\" " + (_0x5d8ee4 <= 0 ? "disabled" : "") + ">前移</button>\n      <button type=\"button\" data-storyboard-3d-action=\"move-shot\" data-direction=\"1\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\" " + (_0x5d8ee4 >= _0x536336.shots.length - 1 ? "disabled" : "") + ">后移</button>\n      <button type=\"button\" data-storyboard-3d-action=\"duplicate-shot\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\">复制</button>\n      <button type=\"button\" data-storyboard-3d-action=\"delete-shot\" data-shot-id=\"" + escapeHtml(_0x3cfa9e.id) + "\">删除</button>\n    </div>\n  </section>";
}
function renderAIAssistant(_0x49bac6 = {}) {
  const _0x547bd0 = resolveStoryWorkspaceModelId("text", _0x49bac6.modelId);
  const _0x52f28d = getStoryWorkspaceModelChoice("text", _0x547bd0);
  const _0x44e227 = String(_0x49bac6.provider || _0x52f28d?.provider || "");
  const _0x2c2c9b = _0x49bac6.status || "idle";
  const _0x368e0e = ["planning", "executing", "starting", "listening", "transcribing", "stopping"].includes(_0x2c2c9b);
  const _0x59be93 = {
    idle: "等待指令",
    planning: "正在规划安全命令…",
    ready: "计划已就绪",
    executing: "正在执行事务…",
    completed: "执行完成",
    starting: "正在启动麦克风…",
    listening: "正在聆听…",
    transcribing: "正在转写…",
    stopping: "正在结束录音…",
    error: _0x49bac6.error?.message || "执行失败"
  };
  const _0x36bc36 = _0x49bac6.plan?.commands || [];
  return "<section class=\"storyboard-3d-inspector-card storyboard-3d-ai-assistant\" data-storyboard-3d-ai-panel data-status=\"" + escapeHtml(_0x2c2c9b) + "\">\n    <small>AI 场景助手</small>\n    <strong>用自然语言编辑当前场景</strong>\n    <div class=\"storyboard-3d-ai-feed\" aria-live=\"polite\">\n      <div class=\"storyboard-3d-ai-message\">\n        <span>场景助手</span>\n        <p data-storyboard-3d-ai-status>" + escapeHtml(_0x59be93[_0x2c2c9b] || _0x2c2c9b) + "</p>\n      </div>\n      " + (_0x36bc36.length ? "<ol class=\"storyboard-3d-ai-plan\">" + _0x36bc36.map(_0x3ab84a => "<li><strong>" + escapeHtml(_0x3ab84a.tool) + "</strong><span>" + escapeHtml(_0x3ab84a.commandId || "") + "</span></li>").join("") + "</ol>" : "<p class=\"storyboard-3d-ai-empty\">AI 返回的计划与执行信息会显示在这里。</p>") + "\n    </div>\n    <div class=\"storyboard-3d-ai-composer\">\n      <div class=\"storyboard-3d-ai-prompt-wrap\">\n        <textarea rows=\"4\" maxlength=\"5000\" aria-label=\"AI 场景指令\" placeholder=\"例如：在人物左侧放一张桌子，再增加一个 50mm 近景镜头\" data-storyboard-3d-ai-instruction>" + escapeHtml(_0x49bac6.instruction || "") + "</textarea>\n        " + (_0x49bac6.interimTranscript ? "<p class=\"storyboard-3d-ai-transcript\">正在转写：" + escapeHtml(_0x49bac6.interimTranscript) + "</p>" : "") + "\n      </div>\n      <div class=\"storyboard-3d-ai-model-bar\">\n        " + renderAIGenTextModelSelectorMarkup({
    modelId: _0x547bd0,
    provider: _0x44e227,
    getDisplayModelName: getDisplayModelName,
    className: "storyboard-3d-ai-text-model-selector"
  }) + "\n        <div class=\"storyboard-3d-ai-actions\">\n          <button type=\"button\" data-storyboard-3d-action=\"toggle-ai-voice\" " + (_0x49bac6.voiceSupported === false ? "disabled" : "") + ">" + (["starting", "listening", "transcribing", "stopping"].includes(_0x2c2c9b) ? "停止语音" : "语音输入") + "</button>\n          <button type=\"button\" class=\"is-primary\" data-storyboard-3d-action=\"run-ai-command\" " + (_0x368e0e || !_0x44e227 ? "disabled" : "") + ">执行指令</button>\n          " + (_0x49bac6.canUndoAI ? "<button type=\"button\" data-storyboard-3d-action=\"undo-ai-command\">撤销本次 AI 修改</button>" : "") + "\n          " + (_0x368e0e ? "<button type=\"button\" data-storyboard-3d-action=\"cancel-ai-command\">取消</button>" : "") + "\n        </div>\n      </div>\n    </div>\n  </section>";
}
function renderAIAssistantRightSidebar(_0x183a0f = {}, _0x2c04f4 = {}) {
  return "<aside class=\"storyboard-3d-right-sidebar storyboard-3d-ai-sidebar\" id=\"storyboard3DRightSidebar\" aria-labelledby=\"storyboard3DAIAssistantTitle\">\n    <div class=\"storyboard-3d-right-sidebar-splitter panel-resize-handle\" data-storyboard-3d-right-sidebar-splitter role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整 AI 助手宽度\" aria-valuemin=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH + "\" aria-valuemax=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH + "\" aria-valuenow=\"" + normalizeStoryboard3DRightSidebarWidth(_0x2c04f4.sidebarWidth, _0x2c04f4.layoutWidth) + "\" tabindex=\"0\"></div>\n    <section class=\"storyboard-3d-ai-sidebar-layout\">\n      <header class=\"storyboard-3d-ai-sidebar-heading\">\n        <div><small>场景编辑</small><h2 id=\"storyboard3DAIAssistantTitle\">AI 助手</h2></div>\n      </header>\n      <div class=\"storyboard-3d-ai-sidebar-content\">" + renderAIAssistant(_0x183a0f) + "</div>\n    </section>\n  </aside>";
}
function renderObjectPropertiesRightSidebar({
  object = null,
  selectedBoneName = "Head",
  assetDescriptor = null,
  sceneGroups = [],
  characterPoseState = null
} = {}, _0xc540cc = {}) {
  if (!object) {
    return "";
  }
  return "<aside class=\"storyboard-3d-right-sidebar storyboard-3d-object-properties-sidebar\" id=\"storyboard3DRightSidebar\" data-object-id=\"" + escapeHtml(object.id) + "\" aria-labelledby=\"storyboard3DObjectPropertiesTitle\">\n    <div class=\"storyboard-3d-right-sidebar-splitter panel-resize-handle\" data-storyboard-3d-right-sidebar-splitter role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整对象属性宽度\" aria-valuemin=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH + "\" aria-valuemax=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH + "\" aria-valuenow=\"" + normalizeStoryboard3DRightSidebarWidth(_0xc540cc.sidebarWidth, _0xc540cc.layoutWidth) + "\" tabindex=\"0\"></div>\n    <section class=\"storyboard-3d-ai-sidebar-layout storyboard-3d-object-properties-layout\">\n      <header class=\"storyboard-3d-ai-sidebar-heading storyboard-3d-object-properties-heading\">\n        <div><small>" + escapeHtml(object.type) + " · 对象属性</small><h2 id=\"storyboard3DObjectPropertiesTitle\">" + escapeHtml(object.name) + "</h2></div>\n      </header>\n      <div class=\"storyboard-3d-ai-sidebar-content storyboard-3d-object-properties-content\">\n        " + renderSelectedObjectInspector(object, selectedBoneName, assetDescriptor, sceneGroups, characterPoseState) + "\n      </div>\n    </section>\n  </aside>";
}
function getBackgroundCalibrationMethodLabel(_0x3c53c7) {
  if (_0x3c53c7 === "exif-local-estimate") {
    return "EXIF + 图像分析";
  }
  if (_0x3c53c7 === "local-image-estimate") {
    return "本地图像分析";
  }
  if (_0x3c53c7 === "manual") {
    return "手动校准";
  }
  return "尚未匹配";
}
function renderBackgroundPerspectivePanel(_0x1d9d92, _0x2e5e47) {
  const _0x5f2a15 = normalizeStoryboard3DBackgroundCalibration(_0x1d9d92?.background);
  const _0x35d592 = Boolean(_0x5f2a15.imageUrl);
  const _0x408100 = Math.round(_0x5f2a15.calibrationConfidence * 100);
  const _0x8db5ac = Math.max(0, Math.min(1, _0x5f2a15.horizonY + _0x5f2a15.horizonSlope * (_0x5f2a15.vanishingPoint[0] - 0.5)));
  const _0x1daa27 = _0x5f2a15.imageWidth > 1 && _0x5f2a15.imageHeight > 1 ? _0x5f2a15.imageWidth + " × " + _0x5f2a15.imageHeight : "尺寸未知";
  if (!_0x35d592) {
    return "<section class=\"storyboard-3d-perspective-panel\" data-storyboard-3d-perspective-panel>\n      <div class=\"storyboard-3d-perspective-empty\">\n        <span aria-hidden=\"true\">⌗</span>\n        <strong>用参考图匹配 3D 透视</strong>\n        <p>上传图片后自动检测地平线、消失点和地面区域，并将当前摄像机匹配到图片视角。</p>\n        <button type=\"button\" class=\"is-primary\" data-storyboard-3d-action=\"upload-background\">选择图像并匹配</button>\n        <small>支持 PNG、JPG、WEBP；原图只保存在本地项目资源中。</small>\n      </div>\n    </section>";
  }
  return "<section class=\"storyboard-3d-perspective-panel\" data-storyboard-3d-perspective-panel>\n    <figure class=\"storyboard-3d-perspective-preview\">\n      <img src=\"" + escapeHtml(_0x5f2a15.imageUrl) + "\" alt=\"当前透视匹配参考图\">\n      <figcaption>\n        <span>" + (_0x5f2a15.lockedCamera ? "透视已锁定" : "透视未锁定") + "</span>\n        <strong>" + _0x408100 + "%</strong>\n      </figcaption>\n    </figure>\n    <div class=\"storyboard-3d-perspective-summary\" data-state=\"" + (_0x5f2a15.lockedCamera ? "locked" : "ready") + "\">\n      <div><small>匹配方式</small><strong>" + escapeHtml(getBackgroundCalibrationMethodLabel(_0x5f2a15.calibrationMethod)) + "</strong></div>\n      <div><small>图像尺寸</small><strong>" + escapeHtml(_0x1daa27) + "</strong></div>\n      <div><small>当前镜头</small><strong>" + escapeHtml(_0x2e5e47 ? formatFocalLength(_0x2e5e47.camera?.focalLength) + "mm" : "未创建") + "</strong></div>\n    </div>\n    <div class=\"storyboard-3d-perspective-actions\">\n      <button type=\"button\" class=\"is-primary\" data-storyboard-3d-action=\"upload-background\">更换图像</button>\n      <button type=\"button\" data-storyboard-3d-action=\"analyze-background\" " + (_0x5f2a15.binaryAssetId ? "" : "disabled") + ">重新匹配</button>\n      <button type=\"button\" data-storyboard-3d-action=\"clear-background\">清除</button>\n    </div>\n    <details class=\"storyboard-3d-perspective-settings\" open>\n      <summary>匹配参数 <small>修改后即时更新摄像机</small></summary>\n      <div class=\"storyboard-3d-scene-control-grid\">\n        <label><span>水平 FOV°</span><input type=\"number\" min=\"10\" max=\"170\" step=\"0.1\" value=\"" + _0x5f2a15.horizontalFov + "\" data-storyboard-3d-background-field=\"horizontalFov\"></label>\n        <label><span>垂直 FOV°</span><input type=\"number\" min=\"10\" max=\"170\" step=\"0.1\" value=\"" + (_0x5f2a15.verticalFov || 40) + "\" data-storyboard-3d-background-field=\"verticalFov\"></label>\n        <label><span>地平线 Y</span><input type=\"number\" min=\"0\" max=\"1\" step=\"0.01\" value=\"" + _0x5f2a15.horizonY + "\" data-storyboard-3d-background-field=\"horizonY\"></label>\n        <label><span>地平线倾斜</span><input type=\"number\" min=\"-1\" max=\"1\" step=\"0.01\" value=\"" + _0x5f2a15.horizonSlope + "\" data-storyboard-3d-background-field=\"horizonSlope\"></label>\n        <label><span>消失点 X</span><input type=\"number\" min=\"0\" max=\"1\" step=\"0.01\" value=\"" + _0x5f2a15.vanishingPoint[0] + "\" data-storyboard-3d-background-field=\"vanishingPointX\"></label>\n        <label><span>消失点 Y</span><input type=\"number\" value=\"" + _0x8db5ac.toFixed(3) + "\" disabled></label>\n        <label><span>相机高度 m</span><input type=\"number\" min=\"0.2\" max=\"20\" step=\"0.1\" value=\"" + _0x5f2a15.cameraHeight + "\" data-storyboard-3d-background-field=\"cameraHeight\"></label>\n        <label><span>背景缩放</span><input type=\"number\" min=\"0.1\" max=\"10\" step=\"0.1\" value=\"" + _0x5f2a15.imageScale + "\" data-storyboard-3d-background-field=\"imageScale\"></label>\n        <label><span>背景偏移 X</span><input type=\"number\" min=\"-2\" max=\"2\" step=\"0.01\" value=\"" + _0x5f2a15.imageOffset[0] + "\" data-storyboard-3d-background-field=\"imageOffsetX\"></label>\n        <label><span>背景偏移 Y</span><input type=\"number\" min=\"-2\" max=\"2\" step=\"0.01\" value=\"" + _0x5f2a15.imageOffset[1] + "\" data-storyboard-3d-background-field=\"imageOffsetY\"></label>\n      </div>\n    </details>\n    <label class=\"storyboard-3d-perspective-lock\">\n      <input type=\"checkbox\" data-storyboard-3d-background-lock " + (_0x5f2a15.lockedCamera ? "checked" : "") + ">\n      <span><strong>锁定匹配机位</strong><small>锁定后禁止意外改变与参考图对应的摄像机视角</small></span>\n    </label>\n  </section>";
}
function renderBackgroundPerspectiveRightSidebar({
  scene = null,
  activeShot = null
} = {}, _0x1efd03 = {}) {
  return "<aside class=\"storyboard-3d-right-sidebar storyboard-3d-perspective-sidebar\" id=\"storyboard3DRightSidebar\" aria-labelledby=\"storyboard3DPerspectiveTitle\">\n    <div class=\"storyboard-3d-right-sidebar-splitter panel-resize-handle\" data-storyboard-3d-right-sidebar-splitter role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整图像透视匹配宽度\" aria-valuemin=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH + "\" aria-valuemax=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH + "\" aria-valuenow=\"" + normalizeStoryboard3DRightSidebarWidth(_0x1efd03.sidebarWidth, _0x1efd03.layoutWidth, "perspective") + "\" tabindex=\"0\"></div>\n    <section class=\"storyboard-3d-ai-sidebar-layout storyboard-3d-perspective-layout\">\n      <header class=\"storyboard-3d-ai-sidebar-heading\">\n        <div><small>场景校准</small><h2 id=\"storyboard3DPerspectiveTitle\">图像透视匹配</h2></div>\n      </header>\n      <div class=\"storyboard-3d-ai-sidebar-content storyboard-3d-perspective-content\">\n        " + renderBackgroundPerspectivePanel(scene, activeShot) + "\n      </div>\n    </section>\n  </aside>";
}
function renderAssetLibrarySidebar({
  query = "",
  category = "all",
  importState = null
} = {}) {
  const _0x750d23 = ["queued", "reading", "parsing"].includes(importState?.status);
  const _0x5419e1 = [...STORYBOARD_3D_ASSET_CATEGORIES, {
    id: "recent",
    label: getStoryboard3DAssetCategoryLabel("recent")
  }, {
    id: "favorite",
    label: getStoryboard3DAssetCategoryLabel("favorite")
  }];
  return "<aside class=\"storyboard-3d-asset-library-sidebar\" aria-label=\"模型库工具\">\n    <div class=\"storyboard-3d-asset-sidebar-heading\">\n      <small>模型工具</small>\n      <strong>查找与导入</strong>\n    </div>\n    <div class=\"storyboard-3d-asset-filters\">\n      <label>\n        <span>搜索模型</span>\n        <input type=\"search\" value=\"" + escapeHtml(query) + "\" placeholder=\"输入模型名称\" data-storyboard-3d-asset-query>\n      </label>\n      <nav class=\"storyboard-3d-asset-category-panel\" aria-label=\"模型分类\">\n        <span>模型分类</span>\n        <div class=\"storyboard-3d-asset-category-list\">\n          " + _0x5419e1.map(_0x15c58b => "<button type=\"button\" class=\"" + (_0x15c58b.id === category ? "is-active" : "") + "\" data-storyboard-3d-action=\"select-asset-category\" data-storyboard-3d-asset-category=\"" + escapeHtml(_0x15c58b.id) + "\" aria-pressed=\"" + (_0x15c58b.id === category) + "\">" + escapeHtml(_0x15c58b.label) + "</button>").join("") + "\n        </div>\n      </nav>\n    </div>\n    <div class=\"storyboard-3d-asset-toolbar\">\n      <strong>导入本地模型</strong>\n      <button type=\"button\" data-storyboard-3d-action=\"import-model\" " + (_0x750d23 ? "disabled" : "") + ">导入模型</button>\n      " + (_0x750d23 ? "<button type=\"button\" data-storyboard-3d-action=\"cancel-model-import\">取消</button>" : "") + "\n      <small>支持 GLB / GLTF / FBX / OBJ / STL</small>\n      <span data-storyboard-3d-import-status>" + (_0x750d23 ? escapeHtml(importState.fileName || "模型") + " · " + importState.status + " · " + Math.round((importState.progress || 0) * 100) + "%" : "") + "</span>\n    </div>\n  </aside>";
}
function renderAssetLibrary({
  assets = [],
  hasMore = false,
  favoriteIds = new Set()
} = {}) {
  return "<section class=\"storyboard-3d-asset-results\" aria-label=\"模型列表\">\n      <div class=\"storyboard-3d-asset-grid\">\n      " + (assets.length > 0 ? assets.map(_0x3a8b7f => "<article><button type=\"button\" data-storyboard-3d-action=\"add-asset\" data-asset-id=\"" + escapeHtml(_0x3a8b7f.id) + "\"><span class=\"storyboard-3d-asset-thumb\" data-storyboard-3d-asset-thumbnail data-asset-id=\"" + escapeHtml(_0x3a8b7f.id) + "\" data-thumbnail-status=\"" + (_0x3a8b7f.thumbnailUrl ? "ready" : "pending") + "\">" + (_0x3a8b7f.thumbnailUrl ? "<img src=\"" + escapeHtml(_0x3a8b7f.thumbnailUrl) + "\" alt=\"" + escapeHtml(_0x3a8b7f.name + " 模型预览") + "\">" : "<span class=\"storyboard-3d-asset-thumb-loading\" aria-label=\"正在生成 " + escapeHtml(_0x3a8b7f.name) + " 的模型预览\"><i></i><small>生成预览</small></span>") + "</span><span>" + escapeHtml(getStoryboard3DAssetCategoryLabel(_0x3a8b7f.category)) + (_0x3a8b7f.assetRecord?.sourceFormat ? " · " + escapeHtml(_0x3a8b7f.assetRecord.sourceFormat.toUpperCase()) : "") + "</span><strong title=\"" + escapeHtml(_0x3a8b7f.name) + "\">" + escapeHtml(_0x3a8b7f.name) + "</strong></button><button type=\"button\" class=\"storyboard-3d-asset-favorite " + (favoriteIds.has(_0x3a8b7f.id) ? "is-active" : "") + "\" data-storyboard-3d-action=\"toggle-asset-favorite\" data-asset-id=\"" + escapeHtml(_0x3a8b7f.id) + "\" aria-label=\"" + (favoriteIds.has(_0x3a8b7f.id) ? "取消收藏" : "收藏") + "\">★</button></article>").join("") : "<div class=\"storyboard-3d-empty-state\"><strong>没有匹配的模型</strong><span>调整搜索词或分类后重试。</span></div>") + "\n      </div>\n      " + (hasMore ? "<button type=\"button\" class=\"storyboard-3d-assets-load-more\" data-storyboard-3d-action=\"load-more-assets\">加载更多模型</button>" : "") + "\n    </section>";
}
function renderAssetLibraryRightSidebar(_0x14a7d2 = {}) {
  const _0x12a6c1 = Array.isArray(_0x14a7d2.assets) ? _0x14a7d2.assets.length : 0;
  const _0x587b7a = Math.max(_0x12a6c1, Number(_0x14a7d2.totalCount) || 0);
  return "<aside class=\"storyboard-3d-right-sidebar storyboard-3d-asset-library-panel\" id=\"storyboard3DRightSidebar\" aria-labelledby=\"storyboard3DAssetLibraryTitle\">\n    <div class=\"storyboard-3d-right-sidebar-splitter panel-resize-handle\" data-storyboard-3d-right-sidebar-splitter role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整模型库宽度\" aria-valuemin=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MIN_WIDTH + "\" aria-valuemax=\"" + STORYBOARD_3D_RIGHT_SIDEBAR_MAX_WIDTH + "\" aria-valuenow=\"" + normalizeStoryboard3DRightSidebarWidth(_0x14a7d2.sidebarWidth, _0x14a7d2.layoutWidth) + "\" tabindex=\"0\"></div>\n    <section class=\"storyboard-3d-asset-library-layout\">\n      " + renderAssetLibrarySidebar(_0x14a7d2) + "\n      <div class=\"storyboard-3d-asset-library-main\">\n        <header class=\"storyboard-3d-asset-library-heading\">\n          <div>\n            <small>场景资源</small>\n            <h2 id=\"storyboard3DAssetLibraryTitle\">模型库</h2>\n            <p>查看模型外观后，点击卡片即可加入当前场景。</p>\n          </div>\n          <span>" + _0x587b7a + " 个模型</span>\n        </header>\n        <div class=\"storyboard-3d-asset-library-content\">" + renderAssetLibrary(_0x14a7d2) + "</div>\n      </div>\n    </section>\n  </aside>";
}
function finiteMiniMapValue(_0x1ea462, _0x444b77 = 0) {
  const _0x27049e = Number(_0x1ea462);
  if (Number.isFinite(_0x27049e)) {
    return _0x27049e;
  } else {
    return _0x444b77;
  }
}
function createStoryboard3DMiniMapCameraPose(_0x51e2e5, _0x5ceeba, _0x1ab7c9) {
  const _0x45b69a = _0x51e2e5?.camera?.position || [0, 0, 0];
  const _0x4d22d0 = _0x51e2e5?.camera?.target || [0, 0, -1];
  const _0x170563 = _0x5ceeba ? resolveSceneCameraPose(_0x5ceeba) : null;
  const _0x3bf9af = {
    x: finiteMiniMapValue(_0x170563?.position?.x, _0x1ab7c9?.position?.x ?? _0x45b69a[0]),
    y: finiteMiniMapValue(_0x170563?.position?.y, _0x1ab7c9?.position?.y ?? _0x45b69a[1]),
    z: finiteMiniMapValue(_0x170563?.position?.z, _0x1ab7c9?.position?.z ?? _0x45b69a[2])
  };
  const _0xf598d5 = _0x170563?.target || _0x5ceeba?.target || {
    x: _0x4d22d0[0],
    y: _0x4d22d0[1],
    z: _0x4d22d0[2]
  };
  return {
    position: _0x3bf9af,
    target: {
      x: finiteMiniMapValue(_0xf598d5?.x, _0x4d22d0[0]),
      y: finiteMiniMapValue(_0xf598d5?.y, _0x4d22d0[1]),
      z: finiteMiniMapValue(_0xf598d5?.z, _0x4d22d0[2])
    }
  };
}
function renderMiniMap(_0x38cdc5, _0x450211, {
  expanded = false,
  zoom = 1,
  footprints = [],
  worldBounds = null,
  camera = null
} = {}) {
  const _0x2f95cb = camera || createStoryboard3DMiniMapCameraPose(_0x450211);
  const {
    objects: _0x433748,
    projection: _0x5122c4
  } = createMiniMapLayout(_0x38cdc5, _0x450211, undefined, zoom, footprints, worldBounds, _0x2f95cb);
  const _0x574cad = new Map((Array.isArray(footprints) ? footprints : []).map(_0xa4daf8 => [_0xa4daf8.objectId, _0xa4daf8]));
  const _0x293475 = _0x433748.map(_0xaefd73 => {
    const _0xac9997 = projectStoryboard3DWorldToMiniMapRatio({
      x: _0xaefd73.transform?.position?.[0],
      z: _0xaefd73.transform?.position?.[2]
    }, _0x5122c4);
    const _0x4af8fe = projectStoryboard3DTopViewFootprint(_0x574cad.get(_0xaefd73.id)?.points, _0x5122c4);
    if (_0x4af8fe) {
      const _0x49d290 = _0x4af8fe.polygon.map(_0x252e87 => _0x252e87.x * 100 + "% " + _0x252e87.y * 100 + "%").join(",");
      return "<button type=\"button\" class=\"storyboard-3d-mini-map-marker has-top-view-footprint is-" + escapeHtml(_0xaefd73.type) + "\" data-storyboard-3d-action=\"select-object\" data-object-id=\"" + escapeHtml(_0xaefd73.id) + "\" data-top-view-footprint=\"true\" title=\"" + escapeHtml(_0xaefd73.name) + "\" style=\"--mini-x:" + _0x4af8fe.centerX * 100 + "%;--mini-y:" + _0x4af8fe.centerY * 100 + "%;--mini-left:" + _0x4af8fe.left * 100 + "%;--mini-top:" + _0x4af8fe.top * 100 + "%;--mini-width:" + _0x4af8fe.width * 100 + "%;--mini-height:" + _0x4af8fe.height * 100 + "%;clip-path:polygon(" + _0x49d290 + ")\"></button>";
    }
    return "<button type=\"button\" class=\"storyboard-3d-mini-map-marker\" data-storyboard-3d-action=\"select-object\" data-object-id=\"" + escapeHtml(_0xaefd73.id) + "\" title=\"" + escapeHtml(_0xaefd73.name) + "\" style=\"--mini-x:" + _0xac9997.x * 100 + "%;--mini-y:" + _0xac9997.y * 100 + "%\"></button>";
  }).join("");
  const _0x12bbbe = createStoryboard3DMiniMapCameraMarker(_0x2f95cb, _0x5122c4);
  const _0x5f57a2 = projectStoryboard3DWorldToMiniMapRatio(_0x2f95cb.position, _0x5122c4);
  return "<div class=\"storyboard-3d-mini-map-title\"><span>Mini Map · 跟随视角</span><small>" + _0x433748.length + " 个对象 · " + Math.round(zoom * 100) + "%</small><button type=\"button\" data-storyboard-3d-action=\"toggle-mini-map\" aria-label=\"" + (expanded ? "折叠 Mini Map" : "展开 Mini Map") + "\">" + (expanded ? "−" : "+") + "</button></div>\n    <div class=\"storyboard-3d-mini-map-canvas\">\n      <span class=\"storyboard-3d-mini-map-grid\" aria-hidden=\"true\" style=\"--mini-map-rotation:" + _0x5122c4.rotation + "rad\"></span>\n      " + _0x293475 + "\n      <span class=\"storyboard-3d-mini-map-camera\" data-storyboard-3d-mini-map-camera style=\"--mini-x:" + _0x5f57a2.x * 100 + "%;--mini-y:" + _0x5f57a2.y * 100 + "%;--mini-angle:" + _0x12bbbe.angle + "rad\"></span>\n    </div>";
}
function createMiniMapWorldBounds(_0x5cc37f, _0x5c1df2, _0x134eea = []) {
  const _0x53b5fe = Array.isArray(_0x5cc37f?.objects) ? _0x5cc37f.objects.filter(_0x3d3e25 => _0x3d3e25.visible !== false) : [];
  const _0xc18171 = _0x53b5fe.map(_0x9bdea4 => _0x9bdea4.transform?.position || [0, 0, 0]);
  const _0x629e74 = new Set(_0x53b5fe.map(_0x5bb540 => _0x5bb540.id));
  const _0x4e999c = (Array.isArray(_0x134eea) ? _0x134eea : []).filter(_0x31b04b => _0x629e74.has(_0x31b04b?.objectId)).flatMap(_0x44e86c => Array.isArray(_0x44e86c?.points) ? _0x44e86c.points : []);
  const _0x1ee745 = _0x5c1df2?.camera?.position || [0, 0, 0];
  const _0x5f25bf = [..._0xc18171.map(_0x5d9beb => Number(_0x5d9beb[0]) || 0), ..._0x4e999c.map(_0x74a142 => Number(_0x74a142.x) || 0), Number(_0x1ee745[0]) || 0];
  const _0x12591f = [..._0xc18171.map(_0x473b33 => Number(_0x473b33[2]) || 0), ..._0x4e999c.map(_0x50a390 => Number(_0x50a390.z) || 0), Number(_0x1ee745[2]) || 0];
  const _0x39f819 = Math.min(-5, ..._0x5f25bf) - 2;
  const _0x3dec25 = Math.max(5, ..._0x5f25bf) + 2;
  const _0x5e057c = Math.min(-5, ..._0x12591f) - 2;
  const _0x17cb54 = Math.max(5, ..._0x12591f) + 2;
  return {
    minX: _0x39f819,
    maxX: _0x3dec25,
    minZ: _0x5e057c,
    maxZ: _0x17cb54
  };
}
function createMiniMapLayout(_0x30ba81, _0x455879, _0xd62a7f = {
  width: 140,
  height: 105
}, _0x1798fd = 1, _0x585eb8 = [], _0x59922f = null, _0x39c722 = null) {
  const _0xa9fa65 = Array.isArray(_0x30ba81?.objects) ? _0x30ba81.objects.filter(_0x2548e5 => _0x2548e5.visible !== false) : [];
  const _0x4b38f7 = _0x59922f || createMiniMapWorldBounds(_0x30ba81, _0x455879, _0x585eb8);
  const _0x11996d = Math.max(0.5, Math.min(3, Number(_0x1798fd) || 1));
  const _0x5efb60 = _0x39c722 || createStoryboard3DMiniMapCameraPose(_0x455879);
  const _0x25a137 = finiteMiniMapValue(_0x5efb60.position?.x, (_0x4b38f7.minX + _0x4b38f7.maxX) / 2);
  const _0x388c02 = finiteMiniMapValue(_0x5efb60.position?.z, (_0x4b38f7.minZ + _0x4b38f7.maxZ) / 2);
  const _0x12fb2b = (_0x4b38f7.maxX - _0x4b38f7.minX) / 2 / _0x11996d;
  const _0x5a86d0 = (_0x4b38f7.maxZ - _0x4b38f7.minZ) / 2 / _0x11996d;
  const _0x28bd2f = _0x25a137 - _0x12fb2b;
  const _0xb75ac2 = _0x25a137 + _0x12fb2b;
  const _0x291be6 = _0x388c02 - _0x5a86d0;
  const _0x420205 = _0x388c02 + _0x5a86d0;
  const _0x477548 = finiteMiniMapValue(_0x5efb60.target?.x) - _0x25a137;
  const _0x58eea0 = finiteMiniMapValue(_0x5efb60.target?.z) - _0x388c02;
  const _0x559476 = Math.hypot(_0x477548, _0x58eea0) > 0.000001;
  const _0x27067c = _0x559476 ? Math.atan2(_0x58eea0, _0x477548) : 0;
  const _0x5acdc3 = createStoryboard3DMiniMapProjection({
    worldBounds: {
      minX: _0x28bd2f,
      maxX: _0xb75ac2,
      minZ: _0x291be6,
      maxZ: _0x420205
    },
    viewport: {
      x: 0,
      y: 0,
      width: _0xd62a7f.width || 140,
      height: _0xd62a7f.height || 105
    },
    padding: 8,
    center: {
      x: _0x25a137,
      z: _0x388c02
    },
    rotation: _0x559476 ? -Math.PI / 2 - _0x27067c : 0
  });
  return {
    objects: _0xa9fa65,
    projection: _0x5acdc3
  };
}
function renderShotExplorePanel(_0x3cb1c4 = [], _0x970fb0 = "all") {
  const _0x9235e5 = {
    close: new Set(["MCU", "CU", "ECU"]),
    medium: new Set(["MLS", "MED"]),
    wide: new Set(["EST", "ELS", "LS"])
  };
  const _0x59bed6 = _0x3cb1c4.map((_0x26623c, _0x4b191b) => ({
    candidate: _0x26623c,
    index: _0x4b191b
  })).filter(({
    candidate: _0x2fc504
  }) => _0x970fb0 === "all" || _0x9235e5[_0x970fb0]?.has(_0x2fc504.shotSize));
  return "<section class=\"storyboard-3d-explore-panel\" aria-label=\"镜头探索\">\n    <header><div><small>SHOT EXPLORER</small><strong>镜头探索</strong></div><div class=\"storyboard-3d-explore-toolbar\">" + [["all", "全部"], ["close", "特写"], ["medium", "中景"], ["wide", "远景"]].map(([_0x132cc0, _0x528aaa]) => "<button type=\"button\" data-storyboard-3d-action=\"filter-explore\" data-explore-filter=\"" + _0x132cc0 + "\" aria-pressed=\"" + (_0x970fb0 === _0x132cc0) + "\">" + _0x528aaa + "</button>").join("") + "<button type=\"button\" data-storyboard-3d-action=\"regenerate-explore\">重新生成</button><button type=\"button\" data-storyboard-3d-action=\"close-explore\" aria-label=\"关闭\">×</button></div></header>\n    " + (_0x59bed6.length > 0 ? "<div class=\"storyboard-3d-candidate-grid\">" + _0x59bed6.map(({
    candidate: _0x136877,
    index: _0x2d375f
  }) => "<article>\n          <div class=\"storyboard-3d-candidate-preview\" data-candidate-preview=\"" + _0x2d375f + "\">" + (_0x136877.thumbnailUrl ? "<img src=\"" + escapeHtml(_0x136877.thumbnailUrl) + "\" alt=\"候选镜头 " + (_0x2d375f + 1) + "\">" : "<span>正在渲染候选 " + (_0x2d375f + 1) + "</span>") + "</div>\n          <div><strong>" + escapeHtml(_0x136877.shotSize + " · " + _0x136877.shotAngle) + "</strong><small>" + Math.round(_0x136877.score * 100) + " 分 · " + formatFocalLength(_0x136877.camera.focalLength) + "mm</small></div>\n          <footer><button type=\"button\" data-storyboard-3d-action=\"preview-candidate\" data-candidate-index=\"" + _0x2d375f + "\">主视口预览</button><button type=\"button\" data-storyboard-3d-action=\"replace-with-candidate\" data-candidate-index=\"" + _0x2d375f + "\">替换当前</button><button type=\"button\" data-storyboard-3d-action=\"append-candidate\" data-candidate-index=\"" + _0x2d375f + "\">添加镜头</button></footer>\n        </article>").join("") + "</div>" : "<div class=\"storyboard-3d-explore-empty\"><strong>" + (_0x3cb1c4.length > 0 ? "当前景别没有候选" : "需要至少一个可见主体") + "</strong><span>" + (_0x3cb1c4.length > 0 ? "切换筛选或重新生成一组机位。" : "从素材库添加人物或道具后，即可生成 9 个候选机位。") + "</span></div>") + "\n  </section>";
}
export class Storyboard3DEditorWorkspace {
  constructor({
    projectId: _0x4c31a4,
    project: _0xeaa575,
    onProjectChange: _0x497e22,
    onClose: _0x4bab41,
    documentObject = globalThis.document,
    windowObject = globalThis.window,
    binaryAssetRepository = null,
    modelPackApi = null,
    assetThumbnailRenderer = null,
    imagePoseEstimator = null,
    imagePoseRetargeter = null
  } = {}) {
    this.projectId = String(_0x4c31a4 || _0xeaa575?.id || "");
    this.document = documentObject;
    this.window = windowObject;
    this.onProjectChange = _0x497e22;
    this.onClose = _0x4bab41;
    this.root = null;
    this._message = "";
    this._closed = false;
    this._serverAlertMutationObserver = null;
    this._serverAlertResizeObserver = null;
    this.sceneRuntime = null;
    this.backgroundCalibrationInteraction = null;
    this._sceneRuntimeResizeObserver = null;
    this._gizmoDrag = null;
    this._selectionDrag = null;
    this._cameraDrag = null;
    this._flyKeys = new Set();
    this._flyBoost = false;
    this._flyFrame = null;
    this._flyLastTime = 0;
    this._flySceneView = null;
    this._miniMapDrag = null;
    this.miniMapExpanded = false;
    this.miniMapZoom = 1;
    this.miniMapWindowOffset = {
      x: 0,
      y: 0
    };
    this._miniMapFootprints = [];
    this._miniMapFrame = null;
    this._miniMapPreviewSceneView = null;
    this._miniMapRefreshFrame = null;
    this._miniMapWindowDrag = null;
    this.inspectorWidth = 360;
    this._inspectorResize = null;
    this.rightSidebarMode = Number(this.window?.innerWidth) <= 900 ? null : "ai";
    this.rightSidebarWidth = null;
    this._rightSidebarResize = null;
    this.timelineHeight = STORYBOARD_3D_TIMELINE_DEFAULT_HEIGHT;
    this._timelineResize = null;
    this._suppressTimelineToggleClick = false;
    this._runtimeError = "";
    this._runtimeFailureTitle = "";
    this.viewportControls = null;
    this.viewportSettings = loadStoryboard3DTransformSettings(this.window?.localStorage);
    this.navigationSettings = loadStoryboard3DNavigationSettings(this.window?.localStorage);
    this.assetLibrary = createStoryboard3DAssetLibrary();
    this.assetQuery = "";
    this.assetCategory = "all";
    this.assetVisibleLimit = 32;
    this.favoriteAssetIds = new Set();
    this.assetThumbnailRenderer = assetThumbnailRenderer;
    this._assetThumbnailObserver = null;
    this._assetThumbnailQueue = Promise.resolve();
    this._assetThumbnailLoads = new Map();
    this._assetThumbnailFailures = new Set();
    this.characterBoneSelection = new Map();
    this.outlineQuery = "";
    this.outlineType = "all";
    this.sceneEnvironmentOpen = false;
    this.importedModelScenes = new Map();
    this.modelPackApi = modelPackApi || {
      getStatus: getStoryboard3DModelPackStatus,
      fetchAssetFile: fetchStoryboard3DModelPackAssetFile
    };
    this.modelPackStatus = {
      loaded: false,
      installed: false,
      assets: [],
      error: ""
    };
    this._modelPackStatusPromise = null;
    this._packAssetLoads = new Map();
    this.binaryAssetRepository = binaryAssetRepository || createStoryboard3DBinaryAssetRepository();
    this._binaryAssetHydrationPromise = null;
    const _0x41289c = createThreeStoryboard3DModelParsers({
      gltf: {
        urlApi: this.window?.URL || globalThis.URL
      },
      fbx: {
        urlApi: this.window?.URL || globalThis.URL
      }
    });
    this.modelParsers = {
      ..._0x41289c,
      ...createThreeWorkerBackedStoryboard3DModelParsers({
        obj: {
          fallbackParser: _0x41289c.obj
        },
        stl: {
          fallbackParser: _0x41289c.stl
        }
      })
    };
    this.modelImportJob = null;
    this.modelImportState = null;
    this.backgroundImageControllers = new Map();
    this.exploreOpen = false;
    this.exploreFilter = "all";
    this.exploreVariation = 0;
    this.shotCandidates = [];
    this._candidateRenderToken = 0;
    this._shotThumbnailQueue = Promise.resolve();
    this.aiModelId = resolveStoryWorkspaceModelId("text");
    this.aiProvider = getStoryWorkspaceModelChoice("text", this.aiModelId)?.provider || "";
    this._aiModelSelectorController = null;
    this.aiState = {
      status: "idle",
      instruction: "",
      voiceSupported: false
    };
    this.exportController = createStoryboard3DExportController({
      documentObject: this.document,
      windowObject: this.window,
      getProject: () => this.projectStore.getSnapshot(),
      renderFrame: (_0x374498, _0xd8ad04) => this._renderShotFrame(_0x374498, _0xd8ad04),
      onComplete: ({
        options: _0x871a32,
        results: _0x383907
      }) => {
        dispatchWorkspaceEvent(this.window, "storyboard-3d:export-complete", {
          projectId: this.projectStore.getSnapshot().id,
          projectName: this.projectStore.getSnapshot().name,
          options: _0x871a32,
          results: _0x383907
        });
      }
    });
    this._handleClick = this._handleClick.bind(this);
    this._handleInput = this._handleInput.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleWindowKeyDown = this._handleWindowKeyDown.bind(this);
    this._handleWindowKeyUp = this._handleWindowKeyUp.bind(this);
    this._handleWindowBlur = this._handleWindowBlur.bind(this);
    this._handleRuntimePointerDown = this._handleRuntimePointerDown.bind(this);
    this._handleRuntimePointerMove = this._handleRuntimePointerMove.bind(this);
    this._handleRuntimePointerUp = this._handleRuntimePointerUp.bind(this);
    this._handleRuntimePointerCancel = this._handleRuntimePointerCancel.bind(this);
    this._handleRuntimePointerHover = this._handleRuntimePointerHover.bind(this);
    this._handleRuntimePointerLeave = this._handleRuntimePointerLeave.bind(this);
    this._handleRuntimeContextMenu = this._handleRuntimeContextMenu.bind(this);
    this._handleRuntimeWheel = this._handleRuntimeWheel.bind(this);
    this._handleMiniMapPointerDown = this._handleMiniMapPointerDown.bind(this);
    this._handleMiniMapPointerMove = this._handleMiniMapPointerMove.bind(this);
    this._handleMiniMapPointerUp = this._handleMiniMapPointerUp.bind(this);
    this._handleMiniMapWheel = this._handleMiniMapWheel.bind(this);
    this._handleMiniMapWindowMove = this._handleMiniMapWindowMove.bind(this);
    this._handleMiniMapWindowUp = this._handleMiniMapWindowUp.bind(this);
    this._handleInspectorResizePointerDown = this._handleInspectorResizePointerDown.bind(this);
    this._handleInspectorResizePointerMove = this._handleInspectorResizePointerMove.bind(this);
    this._handleInspectorResizePointerUp = this._handleInspectorResizePointerUp.bind(this);
    this._handleRightSidebarResizePointerDown = this._handleRightSidebarResizePointerDown.bind(this);
    this._handleRightSidebarResizePointerMove = this._handleRightSidebarResizePointerMove.bind(this);
    this._handleRightSidebarResizePointerUp = this._handleRightSidebarResizePointerUp.bind(this);
    this._handleTimelineResizePointerDown = this._handleTimelineResizePointerDown.bind(this);
    this._handleTimelineResizePointerMove = this._handleTimelineResizePointerMove.bind(this);
    this._handleTimelineResizePointerUp = this._handleTimelineResizePointerUp.bind(this);
    this._handleOutlineDragStart = this._handleOutlineDragStart.bind(this);
    this._handleOutlineDragOver = this._handleOutlineDragOver.bind(this);
    this._handleOutlineDrop = this._handleOutlineDrop.bind(this);
    this._syncServerAlertOffset = this._syncServerAlertOffset.bind(this);
    this.editorStore = createStoryboard3DEditorStore({
      inspectorOpen: false
    });
    this.projectStore = createStoryboard3DProjectStore(_0xeaa575, {
      onPersist: (_0x1aa7cd, _0x3f0c38) => this._persistProject(_0x1aa7cd, _0x3f0c38)
    });
    this.viewportFocalLength = Number(getActiveStoryboard3DShot(this.projectStore.getSnapshot())?.camera?.focalLength) || 35;
    this.commandHistory = createCommandHistory({
      context: {
        getProject: () => this.projectStore.getSnapshot(),
        replaceProject: (_0x52f8c8, _0x4064f4 = {}) => {
          const _0x233128 = this.projectStore.replaceProject(_0x52f8c8, _0x4064f4.reason || "history-command");
          this._render(this._historyRenderOptions || undefined);
          return _0x233128;
        }
      },
      limit: 100,
      onChange: () => this._syncHistoryButtons()
    });
    this.characterImagePoseController = createStoryboard3DCharacterImagePoseController({
      ...(imagePoseEstimator ? {
        estimator: imagePoseEstimator
      } : {}),
      ...(imagePoseRetargeter ? {
        retarget: imagePoseRetargeter
      } : {}),
      getCharacter: _0x37e31b => {
        for (const _0xa4e677 of this.projectStore.getSnapshot().scenes || []) {
          const _0xd5eb03 = _0xa4e677.objects?.find(_0x486d0d => _0x486d0d.id === _0x37e31b);
          if (_0xd5eb03?.type === "character") {
            return _0xd5eb03;
          }
        }
        return null;
      },
      applyPose: ({
        objectId: _0x574791,
        boneOverrides: _0x168718,
        confidence: _0x2690de
      }) => {
        this._executeMutation({
          type: "apply-character-pose-from-image",
          label: "Apply character pose from image",
          mutate: _0x2bab80 => {
            for (const _0x1306da of _0x2bab80.scenes || []) {
              const _0x459583 = _0x1306da.objects?.find(_0x91675d => _0x91675d.id === _0x574791);
              if (_0x459583?.type !== "character") {
                continue;
              }
              _0x459583.boneOverrides = Object.fromEntries(Object.entries(_0x168718).map(([_0x29bd87, _0x19415a]) => [_0x29bd87, [..._0x19415a]]));
              _0x459583.actionId = "standing";
              _0x459583.actionTime = 0;
              _0x459583.actionPlaying = false;
              break;
            }
            return _0x2bab80;
          }
        });
        this._setMessage("已从参考图应用人物姿势（置信度 " + Math.round(_0x2690de * 100) + "%）。");
      },
      onStateChange: _0x47d831 => this._syncCharacterImagePoseUI(_0x47d831)
    });
    this.shotTimelineController = createStoryboard3DShotTimelineController({
      windowObject: this.window,
      getProject: () => this.projectStore.getSnapshot(),
      getEditorState: () => this.editorStore.getSnapshot(),
      getRoot: () => this.root,
      readCurrentCamera: () => this._readCurrentCameraState(),
      previewSample: _0x5697fa => this._previewShotTimelineSample(_0x5697fa),
      clearPreview: () => this._clearShotTimelinePreview(),
      commitMutation: _0x11a48f => this._executeMutation(_0x11a48f),
      requestRender: () => this._render(),
      setMessage: _0x42b42d => this._setMessage(_0x42b42d)
    });
    let _0x309a3d = null;
    const _0x192450 = createStoryboard3DSafeToolExecutor({
      projectStore: {
        getSnapshot: () => this.projectStore.getSnapshot(),
        replaceProject: _0x1d5a6c => {
          _0x309a3d = _0x1d5a6c;
          return _0x1d5a6c;
        }
      },
      assetLibrary: this.assetLibrary,
      readCurrentCamera: () => this._readCurrentCameraState()
    });
    this.aiController = createStoryboard3DAIVoiceController({
      projectStore: this.projectStore,
      model: () => this.aiModelId,
      provider: () => this.aiProvider,
      executeTransaction: async (_0x35487a, _0x46710a) => {
        await this._ensurePackAssetsForCommands(_0x35487a);
        _0x309a3d = null;
        const _0x2fb5b9 = await _0x192450(_0x35487a, _0x46710a);
        if (_0x2fb5b9.changed && _0x309a3d) {
          this.commandHistory.execute(createStoryboard3DProjectMutationCommand({
            type: "ai-scene-transaction",
            label: "AI scene transaction",
            mutate: () => _0x309a3d
          }));
        }
        return {
          ..._0x2fb5b9,
          project: this.projectStore.getSnapshot()
        };
      },
      assetLibrary: this.assetLibrary,
      windowObject: this.window,
      onStateChange: (_0x1a2150, _0x27646f = {}) => {
        this.aiState = _0x1a2150;
        if (_0x27646f.reason !== "set-instruction") {
          this._syncAIAssistant();
        }
      },
      onError: _0x6a24a9 => this._setMessage(_0x6a24a9?.message || String(_0x6a24a9))
    });
    this.aiState = this.aiController.getSnapshot();
    this._unsubscribeProject = this.projectStore.subscribe((_0x45ddc3, _0x1c540f) => {
      this._syncSaveStatus(_0x1c540f?.saveStatus);
    });
    this._unsubscribeEditor = this.editorStore.subscribe(() => {
      this._syncResponsiveState();
    });
  }
  mount() {
    if (this.root || !this.document?.body) {
      return this.root;
    }
    const _0xe87b31 = this.document.createElement("section");
    _0xe87b31.className = "storyboard-3d-editor-overlay";
    _0xe87b31.dataset.uiStop = "1";
    _0xe87b31.setAttribute("role", "dialog");
    _0xe87b31.setAttribute("aria-modal", "true");
    _0xe87b31.tabIndex = -1;
    _0xe87b31.setAttribute("aria-label", t("storyboard3d.editor.ariaLabel"));
    this.backgroundCalibrationInteraction = createStoryboard3DBackgroundCalibrationInteraction({
      root: _0xe87b31,
      windowObject: this.window,
      getBackground: () => getActiveStoryboard3DScene(this.projectStore.getSnapshot())?.background,
      onPreview: _0x48873d => this._previewBackgroundCalibrationDrag(_0x48873d),
      onCommit: _0x219301 => this._commitBackgroundCalibrationDrag(_0x219301),
      onCancel: () => this._render()
    });
    _0xe87b31.addEventListener("contextmenu", containWorkspaceContextMenu);
    _0xe87b31.addEventListener("pointerdown", _0x57fbc2 => _0x57fbc2.stopPropagation());
    _0xe87b31.addEventListener("pointerdown", this._handleInspectorResizePointerDown);
    _0xe87b31.addEventListener("pointerdown", this._handleRightSidebarResizePointerDown);
    _0xe87b31.addEventListener("pointerdown", this._handleTimelineResizePointerDown);
    _0xe87b31.addEventListener("pointerdown", this._handleMiniMapPointerDown);
    _0xe87b31.addEventListener("wheel", _0x142fbc => _0x142fbc.stopPropagation(), {
      passive: true
    });
    _0xe87b31.addEventListener("wheel", this._handleMiniMapWheel, {
      passive: false
    });
    _0xe87b31.addEventListener("click", this._handleClick);
    _0xe87b31.addEventListener("input", this._handleInput);
    _0xe87b31.addEventListener("change", this._handleChange);
    _0xe87b31.addEventListener("dragstart", this._handleOutlineDragStart);
    _0xe87b31.addEventListener("dragover", this._handleOutlineDragOver);
    _0xe87b31.addEventListener("drop", this._handleOutlineDrop);
    this.root = _0xe87b31;
    this.document.body.appendChild(_0xe87b31);
    this.document.body.classList.add("storyboard-3d-editor-open");
    this.window?.addEventListener?.("keydown", this._handleWindowKeyDown, true);
    this.window?.addEventListener?.("keyup", this._handleWindowKeyUp, true);
    this.window?.addEventListener?.("blur", this._handleWindowBlur);
    this.window?.addEventListener?.("resize", this._syncServerAlertOffset);
    this._observeServerAlert();
    this._render();
    this._modelPackStatusPromise = this._loadModelPackStatus();
    this._binaryAssetHydrationPromise = this._hydrateBinaryAssets();
    _0xe87b31.querySelector("[data-storyboard-3d-project-name]")?.focus?.();
    return _0xe87b31;
  }
  _observeServerAlert() {
    const _0x586ce5 = this.document?.getElementById?.("v2-server-disconnect-alert");
    const _0x51acdc = this.document?.querySelector?.(".header");
    this._syncServerAlertOffset();
    const _0x27ba9a = this.window?.MutationObserver;
    if (_0x586ce5 && typeof _0x27ba9a === "function") {
      this._serverAlertMutationObserver = new _0x27ba9a(this._syncServerAlertOffset);
      this._serverAlertMutationObserver.observe(_0x586ce5, {
        attributes: true,
        attributeFilter: ["style", "class"],
        childList: true,
        subtree: true
      });
    }
    const _0x2dceb1 = this.window?.ResizeObserver;
    if (typeof _0x2dceb1 === "function") {
      this._serverAlertResizeObserver = new _0x2dceb1(this._syncServerAlertOffset);
      if (_0x586ce5) {
        this._serverAlertResizeObserver.observe(_0x586ce5);
      }
      if (_0x51acdc) {
        this._serverAlertResizeObserver.observe(_0x51acdc);
      }
    }
  }
  _syncServerAlertOffset() {
    if (!this.root) {
      return;
    }
    const _0x2bd3b6 = this.document?.getElementById?.("v2-server-disconnect-alert");
    const _0x4b7873 = this.document?.querySelector?.(".header");
    let _0x4464e4 = Math.max(0, Math.ceil(_0x4b7873?.getBoundingClientRect?.().bottom || 0));
    if (_0x2bd3b6) {
      const _0x19eea8 = this.window?.getComputedStyle?.(_0x2bd3b6);
      if (_0x19eea8?.display !== "none" && _0x19eea8?.visibility !== "hidden") {
        _0x4464e4 = Math.max(_0x4464e4, Math.max(0, Math.ceil(_0x2bd3b6.getBoundingClientRect?.().bottom || 0)));
      }
    }
    this.root.style.setProperty("--storyboard-3d-editor-top-offset", _0x4464e4 + "px");
  }
  _disposeSceneRuntime() {
    this._sceneRuntimeResizeObserver?.disconnect?.();
    this._sceneRuntimeResizeObserver = null;
    if (this._miniMapRefreshFrame !== null) {
      this.window?.cancelAnimationFrame?.(this._miniMapRefreshFrame);
      this._miniMapRefreshFrame = null;
    }
    const _0x5bd0bb = this.root?.querySelector?.("[data-storyboard-3d-runtime-host]");
    _0x5bd0bb?.removeEventListener?.("pointerdown", this._handleRuntimePointerDown);
    _0x5bd0bb?.removeEventListener?.("pointermove", this._handleRuntimePointerHover);
    _0x5bd0bb?.removeEventListener?.("pointerleave", this._handleRuntimePointerLeave);
    _0x5bd0bb?.removeEventListener?.("contextmenu", this._handleRuntimeContextMenu);
    _0x5bd0bb?.removeEventListener?.("wheel", this._handleRuntimeWheel);
    this._cancelRuntimeSelection();
    this._cancelRuntimeTransform();
    this.sceneRuntime?.dispose?.();
    this.sceneRuntime = null;
    this.viewportControls?.destroy?.();
    this.viewportControls = null;
    this._gizmoDrag = null;
    this._selectionDrag = null;
    this._cameraDrag = null;
    this.window?.removeEventListener?.("pointermove", this._handleRuntimePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleRuntimePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
  }
  _showRuntimeFailure(_0x57b473, _0x4d6db1, {
    busy = false
  } = {}) {
    const _0x244567 = this.root?.querySelector?.("[data-storyboard-3d-runtime-status]");
    if (!_0x244567) {
      return;
    }
    const _0x303402 = String(_0x4d6db1?.message || _0x4d6db1 || "").trim();
    if (!busy) {
      this._runtimeFailureTitle = String(_0x57b473 || "3D 视口不可用");
      this._runtimeError = _0x303402 || this._runtimeError || this._runtimeFailureTitle;
    }
    _0x244567.hidden = false;
    _0x244567.dataset.state = busy ? "rebuilding" : "error";
    _0x244567.replaceChildren?.();
    if (typeof this.document?.createElement !== "function") {
      _0x244567.textContent = _0x303402 ? _0x57b473 + "：" + _0x303402 : _0x57b473;
      return;
    }
    const _0x3ae380 = this.document.createElement("strong");
    _0x3ae380.textContent = _0x57b473;
    _0x244567.appendChild(_0x3ae380);
    if (_0x303402) {
      const _0x2fb1bf = this.document.createElement("span");
      _0x2fb1bf.textContent = _0x303402;
      _0x244567.appendChild(_0x2fb1bf);
    }
    if (!busy) {
      const _0x587494 = this.document.createElement("button");
      _0x587494.type = "button";
      _0x587494.setAttribute("data-storyboard-3d-action", "rebuild-viewport");
      _0x587494.textContent = "重建视口";
      _0x244567.appendChild(_0x587494);
    }
  }
  _hideRuntimeFailure() {
    const _0x3bb79f = this.root?.querySelector?.("[data-storyboard-3d-runtime-status]");
    if (!_0x3bb79f) {
      return;
    }
    _0x3bb79f.hidden = true;
    _0x3bb79f.removeAttribute?.("data-state");
    _0x3bb79f.replaceChildren?.();
    this._runtimeFailureTitle = "";
  }
  _rebuildSceneRuntime() {
    if (this._closed || !this.root) {
      return false;
    }
    const _0x4ecb71 = this.projectStore.getSnapshot();
    const _0x39fff8 = this.editorStore.getSnapshot();
    this._disposeSceneRuntime();
    this._runtimeError = "";
    this._runtimeFailureTitle = "";
    this._showRuntimeFailure("正在重建 3D 视口…", "", {
      busy: true
    });
    const _0x20647e = this._mountSceneRuntime(_0x4ecb71, _0x39fff8);
    if (_0x20647e) {
      this._setMessage("3D 视口已重建。");
    }
    return _0x20647e;
  }
  _mountSceneRuntime(_0x42704b, _0x1c633d) {
    const _0x17ca4c = this.root?.querySelector?.("[data-storyboard-3d-runtime-host]");
    if (!_0x17ca4c) {
      return false;
    }
    let _0x11e845 = null;
    try {
      _0x11e845 = createStoryboard3DSceneRuntime({
        container: _0x17ca4c,
        importedModelResolver: _0x548075 => this.importedModelScenes.get(_0x548075) || null,
        onVisualChange: () => this._scheduleMiniMapRefresh()
      });
      _0x11e845.sync({
        project: _0x42704b,
        sceneId: _0x42704b.activeSceneId,
        selectedObjectIds: _0x1c633d.selectedObjectIds,
        activeTool: _0x1c633d.activeTool
      });
      _0x17ca4c.addEventListener("pointerdown", this._handleRuntimePointerDown);
      _0x17ca4c.addEventListener("pointermove", this._handleRuntimePointerHover);
      _0x17ca4c.addEventListener("pointerleave", this._handleRuntimePointerLeave);
      _0x17ca4c.addEventListener("contextmenu", this._handleRuntimeContextMenu);
      _0x17ca4c.addEventListener("wheel", this._handleRuntimeWheel, {
        passive: false
      });
      this.sceneRuntime = _0x11e845;
      this._scheduleMiniMapRefresh();
      this.viewportControls = createStoryboard3DViewportControlSystem({
        sceneRuntime: _0x11e845,
        initialSceneView: _0x11e845.getSceneView(),
        initialSettings: this.viewportSettings,
        applyViewState: _0x29aaaf => _0x11e845.commitSceneView(_0x29aaaf.sceneView),
        onChange: (_0x2c52b2, _0x3f8b6f) => {
          this.viewportSettings = _0x2c52b2.settings;
          _0x11e845.setViewportUIPatch?.(this.viewportControls?.getDirectorUIPatch?.() || {});
          for (const _0x1f3fa6 of this.root?.querySelectorAll?.("[data-storyboard-3d-action=\"set-viewport-view\"]") || []) {
            const _0x245f20 = _0x1f3fa6.dataset.view === _0x2c52b2.viewMode;
            _0x1f3fa6.classList?.toggle?.("is-active", _0x245f20);
            _0x1f3fa6.setAttribute?.("aria-pressed", String(_0x245f20));
          }
          if (_0x3f8b6f?.reason === "settings") {
            this._syncViewportSettingControls();
          }
        },
        onContextStateChange: (_0x46b7c8, _0x53788f) => {
          if (_0x46b7c8.state === "lost") {
            this._setMessage("WebGL 上下文已丢失，正在等待浏览器恢复。");
          }
          if (_0x46b7c8.state === "ready" && _0x46b7c8.lossCount > 0) {
            this._setMessage("WebGL 上下文已恢复。");
          }
          if (_0x46b7c8.state === "error") {
            this._runtimeError = _0x53788f?.error?.message || String(_0x53788f?.error || "WebGL 上下文恢复失败");
            this._showRuntimeFailure("WebGL 恢复失败", this._runtimeError);
          }
        }
      });
      _0x11e845.setViewportUIPatch(this.viewportControls.getDirectorUIPatch());
      this._restoreViewportFocalLength();
      this._runtimeError = "";
      this._runtimeFailureTitle = "";
      this._hideRuntimeFailure();
      const _0x25bac8 = () => {
        const _0x551359 = _0x17ca4c.getBoundingClientRect?.();
        _0x11e845.resize(Math.max(1, Math.round(_0x551359?.width || _0x17ca4c.clientWidth || 1)), Math.max(1, Math.round(_0x551359?.height || _0x17ca4c.clientHeight || 1)));
        _0x11e845.renderNow();
      };
      const _0x33860c = this.window?.ResizeObserver;
      if (typeof _0x33860c === "function") {
        this._sceneRuntimeResizeObserver = new _0x33860c(_0x25bac8);
        this._sceneRuntimeResizeObserver.observe(_0x17ca4c);
      }
      _0x25bac8();
      const _0x2840ad = getActiveStoryboard3DScene(_0x42704b);
      if (_0x2840ad?.shots?.some(_0x1b3a9a => !_0x1b3a9a.thumbnailUrl)) {
        this.window?.setTimeout?.(() => {
          if (!this._closed) {
            this._generateMissingShotThumbnails(_0x2840ad.id);
          }
        }, 0);
      }
      return true;
    } catch (_0x19eb56) {
      this._runtimeError = _0x19eb56?.message || String(_0x19eb56);
      this._runtimeFailureTitle = "3D 视口初始化失败";
      if (this.sceneRuntime === _0x11e845) {
        this._disposeSceneRuntime();
      } else {
        _0x11e845?.dispose?.();
      }
      this._showRuntimeFailure("3D 视口初始化失败", this._runtimeError);
      return false;
    }
  }
  async _renderShotCandidatePreviews(_0x2d1351, _0x3e5ee5) {
    const _0x2e49ca = this.sceneRuntime;
    if (!_0x2e49ca) {
      return;
    }
    const _0xe34ae1 = ++this._candidateRenderToken;
    const _0x20023d = this.window?.URL || globalThis.URL;
    for (let _0x1b29a8 = 0; _0x1b29a8 < this.shotCandidates.length; _0x1b29a8 += 1) {
      const _0x173e90 = this.shotCandidates[_0x1b29a8];
      if (_0x173e90.thumbnailUrl || _0xe34ae1 !== this._candidateRenderToken) {
        continue;
      }
      const _0x52bf70 = structuredClone(_0x2d1351);
      const _0x25d577 = getActiveStoryboard3DScene(_0x52bf70);
      const _0x1eb6fd = getActiveStoryboard3DShot(_0x52bf70);
      if (!_0x25d577 || !_0x1eb6fd) {
        continue;
      }
      _0x1eb6fd.camera = structuredClone(_0x173e90.camera);
      _0x2e49ca.sync({
        project: _0x52bf70,
        sceneId: _0x25d577.id,
        selectedObjectIds: [],
        activeTool: "select"
      });
      _0x2e49ca.renderNow();
      try {
        const _0x3bd42a = await _0x2e49ca.captureBlob({
          includeEditorOverlays: false
        });
        if (_0xe34ae1 !== this._candidateRenderToken) {
          return;
        }
        if (_0x3bd42a && typeof _0x20023d?.createObjectURL === "function") {
          _0x173e90.thumbnailUrl = _0x20023d.createObjectURL(_0x3bd42a);
          const _0x36daf0 = this.root?.querySelector?.("[data-candidate-preview=\"" + _0x1b29a8 + "\"]");
          if (_0x36daf0) {
            _0x36daf0.innerHTML = "<img src=\"" + escapeHtml(_0x173e90.thumbnailUrl) + "\" alt=\"候选镜头 " + (_0x1b29a8 + 1) + "\">";
          }
        }
      } catch (_0x689277) {
        const _0x3b0f1e = this.root?.querySelector?.("[data-candidate-preview=\"" + _0x1b29a8 + "\"]");
        if (_0x3b0f1e) {
          _0x3b0f1e.textContent = _0x689277?.message || "候选预览失败";
        }
      }
    }
    if (_0xe34ae1 === this._candidateRenderToken && this.sceneRuntime === _0x2e49ca) {
      _0x2e49ca.sync({
        project: _0x2d1351,
        sceneId: _0x2d1351.activeSceneId,
        selectedObjectIds: _0x3e5ee5.selectedObjectIds,
        activeTool: _0x3e5ee5.activeTool
      });
      _0x2e49ca.renderNow();
    }
  }
  _clearShotCandidates() {
    this._candidateRenderToken += 1;
    const _0x17c985 = this.window?.URL || globalThis.URL;
    this.shotCandidates.forEach(_0xe8657a => {
      if (_0xe8657a.thumbnailUrl) {
        _0x17c985?.revokeObjectURL?.(_0xe8657a.thumbnailUrl);
      }
    });
    this.shotCandidates = [];
  }
  async _renderShotFrame(_0x38c233, {
    width: _0x4a3692,
    height: _0x3906c6
  } = {}) {
    const _0x42bf9a = this.sceneRuntime;
    if (!_0x42bf9a) {
      throw new Error("3D 离屏渲染器尚未就绪。");
    }
    const _0x53b975 = this.projectStore.getSnapshot();
    const _0x3e56be = structuredClone(_0x53b975);
    const _0x51f42a = _0x3e56be.scenes.find(_0x4038d6 => _0x4038d6.id === _0x38c233?.sceneId) || getActiveStoryboard3DScene(_0x3e56be);
    const _0x51fdf3 = _0x51f42a?.shots?.find(_0x1f1e20 => _0x1f1e20.id === _0x38c233?.id);
    if (!_0x51f42a || !_0x51fdf3) {
      throw new Error("找不到需要渲染的镜头。");
    }
    _0x3e56be.activeSceneId = _0x51f42a.id;
    _0x51f42a.activeShotId = _0x51fdf3.id;
    _0x51fdf3.camera = structuredClone(_0x38c233.camera);
    _0x42bf9a.resize(Math.max(64, Number(_0x4a3692) || 1920), Math.max(64, Number(_0x3906c6) || 1080));
    _0x42bf9a.sync({
      project: _0x3e56be,
      sceneId: _0x51f42a.id,
      selectedObjectIds: [],
      activeTool: "select"
    });
    _0x42bf9a.renderNow();
    try {
      const _0x3a3a37 = await _0x42bf9a.captureBlob({
        includeEditorOverlays: false
      });
      const _0x3ba419 = this.window?.createImageBitmap || globalThis.createImageBitmap;
      if (typeof _0x3ba419 === "function") {
        return _0x3ba419(_0x3a3a37);
      }
      const _0x233ab5 = this.window?.URL || globalThis.URL;
      const _0x553a12 = this.window?.Image;
      if (!_0x553a12 || !_0x233ab5?.createObjectURL) {
        throw new Error("当前环境无法解码离屏渲染结果。");
      }
      const _0x46c65c = _0x233ab5.createObjectURL(_0x3a3a37);
      return await new Promise((_0x5af3bb, _0x57cf8d) => {
        const _0x107731 = new _0x553a12();
        _0x107731.onload = () => {
          _0x107731.close = () => _0x233ab5.revokeObjectURL(_0x46c65c);
          _0x5af3bb(_0x107731);
        };
        _0x107731.onerror = () => {
          _0x233ab5.revokeObjectURL(_0x46c65c);
          _0x57cf8d(new Error("离屏渲染结果解码失败。"));
        };
        _0x107731.src = _0x46c65c;
      });
    } finally {
      const _0x23d39b = this.editorStore.getSnapshot();
      _0x42bf9a.sync({
        project: _0x53b975,
        sceneId: _0x53b975.activeSceneId,
        selectedObjectIds: _0x23d39b.selectedObjectIds,
        activeTool: _0x23d39b.activeTool
      });
      const _0xab153 = this.root?.querySelector?.("[data-storyboard-3d-runtime-host]");
      const _0x4ec41c = _0xab153?.getBoundingClientRect?.();
      _0x42bf9a.resize(Math.max(1, Math.round(_0x4ec41c?.width || 1)), Math.max(1, Math.round(_0x4ec41c?.height || 1)));
      _0x42bf9a.renderNow();
    }
  }
  _generateShotThumbnail(_0x4f41e1, _0x1b7e4c) {
    this._shotThumbnailQueue = this._shotThumbnailQueue.catch(() => false).then(() => this._generateShotThumbnailNow(_0x4f41e1, _0x1b7e4c));
    return this._shotThumbnailQueue;
  }
  async _generateShotThumbnailNow(_0x55422a, _0x3497bc) {
    if (this._closed || !this.sceneRuntime) {
      return false;
    }
    const _0xc522cb = this.projectStore.getSnapshot();
    const _0x219246 = _0xc522cb.scenes.find(_0x48d1c4 => _0x48d1c4.id === _0x55422a);
    const _0x121147 = _0x219246?.shots?.find(_0x3eadc1 => _0x3eadc1.id === _0x3497bc);
    if (!_0x121147) {
      return false;
    }
    const _0x35adb0 = createStoryboard3DShotThumbnailToken(_0x55422a, _0x121147);
    try {
      const _0x566acf = await this._renderShotFrame(_0x121147, {
        width: 320,
        height: 180
      });
      const _0x5bf84a = this.document?.createElement?.("canvas");
      if (!_0x5bf84a?.getContext) {
        return false;
      }
      _0x5bf84a.width = 320;
      _0x5bf84a.height = 180;
      _0x5bf84a.getContext("2d")?.drawImage?.(_0x566acf?.image || _0x566acf, 0, 0, 320, 180);
      const _0xb81b90 = _0x5bf84a.toDataURL?.("image/jpeg", 0.78) || "";
      _0x566acf?.close?.();
      if (!_0xb81b90) {
        return false;
      }
      const _0xcaa98a = applyStoryboard3DShotThumbnail(this.projectStore.getSnapshot(), _0x35adb0, _0xb81b90, {
        now: Date.now()
      });
      if (!_0xcaa98a.applied) {
        return false;
      }
      this.projectStore.replaceProject(_0xcaa98a.project, "shot-thumbnail");
      this._render();
      dispatchWorkspaceEvent(this.window, "storyboard-3d:preview-updated", {
        projectId: this.projectId,
        sceneId: _0x55422a,
        shotId: _0x3497bc,
        previewUrl: _0xb81b90
      });
      return true;
    } catch (_0x73eb07) {
      this._setMessage(_0x73eb07?.message || String(_0x73eb07));
      return false;
    }
  }
  async _generateMissingShotThumbnails(_0x439e48) {
    const _0xbbf76b = this.projectStore.getSnapshot().scenes.find(_0x31e5b6 => _0x31e5b6.id === _0x439e48);
    const _0x483a6c = (_0xbbf76b?.shots || []).filter(_0x19ab9f => !_0x19ab9f.thumbnailUrl).map(_0x47557c => _0x47557c.id);
    for (const _0x400f3b of _0x483a6c) {
      if (this._closed || !this.sceneRuntime) {
        break;
      }
      await this._generateShotThumbnail(_0x439e48, _0x400f3b);
    }
  }
  _syncHistoryButtons() {
    const _0xf5d563 = this.commandHistory?.getSnapshot?.() || {};
    const _0x5ec46d = this.root?.querySelector?.("[data-storyboard-3d-action=\"undo\"]");
    const _0x12e449 = this.root?.querySelector?.("[data-storyboard-3d-action=\"redo\"]");
    if (_0x5ec46d) {
      _0x5ec46d.disabled = !_0xf5d563.canUndo;
    }
    if (_0x12e449) {
      _0x12e449.disabled = !_0xf5d563.canRedo;
    }
  }
  _readCurrentCameraState() {
    const _0x432179 = this.sceneRuntime?.readCurrentCamera?.();
    if (_0x432179?.position && _0x432179?.forward) {
      const _0x38e095 = this.sceneRuntime?.getSceneView?.();
      const _0x30a815 = Number(this.sceneRuntime?.getViewportFocalLength?.());
      return {
        position: [_0x432179.position.x, _0x432179.position.y, _0x432179.position.z],
        target: _0x38e095?.target ? [_0x38e095.target.x, _0x38e095.target.y, _0x38e095.target.z] : [_0x432179.position.x + _0x432179.forward.x * 10, _0x432179.position.y + _0x432179.forward.y * 10, _0x432179.position.z + _0x432179.forward.z * 10],
        focalLength: Number.isFinite(_0x30a815) && _0x30a815 > 0 ? _0x30a815 : Number(_0x432179.focalLength) || 35,
        near: 0.1,
        far: 1000,
        aspectRatio: "16:9"
      };
    }
    return getActiveStoryboard3DShot(this.projectStore.getSnapshot())?.camera || null;
  }
  _previewFocalLength(_0x3cf1bd) {
    const _0x3f88b5 = getStoryboard3DFocalPreset(_0x3cf1bd);
    const _0x17ea89 = this.projectStore.getSnapshot();
    const _0x48eebe = getActiveStoryboard3DScene(_0x17ea89);
    const _0x333359 = this._readCurrentCameraState();
    if (!_0x48eebe || !_0x333359) {
      return null;
    }
    const _0x3cb416 = setStoryboard3DCameraFocalLength(_0x333359, _0x3f88b5);
    const _0x3d889b = guardStoryboard3DBackgroundCameraChange(_0x48eebe.background, _0x3cb416);
    if (!_0x3d889b.allowed) {
      this._setMessage(_0x3d889b.reason);
      return null;
    }
    this.viewportFocalLength = _0x3f88b5;
    this.sceneRuntime?.setViewportFocalLength?.(_0x3f88b5);
    const _0x3af6e5 = this.root?.querySelector?.("[data-storyboard-3d-focal-slider]");
    if (_0x3af6e5) {
      _0x3af6e5.value = String(resolveStoryboard3DFocalPresetIndex(_0x3f88b5));
    }
    _0x3af6e5?.setAttribute?.("aria-valuetext", _0x3f88b5 + "mm");
    const _0x1fac94 = this.root?.querySelector?.("[data-storyboard-3d-focal-output]");
    if (_0x1fac94) {
      _0x1fac94.textContent = _0x3f88b5 + "mm";
    }
    this.root?.querySelectorAll?.(".storyboard-3d-focal-ticks [data-focal-length]")?.forEach?.(_0x56e0b4 => {
      _0x56e0b4.classList.toggle("is-active", Number(_0x56e0b4.dataset.focalLength) === _0x3f88b5);
    });
    const _0x5197b1 = this.root?.querySelector?.(".storyboard-3d-viewport-hud > strong");
    if (_0x5197b1) {
      _0x5197b1.textContent = _0x3f88b5 + "mm";
    }
    return {
      camera: _0x3cb416,
      focalLength: _0x3f88b5,
      scene: _0x48eebe
    };
  }
  _commitFocalLength(_0x5e364a) {
    return Boolean(this._previewFocalLength(_0x5e364a));
  }
  _restoreViewportFocalLength() {
    const _0x411364 = Number(this.viewportFocalLength);
    const _0x53ef15 = this._readCurrentCameraState();
    if (!Number.isFinite(_0x411364) || !_0x53ef15) {
      return false;
    }
    return this.sceneRuntime?.setViewportFocalLength?.(_0x411364) === true;
  }
  _previewShotTimelineSample(_0x547401) {
    if (!_0x547401 || !this.sceneRuntime) {
      return;
    }
    if (_0x547401.camera) {
      this.sceneRuntime.previewCamera?.(_0x547401.camera);
    }
    this.sceneRuntime.previewObjectTransforms?.(_0x547401.objectTransforms || {});
    this._miniMapPreviewSceneView = null;
    this._scheduleMiniMapRefresh();
  }
  _clearShotTimelinePreview() {
    this.sceneRuntime?.clearPreviews?.();
    this._miniMapPreviewSceneView = null;
    this._scheduleMiniMapRefresh();
  }
  _syncAIAssistant() {
    const _0x2a82d9 = this.root?.querySelector?.("[data-storyboard-3d-ai-panel]");
    if (!_0x2a82d9) {
      return;
    }
    this._aiModelSelectorController?.destroy?.();
    this._aiModelSelectorController = null;
    _0x2a82d9.outerHTML = renderAIAssistant({
      ...this.aiState,
      modelId: this.aiModelId,
      provider: this.aiProvider,
      canUndoAI: this.commandHistory.getSnapshot().nextUndoLabel === "AI scene transaction"
    });
    this._bindAIAssistantModelSelector();
  }
  _bindAIAssistantModelSelector() {
    this._aiModelSelectorController?.destroy?.();
    this._aiModelSelectorController = null;
    const _0x146dba = this.root?.querySelector?.(".storyboard-3d-ai-assistant [data-aigen-text-model-selector]");
    if (!_0x146dba) {
      return;
    }
    this._aiModelSelectorController = bindAIGenTextModelSelector(_0x146dba, {
      modelId: this.aiModelId,
      provider: this.aiProvider,
      getDisplayModelName: getDisplayModelName,
      documentObject: this.document,
      onChange: ({
        modelId: _0x243a9a,
        provider: _0x34cf2b
      }) => {
        this.aiModelId = resolveStoryWorkspaceModelId("text", _0x243a9a);
        this.aiProvider = String(_0x34cf2b || getStoryWorkspaceModelChoice("text", this.aiModelId)?.provider || "");
        const _0x2beaba = this.root?.querySelector?.("[data-storyboard-3d-action=\"run-ai-command\"]");
        if (_0x2beaba) {
          const _0x69e7fe = ["planning", "executing", "starting", "listening", "transcribing", "stopping"].includes(this.aiState.status);
          _0x2beaba.disabled = _0x69e7fe || !this.aiProvider;
        }
      }
    });
    _0x146dba.querySelectorAll?.(".node-model-submenu")?.forEach(_0x2a26f1 => {
      _0x2a26f1.dataset.nodeSubmenuPlacement = "viewport-left";
    });
  }
  _syncViewportSettingControls() {
    for (const _0x1f8cd5 of this.root?.querySelectorAll?.("[data-storyboard-3d-viewport-setting]") || []) {
      const _0x59720c = _0x1f8cd5.getAttribute("data-storyboard-3d-viewport-setting");
      if (_0x1f8cd5.type === "checkbox") {
        _0x1f8cd5.checked = this.viewportSettings[_0x59720c] === true;
      } else if (_0x59720c === "rotationSnapDegrees") {
        _0x1f8cd5.value = String(Math.round(this.viewportSettings.rotationSnap * 180 / Math.PI));
      } else if (_0x59720c in this.viewportSettings) {
        _0x1f8cd5.value = String(this.viewportSettings[_0x59720c]);
      }
    }
  }
  _syncNavigationSettingControls() {
    const _0x1d17a0 = STORYBOARD_3D_NAVIGATION_PRESETS[this.navigationSettings.preset] || STORYBOARD_3D_NAVIGATION_PRESETS.unity;
    for (const _0x10297c of this.root?.querySelectorAll?.("[data-storyboard-3d-navigation-preset]") || []) {
      const _0x39e80c = _0x10297c.value === _0x1d17a0.id;
      _0x10297c.checked = _0x39e80c;
      _0x10297c.closest(".storyboard-3d-navigation-preset")?.classList?.toggle?.("is-active", _0x39e80c);
    }
    for (const _0x1ad875 of this.root?.querySelectorAll?.("[data-storyboard-3d-navigation-setting]") || []) {
      const _0x4af3aa = _0x1ad875.getAttribute("data-storyboard-3d-navigation-setting");
      if (_0x1ad875.type === "checkbox") {
        _0x1ad875.checked = this.navigationSettings[_0x4af3aa] === true;
      } else {
        _0x1ad875.value = String(this.navigationSettings[_0x4af3aa]);
      }
      const _0x4aade0 = this.root?.querySelector?.("[data-storyboard-3d-navigation-output=\"" + _0x4af3aa + "\"]");
      if (_0x4aade0) {
        _0x4aade0.textContent = Number(this.navigationSettings[_0x4af3aa]).toFixed(2) + "×";
      }
    }
    const _0x30f781 = this.root?.querySelector?.("[data-storyboard-3d-navigation-current]");
    if (_0x30f781) {
      _0x30f781.textContent = _0x1d17a0.label;
    }
    for (const _0x34dab2 of this.root?.querySelectorAll?.("[data-storyboard-3d-tool-shortcut]") || []) {
      const _0x579306 = _0x34dab2.getAttribute("data-storyboard-3d-tool-shortcut");
      const _0x247b9f = getStoryboard3DToolShortcut(_0x1d17a0.id, _0x579306);
      const _0x2b2b47 = _0x34dab2.querySelector?.(".storyboard-3d-control-shortcut");
      if (_0x2b2b47) {
        _0x2b2b47.textContent = _0x247b9f;
      }
      const _0x719b7c = _0x34dab2.getAttribute("aria-label") || _0x579306;
      _0x34dab2.setAttribute("title", _0x247b9f ? _0x719b7c + " (" + _0x247b9f + ")" : _0x719b7c);
    }
    const _0x392a1a = this.root?.querySelector?.(".storyboard-3d-navigation-status:not(.is-fly-mode)");
    if (_0x392a1a) {
      _0x392a1a.textContent = getStoryboard3DNavigationHelpText({
        preset: _0x1d17a0.id
      });
    }
  }
  _saveNavigationSettings(_0x2cd094) {
    this.navigationSettings = saveStoryboard3DNavigationSettings(_0x2cd094, this.window?.localStorage);
    this._syncNavigationSettingControls();
  }
  _saveTransformSettings(_0x34f4b9) {
    this.viewportSettings = saveStoryboard3DTransformSettings(_0x34f4b9, this.window?.localStorage);
    this._syncViewportSettingControls();
    return this.viewportSettings;
  }
  _syncModelImportStatus() {
    const _0x1e72de = this.root?.querySelector?.("[data-storyboard-3d-import-status]");
    if (_0x1e72de && this.modelImportState) {
      _0x1e72de.textContent = (this.modelImportState.fileName || "模型") + " · " + this.modelImportState.status + " · " + Math.round((this.modelImportState.progress || 0) * 100) + "%";
    }
  }
  _syncCharacterImagePoseUI(_0x44f134) {
    const _0xfd0dc3 = String(_0x44f134?.objectId || "");
    const _0x34531a = [...(this.root?.querySelectorAll?.("[data-storyboard-3d-character-pose]") || [])].find(_0x2743ef => _0x2743ef.dataset.objectId === _0xfd0dc3);
    if (!_0x34531a) {
      return;
    }
    const _0x198c9b = _0x44f134.status === "running";
    const _0x10979c = this.projectStore.getSnapshot().scenes?.flatMap(_0x1f603c => _0x1f603c.objects || []).find(_0xd22966 => _0xd22966.id === _0xfd0dc3 && _0xd22966.type === "character");
    const _0x349de2 = Object.keys(_0x10979c?.boneOverrides || {}).length > 0;
    _0x34531a.dataset.poseStatus = _0x44f134.status || "idle";
    _0x34531a.dataset.hasPose = String(_0x349de2);
    _0x34531a.setAttribute("aria-busy", String(_0x198c9b));
    const _0x4f00f1 = _0x34531a.querySelector("[data-storyboard-3d-action=\"extract-character-pose\"]");
    if (_0x4f00f1) {
      _0x4f00f1.disabled = _0x198c9b;
      _0x4f00f1.textContent = _0x198c9b ? "识别中…" : "从图片提取姿势";
    }
    const _0x333ce0 = _0x34531a.querySelector("[data-storyboard-3d-action=\"reset-character-pose\"], [data-storyboard-3d-action=\"cancel-character-pose\"]");
    if (_0x333ce0) {
      _0x333ce0.setAttribute("data-storyboard-3d-action", _0x198c9b ? "cancel-character-pose" : "reset-character-pose");
      _0x333ce0.disabled = !_0x198c9b && !_0x349de2;
      _0x333ce0.textContent = _0x198c9b ? "取消识别" : "重置骨骼";
    }
    const _0x384d67 = _0x34531a.querySelector("[data-storyboard-3d-character-pose-status]");
    if (_0x384d67) {
      _0x384d67.textContent = getCharacterPoseStatusText(_0x44f134);
    }
  }
  _executeMutation({
    type: _0x2b126a,
    label: _0x222b7c,
    mutate: _0x1206e9,
    renderOptions = null
  }) {
    const _0x584ed8 = this._historyRenderOptions;
    this._historyRenderOptions = renderOptions;
    try {
      return this.commandHistory.execute(createStoryboard3DProjectMutationCommand({
        type: _0x2b126a,
        label: _0x222b7c,
        mutate: _0x1206e9
      }));
    } finally {
      this._historyRenderOptions = _0x584ed8;
    }
  }
  _previewBackgroundCalibrationDrag(_0x5ca771) {
    const _0x53c5dd = this.projectStore.getSnapshot();
    const _0x2569d7 = getActiveStoryboard3DShot(_0x53c5dd);
    if (!_0x5ca771?.imageUrl || !_0x2569d7?.camera) {
      return;
    }
    this.sceneRuntime?.previewCamera?.(deriveStoryboard3DBackgroundCamera(_0x5ca771, _0x2569d7.camera));
  }
  _commitBackgroundCalibrationDrag(_0x598ceb) {
    this._executeMutation({
      type: "adjust-background-perspective",
      label: "Adjust background perspective",
      mutate: _0x52d555 => {
        const _0x5de57b = getActiveStoryboard3DScene(_0x52d555);
        const _0x2bd6eb = getActiveStoryboard3DShot(_0x52d555);
        if (!_0x5de57b?.background) {
          return _0x52d555;
        }
        const _0xb7068c = updateStoryboard3DBackgroundCalibration(_0x5de57b.background, {
          horizonY: _0x598ceb.horizonY,
          vanishingPoint: [..._0x598ceb.vanishingPoint],
          calibrationMethod: "manual",
          calibrationConfidence: 1
        });
        if (_0x2bd6eb?.camera) {
          const _0x2d9609 = deriveStoryboard3DBackgroundCamera(_0xb7068c, _0x2bd6eb.camera);
          setStoryboard3DShotInitialCamera(_0x5de57b, _0x2bd6eb, _0x2d9609);
          _0x5de57b.background = setStoryboard3DBackgroundCameraLock(_0xb7068c, _0xb7068c.lockedCamera, _0x2bd6eb.camera);
        } else {
          _0x5de57b.background = _0xb7068c;
        }
        return _0x52d555;
      }
    });
  }
  _deleteObjects(_0x1b9099) {
    const _0x556ce0 = [...new Set((Array.isArray(_0x1b9099) ? _0x1b9099 : [_0x1b9099]).map(_0x17d62b => String(_0x17d62b || "").trim()).filter(Boolean))];
    if (_0x556ce0.length === 0) {
      return false;
    }
    this._executeMutation({
      type: _0x556ce0.length === 1 ? "delete-object" : "delete-objects",
      label: _0x556ce0.length === 1 ? "Delete object" : "Delete objects",
      mutate: _0x3383b8 => {
        const _0x262c69 = _0x3383b8.scenes.findIndex(_0x4aa108 => _0x4aa108.id === _0x3383b8.activeSceneId);
        if (_0x262c69 < 0) {
          return _0x3383b8;
        }
        let _0x445377 = _0x3383b8.scenes[_0x262c69];
        _0x556ce0.forEach(_0x39a417 => {
          const _0x21b4f7 = _0x445377.objects?.find(_0x4f68f7 => _0x4f68f7.id === _0x39a417);
          if (!_0x21b4f7) {
            return;
          }
          if (_0x21b4f7.type === "camera") {
            const _0x43b5c3 = _0x445377.shots?.find(_0x18b898 => _0x18b898.cameraId === _0x39a417);
            _0x445377 = _0x43b5c3 ? deleteStoryboard3DShot(_0x445377, _0x43b5c3.id) : {
              ..._0x445377,
              objects: _0x445377.objects.filter(_0x2247f0 => _0x2247f0.id !== _0x39a417)
            };
            return;
          }
          if (_0x21b4f7.type === "group") {
            _0x445377 = deleteStoryboard3DSceneGroup(_0x445377, _0x39a417, {
              deleteChildren: false
            });
            return;
          }
          _0x445377 = {
            ..._0x445377,
            objects: _0x445377.objects.filter(_0x4795c5 => _0x4795c5.id !== _0x39a417)
          };
        });
        _0x3383b8.scenes[_0x262c69] = _0x445377;
        return _0x3383b8;
      }
    });
    this._setSelectedObjects([]);
    this._render();
    return true;
  }
  _activateShotForCamera(_0x59cf8d) {
    const _0x1d50c8 = this.projectStore.getSnapshot();
    const _0x514698 = getActiveStoryboard3DScene(_0x1d50c8);
    const _0x40c3ba = _0x514698?.shots?.find(_0x3c6446 => _0x3c6446.cameraId === _0x59cf8d);
    if (!_0x40c3ba) {
      return true;
    }
    const _0x16ad90 = guardStoryboard3DBackgroundCameraChange(_0x514698.background, _0x40c3ba.camera);
    if (!_0x16ad90.allowed) {
      this._setMessage(_0x16ad90.reason);
      return false;
    }
    this.projectStore.selectShot(_0x40c3ba.id);
    return true;
  }
  _focusCameraObject(_0x2154aa) {
    if (!_0x2154aa) {
      return;
    }
    const _0x4724cb = () => this.viewportControls?.focusObject?.("camera", _0x2154aa);
    const _0x151141 = this.window?.requestAnimationFrame?.bind(this.window) || globalThis.requestAnimationFrame?.bind(globalThis);
    if (_0x151141) {
      _0x151141(_0x4724cb);
    } else {
      queueMicrotask(_0x4724cb);
    }
  }
  _recordTransformedKeyframes(_0x1f6e2f, _0x305181) {
    if (typeof this.projectStore?.getSnapshot !== "function") {
      this.shotTimelineController?.recordObjectTransforms?.(_0x1f6e2f, _0x305181);
      return;
    }
    const _0x18ed95 = this.projectStore.getSnapshot();
    const _0x5003b4 = getActiveStoryboard3DScene(_0x18ed95);
    const _0x29c022 = getActiveStoryboard3DShot(_0x18ed95);
    const _0x32312e = _0x29c022?.cameraId && _0x1f6e2f?.[_0x29c022.cameraId];
    if (_0x32312e) {
      this.shotTimelineController?.recordCameraKeyframe?.(_0x29c022.camera);
    }
    const _0x3afc6b = Object.fromEntries(Object.entries(_0x1f6e2f || {}).filter(([_0x1f2592]) => _0x5003b4?.objects?.find(_0xb7fc68 => _0xb7fc68.id === _0x1f2592)?.type !== "camera"));
    if (Object.keys(_0x3afc6b).length > 0) {
      this.shotTimelineController?.recordObjectTransforms?.(_0x3afc6b, _0x305181);
    }
  }
  _commitObjectTransforms({
    sceneId: _0x56e4ea,
    transforms: _0x35c912,
    activeTool: _0x4952ed,
    label: _0x4d7915
  }) {
    const _0x1831e8 = () => {
      const _0x5ba7d9 = this.commandHistory.execute(createStoryboard3DTransformCommand({
        sceneId: _0x56e4ea,
        transforms: _0x35c912,
        label: _0x4d7915,
        mergeKey: false
      }));
      if (_0x5ba7d9 !== false) {
        this._recordTransformedKeyframes(_0x35c912, _0x4952ed);
      }
      return _0x5ba7d9;
    };
    if (this.shotTimelineController?.isAutoKeyEnabled?.() && typeof this.commandHistory.runTransaction === "function") {
      return this.commandHistory.runTransaction(_0x4d7915 + " + Auto Key", _0x1831e8);
    }
    return _0x1831e8();
  }
  _applyDetectedBackgroundCalibration(_0x34e3e8, {
    type = "calibrate-background",
    label = "Calibrate background"
  } = {}) {
    const _0x2af5ef = this._readCurrentCameraState?.() || createDefaultStoryboard3DCameraState();
    this._executeMutation({
      type: type,
      label: label,
      mutate: _0x52529b => {
        const _0x41a382 = _0x52529b.scenes.findIndex(_0x58e9a2 => _0x58e9a2.id === _0x52529b.activeSceneId);
        if (_0x41a382 < 0) {
          return _0x52529b;
        }
        let _0x299b80 = _0x52529b.scenes[_0x41a382];
        let _0x2b5fb6 = _0x299b80.shots?.find(_0x5b209c => _0x5b209c.id === _0x299b80.activeShotId);
        if (!_0x2b5fb6) {
          _0x299b80 = appendShotFromCurrentView({
            scene: _0x299b80,
            camera: _0x2af5ef
          });
          _0x52529b.scenes[_0x41a382] = _0x299b80;
          _0x2b5fb6 = _0x299b80.shots.find(_0x211764 => _0x211764.id === _0x299b80.activeShotId);
        }
        if (!_0x2b5fb6) {
          return _0x52529b;
        }
        const _0x2483b9 = updateStoryboard3DBackgroundCalibration(_0x299b80.background, _0x34e3e8);
        const _0x5c0dbd = deriveStoryboard3DBackgroundCamera(_0x2483b9, _0x2b5fb6.camera);
        setStoryboard3DShotInitialCamera(_0x299b80, _0x2b5fb6, _0x5c0dbd);
        _0x299b80.background = setStoryboard3DBackgroundCameraLock(_0x2483b9, true, _0x2b5fb6.camera);
        return _0x52529b;
      }
    });
    const _0x1707dc = this.viewportControls?.updateSettings?.({
      groundLock: true
    }) || normalizeStoryboard3DViewportSettings({
      ...this.viewportSettings,
      groundLock: true
    });
    this._saveTransformSettings(_0x1707dc);
    this.sceneRuntime?.setViewportUIPatch?.(this.viewportControls?.getDirectorUIPatch?.() || {});
    this.sceneEnvironmentOpen = true;
  }
  async _reanalyzeActiveBackground() {
    try {
      const _0x396f67 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      const _0x5dab5e = _0x396f67?.background?.binaryAssetId;
      if (!_0x396f67 || !_0x5dab5e) {
        throw new Error("当前背景缺少可重新分析的本地原图。");
      }
      this._setMessage("正在分析地面、地平线和消失点…");
      const _0xd4b944 = await this.binaryAssetRepository.get(_0x5dab5e);
      const _0xe76491 = restoreStoryboard3DStoredFile(_0xd4b944?.primaryFile, this.window);
      if (!_0xe76491) {
        throw new Error("无法读取当前背景原图。");
      }
      const _0x34964a = await analyzeStoryboard3DBackgroundImage(_0xe76491, {
        documentObject: this.document,
        imageBitmapFactory: typeof this.window?.createImageBitmap === "function" ? this.window.createImageBitmap.bind(this.window) : undefined
      });
      this._applyDetectedBackgroundCalibration(_0x34964a, {
        type: "reanalyze-background",
        label: "Reanalyze background"
      });
      this._setMessage("背景透视已重新匹配并锁定，当前匹配度 " + Math.round(_0x34964a.calibrationConfidence * 100) + "%。");
    } catch (_0x27d5cb) {
      this._setMessage(_0x27d5cb?.message || String(_0x27d5cb));
    }
  }
  _getBackgroundImageController(_0x29e5a3) {
    const _0x3b798a = String(_0x29e5a3 || "");
    if (!this.backgroundImageControllers.has(_0x3b798a)) {
      this.backgroundImageControllers.set(_0x3b798a, createStoryboard3DBackgroundImageController({
        urlApi: this.window?.URL || globalThis.URL
      }));
    }
    return this.backgroundImageControllers.get(_0x3b798a);
  }
  _setImportedModelScene(_0x4a2a4e, _0x1a91a3, _0x31c069 = null) {
    const _0xf32784 = this.importedModelScenes.get(_0x4a2a4e);
    if (_0xf32784 && _0xf32784 !== _0x1a91a3) {
      disposeCancelledStoryboard3DModelImportResult({
        parsed: {
          scene: _0xf32784
        }
      });
    }
    this.importedModelScenes.set(_0x4a2a4e, setStoryboard3DModelNormalization(_0x1a91a3, _0x31c069));
  }
  _getAssetThumbnailRenderer() {
    if (!this.assetThumbnailRenderer) {
      this.assetThumbnailRenderer = createStoryboard3DAssetThumbnailRenderer({
        documentObject: this.document
      });
    }
    return this.assetThumbnailRenderer;
  }
  _syncAssetThumbnail(_0x32f125, _0x19f984, _0x5f31c6 = "ready") {
    const _0x4e53c9 = "[data-storyboard-3d-asset-thumbnail][data-asset-id=\"" + (globalThis.CSS?.escape?.(_0x32f125) || _0x32f125) + "\"]";
    this.root?.querySelectorAll?.(_0x4e53c9)?.forEach(_0x20c33b => {
      _0x20c33b.dataset.thumbnailStatus = _0x5f31c6;
      if (_0x19f984) {
        const _0x24a127 = this.assetLibrary.find(_0x32f125);
        const _0x45f3ba = this.document.createElement("img");
        _0x45f3ba.src = _0x19f984;
        _0x45f3ba.alt = (_0x24a127?.name || "模型") + " 模型预览";
        _0x20c33b.replaceChildren(_0x45f3ba);
      } else if (_0x5f31c6 === "unavailable") {
        const _0x527a0f = this.document.createElement("small");
        _0x527a0f.textContent = "暂无预览";
        _0x20c33b.replaceChildren(_0x527a0f);
      }
    });
  }
  _ensureAssetThumbnail(_0x49bf9a) {
    const _0x264636 = this.assetLibrary.find(_0x49bf9a);
    if (!_0x264636 || this._assetThumbnailFailures.has(_0x264636.id)) {
      return Promise.resolve("");
    }
    const _0x1fc244 = storyboard3DAssetThumbnailCache.get(_0x264636);
    if (_0x1fc244) {
      this._syncAssetThumbnail(_0x264636.id, _0x1fc244);
      return Promise.resolve(_0x1fc244);
    }
    if (this._assetThumbnailLoads.has(_0x264636.id)) {
      return this._assetThumbnailLoads.get(_0x264636.id);
    }
    const _0x2dd9bc = _0x264636.source?.kind === "builtin" ? createStoryboard3DBuiltinAssetThumbnailModel(_0x264636.source.assetId || _0x264636.id, {
      clayColor: _0x264636.tint
    }) : null;
    if (_0x264636.source?.kind !== "pack" && !this.importedModelScenes.has(_0x264636.id) && !_0x2dd9bc) {
      this._assetThumbnailFailures.add(_0x264636.id);
      this._syncAssetThumbnail(_0x264636.id, "", "unavailable");
      return Promise.resolve("");
    }
    this._syncAssetThumbnail(_0x264636.id, "", "loading");
    const _0x5bd098 = this._assetThumbnailQueue.catch(() => "").then(async () => {
      const _0x1274dd = _0x2dd9bc;
      try {
        if (this._closed) {
          return "";
        }
        const _0x2f493a = _0x1274dd || this.importedModelScenes.get(_0x264636.id) || (await this._loadPackAsset(_0x264636.id));
        if (!_0x2f493a || this._closed) {
          return "";
        }
        const _0x365627 = this._getAssetThumbnailRenderer().render(_0x2f493a);
        storyboard3DAssetThumbnailCache.set(_0x264636, _0x365627);
        this._syncAssetThumbnail(_0x264636.id, _0x365627);
        return _0x365627;
      } finally {
        if (_0x1274dd) {
          disposeStoryboard3DAssetThumbnailModel(_0x1274dd);
        }
      }
    }).catch(() => {
      this._assetThumbnailFailures.add(_0x264636.id);
      this._syncAssetThumbnail(_0x264636.id, "", "unavailable");
      return "";
    }).finally(() => this._assetThumbnailLoads.delete(_0x264636.id));
    this._assetThumbnailLoads.set(_0x264636.id, _0x5bd098);
    this._assetThumbnailQueue = _0x5bd098;
    return _0x5bd098;
  }
  _observeVisibleAssetThumbnails() {
    this._assetThumbnailObserver?.disconnect?.();
    this._assetThumbnailObserver = null;
    if (!this.editorStore.getSnapshot().assetLibraryOpen) {
      return;
    }
    const _0x15904 = [...(this.root?.querySelectorAll?.("[data-storyboard-3d-asset-thumbnail][data-thumbnail-status=\"pending\"]") || [])];
    if (_0x15904.length === 0) {
      return;
    }
    const _0x2d689e = this.window?.IntersectionObserver;
    if (typeof _0x2d689e !== "function") {
      _0x15904.slice(0, 12).forEach(_0x229e9b => {
        this._ensureAssetThumbnail(_0x229e9b.dataset.assetId);
      });
      return;
    }
    this._assetThumbnailObserver = new _0x2d689e(_0x3ed30f => {
      _0x3ed30f.forEach(_0x3f0537 => {
        if (!_0x3f0537.isIntersecting) {
          return;
        }
        this._assetThumbnailObserver?.unobserve?.(_0x3f0537.target);
        this._ensureAssetThumbnail(_0x3f0537.target.dataset.assetId);
      });
    }, {
      root: this.root.querySelector(".storyboard-3d-asset-grid"),
      rootMargin: "120px"
    });
    _0x15904.forEach(_0x25139e => this._assetThumbnailObserver.observe(_0x25139e));
  }
  async _loadModelPackStatus() {
    try {
      const _0x58e934 = await this.modelPackApi.getStatus();
      this.modelPackStatus = {
        ..._0x58e934,
        loaded: true,
        error: ""
      };
      if (this._closed) {
        return this.modelPackStatus;
      }
      if (!_0x58e934.installed) {
        this._setMessage("3D 模型包尚未安装，请返回 3D 场景预演首页完成下载后再使用 Agent。");
        return this.modelPackStatus;
      }
      this.assetLibrary.registerPackAssets(_0x58e934.assets, {
        packId: _0x58e934.packId
      });
      await this._hydratePackAssetsForProject();
      if (!this._closed && !this._runtimeError) {
        this._render();
      }
      return this.modelPackStatus;
    } catch (_0x3da25e) {
      const _0x2b7619 = "无法读取 3D 模型包：" + (_0x3da25e?.message || String(_0x3da25e));
      this.modelPackStatus = {
        loaded: true,
        installed: false,
        assets: [],
        error: _0x2b7619
      };
      this._setMessage(_0x2b7619);
      return this.modelPackStatus;
    }
  }
  async _requireInstalledModelPack() {
    const _0x1f4e57 = this._modelPackStatusPromise ? await this._modelPackStatusPromise : await this._loadModelPackStatus();
    if (!_0x1f4e57?.installed) {
      throw new Error(_0x1f4e57?.error || "3D 模型包尚未安装，无法生成场景。请先返回首页下载模型包。");
    }
    return _0x1f4e57;
  }
  async _loadPackAsset(_0x3eef00) {
    const _0x5217c7 = this.assetLibrary.find(_0x3eef00);
    if (_0x5217c7?.source?.kind !== "pack") {
      return null;
    }
    if (this.importedModelScenes.has(_0x5217c7.id)) {
      return this.importedModelScenes.get(_0x5217c7.id);
    }
    if (this._packAssetLoads.has(_0x5217c7.id)) {
      return this._packAssetLoads.get(_0x5217c7.id);
    }
    const _0x4fcd02 = (async () => {
      const _0x59d6e3 = await this.modelPackApi.fetchAssetFile(_0x5217c7.source);
      const _0x27a0bc = await importStoryboard3DModelFile(_0x59d6e3, {
        parsers: this.modelParsers,
        targetSize: getStoryboard3DAssetSpatialExtent(_0x5217c7)
      });
      await applyStoryboard3DTexturePolicy(_0x27a0bc.parsed.scene, {
        renderer: this.sceneRuntime?.bridge?.renderer
      });
      if (this._closed) {
        disposeCancelledStoryboard3DModelImportResult(_0x27a0bc);
        throw new Error("3D 编辑器已关闭。");
      }
      this._setImportedModelScene(_0x5217c7.id, _0x27a0bc.parsed.scene, _0x27a0bc.normalization);
      return _0x27a0bc.parsed.scene;
    })().catch(_0x57190b => {
      this._packAssetLoads.delete(_0x5217c7.id);
      throw new Error("模型包素材“" + _0x5217c7.name + "”加载失败：" + (_0x57190b?.message || String(_0x57190b)));
    });
    this._packAssetLoads.set(_0x5217c7.id, _0x4fcd02);
    return _0x4fcd02;
  }
  async _hydratePackAssetsForProject() {
    const _0x2e0d4a = [...new Set(this.projectStore.getSnapshot().scenes.flatMap(_0xec676c => _0xec676c.objects.filter(_0x1e03a9 => _0x1e03a9.type === "prop").map(_0x5084e3 => _0x5084e3.assetId)).filter(Boolean))];
    const _0x1f1753 = _0x2e0d4a.filter(_0x182f58 => this.assetLibrary.find(_0x182f58)?.source?.kind === "pack");
    if (_0x1f1753.length === 0) {
      return [];
    }
    const _0x333dac = await Promise.allSettled(_0x1f1753.map(_0x4bf543 => this._loadPackAsset(_0x4bf543)));
    const _0x5ed5db = _0x333dac.find(_0x3b39e9 => _0x3b39e9.status === "rejected");
    if (_0x5ed5db) {
      this._setMessage(_0x5ed5db.reason?.message || String(_0x5ed5db.reason));
    }
    return _0x333dac;
  }
  async _ensurePackAssetsForCommands(_0xdffb90 = []) {
    await this._requireInstalledModelPack();
    const _0x5dbcf2 = [...new Set(_0xdffb90.filter(_0x44785a => _0x44785a?.tool === "addProp").map(_0x28ab8f => _0x28ab8f?.args?.assetId).filter(_0x1c4379 => this.assetLibrary.find(_0x1c4379)?.source?.kind === "pack"))];
    await Promise.all(_0x5dbcf2.map(_0x131402 => this._loadPackAsset(_0x131402)));
  }
  async _hydrateBinaryAssets() {
    const _0x43795d = this.projectStore.getSnapshot();
    const _0x4c847b = [...new Set(_0x43795d.scenes.flatMap(_0x34d4b6 => _0x34d4b6.objects.filter(_0x2d2693 => _0x2d2693.type === "prop").map(_0x2934ff => _0x2934ff.assetId)).filter(Boolean))];
    const _0x53f536 = [...new Set(_0x43795d.scenes.map(_0x3653c2 => _0x3653c2.background?.binaryAssetId).filter(Boolean))];
    const _0xe8716d = [...new Set([..._0x4c847b, ..._0x53f536])];
    if (_0xe8716d.length === 0) {
      return {
        restoredModels: 0,
        restoredBackgrounds: 0
      };
    }
    try {
      const _0x461f3d = await this.binaryAssetRepository.getMany(_0xe8716d);
      if (this._closed) {
        return {
          restoredModels: 0,
          restoredBackgrounds: 0
        };
      }
      let _0x44cba3 = 0;
      const _0x4ddae0 = new Map();
      for (const _0x12264a of _0x461f3d.filter(Boolean)) {
        const _0xfaf1cb = restoreStoryboard3DStoredFile(_0x12264a.primaryFile, this.window);
        const _0x222e45 = _0x12264a.relatedFiles.map(_0xd66742 => restoreStoryboard3DStoredFile(_0xd66742, this.window)).filter(Boolean);
        if (!_0xfaf1cb) {
          continue;
        }
        if (_0x12264a.kind === "model") {
          const _0x2f6843 = await importStoryboard3DModelFile(_0xfaf1cb, {
            parsers: this.modelParsers,
            relatedFiles: _0x222e45
          });
          if (this._closed) {
            disposeCancelledStoryboard3DModelImportResult(_0x2f6843);
            break;
          }
          await applyStoryboard3DTexturePolicy(_0x2f6843.parsed.scene, {
            renderer: this.sceneRuntime?.bridge?.renderer
          });
          if (this._closed) {
            disposeCancelledStoryboard3DModelImportResult(_0x2f6843);
            break;
          }
          const _0xf45b06 = _0x12264a.descriptor?.assetDescriptor;
          if (_0xf45b06) {
            this.assetLibrary.registerImported(_0xf45b06);
          }
          this._setImportedModelScene(_0x12264a.assetId, _0x2f6843.parsed.scene, _0x2f6843.normalization);
          _0x44cba3 += 1;
        } else if (_0x12264a.kind === "background") {
          _0x43795d.scenes.filter(_0x19e067 => _0x19e067.background?.binaryAssetId === _0x12264a.assetId).forEach(_0x2df18e => {
            const _0x432198 = this._getBackgroundImageController(_0x2df18e.id).load(_0xfaf1cb);
            _0x4ddae0.set(_0x2df18e.id, _0x432198.imageUrl);
          });
        }
      }
      if (_0x4ddae0.size > 0) {
        this.projectStore.updateProject("restore-background-assets", _0x414d66 => {
          _0x414d66.scenes.forEach(_0x417522 => {
            if (_0x417522.background && _0x4ddae0.has(_0x417522.id)) {
              _0x417522.background.imageUrl = _0x4ddae0.get(_0x417522.id);
            }
          });
        });
      }
      if (_0x44cba3 > 0 || _0x4ddae0.size > 0) {
        this._render();
      }
      return {
        restoredModels: _0x44cba3,
        restoredBackgrounds: _0x4ddae0.size
      };
    } catch (_0x56cc6a) {
      if (!this._closed) {
        this._setMessage("本地 3D 资源恢复失败：" + (_0x56cc6a?.message || String(_0x56cc6a)));
      }
      return {
        restoredModels: 0,
        restoredBackgrounds: 0,
        error: _0x56cc6a
      };
    }
  }
  _getObject(_0x1b8b63, _0x4fbd2d) {
    const _0x157ce4 = this.projectStore.getSnapshot();
    const _0x2f299c = _0x157ce4.scenes.find(_0x4dc272 => _0x4dc272.id === _0x1b8b63);
    return _0x2f299c?.objects?.find(_0x4604df => _0x4604df.id === _0x4fbd2d) || null;
  }
  _handleRuntimePointerDown(_0x19733e) {
    if (!this.sceneRuntime) {
      return;
    }
    const _0x3bd8a1 = this.editorStore.getSnapshot();
    const _0xcf25d8 = resolveStoryboard3DNavigationMode(_0x19733e, {
      flyMode: _0x3bd8a1.flyMode,
      preset: this.navigationSettings.preset
    });
    if (_0xcf25d8) {
      const _0x337092 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      if (_0x337092?.background?.lockedCamera) {
        this._setMessage("背景机位已锁定；请先解除锁定再导航视口。");
        return;
      }
      const _0x3aa15c = this.sceneRuntime.getSceneView?.();
      const _0x12c43b = _0x19733e.currentTarget;
      const _0xbc0b0b = _0x12c43b?.getBoundingClientRect?.();
      if (!_0x3aa15c || !_0xbc0b0b?.width || !_0xbc0b0b?.height) {
        return;
      }
      _0x19733e.preventDefault();
      _0x19733e.stopPropagation();
      const _0x1a7b1e = structuredClone(_0xcf25d8 === "fly-look" ? this._flySceneView || _0x3aa15c : _0x3aa15c);
      if (_0xcf25d8 === "fly-look") {
        this._flySceneView = _0x1a7b1e;
      }
      const _0x9ec646 = this.sceneRuntime.readCurrentCamera?.();
      this._cameraDrag = {
        mode: _0xcf25d8,
        startX: _0x19733e.clientX,
        startY: _0x19733e.clientY,
        lastX: _0x19733e.clientX,
        lastY: _0x19733e.clientY,
        rect: _0xbc0b0b,
        sceneView: _0x1a7b1e,
        cameraPose: _0x9ec646,
        fov: this.sceneRuntime.getViewportFov?.() ?? _0x9ec646?.fov,
        latestSceneView: _0x1a7b1e,
        pointerId: _0x19733e.pointerId,
        host: _0x12c43b
      };
      _0x12c43b?.classList?.add?.("is-camera-" + _0xcf25d8);
      try {
        _0x12c43b?.setPointerCapture?.(_0x19733e.pointerId);
      } catch {}
      this.window?.addEventListener?.("pointermove", this._handleRuntimePointerMove, true);
      this.window?.addEventListener?.("pointerup", this._handleRuntimePointerUp, true);
      this.window?.addEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
      return;
    }
    if (_0x19733e.button !== 0) {
      return;
    }
    _0x19733e.preventDefault();
    _0x19733e.stopPropagation();
    const _0x2ab735 = this.sceneRuntime.pickGizmoHandle(_0x19733e.clientX, _0x19733e.clientY);
    if (_0x2ab735 && _0x3bd8a1.selectedObjectIds.length > 0) {
      const _0x3923cb = this.sceneRuntime.beginGizmoDrag({
        handleKey: _0x2ab735.handleKey,
        clientX: _0x19733e.clientX,
        clientY: _0x19733e.clientY
      });
      if (_0x3923cb) {
        const _0x3353a6 = this.projectStore.getSnapshot();
        const _0x2bf661 = getActiveStoryboard3DScene(_0x3353a6);
        const _0x51369e = {};
        _0x3bd8a1.selectedObjectIds.forEach(_0x1122b6 => {
          const _0x43913b = _0x2bf661?.objects?.find(_0x46d792 => _0x46d792.id === _0x1122b6);
          if (_0x43913b && _0x43913b.visible !== false && _0x43913b.locked !== true && canStoryboard3DObjectUseTransformTool(_0x43913b, _0x3bd8a1.activeTool)) {
            _0x51369e[_0x1122b6] = structuredClone(this.shotTimelineController?.getPreviewTransform?.(_0x1122b6) || _0x43913b.transform);
          }
        });
        if (Object.keys(_0x51369e).length > 0) {
          const _0x17321b = createStoryboard3DTransformSession({
            sceneId: _0x2bf661.id,
            activeTool: _0x3bd8a1.activeTool,
            initialTransforms: _0x51369e,
            dragState: _0x3923cb,
            settings: {
              ...this.viewportSettings,
              groundPositions: this.sceneRuntime.resolveObjectGroundPositions?.(Object.keys(_0x51369e))
            }
          });
          if (!_0x17321b) {
            return;
          }
          if (_0x17321b.forcedUniformScale) {
            this._setMessage("多选对象朝向不同，已使用均匀缩放以避免产生不可保存的剪切变形。");
          }
          _0x17321b.pointerId = _0x19733e.pointerId;
          _0x17321b.host = _0x19733e.currentTarget;
          this._gizmoDrag = _0x17321b;
          this.sceneRuntime.setGizmoHoverHandle?.(null);
          this.sceneRuntime.setGizmoActiveHandle?.(_0x2ab735.handleKey);
          if (_0x17321b.activeTool === "move") {
            const _0x5bcac7 = _0x3923cb.pivot || {
              x: 0,
              y: 0,
              z: 0
            };
            this.sceneRuntime.setGizmoMoveGuideLine?.({
              from: _0x5bcac7,
              to: _0x5bcac7
            });
          }
          _0x19733e.currentTarget?.classList?.add?.("is-gizmo-dragging");
          try {
            _0x19733e.currentTarget?.setPointerCapture?.(_0x19733e.pointerId);
          } catch {}
          this.window?.addEventListener?.("pointermove", this._handleRuntimePointerMove, true);
          this.window?.addEventListener?.("pointerup", this._handleRuntimePointerUp, true);
          this.window?.addEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
          return;
        }
      }
    }
    const _0x118ca9 = this.sceneRuntime.pick(_0x19733e.clientX, _0x19733e.clientY);
    const _0x4a8273 = _0x3bd8a1.selectedObjectIds;
    if (STORYBOARD_3D_SELECT_MOVE_TOOLS.has(_0x3bd8a1.activeTool) && !_0x118ca9) {
      this._beginRuntimeSelectionBox(_0x19733e, _0x4a8273);
      return;
    }
    let _0x3e4cd1 = _0x118ca9 ? [_0x118ca9.storyboardObjectId] : [];
    if (_0x118ca9 && (_0x19733e.shiftKey || _0x19733e.ctrlKey || _0x19733e.metaKey)) {
      _0x3e4cd1 = _0x4a8273.includes(_0x118ca9.storyboardObjectId) ? _0x4a8273.filter(_0x186b3b => _0x186b3b !== _0x118ca9.storyboardObjectId) : [..._0x4a8273, _0x118ca9.storyboardObjectId];
    }
    if (_0x118ca9?.storyboardObjectType === "camera" && _0x3e4cd1.includes(_0x118ca9.storyboardObjectId)) {
      if (!this._activateShotForCamera(_0x118ca9.storyboardObjectId)) {
        return;
      }
    }
    this._setSelectedObjects(_0x3e4cd1);
    this._render();
    if (_0x118ca9?.storyboardObjectType === "camera" && _0x3e4cd1.length === 1) {
      this._focusCameraObject(_0x118ca9.storyboardObjectId);
    }
  }
  _beginRuntimeSelectionBox(_0x3d005c, _0x4a7eb3 = []) {
    const _0x2b09c6 = _0x3d005c.currentTarget;
    if (!_0x2b09c6) {
      return;
    }
    const _0x82b83 = this.document?.createElement?.("div") || null;
    if (_0x82b83) {
      _0x82b83.className = "storyboard-3d-selection-box";
      _0x82b83.hidden = true;
      _0x2b09c6.appendChild(_0x82b83);
    }
    this._selectionDrag = {
      pointerId: _0x3d005c.pointerId,
      host: _0x2b09c6,
      box: _0x82b83,
      start: {
        clientX: _0x3d005c.clientX,
        clientY: _0x3d005c.clientY
      },
      initialObjectIds: [..._0x4a7eb3],
      latestObjectIds: [..._0x4a7eb3],
      additive: _0x3d005c.shiftKey === true,
      toggle: _0x3d005c.ctrlKey === true || _0x3d005c.metaKey === true,
      moved: false
    };
    _0x2b09c6.classList?.add?.("is-box-selecting");
    this.sceneRuntime?.setGizmoHoverHandle?.(null);
    try {
      _0x2b09c6.setPointerCapture?.(_0x3d005c.pointerId);
    } catch {}
    this.window?.addEventListener?.("pointermove", this._handleRuntimePointerMove, true);
    this.window?.addEventListener?.("pointerup", this._handleRuntimePointerUp, true);
    this.window?.addEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
  }
  _cleanupRuntimeSelectionBox(_0x2f545a) {
    this.window?.removeEventListener?.("pointermove", this._handleRuntimePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleRuntimePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
    _0x2f545a?.box?.remove?.();
    _0x2f545a?.host?.classList?.remove?.("is-box-selecting");
    try {
      _0x2f545a?.host?.releasePointerCapture?.(_0x2f545a.pointerId);
    } catch {}
  }
  _finishRuntimeSelectionBox(_0x12a7c9) {
    const _0x289aa2 = this._selectionDrag;
    if (!_0x289aa2) {
      return false;
    }
    if (_0x289aa2.pointerId != null && _0x12a7c9?.pointerId !== _0x289aa2.pointerId) {
      return false;
    }
    _0x12a7c9?.preventDefault?.();
    _0x12a7c9?.stopImmediatePropagation?.();
    this._cleanupRuntimeSelectionBox(_0x289aa2);
    this._selectionDrag = null;
    if (_0x289aa2.moved) {
      this._setSelectedObjects(_0x289aa2.latestObjectIds);
      this._render();
    } else if (!_0x289aa2.additive && !_0x289aa2.toggle) {
      this._setSelectedObjects([]);
      this._render();
    } else {
      this.sceneRuntime?.setSelection?.(_0x289aa2.initialObjectIds);
    }
    return true;
  }
  _cancelRuntimeSelection(_0x5dd02c) {
    const _0x359731 = this._selectionDrag;
    if (!_0x359731) {
      return false;
    }
    if (_0x5dd02c && _0x359731.pointerId != null && _0x5dd02c.pointerId !== _0x359731.pointerId) {
      return false;
    }
    _0x5dd02c?.preventDefault?.();
    _0x5dd02c?.stopImmediatePropagation?.();
    this._cleanupRuntimeSelectionBox(_0x359731);
    this._selectionDrag = null;
    this.sceneRuntime?.setSelection?.(_0x359731.initialObjectIds);
    return true;
  }
  _handleRuntimePointerHover(_0x511ed7) {
    if (!this.sceneRuntime || this._gizmoDrag || this._selectionDrag || this._cameraDrag) {
      return;
    }
    const _0x5079a8 = this.editorStore.getSnapshot();
    const _0x1644f8 = _0x5079a8.selectedObjectIds.length === 0 ? null : this.sceneRuntime.pickGizmoHandle(_0x511ed7.clientX, _0x511ed7.clientY);
    this.sceneRuntime.setGizmoHoverHandle?.(_0x1644f8?.handleKey || null);
    _0x511ed7.currentTarget?.classList?.toggle?.("is-gizmo-hovered", Boolean(_0x1644f8));
  }
  _handleRuntimePointerLeave(_0x4876f7) {
    if (this._gizmoDrag || this._selectionDrag || this._cameraDrag) {
      return;
    }
    this.sceneRuntime?.setGizmoHoverHandle?.(null);
    _0x4876f7.currentTarget?.classList?.remove?.("is-gizmo-hovered");
  }
  _handleRuntimeContextMenu(_0x33dc0a) {
    _0x33dc0a.preventDefault();
  }
  _handleRuntimePointerMove(_0x5b10a0) {
    const _0x3177ae = this._cameraDrag;
    if (_0x3177ae && this.sceneRuntime) {
      if (_0x3177ae.pointerId != null && _0x5b10a0.pointerId !== _0x3177ae.pointerId) {
        return;
      }
      _0x5b10a0.preventDefault();
      _0x5b10a0.stopImmediatePropagation();
      const _0x27251a = _0x5b10a0.clientX - _0x3177ae.startX;
      const _0x59bc51 = _0x5b10a0.clientY - _0x3177ae.startY;
      const _0x7b1659 = _0x27251a * this.navigationSettings.orbitSensitivity * (this.navigationSettings.invertOrbitX ? -1 : 1);
      const _0x285477 = _0x59bc51 * this.navigationSettings.orbitSensitivity * (this.navigationSettings.invertOrbitY ? -1 : 1);
      const _0xb218df = _0x27251a * this.navigationSettings.panSensitivity;
      const _0x2b4533 = _0x59bc51 * this.navigationSettings.panSensitivity;
      const _0x5c459a = _0x59bc51 * this.navigationSettings.zoomSensitivity;
      if (_0x3177ae.mode === "fly-look") {
        const _0xee3532 = this._flySceneView || _0x3177ae.latestSceneView;
        const _0x1ce267 = _0x5b10a0.clientX - _0x3177ae.lastX;
        const _0x35723a = _0x5b10a0.clientY - _0x3177ae.lastY;
        _0x3177ae.lastX = _0x5b10a0.clientX;
        _0x3177ae.lastY = _0x5b10a0.clientY;
        _0x3177ae.latestSceneView = {
          ..._0xee3532,
          ...applySceneFlyLookDelta(_0xee3532, _0x1ce267, _0x35723a, _0x3177ae.rect, {
            fov: _0x3177ae.fov
          })
        };
        this._flySceneView = _0x3177ae.latestSceneView;
      } else {
        const _0x17bf3f = _0x3177ae.mode === "pan" ? applyScenePanDelta(_0x3177ae.sceneView, _0x3177ae.cameraPose, _0xb218df, _0x2b4533, _0x3177ae.rect) : _0x3177ae.mode === "dolly" ? applySceneDollyDelta(_0x3177ae.sceneView, _0x5c459a) : applyOrbitDelta(_0x3177ae.sceneView, _0x7b1659, _0x285477, _0x3177ae.rect, {
          fov: _0x3177ae.fov
        });
        _0x3177ae.latestSceneView = {
          ..._0x3177ae.sceneView,
          ..._0x17bf3f
        };
      }
      this.sceneRuntime.previewSceneView(_0x3177ae.latestSceneView);
      this._miniMapPreviewSceneView = structuredClone(_0x3177ae.latestSceneView);
      this._scheduleMiniMapRefresh();
      return;
    }
    const _0x38f154 = this._selectionDrag;
    if (_0x38f154 && this.sceneRuntime) {
      if (_0x38f154.pointerId != null && _0x5b10a0.pointerId !== _0x38f154.pointerId) {
        return;
      }
      _0x5b10a0.preventDefault();
      _0x5b10a0.stopImmediatePropagation();
      const _0x178943 = createStoryboard3DSelectionRect(_0x38f154.start, _0x5b10a0);
      _0x38f154.moved = hasStoryboard3DSelectionDragMoved(_0x178943);
      const _0x866947 = _0x38f154.host?.getBoundingClientRect?.();
      if (_0x38f154.box && _0x866947) {
        _0x38f154.box.hidden = !_0x38f154.moved;
        _0x38f154.box.style.left = Math.max(0, _0x178943.left - _0x866947.left) + "px";
        _0x38f154.box.style.top = Math.max(0, _0x178943.top - _0x866947.top) + "px";
        _0x38f154.box.style.width = _0x178943.width + "px";
        _0x38f154.box.style.height = _0x178943.height + "px";
      }
      if (_0x38f154.moved) {
        const _0x46d9a4 = this.sceneRuntime.pickObjectsInRect(_0x178943).map(_0x476a10 => _0x476a10.storyboardObjectId || _0x476a10.objectId).filter(Boolean);
        _0x38f154.latestObjectIds = mergeStoryboard3DBoxSelection({
          initialObjectIds: _0x38f154.initialObjectIds,
          hitObjectIds: _0x46d9a4,
          additive: _0x38f154.additive,
          toggle: _0x38f154.toggle
        });
        this.sceneRuntime.setSelection(_0x38f154.latestObjectIds);
      }
      return;
    }
    const _0x408715 = this._gizmoDrag;
    if (!_0x408715 || !this.sceneRuntime) {
      return;
    }
    if (_0x408715.pointerId != null && _0x5b10a0.pointerId !== _0x408715.pointerId) {
      return;
    }
    _0x5b10a0.preventDefault();
    _0x5b10a0.stopImmediatePropagation();
    const _0x37e7eb = this.sceneRuntime.sampleGizmoDragPoint(_0x408715.dragState, _0x5b10a0.clientX, _0x5b10a0.clientY);
    if (!_0x37e7eb) {
      return;
    }
    const _0x4c4889 = this.sceneRuntime.computeGizmoDragValue(_0x408715.dragState, _0x37e7eb);
    const _0x4e3411 = updateStoryboard3DTransformSession(_0x408715, _0x4c4889, {
      precision: _0x5b10a0.shiftKey === true,
      toggleSnap: _0x5b10a0.ctrlKey === true || _0x5b10a0.metaKey === true
    });
    this.sceneRuntime.previewObjectTransforms?.(_0x4e3411);
    if (_0x408715.activeTool === "move") {
      const _0x3de8b3 = Object.keys(_0x4e3411)[0];
      const _0x1560d6 = _0x408715.initialTransforms[_0x3de8b3];
      const _0x4586ed = _0x4e3411[_0x3de8b3];
      const _0x40d857 = _0x408715.dragState.pivot || {
        x: 0,
        y: 0,
        z: 0
      };
      this.sceneRuntime.setGizmoMoveGuideLine?.({
        from: _0x40d857,
        to: {
          x: (_0x40d857.x || 0) + (_0x4586ed?.position?.[0] || 0) - (_0x1560d6?.position?.[0] || 0),
          y: (_0x40d857.y || 0) + (_0x4586ed?.position?.[1] || 0) - (_0x1560d6?.position?.[1] || 0),
          z: (_0x40d857.z || 0) + (_0x4586ed?.position?.[2] || 0) - (_0x1560d6?.position?.[2] || 0)
        }
      });
    }
  }
  _handleRuntimePointerUp(_0x1eb4d2) {
    if (this._finishRuntimeSelectionBox(_0x1eb4d2)) {
      return;
    }
    const _0x346029 = this._cameraDrag;
    if (_0x346029) {
      if (_0x346029.pointerId != null && _0x1eb4d2?.pointerId !== _0x346029.pointerId) {
        return;
      }
      _0x1eb4d2?.preventDefault?.();
      _0x1eb4d2?.stopImmediatePropagation?.();
      this.window?.removeEventListener?.("pointermove", this._handleRuntimePointerMove, true);
      this.window?.removeEventListener?.("pointerup", this._handleRuntimePointerUp, true);
      this.window?.removeEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
      try {
        _0x346029.host?.releasePointerCapture?.(_0x346029.pointerId);
      } catch {}
      _0x346029.host?.classList?.remove?.("is-camera-orbit", "is-camera-pan", "is-camera-dolly", "is-camera-fly-look");
      this._cameraDrag = null;
      const _0x3dcbb6 = _0x346029.mode === "fly-look";
      if (_0x3dcbb6) {
        this._flySceneView = structuredClone(_0x346029.latestSceneView);
        if (this._flyKeys.size > 0) {
          this.sceneRuntime?.previewSceneView?.(this._flySceneView);
        } else {
          this._finishFlyMovement();
        }
      } else {
        this.sceneRuntime?.commitSceneView?.(_0x346029.latestSceneView);
      }
      if (this.viewportControls) {
        this.viewportControls.sceneView = structuredClone(_0x346029.latestSceneView);
        const _0x65385f = this.viewportControls.getSnapshot?.().viewMode || this.viewportControls.viewMode;
        if (_0x65385f === "perspective") {
          this.viewportControls.perspectiveSceneView = structuredClone(_0x346029.latestSceneView);
        }
      }
      this._miniMapPreviewSceneView = null;
      this._scheduleMiniMapRefresh();
      if (!_0x3dcbb6 && this.shotTimelineController?.isAutoKeyEnabled?.()) {
        this.shotTimelineController.recordCameraKeyframe(this._readCurrentCameraState());
      }
      return;
    }
    const _0x6e7221 = this._gizmoDrag;
    if (!_0x6e7221) {
      return;
    }
    if (_0x6e7221.pointerId != null && _0x1eb4d2?.pointerId !== _0x6e7221.pointerId) {
      return;
    }
    _0x1eb4d2?.preventDefault?.();
    _0x1eb4d2?.stopImmediatePropagation?.();
    this.window?.removeEventListener?.("pointermove", this._handleRuntimePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleRuntimePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
    this.sceneRuntime?.clearPreviews?.();
    this.sceneRuntime?.clearGizmoState?.();
    _0x6e7221.host?.classList?.remove?.("is-gizmo-dragging", "is-gizmo-hovered");
    try {
      _0x6e7221.host?.releasePointerCapture?.(_0x6e7221.pointerId);
    } catch {}
    this._gizmoDrag = null;
    this._commitObjectTransforms({
      sceneId: _0x6e7221.sceneId,
      transforms: _0x6e7221.latestTransforms,
      activeTool: _0x6e7221.activeTool,
      label: _0x6e7221.activeTool + " objects"
    });
  }
  _cancelRuntimeTransform(_0x222260) {
    const _0x383de2 = this._gizmoDrag;
    if (!_0x383de2) {
      return false;
    }
    if (_0x222260 && _0x383de2.pointerId != null && _0x222260.pointerId !== _0x383de2.pointerId) {
      return false;
    }
    _0x222260?.preventDefault?.();
    _0x222260?.stopImmediatePropagation?.();
    this.window?.removeEventListener?.("pointermove", this._handleRuntimePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleRuntimePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleRuntimePointerCancel, true);
    this.sceneRuntime?.clearPreviews?.();
    this.sceneRuntime?.clearGizmoState?.();
    _0x383de2.host?.classList?.remove?.("is-gizmo-dragging", "is-gizmo-hovered");
    try {
      _0x383de2.host?.releasePointerCapture?.(_0x383de2.pointerId);
    } catch {}
    this._gizmoDrag = null;
    return true;
  }
  _handleRuntimePointerCancel(_0x3fb388) {
    if (this._cancelRuntimeSelection(_0x3fb388)) {
      return;
    }
    if (this._cancelRuntimeTransform(_0x3fb388)) {
      return;
    }
    this._handleRuntimePointerUp(_0x3fb388);
  }
  _handleRuntimeWheel(_0x33e56e) {
    if (!this.sceneRuntime) {
      return;
    }
    const _0x4188be = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
    if (_0x4188be?.background?.lockedCamera) {
      this._setMessage("背景机位已锁定；请先解除锁定再缩放视口。");
      return;
    }
    const _0x4ee7f2 = this.sceneRuntime.getSceneView?.();
    if (!_0x4ee7f2) {
      return;
    }
    _0x33e56e.preventDefault();
    _0x33e56e.stopPropagation();
    const _0x54f0e6 = _0x33e56e.currentTarget?.getBoundingClientRect?.();
    const _0x1cc643 = this.navigationSettings.invertWheel ? -1 : 1;
    const _0x18903b = normalizeWheelDelta(_0x33e56e.deltaY, _0x33e56e.deltaMode, _0x54f0e6?.height || 800) * this.navigationSettings.zoomSensitivity * _0x1cc643;
    const _0x1211dc = {
      ..._0x4ee7f2,
      ...applySceneZoomDelta(_0x4ee7f2, _0x18903b)
    };
    this.sceneRuntime.previewSceneView(_0x1211dc);
    this.sceneRuntime.commitSceneView(_0x1211dc);
    this._scheduleMiniMapRefresh();
    if (this.viewportControls) {
      this.viewportControls.sceneView = structuredClone(_0x1211dc);
      if (this.viewportControls.getSnapshot?.().viewMode === "perspective") {
        this.viewportControls.perspectiveSceneView = structuredClone(_0x1211dc);
      }
    }
  }
  _handleMiniMapPointerDown(_0x1b5166) {
    const _0x310ae4 = _0x1b5166.target?.closest?.(".storyboard-3d-mini-map-title");
    if (_0x310ae4 && !_0x1b5166.target.closest("button") && _0x1b5166.button === 0) {
      const _0x47b3b3 = _0x310ae4.closest(".storyboard-3d-mini-map-placeholder");
      const _0x16994b = _0x47b3b3?.closest?.(".storyboard-3d-viewport");
      const _0x11d1b2 = _0x47b3b3?.getBoundingClientRect?.();
      const _0x48bc32 = _0x16994b?.getBoundingClientRect?.();
      if (!_0x11d1b2 || !_0x48bc32) {
        return;
      }
      _0x1b5166.preventDefault();
      _0x1b5166.stopImmediatePropagation();
      this._miniMapWindowDrag = {
        startX: _0x1b5166.clientX,
        startY: _0x1b5166.clientY,
        initial: {
          ...this.miniMapWindowOffset
        },
        maxLeft: Math.max(0, _0x48bc32.width - _0x11d1b2.width - 28),
        maxDown: Math.max(0, _0x48bc32.height - _0x11d1b2.height - 28)
      };
      this.window?.addEventListener?.("pointermove", this._handleMiniMapWindowMove, true);
      this.window?.addEventListener?.("pointerup", this._handleMiniMapWindowUp, true);
      this.window?.addEventListener?.("pointercancel", this._handleMiniMapWindowUp, true);
      return;
    }
    const _0x421406 = _0x1b5166.target?.closest?.(".storyboard-3d-mini-map-canvas [data-object-id]");
    if (!_0x421406 || _0x1b5166.button !== 0) {
      return;
    }
    const _0x870b1e = this.projectStore.getSnapshot();
    const _0x11a791 = getActiveStoryboard3DScene(_0x870b1e);
    const _0x268987 = _0x11a791?.objects?.find(_0x300eee => _0x300eee.id === _0x421406.dataset.objectId);
    const _0x512102 = _0x421406.closest(".storyboard-3d-mini-map-canvas");
    const _0x110d85 = _0x512102?.getBoundingClientRect?.();
    if (!_0x268987 || _0x268987.locked || !_0x110d85?.width || !_0x110d85?.height) {
      return;
    }
    _0x1b5166.preventDefault();
    _0x1b5166.stopImmediatePropagation();
    this._setSelectedObjects([_0x268987.id]);
    const _0x27b8f2 = getActiveStoryboard3DShot(_0x870b1e);
    this._miniMapDrag = {
      sceneId: _0x11a791.id,
      objectId: _0x268987.id,
      object: _0x268987,
      rect: _0x110d85,
      projection: createMiniMapLayout(_0x11a791, _0x27b8f2, _0x110d85, this.miniMapZoom, this._miniMapFootprints, this._miniMapFrame?.worldBounds || null, this._getMiniMapCamera(_0x27b8f2)).projection,
      transform: structuredClone(_0x268987.transform)
    };
    this.window?.addEventListener?.("pointermove", this._handleMiniMapPointerMove, true);
    this.window?.addEventListener?.("pointerup", this._handleMiniMapPointerUp, true);
    this.window?.addEventListener?.("pointercancel", this._handleMiniMapPointerUp, true);
  }
  _handleMiniMapPointerMove(_0xae5d4a) {
    const _0x324b1f = this._miniMapDrag;
    if (!_0x324b1f) {
      return;
    }
    _0xae5d4a.preventDefault?.();
    _0xae5d4a.stopImmediatePropagation?.();
    _0x324b1f.transform = computeStoryboard3DMiniMapObjectDrag({
      x: _0xae5d4a.clientX - _0x324b1f.rect.left,
      y: _0xae5d4a.clientY - _0x324b1f.rect.top
    }, _0x324b1f.object, _0x324b1f.projection);
    this.sceneRuntime?.previewObjectTransform?.(_0x324b1f.objectId, _0x324b1f.transform);
    const _0x14897f = [...(this.root?.querySelectorAll?.(".storyboard-3d-mini-map-canvas [data-object-id]") || [])].find(_0x46a57d => _0x46a57d.dataset.objectId === _0x324b1f.objectId);
    const _0x33762a = projectStoryboard3DWorldToMiniMapRatio({
      x: _0x324b1f.transform.position[0],
      z: _0x324b1f.transform.position[2]
    }, _0x324b1f.projection);
    _0x14897f?.style?.setProperty?.("--mini-x", _0x33762a.x * 100 + "%");
    _0x14897f?.style?.setProperty?.("--mini-y", _0x33762a.y * 100 + "%");
  }
  _scheduleMiniMapRefresh() {
    if (this._closed || !this.root || this._miniMapRefreshFrame !== null) {
      return;
    }
    const _0x8959e8 = this.window?.requestAnimationFrame?.bind?.(this.window);
    if (typeof _0x8959e8 !== "function") {
      this._refreshMiniMapFromRuntime();
      return;
    }
    this._miniMapRefreshFrame = _0x8959e8(() => {
      this._miniMapRefreshFrame = null;
      this._refreshMiniMapFromRuntime();
    });
  }
  _refreshMiniMapFromRuntime() {
    if (this._closed || !this.root || !this.sceneRuntime) {
      return;
    }
    this._miniMapFootprints = this.sceneRuntime.getMiniMapFootprints?.() || [];
    const _0x835c6f = this.projectStore.getSnapshot();
    const _0xfbe57e = getActiveStoryboard3DScene(_0x835c6f);
    const _0x5d295b = getActiveStoryboard3DShot(_0x835c6f);
    const _0x54bbf5 = this.root.querySelector(".storyboard-3d-mini-map-placeholder");
    if (!_0x54bbf5 || !_0xfbe57e) {
      return;
    }
    const _0x42d526 = this._resolveMiniMapWorldBounds(_0xfbe57e, _0x5d295b, this._miniMapFootprints);
    const _0x5a2026 = this._getMiniMapCamera(_0x5d295b);
    _0x54bbf5.innerHTML = renderMiniMap(_0xfbe57e, _0x5d295b, {
      expanded: this.miniMapExpanded,
      zoom: this.miniMapZoom,
      footprints: this._miniMapFootprints,
      worldBounds: _0x42d526,
      camera: _0x5a2026
    });
  }
  _getMiniMapCamera(_0x17a722) {
    return createStoryboard3DMiniMapCameraPose(_0x17a722, this._miniMapPreviewSceneView || this.sceneRuntime?.getSceneView?.(), this.sceneRuntime?.readCurrentCamera?.());
  }
  _resolveMiniMapWorldBounds(_0x201a89, _0x5bdb03, _0x5eee95 = []) {
    const _0x26d0d7 = (_0x201a89?.objects || []).filter(_0x231994 => _0x231994?.visible !== false).map(_0x53c3db => String(_0x53c3db.id || "")).filter(Boolean).sort();
    const _0x1f88f3 = _0x26d0d7.join("|");
    const _0x3e0938 = (_0x5eee95 || []).some(_0x381d80 => Array.isArray(_0x381d80?.points) && _0x381d80.points.length >= 3);
    if (!this._miniMapFrame || this._miniMapFrame.sceneId !== _0x201a89?.id || this._miniMapFrame.objectSignature !== _0x1f88f3 || !this._miniMapFrame.hasGeometry && _0x3e0938) {
      this._miniMapFrame = {
        sceneId: _0x201a89?.id || "",
        objectSignature: _0x1f88f3,
        hasGeometry: _0x3e0938,
        worldBounds: createMiniMapWorldBounds(_0x201a89, _0x5bdb03, _0x5eee95)
      };
    }
    return this._miniMapFrame.worldBounds;
  }
  _handleMiniMapPointerUp(_0x4f158c) {
    const _0x11ad54 = this._miniMapDrag;
    if (!_0x11ad54) {
      return;
    }
    _0x4f158c?.preventDefault?.();
    _0x4f158c?.stopImmediatePropagation?.();
    this.window?.removeEventListener?.("pointermove", this._handleMiniMapPointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleMiniMapPointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleMiniMapPointerUp, true);
    this.sceneRuntime?.clearObjectTransformPreview?.(_0x11ad54.objectId);
    this._miniMapDrag = null;
    this._commitObjectTransforms({
      sceneId: _0x11ad54.sceneId,
      transforms: {
        [_0x11ad54.objectId]: _0x11ad54.transform
      },
      activeTool: "move",
      label: "Move object from mini map"
    });
  }
  _handleMiniMapWheel(_0x1453ee) {
    if (!_0x1453ee.target?.closest?.(".storyboard-3d-mini-map-placeholder")) {
      return;
    }
    _0x1453ee.preventDefault();
    _0x1453ee.stopPropagation();
    this.miniMapZoom = Math.max(0.5, Math.min(3, this.miniMapZoom * Math.exp(-(Number(_0x1453ee.deltaY) || 0) * 0.001)));
    this._render();
  }
  _handleMiniMapWindowMove(_0x473fbb) {
    const _0x390253 = this._miniMapWindowDrag;
    if (!_0x390253) {
      return;
    }
    _0x473fbb.preventDefault?.();
    _0x473fbb.stopImmediatePropagation?.();
    this.miniMapWindowOffset = {
      x: Math.max(-_0x390253.maxLeft, Math.min(0, _0x390253.initial.x + _0x473fbb.clientX - _0x390253.startX)),
      y: Math.max(0, Math.min(_0x390253.maxDown, _0x390253.initial.y + _0x473fbb.clientY - _0x390253.startY))
    };
    const _0x22017f = this.root?.querySelector?.(".storyboard-3d-mini-map-placeholder");
    _0x22017f?.style?.setProperty?.("--mini-map-window-x", this.miniMapWindowOffset.x + "px");
    _0x22017f?.style?.setProperty?.("--mini-map-window-y", this.miniMapWindowOffset.y + "px");
  }
  _handleMiniMapWindowUp(_0x5d67c1) {
    if (!this._miniMapWindowDrag) {
      return;
    }
    _0x5d67c1?.preventDefault?.();
    _0x5d67c1?.stopImmediatePropagation?.();
    this._miniMapWindowDrag = null;
    this.window?.removeEventListener?.("pointermove", this._handleMiniMapWindowMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleMiniMapWindowUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleMiniMapWindowUp, true);
  }
  _handleOutlineDragStart(_0x165de5) {
    const _0x578f14 = _0x165de5.target?.closest?.(".storyboard-3d-scene-item[data-scene-id]");
    if (_0x578f14 && _0x165de5.dataTransfer) {
      _0x165de5.dataTransfer.effectAllowed = "move";
      _0x165de5.dataTransfer.setData("application/x-storyboard3d-scene", _0x578f14.dataset.sceneId || "");
      return;
    }
    const _0x10473d = _0x165de5.target?.closest?.(".storyboard-3d-shot-card[data-shot-id]");
    if (_0x10473d && _0x165de5.dataTransfer) {
      _0x165de5.dataTransfer.effectAllowed = "move";
      _0x165de5.dataTransfer.setData("application/x-storyboard3d-shot", _0x10473d.dataset.shotId || "");
      return;
    }
    const _0x5874a7 = _0x165de5.target?.closest?.(".storyboard-3d-object-row[data-object-id]");
    if (!_0x5874a7 || !_0x165de5.dataTransfer) {
      return;
    }
    _0x165de5.dataTransfer.effectAllowed = "move";
    _0x165de5.dataTransfer.setData("text/storyboard3d-object-id", _0x5874a7.dataset.objectId || "");
    _0x165de5.dataTransfer.setData("text/plain", _0x5874a7.dataset.objectId || "");
  }
  _handleOutlineDragOver(_0x28f15b) {
    if (_0x28f15b.target?.closest?.(".storyboard-3d-scene-item, .storyboard-3d-shot-card")) {
      _0x28f15b.preventDefault();
      if (_0x28f15b.dataTransfer) {
        _0x28f15b.dataTransfer.dropEffect = "move";
      }
      return;
    }
    if (!_0x28f15b.target?.closest?.(".storyboard-3d-outline-list")) {
      return;
    }
    const _0x3416fe = _0x28f15b.target.closest(".storyboard-3d-object-row");
    if (_0x3416fe && _0x3416fe.dataset.objectType !== "group") {
      return;
    }
    _0x28f15b.preventDefault();
    if (_0x28f15b.dataTransfer) {
      _0x28f15b.dataTransfer.dropEffect = "move";
    }
  }
  _handleOutlineDrop(_0x2389bf) {
    const _0x4cf7dc = _0x2389bf.target?.closest?.(".storyboard-3d-scene-item[data-scene-id]");
    const _0x567082 = _0x2389bf.dataTransfer?.getData?.("application/x-storyboard3d-scene") || "";
    if (_0x4cf7dc && _0x567082) {
      _0x2389bf.preventDefault();
      this._executeMutation({
        type: "drag-reorder-scene",
        label: "Reorder scene",
        mutate: _0xb0679 => reorderStoryboard3DScene(_0xb0679, _0x567082, _0xb0679.scenes.findIndex(_0x4a9ba2 => _0x4a9ba2.id === _0x4cf7dc.dataset.sceneId), {
          now: Date.now()
        })
      });
      this._render();
      return;
    }
    const _0x426e36 = _0x2389bf.target?.closest?.(".storyboard-3d-shot-card[data-shot-id]");
    const _0x372ebc = _0x2389bf.dataTransfer?.getData?.("application/x-storyboard3d-shot") || "";
    if (_0x426e36 && _0x372ebc) {
      _0x2389bf.preventDefault();
      this._executeMutation({
        type: "drag-reorder-shot",
        label: "Reorder shot",
        mutate: _0x36f34c => {
          const _0x58bcae = _0x36f34c.scenes.findIndex(_0xa0b0ba => _0xa0b0ba.id === _0x36f34c.activeSceneId);
          const _0x368781 = _0x36f34c.scenes[_0x58bcae];
          if (_0x368781) {
            _0x36f34c.scenes[_0x58bcae] = reorderStoryboard3DShot(_0x368781, _0x372ebc, _0x368781.shots.findIndex(_0x3f4cdd => _0x3f4cdd.id === _0x426e36.dataset.shotId));
          }
          return _0x36f34c;
        }
      });
      this._render();
      return;
    }
    if (!_0x2389bf.target?.closest?.(".storyboard-3d-outline-list")) {
      return;
    }
    const _0x5115d9 = _0x2389bf.dataTransfer?.getData?.("text/storyboard3d-object-id") || _0x2389bf.dataTransfer?.getData?.("text/plain") || "";
    if (!_0x5115d9) {
      return;
    }
    const _0x1bc61b = _0x2389bf.target.closest(".storyboard-3d-object-row");
    if (_0x1bc61b && _0x1bc61b.dataset.objectType !== "group") {
      return;
    }
    _0x2389bf.preventDefault();
    const _0x24b2a2 = _0x1bc61b?.dataset.objectId || null;
    try {
      this._executeMutation({
        type: "drag-object-parent",
        label: "Move object in hierarchy",
        mutate: _0x551a39 => {
          const _0x2c6155 = _0x551a39.scenes.findIndex(_0x1e1e26 => _0x1e1e26.id === _0x551a39.activeSceneId);
          if (_0x2c6155 >= 0) {
            _0x551a39.scenes[_0x2c6155] = setStoryboard3DObjectParent(_0x551a39.scenes[_0x2c6155], _0x5115d9, _0x24b2a2);
          }
          return _0x551a39;
        }
      });
    } catch (_0x5de1a1) {
      this._setMessage(_0x5de1a1?.message || String(_0x5de1a1));
    }
    this._render();
  }
  _render({
    preserveAssetLibrary = false
  } = {}) {
    if (!this.root) {
      return;
    }
    const _0x4f3b0f = this.root.querySelector(".storyboard-3d-outline-list")?.scrollTop || 0;
    const _0x341f0a = this.root.querySelector(".storyboard-3d-object-properties-sidebar");
    const _0x2fb726 = _0x341f0a?.dataset.objectId || "";
    const _0x23d207 = _0x341f0a?.querySelector(".storyboard-3d-object-properties-content")?.scrollTop || 0;
    const _0x47bf52 = this.root.querySelector(".storyboard-3d-global-settings")?.open === true;
    this._aiModelSelectorController?.destroy?.();
    this._aiModelSelectorController = null;
    const _0x510006 = this.projectStore.getSnapshot();
    const _0x286348 = this.editorStore.getSnapshot();
    const _0x52e952 = getActiveStoryboard3DScene(_0x510006);
    const _0x2dae2d = getActiveStoryboard3DShot(_0x510006);
    const _0x55c51b = _0x286348.selectedObjectIds.at(-1);
    const _0x3610a9 = _0x52e952?.objects?.find(_0x35375e => _0x35375e.id === _0x55c51b);
    const _0x259aff = _0x286348.assetLibraryOpen ? "assets" : this.rightSidebarMode === "object" && _0x3610a9 ? "object" : ["ai", "perspective"].includes(this.rightSidebarMode) ? this.rightSidebarMode : null;
    this.rightSidebarMode = _0x259aff;
    const _0xcacd22 = this.window?.innerWidth || 1440;
    const _0x486f08 = normalizeStoryboard3DRightSidebarWidth(this.rightSidebarWidth, _0xcacd22, _0x259aff);
    const _0x15f1bc = preserveAssetLibrary && _0x259aff === "assets" ? this.root.querySelector(".storyboard-3d-right-sidebar") : null;
    const _0xb9b57 = _0x15f1bc?.contains?.(this.document?.activeElement) ? this.document.activeElement : null;
    _0x15f1bc?.remove?.();
    const _0x2280de = this.viewportControls?.getSnapshot?.().viewMode || "perspective";
    const _0x35807f = this.shotTimelineController?.isDrawerOpen?.() === true;
    const _0x4a4511 = this.root.getBoundingClientRect?.().height || this.window?.innerHeight || 900;
    const _0x595982 = normalizeStoryboard3DTimelineHeight(this.timelineHeight, _0x4a4511);
    this.timelineHeight = _0x595982;
    const _0xf00f2a = this._getMiniMapCamera(_0x2dae2d);
    const _0x87d78c = summarizeStoryboard3DProject(_0x510006);
    const _0x5e0a49 = this._resolveMiniMapWorldBounds(_0x52e952, _0x2dae2d, this._miniMapFootprints);
    const _0x3a0015 = _0x286348.assetLibraryOpen ? this.assetLibrary.list({
      query: this.assetQuery,
      category: this.assetCategory === "favorite" ? "all" : this.assetCategory,
      limit: 1600
    }).filter(_0x42a64a => this.assetCategory !== "favorite" || this.favoriteAssetIds.has(_0x42a64a.id)) : [];
    const _0xb34e78 = _0x3a0015.slice(0, this.assetVisibleLimit).map(_0x6cf66b => ({
      ..._0x6cf66b,
      thumbnailUrl: _0x6cf66b.thumbnailUrl || storyboard3DAssetThumbnailCache.get(_0x6cf66b)
    }));
    const _0x56ea1a = this.sceneRuntime ? this.root.querySelector("[data-storyboard-3d-runtime-host]") : null;
    _0x56ea1a?.remove?.();
    if (!_0x56ea1a) {
      this._disposeSceneRuntime();
    }
    this.root.innerHTML = "<div class=\"storyboard-3d-editor-shell " + (_0x259aff ? "is-right-sidebar-open" : "") + "\">\n      <header class=\"storyboard-3d-editor-topbar\">\n        <div class=\"storyboard-3d-editor-identity\">\n          <span class=\"storyboard-3d-editor-mark\" aria-hidden=\"true\">3D</span>\n          <label>\n            <span>" + escapeHtml(t("storyboard3d.editor.projectName")) + "</span>\n            <input type=\"text\" value=\"" + escapeHtml(_0x510006.name) + "\" maxlength=\"120\" data-storyboard-3d-project-name aria-label=\"" + escapeHtml(t("storyboard3d.editor.projectName")) + "\">\n          </label>\n          <span class=\"storyboard-3d-save-status\" data-storyboard-3d-save-status data-status=\"" + escapeHtml(this.projectStore.getSaveStatus()) + "\">" + escapeHtml(getSaveStatusLabel(this.projectStore.getSaveStatus())) + "</span>\n        </div>\n        <nav class=\"storyboard-3d-mode-switcher\" aria-label=\"" + escapeHtml(t("storyboard3d.editor.modeAria")) + "\">\n          <button type=\"button\" class=\"is-active\" aria-pressed=\"true\">" + escapeHtml(t("storyboard3d.editor.editMode")) + "</button>\n          <button type=\"button\" data-storyboard-3d-action=\"open-explore\">" + escapeHtml(t("storyboard3d.editor.exploreMode")) + "</button>\n        </nav>\n        <div class=\"storyboard-3d-topbar-actions\">\n          <button type=\"button\" class=\"storyboard-3d-asset-library-trigger " + (_0x259aff === "assets" ? "is-active" : "") + "\" data-storyboard-3d-action=\"open-asset-library\" aria-controls=\"storyboard3DRightSidebar\" aria-expanded=\"" + (_0x259aff === "assets") + "\"><span aria-hidden=\"true\">◇</span>模型库</button>\n          " + renderNavigationSettings(this.navigationSettings, {
      open: _0x47bf52,
      viewportSettings: this.viewportSettings
    }) + "\n          <button type=\"button\" class=\"storyboard-3d-ai-sidebar-trigger " + (_0x259aff === "ai" ? "is-active" : "") + "\" data-storyboard-3d-action=\"toggle-ai-sidebar\" aria-controls=\"storyboard3DRightSidebar\" aria-expanded=\"" + (_0x259aff === "ai") + "\"><span aria-hidden=\"true\">✦</span>AI 助手</button>\n          <button type=\"button\" data-storyboard-3d-action=\"undo\" title=\"Ctrl+Z\">撤销</button>\n          <button type=\"button\" data-storyboard-3d-action=\"redo\" title=\"Ctrl+Shift+Z\">重做</button>\n          <button type=\"button\" class=\"storyboard-3d-export-trigger\" data-storyboard-3d-action=\"export-storyboard\">导出分镜</button>\n        </div>\n      </header>\n\n      <div class=\"storyboard-3d-editor-main\" style=\"--storyboard-3d-right-sidebar-width:" + _0x486f08 + "px\">\n        <main class=\"storyboard-3d-viewport-column " + (_0x35807f ? "is-timeline-open" : "is-timeline-collapsed") + "\" style=\"--storyboard-3d-timeline-height:" + _0x595982 + "px\">\n          <section class=\"storyboard-3d-viewport\" tabindex=\"0\" aria-label=\"" + escapeHtml(t("storyboard3d.editor.viewport")) + "\">\n            <div class=\"storyboard-3d-tool-rail\" role=\"toolbar\" aria-label=\"" + escapeHtml(t("storyboard3d.editor.tools")) + "\">\n              " + renderStoryboard3DIconButton({
      action: "add-light",
      icon: "light",
      label: "添加灯光"
    }) + "\n              " + renderStoryboard3DIconButton({
      action: "open-background-perspective",
      icon: "background",
      label: "图像透视匹配",
      active: _0x259aff === "perspective",
      className: "storyboard-3d-background-match-trigger"
    }) + "\n            </div>\n            <div class=\"storyboard-3d-view-controls\" role=\"toolbar\" aria-label=\"视图控制\">\n              " + renderStoryboard3DIconButton({
      action: "set-viewport-view",
      icon: "perspective",
      label: "透视视图",
      active: _0x2280de === "perspective",
      dataView: "perspective"
    }) + "\n              " + renderStoryboard3DIconButton({
      action: "set-viewport-view",
      icon: "top",
      label: "顶视图",
      active: _0x2280de === "top",
      dataView: "top"
    }) + "\n              " + renderStoryboard3DIconButton({
      action: "set-viewport-view",
      icon: "front",
      label: "前视图",
      active: _0x2280de === "front",
      dataView: "front"
    }) + "\n              " + renderStoryboard3DIconButton({
      action: "set-viewport-view",
      icon: "right",
      label: "右视图",
      active: _0x2280de === "right",
      dataView: "right"
    }) + "\n            </div>\n            <details class=\"storyboard-3d-object-popover\" " + (_0x286348.objectOutlineOpen ? "open" : "") + ">\n              <summary data-storyboard-3d-action=\"toggle-object-outline\"><span>对象</span><small>" + _0x87d78c.objectCount + "</small></summary>\n              <div class=\"storyboard-3d-object-outline\">\n                <div class=\"storyboard-3d-object-popover-heading\">\n                  <span>" + escapeHtml(_0x52e952?.name || "当前场景") + "</span>\n                  <button type=\"button\" data-storyboard-3d-action=\"group-selected\" title=\"将当前选中对象创建为分组\">分组</button>\n                </div>\n                <div class=\"storyboard-3d-outline-filters\"><input type=\"search\" value=\"" + escapeHtml(this.outlineQuery) + "\" placeholder=\"搜索对象\" data-storyboard-3d-outline-query><select data-storyboard-3d-outline-type>" + ["all", "camera", "character", "prop", "light", "group"].map(_0x25dd9e => "<option value=\"" + _0x25dd9e + "\" " + (_0x25dd9e === this.outlineType ? "selected" : "") + ">" + (_0x25dd9e === "all" ? "全部类型" : _0x25dd9e) + "</option>").join("") + "</select></div>\n                <div class=\"storyboard-3d-outline-list\">" + renderObjectOutline(_0x52e952, _0x286348.selectedObjectIds, {
      query: this.outlineQuery,
      type: this.outlineType
    }) + "</div>\n              </div>\n            </details>\n            <div class=\"storyboard-3d-viewport-stage\">\n              <div class=\"storyboard-3d-runtime-host\" data-storyboard-3d-runtime-host></div>\n              " + renderBackgroundCalibrationGuide(_0x52e952?.background) + "\n              <div class=\"storyboard-3d-runtime-status\" data-storyboard-3d-runtime-status hidden></div>\n            </div>\n            <div class=\"storyboard-3d-viewport-toolbar\" role=\"toolbar\" aria-label=\"常用 3D 工具\">\n              " + renderStoryboard3DToolButton("select", _0x286348.activeTool === "select", this.navigationSettings.preset) + "\n              " + renderStoryboard3DToolButton("move", _0x286348.activeTool === "move", this.navigationSettings.preset) + "\n              " + renderStoryboard3DIconButton({
      action: "toggle-fly-mode",
      icon: "fly",
      label: "飞行模式",
      shortcut: "Shift+F",
      active: _0x286348.flyMode,
      className: "storyboard-3d-fly-mode-button"
    }) + "\n              " + renderStoryboard3DIconButton({
      action: "focus-selection",
      icon: "focus",
      label: "聚焦选中",
      shortcut: "F",
      disabled: _0x286348.selectedObjectIds.length === 0
    }) + "\n              " + renderStoryboard3DIconButton({
      action: "add-shot",
      icon: "camera",
      label: t("storyboard3d.editor.addShot"),
      title: t("storyboard3d.editor.addShotDescription"),
      className: "storyboard-3d-add-shot-control"
    }) + "\n              <span class=\"storyboard-3d-view-controls-separator\" aria-hidden=\"true\"></span>\n              " + renderStoryboard3DToolButton("rotate", _0x286348.activeTool === "rotate", this.navigationSettings.preset) + "\n              " + renderStoryboard3DToolButton("scale", _0x286348.activeTool === "scale", this.navigationSettings.preset) + "\n              <span class=\"storyboard-3d-view-controls-separator\" aria-hidden=\"true\"></span>\n              " + renderStoryboard3DViewportSettingButton({
      field: "transformSpace",
      icon: "transformSpace",
      label: this.viewportSettings.transformSpace === "local" ? "本地坐标" : "世界坐标",
      active: this.viewportSettings.transformSpace === "local",
      hidden: _0x286348.activeTool === "scale"
    }) + "\n              " + renderStoryboard3DViewportSettingButton({
      field: "snapEnabled",
      icon: "snap",
      label: "启用步进吸附",
      active: this.viewportSettings.snapEnabled
    }) + "\n              " + renderStoryboard3DViewportSettingButton({
      field: "groundLock",
      icon: "ground",
      label: "地面吸附",
      active: this.viewportSettings.groundLock,
      hidden: !STORYBOARD_3D_SELECT_MOVE_TOOLS.has(_0x286348.activeTool)
    }) + "\n              " + renderStoryboard3DViewportSettingButton({
      field: "uniformScale",
      icon: "uniform",
      label: "均匀缩放",
      active: this.viewportSettings.uniformScale,
      hidden: _0x286348.activeTool !== "scale"
    }) + "\n            </div>\n            " + renderStoryboard3DIconButton({
      action: "fit-all",
      icon: "fit",
      label: "适配全部",
      shortcut: "Home",
      className: "storyboard-3d-fit-all-control"
    }) + "\n            " + renderStoryboard3DFocalControl(_0x52e952, this.viewportFocalLength) + "\n            <div class=\"storyboard-3d-viewport-hud\">\n              <span class=\"storyboard-3d-navigation-status " + (_0x286348.flyMode ? "is-fly-mode" : "") + "\">" + escapeHtml(getStoryboard3DNavigationHelpText({
      flyMode: _0x286348.flyMode,
      preset: this.navigationSettings.preset
    })) + "</span>\n              <span>" + escapeHtml(_0x2dae2d?.shotSize || "MED") + "</span>\n              <span>" + escapeHtml(_0x2dae2d?.shotAngle || "eye") + "</span>\n              <strong>" + escapeHtml(formatFocalLength(this.viewportFocalLength) + "mm") + "</strong>\n            </div>\n            <div class=\"storyboard-3d-mini-map-placeholder " + (this.miniMapExpanded ? "is-expanded" : "") + "\" style=\"--mini-map-window-x:" + this.miniMapWindowOffset.x + "px;--mini-map-window-y:" + this.miniMapWindowOffset.y + "px\">" + renderMiniMap(_0x52e952, _0x2dae2d, {
      expanded: this.miniMapExpanded,
      zoom: this.miniMapZoom,
      footprints: this._miniMapFootprints,
      worldBounds: _0x5e0a49,
      camera: _0xf00f2a
    }) + "</div>\n          </section>\n          <section class=\"storyboard-3d-shot-dock " + (_0x35807f ? "is-timeline-open" : "is-timeline-collapsed") + "\" aria-label=\"" + escapeHtml(t("storyboard3d.editor.shots")) + "\">\n            <div class=\"storyboard-3d-shot-strip\">" + renderShotStrip(_0x52e952, {
      timelineOpen: _0x35807f
    }) + "</div>\n            " + renderShotTimelineDrawerHandle(_0x35807f, _0x595982) + "\n            <div class=\"storyboard-3d-timeline-drawer-content\" aria-hidden=\"" + !_0x35807f + "\" " + (_0x35807f ? "" : "inert") + ">\n              " + (this.shotTimelineController?.render?.() || "") + "\n            </div>\n          </section>\n        </main>\n        " + (_0x286348.assetLibraryOpen && !_0x15f1bc ? renderAssetLibraryRightSidebar({
      assets: _0xb34e78,
      totalCount: _0x3a0015.length,
      hasMore: _0x3a0015.length > _0xb34e78.length,
      query: this.assetQuery,
      category: this.assetCategory,
      favoriteIds: this.favoriteAssetIds,
      importState: this.modelImportState,
      sidebarWidth: _0x486f08,
      layoutWidth: _0xcacd22
    }) : "") + "\n        " + (_0x259aff === "object" ? renderObjectPropertiesRightSidebar({
      object: _0x3610a9,
      selectedBoneName: this.characterBoneSelection.get(_0x3610a9?.id) || "Head",
      characterPoseState: _0x3610a9?.type === "character" ? reconcileCharacterPoseState(_0x3610a9, this.characterImagePoseController.getSnapshot(_0x3610a9.id)) : null,
      assetDescriptor: _0x3610a9?.type === "prop" ? this.assetLibrary.find(_0x3610a9.assetId) : null,
      sceneGroups: _0x52e952?.objects?.filter(_0x42a29f => _0x42a29f.type === "group") || []
    }, {
      sidebarWidth: _0x486f08,
      layoutWidth: _0xcacd22
    }) : "") + "\n        " + (_0x259aff === "perspective" ? renderBackgroundPerspectiveRightSidebar({
      scene: _0x52e952,
      activeShot: _0x2dae2d
    }, {
      sidebarWidth: _0x486f08,
      layoutWidth: _0xcacd22
    }) : "") + "\n        " + (_0x259aff === "ai" ? renderAIAssistantRightSidebar({
      ...this.aiState,
      modelId: this.aiModelId,
      provider: this.aiProvider,
      canUndoAI: this.commandHistory.getSnapshot().nextUndoLabel === "AI scene transaction"
    }, {
      sidebarWidth: _0x486f08,
      layoutWidth: _0xcacd22
    }) : "") + "\n      </div>\n\n      " + (this.exploreOpen ? renderShotExplorePanel(this.shotCandidates, this.exploreFilter) : "") + "\n\n      <input type=\"file\" accept=\"" + STORYBOARD_3D_MODEL_ACCEPT + ",.bin,.png,.jpg,.jpeg,.webp,.ktx2\" data-storyboard-3d-model-input multiple hidden>\n      <input type=\"file\" accept=\"image/*\" data-storyboard-3d-background-input hidden>\n      <input type=\"file\" accept=\"image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp\" data-storyboard-3d-pose-image-input hidden>\n      <div class=\"storyboard-3d-editor-message\" data-storyboard-3d-message role=\"status\" aria-live=\"polite\" " + (this._message ? "" : "hidden") + ">" + escapeHtml(this._message) + "</div>\n    </div>";
    const _0x1e8934 = this.root.querySelector(".storyboard-3d-outline-list");
    if (_0x1e8934) {
      _0x1e8934.scrollTop = _0x4f3b0f;
    }
    const _0x433b12 = this.root.querySelector(".storyboard-3d-object-properties-content");
    if (_0x433b12 && _0x2fb726 && _0x2fb726 === _0x3610a9?.id) {
      _0x433b12.scrollTop = _0x23d207;
    }
    if (_0x15f1bc) {
      this.root.querySelector(".storyboard-3d-editor-main")?.append?.(_0x15f1bc);
      _0xb9b57?.focus?.({
        preventScroll: true
      });
    }
    const _0x33193c = this.root.querySelector("[data-storyboard-3d-runtime-host]");
    if (_0x56ea1a && _0x33193c && this.sceneRuntime) {
      _0x33193c.replaceWith(_0x56ea1a);
      try {
        this.sceneRuntime.sync({
          project: _0x510006,
          sceneId: _0x510006.activeSceneId,
          selectedObjectIds: _0x286348.selectedObjectIds,
          activeTool: _0x286348.activeTool
        });
        if (this.viewportControls) {
          const _0x1c0f0f = this.sceneRuntime.getSceneView();
          this.viewportControls.sceneView = _0x1c0f0f;
          if (this.viewportControls.viewMode === "perspective") {
            this.viewportControls.perspectiveSceneView = structuredClone(_0x1c0f0f);
          }
        }
        this._restoreViewportFocalLength();
        const _0x1a2a28 = _0x56ea1a.getBoundingClientRect?.();
        this.sceneRuntime.resize(_0x1a2a28?.width, _0x1a2a28?.height);
      } catch (_0x8805e8) {
        this._runtimeError = _0x8805e8?.message || String(_0x8805e8);
        this._disposeSceneRuntime();
      }
    }
    this._syncResponsiveState();
    this._syncHistoryButtons();
    if (!this.sceneRuntime && !this._runtimeError) {
      this._mountSceneRuntime(_0x510006, _0x286348);
    }
    if (this._runtimeError) {
      this._showRuntimeFailure(this._runtimeFailureTitle || "3D 视口不可用", this._runtimeError);
    }
    if (this.exploreOpen && this.shotCandidates.length > 0) {
      this._renderShotCandidatePreviews(_0x510006, _0x286348);
    }
    this._bindAIAssistantModelSelector();
    this._observeVisibleAssetThumbnails();
    this.shotTimelineController?.syncPreview?.();
  }
  _syncSaveStatus(_0x42278e = this.projectStore.getSaveStatus()) {
    const _0x2aa26b = this.root?.querySelector?.("[data-storyboard-3d-save-status]");
    if (!_0x2aa26b) {
      return;
    }
    _0x2aa26b.dataset.status = _0x42278e;
    _0x2aa26b.textContent = getSaveStatusLabel(_0x42278e);
  }
  _syncResponsiveState() {
    const _0x19f422 = this.root?.querySelector?.(".storyboard-3d-editor-shell");
    if (!_0x19f422) {
      return;
    }
    _0x19f422.classList.remove("is-inspector-open");
  }
  _applyInspectorWidth(_0x567d4f, _0x4096ad = null) {
    const _0x4403d8 = _0x4096ad || this.root?.querySelector?.(".storyboard-3d-editor-main");
    const _0x44eaea = _0x4403d8?.getBoundingClientRect?.().width || this.window?.innerWidth || 1200;
    this.inspectorWidth = normalizeStoryboard3DInspectorWidth(_0x567d4f, _0x44eaea);
    _0x4403d8?.style?.setProperty?.("--storyboard-3d-inspector-width", this.inspectorWidth + "px");
    _0x4403d8?.querySelector?.("[data-storyboard-3d-inspector-splitter]")?.setAttribute?.("aria-valuenow", String(this.inspectorWidth));
    return this.inspectorWidth;
  }
  _handleInspectorResizePointerDown(_0x29efcb) {
    const _0x1a4dc3 = _0x29efcb.target?.closest?.("[data-storyboard-3d-inspector-splitter]");
    if (!_0x1a4dc3 || _0x29efcb.isPrimary === false || Number.isFinite(_0x29efcb.button) && _0x29efcb.button !== 0) {
      return;
    }
    const _0x5df089 = _0x1a4dc3.closest?.(".storyboard-3d-editor-main");
    const _0x18c39b = _0x5df089?.getBoundingClientRect?.();
    if (!_0x18c39b?.width || _0x18c39b.width < 900) {
      return;
    }
    _0x29efcb.preventDefault?.();
    _0x29efcb.stopImmediatePropagation?.();
    const _0x466eea = _0x29efcb.pointerId;
    try {
      _0x1a4dc3.setPointerCapture?.(_0x466eea);
    } catch {}
    this._inspectorResize = {
      pointerId: _0x466eea,
      splitter: _0x1a4dc3,
      layout: _0x5df089,
      bounds: _0x18c39b
    };
    this.document?.body?.classList?.add?.("storyboard-3d-inspector-resizing");
    this._applyInspectorWidth(_0x18c39b.right - Number(_0x29efcb.clientX), _0x5df089);
    this.window?.addEventListener?.("pointermove", this._handleInspectorResizePointerMove, true);
    this.window?.addEventListener?.("pointerup", this._handleInspectorResizePointerUp, true);
    this.window?.addEventListener?.("pointercancel", this._handleInspectorResizePointerUp, true);
  }
  _handleInspectorResizePointerMove(_0x2cecb1) {
    const _0x5e5bbf = this._inspectorResize;
    if (!_0x5e5bbf || _0x5e5bbf.pointerId != null && _0x2cecb1.pointerId !== _0x5e5bbf.pointerId) {
      return;
    }
    _0x2cecb1.preventDefault?.();
    _0x2cecb1.stopImmediatePropagation?.();
    this._applyInspectorWidth(_0x5e5bbf.bounds.right - Number(_0x2cecb1.clientX), _0x5e5bbf.layout);
  }
  _handleInspectorResizePointerUp(_0x548ac5) {
    const _0x5bbe6f = this._inspectorResize;
    if (!_0x5bbe6f || _0x5bbe6f.pointerId != null && _0x548ac5?.pointerId !== _0x5bbe6f.pointerId) {
      return;
    }
    _0x548ac5?.preventDefault?.();
    _0x548ac5?.stopImmediatePropagation?.();
    this._inspectorResize = null;
    this.document?.body?.classList?.remove?.("storyboard-3d-inspector-resizing");
    try {
      if (_0x5bbe6f.splitter.hasPointerCapture?.(_0x5bbe6f.pointerId)) {
        _0x5bbe6f.splitter.releasePointerCapture?.(_0x5bbe6f.pointerId);
      }
    } catch {}
    this.window?.removeEventListener?.("pointermove", this._handleInspectorResizePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleInspectorResizePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleInspectorResizePointerUp, true);
  }
  _applyRightSidebarWidth(_0x1157a1, _0x2e8311 = null) {
    const _0x33d54a = _0x2e8311 || this.root?.querySelector?.(".storyboard-3d-editor-main");
    const _0x57e048 = _0x33d54a?.getBoundingClientRect?.().width || this.window?.innerWidth || 1440;
    this.rightSidebarWidth = normalizeStoryboard3DRightSidebarWidth(_0x1157a1, _0x57e048);
    _0x33d54a?.style?.setProperty?.("--storyboard-3d-right-sidebar-width", this.rightSidebarWidth + "px");
    _0x33d54a?.querySelector?.("[data-storyboard-3d-right-sidebar-splitter]")?.setAttribute?.("aria-valuenow", String(this.rightSidebarWidth));
    return this.rightSidebarWidth;
  }
  _handleRightSidebarResizePointerDown(_0x1bcf47) {
    const _0x11262b = _0x1bcf47.target?.closest?.("[data-storyboard-3d-right-sidebar-splitter]");
    if (!_0x11262b || _0x1bcf47.isPrimary === false || Number.isFinite(_0x1bcf47.button) && _0x1bcf47.button !== 0) {
      return;
    }
    const _0x2c17df = _0x11262b.closest?.(".storyboard-3d-right-sidebar");
    const _0x32a598 = _0x2c17df?.closest?.(".storyboard-3d-editor-main");
    const _0x782562 = _0x2c17df?.getBoundingClientRect?.();
    if (!_0x782562?.width || !_0x32a598) {
      return;
    }
    _0x1bcf47.preventDefault?.();
    _0x1bcf47.stopImmediatePropagation?.();
    const _0x3cdfa6 = _0x1bcf47.pointerId;
    try {
      _0x11262b.setPointerCapture?.(_0x3cdfa6);
    } catch {}
    this._rightSidebarResize = {
      pointerId: _0x3cdfa6,
      splitter: _0x11262b,
      layout: _0x32a598,
      right: _0x782562.right
    };
    this.document?.body?.classList?.add?.("storyboard-3d-right-sidebar-resizing");
    this._applyRightSidebarWidth(_0x782562.right - Number(_0x1bcf47.clientX), _0x32a598);
    this.window?.addEventListener?.("pointermove", this._handleRightSidebarResizePointerMove, true);
    this.window?.addEventListener?.("pointerup", this._handleRightSidebarResizePointerUp, true);
    this.window?.addEventListener?.("pointercancel", this._handleRightSidebarResizePointerUp, true);
  }
  _handleRightSidebarResizePointerMove(_0x2a3f5d) {
    const _0x5da65b = this._rightSidebarResize;
    if (!_0x5da65b || _0x5da65b.pointerId != null && _0x2a3f5d.pointerId !== _0x5da65b.pointerId) {
      return;
    }
    _0x2a3f5d.preventDefault?.();
    _0x2a3f5d.stopImmediatePropagation?.();
    this._applyRightSidebarWidth(_0x5da65b.right - Number(_0x2a3f5d.clientX), _0x5da65b.layout);
  }
  _handleRightSidebarResizePointerUp(_0x3858c3) {
    const _0x3c98cc = this._rightSidebarResize;
    if (!_0x3c98cc || _0x3c98cc.pointerId != null && _0x3858c3?.pointerId !== _0x3c98cc.pointerId) {
      return;
    }
    _0x3858c3?.preventDefault?.();
    _0x3858c3?.stopImmediatePropagation?.();
    this._rightSidebarResize = null;
    this.document?.body?.classList?.remove?.("storyboard-3d-right-sidebar-resizing");
    try {
      if (_0x3c98cc.splitter.hasPointerCapture?.(_0x3c98cc.pointerId)) {
        _0x3c98cc.splitter.releasePointerCapture?.(_0x3c98cc.pointerId);
      }
    } catch {}
    this.window?.removeEventListener?.("pointermove", this._handleRightSidebarResizePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleRightSidebarResizePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleRightSidebarResizePointerUp, true);
  }
  _applyTimelineHeight(_0x505720, _0x15c717 = null) {
    const _0x455dee = _0x15c717 || this.root?.querySelector?.(".storyboard-3d-viewport-column");
    const _0x2de331 = _0x455dee?.getBoundingClientRect?.().height || this.root?.getBoundingClientRect?.().height || this.window?.innerHeight || 900;
    this.timelineHeight = normalizeStoryboard3DTimelineHeight(_0x505720, _0x2de331);
    _0x455dee?.style?.setProperty?.("--storyboard-3d-timeline-height", this.timelineHeight + "px");
    _0x455dee?.querySelector?.("[data-storyboard-3d-timeline-resize-handle]")?.setAttribute?.("aria-valuenow", String(this.timelineHeight));
    return this.timelineHeight;
  }
  _handleTimelineResizePointerDown(_0x467979) {
    const _0x4c3dbd = _0x467979.target?.closest?.("[data-storyboard-3d-timeline-resize-handle]");
    if (!_0x4c3dbd || _0x467979.isPrimary === false || Number.isFinite(_0x467979.button) && _0x467979.button !== 0) {
      return;
    }
    const _0x156e89 = _0x4c3dbd.closest?.(".storyboard-3d-viewport-column");
    const _0x6a9d65 = _0x156e89?.getBoundingClientRect?.();
    const _0x4ab475 = _0x4c3dbd.closest?.(".storyboard-3d-shot-dock")?.getBoundingClientRect?.().height;
    if (!_0x6a9d65?.height) {
      return;
    }
    const _0x4620fc = _0x467979.pointerId;
    try {
      _0x4c3dbd.setPointerCapture?.(_0x4620fc);
    } catch {}
    this._timelineResize = {
      pointerId: _0x4620fc,
      handle: _0x4c3dbd,
      column: _0x156e89,
      startHeight: Number(_0x4ab475) || this.timelineHeight,
      startY: Number(_0x467979.clientY),
      moved: false
    };
    this.window?.addEventListener?.("pointermove", this._handleTimelineResizePointerMove, true);
    this.window?.addEventListener?.("pointerup", this._handleTimelineResizePointerUp, true);
    this.window?.addEventListener?.("pointercancel", this._handleTimelineResizePointerUp, true);
  }
  _handleTimelineResizePointerMove(_0x1fbc59) {
    const _0x5a7ab8 = this._timelineResize;
    if (!_0x5a7ab8 || _0x5a7ab8.pointerId != null && _0x1fbc59.pointerId !== _0x5a7ab8.pointerId) {
      return;
    }
    const _0x556f8f = Number(_0x1fbc59.clientY);
    if (!Number.isFinite(_0x556f8f)) {
      return;
    }
    if (!_0x5a7ab8.moved && Math.abs(_0x556f8f - _0x5a7ab8.startY) < 4) {
      return;
    }
    _0x1fbc59.preventDefault?.();
    _0x1fbc59.stopImmediatePropagation?.();
    if (!_0x5a7ab8.moved) {
      _0x5a7ab8.moved = true;
      this._suppressTimelineToggleClick = true;
      this.shotTimelineController?.setDrawerOpen?.(true);
      this.document?.body?.classList?.add?.("storyboard-3d-timeline-resizing");
    }
    this._applyTimelineHeight(_0x5a7ab8.startHeight + _0x5a7ab8.startY - _0x556f8f, _0x5a7ab8.column);
  }
  _handleTimelineResizePointerUp(_0x208db8) {
    const _0xab41f9 = this._timelineResize;
    if (!_0xab41f9 || _0xab41f9.pointerId != null && _0x208db8?.pointerId !== _0xab41f9.pointerId) {
      return;
    }
    if (_0xab41f9.moved) {
      _0x208db8?.preventDefault?.();
      _0x208db8?.stopImmediatePropagation?.();
    }
    this._timelineResize = null;
    this.document?.body?.classList?.remove?.("storyboard-3d-timeline-resizing");
    try {
      if (_0xab41f9.handle.hasPointerCapture?.(_0xab41f9.pointerId)) {
        _0xab41f9.handle.releasePointerCapture?.(_0xab41f9.pointerId);
      }
    } catch {}
    this.window?.removeEventListener?.("pointermove", this._handleTimelineResizePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleTimelineResizePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleTimelineResizePointerUp, true);
    if (_0xab41f9.moved) {
      const _0x991551 = () => {
        this._suppressTimelineToggleClick = false;
      };
      if (typeof this.window?.setTimeout === "function") {
        this.window.setTimeout(_0x991551, 0);
      } else {
        globalThis.setTimeout?.(_0x991551, 0);
      }
    }
  }
  _openAssetLibrary() {
    this.assetVisibleLimit = Math.max(32, this.assetVisibleLimit);
    this.rightSidebarMode = "assets";
    this.editorStore.setAssetLibraryOpen(true);
    this._render();
    this.root?.querySelector?.("[data-storyboard-3d-asset-query]")?.focus?.();
  }
  _openBackgroundPerspective() {
    this.rightSidebarMode = "perspective";
    this.editorStore.setAssetLibraryOpen(false);
    this._assetThumbnailObserver?.disconnect?.();
    this._assetThumbnailObserver = null;
    this._render();
  }
  _setSelectedObjects(_0x2fabed, {
    openProperties = true
  } = {}) {
    const _0x575a2c = this.editorStore.setSelectedObjects(_0x2fabed);
    if (openProperties && _0x575a2c.selectedObjectIds.length > 0) {
      this.rightSidebarMode = "object";
      if (_0x575a2c.assetLibraryOpen) {
        this.editorStore.setAssetLibraryOpen(false);
      }
      this._assetThumbnailObserver?.disconnect?.();
      this._assetThumbnailObserver = null;
    } else if (_0x575a2c.selectedObjectIds.length === 0 && this.rightSidebarMode === "object") {
      this.rightSidebarMode = Number(this.window?.innerWidth) <= 900 ? null : "ai";
    }
    return _0x575a2c.selectedObjectIds;
  }
  _toggleAIAssistant() {
    const _0x275275 = this.rightSidebarMode !== "ai";
    this.rightSidebarMode = _0x275275 ? "ai" : null;
    this.editorStore.setAssetLibraryOpen(false);
    this._assetThumbnailObserver?.disconnect?.();
    this._assetThumbnailObserver = null;
    this._render();
    if (_0x275275) {
      this.root?.querySelector?.("[data-storyboard-3d-ai-instruction]")?.focus?.();
    }
  }
  _setMessage(_0x5c673c) {
    this._message = String(_0x5c673c || "");
    const _0x5c4be6 = this.root?.querySelector?.("[data-storyboard-3d-message]");
    if (!_0x5c4be6) {
      return;
    }
    _0x5c4be6.textContent = this._message;
    _0x5c4be6.hidden = !this._message;
  }
  async _runAICommand() {
    const _0x2f02dd = this.root?.querySelector?.("[data-storyboard-3d-ai-instruction]");
    const _0x18ff3e = String(_0x2f02dd?.value || this.aiState.instruction || "").trim();
    if (!_0x18ff3e) {
      this._setMessage("请先输入要执行的 3D 场景指令。");
      return;
    }
    try {
      await this._requireInstalledModelPack();
    } catch (_0x261ba1) {
      this._setMessage(_0x261ba1?.message || String(_0x261ba1));
      return;
    }
    this.aiController.setInstruction(_0x18ff3e);
    try {
      const _0x52f2bb = await this.aiController.submit({
        instruction: _0x18ff3e
      });
      if (_0x52f2bb) {
        this._setMessage(_0x52f2bb.plan?.summary || "AI 场景指令已执行。");
        const _0x4ee33a = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
        if (_0x4ee33a) {
          this._generateMissingShotThumbnails(_0x4ee33a.id);
        }
      }
    } catch {}
  }
  _persistProject(_0x2a0c2a, _0x27542d = {}) {
    const _0x1b4a22 = this.onProjectChange?.(_0x2a0c2a, _0x27542d);
    dispatchWorkspaceEvent(this.window, "storyboard-3d:project-changed", {
      projectId: _0x2a0c2a.id,
      updatedAt: _0x2a0c2a.updatedAt,
      reason: _0x27542d.reason
    });
    if (_0x27542d.reason === "select-shot") {
      const _0x3f4dd1 = getActiveStoryboard3DScene(_0x2a0c2a);
      dispatchWorkspaceEvent(this.window, "storyboard-3d:shot-selected", {
        projectId: this.projectId,
        sceneId: _0x3f4dd1?.id || "",
        shotId: _0x3f4dd1?.activeShotId || ""
      });
    }
    return _0x1b4a22;
  }
  _getFlyMovementKey(_0x4835b9) {
    return {
      KeyW: "forward",
      KeyS: "backward",
      KeyA: "left",
      KeyD: "right",
      KeyQ: "down",
      KeyE: "up"
    }[_0x4835b9] || "";
  }
  _scheduleFlyMovement() {
    if (this._flyFrame != null || this._flyKeys.size === 0) {
      return;
    }
    const _0x161348 = this.window?.requestAnimationFrame?.bind(this.window) || globalThis.requestAnimationFrame?.bind(globalThis);
    if (!_0x161348) {
      return;
    }
    this._flyLastTime = this._flyLastTime || this.window?.performance?.now?.() || Date.now();
    this._flyFrame = _0x161348(_0x10c66c => {
      this._flyFrame = null;
      if (!this.editorStore.getSnapshot().flyMode || !this.sceneRuntime || this._flyKeys.size === 0) {
        return;
      }
      const _0x384c61 = Number(_0x10c66c) || this.window?.performance?.now?.() || Date.now();
      const _0x4e8f49 = Math.max(0, Math.min(0.1, (_0x384c61 - this._flyLastTime) / 1000));
      this._flyLastTime = _0x384c61;
      const _0x148657 = this._flySceneView || this.sceneRuntime.getSceneView?.();
      if (!_0x148657) {
        return;
      }
      const _0x416dd8 = applySceneFlyMovement(_0x148657, {
        forward: (this._flyKeys.has("forward") ? 1 : 0) - (this._flyKeys.has("backward") ? 1 : 0),
        right: (this._flyKeys.has("right") ? 1 : 0) - (this._flyKeys.has("left") ? 1 : 0),
        vertical: (this._flyKeys.has("up") ? 1 : 0) - (this._flyKeys.has("down") ? 1 : 0),
        boost: this._flyBoost
      }, _0x4e8f49, {
        speed: 4,
        boostMultiplier: 4
      });
      this._flySceneView = {
        ..._0x148657,
        ..._0x416dd8
      };
      if (this._cameraDrag?.mode === "fly-look") {
        this._cameraDrag.latestSceneView = this._flySceneView;
      }
      this.sceneRuntime.previewSceneView?.(this._flySceneView);
      this._miniMapPreviewSceneView = structuredClone(this._flySceneView);
      this._scheduleMiniMapRefresh();
      if (this.viewportControls) {
        this.viewportControls.sceneView = structuredClone(this._flySceneView);
        this.viewportControls.perspectiveSceneView = structuredClone(this._flySceneView);
      }
      this._scheduleFlyMovement();
    });
  }
  _stopFlyMovementFrame() {
    const _0x151814 = this.window?.cancelAnimationFrame?.bind(this.window) || globalThis.cancelAnimationFrame?.bind(globalThis);
    if (this._flyFrame != null) {
      _0x151814?.(this._flyFrame);
    }
    this._flyFrame = null;
    this._flyLastTime = 0;
  }
  _finishFlyMovement({
    clearKeys = false
  } = {}) {
    this._stopFlyMovementFrame();
    const _0xf2a180 = this._flySceneView;
    if (_0xf2a180) {
      this.sceneRuntime?.commitSceneView?.(_0xf2a180);
    }
    this._flySceneView = null;
    this._miniMapPreviewSceneView = null;
    this._scheduleMiniMapRefresh();
    if (clearKeys) {
      this._flyKeys.clear();
      this._flyBoost = false;
    }
    if (!this._closed && _0xf2a180 && this.shotTimelineController?.isAutoKeyEnabled?.()) {
      this.shotTimelineController.recordCameraKeyframe(this._readCurrentCameraState());
    }
  }
  _setFlyMode(_0x677fa) {
    const _0x1570ff = _0x677fa === true;
    if (!_0x1570ff) {
      this._finishFlyMovement({
        clearKeys: true
      });
    }
    if (_0x1570ff && this.viewportControls?.getSnapshot?.().viewMode !== "perspective") {
      this.viewportControls.showPerspectiveView?.();
    }
    this.editorStore.setFlyMode(_0x1570ff);
    this._render();
    this.root?.querySelector?.(".storyboard-3d-viewport")?.focus?.();
    this._setMessage(_0x1570ff ? "飞行模式已开启：WASD 移动，Q/E 升降，右键观察，Shift 加速。" : "飞行模式已关闭。");
  }
  _handleWindowKeyUp(_0x445ccf) {
    if (!this.root || !this.editorStore.getSnapshot().flyMode) {
      return;
    }
    const _0x3a13bb = this._getFlyMovementKey(_0x445ccf.code);
    const _0x4e6c05 = _0x445ccf.code === "ShiftLeft" || _0x445ccf.code === "ShiftRight";
    if (!_0x3a13bb && !_0x4e6c05) {
      return;
    }
    _0x445ccf.preventDefault?.();
    _0x445ccf.stopImmediatePropagation?.();
    if (_0x3a13bb) {
      this._flyKeys.delete(_0x3a13bb);
    }
    if (_0x4e6c05) {
      this._flyBoost = false;
    }
    if (this._flyKeys.size === 0) {
      if (this._cameraDrag?.mode === "fly-look") {
        this._stopFlyMovementFrame();
      } else {
        this._finishFlyMovement();
      }
    }
  }
  _handleWindowBlur() {
    this._finishFlyMovement({
      clearKeys: true
    });
    this._cancelRuntimeSelection();
    this._cancelRuntimeTransform();
    this.shotTimelineController?.stopPlayback?.({
      clear: true
    });
  }
  _toggleNavigationSettings() {
    const _0x3103fd = this.root?.querySelector?.(".storyboard-3d-global-settings");
    if (!_0x3103fd) {
      return false;
    }
    _0x3103fd.open = !_0x3103fd.open;
    return true;
  }
  _handleWindowKeyDown(_0x1d505e) {
    if (!this.root) {
      return;
    }
    if (this.exportController?.root) {
      return;
    }
    const _0x1e65c9 = _0x1d505e.target?.closest?.("[data-storyboard-3d-inspector-splitter]");
    if (_0x1e65c9 && ["ArrowLeft", "ArrowRight"].includes(_0x1d505e.key)) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      const _0x24ab32 = _0x1d505e.shiftKey ? 48 : 16;
      this._applyInspectorWidth(this.inspectorWidth + (_0x1d505e.key === "ArrowLeft" ? _0x24ab32 : -_0x24ab32), _0x1e65c9.closest?.(".storyboard-3d-editor-main"));
      return;
    }
    const _0x582638 = _0x1d505e.target?.closest?.("[data-storyboard-3d-right-sidebar-splitter]");
    if (_0x582638 && ["ArrowLeft", "ArrowRight"].includes(_0x1d505e.key)) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      const _0x3f47d5 = _0x1d505e.shiftKey ? 48 : 16;
      const _0x4ce84d = Number.isFinite(this.rightSidebarWidth) ? this.rightSidebarWidth : _0x582638.closest?.(".storyboard-3d-right-sidebar")?.getBoundingClientRect?.().width;
      this._applyRightSidebarWidth(_0x4ce84d + (_0x1d505e.key === "ArrowLeft" ? _0x3f47d5 : -_0x3f47d5), _0x582638.closest?.(".storyboard-3d-editor-main"));
      return;
    }
    const _0x448c84 = _0x1d505e.target?.closest?.("[data-storyboard-3d-timeline-resize-handle]");
    if (_0x448c84 && ["ArrowUp", "ArrowDown"].includes(_0x1d505e.key)) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      const _0x4a87ee = _0x1d505e.shiftKey ? 64 : 24;
      this.shotTimelineController?.setDrawerOpen?.(true);
      this._applyTimelineHeight(this.timelineHeight + (_0x1d505e.key === "ArrowUp" ? _0x4a87ee : -_0x4a87ee), _0x448c84.closest?.(".storyboard-3d-viewport-column"));
      return;
    }
    if (this.rightSidebarMode) {
      const _0x30ba95 = this.root.querySelector(".storyboard-3d-right-sidebar");
      if (_0x30ba95?.contains?.(_0x1d505e.target)) {
        if (trapStoryboard3DTabKey(_0x1d505e, _0x30ba95, this.document)) {
          return;
        }
        _0x1d505e.stopImmediatePropagation();
        return;
      }
    }
    if (trapStoryboard3DTabKey(_0x1d505e, this.root, this.document)) {
      return;
    }
    const _0x15253a = _0x1d505e.target?.matches?.("input, textarea, select, [contenteditable='true']");
    const _0x94bb8f = !_0x15253a && !_0x1d505e.altKey && !_0x1d505e.ctrlKey && !_0x1d505e.metaKey && !_0x1d505e.shiftKey && (_0x1d505e.code === "KeyK" || String(_0x1d505e.key || "").toLowerCase() === "k");
    if (_0x94bb8f) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      if (!_0x1d505e.repeat) {
        this._toggleNavigationSettings();
      }
      return;
    }
    const _0x2ccc48 = !_0x15253a && !_0x1d505e.altKey && !_0x1d505e.ctrlKey && !_0x1d505e.metaKey && !_0x1d505e.shiftKey && (_0x1d505e.code === "Space" || _0x1d505e.key === " ") && !_0x1d505e.target?.closest?.("button, a, [role='button']");
    if (_0x2ccc48) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      if (!_0x1d505e.repeat) {
        this.shotTimelineController?.togglePlayback?.();
      }
      return;
    }
    if (!_0x15253a && _0x1d505e.shiftKey && (_0x1d505e.code === "KeyF" || _0x1d505e.key.toLowerCase() === "f")) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      this._setFlyMode(!this.editorStore.getSnapshot().flyMode);
      return;
    }
    if (!_0x15253a && this.editorStore.getSnapshot().flyMode) {
      const _0x445810 = this._getFlyMovementKey(_0x1d505e.code);
      const _0xffccfd = _0x1d505e.code === "ShiftLeft" || _0x1d505e.code === "ShiftRight";
      if (_0x445810 || _0xffccfd) {
        _0x1d505e.preventDefault();
        _0x1d505e.stopImmediatePropagation();
        if (_0x445810) {
          this._flyKeys.add(_0x445810);
        }
        if (_0xffccfd || _0x1d505e.shiftKey) {
          this._flyBoost = true;
        }
        this._scheduleFlyMovement();
        return;
      }
    }
    if (!_0x15253a && (_0x1d505e.ctrlKey || _0x1d505e.metaKey) && _0x1d505e.key.toLowerCase() === "z") {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      if (this._cancelRuntimeSelection()) {
        return;
      }
      if (this._cancelRuntimeTransform()) {
        return;
      }
      if (_0x1d505e.shiftKey) {
        this.commandHistory.redo();
      } else {
        this.commandHistory.undo();
      }
      return;
    }
    if (_0x1d505e.key === "Escape") {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      if (this._cancelRuntimeSelection()) {
        return;
      }
      if (this._cancelRuntimeTransform()) {
        return;
      }
      if (this.editorStore.getSnapshot().flyMode) {
        this._setFlyMode(false);
        return;
      }
      if (this.editorStore.getSnapshot().selectedObjectIds.length > 0) {
        this._setSelectedObjects([]);
        this._render();
        return;
      }
      this.close();
      return;
    }
    const _0x1c88e8 = !_0x15253a && !_0x1d505e.altKey && !_0x1d505e.ctrlKey && !_0x1d505e.metaKey ? resolveStoryboard3DToolFromShortcut(_0x1d505e.key, this.navigationSettings.preset) : null;
    if (_0x1c88e8) {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      this.editorStore.setActiveTool(_0x1c88e8);
      this._render();
      return;
    }
    if (!_0x15253a && !_0x1d505e.shiftKey && _0x1d505e.key.toLowerCase() === "f") {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      if (!this.viewportControls?.focusSelection?.()) {
        this._setMessage("请先选择一个可见对象。");
      }
      return;
    }
    if (!_0x15253a && _0x1d505e.key === "Home") {
      _0x1d505e.preventDefault();
      _0x1d505e.stopImmediatePropagation();
      this.viewportControls?.fitAll?.();
      return;
    }
    const _0x332600 = ["Delete", "Backspace"].includes(_0x1d505e.key) || !_0x1d505e.shiftKey && !_0x1d505e.altKey && !_0x1d505e.ctrlKey && !_0x1d505e.metaKey && _0x1d505e.code === "KeyD";
    if (!_0x15253a && _0x332600) {
      const _0x236b66 = this.editorStore.getSnapshot().selectedObjectIds;
      if (_0x236b66.length > 0) {
        _0x1d505e.preventDefault();
        _0x1d505e.stopImmediatePropagation();
        this._deleteObjects(_0x236b66);
        return;
      }
    }
    _0x1d505e.stopImmediatePropagation();
  }
  _addAssetToActiveScene(_0x1a3482, {
    position = null
  } = {}) {
    let _0x2391ee = "";
    const _0x3b90c6 = this.sceneRuntime?.resolveViewportGroundPosition?.(0);
    const _0x2dd40e = Array.isArray(position) ? position.slice(0, 3) : Array.isArray(_0x3b90c6) ? _0x3b90c6.slice(0, 3) : resolveStoryboard3DViewportCenterPosition(this.sceneRuntime?.getSceneView?.());
    this._executeMutation({
      type: "add-object",
      label: "Add asset",
      renderOptions: {
        preserveAssetLibrary: true
      },
      mutate: _0x6c7e8b => {
        const _0x49c1e5 = _0x6c7e8b.scenes.find(_0x183d4b => _0x183d4b.id === _0x6c7e8b.activeSceneId);
        if (!_0x49c1e5) {
          return _0x6c7e8b;
        }
        const _0x10707c = _0x1a3482.source?.assetId || _0x1a3482.id || "";
        const _0x5cad33 = _0x1a3482.category === "character" && STORYBOARD_3D_BODY_PRESETS.some(_0x2f5a0a => _0x2f5a0a.id === _0x10707c);
        const _0x319887 = {
          id: createLocalId(_0x5cad33 ? "character" : "prop"),
          type: _0x5cad33 ? "character" : "prop",
          name: _0x1a3482.name,
          visible: true,
          locked: false,
          transform: {
            position: _0x2dd40e,
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
          },
          ...(_0x5cad33 ? {
            bodyPresetId: _0x10707c || "adult-male",
            actionId: "standing",
            actionPlaying: false,
            leftHandPoseId: "relaxed",
            rightHandPoseId: "relaxed",
            boneOverrides: {}
          } : {
            assetId: _0x1a3482.source?.assetId || _0x1a3482.id,
            ...(_0x1a3482.tint ? {
              tint: _0x1a3482.tint
            } : {}),
            castShadow: true,
            receiveShadow: true
          })
        };
        _0x49c1e5.objects.push(_0x319887);
        _0x2391ee = _0x319887.id;
        return _0x6c7e8b;
      }
    });
    this.assetLibrary.markUsed(_0x1a3482.id);
    if (_0x2391ee) {
      this._setSelectedObjects([_0x2391ee], {
        openProperties: false
      });
      this._render({
        preserveAssetLibrary: true
      });
    }
  }
  _handleClick(_0x585cce) {
    const _0x5cf167 = _0x585cce.target?.closest?.("[data-storyboard-3d-action]");
    if (!_0x5cf167 || _0x5cf167.disabled) {
      return;
    }
    const _0x1da69e = _0x5cf167.getAttribute("data-storyboard-3d-action");
    if (_0x1da69e === "timeline-toggle-drawer" && this._suppressTimelineToggleClick) {
      this._suppressTimelineToggleClick = false;
      _0x585cce.preventDefault?.();
      _0x585cce.stopImmediatePropagation?.();
      return;
    }
    if (this.shotTimelineController?.handleClick?.(_0x1da69e, _0x5cf167, _0x585cce)) {
      return;
    }
    if (_0x1da69e === "set-inspector-tab") {
      const _0x263876 = this.root?.querySelector?.(".storyboard-3d-inspector-dock");
      if (_0x263876) {
        _0x263876.scrollTop = 0;
      }
      this.editorStore.setInspectorTab(_0x5cf167.dataset.inspectorTab);
      this._render();
      return;
    }
    if (_0x1da69e === "toggle-object-outline") {
      const _0x284480 = _0x5cf167.closest(".storyboard-3d-object-popover");
      this.editorStore.setObjectOutlineOpen(!_0x284480?.open);
      return;
    }
    if (_0x1da69e === "toggle-scene-environment") {
      const _0x3d2e5a = _0x5cf167.closest("[data-storyboard-3d-scene-environment]");
      this.sceneEnvironmentOpen = !_0x3d2e5a?.open;
      return;
    }
    if (_0x1da69e === "toggle-fly-mode") {
      this._setFlyMode(!this.editorStore.getSnapshot().flyMode);
      return;
    }
    if (_0x1da69e === "open-asset-library") {
      this._openAssetLibrary();
      return;
    }
    if (_0x1da69e === "open-background-perspective") {
      this._openBackgroundPerspective();
      return;
    }
    if (_0x1da69e === "toggle-ai-sidebar") {
      this._toggleAIAssistant();
      return;
    }
    if (_0x1da69e === "select-asset-category") {
      this.assetCategory = String(_0x5cf167.getAttribute("data-storyboard-3d-asset-category") || "all");
      this.assetVisibleLimit = 32;
      this._render();
      return;
    }
    if (_0x1da69e === "rebuild-viewport") {
      this._rebuildSceneRuntime();
      return;
    }
    if (_0x1da69e === "focus-selection") {
      if (!this.viewportControls?.focusSelection?.()) {
        this._setMessage("请先选择一个可见对象。");
      }
      return;
    }
    if (_0x1da69e === "fit-all") {
      this.viewportControls?.fitAll?.();
      return;
    }
    if (_0x1da69e === "reset-focal-length") {
      this._commitFocalLength(STORYBOARD_3D_FOCAL_LENGTH_PRESETS.indexOf(35));
      return;
    }
    if (_0x1da69e === "set-viewport-view") {
      const _0x234683 = _0x5cf167.dataset.view;
      if (_0x234683 === "perspective") {
        this.viewportControls?.showPerspectiveView?.();
      } else {
        this.viewportControls?.showOrthographicView?.(_0x234683);
      }
      return;
    }
    if (_0x1da69e === "toggle-viewport-setting") {
      const _0x3e816a = _0x5cf167.getAttribute("data-storyboard-3d-viewport-setting-toggle");
      if (!["transformSpace", "snapEnabled", "groundLock", "uniformScale"].includes(_0x3e816a)) {
        return;
      }
      const _0x114352 = _0x3e816a === "transformSpace" ? {
        transformSpace: this.viewportSettings.transformSpace === "local" ? "world" : "local"
      } : {
        [_0x3e816a]: this.viewportSettings[_0x3e816a] !== true
      };
      const _0x1e2c6a = this.viewportControls?.updateSettings?.(_0x114352) || normalizeStoryboard3DViewportSettings({
        ...this.viewportSettings,
        ..._0x114352
      });
      this._saveTransformSettings(_0x1e2c6a);
      this.sceneRuntime?.setViewportUIPatch?.(this.viewportControls?.getDirectorUIPatch?.() || {});
      this._render();
      return;
    }
    if (_0x1da69e === "toggle-top-view") {
      const _0x247ab5 = this.viewportControls?.getSnapshot?.().viewMode;
      if (_0x247ab5 === "top") {
        this.viewportControls.showPerspectiveView();
      } else {
        this.viewportControls?.showTopView?.();
      }
      return;
    }
    if (_0x1da69e === "run-ai-command") {
      this._runAICommand();
      return;
    }
    if (_0x1da69e === "toggle-mini-map") {
      this.miniMapExpanded = !this.miniMapExpanded;
      this._render();
      return;
    }
    if (_0x1da69e === "cancel-ai-command") {
      this.aiController.cancel();
      return;
    }
    if (_0x1da69e === "toggle-ai-voice") {
      if (["starting", "listening", "transcribing", "stopping"].includes(this.aiState.status)) {
        this.aiController.stopVoice();
      } else {
        this.aiController.startVoice({
          language: "zh-CN"
        });
      }
      return;
    }
    if (_0x1da69e === "undo") {
      this.commandHistory.undo();
      return;
    }
    if (_0x1da69e === "redo") {
      this.commandHistory.redo();
      return;
    }
    if (_0x1da69e === "undo-ai-command") {
      if (this.commandHistory.getSnapshot().nextUndoLabel === "AI scene transaction") {
        this.commandHistory.undo();
        this._setMessage("已撤销本次 AI 场景修改。");
        this._syncAIAssistant();
      }
      return;
    }
    if (_0x1da69e === "set-tool") {
      this.editorStore.setActiveTool(_0x5cf167.dataset.tool);
      this._render();
      return;
    }
    if (["toggle-object-visibility", "toggle-object-lock"].includes(_0x1da69e)) {
      const _0x4988a9 = _0x5cf167.dataset.objectId;
      const _0x40a704 = _0x1da69e === "toggle-object-visibility" ? "visible" : "locked";
      this._executeMutation({
        type: "toggle-object-" + _0x40a704,
        label: "Toggle object " + _0x40a704,
        mutate: _0x2eda8f => {
          const _0x2f5ec3 = _0x2eda8f.scenes.find(_0x580437 => _0x580437.id === _0x2eda8f.activeSceneId);
          const _0x53ba89 = _0x2f5ec3?.objects?.find(_0x278ce0 => _0x278ce0.id === _0x4988a9);
          if (_0x53ba89) {
            _0x53ba89[_0x40a704] = _0x40a704 === "visible" ? _0x53ba89.visible === false : _0x53ba89.locked !== true;
          }
          return _0x2eda8f;
        }
      });
      return;
    }
    if (_0x1da69e === "edit-object-name") {
      const _0x5eff1e = _0x5cf167.dataset.objectId;
      const _0x2e6f57 = _0x5cf167.dataset.objectType;
      const _0x3800f1 = this.editorStore.getSnapshot();
      const _0x53a9d8 = _0x585cce.shiftKey || _0x585cce.ctrlKey || _0x585cce.metaKey;
      if (_0x53a9d8) {
        const _0x26ac44 = _0x3800f1.selectedObjectIds.includes(_0x5eff1e) ? _0x3800f1.selectedObjectIds.filter(_0x1cdd9f => _0x1cdd9f !== _0x5eff1e) : [..._0x3800f1.selectedObjectIds, _0x5eff1e];
        if (_0x2e6f57 === "camera" && _0x26ac44.includes(_0x5eff1e)) {
          if (!this._activateShotForCamera(_0x5eff1e)) {
            return;
          }
        }
        this._setSelectedObjects(_0x26ac44);
        this._render();
        return;
      }
      const _0x1be0b2 = _0x3800f1.selectedObjectIds.length === 1 && _0x3800f1.selectedObjectIds[0] === _0x5eff1e && !_0x3800f1.assetLibraryOpen && this.rightSidebarMode === "object";
      if (_0x1be0b2) {
        return;
      }
      if (_0x2e6f57 === "camera" && !this._activateShotForCamera(_0x5eff1e)) {
        return;
      }
      this._setSelectedObjects([_0x5eff1e]);
      this._render();
      const _0x441638 = [...(this.root?.querySelectorAll?.("[data-storyboard-3d-outline-name]") || [])].find(_0x2065c7 => _0x2065c7.dataset.objectId === _0x5eff1e);
      _0x441638?.focus?.();
      _0x441638?.select?.();
      if (_0x2e6f57 === "camera") {
        this._focusCameraObject(_0x5eff1e);
      }
      return;
    }
    if (_0x1da69e === "select-object") {
      const _0x3937e0 = _0x5cf167.dataset.objectId;
      const _0x2d3beb = this.editorStore.getSnapshot().selectedObjectIds;
      const _0x4624c4 = _0x585cce.shiftKey || _0x585cce.ctrlKey || _0x585cce.metaKey;
      const _0x4f59dd = !_0x3937e0 ? [] : _0x4624c4 ? _0x2d3beb.includes(_0x3937e0) ? _0x2d3beb.filter(_0x37f07c => _0x37f07c !== _0x3937e0) : [..._0x2d3beb, _0x3937e0] : [_0x3937e0];
      if (_0x5cf167.dataset.objectType === "camera" && _0x4f59dd.includes(_0x3937e0)) {
        if (!this._activateShotForCamera(_0x3937e0)) {
          return;
        }
      }
      this._setSelectedObjects(_0x4f59dd);
      this._render();
      if (_0x5cf167.dataset.objectType === "camera" && _0x4f59dd.length === 1) {
        this._focusCameraObject(_0x3937e0);
      }
      return;
    }
    if (_0x1da69e === "open-explore") {
      this._clearShotCandidates();
      const _0x1681b3 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      this.exploreFilter = "all";
      this.exploreVariation = 0;
      this.shotCandidates = generateStoryboard3DShotCandidates(_0x1681b3, {
        count: 9,
        variation: 0
      });
      this.exploreOpen = true;
      this._render();
      return;
    }
    if (_0x1da69e === "filter-explore") {
      this.exploreFilter = ["all", "close", "medium", "wide"].includes(_0x5cf167.dataset.exploreFilter) ? _0x5cf167.dataset.exploreFilter : "all";
      this._render();
      return;
    }
    if (_0x1da69e === "regenerate-explore") {
      const _0x4d5c78 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      this._clearShotCandidates();
      this.exploreVariation += 1;
      this.shotCandidates = generateStoryboard3DShotCandidates(_0x4d5c78, {
        count: 9,
        variation: this.exploreVariation
      });
      this._render();
      return;
    }
    if (_0x1da69e === "close-explore") {
      this.exploreOpen = false;
      this._clearShotCandidates();
      this._render();
      return;
    }
    if (_0x1da69e === "preview-candidate") {
      const _0x412350 = this.shotCandidates[Number(_0x5cf167.dataset.candidateIndex)];
      const _0xa9d2b0 = this.projectStore.getSnapshot();
      const _0x52c5da = getActiveStoryboard3DScene(_0xa9d2b0);
      const _0x2b8967 = getActiveStoryboard3DShot(_0xa9d2b0);
      if (!_0x412350 || !_0x52c5da || !_0x2b8967 || !this.sceneRuntime) {
        return;
      }
      const _0x5f429a = structuredClone(_0xa9d2b0);
      const _0x5eaac5 = getActiveStoryboard3DScene(_0x5f429a);
      const _0x119662 = getActiveStoryboard3DShot(_0x5f429a);
      _0x119662.camera = structuredClone(_0x412350.camera);
      this.sceneRuntime.sync({
        project: _0x5f429a,
        sceneId: _0x5eaac5.id,
        selectedObjectIds: [],
        activeTool: "select"
      });
      this.sceneRuntime.renderNow();
      this._setMessage("正在预览 " + _0x412350.shotSize + " · " + _0x412350.shotAngle + " 候选机位。");
      return;
    }
    if (_0x1da69e === "replace-with-candidate" || _0x1da69e === "append-candidate") {
      const _0x3cfa01 = this.shotCandidates[Number(_0x5cf167.dataset.candidateIndex)];
      if (!_0x3cfa01) {
        return;
      }
      this._executeMutation({
        type: _0x1da69e === "append-candidate" ? "append-shot-candidate" : "replace-shot-candidate",
        label: _0x1da69e === "append-candidate" ? "Append shot candidate" : "Replace shot candidate",
        mutate: _0x313cc8 => {
          const _0x231d4e = _0x313cc8.scenes.findIndex(_0x5842d0 => _0x5842d0.id === _0x313cc8.activeSceneId);
          if (_0x231d4e < 0) {
            return _0x313cc8;
          }
          const _0x5f3803 = _0x313cc8.scenes[_0x231d4e];
          _0x313cc8.scenes[_0x231d4e] = _0x1da69e === "append-candidate" ? appendStoryboard3DShotCandidate(_0x5f3803, _0x3cfa01) : replaceStoryboard3DShotWithCandidate(_0x5f3803, _0x5f3803.activeShotId, _0x3cfa01);
          return _0x313cc8;
        }
      });
      this.exploreOpen = false;
      this._clearShotCandidates();
      this._render();
      const _0x29c5cc = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      const _0x206046 = _0x29c5cc?.shots?.find(_0x454091 => _0x454091.id === _0x29c5cc.activeShotId);
      if (_0x206046) {
        this._setSelectedObjects([_0x206046.cameraId]);
        this._render();
        this._focusCameraObject(_0x206046.cameraId);
        this._generateShotThumbnail(_0x29c5cc.id, _0x206046.id);
      }
      return;
    }
    if (_0x1da69e === "add-asset") {
      const _0xd1f675 = _0x5cf167.dataset.assetId;
      const _0x41b83c = this.assetLibrary.find(_0xd1f675);
      if (!_0x41b83c) {
        return;
      }
      const _0x445f82 = this.sceneRuntime?.resolveViewportGroundPosition?.(0) || resolveStoryboard3DViewportCenterPosition(this.sceneRuntime?.getSceneView?.());
      if (_0x41b83c.source?.kind === "pack" && !this.importedModelScenes.has(_0x41b83c.id)) {
        this._setMessage("正在加载模型包素材“" + _0x41b83c.name + "”…");
        this._loadPackAsset(_0x41b83c.id).then(() => {
          if (this._closed) {
            return;
          }
          this._addAssetToActiveScene(_0x41b83c, {
            position: _0x445f82
          });
          this._setMessage("模型包素材“" + _0x41b83c.name + "”已加入场景。");
        }).catch(_0x463b73 => this._setMessage(_0x463b73?.message || String(_0x463b73)));
        return;
      }
      this._addAssetToActiveScene(_0x41b83c, {
        position: _0x445f82
      });
      return;
    }
    if (_0x1da69e === "toggle-asset-favorite") {
      const _0x263d42 = _0x5cf167.dataset.assetId;
      if (this.favoriteAssetIds.has(_0x263d42)) {
        this.favoriteAssetIds.delete(_0x263d42);
      } else {
        this.favoriteAssetIds.add(_0x263d42);
      }
      this._render();
      return;
    }
    if (_0x1da69e === "load-more-assets") {
      this.assetVisibleLimit = Math.min(1600, this.assetVisibleLimit + 32);
      this._render();
      return;
    }
    if (_0x1da69e === "toggle-character-play") {
      const _0x530510 = _0x5cf167.dataset.objectId;
      this._executeMutation({
        type: "toggle-character-playback",
        label: "Toggle character playback",
        mutate: _0x11f22a => {
          const _0x42cb45 = _0x11f22a.scenes.find(_0x4d210c => _0x4d210c.id === _0x11f22a.activeSceneId);
          const _0x528a2c = _0x42cb45?.objects?.find(_0x25d3ec => _0x25d3ec.id === _0x530510);
          if (_0x528a2c?.type === "character") {
            Object.assign(_0x528a2c, setStoryboard3DCharacterActionPlayback(_0x528a2c, !_0x528a2c.actionPlaying));
          }
          return _0x11f22a;
        }
      });
      return;
    }
    if (_0x1da69e === "extract-character-pose") {
      const _0x5696a6 = this.root.querySelector("[data-storyboard-3d-pose-image-input]");
      if (!_0x5696a6) {
        return;
      }
      _0x5696a6.dataset.objectId = String(_0x5cf167.dataset.objectId || "");
      _0x5696a6.click?.();
      return;
    }
    if (_0x1da69e === "cancel-character-pose") {
      const _0x3484ec = String(_0x5cf167.dataset.objectId || "");
      this.characterImagePoseController.clear(_0x3484ec);
      this._setMessage("已取消人物姿势识别。");
      return;
    }
    if (_0x1da69e === "reset-character-pose") {
      const _0x3b2243 = String(_0x5cf167.dataset.objectId || "");
      this.characterImagePoseController.clear(_0x3b2243);
      this._executeMutation({
        type: "reset-character-pose",
        label: "Reset character pose",
        mutate: _0x491fac => {
          for (const _0x26ba08 of _0x491fac.scenes || []) {
            const _0x5d64e4 = _0x26ba08.objects?.find(_0x3c7b54 => _0x3c7b54.id === _0x3b2243);
            if (_0x5d64e4?.type !== "character") {
              continue;
            }
            _0x5d64e4.boneOverrides = {};
            break;
          }
          return _0x491fac;
        }
      });
      this._setMessage("已重置人物骨骼姿势。");
      return;
    }
    if (_0x1da69e === "import-model") {
      this.root.querySelector("[data-storyboard-3d-model-input]")?.click?.();
      return;
    }
    if (_0x1da69e === "cancel-model-import") {
      this.modelImportJob?.cancel?.("用户取消了模型导入");
      this.modelImportState = this.modelImportJob?.getSnapshot?.() || this.modelImportState;
      this._render();
      return;
    }
    if (_0x1da69e === "add-scene") {
      this._executeMutation({
        type: "add-scene",
        label: "Add scene",
        mutate: _0x1db01b => {
          const _0xfd7853 = createStoryboard3DScene({
            name: "场景 " + (_0x1db01b.scenes.length + 1),
            shotName: "镜头 1"
          });
          _0x1db01b.scenes.push(_0xfd7853);
          _0x1db01b.activeSceneId = _0xfd7853.id;
          return _0x1db01b;
        }
      });
      this._setSelectedObjects([]);
      this._render();
      return;
    }
    if (["duplicate-scene", "delete-scene", "move-scene"].includes(_0x1da69e)) {
      const _0x67553b = _0x5cf167.dataset.sceneId;
      const _0x1ec80a = Number(_0x5cf167.dataset.direction) || 0;
      const _0x19edb4 = this.projectStore.getSnapshot();
      const _0x1148dd = _0x19edb4.scenes.findIndex(_0x15c70f => _0x15c70f.id === _0x67553b);
      this._executeMutation({
        type: _0x1da69e,
        label: _0x1da69e,
        mutate: _0x14d357 => {
          if (_0x1da69e === "duplicate-scene") {
            return duplicateStoryboard3DScene(_0x14d357, _0x67553b, {
              name: (_0x14d357.scenes.find(_0x59b65f => _0x59b65f.id === _0x67553b)?.name || "场景") + " 副本",
              now: Date.now()
            });
          }
          if (_0x1da69e === "delete-scene") {
            return deleteStoryboard3DScene(_0x14d357, _0x67553b, {
              now: Date.now()
            });
          }
          return reorderStoryboard3DScene(_0x14d357, _0x67553b, _0x1148dd + _0x1ec80a, {
            now: Date.now()
          });
        }
      });
      this._setSelectedObjects([]);
      this._render();
      return;
    }
    if (_0x1da69e === "add-shot") {
      const _0x3e6389 = this._readCurrentCameraState();
      if (!_0x3e6389) {
        this._setMessage("当前摄像机状态不可用。");
        return;
      }
      const _0x2a942a = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      const _0x4dddef = guardStoryboard3DBackgroundCameraChange(_0x2a942a?.background, _0x3e6389);
      if (!_0x4dddef.allowed) {
        this._setMessage(_0x4dddef.reason);
        return;
      }
      this._executeMutation({
        type: "add-shot",
        label: "Add shot from current view",
        mutate: _0x23f53c => {
          const _0x513848 = _0x23f53c.scenes.findIndex(_0x52b862 => _0x52b862.id === _0x23f53c.activeSceneId);
          if (_0x513848 >= 0) {
            _0x23f53c.scenes[_0x513848] = appendShotFromCurrentView({
              scene: _0x23f53c.scenes[_0x513848],
              camera: _0x3e6389
            });
          }
          return _0x23f53c;
        }
      });
      const _0x4ce602 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      const _0x498cbe = _0x4ce602?.shots?.find(_0x23869 => _0x23869.id === _0x4ce602.activeShotId);
      if (_0x498cbe) {
        this._setSelectedObjects([_0x498cbe.cameraId]);
        this._render();
        this._focusCameraObject(_0x498cbe.cameraId);
        this._generateShotThumbnail(_0x4ce602.id, _0x498cbe.id);
      }
      return;
    }
    if (_0x1da69e === "replace-shot-camera") {
      const _0x55929c = this._readCurrentCameraState();
      const _0x4e3375 = this.projectStore.getSnapshot();
      const _0x79e8ce = getActiveStoryboard3DScene(_0x4e3375);
      const _0x36f751 = _0x5cf167.dataset.shotId;
      if (!_0x55929c || !_0x79e8ce) {
        return;
      }
      const _0x4b741a = guardStoryboard3DBackgroundCameraChange(_0x79e8ce.background, _0x55929c);
      if (!_0x4b741a.allowed) {
        this._setMessage(_0x4b741a.reason);
        return;
      }
      this._executeMutation({
        type: "replace-shot-camera",
        label: "Replace shot camera",
        mutate: _0x5dca48 => replaceStoryboard3DShotFromCurrentView(_0x5dca48, {
          sceneId: _0x79e8ce.id,
          shotId: _0x36f751,
          camera: _0x55929c,
          now: Date.now()
        })
      });
      this._generateShotThumbnail(_0x79e8ce.id, _0x36f751);
      return;
    }
    if (_0x1da69e === "group-selected") {
      const _0x3f77a2 = this.editorStore.getSnapshot().selectedObjectIds;
      if (_0x3f77a2.length === 0) {
        this._setMessage("请先选择要分组的对象。");
        return;
      }
      let _0x538c0d = "";
      this._executeMutation({
        type: "group-objects",
        label: "Group selected objects",
        mutate: _0x4d1294 => {
          const _0x5080a2 = _0x4d1294.scenes.findIndex(_0x1e1fdb => _0x1e1fdb.id === _0x4d1294.activeSceneId);
          if (_0x5080a2 < 0) {
            return _0x4d1294;
          }
          const _0x38bef4 = groupStoryboard3DSceneObjects(_0x4d1294.scenes[_0x5080a2], _0x3f77a2, {
            name: "新分组",
            idFactory: createLocalId
          });
          _0x538c0d = _0x38bef4.objects.at(-1)?.id || "";
          _0x4d1294.scenes[_0x5080a2] = _0x38bef4;
          return _0x4d1294;
        }
      });
      if (_0x538c0d) {
        this._setSelectedObjects([_0x538c0d]);
      }
      this._render();
      return;
    }
    if (_0x1da69e === "ungroup-object") {
      const _0x3d5999 = _0x5cf167.dataset.objectId;
      this._executeMutation({
        type: "ungroup-objects",
        label: "Ungroup objects",
        mutate: _0x3ba1f2 => {
          const _0x128dc3 = _0x3ba1f2.scenes.findIndex(_0x8683c => _0x8683c.id === _0x3ba1f2.activeSceneId);
          if (_0x128dc3 >= 0) {
            _0x3ba1f2.scenes[_0x128dc3] = ungroupStoryboard3DSceneGroup(_0x3ba1f2.scenes[_0x128dc3], _0x3d5999);
          }
          return _0x3ba1f2;
        }
      });
      this._setSelectedObjects([]);
      this._render();
      return;
    }
    if (_0x1da69e === "duplicate-object") {
      const _0x2fa576 = _0x5cf167.dataset.objectId;
      let _0x50c65c = "";
      this._executeMutation({
        type: "duplicate-object",
        label: "Duplicate object",
        mutate: _0x1c3b6e => {
          const _0x54d7f4 = _0x1c3b6e.scenes.find(_0x5ace5f => _0x5ace5f.id === _0x1c3b6e.activeSceneId);
          const _0x235722 = _0x54d7f4?.objects?.find(_0x1ac6e3 => _0x1ac6e3.id === _0x2fa576);
          if (!_0x235722) {
            return _0x1c3b6e;
          }
          if (_0x235722.type === "camera") {
            const _0x199976 = _0x54d7f4.shots?.find(_0x280354 => _0x280354.cameraId === _0x235722.id);
            const _0x46f9a6 = _0x1c3b6e.scenes.findIndex(_0x4f84b8 => _0x4f84b8.id === _0x54d7f4.id);
            if (!_0x199976 || _0x46f9a6 < 0) {
              return _0x1c3b6e;
            }
            const _0x164ba0 = duplicateStoryboard3DShot(_0x54d7f4, _0x199976.id, {
              idFactory: createLocalId
            });
            _0x1c3b6e.scenes[_0x46f9a6] = _0x164ba0;
            _0x50c65c = _0x164ba0.shots.find(_0x1b57db => _0x1b57db.id === _0x164ba0.activeShotId)?.cameraId || "";
            return _0x1c3b6e;
          }
          const _0x17590a = structuredClone(_0x235722);
          _0x17590a.id = createLocalId(_0x235722.type || "object");
          _0x17590a.name = _0x235722.name + " 副本";
          _0x17590a.transform.position[0] += 0.5;
          _0x17590a.transform.position[2] += 0.5;
          _0x54d7f4.objects.push(_0x17590a);
          _0x50c65c = _0x17590a.id;
          return _0x1c3b6e;
        }
      });
      if (_0x50c65c) {
        this._setSelectedObjects([_0x50c65c]);
        this._render();
        const _0xe7d6ed = getActiveStoryboard3DScene(this.projectStore.getSnapshot())?.objects?.find(_0xdcb59c => _0xdcb59c.id === _0x50c65c);
        if (_0xe7d6ed?.type === "camera") {
          this._focusCameraObject(_0x50c65c);
        }
      }
      return;
    }
    if (_0x1da69e === "delete-object") {
      this._deleteObjects(_0x5cf167.dataset.objectId);
      return;
    }
    if (_0x1da69e === "clear-background") {
      const _0xc46ce6 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
      const _0x20cd90 = _0xc46ce6?.background?.binaryAssetId;
      this._getBackgroundImageController(_0xc46ce6?.id)?.clear?.();
      this._executeMutation({
        type: "clear-background",
        label: "Clear background",
        mutate: _0x4e6bdf => {
          const _0x9bea57 = _0x4e6bdf.scenes.find(_0xb06ad5 => _0xb06ad5.id === _0x4e6bdf.activeSceneId);
          if (_0x9bea57) {
            delete _0x9bea57.background;
          }
          return _0x4e6bdf;
        }
      });
      if (_0x20cd90) {
        this.binaryAssetRepository.remove(_0x20cd90).catch(() => {});
      }
      return;
    }
    if (_0x1da69e === "upload-background") {
      this.root.querySelector("[data-storyboard-3d-background-input]")?.click?.();
      return;
    }
    if (_0x1da69e === "analyze-background") {
      this._reanalyzeActiveBackground();
      return;
    }
    if (_0x1da69e === "add-light") {
      let _0x4e13a5 = "";
      this._executeMutation({
        type: "add-light",
        label: "Add light",
        mutate: _0x5bfdcf => {
          const _0x52f2a2 = _0x5bfdcf.scenes.find(_0x2d3f1f => _0x2d3f1f.id === _0x5bfdcf.activeSceneId);
          if (!_0x52f2a2) {
            return _0x5bfdcf;
          }
          _0x4e13a5 = createLocalId("light");
          _0x52f2a2.objects.push({
            id: _0x4e13a5,
            type: "light",
            name: "灯光 " + (_0x52f2a2.objects.filter(_0x5bafba => _0x5bafba.type === "light").length + 1),
            lightType: "directional",
            color: "#ffffff",
            intensity: 1,
            visible: true,
            locked: false,
            transform: {
              position: [3, 5, 3],
              rotation: [0, 0, 0],
              scale: [1, 1, 1]
            },
            castShadow: true
          });
          return _0x5bfdcf;
        }
      });
      if (_0x4e13a5) {
        this._setSelectedObjects([_0x4e13a5]);
        this._render();
      }
      return;
    }
    if (["duplicate-shot", "delete-shot", "move-shot"].includes(_0x1da69e)) {
      const _0x2b15a3 = _0x5cf167.dataset.shotId;
      const _0x2cd866 = Number(_0x5cf167.dataset.direction) || 0;
      this._executeMutation({
        type: _0x1da69e,
        label: _0x1da69e,
        mutate: _0xd002c => {
          const _0xec8b08 = _0xd002c.scenes.findIndex(_0x3889f4 => _0x3889f4.id === _0xd002c.activeSceneId);
          if (_0xec8b08 < 0) {
            return _0xd002c;
          }
          const _0xad08da = _0xd002c.scenes[_0xec8b08];
          if (_0x1da69e === "duplicate-shot") {
            _0xd002c.scenes[_0xec8b08] = duplicateStoryboard3DShot(_0xad08da, _0x2b15a3);
          } else if (_0x1da69e === "delete-shot") {
            _0xd002c.scenes[_0xec8b08] = deleteStoryboard3DShot(_0xad08da, _0x2b15a3);
          } else {
            const _0x25c8e5 = _0xad08da.shots.findIndex(_0x498eee => _0x498eee.id === _0x2b15a3);
            _0xd002c.scenes[_0xec8b08] = reorderStoryboard3DShot(_0xad08da, _0x2b15a3, Math.max(0, Math.min(_0xad08da.shots.length - 1, _0x25c8e5 + _0x2cd866)));
          }
          return _0xd002c;
        }
      });
      return;
    }
    if (_0x1da69e === "close") {
      this.close();
      return;
    }
    if (_0x1da69e === "select-scene") {
      this.projectStore.selectScene(_0x5cf167.dataset.sceneId);
      this.viewportFocalLength = Number(getActiveStoryboard3DShot(this.projectStore.getSnapshot())?.camera?.focalLength) || 35;
      this._render();
      return;
    }
    if (_0x1da69e === "select-shot") {
      const _0x479255 = this.projectStore.getSnapshot();
      const _0xc2c2db = getActiveStoryboard3DScene(_0x479255);
      const _0x369947 = _0xc2c2db?.shots?.find(_0x14619a => _0x14619a.id === _0x5cf167.dataset.shotId);
      const _0x3df71e = guardStoryboard3DBackgroundCameraChange(_0xc2c2db?.background, _0x369947?.camera);
      if (!_0x3df71e.allowed) {
        this._setMessage(_0x3df71e.reason);
        return;
      }
      this.projectStore.selectShot(_0x5cf167.dataset.shotId);
      this.viewportFocalLength = Number(_0x369947?.camera?.focalLength) || 35;
      this._render();
      return;
    }
    if (_0x1da69e === "export-storyboard") {
      this.exportStoryboard();
    }
  }
  _handleInput(_0x47379d) {
    if (_0x47379d.target?.matches?.("[data-storyboard-3d-focal-slider]")) {
      this._previewFocalLength(_0x47379d.target.value);
      return;
    }
    this.shotTimelineController?.handleInput?.(_0x47379d);
  }
  async _handleChange(_0xce6767) {
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-focal-slider]")) {
      this._commitFocalLength(_0xce6767.target.value);
      return;
    }
    if (this.shotTimelineController?.handleChange?.(_0xce6767)) {
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-pose-image-input]")) {
      const _0x19b631 = _0xce6767.target.files?.[0];
      const _0xb475ae = String(_0xce6767.target.dataset.objectId || "");
      _0xce6767.target.value = "";
      delete _0xce6767.target.dataset.objectId;
      if (!_0x19b631 || !_0xb475ae) {
        return;
      }
      try {
        await this.characterImagePoseController.extract({
          objectId: _0xb475ae,
          file: _0x19b631
        });
      } catch (_0x458c7b) {
        if (_0x458c7b?.name !== "AbortError" && _0x458c7b?.code !== "ABORT_ERR") {
          this._setMessage(_0x458c7b?.message || String(_0x458c7b));
        }
      }
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-navigation-preset]")) {
      this._saveNavigationSettings(createStoryboard3DNavigationPresetSettings(_0xce6767.target.value));
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-navigation-setting]")) {
      const _0x14a851 = _0xce6767.target.getAttribute("data-storyboard-3d-navigation-setting");
      const _0xd4cc7d = _0xce6767.target.type === "checkbox" ? _0xce6767.target.checked : Number(_0xce6767.target.value);
      this._saveNavigationSettings({
        ...this.navigationSettings,
        [_0x14a851]: _0xd4cc7d
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-bone-select]")) {
      this.characterBoneSelection.set(_0xce6767.target.dataset.objectId, String(_0xce6767.target.value || "Head"));
      this._render();
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-bone-axis]")) {
      const _0x4ed24f = _0xce6767.target.dataset.objectId;
      const _0x37df27 = _0xce6767.target.dataset.boneName;
      const _0x5cc8c7 = _0xce6767.target.getAttribute("data-storyboard-3d-bone-axis");
      const _0x3743e6 = Number(_0xce6767.target.value) || 0;
      this._executeMutation({
        type: "edit-character-bone",
        label: "Edit character bone",
        mutate: _0x4971e7 => {
          const _0x553e4d = _0x4971e7.scenes.find(_0x36dcaa => _0x36dcaa.id === _0x4971e7.activeSceneId);
          const _0x3abe8f = _0x553e4d?.objects?.find(_0x3792e5 => _0x3792e5.id === _0x4ed24f);
          if (_0x3abe8f?.type !== "character" || !["x", "y", "z"].includes(_0x5cc8c7)) {
            return _0x4971e7;
          }
          const _0x5045df = quaternionToStoryboard3DEuler(_0x3abe8f.boneOverrides?.[_0x37df27]);
          _0x5045df[_0x5cc8c7] = _0x3743e6 * Math.PI / 180;
          _0x3abe8f.boneOverrides = setStoryboard3DBoneOverride(_0x3abe8f.boneOverrides, _0x37df27, _0x5045df);
          return _0x4971e7;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-character-time]")) {
      const _0x3db0c4 = _0xce6767.target.dataset.objectId;
      const _0x1ce7f8 = Number(_0xce6767.target.value) || 0;
      this._executeMutation({
        type: "seek-character-action",
        label: "Seek character action",
        mutate: _0x5977be => {
          const _0x381bc9 = _0x5977be.scenes.find(_0xd3c8b2 => _0xd3c8b2.id === _0x5977be.activeSceneId);
          const _0x7b7d0d = _0x381bc9?.objects?.find(_0x5d08c8 => _0x5d08c8.id === _0x3db0c4);
          if (_0x7b7d0d?.type === "character") {
            Object.assign(_0x7b7d0d, seekStoryboard3DCharacterAction(_0x7b7d0d, _0x1ce7f8));
          }
          return _0x5977be;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-background-input]")) {
      const _0x37a564 = _0xce6767.target.files?.[0];
      _0xce6767.target.value = "";
      if (!_0x37a564) {
        return;
      }
      try {
        const _0x18fae9 = getActiveStoryboard3DScene(this.projectStore.getSnapshot());
        if (!_0x18fae9) {
          return;
        }
        const _0x3bfb44 = await preflightStoryboard3DImageFile(_0x37a564, {
          renderer: this.sceneRuntime?.bridge?.renderer
        });
        if (!_0x3bfb44.ok) {
          throw new Error(_0x3bfb44.errors.map(_0x2df8bb => _0x2df8bb.message).join(" "));
        }
        let _0x42e0de = null;
        let _0x200051 = null;
        try {
          _0x42e0de = await analyzeStoryboard3DBackgroundImage(_0x37a564, {
            documentObject: this.document,
            imageBitmapFactory: typeof this.window?.createImageBitmap === "function" ? this.window.createImageBitmap.bind(this.window) : undefined
          });
        } catch (_0x3c627a) {
          _0x200051 = _0x3c627a;
        }
        const _0x1b8403 = _0x18fae9.background?.binaryAssetId || createLocalId("background");
        await this.binaryAssetRepository.put({
          assetId: _0x1b8403,
          kind: "background",
          descriptor: {
            sceneId: _0x18fae9.id,
            fileName: _0x37a564.name
          },
          primaryFile: _0x37a564,
          relatedFiles: []
        });
        const _0x5e2e99 = this._getBackgroundImageController(_0x18fae9?.id).load(_0x37a564);
        const _0x30dbd2 = {
          imageUrl: _0x5e2e99.imageUrl,
          binaryAssetId: _0x1b8403,
          ...(_0x42e0de || {
            calibrationMethod: "unconfigured",
            calibrationConfidence: 0
          })
        };
        if (_0x42e0de) {
          this._applyDetectedBackgroundCalibration(_0x30dbd2, {
            type: "upload-and-calibrate-background",
            label: "Upload and calibrate background"
          });
          this._setMessage(_0x5e2e99.fileName + " 已自动匹配地面透视并锁定，匹配度 " + Math.round(_0x42e0de.calibrationConfidence * 100) + "%。");
        } else {
          this._executeMutation({
            type: "upload-background",
            label: "Upload background",
            mutate: _0x241a37 => {
              const _0x505ec5 = _0x241a37.scenes.find(_0x56c07b => _0x56c07b.id === _0x241a37.activeSceneId);
              if (_0x505ec5) {
                _0x505ec5.background = updateStoryboard3DBackgroundCalibration(_0x505ec5.background, _0x30dbd2);
              }
              return _0x241a37;
            }
          });
          this._setMessage(_0x5e2e99.fileName + " 已设置为背景，但自动匹配失败：" + (_0x200051?.message || "请手动调整参数") + "。");
        }
      } catch (_0x4201dc) {
        this._setMessage(_0x4201dc?.message || String(_0x4201dc));
      }
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-scene-name]")) {
      const _0x1664cf = _0xce6767.target.dataset.sceneId;
      const _0x2ae6e4 = String(_0xce6767.target.value || "").trim();
      this._executeMutation({
        type: "rename-scene",
        label: "Rename scene",
        mutate: _0x35e669 => renameStoryboard3DScene(_0x35e669, _0x1664cf, _0x2ae6e4, {
          now: Date.now()
        })
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-viewport-setting]")) {
      const _0x2cf3bf = _0xce6767.target.getAttribute("data-storyboard-3d-viewport-setting");
      const _0x56d0bf = _0xce6767.target.type === "checkbox" ? _0xce6767.target.checked : _0xce6767.target.value;
      const _0x5f5459 = _0x2cf3bf === "rotationSnapDegrees" ? {
        rotationSnap: Math.max(1, Number(_0x56d0bf) || 15) * Math.PI / 180
      } : {
        [_0x2cf3bf]: ["translationSnap", "scaleSnap"].includes(_0x2cf3bf) ? Number(_0x56d0bf) : _0x56d0bf
      };
      const _0x5ce7b1 = this.viewportControls?.updateSettings?.(_0x5f5459) || normalizeStoryboard3DViewportSettings({
        ...this.viewportSettings,
        ..._0x5f5459
      });
      this._saveTransformSettings(_0x5ce7b1);
      this.sceneRuntime?.setViewportUIPatch?.(this.viewportControls?.getDirectorUIPatch?.() || {});
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-outline-query]")) {
      this.outlineQuery = String(_0xce6767.target.value || "").trim();
      queueMicrotask(() => this._render());
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-outline-type]")) {
      this.outlineType = String(_0xce6767.target.value || "all");
      queueMicrotask(() => this._render());
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-asset-query]")) {
      this.assetQuery = String(_0xce6767.target.value || "").trim();
      this.assetVisibleLimit = 32;
      queueMicrotask(() => this._render());
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-camera-field]")) {
      const _0x2eea8b = _0xce6767.target.dataset.objectId;
      const _0x44958d = _0xce6767.target.getAttribute("data-storyboard-3d-camera-field");
      const _0xc469e = _0xce6767.target.value;
      this._executeMutation({
        type: "update-camera-" + _0x44958d,
        label: "Update camera " + _0x44958d,
        mutate: _0x221f45 => {
          const _0x42119e = _0x221f45.scenes.find(_0x589d13 => _0x589d13.id === _0x221f45.activeSceneId);
          const _0x43ac27 = _0x42119e?.objects?.find(_0x126d20 => _0x126d20.id === _0x2eea8b);
          if (_0x43ac27?.type !== "camera") {
            return _0x221f45;
          }
          if (_0x44958d === "aspectRatio") {
            const _0x5e730c = String(_0xc469e || "").trim();
            if (/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(_0x5e730c)) {
              _0x43ac27.aspectRatio = _0x5e730c;
            }
          } else {
            const _0xa2c3fe = Number(_0xc469e);
            if (!Number.isFinite(_0xa2c3fe)) {
              return _0x221f45;
            }
            if (_0x44958d === "focalLength") {
              _0x43ac27.focalLength = Math.max(1, Math.min(200, _0xa2c3fe));
            }
            if (_0x44958d === "near") {
              _0x43ac27.near = Math.max(0.001, _0xa2c3fe);
            }
            if (_0x44958d === "far") {
              _0x43ac27.far = Math.max(_0x43ac27.near + 0.001, _0xa2c3fe);
            }
          }
          syncStoryboard3DShotFromCameraObject(_0x42119e, _0x2eea8b);
          return _0x221f45;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-light-field]")) {
      const _0x2ea871 = _0xce6767.target.dataset.objectId;
      const _0x4823db = _0xce6767.target.getAttribute("data-storyboard-3d-light-field");
      const _0x105c79 = _0xce6767.target.type === "checkbox" ? _0xce6767.target.checked : ["intensity", "distance", "decay", "angleDegrees"].includes(_0x4823db) ? Number(_0xce6767.target.value) : String(_0xce6767.target.value || "");
      this._executeMutation({
        type: "update-light-" + _0x4823db,
        label: "Update light " + _0x4823db,
        mutate: _0x4bb9a5 => {
          const _0x18c8dd = _0x4bb9a5.scenes.find(_0x963e61 => _0x963e61.id === _0x4bb9a5.activeSceneId);
          const _0x591308 = _0x18c8dd?.objects?.find(_0x5e3cb2 => _0x5e3cb2.id === _0x2ea871);
          if (_0x591308?.type !== "light") {
            return _0x4bb9a5;
          }
          if (_0x4823db === "intensity") {
            _0x591308.intensity = Math.max(0, Number.isFinite(_0x105c79) ? _0x105c79 : 1);
          }
          if (_0x4823db === "distance") {
            _0x591308.distance = Math.max(0, Number.isFinite(_0x105c79) ? _0x105c79 : 0);
          }
          if (_0x4823db === "decay") {
            _0x591308.decay = Math.max(0, Number.isFinite(_0x105c79) ? _0x105c79 : 2);
          }
          if (_0x4823db === "angleDegrees") {
            _0x591308.angle = Math.max(1, Math.min(179, Number.isFinite(_0x105c79) ? _0x105c79 : 30)) * Math.PI / 180;
          }
          if (_0x4823db === "castShadow") {
            _0x591308.castShadow = _0x105c79 === true;
          }
          if (_0x4823db === "color" && /^#[0-9a-f]{6}$/i.test(_0x105c79)) {
            _0x591308.color = _0x105c79;
          }
          if (_0x4823db === "lightType" && ["ambient", "directional", "point", "spot"].includes(_0x105c79)) {
            _0x591308.lightType = _0x105c79;
          }
          return _0x4bb9a5;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-prop-field]")) {
      const _0x3a2068 = _0xce6767.target.dataset.objectId;
      const _0x136379 = _0xce6767.target.getAttribute("data-storyboard-3d-prop-field");
      const _0x3042ec = _0xce6767.target.type === "checkbox" ? _0xce6767.target.checked : String(_0xce6767.target.value || "");
      this._executeMutation({
        type: "update-prop-" + _0x136379,
        label: "Update prop " + _0x136379,
        mutate: _0x40dc0f => {
          const _0x1e6f54 = _0x40dc0f.scenes.find(_0x2191b6 => _0x2191b6.id === _0x40dc0f.activeSceneId);
          const _0x41e818 = _0x1e6f54?.objects?.find(_0x37b572 => _0x37b572.id === _0x3a2068);
          if (_0x41e818?.type !== "prop") {
            return _0x40dc0f;
          }
          if (_0x136379 === "tint" && /^#[0-9a-f]{6}$/i.test(_0x3042ec)) {
            _0x41e818.tint = _0x3042ec;
          }
          if (["castShadow", "receiveShadow"].includes(_0x136379)) {
            _0x41e818[_0x136379] = _0x3042ec === true;
          }
          return _0x40dc0f;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-shot-field]")) {
      const _0x23ea60 = _0xce6767.target.getAttribute("data-storyboard-3d-shot-field");
      const _0x14e652 = _0xce6767.target.dataset.shotId;
      const _0x32338e = String(_0xce6767.target.value || "").trim();
      this._executeMutation({
        type: "update-shot-" + _0x23ea60,
        label: "Update shot " + _0x23ea60,
        mutate: _0x4e16be => {
          const _0x4f6dd8 = _0x4e16be.scenes.findIndex(_0x565e9e => _0x565e9e.id === _0x4e16be.activeSceneId);
          if (_0x4f6dd8 < 0) {
            return _0x4e16be;
          }
          const _0x32d5d3 = _0x4e16be.scenes[_0x4f6dd8];
          _0x4e16be.scenes[_0x4f6dd8] = _0x23ea60 === "name" ? renameStoryboard3DShot(_0x32d5d3, _0x14e652, _0x32338e) : describeStoryboard3DShot(_0x32d5d3, _0x14e652, _0x32338e);
          return _0x4e16be;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-ai-instruction]")) {
      this.aiController.setInstruction(_0xce6767.target.value);
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-scene-field]")) {
      const _0x28e8d2 = _0xce6767.target.getAttribute("data-storyboard-3d-scene-field");
      const _0x4f954f = _0xce6767.target.type === "checkbox" ? _0xce6767.target.checked : String(_0xce6767.target.value || "");
      this._executeMutation({
        type: "update-scene-" + _0x28e8d2,
        label: "Update scene " + _0x28e8d2,
        mutate: _0x45025b => {
          const _0x399221 = _0x45025b.scenes.find(_0x397b2d => _0x397b2d.id === _0x45025b.activeSceneId);
          if (!_0x399221) {
            return _0x45025b;
          }
          if (["showGrid", "showOutline", "enableShadows"].includes(_0x28e8d2)) {
            _0x399221.environment[_0x28e8d2] = _0x4f954f === true;
          }
          if (["empty", "outdoor", "indoor", "studio"].includes(_0x4f954f)) {
            return applyStoryboard3DEnvironmentPreset(_0x45025b, _0x399221.id, _0x4f954f, {
              overrides: {
                showGrid: _0x399221.environment.showGrid,
                showOutline: _0x399221.environment.showOutline,
                enableShadows: _0x399221.environment.enableShadows
              },
              now: Date.now()
            });
          }
          return _0x45025b;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-background-field]")) {
      const _0x41e65f = _0xce6767.target.getAttribute("data-storyboard-3d-background-field");
      const _0x5641a3 = _0x41e65f === "imageUrl" ? String(_0xce6767.target.value || "").trim() : Number(_0xce6767.target.value);
      this._executeMutation({
        type: "update-background-" + _0x41e65f,
        label: "Update background " + _0x41e65f,
        mutate: _0x41fd0 => {
          const _0x3a8a7a = _0x41fd0.scenes.find(_0x52948a => _0x52948a.id === _0x41fd0.activeSceneId);
          if (!_0x3a8a7a) {
            return _0x41fd0;
          }
          const _0x242b30 = _0x3a8a7a.shots?.find(_0x40b1c1 => _0x40b1c1.id === _0x3a8a7a.activeShotId);
          const _0x34ecb4 = normalizeStoryboard3DBackgroundCalibration(_0x3a8a7a.background);
          const _0x5d4b7d = _0x41e65f === "vanishingPointX" ? {
            vanishingPoint: [_0x5641a3, _0x34ecb4.vanishingPoint[1]]
          } : _0x41e65f === "vanishingPointY" ? {
            vanishingPoint: [_0x34ecb4.vanishingPoint[0], _0x5641a3]
          } : _0x41e65f === "imageOffsetX" ? {
            imageOffset: [_0x5641a3, _0x34ecb4.imageOffset[1]]
          } : _0x41e65f === "imageOffsetY" ? {
            imageOffset: [_0x34ecb4.imageOffset[0], _0x5641a3]
          } : {
            [_0x41e65f]: _0x5641a3
          };
          const _0x19fb00 = new Set(["horizontalFov", "verticalFov", "horizonY", "horizonSlope", "vanishingPointX", "cameraHeight"]);
          const _0x5ac960 = updateStoryboard3DBackgroundCalibration(_0x3a8a7a.background, {
            ..._0x5d4b7d,
            ...(_0x19fb00.has(_0x41e65f) ? {
              calibrationMethod: "manual",
              calibrationConfidence: 1
            } : {})
          });
          if (_0x5ac960.imageUrl && _0x5ac960.lockedCamera && _0x242b30) {
            const _0x3b5cdd = deriveStoryboard3DBackgroundCamera(_0x5ac960, _0x242b30.camera);
            setStoryboard3DShotInitialCamera(_0x3a8a7a, _0x242b30, _0x3b5cdd);
            _0x3a8a7a.background = setStoryboard3DBackgroundCameraLock(_0x5ac960, true, _0x242b30.camera);
          } else if (_0x5ac960.imageUrl) {
            _0x3a8a7a.background = _0x5ac960;
          } else {
            delete _0x3a8a7a.background;
          }
          return _0x41fd0;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-background-lock]")) {
      const _0x52bb5a = _0xce6767.target.checked === true;
      this._executeMutation({
        type: "set-background-camera-lock",
        label: _0x52bb5a ? "Lock background camera" : "Unlock background camera",
        mutate: _0x4c12f7 => {
          const _0xc282b9 = _0x4c12f7.scenes.find(_0x24c99a => _0x24c99a.id === _0x4c12f7.activeSceneId);
          const _0x19facb = _0xc282b9?.shots?.find(_0x16e89a => _0x16e89a.id === _0xc282b9.activeShotId);
          if (_0xc282b9?.background && _0x19facb?.camera) {
            const _0x33b478 = _0x52bb5a ? deriveStoryboard3DBackgroundCamera(_0xc282b9.background, _0x19facb.camera) : _0x19facb.camera;
            if (_0x52bb5a) {
              setStoryboard3DShotInitialCamera(_0xc282b9, _0x19facb, _0x33b478);
            }
            _0xc282b9.background = setStoryboard3DBackgroundCameraLock(_0xc282b9.background, _0x52bb5a, _0x33b478);
          }
          return _0x4c12f7;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-character-field]")) {
      const _0x1b2a9b = _0xce6767.target.dataset.objectId;
      const _0x590eec = _0xce6767.target.getAttribute("data-storyboard-3d-character-field");
      const _0x504049 = String(_0xce6767.target.value || "");
      this._executeMutation({
        type: "update-character",
        label: "Update character",
        mutate: _0x2b2c99 => {
          const _0x158d7f = _0x2b2c99.scenes.find(_0x416c64 => _0x416c64.id === _0x2b2c99.activeSceneId);
          const _0x44d310 = _0x158d7f?.objects?.find(_0x1c9b4b => _0x1c9b4b.id === _0x1b2a9b);
          if (_0x44d310?.type === "character" && ["bodyPresetId", "actionId", "leftHandPoseId", "rightHandPoseId", "hairId"].includes(_0x590eec)) {
            _0x44d310[_0x590eec] = _0x504049;
            if (_0x590eec === "actionId") {
              _0x44d310.actionTime = 0;
              _0x44d310.actionPlaying = false;
            }
          }
          return _0x2b2c99;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-character-attachments]")) {
      const _0x2795c5 = _0xce6767.target.dataset.objectId;
      const _0x21f240 = [...new Set(String(_0xce6767.target.value || "").split(",").map(_0x4b04f4 => _0x4b04f4.trim()).filter(Boolean))].slice(0, 32);
      this._executeMutation({
        type: "update-character-attachments",
        label: "Update character attachments",
        mutate: _0x2ccb84 => {
          const _0x1e9418 = _0x2ccb84.scenes.find(_0x171c87 => _0x171c87.id === _0x2ccb84.activeSceneId);
          const _0x35bbf3 = _0x1e9418?.objects?.find(_0x2d535f => _0x2d535f.id === _0x2795c5);
          if (_0x35bbf3?.type === "character") {
            _0x35bbf3.attachmentIds = _0x21f240;
          }
          return _0x2ccb84;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-transform-input]")) {
      const _0xaed923 = _0xce6767.target.dataset.objectId;
      const _0x23c139 = _0xce6767.target.dataset.transformField;
      const _0x43253c = Math.max(0, Math.min(2, Number(_0xce6767.target.dataset.transformAxis) || 0));
      const _0x329ae1 = this.projectStore.getSnapshot();
      const _0x55b5e0 = getActiveStoryboard3DScene(_0x329ae1);
      const _0x205b94 = _0x55b5e0?.objects?.find(_0xd1f37 => _0xd1f37.id === _0xaed923);
      if (!_0x205b94 || !["position", "rotation", "scale"].includes(_0x23c139) || !canStoryboard3DObjectEditTransformField(_0x205b94, _0x23c139)) {
        return;
      }
      const _0x23e4ff = structuredClone(_0x205b94.transform);
      const _0x3fbc06 = Number(_0xce6767.target.value);
      _0x23e4ff[_0x23c139][_0x43253c] = _0x23c139 === "scale" ? Math.max(0.001, Number.isFinite(_0x3fbc06) ? _0x3fbc06 : _0x23e4ff[_0x23c139][_0x43253c]) : _0x23c139 === "rotation" && Number.isFinite(_0x3fbc06) ? _0x3fbc06 * Math.PI / 180 : Number.isFinite(_0x3fbc06) ? _0x3fbc06 : _0x23e4ff[_0x23c139][_0x43253c];
      this._commitObjectTransforms({
        sceneId: _0x55b5e0.id,
        transforms: {
          [_0xaed923]: _0x23e4ff
        },
        activeTool: _0x23c139 === "position" ? "move" : _0x23c139 === "rotation" ? "rotate" : "scale",
        label: "Update " + _0x23c139
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-object-name]")) {
      const _0x4ec46 = _0xce6767.target.dataset.objectId;
      const _0x27ad85 = String(_0xce6767.target.value || "").trim();
      this._executeMutation({
        type: "rename-object",
        label: "Rename object",
        mutate: _0x326734 => {
          const _0xcab7d5 = _0x326734.scenes.find(_0x226f10 => _0x226f10.id === _0x326734.activeSceneId);
          const _0x3a3cd7 = _0xcab7d5?.objects?.find(_0xe7ec36 => _0xe7ec36.id === _0x4ec46);
          if (_0x3a3cd7 && _0x27ad85 && _0x3a3cd7.type === "camera") {
            const _0x3adb30 = _0xcab7d5.shots?.find(_0x50c2bd => _0x50c2bd.cameraId === _0x4ec46);
            if (_0x3adb30) {
              _0x3adb30.name = _0x27ad85.replace(/\s*摄像机$/, "").trim() || _0x27ad85;
              _0x3adb30.updatedAt = Date.now();
              syncStoryboard3DCameraObjectFromShot(_0xcab7d5, _0x3adb30);
            }
          } else if (_0x3a3cd7 && _0x27ad85) {
            _0x3a3cd7.name = _0x27ad85;
          }
          return _0x326734;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-object-parent]")) {
      const _0x59c677 = _0xce6767.target.dataset.objectId;
      const _0x5828ad = String(_0xce6767.target.value || "").trim() || null;
      try {
        this._executeMutation({
          type: "set-object-parent",
          label: "Set object parent",
          mutate: _0x4dbbf0 => {
            const _0x366b73 = _0x4dbbf0.scenes.findIndex(_0x1be2cd => _0x1be2cd.id === _0x4dbbf0.activeSceneId);
            if (_0x366b73 >= 0) {
              _0x4dbbf0.scenes[_0x366b73] = setStoryboard3DObjectParent(_0x4dbbf0.scenes[_0x366b73], _0x59c677, _0x5828ad);
            }
            return _0x4dbbf0;
          }
        });
      } catch (_0x1b44cf) {
        this._setMessage(_0x1b44cf?.message || String(_0x1b44cf));
        this._render();
      }
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-object-flag]")) {
      const _0x313e08 = _0xce6767.target.dataset.objectId;
      const _0x202095 = _0xce6767.target.getAttribute("data-storyboard-3d-object-flag");
      const _0x49a08a = _0xce6767.target.checked;
      this._executeMutation({
        type: "set-object-" + _0x202095,
        label: "Set object " + _0x202095,
        mutate: _0x16e20d => {
          const _0x997a1b = _0x16e20d.scenes.find(_0x594b8a => _0x594b8a.id === _0x16e20d.activeSceneId);
          const _0x35c2fb = _0x997a1b?.objects?.find(_0x4e810b => _0x4e810b.id === _0x313e08);
          if (_0x35c2fb && ["visible", "locked"].includes(_0x202095)) {
            _0x35c2fb[_0x202095] = _0x49a08a;
          }
          return _0x16e20d;
        }
      });
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-project-name]")) {
      const _0x43ef4c = this.projectStore.renameProject(_0xce6767.target.value);
      _0xce6767.target.value = _0x43ef4c.name;
      this._render();
      return;
    }
    if (_0xce6767.target?.matches?.("[data-storyboard-3d-model-input]")) {
      const _0x34f901 = [...(_0xce6767.target.files || [])];
      _0xce6767.target.value = "";
      const _0x1caf52 = _0x34f901.find(_0x43f42b => /\.(glb|gltf|fbx|obj|stl)$/i.test(_0x43f42b.name || ""));
      if (!_0x1caf52) {
        return;
      }
      try {
        this.modelImportJob?.cancel?.("开始新的模型导入");
        this.modelImportJob = createStoryboard3DModelImportJob({
          file: _0x1caf52,
          relatedFiles: _0x34f901.filter(_0x4f29d5 => _0x4f29d5 !== _0x1caf52),
          importOptions: {
            parsers: this.modelParsers
          },
          onStateChange: _0x1e287e => {
            this.modelImportState = _0x1e287e;
            this._syncModelImportStatus();
          }
        });
        this.modelImportState = this.modelImportJob.getSnapshot();
        this._render();
        const _0x4b4851 = await this.modelImportJob.start();
        if (!_0x4b4851) {
          this._render();
          return;
        }
        const _0x4ee41b = await applyStoryboard3DTexturePolicy(_0x4b4851.parsed.scene, {
          renderer: this.sceneRuntime?.bridge?.renderer
        });
        const _0x502f6f = await createCanonicalStoryboard3DAssetId(_0x1caf52);
        const _0x2d83e5 = await createStoryboard3DAssetRecord({
          file: _0x1caf52,
          format: _0x4b4851.format,
          parsed: _0x4b4851.parsed,
          normalization: _0x4b4851.normalization,
          canonicalAssetId: _0x502f6f,
          indexedDbReference: {
            databaseName: STORYBOARD_3D_BINARY_ASSET_DB_NAME,
            storeName: STORYBOARD_3D_BINARY_ASSET_STORE_NAME,
            key: _0x502f6f
          }
        });
        const _0x4d32b9 = _0x2d83e5.canonicalAssetId;
        const _0x3f7377 = this.assetLibrary.registerImported({
          id: _0x4d32b9,
          name: _0x1caf52.name.replace(/\.[^.]+$/, ""),
          tags: [_0x4b4851.format, "3d", "model"],
          source: {
            kind: "file",
            format: _0x4b4851.format,
            fileName: _0x1caf52.name,
            byteLength: _0x1caf52.size,
            fingerprint: _0x1caf52.name + ":" + _0x1caf52.size + ":" + (_0x1caf52.lastModified || 0)
          },
          normalization: _0x4b4851.normalization,
          assetRecord: _0x2d83e5,
          createdAt: Date.now()
        });
        await this.binaryAssetRepository.put({
          assetId: _0x4d32b9,
          kind: "model",
          descriptor: {
            assetDescriptor: _0x3f7377
          },
          primaryFile: _0x1caf52,
          relatedFiles: _0x34f901.filter(_0x39adba => _0x39adba !== _0x1caf52)
        });
        this._setImportedModelScene(_0x4d32b9, _0x4b4851.parsed.scene, _0x4b4851.normalization);
        let _0x3cb51b = "";
        this._executeMutation({
          type: "import-model",
          label: "Import " + _0x4b4851.format.toUpperCase() + " model",
          mutate: _0x234078 => {
            const _0x344525 = _0x234078.scenes.find(_0x3848cd => _0x3848cd.id === _0x234078.activeSceneId);
            if (!_0x344525) {
              return _0x234078;
            }
            _0x3cb51b = createLocalId("prop");
            _0x344525.objects.push({
              id: _0x3cb51b,
              type: "prop",
              name: _0x3f7377.name,
              assetId: _0x4d32b9,
              visible: true,
              locked: false,
              transform: {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
              },
              castShadow: true,
              receiveShadow: true
            });
            return _0x234078;
          }
        });
        this.assetLibrary.markUsed(_0x4d32b9);
        if (_0x3cb51b) {
          this._setSelectedObjects([_0x3cb51b], {
            openProperties: false
          });
        }
        const _0x37f59b = _0x4ee41b.optimized.length > 0 ? "，已优化 " + _0x4ee41b.optimized.length + " 张超限纹理" : "";
        this._setMessage(_0x1caf52.name + " 已解析并加入当前场景" + _0x37f59b + "。");
        this.modelImportState = this.modelImportJob.getSnapshot();
        this._render();
      } catch (_0x101aec) {
        this.modelImportState = this.modelImportJob?.getSnapshot?.() || this.modelImportState;
        this._setMessage(_0x101aec?.message || String(_0x101aec));
        this._render();
      }
      return;
    }
  }
  async load(_0x1dc74d) {
    const _0x36bea8 = this.projectStore.load(_0x1dc74d);
    this._render();
    return _0x36bea8;
  }
  async save() {
    return this.projectStore.save();
  }
  focusObject(_0x1e6f7c) {
    this._setSelectedObjects(_0x1e6f7c ? [_0x1e6f7c] : []);
  }
  undo() {
    return this.commandHistory.undo();
  }
  redo() {
    return this.commandHistory.redo();
  }
  async renderShot() {
    const _0x27d794 = getActiveStoryboard3DShot(this.projectStore.getSnapshot());
    if (!_0x27d794) {
      throw new Error("当前场景没有可渲染镜头。");
    }
    return this._renderShotFrame(_0x27d794, {
      width: 1920,
      height: 1080
    });
  }
  async exportStoryboard() {
    return this.exportController.open();
  }
  close({
    persist = true
  } = {}) {
    if (this._closed) {
      return;
    }
    this._closed = true;
    const _0xb5712b = persist ? this.projectStore.save() : this.projectStore.getSnapshot();
    const _0x570e9c = getActiveStoryboard3DScene(_0xb5712b);
    const _0x4d6624 = getActiveStoryboard3DShot(_0xb5712b);
    this._finishFlyMovement({
      clearKeys: true
    });
    this.exportController.destroy();
    this._aiModelSelectorController?.destroy?.();
    this._aiModelSelectorController = null;
    this.aiController.destroy();
    this.backgroundCalibrationInteraction?.destroy?.();
    this.backgroundCalibrationInteraction = null;
    this.shotTimelineController?.destroy?.();
    this.modelImportJob?.cancel?.("编辑器已关闭");
    this._clearShotCandidates();
    this.characterImagePoseController.dispose();
    this._disposeSceneRuntime();
    if (this._inspectorResize) {
      this._handleInspectorResizePointerUp({
        pointerId: this._inspectorResize.pointerId
      });
    }
    if (this._rightSidebarResize) {
      this._handleRightSidebarResizePointerUp({
        pointerId: this._rightSidebarResize.pointerId
      });
    }
    if (this._timelineResize) {
      this._handleTimelineResizePointerUp({
        pointerId: this._timelineResize.pointerId
      });
    }
    this._assetThumbnailObserver?.disconnect?.();
    this._assetThumbnailObserver = null;
    this.assetThumbnailRenderer?.dispose?.();
    this.assetThumbnailRenderer = null;
    this.importedModelScenes.forEach(_0x314d18 => {
      disposeCancelledStoryboard3DModelImportResult({
        parsed: {
          scene: _0x314d18
        }
      });
    });
    this.importedModelScenes.clear();
    this._packAssetLoads.clear();
    this._assetThumbnailLoads.clear();
    this._assetThumbnailFailures.clear();
    this.backgroundImageControllers.forEach(_0x5d7727 => _0x5d7727.dispose?.());
    this.backgroundImageControllers.clear();
    this.binaryAssetRepository.close();
    this.window?.removeEventListener?.("keydown", this._handleWindowKeyDown, true);
    this.window?.removeEventListener?.("keyup", this._handleWindowKeyUp, true);
    this.window?.removeEventListener?.("blur", this._handleWindowBlur);
    this.window?.removeEventListener?.("resize", this._syncServerAlertOffset);
    this._serverAlertMutationObserver?.disconnect?.();
    this._serverAlertResizeObserver?.disconnect?.();
    this._serverAlertMutationObserver = null;
    this._serverAlertResizeObserver = null;
    this.root?.removeEventListener?.("contextmenu", containWorkspaceContextMenu);
    this.root?.removeEventListener?.("click", this._handleClick);
    this.root?.removeEventListener?.("input", this._handleInput);
    this.root?.removeEventListener?.("change", this._handleChange);
    this.root?.removeEventListener?.("dragstart", this._handleOutlineDragStart);
    this.root?.removeEventListener?.("dragover", this._handleOutlineDragOver);
    this.root?.removeEventListener?.("drop", this._handleOutlineDrop);
    this.root?.removeEventListener?.("pointerdown", this._handleInspectorResizePointerDown);
    this.root?.removeEventListener?.("pointerdown", this._handleRightSidebarResizePointerDown);
    this.root?.removeEventListener?.("pointerdown", this._handleTimelineResizePointerDown);
    this.root?.removeEventListener?.("pointerdown", this._handleMiniMapPointerDown);
    this.root?.removeEventListener?.("wheel", this._handleMiniMapWheel);
    this.window?.removeEventListener?.("pointermove", this._handleMiniMapPointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleMiniMapPointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleMiniMapPointerUp, true);
    this.window?.removeEventListener?.("pointermove", this._handleMiniMapWindowMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleMiniMapWindowUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleMiniMapWindowUp, true);
    this.window?.removeEventListener?.("pointermove", this._handleInspectorResizePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleInspectorResizePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleInspectorResizePointerUp, true);
    this.window?.removeEventListener?.("pointermove", this._handleRightSidebarResizePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleRightSidebarResizePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleRightSidebarResizePointerUp, true);
    this.window?.removeEventListener?.("pointermove", this._handleTimelineResizePointerMove, true);
    this.window?.removeEventListener?.("pointerup", this._handleTimelineResizePointerUp, true);
    this.window?.removeEventListener?.("pointercancel", this._handleTimelineResizePointerUp, true);
    this.root?.remove?.();
    this.root = null;
    this.document?.body?.classList?.remove?.("storyboard-3d-editor-open");
    this.document?.body?.classList?.remove?.("storyboard-3d-timeline-resizing");
    this._unsubscribeProject?.();
    this._unsubscribeEditor?.();
    this.projectStore.destroy();
    this.editorStore.destroy();
    this.commandHistory.clear();
    const _0x5555a9 = {
      projectId: _0xb5712b.id,
      activeSceneId: _0x570e9c?.id || "",
      activeShotId: _0x4d6624?.id || "",
      previewUrl: _0x4d6624?.thumbnailUrl || ""
    };
    dispatchWorkspaceEvent(this.window, "storyboard-3d:editor-closed", _0x5555a9);
    this.onClose?.(_0x5555a9, _0xb5712b);
  }
}
export function openStoryboard3DEditor(_0x3992c2) {
  const _0x4be49d = new Storyboard3DEditorWorkspace(_0x3992c2);
  _0x4be49d.mount();
  return _0x4be49d;
}