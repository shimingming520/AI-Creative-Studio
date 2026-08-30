const pendingLoadings = new WeakMap();
const activeLoadings = new WeakSet();
function normalizeVariant(_0x40dc1c = {}) {
  if (_0x40dc1c && _0x40dc1c.variant === "static") {
    return "static";
  } else {
    return "full";
  }
}
function applyLoadingVariant(_0x2f6c7e, _0x14f7d7) {
  activeLoadings.add(_0x2f6c7e);
  _0x2f6c7e.classList.add("img-preview-loading");
  if (_0x14f7d7 === "static") {
    _0x2f6c7e.classList.add("img-preview-loading--static");
  } else {
    _0x2f6c7e.classList.remove("img-preview-loading--static");
  }
}
function mountLoadingOverlay(_0x2e81ac, _0x1dc88f) {
  applyLoadingVariant(_0x2e81ac, _0x1dc88f);
  if (_0x2e81ac.querySelector(".img-loading-overlay")) {
    return;
  }
  const _0x121c5f = document.createElement("div");
  _0x121c5f.className = "img-loading-overlay";
  _0x121c5f.setAttribute?.("aria-hidden", "true");
  if (_0x1dc88f !== "static") {
    const _0x546d38 = document.createElement("div");
    _0x546d38.className = "img-loading-shimmer";
    _0x121c5f.appendChild(_0x546d38);
  }
  _0x2e81ac.appendChild(_0x121c5f);
}
export function startLoading(_0x536f56, _0x1f4474 = {}) {
  if (!_0x536f56) {
    return;
  }
  const _0x21cc7b = normalizeVariant(_0x1f4474);
  const _0x46fe85 = pendingLoadings.get(_0x536f56);
  if (_0x46fe85) {
    if (_0x21cc7b === "full") {
      pendingLoadings.delete(_0x536f56);
      mountLoadingOverlay(_0x536f56, _0x21cc7b);
      return;
    }
    _0x46fe85.variant = _0x21cc7b;
    return;
  }
  if (_0x536f56.classList?.contains?.("img-preview-loading") || _0x536f56.querySelector?.(".img-loading-overlay")) {
    applyLoadingVariant(_0x536f56, _0x21cc7b);
    return;
  }
  if (_0x21cc7b === "full") {
    mountLoadingOverlay(_0x536f56, _0x21cc7b);
    return;
  }
  const _0xd5212e = {
    variant: _0x21cc7b
  };
  pendingLoadings.set(_0x536f56, _0xd5212e);
  setTimeout(() => {
    if (pendingLoadings.get(_0x536f56) !== _0xd5212e) {
      return;
    }
    mountLoadingOverlay(_0x536f56, _0xd5212e.variant);
    pendingLoadings.delete(_0x536f56);
  }, 50);
}
export function stopLoading(_0x58a06c) {
  if (!_0x58a06c) {
    return;
  }
  const _0x3b8408 = pendingLoadings.delete(_0x58a06c);
  const _0x3423ad = activeLoadings.delete(_0x58a06c);
  const _0x13e2a4 = !!_0x58a06c.classList?.contains?.("img-preview-loading") || !!_0x58a06c.classList?.contains?.("img-preview-loading--static");
  if (!_0x3b8408 && !_0x3423ad && !_0x13e2a4) {
    return;
  }
  _0x58a06c.classList.remove("img-preview-loading");
  _0x58a06c.classList.remove("img-preview-loading--static");
  _0x58a06c.querySelectorAll(".img-loading-overlay").forEach(_0x32b79e => _0x32b79e.remove());
}