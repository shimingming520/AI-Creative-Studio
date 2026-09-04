import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
export const DEFAULT_VIDEO_FRAME_CAPTURE_FPS = 24;
export function getVideoFrameSource(_0x2ec20b) {
  return String(_0x2ec20b?.currentSrc || _0x2ec20b?.src || _0x2ec20b?.getAttribute?.("src") || "").trim();
}
export function isVideoFrameReady(_0x1e3c2e) {
  return !!getVideoFrameSource(_0x1e3c2e) && _0x1e3c2e?.seeking !== true && Number(_0x1e3c2e?.readyState || 0) >= 2 && Number(_0x1e3c2e?.videoWidth || 0) > 0 && Number(_0x1e3c2e?.videoHeight || 0) > 0;
}
function drawVideoFrameToCanvas(_0x43bb8c) {
  if (!isVideoFrameReady(_0x43bb8c)) {
    throw new Error("video frame is not ready");
  }
  const _0x4feff8 = Math.max(1, Math.trunc(Number(_0x43bb8c.videoWidth) || 0));
  const _0x3addc2 = Math.max(1, Math.trunc(Number(_0x43bb8c.videoHeight) || 0));
  const _0x372962 = document.createElement("canvas");
  _0x372962.width = _0x4feff8;
  _0x372962.height = _0x3addc2;
  const _0x346fad = _0x372962.getContext("2d");
  if (!_0x346fad) {
    throw new Error("canvas context is unavailable");
  }
  _0x346fad.drawImage(_0x43bb8c, 0, 0, _0x4feff8, _0x3addc2);
  return {
    canvas: _0x372962,
    width: _0x4feff8,
    height: _0x3addc2
  };
}
function dataUrlToBlob(_0x654c12) {
  const _0x5994ba = String(_0x654c12 || "");
  const _0x18d2fc = _0x5994ba.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!_0x18d2fc) {
    throw new Error("invalid data url");
  }
  const _0x26156f = _0x18d2fc[1] || "application/octet-stream";
  const _0x431a43 = _0x18d2fc[3] || "";
  const _0x234e7a = _0x18d2fc[2] ? atob(_0x431a43) : decodeURIComponent(_0x431a43);
  const _0x275047 = new Uint8Array(_0x234e7a.length);
  for (let _0x5984da = 0; _0x5984da < _0x234e7a.length; _0x5984da += 1) {
    _0x275047[_0x5984da] = _0x234e7a.charCodeAt(_0x5984da);
  }
  return new Blob([_0x275047], {
    type: _0x26156f
  });
}
function extFromImageType(_0x202f80) {
  const _0x39561c = String(_0x202f80 || "").toLowerCase();
  if (_0x39561c.includes("jpeg") || _0x39561c.includes("jpg")) {
    return "jpg";
  }
  if (_0x39561c.includes("webp")) {
    return "webp";
  }
  return "png";
}
function normalizeFrameIndex(_0x130544) {
  const _0x5c73c8 = Number(_0x130544);
  if (!Number.isFinite(_0x5c73c8) || _0x5c73c8 <= 0) {
    return 1;
  }
  return Math.max(1, Math.round(_0x5c73c8));
}
export function resolveVideoFrameCaptureIndex(_0x2ab6f8, {
  currentTimeSec = 0,
  fallbackDurationSec = 0,
  fallbackFrameRate = 0
} = {}) {
  const _0x564928 = Number(_0x2ab6f8?.videoFps);
  const _0x1cf79e = Number(_0x2ab6f8?.videoFrameCount);
  const _0x26b828 = Number(_0x2ab6f8?.videoDuration);
  const _0x47cb7f = Number.isFinite(_0x26b828) && _0x26b828 > 0 ? _0x26b828 : Number(fallbackDurationSec);
  const _0x5e2111 = Number(fallbackFrameRate);
  const _0x4cccf0 = Number.isFinite(_0x564928) && _0x564928 > 0 ? _0x564928 : Number.isFinite(_0x1cf79e) && _0x1cf79e > 0 && Number.isFinite(_0x47cb7f) && _0x47cb7f > 0 ? _0x1cf79e / _0x47cb7f : Number.isFinite(_0x5e2111) && _0x5e2111 > 0 ? _0x5e2111 : 0;
  if (Number.isFinite(_0x4cccf0) && _0x4cccf0 > 0) {
    let _0x4ad1fe = Math.floor(Math.max(0, Number(currentTimeSec) || 0) * _0x4cccf0) + 1;
    if (Number.isFinite(_0x1cf79e) && _0x1cf79e > 0) {
      _0x4ad1fe = Math.max(1, Math.min(Math.round(_0x1cf79e), _0x4ad1fe));
    } else {
      _0x4ad1fe = Math.max(1, _0x4ad1fe);
    }
    return {
      frameIndex: _0x4ad1fe,
      nextSnapSeq: null,
      usedSequence: false
    };
  }
  const _0x399adb = Math.max(1, Math.floor(Number(_0x2ab6f8?.snapSeq) || 0) + 1);
  return {
    frameIndex: _0x399adb,
    nextSnapSeq: _0x399adb,
    usedSequence: true
  };
}
export function buildVideoFrameCaptureNodeName(_0x2bef43, {
  frameIndex: _0x5cdeeb,
  fallbackName = "",
  formatSourceFrameName: _0x31f15c
} = {}) {
  const _0x53b588 = normalizeFrameIndex(_0x5cdeeb);
  const _0x20bc48 = String(fallbackName || "").trim();
  const _0x2c455b = String(_0x2bef43?.name || "").trim();
  if (!_0x2c455b) {
    return _0x20bc48;
  }
  if (typeof _0x31f15c === "function") {
    const _0x5d7c24 = String(_0x31f15c({
      sourceName: _0x2c455b,
      frameIndex: _0x53b588
    }) || "").trim();
    if (_0x5d7c24) {
      return _0x5d7c24;
    }
  }
  return _0x20bc48 || _0x2c455b + "." + _0x53b588;
}
export function waitForVideoFrame(_0x1802a7, {
  timeoutMs = 2500
} = {}) {
  if (isVideoFrameReady(_0x1802a7)) {
    return Promise.resolve(true);
  }
  if (!getVideoFrameSource(_0x1802a7)) {
    return Promise.resolve(false);
  }
  return new Promise(_0x79d5df => {
    let _0x53fdc0 = false;
    const _0x5d2f23 = ["loadeddata", "canplay", "canplaythrough", "seeked", "timeupdate"];
    const _0x1b23c4 = _0x59f695 => {
      if (_0x53fdc0) {
        return;
      }
      _0x53fdc0 = true;
      clearTimeout(_0x149f57);
      for (const _0x504975 of _0x5d2f23) {
        _0x1802a7.removeEventListener?.(_0x504975, _0xa6cb30);
      }
      _0x1802a7.removeEventListener?.("error", _0x388b12);
      _0x1802a7.removeEventListener?.("abort", _0x388b12);
      _0x79d5df(_0x59f695 === true);
    };
    const _0xa6cb30 = () => {
      if (isVideoFrameReady(_0x1802a7)) {
        _0x1b23c4(true);
      }
    };
    const _0x388b12 = () => _0x1b23c4(false);
    const _0x149f57 = setTimeout(() => _0x1b23c4(isVideoFrameReady(_0x1802a7)), timeoutMs);
    for (const _0x25992c of _0x5d2f23) {
      _0x1802a7.addEventListener?.(_0x25992c, _0xa6cb30);
    }
    _0x1802a7.addEventListener?.("error", _0x388b12);
    _0x1802a7.addEventListener?.("abort", _0x388b12);
    if (Number(_0x1802a7.readyState || 0) < 1) {
      try {
        _0x1802a7.load?.();
      } catch {}
    }
  });
}
export function captureVideoFrameDataUrl(_0x16c763, {
  type = "image/png",
  quality: _0x5a445b
} = {}) {
  const {
    canvas: _0x1b45a7
  } = drawVideoFrameToCanvas(_0x16c763);
  return _0x1b45a7.toDataURL(type, _0x5a445b);
}
export async function captureVideoFrameBlob(_0x5ddfa6, {
  type = "image/png",
  quality: _0x180b11
} = {}) {
  const {
    canvas: _0x2c209a
  } = drawVideoFrameToCanvas(_0x5ddfa6);
  if (typeof _0x2c209a.toBlob === "function") {
    const _0xe9d44d = await new Promise(_0x23f911 => {
      _0x2c209a.toBlob(_0x23f911, type, _0x180b11);
    });
    if (!_0xe9d44d) {
      throw new Error("video frame blob export failed");
    }
    return _0xe9d44d;
  }
  return dataUrlToBlob(_0x2c209a.toDataURL(type, _0x180b11));
}
export async function captureVideoFrameSnapshot(_0x367001, {
  type = "image/png",
  quality: _0x2d2ebb,
  fileNamePrefix = "video_frame"
} = {}) {
  const _0x3e4aa9 = Math.max(1, Math.trunc(Number(_0x367001?.videoWidth) || 0));
  const _0xed3779 = Math.max(1, Math.trunc(Number(_0x367001?.videoHeight) || 0));
  const _0x49ec16 = extFromImageType(type);
  const _0x25d279 = fileNamePrefix + "_" + Date.now() + "." + _0x49ec16;
  const _0x19e77f = await captureVideoFrameBlob(_0x367001, {
    type: type,
    quality: _0x2d2ebb
  });
  return {
    blob: _0x19e77f,
    width: _0x3e4aa9,
    height: _0xed3779,
    originalWidth: _0x3e4aa9,
    originalHeight: _0xed3779,
    type: _0x19e77f.type || type,
    ext: _0x49ec16,
    fileName: _0x25d279
  };
}
export async function saveVideoFrameSnapshot(_0xe17133, _0x541562) {
  if (typeof _0x541562 !== "function") {
    throw new Error("saveOutputBlob is required");
  }
  if (!_0xe17133?.blob) {
    throw new Error("video frame snapshot is required");
  }
  const _0x40178d = String(_0xe17133.type || _0xe17133.blob.type || "image/png");
  const _0x2e961e = String(_0xe17133.ext || extFromImageType(_0x40178d));
  const _0x235c4b = String(_0xe17133.fileName || "video_frame_" + Date.now() + "." + _0x2e961e);
  const _0x37a200 = Math.max(1, Math.trunc(Number(_0xe17133.width || _0xe17133.originalWidth) || 0));
  const _0x1d423b = Math.max(1, Math.trunc(Number(_0xe17133.height || _0xe17133.originalHeight) || 0));
  const _0x5f3fb5 = typeof File === "function" ? new File([_0xe17133.blob], _0x235c4b, {
    type: _0x40178d
  }) : _0xe17133.blob;
  const _0x47edc4 = await _0x541562(_0x5f3fb5, {
    ext: _0x2e961e
  });
  const _0x470995 = pickResultLocalPath(_0x47edc4);
  const _0x260474 = String(_0x47edc4?.url || "").trim() || localPathToUrl(_0x470995);
  if (!_0x260474 || !_0x470995) {
    throw new Error("saved video frame did not return a local image path");
  }
  const _0x295d00 = normalizeLocalPath(_0x47edc4?.originalLocalPath || _0x470995);
  const _0x4a9fbe = normalizeLocalPath(_0x47edc4?.displayLocalPath);
  const _0x14d2c3 = normalizeLocalPath(_0x47edc4?.thumbLocalPath);
  return {
    src: _0x260474,
    localPath: _0x470995,
    originalLocalPath: _0x295d00,
    displayLocalPath: _0x4a9fbe,
    thumbLocalPath: _0x14d2c3,
    originalWidth: Number(_0x47edc4?.originalWidth || _0x37a200) || _0x37a200,
    originalHeight: Number(_0x47edc4?.originalHeight || _0x1d423b) || _0x1d423b,
    fileName: _0x47edc4?.filename || _0x235c4b
  };
}
export function createVideoFrameCapturePreviewUrl(_0x2291b3, {
  urlApi = globalThis.window?.URL || globalThis.URL
} = {}) {
  if (!_0x2291b3 || typeof urlApi?.createObjectURL !== "function") {
    return "";
  }
  try {
    return urlApi.createObjectURL(_0x2291b3);
  } catch {
    return "";
  }
}
export function startVideoFrameSnapshotPersistence(_0x2a2fa5, _0x174597, {
  onPreview: _0x411c6f
} = {}) {
  if (!_0x2a2fa5?.blob) {
    throw new Error("video frame snapshot is required");
  }
  const _0x4fcac0 = createVideoFrameCapturePreviewUrl(_0x2a2fa5.blob);
  if (typeof _0x411c6f === "function") {
    _0x411c6f({
      previewUrl: _0x4fcac0,
      snapshot: _0x2a2fa5
    });
  }
  const _0x1784c5 = Promise.resolve().then(() => saveVideoFrameSnapshot(_0x2a2fa5, _0x174597));
  return {
    previewUrl: _0x4fcac0,
    savePromise: _0x1784c5
  };
}
export async function saveVideoFrameCapture(_0x5bcf09, _0x2a1a1c, {
  type = "image/png",
  quality: _0x1be528,
  fileNamePrefix = "video_frame"
} = {}) {
  const _0x1e88ac = await captureVideoFrameSnapshot(_0x5bcf09, {
    type: type,
    quality: _0x1be528,
    fileNamePrefix: fileNamePrefix
  });
  return saveVideoFrameSnapshot(_0x1e88ac, _0x2a1a1c);
}