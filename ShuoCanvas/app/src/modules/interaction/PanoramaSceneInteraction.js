import { applyOrbitDelta, applyPanoramaLookDelta, applyPanoramaZoomDelta, applySceneFlyLookDelta, applySceneFlyMovement, applySceneDollyDelta, applyScenePanDelta, applySceneZoomDelta, normalizeWheelDelta } from "../../core/panoramaSceneMath.js";
import * as a1027_0x23ca48 from "../panoramaSceneNode/threeRuntime.js";
import { applyTransformInteractionOptions } from "../panoramaSceneNode/transformInteractionAdapter.js";
const MOVE_THRESHOLD = 3;
function hasFiniteQuaternion(_0x41dcfb) {
  return Number.isFinite(Number(_0x41dcfb?.x)) && Number.isFinite(Number(_0x41dcfb?.y)) && Number.isFinite(Number(_0x41dcfb?.z)) && Number.isFinite(Number(_0x41dcfb?.w));
}
function cloneObjectPose(_0x4b3149) {
  const _0x4e17b1 = Number.isFinite(_0x4b3149?.scale) ? Number(_0x4b3149.scale) || 1 : _0x4b3149?.scale && Number.isFinite(_0x4b3149.scale.x) && Number.isFinite(_0x4b3149.scale.y) && Number.isFinite(_0x4b3149.scale.z) ? {
    x: Number(_0x4b3149.scale.x) || 1,
    y: Number(_0x4b3149.scale.y) || 1,
    z: Number(_0x4b3149.scale.z) || 1
  } : 1;
  const _0x2bf8f5 = {
    x: Number(_0x4b3149?.rotation?.x) || 0,
    y: Number(_0x4b3149?.rotation?.y) || 0,
    z: Number(_0x4b3149?.rotation?.z) || 0
  };
  const _0x3369da = hasFiniteQuaternion(_0x4b3149?.quaternion) ? new a1027_0x23ca48.Quaternion(Number(_0x4b3149.quaternion.x), Number(_0x4b3149.quaternion.y), Number(_0x4b3149.quaternion.z), Number(_0x4b3149.quaternion.w)).normalize() : new a1027_0x23ca48.Quaternion().setFromEuler(new a1027_0x23ca48.Euler(_0x2bf8f5.x, _0x2bf8f5.y, _0x2bf8f5.z, "XYZ"));
  return {
    position: {
      x: Number(_0x4b3149?.position?.x) || 0,
      y: Number(_0x4b3149?.position?.y) || 0,
      z: Number(_0x4b3149?.position?.z) || 0
    },
    rotation: _0x2bf8f5,
    quaternion: {
      x: _0x3369da.x,
      y: _0x3369da.y,
      z: _0x3369da.z,
      w: _0x3369da.w
    },
    fov: Number(_0x4b3149?.fov) || 58,
    scale: _0x4e17b1
  };
}
function toScaleVector(_0x3df635) {
  if (Number.isFinite(_0x3df635)) {
    const _0x4e6341 = Math.max(0.01, Number(_0x3df635) || 1);
    return {
      x: _0x4e6341,
      y: _0x4e6341,
      z: _0x4e6341
    };
  }
  if (_0x3df635 && Number.isFinite(_0x3df635.x) && Number.isFinite(_0x3df635.y) && Number.isFinite(_0x3df635.z)) {
    return {
      x: Math.max(0.01, Number(_0x3df635.x) || 1),
      y: Math.max(0.01, Number(_0x3df635.y) || 1),
      z: Math.max(0.01, Number(_0x3df635.z) || 1)
    };
  }
  return {
    x: 1,
    y: 1,
    z: 1
  };
}
function toCompatibleScale(_0x4bc228) {
  const _0x3b0d31 = toScaleVector(_0x4bc228);
  const _0x3eb11a = 0.0001;
  if (Math.abs(_0x3b0d31.x - _0x3b0d31.y) < _0x3eb11a && Math.abs(_0x3b0d31.y - _0x3b0d31.z) < _0x3eb11a) {
    return (_0x3b0d31.x + _0x3b0d31.y + _0x3b0d31.z) / 3;
  }
  return _0x3b0d31;
}
function toVector3(_0x1a235f) {
  return new a1027_0x23ca48.Vector3(Number(_0x1a235f?.x) || 0, Number(_0x1a235f?.y) || 0, Number(_0x1a235f?.z) || 0);
}
function fromVector3(_0x35c802) {
  return {
    x: _0x35c802.x,
    y: _0x35c802.y,
    z: _0x35c802.z
  };
}
function rotatePoseAroundWorldAxis(_0x2357e9, _0x3f3ddf, _0x50b542, _0x14ab79) {
  const _0xd20f1c = toVector3(_0x3f3ddf);
  if (_0xd20f1c.lengthSq() < 1e-8 || !Number.isFinite(_0x50b542) || Math.abs(_0x50b542) < 1e-8) {
    const _0x238041 = hasFiniteQuaternion(_0x2357e9?.quaternion) ? {
      x: Number(_0x2357e9.quaternion.x) || 0,
      y: Number(_0x2357e9.quaternion.y) || 0,
      z: Number(_0x2357e9.quaternion.z) || 0,
      w: Number(_0x2357e9.quaternion.w) || 1
    } : undefined;
    return {
      position: {
        x: Number(_0x2357e9?.position?.x) || 0,
        y: Number(_0x2357e9?.position?.y) || 0,
        z: Number(_0x2357e9?.position?.z) || 0
      },
      rotation: {
        x: Number(_0x2357e9?.rotation?.x) || 0,
        y: Number(_0x2357e9?.rotation?.y) || 0,
        z: Number(_0x2357e9?.rotation?.z) || 0
      },
      quaternion: _0x238041
    };
  }
  _0xd20f1c.normalize();
  const _0x3c62bd = toVector3(_0x14ab79);
  const _0x2364de = toVector3(_0x2357e9?.position);
  const _0x2ade5f = hasFiniteQuaternion(_0x2357e9?.quaternion) ? new a1027_0x23ca48.Quaternion(Number(_0x2357e9.quaternion.x) || 0, Number(_0x2357e9.quaternion.y) || 0, Number(_0x2357e9.quaternion.z) || 0, Number(_0x2357e9.quaternion.w) || 1).normalize() : new a1027_0x23ca48.Quaternion().setFromEuler(new a1027_0x23ca48.Euler(Number(_0x2357e9?.rotation?.x) || 0, Number(_0x2357e9?.rotation?.y) || 0, Number(_0x2357e9?.rotation?.z) || 0, "XYZ"));
  const _0x48ae4a = new a1027_0x23ca48.Quaternion().setFromAxisAngle(_0xd20f1c, _0x50b542);
  const _0x4632f6 = _0x2364de.sub(_0x3c62bd).applyQuaternion(_0x48ae4a).add(_0x3c62bd);
  const _0x18ad1a = _0x48ae4a.clone().multiply(_0x2ade5f);
  const _0x170e32 = new a1027_0x23ca48.Euler().setFromQuaternion(_0x18ad1a, "XYZ");
  return {
    position: fromVector3(_0x4632f6),
    rotation: {
      x: _0x170e32.x,
      y: _0x170e32.y,
      z: _0x170e32.z
    },
    quaternion: {
      x: _0x18ad1a.x,
      y: _0x18ad1a.y,
      z: _0x18ad1a.z,
      w: _0x18ad1a.w
    }
  };
}
function scalePositionAroundPivot(_0x3a92a3, _0x34a952, _0x598d2d, _0x4c6b7b = null) {
  const _0x3879ca = Number.isFinite(_0x598d2d) ? _0x598d2d : 1;
  const _0x531ebe = toVector3(_0x34a952);
  const _0xa46b80 = toVector3(_0x3a92a3);
  const _0xf57ca = _0xa46b80.sub(_0x531ebe);
  if (!_0x4c6b7b) {
    return fromVector3(_0xf57ca.multiplyScalar(_0x3879ca).add(_0x531ebe));
  }
  const _0x32c050 = toVector3(_0x4c6b7b);
  if (_0x32c050.lengthSq() < 1e-8) {
    return fromVector3(_0xf57ca.add(_0x531ebe));
  }
  _0x32c050.normalize();
  const _0x3c2205 = _0x32c050.clone().multiplyScalar(_0xf57ca.dot(_0x32c050));
  const _0x4798ae = _0xf57ca.clone().sub(_0x3c2205);
  return fromVector3(_0x4798ae.add(_0x3c2205.multiplyScalar(_0x3879ca)).add(_0x531ebe));
}
function scalePositionAroundPivotAxes(_0x12e5d0, _0x1ae18b, _0x39f592, _0x237e21 = "xyz", _0xc432eb = null) {
  const _0x582430 = toVector3(_0x1ae18b);
  const _0x18c5d4 = toVector3(_0x12e5d0).sub(_0x582430);
  const _0x1bb00a = hasFiniteQuaternion(_0xc432eb) ? new a1027_0x23ca48.Quaternion(Number(_0xc432eb.x) || 0, Number(_0xc432eb.y) || 0, Number(_0xc432eb.z) || 0, Number(_0xc432eb.w) || 1).normalize() : new a1027_0x23ca48.Quaternion();
  _0x18c5d4.applyQuaternion(_0x1bb00a.clone().invert());
  for (const _0x35f23a of ["x", "y", "z"]) {
    if (String(_0x237e21).includes(_0x35f23a)) {
      _0x18c5d4[_0x35f23a] *= _0x39f592;
    }
  }
  return fromVector3(_0x18c5d4.applyQuaternion(_0x1bb00a).add(_0x582430));
}
function resolveScaleConstraint(_0x387d76 = {}) {
  const _0x2c5e07 = String(_0x387d76.constraint || "").toLowerCase();
  if (/[xyz]/.test(_0x2c5e07)) {
    return _0x2c5e07;
  }
  const _0x4d8a89 = String(_0x387d76.handleKey || "").toLowerCase();
  if (_0x387d76.mode === "scale-uniform" || _0x4d8a89 === "scale-uniform") {
    return "xyz";
  }
  const _0x515fcc = _0x4d8a89.match(/scale-plane-([xyz]{2})$/);
  if (_0x515fcc) {
    return _0x515fcc[1];
  }
  const _0x231d2c = _0x4d8a89.match(/scale-([xyz])$/);
  return _0x231d2c?.[1] || "xyz";
}
function getClientRectFromPoints(_0x3fbc28, _0x5069a9, _0x31042a, _0x581b5f) {
  return {
    left: Math.min(_0x3fbc28, _0x31042a),
    top: Math.min(_0x5069a9, _0x581b5f),
    right: Math.max(_0x3fbc28, _0x31042a),
    bottom: Math.max(_0x5069a9, _0x581b5f)
  };
}
function getLocalRectFromPoints(_0x19ba2b, _0x51d8f9, _0x5e3cb2, _0x36bb0b) {
  return {
    left: Math.min(_0x19ba2b, _0x5e3cb2),
    top: Math.min(_0x51d8f9, _0x36bb0b),
    width: Math.abs(_0x5e3cb2 - _0x19ba2b),
    height: Math.abs(_0x36bb0b - _0x51d8f9)
  };
}
function addVector3Like(_0x53df7c, _0x2d943f) {
  return {
    x: (Number(_0x53df7c?.x) || 0) + (Number(_0x2d943f?.x) || 0),
    y: (Number(_0x53df7c?.y) || 0) + (Number(_0x2d943f?.y) || 0),
    z: (Number(_0x53df7c?.z) || 0) + (Number(_0x2d943f?.z) || 0)
  };
}
export function measureSelectionBoxLocalRect(_0x2926eb, _0x4831b5, _0x8a25d9, _0x3ae473, _0x3aaee9) {
  const _0x4ffd13 = _0x2926eb?.getBoundingClientRect?.() || {
    left: 0,
    top: 0,
    width: 1,
    height: 1
  };
  const _0x3be9f2 = Math.max(1, Number(_0x2926eb?.offsetWidth) || _0x4ffd13.width || 1);
  const _0x4f770f = Math.max(1, Number(_0x2926eb?.offsetHeight) || _0x4ffd13.height || 1);
  const _0x4465c8 = _0x4ffd13.width > 0 ? _0x4ffd13.width / _0x3be9f2 : 1;
  const _0x29250d = _0x4ffd13.height > 0 ? _0x4ffd13.height / _0x4f770f : 1;
  const _0x2cc2a0 = _0x4465c8 > 0 ? _0x4465c8 : 1;
  const _0x509776 = _0x29250d > 0 ? _0x29250d : 1;
  return {
    left: (Math.min(_0x4831b5, _0x3ae473) - _0x4ffd13.left) / _0x2cc2a0,
    top: (Math.min(_0x8a25d9, _0x3aaee9) - _0x4ffd13.top) / _0x509776,
    width: Math.abs(_0x3ae473 - _0x4831b5) / _0x2cc2a0,
    height: Math.abs(_0x3aaee9 - _0x8a25d9) / _0x509776
  };
}
export class PanoramaSceneInteraction {
  constructor({
    viewportEl: _0x4f242f,
    overlayEl: _0x5a3c65,
    bridge: _0x844e45,
    getSceneState: _0x4abc62,
    onViewCommit: _0x2ed535,
    onObjectCommit: _0x182c7f,
    onObjectBatchCommit: _0x105f01,
    onSelectionChange: _0x2d47ef,
    onSelectionBatchChange: _0x14c5bb,
    onSelectionObjectsChange: _0x1d3d61,
    onSelectionClear: _0x137eb5
  } = {}) {
    this.viewportEl = _0x4f242f;
    this.overlayEl = _0x5a3c65 || _0x4f242f;
    this.bridge = _0x844e45;
    this.getSceneState = _0x4abc62;
    this.onViewCommit = _0x2ed535;
    this.onObjectCommit = _0x182c7f;
    this.onObjectBatchCommit = _0x105f01;
    this.onSelectionChange = _0x2d47ef;
    this.onSelectionBatchChange = _0x14c5bb;
    this.onSelectionObjectsChange = _0x1d3d61;
    this.onSelectionClear = _0x137eb5;
    this._gesture = null;
    this._selectionBoxEl = null;
    this._clearDraftRafId = null;
    this._queuedDraftClearTasks = [];
    this._wheelDraft = null;
    this._wheelCommitTimer = null;
    this._flyKeys = new Set();
    this._flyBoost = false;
    this._flyDraft = null;
    this._flyRafId = null;
    this._flyLastTime = 0;
    this._requestFrame = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame.bind(window) : null;
    this._cancelFrame = typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function" ? window.cancelAnimationFrame.bind(window) : null;
    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);
    this._handlePointerLeave = this._handlePointerLeave.bind(this);
    this._handleWheel = this._handleWheel.bind(this);
    this._handleContextMenu = this._handleContextMenu.bind(this);
  }
  attach() {
    if (!this.viewportEl) {
      return;
    }
    this.viewportEl.addEventListener("pointerdown", this._handlePointerDown);
    this.viewportEl.addEventListener("pointermove", this._handlePointerMove);
    this.viewportEl.addEventListener("pointerup", this._handlePointerUp);
    this.viewportEl.addEventListener("pointercancel", this._handlePointerUp);
    this.viewportEl.addEventListener("pointerleave", this._handlePointerLeave);
    this.viewportEl.addEventListener("wheel", this._handleWheel, {
      passive: false
    });
    this.viewportEl.addEventListener("contextmenu", this._handleContextMenu);
  }
  detach() {
    if (!this.viewportEl) {
      return;
    }
    this._flushWheelDraft();
    this._finishFlyNavigation({
      commit: true,
      clearKeys: true
    });
    this.viewportEl.removeEventListener("pointerdown", this._handlePointerDown);
    this.viewportEl.removeEventListener("pointermove", this._handlePointerMove);
    this.viewportEl.removeEventListener("pointerup", this._handlePointerUp);
    this.viewportEl.removeEventListener("pointercancel", this._handlePointerUp);
    this.viewportEl.removeEventListener("pointerleave", this._handlePointerLeave);
    this.viewportEl.removeEventListener("wheel", this._handleWheel);
    this.viewportEl.removeEventListener("contextmenu", this._handleContextMenu);
    this._cancelQueuedDraftClear();
    this._clearSelectionBox();
    this.bridge?.clearGizmoHandleState?.();
    this._clearGizmoMoveGuideLine();
    this.bridge?.clearAllDrafts?.();
  }
  _flushWheelDraft({
    commit = true
  } = {}) {
    if (this._wheelCommitTimer !== null) {
      clearTimeout(this._wheelCommitTimer);
      this._wheelCommitTimer = null;
    }
    const _0x2e1498 = this._wheelDraft;
    this._wheelDraft = null;
    if (!_0x2e1498) {
      return;
    }
    if (commit) {
      this.onViewCommit?.(_0x2e1498.payload);
      this._queueDraftClear(() => this.bridge?.clearDraftView?.());
      return;
    }
    this.bridge?.clearDraftView?.();
  }
  _scheduleWheelCommit() {
    if (this._wheelCommitTimer !== null) {
      clearTimeout(this._wheelCommitTimer);
    }
    this._wheelCommitTimer = setTimeout(() => {
      this._wheelCommitTimer = null;
      this._flushWheelDraft();
    }, 140);
  }
  _isEditing(_0x472e9f) {
    return _0x472e9f?.ui?.isEditing === true;
  }
  _isPanoramaMode(_0x513063) {
    return _0x513063?.type === "panorama-360";
  }
  _isFlyMode(_0x49b3ee) {
    return _0x49b3ee?.mode === "scene" && _0x49b3ee?.ui?.navigationMode === "fly";
  }
  _resolveFlightKey(_0x1de5bd) {
    const _0x1dd548 = String(_0x1de5bd?.code || "");
    if (_0x1dd548 === "ShiftLeft" || _0x1dd548 === "ShiftRight") {
      return "boost";
    }
    if (_0x1dd548 === "KeyW") {
      return "forward";
    }
    if (_0x1dd548 === "KeyS") {
      return "backward";
    }
    if (_0x1dd548 === "KeyA") {
      return "left";
    }
    if (_0x1dd548 === "KeyD") {
      return "right";
    }
    if (_0x1dd548 === "KeyQ") {
      return "down";
    }
    if (_0x1dd548 === "KeyE") {
      return "up";
    }
    const _0x1815c4 = String(_0x1de5bd?.key || "").toLowerCase();
    return {
      shift: "boost",
      w: "forward",
      s: "backward",
      a: "left",
      d: "right",
      q: "down",
      e: "up"
    }[_0x1815c4] || null;
  }
  _readFlightInput() {
    return {
      forward: (this._flyKeys.has("forward") ? 1 : 0) - (this._flyKeys.has("backward") ? 1 : 0),
      right: (this._flyKeys.has("right") ? 1 : 0) - (this._flyKeys.has("left") ? 1 : 0),
      vertical: (this._flyKeys.has("up") ? 1 : 0) - (this._flyKeys.has("down") ? 1 : 0),
      boost: this._flyBoost
    };
  }
  _hasFlightMovement() {
    const _0x26cc56 = this._readFlightInput();
    return _0x26cc56.forward !== 0 || _0x26cc56.right !== 0 || _0x26cc56.vertical !== 0;
  }
  _applyFlyNavigationStep(_0x4c30ee = 1 / 60) {
    const _0x477c14 = this.getSceneState?.();
    if (!this._isEditing(_0x477c14) || !this._isFlyMode(_0x477c14)) {
      this._finishFlyNavigation({
        commit: true,
        clearKeys: true
      });
      return;
    }
    const _0x2a9aac = this._flyDraft?.sceneView || _0x477c14.viewport.sceneView;
    const _0x274f2e = applySceneFlyMovement(_0x2a9aac, this._readFlightInput(), _0x4c30ee, {
      speed: Number(_0x477c14?.ui?.flySpeed) || 4
    });
    const _0x4208ba = {
      ..._0x2a9aac,
      ..._0x274f2e
    };
    this._flyDraft = {
      sceneView: _0x4208ba
    };
    this.bridge?.setDraftView?.({
      kind: "scene-default",
      sceneView: _0x4208ba,
      disableSmoothing: true
    });
  }
  _scheduleFlyNavigation() {
    if (!this._requestFrame || this._flyRafId !== null || !this._hasFlightMovement()) {
      return;
    }
    this._flyLastTime = this._flyLastTime || performance.now();
    this._flyRafId = this._requestFrame(_0x2603b4 => {
      this._flyRafId = null;
      const _0x3d1022 = Number(_0x2603b4) || performance.now();
      const _0x178e12 = Math.max(0, Math.min(0.1, (_0x3d1022 - this._flyLastTime) / 1000));
      this._flyLastTime = _0x3d1022;
      this._applyFlyNavigationStep(_0x178e12 || 1 / 60);
      this._scheduleFlyNavigation();
    });
  }
  _finishFlyNavigation({
    commit = true,
    clearKeys = false
  } = {}) {
    if (this._flyRafId !== null) {
      this._cancelFrame?.(this._flyRafId);
      this._flyRafId = null;
    }
    const _0x361cb2 = this._flyDraft;
    this._flyDraft = null;
    this._flyLastTime = 0;
    if (clearKeys) {
      this._flyKeys.clear();
      this._flyBoost = false;
    }
    if (!_0x361cb2) {
      return;
    }
    if (commit) {
      this.onViewCommit?.({
        sceneView: _0x361cb2.sceneView,
        activeView: "default",
        activeCameraId: null
      });
      this._queueDraftClear(() => this.bridge?.clearDraftView?.());
    } else {
      this.bridge?.clearDraftView?.();
    }
  }
  handleFlightKeyDown(_0x384a71) {
    const _0x195536 = this.getSceneState?.();
    const _0x1e52d8 = this._resolveFlightKey(_0x384a71);
    if (!_0x1e52d8 || !this._isEditing(_0x195536) || !this._isFlyMode(_0x195536)) {
      return false;
    }
    _0x384a71.preventDefault?.();
    _0x384a71.stopPropagation?.();
    if (_0x1e52d8 === "boost") {
      this._flyBoost = true;
      return true;
    }
    const _0x13a980 = this._hasFlightMovement();
    this._flyKeys.add(_0x1e52d8);
    this._flyBoost = _0x384a71.shiftKey === true || this._flyBoost;
    if (!_0x13a980) {
      this._applyFlyNavigationStep(1 / 60);
    }
    this._scheduleFlyNavigation();
    return true;
  }
  handleFlightKeyUp(_0x3f0f3e) {
    const _0x1261b2 = this._resolveFlightKey(_0x3f0f3e);
    if (!_0x1261b2) {
      return false;
    }
    const _0x598c0e = _0x1261b2 === "boost" ? this._flyBoost : this._flyKeys.has(_0x1261b2);
    if (!_0x598c0e) {
      return false;
    }
    _0x3f0f3e.preventDefault?.();
    _0x3f0f3e.stopPropagation?.();
    if (_0x1261b2 === "boost") {
      this._flyBoost = false;
    } else {
      this._flyKeys.delete(_0x1261b2);
    }
    if (!this._hasFlightMovement()) {
      if (this._gesture?.type === "fly-look") {
        if (this._flyRafId !== null) {
          this._cancelFrame?.(this._flyRafId);
          this._flyRafId = null;
        }
      } else {
        this._finishFlyNavigation({
          commit: true
        });
      }
    } else {
      this._scheduleFlyNavigation();
    }
    return true;
  }
  cancelFlightNavigation({
    commit = true
  } = {}) {
    this._finishFlyNavigation({
      commit: commit,
      clearKeys: true
    });
  }
  _syncControlsByMode(_0x606cd6) {
    const _0x34c737 = this.bridge?.controls || this.bridge?._controls;
    if (!_0x34c737) {
      return;
    }
    if ("enablePan" in _0x34c737) {
      _0x34c737.enablePan = _0x606cd6 ? false : true;
    }
    if ("enableRotate" in _0x34c737) {
      _0x34c737.enableRotate = true;
    }
  }
  _applyTransformOptions(_0x5c6c4a, _0x2c2ad3, _0x1e6949 = "free") {
    const _0x17496e = this.getSceneState?.()?.ui || {};
    const _0x2ed8e5 = Object.prototype.hasOwnProperty.call(_0x17496e, "snapEnabled") || Object.prototype.hasOwnProperty.call(_0x17496e, "groundLock") || Object.prototype.hasOwnProperty.call(_0x17496e, "uniformScale");
    if (!_0x2ed8e5) {
      return _0x5c6c4a;
    }
    const _0x1a8b62 = applyTransformInteractionOptions(_0x5c6c4a, {
      mode: _0x2c2ad3,
      constraint: _0x1e6949,
      space: _0x17496e.transformSpace,
      groundLock: _0x17496e.groundLock,
      uniformScale: _0x17496e.uniformScale,
      snap: {
        enabled: _0x17496e.snapEnabled,
        translation: _0x17496e.translationSnap,
        rotation: _0x17496e.rotationSnap,
        scale: _0x17496e.scaleSnap
      }
    });
    if (_0x2c2ad3 === "translate") {
      return {
        ..._0x5c6c4a,
        position: _0x1a8b62.position
      };
    }
    if (_0x2c2ad3 === "rotate") {
      return {
        ..._0x5c6c4a,
        rotation: _0x1a8b62.rotation,
        quaternion: _0x1a8b62.quaternion
      };
    }
    return {
      ..._0x5c6c4a,
      position: _0x1a8b62.position,
      scale: _0x1a8b62.scale
    };
  }
  _stopEvent(_0x508ca2, _0x2b28b9 = {}) {
    _0x508ca2.stopPropagation();
    if (_0x2b28b9.preventDefault) {
      _0x508ca2.preventDefault();
    }
  }
  _createBaseView(_0xbdfe90) {
    if (_0xbdfe90.mode === "panorama") {
      const _0x679314 = {
        ..._0xbdfe90.viewport.panoramaView
      };
      return {
        kind: "panorama-default",
        sceneState: _0xbdfe90,
        panoramaView: _0x679314
      };
    }
    const _0x58287e = this.bridge?.readCurrentViewPose?.() || null;
    const _0x41baf0 = {
      ..._0xbdfe90.viewport.sceneView
    };
    return {
      kind: "scene-default",
      sceneState: _0xbdfe90,
      sceneView: _0x41baf0,
      currentPose: _0x58287e
    };
  }
  _getObjectByPick(_0x420a7a, _0xed9092) {
    if (!_0xed9092) {
      return null;
    }
    if (_0xed9092.objectType !== "cube" && _0xed9092.objectType !== "mannequin") {
      return null;
    }
    const _0x2b440b = _0xed9092.objectType === "cube" ? _0x420a7a.cubes : _0x420a7a.mannequins;
    return _0x2b440b.find(_0x5f07f3 => _0x5f07f3.id === _0xed9092.objectId) || null;
  }
  _getSelectedObject(_0x2c7a3f) {
    const _0x337003 = _0x2c7a3f?.selection?.selectedObjectType;
    const _0x42de43 = _0x2c7a3f?.selection?.selectedObjectId;
    if (!_0x337003 || !_0x42de43) {
      return null;
    }
    if (_0x337003 !== "cube" && _0x337003 !== "mannequin") {
      return null;
    }
    const _0x3fbf11 = _0x337003 === "cube" ? _0x2c7a3f.cubes : _0x2c7a3f.mannequins;
    const _0x144f4e = _0x3fbf11.find(_0xc89abd => _0xc89abd.id === _0x42de43) || null;
    if (!_0x144f4e) {
      return null;
    }
    return {
      objectType: _0x337003,
      objectId: _0x42de43,
      item: _0x144f4e
    };
  }
  _findGroupByMember(_0x54ed10, _0x1bc29b, _0xf7f694) {
    if (_0x1bc29b !== "mannequin" || !_0xf7f694) {
      return null;
    }
    const _0x2e77ae = Array.isArray(_0x54ed10?.groups) ? _0x54ed10.groups : [];
    return _0x2e77ae.find(_0x20cf8b => Array.isArray(_0x20cf8b.memberIds) && _0x20cf8b.memberIds.includes(_0xf7f694)) || null;
  }
  _resolveTargetsByIds(_0x59891c, _0x211abc, _0x3ee7a3) {
    const _0x230fa4 = Array.isArray(_0x3ee7a3) ? _0x3ee7a3 : [];
    if (!_0x211abc || _0x230fa4.length === 0) {
      return [];
    }
    if (_0x211abc !== "cube" && _0x211abc !== "mannequin") {
      return [];
    }
    const _0x55b4b9 = _0x211abc === "cube" ? _0x59891c.cubes : _0x59891c.mannequins;
    const _0x9a5179 = new Set(_0x230fa4);
    return _0x55b4b9.filter(_0x48e100 => _0x9a5179.has(_0x48e100.id)).map(_0x1ef504 => ({
      objectType: _0x211abc,
      objectId: _0x1ef504.id,
      item: _0x1ef504
    }));
  }
  _collectSelectionObjects(_0x441830) {
    const _0x412d24 = Array.isArray(_0x441830?.cubes) ? _0x441830.cubes : [];
    const _0x1a4bc5 = Array.isArray(_0x441830?.mannequins) ? _0x441830.mannequins : [];
    const _0x1f72ba = new Set(_0x412d24.map(_0x2143b1 => _0x2143b1.id));
    const _0x57614e = new Set(_0x1a4bc5.map(_0x1f46af => _0x1f46af.id));
    const _0x1d6a43 = new Set();
    const _0x41265d = [];
    const _0x91b1e = (_0x50ee37, _0x5508c6) => {
      if (_0x50ee37 !== "cube" && _0x50ee37 !== "mannequin") {
        return;
      }
      const _0x480bd9 = String(_0x5508c6 || "").trim();
      if (!_0x480bd9) {
        return;
      }
      const _0x111c97 = _0x50ee37 === "cube" ? _0x1f72ba.has(_0x480bd9) : _0x57614e.has(_0x480bd9);
      if (!_0x111c97) {
        return;
      }
      const _0x35d1db = _0x50ee37 + ":" + _0x480bd9;
      if (_0x1d6a43.has(_0x35d1db)) {
        return;
      }
      _0x1d6a43.add(_0x35d1db);
      _0x41265d.push({
        objectType: _0x50ee37,
        objectId: _0x480bd9
      });
    };
    const _0x479712 = Array.isArray(_0x441830?.selection?.selectedObjects) ? _0x441830.selection.selectedObjects : [];
    _0x479712.forEach(_0x4e5ae9 => {
      _0x91b1e(_0x4e5ae9?.objectType, _0x4e5ae9?.objectId);
    });
    if (_0x41265d.length > 0) {
      return _0x41265d;
    }
    const _0x2e18df = _0x441830?.selection?.selectedGroupId || null;
    if (_0x2e18df) {
      const _0xe49693 = (_0x441830?.groups || []).find(_0x3c23ef => _0x3c23ef.id === _0x2e18df);
      if (Array.isArray(_0xe49693?.memberIds) && _0xe49693.memberIds.length > 0) {
        _0xe49693.memberIds.forEach(_0x509416 => {
          _0x91b1e("mannequin", _0x509416);
        });
        if (_0x41265d.length > 0) {
          return _0x41265d;
        }
      }
    }
    const _0xac887c = _0x441830?.selection?.selectedObjectType === "cube" || _0x441830?.selection?.selectedObjectType === "mannequin" ? _0x441830.selection.selectedObjectType : null;
    if (!_0xac887c) {
      return _0x41265d;
    }
    const _0xf4981a = Array.isArray(_0x441830?.selection?.selectedObjectIds) ? _0x441830.selection.selectedObjectIds : [];
    if (_0xf4981a.length > 0) {
      _0xf4981a.forEach(_0x166fa4 => {
        _0x91b1e(_0xac887c, _0x166fa4);
      });
      if (_0x41265d.length > 0) {
        return _0x41265d;
      }
    }
    _0x91b1e(_0xac887c, _0x441830?.selection?.selectedObjectId || null);
    return _0x41265d;
  }
  _getSelectionTargets(_0x3d9a43) {
    const _0x123ce5 = this._collectSelectionObjects(_0x3d9a43);
    if (_0x123ce5.length > 0) {
      const _0x12a1ab = new Map((Array.isArray(_0x3d9a43?.cubes) ? _0x3d9a43.cubes : []).map(_0x27399b => [_0x27399b.id, _0x27399b]));
      const _0x2391b9 = new Map((Array.isArray(_0x3d9a43?.mannequins) ? _0x3d9a43.mannequins : []).map(_0xc97c14 => [_0xc97c14.id, _0xc97c14]));
      return _0x123ce5.map(_0x1d62a7 => {
        const _0x1dfcf1 = _0x1d62a7.objectType === "cube" ? _0x12a1ab.get(_0x1d62a7.objectId) : _0x2391b9.get(_0x1d62a7.objectId);
        if (!_0x1dfcf1) {
          return null;
        }
        return {
          objectType: _0x1d62a7.objectType,
          objectId: _0x1d62a7.objectId,
          item: _0x1dfcf1
        };
      }).filter(Boolean);
    }
    return [];
  }
  _ensureSelectionBox() {
    if (this._selectionBoxEl) {
      return this._selectionBoxEl;
    }
    const _0x1c1de9 = document.createElement("div");
    _0x1c1de9.className = "panorama-scene-selection-box";
    this.overlayEl?.appendChild(_0x1c1de9);
    this._selectionBoxEl = _0x1c1de9;
    return _0x1c1de9;
  }
  _updateSelectionBox(_0x16655b, _0x438bd9, _0x11f54a, _0xf73f30) {
    const _0x4bf3fd = getLocalRectFromPoints(_0x16655b, _0x438bd9, _0x11f54a, _0xf73f30);
    const _0x2f5f5a = this._ensureSelectionBox();
    _0x2f5f5a.style.left = _0x4bf3fd.left + "px";
    _0x2f5f5a.style.top = _0x4bf3fd.top + "px";
    _0x2f5f5a.style.width = _0x4bf3fd.width + "px";
    _0x2f5f5a.style.height = _0x4bf3fd.height + "px";
    _0x2f5f5a.classList.add("is-visible");
  }
  _getLocalPoint(_0x50b8d2) {
    const _0x379c56 = this.viewportEl?.getBoundingClientRect?.() || {
      left: 0,
      top: 0,
      width: 1,
      height: 1
    };
    const _0x158409 = Math.max(1, Number(this.viewportEl?.offsetWidth) || _0x379c56.width || 1);
    const _0x2365a4 = Math.max(1, Number(this.viewportEl?.offsetHeight) || _0x379c56.height || 1);
    const _0x4e83e3 = _0x379c56.width > 0 ? _0x379c56.width / _0x158409 : 1;
    const _0x324c17 = _0x379c56.height > 0 ? _0x379c56.height / _0x2365a4 : 1;
    const _0x1e53e8 = _0x4e83e3 > 0 ? _0x4e83e3 : 1;
    const _0x2eaff1 = _0x324c17 > 0 ? _0x324c17 : 1;
    return {
      x: (_0x50b8d2?.clientX - _0x379c56.left) / _0x1e53e8,
      y: (_0x50b8d2?.clientY - _0x379c56.top) / _0x2eaff1
    };
  }
  _clearSelectionBox() {
    this._selectionBoxEl?.remove();
    this._selectionBoxEl = null;
  }
  _queueDraftClear(_0x281b32) {
    if (typeof _0x281b32 !== "function") {
      return;
    }
    this._queuedDraftClearTasks.push(_0x281b32);
    if (this._clearDraftRafId != null) {
      return;
    }
    this._clearDraftRafId = requestAnimationFrame(() => {
      this._clearDraftRafId = null;
      const _0x211b6b = this._queuedDraftClearTasks.splice(0, this._queuedDraftClearTasks.length);
      _0x211b6b.forEach(_0x4693c2 => {
        try {
          _0x4693c2();
        } catch {}
      });
    });
  }
  _cancelQueuedDraftClear() {
    if (this._clearDraftRafId != null) {
      cancelAnimationFrame(this._clearDraftRafId);
      this._clearDraftRafId = null;
    }
    this._queuedDraftClearTasks.length = 0;
  }
  _beginObjectMove(_0x1000b5, _0x25602c, _0x439299, _0x1ddd65) {
    const _0x31b7d4 = cloneObjectPose(_0x1ddd65);
    const _0x5acaf9 = this.bridge?.intersectGround?.(_0x1000b5.clientX, _0x1000b5.clientY, 0) || {
      x: _0x31b7d4.position.x,
      y: 0,
      z: _0x31b7d4.position.z
    };
    return {
      type: "object-move",
      pointerId: _0x1000b5.pointerId,
      startX: _0x1000b5.clientX,
      startY: _0x1000b5.clientY,
      objectType: _0x439299.objectType,
      objectId: _0x439299.objectId,
      basePose: _0x31b7d4,
      moved: false,
      offset: {
        x: _0x5acaf9.x - _0x31b7d4.position.x,
        z: _0x5acaf9.z - _0x31b7d4.position.z
      }
    };
  }
  _beginBatchMove(_0x2bf22a, _0x450a1f) {
    const _0x356d0c = Array.isArray(_0x450a1f) ? _0x450a1f : [];
    if (_0x356d0c.length === 0) {
      return null;
    }
    const _0x57b553 = _0x356d0c.map(_0x58308a => ({
      objectType: _0x58308a.objectType,
      objectId: _0x58308a.objectId,
      pose: cloneObjectPose(_0x58308a.item)
    }));
    const _0xdcb74a = _0x57b553.reduce((_0xa511f3, _0x559fdf) => {
      _0xa511f3.x += _0x559fdf.pose.position.x;
      _0xa511f3.z += _0x559fdf.pose.position.z;
      return _0xa511f3;
    }, {
      x: 0,
      z: 0
    });
    _0xdcb74a.x /= _0x57b553.length;
    _0xdcb74a.z /= _0x57b553.length;
    const _0x422bcb = this.bridge?.intersectGround?.(_0x2bf22a.clientX, _0x2bf22a.clientY, 0) || {
      x: _0xdcb74a.x,
      y: 0,
      z: _0xdcb74a.z
    };
    return {
      type: "object-move-batch",
      pointerId: _0x2bf22a.pointerId,
      startX: _0x2bf22a.clientX,
      startY: _0x2bf22a.clientY,
      moved: false,
      baseCenter: _0xdcb74a,
      pointerOffset: {
        x: _0x422bcb.x - _0xdcb74a.x,
        z: _0x422bcb.z - _0xdcb74a.z
      },
      entries: _0x57b553.map(_0x1d080b => ({
        ..._0x1d080b,
        offset: {
          x: _0x1d080b.pose.position.x - _0xdcb74a.x,
          z: _0x1d080b.pose.position.z - _0xdcb74a.z
        }
      }))
    };
  }
  _beginGizmoMove(_0x1acc25, _0x1c2c1f, _0x4392c6) {
    const _0x42c7b6 = this._getSelectionTargets(_0x1c2c1f);
    if (!_0x42c7b6.length) {
      return null;
    }
    const _0xeea4ed = this.bridge?.beginMoveGizmoDrag?.({
      handleKey: _0x4392c6?.handleKey,
      clientX: _0x1acc25.clientX,
      clientY: _0x1acc25.clientY
    });
    if (!_0xeea4ed) {
      return null;
    }
    const _0x525b7e = _0x42c7b6.map(_0x50774e => ({
      objectType: _0x50774e.objectType,
      objectId: _0x50774e.objectId,
      basePose: cloneObjectPose(_0x50774e.item)
    }));
    this.bridge?.setGizmoActiveHandle?.(_0x4392c6.handleKey);
    this.bridge?.setGizmoMoveGuideLine?.({
      from: _0xeea4ed?.pivot || {
        x: 0,
        y: 0,
        z: 0
      },
      to: _0xeea4ed?.pivot || {
        x: 0,
        y: 0,
        z: 0
      }
    });
    return {
      type: "gizmo-move",
      pointerId: _0x1acc25.pointerId,
      startX: _0x1acc25.clientX,
      startY: _0x1acc25.clientY,
      moved: false,
      handleKey: _0x4392c6.handleKey,
      dragState: _0xeea4ed,
      entries: _0x525b7e,
      draftTargets: []
    };
  }
  _clearGizmoMoveGuideLine() {
    this.bridge?.clearGizmoMoveGuideLine?.();
  }
  _beginGizmoRotate(_0x264c98, _0x59e5ce, _0x5f451e) {
    const _0x1c8da1 = this._getSelectionTargets(_0x59e5ce);
    if (!_0x1c8da1.length) {
      return null;
    }
    const _0x3977e8 = this.bridge?.beginRotateGizmoDrag?.({
      handleKey: _0x5f451e?.handleKey,
      clientX: _0x264c98.clientX,
      clientY: _0x264c98.clientY
    });
    if (!_0x3977e8) {
      return null;
    }
    const _0x4276e5 = _0x1c8da1.map(_0x1a730f => ({
      objectType: _0x1a730f.objectType,
      objectId: _0x1a730f.objectId,
      basePose: cloneObjectPose(_0x1a730f.item)
    }));
    this.bridge?.setGizmoActiveHandle?.(_0x5f451e.handleKey);
    return {
      type: "gizmo-rotate",
      pointerId: _0x264c98.pointerId,
      handleKey: _0x5f451e.handleKey,
      dragState: _0x3977e8,
      entries: _0x4276e5,
      moved: false,
      draftTargets: []
    };
  }
  _beginGizmoScale(_0x4cd4bb, _0x8339c8, _0x4402c2) {
    const _0x18e35e = this._getSelectionTargets(_0x8339c8).filter(_0x24d0cc => _0x24d0cc.objectType !== "camera");
    if (!_0x18e35e.length) {
      return null;
    }
    const _0x23e5d5 = this.bridge?.beginScaleGizmoDrag?.({
      handleKey: _0x4402c2?.handleKey,
      clientX: _0x4cd4bb.clientX,
      clientY: _0x4cd4bb.clientY
    });
    if (!_0x23e5d5) {
      return null;
    }
    const _0x54c5c8 = _0x18e35e.map(_0x5c0263 => ({
      objectType: _0x5c0263.objectType,
      objectId: _0x5c0263.objectId,
      basePose: cloneObjectPose(_0x5c0263.item),
      baseScale: toScaleVector(_0x5c0263.item?.scale)
    }));
    this.bridge?.setGizmoActiveHandle?.(_0x4402c2.handleKey);
    return {
      type: "gizmo-scale",
      pointerId: _0x4cd4bb.pointerId,
      handleKey: _0x4402c2.handleKey,
      dragState: _0x23e5d5,
      entries: _0x54c5c8,
      moved: false,
      draftTargets: []
    };
  }
  _updateGizmoHover(_0x1a36f8) {
    const _0x213a3f = this.getSceneState?.();
    const _0x2fe226 = this._isPanoramaMode(_0x213a3f);
    this._syncControlsByMode(_0x2fe226);
    if (_0x2fe226 || !_0x213a3f || !this._isEditing(_0x213a3f) || _0x213a3f.mode !== "scene") {
      this.bridge?.setGizmoHoverHandle?.(null);
      return;
    }
    const _0x146854 = _0x213a3f?.ui?.transformTool || (_0x213a3f?.ui?.activeTool === "move" || _0x213a3f?.ui?.activeTool === "rotate" || _0x213a3f?.ui?.activeTool === "scale" ? _0x213a3f.ui.activeTool : "move");
    const _0x2283a1 = this._getSelectionTargets(_0x213a3f);
    if (!_0x2283a1.length) {
      this.bridge?.setGizmoHoverHandle?.(null);
      return;
    }
    if (_0x146854 !== "move" && _0x146854 !== "rotate" && _0x146854 !== "scale") {
      this.bridge?.setGizmoHoverHandle?.(null);
      return;
    }
    const _0x210be6 = this.bridge?.pickGizmoHandle?.(_0x1a36f8.clientX, _0x1a36f8.clientY) || null;
    this.bridge?.setGizmoHoverHandle?.(_0x210be6?.handleKey || null);
  }
  _exitActiveCameraOnManualNavigate(_0x472dcc) {
    if (!_0x472dcc || _0x472dcc._activeCameraExited) {
      return;
    }
    const _0x17c128 = this.getSceneState?.();
    if (_0x17c128?.viewport?.activeView !== "camera" || !_0x17c128?.viewport?.activeCameraId) {
      _0x472dcc._activeCameraExited = true;
      return;
    }
    this.onViewCommit?.({
      sceneView: {
        ..._0x17c128.viewport.sceneView
      },
      activeView: "default",
      activeCameraId: null
    });
    _0x472dcc._activeCameraExited = true;
  }
  _resolveSceneNavigateGesture(_0x4988d8, _0x12d795) {
    const _0x12db00 = _0x4988d8.altKey === true;
    const _0x1dc9b4 = _0x4988d8.button === 0;
    const _0x50ce31 = _0x4988d8.button === 1;
    const _0x71c32d = _0x4988d8.button === 2;
    if (this._isFlyMode(_0x12d795) && _0x71c32d && !_0x12db00) {
      return "fly-look";
    }
    if (_0x12db00 && _0x1dc9b4) {
      return "orbit-scene";
    }
    if (_0x12db00 && _0x50ce31) {
      return "pan";
    }
    if (_0x12db00 && _0x71c32d) {
      return "dolly";
    }
    if (_0x50ce31) {
      return "pan";
    }
    return null;
  }
  _handlePointerDown(_0x3524ad) {
    this._flushWheelDraft();
    const _0x47c2fd = this.getSceneState?.();
    if (!_0x47c2fd || !this._isEditing(_0x47c2fd)) {
      return;
    }
    const _0x4cb010 = this._isPanoramaMode(_0x47c2fd);
    this._syncControlsByMode(_0x4cb010);
    this._cancelQueuedDraftClear();
    const _0xc70db5 = _0x3524ad.button === 0;
    const _0x5dfcf0 = _0x3524ad.button === 1;
    const _0x386850 = _0x3524ad.button === 2;
    const _0x273ee7 = _0x5dfcf0 && _0x3524ad.ctrlKey;
    const _0x1d3f58 = _0x5dfcf0 && _0x3524ad.shiftKey;
    const _0x48fb76 = _0x47c2fd.mode === "scene";
    const _0x36605a = this.viewportEl.getBoundingClientRect();
    const _0x29615d = this._createBaseView(_0x47c2fd);
    this._stopEvent(_0x3524ad, {
      preventDefault: true
    });
    this.viewportEl.focus?.();
    if (_0x4cb010) {
      if (!_0xc70db5 && !_0x5dfcf0 && !_0x386850) {
        return;
      }
      this.bridge?.setGizmoHoverHandle?.(null);
      this._clearGizmoMoveGuideLine();
      this.bridge?.setGizmoActiveHandle?.(null);
      this._gesture = {
        type: "look-panorama",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        moved: false,
        rect: _0x36605a,
        baseView: _0x29615d
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x48fb76 && (_0xc70db5 || _0x5dfcf0 || _0x386850)) {
      const _0x1353ad = this._resolveSceneNavigateGesture(_0x3524ad, _0x47c2fd);
      if (_0x1353ad) {
        const _0x48a196 = _0x1353ad === "fly-look" && this._flyDraft?.sceneView ? {
          ..._0x29615d,
          sceneView: this._flyDraft.sceneView
        } : _0x29615d;
        this._clearGizmoMoveGuideLine();
        this.bridge?.setGizmoActiveHandle?.(null);
        this._gesture = {
          type: _0x1353ad,
          pointerId: _0x3524ad.pointerId,
          startX: _0x3524ad.clientX,
          startY: _0x3524ad.clientY,
          moved: false,
          rect: _0x36605a,
          baseView: _0x48a196,
          lastX: _0x3524ad.clientX,
          lastY: _0x3524ad.clientY,
          dollyAnchor: _0x1353ad === "dolly" ? this.bridge?.resolveDollyAnchor?.(_0x3524ad.clientX, _0x3524ad.clientY) || null : null
        };
        this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
        return;
      }
      if (_0xc70db5) {
        const _0x2b7dd0 = _0x47c2fd?.ui?.mouseTool || (_0x47c2fd?.ui?.activeTool === "box-select" ? "box-select" : "navigate");
        const _0x1fe020 = _0x47c2fd?.ui?.transformTool || (_0x47c2fd?.ui?.activeTool === "move" || _0x47c2fd?.ui?.activeTool === "rotate" || _0x47c2fd?.ui?.activeTool === "scale" ? _0x47c2fd.ui.activeTool : "move");
        if (_0x1fe020 === "move" || _0x1fe020 === "rotate" || _0x1fe020 === "scale") {
          const _0x4bef1a = this.bridge?.pickGizmoHandle?.(_0x3524ad.clientX, _0x3524ad.clientY) || null;
          if (_0x4bef1a) {
            if (_0x1fe020 === "move") {
              this._gesture = this._beginGizmoMove(_0x3524ad, _0x47c2fd, _0x4bef1a);
            } else if (_0x1fe020 === "rotate") {
              this._gesture = this._beginGizmoRotate(_0x3524ad, _0x47c2fd, _0x4bef1a);
            } else {
              this._gesture = this._beginGizmoScale(_0x3524ad, _0x47c2fd, _0x4bef1a);
            }
            if (this._gesture) {
              this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
              return;
            }
          }
        }
        const _0x37d396 = this.bridge?.pick?.(_0x3524ad.clientX, _0x3524ad.clientY) || null;
        const _0x4380d9 = this._getObjectByPick(_0x47c2fd, _0x37d396);
        const _0x30bf2b = this._getSelectionTargets(_0x47c2fd);
        const _0x1e0bbf = _0x37d396 && _0x4380d9 ? {
          objectType: _0x37d396.objectType,
          objectId: _0x37d396.objectId,
          item: _0x4380d9
        } : null;
        const _0x1247be = _0x1e0bbf ? this._findGroupByMember(_0x47c2fd, _0x1e0bbf.objectType, _0x1e0bbf.objectId) : null;
        let _0xa56819 = _0x30bf2b;
        if (_0x1e0bbf) {
          if (_0x1247be) {
            const _0x41da16 = this._resolveTargetsByIds(_0x47c2fd, "mannequin", _0x1247be.memberIds);
            _0xa56819 = _0x41da16;
            this.onSelectionBatchChange?.("mannequin", _0x1247be.memberIds, _0x1247be.id);
          } else {
            const _0x50eb33 = new Set(this._collectSelectionObjects(_0x47c2fd).map(_0x391b43 => _0x391b43.objectType + ":" + _0x391b43.objectId));
            const _0x19721a = _0x1e0bbf.objectType + ":" + _0x1e0bbf.objectId;
            if (!_0x50eb33.has(_0x19721a) || !(_0x30bf2b.length > 0)) {
              this.onSelectionChange?.(_0x1e0bbf.objectType, _0x1e0bbf.objectId);
              _0xa56819 = [_0x1e0bbf];
            }
          }
        }
        if (_0x2b7dd0 === "box-select") {
          const _0x3c8422 = this._getLocalPoint(_0x3524ad);
          this._gesture = {
            type: "selection-box",
            pointerId: _0x3524ad.pointerId,
            startX: _0x3524ad.clientX,
            startY: _0x3524ad.clientY,
            startLocalX: _0x3c8422.x,
            startLocalY: _0x3c8422.y,
            keepSelectionOnClick: !!_0x1e0bbf,
            moved: false
          };
          this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
          return;
        }
        if (_0x1fe020 === "rotate" && _0x1e0bbf) {
          this._gesture = {
            type: "scene-select",
            pointerId: _0x3524ad.pointerId,
            startX: _0x3524ad.clientX,
            startY: _0x3524ad.clientY,
            pickedTarget: _0x1e0bbf,
            pickedGroup: _0x1247be,
            selectionCommittedOnPointerDown: true,
            moved: false
          };
          this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
          return;
        }
        if (_0x1e0bbf) {
          this._gesture = _0xa56819.length > 1 ? this._beginBatchMove(_0x3524ad, _0xa56819) : this._beginObjectMove(_0x3524ad, _0x47c2fd, {
            objectType: _0xa56819[0].objectType,
            objectId: _0xa56819[0].objectId
          }, _0xa56819[0].item);
          this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
          return;
        }
        this._clearGizmoMoveGuideLine();
        this.bridge?.setGizmoActiveHandle?.(null);
        this._gesture = {
          type: "orbit-scene",
          pointerId: _0x3524ad.pointerId,
          startX: _0x3524ad.clientX,
          startY: _0x3524ad.clientY,
          moved: false,
          clearSelectionOnClick: true,
          rect: _0x36605a,
          baseView: _0x29615d
        };
        this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
        return;
      }
    }
    if (_0x273ee7) {
      this._gesture = {
        type: "zoom-middle",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        baseView: _0x29615d,
        dollyAnchor: _0x29615d.kind === "scene-default" ? this.bridge?.resolveDollyAnchor?.(_0x3524ad.clientX, _0x3524ad.clientY) || null : null
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x1d3f58) {
      this._gesture = {
        type: _0x29615d.kind === "panorama-default" ? "look-panorama" : "orbit-scene",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        moved: false,
        rect: _0x36605a,
        baseView: _0x29615d
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x5dfcf0) {
      if (_0x29615d.kind !== "scene-default") {
        return;
      }
      this._gesture = {
        type: "pan",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        moved: false,
        rect: _0x36605a,
        baseView: _0x29615d
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (!_0xc70db5) {
      return;
    }
    const _0x1d25df = _0x47c2fd?.ui?.mouseTool || (_0x47c2fd?.ui?.activeTool === "box-select" ? "box-select" : "navigate");
    const _0xac3f92 = _0x47c2fd?.ui?.transformTool || (_0x47c2fd?.ui?.activeTool === "move" || _0x47c2fd?.ui?.activeTool === "rotate" || _0x47c2fd?.ui?.activeTool === "scale" ? _0x47c2fd.ui.activeTool : "move");
    const _0x94ea63 = this.bridge?.pick?.(_0x3524ad.clientX, _0x3524ad.clientY) || null;
    const _0x1c1273 = this._getObjectByPick(_0x47c2fd, _0x94ea63);
    const _0x2a739d = this._getSelectionTargets(_0x47c2fd);
    const _0x70a1c5 = _0x94ea63 && _0x1c1273 ? {
      objectType: _0x94ea63.objectType,
      objectId: _0x94ea63.objectId,
      item: _0x1c1273
    } : null;
    const _0x37ce9a = _0x70a1c5 ? this._findGroupByMember(_0x47c2fd, _0x70a1c5.objectType, _0x70a1c5.objectId) : null;
    let _0x26b2fe = _0x2a739d;
    if (_0x70a1c5) {
      if (_0x37ce9a) {
        const _0x138e24 = this._resolveTargetsByIds(_0x47c2fd, "mannequin", _0x37ce9a.memberIds);
        _0x26b2fe = _0x138e24;
        this.onSelectionBatchChange?.("mannequin", _0x37ce9a.memberIds, _0x37ce9a.id);
      } else {
        const _0x3ec22a = new Set(this._collectSelectionObjects(_0x47c2fd).map(_0x6c044e => _0x6c044e.objectType + ":" + _0x6c044e.objectId));
        const _0x2d89dd = _0x70a1c5.objectType + ":" + _0x70a1c5.objectId;
        if (!_0x3ec22a.has(_0x2d89dd) || !(_0x2a739d.length > 0)) {
          this.onSelectionChange?.(_0x70a1c5.objectType, _0x70a1c5.objectId);
          _0x26b2fe = [_0x70a1c5];
        }
      }
    }
    const _0x86ca6a = _0x70a1c5 ? _0xac3f92 : _0x1d25df;
    if (_0x86ca6a === "move" && _0x26b2fe.length > 0) {
      this._gesture = _0x26b2fe.length > 1 ? this._beginBatchMove(_0x3524ad, _0x26b2fe) : this._beginObjectMove(_0x3524ad, _0x47c2fd, {
        objectType: _0x26b2fe[0].objectType,
        objectId: _0x26b2fe[0].objectId
      }, _0x26b2fe[0].item);
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x86ca6a === "rotate" && _0x26b2fe.length > 0) {
      this._gesture = {
        type: "scene-select",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        pickedTarget: _0x70a1c5,
        pickedGroup: _0x37ce9a,
        selectionCommittedOnPointerDown: true,
        moved: false
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x86ca6a === "scale" && _0x26b2fe.length > 0) {
      const _0xd0cd22 = _0x26b2fe.filter(_0x329103 => _0x329103.objectType !== "camera");
      if (_0xd0cd22.length === 0) {
        return;
      }
      if (_0xd0cd22.length > 1) {
        const _0x409321 = _0xd0cd22.map(_0x27d124 => ({
          objectType: _0x27d124.objectType,
          objectId: _0x27d124.objectId,
          basePose: cloneObjectPose(_0x27d124.item)
        }));
        const _0xd69af5 = _0x409321.reduce((_0x2bbfba, _0x25f9e8) => {
          _0x2bbfba.x += _0x25f9e8.basePose.position.x;
          _0x2bbfba.z += _0x25f9e8.basePose.position.z;
          return _0x2bbfba;
        }, {
          x: 0,
          z: 0
        });
        _0xd69af5.x /= _0x409321.length;
        _0xd69af5.z /= _0x409321.length;
        this._gesture = {
          type: "object-scale-batch",
          pointerId: _0x3524ad.pointerId,
          startX: _0x3524ad.clientX,
          rect: _0x36605a,
          center: _0xd69af5,
          entries: _0x409321,
          moved: false
        };
      } else {
        this._gesture = {
          type: "object-scale",
          pointerId: _0x3524ad.pointerId,
          startX: _0x3524ad.clientX,
          objectType: _0xd0cd22[0].objectType,
          objectId: _0xd0cd22[0].objectId,
          rect: _0x36605a,
          basePose: cloneObjectPose(_0xd0cd22[0].item),
          moved: false
        };
      }
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x86ca6a === "box-select") {
      if (_0x70a1c5) {
        if (_0x37ce9a) {
          this.onSelectionBatchChange?.("mannequin", _0x37ce9a.memberIds, _0x37ce9a.id);
        } else {
          this.onSelectionChange?.(_0x70a1c5.objectType, _0x70a1c5.objectId);
        }
      }
      this._gesture = {
        type: "selection-box",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        startLocalX: this._getLocalPoint(_0x3524ad).x,
        startLocalY: this._getLocalPoint(_0x3524ad).y,
        keepSelectionOnClick: !!_0x70a1c5,
        moved: false
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
      return;
    }
    if (_0x86ca6a === "navigate") {
      if (_0x94ea63 && _0x1c1273) {
        if (_0x26b2fe.length > 1) {
          this._gesture = this._beginBatchMove(_0x3524ad, _0x26b2fe);
        } else {
          this.onSelectionChange?.(_0x94ea63.objectType, _0x94ea63.objectId);
          this._gesture = this._beginObjectMove(_0x3524ad, _0x47c2fd, _0x94ea63, _0x1c1273);
        }
        this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
        return;
      }
      this._gesture = {
        type: _0x29615d.kind === "panorama-default" ? "look-panorama" : "orbit-scene",
        pointerId: _0x3524ad.pointerId,
        startX: _0x3524ad.clientX,
        startY: _0x3524ad.clientY,
        rect: _0x36605a,
        baseView: _0x29615d,
        moved: false
      };
      this.viewportEl.setPointerCapture?.(_0x3524ad.pointerId);
    }
  }
  _handlePointerMove(_0x225f6b) {
    if (!this._gesture) {
      this._updateGizmoHover(_0x225f6b);
      return;
    }
    if (_0x225f6b.pointerId !== this._gesture.pointerId) {
      return;
    }
    this._stopEvent(_0x225f6b, {
      preventDefault: true
    });
    const _0x173042 = this._gesture;
    if (_0x173042.type === "orbit-scene") {
      const _0x19e55c = _0x225f6b.clientX - _0x173042.startX;
      const _0x5443b1 = _0x225f6b.clientY - _0x173042.startY;
      const _0x3e0f66 = Math.hypot(_0x19e55c, _0x5443b1) >= MOVE_THRESHOLD;
      if (!_0x173042.moved && _0x3e0f66) {
        this._exitActiveCameraOnManualNavigate(_0x173042);
      }
      _0x173042.moved = _0x173042.moved || _0x3e0f66;
      const _0x199b22 = applyOrbitDelta(_0x173042.baseView.sceneView, _0x19e55c, _0x5443b1, _0x173042.rect, {
        fov: _0x173042.baseView.currentPose?.fov
      });
      _0x173042.draftView = {
        ..._0x173042.baseView.sceneView,
        ..._0x199b22
      };
      this.bridge?.setDraftView?.({
        kind: "scene-default",
        sceneView: _0x173042.draftView,
        disableSmoothing: true
      });
      return;
    }
    if (_0x173042.type === "fly-look") {
      const _0x3aeee4 = _0x225f6b.clientX - _0x173042.startX;
      const _0x1722ce = _0x225f6b.clientY - _0x173042.startY;
      const _0x43a8fc = _0x225f6b.clientX - (_0x173042.lastX ?? _0x173042.startX);
      const _0x395e89 = _0x225f6b.clientY - (_0x173042.lastY ?? _0x173042.startY);
      _0x173042.lastX = _0x225f6b.clientX;
      _0x173042.lastY = _0x225f6b.clientY;
      _0x173042.moved = _0x173042.moved || Math.hypot(_0x3aeee4, _0x1722ce) >= MOVE_THRESHOLD;
      const _0x12943c = this._flyDraft?.sceneView || _0x173042.draftView || _0x173042.baseView.sceneView;
      const _0x1deebf = applySceneFlyLookDelta(_0x12943c, _0x43a8fc, _0x395e89, _0x173042.rect, {
        fov: _0x173042.baseView.currentPose?.fov
      });
      _0x173042.draftView = {
        ..._0x12943c,
        ..._0x1deebf
      };
      this._flyDraft = {
        sceneView: _0x173042.draftView
      };
      this.bridge?.setDraftView?.({
        kind: "scene-default",
        sceneView: _0x173042.draftView,
        disableSmoothing: true
      });
      return;
    }
    if (_0x173042.type === "look-panorama") {
      const _0x2ef0a1 = _0x225f6b.clientX - _0x173042.startX;
      const _0x3e4232 = _0x225f6b.clientY - _0x173042.startY;
      const _0x3d715f = Math.hypot(_0x2ef0a1, _0x3e4232) >= MOVE_THRESHOLD;
      if (!_0x173042.moved && _0x3d715f) {
        this._exitActiveCameraOnManualNavigate(_0x173042);
      }
      _0x173042.moved = _0x173042.moved || _0x3d715f;
      const _0x4535a0 = applyPanoramaLookDelta(_0x173042.baseView.panoramaView, _0x2ef0a1, -_0x3e4232, _0x173042.rect);
      _0x173042.draftView = {
        ..._0x173042.baseView.panoramaView,
        ..._0x4535a0
      };
      this.bridge?.setDraftView?.({
        kind: "panorama-default",
        panoramaView: _0x173042.draftView,
        disableSmoothing: true
      });
      return;
    }
    if (_0x173042.type === "pan") {
      const _0x3948a2 = _0x225f6b.clientX - _0x173042.startX;
      const _0x11545b = _0x225f6b.clientY - _0x173042.startY;
      const _0x421aa3 = Math.hypot(_0x3948a2, _0x11545b) >= MOVE_THRESHOLD;
      if (!_0x173042.moved && _0x421aa3) {
        this._exitActiveCameraOnManualNavigate(_0x173042);
      }
      _0x173042.moved = _0x173042.moved || _0x421aa3;
      const _0x3cbc29 = applyScenePanDelta(_0x173042.baseView.sceneView, _0x173042.baseView.currentPose, _0x3948a2, _0x11545b, _0x173042.rect);
      _0x173042.draftView = {
        ..._0x173042.baseView.sceneView,
        ..._0x3cbc29
      };
      this.bridge?.setDraftView?.({
        kind: "scene-default",
        sceneView: _0x173042.draftView,
        disableSmoothing: true
      });
      return;
    }
    if (_0x173042.type === "dolly") {
      const _0x1b9b06 = Math.abs(_0x225f6b.clientY - _0x173042.startY) >= MOVE_THRESHOLD;
      if (!_0x173042.moved && _0x1b9b06) {
        this._exitActiveCameraOnManualNavigate(_0x173042);
      }
      _0x173042.moved = _0x173042.moved || _0x1b9b06;
      const _0x376f62 = (_0x225f6b.clientY - _0x173042.startY) * 8;
      const _0x2dc511 = applySceneDollyDelta(_0x173042.baseView.sceneView, _0x376f62, {
        anchor: _0x173042.dollyAnchor
      });
      _0x173042.draftView = {
        ..._0x173042.baseView.sceneView,
        ..._0x2dc511
      };
      this.bridge?.setDraftView?.({
        kind: "scene-default",
        sceneView: _0x173042.draftView,
        disableSmoothing: true
      });
      return;
    }
    if (_0x173042.type === "zoom-middle") {
      const _0x5aeb0c = Math.abs(_0x225f6b.clientY - _0x173042.startY) >= MOVE_THRESHOLD;
      if (!_0x173042.moved && _0x5aeb0c) {
        this._exitActiveCameraOnManualNavigate(_0x173042);
      }
      _0x173042.moved = _0x173042.moved || _0x5aeb0c;
      const _0x32eef9 = (_0x225f6b.clientY - _0x173042.startY) * 8;
      if (_0x173042.baseView.kind === "panorama-default") {
        const _0xe89d09 = applyPanoramaZoomDelta(_0x173042.baseView.panoramaView, _0x32eef9);
        _0x173042.draftView = {
          ..._0x173042.baseView.panoramaView,
          ..._0xe89d09
        };
        this.bridge?.setDraftView?.({
          kind: "panorama-default",
          panoramaView: _0x173042.draftView,
          disableSmoothing: true
        });
      } else {
        const _0x5084f8 = applySceneZoomDelta(_0x173042.baseView.sceneView, _0x32eef9, {
          anchor: _0x173042.dollyAnchor
        });
        _0x173042.draftView = {
          ..._0x173042.baseView.sceneView,
          ..._0x5084f8
        };
        this.bridge?.setDraftView?.({
          kind: "scene-default",
          sceneView: _0x173042.draftView,
          disableSmoothing: true
        });
      }
      return;
    }
    if (_0x173042.type === "selection-box") {
      const _0x536c55 = _0x225f6b.clientX - _0x173042.startX;
      const _0x31d000 = _0x225f6b.clientY - _0x173042.startY;
      _0x173042.moved = _0x173042.moved || Math.hypot(_0x536c55, _0x31d000) >= MOVE_THRESHOLD;
      const _0x4a4f72 = this._getLocalPoint(_0x225f6b);
      this._updateSelectionBox(_0x173042.startLocalX, _0x173042.startLocalY, _0x4a4f72.x, _0x4a4f72.y);
      return;
    }
    if (_0x173042.type === "scene-select") {
      const _0x28d7ed = _0x225f6b.clientX - _0x173042.startX;
      const _0x36dfe6 = _0x225f6b.clientY - _0x173042.startY;
      const _0x350ac9 = Math.hypot(_0x28d7ed, _0x36dfe6) >= MOVE_THRESHOLD;
      _0x173042.moved = _0x173042.moved || _0x350ac9;
      if (!_0x173042.pickedTarget && _0x350ac9) {
        const _0x10e84f = this._getLocalPoint(_0x225f6b);
        this._updateSelectionBox(_0x173042.startLocalX, _0x173042.startLocalY, _0x10e84f.x, _0x10e84f.y);
        _0x173042.type = "selection-box";
        _0x173042.keepSelectionOnClick = false;
      }
      return;
    }
    if (_0x173042.type === "gizmo-move") {
      const _0x284ff7 = this.bridge?.sampleMoveGizmoDragPoint?.(_0x173042.dragState, _0x225f6b.clientX, _0x225f6b.clientY);
      if (!_0x284ff7) {
        return;
      }
      const _0x3d19e7 = this.bridge?.computeMoveGizmoDelta?.(_0x173042.dragState, _0x284ff7);
      if (!_0x3d19e7) {
        return;
      }
      this.bridge?.setGizmoMoveGuideLine?.({
        from: _0x173042.dragState?.pivot || {
          x: 0,
          y: 0,
          z: 0
        },
        to: addVector3Like(_0x173042.dragState?.pivot, _0x3d19e7)
      });
      const _0x155ed1 = Math.hypot(_0x3d19e7.x || 0, _0x3d19e7.y || 0, _0x3d19e7.z || 0);
      _0x173042.moved = _0x173042.moved || _0x155ed1 >= 0.0001;
      _0x173042.draftTargets = _0x173042.entries.map(_0x19f5f1 => {
        const _0x327ae0 = {
          ..._0x19f5f1.basePose,
          position: {
            x: _0x19f5f1.basePose.position.x + (_0x3d19e7.x || 0),
            y: _0x19f5f1.basePose.position.y + (_0x3d19e7.y || 0),
            z: _0x19f5f1.basePose.position.z + (_0x3d19e7.z || 0)
          }
        };
        const _0x47d096 = this._applyTransformOptions(_0x327ae0, "translate");
        this.bridge?.setDraftObjectTransform?.(_0x19f5f1.objectType, _0x19f5f1.objectId, _0x47d096);
        return {
          objectType: _0x19f5f1.objectType,
          objectId: _0x19f5f1.objectId,
          pose: _0x47d096
        };
      });
      return;
    }
    if (_0x173042.type === "gizmo-rotate") {
      const _0x39b20b = this.bridge?.sampleMoveGizmoDragPoint?.(_0x173042.dragState, _0x225f6b.clientX, _0x225f6b.clientY);
      if (!_0x39b20b) {
        return;
      }
      const _0x5f51d7 = this.bridge?.computeRotateGizmoAngle?.(_0x173042.dragState, _0x39b20b) || 0;
      _0x173042.moved = _0x173042.moved || Math.abs(_0x5f51d7) >= 0.0001;
      if (!_0x173042.dragState?.axisWorld || !_0x173042.dragState?.pivot) {
        return;
      }
      _0x173042.draftTargets = _0x173042.entries.map(_0x1e2235 => {
        const _0x25d5e3 = rotatePoseAroundWorldAxis(_0x1e2235.basePose, _0x173042.dragState.axisWorld, _0x5f51d7, _0x173042.dragState.pivot);
        const _0x18cd38 = {
          ..._0x1e2235.basePose,
          position: _0x25d5e3.position,
          rotation: _0x25d5e3.rotation,
          quaternion: _0x25d5e3.quaternion
        };
        const _0x6cd3cf = this._applyTransformOptions(_0x18cd38, "rotate");
        this.bridge?.setDraftObjectTransform?.(_0x1e2235.objectType, _0x1e2235.objectId, _0x6cd3cf);
        return {
          objectType: _0x1e2235.objectType,
          objectId: _0x1e2235.objectId,
          pose: _0x6cd3cf
        };
      });
      return;
    }
    if (_0x173042.type === "gizmo-scale") {
      const _0x126607 = this.bridge?.sampleMoveGizmoDragPoint?.(_0x173042.dragState, _0x225f6b.clientX, _0x225f6b.clientY);
      if (!_0x126607) {
        return;
      }
      const _0x94d442 = this.bridge?.computeScaleGizmoFactor?.(_0x173042.dragState, _0x126607) || 1;
      _0x173042.moved = _0x173042.moved || Math.abs(_0x94d442 - 1) >= 0.0001;
      const _0x40879f = this.getSceneState?.()?.ui || {};
      const _0x3ec958 = _0x40879f.uniformScale === true ? "xyz" : resolveScaleConstraint(_0x173042.dragState);
      _0x173042.draftTargets = _0x173042.entries.map(_0x46b8d0 => {
        const _0x516a23 = toScaleVector(_0x46b8d0.baseScale);
        let _0xd18dcd = {
          ..._0x516a23
        };
        for (const _0x186de8 of ["x", "y", "z"]) {
          if (_0x3ec958.includes(_0x186de8)) {
            _0xd18dcd[_0x186de8] = Math.max(0.01, _0x516a23[_0x186de8] * _0x94d442);
          }
        }
        const _0x185234 = _0x173042.entries.length <= 1 ? {
          x: _0x46b8d0.basePose.position.x,
          y: _0x46b8d0.basePose.position.y,
          z: _0x46b8d0.basePose.position.z
        } : _0x173042.dragState?.pivot ? scalePositionAroundPivotAxes(_0x46b8d0.basePose.position, _0x173042.dragState?.pivot, _0x94d442, _0x3ec958, _0x173042.dragState?.gizmoQuaternion) : {
          x: _0x46b8d0.basePose.position.x,
          y: _0x46b8d0.basePose.position.y,
          z: _0x46b8d0.basePose.position.z
        };
        const _0xc766d8 = {
          ..._0x46b8d0.basePose,
          position: _0x185234,
          scale: toCompatibleScale(_0xd18dcd)
        };
        const _0x24e713 = this._applyTransformOptions(_0xc766d8, "scale", _0x3ec958);
        this.bridge?.setDraftObjectTransform?.(_0x46b8d0.objectType, _0x46b8d0.objectId, _0x24e713);
        return {
          objectType: _0x46b8d0.objectType,
          objectId: _0x46b8d0.objectId,
          pose: _0x24e713
        };
      });
      return;
    }
    if (_0x173042.type === "object-move") {
      const _0x41b22f = this.bridge?.intersectGround?.(_0x225f6b.clientX, _0x225f6b.clientY, 0);
      if (_0x41b22f) {
        _0x173042.moved = true;
        _0x173042.draftPose = {
          ..._0x173042.basePose,
          position: {
            x: _0x41b22f.x - _0x173042.offset.x,
            y: _0x173042.basePose.position.y,
            z: _0x41b22f.z - _0x173042.offset.z
          }
        };
      } else {
        const _0x2130b4 = _0x225f6b.clientX - _0x173042.startX;
        const _0x47bece = _0x225f6b.clientY - _0x173042.startY;
        _0x173042.moved = Math.hypot(_0x2130b4, _0x47bece) >= 1;
        _0x173042.draftPose = {
          ..._0x173042.basePose,
          position: {
            x: _0x173042.basePose.position.x + _0x2130b4 * 0.01,
            y: _0x173042.basePose.position.y,
            z: _0x173042.basePose.position.z - _0x47bece * 0.01
          }
        };
      }
      _0x173042.draftPose = this._applyTransformOptions(_0x173042.draftPose, "translate");
      this.bridge?.setDraftObjectTransform?.(_0x173042.objectType, _0x173042.objectId, _0x173042.draftPose);
      return;
    }
    if (_0x173042.type === "object-move-batch") {
      const _0x19fa68 = this.bridge?.intersectGround?.(_0x225f6b.clientX, _0x225f6b.clientY, 0);
      let _0x10a3ab = _0x173042.baseCenter;
      if (_0x19fa68) {
        _0x173042.moved = true;
        _0x10a3ab = {
          x: _0x19fa68.x - _0x173042.pointerOffset.x,
          z: _0x19fa68.z - _0x173042.pointerOffset.z
        };
      } else {
        const _0x52bb3c = _0x225f6b.clientX - _0x173042.startX;
        const _0x14a789 = _0x225f6b.clientY - _0x173042.startY;
        _0x173042.moved = Math.hypot(_0x52bb3c, _0x14a789) >= 1;
        _0x10a3ab = {
          x: _0x173042.baseCenter.x + _0x52bb3c * 0.01,
          z: _0x173042.baseCenter.z - _0x14a789 * 0.01
        };
      }
      _0x173042.draftTargets = _0x173042.entries.map(_0x44702e => {
        const _0x49f587 = {
          ..._0x44702e.pose,
          position: {
            x: _0x10a3ab.x + _0x44702e.offset.x,
            y: _0x44702e.pose.position.y,
            z: _0x10a3ab.z + _0x44702e.offset.z
          }
        };
        const _0x194d76 = this._applyTransformOptions(_0x49f587, "translate");
        this.bridge?.setDraftObjectTransform?.(_0x44702e.objectType, _0x44702e.objectId, _0x194d76);
        return {
          objectType: _0x44702e.objectType,
          objectId: _0x44702e.objectId,
          pose: _0x194d76
        };
      });
      return;
    }
    if (_0x173042.type === "object-rotate") {
      const _0x24d1ac = _0x225f6b.clientX - _0x173042.startX;
      _0x173042.moved = Math.abs(_0x24d1ac) >= 1;
      const _0x128366 = _0x173042.basePose.rotation.y - _0x24d1ac / Math.max(160, _0x173042.rect.width || 1) * Math.PI * 1.2;
      _0x173042.draftPose = {
        ..._0x173042.basePose,
        rotation: {
          ..._0x173042.basePose.rotation,
          y: _0x128366
        }
      };
      _0x173042.draftPose = this._applyTransformOptions(_0x173042.draftPose, "rotate");
      this.bridge?.setDraftObjectTransform?.(_0x173042.objectType, _0x173042.objectId, _0x173042.draftPose);
      return;
    }
    if (_0x173042.type === "object-rotate-batch") {
      const _0x4707b0 = _0x225f6b.clientX - _0x173042.startX;
      _0x173042.moved = Math.abs(_0x4707b0) >= 1;
      const _0x5ac1f8 = -(_0x4707b0 / Math.max(160, _0x173042.rect.width || 1)) * Math.PI * 1.2;
      _0x173042.draftTargets = _0x173042.entries.map(_0x2597b9 => {
        const _0x4ccce6 = _0x2597b9.basePose.position.x - _0x173042.center.x;
        const _0x1d281e = _0x2597b9.basePose.position.z - _0x173042.center.z;
        const _0x2e771c = Math.cos(_0x5ac1f8);
        const _0x534c44 = Math.sin(_0x5ac1f8);
        const _0x59c8ff = _0x4ccce6 * _0x2e771c - _0x1d281e * _0x534c44;
        const _0x28523f = _0x4ccce6 * _0x534c44 + _0x1d281e * _0x2e771c;
        const _0x22034c = {
          ..._0x2597b9.basePose,
          position: {
            x: _0x173042.center.x + _0x59c8ff,
            y: _0x2597b9.basePose.position.y,
            z: _0x173042.center.z + _0x28523f
          },
          rotation: {
            ..._0x2597b9.basePose.rotation,
            y: _0x2597b9.basePose.rotation.y + _0x5ac1f8
          }
        };
        const _0x104b04 = this._applyTransformOptions(_0x22034c, "rotate");
        this.bridge?.setDraftObjectTransform?.(_0x2597b9.objectType, _0x2597b9.objectId, _0x104b04);
        return {
          objectType: _0x2597b9.objectType,
          objectId: _0x2597b9.objectId,
          pose: _0x104b04
        };
      });
      return;
    }
    if (_0x173042.type === "object-scale") {
      const _0x584de0 = _0x225f6b.clientX - _0x173042.startX;
      _0x173042.moved = Math.abs(_0x584de0) >= 1;
      const _0x488f73 = Math.max(0.01, Math.min(4, 1 + _0x584de0 / Math.max(120, _0x173042.rect.width || 1) * 2));
      const _0x3dd781 = toScaleVector(_0x173042.basePose.scale);
      const _0x53ddff = toCompatibleScale({
        x: Math.max(0.01, Math.min(4, _0x3dd781.x * _0x488f73)),
        y: Math.max(0.01, Math.min(4, _0x3dd781.y * _0x488f73)),
        z: Math.max(0.01, Math.min(4, _0x3dd781.z * _0x488f73))
      });
      _0x173042.draftPose = {
        ..._0x173042.basePose,
        scale: _0x53ddff
      };
      _0x173042.draftPose = this._applyTransformOptions(_0x173042.draftPose, "scale");
      this.bridge?.setDraftObjectTransform?.(_0x173042.objectType, _0x173042.objectId, _0x173042.draftPose);
      return;
    }
    if (_0x173042.type === "object-scale-batch") {
      const _0x455bcf = _0x225f6b.clientX - _0x173042.startX;
      _0x173042.moved = Math.abs(_0x455bcf) >= 1;
      const _0x45f51e = Math.max(0.01, Math.min(4, 1 + _0x455bcf / Math.max(120, _0x173042.rect.width || 1) * 2));
      _0x173042.draftTargets = _0x173042.entries.map(_0x557b26 => {
        const _0x1d3323 = _0x557b26.basePose.position.x - _0x173042.center.x;
        const _0x125fdc = _0x557b26.basePose.position.z - _0x173042.center.z;
        const _0x532da7 = toScaleVector(_0x557b26.basePose.scale);
        const _0x2605fa = {
          ..._0x557b26.basePose,
          position: {
            x: _0x173042.center.x + _0x1d3323 * _0x45f51e,
            y: _0x557b26.basePose.position.y,
            z: _0x173042.center.z + _0x125fdc * _0x45f51e
          },
          scale: toCompatibleScale({
            x: Math.max(0.01, Math.min(4, _0x532da7.x * _0x45f51e)),
            y: Math.max(0.01, Math.min(4, _0x532da7.y * _0x45f51e)),
            z: Math.max(0.01, Math.min(4, _0x532da7.z * _0x45f51e))
          })
        };
        const _0x45cae7 = this._applyTransformOptions(_0x2605fa, "scale");
        this.bridge?.setDraftObjectTransform?.(_0x557b26.objectType, _0x557b26.objectId, _0x45cae7);
        return {
          objectType: _0x557b26.objectType,
          objectId: _0x557b26.objectId,
          pose: _0x45cae7
        };
      });
    }
  }
  _handlePointerUp(_0x127dc3) {
    if (!this._gesture || _0x127dc3.pointerId != null && _0x127dc3.pointerId !== this._gesture.pointerId) {
      return;
    }
    this._stopEvent(_0x127dc3, {
      preventDefault: true
    });
    const _0x4afea9 = this._gesture;
    this._gesture = null;
    this.viewportEl.releasePointerCapture?.(_0x4afea9.pointerId);
    if (_0x4afea9.type === "orbit-scene") {
      if (_0x4afea9.clearSelectionOnClick && !_0x4afea9.moved) {
        this.onSelectionClear?.();
        this.bridge?.clearDraftView?.();
        return;
      }
      if (!_0x4afea9.draftView && _0x4afea9.rect) {
        const _0x186388 = _0x127dc3.clientX - _0x4afea9.startX;
        const _0x4484b1 = _0x127dc3.clientY - _0x4afea9.startY;
        const _0x4b6b4e = applyOrbitDelta(_0x4afea9.baseView.sceneView, _0x186388, _0x4484b1, _0x4afea9.rect, {
          fov: _0x4afea9.baseView.currentPose?.fov
        });
        _0x4afea9.draftView = {
          ..._0x4afea9.baseView.sceneView,
          ..._0x4b6b4e
        };
      }
      if (_0x4afea9.draftView) {
        this.onViewCommit?.({
          sceneView: _0x4afea9.draftView,
          activeView: "default",
          activeCameraId: null
        });
        this._queueDraftClear(() => this.bridge?.clearDraftView?.());
      } else {
        this.bridge?.clearDraftView?.();
      }
      return;
    }
    if (_0x4afea9.type === "look-panorama") {
      if (!_0x4afea9.draftView && _0x4afea9.rect) {
        const _0x46e135 = _0x127dc3.clientX - _0x4afea9.startX;
        const _0x112dde = _0x127dc3.clientY - _0x4afea9.startY;
        const _0x193cdd = applyPanoramaLookDelta(_0x4afea9.baseView.panoramaView, _0x46e135, -_0x112dde, _0x4afea9.rect);
        _0x4afea9.draftView = {
          ..._0x4afea9.baseView.panoramaView,
          ..._0x193cdd
        };
      }
      if (_0x4afea9.draftView) {
        this.onViewCommit?.({
          panoramaView: _0x4afea9.draftView,
          activeView: "default",
          activeCameraId: null
        });
        this._queueDraftClear(() => this.bridge?.clearDraftView?.());
      } else {
        this.bridge?.clearDraftView?.();
      }
      return;
    }
    if (_0x4afea9.type === "fly-look") {
      if (_0x4afea9.draftView) {
        this._flyDraft = {
          sceneView: _0x4afea9.draftView
        };
        if (this._hasFlightMovement()) {
          this._scheduleFlyNavigation();
        } else {
          this._finishFlyNavigation({
            commit: true
          });
        }
      } else if (!this._hasFlightMovement()) {
        this._finishFlyNavigation({
          commit: true
        });
      }
      return;
    }
    if (_0x4afea9.type === "pan" || _0x4afea9.type === "dolly") {
      if (_0x4afea9.draftView) {
        this.onViewCommit?.({
          sceneView: _0x4afea9.draftView,
          activeView: "default",
          activeCameraId: null
        });
        this._queueDraftClear(() => this.bridge?.clearDraftView?.());
      } else {
        this.bridge?.clearDraftView?.();
      }
      return;
    }
    if (_0x4afea9.type === "zoom-middle") {
      if (_0x4afea9.draftView) {
        if (_0x4afea9.baseView?.kind === "panorama-default") {
          this.onViewCommit?.({
            panoramaView: _0x4afea9.draftView,
            activeView: "default",
            activeCameraId: null
          });
        } else {
          this.onViewCommit?.({
            sceneView: _0x4afea9.draftView,
            activeView: "default",
            activeCameraId: null
          });
        }
        this._queueDraftClear(() => this.bridge?.clearDraftView?.());
      } else {
        this.bridge?.clearDraftView?.();
      }
      return;
    }
    if (_0x4afea9.type === "selection-box") {
      this._clearSelectionBox();
      if (!_0x4afea9.moved) {
        if (_0x4afea9.keepSelectionOnClick) {
          return;
        }
        this.onSelectionClear?.();
        return;
      }
      const _0x43252c = getClientRectFromPoints(_0x4afea9.startX, _0x4afea9.startY, _0x127dc3.clientX, _0x127dc3.clientY);
      const _0x262c0e = this.bridge?.pickObjectsInRect?.(_0x43252c) || [];
      if (_0x262c0e.length === 0) {
        this.onSelectionClear?.();
        return;
      }
      const _0x45c707 = this.getSceneState?.();
      const _0x5a264b = [];
      const _0x12293e = new Set();
      const _0x5cd1fb = new Set();
      const _0x4e56c3 = new Set();
      const _0x2f2552 = (_0x8231f9, _0x3a17f9) => {
        if (_0x8231f9 !== "mannequin" && _0x8231f9 !== "cube" || !_0x3a17f9) {
          return;
        }
        const _0x5daec7 = _0x8231f9 + ":" + _0x3a17f9;
        if (_0x12293e.has(_0x5daec7)) {
          return;
        }
        _0x12293e.add(_0x5daec7);
        _0x5a264b.push({
          objectType: _0x8231f9,
          objectId: _0x3a17f9
        });
      };
      _0x262c0e.forEach(_0x3d6c45 => {
        if (_0x3d6c45.objectType === "mannequin") {
          _0x5cd1fb.add(_0x3d6c45.objectId);
          _0x2f2552("mannequin", _0x3d6c45.objectId);
        } else if (_0x3d6c45.objectType === "cube") {
          _0x4e56c3.add(_0x3d6c45.objectId);
          _0x2f2552("cube", _0x3d6c45.objectId);
        }
      });
      if (_0x5a264b.length === 0) {
        this.onSelectionClear?.();
        return;
      }
      const _0x236f4b = Array.isArray(_0x45c707?.groups) ? _0x45c707.groups : [];
      const _0x4d435c = new Set(_0x5cd1fb);
      const _0x4a2c2d = [];
      _0x236f4b.forEach(_0x421678 => {
        const _0x458c7f = Array.isArray(_0x421678?.memberIds) ? _0x421678.memberIds : [];
        if (!_0x458c7f.some(_0x41be1c => _0x4d435c.has(_0x41be1c))) {
          return;
        }
        _0x4a2c2d.push(_0x421678);
        _0x458c7f.forEach(_0x19e9ad => _0x4d435c.add(_0x19e9ad));
      });
      _0x4d435c.forEach(_0x24e8bf => {
        _0x2f2552("mannequin", _0x24e8bf);
      });
      const _0x49f015 = _0x5a264b.filter(_0x551416 => {
        if (_0x551416.objectType === "cube") {
          return _0x4e56c3.has(_0x551416.objectId);
        }
        return _0x4d435c.has(_0x551416.objectId);
      });
      if (_0x49f015.length === 0) {
        this.onSelectionClear?.();
        return;
      }
      const _0x309e29 = _0x4e56c3.size === 0 && _0x4a2c2d.length === 1 && _0x49f015.every(_0x258832 => _0x258832.objectType === "mannequin") && _0x4a2c2d[0].memberIds.length === _0x49f015.length && _0x4a2c2d[0].memberIds.every(_0x47b452 => _0x4d435c.has(_0x47b452)) ? _0x4a2c2d[0].id : null;
      this.onSelectionObjectsChange?.(_0x49f015, {
        activeObjectType: _0x49f015[0].objectType,
        activeObjectId: _0x49f015[0].objectId,
        groupId: _0x309e29
      });
      return;
    }
    if (_0x4afea9.type === "scene-select") {
      if (_0x4afea9.pickedTarget) {
        if (_0x4afea9.selectionCommittedOnPointerDown) {
          return;
        }
        if (_0x4afea9.pickedGroup) {
          this.onSelectionBatchChange?.("mannequin", _0x4afea9.pickedGroup.memberIds, _0x4afea9.pickedGroup.id);
        } else {
          this.onSelectionChange?.(_0x4afea9.pickedTarget.objectType, _0x4afea9.pickedTarget.objectId);
        }
      } else {
        this.onSelectionClear?.();
      }
      return;
    }
    if (_0x4afea9.type === "gizmo-move") {
      this._clearGizmoMoveGuideLine();
      this.bridge?.setGizmoActiveHandle?.(null);
      const _0x177fc5 = Array.isArray(_0x4afea9.draftTargets) ? _0x4afea9.draftTargets : [];
      if (_0x177fc5.length > 0) {
        if (_0x177fc5.length === 1) {
          this.onObjectCommit?.({
            objectType: _0x177fc5[0].objectType,
            objectId: _0x177fc5[0].objectId,
            pose: _0x177fc5[0].pose
          });
        } else {
          this.onObjectBatchCommit?.({
            targets: _0x177fc5
          });
        }
        this._queueDraftClear(() => {
          _0x177fc5.forEach(_0x551731 => {
            this.bridge?.clearDraftObjectTransform?.(_0x551731.objectType, _0x551731.objectId);
          });
        });
      } else {
        this.bridge?.clearAllDrafts?.();
      }
      this._updateGizmoHover(_0x127dc3);
      return;
    }
    if (_0x4afea9.type === "gizmo-rotate" || _0x4afea9.type === "gizmo-scale") {
      this._clearGizmoMoveGuideLine();
      this.bridge?.setGizmoActiveHandle?.(null);
      const _0x5bb34e = Array.isArray(_0x4afea9.draftTargets) ? _0x4afea9.draftTargets : [];
      if (_0x5bb34e.length > 0) {
        if (_0x5bb34e.length === 1) {
          this.onObjectCommit?.({
            objectType: _0x5bb34e[0].objectType,
            objectId: _0x5bb34e[0].objectId,
            pose: _0x5bb34e[0].pose
          });
        } else {
          this.onObjectBatchCommit?.({
            targets: _0x5bb34e
          });
        }
        this._queueDraftClear(() => {
          _0x5bb34e.forEach(_0x5174a4 => {
            this.bridge?.clearDraftObjectTransform?.(_0x5174a4.objectType, _0x5174a4.objectId);
          });
        });
      } else {
        this.bridge?.clearAllDrafts?.();
      }
      this._updateGizmoHover(_0x127dc3);
      return;
    }
    if (_0x4afea9.type === "object-move" || _0x4afea9.type === "object-rotate" || _0x4afea9.type === "object-scale") {
      this.onSelectionChange?.(_0x4afea9.objectType, _0x4afea9.objectId);
      this.onObjectCommit?.({
        objectType: _0x4afea9.objectType,
        objectId: _0x4afea9.objectId,
        pose: _0x4afea9.draftPose || _0x4afea9.basePose
      });
      this._queueDraftClear(() => this.bridge?.clearDraftObjectTransform?.(_0x4afea9.objectType, _0x4afea9.objectId));
      return;
    }
    if (_0x4afea9.type === "object-move-batch" || _0x4afea9.type === "object-rotate-batch" || _0x4afea9.type === "object-scale-batch") {
      const _0x23ce94 = Array.isArray(_0x4afea9.draftTargets) ? _0x4afea9.draftTargets : [];
      if (_0x23ce94.length > 0) {
        this.onObjectBatchCommit?.({
          targets: _0x23ce94
        });
        this._queueDraftClear(() => {
          _0x23ce94.forEach(_0x375121 => {
            this.bridge?.clearDraftObjectTransform?.(_0x375121.objectType, _0x375121.objectId);
          });
        });
      } else {
        this.bridge?.clearAllDrafts?.();
      }
    }
  }
  _handlePointerLeave() {
    if (this._gesture?.type === "gizmo-move" || this._gesture?.type === "gizmo-rotate" || this._gesture?.type === "gizmo-scale") {
      return;
    }
    this.bridge?.setGizmoHoverHandle?.(null);
  }
  _handleWheel(_0x2d4c92) {
    const _0x3b1f6a = this.getSceneState?.();
    if (!_0x3b1f6a || !this._isEditing(_0x3b1f6a)) {
      return;
    }
    const _0x239cf2 = this._isPanoramaMode(_0x3b1f6a);
    this._syncControlsByMode(_0x239cf2);
    this._stopEvent(_0x2d4c92, {
      preventDefault: true
    });
    const _0x3854dc = this.viewportEl?.getBoundingClientRect?.() || null;
    const _0x44fe87 = normalizeWheelDelta(_0x2d4c92.deltaY, _0x2d4c92.deltaMode, _0x3854dc?.height);
    if (_0x44fe87 === 0) {
      return;
    }
    if (_0x239cf2) {
      const _0x43033f = this._wheelDraft?.kind === "panorama" ? this._wheelDraft.payload.panoramaView : _0x3b1f6a.viewport.panoramaView;
      const _0x35e4ff = {
        ..._0x43033f,
        ...applyPanoramaZoomDelta(_0x43033f, _0x44fe87)
      };
      this._wheelDraft = {
        kind: "panorama",
        payload: {
          panoramaView: _0x35e4ff,
          activeView: "default",
          activeCameraId: null
        }
      };
      this.bridge?.setDraftView?.({
        kind: "panorama-default",
        panoramaView: _0x35e4ff,
        disableSmoothing: true
      });
      this._scheduleWheelCommit();
      return;
    }
    if (_0x3b1f6a.mode === "panorama") {
      const _0x54ce43 = this._wheelDraft?.kind === "panorama" ? this._wheelDraft.payload.panoramaView : _0x3b1f6a.viewport.panoramaView;
      const _0x15b073 = {
        ..._0x54ce43,
        ...applyPanoramaZoomDelta(_0x54ce43, _0x44fe87)
      };
      this._wheelDraft = {
        kind: "panorama",
        payload: {
          panoramaView: _0x15b073,
          activeView: "default",
          activeCameraId: null
        }
      };
      this.bridge?.setDraftView?.({
        kind: "panorama-default",
        panoramaView: _0x15b073,
        disableSmoothing: true
      });
      this._scheduleWheelCommit();
      return;
    }
    const _0x1a11d1 = this._createBaseView(_0x3b1f6a);
    if (_0x1a11d1.kind !== "scene-default") {
      return;
    }
    const _0xbe9302 = this._wheelDraft?.kind === "scene" ? this._wheelDraft.payload.sceneView : _0x1a11d1.sceneView;
    const _0x242e52 = this._wheelDraft?.kind === "scene" ? this._wheelDraft.anchor : this.bridge?.resolveDollyAnchor?.(_0x2d4c92.clientX, _0x2d4c92.clientY) || null;
    const _0x47b967 = {
      ..._0xbe9302,
      ...applySceneZoomDelta(_0xbe9302, _0x44fe87, {
        anchor: _0x242e52
      })
    };
    this._wheelDraft = {
      kind: "scene",
      anchor: _0x242e52,
      payload: {
        sceneView: _0x47b967,
        activeView: "default",
        activeCameraId: null
      }
    };
    this.bridge?.setDraftView?.({
      kind: "scene-default",
      sceneView: _0x47b967,
      disableSmoothing: true
    });
    this._scheduleWheelCommit();
  }
  _handleContextMenu(_0x4909a4) {
    const _0x4df8c2 = this.getSceneState?.();
    if (!_0x4df8c2 || !this._isEditing(_0x4df8c2)) {
      return;
    }
    this._stopEvent(_0x4909a4, {
      preventDefault: true
    });
  }
}