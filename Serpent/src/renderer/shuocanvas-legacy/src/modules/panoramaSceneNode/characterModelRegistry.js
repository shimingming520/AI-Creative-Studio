import * as a1078_0x1c11e6 from "./threeRuntime.js";
import { GLTFLoader } from "../../../vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { clone as a1078_0x1aa27e } from "../../../vendor/three/examples/jsm/utils/SkeletonUtils.js";
import { PANORAMA_CHARACTER_BONES, normalizeBonePose } from "./poseCatalog.js";
const TARGET_CHARACTER_HEIGHT = 1.92;
export const PANORAMA_CHARACTER_MODEL_SOURCES = Object.freeze({
  male: new URL("../../../assets/characters/quaternius/universal-base/Superhero_Male_FullBody.gltf", import.meta.url).href,
  female: new URL("../../../assets/characters/quaternius/universal-base/Superhero_Female_FullBody.gltf", import.meta.url).href
});
const loader = new GLTFLoader();
const loadCache = new Map();
const NATURAL_ARM_POSE_BY_GENDER = Object.freeze({
  male: Object.freeze({
    upperArmDropRadians: 1.34,
    lowerArmRelaxRadians: 0
  }),
  female: Object.freeze({
    upperArmDropRadians: 1.38,
    lowerArmRelaxRadians: 0
  })
});
export function resolvePanoramaCharacterGender(_0x59c1ca) {
  if (_0x59c1ca === "female") {
    return "female";
  } else {
    return "male";
  }
}
export function resolvePanoramaCharacterModelUrl(_0x418098) {
  return PANORAMA_CHARACTER_MODEL_SOURCES[resolvePanoramaCharacterGender(_0x418098)];
}
function loadCharacterTemplate(_0xadad86) {
  const _0x1a3430 = resolvePanoramaCharacterGender(_0xadad86);
  if (loadCache.has(_0x1a3430)) {
    return loadCache.get(_0x1a3430);
  }
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Quaternius character models are only loaded in browser runtime"));
  }
  const _0x21d8bd = new Promise((_0x4d5c77, _0xb96978) => {
    loader.load(resolvePanoramaCharacterModelUrl(_0x1a3430), _0x49b1a4 => {
      if (!_0x49b1a4?.scene) {
        _0xb96978(new Error("Quaternius " + _0x1a3430 + " model did not contain a scene"));
        return;
      }
      _0x4d5c77(normalizeCharacterModel(_0x49b1a4.scene, _0x1a3430));
    }, undefined, _0xb96978);
  });
  loadCache.set(_0x1a3430, _0x21d8bd);
  return _0x21d8bd;
}
function cloneCharacterTemplate(_0x247757) {
  return a1078_0x1aa27e(_0x247757);
}
function resolvePanoramaCharacterNaturalArmPose(_0x39b022) {
  return NATURAL_ARM_POSE_BY_GENDER[resolvePanoramaCharacterGender(_0x39b022)];
}
function rotateBoneLocal(_0x2f3a62, _0x426c85, _0x568c16, _0x4bc70b) {
  const _0x12626b = _0x2f3a62?.getObjectByName?.(_0x426c85);
  if (!_0x12626b) {
    return false;
  }
  const _0x3dbb2f = new a1078_0x1c11e6.Quaternion().setFromAxisAngle(_0x568c16, _0x4bc70b);
  _0x12626b.quaternion.multiply(_0x3dbb2f);
  return true;
}
export function applyPanoramaCharacterNaturalArmPose(_0x37336f, _0x5317e6) {
  const _0x1a7cb4 = resolvePanoramaCharacterNaturalArmPose(_0x5317e6);
  const _0xeb2ec9 = new a1078_0x1c11e6.Vector3(0, 0, 1);
  rotateBoneLocal(_0x37336f, "upperarm_l", _0xeb2ec9, -_0x1a7cb4.upperArmDropRadians);
  rotateBoneLocal(_0x37336f, "upperarm_r", _0xeb2ec9, _0x1a7cb4.upperArmDropRadians);
  rotateBoneLocal(_0x37336f, "lowerarm_l", _0xeb2ec9, -_0x1a7cb4.lowerArmRelaxRadians);
  rotateBoneLocal(_0x37336f, "lowerarm_r", _0xeb2ec9, _0x1a7cb4.lowerArmRelaxRadians);
  _0x37336f?.updateMatrixWorld?.(true);
  return _0x37336f;
}
export function capturePanoramaCharacterBoneBase(_0xf44cba) {
  const _0x320f31 = {};
  for (const _0x1d6bc7 of PANORAMA_CHARACTER_BONES) {
    const _0x231072 = _0xf44cba?.getObjectByName?.(_0x1d6bc7);
    if (!_0x231072?.quaternion) {
      continue;
    }
    _0x320f31[_0x1d6bc7] = {
      x: _0x231072.quaternion.x,
      y: _0x231072.quaternion.y,
      z: _0x231072.quaternion.z,
      w: _0x231072.quaternion.w
    };
  }
  return _0x320f31;
}
export function applyPanoramaCharacterBonePose(_0x397c14, _0x368002, _0x414ad4 = {}) {
  const _0x31f5e3 = normalizeBonePose(_0x368002);
  for (const _0x2a6d7e of PANORAMA_CHARACTER_BONES) {
    const _0x38181f = _0x397c14?.getObjectByName?.(_0x2a6d7e);
    if (!_0x38181f?.quaternion) {
      continue;
    }
    const _0x9c037d = _0x414ad4?.[_0x2a6d7e];
    if (_0x9c037d) {
      _0x38181f.quaternion.set(_0x9c037d.x, _0x9c037d.y, _0x9c037d.z, _0x9c037d.w);
    }
    const _0x5ced98 = _0x31f5e3[_0x2a6d7e];
    if (!_0x5ced98) {
      continue;
    }
    const _0x545640 = new a1078_0x1c11e6.Quaternion().setFromEuler(new a1078_0x1c11e6.Euler(_0x5ced98.x, _0x5ced98.y, _0x5ced98.z, "XYZ"));
    _0x38181f.quaternion.multiply(_0x545640);
  }
  _0x397c14?.updateMatrixWorld?.(true);
  return _0x397c14;
}
function normalizeCharacterModel(_0x4f6f79, _0x11b3c2) {
  applyPanoramaCharacterNaturalArmPose(_0x4f6f79, _0x11b3c2);
  _0x4f6f79.updateMatrixWorld(true);
  const _0x1cdb76 = new a1078_0x1c11e6.Box3().setFromObject(_0x4f6f79);
  const _0x4b8859 = new a1078_0x1c11e6.Vector3();
  _0x1cdb76.getSize(_0x4b8859);
  const _0x27736e = Math.max(0.001, _0x4b8859.y);
  const _0x3779da = TARGET_CHARACTER_HEIGHT / _0x27736e;
  _0x4f6f79.scale.multiplyScalar(_0x3779da);
  _0x4f6f79.updateMatrixWorld(true);
  const _0x5a3ba3 = new a1078_0x1c11e6.Box3().setFromObject(_0x4f6f79);
  const _0x12e3eb = new a1078_0x1c11e6.Vector3();
  _0x5a3ba3.getCenter(_0x12e3eb);
  _0x4f6f79.position.x -= _0x12e3eb.x;
  _0x4f6f79.position.y -= _0x5a3ba3.min.y;
  _0x4f6f79.position.z -= _0x12e3eb.z;
  _0x4f6f79.traverse(_0x593918 => {
    _0x593918.frustumCulled = false;
    if (_0x593918.isMesh) {
      _0x593918.castShadow = false;
      _0x593918.receiveShadow = true;
    }
  });
  return _0x4f6f79;
}
export function preloadPanoramaCharacterModels(_0x3f47c5 = ["male", "female"]) {
  const _0x20c99f = Array.isArray(_0x3f47c5) ? _0x3f47c5 : [_0x3f47c5];
  return Promise.all(_0x20c99f.map(_0x215bc8 => loadCharacterTemplate(resolvePanoramaCharacterGender(_0x215bc8))));
}
export async function createPanoramaCharacterModelInstance(_0x36fb07) {
  const _0x37c165 = await loadCharacterTemplate(_0x36fb07);
  return cloneCharacterTemplate(_0x37c165);
}