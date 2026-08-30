import { clearDesktopMediaPlaybackSourceMetadata } from "../../services/desktopMediaBlobSource.js";
function normalizeText(_0x11c7c4) {
  return String(_0x11c7c4 ?? "").trim();
}
function releaseCompositeMediaElement({
  videoEl: _0x21a5b4
} = {}) {
  if (!_0x21a5b4) {
    return;
  }
  try {
    _0x21a5b4.pause?.();
    _0x21a5b4.removeAttribute?.("src");
    clearDesktopMediaPlaybackSourceMetadata(_0x21a5b4);
    _0x21a5b4.preload = "none";
    _0x21a5b4.load?.();
    _0x21a5b4.remove?.();
  } catch {}
}
function adoptCompositeMediaElement(_0x1617d4, _0x37ba63, {
  role: _0x4f5285,
  sourceUrl: _0x26c564
}) {
  const _0x1674c8 = _0x1617d4 === _0x37ba63;
  if (!_0x1674c8 && typeof _0x37ba63.replaceWith !== "function") {
    throw new Error("composite media placeholder cannot be replaced");
  }
  try {
    _0x1617d4.pause?.();
    _0x1617d4.currentTime = 0;
  } catch {}
  _0x1617d4.className = _0x37ba63.className || "";
  _0x1617d4.dataset.personReplacementCompareVideo = _0x4f5285;
  _0x1617d4.dataset.personReplacementCompareVideoUrl = _0x26c564;
  _0x1617d4.preload = "auto";
  _0x1617d4.muted = true;
  _0x1617d4.removeAttribute?.("aria-hidden");
  _0x1617d4.removeAttribute?.("tabindex");
  _0x1617d4.setAttribute?.("playsinline", "");
  ["poster", "aria-label"].forEach(_0x3a5d9a => {
    const _0x1b3d62 = _0x37ba63.getAttribute?.(_0x3a5d9a);
    if (_0x1b3d62) {
      _0x1617d4.setAttribute?.(_0x3a5d9a, _0x1b3d62);
    } else {
      _0x1617d4.removeAttribute?.(_0x3a5d9a);
    }
  });
  if (!_0x1674c8) {
    _0x37ba63.replaceWith(_0x1617d4);
  }
}
export function createPersonReplacementCompositeMediaResidency({
  projectId = "",
  releaseMedia = releaseCompositeMediaElement
} = {}) {
  let _0x4c794e = normalizeText(projectId);
  let _0x40a2e4 = false;
  const _0x598783 = new Map();
  const _0x5a4a0a = new Map();
  const _0x5528c9 = new WeakSet();
  const _0x3e5cab = new WeakSet();
  const _0x3cf302 = _0xe81eb7 => {
    if (!_0xe81eb7) {
      return false;
    }
    const _0x436c60 = _0xe81eb7.controller;
    if (_0x436c60 && typeof _0x436c60 === "object" && !_0x5528c9.has(_0x436c60)) {
      _0x5528c9.add(_0x436c60);
      try {
        _0x436c60.destroy?.();
      } catch {}
    }
    const _0x1326ac = _0xe81eb7.videoEl;
    if (_0x1326ac && typeof _0x1326ac === "object" && !_0x3e5cab.has(_0x1326ac)) {
      _0x3e5cab.add(_0x1326ac);
      try {
        releaseMedia(_0xe81eb7);
      } catch {}
    }
    return true;
  };
  const _0x5816f6 = _0x58f5ac => {
    const _0xed3911 = normalizeText(_0x58f5ac);
    const _0x1a477b = _0x598783.get(_0xed3911);
    if (!_0x1a477b) {
      return false;
    }
    _0x598783.delete(_0xed3911);
    return _0x3cf302(_0x1a477b);
  };
  return Object.freeze({
    retain(_0x1547a4 = {}) {
      if (_0x40a2e4) {
        return false;
      }
      const _0x6fa8da = normalizeText(_0x1547a4.role);
      const _0x355436 = normalizeText(_0x1547a4.sourceUrl);
      const _0x562c5b = normalizeText(_0x1547a4.projectId) || _0x4c794e;
      if (!_0x6fa8da || !_0x355436 || !_0x1547a4.videoEl || !_0x1547a4.controller && _0x1547a4.preserveVisibleElement !== true || _0x562c5b !== _0x4c794e) {
        return false;
      }
      const _0x2b02d6 = _0x598783.get(_0x6fa8da);
      if (_0x2b02d6 && _0x2b02d6.projectId === _0x562c5b && _0x2b02d6.sourceUrl === _0x355436 && _0x2b02d6.videoEl === _0x1547a4.videoEl && _0x2b02d6.controller === _0x1547a4.controller) {
        return true;
      }
      if (_0x2b02d6) {
        _0x5816f6(_0x6fa8da);
      }
      _0x598783.set(_0x6fa8da, {
        ..._0x1547a4,
        projectId: _0x562c5b,
        role: _0x6fa8da,
        sourceUrl: _0x355436
      });
      return true;
    },
    has(_0x4fe234) {
      return _0x598783.has(normalizeText(_0x4fe234));
    },
    peek(_0x1a4565) {
      return _0x598783.get(normalizeText(_0x1a4565)) || null;
    },
    forget(_0x11f7ae) {
      const _0x5b3fd1 = normalizeText(_0x11f7ae);
      if (!_0x598783.has(_0x5b3fd1)) {
        return false;
      }
      _0x598783.delete(_0x5b3fd1);
      return true;
    },
    handoff(_0x5bc62c, {
      videoEl = null,
      controller = null
    } = {}) {
      if (_0x40a2e4 || !videoEl || !controller) {
        return false;
      }
      const _0x5e180f = normalizeText(_0x5bc62c);
      const _0x53d935 = _0x598783.get(_0x5e180f);
      if (!_0x53d935 || _0x53d935.videoEl !== videoEl) {
        return false;
      }
      _0x598783.set(_0x5e180f, {
        ..._0x53d935,
        videoEl: videoEl,
        controller: controller
      });
      return true;
    },
    nextSequence(_0x44d42c) {
      const _0x403328 = normalizeText(_0x44d42c);
      const _0x13b128 = (_0x5a4a0a.get(_0x403328) || 0) + 1;
      _0x5a4a0a.set(_0x403328, _0x13b128);
      return _0x13b128;
    },
    adopt({
      projectId: _0x33189d = "",
      role: _0x3994c1 = "",
      sourceUrl: _0x122d23 = "",
      renderedVideo = null,
      adoptMedia = null
    } = {}) {
      if (_0x40a2e4 || !renderedVideo) {
        return null;
      }
      const _0x3e169a = normalizeText(_0x33189d);
      const _0x3f39e3 = normalizeText(_0x3994c1);
      const _0x494be5 = normalizeText(_0x122d23);
      if (!_0x3e169a || _0x3e169a !== _0x4c794e || !_0x3f39e3 || !_0x494be5) {
        return null;
      }
      const _0x56094a = _0x598783.get(_0x3f39e3);
      if (!_0x56094a || _0x56094a.projectId !== _0x3e169a || _0x56094a.sourceUrl !== _0x494be5) {
        return null;
      }
      try {
        const _0x566403 = typeof adoptMedia === "function" ? adoptMedia : adoptCompositeMediaElement;
        _0x566403(_0x56094a.videoEl, renderedVideo, _0x56094a);
      } catch {
        return null;
      }
      _0x598783.delete(_0x3f39e3);
      return _0x56094a;
    },
    evict: _0x5816f6,
    switchProject(_0x5f257c = "") {
      if (_0x40a2e4) {
        return false;
      }
      const _0xc47459 = normalizeText(_0x5f257c);
      if (!_0xc47459 || _0xc47459 === _0x4c794e) {
        return false;
      }
      Array.from(_0x598783.keys()).forEach(_0x5816f6);
      _0x4c794e = _0xc47459;
      return true;
    },
    dispose() {
      if (_0x40a2e4) {
        return;
      }
      _0x40a2e4 = true;
      Array.from(_0x598783.keys()).forEach(_0x5816f6);
      _0x4c794e = "";
    }
  });
}