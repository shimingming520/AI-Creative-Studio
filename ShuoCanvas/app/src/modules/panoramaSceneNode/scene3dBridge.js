import * as a1080_0x5849f5 from "./threeRuntime.js";
import { PANORAMA_SCENE_CAMERA_CONSTRAINTS, SCENE_DEFAULT_FOCAL_LENGTH_MM, SCENE_FOCAL_LENGTH_MAX_MM, SCENE_FOCAL_LENGTH_MIN_MM, computeAxisScaleFactor, computeAxisScaleFactorFromScreenDelta, focalLengthToFov, fovToFocalLength, computeConstrainedMoveDelta, computeSignedRotationDelta, computeStableGridSnap, dampAngle, dampScalar, forwardVectorFromYawPitch, computeUniformScaleFactor, cameraPoseToSceneViewFromReference, normalizeAngle, resolvePanoramaViewPose, resolveSceneCameraPose } from "../../core/panoramaSceneMath.js";
import { PANORAMA_SCENE_COLOR_TOKENS } from "./sceneNode.js";
import { applyPanoramaCharacterBonePose, capturePanoramaCharacterBoneBase, createPanoramaCharacterModelInstance, resolvePanoramaCharacterGender } from "./characterModelRegistry.js";
import { applyCharacterBodyProfile, captureCharacterModelBodyProfileBase } from "./characterBodyProfile.js";
import { resolveSceneAsset } from "./sceneAssetCatalog.js";
import { estimateSceneContentBounds, estimateSceneContentExtent, readSceneObjectFrame, readSceneSelectionFrame, resolvePointerDollyAnchor } from "./scene3dCameraNavigation.js";
import { applySceneAssetColors, createSceneAssetVisual } from "./scene3dProceduralAssetVisual.js";
import { loadPanoramaTextureSource } from "./scene3dPanoramaTexture.js";
import { abortPanoramaTextureLoad, cancelPanoramaFullLoad, loadPanoramaBridgeTexture, schedulePanoramaFullLoad } from "./scene3dPanoramaBridgeTexture.js";
import { applySelectionEmphasis, clamp01, createSelectionRing, normalizePanoramaTextureUrl, resolveThemeColor, resolveThemeColorValue } from "./scene3dTheme.js";
import { resolveAxisScreenDragMetric } from "./scene3dScreenProjection.js";
import { GIZMO_BASE_AXIS_LENGTH, GIZMO_BASE_PLANE_OFFSET, GIZMO_BASE_PLANE_SIZE, GIZMO_BASE_ROTATE_RADIUS, GIZMO_BASE_SCALE_LENGTH, GIZMO_MOVE_HEAD_LENGTH, GIZMO_MOVE_PICK_LENGTH, GIZMO_MOVE_SHAFT_LENGTH, GIZMO_SCALE_HEAD_SIZE, GIZMO_SCALE_PICK_LENGTH, GIZMO_SCALE_SHAFT_LENGTH, createScene3DGizmoVisual } from "./scene3dGizmoVisual.js";
import * as a1080_0x5d112d from "./scene3dViewProjection.js";
import { t } from "../../i18n/index.js";
function panoramaSceneText(_0x213aac, _0x5eef26 = {}) {
  return t("panoramaSceneNode." + _0x213aac, _0x5eef26);
}
const GRID_MINOR_STEP = 1;
const GRID_MAJOR_STEP = 10;
const GRID_BASE_SPAN = 220;
const GRID_SNAP_HYSTERESIS = 0.12;
const VIEW_DAMPING_TIME_CONSTANT_MS = 120;
const VIEW_DAMPING_WINDOW_MS = 220;
const VIEW_DAMPING_MAX_DT_MS = 64;
const POSE_SETTLE_EPSILON = 0.0005;
const GIZMO_MARGIN_WORLD_MIN = 0.12;
const GIZMO_MARGIN_WORLD_RATIO = 0.12;
const DEFAULT_BG_FALLBACK = {
  day: "--white-90",
  night: "--bg"
};
function createLineGeometry(_0x130f34, _0x40fd9c) {
  return new a1080_0x5849f5.BufferGeometry().setFromPoints([_0x130f34, _0x40fd9c]);
}
function setLineGeometryPoints(_0x25212f, _0x1ed44e, _0x164363) {
  if (!_0x25212f?.geometry) {
    return;
  }
  const _0x44aa64 = _0x1ed44e?.isVector3 ? _0x1ed44e : toVector3Like(_0x1ed44e);
  const _0xfc5ae8 = _0x164363?.isVector3 ? _0x164363 : toVector3Like(_0x164363);
  const _0x3d3d4b = _0x25212f.geometry.getAttribute("position");
  if (!_0x3d3d4b || _0x3d3d4b.count < 2) {
    _0x25212f.geometry.dispose?.();
    _0x25212f.geometry = createLineGeometry(_0x44aa64, _0xfc5ae8);
    return;
  }
  _0x3d3d4b.setXYZ(0, _0x44aa64.x, _0x44aa64.y, _0x44aa64.z);
  _0x3d3d4b.setXYZ(1, _0xfc5ae8.x, _0xfc5ae8.y, _0xfc5ae8.z);
  _0x3d3d4b.needsUpdate = true;
  _0x25212f.geometry.computeBoundingSphere?.();
  _0x25212f.geometry.computeBoundingBox?.();
}
function configureGizmoMaterial(_0x42355e, {
  transparent = false,
  opacity = 1
} = {}) {
  if (!_0x42355e) {
    return _0x42355e;
  }
  _0x42355e.transparent = transparent;
  if ("opacity" in _0x42355e) {
    _0x42355e.opacity = opacity;
  }
  _0x42355e.depthWrite = false;
  _0x42355e.depthTest = false;
  _0x42355e.toneMapped = false;
  _0x42355e.fog = false;
  return _0x42355e;
}
function configureGizmoObject(_0x1f04a8) {
  if (!_0x1f04a8) {
    return _0x1f04a8;
  }
  _0x1f04a8.frustumCulled = false;
  _0x1f04a8.renderOrder = 100;
  return _0x1f04a8;
}
function orientAxisHead(_0x10b34, _0x195d06) {
  if (!_0x10b34) {
    return;
  }
  _0x10b34.rotation.set(0, 0, 0);
  if (_0x195d06 === "x") {
    _0x10b34.rotation.z = -Math.PI / 2;
  }
  if (_0x195d06 === "z") {
    _0x10b34.rotation.x = Math.PI / 2;
  }
}
function setAxisLineEnd(_0x27c216, _0x44ab03, _0x32aef5) {
  if (!_0x27c216?.geometry) {
    return;
  }
  const _0x392286 = vectorFromAxisName(_0x44ab03);
  const _0x4a11b2 = Math.max(0, Number(_0x32aef5) || 0);
  const _0xa9a769 = _0x27c216.geometry.getAttribute("position");
  if (!_0xa9a769 || _0xa9a769.count < 2) {
    return;
  }
  _0xa9a769.setXYZ(0, 0, 0, 0);
  _0xa9a769.setXYZ(1, _0x392286.x * _0x4a11b2, _0x392286.y * _0x4a11b2, _0x392286.z * _0x4a11b2);
  _0xa9a769.needsUpdate = true;
  _0x27c216.geometry.computeBoundingSphere?.();
  _0x27c216.geometry.computeBoundingBox?.();
}
function setAxisHandleLayout(_0x1247ca, _0x1a6b46, _0x3adf2f = 0) {
  if (!_0x1247ca) {
    return;
  }
  const _0x3eb6a7 = _0x1247ca.userData?.axisName || _0x1247ca.axisName;
  if (!_0x3eb6a7) {
    return;
  }
  const _0x10db33 = vectorFromAxisName(_0x3eb6a7);
  const _0x1e28aa = Math.max(0, Number(_0x1a6b46) || 0);
  const _0x14d844 = Number(_0x3adf2f) || 0;
  _0x1247ca.position.copy(_0x10db33.multiplyScalar(_0x1e28aa + _0x14d844));
}
function createMoveAxis(_0x392e8d, _0x36e9af) {
  const _0x4be414 = _0x392e8d.isColor ? _0x392e8d.clone() : new a1080_0x5849f5.Color(_0x392e8d);
  const _0x1669cc = vectorFromAxisName(_0x36e9af);
  const _0x5704a9 = new a1080_0x5849f5.Group();
  configureGizmoObject(_0x5704a9);
  const _0x5a29f7 = configureGizmoMaterial(new a1080_0x5849f5.LineBasicMaterial({
    color: _0x4be414.clone(),
    transparent: true,
    opacity: 0.96
  }), {
    transparent: true,
    opacity: 0.96
  });
  const _0x3b32f8 = new a1080_0x5849f5.Line(createLineGeometry(new a1080_0x5849f5.Vector3(0, 0, 0), _0x1669cc.clone().multiplyScalar(GIZMO_MOVE_SHAFT_LENGTH)), _0x5a29f7);
  configureGizmoObject(_0x3b32f8);
  _0x5704a9.add(_0x3b32f8);
  const _0x310eda = configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
    color: _0x4be414.clone(),
    transparent: true,
    opacity: 0.98
  }), {
    transparent: true,
    opacity: 0.98
  });
  const _0x15089f = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.ConeGeometry(0.06, GIZMO_MOVE_HEAD_LENGTH, 14), _0x310eda);
  _0x15089f.userData.axisName = _0x36e9af;
  setAxisHandleLayout(_0x15089f, GIZMO_BASE_AXIS_LENGTH - GIZMO_MOVE_HEAD_LENGTH * 0.5, GIZMO_MOVE_HEAD_LENGTH * 0.5);
  orientAxisHead(_0x15089f, _0x36e9af);
  configureGizmoObject(_0x15089f);
  _0x5704a9.add(_0x15089f);
  const _0x4e328a = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CylinderGeometry(0.14, 0.14, GIZMO_MOVE_PICK_LENGTH, 10), configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
    color: 16777215,
    transparent: true,
    opacity: 0,
    depthWrite: false
  }), {
    transparent: true,
    opacity: 0
  }));
  _0x4e328a.userData.axisName = _0x36e9af;
  setAxisHandleLayout(_0x4e328a, GIZMO_MOVE_PICK_LENGTH * 0.5);
  orientAxisHead(_0x4e328a, _0x36e9af);
  configureGizmoObject(_0x4e328a);
  _0x5704a9.add(_0x4e328a);
  return {
    axisName: _0x36e9af,
    axis: _0x1669cc.clone(),
    group: _0x5704a9,
    shaftLine: _0x3b32f8,
    headMesh: _0x15089f,
    visuals: [{
      material: _0x5a29f7,
      color: _0x4be414.clone(),
      opacity: 1
    }, {
      material: _0x310eda,
      color: _0x4be414.clone(),
      opacity: 1
    }],
    pickMesh: _0x4e328a
  };
}
function createScaleAxis(_0x543cee, _0x169eac) {
  const _0x1ef701 = _0x543cee.isColor ? _0x543cee.clone() : new a1080_0x5849f5.Color(_0x543cee);
  const _0x457e8a = vectorFromAxisName(_0x169eac);
  const _0x4f89d7 = new a1080_0x5849f5.Group();
  configureGizmoObject(_0x4f89d7);
  const _0x132178 = configureGizmoMaterial(new a1080_0x5849f5.LineBasicMaterial({
    color: _0x1ef701.clone(),
    transparent: true,
    opacity: 0.96
  }), {
    transparent: true,
    opacity: 0.96
  });
  const _0x349a5c = new a1080_0x5849f5.Line(createLineGeometry(new a1080_0x5849f5.Vector3(0, 0, 0), _0x457e8a.clone().multiplyScalar(GIZMO_SCALE_SHAFT_LENGTH)), _0x132178);
  configureGizmoObject(_0x349a5c);
  _0x4f89d7.add(_0x349a5c);
  const _0x2df863 = configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
    color: _0x1ef701.clone(),
    transparent: true,
    opacity: 0.98
  }), {
    transparent: true,
    opacity: 0.98
  });
  const _0x22a839 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.BoxGeometry(GIZMO_SCALE_HEAD_SIZE, GIZMO_SCALE_HEAD_SIZE, GIZMO_SCALE_HEAD_SIZE), _0x2df863);
  _0x22a839.userData.axisName = _0x169eac;
  setAxisHandleLayout(_0x22a839, GIZMO_BASE_SCALE_LENGTH - GIZMO_SCALE_HEAD_SIZE * 0.5, GIZMO_SCALE_HEAD_SIZE * 0.5);
  orientAxisHead(_0x22a839, _0x169eac);
  configureGizmoObject(_0x22a839);
  _0x4f89d7.add(_0x22a839);
  const _0xc8ebca = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CylinderGeometry(0.14, 0.14, GIZMO_SCALE_PICK_LENGTH, 10), configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
    color: 16777215,
    transparent: true,
    opacity: 0,
    depthWrite: false
  }), {
    transparent: true,
    opacity: 0
  }));
  _0xc8ebca.userData.axisName = _0x169eac;
  setAxisHandleLayout(_0xc8ebca, GIZMO_SCALE_PICK_LENGTH * 0.5);
  orientAxisHead(_0xc8ebca, _0x169eac);
  configureGizmoObject(_0xc8ebca);
  _0x4f89d7.add(_0xc8ebca);
  return {
    axisName: _0x169eac,
    axis: _0x457e8a.clone(),
    group: _0x4f89d7,
    shaftLine: _0x349a5c,
    headMesh: _0x22a839,
    visuals: [{
      material: _0x132178,
      color: _0x1ef701.clone(),
      opacity: 1
    }, {
      material: _0x2df863,
      color: _0x1ef701.clone(),
      opacity: 1
    }],
    pickMesh: _0xc8ebca
  };
}
function createRotateRing(_0x1e2c6d, _0x2f0d69) {
  const _0x47851c = _0x1e2c6d.isColor ? _0x1e2c6d.clone() : new a1080_0x5849f5.Color(_0x1e2c6d);
  const _0x2e219e = new a1080_0x5849f5.Group();
  configureGizmoObject(_0x2e219e);
  const _0x2431e1 = configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
    color: _0x47851c.clone(),
    transparent: true,
    opacity: 0.86,
    depthWrite: false
  }), {
    transparent: true,
    opacity: 0.86
  });
  const _0x53b4dc = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.TorusGeometry(GIZMO_BASE_ROTATE_RADIUS, 0.016, 8, 64), _0x2431e1);
  if (_0x2f0d69 === "x") {
    _0x53b4dc.rotation.y = Math.PI / 2;
  } else if (_0x2f0d69 === "y") {
    _0x53b4dc.rotation.x = Math.PI / 2;
  }
  configureGizmoObject(_0x53b4dc);
  _0x2e219e.add(_0x53b4dc);
  const _0x20c1c4 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.TorusGeometry(GIZMO_BASE_ROTATE_RADIUS, 0.11, 8, 64), configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
    color: 16777215,
    transparent: true,
    opacity: 0,
    depthWrite: false
  }), {
    transparent: true,
    opacity: 0
  }));
  _0x20c1c4.rotation.copy(_0x53b4dc.rotation);
  configureGizmoObject(_0x20c1c4);
  _0x2e219e.add(_0x20c1c4);
  return {
    axisName: _0x2f0d69,
    group: _0x2e219e,
    visuals: [{
      material: _0x2431e1,
      color: _0x47851c.clone(),
      opacity: 0.9
    }],
    pickMesh: _0x20c1c4
  };
}
function getPlaneCornerMetrics(_0x2873cf = GIZMO_BASE_PLANE_SIZE, _0x352ae7 = 0) {
  const _0x5bf4ff = _0x2873cf * 0.56;
  const _0x4bc701 = Math.max(_0x2873cf * 0.065, 0.012);
  const _0x38957c = _0x2873cf * 0.06;
  const _0x354733 = _0x2873cf * 0.5 - _0x38957c;
  const _0xad6c25 = _0x354733 - _0x5bf4ff;
  const _0x4eb765 = (_0x354733 + _0xad6c25) * 0.5;
  const _0x29aa37 = _0x4bc701 * 0.5 + _0x352ae7;
  const _0x149b8a = _0x5bf4ff * 0.46 - _0x352ae7 * 0.35;
  return {
    armLength: _0x5bf4ff,
    armThickness: _0x4bc701,
    cornerInset: _0x38957c,
    outer: _0x354733,
    inner: _0xad6c25,
    armCenter: _0x4eb765,
    halfThickness: _0x29aa37,
    diagonalStart: Math.max(_0xad6c25, _0xad6c25 + _0x149b8a),
    diagonalEnd: Math.max(_0xad6c25, _0xad6c25 + _0x149b8a)
  };
}
function createPlaneCornerPickGeometry(_0x19583d = GIZMO_BASE_PLANE_SIZE) {
  const _0xf49a91 = Math.max(_0x19583d * 0.018, 0.006);
  const _0x170e9f = getPlaneCornerMetrics(_0x19583d, _0xf49a91);
  const _0x23e79b = new a1080_0x5849f5.Shape();
  _0x23e79b.moveTo(_0x170e9f.inner - _0xf49a91, _0x170e9f.outer + _0x170e9f.halfThickness);
  _0x23e79b.lineTo(_0x170e9f.outer + _0x170e9f.halfThickness, _0x170e9f.outer + _0x170e9f.halfThickness);
  _0x23e79b.lineTo(_0x170e9f.outer + _0x170e9f.halfThickness, _0x170e9f.inner - _0xf49a91);
  _0x23e79b.lineTo(_0x170e9f.outer - _0x170e9f.halfThickness, _0x170e9f.inner - _0xf49a91);
  _0x23e79b.lineTo(_0x170e9f.outer - _0x170e9f.halfThickness, _0x170e9f.diagonalEnd - _0xf49a91);
  _0x23e79b.lineTo(_0x170e9f.diagonalStart - _0xf49a91, _0x170e9f.outer - _0x170e9f.halfThickness);
  _0x23e79b.lineTo(_0x170e9f.inner - _0xf49a91, _0x170e9f.outer - _0x170e9f.halfThickness);
  _0x23e79b.closePath();
  return new a1080_0x5849f5.ShapeGeometry(_0x23e79b);
}
function createPlaneCornerVisual({
  horizontalColor: _0x16efee,
  verticalColor: _0x52af80
} = {}, _0x1a2315 = GIZMO_BASE_PLANE_SIZE) {
  const _0x451c08 = _0x16efee?.isColor ? _0x16efee.clone() : _0x16efee ? new a1080_0x5849f5.Color(_0x16efee) : resolveThemeColor("--white", "--white");
  const _0x2e89c8 = _0x52af80?.isColor ? _0x52af80.clone() : _0x52af80 ? new a1080_0x5849f5.Color(_0x52af80) : resolveThemeColor("--white", "--white");
  const _0x491cd0 = new a1080_0x5849f5.Group();
  configureGizmoObject(_0x491cd0);
  const _0x335da7 = getPlaneCornerMetrics(_0x1a2315);
  const _0x3bb172 = [];
  const _0x3997e8 = _0x451c08.clone().lerp(_0x2e89c8, 0.5);
  const _0x1ffbd1 = (_0xadbbda, _0x303c81, _0x150cfe, _0x365c60, _0x3e819c) => {
    const _0x3f61ed = configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
      color: _0x3e819c.clone(),
      transparent: true,
      opacity: 0.98,
      side: a1080_0x5849f5.DoubleSide,
      depthWrite: false
    }), {
      transparent: true,
      opacity: 0.98
    });
    const _0x2cb78a = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.PlaneGeometry(_0xadbbda, _0x303c81), _0x3f61ed);
    _0x2cb78a.position.set(_0x150cfe, _0x365c60, 0);
    configureGizmoObject(_0x2cb78a);
    _0x491cd0.add(_0x2cb78a);
    _0x3bb172.push({
      material: _0x3f61ed,
      color: _0x3e819c.clone(),
      opacity: 0.98
    });
  };
  _0x1ffbd1(_0x335da7.armLength, _0x335da7.armThickness, _0x335da7.armCenter, _0x335da7.outer, _0x451c08);
  _0x1ffbd1(_0x335da7.armThickness, _0x335da7.armLength, _0x335da7.outer, _0x335da7.armCenter, _0x2e89c8);
  {
    const _0x2f3362 = configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
      color: _0x3997e8.clone(),
      transparent: true,
      opacity: 0.98,
      side: a1080_0x5849f5.DoubleSide,
      depthWrite: false
    }), {
      transparent: true,
      opacity: 0.98
    });
    const _0x27ed01 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.PlaneGeometry(_0x335da7.armThickness, _0x335da7.armThickness), _0x2f3362);
    _0x27ed01.position.set(_0x335da7.outer, _0x335da7.outer, 0);
    configureGizmoObject(_0x27ed01);
    _0x491cd0.add(_0x27ed01);
    _0x3bb172.push({
      material: _0x2f3362,
      color: _0x3997e8.clone(),
      opacity: 0.98
    });
  }
  {
    const _0x3a8155 = configureGizmoMaterial(new a1080_0x5849f5.MeshBasicMaterial({
      color: _0x3997e8,
      transparent: true,
      opacity: 0.38,
      side: a1080_0x5849f5.DoubleSide,
      depthWrite: false
    }), {
      transparent: true,
      opacity: 0.38
    });
    const _0x102e62 = new a1080_0x5849f5.BufferGeometry();
    const _0x515259 = _0x335da7.armThickness * 0.5;
    _0x102e62.setAttribute("position", new a1080_0x5849f5.Float32BufferAttribute([_0x335da7.diagonalStart, _0x335da7.outer - _0x515259, 0, _0x335da7.outer - _0x515259, _0x335da7.outer - _0x515259, 0, _0x335da7.outer - _0x515259, _0x335da7.diagonalEnd, 0], 3));
    _0x102e62.setIndex([0, 1, 2]);
    _0x102e62.computeVertexNormals();
    const _0xad8da5 = new a1080_0x5849f5.Mesh(_0x102e62, _0x3a8155);
    configureGizmoObject(_0xad8da5);
    _0x491cd0.add(_0xad8da5);
    _0x3bb172.push({
      material: _0x3a8155,
      color: _0x3997e8.clone(),
      opacity: 0.38
    });
  }
  return {
    group: _0x491cd0,
    visuals: _0x3bb172
  };
}
function eachMaterial(_0x1e5562, _0x29b846) {
  if (!_0x1e5562) {
    return;
  }
  if (Array.isArray(_0x1e5562)) {
    _0x1e5562.forEach(_0x3e7dac => _0x29b846(_0x3e7dac));
    return;
  }
  _0x29b846(_0x1e5562);
}
function createMannequinVisual(_0x29066d) {
  const _0x5dfb15 = new a1080_0x5849f5.Group();
  const _0x17a39f = new a1080_0x5849f5.Group();
  _0x5dfb15.add(_0x17a39f);
  const _0x1828e2 = [];
  const _0x54f6d3 = new a1080_0x5849f5.MeshStandardMaterial({
    color: _0x29066d,
    roughness: 0.62,
    metalness: 0.08
  });
  const _0x4098ce = _0x54f6d3.clone();
  _0x4098ce.color = _0x54f6d3.color.clone().offsetHSL(0, 0, 0.08);
  const _0x1737b3 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.SphereGeometry(0.155, 18, 16), _0x4098ce);
  _0x1737b3.position.y = 1.7;
  _0x1737b3.scale.set(0.96, 1.08, 0.94);
  _0x17a39f.add(_0x1737b3);
  _0x1828e2.push(_0x1737b3);
  const _0x4ebba1 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CylinderGeometry(0.052, 0.064, 0.12, 12), _0x54f6d3);
  _0x4ebba1.position.y = 1.51;
  _0x17a39f.add(_0x4ebba1);
  _0x1828e2.push(_0x4ebba1);
  const _0x5349a4 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.17, 0.42, 6, 12), _0x54f6d3);
  _0x5349a4.position.y = 1.26;
  _0x5349a4.scale.set(1.38, 1.02, 0.92);
  _0x17a39f.add(_0x5349a4);
  _0x1828e2.push(_0x5349a4);
  const _0x42f183 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.105, 0.18, 5, 10), _0x54f6d3);
  _0x42f183.position.y = 0.98;
  _0x42f183.scale.set(1.02, 0.94, 0.86);
  _0x17a39f.add(_0x42f183);
  _0x1828e2.push(_0x42f183);
  const _0x401cf6 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.14, 0.2, 5, 12), _0x54f6d3);
  _0x401cf6.position.y = 0.77;
  _0x401cf6.scale.set(1.28, 0.96, 0.98);
  _0x17a39f.add(_0x401cf6);
  _0x1828e2.push(_0x401cf6);
  const _0x1756e0 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.SphereGeometry(0.07, 12, 12), _0x54f6d3);
  _0x1756e0.position.set(-0.31, 1.43, 0);
  _0x17a39f.add(_0x1756e0);
  _0x1828e2.push(_0x1756e0);
  const _0x14da7b = _0x1756e0.clone();
  _0x14da7b.position.x = 0.31;
  _0x17a39f.add(_0x14da7b);
  _0x1828e2.push(_0x14da7b);
  const _0x3b7607 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.048, 0.28, 4, 10), _0x54f6d3);
  _0x3b7607.position.set(-0.39, 1.17, 0);
  _0x3b7607.rotation.z = 0.16;
  _0x3b7607.rotation.x = 0.03;
  _0x17a39f.add(_0x3b7607);
  _0x1828e2.push(_0x3b7607);
  const _0x22a5d1 = _0x3b7607.clone();
  _0x22a5d1.position.x = 0.39;
  _0x22a5d1.rotation.z = -0.16;
  _0x22a5d1.rotation.x = -0.03;
  _0x17a39f.add(_0x22a5d1);
  _0x1828e2.push(_0x22a5d1);
  const _0x2ee4e7 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.038, 0.26, 4, 10), _0x54f6d3);
  _0x2ee4e7.position.set(-0.42, 0.86, 0.01);
  _0x2ee4e7.rotation.z = 0.03;
  _0x2ee4e7.rotation.x = 0.04;
  _0x17a39f.add(_0x2ee4e7);
  _0x1828e2.push(_0x2ee4e7);
  const _0xacbf5d = _0x2ee4e7.clone();
  _0xacbf5d.position.x = 0.42;
  _0xacbf5d.rotation.z = -0.03;
  _0xacbf5d.rotation.x = -0.04;
  _0x17a39f.add(_0xacbf5d);
  _0x1828e2.push(_0xacbf5d);
  const _0x4d9218 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.SphereGeometry(0.048, 10, 10), _0x54f6d3);
  _0x4d9218.position.set(-0.425, 0.62, 0.01);
  _0x4d9218.scale.set(0.9, 1, 0.72);
  _0x17a39f.add(_0x4d9218);
  _0x1828e2.push(_0x4d9218);
  const _0x1ff8b3 = _0x4d9218.clone();
  _0x1ff8b3.position.x = 0.425;
  _0x17a39f.add(_0x1ff8b3);
  _0x1828e2.push(_0x1ff8b3);
  const _0x493e50 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.072, 0.34, 5, 12), _0x54f6d3);
  _0x493e50.position.set(-0.12, 0.47, 0);
  _0x493e50.rotation.z = 0.03;
  _0x17a39f.add(_0x493e50);
  _0x1828e2.push(_0x493e50);
  const _0x3910e5 = _0x493e50.clone();
  _0x3910e5.position.x = 0.12;
  _0x3910e5.rotation.z = -0.03;
  _0x17a39f.add(_0x3910e5);
  _0x1828e2.push(_0x3910e5);
  const _0x5844a6 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.CapsuleGeometry(0.055, 0.34, 5, 12), _0x54f6d3);
  _0x5844a6.position.set(-0.12, 0.03, 0.01);
  _0x17a39f.add(_0x5844a6);
  _0x1828e2.push(_0x5844a6);
  const _0x102092 = _0x5844a6.clone();
  _0x102092.position.x = 0.12;
  _0x17a39f.add(_0x102092);
  _0x1828e2.push(_0x102092);
  const _0x508c70 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.BoxGeometry(0.115, 0.075, 0.27), _0x54f6d3);
  _0x508c70.position.set(-0.12, -0.19, 0.07);
  _0x508c70.rotation.x = -0.08;
  _0x17a39f.add(_0x508c70);
  _0x1828e2.push(_0x508c70);
  const _0x502bd7 = _0x508c70.clone();
  _0x502bd7.position.x = 0.12;
  _0x17a39f.add(_0x502bd7);
  _0x1828e2.push(_0x502bd7);
  const _0x5819cc = createSelectionRing(8238335);
  _0x5dfb15.add(_0x5819cc);
  return {
    group: _0x5dfb15,
    material: _0x54f6d3,
    headMaterial: _0x4098ce,
    selectionRing: _0x5819cc,
    proxyRoot: _0x17a39f,
    fallbackObjects: _0x1828e2,
    modelGender: null,
    modelLoadToken: 0,
    modelRoot: null,
    modelBodyProfileBase: null,
    baseBonePose: null,
    appliedBonePoseSignature: "",
    parts: {
      head: _0x1737b3,
      neck: _0x4ebba1,
      chest: _0x5349a4,
      waist: _0x42f183,
      pelvis: _0x401cf6,
      shoulders: [_0x1756e0, _0x14da7b],
      upperArms: [_0x3b7607, _0x22a5d1],
      lowerArms: [_0x2ee4e7, _0xacbf5d],
      hands: [_0x4d9218, _0x1ff8b3],
      upperLegs: [_0x493e50, _0x3910e5],
      lowerLegs: [_0x5844a6, _0x102092],
      feet: [_0x508c70, _0x502bd7]
    }
  };
}
function setMannequinProxyMode(_0x5416e3) {
  (_0x5416e3?.fallbackObjects || []).forEach(_0x482d5c => {
    _0x482d5c.visible = true;
  });
  [_0x5416e3?.material, _0x5416e3?.headMaterial].forEach(_0x4dbc12 => {
    if (!_0x4dbc12) {
      return;
    }
    _0x4dbc12.transparent = true;
    _0x4dbc12.opacity = 0.001;
    _0x4dbc12.depthWrite = false;
    _0x4dbc12.colorWrite = false;
  });
}
function createCharacterClayMaterial(_0xe65209) {
  return new a1080_0x5849f5.MeshStandardMaterial({
    color: _0xe65209?.isColor ? _0xe65209.clone() : new a1080_0x5849f5.Color(_0xe65209 || 16777215),
    roughness: 0.78,
    metalness: 0
  });
}
function applyCharacterClayMaterial(_0x4b2b75, _0x21a0df) {
  if (!_0x4b2b75?.modelRoot) {
    return;
  }
  if (!_0x4b2b75.modelMaterial) {
    _0x4b2b75.modelMaterial = createCharacterClayMaterial(_0x21a0df);
    _0x4b2b75.modelRoot.traverse(_0x2a0563 => {
      if (!_0x2a0563.isMesh) {
        return;
      }
      disposeMaterial(_0x2a0563.material);
      _0x2a0563.material = _0x4b2b75.modelMaterial;
    });
  }
  _0x4b2b75.modelMaterial.color.copy(_0x21a0df?.isColor ? _0x21a0df : new a1080_0x5849f5.Color(_0x21a0df || 16777215));
}
function applyObjectSelectionEmphasis(_0x5eda19, _0x355136, _0x27130b = 0.12) {
  if (!_0x5eda19) {
    return;
  }
  _0x5eda19.traverse(_0x34c103 => {
    eachMaterial(_0x34c103.material, _0x5e03d2 => {
      applySelectionEmphasis(_0x5e03d2, _0x355136, _0x27130b);
    });
  });
}
function createCameraVisual() {
  const _0x40cfaa = new a1080_0x5849f5.Group();
  const _0x30a02a = new a1080_0x5849f5.Group();
  _0x40cfaa.add(_0x30a02a);
  const _0xafc609 = new a1080_0x5849f5.LineBasicMaterial({
    color: resolveThemeColor("--white", "--white"),
    transparent: true,
    opacity: 0.8
  });
  const _0x5f0de5 = new a1080_0x5849f5.LineBasicMaterial({
    color: resolveThemeColor("--blue", "--blue"),
    transparent: true,
    opacity: 0.8
  });
  const _0x4f82b3 = (_0x4edac0, _0x5f4179, _0x35e175, _0x3054fd) => new a1080_0x5849f5.LineSegments(new a1080_0x5849f5.EdgesGeometry(new a1080_0x5849f5.BoxGeometry(_0x4edac0, _0x5f4179, _0x35e175)), _0x3054fd);
  const _0x128c4c = _0x4f82b3(0.26, 0.16, 0.14, _0xafc609);
  _0x128c4c.position.set(0, 0, 0.075);
  _0x30a02a.add(_0x128c4c);
  const _0x119a3a = _0x4f82b3(0.1, 0.045, 0.06, _0xafc609);
  _0x119a3a.position.set(0, 0.102, 0.08);
  _0x30a02a.add(_0x119a3a);
  const _0x25bdbf = _0x4f82b3(0.06, 0.045, 0.08, _0xafc609);
  _0x25bdbf.position.set(-0.105, 0.05, 0.155);
  _0x30a02a.add(_0x25bdbf);
  const _0x4edf9e = _0x4f82b3(0.12, 0.09, 0.02, _0xafc609);
  _0x4edf9e.position.set(0, 0, -0.01);
  _0x30a02a.add(_0x4edf9e);
  const _0x357455 = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.BoxGeometry(0.42, 0.3, 0.72), new a1080_0x5849f5.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    colorWrite: false
  }));
  _0x357455.position.set(0, 0, -0.16);
  _0x30a02a.add(_0x357455);
  const _0x10d3b8 = new a1080_0x5849f5.BufferGeometry().setFromPoints([new a1080_0x5849f5.Vector3(-0.025, 0, 0), new a1080_0x5849f5.Vector3(0.025, 0, 0), new a1080_0x5849f5.Vector3(0, -0.025, 0), new a1080_0x5849f5.Vector3(0, 0.025, 0)]);
  _0x30a02a.add(new a1080_0x5849f5.LineSegments(_0x10d3b8, _0xafc609));
  const _0x347fbc = new a1080_0x5849f5.Vector3(0, 0, -0.02);
  const _0x54ee52 = 0.55;
  const _0x2396ab = 0.18;
  const _0xa8c6af = 0.1;
  const _0x414323 = _0x347fbc;
  const _0x5e3250 = new a1080_0x5849f5.Vector3(_0x347fbc.x - _0x2396ab, _0x347fbc.y + _0xa8c6af, _0x347fbc.z - _0x54ee52);
  const _0x5f1a06 = new a1080_0x5849f5.Vector3(_0x347fbc.x + _0x2396ab, _0x347fbc.y + _0xa8c6af, _0x347fbc.z - _0x54ee52);
  const _0x568389 = new a1080_0x5849f5.Vector3(_0x347fbc.x - _0x2396ab, _0x347fbc.y - _0xa8c6af, _0x347fbc.z - _0x54ee52);
  const _0x10fffa = new a1080_0x5849f5.Vector3(_0x347fbc.x + _0x2396ab, _0x347fbc.y - _0xa8c6af, _0x347fbc.z - _0x54ee52);
  const _0x29ddf1 = new a1080_0x5849f5.BufferGeometry().setFromPoints([_0x414323, _0x5e3250, _0x414323, _0x5f1a06, _0x414323, _0x568389, _0x414323, _0x10fffa, _0x5e3250, _0x5f1a06, _0x5f1a06, _0x10fffa, _0x10fffa, _0x568389, _0x568389, _0x5e3250]);
  const _0xcdf47b = new a1080_0x5849f5.LineSegments(_0x29ddf1, _0x5f0de5);
  _0x30a02a.add(_0xcdf47b);
  return {
    group: _0x40cfaa,
    marker: _0x30a02a,
    hitProxy: _0x357455,
    bodyMaterial: _0xafc609,
    helperLineMaterial: _0x5f0de5
  };
}
function applyGenderShape(_0x21d897, _0x3fabb0) {
  const _0x159b6c = _0x21d897?.parts;
  if (!_0x159b6c) {
    return;
  }
  const [_0x3c5737, _0x3c23f6] = _0x159b6c.shoulders || [];
  const [_0x2c72ae, _0x816733] = _0x159b6c.upperArms || [];
  const [_0x149042, _0x5b151e] = _0x159b6c.lowerArms || [];
  const [_0x105290, _0x322ede] = _0x159b6c.hands || [];
  const [_0x50b3d2, _0x4618ab] = _0x159b6c.upperLegs || [];
  const [_0x292b89, _0x1a60cc] = _0x159b6c.lowerLegs || [];
  const [_0x1f0f6e, _0x6f61ec] = _0x159b6c.feet || [];
  if (_0x3fabb0 === "female") {
    _0x159b6c.head?.scale.set(0.94, 1.08, 0.92);
    _0x159b6c.neck?.scale.set(0.92, 1, 0.92);
    _0x159b6c.chest?.scale.set(1.2, 0.98, 0.82);
    _0x159b6c.waist?.scale.set(0.84, 0.92, 0.72);
    _0x159b6c.pelvis?.scale.set(1.38, 0.98, 1.08);
    if (_0x3c5737) {
      _0x3c5737.position.set(-0.27, 1.42, 0);
    }
    if (_0x3c23f6) {
      _0x3c23f6.position.set(0.27, 1.42, 0);
    }
    if (_0x2c72ae) {
      _0x2c72ae.position.set(-0.34, 1.14, 0);
    }
    if (_0x816733) {
      _0x816733.position.set(0.34, 1.14, 0);
    }
    if (_0x149042) {
      _0x149042.position.set(-0.37, 0.84, 0.01);
    }
    if (_0x5b151e) {
      _0x5b151e.position.set(0.37, 0.84, 0.01);
    }
    if (_0x105290) {
      _0x105290.position.set(-0.375, 0.59, 0.01);
    }
    if (_0x322ede) {
      _0x322ede.position.set(0.375, 0.59, 0.01);
    }
    if (_0x50b3d2) {
      _0x50b3d2.position.set(-0.115, 0.45, 0);
      _0x50b3d2.scale.set(0.94, 1, 0.94);
    }
    if (_0x4618ab) {
      _0x4618ab.position.set(0.115, 0.45, 0);
      _0x4618ab.scale.set(0.94, 1, 0.94);
    }
    if (_0x292b89) {
      _0x292b89.position.set(-0.115, 0.01, 0.01);
      _0x292b89.scale.set(0.92, 1.02, 0.9);
    }
    if (_0x1a60cc) {
      _0x1a60cc.position.set(0.115, 0.01, 0.01);
      _0x1a60cc.scale.set(0.92, 1.02, 0.9);
    }
    if (_0x1f0f6e) {
      _0x1f0f6e.scale.set(0.88, 0.96, 0.95);
    }
    if (_0x6f61ec) {
      _0x6f61ec.scale.set(0.88, 0.96, 0.95);
    }
  } else {
    _0x159b6c.head?.scale.set(0.98, 1.08, 0.95);
    _0x159b6c.neck?.scale.set(1.02, 1, 1.02);
    _0x159b6c.chest?.scale.set(1.48, 1.04, 0.98);
    _0x159b6c.waist?.scale.set(1.02, 0.96, 0.84);
    _0x159b6c.pelvis?.scale.set(1.2, 0.94, 0.96);
    if (_0x3c5737) {
      _0x3c5737.position.set(-0.33, 1.44, 0);
    }
    if (_0x3c23f6) {
      _0x3c23f6.position.set(0.33, 1.44, 0);
    }
    if (_0x2c72ae) {
      _0x2c72ae.position.set(-0.42, 1.18, 0);
    }
    if (_0x816733) {
      _0x816733.position.set(0.42, 1.18, 0);
    }
    if (_0x149042) {
      _0x149042.position.set(-0.45, 0.87, 0.01);
    }
    if (_0x5b151e) {
      _0x5b151e.position.set(0.45, 0.87, 0.01);
    }
    if (_0x105290) {
      _0x105290.position.set(-0.455, 0.63, 0.01);
    }
    if (_0x322ede) {
      _0x322ede.position.set(0.455, 0.63, 0.01);
    }
    if (_0x50b3d2) {
      _0x50b3d2.position.set(-0.125, 0.47, 0);
      _0x50b3d2.scale.set(1.06, 1, 1.02);
    }
    if (_0x4618ab) {
      _0x4618ab.position.set(0.125, 0.47, 0);
      _0x4618ab.scale.set(1.06, 1, 1.02);
    }
    if (_0x292b89) {
      _0x292b89.position.set(-0.125, 0.03, 0.01);
      _0x292b89.scale.set(1, 1, 1);
    }
    if (_0x1a60cc) {
      _0x1a60cc.position.set(0.125, 0.03, 0.01);
      _0x1a60cc.scale.set(1, 1, 1);
    }
    if (_0x1f0f6e) {
      _0x1f0f6e.scale.set(1, 1, 1);
    }
    if (_0x6f61ec) {
      _0x6f61ec.scale.set(1, 1, 1);
    }
  }
}
function disposeMaterial(_0xf495cd) {
  if (!_0xf495cd) {
    return;
  }
  if (Array.isArray(_0xf495cd)) {
    _0xf495cd.forEach(disposeMaterial);
    return;
  }
  if (_0xf495cd.map) {
    _0xf495cd.map.dispose();
    _0xf495cd.map = null;
  }
  _0xf495cd.dispose?.();
}
function disposeObject3D(_0x41a3ff) {
  _0x41a3ff.traverse(_0x3a5152 => {
    _0x3a5152.geometry?.dispose?.();
    disposeMaterial(_0x3a5152.material);
  });
}
function vectorFromAxisName(_0x4d1e97) {
  if (_0x4d1e97 === "x") {
    return new a1080_0x5849f5.Vector3(1, 0, 0);
  }
  if (_0x4d1e97 === "y") {
    return new a1080_0x5849f5.Vector3(0, 1, 0);
  }
  return new a1080_0x5849f5.Vector3(0, 0, 1);
}
function toVector3Like(_0x189a47, _0x3fdec6 = {
  x: 0,
  y: 0,
  z: 0
}) {
  return new a1080_0x5849f5.Vector3(Number.isFinite(Number(_0x189a47?.x)) ? Number(_0x189a47.x) : Number(_0x3fdec6?.x) || 0, Number.isFinite(Number(_0x189a47?.y)) ? Number(_0x189a47.y) : Number(_0x3fdec6?.y) || 0, Number.isFinite(Number(_0x189a47?.z)) ? Number(_0x189a47.z) : Number(_0x3fdec6?.z) || 0);
}
function toEulerLike(_0x490fdb, _0x103a84 = {
  x: 0,
  y: 0,
  z: 0
}, _0x10fd05 = "XYZ") {
  return new a1080_0x5849f5.Euler(Number.isFinite(Number(_0x490fdb?.x)) ? Number(_0x490fdb.x) : Number(_0x103a84?.x) || 0, Number.isFinite(Number(_0x490fdb?.y)) ? Number(_0x490fdb.y) : Number(_0x103a84?.y) || 0, Number.isFinite(Number(_0x490fdb?.z)) ? Number(_0x490fdb.z) : Number(_0x103a84?.z) || 0, _0x10fd05);
}
function toScaleVector(_0x46cf6d) {
  if (Number.isFinite(_0x46cf6d)) {
    const _0x11dd60 = Math.max(0.01, Number(_0x46cf6d) || 1);
    return {
      x: _0x11dd60,
      y: _0x11dd60,
      z: _0x11dd60
    };
  }
  if (_0x46cf6d && Number.isFinite(_0x46cf6d.x) && Number.isFinite(_0x46cf6d.y) && Number.isFinite(_0x46cf6d.z)) {
    return {
      x: Math.max(0.01, Number(_0x46cf6d.x) || 1),
      y: Math.max(0.01, Number(_0x46cf6d.y) || 1),
      z: Math.max(0.01, Number(_0x46cf6d.z) || 1)
    };
  }
  return {
    x: 1,
    y: 1,
    z: 1
  };
}
function applyGroupScale(_0x49a442, _0x1b1316) {
  const _0x3ecd51 = toScaleVector(_0x1b1316);
  _0x49a442.scale.set(_0x3ecd51.x, _0x3ecd51.y, _0x3ecd51.z);
}
function applyGroupTransform(_0x243465, _0x560e47) {
  _0x243465.position.set(Number(_0x560e47?.position?.x) || 0, Number(_0x560e47?.position?.y) || 0, Number(_0x560e47?.position?.z) || 0);
  if (hasFiniteQuaternion(_0x560e47?.quaternion)) {
    const _0x4101de = normalizeQuaternionData(_0x560e47.quaternion, {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    });
    _0x243465.quaternion.set(_0x4101de.x, _0x4101de.y, _0x4101de.z, _0x4101de.w);
    return;
  }
  _0x243465.rotation.set(Number(_0x560e47?.rotation?.x) || 0, Number(_0x560e47?.rotation?.y) || 0, Number(_0x560e47?.rotation?.z) || 0);
}
function hasFiniteQuaternion(_0x39e775) {
  return Number.isFinite(Number(_0x39e775?.x)) && Number.isFinite(Number(_0x39e775?.y)) && Number.isFinite(Number(_0x39e775?.z)) && Number.isFinite(Number(_0x39e775?.w));
}
function normalizeQuaternionData(_0xdb6943, _0x5272a9 = {
  x: 0,
  y: 0,
  z: 0,
  w: 1
}) {
  const _0xfed945 = Number(_0xdb6943?.x);
  const _0x4817c8 = Number(_0xdb6943?.y);
  const _0x31d675 = Number(_0xdb6943?.z);
  const _0x1fc7f4 = Number(_0xdb6943?.w);
  if (!Number.isFinite(_0xfed945) || !Number.isFinite(_0x4817c8) || !Number.isFinite(_0x31d675) || !Number.isFinite(_0x1fc7f4)) {
    return {
      ..._0x5272a9
    };
  }
  const _0x798fc3 = Math.hypot(_0xfed945, _0x4817c8, _0x31d675, _0x1fc7f4);
  if (_0x798fc3 < 0.000001) {
    return {
      ..._0x5272a9
    };
  }
  return {
    x: _0xfed945 / _0x798fc3,
    y: _0x4817c8 / _0x798fc3,
    z: _0x31d675 / _0x798fc3,
    w: _0x1fc7f4 / _0x798fc3
  };
}
function toQuaternionFromPose(_0x2e5699, _0x2db644 = {
  x: 0,
  y: 0,
  z: 0,
  w: 1
}, _0x2da982 = "XYZ") {
  if (hasFiniteQuaternion(_0x2e5699?.quaternion)) {
    const _0x48b6f7 = normalizeQuaternionData(_0x2e5699.quaternion, _0x2db644);
    return new a1080_0x5849f5.Quaternion(_0x48b6f7.x, _0x48b6f7.y, _0x48b6f7.z, _0x48b6f7.w);
  }
  const _0x452766 = toEulerLike(_0x2e5699?.rotation, {
    x: 0,
    y: 0,
    z: 0
  }, _0x2da982);
  return new a1080_0x5849f5.Quaternion().setFromEuler(_0x452766);
}
function composeMatrixFromPose(_0x2ae05f = {}, _0x2c0ac4 = "XYZ") {
  const _0x34ae93 = toVector3Like(_0x2ae05f?.position, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x4d343a = toQuaternionFromPose(_0x2ae05f, {
    x: 0,
    y: 0,
    z: 0,
    w: 1
  }, _0x2c0ac4);
  const _0x119ab7 = toVector3Like(toScaleVector(_0x2ae05f?.scale), {
    x: 1,
    y: 1,
    z: 1
  });
  return new a1080_0x5849f5.Matrix4().compose(_0x34ae93, _0x4d343a, _0x119ab7);
}
function quaternionFromRotationYXZ(_0x4b368e) {
  const _0x419dd7 = new a1080_0x5849f5.Quaternion().setFromEuler(new a1080_0x5849f5.Euler(Number(_0x4b368e?.x) || 0, Number(_0x4b368e?.y) || 0, Number(_0x4b368e?.z) || 0, "YXZ"));
  return normalizeQuaternionData(_0x419dd7);
}
function resolveObjectPivot(_0x2584de, _0x76863a) {
  if (Number.isFinite(Number(_0x2584de?.pivot?.x)) && Number.isFinite(Number(_0x2584de?.pivot?.y)) && Number.isFinite(Number(_0x2584de?.pivot?.z))) {
    return toVector3Like(_0x2584de.pivot);
  }
  if (_0x2584de) {
    const _0x2e6f6c = composeMatrixFromPose(_0x2584de);
    const _0x3b0b7c = new a1080_0x5849f5.Vector3();
    _0x3b0b7c.setFromMatrixPosition(_0x2e6f6c);
    return _0x3b0b7c;
  }
  if (_0x76863a?.group) {
    const _0xbe15c9 = new a1080_0x5849f5.Vector3();
    _0x76863a.group.getWorldPosition(_0xbe15c9);
    return _0xbe15c9;
  }
  return new a1080_0x5849f5.Vector3();
}
function resolveActiveTransformTool(_0x5d4164) {
  const _0x417a77 = String(_0x5d4164?.ui?.transformTool || "").trim();
  if (_0x417a77 === "move" || _0x417a77 === "rotate" || _0x417a77 === "scale") {
    return _0x417a77;
  }
  const _0x565b7f = String(_0x5d4164?.ui?.activeTool || "").trim();
  if (_0x565b7f === "move" || _0x565b7f === "rotate" || _0x565b7f === "scale") {
    return _0x565b7f;
  }
  return "move";
}
function resolveObjectOrientationQuaternion(_0x3da97a, _0x1070d8) {
  if (_0x1070d8?.group) {
    const _0x2d380d = new a1080_0x5849f5.Quaternion();
    _0x1070d8.group.getWorldQuaternion(_0x2d380d);
    return _0x2d380d;
  }
  return toQuaternionFromPose(_0x3da97a, {
    x: 0,
    y: 0,
    z: 0,
    w: 1
  });
}
function areOrientationQuaternionsAligned(_0x43f984, _0x3f8142, _0x531a94 = 0.00001) {
  if (!_0x43f984 || !_0x3f8142) {
    return false;
  }
  const _0xa8f289 = Math.abs((Number(_0x43f984.x) || 0) * (Number(_0x3f8142.x) || 0) + (Number(_0x43f984.y) || 0) * (Number(_0x3f8142.y) || 0) + (Number(_0x43f984.z) || 0) * (Number(_0x3f8142.z) || 0) + (Number(_0x43f984.w) || 0) * (Number(_0x3f8142.w) || 0));
  return Math.abs(1 - _0xa8f289) <= _0x531a94;
}
function resolveSelectionGizmoOrientation(_0x136bdd, _0xbe3487, _0x7a932d) {
  const _0x2acc0c = _0xbe3487?.orientationQuaternion?.clone?.() || new a1080_0x5849f5.Quaternion();
  if (!_0x7a932d) {
    return {
      orientationQuaternion: _0x2acc0c,
      usesLocalOrientation: true
    };
  }
  const _0xfd1966 = _0x136bdd.length > 0 && _0x136bdd.every(_0x709261 => areOrientationQuaternionsAligned(_0x2acc0c, _0x709261.orientationQuaternion));
  return {
    orientationQuaternion: _0xfd1966 ? _0x2acc0c : new a1080_0x5849f5.Quaternion(),
    usesLocalOrientation: _0xfd1966
  };
}
function rotationFromQuaternionYXZ(_0x4324ea) {
  const _0xf89edd = normalizeQuaternionData(_0x4324ea);
  const _0x18e899 = new a1080_0x5849f5.Euler().setFromQuaternion(new a1080_0x5849f5.Quaternion(_0xf89edd.x, _0xf89edd.y, _0xf89edd.z, _0xf89edd.w), "YXZ");
  return {
    x: _0x18e899.x,
    y: _0x18e899.y,
    z: _0x18e899.z
  };
}
function normalizeCameraPoseData(_0xde2cfb = {}) {
  const _0x518977 = {
    x: Number(_0xde2cfb?.position?.x) || 0,
    y: Number(_0xde2cfb?.position?.y) || 0,
    z: Number(_0xde2cfb?.position?.z) || 0
  };
  const _0x459b94 = hasFiniteQuaternion(_0xde2cfb?.quaternion);
  const _0x293d0e = _0x459b94 ? normalizeQuaternionData(_0xde2cfb.quaternion, quaternionFromRotationYXZ(_0xde2cfb?.rotation)) : quaternionFromRotationYXZ(_0xde2cfb?.rotation);
  const _0x12f33b = _0x459b94 ? rotationFromQuaternionYXZ(_0x293d0e) : {
    x: Number(_0xde2cfb?.rotation?.x) || 0,
    y: Number(_0xde2cfb?.rotation?.y) || 0,
    z: Number(_0xde2cfb?.rotation?.z) || 0
  };
  return {
    position: _0x518977,
    quaternion: _0x293d0e,
    rotation: _0x12f33b,
    fov: Number.isFinite(Number(_0xde2cfb?.fov)) ? Number(_0xde2cfb.fov) : focalLengthToFov(Object.prototype.hasOwnProperty.call(_0xde2cfb || {}, "focalLength") ? _0xde2cfb.focalLength : SCENE_DEFAULT_FOCAL_LENGTH_MM),
    focalLength: Object.prototype.hasOwnProperty.call(_0xde2cfb || {}, "focalLength") ? Number(_0xde2cfb.focalLength) || SCENE_DEFAULT_FOCAL_LENGTH_MM : Number.isFinite(Number(_0xde2cfb?.fov)) ? fovToFocalLength(_0xde2cfb.fov) : SCENE_DEFAULT_FOCAL_LENGTH_MM
  };
}
function collectSelectedObjects(_0x3c958f) {
  const _0x20c911 = Array.isArray(_0x3c958f?.cubes) ? _0x3c958f.cubes : [];
  const _0x2d0128 = Array.isArray(_0x3c958f?.mannequins) ? _0x3c958f.mannequins : [];
  const _0xf61264 = Array.isArray(_0x3c958f?.cameras) ? _0x3c958f.cameras : [];
  const _0xb53240 = new Set(_0x20c911.map(_0x442297 => _0x442297.id));
  const _0x44063a = new Set(_0x2d0128.map(_0x19ffa6 => _0x19ffa6.id));
  const _0x389689 = new Set(_0xf61264.map(_0x3897fc => _0x3897fc.id));
  const _0x251b54 = new Set();
  const _0x583117 = [];
  const _0x359d74 = (_0x211932, _0x447de1) => {
    if (_0x211932 !== "cube" && _0x211932 !== "mannequin" && _0x211932 !== "camera") {
      return;
    }
    const _0x27551b = String(_0x447de1 || "").trim();
    if (!_0x27551b) {
      return;
    }
    const _0x2b5dfb = _0x211932 === "camera" ? _0x389689.has(_0x27551b) : _0x211932 === "cube" ? _0xb53240.has(_0x27551b) : _0x44063a.has(_0x27551b);
    if (!_0x2b5dfb) {
      return;
    }
    const _0x5b853c = _0x211932 + ":" + _0x27551b;
    if (_0x251b54.has(_0x5b853c)) {
      return;
    }
    _0x251b54.add(_0x5b853c);
    _0x583117.push({
      objectType: _0x211932,
      objectId: _0x27551b
    });
  };
  const _0x4a6fbf = Array.isArray(_0x3c958f?.selection?.selectedObjects) ? _0x3c958f.selection.selectedObjects : [];
  _0x4a6fbf.forEach(_0x532860 => {
    _0x359d74(_0x532860?.objectType, _0x532860?.objectId);
  });
  if (_0x583117.length > 0) {
    return _0x583117;
  }
  const _0x4d527e = _0x3c958f?.selection?.selectedGroupId || null;
  if (_0x4d527e) {
    const _0x5af27b = (_0x3c958f?.groups || []).find(_0x4c4449 => _0x4c4449.id === _0x4d527e);
    const _0x1f0825 = Array.isArray(_0x5af27b?.memberIds) ? _0x5af27b.memberIds : [];
    _0x1f0825.forEach(_0x405e02 => {
      _0x359d74("mannequin", _0x405e02);
    });
    if (_0x583117.length > 0) {
      return _0x583117;
    }
  }
  const _0x3126ab = _0x3c958f?.selection?.selectedObjectType === "cube" || _0x3c958f?.selection?.selectedObjectType === "mannequin" || _0x3c958f?.selection?.selectedObjectType === "camera" ? _0x3c958f.selection.selectedObjectType : null;
  if (!_0x3126ab) {
    return _0x583117;
  }
  const _0x5c5d92 = Array.isArray(_0x3c958f?.selection?.selectedObjectIds) ? _0x3c958f.selection.selectedObjectIds : [];
  if (_0x5c5d92.length > 0) {
    _0x5c5d92.forEach(_0x2ef662 => {
      _0x359d74(_0x3126ab, _0x2ef662);
    });
    if (_0x583117.length > 0) {
      return _0x583117;
    }
  }
  _0x359d74(_0x3126ab, _0x3c958f?.selection?.selectedObjectId || null);
  return _0x583117;
}
function collectSelectedObjectIds(_0x3711a3, _0x95121f) {
  return collectSelectedObjects(_0x3711a3).filter(_0x3093ea => _0x3093ea.objectType === _0x95121f).map(_0x47e8bd => _0x47e8bd.objectId);
}
function buildTransformSelectionSignature(_0x30df22) {
  const _0x4397e7 = collectSelectedObjects(_0x30df22);
  if (_0x4397e7.length === 0) {
    return "";
  }
  return _0x4397e7.map(_0x51f8ea => _0x51f8ea.objectType + ":" + _0x51f8ea.objectId).sort().join("|");
}
function cloneGizmoDisplayContext(_0x51e14f) {
  if (!_0x51e14f) {
    return null;
  }
  return {
    isMultiSelection: _0x51e14f.isMultiSelection === true,
    usesLocalOrientation: _0x51e14f.usesLocalOrientation === true,
    position: _0x51e14f.position?.clone?.() || new a1080_0x5849f5.Vector3(),
    orientationQuaternion: _0x51e14f.orientationQuaternion?.clone?.() || new a1080_0x5849f5.Quaternion(),
    bounds: {
      box: _0x51e14f.bounds?.box?.clone?.() || createFallbackBounds().box,
      size: _0x51e14f.bounds?.size?.clone?.() || new a1080_0x5849f5.Vector3(1, 1, 1),
      sphere: _0x51e14f.bounds?.sphere ? new a1080_0x5849f5.Sphere(_0x51e14f.bounds.sphere.center?.clone?.() || new a1080_0x5849f5.Vector3(), Number(_0x51e14f.bounds.sphere.radius) || 0) : new a1080_0x5849f5.Sphere(new a1080_0x5849f5.Vector3(0, 0.5, 0), Math.sqrt(0.75)),
      extents: {
        x: Number(_0x51e14f.bounds?.extents?.x) || 0,
        y: Number(_0x51e14f.bounds?.extents?.y) || 0,
        z: Number(_0x51e14f.bounds?.extents?.z) || 0
      }
    },
    gizmoWorldMetrics: {
      extents: {
        x: Number(_0x51e14f.gizmoWorldMetrics?.extents?.x) || 0,
        y: Number(_0x51e14f.gizmoWorldMetrics?.extents?.y) || 0,
        z: Number(_0x51e14f.gizmoWorldMetrics?.extents?.z) || 0
      },
      maxExtent: Number(_0x51e14f.gizmoWorldMetrics?.maxExtent) || 0.01,
      sphereRadius: Number(_0x51e14f.gizmoWorldMetrics?.sphereRadius) || 0.01,
      margin: Number(_0x51e14f.gizmoWorldMetrics?.margin) || GIZMO_MARGIN_WORLD_MIN
    }
  };
}
function measureVisualBounds(_0x581271) {
  if (_0x581271?.boundsBox?.isBox3 && !_0x581271.boundsBox.isEmpty()) {
    const _0x4a4d2c = _0x581271.boundsBox.clone();
    const _0x17d0cb = new a1080_0x5849f5.Vector3();
    const _0x4cef43 = new a1080_0x5849f5.Sphere();
    _0x4a4d2c.getSize(_0x17d0cb);
    _0x4a4d2c.getBoundingSphere(_0x4cef43);
    return {
      box: _0x4a4d2c,
      size: _0x17d0cb,
      sphere: _0x4cef43,
      extents: {
        x: Math.max(0, _0x17d0cb.x * 0.5),
        y: Math.max(0, _0x17d0cb.y * 0.5),
        z: Math.max(0, _0x17d0cb.z * 0.5)
      }
    };
  }
  const _0x50675f = _0x581271?.proxyRoot || _0x581271?.group;
  if (!_0x50675f) {
    return null;
  }
  const _0x536796 = new a1080_0x5849f5.Box3().setFromObject(_0x50675f);
  if (_0x536796.isEmpty()) {
    return null;
  }
  const _0x3364d6 = new a1080_0x5849f5.Vector3();
  const _0x407771 = new a1080_0x5849f5.Sphere();
  _0x536796.getSize(_0x3364d6);
  _0x536796.getBoundingSphere(_0x407771);
  return {
    box: _0x536796,
    size: _0x3364d6,
    sphere: _0x407771,
    extents: {
      x: Math.max(0, _0x3364d6.x * 0.5),
      y: Math.max(0, _0x3364d6.y * 0.5),
      z: Math.max(0, _0x3364d6.z * 0.5)
    }
  };
}
function resolveObjectToolPivot(_0xbffd0c, _0x5c673d) {
  return resolveObjectPivot(_0xbffd0c, _0x5c673d);
}
function measureVisualBoundsForSelection(_0x23a05e = []) {
  const _0x251a6e = new a1080_0x5849f5.Box3();
  let _0x1107c2 = false;
  _0x23a05e.forEach(_0x31a1b6 => {
    if (_0x31a1b6?.visual?.boundsBox?.isBox3 && !_0x31a1b6.visual.boundsBox.isEmpty()) {
      const _0x18fbb6 = _0x31a1b6.visual.boundsBox;
      if (!_0x1107c2) {
        _0x251a6e.copy(_0x18fbb6);
        _0x1107c2 = true;
        return;
      }
      _0x251a6e.union(_0x18fbb6);
      return;
    }
    const _0x5b7797 = _0x31a1b6?.visual?.proxyRoot || _0x31a1b6?.visual?.group;
    if (!_0x5b7797) {
      return;
    }
    const _0x712253 = new a1080_0x5849f5.Box3().setFromObject(_0x5b7797);
    if (_0x712253.isEmpty()) {
      return;
    }
    if (!_0x1107c2) {
      _0x251a6e.copy(_0x712253);
      _0x1107c2 = true;
      return;
    }
    _0x251a6e.union(_0x712253);
  });
  if (!_0x1107c2) {
    return null;
  }
  const _0x3fc244 = new a1080_0x5849f5.Vector3();
  const _0x159035 = new a1080_0x5849f5.Sphere();
  _0x251a6e.getSize(_0x3fc244);
  _0x251a6e.getBoundingSphere(_0x159035);
  return {
    box: _0x251a6e,
    size: _0x3fc244,
    sphere: _0x159035,
    extents: {
      x: Math.max(0, _0x3fc244.x * 0.5),
      y: Math.max(0, _0x3fc244.y * 0.5),
      z: Math.max(0, _0x3fc244.z * 0.5)
    }
  };
}
function createFallbackBounds() {
  return {
    box: new a1080_0x5849f5.Box3(new a1080_0x5849f5.Vector3(-0.5, 0, -0.5), new a1080_0x5849f5.Vector3(0.5, 1, 0.5)),
    size: new a1080_0x5849f5.Vector3(1, 1, 1),
    sphere: new a1080_0x5849f5.Sphere(new a1080_0x5849f5.Vector3(0, 0.5, 0), Math.sqrt(0.75)),
    extents: {
      x: 0.5,
      y: 0.5,
      z: 0.5
    }
  };
}
function computeGizmoWorldMetrics(_0x3028d8, _0x44c7e4) {
  const _0x410835 = _0x3028d8?.extents || {
    x: 0.5,
    y: 0.5,
    z: 0.5
  };
  const _0x5e8055 = _0x3028d8?.box;
  const _0x16fc4c = _0x5e8055 && !_0x5e8055.isEmpty?.() && _0x44c7e4;
  const _0x3330a2 = _0x16fc4c ? {
    x: Math.max(Math.abs(_0x5e8055.min.x - _0x44c7e4.x), Math.abs(_0x5e8055.max.x - _0x44c7e4.x)),
    y: Math.max(Math.abs(_0x5e8055.min.y - _0x44c7e4.y), Math.abs(_0x5e8055.max.y - _0x44c7e4.y)),
    z: Math.max(Math.abs(_0x5e8055.min.z - _0x44c7e4.z), Math.abs(_0x5e8055.max.z - _0x44c7e4.z))
  } : _0x410835;
  const _0x56ed13 = Math.max(0.01, Number(_0x3330a2.x) || 0, Number(_0x3330a2.y) || 0, Number(_0x3330a2.z) || 0);
  const _0xc3e3ce = Math.max(0.01, Number(_0x3028d8?.sphere?.radius) || 0.01);
  const _0x1c6a11 = Math.max(GIZMO_MARGIN_WORLD_MIN, _0xc3e3ce * GIZMO_MARGIN_WORLD_RATIO, _0x56ed13 * 0.18);
  return {
    extents: _0x3330a2,
    maxExtent: _0x56ed13,
    sphereRadius: _0xc3e3ce,
    margin: _0x1c6a11
  };
}
function cloneRenderPose(_0x43683c) {
  if (!_0x43683c) {
    return null;
  }
  if (_0x43683c.kind === "camera") {
    const _0x4cb686 = normalizeCameraPoseData(_0x43683c);
    return {
      kind: "camera",
      position: {
        ..._0x4cb686.position
      },
      quaternion: {
        ..._0x4cb686.quaternion
      },
      rotation: {
        ..._0x4cb686.rotation
      },
      fov: _0x4cb686.fov
    };
  }
  if (_0x43683c.kind === "panorama-default") {
    return {
      kind: "panorama-default",
      position: {
        ..._0x43683c.position
      },
      yaw: Number(_0x43683c.yaw) || 0,
      pitch: Number(_0x43683c.pitch) || 0,
      fov: Number(_0x43683c.fov) || 72
    };
  }
  return {
    kind: "scene-default",
    position: {
      ..._0x43683c.position
    },
    target: {
      ..._0x43683c.target
    },
    yaw: Number(_0x43683c.yaw) || 0,
    pitch: Number(_0x43683c.pitch) || 0,
    distance: Number(_0x43683c.distance) || 0,
    fov: Number(_0x43683c.fov) || 58
  };
}
function measurePoseDistance(_0x127fb3, _0x402c82) {
  if (!_0x127fb3 || !_0x402c82 || _0x127fb3.kind !== _0x402c82.kind) {
    return Number.POSITIVE_INFINITY;
  }
  if (_0x402c82.kind === "camera") {
    const _0x473d5a = normalizeCameraPoseData(_0x127fb3);
    const _0x509306 = normalizeCameraPoseData(_0x402c82);
    const _0x5d7b03 = Math.abs(_0x509306.position.x - _0x473d5a.position.x) + Math.abs(_0x509306.position.y - _0x473d5a.position.y) + Math.abs(_0x509306.position.z - _0x473d5a.position.z);
    const _0x5a5d8b = Math.abs(_0x509306.quaternion.x * _0x473d5a.quaternion.x + _0x509306.quaternion.y * _0x473d5a.quaternion.y + _0x509306.quaternion.z * _0x473d5a.quaternion.z + _0x509306.quaternion.w * _0x473d5a.quaternion.w);
    const _0x5a93be = 1 - Math.min(1, Math.max(0, _0x5a5d8b));
    return _0x5d7b03 + _0x5a93be + Math.abs(_0x509306.fov - _0x473d5a.fov);
  }
  if (_0x402c82.kind === "panorama-default") {
    const _0x4ce8da = Math.abs((_0x402c82.position?.x || 0) - (_0x127fb3.position?.x || 0)) + Math.abs((_0x402c82.position?.y || 0) - (_0x127fb3.position?.y || 0)) + Math.abs((_0x402c82.position?.z || 0) - (_0x127fb3.position?.z || 0));
    const _0x1bebdb = Math.abs((_0x402c82.yaw || 0) - (_0x127fb3.yaw || 0)) + Math.abs((_0x402c82.pitch || 0) - (_0x127fb3.pitch || 0));
    return _0x4ce8da + _0x1bebdb + Math.abs((_0x402c82.fov || 0) - (_0x127fb3.fov || 0));
  }
  const _0x70c7b8 = Math.abs((_0x402c82.position?.x || 0) - (_0x127fb3.position?.x || 0)) + Math.abs((_0x402c82.position?.y || 0) - (_0x127fb3.position?.y || 0)) + Math.abs((_0x402c82.position?.z || 0) - (_0x127fb3.position?.z || 0));
  const _0x36b737 = Math.abs((_0x402c82.target?.x || 0) - (_0x127fb3.target?.x || 0)) + Math.abs((_0x402c82.target?.y || 0) - (_0x127fb3.target?.y || 0)) + Math.abs((_0x402c82.target?.z || 0) - (_0x127fb3.target?.z || 0));
  return _0x70c7b8 + _0x36b737 + Math.abs((_0x402c82.fov || 0) - (_0x127fb3.fov || 0));
}
function areSceneViewsEquivalent(_0x96ccef, _0x27b0b1, _0x2cd85f = 0.00001) {
  if (!_0x96ccef || !_0x27b0b1) {
    return false;
  }
  const _0x5e7890 = _0x96ccef.target || {};
  const _0x4d1904 = _0x27b0b1.target || {};
  return Math.abs((Number(_0x5e7890.x) || 0) - (Number(_0x4d1904.x) || 0)) <= _0x2cd85f && Math.abs((Number(_0x5e7890.y) || 0) - (Number(_0x4d1904.y) || 0)) <= _0x2cd85f && Math.abs((Number(_0x5e7890.z) || 0) - (Number(_0x4d1904.z) || 0)) <= _0x2cd85f && Math.abs(normalizeAngle((Number(_0x96ccef.orbitYaw) || 0) - (Number(_0x27b0b1.orbitYaw) || 0))) <= _0x2cd85f && Math.abs((Number(_0x96ccef.orbitPitch) || 0) - (Number(_0x27b0b1.orbitPitch) || 0)) <= _0x2cd85f && Math.abs((Number(_0x96ccef.orbitDistance) || 0) - (Number(_0x27b0b1.orbitDistance) || 0)) <= _0x2cd85f;
}
export class PanoramaScene3DBridge {
  constructor({
    container: _0x1452c3,
    onPanoramaStatusChange: _0x24033c
  } = {}) {
    this.container = _0x1452c3;
    this.onPanoramaStatusChange = _0x24033c;
    this.scene = new a1080_0x5849f5.Scene();
    this.camera = new a1080_0x5849f5.PerspectiveCamera(55, 1, 0.1, 250);
    this.camera.rotation.order = "YXZ";
    this.renderer = new a1080_0x5849f5.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.renderer.sortObjects = true;
    this.renderer.outputColorSpace = a1080_0x5849f5.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearAlpha(0);
    this.renderer.domElement.className = "panorama-scene-webgl";
    this.renderer.domElement.draggable = false;
    this.container?.appendChild(this.renderer.domElement);
    this._ambientLight = new a1080_0x5849f5.AmbientLight(16777215, 0.88);
    this._keyLight = new a1080_0x5849f5.DirectionalLight(16777215, 1.05);
    this._keyLight.position.set(6, 10, 4);
    this._rimLight = new a1080_0x5849f5.DirectionalLight(8959743, 0.38);
    this._rimLight.position.set(-6, 8, -10);
    this.scene.add(this._ambientLight, this._keyLight, this._rimLight);
    const _0x13114f = resolveThemeColorValue("--panorama-scene-grid-night", "--indigo-35");
    this._gridMinor = new a1080_0x5849f5.GridHelper(GRID_BASE_SPAN, Math.round(GRID_BASE_SPAN / GRID_MINOR_STEP), _0x13114f, _0x13114f);
    eachMaterial(this._gridMinor.material, _0x1d37d3 => {
      _0x1d37d3.transparent = true;
      _0x1d37d3.opacity = 0.2;
      _0x1d37d3.depthWrite = false;
      _0x1d37d3.depthTest = true;
    });
    this._gridMinor.renderOrder = 1;
    this.scene.add(this._gridMinor);
    this._gridMajor = new a1080_0x5849f5.GridHelper(GRID_BASE_SPAN, Math.round(GRID_BASE_SPAN / GRID_MAJOR_STEP), _0x13114f, _0x13114f);
    eachMaterial(this._gridMajor.material, _0x4ba5c0 => {
      _0x4ba5c0.transparent = true;
      _0x4ba5c0.opacity = 0.34;
      _0x4ba5c0.depthWrite = false;
      _0x4ba5c0.depthTest = true;
    });
    this._gridMajor.renderOrder = 2;
    this.scene.add(this._gridMajor);
    this._ground = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.PlaneGeometry(1, 1), new a1080_0x5849f5.MeshBasicMaterial({
      color: resolveThemeColor("--panorama-scene-ground-night", "--indigo-12"),
      transparent: true,
      opacity: 0.1,
      side: a1080_0x5849f5.DoubleSide,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    }));
    this._ground.rotation.x = -Math.PI / 2;
    this._ground.position.y = -0.001;
    this._ground.renderOrder = 0;
    this.scene.add(this._ground);
    this._panoramaSphere = new a1080_0x5849f5.Mesh(new a1080_0x5849f5.SphereGeometry(60, 48, 32), new a1080_0x5849f5.MeshBasicMaterial({
      color: 16777215,
      side: a1080_0x5849f5.BackSide
    }));
    this._panoramaSphere.visible = false;
    this.scene.add(this._panoramaSphere);
    this._textureLoader = new a1080_0x5849f5.TextureLoader();
    this._panoramaTextureSourceLoader = (_0x6d0bb6, _0x2211f8 = {}) => loadPanoramaTextureSource(_0x6d0bb6, {
      ..._0x2211f8,
      textureLoader: this._textureLoader
    });
    this._mannequinMap = new Map();
    this._mannequinStateById = new Map();
    this._cubeMap = new Map();
    this._cubeStateById = new Map();
    this._cameraMap = new Map();
    this._cameraStateById = new Map();
    this._visualOverrides = new Map();
    this._pickMap = new Map();
    this._pickRoots = [];
    this._sceneState = null;
    this._sceneContentExtent = 16;
    this._sceneContentBounds = {
      center: {
        x: 0,
        y: 0,
        z: 0
      },
      radius: 16
    };
    this._draftView = null;
    this._draftObjects = new Map();
    this._draftMannequinBonePoses = new Map();
    this._rafId = null;
    this._loadedPanoramaUrl = "";
    this._pendingPanoramaUrl = "";
    this._panoramaSourceKey = "";
    this._panoramaLoadToken = 0;
    this._panoramaTexture = null;
    this._panoramaTextureAbortController = null;
    this._panoramaFullLoadFrame = null;
    this._renderPose = null;
    this._defaultSceneFocalLength = SCENE_DEFAULT_FOCAL_LENGTH_MM;
    this._smoothedPose = null;
    this._lastRenderTime = 0;
    this._viewSmoothingUntil = 0;
    this._gridSnapState = {
      minorX: null,
      minorZ: null,
      majorX: null,
      majorZ: null
    };
    this._lastStableGizmoSelectionSignature = "";
    this._lastStableGizmoContext = null;
    this._gizmo = createScene3DGizmoVisual({
      configureGizmoMaterial: configureGizmoMaterial,
      configureGizmoObject: configureGizmoObject,
      createMoveAxis: createMoveAxis,
      createPlaneCornerPickGeometry: createPlaneCornerPickGeometry,
      createPlaneCornerVisual: createPlaneCornerVisual,
      createRotateRing: createRotateRing,
      createScaleAxis: createScaleAxis
    });
    this.scene.add(this._gizmo.root);
    this._gizmoMoveGuideLine = new a1080_0x5849f5.Line(createLineGeometry(new a1080_0x5849f5.Vector3(0, 0, 0), new a1080_0x5849f5.Vector3(0, 0, 0)), configureGizmoMaterial(new a1080_0x5849f5.LineBasicMaterial({
      color: resolveThemeColor("--white", "--white"),
      transparent: true,
      opacity: 0.76,
      depthWrite: false
    }), {
      transparent: true,
      opacity: 0.76
    }));
    configureGizmoObject(this._gizmoMoveGuideLine);
    this._gizmoMoveGuideLine.visible = false;
    this._gizmoMoveGuideLine.renderOrder = 3;
    this.scene.add(this._gizmoMoveGuideLine);
    this.resize(640, 360);
    this.requestRender();
  }
  resize(_0x2927b4, _0x40916d) {
    const _0x4797e2 = Math.max(1, Math.floor(_0x2927b4 || this.container?.clientWidth || 1));
    const _0x3b2bd9 = Math.max(1, Math.floor(_0x40916d || this.container?.clientHeight || 1));
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    a1080_0x5d112d.resizeBridgeViewProjection(this, _0x4797e2, _0x3b2bd9);
    this.renderer.setSize(_0x4797e2, _0x3b2bd9, false);
    this.requestRender();
  }
  setViewProjection(_0x2b5bf3 = "perspective", _0x41b2a2 = {}) {
    const _0x4b7dbd = a1080_0x5d112d.switchBridgeViewProjection(this, _0x2b5bf3, _0x41b2a2);
    this.requestRender();
    return _0x4b7dbd;
  }
  readViewProjection() {
    return a1080_0x5d112d.readBridgeViewProjection(this);
  }
  setGridVisible(_0x52a59d) {
    this._gridVisible = _0x52a59d !== false;
    this._syncPanoramaModeVisibility(this._isPanorama360Mode());
    this.requestRender();
  }
  setGroundFillVisible(_0x3acb8c) {
    this._groundFillVisible = _0x3acb8c !== false;
    this._syncPanoramaModeVisibility(this._isPanorama360Mode());
    this.requestRender();
  }
  _isPanorama360Mode(_0x1e0cf6 = this._sceneState) {
    return _0x1e0cf6?.type === "panorama-360";
  }
  setDraftView(_0x2f69bf) {
    this._draftView = _0x2f69bf || null;
    this.requestRender();
  }
  setDefaultSceneFocalLength(_0x517cd9) {
    const _0x39a52d = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.focalLength;
    this._defaultSceneFocalLength = Math.max(_0x39a52d.min, Math.min(_0x39a52d.max, Number(_0x517cd9) || _0x39a52d.default));
    this.requestRender();
  }
  getDefaultSceneFocalLength() {
    return this._defaultSceneFocalLength;
  }
  clearDraftView() {
    this._draftView = null;
    this.requestRender();
  }
  setDraftObjectTransform(_0x1a9b69, _0x50724a, _0xdf0ad3) {
    const _0xd00ab1 = _0x1a9b69 + ":" + _0x50724a;
    const _0x3a697e = hasFiniteQuaternion(_0xdf0ad3?.quaternion) ? normalizeQuaternionData(_0xdf0ad3.quaternion, {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    }) : _0x1a9b69 === "camera" ? normalizeCameraPoseData(_0xdf0ad3).quaternion : undefined;
    this._draftObjects.set(_0xd00ab1, {
      position: {
        ..._0xdf0ad3.position
      },
      rotation: {
        ..._0xdf0ad3.rotation
      },
      quaternion: _0x3a697e,
      scale: Number.isFinite(_0xdf0ad3?.scale) || _0xdf0ad3?.scale && Number.isFinite(_0xdf0ad3.scale.x) && Number.isFinite(_0xdf0ad3.scale.y) && Number.isFinite(_0xdf0ad3.scale.z) ? _0xdf0ad3.scale : undefined
    });
    this.requestRender();
  }
  setObjectVisualOverride(_0x4110b2, _0x38458e, _0x39b4b3) {
    const _0x1902b3 = String(_0x4110b2 || "").trim();
    const _0x4a09ac = String(_0x38458e || "").trim();
    if (!_0x1902b3 || !_0x4a09ac || !_0x39b4b3?.group) {
      return false;
    }
    this._visualOverrides.set(_0x1902b3 + ":" + _0x4a09ac, _0x39b4b3);
    this.requestRender();
    return true;
  }
  clearObjectVisualOverride(_0x288a1c, _0x1618f5) {
    const _0x470bec = String(_0x288a1c || "").trim() + ":" + String(_0x1618f5 || "").trim();
    const _0x9b2fba = this._visualOverrides.delete(_0x470bec);
    if (_0x9b2fba) {
      this.requestRender();
    }
    return _0x9b2fba;
  }
  clearDraftObjectTransform(_0x3467bb, _0x570e30) {
    this._draftObjects.delete(_0x3467bb + ":" + _0x570e30);
    this.requestRender();
  }
  setDraftMannequinBonePose(_0xa97945, _0x17d01f) {
    const _0x2df258 = String(_0xa97945 || "").trim();
    if (!_0x2df258) {
      return;
    }
    this._draftMannequinBonePoses.set(_0x2df258, _0x17d01f || {});
    const _0x3f8822 = this._mannequinMap.get(_0x2df258);
    if (_0x3f8822?.modelRoot && _0x3f8822.baseBonePose) {
      applyPanoramaCharacterBonePose(_0x3f8822.modelRoot, _0x17d01f, _0x3f8822.baseBonePose);
      _0x3f8822.appliedBonePoseSignature = "draft:" + JSON.stringify(_0x17d01f || {});
    }
    this.requestRender();
  }
  clearDraftMannequinBonePose(_0x26ebc4) {
    const _0x1ad1ad = String(_0x26ebc4 || "").trim();
    this._draftMannequinBonePoses.delete(_0x1ad1ad);
    const _0x32738c = this._mannequinStateById.get(_0x1ad1ad);
    const _0x185d4c = this._mannequinMap.get(_0x1ad1ad);
    if (_0x32738c && _0x185d4c?.modelRoot && _0x185d4c.baseBonePose) {
      applyPanoramaCharacterBonePose(_0x185d4c.modelRoot, _0x32738c.bonePose, _0x185d4c.baseBonePose);
      _0x185d4c.appliedBonePoseSignature = JSON.stringify(_0x32738c.bonePose || {});
    }
    this.requestRender();
  }
  clearAllDrafts() {
    this._draftView = null;
    this._draftObjects.clear();
    this._draftMannequinBonePoses?.clear?.();
    this.clearGizmoMoveGuideLine();
    this.requestRender();
  }
  markViewSmoothingWindow(_0x58fd8d = VIEW_DAMPING_WINDOW_MS) {
    const _0x41bb06 = Math.max(0, Number(_0x58fd8d) || VIEW_DAMPING_WINDOW_MS);
    const _0x3c2b95 = performance.now();
    this._viewSmoothingUntil = Math.max(this._viewSmoothingUntil || 0, _0x3c2b95 + _0x41bb06);
  }
  readCurrentViewPose() {
    const _0xb39118 = new a1080_0x5849f5.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const _0x5a9b7f = a1080_0x5d112d.readBridgePerspectiveFov(this);
    return {
      position: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      },
      rotation: {
        x: this.camera.rotation.x,
        y: this.camera.rotation.y,
        z: this.camera.rotation.z
      },
      quaternion: {
        x: this.camera.quaternion.x,
        y: this.camera.quaternion.y,
        z: this.camera.quaternion.z,
        w: this.camera.quaternion.w
      },
      forward: {
        x: _0xb39118.x,
        y: _0xb39118.y,
        z: _0xb39118.z
      },
      yaw: Math.atan2(_0xb39118.x, _0xb39118.z),
      pitch: Math.asin(Math.max(-1, Math.min(1, _0xb39118.y))),
      fov: _0x5a9b7f,
      focalLength: fovToFocalLength(_0x5a9b7f),
      projection: this.readViewProjection()
    };
  }
  readObjectFrame(_0x2adc5, _0x11edec) {
    return readSceneObjectFrame({
      objectType: _0x2adc5,
      objectId: _0x11edec,
      cubeMap: this._cubeMap,
      mannequinMap: this._mannequinMap,
      cameraMap: this._cameraMap,
      camera: this.camera
    });
  }
  readSelectionFrame() {
    return readSceneSelectionFrame({
      selectionObjects: collectSelectedObjects(this._sceneState),
      cubeMap: this._cubeMap,
      mannequinMap: this._mannequinMap,
      cameraMap: this._cameraMap,
      camera: this.camera
    });
  }
  _resolvePointerRay(_0x12ee53, _0x550472) {
    const _0x25b8f3 = this.renderer.domElement.getBoundingClientRect();
    const _0x2e568c = new a1080_0x5849f5.Vector2((_0x12ee53 - _0x25b8f3.left) / _0x25b8f3.width * 2 - 1, -((_0x550472 - _0x25b8f3.top) / _0x25b8f3.height * 2 - 1));
    const _0x5bcfc6 = new a1080_0x5849f5.Raycaster();
    _0x5bcfc6.setFromCamera(_0x2e568c, this.camera);
    return _0x5bcfc6;
  }
  setGizmoHoverHandle(_0x4bc0d5) {
    const _0x460495 = _0x4bc0d5 || null;
    if ((this._gizmo?.hoverHandle || null) === _0x460495) {
      return;
    }
    this._gizmo.hoverHandle = _0x460495;
    this._applyGizmoHighlight();
    this.requestRender();
  }
  setGizmoActiveHandle(_0x46af63) {
    const _0x3668b3 = _0x46af63 || null;
    const _0x13b8ad = _0x3668b3 === null && this._gizmo?.dragLock;
    if ((this._gizmo?.activeHandle || null) === _0x3668b3 && !_0x13b8ad) {
      return;
    }
    this._gizmo.activeHandle = _0x3668b3;
    if (_0x3668b3 === null) {
      this._gizmo.dragLock = null;
    }
    this._applyGizmoHighlight();
    this.requestRender();
  }
  clearGizmoHandleState() {
    if (!this._gizmo) {
      return;
    }
    const _0x183cb0 = this._gizmo.hoverHandle || this._gizmo.activeHandle || this._gizmo.dragLock;
    this._gizmo.hoverHandle = null;
    this._gizmo.activeHandle = null;
    this._gizmo.dragLock = null;
    if (_0x183cb0) {
      this._applyGizmoHighlight();
      this.requestRender();
    }
  }
  setGizmoMoveGuideLine({
    from: _0x80df92,
    to: _0x464583
  } = {}) {
    const _0xa041a5 = this._gizmoMoveGuideLine;
    if (!_0xa041a5) {
      return;
    }
    const _0x544125 = toVector3Like(_0x80df92, {
      x: 0,
      y: 0,
      z: 0
    });
    const _0x4b48a9 = toVector3Like(_0x464583, _0x544125);
    setLineGeometryPoints(_0xa041a5, _0x544125, _0x4b48a9);
    _0xa041a5.visible = true;
    this.requestRender();
  }
  clearGizmoMoveGuideLine() {
    const _0x3de8e4 = this._gizmoMoveGuideLine;
    if (!_0x3de8e4?.visible) {
      return;
    }
    _0x3de8e4.visible = false;
    this.requestRender();
  }
  _clearStableGizmoContext() {
    this._lastStableGizmoSelectionSignature = "";
    this._lastStableGizmoContext = null;
  }
  _cacheStableGizmoContext(_0x2d97a6, _0x378ef9) {
    const _0x26390d = buildTransformSelectionSignature(_0x2d97a6);
    if (!_0x26390d || !_0x378ef9) {
      return;
    }
    this._lastStableGizmoSelectionSignature = _0x26390d;
    this._lastStableGizmoContext = cloneGizmoDisplayContext(_0x378ef9);
  }
  _resolveStableGizmoContext(_0x25c7ab) {
    const _0xd0da56 = buildTransformSelectionSignature(_0x25c7ab);
    if (!_0xd0da56) {
      return null;
    }
    if (_0xd0da56 !== this._lastStableGizmoSelectionSignature) {
      return null;
    }
    return this._lastStableGizmoContext || null;
  }
  pickGizmoHandle(_0x475d6b, _0x4475bd) {
    if (this._isPanorama360Mode()) {
      return null;
    }
    if (!this._gizmo?.root?.visible) {
      return null;
    }
    const _0x16d5cf = this._gizmo?.moveGroup?.visible || this._gizmo?.rotateGroup?.visible || this._gizmo?.scaleGroup?.visible;
    if (!_0x16d5cf) {
      return null;
    }
    const _0x1b97b6 = Array.isArray(this._gizmo.pickMeshes) ? this._gizmo.pickMeshes : [];
    if (_0x1b97b6.length === 0) {
      return null;
    }
    const _0x5a64c0 = this._resolvePointerRay(_0x475d6b, _0x4475bd);
    const _0x56a6d0 = _0x5a64c0.intersectObjects(_0x1b97b6, true);
    for (const _0x51637e of _0x56a6d0) {
      let _0x367111 = _0x51637e.object;
      while (_0x367111) {
        const _0x7c23e0 = _0x367111.userData?.gizmoHandleKey;
        if (_0x7c23e0) {
          const _0x1511b6 = this._gizmo.handles?.get?.(_0x7c23e0) || null;
          if (!_0x1511b6) {
            return null;
          }
          const _0x458f08 = this._gizmo?.currentTool || "move";
          const _0x2eba5e = _0x1511b6.mode === "scale-axis" || _0x1511b6.mode === "scale-plane" || _0x1511b6.mode === "scale-uniform";
          const _0x2acbde = _0x458f08 === "move" && (_0x1511b6.mode === "axis" || _0x1511b6.mode === "plane") || _0x458f08 === "rotate" && _0x1511b6.mode === "rotate" || _0x458f08 === "scale" && _0x2eba5e;
          if (!_0x2acbde) {
            _0x367111 = _0x367111.parent;
            continue;
          }
          return {
            kind: "gizmo-handle",
            handleKey: _0x7c23e0,
            mode: _0x1511b6.mode,
            axis: _0x1511b6.axis || null,
            normalAxis: _0x1511b6.normalAxis || null,
            linkedAxes: Array.isArray(_0x1511b6.linkedAxes) ? [..._0x1511b6.linkedAxes] : [],
            point: {
              x: _0x51637e.point.x,
              y: _0x51637e.point.y,
              z: _0x51637e.point.z
            }
          };
        }
        _0x367111 = _0x367111.parent;
      }
    }
    return null;
  }
  beginMoveGizmoDrag({
    handleKey: _0x122261,
    clientX: _0xf6f084,
    clientY: _0x41f14e
  } = {}) {
    if (!_0x122261) {
      return null;
    }
    const _0x17ba00 = this._gizmo?.handles?.get?.(_0x122261);
    if (!_0x17ba00) {
      return null;
    }
    const _0x51f510 = this._gizmo.root.position.clone();
    const _0x1ec280 = this._gizmo.root.quaternion.clone();
    const _0x235537 = _0x17ba00.mode === "axis" ? _0x17ba00.axis : _0x17ba00.normalAxis;
    if (!_0x235537) {
      return null;
    }
    const _0x33b9c3 = vectorFromAxisName(_0x235537).applyQuaternion(_0x1ec280).normalize();
    let _0x33b1bb = _0x33b9c3.clone();
    if (_0x17ba00.mode === "axis") {
      const _0x6ded68 = this.camera.getWorldDirection(new a1080_0x5849f5.Vector3()).normalize();
      const _0x1e3b23 = new a1080_0x5849f5.Vector3().crossVectors(_0x6ded68, _0x33b9c3);
      if (_0x1e3b23.lengthSq() < 0.00001) {
        _0x1e3b23.copy(new a1080_0x5849f5.Vector3(0, 1, 0).cross(_0x33b9c3));
        if (_0x1e3b23.lengthSq() < 0.00001) {
          _0x1e3b23.copy(new a1080_0x5849f5.Vector3(1, 0, 0).cross(_0x33b9c3));
        }
      }
      _0x33b1bb = new a1080_0x5849f5.Vector3().crossVectors(_0x33b9c3, _0x1e3b23).normalize();
    }
    if (_0x33b1bb.lengthSq() < 0.000001) {
      _0x33b1bb = new a1080_0x5849f5.Vector3(0, 1, 0);
    }
    const _0x2ab8fd = new a1080_0x5849f5.Plane().setFromNormalAndCoplanarPoint(_0x33b1bb, _0x51f510);
    const _0x3864f9 = this._resolvePointerRay(_0xf6f084, _0x41f14e);
    const _0x7de200 = new a1080_0x5849f5.Vector3();
    const _0x58a891 = _0x3864f9.ray.intersectPlane(_0x2ab8fd, _0x7de200);
    const _0x226134 = _0x58a891 ? _0x7de200.clone() : _0x51f510.clone();
    return {
      handleKey: _0x122261,
      mode: _0x17ba00.mode,
      constraint: _0x17ba00.mode === "axis" ? _0x17ba00.axis : (_0x17ba00.linkedAxes || []).join(""),
      axisName: _0x17ba00.mode === "axis" ? _0x17ba00.axis : null,
      axisWorld: _0x17ba00.mode === "axis" ? _0x33b9c3.clone() : null,
      axis: _0x17ba00.mode === "axis" ? _0x33b9c3.clone() : null,
      planeNormalWorld: _0x33b1bb.clone(),
      planeNormal: _0x33b1bb.clone(),
      pivot: _0x51f510.clone(),
      gizmoQuaternion: _0x1ec280.clone(),
      startPoint: _0x226134.clone(),
      dragPlane: _0x2ab8fd
    };
  }
  beginRotateGizmoDrag({
    handleKey: _0x33d224,
    clientX: _0x3cf2e7,
    clientY: _0x1749a9
  } = {}) {
    if (!_0x33d224) {
      return null;
    }
    const _0x447157 = this._gizmo?.handles?.get?.(_0x33d224);
    if (!_0x447157 || _0x447157.mode !== "rotate") {
      return null;
    }
    const _0x3e70eb = this._resolveGizmoContext(this._sceneState);
    if (!_0x3e70eb) {
      return null;
    }
    const _0x3bca9b = this._gizmo.root.position.clone();
    const _0x327ba0 = this._gizmo.root.quaternion.clone();
    const _0xd07c7a = vectorFromAxisName(_0x447157.axis).applyQuaternion(_0x327ba0).normalize();
    const _0x456434 = new a1080_0x5849f5.Plane().setFromNormalAndCoplanarPoint(_0xd07c7a, _0x3bca9b);
    const _0x4760df = this._resolvePointerRay(_0x3cf2e7, _0x1749a9);
    const _0xf34b4d = new a1080_0x5849f5.Vector3();
    const _0x2a3b72 = _0x4760df.ray.intersectPlane(_0x456434, _0xf34b4d);
    if (!_0x2a3b72) {
      return null;
    }
    this._captureGizmoDragLock(_0x3e70eb);
    return {
      handleKey: _0x33d224,
      mode: "rotate",
      constraint: _0x447157.axis,
      axisName: _0x447157.axis,
      axisWorld: _0xd07c7a.clone(),
      axis: _0xd07c7a.clone(),
      pivot: _0x3bca9b.clone(),
      gizmoQuaternion: _0x327ba0.clone(),
      dragPlane: _0x456434,
      startPoint: _0xf34b4d.clone()
    };
  }
  computeRotateGizmoAngle(_0x56388c, _0x1b1769) {
    if (!_0x56388c?.startPoint || !_0x1b1769) {
      return 0;
    }
    return computeSignedRotationDelta({
      startPoint: {
        x: _0x56388c.startPoint.x,
        y: _0x56388c.startPoint.y,
        z: _0x56388c.startPoint.z
      },
      currentPoint: _0x1b1769,
      pivot: {
        x: _0x56388c.pivot.x,
        y: _0x56388c.pivot.y,
        z: _0x56388c.pivot.z
      },
      axis: {
        x: _0x56388c.axisWorld?.x ?? _0x56388c.axis?.x,
        y: _0x56388c.axisWorld?.y ?? _0x56388c.axis?.y,
        z: _0x56388c.axisWorld?.z ?? _0x56388c.axis?.z
      }
    });
  }
  beginScaleGizmoDrag({
    handleKey: _0x38b5d6,
    clientX: _0x553fb7,
    clientY: _0xa7b3ee
  } = {}) {
    if (!_0x38b5d6) {
      return null;
    }
    const _0x57f5f0 = this._gizmo?.handles?.get?.(_0x38b5d6);
    if (!_0x57f5f0 || _0x57f5f0.mode !== "scale-axis" && _0x57f5f0.mode !== "scale-plane" && _0x57f5f0.mode !== "scale-uniform") {
      return null;
    }
    const _0x4e7a6d = this._resolveGizmoContext(this._sceneState);
    if (!_0x4e7a6d) {
      return null;
    }
    const _0x29c689 = this._gizmo.root.position.clone();
    const _0x50df80 = this._gizmo.root.quaternion.clone();
    const _0x2cc5ab = this._resolvePointerRay(_0x553fb7, _0xa7b3ee);
    if (_0x57f5f0.mode === "scale-plane" || _0x57f5f0.mode === "scale-uniform") {
      const _0x2904a2 = this.camera.getWorldDirection(new a1080_0x5849f5.Vector3()).normalize();
      const _0x17277c = new a1080_0x5849f5.Plane().setFromNormalAndCoplanarPoint(_0x2904a2, _0x29c689);
      const _0x4b9e42 = new a1080_0x5849f5.Vector3();
      const _0xcf240 = _0x2cc5ab.ray.intersectPlane(_0x17277c, _0x4b9e42);
      if (!_0xcf240) {
        return null;
      }
      this._captureGizmoDragLock(_0x4e7a6d);
      return {
        handleKey: _0x38b5d6,
        mode: _0x57f5f0.mode,
        constraint: _0x57f5f0.mode === "scale-uniform" ? "xyz" : (_0x57f5f0.linkedAxes || []).join(""),
        linkedAxes: Array.isArray(_0x57f5f0.linkedAxes) ? [..._0x57f5f0.linkedAxes] : [],
        pivot: _0x29c689.clone(),
        axisWorld: null,
        gizmoQuaternion: _0x50df80.clone(),
        dragPlane: _0x17277c,
        startPoint: _0x4b9e42.clone(),
        startClientX: Number(_0x553fb7) || 0,
        startClientY: Number(_0xa7b3ee) || 0,
        referenceDistance: Math.max(0.25, _0x4b9e42.distanceTo(_0x29c689))
      };
    }
    const _0x2d530a = vectorFromAxisName(_0x57f5f0.axis).applyQuaternion(_0x50df80).normalize();
    const _0x15a2e7 = this.camera.getWorldDirection(new a1080_0x5849f5.Vector3()).normalize();
    let _0x5bc434 = new a1080_0x5849f5.Vector3().crossVectors(_0x15a2e7, _0x2d530a);
    if (_0x5bc434.lengthSq() < 0.00001) {
      _0x5bc434 = new a1080_0x5849f5.Vector3(0, 1, 0).cross(_0x2d530a);
      if (_0x5bc434.lengthSq() < 0.00001) {
        _0x5bc434 = new a1080_0x5849f5.Vector3(1, 0, 0).cross(_0x2d530a);
      }
    }
    const _0x518c5b = new a1080_0x5849f5.Vector3().crossVectors(_0x2d530a, _0x5bc434).normalize();
    const _0x5f4add = new a1080_0x5849f5.Plane().setFromNormalAndCoplanarPoint(_0x518c5b, _0x29c689);
    const _0x5427f9 = new a1080_0x5849f5.Vector3();
    const _0x2df9ab = _0x2cc5ab.ray.intersectPlane(_0x5f4add, _0x5427f9);
    if (!_0x2df9ab) {
      return null;
    }
    this._captureGizmoDragLock(_0x4e7a6d);
    const _0x48378a = Math.max(0.35, Math.abs(_0x5427f9.clone().sub(_0x29c689).dot(_0x2d530a)), (Number(this._gizmo?.root?.scale?.x) || 1) * 0.9);
    const _0x187569 = resolveAxisScreenDragMetric({
      pivot: _0x29c689,
      axisWorld: _0x2d530a,
      camera: this.camera,
      domElement: this.renderer?.domElement,
      worldDistance: _0x48378a
    });
    return {
      handleKey: _0x38b5d6,
      mode: "scale-axis",
      constraint: _0x57f5f0.axis,
      axisName: _0x57f5f0.axis,
      axisWorld: _0x2d530a.clone(),
      dragDirectionWorld: _0x2d530a.clone(),
      axis: _0x2d530a.clone(),
      pivot: _0x29c689.clone(),
      planeNormalWorld: _0x518c5b.clone(),
      gizmoQuaternion: _0x50df80.clone(),
      dragPlane: _0x5f4add,
      startPoint: _0x5427f9.clone(),
      startClientX: Number(_0x553fb7) || 0,
      startClientY: Number(_0xa7b3ee) || 0,
      axisScreenDirection: _0x187569?.axisScreenDirection || null,
      screenReferencePixels: _0x187569?.screenReferencePixels || null,
      referenceDistance: _0x48378a
    };
  }
  computeScaleGizmoFactor(_0xc3522f, _0x220371) {
    if (!_0xc3522f?.startPoint || !_0x220371) {
      return 1;
    }
    if (_0xc3522f.mode === "scale-axis") {
      if (_0xc3522f.axisScreenDirection && Number.isFinite(Number(_0x220371.clientX)) && Number.isFinite(Number(_0x220371.clientY))) {
        return computeAxisScaleFactorFromScreenDelta({
          startX: _0xc3522f.startClientX,
          startY: _0xc3522f.startClientY,
          currentX: _0x220371.clientX,
          currentY: _0x220371.clientY,
          axisDirection: _0xc3522f.axisScreenDirection,
          referencePixels: _0xc3522f.screenReferencePixels
        });
      }
      return computeAxisScaleFactor({
        startPoint: {
          x: _0xc3522f.startPoint.x,
          y: _0xc3522f.startPoint.y,
          z: _0xc3522f.startPoint.z
        },
        currentPoint: _0x220371,
        pivot: {
          x: _0xc3522f.pivot.x,
          y: _0xc3522f.pivot.y,
          z: _0xc3522f.pivot.z
        },
        axis: {
          x: _0xc3522f.axisWorld?.x ?? _0xc3522f.axis?.x,
          y: _0xc3522f.axisWorld?.y ?? _0xc3522f.axis?.y,
          z: _0xc3522f.axisWorld?.z ?? _0xc3522f.axis?.z
        },
        dragDirection: {
          x: _0xc3522f.dragDirectionWorld?.x ?? _0xc3522f.axisWorld?.x ?? _0xc3522f.axis?.x,
          y: _0xc3522f.dragDirectionWorld?.y ?? _0xc3522f.axisWorld?.y ?? _0xc3522f.axis?.y,
          z: _0xc3522f.dragDirectionWorld?.z ?? _0xc3522f.axisWorld?.z ?? _0xc3522f.axis?.z
        },
        referenceDistance: _0xc3522f.referenceDistance
      });
    }
    if (_0xc3522f.mode === "scale-uniform" && Number.isFinite(Number(_0x220371.clientX)) && Number.isFinite(Number(_0x220371.clientY))) {
      const _0x80a514 = Number(_0x220371.clientX) - Number(_0xc3522f.startClientX || 0);
      const _0x12677d = Number(_0xc3522f.startClientY || 0) - Number(_0x220371.clientY);
      return Math.max(0.001, Math.exp((_0x12677d + _0x80a514 * 0.35) / 180));
    }
    return computeUniformScaleFactor({
      startPoint: {
        x: _0xc3522f.startPoint.x,
        y: _0xc3522f.startPoint.y,
        z: _0xc3522f.startPoint.z
      },
      currentPoint: _0x220371,
      pivot: {
        x: _0xc3522f.pivot.x,
        y: _0xc3522f.pivot.y,
        z: _0xc3522f.pivot.z
      },
      minDistance: _0xc3522f.referenceDistance
    });
  }
  sampleMoveGizmoDragPoint(_0x9815f5, _0x176bba, _0x473f5b) {
    if (!_0x9815f5?.dragPlane) {
      return null;
    }
    const _0x4cab38 = this._resolvePointerRay(_0x176bba, _0x473f5b);
    const _0x173279 = new a1080_0x5849f5.Vector3();
    const _0x522791 = _0x4cab38.ray.intersectPlane(_0x9815f5.dragPlane, _0x173279);
    if (!_0x522791) {
      return null;
    }
    return {
      x: _0x173279.x,
      y: _0x173279.y,
      z: _0x173279.z,
      clientX: _0x176bba,
      clientY: _0x473f5b
    };
  }
  computeMoveGizmoDelta(_0x1d2d69, _0x4ca6f4) {
    if (!_0x1d2d69?.startPoint || !_0x4ca6f4) {
      return null;
    }
    const _0x5cac89 = computeConstrainedMoveDelta({
      startPoint: {
        x: _0x1d2d69.startPoint.x,
        y: _0x1d2d69.startPoint.y,
        z: _0x1d2d69.startPoint.z
      },
      currentPoint: _0x4ca6f4,
      axis: _0x1d2d69?.axisWorld ? {
        x: _0x1d2d69.axisWorld.x,
        y: _0x1d2d69.axisWorld.y,
        z: _0x1d2d69.axisWorld.z
      } : _0x1d2d69?.axis ? {
        x: _0x1d2d69.axis.x,
        y: _0x1d2d69.axis.y,
        z: _0x1d2d69.axis.z
      } : null,
      planeNormal: {
        x: _0x1d2d69?.planeNormalWorld?.x ?? _0x1d2d69?.planeNormal?.x,
        y: _0x1d2d69?.planeNormalWorld?.y ?? _0x1d2d69?.planeNormal?.y,
        z: _0x1d2d69?.planeNormalWorld?.z ?? _0x1d2d69?.planeNormal?.z
      },
      mode: _0x1d2d69.mode
    });
    return _0x5cac89;
  }
  pick(_0x40471f, _0x61cc17) {
    if (this._isPanorama360Mode()) {
      return null;
    }
    if (!this._pickRoots.length) {
      return null;
    }
    const _0x3e9083 = this._resolvePointerRay(_0x40471f, _0x61cc17);
    const _0x22ff06 = _0x3e9083.intersectObjects(this._pickRoots, false);
    for (const _0x4f4c02 of _0x22ff06) {
      let _0x37c8ee = _0x4f4c02.object;
      while (_0x37c8ee) {
        const _0x3e808a = this._pickMap.get(_0x37c8ee.id);
        if (_0x3e808a) {
          return {
            ..._0x3e808a,
            point: {
              x: _0x4f4c02.point.x,
              y: _0x4f4c02.point.y,
              z: _0x4f4c02.point.z
            }
          };
        }
        _0x37c8ee = _0x37c8ee.parent;
      }
    }
    return null;
  }
  pickObjectsInRect(_0x290e6d) {
    if (this._isPanorama360Mode()) {
      return [];
    }
    const _0x2e407d = this.renderer.domElement.getBoundingClientRect();
    const _0x516c7e = [];
    const _0x2ab575 = (_0x18d0c3, _0x11e3ac) => {
      _0x18d0c3.forEach((_0x148d89, _0x2b2d7c) => {
        const _0x1e5fb2 = new a1080_0x5849f5.Vector3();
        _0x148d89.group.getWorldPosition(_0x1e5fb2);
        const _0x5b748f = _0x1e5fb2.clone().project(this.camera);
        if (_0x5b748f.x < -1 || _0x5b748f.x > 1 || _0x5b748f.y < -1 || _0x5b748f.y > 1 || _0x5b748f.z < -1 || _0x5b748f.z > 1) {
          return;
        }
        const _0x48e11b = _0x2e407d.left + (_0x5b748f.x + 1) * 0.5 * _0x2e407d.width;
        const _0x4f0c82 = _0x2e407d.top + (1 - _0x5b748f.y) * 0.5 * _0x2e407d.height;
        if (_0x48e11b >= _0x290e6d.left && _0x48e11b <= _0x290e6d.right && _0x4f0c82 >= _0x290e6d.top && _0x4f0c82 <= _0x290e6d.bottom) {
          _0x516c7e.push({
            objectType: _0x11e3ac,
            objectId: _0x2b2d7c,
            depth: _0x5b748f.z
          });
        }
      });
    };
    _0x2ab575(this._mannequinMap, "mannequin");
    _0x2ab575(this._cubeMap, "cube");
    _0x2ab575(this._cameraMap, "camera");
    _0x516c7e.sort((_0x4c6783, _0x195dd1) => _0x4c6783.depth - _0x195dd1.depth);
    return _0x516c7e;
  }
  resolveDollyAnchor(_0x2428bb, _0x4464ff) {
    if (this._isPanorama360Mode()) {
      return null;
    }
    const _0x481d6c = this._draftView?.kind === "scene-default" ? this._draftView.sceneView : this._sceneState?.viewport?.sceneView;
    return resolvePointerDollyAnchor({
      raycaster: this._resolvePointerRay(_0x2428bb, _0x4464ff),
      pickRoots: this._pickRoots,
      sceneView: _0x481d6c,
      camera: this.camera
    });
  }
  intersectGround(_0x2aa851, _0x2a481f, _0x3ae8b9 = 0) {
    if (this._isPanorama360Mode()) {
      return null;
    }
    const _0x2511af = this._resolvePointerRay(_0x2aa851, _0x2a481f);
    const _0x28a2b1 = new a1080_0x5849f5.Plane(new a1080_0x5849f5.Vector3(0, 1, 0), -_0x3ae8b9);
    const _0x4edae5 = new a1080_0x5849f5.Vector3();
    const _0x1692be = _0x2511af.ray.intersectPlane(_0x28a2b1, _0x4edae5);
    if (!_0x1692be) {
      return null;
    }
    return {
      x: _0x4edae5.x,
      y: _0x4edae5.y,
      z: _0x4edae5.z
    };
  }
  async _withCleanCaptureFrame(_0x24d40b) {
    const _0x29f9b0 = [this._gizmo?.root, this._gizmoMoveGuideLine, ...Array.from(this._cameraMap.values()).map(_0xd57ea0 => _0xd57ea0?.group)].filter(Boolean);
    const _0xb7a279 = _0x29f9b0.map(_0xaef26c => ({
      object3d: _0xaef26c,
      visible: _0xaef26c.visible
    }));
    const _0xb77722 = [];
    const _0x51d531 = _0x1a8d88 => {
      if (!_0x1a8d88 || _0xb77722.some(_0x43ac68 => _0x43ac68.material === _0x1a8d88)) {
        return;
      }
      _0xb77722.push({
        material: _0x1a8d88,
        emissive: _0x1a8d88.emissive?.isColor ? _0x1a8d88.emissive.clone() : undefined,
        emissiveIntensity: typeof _0x1a8d88.emissiveIntensity === "number" ? _0x1a8d88.emissiveIntensity : undefined,
        opacity: typeof _0x1a8d88.opacity === "number" ? _0x1a8d88.opacity : undefined
      });
    };
    this._mannequinMap.forEach(_0xf43b92 => {
      _0xf43b92?.group?.traverse?.(_0x55ff94 => eachMaterial(_0x55ff94.material, _0x51d531));
    });
    this._cubeMap.forEach(_0xacbd43 => {
      _0xacbd43?.group?.traverse?.(_0x43d181 => eachMaterial(_0x43d181.material, _0x51d531));
    });
    _0xb7a279.forEach(({
      object3d: _0x85a567
    }) => {
      _0x85a567.visible = false;
    });
    this._mannequinMap.forEach(_0x42bbeb => applyObjectSelectionEmphasis(_0x42bbeb?.group, false));
    this._cubeMap.forEach(_0xbd2489 => applyObjectSelectionEmphasis(_0xbd2489?.group, false));
    try {
      return await _0x24d40b();
    } finally {
      _0xb7a279.forEach(({
        object3d: _0xb060d,
        visible: _0x55e5f4
      }) => {
        _0xb060d.visible = _0x55e5f4;
      });
      _0xb77722.forEach(({
        material: _0x4bfb03,
        emissive: _0x2cede0,
        emissiveIntensity: _0x36ff58,
        opacity: _0x177796
      }) => {
        if (_0x2cede0?.isColor && _0x4bfb03.emissive?.isColor) {
          _0x4bfb03.emissive.copy(_0x2cede0);
        }
        if (typeof _0x36ff58 === "number") {
          _0x4bfb03.emissiveIntensity = _0x36ff58;
        }
        if (typeof _0x177796 === "number") {
          _0x4bfb03.opacity = _0x177796;
        }
        _0x4bfb03.needsUpdate = true;
      });
      this.requestRender();
    }
  }
  captureBlob({
    includeEditorOverlays = true
  } = {}) {
    const _0xf9dc29 = () => new Promise((_0x27327d, _0x259152) => {
      this.renderNow();
      const _0x5bb35e = this.renderer.domElement;
      if (typeof _0x5bb35e.toBlob === "function") {
        _0x5bb35e.toBlob(_0x53390e => {
          if (!_0x53390e) {
            _0x259152(new Error(panoramaSceneText("errors.captureExportFailed")));
            return;
          }
          _0x27327d(_0x53390e);
        }, "image/png");
        return;
      }
      try {
        const _0x30487e = _0x5bb35e.toDataURL("image/png");
        const [, _0x28fae5] = _0x30487e.split(",");
        const _0x31fb9d = _0x30487e.slice(_0x30487e.indexOf(":") + 1, _0x30487e.indexOf(";"));
        const _0x4b9fe7 = atob(_0x28fae5 || "");
        const _0x32a36b = new Uint8Array(_0x4b9fe7.length);
        for (let _0x5c2c14 = 0; _0x5c2c14 < _0x4b9fe7.length; _0x5c2c14 += 1) {
          _0x32a36b[_0x5c2c14] = _0x4b9fe7.charCodeAt(_0x5c2c14);
        }
        _0x27327d(new Blob([_0x32a36b], {
          type: _0x31fb9d || "image/png"
        }));
      } catch (_0x383e2f) {
        _0x259152(_0x383e2f);
      }
    });
    if (includeEditorOverlays === false) {
      return this._withCleanCaptureFrame(_0xf9dc29);
    }
    return _0xf9dc29();
  }
  sync(_0x45a84f) {
    this._sceneState = _0x45a84f;
    this._sceneContentExtent = estimateSceneContentExtent(_0x45a84f);
    this._sceneContentBounds = estimateSceneContentBounds(_0x45a84f);
    const _0x2dff8a = this._isPanorama360Mode(_0x45a84f);
    this._syncEnvironment(_0x45a84f?.environmentMode);
    this._syncPanorama(_0x45a84f?.panorama);
    this._syncMannequins(_0x45a84f, _0x2dff8a);
    this._syncCubes(_0x45a84f, _0x2dff8a);
    this._syncCameras(_0x45a84f, _0x2dff8a);
    this._syncGizmo(_0x45a84f, _0x2dff8a);
    this._syncPanoramaModeVisibility(_0x2dff8a);
    this._syncPanoramaCanvasVisibility(_0x2dff8a);
    this.requestRender();
  }
  requestRender() {
    if (this._rafId !== null) {
      return;
    }
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this.renderNow();
    });
  }
  renderNow() {
    if (!this._sceneState) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    const _0x42ce48 = this._isPanorama360Mode(this._sceneState);
    const _0xe6cf4a = this._applyRenderView();
    if (!_0x42ce48) {
      this._syncInfiniteGrid();
    }
    this._applyDraftObjects();
    if (!_0x42ce48) {
      this._applyGizmoPosition();
    }
    this.renderer.render(this.scene, this.camera);
    if (_0xe6cf4a?.keepAnimating) {
      this.requestRender();
    }
  }
  dispose() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._panoramaLoadToken += 1;
    this._abortPanoramaTextureLoad();
    this._cancelPanoramaFullLoad();
    this._smoothedPose = null;
    this._lastRenderTime = 0;
    this._viewSmoothingUntil = 0;
    this._mannequinMap.forEach(_0x2427e2 => {
      this.scene.remove(_0x2427e2.group);
      disposeObject3D(_0x2427e2.group);
    });
    this._cubeMap.forEach(_0x1424ae => {
      this.scene.remove(_0x1424ae.group);
      disposeObject3D(_0x1424ae.group);
    });
    this._cameraMap.forEach(_0x53c215 => {
      this.scene.remove(_0x53c215.group);
      disposeObject3D(_0x53c215.group);
    });
    this._mannequinMap.clear();
    this._mannequinStateById.clear();
    this._draftMannequinBonePoses.clear();
    this._cubeMap.clear();
    this._cubeStateById.clear();
    this._cameraMap.clear();
    this._cameraStateById.clear();
    this._visualOverrides.clear();
    this._pickMap.clear();
    this._pickRoots = [];
    this._clearStableGizmoContext();
    this.scene.remove(this._gizmo.root);
    disposeObject3D(this._gizmo.root);
    if (this._panoramaTexture) {
      this._panoramaTexture.dispose();
      this._panoramaTexture = null;
    }
    disposeObject3D(this._panoramaSphere);
    disposeObject3D(this._ground);
    disposeObject3D(this._gridMinor);
    disposeObject3D(this._gridMajor);
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    this.renderer.domElement.remove();
  }
  _syncEnvironment(_0x46377e) {
    const _0x5d1e98 = _0x46377e === "night";
    const _0x56c99b = resolveThemeColor(_0x5d1e98 ? "--panorama-scene-fog-night" : "--panorama-scene-fog-day", _0x5d1e98 ? "--panorama-scene-fog-night" : "--panorama-scene-fog-day");
    this.scene.background = null;
    this.renderer.setClearColor(0, 0);
    this.scene.fog = this._isPanorama360Mode(this._sceneState) ? null : new a1080_0x5849f5.Fog(_0x56c99b, _0x5d1e98 ? 46 : 58, _0x5d1e98 ? 138 : 170);
    this._ambientLight.intensity = _0x5d1e98 ? 0.56 : 0.94;
    this._keyLight.intensity = _0x5d1e98 ? 0.72 : 1.12;
    this._rimLight.intensity = _0x5d1e98 ? 0.2 : 0.16;
    eachMaterial(this._gridMinor.material, _0x337a5d => {
      _0x337a5d.opacity = _0x5d1e98 ? 0.28 : 0.24;
      _0x337a5d.color.copy(resolveThemeColor(_0x5d1e98 ? "--panorama-scene-grid-night" : "--panorama-scene-grid-day", _0x5d1e98 ? "--indigo-35" : "--black-20"));
      _0x337a5d.needsUpdate = true;
    });
    eachMaterial(this._gridMajor.material, _0x172f8f => {
      _0x172f8f.opacity = _0x5d1e98 ? 0.52 : 0.42;
      _0x172f8f.color.copy(resolveThemeColor(_0x5d1e98 ? "--panorama-scene-grid-night-major" : "--panorama-scene-grid-day-major", _0x5d1e98 ? "--indigo-35" : "--black-20"));
      _0x172f8f.needsUpdate = true;
    });
    this._ground.material.opacity = _0x5d1e98 ? 0.96 : 0.92;
    this._ground.material.color = resolveThemeColor(_0x5d1e98 ? "--panorama-scene-ground-night" : "--panorama-scene-ground-day", _0x5d1e98 ? "--indigo-12" : "--black-10");
    this._ground.material.needsUpdate = true;
  }
  _syncPanoramaModeVisibility(_0x5b191d) {
    this._gridMinor.visible = this._gridVisible !== false && !_0x5b191d;
    this._gridMajor.visible = this._gridVisible !== false && !_0x5b191d;
    this._ground.visible = this._groundFillVisible !== false && !_0x5b191d;
    if (!_0x5b191d) {
      return;
    }
    this._gizmo.root.visible = false;
    this.clearGizmoHandleState();
    this._mannequinMap.forEach(_0x3d565e => {
      _0x3d565e.group.visible = false;
      _0x3d565e.selectionRing.visible = false;
    });
    this._cubeMap.forEach(_0x1eaf49 => {
      _0x1eaf49.group.visible = false;
      _0x1eaf49.selectionRing.visible = false;
    });
    this._cameraMap.forEach(_0x2d8f3d => {
      _0x2d8f3d.group.visible = false;
    });
    this._panoramaSphere.visible = Boolean(this._panoramaSphere.material?.map);
  }
  _syncPanoramaCanvasVisibility(_0x3e548c = this._isPanorama360Mode(this._sceneState)) {
    const _0x4e9979 = this.renderer?.domElement;
    if (!_0x4e9979) {
      return;
    }
    const _0x3e62e9 = Boolean(this._panoramaSphere?.material?.map);
    const _0x39330d = _0x3e548c && !_0x3e62e9;
    _0x4e9979.style.opacity = _0x39330d ? "0" : "1";
    _0x4e9979.style.background = "transparent";
    _0x4e9979.dataset.panoramaEmpty = _0x39330d ? "1" : "0";
  }
  _syncInfiniteGrid() {
    const _0x3ae26c = Number(this.camera?.position?.x) || 0;
    const _0x55237c = Number(this.camera?.position?.z) || 0;
    const _0x510463 = computeStableGridSnap(_0x3ae26c, GRID_MINOR_STEP, this._gridSnapState.minorX, GRID_SNAP_HYSTERESIS);
    const _0x2c0fef = computeStableGridSnap(_0x55237c, GRID_MINOR_STEP, this._gridSnapState.minorZ, GRID_SNAP_HYSTERESIS);
    const _0x3a8cda = computeStableGridSnap(_0x3ae26c, GRID_MAJOR_STEP, this._gridSnapState.majorX, GRID_SNAP_HYSTERESIS);
    const _0x1a44c6 = computeStableGridSnap(_0x55237c, GRID_MAJOR_STEP, this._gridSnapState.majorZ, GRID_SNAP_HYSTERESIS);
    this._gridSnapState.minorX = _0x510463;
    this._gridSnapState.minorZ = _0x2c0fef;
    this._gridSnapState.majorX = _0x3a8cda;
    this._gridSnapState.majorZ = _0x1a44c6;
    this._gridMinor.position.set(_0x510463, 0, _0x2c0fef);
    this._gridMajor.position.set(_0x3a8cda, 0.0002, _0x1a44c6);
    const _0x39c0a7 = Number(this._renderPose?.distance) || 0;
    const _0x494a4c = Math.max(GRID_BASE_SPAN, Math.abs(Number(this.camera?.position?.y) || 0) * 26, _0x39c0a7 * 28);
    this._ground.position.set(_0x3a8cda, -0.001, _0x1a44c6);
    this._ground.scale.set(_0x494a4c, _0x494a4c, 1);
    const _0x5bf70f = this._sceneState?.environmentMode === "night";
    const _0x580983 = _0x5bf70f ? 0.28 : 0.24;
    const _0x5939db = _0x5bf70f ? 0.52 : 0.42;
    const _0x165fbd = Math.abs(Number.isFinite(this._renderPose?.pitch) ? this._renderPose.pitch : Number(this.camera?.rotation?.x) || 0);
    const _0x50b78d = clamp01((_0x165fbd - 0.08) / 0.32);
    const _0x21cf90 = 0.18 + _0x50b78d * 0.82;
    const _0x201148 = clamp01((_0x39c0a7 - 8) / 26);
    const _0x251375 = 1 - _0x201148 * 0.52;
    const _0xf1f6bf = _0x21cf90 * _0x251375;
    const _0x335a80 = _0x580983 * _0xf1f6bf;
    const _0x2d1fd4 = _0x5939db * (0.32 + _0xf1f6bf * 0.68);
    eachMaterial(this._gridMinor.material, _0x3fd7a3 => {
      _0x3fd7a3.opacity = _0x335a80;
    });
    eachMaterial(this._gridMajor.material, _0x5385ee => {
      _0x5385ee.opacity = _0x2d1fd4;
    });
  }
  _syncPanorama(_0x496404) {
    const _0x8e97f1 = normalizePanoramaTextureUrl(_0x496404?.imageUrl, _0x496404?.localPath);
    const _0xccffac = normalizePanoramaTextureUrl(_0x496404?.previewImageUrl, null);
    const _0x137b76 = _0x8e97f1 || _0xccffac;
    if (!_0x137b76) {
      this._panoramaLoadToken += 1;
      this._abortPanoramaTextureLoad();
      this._cancelPanoramaFullLoad();
      this._panoramaSourceKey = "";
      this._loadedPanoramaUrl = "";
      this._pendingPanoramaUrl = "";
      if (this._panoramaTexture) {
        this._panoramaTexture.dispose();
        this._panoramaTexture = null;
      }
      this._panoramaSphere.material.map = null;
      this._panoramaSphere.material.needsUpdate = true;
      this._panoramaSphere.visible = false;
      this._syncPanoramaCanvasVisibility();
      return;
    }
    const _0x591642 = _0xccffac + "\n" + _0x8e97f1;
    if (_0x591642 !== this._panoramaSourceKey) {
      this._panoramaSourceKey = _0x591642;
      this._panoramaLoadToken += 1;
      this._abortPanoramaTextureLoad();
      this._pendingPanoramaUrl = "";
      this._cancelPanoramaFullLoad();
    }
    const _0x42376f = this._panoramaLoadToken;
    const _0x2028ad = Boolean(_0xccffac && _0xccffac !== _0x8e97f1);
    if (_0x8e97f1 && _0x8e97f1 === this._loadedPanoramaUrl) {
      return;
    }
    if (_0x2028ad) {
      if (_0xccffac === this._loadedPanoramaUrl) {
        this._schedulePanoramaFullLoad(_0x8e97f1, _0x42376f);
        return;
      }
      if (_0xccffac === this._pendingPanoramaUrl || _0x8e97f1 === this._pendingPanoramaUrl) {
        return;
      }
      this._loadPanoramaTexture(_0xccffac, {
        token: _0x42376f,
        isPreview: true,
        fullUrl: _0x8e97f1
      });
      return;
    }
    if (_0x137b76 === this._loadedPanoramaUrl || _0x137b76 === this._pendingPanoramaUrl) {
      return;
    }
    this._loadPanoramaTexture(_0x137b76, {
      token: _0x42376f,
      isPreview: Boolean(_0xccffac),
      fullUrl: ""
    });
  }
  _loadPanoramaTexture(_0x4e7615, {
    token: _0x2e89ba,
    isPreview = false,
    fullUrl = ""
  } = {}) {
    return loadPanoramaBridgeTexture(this, _0x4e7615, {
      token: _0x2e89ba,
      isPreview: isPreview,
      fullUrl: fullUrl
    });
  }
  _abortPanoramaTextureLoad() {
    abortPanoramaTextureLoad(this);
  }
  _schedulePanoramaFullLoad(_0x437e04, _0x18c476) {
    schedulePanoramaFullLoad(this, _0x437e04, _0x18c476);
  }
  _cancelPanoramaFullLoad() {
    cancelPanoramaFullLoad(this);
  }
  _resolveMannequinColor(_0x537553) {
    const _0x13ab2b = PANORAMA_SCENE_COLOR_TOKENS[_0x537553] || PANORAMA_SCENE_COLOR_TOKENS.blue;
    if (/^#[0-9a-f]{6}$/i.test(String(_0x537553 || "").trim())) {
      return new a1080_0x5849f5.Color(_0x537553);
    } else {
      return resolveThemeColor(_0x13ab2b, "--blue");
    }
  }
  _registerPickable(_0xd1b64c, _0x437819) {
    const _0x2b57cc = (_0x2765eb, _0x4b6550 = true) => {
      if (!_0x2765eb) {
        return;
      }
      const _0x249086 = _0x4b6550 && _0x2765eb.visible !== false;
      if (!_0x249086) {
        return;
      }
      if (_0x2765eb.isMesh === true) {
        this._pickMap.set(_0x2765eb.id, _0x437819);
        this._pickRoots.push(_0x2765eb);
      }
      for (const _0xda3b1d of _0x2765eb.children || []) {
        _0x2b57cc(_0xda3b1d, _0x249086);
      }
    };
    _0x2b57cc(_0xd1b64c);
  }
  _rebuildPickRoots() {
    this._pickMap.clear();
    this._pickRoots = [];
    this._mannequinMap.forEach((_0x53e94d, _0x1f4279) => {
      this._registerPickable(_0x53e94d.proxyRoot || _0x53e94d.group, {
        objectType: "mannequin",
        objectId: _0x1f4279
      });
    });
    this._cubeMap.forEach((_0x532219, _0x57d28f) => {
      this._registerPickable(_0x532219.group, {
        objectType: "cube",
        objectId: _0x57d28f
      });
    });
    this._cameraMap?.forEach((_0x415fe7, _0x4e3f5c) => {
      this._registerPickable(_0x415fe7.group, {
        objectType: "camera",
        objectId: _0x4e3f5c
      });
    });
  }
  _loadCharacterModelForVisual(_0x42d70d, _0x1f979d, _0x1a5e0c) {
    if (!_0x42d70d) {
      return;
    }
    const _0x3d0c15 = resolvePanoramaCharacterGender(_0x1a5e0c);
    const _0x4758ba = (_0x42d70d.modelLoadToken || 0) + 1;
    _0x42d70d.modelLoadToken = _0x4758ba;
    _0x42d70d.modelGender = _0x3d0c15;
    _0x42d70d.modelLoadError = null;
    setMannequinProxyMode(_0x42d70d);
    createPanoramaCharacterModelInstance(_0x3d0c15).then(_0x2622bc => {
      if (this._mannequinMap.get(_0x1f979d) !== _0x42d70d || _0x42d70d.modelLoadToken !== _0x4758ba) {
        disposeObject3D(_0x2622bc);
        return;
      }
      if (_0x42d70d.modelRoot) {
        _0x42d70d.group.remove(_0x42d70d.modelRoot);
        disposeObject3D(_0x42d70d.modelRoot);
      }
      _0x42d70d.modelMaterial = null;
      _0x42d70d.modelRoot = _0x2622bc;
      _0x42d70d.modelBodyProfileBase = captureCharacterModelBodyProfileBase(_0x2622bc);
      _0x42d70d.group.add(_0x2622bc);
      const _0x39bd99 = this._mannequinStateById.get(_0x1f979d) || {};
      _0x42d70d.baseBonePose = capturePanoramaCharacterBoneBase(_0x2622bc);
      _0x42d70d.appliedBonePoseSignature = JSON.stringify(_0x39bd99.bonePose || {});
      applyPanoramaCharacterBonePose(_0x2622bc, _0x39bd99.bonePose, _0x42d70d.baseBonePose);
      const _0x4598ba = _0x39bd99.colorKey;
      applyCharacterClayMaterial(_0x42d70d, this._resolveMannequinColor(_0x4598ba));
      applyCharacterBodyProfile(_0x42d70d, _0x39bd99.bodyProfile);
      setMannequinProxyMode(_0x42d70d);
      this._rebuildPickRoots();
      if (typeof requestAnimationFrame === "function") {
        this.requestRender();
      }
    }).catch(_0x4694df => {
      if (this._mannequinMap.get(_0x1f979d) !== _0x42d70d || _0x42d70d.modelLoadToken !== _0x4758ba) {
        return;
      }
      _0x42d70d.modelLoadError = _0x4694df || new Error("Quaternius character model failed to load");
      if (_0x42d70d.modelRoot) {
        _0x42d70d.group.remove(_0x42d70d.modelRoot);
        disposeObject3D(_0x42d70d.modelRoot);
        _0x42d70d.modelRoot = null;
      }
      _0x42d70d.modelMaterial = null;
      _0x42d70d.modelBodyProfileBase = null;
      setMannequinProxyMode(_0x42d70d);
      if (typeof requestAnimationFrame === "function") {
        this.requestRender();
      }
    });
  }
  _syncMannequins(_0x5b0e86, _0x1d0f6d = false) {
    const _0xa70e26 = _0x5b0e86?.mannequins || [];
    const _0x392067 = new Set(collectSelectedObjectIds(_0x5b0e86, "mannequin"));
    const _0x4246da = !_0x1d0f6d;
    const _0x1be689 = new Set();
    _0xa70e26.forEach(_0x4f1de5 => {
      _0x1be689.add(_0x4f1de5.id);
      this._mannequinStateById.set(_0x4f1de5.id, _0x4f1de5);
      let _0x35eba2 = this._mannequinMap.get(_0x4f1de5.id);
      if (!_0x35eba2) {
        _0x35eba2 = createMannequinVisual(this._resolveMannequinColor(_0x4f1de5.colorKey));
        this._mannequinMap.set(_0x4f1de5.id, _0x35eba2);
        this.scene.add(_0x35eba2.group);
        this._loadCharacterModelForVisual(_0x35eba2, _0x4f1de5.id, _0x4f1de5.gender);
      } else if (_0x35eba2.modelGender !== resolvePanoramaCharacterGender(_0x4f1de5.gender)) {
        if (_0x35eba2.modelRoot) {
          _0x35eba2.group.remove(_0x35eba2.modelRoot);
          disposeObject3D(_0x35eba2.modelRoot);
          _0x35eba2.modelRoot = null;
        }
        _0x35eba2.modelBodyProfileBase = null;
        this._loadCharacterModelForVisual(_0x35eba2, _0x4f1de5.id, _0x4f1de5.gender);
      }
      const _0x424904 = this._resolveMannequinColor(_0x4f1de5.colorKey);
      _0x35eba2.material.color.copy(_0x424904);
      _0x35eba2.headMaterial.color.copy(_0x424904.clone().offsetHSL(0, 0, 0.08));
      applyGenderShape(_0x35eba2, _0x4f1de5.gender);
      applyCharacterBodyProfile(_0x35eba2, _0x4f1de5.bodyProfile);
      const _0x397a6d = this._draftMannequinBonePoses?.get?.(_0x4f1de5.id);
      const _0x2239df = _0x397a6d || _0x4f1de5.bonePose || {};
      const _0x42e7c6 = _0x397a6d ? "draft:" + JSON.stringify(_0x2239df) : JSON.stringify(_0x2239df);
      if (_0x35eba2.modelRoot && _0x35eba2.baseBonePose && _0x35eba2.appliedBonePoseSignature !== _0x42e7c6) {
        applyPanoramaCharacterBonePose(_0x35eba2.modelRoot, _0x2239df, _0x35eba2.baseBonePose);
        _0x35eba2.appliedBonePoseSignature = _0x42e7c6;
      }
      const _0x1b98d1 = this._draftObjects.get("mannequin:" + _0x4f1de5.id);
      applyGroupTransform(_0x35eba2.group, _0x1b98d1 || _0x4f1de5);
      _0x35eba2.group.position.y = _0x1b98d1?.position?.y ?? _0x4f1de5.position.y ?? 0;
      applyGroupScale(_0x35eba2.group, _0x1b98d1?.scale ?? _0x4f1de5.scale ?? 1);
      const _0x19eb73 = _0x4246da && _0x5b0e86?.ui?.isEditing === true && _0x5b0e86?.ui?.showOutline !== false && _0x392067.has(_0x4f1de5.id);
      _0x35eba2.group.visible = _0x4246da;
      _0x35eba2.selectionRing.visible = false;
      setMannequinProxyMode(_0x35eba2);
      applyCharacterClayMaterial(_0x35eba2, _0x424904);
      applySelectionEmphasis(_0x35eba2.material, _0x19eb73, 0.18);
      applySelectionEmphasis(_0x35eba2.headMaterial, _0x19eb73, 0.26);
      applyObjectSelectionEmphasis(_0x35eba2.modelRoot, _0x19eb73, 0.12);
    });
    for (const [_0x3d5945, _0x18d00c] of this._mannequinMap.entries()) {
      if (_0x1be689.has(_0x3d5945)) {
        continue;
      }
      this.scene.remove(_0x18d00c.group);
      disposeObject3D(_0x18d00c.group);
      this._mannequinMap.delete(_0x3d5945);
      this._mannequinStateById.delete(_0x3d5945);
      this._draftMannequinBonePoses?.delete?.(_0x3d5945);
    }
    if (this._pickMap) {
      this._rebuildPickRoots();
    }
  }
  _syncCubes(_0x4d6971, _0x3f3074 = false) {
    const _0x359808 = _0x4d6971?.cubes || [];
    const _0x4ace30 = new Set(collectSelectedObjectIds(_0x4d6971, "cube"));
    const _0x592380 = !_0x3f3074;
    const _0x582e7c = new Set();
    _0x359808.forEach(_0x12e5e0 => {
      _0x582e7c.add(_0x12e5e0.id);
      this._cubeStateById.set(_0x12e5e0.id, _0x12e5e0);
      let _0x11c82f = this._cubeMap.get(_0x12e5e0.id);
      const _0x3b2d16 = resolveSceneAsset(_0x12e5e0.assetId);
      const _0x28a9b9 = this._resolveMannequinColor(_0x12e5e0.colorKey || _0x3b2d16?.colorKey);
      const _0x35cd46 = _0x258c98 => /^#[0-9a-f]{6}$/i.test(String(_0x12e5e0.colorKey || "").trim()) ? _0x28a9b9 : this._resolveMannequinColor(_0x258c98);
      if (!_0x11c82f || _0x11c82f.assetId !== _0x3b2d16?.id) {
        if (_0x11c82f) {
          this.scene.remove(_0x11c82f.group);
          disposeObject3D(_0x11c82f.group);
        }
        _0x11c82f = createSceneAssetVisual(_0x3b2d16, _0x28a9b9, _0x35cd46);
        this._cubeMap.set(_0x12e5e0.id, _0x11c82f);
        this.scene.add(_0x11c82f.group);
      }
      applySceneAssetColors(_0x11c82f, _0x28a9b9, _0x35cd46);
      const _0x2aa208 = this._draftObjects.get("cube:" + _0x12e5e0.id);
      const _0x5da620 = _0x2aa208 || _0x12e5e0;
      applyGroupTransform(_0x11c82f.group, _0x5da620);
      _0x11c82f.group.position.y = Number(_0x5da620?.position?.y) || 0;
      applyGroupScale(_0x11c82f.group, _0x5da620?.scale ?? _0x12e5e0?.scale ?? 1);
      const _0x535490 = _0x592380 && _0x4d6971?.ui?.isEditing === true && _0x4d6971?.ui?.showOutline !== false && _0x4ace30.has(_0x12e5e0.id);
      _0x11c82f.group.visible = _0x592380;
      _0x11c82f.selectionRing.visible = false;
      _0x11c82f.materialsByColorKey.forEach(_0x2d366b => {
        applySelectionEmphasis(_0x2d366b, _0x535490, 0.22);
      });
      _0x11c82f.edgeMaterialsByColorKey.forEach(_0x47f584 => {
        _0x47f584.opacity = _0x535490 ? 1 : 0.78;
      });
    });
    for (const [_0x1f8196, _0x41fc9b] of this._cubeMap.entries()) {
      if (_0x582e7c.has(_0x1f8196)) {
        continue;
      }
      this.scene.remove(_0x41fc9b.group);
      disposeObject3D(_0x41fc9b.group);
      this._cubeMap.delete(_0x1f8196);
      this._cubeStateById.delete(_0x1f8196);
    }
    this._rebuildPickRoots();
  }
  _syncCameras(_0x567996, _0x16881e = false) {
    const _0x188a1c = Array.isArray(_0x567996?.cameras) ? _0x567996.cameras : [];
    const _0x3b9183 = _0x567996?.viewport?.activeView === "camera" && _0x567996?.viewport?.activeCameraId ? String(_0x567996.viewport.activeCameraId) : null;
    const _0x95625c = this._draftView?.kind === "camera" && this._draftView?.cameraId ? String(this._draftView.cameraId) : null;
    const _0x4e14bb = new Set(collectSelectedObjectIds(_0x567996, "camera"));
    const _0x429663 = !_0x16881e && _0x188a1c.some(_0x248b40 => {
      if (!_0x248b40?.id) {
        return false;
      }
      const _0x410468 = normalizeCameraPoseData(_0x248b40);
      const _0x70abb6 = cameraPoseToSceneViewFromReference(_0x410468, _0x567996?.viewport?.sceneView);
      return areSceneViewsEquivalent(_0x567996?.viewport?.sceneView, _0x70abb6);
    });
    const _0x2ff766 = Boolean(_0x3b9183 || _0x95625c || _0x429663);
    const _0x8011bd = new Set();
    _0x188a1c.forEach(_0x209377 => {
      if (!_0x209377?.id) {
        return;
      }
      const _0x45e5da = String(_0x209377.id);
      _0x8011bd.add(_0x45e5da);
      this._cameraStateById.set(_0x45e5da, _0x209377);
      let _0x24e59d = this._cameraMap.get(_0x45e5da);
      if (!_0x24e59d) {
        _0x24e59d = createCameraVisual();
        this._cameraMap.set(_0x45e5da, _0x24e59d);
        this.scene.add(_0x24e59d.group);
      }
      const _0x5d5f04 = this._draftObjects?.get?.("camera:" + _0x45e5da);
      const _0x3da4a9 = normalizeCameraPoseData(_0x5d5f04 || _0x209377);
      _0x24e59d.group.position.set(_0x3da4a9.position.x, _0x3da4a9.position.y, _0x3da4a9.position.z);
      _0x24e59d.group.quaternion.set(_0x3da4a9.quaternion.x, _0x3da4a9.quaternion.y, _0x3da4a9.quaternion.z, _0x3da4a9.quaternion.w);
      const _0x2b4d5e = _0x4e14bb.has(_0x45e5da);
      _0x24e59d.group.visible = !_0x16881e && (!_0x2ff766 || _0x2b4d5e);
      _0x24e59d.bodyMaterial.opacity = _0x2b4d5e ? 1 : 0.8;
      _0x24e59d.helperLineMaterial.opacity = _0x2b4d5e ? 1 : 0.8;
    });
    for (const [_0x4b9574, _0x42a08c] of this._cameraMap.entries()) {
      if (_0x8011bd.has(_0x4b9574)) {
        continue;
      }
      this.scene.remove(_0x42a08c.group);
      disposeObject3D(_0x42a08c.group);
      this._cameraMap.delete(_0x4b9574);
      this._cameraStateById.delete(_0x4b9574);
    }
    if (this._pickMap) {
      this._rebuildPickRoots();
    }
  }
  _resolveGizmoContext(_0x1289a8) {
    const _0x48f5b9 = collectSelectedObjects(_0x1289a8);
    if (_0x48f5b9.length === 0) {
      return null;
    }
    const _0x3b6955 = resolveActiveTransformTool(_0x1289a8);
    const _0x357109 = _0x48f5b9.map(_0x1cb479 => ({
      objectType: _0x1cb479.objectType,
      id: _0x1cb479.objectId,
      item: this._draftObjects.get(_0x1cb479.objectType + ":" + _0x1cb479.objectId) || this._getObjectStateByObjectType(_0x1cb479.objectType, _0x1cb479.objectId),
      visual: this._getVisualByObjectType(_0x1cb479.objectType, _0x1cb479.objectId)
    })).filter(_0x12efc1 => !!_0x12efc1.visual && !!_0x12efc1.item);
    if (_0x357109.length === 0) {
      return null;
    }
    _0x357109.forEach(_0x3e03c4 => {
      _0x3e03c4.pivotWorld = resolveObjectToolPivot(_0x3e03c4.item, _0x3e03c4.visual, _0x3b6955, _0x3e03c4.objectType);
      _0x3e03c4.orientationQuaternion = resolveObjectOrientationQuaternion(_0x3e03c4.item, _0x3e03c4.visual);
    });
    const _0x478e2e = _0x1289a8?.selection?.selectedObjectType === "cube" || _0x1289a8?.selection?.selectedObjectType === "mannequin" || _0x1289a8?.selection?.selectedObjectType === "camera" ? _0x1289a8.selection.selectedObjectType : null;
    const _0x587368 = _0x1289a8?.selection?.selectedObjectId || null;
    const _0x1e54ae = _0x587368 && _0x478e2e ? _0x357109.find(_0x34f76e => _0x34f76e.objectType === _0x478e2e && _0x34f76e.id === _0x587368) || null : null;
    const _0x21869d = _0x1e54ae || _0x357109[0];
    const _0x430739 = new a1080_0x5849f5.Vector3();
    const _0x14f717 = _0x357109.length > 1;
    if (_0x14f717) {
      _0x357109.forEach(_0x35aefe => {
        _0x430739.add(_0x35aefe.pivotWorld);
      });
      _0x430739.multiplyScalar(1 / _0x357109.length);
    } else if (_0x21869d?.pivotWorld) {
      _0x430739.copy(_0x21869d.pivotWorld);
    }
    const _0x24ce3c = _0x14f717 ? measureVisualBoundsForSelection(_0x357109) || createFallbackBounds() : measureVisualBounds(_0x21869d.visual) || createFallbackBounds();
    const _0x473a29 = computeGizmoWorldMetrics(_0x24ce3c, _0x430739);
    const {
      orientationQuaternion: _0x38c0ac,
      usesLocalOrientation: _0x56b073
    } = resolveSelectionGizmoOrientation(_0x357109, _0x21869d, _0x14f717);
    const _0x3b5e70 = _0x21869d?.objectType || null;
    const _0x431efd = _0x357109.filter(_0x24a03e => _0x24a03e.objectType === _0x3b5e70).map(_0x6d102f => _0x6d102f.id);
    return {
      selectedObjectType: _0x3b5e70,
      selectedIds: _0x431efd,
      selectedObjects: _0x357109.map(_0x58c112 => ({
        objectType: _0x58c112.objectType,
        objectId: _0x58c112.id
      })),
      selectedVisuals: _0x357109,
      activeEntry: _0x21869d,
      isMultiSelection: _0x14f717,
      pivot: _0x430739.clone(),
      position: _0x430739.clone(),
      orientationQuaternion: _0x38c0ac,
      usesLocalOrientation: _0x56b073,
      bounds: _0x24ce3c,
      gizmoWorldMetrics: _0x473a29
    };
  }
  _computeWorldUnitsPerPixelAt(_0x50de35) {
    if (!_0x50de35 || !this.camera?.position) {
      return 0;
    }
    const _0x1b66c6 = Math.max(1, Number(this.renderer?.domElement?.clientHeight) || Number(this.renderer?.domElement?.height) || 1);
    return a1080_0x5d112d.computeScene3DWorldUnitsPerPixel(this.camera, _0x1b66c6, _0x50de35);
  }
  _computeScreenConstantGizmoScale(_0x23d350, _0x504a24 = 104) {
    const _0x54a0e9 = this._computeWorldUnitsPerPixelAt(_0x23d350);
    if (!(_0x54a0e9 > 0)) {
      return 1;
    }
    return Math.max(0.35, Math.min(6, _0x54a0e9 * _0x504a24));
  }
  _captureGizmoDragLock(_0x176662) {
    if (!this._gizmo || !_0x176662) {
      return null;
    }
    const _0x13f65f = this._gizmo.root.position.clone();
    const _0x46ddec = this._gizmo.root.quaternion.clone();
    const _0x264fb7 = {
      box: _0x176662.bounds?.box?.clone?.() || createFallbackBounds().box,
      size: _0x176662.bounds?.size?.clone?.() || new a1080_0x5849f5.Vector3(1, 1, 1),
      sphere: _0x176662.bounds?.sphere ? new a1080_0x5849f5.Sphere(_0x176662.bounds.sphere.center?.clone?.() || new a1080_0x5849f5.Vector3(), Number(_0x176662.bounds.sphere.radius) || 0) : new a1080_0x5849f5.Sphere(new a1080_0x5849f5.Vector3(0, 0.5, 0), Math.sqrt(0.75)),
      extents: {
        x: Number(_0x176662.bounds?.extents?.x) || 0,
        y: Number(_0x176662.bounds?.extents?.y) || 0,
        z: Number(_0x176662.bounds?.extents?.z) || 0
      }
    };
    const _0x57ed72 = {
      extents: {
        x: Number(_0x176662.gizmoWorldMetrics?.extents?.x) || 0,
        y: Number(_0x176662.gizmoWorldMetrics?.extents?.y) || 0,
        z: Number(_0x176662.gizmoWorldMetrics?.extents?.z) || 0
      },
      maxExtent: Number(_0x176662.gizmoWorldMetrics?.maxExtent) || 0.01,
      sphereRadius: Number(_0x176662.gizmoWorldMetrics?.sphereRadius) || 0.01,
      margin: Number(_0x176662.gizmoWorldMetrics?.margin) || GIZMO_MARGIN_WORLD_MIN
    };
    const _0x15b42b = {
      ..._0x176662,
      position: _0x13f65f,
      pivot: _0x176662.pivot?.clone?.() || _0x13f65f.clone(),
      orientationQuaternion: _0x46ddec,
      bounds: _0x264fb7,
      gizmoWorldMetrics: _0x57ed72
    };
    const _0x544ccd = this._computeScreenConstantGizmoScale(_0x13f65f);
    this._gizmo.dragLock = {
      context: _0x15b42b,
      position: _0x13f65f.clone(),
      orientationQuaternion: _0x46ddec.clone(),
      bounds: _0x264fb7,
      gizmoWorldMetrics: _0x57ed72,
      scale: _0x544ccd
    };
    return this._gizmo.dragLock;
  }
  _applyGizmoLayoutFromContext(_0x339ef8, _0xb7f0ab) {
    const _0x342399 = this._gizmo?.baseLayout;
    const _0x52bbcc = _0x339ef8?.gizmoWorldMetrics;
    if (!_0x342399 || !_0x52bbcc) {
      return;
    }
    const _0x7c590d = _0x52bbcc.extents;
    const _0x7b0b3a = _0x52bbcc.margin;
    const _0x4d7510 = Math.max(0.01, Number(_0x52bbcc.maxExtent) || 0.01);
    const _0x3d5e7d = Math.max(0.001, Number(_0xb7f0ab) || 1);
    const _0x416855 = GIZMO_MOVE_HEAD_LENGTH * 0.5;
    const _0x3fe76d = GIZMO_SCALE_HEAD_SIZE * 0.5;
    const _0x46f88c = GIZMO_MOVE_PICK_LENGTH - GIZMO_BASE_AXIS_LENGTH;
    const _0x22939b = GIZMO_SCALE_PICK_LENGTH - GIZMO_BASE_SCALE_LENGTH;
    const _0x3f197d = {
      x: _0x7c590d.x + _0x7b0b3a,
      y: _0x7c590d.y + _0x7b0b3a,
      z: _0x7c590d.z + _0x7b0b3a
    };
    ["x", "y", "z"].forEach(_0x5ad95f => {
      const _0x12b406 = this._gizmo?.moveAxes?.[_0x5ad95f];
      const _0x463e81 = this._gizmo?.scaleAxes?.[_0x5ad95f];
      const _0x35847f = Math.max(_0x342399.axisLength, _0x3f197d[_0x5ad95f] / _0x3d5e7d);
      const _0x25603c = Math.max(GIZMO_MOVE_SHAFT_LENGTH, _0x35847f - _0x416855);
      const _0x2cff9e = Math.max(GIZMO_MOVE_PICK_LENGTH, _0x35847f + _0x46f88c);
      if (_0x12b406?.shaftLine) {
        setAxisLineEnd(_0x12b406.shaftLine, _0x5ad95f, _0x25603c);
      }
      if (_0x12b406?.headMesh) {
        setAxisHandleLayout(_0x12b406.headMesh, _0x35847f - _0x416855, _0x416855);
      }
      if (_0x12b406?.pickMesh) {
        setAxisHandleLayout(_0x12b406.pickMesh, _0x2cff9e * 0.5);
        _0x12b406.pickMesh.scale.set(1, _0x2cff9e / GIZMO_MOVE_PICK_LENGTH, 1);
      }
      const _0x2566f7 = _0x342399.scaleLength;
      const _0x1b0d8d = Math.max(GIZMO_SCALE_SHAFT_LENGTH, _0x2566f7 - _0x3fe76d);
      const _0x1e726d = Math.max(GIZMO_SCALE_PICK_LENGTH, _0x2566f7 + _0x22939b);
      if (_0x463e81?.shaftLine) {
        setAxisLineEnd(_0x463e81.shaftLine, _0x5ad95f, _0x1b0d8d);
      }
      if (_0x463e81?.headMesh) {
        setAxisHandleLayout(_0x463e81.headMesh, _0x2566f7 - _0x3fe76d, _0x3fe76d);
      }
      if (_0x463e81?.pickMesh) {
        setAxisHandleLayout(_0x463e81.pickMesh, _0x1e726d * 0.5);
        _0x463e81.pickMesh.scale.set(1, _0x1e726d / GIZMO_SCALE_PICK_LENGTH, 1);
      }
    });
    ["x", "y", "z"].forEach(_0x5e7844 => {
      const _0x213e45 = this._gizmo?.rotateRings?.[_0x5e7844];
      if (_0x213e45?.group) {
        _0x213e45.group.scale.setScalar(1);
      }
    });
    const _0x44c385 = Math.max(_0x342399.planeOffset * 0.5, _0x7b0b3a * 0.42);
    const _0x3649e5 = Math.max(_0x342399.planeOffset, (_0x7c590d.x + _0x44c385) / _0x3d5e7d);
    const _0x499bcb = Math.max(_0x342399.planeOffset, (_0x7c590d.y + _0x44c385) / _0x3d5e7d);
    const _0x5f37a0 = Math.max(_0x342399.planeOffset, (_0x7c590d.z + _0x44c385) / _0x3d5e7d);
    const _0x437efe = _0x342399.planeSize * 0.86;
    const _0x19dd0c = Math.max(_0x342399.planeSize * 1.2, _0x4d7510 / _0x3d5e7d * 0.32);
    const _0x18ac72 = (_0x1e0982, _0x8f5888) => Math.max(_0x437efe, Math.min(_0x19dd0c, Math.min(_0x1e0982, _0x8f5888) * 0.34));
    const _0x34f039 = _0x18ac72(_0x3649e5, _0x499bcb);
    const _0x311eda = _0x18ac72(_0x3649e5, _0x5f37a0);
    const _0x5e06e5 = _0x18ac72(_0x499bcb, _0x5f37a0);
    const _0x297663 = Math.max(_0x342399.planeSize * 0.18, _0x7b0b3a * 0.28) / _0x3d5e7d;
    const _0x24e6c5 = (_0x192d88, _0x136936, _0x4360fe, _0x5299c0, _0x10b288, _0x351eca = 1, _0x4eb265 = 1) => {
      if (!_0x192d88) {
        return;
      }
      const _0x100bda = _0x10b288 / Math.max(0.001, _0x342399.planeSize);
      if (_0x192d88.visualGroup) {
        _0x192d88.visualGroup.position.set(_0x136936, _0x4360fe, _0x5299c0);
        _0x192d88.visualGroup.scale.set(_0x351eca * _0x100bda, _0x4eb265 * _0x100bda, _0x100bda);
      }
      if (_0x192d88.pickMesh) {
        _0x192d88.pickMesh.position.set(_0x136936, _0x4360fe, _0x5299c0);
        _0x192d88.pickMesh.scale.setScalar(_0x100bda);
      }
    };
    const _0x26e1e1 = (_0x22a2fc, _0x47e479) => {
      const _0x24c7af = _0x22a2fc?.[_0x47e479 + "xy"];
      if (_0x24c7af) {
        _0x24e6c5(_0x24c7af, _0x3649e5, _0x499bcb, _0x297663, _0x34f039, 1, 1);
      }
      const _0xc6bccd = _0x22a2fc?.[_0x47e479 + "xz"];
      if (_0xc6bccd) {
        _0x24e6c5(_0xc6bccd, _0x3649e5, _0x297663, _0x5f37a0, _0x311eda, 1, 1);
      }
      const _0x4a000e = _0x22a2fc?.[_0x47e479 + "yz"];
      if (_0x4a000e) {
        _0x24e6c5(_0x4a000e, _0x297663, _0x499bcb, _0x5f37a0, _0x5e06e5, 1, 1);
      }
    };
    _0x26e1e1(this._gizmo?.planeHandles, "plane-");
    _0x26e1e1(this._gizmo?.scalePlaneHandles, "scale-plane-");
  }
  _applyGizmoOrientationFromContext(_0x5119c9, _0x3a15bb = "local") {
    if (!this._gizmo?.root?.quaternion) {
      return;
    }
    if (!_0x5119c9) {
      this._gizmo.root.quaternion.identity();
      return;
    }
    const _0x413ca7 = this._gizmo?.currentTool === "scale" || _0x3a15bb === "local";
    if (!_0x413ca7) {
      this._gizmo.root.quaternion.identity();
      return;
    }
    if (_0x5119c9.isMultiSelection && _0x5119c9.usesLocalOrientation !== true) {
      this._gizmo.root.quaternion.identity();
      return;
    }
    if (_0x5119c9.orientationQuaternion) {
      this._gizmo.root.quaternion.copy(_0x5119c9.orientationQuaternion);
      return;
    }
    this._gizmo.root.quaternion.identity();
  }
  _syncGizmo(_0x5874d6, _0x2cb97c = false) {
    if (_0x2cb97c || _0x5874d6?.mode !== "scene") {
      this._gizmo.root.visible = false;
      this._clearStableGizmoContext();
      this.clearGizmoHandleState();
      return;
    }
    if (!_0x5874d6?.ui?.isEditing) {
      this._gizmo.root.visible = false;
      this._clearStableGizmoContext();
      this.clearGizmoHandleState();
      return;
    }
    const _0x330a4f = resolveActiveTransformTool(_0x5874d6);
    this._gizmo.currentTool = _0x330a4f;
    this._gizmo.root.visible = _0x330a4f === "move" || _0x330a4f === "rotate" || _0x330a4f === "scale";
    if (!this._gizmo.root.visible) {
      this._clearStableGizmoContext();
      this.clearGizmoHandleState();
      return;
    }
    const _0x259350 = buildTransformSelectionSignature(_0x5874d6);
    if (!_0x259350) {
      this._gizmo.root.visible = false;
      this._clearStableGizmoContext();
      this.clearGizmoHandleState();
      return;
    }
    const _0x1efc0a = this._resolveGizmoContext(_0x5874d6);
    const _0x53d742 = _0x1efc0a || this._resolveStableGizmoContext(_0x5874d6);
    if (!_0x53d742) {
      this._gizmo.root.visible = false;
      this.clearGizmoHandleState();
      return;
    }
    if (_0x1efc0a) {
      this._cacheStableGizmoContext(_0x5874d6, _0x1efc0a);
    }
    this._gizmo.moveGroup.visible = _0x330a4f === "move";
    this._gizmo.rotateGroup.visible = _0x330a4f === "rotate";
    this._gizmo.scaleGroup.visible = _0x330a4f === "scale";
    this._gizmo.root.position.copy(_0x53d742.position);
    this._applyGizmoOrientationFromContext(_0x53d742, _0x5874d6?.ui?.transformSpace);
    this._applyGizmoHighlight();
  }
  _applyGizmoPosition() {
    if (!this._sceneState?.ui?.isEditing) {
      return;
    }
    if (!this._gizmo.root.visible) {
      return;
    }
    const _0x2cd4fb = this._gizmo.dragLock;
    if (_0x2cd4fb) {
      this._gizmo.root.position.copy(_0x2cd4fb.position);
      this._gizmo.root.quaternion.copy(_0x2cd4fb.orientationQuaternion);
      this._gizmo.root.scale.setScalar(_0x2cd4fb.scale);
      this._applyGizmoLayoutFromContext(_0x2cd4fb.context, _0x2cd4fb.scale);
      return;
    }
    const _0x3167a8 = this._resolveGizmoContext(this._sceneState);
    const _0x186bcc = _0x3167a8 || this._resolveStableGizmoContext(this._sceneState);
    if (!_0x186bcc) {
      return;
    }
    if (_0x3167a8) {
      this._cacheStableGizmoContext(this._sceneState, _0x3167a8);
    }
    this._gizmo.root.position.copy(_0x186bcc.position);
    this._applyGizmoOrientationFromContext(_0x186bcc, this._sceneState?.ui?.transformSpace);
    const _0x5b611b = this._computeScreenConstantGizmoScale(_0x186bcc.position);
    this._gizmo.root.scale.setScalar(_0x5b611b);
    this._applyGizmoLayoutFromContext(_0x186bcc, _0x5b611b);
  }
  _applyGizmoHighlight() {
    const _0x2b796d = this._gizmo?.hoverHandle || null;
    const _0x2ec812 = this._gizmo?.activeHandle || null;
    const _0x507e11 = _0xebe365 => {
      const _0x2ee8d8 = new Set();
      if (!_0xebe365) {
        return _0x2ee8d8;
      }
      _0x2ee8d8.add(_0xebe365);
      const _0xfda21e = this._gizmo?.handles?.get?.(_0xebe365) || null;
      if (_0xfda21e?.mode === "plane") {
        (_0xfda21e.linkedAxes || []).forEach(_0x4072dd => {
          if (_0x4072dd) {
            _0x2ee8d8.add("axis-" + _0x4072dd);
          }
        });
      }
      return _0x2ee8d8;
    };
    const _0x139ea2 = _0x507e11(_0x2ec812);
    const _0xb78293 = _0x507e11(_0x2b796d);
    this._gizmo?.handles?.forEach((_0x4973cd, _0x46d507) => {
      const _0x749e93 = _0x139ea2.has(_0x46d507);
      const _0x4666dd = !_0x749e93 && _0xb78293.has(_0x46d507);
      const _0x4949e9 = _0x749e93 ? 0.52 : _0x4666dd ? 0.3 : 0;
      const _0xfc4de2 = _0x749e93 ? 1 : _0x4666dd ? 0.92 : 0.8;
      (_0x4973cd.visuals || []).forEach(_0x5e60a6 => {
        const _0xad4d05 = _0x5e60a6?.material;
        const _0x1b7a4d = _0x5e60a6?.color;
        if (!_0xad4d05?.color || !_0x1b7a4d) {
          return;
        }
        _0xad4d05.color.copy(_0x1b7a4d).lerp(new a1080_0x5849f5.Color(16777215), _0x4949e9);
        if (typeof _0x5e60a6.opacity === "number" && "opacity" in _0xad4d05) {
          _0xad4d05.opacity = _0x5e60a6.opacity * _0xfc4de2;
        }
        _0xad4d05.needsUpdate = true;
      });
    });
  }
  _applyRenderView() {
    const _0x1fc638 = this._resolveTargetRenderPose();
    const _0x25bd21 = performance.now();
    const _0xe75ece = this._shouldSmoothTargetPose(_0x1fc638, _0x25bd21);
    const _0x4f67e2 = _0xe75ece ? this._applyPoseSmoothing(_0x1fc638, _0x25bd21) : cloneRenderPose(_0x1fc638);
    const _0x45b247 = _0xe75ece && measurePoseDistance(_0x4f67e2, _0x1fc638) > POSE_SETTLE_EPSILON;
    if (!_0xe75ece || !_0x45b247) {
      this._smoothedPose = cloneRenderPose(_0x1fc638);
      this._lastRenderTime = _0x25bd21;
    }
    this._renderPose = _0x4f67e2;
    this._commitCameraFromPose(_0x4f67e2);
    return {
      keepAnimating: _0x45b247
    };
  }
  _resolveTargetRenderPose() {
    const _0x1b41e6 = this._sceneState;
    const _0x3cc7fa = this._draftView;
    const _0xa1d6a6 = this._isPanorama360Mode(_0x1b41e6);
    let _0x5ead51;
    if (_0xa1d6a6) {
      const _0x24aac7 = _0x3cc7fa?.kind === "panorama-default" ? _0x3cc7fa.panoramaView || _0x1b41e6?.viewport?.panoramaView : _0x1b41e6?.viewport?.panoramaView;
      _0x5ead51 = resolvePanoramaViewPose(_0x24aac7, {
        x: 0,
        y: 0,
        z: 0
      });
    } else if (_0x3cc7fa?.kind === "camera") {
      const _0x44cc2e = normalizeCameraPoseData(_0x3cc7fa);
      _0x5ead51 = {
        kind: "camera",
        position: _0x44cc2e.position,
        quaternion: _0x44cc2e.quaternion,
        rotation: _0x44cc2e.rotation,
        fov: _0x44cc2e.fov
      };
    } else if (_0x3cc7fa?.kind === "scene-default") {
      _0x5ead51 = resolveSceneCameraPose(_0x3cc7fa.sceneView || _0x1b41e6.viewport.sceneView, Number.isFinite(Number(_0x3cc7fa.fov)) ? Number(_0x3cc7fa.fov) : focalLengthToFov(this._defaultSceneFocalLength));
    } else if (_0x3cc7fa?.kind === "panorama-default") {
      _0x5ead51 = resolvePanoramaViewPose(_0x3cc7fa.panoramaView || _0x1b41e6.viewport.panoramaView);
    } else if (_0x1b41e6.mode === "panorama") {
      _0x5ead51 = resolvePanoramaViewPose(_0x1b41e6.viewport.panoramaView);
    } else if (_0x1b41e6?.viewport?.activeView === "camera" && _0x1b41e6?.viewport?.activeCameraId) {
      _0x5ead51 = resolveSceneCameraPose(_0x1b41e6.viewport.sceneView, focalLengthToFov(this._defaultSceneFocalLength));
    } else {
      _0x5ead51 = resolveSceneCameraPose(_0x1b41e6.viewport.sceneView, focalLengthToFov(this._defaultSceneFocalLength));
    }
    return _0x5ead51;
  }
  _shouldSmoothTargetPose(_0x325369, _0x3f4898 = performance.now()) {
    if (this._draftView?.disableSmoothing === true) {
      return false;
    }
    if (!_0x325369 || _0x325369.kind === "camera") {
      return false;
    }
    if (_0x3f4898 <= (this._viewSmoothingUntil || 0)) {
      return true;
    }
    if (!this._smoothedPose || this._smoothedPose.kind !== _0x325369.kind) {
      return false;
    }
    return measurePoseDistance(this._smoothedPose, _0x325369) > POSE_SETTLE_EPSILON;
  }
  _applyPoseSmoothing(_0x5ea68b, _0xc35cd7 = performance.now()) {
    if (!this._smoothedPose || this._smoothedPose.kind !== _0x5ea68b.kind) {
      this._smoothedPose = cloneRenderPose(_0x5ea68b);
      this._lastRenderTime = _0xc35cd7;
      return cloneRenderPose(_0x5ea68b);
    }
    const _0x377eaf = Math.min(VIEW_DAMPING_MAX_DT_MS, Math.max(0, _0xc35cd7 - (this._lastRenderTime || _0xc35cd7)));
    this._lastRenderTime = _0xc35cd7;
    const _0x53b289 = this._smoothedPose;
    if (_0x5ea68b.kind === "panorama-default") {
      _0x53b289.position.x = dampScalar(_0x53b289.position.x, _0x5ea68b.position.x, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
      _0x53b289.position.y = dampScalar(_0x53b289.position.y, _0x5ea68b.position.y, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
      _0x53b289.position.z = dampScalar(_0x53b289.position.z, _0x5ea68b.position.z, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
      _0x53b289.yaw = dampAngle(_0x53b289.yaw, _0x5ea68b.yaw, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
      _0x53b289.pitch = dampScalar(_0x53b289.pitch, _0x5ea68b.pitch, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
      _0x53b289.fov = dampScalar(_0x53b289.fov, _0x5ea68b.fov, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
      return cloneRenderPose(_0x53b289);
    }
    _0x53b289.position.x = dampScalar(_0x53b289.position.x, _0x5ea68b.position.x, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.position.y = dampScalar(_0x53b289.position.y, _0x5ea68b.position.y, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.position.z = dampScalar(_0x53b289.position.z, _0x5ea68b.position.z, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.target.x = dampScalar(_0x53b289.target.x, _0x5ea68b.target.x, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.target.y = dampScalar(_0x53b289.target.y, _0x5ea68b.target.y, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.target.z = dampScalar(_0x53b289.target.z, _0x5ea68b.target.z, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.fov = dampScalar(_0x53b289.fov, _0x5ea68b.fov, _0x377eaf, VIEW_DAMPING_TIME_CONSTANT_MS);
    _0x53b289.yaw = _0x5ea68b.yaw;
    _0x53b289.pitch = _0x5ea68b.pitch;
    _0x53b289.distance = _0x5ea68b.distance;
    return cloneRenderPose(_0x53b289);
  }
  _commitCameraFromPose(_0x740ac9) {
    if (!_0x740ac9) {
      return;
    }
    const _0x25c11c = _0x740ac9?.kind === "panorama-default" ? 55 : 58;
    if (a1080_0x5d112d.applyBridgeCameraProjection(this, _0x740ac9, _0x25c11c)) {
      return;
    }
    if (_0x740ac9.kind === "camera") {
      const _0x478127 = normalizeCameraPoseData(_0x740ac9);
      this.camera.position.set(_0x478127.position.x, _0x478127.position.y, _0x478127.position.z);
      this.camera.quaternion.set(_0x478127.quaternion.x, _0x478127.quaternion.y, _0x478127.quaternion.z, _0x478127.quaternion.w);
      return;
    }
    if (_0x740ac9.kind === "panorama-default") {
      const _0x22acb5 = forwardVectorFromYawPitch(_0x740ac9.yaw, _0x740ac9.pitch);
      this.camera.position.set(0, 0, 0);
      this.camera.lookAt(_0x22acb5.x, _0x22acb5.y, _0x22acb5.z);
      return;
    }
    this.camera.position.set(_0x740ac9.position.x, _0x740ac9.position.y, _0x740ac9.position.z);
    this.camera.lookAt(_0x740ac9.target.x, _0x740ac9.target.y, _0x740ac9.target.z);
  }
  _applyDraftObjects() {
    if (!this._sceneState) {
      return;
    }
    this._mannequinMap.forEach((_0x51cc4c, _0x122956) => {
      const _0x2ef53b = this._mannequinStateById.get(_0x122956);
      if (!_0x2ef53b) {
        return;
      }
      const _0x21849d = this._draftObjects.get("mannequin:" + _0x122956);
      const _0x23aaa7 = _0x21849d || _0x2ef53b;
      applyGroupTransform(_0x51cc4c.group, _0x23aaa7);
      _0x51cc4c.group.position.y = Number(_0x23aaa7?.position?.y) || 0;
      applyGroupScale(_0x51cc4c.group, _0x23aaa7?.scale ?? _0x2ef53b?.scale ?? 1);
    });
    this._cubeMap.forEach((_0x4c450c, _0x487669) => {
      const _0x159a63 = this._cubeStateById.get(_0x487669);
      if (!_0x159a63) {
        return;
      }
      const _0x90ff18 = this._draftObjects.get("cube:" + _0x487669);
      const _0x2c1024 = _0x90ff18 || _0x159a63;
      applyGroupTransform(_0x4c450c.group, _0x2c1024);
      _0x4c450c.group.position.y = Number(_0x2c1024?.position?.y) || 0;
      applyGroupScale(_0x4c450c.group, _0x2c1024?.scale ?? _0x159a63?.scale ?? 1);
    });
    this._cameraMap.forEach((_0x141d8b, _0x5f4efc) => {
      const _0x4862eb = this._cameraStateById.get(_0x5f4efc);
      if (!_0x4862eb) {
        return;
      }
      const _0xeb26d4 = this._draftObjects.get("camera:" + _0x5f4efc);
      applyGroupTransform(_0x141d8b.group, _0xeb26d4 || _0x4862eb);
    });
  }
  _getObjectStateByObjectType(_0x455933, _0x5db64a) {
    if (_0x455933 === "cube") {
      return this._cubeStateById.get(_0x5db64a) || null;
    }
    if (_0x455933 === "mannequin") {
      return this._mannequinStateById.get(_0x5db64a) || null;
    }
    if (_0x455933 === "camera") {
      return this._cameraStateById.get(_0x5db64a) || null;
    }
    return null;
  }
  _getVisualByObjectType(_0x21ea75, _0x37ca9d) {
    const _0xc8b0bb = this._visualOverrides?.get?.(_0x21ea75 + ":" + _0x37ca9d);
    if (_0xc8b0bb) {
      return _0xc8b0bb;
    }
    if (_0x21ea75 === "cube") {
      return this._cubeMap.get(_0x37ca9d);
    }
    if (_0x21ea75 === "mannequin") {
      return this._mannequinMap.get(_0x37ca9d);
    }
    if (_0x21ea75 === "camera") {
      return this._cameraMap.get(_0x37ca9d);
    }
    return null;
  }
}