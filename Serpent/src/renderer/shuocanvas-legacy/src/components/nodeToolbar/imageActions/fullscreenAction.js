export function bindImageFullscreenAction(_0x1f6b6b) {
  const {
    toolbarEl: _0x2b47c5,
    closeActiveImagePreview: _0x3660a0,
    getNodeData: _0x3ee0e9,
    openNodeImagePreview: _0x100086
  } = _0x1f6b6b;
  const _0x1156e4 = _0x2b47c5.querySelector(".act-fullscreen");
  if (_0x1156e4) {
    _0x1156e4.addEventListener("click", _0x466ee3 => {
      _0x466ee3.stopPropagation();
      if (_0x3660a0?.()) {
        return;
      }
      const _0x1a8624 = _0x3ee0e9();
      const _0x32494d = _0x2b47c5.closest?.(".v2-node")?.querySelector?.("img.node-img, img.aigen-image-media, img.v2-media-preview");
      if (_0x1a8624) {
        _0x100086(_0x1a8624, {
          currentSrc: _0x32494d?.currentSrc || _0x32494d?.src || ""
        });
      }
    });
  }
}