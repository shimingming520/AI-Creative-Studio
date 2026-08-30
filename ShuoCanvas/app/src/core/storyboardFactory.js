import { detachStoryboardCellSourceContext, isStoryboardCellEmpty, resolveStoryboardCellSourceIndex } from "./storyboardCellUtils.js";
const STORYBOARD_STANDARD_ASPECTS = Object.freeze([{
  label: "16:9",
  value: 16 / 9
}, {
  label: "9:16",
  value: 9 / 16
}, {
  label: "4:3",
  value: 4 / 3
}, {
  label: "3:4",
  value: 3 / 4
}, {
  label: "1:1",
  value: 1
}]);
export const STORYBOARD_EMPTY_GRID_DEFAULTS = Object.freeze({
  cols: 3,
  rows: 3,
  aspectRatio: "1:1"
});
function _trimString(_0x9cb676) {
  if (typeof _0x9cb676 === "string") {
    return _0x9cb676.trim();
  } else {
    return "";
  }
}
function _asPositiveNumber(_0x23fea4) {
  const _0x218465 = Number(_0x23fea4);
  if (Number.isFinite(_0x218465) && _0x218465 > 0) {
    return _0x218465;
  } else {
    return 0;
  }
}
function _getSafeGridCount(_0x4f558e) {
  return Math.max(1, Math.round(_asPositiveNumber(_0x4f558e)) || 0);
}
function _normalizeLocalPath(_0x128c2a) {
  const _0x4097c5 = _trimString(_0x128c2a);
  if (!_0x4097c5) {
    return "";
  }
  if (_0x4097c5.startsWith("/")) {
    return _0x4097c5;
  } else {
    return "/" + _0x4097c5;
  }
}
function _findStoryboardSourceContext(_0x82ece4 = []) {
  if (!Array.isArray(_0x82ece4)) {
    return {};
  }
  for (const _0x595885 of _0x82ece4) {
    if (!_0x595885 || typeof _0x595885 !== "object") {
      continue;
    }
    const _0x2a3d5e = _trimString(_0x595885.sourceLocalPath);
    const _0x34c5a0 = _trimString(_0x595885.sourceUrl);
    if (!_0x2a3d5e && !_0x34c5a0) {
      continue;
    }
    return {
      storyboardSourceLocalPath: _0x2a3d5e || null,
      storyboardSourceUrl: _0x2a3d5e ? "" : _0x34c5a0,
      storyboardSourceWidth: _0x595885.sourceWidth || null,
      storyboardSourceHeight: _0x595885.sourceHeight || null
    };
  }
  return {};
}
function _normalizeStoryboardPieceCell(_0x3dc8bd, _0x179835) {
  if (!_0x3dc8bd || typeof _0x3dc8bd !== "object") {
    return _0x3dc8bd;
  }
  if (isStoryboardCellEmpty(_0x3dc8bd)) {
    return {
      ..._0x3dc8bd
    };
  }
  return {
    ...detachStoryboardCellSourceContext(_0x3dc8bd, {
      locked: true,
      extracted: _0x3dc8bd.storyboardExtractedCell === true
    }),
    storyboardPiece: true,
    storyboardSourceIndex: resolveStoryboardCellSourceIndex(_0x3dc8bd, _0x179835),
    isEmpty: false
  };
}
function _parseAspectLabel(_0x5accd9) {
  const _0x670025 = String(_0x5accd9 || "").trim().match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  const _0x399c2e = _asPositiveNumber(_0x670025?.[1]);
  const _0x3224a2 = _asPositiveNumber(_0x670025?.[2]);
  if (_0x399c2e > 0 && _0x3224a2 > 0) {
    return {
      width: _0x399c2e,
      height: _0x3224a2
    };
  }
  return {
    width: 1,
    height: 1
  };
}
export function resolveNearestStoryboardAspect(_0x429c36, _0x4d82bf) {
  const _0x518078 = _asPositiveNumber(_0x429c36);
  const _0x3e57d7 = _asPositiveNumber(_0x4d82bf);
  if (!(_0x518078 > 0) || !(_0x3e57d7 > 0)) {
    return "1:1";
  }
  const _0x19590a = _0x518078 / _0x3e57d7;
  let _0x213dd7 = STORYBOARD_STANDARD_ASPECTS[0];
  let _0x609ee9 = Math.abs(_0x19590a - _0x213dd7.value);
  for (let _0xf1c67 = 1; _0xf1c67 < STORYBOARD_STANDARD_ASPECTS.length; _0xf1c67++) {
    const _0x5e74f8 = STORYBOARD_STANDARD_ASPECTS[_0xf1c67];
    const _0x2f976d = Math.abs(_0x19590a - _0x5e74f8.value);
    if (_0x2f976d < _0x609ee9) {
      _0x609ee9 = _0x2f976d;
      _0x213dd7 = _0x5e74f8;
    }
  }
  return _0x213dd7.label;
}
export function resolveStoryboardSourceImageRef(_0x1f25d3) {
  if (!_0x1f25d3 || typeof _0x1f25d3 !== "object") {
    return "";
  }
  const _0x203b18 = _trimString(_0x1f25d3.sourceUrl) || _trimString(_0x1f25d3.imageUrl) || _trimString(_0x1f25d3.src);
  if (_0x203b18) {
    return _0x203b18;
  }
  return _normalizeLocalPath(_0x1f25d3.localPath);
}
export function buildQuickCreateStoryboardCells({
  cols: _0x169a1c,
  rows: _0xe0f0cc,
  imageRef: _0x2f194c
}) {
  const _0x2820ee = _getSafeGridCount(_0x169a1c) * _getSafeGridCount(_0xe0f0cc);
  const _0x46af27 = _trimString(_0x2f194c);
  return Array.from({
    length: _0x2820ee
  }, (_0x81bf1d, _0x2ed238) => {
    if (_0x2ed238 === 0 && _0x46af27) {
      return {
        url: _0x46af27
      };
    }
    return {
      url: "",
      isEmpty: true
    };
  });
}
export function computeQuickCreateStoryboardSize({
  sourceWidth: _0x4851db,
  sourceHeight: _0x9603cb,
  baseShortSide: _0x4a325c
}) {
  const _0x2df7c9 = _asPositiveNumber(_0x4851db);
  const _0x48ee1b = _asPositiveNumber(_0x9603cb);
  const _0x3d8070 = Math.max(1, Math.round(_asPositiveNumber(_0x4a325c) || 1));
  if (!(_0x2df7c9 > 0) || !(_0x48ee1b > 0)) {
    return {
      width: _0x3d8070,
      height: _0x3d8070
    };
  }
  const _0x242f54 = _0x2df7c9 / _0x48ee1b;
  if (_0x242f54 >= 1) {
    return {
      width: Math.round(_0x3d8070 * _0x242f54),
      height: _0x3d8070
    };
  }
  return {
    width: _0x3d8070,
    height: Math.round(_0x3d8070 / _0x242f54)
  };
}
export function computePreparedStoryboardSize({
  aspectLabel: _0x2c3c80,
  cols: _0xbaf27f,
  rows: _0x15079c,
  sourceWidth: _0x47dfee,
  sourceHeight: _0x1c7912,
  minCellShortSide = 300
}) {
  const {
    width: _0x5372c3,
    height: _0x4f96a8
  } = _parseAspectLabel(_0x2c3c80);
  const _0x1ce037 = _getSafeGridCount(_0xbaf27f);
  const _0x44f740 = _getSafeGridCount(_0x15079c);
  const _0x1b7c48 = _asPositiveNumber(_0x47dfee) / _asPositiveNumber(_0x1c7912);
  const _0x5de1ce = Number.isFinite(_0x1b7c48) && _0x1b7c48 > 0 ? _0x1b7c48 * (_0x44f740 / _0x1ce037) : _0x5372c3 / _0x4f96a8;
  const _0x5e1ff0 = Math.max(1, Math.round(_asPositiveNumber(minCellShortSide) || 300));
  let _0x4124ab = _0x5e1ff0;
  let _0x2138b0 = _0x5e1ff0;
  if (_0x5de1ce >= 1) {
    _0x2138b0 = _0x5e1ff0;
    _0x4124ab = _0x2138b0 * _0x5de1ce;
  } else {
    _0x4124ab = _0x5e1ff0;
    _0x2138b0 = _0x4124ab / _0x5de1ce;
  }
  return {
    width: Math.round(_0x4124ab * _0x1ce037),
    height: Math.round(_0x2138b0 * _0x44f740)
  };
}
export function buildStoryboardNodePayload({
  id: _0x3bd248,
  name: _0x59c6e3,
  x: _0x325fca,
  y: _0x329768,
  cols: _0x2916f2,
  rows: _0x199345,
  width: _0x4072b6,
  height: _0x542a0d,
  aspectRatio: _0x35cac9,
  cells: _0x1cff2b,
  isEditing = false,
  storyboardSourceLocalPath: _0x2d8d63,
  storyboardSourceUrl: _0x25d44d,
  storyboardSourceWidth: _0x12605f,
  storyboardSourceHeight: _0x2918dd
}) {
  const _0x18a276 = {
    ..._findStoryboardSourceContext(_0x1cff2b),
    ...Object.fromEntries(Object.entries({
      storyboardSourceLocalPath: _0x2d8d63 || undefined,
      storyboardSourceUrl: _0x25d44d || undefined,
      storyboardSourceWidth: _0x12605f || undefined,
      storyboardSourceHeight: _0x2918dd || undefined
    }).filter(([, _0x2d4eab]) => _0x2d4eab !== undefined))
  };
  return {
    id: _0x3bd248,
    type: "storyboard",
    name: _0x59c6e3,
    x: _0x325fca,
    y: _0x329768,
    width: _0x4072b6,
    height: _0x542a0d,
    cells: Array.isArray(_0x1cff2b) ? _0x1cff2b.map((_0x472250, _0x10d10b) => _normalizeStoryboardPieceCell(_0x472250, _0x10d10b)) : [],
    cols: _0x2916f2,
    rows: _0x199345,
    aspectRatio: _0x35cac9,
    isEditing: isEditing,
    ..._0x18a276
  };
}
export function createEmptyStoryboardNodeData({
  id: _0x1fd928,
  name = "宫格图",
  x = 0,
  y = 0,
  width = 900,
  height = 900,
  cols = STORYBOARD_EMPTY_GRID_DEFAULTS.cols,
  rows = STORYBOARD_EMPTY_GRID_DEFAULTS.rows,
  aspectRatio = STORYBOARD_EMPTY_GRID_DEFAULTS.aspectRatio,
  isEditing = false
} = {}) {
  return buildStoryboardNodePayload({
    id: _0x1fd928,
    name: name,
    x: x,
    y: y,
    width: width,
    height: height,
    cols: cols,
    rows: rows,
    aspectRatio: aspectRatio,
    isEditing: isEditing,
    cells: buildQuickCreateStoryboardCells({
      cols: cols,
      rows: rows,
      imageRef: ""
    })
  });
}