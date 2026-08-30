export const VIDEO_TOOLBAR_ACTIONS = Object.freeze(["clip", "voice-replace", "reverse", "extract-keyframes", "keying", "storyboard-script", "apimart-face-detect", "fullscreen", "upload", "download", "reset-size", "hd", "replace", "remove", "separate-av"]);
const DEFAULT_VIDEO_TOOLBAR_LAYOUT = Object.freeze({
  outsidePrimary: Object.freeze(["clip", "voice-replace", "reverse", "extract-keyframes", "keying", "storyboard-script", "apimart-face-detect"]),
  outsideSecondary: Object.freeze(["fullscreen", "upload", "download", "reset-size"]),
  more: Object.freeze(["hd", "replace", "remove", "separate-av"])
});
const ZONE_KEYS = Object.freeze(["outsidePrimary", "outsideSecondary", "more"]);
function cloneDefaultLayout() {
  return {
    outsidePrimary: [...DEFAULT_VIDEO_TOOLBAR_LAYOUT.outsidePrimary],
    outsideSecondary: [...DEFAULT_VIDEO_TOOLBAR_LAYOUT.outsideSecondary],
    more: [...DEFAULT_VIDEO_TOOLBAR_LAYOUT.more]
  };
}
function normalizeAction(_0xd88303) {
  const _0x56c4e2 = String(_0xd88303 || "").trim();
  if (VIDEO_TOOLBAR_ACTIONS.includes(_0x56c4e2)) {
    return _0x56c4e2;
  } else {
    return "";
  }
}
function appendNormalizedAction(_0x498569, _0x418dfe) {
  if (_0x418dfe === "upload") {
    const _0x3254b8 = _0x498569.indexOf("download");
    if (_0x3254b8 >= 0) {
      _0x498569.splice(_0x3254b8, 0, _0x418dfe);
      return;
    }
  }
  _0x498569.push(_0x418dfe);
}
export function getDefaultVideoToolbarLayout() {
  return cloneDefaultLayout();
}
export function normalizeVideoToolbarLayout(_0x55e47b) {
  const _0x588856 = cloneDefaultLayout();
  if (!_0x55e47b || typeof _0x55e47b !== "object") {
    return _0x588856;
  }
  const _0x3bc577 = {
    outsidePrimary: [],
    outsideSecondary: [],
    more: []
  };
  const _0x1afd55 = new Set();
  for (const _0x3f2c0f of ZONE_KEYS) {
    const _0x5c9ad0 = Array.isArray(_0x55e47b[_0x3f2c0f]) ? _0x55e47b[_0x3f2c0f] : [];
    for (const _0x26b69e of _0x5c9ad0) {
      const _0x5bb239 = normalizeAction(_0x26b69e);
      if (!_0x5bb239 || _0x1afd55.has(_0x5bb239)) {
        continue;
      }
      _0x1afd55.add(_0x5bb239);
      _0x3bc577[_0x3f2c0f].push(_0x5bb239);
    }
  }
  for (const _0x3bde6b of VIDEO_TOOLBAR_ACTIONS) {
    if (_0x1afd55.has(_0x3bde6b)) {
      continue;
    }
    if (_0x588856.outsidePrimary.includes(_0x3bde6b)) {
      appendNormalizedAction(_0x3bc577.outsidePrimary, _0x3bde6b);
      continue;
    }
    if (_0x588856.outsideSecondary.includes(_0x3bde6b)) {
      appendNormalizedAction(_0x3bc577.outsideSecondary, _0x3bde6b);
      continue;
    }
    appendNormalizedAction(_0x3bc577.more, _0x3bde6b);
  }
  return _0x3bc577;
}
export function serializeVideoToolbarLayout(_0x19667f) {
  const _0x513cb8 = normalizeVideoToolbarLayout(_0x19667f);
  return JSON.stringify({
    outsidePrimary: _0x513cb8.outsidePrimary,
    outsideSecondary: _0x513cb8.outsideSecondary,
    more: _0x513cb8.more
  });
}