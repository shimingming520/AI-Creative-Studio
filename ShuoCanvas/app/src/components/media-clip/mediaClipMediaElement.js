import { attachMediaElementPlaybackSource } from "../../services/desktopMediaBlobSource.js";
import { firstNonEmpty, normalizeText } from "./mediaClipUtils.js";
export function isRenderableUrl(_0x24868d) {
  const _0x29f0d1 = normalizeText(_0x24868d);
  return /^(?:https?:|data:|blob:|aic-local-preview:|\/)/i.test(_0x29f0d1);
}
export function isUsableMediaElement(_0x2dd337) {
  if (!_0x2dd337) {
    return false;
  }
  try {
    const _0x1ca8d3 = window.getComputedStyle(_0x2dd337);
    if (_0x1ca8d3.display === "none" || _0x1ca8d3.visibility === "hidden") {
      return false;
    }
    const _0x4996eb = Number(_0x1ca8d3.opacity);
    if (Number.isFinite(_0x4996eb) && _0x4996eb <= 0) {
      return false;
    }
    const _0x57f4b7 = _0x2dd337.getBoundingClientRect();
    if (!_0x57f4b7.width || !_0x57f4b7.height) {
      return false;
    }
  } catch {}
  return true;
}
export function disposeMediaElement(_0x2a6daa) {
  if (!_0x2a6daa) {
    return;
  }
  try {
    _0x2a6daa.pause?.();
  } catch {}
  try {
    _0x2a6daa.removeAttribute?.("src");
    _0x2a6daa.load?.();
  } catch {}
}
export function setMediaElementSource(_0x286d1e, _0x4a0979, {
  attachSource = attachMediaElementPlaybackSource
} = {}) {
  if (!_0x286d1e) {
    return false;
  }
  const _0x4af07d = normalizeText(_0x4a0979);
  const _0x1ed01c = firstNonEmpty(_0x286d1e.__mediaClipRequestedSourceUrl, _0x286d1e.dataset?.desktopMediaSourceUrl, _0x286d1e.dataset?.mediaClipSourceUrl, _0x286d1e.getAttribute?.("src"), _0x286d1e.currentSrc, _0x286d1e.src);
  if (!_0x4af07d) {
    if (_0x1ed01c) {
      disposeMediaElement(_0x286d1e);
    }
    _0x286d1e.__mediaClipRequestedSourceUrl = "";
    if (_0x286d1e.dataset) {
      delete _0x286d1e.dataset.desktopMediaSourceUrl;
      delete _0x286d1e.dataset.mediaClipSourceUrl;
    }
    return false;
  }
  if (_0x1ed01c === _0x4af07d) {
    return false;
  }
  try {
    _0x286d1e.pause?.();
  } catch {}
  _0x286d1e.__mediaClipRequestedSourceUrl = _0x4af07d;
  if (_0x286d1e.dataset) {
    _0x286d1e.dataset.mediaClipSourceUrl = _0x4af07d;
  }
  const _0xe49c81 = () => normalizeText(_0x286d1e.__mediaClipRequestedSourceUrl) === _0x4af07d;
  const _0x45281a = attachSource(_0x286d1e, _0x4af07d, {
    preload: _0x286d1e.preload || "auto",
    shouldAssign: _0xe49c81
  }).catch(() => {
    if (_0xe49c81() && !firstNonEmpty(_0x286d1e.getAttribute?.("src"), _0x286d1e.currentSrc, _0x286d1e.src)) {
      _0x286d1e.src = _0x4af07d;
      try {
        _0x286d1e.load?.();
      } catch {}
    }
    return firstNonEmpty(_0x286d1e.getAttribute?.("src"), _0x286d1e.currentSrc, _0x286d1e.src);
  });
  _0x286d1e.__mediaClipSourcePromise = _0x45281a;
  _0x45281a.finally(() => {
    if (_0x286d1e.__mediaClipSourcePromise === _0x45281a) {
      _0x286d1e.__mediaClipSourcePromise = null;
    }
  });
  return true;
}