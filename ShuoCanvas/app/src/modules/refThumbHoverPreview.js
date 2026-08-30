let _previewEl = null;
let _previewImgEl = null;
let _activeWrapEl = null;
let _rafId = 0;
let _hasGlobalHideHooks = false;
let _hideTimerId = 0;
let _currentSrc = "";
let _pendingSrc = "";
import { ensureThumbDecoded } from "./refThumbMediaReveal.js";
function _ensurePreviewEl() {
  if (_previewEl) {
    return _previewEl;
  }
  const _0x4d7aea = document.createElement("div");
  _0x4d7aea.className = "ref-hover-preview";
  const _0x220dc1 = document.createElement("img");
  _0x220dc1.className = "ref-hover-preview-img";
  _0x220dc1.alt = "";
  _0x4d7aea.appendChild(_0x220dc1);
  document.body.appendChild(_0x4d7aea);
  _previewEl = _0x4d7aea;
  _previewImgEl = _0x220dc1;
  return _0x4d7aea;
}
function _hide() {
  if (_hideTimerId) {
    clearTimeout(_hideTimerId);
  }
  _hideTimerId = 0;
  if (_rafId) {
    cancelAnimationFrame(_rafId);
  }
  _rafId = 0;
  _activeWrapEl = null;
  _pendingSrc = "";
  if (_previewEl) {
    _previewEl.classList.remove("is-visible");
  }
  if (_previewImgEl) {
    _previewImgEl.classList.remove("is-pending");
  }
}
function _scheduleHide(_0x2aee8d = 80) {
  if (_hideTimerId) {
    clearTimeout(_hideTimerId);
  }
  _hideTimerId = window.setTimeout(() => {
    _hideTimerId = 0;
    _hide();
  }, _0x2aee8d);
}
function _schedulePosition() {
  if (_rafId) {
    return;
  }
  _rafId = requestAnimationFrame(() => {
    _rafId = 0;
    if (!_activeWrapEl || !_previewEl) {
      return;
    }
    const _0xcb3e1f = _activeWrapEl.getBoundingClientRect();
    const _0x1b43ad = _0xcb3e1f.left + _0xcb3e1f.width / 2;
    const _0x54bc48 = _0xcb3e1f.top - 10;
    _previewEl.style.left = Math.round(_0x1b43ad) + "px";
    _previewEl.style.top = Math.round(_0x54bc48) + "px";
  });
}
function _getThumbImgSrc(_0x3f8ec7) {
  const _0x10c6d1 = _0x3f8ec7.querySelector("img.ref-thumb-media");
  const _0xeb6d14 = String(_0x10c6d1?.getAttribute("src") || "").trim();
  return _0xeb6d14 || "";
}
export function resolveRefThumbHoverPreviewUrl(_0x8b9dec) {
  const _0x48157a = String(_0x8b9dec?.dataset?.previewSrc || "").trim();
  if (_0x48157a) {
    return _0x48157a;
  }
  const _0x40c7bb = String(_0x8b9dec?.dataset?.thumbSrc || "").trim();
  if (_0x40c7bb) {
    return _0x40c7bb;
  }
  return _getThumbImgSrc(_0x8b9dec);
}
function _collectPreviewWraps(_0x5ba375) {
  if (!_0x5ba375) {
    return [];
  }
  const _0x3931aa = [];
  if (_0x5ba375.classList?.contains?.("ref-thumb-wrap")) {
    _0x3931aa.push(_0x5ba375);
  }
  _0x5ba375.querySelectorAll?.(".ref-thumb-wrap")?.forEach?.(_0x1be723 => _0x3931aa.push(_0x1be723));
  return _0x3931aa;
}
function _preloadRefThumbPreviewSources(_0x1779cb) {
  for (const _0x3b5095 of _collectPreviewWraps(_0x1779cb)) {
    const _0x3c60a1 = resolveRefThumbHoverPreviewUrl(_0x3b5095);
    if (_0x3c60a1) {
      ensureThumbDecoded(_0x3c60a1);
    }
  }
}
export function _resetRefThumbHoverPreviewForTests() {
  _previewEl = null;
  _previewImgEl = null;
  _activeWrapEl = null;
  _rafId = 0;
  _hasGlobalHideHooks = false;
  _hideTimerId = 0;
  _currentSrc = "";
  _pendingSrc = "";
}
function _showForWrap(_0x213057) {
  const _0x9e694e = resolveRefThumbHoverPreviewUrl(_0x213057);
  if (!_0x9e694e) {
    _hide();
    return;
  }
  _ensurePreviewEl();
  _activeWrapEl = _0x213057;
  if (_hideTimerId) {
    clearTimeout(_hideTimerId);
  }
  _hideTimerId = 0;
  if (_previewImgEl) {
    const _0x325170 = !!_previewEl?.classList.contains("is-visible");
    if (!_0x325170) {
      _currentSrc = _0x9e694e;
      _pendingSrc = "";
      _previewImgEl.classList.remove("is-pending");
      _previewImgEl.src = _0x9e694e;
      ensureThumbDecoded(_0x9e694e);
    } else if (!_currentSrc) {
      _currentSrc = _0x9e694e;
      _pendingSrc = "";
      _previewImgEl.classList.remove("is-pending");
      _previewImgEl.src = _0x9e694e;
    } else if (_currentSrc !== _0x9e694e) {
      _currentSrc = _0x9e694e;
      _pendingSrc = _0x9e694e;
      const _0x4215b3 = _0x9e694e;
      _previewImgEl.classList.add("is-pending");
      _previewImgEl.src = _0x4215b3;
      ensureThumbDecoded(_0x9e694e).then(() => {
        if (_pendingSrc !== _0x4215b3) {
          return;
        }
        if (!_previewImgEl) {
          return;
        }
        _pendingSrc = "";
        _previewImgEl.classList.remove("is-pending");
      });
    }
  }
  _previewEl.classList.add("is-visible");
  _schedulePosition();
}
function _ensureGlobalHideHooks() {
  if (_hasGlobalHideHooks) {
    return;
  }
  _hasGlobalHideHooks = true;
  window.addEventListener("scroll", _hide, true);
  window.addEventListener("blur", _hide, true);
  window.addEventListener("wheel", _hide, {
    passive: true,
    capture: true
  });
}
export function bindRefThumbHoverPreview(_0x81f79f) {
  if (!_0x81f79f) {
    return () => {};
  }
  _ensureGlobalHideHooks();
  _preloadRefThumbPreviewSources(_0x81f79f);
  let _0x1505f1 = null;
  if (typeof MutationObserver === "function") {
    _0x1505f1 = new MutationObserver(() => {
      _preloadRefThumbPreviewSources(_0x81f79f);
    });
    _0x1505f1.observe(_0x81f79f, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "data-preview-src", "data-thumb-src"]
    });
  }
  const _0x225923 = _0xdbb27a => {
    const _0x23f6fd = _0xdbb27a.target?.closest?.(".ref-thumb-wrap");
    if (!_0x23f6fd || !_0x81f79f.contains(_0x23f6fd)) {
      return;
    }
    _showForWrap(_0x23f6fd);
  };
  const _0x20a3af = _0x56ac7b => {
    const _0x5446e4 = _0x56ac7b.target?.closest?.(".ref-thumb-wrap");
    if (!_0x5446e4 || !_0x81f79f.contains(_0x5446e4)) {
      return;
    }
    const _0x5f26f5 = _0x56ac7b.relatedTarget;
    if (_0x5f26f5 && _0x5446e4.contains(_0x5f26f5)) {
      return;
    }
    if (_0x5f26f5 && _0x81f79f.contains(_0x5f26f5)) {
      _scheduleHide(80);
      return;
    }
    _hide();
  };
  const _0x4c4242 = () => {
    if (!_activeWrapEl) {
      return;
    }
    if (!_0x81f79f.contains(_activeWrapEl)) {
      _hide();
      return;
    }
    _schedulePosition();
  };
  const _0x5c3e82 = () => _hide();
  _0x81f79f.addEventListener("pointerover", _0x225923);
  _0x81f79f.addEventListener("pointerout", _0x20a3af);
  _0x81f79f.addEventListener("pointermove", _0x4c4242);
  _0x81f79f.addEventListener("pointerdown", _0x5c3e82, true);
  return () => {
    _0x1505f1?.disconnect?.();
    _0x81f79f.removeEventListener("pointerover", _0x225923);
    _0x81f79f.removeEventListener("pointerout", _0x20a3af);
    _0x81f79f.removeEventListener("pointermove", _0x4c4242);
    _0x81f79f.removeEventListener("pointerdown", _0x5c3e82, true);
  };
}