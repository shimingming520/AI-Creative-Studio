import { PANORAMA_SCENE_CAMERA_CONSTRAINTS, SCENE_DEFAULT_FOCAL_LENGTH_MM, SCENE_ORBIT_DISTANCE_MAX, SCENE_ORBIT_DISTANCE_MIN, clampPanoramaPitch, clampSceneFocalLength, clampSceneOrbitPitch } from "../../core/panoramaSceneMath.js";
import { t } from "../../i18n/index.js";
import { createDefaultCameraTimeline, normalizeCameraTimeline } from "./cameraTimeline.js";
import { resolveSceneAsset } from "./sceneAssetCatalog.js";
import { DEFAULT_MANNEQUIN_POSE_ID, normalizeBonePose, normalizeCustomMannequinPose } from "./poseCatalog.js";
function panoramaSceneText(_0x5bb742, _0x2092ac = {}) {
  return t("panoramaSceneNode." + _0x5bb742, _0x2092ac);
}
const PANORAMA_SCENE_NODE_TYPE = "panorama-scene";
const PANORAMA_SCENE_NODE_ALIASES = ["panorama_scene"];
const PANORAMA_360_NODE_TYPE = "panorama-360";
const PANORAMA_360_NODE_ALIASES = ["panorama_360", "panorama360"];
const PANORAMA_SCENE_CAMERA_LIMIT = 10;
const PANORAMA_SCENE_DEFAULT_SIZE = Object.freeze({
  width: 1024,
  height: 576
});
const PANORAMA_SCENE_COLLAPSED_MAX_SIZE = 288;
const PANORAMA_SCENE_DEFAULT_NAME = "3D导演台";
const PANORAMA_360_DEFAULT_NAME = "360全景图";
function getPanoramaSceneDefaultName() {
  return panoramaSceneText("defaults.sceneNodeName");
}
function getPanorama360DefaultName() {
  return panoramaSceneText("defaults.panorama360NodeName");
}
const PANORAMA_SCENE_COLOR_TOKENS = Object.freeze({
  red: "--red",
  blue: "--blue",
  green: "--green",
  yellow: "--gold",
  purple: "--purple",
  cyan: "--cyan",
  black: "--black",
  white: "--white"
});
const DEFAULT_SCENE_VIEW = Object.freeze({
  target: Object.freeze({
    x: 0,
    y: 1.2,
    z: 0
  }),
  orbitYaw: Math.PI / 4,
  orbitPitch: Math.PI / 4,
  orbitDistance: 9
});
const DEFAULT_PANORAMA_VIEW = Object.freeze({
  yaw: 0,
  pitch: PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.pitch.default,
  fov: PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.fov.default
});
const DEFAULT_GRID_PLACEMENT = Object.freeze({
  rows: 2,
  cols: 3,
  spacingX: 1.8,
  spacingZ: 1.8,
  gender: "male",
  colorKey: "blue"
});
function toFiniteNumber(_0x8b5cff, _0x244736) {
  const _0x262e4b = Number(_0x8b5cff);
  if (Number.isFinite(_0x262e4b)) {
    return _0x262e4b;
  } else {
    return _0x244736;
  }
}
function normalizeVector3(_0xe360af, _0x45106b) {
  return {
    x: toFiniteNumber(_0xe360af?.x, _0x45106b.x),
    y: toFiniteNumber(_0xe360af?.y, _0x45106b.y),
    z: toFiniteNumber(_0xe360af?.z, _0x45106b.z)
  };
}
function normalizeEuler(_0x2e5545, _0x40f491) {
  return {
    x: toFiniteNumber(_0x2e5545?.x, _0x40f491.x),
    y: toFiniteNumber(_0x2e5545?.y, _0x40f491.y),
    z: toFiniteNumber(_0x2e5545?.z, _0x40f491.z)
  };
}
function normalizeScaleValue(_0x4d4c5e, _0x10a0f0 = 1) {
  if (Number.isFinite(_0x4d4c5e)) {
    return Math.max(0.01, Number(_0x4d4c5e) || 1);
  }
  if (_0x4d4c5e && Number.isFinite(_0x4d4c5e.x) && Number.isFinite(_0x4d4c5e.y) && Number.isFinite(_0x4d4c5e.z)) {
    return {
      x: Math.max(0.01, Number(_0x4d4c5e.x) || 1),
      y: Math.max(0.01, Number(_0x4d4c5e.y) || 1),
      z: Math.max(0.01, Number(_0x4d4c5e.z) || 1)
    };
  }
  if (_0x10a0f0 && Number.isFinite(_0x10a0f0.x) && Number.isFinite(_0x10a0f0.y) && Number.isFinite(_0x10a0f0.z)) {
    return {
      x: Math.max(0.01, Number(_0x10a0f0.x) || 1),
      y: Math.max(0.01, Number(_0x10a0f0.y) || 1),
      z: Math.max(0.01, Number(_0x10a0f0.z) || 1)
    };
  }
  return Math.max(0.01, Number(_0x10a0f0) || 1);
}
function clamp(_0x4063c9, _0x464cfe, _0x1e36fc) {
  return Math.min(_0x1e36fc, Math.max(_0x464cfe, _0x4063c9));
}
function normalizeQuaternion(_0x3f6ae2, _0x2c9c36 = {
  x: 0,
  y: 0,
  z: 0,
  w: 1
}) {
  const _0x49fc57 = Number(_0x3f6ae2?.x);
  const _0x30ee36 = Number(_0x3f6ae2?.y);
  const _0x327ee5 = Number(_0x3f6ae2?.z);
  const _0x572543 = Number(_0x3f6ae2?.w);
  if (!Number.isFinite(_0x49fc57) || !Number.isFinite(_0x30ee36) || !Number.isFinite(_0x327ee5) || !Number.isFinite(_0x572543)) {
    return {
      ..._0x2c9c36
    };
  }
  const _0x2865ed = Math.hypot(_0x49fc57, _0x30ee36, _0x327ee5, _0x572543);
  if (_0x2865ed < 0.000001) {
    return {
      ..._0x2c9c36
    };
  }
  return {
    x: _0x49fc57 / _0x2865ed,
    y: _0x30ee36 / _0x2865ed,
    z: _0x327ee5 / _0x2865ed,
    w: _0x572543 / _0x2865ed
  };
}
function quaternionFromEulerYXZ(_0x5b5508) {
  const _0x3c91b1 = Number(_0x5b5508?.x) || 0;
  const _0x312d7e = Number(_0x5b5508?.y) || 0;
  const _0x5324ca = Number(_0x5b5508?.z) || 0;
  const _0x20fdb1 = Math.cos(_0x3c91b1 / 2);
  const _0x23eefa = Math.cos(_0x312d7e / 2);
  const _0x260a67 = Math.cos(_0x5324ca / 2);
  const _0x30fe1c = Math.sin(_0x3c91b1 / 2);
  const _0x1c40c3 = Math.sin(_0x312d7e / 2);
  const _0x5927a3 = Math.sin(_0x5324ca / 2);
  return normalizeQuaternion({
    x: _0x30fe1c * _0x23eefa * _0x260a67 + _0x20fdb1 * _0x1c40c3 * _0x5927a3,
    y: _0x20fdb1 * _0x1c40c3 * _0x260a67 - _0x30fe1c * _0x23eefa * _0x5927a3,
    z: _0x20fdb1 * _0x23eefa * _0x5927a3 - _0x30fe1c * _0x1c40c3 * _0x260a67,
    w: _0x20fdb1 * _0x23eefa * _0x260a67 + _0x30fe1c * _0x1c40c3 * _0x5927a3
  });
}
function eulerFromQuaternionYXZ(_0x2476ed) {
  const _0x489bbc = normalizeQuaternion(_0x2476ed);
  const _0x31431d = _0x489bbc.x * _0x489bbc.x;
  const _0x79ce9e = _0x489bbc.y * _0x489bbc.y;
  const _0x775530 = _0x489bbc.z * _0x489bbc.z;
  const _0x1b88cf = _0x489bbc.x * _0x489bbc.y;
  const _0x4faed6 = _0x489bbc.x * _0x489bbc.z;
  const _0x4775cd = _0x489bbc.y * _0x489bbc.z;
  const _0xb6ff9c = _0x489bbc.x * _0x489bbc.w;
  const _0x1e0594 = _0x489bbc.y * _0x489bbc.w;
  const _0x589463 = _0x489bbc.z * _0x489bbc.w;
  const _0xf71a18 = 1 - (_0x79ce9e + _0x775530) * 2;
  const _0x370f15 = (_0x4faed6 + _0x1e0594) * 2;
  const _0x35eef2 = (_0x1b88cf + _0x589463) * 2;
  const _0x14d3b8 = 1 - (_0x31431d + _0x775530) * 2;
  const _0x1efe17 = (_0x4775cd - _0xb6ff9c) * 2;
  const _0x363761 = (_0x4faed6 - _0x1e0594) * 2;
  const _0x39eb46 = 1 - (_0x31431d + _0x79ce9e) * 2;
  const _0x49d5b1 = Math.asin(-clamp(_0x1efe17, -1, 1));
  if (Math.abs(_0x1efe17) < 0.9999999) {
    return {
      x: _0x49d5b1,
      y: Math.atan2(_0x370f15, _0x39eb46),
      z: Math.atan2(_0x35eef2, _0x14d3b8)
    };
  }
  return {
    x: _0x49d5b1,
    y: Math.atan2(-_0x363761, _0xf71a18),
    z: 0
  };
}
function quaternionFromEulerXYZ(_0xdbed2f) {
  const _0x579163 = Number(_0xdbed2f?.x) || 0;
  const _0x4aae23 = Number(_0xdbed2f?.y) || 0;
  const _0x3cbb22 = Number(_0xdbed2f?.z) || 0;
  const _0x203e83 = Math.cos(_0x579163 / 2);
  const _0x446743 = Math.cos(_0x4aae23 / 2);
  const _0x163b73 = Math.cos(_0x3cbb22 / 2);
  const _0x1c30ad = Math.sin(_0x579163 / 2);
  const _0x228d29 = Math.sin(_0x4aae23 / 2);
  const _0x584f76 = Math.sin(_0x3cbb22 / 2);
  return normalizeQuaternion({
    x: _0x1c30ad * _0x446743 * _0x163b73 + _0x203e83 * _0x228d29 * _0x584f76,
    y: _0x203e83 * _0x228d29 * _0x163b73 - _0x1c30ad * _0x446743 * _0x584f76,
    z: _0x203e83 * _0x446743 * _0x584f76 + _0x1c30ad * _0x228d29 * _0x163b73,
    w: _0x203e83 * _0x446743 * _0x163b73 - _0x1c30ad * _0x228d29 * _0x584f76
  });
}
function eulerFromQuaternionXYZ(_0x219798) {
  const _0x4b7640 = normalizeQuaternion(_0x219798);
  const _0x5ad98f = _0x4b7640.x * _0x4b7640.x;
  const _0x521e62 = _0x4b7640.y * _0x4b7640.y;
  const _0x11543e = _0x4b7640.z * _0x4b7640.z;
  const _0x47d668 = _0x4b7640.x * _0x4b7640.y;
  const _0x57998d = _0x4b7640.x * _0x4b7640.z;
  const _0x280ca6 = _0x4b7640.y * _0x4b7640.z;
  const _0xf481b8 = _0x4b7640.x * _0x4b7640.w;
  const _0x39585f = _0x4b7640.y * _0x4b7640.w;
  const _0x61524c = _0x4b7640.z * _0x4b7640.w;
  const _0x25e3ee = 1 - (_0x521e62 + _0x11543e) * 2;
  const _0x9f97d3 = (_0x47d668 - _0x61524c) * 2;
  const _0x2a5d7b = (_0x57998d + _0x39585f) * 2;
  const _0x1fa011 = (_0x280ca6 - _0xf481b8) * 2;
  const _0x4bf4e0 = 1 - (_0x5ad98f + _0x521e62) * 2;
  const _0x2ef31c = (_0x280ca6 + _0xf481b8) * 2;
  const _0x343f4f = 1 - (_0x5ad98f + _0x11543e) * 2;
  const _0x11cc91 = Math.asin(clamp(_0x2a5d7b, -1, 1));
  if (Math.abs(_0x2a5d7b) < 0.9999999) {
    return {
      x: Math.atan2(-_0x1fa011, _0x4bf4e0),
      y: _0x11cc91,
      z: Math.atan2(-_0x9f97d3, _0x25e3ee)
    };
  }
  return {
    x: Math.atan2(_0x2ef31c, _0x343f4f),
    y: _0x11cc91,
    z: 0
  };
}
function normalizeMode(_0x2770c7) {
  if (_0x2770c7 === "panorama") {
    return "panorama";
  } else {
    return "scene";
  }
}
function normalizeNodeTypeValue(_0x2843a0) {
  return String(_0x2843a0 || "").trim();
}
export function isPanoramaSceneNodeType(_0x44fae1) {
  const _0x41a7df = normalizeNodeTypeValue(_0x44fae1);
  return _0x41a7df === PANORAMA_SCENE_NODE_TYPE || PANORAMA_SCENE_NODE_ALIASES.includes(_0x41a7df);
}
export function isPanorama360NodeType(_0x44b53a) {
  const _0x186e11 = normalizeNodeTypeValue(_0x44b53a);
  return _0x186e11 === PANORAMA_360_NODE_TYPE || PANORAMA_360_NODE_ALIASES.includes(_0x186e11);
}
export function isPanoramaGraphNodeType(_0x3365af) {
  return isPanoramaSceneNodeType(_0x3365af) || isPanorama360NodeType(_0x3365af);
}
export function getPanoramaStateFieldByNodeType(_0x170a0e) {
  if (isPanorama360NodeType(_0x170a0e)) {
    return "panorama360Node";
  }
  if (isPanoramaSceneNodeType(_0x170a0e)) {
    return "sceneNode";
  }
  return "";
}
function normalizeEnvironmentMode(_0x42d42f) {
  if (_0x42d42f === "night") {
    return "night";
  } else {
    return "day";
  }
}
function normalizeActiveView(_0x9f15a8) {
  if (_0x9f15a8 === "camera") {
    return "camera";
  } else {
    return "default";
  }
}
function normalizeSelectionType(_0x1fa418) {
  if (_0x1fa418 === "mannequin" || _0x1fa418 === "cube" || _0x1fa418 === "camera") {
    return _0x1fa418;
  } else {
    return null;
  }
}
function normalizeGender(_0x31f3aa) {
  if (_0x31f3aa === "female") {
    return "female";
  } else {
    return "male";
  }
}
function normalizeBodyProfile(_0x2fee65) {
  if (!_0x2fee65 || typeof _0x2fee65 !== "object") {
    return null;
  }
  return {
    gender: normalizeGender(_0x2fee65.gender),
    ageGroup: String(_0x2fee65.ageGroup || "adult").trim() || "adult",
    height: clamp(toFiniteNumber(_0x2fee65.height, 1.92), 0.55, 2.3),
    shoulderScale: clamp(toFiniteNumber(_0x2fee65.shoulderScale, 1), 0.65, 1.35),
    hipScale: clamp(toFiniteNumber(_0x2fee65.hipScale, 1), 0.65, 1.35),
    headScale: clamp(toFiniteNumber(_0x2fee65.headScale, 1), 0.85, 1.45),
    depthScale: clamp(toFiniteNumber(_0x2fee65.depthScale, 1), 0.75, 1.25)
  };
}
function normalizeColorKey(_0x56114a) {
  if (PANORAMA_SCENE_COLOR_TOKENS[_0x56114a]) {
    return _0x56114a;
  } else {
    return "blue";
  }
}
function normalizeLegacyTool(_0x3dd391) {
  if (_0x3dd391 === "move" || _0x3dd391 === "rotate" || _0x3dd391 === "scale" || _0x3dd391 === "box-select") {
    return _0x3dd391;
  } else {
    return "navigate";
  }
}
function normalizeMouseTool(_0x46946c) {
  if (_0x46946c === "box-select") {
    return "box-select";
  } else {
    return "navigate";
  }
}
function normalizeTransformTool(_0x5827e1) {
  if (_0x5827e1 === "move" || _0x5827e1 === "rotate" || _0x5827e1 === "scale") {
    return _0x5827e1;
  } else {
    return "move";
  }
}
function normalizeTransformSpace(_0x5a2964) {
  if (_0x5a2964 === "local") {
    return "local";
  } else {
    return "world";
  }
}
function normalizePivotMode(_0x396297) {
  if (_0x396297 === "center") {
    return "center";
  } else {
    return "active";
  }
}
function normalizeNavigationPreset(_0x4f8172) {
  if (_0x4f8172 === "dcc") {
    return "dcc";
  } else {
    return "dcc";
  }
}
function normalizeNavigationMode(_0x14ab1e) {
  if (_0x14ab1e === "fly") {
    return "fly";
  } else {
    return "orbit";
  }
}
function normalizeCaptureMode(_0x4c63a0) {
  const _0x5437e4 = String(_0x4c63a0 || "").trim();
  if (_0x5437e4 === "9:16" || _0x5437e4 === "2.35:1") {
    return _0x5437e4;
  }
  return "adaptive";
}
export function createDefaultSceneView() {
  return {
    target: {
      ...DEFAULT_SCENE_VIEW.target
    },
    orbitYaw: DEFAULT_SCENE_VIEW.orbitYaw,
    orbitPitch: DEFAULT_SCENE_VIEW.orbitPitch,
    orbitDistance: DEFAULT_SCENE_VIEW.orbitDistance
  };
}
export function createDefaultPanoramaView() {
  return {
    ...DEFAULT_PANORAMA_VIEW
  };
}
export function createDefaultGridPlacement() {
  return {
    ...DEFAULT_GRID_PLACEMENT
  };
}
export function createDefaultPanoramaSceneState() {
  return {
    version: 2,
    mode: "scene",
    environmentMode: "night",
    viewport: {
      activeView: "default",
      activeCameraId: null,
      sceneView: createDefaultSceneView(),
      panoramaView: createDefaultPanoramaView()
    },
    panorama: {
      localPath: null,
      imageUrl: null,
      previewImageUrl: null,
      fileName: null,
      sourceSignature: null,
      isLoaded: false,
      error: null
    },
    mannequins: [],
    cubes: [],
    cameras: [],
    customPoses: [],
    cameraTimeline: createDefaultCameraTimeline(),
    selection: {
      selectedObjectType: null,
      selectedObjectId: null,
      selectedObjectIds: [],
      selectedObjects: [],
      selectedGroupId: null
    },
    groups: [],
    gridPlacement: createDefaultGridPlacement(),
    capture: {
      pending: false,
      lastCaptureAt: null,
      error: null,
      mode: "adaptive",
      showSafeFrame: false
    },
    ui: {
      mouseTool: "navigate",
      transformTool: "move",
      activeTool: "navigate",
      transformSpace: "world",
      pivotMode: "active",
      navigationPreset: "dcc",
      navigationMode: "orbit",
      flySpeed: 4,
      snapEnabled: false,
      translationSnap: 0.25,
      rotationSnap: Math.PI / 12,
      scaleSnap: 0.1,
      groundLock: true,
      uniformScale: true,
      showCameraList: false,
      showTimeline: false,
      showOutline: true,
      isEditing: false
    }
  };
}
export function createDefaultPanorama360State() {
  const _0x1feff1 = createDefaultPanoramaSceneState();
  _0x1feff1.mode = "panorama";
  _0x1feff1.viewport.activeView = "default";
  _0x1feff1.viewport.activeCameraId = null;
  _0x1feff1.cubes = [];
  _0x1feff1.cameras = [];
  _0x1feff1.ui.showCameraList = false;
  return _0x1feff1;
}
export function normalizePanoramaSceneState(_0x1b2904) {
  const _0x2c585c = createDefaultPanoramaSceneState();
  const _0xb0ae4 = {
    ..._0x2c585c.viewport.sceneView,
    ...(_0x1b2904?.viewport?.sceneView || {})
  };
  delete _0xb0ae4.fov;
  _0xb0ae4.target = normalizeVector3(_0x1b2904?.viewport?.sceneView?.target, _0x2c585c.viewport.sceneView.target);
  _0xb0ae4.orbitYaw = toFiniteNumber(_0x1b2904?.viewport?.sceneView?.orbitYaw, _0x2c585c.viewport.sceneView.orbitYaw);
  _0xb0ae4.orbitPitch = clampSceneOrbitPitch(toFiniteNumber(_0x1b2904?.viewport?.sceneView?.orbitPitch, _0x2c585c.viewport.sceneView.orbitPitch));
  _0xb0ae4.orbitDistance = clamp(toFiniteNumber(_0x1b2904?.viewport?.sceneView?.orbitDistance, _0x2c585c.viewport.sceneView.orbitDistance), SCENE_ORBIT_DISTANCE_MIN, SCENE_ORBIT_DISTANCE_MAX);
  const _0x4dc82f = {
    ..._0x2c585c.viewport.panoramaView,
    ...(_0x1b2904?.viewport?.panoramaView || {})
  };
  _0x4dc82f.yaw = toFiniteNumber(_0x1b2904?.viewport?.panoramaView?.yaw, _0x2c585c.viewport.panoramaView.yaw);
  _0x4dc82f.pitch = clampPanoramaPitch(toFiniteNumber(_0x1b2904?.viewport?.panoramaView?.pitch, _0x2c585c.viewport.panoramaView.pitch));
  _0x4dc82f.fov = Math.max(PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.fov.min, Math.min(PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.fov.max, toFiniteNumber(_0x1b2904?.viewport?.panoramaView?.fov, _0x2c585c.viewport.panoramaView.fov)));
  const _0x1795be = Array.isArray(_0x1b2904?.mannequins) ? _0x1b2904.mannequins.filter(_0x1f3fcf => _0x1f3fcf && _0x1f3fcf.id).map(_0x2b4cf9 => {
    const _0xdd8eba = normalizeEuler(_0x2b4cf9.rotation, {
      x: 0,
      y: 0,
      z: 0
    });
    const _0x688456 = Number.isFinite(Number(_0x2b4cf9?.quaternion?.x)) && Number.isFinite(Number(_0x2b4cf9?.quaternion?.y)) && Number.isFinite(Number(_0x2b4cf9?.quaternion?.z)) && Number.isFinite(Number(_0x2b4cf9?.quaternion?.w));
    const _0x422d75 = _0x688456 ? normalizeQuaternion(_0x2b4cf9.quaternion, quaternionFromEulerXYZ(_0xdd8eba)) : quaternionFromEulerXYZ(_0xdd8eba);
    const _0xa6567e = _0x688456 ? eulerFromQuaternionXYZ(_0x422d75) : _0xdd8eba;
    return {
      id: _0x2b4cf9.id,
      gender: normalizeGender(_0x2b4cf9.gender),
      bodyPresetId: String(_0x2b4cf9.bodyPresetId || "").trim() || null,
      bodyProfile: normalizeBodyProfile(_0x2b4cf9.bodyProfile),
      colorKey: normalizeColorKey(_0x2b4cf9.colorKey || _0x2b4cf9.color),
      poseId: String(_0x2b4cf9.poseId || DEFAULT_MANNEQUIN_POSE_ID).trim() || DEFAULT_MANNEQUIN_POSE_ID,
      customPoseId: _0x2b4cf9.customPoseId ? String(_0x2b4cf9.customPoseId).trim() : null,
      bonePose: normalizeBonePose(_0x2b4cf9.bonePose),
      position: normalizeVector3(_0x2b4cf9.position, {
        x: 0,
        y: 0,
        z: 0
      }),
      rotation: _0xa6567e,
      quaternion: _0x422d75,
      scale: normalizeScaleValue(_0x2b4cf9.scale, 1)
    };
  }) : [];
  const _0x3cf566 = Array.isArray(_0x1b2904?.cubes) ? _0x1b2904.cubes.filter(_0x1840a1 => _0x1840a1 && _0x1840a1.id).map(_0x5cf197 => {
    const _0x5ba40d = normalizeEuler(_0x5cf197.rotation, {
      x: 0,
      y: 0,
      z: 0
    });
    const _0x416f3e = Number.isFinite(Number(_0x5cf197?.quaternion?.x)) && Number.isFinite(Number(_0x5cf197?.quaternion?.y)) && Number.isFinite(Number(_0x5cf197?.quaternion?.z)) && Number.isFinite(Number(_0x5cf197?.quaternion?.w));
    const _0x53cd04 = _0x416f3e ? normalizeQuaternion(_0x5cf197.quaternion, quaternionFromEulerXYZ(_0x5ba40d)) : quaternionFromEulerXYZ(_0x5ba40d);
    const _0x58022b = _0x416f3e ? eulerFromQuaternionXYZ(_0x53cd04) : _0x5ba40d;
    return {
      id: _0x5cf197.id,
      assetId: resolveSceneAsset(_0x5cf197.assetId)?.id || null,
      colorKey: normalizeColorKey(_0x5cf197.colorKey || _0x5cf197.color),
      position: normalizeVector3(_0x5cf197.position, {
        x: 0,
        y: 0,
        z: 0
      }),
      rotation: _0x58022b,
      quaternion: _0x53cd04,
      scale: normalizeScaleValue(_0x5cf197.scale, 1)
    };
  }) : [];
  const _0x3524bb = Array.isArray(_0x1b2904?.cameras) ? _0x1b2904.cameras.filter(_0x1611f8 => _0x1611f8 && _0x1611f8.id).slice(0, PANORAMA_SCENE_CAMERA_LIMIT).map((_0x114d72, _0x21bea1) => {
    const _0x419dbf = normalizeEuler(_0x114d72.rotation, {
      x: 0,
      y: 0,
      z: 0
    });
    const _0x40951d = Number.isFinite(Number(_0x114d72?.quaternion?.x)) && Number.isFinite(Number(_0x114d72?.quaternion?.y)) && Number.isFinite(Number(_0x114d72?.quaternion?.z)) && Number.isFinite(Number(_0x114d72?.quaternion?.w));
    const _0x2bd3a0 = _0x40951d ? normalizeQuaternion(_0x114d72.quaternion, quaternionFromEulerYXZ(_0x419dbf)) : quaternionFromEulerYXZ(_0x419dbf);
    const _0x74056 = _0x40951d ? eulerFromQuaternionYXZ(_0x2bd3a0) : _0x419dbf;
    return {
      id: _0x114d72.id,
      slot: Number.isInteger(Number(_0x114d72.slot)) ? Math.max(1, Math.min(PANORAMA_SCENE_CAMERA_LIMIT, Number(_0x114d72.slot))) : null,
      name: String(_0x114d72.name || panoramaSceneText("camera.defaultName", {
        slot: _0x21bea1 + 1
      })).trim() || panoramaSceneText("camera.defaultName", {
        slot: _0x21bea1 + 1
      }),
      position: normalizeVector3(_0x114d72.position, {
        x: 0,
        y: 1.6,
        z: 4
      }),
      quaternion: _0x2bd3a0,
      rotation: _0x74056,
      focalLength: clampSceneFocalLength(Object.prototype.hasOwnProperty.call(_0x114d72 || {}, "focalLength") ? toFiniteNumber(_0x114d72.focalLength, SCENE_DEFAULT_FOCAL_LENGTH_MM) : SCENE_DEFAULT_FOCAL_LENGTH_MM)
    };
  }) : [];
  const _0x593e20 = new Map();
  if (Array.isArray(_0x1b2904?.customPoses)) {
    _0x1b2904.customPoses.forEach(_0x1af2ce => {
      const _0x374ae2 = normalizeCustomMannequinPose(_0x1af2ce);
      if (!_0x374ae2.id || _0x374ae2.id === "custom") {
        return;
      }
      _0x593e20.set(_0x374ae2.id, _0x374ae2);
    });
  }
  const _0x55e23f = [..._0x593e20.values()];
  const _0x572a21 = normalizeCameraTimeline(_0x1b2904?.cameraTimeline || _0x2c585c.cameraTimeline);
  const _0x3b1af4 = new Set(_0x1795be.map(_0x210eca => _0x210eca.id));
  const _0x30c5d4 = new Set(_0x3cf566.map(_0xd39336 => _0xd39336.id));
  const _0x26ee0a = Array.isArray(_0x1b2904?.groups) ? _0x1b2904.groups.filter(_0x27bcbd => _0x27bcbd && _0x27bcbd.id).map(_0x189b52 => {
    const _0x2e909c = Array.isArray(_0x189b52.memberIds) ? [...new Set(_0x189b52.memberIds.map(_0x124c64 => String(_0x124c64 || "").trim()).filter(Boolean))] : [];
    const _0x4a2db3 = _0x2e909c.filter(_0x29035c => _0x3b1af4.has(_0x29035c));
    return {
      id: String(_0x189b52.id),
      type: _0x189b52.type === "mannequin-grid" ? "mannequin-grid" : "mannequin-grid",
      memberObjectType: _0x189b52.memberObjectType === "mannequin" ? "mannequin" : "mannequin",
      memberIds: _0x4a2db3
    };
  }).filter(_0xdfee1c => _0xdfee1c.memberIds.length > 0) : [];
  const _0xe6ecb0 = String(_0x1b2904?.viewport?.activeCameraId || "").trim() || null;
  const _0x565f0b = _0xe6ecb0 ? _0x3524bb.some(_0x3ce422 => _0x3ce422.id === _0xe6ecb0) : false;
  const _0x1fe772 = normalizeSelectionType(_0x1b2904?.selection?.selectedObjectType);
  const _0x1fa510 = _0x1b2904?.selection?.selectedObjectId ? String(_0x1b2904.selection.selectedObjectId) : null;
  const _0x41307e = Array.isArray(_0x1b2904?.selection?.selectedObjectIds) ? [...new Set(_0x1b2904.selection.selectedObjectIds.map(_0x9e9fb => String(_0x9e9fb || "").trim()).filter(Boolean))] : _0x1fa510 ? [_0x1fa510] : [];
  const _0x1cf3e2 = _0x1b2904?.selection?.selectedGroupId ? String(_0x1b2904.selection.selectedGroupId).trim() : null;
  const _0x80db78 = _0x1cf3e2 ? _0x26ee0a.find(_0x58982a => _0x58982a.id === _0x1cf3e2) || null : null;
  const _0x3d87e9 = new Set(_0x3524bb.map(_0x5decad => _0x5decad.id));
  const _0xdf9ca9 = Array.isArray(_0x1b2904?.selection?.selectedObjects) ? _0x1b2904.selection.selectedObjects : [];
  const _0x3c890a = [];
  const _0x3e3cd1 = new Set();
  _0xdf9ca9.forEach(_0x4d2707 => {
    const _0x136de5 = normalizeSelectionType(_0x4d2707?.objectType);
    const _0x526be5 = String(_0x4d2707?.objectId || "").trim();
    if (!_0x136de5 || !_0x526be5) {
      return;
    }
    const _0x10b802 = _0x136de5 === "camera" ? _0x3d87e9.has(_0x526be5) : _0x136de5 === "cube" ? _0x30c5d4.has(_0x526be5) : _0x3b1af4.has(_0x526be5);
    if (!_0x10b802) {
      return;
    }
    const _0x446520 = _0x136de5 + ":" + _0x526be5;
    if (_0x3e3cd1.has(_0x446520)) {
      return;
    }
    _0x3e3cd1.add(_0x446520);
    _0x3c890a.push({
      objectType: _0x136de5,
      objectId: _0x526be5
    });
  });
  const _0x126245 = _0x1fe772;
  const _0x35d9b1 = _0x126245 === "camera" ? _0x1fa510 && _0x3d87e9.has(_0x1fa510) ? _0x1fa510 : null : _0x126245 === "cube" ? _0x1fa510 && _0x30c5d4.has(_0x1fa510) ? _0x1fa510 : null : _0x1fa510 && _0x3b1af4.has(_0x1fa510) ? _0x1fa510 : null;
  let _0x1f8f57 = _0x41307e.filter(_0x5617f0 => _0x126245 === "camera" ? _0x3d87e9.has(_0x5617f0) : _0x126245 === "cube" ? _0x30c5d4.has(_0x5617f0) : _0x3b1af4.has(_0x5617f0));
  let _0x21da25 = _0x126245;
  let _0xad95e2 = _0x35d9b1;
  let _0x52063d = _0x80db78 ? _0x80db78.id : null;
  if (!_0x21da25 && _0x1f8f57.length > 0) {
    const _0x5e04cb = _0x1f8f57[0];
    if (_0x30c5d4.has(_0x5e04cb)) {
      _0x21da25 = "cube";
      _0x1f8f57 = _0x1f8f57.filter(_0x5bc22b => _0x30c5d4.has(_0x5bc22b));
    } else if (_0x3d87e9.has(_0x5e04cb)) {
      _0x21da25 = "camera";
      _0x1f8f57 = _0x1f8f57.filter(_0x3cfd5e => _0x3d87e9.has(_0x3cfd5e));
    } else {
      _0x21da25 = "mannequin";
      _0x1f8f57 = _0x1f8f57.filter(_0x28760c => _0x3b1af4.has(_0x28760c));
    }
  }
  if (_0x80db78) {
    _0x21da25 = "mannequin";
    _0x1f8f57 = [..._0x80db78.memberIds];
    _0xad95e2 = _0x80db78.memberIds[0] || null;
  } else if (_0x1f8f57.length > 0) {
    _0xad95e2 = _0x1f8f57.includes(_0xad95e2) && _0xad95e2 ? _0xad95e2 : _0x1f8f57[0];
    if (_0x21da25 !== "mannequin") {
      _0x52063d = null;
    }
  } else if (_0xad95e2) {
    _0x1f8f57 = [_0xad95e2];
  } else {
    _0xad95e2 = null;
    _0x21da25 = null;
    _0x52063d = null;
  }
  let _0x4d245b = _0x3c890a;
  if (_0x4d245b.length === 0) {
    if (_0x80db78) {
      _0x4d245b = _0x80db78.memberIds.map(_0x2a7029 => ({
        objectType: "mannequin",
        objectId: _0x2a7029
      }));
    } else if (_0x21da25 === "cube" || _0x21da25 === "mannequin") {
      const _0x46a4e4 = _0x1f8f57.length > 0 ? _0x1f8f57 : _0xad95e2 ? [_0xad95e2] : [];
      _0x4d245b = _0x46a4e4.map(_0x41bd92 => ({
        objectType: _0x21da25,
        objectId: _0x41bd92
      }));
    }
  }
  let _0x397a37 = null;
  let _0xff0d48 = null;
  let _0x74940f = [];
  if (_0x4d245b.length > 0) {
    const _0x4ff6bd = _0x21da25 === "cube" || _0x21da25 === "mannequin" ? _0x21da25 : null;
    const _0x2c0e3b = _0x4ff6bd ? _0x4d245b.some(_0x2cc026 => _0x2cc026.objectType === _0x4ff6bd) : false;
    _0x397a37 = _0x2c0e3b ? _0x4ff6bd : _0x4d245b[0].objectType;
    _0x74940f = _0x4d245b.filter(_0x48bf95 => _0x48bf95.objectType === _0x397a37).map(_0x26768d => _0x26768d.objectId);
    const _0x2a18db = _0xad95e2 && _0x4d245b.some(_0x2a8fac => _0x2a8fac.objectType === _0x397a37 && _0x2a8fac.objectId === _0xad95e2);
    _0xff0d48 = _0x2a18db ? _0xad95e2 : _0x74940f[0] || null;
  } else {
    _0x52063d = null;
  }
  if (_0x52063d) {
    const _0x21a9f0 = _0x26ee0a.find(_0x17b73e => _0x17b73e.id === _0x52063d) || null;
    if (!_0x21a9f0) {
      _0x52063d = null;
    } else {
      const _0xac2abc = new Set(_0x4d245b.filter(_0x546bca => _0x546bca.objectType === "mannequin").map(_0x209f64 => _0x209f64.objectId));
      const _0x2c09fc = _0x4d245b.every(_0x20ae58 => _0x20ae58.objectType === "mannequin") && _0x21a9f0.memberIds.length > 0 && _0x21a9f0.memberIds.every(_0x1cf0bc => _0xac2abc.has(_0x1cf0bc)) && _0x21a9f0.memberIds.length === _0x4d245b.length;
      if (!_0x2c09fc) {
        _0x52063d = null;
      } else {
        _0x397a37 = "mannequin";
        _0x74940f = [..._0x21a9f0.memberIds];
        _0xff0d48 = _0x21a9f0.memberIds[0] || null;
        _0x4d245b = _0x21a9f0.memberIds.map(_0x6cff28 => ({
          objectType: "mannequin",
          objectId: _0x6cff28
        }));
      }
    }
  }
  const _0x266f55 = normalizeLegacyTool(_0x1b2904?.ui?.activeTool);
  const _0x588b9f = normalizeMouseTool(_0x1b2904?.ui?.mouseTool != null ? _0x1b2904.ui.mouseTool : _0x266f55 === "box-select" ? "box-select" : "navigate");
  const _0x5b7842 = normalizeTransformTool(_0x1b2904?.ui?.transformTool != null ? _0x1b2904.ui.transformTool : _0x266f55 === "move" || _0x266f55 === "rotate" || _0x266f55 === "scale" ? _0x266f55 : "move");
  return {
    version: 2,
    mode: normalizeMode(_0x1b2904?.mode),
    environmentMode: normalizeEnvironmentMode(_0x1b2904?.environmentMode),
    viewport: {
      activeView: normalizeActiveView(_0x1b2904?.viewport?.activeView) === "camera" && _0x565f0b ? "camera" : "default",
      activeCameraId: _0x565f0b ? _0xe6ecb0 : null,
      sceneView: _0xb0ae4,
      panoramaView: _0x4dc82f
    },
    panorama: {
      localPath: _0x1b2904?.panorama?.localPath ? String(_0x1b2904.panorama.localPath).trim() : null,
      imageUrl: _0x1b2904?.panorama?.imageUrl ? String(_0x1b2904.panorama.imageUrl).trim() : null,
      previewImageUrl: _0x1b2904?.panorama?.previewImageUrl ? String(_0x1b2904.panorama.previewImageUrl).trim() : null,
      fileName: _0x1b2904?.panorama?.fileName ? String(_0x1b2904.panorama.fileName).trim() : null,
      sourceSignature: _0x1b2904?.panorama?.sourceSignature ? String(_0x1b2904.panorama.sourceSignature).trim() : null,
      isLoaded: _0x1b2904?.panorama?.isLoaded === true,
      error: _0x1b2904?.panorama?.error ? String(_0x1b2904.panorama.error) : null
    },
    mannequins: _0x1795be,
    cubes: _0x3cf566,
    cameras: _0x3524bb,
    customPoses: _0x55e23f,
    cameraTimeline: _0x572a21,
    selection: {
      selectedObjectType: _0x397a37,
      selectedObjectId: _0xff0d48,
      selectedObjectIds: _0x74940f,
      selectedObjects: _0x4d245b,
      selectedGroupId: _0x52063d
    },
    groups: _0x26ee0a,
    gridPlacement: {
      rows: Math.max(1, Math.min(12, Math.round(toFiniteNumber(_0x1b2904?.gridPlacement?.rows, _0x2c585c.gridPlacement.rows)))),
      cols: Math.max(1, Math.min(12, Math.round(toFiniteNumber(_0x1b2904?.gridPlacement?.cols, _0x2c585c.gridPlacement.cols)))),
      spacingX: Math.max(0.5, Math.min(8, toFiniteNumber(_0x1b2904?.gridPlacement?.spacingX, _0x2c585c.gridPlacement.spacingX))),
      spacingZ: Math.max(0.5, Math.min(8, toFiniteNumber(_0x1b2904?.gridPlacement?.spacingZ, _0x2c585c.gridPlacement.spacingZ))),
      gender: normalizeGender(_0x1b2904?.gridPlacement?.gender),
      colorKey: normalizeColorKey(_0x1b2904?.gridPlacement?.colorKey || _0x1b2904?.gridPlacement?.color)
    },
    capture: {
      pending: _0x1b2904?.capture?.pending === true,
      lastCaptureAt: _0x1b2904?.capture?.lastCaptureAt == null ? null : toFiniteNumber(_0x1b2904.capture.lastCaptureAt, null),
      error: _0x1b2904?.capture?.error ? String(_0x1b2904.capture.error) : null,
      mode: normalizeCaptureMode(_0x1b2904?.capture?.mode),
      showSafeFrame: _0x1b2904?.capture?.showSafeFrame === true
    },
    ui: {
      mouseTool: _0x588b9f,
      transformTool: _0x5b7842,
      activeTool: _0x266f55,
      transformSpace: normalizeTransformSpace(_0x1b2904?.ui?.transformSpace),
      pivotMode: normalizePivotMode(_0x1b2904?.ui?.pivotMode),
      navigationPreset: normalizeNavigationPreset(_0x1b2904?.ui?.navigationPreset),
      navigationMode: normalizeNavigationMode(_0x1b2904?.ui?.navigationMode),
      flySpeed: Math.max(0.25, Math.min(40, toFiniteNumber(_0x1b2904?.ui?.flySpeed, _0x2c585c.ui.flySpeed))),
      snapEnabled: _0x1b2904?.ui?.snapEnabled === true,
      translationSnap: Math.max(0.01, Math.min(10, toFiniteNumber(_0x1b2904?.ui?.translationSnap, _0x2c585c.ui.translationSnap))),
      rotationSnap: Math.max(0.001, Math.min(Math.PI, toFiniteNumber(_0x1b2904?.ui?.rotationSnap, _0x2c585c.ui.rotationSnap))),
      scaleSnap: Math.max(0.01, Math.min(10, toFiniteNumber(_0x1b2904?.ui?.scaleSnap, _0x2c585c.ui.scaleSnap))),
      groundLock: _0x1b2904?.ui?.groundLock !== false,
      uniformScale: _0x1b2904?.ui?.uniformScale !== false,
      showCameraList: _0x1b2904?.ui?.showCameraList === true,
      showTimeline: _0x1b2904?.ui?.showTimeline === true,
      showOutline: _0x1b2904?.ui?.showOutline !== false,
      isEditing: _0x1b2904?.ui?.isEditing === true
    }
  };
}
export function normalizeSceneOnlyPanoramaSceneState(_0x4d132a) {
  const _0x3a1b43 = normalizePanoramaSceneState(_0x4d132a);
  const _0x41ec3d = String(_0x3a1b43?.viewport?.activeCameraId || "").trim() || null;
  const _0x2019b0 = _0x41ec3d ? Array.isArray(_0x3a1b43.cameras) && _0x3a1b43.cameras.some(_0x113ec1 => _0x113ec1.id === _0x41ec3d) : false;
  return {
    ..._0x3a1b43,
    mode: "scene",
    viewport: {
      ..._0x3a1b43.viewport,
      activeView: _0x3a1b43.viewport?.activeView === "camera" && _0x2019b0 ? "camera" : "default",
      activeCameraId: _0x2019b0 ? _0x41ec3d : null
    }
  };
}
export function normalizePanorama360State(_0x46b643) {
  const _0x493020 = normalizePanoramaSceneState(_0x46b643);
  const _0x53aa5e = new Set((Array.isArray(_0x493020.mannequins) ? _0x493020.mannequins : []).map(_0x12ba69 => String(_0x12ba69?.id || "").trim()).filter(Boolean));
  const _0x351a48 = Array.isArray(_0x493020.groups) ? _0x493020.groups : [];
  let _0x5e59fd = (Array.isArray(_0x493020.selection?.selectedObjects) ? _0x493020.selection.selectedObjects : []).map(_0x380c0d => ({
    objectType: String(_0x380c0d?.objectType || "").trim(),
    objectId: String(_0x380c0d?.objectId || "").trim()
  })).filter(_0x582a1e => _0x582a1e.objectType === "mannequin" && _0x53aa5e.has(_0x582a1e.objectId));
  const _0x29532e = String(_0x493020.selection?.selectedGroupId || "").trim();
  const _0x1df61b = _0x29532e && _0x351a48.length > 0 ? _0x351a48.find(_0x1e1d29 => String(_0x1e1d29?.id || "").trim() === _0x29532e) || null : null;
  let _0x16b3f8 = null;
  if (_0x1df61b) {
    _0x16b3f8 = _0x1df61b.id;
    _0x5e59fd = _0x1df61b.memberIds.map(_0xc4fdcd => String(_0xc4fdcd || "").trim()).filter(_0x48fbe8 => _0x53aa5e.has(_0x48fbe8)).map(_0x2c8c81 => ({
      objectType: "mannequin",
      objectId: _0x2c8c81
    }));
  }
  if (_0x5e59fd.length === 0) {
    const _0x7fadc3 = String(_0x493020.selection?.selectedObjectId || "").trim();
    if (String(_0x493020.selection?.selectedObjectType || "").trim() === "mannequin" && _0x7fadc3 && _0x53aa5e.has(_0x7fadc3)) {
      _0x5e59fd = [{
        objectType: "mannequin",
        objectId: _0x7fadc3
      }];
    }
  }
  const _0x4801f2 = new Set();
  _0x5e59fd = _0x5e59fd.filter(_0x150133 => {
    const _0x195857 = _0x150133.objectType + ":" + _0x150133.objectId;
    if (_0x4801f2.has(_0x195857)) {
      return false;
    }
    _0x4801f2.add(_0x195857);
    return true;
  });
  const _0x524c89 = _0x5e59fd.map(_0x2ba0c0 => _0x2ba0c0.objectId);
  const _0x1b19f1 = String(_0x493020.selection?.selectedObjectId || "").trim();
  const _0x571688 = _0x1b19f1 && _0x524c89.includes(_0x1b19f1) ? _0x1b19f1 : _0x524c89[0] || null;
  return {
    ..._0x493020,
    mode: "panorama",
    cubes: [],
    cameras: [],
    viewport: {
      ..._0x493020.viewport,
      activeView: "default",
      activeCameraId: null
    },
    selection: {
      selectedObjectType: _0x571688 ? "mannequin" : null,
      selectedObjectId: _0x571688,
      selectedObjectIds: _0x524c89,
      selectedObjects: _0x5e59fd,
      selectedGroupId: _0x16b3f8 && _0x5e59fd.length > 0 ? _0x16b3f8 : null
    },
    ui: {
      ..._0x493020.ui,
      showCameraList: false
    }
  };
}
export function createPanoramaSceneNodeData({
  id: _0x39abc5,
  x = 0,
  y = 0,
  width = PANORAMA_SCENE_DEFAULT_SIZE.width,
  height = PANORAMA_SCENE_DEFAULT_SIZE.height,
  name = getPanoramaSceneDefaultName()
} = {}) {
  return {
    id: _0x39abc5,
    type: PANORAMA_SCENE_NODE_TYPE,
    x: x,
    y: y,
    width: width,
    height: height,
    name: name,
    sceneNode: createDefaultPanoramaSceneState()
  };
}
export function createPanorama360NodeData({
  id: _0x55a866,
  x = 0,
  y = 0,
  width = PANORAMA_SCENE_DEFAULT_SIZE.width,
  height = PANORAMA_SCENE_DEFAULT_SIZE.height,
  name = getPanorama360DefaultName()
} = {}) {
  return {
    id: _0x55a866,
    type: PANORAMA_360_NODE_TYPE,
    x: x,
    y: y,
    width: width,
    height: height,
    name: name,
    panorama360Node: createDefaultPanorama360State()
  };
}
export { PANORAMA_SCENE_NODE_TYPE, PANORAMA_SCENE_NODE_ALIASES, PANORAMA_360_NODE_TYPE, PANORAMA_360_NODE_ALIASES, PANORAMA_SCENE_CAMERA_LIMIT, PANORAMA_SCENE_DEFAULT_SIZE, PANORAMA_SCENE_COLLAPSED_MAX_SIZE, PANORAMA_SCENE_DEFAULT_NAME, PANORAMA_360_DEFAULT_NAME, getPanoramaSceneDefaultName, getPanorama360DefaultName, PANORAMA_SCENE_COLOR_TOKENS };