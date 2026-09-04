const DEFAULT_EXTENSIONS = Object.freeze({
  image: "png",
  video: "mp4",
  audio: "mp3"
});
const MEDIA_EXTENSIONS = Object.freeze({
  image: new Set(["avif", "bmp", "gif", "jpeg", "jpg", "png", "tif", "tiff", "webp"]),
  video: new Set(["avi", "m4v", "mkv", "mov", "mp4", "mpeg", "mpg", "webm", "wmv"]),
  audio: new Set(["aac", "aiff", "amr", "flac", "m4a", "mp3", "oga", "ogg", "opus", "wav", "weba", "webm", "wma"])
});
function trimText(_0x6c848d) {
  return String(_0x6c848d || "").trim();
}
function safeDecode(_0x54e22e) {
  try {
    return decodeURIComponent(_0x54e22e);
  } catch {
    return _0x54e22e;
  }
}
function basenameFromSource(_0xb2914c) {
  const _0x29c38c = trimText(_0xb2914c);
  if (!_0x29c38c || /^(?:blob:|data:)/i.test(_0x29c38c)) {
    return "";
  }
  try {
    const _0xbaea4f = new URL(_0x29c38c, globalThis.location?.href || "http://localhost/");
    return safeDecode(_0xbaea4f.pathname.split("/").filter(Boolean).pop() || "");
  } catch {
    const _0xfe99cf = _0x29c38c.split(/[?#]/, 1)[0].replace(/\\/g, "/");
    return safeDecode(_0xfe99cf.split("/").filter(Boolean).pop() || "");
  }
}
function sanitizeFilenamePart(_0x1c1e6c) {
  return trimText(_0x1c1e6c).replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").replace(/[. ]+$/g, "").trim();
}
function extensionFromSource(_0x5b777e, _0x3aed19) {
  const _0x57ddf5 = basenameFromSource(_0x5b777e) || trimText(_0x5b777e);
  const _0x2e042d = _0x57ddf5.match(/\.([a-z0-9]{1,10})$/i);
  const _0x5fa9d2 = String(_0x2e042d?.[1] || "").toLowerCase();
  if (MEDIA_EXTENSIONS[_0x3aed19]?.has(_0x5fa9d2)) {
    return _0x5fa9d2;
  } else {
    return "";
  }
}
function stripKnownMediaExtension(_0x8cd9f5) {
  const _0x1af56f = _0x8cd9f5.match(/\.([a-z0-9]{1,10})$/i);
  const _0x193501 = String(_0x1af56f?.[1] || "").toLowerCase();
  const _0x11dc2e = Object.values(MEDIA_EXTENSIONS).some(_0x40d296 => _0x40d296.has(_0x193501));
  if (_0x11dc2e) {
    return _0x8cd9f5.slice(0, -_0x1af56f[0].length);
  } else {
    return _0x8cd9f5;
  }
}
function withExtension(_0x16d439, _0x3ebac8) {
  const _0x41826f = sanitizeFilenamePart(stripKnownMediaExtension(_0x16d439));
  const _0x48afd0 = Math.max(1, 160 - _0x3ebac8.length - 1);
  const _0x22eae8 = _0x41826f.slice(0, _0x48afd0).replace(/[. ]+$/g, "");
  return (_0x22eae8 || "media") + "." + _0x3ebac8;
}
export function resolveNodeMediaDownloadFilename({
  nodeName: _0x24a52f,
  kind: _0x555b76,
  sources = [],
  fallbackBase: _0x4851b1
} = {}) {
  const _0x1f5e8c = trimText(_0x555b76).toLowerCase();
  const _0x40382f = DEFAULT_EXTENSIONS[_0x1f5e8c] || "bin";
  const _0xa86863 = Array.isArray(sources) ? sources : [sources];
  const _0x3acb70 = _0xa86863.map(_0x5e053c => extensionFromSource(_0x5e053c, _0x1f5e8c)).find(Boolean) || _0x40382f;
  const _0x1adf68 = sanitizeFilenamePart(_0x24a52f);
  if (_0x1adf68) {
    return withExtension(_0x1adf68, _0x3acb70);
  }
  const _0x1c321 = _0xa86863.map(_0x3c4e3d => sanitizeFilenamePart(basenameFromSource(_0x3c4e3d))).find(Boolean);
  return withExtension(_0x1c321 || _0x4851b1 || _0x1f5e8c || "media", _0x3acb70);
}