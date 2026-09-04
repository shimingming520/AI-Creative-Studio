const DEFAULT_TIMEOUT = 30000;
export function getApiBase() {
  try {
    if (typeof location !== "undefined" && location.protocol === "file:") {
      return "http://127.0.0.1:8777";
    }
  } catch {}
  return "";
}
export function buildApiUrl(_0x46f5bd) {
  const _0x1ee44f = getApiBase();
  const _0x53938c = String(_0x46f5bd || "");
  if (!_0x53938c) {
    return _0x1ee44f || "";
  }
  if (!_0x53938c.startsWith("/")) {
    return _0x1ee44f + "/" + _0x53938c;
  }
  return "" + _0x1ee44f + _0x53938c;
}
export function fetchWithTimeout(_0x2457ab, _0x41648e = {}, _0x4dafe3 = DEFAULT_TIMEOUT) {
  if (_0x4dafe3 === null) {
    return fetch(_0x2457ab, _0x41648e);
  }
  const _0x473fa9 = new AbortController();
  const _0x5ac0a7 = setTimeout(() => _0x473fa9.abort(), _0x4dafe3);
  return fetch(_0x2457ab, {
    ..._0x41648e,
    signal: _0x473fa9.signal
  }).finally(() => clearTimeout(_0x5ac0a7));
}
export function fetchWithTimeoutWithSignal(_0x238eff, _0x17184a = {}, _0x478695 = DEFAULT_TIMEOUT, _0x520247) {
  if (_0x478695 === null) {
    return fetch(_0x238eff, {
      ..._0x17184a,
      signal: _0x520247
    });
  }
  const _0x3152a7 = new AbortController();
  const _0x2a33b8 = setTimeout(() => _0x3152a7.abort(), _0x478695);
  let _0x1c4818 = null;
  if (_0x520247) {
    if (_0x520247.aborted) {
      _0x3152a7.abort();
    } else {
      _0x1c4818 = () => _0x3152a7.abort();
      _0x520247.addEventListener("abort", _0x1c4818, {
        once: true
      });
    }
  }
  return fetch(_0x238eff, {
    ..._0x17184a,
    signal: _0x3152a7.signal
  }).finally(() => {
    clearTimeout(_0x2a33b8);
    if (_0x520247 && _0x1c4818) {
      _0x520247.removeEventListener("abort", _0x1c4818);
    }
  });
}
function stringifyErrorBodyValue(_0x4c1c23) {
  if (_0x4c1c23 === undefined || _0x4c1c23 === null) {
    return "";
  }
  if (typeof _0x4c1c23 === "string") {
    return _0x4c1c23;
  }
  if (typeof _0x4c1c23 === "number" || typeof _0x4c1c23 === "boolean") {
    return String(_0x4c1c23);
  }
  if (_0x4c1c23 && typeof _0x4c1c23 === "object") {
    const _0xe0a0c4 = _0x4c1c23.message || _0x4c1c23.errorMessage || _0x4c1c23.error_message || _0x4c1c23.reason || _0x4c1c23.detail || _0x4c1c23.details || _0x4c1c23.msg;
    if (_0xe0a0c4 !== undefined && _0xe0a0c4 !== null && _0xe0a0c4 !== _0x4c1c23) {
      const _0x5d69ff = stringifyErrorBodyValue(_0xe0a0c4);
      if (_0x5d69ff) {
        return _0x5d69ff;
      }
    }
    try {
      return JSON.stringify(_0x4c1c23);
    } catch {
      return "";
    }
  }
  return String(_0x4c1c23 || "");
}
async function parseErrorBody(_0x489617) {
  let _0x2323fe = "";
  try {
    _0x2323fe = await _0x489617.text();
    const _0x2f4ce0 = JSON.parse(_0x2323fe);
    return stringifyErrorBodyValue(_0x2f4ce0.error?.message || _0x2f4ce0.error || _0x2f4ce0.message || _0x2f4ce0.data?.error || _0x2f4ce0.data?.message || _0x2323fe);
  } catch {
    return _0x2323fe || "HTTP " + _0x489617.status;
  }
}
function collectResponseHeaders(_0x3e53a2) {
  const _0x2f3498 = _0x3e53a2?.headers;
  if (!_0x2f3498 || typeof _0x2f3498.entries !== "function") {
    return {};
  }
  const _0x4a8c09 = {};
  for (const [_0x6a443d, _0x1a21e1] of _0x2f3498.entries()) {
    const _0x231cdd = String(_0x6a443d || "").trim().toLowerCase();
    if (!_0x231cdd) {
      continue;
    }
    _0x4a8c09[_0x231cdd] = String(_0x1a21e1 || "");
  }
  return _0x4a8c09;
}
function attachResponseHeaders(_0x3a37e3, _0x125971 = {}) {
  if (Object.keys(_0x125971).length) {
    return {
      ..._0x3a37e3,
      headers: _0x125971
    };
  } else {
    return _0x3a37e3;
  }
}
export async function request(_0x507cdd, _0xae77f0 = {}, _0x5e7b3e = DEFAULT_TIMEOUT) {
  const _0x1e7b6f = _0x507cdd.startsWith("http") ? _0x507cdd : buildApiUrl(_0x507cdd);
  try {
    const _0xf1c003 = await fetchWithTimeout(_0x1e7b6f, _0xae77f0, _0x5e7b3e);
    const _0x4addd0 = collectResponseHeaders(_0xf1c003);
    if (_0xf1c003.status === 404) {
      return attachResponseHeaders({
        success: true,
        data: null,
        status: 404
      }, _0x4addd0);
    }
    if (!_0xf1c003.ok) {
      const _0x155bf2 = await parseErrorBody(_0xf1c003);
      return attachResponseHeaders({
        success: false,
        error: "请求失败: HTTP " + _0xf1c003.status + (_0x155bf2 ? " — " + _0x155bf2 : ""),
        status: _0xf1c003.status
      }, _0x4addd0);
    }
    const _0x147ce7 = _0xf1c003.headers.get("content-type") || "";
    let _0x4be065;
    if (_0x147ce7.includes("application/json")) {
      _0x4be065 = await _0xf1c003.json();
    } else {
      const _0x31f76a = await _0xf1c003.text();
      try {
        _0x4be065 = JSON.parse(_0x31f76a);
      } catch {
        _0x4be065 = _0x31f76a;
      }
    }
    return attachResponseHeaders({
      success: true,
      data: _0x4be065,
      status: _0xf1c003.status
    }, _0x4addd0);
  } catch (_0x36ef3c) {
    if (_0x36ef3c.name === "AbortError") {
      return {
        success: false,
        error: "请求超时，请检查网络连接或服务器状态",
        status: 0
      };
    }
    if (_0x36ef3c.message?.includes("Failed to fetch")) {
      return {
        success: false,
        error: "网络请求失败。请检查：\n1. 网络连接是否正常\n2. 本地 Python 服务器(server.py)是否已启动\n3. 浏览器是否可以访问 http://localhost:8777\n4. 是否有防火墙拦截了 8777 端口",
        status: 0
      };
    }
    return {
      success: false,
      error: _0x36ef3c.message || "未知网络错误",
      status: 0
    };
  }
}
export function get(_0x1dab87, _0x34b14) {
  return request(_0x1dab87, {
    method: "GET"
  }, _0x34b14);
}
export function post(_0x38303e, _0x43d446, _0x2f931e) {
  const _0x53cbd2 = {
    method: "POST",
    headers: {}
  };
  if (_0x43d446 !== undefined) {
    if (_0x43d446 instanceof FormData || _0x43d446 instanceof Blob || _0x43d446 instanceof ArrayBuffer) {
      _0x53cbd2.body = _0x43d446;
    } else if (typeof _0x43d446 === "object") {
      _0x53cbd2.headers["Content-Type"] = "application/json";
      _0x53cbd2.body = JSON.stringify(_0x43d446);
    } else {
      _0x53cbd2.body = _0x43d446;
    }
  }
  return request(_0x38303e, _0x53cbd2, _0x2f931e);
}
export function del(_0x1d8175, _0x29e28a) {
  return request(_0x1d8175, {
    method: "DELETE"
  }, _0x29e28a);
}