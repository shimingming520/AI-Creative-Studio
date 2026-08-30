function requestFrame(_0x24dc0c) {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(_0x24dc0c);
  }
  _0x24dc0c();
  return 0;
}
function cancelFrame(_0x2d47fd) {
  if (!_0x2d47fd) {
    return;
  }
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(_0x2d47fd);
  }
}
export function createPreviewCommitSession({
  applyPreview: _0x3b0bb7
} = {}) {
  let _0x261671 = false;
  let _0x249777 = false;
  let _0x29fb4b = 0;
  let _0x5842d6 = null;
  let _0x15afd3 = null;
  const _0x404093 = () => {
    if (!_0x29fb4b) {
      return;
    }
    cancelFrame(_0x29fb4b);
    _0x29fb4b = 0;
  };
  const _0x2f7db0 = () => {
    _0x29fb4b = 0;
    if (_0x5842d6 == null) {
      return;
    }
    const _0x301a9a = _0x5842d6;
    _0x5842d6 = null;
    _0x15afd3 = _0x301a9a;
    _0x3b0bb7?.(_0x301a9a);
  };
  const _0x3d7834 = () => {
    if (_0x29fb4b) {
      return;
    }
    _0x29fb4b = requestFrame(_0x2f7db0);
  };
  const _0x4e1911 = () => {
    _0x404093();
    _0x261671 = false;
    _0x249777 = false;
    _0x5842d6 = null;
    _0x15afd3 = null;
  };
  const _0x44bf53 = _0x3875c0 => {
    _0x261671 = true;
    _0x249777 = false;
    _0x5842d6 = null;
    _0x15afd3 = _0x3875c0;
  };
  return {
    begin: _0x44bf53,
    update(_0x1d30e4) {
      if (!_0x261671) {
        _0x44bf53(_0x1d30e4);
      }
      _0x249777 = true;
      _0x15afd3 = _0x1d30e4;
      _0x5842d6 = _0x1d30e4;
      _0x3d7834();
    },
    getPreview() {
      if (!_0x261671) {
        return null;
      }
      return _0x5842d6 || _0x15afd3;
    },
    commit() {
      _0x404093();
      if (_0x5842d6 != null) {
        _0x2f7db0();
      }
      const _0x5ac8a0 = _0x249777 && _0x15afd3 != null ? _0x15afd3 : null;
      _0x4e1911();
      return _0x5ac8a0;
    },
    cancel() {
      _0x4e1911();
    },
    isActive() {
      return _0x261671;
    }
  };
}