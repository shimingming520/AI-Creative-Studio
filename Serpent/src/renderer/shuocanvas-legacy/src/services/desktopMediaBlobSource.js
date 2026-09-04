import { desktopBridge } from "./desktopBridge.js";
const DESKTOP_PREVIEW_URL_CACHE_TTL_MS = 1800000;
const desktopPreviewUrlCache = new Map();
const desktopPreviewUrlPendingCache = new Map();
const LOCAL_MEDIA_PATH_PREFIX_RE = /^(?:\/)?(?:output\/|data\/assets\/|data\/uploads\/)/i;
const LOCAL_PREVIEW_SCHEME_RE = /^aic-local-preview:/i;
const DIRECT_LOCAL_MEDIA_FLAG_RE = /^(1|true|yes|on)$/i;
const MEDIA_MIME_BY_EXT = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  flac: "audio/flac"
};
function normalizeUrl(_0x390e96) {
  const _0xe5861f = String(_0x390e96 || "").trim();
  if (!_0xe5861f) {
    return "";
  }
  try {
    return new URL(_0xe5861f, globalThis.location?.href || "http://127.0.0.1/").href;
  } catch {
    return _0xe5861f;
  }
}
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function markMediaSourceAttach(_0xcde75f = {}) {
  globalThis.window?.__runtimeCompareMark?.("media-source-attach:complete", _0xcde75f);
}
function isDesktopRenderer() {
  return desktopBridge.mediaPreview.isAvailable();
}
function shouldUseDirectLocalMediaSource() {
  const _0x5127f1 = globalThis.window || {};
  const _0x3925fc = _0x5127f1.__AIC_ALLOW_DIRECT_LOCAL_MEDIA_DIAGNOSTIC__ ?? globalThis.__AIC_ALLOW_DIRECT_LOCAL_MEDIA_DIAGNOSTIC__;
  if (!DIRECT_LOCAL_MEDIA_FLAG_RE.test(String(_0x3925fc || "").trim())) {
    return false;
  }
  const _0x46fb9c = _0x5127f1.__AIC_DIRECT_LOCAL_MEDIA__ ?? _0x5127f1.__AIC_DESKTOP_MEDIA_DIRECT_HTTP__ ?? globalThis.__AIC_DIRECT_LOCAL_MEDIA__;
  return DIRECT_LOCAL_MEDIA_FLAG_RE.test(String(_0x46fb9c || "").trim());
}
function isDesktopBlobCandidate(_0x4cea9b) {
  _0x4cea9b;
  return false;
}
function isLoopbackHost(_0x3555a9) {
  const _0x56c2d8 = String(_0x3555a9 || "").toLowerCase();
  return _0x56c2d8 === "localhost" || _0x56c2d8 === "127.0.0.1" || _0x56c2d8 === "::1" || _0x56c2d8 === "[::1]";
}
function normalizeDesktopLocalMediaPath(_0x5bd69d) {
  const _0x197283 = String(_0x5bd69d || "").trim();
  if (!_0x197283 || /^(?:blob:|data:|file:)/i.test(_0x197283) || LOCAL_PREVIEW_SCHEME_RE.test(_0x197283)) {
    return "";
  }
  let _0x4a7a8e = _0x197283;
  try {
    const _0x49110e = new URL(_0x197283, globalThis.location?.href || "http://127.0.0.1:8777/");
    const _0x2bbc51 = String(globalThis.location?.origin || "");
    const _0x1fa3c4 = /^https?:$/i.test(_0x49110e.protocol) && (_0x2bbc51 && _0x49110e.origin === _0x2bbc51 || isLoopbackHost(_0x49110e.hostname));
    if (!_0x1fa3c4) {
      return "";
    }
    _0x4a7a8e = _0x49110e.pathname;
  } catch {
    _0x4a7a8e = _0x197283.split(/[?#]/, 1)[0];
  }
  _0x4a7a8e = String(_0x4a7a8e || "").replace(/\\/g, "/").split(/[?#]/, 1)[0];
  try {
    _0x4a7a8e = decodeURIComponent(_0x4a7a8e);
  } catch {}
  _0x4a7a8e = _0x4a7a8e.replace(/^\/+/, "");
  if (!LOCAL_MEDIA_PATH_PREFIX_RE.test(_0x4a7a8e)) {
    return "";
  }
  return "/" + _0x4a7a8e;
}
function inferMediaMimeType(_0x11d566) {
  const _0x4507d4 = String(_0x11d566 || "").split(/[?#]/, 1)[0].match(/\.([a-z0-9]+)$/i);
  if (!_0x4507d4) {
    return "";
  }
  return MEDIA_MIME_BY_EXT[String(_0x4507d4[1] || "").toLowerCase()] || "";
}
function resolveChromeShellAudioPlaybackUrl(_0x5a385e, _0x5091f5) {
  if (!desktopBridge.isChromeShell || String(_0x5a385e?.tagName || "").toLowerCase() !== "audio") {
    return _0x5091f5;
  }
  const _0x390147 = normalizeUrl(_0x5091f5);
  const _0x497156 = normalizeDesktopLocalMediaPath(_0x390147);
  if (!_0x497156) {
    return _0x390147;
  }
  try {
    const _0x46bf53 = String(globalThis.location?.origin || "");
    const _0x3cebf4 = new URL(_0x390147);
    if (_0x46bf53 && _0x3cebf4.origin !== _0x46bf53) {
      return _0x390147;
    }
    if (_0x3cebf4.hostname === "127.0.0.1") {
      _0x3cebf4.hostname = "localhost";
    } else if (_0x3cebf4.hostname === "localhost") {
      _0x3cebf4.hostname = "127.0.0.1";
    } else {
      return _0x390147;
    }
    return _0x3cebf4.href;
  } catch {
    return _0x390147;
  }
}
function readPreviewCache(_0x16ef98) {
  const _0xed2c0e = desktopPreviewUrlCache.get(_0x16ef98);
  if (!_0xed2c0e) {
    return "";
  }
  if (Number(_0xed2c0e.expiresAt || 0) <= Date.now()) {
    desktopPreviewUrlCache.delete(_0x16ef98);
    return "";
  }
  return String(_0xed2c0e.url || "");
}
function writePreviewCache(_0x4dd7dd, _0x11ee34) {
  if (!_0x4dd7dd || !_0x11ee34) {
    return;
  }
  desktopPreviewUrlCache.set(_0x4dd7dd, {
    url: _0x11ee34,
    expiresAt: Date.now() + DESKTOP_PREVIEW_URL_CACHE_TTL_MS
  });
}
function getMediaElementSource(_0x41e294) {
  const _0xd5edcf = _0x41e294?.getAttribute;
  if (typeof _0xd5edcf === "function") {
    return String(_0xd5edcf.call(_0x41e294, "src") || _0x41e294?.src || "").trim();
  }
  return String(_0x41e294?.src || _0x41e294?.currentSrc || "").trim();
}
export function getMediaElementCurrentSource(_0x3c2251) {
  return getMediaElementSource(_0x3c2251);
}
export function getMediaElementPlaybackSourceKey(_0x3b5ad7) {
  const _0x5e57f9 = getMediaElementSource(_0x3b5ad7);
  if (!_0x5e57f9) {
    return "";
  }
  const _0x46b764 = String(_0x3b5ad7?.dataset?.desktopMediaSourceUrl || "").trim();
  if (_0x46b764) {
    return _0x46b764;
  }
  return _0x5e57f9;
}
export function normalizeMediaPlaybackSourceUrl(_0x2f6aff) {
  return normalizeUrl(_0x2f6aff);
}
export function isMediaElementPlaybackSource(_0x5ce279, _0x4f47a3) {
  const _0x593e27 = getMediaElementPlaybackSourceKey(_0x5ce279);
  const _0x1dcf17 = normalizeUrl(_0x4f47a3);
  return !!_0x593e27 && !!_0x1dcf17 && normalizeUrl(_0x593e27) === _0x1dcf17;
}
export function clearDesktopMediaPlaybackSourceMetadata(_0x59da82) {
  if (!_0x59da82?.dataset) {
    return;
  }
  delete _0x59da82.dataset.desktopMediaSourceUrl;
}
function assignMediaElementSource(_0x52f68b, _0x4190dc, _0x218108 = "auto", _0x536a3f = {}) {
  if (!_0x52f68b || !_0x4190dc) {
    return "";
  }
  if (typeof _0x536a3f.shouldAssign === "function" && _0x536a3f.shouldAssign() !== true) {
    return "";
  }
  const _0x264223 = nowMs();
  const _0x5d22e6 = normalizeUrl(_0x536a3f.originalSourceUrl || _0x4190dc);
  const _0x1e4b3e = normalizeUrl(_0x4190dc);
  const _0x20f780 = getMediaElementSource(_0x52f68b);
  const _0x565755 = String(_0x52f68b?.dataset?.desktopMediaSourceUrl || "").trim();
  if (_0x20f780 && (normalizeUrl(_0x20f780) === _0x1e4b3e || _0x565755 && normalizeUrl(_0x565755) === _0x5d22e6)) {
    return _0x20f780;
  }
  _0x52f68b.preload = _0x218108 || _0x52f68b.preload || "auto";
  if (_0x52f68b.dataset) {
    if (_0x5d22e6 && _0x1e4b3e !== _0x5d22e6) {
      _0x52f68b.dataset.desktopMediaSourceUrl = _0x5d22e6;
    } else {
      delete _0x52f68b.dataset.desktopMediaSourceUrl;
    }
  }
  if (typeof _0x52f68b.setAttribute === "function") {
    _0x52f68b.setAttribute("src", _0x4190dc);
  } else {
    _0x52f68b.src = _0x4190dc;
  }
  try {
    _0x536a3f.onSourceAssigned?.({
      originalSourceUrl: _0x5d22e6,
      playbackUrl: _0x1e4b3e
    });
  } catch {}
  if (_0x536a3f.load !== false) {
    try {
      _0x52f68b.load?.();
    } catch {}
  }
  markMediaSourceAttach({
    originalSourceUrl: _0x5d22e6,
    playbackUrl: _0x1e4b3e,
    tag: String(_0x52f68b?.tagName || "").toLowerCase(),
    loadRequested: _0x536a3f.load !== false,
    durationMs: Math.max(0, nowMs() - _0x264223)
  });
  return _0x4190dc;
}
export async function resolveDesktopMediaPlaybackUrl(_0x44d0aa) {
  const _0x25ca96 = normalizeUrl(_0x44d0aa);
  if (desktopBridge.isChromeShell) {
    return _0x25ca96;
  }
  if (!isDesktopRenderer()) {
    return _0x25ca96;
  }
  const _0x180740 = normalizeDesktopLocalMediaPath(_0x25ca96 || _0x44d0aa);
  if (!_0x180740) {
    return _0x25ca96;
  }
  if (shouldUseDirectLocalMediaSource()) {
    return _0x25ca96;
  }
  const _0x4cfff8 = readPreviewCache(_0x180740);
  if (_0x4cfff8) {
    return _0x4cfff8;
  }
  const _0x227f5b = desktopPreviewUrlPendingCache.get(_0x180740);
  if (_0x227f5b) {
    return await _0x227f5b;
  }
  const _0x3e2ffe = (async () => {
    try {
      const _0x547b7b = await desktopBridge.mediaPreview.getLocalPreviewUrl({
        localPath: _0x180740,
        type: inferMediaMimeType(_0x180740)
      });
      const _0x4ae167 = String(_0x547b7b?.url || _0x547b7b || "").trim();
      if (_0x4ae167) {
        writePreviewCache(_0x180740, _0x4ae167);
        return _0x4ae167;
      }
    } catch {}
    return _0x25ca96;
  })().finally(() => {
    desktopPreviewUrlPendingCache.delete(_0x180740);
  });
  desktopPreviewUrlPendingCache.set(_0x180740, _0x3e2ffe);
  return await _0x3e2ffe;
}
export async function attachDesktopMediaPlaybackSource(_0x255cef, _0x5955d6, _0x305115 = {}) {
  if (!_0x255cef) {
    return "";
  }
  const _0x3039c9 = normalizeUrl(_0x5955d6);
  const _0x46c5f7 = isDesktopRenderer() ? await resolveDesktopMediaPlaybackUrl(_0x5955d6) : _0x5955d6;
  const _0xbe6979 = resolveChromeShellAudioPlaybackUrl(_0x255cef, _0x46c5f7);
  return assignMediaElementSource(_0x255cef, _0xbe6979, _0x305115.preload || _0x255cef.preload, {
    originalSourceUrl: _0x3039c9,
    load: _0x305115.load,
    onSourceAssigned: _0x305115.onSourceAssigned,
    shouldAssign: _0x305115.shouldAssign
  });
}
export async function attachMediaElementPlaybackSource(_0x1dbb02, _0x46cba7, _0x52c185 = {}) {
  if (!_0x1dbb02) {
    return "";
  }
  const _0x3397a2 = normalizeUrl(_0x46cba7);
  if (!_0x3397a2) {
    return "";
  }
  const _0x57817a = String(_0x52c185.playbackUrl || "").trim();
  const _0x5499dd = _0x57817a || (isDesktopRenderer() ? await resolveDesktopMediaPlaybackUrl(_0x46cba7) : _0x46cba7);
  const _0x31d9b9 = _0x57817a ? _0x5499dd : resolveChromeShellAudioPlaybackUrl(_0x1dbb02, _0x5499dd);
  return assignMediaElementSource(_0x1dbb02, _0x31d9b9, _0x52c185.preload || _0x1dbb02.preload, {
    originalSourceUrl: _0x3397a2,
    load: _0x52c185.load,
    onSourceAssigned: _0x52c185.onSourceAssigned,
    shouldAssign: _0x52c185.shouldAssign
  });
}
export const __desktopMediaBlobSourceForTest = {
  clearBlobCacheForTest() {
    desktopPreviewUrlCache.clear();
    desktopPreviewUrlPendingCache.clear();
  },
  isDesktopBlobCandidate: isDesktopBlobCandidate,
  normalizeDesktopLocalMediaPath: normalizeDesktopLocalMediaPath,
  normalizeUrl: normalizeUrl,
  resolveDesktopMediaPlaybackUrl: resolveDesktopMediaPlaybackUrl
};