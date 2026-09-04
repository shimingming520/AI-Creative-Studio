const DEFAULT_DURATION_SECONDS = 6;
const DEFAULT_FPS = 24;
const MIN_DURATION_SECONDS = 0.1;
const MAX_DURATION_SECONDS = 3600;
const MIN_FPS = 1;
const MAX_FPS = 120;
const EASING_VALUES = new Set(["linear", "ease-in", "ease-out", "ease-in-out"]);
export const STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES = Object.freeze(["position", "rotation", "scale"]);
function finiteNumber(_0x523ea4, _0x60d73 = 0) {
  const _0x2d7469 = Number(_0x523ea4);
  if (Number.isFinite(_0x2d7469)) {
    return _0x2d7469;
  } else {
    return _0x60d73;
  }
}
function clamp(_0xebb077, _0x5f4ffa, _0x540d6e) {
  return Math.min(_0x540d6e, Math.max(_0x5f4ffa, _0xebb077));
}
function normalizeVector3(_0x1dfef9, _0x2d238a) {
  const _0x502131 = Array.isArray(_0x1dfef9) ? _0x1dfef9 : [];
  return [0, 1, 2].map(_0x10dcec => finiteNumber(_0x502131[_0x10dcec], _0x2d238a[_0x10dcec]));
}
function normalizeScale(_0xa5ee66) {
  return normalizeVector3(_0xa5ee66, [1, 1, 1]).map(_0x175898 => Math.max(0.001, _0x175898));
}
function normalizeTransform(_0x156cd2 = {}) {
  return {
    position: normalizeVector3(_0x156cd2.position, [0, 0, 0]),
    rotation: normalizeVector3(_0x156cd2.rotation, [0, 0, 0]),
    scale: normalizeScale(_0x156cd2.scale)
  };
}
function normalizeCamera(_0x17dba7 = {}) {
  const _0x1c8bb6 = Math.max(0.001, finiteNumber(_0x17dba7.near, 0.1));
  const _0x1b9d93 = {
    position: normalizeVector3(_0x17dba7.position, [5, 4, 7]),
    target: normalizeVector3(_0x17dba7.target, [0, 1.2, 0]),
    focalLength: clamp(finiteNumber(_0x17dba7.focalLength, 35), 1, 500),
    near: _0x1c8bb6,
    far: Math.max(_0x1c8bb6 + 0.001, finiteNumber(_0x17dba7.far, 1000)),
    aspectRatio: String(_0x17dba7.aspectRatio || "16:9")
  };
  if (_0x17dba7.fov != null && Number.isFinite(Number(_0x17dba7.fov))) {
    _0x1b9d93.fov = clamp(Number(_0x17dba7.fov), 1, 179);
  }
  if (_0x17dba7.roll != null && Number.isFinite(Number(_0x17dba7.roll))) {
    _0x1b9d93.roll = clamp(Number(_0x17dba7.roll), -Math.PI, Math.PI);
  }
  return _0x1b9d93;
}
function normalizeEasing(_0x28b4f5) {
  const _0x54e267 = String(_0x28b4f5 || "ease-in-out").trim().toLowerCase();
  if (EASING_VALUES.has(_0x54e267)) {
    return _0x54e267;
  } else {
    return "ease-in-out";
  }
}
function createKeyframeId(_0x130c18 = "keyframe", _0x89e9d) {
  if (typeof _0x89e9d === "function") {
    return String(_0x89e9d(_0x130c18));
  }
  const _0x23c493 = globalThis.crypto;
  if (typeof _0x23c493?.randomUUID === "function") {
    return _0x130c18 + "-" + _0x23c493.randomUUID();
  }
  return _0x130c18 + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}
