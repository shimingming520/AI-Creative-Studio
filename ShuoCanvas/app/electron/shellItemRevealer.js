import { spawn } from "node:child_process";
const WINDOWS_EXPLORER_COMMAND = "explorer.exe";
const WINDOWS_EXPLORER_SPAWN_OPTIONS = Object.freeze({
  stdio: "ignore",
  windowsHide: false,
  detached: true
});
function emitDiagnostic(_0x13364d, _0x4b30fb) {
  if (typeof _0x13364d !== "function") {
    return;
  }
  try {
    _0x13364d({
      source: "main",
      ..._0x4b30fb
    });
  } catch {}
}
function ignorePromiseRejection(_0x519fc4) {
  _0x519fc4?.catch?.(() => {});
}
function launchDedicatedWindowsExplorer({
  args: _0x57db11,
  action: _0x250bef,
  spawnProcess: _0x2597c2,
  logEvent: _0x3a2021,
  fallback: _0x25dc60
}) {
  emitDiagnostic(_0x3a2021, {
    type: "shell.explorer_window_requested",
    level: "info",
    message: "Dedicated Explorer window requested",
    context: {
      action: _0x250bef,
      strategy: "new-explorer-window"
    }
  });
  let _0x1967f0;
  try {
    _0x1967f0 = _0x2597c2(WINDOWS_EXPLORER_COMMAND, _0x57db11, WINDOWS_EXPLORER_SPAWN_OPTIONS);
  } catch (_0x437abd) {
    emitDiagnostic(_0x3a2021, {
      type: "shell.explorer_window_failed",
      level: "error",
      message: "Dedicated Explorer window failed to start",
      error: _0x437abd,
      context: {
        action: _0x250bef,
        strategy: "new-explorer-window",
        phase: "spawn"
      }
    });
    return null;
  }
  if (!_0x1967f0) {
    emitDiagnostic(_0x3a2021, {
      type: "shell.explorer_window_failed",
      level: "error",
      message: "Dedicated Explorer window returned no process",
      context: {
        action: _0x250bef,
        strategy: "new-explorer-window",
        phase: "spawn"
      }
    });
    return null;
  }
  _0x1967f0.once?.("spawn", () => {
    emitDiagnostic(_0x3a2021, {
      type: "shell.explorer_window_spawned",
      level: "info",
      message: "Dedicated Explorer process started",
      context: {
        action: _0x250bef,
        strategy: "new-explorer-window"
      }
    });
  });
  _0x1967f0.once?.("error", _0x37c29d => {
    emitDiagnostic(_0x3a2021, {
      type: "shell.explorer_window_failed",
      level: "error",
      message: "Dedicated Explorer process emitted an error",
      error: _0x37c29d,
      context: {
        action: _0x250bef,
        strategy: "new-explorer-window",
        phase: "process"
      }
    });
    try {
      _0x25dc60();
    } catch {}
  });
  _0x1967f0.unref?.();
  return _0x1967f0;
}
export function revealShellItemInFolder(_0x5aa791, {
  shellApi: _0x193ef8,
  platform = process.platform,
  spawnProcess = spawn,
  logEvent: _0x19d672
} = {}) {
  if (typeof _0x193ef8?.showItemInFolder !== "function") {
    throw new TypeError("shellApi.showItemInFolder must be a function");
  }
  if (platform !== "win32") {
    _0x193ef8.showItemInFolder(_0x5aa791);
    return {
      foregroundRequested: false
    };
  }
  const _0x1609c2 = () => _0x193ef8.showItemInFolder(_0x5aa791);
  const _0x3d146e = launchDedicatedWindowsExplorer({
    args: ["/n,/select," + String(_0x5aa791 || "")],
    action: "reveal-item",
    spawnProcess: spawnProcess,
    logEvent: _0x19d672,
    fallback: _0x1609c2
  });
  if (_0x3d146e) {
    return {
      foregroundRequested: true,
      strategy: "new-explorer-window"
    };
  }
  _0x1609c2();
  return {
    foregroundRequested: false,
    strategy: "electron-shell-fallback"
  };
}
export function openShellFolder(_0x4e896e, {
  shellApi: _0x28b41d,
  platform = process.platform,
  spawnProcess = spawn,
  logEvent: _0x3722fb
} = {}) {
  if (typeof _0x28b41d?.openPath !== "function") {
    throw new TypeError("shellApi.openPath must be a function");
  }
  const _0xc9618e = () => {
    ignorePromiseRejection(_0x28b41d.openPath(_0x4e896e));
  };
  if (platform !== "win32") {
    _0xc9618e();
    return {
      foregroundRequested: false
    };
  }
  const _0x173fe4 = launchDedicatedWindowsExplorer({
    args: ["/n," + String(_0x4e896e || "")],
    action: "open-folder",
    spawnProcess: spawnProcess,
    logEvent: _0x3722fb,
    fallback: _0xc9618e
  });
  if (_0x173fe4) {
    return {
      foregroundRequested: true,
      strategy: "new-explorer-window"
    };
  }
  _0xc9618e();
  return {
    foregroundRequested: false,
    strategy: "electron-shell-fallback"
  };
}