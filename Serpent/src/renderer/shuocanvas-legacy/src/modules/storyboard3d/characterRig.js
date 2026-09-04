import { PANORAMA_CHARACTER_BONES, findMannequinPosePreset, normalizeBonePose } from "../panoramaSceneNode/poseCatalog.js";
function bodyPreset(_0x591301, _0x1e3af5, {
  gender = "male",
  ageGroup = "adult",
  height = 1.72,
  shoulderScale = 1,
  hipScale = 1,
  headScale = 1,
  depthScale = 1,
  posture = {},
  tags = []
} = {}) {
  return Object.freeze({
    id: _0x591301,
    name: _0x1e3af5,
    gender: gender,
    ageGroup: ageGroup,
    height: height,
    shoulderScale: shoulderScale,
    hipScale: hipScale,
    headScale: headScale,
    depthScale: depthScale,
    posture: Object.freeze(structuredClone(posture)),
    tags: Object.freeze([...tags])
  });
}
const SENIOR_POSTURE = Object.freeze({
  spine_01: Object.freeze({
    x: 0.1,
    y: 0,
    z: 0
  }),
  spine_02: Object.freeze({
    x: 0.07,
    y: 0,
    z: 0
  }),
  neck_01: Object.freeze({
    x: -0.06,
    y: 0,
    z: 0
  })
});
export const STORYBOARD_3D_BODY_PRESETS = Object.freeze([bodyPreset("adult-male", "成年男性", {
  gender: "male",
  height: 1.78,
  shoulderScale: 1.05,
  hipScale: 0.96,
  tags: ["成人", "大人", "男性", "男人"]
}), bodyPreset("adult-female", "成年女性", {
  gender: "female",
  height: 1.68,
  shoulderScale: 0.94,
  hipScale: 1.04,
  tags: ["成人", "大人", "女性", "女人"]
}), bodyPreset("slim-adult", "纤细成人", {
  gender: "male",
  height: 1.74,
  shoulderScale: 0.8,
  hipScale: 0.78,
  headScale: 1.03,
  depthScale: 0.78,
  tags: ["成人", "大人", "纤细", "瘦", "瘦人"]
}), bodyPreset("heavy-adult", "壮硕成人", {
  gender: "male",
  height: 1.72,
  shoulderScale: 1.24,
  hipScale: 1.28,
  headScale: 0.97,
  depthScale: 1.3,
  tags: ["成人", "大人", "壮硕", "胖", "胖人"]
}), bodyPreset("senior-male", "老年男性", {
  gender: "male",
  ageGroup: "senior",
  height: 1.7,
  shoulderScale: 0.98,
  hipScale: 0.98,
  headScale: 1.04,
  posture: SENIOR_POSTURE,
  tags: ["老人", "老年人", "爷爷", "男性"]
}), bodyPreset("senior-female", "老年女性", {
  gender: "female",
  ageGroup: "senior",
  height: 1.58,
  shoulderScale: 0.91,
  hipScale: 1.03,
  headScale: 1.05,
  posture: SENIOR_POSTURE,
  tags: ["老人", "老年人", "奶奶", "女性"]
}), bodyPreset("youth-male", "青年男性", {
  gender: "male",
  ageGroup: "youth",
  height: 1.7,
  shoulderScale: 1,
  hipScale: 0.97,
  headScale: 1.03,
  tags: ["青年", "年轻人", "男青年"]
}), bodyPreset("youth-female", "青年女性", {
  gender: "female",
  ageGroup: "youth",
  height: 1.62,
  shoulderScale: 0.93,
  hipScale: 1.02,
  headScale: 1.04,
  tags: ["青年", "年轻人", "女青年"]
}), bodyPreset("child-male", "男孩", {
  gender: "male",
  ageGroup: "child",
  height: 1.28,
  shoulderScale: 0.84,
  hipScale: 0.9,
  headScale: 1.18,
  depthScale: 0.94,
  tags: ["儿童", "小孩", "孩子", "男孩"]
}), bodyPreset("child-female", "女孩", {
  gender: "female",
  ageGroup: "child",
  height: 1.24,
  shoulderScale: 0.82,
  hipScale: 0.91,
  headScale: 1.19,
  depthScale: 0.94,
  tags: ["儿童", "小孩", "孩子", "女孩"]
}), bodyPreset("toddler", "幼儿", {
  gender: "male",
  ageGroup: "toddler",
  height: 0.92,
  shoulderScale: 0.78,
  hipScale: 0.88,
  headScale: 1.34,
  depthScale: 0.98,
  tags: ["幼儿", "幼童", "小孩", "孩子"]
}), bodyPreset("child", "儿童（通用）", {
  gender: "male",
  ageGroup: "child",
  height: 1.25,
  shoulderScale: 0.82,
  hipScale: 0.9,
  headScale: 1.18,
  depthScale: 0.94,
  tags: ["儿童", "小孩", "孩子", "兼容"]
})]);
export const STORYBOARD_3D_ACTIONS = Object.freeze([Object.freeze({
  id: "standing",
  name: "站立",
  poseId: "neutral",
  loop: false,
  duration: 1
}), Object.freeze({
  id: "standing-relaxed",
  name: "放松站立",
  poseId: "idle-relaxed",
  loop: true,
  duration: 2.4
}), Object.freeze({
  id: "seated",
  name: "坐姿",
  poseId: "sit",
  loop: false,
  duration: 1
}), Object.freeze({
  id: "walking-left",
  name: "行走（左脚）",
  poseId: "walk-left",
  loop: true,
  duration: 0.9
}), Object.freeze({
  id: "walking-right",
  name: "行走（右脚）",
  poseId: "walk-right",
  loop: true,
  duration: 0.9
}), Object.freeze({
  id: "running-left",
  name: "跑步（左脚）",
  poseId: "run-left",
  loop: true,
  duration: 0.62
}), Object.freeze({
  id: "running-right",
  name: "跑步（右脚）",
  poseId: "run-right",
  loop: true,
  duration: 0.62
}), Object.freeze({
  id: "dialogue",
  name: "对话",
  poseId: "point-right",
  loop: true,
  duration: 2.2
}), Object.freeze({
  id: "jump",
  name: "跳跃",
  poseId: "dance-jump",
  loop: false,
  duration: 1.1
})]);
export const STORYBOARD_3D_HAND_POSES = Object.freeze([Object.freeze({
  id: "relaxed",
  name: "自然",
  rotation: {
    x: 0,
    y: 0,
    z: 0
  }
}), Object.freeze({
  id: "open",
  name: "张开",
  rotation: {
    x: 0.08,
    y: 0,
    z: 0
  }
}), Object.freeze({
  id: "fist",
  name: "握拳",
  rotation: {
    x: -0.18,
    y: 0,
    z: 0
  }
}), Object.freeze({
  id: "point",
  name: "指向",
  rotation: {
    x: -0.05,
    y: 0.08,
    z: 0
  }
}), Object.freeze({
  id: "grip",
  name: "抓握",
  rotation: {
    x: -0.22,
    y: 0.04,
    z: 0
  },
  fingerCurl: 1,
  thumbCurl: 0.75
})]);
const BODY_BY_ID = new Map(STORYBOARD_3D_BODY_PRESETS.map(_0x4202b6 => [_0x4202b6.id, _0x4202b6]));
const ACTION_BY_ID = new Map(STORYBOARD_3D_ACTIONS.map(_0x1df10e => [_0x1df10e.id, _0x1df10e]));
const HAND_BY_ID = new Map(STORYBOARD_3D_HAND_POSES.map(_0x2eb7e4 => [_0x2eb7e4.id, _0x2eb7e4]));
const BONE_SET = new Set(PANORAMA_CHARACTER_BONES);
const PI = Math.PI;
const DEFAULT_LIMIT = Object.freeze({
  x: [-PI, PI],
  y: [-PI, PI],
  z: [-PI, PI]
});
export const STORYBOARD_3D_BONE_LIMITS = Object.freeze({
  neck_01: Object.freeze({
    x: [-0.8, 0.8],
    y: [-1.1, 1.1],
    z: [-0.65, 0.65]
  }),
  Head: Object.freeze({
    x: [-0.7, 0.7],
    y: [-1.15, 1.15],
    z: [-0.65, 0.65]
  }),
  lowerarm_l: Object.freeze({
    x: [-2.45, 0.3],
    y: [-0.65, 0.65],
    z: [-2.4, 0.25]
  }),
  lowerarm_r: Object.freeze({
    x: [-2.45, 0.3],
    y: [-0.65, 0.65],
    z: [-0.25, 2.4]
  }),
  calf_l: Object.freeze({
    x: [0, 2.65],
    y: [-0.25, 0.25],
    z: [-0.25, 0.25]
  }),
  calf_r: Object.freeze({
    x: [0, 2.65],
    y: [-0.25, 0.25],
    z: [-0.25, 0.25]
  })
});
function clamp(_0x2557e1, _0x3a964f, _0x3e8ad2) {
  return Math.max(_0x3a964f, Math.min(_0x3e8ad2, Number(_0x2557e1) || 0));
}
function mergeBonePoses(..._0xc279df) {
  const _0x1647f4 = {};
  _0xc279df.forEach(_0x20e628 => {
    Object.entries(normalizeBonePose(_0x20e628)).forEach(([_0x57fb91, _0x2b061e]) => {
      const _0x480d6f = _0x1647f4[_0x57fb91] || {
        x: 0,
        y: 0,
        z: 0
      };
      _0x1647f4[_0x57fb91] = {
        x: _0x480d6f.x + _0x2b061e.x,
        y: _0x480d6f.y + _0x2b061e.y,
        z: _0x480d6f.z + _0x2b061e.z
      };
    });
  });
  return normalizeBonePose(_0x1647f4);
}
export function clampStoryboard3DBoneEuler(_0xae2ea5, _0x3e687b = {}) {
  if (!BONE_SET.has(String(_0xae2ea5 || ""))) {
    return null;
  }
  const _0x487b0a = STORYBOARD_3D_BONE_LIMITS[_0xae2ea5] || DEFAULT_LIMIT;
  return {
    x: clamp(_0x3e687b.x, _0x487b0a.x[0], _0x487b0a.x[1]),
    y: clamp(_0x3e687b.y, _0x487b0a.y[0], _0x487b0a.y[1]),
    z: clamp(_0x3e687b.z, _0x487b0a.z[0], _0x487b0a.z[1])
  };
}
export function eulerToStoryboard3DQuaternion(_0x55eaec = {}) {
  const _0x29ae35 = Number(_0x55eaec.x) || 0;
  const _0x2d02e6 = Number(_0x55eaec.y) || 0;
  const _0x2b33f1 = Number(_0x55eaec.z) || 0;
  const _0xdeb053 = Math.cos(_0x29ae35 / 2);
  const _0x5632ff = Math.cos(_0x2d02e6 / 2);
  const _0x32cf9f = Math.cos(_0x2b33f1 / 2);
  const _0x306f91 = Math.sin(_0x29ae35 / 2);
  const _0x112a48 = Math.sin(_0x2d02e6 / 2);
  const _0x5018fe = Math.sin(_0x2b33f1 / 2);
  return [_0x306f91 * _0x5632ff * _0x32cf9f + _0xdeb053 * _0x112a48 * _0x5018fe, _0xdeb053 * _0x112a48 * _0x32cf9f - _0x306f91 * _0x5632ff * _0x5018fe, _0xdeb053 * _0x5632ff * _0x5018fe + _0x306f91 * _0x112a48 * _0x32cf9f, _0xdeb053 * _0x5632ff * _0x32cf9f - _0x306f91 * _0x112a48 * _0x5018fe];
}
export function normalizeStoryboard3DBoneOverrides(_0x4c00d7 = {}) {
  const _0x181bf7 = {};
  for (const [_0x59c45a, _0x3bc55c] of Object.entries(_0x4c00d7 || {})) {
    if (!BONE_SET.has(_0x59c45a) || !Array.isArray(_0x3bc55c) || _0x3bc55c.length !== 4) {
      continue;
    }
    const _0x150d49 = _0x3bc55c.map(Number);
    if (!_0x150d49.every(Number.isFinite)) {
      continue;
    }
    const _0x42d238 = Math.hypot(..._0x150d49);
    if (_0x42d238 <= 1e-8) {
      continue;
    }
    _0x181bf7[_0x59c45a] = _0x150d49.map(_0x16b57e => _0x16b57e / _0x42d238);
  }
  return _0x181bf7;
}
export function setStoryboard3DBoneOverride(_0x3bdb76, _0x412f2d, _0x524dd7) {
  const _0x18ce7a = clampStoryboard3DBoneEuler(_0x412f2d, _0x524dd7);
  if (!_0x18ce7a) {
    throw new Error("Unknown character bone: " + _0x412f2d);
  }
  return {
    ...normalizeStoryboard3DBoneOverrides(_0x3bdb76),
    [_0x412f2d]: eulerToStoryboard3DQuaternion(_0x18ce7a)
  };
}
export function normalizeStoryboard3DCharacterState(_0x4427ab = {}) {
  const _0x558a12 = BODY_BY_ID.has(_0x4427ab.bodyPresetId) ? _0x4427ab.bodyPresetId : STORYBOARD_3D_BODY_PRESETS[0].id;
  const _0x4cf9ff = ACTION_BY_ID.has(_0x4427ab.actionId) ? _0x4427ab.actionId : STORYBOARD_3D_ACTIONS[0].id;
  const _0x4de490 = HAND_BY_ID.has(_0x4427ab.leftHandPoseId) ? _0x4427ab.leftHandPoseId : "relaxed";
  const _0x8623eb = HAND_BY_ID.has(_0x4427ab.rightHandPoseId) ? _0x4427ab.rightHandPoseId : "relaxed";
  return {
    bodyPresetId: _0x558a12,
    actionId: _0x4cf9ff,
    actionTime: Math.max(0, Number(_0x4427ab.actionTime) || 0),
    actionPlaying: _0x4427ab.actionPlaying === true,
    leftHandPoseId: _0x4de490,
    rightHandPoseId: _0x8623eb,
    boneOverrides: normalizeStoryboard3DBoneOverrides(_0x4427ab.boneOverrides)
  };
}
export function resolveStoryboard3DCharacterPose(_0x266e1c = {}) {
  const _0x2654a0 = normalizeStoryboard3DCharacterState(_0x266e1c);
  const _0x488535 = BODY_BY_ID.get(_0x2654a0.bodyPresetId);
  const _0x90151b = ACTION_BY_ID.get(_0x2654a0.actionId);
  let _0x3c6fad = _0x90151b.poseId;
  if (/^(walking|running)-(left|right)$/.test(_0x90151b.id)) {
    const _0x363ea9 = _0x90151b.id.startsWith("running") ? "run" : "walk";
    const _0x20a056 = Math.max(0.001, Number(_0x90151b.duration) || 1);
    _0x3c6fad = _0x363ea9 + "-" + (Math.floor(_0x2654a0.actionTime % _0x20a056 / (_0x20a056 / 2)) % 2 === 0 ? "left" : "right");
  }
  const _0x229d86 = findMannequinPosePreset(_0x3c6fad);
  const _0x24e6eb = HAND_BY_ID.get(_0x2654a0.leftHandPoseId);
  const _0x32d23d = HAND_BY_ID.get(_0x2654a0.rightHandPoseId);
  const _0x549fc = {
    state: _0x2654a0,
    body: structuredClone(_0x488535),
    action: structuredClone(_0x90151b),
    baseBones: mergeBonePoses(_0x488535?.posture, _0x229d86?.bones),
    handRotations: {
      hand_l: {
        ..._0x24e6eb.rotation
      },
      hand_r: {
        ..._0x32d23d.rotation
      }
    },
    handPoses: {
      left: structuredClone(_0x24e6eb),
      right: structuredClone(_0x32d23d)
    },
    boneOverrides: structuredClone(_0x2654a0.boneOverrides)
  };
  _0x549fc.resolvedBoneQuaternions = composeStoryboard3DCharacterBoneQuaternions(_0x549fc);
  return _0x549fc;
}
export function composeStoryboard3DCharacterBoneQuaternions(_0xcda6c5 = {}) {
  const _0x275fe2 = _0xcda6c5?.baseBones && _0xcda6c5?.handRotations && _0xcda6c5?.boneOverrides ? _0xcda6c5 : {
    ...resolveStoryboard3DCharacterPoseParts(_0xcda6c5)
  };
  const _0x3e2632 = {
    ...normalizeBonePose(_0x275fe2.baseBones),
    ...normalizeBonePose(_0x275fe2.handRotations)
  };
  const _0x53114d = {};
  for (const [_0x2223a3, _0x39b039] of Object.entries(_0x3e2632)) {
    _0x53114d[_0x2223a3] = eulerToStoryboard3DQuaternion(_0x39b039);
  }
  return {
    ..._0x53114d,
    ...normalizeStoryboard3DBoneOverrides(_0x275fe2.boneOverrides)
  };
}
export function applyStoryboard3DCharacterPoseToModel(_0x425c73, _0x46bb82 = {}, {
  baseBoneQuaternions = {}
} = {}) {
  const _0x83b2e0 = composeStoryboard3DCharacterBoneQuaternions(_0x46bb82);
  for (const _0x126e74 of PANORAMA_CHARACTER_BONES) {
    const _0xde0e9a = _0x425c73?.getObjectByName?.(_0x126e74);
    if (!_0xde0e9a?.quaternion) {
      continue;
    }
    const _0x592359 = baseBoneQuaternions[_0x126e74];
    if (_0x592359 && typeof _0xde0e9a.quaternion.set === "function") {
      _0xde0e9a.quaternion.set(_0x592359.x, _0x592359.y, _0x592359.z, _0x592359.w);
    }
    const _0x236ebb = _0x83b2e0[_0x126e74];
    if (!_0x236ebb) {
      continue;
    }
    if (typeof _0xde0e9a.quaternion.multiply === "function") {
      _0xde0e9a.quaternion.multiply({
        x: _0x236ebb[0],
        y: _0x236ebb[1],
        z: _0x236ebb[2],
        w: _0x236ebb[3]
      });
    } else if (typeof _0xde0e9a.quaternion.set === "function") {
      _0xde0e9a.quaternion.set(_0x236ebb[0], _0x236ebb[1], _0x236ebb[2], _0x236ebb[3]);
    }
  }
  _0x425c73?.updateMatrixWorld?.(true);
  return _0x425c73;
}
export function setStoryboard3DCharacterActionPlayback(_0x37cfaf, _0x464b58) {
  const _0x160c8a = normalizeStoryboard3DCharacterState(_0x37cfaf);
  return {
    ..._0x160c8a,
    actionPlaying: _0x464b58 === true
  };
}
export function seekStoryboard3DCharacterAction(_0x3b6429, _0x409787) {
  const _0x4f7d0e = normalizeStoryboard3DCharacterState(_0x3b6429);
  const _0x4d59f3 = ACTION_BY_ID.get(_0x4f7d0e.actionId);
  const _0x22bb8c = Math.max(0.001, Number(_0x4d59f3.duration) || 1);
  const _0x266424 = Math.max(0, Number(_0x409787) || 0);
  return {
    ..._0x4f7d0e,
    actionTime: _0x4d59f3.loop ? _0x266424 % _0x22bb8c : Math.min(_0x266424, _0x22bb8c)
  };
}
export function advanceStoryboard3DCharacterAction(_0x333ecf, _0x1d64e4) {
  const _0x5b6b97 = normalizeStoryboard3DCharacterState(_0x333ecf);
  if (!_0x5b6b97.actionPlaying) {
    return _0x5b6b97;
  }
  const _0x47507e = ACTION_BY_ID.get(_0x5b6b97.actionId);
  const _0x4d6f4b = Math.max(0.001, Number(_0x47507e.duration) || 1);
  const _0x22032c = _0x5b6b97.actionTime + Math.max(0, Number(_0x1d64e4) || 0);
  if (_0x47507e.loop) {
    return {
      ..._0x5b6b97,
      actionTime: _0x22032c % _0x4d6f4b
    };
  }
  if (_0x22032c >= _0x4d6f4b) {
    return {
      ..._0x5b6b97,
      actionTime: _0x4d6f4b,
      actionPlaying: false
    };
  }
  return {
    ..._0x5b6b97,
    actionTime: _0x22032c
  };
}
export function quaternionToStoryboard3DEuler(_0x5ecfc2 = []) {
  const _0x1aa195 = Array.isArray(_0x5ecfc2) ? _0x5ecfc2.map(Number) : [];
  const _0xe02f85 = _0x1aa195.length === 4 && _0x1aa195.every(Number.isFinite) ? Math.hypot(..._0x1aa195) : 0;
  const _0x22e917 = _0xe02f85 > 1e-8 ? _0x1aa195.map(_0x19c999 => _0x19c999 / _0xe02f85) : [0, 0, 0, 1];
  const [_0x54219d, _0x1ae40d, _0x19be7e, _0x4bc74b] = _0x22e917;
  const _0x43097b = 1 - (_0x1ae40d * _0x1ae40d + _0x19be7e * _0x19be7e) * 2;
  const _0x833945 = (_0x54219d * _0x1ae40d - _0x19be7e * _0x4bc74b) * 2;
  const _0x1cc694 = (_0x54219d * _0x19be7e + _0x1ae40d * _0x4bc74b) * 2;
  const _0x5c8c91 = 1 - (_0x54219d * _0x54219d + _0x19be7e * _0x19be7e) * 2;
  const _0x2c585c = (_0x1ae40d * _0x19be7e - _0x54219d * _0x4bc74b) * 2;
  const _0x44c83a = (_0x1ae40d * _0x19be7e + _0x54219d * _0x4bc74b) * 2;
  const _0x58ea78 = 1 - (_0x54219d * _0x54219d + _0x1ae40d * _0x1ae40d) * 2;
  const _0x21f6b5 = {
    x: 0,
    y: Math.asin(clamp(_0x1cc694, -1, 1)),
    z: 0
  };
  if (Math.abs(_0x1cc694) < 0.9999999) {
    _0x21f6b5.x = Math.atan2(-_0x2c585c, _0x58ea78);
    _0x21f6b5.z = Math.atan2(-_0x833945, _0x43097b);
  } else {
    _0x21f6b5.x = Math.atan2(_0x44c83a, _0x5c8c91);
  }
  return _0x21f6b5;
}
export function createStoryboard3DBoneEditState(_0x4dff13 = {}, {
  selectedBoneName = "pelvis",
  showControls = true
} = {}) {
  const _0x4d194a = normalizeStoryboard3DCharacterState(_0x4dff13);
  const _0x4968b7 = {};
  for (const [_0x1bddaf, _0x1554d3] of Object.entries(_0x4d194a.boneOverrides)) {
    _0x4968b7[_0x1bddaf] = quaternionToStoryboard3DEuler(_0x1554d3);
  }
  return {
    selectedBoneName: BONE_SET.has(selectedBoneName) ? selectedBoneName : "pelvis",
    showControls: showControls !== false,
    localEulerByBone: _0x4968b7,
    boneOverrides: _0x4d194a.boneOverrides
  };
}
export function updateStoryboard3DBoneEditState(_0x497053, _0x3a42f4, _0x34a2d2) {
  const _0x4eeda7 = clampStoryboard3DBoneEuler(_0x3a42f4, _0x34a2d2);
  if (!_0x4eeda7) {
    throw new Error("Unknown character bone: " + _0x3a42f4);
  }
  return {
    ..._0x497053,
    selectedBoneName: _0x3a42f4,
    localEulerByBone: {
      ..._0x497053?.localEulerByBone,
      [_0x3a42f4]: _0x4eeda7
    },
    boneOverrides: setStoryboard3DBoneOverride(_0x497053?.boneOverrides, _0x3a42f4, _0x4eeda7)
  };
}
export function commitStoryboard3DBoneEditState(_0x4d820d, _0x37bc5f) {
  return normalizeStoryboard3DCharacterState({
    ..._0x4d820d,
    boneOverrides: _0x37bc5f?.boneOverrides
  });
}
function resolveStoryboard3DCharacterPoseParts(_0x6fac49 = {}) {
  const _0x115f48 = normalizeStoryboard3DCharacterState(_0x6fac49);
  const _0x367b0d = BODY_BY_ID.get(_0x115f48.bodyPresetId);
  const _0x40cc86 = ACTION_BY_ID.get(_0x115f48.actionId);
  const _0x1489aa = findMannequinPosePreset(_0x40cc86.poseId);
  return {
    baseBones: mergeBonePoses(_0x367b0d?.posture, _0x1489aa?.bones),
    handRotations: {
      hand_l: {
        ...HAND_BY_ID.get(_0x115f48.leftHandPoseId).rotation
      },
      hand_r: {
        ...HAND_BY_ID.get(_0x115f48.rightHandPoseId).rotation
      }
    },
    boneOverrides: _0x115f48.boneOverrides
  };
}