import { buildStoryboardCropRect, detachStoryboardCellSourceContext, isFrozenStoryboardDisplayCell, isStoryboardCellEmpty, normalizeEmptyStoryboardCell, resolveStoryboardCellAssetSrc, resolveStoryboardCellPreviewSrc, resolveStoryboardCellSourceIndex } from "../../core/storyboardCellUtils.js";
const storyboardSourceImageCache = new Map();
function toPositiveNumber(_0x500032, _0x3f965a = null) {
  const _0x4a7ea9 = Number(_0x500032);
  if (Number.isFinite(_0x4a7ea9) && _0x4a7ea9 > 0) {
    return _0x4a7ea9;
  } else {
    return _0x3f965a;
  }
}
export function normalizeStoryboardImageUrl(_0x1a5f84) {
  const _0x2ba3e1 = String(_0x1a5f84 || "").trim();
  if (!_0x2ba3e1) {
    return "";
  }
  if (/^(?:https?:|blob:|data:)/i.test(_0x2ba3e1)) {
    return _0x2ba3e1;
  }
  if (_0x2ba3e1.startsWith("/")) {
    return _0x2ba3e1;
  }
  return "/" + _0x2ba3e1.replace(/^\/+/, "");
}
export function isSameStoryboardImageSrc(_0x5d5359, _0x306fbf) {
  const _0x4921f9 = String(_0x306fbf || "").trim();
  if (!_0x4921f9) {
    return true;
  }
  const _0x52ba09 = String(_0x5d5359 || "").trim();
  if (!_0x52ba09) {
    return false;
  }
  if (_0x52ba09 === _0x4921f9) {
    return true;
  }
  return normalizeStoryboardImageUrl(_0x52ba09) === normalizeStoryboardImageUrl(_0x4921f9);
}
export function getStoryboardCellSourceImageUrl(_0x8178f9) {
  if (!_0x8178f9 || typeof _0x8178f9 !== "object") {
    return "";
  }
  if (isStoryboardCellEmpty(_0x8178f9)) {
    return "";
  }
  const _0x436641 = normalizeStoryboardImageUrl(_0x8178f9.sourceLocalPath) || normalizeStoryboardImageUrl(_0x8178f9.sourceUrl);
  if (_0x436641) {
    return _0x436641;
  }
  return "";
}
export function getStoryboardNodeSourceImageUrl(_0x9344a2) {
  return normalizeStoryboardImageUrl(_0x9344a2?.storyboardSourceLocalPath) || normalizeStoryboardImageUrl(_0x9344a2?.storyboardSourceUrl) || normalizeStoryboardImageUrl(_0x9344a2?.storyboardBackdropLocalPath) || normalizeStoryboardImageUrl(_0x9344a2?.storyboardBackdropUrl) || normalizeStoryboardImageUrl(_0x9344a2?.sourceLocalPath) || normalizeStoryboardImageUrl(_0x9344a2?.sourceUrl);
}
export function getStoryboardNodeSourceContext(_0x6f9475) {
  let _0x201dcb = _0x6f9475?.storyboardSourceLocalPath || _0x6f9475?.storyboardBackdropLocalPath || _0x6f9475?.sourceLocalPath || null;
  let _0x77e8f4 = _0x201dcb ? "" : String(_0x6f9475?.storyboardSourceUrl || _0x6f9475?.storyboardBackdropUrl || _0x6f9475?.sourceUrl || "").trim();
  if (!_0x201dcb && !_0x77e8f4) {
    const _0x2f3870 = Array.isArray(_0x6f9475?.cells) ? _0x6f9475.cells : [];
    for (const _0x5ed308 of _0x2f3870) {
      const _0x505b9a = _0x5ed308?.sourceLocalPath || null;
      const _0x4b1b31 = String(_0x5ed308?.sourceUrl || "").trim();
      if (!_0x505b9a && !_0x4b1b31) {
        continue;
      }
      _0x201dcb = _0x505b9a;
      _0x77e8f4 = _0x505b9a ? "" : _0x4b1b31;
      break;
    }
  }
  return {
    sourceLocalPath: _0x201dcb || null,
    sourceUrl: _0x77e8f4
  };
}
export function getStoryboardPieceSourceImageUrl(_0x493207, _0x5ed5b5) {
  if (isFrozenStoryboardDisplayCell(_0x493207)) {
    return "";
  }
  const _0x9f790a = getStoryboardCellSourceImageUrl(_0x493207);
  if (_0x9f790a) {
    return _0x9f790a;
  }
  if (!_0x493207 || typeof _0x493207 !== "object" || isStoryboardCellEmpty(_0x493207)) {
    return "";
  }
  if (_0x493207.storyboardPiece === true) {
    return getStoryboardNodeSourceImageUrl(_0x5ed5b5);
  }
  return "";
}
export function getStoryboardCellDisplaySrc(_0x406a11) {
  if (isFrozenStoryboardDisplayCell(_0x406a11)) {
    return resolveStoryboardCellPreviewSrc(_0x406a11) || resolveStoryboardCellAssetSrc(_0x406a11);
  }
  const _0x4de6f0 = getStoryboardCellSourceImageUrl(_0x406a11);
  if (_0x4de6f0) {
    return _0x4de6f0;
  }
  return resolveStoryboardCellPreviewSrc(_0x406a11);
}
function isLoadedImageElement(_0x3e4bef) {
  if (!_0x3e4bef || _0x3e4bef.complete !== true) {
    return false;
  }
  const _0x2efdd9 = Math.trunc(Number(_0x3e4bef.naturalWidth) || 0);
  const _0x58e832 = Math.trunc(Number(_0x3e4bef.naturalHeight) || 0);
  return _0x2efdd9 > 0 && _0x58e832 > 0;
}
function rememberStoryboardSourceImage(_0x590dc8, _0x2ee3b6) {
  const _0x55dd56 = String(_0x590dc8 || "").trim();
  if (!_0x55dd56 || !isLoadedImageElement(_0x2ee3b6)) {
    return;
  }
  storyboardSourceImageCache.set(_0x55dd56, _0x2ee3b6);
}
function getCachedStoryboardSourceImage(_0x3f4449) {
  const _0x242cb6 = String(_0x3f4449 || "").trim();
  if (!_0x242cb6) {
    return null;
  }
  const _0x4d805e = storyboardSourceImageCache.get(_0x242cb6) || null;
  if (isLoadedImageElement(_0x4d805e)) {
    return _0x4d805e;
  }
  storyboardSourceImageCache.delete(_0x242cb6);
  return null;
}
function getLoadedStoryboardSourceImage(_0x3ef285, _0x59dc2c, _0x7e144a = "") {
  if (typeof document === "undefined") {
    return null;
  }
  const _0x1a1f3f = document.getElementById("cell-" + _0x3ef285 + "-" + _0x59dc2c);
  const _0x4985fb = _0x1a1f3f?.querySelector?.("img.storyboard-cell-img--source-crop");
  const _0x38f766 = String(_0x7e144a || "").trim();
  if (isLoadedImageElement(_0x4985fb)) {
    const _0x9d780d = String(_0x4985fb.getAttribute?.("src") || _0x4985fb.currentSrc || _0x4985fb.src || "").trim();
    if (!_0x38f766 || !_0x9d780d || _0x9d780d === _0x38f766) {
      rememberStoryboardSourceImage(_0x7e144a, _0x4985fb);
      return _0x4985fb;
    }
  }
  const _0x29bacb = document.getElementById("sb-node-" + _0x3ef285);
  const _0x181cda = _0x29bacb?.querySelector?.(".storyboard-source-backdrop");
  if (!isLoadedImageElement(_0x181cda)) {
    return null;
  }
  if (_0x38f766) {
    const _0x558006 = String(_0x181cda.getAttribute?.("src") || _0x181cda.currentSrc || _0x181cda.src || "").trim();
    if (_0x558006 && _0x558006 !== _0x38f766) {
      return null;
    }
  }
  rememberStoryboardSourceImage(_0x7e144a, _0x181cda);
  return _0x181cda;
}
export function buildStoryboardSourceCropExtractFromImage(_0x4b5512, _0xca7363, _0x38669a, _0x2d1a36, _0x277d40 = _0xca7363) {
  if (!_0x38669a || typeof document === "undefined" || typeof document.createElement !== "function") {
    return null;
  }
  const _0x2e4742 = Math.max(1, Math.trunc(Number(_0x38669a.naturalWidth) || 0));
  const _0x567d90 = Math.max(1, Math.trunc(Number(_0x38669a.naturalHeight) || 0));
  const _0x4551dd = buildStoryboardCropRect(_0x4b5512, _0x277d40, {
    width: _0x2e4742,
    height: _0x567d90,
    inset: 0
  });
  if (!_0x4551dd || _0x4551dd.sw <= 0 || _0x4551dd.sh <= 0) {
    return null;
  }
  const _0x5bd883 = _0x4551dd.sx;
  const _0x3bea1d = _0x4551dd.sy;
  const _0x4673e8 = _0x4551dd.sw;
  const _0x2789c0 = _0x4551dd.sh;
  const _0x1052de = document.createElement("canvas");
  _0x1052de.width = _0x4673e8;
  _0x1052de.height = _0x2789c0;
  const _0x312975 = _0x1052de.getContext("2d", {
    alpha: false
  });
  if (!_0x312975) {
    return null;
  }
  try {
    _0x312975.imageSmoothingEnabled = true;
    _0x312975.imageSmoothingQuality = "high";
    _0x312975.drawImage(_0x38669a, _0x5bd883, _0x3bea1d, _0x4673e8, _0x2789c0, 0, 0, _0x4673e8, _0x2789c0);
    const _0x1f3a82 = _0x1052de.toDataURL("image/jpeg", 0.9);
    if (!String(_0x1f3a82 || "").startsWith("data:image/")) {
      return null;
    }
    return {
      canvas: _0x1052de,
      dataUrl: _0x1f3a82,
      fileName: _0x2d1a36,
      width: _0x4673e8,
      height: _0x2789c0,
      sourceWidth: _0x2e4742,
      sourceHeight: _0x567d90
    };
  } catch {
    return null;
  }
}
export function buildStoryboardSourceCropExtract(_0x4589db, _0x2cd6e8, _0xa1d6f4, _0x563df0) {
  const _0x23f234 = getStoryboardPieceSourceImageUrl(_0xa1d6f4, _0x4589db);
  if (!_0x23f234) {
    return null;
  }
  const _0x16d87a = resolveStoryboardCellSourceIndex(_0xa1d6f4, _0x2cd6e8, _0x4589db);
  const _0x248002 = getLoadedStoryboardSourceImage(_0x4589db?.id, _0x2cd6e8, _0x23f234) || getCachedStoryboardSourceImage(_0x23f234);
  if (!_0x248002) {
    return null;
  }
  return buildStoryboardSourceCropExtractFromImage(_0x4589db, _0x2cd6e8, _0x248002, _0x563df0, _0x16d87a);
}
export function loadStoryboardSourceImage(_0x4eba8c) {
  const _0x1cd67d = getCachedStoryboardSourceImage(_0x4eba8c);
  if (_0x1cd67d) {
    return Promise.resolve(_0x1cd67d);
  }
  if (typeof Image !== "function") {
    return Promise.resolve(null);
  }
  return new Promise(_0x3a87be => {
    const _0x1b0b16 = new Image();
    _0x1b0b16.crossOrigin = "anonymous";
    _0x1b0b16.onload = () => {
      rememberStoryboardSourceImage(_0x4eba8c, _0x1b0b16);
      _0x3a87be(_0x1b0b16);
    };
    _0x1b0b16.onerror = () => _0x3a87be(null);
    _0x1b0b16.src = _0x4eba8c;
  });
}
export function trimStoryboardImageRef(_0x3fba62) {
  return String(_0x3fba62 || "").trim();
}
export function isDataImageRef(_0x305853) {
  return trimStoryboardImageRef(_0x305853).startsWith("data:image/");
}
export function getDataImageExtension(_0x490c3e) {
  const _0x3e1dd3 = String(_0x490c3e || "").match(/^data:(image\/[a-z0-9.+-]+)[;,]/i)?.[1]?.toLowerCase() || "";
  if (_0x3e1dd3.includes("png")) {
    return "png";
  }
  if (_0x3e1dd3.includes("webp")) {
    return "webp";
  }
  if (_0x3e1dd3.includes("gif")) {
    return "gif";
  }
  return "jpg";
}
export function dataImageUrlToBlob(_0x1f064b) {
  const _0x25d8fe = trimStoryboardImageRef(_0x1f064b);
  const _0x42b09e = _0x25d8fe.match(/^data:([^;,]+)?(;base64)?,(.*)$/i);
  if (!_0x42b09e || typeof Blob !== "function") {
    return null;
  }
  const _0x2bff5c = _0x42b09e[1] || "image/jpeg";
  const _0x33dd3d = !!_0x42b09e[2];
  const _0x56eb9f = _0x42b09e[3] || "";
  if (_0x33dd3d) {
    if (typeof atob !== "function") {
      return null;
    }
    try {
      const _0x4913cc = atob(_0x56eb9f);
      const _0x1ebdbe = new Uint8Array(_0x4913cc.length);
      for (let _0x248ac7 = 0; _0x248ac7 < _0x4913cc.length; _0x248ac7 += 1) {
        _0x1ebdbe[_0x248ac7] = _0x4913cc.charCodeAt(_0x248ac7);
      }
      return new Blob([_0x1ebdbe], {
        type: _0x2bff5c
      });
    } catch {
      return null;
    }
  }
  try {
    return new Blob([decodeURIComponent(_0x56eb9f)], {
      type: _0x2bff5c
    });
  } catch {
    return null;
  }
}
function isNonLocalImageRef(_0xec2d1b) {
  return /^(?:https?:|blob:|data:|aic-local-preview:)/i.test(trimStoryboardImageRef(_0xec2d1b));
}
function toStoredStoryboardLocalPath(_0x54a678) {
  const _0x5ac854 = trimStoryboardImageRef(_0x54a678);
  if (!_0x5ac854 || isNonLocalImageRef(_0x5ac854)) {
    return null;
  }
  return _0x5ac854.replace(/^\/+/, "") || null;
}
function isSameStoryboardImageRef(_0x83f22f, _0x72dadc) {
  const _0x3c89fd = trimStoryboardImageRef(_0x83f22f);
  const _0x57e7a1 = trimStoryboardImageRef(_0x72dadc);
  if (!_0x3c89fd || !_0x57e7a1) {
    return false;
  }
  if (_0x3c89fd === _0x57e7a1) {
    return true;
  }
  return normalizeStoryboardImageUrl(_0x3c89fd) === normalizeStoryboardImageUrl(_0x57e7a1);
}
function isStoryboardPayloadSourceContextRef(_0x3ea764, _0x3b7efa) {
  const _0x1f39aa = trimStoryboardImageRef(_0x3ea764);
  if (!_0x1f39aa || !_0x3b7efa || typeof _0x3b7efa !== "object") {
    return false;
  }
  return [_0x3b7efa.sourceLocalPath, _0x3b7efa.sourceUrl, _0x3b7efa.storyboardSourceLocalPath, _0x3b7efa.storyboardSourceUrl].some(_0x38e76a => isSameStoryboardImageRef(_0x1f39aa, _0x38e76a));
}
export function getImageElementDisplaySrc(_0xdc3d55) {
  if (!_0xdc3d55) {
    return "";
  }
  return trimStoryboardImageRef(_0xdc3d55.currentSrc || _0xdc3d55.src || (typeof _0xdc3d55.getAttribute === "function" ? _0xdc3d55.getAttribute("src") : ""));
}
function pickStoryboardCellStoredLocalPath(_0x54d9de, _0x5ce9f5 = "") {
  const _0x8e79c = [_0x54d9de?.localPath, _0x54d9de?.displayLocalPath, _0x54d9de?.originalLocalPath, _0x54d9de?.thumbLocalPath, _0x5ce9f5];
  for (const _0x3b2cfe of _0x8e79c) {
    const _0x5b36d2 = toStoredStoryboardLocalPath(_0x3b2cfe);
    if (_0x5b36d2) {
      return _0x5b36d2;
    }
  }
  return null;
}
function buildStoryboardCellAssetSnapshot(_0x4c6320, _0x47c310, _0x57e815) {
  const _0xd23860 = resolveStoryboardCellAssetSrc(_0x47c310);
  if (!_0xd23860) {
    return null;
  }
  const _0x2330af = isDataImageRef(_0x47c310?.capturePreviewUrl) ? trimStoryboardImageRef(_0x47c310.capturePreviewUrl) : isDataImageRef(_0xd23860) ? trimStoryboardImageRef(_0xd23860) : "";
  const _0x13ab15 = _0x2330af ? null : pickStoryboardCellStoredLocalPath(_0x47c310, _0xd23860);
  const _0x211dee = !_0x13ab15 && !_0x2330af ? _0xd23860 : "";
  const _0x11dbb5 = toPositiveNumber(_0x47c310?.imageWidth) || toPositiveNumber(_0x47c310?.originalWidth) || toPositiveNumber(_0x47c310?.w) || null;
  const _0x39c2c3 = toPositiveNumber(_0x47c310?.imageHeight) || toPositiveNumber(_0x47c310?.originalHeight) || toPositiveNumber(_0x47c310?.h) || null;
  return {
    kind: "asset",
    id: _0x47c310?.id || null,
    src: _0xd23860,
    localPath: _0x13ab15,
    originalLocalPath: _0x2330af ? null : toStoredStoryboardLocalPath(_0x47c310?.originalLocalPath),
    displayLocalPath: _0x2330af ? "" : toStoredStoryboardLocalPath(_0x47c310?.displayLocalPath) || "",
    thumbLocalPath: _0x2330af ? null : toStoredStoryboardLocalPath(_0x47c310?.thumbLocalPath),
    capturePreviewUrl: _0x2330af,
    externalUrl: _0x211dee,
    fileName: trimStoryboardImageRef(_0x47c310?.fileName),
    width: _0x11dbb5,
    height: _0x39c2c3,
    storyboardSourceIndex: resolveStoryboardCellSourceIndex(_0x47c310, _0x57e815, _0x4c6320),
    storyboardExtractedCell: _0x47c310?.storyboardExtractedCell === true,
    storyboardLockedCell: _0x47c310?.storyboardLockedCell === true,
    wasSourceBacked: !!getStoryboardPieceSourceImageUrl(_0x47c310, _0x4c6320)
  };
}
function buildStoryboardCellCropSnapshot(_0x14b7ab, _0x2f8db8, _0x3a6dd3, _0x53ecf9) {
  if (!_0x53ecf9?.dataUrl) {
    return null;
  }
  return {
    kind: "source-crop",
    id: _0x2f8db8?.id || null,
    src: _0x53ecf9.dataUrl,
    localPath: null,
    originalLocalPath: null,
    displayLocalPath: "",
    thumbLocalPath: null,
    capturePreviewUrl: _0x53ecf9.dataUrl,
    externalUrl: "",
    fileName: _0x53ecf9.fileName || "",
    width: _0x53ecf9.width || null,
    height: _0x53ecf9.height || null,
    sourceWidth: _0x53ecf9.sourceWidth || _0x2f8db8?.sourceWidth || null,
    sourceHeight: _0x53ecf9.sourceHeight || _0x2f8db8?.sourceHeight || null,
    storyboardSourceIndex: resolveStoryboardCellSourceIndex(_0x2f8db8, _0x3a6dd3, _0x14b7ab),
    storyboardExtractedCell: false,
    storyboardLockedCell: true,
    crop: _0x53ecf9,
    wasSourceBacked: true
  };
}
export function resolveStoryboardPayloadDisplaySnapshot(_0x2ba53d, _0xa46b7b = {}) {
  if (!_0x2ba53d || typeof _0x2ba53d !== "object") {
    return null;
  }
  const _0x2c1c4a = trimStoryboardImageRef(_0xa46b7b.visibleSrc);
  const _0x357274 = trimStoryboardImageRef(_0x2ba53d.url);
  const _0x178ca5 = isStoryboardPayloadSourceContextRef(_0x357274, _0x2ba53d) ? "" : _0x357274;
  const _0x410c54 = toStoredStoryboardLocalPath(_0x2ba53d.displayLocalPath);
  const _0x22b13e = toStoredStoryboardLocalPath(_0x2ba53d.originalLocalPath) || toStoredStoryboardLocalPath(_0x2ba53d.localPath);
  const _0x5b2152 = _0x410c54 || _0x22b13e;
  const _0x46802e = isDataImageRef(_0x2ba53d.capturePreviewUrl) ? trimStoryboardImageRef(_0x2ba53d.capturePreviewUrl) : isDataImageRef(_0x178ca5) ? _0x178ca5 : "";
  const _0x180408 = _0x46802e || (!_0x5b2152 && isDataImageRef(_0x2c1c4a) ? _0x2c1c4a : "");
  const _0x5f08c3 = _0x180408 ? null : _0x5b2152 || toStoredStoryboardLocalPath(_0x2c1c4a) || toStoredStoryboardLocalPath(_0x2ba53d.thumbLocalPath) || toStoredStoryboardLocalPath(_0x178ca5);
  const _0x2e455e = _0x180408 || normalizeStoryboardImageUrl(_0x5f08c3) || normalizeStoryboardImageUrl(_0x178ca5) || normalizeStoryboardImageUrl(_0x2c1c4a) || normalizeStoryboardImageUrl(_0x2ba53d.thumbLocalPath);
  if (!_0x2e455e) {
    return null;
  }
  const _0x5e7999 = Number(_0x2ba53d.storyboardSourceIndex);
  return {
    kind: "asset",
    src: _0x2e455e,
    localPath: _0x5f08c3,
    originalLocalPath: toStoredStoryboardLocalPath(_0x2ba53d.originalLocalPath),
    displayLocalPath: toStoredStoryboardLocalPath(_0x2ba53d.displayLocalPath) || "",
    thumbLocalPath: toStoredStoryboardLocalPath(_0x2ba53d.thumbLocalPath),
    capturePreviewUrl: _0x180408,
    externalUrl: !_0x5f08c3 && !_0x180408 ? _0x2e455e : "",
    fileName: trimStoryboardImageRef(_0x2ba53d.fileName),
    width: toPositiveNumber(_0x2ba53d.imageWidth) || toPositiveNumber(_0x2ba53d.originalWidth) || null,
    height: toPositiveNumber(_0x2ba53d.imageHeight) || toPositiveNumber(_0x2ba53d.originalHeight) || null,
    ...(Number.isInteger(_0x5e7999) && _0x5e7999 >= 0 ? {
      storyboardSourceIndex: _0x5e7999
    } : {}),
    storyboardExtractedCell: _0x2ba53d.storyboardExtractedCell === true,
    storyboardLockedCell: false
  };
}
export function resolveCollagePayloadDisplaySnapshot(_0x455067, _0x29a3eb = {}) {
  const _0x589796 = resolveStoryboardPayloadDisplaySnapshot(_0x455067, _0x29a3eb);
  if (!_0x589796?.src) {
    return null;
  }
  return {
    src: _0x589796.src,
    localPath: _0x589796.localPath || "",
    thumbLocalPath: _0x589796.thumbLocalPath || null,
    width: _0x589796.width || null,
    height: _0x589796.height || null
  };
}
export function resolveStoryboardCellDisplaySnapshot(_0x1e11c0, _0x458afc, _0x486363, _0x283e5d) {
  if (!_0x458afc || typeof _0x458afc !== "object" || isStoryboardCellEmpty(_0x458afc)) {
    return null;
  }
  const _0xd439ec = buildStoryboardCellAssetSnapshot(_0x1e11c0, _0x458afc, _0x486363);
  if (isFrozenStoryboardDisplayCell(_0x458afc)) {
    return _0xd439ec;
  }
  const _0xe9ae15 = getStoryboardPieceSourceImageUrl(_0x458afc, _0x1e11c0);
  if (!_0xe9ae15) {
    return _0xd439ec;
  }
  const _0x5f5b7c = buildStoryboardSourceCropExtract(_0x1e11c0, _0x486363, _0x458afc, _0x283e5d?.fileName || "storyboard_snapshot_" + (_0x1e11c0?.id || "node") + "_" + _0x486363 + ".jpg");
  return buildStoryboardCellCropSnapshot(_0x1e11c0, _0x458afc, _0x486363, _0x5f5b7c) || _0xd439ec;
}
function getStoryboardCellPositionPatch(_0x301de8, _0x55d14a) {
  return {
    col: _0x55d14a % Math.max(1, Number(_0x301de8?.cols) || 1),
    row: Math.floor(_0x55d14a / Math.max(1, Number(_0x301de8?.cols) || 1))
  };
}
function getStoryboardCellSourceIndexPatch(_0x381da6, _0x587cde, _0x84cea6) {
  return {
    storyboardSourceIndex: resolveStoryboardCellSourceIndex(_0x381da6, _0x84cea6, _0x587cde)
  };
}
function cloneStoryboardCellForGridPosition(_0x18745a, _0x32cdcf, _0x34b090) {
  return {
    ...(_0x18745a && typeof _0x18745a === "object" ? _0x18745a : {}),
    ...getStoryboardCellSourceIndexPatch(_0x18745a, _0x32cdcf, _0x34b090),
    ...getStoryboardCellPositionPatch(_0x32cdcf, _0x34b090)
  };
}
function buildLockedStoryboardCellFromCrop(_0xde41d5, _0x23a030, _0x5ee190, _0x48ef52) {
  if (!_0x48ef52?.dataUrl) {
    return null;
  }
  return detachStoryboardCellSourceContext({
    ...(_0xde41d5 && typeof _0xde41d5 === "object" ? _0xde41d5 : {}),
    ...getStoryboardCellSourceIndexPatch(_0xde41d5, _0x23a030, _0x5ee190),
    ...getStoryboardCellPositionPatch(_0x23a030, _0x5ee190),
    url: "",
    localPath: null,
    originalLocalPath: null,
    displayLocalPath: "",
    thumbLocalPath: "",
    thumbUrl: "",
    thumbId: null,
    capturePreviewUrl: _0x48ef52.dataUrl,
    fileName: _0x48ef52.fileName || "",
    originalWidth: _0x48ef52.width,
    originalHeight: _0x48ef52.height,
    imageWidth: _0x48ef52.width,
    imageHeight: _0x48ef52.height,
    w: _0x48ef52.width,
    h: _0x48ef52.height,
    sourceWidth: _0x48ef52.sourceWidth || _0xde41d5?.sourceWidth || null,
    sourceHeight: _0x48ef52.sourceHeight || _0xde41d5?.sourceHeight || null,
    storyboardLockedCell: true,
    storyboardExtractedCell: false,
    isEmpty: false
  }, {
    locked: true,
    extracted: false
  });
}
export function buildFrozenStoryboardCellFromSnapshot(_0x315bf7, _0x24fdb0, _0x503532, _0x499a3d = {}) {
  const _0x289464 = trimStoryboardImageRef(_0x315bf7?.src);
  if (!_0x289464) {
    return null;
  }
  const _0x37a949 = isDataImageRef(_0x315bf7.capturePreviewUrl) ? trimStoryboardImageRef(_0x315bf7.capturePreviewUrl) : isDataImageRef(_0x289464) ? _0x289464 : "";
  const _0x31d9f4 = _0x37a949 ? null : toStoredStoryboardLocalPath(_0x315bf7.localPath) || toStoredStoryboardLocalPath(_0x289464);
  const _0x727eb9 = !_0x31d9f4 && !_0x37a949 ? trimStoryboardImageRef(_0x315bf7.externalUrl || _0x289464) : "";
  const _0x35a2cd = toPositiveNumber(_0x315bf7.width) || toPositiveNumber(_0x315bf7.imageWidth) || toPositiveNumber(_0x315bf7.originalWidth) || null;
  const _0x4a587d = toPositiveNumber(_0x315bf7.height) || toPositiveNumber(_0x315bf7.imageHeight) || toPositiveNumber(_0x315bf7.originalHeight) || null;
  const _0x2ba1cd = Number(_0x315bf7.storyboardSourceIndex);
  return {
    ...(_0x499a3d.id ? {
      id: _0x499a3d.id
    } : _0x315bf7.id ? {
      id: _0x315bf7.id
    } : {}),
    url: _0x727eb9 || "",
    localPath: _0x31d9f4,
    originalLocalPath: _0x37a949 ? null : toStoredStoryboardLocalPath(_0x315bf7.originalLocalPath),
    displayLocalPath: _0x37a949 ? "" : toStoredStoryboardLocalPath(_0x315bf7.displayLocalPath) || "",
    thumbLocalPath: _0x37a949 ? null : toStoredStoryboardLocalPath(_0x315bf7.thumbLocalPath),
    thumbUrl: "",
    thumbId: null,
    capturePreviewUrl: _0x37a949,
    fileName: trimStoryboardImageRef(_0x315bf7.fileName),
    originalWidth: _0x35a2cd,
    originalHeight: _0x4a587d,
    imageWidth: _0x35a2cd,
    imageHeight: _0x4a587d,
    w: _0x35a2cd,
    h: _0x4a587d,
    sourceId: null,
    sourceLocalPath: null,
    sourceUrl: "",
    sourceWidth: null,
    sourceHeight: null,
    storyboardSourceCrop: false,
    storyboardPiece: false,
    storyboardExtractedCell: _0x315bf7.storyboardExtractedCell === true,
    storyboardLockedCell: _0x315bf7.storyboardLockedCell === true || _0x315bf7.kind === "source-crop" || _0x499a3d.locked === true,
    ...(Number.isInteger(_0x2ba1cd) && _0x2ba1cd >= 0 ? {
      storyboardSourceIndex: _0x2ba1cd
    } : {}),
    isEmpty: false,
    ...getStoryboardCellPositionPatch(_0x24fdb0, _0x503532)
  };
}
export function buildEmptyStoryboardCellForSlot(_0x37fa86, _0x367cc9, _0x48dac3) {
  return normalizeEmptyStoryboardCell({
    ...(_0x37fa86 && typeof _0x37fa86 === "object" ? _0x37fa86 : {}),
    sourceId: null,
    sourceLocalPath: null,
    sourceUrl: "",
    sourceWidth: null,
    sourceHeight: null,
    storyboardSourceCrop: false,
    storyboardPiece: false,
    storyboardLockedCell: false,
    ...getStoryboardCellPositionPatch(_0x367cc9, _0x48dac3)
  });
}
function updateStoryboardSwapCells(_0x3e71a0, _0xd2eae4, _0x668ced, _0x53f26d, _0x349fe6) {
  if (_0xd2eae4.id === _0x668ced.id) {
    if (typeof _0x3e71a0.updateNodeData !== "function") {
      return false;
    }
    _0x3e71a0.updateNodeData(_0xd2eae4.id, {
      cells: _0x53f26d
    });
    return true;
  }
  if (typeof _0x3e71a0.updateNodesData === "function") {
    _0x3e71a0.updateNodesData({
      [_0xd2eae4.id]: {
        cells: _0x53f26d
      },
      [_0x668ced.id]: {
        cells: _0x349fe6
      }
    });
    return true;
  }
  if (typeof _0x3e71a0.updateNodeData !== "function") {
    return false;
  }
  _0x3e71a0.updateNodeData(_0xd2eae4.id, {
    cells: _0x53f26d
  });
  _0x3e71a0.updateNodeData(_0x668ced.id, {
    cells: _0x349fe6
  });
  return true;
}
export function swapStoryboardCellsWithDisplaySnapshots({
  store: _0xafe73a,
  sourceNode: _0x27c45,
  sourceCellIndex: _0x9d3395,
  targetNode: _0x483486,
  targetCellIndex: _0x3e8d5f,
  sourceSnapshot = null,
  targetSnapshot = null
}) {
  if (!_0x27c45 || !_0x483486) {
    return false;
  }
  const _0x3b0681 = _0x27c45.cells?.[_0x9d3395];
  const _0x18cec0 = _0x483486.cells?.[_0x3e8d5f];
  if (!sourceSnapshot) {
    sourceSnapshot = resolveStoryboardCellDisplaySnapshot(_0x27c45, _0x3b0681, _0x9d3395);
  }
  if (!sourceSnapshot) {
    return false;
  }
  const _0x6485e = _0x18cec0 && !isStoryboardCellEmpty(_0x18cec0);
  if (_0x6485e && !targetSnapshot) {
    targetSnapshot = resolveStoryboardCellDisplaySnapshot(_0x483486, _0x18cec0, _0x3e8d5f);
  }
  if (_0x6485e && !targetSnapshot) {
    return false;
  }
  const _0x2a7d01 = [...(_0x27c45.cells || [])];
  const _0x5699aa = _0x27c45.id === _0x483486.id ? _0x2a7d01 : [...(_0x483486.cells || [])];
  _0x5699aa[_0x3e8d5f] = buildFrozenStoryboardCellFromSnapshot(sourceSnapshot, _0x483486, _0x3e8d5f);
  _0x2a7d01[_0x9d3395] = _0x6485e ? buildFrozenStoryboardCellFromSnapshot(targetSnapshot, _0x27c45, _0x9d3395) : buildEmptyStoryboardCellForSlot(_0x3b0681, _0x27c45, _0x9d3395);
  if (!_0x5699aa[_0x3e8d5f] || _0x6485e && !_0x2a7d01[_0x9d3395]) {
    return false;
  }
  return updateStoryboardSwapCells(_0xafe73a, _0x27c45, _0x483486, _0x2a7d01, _0x5699aa);
}
export function lockStoryboardCellForCurrentGrid(_0x4df074, _0x4ad957, _0x313a43) {
  const _0x400086 = _0x4df074?.cells?.[_0x4ad957];
  if (!_0x400086 || isStoryboardCellEmpty(_0x400086)) {
    return normalizeEmptyStoryboardCell({
      ...(_0x400086 && typeof _0x400086 === "object" ? _0x400086 : {}),
      ...getStoryboardCellPositionPatch(_0x4df074, _0x4ad957)
    });
  }
  const _0x4f8633 = buildStoryboardSourceCropExtract(_0x4df074, _0x4ad957, _0x400086, _0x313a43);
  if (_0x4f8633?.dataUrl) {
    return buildLockedStoryboardCellFromCrop(_0x400086, _0x4df074, _0x4ad957, _0x4f8633);
  }
  if (_0x400086.storyboardLockedCell === true || _0x400086.storyboardExtractedCell === true) {
    return cloneStoryboardCellForGridPosition(_0x400086, _0x4df074, _0x4ad957);
  }
  if (getStoryboardPieceSourceImageUrl(_0x400086, _0x4df074)) {
    return null;
  }
  return cloneStoryboardCellForGridPosition(_0x400086, _0x4df074, _0x4ad957);
}
export function swapStoryboardCellsWithLockedBlocks({
  store: _0x32a01c,
  sourceNode: _0x8e969c,
  sourceCellIndex: _0x542cd5,
  targetNode: _0x4cfd8e,
  targetCellIndex: _0x424db3
}) {
  if (!_0x8e969c || !_0x4cfd8e) {
    return false;
  }
  const _0x5b5fbc = _0x8e969c.cells?.[_0x542cd5];
  const _0x568080 = _0x4cfd8e.cells?.[_0x424db3];
  const _0x9568f7 = !!getStoryboardPieceSourceImageUrl(_0x5b5fbc, _0x8e969c);
  const _0x3525f7 = _0x568080 && !isStoryboardCellEmpty(_0x568080) ? !!getStoryboardPieceSourceImageUrl(_0x568080, _0x4cfd8e) : false;
  if (!_0x9568f7 && !_0x3525f7) {
    return false;
  }
  if (_0x8e969c.id === _0x4cfd8e.id && typeof _0x32a01c.updateNodeData !== "function") {
    return false;
  }
  if (_0x8e969c.id !== _0x4cfd8e.id && typeof _0x32a01c.updateNodesData !== "function") {
    return false;
  }
  const _0xc4337 = lockStoryboardCellForCurrentGrid(_0x8e969c, _0x542cd5, "storyboard_lock_" + _0x8e969c.id + "_" + _0x542cd5 + ".jpg");
  if (!_0xc4337 || isStoryboardCellEmpty(_0xc4337)) {
    return false;
  }
  const _0x1a16d2 = lockStoryboardCellForCurrentGrid(_0x4cfd8e, _0x424db3, "storyboard_lock_" + _0x4cfd8e.id + "_" + _0x424db3 + ".jpg");
  if (_0x568080 && !isStoryboardCellEmpty(_0x568080) && !_0x1a16d2) {
    return false;
  }
  if (_0x8e969c.id === _0x4cfd8e.id) {
    const _0x56f4b4 = [...(_0x8e969c.cells || [])];
    _0x56f4b4[_0x424db3] = {
      ..._0xc4337,
      ...getStoryboardCellPositionPatch(_0x8e969c, _0x424db3)
    };
    _0x56f4b4[_0x542cd5] = _0x568080 && !isStoryboardCellEmpty(_0x568080) ? {
      ..._0x1a16d2,
      ...getStoryboardCellPositionPatch(_0x8e969c, _0x542cd5)
    } : normalizeEmptyStoryboardCell({
      ..._0x5b5fbc,
      ...getStoryboardCellPositionPatch(_0x8e969c, _0x542cd5)
    });
    _0x32a01c.updateNodeData(_0x8e969c.id, {
      cells: _0x56f4b4
    });
    return true;
  }
  const _0x505b6b = [...(_0x8e969c.cells || [])];
  const _0x45be00 = [...(_0x4cfd8e.cells || [])];
  _0x45be00[_0x424db3] = {
    ..._0xc4337,
    ...getStoryboardCellPositionPatch(_0x4cfd8e, _0x424db3)
  };
  _0x505b6b[_0x542cd5] = _0x568080 && !isStoryboardCellEmpty(_0x568080) ? {
    ..._0x1a16d2,
    ...getStoryboardCellPositionPatch(_0x8e969c, _0x542cd5)
  } : normalizeEmptyStoryboardCell({
    ..._0x5b5fbc,
    ...getStoryboardCellPositionPatch(_0x8e969c, _0x542cd5)
  });
  _0x32a01c.updateNodesData({
    [_0x8e969c.id]: {
      cells: _0x505b6b
    },
    [_0x4cfd8e.id]: {
      cells: _0x45be00
    }
  });
  return true;
}
export function requiresLockedStoryboardSwap({
  sourceNode: _0x4bf49f,
  sourceCellIndex: _0x3961d4,
  targetNode: _0x248fdb,
  targetCellIndex: _0x445a7b
}) {
  const _0xfec5d = _0x4bf49f?.cells?.[_0x3961d4];
  const _0x1d3eb5 = _0x248fdb?.cells?.[_0x445a7b];
  return !!getStoryboardPieceSourceImageUrl(_0xfec5d, _0x4bf49f) || !!_0x1d3eb5 && !isStoryboardCellEmpty(_0x1d3eb5) && !!getStoryboardPieceSourceImageUrl(_0x1d3eb5, _0x248fdb);
}