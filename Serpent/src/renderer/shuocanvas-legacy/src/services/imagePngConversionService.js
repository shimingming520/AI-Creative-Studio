function isBlobLike(_0x12a6cc) {
  return !!_0x12a6cc && typeof _0x12a6cc.arrayBuffer === "function";
}
function normalizeImageMimeType(_0x4ee721) {
  const _0x28bd43 = String(_0x4ee721 || "").split(";")[0].trim().toLowerCase();
  if (!_0x28bd43.startsWith("image/")) {
    return "";
  }
  return _0x28bd43;
}
function inferImageMimeTypeFromUrl(_0x2d3e4c) {
  const _0x2630bb = String(_0x2d3e4c || "").trim();
  if (!_0x2630bb) {
    return "";
  }
  const _0x1c9e7d = _0x2630bb.match(/^data:([^;,]+)/i);
  const _0x4b8afa = normalizeImageMimeType(_0x1c9e7d?.[1] || "");
  if (_0x4b8afa) {
    return _0x4b8afa;
  }
  const _0x52abba = _0x2630bb.toLowerCase().split("#")[0].split("?")[0];
  if (_0x52abba.endsWith(".png")) {
    return "image/png";
  }
  if (_0x52abba.endsWith(".jpg") || _0x52abba.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (_0x52abba.endsWith(".webp")) {
    return "image/webp";
  }
  if (_0x52abba.endsWith(".gif")) {
    return "image/gif";
  }
  if (_0x52abba.endsWith(".bmp")) {
    return "image/bmp";
  }
  if (_0x52abba.endsWith(".avif")) {
    return "image/avif";
  }
  if (_0x52abba.endsWith(".svg")) {
    return "image/svg+xml";
  }
  return "";
}
function resolveImageMimeType(_0x3a11e0, _0x54cb65) {
  return normalizeImageMimeType(_0x3a11e0?.type) || inferImageMimeTypeFromUrl(_0x54cb65);
}
function bytesToBase64(_0x1ecbf1) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(_0x1ecbf1).toString("base64");
  }
  let _0x1f95bb = "";
  const _0x13f5f2 = 32768;
  for (let _0x1ede5b = 0; _0x1ede5b < _0x1ecbf1.length; _0x1ede5b += _0x13f5f2) {
    _0x1f95bb += String.fromCharCode(..._0x1ecbf1.subarray(_0x1ede5b, _0x1ede5b + _0x13f5f2));
  }
  if (typeof btoa === "function") {
    return btoa(_0x1f95bb);
  } else {
    return "";
  }
}
async function convertImageBlobToDataUrl(_0x2431f6, _0x5abb86 = "") {
  if (!isBlobLike(_0x2431f6)) {
    return "";
  }
  const _0x4435d0 = new Uint8Array(await _0x2431f6.arrayBuffer());
  const _0x125668 = bytesToBase64(_0x4435d0);
  if (!_0x125668) {
    return "";
  }
  const _0x564139 = resolveImageMimeType(_0x2431f6, _0x5abb86) || "image/png";
  return "data:" + _0x564139 + ";base64," + _0x125668;
}
function hasDomCanvasRuntime() {
  return typeof document !== "undefined" && typeof document.createElement === "function" && typeof globalThis?.Image === "function";
}
function loadImage(_0x6cf97f) {
  return new Promise((_0x40a484, _0x457f89) => {
    const _0xba9a5c = globalThis?.Image;
    if (typeof _0xba9a5c !== "function") {
      _0x457f89(new Error("image-not-supported"));
      return;
    }
    const _0x30c900 = new _0xba9a5c();
    if ("crossOrigin" in _0x30c900) {
      _0x30c900.crossOrigin = "anonymous";
    }
    _0x30c900.onload = () => _0x40a484(_0x30c900);
    _0x30c900.onerror = () => _0x457f89(new Error("image-load-failed"));
    _0x30c900.src = _0x6cf97f;
  });
}
function canvasToBlob(_0x5d25f3, _0x351e25 = "image/png") {
  return new Promise(_0x683a58 => {
    if (!_0x5d25f3 || typeof _0x5d25f3.toBlob !== "function") {
      _0x683a58(null);
      return;
    }
    _0x5d25f3.toBlob(_0x4c2e63 => _0x683a58(_0x4c2e63), _0x351e25);
  });
}
async function renderImageElementToPngBlob(_0x223f4a) {
  if (!hasDomCanvasRuntime()) {
    return null;
  }
  const _0x788cc1 = Number(_0x223f4a?.naturalWidth || _0x223f4a?.width || 0);
  const _0xc3947b = Number(_0x223f4a?.naturalHeight || _0x223f4a?.height || 0);
  if (!_0x788cc1 || !_0xc3947b) {
    return null;
  }
  const _0x351680 = document.createElement("canvas");
  _0x351680.width = _0x788cc1;
  _0x351680.height = _0xc3947b;
  const _0x24d64e = _0x351680.getContext("2d");
  if (!_0x24d64e) {
    return null;
  }
  _0x24d64e.drawImage(_0x223f4a, 0, 0);
  return canvasToBlob(_0x351680, "image/png");
}
async function convertImageBlobToPngBlob(_0x230234) {
  if (!isBlobLike(_0x230234)) {
    return null;
  }
  const _0x1cf446 = globalThis?.createImageBitmap;
  const _0x3c7d63 = globalThis?.OffscreenCanvas;
  if (typeof _0x1cf446 === "function" && typeof _0x3c7d63 === "function") {
    let _0x37d6b8 = null;
    try {
      _0x37d6b8 = await _0x1cf446(_0x230234);
      const _0x31684d = Number(_0x37d6b8?.width || 0);
      const _0x5090d7 = Number(_0x37d6b8?.height || 0);
      if (!_0x31684d || !_0x5090d7) {
        return null;
      }
      const _0x5bf182 = new _0x3c7d63(_0x31684d, _0x5090d7);
      const _0x22b3b5 = _0x5bf182.getContext("2d");
      if (!_0x22b3b5) {
        return null;
      }
      _0x22b3b5.drawImage(_0x37d6b8, 0, 0);
      if (typeof _0x5bf182.convertToBlob === "function") {
        return await _0x5bf182.convertToBlob({
          type: "image/png"
        });
      }
    } catch {} finally {
      _0x37d6b8?.close?.();
    }
  }
  if (!hasDomCanvasRuntime()) {
    return null;
  }
  const _0x1bd731 = globalThis?.URL;
  if (typeof _0x1bd731?.createObjectURL !== "function") {
    return null;
  }
  const _0x1a3687 = _0x1bd731.createObjectURL(_0x230234);
  try {
    const _0x2f71be = await loadImage(_0x1a3687);
    return await renderImageElementToPngBlob(_0x2f71be);
  } catch {
    return null;
  } finally {
    _0x1bd731.revokeObjectURL?.(_0x1a3687);
  }
}
async function convertImageUrlToPngBlob(_0x241489) {
  if (!hasDomCanvasRuntime()) {
    return null;
  }
  try {
    const _0x15d50b = await loadImage(_0x241489);
    return await renderImageElementToPngBlob(_0x15d50b);
  } catch {
    return null;
  }
}
export { convertImageBlobToPngBlob, convertImageBlobToDataUrl, convertImageUrlToPngBlob, inferImageMimeTypeFromUrl, isBlobLike, normalizeImageMimeType, resolveImageMimeType };