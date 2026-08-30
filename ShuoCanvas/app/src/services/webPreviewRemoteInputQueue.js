function isMouseInputType(_0x4558f8, _0x23090f) {
  return _0x4558f8?.kind === "mouse" && _0x4558f8?.type === _0x23090f;
}
function mergePendingInput(_0xde52e7, _0x4ffc29) {
  if (isMouseInputType(_0xde52e7, "mouseMoved") && isMouseInputType(_0x4ffc29, "mouseMoved")) {
    return {
      ..._0x4ffc29
    };
  }
  if (isMouseInputType(_0xde52e7, "mouseWheel") && isMouseInputType(_0x4ffc29, "mouseWheel")) {
    return {
      ..._0x4ffc29,
      deltaX: (Number(_0xde52e7.deltaX) || 0) + (Number(_0x4ffc29.deltaX) || 0),
      deltaY: (Number(_0xde52e7.deltaY) || 0) + (Number(_0x4ffc29.deltaY) || 0)
    };
  }
  return null;
}
export function createWebPreviewRemoteInputQueue({
  send: _0xd03016
} = {}) {
  if (typeof _0xd03016 !== "function") {
    throw new TypeError("Web preview remote input sender is required");
  }
  const _0x6c3c58 = [];
  let _0x2fa7ca = false;
  let _0x844c9f = false;
  const _0x1d1874 = async () => {
    if (_0x2fa7ca || _0x844c9f) {
      return;
    }
    _0x2fa7ca = true;
    try {
      while (!_0x844c9f && _0x6c3c58.length > 0) {
        const _0x198bab = _0x6c3c58.shift();
        try {
          await _0xd03016(_0x198bab);
        } catch {}
      }
    } finally {
      _0x2fa7ca = false;
      if (!_0x844c9f && _0x6c3c58.length > 0) {
        _0x1d1874();
      }
    }
  };
  return {
    enqueue(_0x43bb95 = {}) {
      if (_0x844c9f || !_0x43bb95 || typeof _0x43bb95 !== "object") {
        return false;
      }
      const _0x19e2a2 = {
        ..._0x43bb95
      };
      const _0x221471 = _0x6c3c58.length - 1;
      const _0x272738 = _0x221471 >= 0 ? mergePendingInput(_0x6c3c58[_0x221471], _0x19e2a2) : null;
      if (_0x272738) {
        _0x6c3c58[_0x221471] = _0x272738;
      } else {
        _0x6c3c58.push(_0x19e2a2);
      }
      _0x1d1874();
      return true;
    },
    dispose() {
      _0x844c9f = true;
      _0x6c3c58.length = 0;
    }
  };
}
export const __webPreviewRemoteInputQueueForTest = {
  mergePendingInput: mergePendingInput
};