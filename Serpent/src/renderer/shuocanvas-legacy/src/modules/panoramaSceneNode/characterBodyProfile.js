const DEFAULT_CHARACTER_BODY_HEIGHT = 1.92;
function finiteBodyValue(_0x425c5b, _0x27c901, _0x44cf2e, _0x12a831) {
  const _0x48403a = Number(_0x425c5b);
  if (Number.isFinite(_0x48403a)) {
    return Math.max(_0x44cf2e, Math.min(_0x12a831, _0x48403a));
  } else {
    return _0x27c901;
  }
}
export function captureCharacterModelBodyProfileBase(_0x255f4e) {
  const _0x1d829d = _0x255f4e?.getObjectByName?.("Head");
  return {
    rootScale: {
      x: Number(_0x255f4e?.scale?.x) || 1,
      y: Number(_0x255f4e?.scale?.y) || 1,
      z: Number(_0x255f4e?.scale?.z) || 1
    },
    headScale: _0x1d829d?.scale ? {
      x: Number(_0x1d829d.scale.x) || 1,
      y: Number(_0x1d829d.scale.y) || 1,
      z: Number(_0x1d829d.scale.z) || 1
    } : null
  };
}
export function applyCharacterBodyProfile(_0x469955, _0x47cdf4 = {}) {
  if (!_0x469955) {
    return;
  }
  const _0x59506b = finiteBodyValue(_0x47cdf4?.height, DEFAULT_CHARACTER_BODY_HEIGHT, 0.55, 2.3);
  const _0xef77ef = _0x59506b / DEFAULT_CHARACTER_BODY_HEIGHT;
  const _0x3fd269 = finiteBodyValue(_0x47cdf4?.shoulderScale, 1, 0.65, 1.35);
  const _0x4a0aa6 = finiteBodyValue(_0x47cdf4?.hipScale, 1, 0.65, 1.35);
  const _0x4e2536 = (_0x3fd269 + _0x4a0aa6) / 2;
  const _0x34ca37 = finiteBodyValue(_0x47cdf4?.depthScale, 1, 0.75, 1.25);
  const _0x4953ce = finiteBodyValue(_0x47cdf4?.headScale, 1, 0.85, 1.45);
  _0x469955.proxyRoot?.scale?.set?.(_0xef77ef * _0x4e2536, _0xef77ef, _0xef77ef * _0x34ca37);
  _0x469955.parts?.head?.scale?.multiplyScalar?.(_0x4953ce);
  if (!_0x469955.modelRoot) {
    return;
  }
  if (!_0x469955.modelBodyProfileBase) {
    _0x469955.modelBodyProfileBase = captureCharacterModelBodyProfileBase(_0x469955.modelRoot);
  }
  const _0x2aef98 = _0x469955.modelBodyProfileBase;
  _0x469955.modelRoot.scale.set(_0x2aef98.rootScale.x * _0xef77ef * _0x4e2536, _0x2aef98.rootScale.y * _0xef77ef, _0x2aef98.rootScale.z * _0xef77ef * _0x34ca37);
  const _0x3782f6 = _0x469955.modelRoot.getObjectByName?.("Head");
  if (_0x3782f6?.scale && _0x2aef98.headScale) {
    _0x3782f6.scale.set(_0x2aef98.headScale.x * _0x4953ce, _0x2aef98.headScale.y * _0x4953ce, _0x2aef98.headScale.z * _0x4953ce);
  }
  _0x469955.modelRoot.updateMatrixWorld?.(true);
}