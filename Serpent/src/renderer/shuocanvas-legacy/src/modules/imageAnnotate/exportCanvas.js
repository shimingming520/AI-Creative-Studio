import { getTextScalePair } from "./textControls.js";
import { drawRoundBrushStroke, getEraserClearLineWidth, getBrushLineWidth, mapBrushPoints } from "../imageEditorBrushStyle.js";
import { drawNumberLabelCommand } from "./numberLabels.js";
const canvasToBlob = (_0x2d8ca2, _0x1b3748, _0x519a9a) => new Promise(_0x46ee35 => _0x2d8ca2.toBlob(_0x46ee35, _0x1b3748, _0x519a9a));
const FAST_DISPLAY_EXPORT_MAX_EDGE = 1280;
const toPositiveCanvasSize = _0x50b230 => {
  const _0x1f819e = Number(_0x50b230);
  if (Number.isFinite(_0x1f819e) && _0x1f819e > 0) {
    return Math.max(1, Math.round(_0x1f819e));
  } else {
    return 0;
  }
};
const getImageElementSize = _0x203af4 => ({
  width: toPositiveCanvasSize(_0x203af4?.naturalWidth || _0x203af4?.width),
  height: toPositiveCanvasSize(_0x203af4?.naturalHeight || _0x203af4?.height)
});
const canDrawExistingImageElement = _0x1dab02 => {
  const _0x4de662 = getImageElementSize(_0x1dab02);
  return _0x1dab02 && _0x1dab02.complete !== false && _0x4de662.width > 0 && _0x4de662.height > 0;
};
const clampExportSizeToMaxEdge = (_0x123c5f, _0x2dd79e = FAST_DISPLAY_EXPORT_MAX_EDGE) => {
  const _0x1c29df = toPositiveCanvasSize(_0x123c5f?.width);
  const _0x3f4078 = toPositiveCanvasSize(_0x123c5f?.height);
  const _0x2d9a21 = toPositiveCanvasSize(_0x2dd79e);
  if (!_0x1c29df || !_0x3f4078 || !_0x2d9a21) {
    return {
      width: _0x1c29df,
      height: _0x3f4078
    };
  }
  const _0x2f2ac0 = Math.max(_0x1c29df, _0x3f4078);
  if (_0x2f2ac0 <= _0x2d9a21) {
    return {
      width: _0x1c29df,
      height: _0x3f4078
    };
  }
  const _0x5329d2 = _0x2d9a21 / _0x2f2ac0;
  return {
    width: Math.max(1, Math.round(_0x1c29df * _0x5329d2)),
    height: Math.max(1, Math.round(_0x3f4078 * _0x5329d2))
  };
};
const getFastDisplayExportSize = ({
  node: _0x552aa3,
  imgEl: _0xef3e66
} = {}) => {
  const _0x3f0c21 = getImageElementSize(_0xef3e66);
  if (_0x3f0c21.width && _0x3f0c21.height) {
    return clampExportSizeToMaxEdge(_0x3f0c21);
  }
  const _0x3fa02b = toPositiveCanvasSize(_0x552aa3?.width);
  const _0x4cfc7d = toPositiveCanvasSize(_0x552aa3?.height);
  if (_0x3fa02b && _0x4cfc7d) {
    return {
      width: _0x3fa02b,
      height: _0x4cfc7d
    };
  }
  return getImageElementSize(_0xef3e66);
};
const renderCommandToNaturalCanvas = ({
  ctx: _0x31d3b1,
  cmd: _0x4793d5,
  scaleX: _0x3a7cdd,
  scaleY: _0x25673d,
  isEraseScene: _0x3e6804,
  defaultTextColor: _0x416b5c,
  numberLabelBackgroundColor = ""
} = {}) => {
  if (_0x3e6804) {
    return;
  }
  if (_0x4793d5.type === "brush") {
    _0x31d3b1.save();
    drawRoundBrushStroke(_0x31d3b1, {
      points: mapBrushPoints(_0x4793d5.points, _0x3a7cdd, _0x25673d),
      lineWidth: getBrushLineWidth(_0x4793d5.sizeWorld, _0x3a7cdd, "brush"),
      strokeStyle: _0x4793d5.color,
      fillStyle: _0x4793d5.color,
      globalCompositeOperation: "source-over"
    });
    _0x31d3b1.restore();
    return;
  }
  if (_0x4793d5.type === "eraser") {
    _0x31d3b1.save();
    drawRoundBrushStroke(_0x31d3b1, {
      points: mapBrushPoints(_0x4793d5.points, _0x3a7cdd, _0x25673d),
      lineWidth: getEraserClearLineWidth(getBrushLineWidth(_0x4793d5.sizeWorld, _0x3a7cdd, "eraser")),
      strokeStyle: "#000",
      fillStyle: "#000",
      globalCompositeOperation: "destination-out"
    });
    _0x31d3b1.restore();
    return;
  }
  if (_0x4793d5.type === "rect") {
    const _0x3a8441 = _0x4793d5.x1 * _0x3a7cdd;
    const _0x21548a = _0x4793d5.y1 * _0x25673d;
    const _0x10a09d = _0x4793d5.x2 * _0x3a7cdd;
    const _0x4a9c99 = _0x4793d5.y2 * _0x25673d;
    const _0x10308b = Math.min(_0x3a8441, _0x10a09d);
    const _0x18fa2c = Math.min(_0x21548a, _0x4a9c99);
    const _0x316169 = Math.abs(_0x10a09d - _0x3a8441);
    const _0x510c1d = Math.abs(_0x4a9c99 - _0x21548a);
    _0x31d3b1.save();
    _0x31d3b1.globalCompositeOperation = "source-over";
    _0x31d3b1.strokeStyle = _0x4793d5.color;
    _0x31d3b1.lineWidth = getBrushLineWidth(_0x4793d5.sizeWorld, _0x3a7cdd, "brush");
    _0x31d3b1.strokeRect(_0x10308b, _0x18fa2c, _0x316169, _0x510c1d);
    _0x31d3b1.restore();
    return;
  }
  if (_0x4793d5.type === "text") {
    const _0x6db014 = _0x4793d5.x * _0x3a7cdd;
    const _0x285f43 = _0x4793d5.y * _0x25673d;
    const _0x2f9fe7 = Math.max(1, _0x4793d5.sizeWorld * _0x3a7cdd);
    const _0x1a4d43 = getTextScalePair(_0x4793d5);
    const _0x2e24fe = Number(_0x4793d5.rotation) || 0;
    _0x31d3b1.save();
    _0x31d3b1.globalCompositeOperation = "source-over";
    _0x31d3b1.fillStyle = _0x4793d5.color || _0x416b5c;
    _0x31d3b1.font = _0x2f9fe7 + "px sans-serif";
    _0x31d3b1.textBaseline = "top";
    _0x31d3b1.translate(_0x6db014, _0x285f43);
    _0x31d3b1.rotate(_0x2e24fe);
    _0x31d3b1.scale(_0x1a4d43.scaleX, _0x1a4d43.scaleY);
    _0x31d3b1.fillText(String(_0x4793d5.text || ""), 0, 0);
    _0x31d3b1.restore();
    return;
  }
  if (_0x4793d5.type === "number-label") {
    drawNumberLabelCommand({
      ctx: _0x31d3b1,
      cmd: _0x4793d5,
      scaleX: _0x3a7cdd,
      scaleY: _0x25673d,
      defaultColor: _0x416b5c,
      backgroundColor: numberLabelBackgroundColor
    });
  }
};
export const exportAnnotateCanvasBlob = async ({
  documentRef = null,
  node: _0x32ed2b,
  imgEl: _0x234ee7,
  imgUrl: _0x3467d3,
  commands: _0x4ac1a5,
  useWhiteboardBase: _0x3ad480,
  isEraseScene: _0x587d98,
  loadImage: _0x17e288,
  getCurrentFlipState: _0x33bd5d,
  applyFlipTransformToContext: _0x1c0ebf,
  createSelectionMaskCanvas: _0xc9a301,
  canvasWhiteColor: _0x2c2515,
  defaultTextColor: _0x3ed403,
  fastDisplayExport = false
} = {}) => {
  const _0x107841 = documentRef || globalThis.document;
  let _0x4de88c = null;
  let _0x53b325 = 0;
  let _0x23b0f4 = 0;
  const _0xd16f7c = Boolean(fastDisplayExport) && !_0x587d98;
  if (_0xd16f7c) {
    const _0x2b89a0 = getFastDisplayExportSize({
      node: _0x32ed2b,
      imgEl: _0x234ee7
    });
    _0x53b325 = _0x2b89a0.width;
    _0x23b0f4 = _0x2b89a0.height;
    if (!_0x3ad480 && canDrawExistingImageElement(_0x234ee7)) {
      _0x4de88c = _0x234ee7;
    }
  }
  if ((!_0x53b325 || !_0x23b0f4) && _0x3ad480) {
    try {
      _0x4de88c = await _0x17e288(_0x3467d3);
      _0x53b325 = _0x4de88c.naturalWidth || _0x4de88c.width;
      _0x23b0f4 = _0x4de88c.naturalHeight || _0x4de88c.height;
    } catch {
      _0x53b325 = Number(_0x234ee7?.naturalWidth || _0x234ee7?.width || 0);
      _0x23b0f4 = Number(_0x234ee7?.naturalHeight || _0x234ee7?.height || 0);
    }
  }
  if (!_0x53b325 || !_0x23b0f4 || !_0x3ad480 && !_0x4de88c) {
    const _0x1e4b50 = await _0x17e288(_0x3467d3);
    _0x4de88c = _0x1e4b50;
    if (!_0x53b325 || !_0x23b0f4) {
      _0x53b325 = _0x1e4b50.naturalWidth || _0x1e4b50.width;
      _0x23b0f4 = _0x1e4b50.naturalHeight || _0x1e4b50.height;
    }
  }
  const _0x114d8b = _0x107841.createElement("canvas");
  _0x114d8b.width = _0x53b325;
  _0x114d8b.height = _0x23b0f4;
  const _0x5d393a = _0x114d8b.getContext("2d");
  const _0x5a43e6 = _0x33bd5d();
  if (!_0x587d98) {
    _0x5d393a.fillStyle = _0x2c2515;
    _0x5d393a.fillRect(0, 0, _0x53b325, _0x23b0f4);
    _0x5d393a.save();
    _0x1c0ebf(_0x5d393a, _0x53b325, _0x23b0f4, _0x5a43e6);
  }
  if (!_0x3ad480) {
    _0x5d393a.drawImage(_0x4de88c, 0, 0, _0x53b325, _0x23b0f4);
  }
  const _0x101ab1 = _0x53b325 / (_0x32ed2b?.width || 1);
  const _0x178b55 = _0x23b0f4 / (_0x32ed2b?.height || 1);
  if (_0x587d98) {
    const _0x4f9ef6 = _0xc9a301(_0x53b325, _0x23b0f4, _0x101ab1, _0x178b55);
    _0x5d393a.save();
    _0x5d393a.globalCompositeOperation = "destination-out";
    _0x5d393a.drawImage(_0x4f9ef6, 0, 0);
    _0x5d393a.restore();
  }
  (Array.isArray(_0x4ac1a5) ? _0x4ac1a5 : []).forEach(_0x38532a => renderCommandToNaturalCanvas({
    ctx: _0x5d393a,
    cmd: _0x38532a,
    scaleX: _0x101ab1,
    scaleY: _0x178b55,
    isEraseScene: _0x587d98,
    defaultTextColor: _0x3ed403,
    numberLabelBackgroundColor: _0x2c2515
  }));
  if (!_0x587d98) {
    _0x5d393a.restore();
  }
  const _0x11ae21 = _0x587d98 ? "image/png" : "image/jpeg";
  const _0x2cb823 = _0x587d98 ? undefined : 0.9;
  const _0x471c39 = await canvasToBlob(_0x114d8b, _0x11ae21, _0x2cb823);
  if (!_0x471c39) {
    throw new Error("Canvas 导出失败");
  }
  return {
    blob: _0x471c39,
    exportType: _0x11ae21,
    naturalWidth: _0x53b325,
    naturalHeight: _0x23b0f4
  };
};