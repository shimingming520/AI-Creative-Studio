const DEFAULT_DURATION_SECONDS = 6;
const DEFAULT_FPS = 24;
const MIN_DURATION_SECONDS = 0.1;
const MAX_DURATION_SECONDS = 3600;
const MIN_FOV = 10;
const MAX_FOV = 120;
const EASING_VALUES = new Set(["linear", "ease-in", "ease-out", "ease-in-out"]);
function finiteNumber(_0x325b2f, _0x33842d = 0) {
  const _0x26fdea = Number(_0x325b2f);
  if (Number.isFinite(_0x26fdea)) {
    return _0x26fdea;
  } else {
    return _0x33842d;
  }
}
function clamp(_0x38cf5a, _0x681123, _0x55c5e4) {
  return Math.max(_0x681123, Math.min(_0x55c5e4, _0x38cf5a));
}
function normalizeVector3(_0x2e299b, _0x2189a8) {
  return {
    x: finiteNumber(_0x2e299b?.x, _0x2189a8.x),
    y: finiteNumber(_0x2e299b?.y, _0x2189a8.y),
    z: finiteNumber(_0x2e299b?.z, _0x2189a8.z)
  };
}
function normalizeEasing(_0x473cc0) {
  const _0x5b79dd = String(_0x473cc0 || "linear").trim().toLowerCase();
  if (EASING_VALUES.has(_0x5b79dd)) {
    return _0x5b79dd;
  } else {
    return "linear";
  }
}
function normalizeKeyframe(_0x123553, _0x2e9421 = 0) {
  const _0x375adf = normalizeVector3(_0x123553?.position, {
    x: 0,
    y: 1.6,
    z: 6
  });
  const _0x1dae29 = {
    x: _0x375adf.x,
    y: _0x375adf.y,
    z: _0x375adf.z - 4
  };
  return {
    id: String(_0x123553?.id || "camera-keyframe-" + (_0x2e9421 + 1)).trim() || "camera-keyframe-" + (_0x2e9421 + 1),
    time: Math.max(0, finiteNumber(_0x123553?.time, _0x2e9421)),
    position: _0x375adf,
    target: normalizeVector3(_0x123553?.target, _0x1dae29),
    fov: clamp(finiteNumber(_0x123553?.fov, 55), MIN_FOV, MAX_FOV),
    easing: normalizeEasing(_0x123553?.easing)
  };
}
function uniqueSortedKeyframes(_0x4c01ea = []) {
  const _0xb5700b = new Map();
  _0x4c01ea.forEach((_0x51cc32, _0x3c9576) => {
    const _0x38284b = normalizeKeyframe(_0x51cc32, _0x3c9576);
    _0xb5700b.set(_0x38284b.id, _0x38284b);
  });
  return [..._0xb5700b.values()].sort((_0x2e8ccd, _0x44d1a1) => {
    if (_0x2e8ccd.time !== _0x44d1a1.time) {
      return _0x2e8ccd.time - _0x44d1a1.time;
    }
    return _0x2e8ccd.id.localeCompare(_0x44d1a1.id);
  });
}
export function createDefaultCameraTimeline() {
  return {
    duration: DEFAULT_DURATION_SECONDS,
    fps: DEFAULT_FPS,
    loop: false,
    currentTime: 0,
    isPlaying: false,
    keyframes: []
  };
}
export function normalizeCameraTimeline(_0x3a5dde = {}) {
  const _0x22891e = createDefaultCameraTimeline();
  const _0xc08b4b = uniqueSortedKeyframes(Array.isArray(_0x3a5dde?.keyframes) ? _0x3a5dde.keyframes : []);
  const _0x1337a5 = _0xc08b4b.at(-1)?.time || 0;
  const _0x1055fb = clamp(Math.max(MIN_DURATION_SECONDS, finiteNumber(_0x3a5dde?.duration, _0x22891e.duration), _0x1337a5), MIN_DURATION_SECONDS, MAX_DURATION_SECONDS);
  return {
    duration: _0x1055fb,
    fps: clamp(Math.round(finiteNumber(_0x3a5dde?.fps, _0x22891e.fps)), 1, 120),
    loop: _0x3a5dde?.loop === true,
    currentTime: clamp(finiteNumber(_0x3a5dde?.currentTime, 0), 0, _0x1055fb),
    isPlaying: _0x3a5dde?.isPlaying === true,
    keyframes: _0xc08b4b.map(_0x361a2c => ({
      ..._0x361a2c,
      time: clamp(_0x361a2c.time, 0, _0x1055fb)
    }))
  };
}
export function upsertCameraKeyframe(_0x8e00d8, _0x318736) {
  const _0x166eef = normalizeCameraTimeline(_0x8e00d8);
  const _0x3e2a33 = normalizeKeyframe(_0x318736, _0x166eef.keyframes.length);
  const _0x5c380c = _0x166eef.keyframes.filter(_0x200c32 => _0x200c32.id !== _0x3e2a33.id);
  _0x5c380c.push(_0x3e2a33);
  return normalizeCameraTimeline({
    ..._0x166eef,
    duration: Math.max(_0x166eef.duration, _0x3e2a33.time),
    currentTime: _0x3e2a33.time,
    keyframes: _0x5c380c
  });
}
export function removeCameraKeyframe(_0x43c91f, _0x5386ae) {
  const _0x364d43 = normalizeCameraTimeline(_0x43c91f);
  const _0x34c1d2 = String(_0x5386ae || "").trim();
  return normalizeCameraTimeline({
    ..._0x364d43,
    keyframes: _0x364d43.keyframes.filter(_0x4ff2d7 => _0x4ff2d7.id !== _0x34c1d2)
  });
}
export function updateCameraTimelineSettings(_0x4050c8, _0x5e2d08 = {}) {
  const _0x5a1ec0 = normalizeCameraTimeline(_0x4050c8);
  return normalizeCameraTimeline({
    ..._0x5a1ec0,
    ..._0x5e2d08,
    keyframes: _0x5a1ec0.keyframes
  });
}
export function cameraTimelineFrameToTime(_0x565a65, _0x469bbe = DEFAULT_FPS) {
  const _0x315ca2 = clamp(Math.round(finiteNumber(_0x469bbe, DEFAULT_FPS)), 1, 120);
  return Math.max(0, finiteNumber(_0x565a65, 0)) / _0x315ca2;
}
export function cameraTimelineTimeToFrame(_0x466bd8, _0x3fc2b9 = DEFAULT_FPS) {
  const _0x324253 = clamp(Math.round(finiteNumber(_0x3fc2b9, DEFAULT_FPS)), 1, 120);
  return Math.max(0, Math.round(finiteNumber(_0x466bd8, 0) * _0x324253));
}
export function applyCameraTimelineEasing(_0x646e2d, _0x5a0dbc = "linear") {
  const _0x5a4e9f = clamp(finiteNumber(_0x646e2d, 0), 0, 1);
  switch (normalizeEasing(_0x5a0dbc)) {
    case "ease-in":
      return _0x5a4e9f * _0x5a4e9f;
    case "ease-out":
      return 1 - (1 - _0x5a4e9f) * (1 - _0x5a4e9f);
    case "ease-in-out":
      if (_0x5a4e9f < 0.5) {
        return _0x5a4e9f * 2 * _0x5a4e9f;
      } else {
        return 1 - Math.pow(_0x5a4e9f * -2 + 2, 2) / 2;
      }
    default:
      return _0x5a4e9f;
  }
}
function interpolateNumber(_0x33771c, _0x43ae83, _0x2f9a70) {
  return _0x33771c + (_0x43ae83 - _0x33771c) * _0x2f9a70;
}
function interpolateVector3(_0x58e392, _0x35ad44, _0x2de7bf) {
  return {
    x: interpolateNumber(_0x58e392.x, _0x35ad44.x, _0x2de7bf),
    y: interpolateNumber(_0x58e392.y, _0x35ad44.y, _0x2de7bf),
    z: interpolateNumber(_0x58e392.z, _0x35ad44.z, _0x2de7bf)
  };
}
function cloneSample(_0x9a34e8, _0x5ed8bf) {
  return {
    time: _0x5ed8bf,
    position: {
      ..._0x9a34e8.position
    },
    target: {
      ..._0x9a34e8.target
    },
    fov: _0x9a34e8.fov,
    fromKeyframeId: _0x9a34e8.id,
    toKeyframeId: _0x9a34e8.id,
    progress: 0
  };
}
export function sampleCameraTimeline(_0x551f9e, _0x12cab7) {
  const _0x3a5c15 = normalizeCameraTimeline(_0x551f9e);
  const _0x5c2c82 = _0x3a5c15.keyframes;
  if (_0x5c2c82.length === 0) {
    return null;
  }
  let _0x33c7b3 = finiteNumber(_0x12cab7, _0x3a5c15.currentTime);
  if (_0x3a5c15.loop && _0x3a5c15.duration > 0) {
    _0x33c7b3 = (_0x33c7b3 % _0x3a5c15.duration + _0x3a5c15.duration) % _0x3a5c15.duration;
  } else {
    _0x33c7b3 = clamp(_0x33c7b3, 0, _0x3a5c15.duration);
  }
  if (_0x5c2c82.length === 1 || _0x33c7b3 <= _0x5c2c82[0].time) {
    return cloneSample(_0x5c2c82[0], _0x33c7b3);
  }
  const _0x3662a7 = _0x5c2c82.at(-1);
  if (_0x33c7b3 >= _0x3662a7.time) {
    return cloneSample(_0x3662a7, _0x33c7b3);
  }
  let _0x2dffa7 = _0x5c2c82[0];
  let _0xdc1d8e = _0x5c2c82[1];
  for (let _0x3f3f8a = 1; _0x3f3f8a < _0x5c2c82.length; _0x3f3f8a += 1) {
    _0xdc1d8e = _0x5c2c82[_0x3f3f8a];
    if (_0x33c7b3 <= _0xdc1d8e.time) {
      break;
    }
    _0x2dffa7 = _0xdc1d8e;
  }
  const _0x2b2e04 = Math.max(1e-8, _0xdc1d8e.time - _0x2dffa7.time);
  const _0x3f121e = clamp((_0x33c7b3 - _0x2dffa7.time) / _0x2b2e04, 0, 1);
  const _0x34dbc1 = applyCameraTimelineEasing(_0x3f121e, _0x2dffa7.easing);
  return {
    time: _0x33c7b3,
    position: interpolateVector3(_0x2dffa7.position, _0xdc1d8e.position, _0x34dbc1),
    target: interpolateVector3(_0x2dffa7.target, _0xdc1d8e.target, _0x34dbc1),
    fov: interpolateNumber(_0x2dffa7.fov, _0xdc1d8e.fov, _0x34dbc1),
    fromKeyframeId: _0x2dffa7.id,
    toKeyframeId: _0xdc1d8e.id,
    progress: _0x34dbc1
  };
}
export const CAMERA_TIMELINE_EASINGS = Object.freeze([...EASING_VALUES]);