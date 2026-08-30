import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, rm, rename, writeFile } from "node:fs/promises";
import a253_0x1c9700 from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import a253_0x3f99d5 from "extract-zip";
import { resolveAsrRuntimeBaseDir, resolveAsrRuntimeInstallDir, resolveAsrRuntimePythonCommand, resolveAsrRuntimeStatePath } from "../asrRuntimeResolver.js";
import { resolvePreferredRuntimePythonCommand } from "../pythonRuntimeResolver.js";
const ASR_RUNTIME_STAGE = Object.freeze({
  CHECK: "asr-runtime-check",
  MANIFEST: "asr-runtime-manifest",
  DOWNLOAD: "asr-runtime-download",
  EXTRACT: "asr-runtime-extract",
  VERIFY: "asr-runtime-verify"
});
function normalizeText(_0x31cc0c) {
  return String(_0x31cc0c || "").trim();
}
function normalizeUrl(_0xf2278e) {
  const _0x3e5c18 = normalizeText(_0xf2278e);
  if (!_0x3e5c18) {
    return "";
  }
  try {
    const _0x51a921 = new URL(_0x3e5c18);
    if (_0x51a921.protocol === "http:" || _0x51a921.protocol === "https:") {
      return _0x51a921.href;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function normalizePlatform(_0x283c5d = process.platform) {
  const _0x38fa96 = normalizeText(_0x283c5d).toLowerCase();
  return _0x38fa96 || process.platform;
}
function normalizeArch(_0xaeb1b6 = process.arch) {
  const _0x5b11f8 = normalizeText(_0xaeb1b6).toLowerCase();
  return _0x5b11f8 || process.arch;
}
function normalizeManifestPackage(_0x4cdf5c = {}) {
  if (!_0x4cdf5c || typeof _0x4cdf5c !== "object") {
    return null;
  }
  const _0x4a8178 = normalizeUrl(_0x4cdf5c.url);
  const _0x52f0b7 = Array.isArray(_0x4cdf5c.mirrors) ? _0x4cdf5c.mirrors.map(_0x11b244 => normalizeUrl(typeof _0x11b244 === "string" ? _0x11b244 : _0x11b244?.url)).filter(Boolean) : [];
  return {
    version: normalizeText(_0x4cdf5c.version),
    platform: normalizePlatform(_0x4cdf5c.platform),
    arch: normalizeArch(_0x4cdf5c.arch),
    url: _0x4a8178,
    mirrors: _0x52f0b7,
    sha256: normalizeText(_0x4cdf5c.sha256).toLowerCase(),
    size: Number(_0x4cdf5c.size || 0) || 0
  };
}
export function selectAsrRuntimePackage(_0x547181 = {}, {
  platform = process.platform,
  arch = process.arch
} = {}) {
  const _0x517caa = normalizePlatform(platform);
  const _0x429954 = normalizeArch(arch);
  const _0x208e33 = Array.isArray(_0x547181?.packages) ? _0x547181.packages.map(normalizeManifestPackage).filter(Boolean) : [normalizeManifestPackage(_0x547181)].filter(Boolean);
  return _0x208e33.find(_0x33a8c2 => _0x33a8c2.platform === _0x517caa && _0x33a8c2.arch === _0x429954 && (_0x33a8c2.url || _0x33a8c2.mirrors.length)) || null;
}
function getPackageDownloadUrl(_0x2c5d0f = {}) {
  return normalizeUrl(_0x2c5d0f.url) || _0x2c5d0f.mirrors?.find(Boolean) || "";
}
async function hashFileSha256(_0x21e520) {
  const _0x959723 = createHash("sha256");
  for await (const _0x4a43a1 of createReadStream(_0x21e520)) {
    _0x959723.update(_0x4a43a1);
  }
  return _0x959723.digest("hex");
}
async function downloadToFile({
  fetchImpl = fetch,
  queue: _0x2ea570,
  task: _0x4bbe41,
  targetPath: _0x1c801a,
  url: _0x303675
} = {}) {
  const _0x401b2b = await fetchImpl(_0x303675);
  if (!_0x401b2b?.ok) {
    throw new Error("ASR runtime download failed: HTTP " + (_0x401b2b?.status || "unknown"));
  }
  const _0x46225f = Number(_0x401b2b.headers?.get?.("content-length") || 0) || 0;
  let _0x5c6b4c = 0;
  const _0x45765b = _0x401b2b.body?.getReader ? Readable.fromWeb(_0x401b2b.body) : _0x401b2b.body;
  if (!_0x45765b) {
    throw new Error("ASR runtime download response is empty");
  }
  await mkdir(a253_0x1c9700.dirname(_0x1c801a), {
    recursive: true
  });
  await pipeline(_0x45765b, async function* (_0x5b35b6) {
    for await (const _0x277cbd of _0x5b35b6) {
      _0x5c6b4c += Buffer.byteLength(_0x277cbd);
      if (_0x46225f > 0) {
        const _0x1d6451 = Math.max(0, Math.min(1, _0x5c6b4c / _0x46225f));
        _0x2ea570?.emitProgress?.(_0x4bbe41, 0.18 + _0x1d6451 * 0.42, "Downloading subtitle component " + Math.round(_0x1d6451 * 100) + "%", {
          stage: ASR_RUNTIME_STAGE.DOWNLOAD
        });
      }
      yield _0x277cbd;
    }
  }, createWriteStream(_0x1c801a));
}
async function readManifest({
  fetchImpl = fetch,
  manifestUrl = ""
} = {}) {
  const _0x14b60b = normalizeUrl(manifestUrl);
  if (!_0x14b60b) {
    throw new Error("ASR runtime manifest URL is not configured");
  }
  const _0x2486a8 = await fetchImpl(_0x14b60b);
  if (!_0x2486a8?.ok) {
    throw new Error("ASR runtime manifest request failed: HTTP " + (_0x2486a8?.status || "unknown"));
  }
  return await _0x2486a8.json();
}
function resolvePythonInExtractedRuntime(_0x5825e5, _0x559030 = process.platform) {
  return resolvePreferredRuntimePythonCommand({
    existsSync: existsSync,
    fallbackCommand: "",
    platform: _0x559030,
    runtimeRoot: _0x5825e5
  });
}
async function resolveExtractedRuntimeRoot(_0x48069b, _0x3900da = process.platform) {
  if (resolvePythonInExtractedRuntime(_0x48069b, _0x3900da)) {
    return _0x48069b;
  }
  const _0x5b266c = await readdir(_0x48069b, {
    withFileTypes: true
  });
  const _0x573f26 = _0x5b266c.filter(_0x542ece => _0x542ece.isDirectory()).map(_0x30a757 => a253_0x1c9700.join(_0x48069b, _0x30a757.name));
  if (_0x573f26.length === 1 && resolvePythonInExtractedRuntime(_0x573f26[0], _0x3900da)) {
    return _0x573f26[0];
  }
  throw new Error("ASR runtime archive must contain a python runtime directory");
}
async function writeCurrentRuntimeState({
  arch: _0x32a4cf,
  manifestUrl: _0x5a8dc3,
  platform: _0x24d358,
  runtimeRoot: _0x214eec,
  sha256: _0x2dc4f0,
  statePath: _0x149e46,
  version: _0x3370fe
}) {
  await mkdir(a253_0x1c9700.dirname(_0x149e46), {
    recursive: true
  });
  await writeFile(_0x149e46, JSON.stringify({
    version: _0x3370fe,
    runtimeRoot: _0x214eec,
    platform: _0x24d358,
    arch: _0x32a4cf,
    sha256: _0x2dc4f0,
    manifestUrl: _0x5a8dc3,
    installedAt: Date.now()
  }, null, 2) + "\n", "utf8");
}
async function runAsrRuntimeSmoke({
  appRoot: _0x4ca0c6,
  pythonCommand: _0x48629f,
  queue: _0x2591c5,
  task: _0x1c0063
} = {}) {
  if (!_0x48629f) {
    throw new Error("ASR Python runtime is unavailable");
  }
  await _0x2591c5.runProcess(_0x1c0063, _0x48629f, ["-c", ["import torch", "import torchaudio", "import funasr", "import modelscope", "from nemo.collections.asr.models import SortformerEncLabelModel", "print('asr runtime smoke ok')"].join("; ")], {
    cwd: _0x4ca0c6,
    progressMessage: "Verifying subtitle component"
  });
}
export function createAsrRuntimeInstallMediaTaskHandler({
  appRoot = process.cwd(),
  fetchImpl = fetch,
  getAsrRuntimeManifestUrl = () => "",
  getUserDataRoot = () => "",
  resolveFallbackPythonCommand = () => "",
  platform = process.platform,
  arch = process.arch
} = {}) {
  return async (_0x3f7295, _0x108764) => {
    const _0x1d786c = normalizeText(getUserDataRoot?.());
    if (!_0x1d786c) {
      throw new Error("User data directory is unavailable");
    }
    _0x108764.emitProgress(_0x3f7295, 0.03, "Checking subtitle component", {
      stage: ASR_RUNTIME_STAGE.CHECK
    });
    const _0x1a8e91 = resolveAsrRuntimePythonCommand({
      userDataRoot: _0x1d786c,
      existsSync: existsSync,
      readFileSync: readFileSync,
      fallbackCommand: "",
      platform: platform
    });
    if (_0x1a8e91) {
      try {
        await runAsrRuntimeSmoke({
          appRoot: appRoot,
          pythonCommand: _0x1a8e91,
          queue: _0x108764,
          task: _0x3f7295
        });
        return {
          success: true,
          available: true,
          source: "installed",
          pythonCommand: _0x1a8e91
        };
      } catch {}
    }
    const _0x3ca0c5 = normalizeText(resolveFallbackPythonCommand?.());
    if (_0x3ca0c5 && existsSync(_0x3ca0c5)) {
      try {
        await runAsrRuntimeSmoke({
          appRoot: appRoot,
          pythonCommand: _0x3ca0c5,
          queue: _0x108764,
          task: _0x3f7295
        });
        return {
          success: true,
          available: true,
          source: "bundled",
          pythonCommand: _0x3ca0c5
        };
      } catch {}
    }
    _0x108764.emitProgress(_0x3f7295, 0.1, "Loading subtitle component manifest", {
      stage: ASR_RUNTIME_STAGE.MANIFEST
    });
    const _0x4ceca9 = normalizeUrl(_0x3f7295?.payload?.args?.manifestUrl) || normalizeUrl(getAsrRuntimeManifestUrl?.());
    const _0x46c34e = await readManifest({
      fetchImpl: fetchImpl,
      manifestUrl: _0x4ceca9
    });
    const _0x1e1b21 = selectAsrRuntimePackage(_0x46c34e, {
      platform: platform,
      arch: arch
    });
    if (!_0x1e1b21) {
      throw new Error("No ASR runtime package for " + platform + "-" + arch);
    }
    const _0x5f5eb = getPackageDownloadUrl(_0x1e1b21);
    const _0x19a3aa = _0x1e1b21.version || normalizeText(_0x46c34e?.version) || "unknown";
    const _0x4ee228 = resolveAsrRuntimeBaseDir(_0x1d786c);
    const _0x135764 = resolveAsrRuntimeInstallDir({
      userDataRoot: _0x1d786c,
      version: _0x19a3aa
    });
    const _0xc696a = a253_0x1c9700.join(_0x4ee228, "_tmp", _0x3f7295.id);
    const _0x33134e = a253_0x1c9700.join(_0xc696a, "asr-runtime.zip");
    const _0x5781e4 = a253_0x1c9700.join(_0xc696a, "extract");
    await rm(_0xc696a, {
      recursive: true,
      force: true
    });
    await mkdir(_0x5781e4, {
      recursive: true
    });
    await downloadToFile({
      fetchImpl: fetchImpl,
      queue: _0x108764,
      task: _0x3f7295,
      targetPath: _0x33134e,
      url: _0x5f5eb
    });
    if (_0x1e1b21.sha256) {
      const _0x51add9 = await hashFileSha256(_0x33134e);
      if (_0x51add9.toLowerCase() !== _0x1e1b21.sha256) {
        throw new Error("ASR runtime checksum verification failed");
      }
    }
    _0x108764.emitProgress(_0x3f7295, 0.68, "Extracting subtitle component", {
      stage: ASR_RUNTIME_STAGE.EXTRACT
    });
    await a253_0x3f99d5(_0x33134e, {
      dir: _0x5781e4
    });
    const _0x4e861f = await resolveExtractedRuntimeRoot(_0x5781e4, platform);
    await rm(_0x135764, {
      recursive: true,
      force: true
    });
    await mkdir(a253_0x1c9700.dirname(_0x135764), {
      recursive: true
    });
    await rename(_0x4e861f, _0x135764);
    const _0x18e1c6 = resolvePreferredRuntimePythonCommand({
      existsSync: existsSync,
      fallbackCommand: "",
      platform: platform,
      runtimeRoot: _0x135764
    });
    _0x108764.emitProgress(_0x3f7295, 0.84, "Verifying subtitle component", {
      stage: ASR_RUNTIME_STAGE.VERIFY
    });
    await runAsrRuntimeSmoke({
      appRoot: appRoot,
      pythonCommand: _0x18e1c6,
      queue: _0x108764,
      task: _0x3f7295
    });
    await writeCurrentRuntimeState({
      arch: arch,
      manifestUrl: _0x4ceca9,
      platform: platform,
      runtimeRoot: _0x135764,
      sha256: _0x1e1b21.sha256,
      statePath: resolveAsrRuntimeStatePath(_0x1d786c),
      version: _0x19a3aa
    });
    await rm(_0xc696a, {
      recursive: true,
      force: true
    });
    return {
      success: true,
      available: true,
      source: "downloaded",
      version: _0x19a3aa,
      runtimeRoot: _0x135764
    };
  };
}