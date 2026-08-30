import a1092_0x1bb930 from "../../core/stores/appStore.js";
import { findAvailablePosition, generateId } from "../../core/math.js";
import { clampPanoramaPitch, SCENE_DEFAULT_FOCAL_LENGTH_MM, cameraPoseToPanoramaView, cameraPoseToSceneViewFromReference, clampSceneFocalLength, computeGridPlacement, computePerspectiveFrameDistance, resolveBatchPlacementOrigin, resolveObjectPlacementPoint } from "../../core/panoramaSceneMath.js";
import { buildSourceMediaNodePayload } from "../../services/fileService.js";
import { createFastImagePreview } from "../../services/fastImagePreviewService.js";
import { buildImageNodeStorageFields } from "../../services/imageDerivativeService.js";
import { resolveOutputMediaSize } from "../../services/mediaRatioService.js";
import { ensurePersistedPanoramaInputPng } from "../../services/panoramaInputImageService.js";
import { uploadFile, saveOutputBlob } from "../../services/projectService.js";
import { showError, showSuccess, showWarning } from "../../services/toastService.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { t } from "../../i18n/index.js";
import { commit } from "../history.js";
import { resolveImageNodeDisplayUrl, resolveImageNodeOriginalUrl } from "../imageNodeImageUrl.js";
import { calcSafeSpawnPosNearNode } from "../nodeSpawn.js";
import { PANORAMA_SCENE_CAMERA_LIMIT, PANORAMA_SCENE_COLLAPSED_MAX_SIZE, PANORAMA_SCENE_DEFAULT_SIZE, createDefaultPanoramaView, createDefaultSceneView, getPanoramaStateFieldByNodeType, isPanorama360NodeType, normalizePanorama360State, normalizePanoramaSceneState, normalizeSceneOnlyPanoramaSceneState } from "./sceneNode.js";
import { normalizeCameraTimeline, removeCameraKeyframe, updateCameraTimelineSettings, upsertCameraKeyframe } from "./cameraTimeline.js";
import { estimateSceneAssetBoundingRadius, resolveSceneAsset } from "./sceneAssetCatalog.js";
import { DEFAULT_MANNEQUIN_POSE_ID, createCustomMannequinPose, normalizeBonePose, normalizeCustomMannequinPose, resolveMannequinPose } from "./poseCatalog.js";
function panoramaSceneText(_0x2e8e23, _0x523532 = {}) {
  return t("panoramaSceneNode." + _0x2e8e23, _0x523532);
}
function getStoreNode(_0x5cdd61, _0x1078df) {
  return _0x5cdd61?.getStateRaw?.().nodes?.[_0x1078df] || null;
}
function normalizeSceneStateByNode(_0x5e6a04, _0x2a3e66) {
  if (isPanorama360NodeType(_0x5e6a04?.type)) {
    return normalizePanorama360State(_0x2a3e66);
  }
  return normalizeSceneOnlyPanoramaSceneState(_0x2a3e66);
}
const EQUIRECTANGULAR_RATIO = 2;
const EQUIRECTANGULAR_RATIO_TOLERANCE = 0.02;
const MANNEQUIN_FORWARD_PLACEMENT_DISTANCE = 3.2;
const CUBE_FORWARD_PLACEMENT_DISTANCE = 3;
const _panorama360SyncVersionByNodeId = new Map();
const _panorama360SyncInflightByNodeId = new Map();
function isNearEquirectangularRatio(_0x2984d0) {
  const _0x27fa9a = Number(_0x2984d0?.width);
  const _0x38a72b = Number(_0x2984d0?.height);
  if (!Number.isFinite(_0x27fa9a) || !Number.isFinite(_0x38a72b) || _0x27fa9a <= 0 || _0x38a72b <= 0) {
    return true;
  }
  const _0x551dd1 = _0x27fa9a / _0x38a72b;
  return Math.abs(_0x551dd1 - EQUIRECTANGULAR_RATIO) <= EQUIRECTANGULAR_RATIO_TOLERANCE;
}
function getSceneState(_0x58fb77, _0x3619ea) {
  const _0x1dc5f2 = getStoreNode(_0x58fb77, _0x3619ea);
  if (!_0x1dc5f2) {
    return normalizeSceneOnlyPanoramaSceneState(null);
  }
  const _0x22e8b6 = getPanoramaStateFieldByNodeType(_0x1dc5f2.type);
  return normalizeSceneStateByNode(_0x1dc5f2, _0x22e8b6 ? _0x1dc5f2[_0x22e8b6] : null);
}
function writeSceneState(_0x4f979a, _0x2d5829, _0x82e128) {
  const _0x46a4ac = getStoreNode(_0x4f979a, _0x2d5829);
  if (!_0x46a4ac) {
    return null;
  }
  const _0x3e7f22 = getPanoramaStateFieldByNodeType(_0x46a4ac.type);
  if (!_0x3e7f22) {
    return null;
  }
  const _0x3888e0 = normalizeSceneStateByNode(_0x46a4ac, _0x46a4ac[_0x3e7f22]);
  const _0x1a165c = typeof _0x82e128 === "function" ? _0x82e128(_0x3888e0, _0x46a4ac) : _0x82e128;
  if (!_0x1a165c) {
    return _0x3888e0;
  }
  const _0x3ee132 = normalizeSceneStateByNode(_0x46a4ac, _0x1a165c);
  _0x4f979a.updateNodeData(_0x2d5829, {
    [_0x3e7f22]: _0x3ee132
  });
  return _0x3ee132;
}
function cloneSceneState(_0x3dcf20) {
  return normalizePanoramaSceneState(_0x3dcf20);
}
function pickViewYaw(_0x1871a9) {
  if (Number.isFinite(_0x1871a9?.yaw)) {
    return _0x1871a9.yaw;
  }
  if (Number.isFinite(_0x1871a9?.rotation?.y)) {
    return _0x1871a9.rotation.y;
  }
  return 0;
}
function pickFacingCameraYaw(_0x2695cb) {
  const _0x5d3650 = pickViewYaw(_0x2695cb) + Math.PI;
  return Math.atan2(Math.sin(_0x5d3650), Math.cos(_0x5d3650));
}
function sanitizeObjectPose(_0x59b1d0 = {}) {
  const _0x8bec5a = {
    x: Number.isFinite(_0x59b1d0?.rotation?.x) ? _0x59b1d0.rotation.x : 0,
    y: Number.isFinite(_0x59b1d0?.rotation?.y) ? _0x59b1d0.rotation.y : 0,
    z: Number.isFinite(_0x59b1d0?.rotation?.z) ? _0x59b1d0.rotation.z : 0
  };
  const _0x24d2ae = Number.isFinite(Number(_0x59b1d0?.quaternion?.x)) && Number.isFinite(Number(_0x59b1d0?.quaternion?.y)) && Number.isFinite(Number(_0x59b1d0?.quaternion?.z)) && Number.isFinite(Number(_0x59b1d0?.quaternion?.w));
  const _0x5a8350 = _0x24d2ae ? normalizeQuaternion(_0x59b1d0.quaternion, quaternionFromEulerXYZ(_0x8bec5a)) : null;
  const _0x54f3d2 = _0x24d2ae ? eulerFromQuaternionXYZ(_0x5a8350) : _0x8bec5a;
  const _0xe7b47d = Number.isFinite(_0x59b1d0?.scale) ? Math.max(0.01, Number(_0x59b1d0.scale) || 1) : _0x59b1d0?.scale && Number.isFinite(_0x59b1d0.scale.x) && Number.isFinite(_0x59b1d0.scale.y) && Number.isFinite(_0x59b1d0.scale.z) ? {
    x: Math.max(0.01, Number(_0x59b1d0.scale.x) || 1),
    y: Math.max(0.01, Number(_0x59b1d0.scale.y) || 1),
    z: Math.max(0.01, Number(_0x59b1d0.scale.z) || 1)
  } : null;
  return {
    position: {
      x: Number.isFinite(_0x59b1d0?.position?.x) ? _0x59b1d0.position.x : 0,
      y: Number.isFinite(_0x59b1d0?.position?.y) ? _0x59b1d0.position.y : 0,
      z: Number.isFinite(_0x59b1d0?.position?.z) ? _0x59b1d0.position.z : 0
    },
    rotation: _0x54f3d2,
    quaternion: _0x5a8350,
    fov: Number.isFinite(_0x59b1d0?.fov) ? _0x59b1d0.fov : 58,
    scale: _0xe7b47d
  };
}
function normalizeQuaternion(_0x219528, _0x4554a3 = {
  x: 0,
  y: 0,
  z: 0,
  w: 1
}) {
  const _0x586797 = Number(_0x219528?.x);
  const _0x5dc11e = Number(_0x219528?.y);
  const _0x2425c9 = Number(_0x219528?.z);
  const _0x2b6d7c = Number(_0x219528?.w);
  if (!Number.isFinite(_0x586797) || !Number.isFinite(_0x5dc11e) || !Number.isFinite(_0x2425c9) || !Number.isFinite(_0x2b6d7c)) {
    return {
      ..._0x4554a3
    };
  }
  const _0x2b1967 = Math.hypot(_0x586797, _0x5dc11e, _0x2425c9, _0x2b6d7c);
  if (_0x2b1967 < 0.000001) {
    return {
      ..._0x4554a3
    };
  }
  return {
    x: _0x586797 / _0x2b1967,
    y: _0x5dc11e / _0x2b1967,
    z: _0x2425c9 / _0x2b1967,
    w: _0x2b6d7c / _0x2b1967
  };
}
function quaternionFromEulerYXZ(_0x412973) {
  const _0x444c8b = Number(_0x412973?.x) || 0;
  const _0x2e6b06 = Number(_0x412973?.y) || 0;
  const _0x42429e = Number(_0x412973?.z) || 0;
  const _0x587d33 = Math.cos(_0x444c8b / 2);
  const _0x4fb69a = Math.cos(_0x2e6b06 / 2);
  const _0x3aa889 = Math.cos(_0x42429e / 2);
  const _0x293f0e = Math.sin(_0x444c8b / 2);
  const _0x4efe67 = Math.sin(_0x2e6b06 / 2);
  const _0xa9eb28 = Math.sin(_0x42429e / 2);
  return normalizeQuaternion({
    x: _0x293f0e * _0x4fb69a * _0x3aa889 + _0x587d33 * _0x4efe67 * _0xa9eb28,
    y: _0x587d33 * _0x4efe67 * _0x3aa889 - _0x293f0e * _0x4fb69a * _0xa9eb28,
    z: _0x587d33 * _0x4fb69a * _0xa9eb28 - _0x293f0e * _0x4efe67 * _0x3aa889,
    w: _0x587d33 * _0x4fb69a * _0x3aa889 + _0x293f0e * _0x4efe67 * _0xa9eb28
  });
}
function eulerFromQuaternionYXZ(_0x411f68) {
  const _0x3369b7 = normalizeQuaternion(_0x411f68);
  const _0x384f2f = _0x3369b7.x * _0x3369b7.x;
  const _0x258375 = _0x3369b7.y * _0x3369b7.y;
  const _0x300a4f = _0x3369b7.z * _0x3369b7.z;
  const _0x35b493 = _0x3369b7.x * _0x3369b7.y;
  const _0x15facf = _0x3369b7.x * _0x3369b7.z;
  const _0x26ecde = _0x3369b7.y * _0x3369b7.z;
  const _0x404379 = _0x3369b7.x * _0x3369b7.w;
  const _0x13e809 = _0x3369b7.y * _0x3369b7.w;
  const _0xb74189 = _0x3369b7.z * _0x3369b7.w;
  const _0x5c6134 = 1 - (_0x258375 + _0x300a4f) * 2;
  const _0x5d44c0 = (_0x15facf + _0x13e809) * 2;
  const _0x1cacbd = (_0x35b493 + _0xb74189) * 2;
  const _0x4175d1 = 1 - (_0x384f2f + _0x300a4f) * 2;
  const _0xbef8cf = (_0x26ecde - _0x404379) * 2;
  const _0x220c6c = (_0x15facf - _0x13e809) * 2;
  const _0x14cf1a = 1 - (_0x384f2f + _0x258375) * 2;
  const _0x3c5fd6 = Math.asin(-clamp(_0xbef8cf, -1, 1));
  if (Math.abs(_0xbef8cf) < 0.9999999) {
    return {
      x: _0x3c5fd6,
      y: Math.atan2(_0x5d44c0, _0x14cf1a),
      z: Math.atan2(_0x1cacbd, _0x4175d1)
    };
  }
  return {
    x: _0x3c5fd6,
    y: Math.atan2(-_0x220c6c, _0x5c6134),
    z: 0
  };
}
function quaternionFromEulerXYZ(_0x5bd27b) {
  const _0x18ed21 = Number(_0x5bd27b?.x) || 0;
  const _0x294fb6 = Number(_0x5bd27b?.y) || 0;
  const _0x55c2aa = Number(_0x5bd27b?.z) || 0;
  const _0x53ae62 = Math.cos(_0x18ed21 / 2);
  const _0x2f921a = Math.cos(_0x294fb6 / 2);
  const _0x5bca3d = Math.cos(_0x55c2aa / 2);
  const _0x499b08 = Math.sin(_0x18ed21 / 2);
  const _0xcf5ca9 = Math.sin(_0x294fb6 / 2);
  const _0x23975b = Math.sin(_0x55c2aa / 2);
  return normalizeQuaternion({
    x: _0x499b08 * _0x2f921a * _0x5bca3d + _0x53ae62 * _0xcf5ca9 * _0x23975b,
    y: _0x53ae62 * _0xcf5ca9 * _0x5bca3d - _0x499b08 * _0x2f921a * _0x23975b,
    z: _0x53ae62 * _0x2f921a * _0x23975b + _0x499b08 * _0xcf5ca9 * _0x5bca3d,
    w: _0x53ae62 * _0x2f921a * _0x5bca3d - _0x499b08 * _0xcf5ca9 * _0x23975b
  });
}
function eulerFromQuaternionXYZ(_0x4db8e7) {
  const _0x16b05b = normalizeQuaternion(_0x4db8e7);
  const _0x11fc35 = _0x16b05b.x * _0x16b05b.x;
  const _0x3ed1cb = _0x16b05b.y * _0x16b05b.y;
  const _0x5040c0 = _0x16b05b.z * _0x16b05b.z;
  const _0x58ce62 = _0x16b05b.x * _0x16b05b.y;
  const _0x18efa8 = _0x16b05b.x * _0x16b05b.z;
  const _0x2b70cd = _0x16b05b.y * _0x16b05b.z;
  const _0x3fb881 = _0x16b05b.x * _0x16b05b.w;
  const _0x15586e = _0x16b05b.y * _0x16b05b.w;
  const _0x34bc2d = _0x16b05b.z * _0x16b05b.w;
  const _0x5bf277 = 1 - (_0x3ed1cb + _0x5040c0) * 2;
  const _0x4aa80f = (_0x58ce62 - _0x34bc2d) * 2;
  const _0x360047 = (_0x18efa8 + _0x15586e) * 2;
  const _0x21ea7e = (_0x2b70cd - _0x3fb881) * 2;
  const _0x4fbba9 = 1 - (_0x11fc35 + _0x3ed1cb) * 2;
  const _0x592292 = (_0x2b70cd + _0x3fb881) * 2;
  const _0x5db8ad = 1 - (_0x11fc35 + _0x5040c0) * 2;
  const _0x86d921 = Math.asin(clamp(_0x360047, -1, 1));
  if (Math.abs(_0x360047) < 0.9999999) {
    return {
      x: Math.atan2(-_0x21ea7e, _0x4fbba9),
      y: _0x86d921,
      z: Math.atan2(-_0x4aa80f, _0x5bf277)
    };
  }
  return {
    x: Math.atan2(_0x592292, _0x5db8ad),
    y: _0x86d921,
    z: 0
  };
}
function sanitizeCameraPose(_0x499fcd = {}) {
  const _0xecaf95 = {
    x: Number.isFinite(_0x499fcd?.position?.x) ? _0x499fcd.position.x : 0,
    y: Number.isFinite(_0x499fcd?.position?.y) ? _0x499fcd.position.y : 0,
    z: Number.isFinite(_0x499fcd?.position?.z) ? _0x499fcd.position.z : 0
  };
  const _0x4dbd2c = {
    x: Number.isFinite(_0x499fcd?.rotation?.x) ? _0x499fcd.rotation.x : 0,
    y: Number.isFinite(_0x499fcd?.rotation?.y) ? _0x499fcd.rotation.y : 0,
    z: Number.isFinite(_0x499fcd?.rotation?.z) ? _0x499fcd.rotation.z : 0
  };
  const _0x4bf4ff = Number.isFinite(Number(_0x499fcd?.quaternion?.x)) && Number.isFinite(Number(_0x499fcd?.quaternion?.y)) && Number.isFinite(Number(_0x499fcd?.quaternion?.z)) && Number.isFinite(Number(_0x499fcd?.quaternion?.w));
  const _0x1d4138 = _0x4bf4ff ? normalizeQuaternion(_0x499fcd.quaternion, quaternionFromEulerYXZ(_0x4dbd2c)) : quaternionFromEulerYXZ(_0x4dbd2c);
  const _0x4cdc48 = _0x4bf4ff ? eulerFromQuaternionYXZ(_0x1d4138) : _0x4dbd2c;
  return {
    position: _0xecaf95,
    rotation: _0x4cdc48,
    quaternion: _0x1d4138,
    focalLength: Object.prototype.hasOwnProperty.call(_0x499fcd || {}, "focalLength") ? clampSceneFocalLength(_0x499fcd.focalLength) : Object.prototype.hasOwnProperty.call(_0x499fcd || {}, "fov") ? SCENE_DEFAULT_FOCAL_LENGTH_MM : SCENE_DEFAULT_FOCAL_LENGTH_MM
  };
}
function normalizeCameraSlot(_0x4547e4) {
  const _0x33b283 = Number(_0x4547e4);
  if (!Number.isInteger(_0x33b283)) {
    return null;
  }
  if (_0x33b283 < 1 || _0x33b283 > PANORAMA_SCENE_CAMERA_LIMIT) {
    return null;
  }
  return _0x33b283;
}
function toCameraSlotLabel(_0xc9f45d) {
  return String(Number(_0xc9f45d) || 1);
}
function resolveCameraSlotEntries(_0x2a417c = []) {
  const _0x3a4767 = Array.isArray(_0x2a417c) ? _0x2a417c : [];
  const _0x5056be = new Set();
  const _0x1a7045 = [];
  _0x3a4767.forEach(_0xa090a8 => {
    const _0x496b1d = normalizeCameraSlot(_0xa090a8?.slot);
    if (!_0x496b1d || _0x5056be.has(_0x496b1d)) {
      return;
    }
    _0x5056be.add(_0x496b1d);
    _0x1a7045.push({
      camera: _0xa090a8,
      slot: _0x496b1d
    });
  });
  const _0x5dc516 = () => {
    for (let _0x2d3fb1 = 1; _0x2d3fb1 <= PANORAMA_SCENE_CAMERA_LIMIT; _0x2d3fb1 += 1) {
      if (!_0x5056be.has(_0x2d3fb1)) {
        _0x5056be.add(_0x2d3fb1);
        return _0x2d3fb1;
      }
    }
    return null;
  };
  _0x3a4767.forEach(_0x2246da => {
    if (_0x1a7045.some(_0x3713c4 => _0x3713c4.camera?.id === _0x2246da?.id)) {
      return;
    }
    const _0x1df0a1 = _0x5dc516();
    if (!_0x1df0a1) {
      return;
    }
    _0x1a7045.push({
      camera: _0x2246da,
      slot: _0x1df0a1
    });
  });
  return _0x1a7045.sort((_0x156fb8, _0x585b1b) => _0x156fb8.slot - _0x585b1b.slot);
}
function resolveFirstFreeCameraSlot(_0x1d7d48 = []) {
  const _0x46f485 = new Set(resolveCameraSlotEntries(_0x1d7d48).map(_0x4a4625 => _0x4a4625.slot));
  for (let _0x22b3c2 = 1; _0x22b3c2 <= PANORAMA_SCENE_CAMERA_LIMIT; _0x22b3c2 += 1) {
    if (!_0x46f485.has(_0x22b3c2)) {
      return _0x22b3c2;
    }
  }
  return null;
}
function resolveCameraBySlot(_0x5518dd = [], _0xec0291) {
  const _0x534e00 = normalizeCameraSlot(_0xec0291);
  if (!_0x534e00) {
    return null;
  }
  const _0x269a6d = resolveCameraSlotEntries(_0x5518dd).find(_0x20d8dd => _0x20d8dd.slot === _0x534e00);
  if (_0x269a6d) {
    return {
      camera: _0x269a6d.camera,
      slot: _0x269a6d.slot
    };
  } else {
    return null;
  }
}
function normalizeScaleVector(_0x1cbe4b, _0x242f19 = 1) {
  if (Number.isFinite(_0x1cbe4b)) {
    const _0x479598 = Math.max(0.01, Number(_0x1cbe4b) || Number(_0x242f19) || 1);
    return {
      x: _0x479598,
      y: _0x479598,
      z: _0x479598
    };
  }
  if (_0x1cbe4b && Number.isFinite(_0x1cbe4b.x) && Number.isFinite(_0x1cbe4b.y) && Number.isFinite(_0x1cbe4b.z)) {
    return {
      x: Math.max(0.01, Number(_0x1cbe4b.x) || 1),
      y: Math.max(0.01, Number(_0x1cbe4b.y) || 1),
      z: Math.max(0.01, Number(_0x1cbe4b.z) || 1)
    };
  }
  const _0x207552 = Math.max(0.01, Number(_0x242f19) || 1);
  return {
    x: _0x207552,
    y: _0x207552,
    z: _0x207552
  };
}
function composeCompatibleScale(_0xedebda, _0x54e8c0 = 1) {
  if (_0xedebda == null) {
    return _0x54e8c0;
  }
  if (Number.isFinite(_0xedebda)) {
    return Math.max(0.01, Math.min(8, Number(_0xedebda) || 1));
  }
  const _0x5bc31f = normalizeScaleVector(_0xedebda, _0x54e8c0);
  const _0x4f3a2f = 0.0001;
  if (Math.abs(_0x5bc31f.x - _0x5bc31f.y) < _0x4f3a2f && Math.abs(_0x5bc31f.y - _0x5bc31f.z) < _0x4f3a2f) {
    return Math.max(0.01, Math.min(8, (_0x5bc31f.x + _0x5bc31f.y + _0x5bc31f.z) / 3));
  }
  return {
    x: Math.max(0.01, Math.min(8, _0x5bc31f.x)),
    y: Math.max(0.01, Math.min(8, _0x5bc31f.y)),
    z: Math.max(0.01, Math.min(8, _0x5bc31f.z))
  };
}
function clamp(_0x4d0daa, _0x340d3a, _0x2a2737) {
  return Math.min(_0x2a2737, Math.max(_0x340d3a, _0x4d0daa));
}
function computeCollapsedDimensions(_0x414a73, _0x1bc867) {
  const _0x63c9aa = Math.max(180, Number(_0x414a73) || PANORAMA_SCENE_DEFAULT_SIZE.width);
  const _0x41fa11 = Math.max(140, Number(_0x1bc867) || PANORAMA_SCENE_DEFAULT_SIZE.height);
  const _0x26999b = Math.min(_0x63c9aa, _0x41fa11);
  const _0xcab17d = _0x26999b > PANORAMA_SCENE_COLLAPSED_MAX_SIZE ? PANORAMA_SCENE_COLLAPSED_MAX_SIZE / _0x26999b : 1;
  return {
    width: Math.round(_0x63c9aa * _0xcab17d),
    height: Math.round(_0x41fa11 * _0xcab17d)
  };
}
function getSelectedObject(_0x5d8d98) {
  const {
    selectedObjectType: _0xddac82,
    selectedObjectId: _0x40c9a2
  } = _0x5d8d98?.selection || {};
  if (!_0xddac82 || !_0x40c9a2) {
    return null;
  }
  const _0x24c797 = getSceneObjectList(_0x5d8d98, _0xddac82);
  const _0x1c7144 = _0x24c797.find(_0x96e7e0 => _0x96e7e0.id === _0x40c9a2) || null;
  if (!_0x1c7144) {
    return null;
  }
  return {
    objectType: _0xddac82,
    item: _0x1c7144
  };
}
function getSceneObjectList(_0x29c7f9, _0x50acbe) {
  if (_0x50acbe === "camera") {
    if (Array.isArray(_0x29c7f9?.cameras)) {
      return _0x29c7f9.cameras;
    } else {
      return [];
    }
  }
  if (_0x50acbe === "cube") {
    if (Array.isArray(_0x29c7f9?.cubes)) {
      return _0x29c7f9.cubes;
    } else {
      return [];
    }
  }
  if (Array.isArray(_0x29c7f9?.mannequins)) {
    return _0x29c7f9.mannequins;
  } else {
    return [];
  }
}
function getSceneObjectHeightOffset(_0x3784c8) {
  if (_0x3784c8 === "cube") {
    return 0;
  }
  if (_0x3784c8 === "mannequin") {
    return 1.1;
  }
  return 0;
}
function getSelectionPoolByType(_0x530630, _0x16ba2f) {
  if (_0x16ba2f === "cube") {
    if (Array.isArray(_0x530630?.cubes)) {
      return _0x530630.cubes;
    } else {
      return [];
    }
  }
  if (_0x16ba2f === "mannequin") {
    if (Array.isArray(_0x530630?.mannequins)) {
      return _0x530630.mannequins;
    } else {
      return [];
    }
  }
  return [];
}
function normalizeSelectionObjectsInput(_0x315479, _0x48eb8b = []) {
  const _0x4783c8 = new Set();
  const _0x392a3 = [];
  const _0x3f0fe1 = Array.isArray(_0x48eb8b) ? _0x48eb8b : [];
  _0x3f0fe1.forEach(_0x355ceb => {
    const _0x4becfd = _0x355ceb?.objectType === "cube" || _0x355ceb?.objectType === "mannequin" ? _0x355ceb.objectType : null;
    const _0x543cb7 = String(_0x355ceb?.objectId || "").trim();
    if (!_0x4becfd || !_0x543cb7) {
      return;
    }
    const _0x5875fc = getSelectionPoolByType(_0x315479, _0x4becfd).some(_0x23f015 => _0x23f015.id === _0x543cb7);
    if (!_0x5875fc) {
      return;
    }
    const _0x57e10e = _0x4becfd + ":" + _0x543cb7;
    if (_0x4783c8.has(_0x57e10e)) {
      return;
    }
    _0x4783c8.add(_0x57e10e);
    _0x392a3.push({
      objectType: _0x4becfd,
      objectId: _0x543cb7
    });
  });
  return _0x392a3;
}
function collectSelectionObjects(_0x54a703) {
  const _0x4dafac = normalizeSelectionObjectsInput(_0x54a703, _0x54a703?.selection?.selectedObjects || []);
  if (_0x4dafac.length > 0) {
    return _0x4dafac;
  }
  const _0x199273 = _0x54a703?.selection?.selectedObjectType === "cube" || _0x54a703?.selection?.selectedObjectType === "mannequin" ? _0x54a703.selection.selectedObjectType : null;
  if (!_0x199273) {
    return [];
  }
  const _0x32b7ee = Array.isArray(_0x54a703?.selection?.selectedObjectIds) ? _0x54a703.selection.selectedObjectIds : _0x54a703?.selection?.selectedObjectId ? [_0x54a703.selection.selectedObjectId] : [];
  return normalizeSelectionObjectsInput(_0x54a703, _0x32b7ee.map(_0x2cc5ea => ({
    objectType: _0x199273,
    objectId: _0x2cc5ea
  })));
}
function clearSelection(_0x403cf9) {
  _0x403cf9.selection.selectedObjectType = null;
  _0x403cf9.selection.selectedObjectId = null;
  _0x403cf9.selection.selectedObjectIds = [];
  _0x403cf9.selection.selectedObjects = [];
  _0x403cf9.selection.selectedGroupId = null;
}
function setSelectionFromObjects(_0x1555d0, _0x55e06a, {
  preferredGroupId = null,
  preferredActiveType = null,
  preferredActiveId = null
} = {}) {
  const _0x4efbef = normalizeSelectionObjectsInput(_0x1555d0, _0x55e06a);
  if (_0x4efbef.length === 0) {
    clearSelection(_0x1555d0);
    return;
  }
  const _0x24ea47 = preferredGroupId ? String(preferredGroupId) : null;
  if (_0x24ea47) {
    const _0x515b70 = (_0x1555d0.groups || []).find(_0x140f43 => _0x140f43.id === _0x24ea47);
    if (_0x515b70) {
      const _0x27e3ee = _0x4efbef.filter(_0x520f0b => _0x520f0b.objectType === "mannequin").map(_0x23a1c5 => _0x23a1c5.objectId);
      const _0x45cdfe = new Set(_0x27e3ee);
      const _0x1764f1 = _0x4efbef.every(_0x425526 => _0x425526.objectType === "mannequin") && _0x515b70.memberIds.length > 0 && _0x515b70.memberIds.length === _0x27e3ee.length && _0x515b70.memberIds.every(_0x3b9d8f => _0x45cdfe.has(_0x3b9d8f));
      if (_0x1764f1) {
        _0x1555d0.selection.selectedObjectType = "mannequin";
        _0x1555d0.selection.selectedObjectId = _0x515b70.memberIds[0] || null;
        _0x1555d0.selection.selectedObjectIds = [..._0x515b70.memberIds];
        _0x1555d0.selection.selectedObjects = _0x515b70.memberIds.map(_0x424d31 => ({
          objectType: "mannequin",
          objectId: _0x424d31
        }));
        _0x1555d0.selection.selectedGroupId = _0x24ea47;
        return;
      }
    }
  }
  const _0x43ec4c = preferredActiveType === "cube" || preferredActiveType === "mannequin" ? preferredActiveType : null;
  const _0x3e1464 = _0x43ec4c && _0x4efbef.some(_0x1ae155 => _0x1ae155.objectType === _0x43ec4c) ? _0x43ec4c : _0x4efbef[0].objectType;
  const _0x1a0cc1 = _0x4efbef.filter(_0x8d0746 => _0x8d0746.objectType === _0x3e1464).map(_0x3d7edf => _0x3d7edf.objectId);
  const _0x5ad1d4 = preferredActiveId && _0x4efbef.some(_0x3100fd => _0x3100fd.objectType === _0x3e1464 && _0x3100fd.objectId === preferredActiveId) ? preferredActiveId : _0x1a0cc1[0] || null;
  _0x1555d0.selection.selectedObjectType = _0x3e1464;
  _0x1555d0.selection.selectedObjectId = _0x5ad1d4;
  _0x1555d0.selection.selectedObjectIds = _0x1a0cc1;
  _0x1555d0.selection.selectedObjects = _0x4efbef;
  _0x1555d0.selection.selectedGroupId = null;
}
function setSingleSelection(_0x56d5a3, _0xf291b8, _0x72c61c) {
  setSelectionFromObjects(_0x56d5a3, _0xf291b8 && _0x72c61c ? [{
    objectType: _0xf291b8,
    objectId: _0x72c61c
  }] : [], {
    preferredActiveType: _0xf291b8,
    preferredActiveId: _0x72c61c || null
  });
}
function finalizeSelectedObjectRemoval(_0x3d19e5, _0xa223aa, _0x2cf553) {
  const _0x5d098c = cloneSceneState(_0x3d19e5);
  const _0x567166 = collectSelectionObjects(_0x5d098c).filter(_0x411193 => _0x411193.objectType !== _0xa223aa || _0x411193.objectId !== _0x2cf553);
  setSelectionFromObjects(_0x5d098c, _0x567166, {
    preferredActiveType: _0x5d098c?.selection?.selectedObjectType || null,
    preferredActiveId: _0x5d098c?.selection?.selectedObjectId || null,
    preferredGroupId: _0x5d098c?.selection?.selectedGroupId || null
  });
  if (_0xa223aa === "camera" && _0x5d098c.viewport.activeCameraId === _0x2cf553) {
    _0x5d098c.viewport.activeCameraId = null;
    _0x5d098c.viewport.activeView = "default";
  }
  return _0x5d098c;
}
function pruneGroups(_0x237a72, _0x1e8a6f = []) {
  if (!Array.isArray(_0x237a72)) {
    return [];
  }
  if (!Array.isArray(_0x1e8a6f) || _0x1e8a6f.length === 0) {
    return _0x237a72;
  }
  const _0x5cc43a = new Set(_0x1e8a6f);
  return _0x237a72.map(_0xf741c0 => ({
    ..._0xf741c0,
    memberIds: Array.isArray(_0xf741c0.memberIds) ? _0xf741c0.memberIds.filter(_0xfaa6f1 => !_0x5cc43a.has(_0xfaa6f1)) : []
  })).filter(_0x5e2f07 => _0x5e2f07.memberIds.length > 0);
}
function resolveGroupByMember(_0x2fadbb, _0x55f0a3, _0x469eb6) {
  if (_0x55f0a3 !== "mannequin" || !_0x469eb6) {
    return null;
  }
  const _0x4d0cd3 = Array.isArray(_0x2fadbb?.groups) ? _0x2fadbb.groups : [];
  return _0x4d0cd3.find(_0x2594a3 => _0x2594a3.memberIds?.includes(_0x469eb6)) || null;
}
function createNodeActionContext(_0x2a21b9 = {}) {
  return {
    storeInstance: _0x2a21b9.storeInstance || a1092_0x1bb930,
    getCurrentProjectId: _0x2a21b9.getCurrentProjectId || (() => window.currentProjectId || "default_v2_project")
  };
}
const DEFAULT_NODE_SPAWN_SPACING = 120;
const PANORAMA_360_IMAGE_SOURCE_TYPES = new Set(["source-image", "ai-image", "image"]);
function resolveNodeSpawnSpacing() {
  const _0xcdc85c = Number(globalThis?.window?.v2NodeSpacing);
  if (Number.isFinite(_0xcdc85c)) {
    return Math.max(0, _0xcdc85c);
  } else {
    return DEFAULT_NODE_SPAWN_SPACING;
  }
}
function shouldAvoidNodeOverlap() {
  return globalThis?.window?.v2NodeAvoidOverlap !== false;
}
function isPanorama360IncomingImageSourceType(_0x526151) {
  return PANORAMA_360_IMAGE_SOURCE_TYPES.has(String(_0x526151 || "").trim());
}
function pickFirstNonEmptyString(..._0xe11188) {
  for (const _0x38f619 of _0xe11188) {
    const _0x863e0b = String(_0x38f619 || "").trim();
    if (_0x863e0b) {
      return _0x863e0b;
    }
  }
  return "";
}
function inferFileNameFromPath(_0x4e0a56) {
  const _0x4a4121 = String(_0x4e0a56 || "").trim();
  if (!_0x4a4121) {
    return "";
  }
  const _0x4ee63a = _0x4a4121.split("?")[0].split("#")[0];
  const _0x1b7cbb = _0x4ee63a.split(/[\\/]/).filter(Boolean);
  if (_0x1b7cbb.length > 0) {
    return _0x1b7cbb[_0x1b7cbb.length - 1];
  } else {
    return "";
  }
}
function resolveMainImageEntry(_0x26acf5) {
  const _0x36f0b4 = Array.isArray(_0x26acf5?.images) ? _0x26acf5.images : [];
  if (_0x36f0b4.length <= 0) {
    return null;
  }
  const _0x26b706 = Number(_0x26acf5?.mainImageIndex);
  const _0x2466d7 = Number.isFinite(_0x26b706) ? Math.max(0, Math.min(_0x36f0b4.length - 1, Math.trunc(_0x26b706))) : 0;
  return _0x36f0b4[_0x2466d7] || _0x36f0b4[0] || null;
}
function resolveMainImageIndex(_0x1e5e69) {
  const _0x4dfebc = Array.isArray(_0x1e5e69?.images) ? _0x1e5e69.images : [];
  if (_0x4dfebc.length <= 0) {
    return 0;
  }
  const _0x4bc7db = Number(_0x1e5e69?.mainImageIndex);
  if (!Number.isFinite(_0x4bc7db)) {
    return 0;
  }
  return Math.max(0, Math.min(_0x4dfebc.length - 1, Math.trunc(_0x4bc7db)));
}
function resolvePanoramaThumbnailUrl(_0x35c39a) {
  if (!_0x35c39a || typeof _0x35c39a !== "object") {
    return "";
  }
  return pickFirstNonEmptyString(localPathToUrl(_0x35c39a.thumbLocalPath), localPathToUrl(_0x35c39a.thumbnailLocalPath), _0x35c39a.thumbUrl, _0x35c39a.thumbnailUrl);
}
function resolvePanoramaImagePayloadFromSourceNode(_0x49aea9) {
  if (!_0x49aea9 || !isPanorama360IncomingImageSourceType(_0x49aea9.type)) {
    return null;
  }
  const _0x8b65d8 = resolveMainImageEntry(_0x49aea9);
  const _0x3f76aa = pickFirstNonEmptyString(_0x8b65d8?.originalLocalPath, _0x8b65d8?.localPath, _0x49aea9.originalLocalPath, _0x49aea9.localPath);
  const _0x3d57c4 = pickFirstNonEmptyString(resolveImageNodeOriginalUrl(_0x8b65d8 || {}), resolveImageNodeOriginalUrl(_0x49aea9));
  const _0x355109 = pickFirstNonEmptyString(resolvePanoramaThumbnailUrl(_0x8b65d8), resolvePanoramaThumbnailUrl(_0x49aea9), resolveImageNodeDisplayUrl(_0x8b65d8 || {}), resolveImageNodeDisplayUrl(_0x49aea9), _0x3d57c4);
  if (!_0x3f76aa && !_0x3d57c4) {
    return null;
  }
  const _0x2f1c8d = pickFirstNonEmptyString(_0x8b65d8?.fileName, _0x49aea9.fileName, inferFileNameFromPath(_0x3f76aa), inferFileNameFromPath(_0x3d57c4));
  return {
    localPath: _0x3f76aa || null,
    imageUrl: _0x3d57c4 || null,
    previewImageUrl: _0x355109 || null,
    fileName: _0x2f1c8d || null,
    mainImageIndex: resolveMainImageIndex(_0x49aea9)
  };
}
function buildPanoramaSourceSignature(_0xacdd60) {
  if (!_0xacdd60 || typeof _0xacdd60 !== "object") {
    return "";
  }
  return JSON.stringify({
    localPath: String(_0xacdd60.localPath || "").trim(),
    imageUrl: String(_0xacdd60.imageUrl || "").trim(),
    fileName: String(_0xacdd60.fileName || "").trim(),
    mainImageIndex: Number(_0xacdd60.mainImageIndex || 0) || 0
  });
}
function hasPersistentPanoramaLocalPath(_0x16e921) {
  const _0x4ef65c = String(_0x16e921 || "").trim();
  if (!_0x4ef65c) {
    return false;
  }
  return !/^(blob:|data:|https?:)/i.test(_0x4ef65c);
}
function bumpPanorama360SyncVersion(_0x1f2d04) {
  const _0x2acea8 = String(_0x1f2d04 || "").trim();
  const _0x49aa5d = Number(_panorama360SyncVersionByNodeId.get(_0x2acea8) || 0) + 1;
  _panorama360SyncVersionByNodeId.set(_0x2acea8, _0x49aa5d);
  return _0x49aa5d;
}
function isPanorama360SyncCurrent(_0x59e30c, _0x3cca29) {
  return Number(_panorama360SyncVersionByNodeId.get(String(_0x59e30c || "").trim()) || 0) === Number(_0x3cca29 || 0);
}
function getPanoramaIncomingEdgeSortValue(_0xe9e549) {
  const _0x5b0f51 = Number(_0xe9e549?.createdAt);
  if (Number.isFinite(_0x5b0f51) && _0x5b0f51 > 0) {
    return _0x5b0f51;
  }
  const _0x40e0d9 = Number(_0xe9e549?.updatedAt);
  if (Number.isFinite(_0x40e0d9) && _0x40e0d9 > 0) {
    return _0x40e0d9;
  }
  return 0;
}
function comparePanoramaIncomingCandidatesDesc(_0x53c87e, _0x41c1c9) {
  const _0x4eacdb = getPanoramaIncomingEdgeSortValue(_0x41c1c9.edge) - getPanoramaIncomingEdgeSortValue(_0x53c87e.edge);
  if (_0x4eacdb !== 0) {
    return _0x4eacdb;
  }
  return String(_0x41c1c9.edge?.id || "").localeCompare(String(_0x53c87e.edge?.id || ""));
}
function buildPanoramaUploadSourceNodeData({
  storeInstance: _0x291ac4,
  anchorNode: _0x4340d0,
  localPath: _0x4bd10f,
  imageUrl: _0x759b25,
  fileName: _0x557281,
  uploadedSize: _0x58be16,
  imageStorageFields: _0x4b57a6
}) {
  if (!_0x291ac4 || !_0x4340d0) {
    return null;
  }
  const _0x244010 = Number(_0x58be16?.width);
  const _0x2dcf1d = Number(_0x58be16?.height);
  const _0x5e3dbe = buildSourceMediaNodePayload({
    id: "__seed__",
    type: "source-image",
    x: 0,
    y: 0,
    src: _0x759b25 || "",
    localPath: _0x4bd10f || "",
    ...(_0x4b57a6 || {}),
    fileName: _0x557281 || "",
    ...(_0x244010 > 0 && _0x2dcf1d > 0 ? {
      naturalWidth: _0x244010,
      naturalHeight: _0x2dcf1d
    } : null)
  });
  const _0x465873 = resolveNodeSpawnSpacing();
  const _0x66472d = Number(_0x4340d0.x) || 0;
  const _0x5ae6e0 = Number(_0x4340d0.y) || 0;
  const _0x4f49bd = Number(_0x4340d0.height) || _0x5e3dbe.height;
  const _0x328edd = _0x66472d - _0x5e3dbe.width - _0x465873;
  const _0x53b570 = _0x5ae6e0 + Math.round((_0x4f49bd - _0x5e3dbe.height) / 2);
  const _0x39eadf = _0x291ac4.getStateRaw?.().nodes || {};
  const _0x3f202f = shouldAvoidNodeOverlap() ? findAvailablePosition(_0x39eadf, _0x328edd, _0x53b570, _0x5e3dbe.width, _0x5e3dbe.height, _0x465873, "left") : {
    x: _0x328edd,
    y: _0x53b570
  };
  return {
    ..._0x5e3dbe,
    id: generateId("source-image"),
    x: _0x3f202f.x,
    y: _0x3f202f.y
  };
}
export function setPanoramaSceneMode({
  nodeId: _0x34fba6,
  mode: _0x26a16c,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x34fba6, (_0x1e3e86, _0x5002fa) => {
    const _0x27ce4e = cloneSceneState(_0x1e3e86);
    _0x27ce4e.mode = isPanorama360NodeType(_0x5002fa?.type) ? "panorama" : "scene";
    _0x27ce4e.viewport.activeView = "default";
    _0x27ce4e.viewport.activeCameraId = null;
    return _0x27ce4e;
  });
}
export function setPanoramaSceneEnvironmentMode({
  nodeId: _0x236d6a,
  environmentMode: _0x324a3b,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x236d6a, _0x515cb5 => {
    const _0x11dd93 = cloneSceneState(_0x515cb5);
    _0x11dd93.environmentMode = _0x324a3b === "night" ? "night" : "day";
    return _0x11dd93;
  });
}
export function setPanoramaSceneTool({
  nodeId: _0x1dc3b1,
  tool: _0x3f8be2,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x1dc3b1, _0xd048e8 => {
    const _0x49971c = cloneSceneState(_0xd048e8);
    const _0x3a5672 = _0x3f8be2 === "move" || _0x3f8be2 === "rotate" || _0x3f8be2 === "scale" || _0x3f8be2 === "box-select" ? _0x3f8be2 : "navigate";
    if (_0x3a5672 === "box-select" || _0x3a5672 === "navigate") {
      _0x49971c.ui.mouseTool = _0x3a5672;
    } else {
      _0x49971c.ui.transformTool = _0x3a5672;
    }
    _0x49971c.ui.activeTool = _0x3a5672;
    return _0x49971c;
  });
}
export function setPanoramaSceneTransformSpace({
  nodeId: _0x31ccb1,
  transformSpace: _0x37b9e5,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x31ccb1, _0x25b637 => {
    const _0x1e319a = cloneSceneState(_0x25b637);
    _0x1e319a.ui.transformSpace = _0x37b9e5 === "local" ? "local" : "world";
    return _0x1e319a;
  });
}
export function setPanoramaScenePivotMode({
  nodeId: _0x2af8ad,
  pivotMode: _0x1f2af0,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x2af8ad, _0x5ba6b2 => {
    const _0x2e9b26 = cloneSceneState(_0x5ba6b2);
    _0x2e9b26.ui.pivotMode = _0x1f2af0 === "center" ? "center" : "active";
    return _0x2e9b26;
  });
}
export function setPanoramaSceneNavigationPreset({
  nodeId: _0x1211f6,
  navigationPreset: _0x1608e9,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x1211f6, _0x52c860 => {
    const _0x32a1a9 = cloneSceneState(_0x52c860);
    _0x32a1a9.ui.navigationPreset = _0x1608e9 === "dcc" ? "dcc" : "dcc";
    return _0x32a1a9;
  });
}
export function setPanoramaSceneInteractionOptions({
  nodeId: _0x47b73f,
  patch = {},
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x47b73f, _0x434f2d => {
    const _0x5858f6 = cloneSceneState(_0x434f2d);
    if (Object.prototype.hasOwnProperty.call(patch, "transformSpace")) {
      _0x5858f6.ui.transformSpace = patch.transformSpace === "local" ? "local" : "world";
    }
    if (Object.prototype.hasOwnProperty.call(patch, "snapEnabled")) {
      _0x5858f6.ui.snapEnabled = patch.snapEnabled === true;
    }
    if (Number.isFinite(Number(patch.translationSnap))) {
      _0x5858f6.ui.translationSnap = Number(patch.translationSnap);
    }
    if (Number.isFinite(Number(patch.rotationSnap))) {
      _0x5858f6.ui.rotationSnap = Number(patch.rotationSnap);
    }
    if (Number.isFinite(Number(patch.scaleSnap))) {
      _0x5858f6.ui.scaleSnap = Number(patch.scaleSnap);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "groundLock")) {
      _0x5858f6.ui.groundLock = patch.groundLock === true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, "uniformScale")) {
      _0x5858f6.ui.uniformScale = patch.uniformScale === true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, "navigationMode")) {
      _0x5858f6.ui.navigationMode = patch.navigationMode === "fly" ? "fly" : "orbit";
    }
    if (Number.isFinite(Number(patch.flySpeed))) {
      _0x5858f6.ui.flySpeed = Math.max(0.25, Math.min(40, Number(patch.flySpeed)));
    }
    if (Object.prototype.hasOwnProperty.call(patch, "showTimeline")) {
      _0x5858f6.ui.showTimeline = patch.showTimeline === true;
    }
    return _0x5858f6;
  });
}
export function setPanoramaSceneEditing({
  nodeId: _0x250cda,
  isEditing: _0x3b3735,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x250cda, _0x206d8b => {
    const _0x34d7da = cloneSceneState(_0x206d8b);
    _0x34d7da.ui.isEditing = _0x3b3735 === true;
    if (!_0x34d7da.ui.isEditing) {
      _0x34d7da.ui.showCameraList = false;
    }
    return _0x34d7da;
  });
}
export function setPanoramaSceneSelection({
  nodeId: _0x29170c,
  objectType: _0x28d8eb,
  objectId: _0x8ef71e,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x29170c, _0x39e1e9 => {
    const _0x1a9635 = cloneSceneState(_0x39e1e9);
    if (_0x28d8eb === "camera") {
      return _0x1a9635;
    }
    const _0xf1c307 = _0x28d8eb === "mannequin" || _0x28d8eb === "cube" ? _0x28d8eb : null;
    const _0x16fedf = _0x8ef71e ? String(_0x8ef71e) : null;
    if (!_0xf1c307 || !_0x16fedf) {
      clearSelection(_0x1a9635);
      return _0x1a9635;
    }
    const _0x214f6f = resolveGroupByMember(_0x1a9635, _0xf1c307, _0x16fedf);
    if (_0x214f6f) {
      setSelectionFromObjects(_0x1a9635, _0x214f6f.memberIds.map(_0x17fdc1 => ({
        objectType: "mannequin",
        objectId: _0x17fdc1
      })), {
        preferredGroupId: _0x214f6f.id,
        preferredActiveType: "mannequin",
        preferredActiveId: _0x16fedf
      });
      return _0x1a9635;
    }
    setSelectionFromObjects(_0x1a9635, [{
      objectType: _0xf1c307,
      objectId: _0x16fedf
    }], {
      preferredActiveType: _0xf1c307,
      preferredActiveId: _0x16fedf
    });
    return _0x1a9635;
  });
}
export function setPanoramaSceneSelectionBatch({
  nodeId: _0xfceb90,
  objectType: _0x2b3538,
  objectIds = [],
  groupId = null,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0xfceb90, _0x3ec0b8 => {
    const _0x2a4296 = cloneSceneState(_0x3ec0b8);
    if (_0x2b3538 === "camera") {
      return _0x2a4296;
    }
    const _0x1ebc45 = _0x2b3538 === "mannequin" || _0x2b3538 === "cube" ? _0x2b3538 : null;
    const _0x21a56d = [...new Set((Array.isArray(objectIds) ? objectIds : []).map(_0x255cac => String(_0x255cac || "").trim()).filter(Boolean))];
    if (!_0x1ebc45 || _0x21a56d.length === 0) {
      clearSelection(_0x2a4296);
      return _0x2a4296;
    }
    let _0x20e32b = groupId ? String(groupId) : null;
    if (_0x20e32b) {
      const _0x1a65bf = (_0x2a4296.groups || []).find(_0x5735bc => _0x5735bc.id === _0x20e32b);
      if (!_0x1a65bf) {
        _0x20e32b = null;
      } else {
        setSelectionFromObjects(_0x2a4296, _0x1a65bf.memberIds.map(_0x358f52 => ({
          objectType: "mannequin",
          objectId: _0x358f52
        })), {
          preferredGroupId: _0x20e32b,
          preferredActiveType: "mannequin",
          preferredActiveId: _0x1a65bf.memberIds[0] || null
        });
        return _0x2a4296;
      }
    }
    setSelectionFromObjects(_0x2a4296, _0x21a56d.map(_0xbb15d7 => ({
      objectType: _0x1ebc45,
      objectId: _0xbb15d7
    })), {
      preferredActiveType: _0x1ebc45,
      preferredActiveId: _0x21a56d[0] || null
    });
    return _0x2a4296;
  });
}
export function setPanoramaSceneSelectionObjects({
  nodeId: _0x29567c,
  objects = [],
  activeObjectType = null,
  activeObjectId = null,
  groupId = null,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x29567c, _0x1fa36c => {
    const _0x1d2571 = cloneSceneState(_0x1fa36c);
    setSelectionFromObjects(_0x1d2571, objects, {
      preferredGroupId: groupId,
      preferredActiveType: activeObjectType,
      preferredActiveId: activeObjectId
    });
    return _0x1d2571;
  });
}
export function clearPanoramaSceneSelection({
  nodeId: _0x1769e0,
  storeInstance = a1092_0x1bb930
}) {
  setPanoramaSceneSelection({
    nodeId: _0x1769e0,
    objectType: null,
    objectId: null,
    storeInstance: storeInstance
  });
}
export function setPanoramaSceneCameraListVisible({
  nodeId: _0x6590a2,
  visible: _0x397462,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x6590a2, _0x16ea80 => {
    const _0x1db68a = cloneSceneState(_0x16ea80);
    _0x1db68a.ui.showCameraList = _0x397462 === true;
    return _0x1db68a;
  });
}
export function setPanoramaSceneGridPlacement({
  nodeId: _0x402ccd,
  patch: _0x34eccf,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x402ccd, _0x14b8b4 => {
    const _0x3dacc2 = cloneSceneState(_0x14b8b4);
    _0x3dacc2.gridPlacement = {
      ..._0x3dacc2.gridPlacement,
      ...(_0x34eccf || {})
    };
    return normalizePanoramaSceneState(_0x3dacc2);
  });
}
export function resetPanoramaSceneView({
  nodeId: _0x4e6c9c,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x4e6c9c, _0x3dff9d => {
    const _0x5480de = cloneSceneState(_0x3dff9d);
    _0x5480de.viewport.activeView = "default";
    _0x5480de.viewport.activeCameraId = null;
    if (_0x5480de.mode === "panorama") {
      _0x5480de.viewport.panoramaView = createDefaultPanoramaView();
    } else {
      _0x5480de.viewport.sceneView = createDefaultSceneView();
    }
    return _0x5480de;
  });
}
export function applyPanoramaSceneViewCommit({
  nodeId: _0x1b9673,
  sceneView: _0x32e45c,
  panoramaView: _0x3fef7a,
  activeView = "default",
  activeCameraId = null,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x1b9673, _0x48cced => {
    const _0x42bf07 = cloneSceneState(_0x48cced);
    _0x42bf07.viewport.activeView = activeView === "camera" ? "camera" : "default";
    _0x42bf07.viewport.activeCameraId = _0x42bf07.viewport.activeView === "camera" && activeCameraId ? String(activeCameraId) : null;
    if (_0x32e45c) {
      _0x42bf07.viewport.sceneView = {
        ..._0x42bf07.viewport.sceneView,
        ..._0x32e45c
      };
    }
    if (_0x3fef7a) {
      _0x42bf07.viewport.panoramaView = {
        ..._0x42bf07.viewport.panoramaView,
        ..._0x3fef7a
      };
    }
    return normalizePanoramaSceneState(_0x42bf07);
  });
}
export function activatePanoramaSceneCamera({
  nodeId: _0x54361c,
  cameraId: _0xaae1ec,
  storeInstance = a1092_0x1bb930
}) {
  const _0x391f18 = getStoreNode(storeInstance, _0x54361c);
  if (isPanorama360NodeType(_0x391f18?.type)) {
    return;
  }
  writeSceneState(storeInstance, _0x54361c, _0x143ae5 => {
    const _0x3ddb77 = cloneSceneState(_0x143ae5);
    const _0x3bab94 = _0x3ddb77.cameras.find(_0x4f3f41 => _0x4f3f41.id === _0xaae1ec) || null;
    if (!_0x3bab94) {
      return _0x3ddb77;
    }
    if (_0x3ddb77.mode === "panorama") {
      _0x3ddb77.viewport.activeView = "camera";
      _0x3ddb77.viewport.activeCameraId = String(_0xaae1ec);
      _0x3ddb77.viewport.panoramaView = cameraPoseToPanoramaView(_0x3bab94);
    } else {
      _0x3ddb77.viewport.activeView = "default";
      _0x3ddb77.viewport.activeCameraId = null;
      _0x3ddb77.viewport.sceneView = cameraPoseToSceneViewFromReference(_0x3bab94, _0x3ddb77.viewport.sceneView || createDefaultSceneView());
    }
    return _0x3ddb77;
  });
}
export function setPanoramaSceneCaptureMode({
  nodeId: _0x43657d,
  mode: _0x535e9b,
  showSafeFrame = true,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x43657d, _0x43e5ce => {
    const _0xd8d519 = cloneSceneState(_0x43e5ce);
    const _0x1044f9 = _0x535e9b === "9:16" || _0x535e9b === "2.35:1" ? _0x535e9b : "adaptive";
    _0xd8d519.capture.mode = _0x1044f9;
    _0xd8d519.capture.showSafeFrame = _0x1044f9 === "adaptive" ? false : showSafeFrame === true;
    return normalizePanoramaSceneState(_0xd8d519);
  });
}
export function setPanoramaSceneSafeFrameVisible({
  nodeId: _0x14ec23,
  visible: _0x4c0454,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x14ec23, _0x1f18cb => {
    const _0x60aa6c = cloneSceneState(_0x1f18cb);
    _0x60aa6c.capture.showSafeFrame = _0x4c0454 === true;
    return normalizePanoramaSceneState(_0x60aa6c);
  });
}
export function activatePanoramaSceneCameraSlot({
  nodeId: _0x379700,
  slot: _0xcbdca7,
  storeInstance = a1092_0x1bb930
}) {
  const _0x595142 = getStoreNode(storeInstance, _0x379700);
  if (isPanorama360NodeType(_0x595142?.type)) {
    return null;
  }
  const _0x3241fd = getSceneState(storeInstance, _0x379700);
  const _0x5335de = resolveCameraBySlot(_0x3241fd.cameras, _0xcbdca7);
  if (!_0x5335de?.camera?.id) {
    return null;
  }
  activatePanoramaSceneCamera({
    nodeId: _0x379700,
    cameraId: _0x5335de.camera.id,
    storeInstance: storeInstance
  });
  return _0x5335de.camera.id;
}
export function upsertPanoramaSceneCameraAtSlot({
  nodeId: _0x256636,
  slot: _0x5d0bee,
  viewPose: _0x465087,
  storeInstance = a1092_0x1bb930
}) {
  const _0xf0259c = getStoreNode(storeInstance, _0x256636);
  if (isPanorama360NodeType(_0xf0259c?.type)) {
    return null;
  }
  const _0x1f7315 = normalizeCameraSlot(_0x5d0bee);
  if (!_0x1f7315) {
    return null;
  }
  const _0x29ec70 = getSceneState(storeInstance, _0x256636);
  const _0x348429 = sanitizeCameraPose(_0x465087);
  const _0x121508 = resolveCameraBySlot(_0x29ec70.cameras, _0x1f7315);
  let _0x238935 = _0x121508?.camera?.id || null;
  let _0x167268 = false;
  writeSceneState(storeInstance, _0x256636, _0x1ab50f => {
    const _0x5ccf81 = cloneSceneState(_0x1ab50f);
    const _0x1e7890 = resolveCameraBySlot(_0x5ccf81.cameras, _0x1f7315);
    if (_0x1e7890?.camera?.id) {
      const _0x1a06a9 = _0x1e7890.camera.id;
      _0x238935 = _0x1a06a9;
      _0x5ccf81.cameras = _0x5ccf81.cameras.map(_0xc39867 => _0xc39867.id === _0x1a06a9 ? {
        ..._0xc39867,
        slot: _0x1f7315,
        name: _0xc39867.name || panoramaSceneText("camera.defaultName", {
          slot: toCameraSlotLabel(_0x1f7315)
        }),
        position: _0x348429.position,
        quaternion: _0x348429.quaternion,
        rotation: _0x348429.rotation,
        focalLength: _0x348429.focalLength
      } : _0xc39867);
      if (_0x5ccf81.mode === "panorama") {
        _0x5ccf81.viewport.activeCameraId = _0x1a06a9;
        _0x5ccf81.viewport.activeView = "camera";
      }
      _0x167268 = true;
      return _0x5ccf81;
    }
    if (_0x5ccf81.cameras.length >= PANORAMA_SCENE_CAMERA_LIMIT) {
      return _0x5ccf81;
    }
    const _0x1ee58b = generateId("scene-camera");
    _0x238935 = _0x1ee58b;
    _0x5ccf81.cameras.push({
      id: _0x1ee58b,
      slot: _0x1f7315,
      name: panoramaSceneText("camera.defaultName", {
        slot: toCameraSlotLabel(_0x1f7315)
      }),
      position: _0x348429.position,
      quaternion: _0x348429.quaternion,
      rotation: _0x348429.rotation,
      focalLength: _0x348429.focalLength
    });
    if (_0x5ccf81.mode === "panorama") {
      _0x5ccf81.viewport.activeCameraId = _0x1ee58b;
      _0x5ccf81.viewport.activeView = "camera";
    }
    _0x167268 = true;
    return _0x5ccf81;
  });
  if (!_0x167268) {
    showWarning(panoramaSceneText("camera.limitWarning", {
      count: PANORAMA_SCENE_CAMERA_LIMIT
    }));
    return null;
  }
  commit();
  return _0x238935;
}
export function activatePanoramaSceneDefaultView({
  nodeId: _0x5bc56d,
  pose: _0x42c46a,
  storeInstance = a1092_0x1bb930
}) {
  const _0x7613e8 = getSceneState(storeInstance, _0x5bc56d);
  if (_0x7613e8.mode === "panorama") {
    const _0xb06b0b = _0x42c46a ? cameraPoseToPanoramaView(_0x42c46a) : _0x7613e8.viewport.panoramaView;
    applyPanoramaSceneViewCommit({
      nodeId: _0x5bc56d,
      panoramaView: _0xb06b0b,
      activeView: "default",
      activeCameraId: null,
      storeInstance: storeInstance
    });
    return;
  }
  const _0x483eab = _0x42c46a ? cameraPoseToSceneViewFromReference(_0x42c46a, _0x7613e8.viewport.sceneView || createDefaultSceneView()) : _0x7613e8.viewport.sceneView;
  applyPanoramaSceneViewCommit({
    nodeId: _0x5bc56d,
    sceneView: _0x483eab,
    activeView: "default",
    activeCameraId: null,
    storeInstance: storeInstance
  });
}
export async function uploadPanoramaSceneImage({
  nodeId: _0x47b784,
  file: _0xc3164d,
  storeInstance = a1092_0x1bb930,
  getCurrentProjectId = () => window.currentProjectId || "default_v2_project",
  createFastImagePreviewImpl = createFastImagePreview,
  uploadFileImpl = uploadFile,
  resolveOutputMediaSizeImpl = resolveOutputMediaSize
}) {
  if (!_0xc3164d) {
    return null;
  }
  const _0x3364d3 = getStoreNode(storeInstance, _0x47b784);
  if (!_0x3364d3) {
    return null;
  }
  if (!isPanorama360NodeType(_0x3364d3.type)) {
    showWarning(panoramaSceneText("upload.unsupportedNode"));
    return null;
  }
  try {
    let _0x5235ec = null;
    try {
      _0x5235ec = await createFastImagePreviewImpl(_0xc3164d, {
        maxDimension: 1024
      });
    } catch {}
    const _0xa90bb0 = String(_0x5235ec?.thumbnailDataUrl || "").trim();
    const _0x10e1f6 = Number(_0x5235ec?.width) > 0 && Number(_0x5235ec?.height) > 0 ? {
      width: Number(_0x5235ec.width),
      height: Number(_0x5235ec.height)
    } : null;
    if (_0xa90bb0) {
      writeSceneState(storeInstance, _0x47b784, _0x590b18 => {
        const _0x5c9eb9 = cloneSceneState(_0x590b18);
        _0x5c9eb9.mode = "panorama";
        _0x5c9eb9.viewport.activeView = "default";
        _0x5c9eb9.viewport.activeCameraId = null;
        _0x5c9eb9.panorama = {
          localPath: null,
          imageUrl: _0xa90bb0,
          previewImageUrl: _0xa90bb0,
          fileName: String(_0xc3164d.name || "").trim() || null,
          sourceSignature: null,
          isLoaded: false,
          error: null
        };
        return _0x5c9eb9;
      });
    }
    if (_0x5235ec?.image) {
      _0x5235ec.image.width = 0;
      _0x5235ec.image.height = 0;
    }
    const _0x552126 = await uploadFileImpl(_0xc3164d, getCurrentProjectId());
    const _0x1be3a7 = _0x552126.filename || _0xc3164d.name;
    const _0x1429e1 = pickResultLocalPath(_0x552126);
    const _0x4c0904 = localPathToUrl(_0x1429e1) || String(_0x552126.url || "").trim() || null;
    const _0x3099da = buildImageNodeStorageFields(_0x552126);
    const _0x12a390 = _0x10e1f6 || (await resolveOutputMediaSizeImpl({
      localPath: _0x1429e1,
      imageUrl: _0x4c0904
    }));
    if (_0x12a390 && !isNearEquirectangularRatio(_0x12a390)) {
      const _0x2eac9f = _0x12a390.width / _0x12a390.height;
      showWarning(panoramaSceneText("upload.ratioWarning", {
        width: _0x12a390.width,
        height: _0x12a390.height,
        ratio: _0x2eac9f.toFixed(3)
      }));
    }
    const _0x4fbfd1 = buildPanoramaUploadSourceNodeData({
      storeInstance: storeInstance,
      anchorNode: _0x3364d3,
      localPath: _0x1429e1,
      imageUrl: _0x4c0904,
      fileName: _0x1be3a7,
      uploadedSize: _0x12a390,
      imageStorageFields: _0x3099da
    });
    const _0x3a8cba = Date.now();
    storeInstance.batch(() => {
      writeSceneState(storeInstance, _0x47b784, _0x22b5e5 => {
        const _0x331257 = cloneSceneState(_0x22b5e5);
        _0x331257.mode = "panorama";
        _0x331257.viewport.activeView = "default";
        _0x331257.viewport.activeCameraId = null;
        _0x331257.panorama = {
          localPath: _0x1429e1,
          imageUrl: _0x4c0904,
          previewImageUrl: pickFirstNonEmptyString(_0x552126.thumbUrl, localPathToUrl(_0x552126.thumbLocalPath), _0x552126.displayUrl, localPathToUrl(_0x552126.displayLocalPath), _0x4c0904) || null,
          fileName: _0x1be3a7,
          sourceSignature: null,
          isLoaded: false,
          error: null
        };
        return _0x331257;
      });
      if (_0x4fbfd1) {
        storeInstance.addNode(_0x4fbfd1);
        storeInstance.addEdge({
          id: generateId("edge"),
          sourceId: _0x4fbfd1.id,
          targetId: _0x47b784,
          createdAt: _0x3a8cba
        });
      }
      storeInstance.setSelectedNodes([_0x47b784]);
    });
    commit();
    showSuccess(panoramaSceneText("upload.success"));
    return {
      localPath: _0x1429e1,
      imageUrl: _0x4c0904,
      fileName: _0x1be3a7,
      sourceNodeId: _0x4fbfd1?.id || null
    };
  } catch (_0x5d6b91) {
    const _0x17f772 = String(_0x5d6b91?.message || panoramaSceneText("upload.failed"));
    writeSceneState(storeInstance, _0x47b784, _0x408a2e => {
      const _0x1dc354 = cloneSceneState(_0x408a2e);
      _0x1dc354.panorama.error = _0x17f772;
      _0x1dc354.panorama.isLoaded = false;
      return _0x1dc354;
    });
    showError(panoramaSceneText("upload.failedWithError", {
      error: _0x17f772
    }));
    return null;
  }
}
export function syncPanorama360FromIncomingImageEdge({
  nodeId: _0x4c9ec7,
  storeInstance = a1092_0x1bb930
}) {
  const _0x4e0a58 = String(_0x4c9ec7 || "").trim();
  const _0x67f759 = getStoreNode(storeInstance, _0x4e0a58);
  if (!_0x67f759 || !isPanorama360NodeType(_0x67f759.type)) {
    bumpPanorama360SyncVersion(_0x4e0a58);
    return null;
  }
  const _0x1674f4 = typeof storeInstance?.getIncomingEdges === "function" ? storeInstance.getIncomingEdges(_0x4e0a58) : Object.values(storeInstance.getStateRaw?.().edges || {}).filter(_0x3aa3f2 => _0x3aa3f2?.targetId === _0x4e0a58);
  const _0x3b481e = storeInstance.getStateRaw?.().nodes || {};
  const _0x2859c5 = (Array.isArray(_0x1674f4) ? _0x1674f4 : []).map(_0x529694 => {
    const _0x13389c = _0x3b481e[_0x529694?.sourceId] || null;
    const _0x4be1dd = resolvePanoramaImagePayloadFromSourceNode(_0x13389c);
    if (!_0x13389c || !_0x4be1dd) {
      return null;
    }
    return {
      edge: _0x529694,
      sourceNode: _0x13389c,
      payload: _0x4be1dd
    };
  }).filter(Boolean).sort(comparePanoramaIncomingCandidatesDesc);
  const _0x1f5e2c = _0x2859c5[0] || null;
  if (!_0x1f5e2c?.payload) {
    bumpPanorama360SyncVersion(_0x4e0a58);
    return null;
  }
  const _0x333a15 = buildPanoramaSourceSignature(_0x1f5e2c.payload);
  const _0x44acfc = getSceneState(storeInstance, _0x4e0a58);
  const _0x414cd6 = _0x44acfc?.panorama || {};
  const _0x36b5a2 = String(_0x414cd6.sourceSignature || "") === _0x333a15 && hasPersistentPanoramaLocalPath(_0x414cd6.localPath);
  if (_0x36b5a2) {
    const _0x4ca234 = _0x1f5e2c.payload.previewImageUrl || _0x414cd6.previewImageUrl;
    const _0x298fe2 = {
      localPath: String(_0x414cd6.localPath || "").trim() || _0x1f5e2c.payload.localPath,
      imageUrl: String(_0x414cd6.imageUrl || "").trim() || _0x1f5e2c.payload.imageUrl,
      previewImageUrl: _0x4ca234 || null,
      fileName: String(_0x414cd6.fileName || "").trim() || _0x1f5e2c.payload.fileName,
      sourceSignature: _0x333a15,
      isLoaded: _0x414cd6.isLoaded === true,
      error: null
    };
    const _0x2a4632 = String(_0x414cd6.previewImageUrl || "") === String(_0x4ca234 || "");
    if (!_0x414cd6.error && _0x2a4632) {
      return {
        ..._0x298fe2,
        sourceNodeId: _0x1f5e2c.sourceNode.id,
        updated: false
      };
    }
    writeSceneState(storeInstance, _0x4e0a58, _0x21985f => {
      const _0x3d98a5 = cloneSceneState(_0x21985f);
      _0x3d98a5.mode = "panorama";
      _0x3d98a5.viewport.activeView = "default";
      _0x3d98a5.viewport.activeCameraId = null;
      _0x3d98a5.panorama = _0x298fe2;
      return _0x3d98a5;
    });
    return {
      ..._0x298fe2,
      sourceNodeId: _0x1f5e2c.sourceNode.id,
      updated: true
    };
  }
  const _0xb5d780 = _panorama360SyncInflightByNodeId.get(_0x4e0a58);
  if (_0xb5d780?.signature === _0x333a15 && _0xb5d780?.promise) {
    return _0xb5d780.promise;
  }
  const _0x20bc27 = bumpPanorama360SyncVersion(_0x4e0a58);
  const _0x2c2272 = pickFirstNonEmptyString(_0x1f5e2c.payload.previewImageUrl, _0x1f5e2c.payload.imageUrl, localPathToUrl(_0x1f5e2c.payload.localPath));
  writeSceneState(storeInstance, _0x4e0a58, _0x6db984 => {
    const _0x1134e8 = cloneSceneState(_0x6db984);
    _0x1134e8.mode = "panorama";
    _0x1134e8.viewport.activeView = "default";
    _0x1134e8.viewport.activeCameraId = null;
    _0x1134e8.panorama = {
      localPath: null,
      imageUrl: _0x2c2272 || null,
      previewImageUrl: _0x2c2272 || null,
      fileName: _0x1f5e2c.payload.fileName,
      sourceSignature: _0x333a15,
      isLoaded: false,
      error: null
    };
    return _0x1134e8;
  });
  const _0x1cb3ae = (async () => {
    try {
      const _0x4c8151 = await ensurePersistedPanoramaInputPng({
        localPath: _0x1f5e2c.payload.localPath,
        imageUrl: _0x1f5e2c.payload.imageUrl,
        fileName: _0x1f5e2c.payload.fileName,
        sourceSignature: _0x333a15
      });
      if (!isPanorama360SyncCurrent(_0x4e0a58, _0x20bc27)) {
        return {
          ..._0x4c8151,
          sourceNodeId: _0x1f5e2c.sourceNode.id,
          updated: false,
          stale: true
        };
      }
      const _0x12a1f4 = getStoreNode(storeInstance, _0x4e0a58);
      if (!_0x12a1f4 || !isPanorama360NodeType(_0x12a1f4.type)) {
        return null;
      }
      const _0x37bd2b = getSceneState(storeInstance, _0x4e0a58);
      const _0x48a579 = _0x37bd2b?.panorama || {};
      const _0x3630a2 = {
        localPath: _0x4c8151.localPath,
        imageUrl: _0x4c8151.imageUrl,
        previewImageUrl: _0x2c2272 || null,
        fileName: _0x4c8151.fileName,
        sourceSignature: _0x333a15,
        isLoaded: false,
        error: null
      };
      const _0x4ccb0d = String(_0x48a579.localPath || "") === String(_0x3630a2.localPath || "") && String(_0x48a579.imageUrl || "") === String(_0x3630a2.imageUrl || "") && String(_0x48a579.fileName || "") === String(_0x3630a2.fileName || "") && String(_0x48a579.sourceSignature || "") === _0x333a15;
      const _0x16d776 = _0x48a579.isLoaded === false && !_0x48a579.error;
      if (_0x4ccb0d && _0x16d776) {
        return {
          ..._0x3630a2,
          sourceNodeId: _0x1f5e2c.sourceNode.id,
          updated: false
        };
      }
      writeSceneState(storeInstance, _0x4e0a58, _0x1b705c => {
        const _0x1538e9 = cloneSceneState(_0x1b705c);
        _0x1538e9.mode = "panorama";
        _0x1538e9.viewport.activeView = "default";
        _0x1538e9.viewport.activeCameraId = null;
        _0x1538e9.panorama = _0x3630a2;
        return _0x1538e9;
      });
      return {
        ..._0x3630a2,
        sourceNodeId: _0x1f5e2c.sourceNode.id,
        updated: true
      };
    } catch (_0x3ab6eb) {
      if (!isPanorama360SyncCurrent(_0x4e0a58, _0x20bc27)) {
        return {
          updated: false,
          stale: true,
          error: String(_0x3ab6eb?.message || _0x3ab6eb || panoramaSceneText("errors.unknown"))
        };
      }
      const _0x1ac65c = String(_0x3ab6eb?.message || panoramaSceneText("errors.pngNormalizeFailed"));
      showError(_0x1ac65c);
      return {
        updated: false,
        error: _0x1ac65c
      };
    } finally {
      const _0x1ef2c7 = _panorama360SyncInflightByNodeId.get(_0x4e0a58);
      if (_0x1ef2c7?.promise === _0x1cb3ae) {
        _panorama360SyncInflightByNodeId.delete(_0x4e0a58);
      }
    }
  })();
  _panorama360SyncInflightByNodeId.set(_0x4e0a58, {
    signature: _0x333a15,
    version: _0x20bc27,
    promise: _0x1cb3ae
  });
  return _0x1cb3ae;
}
export function updatePanoramaSceneLoadState({
  nodeId: _0x1c2bf4,
  isLoaded: _0x2be316,
  error = null,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x1c2bf4, _0x1407fd => {
    const _0x41036a = cloneSceneState(_0x1407fd);
    _0x41036a.panorama.isLoaded = _0x2be316 === true;
    _0x41036a.panorama.error = error ? String(error) : null;
    return _0x41036a;
  });
}
export function addPanoramaSceneMannequin({
  nodeId: _0x31ba60,
  gender = "male",
  colorKey = "blue",
  poseId = DEFAULT_MANNEQUIN_POSE_ID,
  bonePose = null,
  viewPose: _0x3e259c,
  storeInstance = a1092_0x1bb930
}) {
  const _0x5352d5 = getSceneState(storeInstance, _0x31ba60);
  const _0x5b5578 = resolveObjectPlacementPoint({
    sceneMode: _0x5352d5.mode,
    sceneViewTarget: _0x5352d5?.viewport?.sceneView?.target,
    pose: _0x3e259c,
    groundY: 0,
    forwardDistance: MANNEQUIN_FORWARD_PLACEMENT_DISTANCE
  });
  const _0x4eeebb = pickFacingCameraYaw(_0x3e259c);
  const _0x46c893 = generateId("mannequin");
  const _0xa8c401 = bonePose ? {
    id: "custom",
    bones: normalizeBonePose(bonePose)
  } : resolveMannequinPose(poseId);
  writeSceneState(storeInstance, _0x31ba60, _0x4a6ea6 => {
    const _0x875da8 = cloneSceneState(_0x4a6ea6);
    _0x875da8.mannequins.push({
      id: _0x46c893,
      gender: gender === "female" ? "female" : "male",
      colorKey: colorKey,
      poseId: _0xa8c401?.id || DEFAULT_MANNEQUIN_POSE_ID,
      bonePose: normalizeBonePose(_0xa8c401?.bones),
      position: _0x5b5578,
      rotation: {
        x: 0,
        y: _0x4eeebb,
        z: 0
      },
      scale: 1
    });
    _0x875da8.gridPlacement.gender = gender === "female" ? "female" : "male";
    _0x875da8.gridPlacement.colorKey = colorKey;
    setSingleSelection(_0x875da8, "mannequin", _0x46c893);
    return _0x875da8;
  });
  commit();
  return _0x46c893;
}
export function addPanoramaSceneCube({
  nodeId: _0x34283d,
  assetId: _0x5f64af,
  colorKey = null,
  viewPose: _0x9218a,
  storeInstance = a1092_0x1bb930
}) {
  const _0x103f5f = getStoreNode(storeInstance, _0x34283d);
  if (isPanorama360NodeType(_0x103f5f?.type)) {
    return null;
  }
  const _0x41b006 = resolveSceneAsset(_0x5f64af);
  const _0x28e452 = colorKey || _0x41b006?.colorKey || "blue";
  const _0x2b1fb6 = getSceneState(storeInstance, _0x34283d);
  const _0x555309 = Math.max(CUBE_FORWARD_PLACEMENT_DISTANCE, estimateSceneAssetBoundingRadius(_0x41b006) + 2.5);
  const _0x557e82 = resolveObjectPlacementPoint({
    sceneMode: _0x2b1fb6.mode,
    sceneViewTarget: _0x2b1fb6?.viewport?.sceneView?.target,
    pose: _0x9218a,
    groundY: 0,
    forwardDistance: _0x555309
  });
  const _0x55eab3 = {
    x: _0x557e82.x,
    y: 0,
    z: _0x557e82.z
  };
  const _0x28e9cc = generateId("cube");
  writeSceneState(storeInstance, _0x34283d, _0x512042 => {
    const _0x33ff6f = cloneSceneState(_0x512042);
    _0x33ff6f.cubes.push({
      id: _0x28e9cc,
      assetId: _0x41b006?.id || null,
      colorKey: _0x28e452,
      position: _0x55eab3,
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: 1
    });
    setSingleSelection(_0x33ff6f, "cube", _0x28e9cc);
    return _0x33ff6f;
  });
  commit();
  return _0x28e9cc;
}
export function addPanoramaSceneMannequinGrid({
  nodeId: _0x68f7e1,
  viewPose: _0x3111b0,
  storeInstance = a1092_0x1bb930
}) {
  const _0x122871 = getSceneState(storeInstance, _0x68f7e1);
  const _0x15009c = pickFacingCameraYaw(_0x3111b0);
  const _0x2c8be0 = resolveBatchPlacementOrigin({
    sceneMode: _0x122871.mode,
    sceneViewTarget: _0x122871?.viewport?.sceneView?.target,
    pose: _0x3111b0,
    groundY: 0,
    forwardDistance: MANNEQUIN_FORWARD_PLACEMENT_DISTANCE
  });
  const _0x40b4c7 = computeGridPlacement({
    rows: _0x122871.gridPlacement.rows,
    cols: _0x122871.gridPlacement.cols,
    spacingX: _0x122871.gridPlacement.spacingX,
    spacingZ: _0x122871.gridPlacement.spacingZ,
    origin: _0x2c8be0,
    yaw: _0x15009c
  });
  if (_0x40b4c7.length === 0) {
    return [];
  }
  const _0x113fac = [];
  const _0x246cf4 = generateId("mannequin-group");
  writeSceneState(storeInstance, _0x68f7e1, _0x24acd4 => {
    const _0xeb069c = cloneSceneState(_0x24acd4);
    for (const _0x1b0ee5 of _0x40b4c7) {
      const _0x2fc283 = generateId("mannequin");
      _0x113fac.push(_0x2fc283);
      _0xeb069c.mannequins.push({
        id: _0x2fc283,
        gender: _0xeb069c.gridPlacement.gender,
        colorKey: _0xeb069c.gridPlacement.colorKey,
        poseId: DEFAULT_MANNEQUIN_POSE_ID,
        bonePose: {},
        position: _0x1b0ee5,
        rotation: {
          x: 0,
          y: _0x15009c,
          z: 0
        },
        scale: 1
      });
    }
    _0xeb069c.groups = Array.isArray(_0xeb069c.groups) ? _0xeb069c.groups : [];
    _0xeb069c.groups.push({
      id: _0x246cf4,
      type: "mannequin-grid",
      memberObjectType: "mannequin",
      memberIds: [..._0x113fac]
    });
    setSelectionFromObjects(_0xeb069c, _0x113fac.map(_0x453436 => ({
      objectType: "mannequin",
      objectId: _0x453436
    })), {
      preferredGroupId: _0x246cf4,
      preferredActiveType: "mannequin",
      preferredActiveId: _0x113fac[0] || null
    });
    return _0xeb069c;
  });
  commit();
  return _0x113fac;
}
export function addPanoramaSceneCamera({
  nodeId: _0x266be8,
  viewPose: _0x54f6a7,
  storeInstance = a1092_0x1bb930
}) {
  const _0x11e0e6 = getStoreNode(storeInstance, _0x266be8);
  if (isPanorama360NodeType(_0x11e0e6?.type)) {
    return null;
  }
  const _0x115e7c = getSceneState(storeInstance, _0x266be8);
  if (_0x115e7c.cameras.length >= PANORAMA_SCENE_CAMERA_LIMIT) {
    showWarning(panoramaSceneText("camera.limitWarning", {
      count: PANORAMA_SCENE_CAMERA_LIMIT
    }));
    return null;
  }
  const _0x2b6a4a = sanitizeCameraPose(_0x54f6a7);
  const _0x1acdd8 = generateId("scene-camera");
  const _0x2e0543 = resolveFirstFreeCameraSlot(_0x115e7c.cameras);
  if (!_0x2e0543) {
    showWarning(panoramaSceneText("camera.limitWarning", {
      count: PANORAMA_SCENE_CAMERA_LIMIT
    }));
    return null;
  }
  writeSceneState(storeInstance, _0x266be8, _0x409d6f => {
    const _0x5f03a6 = cloneSceneState(_0x409d6f);
    _0x5f03a6.cameras.push({
      id: _0x1acdd8,
      slot: _0x2e0543,
      name: panoramaSceneText("camera.defaultName", {
        slot: toCameraSlotLabel(_0x2e0543)
      }),
      position: _0x2b6a4a.position,
      quaternion: _0x2b6a4a.quaternion,
      rotation: _0x2b6a4a.rotation,
      focalLength: _0x2b6a4a.focalLength
    });
    if (_0x5f03a6.mode === "panorama") {
      _0x5f03a6.viewport.activeView = "camera";
      _0x5f03a6.viewport.activeCameraId = _0x1acdd8;
    }
    return _0x5f03a6;
  });
  commit();
  return _0x1acdd8;
}
export function upsertPanoramaSceneCustomPose({
  nodeId: _0x4d6333,
  pose: _0x27663c,
  storeInstance = a1092_0x1bb930
}) {
  const _0x12f316 = normalizeCustomMannequinPose(_0x27663c);
  const _0x54b11b = _0x12f316.id && _0x12f316.id !== "custom" ? _0x12f316.id : generateId("mannequin-pose");
  const _0x2544e0 = {
    ..._0x12f316,
    id: _0x54b11b
  };
  writeSceneState(storeInstance, _0x4d6333, _0x22fa2e => {
    const _0x1a6dfa = cloneSceneState(_0x22fa2e);
    const _0x34332a = Array.isArray(_0x1a6dfa.customPoses) ? _0x1a6dfa.customPoses : [];
    _0x1a6dfa.customPoses = [..._0x34332a.filter(_0x318909 => _0x318909.id !== _0x54b11b), _0x2544e0];
    return _0x1a6dfa;
  });
  commit();
  return _0x2544e0;
}
export function applyPanoramaSceneMannequinPose({
  nodeId: _0x3ae607,
  mannequinId: _0x2deac4,
  poseId = DEFAULT_MANNEQUIN_POSE_ID,
  bonePose = null,
  customPose = null,
  storeInstance = a1092_0x1bb930
}) {
  const _0x1a84f8 = String(_0x2deac4 || "").trim();
  if (!_0x1a84f8) {
    return null;
  }
  let _0xa25357 = null;
  writeSceneState(storeInstance, _0x3ae607, _0x1ab2ec => {
    const _0x1f1c67 = cloneSceneState(_0x1ab2ec);
    const _0x32f54a = customPose ? {
      ...normalizeCustomMannequinPose(customPose),
      id: String(customPose.id || "").trim() || generateId("mannequin-pose")
    } : null;
    if (_0x32f54a) {
      _0x1f1c67.customPoses = [...(_0x1f1c67.customPoses || []).filter(_0x4a7811 => _0x4a7811.id !== _0x32f54a.id), _0x32f54a];
    }
    const _0x4d81e3 = _0x32f54a?.id || (poseId !== "custom" ? String(poseId || "").trim() : "");
    const _0x11b843 = (_0x1f1c67.customPoses || []).find(_0x114723 => _0x114723.id === _0x4d81e3);
    const _0x51ce64 = bonePose ? createCustomMannequinPose({
      id: _0x11b843?.id || _0x32f54a?.id || "custom",
      name: _0x11b843?.name || _0x32f54a?.name || "Custom pose",
      bones: bonePose
    }) : _0x11b843 || resolveMannequinPose(poseId, _0x32f54a);
    _0xa25357 = _0x51ce64;
    _0x1f1c67.mannequins = _0x1f1c67.mannequins.map(_0x26a313 => _0x26a313.id === _0x1a84f8 ? {
      ..._0x26a313,
      poseId: _0x51ce64?.category === "custom" ? "custom" : _0x51ce64?.id || DEFAULT_MANNEQUIN_POSE_ID,
      customPoseId: _0x51ce64?.category === "custom" ? _0x51ce64.id : null,
      bonePose: normalizeBonePose(_0x51ce64?.bones)
    } : _0x26a313);
    setSingleSelection(_0x1f1c67, "mannequin", _0x1a84f8);
    return _0x1f1c67;
  });
  commit();
  return _0xa25357;
}
export function addPanoramaSceneCameraKeyframe({
  nodeId: _0x19d60a,
  keyframe = {},
  viewPose = null,
  storeInstance = a1092_0x1bb930
}) {
  const _0x409145 = getSceneState(storeInstance, _0x19d60a);
  const _0x30dd98 = normalizeCameraTimeline(_0x409145.cameraTimeline);
  const _0x48ee4f = normalizeCompositionPoint(viewPose?.position, {
    x: 0,
    y: 1.6,
    z: 6
  });
  const _0x3aba2d = normalizeCompositionPoint(keyframe?.position, _0x48ee4f);
  const _0x53ce1b = normalizeCompositionPoint(viewPose?.forward, {
    x: 0,
    y: 0,
    z: -1
  });
  const _0x590525 = {
    x: _0x3aba2d.x + _0x53ce1b.x * 5,
    y: _0x3aba2d.y + _0x53ce1b.y * 5,
    z: _0x3aba2d.z + _0x53ce1b.z * 5
  };
  const _0x160848 = normalizeCompositionPoint(keyframe?.target, _0x590525);
  const _0x214222 = Number(keyframe.fov ?? viewPose?.fov);
  const _0x2f6170 = {
    id: String(keyframe.id || "").trim() || generateId("camera-keyframe"),
    time: Number.isFinite(Number(keyframe.time)) ? Number(keyframe.time) : _0x30dd98.currentTime,
    position: _0x3aba2d,
    target: _0x160848,
    fov: Number.isFinite(_0x214222) ? _0x214222 : 55,
    easing: keyframe.easing || "ease-in-out"
  };
  writeSceneState(storeInstance, _0x19d60a, _0x499221 => {
    const _0x103a33 = cloneSceneState(_0x499221);
    _0x103a33.cameraTimeline = upsertCameraKeyframe(_0x103a33.cameraTimeline, _0x2f6170);
    return _0x103a33;
  });
  commit();
  return _0x2f6170.id;
}
export function updatePanoramaSceneCameraTimeline({
  nodeId: _0x51130f,
  timeline = null,
  patch = null,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x51130f, _0x3bce32 => {
    const _0x49ca90 = cloneSceneState(_0x3bce32);
    _0x49ca90.cameraTimeline = timeline ? normalizeCameraTimeline(timeline) : updateCameraTimelineSettings(_0x49ca90.cameraTimeline, patch || {});
    return _0x49ca90;
  });
  commit();
}
export function deletePanoramaSceneCameraKeyframe({
  nodeId: _0xe6b95e,
  keyframeId: _0x4427f5,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0xe6b95e, _0x313ccd => {
    const _0x22f46e = cloneSceneState(_0x313ccd);
    _0x22f46e.cameraTimeline = removeCameraKeyframe(_0x22f46e.cameraTimeline, _0x4427f5);
    return _0x22f46e;
  });
  commit();
}
function normalizeCompositionPoint(_0x273238, _0x1e360f) {
  return {
    x: Number.isFinite(Number(_0x273238?.x)) ? Number(_0x273238.x) : _0x1e360f.x,
    y: Number.isFinite(Number(_0x273238?.y)) ? Number(_0x273238.y) : _0x1e360f.y,
    z: Number.isFinite(Number(_0x273238?.z)) ? Number(_0x273238.z) : _0x1e360f.z
  };
}
export function composePanoramaScene({
  nodeId: _0x444971,
  assets = [],
  mannequins = [],
  cameraTimeline = null,
  environmentMode = null,
  replaceExisting = false,
  storeInstance = a1092_0x1bb930
}) {
  const _0x10d2aa = getStoreNode(storeInstance, _0x444971);
  if (!_0x10d2aa || isPanorama360NodeType(_0x10d2aa.type)) {
    return null;
  }
  const _0xa07b7c = [];
  const _0x19dfed = [];
  writeSceneState(storeInstance, _0x444971, _0x3aa1ff => {
    const _0x55cf38 = cloneSceneState(_0x3aa1ff);
    if (replaceExisting) {
      _0x55cf38.cubes = [];
      _0x55cf38.mannequins = [];
      _0x55cf38.groups = [];
      clearSelection(_0x55cf38);
    }
    if (environmentMode) {
      _0x55cf38.environmentMode = environmentMode === "day" ? "day" : "night";
    }
    const _0x4e2138 = Array.isArray(assets) ? assets : [];
    _0x4e2138.forEach((_0x208955, _0x2ac7ad) => {
      const _0x5d22f0 = resolveSceneAsset(_0x208955?.assetId || _0x208955?.id);
      if (!_0x5d22f0) {
        return;
      }
      const _0x237509 = generateId("scene-asset");
      _0xa07b7c.push(_0x237509);
      const _0x547e17 = {
        x: (_0x2ac7ad % 4 - Math.min(1.5, (_0x4e2138.length - 1) / 2)) * 2.2,
        y: 0,
        z: Math.floor(_0x2ac7ad / 4) * 2.2
      };
      _0x55cf38.cubes.push({
        id: _0x237509,
        assetId: _0x5d22f0.id,
        colorKey: _0x208955?.colorKey || _0x5d22f0.colorKey || "blue",
        position: normalizeCompositionPoint(_0x208955?.position, _0x547e17),
        rotation: normalizeCompositionPoint(_0x208955?.rotation, {
          x: 0,
          y: 0,
          z: 0
        }),
        scale: _0x208955?.scale ?? 1
      });
    });
    const _0x4c5cdf = Array.isArray(mannequins) ? mannequins : [];
    _0x4c5cdf.forEach((_0x1f96d5, _0x65a997) => {
      const _0x311a49 = generateId("mannequin");
      _0x19dfed.push(_0x311a49);
      const _0x280685 = _0x1f96d5?.bonePose ? createCustomMannequinPose({
        bones: _0x1f96d5.bonePose
      }) : resolveMannequinPose(_0x1f96d5?.poseId);
      _0x55cf38.mannequins.push({
        id: _0x311a49,
        gender: _0x1f96d5?.gender === "female" ? "female" : "male",
        colorKey: _0x1f96d5?.colorKey || "blue",
        poseId: _0x280685?.category === "custom" ? "custom" : _0x280685?.id || DEFAULT_MANNEQUIN_POSE_ID,
        customPoseId: null,
        bonePose: normalizeBonePose(_0x280685?.bones),
        position: normalizeCompositionPoint(_0x1f96d5?.position, {
          x: (_0x65a997 - (_0x4c5cdf.length - 1) / 2) * 1.5,
          y: 0,
          z: 0
        }),
        rotation: normalizeCompositionPoint(_0x1f96d5?.rotation, {
          x: 0,
          y: Math.PI,
          z: 0
        }),
        scale: _0x1f96d5?.scale ?? 1
      });
    });
    if (cameraTimeline) {
      _0x55cf38.cameraTimeline = normalizeCameraTimeline(cameraTimeline);
    }
    const _0x44f3d6 = _0x19dfed.at(-1);
    const _0x3b3463 = _0xa07b7c.at(-1);
    if (_0x44f3d6) {
      setSingleSelection(_0x55cf38, "mannequin", _0x44f3d6);
    } else if (_0x3b3463) {
      setSingleSelection(_0x55cf38, "cube", _0x3b3463);
    }
    return _0x55cf38;
  });
  commit();
  return {
    nodeId: _0x444971,
    assetIds: _0xa07b7c,
    mannequinIds: _0x19dfed
  };
}
export function updatePanoramaSceneObjectTransform({
  nodeId: _0x34f339,
  objectType: _0x50b6b3,
  objectId: _0x20042e,
  pose: _0x339f77,
  targets: _0x69c13f,
  storeInstance = a1092_0x1bb930
}) {
  const _0x33d82d = Array.isArray(_0x69c13f) ? _0x69c13f : [];
  const _0x42394f = _0x339f77 ? sanitizeObjectPose(_0x339f77) : null;
  writeSceneState(storeInstance, _0x34f339, _0x25d115 => {
    const _0x1d2070 = cloneSceneState(_0x25d115);
    if (_0x33d82d.length > 0) {
      const _0x296044 = new Map();
      const _0x3f673b = new Map();
      _0x33d82d.forEach(_0x3706fc => {
        if (!_0x3706fc?.objectId || !_0x3706fc?.objectType || !_0x3706fc?.pose) {
          return;
        }
        const _0x2b9d4c = sanitizeObjectPose(_0x3706fc.pose);
        if (_0x3706fc.objectType === "mannequin") {
          _0x296044.set(String(_0x3706fc.objectId), _0x2b9d4c);
        } else if (_0x3706fc.objectType === "cube") {
          _0x3f673b.set(String(_0x3706fc.objectId), _0x2b9d4c);
        }
      });
      if (_0x296044.size > 0) {
        _0x1d2070.mannequins = _0x1d2070.mannequins.map(_0x4c17a2 => {
          const _0x550421 = _0x296044.get(_0x4c17a2.id);
          if (!_0x550421) {
            return _0x4c17a2;
          }
          const _0x34a2ad = composeCompatibleScale(_0x550421.scale, _0x4c17a2.scale);
          return {
            ..._0x4c17a2,
            position: _0x550421.position,
            rotation: _0x550421.rotation,
            quaternion: _0x550421.quaternion,
            scale: _0x34a2ad
          };
        });
      }
      if (_0x3f673b.size > 0) {
        _0x1d2070.cubes = _0x1d2070.cubes.map(_0x5a89af => {
          const _0x4f99e6 = _0x3f673b.get(_0x5a89af.id);
          if (!_0x4f99e6) {
            return _0x5a89af;
          }
          const _0x407881 = composeCompatibleScale(_0x4f99e6.scale, _0x5a89af.scale);
          return {
            ..._0x5a89af,
            position: _0x4f99e6.position,
            rotation: _0x4f99e6.rotation,
            quaternion: _0x4f99e6.quaternion,
            scale: _0x407881
          };
        });
      }
      if (_0x1d2070.selection.selectedGroupId) {
        const _0x34cdb7 = (_0x1d2070.groups || []).find(_0x1e8587 => _0x1e8587.id === _0x1d2070.selection.selectedGroupId);
        if (_0x34cdb7) {
          setSelectionFromObjects(_0x1d2070, _0x34cdb7.memberIds.map(_0x5b4500 => ({
            objectType: "mannequin",
            objectId: _0x5b4500
          })), {
            preferredGroupId: _0x34cdb7.id,
            preferredActiveType: "mannequin",
            preferredActiveId: _0x34cdb7.memberIds[0] || null
          });
        }
      }
      return _0x1d2070;
    }
    if (_0x50b6b3 === "camera") {
      return _0x1d2070;
    }
    if (_0x50b6b3 === "mannequin" && _0x42394f && _0x20042e) {
      _0x1d2070.mannequins = _0x1d2070.mannequins.map(_0x43f215 => _0x43f215.id === _0x20042e ? {
        ..._0x43f215,
        position: _0x42394f.position,
        rotation: _0x42394f.rotation,
        quaternion: _0x42394f.quaternion,
        scale: composeCompatibleScale(_0x42394f.scale, _0x43f215.scale)
      } : _0x43f215);
      setSingleSelection(_0x1d2070, "mannequin", _0x20042e);
    } else if (_0x50b6b3 === "cube" && _0x42394f && _0x20042e) {
      _0x1d2070.cubes = _0x1d2070.cubes.map(_0x3f97f1 => _0x3f97f1.id === _0x20042e ? {
        ..._0x3f97f1,
        position: _0x42394f.position,
        rotation: _0x42394f.rotation,
        quaternion: _0x42394f.quaternion,
        scale: composeCompatibleScale(_0x42394f.scale, _0x3f97f1.scale)
      } : _0x3f97f1);
      setSingleSelection(_0x1d2070, "cube", _0x20042e);
    }
    return _0x1d2070;
  });
  commit();
}
export function deletePanoramaSceneCamera({
  nodeId: _0x3eb2e5,
  cameraId: _0x1db54f,
  storeInstance = a1092_0x1bb930
}) {
  const _0x27c812 = getStoreNode(storeInstance, _0x3eb2e5);
  if (isPanorama360NodeType(_0x27c812?.type)) {
    return;
  }
  const _0x527b9c = getSceneState(storeInstance, _0x3eb2e5);
  if (!_0x527b9c.cameras.some(_0x3f9a72 => _0x3f9a72.id === _0x1db54f)) {
    return;
  }
  writeSceneState(storeInstance, _0x3eb2e5, _0x524fc1 => {
    const _0x45ddd0 = finalizeSelectedObjectRemoval(_0x524fc1, "camera", _0x1db54f);
    _0x45ddd0.cameras = _0x45ddd0.cameras.filter(_0x546820 => _0x546820.id !== _0x1db54f);
    return _0x45ddd0;
  });
  commit();
}
export function deleteSelectedPanoramaSceneObject({
  nodeId: _0x5edc05,
  storeInstance = a1092_0x1bb930
}) {
  const _0x580f33 = getSceneState(storeInstance, _0x5edc05);
  const _0x8d00a7 = collectSelectionObjects(_0x580f33);
  const _0x94733b = _0x580f33.selection.selectedObjectType;
  const _0x3d3ea3 = _0x580f33.selection.selectedObjectId;
  const _0xc204b9 = _0x580f33?.viewport?.activeView === "camera" && _0x580f33?.viewport?.activeCameraId ? String(_0x580f33.viewport.activeCameraId) : null;
  const _0x5dbb4e = _0x580f33.selection.selectedGroupId || null;
  if (_0x5dbb4e) {
    writeSceneState(storeInstance, _0x5edc05, _0x1413f4 => {
      const _0x3c05d3 = cloneSceneState(_0x1413f4);
      const _0x84501a = (_0x3c05d3.groups || []).find(_0x4ffeed => _0x4ffeed.id === _0x5dbb4e);
      if (!_0x84501a) {
        clearSelection(_0x3c05d3);
        return _0x3c05d3;
      }
      const _0x457d78 = new Set(_0x84501a.memberIds);
      _0x3c05d3.mannequins = _0x3c05d3.mannequins.filter(_0x24e1d2 => !_0x457d78.has(_0x24e1d2.id));
      _0x3c05d3.groups = pruneGroups(_0x3c05d3.groups, [..._0x457d78]).filter(_0x5bd730 => _0x5bd730.id !== _0x5dbb4e);
      clearSelection(_0x3c05d3);
      return _0x3c05d3;
    });
    commit();
    return;
  }
  if (_0x8d00a7.length > 1) {
    writeSceneState(storeInstance, _0x5edc05, _0x842a86 => {
      const _0x1a9f33 = cloneSceneState(_0x842a86);
      const _0x4bde64 = new Set(_0x8d00a7.filter(_0x3636d1 => _0x3636d1.objectType === "cube").map(_0x3d764c => _0x3d764c.objectId));
      const _0x30de28 = new Set(_0x8d00a7.filter(_0x26fadd => _0x26fadd.objectType === "mannequin").map(_0x369759 => _0x369759.objectId));
      if (_0x4bde64.size > 0) {
        _0x1a9f33.cubes = _0x1a9f33.cubes.filter(_0x58a9b5 => !_0x4bde64.has(_0x58a9b5.id));
      }
      if (_0x30de28.size > 0) {
        const _0x63dce3 = [..._0x30de28];
        _0x1a9f33.mannequins = _0x1a9f33.mannequins.filter(_0x2dfa4f => !_0x30de28.has(_0x2dfa4f.id));
        _0x1a9f33.groups = pruneGroups(_0x1a9f33.groups, _0x63dce3);
      }
      clearSelection(_0x1a9f33);
      return _0x1a9f33;
    });
    commit();
    return;
  }
  const _0x346e2a = _0x8d00a7.length === 1 ? _0x8d00a7[0] : _0x94733b && _0x3d3ea3 ? {
    objectType: _0x94733b,
    objectId: _0x3d3ea3
  } : _0xc204b9 ? {
    objectType: "camera",
    objectId: _0xc204b9
  } : null;
  if (!_0x346e2a?.objectType || !_0x346e2a?.objectId) {
    return;
  }
  writeSceneState(storeInstance, _0x5edc05, _0x321513 => {
    const _0x1231b1 = finalizeSelectedObjectRemoval(_0x321513, _0x346e2a.objectType, _0x346e2a.objectId);
    if (_0x346e2a.objectType === "camera") {
      _0x1231b1.cameras = _0x1231b1.cameras.filter(_0x4deb5d => _0x4deb5d.id !== _0x346e2a.objectId);
    } else if (_0x346e2a.objectType === "cube") {
      _0x1231b1.cubes = _0x1231b1.cubes.filter(_0x5907f4 => _0x5907f4.id !== _0x346e2a.objectId);
    } else {
      _0x1231b1.mannequins = _0x1231b1.mannequins.filter(_0x5c16a4 => _0x5c16a4.id !== _0x346e2a.objectId);
      _0x1231b1.groups = pruneGroups(_0x1231b1.groups, [_0x346e2a.objectId]);
    }
    return _0x1231b1;
  });
  commit();
}
function createCapturePreviewUrl(_0x1d869d) {
  const _0x2670eb = globalThis.window?.URL || globalThis.URL;
  if (!_0x1d869d || typeof _0x2670eb?.createObjectURL !== "function") {
    return "";
  }
  try {
    return _0x2670eb.createObjectURL(_0x1d869d);
  } catch {
    return "";
  }
}
function buildSavedCapturePatch(_0x466f69, _0x435a19 = {}) {
  const _0x776b6f = pickResultLocalPath(_0x466f69);
  const _0x4f9913 = localPathToUrl(_0x776b6f) || String(_0x466f69?.url || "").trim();
  if (!_0x776b6f || !_0x4f9913) {
    throw new Error(panoramaSceneText("capture.saveInvalidPath"));
  }
  const _0x275c07 = {
    src: _0x4f9913,
    localPath: _0x776b6f,
    originalLocalPath: normalizeLocalPath(_0x466f69?.originalLocalPath || _0x776b6f),
    displayLocalPath: normalizeLocalPath(_0x466f69?.displayLocalPath),
    thumbLocalPath: normalizeLocalPath(_0x466f69?.thumbLocalPath),
    fileName: _0x466f69?.filename || _0x435a19.fileName || "",
    captureSavePending: false,
    captureSaveError: null
  };
  const _0x4707f1 = Number(_0x466f69?.originalWidth || _0x435a19.originalWidth || _0x435a19.width || 0);
  const _0x7d763d = Number(_0x466f69?.originalHeight || _0x435a19.originalHeight || _0x435a19.height || 0);
  if (_0x4707f1 > 0) {
    _0x275c07.originalWidth = _0x4707f1;
  }
  if (_0x7d763d > 0) {
    _0x275c07.originalHeight = _0x7d763d;
  }
  return _0x275c07;
}
export async function capturePanoramaSceneViewport({
  nodeId: _0x3bef8a,
  captureViewport: _0x438cd6,
  captureBlob: _0xdf06d1,
  storeInstance = a1092_0x1bb930,
  saveBlob = saveOutputBlob,
  createPreviewUrl = createCapturePreviewUrl
}) {
  const _0x2c2b1a = typeof _0xdf06d1 === "function" ? _0xdf06d1 : typeof _0x438cd6 === "function" ? _0x438cd6 : null;
  if (!_0x2c2b1a) {
    return null;
  }
  const _0x44d117 = createNodeActionContext({
    storeInstance: storeInstance
  });
  const _0x4e6786 = getStoreNode(_0x44d117.storeInstance, _0x3bef8a);
  if (!_0x4e6786) {
    return null;
  }
  const _0x5be758 = getSceneState(_0x44d117.storeInstance, _0x3bef8a);
  if (_0x5be758.capture.pending) {
    showWarning(panoramaSceneText("capture.pending"));
    return null;
  }
  writeSceneState(_0x44d117.storeInstance, _0x3bef8a, _0x2c7656 => {
    const _0x475e12 = cloneSceneState(_0x2c7656);
    _0x475e12.capture.pending = true;
    _0x475e12.capture.error = null;
    return _0x475e12;
  });
  try {
    const _0xc32e69 = await _0x2c2b1a();
    if (!_0xc32e69) {
      throw new Error(panoramaSceneText("capture.noImage"));
    }
    const _0x4db821 = "scene_capture_" + Date.now() + ".png";
    const _0xb11737 = buildSourceMediaNodePayload({
      id: "__seed__",
      type: "source-image",
      x: 0,
      y: 0,
      name: panoramaSceneText("capture.nodeName"),
      fileName: _0x4db821
    });
    const _0x2e9233 = _0x44d117.storeInstance.getStateRaw();
    const _0x35a5aa = calcSafeSpawnPosNearNode(_0x2e9233.nodes || {}, _0x4e6786, _0xb11737.width, _0xb11737.height);
    const _0x12e563 = generateId("source-image");
    const _0x2231c3 = createPreviewUrl(_0xc32e69) || "";
    _0x44d117.storeInstance.batch(() => {
      writeSceneState(_0x44d117.storeInstance, _0x3bef8a, _0x36a3d8 => {
        const _0x48ae56 = cloneSceneState(_0x36a3d8);
        _0x48ae56.capture.pending = false;
        _0x48ae56.capture.error = null;
        _0x48ae56.capture.lastCaptureAt = Date.now();
        return _0x48ae56;
      });
      _0x44d117.storeInstance.addNode(buildSourceMediaNodePayload({
        id: _0x12e563,
        type: "source-image",
        x: _0x35a5aa.x,
        y: _0x35a5aa.y,
        name: panoramaSceneText("capture.nodeName"),
        fileName: _0x4db821,
        capturePreviewUrl: _0x2231c3,
        captureSavePending: true,
        captureSaveError: null
      }));
    });
    commit();
    showSuccess(panoramaSceneText("capture.success"));
    Promise.resolve().then(() => saveBlob(_0xc32e69, {
      ext: "png"
    })).then(_0x336fba => {
      if (!_0x44d117.storeInstance.getStateRaw().nodes?.[_0x12e563]) {
        return;
      }
      _0x44d117.storeInstance.updateNodeData(_0x12e563, buildSavedCapturePatch(_0x336fba, {
        fileName: _0x4db821,
        width: _0xb11737.width,
        height: _0xb11737.height
      }));
    }).catch(_0x449d23 => {
      const _0x2991d7 = String(_0x449d23?.message || panoramaSceneText("capture.localSaveFailed"));
      console.warn("[PanoramaScene] save capture failed:", _0x449d23);
      if (_0x44d117.storeInstance.getStateRaw().nodes?.[_0x12e563]) {
        _0x44d117.storeInstance.updateNodeData(_0x12e563, {
          captureSavePending: false,
          captureSaveError: _0x2991d7
        });
      }
      showWarning(panoramaSceneText("capture.localSaveWarning"));
    });
    return _0x12e563;
  } catch (_0x411023) {
    const _0x561e53 = String(_0x411023?.message || panoramaSceneText("capture.failed"));
    writeSceneState(_0x44d117.storeInstance, _0x3bef8a, _0x5058aa => {
      const _0x3616e9 = cloneSceneState(_0x5058aa);
      _0x3616e9.capture.pending = false;
      _0x3616e9.capture.error = _0x561e53;
      return _0x3616e9;
    });
    showError(panoramaSceneText("capture.failedWithError", {
      error: _0x561e53
    }));
    return null;
  }
}
export function renamePanoramaSceneCamera({
  nodeId: _0x4966d9,
  cameraId: _0x12f7d2,
  name: _0x530e54,
  storeInstance = a1092_0x1bb930
}) {
  writeSceneState(storeInstance, _0x4966d9, _0x34c78f => {
    const _0x486f41 = cloneSceneState(_0x34c78f);
    _0x486f41.cameras = _0x486f41.cameras.map(_0x198a68 => _0x198a68.id === _0x12f7d2 ? {
      ..._0x198a68,
      name: String(_0x530e54 || _0x198a68.name || panoramaSceneText("camera.fallbackName")).trim() || _0x198a68.name
    } : _0x198a68);
    return _0x486f41;
  });
}
export function setPanoramaSceneCollapsed({
  nodeId: _0x2832d8,
  isCollapsed: _0x3009cd,
  enterEditingOnExpand = false,
  storeInstance = a1092_0x1bb930
}) {
  const _0x1fc13d = getStoreNode(storeInstance, _0x2832d8);
  if (!_0x1fc13d) {
    return;
  }
  const _0x25128b = typeof _0x3009cd === "boolean" ? _0x3009cd : _0x1fc13d.isCollapsed !== true;
  if (_0x25128b === (_0x1fc13d.isCollapsed === true)) {
    return;
  }
  const _0x38931a = enterEditingOnExpand === true && _0x25128b === false;
  const _0x1caae3 = Number(_0x1fc13d._originalWidth) || Number(_0x1fc13d.width) || PANORAMA_SCENE_DEFAULT_SIZE.width;
  const _0x5e76ef = Number(_0x1fc13d._originalHeight) || Number(_0x1fc13d.height) || PANORAMA_SCENE_DEFAULT_SIZE.height;
  const _0x4f7bf9 = computeCollapsedDimensions(_0x1caae3, _0x5e76ef);
  storeInstance.batch(() => {
    writeSceneState(storeInstance, _0x2832d8, _0x1aeaeb => {
      const _0x341395 = cloneSceneState(_0x1aeaeb);
      _0x341395.ui.isEditing = _0x38931a;
      _0x341395.ui.showCameraList = false;
      return _0x341395;
    });
    storeInstance.updateNodeData(_0x2832d8, {
      isCollapsed: _0x25128b,
      _originalWidth: _0x1caae3,
      _originalHeight: _0x5e76ef,
      width: _0x25128b ? _0x4f7bf9.width : _0x1caae3,
      height: _0x25128b ? _0x4f7bf9.height : _0x5e76ef
    });
  });
  commit();
}
export function focusPanoramaSceneSelection({
  nodeId: _0x4305e4,
  frame = null,
  storeInstance = a1092_0x1bb930
}) {
  const _0x39dd94 = getSceneState(storeInstance, _0x4305e4);
  const _0x478ffb = getSelectedObject(_0x39dd94);
  if (!_0x478ffb) {
    return false;
  }
  if (_0x478ffb.objectType === "camera") {
    activatePanoramaSceneCamera({
      nodeId: _0x4305e4,
      cameraId: _0x478ffb.item.id,
      storeInstance: storeInstance
    });
    return true;
  }
  const _0x449e61 = _0x478ffb.item;
  const _0x5a66a8 = getSceneObjectHeightOffset(_0x478ffb.objectType);
  const _0x1a34e1 = Number.isFinite(Number(frame?.center?.x)) && Number.isFinite(Number(frame?.center?.y)) && Number.isFinite(Number(frame?.center?.z)) ? {
    x: Number(frame.center.x),
    y: Number(frame.center.y),
    z: Number(frame.center.z)
  } : null;
  const _0x385d0b = _0x1a34e1 || {
    x: Number(_0x449e61.position?.x) || 0,
    y: (Number(_0x449e61.position?.y) || 0) + _0x5a66a8,
    z: Number(_0x449e61.position?.z) || 0
  };
  if (_0x39dd94.mode === "panorama") {
    const _0x19d645 = _0x385d0b.x;
    const _0x3f6f4e = _0x385d0b.y - 1.6;
    const _0x22133b = _0x385d0b.z;
    const _0x30fe94 = Math.hypot(_0x19d645, _0x3f6f4e, _0x22133b) || 1;
    applyPanoramaSceneViewCommit({
      nodeId: _0x4305e4,
      panoramaView: {
        ..._0x39dd94.viewport.panoramaView,
        yaw: Math.atan2(_0x19d645, _0x22133b || 0.0001),
        pitch: clampPanoramaPitch(Math.asin(_0x3f6f4e / _0x30fe94))
      },
      activeView: "default",
      activeCameraId: null,
      storeInstance: storeInstance
    });
    return true;
  }
  applyPanoramaSceneViewCommit({
    nodeId: _0x4305e4,
    sceneView: {
      ..._0x39dd94.viewport.sceneView,
      target: _0x385d0b,
      ...(Number.isFinite(Number(frame?.radius)) ? {
        orbitDistance: computePerspectiveFrameDistance({
          radius: Number(frame.radius),
          fov: frame?.fov,
          aspect: frame?.aspect,
          padding: frame?.padding
        })
      } : {})
    },
    activeView: "default",
    activeCameraId: null,
    storeInstance: storeInstance
  });
  return true;
}