import { localPathToUrl } from "../../utils/localMediaPath.js";
import { t } from "../../i18n/index.js";
import { calcWorkflowBounds } from "./workflowCanvas.js";
export const DEFAULT_WORKFLOW_COVER_ID = "__workflow_default_cover__";
export const WORKFLOW_SNAPSHOT_COVER_ID = "__workflow_snapshot_cover__";
const SNAPSHOT_WIDTH = 640;
const SNAPSHOT_HEIGHT = 360;
const SNAPSHOT_FRAME = {
  x: 42,
  y: 74,
  width: 556,
  height: 244,
  padding: 28
};
const SNAPSHOT_MAX_NODES = 24;
const CSS_CUSTOM_PROPERTY_RE = /^var\(\s*(--[\w-]+)(?:\s*,\s*(.+))?\s*\)$/;
const CSS_TOKEN_OPACITY_RE = /^(--[\w-]+)-(\d{2})$/;
const CSS_RGBA_FUNCTION = "rgba";
const SNAPSHOT_COLOR_TOKENS = Object.freeze({
  accentVideo: "--indigo-text",
  accentAudio: "--green",
  accentText: "--gold-text",
  accentImage: "--blue",
  accentMask: "--purple-bright",
  accentGroup: "--gold",
  accentDefault: "--group-slate",
  edge: "--edge-draft-stroke",
  nodeFill: "--bg-node",
  nodeStroke: "--stroke-14",
  nodeText: "--text-strong",
  nodeContentFill: "--bg-panel-dark",
  nodeTypeText: "--text-secondary",
  gridDot: "--stroke-08",
  shadow: "--black",
  frameGlowStart: "--gold-text",
  frameGlowEnd: "--gold",
  background: "--bg",
  titleText: "--text-strong",
  toolbarFill: "--surface-panel",
  toolbarStroke: "--stroke-14",
  toolbarIcon: "--text-secondary",
  toolbarDotFill: "--gold-text",
  toolbarDotStroke: "--gold",
  frameFill: "--surface-float",
  frameInnerStroke: "--gold-text",
  summaryText: "--text-secondary"
});
const SNAPSHOT_COLOR_FALLBACKS = Object.freeze({
  accentVideo: [124, 141, 246],
  accentAudio: [52, 194, 168],
  accentText: [240, 185, 74],
  accentImage: [94, 161, 255],
  accentMask: [214, 119, 255],
  accentGroup: [219, 143, 22],
  accentDefault: [139, 149, 167],
  edge: [104, 113, 129],
  nodeFill: [31, 35, 43],
  nodeStroke: [66, 74, 87],
  nodeText: [215, 220, 231],
  nodeContentFill: [17, 21, 27],
  nodeTypeText: [142, 151, 166],
  gridDot: [42, 48, 58],
  shadow: [0, 0, 0],
  frameGlowStart: [240, 165, 29],
  frameGlowEnd: [185, 110, 16],
  background: [16, 20, 27],
  titleText: [237, 241, 247],
  toolbarFill: [22, 26, 34],
  toolbarStroke: [48, 56, 70],
  toolbarIcon: [170, 178, 192],
  toolbarDotFill: [241, 167, 39],
  toolbarDotStroke: [138, 92, 16],
  frameFill: [23, 26, 31],
  frameInnerStroke: [244, 178, 59],
  summaryText: [141, 150, 166]
});
const CSS_TOKEN_COLOR_FALLBACKS = Object.freeze({
  "--indigo": [99, 102, 241],
  "--green": [16, 185, 129],
  "--gold": [245, 158, 11],
  "--red": [239, 68, 68],
  "--purple": [139, 92, 246],
  "--group-pink": [236, 72, 153],
  "--group-slate": [100, 116, 139],
  "--cyan": [6, 182, 212]
});
function cleanText(_0x54ffcb) {
  return String(_0x54ffcb ?? "").trim();
}
function workflowCoverText(_0x492473, _0x1cb05c = {}) {
  return t("workflows.covers." + _0x492473, _0x1cb05c);
}
function rgbToSvgColor(_0x36d4ad, _0x5691a4, _0x4a77c4) {
  return "#" + [_0x36d4ad, _0x5691a4, _0x4a77c4].map(_0x2b4ba0 => Math.max(0, Math.min(255, Number(_0x2b4ba0) || 0)).toString(16).padStart(2, "0")).join("");
}
function fallbackSnapshotColor(_0x486cf2) {
  return rgbToSvgColor(...(SNAPSHOT_COLOR_FALLBACKS[_0x486cf2] || SNAPSHOT_COLOR_FALLBACKS.accentDefault));
}
function fallbackCssTokenColor(_0x28c159) {
  const _0x1551df = cleanText(_0x28c159);
  const _0x5a97a2 = CSS_TOKEN_COLOR_FALLBACKS[_0x1551df];
  if (_0x5a97a2) {
    return rgbToSvgColor(..._0x5a97a2);
  }
  const _0xc8b21b = _0x1551df.match(CSS_TOKEN_OPACITY_RE);
  if (!_0xc8b21b) {
    return "";
  }
  const _0x3bed3f = CSS_TOKEN_COLOR_FALLBACKS[_0xc8b21b[1]];
  if (!_0x3bed3f) {
    return "";
  }
  const _0x316957 = Math.max(0, Math.min(100, Number(_0xc8b21b[2]) || 0)) / 100;
  return CSS_RGBA_FUNCTION + "(" + _0x3bed3f[0] + ", " + _0x3bed3f[1] + ", " + _0x3bed3f[2] + ", " + _0x316957 + ")";
}
function getRootComputedStyle() {
  if (typeof document === "undefined" || typeof getComputedStyle !== "function") {
    return null;
  }
  return getComputedStyle(document.documentElement);
}
function resolveCssCustomProperty(_0xbc221a, _0x3b09f9, _0x35cf29 = new Set()) {
  const _0x1ee332 = cleanText(_0xbc221a);
  if (!_0x1ee332 || !_0x3b09f9 || _0x35cf29.has(_0x1ee332)) {
    return "";
  }
  _0x35cf29.add(_0x1ee332);
  const _0x4f0b2e = cleanText(_0x3b09f9.getPropertyValue(_0x1ee332));
  if (!_0x4f0b2e) {
    return "";
  }
  const _0x334094 = _0x4f0b2e.match(CSS_CUSTOM_PROPERTY_RE);
  if (!_0x334094) {
    return _0x4f0b2e;
  }
  return resolveCssCustomProperty(_0x334094[1], _0x3b09f9, _0x35cf29) || cleanText(_0x334094[2]);
}
function snapshotColor(_0x1024c2) {
  const _0x844b6f = fallbackSnapshotColor(_0x1024c2);
  const _0x55b996 = SNAPSHOT_COLOR_TOKENS[_0x1024c2];
  const _0x91b0da = getRootComputedStyle();
  return resolveCssCustomProperty(_0x55b996, _0x91b0da) || _0x844b6f;
}
function resolveSnapshotColorValue(_0x5d6ec1, _0x441b40 = "accentDefault", _0x5ba432 = new Set()) {
  const _0x2a1146 = cleanText(_0x5d6ec1);
  if (!_0x2a1146) {
    return snapshotColor(_0x441b40);
  }
  const _0x5381d5 = _0x2a1146.match(CSS_CUSTOM_PROPERTY_RE);
  if (!_0x5381d5) {
    return _0x2a1146;
  }
  const _0x19984f = _0x5381d5[1];
  if (_0x5ba432.has(_0x19984f)) {
    return fallbackSnapshotColor(_0x441b40);
  }
  _0x5ba432.add(_0x19984f);
  const _0x2fb508 = resolveCssCustomProperty(_0x19984f, getRootComputedStyle());
  if (_0x2fb508) {
    return resolveSnapshotColorValue(_0x2fb508, _0x441b40, _0x5ba432);
  }
  const _0x5c0865 = cleanText(_0x5381d5[2]);
  if (_0x5c0865) {
    return resolveSnapshotColorValue(_0x5c0865, _0x441b40, _0x5ba432);
  }
  return fallbackCssTokenColor(_0x19984f) || fallbackSnapshotColor(_0x441b40);
}
function withOpacityToken(_0x1b2d07, _0x2ff758) {
  const _0x1eca0a = cleanText(_0x1b2d07).match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (!_0x1eca0a) {
    return _0x1b2d07;
  }
  return "var(" + _0x1eca0a[1] + "-" + _0x2ff758 + ")";
}
function normalizeNodeList(_0x5a96c2) {
  if (Array.isArray(_0x5a96c2)) {
    return _0x5a96c2;
  } else if (_0x5a96c2 && typeof _0x5a96c2 === "object") {
    return Object.values(_0x5a96c2);
  } else {
    return [];
  }
}
function normalizeEdgeList(_0x5503a8) {
  if (Array.isArray(_0x5503a8)) {
    return _0x5503a8;
  } else if (_0x5503a8 && typeof _0x5503a8 === "object") {
    return Object.values(_0x5503a8);
  } else {
    return [];
  }
}
function escapeSvgText(_0x478a73) {
  return cleanText(_0x478a73).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function truncateSvgText(_0x359de0, _0x48a0c0 = 10) {
  const _0x111cfa = cleanText(_0x359de0);
  if (_0x111cfa.length <= _0x48a0c0) {
    return _0x111cfa;
  }
  return _0x111cfa.slice(0, _0x48a0c0 - 1) + "…";
}
function edgeSourceId(_0x5d10f2) {
  return cleanText(_0x5d10f2?.sourceId ?? _0x5d10f2?.source);
}
function edgeTargetId(_0x134a65) {
  return cleanText(_0x134a65?.targetId ?? _0x134a65?.target);
}
function nodeTypeKey(_0x2b05e5) {
  return cleanText(_0x2b05e5?.type).toLowerCase();
}
function isGroupNode(_0x56ca17) {
  return nodeTypeKey(_0x56ca17) === "group";
}
function nodeSize(_0x273b05) {
  return {
    width: Math.max(24, Number(_0x273b05?.width ?? _0x273b05?.w) || 100),
    height: Math.max(24, Number(_0x273b05?.height ?? _0x273b05?.h) || 100)
  };
}
function nodePosition(_0x3563b8) {
  return {
    x: Number(_0x3563b8?.x) || 0,
    y: Number(_0x3563b8?.y) || 0
  };
}
function pickSnapshotTitle(_0x59e828, _0x4d051e = {}) {
  const _0x5adb40 = cleanText(_0x4d051e.title || _0x4d051e.name);
  if (_0x5adb40) {
    return _0x5adb40;
  }
  const _0x3cf715 = _0x59e828.find(_0x3999b6 => isGroupNode(_0x3999b6) && !cleanText(_0x3999b6?.parentId));
  return cleanText(_0x3cf715?.name || _0x3cf715?.title || _0x3cf715?.label) || workflowCoverText("titleFallback");
}
function pickSnapshotGroupColor(_0x3e3cb4, _0x454cc9 = {}) {
  const _0xb7a336 = cleanText(_0x454cc9.groupColor || _0x454cc9.accentColor || _0x454cc9.color);
  if (_0xb7a336) {
    return _0xb7a336;
  }
  const _0x345b96 = _0x3e3cb4.find(_0x22beaf => isGroupNode(_0x22beaf) && !cleanText(_0x22beaf?.parentId));
  return cleanText(_0x345b96?.color);
}
function createSnapshotTheme(_0x12af90, _0x36c08e = {}) {
  const _0x2919e2 = pickSnapshotGroupColor(_0x12af90, _0x36c08e);
  if (!_0x2919e2) {
    return {
      frameGlowStart: snapshotColor("frameGlowStart"),
      frameGlowEnd: snapshotColor("frameGlowEnd"),
      frameInnerStroke: snapshotColor("frameInnerStroke"),
      toolbarDotFill: snapshotColor("toolbarDotFill"),
      toolbarDotStroke: snapshotColor("toolbarDotStroke"),
      groupAccent: snapshotColor("accentGroup")
    };
  }
  const _0x1c9519 = resolveSnapshotColorValue(_0x2919e2, "accentGroup");
  const _0x1f158f = resolveSnapshotColorValue(withOpacityToken(_0x2919e2, "60"), "frameGlowEnd");
  return {
    frameGlowStart: _0x1c9519,
    frameGlowEnd: _0x1f158f,
    frameInnerStroke: _0x1c9519,
    toolbarDotFill: _0x1c9519,
    toolbarDotStroke: _0x1f158f,
    groupAccent: _0x1c9519
  };
}
function pickNodeLabel(_0x74e8d9) {
  return cleanText(_0x74e8d9?.name || _0x74e8d9?.title || _0x74e8d9?.label) || pickNodeTypeLabel(_0x74e8d9) || workflowCoverText("nodeTypes.node");
}
function pickNodeTypeLabel(_0xfb89a8) {
  const _0x2711cb = nodeTypeKey(_0xfb89a8);
  if (_0x2711cb.includes("video")) {
    return workflowCoverText("nodeTypes.video");
  }
  if (_0x2711cb.includes("audio")) {
    return workflowCoverText("nodeTypes.audio");
  }
  if (_0x2711cb.includes("image") || _0x2711cb.includes("photo")) {
    return workflowCoverText("nodeTypes.image");
  }
  if (_0x2711cb.includes("text") || _0x2711cb.includes("prompt")) {
    return workflowCoverText("nodeTypes.text");
  }
  if (_0x2711cb.includes("mask")) {
    return workflowCoverText("nodeTypes.mask");
  }
  if (_0x2711cb.includes("group")) {
    return workflowCoverText("nodeTypes.group");
  }
  return workflowCoverText("nodeTypes.node");
}
function pickNodeAccent(_0x789f68, _0x4244c8 = null) {
  const _0x110473 = nodeTypeKey(_0x789f68);
  if (_0x110473.includes("video")) {
    return snapshotColor("accentVideo");
  }
  if (_0x110473.includes("audio")) {
    return snapshotColor("accentAudio");
  }
  if (_0x110473.includes("text") || _0x110473.includes("prompt")) {
    return snapshotColor("accentText");
  }
  if (_0x110473.includes("image") || _0x110473.includes("photo")) {
    return snapshotColor("accentImage");
  }
  if (_0x110473.includes("mask")) {
    return snapshotColor("accentMask");
  }
  if (_0x110473.includes("group")) {
    if (cleanText(_0x789f68?.color)) {
      return resolveSnapshotColorValue(_0x789f68.color, "accentGroup");
    } else {
      return _0x4244c8?.groupAccent || snapshotColor("accentGroup");
    }
  }
  return snapshotColor("accentDefault");
}
function projectNode(_0x111f44, _0x47b667, _0xc44110, _0x3e610c) {
  const _0x516037 = nodePosition(_0x111f44);
  const _0x613157 = nodeSize(_0x111f44);
  const _0x4562c6 = _0x3e610c.x + (_0x516037.x - _0x47b667.minX) * _0xc44110;
  const _0x1e12ee = _0x3e610c.y + (_0x516037.y - _0x47b667.minY) * _0xc44110;
  const _0x2bdd10 = _0x613157.width * _0xc44110;
  const _0x4c0c1c = _0x613157.height * _0xc44110;
  const _0x218b6e = Math.max(48, _0x2bdd10);
  const _0x42b6ae = Math.max(34, _0x4c0c1c);
  return {
    x: _0x4562c6 - (_0x218b6e - _0x2bdd10) / 2,
    y: _0x1e12ee - (_0x42b6ae - _0x4c0c1c) / 2,
    width: _0x218b6e,
    height: _0x42b6ae,
    cx: _0x4562c6 + _0x2bdd10 / 2,
    cy: _0x1e12ee + _0x4c0c1c / 2
  };
}
function renderSnapshotEdges(_0x11066d, _0x309054) {
  const _0x128957 = [];
  for (const _0x562a44 of _0x11066d) {
    const _0x4f0c5d = _0x309054.get(edgeSourceId(_0x562a44));
    const _0x45bc94 = _0x309054.get(edgeTargetId(_0x562a44));
    if (!_0x4f0c5d || !_0x45bc94) {
      continue;
    }
    const _0x2ea740 = _0x4f0c5d.x + _0x4f0c5d.width;
    const _0x2a0e83 = _0x4f0c5d.y + _0x4f0c5d.height / 2;
    const _0x4dd626 = _0x45bc94.x;
    const _0x216ac6 = _0x45bc94.y + _0x45bc94.height / 2;
    const _0x35fa89 = Math.max(34, Math.abs(_0x4dd626 - _0x2ea740) * 0.45);
    _0x128957.push("<path d=\"M " + _0x2ea740.toFixed(1) + " " + _0x2a0e83.toFixed(1) + " C " + (_0x2ea740 + _0x35fa89).toFixed(1) + " " + _0x2a0e83.toFixed(1) + ", " + (_0x4dd626 - _0x35fa89).toFixed(1) + " " + _0x216ac6.toFixed(1) + ", " + _0x4dd626.toFixed(1) + " " + _0x216ac6.toFixed(1) + "\" fill=\"none\" stroke=\"" + snapshotColor("edge") + "\" stroke-width=\"2.2\" stroke-linecap=\"round\" opacity=\"0.72\"/>");
  }
  return _0x128957.join("");
}
function renderSnapshotNodes(_0x352bea, _0x1d0d70, _0x37b381 = null) {
  return _0x352bea.map(_0x272e00 => {
    const _0x2b917c = cleanText(_0x272e00?.id);
    const _0x416686 = _0x1d0d70.get(_0x2b917c);
    if (!_0x416686) {
      return "";
    }
    const _0xf83637 = escapeSvgText(truncateSvgText(pickNodeLabel(_0x272e00), _0x416686.width > 92 ? 12 : 8));
    const _0x7f35a9 = escapeSvgText(pickNodeTypeLabel(_0x272e00));
    const _0x425878 = pickNodeAccent(_0x272e00, _0x37b381);
    const _0x393b62 = _0x416686.y + 27;
    const _0xfc24b8 = Math.max(8, _0x416686.height - 37);
    return ["<g filter=\"url(#nodeShadow)\">", "<rect x=\"" + _0x416686.x.toFixed(1) + "\" y=\"" + _0x416686.y.toFixed(1) + "\" width=\"" + _0x416686.width.toFixed(1) + "\" height=\"" + _0x416686.height.toFixed(1) + "\" rx=\"10\" fill=\"" + snapshotColor("nodeFill") + "\" stroke=\"" + snapshotColor("nodeStroke") + "\" stroke-width=\"1\"/>", "<rect x=\"" + (_0x416686.x + 1).toFixed(1) + "\" y=\"" + (_0x416686.y + 1).toFixed(1) + "\" width=\"" + (_0x416686.width - 2).toFixed(1) + "\" height=\"6\" rx=\"5\" fill=\"" + _0x425878 + "\"/>", "<text x=\"" + (_0x416686.x + 12).toFixed(1) + "\" y=\"" + (_0x416686.y + 22).toFixed(1) + "\" fill=\"" + snapshotColor("nodeText") + "\" font-size=\"12\" font-family=\"system-ui, -apple-system, BlinkMacSystemFont, sans-serif\" font-weight=\"700\">" + _0xf83637 + "</text>", "<rect x=\"" + (_0x416686.x + 12).toFixed(1) + "\" y=\"" + _0x393b62.toFixed(1) + "\" width=\"" + Math.max(10, _0x416686.width - 24).toFixed(1) + "\" height=\"" + _0xfc24b8.toFixed(1) + "\" rx=\"7\" fill=\"" + snapshotColor("nodeContentFill") + "\" opacity=\"0.76\"/>", _0x416686.width >= 70 && _0x416686.height >= 54 ? "<text x=\"" + (_0x416686.x + 17).toFixed(1) + "\" y=\"" + (_0x393b62 + 19).toFixed(1) + "\" fill=\"" + snapshotColor("nodeTypeText") + "\" font-size=\"10\" font-family=\"system-ui, -apple-system, BlinkMacSystemFont, sans-serif\">" + _0x7f35a9 + "</text>" : "", "</g>"].join("");
  }).join("");
}
function createWorkflowSnapshotSvg(_0x2e2d6f, _0x2f7927 = {}) {
  const _0x1f420c = normalizeNodeList(_0x2e2d6f?.nodes).filter(Boolean);
  if (_0x1f420c.length === 0) {
    return "";
  }
  const _0x2f4adb = createSnapshotTheme(_0x1f420c, _0x2f7927);
  const _0x569756 = normalizeEdgeList(_0x2e2d6f?.edges);
  const _0x6f67de = calcWorkflowBounds(_0x1f420c);
  if (!_0x6f67de.width && !_0x6f67de.height) {
    return "";
  }
  const _0x413709 = _0x1f420c.filter(_0x4e8581 => !isGroupNode(_0x4e8581));
  const _0x39534b = (_0x413709.length > 0 ? _0x413709 : _0x1f420c).slice(0, SNAPSHOT_MAX_NODES);
  const _0x55121c = new Set(_0x39534b.map(_0x34e6b7 => cleanText(_0x34e6b7?.id)).filter(Boolean));
  const _0x862c56 = _0x569756.filter(_0x49b014 => _0x55121c.has(edgeSourceId(_0x49b014)) && _0x55121c.has(edgeTargetId(_0x49b014)));
  const _0x41c359 = SNAPSHOT_FRAME.width - SNAPSHOT_FRAME.padding * 2;
  const _0x1061ef = SNAPSHOT_FRAME.height - SNAPSHOT_FRAME.padding * 2;
  const _0x50e403 = Math.min(_0x41c359 / Math.max(_0x6f67de.width, 1), _0x1061ef / Math.max(_0x6f67de.height, 1), 1.45);
  const _0x423a4c = _0x6f67de.width * _0x50e403;
  const _0x200e8d = _0x6f67de.height * _0x50e403;
  const _0x52e4bc = {
    x: SNAPSHOT_FRAME.x + SNAPSHOT_FRAME.padding + (_0x41c359 - _0x423a4c) / 2,
    y: SNAPSHOT_FRAME.y + SNAPSHOT_FRAME.padding + (_0x1061ef - _0x200e8d) / 2
  };
  const _0x5e8afd = new Map();
  for (const _0x995649 of _0x39534b) {
    const _0x363091 = cleanText(_0x995649?.id);
    if (!_0x363091) {
      continue;
    }
    _0x5e8afd.set(_0x363091, projectNode(_0x995649, _0x6f67de, _0x50e403, _0x52e4bc));
  }
  const _0x5490ec = escapeSvgText(truncateSvgText(pickSnapshotTitle(_0x1f420c, _0x2f7927), 18));
  const _0x2ab5c8 = workflowCoverText("summary", {
    nodeCount: _0x1f420c.length,
    edgeCount: _0x569756.length
  });
  return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + SNAPSHOT_WIDTH + "\" height=\"" + SNAPSHOT_HEIGHT + "\" viewBox=\"0 0 " + SNAPSHOT_WIDTH + " " + SNAPSHOT_HEIGHT + "\" role=\"img\" aria-label=\"workflow snapshot\">\n<defs>\n  <pattern id=\"grid\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\">\n    <circle cx=\"2\" cy=\"2\" r=\"1.2\" fill=\"" + snapshotColor("gridDot") + "\" opacity=\"0.72\"/>\n  </pattern>\n  <filter id=\"nodeShadow\" x=\"-16%\" y=\"-20%\" width=\"132%\" height=\"140%\">\n    <feDropShadow dx=\"0\" dy=\"8\" stdDeviation=\"8\" flood-color=\"" + snapshotColor("shadow") + "\" flood-opacity=\"0.25\"/>\n  </filter>\n  <linearGradient id=\"frameGlow\" x1=\"0\" x2=\"1\" y1=\"0\" y2=\"1\">\n    <stop offset=\"0\" stop-color=\"" + _0x2f4adb.frameGlowStart + "\"/>\n    <stop offset=\"1\" stop-color=\"" + _0x2f4adb.frameGlowEnd + "\"/>\n  </linearGradient>\n</defs>\n<rect width=\"" + SNAPSHOT_WIDTH + "\" height=\"" + SNAPSHOT_HEIGHT + "\" fill=\"" + snapshotColor("background") + "\"/>\n<rect width=\"" + SNAPSHOT_WIDTH + "\" height=\"" + SNAPSHOT_HEIGHT + "\" fill=\"url(#grid)\"/>\n<text x=\"52\" y=\"48\" fill=\"" + snapshotColor("titleText") + "\" font-size=\"28\" font-family=\"system-ui, -apple-system, BlinkMacSystemFont, sans-serif\" font-weight=\"800\">" + _0x5490ec + "</text>\n<g opacity=\"0.92\">\n  <rect x=\"252\" y=\"28\" width=\"136\" height=\"44\" rx=\"14\" fill=\"" + snapshotColor("toolbarFill") + "\" stroke=\"" + snapshotColor("toolbarStroke") + "\" stroke-width=\"1.2\"/>\n  <path d=\"M 280 42 L 280 58 L 294 50 Z\" fill=\"none\" stroke=\"" + snapshotColor("toolbarIcon") + "\" stroke-width=\"2\" stroke-linejoin=\"round\"/>\n  <circle cx=\"320\" cy=\"50\" r=\"9\" fill=\"" + _0x2f4adb.toolbarDotFill + "\" stroke=\"" + _0x2f4adb.toolbarDotStroke + "\" stroke-width=\"2\"/>\n  <rect x=\"352\" y=\"41\" width=\"18\" height=\"18\" rx=\"2\" fill=\"none\" stroke=\"" + snapshotColor("toolbarIcon") + "\" stroke-width=\"2\"/>\n</g>\n<rect x=\"" + SNAPSHOT_FRAME.x + "\" y=\"" + SNAPSHOT_FRAME.y + "\" width=\"" + SNAPSHOT_FRAME.width + "\" height=\"" + SNAPSHOT_FRAME.height + "\" rx=\"18\" fill=\"" + snapshotColor("frameFill") + "\" fill-opacity=\"0.9\" stroke=\"url(#frameGlow)\" stroke-width=\"8\"/>\n<rect x=\"" + (SNAPSHOT_FRAME.x + 6) + "\" y=\"" + (SNAPSHOT_FRAME.y + 6) + "\" width=\"" + (SNAPSHOT_FRAME.width - 12) + "\" height=\"" + (SNAPSHOT_FRAME.height - 12) + "\" rx=\"13\" fill=\"none\" stroke=\"" + _0x2f4adb.frameInnerStroke + "\" stroke-width=\"1\" opacity=\"0.9\"/>\n<text x=\"" + (SNAPSHOT_FRAME.x + 26) + "\" y=\"" + (SNAPSHOT_FRAME.y + 34) + "\" fill=\"" + snapshotColor("summaryText") + "\" font-size=\"15\" font-family=\"system-ui, -apple-system, BlinkMacSystemFont, sans-serif\" font-weight=\"700\">" + escapeSvgText(_0x2ab5c8) + "</text>\n<g>" + renderSnapshotEdges(_0x862c56, _0x5e8afd) + renderSnapshotNodes(_0x39534b, _0x5e8afd, _0x2f4adb) + "</g>\n</svg>";
}
export function createWorkflowSnapshotCoverDataUrl(_0x4db99d, _0x3f8ecb = {}) {
  const _0x5e3b20 = createWorkflowSnapshotSvg(_0x4db99d, _0x3f8ecb);
  if (!_0x5e3b20) {
    return "";
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(_0x5e3b20);
}
export function createWorkflowSnapshotCoverCandidate(_0x587ec5, _0x416438 = {}) {
  const _0x287bbc = createWorkflowSnapshotCoverDataUrl(_0x587ec5, _0x416438);
  if (!_0x287bbc) {
    return null;
  }
  return {
    id: WORKFLOW_SNAPSHOT_COVER_ID,
    src: _0x287bbc,
    nodeId: "",
    label: cleanText(_0x416438.label) || workflowCoverText("snapshotLabel")
  };
}
function normalizePath(_0x42133e) {
  const _0x5c2a64 = cleanText(_0x42133e);
  if (!_0x5c2a64) {
    return "";
  }
  if (_0x5c2a64.startsWith("/") || _0x5c2a64.startsWith("data:") || _0x5c2a64.startsWith("blob:") || /^https?:\/\//i.test(_0x5c2a64)) {
    return _0x5c2a64;
  }
  const _0x26c4f5 = localPathToUrl(_0x5c2a64);
  return _0x26c4f5 || "/" + _0x5c2a64.replace(/^\/+/, "");
}
function pickMediaSrc(_0x25df49) {
  if (!_0x25df49 || typeof _0x25df49 !== "object") {
    return "";
  }
  return normalizePath(_0x25df49.localPath || _0x25df49.thumbLocalPath || _0x25df49.thumbUrl || _0x25df49.coverUrl || _0x25df49.poster || _0x25df49.imageUrl || _0x25df49.src || _0x25df49.url);
}
function pickArrayMediaSrc(_0xb0627, _0x318cf9, _0x3e9cdd) {
  const _0x4e1ce0 = Array.isArray(_0xb0627?.[_0x318cf9]) ? _0xb0627[_0x318cf9] : [];
  if (_0x4e1ce0.length === 0) {
    return "";
  }
  const _0x15e5fe = Number(_0xb0627?.[_0x3e9cdd]);
  const _0x125214 = Number.isInteger(_0x15e5fe) && _0x15e5fe >= 0 ? _0x4e1ce0[_0x15e5fe] : null;
  return pickMediaSrc(_0x125214) || pickMediaSrc(_0x4e1ce0[0]);
}
function getCoverCandidatePriority(_0x5ea2ba) {
  const _0x349304 = cleanText(_0x5ea2ba?.type).toLowerCase();
  const _0x32434a = [_0x349304, cleanText(_0x5ea2ba?.name), cleanText(_0x5ea2ba?.title), cleanText(_0x5ea2ba?.label)].join(" ").toLowerCase();
  if (_0x349304.startsWith("ai-") || _0x349304.includes("result") || _0x32434a.includes("输出") || _0x32434a.includes("生成")) {
    return 0;
  }
  if (_0x349304.startsWith("source-") || _0x32434a.includes("输入") || _0x32434a.includes("参考")) {
    return 1;
  }
  return 2;
}
export function resolveWorkflowNodeThumbSrc(_0x59e450) {
  if (!_0x59e450 || typeof _0x59e450 !== "object") {
    return "";
  }
  return normalizePath(_0x59e450.localPath || _0x59e450.thumbLocalPath || _0x59e450.thumbUrl || _0x59e450.coverUrl || _0x59e450.thumbnailUrl || _0x59e450.thumbnail || _0x59e450.poster || _0x59e450.src || _0x59e450.imageUrl) || pickArrayMediaSrc(_0x59e450, "images", "mainImageIndex") || pickArrayMediaSrc(_0x59e450, "videos", "mainVideoIndex");
}
export function extractWorkflowCoverCandidates(_0x66682b) {
  const _0x556816 = normalizeNodeList(_0x66682b);
  const _0x399bd6 = new Set();
  const _0x85352e = [];
  for (const _0x784c12 of _0x556816) {
    const _0x307869 = resolveWorkflowNodeThumbSrc(_0x784c12);
    if (!_0x307869 || _0x399bd6.has(_0x307869)) {
      continue;
    }
    _0x399bd6.add(_0x307869);
    _0x85352e.push({
      id: "cover-" + (_0x85352e.length + 1),
      src: _0x307869,
      nodeId: cleanText(_0x784c12?.id),
      label: cleanText(_0x784c12?.name) || workflowCoverText("coverNodeLabel", {
        index: _0x85352e.length + 1
      }),
      priority: getCoverCandidatePriority(_0x784c12),
      order: _0x85352e.length
    });
  }
  return _0x85352e.sort((_0x443ffe, _0x41f086) => _0x443ffe.priority - _0x41f086.priority || _0x443ffe.order - _0x41f086.order).map(({
    priority: _0x3e672e,
    order: _0x2bb786,
    ..._0x4d250a
  }) => _0x4d250a);
}
export function getDefaultWorkflowCoverCandidate() {
  return {
    id: DEFAULT_WORKFLOW_COVER_ID,
    src: "",
    nodeId: "",
    label: "SHUO Canvas"
  };
}
export function isDataImageCover(_0x5ecfeb) {
  return cleanText(_0x5ecfeb).startsWith("data:image/");
}
export function isSvgDataImageCover(_0x3185ef) {
  return /^data:image\/svg\+xml(?:[;,]|$)/i.test(cleanText(_0x3185ef));
}