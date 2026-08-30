import a268_0x18557f from "node:path";
export function resolvePreferredRuntimePythonCommand({
  existsSync: _0x194793,
  fallbackCommand = "",
  platform = process.platform,
  runtimeRoot = ""
} = {}) {
  const _0x437064 = platform === "win32" ? [a268_0x18557f.join(runtimeRoot, "python", "python.exe"), a268_0x18557f.join(runtimeRoot, "python", "Scripts", "python.exe"), fallbackCommand] : [a268_0x18557f.join(runtimeRoot, "python", "bin", "python3"), a268_0x18557f.join(runtimeRoot, "python", "bin", "python"), fallbackCommand];
  return _0x437064.find(_0x35654e => a268_0x18557f.isAbsolute(_0x35654e) ? _0x194793(_0x35654e) : true);
}
const ASR_RUNTIME_DIRNAME = "asr";
const RUNTIME_DIRNAME = "runtime";
const CURRENT_STATE_FILENAME = "current.json";
function normalizeRoot(_0x4ba3dd) {
  return String(_0x4ba3dd || "").trim();
}
function isSameOrInsidePath(_0x5d3766, _0x33cdc1) {
  const _0x4c409d = a268_0x18557f.resolve(_0x5d3766);
  const _0xa5577f = a268_0x18557f.resolve(_0x33cdc1);
  const _0x55100f = a268_0x18557f.relative(_0xa5577f, _0x4c409d);
  return _0x55100f === "" || !!_0x55100f && !_0x55100f.startsWith("..") && !a268_0x18557f.isAbsolute(_0x55100f);
}
export function resolveAsrRuntimeBaseDir(_0x274297 = "") {
  const _0x3f4118 = normalizeRoot(_0x274297);
  if (_0x3f4118) {
    return a268_0x18557f.join(_0x3f4118, RUNTIME_DIRNAME, ASR_RUNTIME_DIRNAME);
  } else {
    return "";
  }
}
export function resolveAsrRuntimeStatePath(_0x4238d2 = "") {
  const _0x1d2f24 = resolveAsrRuntimeBaseDir(_0x4238d2);
  if (_0x1d2f24) {
    return a268_0x18557f.join(_0x1d2f24, CURRENT_STATE_FILENAME);
  } else {
    return "";
  }
}
export function normalizeAsrRuntimeVersion(_0x4636f2 = "") {
  const _0xe53662 = String(_0x4636f2 || "").trim();
  return _0xe53662.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "unknown";
}
export function resolveAsrRuntimeInstallDir({
  userDataRoot = "",
  version = ""
} = {}) {
  const _0x3bd417 = resolveAsrRuntimeBaseDir(userDataRoot);
  if (!_0x3bd417) {
    return "";
  }
  return a268_0x18557f.join(_0x3bd417, "versions", normalizeAsrRuntimeVersion(version));
}
export function readInstalledAsrRuntimeState({
  userDataRoot = "",
  existsSync = () => false,
  readFileSync = () => ""
} = {}) {
  const _0x38a6f1 = resolveAsrRuntimeStatePath(userDataRoot);
  if (!_0x38a6f1 || !existsSync(_0x38a6f1)) {
    return null;
  }
  try {
    const _0x10cf47 = JSON.parse(String(readFileSync(_0x38a6f1, "utf8") || "{}"));
    const _0xee88f = normalizeRoot(_0x10cf47?.runtimeRoot);
    const _0x5e2bc2 = resolveAsrRuntimeBaseDir(userDataRoot);
    if (!_0x5e2bc2 || !isSameOrInsidePath(_0xee88f, _0x5e2bc2)) {
      return null;
    }
    if (!_0xee88f || !existsSync(_0xee88f)) {
      return null;
    }
    return {
      version: String(_0x10cf47?.version || ""),
      runtimeRoot: _0xee88f,
      platform: String(_0x10cf47?.platform || ""),
      arch: String(_0x10cf47?.arch || ""),
      installedAt: Number(_0x10cf47?.installedAt || 0) || 0
    };
  } catch {
    return null;
  }
}
export function resolveAsrRuntimePythonCommand({
  userDataRoot = "",
  existsSync = () => false,
  readFileSync = () => "",
  fallbackCommand = "",
  platform = process.platform
} = {}) {
  const _0x8246d1 = readInstalledAsrRuntimeState({
    userDataRoot: userDataRoot,
    existsSync: existsSync,
    readFileSync: readFileSync
  });
  if (!_0x8246d1?.runtimeRoot) {
    return fallbackCommand;
  }
  return resolvePreferredRuntimePythonCommand({
    existsSync: existsSync,
    fallbackCommand: fallbackCommand,
    platform: platform,
    runtimeRoot: _0x8246d1.runtimeRoot
  });
}