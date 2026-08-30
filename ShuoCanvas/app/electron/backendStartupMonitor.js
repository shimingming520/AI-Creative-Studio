function createBackendStartupError(_0xc4476a, _0x356c7d, {
  cause = null,
  details = null
} = {}) {
  const _0x15369b = new Error(_0xc4476a);
  _0x15369b.code = _0x356c7d;
  if (cause) {
    _0x15369b.cause = cause;
  }
  if (details) {
    _0x15369b.details = details;
  }
  return _0x15369b;
}
function safeNotify(_0x25f8f6, ..._0x146fe3) {
  try {
    _0x25f8f6?.(..._0x146fe3);
  } catch {}
}
export function createBackendStartupMonitor({
  child: _0x3478e5,
  onError = null,
  onExit = null,
  onClose = null
} = {}) {
  if (!_0x3478e5 || typeof _0x3478e5.once !== "function") {
    throw new TypeError("Backend child process is required");
  }
  let _0x1e8061 = false;
  let _0x51a6ef = false;
  let _0x5d9a9a;
  const _0x32f545 = new Promise((_0x5e97ec, _0x313c23) => {
    _0x5d9a9a = _0x313c23;
  });
  const _0x81427c = _0xf11fea => {
    if (_0x1e8061 || _0x51a6ef) {
      return false;
    }
    _0x51a6ef = true;
    _0x5d9a9a(_0xf11fea);
    return true;
  };
  _0x3478e5.once("error", _0x4d3d88 => {
    const _0xacda4d = createBackendStartupError("Failed to spawn local backend: " + (_0x4d3d88?.message || _0x4d3d88), "BACKEND_SPAWN_ERROR", {
      cause: _0x4d3d88
    });
    if (_0x81427c(_0xacda4d)) {
      safeNotify(onError, _0x4d3d88);
    }
  });
  _0x3478e5.once("exit", (_0x1229f4, _0x2998b1) => {
    safeNotify(onExit, _0x1229f4, _0x2998b1);
    _0x81427c(createBackendStartupError("Local backend exited before readiness (code=" + (_0x1229f4 ?? "") + ", signal=" + (_0x2998b1 ?? "") + ")", "BACKEND_EXITED_BEFORE_READY", {
      details: {
        exitCode: _0x1229f4,
        signal: _0x2998b1
      }
    }));
  });
  _0x3478e5.once("close", (_0x4e08c7, _0x5c41c5) => {
    safeNotify(onClose, _0x4e08c7, _0x5c41c5);
  });
  return {
    failure: _0x32f545,
    markReady() {
      _0x1e8061 = true;
    }
  };
}
export function launchMonitoredBackendProcess({
  spawnProcess: _0x41e17d,
  command: _0x5581d7,
  args = [],
  options = {},
  logStream = null,
  onSpawnError = null,
  onExit = null
} = {}) {
  if (typeof _0x41e17d !== "function") {
    throw new TypeError("Backend process launcher is required");
  }
  let _0x904d91 = false;
  let _0x24033d = false;
  const _0x4c4796 = () => {
    if (_0x904d91) {
      return;
    }
    _0x904d91 = true;
    logStream?.end?.();
  };
  const _0x2c7f76 = _0x227615 => {
    _0x24033d = true;
    safeNotify(onSpawnError, _0x227615);
    _0x4c4796();
  };
  let _0x52323e;
  try {
    _0x52323e = _0x41e17d(_0x5581d7, args, options);
  } catch (_0x210a2d) {
    _0x2c7f76(_0x210a2d);
    throw createBackendStartupError("Failed to spawn local backend: " + (_0x210a2d?.message || _0x210a2d), "BACKEND_SPAWN_ERROR", {
      cause: _0x210a2d
    });
  }
  if (logStream) {
    _0x52323e.stdout?.pipe?.(logStream, {
      end: false
    });
    _0x52323e.stderr?.pipe?.(logStream, {
      end: false
    });
  }
  const _0x21999d = createBackendStartupMonitor({
    child: _0x52323e,
    onError: _0x2c7f76,
    onExit: (_0x5b1b9f, _0x1fd346) => {
      if (!_0x24033d) {
        safeNotify(onExit, _0x5b1b9f, _0x1fd346);
      }
    },
    onClose: _0x4c4796
  });
  return {
    child: _0x52323e,
    closeLog: _0x4c4796,
    failure: _0x21999d.failure,
    markReady: _0x21999d.markReady
  };
}