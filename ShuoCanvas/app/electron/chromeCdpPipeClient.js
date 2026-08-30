const DEFAULT_COMMAND_TIMEOUT_MS = 15000;
function createProtocolError(_0x2af6be = {}) {
  const _0x1bd15b = String(_0x2af6be?.message || "Chrome DevTools Protocol command failed");
  const _0x31ab72 = new Error(_0x1bd15b);
  if (_0x2af6be?.code != null) {
    _0x31ab72.code = _0x2af6be.code;
  }
  if (_0x2af6be?.data != null) {
    _0x31ab72.data = _0x2af6be.data;
  }
  return _0x31ab72;
}
export function createChromeCdpPipeClient({
  readable: _0x1aa8fd,
  writable: _0x386188,
  commandTimeoutMs = DEFAULT_COMMAND_TIMEOUT_MS,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  logEvent = null
} = {}) {
  if (!_0x1aa8fd || typeof _0x1aa8fd.on !== "function") {
    throw new TypeError("Chrome CDP readable pipe is required");
  }
  if (!_0x386188 || typeof _0x386188.write !== "function") {
    throw new TypeError("Chrome CDP writable pipe is required");
  }
  const _0x5702ec = new Map();
  const _0x2e960f = new Set();
  let _0x18e68d = 0;
  let _0x39b317 = "";
  let _0x21b9d3 = false;
  function _0x4fdf77(_0x399dda, _0x55ddfc) {
    const _0x1cb970 = _0x5702ec.get(_0x399dda);
    if (!_0x1cb970) {
      return false;
    }
    _0x5702ec.delete(_0x399dda);
    if (_0x1cb970.timer) {
      clearTimeoutFn(_0x1cb970.timer);
    }
    _0x55ddfc(_0x1cb970);
    return true;
  }
  function _0x27cd12(_0x2d6829 = {}) {
    if (_0x2d6829.id != null) {
      _0x4fdf77(_0x2d6829.id, _0xf76fc7 => {
        if (_0x2d6829.error) {
          _0xf76fc7.reject(createProtocolError(_0x2d6829.error));
          return;
        }
        _0xf76fc7.resolve(_0x2d6829.result || {});
      });
      return;
    }
    if (!_0x2d6829.method) {
      return;
    }
    for (const _0x4de83d of [..._0x2e960f]) {
      try {
        _0x4de83d(_0x2d6829);
      } catch {}
    }
  }
  function _0x46ef7e(_0xc8af9) {
    _0x39b317 += Buffer.isBuffer(_0xc8af9) ? _0xc8af9.toString("utf8") : String(_0xc8af9 || "");
    while (true) {
      const _0x9ce399 = _0x39b317.indexOf("\0");
      if (_0x9ce399 < 0) {
        break;
      }
      const _0x436b6f = _0x39b317.slice(0, _0x9ce399);
      _0x39b317 = _0x39b317.slice(_0x9ce399 + 1);
      if (!_0x436b6f) {
        continue;
      }
      try {
        _0x27cd12(JSON.parse(_0x436b6f));
      } catch (_0x3f1e42) {
        logEvent?.({
          type: "chrome_cdp.invalid_message",
          level: "warn",
          source: "main",
          message: "Chrome CDP pipe returned an invalid message",
          error: _0x3f1e42
        });
      }
    }
  }
  function _0x530b27(_0x40bf0a = "Chrome CDP pipe closed") {
    if (_0x21b9d3) {
      return;
    }
    _0x21b9d3 = true;
    _0x1aa8fd.off?.("data", _0x46ef7e);
    _0x1aa8fd.off?.("close", _0x29226c);
    _0x1aa8fd.off?.("end", _0x29226c);
    _0x1aa8fd.off?.("error", _0x4a7335);
    _0x386188.off?.("close", _0x29226c);
    _0x386188.off?.("error", _0x4a7335);
    for (const _0x4db83f of [..._0x5702ec.keys()]) {
      _0x4fdf77(_0x4db83f, _0x6131e0 => _0x6131e0.reject(new Error(_0x40bf0a)));
    }
    _0x2e960f.clear();
  }
  function _0x29226c() {
    _0x530b27();
  }
  function _0x4a7335(_0xf096df) {
    logEvent?.({
      type: "chrome_cdp.pipe_error",
      level: "warn",
      source: "main",
      message: "Chrome CDP pipe failed",
      error: _0xf096df
    });
    _0x530b27(String(_0xf096df?.message || _0xf096df || "Chrome CDP pipe failed"));
  }
  _0x1aa8fd.on("data", _0x46ef7e);
  _0x1aa8fd.on("close", _0x29226c);
  _0x1aa8fd.on("end", _0x29226c);
  _0x1aa8fd.on("error", _0x4a7335);
  _0x386188.on?.("close", _0x29226c);
  _0x386188.on?.("error", _0x4a7335);
  function _0x42a6cd(_0x12be7f, _0x61b308 = {}, _0xf204c2 = "") {
    if (_0x21b9d3) {
      return Promise.reject(new Error("Chrome CDP pipe is closed"));
    }
    const _0x15a421 = ++_0x18e68d;
    const _0x26b049 = {
      id: _0x15a421,
      method: String(_0x12be7f || ""),
      params: _0x61b308 && typeof _0x61b308 === "object" ? _0x61b308 : {},
      ...(_0xf204c2 ? {
        sessionId: String(_0xf204c2)
      } : {})
    };
    if (!_0x26b049.method) {
      return Promise.reject(new Error("Chrome CDP method is required"));
    }
    return new Promise((_0x28f55e, _0x73fa5b) => {
      const _0x4cb9a7 = Math.max(0, Number(commandTimeoutMs) || 0);
      const _0x589b73 = _0x4cb9a7 > 0 ? setTimeoutFn(() => {
        _0x4fdf77(_0x15a421, _0x4481ee => {
          _0x4481ee.reject(new Error("Chrome CDP command timed out: " + _0x26b049.method));
        });
      }, _0x4cb9a7) : null;
      _0x5702ec.set(_0x15a421, {
        resolve: _0x28f55e,
        reject: _0x73fa5b,
        timer: _0x589b73,
        method: _0x26b049.method
      });
      try {
        _0x386188.write(JSON.stringify(_0x26b049) + "\0", "utf8");
      } catch (_0x15393a) {
        _0x4fdf77(_0x15a421, _0x2b9e06 => _0x2b9e06.reject(_0x15393a));
      }
    });
  }
  return {
    send: _0x42a6cd,
    onEvent(_0x5ad04c) {
      if (typeof _0x5ad04c !== "function" || _0x21b9d3) {
        return () => {};
      }
      _0x2e960f.add(_0x5ad04c);
      return () => _0x2e960f.delete(_0x5ad04c);
    },
    close: _0x530b27,
    get closed() {
      return _0x21b9d3;
    }
  };
}
export const __chromeCdpPipeClientForTest = {
  createProtocolError: createProtocolError
};