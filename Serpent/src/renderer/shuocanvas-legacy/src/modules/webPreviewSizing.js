export const WEB_PREVIEW_MIN_WIDTH = 1024;
export const WEB_PREVIEW_MIN_HEIGHT = 576;
export const WEB_PREVIEW_MIN_SIZE = Object.freeze({
  width: WEB_PREVIEW_MIN_WIDTH,
  height: WEB_PREVIEW_MIN_HEIGHT
});
export function clampWebPreviewNodeSize(_0xc76fc3 = {}) {
  return {
    width: Math.max(WEB_PREVIEW_MIN_WIDTH, Number(_0xc76fc3.width) || 0),
    height: Math.max(WEB_PREVIEW_MIN_HEIGHT, Number(_0xc76fc3.height) || 0)
  };
}