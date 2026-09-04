import * as a1273_0x34759f from "../panoramaSceneNode/threeRuntime.js";
export const STORYBOARD_3D_INSTANCE_BATCH_MIN_COUNT = 3;
function finite(_0x46632f, _0x4653a0 = 0) {
  const _0x9bca16 = Number(_0x46632f);
  if (Number.isFinite(_0x9bca16)) {
    return _0x9bca16;
  } else {
    return _0x4653a0;
  }
}
function vector3(_0x266f40, _0x991e79) {
  const _0x23d85d = Array.isArray(_0x266f40) ? _0x266f40 : [];
  return new a1273_0x34759f.Vector3(finite(_0x23d85d[0], _0x991e79[0]), finite(_0x23d85d[1], _0x991e79[1]), finite(_0x23d85d[2], _0x991e79[2]));
}
export function createStoryboard3DInstanceMatrix(_0x5e12ef, _0x15d1d9 = null) {
  const _0x3f81cb = vector3(_0x5e12ef?.position, [0, 0, 0]);
  const _0x435ddf = vector3(_0x5e12ef?.rotation, [0, 0, 0]);
  const _0x2f498f = vector3(_0x5e12ef?.scale, [1, 1, 1]);
  _0x2f498f.set(Math.max(0.001, _0x2f498f.x), Math.max(0.001, _0x2f498f.y), Math.max(0.001, _0x2f498f.z));
  const _0x2ca68f = new a1273_0x34759f.Matrix4().compose(_0x3f81cb, new a1273_0x34759f.Quaternion().setFromEuler(new a1273_0x34759f.Euler(_0x435ddf.x, _0x435ddf.y, _0x435ddf.z)), _0x2f498f);
  if (_0x15d1d9) {
    _0x2ca68f.multiply(_0x15d1d9);
  }
  return _0x2ca68f;
}
export function findStoryboard3DInstancingTemplate(_0x313658) {
  if (!_0x313658?.traverse) {
    return null;
  }
  _0x313658.updateMatrixWorld?.(true);
  const _0x5e4694 = [];
  let _0x44b81 = false;
  _0x313658.traverse(_0x75fb04 => {
    if (_0x75fb04?.isSkinnedMesh || _0x75fb04?.morphTargetInfluences?.length) {
      _0x44b81 = true;
    }
    if (_0x75fb04?.isMesh && !_0x75fb04.isInstancedMesh) {
      _0x5e4694.push(_0x75fb04);
    }
  });
  if (_0x44b81 || _0x5e4694.length !== 1) {
    return null;
  }
  const _0x113cf3 = _0x5e4694[0];
  if (!_0x113cf3.geometry || !_0x113cf3.material) {
    return null;
  }
  return {
    geometry: _0x113cf3.geometry,
    material: _0x113cf3.material,
    sourceMatrix: _0x113cf3.matrixWorld.clone()
  };
}
export function createStoryboard3DInstanceBatch({
  template: _0x562731,
  objects = [],
  tint = "",
  castShadow = true,
  receiveShadow = true
} = {}) {
  if (!_0x562731?.geometry || !_0x562731?.material) {
    throw new TypeError("An instancing template is required");
  }
  const _0x2a78e6 = Array.isArray(objects) ? objects.filter(_0x122a72 => _0x122a72?.id) : [];
  if (_0x2a78e6.length === 0) {
    throw new Error("At least one storyboard object is required");
  }
  const _0x4bdf80 = Array.isArray(_0x562731.material) ? _0x562731.material : [_0x562731.material];
  const _0x33e818 = [];
  const _0x3eeea8 = _0x4bdf80.map(_0x507760 => {
    if (!tint || !_0x507760?.clone) {
      return _0x507760;
    }
    const _0x272848 = _0x507760.clone();
    _0x272848.color?.set?.(tint);
    _0x33e818.push(_0x272848);
    return _0x272848;
  });
  const _0x35637a = new a1273_0x34759f.InstancedMesh(_0x562731.geometry, Array.isArray(_0x562731.material) ? _0x3eeea8 : _0x3eeea8[0], _0x2a78e6.length);
  _0x35637a.name = "storyboard3d-instance-batch";
  _0x35637a.castShadow = castShadow !== false;
  _0x35637a.receiveShadow = receiveShadow !== false;
  _0x35637a.userData.storyboardObjectIds = _0x2a78e6.map(_0x4d1e4e => _0x4d1e4e.id);
  _0x2a78e6.forEach((_0x379d9e, _0x79f8b6) => {
    _0x35637a.setMatrixAt(_0x79f8b6, createStoryboard3DInstanceMatrix(_0x379d9e.transform, _0x562731.sourceMatrix));
  });
  _0x35637a.instanceMatrix.needsUpdate = true;
  _0x35637a.computeBoundingBox?.();
  _0x35637a.computeBoundingSphere?.();
  return {
    mesh: _0x35637a,
    objectIds: [..._0x35637a.userData.storyboardObjectIds],
    sourceMatrix: _0x562731.sourceMatrix.clone(),
    ownedMaterials: _0x33e818
  };
}
export function refreshStoryboard3DInstanceBatchBounds(_0x1a857d) {
  const _0x24e96c = _0x1a857d?.mesh;
  if (!_0x24e96c) {
    return false;
  }
  _0x24e96c.computeBoundingBox?.();
  _0x24e96c.computeBoundingSphere?.();
  return true;
}
export function updateStoryboard3DInstanceTransform(_0x4f4e81, _0x26450b, _0xac5f70, {
  recomputeBounds = true
} = {}) {
  const _0x1436ae = _0x4f4e81?.objectIds?.indexOf?.(_0x26450b) ?? -1;
  if (_0x1436ae < 0 || !_0x4f4e81?.mesh?.setMatrixAt) {
    return false;
  }
  _0x4f4e81.mesh.setMatrixAt(_0x1436ae, createStoryboard3DInstanceMatrix(_0xac5f70, _0x4f4e81.sourceMatrix));
  _0x4f4e81.mesh.instanceMatrix.needsUpdate = true;
  if (recomputeBounds) {
    refreshStoryboard3DInstanceBatchBounds(_0x4f4e81);
  }
  return true;
}
export function disposeStoryboard3DInstanceBatch(_0x552e05) {
  _0x552e05?.mesh?.removeFromParent?.();
  _0x552e05?.mesh?.dispose?.();
  (_0x552e05?.ownedMaterials || []).forEach(_0x3ca191 => _0x3ca191?.dispose?.());
}