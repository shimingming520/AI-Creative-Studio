import { createStoryboard3DShotAnimation, normalizeStoryboard3DShotAnimation, upsertStoryboard3DCameraKeyframe } from "./shotAnimation.js";
export const STORYBOARD_3D_PROJECT_VERSION = 2;
export const STORYBOARD_3D_SHOT_SIZES = Object.freeze(["EST", "ELS", "LS", "MLS", "MED", "MCU", "CU", "ECU"]);
export const STORYBOARD_3D_SHOT_ANGLES = Object.freeze(["eye", "high", "low", "top", "overShoulder", "profile", "rear"]);
const SCENE_ENVIRONMENT_TYPES = new Set(["empty", "outdoor", "indoor", "studio"]);
const SCENE_OBJECT_TYPES = new Set(["prop", "character", "light", "camera", "group"]);
const LIGHT_TYPES = new Set(["ambient", "directional", "point", "spot"]);
const SHOT_SIZE_SET = new Set(STORYBOARD_3D_SHOT_SIZES);
const SHOT_ANGLE_SET = new Set(STORYBOARD_3D_SHOT_ANGLES);
function toFiniteNumber(_0xf406d, _0x27f840) {
  const _0x430dfe = Number(_0xf406d);
  if (Number.isFinite(_0x430dfe)) {
    return _0x430dfe;
  } else {
    return _0x27f840;
  }
}
function toPositiveNumber(_0x3ab2fa, _0x4eb6ca, _0x2b02dc = 0.0001) {
  return Math.max(_0x2b02dc, toFiniteNumber(_0x3ab2fa, _0x4eb6ca));
}
function normalizeString(_0x30c5b5, _0x3fbbd2 = "") {
  const _0x3458b3 = String(_0x30c5b5 ?? "").trim();
  return _0x3458b3 || _0x3fbbd2;
}
function normalizeOptionalString(_0x48de60) {
  const _0x4d1e0d = String(_0x48de60 ?? "").trim();
  return _0x4d1e0d || undefined;
}
function normalizeVector3(_0x587f4e, _0x2122b6) {
  const _0x1e193a = Array.isArray(_0x587f4e) ? _0x587f4e : [];
  return [toFiniteNumber(_0x1e193a[0], _0x2122b6[0]), toFiniteNumber(_0x1e193a[1], _0x2122b6[1]), toFiniteNumber(_0x1e193a[2], _0x2122b6[2])];
}
function normalizeVector2(_0xdf2453, _0x5676e9) {
  const _0x272f49 = Array.isArray(_0xdf2453) ? _0xdf2453 : [];
  return [toFiniteNumber(_0x272f49[0], _0x5676e9[0]), toFiniteNumber(_0x272f49[1], _0x5676e9[1])];
}
function normalizeVector2List(_0x36d0a7) {
  return (Array.isArray(_0x36d0a7) ? _0x36d0a7 : []).slice(0, 24).filter(_0x35f0b5 => Array.isArray(_0x35f0b5)).map(_0x53b4b0 => normalizeVector2(_0x53b4b0, [0, 0]));
}
function createDefaultId(_0x39df69 = "item") {
  const _0x5c2319 = globalThis.crypto?.randomUUID?.();
  if (_0x5c2319) {
    return _0x39df69 + "_" + _0x5c2319;
  }
  return _0x39df69 + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}
