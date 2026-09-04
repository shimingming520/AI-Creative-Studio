import { getNodeClass, isNodeType } from "../modules/registry.js";
import { getNodeWrapperExtraClasses, hasNodeTypeBetaBadge, normalizeNodeType } from "../modules/nodeMeta.js";
import { syncNodeMediaMetricsDataset } from "../modules/nodeMediaMetrics.js";
import { withRendererDeferredMountHints } from "./rendererDeferredMedia.js";
import { formatRendererNodeLabelText, getRendererDefaultNodeLabel, getRendererGroupColorWithOpacity, getRendererNodeLabelKind, getRendererNodeZIndex, setRendererNodeLabelContent, syncRendererNodeDragTransform } from "./rendererNodePresentation.js";
const VISIBLE_CONTENT_OVERFLOW_NODE_TYPES = new Set(["storyboard", "storyboard-script", "collage", "whiteboard", "media-clip", "panorama-scene", "panorama-360"]);
function createNodeLabel(_0x5952b, _0x1587f6, _0x354f84) {
  const _0x5ebdf7 = _0x5952b.id;
  const _0x44cc9c = _0x354f84.createElement("div");
  _0x44cc9c.className = "node-label";
  _0x44cc9c.dataset.nodeId = _0x5ebdf7;
  const _0x163806 = getRendererNodeLabelKind(_0x1587f6);
  if (_0x163806) {
    _0x44cc9c.dataset.labelKind = _0x163806;
  }
  const _0x58e3ec = getRendererDefaultNodeLabel(_0x5952b);
  const _0x3d5bb7 = hasNodeTypeBetaBadge(_0x1587f6);
  const _0x2344f0 = _0x5952b.name || _0x58e3ec;
  const _0x4712f6 = formatRendererNodeLabelText(_0x2344f0);
  _0x44cc9c.dataset.fullName = _0x2344f0;
  _0x44cc9c.dataset.defaultName = _0x58e3ec;
  _0x44cc9c.dataset.isBeta = _0x3d5bb7 ? "1" : "0";
  setRendererNodeLabelContent(_0x44cc9c, {
    labelKind: _0x163806,
    displayLabelText: _0x4712f6,
    defaultName: _0x58e3ec,
    isBeta: _0x3d5bb7,
    fullLabelText: _0x2344f0
  }, _0x354f84);
  return _0x44cc9c;
}
function createNodeTimer(_0x44d1fb, _0xd490e5) {
  const _0x3181a4 = _0xd490e5.createElement("div");
  _0x3181a4.className = "node-timer";
  _0x3181a4.dataset.nodeId = _0x44d1fb;
  _0x3181a4.style.position = "absolute";
  _0x3181a4.style.bottom = "calc(100% + 8px)";
  _0x3181a4.style.right = "0";
  _0x3181a4.style.fontSize = "13px";
  _0x3181a4.style.fontWeight = "600";
  _0x3181a4.style.color = "var(--text-primary)";
  _0x3181a4.style.padding = "2px 8px";
  _0x3181a4.style.whiteSpace = "nowrap";
  _0x3181a4.style.userSelect = "none";
  _0x3181a4.style.pointerEvents = "none";
  _0x3181a4.style.zIndex = "10";
  _0x3181a4.style.maxWidth = "100%";
  _0x3181a4.style.borderRadius = "6px";
  _0x3181a4.style.transition = "all 0.2s";
  _0x3181a4.style.background = "transparent";
  _0x3181a4.style.border = "1px solid transparent";
  _0x3181a4.style.display = "none";
  _0x3181a4.textContent = "";
  return _0x3181a4;
}
function createVideoMeta(_0x12895, _0x370578) {
  const _0xe7fc05 = _0x370578.createElement("div");
  _0xe7fc05.className = "node-video-meta";
  _0xe7fc05.dataset.nodeId = _0x12895;
  _0xe7fc05.dataset.visible = "0";
  _0xe7fc05.textContent = "";
  return _0xe7fc05;
}
export function prepareRendererNodeRuntime({
  node: _0x14bf98,
  selectedNodeSet: _0x5734b4,
  selectedNodeRankMap: _0x3f6cc1,
  dragContext: _0x85a6f3,
  dragTargets: _0x33e26b,
  options = {},
  documentObject = globalThis.document
} = {}) {
  if (!_0x14bf98?.id || !documentObject?.createElement) {
    throw new TypeError("[rendererNodeRuntimeFactory] node and document are required");
  }
  const _0x5a60b9 = _0x14bf98.id;
  const _0x4e1f2f = _0x5734b4 || new Set();
  const _0x3cd090 = _0x85a6f3 || {};
  const _0x218b5b = documentObject.createElement("div");
  _0x218b5b.id = _0x5a60b9;
  _0x218b5b.dataset.nodeId = _0x5a60b9;
  syncNodeMediaMetricsDataset(_0x218b5b, _0x14bf98);
  const _0x3ed531 = normalizeNodeType(_0x14bf98.type);
  const _0x1dd01a = getNodeWrapperExtraClasses(_0x3ed531);
  _0x218b5b.className = "v2-node node" + (_0x1dd01a ? " " + _0x1dd01a : "");
  const _0x36b515 = _0x4e1f2f.has(_0x5a60b9);
  if (_0x36b515) {
    _0x218b5b.classList.add("selected", "v2-selected");
  }
  Object.assign(_0x218b5b.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: _0x14bf98.width + "px",
    height: _0x14bf98.height + "px",
    transform: "translate(" + _0x14bf98.x + "px, " + _0x14bf98.y + "px)",
    zIndex: getRendererNodeZIndex(_0x14bf98, _0x36b515, _0x3f6cc1?.get?.(_0x5a60b9) ?? -1),
    display: "flex",
    flexDirection: "column"
  });
  _0x218b5b._posKey = _0x14bf98.x + "," + _0x14bf98.y + "," + _0x14bf98.width + "," + _0x14bf98.height;
  syncRendererNodeDragTransform(_0x218b5b, _0x14bf98, {
    active: _0x3cd090.isDragging === true && _0x33e26b?.has?.(_0x5a60b9) === true,
    offsetX: _0x3cd090.pendingDx,
    offsetY: _0x3cd090.pendingDy
  });
  const _0x31ab0e = _0x3cd090.isDragging === true && _0x33e26b?.has?.(_0x5a60b9) === true;
  if (_0x31ab0e) {
    _0x218b5b.classList.add("is-dragging");
  }
  if (_0x31ab0e && (_0x3cd090.hasMoved || !_0x3cd090.wasSelectedOnDown)) {
    _0x218b5b.classList.add("is-ui-hidden");
  }
  if (isNodeType(_0x14bf98, "group")) {
    const _0x4f9fa2 = _0x14bf98.color || "var(--indigo)";
    _0x218b5b.style.borderColor = getRendererGroupColorWithOpacity(_0x4f9fa2, "60");
    _0x218b5b.style.backgroundColor = getRendererGroupColorWithOpacity(_0x4f9fa2, "05");
    _0x218b5b.style.setProperty("--current-group-color", _0x4f9fa2);
  }
  if (!isNodeType(_0x14bf98, ["group", "comment-note"])) {
    const _0x2f2bcc = createNodeLabel(_0x14bf98, _0x3ed531, documentObject);
    _0x218b5b.appendChild(_0x2f2bcc);
    _0x218b5b.__v2_name_el = _0x2f2bcc;
    const _0x185d1d = createNodeTimer(_0x5a60b9, documentObject);
    _0x218b5b.appendChild(_0x185d1d);
    _0x218b5b.__v2_timer_el = _0x185d1d;
    if (isNodeType(_0x14bf98, ["source-video", "ai-video"])) {
      const _0x5e23ba = createVideoMeta(_0x5a60b9, documentObject);
      _0x218b5b.appendChild(_0x5e23ba);
      _0x218b5b.__v2_video_meta_el = _0x5e23ba;
    }
  }
  const _0x5ef741 = getNodeClass(_0x14bf98.type);
  const _0x1829a0 = new _0x5ef741(withRendererDeferredMountHints(_0x14bf98, {
    deferMedia: options.deferMediaOnMount === true,
    deferDetails: options.deferDetailsOnMount === true,
    eagerVideoPreview: options.eagerVideoPreviewOnMount === true,
    prebuildOffscreen: options.prebuildOffscreen === true
  }));
  const _0x12127d = _0x1829a0.mount();
  if (_0x12127d) {
    _0x12127d.classList.add("v2-node-component");
    _0x12127d.style.flex = "1";
    _0x12127d.style.width = "100%";
    _0x12127d.style.minHeight = "0";
    _0x12127d.style.minWidth = "0";
    _0x12127d.style.display = "flex";
    _0x12127d.style.flexDirection = "column";
    _0x12127d.style.overflow = VISIBLE_CONTENT_OVERFLOW_NODE_TYPES.has(_0x3ed531) ? "visible" : "hidden";
    _0x218b5b.appendChild(_0x12127d);
  }
  return {
    nodeId: _0x5a60b9,
    wrapperEl: _0x218b5b,
    instance: _0x1829a0,
    canonicalType: _0x3ed531
  };
}
export function disposePreparedRendererNodeRuntime(_0x5e6aff) {
  if (!_0x5e6aff) {
    return;
  }
  try {
    _0x5e6aff.instance?.unmount?.();
  } catch {}
  _0x5e6aff.wrapperEl?.remove?.();
}