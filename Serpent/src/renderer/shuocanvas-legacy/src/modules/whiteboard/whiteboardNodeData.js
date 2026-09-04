export const WHITEBOARD_NODE_TYPE = "whiteboard";
export const WHITEBOARD_DATA_VERSION = 2;
export const WHITEBOARD_DEFAULT_SIZE = Object.freeze({
  width: 720,
  height: 480
});
export const WHITEBOARD_DEFAULT_TOOL = "brush";
export const WHITEBOARD_DEFAULT_COLOR = "black";
export const WHITEBOARD_DEFAULT_BRUSH_SIZE_PX = 20;
export const WHITEBOARD_DEFAULT_SHAPE_TYPE = "rectangle";
export const WHITEBOARD_DEFAULT_VIEW = Object.freeze({
  x: 0,
  y: 0,
  zoom: 0.5
});
export const WHITEBOARD_DEFAULT_STYLE = Object.freeze({
  color: WHITEBOARD_DEFAULT_COLOR,
  size: WHITEBOARD_DEFAULT_BRUSH_SIZE_PX,
  opacity: 1,
  fill: "none",
  dash: "solid",
  font: "sans",
  textAlign: "left",
  arrowKind: "straight",
  arrowStart: "none",
  arrowEnd: "arrow"
});
const WHITEBOARD_TOOL_SET = new Set(["select", "hand", "brush", "rect", "arrow", "bucket", "text", "eraser", "number-label", "shape"]);
const WHITEBOARD_SHAPE_TYPE_SET = new Set(["circle", "triangle", "diamond", "hexagon", "pill", "parallelogram", "star", "cloud", "heart", "crossed-box", "checkbox", "arrow-left", "arrow-up", "arrow-down", "arrow-right", "line", "frame"]);
const WHITEBOARD_COLOR_SET = new Set(["black", "gray", "pink", "purple", "blue", "indigo", "cyan", "red", "orange", "yellow", "green", "white"]);
const WHITEBOARD_FILL_SET = new Set(["none", "solid"]);
const WHITEBOARD_DASH_SET = new Set(["solid", "dashed", "dotted"]);
const WHITEBOARD_FONT_SET = new Set(["sans", "serif", "mono"]);
const WHITEBOARD_TEXT_ALIGN_SET = new Set(["left", "center", "right"]);
const WHITEBOARD_ARROW_KIND_SET = new Set(["straight", "arc", "elbow"]);
const WHITEBOARD_ARROWHEAD_SET = new Set(["none", "arrow", "triangle", "square", "circle", "diamond", "inverted", "bar"]);
const WHITEBOARD_COMMAND_LIMIT = 2000;
const WHITEBOARD_POINT_LIMIT = 5000;
const WHITEBOARD_MIN_ZOOM = 0.1;
const WHITEBOARD_MAX_ZOOM = 8;
const finiteNumberOr = (_0x1b0f99, _0x3bd761 = 0) => {
  const _0x167bd8 = Number(_0x1b0f99);
  if (Number.isFinite(_0x167bd8)) {
    return _0x167bd8;
  } else {
    return _0x3bd761;
  }
};
const normalizeColorName = (_0x2fad46, _0x59a35f = WHITEBOARD_DEFAULT_COLOR) => {
  const _0x436cf9 = String(_0x2fad46 || "").trim();
  if (WHITEBOARD_COLOR_SET.has(_0x436cf9)) {
    return _0x436cf9;
  } else {
    return _0x59a35f;
  }
};
const normalizeTool = (_0x354021, _0x29a41c = WHITEBOARD_DEFAULT_TOOL) => {
  const _0x3422bd = String(_0x354021 || "").trim();
  if (WHITEBOARD_TOOL_SET.has(_0x3422bd)) {
    return _0x3422bd;
  } else {
    return _0x29a41c;
  }
};
const normalizeShapeType = (_0x284474, _0x1cabe1 = WHITEBOARD_DEFAULT_SHAPE_TYPE) => {
  const _0x1ae727 = String(_0x284474 || "").trim();
  if (WHITEBOARD_SHAPE_TYPE_SET.has(_0x1ae727)) {
    return _0x1ae727;
  } else {
    return _0x1cabe1;
  }
};
const normalizeBrushSize = (_0x2aa115, _0x158423 = WHITEBOARD_DEFAULT_BRUSH_SIZE_PX) => {
  const _0x2e4347 = finiteNumberOr(_0x2aa115, _0x158423);
  return Math.max(1, Math.min(120, _0x2e4347));
};
const normalizeOpacity = (_0x41cb9e, _0x39b905 = WHITEBOARD_DEFAULT_STYLE.opacity) => {
  const _0x1bdcbc = finiteNumberOr(_0x41cb9e, _0x39b905);
  return Math.max(0.1, Math.min(1, _0x1bdcbc));
};
const normalizeEnum = (_0x3a2a21, _0x247dd0, _0x4852c8) => {
  const _0x1bcaa7 = String(_0x3a2a21 || "").trim();
  if (_0x247dd0.has(_0x1bcaa7)) {
    return _0x1bcaa7;
  } else {
    return _0x4852c8;
  }
};
const normalizeView = _0x275d5c => {
  const _0x292c1e = _0x275d5c && typeof _0x275d5c === "object" ? _0x275d5c : {};
  const _0x392961 = finiteNumberOr(_0x292c1e.zoom, WHITEBOARD_DEFAULT_VIEW.zoom);
  return {
    x: finiteNumberOr(_0x292c1e.x, WHITEBOARD_DEFAULT_VIEW.x),
    y: finiteNumberOr(_0x292c1e.y, WHITEBOARD_DEFAULT_VIEW.y),
    zoom: Math.max(WHITEBOARD_MIN_ZOOM, Math.min(WHITEBOARD_MAX_ZOOM, _0x392961))
  };
};
const normalizeStyle = (_0x225ce4 = {}, _0x2fcf11 = {}) => {
  const _0x5768cd = _0x225ce4 && typeof _0x225ce4 === "object" ? _0x225ce4 : {};
  return {
    color: normalizeColorName(_0x5768cd.color, normalizeColorName(_0x2fcf11.color)),
    size: normalizeBrushSize(_0x5768cd.size ?? _0x2fcf11.brushSizePx),
    opacity: normalizeOpacity(_0x5768cd.opacity),
    fill: normalizeEnum(_0x5768cd.fill, WHITEBOARD_FILL_SET, WHITEBOARD_DEFAULT_STYLE.fill),
    dash: normalizeEnum(_0x5768cd.dash, WHITEBOARD_DASH_SET, WHITEBOARD_DEFAULT_STYLE.dash),
    font: normalizeEnum(_0x5768cd.font, WHITEBOARD_FONT_SET, WHITEBOARD_DEFAULT_STYLE.font),
    textAlign: normalizeEnum(_0x5768cd.textAlign, WHITEBOARD_TEXT_ALIGN_SET, WHITEBOARD_DEFAULT_STYLE.textAlign),
    arrowKind: normalizeEnum(_0x5768cd.arrowKind, WHITEBOARD_ARROW_KIND_SET, WHITEBOARD_DEFAULT_STYLE.arrowKind),
    arrowStart: normalizeEnum(_0x5768cd.arrowStart, WHITEBOARD_ARROWHEAD_SET, WHITEBOARD_DEFAULT_STYLE.arrowStart),
    arrowEnd: normalizeEnum(_0x5768cd.arrowEnd, WHITEBOARD_ARROWHEAD_SET, WHITEBOARD_DEFAULT_STYLE.arrowEnd)
  };
};
const applyCommandStyle = (_0x5e9d29, _0x1adbd4 = {}) => {
  const _0x39a5c3 = {
    ..._0x5e9d29
  };
  const _0xf513eb = normalizeColorName(_0x1adbd4.colorName, "");
  if (_0xf513eb) {
    _0x39a5c3.colorName = _0xf513eb;
  }
  if ("opacity" in _0x1adbd4) {
    _0x39a5c3.opacity = normalizeOpacity(_0x1adbd4.opacity);
  }
  if ("dash" in _0x1adbd4) {
    _0x39a5c3.dash = normalizeEnum(_0x1adbd4.dash, WHITEBOARD_DASH_SET, WHITEBOARD_DEFAULT_STYLE.dash);
  }
  if ("fill" in _0x1adbd4) {
    _0x39a5c3.fill = normalizeEnum(_0x1adbd4.fill, WHITEBOARD_FILL_SET, WHITEBOARD_DEFAULT_STYLE.fill);
  }
  if ("font" in _0x1adbd4) {
    _0x39a5c3.font = normalizeEnum(_0x1adbd4.font, WHITEBOARD_FONT_SET, WHITEBOARD_DEFAULT_STYLE.font);
  }
  if ("textAlign" in _0x1adbd4) {
    _0x39a5c3.textAlign = normalizeEnum(_0x1adbd4.textAlign, WHITEBOARD_TEXT_ALIGN_SET, WHITEBOARD_DEFAULT_STYLE.textAlign);
  }
  if ("arrowStart" in _0x1adbd4) {
    _0x39a5c3.arrowStart = normalizeEnum(_0x1adbd4.arrowStart, WHITEBOARD_ARROWHEAD_SET, WHITEBOARD_DEFAULT_STYLE.arrowStart);
  }
  if ("arrowKind" in _0x1adbd4) {
    _0x39a5c3.arrowKind = normalizeEnum(_0x1adbd4.arrowKind, WHITEBOARD_ARROW_KIND_SET, WHITEBOARD_DEFAULT_STYLE.arrowKind);
  }
  if ("arrowEnd" in _0x1adbd4) {
    _0x39a5c3.arrowEnd = normalizeEnum(_0x1adbd4.arrowEnd, WHITEBOARD_ARROWHEAD_SET, WHITEBOARD_DEFAULT_STYLE.arrowEnd);
  }
  return _0x39a5c3;
};
const normalizePointList = _0x11a120 => (Array.isArray(_0x11a120) ? _0x11a120 : []).slice(0, WHITEBOARD_POINT_LIMIT).map(_0x1a86d8 => {
  const _0x5593e6 = Number(_0x1a86d8?.x);
  const _0xb0746f = Number(_0x1a86d8?.y);
  if (!Number.isFinite(_0x5593e6) || !Number.isFinite(_0xb0746f)) {
    return null;
  }
  return {
    x: _0x5593e6,
    y: _0xb0746f
  };
}).filter(Boolean);
export function normalizeWhiteboardCommand(_0x32eef1) {
  if (!_0x32eef1 || typeof _0x32eef1 !== "object") {
    return null;
  }
  const _0x5d8d9f = String(_0x32eef1.type || "").trim();
  if (_0x5d8d9f === "brush") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      color: String(_0x32eef1.color || ""),
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 1)),
      points: normalizePointList(_0x32eef1.points)
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "eraser") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 1)),
      points: normalizePointList(_0x32eef1.points)
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "rect") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      color: String(_0x32eef1.color || ""),
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 1)),
      x1: finiteNumberOr(_0x32eef1.x1),
      y1: finiteNumberOr(_0x32eef1.y1),
      x2: finiteNumberOr(_0x32eef1.x2),
      y2: finiteNumberOr(_0x32eef1.y2),
      rotation: finiteNumberOr(_0x32eef1.rotation)
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "arrow") {
    const _0x2329ed = finiteNumberOr(_0x32eef1.bend);
    return applyCommandStyle({
      type: _0x5d8d9f,
      color: String(_0x32eef1.color || ""),
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 1)),
      x1: finiteNumberOr(_0x32eef1.x1),
      y1: finiteNumberOr(_0x32eef1.y1),
      x2: finiteNumberOr(_0x32eef1.x2),
      y2: finiteNumberOr(_0x32eef1.y2),
      bend: _0x2329ed,
      elbowOffset: finiteNumberOr(_0x32eef1.elbowOffset),
      arrowKind: normalizeEnum(_0x32eef1.arrowKind, WHITEBOARD_ARROW_KIND_SET, Math.abs(_0x2329ed) > 0 ? "arc" : WHITEBOARD_DEFAULT_STYLE.arrowKind),
      arrowEnd: _0x32eef1.arrowEnd ?? WHITEBOARD_DEFAULT_STYLE.arrowEnd
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "shape") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      shapeType: normalizeShapeType(_0x32eef1.shapeType),
      color: String(_0x32eef1.color || ""),
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 1)),
      x1: finiteNumberOr(_0x32eef1.x1),
      y1: finiteNumberOr(_0x32eef1.y1),
      x2: finiteNumberOr(_0x32eef1.x2),
      y2: finiteNumberOr(_0x32eef1.y2),
      rotation: finiteNumberOr(_0x32eef1.rotation)
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "fill") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      color: String(_0x32eef1.color || ""),
      x: finiteNumberOr(_0x32eef1.x),
      y: finiteNumberOr(_0x32eef1.y)
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "text") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      text: String(_0x32eef1.text || "").slice(0, 200),
      color: String(_0x32eef1.color || ""),
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 16)),
      x: finiteNumberOr(_0x32eef1.x),
      y: finiteNumberOr(_0x32eef1.y),
      scale: finiteNumberOr(_0x32eef1.scale, 1),
      scaleX: finiteNumberOr(_0x32eef1.scaleX, 1),
      scaleY: finiteNumberOr(_0x32eef1.scaleY, 1),
      rotation: finiteNumberOr(_0x32eef1.rotation)
    }, _0x32eef1);
  }
  if (_0x5d8d9f === "number-label") {
    return applyCommandStyle({
      type: _0x5d8d9f,
      number: Math.max(1, Math.floor(finiteNumberOr(_0x32eef1.number, 1))),
      color: String(_0x32eef1.color || ""),
      sizeWorld: Math.max(1, finiteNumberOr(_0x32eef1.sizeWorld, 18)),
      x: finiteNumberOr(_0x32eef1.x),
      y: finiteNumberOr(_0x32eef1.y)
    }, _0x32eef1);
  }
  return null;
}
export function normalizeWhiteboardCommands(_0x32cd0f) {
  return (Array.isArray(_0x32cd0f) ? _0x32cd0f : []).slice(0, WHITEBOARD_COMMAND_LIMIT).map(normalizeWhiteboardCommand).filter(Boolean);
}
export function createDefaultWhiteboardState(_0x20b8b4 = {}) {
  const _0x334601 = normalizeStyle(_0x20b8b4.style, _0x20b8b4);
  return {
    version: WHITEBOARD_DATA_VERSION,
    commands: normalizeWhiteboardCommands(_0x20b8b4.commands),
    tool: normalizeTool(_0x20b8b4.tool),
    shapeType: normalizeShapeType(_0x20b8b4.shapeType),
    view: normalizeView(_0x20b8b4.view),
    style: _0x334601,
    color: _0x334601.color,
    brushSizePx: _0x334601.size,
    updatedAt: Number.isFinite(Number(_0x20b8b4.updatedAt)) ? Number(_0x20b8b4.updatedAt) : 0
  };
}
export function normalizeWhiteboardState(_0x3713bb) {
  if (!_0x3713bb || typeof _0x3713bb !== "object") {
    return createDefaultWhiteboardState();
  }
  return createDefaultWhiteboardState(_0x3713bb);
}
export function getRelevantWhiteboardStyleControls(_0x40ccd0, _0x5cb474 = null) {
  const _0x3518bd = normalizeTool(_0x40ccd0, "select");
  if (_0x3518bd === "hand") {
    return [];
  }
  const _0x4aae0b = _0x5cb474?.type || _0x3518bd;
  if (_0x4aae0b === "eraser") {
    return ["size"];
  }
  if (_0x4aae0b === "brush") {
    return ["color", "size", "opacity"];
  }
  if (_0x4aae0b === "arrow") {
    return ["color", "size", "opacity", "dash", "arrow-kind", "arrowheads"];
  }
  if (_0x4aae0b === "rect" || _0x4aae0b === "shape") {
    return ["color", "fill", "size", "opacity", "dash"];
  }
  if (_0x4aae0b === "text") {
    return ["color", "size", "opacity", "font"];
  }
  if (_0x4aae0b === "number-label") {
    return ["color", "size", "opacity"];
  }
  if (_0x4aae0b === "select") {
    return [];
  }
  return [];
}
export function createWhiteboardNodeData({
  id: _0x894d6f,
  x = 0,
  y = 0,
  width = WHITEBOARD_DEFAULT_SIZE.width,
  height = WHITEBOARD_DEFAULT_SIZE.height,
  name = "白板",
  whiteboard = null
} = {}) {
  return {
    id: _0x894d6f,
    type: WHITEBOARD_NODE_TYPE,
    x: x,
    y: y,
    width: width,
    height: height,
    name: name,
    whiteboard: normalizeWhiteboardState(whiteboard)
  };
}