import { extractStoryboardVideoFramesFromServer } from "../../api/storyboardVideoFrameApi.js";
import { waitForVideoFrame } from "../components/videoFrameCapture.js";
import { attachMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
const VIDEO_CLIP_THUMB_METADATA_TIMEOUT_MS = 8000;
const VIDEO_CLIP_THUMB_SEEK_TIMEOUT_MS = 1600;
function normalizeText(_0x35b627) {
  return String(_0x35b627 || "").trim();
}
function getVideoSource(_0x151f82) {
  return normalizeText(_0x151f82?.getAttribute?.("src") || _0x151f82?.currentSrc || _0x151f82?.src);
}
function resolveFrameUrl(_0x1e2d02) {
  return normalizeText(_0x1e2d02?.url || _0x1e2d02?.localUrl) || localPathToUrl(_0x1e2d02?.localPath || _0x1e2d02?.path);
}
function setThumbState(_0x25964a, _0x1460e7) {
  for (const _0x54b986 of Array.isArray(_0x25964a) ? _0x25964a : []) {
    if (_0x54b986?.dataset) {
      _0x54b986.dataset.thumbnailState = _0x1460e7;
    }
  }
}
function setThumbBackground(_0x1a9c6d, _0x116bbb, _0x1b6b08 = "") {
  const _0x57df9b = normalizeText(_0x116bbb);
  if (!_0x1a9c6d?.style || !_0x57df9b) {
    return false;
  }
  const _0x5d784f = [_0x57df9b, normalizeText(_0x1b6b08)].filter(Boolean).filter((_0x5d9509, _0x52f141, _0x324067) => _0x324067.indexOf(_0x5d9509) === _0x52f141);
  _0x1a9c6d.style.backgroundImage = _0x5d784f.map(_0x21f272 => "url(" + JSON.stringify(_0x21f272) + ")").join(", ");
  return true;
}
export function paintVideoClipThumbnailUrls(_0x26dc20, _0x2b1b9c, _0x216841 = "ready") {
  const _0x47257b = Array.isArray(_0x26dc20) ? _0x26dc20 : [];
  const _0x1ec8ee = (Array.isArray(_0x2b1b9c) ? _0x2b1b9c : [_0x2b1b9c]).map(normalizeText).filter(Boolean);
  if (!_0x47257b.length || !_0x1ec8ee.length) {
    return 0;
  }
  for (let _0x4078e7 = 0; _0x4078e7 < _0x47257b.length; _0x4078e7 += 1) {
    const _0x2d509c = Math.min(_0x1ec8ee.length - 1, Math.floor((_0x4078e7 + 0.5) * _0x1ec8ee.length / _0x47257b.length));
    setThumbBackground(_0x47257b[_0x4078e7], _0x1ec8ee[_0x2d509c], _0x1ec8ee[0]);
  }
  setThumbState(_0x47257b, _0x216841);
  return _0x47257b.length;
}
function waitForLoadedMetadata(_0x2e934a, _0x489916) {
  if (Number(_0x2e934a?.readyState || 0) >= 1) {
    return Promise.resolve(true);
  }
  return new Promise((_0x53c00e, _0x421da0) => {
    let _0x496a3c = false;
    let _0x4428bd = null;
    const _0x4d005a = () => {
      _0x2e934a.removeEventListener?.("loadedmetadata", _0x12ce72);
      _0x2e934a.removeEventListener?.("durationchange", _0x12ce72);
      _0x2e934a.removeEventListener?.("error", _0x51dc80);
      _0x2e934a.removeEventListener?.("abort", _0x51dc80);
      if (_0x4428bd) {
        globalThis.clearTimeout(_0x4428bd);
      }
    };
    const _0x493a2f = _0x4af77a => {
      if (_0x496a3c) {
        return;
      }
      _0x496a3c = true;
      _0x4d005a();
      if (_0x4af77a) {
        _0x421da0(_0x4af77a);
      } else {
        _0x53c00e(true);
      }
    };
    const _0x12ce72 = () => _0x493a2f();
    const _0x51dc80 = () => _0x493a2f(new Error("video thumbnail source failed to load"));
    _0x2e934a.addEventListener?.("loadedmetadata", _0x12ce72);
    _0x2e934a.addEventListener?.("durationchange", _0x12ce72);
    _0x2e934a.addEventListener?.("error", _0x51dc80);
    _0x2e934a.addEventListener?.("abort", _0x51dc80);
    _0x4428bd = globalThis.setTimeout(() => _0x493a2f(new Error("video thumbnail metadata timed out")), _0x489916);
  });
}
function seekVideo(_0x51e2bc, _0xe7d1da, _0x4e8d5f) {
  const _0x4a8fad = Math.max(0, Number(_0xe7d1da) || 0);
  if (Math.abs((Number(_0x51e2bc?.currentTime) || 0) - _0x4a8fad) <= 0.02 && Number(_0x51e2bc?.readyState || 0) >= 2 && _0x51e2bc?.seeking !== true) {
    return Promise.resolve(true);
  }
  return new Promise((_0x53079e, _0x40bd8e) => {
    let _0x25500b = false;
    let _0x4f0f6b = null;
    const _0x14a2f2 = () => {
      _0x51e2bc.removeEventListener?.("seeked", _0x49e5b0);
      _0x51e2bc.removeEventListener?.("timeupdate", _0x49e5b0);
      _0x51e2bc.removeEventListener?.("error", _0x4811e3);
      _0x51e2bc.removeEventListener?.("abort", _0x4811e3);
      if (_0x4f0f6b) {
        globalThis.clearTimeout(_0x4f0f6b);
      }
    };
    const _0xd3c08 = _0x304814 => {
      if (_0x25500b) {
        return;
      }
      _0x25500b = true;
      _0x14a2f2();
      if (_0x304814) {
        _0x40bd8e(_0x304814);
      } else {
        _0x53079e(true);
      }
    };
    const _0x49e5b0 = () => {
      if (_0x51e2bc?.seeking !== true) {
        _0xd3c08();
      }
    };
    const _0x4811e3 = () => _0xd3c08(new Error("video thumbnail seek failed"));
    _0x51e2bc.addEventListener?.("seeked", _0x49e5b0);
    _0x51e2bc.addEventListener?.("timeupdate", _0x49e5b0);
    _0x51e2bc.addEventListener?.("error", _0x4811e3);
    _0x51e2bc.addEventListener?.("abort", _0x4811e3);
    _0x4f0f6b = globalThis.setTimeout(() => _0xd3c08(new Error("video thumbnail seek timed out")), _0x4e8d5f);
    try {
      _0x51e2bc.currentTime = _0x4a8fad;
    } catch (_0x148f7d) {
      _0xd3c08(_0x148f7d instanceof Error ? _0x148f7d : new Error(String(_0x148f7d)));
    }
  });
}
export async function extractClientVideoClipFrameUrls({
  src: _0x2f922c,
  count: _0x430152,
  isCurrent = () => true,
  documentRef = globalThis.document,
  attachMediaSource = attachMediaElementPlaybackSource,
  waitForFrame = waitForVideoFrame
} = {}) {
  const _0x220165 = normalizeText(_0x2f922c);
  const _0xe6121d = Math.max(1, Math.trunc(Number(_0x430152) || 0));
  if (!_0x220165 || !documentRef?.createElement) {
    return [];
  }
  const _0x2a9555 = documentRef.createElement("video");
  _0x2a9555.muted = true;
  _0x2a9555.playsInline = true;
  _0x2a9555.preload = "auto";
  _0x2a9555.crossOrigin = "anonymous";
  _0x2a9555.setAttribute?.("aria-hidden", "true");
  if (_0x2a9555.style) {
    _0x2a9555.style.position = "fixed";
    _0x2a9555.style.left = "-10000px";
    _0x2a9555.style.top = "-10000px";
    _0x2a9555.style.width = "1px";
    _0x2a9555.style.height = "1px";
    _0x2a9555.style.opacity = "0";
    _0x2a9555.style.pointerEvents = "none";
  }
  documentRef.body?.appendChild?.(_0x2a9555);
  let _0x3528ef = null;
  try {
    await attachMediaSource(_0x2a9555, _0x220165, {
      preload: "auto"
    });
    if (!getVideoSource(_0x2a9555)) {
      throw new Error("video thumbnail source is empty");
    }
    await waitForLoadedMetadata(_0x2a9555, VIDEO_CLIP_THUMB_METADATA_TIMEOUT_MS);
    if (!isCurrent()) {
      return [];
    }
    const _0x57f5ab = await waitForFrame(_0x2a9555, {
      timeoutMs: 5000
    });
    if (!_0x57f5ab) {
      throw new Error("video thumbnail frame timed out");
    }
    const _0x17b4d1 = Number(_0x2a9555.duration);
    if (!Number.isFinite(_0x17b4d1) || _0x17b4d1 <= 0) {
      throw new Error("video thumbnail duration is unavailable");
    }
    const _0x3982a2 = Math.max(1, Number(_0x2a9555.videoWidth) || 1);
    const _0x553871 = Math.max(1, Number(_0x2a9555.videoHeight) || 1);
    const _0x2a2975 = 44;
    const _0xeb4dba = Math.max(1, Math.min(240, Math.round(_0x3982a2 / _0x553871 * _0x2a2975)));
    _0x3528ef = documentRef.createElement("canvas");
    _0x3528ef.width = _0xeb4dba;
    _0x3528ef.height = _0x2a2975;
    const _0x329d77 = _0x3528ef.getContext?.("2d", {
      willReadFrequently: false
    });
    if (!_0x329d77) {
      throw new Error("video thumbnail canvas is unavailable");
    }
    const _0x29926c = [];
    for (let _0x272c27 = 0; _0x272c27 < _0xe6121d; _0x272c27 += 1) {
      if (!isCurrent()) {
        return [];
      }
      const _0x144905 = Math.min(Math.max(0, _0x17b4d1 - 0.05), (_0x272c27 + 0.5) / _0xe6121d * _0x17b4d1);
      await seekVideo(_0x2a9555, _0x144905, VIDEO_CLIP_THUMB_SEEK_TIMEOUT_MS);
      const _0x504a14 = await waitForFrame(_0x2a9555, {
        timeoutMs: 1800
      });
      if (!_0x504a14) {
        throw new Error("video thumbnail frame timed out after seek");
      }
      _0x329d77.clearRect(0, 0, _0xeb4dba, _0x2a2975);
      _0x329d77.drawImage(_0x2a9555, 0, 0, _0xeb4dba, _0x2a2975);
      const _0x214fd2 = _0x3528ef.toDataURL("image/jpeg", 0.72);
      if (!_0x214fd2) {
        throw new Error("video thumbnail export returned no data");
      }
      _0x29926c.push(_0x214fd2);
    }
    return _0x29926c;
  } finally {
    try {
      _0x2a9555.pause?.();
      _0x2a9555.removeAttribute?.("src");
      _0x2a9555.load?.();
    } catch {}
    _0x2a9555.remove?.();
    if (_0x3528ef) {
      _0x3528ef.width = _0x3528ef.height = 0;
    }
  }
}
export async function renderVideoClipThumbnails({
  src: _0x459679,
  posterUrl: _0x21874a,
  thumbs: _0x5617fb,
  isCurrent = () => true,
  extractServerFrames = extractStoryboardVideoFramesFromServer,
  extractClientFrames = extractClientVideoClipFrameUrls
} = {}) {
  const _0x5880ba = Array.isArray(_0x5617fb) ? _0x5617fb : [];
  const _0x335963 = normalizeText(_0x459679);
  const _0x2e43c0 = normalizeText(_0x21874a);
  const _0x3690f1 = [];
  if (!_0x5880ba.length) {
    return {
      source: "empty",
      errors: _0x3690f1
    };
  }
  if (_0x2e43c0) {
    paintVideoClipThumbnailUrls(_0x5880ba, [_0x2e43c0], "poster");
  } else {
    setThumbState(_0x5880ba, "loading");
  }
  if (!_0x335963) {
    return {
      source: _0x2e43c0 ? "poster" : "empty",
      errors: _0x3690f1
    };
  }
  try {
    const _0x38bf9b = await extractServerFrames(_0x335963, {
      maxFrames: _0x5880ba.length,
      exactCount: true
    });
    if (!isCurrent()) {
      return {
        source: "cancelled",
        errors: _0x3690f1
      };
    }
    const _0x172de6 = (Array.isArray(_0x38bf9b?.frames) ? _0x38bf9b.frames : []).map(resolveFrameUrl).filter(Boolean);
    if (!_0x172de6.length) {
      throw new Error("server returned no video thumbnails");
    }
    paintVideoClipThumbnailUrls(_0x5880ba, _0x172de6, "server");
    return {
      source: "server",
      errors: _0x3690f1
    };
  } catch (_0x23db04) {
    _0x3690f1.push(_0x23db04 instanceof Error ? _0x23db04 : new Error(String(_0x23db04)));
  }
  if (!isCurrent()) {
    return {
      source: "cancelled",
      errors: _0x3690f1
    };
  }
  try {
    const _0x11aa13 = await extractClientFrames({
      src: _0x335963,
      count: _0x5880ba.length,
      isCurrent: isCurrent
    });
    if (!isCurrent()) {
      return {
        source: "cancelled",
        errors: _0x3690f1
      };
    }
    if (!Array.isArray(_0x11aa13) || !_0x11aa13.some(Boolean)) {
      throw new Error("browser returned no video thumbnails");
    }
    paintVideoClipThumbnailUrls(_0x5880ba, _0x11aa13, "client");
    return {
      source: "client",
      errors: _0x3690f1
    };
  } catch (_0x27a96e) {
    _0x3690f1.push(_0x27a96e instanceof Error ? _0x27a96e : new Error(String(_0x27a96e)));
  }
  setThumbState(_0x5880ba, _0x2e43c0 ? "poster" : "failed");
  return {
    source: _0x2e43c0 ? "poster" : "empty",
    errors: _0x3690f1
  };
}