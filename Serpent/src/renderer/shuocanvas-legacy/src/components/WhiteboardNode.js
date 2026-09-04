import a609_0x3d8181 from "../core/stores/appStore.js";
import { commit } from "../modules/history.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { addEdgeWithPolicies } from "../modules/interaction/EdgeController.js";
import { processFile } from "../services/fileService.js";
import { getThumbnail } from "../services/thumbnailCacheService.js";
import { getImage } from "../modules/storage.js";
import { applyI18n, t } from "../i18n/index.js";
import { createSafeSvg } from "../utils/dom.js";
import { createRotateCursor } from "../modules/cursorUtils.js";
import { renderCommands } from "../modules/imageAnnotate/rendering.js";
import { createEraseCheckerboardPattern } from "../modules/eraseBrushRenderer.js";
import { buildCopiedTextCommand, clampTextScale, createTextTransformState, findTextHit, getTextAnchorForCenter, getTextGeometry, getTextLayout, getTextScalePair, resolveAxisTextScale, toTextLocalTransformSpace } from "../modules/imageAnnotate/textControls.js";
import { getNextNumberLabelValue } from "../modules/imageAnnotate/numberLabels.js";
import { getArrowBendFromPoint, getArrowElbowOffsetFromPoint, getArrowGeometry, getDistanceToArrowPath } from "../modules/imageAnnotate/arrowGeometry.js";
import { doesSegmentHitBounds, doesSegmentHitCircle, doesSegmentHitPolygon, doesSegmentHitPolyline, snapWhiteboardPointToAngle } from "../modules/whiteboard/whiteboardInteractionGeometry.js";
import { applyWhiteboardLayerTransform, createWhiteboardLayerTransformSession, getWhiteboardLayerGeometry, getWhiteboardLayerTransformHandleAtPoint, isWhiteboardLayerTransformable } from "../modules/whiteboard/whiteboardLayerTransform.js";
import { drawWhiteboardBackgroundImage, getWhiteboardBackgroundInputSignature, getWhiteboardSizeForBackground, resolveWhiteboardBackgroundInput } from "../modules/whiteboard/whiteboardBackgroundInput.js";
import { createFastWhiteboardBackgroundPreview, createWhiteboardBackgroundPreviewFromDecodedImage } from "../modules/whiteboard/whiteboardBackgroundPreview.js";
import { clampImageBrushSize, drawRoundBrushStroke, getBrushLineWidth, getEraserClearLineWidth, syncCircularBrushCursor } from "../modules/imageEditorBrushStyle.js";
import { getRelevantWhiteboardStyleControls, normalizeWhiteboardCommands, normalizeWhiteboardState, WHITEBOARD_DATA_VERSION, WHITEBOARD_DEFAULT_BRUSH_SIZE_PX, WHITEBOARD_DEFAULT_COLOR, WHITEBOARD_DEFAULT_SIZE, WHITEBOARD_DEFAULT_SHAPE_TYPE, WHITEBOARD_DEFAULT_STYLE, WHITEBOARD_DEFAULT_TOOL, WHITEBOARD_DEFAULT_VIEW } from "../modules/whiteboard/whiteboardNodeData.js";
const WHITEBOARD_MIN_WIDTH = 360;
const WHITEBOARD_MIN_HEIGHT = 260;
const WHITEBOARD_SAVE_DEBOUNCE_MS = 500;
const WHITEBOARD_TEXT_LIMIT = 200;
const WHITEBOARD_MIN_ZOOM = 0.1;
const WHITEBOARD_MAX_ZOOM = 8;
const WHITEBOARD_ZOOM_WHEEL_SPEED = 0.0015;
const WHITEBOARD_ARROW_HANDLE_SCREEN_RADIUS = 10;
const WHITEBOARD_LAYER_ERASE_PREVIEW_OPACITY = 0.24;
const WHITEBOARD_LAYER_ERASER_TRAIL_POINT_LIMIT = 160;
const WHITEBOARD_LAYER_ERASER_TRAIL_MAX_SCREEN_LENGTH = 140;
const WHITEBOARD_ROTATE_CURSOR = createRotateCursor();
const WHITEBOARD_ALLOWED_TOOLS = Object.freeze(["select", "hand", "brush", "eraser", "arrow", "text", "rect", "bucket", "number-label", "shape"]);
const WHITEBOARD_PRIMARY_TOOLS = Object.freeze(["select", "hand", "brush", "eraser", "arrow", "text", "bucket"]);
const WHITEBOARD_TOOL_ICONS = Object.freeze({
  select: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M5 3l11 9-5 1.5L8.5 20 5 3Z\"/></svg>",
  hand: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M8 11V6.5a1.5 1.5 0 0 1 3 0V11\"/><path d=\"M11 10V5.5a1.5 1.5 0 0 1 3 0V11\"/><path d=\"M14 10V7a1.5 1.5 0 0 1 3 0v5\"/><path d=\"M17 12v-1.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1.5a6 6 0 0 1-4.2-1.7L4 16a1.7 1.7 0 0 1 2.4-2.4L8 15\"/></svg>",
  brush: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\"/></svg>",
  eraser: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M20 20H7l-5-5a2 2 0 0 1 0-2.83l9.17-9.17a2 2 0 0 1 2.83 0L22 10a2 2 0 0 1 0 2.83L14.83 20\"/></svg>",
  arrow: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M5 19 19 5\"/><path d=\"M9 5h10v10\"/></svg>",
  text: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M4 6h16\"/><path d=\"M12 6v12\"/><path d=\"M8 18h8\"/></svg>",
  rect: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><rect x=\"5\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"/></svg>",
  bucket: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M19 11l-8-8-8.5 8.5a2.12 2.12 0 0 0 0 3l4 4a2.12 2.12 0 0 0 3 0L19 11z\"/><path d=\"M12 18l-2 2\"/><path d=\"M20 20l-2-2\"/></svg>",
  "number-label": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M11 9l2-1v8\"/><path d=\"M10 16h5\"/></svg>",
  more: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"4\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\"/><circle cx=\"17\" cy=\"7\" r=\"3\"/><path d=\"m7 14-3 6h6Z\"/><path d=\"m17 13 4 4-4 4-4-4Z\"/></svg>",
  undo: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M9 14l-4-4 4-4\"/><path d=\"M5 10h9a6 6 0 1 1 0 12h-3\"/></svg>",
  redo: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M15 14l4-4-4-4\"/><path d=\"M19 10H10a6 6 0 1 0 0 12h3\"/></svg>",
  clear: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M3 6h18\"/><path d=\"M8 6V4h8v2\"/><path d=\"M6 6l1 16h10l1-16\"/></svg>",
  compose: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.1\"><path d=\"M12 5v14\"/><path d=\"M5 12h14\"/></svg>",
  upload: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\"><path d=\"M12 16V4\"/><path d=\"m7 9 5-5 5 5\"/><path d=\"M5 14v5h14v-5\"/></svg>"
});
const WHITEBOARD_TOOL_LABELS = Object.freeze({
  select: "选择",
  hand: "移动",
  brush: "画笔",
  eraser: "橡皮",
  arrow: "箭头",
  text: "文字",
  rect: "矩形",
  bucket: "填充",
  "number-label": "编号",
  shape: "图形"
});
const WHITEBOARD_TOOL_SHORTCUTS = Object.freeze({
  select: "V",
  hand: "空格",
  brush: "B",
  eraser: "E / Ctrl",
  arrow: "A",
  text: "T"
});
const WHITEBOARD_SHAPE_OPTIONS = Object.freeze([{
  key: "rectangle",
  tool: "rect",
  label: "矩形",
  icon: WHITEBOARD_TOOL_ICONS.rect
}, {
  key: "circle",
  tool: "shape",
  label: "圆形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"12\" r=\"8\"/></svg>"
}, {
  key: "triangle",
  tool: "shape",
  label: "三角形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m12 4 8 16H4Z\"/></svg>"
}, {
  key: "diamond",
  tool: "shape",
  label: "菱形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m12 3 9 9-9 9-9-9Z\"/></svg>"
}, {
  key: "hexagon",
  tool: "shape",
  label: "六边形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m7 4 10 0 5 8-5 8H7l-5-8Z\"/></svg>"
}, {
  key: "pill",
  tool: "shape",
  label: "胶囊",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"7\" y=\"3\" width=\"10\" height=\"18\" rx=\"5\"/></svg>"
}, {
  key: "parallelogram",
  tool: "shape",
  label: "平行四边形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M7 4h13l-3 16H4Z\"/></svg>"
}, {
  key: "star",
  tool: "shape",
  label: "星形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.4l6.2-.9Z\"/></svg>"
}, {
  key: "cloud",
  tool: "shape",
  label: "云朵",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M6 19h12a4 4 0 0 0 .4-8A6.2 6.2 0 0 0 6.6 9.5 4.8 4.8 0 0 0 6 19Z\"/></svg>"
}, {
  key: "heart",
  tool: "shape",
  label: "心形",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z\"/></svg>"
}, {
  key: "crossed-box",
  tool: "shape",
  label: "交叉框",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\"/><path d=\"m4 4 16 16M20 4 4 20\"/></svg>"
}, {
  key: "checkbox",
  tool: "shape",
  label: "复选框",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"1\"/><path d=\"m8 12 3 3 6-7\"/></svg>"
}, {
  key: "arrow-left",
  tool: "shape",
  label: "左箭头",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m10 4-8 8 8 8v-5h12V9H10Z\"/></svg>"
}, {
  key: "arrow-up",
  tool: "shape",
  label: "上箭头",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m4 10 8-8 8 8h-5v12H9V10Z\"/></svg>"
}, {
  key: "arrow-down",
  tool: "shape",
  label: "下箭头",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m4 14 8 8 8-8h-5V2H9v12Z\"/></svg>"
}, {
  key: "arrow-right",
  tool: "shape",
  label: "右箭头",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m14 4 8 8-8 8v-5H2V9h12Z\"/></svg>"
}, {
  key: "line",
  tool: "shape",
  label: "直线",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 20 20 4\"/></svg>"
}, {
  key: "brush",
  tool: "brush",
  label: "画笔",
  icon: WHITEBOARD_TOOL_ICONS.brush
}, {
  key: "highlighter",
  tool: "brush",
  label: "荧光笔",
  style: {
    opacity: 0.35,
    size: 72
  },
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"m15 3 6 6L9 21H3v-6Z\"/><path d=\"m12 6 6 6M2 22h10\"/></svg>"
}, {
  key: "frame",
  tool: "shape",
  label: "取景框",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M9 3H3v6M15 3h6v6M21 15v6h-6M9 21H3v-6\"/></svg>"
}, {
  key: "number-label",
  tool: "number-label",
  label: "编号",
  icon: WHITEBOARD_TOOL_ICONS["number-label"]
}]);
const WHITEBOARD_SIZE_PRESETS = Object.freeze([{
  key: "S",
  value: 12,
  tooltipKey: "whiteboardNode.style.sizes.small"
}, {
  key: "M",
  value: 40,
  tooltipKey: "whiteboardNode.style.sizes.medium"
}, {
  key: "L",
  value: 72,
  tooltipKey: "whiteboardNode.style.sizes.large"
}, {
  key: "XL",
  value: 108,
  tooltipKey: "whiteboardNode.style.sizes.extraLarge"
}]);
const WHITEBOARD_OPACITY_PRESETS = Object.freeze([{
  key: "25",
  value: 0.25
}, {
  key: "50",
  value: 0.5
}, {
  key: "75",
  value: 0.75
}, {
  key: "100",
  value: 1
}]);
const WHITEBOARD_FILL_OPTIONS = Object.freeze([{
  key: "none",
  label: "○",
  tooltipKey: "whiteboardNode.style.fill.none"
}, {
  key: "solid",
  label: "●",
  tooltipKey: "whiteboardNode.style.fill.solid"
}]);
const WHITEBOARD_DASH_OPTIONS = Object.freeze([{
  key: "solid",
  label: "━",
  tooltipKey: "whiteboardNode.style.dash.solid"
}, {
  key: "dashed",
  label: "┅",
  tooltipKey: "whiteboardNode.style.dash.dashed"
}, {
  key: "dotted",
  label: "⋯",
  tooltipKey: "whiteboardNode.style.dash.dotted"
}]);
const WHITEBOARD_FONT_OPTIONS = Object.freeze([{
  key: "sans",
  labelKey: "whiteboardNode.style.font.sans"
}, {
  key: "serif",
  labelKey: "whiteboardNode.style.font.serif"
}, {
  key: "mono",
  labelKey: "whiteboardNode.style.font.mono"
}]);
const WHITEBOARD_ARROW_KIND_OPTIONS = Object.freeze([{
  value: "straight",
  tooltipKey: "whiteboardNode.style.arrowKind.straight",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 12h16\"/></svg>"
}, {
  value: "arc",
  tooltipKey: "whiteboardNode.style.arrowKind.arc",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 17c4-10 12-10 16 0\"/></svg>"
}, {
  value: "elbow",
  tooltipKey: "whiteboardNode.style.arrowKind.elbow",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 6h7v12h9\"/></svg>"
}]);
const WHITEBOARD_ARROWHEAD_OPTIONS = Object.freeze([{
  value: "none",
  tooltipKey: "whiteboardNode.style.arrowhead.none",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 12h16\"/></svg>"
}, {
  value: "arrow",
  tooltipKey: "whiteboardNode.style.arrowhead.arrow",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 12h16M12 5l8 7-8 7\"/></svg>"
}, {
  value: "triangle",
  tooltipKey: "whiteboardNode.style.arrowhead.triangle",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M3 12h7M20 12 10 5v14Z\"/></svg>"
}, {
  value: "square",
  tooltipKey: "whiteboardNode.style.arrowhead.square",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M3 12h7\"/><rect x=\"10\" y=\"5\" width=\"10\" height=\"14\" rx=\"1\"/></svg>"
}, {
  value: "circle",
  tooltipKey: "whiteboardNode.style.arrowhead.circle",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M10 12h11\"/><circle cx=\"7\" cy=\"12\" r=\"5\"/></svg>"
}, {
  value: "diamond",
  tooltipKey: "whiteboardNode.style.arrowhead.diamond",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M12 12h9M7 5l7 7-7 7-7-7Z\"/></svg>"
}, {
  value: "inverted",
  tooltipKey: "whiteboardNode.style.arrowhead.inverted",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M13 12h8M3 5l10 7-10 7Z\"/></svg>"
}, {
  value: "bar",
  tooltipKey: "whiteboardNode.style.arrowhead.bar",
  icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M5 12h15M5 5v14\"/></svg>"
}]);
const COLOR_VAR_MAP = {
  black: "--black",
  gray: "--text-muted",
  pink: "--group-pink",
  red: "--annotate-red",
  orange: "--annotate-orange",
  yellow: "--annotate-yellow",
  green: "--annotate-green",
  cyan: "--cyan",
  blue: "--annotate-blue",
  indigo: "--indigo",
  purple: "--annotate-purple",
  white: "--canvas-white"
};
const isTypingField = _0x593d4f => {
  const _0x8a9486 = _0x593d4f?.tagName?.toLowerCase?.() || "";
  return _0x8a9486 === "input" || _0x8a9486 === "textarea" || _0x593d4f?.isContentEditable === true;
};
const getCssVar = _0x4224c1 => getComputedStyle(document.documentElement).getPropertyValue(_0x4224c1).trim();
const getColorCss = _0x2fefa8 => {
  const _0x397a43 = COLOR_VAR_MAP[_0x2fefa8];
  if (_0x397a43) {
    return "var(" + _0x397a43 + ")";
  } else {
    return _0x2fefa8;
  }
};
const getColorCanvas = _0x1274bc => {
  const _0x14b656 = COLOR_VAR_MAP[_0x1274bc];
  if (!_0x14b656) {
    return _0x1274bc;
  }
  return getCssVar(_0x14b656) || _0x1274bc;
};
const clampWhiteboardZoom = _0x461e33 => {
  const _0x5010dd = Number(_0x461e33);
  if (!Number.isFinite(_0x5010dd) || _0x5010dd <= 0) {
    return WHITEBOARD_DEFAULT_VIEW.zoom;
  }
  return Math.max(WHITEBOARD_MIN_ZOOM, Math.min(WHITEBOARD_MAX_ZOOM, _0x5010dd));
};
const cloneWhiteboardView = (_0x584d80 = WHITEBOARD_DEFAULT_VIEW) => ({
  x: Number.isFinite(Number(_0x584d80.x)) ? Number(_0x584d80.x) : WHITEBOARD_DEFAULT_VIEW.x,
  y: Number.isFinite(Number(_0x584d80.y)) ? Number(_0x584d80.y) : WHITEBOARD_DEFAULT_VIEW.y,
  zoom: clampWhiteboardZoom(_0x584d80.zoom)
});
const clampOpacity = _0x1b7f83 => {
  const _0x67cc19 = Number(_0x1b7f83);
  if (!Number.isFinite(_0x67cc19)) {
    return WHITEBOARD_DEFAULT_STYLE.opacity;
  }
  return Math.max(0.1, Math.min(1, _0x67cc19));
};
const normalizeStyleValue = (_0x4b88d7, _0x18f219) => {
  if (_0x4b88d7 === "size") {
    return clampImageBrushSize(_0x18f219);
  }
  if (_0x4b88d7 === "opacity") {
    return clampOpacity(_0x18f219);
  }
  if (_0x4b88d7 === "fill") {
    if (_0x18f219 === "solid") {
      return "solid";
    } else {
      return "none";
    }
  }
  if (_0x4b88d7 === "dash") {
    if (_0x18f219 === "dashed" || _0x18f219 === "dotted") {
      return _0x18f219;
    } else {
      return "solid";
    }
  }
  if (_0x4b88d7 === "font") {
    if (_0x18f219 === "serif" || _0x18f219 === "mono") {
      return _0x18f219;
    } else {
      return "sans";
    }
  }
  if (_0x4b88d7 === "arrowKind") {
    if (_0x18f219 === "arc" || _0x18f219 === "elbow") {
      return _0x18f219;
    } else {
      return "straight";
    }
  }
  if (_0x4b88d7 === "arrowStart" || _0x4b88d7 === "arrowEnd") {
    if (["arrow", "triangle", "square", "circle", "diamond", "inverted", "bar"].includes(_0x18f219)) {
      return _0x18f219;
    } else {
      return "none";
    }
  }
  if (_0x4b88d7 === "color") {
    if (COLOR_VAR_MAP[_0x18f219]) {
      return _0x18f219;
    } else {
      return WHITEBOARD_DEFAULT_COLOR;
    }
  }
  return _0x18f219;
};
const cloneWhiteboardStyle = (_0x2fd393 = WHITEBOARD_DEFAULT_STYLE) => ({
  ...WHITEBOARD_DEFAULT_STYLE,
  ..._0x2fd393,
  color: normalizeStyleValue("color", _0x2fd393.color),
  size: normalizeStyleValue("size", _0x2fd393.size),
  opacity: normalizeStyleValue("opacity", _0x2fd393.opacity),
  fill: normalizeStyleValue("fill", _0x2fd393.fill),
  dash: normalizeStyleValue("dash", _0x2fd393.dash),
  font: normalizeStyleValue("font", _0x2fd393.font),
  arrowKind: normalizeStyleValue("arrowKind", _0x2fd393.arrowKind),
  arrowStart: normalizeStyleValue("arrowStart", _0x2fd393.arrowStart),
  arrowEnd: normalizeStyleValue("arrowEnd", _0x2fd393.arrowEnd)
});
const getFiniteNumber = (_0xff8121, _0x4c6488 = 0) => {
  const _0x57d166 = Number(_0xff8121);
  if (Number.isFinite(_0x57d166)) {
    return _0x57d166;
  } else {
    return _0x4c6488;
  }
};
const hasFiniteClientPoint = _0xb52494 => Number.isFinite(Number(_0xb52494?.clientX)) && Number.isFinite(Number(_0xb52494?.clientY));
const getPointerEventSamples = _0x73ea59 => {
  let _0x7c63db = [];
  if (typeof _0x73ea59?.getCoalescedEvents === "function") {
    try {
      _0x7c63db = Array.from(_0x73ea59.getCoalescedEvents() || []);
    } catch {
      _0x7c63db = [];
    }
  }
  const _0x13763a = _0x7c63db.filter(hasFiniteClientPoint);
  if (hasFiniteClientPoint(_0x73ea59)) {
    const _0x414c99 = _0x13763a[_0x13763a.length - 1];
    if (!_0x414c99 || Number(_0x414c99.clientX) !== Number(_0x73ea59.clientX) || Number(_0x414c99.clientY) !== Number(_0x73ea59.clientY)) {
      _0x13763a.push(_0x73ea59);
    }
  }
  if (_0x13763a.length > 0) {
    return _0x13763a;
  } else {
    return [_0x73ea59];
  }
};
const requestWhiteboardFrame = _0x20746d => {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(_0x20746d);
  }
  return setTimeout(_0x20746d, 0);
};
const cancelWhiteboardFrame = _0x22a43d => {
  if (!_0x22a43d) {
    return;
  }
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(_0x22a43d);
    return;
  }
  clearTimeout(_0x22a43d);
};
const getScreenPointFromWorld = (_0x2da48e, _0x5a5c36) => {
  const _0x1bc3b9 = cloneWhiteboardView(_0x5a5c36);
  return {
    x: (getFiniteNumber(_0x2da48e?.x) - _0x1bc3b9.x) * _0x1bc3b9.zoom,
    y: (getFiniteNumber(_0x2da48e?.y) - _0x1bc3b9.y) * _0x1bc3b9.zoom
  };
};
const getWorldPointFromScreen = (_0x5afb40, _0x382711) => {
  const _0x2734d9 = cloneWhiteboardView(_0x382711);
  return {
    x: _0x2734d9.x + getFiniteNumber(_0x5afb40?.x) / _0x2734d9.zoom,
    y: _0x2734d9.y + getFiniteNumber(_0x5afb40?.y) / _0x2734d9.zoom
  };
};
const createPointerState = () => ({
  down: false,
  pointerId: null,
  mode: null,
  previousTool: null,
  temporaryTool: null,
  textTransform: null,
  arrowTransform: null,
  layerTransform: null,
  panStart: null,
  panView: null,
  eraseLast: null,
  eraseIndices: null,
  eraseTrail: null
});
const resolveModifierTemporaryTool = _0x1fa3b0 => {
  if (_0x1fa3b0?.control) {
    return "eraser";
  }
  if (_0x1fa3b0?.space) {
    return "hand";
  }
  return null;
};
const syncModifierTemporaryTool = _0x50380c => {
  const _0xcf7467 = resolveModifierTemporaryTool(_0x50380c?._modifierState);
  if (_0x50380c._temporaryTool === _0xcf7467) {
    return _0xcf7467;
  }
  _0x50380c._temporaryTool = _0xcf7467;
  _0x50380c._syncToolbarState?.();
  _0x50380c._syncCursor?.(_0xcf7467 || undefined);
  return _0xcf7467;
};
const cloneCommands = _0x3ef2f3 => normalizeWhiteboardCommands(_0x3ef2f3).map(_0x26c25f => ({
  ..._0x26c25f,
  points: Array.isArray(_0x26c25f.points) ? _0x26c25f.points.map(_0x3d4838 => ({
    ..._0x3d4838
  })) : _0x26c25f.points
}));
const getWhiteboardSignature = _0x36ac25 => JSON.stringify({
  commands: cloneCommands(_0x36ac25?.commands),
  tool: _0x36ac25?.tool || WHITEBOARD_DEFAULT_TOOL,
  shapeType: _0x36ac25?.shapeType || WHITEBOARD_DEFAULT_SHAPE_TYPE,
  view: cloneWhiteboardView(_0x36ac25?.view),
  style: cloneWhiteboardStyle(_0x36ac25?.style || {
    color: _0x36ac25?.color || WHITEBOARD_DEFAULT_COLOR,
    size: Number(_0x36ac25?.brushSizePx) || WHITEBOARD_DEFAULT_BRUSH_SIZE_PX
  })
});
const isFiniteCommandPoint = _0x30e340 => Number.isFinite(Number(_0x30e340?.x)) && Number.isFinite(Number(_0x30e340?.y));
const hasDrawableStrokePoints = _0x3427f5 => Array.isArray(_0x3427f5?.points) && _0x3427f5.points.some(isFiniteCommandPoint);
const shouldDiscardStrokeCommand = _0x5990c6 => (_0x5990c6?.type === "brush" || _0x5990c6?.type === "eraser") && !hasDrawableStrokePoints(_0x5990c6);
const canvasToPngBlob = _0x3890e5 => new Promise(_0x468f96 => {
  if (!_0x3890e5 || typeof _0x3890e5.toBlob !== "function") {
    _0x468f96(null);
    return;
  }
  _0x3890e5.toBlob(_0x97980c => _0x468f96(_0x97980c || null), "image/png");
});
function appendIcon(_0x557f87, _0x5b3f7a) {
  const _0x29b9f0 = createSafeSvg(_0x5b3f7a);
  if (!_0x29b9f0) {
    return;
  }
  _0x29b9f0.classList.add("whiteboard-toolbar-icon");
  _0x557f87.appendChild(_0x29b9f0);
}
function createToolbarButton({
  className = "",
  tool = "",
  action = "",
  label = "",
  shortcut = "",
  icon = ""
} = {}) {
  const _0x43e1b6 = document.createElement("button");
  _0x43e1b6.type = "button";
  _0x43e1b6.className = ["ftb-btn", "icon-only", "whiteboard-toolbar-btn", className].filter(Boolean).join(" ");
  if (tool) {
    _0x43e1b6.dataset.tool = tool;
  }
  if (action) {
    _0x43e1b6.dataset.action = action;
  }
  if (label) {
    _0x43e1b6.dataset.tooltip = shortcut ? label + " (" + shortcut + ")" : label;
    _0x43e1b6.setAttribute("aria-label", label);
  }
  appendIcon(_0x43e1b6, icon);
  return _0x43e1b6;
}
function createDivider() {
  const _0x4dbced = document.createElement("div");
  _0x4dbced.className = "whiteboard-toolbar-divider";
  _0x4dbced.setAttribute("aria-hidden", "true");
  return _0x4dbced;
}
function createToolbarGroup(_0x4b1d7f) {
  const _0x2555a1 = document.createElement("div");
  _0x2555a1.className = ["whiteboard-toolbar-group", _0x4b1d7f].filter(Boolean).join(" ");
  return _0x2555a1;
}
function createWhiteboardToolbar({
  hiddenActions = []
} = {}) {
  const _0xb8de6d = document.createElement("div");
  _0xb8de6d.className = "node-floating-toolbar whiteboard-toolbar";
  const _0x101951 = new Set((Array.isArray(hiddenActions) ? hiddenActions : []).map(_0x4cf9a6 => String(_0x4cf9a6 || "").trim()).filter(Boolean));
  const _0x1829e2 = _0x597645 => !_0x101951.has(_0x597645);
  const _0x14fa28 = createToolbarGroup("whiteboard-toolbar-actions");
  if (_0x1829e2("undo")) {
    _0x14fa28.appendChild(createToolbarButton({
      className: "whiteboard-action-btn act-undo",
      action: "undo",
      label: "撤销",
      icon: WHITEBOARD_TOOL_ICONS.undo
    }));
  }
  if (_0x1829e2("redo")) {
    _0x14fa28.appendChild(createToolbarButton({
      className: "whiteboard-action-btn act-redo",
      action: "redo",
      label: "重做",
      icon: WHITEBOARD_TOOL_ICONS.redo
    }));
  }
  const _0x4b0f64 = createToolbarGroup("whiteboard-toolbar-compose");
  if (_0x1829e2("compose")) {
    _0x4b0f64.appendChild(createToolbarButton({
      className: "whiteboard-action-btn act-compose",
      action: "compose",
      label: "合成图像",
      icon: WHITEBOARD_TOOL_ICONS.compose
    }));
  }
  if (_0x1829e2("clear")) {
    _0x14fa28.appendChild(createToolbarButton({
      className: "whiteboard-action-btn act-clear",
      action: "clear",
      label: "清空",
      shortcut: "R",
      icon: WHITEBOARD_TOOL_ICONS.clear
    }));
  }
  const _0x50aad2 = createToolbarGroup("whiteboard-toolbar-tools");
  if (_0x1829e2("upload-background")) {
    const _0x3b282 = createToolbarButton({
      className: "whiteboard-upload-btn",
      action: "upload-background",
      label: t("whiteboardNode.background.upload"),
      icon: WHITEBOARD_TOOL_ICONS.upload
    });
    _0x3b282.dataset.i18nTooltip = "whiteboardNode.background.upload";
    _0x3b282.dataset.i18nAriaLabel = "whiteboardNode.background.upload";
    const _0x18f22c = document.createElement("span");
    _0x18f22c.className = "whiteboard-upload-label";
    _0x18f22c.dataset.i18n = "whiteboardNode.background.upload";
    _0x18f22c.textContent = t("whiteboardNode.background.upload");
    _0x3b282.appendChild(_0x18f22c);
    _0x50aad2.appendChild(_0x3b282);
    _0x50aad2.appendChild(createDivider());
  }
  WHITEBOARD_PRIMARY_TOOLS.forEach(_0x14dd1a => {
    _0x50aad2.appendChild(createToolbarButton({
      className: "whiteboard-tool-btn",
      tool: _0x14dd1a,
      label: WHITEBOARD_TOOL_LABELS[_0x14dd1a] || _0x14dd1a,
      shortcut: WHITEBOARD_TOOL_SHORTCUTS[_0x14dd1a] || "",
      icon: WHITEBOARD_TOOL_ICONS[_0x14dd1a]
    }));
  });
  if (_0x1829e2("more-shapes")) {
    const _0x39b3d0 = document.createElement("div");
    _0x39b3d0.className = "whiteboard-more-wrap";
    const _0x157350 = createToolbarButton({
      className: "whiteboard-more-btn",
      action: "more-shapes",
      label: "更多图形",
      icon: WHITEBOARD_TOOL_ICONS.more
    });
    _0x157350.setAttribute("aria-haspopup", "menu");
    _0x157350.setAttribute("aria-expanded", "false");
    const _0x4816d8 = document.createElement("div");
    _0x4816d8.className = "whiteboard-shape-menu";
    _0x4816d8.setAttribute("role", "menu");
    _0x4816d8.hidden = true;
    WHITEBOARD_SHAPE_OPTIONS.forEach(_0x50f231 => {
      const _0x110a4d = document.createElement("button");
      _0x110a4d.type = "button";
      _0x110a4d.className = "whiteboard-shape-option";
      _0x110a4d.dataset.shapeKey = _0x50f231.key;
      _0x110a4d.dataset.shapeTool = _0x50f231.tool;
      _0x110a4d.dataset.tooltip = _0x50f231.label;
      _0x110a4d.setAttribute("aria-label", _0x50f231.label);
      _0x110a4d.setAttribute("role", "menuitem");
      appendIcon(_0x110a4d, _0x50f231.icon);
      _0x4816d8.appendChild(_0x110a4d);
    });
    _0x39b3d0.appendChild(_0x157350);
    _0x39b3d0.appendChild(_0x4816d8);
    _0x50aad2.appendChild(_0x39b3d0);
  }
  [_0x50aad2, _0x14fa28, _0x4b0f64].filter(_0x2c0174 => _0x2c0174.childElementCount > 0).forEach((_0xac5983, _0x1add3f) => {
    if (_0x1add3f > 0) {
      _0xb8de6d.appendChild(createDivider());
    }
    _0xb8de6d.appendChild(_0xac5983);
  });
  applyI18n(_0xb8de6d);
  return _0xb8de6d;
}
function createWhiteboardStylePanel() {
  const _0x27c9f1 = document.createElement("div");
  _0x27c9f1.className = "whiteboard-style-panel is-empty";
  _0x27c9f1.setAttribute("aria-hidden", "true");
  _0x27c9f1.inert = true;
  const _0x5b7800 = (_0x41c5bd, _0x112da9 = "") => {
    const _0x3bf5be = document.createElement("section");
    _0x3bf5be.className = ["whiteboard-style-section", _0x112da9].filter(Boolean).join(" ");
    _0x3bf5be.dataset.styleControl = _0x41c5bd;
    return _0x3bf5be;
  };
  const _0x2b717d = _0x5b7800("color", "whiteboard-style-color-section");
  const _0x1e8ad1 = document.createElement("div");
  _0x1e8ad1.className = "whiteboard-style-color-grid";
  Object.keys(COLOR_VAR_MAP).forEach(_0x24cf3e => {
    const _0x4cd79a = "whiteboardNode.style.colors." + _0x24cf3e;
    const _0x5a79c5 = document.createElement("button");
    _0x5a79c5.type = "button";
    _0x5a79c5.className = "whiteboard-color-swatch";
    _0x5a79c5.dataset.color = _0x24cf3e;
    _0x5a79c5.dataset.i18nTooltip = _0x4cd79a;
    _0x5a79c5.dataset.i18nAriaLabel = _0x4cd79a;
    _0x5a79c5.dataset.tooltip = t(_0x4cd79a);
    _0x5a79c5.setAttribute("aria-label", t(_0x4cd79a));
    _0x5a79c5.style.setProperty("--whiteboard-swatch-bg", getColorCss(_0x24cf3e));
    _0x1e8ad1.appendChild(_0x5a79c5);
  });
  _0x2b717d.appendChild(_0x1e8ad1);
  const _0x5343f6 = _0x5b7800("size", "whiteboard-style-size-section");
  const _0x5583e6 = document.createElement("label");
  _0x5583e6.className = "whiteboard-style-size";
  const _0x2cc033 = document.createElement("span");
  _0x2cc033.className = "whiteboard-size-value";
  const _0x1b0616 = document.createElement("input");
  _0x1b0616.className = "whiteboard-size-range";
  _0x1b0616.type = "range";
  _0x1b0616.min = "1";
  _0x1b0616.max = "120";
  _0x1b0616.step = "1";
  _0x5583e6.appendChild(_0x2cc033);
  _0x5583e6.appendChild(_0x1b0616);
  const _0x1d0888 = document.createElement("div");
  _0x1d0888.className = "whiteboard-size-presets";
  WHITEBOARD_SIZE_PRESETS.forEach(_0x4b4ffb => {
    const _0x522243 = document.createElement("button");
    _0x522243.type = "button";
    _0x522243.className = "whiteboard-size-preset";
    _0x522243.dataset.sizeValue = String(_0x4b4ffb.value);
    _0x522243.dataset.i18nTooltip = _0x4b4ffb.tooltipKey;
    _0x522243.dataset.i18nAriaLabel = _0x4b4ffb.tooltipKey;
    _0x522243.dataset.tooltip = t(_0x4b4ffb.tooltipKey);
    _0x522243.setAttribute("aria-label", t(_0x4b4ffb.tooltipKey));
    _0x522243.textContent = _0x4b4ffb.key;
    _0x1d0888.appendChild(_0x522243);
  });
  _0x5343f6.appendChild(_0x5583e6);
  _0x5343f6.appendChild(_0x1d0888);
  const _0x26b840 = _0x5b7800("opacity", "whiteboard-style-opacity-section");
  const _0x23005e = document.createElement("label");
  _0x23005e.className = "whiteboard-style-opacity";
  const _0x3fd144 = document.createElement("span");
  _0x3fd144.className = "whiteboard-opacity-value";
  const _0x543920 = document.createElement("input");
  _0x543920.className = "whiteboard-opacity-range";
  _0x543920.type = "range";
  _0x543920.min = "10";
  _0x543920.max = "100";
  _0x543920.step = "1";
  _0x23005e.appendChild(_0x3fd144);
  _0x23005e.appendChild(_0x543920);
  const _0x244307 = document.createElement("div");
  _0x244307.className = "whiteboard-opacity-presets";
  WHITEBOARD_OPACITY_PRESETS.forEach(_0x1acf1d => {
    const _0x29ed1e = document.createElement("button");
    _0x29ed1e.type = "button";
    _0x29ed1e.className = "whiteboard-style-option whiteboard-opacity-preset";
    _0x29ed1e.dataset.styleProp = "opacity";
    _0x29ed1e.dataset.styleValue = String(_0x1acf1d.value);
    _0x29ed1e.dataset.tooltip = _0x1acf1d.key + "%";
    _0x29ed1e.setAttribute("aria-label", _0x1acf1d.key + "%");
    _0x29ed1e.textContent = _0x1acf1d.key;
    _0x244307.appendChild(_0x29ed1e);
  });
  _0x26b840.appendChild(_0x23005e);
  _0x26b840.appendChild(_0x244307);
  const _0x41d7f4 = (_0x119d9d, _0x1b3c75, _0xeec0eb) => {
    const _0x597f04 = _0x5b7800(_0x119d9d, "whiteboard-style-" + _0x119d9d + "-section");
    const _0x14be9f = document.createElement("div");
    _0x14be9f.className = "whiteboard-style-segmented";
    _0xeec0eb.forEach(_0x30f86f => {
      const _0x243c3d = document.createElement("button");
      const _0xd9e15f = _0x30f86f.value ?? _0x30f86f.key;
      _0x243c3d.type = "button";
      _0x243c3d.className = "whiteboard-style-option";
      _0x243c3d.dataset.styleProp = _0x30f86f.prop || _0x1b3c75;
      _0x243c3d.dataset.styleValue = _0xd9e15f;
      const _0x635723 = _0x30f86f.tooltipKey || _0x30f86f.labelKey;
      const _0x3306ef = _0x635723 ? t(_0x635723) : _0x30f86f.tooltip || _0x30f86f.key || _0xd9e15f;
      if (_0x635723) {
        _0x243c3d.dataset.i18nTooltip = _0x635723;
        _0x243c3d.dataset.i18nAriaLabel = _0x635723;
      }
      _0x243c3d.dataset.tooltip = _0x3306ef;
      _0x243c3d.setAttribute("aria-label", _0x3306ef);
      if (_0x30f86f.labelKey) {
        _0x243c3d.dataset.i18n = _0x30f86f.labelKey;
        _0x243c3d.textContent = t(_0x30f86f.labelKey);
      } else {
        _0x243c3d.textContent = _0x30f86f.label;
      }
      _0x14be9f.appendChild(_0x243c3d);
    });
    _0x597f04.appendChild(_0x14be9f);
    return _0x597f04;
  };
  const _0x31955b = () => {
    const _0x2b7807 = _0x5b7800("arrow-kind", "whiteboard-style-arrow-kind-section");
    const _0x4f796d = document.createElement("div");
    _0x4f796d.className = "whiteboard-arrow-kind-row";
    const _0x20be08 = document.createElement("span");
    _0x20be08.dataset.i18n = "whiteboardNode.style.lineType";
    _0x20be08.textContent = t("whiteboardNode.style.lineType");
    const _0xb8d0d4 = document.createElement("div");
    _0xb8d0d4.className = "whiteboard-arrow-kind-options";
    WHITEBOARD_ARROW_KIND_OPTIONS.forEach(_0x47daa1 => {
      const _0x1c66d5 = document.createElement("button");
      _0x1c66d5.type = "button";
      _0x1c66d5.className = "whiteboard-style-option whiteboard-arrow-kind-option";
      _0x1c66d5.dataset.styleProp = "arrowKind";
      _0x1c66d5.dataset.styleValue = _0x47daa1.value;
      _0x1c66d5.dataset.i18nTooltip = _0x47daa1.tooltipKey;
      _0x1c66d5.dataset.i18nAriaLabel = _0x47daa1.tooltipKey;
      _0x1c66d5.dataset.tooltip = t(_0x47daa1.tooltipKey);
      _0x1c66d5.setAttribute("aria-label", t(_0x47daa1.tooltipKey));
      appendIcon(_0x1c66d5, _0x47daa1.icon);
      _0xb8d0d4.appendChild(_0x1c66d5);
    });
    _0x4f796d.appendChild(_0x20be08);
    _0x4f796d.appendChild(_0xb8d0d4);
    _0x2b7807.appendChild(_0x4f796d);
    return _0x2b7807;
  };
  const _0x2ec136 = () => {
    const _0x3690dd = _0x5b7800("arrowheads", "whiteboard-style-arrowheads-section");
    const _0x189fc4 = document.createElement("div");
    _0x189fc4.className = "whiteboard-arrowheads-row";
    const _0x533e18 = document.createElement("span");
    _0x533e18.dataset.i18n = "whiteboardNode.style.arrowheads";
    _0x533e18.textContent = t("whiteboardNode.style.arrowheads");
    _0x189fc4.appendChild(_0x533e18);
    ["arrowStart", "arrowEnd"].forEach(_0x4964a3 => {
      const _0x5b5750 = document.createElement("button");
      _0x5b5750.type = "button";
      _0x5b5750.className = "whiteboard-arrowhead-trigger";
      _0x5b5750.dataset.arrowheadTarget = _0x4964a3;
      const _0x2b7f1d = _0x4964a3 === "arrowStart" ? "whiteboardNode.style.terminal.start" : "whiteboardNode.style.terminal.end";
      _0x5b5750.dataset.i18nTooltip = _0x2b7f1d;
      _0x5b5750.dataset.i18nAriaLabel = _0x2b7f1d;
      _0x5b5750.dataset.tooltip = t(_0x2b7f1d);
      _0x5b5750.setAttribute("aria-haspopup", "menu");
      _0x5b5750.setAttribute("aria-expanded", "false");
      _0x5b5750.setAttribute("aria-label", t(_0x2b7f1d));
      _0x189fc4.appendChild(_0x5b5750);
    });
    const _0x20bbad = document.createElement("div");
    _0x20bbad.className = "whiteboard-style-popover whiteboard-arrowhead-menu";
    _0x20bbad.setAttribute("role", "menu");
    _0x20bbad.hidden = true;
    WHITEBOARD_ARROWHEAD_OPTIONS.forEach(_0x1ec85f => {
      const _0x40e5ce = document.createElement("button");
      _0x40e5ce.type = "button";
      _0x40e5ce.className = "whiteboard-arrowhead-option";
      _0x40e5ce.dataset.arrowheadValue = _0x1ec85f.value;
      _0x40e5ce.dataset.i18nTooltip = _0x1ec85f.tooltipKey;
      _0x40e5ce.dataset.i18nAriaLabel = _0x1ec85f.tooltipKey;
      _0x40e5ce.dataset.tooltip = t(_0x1ec85f.tooltipKey);
      _0x40e5ce.setAttribute("aria-label", t(_0x1ec85f.tooltipKey));
      appendIcon(_0x40e5ce, _0x1ec85f.icon);
      _0x20bbad.appendChild(_0x40e5ce);
    });
    _0x3690dd.appendChild(_0x189fc4);
    _0x3690dd.appendChild(_0x20bbad);
    return _0x3690dd;
  };
  _0x27c9f1.appendChild(_0x2b717d);
  _0x27c9f1.appendChild(_0x5343f6);
  _0x27c9f1.appendChild(_0x26b840);
  _0x27c9f1.appendChild(_0x41d7f4("fill", "fill", WHITEBOARD_FILL_OPTIONS));
  _0x27c9f1.appendChild(_0x41d7f4("dash", "dash", WHITEBOARD_DASH_OPTIONS));
  _0x27c9f1.appendChild(_0x41d7f4("font", "font", WHITEBOARD_FONT_OPTIONS));
  _0x27c9f1.appendChild(_0x31955b());
  _0x27c9f1.appendChild(_0x2ec136());
  applyI18n(_0x27c9f1);
  return _0x27c9f1;
}
export class WhiteboardNode {
  constructor(_0x31ca4d) {
    this._data = _0x31ca4d && typeof _0x31ca4d === "object" ? _0x31ca4d : {};
    this.id = this._data.id;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component whiteboard-node-component";
    const _0x5162b9 = normalizeWhiteboardState(this._data.whiteboard);
    this._whiteboard = _0x5162b9;
    this._commands = cloneCommands(_0x5162b9.commands);
    this._redoStack = [];
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._camera = cloneWhiteboardView(_0x5162b9.view);
    this._style = cloneWhiteboardStyle(_0x5162b9.style);
    this._view = {
      tool: _0x5162b9.tool,
      shapeType: _0x5162b9.shapeType,
      color: this._style.color,
      brushSizePx: this._style.size
    };
    this._saveTimer = null;
    this._resizeObserver = null;
    this._cleanup = [];
    this._cursorHover = false;
    this._cursorLast = {
      x: 0,
      y: 0
    };
    this._cursorWorldLast = {
      x: 0,
      y: 0
    };
    this._cursorRaf = 0;
    this._canvasSyncRaf = 0;
    this._layerEraserPreviewRaf = 0;
    this._pendingCanvasSyncAfterResize = false;
    this._pointerState = createPointerState();
    this._modifierState = {
      space: false,
      control: false
    };
    this._temporaryTool = null;
    this._textInputEl = null;
    this._editingTextCommandIndex = null;
    this._fillRegionCache = new Map();
    this._checkerPattern = null;
    this._canvasCssWidth = 1;
    this._canvasCssHeight = 1;
    this._lastPersistedSignature = getWhiteboardSignature(_0x5162b9);
    this._isEditing = false;
    this._isComposingImageNode = false;
    this._isUploadingBackground = false;
    this._backgroundInput = null;
    this._backgroundInputSignature = "";
    this._backgroundImage = null;
    this._backgroundLoadToken = 0;
    this._backgroundObjectUrl = "";
  }
  mount() {
    this.el.replaceChildren();
    const _0x54e102 = document.createElement("div");
    _0x54e102.className = "whiteboard-node-shell";
    const _0x48adf9 = document.createElement("div");
    _0x48adf9.className = "whiteboard-canvas-wrap";
    const _0x2651d3 = document.createElement("canvas");
    _0x2651d3.className = "v2-annotate-canvas whiteboard-canvas";
    _0x2651d3.tabIndex = 0;
    const _0x2b3d62 = document.createElement("div");
    _0x2b3d62.className = "v2-annotate-cursor whiteboard-cursor";
    _0x2b3d62.style.display = "none";
    const _0x4cabb4 = createWhiteboardToolbar(this._data.whiteboardToolbar);
    const _0x8bacb8 = Boolean(_0x4cabb4.querySelector(".whiteboard-upload-btn"));
    const _0x42e3f8 = _0x8bacb8 ? document.createElement("input") : null;
    if (_0x42e3f8) {
      _0x42e3f8.type = "file";
      _0x42e3f8.accept = "image/*";
      _0x42e3f8.className = "whiteboard-background-file-input";
      _0x42e3f8.hidden = true;
      _0x42e3f8.tabIndex = -1;
      _0x4cabb4.appendChild(_0x42e3f8);
    }
    const _0x3b4319 = createWhiteboardStylePanel();
    const _0x519ced = document.createElement("div");
    _0x519ced.className = "group-resizer whiteboard-resizer v2-resize-move";
    _0x519ced.setAttribute("aria-hidden", "true");
    _0x48adf9.appendChild(_0x2651d3);
    _0x48adf9.appendChild(_0x2b3d62);
    _0x54e102.appendChild(_0x48adf9);
    _0x54e102.appendChild(_0x519ced);
    this.el.appendChild(_0x4cabb4);
    this.el.appendChild(_0x3b4319);
    this.el.appendChild(_0x54e102);
    this._shellEl = _0x54e102;
    this._canvasWrapEl = _0x48adf9;
    this._resizerEl = _0x519ced;
    this.canvasEl = _0x2651d3;
    this.cursorEl = _0x2b3d62;
    this.toolbarEl = _0x4cabb4;
    this.stylePanelEl = _0x3b4319;
    this.styleSections = Array.from(_0x3b4319.querySelectorAll("[data-style-control]"));
    this.sizeValueEl = _0x3b4319.querySelector(".whiteboard-size-value");
    this.sizeRangeEl = _0x3b4319.querySelector(".whiteboard-size-range");
    this.sizePresetButtons = Array.from(_0x3b4319.querySelectorAll(".whiteboard-size-preset"));
    this.opacityValueEl = _0x3b4319.querySelector(".whiteboard-opacity-value");
    this.opacityRangeEl = _0x3b4319.querySelector(".whiteboard-opacity-range");
    this.styleOptionButtons = Array.from(_0x3b4319.querySelectorAll(".whiteboard-style-option"));
    this.arrowheadTriggerButtons = Array.from(_0x3b4319.querySelectorAll(".whiteboard-arrowhead-trigger"));
    this.arrowheadMenuEl = _0x3b4319.querySelector(".whiteboard-arrowhead-menu");
    this.arrowheadOptionButtons = Array.from(_0x3b4319.querySelectorAll(".whiteboard-arrowhead-option"));
    this._activeArrowheadTarget = "arrowEnd";
    this.colorWrapEl = _0x3b4319.querySelector(".whiteboard-style-color-grid");
    this.colorDotEl = null;
    this.colorButtons = Array.from(_0x3b4319.querySelectorAll(".whiteboard-color-swatch"));
    this.toolButtons = Array.from(_0x4cabb4.querySelectorAll(".whiteboard-tool-btn"));
    this.moreButtonEl = _0x4cabb4.querySelector(".whiteboard-more-btn");
    this.shapeMenuEl = _0x4cabb4.querySelector(".whiteboard-shape-menu");
    this.shapeOptionButtons = Array.from(_0x4cabb4.querySelectorAll(".whiteboard-shape-option"));
    this.composeButtonEl = _0x4cabb4.querySelector(".act-compose");
    this.backgroundUploadButtonEl = _0x4cabb4.querySelector(".whiteboard-upload-btn");
    this.backgroundFileInputEl = _0x42e3f8;
    const _0x6b3702 = this.canvasEl.getContext("2d");
    _0x6b3702.lineCap = "round";
    _0x6b3702.lineJoin = "round";
    this._checkerPattern = createEraseCheckerboardPattern(_0x6b3702, 1);
    this._bindSelection();
    this._bindEventGuards();
    this._bindCanvasEvents();
    this._bindToolbarEvents();
    this._bindResizeHandle(_0x519ced);
    this._bindResizeObserver();
    this._bindSelectionState();
    this._bindBackgroundInput();
    this._setEditing(false);
    this._syncToolbarState();
    this._scheduleCanvasSync();
    return this.el;
  }
  update(_0x2eca81) {
    this._data = _0x2eca81 && typeof _0x2eca81 === "object" ? _0x2eca81 : {};
    const _0x358d34 = normalizeWhiteboardState(this._data.whiteboard);
    const _0x172630 = getWhiteboardSignature(_0x358d34);
    if (_0x172630 !== this._lastPersistedSignature && _0x172630 !== this._getCurrentSignature()) {
      this._loadWhiteboardState(_0x358d34);
    }
    this._scheduleCanvasSync();
  }
  unmount() {
    this._setEditing(false);
    this._flushSave();
    this._cleanup.forEach(_0x4e5371 => _0x4e5371?.());
    this._cleanup = [];
    this._resizeObserver?.disconnect?.();
    this._resizeObserver = null;
    this._removeTextInput(false);
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    if (this._cursorRaf) {
      cancelWhiteboardFrame(this._cursorRaf);
      this._cursorRaf = 0;
    }
    if (this._canvasSyncRaf) {
      cancelWhiteboardFrame(this._canvasSyncRaf);
      this._canvasSyncRaf = 0;
    }
    this._cancelLayerEraserPreviewRender?.();
    this._backgroundLoadToken += 1;
    this._backgroundImage = null;
    this._releaseBackgroundObjectUrl();
  }
  _setEditing(_0x5658a8, {
    focusCanvas = false
  } = {}) {
    const _0x61bf95 = Boolean(_0x5658a8);
    this._syncEditingSurfaceState(_0x61bf95);
    if (this._isEditing === _0x61bf95) {
      if (_0x61bf95 && focusCanvas) {
        this.canvasEl?.focus?.({
          preventScroll: true
        });
      }
      return;
    }
    this._isEditing = _0x61bf95;
    if (_0x61bf95) {
      if (focusCanvas) {
        this.canvasEl?.focus?.({
          preventScroll: true
        });
      }
      this._syncCursor();
      return;
    }
    this._removeTextInput(true);
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._modifierState = {
      space: false,
      control: false
    };
    this._temporaryTool = null;
    this._cancelLayerEraserPreviewRender?.();
    this._releasePointerCapture();
    this._pointerState = createPointerState();
    this._cursorHover = false;
    this._syncCursor();
    this._render();
  }
  _syncEditingSurfaceState(_0x3ee1bf = this._isEditing) {
    const _0x57a9a3 = Boolean(_0x3ee1bf);
    this.el?.classList?.toggle("is-whiteboard-editing", _0x57a9a3);
    this._shellEl?.classList?.toggle("is-whiteboard-editing", _0x57a9a3);
    if (this.toolbarEl) {
      this.toolbarEl.inert = !_0x57a9a3;
    }
    if (this.stylePanelEl) {
      this.stylePanelEl.inert = !_0x57a9a3 || this.stylePanelEl.classList.contains("is-empty");
    }
    if (this._resizerEl) {
      this._resizerEl.inert = !_0x57a9a3;
    }
  }
  _bindSelection() {
    this.el.addEventListener("pointerdown", () => {
      const _0x58d33c = a609_0x3d8181.getStateRaw?.().selectedNodeIds || [];
      if (!_0x58d33c.includes(this.id)) {
        a609_0x3d8181.setSelectedNodes([this.id]);
      }
    }, true);
  }
  _bindEventGuards() {
    ["pointerdown", "pointermove", "pointerup", "pointercancel", "mousedown", "mouseup", "mousemove", "click", "dblclick", "keydown", "keyup", "wheel", "copy", "paste"].forEach(_0x33efe7 => {
      this._shellEl.addEventListener(_0x33efe7, _0x57bfdd => {
        if (this._isEditing) {
          _0x57bfdd.stopPropagation();
        }
      });
    });
    this._shellEl.addEventListener("dblclick", _0x90186e => {
      _0x90186e.preventDefault();
      _0x90186e.stopPropagation();
      this._setEditing(true, {
        focusCanvas: true
      });
    });
    this._shellEl.addEventListener("contextmenu", _0x5a370c => {
      if (!this._isEditing) {
        return;
      }
      _0x5a370c.preventDefault();
      _0x5a370c.stopPropagation();
    });
    const _0x870f = _0x9cd431 => {
      this._handleKeyDown(_0x9cd431);
    };
    const _0x44c4a1 = _0x52d343 => {
      this._handleKeyUp(_0x52d343);
    };
    const _0xe3b742 = _0x1c3c6e => {
      this._handleOutsidePointerDown(_0x1c3c6e);
    };
    window.addEventListener("keydown", _0x870f, true);
    window.addEventListener("keyup", _0x44c4a1, true);
    document.addEventListener("pointerdown", _0xe3b742, true);
    this._cleanup.push(() => window.removeEventListener("keydown", _0x870f, true));
    this._cleanup.push(() => window.removeEventListener("keyup", _0x44c4a1, true));
    this._cleanup.push(() => document.removeEventListener("pointerdown", _0xe3b742, true));
  }
  _bindCanvasEvents() {
    const _0x5babe5 = _0x2d38d9 => {
      this._cursorLast = this._getCanvasPointFromClient(_0x2d38d9.clientX, _0x2d38d9.clientY);
      this._cursorWorldLast = this._screenToWorld(this._cursorLast);
      if (this._cursorRaf) {
        return;
      }
      this._cursorRaf = requestAnimationFrame(() => {
        this._cursorRaf = 0;
        this._syncCursor();
      });
    };
    this.canvasEl.addEventListener("pointerdown", _0x19779a => {
      if (!this._isEditing) {
        return;
      }
      _0x19779a.preventDefault();
      _0x19779a.stopPropagation();
      this.canvasEl.focus?.({
        preventScroll: true
      });
      _0x5babe5(_0x19779a);
      this._startDraft(_0x19779a);
    });
    this.canvasEl.addEventListener("pointermove", _0xa6ae71 => {
      if (!this._isEditing) {
        return;
      }
      _0xa6ae71.preventDefault();
      _0xa6ae71.stopPropagation();
      _0x5babe5(_0xa6ae71);
      this._moveDraft(_0xa6ae71);
    });
    this.canvasEl.addEventListener("pointerup", _0x523375 => {
      if (!this._isEditing) {
        return;
      }
      _0x523375.preventDefault();
      _0x523375.stopPropagation();
      _0x5babe5(_0x523375);
      this._endDraft();
    });
    this.canvasEl.addEventListener("pointercancel", _0x517448 => {
      if (!this._isEditing) {
        return;
      }
      _0x517448.preventDefault();
      _0x517448.stopPropagation();
      _0x5babe5(_0x517448);
      this._endDraft();
    });
    this.canvasEl.addEventListener("pointerenter", _0x4ad8c0 => {
      if (!this._isEditing) {
        return;
      }
      this._cursorHover = true;
      _0x5babe5(_0x4ad8c0);
    });
    this.canvasEl.addEventListener("pointerleave", () => {
      if (!this._isEditing) {
        return;
      }
      this._cursorHover = false;
      this._syncCursor();
    });
    this.canvasEl.addEventListener("lostpointercapture", _0x44abc7 => {
      if (!this._isEditing) {
        return;
      }
      if (this._pointerState?.pointerId !== _0x44abc7.pointerId) {
        return;
      }
      this._endDraft({
        releaseCapture: false
      });
    });
    this.canvasEl.addEventListener("dblclick", _0x226cc5 => {
      if (!this._isEditing) {
        return;
      }
      const _0x398cd2 = this._getLocalFromClient(_0x226cc5.clientX, _0x226cc5.clientY);
      const _0x2ab659 = this._findTextHit(_0x398cd2);
      if (!_0x2ab659 || this._commands[_0x2ab659.index]?.type !== "text") {
        return;
      }
      _0x226cc5.preventDefault();
      _0x226cc5.stopPropagation();
      this._editTextCommand(_0x2ab659.index);
    });
    this.canvasEl.addEventListener("wheel", _0x52aac3 => this._onCanvasWheel(_0x52aac3), {
      passive: false
    });
  }
  _bindToolbarEvents() {
    const _0x525c41 = () => this.colorWrapEl?.classList.remove("open");
    const _0x3c5321 = () => {
      if (this.shapeMenuEl) {
        this.shapeMenuEl.hidden = true;
      }
      this.moreButtonEl?.setAttribute("aria-expanded", "false");
    };
    const _0x53f9e6 = () => {
      if (this.arrowheadMenuEl) {
        this.arrowheadMenuEl.hidden = true;
      }
      this.arrowheadTriggerButtons?.forEach(_0x4f9736 => _0x4f9736.setAttribute("aria-expanded", "false"));
    };
    const _0x2d189d = _0x1187c2 => {
      if (this.colorWrapEl && this.colorWrapEl.classList.contains("open") && !this.colorWrapEl.contains(_0x1187c2.target)) {
        _0x525c41();
      }
      if (this.shapeMenuEl && !this.shapeMenuEl.hidden && !this.moreButtonEl?.parentElement?.contains?.(_0x1187c2.target)) {
        _0x3c5321();
      }
      const _0x38a25d = this.arrowheadMenuEl?.parentElement?.contains?.(_0x1187c2.target);
      if (!_0x38a25d) {
        _0x53f9e6();
      }
    };
    document.addEventListener("pointerdown", _0x2d189d, true);
    this._cleanup.push(() => document.removeEventListener("pointerdown", _0x2d189d, true));
    [this.toolbarEl, this.stylePanelEl].filter(Boolean).forEach(_0x853d39 => {
      _0x853d39.addEventListener("pointerdown", _0x307c47 => {
        if (!this._isEditing) {
          return;
        }
        _0x307c47.stopPropagation();
      });
      _0x853d39.addEventListener("dblclick", _0x7209dd => {
        if (!this._isEditing) {
          return;
        }
        _0x7209dd.preventDefault();
        _0x7209dd.stopPropagation();
      });
      _0x853d39.addEventListener("wheel", _0x75cdb0 => {
        if (!this._isEditing) {
          return;
        }
        _0x75cdb0.stopPropagation();
      });
    });
    this.toolButtons.forEach(_0x43e7aa => {
      _0x43e7aa.addEventListener("click", _0x328da2 => {
        if (!this._isEditing) {
          return;
        }
        _0x328da2.stopPropagation();
        this.canvasEl?.focus?.({
          preventScroll: true
        });
        this._setTool(_0x43e7aa.dataset.tool);
      });
    });
    this.moreButtonEl?.addEventListener("click", _0x25cfd9 => {
      if (!this._isEditing) {
        return;
      }
      _0x25cfd9.stopPropagation();
      const _0x76522a = Boolean(this.shapeMenuEl?.hidden);
      if (this.shapeMenuEl) {
        this.shapeMenuEl.hidden = !_0x76522a;
      }
      this.moreButtonEl?.setAttribute("aria-expanded", _0x76522a ? "true" : "false");
    });
    this.shapeOptionButtons?.forEach(_0x5a0845 => {
      _0x5a0845.addEventListener("click", _0x4fd79a => {
        if (!this._isEditing) {
          return;
        }
        _0x4fd79a.stopPropagation();
        const _0x5b7054 = WHITEBOARD_SHAPE_OPTIONS.find(_0x4a1c37 => _0x4a1c37.key === _0x5a0845.dataset.shapeKey);
        if (!_0x5b7054) {
          return;
        }
        if (_0x5b7054.tool === "shape" || _0x5b7054.tool === "rect") {
          this._view.shapeType = _0x5b7054.key;
        }
        if (_0x5b7054.style) {
          Object.entries(_0x5b7054.style).forEach(([_0x2266cf, _0x5c4b7d]) => {
            this._style[_0x2266cf] = normalizeStyleValue(_0x2266cf, _0x5c4b7d);
          });
        }
        this._setTool(_0x5b7054.tool);
        _0x3c5321();
        this.canvasEl?.focus?.({
          preventScroll: true
        });
      });
    });
    this.colorWrapEl?.addEventListener("pointerdown", _0x416249 => {
      if (!this._isEditing) {
        return;
      }
      _0x416249.stopPropagation();
    });
    this.colorWrapEl?.querySelector(".whiteboard-color-toggle")?.addEventListener("click", _0x86463 => {
      if (!this._isEditing) {
        return;
      }
      _0x86463.stopPropagation();
      this.colorWrapEl?.classList.toggle("open");
    });
    this.colorButtons.forEach(_0x395d3c => {
      _0x395d3c.addEventListener("click", _0x24ec2c => {
        if (!this._isEditing) {
          return;
        }
        _0x24ec2c.stopPropagation();
        this.canvasEl?.focus?.({
          preventScroll: true
        });
        this._setColor(_0x395d3c.dataset.color);
        _0x525c41();
      });
    });
    this.sizeRangeEl?.addEventListener("input", _0x86065c => {
      if (!this._isEditing) {
        return;
      }
      this._setBrushSize(_0x86065c.target.value);
    });
    this.opacityRangeEl?.addEventListener("input", _0x12e6cd => {
      if (!this._isEditing) {
        return;
      }
      this._setStyleValue("opacity", Number(_0x12e6cd.target.value) / 100);
    });
    this.sizePresetButtons?.forEach(_0x82be52 => {
      _0x82be52.addEventListener("click", _0x1d92f8 => {
        if (!this._isEditing) {
          return;
        }
        _0x1d92f8.stopPropagation();
        this.canvasEl?.focus?.({
          preventScroll: true
        });
        this._setBrushSize(_0x82be52.dataset.sizeValue);
      });
    });
    this.styleOptionButtons?.forEach(_0x2d381b => {
      _0x2d381b.addEventListener("click", _0xc7fa0a => {
        if (!this._isEditing) {
          return;
        }
        _0xc7fa0a.stopPropagation();
        this.canvasEl?.focus?.({
          preventScroll: true
        });
        const _0xb809d8 = _0x2d381b.dataset.styleProp;
        let _0x3ad4d3 = _0x2d381b.dataset.styleValue;
        if ((_0xb809d8 === "arrowStart" || _0xb809d8 === "arrowEnd") && _0x2d381b.classList.contains("active")) {
          _0x3ad4d3 = "none";
        }
        this._setStyleValue(_0xb809d8, _0x3ad4d3);
      });
    });
    this.arrowheadTriggerButtons?.forEach(_0x5732a7 => {
      _0x5732a7.addEventListener("click", _0x3fb6e9 => {
        if (!this._isEditing) {
          return;
        }
        _0x3fb6e9.stopPropagation();
        const _0x3d2278 = Boolean(this.arrowheadMenuEl?.hidden);
        _0x53f9e6();
        this._activeArrowheadTarget = _0x5732a7.dataset.arrowheadTarget || "arrowEnd";
        if (this.arrowheadMenuEl) {
          this.arrowheadMenuEl.hidden = !_0x3d2278;
        }
        _0x5732a7.setAttribute("aria-expanded", _0x3d2278 ? "true" : "false");
        this._syncToolbarState();
      });
    });
    this.arrowheadOptionButtons?.forEach(_0x5bcd5f => {
      _0x5bcd5f.addEventListener("click", _0x14c0fe => {
        if (!this._isEditing) {
          return;
        }
        _0x14c0fe.stopPropagation();
        this._setStyleValue(this._activeArrowheadTarget || "arrowEnd", _0x5bcd5f.dataset.arrowheadValue);
        _0x53f9e6();
      });
    });
    this.toolbarEl.querySelector(".act-undo")?.addEventListener("click", _0x2b9332 => {
      if (!this._isEditing) {
        return;
      }
      _0x2b9332.stopPropagation();
      this.canvasEl?.focus?.({
        preventScroll: true
      });
      this._undo();
    });
    this.toolbarEl.querySelector(".act-redo")?.addEventListener("click", _0x358dca => {
      if (!this._isEditing) {
        return;
      }
      _0x358dca.stopPropagation();
      this.canvasEl?.focus?.({
        preventScroll: true
      });
      this._redo();
    });
    this.toolbarEl.querySelector(".act-clear")?.addEventListener("click", _0x35a5ea => {
      if (!this._isEditing) {
        return;
      }
      _0x35a5ea.stopPropagation();
      this.canvasEl?.focus?.({
        preventScroll: true
      });
      this._clear();
    });
    this.composeButtonEl?.addEventListener("click", _0x672b4 => {
      if (!this._isEditing) {
        return;
      }
      _0x672b4.stopPropagation();
      this._createImageNodeFromWhiteboard();
    });
    this.backgroundUploadButtonEl?.addEventListener("click", _0x297a33 => {
      if (!this._isEditing) {
        return;
      }
      _0x297a33.preventDefault();
      _0x297a33.stopPropagation();
      if (this._isUploadingBackground) {
        return;
      }
      this.backgroundFileInputEl?.click?.();
    });
    this.backgroundFileInputEl?.addEventListener("change", _0x2a7cd9 => {
      if (!this._isEditing) {
        return;
      }
      _0x2a7cd9.stopPropagation();
      const _0x366fc8 = _0x2a7cd9.target?.files?.[0] || null;
      _0x2a7cd9.target.value = "";
      if (!_0x366fc8) {
        return;
      }
      this._uploadBackgroundImage(_0x366fc8);
    });
  }
  _bindResizeHandle(_0x1f6d91) {
    _0x1f6d91.addEventListener("pointerdown", _0x288ce9 => {
      if (!this._isEditing) {
        return;
      }
      _0x288ce9.preventDefault();
      _0x288ce9.stopPropagation();
      this._flushSave();
      startNodeResizePreview({
        event: _0x288ce9,
        nodeId: this.id,
        getNode: () => a609_0x3d8181.getStateRaw().nodes?.[this.id] || this._data,
        getViewport: () => a609_0x3d8181.getStateRaw().viewport,
        resolveSize: ({
          startWidth: _0x49df1d,
          startHeight: _0x510457,
          dx: _0x409a88,
          dy: _0x8d5f50
        }) => ({
          width: Math.max(WHITEBOARD_MIN_WIDTH, _0x49df1d + _0x409a88),
          height: Math.max(WHITEBOARD_MIN_HEIGHT, _0x510457 + _0x8d5f50)
        }),
        applyPatch: _0x186904 => a609_0x3d8181.updateNodeData(this.id, _0x186904),
        onPreviewEnd: () => this._scheduleCanvasSync({
          force: true
        }),
        commit: commit
      });
    });
  }
  _bindResizeObserver() {
    if (typeof ResizeObserver !== "function" || !this._canvasWrapEl) {
      return;
    }
    this._resizeObserver = new ResizeObserver(() => this._scheduleCanvasSync());
    this._resizeObserver.observe(this._canvasWrapEl);
  }
  _bindSelectionState() {
    if (typeof a609_0x3d8181.subscribeSelector !== "function") {
      return;
    }
    const _0x443a69 = a609_0x3d8181.subscribeSelector(_0x5e0e70 => {
      const _0x4f143a = Array.isArray(_0x5e0e70.selectedNodeIds) ? _0x5e0e70.selectedNodeIds.includes(this.id) : false;
      const _0x35c4ed = Boolean(_0x5e0e70.nodes?.[this.id]);
      return (_0x35c4ed ? "1" : "0") + ":" + (_0x4f143a ? "1" : "0");
    }, _0x2a3cd3 => {
      if (_0x2a3cd3 !== "1:1") {
        this._setEditing(false);
      }
    }, {
      isEqual: Object.is
    });
    this._cleanup.push(_0x443a69);
  }
  _bindBackgroundInput() {
    if (typeof a609_0x3d8181.subscribeSelector !== "function") {
      return;
    }
    const _0x1b42b8 = a609_0x3d8181.subscribeSelector(_0x4702d4 => getWhiteboardBackgroundInputSignature(resolveWhiteboardBackgroundInput({
      whiteboardId: this.id,
      nodes: _0x4702d4.nodes,
      edges: _0x4702d4.edges
    })), () => this._syncBackgroundInputFromStore(), {
      isEqual: Object.is
    });
    this._cleanup.push(_0x1b42b8);
  }
  _releaseBackgroundObjectUrl() {
    const _0x5387d4 = this._backgroundObjectUrl;
    this._backgroundObjectUrl = "";
    if (!_0x5387d4 || typeof globalThis.URL?.revokeObjectURL !== "function") {
      return;
    }
    globalThis.URL.revokeObjectURL(_0x5387d4);
  }
  _getMountedBackgroundPreviewImage(_0x273d65) {
    const _0x2e1b8e = String(_0x273d65 || "").trim();
    if (!_0x2e1b8e) {
      return null;
    }
    const _0x11b4a9 = globalThis.window?.v2Renderer;
    const _0x5ca1dc = [".img-node-preview img.node-img", ".img-node-preview img.aigen-image-media", ".img-node-preview img.v2-media-preview"].join(", ");
    let _0x29146c = null;
    try {
      _0x29146c = _0x11b4a9?.queryMountedNodeElement?.(_0x2e1b8e, _0x5ca1dc) || null;
    } catch {}
    if (!_0x29146c) {
      try {
        _0x29146c = _0x11b4a9?.getMountedWrapper?.(_0x2e1b8e)?.querySelector?.(_0x5ca1dc) || null;
      } catch {}
    }
    const _0x5f10d2 = Number(_0x29146c?.naturalWidth || _0x29146c?.width || 0);
    const _0x5b84dd = Number(_0x29146c?.naturalHeight || _0x29146c?.height || 0);
    if (!_0x29146c || _0x29146c.complete === false || !(_0x5f10d2 > 0) || !(_0x5b84dd > 0)) {
      return null;
    }
    return _0x29146c;
  }
  _syncBackgroundInputFromStore({
    force = false
  } = {}) {
    const _0xeaadf = a609_0x3d8181.getStateRaw?.() || a609_0x3d8181.getState?.() || {};
    const _0x4ee318 = resolveWhiteboardBackgroundInput({
      whiteboardId: this.id,
      nodes: _0xeaadf.nodes,
      edges: _0xeaadf.edges
    });
    const _0x472324 = getWhiteboardBackgroundInputSignature(_0x4ee318);
    if (!force && _0x472324 === this._backgroundInputSignature) {
      return;
    }
    this._backgroundInputSignature = _0x472324;
    this._backgroundInput = _0x4ee318;
    this._backgroundLoadToken += 1;
    this._backgroundImage = null;
    this._releaseBackgroundObjectUrl();
    if (_0x4ee318?.width > 0 && _0x4ee318?.height > 0) {
      this._adaptWhiteboardSizeToBackground(_0x4ee318, {
        imageWidth: _0x4ee318.width,
        imageHeight: _0x4ee318.height,
        commitHistory: false
      });
    }
    this._scheduleCanvasSync();
    if (_0x4ee318) {
      this._loadBackgroundImage(_0x4ee318, this._backgroundLoadToken);
    }
  }
  async _loadBackgroundImage(_0x31f578, _0x3321f3) {
    let _0x16353c = "";
    let _0xa647e1 = null;
    let _0x310f2b = "";
    const _0x6a879f = Array.from(new Set((_0x31f578?.previewUrls || []).map(_0x4440d4 => String(_0x4440d4 || "").trim()).filter(Boolean)));
    const _0x37b76f = Array.from(new Set([...(_0x31f578?.fullUrls || _0x31f578?.urls || []), _0x31f578?.url].map(_0x397676 => String(_0x397676 || "").trim()).filter(Boolean)));
    _0xa647e1 = this._getMountedBackgroundPreviewImage?.(_0x31f578?.sourceId);
    if (_0xa647e1) {
      _0x310f2b = String(_0xa647e1.currentSrc || _0xa647e1.src || "").trim();
    }
    for (const _0x29cf65 of _0x6a879f) {
      if (_0xa647e1) {
        break;
      }
      _0xa647e1 = await this._loadBackgroundImageElement(_0x29cf65);
      if (_0x3321f3 !== this._backgroundLoadToken) {
        return;
      }
      if (_0xa647e1) {
        _0x310f2b = _0x29cf65;
        break;
      }
    }
    if (!_0xa647e1) {
      for (const _0x50654b of _0x31f578?.thumbnailCacheRefs || []) {
        try {
          const _0x216b5a = await getThumbnail(_0x50654b);
          if (_0x3321f3 !== this._backgroundLoadToken) {
            return;
          }
          if (!_0x216b5a) {
            continue;
          }
          _0xa647e1 = await this._loadBackgroundImageElement(_0x216b5a);
          if (_0x3321f3 !== this._backgroundLoadToken) {
            return;
          }
          if (_0xa647e1) {
            _0x310f2b = _0x216b5a;
            break;
          }
        } catch (_0x238105) {
          console.warn("[WhiteboardNode] load cached background thumbnail failed:", _0x238105);
        }
      }
    }
    if (!_0xa647e1) {
      for (const _0x254e78 of _0x31f578?.thumbIds || []) {
        try {
          const _0x5321b7 = await getImage(_0x254e78);
          if (_0x3321f3 !== this._backgroundLoadToken) {
            return;
          }
          if (!_0x5321b7 || typeof globalThis.URL?.createObjectURL !== "function") {
            continue;
          }
          _0x16353c = globalThis.URL.createObjectURL(_0x5321b7);
          _0xa647e1 = await this._loadBackgroundImageElement(_0x16353c);
          if (_0x3321f3 !== this._backgroundLoadToken) {
            globalThis.URL?.revokeObjectURL?.(_0x16353c);
            return;
          }
          if (_0xa647e1) {
            _0x310f2b = _0x16353c;
            break;
          }
          globalThis.URL?.revokeObjectURL?.(_0x16353c);
          _0x16353c = "";
        } catch (_0x2d261a) {
          console.warn("[WhiteboardNode] load background thumbnail failed:", _0x2d261a);
        }
      }
    }
    if (_0xa647e1) {
      this._backgroundImage = _0xa647e1;
      this._backgroundObjectUrl = _0x16353c;
      this._adaptWhiteboardSizeToBackground?.(_0x31f578, {
        imageWidth: _0xa647e1.naturalWidth,
        imageHeight: _0xa647e1.naturalHeight,
        commitHistory: true
      });
      this._scheduleCanvasSync();
    }
    let _0x5be1f8 = null;
    for (const _0x4738fb of _0x37b76f) {
      if (_0x4738fb === _0x310f2b && _0xa647e1) {
        _0x5be1f8 = _0xa647e1;
        break;
      }
      _0x5be1f8 = await this._loadBackgroundImageElement(_0x4738fb);
      if (_0x3321f3 !== this._backgroundLoadToken) {
        return;
      }
      if (_0x5be1f8) {
        break;
      }
    }
    if (_0x3321f3 !== this._backgroundLoadToken) {
      return;
    }
    if (!_0x5be1f8) {
      if (!_0xa647e1 && _0x16353c) {
        globalThis.URL?.revokeObjectURL?.(_0x16353c);
      }
      return;
    }
    if (_0x5be1f8 !== _0xa647e1) {
      this._backgroundImage = _0x5be1f8;
      this._adaptWhiteboardSizeToBackground?.(_0x31f578, {
        imageWidth: _0x5be1f8.naturalWidth,
        imageHeight: _0x5be1f8.naturalHeight,
        commitHistory: true
      });
      if (_0x16353c && this._backgroundObjectUrl === _0x16353c) {
        this._releaseBackgroundObjectUrl();
      }
      this._scheduleCanvasSync();
    }
  }
  async _loadBackgroundImageElement(_0x406d6f) {
    const _0x23c013 = globalThis.Image;
    if (typeof _0x23c013 !== "function") {
      return null;
    }
    const _0x44a8ee = new _0x23c013();
    _0x44a8ee.decoding = "async";
    if (/^https?:/i.test(_0x406d6f)) {
      _0x44a8ee.crossOrigin = "anonymous";
    }
    const _0x40b739 = await new Promise(_0x356021 => {
      _0x44a8ee.onload = () => _0x356021(true);
      _0x44a8ee.onerror = () => _0x356021(false);
      _0x44a8ee.src = _0x406d6f;
    });
    _0x44a8ee.onload = null;
    _0x44a8ee.onerror = null;
    if (_0x40b739) {
      return _0x44a8ee;
    } else {
      return null;
    }
  }
  _adaptWhiteboardSizeToBackground(_0x8c10c8, {
    imageWidth: _0xac33ef,
    imageHeight: _0x45d7a7,
    commitHistory = false
  } = {}) {
    const _0x55f09e = Number(_0xac33ef || _0x8c10c8?.width || 0);
    const _0x22c677 = Number(_0x45d7a7 || _0x8c10c8?.height || 0);
    if (!(_0x55f09e > 0) || !(_0x22c677 > 0)) {
      return false;
    }
    const _0x58fa03 = a609_0x3d8181.getStateRaw?.().nodes?.[this.id] || this._data || {};
    const _0x2dff93 = [_0x8c10c8?.edgeId || "pending", _0x8c10c8?.sourceId || "upload", Math.round(_0x55f09e), Math.round(_0x22c677)].join(":");
    if (String(_0x58fa03.whiteboardBackgroundFitKey || "") === _0x2dff93) {
      return false;
    }
    const _0x45093a = Number(_0x58fa03.width) || WHITEBOARD_DEFAULT_SIZE.width;
    const _0x8772b8 = Number(_0x58fa03.height) || WHITEBOARD_DEFAULT_SIZE.height;
    const _0xbc4915 = getWhiteboardSizeForBackground({
      imageWidth: _0x55f09e,
      imageHeight: _0x22c677,
      currentWidth: _0x45093a,
      currentHeight: _0x8772b8,
      minWidth: WHITEBOARD_MIN_WIDTH,
      minHeight: WHITEBOARD_MIN_HEIGHT
    });
    if (!_0xbc4915) {
      return false;
    }
    const _0x20379e = Number(_0x58fa03.x) || 0;
    const _0x40e089 = Number(_0x58fa03.y) || 0;
    const _0x329dd7 = {
      width: _0xbc4915.width,
      height: _0xbc4915.height,
      x: _0x20379e + (_0x45093a - _0xbc4915.width) / 2,
      y: _0x40e089 + (_0x8772b8 - _0xbc4915.height) / 2,
      whiteboardBackgroundFitKey: _0x2dff93
    };
    a609_0x3d8181.updateNodeData(this.id, _0x329dd7);
    this._data = {
      ...this._data,
      ..._0x329dd7
    };
    if (commitHistory) {
      commit();
      globalThis.window?._triggerLocalCacheSave?.();
    }
    return true;
  }
  async _showPendingBackgroundPreview(_0x18894e) {
    if (!_0x18894e) {
      return false;
    }
    const _0x108d0b = this._backgroundLoadToken + 1;
    this._backgroundLoadToken = _0x108d0b;
    this._releaseBackgroundObjectUrl();
    let _0x4383f4 = "";
    let _0x2718f5 = null;
    let _0x52ecd7 = null;
    try {
      _0x52ecd7 = await this._createFastBackgroundPreview?.(_0x18894e);
      _0x2718f5 = _0x52ecd7?.image || null;
    } catch (_0x109344) {
      console.warn("[WhiteboardNode] create fast background preview failed:", _0x109344);
    }
    if (!_0x2718f5 && typeof globalThis.URL?.createObjectURL === "function") {
      try {
        _0x4383f4 = globalThis.URL.createObjectURL(_0x18894e);
        _0x2718f5 = await this._loadBackgroundImageElement(_0x4383f4);
        const _0x5e27c3 = _0x2718f5 && this._createDecodedBackgroundPreview?.(_0x2718f5);
        if (_0x5e27c3?.image) {
          _0x52ecd7 = _0x5e27c3;
          _0x2718f5 = _0x5e27c3.image;
          globalThis.URL?.revokeObjectURL?.(_0x4383f4);
          _0x4383f4 = "";
        }
      } catch (_0x24efa8) {
        console.warn("[WhiteboardNode] load pending background preview failed:", _0x24efa8);
      }
    }
    if (!_0x2718f5 || _0x108d0b !== this._backgroundLoadToken) {
      if (_0x4383f4) {
        globalThis.URL?.revokeObjectURL?.(_0x4383f4);
      }
      return false;
    }
    this._backgroundInput = {
      identity: "pending-upload:" + (_0x18894e.name || "image") + ":" + (_0x18894e.size || 0),
      sourceId: "",
      edgeId: "",
      width: Number(_0x52ecd7?.width || _0x2718f5.naturalWidth || _0x2718f5.width || 0),
      height: Number(_0x52ecd7?.height || _0x2718f5.naturalHeight || _0x2718f5.height || 0)
    };
    this._backgroundImage = _0x2718f5;
    this._backgroundObjectUrl = _0x4383f4;
    this._scheduleCanvasSync();
    return {
      image: _0x2718f5,
      width: this._backgroundInput.width,
      height: this._backgroundInput.height,
      thumbnailDataUrl: String(_0x52ecd7?.thumbnailDataUrl || "")
    };
  }
  _createFastBackgroundPreview(_0x3f6824) {
    return createFastWhiteboardBackgroundPreview(_0x3f6824);
  }
  _createDecodedBackgroundPreview(_0x120ed8) {
    return createWhiteboardBackgroundPreviewFromDecodedImage(_0x120ed8);
  }
  _scheduleCanvasSync({
    force = false
  } = {}) {
    if (!force && this.el?.classList?.contains?.("is-resizing")) {
      this._pendingCanvasSyncAfterResize = true;
      return;
    }
    if (force) {
      this._pendingCanvasSyncAfterResize = false;
    }
    if (this._canvasSyncRaf) {
      return;
    }
    this._canvasSyncRaf = requestWhiteboardFrame(() => {
      this._canvasSyncRaf = 0;
      this._syncCanvasSize();
      this._render();
      this._syncCursor();
    });
  }
  _syncCanvasSize() {
    if (!this.canvasEl || !this._canvasWrapEl) {
      return;
    }
    const _0x21ce16 = Math.max(1, Math.round(this._canvasWrapEl.clientWidth || 1));
    const _0x2bed8e = Math.max(1, Math.round(this._canvasWrapEl.clientHeight || 1));
    const _0x327635 = window.devicePixelRatio || 1;
    const _0x795ad9 = Math.round(_0x21ce16 * _0x327635);
    const _0x835cea = Math.round(_0x2bed8e * _0x327635);
    if (this.canvasEl.width !== _0x795ad9 || this.canvasEl.height !== _0x835cea) {
      this.canvasEl.width = _0x795ad9;
      this.canvasEl.height = _0x835cea;
      this.canvasEl.style.width = _0x21ce16 + "px";
      this.canvasEl.style.height = _0x2bed8e + "px";
      const _0x4567e2 = this.canvasEl.getContext("2d");
      _0x4567e2.setTransform(_0x327635, 0, 0, _0x327635, 0, 0);
      _0x4567e2.lineCap = "round";
      _0x4567e2.lineJoin = "round";
      this._fillRegionCache.clear();
    }
    this._canvasCssWidth = _0x21ce16;
    this._canvasCssHeight = _0x2bed8e;
  }
  _getViewport() {
    return cloneWhiteboardView(this._camera);
  }
  _getCanvasPointFromClient(_0x3253e2, _0x30ddb1) {
    const _0xb85d7a = this.canvasEl?.getBoundingClientRect?.();
    if (!_0xb85d7a || _0xb85d7a.width <= 0 || _0xb85d7a.height <= 0) {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: (_0x3253e2 - _0xb85d7a.left) * this._canvasCssWidth / _0xb85d7a.width,
      y: (_0x30ddb1 - _0xb85d7a.top) * this._canvasCssHeight / _0xb85d7a.height
    };
  }
  _screenToWorld(_0x15f863) {
    return getWorldPointFromScreen(_0x15f863, this._getViewport());
  }
  _worldToScreen(_0xf4487d) {
    return getScreenPointFromWorld(_0xf4487d, this._getViewport());
  }
  _getLocalFromClient(_0x2e820b, _0x15de0c) {
    return this._screenToWorld(this._getCanvasPointFromClient(_0x2e820b, _0x15de0c));
  }
  _setCamera(_0x3cac15, {
    scheduleSave = true
  } = {}) {
    this._camera = cloneWhiteboardView(_0x3cac15);
    this._fillRegionCache.clear();
    this._cursorWorldLast = this._screenToWorld(this._cursorLast);
    this._render();
    this._syncCursor();
    if (scheduleSave) {
      this._scheduleSave();
    }
  }
  _startDraft(_0x94d2df) {
    const _0x242a0a = this._pointerState;
    const _0x2e0920 = this._getLocalFromClient(_0x94d2df.clientX, _0x94d2df.clientY);
    const _0x361564 = this._getCanvasPointFromClient(_0x94d2df.clientX, _0x94d2df.clientY);
    const _0x3aa08b = resolveModifierTemporaryTool(this._modifierState);
    const _0x3fe144 = _0x3aa08b || this._temporaryTool || this._view.tool || WHITEBOARD_DEFAULT_TOOL;
    const _0x3f07fb = _0x3fe144 === "hand" || _0x94d2df.button === 1;
    const _0x451878 = !_0x3f07fb && (_0x94d2df.button === 2 || _0x94d2df.ctrlKey === true || this._modifierState?.control === true);
    const _0x79f692 = _0x451878 ? "eraser" : _0x3fe144;
    const _0x3e3167 = cloneWhiteboardStyle(this._style);
    const _0x1d7f21 = clampImageBrushSize(_0x3e3167.size);
    const _0x203df3 = _0x1d7f21 / this._getViewport().zoom;
    const _0x112d21 = _0x79f692 === "arrow" && !_0x3f07fb && !_0x451878 ? this._findSelectedArrowHandleHit(_0x2e0920) : null;
    if (_0x79f692 !== "text" && _0x79f692 !== "select" && !_0x112d21) {
      this._selectedTextCommandIndex = null;
      this._selectedCommandIndex = null;
    }
    if (_0x451878) {
      _0x242a0a.previousTool = this._view.tool || WHITEBOARD_DEFAULT_TOOL;
      _0x242a0a.temporaryTool = "eraser";
      this._temporaryTool = "eraser";
      this._syncCursor("eraser", _0x1d7f21);
    } else {
      _0x242a0a.previousTool = null;
      _0x242a0a.temporaryTool = null;
      this._temporaryTool = _0x3aa08b;
    }
    if (_0x3f07fb || _0x79f692 === "hand") {
      this._removeTextInput(true);
      _0x242a0a.down = true;
      _0x242a0a.pointerId = _0x94d2df.pointerId;
      _0x242a0a.mode = "pan";
      _0x242a0a.panStart = _0x361564;
      _0x242a0a.panView = this._getViewport();
      this._capturePointer(_0x94d2df.pointerId);
      this._syncCursor("hand");
      return true;
    }
    if (_0x79f692 === "eraser") {
      this._removeTextInput(true);
      _0x242a0a.down = true;
      _0x242a0a.pointerId = _0x94d2df.pointerId;
      _0x242a0a.mode = "erase-layers";
      _0x242a0a.eraseLast = _0x2e0920;
      _0x242a0a.eraseIndices = new Set();
      _0x242a0a.eraseTrail = [{
        x: _0x2e0920.x,
        y: _0x2e0920.y
      }];
      this._collectLayerEraseHits(_0x2e0920, _0x2e0920, _0x203df3 / 2);
      this._capturePointer(_0x94d2df.pointerId);
      this._syncToolbarState();
      this._syncCursor("eraser", _0x1d7f21);
      this._render();
      return true;
    }
    if (_0x112d21) {
      this._removeTextInput(true);
      this._selectedTextCommandIndex = null;
      _0x242a0a.down = true;
      _0x242a0a.pointerId = _0x94d2df.pointerId;
      _0x242a0a.mode = "arrow-handle";
      _0x242a0a.arrowTransform = {
        type: "handle",
        index: _0x112d21.index,
        handle: _0x112d21.handle,
        moved: false
      };
      this._capturePointer(_0x94d2df.pointerId);
      this._syncToolbarState();
      this._syncCursor("arrow");
      this._render();
      return true;
    }
    if (_0x79f692 === "bucket") {
      this._fillArea(_0x2e0920);
      return true;
    }
    if (_0x79f692 === "number-label") {
      this._addNumberLabel(_0x2e0920, _0x203df3);
      return true;
    }
    if (_0x79f692 === "select" || _0x79f692 === "text") {
      if (this._textInputEl) {
        this._removeTextInput(true);
      }
      const _0x31cdb7 = this._findTextHit(_0x2e0920);
      if (_0x31cdb7) {
        this._selectedTextCommandIndex = _0x31cdb7.index;
        this._selectedCommandIndex = _0x31cdb7.index;
        if (_0x79f692 === "text") {
          this._editTextCommand(_0x31cdb7.index);
          return true;
        }
        if (_0x31cdb7.mode === "delete") {
          this._deleteTextCommand(_0x31cdb7.index);
          return true;
        }
        if (_0x31cdb7.mode === "copy") {
          this._copyTextCommand(_0x31cdb7.index);
          return true;
        }
        const _0x1cab44 = this._createTextTransformState(_0x31cdb7, _0x2e0920);
        if (!_0x1cab44) {
          return true;
        }
        _0x242a0a.down = true;
        _0x242a0a.pointerId = _0x94d2df.pointerId;
        _0x242a0a.mode = "text-transform";
        _0x242a0a.textTransform = _0x1cab44;
        this._capturePointer(_0x94d2df.pointerId);
        this._syncToolbarState();
        this._render();
        return true;
      }
      if (_0x79f692 === "select") {
        const _0x485f87 = this._findSelectedArrowHandleHit(_0x2e0920);
        if (_0x485f87) {
          _0x242a0a.down = true;
          _0x242a0a.pointerId = _0x94d2df.pointerId;
          _0x242a0a.mode = "arrow-handle";
          _0x242a0a.arrowTransform = {
            type: "handle",
            index: _0x485f87.index,
            handle: _0x485f87.handle,
            moved: false
          };
          this._capturePointer(_0x94d2df.pointerId);
          this._syncToolbarState();
          this._render();
          return true;
        }
        const _0x13ad81 = this._findSelectedLayerTransformHandle(_0x2e0920);
        if (_0x13ad81) {
          const _0x23da62 = this._commands[_0x13ad81.index];
          const _0x3bc346 = createWhiteboardLayerTransformSession({
            command: _0x23da62,
            index: _0x13ad81.index,
            mode: _0x13ad81.mode,
            startPoint: _0x2e0920
          });
          if (_0x3bc346) {
            _0x242a0a.down = true;
            _0x242a0a.pointerId = _0x94d2df.pointerId;
            _0x242a0a.mode = "layer-transform";
            _0x242a0a.layerTransform = _0x3bc346;
            this._capturePointer(_0x94d2df.pointerId);
            this._syncToolbarState();
            this._render();
            return true;
          }
        }
        const _0x20495b = this._findCommandHit(_0x2e0920);
        if (_0x20495b) {
          this._selectedCommandIndex = _0x20495b.index;
          this._selectedTextCommandIndex = this._commands[_0x20495b.index]?.type === "text" ? _0x20495b.index : null;
          const _0x262eb9 = this._commands[_0x20495b.index];
          if (isWhiteboardLayerTransformable(_0x262eb9)) {
            const _0x33df4c = createWhiteboardLayerTransformSession({
              command: _0x262eb9,
              index: _0x20495b.index,
              mode: "move",
              startPoint: _0x2e0920
            });
            if (_0x33df4c) {
              _0x242a0a.down = true;
              _0x242a0a.pointerId = _0x94d2df.pointerId;
              _0x242a0a.mode = "layer-transform";
              _0x242a0a.layerTransform = _0x33df4c;
              this._capturePointer(_0x94d2df.pointerId);
            }
          }
        } else {
          this._selectedCommandIndex = null;
          this._selectedTextCommandIndex = null;
        }
        this._syncToolbarState();
        this._render();
        return true;
      }
      if (_0x79f692 === "text") {
        this._selectedTextCommandIndex = null;
        this._selectedCommandIndex = null;
      }
      this._openTextInput(_0x2e0920, _0x203df3);
      return true;
    }
    const _0x5b2b54 = _0x3e3167.color || WHITEBOARD_DEFAULT_COLOR;
    const _0x46157b = getColorCanvas(_0x5b2b54);
    if (_0x79f692 === "rect" || _0x79f692 === "arrow" || _0x79f692 === "shape") {
      this._draft = {
        type: _0x79f692 === "shape" ? "shape" : _0x79f692,
        color: _0x46157b,
        colorName: _0x5b2b54,
        sizeWorld: _0x203df3,
        opacity: _0x3e3167.opacity,
        dash: _0x3e3167.dash,
        x1: _0x2e0920.x,
        y1: _0x2e0920.y,
        x2: _0x2e0920.x,
        y2: _0x2e0920.y
      };
      if (_0x79f692 === "rect") {
        this._draft.fill = _0x3e3167.fill;
      } else if (_0x79f692 === "shape") {
        this._draft.shapeType = this._view.shapeType || WHITEBOARD_DEFAULT_SHAPE_TYPE;
        this._draft.fill = _0x3e3167.fill;
      } else {
        this._draft.bend = 0;
        this._draft.elbowOffset = 0;
        this._draft.arrowKind = _0x3e3167.arrowKind;
        this._draft.arrowStart = _0x3e3167.arrowStart;
        this._draft.arrowEnd = _0x3e3167.arrowEnd;
      }
    } else {
      this._draft = {
        type: "brush",
        color: _0x46157b,
        colorName: _0x5b2b54,
        sizeWorld: _0x203df3,
        opacity: _0x3e3167.opacity,
        points: [_0x2e0920]
      };
    }
    _0x242a0a.down = true;
    _0x242a0a.pointerId = _0x94d2df.pointerId;
    _0x242a0a.mode = "draw";
    this._capturePointer(_0x94d2df.pointerId);
    this._render();
    return true;
  }
  _moveDraft(_0x3ebd50) {
    const _0xb62c6a = this._pointerState;
    const _0x2717a3 = _0xb62c6a.down === true && (_0xb62c6a.mode === "erase-layers" || _0xb62c6a.mode === "draw" && this._draft?.type === "brush" && _0x3ebd50.shiftKey !== true);
    const _0x207b77 = _0x2717a3 ? getPointerEventSamples(_0x3ebd50) : [_0x3ebd50];
    const _0x41b472 = _0x207b77.map(_0x19973e => this._getLocalFromClient(_0x19973e.clientX, _0x19973e.clientY));
    const _0x511e87 = _0x207b77[_0x207b77.length - 1] || _0x3ebd50;
    const _0x532cdf = _0x41b472[_0x41b472.length - 1];
    const _0x2ae8bb = this._getCanvasPointFromClient(_0x511e87.clientX, _0x511e87.clientY);
    if (_0xb62c6a.down && _0xb62c6a.mode === "pan") {
      const _0x2ae331 = _0xb62c6a.panStart || _0x2ae8bb;
      const _0x47581a = _0xb62c6a.panView || this._getViewport();
      this._setCamera({
        x: _0x47581a.x - (_0x2ae8bb.x - _0x2ae331.x) / _0x47581a.zoom,
        y: _0x47581a.y - (_0x2ae8bb.y - _0x2ae331.y) / _0x47581a.zoom,
        zoom: _0x47581a.zoom
      }, {
        scheduleSave: false
      });
      return;
    }
    if (_0xb62c6a.down && _0xb62c6a.mode === "erase-layers") {
      const _0xe833ac = clampImageBrushSize(this._style?.size || this._view.brushSizePx) / this._getViewport().zoom;
      let _0x2750d2 = _0xb62c6a.eraseLast || _0x41b472[0] || _0x532cdf;
      _0x41b472.forEach(_0xaee33b => {
        this._collectLayerEraseHits(_0x2750d2, _0xaee33b, _0xe833ac / 2);
        this._appendLayerEraseTrailPoint(_0xaee33b);
        _0x2750d2 = _0xaee33b;
      });
      _0xb62c6a.eraseLast = _0x2750d2;
      this._scheduleLayerEraserPreviewRender();
      return;
    }
    if (_0xb62c6a.down && _0xb62c6a.layerTransform) {
      this._moveLayerTransform(_0x532cdf);
      return;
    }
    if (_0xb62c6a.down && _0xb62c6a.textTransform) {
      this._moveTextTransform(_0x532cdf);
      return;
    }
    if (_0xb62c6a.down && _0xb62c6a.arrowTransform) {
      this._moveArrowTransform(_0x532cdf, {
        snapAngle: _0x3ebd50.shiftKey === true
      });
      return;
    }
    if (!_0xb62c6a.down || !this._draft) {
      return;
    }
    if (this._draft.type === "rect" || this._draft.type === "arrow" || this._draft.type === "shape") {
      const _0x2b9b13 = _0x3ebd50.shiftKey === true && (this._draft.type === "arrow" || this._draft.type === "shape" && this._draft.shapeType === "line");
      const _0x408b84 = _0x2b9b13 ? snapWhiteboardPointToAngle({
        x: this._draft.x1,
        y: this._draft.y1
      }, _0x532cdf) : _0x532cdf;
      this._draft.x2 = _0x408b84.x;
      this._draft.y2 = _0x408b84.y;
      if (this._draft.type === "arrow") {
        const _0x192048 = Math.hypot(this._draft.x2 - this._draft.x1, this._draft.y2 - this._draft.y1);
        this._draft.bend = this._draft.arrowKind === "arc" ? Math.max(12, _0x192048 * 0.18) : 0;
      }
    } else {
      const _0x219644 = this._draft.points[this._draft.points.length - 1];
      if (this._draft.type === "brush" && _0x3ebd50.shiftKey === true) {
        const _0x1f9409 = this._draft.points[0] || _0x532cdf;
        this._draft.points = [_0x1f9409, snapWhiteboardPointToAngle(_0x1f9409, _0x532cdf)];
      } else {
        _0x41b472.forEach(_0x177a6a => {
          const _0x358d60 = this._draft.points[this._draft.points.length - 1];
          if (!_0x358d60 || _0x177a6a.x !== _0x358d60.x || _0x177a6a.y !== _0x358d60.y) {
            this._draft.points.push(_0x177a6a);
          }
        });
      }
      if (this._draft.type === "eraser" && clampOpacity(this._draft.opacity) >= 1 && _0x219644 && this._drawEraserDraftSegment(_0x219644, _0x532cdf)) {
        return;
      }
    }
    this._render();
  }
  _drawEraserDraftSegment(_0xf0f3ce, _0x3be08c) {
    if (!this.canvasEl || !this._draft) {
      return false;
    }
    const _0x58ab3d = this.canvasEl.getContext("2d");
    if (!_0x58ab3d) {
      return false;
    }
    const _0x295e2a = this._getViewport();
    const _0x14a069 = [_0xf0f3ce, _0x3be08c].map(_0x2579ac => getScreenPointFromWorld(_0x2579ac, _0x295e2a));
    _0x58ab3d.save();
    const _0x594dfd = drawRoundBrushStroke(_0x58ab3d, {
      points: _0x14a069,
      lineWidth: getEraserClearLineWidth(getBrushLineWidth(this._draft.sizeWorld, _0x295e2a.zoom, "eraser")),
      strokeStyle: "black",
      fillStyle: "black",
      globalCompositeOperation: "destination-out"
    });
    _0x58ab3d.restore();
    return _0x594dfd;
  }
  _moveTextTransform(_0x425f13) {
    const _0x1ccedb = this._pointerState;
    const _0x290fb2 = _0x1ccedb.textTransform;
    const _0x19fbeb = this._commands[_0x290fb2.index];
    if (_0x19fbeb?.type !== "text") {
      return;
    }
    const _0x4c2a99 = this._worldToScreen(_0x425f13);
    if (_0x290fb2.mode === "move") {
      _0x19fbeb.x = _0x425f13.x - _0x290fb2.offsetWorldX;
      _0x19fbeb.y = _0x425f13.y - _0x290fb2.offsetWorldY;
    } else if (_0x290fb2.mode === "scale-x" || _0x290fb2.mode === "scale-y") {
      const _0x565f36 = resolveAxisTextScale(_0x290fb2, _0x4c2a99);
      _0x19fbeb.scale = undefined;
      _0x19fbeb.scaleX = _0x565f36.scaleX;
      _0x19fbeb.scaleY = _0x565f36.scaleY;
      const _0x92077 = this._screenToWorld(_0x565f36.originPx);
      _0x19fbeb.x = _0x92077.x;
      _0x19fbeb.y = _0x92077.y;
    } else if (_0x290fb2.mode === "scale-uniform") {
      if (_0x290fb2.centerBased) {
        const _0x28712b = Math.hypot(_0x4c2a99.x - _0x290fb2.centerPx.x, _0x4c2a99.y - _0x290fb2.centerPx.y);
        const _0x13911d = _0x28712b / _0x290fb2.startDistance;
        const _0x4b124c = Number.isFinite(_0x13911d) && _0x13911d > 0 ? _0x13911d : 1;
        const _0x4cf2bc = clampTextScale(_0x290fb2.baseScaleX * _0x4b124c);
        const _0x21d094 = clampTextScale(_0x290fb2.baseScaleY * _0x4b124c);
        const _0x27c4fc = getTextAnchorForCenter({
          centerPx: _0x290fb2.centerPx,
          layoutWidth: _0x290fb2.layoutWidth,
          layoutHeight: _0x290fb2.layoutHeight,
          scaleX: _0x4cf2bc,
          scaleY: _0x21d094,
          rotation: _0x290fb2.rotation
        });
        const _0x59e7b2 = this._screenToWorld(_0x27c4fc);
        _0x19fbeb.scale = undefined;
        _0x19fbeb.scaleX = _0x4cf2bc;
        _0x19fbeb.scaleY = _0x21d094;
        _0x19fbeb.x = _0x59e7b2.x;
        _0x19fbeb.y = _0x59e7b2.y;
      } else {
        const _0x5abb35 = toTextLocalTransformSpace(_0x4c2a99, _0x290fb2.originPx, _0x290fb2.rotation);
        const _0x535ed5 = _0x5abb35.x / _0x290fb2.baseWidthPx;
        const _0x38c89f = _0x5abb35.y / _0x290fb2.baseHeightPx;
        const _0x10876c = Math.max(_0x535ed5, _0x38c89f);
        const _0x1ca537 = Number.isFinite(_0x10876c) && _0x10876c > 0 ? _0x10876c : 1;
        _0x19fbeb.scale = undefined;
        _0x19fbeb.scaleX = clampTextScale(_0x290fb2.baseScaleX * _0x1ca537);
        _0x19fbeb.scaleY = clampTextScale(_0x290fb2.baseScaleY * _0x1ca537);
        const _0x366b40 = this._screenToWorld(_0x290fb2.originPx);
        _0x19fbeb.x = _0x366b40.x;
        _0x19fbeb.y = _0x366b40.y;
      }
    } else if (_0x290fb2.mode === "rotate") {
      const _0x1be198 = Math.atan2(_0x4c2a99.y - _0x290fb2.centerPx.y, _0x4c2a99.x - _0x290fb2.centerPx.x);
      const _0x31921c = _0x290fb2.baseRotation + (_0x1be198 - _0x290fb2.baseAngle);
      _0x19fbeb.rotation = _0x31921c;
      const {
        scaleX: _0x46e313,
        scaleY: _0x47c783
      } = _0x290fb2.baseScaleX && _0x290fb2.baseScaleY ? {
        scaleX: _0x290fb2.baseScaleX,
        scaleY: _0x290fb2.baseScaleY
      } : getTextScalePair(_0x19fbeb);
      const _0x470baf = this._screenToWorld(getTextAnchorForCenter({
        centerPx: _0x290fb2.centerPx,
        layoutWidth: _0x290fb2.layoutWidth,
        layoutHeight: _0x290fb2.layoutHeight,
        scaleX: _0x46e313,
        scaleY: _0x47c783,
        rotation: _0x31921c
      }));
      _0x19fbeb.x = _0x470baf.x;
      _0x19fbeb.y = _0x470baf.y;
    }
    this._selectedTextCommandIndex = _0x290fb2.index;
    this._selectedCommandIndex = _0x290fb2.index;
    this._render();
  }
  _findSelectedLayerTransformHandle(_0x49a3ab) {
    const _0x5d8bde = this._selectedCommandIndex;
    const _0x475ded = Number.isInteger(_0x5d8bde) ? this._commands[_0x5d8bde] : null;
    if (!isWhiteboardLayerTransformable(_0x475ded) || _0x475ded.type === "arrow") {
      return null;
    }
    const _0x6a8fc0 = getWhiteboardLayerTransformHandleAtPoint(_0x475ded, _0x49a3ab, {
      zoom: this._getViewport().zoom
    });
    if (_0x6a8fc0) {
      return {
        ..._0x6a8fc0,
        index: _0x5d8bde
      };
    } else {
      return null;
    }
  }
  _moveLayerTransform(_0x4448fa) {
    const _0xdd08d8 = this._pointerState?.layerTransform;
    const _0x14ce13 = Number.isInteger(_0xdd08d8?.index) ? this._commands[_0xdd08d8.index] : null;
    if (!_0x14ce13) {
      return;
    }
    applyWhiteboardLayerTransform(_0x14ce13, _0xdd08d8, _0x4448fa);
    this._selectedCommandIndex = _0xdd08d8.index;
    this._selectedTextCommandIndex = null;
    this._render();
  }
  _findSelectedArrowHandleHit(_0x3e51ec) {
    const _0x12e989 = this._selectedCommandIndex;
    const _0x4c01f8 = Number.isInteger(_0x12e989) ? this._commands[_0x12e989] : null;
    if (_0x4c01f8?.type !== "arrow") {
      return null;
    }
    const _0x3a2a07 = this._getViewport();
    const _0x2e55c6 = WHITEBOARD_ARROW_HANDLE_SCREEN_RADIUS / _0x3a2a07.zoom;
    const _0x32a4b3 = getArrowGeometry(_0x4c01f8);
    const _0x2d4c7c = [{
      handle: "start",
      point: _0x32a4b3.start
    }, {
      handle: "end",
      point: _0x32a4b3.end
    }, {
      handle: "middle",
      point: _0x32a4b3.middle
    }];
    for (const _0x21944f of _0x2d4c7c) {
      const _0x5974b6 = Math.hypot(getFiniteNumber(_0x3e51ec?.x) - _0x21944f.point.x, getFiniteNumber(_0x3e51ec?.y) - _0x21944f.point.y);
      if (_0x5974b6 <= _0x2e55c6) {
        return {
          index: _0x12e989,
          handle: _0x21944f.handle
        };
      }
    }
    return null;
  }
  _moveArrowTransform(_0x2fdcf9, {
    snapAngle = false
  } = {}) {
    const _0x2b2b75 = this._pointerState?.arrowTransform;
    const _0xe5a729 = Number.isInteger(_0x2b2b75?.index) ? this._commands[_0x2b2b75.index] : null;
    if (_0xe5a729?.type !== "arrow") {
      return;
    }
    if (_0x2b2b75.type === "handle") {
      if (_0x2b2b75.handle === "middle") {
        if (_0xe5a729.arrowKind === "elbow") {
          _0xe5a729.elbowOffset = getArrowElbowOffsetFromPoint(_0xe5a729, _0x2fdcf9);
        } else {
          _0xe5a729.arrowKind = "arc";
          _0xe5a729.bend = getArrowBendFromPoint(_0xe5a729, _0x2fdcf9);
        }
      } else if (_0x2b2b75.handle === "start") {
        const _0x86db12 = snapAngle ? snapWhiteboardPointToAngle({
          x: _0xe5a729.x2,
          y: _0xe5a729.y2
        }, _0x2fdcf9) : _0x2fdcf9;
        _0xe5a729.x1 = getFiniteNumber(_0x86db12?.x);
        _0xe5a729.y1 = getFiniteNumber(_0x86db12?.y);
      } else {
        const _0x8b077f = snapAngle ? snapWhiteboardPointToAngle({
          x: _0xe5a729.x1,
          y: _0xe5a729.y1
        }, _0x2fdcf9) : _0x2fdcf9;
        _0xe5a729.x2 = getFiniteNumber(_0x8b077f?.x);
        _0xe5a729.y2 = getFiniteNumber(_0x8b077f?.y);
      }
      _0x2b2b75.moved = true;
    } else if (_0x2b2b75.type === "move") {
      const _0x3b4fec = getFiniteNumber(_0x2fdcf9?.x) - getFiniteNumber(_0x2b2b75.start?.x);
      const _0x4d2d08 = getFiniteNumber(_0x2fdcf9?.y) - getFiniteNumber(_0x2b2b75.start?.y);
      _0xe5a729.x1 = getFiniteNumber(_0x2b2b75.base?.x1) + _0x3b4fec;
      _0xe5a729.y1 = getFiniteNumber(_0x2b2b75.base?.y1) + _0x4d2d08;
      _0xe5a729.x2 = getFiniteNumber(_0x2b2b75.base?.x2) + _0x3b4fec;
      _0xe5a729.y2 = getFiniteNumber(_0x2b2b75.base?.y2) + _0x4d2d08;
      _0x2b2b75.moved = Math.hypot(_0x3b4fec, _0x4d2d08) > 0.01;
    }
    this._selectedCommandIndex = _0x2b2b75.index;
    this._selectedTextCommandIndex = null;
    this._render();
  }
  _capturePointer(_0xa3298) {
    if (_0xa3298 == null || !this.canvasEl?.setPointerCapture) {
      return;
    }
    try {
      this.canvasEl.setPointerCapture(_0xa3298);
    } catch {}
  }
  _releasePointerCapture(_0x3bf69d = this._pointerState?.pointerId) {
    if (_0x3bf69d == null || !this.canvasEl?.releasePointerCapture) {
      return;
    }
    try {
      if (typeof this.canvasEl.hasPointerCapture === "function" && !this.canvasEl.hasPointerCapture(_0x3bf69d)) {
        return;
      }
      this.canvasEl.releasePointerCapture(_0x3bf69d);
    } catch {}
  }
  _endDraft({
    releaseCapture = true
  } = {}) {
    const _0x40f2a8 = this._pointerState;
    const _0x5e9230 = _0x40f2a8.pointerId;
    if (releaseCapture) {
      this._releasePointerCapture(_0x5e9230);
    }
    if (_0x40f2a8.down && _0x40f2a8.mode === "pan") {
      _0x40f2a8.down = false;
      _0x40f2a8.pointerId = null;
      _0x40f2a8.mode = null;
      _0x40f2a8.panStart = null;
      _0x40f2a8.panView = null;
      _0x40f2a8.previousTool = null;
      _0x40f2a8.temporaryTool = null;
      _0x40f2a8.textTransform = null;
      _0x40f2a8.arrowTransform = null;
      _0x40f2a8.layerTransform = null;
      this._temporaryTool = resolveModifierTemporaryTool(this._modifierState);
      this._syncCursor();
      this._scheduleSave();
      return;
    }
    if (_0x40f2a8.down && _0x40f2a8.mode === "erase-layers") {
      _0x40f2a8.down = false;
      _0x40f2a8.pointerId = null;
      _0x40f2a8.mode = null;
      _0x40f2a8.panStart = null;
      _0x40f2a8.panView = null;
      _0x40f2a8.previousTool = null;
      _0x40f2a8.temporaryTool = null;
      _0x40f2a8.textTransform = null;
      _0x40f2a8.arrowTransform = null;
      _0x40f2a8.layerTransform = null;
      this._temporaryTool = resolveModifierTemporaryTool(this._modifierState);
      this._commitLayerErase();
      this._syncCursor();
      return;
    }
    if (_0x40f2a8.down && _0x40f2a8.layerTransform) {
      const _0x10b92d = _0x40f2a8.layerTransform.moved === true;
      _0x40f2a8.down = false;
      _0x40f2a8.pointerId = null;
      _0x40f2a8.mode = null;
      _0x40f2a8.layerTransform = null;
      _0x40f2a8.textTransform = null;
      _0x40f2a8.arrowTransform = null;
      _0x40f2a8.previousTool = null;
      _0x40f2a8.temporaryTool = null;
      _0x40f2a8.panStart = null;
      _0x40f2a8.panView = null;
      this._temporaryTool = resolveModifierTemporaryTool(this._modifierState);
      if (_0x10b92d) {
        this._redoStack = [];
        this._markDirty();
      } else {
        this._syncToolbarState();
        this._render();
      }
      return;
    }
    if (_0x40f2a8.down && _0x40f2a8.textTransform) {
      _0x40f2a8.down = false;
      _0x40f2a8.pointerId = null;
      _0x40f2a8.mode = null;
      _0x40f2a8.textTransform = null;
      _0x40f2a8.arrowTransform = null;
      _0x40f2a8.layerTransform = null;
      _0x40f2a8.previousTool = null;
      _0x40f2a8.temporaryTool = null;
      this._temporaryTool = resolveModifierTemporaryTool(this._modifierState);
      this._redoStack = [];
      this._markDirty();
      return;
    }
    if (_0x40f2a8.down && _0x40f2a8.arrowTransform) {
      const _0xd23d1d = _0x40f2a8.arrowTransform.moved === true;
      _0x40f2a8.down = false;
      _0x40f2a8.pointerId = null;
      _0x40f2a8.mode = null;
      _0x40f2a8.textTransform = null;
      _0x40f2a8.arrowTransform = null;
      _0x40f2a8.layerTransform = null;
      _0x40f2a8.previousTool = null;
      _0x40f2a8.temporaryTool = null;
      _0x40f2a8.panStart = null;
      _0x40f2a8.panView = null;
      this._temporaryTool = resolveModifierTemporaryTool(this._modifierState);
      if (_0xd23d1d) {
        this._redoStack = [];
        this._markDirty();
      } else {
        this._syncToolbarState();
        this._render();
      }
      return;
    }
    if (!_0x40f2a8.down || !this._draft) {
      return;
    }
    const _0x374b95 = this._draft;
    this._draft = null;
    _0x40f2a8.down = false;
    _0x40f2a8.pointerId = null;
    _0x40f2a8.mode = null;
    const _0x1d36b1 = _0x40f2a8.previousTool;
    _0x40f2a8.previousTool = null;
    _0x40f2a8.temporaryTool = null;
    _0x40f2a8.textTransform = null;
    _0x40f2a8.arrowTransform = null;
    _0x40f2a8.layerTransform = null;
    _0x40f2a8.panStart = null;
    _0x40f2a8.panView = null;
    _0x40f2a8.eraseLast = null;
    _0x40f2a8.eraseIndices = null;
    _0x40f2a8.eraseTrail = null;
    this._temporaryTool = resolveModifierTemporaryTool(this._modifierState);
    if (shouldDiscardStrokeCommand(_0x374b95)) {
      this._syncCursor(_0x1d36b1 || undefined, this._view.brushSizePx);
      this._render();
      return;
    }
    if (_0x374b95.type === "rect" || _0x374b95.type === "arrow" || _0x374b95.type === "shape") {
      const _0x56b1b2 = Math.abs(_0x374b95.x2 - _0x374b95.x1);
      const _0xcc7ee7 = Math.abs(_0x374b95.y2 - _0x374b95.y1);
      if (_0x56b1b2 < 0.5 && _0xcc7ee7 < 0.5) {
        this._syncCursor(_0x1d36b1 || undefined, this._view.brushSizePx);
        this._render();
        return;
      }
    }
    this._commands.push(_0x374b95);
    if (_0x374b95.type === "rect" || _0x374b95.type === "arrow" || _0x374b95.type === "shape") {
      this._selectedCommandIndex = this._commands.length - 1;
      this._selectedTextCommandIndex = null;
    } else {
      this._selectedCommandIndex = null;
      this._selectedTextCommandIndex = null;
    }
    this._redoStack = [];
    this._syncCursor(_0x1d36b1 || undefined, this._view.brushSizePx);
    this._markDirty();
  }
  _onCanvasWheel(_0x34a614) {
    if (!this._isEditing) {
      return;
    }
    _0x34a614.preventDefault();
    _0x34a614.stopPropagation();
    this._removeTextInput(true);
    const _0xb3c1b0 = this._getCanvasPointFromClient(_0x34a614.clientX, _0x34a614.clientY);
    this._cursorLast = _0xb3c1b0;
    const _0x5db98b = this._screenToWorld(_0xb3c1b0);
    const _0x4ea5fc = this._getViewport();
    const _0x53278f = clampWhiteboardZoom(_0x4ea5fc.zoom * Math.exp(-(Number(_0x34a614.deltaY) || 0) * WHITEBOARD_ZOOM_WHEEL_SPEED));
    this._setCamera({
      x: _0x5db98b.x - _0xb3c1b0.x / _0x53278f,
      y: _0x5db98b.y - _0xb3c1b0.y / _0x53278f,
      zoom: _0x53278f
    });
  }
  _handleKeyDown(_0x5c4c74) {
    if (!this._isEditing) {
      return;
    }
    if (isTypingField(_0x5c4c74.target)) {
      return;
    }
    const _0x4b9a21 = String(_0x5c4c74.key || "").toLowerCase();
    const _0x454722 = _0x5c4c74.ctrlKey || _0x5c4c74.metaKey;
    const _0x5445a2 = _0x454722 && !_0x5c4c74.altKey && _0x4b9a21 === "z" ? _0x5c4c74.shiftKey ? "redo" : "undo" : _0x454722 && !_0x5c4c74.altKey && !_0x5c4c74.shiftKey && _0x4b9a21 === "y" ? "redo" : "";
    if (_0x5445a2) {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      _0x5c4c74.stopImmediatePropagation?.();
      if (_0x5445a2 === "undo") {
        this._undo();
      } else {
        this._redo();
      }
      return;
    }
    if (_0x5c4c74.key === "Escape") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._setEditing(false);
      return;
    }
    if (_0x5c4c74.key === "Enter") {
      const _0x33e9e6 = this._selectedCommandIndex;
      if (Number.isInteger(_0x33e9e6) && this._commands[_0x33e9e6]?.type === "text") {
        _0x5c4c74.preventDefault();
        _0x5c4c74.stopPropagation();
        this._editTextCommand(_0x33e9e6);
        return;
      }
    }
    if (_0x5c4c74.key === "Control" || _0x5c4c74.code === "ControlLeft" || _0x5c4c74.code === "ControlRight") {
      _0x5c4c74.stopPropagation();
      this._modifierState ||= {
        space: false,
        control: false
      };
      this._modifierState.control = true;
      if (!this._pointerState?.down) {
        syncModifierTemporaryTool(this);
      }
      return;
    }
    if (_0x5c4c74.altKey || _0x5c4c74.ctrlKey || _0x5c4c74.metaKey) {
      return;
    }
    if (_0x5c4c74.key === " " || _0x5c4c74.code === "Space") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      if (!_0x5c4c74.repeat && !this._pointerState?.down) {
        this._modifierState ||= {
          space: false,
          control: false
        };
        this._modifierState.space = true;
        syncModifierTemporaryTool(this);
      }
      return;
    }
    if (_0x4b9a21 === "t") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._setTool("text");
      return;
    }
    if (_0x4b9a21 === "v") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._setTool("select");
      return;
    }
    if (_0x4b9a21 === "b") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._setTool("brush");
      return;
    }
    if (_0x4b9a21 === "e") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._setTool("eraser");
      return;
    }
    if (_0x4b9a21 === "a") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._setTool("arrow");
      return;
    }
    if (_0x4b9a21 === "r") {
      _0x5c4c74.preventDefault();
      _0x5c4c74.stopPropagation();
      this._clear();
      return;
    }
    if (_0x4b9a21 !== "d" && _0x5c4c74.key !== "Delete" && _0x5c4c74.key !== "Backspace") {
      return;
    }
    _0x5c4c74.preventDefault();
    _0x5c4c74.stopPropagation();
    const _0x3a6b2d = this._selectedCommandIndex;
    if (!Number.isInteger(_0x3a6b2d) || !this._commands[_0x3a6b2d]) {
      return;
    }
    this._deleteSelectedCommand();
  }
  _handleKeyUp(_0x2b0726) {
    if (!this._isEditing || isTypingField(_0x2b0726.target)) {
      return;
    }
    const _0x388cbd = _0x2b0726.key === "Control" || _0x2b0726.code === "ControlLeft" || _0x2b0726.code === "ControlRight";
    const _0x4eb040 = _0x2b0726.key === " " || _0x2b0726.code === "Space";
    if (!_0x388cbd && !_0x4eb040) {
      return;
    }
    if (_0x4eb040) {
      _0x2b0726.preventDefault();
    }
    _0x2b0726.stopPropagation();
    this._modifierState ||= {
      space: false,
      control: false
    };
    if (_0x388cbd) {
      this._modifierState.control = false;
    }
    if (_0x4eb040) {
      this._modifierState.space = false;
    }
    if (!this._pointerState?.down) {
      syncModifierTemporaryTool(this);
    }
  }
  _handleOutsidePointerDown(_0x43d4ab) {
    if (!this._isEditing || this.el?.contains?.(_0x43d4ab.target)) {
      return;
    }
    this._setEditing(false);
  }
  _syncCursor(_0x5e687b = this._temporaryTool || this._view.tool || WHITEBOARD_DEFAULT_TOOL, _0x15cf47 = this._style?.size || this._view.brushSizePx || WHITEBOARD_DEFAULT_BRUSH_SIZE_PX) {
    if (!this.cursorEl) {
      return;
    }
    if (_0x5e687b === "hand") {
      this.cursorEl.style.display = "none";
      this.cursorEl.classList.remove("is-erase-brush");
      if (this.canvasEl) {
        this.canvasEl.style.cursor = this._pointerState?.mode === "pan" ? "grabbing" : "grab";
      }
      return;
    }
    if (_0x5e687b === "select") {
      this.cursorEl.style.display = "none";
      this.cursorEl.classList.remove("is-erase-brush");
      if (this.canvasEl) {
        const _0x4f932f = this._pointerState?.mode === "text-transform" ? this._pointerState.textTransform : null;
        const _0x4f07e5 = _0x4f932f ? {
          mode: _0x4f932f.mode,
          handle: _0x4f932f.handle
        } : this._findTextHit(this._cursorWorldLast);
        if (_0x4f07e5) {
          this.canvasEl.style.cursor = this._getTextInteractionCursor(_0x4f07e5);
        } else if (this._pointerState?.mode === "arrow-handle") {
          this.canvasEl.style.cursor = "grabbing";
        } else if (this._pointerState?.mode === "layer-transform") {
          this.canvasEl.style.cursor = this._getLayerTransformCursor(this._pointerState.layerTransform);
        } else if (this._findSelectedArrowHandleHit(this._cursorWorldLast)) {
          this.canvasEl.style.cursor = "grab";
        } else {
          const _0x36351d = this._findSelectedLayerTransformHandle(this._cursorWorldLast);
          if (_0x36351d) {
            this.canvasEl.style.cursor = this._getLayerTransformCursor(_0x36351d);
          } else {
            const _0x3a010a = this._findCommandHit(this._cursorWorldLast);
            const _0x53d7c7 = this._selectedCommandIndex;
            this.canvasEl.style.cursor = Number.isInteger(_0x53d7c7) && _0x3a010a?.index === _0x53d7c7 && isWhiteboardLayerTransformable(this._commands[_0x53d7c7]) ? "move" : getCssVar("--pointer-cursor") || "default";
          }
        }
      }
      return;
    }
    if (_0x5e687b === "rect" || _0x5e687b === "shape") {
      this.cursorEl.style.display = "none";
      this.cursorEl.classList.remove("is-erase-brush");
      if (this.canvasEl) {
        this.canvasEl.style.cursor = "crosshair";
      }
      return;
    }
    if (_0x5e687b === "arrow") {
      this.cursorEl.style.display = "none";
      this.cursorEl.classList.remove("is-erase-brush");
      if (this.canvasEl) {
        const _0x1896e9 = this._pointerState?.mode === "arrow-handle";
        const _0x593ee9 = this._findSelectedArrowHandleHit(this._cursorWorldLast);
        this.canvasEl.style.cursor = _0x1896e9 ? "grabbing" : _0x593ee9 ? "grab" : "crosshair";
      }
      return;
    }
    if (_0x5e687b === "text") {
      this.cursorEl.style.display = "none";
      this.cursorEl.classList.remove("is-erase-brush");
      this._syncTextToolCursor();
      return;
    }
    syncCircularBrushCursor({
      cursorEl: this.cursorEl,
      canvasEl: this.canvasEl,
      visible: this._cursorHover,
      tool: _0x5e687b,
      allowedTools: ["brush", "eraser", "bucket", "number-label"],
      sizePx: Math.max(2, _0x15cf47),
      cursorLast: this._cursorLast,
      isEraseBrush: _0x5e687b === "eraser"
    });
  }
  _syncTextToolCursor() {
    if (!this.canvasEl) {
      return;
    }
    const _0x3e9ddc = getCssVar("--pointer-cursor") || "default";
    if (!this._cursorHover) {
      this.canvasEl.style.cursor = _0x3e9ddc;
      return;
    }
    const _0x21b7e2 = this._findTextHit(this._cursorWorldLast);
    if (!_0x21b7e2) {
      this.canvasEl.style.cursor = _0x3e9ddc;
      return;
    }
    this.canvasEl.style.cursor = this._getTextInteractionCursor(_0x21b7e2, {
      moveCursor: "var(--text-cursor)"
    });
  }
  _getTextInteractionCursor(_0x83fbf8, {
    moveCursor = "var(--move-cursor)"
  } = {}) {
    if (_0x83fbf8?.mode === "rotate") {
      return WHITEBOARD_ROTATE_CURSOR;
    }
    if (_0x83fbf8?.mode === "delete" || _0x83fbf8?.mode === "copy") {
      return "var(--link-cursor)";
    }
    if (_0x83fbf8?.mode === "scale-x") {
      return "var(--resize-ew-cursor)";
    }
    if (_0x83fbf8?.mode === "scale-y") {
      return "var(--resize-ns-cursor)";
    }
    if (_0x83fbf8?.mode === "scale-uniform") {
      if (_0x83fbf8.handle === "top-right" || _0x83fbf8.handle === "bottom-left") {
        return "var(--resize-nesw-cursor)";
      } else {
        return "var(--resize-nwse-cursor)";
      }
    }
    return moveCursor;
  }
  _getLayerTransformCursor(_0x5dfa7c) {
    if (_0x5dfa7c?.mode === "rotate") {
      return WHITEBOARD_ROTATE_CURSOR;
    }
    if (_0x5dfa7c?.mode === "scale") {
      if (_0x5dfa7c.id === "ne" || _0x5dfa7c.id === "sw") {
        return "var(--resize-nesw-cursor)";
      } else {
        return "var(--resize-nwse-cursor)";
      }
    }
    return "move";
  }
  _setTool(_0x1062d5) {
    const _0x33b22a = WHITEBOARD_ALLOWED_TOOLS.includes(_0x1062d5) ? _0x1062d5 : WHITEBOARD_DEFAULT_TOOL;
    if (_0x33b22a !== "text") {
      this._removeTextInput(true);
    }
    if (_0x33b22a !== "select" && _0x33b22a !== "text") {
      this._selectedTextCommandIndex = null;
      this._selectedCommandIndex = null;
    }
    this._view.tool = _0x33b22a;
    if (this.shapeMenuEl) {
      this.shapeMenuEl.hidden = true;
    }
    this.moreButtonEl?.setAttribute("aria-expanded", "false");
    this._syncToolbarState();
    this._scheduleSave();
  }
  _setColor(_0x40d849) {
    this._setStyleValue("color", _0x40d849);
  }
  _setBrushSize(_0x56e171) {
    this._setStyleValue("size", _0x56e171);
  }
  _getSelectedCommand() {
    const _0xc151b8 = this._selectedCommandIndex;
    if (!Number.isInteger(_0xc151b8) || _0xc151b8 < 0 || _0xc151b8 >= this._commands.length) {
      return null;
    }
    return this._commands[_0xc151b8] || null;
  }
  _getActiveStyle() {
    const _0x21feb8 = cloneWhiteboardStyle(this._style);
    const _0x1332ec = this._getSelectedCommand();
    if (!_0x1332ec) {
      return _0x21feb8;
    }
    if (COLOR_VAR_MAP[_0x1332ec.colorName]) {
      _0x21feb8.color = _0x1332ec.colorName;
    }
    if (Number.isFinite(Number(_0x1332ec.sizeWorld))) {
      const _0x3e4a21 = clampWhiteboardZoom(this._getViewport?.().zoom);
      _0x21feb8.size = Math.round(normalizeStyleValue("size", Number(_0x1332ec.sizeWorld) * _0x3e4a21));
    }
    ["opacity", "fill", "dash", "font", "textAlign", "arrowKind", "arrowStart", "arrowEnd"].forEach(_0x3aabd0 => {
      if (_0x1332ec[_0x3aabd0] !== undefined && _0x1332ec[_0x3aabd0] !== null) {
        _0x21feb8[_0x3aabd0] = normalizeStyleValue(_0x3aabd0, _0x1332ec[_0x3aabd0]);
      }
    });
    return _0x21feb8;
  }
  _commandSupportsStyle(_0x26b069, _0x21378b) {
    if (!_0x26b069) {
      return false;
    }
    const _0x38484f = getRelevantWhiteboardStyleControls(this._view.tool, _0x26b069);
    if (_0x38484f.includes(_0x21378b)) {
      return true;
    }
    return (_0x21378b === "arrowStart" || _0x21378b === "arrowEnd") && _0x38484f.includes("arrowheads") || _0x21378b === "arrowKind" && _0x38484f.includes("arrow-kind");
  }
  _applyStyleToCommand(_0x527695, _0x5e58f6, _0x29919c) {
    if (!_0x527695) {
      return false;
    }
    if (_0x5e58f6 === "color") {
      _0x527695.colorName = _0x29919c;
      _0x527695.color = getColorCanvas(_0x29919c);
      return true;
    }
    if (_0x5e58f6 === "size") {
      const _0x16a827 = clampWhiteboardZoom(this._getViewport?.().zoom);
      _0x527695.sizeWorld = normalizeStyleValue("size", _0x29919c) / _0x16a827;
      return true;
    }
    if (_0x5e58f6 === "arrowKind") {
      _0x527695.arrowKind = normalizeStyleValue("arrowKind", _0x29919c);
      if (_0x527695.arrowKind === "straight") {
        _0x527695.bend = 0;
      }
      if (_0x527695.arrowKind === "arc" && Math.abs(getFiniteNumber(_0x527695.bend)) < 0.1) {
        _0x527695.bend = Math.max(12, Math.hypot(getFiniteNumber(_0x527695.x2) - getFiniteNumber(_0x527695.x1), getFiniteNumber(_0x527695.y2) - getFiniteNumber(_0x527695.y1)) * 0.18);
      }
      if (_0x527695.arrowKind === "elbow") {
        _0x527695.elbowOffset = 0;
      }
      return true;
    }
    _0x527695[_0x5e58f6] = normalizeStyleValue(_0x5e58f6, _0x29919c);
    return true;
  }
  _setStyleValue(_0x2ced2a, _0x2e99f0) {
    if (!_0x2ced2a) {
      return;
    }
    const _0x3becfd = normalizeStyleValue(_0x2ced2a, _0x2e99f0);
    this._style = cloneWhiteboardStyle({
      ...this._style,
      [_0x2ced2a]: _0x3becfd
    });
    this._view.color = this._style.color;
    this._view.brushSizePx = this._style.size;
    const _0x2957e6 = this._getSelectedCommand();
    const _0x73eddd = _0x2957e6 && this._commandSupportsStyle(_0x2957e6, _0x2ced2a) && this._applyStyleToCommand(_0x2957e6, _0x2ced2a, _0x3becfd);
    this._syncToolbarState();
    if (_0x73eddd) {
      this._redoStack = [];
      this._markDirty();
    } else {
      this._scheduleSave();
    }
  }
  _syncSizePresetState(_0x351ccf = this._getActiveStyle().size) {
    const _0x11c51c = Math.round(clampImageBrushSize(_0x351ccf));
    this.sizePresetButtons?.forEach(_0x5ed33c => {
      const _0x12dbd1 = Number(_0x5ed33c.dataset.sizeValue);
      const _0x28f913 = Number.isFinite(_0x12dbd1) && _0x12dbd1 === _0x11c51c;
      _0x5ed33c.classList.toggle("active", _0x28f913);
      _0x5ed33c.setAttribute("aria-pressed", _0x28f913 ? "true" : "false");
    });
  }
  _syncArrowStyleMenus(_0x213a81) {
    this.arrowheadTriggerButtons?.forEach(_0xd8a883 => {
      const _0x49bb42 = _0xd8a883.dataset.arrowheadTarget;
      const _0x105fdb = WHITEBOARD_ARROWHEAD_OPTIONS.find(_0x4ad270 => _0x4ad270.value === _0x213a81[_0x49bb42]) || WHITEBOARD_ARROWHEAD_OPTIONS[0];
      _0xd8a883.replaceChildren();
      appendIcon(_0xd8a883, _0x105fdb.icon);
      _0xd8a883.classList.toggle("is-start", _0x49bb42 === "arrowStart");
    });
    const _0x557548 = _0x213a81[this._activeArrowheadTarget || "arrowEnd"] || "none";
    this.arrowheadOptionButtons?.forEach(_0x3c1376 => {
      const _0x1f1dd9 = _0x3c1376.dataset.arrowheadValue === _0x557548;
      _0x3c1376.classList.toggle("active", _0x1f1dd9);
      _0x3c1376.setAttribute("aria-checked", _0x1f1dd9 ? "true" : "false");
    });
  }
  _syncToolbarState() {
    const _0x539722 = this._temporaryTool || this._view.tool || WHITEBOARD_DEFAULT_TOOL;
    const _0x2ab2f3 = this._getActiveStyle();
    const _0x51cebe = Math.round(clampImageBrushSize(_0x2ab2f3.size));
    if (this.sizeRangeEl) {
      this.sizeRangeEl.value = String(_0x51cebe);
    }
    if (this.sizeValueEl) {
      this.sizeValueEl.textContent = String(_0x51cebe);
    }
    this.toolButtons?.forEach(_0x22027e => {
      const _0x32ff55 = _0x22027e.dataset.tool === _0x539722;
      _0x22027e.classList.toggle("active", _0x32ff55);
      _0x22027e.setAttribute("aria-pressed", _0x32ff55 ? "true" : "false");
    });
    const _0x5c83b0 = _0x539722 === "rect" || _0x539722 === "shape" || _0x539722 === "number-label";
    this.moreButtonEl?.classList.toggle("active", _0x5c83b0);
    this.moreButtonEl?.setAttribute("aria-pressed", _0x5c83b0 ? "true" : "false");
    this.shapeOptionButtons?.forEach(_0x47c907 => {
      const _0x529f1b = _0x47c907.dataset.shapeTool;
      const _0x4da871 = _0x47c907.dataset.shapeKey;
      const _0x5e80f6 = _0x529f1b === "shape" && _0x539722 === "shape" && _0x4da871 === this._view.shapeType || _0x529f1b === "rect" && _0x539722 === "rect" || _0x529f1b === "number-label" && _0x539722 === "number-label";
      _0x47c907.classList.toggle("active", _0x5e80f6);
      _0x47c907.setAttribute("aria-checked", _0x5e80f6 ? "true" : "false");
    });
    const _0x280917 = _0x2ab2f3.color || WHITEBOARD_DEFAULT_COLOR;
    if (this.colorDotEl) {
      this.colorDotEl.style.setProperty("--whiteboard-color-dot-bg", getColorCss(_0x280917));
      this.colorDotEl.style.setProperty("--whiteboard-color-dot-border", _0x280917 === "black" ? "var(--white-35)" : _0x280917 === "white" ? "var(--white-25)" : "var(--black-20)");
    }
    this.colorButtons?.forEach(_0x52c4b2 => {
      _0x52c4b2.classList.toggle("active", _0x52c4b2.dataset.color === _0x280917);
      _0x52c4b2.setAttribute("aria-pressed", _0x52c4b2.dataset.color === _0x280917 ? "true" : "false");
    });
    this._syncSizePresetState(_0x51cebe);
    this._syncStylePanelState(_0x2ab2f3);
    this._syncCursor(_0x539722, this._style.size);
    if (this.composeButtonEl) {
      this.composeButtonEl.disabled = this._isComposingImageNode === true;
    }
    if (this.backgroundUploadButtonEl) {
      this.backgroundUploadButtonEl.disabled = this._isUploadingBackground === true;
      this.backgroundUploadButtonEl.setAttribute("aria-busy", this._isUploadingBackground ? "true" : "false");
    }
  }
  _getWhiteboardBackgroundSpawnPoint(_0x101423 = {}) {
    const _0x3f693 = a609_0x3d8181.getStateRaw?.().nodes?.[this.id] || this._data || {};
    const _0x104baa = Number(_0x3f693.x);
    const _0x463501 = Number(_0x3f693.y);
    const _0x40ebf4 = Number(_0x3f693.height);
    const _0x5963d5 = Number(_0x101423.width) > 0 ? Number(_0x101423.width) : 300;
    const _0x49f119 = Number(_0x101423.height) > 0 ? Number(_0x101423.height) : 300;
    return {
      x: (Number.isFinite(_0x104baa) ? _0x104baa : 0) - _0x5963d5 - 48,
      y: (Number.isFinite(_0x463501) ? _0x463501 : 0) + ((Number.isFinite(_0x40ebf4) ? _0x40ebf4 : _0x49f119) - _0x49f119) / 2
    };
  }
  async _uploadBackgroundImage(_0x2591a6) {
    if (this._isUploadingBackground || !_0x2591a6) {
      return false;
    }
    if (!String(_0x2591a6.type || "").toLowerCase().startsWith("image/")) {
      globalThis.window?.showToast?.(t("whiteboardNode.background.imageOnly"), "warning");
      return false;
    }
    this._isUploadingBackground = true;
    this._syncToolbarState();
    let _0x48bf51 = false;
    const _0x10356c = this._showPendingBackgroundPreview(_0x2591a6);
    try {
      const _0x1f7635 = this._getWhiteboardBackgroundSpawnPoint();
      const _0x2fb1bc = await processFile(_0x2591a6, _0x1f7635.x, _0x1f7635.y, globalThis.window?.currentProjectId || "default_v2_project", {
        thumbnailDataUrlPromise: _0x10356c.then(_0xf9f908 => _0xf9f908?.thumbnailDataUrl || "")
      });
      if (!_0x2fb1bc || _0x2fb1bc.type !== "source-image") {
        return false;
      }
      const _0x3228c7 = this._getWhiteboardBackgroundSpawnPoint(_0x2fb1bc);
      const _0x3db7c2 = {
        ..._0x2fb1bc,
        x: _0x3228c7.x,
        y: _0x3228c7.y
      };
      a609_0x3d8181.addNode(_0x3db7c2);
      const _0x246dde = addEdgeWithPolicies({
        sourceId: _0x3db7c2.id,
        targetId: this.id
      });
      if (!_0x246dde) {
        a609_0x3d8181.deleteNode(_0x3db7c2.id);
        throw new Error("Failed to connect whiteboard background input.");
      }
      const _0x1bdc20 = this._getWhiteboardBackgroundSpawnPoint(_0x3db7c2);
      a609_0x3d8181.updateNodeData(_0x3db7c2.id, _0x1bdc20);
      a609_0x3d8181.setSelectedNodes([this.id]);
      commit();
      _0x48bf51 = true;
      globalThis.window?._triggerLocalCacheSave?.();
      globalThis.window?.showToast?.(t("whiteboardNode.background.uploadSuccess"), "success");
      return true;
    } catch (_0x59aa98) {
      console.warn("[WhiteboardNode] upload background failed:", _0x59aa98);
      globalThis.window?.showToast?.(t("whiteboardNode.background.uploadFailed"), "error");
      return false;
    } finally {
      if (!_0x48bf51) {
        this._syncBackgroundInputFromStore({
          force: true
        });
      }
      this._isUploadingBackground = false;
      this._syncToolbarState();
    }
  }
  _drawBackgroundImage(_0x2e666e, _0xf2a84c = this._getViewport(), {
    image = this._backgroundImage,
    input = this._backgroundInput
  } = {}) {
    if (!image || !input) {
      return false;
    }
    const _0x511142 = a609_0x3d8181.getStateRaw?.().nodes?.[this.id] || this._data || {};
    const _0x2731ac = (Number(_0x511142.width) || this._canvasCssWidth || WHITEBOARD_DEFAULT_SIZE.width) / WHITEBOARD_DEFAULT_VIEW.zoom;
    const _0x23419d = (Number(_0x511142.height) || this._canvasCssHeight || WHITEBOARD_DEFAULT_SIZE.height) / WHITEBOARD_DEFAULT_VIEW.zoom;
    return drawWhiteboardBackgroundImage({
      ctx: _0x2e666e,
      image: image,
      viewport: _0xf2a84c,
      imageWidth: input.width || image.naturalWidth || image.width,
      imageHeight: input.height || image.naturalHeight || image.height,
      frameWidth: _0x2731ac,
      frameHeight: _0x23419d
    });
  }
  _getWhiteboardOutputSize() {
    this._syncCanvasSize();
    return {
      width: Math.max(1, Math.round(this._canvasCssWidth || this._data.width || 1)),
      height: Math.max(1, Math.round(this._canvasCssHeight || this._data.height || 1))
    };
  }
  _getWhiteboardCompositionOutputSize(_0x129bb9, _0x3839bd = null) {
    const _0x3a0b9a = _0x3839bd || this._getWhiteboardOutputSize?.() || {};
    const _0x1a992e = Math.round(Number(_0x129bb9?.naturalWidth || _0x129bb9?.width || this._backgroundInput?.width || _0x3a0b9a.width) || 0);
    const _0x5ee681 = Math.round(Number(_0x129bb9?.naturalHeight || _0x129bb9?.height || this._backgroundInput?.height || _0x3a0b9a.height) || 0);
    return {
      width: Math.max(1, _0x1a992e),
      height: Math.max(1, _0x5ee681)
    };
  }
  async _loadOriginalBackgroundForComposition() {
    const _0x3dd1fd = this._backgroundInput;
    if (!_0x3dd1fd) {
      return {
        image: null,
        outputSize: null
      };
    }
    const _0x35f233 = Array.from(new Set((_0x3dd1fd.compositionUrls || []).map(_0x101708 => String(_0x101708 || "").trim()).filter(Boolean)));
    for (const _0x59426f of _0x35f233) {
      const _0x55fcfb = await this._loadBackgroundImageElement(_0x59426f);
      if (!_0x55fcfb) {
        continue;
      }
      return {
        image: _0x55fcfb,
        outputSize: this._getWhiteboardCompositionOutputSize(_0x55fcfb, this._getWhiteboardOutputSize?.())
      };
    }
    throw new Error("Failed to load original whiteboard background image.");
  }
  _getWhiteboardOutputSpawnPoint(_0xf4489f) {
    const _0x376648 = a609_0x3d8181.getStateRaw?.().nodes?.[this.id] || this._data || {};
    const _0x1ae711 = Number(_0x376648.x);
    const _0x48363b = Number(_0x376648.y);
    const _0x48e10d = Number(_0x376648.width);
    const _0x158a9c = (Number.isFinite(_0x1ae711) ? _0x1ae711 : 0) + (Number.isFinite(_0x48e10d) ? _0x48e10d : _0xf4489f.width) + 48;
    const _0x5677b1 = Number.isFinite(_0x48363b) ? _0x48363b : 0;
    return {
      x: _0x158a9c,
      y: _0x5677b1
    };
  }
  _renderWhiteboardOutputCanvas(_0x3da13b = this._getWhiteboardOutputSize(), {
    displaySize = _0x3da13b,
    backgroundImage = this._backgroundImage,
    backgroundInput = this._backgroundInput
  } = {}) {
    const _0x973755 = document.createElement("canvas");
    _0x973755.width = _0x3da13b.width;
    _0x973755.height = _0x3da13b.height;
    const _0x7aa9a9 = Math.max(1, Number(displaySize?.width) || 1);
    const _0x2cf612 = Math.max(1, Number(displaySize?.height) || 1);
    _0x973755.style.width = _0x7aa9a9 + "px";
    _0x973755.style.height = _0x2cf612 + "px";
    const _0x206a62 = _0x973755.getContext("2d");
    if (!_0x206a62) {
      return null;
    }
    _0x206a62.save();
    _0x206a62.scale(_0x3da13b.width / _0x7aa9a9, _0x3da13b.height / _0x2cf612);
    const _0x20d4c5 = getCssVar("--canvas-white") || "#fff";
    _0x206a62.fillStyle = _0x20d4c5;
    _0x206a62.fillRect(0, 0, _0x7aa9a9, _0x2cf612);
    this._drawBackgroundImage(_0x206a62, this._getViewport(), {
      image: backgroundImage,
      input: backgroundInput
    });
    renderCommands({
      ctx: _0x206a62,
      viewport: this._getViewport(),
      canvasEl: _0x973755,
      commands: this._commands,
      isDraft: false,
      eraseCheckerPattern: createEraseCheckerboardPattern(_0x206a62, 1),
      getColorCanvas: getColorCanvas,
      fillRegionCache: new Map(),
      numberLabelBackgroundColor: _0x20d4c5
    });
    _0x206a62.restore();
    return _0x973755;
  }
  async _createImageNodeFromWhiteboard() {
    if (this._isComposingImageNode) {
      return false;
    }
    this._isComposingImageNode = true;
    this._syncToolbarState();
    try {
      const _0x2ce651 = this._getWhiteboardOutputSize();
      const _0x4ba95b = await this._loadOriginalBackgroundForComposition();
      const _0x1fb4b1 = _0x4ba95b.outputSize || _0x2ce651;
      const _0x1e1c75 = this._renderWhiteboardOutputCanvas(_0x1fb4b1, {
        displaySize: _0x2ce651,
        backgroundImage: _0x4ba95b.image || this._backgroundImage,
        backgroundInput: this._backgroundInput
      });
      if (!_0x1e1c75) {
        throw new Error("Failed to render whiteboard image.");
      }
      const _0x334857 = await canvasToPngBlob(_0x1e1c75);
      if (!_0x334857) {
        throw new Error("Failed to export whiteboard image.");
      }
      const _0x3a7b8e = "whiteboard-" + Date.now() + ".png";
      const _0x427748 = new File([_0x334857], _0x3a7b8e, {
        type: "image/png"
      });
      const _0x1f1388 = this._getWhiteboardOutputSpawnPoint(_0x2ce651);
      const _0x130c5a = createWhiteboardBackgroundPreviewFromDecodedImage(_0x1e1c75)?.thumbnailDataUrl || "";
      const _0x58a442 = await processFile(_0x427748, _0x1f1388.x, _0x1f1388.y, globalThis.window?.currentProjectId || "default_v2_project", {
        mediaNaturalSize: _0x1fb4b1,
        naturalWidth: _0x1fb4b1.width,
        naturalHeight: _0x1fb4b1.height,
        thumbnailDataUrl: _0x130c5a
      });
      if (!_0x58a442) {
        return false;
      }
      const _0x2691b6 = {
        ..._0x58a442,
        name: "白板合成",
        x: _0x1f1388.x,
        y: _0x1f1388.y,
        width: _0x2ce651.width,
        height: _0x2ce651.height,
        imageWidth: _0x1fb4b1.width,
        imageHeight: _0x1fb4b1.height,
        originalWidth: _0x58a442.originalWidth || _0x1fb4b1.width,
        originalHeight: _0x58a442.originalHeight || _0x1fb4b1.height,
        fixedSize: true,
        needsAutoResize: false
      };
      a609_0x3d8181.addNode(_0x2691b6);
      a609_0x3d8181.setSelectedNodes([_0x2691b6.id]);
      commit();
      window._triggerLocalCacheSave?.();
      window.showToast?.("已合成白板图像", "success");
      return true;
    } catch (_0x49084b) {
      console.warn("[WhiteboardNode] create image node failed:", _0x49084b);
      window.showToast?.("白板合成失败", "error");
      return false;
    } finally {
      this._isComposingImageNode = false;
      this._syncToolbarState();
    }
  }
  _syncStylePanelState(_0x55e0fd = this._getActiveStyle()) {
    const _0x48b6c1 = this._getSelectedCommand();
    const _0x35777c = getRelevantWhiteboardStyleControls(this._view.tool, _0x48b6c1);
    const _0x1a3a89 = new Set(_0x35777c);
    const _0x894163 = _0x1a3a89.size === 0;
    if (this.stylePanelEl) {
      this.stylePanelEl.classList.toggle("is-empty", _0x894163);
      this.stylePanelEl.classList.toggle("is-expanded", !_0x894163);
      this.stylePanelEl.setAttribute("aria-hidden", _0x894163 ? "true" : "false");
      this.stylePanelEl.inert = this._isEditing === false || _0x894163;
    }
    this.styleSections?.forEach(_0x1ddb63 => {
      const _0x40e5ec = _0x1ddb63.dataset.styleControl;
      _0x1ddb63.hidden = !_0x1a3a89.has(_0x40e5ec);
    });
    const _0x5df906 = Math.round(clampOpacity(_0x55e0fd.opacity) * 100);
    if (this.opacityRangeEl) {
      this.opacityRangeEl.value = String(_0x5df906);
    }
    if (this.opacityValueEl) {
      this.opacityValueEl.textContent = "" + _0x5df906;
    }
    this.styleOptionButtons?.forEach(_0x2a0ab9 => {
      const _0x2038e5 = _0x2a0ab9.dataset.styleProp;
      const _0xed7e4a = _0x2a0ab9.dataset.styleValue;
      let _0x408dd3 = false;
      if (_0x2038e5 === "opacity") {
        _0x408dd3 = Math.round(Number(_0xed7e4a) * 100) === _0x5df906;
      } else if (_0x2038e5 === "arrowStart" || _0x2038e5 === "arrowEnd") {
        _0x408dd3 = _0x55e0fd[_0x2038e5] === "arrow";
      } else {
        _0x408dd3 = _0x55e0fd[_0x2038e5] === normalizeStyleValue(_0x2038e5, _0xed7e4a);
      }
      _0x2a0ab9.classList.toggle("active", _0x408dd3);
      _0x2a0ab9.setAttribute("aria-pressed", _0x408dd3 ? "true" : "false");
    });
    this._syncArrowStyleMenus?.(_0x55e0fd);
  }
  _openTextInput(_0x342ee8, _0x2c78f8, {
    commandIndex = null
  } = {}) {
    this._removeTextInput(true);
    const _0x28bddf = Number.isInteger(commandIndex) ? this._commands[commandIndex] : null;
    const _0x1569fe = cloneWhiteboardStyle(this._style);
    const _0x46ec86 = _0x28bddf ? {
      x: Number(_0x28bddf.x) || 0,
      y: Number(_0x28bddf.y) || 0
    } : _0x342ee8;
    const _0x5082db = Number(_0x28bddf?.sizeWorld) || _0x2c78f8;
    const _0x5c8422 = COLOR_VAR_MAP[_0x28bddf?.colorName] ? _0x28bddf.colorName : _0x1569fe.color;
    const _0x5c743a = _0x28bddf?.color || getColorCanvas(_0x5c8422 || WHITEBOARD_DEFAULT_COLOR);
    const _0x55898c = Number.isFinite(Number(_0x28bddf?.opacity)) ? Number(_0x28bddf.opacity) : _0x1569fe.opacity;
    const _0x1005ba = _0x28bddf?.font || _0x1569fe.font;
    const _0x438db7 = this._worldToScreen(_0x46ec86);
    const _0x13708f = _0x1005ba === "serif" ? "serif" : _0x1005ba === "mono" ? "monospace" : "sans-serif";
    const _0x423654 = document.createElement("textarea");
    _0x423654.rows = 1;
    _0x423654.wrap = "off";
    _0x423654.maxLength = WHITEBOARD_TEXT_LIMIT;
    _0x423654.className = "v2-annotate-text-input whiteboard-text-input";
    _0x423654.setAttribute("aria-label", WHITEBOARD_TOOL_LABELS.text);
    _0x423654.dataset.localX = String(_0x46ec86.x);
    _0x423654.dataset.localY = String(_0x46ec86.y);
    _0x423654.dataset.sizeWorld = String(_0x5082db);
    _0x423654.dataset.colorName = _0x5c8422;
    _0x423654.dataset.color = _0x5c743a;
    _0x423654.dataset.opacity = String(_0x55898c);
    _0x423654.dataset.font = _0x1005ba;
    _0x423654.dataset.textAlign = _0x28bddf?.textAlign || "left";
    if (Number.isInteger(commandIndex)) {
      _0x423654.dataset.commandIndex = String(commandIndex);
      _0x423654.value = String(_0x28bddf?.text || "");
    }
    _0x423654.style.left = _0x438db7.x + "px";
    _0x423654.style.top = _0x438db7.y + "px";
    _0x423654.style.fontFamily = _0x13708f;
    _0x423654.style.opacity = String(_0x55898c);
    _0x423654.style.textAlign = _0x423654.dataset.textAlign;
    if (_0x28bddf) {
      const {
        scaleX: _0x433ae9,
        scaleY: _0x439dd1
      } = getTextScalePair(_0x28bddf);
      const _0x159d1d = Number(_0x28bddf.rotation) || 0;
      _0x423654.style.transform = "rotate(" + _0x159d1d + "rad) scale(" + _0x433ae9 + ", " + _0x439dd1 + ")";
    } else {
      _0x423654.classList.add("is-new");
    }
    _0x423654.style.setProperty("--annotate-text-input-size", Math.max(1, _0x5082db * this._getViewport().zoom) + "px");
    _0x423654.style.setProperty("--annotate-text-input-color", _0x423654.dataset.color || getColorCanvas(WHITEBOARD_DEFAULT_COLOR));
    const _0x443795 = _0x492634 => {
      if (_0x423654.dataset.whiteboardTextFinished === "true") {
        return;
      }
      this._removeTextInput(_0x492634, _0x423654);
    };
    _0x423654.addEventListener("pointerdown", _0x5c2c4c => _0x5c2c4c.stopPropagation());
    _0x423654.addEventListener("input", () => this._syncTextInputSize(_0x423654));
    _0x423654.addEventListener("keydown", _0xe7e31d => {
      _0xe7e31d.stopPropagation();
      if (_0xe7e31d.key === "Enter" && !_0xe7e31d.isComposing && (_0xe7e31d.ctrlKey || _0xe7e31d.metaKey)) {
        _0xe7e31d.preventDefault();
        _0x443795(true);
      } else if (_0xe7e31d.key === "Escape") {
        _0xe7e31d.preventDefault();
        _0x443795(false);
      }
    });
    _0x423654.addEventListener("blur", () => _0x443795(true));
    this._canvasWrapEl.appendChild(_0x423654);
    this._textInputEl = _0x423654;
    this._editingTextCommandIndex = Number.isInteger(commandIndex) ? commandIndex : null;
    this._syncTextInputSize(_0x423654);
    this._render();
    requestAnimationFrame(() => {
      if (this._textInputEl !== _0x423654) {
        return;
      }
      _0x423654.focus();
      _0x423654.setSelectionRange(_0x423654.value.length, _0x423654.value.length);
    });
  }
  _syncTextInputSize(_0x3e6f18 = this._textInputEl) {
    if (!_0x3e6f18) {
      return;
    }
    const _0x25e705 = Number(_0x3e6f18.dataset.sizeWorld);
    if (!Number.isFinite(_0x25e705)) {
      return;
    }
    const _0x1c16b3 = this._getTextLayout({
      type: "text",
      text: _0x3e6f18.value || " ",
      sizeWorld: _0x25e705,
      font: _0x3e6f18.dataset.font,
      x: Number(_0x3e6f18.dataset.localX) || 0,
      y: Number(_0x3e6f18.dataset.localY) || 0
    });
    if (!_0x1c16b3) {
      return;
    }
    _0x3e6f18.style.width = Math.ceil(_0x1c16b3.width) + "px";
    _0x3e6f18.style.height = Math.ceil(_0x1c16b3.height) + "px";
    _0x3e6f18.style.setProperty("--whiteboard-text-line-height", _0x1c16b3.lineHeight + "px");
  }
  _editTextCommand(_0x6bff1c) {
    const _0x217c27 = Number(_0x6bff1c);
    const _0x41c097 = this._commands[_0x217c27];
    if (!Number.isInteger(_0x217c27) || _0x41c097?.type !== "text") {
      return false;
    }
    if (this._editingTextCommandIndex === _0x217c27 && this._textInputEl) {
      this._textInputEl.focus();
      return true;
    }
    this._selectedTextCommandIndex = _0x217c27;
    this._selectedCommandIndex = _0x217c27;
    this._openTextInput({
      x: _0x41c097.x,
      y: _0x41c097.y
    }, _0x41c097.sizeWorld, {
      commandIndex: _0x217c27
    });
    return true;
  }
  _removeTextInput(_0x453dfd = true, _0x2762bb = null) {
    const _0x5c5bc4 = _0x2762bb || this._textInputEl;
    if (!_0x5c5bc4) {
      return;
    }
    if (_0x5c5bc4.dataset.whiteboardTextFinished === "true") {
      return;
    }
    _0x5c5bc4.dataset.whiteboardTextFinished = "true";
    const _0x333ed5 = this._textInputEl === _0x5c5bc4;
    const _0x428a7c = String(_0x5c5bc4.value || "").replace(/\r\n?/g, "\n").slice(0, WHITEBOARD_TEXT_LIMIT);
    const _0x416650 = Number(_0x5c5bc4.dataset.localX);
    const _0x2df2f5 = Number(_0x5c5bc4.dataset.localY);
    const _0x98b8a6 = Number(_0x5c5bc4.dataset.sizeWorld);
    const _0x2d354c = String(_0x5c5bc4.dataset.color || "");
    const _0x53cf92 = String(_0x5c5bc4.dataset.colorName || "");
    const _0x559055 = Number(_0x5c5bc4.dataset.opacity);
    const _0x4db9f6 = String(_0x5c5bc4.dataset.font || "");
    const _0x4bb211 = String(_0x5c5bc4.dataset.textAlign || "left");
    const _0x462e3c = _0x5c5bc4.dataset.commandIndex === undefined ? null : Number(_0x5c5bc4.dataset.commandIndex);
    _0x5c5bc4.remove();
    if (_0x333ed5) {
      this._textInputEl = null;
      this._editingTextCommandIndex = null;
    }
    if (!_0x333ed5 || !_0x453dfd || !Number.isFinite(_0x416650) || !Number.isFinite(_0x2df2f5) || !Number.isFinite(_0x98b8a6)) {
      if (_0x333ed5) {
        this._render();
      }
      return;
    }
    if (Number.isInteger(_0x462e3c) && this._commands[_0x462e3c]?.type === "text") {
      if (!_0x428a7c.trim()) {
        this._commands.splice(_0x462e3c, 1);
        this._selectedTextCommandIndex = null;
        this._selectedCommandIndex = null;
      } else {
        this._commands[_0x462e3c] = {
          ...this._commands[_0x462e3c],
          text: _0x428a7c,
          color: _0x2d354c || getColorCanvas(WHITEBOARD_DEFAULT_COLOR),
          colorName: COLOR_VAR_MAP[_0x53cf92] ? _0x53cf92 : WHITEBOARD_DEFAULT_COLOR,
          sizeWorld: _0x98b8a6,
          opacity: normalizeStyleValue("opacity", _0x559055),
          font: normalizeStyleValue("font", _0x4db9f6),
          textAlign: _0x4bb211
        };
        this._selectedTextCommandIndex = _0x462e3c;
        this._selectedCommandIndex = _0x462e3c;
      }
      this._redoStack = [];
      this._markDirty();
      return;
    }
    if (!_0x428a7c.trim()) {
      this._render();
      return;
    }
    const _0x3ca835 = {
      type: "text",
      text: _0x428a7c,
      color: _0x2d354c || getColorCanvas(WHITEBOARD_DEFAULT_COLOR),
      colorName: COLOR_VAR_MAP[_0x53cf92] ? _0x53cf92 : WHITEBOARD_DEFAULT_COLOR,
      sizeWorld: _0x98b8a6,
      opacity: normalizeStyleValue("opacity", _0x559055),
      font: normalizeStyleValue("font", _0x4db9f6),
      x: _0x416650,
      y: _0x2df2f5,
      textAlign: _0x4bb211,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    };
    const _0x500249 = this._getTextLayout(_0x3ca835);
    const _0xafa944 = this._getViewport().zoom || 1;
    if (_0x500249) {
      _0x3ca835.x -= _0x500249.width / (_0xafa944 * 2);
      _0x3ca835.y -= _0x500249.height / (_0xafa944 * 2);
    }
    this._commands.push(_0x3ca835);
    this._selectedTextCommandIndex = this._commands.length - 1;
    this._selectedCommandIndex = this._selectedTextCommandIndex;
    this._redoStack = [];
    this._markDirty();
  }
  _getTextLayout(_0x4541d1) {
    return getTextLayout({
      canvasEl: this.canvasEl,
      cmd: _0x4541d1,
      viewport: this._getViewport(),
      layoutVariant: "whiteboard"
    });
  }
  _getTextGeometry(_0x354b6f) {
    return getTextGeometry({
      canvasEl: this.canvasEl,
      cmd: _0x354b6f,
      viewport: this._getViewport(),
      layoutVariant: "whiteboard"
    });
  }
  _findTextHit(_0x3fe5e1) {
    return findTextHit({
      commands: this._commands,
      selectedTextCommandIndex: this._selectedTextCommandIndex,
      local: _0x3fe5e1,
      viewport: this._getViewport(),
      canvasEl: this.canvasEl,
      controlVariant: "whiteboard"
    });
  }
  _createTextTransformState(_0x5b94ac, _0x4b2972) {
    return createTextTransformState({
      commands: this._commands,
      hit: _0x5b94ac,
      local: _0x4b2972,
      viewport: this._getViewport(),
      canvasEl: this.canvasEl,
      layoutVariant: "whiteboard"
    });
  }
  _deleteTextCommand(_0x4e786f) {
    const _0x50bb83 = Number(_0x4e786f);
    if (!Number.isInteger(_0x50bb83) || this._commands[_0x50bb83]?.type !== "text") {
      return false;
    }
    this._commands.splice(_0x50bb83, 1);
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._redoStack = [];
    this._markDirty();
    return true;
  }
  _deleteSelectedCommand() {
    const _0x4014c7 = this._selectedCommandIndex;
    if (!Number.isInteger(_0x4014c7) || !this._commands[_0x4014c7]) {
      return false;
    }
    this._commands.splice(_0x4014c7, 1);
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._redoStack = [];
    this._markDirty();
    return true;
  }
  _copyTextCommand(_0x5ba369) {
    const _0x532997 = Number(_0x5ba369);
    const _0x3f742c = this._commands[_0x532997];
    if (!Number.isInteger(_0x532997) || _0x3f742c?.type !== "text") {
      return false;
    }
    const _0x579627 = buildCopiedTextCommand(_0x3f742c, this._getViewport());
    this._commands.splice(_0x532997 + 1, 0, _0x579627);
    this._selectedTextCommandIndex = _0x532997 + 1;
    this._selectedCommandIndex = _0x532997 + 1;
    this._redoStack = [];
    this._markDirty();
    return true;
  }
  _addNumberLabel(_0x417282, _0x5c3d53) {
    const _0x47d6f3 = Number(_0x417282?.x);
    const _0x4ee0ff = Number(_0x417282?.y);
    if (!Number.isFinite(_0x47d6f3) || !Number.isFinite(_0x4ee0ff)) {
      return null;
    }
    const _0x23934a = cloneWhiteboardStyle(this._style);
    const _0x3619fb = {
      type: "number-label",
      number: getNextNumberLabelValue(this._commands),
      x: _0x47d6f3,
      y: _0x4ee0ff,
      color: getColorCanvas(_0x23934a.color || WHITEBOARD_DEFAULT_COLOR),
      colorName: _0x23934a.color,
      sizeWorld: _0x5c3d53,
      opacity: _0x23934a.opacity
    };
    this._commands.push(_0x3619fb);
    this._selectedCommandIndex = this._commands.length - 1;
    this._selectedTextCommandIndex = null;
    this._redoStack = [];
    this._markDirty();
    return _0x3619fb;
  }
  _fillArea(_0x260d41) {
    const _0x23698a = cloneWhiteboardStyle(this._style);
    const _0x365303 = {
      type: "fill",
      x: Number(_0x260d41?.x) || 0,
      y: Number(_0x260d41?.y) || 0,
      color: getColorCanvas(_0x23698a.color || WHITEBOARD_DEFAULT_COLOR),
      colorName: _0x23698a.color
    };
    this._commands.push(_0x365303);
    this._selectedCommandIndex = null;
    this._selectedTextCommandIndex = null;
    this._redoStack = [];
    this._markDirty();
  }
  _undo() {
    this._removeTextInput(true);
    if (this._commands.length === 0) {
      return;
    }
    const _0x49b15a = this._commands.pop();
    this._redoStack.push(_0x49b15a);
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._markDirty();
  }
  _redo() {
    this._removeTextInput(true);
    if (this._redoStack.length === 0) {
      return;
    }
    const _0x448904 = this._redoStack.pop();
    this._commands.push(_0x448904);
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._markDirty();
  }
  _clear() {
    this._removeTextInput(false);
    if (this._commands.length === 0 && this._redoStack.length === 0) {
      return;
    }
    this._commands = [];
    this._redoStack = [];
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._markDirty();
  }
  _commandLayerHit(_0x5805b3, _0x30956a, _0x4e47e5, _0x55dbd8) {
    const _0x5c810c = this._commands[_0x5805b3];
    if (!_0x5c810c) {
      return false;
    }
    const _0x4c04cf = Math.max(0, getFiniteNumber(_0x55dbd8));
    const _0x59b2bb = Math.max(0, getFiniteNumber(_0x5c810c.sizeWorld, 1) / 2);
    const _0x2489dd = _0x4c04cf + _0x59b2bb;
    if (_0x5c810c.type === "brush" || _0x5c810c.type === "eraser") {
      return doesSegmentHitPolyline(_0x30956a, _0x4e47e5, _0x5c810c.points, _0x2489dd);
    }
    if (_0x5c810c.type === "rect") {
      const _0x43ad1c = getWhiteboardLayerGeometry(_0x5c810c);
      return Boolean(_0x43ad1c && doesSegmentHitPolygon(_0x30956a, _0x4e47e5, _0x43ad1c.corners, _0x2489dd));
    }
    if (_0x5c810c.type === "shape") {
      const _0x3eb214 = getWhiteboardLayerGeometry(_0x5c810c);
      return Boolean(_0x3eb214 && doesSegmentHitPolygon(_0x30956a, _0x4e47e5, _0x3eb214.corners, _0x2489dd));
    }
    if (_0x5c810c.type === "arrow") {
      const _0x5142a4 = getArrowGeometry(_0x5c810c);
      const _0x272bc2 = _0x5142a4.type === "elbow" ? _0x5142a4.points : [_0x5142a4.start, _0x5142a4.middle, _0x5142a4.end];
      const _0x333583 = _0x272bc2.map(_0xbefdef => _0xbefdef.x);
      const _0x154a95 = _0x272bc2.map(_0x1d69a2 => _0x1d69a2.y);
      const _0x1850df = _0x5142a4.type === "arc" ? {
        x: _0x5142a4.center.x - _0x5142a4.radius,
        y: _0x5142a4.center.y - _0x5142a4.radius,
        width: _0x5142a4.radius * 2,
        height: _0x5142a4.radius * 2
      } : {
        x: Math.min(..._0x333583),
        y: Math.min(..._0x154a95),
        width: Math.max(..._0x333583) - Math.min(..._0x333583),
        height: Math.max(..._0x154a95) - Math.min(..._0x154a95)
      };
      if (!doesSegmentHitBounds(_0x30956a, _0x4e47e5, _0x1850df, _0x2489dd)) {
        return false;
      }
      const _0x536751 = getFiniteNumber(_0x4e47e5?.x) - getFiniteNumber(_0x30956a?.x);
      const _0x3103c8 = getFiniteNumber(_0x4e47e5?.y) - getFiniteNumber(_0x30956a?.y);
      const _0x452b7e = Math.hypot(_0x536751, _0x3103c8) * this._getViewport().zoom;
      const _0x44b444 = Math.max(1, Math.min(512, Math.ceil(_0x452b7e / 4)));
      for (let _0x2d8c18 = 0; _0x2d8c18 <= _0x44b444; _0x2d8c18 += 1) {
        const _0x40845e = _0x2d8c18 / _0x44b444;
        const _0x5a1091 = {
          x: getFiniteNumber(_0x30956a?.x) + _0x536751 * _0x40845e,
          y: getFiniteNumber(_0x30956a?.y) + _0x3103c8 * _0x40845e
        };
        if (getDistanceToArrowPath(_0x5a1091, _0x5c810c) <= _0x2489dd) {
          return true;
        }
      }
      return false;
    }
    if (_0x5c810c.type === "text") {
      const _0x745bc0 = this._getTextGeometry?.(_0x5c810c);
      if (!_0x745bc0?.corners) {
        return false;
      }
      const _0x3bc516 = this._getViewport();
      return doesSegmentHitPolygon(getScreenPointFromWorld(_0x30956a, _0x3bc516), getScreenPointFromWorld(_0x4e47e5, _0x3bc516), _0x745bc0.corners, _0x4c04cf * _0x3bc516.zoom);
    }
    if (_0x5c810c.type === "number-label") {
      return doesSegmentHitCircle(_0x30956a, _0x4e47e5, {
        x: _0x5c810c.x,
        y: _0x5c810c.y
      }, _0x4c04cf + Math.max(_0x59b2bb, 9));
    }
    if (_0x5c810c.type === "fill") {
      return doesSegmentHitCircle(_0x30956a, _0x4e47e5, {
        x: _0x5c810c.x,
        y: _0x5c810c.y
      }, Math.max(_0x4c04cf, 6 / this._getViewport().zoom));
    }
    return false;
  }
  _collectLayerEraseHits(_0x388d0d, _0x46a192, _0x27afb8) {
    const _0x1f64b0 = this._pointerState.eraseIndices || new Set();
    this._pointerState.eraseIndices = _0x1f64b0;
    for (let _0x27128a = 0; _0x27128a < this._commands.length; _0x27128a += 1) {
      if (_0x1f64b0.has(_0x27128a)) {
        continue;
      }
      if (this._commandLayerHit(_0x27128a, _0x388d0d, _0x46a192, _0x27afb8)) {
        _0x1f64b0.add(_0x27128a);
      }
    }
    return _0x1f64b0;
  }
  _appendLayerEraseTrailPoint(_0x5d12a1) {
    const _0x5195a6 = this._pointerState;
    const _0x285f67 = Array.isArray(_0x5195a6.eraseTrail) ? _0x5195a6.eraseTrail : [];
    const _0x4ced1b = {
      x: getFiniteNumber(_0x5d12a1?.x),
      y: getFiniteNumber(_0x5d12a1?.y)
    };
    const _0x3b2dbb = _0x285f67[_0x285f67.length - 1];
    const _0x51c36e = this._getViewport().zoom;
    const _0x169c86 = _0x3b2dbb ? Math.hypot(_0x4ced1b.x - _0x3b2dbb.x, _0x4ced1b.y - _0x3b2dbb.y) * _0x51c36e : Infinity;
    if (_0x169c86 >= 1) {
      _0x285f67.push(_0x4ced1b);
    }
    if (_0x285f67.length > WHITEBOARD_LAYER_ERASER_TRAIL_POINT_LIMIT) {
      _0x285f67.splice(0, _0x285f67.length - WHITEBOARD_LAYER_ERASER_TRAIL_POINT_LIMIT);
    }
    const _0x47f260 = () => _0x285f67.slice(1).reduce((_0x56b87e, _0x3b0ff2, _0x15ab33) => {
      const _0x2a57ce = _0x285f67[_0x15ab33];
      return _0x56b87e + Math.hypot(_0x3b0ff2.x - _0x2a57ce.x, _0x3b0ff2.y - _0x2a57ce.y) * _0x51c36e;
    }, 0);
    while (_0x285f67.length > 2 && _0x47f260() > WHITEBOARD_LAYER_ERASER_TRAIL_MAX_SCREEN_LENGTH) {
      _0x285f67.shift();
    }
    _0x5195a6.eraseTrail = _0x285f67;
    return _0x285f67;
  }
  _scheduleLayerEraserPreviewRender() {
    if (this._layerEraserPreviewRaf) {
      return;
    }
    this._layerEraserPreviewRaf = requestWhiteboardFrame(() => {
      this._layerEraserPreviewRaf = 0;
      if (this._pointerState?.mode === "erase-layers") {
        this._render();
      }
    });
  }
  _cancelLayerEraserPreviewRender() {
    if (!this._layerEraserPreviewRaf) {
      return;
    }
    cancelWhiteboardFrame(this._layerEraserPreviewRaf);
    this._layerEraserPreviewRaf = 0;
  }
  _drawLayerEraserTrail(_0x5e305f, _0x323398) {
    const _0x136fb7 = this._pointerState?.eraseTrail;
    if (!_0x5e305f || !Array.isArray(_0x136fb7) || _0x136fb7.length < 2) {
      return false;
    }
    const _0x2c88a0 = _0x136fb7.map(_0x563b5c => getScreenPointFromWorld(_0x563b5c, _0x323398));
    const _0x29251e = Math.max(3, Math.min(14, clampImageBrushSize(this._style?.size) * 0.5));
    _0x5e305f.save();
    _0x5e305f.globalCompositeOperation = "source-over";
    _0x5e305f.strokeStyle = getColorCanvas(WHITEBOARD_DEFAULT_COLOR);
    _0x5e305f.lineWidth = _0x29251e;
    _0x5e305f.lineCap = "round";
    _0x5e305f.lineJoin = "round";
    _0x5e305f.globalAlpha = 0.14;
    _0x5e305f.beginPath();
    _0x5e305f.moveTo(_0x2c88a0[0].x, _0x2c88a0[0].y);
    if (_0x2c88a0.length === 2 || typeof _0x5e305f.quadraticCurveTo !== "function") {
      _0x2c88a0.slice(1).forEach(_0x5c3a81 => _0x5e305f.lineTo(_0x5c3a81.x, _0x5c3a81.y));
    } else {
      for (let _0x19a2e7 = 1; _0x19a2e7 < _0x2c88a0.length - 1; _0x19a2e7 += 1) {
        const _0xc2452c = _0x2c88a0[_0x19a2e7];
        const _0x5d1aa6 = _0x2c88a0[_0x19a2e7 + 1];
        _0x5e305f.quadraticCurveTo(_0xc2452c.x, _0xc2452c.y, (_0xc2452c.x + _0x5d1aa6.x) / 2, (_0xc2452c.y + _0x5d1aa6.y) / 2);
      }
      const _0x5a5a59 = _0x2c88a0[_0x2c88a0.length - 2];
      const _0xa163cd = _0x2c88a0[_0x2c88a0.length - 1];
      _0x5e305f.quadraticCurveTo(_0x5a5a59.x, _0x5a5a59.y, _0xa163cd.x, _0xa163cd.y);
    }
    _0x5e305f.stroke();
    _0x5e305f.restore();
    return true;
  }
  _commitLayerErase() {
    this._cancelLayerEraserPreviewRender?.();
    const _0x207f64 = this._pointerState.eraseIndices;
    this._pointerState.eraseIndices = null;
    this._pointerState.eraseLast = null;
    this._pointerState.eraseTrail = null;
    if (!(_0x207f64 instanceof Set) || _0x207f64.size === 0) {
      this._render();
      return false;
    }
    this._commands = this._commands.filter((_0x105f5e, _0x2d3602) => !_0x207f64.has(_0x2d3602));
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._redoStack = [];
    this._markDirty();
    return true;
  }
  _findCommandHit(_0x40ca14) {
    const _0x109ded = this._getViewport();
    const _0x1c2714 = Math.max(6 / _0x109ded.zoom, 2);
    for (let _0x306b75 = this._commands.length - 1; _0x306b75 >= 0; _0x306b75 -= 1) {
      const _0x3307c1 = this._commands[_0x306b75];
      if (!_0x3307c1) {
        continue;
      }
      if (_0x3307c1.type === "text") {
        const _0x4adfd3 = this._findTextHit(_0x40ca14);
        if (_0x4adfd3?.index === _0x306b75) {
          return {
            index: _0x306b75
          };
        }
        continue;
      }
      if (_0x3307c1.type === "brush" || _0x3307c1.type === "eraser") {
        const _0x985a1f = _0x1c2714 + Math.max(0, getFiniteNumber(_0x3307c1.sizeWorld, 1) / 2);
        if (doesSegmentHitPolyline(_0x40ca14, _0x40ca14, _0x3307c1.points, _0x985a1f)) {
          return {
            index: _0x306b75
          };
        }
        continue;
      }
      if (_0x3307c1.type === "rect") {
        const _0x233dda = Math.max(_0x1c2714, getFiniteNumber(_0x3307c1.sizeWorld, 1) / 2);
        const _0x3a3893 = getWhiteboardLayerGeometry(_0x3307c1, {
          zoom: _0x109ded.zoom
        });
        if (_0x3a3893 && doesSegmentHitPolygon(_0x40ca14, _0x40ca14, _0x3a3893.corners, _0x233dda)) {
          return {
            index: _0x306b75
          };
        }
        continue;
      }
      if (_0x3307c1.type === "shape") {
        const _0x2c5264 = Math.max(_0x1c2714, getFiniteNumber(_0x3307c1.sizeWorld, 1) / 2);
        const _0x6e04b7 = getWhiteboardLayerGeometry(_0x3307c1, {
          zoom: _0x109ded.zoom
        });
        if (_0x6e04b7 && doesSegmentHitPolygon(_0x40ca14, _0x40ca14, _0x6e04b7.corners, _0x2c5264)) {
          return {
            index: _0x306b75
          };
        }
        continue;
      }
      if (_0x3307c1.type === "arrow") {
        const _0x23ed2a = Math.max(_0x1c2714, getFiniteNumber(_0x3307c1.sizeWorld, 1) / 2);
        const _0x2781fe = getDistanceToArrowPath(_0x40ca14, _0x3307c1);
        if (_0x2781fe <= _0x23ed2a) {
          return {
            index: _0x306b75
          };
        }
        continue;
      }
      if (_0x3307c1.type === "number-label") {
        const _0x14a49c = Math.max(_0x1c2714, getFiniteNumber(_0x3307c1.sizeWorld, 18) / 2);
        if (Math.hypot(_0x40ca14.x - getFiniteNumber(_0x3307c1.x), _0x40ca14.y - getFiniteNumber(_0x3307c1.y)) <= _0x14a49c) {
          return {
            index: _0x306b75
          };
        }
      }
    }
    return null;
  }
  _drawSelectedCommandOutline(_0x4f9d98, _0x56afc3) {
    const _0x3ea4b9 = this._getSelectedCommand();
    if (!_0x4f9d98 || !_0x3ea4b9 || _0x3ea4b9.type === "text") {
      return;
    }
    const _0x3762df = getCssVar("--blue-border-focus") || getCssVar("--blue") || _0x4f9d98.strokeStyle;
    const _0x665b3 = _0x56afc3.zoom || 1;
    _0x4f9d98.save();
    _0x4f9d98.strokeStyle = _0x3762df;
    _0x4f9d98.fillStyle = _0x3762df;
    _0x4f9d98.lineWidth = 1.5;
    _0x4f9d98.setLineDash([5, 4]);
    if (_0x3ea4b9.type === "arrow") {
      if (this._pointerState?.arrowTransform?.type === "handle") {
        _0x4f9d98.restore();
        return;
      }
      const _0xc9bff9 = getArrowGeometry(_0x3ea4b9);
      const _0x382d1f = getScreenPointFromWorld(_0xc9bff9.start, _0x56afc3);
      const _0xf8e8d6 = getScreenPointFromWorld(_0xc9bff9.end, _0x56afc3);
      const _0x559f31 = getScreenPointFromWorld(_0xc9bff9.middle, _0x56afc3);
      _0x4f9d98.setLineDash([]);
      _0x4f9d98.beginPath();
      _0x4f9d98.moveTo(_0x382d1f.x, _0x382d1f.y);
      if (_0xc9bff9.type === "arc") {
        const _0x1df1ed = getScreenPointFromWorld(_0xc9bff9.center, _0x56afc3);
        _0x4f9d98.arc(_0x1df1ed.x, _0x1df1ed.y, _0xc9bff9.radius * _0x665b3, _0xc9bff9.startAngle, _0xc9bff9.endAngle, _0xc9bff9.anticlockwise);
      } else if (_0xc9bff9.type === "elbow") {
        _0xc9bff9.points.slice(1).forEach(_0x4ab206 => {
          const _0x5b1f80 = getScreenPointFromWorld(_0x4ab206, _0x56afc3);
          _0x4f9d98.lineTo(_0x5b1f80.x, _0x5b1f80.y);
        });
      } else {
        _0x4f9d98.lineTo(_0xf8e8d6.x, _0xf8e8d6.y);
      }
      _0x4f9d98.stroke();
      [_0x382d1f, _0x559f31, _0xf8e8d6].forEach((_0x5dabf1, _0x37fc28) => {
        _0x4f9d98.beginPath();
        _0x4f9d98.fillStyle = getCssVar("--canvas-white") || "#fff";
        _0x4f9d98.strokeStyle = _0x3762df;
        _0x4f9d98.lineWidth = 2;
        _0x4f9d98.arc(_0x5dabf1.x, _0x5dabf1.y, _0x37fc28 === 1 ? 4.5 : 6, 0, Math.PI * 2);
        _0x4f9d98.fill();
        _0x4f9d98.stroke();
      });
    } else {
      const _0x38b339 = getWhiteboardLayerGeometry(_0x3ea4b9, {
        zoom: _0x665b3
      });
      if (_0x38b339) {
        const _0x1d6419 = _0x38b339.corners.map(_0x3e986e => getScreenPointFromWorld(_0x3e986e, _0x56afc3));
        if (Math.abs(_0x38b339.rotation) < 0.0001) {
          _0x4f9d98.strokeRect(_0x1d6419[0].x, _0x1d6419[0].y, _0x1d6419[2].x - _0x1d6419[0].x, _0x1d6419[2].y - _0x1d6419[0].y);
        } else {
          _0x4f9d98.beginPath();
          _0x4f9d98.moveTo(_0x1d6419[0].x, _0x1d6419[0].y);
          _0x1d6419.slice(1).forEach(_0x255128 => _0x4f9d98.lineTo(_0x255128.x, _0x255128.y));
          _0x4f9d98.closePath();
          _0x4f9d98.stroke();
        }
        if (this._view?.tool === "select") {
          _0x4f9d98.setLineDash([]);
          if (_0x38b339.rotationHandle) {
            const _0x35f5cb = getScreenPointFromWorld(_0x38b339.topMiddle, _0x56afc3);
            const _0x25a9b5 = getScreenPointFromWorld(_0x38b339.rotationHandle.point, _0x56afc3);
            _0x4f9d98.beginPath();
            _0x4f9d98.moveTo(_0x35f5cb.x, _0x35f5cb.y);
            _0x4f9d98.lineTo(_0x25a9b5.x, _0x25a9b5.y);
            _0x4f9d98.stroke();
          }
          const _0x487164 = [..._0x38b339.scaleHandles, ...(_0x38b339.rotationHandle ? [_0x38b339.rotationHandle] : [])];
          _0x487164.forEach(_0x4eeb3f => {
            const _0xa24e7a = getScreenPointFromWorld(_0x4eeb3f.point, _0x56afc3);
            _0x4f9d98.beginPath();
            _0x4f9d98.fillStyle = getCssVar("--canvas-white") || "#fff";
            _0x4f9d98.strokeStyle = _0x3762df;
            _0x4f9d98.lineWidth = 2;
            _0x4f9d98.arc(_0xa24e7a.x, _0xa24e7a.y, 5.5, 0, Math.PI * 2);
            _0x4f9d98.fill();
            _0x4f9d98.stroke();
          });
        }
      }
    }
    _0x4f9d98.restore();
  }
  _render() {
    if (!this.canvasEl) {
      return;
    }
    this._syncCanvasSize();
    const _0x367f67 = this._getViewport();
    const _0x149b1d = this.canvasEl.getContext("2d");
    const _0x7e08d3 = this._pointerState?.mode === "erase-layers" && this._pointerState.eraseIndices instanceof Set ? this._pointerState.eraseIndices : null;
    const _0x117f8b = this._editingTextCommandIndex;
    _0x149b1d.clearRect(0, 0, this._canvasCssWidth, this._canvasCssHeight);
    this._drawBackgroundImage(_0x149b1d, _0x367f67);
    renderCommands({
      ctx: _0x149b1d,
      viewport: _0x367f67,
      canvasEl: this.canvasEl,
      commands: this._commands,
      isDraft: false,
      isEraseScene: false,
      checkerPattern: this._checkerPattern,
      defaultTextColor: getColorCanvas(WHITEBOARD_DEFAULT_COLOR),
      getTextGeometry: _0x57de19 => this._getTextGeometry(_0x57de19),
      selectedTextCommandIndex: Number.isInteger(_0x117f8b) ? null : this._selectedTextCommandIndex,
      selectedCommandsRef: this._commands,
      resolveCssVar: getCssVar,
      fillRegionCache: this._fillRegionCache,
      numberLabelBackgroundColor: getCssVar("--canvas-white"),
      getCommandOpacityMultiplier: Number.isInteger(_0x117f8b) || _0x7e08d3?.size ? (_0x148b06, _0x36932f) => {
        if (_0x36932f === _0x117f8b) {
          return 0;
        }
        if (_0x7e08d3?.has(_0x36932f)) {
          return WHITEBOARD_LAYER_ERASE_PREVIEW_OPACITY;
        } else {
          return 1;
        }
      } : null,
      textSelectionVariant: "whiteboard",
      textLayoutVariant: "whiteboard"
    });
    this._drawSelectedCommandOutline(_0x149b1d, _0x367f67);
    if (_0x7e08d3) {
      this._drawLayerEraserTrail(_0x149b1d, _0x367f67);
    }
    if (this._draft) {
      renderCommands({
        ctx: _0x149b1d,
        viewport: _0x367f67,
        canvasEl: this.canvasEl,
        commands: [this._draft],
        isDraft: true,
        isEraseScene: false,
        checkerPattern: this._checkerPattern,
        defaultTextColor: getColorCanvas(WHITEBOARD_DEFAULT_COLOR),
        getTextGeometry: _0x35b96a => this._getTextGeometry(_0x35b96a),
        selectedCommandsRef: null,
        resolveCssVar: getCssVar,
        fillRegionCache: this._fillRegionCache,
        numberLabelBackgroundColor: getCssVar("--canvas-white"),
        textLayoutVariant: "whiteboard"
      });
    }
  }
  _markDirty() {
    this._fillRegionCache.clear();
    this._syncToolbarState();
    this._render();
    this._scheduleSave();
  }
  _getCurrentSignature() {
    return getWhiteboardSignature({
      commands: this._commands,
      tool: this._view.tool,
      shapeType: this._view.shapeType,
      view: this._camera,
      style: this._style,
      color: this._style.color,
      brushSizePx: this._style.size
    });
  }
  _loadWhiteboardState(_0x1ee993) {
    const _0x318696 = normalizeWhiteboardState(_0x1ee993);
    this._whiteboard = _0x318696;
    this._commands = cloneCommands(_0x318696.commands);
    this._redoStack = [];
    this._draft = null;
    this._selectedTextCommandIndex = null;
    this._selectedCommandIndex = null;
    this._editingTextCommandIndex = null;
    this._camera = cloneWhiteboardView(_0x318696.view);
    this._style = cloneWhiteboardStyle(_0x318696.style);
    this._view = {
      tool: _0x318696.tool,
      shapeType: _0x318696.shapeType,
      color: this._style.color,
      brushSizePx: this._style.size
    };
    this._lastPersistedSignature = getWhiteboardSignature(_0x318696);
    this._syncToolbarState();
    this._render();
  }
  _scheduleSave() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
    }
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this._saveNow();
    }, WHITEBOARD_SAVE_DEBOUNCE_MS);
  }
  _flushSave() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    this._saveNow();
  }
  _saveNow() {
    if (!this.id) {
      return;
    }
    const _0x3a62d3 = a609_0x3d8181.getStateRaw?.().nodes?.[this.id];
    if (!_0x3a62d3) {
      return;
    }
    const _0xa2a552 = normalizeWhiteboardState(_0x3a62d3.whiteboard);
    const _0x41229f = normalizeWhiteboardState({
      version: WHITEBOARD_DATA_VERSION,
      commands: this._commands,
      tool: this._view.tool,
      shapeType: this._view.shapeType,
      view: this._camera,
      style: this._style,
      color: this._style.color,
      brushSizePx: this._style.size,
      updatedAt: Date.now()
    });
    const _0x7becdd = getWhiteboardSignature(_0x41229f);
    if (_0x7becdd === getWhiteboardSignature(_0xa2a552)) {
      return;
    }
    this._whiteboard = _0x41229f;
    this._lastPersistedSignature = _0x7becdd;
    this._data = {
      ..._0x3a62d3,
      whiteboard: _0x41229f
    };
    a609_0x3d8181.updateNodeData(this.id, {
      whiteboard: _0x41229f
    });
    window._triggerLocalCacheSave?.();
  }
}