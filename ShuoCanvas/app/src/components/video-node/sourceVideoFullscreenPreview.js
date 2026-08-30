import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata } from "../../services/desktopMediaBlobSource.js";
import { hasPresentedVideoFrame, resetVideoFramePresentation, watchVideoFramePresentation } from "../../services/videoFramePresentation.js";
import { resolveCanvasVideoUrl } from "../../services/canvasMediaLocalService.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
function normalizeSource(_0x1cd8d4) {
  const _0x474c28 = String(_0x1cd8d4 || "").trim();
  if (!_0x474c28) {
    return "";
  }
  const _0x264689 = localPathToUrl(_0x474c28);
  return _0x264689 || _0x474c28;
}
function comparableSource(_0x542342) {
  const _0x390852 = normalizeSource(_0x542342);
  if (!_0x390852) {
    return "";
  }
  try {
    return new URL(_0x390852, globalThis.location?.href || globalThis.window?.location?.href).href;
  } catch {
    return _0x390852;
  }
}
export function resolveSourceVideoFullscreenSources(_0x162acd = {}, _0x36e279 = "") {
  const _0xd9332c = normalizeSource(_0x36e279 || resolveCanvasVideoUrl(_0x162acd));
  const _0x2b202b = comparableSource(_0xd9332c);
  const _0x5075d1 = [_0x162acd?.originalLocalPath, _0x162acd?.localPath, _0x162acd?.videoLocalPath, _0x162acd?.sourceLocalPath];
  let _0x3cf128 = "";
  for (const _0x5da982 of _0x5075d1) {
    const _0x20aee2 = normalizeSource(_0x5da982);
    if (!_0x20aee2 || comparableSource(_0x20aee2) === _0x2b202b) {
      continue;
    }
    _0x3cf128 = _0x20aee2;
    break;
  }
  return {
    previewUrl: _0xd9332c,
    highResolutionUrl: _0x3cf128
  };
}
function setPlaybackTime(_0x59e770, _0x4a1d3e) {
  const _0x40af80 = Math.max(0, Number(_0x4a1d3e || 0));
  try {
    const _0x2d56ec = Number(_0x59e770?.duration || 0);
    _0x59e770.currentTime = Number.isFinite(_0x2d56ec) && _0x2d56ec > 0 ? Math.min(_0x40af80, Math.max(0, _0x2d56ec - 0.001)) : _0x40af80;
  } catch {}
}
function playSilently(_0x7258a4) {
  try {
    const _0x50f4ca = _0x7258a4?.play?.();
    _0x50f4ca?.catch?.(() => {});
  } catch {}
}
export function openSourceVideoFullscreenPreview({
  nodeData = {},
  previewUrl = "",
  previewPlaybackUrl = "",
  currentTime = 0,
  muted = true,
  documentObject = globalThis.document,
  attachSource = attachMediaElementPlaybackSource,
  watchFrame = watchVideoFramePresentation,
  hasPresentedFrame = hasPresentedVideoFrame,
  resetFrame = resetVideoFramePresentation
} = {}) {
  const _0x3571cf = resolveSourceVideoFullscreenSources(nodeData, previewUrl);
  if (!_0x3571cf.previewUrl || !documentObject?.body) {
    return null;
  }
  const _0x33fea3 = documentObject.createElement("div");
  _0x33fea3.classList.add("source-video-fullscreen-overlay", "is-loading");
  let _0x8db6fa = false;
  const _0x1d49ae = documentObject.createElement("div");
  _0x1d49ae.classList.add("source-video-fullscreen-stage");
  const _0x410efa = documentObject.createElement("video");
  _0x410efa.classList.add("source-video-fullscreen-media", "is-active");
  _0x410efa.controls = true;
  _0x410efa.loop = true;
  _0x410efa.muted = !!muted;
  _0x410efa.playsInline = true;
  _0x410efa.preload = "auto";
  setPlaybackTime(_0x410efa, currentTime);
  _0x410efa.addEventListener?.("loadedmetadata", () => {
    setPlaybackTime(_0x410efa, currentTime);
  });
  const _0x4eb7f5 = () => {
    if (_0x8db6fa) {
      return;
    }
    _0x33fea3.classList.remove("is-loading", "is-error");
  };
  const _0x328a3a = () => {
    if (_0x8db6fa) {
      return;
    }
    _0x33fea3.classList.remove("is-loading");
    _0x33fea3.classList.add("is-error");
  };
  const _0xbd0b29 = () => _0x4eb7f5();
  let _0x31e99f = false;
  const _0x4f8684 = () => {
    if (!_0x8db6fa && !_0x31e99f && normalizeSource(previewPlaybackUrl)) {
      _0x31e99f = true;
      _0x33fea3.classList.add("is-loading");
      _0x33fea3.classList.remove("is-error");
      _0x50ab0e(_0x410efa);
      _0x117d83("").catch(_0x328a3a);
      return;
    }
    _0x328a3a();
  };
  _0x410efa.addEventListener?.("loadeddata", _0xbd0b29);
  _0x410efa.addEventListener?.("canplay", _0xbd0b29);
  _0x410efa.addEventListener?.("playing", _0xbd0b29);
  _0x410efa.addEventListener?.("error", _0x4f8684);
  let _0x508248 = null;
  if (_0x3571cf.highResolutionUrl) {
    _0x508248 = documentObject.createElement("video");
    _0x508248.classList.add("source-video-fullscreen-media");
    _0x508248.controls = false;
    _0x508248.loop = true;
    _0x508248.muted = !!muted;
    _0x508248.playsInline = true;
    _0x508248.preload = "auto";
    setPlaybackTime(_0x508248, currentTime);
    _0x1d49ae.appendChild(_0x508248);
  }
  _0x1d49ae.appendChild(_0x410efa);
  _0x33fea3.appendChild(_0x1d49ae);
  documentObject.body.appendChild(_0x33fea3);
  const _0x50ab0e = _0x84130c => {
    if (!_0x84130c) {
      return;
    }
    clearDesktopMediaPlaybackSourceMetadata(_0x84130c);
    _0x84130c.removeAttribute?.("src");
    try {
      _0x84130c.load?.();
    } catch {}
  };
  const _0x1bd50b = () => {
    if (_0x8db6fa) {
      return;
    }
    _0x8db6fa = true;
    try {
      _0x410efa.pause?.();
    } catch {}
    try {
      _0x508248?.pause?.();
    } catch {}
    resetFrame(_0x508248);
    _0x410efa.removeEventListener?.("loadeddata", _0xbd0b29);
    _0x410efa.removeEventListener?.("canplay", _0xbd0b29);
    _0x410efa.removeEventListener?.("playing", _0xbd0b29);
    _0x410efa.removeEventListener?.("error", _0x4f8684);
    _0x50ab0e(_0x410efa);
    _0x50ab0e(_0x508248);
    documentObject.removeEventListener?.("keydown", _0x3b1884, true);
    _0x33fea3.remove?.();
  };
  const _0x3b1884 = _0x848dac => {
    if (_0x848dac?.key !== "Escape") {
      return;
    }
    _0x848dac.preventDefault?.();
    _0x848dac.stopPropagation?.();
    _0x1bd50b();
  };
  _0x33fea3.addEventListener("click", _0x16d4b8 => {
    if (_0x16d4b8.target === _0x33fea3) {
      _0x1bd50b();
    }
  });
  documentObject.addEventListener?.("keydown", _0x3b1884, true);
  function _0x117d83(_0x24e1e8 = "") {
    const _0x15e6b0 = normalizeSource(_0x24e1e8);
    return Promise.resolve(attachSource(_0x410efa, _0x3571cf.previewUrl, {
      ...(_0x15e6b0 ? {
        playbackUrl: _0x15e6b0
      } : {}),
      preload: "auto",
      load: true,
      shouldAssign: () => !_0x8db6fa
    })).then(() => {
      if (_0x8db6fa) {
        return false;
      }
      setPlaybackTime(_0x410efa, currentTime);
      playSilently(_0x410efa);
      return true;
    });
  }
  _0x117d83(previewPlaybackUrl).catch(() => {
    if (_0x8db6fa) {
      return;
    }
    if (!_0x31e99f && normalizeSource(previewPlaybackUrl)) {
      _0x31e99f = true;
      _0x50ab0e(_0x410efa);
      _0x117d83("").catch(_0x328a3a);
      return;
    }
    _0x328a3a();
  });
  if (_0x508248) {
    const _0x5a729d = _0x508248;
    let _0x3c02d6 = false;
    const _0x2f4a34 = () => {
      if (_0x8db6fa || !hasPresentedFrame(_0x5a729d, _0x3571cf.highResolutionUrl)) {
        return;
      }
      const _0x22811b = Number(_0x410efa.currentTime || 0);
      const _0x364646 = Number(_0x5a729d.currentTime || 0);
      if (Math.abs(_0x22811b - _0x364646) > 0.25) {
        resetFrame(_0x5a729d);
        setPlaybackTime(_0x5a729d, _0x22811b);
        watchFrame(_0x5a729d, _0x2f4a34);
        return;
      }
      const _0x3cba2c = _0x410efa.paused === false;
      _0x5a729d.controls = true;
      _0x5a729d.muted = _0x410efa.muted;
      _0x5a729d.classList.add("is-active");
      _0x410efa.classList.remove("is-active");
      if (_0x3cba2c) {
        playSilently(_0x5a729d);
      }
      try {
        _0x410efa.pause?.();
      } catch {}
    };
    const _0x3ac3f3 = () => {
      _0x3c02d6 = watchFrame(_0x5a729d, _0x2f4a34) || _0x3c02d6;
    };
    _0x5a729d.addEventListener?.("loadedmetadata", () => {
      setPlaybackTime(_0x5a729d, _0x410efa.currentTime || currentTime);
    });
    Promise.resolve(attachSource(_0x5a729d, _0x3571cf.highResolutionUrl, {
      preload: "auto",
      load: true,
      onSourceAssigned: _0x3ac3f3,
      shouldAssign: () => !_0x8db6fa
    })).then(() => {
      if (_0x8db6fa) {
        return;
      }
      if (!_0x3c02d6) {
        _0x3ac3f3();
      }
    }).catch(() => {});
  }
  return {
    overlay: _0x33fea3,
    stage: _0x1d49ae,
    previewVideo: _0x410efa,
    highResolutionVideo: _0x508248,
    close: _0x1bd50b,
    sources: _0x3571cf
  };
}