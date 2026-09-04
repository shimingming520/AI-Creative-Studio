const STORYBOARD_CELL_GAP = 0;
const STORYBOARD_CELL_INSET = 1.5;
const STORYBOARD_MIN_TRACK_WEIGHT = 0.2;
export const STORYBOARD_GRID_GAP_MAX = 80;
function _trimString(_0x263b8b) {
  if (typeof _0x263b8b === "string") {
    return _0x263b8b.trim();
  } else {
    return "";
  }
}
function _normalizeLocalPath(_0x1672c7) {
  const _0x213270 = _trimString(_0x1672c7);
  if (!_0x213270) {
    return "";
  }
  if (_0x213270.startsWith("/")) {
    return _0x213270;
  } else {
    return "/" + _0x213270;
  }
}
function _toPositiveNumber(_0x2935e7) {
  const _0x30b45a = Number(_0x2935e7);
  if (Number.isFinite(_0x30b45a) && _0x30b45a > 0) {
    return _0x30b45a;
  } else {
    return null;
  }
}
function _isUsableNonDataSrc(_0x336092) {
  const _0x3b003d = _trimString(_0x336092);
  return !!_0x3b003d && !_0x3b003d.startsWith("data:");
}
function _isUsablePreviewSrc(_0x5d0960) {
  return !!_trimString(_0x5d0960);
}
function _getSafeGridCount(_0x2d61f2) {
  const _0x5cd998 = Math.round(Number(_0x2d61f2) || 0);
  return Math.max(1, _0x5cd998);
}
export function resolveStoryboardCellSourceIndex(_0x5ad2c8, _0x3089cd, _0x177e8f = null) {
  const _0x5dfa08 = Math.trunc(Number(_0x3089cd));
  const _0x1f7e52 = Number.isInteger(_0x5dfa08) && _0x5dfa08 >= 0 ? _0x5dfa08 : 0;
  const _0x4d9f64 = Math.trunc(Number(_0x5ad2c8?.storyboardSourceIndex));
  const _0x483206 = _getSafeGridCount(_0x177e8f?.cols) * _getSafeGridCount(_0x177e8f?.rows);
  const _0x4b0de5 = Number.isInteger(_0x4d9f64) && _0x4d9f64 >= 0 ? _0x4d9f64 : _0x1f7e52;
  if (!Number.isInteger(_0x4b0de5) || _0x4b0de5 < 0) {
    return _0x1f7e52;
  }
  if (_0x177e8f && _0x4b0de5 >= _0x483206) {
    return _0x1f7e52;
  }
  return _0x4b0de5;
}
function _clamp(_0x1f2d80, _0x2f4e40, _0xdde523) {
  return Math.min(Math.max(_0x1f2d80, _0x2f4e40), _0xdde523);
}
function _roundTrackWeight(_0x31ea5e) {
  return Math.round(_0x31ea5e * 10000) / 10000;
}
function _getTrackTotal(_0x3303f1) {
  return _0x3303f1.reduce((_0x59363c, _0x51102b) => _0x59363c + _0x51102b, 0);
}
function _getEqualTracks(_0x4e9f44) {
  return Array.from({
    length: _0x4e9f44
  }, () => 1);
}
export function resolveStoryboardGridTracks(_0x3d3a6d, _0x5df5b2) {
  const _0x21c491 = _getSafeGridCount(_0x5df5b2);
  if (!Array.isArray(_0x3d3a6d) || _0x3d3a6d.length !== _0x21c491) {
    return _getEqualTracks(_0x21c491);
  }
  const _0x37a50e = _0x3d3a6d.map(_0x88e194 => Number(_0x88e194));
  if (_0x37a50e.some(_0x5b5961 => !Number.isFinite(_0x5b5961) || _0x5b5961 < STORYBOARD_MIN_TRACK_WEIGHT)) {
    return _getEqualTracks(_0x21c491);
  }
  const _0x1fc7ef = _getTrackTotal(_0x37a50e);
  if (!Number.isFinite(_0x1fc7ef) || _0x1fc7ef <= 0) {
    return _getEqualTracks(_0x21c491);
  }
  const _0x586793 = _0x21c491 / _0x1fc7ef;
  return _0x37a50e.map(_0x232230 => _roundTrackWeight(_0x232230 * _0x586793));
}
export function resolveStoryboardGridLayout(_0x4df8f8) {
  const _0x23e9b9 = _getSafeGridCount(_0x4df8f8?.cols);
  const _0x288c41 = _getSafeGridCount(_0x4df8f8?.rows);
  const _0x4ef346 = _0x4df8f8?.gridLayout && typeof _0x4df8f8.gridLayout === "object" ? _0x4df8f8.gridLayout : {};
  return {
    cols: _0x23e9b9,
    rows: _0x288c41,
    columns: resolveStoryboardGridTracks(_0x4ef346.columns, _0x23e9b9),
    rowTracks: resolveStoryboardGridTracks(_0x4ef346.rows, _0x288c41)
  };
}
export function normalizeStoryboardGridGap(_0x451e70, _0x3d463f = STORYBOARD_CELL_GAP) {
  const _0x1356f2 = Number(_0x451e70);
  const _0x348f3e = Number(_0x3d463f);
  const _0x19f7e1 = Number.isFinite(_0x1356f2) ? _0x1356f2 : Number.isFinite(_0x348f3e) ? _0x348f3e : 0;
  return Math.round(_clamp(_0x19f7e1, 0, STORYBOARD_GRID_GAP_MAX));
}
export function buildStoryboardGridTemplate(_0x474f62, _0x110386) {
  return resolveStoryboardGridTracks(_0x474f62, _0x110386).map(_0x146db2 => _roundTrackWeight(_0x146db2) + "fr").join(" ");
}
export function getStoryboardGridDividerPositions(_0x146fbe, _0x32e493 = {}) {
  if (!_0x146fbe || typeof _0x146fbe !== "object") {
    return {
      vertical: [],
      horizontal: []
    };
  }
  const _0x15f9e7 = resolveStoryboardGridLayout(_0x146fbe);
  const _0x31fec1 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x32e493, "width") ? _0x32e493.width : _0x146fbe.width) || 0);
  const _0x25b349 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x32e493, "height") ? _0x32e493.height : _0x146fbe.height) || 0);
  const _0x1aa518 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x32e493, "inset") ? _0x32e493.inset : STORYBOARD_CELL_INSET) || 0);
  const _0x1bf845 = Math.max(0, _0x31fec1 - _0x1aa518 * 2);
  const _0x4ca92b = Math.max(0, _0x25b349 - _0x1aa518 * 2);
  const _0x10a5f8 = (_0x5ddabe, _0x5b6571) => {
    const _0x19f7f6 = _getTrackTotal(_0x5ddabe);
    if (_0x19f7f6 <= 0 || _0x5b6571 <= 0) {
      return [];
    }
    const _0x4b3e7c = [];
    let _0x1384a3 = 0;
    for (let _0x262102 = 0; _0x262102 < _0x5ddabe.length - 1; _0x262102++) {
      _0x1384a3 += _0x5ddabe[_0x262102];
      const _0x1fc9f0 = _0x1384a3 / _0x19f7f6;
      _0x4b3e7c.push({
        index: _0x262102,
        ratio: _0x1fc9f0,
        position: _0x1aa518 + _0x1fc9f0 * _0x5b6571
      });
    }
    return _0x4b3e7c;
  };
  return {
    vertical: _0x10a5f8(_0x15f9e7.columns, _0x1bf845),
    horizontal: _0x10a5f8(_0x15f9e7.rowTracks, _0x4ca92b),
    cols: _0x15f9e7.cols,
    rows: _0x15f9e7.rows,
    width: _0x31fec1,
    height: _0x25b349,
    inset: _0x1aa518,
    innerWidth: _0x1bf845,
    innerHeight: _0x4ca92b
  };
}
export function getStoryboardScaledGridGap(_0x2654a0, _0x5a1478 = {}) {
  const _0x48b99f = normalizeStoryboardGridGap(_0x2654a0?.gridGap);
  const _0x2e9bb1 = Math.max(0, Number(_0x5a1478.width) || 0);
  const _0x3646c1 = Math.max(0, Number(_0x5a1478.height) || 0);
  const _0x558c3f = Math.max(1, Number(_0x5a1478.nodeWidth ?? _0x2654a0?.width ?? _0x2e9bb1) || _0x2e9bb1 || 1);
  const _0x401783 = Math.max(1, Number(_0x5a1478.nodeHeight ?? _0x2654a0?.height ?? _0x3646c1) || _0x3646c1 || 1);
  return {
    x: _0x2e9bb1 > 0 ? _0x48b99f * (_0x2e9bb1 / _0x558c3f) : _0x48b99f,
    y: _0x3646c1 > 0 ? _0x48b99f * (_0x3646c1 / _0x401783) : _0x48b99f
  };
}
function _getTrackBounds(_0x444e90, _0xb8ee22, _0x5be2b4, _0x70e842) {
  const _0x5842d0 = _getTrackTotal(_0x444e90);
  if (_0x5842d0 <= 0 || _0x5be2b4 <= 0) {
    return {
      start: 0,
      end: 0
    };
  }
  let _0x56f96f = 0;
  for (let _0x1c11fa = 0; _0x1c11fa < _0x444e90.length; _0x1c11fa++) {
    const _0x1991c1 = _0x444e90[_0x1c11fa] / _0x5842d0 * _0x5be2b4;
    const _0x43a2f9 = _0x56f96f;
    const _0xbeab4f = _0x56f96f + _0x1991c1;
    if (_0x1c11fa === _0xb8ee22) {
      return {
        start: _0x43a2f9,
        end: _0xbeab4f
      };
    }
    _0x56f96f = _0xbeab4f + Math.max(0, _0x70e842);
  }
  return {
    start: 0,
    end: 0
  };
}
function _getCenteredGapTrackBounds(_0x240418, _0x52bf63, _0x1de9a7, _0x14180c) {
  const _0x58f197 = _getTrackTotal(_0x240418);
  if (_0x58f197 <= 0 || _0x1de9a7 <= 0) {
    return {
      start: 0,
      end: 0
    };
  }
  const _0x517b18 = Math.max(0, Number(_0x14180c) || 0) / 2;
  let _0xe803b2 = 0;
  let _0xee44a3 = 0;
  let _0x13850b = _0x1de9a7;
  for (let _0x26733a = 0; _0x26733a < _0x240418.length - 1; _0x26733a++) {
    _0xe803b2 += _0x240418[_0x26733a];
    const _0x2e5ec0 = _0xe803b2 / _0x58f197 * _0x1de9a7;
    if (_0x26733a === _0x52bf63 - 1) {
      _0xee44a3 = _0x2e5ec0;
    }
    if (_0x26733a === _0x52bf63) {
      _0x13850b = _0x2e5ec0;
      break;
    }
  }
  let _0x2622a0 = _0x52bf63 === 0 ? 0 : _0xee44a3 + _0x517b18;
  let _0x303e06 = _0x52bf63 === _0x240418.length - 1 ? _0x1de9a7 : _0x13850b - _0x517b18;
  _0x2622a0 = _clamp(_0x2622a0, 0, _0x1de9a7);
  _0x303e06 = _clamp(_0x303e06, 0, _0x1de9a7);
  if (_0x303e06 < _0x2622a0) {
    const _0x56804c = _clamp((_0x2622a0 + _0x303e06) / 2, 0, _0x1de9a7);
    return {
      start: _0x56804c,
      end: _0x56804c
    };
  }
  return {
    start: _0x2622a0,
    end: _0x303e06
  };
}
export function resolveStoryboardCellPreviewSrc(_0x5a2738) {
  if (!_0x5a2738 || typeof _0x5a2738 !== "object") {
    return "";
  }
  const _0x5be952 = _normalizeLocalPath(_0x5a2738.displayLocalPath);
  if (_0x5be952) {
    return _0x5be952;
  }
  const _0x854bc3 = _normalizeLocalPath(_0x5a2738.localPath);
  if (_0x854bc3) {
    return _0x854bc3;
  }
  const _0x149c8e = _normalizeLocalPath(_0x5a2738.originalLocalPath);
  if (_0x149c8e) {
    return _0x149c8e;
  }
  if (_isUsablePreviewSrc(_0x5a2738.capturePreviewUrl)) {
    return _trimString(_0x5a2738.capturePreviewUrl);
  }
  if (_isUsableNonDataSrc(_0x5a2738.url)) {
    return _trimString(_0x5a2738.url);
  }
  const _0x3c048e = _normalizeLocalPath(_0x5a2738.thumbLocalPath);
  if (_0x3c048e) {
    return _0x3c048e;
  }
  if (_isUsableNonDataSrc(_0x5a2738.thumbUrl)) {
    return _trimString(_0x5a2738.thumbUrl);
  }
  return "";
}
export function resolveStoryboardCellAssetSrc(_0x54f92b) {
  if (!_0x54f92b || typeof _0x54f92b !== "object") {
    return "";
  }
  const _0x4263ad = _normalizeLocalPath(_0x54f92b.localPath);
  if (_0x4263ad) {
    return _0x4263ad;
  }
  const _0x20d141 = _normalizeLocalPath(_0x54f92b.originalLocalPath);
  if (_0x20d141) {
    return _0x20d141;
  }
  const _0x42488d = _normalizeLocalPath(_0x54f92b.displayLocalPath);
  if (_0x42488d) {
    return _0x42488d;
  }
  const _0x414247 = _normalizeLocalPath(_0x54f92b.thumbLocalPath);
  if (_0x414247) {
    return _0x414247;
  }
  if (_isUsablePreviewSrc(_0x54f92b.capturePreviewUrl)) {
    return _trimString(_0x54f92b.capturePreviewUrl);
  }
  if (_isUsableNonDataSrc(_0x54f92b.url)) {
    return _trimString(_0x54f92b.url);
  }
  if (_isUsableNonDataSrc(_0x54f92b.thumbUrl)) {
    return _trimString(_0x54f92b.thumbUrl);
  }
  return "";
}
export function isStoryboardCellEmpty(_0x1c2736) {
  if (!_0x1c2736 || typeof _0x1c2736 !== "object") {
    return true;
  }
  if (_0x1c2736.isEmpty === true) {
    return true;
  }
  return !_trimString(_0x1c2736.url) && !_trimString(_0x1c2736.localPath) && !_trimString(_0x1c2736.originalLocalPath) && !_trimString(_0x1c2736.displayLocalPath) && !_trimString(_0x1c2736.capturePreviewUrl) && !_trimString(_0x1c2736.thumbUrl) && !_trimString(_0x1c2736.thumbLocalPath) && !_trimString(_0x1c2736.thumbId) && !_trimString(_0x1c2736.sourceId) && !_trimString(_0x1c2736.sourceLocalPath) && !_trimString(_0x1c2736.sourceUrl);
}
function _hasLocalStoryboardCellAsset(_0x2afd52) {
  return !!_trimString(_0x2afd52?.localPath) || !!_trimString(_0x2afd52?.originalLocalPath) || !!_trimString(_0x2afd52?.displayLocalPath) || !!_trimString(_0x2afd52?.thumbLocalPath);
}
function _hasStoryboardCellSwapAsset(_0x3246a5) {
  return !!_hasLocalStoryboardCellAsset(_0x3246a5) || !!_trimString(_0x3246a5?.capturePreviewUrl) || !!_trimString(_0x3246a5?.url) || !!_trimString(_0x3246a5?.thumbUrl);
}
function _isSourceBackedStoryboardCell(_0x33c886) {
  return _0x33c886?.storyboardSourceCrop === true || !!_trimString(_0x33c886?.sourceLocalPath) || !!_trimString(_0x33c886?.sourceUrl);
}
export function isFrozenStoryboardDisplayCell(_0x1a013b) {
  if (!_0x1a013b || typeof _0x1a013b !== "object" || isStoryboardCellEmpty(_0x1a013b)) {
    return false;
  }
  if (!resolveStoryboardCellAssetSrc(_0x1a013b)) {
    return false;
  }
  if (_0x1a013b.storyboardPiece === true && _0x1a013b.storyboardExtractedCell !== true) {
    return false;
  }
  if (_0x1a013b.storyboardExtractedCell === true || _0x1a013b.storyboardLockedCell === true) {
    return true;
  }
  return !_isSourceBackedStoryboardCell(_0x1a013b) && _0x1a013b.storyboardPiece !== true;
}
export function detachStoryboardCellSourceContext(_0x56ed83, _0x35001d = {}) {
  const _0x4ed194 = _0x56ed83 && typeof _0x56ed83 === "object" ? {
    ..._0x56ed83
  } : {};
  const _0x16e3fb = _trimString(_0x4ed194.pieceId) || _trimString(_0x4ed194.id) || _trimString(_0x35001d.pieceId);
  if (_0x16e3fb) {
    _0x4ed194.pieceId = _0x16e3fb;
  }
  _0x4ed194.sourceId = null;
  _0x4ed194.sourceLocalPath = null;
  _0x4ed194.sourceUrl = "";
  _0x4ed194.sourceWidth = null;
  _0x4ed194.sourceHeight = null;
  _0x4ed194.storyboardSourceCrop = false;
  _0x4ed194.storyboardPiece = false;
  if (_0x35001d.locked === true) {
    _0x4ed194.storyboardLockedCell = true;
  }
  if (Object.prototype.hasOwnProperty.call(_0x35001d, "extracted")) {
    _0x4ed194.storyboardExtractedCell = _0x35001d.extracted === true;
  }
  return _0x4ed194;
}
export function cloneStoryboardCellForSwap(_0x1b55af) {
  const _0x37df8c = _0x1b55af && typeof _0x1b55af === "object" ? {
    ..._0x1b55af
  } : {};
  if (_hasLocalStoryboardCellAsset(_0x37df8c)) {
    if (_trimString(_0x37df8c.url).startsWith("data:")) {
      _0x37df8c.url = "";
    }
    if (_trimString(_0x37df8c.thumbUrl).startsWith("data:")) {
      _0x37df8c.thumbUrl = "";
    }
  }
  return _0x37df8c;
}
export function cloneStoryboardCellForSwapDestination(_0x20207b) {
  const _0x5a1741 = cloneStoryboardCellForSwap(_0x20207b);
  if (_isSourceBackedStoryboardCell(_0x5a1741) && !isStoryboardCellEmpty(_0x5a1741) && _hasStoryboardCellSwapAsset(_0x5a1741)) {
    return detachStoryboardCellSourceContext(_0x5a1741, {
      extracted: true,
      locked: _0x5a1741.storyboardLockedCell === true
    });
  }
  return _0x5a1741;
}
export function normalizeEmptyStoryboardCell(_0x44385b) {
  const _0x41bfe1 = _trimString(_0x44385b?.sourceLocalPath);
  const _0x1b8cbf = _trimString(_0x44385b?.sourceUrl);
  const _0x593e90 = _trimString(_0x44385b?.localPath) || _trimString(_0x44385b?.originalLocalPath) || _trimString(_0x44385b?.displayLocalPath) || _trimString(_0x44385b?.thumbLocalPath);
  const _0x473a71 = _trimString(_0x44385b?.url) || _trimString(_0x44385b?.capturePreviewUrl) || _trimString(_0x44385b?.thumbUrl);
  const _0x5ae736 = !!_0x41bfe1 || !!_0x1b8cbf;
  const _0x2328c5 = _trimString(_0x44385b?.residualImageLocalPath) || _0x41bfe1 || _0x593e90;
  const _0x22a342 = _trimString(_0x44385b?.residualImageUrl) || _0x1b8cbf || _0x473a71;
  const _0x37b76f = _trimString(_0x44385b?.residualImageMode) || (_0x5ae736 ? "source" : _0x2328c5 || _0x22a342 ? "cell" : "");
  const _0xf2c1ae = {
    ...(_0x44385b && typeof _0x44385b === "object" ? _0x44385b : {}),
    url: "",
    localPath: null,
    originalLocalPath: null,
    displayLocalPath: null,
    thumbUrl: "",
    thumbLocalPath: null,
    thumbId: null,
    sourceId: null,
    sourceLocalPath: null,
    sourceUrl: "",
    sourceWidth: null,
    sourceHeight: null,
    storyboardSourceCrop: false,
    storyboardPiece: false,
    storyboardLockedCell: false,
    residualImageLocalPath: _0x2328c5 || null,
    residualImageUrl: _0x22a342 || "",
    residualImageWidth: _toPositiveNumber(_0x44385b?.residualImageWidth) || _toPositiveNumber(_0x44385b?.sourceWidth) || _toPositiveNumber(_0x44385b?.originalWidth) || _toPositiveNumber(_0x44385b?.imageWidth) || null,
    residualImageHeight: _toPositiveNumber(_0x44385b?.residualImageHeight) || _toPositiveNumber(_0x44385b?.sourceHeight) || _toPositiveNumber(_0x44385b?.originalHeight) || _toPositiveNumber(_0x44385b?.imageHeight) || null,
    residualImageMode: _0x37b76f,
    isEmpty: true
  };
  if (_0x44385b && Object.prototype.hasOwnProperty.call(_0x44385b, "capturePreviewUrl")) {
    _0xf2c1ae.capturePreviewUrl = "";
  }
  if (_0x44385b && Object.prototype.hasOwnProperty.call(_0x44385b, "storyboardExtractedCell")) {
    _0xf2c1ae.storyboardExtractedCell = false;
  }
  return _0xf2c1ae;
}
export function getStoryboardCellMetrics(_0x4d2b3c) {
  const _0x13884d = _getSafeGridCount(_0x4d2b3c?.cols);
  const _0x931835 = _getSafeGridCount(_0x4d2b3c?.rows);
  const _0x4f9938 = resolveStoryboardGridLayout(_0x4d2b3c);
  const _0x335989 = STORYBOARD_CELL_GAP;
  const _0x6da313 = Math.max(0, Number(_0x4d2b3c?.width) || 0);
  const _0x2b87e7 = Math.max(0, Number(_0x4d2b3c?.height) || 0);
  const _0x1b75af = Math.max(0, _0x6da313 - STORYBOARD_CELL_INSET * 2);
  const _0x5a388f = Math.max(0, _0x2b87e7 - STORYBOARD_CELL_INSET * 2);
  const _0x58a519 = Math.max(0, (_0x1b75af - (_0x13884d - 1) * _0x335989) / _0x13884d);
  const _0x56c39e = Math.max(0, (_0x5a388f - (_0x931835 - 1) * _0x335989) / _0x931835);
  return {
    cols: _0x13884d,
    rows: _0x931835,
    width: _0x6da313,
    height: _0x2b87e7,
    gap: _0x335989,
    inset: STORYBOARD_CELL_INSET,
    innerWidth: _0x1b75af,
    innerHeight: _0x5a388f,
    cellWidth: _0x58a519,
    cellHeight: _0x56c39e,
    columnWeights: _0x4f9938.columns,
    rowWeights: _0x4f9938.rowTracks
  };
}
export function getStoryboardCellBounds(_0x1274fb, _0xa6e630, _0x10b746 = {}) {
  if (!_0x1274fb || typeof _0x1274fb !== "object") {
    return null;
  }
  const _0x14402a = resolveStoryboardGridLayout(_0x1274fb);
  const _0x27ff25 = Math.trunc(Number(_0xa6e630));
  if (!Number.isInteger(_0x27ff25) || _0x27ff25 < 0) {
    return null;
  }
  if (_0x27ff25 >= _0x14402a.cols * _0x14402a.rows) {
    return null;
  }
  const _0xdc1679 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x10b746, "width") ? _0x10b746.width : _0x1274fb.width) || 0);
  const _0x592c8f = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x10b746, "height") ? _0x10b746.height : _0x1274fb.height) || 0);
  const _0x3fed24 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x10b746, "inset") ? _0x10b746.inset : STORYBOARD_CELL_INSET) || 0);
  const _0x306799 = Object.prototype.hasOwnProperty.call(_0x10b746, "gap");
  const _0x15bd7 = Object.prototype.hasOwnProperty.call(_0x10b746, "gapX");
  const _0x4ce280 = Object.prototype.hasOwnProperty.call(_0x10b746, "gapY");
  const _0x5e216e = Math.max(0, Number(_0x306799 ? _0x10b746.gap : normalizeStoryboardGridGap(_0x1274fb.gridGap)) || 0);
  const _0x1411fb = Math.max(0, Number(_0x15bd7 ? _0x10b746.gapX : _0x5e216e) || 0);
  const _0x413452 = Math.max(0, Number(_0x4ce280 ? _0x10b746.gapY : _0x5e216e) || 0);
  const _0x11ae53 = _0x10b746.gapMode !== "track";
  const _0x4ed9d0 = _0x10b746.gapMode !== "track";
  const _0x3afdec = Math.max(0, _0xdc1679 - _0x3fed24 * 2);
  const _0x5d79e7 = Math.max(0, _0x592c8f - _0x3fed24 * 2);
  const _0x1a4222 = _0x11ae53 ? _0x3afdec : Math.max(0, _0x3afdec - (_0x14402a.cols - 1) * _0x1411fb);
  const _0x349b42 = _0x4ed9d0 ? _0x5d79e7 : Math.max(0, _0x5d79e7 - (_0x14402a.rows - 1) * _0x413452);
  const _0xac82aa = _0x27ff25 % _0x14402a.cols;
  const _0x48b9b4 = Math.floor(_0x27ff25 / _0x14402a.cols);
  const _0x31ff23 = _0x11ae53 ? _getCenteredGapTrackBounds(_0x14402a.columns, _0xac82aa, _0x1a4222, _0x1411fb) : _getTrackBounds(_0x14402a.columns, _0xac82aa, _0x1a4222, _0x1411fb);
  const _0x5564a9 = _0x4ed9d0 ? _getCenteredGapTrackBounds(_0x14402a.rowTracks, _0x48b9b4, _0x349b42, _0x413452) : _getTrackBounds(_0x14402a.rowTracks, _0x48b9b4, _0x349b42, _0x413452);
  const _0xfddf83 = _0x3fed24 + _0x31ff23.start;
  const _0x14ac62 = _0x3fed24 + _0x31ff23.end;
  const _0x2db2b3 = _0x3fed24 + _0x5564a9.start;
  const _0x339bbc = _0x3fed24 + _0x5564a9.end;
  return {
    col: _0xac82aa,
    row: _0x48b9b4,
    x0: _0xfddf83,
    y0: _0x2db2b3,
    x1: _0x14ac62,
    y1: _0x339bbc,
    width: Math.max(0, _0x14ac62 - _0xfddf83),
    height: Math.max(0, _0x339bbc - _0x2db2b3)
  };
}
export function getStoryboardCellPixelBounds(_0x4b4bbf, _0x47a704, _0x5413e6 = {}) {
  const _0x1e34b0 = getStoryboardCellBounds(_0x4b4bbf, _0x47a704, _0x5413e6);
  if (!_0x1e34b0) {
    return null;
  }
  const _0x2eadb2 = resolveStoryboardGridLayout(_0x4b4bbf);
  const _0x41884b = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x5413e6, "width") ? _0x5413e6.width : _0x4b4bbf?.width) || 0);
  const _0x448bc0 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x5413e6, "height") ? _0x5413e6.height : _0x4b4bbf?.height) || 0);
  const _0x43c8a5 = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x5413e6, "inset") ? _0x5413e6.inset : STORYBOARD_CELL_INSET) || 0);
  const _0x583175 = Math.floor(_0x43c8a5);
  const _0x15b3e7 = Math.floor(_0x43c8a5);
  const _0x56d512 = Math.max(_0x583175, Math.ceil(_0x41884b - _0x43c8a5));
  const _0x2312f8 = Math.max(_0x15b3e7, Math.ceil(_0x448bc0 - _0x43c8a5));
  let _0x457ccb = _clamp(Math.floor(_0x1e34b0.x0), _0x583175, _0x56d512);
  let _0x2429ad = _clamp(Math.floor(_0x1e34b0.y0), _0x15b3e7, _0x2312f8);
  let _0x48eebf = _clamp(Math.ceil(_0x1e34b0.x1), _0x583175, _0x56d512);
  let _0x4dce82 = _clamp(Math.ceil(_0x1e34b0.y1), _0x15b3e7, _0x2312f8);
  if (_0x1e34b0.col <= 0) {
    _0x457ccb = _0x583175;
  }
  if (_0x1e34b0.row <= 0) {
    _0x2429ad = _0x15b3e7;
  }
  if (_0x1e34b0.col >= _0x2eadb2.cols - 1) {
    _0x48eebf = _0x56d512;
  }
  if (_0x1e34b0.row >= _0x2eadb2.rows - 1) {
    _0x4dce82 = _0x2312f8;
  }
  if (_0x48eebf < _0x457ccb) {
    _0x48eebf = _0x457ccb;
  }
  if (_0x4dce82 < _0x2429ad) {
    _0x4dce82 = _0x2429ad;
  }
  return {
    ..._0x1e34b0,
    x0: _0x457ccb,
    y0: _0x2429ad,
    x1: _0x48eebf,
    y1: _0x4dce82,
    width: Math.max(0, _0x48eebf - _0x457ccb),
    height: Math.max(0, _0x4dce82 - _0x2429ad)
  };
}
export function buildStoryboardCropRect(_0x457192, _0x409155, _0x3e1f72 = {}) {
  if (!_0x457192 || typeof _0x457192 !== "object") {
    return null;
  }
  const _0x2b2547 = Math.max(1, Math.trunc(Number(_0x3e1f72.width) || 0));
  const _0x15c11f = Math.max(1, Math.trunc(Number(_0x3e1f72.height) || 0));
  if (_0x2b2547 <= 0 || _0x15c11f <= 0) {
    return null;
  }
  const _0x52fa3a = Math.max(0, Number(Object.prototype.hasOwnProperty.call(_0x3e1f72, "inset") ? _0x3e1f72.inset : 0) || 0);
  const _0x707546 = Object.prototype.hasOwnProperty.call(_0x3e1f72, "gap");
  const _0x3ef0c1 = Object.prototype.hasOwnProperty.call(_0x3e1f72, "gapX");
  const _0x3ab151 = Object.prototype.hasOwnProperty.call(_0x3e1f72, "gapY");
  const _0x56bfe8 = getStoryboardScaledGridGap(_0x457192, {
    width: _0x2b2547,
    height: _0x15c11f
  });
  const _0x332744 = _0x707546 ? Math.max(0, Number(_0x3e1f72.gap) || 0) : undefined;
  const _0x3218be = _0x3ef0c1 ? Math.max(0, Number(_0x3e1f72.gapX) || 0) : _0x707546 ? _0x332744 : _0x56bfe8.x;
  const _0x18db1a = _0x3ab151 ? Math.max(0, Number(_0x3e1f72.gapY) || 0) : _0x707546 ? _0x332744 : _0x56bfe8.y;
  const _0x47f111 = getStoryboardCellPixelBounds(_0x457192, _0x409155, {
    width: _0x2b2547,
    height: _0x15c11f,
    inset: _0x52fa3a,
    gapX: _0x3218be,
    gapY: _0x18db1a,
    ...(Object.prototype.hasOwnProperty.call(_0x3e1f72, "gapMode") ? {
      gapMode: _0x3e1f72.gapMode
    } : {})
  });
  if (!_0x47f111 || _0x47f111.width <= 0 || _0x47f111.height <= 0) {
    return null;
  }
  const _0x36ca63 = _clamp(_0x47f111.x0, 0, Math.max(0, _0x2b2547 - 1));
  const _0x2f5c38 = _clamp(_0x47f111.y0, 0, Math.max(0, _0x15c11f - 1));
  const _0x5166e2 = _clamp(_0x47f111.x1, _0x36ca63 + 1, _0x2b2547);
  const _0x26c60e = _clamp(_0x47f111.y1, _0x2f5c38 + 1, _0x15c11f);
  const _0x56e0da = Math.max(1, _0x5166e2 - _0x36ca63);
  const _0x4326f3 = Math.max(1, _0x26c60e - _0x2f5c38);
  return {
    sx: _0x36ca63,
    sy: _0x2f5c38,
    sw: _0x56e0da,
    sh: _0x4326f3,
    x0: _0x36ca63,
    y0: _0x2f5c38,
    x1: _0x5166e2,
    y1: _0x26c60e,
    width: _0x56e0da,
    height: _0x4326f3,
    bounds: _0x47f111
  };
}
export function getStoryboardCellIndexAtWorldPoint(_0x4b2ffc, _0x1b93a8, _0x763cf7) {
  if (!_0x4b2ffc || typeof _0x4b2ffc !== "object") {
    return -1;
  }
  const _0x4c78fb = Number(_0x4b2ffc.x) || 0;
  const _0x1a35d4 = Number(_0x4b2ffc.y) || 0;
  const _0x227fa3 = _0x1b93a8 - _0x4c78fb;
  const _0x3a2c8d = _0x763cf7 - _0x1a35d4;
  const _0x52a186 = getStoryboardCellMetrics(_0x4b2ffc);
  if (_0x227fa3 < 0 || _0x227fa3 > _0x52a186.width || _0x3a2c8d < 0 || _0x3a2c8d > _0x52a186.height) {
    return -1;
  }
  const _0x29f3d7 = _0x52a186.cols * _0x52a186.rows;
  for (let _0x19552f = 0; _0x19552f < _0x29f3d7; _0x19552f++) {
    const _0x266c64 = getStoryboardCellPixelBounds(_0x4b2ffc, _0x19552f);
    if (!_0x266c64 || _0x266c64.width <= 0 || _0x266c64.height <= 0) {
      continue;
    }
    if (_0x227fa3 >= _0x266c64.x0 && _0x227fa3 <= _0x266c64.x1 && _0x3a2c8d >= _0x266c64.y0 && _0x3a2c8d <= _0x266c64.y1) {
      return _0x19552f;
    }
  }
  return -1;
}
export function getStoryboardNearestCellIndexAtWorldPoint(_0x11dc9a, _0x4ecb49, _0x19ae8f) {
  if (!_0x11dc9a || typeof _0x11dc9a !== "object") {
    return -1;
  }
  const _0x3c5611 = getStoryboardCellIndexAtWorldPoint(_0x11dc9a, _0x4ecb49, _0x19ae8f);
  if (_0x3c5611 >= 0) {
    return _0x3c5611;
  }
  const _0x3b7537 = Number(_0x11dc9a.x) || 0;
  const _0x390613 = Number(_0x11dc9a.y) || 0;
  const _0x573a1b = _0x4ecb49 - _0x3b7537;
  const _0x3ec777 = _0x19ae8f - _0x390613;
  const _0x22898f = getStoryboardCellMetrics(_0x11dc9a);
  if (_0x573a1b < 0 || _0x573a1b > _0x22898f.width || _0x3ec777 < 0 || _0x3ec777 > _0x22898f.height) {
    return -1;
  }
  const _0x5d0bdc = _0x22898f.cols * _0x22898f.rows;
  let _0x4fee36 = -1;
  let _0x469038 = Infinity;
  for (let _0x137a66 = 0; _0x137a66 < _0x5d0bdc; _0x137a66++) {
    const _0x47595f = getStoryboardCellPixelBounds(_0x11dc9a, _0x137a66, {
      gap: 0
    });
    if (!_0x47595f || _0x47595f.width <= 0 || _0x47595f.height <= 0) {
      continue;
    }
    if (_0x573a1b >= _0x47595f.x0 && _0x573a1b <= _0x47595f.x1 && _0x3ec777 >= _0x47595f.y0 && _0x3ec777 <= _0x47595f.y1) {
      return _0x137a66;
    }
    const _0x380cc8 = _0x47595f.x0 + _0x47595f.width / 2;
    const _0x1ed280 = _0x47595f.y0 + _0x47595f.height / 2;
    const _0x48d624 = (_0x573a1b - _0x380cc8) ** 2 + (_0x3ec777 - _0x1ed280) ** 2;
    if (_0x48d624 < _0x469038) {
      _0x469038 = _0x48d624;
      _0x4fee36 = _0x137a66;
    }
  }
  return _0x4fee36;
}