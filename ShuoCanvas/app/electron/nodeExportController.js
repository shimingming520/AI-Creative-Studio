import a262_0x26f874 from "node:path";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { rename, rm, writeFile } from "node:fs/promises";
import { defaultNodeExportZipName, exportNodeItemsToZip, NODE_EXPORT_FILE_EXTENSION, saveNodeMediaToFile, withNodeExportZipExtension } from "./nodeExportService.js";
const MEDIA_DEFAULT_EXTENSIONS = Object.freeze({
  image: "png",
  video: "mp4",
  audio: "mp3"
});
const MEDIA_DIALOG_TITLES = Object.freeze({
  image: "保存图片",
  video: "保存视频",
  audio: "保存音频"
});
const MAX_TEXT_FILE_BYTES = 16777216;
const MAX_MEDIA_FILES = 500;
const NODE_EXPORT_STATE_FILENAME = "node-export-state.json";
function getDialogFilters() {
  return [{
    name: "ZIP Archive",
    extensions: [NODE_EXPORT_FILE_EXTENSION.replace(/^\./, "")]
  }];
}
function trimText(_0x33a4ef) {
  return String(_0x33a4ef || "").trim();
}
function firstNonEmpty(..._0x233442) {
  for (const _0xf8dc3e of _0x233442) {
    const _0x4605c6 = trimText(_0xf8dc3e);
    if (_0x4605c6) {
      return _0x4605c6;
    }
  }
  return "";
}
function assertAbsolutePath(_0x5eca14, _0x27553b) {
  const _0x41b7c0 = trimText(_0x5eca14);
  if (!_0x41b7c0) {
    return "";
  }
  if (!a262_0x26f874.isAbsolute(_0x41b7c0)) {
    throw new Error(_0x27553b + " must be an absolute path");
  }
  return a262_0x26f874.resolve(_0x41b7c0);
}
function assertFilename(_0x5838c8) {
  const _0xeec4e6 = trimText(_0x5838c8);
  if (!_0xeec4e6) {
    return "";
  }
  if (_0xeec4e6.includes("/") || _0xeec4e6.includes("\\") || a262_0x26f874.basename(_0xeec4e6) !== _0xeec4e6) {
    throw new Error("Export filename must not include path separators");
  }
  return withNodeExportZipExtension(_0xeec4e6);
}
function sanitizeMediaFilename(_0x55c593, _0x1224fe) {
  const _0x493235 = (_0x1224fe || "media") + "." + (MEDIA_DEFAULT_EXTENSIONS[_0x1224fe] || "bin");
  const _0x3b1aed = trimText(_0x55c593).replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").replace(/[. ]+$/g, "").slice(0, 160).trim();
  const _0x5c59d0 = _0x3b1aed || _0x493235;
  if (a262_0x26f874.extname(_0x5c59d0)) {
    return _0x5c59d0;
  } else {
    return _0x5c59d0 + "." + (MEDIA_DEFAULT_EXTENSIONS[_0x1224fe] || "bin");
  }
}
function sanitizeTextFilename(_0x46173e) {
  const _0x13664c = trimText(_0x46173e).replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").replace(/[. ]+$/g, "").slice(0, 160).trim();
  return _0x13664c || "export.txt";
}
function getFilenameExtension(_0x5f28d6, _0x2d9c6e = "txt") {
  return a262_0x26f874.extname(_0x5f28d6).replace(/^\./, "").toLowerCase() || _0x2d9c6e;
}
function getMediaDialogFilters(_0x13a290, _0x5aff6d) {
  const _0x40e1a4 = a262_0x26f874.extname(_0x5aff6d).replace(/^\./, "").toLowerCase() || MEDIA_DEFAULT_EXTENSIONS[_0x13a290] || "bin";
  return [{
    name: MEDIA_DIALOG_TITLES[_0x13a290] || "媒体文件",
    extensions: [_0x40e1a4]
  }];
}
function ensureDirectory(_0x543d78) {
  mkdirSync(_0x543d78, {
    recursive: true
  });
  const _0x54aaa5 = statSync(_0x543d78);
  if (!_0x54aaa5.isDirectory()) {
    throw new Error("Export directory is not a directory");
  }
}
function showSaveDialog(_0x335bc3, _0x202a90, _0x5837a7) {
  if (_0x202a90) {
    return _0x335bc3.showSaveDialog(_0x202a90, _0x5837a7);
  } else {
    return _0x335bc3.showSaveDialog(_0x5837a7);
  }
}
function showOpenDialog(_0x204f69, _0x101657, _0x221a70) {
  if (_0x101657) {
    return _0x204f69.showOpenDialog(_0x101657, _0x221a70);
  } else {
    return _0x204f69.showOpenDialog(_0x221a70);
  }
}
async function writeUtf8FileAtomic(_0x181a12, _0x3615b6) {
  const _0x1e09c3 = a262_0x26f874.resolve(_0x181a12);
  mkdirSync(a262_0x26f874.dirname(_0x1e09c3), {
    recursive: true
  });
  const _0x5a64c1 = a262_0x26f874.join(a262_0x26f874.dirname(_0x1e09c3), "." + a262_0x26f874.basename(_0x1e09c3) + "." + process.pid + "-" + Date.now() + "-" + Math.random().toString(36).slice(2) + ".part");
  try {
    await writeFile(_0x5a64c1, _0x3615b6, {
      encoding: "utf8",
      flag: "wx"
    });
    await rm(_0x1e09c3, {
      force: true
    });
    await rename(_0x5a64c1, _0x1e09c3);
  } finally {
    await rm(_0x5a64c1, {
      force: true
    }).catch(() => {});
  }
  return _0x1e09c3;
}
function uniqueMediaOutputPath(_0x39f925, _0x4ca6ce, _0x5b273d) {
  const _0x5d9767 = a262_0x26f874.extname(_0x4ca6ce);
  const _0x58975d = _0x5d9767 ? _0x4ca6ce.slice(0, -_0x5d9767.length) : _0x4ca6ce;
  let _0x3796f1 = 1;
  let _0x33af4c = a262_0x26f874.join(_0x39f925, _0x4ca6ce);
  while (existsSync(_0x33af4c) || _0x5b273d.has(_0x33af4c.toLowerCase())) {
    _0x3796f1 += 1;
    _0x33af4c = a262_0x26f874.join(_0x39f925, _0x58975d + " (" + _0x3796f1 + ")" + _0x5d9767);
  }
  _0x5b273d.add(_0x33af4c.toLowerCase());
  return _0x33af4c;
}
export function createNodeExportController({
  app: _0x223643,
  dialog: _0xacd1ab,
  getMainWindow = () => null,
  resolveLocalVirtualPath: _0x4b0d31,
  showSaveDialog: _0xac1fcf,
  showOpenDialog: _0x49ab1f,
  fetchImpl = globalThis.fetch
} = {}) {
  const _0x2cfbae = _0x59adb1 => typeof _0xac1fcf === "function" ? _0xac1fcf(_0x59adb1) : showSaveDialog(_0xacd1ab, getMainWindow(), _0x59adb1);
  const _0x4ee043 = _0x1b855e => typeof _0x49ab1f === "function" ? _0x49ab1f(_0x1b855e) : showOpenDialog(_0xacd1ab, getMainWindow(), _0x1b855e);
  const _0x406fa3 = () => {
    let _0x18cf10 = "";
    try {
      _0x18cf10 = _0x223643.getPath("downloads");
    } catch {}
    let _0x1defe1 = "";
    try {
      _0x1defe1 = _0x223643.getPath("temp");
    } catch {}
    return _0x18cf10 || _0x1defe1 || process.cwd();
  };
  const _0xe55b4a = () => a262_0x26f874.join(_0x406fa3(), defaultNodeExportZipName());
  let _0x1cefcb = "";
  let _0xe5af8f = false;
  const _0x434601 = () => {
    try {
      return a262_0x26f874.join(_0x223643.getPath("userData"), NODE_EXPORT_STATE_FILENAME);
    } catch {
      return "";
    }
  };
  const _0x324490 = () => {
    if (!_0xe5af8f) {
      _0xe5af8f = true;
      const _0x2e6014 = _0x434601();
      if (_0x2e6014 && existsSync(_0x2e6014)) {
        try {
          const _0x1c00a3 = JSON.parse(readFileSync(_0x2e6014, "utf8"));
          const _0x1c60d3 = assertAbsolutePath(_0x1c00a3?.lastMediaExportDirectory, "Remembered media export directory");
          if (_0x1c60d3 && statSync(_0x1c60d3).isDirectory()) {
            _0x1cefcb = _0x1c60d3;
          }
        } catch {}
      }
    }
    return _0x1cefcb || _0x406fa3();
  };
  const _0x37c8eb = async _0x382f4b => {
    const _0x1c5038 = assertAbsolutePath(_0x382f4b, "Media export directory");
    if (!_0x1c5038) {
      return;
    }
    _0x1cefcb = _0x1c5038;
    _0xe5af8f = true;
    const _0x46644b = _0x434601();
    if (!_0x46644b) {
      return;
    }
    try {
      await writeUtf8FileAtomic(_0x46644b, JSON.stringify({
        lastMediaExportDirectory: _0x1c5038
      }, null, 2) + "\n");
    } catch {}
  };
  const _0x164d05 = (_0x335413 = {}) => {
    const _0x3340a1 = firstNonEmpty(_0x335413?.outputPath, _0x335413?.filePath, _0x335413?.path);
    if (_0x3340a1) {
      return withNodeExportZipExtension(assertAbsolutePath(_0x3340a1, "Export outputPath"));
    }
    const _0x6931a6 = firstNonEmpty(_0x335413?.directory, _0x335413?.downloadDir, _0x335413?.targetDir, _0x335413?.destinationDirectory);
    if (!_0x6931a6) {
      return "";
    }
    const _0x1ca71a = assertAbsolutePath(_0x6931a6, "Export directory");
    ensureDirectory(_0x1ca71a);
    const _0x4f6cf1 = assertFilename(_0x335413?.filename || _0x335413?.fileName) || defaultNodeExportZipName();
    return a262_0x26f874.join(_0x1ca71a, _0x4f6cf1);
  };
  const _0x399dc4 = async (_0x4fd7bb = {}) => {
    let _0x23d37c = _0x164d05(_0x4fd7bb);
    if (!_0x23d37c) {
      const _0x480b91 = await _0x2cfbae({
        title: "批量下载节点",
        defaultPath: _0xe55b4a(),
        filters: getDialogFilters()
      });
      if (_0x480b91.canceled || !_0x480b91.filePath) {
        return {
          success: false,
          canceled: true
        };
      }
      _0x23d37c = withNodeExportZipExtension(_0x480b91.filePath);
    }
    let _0x536e61 = "";
    try {
      _0x536e61 = _0x223643.getPath("temp");
    } catch {}
    return await exportNodeItemsToZip({
      outputPath: _0x23d37c,
      items: _0x4fd7bb?.items || [],
      resolveLocalVirtualPath: _0x4b0d31,
      tempRoot: _0x536e61
    });
  };
  const _0x534f66 = async (_0x100273 = {}) => {
    const _0x7258c8 = trimText(_0x100273?.kind).toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(MEDIA_DEFAULT_EXTENSIONS, _0x7258c8)) {
      throw new Error("Unsupported media kind");
    }
    const _0x49e1ca = sanitizeMediaFilename(_0x100273?.filename || _0x100273?.fileName, _0x7258c8);
    const _0x4d5adb = await _0x2cfbae({
      title: MEDIA_DIALOG_TITLES[_0x7258c8],
      defaultPath: a262_0x26f874.join(_0x324490(), _0x49e1ca),
      filters: getMediaDialogFilters(_0x7258c8, _0x49e1ca)
    });
    if (_0x4d5adb.canceled || !_0x4d5adb.filePath) {
      return {
        success: false,
        canceled: true
      };
    }
    const _0x547210 = a262_0x26f874.extname(_0x4d5adb.filePath) ? _0x4d5adb.filePath : _0x4d5adb.filePath + "." + MEDIA_DEFAULT_EXTENSIONS[_0x7258c8];
    const _0x326560 = await saveNodeMediaToFile({
      outputPath: _0x547210,
      item: {
        kind: _0x7258c8,
        localPath: _0x100273?.localPath,
        url: _0x100273?.url
      },
      resolveLocalVirtualPath: _0x4b0d31,
      fetchImpl: fetchImpl
    });
    await _0x37c8eb(a262_0x26f874.dirname(_0x326560.path));
    return _0x326560;
  };
  const _0x105d38 = async (_0x5d3099 = {}) => {
    const _0x271f3b = String(_0x5d3099?.content ?? "");
    if (Buffer.byteLength(_0x271f3b, "utf8") > MAX_TEXT_FILE_BYTES) {
      throw new Error("Text export exceeds the 16 MB limit");
    }
    const _0x5b8cea = sanitizeTextFilename(_0x5d3099?.filename || _0x5d3099?.fileName);
    const _0x3c4bdf = getFilenameExtension(_0x5b8cea);
    const _0x255557 = await _0x2cfbae({
      title: trimText(_0x5d3099?.title) || "保存文件",
      defaultPath: a262_0x26f874.join(_0x406fa3(), _0x5b8cea),
      filters: [{
        name: trimText(_0x5d3099?.filterName) || "Text File",
        extensions: [_0x3c4bdf]
      }]
    });
    if (_0x255557.canceled || !_0x255557.filePath) {
      return {
        success: false,
        canceled: true
      };
    }
    const _0x4782f7 = a262_0x26f874.extname(_0x255557.filePath) ? _0x255557.filePath : _0x255557.filePath + "." + _0x3c4bdf;
    const _0x5f0e30 = await writeUtf8FileAtomic(_0x4782f7, _0x271f3b);
    return {
      success: true,
      canceled: false,
      path: _0x5f0e30,
      filename: a262_0x26f874.basename(_0x5f0e30)
    };
  };
  const _0xcce3a8 = async (_0x6f7593 = {}) => {
    const _0x53923b = Array.isArray(_0x6f7593?.files) ? _0x6f7593.files : [];
    if (_0x53923b.length === 0) {
      throw new Error("Media files are required");
    }
    if (_0x53923b.length > MAX_MEDIA_FILES) {
      throw new Error("Cannot save more than " + MAX_MEDIA_FILES + " media files at once");
    }
    let _0x6999ae = trimText(_0x6f7593?.directory);
    if (_0x6999ae) {
      _0x6999ae = assertAbsolutePath(_0x6999ae, "Media export directory");
      ensureDirectory(_0x6999ae);
    } else {
      const _0x3a511f = await _0x4ee043({
        title: trimText(_0x6f7593?.title) || "选择保存目录",
        defaultPath: _0x324490(),
        properties: ["openDirectory", "createDirectory"]
      });
      if (_0x3a511f.canceled || !_0x3a511f.filePaths?.[0]) {
        return {
          success: false,
          canceled: true,
          count: 0,
          files: []
        };
      }
      _0x6999ae = a262_0x26f874.resolve(_0x3a511f.filePaths[0]);
      ensureDirectory(_0x6999ae);
    }
    const _0x452779 = new Set();
    const _0x5083e7 = [];
    for (const _0x2dc664 of _0x53923b) {
      const _0x8ebe2e = trimText(_0x2dc664?.kind).toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(MEDIA_DEFAULT_EXTENSIONS, _0x8ebe2e)) {
        throw new Error("Unsupported media kind");
      }
      const _0x109e37 = sanitizeMediaFilename(_0x2dc664?.filename || _0x2dc664?.fileName, _0x8ebe2e);
      const _0x2d09dd = uniqueMediaOutputPath(_0x6999ae, _0x109e37, _0x452779);
      const _0x2a786c = await saveNodeMediaToFile({
        outputPath: _0x2d09dd,
        item: {
          kind: _0x8ebe2e,
          localPath: _0x2dc664?.localPath,
          url: _0x2dc664?.url
        },
        resolveLocalVirtualPath: _0x4b0d31,
        fetchImpl: fetchImpl
      });
      _0x5083e7.push(_0x2a786c);
    }
    await _0x37c8eb(_0x6999ae);
    return {
      success: true,
      canceled: false,
      directory: _0x6999ae,
      count: _0x5083e7.length,
      files: _0x5083e7
    };
  };
  return {
    exportSelectedNodesPackage: _0x399dc4,
    saveMediaFile: _0x534f66,
    saveTextFile: _0x105d38,
    saveMediaFiles: _0xcce3a8
  };
}