const DEFAULT_PREVIEW_MAX_DIMENSION = 1024;
const DEFAULT_HEADER_BYTES = 524288;
const JPEG_SOF_MARKERS = new Set([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207]);
function positiveInteger(_0x3d6424) {
  const _0x14d364 = Math.round(Number(_0x3d6424) || 0);
  if (_0x14d364 > 0) {
    return _0x14d364;
  } else {
    return 0;
  }
}
function isJpegSofMarker(_0x13310f) {
  return JPEG_SOF_MARKERS.has(_0x13310f);
}
function readJpegSize(_0x2b63aa) {
  if (_0x2b63aa.length < 4 || _0x2b63aa[0] !== 255 || _0x2b63aa[1] !== 216) {
    return null;
  }
  let _0x472e56 = 2;
  while (_0x472e56 + 8 < _0x2b63aa.length) {
    if (_0x2b63aa[_0x472e56] !== 255) {
      _0x472e56 += 1;
      continue;
    }
    while (_0x472e56 < _0x2b63aa.length && _0x2b63aa[_0x472e56] === 255) {
      _0x472e56 += 1;
    }
    const _0x3c407d = _0x2b63aa[_0x472e56];
    _0x472e56 += 1;
    if (_0x3c407d === 216 || _0x3c407d === 217) {
      continue;
    }
    if (_0x3c407d === 218) {
      break;
    }
    if (_0x472e56 + 1 >= _0x2b63aa.length) {
      break;
    }
    const _0x5db84d = _0x2b63aa[_0x472e56] << 8 | _0x2b63aa[_0x472e56 + 1];
    if (_0x5db84d < 2 || _0x472e56 + _0x5db84d > _0x2b63aa.length) {
      break;
    }
    if (isJpegSofMarker(_0x3c407d) && _0x5db84d >= 7) {
      const _0x3bec3d = _0x2b63aa[_0x472e56 + 3] << 8 | _0x2b63aa[_0x472e56 + 4];
      const _0xb44c18 = _0x2b63aa[_0x472e56 + 5] << 8 | _0x2b63aa[_0x472e56 + 6];
      if (_0xb44c18 > 0 && _0x3bec3d > 0) {
        return {
          width: _0xb44c18,
          height: _0x3bec3d
        };
      } else {
        return null;
      }
    }
    _0x472e56 += _0x5db84d;
  }
  return null;
}
function readPngSize(_0xa5a4e1) {
  if (_0xa5a4e1.length < 24 || _0xa5a4e1[0] !== 137 || _0xa5a4e1[1] !== 80 || _0xa5a4e1[2] !== 78 || _0xa5a4e1[3] !== 71) {
    return null;
  }
  const _0x36764c = new DataView(_0xa5a4e1.buffer, _0xa5a4e1.byteOffset, _0xa5a4e1.byteLength);
  const _0xf67433 = _0x36764c.getUint32(16, false);
  const _0x1cde8e = _0x36764c.getUint32(20, false);
  if (_0xf67433 > 0 && _0x1cde8e > 0) {
    return {
      width: _0xf67433,
      height: _0x1cde8e
    };
  } else {
    return null;
  }
}
function readGifSize(_0x599c9a) {
  if (_0x599c9a.length < 10) {
    return null;
  }
  const _0x84d166 = String.fromCharCode(..._0x599c9a.subarray(0, 6));
  if (_0x84d166 !== "GIF87a" && _0x84d166 !== "GIF89a") {
    return null;
  }
  const _0x287cf0 = _0x599c9a[6] | _0x599c9a[7] << 8;
  const _0x2ece15 = _0x599c9a[8] | _0x599c9a[9] << 8;
  if (_0x287cf0 > 0 && _0x2ece15 > 0) {
    return {
      width: _0x287cf0,
      height: _0x2ece15
    };
  } else {
    return null;
  }
}
function readUint24LittleEndian(_0x6ba45b, _0x5a333d) {
  return _0x6ba45b[_0x5a333d] | _0x6ba45b[_0x5a333d + 1] << 8 | _0x6ba45b[_0x5a333d + 2] << 16;
}
function readWebpSize(_0x5c9e08) {
  if (_0x5c9e08.length < 30) {
    return null;
  }
  const _0x2d49fe = String.fromCharCode(..._0x5c9e08.subarray(0, 4));
  const _0x39abeb = String.fromCharCode(..._0x5c9e08.subarray(8, 12));
  if (_0x2d49fe !== "RIFF" || _0x39abeb !== "WEBP") {
    return null;
  }
  const _0x278275 = String.fromCharCode(..._0x5c9e08.subarray(12, 16));
  if (_0x278275 === "VP8X") {
    return {
      width: readUint24LittleEndian(_0x5c9e08, 24) + 1,
      height: readUint24LittleEndian(_0x5c9e08, 27) + 1
    };
  }
  if (_0x278275 === "VP8 " && _0x5c9e08.length >= 30) {
    const _0x1c162f = (_0x5c9e08[26] | _0x5c9e08[27] << 8) & 16383;
    const _0x53a428 = (_0x5c9e08[28] | _0x5c9e08[29] << 8) & 16383;
    if (_0x1c162f > 0 && _0x53a428 > 0) {
      return {
        width: _0x1c162f,
        height: _0x53a428
      };
    } else {
      return null;
    }
  }
  if (_0x278275 === "VP8L" && _0x5c9e08.length >= 25 && _0x5c9e08[20] === 47) {
    const _0x1300c8 = 1 + (_0x5c9e08[21] | (_0x5c9e08[22] & 63) << 8);
    const _0x2dd7c9 = 1 + (_0x5c9e08[22] >> 6 | _0x5c9e08[23] << 2 | (_0x5c9e08[24] & 15) << 10);
    return {
      width: _0x1300c8,
      height: _0x2dd7c9
    };
  }
  return null;
}
export function readImageHeaderSize(_0xb7695f) {
  const _0x19182b = _0xb7695f instanceof Uint8Array ? _0xb7695f : new Uint8Array(_0xb7695f || 0);
  return readPngSize(_0x19182b) || readJpegSize(_0x19182b) || readWebpSize(_0x19182b) || readGifSize(_0x19182b);
}
export async function readImageFileHeaderSize(_0x5da39c, {
  maxHeaderBytes = DEFAULT_HEADER_BYTES
} = {}) {
  if (!_0x5da39c) {
    return null;
  }
  const _0x2f7db7 = typeof _0x5da39c.slice === "function" ? _0x5da39c.slice(0, Math.max(32, positiveInteger(maxHeaderBytes))) : _0x5da39c;
  if (typeof _0x2f7db7?.arrayBuffer !== "function") {
    return null;
  }
  try {
    return readImageHeaderSize(await _0x2f7db7.arrayBuffer());
  } catch {
    return null;
  }
}
function getPreviewDimensions(_0x8986c7, _0x2fa199, _0x3a9b22) {
  const _0x98a0f7 = positiveInteger(_0x8986c7);
  const _0xd46e76 = positiveInteger(_0x2fa199);
  const _0x2ab809 = positiveInteger(_0x3a9b22) || DEFAULT_PREVIEW_MAX_DIMENSION;
  if (!_0x98a0f7 || !_0xd46e76) {
    return null;
  }
  const _0x192ae7 = Math.min(1, _0x2ab809 / Math.max(_0x98a0f7, _0xd46e76));
  return {
    width: Math.max(1, Math.round(_0x98a0f7 * _0x192ae7)),
    height: Math.max(1, Math.round(_0xd46e76 * _0x192ae7))
  };
}
function createPreviewCanvas(_0x477a7a, {
  sourceWidth: _0x25d7ee,
  sourceHeight: _0x33b6f5,
  outputWidth: _0x399024,
  outputHeight: _0x435c10,
  documentRef = globalThis.document
} = {}) {
  if (!_0x477a7a || typeof documentRef?.createElement !== "function") {
    return null;
  }
  const _0x1fd9b1 = documentRef.createElement("canvas");
  _0x1fd9b1.width = positiveInteger(_0x399024);
  _0x1fd9b1.height = positiveInteger(_0x435c10);
  if (!_0x1fd9b1.width || !_0x1fd9b1.height) {
    return null;
  }
  const _0x293505 = _0x1fd9b1.getContext?.("2d", {
    alpha: true
  });
  if (!_0x293505?.drawImage) {
    return null;
  }
  _0x293505.drawImage(_0x477a7a, 0, 0, _0x1fd9b1.width, _0x1fd9b1.height);
  let _0x2348d5 = "";
  try {
    _0x2348d5 = String(_0x1fd9b1.toDataURL?.("image/webp", 0.72) || "");
  } catch {}
  return {
    image: _0x1fd9b1,
    width: positiveInteger(_0x25d7ee),
    height: positiveInteger(_0x33b6f5),
    thumbnailDataUrl: _0x2348d5
  };
}
export function createImagePreviewFromDecodedImage(_0x29ecc5, {
  maxDimension = DEFAULT_PREVIEW_MAX_DIMENSION,
  documentRef = globalThis.document
} = {}) {
  const _0x485fef = positiveInteger(_0x29ecc5?.naturalWidth || _0x29ecc5?.width);
  const _0x130c8e = positiveInteger(_0x29ecc5?.naturalHeight || _0x29ecc5?.height);
  const _0x48d3fe = getPreviewDimensions(_0x485fef, _0x130c8e, maxDimension);
  if (!_0x48d3fe) {
    return null;
  }
  return createPreviewCanvas(_0x29ecc5, {
    sourceWidth: _0x485fef,
    sourceHeight: _0x130c8e,
    outputWidth: _0x48d3fe.width,
    outputHeight: _0x48d3fe.height,
    documentRef: documentRef
  });
}
export async function createFastImagePreview(_0x53a6ce, {
  maxDimension = DEFAULT_PREVIEW_MAX_DIMENSION,
  createImageBitmapImpl = globalThis.createImageBitmap,
  documentRef = globalThis.document,
  readHeaderSizeImpl = readImageFileHeaderSize
} = {}) {
  if (!_0x53a6ce || typeof createImageBitmapImpl !== "function" || typeof documentRef?.createElement !== "function") {
    return null;
  }
  const _0x3afee3 = await readHeaderSizeImpl(_0x53a6ce);
  const _0x424669 = getPreviewDimensions(_0x3afee3?.width, _0x3afee3?.height, maxDimension);
  if (!_0x3afee3 || !_0x424669) {
    return null;
  }
  let _0x1334bd = null;
  try {
    _0x1334bd = await createImageBitmapImpl(_0x53a6ce, {
      imageOrientation: "from-image",
      resizeWidth: _0x424669.width,
      resizeHeight: _0x424669.height,
      resizeQuality: "low"
    });
    return createPreviewCanvas(_0x1334bd, {
      sourceWidth: _0x3afee3.width,
      sourceHeight: _0x3afee3.height,
      outputWidth: positiveInteger(_0x1334bd?.width) || _0x424669.width,
      outputHeight: positiveInteger(_0x1334bd?.height) || _0x424669.height,
      documentRef: documentRef
    });
  } catch {
    return null;
  } finally {
    _0x1334bd?.close?.();
  }
}