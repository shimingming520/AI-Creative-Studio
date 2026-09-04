export const IMAGE_TOOLBAR_ACTIONS = Object.freeze(["matting", "repaint", "erase", "hd", "mj-variation", "mj-hd", "expand", "auto-subject", "apimart-face-detect", "panorama-360", "multigrid", "multiangle", "annotate", "crop", "fullscreen", "upload", "download", "reset-size"]);
const DEFAULT_IMAGE_TOOLBAR_LAYOUT = Object.freeze({
  outsidePrimary: Object.freeze(["mj-variation", "mj-hd", "matting", "expand", "apimart-face-detect", "panorama-360", "multigrid", "multiangle"]),
  outsideSecondary: Object.freeze(["annotate", "crop", "fullscreen", "upload", "download", "reset-size"]),
  more: Object.freeze(["repaint", "erase", "hd", "auto-subject"])
});
const ZONE_KEYS = Object.freeze(["outsidePrimary", "outsideSecondary", "more"]);
function cloneDefaultLayout() {
  return {
    outsidePrimary: [...DEFAULT_IMAGE_TOOLBAR_LAYOUT.outsidePrimary],
    outsideSecondary: [...DEFAULT_IMAGE_TOOLBAR_LAYOUT.outsideSecondary],
    more: [...DEFAULT_IMAGE_TOOLBAR_LAYOUT.more]
  };
}
function normalizeAction(_0x50c5ab) {
  const _0x203bb0 = String(_0x50c5ab || "").trim();
  if (IMAGE_TOOLBAR_ACTIONS.includes(_0x203bb0)) {
    return _0x203bb0;
  } else {
    return "";
  }
}
function appendNormalizedAction(_0x354871, _0x1e3471) {
  if (_0x1e3471 === "upload") {
    const _0x310b51 = _0x354871.indexOf("download");
    if (_0x310b51 >= 0) {
      _0x354871.splice(_0x310b51, 0, _0x1e3471);
      return;
    }
  }
  _0x354871.push(_0x1e3471);
}
export function getDefaultImageToolbarLayout() {
  return cloneDefaultLayout();
}
export function normalizeImageToolbarLayout(_0x43d79f) {
  const _0xea8d7a = cloneDefaultLayout();
  if (!_0x43d79f || typeof _0x43d79f !== "object") {
    return _0xea8d7a;
  }
  const _0x1becdb = {
    outsidePrimary: [],
    outsideSecondary: [],
    more: []
  };
  const _0x2afc01 = new Set();
  for (const _0x375ac3 of ZONE_KEYS) {
    const _0x3019be = Array.isArray(_0x43d79f[_0x375ac3]) ? _0x43d79f[_0x375ac3] : [];
    for (const _0x47520e of _0x3019be) {
      const _0x2cbd47 = normalizeAction(_0x47520e);
      if (!_0x2cbd47 || _0x2afc01.has(_0x2cbd47)) {
        continue;
      }
      _0x2afc01.add(_0x2cbd47);
      _0x1becdb[_0x375ac3].push(_0x2cbd47);
    }
  }
  for (const _0x2796b1 of IMAGE_TOOLBAR_ACTIONS) {
    if (_0x2afc01.has(_0x2796b1)) {
      continue;
    }
    if (_0xea8d7a.outsidePrimary.includes(_0x2796b1)) {
      appendNormalizedAction(_0x1becdb.outsidePrimary, _0x2796b1);
      continue;
    }
    if (_0xea8d7a.outsideSecondary.includes(_0x2796b1)) {
      appendNormalizedAction(_0x1becdb.outsideSecondary, _0x2796b1);
      continue;
    }
    appendNormalizedAction(_0x1becdb.more, _0x2796b1);
  }
  return _0x1becdb;
}
export function serializeImageToolbarLayout(_0x478150) {
  const _0x4a6b57 = normalizeImageToolbarLayout(_0x478150);
  return JSON.stringify({
    outsidePrimary: _0x4a6b57.outsidePrimary,
    outsideSecondary: _0x4a6b57.outsideSecondary,
    more: _0x4a6b57.more
  });
}