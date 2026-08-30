import a274_0x57a76b from "node:path";
const RUNTIME_DIRNAME = "runtime";
const DEV_RUNTIME_DIR = a274_0x57a76b.join(".electron-runtime", "runtime");
const CERTIFI_CA_BUNDLE_RELATIVE_PATH = a274_0x57a76b.join("site-packages", "certifi", "cacert.pem");
function normalizeRoot(_0x4a840e) {
  return String(_0x4a840e || "").trim();
}
function getDirectoryEntryName(_0x208143) {
  if (typeof _0x208143 === "string") {
    return _0x208143;
  } else {
    return String(_0x208143?.name || "");
  }
}
function isDirectoryEntry(_0x5cf8f9) {
  if (typeof _0x5cf8f9?.isDirectory === "function") {
    return _0x5cf8f9.isDirectory();
  } else {
    return true;
  }
}
function collectPythonLibCaBundleCandidates({
  pythonRoot: _0x46fb46,
  readdirSync: _0x36338b
}) {
  const _0x28b483 = a274_0x57a76b.join(_0x46fb46, "lib");
  let _0xfd9073 = [];
  try {
    _0xfd9073 = _0x36338b(_0x28b483, {
      withFileTypes: true
    });
  } catch {
    return [];
  }
  return _0xfd9073.filter(_0x2bd950 => isDirectoryEntry(_0x2bd950)).map(_0x2f253a => getDirectoryEntryName(_0x2f253a)).filter(_0x555b5b => /^python\d+(?:\.\d+)*$/i.test(_0x555b5b)).map(_0x12a715 => a274_0x57a76b.join(_0x28b483, _0x12a715, CERTIFI_CA_BUNDLE_RELATIVE_PATH));
}
export function resolveRuntimeRoot({
  appIsPackaged = false,
  appRoot = "",
  resourcesPath = ""
} = {}) {
  const _0x91efd9 = normalizeRoot(appIsPackaged ? resourcesPath : appRoot);
  if (!_0x91efd9) {
    return "";
  }
  if (appIsPackaged) {
    return a274_0x57a76b.join(_0x91efd9, RUNTIME_DIRNAME);
  } else {
    return a274_0x57a76b.join(_0x91efd9, DEV_RUNTIME_DIR);
  }
}
export function resolveRuntimeToolPath({
  name: _0x144158,
  runtimeRoot: _0x4056e5,
  platform = process.platform,
  existsSync = () => false
} = {}) {
  const _0x6e3229 = String(_0x144158 || "").trim();
  const _0x4746d8 = normalizeRoot(_0x4056e5);
  if (!_0x6e3229 || !_0x4746d8) {
    return "";
  }
  const _0x7fa03f = platform === "win32" && !_0x6e3229.toLowerCase().endsWith(".exe") ? _0x6e3229 + ".exe" : _0x6e3229;
  const _0x1b22b7 = a274_0x57a76b.join(_0x4746d8, "ffmpeg", "bin", _0x7fa03f);
  if (existsSync(_0x1b22b7)) {
    return _0x1b22b7;
  } else {
    return "";
  }
}
export function resolveRuntimeDreaminaCliPath({
  runtimeRoot: _0x58cefe,
  platform = process.platform,
  existsSync = () => false
} = {}) {
  const _0x12bb3c = normalizeRoot(_0x58cefe);
  if (!_0x12bb3c) {
    return "";
  }
  const _0x56601b = platform === "win32" ? "dreamina.exe" : "dreamina";
  const _0x5ebceb = a274_0x57a76b.join(_0x12bb3c, "dreamina", _0x56601b);
  if (existsSync(_0x5ebceb)) {
    return _0x5ebceb;
  } else {
    return "";
  }
}
export function resolveRuntimePythonCaBundlePath({
  runtimeRoot: _0xf7edba,
  existsSync = () => false,
  readdirSync = () => []
} = {}) {
  const _0x58034a = normalizeRoot(_0xf7edba);
  if (!_0x58034a) {
    return "";
  }
  const _0x23aa56 = a274_0x57a76b.join(_0x58034a, "python");
  const _0x5b8d68 = [a274_0x57a76b.join(_0x58034a, "backend", "certifi", "cacert.pem"), a274_0x57a76b.join(_0x23aa56, "Lib", CERTIFI_CA_BUNDLE_RELATIVE_PATH), ...collectPythonLibCaBundleCandidates({
    pythonRoot: _0x23aa56,
    readdirSync: readdirSync
  })];
  return _0x5b8d68.find(_0x406d0d => existsSync(_0x406d0d)) || "";
}
export function buildRuntimePythonCertificateEnv({
  runtimeRoot: _0x5f1c24,
  existsSync = () => false,
  readdirSync = () => [],
  env = {}
} = {}) {
  const _0x124a6c = [env.REQUESTS_CA_BUNDLE, env.SSL_CERT_FILE].map(_0x41cb6f => normalizeRoot(_0x41cb6f)).find(_0x5e5319 => _0x5e5319 && existsSync(_0x5e5319));
  const _0x170dc6 = _0x124a6c || resolveRuntimePythonCaBundlePath({
    runtimeRoot: _0x5f1c24,
    existsSync: existsSync,
    readdirSync: readdirSync
  });
  if (!_0x170dc6) {
    return {};
  }
  return {
    SSL_CERT_FILE: _0x170dc6,
    REQUESTS_CA_BUNDLE: _0x170dc6
  };
}
export function buildRuntimeToolEnv({
  runtimeRoot: _0x4c4d1f,
  platform = process.platform,
  existsSync = () => false
} = {}) {
  return {
    AIC_FFMPEG_EXE: resolveRuntimeToolPath({
      name: "ffmpeg",
      runtimeRoot: _0x4c4d1f,
      platform: platform,
      existsSync: existsSync
    }),
    AIC_FFPROBE_EXE: resolveRuntimeToolPath({
      name: "ffprobe",
      runtimeRoot: _0x4c4d1f,
      platform: platform,
      existsSync: existsSync
    }),
    AIC_DREAMINA_CLI_EXE: resolveRuntimeDreaminaCliPath({
      runtimeRoot: _0x4c4d1f,
      platform: platform,
      existsSync: existsSync
    })
  };
}