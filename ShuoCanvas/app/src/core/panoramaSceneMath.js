const SCENE_ORBIT_POLE_MARGIN = 0.01;
export const PANORAMA_SCENE_CAMERA_CONSTRAINTS = Object.freeze({
  panorama: Object.freeze({
    pitch: Object.freeze({
      min: Math.PI * -85 / 180,
      max: Math.PI * 85 / 180,
      default: 0
    }),
    fov: Object.freeze({
      min: 35,
      max: 80,
      default: 55
    })
  }),
  scene: Object.freeze({
    orbitPitch: Object.freeze({
      min: -Math.PI / 2 + SCENE_ORBIT_POLE_MARGIN,
      max: Math.PI / 2 - SCENE_ORBIT_POLE_MARGIN
    }),
    orbitDistance: Object.freeze({
      min: 0.05,
      max: 1000
    }),
    focalLength: Object.freeze({
      min: 15,
      max: 200,
      default: 50
    }),
    sensorWidthMm: 36
  })
});
const PANORAMA_PITCH_LIMIT = PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.pitch.max;
const SCENE_PITCH_MIN = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.orbitPitch.min;
const SCENE_PITCH_MAX = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.orbitPitch.max;
const PANORAMA_FOV_DEFAULT = PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.fov.default;
const PANORAMA_FOV_MIN = PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.fov.min;
const PANORAMA_FOV_MAX = PANORAMA_SCENE_CAMERA_CONSTRAINTS.panorama.fov.max;
export const SCENE_ORBIT_DISTANCE_MIN = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.orbitDistance.min;
export const SCENE_ORBIT_DISTANCE_MAX = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.orbitDistance.max;
const SCENE_WHEEL_DOLLY_FACTOR = 0.0012;
const SCENE_DRAG_DOLLY_FACTOR = SCENE_WHEEL_DOLLY_FACTOR * 3.25;
const SCENE_ORBIT_RADIANS_PER_VIEW_HEIGHT = Math.PI;
export const SCENE_NAVIGATION_REFERENCE_FOCAL_LENGTH_MM = 35;
const SCENE_PAN_SCREEN_GAIN = 0.9;
const SCENE_CLOSE_PAN_SCREEN_GAIN = 0.82;
const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_DELTA_LIMIT_PX = 240;
export const SCENE_SENSOR_WIDTH_MM = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.sensorWidthMm;
export const SCENE_DEFAULT_FOCAL_LENGTH_MM = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.focalLength.default;
export const SCENE_FOCAL_LENGTH_MIN_MM = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.focalLength.min;
export const SCENE_FOCAL_LENGTH_MAX_MM = PANORAMA_SCENE_CAMERA_CONSTRAINTS.scene.focalLength.max;
function clamp(_0x540687, _0x5b15e3, _0x42fa77) {
  return Math.min(_0x42fa77, Math.max(_0x5b15e3, _0x540687));
}
function resolveFullFrameSensorHeight(_0x44e7b8 = SCENE_SENSOR_WIDTH_MM) {
  const _0x2c1ae3 = Math.max(1, Number(_0x44e7b8) || SCENE_SENSOR_WIDTH_MM);
  return _0x2c1ae3 * (2 / 3);
}
function smoothstep(_0x394f2c, _0x223ef0, _0x5cd76a) {
  if (!(_0x5cd76a > _0x223ef0)) {
    if (_0x394f2c >= _0x5cd76a) {
      return 1;
    } else {
      return 0;
    }
  }
  const _0xaeff7 = clamp((_0x394f2c - _0x223ef0) / (_0x5cd76a - _0x223ef0), 0, 1);
  return _0xaeff7 * _0xaeff7 * (3 - _0xaeff7 * 2);
}
function normalizeVector3(_0x448442, _0x9c29d = {
  x: 0,
  y: 0,
  z: 0
}) {
  return {
    x: Number.isFinite(_0x448442?.x) ? _0x448442.x : _0x9c29d.x,
    y: Number.isFinite(_0x448442?.y) ? _0x448442.y : _0x9c29d.y,
    z: Number.isFinite(_0x448442?.z) ? _0x448442.z : _0x9c29d.z
  };
}
function normalizeQuaternion(_0x4c29e5, _0xf2b358 = {
  x: 0,
  y: 0,
  z: 0,
  w: 1
}) {
  const _0x57188f = Number(_0x4c29e5?.x);
  const _0x401eed = Number(_0x4c29e5?.y);
  const _0x1f5cdc = Number(_0x4c29e5?.z);
  const _0x5c5f26 = Number(_0x4c29e5?.w);
  if (!Number.isFinite(_0x57188f) || !Number.isFinite(_0x401eed) || !Number.isFinite(_0x1f5cdc) || !Number.isFinite(_0x5c5f26)) {
    return {
      ..._0xf2b358
    };
  }
  const _0xaa6391 = Math.hypot(_0x57188f, _0x401eed, _0x1f5cdc, _0x5c5f26);
  if (_0xaa6391 < 0.000001) {
    return {
      ..._0xf2b358
    };
  }
  return {
    x: _0x57188f / _0xaa6391,
    y: _0x401eed / _0xaa6391,
    z: _0x1f5cdc / _0xaa6391,
    w: _0x5c5f26 / _0xaa6391
  };
}
function quaternionToForwardVector(_0x9ec51f) {
  const _0x1d55c0 = normalizeQuaternion(_0x9ec51f);
  return {
    x: -((_0x1d55c0.x * _0x1d55c0.z + _0x1d55c0.w * _0x1d55c0.y) * 2),
    y: -((_0x1d55c0.y * _0x1d55c0.z - _0x1d55c0.w * _0x1d55c0.x) * 2),
    z: -(1 - (_0x1d55c0.x * _0x1d55c0.x + _0x1d55c0.y * _0x1d55c0.y) * 2)
  };
}
function resolvePoseForwardVector(_0x1efea4, _0x9c4715) {
  if (_0x1efea4?.quaternion) {
    return normalizeVector3(quaternionToForwardVector(_0x1efea4.quaternion), _0x9c4715);
  }
  if (_0x1efea4?.rotation) {
    return normalizeVector3(rotationToForwardVector(_0x1efea4.rotation), _0x9c4715);
  }
  if (_0x1efea4?.forward) {
    return normalizeVector3(_0x1efea4.forward, _0x9c4715);
  }
  return {
    ..._0x9c4715
  };
}
function lengthXZ(_0x1838c8) {
  return Math.hypot(_0x1838c8.x, _0x1838c8.z);
}
function length3(_0xd43a5d) {
  return Math.hypot(_0xd43a5d.x, _0xd43a5d.y, _0xd43a5d.z);
}
function normalize3(_0x3a8f57, _0x200f19 = {
  x: 0,
  y: 0,
  z: 0
}) {
  const _0x33a7e8 = length3(_0x3a8f57) || 0;
  if (_0x33a7e8 < 0.000001) {
    return {
      ..._0x200f19
    };
  }
  return {
    x: _0x3a8f57.x / _0x33a7e8,
    y: _0x3a8f57.y / _0x33a7e8,
    z: _0x3a8f57.z / _0x33a7e8
  };
}
function cross(_0x175660, _0x4ffc7a) {
  return {
    x: _0x175660.y * _0x4ffc7a.z - _0x175660.z * _0x4ffc7a.y,
    y: _0x175660.z * _0x4ffc7a.x - _0x175660.x * _0x4ffc7a.z,
    z: _0x175660.x * _0x4ffc7a.y - _0x175660.y * _0x4ffc7a.x
  };
}
function dot(_0x1c9095, _0x243473) {
  return (Number(_0x1c9095?.x) || 0) * (Number(_0x243473?.x) || 0) + (Number(_0x1c9095?.y) || 0) * (Number(_0x243473?.y) || 0) + (Number(_0x1c9095?.z) || 0) * (Number(_0x243473?.z) || 0);
}
function subtract(_0x4ca3ec, _0x57bc8f) {
  return {
    x: (Number(_0x4ca3ec?.x) || 0) - (Number(_0x57bc8f?.x) || 0),
    y: (Number(_0x4ca3ec?.y) || 0) - (Number(_0x57bc8f?.y) || 0),
    z: (Number(_0x4ca3ec?.z) || 0) - (Number(_0x57bc8f?.z) || 0)
  };
}
function scale(_0x209837, _0x146172) {
  const _0x5c2bf3 = Number(_0x146172) || 0;
  return {
    x: (Number(_0x209837?.x) || 0) * _0x5c2bf3,
    y: (Number(_0x209837?.y) || 0) * _0x5c2bf3,
    z: (Number(_0x209837?.z) || 0) * _0x5c2bf3
  };
}
function subtractProjection(_0x16c21f, _0x5a1329) {
  const _0x117762 = normalize3(_0x5a1329, {
    x: 0,
    y: 1,
    z: 0
  });
  const _0x45687e = scale(_0x117762, dot(_0x16c21f, _0x117762));
  return subtract(_0x16c21f, _0x45687e);
}
function safeLength(_0x1198e7) {
  return Math.hypot(Number(_0x1198e7?.x) || 0, Number(_0x1198e7?.y) || 0, Number(_0x1198e7?.z) || 0);
}
export function clampPanoramaPitch(_0x519a66) {
  return clamp(Number(_0x519a66) || 0, -PANORAMA_PITCH_LIMIT, PANORAMA_PITCH_LIMIT);
}
export function clampSceneOrbitPitch(_0x497949) {
  return clamp(Number(_0x497949) || 0, SCENE_PITCH_MIN, SCENE_PITCH_MAX);
}
export function normalizeAngle(_0x1b0159) {
  const _0x22823c = Number(_0x1b0159) || 0;
  const _0x2a6957 = ((_0x22823c + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return _0x2a6957 - Math.PI;
}
export function computeStableGridSnap(_0x5d7aaf, _0x5415b4, _0x4c6723 = null, _0x3117e9 = 0.12) {
  const _0x4aab48 = Math.max(0.0001, Number(_0x5415b4) || 1);
  const _0x156b35 = Number(_0x5d7aaf) || 0;
  const _0x16ab0f = Math.round(_0x156b35 / _0x4aab48) * _0x4aab48;
  const _0x121b1c = Number(_0x4c6723);
  if (!Number.isFinite(_0x121b1c)) {
    return _0x16ab0f;
  }
  if (Math.abs(_0x16ab0f - _0x121b1c) < 0.000001) {
    return _0x121b1c;
  }
  const _0x26cf36 = clamp(Number(_0x3117e9) || 0, 0, 0.45);
  const _0x4a07e7 = _0x4aab48 * (0.5 + _0x26cf36);
  if (Math.abs(_0x156b35 - _0x121b1c) < _0x4a07e7) {
    return _0x121b1c;
  } else {
    return _0x16ab0f;
  }
}
export function computeDampingFactor(_0x5de8ba, _0x54c603 = 120) {
  const _0x1ee7e0 = Math.max(0, Number(_0x5de8ba) || 0);
  const _0x4544cf = Math.max(1, Number(_0x54c603) || 120);
  return 1 - Math.exp(-_0x1ee7e0 / _0x4544cf);
}
export function dampScalar(_0x1defd0, _0x497e7e, _0x4b4759, _0x3a7234 = 120) {
  const _0x2a18c1 = computeDampingFactor(_0x4b4759, _0x3a7234);
  const _0x26e595 = Number(_0x1defd0) || 0;
  const _0x574d1b = Number(_0x497e7e) || 0;
  return _0x26e595 + (_0x574d1b - _0x26e595) * _0x2a18c1;
}
export function dampAngle(_0x134398, _0x2ec3e4, _0x25e96e, _0x3932d8 = 120) {
  const _0x57d1f9 = computeDampingFactor(_0x25e96e, _0x3932d8);
  const _0x32df27 = Number(_0x134398) || 0;
  const _0x14cbbf = Number(_0x2ec3e4) || 0;
  const _0x16f74b = normalizeAngle(_0x14cbbf - _0x32df27);
  return normalizeAngle(_0x32df27 + _0x16f74b * _0x57d1f9);
}
export function forwardVectorFromYawPitch(_0x1ada29, _0x4725a2 = 0) {
  const _0x3fe34d = Number(_0x1ada29) || 0;
  const _0x14a4d1 = Number(_0x4725a2) || 0;
  const _0x404874 = Math.cos(_0x14a4d1);
  return {
    x: Math.sin(_0x3fe34d) * _0x404874,
    y: Math.sin(_0x14a4d1),
    z: Math.cos(_0x3fe34d) * _0x404874
  };
}
export function rotationToForwardVector(_0x51e253) {
  const _0x3ced1e = Number(_0x51e253?.x) || 0;
  const _0x1ac842 = Number(_0x51e253?.y) || 0;
  return forwardVectorFromYawPitch(_0x1ac842, -_0x3ced1e);
}
export function clampSceneFocalLength(_0x100d87) {
  return clamp(Number(_0x100d87) || SCENE_DEFAULT_FOCAL_LENGTH_MM, SCENE_FOCAL_LENGTH_MIN_MM, SCENE_FOCAL_LENGTH_MAX_MM);
}
export function focalLengthToFov(_0x103d40, _0x14bce6 = SCENE_SENSOR_WIDTH_MM) {
  const _0x359ddd = clampSceneFocalLength(_0x103d40);
  const _0x286480 = resolveFullFrameSensorHeight(_0x14bce6);
  const _0x345ddf = Math.atan(_0x286480 / (_0x359ddd * 2)) * 2;
  return _0x345ddf * 180 / Math.PI;
}
export function fovToFocalLength(_0x22fc6f, _0x473ab0 = SCENE_SENSOR_WIDTH_MM) {
  const _0x52ea9a = clamp(Number(_0x22fc6f) || focalLengthToFov(SCENE_DEFAULT_FOCAL_LENGTH_MM, _0x473ab0), focalLengthToFov(SCENE_FOCAL_LENGTH_MAX_MM, _0x473ab0), focalLengthToFov(SCENE_FOCAL_LENGTH_MIN_MM, _0x473ab0));
  const _0x4342d8 = resolveFullFrameSensorHeight(_0x473ab0);
  const _0x12f86b = _0x4342d8 / (Math.tan(_0x52ea9a * Math.PI / 180 / 2) * 2);
  return clampSceneFocalLength(_0x12f86b);
}
export function resolveSceneCameraPose(_0x4f3d88, _0x5a6281 = 58) {
  const _0x407981 = normalizeVector3(_0x4f3d88?.target, {
    x: 0,
    y: 1.2,
    z: 0
  });
  const _0x4b0ea2 = Math.max(SCENE_ORBIT_DISTANCE_MIN, Number(_0x4f3d88?.orbitDistance) || 8);
  const _0x35afd4 = Number(_0x4f3d88?.orbitYaw) || 0;
  const _0x5b6f26 = clampSceneOrbitPitch(_0x4f3d88?.orbitPitch);
  const _0x2b1247 = Math.cos(_0x5b6f26);
  const _0x27a0d1 = {
    x: _0x407981.x + _0x4b0ea2 * Math.sin(_0x35afd4) * _0x2b1247,
    y: _0x407981.y + _0x4b0ea2 * Math.sin(_0x5b6f26),
    z: _0x407981.z + _0x4b0ea2 * Math.cos(_0x35afd4) * _0x2b1247
  };
  return {
    kind: "scene-default",
    position: _0x27a0d1,
    target: _0x407981,
    yaw: _0x35afd4,
    pitch: _0x5b6f26,
    distance: _0x4b0ea2,
    fov: Math.max(1, Number(_0x5a6281) || 58)
  };
}
export function computePerspectiveFrameDistance({
  radius: _0x821b21,
  fov = 58,
  aspect = 1,
  padding = 1.18,
  minDistance = SCENE_ORBIT_DISTANCE_MIN,
  maxDistance = SCENE_ORBIT_DISTANCE_MAX
} = {}) {
  const _0x30bedc = Math.max(0.01, Number(_0x821b21) || 0.5);
  const _0x538bae = clamp(Number(fov) || 58, 1, 179) * Math.PI / 360;
  const _0x178f7b = Math.max(0.1, Number(aspect) || 1);
  const _0x426fb1 = Math.atan(Math.tan(_0x538bae) * _0x178f7b);
  const _0x26941e = Math.max(0.01, Math.min(_0x538bae, _0x426fb1));
  const _0x102718 = _0x30bedc / Math.sin(_0x26941e) * Math.max(1, Number(padding) || 1);
  return clamp(_0x102718, minDistance, maxDistance);
}
export function resolveAdaptiveCameraClipPlanes({
  focusDistance: _0x45785c,
  sceneExtent = 0,
  sceneDistance = 0
} = {}) {
  const _0x180c3c = Math.max(SCENE_ORBIT_DISTANCE_MIN, Number(_0x45785c) || 8);
  const _0x3fe396 = Math.max(0, Number(sceneExtent) || 0);
  const _0x177acc = Math.max(0, Number(sceneDistance) || 0);
  const _0x31daac = clamp(Math.max(250, _0x180c3c * 32, _0x3fe396 * 4, _0x177acc * 1.25), 250, 5000);
  return {
    near: clamp(Math.max(_0x180c3c * 0.01, _0x31daac / 50000), 0.015, 0.25),
    far: _0x31daac
  };
}
export function resolvePanoramaViewPose(_0x2b2766, _0x32c8fc = {
  x: 0,
  y: 0,
  z: 0
}) {
  const _0x3190ad = Number(_0x2b2766?.yaw) || 0;
  const _0xb48a06 = clampPanoramaPitch(_0x2b2766?.pitch);
  return {
    kind: "panorama-default",
    position: normalizeVector3(_0x32c8fc, {
      x: 0,
      y: 0,
      z: 0
    }),
    yaw: _0x3190ad,
    pitch: _0xb48a06,
    fov: Math.max(PANORAMA_FOV_MIN, Math.min(PANORAMA_FOV_MAX, Number(_0x2b2766?.fov) || PANORAMA_FOV_DEFAULT))
  };
}
function resolveSceneOrbitProjectionGain(_0x25217b) {
  const _0x4c281b = focalLengthToFov(SCENE_NAVIGATION_REFERENCE_FOCAL_LENGTH_MM);
  const _0x47230b = clamp(Number(_0x25217b) || _0x4c281b, 1, 179);
  return Math.tan(_0x47230b * Math.PI / 360) / Math.tan(_0x4c281b * Math.PI / 360);
}
export function applyOrbitDelta(_0x21204a, _0x729d51, _0x1d4f58, _0x26fdd0, {
  fov: _0x23a12c
} = {}) {
  const _0x3db263 = Math.max(120, Number(_0x26fdd0?.height) || 1);
  const _0x2628e8 = SCENE_ORBIT_RADIANS_PER_VIEW_HEIGHT * resolveSceneOrbitProjectionGain(_0x23a12c) / _0x3db263;
  const _0x488b95 = _0x729d51 * _0x2628e8;
  const _0x18d9cf = _0x1d4f58 * _0x2628e8;
  return {
    orbitYaw: normalizeAngle((Number(_0x21204a?.orbitYaw) || 0) - _0x488b95),
    orbitPitch: clampSceneOrbitPitch((Number(_0x21204a?.orbitPitch) || 0) + _0x18d9cf)
  };
}
export function applySceneFlyLookDelta(_0x4f8d46, _0x1413ff, _0xc16778, _0x4dbc19, _0x1d03e8 = {}) {
  const _0xbef3fe = resolveSceneCameraPose(_0x4f8d46);
  const _0x3f4188 = applyOrbitDelta(_0x4f8d46, _0x1413ff, _0xc16778, _0x4dbc19, _0x1d03e8);
  const _0x30bfd6 = Math.max(SCENE_ORBIT_DISTANCE_MIN, Number(_0x4f8d46?.orbitDistance) || _0xbef3fe.distance || 8);
  const _0x19d805 = Math.cos(_0x3f4188.orbitPitch);
  const _0x465079 = {
    x: _0x30bfd6 * Math.sin(_0x3f4188.orbitYaw) * _0x19d805,
    y: _0x30bfd6 * Math.sin(_0x3f4188.orbitPitch),
    z: _0x30bfd6 * Math.cos(_0x3f4188.orbitYaw) * _0x19d805
  };
  return {
    ..._0x3f4188,
    target: {
      x: _0xbef3fe.position.x - _0x465079.x,
      y: _0xbef3fe.position.y - _0x465079.y,
      z: _0xbef3fe.position.z - _0x465079.z
    }
  };
}
export function applySceneFlyMovement(_0x734ae8, _0x3572e5 = {}, _0x44097c = 0, {
  speed = 4,
  boostMultiplier = 4,
  minimumCameraY = 0.2
} = {}) {
  const _0x345ca6 = resolveSceneCameraPose(_0x734ae8);
  const _0x45290d = normalizeVector3(_0x734ae8?.target, {
    x: 0,
    y: 1.2,
    z: 0
  });
  const _0x1f71c9 = normalize3(subtract(_0x45290d, _0x345ca6.position), {
    x: 0,
    y: 0,
    z: -1
  });
  const _0x2bd614 = {
    x: 0,
    y: 1,
    z: 0
  };
  const _0x4ea4c9 = normalize3(cross(_0x1f71c9, _0x2bd614), {
    x: 1,
    y: 0,
    z: 0
  });
  const _0x1f51cc = {
    x: _0x1f71c9.x * (Number(_0x3572e5.forward) || 0) + _0x4ea4c9.x * (Number(_0x3572e5.right) || 0),
    y: _0x1f71c9.y * (Number(_0x3572e5.forward) || 0) + _0x4ea4c9.y * (Number(_0x3572e5.right) || 0) + (Number(_0x3572e5.vertical) || 0),
    z: _0x1f71c9.z * (Number(_0x3572e5.forward) || 0) + _0x4ea4c9.z * (Number(_0x3572e5.right) || 0)
  };
  const _0x1498ba = length3(_0x1f51cc);
  const _0x18fd02 = _0x1498ba > 1 ? normalize3(_0x1f51cc) : _0x1f51cc;
  const _0x376fa1 = _0x3572e5.boost === true ? Math.max(1, Number(boostMultiplier) || 1) : 1;
  const _0x2a3580 = Math.max(0, Math.min(0.1, Number(_0x44097c) || 0)) * Math.max(0.01, Number(speed) || 4) * _0x376fa1;
  const _0x5453b7 = scale(_0x18fd02, _0x2a3580);
  const _0x339d94 = _0x345ca6.position.y + _0x5453b7.y;
  if (_0x339d94 < minimumCameraY) {
    _0x5453b7.y += minimumCameraY - _0x339d94;
  }
  return {
    target: {
      x: _0x45290d.x + _0x5453b7.x,
      y: _0x45290d.y + _0x5453b7.y,
      z: _0x45290d.z + _0x5453b7.z
    }
  };
}
export function applyPanoramaLookDelta(_0x140639, _0x4a0896, _0x451f4e, _0x404add) {
  const _0x879623 = Math.max(120, Number(_0x404add?.width) || 1);
  const _0x578f24 = Math.max(120, Number(_0x404add?.height) || 1);
  const _0x34eb1d = _0x4a0896 / _0x879623 * Math.PI * 1.75;
  const _0x2e119d = _0x451f4e / _0x578f24 * Math.PI * 1.25;
  return {
    yaw: normalizeAngle((Number(_0x140639?.yaw) || 0) - _0x34eb1d),
    pitch: clampPanoramaPitch((Number(_0x140639?.pitch) || 0) + _0x2e119d)
  };
}
export function applyScenePanDelta(_0x242fa8, _0x3afe05, _0x37e624, _0x17eede, _0x1a3370) {
  const _0x597692 = Math.max(120, Number(_0x1a3370?.height) || 1);
  const _0x56cfad = Math.max(SCENE_ORBIT_DISTANCE_MIN, Number(_0x242fa8?.orbitDistance) || Number(_0x3afe05?.distance) || 8);
  const _0x6b2698 = (Number(_0x3afe05?.fov) || 58) * Math.PI / 180;
  const _0x3b19de = Math.tan(_0x6b2698 / 2) * 2 * _0x56cfad / _0x597692;
  const _0x5ee856 = smoothstep(_0x56cfad, SCENE_ORBIT_DISTANCE_MIN, 0.25);
  const _0x389992 = SCENE_CLOSE_PAN_SCREEN_GAIN + _0x5ee856 * (SCENE_PAN_SCREEN_GAIN - SCENE_CLOSE_PAN_SCREEN_GAIN);
  const _0x518bd7 = _0x3b19de * _0x389992;
  const _0x2f85e1 = normalize3(normalizeVector3(_0x3afe05?.forward || forwardVectorFromYawPitch(_0x3afe05?.yaw, _0x3afe05?.pitch), {
    x: 0,
    y: 0,
    z: 1
  }), {
    x: 0,
    y: 0,
    z: 1
  });
  const _0x5ac414 = {
    x: 0,
    y: 1,
    z: 0
  };
  const _0x143e81 = {
    x: 0,
    y: 0,
    z: 1
  };
  const _0x139e9a = cross(_0x5ac414, _0x2f85e1);
  const _0x5d38b6 = cross(_0x143e81, _0x2f85e1);
  const _0x2477cf = length3(_0x139e9a) > 0.000001 ? normalize3(_0x139e9a, {
    x: 1,
    y: 0,
    z: 0
  }) : normalize3(_0x5d38b6, {
    x: 1,
    y: 0,
    z: 0
  });
  const _0x53ff4f = cross(_0x2f85e1, _0x2477cf);
  const _0x44b3b0 = length3(_0x53ff4f) > 0.000001 ? normalize3(_0x53ff4f, {
    x: 0,
    y: 1,
    z: 0
  }) : {
    x: 0,
    y: 1,
    z: 0
  };
  const _0x1f2636 = _0x37e624 * _0x518bd7;
  const _0x392acd = _0x17eede * _0x518bd7;
  const _0x17ac08 = normalizeVector3(_0x242fa8?.target, {
    x: 0,
    y: 1.2,
    z: 0
  });
  return {
    target: {
      x: _0x17ac08.x + _0x2477cf.x * _0x1f2636 + _0x44b3b0.x * _0x392acd,
      y: _0x17ac08.y + _0x2477cf.y * _0x1f2636 + _0x44b3b0.y * _0x392acd,
      z: _0x17ac08.z + _0x2477cf.z * _0x1f2636 + _0x44b3b0.z * _0x392acd
    }
  };
}
function hasFiniteVector3(_0x12275c) {
  return Number.isFinite(Number(_0x12275c?.x)) && Number.isFinite(Number(_0x12275c?.y)) && Number.isFinite(Number(_0x12275c?.z));
}
function applySceneOrbitDistanceDelta(_0x4dfd93, _0x290cb1, _0x1a7ea5, {
  anchor = null
} = {}) {
  const _0x579ea5 = clamp(Number(_0x4dfd93?.orbitDistance) || 8, SCENE_ORBIT_DISTANCE_MIN, SCENE_ORBIT_DISTANCE_MAX);
  const _0x2f55ba = clamp(_0x579ea5 * Math.exp((Number(_0x290cb1) || 0) * _0x1a7ea5), SCENE_ORBIT_DISTANCE_MIN, SCENE_ORBIT_DISTANCE_MAX);
  const _0x512b7a = {
    orbitDistance: _0x2f55ba
  };
  if (hasFiniteVector3(anchor)) {
    const _0x194bc4 = normalizeVector3(_0x4dfd93?.target, {
      x: 0,
      y: 1.2,
      z: 0
    });
    const _0x3c847d = normalizeVector3(anchor);
    const _0x376733 = _0x2f55ba / _0x579ea5;
    _0x512b7a.target = {
      x: _0x3c847d.x + (_0x194bc4.x - _0x3c847d.x) * _0x376733,
      y: _0x3c847d.y + (_0x194bc4.y - _0x3c847d.y) * _0x376733,
      z: _0x3c847d.z + (_0x194bc4.z - _0x3c847d.z) * _0x376733
    };
  }
  return _0x512b7a;
}
export function normalizeWheelDelta(_0xdbd59a, _0x5090af = 0, _0x19575b = 800) {
  const _0x2ad826 = Number(_0xdbd59a) || 0;
  const _0x108f24 = Number(_0x5090af) || 0;
  const _0xe122b0 = _0x108f24 === 1 ? WHEEL_LINE_HEIGHT_PX : _0x108f24 === 2 ? Math.max(120, Number(_0x19575b) || 800) : 1;
  return clamp(_0x2ad826 * _0xe122b0, -WHEEL_DELTA_LIMIT_PX, WHEEL_DELTA_LIMIT_PX);
}
export function applySceneZoomDelta(_0x4c2a0a, _0x46f5fb, _0x48eccc = {}) {
  return applySceneOrbitDistanceDelta(_0x4c2a0a, _0x46f5fb, SCENE_WHEEL_DOLLY_FACTOR, _0x48eccc);
}
export function applySceneDollyDelta(_0x2bb30a, _0xc38107, _0x18a7d0 = {}) {
  return applySceneOrbitDistanceDelta(_0x2bb30a, _0xc38107, SCENE_DRAG_DOLLY_FACTOR, _0x18a7d0);
}
export function applyPanoramaZoomDelta(_0x104413, _0x546255) {
  return {
    fov: clamp((Number(_0x104413?.fov) || PANORAMA_FOV_DEFAULT) * Math.exp((Number(_0x546255) || 0) * 0.00045), PANORAMA_FOV_MIN, PANORAMA_FOV_MAX)
  };
}
export function computeForwardPlacement({
  pose: _0x4a3593,
  distance = 3,
  groundY = 0,
  eyeHeight = 1.6
} = {}) {
  const _0x56914d = normalizeVector3(_0x4a3593?.position, {
    x: 0,
    y: eyeHeight,
    z: 0
  });
  const _0x15420a = normalizeVector3(_0x4a3593?.forward || (_0x4a3593?.rotation ? rotationToForwardVector(_0x4a3593.rotation) : forwardVectorFromYawPitch(_0x4a3593?.yaw, _0x4a3593?.pitch)), {
    x: 0,
    y: 0,
    z: 1
  });
  const _0x321e14 = lengthXZ(_0x15420a);
  const _0x4b16f0 = _0x321e14 > 0.0001 ? {
    x: _0x15420a.x / _0x321e14,
    y: 0,
    z: _0x15420a.z / _0x321e14
  } : {
    x: 0,
    y: 0,
    z: 1
  };
  const _0x35ffc1 = Math.max(0.6, Number(distance) || 3);
  return {
    x: _0x56914d.x + _0x4b16f0.x * _0x35ffc1,
    y: groundY,
    z: _0x56914d.z + _0x4b16f0.z * _0x35ffc1
  };
}
export function computeSceneCenterGroundPlacement({
  pose: _0x597ccf,
  groundY = 0,
  minDistance = 0.6,
  maxDistance = 80
} = {}) {
  const _0x439728 = normalizeVector3(_0x597ccf?.position, {
    x: 0,
    y: 1.6,
    z: 0
  });
  const _0x454823 = normalize3(normalizeVector3(_0x597ccf?.forward || (_0x597ccf?.rotation ? rotationToForwardVector(_0x597ccf.rotation) : forwardVectorFromYawPitch(_0x597ccf?.yaw, _0x597ccf?.pitch)), {
    x: 0,
    y: -0.5,
    z: 1
  }), {
    x: 0,
    y: -0.5,
    z: 1
  });
  const _0x41a9ae = 0.00001;
  if (Math.abs(_0x454823.y) <= _0x41a9ae) {
    return null;
  }
  const _0x5c4413 = (groundY - _0x439728.y) / _0x454823.y;
  if (!Number.isFinite(_0x5c4413) || _0x5c4413 <= minDistance) {
    return null;
  }
  const _0x5a4005 = Math.min(_0x5c4413, Math.max(minDistance, maxDistance));
  return {
    x: _0x439728.x + _0x454823.x * _0x5a4005,
    y: groundY,
    z: _0x439728.z + _0x454823.z * _0x5a4005
  };
}
function resolveSceneViewTargetGroundPoint(_0x305412, _0x49b23a = 0) {
  return {
    x: Number(_0x305412?.x) || 0,
    y: _0x49b23a,
    z: Number(_0x305412?.z) || 0
  };
}
export function resolveObjectPlacementPoint({
  sceneMode = "scene",
  sceneViewTarget = null,
  pose: _0xb5a883,
  groundY = 0,
  forwardDistance = 3
} = {}) {
  const _0x35f168 = sceneMode === "scene" ? resolveSceneViewTargetGroundPoint(sceneViewTarget, groundY) : computeForwardPlacement({
    pose: _0xb5a883,
    distance: forwardDistance,
    groundY: groundY
  });
  if (sceneMode !== "scene") {
    return _0x35f168;
  }
  return computeSceneCenterGroundPlacement({
    pose: _0xb5a883,
    groundY: groundY
  }) || _0x35f168;
}
export function resolveBatchPlacementOrigin(_0xf58ac9 = {}) {
  return resolveObjectPlacementPoint({
    forwardDistance: 3.2,
    ..._0xf58ac9
  });
}
export function computeGridPlacement({
  rows = 1,
  cols = 1,
  spacingX = 1.8,
  spacingZ = 1.8,
  origin = {
    x: 0,
    y: 0,
    z: 0
  },
  yaw = 0
} = {}) {
  const _0x16d805 = Math.max(1, Math.round(Number(rows) || 1));
  const _0x4f2280 = Math.max(1, Math.round(Number(cols) || 1));
  const _0x3febc6 = Math.max(0.5, Number(spacingX) || 1.8);
  const _0x305c47 = Math.max(0.5, Number(spacingZ) || 1.8);
  const _0xc5909c = normalizeVector3(origin, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x2b3fad = forwardVectorFromYawPitch(yaw, 0);
  const _0xfb8192 = lengthXZ(_0x2b3fad);
  const _0x4997b2 = _0xfb8192 > 0.0001 ? {
    x: _0x2b3fad.x / _0xfb8192,
    y: 0,
    z: _0x2b3fad.z / _0xfb8192
  } : {
    x: 0,
    y: 0,
    z: 1
  };
  const _0x28a8a8 = {
    x: _0x4997b2.z,
    y: 0,
    z: -_0x4997b2.x
  };
  const _0x49ac10 = [];
  for (let _0x2c63f1 = 0; _0x2c63f1 < _0x16d805; _0x2c63f1++) {
    for (let _0x1cf64b = 0; _0x1cf64b < _0x4f2280; _0x1cf64b++) {
      const _0x381ec1 = (_0x1cf64b - (_0x4f2280 - 1) / 2) * _0x3febc6;
      const _0xe17d33 = (_0x2c63f1 - (_0x16d805 - 1) / 2) * _0x305c47;
      _0x49ac10.push({
        x: _0xc5909c.x + _0x28a8a8.x * _0x381ec1 + _0x4997b2.x * _0xe17d33,
        y: _0xc5909c.y,
        z: _0xc5909c.z + _0x28a8a8.z * _0x381ec1 + _0x4997b2.z * _0xe17d33
      });
    }
  }
  return _0x49ac10;
}
export function cameraPoseToSceneView(_0x137705, _0x48fa48 = 8) {
  const _0x2330b1 = normalizeVector3(_0x137705?.position, {
    x: 0,
    y: 1.6,
    z: 4
  });
  const _0x191aa4 = resolvePoseForwardVector(_0x137705, {
    x: 0,
    y: 0,
    z: -1
  });
  const _0xe370e7 = Math.max(SCENE_ORBIT_DISTANCE_MIN, Number(_0x48fa48) || 8);
  const _0x1842fa = Math.hypot(_0x191aa4.x, _0x191aa4.y, _0x191aa4.z) || 1;
  const _0x85f3b3 = {
    x: _0x191aa4.x / _0x1842fa,
    y: _0x191aa4.y / _0x1842fa,
    z: _0x191aa4.z / _0x1842fa
  };
  const _0xc3fd8d = {
    x: _0x2330b1.x + _0x85f3b3.x * _0xe370e7,
    y: _0x2330b1.y + _0x85f3b3.y * _0xe370e7,
    z: _0x2330b1.z + _0x85f3b3.z * _0xe370e7
  };
  const _0x51a6e0 = Math.atan2(-_0x85f3b3.x, -_0x85f3b3.z);
  const _0xe180fb = Math.asin(clamp(-_0x85f3b3.y, -1, 1));
  return {
    target: _0xc3fd8d,
    orbitYaw: normalizeAngle(_0x51a6e0),
    orbitPitch: clampSceneOrbitPitch(_0xe180fb),
    orbitDistance: _0xe370e7
  };
}
export function cameraPoseToSceneViewFromReference(_0x47d76a, _0xb43e5d) {
  const _0x2f9f08 = normalizeVector3(_0x47d76a?.position, {
    x: 0,
    y: 1.6,
    z: 4
  });
  const _0x4d1995 = normalizeVector3(_0xb43e5d?.target, {
    x: 0,
    y: 1.2,
    z: 0
  });
  const _0x47c525 = clamp(Number(_0xb43e5d?.orbitDistance) || 8, SCENE_ORBIT_DISTANCE_MIN, SCENE_ORBIT_DISTANCE_MAX);
  const _0x1d3d40 = resolvePoseForwardVector(_0x47d76a, {
    x: 0,
    y: 0,
    z: -1
  });
  const _0x684d27 = normalize3(_0x1d3d40, {
    x: 0,
    y: 0,
    z: -1
  });
  const _0x2daedf = dot(subtract(_0x4d1995, _0x2f9f08), _0x684d27);
  const _0xf51c3 = Number.isFinite(_0x2daedf) && _0x2daedf > SCENE_ORBIT_DISTANCE_MIN ? clamp(_0x2daedf, SCENE_ORBIT_DISTANCE_MIN, SCENE_ORBIT_DISTANCE_MAX) : _0x47c525;
  const _0x2d197a = {
    x: _0x2f9f08.x + _0x684d27.x * _0xf51c3,
    y: _0x2f9f08.y + _0x684d27.y * _0xf51c3,
    z: _0x2f9f08.z + _0x684d27.z * _0xf51c3
  };
  const _0x17d53f = Math.atan2(-_0x684d27.x, -_0x684d27.z);
  const _0x4d0240 = Math.asin(clamp(-_0x684d27.y, -1, 1));
  return {
    target: _0x2d197a,
    orbitYaw: normalizeAngle(_0x17d53f),
    orbitPitch: clampSceneOrbitPitch(_0x4d0240),
    orbitDistance: _0xf51c3
  };
}
export function cameraPoseToPanoramaView(_0x25992b) {
  const _0x4aabc0 = resolvePoseForwardVector(_0x25992b, {
    x: 0,
    y: 0,
    z: -1
  });
  const _0x1cfffb = Math.hypot(_0x4aabc0.x, _0x4aabc0.y, _0x4aabc0.z) || 1;
  const _0x598d2c = {
    x: _0x4aabc0.x / _0x1cfffb,
    y: _0x4aabc0.y / _0x1cfffb,
    z: _0x4aabc0.z / _0x1cfffb
  };
  return {
    yaw: normalizeAngle(Math.atan2(_0x598d2c.x, _0x598d2c.z)),
    pitch: clampPanoramaPitch(Math.asin(clamp(_0x598d2c.y, -1, 1))),
    fov: clamp(Number(_0x25992b?.fov) || PANORAMA_FOV_DEFAULT, PANORAMA_FOV_MIN, PANORAMA_FOV_MAX)
  };
}
export function computeConstrainedMoveDelta({
  startPoint: _0x16a879,
  currentPoint: _0x319d23,
  axis: _0x1b56a4,
  planeNormal: _0x272483,
  mode = "plane"
} = {}) {
  const _0x5ac1b = normalizeVector3(_0x16a879, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x1ab007 = normalizeVector3(_0x319d23, _0x5ac1b);
  const _0xa6d8db = subtract(_0x1ab007, _0x5ac1b);
  if (mode === "axis") {
    const _0xc3719a = normalize3(_0x1b56a4, {
      x: 1,
      y: 0,
      z: 0
    });
    const _0x445605 = dot(_0xa6d8db, _0xc3719a);
    return scale(_0xc3719a, _0x445605);
  }
  return subtractProjection(_0xa6d8db, _0x272483);
}
export function computeSignedRotationDelta({
  startPoint: _0x5b52b9,
  currentPoint: _0x18af15,
  pivot: _0xe35643,
  axis: _0x3c138b
} = {}) {
  const _0x3791c7 = normalizeVector3(_0xe35643, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x48d84f = normalize3(_0x3c138b, {
    x: 0,
    y: 1,
    z: 0
  });
  const _0xfb5e9d = subtractProjection(subtract(_0x5b52b9, _0x3791c7), _0x48d84f);
  const _0x51e5eb = subtractProjection(subtract(_0x18af15, _0x3791c7), _0x48d84f);
  const _0x5727b5 = safeLength(_0xfb5e9d);
  const _0x30e19e = safeLength(_0x51e5eb);
  if (_0x5727b5 < 0.000001 || _0x30e19e < 0.000001) {
    return 0;
  }
  const _0x32d726 = scale(_0xfb5e9d, 1 / _0x5727b5);
  const _0x4466ec = scale(_0x51e5eb, 1 / _0x30e19e);
  const _0x4b0c66 = cross(_0x32d726, _0x4466ec);
  const _0x5538c0 = dot(_0x4b0c66, _0x48d84f);
  const _0x15b0b1 = clamp(dot(_0x32d726, _0x4466ec), -1, 1);
  return Math.atan2(_0x5538c0, _0x15b0b1);
}
export function computeAxisScaleFactor({
  startPoint: _0x2cce18,
  currentPoint: _0x4e7fff,
  pivot: _0x3c55ae,
  axis: _0xe4d94e,
  dragDirection = null,
  referenceDistance = 1
} = {}) {
  const _0x3b284f = normalize3(dragDirection || _0xe4d94e, {
    x: 1,
    y: 0,
    z: 0
  });
  const _0x1ac958 = normalizeVector3(_0x3c55ae, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x2450bc = subtract(normalizeVector3(_0x2cce18, {
    x: 0,
    y: 0,
    z: 0
  }), _0x1ac958);
  const _0x1211b2 = subtract(normalizeVector3(_0x4e7fff, {
    x: 0,
    y: 0,
    z: 0
  }), _0x1ac958);
  const _0x14bc25 = dot(_0x1211b2, _0x3b284f) - dot(_0x2450bc, _0x3b284f);
  const _0x4d5606 = Math.max(0.2, Number(referenceDistance) || 1);
  return clamp(1 + _0x14bc25 / _0x4d5606, 0.01, 8);
}
export function computeAxisScaleFactorFromScreenDelta({
  startX = 0,
  startY = 0,
  currentX = 0,
  currentY = 0,
  axisDirection: _0x550758,
  referencePixels = 96
} = {}) {
  const _0x362c65 = Number(_0x550758?.x);
  const _0x14247c = Number(_0x550758?.y);
  const _0x9428b = Math.hypot(_0x362c65, _0x14247c);
  if (!Number.isFinite(_0x9428b) || _0x9428b < 0.000001) {
    return 1;
  }
  const _0x3913c9 = (Number(currentX) || 0) - (Number(startX) || 0);
  const _0x20720e = (Number(currentY) || 0) - (Number(startY) || 0);
  const _0x1fde36 = (_0x3913c9 * _0x362c65 + _0x20720e * _0x14247c) / _0x9428b;
  const _0x37acfd = Math.max(12, Number(referencePixels) || 96);
  return clamp(1 + _0x1fde36 / _0x37acfd, 0.01, 8);
}
export function computeUniformScaleFactor({
  startPoint: _0x300503,
  currentPoint: _0x166170,
  pivot: _0x4c752a,
  minDistance = 0.2
} = {}) {
  const _0xa0b41a = normalizeVector3(_0x4c752a, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x165c72 = Math.max(Number(minDistance) || 0.2, safeLength(subtract(_0x300503, _0xa0b41a)));
  const _0x14eaf8 = Math.max(0.0001, safeLength(subtract(_0x166170, _0xa0b41a)));
  return clamp(_0x14eaf8 / _0x165c72, 0.01, 8);
}