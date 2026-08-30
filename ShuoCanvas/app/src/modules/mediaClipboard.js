import { fetchRemoteBlob } from "../../api/projectsV2Api.js";
import { convertImageBlobToPngBlob, convertImageUrlToPngBlob, isBlobLike, normalizeImageMimeType, resolveImageMimeType } from "../services/imagePngConversionService.js";
import { localPathToUrl, normalizeLocalPath } from "../utils/localMediaPath.js";
import { desktopBridge } from "../services/desktopBridge.js";
const IMAGE_NODE_TYPES = new Set(["source-image", "ai-image", "storyboard"]);
function pickMainItem(_0x370f51, _0x37019e) {
  if (!Array.isArray(_0x370f51) || _0x370f51.length === 0) {
    return null;
  }
  const _0x5c957d = Number(_0x37019e);
  const _0x204d5b = Number.isFinite(_0x5c957d) ? Math.max(0, Math.trunc(_0x5c957d)) : 0;
  return _0x370f51[_0x204d5b] || _0x370f51[0] || null;
}
function normalizeMediaUrl(_0xfad924) {
  const _0x5d1c16 = String(_0xfad924 || "").trim();
  if (!_0x5d1c16) {
    return "";
  }
  if (/^(https?:|blob:|data:)/i.test(_0x5d1c16)) {
    return _0x5d1c16;
  }
  const _0x404f13 = localPathToUrl(_0x5d1c16);
  if (_0x404f13) {
    return _0x404f13;
  }
  const _0x4b3e0c = _0x5d1c16.replace(/\\/g, "/");
  if (/^(?:file:|javascript:)/i.test(_0x4b3e0c) || /^[a-zA-Z]:\//.test(_0x4b3e0c) || _0x4b3e0c.startsWith("//")) {
    return "";
  }
  const _0x585b99 = _0x4b3e0c.split(/[?#]/, 1)[0].replace(/^\/+/, "");
  const _0xd0a991 = _0x585b99.split("/").filter(Boolean);
  if (!_0xd0a991.length || _0xd0a991.some(_0x26794a => _0x26794a === "." || _0x26794a === "..")) {
    return "";
  }
  return "/" + _0xd0a991.join("/");
}
function normalizeLocalMediaPath(_0x2eb2f4) {
  return normalizeLocalPath(_0x2eb2f4);
}
function pickMediaUrl(..._0xc6e45f) {
  for (const _0x1cd7e1 of _0xc6e45f) {
    const _0x4da212 = normalizeMediaUrl(_0x1cd7e1);
    if (_0x4da212) {
      return _0x4da212;
    }
  }
  return "";
}
function pickLocalMediaPath(..._0x430cf0) {
  for (const _0x2dd907 of _0x430cf0) {
    const _0x47e457 = normalizeLocalMediaPath(_0x2dd907);
    if (_0x47e457) {
      return _0x47e457;
    }
  }
  return "";
}
function resolveNodeMedia(_0x574d50) {
  const _0x406002 = String(_0x574d50?.type || "").trim();
  if (!IMAGE_NODE_TYPES.has(_0x406002)) {
    return {
      kind: "",
      url: "",
      localPath: ""
    };
  }
  if (_0x406002 === "storyboard") {
    const _0x5d0385 = Array.isArray(_0x574d50?.cells) ? _0x574d50.cells[0] : null;
    return {
      kind: "image",
      url: pickMediaUrl(_0x5d0385?.url, _0x574d50?.sourceUrl, _0x574d50?.imageUrl, _0x574d50?.src, _0x574d50?.localPath),
      localPath: pickLocalMediaPath(_0x5d0385?.localPath, _0x5d0385?.url, _0x574d50?.localPath, _0x574d50?.sourceUrl, _0x574d50?.imageUrl, _0x574d50?.src)
    };
  }
  if (_0x406002 === "source-image") {
    return {
      kind: "image",
      url: pickMediaUrl(_0x574d50?.localPath, _0x574d50?.sourceUrl, _0x574d50?.imageUrl, _0x574d50?.src, _0x574d50?.thumbUrl),
      localPath: pickLocalMediaPath(_0x574d50?.displayLocalPath, _0x574d50?.localPath, _0x574d50?.originalLocalPath, _0x574d50?.sourceUrl, _0x574d50?.imageUrl, _0x574d50?.src, _0x574d50?.thumbUrl)
    };
  }
  const _0x85ee82 = pickMainItem(_0x574d50?.images, _0x574d50?.mainImageIndex);
  return {
    kind: "image",
    url: pickMediaUrl(_0x85ee82?.localPath, _0x85ee82?.sourceUrl, _0x85ee82?.imageUrl, _0x85ee82?.url, _0x85ee82?.thumbUrl, _0x574d50?.localPath, _0x574d50?.sourceUrl, _0x574d50?.imageUrl, _0x574d50?.src, _0x574d50?.thumbUrl),
    localPath: pickLocalMediaPath(_0x85ee82?.displayLocalPath, _0x85ee82?.localPath, _0x85ee82?.originalLocalPath, _0x85ee82?.sourceUrl, _0x85ee82?.imageUrl, _0x85ee82?.url, _0x85ee82?.thumbUrl, _0x574d50?.displayLocalPath, _0x574d50?.localPath, _0x574d50?.originalLocalPath, _0x574d50?.sourceUrl, _0x574d50?.imageUrl, _0x574d50?.src, _0x574d50?.thumbUrl)
  };
}
function getElectronClipboardApi() {
  if (desktopBridge.clipboard.canUseImages()) {
    return desktopBridge.clipboard;
  } else {
    return null;
  }
}
async function copyNodeMediaToElectronClipboard({
  url: _0xcfd51e,
  localPath: _0x52390a
} = {}) {
  const _0x410147 = getElectronClipboardApi();
  if (!_0x410147) {
    return null;
  }
  const _0x2f9798 = _0x52390a || normalizeLocalMediaPath(_0xcfd51e);
  if (!_0x2f9798) {
    return {
      ok: false,
      reason: "no-local-path"
    };
  }
  try {
    const _0xc90f2d = await _0x410147.writeImage({
      localPath: _0x2f9798,
      text: String(_0xcfd51e || _0x2f9798 || "")
    });
    if (_0xc90f2d?.ok) {
      return {
        ok: true,
        kind: "image",
        mimeType: _0xc90f2d.mimeType || "image/png",
        sourceUrl: _0xcfd51e,
        localPath: _0x2f9798,
        copyPath: "electron"
      };
    }
    return {
      ok: false,
      reason: _0xc90f2d?.reason || "copy-failed",
      error: _0xc90f2d?.error
    };
  } catch (_0x1648c9) {
    return {
      ok: false,
      reason: "copy-failed",
      error: _0x1648c9
    };
  }
}
async function writeImageBlobToClipboard({
  clipboard: _0xbfa182,
  write: _0x66197f,
  ClipboardItemCtor: _0x4365c4,
  blob: _0x107fe6,
  mimeType: _0x27709e
} = {}) {
  const _0x11566b = normalizeImageMimeType(_0x27709e) || "image/png";
  const _0x3134ba = new _0x4365c4({
    [_0x11566b]: _0x107fe6
  });
  await _0x66197f.call(_0xbfa182, [_0x3134ba]);
  return _0x11566b;
}
export async function copyNodeMediaToSystemClipboard(_0x59422f) {
  const {
    kind: _0x8c7211,
    url: _0x1581c9,
    localPath: _0xb2323c
  } = resolveNodeMedia(_0x59422f);
  if (_0x8c7211 !== "image" || !_0x1581c9) {
    return {
      ok: false,
      reason: "no-media"
    };
  }
  const _0x1eeb08 = await copyNodeMediaToElectronClipboard({
    url: _0x1581c9,
    localPath: _0xb2323c
  });
  if (_0x1eeb08?.ok) {
    return _0x1eeb08;
  }
  const _0x31ac05 = globalThis?.navigator?.clipboard;
  const _0x52f65c = _0x31ac05?.write;
  const _0x4d0783 = globalThis?.ClipboardItem;
  if (typeof _0x52f65c !== "function" || typeof _0x4d0783 !== "function") {
    return {
      ok: false,
      reason: "not-supported"
    };
  }
  let _0x261f8b = null;
  let _0x3d33de = null;
  try {
    _0x261f8b = await fetchRemoteBlob(_0x1581c9, {
      timeout: 15000
    });
    if (!isBlobLike(_0x261f8b)) {
      _0x261f8b = null;
    }
  } catch (_0x20c652) {
    _0x3d33de = _0x20c652;
  }
  if (_0x261f8b) {
    const _0x58476e = resolveImageMimeType(_0x261f8b, _0x1581c9) || "image/png";
    try {
      const _0x1b2801 = await writeImageBlobToClipboard({
        clipboard: _0x31ac05,
        write: _0x52f65c,
        ClipboardItemCtor: _0x4d0783,
        blob: _0x261f8b,
        mimeType: _0x58476e
      });
      return {
        ok: true,
        kind: "image",
        mimeType: _0x1b2801,
        sourceUrl: _0x1581c9,
        copyPath: "direct"
      };
    } catch (_0x55d5fe) {
      _0x3d33de = _0x55d5fe;
    }
  }
  try {
    let _0x58a321 = null;
    if (_0x261f8b) {
      _0x58a321 = await convertImageBlobToPngBlob(_0x261f8b);
    }
    if (!isBlobLike(_0x58a321)) {
      _0x58a321 = await convertImageUrlToPngBlob(_0x1581c9);
    }
    if (!isBlobLike(_0x58a321)) {
      return {
        ok: false,
        reason: "copy-failed",
        error: _0x3d33de
      };
    }
    const _0x2d6644 = await writeImageBlobToClipboard({
      clipboard: _0x31ac05,
      write: _0x52f65c,
      ClipboardItemCtor: _0x4d0783,
      blob: _0x58a321,
      mimeType: "image/png"
    });
    return {
      ok: true,
      kind: "image",
      mimeType: _0x2d6644,
      sourceUrl: _0x1581c9,
      copyPath: "png-fallback"
    };
  } catch (_0x46a860) {
    return {
      ok: false,
      reason: "copy-failed",
      error: _0x46a860 || _0x3d33de
    };
  }
}