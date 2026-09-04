import { closeActiveVideoPreview, openVideoPreview } from "../../../modules/imagePreview.js";
export function bindVideoFullscreenAction(_0x26d8aa) {
  const {
    toolbarEl: _0x6f1679,
    _getCurrentVideoUrl: _0x21fb2f,
    _getCurrentVideoPlaybackUrl: _0x550fe1
  } = _0x26d8aa;
  const _0x327cc3 = _0x6f1679.querySelector(".act-fullscreen");
  if (_0x327cc3) {
    _0x327cc3.addEventListener("click", _0xba7b1b => {
      _0xba7b1b.stopPropagation();
      if (closeActiveVideoPreview()) {
        return;
      }
      const _0x2b5e77 = _0x21fb2f();
      if (!_0x2b5e77) {
        return;
      }
      openVideoPreview(_0x2b5e77, {
        playbackUrl: _0x550fe1?.() || "",
        overlayDataset: {
          nodeToolbarVideoFullscreenOverlay: "true"
        }
      });
    });
  }
}