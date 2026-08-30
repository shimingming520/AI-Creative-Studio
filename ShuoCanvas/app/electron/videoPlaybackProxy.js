export const VIDEO_PLAYBACK_PROXY_MAX_LONG_EDGE = 1280;
export const VIDEO_PLAYBACK_PROXY_VERSION = "v2-1280";
const VIDEO_PLAYBACK_PROXY_MIN_TIMEOUT_MS = 300000;
const VIDEO_PLAYBACK_PROXY_MAX_TIMEOUT_MS = 21600000;
export function resolveVideoPlaybackProxyTimeoutMs(_0xcf5b28) {
  const _0x5c3fa4 = Math.max(0, Number(_0xcf5b28 || 0)) * 1000;
  return Math.min(VIDEO_PLAYBACK_PROXY_MAX_TIMEOUT_MS, Math.max(VIDEO_PLAYBACK_PROXY_MIN_TIMEOUT_MS, _0x5c3fa4 * 12));
}
export function createVideoPlaybackProxyWorkDeduper() {
  const _0x4dcc89 = new Map();
  return {
    async run(_0x20e0b1, _0xfbc216) {
      const _0x56885b = String(_0x20e0b1 || "").trim();
      if (!_0x56885b || typeof _0xfbc216 !== "function") {
        return _0xfbc216?.();
      }
      while (_0x4dcc89.has(_0x56885b)) {
        try {
          return await _0x4dcc89.get(_0x56885b);
        } catch {}
      }
      const _0x5bcc22 = Promise.resolve().then(_0xfbc216);
      _0x4dcc89.set(_0x56885b, _0x5bcc22);
      try {
        return await _0x5bcc22;
      } finally {
        if (_0x4dcc89.get(_0x56885b) === _0x5bcc22) {
          _0x4dcc89.delete(_0x56885b);
        }
      }
    }
  };
}
export function finalizeVideoPlaybackProxyMigrationResult(_0x67d885 = {}, {
  sourceLocalPath = "",
  targetVersion = ""
} = {}) {
  const _0x3fc004 = String(sourceLocalPath || "").trim().replace(/\\/g, "/");
  if (String(targetVersion || "").trim() !== VIDEO_PLAYBACK_PROXY_VERSION || String(_0x67d885?.videoProxyStatus || "").trim() !== "not_required" || !_0x3fc004) {
    return _0x67d885;
  }
  return {
    ..._0x67d885,
    displayLocalPath: _0x3fc004,
    displayUrl: "/" + _0x3fc004.replace(/^\/+/, ""),
    videoProxyVersion: VIDEO_PLAYBACK_PROXY_VERSION
  };
}
function normalizeCodecValue(_0x19ded1) {
  return String(_0x19ded1 || "").trim().toLowerCase();
}
export function needsBrowserVideoProxy(_0x237a48 = {}) {
  const _0x56d3b5 = normalizeCodecValue(_0x237a48.codecName);
  const _0x26bbde = normalizeCodecValue(_0x237a48.pixelFormat);
  const _0x410a8b = normalizeCodecValue(_0x237a48.formatName);
  const _0x257750 = Math.max(0, Math.trunc(Number(_0x237a48.width || 0)) || 0);
  const _0x10cb72 = Math.max(0, Math.trunc(Number(_0x237a48.height || 0)) || 0);
  if (Math.max(_0x257750, _0x10cb72) > VIDEO_PLAYBACK_PROXY_MAX_LONG_EDGE) {
    return true;
  }
  if (!_0x56d3b5) {
    return true;
  }
  if (_0x56d3b5 === "h264") {
    return !!_0x26bbde && _0x26bbde !== "yuv420p" && _0x26bbde !== "yuvj420p";
  }
  if (_0x56d3b5 === "vp8" || _0x56d3b5 === "vp9") {
    return !_0x410a8b.includes("webm") && !_0x410a8b.includes("matroska");
  }
  if (_0x56d3b5 === "av1") {
    return false;
  }
  return true;
}
export function getVideoPlaybackProxyFilename(_0xca807b) {
  return String(_0xca807b || "").trim() + ".proxy-" + VIDEO_PLAYBACK_PROXY_VERSION + ".mp4";
}
export function isCurrentVideoPlaybackProxyLocalPath(_0x52a736, _0x249b23) {
  const _0x599413 = String(_0x52a736 || "").trim().replace(/\\/g, "/");
  if (!_0x599413) {
    return false;
  }
  return _0x599413.endsWith("/derived/video/" + getVideoPlaybackProxyFilename(_0x249b23));
}
export function buildVideoPlaybackProxyFfmpegArgs({
  inputPath: _0x308044,
  outputPath: _0x3ebf32,
  preset: _0x2e337c,
  crf: _0x3d2728
} = {}) {
  const _0x4f19b5 = VIDEO_PLAYBACK_PROXY_MAX_LONG_EDGE;
  const _0xdf9dd7 = ["scale=w='min(iw\\," + _0x4f19b5 + ")'", "h='min(ih\\," + _0x4f19b5 + ")'", "force_original_aspect_ratio=decrease", "force_divisible_by=2"].join(":");
  return ["-y", "-i", _0x308044, "-map", "0:v:0", "-map", "0:a?", "-dn", "-sn", "-vf", _0xdf9dd7, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", _0x2e337c, "-crf", _0x3d2728, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", _0x3ebf32];
}