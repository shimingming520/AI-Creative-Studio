import a201_0x350baf from "node:path";
export function resolveNativeBackendExecutable({
  runtimeRoot: _0x1f9883,
  platform = process.platform
}) {
  const _0x417edd = platform === "win32" ? "aicanvas-backend.exe" : "aicanvas-backend";
  return a201_0x350baf.join(_0x1f9883, "backend", _0x417edd);
}
export function resolveBackendLaunchSpec({
  appIsPackaged: _0x13a73b,
  appRoot: _0x16c48b,
  runtimeRoot: _0x1af351,
  platform = process.platform,
  existsSync: _0x2adde6,
  pythonCommand: _0x2bb871
}) {
  const sourceEntryPath = a201_0x350baf.join(_0x16c48b, "server.py");
  const nativeBackendPath = resolveNativeBackendExecutable({
    runtimeRoot: _0x1af351,
    platform: platform
  });
  if (!_0x13a73b) {
    if (_0x2adde6(sourceEntryPath)) {
      return {
        kind: "python-source",
        command: _0x2bb871,
        args: ["server.py"],
        cwd: _0x16c48b
      };
    }
    if (_0x2adde6(nativeBackendPath)) {
      return {
        kind: "native-backend-dev-fallback",
        command: nativeBackendPath,
        args: [],
        cwd: _0x16c48b
      };
    }
    throw new Error("Development backend is missing. Provide app/server.py or run tools\\prepare-local-runtime.ps1 to copy the runtime into app/.electron-runtime/runtime.");
  }
  if (!_0x2adde6(nativeBackendPath)) {
    throw new Error("Packaged backend executable is missing: " + nativeBackendPath + ". Rebuild the native backend before packaging.");
  }
  return {
    kind: "native-backend",
    command: nativeBackendPath,
    args: [],
    cwd: _0x16c48b
  };
}
