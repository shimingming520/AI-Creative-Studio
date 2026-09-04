import { captureVideoFrameSnapshot, waitForVideoFrame } from "../../components/videoFrameCapture.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
const STORY_CLIP_VIDEO_LOCALIZE_MAX_BYTES = 536870912;
const STORY_CLIP_FRAME_READY_TIMEOUT_MS = 10000;
const STORY_CLIP_FRAME_SEEK_TIMEOUT_MS = 8000;
function normalizeText(_0x1920fc) {
  return String(_0x1920fc || "").trim();
}
function seekVideoToTime(_0x3bf11f, _0xab9bca, _0x3d4ba2 = STORY_CLIP_FRAME_SEEK_TIMEOUT_MS) {
  return new Promise(_0x5d19a3 => {
    let _0x2cbbb4 = false;
    let _0x5b9054 = null;
    const _0x51e855 = _0x19cb67 => {
      if (_0x2cbbb4) {
        return;
      }
      _0x2cbbb4 = true;
      if (_0x5b9054) {
        clearTimeout(_0x5b9054);
      }
      _0x3bf11f.removeEventListener?.("seeked", _0x4f9983);
      _0x3bf11f.removeEventListener?.("error", _0x37b49e);
      _0x3bf11f.removeEventListener?.("abort", _0x37b49e);
      _0x5d19a3(_0x19cb67 === true);
    };
    const _0x4f9983 = () => _0x51e855(true);
    const _0x37b49e = () => _0x51e855(false);
    _0x3bf11f.addEventListener?.("seeked", _0x4f9983, {
      once: true
    });
    _0x3bf11f.addEventListener?.("error", _0x37b49e, {
      once: true
    });
    _0x3bf11f.addEventListener?.("abort", _0x37b49e, {
      once: true
    });
    _0x5b9054 = setTimeout(() => _0x51e855(!_0x3bf11f.seeking && Math.abs(Number(_0x3bf11f.currentTime) - Number(_0xab9bca)) <= 0.05), _0x3d4ba2);
    try {
      _0x3bf11f.currentTime = _0xab9bca;
    } catch {
      _0x51e855(false);
      return;
    }
    if (!_0x3bf11f.seeking && Math.abs(Number(_0x3bf11f.currentTime) - Number(_0xab9bca)) <= 0.01) {
      queueMicrotask(() => _0x51e855(true));
    }
  });
}
function resolveCaptureTime(_0x139e33, _0x2d1c00) {
  const _0x382903 = Math.max(0, Number(_0x2d1c00) || 0);
  const _0x43a531 = Number(_0x139e33?.duration);
  if (!Number.isFinite(_0x43a531) || _0x43a531 <= 0) {
    return _0x382903;
  }
  return Math.min(_0x382903, Math.max(0, _0x43a531 - 0.001));
}
function inferVideoExtension(_0x4fcf2d, _0x48854d = {}) {
  const _0x39831a = normalizeText(_0x48854d.mimeType || _0x48854d.contentType).toLowerCase();
  if (_0x39831a.includes("webm")) {
    return "webm";
  }
  if (_0x39831a.includes("quicktime")) {
    return "mov";
  }
  if (_0x39831a.includes("mp4")) {
    return "mp4";
  }
  try {
    const _0x41d9bd = new URL(_0x4fcf2d, globalThis.location?.href || "http://localhost/").pathname;
    const _0x29afc8 = normalizeText(_0x41d9bd.match(/\.([a-z0-9]{2,5})$/i)?.[1]).toLowerCase();
    if (["mp4", "m4v", "mov", "webm"].includes(_0x29afc8)) {
      return _0x29afc8;
    }
  } catch {}
  return "mp4";
}
function resolveRemoteVideoUrl(_0x54bf53 = {}, _0x39876f = "") {
  return [_0x54bf53.videoUrl, _0x54bf53.url, _0x54bf53.displayUrl, _0x39876f].map(normalizeText).find(_0x559bf8 => /^https?:\/\//i.test(_0x559bf8)) || "";
}
function normalizeLocalizedVideoResult(_0x17d5f1 = {}) {
  const _0x1a25fb = pickResultLocalPath(_0x17d5f1);
  const _0x19a3ee = localPathToUrl(_0x1a25fb) || normalizeText(_0x17d5f1.url);
  if (!_0x1a25fb || !_0x19a3ee) {
    return null;
  }
  return {
    url: _0x19a3ee,
    localPath: _0x1a25fb,
    originalLocalPath: normalizeLocalPath(_0x17d5f1.originalLocalPath || _0x1a25fb),
    displayLocalPath: normalizeLocalPath(_0x17d5f1.displayLocalPath)
  };
}
export function isStoryClipFrameCanvasSecurityError(_0x54c5fe) {
  const _0x59e97c = normalizeText(_0x54c5fe?.name).toLowerCase();
  const _0x359dc5 = normalizeText(_0x54c5fe?.message).toLowerCase();
  return _0x59e97c === "securityerror" || _0x359dc5.includes("tainted canvas") || _0x359dc5.includes("tainted canvases") || _0x359dc5.includes("insecure");
}
export async function captureStoryClipFrameFromSource({
  sourceUrl: _0x3428d3,
  currentTimeSec = 0,
  documentObject = globalThis.document,
  fileNamePrefix = "story_clip_frame"
} = {}) {
  const _0x97b509 = normalizeText(_0x3428d3);
  if (!_0x97b509 || !documentObject?.createElement) {
    throw new Error("片段视频本地源不可用");
  }
  const _0x582705 = documentObject.createElement("video");
  _0x582705.muted = true;
  _0x582705.playsInline = true;
  _0x582705.preload = "auto";
  _0x582705.style.position = "fixed";
  _0x582705.style.left = "-10000px";
  _0x582705.style.top = "-10000px";
  _0x582705.style.width = "1px";
  _0x582705.style.height = "1px";
  _0x582705.style.opacity = "0";
  documentObject.body?.appendChild(_0x582705);
  try {
    _0x582705.src = _0x97b509;
    _0x582705.load?.();
    const _0x38b29b = await waitForVideoFrame(_0x582705, {
      timeoutMs: STORY_CLIP_FRAME_READY_TIMEOUT_MS
    });
    if (!_0x38b29b) {
      throw new Error("片段视频本地画面加载失败");
    }
    const _0x12e630 = resolveCaptureTime(_0x582705, currentTimeSec);
    if (_0x12e630 > 0.001 && Math.abs(Number(_0x582705.currentTime) - _0x12e630) > 0.01) {
      if (!(await seekVideoToTime(_0x582705, _0x12e630))) {
        throw new Error("片段视频定位当前时间失败");
      }
      if (!(await waitForVideoFrame(_0x582705, {
        timeoutMs: STORY_CLIP_FRAME_READY_TIMEOUT_MS
      }))) {
        throw new Error("片段视频当前画面加载失败");
      }
    }
    return captureVideoFrameSnapshot(_0x582705, {
      type: "image/png",
      fileNamePrefix: fileNamePrefix
    });
  } finally {
    try {
      _0x582705.pause?.();
      _0x582705.removeAttribute?.("src");
      _0x582705.load?.();
    } catch {}
    _0x582705.remove?.();
  }
}
export async function captureStoryClipFrameSnapshot({
  videoEl: _0x134062,
  sourceResult = {},
  sourceUrl = "",
  currentTimeSec = 0,
  saveOutputFromUrl: _0xf9c3f4,
  documentObject = globalThis.document,
  fileNamePrefix = "story_clip_frame"
} = {}) {
  if (!_0x134062) {
    throw new Error("当前片段视频不可用");
  }
  if (!(await waitForVideoFrame(_0x134062, {
    timeoutMs: STORY_CLIP_FRAME_READY_TIMEOUT_MS
  }))) {
    throw new Error("视频画面尚未加载完成，请稍后重试");
  }
  try {
    return {
      snapshot: await captureVideoFrameSnapshot(_0x134062, {
        type: "image/png",
        fileNamePrefix: fileNamePrefix
      }),
      localizedVideo: null
    };
  } catch (_0x575380) {
    if (!isStoryClipFrameCanvasSecurityError(_0x575380)) {
      throw _0x575380;
    }
    const _0x2fcd75 = resolveRemoteVideoUrl(sourceResult, sourceUrl);
    if (!_0x2fcd75 || typeof _0xf9c3f4 !== "function") {
      throw _0x575380;
    }
    const _0x40a96e = normalizeLocalizedVideoResult(await _0xf9c3f4(_0x2fcd75, {
      ext: inferVideoExtension(_0x2fcd75, sourceResult),
      maxBytes: STORY_CLIP_VIDEO_LOCALIZE_MAX_BYTES,
      dedupeKey: "story-clip-video:" + _0x2fcd75
    }));
    if (!_0x40a96e) {
      throw new Error("片段视频本地保存失败");
    }
    return {
      snapshot: await captureStoryClipFrameFromSource({
        sourceUrl: _0x40a96e.url,
        currentTimeSec: currentTimeSec,
        documentObject: documentObject,
        fileNamePrefix: fileNamePrefix
      }),
      localizedVideo: _0x40a96e
    };
  }
}