import { getCachedSealedFillRegion, paintFilledRegion } from "../bucketFill.js";
import { createEraseCheckerboardPattern, drawEraseMaskCommand, drawEraseBrushCommand, compositeSolidMaskPreview } from "../eraseBrushRenderer.js";
import { drawRoundBrushStroke, getEraserClearLineWidth, getBrushLineWidth } from "../imageEditorBrushStyle.js";
import { getTextLayout, getTextRotationHandle, getTextScalePair, TEXT_CONTROL_BUTTON_RADIUS, TEXT_CONTROL_SIDE_HANDLE_RADIUS } from "./textControls.js";
import { drawNumberLabelCommand } from "./numberLabels.js";
import { getArrowGeometry } from "./arrowGeometry.js";
import { getWhiteboardShapeBounds, isClosedWhiteboardShape, traceWhiteboardShapePath } from "./whiteboardShapes.js";
const getCanvasRenderSize = _0x42d99a => ({
  width: Number(_0x42d99a?.style?.width?.replace("px", "")) || 1,
  height: Number(_0x42d99a?.style?.height?.replace("px", "")) || 1
});
const getViewportZoom = _0x4367f4 => {
  const _0x788e0b = Number(_0x4367f4?.zoom);
  if (Number.isFinite(_0x788e0b) && _0x788e0b > 0) {
    return _0x788e0b;
  } else {
    return 1;
  }
};
const getCommandOpacity = (_0x5f2c5c, _0x8c47e3 = 1) => {
  const _0x2e8075 = Number(_0x5f2c5c?.opacity);
  const _0x4418cf = Number.isFinite(_0x2e8075) ? _0x2e8075 : 1;
  const _0x43c6fb = Number.isFinite(Number(_0x8c47e3)) ? Number(_0x8c47e3) : 1;
  return Math.max(0, Math.min(1, _0x4418cf * _0x43c6fb));
};
const isFreehandCommand = _0x28aa82 => _0x28aa82?.type === "brush" || _0x28aa82?.type === "eraser";
const getCommandStrokeZoom = (_0x5d6cc6, _0x3be7ae, _0x3f6afc) => _0x3f6afc === "screen" && isFreehandCommand(_0x5d6cc6) ? 1 : _0x3be7ae;
const worldToScreenPoint = (_0x36c794, _0x291fc0) => {
  const _0x423235 = getViewportZoom(_0x291fc0);
  const _0x23888c = Number(_0x291fc0?.x) || 0;
  const _0x3adb2a = Number(_0x291fc0?.y) || 0;
  return {
    x: ((Number(_0x36c794?.x) || 0) - _0x23888c) * _0x423235,
    y: ((Number(_0x36c794?.y) || 0) - _0x3adb2a) * _0x423235
  };
};
const getScreenX = (_0x42a525, _0xc14247) => ((Number(_0x42a525) || 0) - (Number(_0xc14247?.x) || 0)) * getViewportZoom(_0xc14247);
const getScreenY = (_0x2b50a4, _0x2e43a6) => ((Number(_0x2b50a4) || 0) - (Number(_0x2e43a6?.y) || 0)) * getViewportZoom(_0x2e43a6);
const getCommandPoints = (_0x11b63d, _0x847ad) => (Array.isArray(_0x11b63d?.points) ? _0x11b63d.points : []).map(_0x9578fe => {
  const _0x38f4b1 = Number(_0x9578fe?.x);
  const _0x3ed3a3 = Number(_0x9578fe?.y);
  if (!Number.isFinite(_0x38f4b1) || !Number.isFinite(_0x3ed3a3)) {
    return null;
  }
  return {
    x: getScreenX(_0x38f4b1, _0x847ad),
    y: getScreenY(_0x3ed3a3, _0x847ad)
  };
}).filter(Boolean);
const applyStrokeDash = (_0x58b5ab, _0x27d7e1, _0x2365e5) => {
  if (!_0x58b5ab) {
    return;
  }
  if (_0x27d7e1 === "dashed") {
    _0x58b5ab.setLineDash([Math.max(6, _0x2365e5 * 3), Math.max(4, _0x2365e5 * 1.5)]);
  } else if (_0x27d7e1 === "dotted") {
    _0x58b5ab.setLineDash([Math.max(1, _0x2365e5 * 0.2), Math.max(4, _0x2365e5 * 1.8)]);
  } else {
    _0x58b5ab.setLineDash([]);
  }
};
const rotateCanvasAroundBounds = (_0x1ca332, _0x148cf8, _0x45388f) => {
  const _0x352aab = Number(_0x45388f) || 0;
  if (!_0x1ca332 || Math.abs(_0x352aab) < 0.000001) {
    return;
  }
  const _0x1ed807 = _0x148cf8.x + _0x148cf8.width / 2;
  const _0x148c84 = _0x148cf8.y + _0x148cf8.height / 2;
  _0x1ca332.translate(_0x1ed807, _0x148c84);
  _0x1ca332.rotate(_0x352aab);
  _0x1ca332.translate(-_0x1ed807, -_0x148c84);
};
const rotatePointAround = (_0x26c281, _0x4a4376, _0x1bc88c) => {
  const _0x13ec18 = _0x26c281.x - _0x4a4376.x;
  const _0xbd3c3e = _0x26c281.y - _0x4a4376.y;
  const _0x555dfb = Math.cos(_0x1bc88c);
  const _0x56f004 = Math.sin(_0x1bc88c);
  return {
    x: _0x4a4376.x + _0x13ec18 * _0x555dfb - _0xbd3c3e * _0x56f004,
    y: _0x4a4376.y + _0x13ec18 * _0x56f004 + _0xbd3c3e * _0x555dfb
  };
};
const drawArrowHead = ({
  ctx: _0x122085,
  point: _0x416453,
  opposite: _0x37a637,
  lineWidth: _0x2fee74,
  compareLength: _0x5eac73
} = {}) => {
  const _0x38ce3f = Number(_0x37a637?.x) - Number(_0x416453?.x);
  const _0x10b4d0 = Number(_0x37a637?.y) - Number(_0x416453?.y);
  const _0x52b927 = Math.hypot(_0x38ce3f, _0x10b4d0);
  if (!_0x122085 || !Number.isFinite(_0x52b927) || _0x52b927 < 0.5) {
    return false;
  }
  const _0x14adb6 = Math.max(_0x2fee74, Math.min(_0x2fee74 * 3, _0x5eac73 / 5));
  const _0x1d3ac2 = {
    x: _0x416453.x + _0x38ce3f / _0x52b927 * _0x14adb6,
    y: _0x416453.y + _0x10b4d0 / _0x52b927 * _0x14adb6
  };
  const _0x21d96b = rotatePointAround(_0x1d3ac2, _0x416453, Math.PI / 6);
  const _0x20c65f = rotatePointAround(_0x1d3ac2, _0x416453, -Math.PI / 6);
  _0x122085.beginPath();
  _0x122085.moveTo(_0x21d96b.x, _0x21d96b.y);
  _0x122085.lineTo(_0x416453.x, _0x416453.y);
  _0x122085.lineTo(_0x20c65f.x, _0x20c65f.y);
  _0x122085.stroke();
  return true;
};
const drawArrowTerminal = ({
  ctx: _0x3cf671,
  style: _0x15d323,
  point: _0x441601,
  opposite: _0x587b9b,
  lineWidth: _0x42eef0,
  compareLength: _0x5bd7ce
} = {}) => {
  if (!_0x3cf671 || !_0x15d323 || _0x15d323 === "none") {
    return false;
  }
  if (_0x15d323 === "arrow") {
    return drawArrowHead({
      ctx: _0x3cf671,
      point: _0x441601,
      opposite: _0x587b9b,
      lineWidth: _0x42eef0,
      compareLength: _0x5bd7ce
    });
  }
  const _0x488a4b = Number(_0x587b9b?.x) - Number(_0x441601?.x);
  const _0x2e2d5d = Number(_0x587b9b?.y) - Number(_0x441601?.y);
  const _0x82206b = Math.hypot(_0x488a4b, _0x2e2d5d);
  if (!Number.isFinite(_0x82206b) || _0x82206b < 0.5) {
    return false;
  }
  const _0x21549a = {
    x: _0x488a4b / _0x82206b,
    y: _0x2e2d5d / _0x82206b
  };
  const _0xdd35f0 = {
    x: -_0x21549a.y,
    y: _0x21549a.x
  };
  const _0x11261d = Math.max(_0x42eef0 * 1.6, Math.min(_0x42eef0 * 3.2, _0x5bd7ce / 5));
  const _0x5bfa3e = {
    x: _0x441601.x + _0x21549a.x * _0x11261d,
    y: _0x441601.y + _0x21549a.y * _0x11261d
  };
  const _0x516f5d = _0x11261d * 0.52;
  const _0x395d0c = {
    x: _0x5bfa3e.x + _0xdd35f0.x * _0x516f5d,
    y: _0x5bfa3e.y + _0xdd35f0.y * _0x516f5d
  };
  const _0xaf29df = {
    x: _0x5bfa3e.x - _0xdd35f0.x * _0x516f5d,
    y: _0x5bfa3e.y - _0xdd35f0.y * _0x516f5d
  };
  _0x3cf671.beginPath();
  if (_0x15d323 === "circle") {
    const _0x5933d9 = _0x11261d * 0.46;
    _0x3cf671.arc(_0x441601.x + _0x21549a.x * _0x5933d9, _0x441601.y + _0x21549a.y * _0x5933d9, _0x5933d9, 0, Math.PI * 2);
    _0x3cf671.fill();
    _0x3cf671.stroke();
    return true;
  }
  if (_0x15d323 === "bar") {
    _0x3cf671.moveTo(_0x441601.x + _0xdd35f0.x * _0x516f5d, _0x441601.y + _0xdd35f0.y * _0x516f5d);
    _0x3cf671.lineTo(_0x441601.x - _0xdd35f0.x * _0x516f5d, _0x441601.y - _0xdd35f0.y * _0x516f5d);
    _0x3cf671.stroke();
    return true;
  }
  if (_0x15d323 === "inverted") {
    _0x3cf671.moveTo(_0x441601.x + _0xdd35f0.x * _0x516f5d, _0x441601.y + _0xdd35f0.y * _0x516f5d);
    _0x3cf671.lineTo(_0x5bfa3e.x, _0x5bfa3e.y);
    _0x3cf671.lineTo(_0x441601.x - _0xdd35f0.x * _0x516f5d, _0x441601.y - _0xdd35f0.y * _0x516f5d);
    _0x3cf671.closePath();
    _0x3cf671.fill();
    _0x3cf671.stroke();
    return true;
  }
  if (_0x15d323 === "diamond") {
    const _0x5b46f9 = {
      x: _0x441601.x + _0x21549a.x * _0x11261d * 0.5,
      y: _0x441601.y + _0x21549a.y * _0x11261d * 0.5
    };
    _0x3cf671.moveTo(_0x441601.x, _0x441601.y);
    _0x3cf671.lineTo(_0x5b46f9.x + _0xdd35f0.x * _0x516f5d, _0x5b46f9.y + _0xdd35f0.y * _0x516f5d);
    _0x3cf671.lineTo(_0x5bfa3e.x, _0x5bfa3e.y);
    _0x3cf671.lineTo(_0x5b46f9.x - _0xdd35f0.x * _0x516f5d, _0x5b46f9.y - _0xdd35f0.y * _0x516f5d);
    _0x3cf671.closePath();
    _0x3cf671.fill();
    _0x3cf671.stroke();
    return true;
  }
  if (_0x15d323 === "square") {
    _0x3cf671.moveTo(_0x441601.x + _0xdd35f0.x * _0x516f5d, _0x441601.y + _0xdd35f0.y * _0x516f5d);
    _0x3cf671.lineTo(_0x395d0c.x, _0x395d0c.y);
    _0x3cf671.lineTo(_0xaf29df.x, _0xaf29df.y);
    _0x3cf671.lineTo(_0x441601.x - _0xdd35f0.x * _0x516f5d, _0x441601.y - _0xdd35f0.y * _0x516f5d);
    _0x3cf671.closePath();
    _0x3cf671.fill();
    _0x3cf671.stroke();
    return true;
  }
  _0x3cf671.moveTo(_0x441601.x, _0x441601.y);
  _0x3cf671.lineTo(_0x395d0c.x, _0x395d0c.y);
  _0x3cf671.lineTo(_0xaf29df.x, _0xaf29df.y);
  _0x3cf671.closePath();
  _0x3cf671.fill();
  _0x3cf671.stroke();
  return true;
};
const drawArrowCommand = ({
  ctx: _0x51b9cf,
  cmd: _0x173f42,
  viewport: _0x3beac4,
  isDraft = false,
  opacityMultiplier = 1
} = {}) => {
  const _0x1cecbf = getViewportZoom(_0x3beac4);
  const _0xb125bd = getArrowGeometry(_0x173f42);
  const _0x4d7c0b = worldToScreenPoint(_0xb125bd.start, _0x3beac4);
  const _0x49f75a = worldToScreenPoint(_0xb125bd.end, _0x3beac4);
  const _0x3070c3 = _0xb125bd.length * _0x1cecbf;
  if (!_0x51b9cf || _0x3070c3 < 0.5) {
    return false;
  }
  const _0xe9569f = getBrushLineWidth(_0x173f42.sizeWorld, _0x1cecbf, "brush");
  _0x51b9cf.save();
  _0x51b9cf.globalCompositeOperation = "source-over";
  _0x51b9cf.strokeStyle = _0x173f42.color;
  _0x51b9cf.fillStyle = _0x173f42.color;
  _0x51b9cf.lineWidth = _0xe9569f;
  _0x51b9cf.lineCap = "round";
  _0x51b9cf.lineJoin = "round";
  if (isDraft) {
    _0x51b9cf.setLineDash([6, 5]);
  } else {
    applyStrokeDash(_0x51b9cf, _0x173f42.dash, _0xe9569f);
  }
  _0x51b9cf.globalAlpha = getCommandOpacity(_0x173f42, opacityMultiplier);
  _0x51b9cf.beginPath();
  _0x51b9cf.moveTo(_0x4d7c0b.x, _0x4d7c0b.y);
  if (_0xb125bd.type === "arc") {
    const _0x1f429d = worldToScreenPoint(_0xb125bd.center, _0x3beac4);
    _0x51b9cf.arc(_0x1f429d.x, _0x1f429d.y, _0xb125bd.radius * _0x1cecbf, _0xb125bd.startAngle, _0xb125bd.endAngle, _0xb125bd.anticlockwise);
  } else if (_0xb125bd.type === "elbow") {
    _0xb125bd.points.slice(1).forEach(_0x97969a => {
      const _0xe4fa94 = worldToScreenPoint(_0x97969a, _0x3beac4);
      _0x51b9cf.lineTo(_0xe4fa94.x, _0xe4fa94.y);
    });
  } else {
    _0x51b9cf.lineTo(_0x49f75a.x, _0x49f75a.y);
  }
  _0x51b9cf.stroke();
  _0x51b9cf.setLineDash([]);
  const _0x2e1824 = Math.max(1, _0xe9569f);
  if (_0x173f42.arrowEnd !== "none") {
    drawArrowTerminal({
      ctx: _0x51b9cf,
      style: _0x173f42.arrowEnd,
      point: _0x49f75a,
      opposite: {
        x: _0x49f75a.x - _0xb125bd.endTangent.x * _0x2e1824,
        y: _0x49f75a.y - _0xb125bd.endTangent.y * _0x2e1824
      },
      lineWidth: _0xe9569f,
      compareLength: _0x3070c3
    });
  }
  if (_0x173f42.arrowStart !== "none") {
    drawArrowTerminal({
      ctx: _0x51b9cf,
      style: _0x173f42.arrowStart,
      point: _0x4d7c0b,
      opposite: {
        x: _0x4d7c0b.x + _0xb125bd.startTangent.x * _0x2e1824,
        y: _0x4d7c0b.y + _0xb125bd.startTangent.y * _0x2e1824
      },
      lineWidth: _0xe9569f,
      compareLength: _0x3070c3
    });
  }
  _0x51b9cf.restore();
  return true;
};
const drawWhiteboardShapeCommand = ({
  ctx: _0x11eb3c,
  cmd: _0x146f10,
  viewport: _0x275ea8,
  isDraft = false,
  opacityMultiplier = 1
} = {}) => {
  if (!_0x11eb3c) {
    return false;
  }
  const _0x23a08f = getViewportZoom(_0x275ea8);
  const _0x7f9b2 = getWhiteboardShapeBounds(_0x146f10);
  const _0xf064b4 = worldToScreenPoint({
    x: _0x7f9b2.x,
    y: _0x7f9b2.y
  }, _0x275ea8);
  const _0x4d4643 = {
    x: _0xf064b4.x,
    y: _0xf064b4.y,
    width: _0x7f9b2.width * _0x23a08f,
    height: _0x7f9b2.height * _0x23a08f
  };
  if (_0x4d4643.width < 0.5 && _0x4d4643.height < 0.5) {
    return false;
  }
  const _0x475d71 = getBrushLineWidth(_0x146f10.sizeWorld, _0x23a08f, "brush");
  _0x11eb3c.save();
  rotateCanvasAroundBounds(_0x11eb3c, _0x4d4643, _0x146f10.rotation);
  _0x11eb3c.globalCompositeOperation = "source-over";
  _0x11eb3c.strokeStyle = _0x146f10.color;
  _0x11eb3c.fillStyle = _0x146f10.color;
  _0x11eb3c.lineWidth = _0x475d71;
  _0x11eb3c.lineCap = "round";
  _0x11eb3c.lineJoin = "round";
  _0x11eb3c.globalAlpha = getCommandOpacity(_0x146f10, opacityMultiplier);
  if (isDraft) {
    _0x11eb3c.setLineDash([6, 5]);
  } else {
    applyStrokeDash(_0x11eb3c, _0x146f10.dash, _0x475d71);
  }
  _0x11eb3c.beginPath();
  traceWhiteboardShapePath(_0x11eb3c, _0x146f10.shapeType, _0x4d4643);
  if (_0x146f10.fill === "solid" && isClosedWhiteboardShape(_0x146f10.shapeType)) {
    _0x11eb3c.fill();
  }
  _0x11eb3c.stroke();
  _0x11eb3c.restore();
  return true;
};
const drawTextControlButton = (_0x49cedd, _0x2eb642, _0x2de5ab, _0x1941f9) => {
  _0x49cedd.save();
  _0x49cedd.beginPath();
  _0x49cedd.arc(_0x2eb642.x, _0x2eb642.y, TEXT_CONTROL_BUTTON_RADIUS, 0, Math.PI * 2);
  _0x49cedd.fillStyle = _0x1941f9.fill;
  _0x49cedd.strokeStyle = _0x1941f9.stroke;
  _0x49cedd.lineWidth = 1.5;
  _0x49cedd.fill();
  _0x49cedd.stroke();
  _0x49cedd.strokeStyle = _0x1941f9.icon;
  _0x49cedd.fillStyle = _0x1941f9.icon;
  _0x49cedd.lineWidth = 1.6;
  _0x49cedd.lineCap = "round";
  _0x49cedd.lineJoin = "round";
  _0x2de5ab(_0x49cedd, _0x2eb642);
  _0x49cedd.restore();
};
const getBoundaryCommands = (_0x33144b, _0x1fdede) => _0x33144b.slice(0, _0x1fdede).filter(_0x58e7f2 => _0x58e7f2?.type === "brush" || _0x58e7f2?.type === "rect" || _0x58e7f2?.type === "arrow" || _0x58e7f2?.type === "eraser");
export const drawTextSelectionControls = ({
  ctx: _0x5f36bc,
  geom: _0x8a9684,
  resolveCssVar: _0x2ec5f0,
  variant = "annotate"
} = {}) => {
  if (!_0x5f36bc || !_0x8a9684) {
    return;
  }
  const _0x4b7a09 = _0x2ec5f0("--blue-border-focus") || _0x5f36bc.strokeStyle;
  const _0x10ac78 = _0x2ec5f0("--canvas-white") || _0x5f36bc.fillStyle;
  const _0x51f283 = _0x2ec5f0("--bg") || _0x2ec5f0("--text-primary") || _0x4b7a09;
  const _0x1fec14 = {
    stroke: _0x4b7a09,
    fill: _0x10ac78,
    icon: _0x51f283
  };
  const [_0x29734c, _0x3a7395, _0x38e559, _0x285bd0] = _0x8a9684.corners;
  _0x5f36bc.save();
  _0x5f36bc.strokeStyle = _0x4b7a09;
  _0x5f36bc.lineWidth = 1.5;
  _0x5f36bc.setLineDash([]);
  _0x5f36bc.beginPath();
  _0x5f36bc.moveTo(_0x29734c.x, _0x29734c.y);
  _0x5f36bc.lineTo(_0x3a7395.x, _0x3a7395.y);
  _0x5f36bc.lineTo(_0x38e559.x, _0x38e559.y);
  _0x5f36bc.lineTo(_0x285bd0.x, _0x285bd0.y);
  _0x5f36bc.closePath();
  _0x5f36bc.stroke();
  _0x5f36bc.restore();
  if (variant === "whiteboard") {
    _0x5f36bc.save();
    const _0x1a518a = getTextRotationHandle(_0x8a9684);
    if (_0x1a518a && _0x8a9684.handles?.top) {
      _0x5f36bc.beginPath();
      _0x5f36bc.moveTo(_0x8a9684.handles.top.x, _0x8a9684.handles.top.y);
      _0x5f36bc.lineTo(_0x1a518a.x, _0x1a518a.y);
      _0x5f36bc.strokeStyle = _0x4b7a09;
      _0x5f36bc.lineWidth = 1.5;
      _0x5f36bc.stroke();
    }
    const _0x23f270 = [..._0x8a9684.corners, ...(_0x1a518a ? [_0x1a518a] : [])];
    _0x23f270.forEach(_0x20dce0 => {
      _0x5f36bc.beginPath();
      _0x5f36bc.arc(_0x20dce0.x, _0x20dce0.y, 5.5, 0, Math.PI * 2);
      _0x5f36bc.fillStyle = _0x10ac78;
      _0x5f36bc.strokeStyle = _0x4b7a09;
      _0x5f36bc.lineWidth = 1.5;
      _0x5f36bc.fill();
      _0x5f36bc.stroke();
    });
    _0x5f36bc.restore();
    return;
  }
  _0x5f36bc.save();
  Object.values(_0x8a9684.handles || {}).filter(_0x40c172 => _0x40c172 && !Array.isArray(_0x40c172)).forEach(_0x243b90 => {
    _0x5f36bc.beginPath();
    _0x5f36bc.arc(_0x243b90.x, _0x243b90.y, TEXT_CONTROL_SIDE_HANDLE_RADIUS, 0, Math.PI * 2);
    _0x5f36bc.fillStyle = _0x10ac78;
    _0x5f36bc.strokeStyle = _0x4b7a09;
    _0x5f36bc.lineWidth = 1.5;
    _0x5f36bc.fill();
    _0x5f36bc.stroke();
  });
  _0x5f36bc.restore();
  drawTextControlButton(_0x5f36bc, _0x29734c, (_0x304473, _0x25838a) => {
    _0x304473.beginPath();
    _0x304473.moveTo(_0x25838a.x - 3, _0x25838a.y - 3);
    _0x304473.lineTo(_0x25838a.x + 3, _0x25838a.y + 3);
    _0x304473.moveTo(_0x25838a.x + 3, _0x25838a.y - 3);
    _0x304473.lineTo(_0x25838a.x - 3, _0x25838a.y + 3);
    _0x304473.stroke();
  }, _0x1fec14);
  drawTextControlButton(_0x5f36bc, _0x285bd0, (_0x395ec8, _0xc9864e) => {
    _0x395ec8.strokeRect(_0xc9864e.x - 2, _0xc9864e.y - 4, 6, 6);
    _0x395ec8.strokeRect(_0xc9864e.x - 5, _0xc9864e.y - 1, 6, 6);
  }, _0x1fec14);
  drawTextControlButton(_0x5f36bc, _0x3a7395, (_0x7caa08, _0x1fa167) => {
    _0x7caa08.beginPath();
    _0x7caa08.arc(_0x1fa167.x, _0x1fa167.y, 4, Math.PI * 0.15, Math.PI * 1.55);
    _0x7caa08.stroke();
    _0x7caa08.beginPath();
    _0x7caa08.moveTo(_0x1fa167.x + 4, _0x1fa167.y - 3);
    _0x7caa08.lineTo(_0x1fa167.x + 5, _0x1fa167.y + 2);
    _0x7caa08.lineTo(_0x1fa167.x + 1, _0x1fa167.y);
    _0x7caa08.stroke();
  }, _0x1fec14);
  drawTextControlButton(_0x5f36bc, _0x38e559, (_0x270310, _0x59c780) => {
    _0x270310.beginPath();
    _0x270310.moveTo(_0x59c780.x - 4, _0x59c780.y + 4);
    _0x270310.lineTo(_0x59c780.x + 4, _0x59c780.y - 4);
    _0x270310.moveTo(_0x59c780.x + 1, _0x59c780.y - 4);
    _0x270310.lineTo(_0x59c780.x + 4, _0x59c780.y - 4);
    _0x270310.lineTo(_0x59c780.x + 4, _0x59c780.y - 1);
    _0x270310.moveTo(_0x59c780.x - 1, _0x59c780.y + 4);
    _0x270310.lineTo(_0x59c780.x - 4, _0x59c780.y + 4);
    _0x270310.lineTo(_0x59c780.x - 4, _0x59c780.y + 1);
    _0x270310.stroke();
  }, _0x1fec14);
};
export const renderEraseSceneCommands = ({
  documentRef = null,
  canvasEl: _0x370128,
  ctx: _0x368e3f,
  viewport: _0x145011,
  commands = [],
  draft = null,
  checkerPattern: _0x1b7b93,
  eraseMaskCanvasEl = null
} = {}) => {
  if (!_0x370128 || !_0x368e3f) {
    return eraseMaskCanvasEl;
  }
  const _0x258a4c = documentRef || globalThis.document;
  const _0x4da6ad = getViewportZoom(_0x145011);
  const _0x2f67a7 = getCanvasRenderSize(_0x370128);
  const _0x58d32d = Math.max(1, Math.round(_0x2f67a7.width));
  const _0x35cd8a = Math.max(1, Math.round(_0x2f67a7.height));
  let _0x3ac389 = eraseMaskCanvasEl;
  if (!_0x3ac389 || _0x3ac389.width !== _0x58d32d || _0x3ac389.height !== _0x35cd8a) {
    _0x3ac389 = _0x258a4c.createElement("canvas");
    _0x3ac389.width = _0x58d32d;
    _0x3ac389.height = _0x35cd8a;
  }
  const _0x1c1975 = _0x3ac389.getContext("2d");
  if (!_0x1c1975) {
    return _0x3ac389;
  }
  _0x1c1975.clearRect(0, 0, _0x58d32d, _0x35cd8a);
  _0x1c1975.lineCap = "round";
  _0x1c1975.lineJoin = "round";
  const _0x1ed801 = _0x495bc7 => {
    if (!_0x495bc7 || _0x495bc7.type !== "brush" && _0x495bc7.type !== "eraser") {
      return;
    }
    const _0x4adc64 = getCommandPoints(_0x495bc7, _0x145011);
    if (!_0x4adc64.length) {
      return;
    }
    drawEraseMaskCommand(_0x1c1975, {
      type: _0x495bc7.type,
      points: _0x4adc64,
      lineWidth: getBrushLineWidth(_0x495bc7.sizeWorld, _0x4da6ad, _0x495bc7.type)
    });
  };
  (Array.isArray(commands) ? commands : []).forEach(_0x1ed801);
  if (draft) {
    _0x1ed801(draft);
  }
  compositeSolidMaskPreview(_0x368e3f, {
    maskCanvas: _0x3ac389,
    width: _0x2f67a7.width,
    height: _0x2f67a7.height
  });
  return _0x3ac389;
};
export const renderCommands = ({
  ctx: _0x466403,
  viewport: _0x1f6947,
  canvasEl: _0x5dae38,
  commands = [],
  isDraft = false,
  isEraseScene = false,
  checkerPattern: _0x415ad2,
  defaultTextColor: _0x1f06ed,
  getTextGeometry: _0x3aef80,
  selectedTextCommandIndex = null,
  selectedCommandsRef = null,
  resolveCssVar: _0x4287f8,
  fillRegionCache = null,
  numberLabelBackgroundColor = "",
  freehandStrokeScale = "world",
  getCommandOpacityMultiplier = null,
  textSelectionVariant = "annotate",
  textOutlineColor = "",
  textLayoutVariant = "annotate"
} = {}) => {
  if (!_0x466403 || !_0x5dae38) {
    return;
  }
  const _0x31a05f = getViewportZoom(_0x1f6947);
  const _0x6de3da = getCanvasRenderSize(_0x5dae38);
  commands.forEach((_0x13c527, _0xab6a19) => {
    const _0x58fa5c = typeof getCommandOpacityMultiplier === "function" ? getCommandOpacityMultiplier(_0x13c527, _0xab6a19) : 1;
    if (_0x13c527.type === "brush") {
      _0x466403.save();
      const _0x12b5de = getCommandPoints(_0x13c527, _0x1f6947);
      if (!_0x12b5de.length) {
        _0x466403.restore();
        return;
      }
      const _0x23d09d = getBrushLineWidth(_0x13c527.sizeWorld, getCommandStrokeZoom(_0x13c527, _0x31a05f, freehandStrokeScale), "brush");
      if (isEraseScene) {
        const _0x36ef7e = createEraseCheckerboardPattern(_0x466403, _0x31a05f) || _0x415ad2 || _0x4287f8?.("--white-20") || "transparent";
        drawEraseBrushCommand(_0x466403, {
          type: "brush",
          points: _0x12b5de,
          lineWidth: _0x23d09d,
          checkerPattern: _0x36ef7e,
          checkerZoom: _0x31a05f,
          checkerAlpha: 0.8,
          includeErasePass: false
        });
      } else {
        _0x466403.globalAlpha = getCommandOpacity(_0x13c527, _0x58fa5c);
        applyStrokeDash(_0x466403, _0x13c527.dash, _0x23d09d);
        drawRoundBrushStroke(_0x466403, {
          points: _0x12b5de,
          lineWidth: _0x23d09d,
          strokeStyle: _0x13c527.color,
          fillStyle: _0x13c527.color,
          globalCompositeOperation: "source-over"
        });
      }
      _0x466403.setLineDash([]);
      _0x466403.restore();
      return;
    }
    if (_0x13c527.type === "eraser") {
      _0x466403.save();
      const _0x3855b5 = getCommandPoints(_0x13c527, _0x1f6947);
      if (!_0x3855b5.length) {
        _0x466403.restore();
        return;
      }
      _0x466403.globalAlpha = getCommandOpacity(_0x13c527, _0x58fa5c);
      drawRoundBrushStroke(_0x466403, {
        points: _0x3855b5,
        lineWidth: getEraserClearLineWidth(getBrushLineWidth(_0x13c527.sizeWorld, getCommandStrokeZoom(_0x13c527, _0x31a05f, freehandStrokeScale), "eraser")),
        strokeStyle: "black",
        fillStyle: "black",
        globalCompositeOperation: "destination-out"
      });
      _0x466403.restore();
      return;
    }
    if (_0x13c527.type === "rect") {
      const _0x39e0ad = getScreenX(_0x13c527.x1, _0x1f6947);
      const _0x5adce7 = getScreenY(_0x13c527.y1, _0x1f6947);
      const _0x5396a4 = getScreenX(_0x13c527.x2, _0x1f6947);
      const _0x73eb5d = getScreenY(_0x13c527.y2, _0x1f6947);
      const _0x392a07 = Math.min(_0x39e0ad, _0x5396a4);
      const _0x33888e = Math.min(_0x5adce7, _0x73eb5d);
      const _0x371a5a = Math.abs(_0x5396a4 - _0x39e0ad);
      const _0x468901 = Math.abs(_0x73eb5d - _0x5adce7);
      _0x466403.save();
      rotateCanvasAroundBounds(_0x466403, {
        x: _0x392a07,
        y: _0x33888e,
        width: _0x371a5a,
        height: _0x468901
      }, _0x13c527.rotation);
      _0x466403.globalCompositeOperation = "source-over";
      _0x466403.strokeStyle = _0x13c527.color;
      _0x466403.lineWidth = getBrushLineWidth(_0x13c527.sizeWorld, _0x31a05f, "brush");
      _0x466403.globalAlpha = getCommandOpacity(_0x13c527, _0x58fa5c);
      if (_0x13c527.fill === "solid") {
        _0x466403.save();
        _0x466403.globalAlpha *= 0.14;
        _0x466403.fillStyle = _0x13c527.color;
        _0x466403.fillRect(_0x392a07, _0x33888e, _0x371a5a, _0x468901);
        _0x466403.restore();
      }
      if (isDraft) {
        _0x466403.setLineDash([6, 5]);
      } else {
        applyStrokeDash(_0x466403, _0x13c527.dash, _0x466403.lineWidth);
      }
      _0x466403.strokeRect(_0x392a07, _0x33888e, _0x371a5a, _0x468901);
      _0x466403.restore();
      return;
    }
    if (_0x13c527.type === "shape") {
      drawWhiteboardShapeCommand({
        ctx: _0x466403,
        cmd: _0x13c527,
        viewport: _0x1f6947,
        isDraft: isDraft,
        opacityMultiplier: _0x58fa5c
      });
      return;
    }
    if (_0x13c527.type === "arrow") {
      drawArrowCommand({
        ctx: _0x466403,
        cmd: _0x13c527,
        viewport: _0x1f6947,
        isDraft: isDraft,
        opacityMultiplier: _0x58fa5c
      });
      return;
    }
    if (_0x13c527.type === "text") {
      const _0xd1253c = getScreenX(_0x13c527.x, _0x1f6947);
      const _0x4a6a01 = getScreenY(_0x13c527.y, _0x1f6947);
      const _0x2da164 = Math.max(1, _0x13c527.sizeWorld * _0x31a05f);
      const {
        scaleX: _0x704fb7,
        scaleY: _0x21e0cf
      } = getTextScalePair(_0x13c527);
      const _0xc06d99 = Number(_0x13c527.rotation) || 0;
      _0x466403.save();
      _0x466403.globalCompositeOperation = "source-over";
      _0x466403.globalAlpha = getCommandOpacity(_0x13c527, _0x58fa5c);
      _0x466403.fillStyle = _0x13c527.color || _0x1f06ed;
      const _0x21cc57 = _0x13c527.font === "serif" ? "serif" : _0x13c527.font === "mono" ? "monospace" : "sans-serif";
      _0x466403.font = _0x2da164 + "px " + _0x21cc57;
      _0x466403.textAlign = _0x13c527.textAlign || "left";
      _0x466403.textBaseline = "top";
      const _0x535714 = getTextLayout({
        canvasEl: _0x5dae38,
        cmd: _0x13c527,
        viewport: _0x1f6947,
        layoutVariant: textLayoutVariant,
        context: _0x466403
      });
      const _0x351593 = _0x535714?.lines || [String(_0x13c527.text || "")];
      const _0x48d486 = _0x535714?.lineHeight || _0x2da164 * 1.2;
      const _0x4fe43b = _0x466403.textAlign === "center" ? (_0x535714?.width || 0) / 2 : _0x466403.textAlign === "right" ? _0x535714?.width || 0 : 0;
      _0x466403.translate(_0xd1253c, _0x4a6a01);
      _0x466403.rotate(_0xc06d99);
      _0x466403.scale(_0x704fb7, _0x21e0cf);
      _0x351593.forEach((_0x3b6643, _0x44a557) => {
        const _0x3d4d8d = _0x44a557 * _0x48d486;
        if (textOutlineColor && typeof _0x466403.strokeText === "function") {
          _0x466403.save();
          _0x466403.strokeStyle = textOutlineColor;
          _0x466403.lineWidth = Math.max(1.5, Math.min(3, _0x2da164 * 0.08));
          _0x466403.lineJoin = "round";
          _0x466403.strokeText(_0x3b6643, _0x4fe43b, _0x3d4d8d);
          _0x466403.restore();
        }
        _0x466403.fillText(_0x3b6643, _0x4fe43b, _0x3d4d8d);
      });
      _0x466403.restore();
      if (!isDraft && commands === selectedCommandsRef && selectedTextCommandIndex === _0xab6a19) {
        const _0x4eb797 = _0x3aef80?.(_0x13c527, _0x1f6947);
        if (_0x4eb797) {
          drawTextSelectionControls({
            ctx: _0x466403,
            geom: _0x4eb797,
            resolveCssVar: _0x4287f8,
            variant: textSelectionVariant
          });
        }
      }
      return;
    }
    if (_0x13c527.type === "number-label") {
      drawNumberLabelCommand({
        ctx: _0x466403,
        cmd: {
          ..._0x13c527,
          opacity: getCommandOpacity(_0x13c527, _0x58fa5c)
        },
        viewport: _0x1f6947,
        defaultColor: _0x1f06ed,
        backgroundColor: numberLabelBackgroundColor
      });
      return;
    }
    if (_0x13c527.type === "fill") {
      const _0x29c179 = Math.floor(getScreenX(_0x13c527.x, _0x1f6947));
      const _0x27751e = Math.floor(getScreenY(_0x13c527.y, _0x1f6947));
      const _0x3ba41b = _0x13c527.color || _0x1f06ed;
      const _0x36a151 = Number(_0x1f6947?.x) || 0;
      const _0x37e2ee = Number(_0x1f6947?.y) || 0;
      const _0x53581c = getCachedSealedFillRegion({
        cache: fillRegionCache,
        width: _0x6de3da.width,
        height: _0x6de3da.height,
        zoom: _0x31a05f,
        fillCommand: _0x13c527,
        boundaryCommands: getBoundaryCommands(commands, _0xab6a19),
        seedX: _0x29c179,
        seedY: _0x27751e,
        extraKey: "color:" + _0x3ba41b + ";view:" + _0x36a151 + "," + _0x37e2ee,
        pointToPixel: _0x4d2be6 => worldToScreenPoint(_0x4d2be6, _0x1f6947),
        getStrokeWidth: _0x41745b => getBrushLineWidth(_0x41745b?.sizeWorld, getCommandStrokeZoom(_0x41745b, _0x31a05f, freehandStrokeScale), _0x41745b?.type)
      });
      _0x466403.save();
      paintFilledRegion(_0x466403, _0x53581c, _0x6de3da.width, _0x6de3da.height, {
        fillStyle: _0x3ba41b,
        globalCompositeOperation: "source-over",
        globalAlpha: getCommandOpacity(_0x13c527, _0x58fa5c)
      });
      _0x466403.restore();
    }
  });
};