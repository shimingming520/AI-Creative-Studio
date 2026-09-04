function normalizeDelay(_0x277065, _0xad6e1b) {
  const _0x85f989 = Number(_0x277065);
  if (Number.isFinite(_0x85f989) && _0x85f989 >= 0) {
    return _0x85f989;
  } else {
    return _0xad6e1b;
  }
}
function getErrorMessage(_0x3a6840) {
  return String(_0x3a6840?.message || _0x3a6840 || "自动保存失败").trim() || "自动保存失败";
}
export function createWorkspacePersistenceCoordinator({
  save: _0x30575c,
  getSnapshot: _0x535756,
  ready = true,
  debounceMs = 500,
  retryBaseMs = 1000,
  retryMaxMs = 10000,
  setTimeoutFn = globalThis.setTimeout?.bind(globalThis),
  clearTimeoutFn = globalThis.clearTimeout?.bind(globalThis),
  onStateChange = () => {},
  onError = () => {}
} = {}) {
  const _0x125279 = typeof _0x30575c === "function" && typeof _0x535756 === "function";
  const _0x19d050 = normalizeDelay(debounceMs, 500);
  const _0x41501d = normalizeDelay(retryBaseMs, 1000);
  const _0x4f3af1 = Math.max(_0x41501d, normalizeDelay(retryMaxMs, 10000));
  let _0x52ba14 = ready === true;
  let _0x5267e9 = false;
  let _0x1e1c4e = 0;
  let _0x1a9ec3 = 0;
  let _0x133ef1 = 0;
  let _0x3cdb0f = 0;
  let _0x4e8d6f = 0;
  let _0x2ae983 = null;
  let _0x3346fb = null;
  let _0x5eabcf = {
    status: _0x125279 ? "saved" : "idle",
    error: "",
    retryAttempt: 0
  };
  const _0x5da608 = (_0x3fca1b, {
    error = "",
    attempt = _0x4e8d6f
  } = {}) => {
    _0x5eabcf = {
      status: _0x3fca1b,
      error: String(error || "").trim(),
      retryAttempt: Math.max(0, Math.trunc(Number(attempt) || 0))
    };
    onStateChange({
      ..._0x5eabcf
    });
    return _0x5eabcf;
  };
  const _0x190747 = () => {
    if (_0x1e1c4e && typeof clearTimeoutFn === "function") {
      clearTimeoutFn(_0x1e1c4e);
    }
    _0x1e1c4e = 0;
  };
  const _0x44d470 = () => {
    if (_0x1a9ec3 && typeof clearTimeoutFn === "function") {
      clearTimeoutFn(_0x1a9ec3);
    }
    _0x1a9ec3 = 0;
  };
  const _0x4fad20 = _0x3a8d9d => {
    _0x4e8d6f += 1;
    _0x5da608("error", {
      error: getErrorMessage(_0x3a8d9d),
      attempt: _0x4e8d6f
    });
    if (_0x5267e9 || !_0x52ba14 || !_0x125279 || _0x1a9ec3 || typeof setTimeoutFn !== "function") {
      return;
    }
    const _0x242c04 = Math.min(_0x41501d * 2 ** Math.max(0, _0x4e8d6f - 1), _0x4f3af1);
    _0x1a9ec3 = setTimeoutFn(() => {
      _0x1a9ec3 = 0;
      _0x195e78().catch(onError);
    }, _0x242c04) || 0;
  };
  const _0x376f7e = ({
    allowStopped = false
  } = {}) => {
    if (!_0x52ba14 || !_0x125279 || _0x5267e9 && !allowStopped) {
      return Promise.resolve(_0x3346fb);
    }
    _0x190747();
    _0x44d470();
    if (_0x2ae983) {
      return _0x2ae983;
    }
    const _0x28083d = async () => {
      while (_0x3cdb0f < _0x133ef1) {
        const _0x2f5e29 = _0x133ef1;
        const _0x1ae7cd = _0x535756();
        _0x5da608("saving", {
          attempt: _0x4e8d6f
        });
        try {
          _0x3346fb = await _0x30575c(_0x1ae7cd);
        } catch (_0xe15ab3) {
          _0x4fad20(_0xe15ab3);
          throw _0xe15ab3;
        }
        _0x3cdb0f = _0x2f5e29;
        _0x4e8d6f = 0;
        if (_0x3cdb0f >= _0x133ef1) {
          _0x5da608("saved");
        }
      }
      return _0x3346fb;
    };
    const _0x26861a = _0x28083d().finally(() => {
      if (_0x2ae983 === _0x26861a) {
        _0x2ae983 = null;
      }
    });
    _0x2ae983 = _0x26861a;
    return _0x26861a;
  };
  function _0x195e78({
    force = false
  } = {}) {
    if (force && _0x125279 && !_0x5267e9 && _0x133ef1 <= _0x3cdb0f) {
      _0x133ef1 = _0x3cdb0f + 1;
      _0x5da608("pending");
    }
    return _0x376f7e();
  }
  const _0x28d015 = () => {
    if (!_0x52ba14 || _0x5267e9 || !_0x125279 || typeof setTimeoutFn !== "function") {
      return;
    }
    _0x190747();
    _0x1e1c4e = setTimeoutFn(() => {
      _0x1e1c4e = 0;
      _0x195e78().catch(onError);
    }, _0x19d050) || 0;
  };
  const _0xfa1370 = ({
    immediate = false
  } = {}) => {
    if (_0x5267e9) {
      return _0x133ef1;
    }
    _0x133ef1 += 1;
    if (_0x125279 && _0x5eabcf.status !== "error") {
      _0x5da608("pending");
    }
    if (!_0x52ba14 || !_0x125279) {
      return _0x133ef1;
    }
    if (immediate) {
      _0x190747();
      _0x195e78().catch(onError);
    } else {
      _0x28d015();
    }
    return _0x133ef1;
  };
  const _0x59b82e = (_0x6c363e = true, {
    immediate = false
  } = {}) => {
    _0x52ba14 = _0x6c363e === true;
    if (!_0x52ba14 || _0x5267e9 || _0x133ef1 <= _0x3cdb0f) {
      return;
    }
    if (immediate) {
      _0x195e78().catch(onError);
    } else {
      _0x28d015();
    }
  };
  const _0x36ec1f = _0x1803bd => {
    _0x52ba14 = false;
    _0x4e8d6f = 0;
    _0x190747();
    _0x44d470();
    _0x5da608("error", {
      error: getErrorMessage(_0x1803bd),
      attempt: 0
    });
  };
  const _0x3e0216 = async ({
    flush: _0x31dd40 = true,
    force = false
  } = {}) => {
    if (_0x5267e9) {
      return _0x2ae983 || _0x3346fb;
    }
    _0x190747();
    _0x44d470();
    if (force && _0x125279 && _0x133ef1 <= _0x3cdb0f) {
      _0x133ef1 = _0x3cdb0f + 1;
      _0x5da608("pending");
    }
    _0x5267e9 = true;
    if (!_0x31dd40 || !_0x52ba14 || !_0x125279) {
      return _0x2ae983 || _0x3346fb;
    }
    try {
      return await _0x376f7e({
        allowStopped: true
      });
    } finally {
      _0x190747();
      _0x44d470();
    }
  };
  return Object.freeze({
    schedule: _0xfa1370,
    flush: _0x195e78,
    setReady: _0x59b82e,
    setHydrationError: _0x36ec1f,
    destroy: _0x3e0216,
    getRevision: () => _0x133ef1,
    getPersistedRevision: () => _0x3cdb0f,
    getState: () => ({
      ..._0x5eabcf
    }),
    isReady: () => _0x52ba14,
    isDirty: () => _0x133ef1 > _0x3cdb0f
  });
}