function resolveIdFactory(_0x34b24b) {
  if (typeof _0x34b24b === "function") {
    return _0x34b24b;
  } else {
    return createDefaultId;
  }
}
function normalizeTimestamp(_0x39a0f6, _0x1a6c79) {
  return Math.max(0, toFiniteNumber(_0x39a0f6, _0x1a6c79));
}
export function cloneStoryboard3DProject(_0x1a7855) {
  if (typeof structuredClone === "function") {
    return structuredClone(_0x1a7855);
  }
  return JSON.parse(JSON.stringify(_0x1a7855));
}
export function createDefaultStoryboard3DTransform() {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  };
}
export function createDefaultStoryboard3DCameraState() {
  return {
    position: [5, 4, 7],
    target: [0, 1.2, 0],
    focalLength: 35,
    near: 0.1,
    far: 1000,
    aspectRatio: "16:9"
  };
}
function cameraRotationFromState(_0x44cdbb) {
  const _0x5ef562 = normalizeVector3(_0x44cdbb?.position, [5, 4, 7]);
  const _0x2fc664 = normalizeVector3(_0x44cdbb?.target, [0, 1.2, 0]);
  const _0x35492d = _0x2fc664.map((_0x224d5f, _0xc62035) => _0x224d5f - _0x5ef562[_0xc62035]);
  const _0x1dbdad = Math.max(0.0001, Math.hypot(..._0x35492d));
  return [Math.asin(Math.max(-1, Math.min(1, _0x35492d[1] / _0x1dbdad))), Math.atan2(-_0x35492d[0], -_0x35492d[2]), toFiniteNumber(_0x44cdbb?.roll, 0)];
}
function cameraTargetFromRotation(_0x7171bf, _0x15295b, _0x2e813b) {
  const _0x258219 = normalizeVector3(_0x7171bf, [5, 4, 7]);
  const _0x7b07c1 = normalizeVector3(_0x15295b, [0, 0, 0]);
  const _0x1ed6c5 = Math.max(0.25, toFiniteNumber(_0x2e813b, 5));
  const _0x468349 = Math.cos(_0x7b07c1[0]);
  return [_0x258219[0] - Math.sin(_0x7b07c1[1]) * _0x468349 * _0x1ed6c5, _0x258219[1] + Math.sin(_0x7b07c1[0]) * _0x1ed6c5, _0x258219[2] - Math.cos(_0x7b07c1[1]) * _0x468349 * _0x1ed6c5];
}
function boundCameraName(_0x5933f2) {
  return normalizeString(_0x5933f2?.name, "Shot") + " 摄像机";
}
export function createStoryboard3DCameraObject({
  id: _0x17cfac,
  name: _0x2f8ca2,
  camera: _0x34877f,
  visible = true,
  locked = false,
  idFactory: _0x4d354e
} = {}) {
  const _0x598107 = resolveIdFactory(_0x4d354e);
  const _0x4ec4f0 = normalizeCameraState(_0x34877f);
  return {
    id: normalizeString(_0x17cfac, _0x598107("camera")),
    type: "camera",
    name: normalizeString(_0x2f8ca2, "摄像机"),
    visible: visible !== false,
    locked: locked === true,
    transform: {
      position: [..._0x4ec4f0.position],
      rotation: cameraRotationFromState(_0x4ec4f0),
      scale: [1, 1, 1]
    },
    target: [..._0x4ec4f0.target],
    focalLength: _0x4ec4f0.focalLength,
    near: _0x4ec4f0.near,
    far: _0x4ec4f0.far,
    aspectRatio: _0x4ec4f0.aspectRatio,
    ...(_0x4ec4f0.fov != null ? {
      fov: _0x4ec4f0.fov
    } : {})
  };
}
export function getStoryboard3DCameraStateFromObject(_0x4248d6, _0x52acce) {
  const _0x5b440d = normalizeCameraState(_0x52acce);
  const _0x3e7752 = normalizeCameraState({
    ..._0x5b440d,
    position: _0x4248d6?.transform?.position ?? _0x5b440d.position,
    target: _0x4248d6?.target ?? _0x5b440d.target,
    focalLength: _0x4248d6?.focalLength ?? _0x5b440d.focalLength,
    near: _0x4248d6?.near ?? _0x5b440d.near,
    far: _0x4248d6?.far ?? _0x5b440d.far,
    aspectRatio: _0x4248d6?.aspectRatio ?? _0x5b440d.aspectRatio,
    fov: _0x4248d6?.fov ?? _0x5b440d.fov,
    roll: _0x4248d6?.transform?.rotation?.[2] ?? _0x5b440d.roll
  });
  if (_0x52acce?.roll == null && Math.abs(_0x3e7752.roll || 0) < 0.000001) {
    delete _0x3e7752.roll;
  }
  return _0x3e7752;
}
export function syncStoryboard3DCameraObjectFromShot(_0x2aa228, _0x3892fa) {
  const _0x16a477 = _0x2aa228?.objects?.findIndex?.(_0x29f99a => _0x29f99a.id === _0x3892fa?.cameraId && _0x29f99a.type === "camera") ?? -1;
  if (_0x16a477 < 0 || !_0x3892fa?.camera) {
    return null;
  }
  const _0x2fe08a = _0x2aa228.objects[_0x16a477];
  const _0x225f6e = normalizeCameraState(_0x3892fa.camera);
  const _0x5b0ba2 = {
    ..._0x2fe08a,
    name: boundCameraName(_0x3892fa),
    transform: {
      position: [..._0x225f6e.position],
      rotation: cameraRotationFromState(_0x225f6e),
      scale: [...(_0x2fe08a.transform?.scale || [1, 1, 1])]
    },
    target: [..._0x225f6e.target],
    focalLength: _0x225f6e.focalLength,
    near: _0x225f6e.near,
    far: _0x225f6e.far,
    aspectRatio: _0x225f6e.aspectRatio
  };
  if (_0x225f6e.fov != null) {
    _0x5b0ba2.fov = _0x225f6e.fov;
  } else {
    delete _0x5b0ba2.fov;
  }
  _0x2aa228.objects[_0x16a477] = _0x5b0ba2;
  return _0x5b0ba2;
}
export function syncStoryboard3DShotFromCameraObject(_0x5a8378, _0x3f7aa9, {
  previousTransform: _0x2c0149
} = {}) {
  const _0x5554a8 = _0x5a8378?.objects?.find?.(_0x4f29e4 => _0x4f29e4.id === _0x3f7aa9 && _0x4f29e4.type === "camera");
  const _0x3299a0 = _0x5a8378?.shots?.find?.(_0x35635d => _0x35635d.cameraId === _0x3f7aa9);
  if (!_0x5554a8 || !_0x3299a0) {
    return null;
  }
  if (_0x2c0149) {
    const _0x433a20 = normalizeVector3(_0x2c0149.position, _0x5554a8.transform.position);
    const _0x70d6d9 = normalizeVector3(_0x5554a8.transform.position, _0x433a20);
    const _0x20b8d2 = normalizeVector3(_0x2c0149.rotation, _0x5554a8.transform.rotation);
    const _0x491df2 = normalizeVector3(_0x5554a8.transform.rotation, _0x20b8d2);
    const _0xbfaba5 = _0x491df2.some((_0x246967, _0x44cecc) => Math.abs(_0x246967 - _0x20b8d2[_0x44cecc]) > 0.000001);
    const _0x4c0426 = Math.max(0.25, Math.hypot(...normalizeVector3(_0x5554a8.target, _0x3299a0.camera.target).map((_0x14ec48, _0x37bca7) => _0x14ec48 - _0x433a20[_0x37bca7])));
    _0x5554a8.target = _0xbfaba5 ? cameraTargetFromRotation(_0x70d6d9, _0x491df2, _0x4c0426) : normalizeVector3(_0x5554a8.target, _0x3299a0.camera.target).map((_0x543961, _0x6d7a6d) => _0x543961 + _0x70d6d9[_0x6d7a6d] - _0x433a20[_0x6d7a6d]);
  }
  const _0x1f4f7f = getStoryboard3DCameraStateFromObject(_0x5554a8, _0x3299a0.camera);
  _0x3299a0.camera = _0x1f4f7f;
  _0x3299a0.animation = upsertStoryboard3DCameraKeyframe(_0x3299a0.animation, {
    time: 0,
    camera: _0x1f4f7f
  });
  return _0x3299a0;
}
export function createDefaultStoryboard3DEnvironment(_0x3786e9 = "empty") {
  return {
    type: SCENE_ENVIRONMENT_TYPES.has(_0x3786e9) ? _0x3786e9 : "empty",
    showGrid: true,
    showOutline: true,
    enableShadows: true,
    groundSize: 100
  };
}
export function createStoryboard3DShot({
  id: _0x5186a3,
  sceneId: _0x1cdcca,
  name = "Shot 1",
  description = "",
  camera: _0x2cb896,
  cameraId: _0x1e0600,
  order = 0,
  now = Date.now(),
  idFactory: _0x271098
} = {}) {
  const _0x4e96f3 = resolveIdFactory(_0x271098);
  const _0xaa0568 = normalizeCameraState(_0x2cb896);
  const _0x120217 = {
    id: normalizeString(_0x5186a3, _0x4e96f3("shot")),
    sceneId: normalizeString(_0x1cdcca, "scene"),
    name: normalizeString(name, "Shot 1"),
    description: String(description || ""),
    camera: _0xaa0568,
    animation: createStoryboard3DShotAnimation({
      camera: _0xaa0568,
      idFactory: _0x4e96f3
    }),
    shotSize: "MED",
    shotAngle: "eye",
    order: Math.max(0, Math.round(toFiniteNumber(order, 0))),
    createdAt: now,
    updatedAt: now
  };
  const _0x5a0e0d = normalizeOptionalString(_0x1e0600);
  if (_0x5a0e0d) {
    _0x120217.cameraId = _0x5a0e0d;
  }
  return _0x120217;
}
export function createStoryboard3DScene({
  id: _0x5d5ddc,
  name = "Scene 1",
  environmentType = "empty",
  shotName = "Shot 1",
  now = Date.now(),
  idFactory: _0x403fec
} = {}) {
  const _0x4e0545 = resolveIdFactory(_0x403fec);
  const _0x19cae4 = normalizeString(_0x5d5ddc, _0x4e0545("scene"));
  const _0x49e44f = createDefaultStoryboard3DCameraState();
  const _0xce2980 = createStoryboard3DCameraObject({
    name: shotName + " 摄像机",
    camera: _0x49e44f,
    idFactory: _0x4e0545
  });
  const _0x32d695 = createStoryboard3DShot({
    sceneId: _0x19cae4,
    name: shotName,
    camera: _0x49e44f,
    cameraId: _0xce2980.id,
    now: now,
    idFactory: _0x4e0545
  });
  return {
    id: _0x19cae4,
    name: normalizeString(name, "Scene 1"),
    environment: createDefaultStoryboard3DEnvironment(environmentType),
    objects: [_0xce2980],
    shots: [_0x32d695],
    activeShotId: _0x32d695.id
  };
}
export function createStoryboard3DProject({
  id: _0x35f006,
  name = "3D Storyboard",
  sceneName = "Scene 1",
  shotName = "Shot 1",
  environmentType = "empty",
  now = Date.now(),
  idFactory: _0x3bcca4
} = {}) {
  const _0x25f80f = resolveIdFactory(_0x3bcca4);
  const _0x17fb17 = createStoryboard3DScene({
    name: sceneName,
    shotName: shotName,
    environmentType: environmentType,
    now: now,
    idFactory: _0x25f80f
  });
  return {
    id: normalizeString(_0x35f006, _0x25f80f("project")),
    name: normalizeString(name, "3D Storyboard"),
    version: STORYBOARD_3D_PROJECT_VERSION,
    scenes: [_0x17fb17],
    activeSceneId: _0x17fb17.id,
    createdAt: now,
    updatedAt: now
  };
}
function normalizeTransform(_0x460fcf) {
  return {
    position: normalizeVector3(_0x460fcf?.position, [0, 0, 0]),
    rotation: normalizeVector3(_0x460fcf?.rotation, [0, 0, 0]),
    scale: normalizeVector3(_0x460fcf?.scale, [1, 1, 1]).map(_0x3c76ac => Math.max(0.001, _0x3c76ac))
  };
}
function normalizeSceneObject(_0xbb52d3, {
  idFactory: _0x3584d4
} = {}) {
  if (!_0xbb52d3 || !SCENE_OBJECT_TYPES.has(_0xbb52d3.type)) {
    return null;
  }
  const _0x4de4c8 = resolveIdFactory(_0x3584d4);
  const _0x595370 = {
    id: normalizeString(_0xbb52d3.id, _0x4de4c8(_0xbb52d3.type)),
    name: normalizeString(_0xbb52d3.name, _0xbb52d3.type),
    visible: _0xbb52d3.visible !== false,
    locked: _0xbb52d3.locked === true,
    transform: normalizeTransform(_0xbb52d3.transform)
  };
  const _0x48f67d = normalizeOptionalString(_0xbb52d3.parentId);
  if (_0x48f67d) {
    _0x595370.parentId = _0x48f67d;
  }
  if (_0xbb52d3.type === "prop") {
    return {
      ..._0x595370,
      type: "prop",
      assetId: normalizeString(_0xbb52d3.assetId, "missing-asset"),
      ...(normalizeOptionalString(_0xbb52d3.tint) ? {
        tint: normalizeOptionalString(_0xbb52d3.tint)
      } : {}),
      castShadow: _0xbb52d3.castShadow !== false,
      receiveShadow: _0xbb52d3.receiveShadow !== false
    };
  }
  if (_0xbb52d3.type === "character") {
    const _0x2271cc = Array.isArray(_0xbb52d3.attachmentIds) ? _0xbb52d3.attachmentIds.map(_0x4132e8 => normalizeString(_0x4132e8)).filter(Boolean) : [];
    return {
      ..._0x595370,
      type: "character",
      bodyPresetId: normalizeString(_0xbb52d3.bodyPresetId, "default"),
      ...(normalizeOptionalString(_0xbb52d3.actionId) ? {
        actionId: normalizeOptionalString(_0xbb52d3.actionId)
      } : {}),
      ...(Number.isFinite(Number(_0xbb52d3.actionTime)) ? {
        actionTime: Math.max(0, Number(_0xbb52d3.actionTime))
      } : {}),
      actionPlaying: _0xbb52d3.actionPlaying === true,
      ...(normalizeOptionalString(_0xbb52d3.leftHandPoseId) ? {
        leftHandPoseId: normalizeOptionalString(_0xbb52d3.leftHandPoseId)
      } : {}),
      ...(normalizeOptionalString(_0xbb52d3.rightHandPoseId) ? {
        rightHandPoseId: normalizeOptionalString(_0xbb52d3.rightHandPoseId)
      } : {}),
      ...(normalizeOptionalString(_0xbb52d3.hairId) ? {
        hairId: normalizeOptionalString(_0xbb52d3.hairId)
      } : {}),
      ...(_0x2271cc.length > 0 ? {
        attachmentIds: _0x2271cc
      } : {}),
      ...(_0xbb52d3.boneOverrides && typeof _0xbb52d3.boneOverrides === "object" ? {
        boneOverrides: cloneStoryboard3DProject(_0xbb52d3.boneOverrides)
      } : {})
    };
  }
  if (_0xbb52d3.type === "light") {
    return {
      ..._0x595370,
      type: "light",
      lightType: LIGHT_TYPES.has(_0xbb52d3.lightType) ? _0xbb52d3.lightType : "directional",
      color: normalizeString(_0xbb52d3.color, "#ffffff"),
      intensity: Math.max(0, toFiniteNumber(_0xbb52d3.intensity, 1)),
      ...(Number.isFinite(Number(_0xbb52d3.distance)) ? {
        distance: Math.max(0, Number(_0xbb52d3.distance))
      } : {}),
      ...(Number.isFinite(Number(_0xbb52d3.decay)) ? {
        decay: Math.max(0, Number(_0xbb52d3.decay))
      } : {}),
      ...(Number.isFinite(Number(_0xbb52d3.angle)) ? {
        angle: Math.max(0, Number(_0xbb52d3.angle))
      } : {}),
      castShadow: _0xbb52d3.castShadow === true
    };
  }
  if (_0xbb52d3.type === "camera") {
    return {
      ..._0x595370,
      type: "camera",
      focalLength: toPositiveNumber(_0xbb52d3.focalLength, 35, 1),
      near: toPositiveNumber(_0xbb52d3.near, 0.1, 0.001),
      far: toPositiveNumber(_0xbb52d3.far, 1000, 1),
      target: normalizeVector3(_0xbb52d3.target, [0, 1.2, 0]),
      aspectRatio: normalizeString(_0xbb52d3.aspectRatio, "16:9"),
      ...(_0xbb52d3.fov != null && Number.isFinite(Number(_0xbb52d3.fov)) ? {
        fov: Math.max(1, Math.min(179, Number(_0xbb52d3.fov)))
      } : {})
    };
  }
  return {
    ..._0x595370,
    type: "group"
  };
}
function normalizeCameraState(_0x29be3c) {
  const _0x344ea6 = {
    position: normalizeVector3(_0x29be3c?.position, [5, 4, 7]),
    target: normalizeVector3(_0x29be3c?.target, [0, 1.2, 0]),
    focalLength: toPositiveNumber(_0x29be3c?.focalLength, 35, 1),
    near: toPositiveNumber(_0x29be3c?.near, 0.1, 0.001),
    far: toPositiveNumber(_0x29be3c?.far, 1000, 1),
    aspectRatio: normalizeString(_0x29be3c?.aspectRatio, "16:9")
  };
  if (_0x29be3c?.fov != null && Number.isFinite(Number(_0x29be3c.fov))) {
    _0x344ea6.fov = Math.max(1, Math.min(179, Number(_0x29be3c.fov)));
  }
  if (_0x29be3c?.roll != null && Number.isFinite(Number(_0x29be3c.roll))) {
    _0x344ea6.roll = Math.max(-Math.PI, Math.min(Math.PI, Number(_0x29be3c.roll)));
  }
  return _0x344ea6;
}
function normalizeShot(_0x4b59f7, _0x3b4e35, _0x3cacf7, {
  now: _0x466157,
  idFactory: _0x5cd83d,
  objectIds: _0x2b790f,
  objectTransforms: _0x264a7f
} = {}) {
  const _0x40dfdb = resolveIdFactory(_0x5cd83d);
  const _0x1d7223 = normalizeTimestamp(_0x4b59f7?.createdAt, _0x466157);
  const _0x18c732 = normalizeCameraState(_0x4b59f7?.camera);
  const _0x2e620d = normalizeStoryboard3DShotAnimation(_0x4b59f7?.animation, {
    camera: _0x18c732,
    objectIds: _0x2b790f,
    objectTransforms: _0x264a7f,
    idFactory: _0x40dfdb
  });
  const _0x338639 = normalizeCameraState(_0x2e620d.cameraKeyframes[0]?.camera || _0x18c732);
  const _0x3709da = {
    id: normalizeString(_0x4b59f7?.id, _0x40dfdb("shot")),
    sceneId: _0x3b4e35,
    name: normalizeString(_0x4b59f7?.name, "Shot " + (_0x3cacf7 + 1)),
    description: String(_0x4b59f7?.description || ""),
    camera: _0x338639,
    animation: _0x2e620d,
    shotSize: SHOT_SIZE_SET.has(_0x4b59f7?.shotSize) ? _0x4b59f7.shotSize : "MED",
    shotAngle: SHOT_ANGLE_SET.has(_0x4b59f7?.shotAngle) ? _0x4b59f7.shotAngle : "eye",
    order: Math.max(0, Math.round(toFiniteNumber(_0x4b59f7?.order, _0x3cacf7))),
    createdAt: _0x1d7223,
    updatedAt: normalizeTimestamp(_0x4b59f7?.updatedAt, _0x1d7223)
  };
  const _0x229d6c = normalizeOptionalString(_0x4b59f7?.cameraId);
  if (_0x229d6c) {
    _0x3709da.cameraId = _0x229d6c;
  }
  const _0x4b6889 = normalizeOptionalString(_0x4b59f7?.thumbnailUrl);
  if (_0x4b6889) {
    _0x3709da.thumbnailUrl = _0x4b6889;
  }
  return _0x3709da;
}
function normalizeBackground(_0x47cf68) {
  const _0x8d0154 = normalizeOptionalString(_0x47cf68?.imageUrl);
  if (!_0x8d0154) {
    return undefined;
  }
  const _0x1941f8 = normalizeOptionalString(_0x47cf68?.binaryAssetId);
  const _0xdc459d = {
    imageUrl: _0x8d0154,
    ...(_0x1941f8 ? {
      binaryAssetId: _0x1941f8
    } : {}),
    horizontalFov: toPositiveNumber(_0x47cf68?.horizontalFov, 50, 1),
    ...(_0x47cf68?.verticalFov != null && Number.isFinite(Number(_0x47cf68.verticalFov)) ? {
      verticalFov: toPositiveNumber(_0x47cf68.verticalFov, 35, 1)
    } : {}),
    ...(Number.isFinite(Number(_0x47cf68?.horizonY)) ? {
      horizonY: Number(_0x47cf68.horizonY)
    } : {}),
    ...(Number.isFinite(Number(_0x47cf68?.horizonSlope)) ? {
      horizonSlope: Math.max(-1, Math.min(1, Number(_0x47cf68.horizonSlope)))
    } : {}),
    ...(Array.isArray(_0x47cf68?.vanishingPoint) ? {
      vanishingPoint: normalizeVector2(_0x47cf68.vanishingPoint, [0.5, 0.5])
    } : {}),
    cameraHeight: toPositiveNumber(_0x47cf68?.cameraHeight, 1.6, 0.2),
    imageScale: toPositiveNumber(_0x47cf68?.imageScale, 1, 0.01),
    imageOffset: normalizeVector2(_0x47cf68?.imageOffset, [0, 0]),
    lockedCamera: _0x47cf68?.lockedCamera === true,
    ...(_0x47cf68?.lockedCameraSnapshot ? {
      lockedCameraSnapshot: normalizeCameraState(_0x47cf68.lockedCameraSnapshot)
    } : {})
  };
  const _0x509389 = Math.max(0, Math.round(toFiniteNumber(_0x47cf68?.imageWidth, 0)));
  const _0x2bfade = Math.max(0, Math.round(toFiniteNumber(_0x47cf68?.imageHeight, 0)));
  if (_0x509389 > 0) {
    _0xdc459d.imageWidth = _0x509389;
  }
  if (_0x2bfade > 0) {
    _0xdc459d.imageHeight = _0x2bfade;
  }
  const _0x95ec57 = normalizeVector2List(_0x47cf68?.groundRegion);
  if (_0x95ec57.length >= 3) {
    _0xdc459d.groundRegion = _0x95ec57;
  }
  const _0x2574fc = normalizeOptionalString(_0x47cf68?.calibrationMethod);
  if (_0x2574fc) {
    _0xdc459d.calibrationMethod = _0x2574fc;
  }
  if (_0x47cf68?.calibrationConfidence != null && Number.isFinite(Number(_0x47cf68.calibrationConfidence))) {
    _0xdc459d.calibrationConfidence = Math.max(0, Math.min(1, Number(_0x47cf68.calibrationConfidence)));
  }
  return _0xdc459d;
}
function normalizeScene(_0x5b11d4, _0x285f77, {
  now: _0x4ec698,
  idFactory: _0x952bf2
} = {}) {
  const _0x41c766 = resolveIdFactory(_0x952bf2);
  const _0x38148f = normalizeString(_0x5b11d4?.id, _0x41c766("scene"));
  const _0x3a8608 = (Array.isArray(_0x5b11d4?.objects) ? _0x5b11d4.objects : []).map(_0x1041dc => normalizeSceneObject(_0x1041dc, {
    idFactory: _0x41c766
  })).filter(Boolean);
  const _0x19b327 = _0x3a8608;
  const _0x5df569 = new Set(_0x19b327.filter(_0x709180 => _0x709180.type !== "camera").map(_0x299c5c => _0x299c5c.id));
  const _0xeaa098 = Object.fromEntries(_0x19b327.filter(_0x586ab0 => _0x586ab0.type !== "camera").map(_0x3bbc74 => [_0x3bbc74.id, _0x3bbc74.transform]));
  const _0x53023d = Array.isArray(_0x5b11d4?.shots) ? _0x5b11d4.shots : [];
  const _0x313109 = _0x53023d.map((_0x10a0f7, _0x1d4fed) => normalizeShot(_0x10a0f7, _0x38148f, _0x1d4fed, {
    now: _0x4ec698,
    idFactory: _0x41c766,
    objectIds: _0x5df569,
    objectTransforms: _0xeaa098
  }));
  const _0x5a2870 = new Set();
  _0x313109.forEach(_0x17313c => {
    let _0x1b6a63 = _0x19b327.find(_0x564e75 => _0x564e75.id === _0x17313c.cameraId && _0x564e75.type === "camera");
    if (!_0x1b6a63 || _0x5a2870.has(_0x1b6a63.id)) {
      _0x1b6a63 = createStoryboard3DCameraObject({
        name: boundCameraName(_0x17313c),
        camera: _0x17313c.camera,
        idFactory: _0x41c766
      });
      _0x19b327.push(_0x1b6a63);
      _0x17313c.cameraId = _0x1b6a63.id;
    }
    _0x5a2870.add(_0x1b6a63.id);
    syncStoryboard3DCameraObjectFromShot({
      objects: _0x19b327
    }, _0x17313c);
  });
  _0x19b327.filter(_0x4566f7 => _0x4566f7.type === "camera" && !_0x5a2870.has(_0x4566f7.id)).forEach(_0x48e47c => {
    const _0x3af13e = createStoryboard3DShot({
      sceneId: _0x38148f,
      name: _0x48e47c.name,
      camera: getStoryboard3DCameraStateFromObject(_0x48e47c),
      cameraId: _0x48e47c.id,
      order: _0x313109.length,
      now: _0x4ec698,
      idFactory: _0x41c766
    });
    _0x313109.push(_0x3af13e);
    _0x5a2870.add(_0x48e47c.id);
    syncStoryboard3DCameraObjectFromShot({
      objects: _0x19b327
    }, _0x3af13e);
  });
  const _0x520a4d = new Set(_0x313109.map(_0x536083 => _0x536083.id));
  const _0x12b416 = SCENE_ENVIRONMENT_TYPES.has(_0x5b11d4?.environment?.type) ? _0x5b11d4.environment.type : "empty";
  const _0x4b0def = {
    ...createDefaultStoryboard3DEnvironment(_0x12b416),
    showGrid: _0x5b11d4?.environment?.showGrid !== false,
    showOutline: _0x5b11d4?.environment?.showOutline !== false,
    enableShadows: _0x5b11d4?.environment?.enableShadows !== false,
    groundSize: toPositiveNumber(_0x5b11d4?.environment?.groundSize, 100, 1)
  };
  const _0x225d93 = normalizeOptionalString(_0x5b11d4?.environment?.backgroundColor);
  if (_0x225d93) {
    _0x4b0def.backgroundColor = _0x225d93;
  }
  const _0x201746 = normalizeBackground(_0x5b11d4?.background);
  return {
    id: _0x38148f,
    name: normalizeString(_0x5b11d4?.name, "Scene " + (_0x285f77 + 1)),
    environment: _0x4b0def,
    ...(_0x201746 ? {
      background: _0x201746
    } : {}),
    objects: _0x19b327,
    shots: _0x313109,
    activeShotId: _0x520a4d.has(_0x5b11d4?.activeShotId) ? _0x5b11d4.activeShotId : _0x313109[0]?.id || ""
  };
}
export function migrateStoryboard3DProject(_0x590dd1, {
  now = Date.now(),
  idFactory: _0x555b1,
  fallbackProject: _0x3ed9db
} = {}) {
  const _0x30def3 = resolveIdFactory(_0x555b1);
  if (!_0x590dd1 || typeof _0x590dd1 !== "object" || Array.isArray(_0x590dd1)) {
    if (_0x3ed9db) {
      return cloneStoryboard3DProject(_0x3ed9db);
    } else {
      return createStoryboard3DProject({
        now: now,
        idFactory: _0x30def3
      });
    }
  }
  const _0xead4b6 = Math.max(1, Math.round(toFiniteNumber(_0x590dd1.version, 1)));
  if (_0xead4b6 > STORYBOARD_3D_PROJECT_VERSION) {
    throw new Error("Unsupported 3D storyboard project version: " + _0xead4b6);
  }
  const _0x27d7f5 = Array.isArray(_0x590dd1.scenes) ? _0x590dd1.scenes : [];
  const _0x392bae = _0x27d7f5.map((_0x489755, _0x5a0b17) => normalizeScene(_0x489755, _0x5a0b17, {
    now: now,
    idFactory: _0x30def3
  }));
  if (_0x392bae.length === 0) {
    _0x392bae.push(createStoryboard3DScene({
      now: now,
      idFactory: _0x30def3
    }));
  }
  const _0x56e1e1 = new Set(_0x392bae.map(_0x24ee96 => _0x24ee96.id));
  const _0x475092 = normalizeTimestamp(_0x590dd1.createdAt, now);
  return {
    id: normalizeString(_0x590dd1.id, _0x30def3("project")),
    name: normalizeString(_0x590dd1.name, "3D Storyboard"),
    version: STORYBOARD_3D_PROJECT_VERSION,
    scenes: _0x392bae,
    activeSceneId: _0x56e1e1.has(_0x590dd1.activeSceneId) ? _0x590dd1.activeSceneId : _0x392bae[0].id,
    createdAt: _0x475092,
    updatedAt: normalizeTimestamp(_0x590dd1.updatedAt, _0x475092)
  };
}
export function summarizeStoryboard3DProject(_0xabb20c) {
  const _0x497d85 = Array.isArray(_0xabb20c?.scenes) ? _0xabb20c.scenes : [];
  return {
    sceneCount: _0x497d85.length,
    shotCount: _0x497d85.reduce((_0x4cb179, _0x366b43) => _0x4cb179 + (Array.isArray(_0x366b43?.shots) ? _0x366b43.shots.length : 0), 0),
    objectCount: _0x497d85.reduce((_0x3dc0ac, _0x3e3096) => _0x3dc0ac + (Array.isArray(_0x3e3096?.objects) ? _0x3e3096.objects.length : 0), 0)
  };
}
export function getActiveStoryboard3DScene(_0x589f70) {
  const _0x14c386 = Array.isArray(_0x589f70?.scenes) ? _0x589f70.scenes : [];
  return _0x14c386.find(_0x2fbcab => _0x2fbcab.id === _0x589f70?.activeSceneId) || _0x14c386[0] || null;
}
export function getActiveStoryboard3DShot(_0x46f965) {
  const _0x1c1a83 = getActiveStoryboard3DScene(_0x46f965);
  if (!_0x1c1a83) {
    return null;
  }
  return _0x1c1a83.shots?.find(_0x221957 => _0x221957.id === _0x1c1a83.activeShotId) || _0x1c1a83.shots?.[0] || null;
}