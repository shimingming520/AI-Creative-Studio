const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_ALIASES = Object.freeze({
  "source-text": "ai-text",
  "source-image": "ai-image",
  "source-video": "ai-video",
  "source-audio": "ai-audio",
  "panorama-360": "panorama-scene"
});
const ICON_SHAPES = Object.freeze({
  "ai-text": [["path", {
    d: "M12 20h9"
  }], ["path", {
    d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
  }]],
  "ai-image": [["rect", {
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    rx: 3
  }], ["circle", {
    cx: 8.5,
    cy: 8.5,
    r: 1.5,
    fill: "currentColor"
  }], ["polyline", {
    points: "21 15 16 10 5 21"
  }]],
  "ai-video": [["rect", {
    x: 2,
    y: 6,
    width: 15,
    height: 12,
    rx: 2
  }], ["path", {
    d: "M17 9l5-3v12l-5-3V9z"
  }]],
  "ai-audio": [["path", {
    d: "M9 18V5l12-2v13"
  }], ["circle", {
    cx: 6,
    cy: 18,
    r: 3
  }], ["circle", {
    cx: 18,
    cy: 16,
    r: 3
  }]],
  "comment-note": [["rect", {
    x: 4,
    y: 4,
    width: 16,
    height: 16,
    rx: 2
  }], ["path", {
    d: "M8 9h8M8 13h6M15 20v-4h5"
  }]],
  "panorama-scene": [["circle", {
    cx: 12,
    cy: 12,
    r: 8.5
  }], ["path", {
    d: "M3.5 12h17M12 3.5c4.7 5.1 4.7 11.9 0 17M12 3.5c-4.7 5.1-4.7 11.9 0 17"
  }]],
  storyboard: [["rect", {
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    rx: 2
  }], ["path", {
    d: "M3 9h18M3 15h18M9 3v18M15 3v18"
  }]],
  "storyboard-script": [["rect", {
    x: 3,
    y: 4,
    width: 18,
    height: 16,
    rx: 2
  }], ["path", {
    d: "M3 9h18M3 14h18M8 4v16"
  }]],
  collage: [["rect", {
    x: 3,
    y: 4,
    width: 18,
    height: 16,
    rx: 2
  }], ["path", {
    d: "M3 10h18M12 10v10"
  }]],
  whiteboard: [["rect", {
    x: 3,
    y: 4,
    width: 18,
    height: 16,
    rx: 2
  }], ["path", {
    d: "M7 8h10M7 15c2.2-3 4.6-3 6.8 0 1.1 1.5 2.2 1.5 3.2 0"
  }]],
  "web-preview": [["circle", {
    cx: 12,
    cy: 12,
    r: 9
  }], ["path", {
    d: "M3 12h18M12 3c4.7 5.1 4.7 12.9 0 18M12 3c-4.7 5.1-4.7 12.9 0 18"
  }]],
  "media-clip": [["path", {
    d: "M6 3v12a3 3 0 0 0 3 3h12M3 6h12a3 3 0 0 1 3 3v12M3 3l18 18"
  }]],
  debug: [["path", {
    d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-8 8l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 8-8z"
  }]],
  "section-generation": [["path", {
    d: "M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14zM5 13l.7 1.8 1.8.7-1.8.7L5 18l-.7-1.8-1.8-.7 1.8-.7L5 13z"
  }]],
  "section-source": [["path", {
    d: "M12 3v12M7 10l5 5 5-5M5 20h14"
  }]],
  "section-function": [["rect", {
    x: 4,
    y: 4,
    width: 6,
    height: 6,
    rx: 1
  }], ["rect", {
    x: 14,
    y: 4,
    width: 6,
    height: 6,
    rx: 1
  }], ["rect", {
    x: 4,
    y: 14,
    width: 6,
    height: 6,
    rx: 1
  }], ["rect", {
    x: 14,
    y: 14,
    width: 6,
    height: 6,
    rx: 1
  }]],
  "add-node": [["rect", {
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    rx: 3
  }], ["path", {
    d: "M12 8v8M8 12h8"
  }]],
  upload: [["path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
  }]],
  paste: [["rect", {
    x: 6,
    y: 5,
    width: 14,
    height: 16,
    rx: 2
  }], ["path", {
    d: "M9 5V3h8v2M4 17H3V7a2 2 0 0 1 2-2h1"
  }]],
  undo: [["path", {
    d: "M9 7l-5 5 5 5M4 12h9a7 7 0 0 1 7 7"
  }]],
  redo: [["path", {
    d: "M15 7l5 5-5 5M20 12h-9a7 7 0 0 0-7 7"
  }]]
});
function appendShape(_0x125cd8, _0x3e9c9f, _0x4aaf5d, _0x200065) {
  const _0x4a11f7 = _0x125cd8.createElementNS(SVG_NS, _0x4aaf5d);
  Object.entries(_0x200065).forEach(([_0x5435b5, _0x492daf]) => {
    _0x4a11f7.setAttribute(_0x5435b5, String(_0x492daf));
  });
  _0x3e9c9f.appendChild(_0x4a11f7);
}
export function createNodeCreationMenuIcon(_0x49e15c, {
  documentObject = globalThis.document,
  stroke = "currentColor"
} = {}) {
  if (typeof documentObject?.createElementNS !== "function") {
    return null;
  }
  const _0x4f7f9c = ICON_ALIASES[_0x49e15c] || _0x49e15c;
  const _0x38e370 = ICON_SHAPES[_0x4f7f9c];
  if (!_0x38e370) {
    return null;
  }
  const _0x17359b = documentObject.createElementNS(SVG_NS, "svg");
  _0x17359b.setAttribute("width", "18");
  _0x17359b.setAttribute("height", "18");
  _0x17359b.setAttribute("viewBox", "0 0 24 24");
  _0x17359b.setAttribute("fill", "none");
  _0x17359b.setAttribute("stroke", stroke);
  _0x17359b.setAttribute("stroke-width", "1.8");
  _0x17359b.setAttribute("stroke-linecap", "round");
  _0x17359b.setAttribute("stroke-linejoin", "round");
  _0x17359b.setAttribute("aria-hidden", "true");
  _0x17359b.dataset.nodeCreationIcon = String(_0x49e15c || "");
  _0x38e370.forEach(([_0x145725, _0x7168a1]) => {
    appendShape(documentObject, _0x17359b, _0x145725, _0x7168a1);
  });
  return _0x17359b;
}