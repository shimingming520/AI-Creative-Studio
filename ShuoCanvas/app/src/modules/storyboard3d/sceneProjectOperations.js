import { cloneStoryboard3DProject, createDefaultStoryboard3DEnvironment } from "./projectModel.js";
import { normalizeStoryboard3DCameraState, replaceStoryboard3DShotCamera } from "./cameraShotSystem.js";
export const STORYBOARD_3D_ENVIRONMENT_PRESETS = Object.freeze({
  empty: Object.freeze({
    ...createDefaultStoryboard3DEnvironment("empty")
  }),
  outdoor: Object.freeze({
    ...createDefaultStoryboard3DEnvironment("outdoor"),
    groundSize: 200,
    backgroundColor: "#8fb5d9"
  }),
  indoor: Object.freeze({
    ...createDefaultStoryboard3DEnvironment("indoor"),
    groundSize: 50,
    backgroundColor: "#24262b"
  }),
  studio: Object.freeze({
    ...createDefaultStoryboard3DEnvironment("studio"),
    groundSize: 30,
    backgroundColor: "#15161a"
  })
});
function finite(_0x2698b6, _0x14bb5a = 0) {
  const _0x58e15a = Number(_0x2698b6);
  if (Number.isFinite(_0x58e15a)) {
    return _0x58e15a;
  } else {
    return _0x14bb5a;
  }
}
function clamp(_0x4abecd, _0x77476b, _0x20d972) {
  return Math.min(_0x20d972, Math.max(_0x77476b, _0x4abecd));
}
function normalizeName(_0x52c321) {
  return String(_0x52c321 || "").trim();
}
function resolveNow(_0x5757a8, _0x35b75a) {
  return Math.max(0, finite(_0x35b75a, finite(_0x5757a8?.updatedAt, 0)));
}
function collectProjectIds(_0x31de78) {
  const _0x4c5575 = new Set();
  if (_0x31de78?.id) {
    _0x4c5575.add(String(_0x31de78.id));
  }
  (Array.isArray(_0x31de78?.scenes) ? _0x31de78.scenes : []).forEach(_0x4d3193 => {
    if (_0x4d3193?.id) {
      _0x4c5575.add(String(_0x4d3193.id));
    }
    (Array.isArray(_0x4d3193?.objects) ? _0x4d3193.objects : []).forEach(_0x3b1584 => {
      if (_0x3b1584?.id) {
        _0x4c5575.add(String(_0x3b1584.id));
      }
    });
    (Array.isArray(_0x4d3193?.shots) ? _0x4d3193.shots : []).forEach(_0x43d017 => {
      if (_0x43d017?.id) {
        _0x4c5575.add(String(_0x43d017.id));
      }
    });
  });
  return _0x4c5575;
}
function createUniqueId({
  prefix: _0x199bf3,
  sourceId: _0x4b5a95,
  usedIds: _0x53dad3,
  idFactory: _0x1a3b4c
}) {
  if (typeof _0x1a3b4c === "function") {
    let _0x143c43 = 0;
    while (_0x143c43 < 1000) {
      const _0x4f01da = normalizeName(_0x1a3b4c(_0x199bf3));
      if (_0x4f01da && !_0x53dad3.has(_0x4f01da)) {
        _0x53dad3.add(_0x4f01da);
        return _0x4f01da;
      }
      _0x143c43 += 1;
    }
    throw new Error("Unable to create a unique " + _0x199bf3 + " id");
  }
  const _0x8d8f5d = (normalizeName(_0x4b5a95) || _0x199bf3) + "-copy";
  let _0x2ed349 = _0x8d8f5d;
  let _0x409bba = 2;
  while (_0x53dad3.has(_0x2ed349)) {
    _0x2ed349 = _0x8d8f5d + "-" + _0x409bba;
    _0x409bba += 1;
  }
  _0x53dad3.add(_0x2ed349);
  return _0x2ed349;
}
function cloneSceneWithNewIds(_0x43c0f7, {
  usedIds: _0x10db89,
  idFactory: _0x244ee8,
  name: _0x30b426,
  now: _0x1303dd
} = {}) {
  const _0x41eef6 = cloneStoryboard3DProject(_0x43c0f7);
  const _0x5a31cb = String(_0x41eef6.id || "scene");
  const _0x1f9f94 = createUniqueId({
    prefix: "scene",
    sourceId: _0x5a31cb,
    usedIds: _0x10db89,
    idFactory: _0x244ee8
  });
  const _0x3f924d = new Map();
  const _0x5ca248 = new Map();
  _0x41eef6.id = _0x1f9f94;
  _0x41eef6.name = normalizeName(_0x30b426) || (_0x41eef6.name || "Scene") + " Copy";
  _0x41eef6.objects = (Array.isArray(_0x41eef6.objects) ? _0x41eef6.objects : []).map(_0x2c4a4b => {
    const _0x216b2e = String(_0x2c4a4b.id || _0x2c4a4b.type || "object");
    const _0x4082f9 = createUniqueId({
      prefix: _0x2c4a4b.type || "object",
      sourceId: _0x216b2e,
      usedIds: _0x10db89,
      idFactory: _0x244ee8
    });
    _0x3f924d.set(_0x216b2e, _0x4082f9);
    return {
      ..._0x2c4a4b,
      id: _0x4082f9
    };
  });
  _0x41eef6.objects = _0x41eef6.objects.map(_0x154ace => ({
    ..._0x154ace,
    ...(_0x154ace.parentId && _0x3f924d.has(String(_0x154ace.parentId)) ? {
      parentId: _0x3f924d.get(String(_0x154ace.parentId))
    } : {}),
    ...(Array.isArray(_0x154ace.attachmentIds) ? {
      attachmentIds: _0x154ace.attachmentIds.map(_0x581465 => _0x3f924d.get(String(_0x581465)) || String(_0x581465))
    } : {})
  }));
  _0x41eef6.shots = (Array.isArray(_0x41eef6.shots) ? _0x41eef6.shots : []).map((_0x3a37f6, _0x4fb57e) => {
    const _0xff78a8 = String(_0x3a37f6.id || "shot-" + (_0x4fb57e + 1));
    const _0x48642f = createUniqueId({
      prefix: "shot",
      sourceId: _0xff78a8,
      usedIds: _0x10db89,
      idFactory: _0x244ee8
    });
    _0x5ca248.set(_0xff78a8, _0x48642f);
    return {
      ..._0x3a37f6,
      id: _0x48642f,
      sceneId: _0x1f9f94,
      ...(_0x3a37f6.cameraId ? {
        cameraId: _0x3f924d.get(String(_0x3a37f6.cameraId)) || String(_0x3a37f6.cameraId)
      } : {}),
      order: _0x4fb57e,
      createdAt: _0x1303dd,
      updatedAt: _0x1303dd
    };
  });
  _0x41eef6.activeShotId = _0x5ca248.get(String(_0x41eef6.activeShotId || "")) || _0x41eef6.shots[0]?.id || "";
  return _0x41eef6;
}
function updateProject(_0x507c78, _0x31aba6, _0x103d3c) {
  const _0x5263cb = cloneStoryboard3DProject(_0x507c78);
  const _0x2660a1 = _0x31aba6(_0x5263cb) !== false;
  if (_0x2660a1) {
    _0x5263cb.updatedAt = resolveNow(_0x507c78, _0x103d3c);
  }
  return _0x5263cb;
}
function findScene(_0x48d317, _0x15754c) {
  return (Array.isArray(_0x48d317?.scenes) ? _0x48d317.scenes : []).find(_0x388b6f => _0x388b6f.id === _0x15754c);
}
function findShot(_0x1a6efb, _0x2ce65b) {
  return (Array.isArray(_0x1a6efb?.shots) ? _0x1a6efb.shots : []).find(_0x6c4aae => _0x6c4aae.id === _0x2ce65b);
}
function stableCameraSignature(_0x3b6d2f) {
  const _0x47abd0 = normalizeStoryboard3DCameraState(_0x3b6d2f);
  return JSON.stringify([_0x47abd0.position, _0x47abd0.target, _0x47abd0.focalLength, _0x47abd0.near, _0x47abd0.far, _0x47abd0.aspectRatio]);
}
export function saveStoryboard3DProjectAsCopy(_0x15a536, {
  id: _0x5c9e24,
  name: _0x5c71c0,
  now: _0x1b562b,
  idFactory: _0x300744
} = {}) {
  const _0x12152c = cloneStoryboard3DProject(_0x15a536);
  const _0xffab22 = resolveNow(_0x12152c, _0x1b562b);
  const _0x5ed614 = collectProjectIds(_0x12152c);
  const _0x3a9f76 = String(_0x12152c.id || "project");
  const _0x3efa52 = normalizeName(_0x5c9e24) || createUniqueId({
    prefix: "project",
    sourceId: _0x3a9f76,
    usedIds: _0x5ed614,
    idFactory: _0x300744
  });
  const _0x1b969d = new Map();
  const _0x5ce6e3 = (Array.isArray(_0x12152c.scenes) ? _0x12152c.scenes : []).map(_0x43a65c => {
    const _0x3fe5eb = cloneSceneWithNewIds(_0x43a65c, {
      usedIds: _0x5ed614,
      idFactory: _0x300744,
      name: _0x43a65c.name,
      now: _0xffab22
    });
    _0x1b969d.set(String(_0x43a65c.id), _0x3fe5eb.id);
    return _0x3fe5eb;
  });
  return {
    ..._0x12152c,
    id: _0x3efa52,
    name: normalizeName(_0x5c71c0) || (_0x12152c.name || "3D Storyboard") + " Copy",
    scenes: _0x5ce6e3,
    activeSceneId: _0x1b969d.get(String(_0x12152c.activeSceneId || "")) || _0x5ce6e3[0]?.id || "",
    createdAt: _0xffab22,
    updatedAt: _0xffab22
  };
}
export function renameStoryboard3DScene(_0x4750c0, _0x4bd010, _0x2fe822, {
  now: _0x422bf9
} = {}) {
  const _0x31df2f = normalizeName(_0x2fe822);
  return updateProject(_0x4750c0, _0x1e099c => {
    const _0x3bbbc1 = findScene(_0x1e099c, _0x4bd010);
    if (!_0x3bbbc1 || !_0x31df2f || _0x3bbbc1.name === _0x31df2f) {
      return false;
    }
    _0x3bbbc1.name = _0x31df2f;
    return true;
  }, _0x422bf9);
}
export function duplicateStoryboard3DScene(_0xb23842, _0x509532, {
  name: _0x5c815c,
  now: _0x52e12f,
  idFactory: _0x54e9b7
} = {}) {
  const _0x450e70 = resolveNow(_0xb23842, _0x52e12f);
  const _0x16dd32 = collectProjectIds(_0xb23842);
  return updateProject(_0xb23842, _0x567e61 => {
    const _0x1d0080 = _0x567e61.scenes.findIndex(_0x292e15 => _0x292e15.id === _0x509532);
    if (_0x1d0080 < 0) {
      return false;
    }
    const _0x4f3c0a = cloneSceneWithNewIds(_0x567e61.scenes[_0x1d0080], {
      usedIds: _0x16dd32,
      idFactory: _0x54e9b7,
      name: _0x5c815c,
      now: _0x450e70
    });
    _0x567e61.scenes.splice(_0x1d0080 + 1, 0, _0x4f3c0a);
    _0x567e61.activeSceneId = _0x4f3c0a.id;
    return true;
  }, _0x450e70);
}
export function deleteStoryboard3DScene(_0x1431be, _0x1259c9, {
  now: _0x481cef
} = {}) {
  return updateProject(_0x1431be, _0x3b4620 => {
    if (!Array.isArray(_0x3b4620.scenes) || _0x3b4620.scenes.length <= 1) {
      return false;
    }
    const _0x33f3ea = _0x3b4620.scenes.findIndex(_0x279cf6 => _0x279cf6.id === _0x1259c9);
    if (_0x33f3ea < 0) {
      return false;
    }
    _0x3b4620.scenes.splice(_0x33f3ea, 1);
    if (_0x3b4620.activeSceneId === _0x1259c9) {
      _0x3b4620.activeSceneId = _0x3b4620.scenes[Math.min(_0x33f3ea, _0x3b4620.scenes.length - 1)].id;
    }
    return true;
  }, _0x481cef);
}
export function reorderStoryboard3DScene(_0x1f1737, _0x5bc6fa, _0x2df9cd, {
  now: _0x392813
} = {}) {
  return updateProject(_0x1f1737, _0x23b8e0 => {
    const _0x4e3e00 = _0x23b8e0.scenes.findIndex(_0x33b163 => _0x33b163.id === _0x5bc6fa);
    if (_0x4e3e00 < 0) {
      return false;
    }
    const _0x3ae957 = clamp(Math.round(finite(_0x2df9cd, _0x4e3e00)), 0, _0x23b8e0.scenes.length - 1);
    if (_0x3ae957 === _0x4e3e00) {
      return false;
    }
    const [_0x3e95e2] = _0x23b8e0.scenes.splice(_0x4e3e00, 1);
    _0x23b8e0.scenes.splice(_0x3ae957, 0, _0x3e95e2);
    return true;
  }, _0x392813);
}
export function applyStoryboard3DEnvironmentPreset(_0x25067f, _0x35f04f, _0x1dba0c, {
  overrides = {},
  now: _0x4a2f41
} = {}) {
  const _0x1fba4d = STORYBOARD_3D_ENVIRONMENT_PRESETS[_0x1dba0c];
  if (!_0x1fba4d) {
    throw new Error("Unsupported 3D environment preset: " + _0x1dba0c);
  }
  return updateProject(_0x25067f, _0x1d9a20 => {
    const _0x1c4473 = findScene(_0x1d9a20, _0x35f04f);
    if (!_0x1c4473) {
      return false;
    }
    _0x1c4473.environment = {
      ...cloneStoryboard3DProject(_0x1fba4d),
      ...(overrides && typeof overrides === "object" ? overrides : {}),
      type: _0x1fba4d.type,
      groundSize: Math.max(1, finite(overrides?.groundSize, _0x1fba4d.groundSize)),
      showGrid: overrides?.showGrid !== false,
      showOutline: overrides?.showOutline !== false,
      enableShadows: overrides?.enableShadows !== false
    };
    if (!normalizeName(_0x1c4473.environment.backgroundColor)) {
      delete _0x1c4473.environment.backgroundColor;
    }
    return true;
  }, _0x4a2f41);
}
export function replaceStoryboard3DShotFromCurrentView(_0x5e9cea, {
  sceneId: _0x226a10,
  shotId: _0x2b8da8,
  camera: _0x11a154,
  subjectBounds: _0x1fa4d5,
  subjectForward: _0x563c93,
  compositionHint: _0x283242,
  now: _0xaabae7
} = {}) {
  const _0x264d83 = resolveNow(_0x5e9cea, _0xaabae7);
  return updateProject(_0x5e9cea, _0x49b21f => {
    const _0xa04c67 = _0x49b21f.scenes.findIndex(_0x5a60a6 => _0x5a60a6.id === _0x226a10);
    if (_0xa04c67 < 0 || !findShot(_0x49b21f.scenes[_0xa04c67], _0x2b8da8)) {
      return false;
    }
    const _0x53fd49 = replaceStoryboard3DShotCamera(_0x49b21f.scenes[_0xa04c67], _0x2b8da8, _0x11a154, {
      subjectBounds: _0x1fa4d5,
      subjectForward: _0x563c93,
      compositionHint: _0x283242,
      now: _0x264d83
    });
    const _0x1fabd0 = findShot(_0x53fd49, _0x2b8da8);
    if (_0x1fabd0) {
      delete _0x1fabd0.thumbnailUrl;
    }
    _0x49b21f.scenes[_0xa04c67] = _0x53fd49;
    return true;
  }, _0x264d83);
}
export function createStoryboard3DShotThumbnailToken(_0x12f4b1, _0xfae850) {
  if (!_0x12f4b1 || !_0xfae850?.id || !_0xfae850?.camera) {
    throw new Error("A scene id and persisted shot camera are required");
  }
  return {
    kind: "storyboard3d-shot-thumbnail-token",
    version: 1,
    sceneId: String(_0x12f4b1),
    shotId: String(_0xfae850.id),
    cameraSignature: stableCameraSignature(_0xfae850.camera),
    shotUpdatedAt: Math.max(0, finite(_0xfae850.updatedAt, 0))
  };
}
export function applyStoryboard3DShotThumbnail(_0x190579, _0x372f6d, _0x542784, {
  now: _0x138aa3
} = {}) {
  const _0x34f802 = cloneStoryboard3DProject(_0x190579);
  if (_0x372f6d?.kind !== "storyboard3d-shot-thumbnail-token" || _0x372f6d?.version !== 1) {
    return {
      project: _0x34f802,
      applied: false,
      reason: "invalid-token"
    };
  }
  const _0x56b194 = findScene(_0x34f802, _0x372f6d.sceneId);
  const _0x44b0e9 = findShot(_0x56b194, _0x372f6d.shotId);
  if (!_0x44b0e9) {
    return {
      project: _0x34f802,
      applied: false,
      reason: "shot-not-found"
    };
  }
  if (stableCameraSignature(_0x44b0e9.camera) !== _0x372f6d.cameraSignature || Math.max(0, finite(_0x44b0e9.updatedAt, 0)) !== _0x372f6d.shotUpdatedAt) {
    return {
      project: _0x34f802,
      applied: false,
      reason: "stale-token"
    };
  }
  const _0x34880f = normalizeName(_0x542784);
  if (!_0x34880f) {
    return {
      project: _0x34f802,
      applied: false,
      reason: "invalid-thumbnail"
    };
  }
  _0x44b0e9.thumbnailUrl = _0x34880f;
  _0x44b0e9.updatedAt = resolveNow(_0x190579, _0x138aa3);
  _0x34f802.updatedAt = _0x44b0e9.updatedAt;
  return {
    project: _0x34f802,
    applied: true,
    reason: "applied"
  };
}