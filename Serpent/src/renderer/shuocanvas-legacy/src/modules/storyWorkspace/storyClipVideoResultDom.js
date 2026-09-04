function normalizeText(_0x448e56) {
  return String(_0x448e56 || "").trim();
}
export function findStoryClipCardShell(_0x2982f3, _0x4c770b) {
  const _0x1887df = normalizeText(_0x4c770b);
  return Array.from(_0x2982f3?.querySelectorAll?.(".story-clip-card-shell[data-story-clip-id]") || []).find(_0xd23758 => normalizeText(_0xd23758.dataset.storyClipId) === _0x1887df) || null;
}
export function syncStoryClipCardVideoInPlace({
  root: _0x2b48e3,
  documentObject: _0x300484,
  clipId: _0x51d8da,
  resultCount: _0x224ac6,
  refreshThumbnail = false,
  thumbnailMarkup = ""
} = {}) {
  const _0x33257c = findStoryClipCardShell(_0x2b48e3, _0x51d8da);
  const _0x1fc084 = _0x33257c?.querySelector(".story-clip-card");
  if (!_0x33257c || !_0x1fc084) {
    return false;
  }
  _0x33257c.dataset.storyVideoHistory = String(Number(_0x224ac6) > 1);
  if (!refreshThumbnail) {
    return true;
  }
  let _0x29cfde = _0x1fc084.querySelector(".story-clip-card-media");
  if (!thumbnailMarkup) {
    _0x29cfde?.remove();
    _0x1fc084.classList.remove("has-video-thumbnail");
    return true;
  }
  if (!_0x29cfde) {
    _0x29cfde = _0x300484.createElement("span");
    _0x29cfde.className = "story-clip-card-media";
    _0x29cfde.setAttribute("aria-hidden", "true");
    _0x1fc084.querySelector(".story-clip-card-copy")?.before(_0x29cfde);
  }
  _0x29cfde.innerHTML = thumbnailMarkup;
  _0x1fc084.classList.add("has-video-thumbnail");
  return true;
}
export function syncSelectedClipVideoMetadataInPlace(_0x2a102e, _0x200a44, _0x39bcba) {
  const _0x1e290b = _0x2a102e?.querySelector?.(".story-video-result[data-story-video-result-index]");
  if (!_0x1e290b) {
    return false;
  }
  _0x1e290b.dataset.storyVideoResultIndex = String(_0x200a44);
  _0x1e290b.querySelectorAll("[data-story-video-result-index]").forEach(_0x2187c1 => {
    _0x2187c1.dataset.storyVideoResultIndex = String(_0x200a44);
  });
  const _0xe864c2 = Math.max(1, Number(_0x39bcba) || 1);
  const _0x1b5335 = _0x1e290b.querySelector(".story-video-result-meta span");
  if (_0x1b5335) {
    _0x1b5335.textContent = _0x200a44 + 1 + "/" + _0xe864c2;
  }
  if (_0xe864c2 < 2) {
    _0x1e290b.querySelectorAll(".story-video-result-switch").forEach(_0x29e626 => {
      _0x29e626.remove();
    });
  }
  return true;
}