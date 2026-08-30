import { getImage } from "./storage.js";
import { firstNonEmpty } from "../utils/validators.js";
import { resolveCanvasImageDisplayUrl, resolveCanvasImagePreviewUrl, resolveCanvasImageSourceUrl, resolveCanvasImageThumbUrl } from "../services/canvasMediaLocalService.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata } from "../services/desktopMediaBlobSource.js";
import { acquireLocalVideoPlaybackObjectUrl, releaseLocalVideoPlaybackObjectUrlOwner } from "../services/localVideoPlaybackObjectUrlService.js";
export async function resolveNodeImageOriginalSource(_0x288c78) {
  if (!_0x288c78) {
    return null;
  }
  const _0x49cee4 = Array.isArray(_0x288c78.images) ? _0x288c78.images : [];
  const _0x5f5c25 = _0x288c78.mainImageIndex || 0;
  const _0x16ff93 = _0x49cee4[_0x5f5c25] || null;
  const _0x18342d = firstNonEmpty(_0x16ff93?.sourceId, _0x288c78.sourceId);
  if (_0x18342d) {
    try {
      const _0x5ff01a = await getImage(_0x18342d);
      if (_0x5ff01a) {
        return {
          url: URL.createObjectURL(_0x5ff01a),
          revokeUrlOnClose: true
        };
      }
    } catch (_0x496e2d) {}
  }
  const _0x2a9a6a = firstNonEmpty(resolveCanvasImageSourceUrl(_0x16ff93), resolveCanvasImageSourceUrl(_0x288c78));
  if (_0x2a9a6a) {
    return {
      url: _0x2a9a6a,
      revokeUrlOnClose: false
    };
  }
  return null;
}
export async function resolveNodeImagePreviewSource(_0x2d3ab9) {
  const _0x43c37c = await resolveNodeImageOriginalSource(_0x2d3ab9);
  if (_0x43c37c?.url) {
    return _0x43c37c;
  }
  const _0x2da2ca = Array.isArray(_0x2d3ab9?.images) ? _0x2d3ab9.images : [];
  const _0x3c2ef6 = _0x2d3ab9?.mainImageIndex || 0;
  const _0x2b8090 = _0x2da2ca[_0x3c2ef6] || null;
  const _0x5dfb9b = firstNonEmpty(resolveCanvasImagePreviewUrl(_0x2b8090), resolveCanvasImagePreviewUrl(_0x2d3ab9));
  if (_0x5dfb9b) {
    return {
      url: _0x5dfb9b,
      revokeUrlOnClose: false
    };
  }
  const _0x3288b2 = firstNonEmpty(resolveCanvasImageThumbUrl(_0x2b8090), resolveCanvasImageThumbUrl(_0x2d3ab9));
  if (_0x3288b2) {
    return {
      url: _0x3288b2,
      revokeUrlOnClose: false
    };
  }
  return null;
}
function markSidebarSubmenuOwner(_0x27737d, _0x45985a) {
  const _0x373ab5 = String(_0x45985a || "").trim();
  if (_0x373ab5) {
    _0x27737d.dataset.sidebarSubmenuOwner = _0x373ab5;
  }
}
function collectUniquePreviewUrls(_0x5b0b65 = []) {
  const _0x3f3703 = [];
  const _0x5f0c33 = new Set();
  for (const _0x317cc5 of _0x5b0b65) {
    const _0xd5d269 = String(_0x317cc5 || "").trim();
    if (!_0xd5d269 || _0x5f0c33.has(_0xd5d269)) {
      continue;
    }
    _0x5f0c33.add(_0xd5d269);
    _0x3f3703.push(_0xd5d269);
  }
  return _0x3f3703;
}
function resolveImmediateNodeImagePreviewUrls(_0x4eea23, _0x5a827c = "") {
  const _0x38abe4 = Array.isArray(_0x4eea23?.images) ? _0x4eea23.images : [];
  const _0x3df180 = Math.max(0, Number(_0x4eea23?.mainImageIndex) || 0);
  const _0xc7abc3 = _0x38abe4[_0x3df180] || _0x38abe4[0] || null;
  return collectUniquePreviewUrls([_0x5a827c, resolveCanvasImageDisplayUrl(_0xc7abc3), resolveCanvasImageDisplayUrl(_0x4eea23), resolveCanvasImagePreviewUrl(_0xc7abc3), resolveCanvasImagePreviewUrl(_0x4eea23), resolveCanvasImageThumbUrl(_0xc7abc3), resolveCanvasImageThumbUrl(_0x4eea23)]);
}
const IMAGE_PREVIEW_MIN_SCALE = 0.25;
const IMAGE_PREVIEW_MAX_SCALE = 6;
const IMAGE_PREVIEW_WHEEL_INTENSITY = 0.0015;
let activeImagePreviewClose = null;
let activeVideoPreviewClose = null;
let videoPreviewOwnerSequence = 0;
export function closeActiveImagePreview() {
  if (typeof activeImagePreviewClose !== "function") {
    return false;
  }
  const _0x2a7cd4 = activeImagePreviewClose;
  _0x2a7cd4();
  return true;
}
export function closeActiveVideoPreview() {
  if (typeof activeVideoPreviewClose !== "function") {
    return false;
  }
  const _0x45efda = activeVideoPreviewClose;
  _0x45efda();
  return true;
}
function clampNumber(_0x2bb737, _0x347ba8, _0x466491) {
  const _0x141a77 = Number(_0x2bb737);
  if (!Number.isFinite(_0x141a77)) {
    return _0x347ba8;
  }
  return Math.min(_0x466491, Math.max(_0x347ba8, _0x141a77));
}
function stopPreviewEvent(_0x515cea) {
  _0x515cea?.preventDefault?.();
  _0x515cea?.stopPropagation?.();
}
function getOverlayCenterPoint(_0x18b045) {
  const _0x5a11ca = _0x18b045.getBoundingClientRect?.();
  if (!_0x5a11ca) {
    return {
      x: (globalThis.window?.innerWidth || 0) / 2,
      y: (globalThis.window?.innerHeight || 0) / 2
    };
  }
  return {
    x: _0x5a11ca.left + _0x5a11ca.width / 2,
    y: _0x5a11ca.top + _0x5a11ca.height / 2
  };
}
function isPointerInsideElementBounds(_0x3e0376, _0x5729c0) {
  if (!_0x3e0376 || !_0x5729c0) {
    return false;
  }
  const _0x327284 = Number(_0x5729c0.clientX);
  const _0x337fba = Number(_0x5729c0.clientY);
  if (!Number.isFinite(_0x327284) || !Number.isFinite(_0x337fba)) {
    return _0x5729c0.target === _0x3e0376;
  }
  const _0x3da221 = _0x3e0376.getBoundingClientRect?.();
  if (!_0x3da221) {
    return _0x5729c0.target === _0x3e0376;
  }
  const _0x56f53e = Number(_0x3da221.left);
  const _0x35a3aa = Number(_0x3da221.top);
  const _0x328f42 = Number.isFinite(Number(_0x3da221.right)) ? Number(_0x3da221.right) : _0x56f53e + Number(_0x3da221.width || 0);
  const _0x4ac252 = Number.isFinite(Number(_0x3da221.bottom)) ? Number(_0x3da221.bottom) : _0x35a3aa + Number(_0x3da221.height || 0);
  if (!Number.isFinite(_0x56f53e) || !Number.isFinite(_0x35a3aa) || !Number.isFinite(_0x328f42) || !Number.isFinite(_0x4ac252) || _0x328f42 <= _0x56f53e || _0x4ac252 <= _0x35a3aa) {
    return _0x5729c0.target === _0x3e0376;
  }
  return _0x327284 >= _0x56f53e && _0x327284 <= _0x328f42 && _0x337fba >= _0x35a3aa && _0x337fba <= _0x4ac252;
}
function applyImagePreviewTransform(_0x302588, _0x560ab7, _0x578bc7) {
  _0x302588.style.setProperty("--image-preview-offset-x", Math.round(_0x578bc7.offsetX * 100) / 100 + "px");
  _0x302588.style.setProperty("--image-preview-offset-y", Math.round(_0x578bc7.offsetY * 100) / 100 + "px");
  _0x560ab7.style.setProperty("--image-preview-scale", String(Math.round(_0x578bc7.scale * 1000) / 1000));
}
export function openImagePreview(_0x1df97d, _0x5e8868 = {}) {
  const _0x758442 = _0x5e8868.deferredSource === true;
  if (!_0x1df97d && !_0x758442) {
    return () => {};
  }
  closeActiveVideoPreview();
  closeActiveImagePreview();
  let _0x22af35 = collectUniquePreviewUrls([_0x1df97d, ...(Array.isArray(_0x5e8868.fallbackUrls) ? _0x5e8868.fallbackUrls : [])]);
  const _0x1031d6 = new Set();
  if (_0x5e8868.revokeUrlOnClose && _0x1df97d) {
    _0x1031d6.add(_0x1df97d);
  }
  const _0x553d60 = {
    scale: 1,
    offsetX: 0,
    offsetY: 0
  };
  let _0x215951 = null;
  let _0x5d3e7a = false;
  const _0x360d3e = document.createElement("div");
  _0x360d3e.className = "v2-image-preview-overlay";
  _0x360d3e.style.zIndex = "99999";
  markSidebarSubmenuOwner(_0x360d3e, _0x5e8868.sidebarSubmenuOwner);
  const _0x4c9617 = document.createElement("div");
  _0x4c9617.className = "v2-image-preview-stage";
  const _0xb1b01b = document.createElement("img");
  _0xb1b01b.className = "v2-image-preview-media";
  _0xb1b01b.alt = _0x5e8868.alt || "Image preview";
  _0xb1b01b.draggable = false;
  let _0x5925e0 = 0;
  const _0x1e39e8 = _0x2722aa => {
    if (!_0x22af35[_0x2722aa]) {
      return false;
    }
    _0x5925e0 = _0x2722aa;
    _0x360d3e.classList.add("is-loading");
    _0x360d3e.classList.remove("is-error");
    _0xb1b01b.src = _0x22af35[_0x5925e0];
    return true;
  };
  const _0x2ff458 = () => {
    _0x360d3e.classList.remove("is-loading", "is-error");
  };
  const _0x13aab7 = () => {
    const _0x4a62f6 = _0x5925e0 + 1;
    if (_0x4a62f6 < _0x22af35.length) {
      _0x1e39e8(_0x4a62f6);
      return;
    }
    _0x360d3e.classList.remove("is-loading");
    _0x360d3e.classList.add("is-error");
  };
  _0xb1b01b.addEventListener("load", _0x2ff458);
  _0xb1b01b.addEventListener("error", _0x13aab7);
  if (!_0x1e39e8(0)) {
    _0x360d3e.classList.add("is-loading");
  }
  applyImagePreviewTransform(_0x4c9617, _0xb1b01b, _0x553d60);
  const _0xd5ce59 = () => {
    globalThis.window?.removeEventListener?.("pointermove", _0x1c794b, true);
    globalThis.window?.removeEventListener?.("pointerup", _0x2c28aa, true);
    globalThis.window?.removeEventListener?.("pointercancel", _0x2c28aa, true);
  };
  const _0x166275 = () => {
    _0xd5ce59();
    _0x360d3e.classList.remove("is-panning");
    _0x215951 = null;
  };
  const _0x54d2a4 = () => {
    if (_0x5d3e7a) {
      return;
    }
    _0x5d3e7a = true;
    document.removeEventListener("keydown", _0x32b23f, true);
    _0x166275();
    _0xb1b01b.removeEventListener("load", _0x2ff458);
    _0xb1b01b.removeEventListener("error", _0x13aab7);
    _0x360d3e.remove();
    for (const _0x341f5b of _0x1031d6) {
      try {
        URL.revokeObjectURL(_0x341f5b);
      } catch (_0x431ea1) {}
    }
    if (activeImagePreviewClose === _0x54d2a4) {
      activeImagePreviewClose = null;
    }
  };
  const _0x32b23f = _0x33dcb8 => {
    if (_0x33dcb8.key === "Escape") {
      _0x33dcb8.preventDefault?.();
      _0x33dcb8.stopPropagation?.();
      _0x54d2a4();
    }
  };
  const _0x446e3b = _0x3f8eba => {
    stopPreviewEvent(_0x3f8eba);
    const _0x3358ae = _0x553d60.scale;
    const _0x435e9f = Math.exp(-Number(_0x3f8eba.deltaY || 0) * IMAGE_PREVIEW_WHEEL_INTENSITY);
    const _0x4534df = clampNumber(_0x3358ae * _0x435e9f, IMAGE_PREVIEW_MIN_SCALE, IMAGE_PREVIEW_MAX_SCALE);
    if (_0x4534df === _0x3358ae) {
      return;
    }
    const _0x622545 = getOverlayCenterPoint(_0x360d3e);
    const _0x36301c = Number(_0x3f8eba.clientX || 0) - _0x622545.x;
    const _0x223687 = Number(_0x3f8eba.clientY || 0) - _0x622545.y;
    const _0x5448c0 = _0x4534df / _0x3358ae;
    _0x553d60.offsetX = _0x36301c - (_0x36301c - _0x553d60.offsetX) * _0x5448c0;
    _0x553d60.offsetY = _0x223687 - (_0x223687 - _0x553d60.offsetY) * _0x5448c0;
    _0x553d60.scale = _0x4534df;
    applyImagePreviewTransform(_0x4c9617, _0xb1b01b, _0x553d60);
  };
  const _0xf6bf10 = _0x4f2dd8 => {
    const _0x24a7c0 = Number(_0x4f2dd8?.button ?? 0);
    const _0x4f70b9 = _0x24a7c0 === 1;
    if (!_0x4f70b9 && _0x24a7c0 !== 0) {
      return;
    }
    if (!_0x4f70b9 && !isPointerInsideElementBounds(_0xb1b01b, _0x4f2dd8)) {
      return;
    }
    stopPreviewEvent(_0x4f2dd8);
    _0x166275();
    _0x215951 = {
      pointerId: _0x4f2dd8.pointerId,
      startX: Number(_0x4f2dd8.clientX || 0),
      startY: Number(_0x4f2dd8.clientY || 0),
      offsetX: _0x553d60.offsetX,
      offsetY: _0x553d60.offsetY
    };
    _0x360d3e.classList.add("is-panning");
    _0x4c9617.setPointerCapture?.(_0x4f2dd8.pointerId);
    globalThis.window?.addEventListener?.("pointermove", _0x1c794b, true);
    globalThis.window?.addEventListener?.("pointerup", _0x2c28aa, true);
    globalThis.window?.addEventListener?.("pointercancel", _0x2c28aa, true);
  };
  function _0x1c794b(_0x5d65fc) {
    if (!_0x215951) {
      return;
    }
    if (_0x215951.pointerId != null && _0x5d65fc.pointerId != null && _0x5d65fc.pointerId !== _0x215951.pointerId) {
      return;
    }
    stopPreviewEvent(_0x5d65fc);
    _0x553d60.offsetX = _0x215951.offsetX + Number(_0x5d65fc.clientX || 0) - _0x215951.startX;
    _0x553d60.offsetY = _0x215951.offsetY + Number(_0x5d65fc.clientY || 0) - _0x215951.startY;
    applyImagePreviewTransform(_0x4c9617, _0xb1b01b, _0x553d60);
  }
  function _0x2c28aa(_0x395eac) {
    if (!_0x215951) {
      return;
    }
    if (_0x215951.pointerId != null && _0x395eac?.pointerId != null && _0x395eac.pointerId !== _0x215951.pointerId) {
      return;
    }
    stopPreviewEvent(_0x395eac);
    try {
      _0x4c9617.releasePointerCapture?.(_0x215951.pointerId);
    } catch (_0x6a39ee) {}
    _0x166275();
  }
  _0x360d3e.addEventListener("click", _0x1df550 => {
    if (isPointerInsideElementBounds(_0xb1b01b, _0x1df550)) {
      _0x1df550.stopPropagation();
      return;
    }
    _0x54d2a4();
  });
  _0x360d3e.addEventListener("wheel", _0x446e3b, {
    passive: false
  });
  _0x360d3e.addEventListener("pointerdown", _0xf6bf10);
  _0x360d3e.addEventListener("auxclick", _0x17d47c => {
    if (_0x17d47c.button === 1) {
      stopPreviewEvent(_0x17d47c);
    }
  });
  _0xb1b01b.addEventListener("dragstart", stopPreviewEvent);
  _0x4c9617.appendChild(_0xb1b01b);
  _0x360d3e.appendChild(_0x4c9617);
  document.addEventListener("keydown", _0x32b23f, true);
  document.body.appendChild(_0x360d3e);
  activeImagePreviewClose = _0x54d2a4;
  _0x54d2a4.setSources = (_0x2b5dc9, _0x18aff7 = {}) => {
    if (_0x5d3e7a) {
      return false;
    }
    const _0xbdfb48 = collectUniquePreviewUrls(_0x2b5dc9);
    if (_0xbdfb48.length === 0) {
      _0x360d3e.classList.remove("is-loading");
      _0x360d3e.classList.add("is-error");
      return false;
    }
    _0x22af35 = _0xbdfb48;
    if (_0x18aff7.revokeUrlOnClose) {
      _0xbdfb48.forEach(_0x4cabd2 => _0x1031d6.add(_0x4cabd2));
    }
    return _0x1e39e8(0);
  };
  _0x54d2a4.setError = () => {
    if (_0x5d3e7a) {
      return false;
    }
    _0x360d3e.classList.remove("is-loading");
    _0x360d3e.classList.add("is-error");
    return true;
  };
  return _0x54d2a4;
}
export function openVideoPreview(_0x359f96, _0x5206bb = {}) {
  const _0xc2fc8d = String(_0x359f96 || "").trim();
  if (!_0xc2fc8d) {
    return () => {};
  }
  closeActiveImagePreview();
  closeActiveVideoPreview();
  const _0x3ab56e = typeof _0x5206bb.acquirePlaybackUrl === "function" ? _0x5206bb.acquirePlaybackUrl : acquireLocalVideoPlaybackObjectUrl;
  const _0xfd9243 = typeof _0x5206bb.releasePlaybackUrlOwner === "function" ? _0x5206bb.releasePlaybackUrlOwner : releaseLocalVideoPlaybackObjectUrlOwner;
  const _0xf18c04 = typeof _0x5206bb.attachSource === "function" ? _0x5206bb.attachSource : attachMediaElementPlaybackSource;
  const _0x5d75b0 = "video-preview:" + ++videoPreviewOwnerSequence;
  const _0x1f06b0 = String(_0x5206bb.playbackUrl || "").trim();
  let _0x586660 = false;
  let _0x526fd4 = false;
  let _0x12b5ec = false;
  let _0x1d21bc = 0;
  let _0x3b3a31 = "";
  const _0x33fd25 = document.createElement("div");
  _0x33fd25.className = "v2-image-preview-overlay v2-video-preview-overlay is-loading";
  if (_0x5206bb.overlayDataset && typeof _0x5206bb.overlayDataset === "object") {
    for (const [_0x2c1048, _0x5065a7] of Object.entries(_0x5206bb.overlayDataset)) {
      if (!_0x2c1048 || _0x5065a7 == null) {
        continue;
      }
      _0x33fd25.dataset[_0x2c1048] = String(_0x5065a7);
    }
  }
  markSidebarSubmenuOwner(_0x33fd25, _0x5206bb.sidebarSubmenuOwner);
  _0x33fd25.setAttribute?.("role", "dialog");
  _0x33fd25.setAttribute?.("aria-modal", "true");
  _0x33fd25.setAttribute?.("aria-label", _0x5206bb.ariaLabel || "Video preview");
  const _0x4f2e93 = document.createElement("video");
  _0x4f2e93.className = "v2-video-preview-media";
  _0x4f2e93.controls = true;
  _0x4f2e93.autoplay = _0x5206bb.autoplay !== false;
  _0x4f2e93.loop = _0x5206bb.loop !== false;
  _0x4f2e93.muted = !!_0x5206bb.muted;
  _0x4f2e93.playsInline = true;
  _0x4f2e93.preload = "auto";
  const _0x52774c = () => String(_0x4f2e93.getAttribute?.("src") || _0x4f2e93.src || _0x4f2e93.currentSrc || "").trim();
  const _0xa852fd = () => {
    clearDesktopMediaPlaybackSourceMetadata(_0x4f2e93);
    _0x4f2e93.removeAttribute?.("src");
    try {
      _0x4f2e93.load?.();
    } catch {}
    _0x3b3a31 = "";
  };
  const _0x593023 = () => {
    if (_0x586660) {
      return;
    }
    _0x33fd25.classList.add("is-loading");
    _0x33fd25.classList.remove("is-error");
  };
  const _0x293db1 = () => {
    if (_0x586660) {
      return;
    }
    _0x33fd25.classList.remove("is-loading", "is-error");
  };
  const _0x3b1528 = () => {
    if (_0x586660) {
      return;
    }
    _0x33fd25.classList.remove("is-loading");
    _0x33fd25.classList.add("is-error");
  };
  const _0x56e5c1 = () => {
    if (_0x586660 || _0x5206bb.autoplay === false) {
      return false;
    }
    const _0x3a60ae = _0x52774c();
    if (!_0x3a60ae || _0x3b3a31 === _0x3a60ae) {
      return false;
    }
    _0x3b3a31 = _0x3a60ae;
    try {
      const _0x3bb8b9 = _0x4f2e93.play?.();
      _0x3bb8b9?.catch?.(() => {});
    } catch {}
    return true;
  };
  let _0x3b0940;
  try {
    _0x3b0940 = Promise.resolve(_0x3ab56e(_0xc2fc8d, _0x5d75b0)).then(_0x4827fd => String(_0x4827fd || "").trim(), () => "");
  } catch {
    _0x3b0940 = Promise.resolve("");
  }
  const _0x55f70f = async _0x268790 => {
    if (_0x586660) {
      return false;
    }
    const _0x28a1a5 = String(_0x268790 || _0xc2fc8d).trim();
    if (!_0x28a1a5) {
      return false;
    }
    const _0x54433 = ++_0x1d21bc;
    try {
      const _0x109154 = _0xf18c04(_0x4f2e93, _0xc2fc8d, {
        playbackUrl: _0x28a1a5,
        preload: "auto",
        load: true,
        shouldAssign: () => !_0x586660 && _0x54433 === _0x1d21bc
      });
      _0x56e5c1();
      const _0x51ae66 = await _0x109154;
      if (_0x586660 || _0x54433 !== _0x1d21bc) {
        return false;
      }
      if (!String(_0x51ae66 || "").trim() && !_0x52774c()) {
        return false;
      }
      _0x56e5c1();
      return true;
    } catch {
      return false;
    }
  };
  const _0x28c493 = async (_0x2626a6 = "") => {
    if (_0x586660) {
      return false;
    }
    if (_0x12b5ec) {
      _0x3b1528();
      return false;
    }
    _0x12b5ec = true;
    _0x593023();
    const _0x2dad55 = await _0x3b0940;
    if (_0x586660) {
      return false;
    }
    const _0x5e82c9 = String(_0x2626a6 || "").trim();
    const _0x2118d9 = _0x52774c();
    const _0x1e9c1c = collectUniquePreviewUrls([_0x2dad55, _0xc2fc8d]).filter(_0x15e198 => _0x15e198 !== _0x5e82c9 && _0x15e198 !== _0x2118d9);
    for (const _0x2c59e5 of _0x1e9c1c) {
      if (_0x52774c()) {
        _0xa852fd();
      }
      if (await _0x55f70f(_0x2c59e5)) {
        return true;
      }
    }
    _0x3b1528();
    return false;
  };
  const _0x50fe63 = () => _0x293db1();
  const _0x42ad91 = () => {
    _0x28c493(_0x52774c());
  };
  _0x4f2e93.addEventListener("loadeddata", _0x50fe63);
  _0x4f2e93.addEventListener("canplay", _0x50fe63);
  _0x4f2e93.addEventListener("playing", _0x50fe63);
  _0x4f2e93.addEventListener("error", _0x42ad91);
  const _0x49f467 = () => {
    if (_0x526fd4) {
      return;
    }
    _0x526fd4 = true;
    try {
      _0xfd9243(_0x5d75b0);
    } catch {}
  };
  const _0x74127d = () => {
    if (_0x586660) {
      return;
    }
    _0x586660 = true;
    _0x1d21bc += 1;
    document.removeEventListener("keydown", _0xe6473c, true);
    _0x4f2e93.removeEventListener?.("loadeddata", _0x50fe63);
    _0x4f2e93.removeEventListener?.("canplay", _0x50fe63);
    _0x4f2e93.removeEventListener?.("playing", _0x50fe63);
    _0x4f2e93.removeEventListener?.("error", _0x42ad91);
    try {
      _0x4f2e93.pause();
    } catch (_0x5cd06d) {}
    _0xa852fd();
    _0x49f467();
    _0x33fd25.remove();
    if (activeVideoPreviewClose === _0x74127d) {
      activeVideoPreviewClose = null;
    }
  };
  const _0xe6473c = _0x353235 => {
    if (_0x353235.key === "Escape") {
      _0x353235.preventDefault?.();
      _0x353235.stopPropagation?.();
      _0x74127d();
    }
  };
  _0x33fd25.addEventListener("click", _0x5e569e => {
    if (_0x5e569e.target === _0x33fd25) {
      _0x74127d();
    }
  });
  _0x33fd25.appendChild(_0x4f2e93);
  document.addEventListener("keydown", _0xe6473c, true);
  document.body.appendChild(_0x33fd25);
  activeVideoPreviewClose = _0x74127d;
  if (_0x1f06b0) {
    _0x55f70f(_0x1f06b0).then(_0xd5955 => {
      if (!_0xd5955) {
        _0x28c493(_0x1f06b0);
      }
    });
  } else {
    _0x3b0940.then(_0x32eee1 => {
      if (_0x586660) {
        return false;
      }
      return _0x55f70f(_0x32eee1 || _0xc2fc8d);
    }).then(_0x3a6a3f => {
      if (!_0x586660 && _0x3a6a3f === false) {
        _0x28c493(_0x52774c());
      }
    });
  }
  return _0x74127d;
}
export async function openNodeImagePreview(_0x3e595d, _0x198376 = {}) {
  const _0x5c8551 = resolveImmediateNodeImagePreviewUrls(_0x3e595d, _0x198376.currentSrc);
  const _0x508803 = _0x5c8551.length > 0;
  const _0x18b79f = _0x508803 ? openImagePreview(_0x5c8551[0], {
    ..._0x198376,
    fallbackUrls: _0x5c8551.slice(1),
    revokeUrlOnClose: false
  }) : openImagePreview("", {
    ..._0x198376,
    deferredSource: true,
    revokeUrlOnClose: false
  });
  const _0x288d15 = typeof _0x198376.sourceResolver === "function" ? _0x198376.sourceResolver : resolveNodeImagePreviewSource;
  Promise.resolve().then(() => _0x288d15(_0x3e595d)).then(_0x1bc438 => {
    if (!_0x1bc438?.url) {
      if (!_0x508803) {
        _0x18b79f.setError?.();
      }
      return;
    }
    const _0x5be3f7 = _0x18b79f.setSources?.(collectUniquePreviewUrls([_0x1bc438.url, ..._0x5c8551]), {
      revokeUrlOnClose: _0x1bc438.revokeUrlOnClose
    });
    if (!_0x5be3f7 && _0x1bc438.revokeUrlOnClose) {
      try {
        URL.revokeObjectURL(_0x1bc438.url);
      } catch (_0x45ec13) {}
    }
  }).catch(() => {
    if (!_0x508803) {
      _0x18b79f.setError?.();
    }
  });
  return _0x18b79f;
}