function normalizeCameraKeyframe(_0x4ace7c, _0x3e6e52, _0x3999bc) {
  return {
    id: String(_0x4ace7c?.id || "camera-keyframe-" + (_0x3e6e52 + 1)),
    time: Math.max(0, finiteNumber(_0x4ace7c?.time, _0x3e6e52)),
    camera: normalizeCamera(_0x4ace7c?.camera || _0x3999bc),
    easing: normalizeEasing(_0x4ace7c?.easing)
  };
}
function normalizePropertyKeyframe(_0x4e167b, _0x37429a, _0x52b3c7, _0x37c49d) {
  const _0x2f2568 = normalizeTransform(_0x37c49d)[_0x52b3c7];
  const _0x5e72b1 = _0x52b3c7 === "scale" ? normalizeScale(_0x4e167b?.value) : normalizeVector3(_0x4e167b?.value, _0x2f2568);
  return {
    id: String(_0x4e167b?.id || _0x52b3c7 + "-keyframe-" + (_0x37429a + 1)),
    time: Math.max(0, finiteNumber(_0x4e167b?.time, _0x37429a)),
    value: _0x5e72b1,
    easing: normalizeEasing(_0x4e167b?.easing)
  };
}
function uniqueSortedKeyframes(_0xf5812c, _0x2fbeb7) {
  const _0x721762 = new Map();
  (Array.isArray(_0xf5812c) ? _0xf5812c : []).forEach((_0x46d7b1, _0x42d060) => {
    const _0xde3b37 = _0x2fbeb7(_0x46d7b1, _0x42d060);
    if (_0xde3b37.id) {
      _0x721762.set(_0xde3b37.id, _0xde3b37);
    }
  });
  return [..._0x721762.values()].sort((_0x3479b8, _0xdf7f86) => _0x3479b8.time - _0xdf7f86.time || _0x3479b8.id.localeCompare(_0xdf7f86.id));
}
function normalizeObjectTrack(_0x735cfd, _0x5aa961, _0x2ceea9) {
  const _0x427583 = {
    objectId: _0x5aa961
  };
  STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.forEach(_0x382f8e => {
    const _0x1ac523 = _0x382f8e + "Keyframes";
    _0x427583[_0x1ac523] = uniqueSortedKeyframes(_0x735cfd?.[_0x1ac523], (_0x3fc341, _0x4e3941) => normalizePropertyKeyframe(_0x3fc341, _0x4e3941, _0x382f8e, _0x2ceea9));
  });
  return _0x427583;
}
export function createStoryboard3DShotAnimation({
  camera: _0x16e9d8,
  duration = DEFAULT_DURATION_SECONDS,
  fps = DEFAULT_FPS,
  idFactory: _0x21b893
} = {}) {
  return {
    duration: clamp(finiteNumber(duration, DEFAULT_DURATION_SECONDS), MIN_DURATION_SECONDS, MAX_DURATION_SECONDS),
    fps: clamp(Math.round(finiteNumber(fps, DEFAULT_FPS)), MIN_FPS, MAX_FPS),
    loop: false,
    cameraKeyframes: [{
      id: createKeyframeId("camera-keyframe", _0x21b893),
      time: 0,
      camera: normalizeCamera(_0x16e9d8),
      easing: "ease-in-out"
    }],
    objectTracks: []
  };
}
export function normalizeStoryboard3DShotAnimation(_0x36cc44 = {}, {
  camera: _0x4648a2,
  objectIds: _0x2f547e,
  objectTransforms = {},
  idFactory: _0x39308f
} = {}) {
  const _0x482329 = _0x2f547e instanceof Set ? _0x2f547e : Array.isArray(_0x2f547e) ? new Set(_0x2f547e) : null;
  const _0x370e22 = uniqueSortedKeyframes(_0x36cc44?.cameraKeyframes, (_0x282c7a, _0x1a4f3b) => normalizeCameraKeyframe(_0x282c7a, _0x1a4f3b, _0x4648a2));
  if (_0x370e22.length === 0) {
    _0x370e22.push({
      id: createKeyframeId("camera-keyframe", _0x39308f),
      time: 0,
      camera: normalizeCamera(_0x4648a2),
      easing: "ease-in-out"
    });
  }
  const _0x1ed8ca = (Array.isArray(_0x36cc44?.objectTracks) ? _0x36cc44.objectTracks : []).map(_0x485afe => {
    const _0x1b4fd5 = String(_0x485afe?.objectId || "").trim();
    if (!_0x1b4fd5 || _0x482329 && !_0x482329.has(_0x1b4fd5)) {
      return null;
    }
    return normalizeObjectTrack(_0x485afe, _0x1b4fd5, objectTransforms[_0x1b4fd5]);
  }).filter(Boolean);
  const _0x4d8127 = Math.max(0, ..._0x370e22.map(_0x1a7ac2 => _0x1a7ac2.time), ..._0x1ed8ca.flatMap(_0x51930b => STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.flatMap(_0x1e6ac5 => _0x51930b[_0x1e6ac5 + "Keyframes"].map(_0xfab631 => _0xfab631.time))));
  return {
    duration: clamp(Math.max(MIN_DURATION_SECONDS, finiteNumber(_0x36cc44?.duration, DEFAULT_DURATION_SECONDS), _0x4d8127), MIN_DURATION_SECONDS, MAX_DURATION_SECONDS),
    fps: clamp(Math.round(finiteNumber(_0x36cc44?.fps, DEFAULT_FPS)), MIN_FPS, MAX_FPS),
    loop: _0x36cc44?.loop === true,
    cameraKeyframes: _0x370e22,
    objectTracks: _0x1ed8ca
  };
}
function upsertAtTime(_0x391cb1, _0x221527, _0x1e95f3) {
  const _0x594437 = 0.5 / Math.max(MIN_FPS, _0x1e95f3);
  const _0x141429 = _0x391cb1.find(_0x6aac0c => Math.abs(_0x6aac0c.time - _0x221527.time) <= _0x594437);
  const _0x57100a = _0x391cb1.filter(_0x4591d5 => _0x4591d5.id !== _0x141429?.id && _0x4591d5.id !== _0x221527.id);
  _0x57100a.push({
    ..._0x221527,
    id: _0x141429?.id || _0x221527.id
  });
  return _0x57100a.sort((_0x2f69ba, _0x4a4c69) => _0x2f69ba.time - _0x4a4c69.time || _0x2f69ba.id.localeCompare(_0x4a4c69.id));
}
export function upsertStoryboard3DCameraKeyframe(_0x44411f, {
  time = 0,
  camera: _0x41dcb6,
  easing = "ease-in-out"
} = {}, {
  idFactory: _0x4e345f
} = {}) {
  const _0x2b72a1 = normalizeStoryboard3DShotAnimation(_0x44411f, {
    camera: _0x41dcb6,
    idFactory: _0x4e345f
  });
  const _0x46db72 = normalizeCameraKeyframe({
    id: createKeyframeId("camera-keyframe", _0x4e345f),
    time: time,
    camera: _0x41dcb6,
    easing: easing
  }, _0x2b72a1.cameraKeyframes.length, _0x41dcb6);
  _0x2b72a1.cameraKeyframes = upsertAtTime(_0x2b72a1.cameraKeyframes, _0x46db72, _0x2b72a1.fps);
  _0x2b72a1.duration = Math.max(_0x2b72a1.duration, _0x46db72.time);
  return _0x2b72a1;
}
export function upsertStoryboard3DObjectKeyframe(_0x1b799c, {
  objectId: _0x45add4,
  property: _0x312b0b,
  time = 0,
  transform: _0x1a5f2e,
  value: _0x6aa71b,
  easing = "ease-in-out"
} = {}, {
  idFactory: _0x55a811
} = {}) {
  const _0x4401db = String(_0x45add4 || "").trim();
  if (!_0x4401db) {
    throw new Error("An object id is required for an object keyframe");
  }
  if (!STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.includes(_0x312b0b)) {
    throw new Error("Unsupported object animation property: " + _0x312b0b);
  }
  const _0x2c7a1b = normalizeStoryboard3DShotAnimation(_0x1b799c, {
    idFactory: _0x55a811
  });
  let _0x25f507 = _0x2c7a1b.objectTracks.find(_0x3d1df => _0x3d1df.objectId === _0x4401db);
  if (!_0x25f507) {
    _0x25f507 = normalizeObjectTrack({}, _0x4401db, _0x1a5f2e);
    _0x2c7a1b.objectTracks.push(_0x25f507);
  }
  const _0x2e4130 = _0x312b0b + "Keyframes";
  const _0x2adf5d = normalizePropertyKeyframe({
    id: createKeyframeId(_0x312b0b + "-keyframe", _0x55a811),
    time: time,
    value: _0x6aa71b || _0x1a5f2e?.[_0x312b0b],
    easing: easing
  }, _0x25f507[_0x2e4130].length, _0x312b0b, _0x1a5f2e);
  _0x25f507[_0x2e4130] = upsertAtTime(_0x25f507[_0x2e4130], _0x2adf5d, _0x2c7a1b.fps);
  _0x2c7a1b.duration = Math.max(_0x2c7a1b.duration, _0x2adf5d.time);
  return _0x2c7a1b;
}
export function removeStoryboard3DAnimationKeyframe(_0xa7058d, {
  type: _0x9f663b,
  objectId: _0x1d55a4,
  property: _0x2e5804,
  keyframeId: _0x201140
} = {}) {
  const _0x1de24d = normalizeStoryboard3DShotAnimation(_0xa7058d);
  const _0xda02b1 = String(_0x201140 || "").trim();
  if (!_0xda02b1) {
    return _0x1de24d;
  }
  if (_0x9f663b === "camera") {
    if (_0x1de24d.cameraKeyframes.length <= 1) {
      return _0x1de24d;
    }
    _0x1de24d.cameraKeyframes = _0x1de24d.cameraKeyframes.filter(_0x24254a => _0x24254a.id !== _0xda02b1);
    return _0x1de24d;
  }
  const _0x38f288 = _0x1de24d.objectTracks.find(_0x5b155a => _0x5b155a.objectId === String(_0x1d55a4 || ""));
  if (!_0x38f288 || !STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.includes(_0x2e5804)) {
    return _0x1de24d;
  }
  const _0x3e925a = _0x2e5804 + "Keyframes";
  _0x38f288[_0x3e925a] = _0x38f288[_0x3e925a].filter(_0x5317a9 => _0x5317a9.id !== _0xda02b1);
  return _0x1de24d;
}
export function updateStoryboard3DShotAnimationSettings(_0x1a3afb, _0x24a37b = {}) {
  return normalizeStoryboard3DShotAnimation({
    ..._0x1a3afb,
    ..._0x24a37b,
    cameraKeyframes: _0x1a3afb?.cameraKeyframes,
    objectTracks: _0x1a3afb?.objectTracks
  });
}
export function applyStoryboard3DAnimationEasing(_0x193d09, _0xd0f995 = "linear") {
  const _0x273583 = clamp(finiteNumber(_0x193d09), 0, 1);
  switch (normalizeEasing(_0xd0f995)) {
    case "ease-in":
      return _0x273583 * _0x273583;
    case "ease-out":
      return 1 - (1 - _0x273583) * (1 - _0x273583);
    case "ease-in-out":
      if (_0x273583 < 0.5) {
        return _0x273583 * 2 * _0x273583;
      } else {
        return 1 - Math.pow(_0x273583 * -2 + 2, 2) / 2;
      }
    default:
      return _0x273583;
  }
}
function interpolateNumber(_0x1ea340, _0x20ace0, _0x23bd9d) {
  return _0x1ea340 + (_0x20ace0 - _0x1ea340) * _0x23bd9d;
}
function interpolateAngle(_0x57ad37, _0xb7df15, _0xca1e66) {
  const _0x5f328c = ((_0xb7df15 - _0x57ad37 + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return _0x57ad37 + _0x5f328c * _0xca1e66;
}
function interpolateVector(_0x554b3b, _0x48ef42, _0x9f8e77, {
  angles = false
} = {}) {
  return _0x554b3b.map((_0x366991, _0x57f155) => angles ? interpolateAngle(_0x366991, _0x48ef42[_0x57f155], _0x9f8e77) : interpolateNumber(_0x366991, _0x48ef42[_0x57f155], _0x9f8e77));
}
function sampleKeyframes(_0x430a52, _0x55e94e, _0x4a2022) {
  if (!Array.isArray(_0x430a52) || _0x430a52.length === 0) {
    return null;
  }
  if (_0x430a52.length === 1 || _0x55e94e <= _0x430a52[0].time) {
    return {
      ..._0x430a52[0],
      progress: 0
    };
  }
  const _0x1d1922 = _0x430a52.at(-1);
  if (_0x55e94e >= _0x1d1922.time) {
    return {
      ..._0x1d1922,
      progress: 0
    };
  }
  let _0x280c18 = _0x430a52[0];
  let _0x4a58e5 = _0x430a52[1];
  for (let _0x53fcee = 1; _0x53fcee < _0x430a52.length; _0x53fcee += 1) {
    _0x4a58e5 = _0x430a52[_0x53fcee];
    if (_0x55e94e <= _0x4a58e5.time) {
      break;
    }
    _0x280c18 = _0x4a58e5;
  }
  const _0x3dcb85 = Math.max(1e-8, _0x4a58e5.time - _0x280c18.time);
  const _0x269826 = applyStoryboard3DAnimationEasing((_0x55e94e - _0x280c18.time) / _0x3dcb85, _0x280c18.easing);
  return {
    ..._0x280c18,
    value: _0x4a2022(_0x280c18, _0x4a58e5, _0x269826),
    fromKeyframeId: _0x280c18.id,
    toKeyframeId: _0x4a58e5.id,
    progress: _0x269826
  };
}
function sampleCameraKeyframes(_0x4b7af9, _0x1eface) {
  const _0x59c291 = sampleKeyframes(_0x4b7af9, _0x1eface, (_0x5f139d, _0x9b2eba, _0x3fa8e7) => ({
    position: interpolateVector(_0x5f139d.camera.position, _0x9b2eba.camera.position, _0x3fa8e7),
    target: interpolateVector(_0x5f139d.camera.target, _0x9b2eba.camera.target, _0x3fa8e7),
    focalLength: interpolateNumber(_0x5f139d.camera.focalLength, _0x9b2eba.camera.focalLength, _0x3fa8e7),
    near: interpolateNumber(_0x5f139d.camera.near, _0x9b2eba.camera.near, _0x3fa8e7),
    far: interpolateNumber(_0x5f139d.camera.far, _0x9b2eba.camera.far, _0x3fa8e7),
    aspectRatio: _0x3fa8e7 < 0.5 ? _0x5f139d.camera.aspectRatio : _0x9b2eba.camera.aspectRatio
  }));
  if (!_0x59c291) {
    return null;
  }
  return _0x59c291.value || _0x59c291.camera;
}
export function sampleStoryboard3DShotAnimation(_0x3c29aa, _0x1e23e8, {
  camera: _0x3ea61a,
  objectTransforms = {}
} = {}) {
  const _0x1c64a6 = normalizeStoryboard3DShotAnimation(_0x3c29aa, {
    camera: _0x3ea61a,
    objectTransforms: objectTransforms
  });
  let _0x4ef95d = finiteNumber(_0x1e23e8);
  if (_0x1c64a6.loop && _0x1c64a6.duration > 0) {
    _0x4ef95d = (_0x4ef95d % _0x1c64a6.duration + _0x1c64a6.duration) % _0x1c64a6.duration;
  } else {
    _0x4ef95d = clamp(_0x4ef95d, 0, _0x1c64a6.duration);
  }
  const _0x1b5ada = {};
  _0x1c64a6.objectTracks.forEach(_0x2bbfdd => {
    const _0x2a7ebe = normalizeTransform(objectTransforms[_0x2bbfdd.objectId]);
    const _0x5d766e = {
      ..._0x2a7ebe
    };
    let _0x1032c5 = false;
    STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.forEach(_0x3bf1c7 => {
      const _0x25ecee = _0x2bbfdd[_0x3bf1c7 + "Keyframes"];
      const _0x48997a = sampleKeyframes(_0x25ecee, _0x4ef95d, (_0xfc98ea, _0x270c7e, _0x6b481d) => interpolateVector(_0xfc98ea.value, _0x270c7e.value, _0x6b481d, {
        angles: _0x3bf1c7 === "rotation"
      }));
      if (_0x48997a) {
        _0x5d766e[_0x3bf1c7] = _0x48997a.value;
        _0x1032c5 = true;
      }
    });
    if (_0x1032c5) {
      _0x1b5ada[_0x2bbfdd.objectId] = _0x5d766e;
    }
  });
  return {
    time: _0x4ef95d,
    camera: sampleCameraKeyframes(_0x1c64a6.cameraKeyframes, _0x4ef95d),
    objectTransforms: _0x1b5ada
  };
}
export function getStoryboard3DObjectAnimationTrack(_0xc083b0, _0x242449) {
  return normalizeStoryboard3DShotAnimation(_0xc083b0).objectTracks.find(_0x220296 => _0x220296.objectId === String(_0x242449 || "")) || null;
}