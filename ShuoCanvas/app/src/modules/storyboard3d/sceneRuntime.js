import { PanoramaScene3DBridge } from "../panoramaSceneNode/scene3dBridge.js";
import { normalizePanoramaSceneState } from "../panoramaSceneNode/sceneNode.js";
import * as a1289_0x47be91 from "../panoramaSceneNode/threeRuntime.js";
import { clampSceneFocalLength, focalLengthToFov } from "../../core/panoramaSceneMath.js";
import { quaternionToStoryboard3DEuler, resolveStoryboard3DCharacterPose } from "./characterRig.js";
import { STORYBOARD_3D_INSTANCE_BATCH_MIN_COUNT, createStoryboard3DInstanceBatch, disposeStoryboard3DInstanceBatch, findStoryboard3DInstancingTemplate, refreshStoryboard3DInstanceBatchBounds, updateStoryboard3DInstanceTransform } from "./instanceBatching.js";
import { applyStoryboard3DTexturePolicy } from "./texturePolicy.js";
import { readStoryboard3DModelNormalization } from "./modelImport.js";
import { computeStoryboard3DVerticalFov, normalizeStoryboard3DBackgroundCalibration } from "./backgroundCalibration.js";
import { canStoryboard3DObjectUseTransformTool, getStoryboard3DObjectTransformCapabilities } from "./objectTransformCapabilities.js";
const TRANSFORM_TOOLS = new Set(["move", "rotate", "scale"]);
function finiteNumber(_0x2e38cb, _0xe56ce0 = 0) {
  const _0x3a241a = Number(_0x2e38cb);
  if (Number.isFinite(_0x3a241a)) {
    return _0x3a241a;
  } else {
    return _0xe56ce0;
  }
}
function vectorFromArray(_0x8e54cd, _0x167c00) {
  const _0x122a80 = Array.isArray(_0x8e54cd) ? _0x8e54cd : [];
  return {
    x: finiteNumber(_0x122a80[0], _0x167c00.x),
    y: finiteNumber(_0x122a80[1], _0x167c00.y),
    z: finiteNumber(_0x122a80[2], _0x167c00.z)
  };
}
function scaleFromArray(_0x115502) {
  const _0x5d206f = vectorFromArray(_0x115502, {
    x: 1,
    y: 1,
    z: 1
  });
  return {
    x: Math.max(0.001, _0x5d206f.x),
    y: Math.max(0.001, _0x5d206f.y),
    z: Math.max(0.001, _0x5d206f.z)
  };
}
function transformToBridgePose(_0x4d3f3e) {
  return {
    position: vectorFromArray(_0x4d3f3e?.position, {
      x: 0,
      y: 0,
      z: 0
    }),
    rotation: vectorFromArray(_0x4d3f3e?.rotation, {
      x: 0,
      y: 0,
      z: 0
    }),
    scale: scaleFromArray(_0x4d3f3e?.scale)
  };
}
function convexHullXZ(_0x1fba8a) {
  const _0x2be4dc = new Map();
  for (const _0x3e7633 of _0x1fba8a || []) {
    const _0x1628f4 = finiteNumber(_0x3e7633?.x);
    const _0x268ddc = finiteNumber(_0x3e7633?.z);
    _0x2be4dc.set(_0x1628f4.toFixed(6) + ":" + _0x268ddc.toFixed(6), {
      x: _0x1628f4,
      z: _0x268ddc
    });
  }
  const _0x57254e = [..._0x2be4dc.values()].sort((_0x30a9d9, _0x3d8e2a) => _0x30a9d9.x - _0x3d8e2a.x || _0x30a9d9.z - _0x3d8e2a.z);
  if (_0x57254e.length <= 2) {
    return _0x57254e;
  }
  const _0x26f87d = (_0x26ee1e, _0x588520, _0x3bd48b) => (_0x588520.x - _0x26ee1e.x) * (_0x3bd48b.z - _0x26ee1e.z) - (_0x588520.z - _0x26ee1e.z) * (_0x3bd48b.x - _0x26ee1e.x);
  const _0x5277b9 = [];
  for (const _0x395d43 of _0x57254e) {
    while (_0x5277b9.length >= 2 && _0x26f87d(_0x5277b9.at(-2), _0x5277b9.at(-1), _0x395d43) <= 0) {
      _0x5277b9.pop();
    }
    _0x5277b9.push(_0x395d43);
  }
  const _0x83f32f = [];
  for (let _0x501007 = _0x57254e.length - 1; _0x501007 >= 0; _0x501007 -= 1) {
    const _0x576ccb = _0x57254e[_0x501007];
    while (_0x83f32f.length >= 2 && _0x26f87d(_0x83f32f.at(-2), _0x83f32f.at(-1), _0x576ccb) <= 0) {
      _0x83f32f.pop();
    }
    _0x83f32f.push(_0x576ccb);
  }
  _0x5277b9.pop();
  _0x83f32f.pop();
  return [..._0x5277b9, ..._0x83f32f];
}
function collectGeometryTopViewPoints(_0x256749, _0x49fff7) {
  if (!_0x256749 || !_0x49fff7) {
    return [];
  }
  const _0xe05760 = _0x256749.attributes?.position;
  if (_0xe05760?.count > 0) {
    const _0x393428 = [];
    const _0x4718f2 = Math.max(1, Math.floor(_0xe05760.count / 384));
    for (let _0x289c87 = 0; _0x289c87 < _0xe05760.count; _0x289c87 += _0x4718f2) {
      const _0x59010d = new a1289_0x47be91.Vector3().fromBufferAttribute(_0xe05760, _0x289c87).applyMatrix4(_0x49fff7);
      _0x393428.push({
        x: _0x59010d.x,
        z: _0x59010d.z
      });
    }
    const _0x14cad0 = _0xe05760.count - 1;
    if (_0x14cad0 % _0x4718f2 !== 0) {
      const _0x5337d9 = new a1289_0x47be91.Vector3().fromBufferAttribute(_0xe05760, _0x14cad0).applyMatrix4(_0x49fff7);
      _0x393428.push({
        x: _0x5337d9.x,
        z: _0x5337d9.z
      });
    }
    return _0x393428;
  }
  _0x256749.computeBoundingBox?.();
  const _0x484f8e = _0x256749.boundingBox;
  if (!_0x484f8e || _0x484f8e.isEmpty?.()) {
    return [];
  }
  const _0x1ead23 = [];
  for (const _0x3f8d93 of [_0x484f8e.min.x, _0x484f8e.max.x]) {
    for (const _0x266a8f of [_0x484f8e.min.y, _0x484f8e.max.y]) {
      for (const _0x4f5dcf of [_0x484f8e.min.z, _0x484f8e.max.z]) {
        const _0x1b7e04 = new a1289_0x47be91.Vector3(_0x3f8d93, _0x266a8f, _0x4f5dcf).applyMatrix4(_0x49fff7);
        _0x1ead23.push({
          x: _0x1b7e04.x,
          z: _0x1b7e04.z
        });
      }
    }
  }
  return _0x1ead23;
}
function collectObjectTopViewFootprint(_0x36abc1) {
  if (!_0x36abc1 || _0x36abc1.visible === false || typeof _0x36abc1.traverse !== "function") {
    return [];
  }
  _0x36abc1.updateMatrixWorld?.(true);
  const _0x286f39 = [];
  _0x36abc1.traverse(_0x2e636c => {
    if (!_0x2e636c?.isMesh || _0x2e636c.visible === false || !_0x2e636c.geometry) {
      return;
    }
    _0x2e636c.updateWorldMatrix?.(true, false);
    _0x286f39.push(...collectGeometryTopViewPoints(_0x2e636c.geometry, _0x2e636c.matrixWorld));
  });
  return convexHullXZ(_0x286f39);
}
function collectInstanceTopViewFootprint(_0x3b6285, _0x4f2bea) {
  const _0x55601b = _0x3b6285?.objectIds?.indexOf?.(_0x4f2bea) ?? -1;
  const _0x43f21b = _0x3b6285?.mesh;
  if (_0x55601b < 0 || !_0x43f21b?.geometry || typeof _0x43f21b.getMatrixAt !== "function") {
    return [];
  }
  _0x43f21b.updateMatrixWorld?.(true);
  const _0x1721c2 = new a1289_0x47be91.Matrix4();
  _0x43f21b.getMatrixAt(_0x55601b, _0x1721c2);
  const _0x103bd9 = _0x43f21b.matrixWorld.clone().multiply(_0x1721c2);
  return convexHullXZ(collectGeometryTopViewPoints(_0x43f21b.geometry, _0x103bd9));
}
function createFallbackTopViewFootprint(_0x5cc972) {
  const _0x1994df = _0x5cc972?.transform || {};
  const _0x3b828a = vectorFromArray(_0x1994df.position, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x4932cd = vectorFromArray(_0x1994df.rotation, {
    x: 0,
    y: 0,
    z: 0
  });
  const _0x262720 = scaleFromArray(_0x1994df.scale);
  const _0x11d9ec = _0x5cc972?.type === "character" ? 0.65 : _0x5cc972?.type === "light" ? 0.4 : 1;
  const _0x3c15b6 = _0x5cc972?.type === "character" ? 0.45 : _0x5cc972?.type === "light" ? 0.4 : 1;
  const _0x23cfb9 = Math.max(0.08, _0x11d9ec * _0x262720.x / 2);
  const _0x4096d4 = Math.max(0.08, _0x3c15b6 * _0x262720.z / 2);
  const _0x4d5dfa = Math.cos(_0x4932cd.y);
  const _0x423b5d = Math.sin(_0x4932cd.y);
  return [[-_0x23cfb9, -_0x4096d4], [_0x23cfb9, -_0x4096d4], [_0x23cfb9, _0x4096d4], [-_0x23cfb9, _0x4096d4]].map(([_0x3c0e40, _0x1ead7b]) => ({
    x: _0x3b828a.x + _0x3c0e40 * _0x4d5dfa + _0x1ead7b * _0x423b5d,
    z: _0x3b828a.z - _0x3c0e40 * _0x423b5d + _0x1ead7b * _0x4d5dfa
  }));
}
function cameraToSceneView(_0x3af13) {
  const _0x25088a = vectorFromArray(_0x3af13?.position, {
    x: 5,
    y: 4,
    z: 7
  });
  const _0x553363 = vectorFromArray(_0x3af13?.target, {
    x: 0,
    y: 1.2,
    z: 0
  });
  const _0x4fc52e = {
    x: _0x25088a.x - _0x553363.x,
    y: _0x25088a.y - _0x553363.y,
    z: _0x25088a.z - _0x553363.z
  };
  const _0x8e98c7 = Math.max(0.25, Math.hypot(_0x4fc52e.x, _0x4fc52e.y, _0x4fc52e.z));
  return {
    target: _0x553363,
    orbitYaw: Math.atan2(_0x4fc52e.x, _0x4fc52e.z),
    orbitPitch: Math.asin(Math.max(-1, Math.min(1, _0x4fc52e.y / _0x8e98c7))),
    orbitDistance: _0x8e98c7
  };
}
function resolveScene(_0x3c2248, _0x286ca9) {
  const _0x29f7ce = Array.isArray(_0x3c2248?.scenes) ? _0x3c2248.scenes : [];
  return _0x29f7ce.find(_0x36f97b => _0x36f97b.id === _0x286ca9) || _0x29f7ce.find(_0x49846e => _0x49846e.id === _0x3c2248?.activeSceneId) || _0x29f7ce[0] || null;
}
function resolveActiveShot(_0x3cb520) {
  const _0x4f6401 = Array.isArray(_0x3cb520?.shots) ? _0x3cb520.shots : [];
  return _0x4f6401.find(_0x494c67 => _0x494c67.id === _0x3cb520?.activeShotId) || _0x4f6401[0] || null;
}
function bridgeObjectType(_0x1e1836) {
  const _0x95bf09 = _0x1e1836 && typeof _0x1e1836 === "object" ? _0x1e1836 : null;
  const _0x70be30 = _0x95bf09?.type || _0x1e1836;
  if (_0x70be30 === "prop") {
    return "cube";
  }
  if (_0x70be30 === "character") {
    return "mannequin";
  }
  if (_0x70be30 === "camera") {
    return "camera";
  }
  if (_0x70be30 === "light" && _0x95bf09?.lightType !== "ambient") {
    return "cube";
  }
  return null;
}
function disposeOwnedObject3D(_0x378524) {
  _0x378524?.traverse?.(_0x4e6c08 => {
    _0x4e6c08.geometry?.dispose?.();
    const _0x3f4724 = Array.isArray(_0x4e6c08.material) ? _0x4e6c08.material : [_0x4e6c08.material];
    _0x3f4724.filter(Boolean).forEach(_0x27e826 => _0x27e826.dispose?.());
  });
}
function createImportedModelNormalizationRoot(_0x319133) {
  const _0x347488 = readStoryboard3DModelNormalization(_0x319133);
  const _0x322c0b = new a1289_0x47be91.Group();
  _0x322c0b.name = "storyboard3d-model-normalization";
  if (_0x347488) {
    _0x322c0b.position.set(_0x347488.translation.x, _0x347488.translation.y, _0x347488.translation.z);
    _0x322c0b.scale.setScalar(_0x347488.uniformScale);
  }
  _0x322c0b.add(_0x319133.clone(true));
  return _0x322c0b;
}
function applyImportedNormalizationToTemplate(_0x4f6c71, _0x721ba0) {
  const _0x3dd4d5 = readStoryboard3DModelNormalization(_0x721ba0);
  if (!_0x4f6c71 || !_0x3dd4d5) {
    return _0x4f6c71;
  }
  const _0x16c8f4 = new a1289_0x47be91.Matrix4().compose(new a1289_0x47be91.Vector3(_0x3dd4d5.translation.x, _0x3dd4d5.translation.y, _0x3dd4d5.translation.z), new a1289_0x47be91.Quaternion(), new a1289_0x47be91.Vector3(_0x3dd4d5.uniformScale, _0x3dd4d5.uniformScale, _0x3dd4d5.uniformScale));
  _0x4f6c71.sourceMatrix.premultiply(_0x16c8f4);
  return _0x4f6c71;
}
function createSelection(_0x16b759, _0x175e8d, _0x5f4adc) {
  const _0x101dbd = (Array.isArray(_0x175e8d) ? _0x175e8d : []).map(_0x558ebe => String(_0x558ebe || "").trim()).filter(Boolean);
  const _0x1f860e = new Map((_0x16b759?.objects || []).map(_0x42a3dd => [_0x42a3dd.id, _0x42a3dd]));
  const _0x2ec399 = _0x101dbd.map(_0x5dd47b => _0x1f860e.get(_0x5dd47b)).filter(Boolean).filter(_0x551a00 => _0x551a00.visible !== false && _0x551a00.locked !== true).filter(_0x4bccf7 => canStoryboard3DObjectUseTransformTool(_0x4bccf7, _0x5f4adc)).map(_0x3d5067 => ({
    objectType: bridgeObjectType(_0x3d5067),
    objectId: _0x3d5067.id
  })).filter(_0x46120e => _0x46120e.objectType);
  const _0x343077 = _0x2ec399[_0x2ec399.length - 1] || null;
  return {
    selectedObjectType: _0x343077?.objectType || null,
    selectedObjectId: _0x343077?.objectId || null,
    selectedObjectIds: _0x343077 ? _0x2ec399.filter(_0x447102 => _0x447102.objectType === _0x343077.objectType).map(_0x9dd867 => _0x9dd867.objectId) : [],
    selectedObjects: _0x2ec399,
    selectedGroupId: null
  };
}
function mapSceneObjects(_0x3be797) {
  const _0x257269 = (Array.isArray(_0x3be797?.objects) ? _0x3be797.objects : []).filter(_0x3627ce => _0x3627ce?.visible !== false);
  const _0x4d2f5b = [];
  const _0x580df0 = [];
  const _0x193fd4 = [];
  _0x257269.forEach((_0x5a86ac, _0x4134fe) => {
    const _0x2a762e = transformToBridgePose(_0x5a86ac.transform);
    if (_0x5a86ac.type === "prop") {
      _0x580df0.push({
        id: _0x5a86ac.id,
        assetId: _0x5a86ac.assetId,
        colorKey: _0x5a86ac.tint || undefined,
        ..._0x2a762e
      });
      return;
    }
    if (_0x5a86ac.type === "light" && _0x5a86ac.lightType !== "ambient") {
      _0x580df0.push({
        id: _0x5a86ac.id,
        colorKey: _0x5a86ac.color || undefined,
        ..._0x2a762e
      });
      return;
    }
    if (_0x5a86ac.type === "character") {
      const _0x1988d2 = _0x5a86ac.bodyPresetId === "female" ? "adult-female" : _0x5a86ac.bodyPresetId === "male" ? "adult-male" : _0x5a86ac.bodyPresetId;
      const _0xee531d = resolveStoryboard3DCharacterPose({
        ..._0x5a86ac,
        bodyPresetId: _0x1988d2
      });
      const _0x4bae8a = Object.fromEntries(Object.entries(_0xee531d.boneOverrides || {}).map(([_0x5eba95, _0x2c918f]) => [_0x5eba95, quaternionToStoryboard3DEuler(_0x2c918f)]));
      _0x4d2f5b.push({
        id: _0x5a86ac.id,
        bodyPresetId: _0xee531d.state.bodyPresetId,
        bodyProfile: _0xee531d.body,
        gender: _0xee531d.body?.gender === "female" ? "female" : "male",
        poseId: _0xee531d.action?.poseId || undefined,
        bonePose: {
          ...(_0xee531d.baseBones || {}),
          ...(_0xee531d.handRotations || {}),
          ..._0x4bae8a
        },
        ..._0x2a762e
      });
      return;
    }
    if (_0x5a86ac.type === "camera") {
      _0x193fd4.push({
        id: _0x5a86ac.id,
        slot: _0x4134fe + 1,
        name: _0x5a86ac.name,
        position: _0x2a762e.position,
        rotation: _0x2a762e.rotation,
        focalLength: _0x5a86ac.focalLength
      });
    }
  });
  return {
    mannequins: _0x4d2f5b,
    cubes: _0x580df0,
    cameras: _0x193fd4
  };
}
export function adaptStoryboard3DSceneToDirectorState({
  project: _0x2ae96d,
  sceneId: _0x554e52,
  selectedObjectIds = [],
  activeTool = "select"
} = {}) {
  const _0x53a349 = resolveScene(_0x2ae96d, _0x554e52);
  if (!_0x53a349) {
    return null;
  }
  const _0x30d7ca = resolveActiveShot(_0x53a349);
  const _0x1c96f6 = TRANSFORM_TOOLS.has(activeTool) ? activeTool : "move";
  const _0x3cca99 = mapSceneObjects(_0x53a349);
  const _0x2075f2 = {
    version: 2,
    mode: "scene",
    environmentMode: _0x53a349.environment?.type === "outdoor" ? "day" : "night",
    viewport: {
      activeView: "default",
      activeCameraId: null,
      sceneView: cameraToSceneView(_0x30d7ca?.camera)
    },
    panorama: {
      imageUrl: null,
      isLoaded: false
    },
    ..._0x3cca99,
    selection: createSelection(_0x53a349, selectedObjectIds, activeTool),
    groups: [],
    ui: {
      mouseTool: "navigate",
      transformTool: _0x1c96f6,
      activeTool: _0x1c96f6,
      transformSpace: "world",
      snapEnabled: false,
      groundLock: false,
      uniformScale: false,
      isEditing: true,
      showOutline: _0x53a349.environment?.showOutline !== false
    }
  };
  const _0x2de3a0 = normalizePanoramaSceneState(_0x2075f2);
  return {
    scene: _0x53a349,
    activeShot: _0x30d7ca,
    state: _0x2de3a0,
    focalLength: finiteNumber(_0x30d7ca?.camera?.focalLength, 35),
    unsupportedObjectIds: (_0x53a349.objects || []).filter(_0x357fbe => !bridgeObjectType(_0x357fbe) && !["camera", "light"].includes(_0x357fbe.type)).map(_0x198eb7 => _0x198eb7.id)
  };
}
export class Storyboard3DSceneRuntime {
  constructor({
    container: _0x47820a,
    bridgeFactory: _0x46de5b,
    importedModelResolver: _0x16eb3d,
    onVisualChange: _0x17dffb
  } = {}) {
    if (!_0x47820a) {
      throw new TypeError("Storyboard3DSceneRuntime requires a container");
    }
    const _0x1bed5d = typeof _0x46de5b === "function" ? _0x46de5b : _0x2aeca2 => new PanoramaScene3DBridge(_0x2aeca2);
    this.bridge = _0x1bed5d({
      container: _0x47820a
    });
    if (!this.bridge || typeof this.bridge.sync !== "function") {
      throw new TypeError("Storyboard3DSceneRuntime requires a compatible scene bridge");
    }
    this.project = null;
    this.container = _0x47820a;
    this.importedModelResolver = typeof _0x16eb3d === "function" ? _0x16eb3d : null;
    this.onVisualChange = typeof _0x17dffb === "function" ? _0x17dffb : null;
    this.importedModelRoots = new Map();
    this.importedModelVisuals = new Map();
    this.importedInstanceBatches = new Map();
    this.importedInstanceByObjectId = new Map();
    this.lightRoots = new Map();
    this.viewOverrides = new Map();
    this.viewportFocalLengthOverride = null;
    this.viewProjection = {
      type: "perspective",
      options: null
    };
    this.viewportUIPatch = {};
    this.backgroundTexture = null;
    this.backgroundTextureUrl = "";
    this.backgroundTextureToken = 0;
    this.backgroundCameraLockApplied = false;
    this.characterAnimationFrame = null;
    this.sceneId = null;
    this.selectedObjectIds = [];
    this.activeTool = "select";
    this.adapted = null;
    this.disposed = false;
  }
  sync({
    project: _0x1a9211,
    sceneId: _0x409c92,
    selectedObjectIds: _0x5291a5,
    activeTool: _0x495742
  } = {}) {
    if (this.disposed) {
      throw new Error("Storyboard3DSceneRuntime has been disposed");
    }
    if (_0x1a9211 !== undefined) {
      this.project = _0x1a9211;
    }
    if (_0x409c92 !== undefined) {
      this.sceneId = _0x409c92;
    }
    if (_0x5291a5 !== undefined) {
      this.selectedObjectIds = [..._0x5291a5];
    }
    if (_0x495742 !== undefined) {
      this.activeTool = _0x495742;
    }
    const _0x3b427c = this.adapted?.scene?.id || null;
    const _0x234580 = this.adapted?.activeShot?.id || null;
    this.adapted = adaptStoryboard3DSceneToDirectorState({
      project: this.project,
      sceneId: this.sceneId,
      selectedObjectIds: this.selectedObjectIds,
      activeTool: this.activeTool
    });
    if (!this.adapted) {
      return null;
    }
    if (_0x3b427c && _0x3b427c !== this.adapted.scene.id || _0x234580 && _0x234580 !== this.adapted.activeShot?.id) {
      this.viewportFocalLengthOverride = null;
    }
    if (_0x3b427c === this.adapted.scene.id && _0x234580 && _0x234580 !== this.adapted.activeShot?.id) {
      this.viewOverrides.delete(this.adapted.scene.id);
    }
    const _0x37991d = this.viewOverrides.get(this.adapted.scene.id);
    if (_0x37991d) {
      this.adapted.state.viewport.sceneView = structuredClone(_0x37991d);
    }
    this.adapted.state.ui = {
      ...this.adapted.state.ui,
      ...this.viewportUIPatch
    };
    this.bridge.setDefaultSceneFocalLength?.(this.viewportFocalLengthOverride ?? this.adapted.focalLength);
    this.bridge.setGridVisible?.(this.adapted.scene.environment?.showGrid !== false);
    this.bridge.sync(this.adapted.state);
    this._syncBackgroundCameraLock();
    if (this.bridge.renderer?.shadowMap) {
      this.bridge.renderer.shadowMap.enabled = this.adapted.scene.environment?.enableShadows !== false;
    }
    this._syncImportedModels();
    this._syncSceneLights();
    this._syncFlatBackground();
    this._syncCharacterAnimation();
    this._notifyVisualChange("sync");
    return this.getSnapshot();
  }
  _notifyVisualChange(_0x1a393f) {
    this.onVisualChange?.({
      reason: String(_0x1a393f || "visual-change")
    });
  }
  _applyImportedModelTransform(_0x5c1c85, _0x141ab1) {
    const _0x53b939 = transformToBridgePose(_0x141ab1);
    _0x5c1c85?.position?.set?.(_0x53b939.position.x, _0x53b939.position.y, _0x53b939.position.z);
    _0x5c1c85?.rotation?.set?.(_0x53b939.rotation.x, _0x53b939.rotation.y, _0x53b939.rotation.z);
    _0x5c1c85?.scale?.set?.(_0x53b939.scale.x, _0x53b939.scale.y, _0x53b939.scale.z);
    _0x5c1c85?.updateMatrixWorld?.(true);
  }
  _clearImportedModels() {
    const _0x366469 = new Set([...this.importedModelRoots.keys(), ...this.importedInstanceByObjectId.keys(), ...this.importedModelVisuals.keys()]);
    _0x366469.forEach(_0x2e1897 => {
      this.bridge.clearObjectVisualOverride?.("cube", _0x2e1897);
    });
    for (const _0x43e684 of this.importedModelRoots.values()) {
      this.bridge.scene?.remove?.(_0x43e684);
      (_0x43e684.userData?.storyboardOwnedMaterials || []).forEach(_0x5df17e => _0x5df17e?.dispose?.());
    }
    this.importedModelRoots.clear();
    this.importedModelVisuals.clear();
    for (const _0x20452a of this.importedInstanceBatches.values()) {
      this.bridge.scene?.remove?.(_0x20452a.mesh);
      disposeStoryboard3DInstanceBatch(_0x20452a);
    }
    this.importedInstanceBatches.clear();
    this.importedInstanceByObjectId.clear();
  }
  _clearSceneLights() {
    for (const [_0x2e765a, _0x5f146e] of this.lightRoots) {
      this.bridge.clearObjectVisualOverride?.("cube", _0x2e765a);
      this.bridge.scene?.remove?.(_0x5f146e);
      disposeOwnedObject3D(_0x5f146e);
    }
    this.lightRoots.clear();
  }
  _syncSceneLights() {
    this._clearSceneLights();
    if (!this.bridge.scene) {
      return;
    }
    for (const _0x2a4f36 of this.adapted?.scene?.objects || []) {
      if (_0x2a4f36.type !== "light" || _0x2a4f36.visible === false) {
        continue;
      }
      const _0x25aff2 = _0x2a4f36.color || 16777215;
      const _0x59d7c6 = Math.max(0, Number(_0x2a4f36.intensity) || 0);
      let _0x327b33;
      if (_0x2a4f36.lightType === "ambient") {
        _0x327b33 = new a1289_0x47be91.AmbientLight(_0x25aff2, _0x59d7c6);
      } else if (_0x2a4f36.lightType === "point") {
        _0x327b33 = new a1289_0x47be91.PointLight(_0x25aff2, _0x59d7c6, Number(_0x2a4f36.distance) || 0, Number(_0x2a4f36.decay) || 2);
      } else if (_0x2a4f36.lightType === "spot") {
        _0x327b33 = new a1289_0x47be91.SpotLight(_0x25aff2, _0x59d7c6, Number(_0x2a4f36.distance) || 0, Number(_0x2a4f36.angle) || Math.PI / 6);
      } else {
        _0x327b33 = new a1289_0x47be91.DirectionalLight(_0x25aff2, _0x59d7c6);
      }
      _0x327b33.castShadow = _0x2a4f36.castShadow === true;
      const _0x79af9 = new a1289_0x47be91.Group();
      _0x79af9.name = "storyboard3d-light-" + _0x2a4f36.id;
      _0x79af9.userData.storyboardObjectId = _0x2a4f36.id;
      _0x79af9.add(_0x327b33);
      if (_0x2a4f36.lightType === "directional" || _0x2a4f36.lightType === "spot" || !_0x2a4f36.lightType) {
        const _0x53134f = new a1289_0x47be91.Object3D();
        _0x53134f.position.set(0, 0, -1);
        _0x79af9.add(_0x53134f);
        _0x327b33.target = _0x53134f;
      }
      if (_0x2a4f36.lightType !== "ambient") {
        const _0x2da45a = new a1289_0x47be91.Mesh(new a1289_0x47be91.SphereGeometry(0.12, 12, 8), new a1289_0x47be91.MeshBasicMaterial({
          color: _0x25aff2
        }));
        _0x2da45a.userData.storyboardObjectId = _0x2a4f36.id;
        _0x79af9.add(_0x2da45a);
      }
      this._applyImportedModelTransform(_0x79af9, _0x2a4f36.transform);
      this.bridge.scene.add(_0x79af9);
      this.lightRoots.set(_0x2a4f36.id, _0x79af9);
      if (_0x2a4f36.lightType !== "ambient") {
        this.bridge.setObjectVisualOverride?.("cube", _0x2a4f36.id, {
          group: _0x79af9
        });
        const _0x554f80 = this.bridge._cubeMap?.get?.(_0x2a4f36.id);
        if (_0x554f80?.group) {
          _0x554f80.group.visible = false;
        }
      }
    }
    this.bridge.requestRender?.();
  }
  _syncBackgroundCameraLock() {
    const _0x5ae17b = normalizeStoryboard3DBackgroundCalibration(this.adapted?.scene?.background);
    if (_0x5ae17b.lockedCamera && _0x5ae17b.lockedCameraSnapshot) {
      const _0x517bc3 = this.bridge.renderer?.getSize?.(new a1289_0x47be91.Vector2());
      const _0x3d39b3 = Math.max(0.1, Number(_0x517bc3?.x) / Math.max(1, Number(_0x517bc3?.y)) || _0x5ae17b.imageWidth / Math.max(1, _0x5ae17b.imageHeight) || 16 / 9);
      this.previewCamera({
        ..._0x5ae17b.lockedCameraSnapshot,
        fov: computeStoryboard3DVerticalFov(_0x5ae17b.horizontalFov, _0x3d39b3)
      });
      this.backgroundCameraLockApplied = true;
      return true;
    }
    if (this.backgroundCameraLockApplied) {
      this.bridge.clearDraftView?.();
      this.backgroundCameraLockApplied = false;
    }
    return false;
  }
  _syncFlatBackground() {
    const _0x5e330d = this.adapted?.scene?.background;
    const _0x2a6eeb = String(_0x5e330d?.imageUrl || "").trim();
    this.bridge.setGroundFillVisible?.(!_0x2a6eeb);
    if (!_0x2a6eeb) {
      this.backgroundTextureToken += 1;
      if (this.bridge.scene?.background === this.backgroundTexture) {
        this.bridge.scene.background = null;
      }
      this.backgroundTexture?.dispose?.();
      this.backgroundTexture = null;
      this.backgroundTextureUrl = "";
      return;
    }
    const _0x3cd73d = _0x13574b => {
      const _0x49ff4d = Math.max(0.1, Math.min(10, Number(_0x5e330d.imageScale) || 1));
      const _0x578ce4 = Math.max(1, Number(this.adapted?.focalLength) || 35);
      const _0x5c5c24 = Math.atan(36 / (_0x578ce4 * 2)) * 2 * 180 / Math.PI;
      const _0x217283 = this.bridge.renderer?.getSize?.(new a1289_0x47be91.Vector2());
      const _0x6d4774 = Math.max(0.1, Number(_0x217283?.x) / Math.max(1, Number(_0x217283?.y)) || 16 / 9);
      const _0x1bb622 = Math.atan(Math.tan(_0x5c5c24 * Math.PI / 360) / _0x6d4774) * 2 * 180 / Math.PI;
      const _0x4ac176 = _0x5e330d.lockedCamera === true && _0x5e330d.lockedCameraSnapshot;
      const _0x35bf66 = Math.max(0.01, Math.min(10, _0x4ac176 ? 1 / _0x49ff4d : _0x5c5c24 / Math.max(1, Number(_0x5e330d.horizontalFov) || 60) / _0x49ff4d));
      const _0xda3913 = Math.max(0.01, Math.min(10, _0x4ac176 ? 1 / _0x49ff4d : _0x1bb622 / Math.max(1, Number(_0x5e330d.verticalFov) || _0x1bb622) / _0x49ff4d));
      const _0x4de58d = Array.isArray(_0x5e330d.vanishingPoint) ? _0x5e330d.vanishingPoint : [0.5, 0.5];
      const _0x23f878 = Array.isArray(_0x5e330d.imageOffset) ? _0x5e330d.imageOffset : [0, 0];
      _0x13574b.repeat?.set?.(_0x35bf66, _0xda3913);
      _0x13574b.offset?.set?.(0.5 - _0x35bf66 / 2 + (Number(_0x23f878[0]) || 0) + (_0x4ac176 ? 0 : 0.5 - (Number(_0x4de58d[0]) || 0.5)), 0.5 - _0xda3913 / 2 + (Number(_0x23f878[1]) || 0) + (_0x4ac176 ? 0 : 0.5 - (Number(_0x5e330d.horizonY) || 0.5)));
      _0x13574b.needsUpdate = true;
      this.bridge.scene.background = _0x13574b;
      this.bridge.requestRender?.();
    };
    if (_0x2a6eeb === this.backgroundTextureUrl && this.backgroundTexture) {
      _0x3cd73d(this.backgroundTexture);
      return;
    }
    const _0x21dfa5 = ++this.backgroundTextureToken;
    const _0x369c75 = new a1289_0x47be91.TextureLoader();
    _0x369c75.setCrossOrigin?.("anonymous");
    _0x369c75.load(_0x2a6eeb, _0x34b70f => {
      applyStoryboard3DTexturePolicy({
        background: _0x34b70f
      }, {
        renderer: this.bridge.renderer
      }).catch(() => null).then(() => {
        if (_0x21dfa5 !== this.backgroundTextureToken || this.disposed) {
          _0x34b70f.dispose?.();
          return;
        }
        this.backgroundTexture?.dispose?.();
        this.backgroundTexture = _0x34b70f;
        this.backgroundTextureUrl = _0x2a6eeb;
        _0x3cd73d(_0x34b70f);
      });
    }, undefined, () => {
      if (_0x21dfa5 === this.backgroundTextureToken) {
        this.backgroundTextureUrl = "";
        this.bridge.setGroundFillVisible?.(true);
      }
    });
  }
  _stopCharacterAnimation() {
    if (this.characterAnimationFrame != null) {
      globalThis.cancelAnimationFrame?.(this.characterAnimationFrame);
      this.characterAnimationFrame = null;
    }
    for (const _0x48ba6b of this.adapted?.scene?.objects || []) {
      if (_0x48ba6b.type === "character") {
        this.bridge.clearDraftMannequinBonePose?.(_0x48ba6b.id);
      }
    }
  }
  _syncCharacterAnimation() {
    this._stopCharacterAnimation();
    const _0x58c87a = (this.adapted?.scene?.objects || []).filter(_0x56462 => _0x56462.type === "character" && _0x56462.actionPlaying === true);
    if (_0x58c87a.length === 0 || typeof globalThis.requestAnimationFrame !== "function") {
      return;
    }
    const _0x48ac43 = globalThis.performance?.now?.() || Date.now();
    const _0x145dbe = _0x454ec2 => {
      if (this.disposed) {
        return;
      }
      const _0x110075 = Math.max(0, ((Number(_0x454ec2) || Date.now()) - _0x48ac43) / 1000);
      for (const _0x4069e4 of _0x58c87a) {
        const _0x42f616 = resolveStoryboard3DCharacterPose({
          ..._0x4069e4,
          actionTime: (Number(_0x4069e4.actionTime) || 0) + _0x110075
        });
        const _0x5bd865 = Object.fromEntries(Object.entries(_0x42f616.boneOverrides || {}).map(([_0x2d7755, _0x2323d3]) => [_0x2d7755, quaternionToStoryboard3DEuler(_0x2323d3)]));
        this.bridge.setDraftMannequinBonePose?.(_0x4069e4.id, {
          ...(_0x42f616.baseBones || {}),
          ...(_0x42f616.handRotations || {}),
          ..._0x5bd865
        });
      }
      this.bridge.requestRender?.();
      this.characterAnimationFrame = globalThis.requestAnimationFrame(_0x145dbe);
    };
    this.characterAnimationFrame = globalThis.requestAnimationFrame(_0x145dbe);
  }
  _syncImportedModels() {
    this._clearImportedModels();
    if (!this.importedModelResolver || !this.bridge.scene) {
      return;
    }
    const _0x31dd29 = (this.adapted?.scene?.objects || []).filter(_0x583f3a => _0x583f3a.type === "prop" && _0x583f3a.visible !== false);
    const _0x843390 = new Map();
    _0x31dd29.forEach(_0x3eefc6 => {
      const _0x15b73e = [_0x3eefc6.assetId, _0x3eefc6.tint || "", _0x3eefc6.castShadow !== false ? "cast" : "no-cast", _0x3eefc6.receiveShadow !== false ? "receive" : "no-receive"].join("|");
      if (!_0x843390.has(_0x15b73e)) {
        _0x843390.set(_0x15b73e, []);
      }
      _0x843390.get(_0x15b73e).push(_0x3eefc6);
    });
    const _0x52553a = new Set();
    for (const [_0x351a6a, _0x2c7e62] of _0x843390) {
      if (_0x2c7e62.length < STORYBOARD_3D_INSTANCE_BATCH_MIN_COUNT) {
        continue;
      }
      const _0x7e8186 = this.importedModelResolver(_0x2c7e62[0].assetId);
      const _0x174ef2 = applyImportedNormalizationToTemplate(findStoryboard3DInstancingTemplate(_0x7e8186), _0x7e8186);
      if (!_0x174ef2) {
        continue;
      }
      const _0x276fcd = createStoryboard3DInstanceBatch({
        template: _0x174ef2,
        objects: _0x2c7e62,
        tint: _0x2c7e62[0].tint || "",
        castShadow: _0x2c7e62[0].castShadow !== false,
        receiveShadow: _0x2c7e62[0].receiveShadow !== false
      });
      _0x276fcd.mesh.name = "storyboard3d-instances-" + _0x2c7e62[0].assetId;
      this.bridge.scene.add(_0x276fcd.mesh);
      this.importedInstanceBatches.set(_0x351a6a, _0x276fcd);
      _0x2c7e62.forEach(_0x423af0 => {
        _0x52553a.add(_0x423af0.id);
        this.importedInstanceByObjectId.set(_0x423af0.id, _0x276fcd);
        this._syncImportedInstanceVisual(_0x423af0, _0x276fcd, _0x423af0.transform);
        const _0x1ad6af = this.bridge._cubeMap?.get?.(_0x423af0.id);
        if (_0x1ad6af?.group) {
          _0x1ad6af.group.visible = false;
        }
      });
    }
    for (const _0x248308 of _0x31dd29) {
      if (_0x52553a.has(_0x248308.id)) {
        continue;
      }
      const _0x5e5ea2 = this.importedModelResolver(_0x248308.assetId);
      if (!_0x5e5ea2?.clone) {
        continue;
      }
      const _0x1d9df6 = new a1289_0x47be91.Group();
      _0x1d9df6.name = "storyboard3d-imported-" + _0x248308.id;
      _0x1d9df6.userData = {
        ...(_0x1d9df6.userData || {}),
        storyboardObjectId: _0x248308.id
      };
      _0x1d9df6.add(createImportedModelNormalizationRoot(_0x5e5ea2));
      const _0x61b74d = [];
      _0x1d9df6.traverse?.(_0x1c227b => {
        if (!_0x1c227b?.isMesh) {
          return;
        }
        _0x1c227b.castShadow = _0x248308.castShadow !== false;
        _0x1c227b.receiveShadow = _0x248308.receiveShadow !== false;
        if (!_0x248308.tint || !_0x1c227b.material) {
          return;
        }
        const _0x33b8ec = Array.isArray(_0x1c227b.material) ? _0x1c227b.material : [_0x1c227b.material];
        const _0x812846 = _0x33b8ec.map(_0x2cebb3 => {
          const _0x23bc26 = _0x2cebb3?.clone?.() || _0x2cebb3;
          if (_0x23bc26 !== _0x2cebb3) {
            _0x61b74d.push(_0x23bc26);
          }
          _0x23bc26?.color?.set?.(_0x248308.tint);
          return _0x23bc26;
        });
        _0x1c227b.material = Array.isArray(_0x1c227b.material) ? _0x812846 : _0x812846[0];
      });
      _0x1d9df6.userData.storyboardOwnedMaterials = _0x61b74d;
      this._applyImportedModelTransform(_0x1d9df6, _0x248308.transform);
      this.bridge.scene.add(_0x1d9df6);
      this.importedModelRoots.set(_0x248308.id, _0x1d9df6);
      this.bridge.setObjectVisualOverride?.("cube", _0x248308.id, {
        group: _0x1d9df6
      });
      const _0x4353e2 = this.bridge._cubeMap?.get?.(_0x248308.id);
      if (_0x4353e2?.group) {
        _0x4353e2.group.visible = false;
      }
    }
    this.bridge.requestRender?.();
  }
  _syncImportedInstanceVisual(_0x305062, _0x4f03b9, _0x5d618d) {
    const _0x2f2c47 = _0x4f03b9?.mesh?.geometry;
    if (!_0x305062?.id || !_0x2f2c47 || !_0x4f03b9?.mesh?.getMatrixAt) {
      return;
    }
    _0x2f2c47.computeBoundingBox?.();
    if (!_0x2f2c47.boundingBox || _0x2f2c47.boundingBox.isEmpty()) {
      return;
    }
    let _0x157d69 = this.importedModelVisuals.get(_0x305062.id);
    if (!_0x157d69) {
      _0x157d69 = {
        group: new a1289_0x47be91.Group(),
        boundsBox: new a1289_0x47be91.Box3()
      };
      this.importedModelVisuals.set(_0x305062.id, _0x157d69);
    }
    this._applyImportedModelTransform(_0x157d69.group, _0x5d618d);
    const _0x533a50 = _0x4f03b9.objectIds.indexOf(_0x305062.id);
    if (_0x533a50 < 0) {
      return;
    }
    const _0x51945d = new a1289_0x47be91.Matrix4();
    _0x4f03b9.mesh.getMatrixAt(_0x533a50, _0x51945d);
    _0x4f03b9.mesh.updateMatrixWorld?.(true);
    const _0x95b649 = _0x4f03b9.mesh.matrixWorld.clone().multiply(_0x51945d);
    _0x157d69.boundsBox.copy(_0x2f2c47.boundingBox).applyMatrix4(_0x95b649);
    this.bridge.setObjectVisualOverride?.("cube", _0x305062.id, _0x157d69);
  }
  _pickImportedModel(_0xa566d9, _0x392a4a) {
    if (this.importedModelRoots.size === 0 && this.importedInstanceBatches.size === 0 && this.lightRoots.size === 0) {
      return null;
    }
    if (!this.bridge.camera) {
      return null;
    }
    const _0x23e72a = this.bridge.renderer?.domElement?.getBoundingClientRect?.() || this.container?.getBoundingClientRect?.();
    if (!_0x23e72a?.width || !_0x23e72a?.height) {
      return null;
    }
    const _0x587fa6 = new a1289_0x47be91.Raycaster();
    _0x587fa6.setFromCamera({
      x: (_0xa566d9 - _0x23e72a.left) / _0x23e72a.width * 2 - 1,
      y: -((_0x392a4a - _0x23e72a.top) / _0x23e72a.height) * 2 + 1
    }, this.bridge.camera);
    let _0x598b29 = null;
    for (const [_0x20812d, _0x110a78] of [...this.importedModelRoots, ...this.lightRoots]) {
      const _0x4656e5 = _0x587fa6.intersectObject(_0x110a78, true)[0];
      if (_0x4656e5 && (!_0x598b29 || _0x4656e5.distance < _0x598b29.distance)) {
        _0x598b29 = {
          ..._0x4656e5,
          objectId: _0x20812d
        };
      }
    }
    for (const _0x1773b2 of this.importedInstanceBatches.values()) {
      const _0x2c2f76 = _0x587fa6.intersectObject(_0x1773b2.mesh, false)[0];
      const _0x4850ab = Number.isInteger(_0x2c2f76?.instanceId) ? _0x1773b2.objectIds[_0x2c2f76.instanceId] : null;
      if (_0x4850ab && (!_0x598b29 || _0x2c2f76.distance < _0x598b29.distance)) {
        _0x598b29 = {
          ..._0x2c2f76,
          objectId: _0x4850ab
        };
      }
    }
    if (_0x598b29) {
      return {
        objectType: "cube",
        objectId: _0x598b29.objectId,
        point: _0x598b29.point,
        distance: _0x598b29.distance
      };
    } else {
      return null;
    }
  }
  _syncInteractionState(_0x48d374) {
    if (!this.adapted) {
      return this.sync();
    }
    const _0x3a3b59 = TRANSFORM_TOOLS.has(this.activeTool) ? this.activeTool : "move";
    this.adapted = {
      ...this.adapted,
      state: {
        ...this.adapted.state,
        selection: createSelection(this.adapted.scene, this.selectedObjectIds, this.activeTool),
        ui: {
          ...this.adapted.state.ui,
          transformTool: _0x3a3b59,
          activeTool: _0x3a3b59
        }
      }
    };
    this.bridge.sync(this.adapted.state);
    this._notifyVisualChange(_0x48d374);
    return this.getSnapshot();
  }
  setSelection(_0x2580ba) {
    this.selectedObjectIds = Array.isArray(_0x2580ba) ? [..._0x2580ba] : [];
    return this._syncInteractionState("set-selection");
  }
  setActiveTool(_0x443773) {
    this.activeTool = _0x443773;
    return this._syncInteractionState("set-active-tool");
  }
  pick(_0x31a6bc, _0x1412a3) {
    const _0x46546b = this._pickImportedModel(_0x31a6bc, _0x1412a3);
    const _0x2e5675 = this.bridge.pick?.(_0x31a6bc, _0x1412a3) || null;
    const _0x339edd = _0x2e5675?.point && this.bridge.camera?.position ? this.bridge.camera.position.distanceTo?.(_0x2e5675.point) : Number.POSITIVE_INFINITY;
    const _0xa5c41f = _0x46546b && _0x46546b.distance <= _0x339edd ? _0x46546b : _0x2e5675 || _0x46546b;
    if (!_0xa5c41f) {
      return null;
    }
    const _0xcf11f1 = this.adapted?.scene?.objects?.find(_0x34b383 => _0x34b383.id === _0xa5c41f.objectId);
    if (!_0xcf11f1 || _0xcf11f1.visible === false || _0xcf11f1.locked === true) {
      return null;
    }
    return {
      ..._0xa5c41f,
      storyboardObjectId: _0xcf11f1.id,
      storyboardObjectType: _0xcf11f1.type
    };
  }
  pickObjectsInRect(_0x1c8e53) {
    const _0x337fde = this.bridge.pickObjectsInRect?.(_0x1c8e53) || [];
    const _0x5c0c5c = new Set((this.adapted?.scene?.objects || []).filter(_0x48dff3 => _0x48dff3.visible !== false && _0x48dff3.locked !== true).map(_0x11fd65 => _0x11fd65.id));
    return _0x337fde.filter(_0xfc1fbb => _0x5c0c5c.has(_0xfc1fbb.objectId));
  }
  resolveDollyAnchor(_0x968bd0, _0x28bec1) {
    return this.bridge.resolveDollyAnchor?.(_0x968bd0, _0x28bec1) || null;
  }
  resolveGroundPosition(_0x5e2248, _0x325de7, _0xe32fa4 = 0) {
    const _0x42c262 = this.bridge.camera;
    const _0x283b0d = this.bridge.renderer?.domElement?.getBoundingClientRect?.() || this.container?.getBoundingClientRect?.();
    if (!_0x42c262 || !_0x283b0d?.width || !_0x283b0d?.height) {
      return null;
    }
    _0x42c262.updateMatrixWorld?.();
    const _0x4ddf78 = new a1289_0x47be91.Raycaster();
    _0x4ddf78.setFromCamera({
      x: (finiteNumber(_0x5e2248) - _0x283b0d.left) / _0x283b0d.width * 2 - 1,
      y: -((finiteNumber(_0x325de7) - _0x283b0d.top) / _0x283b0d.height) * 2 + 1
    }, _0x42c262);
    const _0x3e9e4b = new a1289_0x47be91.Vector3();
    const _0x33bca8 = new a1289_0x47be91.Plane(new a1289_0x47be91.Vector3(0, 1, 0), -finiteNumber(_0xe32fa4));
    if (!_0x4ddf78.ray.intersectPlane(_0x33bca8, _0x3e9e4b)) {
      return null;
    }
    if (_0x3e9e4b.distanceTo(_0x42c262.position) > 10000) {
      return null;
    }
    return [_0x3e9e4b.x, finiteNumber(_0xe32fa4), _0x3e9e4b.z];
  }
  resolveViewportGroundPosition(_0x2d2b0d = 0) {
    const _0x36bf94 = this.bridge.renderer?.domElement?.getBoundingClientRect?.() || this.container?.getBoundingClientRect?.();
    if (!_0x36bf94?.width || !_0x36bf94?.height) {
      return null;
    }
    return this.resolveGroundPosition(_0x36bf94.left + _0x36bf94.width / 2, _0x36bf94.top + _0x36bf94.height / 2, _0x2d2b0d);
  }
  resolveObjectGroundPosition(_0xd18b35) {
    const _0xdd26fa = this.adapted?.scene?.objects?.find(_0x4161c8 => _0x4161c8.id === _0xd18b35);
    if (!_0xdd26fa || !getStoryboard3DObjectTransformCapabilities(_0xdd26fa).groundSnap) {
      return null;
    }
    const _0x1565b6 = this.importedModelVisuals.get(_0xdd26fa.id);
    const _0x15192a = this.importedModelRoots.get(_0xdd26fa.id);
    const _0x5e5230 = _0xdd26fa.type === "character" ? this.bridge._mannequinMap?.get?.(_0xdd26fa.id) : this.bridge._cubeMap?.get?.(_0xdd26fa.id);
    let _0x4934f8 = _0x1565b6?.boundsBox?.isBox3 && !_0x1565b6.boundsBox.isEmpty() ? _0x1565b6.boundsBox.clone() : null;
    const _0x41bfb0 = _0x15192a || _0x5e5230?.proxyRoot || _0x5e5230?.group;
    if (!_0x4934f8 && _0x41bfb0) {
      _0x41bfb0.updateMatrixWorld?.(true);
      const _0x4b2815 = new a1289_0x47be91.Box3().setFromObject(_0x41bfb0);
      if (!_0x4b2815.isEmpty()) {
        _0x4934f8 = _0x4b2815;
      }
    }
    if (!_0x4934f8 || !Number.isFinite(_0x4934f8.min.y)) {
      return null;
    }
    const _0xb29a77 = finiteNumber(_0xdd26fa.transform?.position?.[1]);
    return _0xb29a77 - _0x4934f8.min.y;
  }
  resolveObjectGroundPositions(_0x33212e) {
    return Object.fromEntries((Array.isArray(_0x33212e) ? _0x33212e : []).map(_0x22c985 => [_0x22c985, this.resolveObjectGroundPosition(_0x22c985)]).filter(([, _0x34883c]) => Number.isFinite(_0x34883c)));
  }
  previewObjectTransform(_0x1a9dc9, _0x4d1c4a) {
    return this.previewObjectTransforms({
      [_0x1a9dc9]: _0x4d1c4a
    });
  }
  previewObjectTransforms(_0x261855 = {}) {
    const _0x189760 = new Set();
    let _0x302eb5 = false;
    Object.entries(_0x261855).forEach(([_0x58346d, _0x45c974]) => {
      const _0x57d40a = this.adapted?.scene?.objects?.find(_0x59920b => _0x59920b.id === _0x58346d);
      const _0x4b75b2 = bridgeObjectType(_0x57d40a);
      const _0x447bc4 = this.importedModelRoots.get(_0x57d40a?.id) || this.lightRoots.get(_0x57d40a?.id);
      const _0x307570 = this.importedInstanceByObjectId.get(_0x57d40a?.id);
      if (!_0x4b75b2 && !_0x447bc4 && !_0x307570 || _0x57d40a?.locked === true) {
        return;
      }
      if (_0x4b75b2) {
        this.bridge.setDraftObjectTransform?.(_0x4b75b2, _0x57d40a.id, transformToBridgePose(_0x45c974));
      }
      if (_0x447bc4) {
        this._applyImportedModelTransform(_0x447bc4, _0x45c974);
      }
      if (_0x307570) {
        updateStoryboard3DInstanceTransform(_0x307570, _0x57d40a.id, _0x45c974, {
          recomputeBounds: false
        });
        _0x189760.add(_0x307570);
        this._syncImportedInstanceVisual(_0x57d40a, _0x307570, _0x45c974);
      }
      _0x302eb5 = true;
    });
    _0x189760.forEach(_0x5d6459 => refreshStoryboard3DInstanceBatchBounds(_0x5d6459));
    if (_0x302eb5) {
      this._notifyVisualChange("preview-object-transform");
    }
    return _0x302eb5;
  }
  clearObjectTransformPreview(_0x8be3fb) {
    const _0x4c7bce = this.adapted?.scene?.objects?.find(_0x230bf9 => _0x230bf9.id === _0x8be3fb);
    const _0x495b21 = bridgeObjectType(_0x4c7bce);
    const _0x193837 = this.importedModelRoots.get(_0x4c7bce?.id) || this.lightRoots.get(_0x4c7bce?.id);
    const _0x4d3cbe = this.importedInstanceByObjectId.get(_0x4c7bce?.id);
    if (!_0x495b21 && !_0x193837 && !_0x4d3cbe) {
      return false;
    }
    if (_0x495b21) {
      this.bridge.clearDraftObjectTransform?.(_0x495b21, _0x4c7bce.id);
    }
    if (_0x193837) {
      this._applyImportedModelTransform(_0x193837, _0x4c7bce.transform);
    }
    if (_0x4d3cbe) {
      updateStoryboard3DInstanceTransform(_0x4d3cbe, _0x4c7bce.id, _0x4c7bce.transform);
      this._syncImportedInstanceVisual(_0x4c7bce, _0x4d3cbe, _0x4c7bce.transform);
    }
    this._notifyVisualChange("clear-object-transform-preview");
    return true;
  }
  clearPreviews() {
    this.bridge.clearAllDrafts?.();
    if (this.backgroundCameraLockApplied) {
      this._syncBackgroundCameraLock();
    }
    const _0x56c9ae = new Set();
    for (const _0x58c441 of this.adapted?.scene?.objects || []) {
      const _0x1b6182 = this.importedModelRoots.get(_0x58c441.id);
      if (_0x1b6182) {
        this._applyImportedModelTransform(_0x1b6182, _0x58c441.transform);
      }
      const _0x422cd0 = this.lightRoots.get(_0x58c441.id);
      if (_0x422cd0) {
        this._applyImportedModelTransform(_0x422cd0, _0x58c441.transform);
      }
      const _0x2bf05c = this.importedInstanceByObjectId.get(_0x58c441.id);
      if (_0x2bf05c) {
        updateStoryboard3DInstanceTransform(_0x2bf05c, _0x58c441.id, _0x58c441.transform, {
          recomputeBounds: false
        });
        _0x56c9ae.add(_0x2bf05c);
        this._syncImportedInstanceVisual(_0x58c441, _0x2bf05c, _0x58c441.transform);
      }
    }
    _0x56c9ae.forEach(_0x55edb5 => refreshStoryboard3DInstanceBatchBounds(_0x55edb5));
    this._notifyVisualChange("clear-previews");
  }
  getMiniMapFootprints() {
    const _0x24103e = (this.adapted?.scene?.objects || []).filter(_0x68e68e => _0x68e68e?.visible !== false && ["prop", "character", "light"].includes(_0x68e68e?.type));
    return _0x24103e.map(_0x298e7b => {
      const _0x40bf07 = this.importedInstanceByObjectId.get(_0x298e7b.id);
      const _0x18a6c4 = this.importedModelRoots.get(_0x298e7b.id) || this.lightRoots.get(_0x298e7b.id);
      const _0x141f90 = _0x298e7b.type === "character" ? this.bridge._mannequinMap?.get?.(_0x298e7b.id) : this.bridge._cubeMap?.get?.(_0x298e7b.id);
      let _0x4adaff = _0x40bf07 ? collectInstanceTopViewFootprint(_0x40bf07, _0x298e7b.id) : collectObjectTopViewFootprint(_0x18a6c4 || _0x141f90?.group);
      if (_0x4adaff.length < 3) {
        _0x4adaff = createFallbackTopViewFootprint(_0x298e7b);
      }
      return {
        objectId: _0x298e7b.id,
        objectType: _0x298e7b.type,
        points: _0x4adaff
      };
    });
  }
  pickGizmoHandle(_0x1c0b0c, _0x21c42f) {
    return this.bridge.pickGizmoHandle?.(_0x1c0b0c, _0x21c42f) || null;
  }
  beginGizmoDrag({
    handleKey: _0x4023b6,
    clientX: _0x2483f0,
    clientY: _0x3ee81c
  } = {}) {
    if (this.activeTool === "rotate") {
      return this.bridge.beginRotateGizmoDrag?.({
        handleKey: _0x4023b6,
        clientX: _0x2483f0,
        clientY: _0x3ee81c
      }) || null;
    }
    if (this.activeTool === "scale") {
      return this.bridge.beginScaleGizmoDrag?.({
        handleKey: _0x4023b6,
        clientX: _0x2483f0,
        clientY: _0x3ee81c
      }) || null;
    }
    return this.bridge.beginMoveGizmoDrag?.({
      handleKey: _0x4023b6,
      clientX: _0x2483f0,
      clientY: _0x3ee81c
    }) || null;
  }
  sampleGizmoDragPoint(_0x55bf05, _0x1164f8, _0x502f8d) {
    return this.bridge.sampleMoveGizmoDragPoint?.(_0x55bf05, _0x1164f8, _0x502f8d) || null;
  }
  computeGizmoDragValue(_0x37ff31, _0x20707b) {
    if (_0x37ff31?.mode === "rotate") {
      return this.bridge.computeRotateGizmoAngle?.(_0x37ff31, _0x20707b) ?? 0;
    }
    if (String(_0x37ff31?.mode || "").startsWith("scale")) {
      return this.bridge.computeScaleGizmoFactor?.(_0x37ff31, _0x20707b) ?? 1;
    }
    return this.bridge.computeMoveGizmoDelta?.(_0x37ff31, _0x20707b) || null;
  }
  clearGizmoState() {
    this.bridge.clearGizmoHandleState?.();
    this.bridge.clearGizmoMoveGuideLine?.();
  }
  setGizmoHoverHandle(_0x3962b8) {
    this.bridge.setGizmoHoverHandle?.(_0x3962b8 || null);
  }
  setGizmoActiveHandle(_0x1a820b) {
    this.bridge.setGizmoActiveHandle?.(_0x1a820b || null);
  }
  setGizmoMoveGuideLine(_0x53149b) {
    if (_0x53149b) {
      this.bridge.setGizmoMoveGuideLine?.(_0x53149b);
    } else {
      this.bridge.clearGizmoMoveGuideLine?.();
    }
  }
  resize(_0x10e05f, _0x32bc74) {
    this.bridge.resize?.(_0x10e05f, _0x32bc74);
    if (this.backgroundCameraLockApplied) {
      this._syncBackgroundCameraLock();
    }
  }
  renderNow() {
    this.bridge.renderNow?.();
  }
  setViewProjection(_0x42258 = "perspective", _0x5b260c = null) {
    const _0x4cfb1a = _0x42258 === "orthographic" ? "orthographic" : "perspective";
    const _0xcccd2 = _0x4cfb1a === "orthographic" && _0x5b260c ? structuredClone(_0x5b260c) : null;
    this.viewProjection = {
      type: _0x4cfb1a,
      options: _0xcccd2
    };
    this.bridge.setViewProjection?.({
      type: _0x4cfb1a,
      ...(_0xcccd2 || {})
    });
    return this.getViewProjection();
  }
  getViewProjection() {
    return {
      type: this.viewProjection.type,
      options: this.viewProjection.options ? structuredClone(this.viewProjection.options) : null
    };
  }
  getSceneView() {
    if (this.adapted?.state?.viewport?.sceneView) {
      return structuredClone(this.adapted.state.viewport.sceneView);
    } else {
      return null;
    }
  }
  setViewportUIPatch(_0x169052 = {}) {
    this.viewportUIPatch = {
      ...this.viewportUIPatch,
      ..._0x169052
    };
    if (!this.adapted) {
      return false;
    }
    this.adapted.state.ui = {
      ...this.adapted.state.ui,
      ...this.viewportUIPatch
    };
    this.bridge.sync(this.adapted.state);
    this._syncBackgroundCameraLock();
    this._syncImportedModels();
    this._syncSceneLights();
    this._syncFlatBackground();
    return true;
  }
  previewSceneView(_0x49ed1d) {
    if (!_0x49ed1d) {
      return false;
    }
    this.bridge.setDraftView?.({
      kind: "scene-default",
      sceneView: structuredClone(_0x49ed1d),
      disableSmoothing: true
    });
    return true;
  }
  setViewportFocalLength(_0xa727ab) {
    if (!this.adapted) {
      return false;
    }
    const _0x2e21d5 = clampSceneFocalLength(_0xa727ab);
    this.viewportFocalLengthOverride = _0x2e21d5;
    this.bridge.setDefaultSceneFocalLength?.(_0x2e21d5);
    const _0x446960 = this.getSceneView();
    if (_0x446960) {
      this.previewSceneView(_0x446960);
    }
    return true;
  }
  getViewportFocalLength() {
    if (!this.adapted) {
      return null;
    }
    return clampSceneFocalLength(this.viewportFocalLengthOverride ?? this.adapted.focalLength);
  }
  getViewportFov() {
    const _0x48ed38 = this.getViewportFocalLength();
    if (_0x48ed38 == null) {
      return null;
    } else {
      return focalLengthToFov(_0x48ed38);
    }
  }
  previewCamera(_0x371895) {
    if (!_0x371895) {
      return false;
    }
    const _0xcf49b = vectorFromArray(_0x371895.position, {
      x: 5,
      y: 4,
      z: 7
    });
    const _0x5a87d2 = vectorFromArray(_0x371895.target, {
      x: 0,
      y: 1.2,
      z: 0
    });
    const _0x8c20ae = new a1289_0x47be91.Vector3(_0xcf49b.x, _0xcf49b.y, _0xcf49b.z);
    const _0x159f47 = new a1289_0x47be91.Vector3(_0x5a87d2.x, _0x5a87d2.y, _0x5a87d2.z);
    const _0xa0c192 = new a1289_0x47be91.Matrix4().lookAt(_0x8c20ae, _0x159f47, new a1289_0x47be91.Vector3(0, 1, 0));
    const _0x5cd11e = new a1289_0x47be91.Quaternion().setFromRotationMatrix(_0xa0c192).normalize();
    const _0x19374c = finiteNumber(_0x371895.roll, 0);
    if (Math.abs(_0x19374c) > 1e-8) {
      _0x5cd11e.multiply(new a1289_0x47be91.Quaternion().setFromAxisAngle(new a1289_0x47be91.Vector3(0, 0, 1), _0x19374c)).normalize();
    }
    const _0x2f95e1 = new a1289_0x47be91.Euler().setFromQuaternion(_0x5cd11e, "YXZ");
    this.bridge.setDraftView?.({
      kind: "camera",
      position: {
        x: _0x8c20ae.x,
        y: _0x8c20ae.y,
        z: _0x8c20ae.z
      },
      target: {
        x: _0x159f47.x,
        y: _0x159f47.y,
        z: _0x159f47.z
      },
      quaternion: {
        x: _0x5cd11e.x,
        y: _0x5cd11e.y,
        z: _0x5cd11e.z,
        w: _0x5cd11e.w
      },
      rotation: {
        x: _0x2f95e1.x,
        y: _0x2f95e1.y,
        z: _0x2f95e1.z
      },
      fov: Number.isFinite(Number(_0x371895.fov)) ? Number(_0x371895.fov) : focalLengthToFov(_0x371895.focalLength),
      disableSmoothing: true
    });
    return true;
  }
  commitSceneView(_0x24f667) {
    if (!_0x24f667 || !this.adapted?.scene?.id) {
      return false;
    }
    const _0x3f9885 = structuredClone(_0x24f667);
    this.viewOverrides.set(this.adapted.scene.id, _0x3f9885);
    this.adapted.state.viewport.sceneView = structuredClone(_0x3f9885);
    this.bridge.sync(this.adapted.state);
    this._syncBackgroundCameraLock();
    this._syncImportedModels();
    this._syncSceneLights();
    this._syncFlatBackground();
    this.bridge.clearDraftView?.();
    return true;
  }
  readCurrentCamera() {
    return this.bridge.readCurrentViewPose?.() || null;
  }
  captureBlob(_0x24df4a) {
    return this.bridge.captureBlob?.(_0x24df4a);
  }
  getSnapshot() {
    if (this.adapted) {
      return {
        sceneId: this.adapted.scene.id,
        activeShotId: this.adapted.activeShot?.id || null,
        selectedObjectIds: this.adapted.state.selection.selectedObjects.map(_0x9f943b => _0x9f943b.objectId),
        activeTool: this.activeTool,
        projection: this.getViewProjection(),
        unsupportedObjectIds: [...this.adapted.unsupportedObjectIds]
      };
    } else {
      return null;
    }
  }
  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this._clearImportedModels();
    this._clearSceneLights();
    this.backgroundTextureToken += 1;
    this.backgroundTexture?.dispose?.();
    this.backgroundTexture = null;
    this._stopCharacterAnimation();
    this.viewOverrides.clear();
    this.bridge.dispose?.();
    this.adapted = null;
    this.project = null;
  }
}
export function createStoryboard3DSceneRuntime(_0x5aac08) {
  return new Storyboard3DSceneRuntime(_0x5aac08);
}