import { createReadStream, createWriteStream, existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, statSync } from "node:fs";
import a263_0x2ce88d from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import a263_0x430465 from "yazl";
export const NODE_EXPORT_FILE_EXTENSION = ".zip";
export const NODE_EXPORT_MANIFEST_NAME = "manifest.json";
export const NODE_EXPORT_PACKAGE_KIND = "aiCanvas.nodeExport";
export const NODE_EXPORT_SCHEMA_VERSION = 1;
const KIND_DIR = Object.freeze({
  text: "Text",
  image: "image",
  video: "video",
  audio: "audio"
});
const KIND_DEFAULT_EXT = Object.freeze({
  text: "txt",
  image: "png",
  video: "mp4",
  audio: "mp3"
});
const MEDIA_KINDS = new Set(["image", "video", "audio"]);
const RESERVED_WINDOWS_NAMES = new Set(["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"]);
function trimText(_0xc0e433) {
  return String(_0xc0e433 || "").trim();
}
function pad2(_0x2d7876) {
  return String(_0x2d7876).padStart(2, "0");
}
export function defaultNodeExportZipName(_0x2047ac = new Date()) {
  const _0x5752df = _0x2047ac instanceof Date ? _0x2047ac : new Date(_0x2047ac);
  const _0x3cfd1e = [_0x5752df.getFullYear(), pad2(_0x5752df.getMonth() + 1), pad2(_0x5752df.getDate()), "-", pad2(_0x5752df.getHours()), pad2(_0x5752df.getMinutes()), pad2(_0x5752df.getSeconds())].join("");
  return "AI-CanvasPro-Export-" + _0x3cfd1e + NODE_EXPORT_FILE_EXTENSION;
}
export function withNodeExportZipExtension(_0x3c3289) {
  const _0x5804e3 = trimText(_0x3c3289);
  if (!_0x5804e3) {
    return _0x5804e3;
  }
  if (a263_0x2ce88d.extname(_0x5804e3).toLowerCase() === NODE_EXPORT_FILE_EXTENSION) {
    return _0x5804e3;
  } else {
    return "" + _0x5804e3 + NODE_EXPORT_FILE_EXTENSION;
  }
}
function sanitizeArchiveBaseName(_0x1e738e, _0x3661f0) {
  let _0x13409b = trimText(_0x1e738e).replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").replace(/\s+/g, " ").replace(/[. ]+$/g, "").slice(0, 120).trim();
  if (!_0x13409b) {
    _0x13409b = _0x3661f0;
  }
  if (RESERVED_WINDOWS_NAMES.has(_0x13409b.toUpperCase())) {
    _0x13409b = _0x13409b + "_";
  }
  return _0x13409b || "file";
}
function safeDecode(_0x269acb) {
  try {
    return decodeURIComponent(_0x269acb);
  } catch {
    return _0x269acb;
  }
}
function basenameFromUrl(_0x2a18ef) {
  const _0x18b291 = trimText(_0x2a18ef);
  if (!_0x18b291) {
    return "";
  }
  try {
    const _0x17c810 = new URL(_0x18b291);
    return safeDecode(_0x17c810.pathname.split("/").filter(Boolean).pop() || "");
  } catch {
    return safeDecode(_0x18b291.split(/[?#]/, 1)[0].replace(/\\/g, "/").split("/").pop() || "");
  }
}
function extensionFromValue(_0x3fc79a) {
  const _0xfc38c0 = basenameFromUrl(_0x3fc79a);
  const _0x31b3ba = _0xfc38c0.match(/\.([a-z0-9]{1,8})$/i);
  return String(_0x31b3ba?.[1] || "").toLowerCase();
}
function getItemExtension(_0x21d583) {
  const _0x576b70 = normalizeKind(_0x21d583?.kind);
  if (_0x576b70 === "text") {
    return "txt";
  }
  return extensionFromValue(_0x21d583?.localPath) || extensionFromValue(_0x21d583?.url) || extensionFromValue(_0x21d583?.filenameHint) || KIND_DEFAULT_EXT[_0x576b70] || "bin";
}
function normalizeKind(_0x4947b7) {
  const _0xf5573a = trimText(_0x4947b7).toLowerCase();
  if (Object.prototype.hasOwnProperty.call(KIND_DIR, _0xf5573a)) {
    return _0xf5573a;
  } else {
    return "";
  }
}
function allocateArchivePath(_0x4dc1cd, _0x49c12d) {
  const _0x4402f8 = normalizeKind(_0x4dc1cd?.kind);
  const _0x5260c8 = KIND_DIR[_0x4402f8];
  const _0x152e78 = _0x4402f8 || "file";
  const _0x375895 = sanitizeArchiveBaseName(_0x4dc1cd?.nodeName, _0x152e78);
  const _0x4ba359 = getItemExtension(_0x4dc1cd);
  for (let _0x54f008 = 1; _0x54f008 < 1000; _0x54f008 += 1) {
    const _0x32d343 = _0x54f008 === 1 ? "" : " (" + _0x54f008 + ")";
    const _0x3404dd = _0x5260c8 + "/" + _0x375895 + _0x32d343 + "." + _0x4ba359;
    const _0x3d9d64 = _0x3404dd.toLowerCase();
    if (_0x49c12d.has(_0x3d9d64)) {
      continue;
    }
    _0x49c12d.add(_0x3d9d64);
    return _0x3404dd;
  }
  throw new Error("Unable to allocate unique export file name");
}
function normalizeRemoteUrl(_0x1e81cf) {
  const _0x49e0ec = trimText(_0x1e81cf);
  if (!_0x49e0ec) {
    return "";
  }
  try {
    const _0x4bf6fe = new URL(_0x49e0ec);
    if (_0x4bf6fe.protocol !== "http:" && _0x4bf6fe.protocol !== "https:") {
      return "";
    }
    return _0x4bf6fe.href;
  } catch {
    return "";
  }
}
function writeZip(_0x5e5532, _0xf41921) {
  return new Promise((_0x3d0cd3, _0xf75ade) => {
    const _0x30c432 = createWriteStream(_0xf41921);
    _0x30c432.once("close", _0x3d0cd3);
    _0x30c432.once("error", _0xf75ade);
    _0x5e5532.outputStream.once("error", _0xf75ade);
    _0x5e5532.outputStream.pipe(_0x30c432);
    _0x5e5532.end();
  });
}
async function downloadRemoteToTemp({
  url: _0x34bc52,
  tempDir: _0x2fdfd7,
  fetchImpl: _0x4ca6de,
  ext: _0x35b9eb
}) {
  if (typeof _0x4ca6de !== "function") {
    throw new Error("fetch is not available in the main process");
  }
  const _0x5ee178 = await _0x4ca6de(_0x34bc52);
  if (!_0x5ee178?.ok) {
    throw new Error("HTTP " + (_0x5ee178?.status || 0));
  }
  const _0x275c60 = a263_0x2ce88d.join(_0x2fdfd7, "remote-" + Date.now() + "-" + Math.random().toString(36).slice(2) + "." + (_0x35b9eb || "bin"));
  if (_0x5ee178.body && typeof Readable.fromWeb === "function") {
    await pipeline(Readable.fromWeb(_0x5ee178.body), createWriteStream(_0x275c60));
  } else {
    const _0x2af592 = Buffer.from(await _0x5ee178.arrayBuffer());
    await pipeline(Readable.from(_0x2af592), createWriteStream(_0x275c60));
  }
  const _0x4fa598 = statSync(_0x275c60);
  if (!_0x4fa598.isFile()) {
    throw new Error("Remote download did not produce a file");
  }
  return _0x275c60;
}
export async function saveNodeMediaToFile({
  outputPath: _0x6ef643,
  item: _0x2094d2,
  resolveLocalVirtualPath: _0x565de9,
  fetchImpl = globalThis.fetch
} = {}) {
  const _0x177ab6 = normalizeKind(_0x2094d2?.kind);
  if (!MEDIA_KINDS.has(_0x177ab6)) {
    throw new Error("Only media items can be saved");
  }
  const _0x2b14d9 = trimText(_0x6ef643);
  if (!_0x2b14d9) {
    throw new Error("Save path is required");
  }
  if (!a263_0x2ce88d.isAbsolute(_0x2b14d9)) {
    throw new Error("Save path must be absolute");
  }
  const _0x337894 = a263_0x2ce88d.resolve(_0x2b14d9);
  const _0x4f7d0c = trimText(_0x2094d2?.localPath);
  let _0x4dd9d1 = "";
  let _0x54a54f = "";
  if (_0x4f7d0c) {
    if (typeof _0x565de9 !== "function") {
      throw new Error("resolveLocalVirtualPath is required");
    }
    _0x4dd9d1 = _0x565de9(_0x4f7d0c);
    if (!_0x4dd9d1) {
      throw new Error("Local media path is not allowed");
    }
    _0x4dd9d1 = a263_0x2ce88d.resolve(_0x4dd9d1);
    const _0x367b2b = statSync(_0x4dd9d1);
    if (!_0x367b2b.isFile()) {
      throw new Error("Local media path is not a file");
    }
    if (_0x4dd9d1 === _0x337894) {
      return {
        success: true,
        canceled: false,
        path: _0x337894,
        filename: a263_0x2ce88d.basename(_0x337894),
        kind: _0x177ab6
      };
    }
  } else {
    _0x54a54f = normalizeRemoteUrl(_0x2094d2?.url);
    if (!_0x54a54f) {
      throw new Error("Media source is required");
    }
    if (typeof fetchImpl !== "function") {
      throw new Error("fetch is not available in the main process");
    }
  }
  mkdirSync(a263_0x2ce88d.dirname(_0x337894), {
    recursive: true
  });
  const _0x1158f6 = a263_0x2ce88d.join(a263_0x2ce88d.dirname(_0x337894), "." + a263_0x2ce88d.basename(_0x337894) + "." + process.pid + "-" + Date.now() + "-" + Math.random().toString(36).slice(2) + ".part");
  try {
    if (_0x4dd9d1) {
      await pipeline(createReadStream(_0x4dd9d1), createWriteStream(_0x1158f6, {
        flags: "wx"
      }));
    } else {
      const _0x49168c = await fetchImpl(_0x54a54f);
      if (!_0x49168c?.ok) {
        throw new Error("HTTP " + (_0x49168c?.status || 0));
      }
      if (_0x49168c.body && typeof Readable.fromWeb === "function") {
        await pipeline(Readable.fromWeb(_0x49168c.body), createWriteStream(_0x1158f6, {
          flags: "wx"
        }));
      } else {
        const _0x16a65f = Buffer.from(await _0x49168c.arrayBuffer());
        await pipeline(Readable.from(_0x16a65f), createWriteStream(_0x1158f6, {
          flags: "wx"
        }));
      }
    }
    if (existsSync(_0x337894)) {
      rmSync(_0x337894, {
        force: true
      });
    }
    renameSync(_0x1158f6, _0x337894);
    return {
      success: true,
      canceled: false,
      path: _0x337894,
      filename: a263_0x2ce88d.basename(_0x337894),
      kind: _0x177ab6
    };
  } finally {
    if (existsSync(_0x1158f6)) {
      rmSync(_0x1158f6, {
        force: true
      });
    }
  }
}
function createSkipped(_0x1ccec2, _0x3588c2, _0x175f5e = "") {
  return {
    nodeId: trimText(_0x1ccec2?.nodeId),
    nodeName: trimText(_0x1ccec2?.nodeName),
    nodeType: trimText(_0x1ccec2?.nodeType),
    kind: normalizeKind(_0x1ccec2?.kind) || trimText(_0x1ccec2?.kind),
    reason: _0x3588c2,
    detail: trimText(_0x175f5e)
  };
}
function normalizeItems(_0x3d11cf) {
  if (Array.isArray(_0x3d11cf)) {
    return _0x3d11cf.filter(_0x4a5496 => _0x4a5496 && typeof _0x4a5496 === "object" && !Array.isArray(_0x4a5496));
  } else {
    return [];
  }
}
export async function exportNodeItemsToZip({
  outputPath: _0xbb01b3,
  items: _0x1300d9,
  resolveLocalVirtualPath: _0x48d7d6,
  tempRoot: _0xeae3a2,
  fetchImpl = globalThis.fetch,
  now = new Date()
} = {}) {
  const _0x4d4d06 = withNodeExportZipExtension(_0xbb01b3);
  if (!_0x4d4d06) {
    throw new Error("Export path is required");
  }
  if (!a263_0x2ce88d.isAbsolute(_0x4d4d06)) {
    throw new Error("Export path must be absolute");
  }
  const _0x688345 = a263_0x2ce88d.resolve(_0x4d4d06);
  if (typeof _0x48d7d6 !== "function") {
    throw new Error("resolveLocalVirtualPath is required");
  }
  const _0x6619d3 = normalizeItems(_0x1300d9);
  const _0x1af9fe = new Set();
  const _0x2a542e = [];
  const _0x4dfe4d = [];
  let _0xdcf37a = "";
  try {
    for (const _0x299ac5 of _0x6619d3) {
      const _0x32a853 = normalizeKind(_0x299ac5?.kind);
      if (!_0x32a853) {
        _0x4dfe4d.push(createSkipped(_0x299ac5, "UNSUPPORTED_KIND"));
        continue;
      }
      if (_0x32a853 === "text") {
        const _0x1c2bbc = String(_0x299ac5?.text ?? "");
        if (!_0x1c2bbc.trim()) {
          _0x4dfe4d.push(createSkipped(_0x299ac5, "EMPTY_TEXT"));
          continue;
        }
        const _0x448b1e = allocateArchivePath({
          ..._0x299ac5,
          kind: _0x32a853
        }, _0x1af9fe);
        _0x2a542e.push({
          item: _0x299ac5,
          kind: _0x32a853,
          archivePath: _0x448b1e,
          buffer: Buffer.from(_0x1c2bbc, "utf8"),
          compress: true
        });
        continue;
      }
      const _0x2d4713 = trimText(_0x299ac5?.localPath);
      if (_0x2d4713) {
        const _0x3c3711 = _0x48d7d6(_0x2d4713);
        if (!_0x3c3711) {
          _0x4dfe4d.push(createSkipped(_0x299ac5, "INVALID_LOCAL_PATH", _0x2d4713));
          continue;
        }
        try {
          const _0x3cde8b = statSync(_0x3c3711);
          if (!_0x3cde8b.isFile()) {
            _0x4dfe4d.push(createSkipped(_0x299ac5, "LOCAL_PATH_NOT_FILE", _0x2d4713));
            continue;
          }
          const _0x2f7751 = allocateArchivePath({
            ..._0x299ac5,
            kind: _0x32a853
          }, _0x1af9fe);
          _0x2a542e.push({
            item: _0x299ac5,
            kind: _0x32a853,
            archivePath: _0x2f7751,
            sourcePath: _0x3c3711,
            compress: false
          });
        } catch (_0x206213) {
          _0x4dfe4d.push(createSkipped(_0x299ac5, "LOCAL_FILE_MISSING", _0x206213?.message || _0x2d4713));
        }
        continue;
      }
      const _0x12482d = normalizeRemoteUrl(_0x299ac5?.url);
      if (!_0x12482d) {
        _0x4dfe4d.push(createSkipped(_0x299ac5, "NO_MEDIA_SOURCE"));
        continue;
      }
      try {
        if (!_0xdcf37a) {
          const _0x483ae4 = _0xeae3a2 || a263_0x2ce88d.dirname(_0x688345);
          mkdirSync(_0x483ae4, {
            recursive: true
          });
          _0xdcf37a = mkdtempSync(a263_0x2ce88d.join(_0x483ae4, "aic-node-export-"));
        }
        const _0x30fd6b = await downloadRemoteToTemp({
          url: _0x12482d,
          tempDir: _0xdcf37a,
          fetchImpl: fetchImpl,
          ext: getItemExtension(_0x299ac5)
        });
        const _0x454581 = allocateArchivePath({
          ..._0x299ac5,
          kind: _0x32a853
        }, _0x1af9fe);
        _0x2a542e.push({
          item: _0x299ac5,
          kind: _0x32a853,
          archivePath: _0x454581,
          sourcePath: _0x30fd6b,
          compress: false
        });
      } catch (_0x3aff8f) {
        _0x4dfe4d.push(createSkipped(_0x299ac5, "REMOTE_DOWNLOAD_FAILED", _0x3aff8f?.message || _0x12482d));
      }
    }
    if (_0x2a542e.length <= 0) {
      return {
        success: false,
        canceled: false,
        code: "NO_EXPORTABLE_ITEMS",
        exportedCount: 0,
        skipped: _0x4dfe4d,
        counts: {}
      };
    }
    const _0xb0f36b = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0
    };
    for (const _0x1bf3a6 of _0x2a542e) {
      _0xb0f36b[_0x1bf3a6.kind] += 1;
    }
    const _0x281659 = {
      schemaVersion: NODE_EXPORT_SCHEMA_VERSION,
      packageKind: NODE_EXPORT_PACKAGE_KIND,
      exportedAt: (now instanceof Date ? now : new Date(now)).toISOString(),
      exportedCount: _0x2a542e.length,
      counts: _0xb0f36b,
      items: _0x2a542e.map(_0xcc4e2b => ({
        nodeId: trimText(_0xcc4e2b.item?.nodeId),
        nodeName: trimText(_0xcc4e2b.item?.nodeName),
        nodeType: trimText(_0xcc4e2b.item?.nodeType),
        kind: _0xcc4e2b.kind,
        archivePath: _0xcc4e2b.archivePath
      })),
      skipped: _0x4dfe4d
    };
    mkdirSync(a263_0x2ce88d.dirname(_0x688345), {
      recursive: true
    });
    const _0x148a2d = new a263_0x430465.ZipFile();
    for (const _0x1e6490 of _0x2a542e) {
      if (_0x1e6490.buffer) {
        _0x148a2d.addBuffer(_0x1e6490.buffer, _0x1e6490.archivePath);
      } else {
        _0x148a2d.addFile(_0x1e6490.sourcePath, _0x1e6490.archivePath, {
          compress: _0x1e6490.compress !== false
        });
      }
    }
    _0x148a2d.addBuffer(Buffer.from(JSON.stringify(_0x281659, null, 2) + "\n", "utf8"), NODE_EXPORT_MANIFEST_NAME);
    await writeZip(_0x148a2d, _0x688345);
    return {
      success: true,
      canceled: false,
      path: _0x688345,
      filename: a263_0x2ce88d.basename(_0x688345),
      exportedCount: _0x2a542e.length,
      skipped: _0x4dfe4d,
      counts: _0xb0f36b
    };
  } finally {
    if (_0xdcf37a && existsSync(_0xdcf37a)) {
      rmSync(_0xdcf37a, {
        recursive: true,
        force: true
      });
    }
  }
}