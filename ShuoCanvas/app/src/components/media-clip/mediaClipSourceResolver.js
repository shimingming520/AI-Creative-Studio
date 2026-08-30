import { buildApiUrl } from "../../../api/apiBase.js";
import { resolveCanvasAudioUrl, resolveCanvasImagePreviewUrl, resolveCanvasImageSourceUrl, resolveCanvasVideoUrl } from "../../services/canvasMediaLocalService.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { resolveMediaClipDimensions } from "./mediaClipState.js";
import { firstNonEmpty, normalizeText, toNumber } from "./mediaClipUtils.js";
import { isRenderableUrl, isUsableMediaElement } from "./mediaClipMediaElement.js";
export function toPlayableMediaUrl(_0x318ddb) {
  const _0x4138f8 = normalizeText(_0x318ddb);
  if (!_0x4138f8) {
    return "";
  }
  if (/^(?:https?:|data:|blob:|aic-local-preview:)/i.test(_0x4138f8)) {
    return _0x4138f8;
  }
  const _0x19f4f6 = localPathToUrl(_0x4138f8);
  const _0x4a0e1e = _0x19f4f6 || (_0x4138f8.startsWith("/") ? _0x4138f8 : "");
  if (_0x4a0e1e) {
    return buildApiUrl(_0x4a0e1e);
  } else {
    return "";
  }
}
export function resolveLiveMediaElementUrl(_0x375a99 = {}, _0x13d5c5 = "video") {
  const _0x244ace = normalizeText(_0x375a99?.id);
  if (!_0x244ace || typeof document === "undefined" || typeof document.getElementById !== "function") {
    return "";
  }
  const _0x3a6320 = document.getElementById(_0x244ace);
  if (!_0x3a6320) {
    return "";
  }
  const _0x58df3b = Array.from(_0x3a6320.querySelectorAll(_0x13d5c5));
  let _0x3c490d = "";
  for (const _0x3f4cf6 of _0x58df3b) {
    const _0x5add9f = firstNonEmpty(_0x3f4cf6.currentSrc, _0x3f4cf6.getAttribute?.("src"), _0x3f4cf6.src);
    const _0x5a9ae7 = toPlayableMediaUrl(_0x5add9f) || (isRenderableUrl(_0x5add9f) ? _0x5add9f : "");
    if (!_0x5a9ae7) {
      continue;
    }
    if (!_0x3c490d) {
      _0x3c490d = _0x5a9ae7;
    }
    if (isUsableMediaElement(_0x3f4cf6)) {
      return _0x5a9ae7;
    }
  }
  return _0x3c490d;
}
export function getSourceDataCandidates(_0x44a5a9 = {}) {
  if (!_0x44a5a9 || typeof _0x44a5a9 !== "object") {
    return [];
  }
  const _0x3f9b4a = [];
  const _0x4d72a8 = _0x59616a => {
    if (!_0x59616a || typeof _0x59616a !== "object") {
      return;
    }
    if (_0x3f9b4a.includes(_0x59616a)) {
      return;
    }
    _0x3f9b4a.push(_0x59616a);
  };
  _0x4d72a8(_0x44a5a9);
  _0x4d72a8(_0x44a5a9.nodeData);
  _0x4d72a8(_0x44a5a9.data);
  _0x4d72a8(_0x44a5a9._data);
  for (let _0x252775 = 0; _0x252775 < _0x3f9b4a.length; _0x252775 += 1) {
    const _0x56e52d = _0x3f9b4a[_0x252775];
    _0x4d72a8(_0x56e52d.nodeData);
    _0x4d72a8(_0x56e52d.data);
    _0x4d72a8(_0x56e52d._data);
    const _0x6e0491 = Array.isArray(_0x56e52d.videos) ? _0x56e52d.videos : [];
    const _0x27a9ee = Number(_0x56e52d.mainVideoIndex);
    const _0x1903ab = Number.isFinite(_0x27a9ee) ? Math.max(0, Math.trunc(_0x27a9ee)) : 0;
    _0x4d72a8(_0x6e0491[_0x1903ab]);
    _0x6e0491.forEach(_0x4d72a8);
  }
  return _0x3f9b4a;
}
export function resolveNestedMediaUrl(_0x2114c3, _0x5a47b2, _0x2c67f5 = []) {
  for (const _0x1a9b45 of getSourceDataCandidates(_0x2114c3)) {
    const _0x37854b = normalizeText(_0x5a47b2(_0x1a9b45));
    if (_0x37854b) {
      return toPlayableMediaUrl(_0x37854b) || _0x37854b;
    }
    for (const _0x51af80 of _0x2c67f5) {
      const _0x87bd01 = normalizeText(_0x1a9b45?.[_0x51af80]);
      if (!_0x87bd01) {
        continue;
      }
      const _0x186975 = toPlayableMediaUrl(_0x87bd01);
      if (_0x186975) {
        return _0x186975;
      }
      if (isRenderableUrl(_0x87bd01)) {
        return _0x87bd01;
      }
    }
  }
  return "";
}
export function resolveMediaClipVideoUrl(_0x220076 = {}) {
  return resolveLiveMediaElementUrl(_0x220076, "video") || resolveNestedMediaUrl(_0x220076, resolveCanvasVideoUrl, ["displayLocalPath", "videoMetaSrc", "videoLocalPath", "videoUrl", "src", "localUrl", "url", "resultUrl", "sourceUrl", "localPath", "originalLocalPath", "capturePreviewUrl", "playbackUrl", "mediaUrl"]);
}
export function resolveMediaClipAudioUrl(_0x1ab0b6 = {}) {
  return resolveLiveMediaElementUrl(_0x1ab0b6, "audio") || resolveNestedMediaUrl(_0x1ab0b6, resolveCanvasAudioUrl, ["audioLocalPath", "audioUrl", "src", "localUrl", "url", "resultUrl", "sourceUrl", "localPath", "mediaUrl"]);
}
export function resolveMediaClipWaveformUrl(_0x11d04d = {}) {
  for (const _0x29ab01 of getSourceDataCandidates(_0x11d04d)) {
    const _0x1e9e36 = firstNonEmpty(_0x29ab01?.waveformLocalPath, _0x29ab01?.waveformUrl, _0x29ab01?.waveformJsonUrl);
    if (!_0x1e9e36) {
      continue;
    }
    return localPathToUrl(_0x1e9e36) || toPlayableMediaUrl(_0x1e9e36) || (isRenderableUrl(_0x1e9e36) ? _0x1e9e36 : "");
  }
  return "";
}
export function resolveMediaClipImageUrl(_0x369aca = {}) {
  return resolveNestedMediaUrl(_0x369aca, resolveCanvasImagePreviewUrl, ["displayLocalPath", "imageUrl", "sourceUrl", "thumbUrl", "src", "localUrl", "url", "resultUrl", "localPath", "originalLocalPath", "thumbLocalPath"]) || resolveNestedMediaUrl(_0x369aca, resolveCanvasImageSourceUrl, ["imageUrl", "sourceUrl", "src", "localPath", "originalLocalPath"]);
}
export function resolveMediaClipThumbUrl(_0x3f0dd1 = {}) {
  for (const _0x4980de of getSourceDataCandidates(_0x3f0dd1)) {
    const _0x2c42a4 = firstNonEmpty(_0x4980de.thumbUrl, _0x4980de.thumbnailUrl, _0x4980de.posterUrl, _0x4980de.imageUrl, _0x4980de.sourceUrl, _0x4980de.videoThumbSrc, _0x4980de.videoMetaSrc, _0x4980de.coverUrl, _0x4980de.src);
    if (_0x2c42a4) {
      const _0x3206ed = toPlayableMediaUrl(_0x2c42a4);
      if (_0x3206ed) {
        return _0x3206ed;
      }
      if (isRenderableUrl(_0x2c42a4)) {
        return _0x2c42a4;
      }
    }
    const _0x230919 = firstNonEmpty(_0x4980de.posterLocalPath, _0x4980de.thumbLocalPath, _0x4980de.coverLocalPath, _0x4980de.displayLocalPath, _0x4980de.localPath);
    const _0x435d6c = toPlayableMediaUrl(_0x230919);
    if (_0x435d6c) {
      return _0x435d6c;
    }
  }
  return "";
}
export function resolveMediaClipPosterImageFields(_0xeba7ac = {}, _0x30224c = {}, _0x8cb0a8 = {}) {
  const _0x2b491b = _0xa16241 => {
    const _0x115031 = normalizeText(_0xa16241);
    if (!_0x115031) {
      return "";
    }
    return toPlayableMediaUrl(_0x115031) || (isRenderableUrl(_0x115031) ? _0x115031 : "");
  };
  const _0x36bf72 = firstNonEmpty(_0x30224c.thumbUrl, _0x30224c.posterUrl, _0x8cb0a8.thumbUrl, _0x8cb0a8.posterUrl);
  const _0x16e761 = firstNonEmpty(_0x30224c.thumbLocalPath, _0x30224c.posterLocalPath, _0x8cb0a8.thumbLocalPath, _0x8cb0a8.posterLocalPath);
  if (_0x36bf72 || _0x16e761) {
    return {
      thumbUrl: _0x2b491b(_0x36bf72 || _0x16e761),
      posterUrl: _0x2b491b(_0x36bf72 || _0x16e761),
      thumbLocalPath: normalizeText(_0x16e761),
      posterLocalPath: normalizeText(_0x16e761),
      isOutputPoster: true
    };
  }
  for (const _0x1c0bf9 of getSourceDataCandidates(_0xeba7ac)) {
    const _0x5c5333 = firstNonEmpty(_0x1c0bf9.thumbUrl, _0x1c0bf9.thumbnailUrl, _0x1c0bf9.posterUrl, _0x1c0bf9.coverUrl);
    const _0x55b462 = firstNonEmpty(_0x1c0bf9.thumbLocalPath, _0x1c0bf9.posterLocalPath, _0x1c0bf9.coverLocalPath);
    if (_0x5c5333 || _0x55b462) {
      const _0xef8a8c = _0x2b491b(_0x5c5333 || _0x55b462);
      return {
        thumbUrl: _0xef8a8c,
        posterUrl: _0xef8a8c,
        thumbLocalPath: normalizeText(_0x55b462),
        posterLocalPath: normalizeText(_0x55b462),
        isOutputPoster: false
      };
    }
  }
  return {
    thumbUrl: "",
    posterUrl: "",
    thumbLocalPath: "",
    posterLocalPath: "",
    isOutputPoster: false
  };
}
export function resolveMediaClipOutputVideoDimensions(_0x2e72da = {}, _0x3caf2f = {}) {
  const _0x291286 = toNumber(_0x3caf2f.videoWidth, 0);
  const _0x4e61be = toNumber(_0x3caf2f.videoHeight, 0);
  if (_0x291286 > 0 && _0x4e61be > 0) {
    return {
      width: _0x291286,
      height: _0x4e61be
    };
  }
  const _0x231376 = toNumber(_0x3caf2f.width, 0);
  const _0xc77719 = toNumber(_0x3caf2f.height, 0);
  if (_0x231376 > 0 && _0xc77719 > 0) {
    return {
      width: _0x231376,
      height: _0xc77719
    };
  }
  return resolveMediaClipDimensions(_0x2e72da);
}
export function collectMediaClipFrameUrls(_0x5ba085 = {}) {
  const _0x28b1d0 = [];
  const _0x4a475b = new Set();
  const _0x1b3a82 = _0x50162a => {
    const _0x33f14c = normalizeText(_0x50162a);
    if (!_0x33f14c) {
      return;
    }
    const _0x595e91 = toPlayableMediaUrl(_0x33f14c) || (isRenderableUrl(_0x33f14c) ? _0x33f14c : "");
    if (!_0x595e91 || _0x4a475b.has(_0x595e91)) {
      return;
    }
    _0x4a475b.add(_0x595e91);
    _0x28b1d0.push(_0x595e91);
  };
  const _0x10b26c = (_0x24fd4f, _0x78961 = {}) => {
    if (!_0x24fd4f) {
      return;
    }
    if (typeof _0x24fd4f === "string") {
      _0x1b3a82(_0x24fd4f);
      return;
    }
    if (typeof _0x24fd4f !== "object") {
      return;
    }
    _0x1b3a82(firstNonEmpty(_0x24fd4f.thumbUrl, _0x24fd4f.thumbnailUrl, _0x24fd4f.posterUrl, _0x24fd4f.imageUrl, _0x24fd4f.sourceUrl, _0x24fd4f.url, _0x24fd4f.src, _0x24fd4f.thumbLocalPath, _0x24fd4f.posterLocalPath, _0x78961.allowLocalPath === true ? _0x24fd4f.localPath : ""));
  };
  for (const _0x41dbcf of getSourceDataCandidates(_0x5ba085)) {
    [_0x41dbcf.frameThumbUrls, _0x41dbcf.frameThumbnailUrls, _0x41dbcf.thumbnailUrls, _0x41dbcf.thumbUrls, _0x41dbcf.posterUrls, _0x41dbcf.frames, _0x41dbcf.thumbnails, _0x41dbcf.videoFrames].forEach(_0x42e905 => {
      if (Array.isArray(_0x42e905)) {
        _0x42e905.forEach(_0x5e8e0a => _0x10b26c(_0x5e8e0a, {
          allowLocalPath: true
        }));
      }
    });
    _0x10b26c(_0x41dbcf);
  }
  const _0x16f573 = resolveMediaClipThumbUrl(_0x5ba085);
  if (_0x16f573) {
    _0x1b3a82(_0x16f573);
  }
  return _0x28b1d0;
}
export function resolveMediaClipLocalPath(_0x2b5765 = {}) {
  for (const _0x3882be of getSourceDataCandidates(_0x2b5765)) {
    const _0x575582 = firstNonEmpty(_0x3882be.localPath, _0x3882be.originalLocalPath, _0x3882be.displayLocalPath, _0x3882be.videoLocalPath, _0x3882be.audioLocalPath, _0x3882be.imageUrl, _0x3882be.sourceUrl, _0x3882be.src, _0x3882be.url, _0x3882be.resultUrl);
    if (_0x575582) {
      return _0x575582;
    }
  }
  return "";
}