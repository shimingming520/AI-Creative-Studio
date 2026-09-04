import { generateId } from "../../core/math.js";
import { stripImageGenerationResultStateForDerivedNode, stripImageGenerationRuntimeState } from "../../core/imageTaskRuntimeState.js";
import { calcSafeSpawnPosNearNode, createDuplicateSpawnOffsets } from "../nodeSpawn.js";
import { listModelManifests, resolveModelExecution, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { sanitizePromptHtmlForCommit } from "../nodePromptShared.js";
import { createCanvasCommandError } from "./commandRegistry.js";
import { buildGenerationParamDisplayPatch } from "./generationParamDisplay.js";
const SUPPORTED_CREATE_TYPES = new Set(["ai-text", "ai-image", "ai-video", "ai-audio", "source-text", "source-image", "source-video", "source-audio", "comment-note", "storyboard", "storyboard-script", "panorama-scene", "panorama-360", "collage", "whiteboard", "media-clip", "debug"]);
const PROMPT_NODE_TYPES = new Set(["ai-text", "ai-image", "ai-video", "ai-audio", "storyboard-script"]);
const CONNECTED_CREATE_TYPES = new Set(["ai-text", "ai-image", "ai-video", "ai-audio"]);
const CREATE_TYPE_MODEL_KINDS = Object.freeze({
  "ai-text": "text",
  "ai-image": "image",
  "ai-video": "video",
  "ai-audio": "audio",
  "storyboard-script": "text"
});
const DEFAULT_NODE_SIZES = Object.freeze({
  "ai-text": Object.freeze({
    width: 384,
    height: 288
  }),
  "ai-image": Object.freeze({
    width: 288,
    height: 288
  }),
  "ai-video": Object.freeze({
    width: 288,
    height: 288
  }),
  "ai-audio": Object.freeze({
    width: 320,
    height: 240
  }),
  "source-text": Object.freeze({
    width: 320,
    height: 180
  }),
  "comment-note": Object.freeze({
    width: 260,
    height: 120
  }),
  "storyboard-script": Object.freeze({
    width: 720,
    height: 420
  }),
  "panorama-scene": Object.freeze({
    width: 1024,
    height: 576
  })
});
const MEDIA_PREVIEW_KEYS = new Set(["base64", "dataUrl", "imageBase64", "videoBase64", "audioBase64", "thumbnailBase64", "blob", "file", "frames", "images", "videos", "audios"]);
function getState(_0x54a10d) {
  return _0x54a10d.store?.getStateRaw?.() || _0x54a10d.store?.getState?.() || {};
}
function getStore(_0x5529c4) {
  return _0x5529c4.graphStore || _0x5529c4.store;
}
function clonePlain(_0x36999f) {
  if (typeof structuredClone === "function") {
    return structuredClone(_0x36999f);
  }
  return JSON.parse(JSON.stringify(_0x36999f));
}
function normalizeNodeType(_0x536dc3) {
  return String(_0x536dc3 || "").trim();
}
function toFinitePositiveNumber(_0x5cc46d, _0x5710ff) {
  const _0x16672c = Number(_0x5cc46d);
  if (Number.isFinite(_0x16672c) && _0x16672c > 0) {
    return _0x16672c;
  } else {
    return _0x5710ff;
  }
}
function toFiniteNumber(_0x41be37, _0x4f00ca = 0) {
  const _0x5eeb15 = Number(_0x41be37);
  if (Number.isFinite(_0x5eeb15)) {
    return _0x5eeb15;
  } else {
    return _0x4f00ca;
  }
}
function getNode(_0x2abb12, _0x5f375c) {
  const _0x2e2f0c = String(_0x5f375c || "").trim();
  if (_0x2e2f0c) {
    return getState(_0x2abb12).nodes?.[_0x2e2f0c] || null;
  } else {
    return null;
  }
}
function getNodes(_0x760d6a) {
  return getState(_0x760d6a).nodes || {};
}
function getEdges(_0x22311a) {
  return getState(_0x22311a).edges || {};
}
function getInitialText(_0x4235a5 = {}) {
  if (Object.prototype.hasOwnProperty.call(_0x4235a5, "prompt")) {
    return _0x4235a5.prompt;
  }
  if (Object.prototype.hasOwnProperty.call(_0x4235a5, "text")) {
    return _0x4235a5.text;
  }
  if (Object.prototype.hasOwnProperty.call(_0x4235a5, "content")) {
    return _0x4235a5.content;
  }
  return undefined;
}
function sanitizeInitialPrompt(_0x11353c) {
  const _0x388569 = String(_0x11353c ?? "");
  if (!_0x388569.trim()) {
    return "";
  }
  if (/[<&]/.test(_0x388569)) {
    return sanitizePromptHtmlForCommit(_0x388569);
  } else {
    return _0x388569;
  }
}
function truncateText(_0x49c634, _0x626be5 = 500) {
  const _0xbf33bb = String(_0x49c634 || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (_0xbf33bb.length <= _0x626be5) {
    return _0xbf33bb;
  }
  return _0xbf33bb.slice(0, Math.max(0, _0x626be5 - 3)) + "...";
}
function omitLargeMedia(_0x282c91, _0x4e4b40 = 0) {
  if (_0x282c91 == null) {
    return _0x282c91;
  }
  if (typeof _0x282c91 !== "object") {
    return _0x282c91;
  }
  if (_0x4e4b40 > 2) {
    return "[omitted]";
  }
  if (Array.isArray(_0x282c91)) {
    return "[array:" + _0x282c91.length + "]";
  }
  const _0x559e12 = {};
  for (const [_0x577acf, _0x2d5a70] of Object.entries(_0x282c91)) {
    if (MEDIA_PREVIEW_KEYS.has(_0x577acf)) {
      _0x559e12[_0x577acf] = "[omitted]";
    } else if (typeof _0x2d5a70 === "string" && _0x2d5a70.length > 500) {
      _0x559e12[_0x577acf] = _0x2d5a70.slice(0, 120) + "...";
    } else if (_0x2d5a70 && typeof _0x2d5a70 === "object") {
      _0x559e12[_0x577acf] = omitLargeMedia(_0x2d5a70, _0x4e4b40 + 1);
    } else {
      _0x559e12[_0x577acf] = _0x2d5a70;
    }
  }
  return _0x559e12;
}
function normalizeNodeIds(_0x12b697 = {}, _0x506dab = {}, {
  min = 1,
  allowSelection = true
} = {}) {
  const _0x5008b6 = getNodes(_0x506dab);
  const _0x46e2e7 = getState(_0x506dab);
  const _0x148289 = Array.isArray(_0x12b697.ids) && _0x12b697.ids.length > 0 ? _0x12b697.ids : _0x12b697.nodeId ? [_0x12b697.nodeId] : allowSelection ? _0x46e2e7.selectedNodeIds || [] : [];
  const _0x49855b = [];
  const _0x14c111 = new Set();
  for (const _0x41b8f6 of _0x148289) {
    const _0x3755f1 = String(_0x41b8f6 || "").trim();
    if (!_0x3755f1 || _0x14c111.has(_0x3755f1)) {
      continue;
    }
    if (!_0x5008b6[_0x3755f1]) {
      throw createCanvasCommandError("NODE_NOT_FOUND", "Canvas node not found: " + _0x3755f1, {
        nodeId: _0x3755f1
      });
    }
    _0x49855b.push(_0x3755f1);
    _0x14c111.add(_0x3755f1);
  }
  if (_0x49855b.length < min) {
    throw createCanvasCommandError("INSUFFICIENT_NODES", "At least " + min + " canvas node id(s) are required.");
  }
  return _0x49855b;
}
function hasOwn(_0x4919be, _0xc63549) {
  return Object.prototype.hasOwnProperty.call(_0x4919be || {}, _0xc63549);
}
function normalizeRenameOrder(_0x77dd3e = "") {
  const _0x38c8cd = String(_0x77dd3e || "").trim().toLowerCase();
  if (_0x38c8cd === "top-to-bottom" || _0x38c8cd === "top" || _0x38c8cd === "vertical" || _0x38c8cd === "y" || _0x38c8cd === "y-asc") {
    return "top-to-bottom";
  }
  if (_0x38c8cd === "bottom-to-top" || _0x38c8cd === "bottom" || _0x38c8cd === "y-desc") {
    return "bottom-to-top";
  }
  if (_0x38c8cd === "left-to-right" || _0x38c8cd === "left" || _0x38c8cd === "horizontal" || _0x38c8cd === "x" || _0x38c8cd === "x-asc") {
    return "left-to-right";
  }
  if (_0x38c8cd === "right-to-left" || _0x38c8cd === "right" || _0x38c8cd === "x-desc") {
    return "right-to-left";
  }
  return "selection";
}
function sortRenameIds(_0x26cf07 = [], _0x1ffd7d = {}, _0x2a8e70 = "selection") {
  const _0x3e793d = normalizeRenameOrder(_0x2a8e70);
  if (_0x3e793d === "selection" || _0x26cf07.length <= 1) {
    return _0x26cf07;
  }
  const _0xd990b7 = getNodes(_0x1ffd7d);
  const _0x4c7137 = new Map(_0x26cf07.map((_0x16f5be, _0x388e49) => [_0x16f5be, _0x388e49]));
  const _0x4470ec = _0x3e793d === "top-to-bottom" || _0x3e793d === "bottom-to-top" ? "y" : "x";
  const _0x477978 = _0x4470ec === "y" ? "x" : "y";
  const _0x29dcd8 = _0x3e793d === "bottom-to-top" || _0x3e793d === "right-to-left" ? -1 : 1;
  return [..._0x26cf07].sort((_0x758a51, _0x4367ea) => {
    const _0x5050d4 = _0xd990b7[_0x758a51] || {};
    const _0x9fb749 = _0xd990b7[_0x4367ea] || {};
    const _0x559484 = (toFiniteNumber(_0x5050d4[_0x4470ec]) - toFiniteNumber(_0x9fb749[_0x4470ec])) * _0x29dcd8;
    if (_0x559484 !== 0) {
      return _0x559484;
    }
    const _0x10af8b = toFiniteNumber(_0x5050d4[_0x477978]) - toFiniteNumber(_0x9fb749[_0x477978]);
    if (_0x10af8b !== 0) {
      return _0x10af8b;
    }
    return (_0x4c7137.get(_0x758a51) || 0) - (_0x4c7137.get(_0x4367ea) || 0);
  });
}
function normalizeRenameNodeIds(_0x53198a = {}, _0xe2c530 = {}) {
  const _0x37926a = Array.isArray(_0x53198a.ids) && _0x53198a.ids.length > 0;
  const _0x3c5409 = Boolean(String(_0x53198a.nodeId || "").trim());
  const _0x3b96f1 = getState(_0xe2c530).selectedNodeIds;
  const _0x4e04f5 = Array.isArray(_0x3b96f1) && _0x3b96f1.length > 0;
  if (!_0x37926a && !_0x3c5409 && !_0x4e04f5) {
    throw createCanvasCommandError("MISSING_NODE_ID", "node.rename requires nodeId or ids.");
  }
  return normalizeNodeIds(_0x53198a, _0xe2c530, {
    min: 1,
    allowSelection: true
  });
}
function getNodeKindFromType(_0xf283c8 = "") {
  const _0x2f7a10 = String(_0xf283c8 || "");
  if (_0x2f7a10.includes("video")) {
    return "video";
  }
  if (_0x2f7a10.includes("image")) {
    return "image";
  }
  if (_0x2f7a10.includes("audio")) {
    return "audio";
  }
  if (_0x2f7a10.includes("text")) {
    return "text";
  }
  return _0x2f7a10 || "node";
}
function formatRenameTemplate(_0x2eca19 = "", _0x39f8da = {}, {
  index = 1,
  zeroIndex = 0,
  nodeId = ""
} = {}) {
  const _0x38b64d = String(_0x39f8da.type || "");
  const _0x3e6757 = {
    index: String(index),
    n: String(index),
    i: String(index),
    zeroIndex: String(zeroIndex),
    id: nodeId,
    nodeId: nodeId,
    type: _0x38b64d,
    kind: getNodeKindFromType(_0x38b64d),
    name: String(_0x39f8da.name || ""),
    originalName: String(_0x39f8da.name || "")
  };
  return String(_0x2eca19).replace(/\{(index|n|i|zeroIndex|id|nodeId|type|kind|name|originalName)\}/g, (_0x3862e4, _0x3de0fe) => _0x3e6757[_0x3de0fe] ?? "");
}
function getRenameStartIndex(_0x13680b = {}) {
  const _0x5881e5 = Number(_0x13680b.startIndex ?? _0x13680b.start ?? 1);
  if (Number.isFinite(_0x5881e5)) {
    return Math.trunc(_0x5881e5);
  } else {
    return 1;
  }
}
function buildNumberedRenameName(_0x38db14 = {}, _0x3feed7 = 0) {
  const _0x1b3454 = getRenameStartIndex(_0x38db14);
  const _0x331f6a = _0x1b3454 + _0x3feed7;
  const _0x20b3b2 = String(_0x38db14.separator ?? " ");
  const _0x42ab17 = String(_0x38db14.prefix ?? "");
  const _0x24676b = hasOwn(_0x38db14, "name") ? String(_0x38db14.name ?? "").trim() : "";
  const _0x34e920 = String(_0x38db14.suffix ?? "");
  const _0x1b26ad = [String(_0x331f6a), _0x24676b].filter(_0x35b4b2 => _0x35b4b2 !== "").join(_0x20b3b2);
  return ("" + _0x42ab17 + _0x1b26ad + _0x34e920).trim();
}
function hasRenameNameInput(_0x3fd3ff = {}) {
  return hasOwn(_0x3fd3ff, "name") || Array.isArray(_0x3fd3ff.names) && _0x3fd3ff.names.length > 0 || hasOwn(_0x3fd3ff, "nameTemplate") || hasOwn(_0x3fd3ff, "template") || hasOwn(_0x3fd3ff, "pattern") || _0x3fd3ff.numbered === true || hasOwn(_0x3fd3ff, "startIndex") || hasOwn(_0x3fd3ff, "start");
}
function resolveRenameNames(_0xaaf540 = {}, _0x21660c = [], _0x26a01f = {}) {
  if (!hasRenameNameInput(_0xaaf540)) {
    throw createCanvasCommandError("MISSING_NODE_NAME", "node.rename requires name.");
  }
  if (Array.isArray(_0xaaf540.names) && _0xaaf540.names.length > 0) {
    if (_0xaaf540.names.length !== _0x21660c.length) {
      throw createCanvasCommandError("RENAME_NAME_COUNT_MISMATCH", "node.rename names length must match target ids length.", {
        ids: _0x21660c,
        names: _0xaaf540.names
      });
    }
    return _0xaaf540.names.map(_0x20317f => String(_0x20317f ?? "").trim());
  }
  const _0x2f25fc = String(_0xaaf540.nameTemplate ?? _0xaaf540.template ?? _0xaaf540.pattern ?? "");
  if (_0x2f25fc) {
    const _0x3f1e88 = getRenameStartIndex(_0xaaf540);
    return _0x21660c.map((_0x5133de, _0x81437f) => formatRenameTemplate(_0x2f25fc, getNode(_0x26a01f, _0x5133de) || {}, {
      index: _0x3f1e88 + _0x81437f,
      zeroIndex: _0x81437f,
      nodeId: _0x5133de
    }).trim());
  }
  const _0x5c81ad = _0xaaf540.numbered === true || hasOwn(_0xaaf540, "startIndex") || hasOwn(_0xaaf540, "start") || hasOwn(_0xaaf540, "separator");
  if (_0x5c81ad) {
    return _0x21660c.map((_0x320407, _0xf2ffb5) => buildNumberedRenameName(_0xaaf540, _0xf2ffb5));
  }
  const _0x5f2433 = String(_0xaaf540.name ?? "").trim();
  return _0x21660c.map(() => _0x5f2433);
}
function buildRenameEntries(_0x3ab990 = {}, _0x42885a = {}) {
  const _0x10ff14 = sortRenameIds(normalizeRenameNodeIds(_0x3ab990, _0x42885a), _0x42885a, _0x3ab990.orderBy ?? _0x3ab990.order);
  const _0x5225d5 = resolveRenameNames(_0x3ab990, _0x10ff14, _0x42885a);
  return _0x10ff14.map((_0x2f4e1f, _0x253e62) => ({
    nodeId: _0x2f4e1f,
    name: _0x5225d5[_0x253e62]
  }));
}
function normalizeEdgeId(_0x113316) {
  return String(_0x113316 || "").trim();
}
function normalizeEdgeArgs(_0x3818ef = {}) {
  return {
    edgeId: normalizeEdgeId(_0x3818ef.edgeId || _0x3818ef.id),
    sourceId: String(_0x3818ef.sourceId || _0x3818ef.source || "").trim(),
    targetId: String(_0x3818ef.targetId || _0x3818ef.target || "").trim(),
    refSlot: String(_0x3818ef.refSlot || _0x3818ef.slot || "").trim()
  };
}
function findEdgesByEndpoints(_0x35a85e, {
  sourceId: _0x1ecf3f,
  targetId: _0x4629e2,
  refSlot = ""
}) {
  return Object.values(getEdges(_0x35a85e)).filter(_0x1d2f75 => {
    if (!_0x1d2f75) {
      return false;
    }
    if (_0x1ecf3f && _0x1d2f75.sourceId !== _0x1ecf3f) {
      return false;
    }
    if (_0x4629e2 && _0x1d2f75.targetId !== _0x4629e2) {
      return false;
    }
    if (refSlot && String(_0x1d2f75.refSlot || "") !== refSlot) {
      return false;
    }
    return true;
  });
}
function resolveCreateSize(_0x2d0cd0, _0x2a1db7 = {}, _0x32c8f7 = {}) {
  const _0x18fa45 = DEFAULT_NODE_SIZES[_0x2d0cd0] || {
    width: 300,
    height: 300
  };
  let _0x3d6f93 = null;
  if (PROMPT_NODE_TYPES.has(_0x2d0cd0) && typeof _0x32c8f7.getAIGenerationDefaultSizeByType === "function") {
    _0x3d6f93 = _0x32c8f7.getAIGenerationDefaultSizeByType(_0x2d0cd0);
  } else if (typeof _0x32c8f7.getNodeDefaultSize === "function") {
    _0x3d6f93 = _0x32c8f7.getNodeDefaultSize(_0x2d0cd0);
  }
  const _0x12829b = _0x3d6f93 && typeof _0x3d6f93 === "object" ? _0x3d6f93 : _0x18fa45;
  return {
    width: toFinitePositiveNumber(_0x2a1db7.width, toFinitePositiveNumber(_0x12829b.width, _0x18fa45.width)),
    height: toFinitePositiveNumber(_0x2a1db7.height, toFinitePositiveNumber(_0x12829b.height, _0x18fa45.height))
  };
}
function hasExplicitCreatePosition(_0x3f6fd4 = {}) {
  return Number.isFinite(Number(_0x3f6fd4.x)) && Number.isFinite(Number(_0x3f6fd4.y));
}
function buildConnectedNodeData(_0x152dfa = {}, _0x14a8e0 = {}) {
  const _0x33de7e = getNode(_0x14a8e0, _0x152dfa.sourceId);
  const _0x4c5500 = resolveCreateSize(_0x152dfa.type, _0x152dfa, _0x14a8e0);
  const _0x2ac1b9 = (_0x152dfa.type === "ai-image" || _0x152dfa.type === "ai-video") && toFinitePositiveNumber(_0x33de7e?.width, 0) > 0 && toFinitePositiveNumber(_0x33de7e?.height, 0) > 0 && typeof _0x14a8e0.getAIGenerationNodeSize === "function";
  const _0x585991 = _0x2ac1b9 ? _0x14a8e0.getAIGenerationNodeSize(_0x33de7e.width, _0x33de7e.height) : _0x4c5500;
  const _0x3838f7 = toFinitePositiveNumber(_0x585991?.width, _0x4c5500.width);
  const _0x159e98 = toFinitePositiveNumber(_0x585991?.height, _0x4c5500.height);
  const _0x3bbe84 = calcSafeSpawnPosNearNode(getNodes(_0x14a8e0), _0x33de7e, _0x3838f7, _0x159e98);
  const _0x3ba0d8 = generateId(_0x152dfa.type);
  let _0x1ad2ce = {
    id: _0x3ba0d8,
    type: _0x152dfa.type,
    x: _0x3bbe84.x,
    y: _0x3bbe84.y,
    width: _0x3838f7,
    height: _0x159e98,
    name: String(_0x152dfa.name || _0x152dfa.label || "")
  };
  if ((_0x152dfa.type === "ai-image" || _0x152dfa.type === "ai-video") && !Object.prototype.hasOwnProperty.call(_0x1ad2ce, "aspectRatio")) {
    _0x1ad2ce.aspectRatio = "自适应";
  }
  if (_0x152dfa.inheritSource !== false && _0x33de7e?.type === _0x152dfa.type) {
    const _0x327cc3 = clonePlain(_0x33de7e);
    delete _0x327cc3.id;
    delete _0x327cc3.x;
    delete _0x327cc3.y;
    delete _0x327cc3.width;
    delete _0x327cc3.height;
    delete _0x327cc3.name;
    delete _0x327cc3.prompt;
    delete _0x327cc3.outputText;
    stripImageGenerationResultStateForDerivedNode(_0x327cc3);
    _0x1ad2ce = {
      ..._0x327cc3,
      ..._0x1ad2ce
    };
  }
  return _0x1ad2ce;
}
function applyInitialNodeText(_0x3fd427, _0x58164f, _0x140351) {
  const _0x3fe85a = getInitialText(_0x58164f);
  if (_0x3fe85a === undefined || _0x3fe85a === null) {
    return _0x3fd427;
  }
  const _0x4de5cd = String(_0x3fd427?.id || "").trim();
  const _0x462246 = String(_0x3fd427?.type || "").trim();
  if (!_0x4de5cd) {
    return _0x3fd427;
  }
  let _0x4fd697 = null;
  if (PROMPT_NODE_TYPES.has(_0x462246)) {
    _0x4fd697 = {
      prompt: sanitizeInitialPrompt(_0x3fe85a)
    };
  } else if (_0x462246 === "source-text" || _0x462246 === "comment-note") {
    _0x4fd697 = {
      content: String(_0x3fe85a || "")
    };
  }
  if (!_0x4fd697) {
    return _0x3fd427;
  }
  getStore(_0x140351)?.updateNodeData?.(_0x4de5cd, _0x4fd697);
  _0x140351.commit?.();
  return getNode(_0x140351, _0x4de5cd) || {
    ..._0x3fd427,
    ..._0x4fd697
  };
}
function isImageNodeType(_0x315418 = "") {
  const _0x27ed0f = String(_0x315418 || "");
  return _0x27ed0f === "ai-image" || _0x27ed0f === "source-image";
}
function hasSelectedImageInput(_0x1eaed7 = {}) {
  const _0x26acdd = getState(_0x1eaed7);
  const _0x3ae16a = Array.isArray(_0x26acdd.selectedNodeIds) ? _0x26acdd.selectedNodeIds : [];
  return _0x3ae16a.some(_0x5f23ac => isImageNodeType(_0x26acdd.nodes?.[_0x5f23ac]?.type));
}
function manifestAllowsImageInput(_0x208540 = {}) {
  const _0xb69ed1 = _0x208540?.inputSlots && typeof _0x208540.inputSlots === "object" ? _0x208540.inputSlots : {};
  const _0x2a8041 = Array.isArray(_0xb69ed1.allowedKinds) ? _0xb69ed1.allowedKinds : [];
  if (_0x2a8041.includes("image")) {
    return true;
  }
  const _0x58268a = Number(_0xb69ed1.maxByKind?.image);
  return Number.isFinite(_0x58268a) && _0x58268a > 0;
}
function manifestAllowsTextInput(_0x19b687 = {}) {
  const _0x214016 = _0x19b687?.inputSlots && typeof _0x19b687.inputSlots === "object" ? _0x19b687.inputSlots : {};
  const _0x37aa4a = Array.isArray(_0x214016.allowedKinds) ? _0x214016.allowedKinds : [];
  return _0x37aa4a.length === 0 || _0x37aa4a.includes("text");
}
function manifestRequiresMissingMedia(_0x598826 = {}, {
  hasImageInput = false
} = {}) {
  const _0x2c3c32 = _0x598826?.inputSlots && typeof _0x598826.inputSlots === "object" ? _0x598826.inputSlots : {};
  const _0x317664 = _0x2c3c32.minByKind || {};
  if (!hasImageInput && Number(_0x317664.image) > 0) {
    return true;
  }
  if (Number(_0x317664.video) > 0) {
    return true;
  }
  if (Number(_0x317664.audio) > 0) {
    return true;
  }
  const _0x5c8d78 = Array.isArray(_0x2c3c32.fixedSlots) ? _0x2c3c32.fixedSlots : [];
  return _0x5c8d78.some(_0xe2fce4 => {
    if (_0xe2fce4?.required !== true) {
      return false;
    }
    const _0xfd057e = String(_0xe2fce4?.kind || "");
    if (_0xfd057e === "image") {
      return !hasImageInput;
    }
    return _0xfd057e === "video" || _0xfd057e === "audio";
  });
}
function getManifestFieldIds(_0x26c4ce = {}) {
  return new Set((Array.isArray(_0x26c4ce?.uiSchema?.fields) ? _0x26c4ce.uiSchema.fields : []).map(_0x393fbb => String(_0x393fbb?.id || "").trim()).filter(Boolean));
}
function findAutoCreateModel(_0x179a28 = {}, _0x180370 = "", _0x37b87a = {}) {
  if (_0x180370 !== "ai-video") {
    return null;
  }
  const _0x2fadf1 = hasSelectedImageInput(_0x37b87a);
  const _0x29f27a = _0x179a28.params && typeof _0x179a28.params === "object" && !Array.isArray(_0x179a28.params) ? Object.keys(_0x179a28.params) : [];
  const _0x50c085 = listModelManifests().filter(_0x4384f0 => _0x4384f0?.kind === "video" && _0x4384f0?.modelId && (_0x2fadf1 ? manifestAllowsImageInput(_0x4384f0) : manifestAllowsTextInput(_0x4384f0)) && !manifestRequiresMissingMedia(_0x4384f0, {
    hasImageInput: _0x2fadf1
  })).map(_0x2c09a7 => {
    const _0x2c9fe7 = getManifestFieldIds(_0x2c09a7);
    let _0x24d6f8 = _0x2c09a7.vip === true ? 0 : 10;
    if (!_0x2fadf1 && !manifestAllowsImageInput(_0x2c09a7)) {
      _0x24d6f8 += 8;
    }
    for (const _0xbcbc91 of _0x29f27a) {
      if (_0x2c9fe7.has(_0xbcbc91)) {
        _0x24d6f8 += 20;
      }
    }
    if (_0x2c9fe7.has("duration")) {
      _0x24d6f8 += 8;
    }
    if (_0x2c9fe7.has("aspectRatio")) {
      _0x24d6f8 += 4;
    }
    const _0x4c4330 = Number(_0x2c09a7.extensions?.videoMenu?.order) || 0;
    _0x24d6f8 += Math.max(0, 100 - _0x4c4330) / 100;
    return {
      manifest: _0x2c09a7,
      score: _0x24d6f8
    };
  }).sort((_0x118e32, _0x9e6796) => {
    if (_0x9e6796.score !== _0x118e32.score) {
      return _0x9e6796.score - _0x118e32.score;
    }
    return String(_0x118e32.manifest.modelId).localeCompare(String(_0x9e6796.manifest.modelId));
  });
  return _0x50c085[0]?.manifest || null;
}
function isAutoModelPlaceholder(_0x29c219 = "") {
  const _0x2d6f36 = String(_0x29c219 || "").trim().toLowerCase();
  return !_0x2d6f36 || _0x2d6f36 === "auto" || _0x2d6f36 === "default" || _0x2d6f36 === "unknown";
}
function validateCreateModelArgs(_0x551358 = {}, _0x27bc79 = "", _0x2732df = {}) {
  const _0x3fbe71 = String(_0x551358.model || _0x551358.modelId || "").trim();
  if (isAutoModelPlaceholder(_0x3fbe71)) {
    const _0x124161 = findAutoCreateModel(_0x551358, _0x27bc79, _0x2732df);
    if (_0x124161) {
      return {
        args: {
          model: _0x124161.modelId,
          provider: _0x124161.provider || ""
        }
      };
    }
    const _0x2e589b = _0x551358.params && typeof _0x551358.params === "object" && !Array.isArray(_0x551358.params) && Object.keys(_0x551358.params).length > 0;
    if (CREATE_TYPE_MODEL_KINDS[_0x27bc79] && _0x2e589b) {
      return {
        ok: false,
        errorCode: "MODEL_REQUIRED_FOR_PARAMS",
        message: "node.create requires a resolvable model when params are provided."
      };
    }
    return {
      args: {}
    };
  }
  const _0x15e526 = String(_0x551358.provider || "").trim();
  const _0x127b37 = resolveModelExecution(_0x3fbe71, {
    providerHint: _0x15e526
  });
  const _0xd23766 = _0x127b37?.modelManifest;
  if (!_0xd23766) {
    return {
      ok: false,
      errorCode: "MODEL_MANIFEST_NOT_FOUND",
      message: "Model manifest not found: " + _0x3fbe71
    };
  }
  const _0x3f3bc1 = CREATE_TYPE_MODEL_KINDS[_0x27bc79] || "";
  if (_0x3f3bc1 && String(_0xd23766.kind || "") !== _0x3f3bc1) {
    return {
      ok: false,
      errorCode: "MODEL_KIND_MISMATCH",
      message: "Model " + _0x3fbe71 + " is " + (_0xd23766.kind || "(unknown)") + ", not " + _0x3f3bc1 + "."
    };
  }
  return {
    args: {
      model: _0xd23766.modelId || _0x3fbe71,
      provider: _0xd23766.provider || _0x15e526
    }
  };
}
function applyInitialNodeModel(_0x30327a, _0xd1464d, _0x32bf10) {
  const _0x4d9f72 = String(_0xd1464d.model || "").trim();
  if (!_0x4d9f72) {
    return _0x30327a;
  }
  const _0x105eea = String(_0x30327a?.id || "").trim();
  if (!_0x105eea) {
    return _0x30327a;
  }
  const _0x12cf52 = resolveModelExecution(_0x4d9f72, {
    providerHint: String(_0xd1464d.provider || "").trim()
  });
  const _0x3a41ab = _0x12cf52?.modelManifest || null;
  const _0x597474 = _0x30327a?.generationParams && typeof _0x30327a.generationParams === "object" && !Array.isArray(_0x30327a.generationParams) ? _0x30327a.generationParams : {};
  const _0x421250 = _0xd1464d.params && typeof _0xd1464d.params === "object" && !Array.isArray(_0xd1464d.params) ? _0xd1464d.params : {};
  const _0x25977a = _0x3a41ab ? sanitizeModelUiSchemaParams(_0x3a41ab.modelId, {
    ..._0x597474,
    ..._0x421250
  }, {
    includeDefaults: true
  }) : {};
  const _0x336825 = getStore(_0x32bf10);
  const _0x5e6648 = {
    model: _0x4d9f72,
    provider: String(_0xd1464d.provider || "").trim(),
    generationParams: _0x25977a,
    ...buildGenerationParamDisplayPatch({
      store: _0x336825,
      nodeId: _0x105eea,
      nodeData: _0x30327a,
      modelId: _0x4d9f72,
      generationParams: _0x25977a,
      force: true,
      respectManualDisplaySize: false
    })
  };
  _0x336825?.updateNodeData?.(_0x105eea, _0x5e6648);
  _0x32bf10.commit?.();
  return getNode(_0x32bf10, _0x105eea) || {
    ..._0x30327a,
    ..._0x5e6648
  };
}
function buildNodeSummary(_0x24c36d, _0x2aef98, {
  includeData = false
} = {}) {
  const _0x33f4ab = getNode(_0x24c36d, _0x2aef98);
  if (!_0x33f4ab) {
    return null;
  }
  const _0x5dfe5d = resolveModelExecution(_0x33f4ab.model, {
    providerHint: _0x33f4ab.provider
  });
  const _0x11cf5b = {
    id: String(_0x33f4ab.id || _0x2aef98),
    type: String(_0x33f4ab.type || ""),
    name: String(_0x33f4ab.name || ""),
    promptPreview: truncateText(_0x33f4ab.prompt || _0x33f4ab.storyboardScript?.prompt || ""),
    contentPreview: truncateText(_0x33f4ab.content || ""),
    model: String(_0x33f4ab.model || ""),
    provider: String(_0x33f4ab.provider || ""),
    adapterType: String(_0x5dfe5d?.modelManifest?.adapterType || _0x5dfe5d?.executionManifest?.adapterType || ""),
    x: toFiniteNumber(_0x33f4ab.x),
    y: toFiniteNumber(_0x33f4ab.y),
    width: toFiniteNumber(_0x33f4ab.width),
    height: toFiniteNumber(_0x33f4ab.height),
    jobStatus: String(_0x33f4ab.jobStatus || _0x33f4ab.storyboardScript?.jobStatus || (_0x33f4ab.isGenerating ? "running" : "idle"))
  };
  if (includeData) {
    _0x11cf5b.data = omitLargeMedia(_0x33f4ab);
  }
  return _0x11cf5b;
}
function buildCanvasSummary(_0x487afe) {
  const _0x4820f1 = getState(_0x487afe);
  const _0x530c1d = Object.keys(_0x4820f1.nodes || {}).map(_0x36ad98 => buildNodeSummary(_0x487afe, _0x36ad98));
  const _0x271f7a = Object.values(_0x4820f1.edges || {}).map(_0x390163 => ({
    id: String(_0x390163?.id || ""),
    sourceId: String(_0x390163?.sourceId || ""),
    targetId: String(_0x390163?.targetId || ""),
    refSlot: String(_0x390163?.refSlot || ""),
    type: String(_0x390163?.type || "")
  }));
  return {
    selectedNodeIds: Array.isArray(_0x4820f1.selectedNodeIds) ? [..._0x4820f1.selectedNodeIds] : [],
    nodes: _0x530c1d,
    edges: _0x271f7a,
    viewport: {
      x: toFiniteNumber(_0x4820f1.viewport?.x),
      y: toFiniteNumber(_0x4820f1.viewport?.y),
      zoom: toFiniteNumber(_0x4820f1.viewport?.zoom, 1)
    },
    nodeCount: _0x530c1d.length,
    edgeCount: _0x271f7a.length
  };
}
function validateNodeIds(_0x48771e, _0x4d4542, _0x4d4081) {
  try {
    return {
      args: {
        ..._0x48771e,
        ids: normalizeNodeIds(_0x48771e, _0x4d4542, _0x4d4081)
      }
    };
  } catch (_0x5b9430) {
    return {
      ok: false,
      errorCode: _0x5b9430.errorCode || "INVALID_NODE_IDS",
      message: _0x5b9430.message,
      details: _0x5b9430.details
    };
  }
}
function validateDeleteNodeIds(_0x2e2715 = {}, _0x301132 = {}) {
  if (String(_0x2e2715.nodeId || "").trim()) {
    return validateNodeIds(_0x2e2715, _0x301132, {
      min: 1,
      allowSelection: true
    });
  }
  const _0xe643b0 = getState(_0x301132);
  const _0x543e5c = Array.isArray(_0x2e2715.ids) && _0x2e2715.ids.length > 0 ? _0x2e2715.ids : _0xe643b0.selectedNodeIds || [];
  const _0x460346 = [];
  const _0x3f9767 = new Set();
  for (const _0x41e607 of _0x543e5c) {
    const _0x25ad72 = String(_0x41e607 || "").trim();
    if (!_0x25ad72 || _0x3f9767.has(_0x25ad72) || !_0xe643b0.nodes?.[_0x25ad72]) {
      continue;
    }
    _0x3f9767.add(_0x25ad72);
    _0x460346.push(_0x25ad72);
  }
  if (_0x460346.length === 0) {
    return {
      ok: false,
      errorCode: "INSUFFICIENT_NODES",
      message: "node.delete requires at least one existing node."
    };
  }
  return {
    args: {
      ..._0x2e2715,
      ids: _0x460346
    }
  };
}
export function registerGraphCommands(_0x3fe2c1) {
  _0x3fe2c1.register({
    id: "node.create",
    description: "Create a canvas node.",
    riskLevel: "safe",
    argsSchema: {
      required: ["type"],
      properties: {
        type: {
          type: "string",
          enum: Array.from(SUPPORTED_CREATE_TYPES)
        },
        name: {
          type: "string"
        },
        prompt: {
          type: "string"
        },
        text: {
          type: "string"
        },
        content: {
          type: "string"
        },
        model: {
          type: "string"
        },
        modelId: {
          type: "string"
        },
        provider: {
          type: "string"
        },
        params: {
          type: "object"
        },
        width: {
          type: "number"
        },
        height: {
          type: "number"
        },
        x: {
          type: "number"
        },
        y: {
          type: "number"
        },
        placement: {
          type: "string"
        },
        sequenceKey: {
          type: "string"
        }
      },
      defaults: {
        width: "node default",
        height: "node default",
        placement: "viewport-center-sequence"
      }
    },
    capabilitySchema: {
      reads: ["cursor", "selection", "modelRegistry"],
      writes: ["nodes", "selection"]
    },
    returnSchema: {
      aliasFields: ["nodeId", "node"]
    },
    validate(_0x25fb64 = {}, _0x163917 = {}) {
      const _0x521b5f = normalizeNodeType(_0x25fb64.type);
      if (!SUPPORTED_CREATE_TYPES.has(_0x521b5f)) {
        return {
          ok: false,
          errorCode: "UNSUPPORTED_NODE_TYPE",
          message: "Unsupported node.create type: " + (_0x521b5f || "(empty)")
        };
      }
      const _0x5b190b = hasExplicitCreatePosition(_0x25fb64) && typeof _0x163917.buildNodeData === "function";
      if (!_0x5b190b && typeof _0x163917.createNodeAtCursor !== "function") {
        return {
          ok: false,
          errorCode: "NODE_CREATE_UNAVAILABLE",
          message: "Canvas node creation flow is unavailable."
        };
      }
      const _0x42e26d = validateCreateModelArgs(_0x25fb64, _0x521b5f, _0x163917);
      if (_0x42e26d.ok === false) {
        return _0x42e26d;
      }
      return {
        args: {
          ..._0x25fb64,
          ..._0x42e26d.args,
          type: _0x521b5f
        }
      };
    },
    execute(_0x3cdde0, _0x3756fa) {
      const {
        width: _0x29c75c,
        height: _0x5bcd31
      } = resolveCreateSize(_0x3cdde0.type, _0x3cdde0, _0x3756fa);
      const _0x3106a0 = String(_0x3cdde0.name || _0x3cdde0.label || "");
      const _0x4c7cbe = _0x3cdde0.agentReservation === true;
      const _0x5c246d = _0x4c7cbe ? [...(Array.isArray(getState(_0x3756fa).selectedNodeIds) ? getState(_0x3756fa).selectedNodeIds : [])] : [];
      const _0x9ef409 = String(_0x3cdde0.reuseNodeId || "").trim();
      const _0x53bdd0 = _0x9ef409 ? getNode(_0x3756fa, _0x9ef409) : null;
      if (_0x53bdd0 && String(_0x53bdd0.type || "").trim() === _0x3cdde0.type) {
        const _0x3d8b31 = getStore(_0x3756fa);
        const _0x13c711 = {
          ..._0x3756fa,
          commit: null
        };
        if (Object.prototype.hasOwnProperty.call(_0x3cdde0, "name") || _0x3cdde0.label != null) {
          _0x3d8b31?.updateNodeData?.(_0x9ef409, {
            name: _0x3106a0
          });
        }
        const _0x387904 = applyInitialNodeModel(getNode(_0x3756fa, _0x9ef409) || _0x53bdd0, _0x3cdde0, _0x13c711);
        const _0x5026ec = applyInitialNodeText(_0x387904, _0x3cdde0, _0x13c711);
        _0x3d8b31?.setSelectedNodes?.([_0x9ef409]);
        _0x3756fa.commit?.();
        return {
          nodeId: _0x9ef409,
          node: getNode(_0x3756fa, _0x9ef409) || _0x5026ec || _0x53bdd0,
          reused: true
        };
      }
      if (hasExplicitCreatePosition(_0x3cdde0) && typeof _0x3756fa.buildNodeData === "function") {
        const _0x25d640 = generateId(_0x3cdde0.type);
        const _0x18f91c = _0x3756fa.buildNodeData({
          ..._0x3cdde0,
          id: _0x25d640,
          type: _0x3cdde0.type,
          name: _0x3106a0,
          width: _0x29c75c,
          height: _0x5bcd31,
          x: Number(_0x3cdde0.x),
          y: Number(_0x3cdde0.y)
        });
        if (!_0x18f91c || typeof _0x18f91c !== "object") {
          throw createCanvasCommandError("NODE_CREATE_FAILED", "Canvas node factory did not return data for type: " + _0x3cdde0.type);
        }
        getStore(_0x3756fa)?.addNode?.(_0x18f91c);
        getStore(_0x3756fa)?.setSelectedNodes?.(_0x4c7cbe ? _0x5c246d : [_0x25d640]);
        const _0x40eb3b = {
          ..._0x3756fa,
          commit: null
        };
        const _0x3ed48c = applyInitialNodeModel(_0x18f91c, _0x3cdde0, _0x40eb3b);
        const _0x189d52 = applyInitialNodeText(_0x3ed48c, _0x3cdde0, _0x40eb3b);
        _0x3756fa.commit?.();
        return {
          nodeId: _0x189d52?.id || _0x25d640,
          node: _0x189d52 || _0x18f91c
        };
      }
      const _0x274d5f = String(_0x3cdde0.placement || "viewport-center-sequence").trim();
      const _0x13037b = String(_0x3cdde0.sequenceKey || _0x3756fa.createNodeSequenceKey || "").trim();
      const _0x20aac2 = _0x3756fa.createNodeAtCursor(_0x3cdde0.type, _0x29c75c, _0x5bcd31, _0x3106a0, {
        placement: _0x274d5f,
        sequenceKey: _0x13037b
      });
      if (_0x4c7cbe) {
        getStore(_0x3756fa)?.setSelectedNodes?.(_0x5c246d);
      }
      const _0x52fca5 = applyInitialNodeModel(_0x20aac2, _0x3cdde0, _0x3756fa);
      const _0x22a198 = applyInitialNodeText(_0x52fca5, _0x3cdde0, _0x3756fa);
      return {
        nodeId: _0x22a198?.id || _0x20aac2?.id || "",
        node: _0x22a198 || _0x20aac2
      };
    }
  });
  _0x3fe2c1.register({
    id: "node.createConnected",
    description: "Create a generation node next to a source node and connect them.",
    riskLevel: "safe",
    argsSchema: {
      required: ["sourceId", "type"],
      properties: {
        sourceId: {
          type: "string"
        },
        type: {
          type: "string",
          enum: Array.from(CONNECTED_CREATE_TYPES)
        },
        name: {
          type: "string"
        },
        label: {
          type: "string"
        },
        width: {
          type: "number"
        },
        height: {
          type: "number"
        },
        inheritSource: {
          type: "boolean"
        }
      },
      defaults: {
        inheritSource: true,
        placement: "right-of-source"
      }
    },
    capabilitySchema: {
      reads: ["nodes", "edges"],
      writes: ["nodes", "edges", "selection"]
    },
    returnSchema: {
      aliasFields: ["nodeId", "node", "edgeId", "sourceId"]
    },
    validate(_0x396b97 = {}, _0x21aaef = {}) {
      const _0x419917 = String(_0x396b97.sourceId || "").trim();
      const _0x10fd58 = normalizeNodeType(_0x396b97.type);
      if (!_0x419917) {
        return {
          ok: false,
          errorCode: "MISSING_SOURCE_NODE_ID",
          message: "node.createConnected requires sourceId."
        };
      }
      if (!getNode(_0x21aaef, _0x419917)) {
        return {
          ok: false,
          errorCode: "NODE_NOT_FOUND",
          message: "Canvas node not found: " + _0x419917
        };
      }
      if (!CONNECTED_CREATE_TYPES.has(_0x10fd58)) {
        return {
          ok: false,
          errorCode: "UNSUPPORTED_NODE_TYPE",
          message: "Unsupported node.createConnected type: " + (_0x10fd58 || "(empty)")
        };
      }
      return {
        args: {
          ..._0x396b97,
          sourceId: _0x419917,
          type: _0x10fd58
        }
      };
    },
    execute(_0xfd7737, _0x445b5b) {
      const _0x2a155b = getStore(_0x445b5b);
      const _0x38c292 = buildConnectedNodeData(_0xfd7737, _0x445b5b);
      const _0x34c39e = new Set(Object.keys(getEdges(_0x445b5b)));
      _0x2a155b?.addNode?.(_0x38c292);
      const _0x43e54b = typeof _0x445b5b.connectNodes === "function" ? _0x445b5b.connectNodes({
        sourceId: _0xfd7737.sourceId,
        targetId: _0x38c292.id
      }) : false;
      let _0xd1f35a = "";
      if (_0x43e54b) {
        _0xd1f35a = Object.keys(getEdges(_0x445b5b)).find(_0x30ad17 => !_0x34c39e.has(_0x30ad17)) || "";
      } else {
        const _0x3c677a = {
          id: generateId("edge"),
          sourceId: _0xfd7737.sourceId,
          targetId: _0x38c292.id,
          createdAt: Date.now()
        };
        _0x2a155b?.addEdge?.(_0x3c677a);
        _0xd1f35a = _0x3c677a.id;
      }
      _0x2a155b?.setSelectedNodes?.([_0x38c292.id]);
      _0x445b5b.commit?.();
      return {
        nodeId: _0x38c292.id,
        node: _0x38c292,
        edgeId: _0xd1f35a,
        sourceId: _0xfd7737.sourceId
      };
    }
  });
  _0x3fe2c1.register({
    id: "node.delete",
    description: "Delete canvas nodes.",
    riskLevel: "danger",
    argsSchema: {
      properties: {
        nodeId: {
          type: "string"
        },
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["nodes", "edges", "selection"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids"]
    },
    validate(_0x1b6f5f = {}, _0x67ac37 = {}) {
      return validateDeleteNodeIds(_0x1b6f5f, _0x67ac37);
    },
    execute(_0x1b0165, _0xb2f26e) {
      const _0x2e1451 = getStore(_0xb2f26e);
      _0x2e1451?.deleteNodes?.(_0x1b0165.ids);
      if (typeof _0x2e1451?.clearSelection === "function") {
        _0x2e1451.clearSelection();
      } else {
        _0x2e1451?.setSelectedNodes?.([]);
      }
      _0xb2f26e.commit?.();
      return {
        ids: _0x1b0165.ids
      };
    }
  });
  _0x3fe2c1.register({
    id: "node.rename",
    description: "Rename one or more canvas nodes.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        nodeId: {
          type: "string"
        },
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        name: {
          type: "string"
        },
        names: {
          type: "array",
          items: {
            type: "string"
          }
        },
        nameTemplate: {
          type: "string"
        },
        template: {
          type: "string"
        },
        pattern: {
          type: "string"
        },
        numbered: {
          type: "boolean"
        },
        startIndex: {
          type: "number"
        },
        start: {
          type: "number"
        },
        separator: {
          type: "string"
        },
        prefix: {
          type: "string"
        },
        suffix: {
          type: "string"
        },
        orderBy: {
          type: "string"
        },
        order: {
          type: "string"
        }
      },
      defaults: {
        selectionFallback: true,
        orderBy: "selection",
        startIndex: 1
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["nodeId", "name", "ids", "names", "renamed"]
    },
    validate(_0x515414 = {}, _0x338c58 = {}) {
      try {
        const _0x2b8870 = buildRenameEntries(_0x515414, _0x338c58);
        const _0x28a0d8 = _0x2b8870[0] || {};
        return {
          args: {
            ..._0x515414,
            entries: _0x2b8870,
            nodeId: _0x28a0d8.nodeId || "",
            name: _0x28a0d8.name ?? "",
            ids: _0x2b8870.map(_0x14ce0b => _0x14ce0b.nodeId),
            names: _0x2b8870.map(_0x298853 => _0x298853.name)
          }
        };
      } catch (_0x141c96) {
        return {
          ok: false,
          errorCode: _0x141c96.errorCode || "INVALID_RENAME_ARGS",
          message: _0x141c96.message || "Invalid node.rename args.",
          details: _0x141c96.details
        };
      }
    },
    execute(_0x127179, _0x33f322) {
      const _0x460b90 = getStore(_0x33f322);
      const _0x3dc405 = Array.isArray(_0x127179.entries) ? _0x127179.entries : [];
      const _0x6d0337 = () => {
        for (const _0x2182b6 of _0x3dc405) {
          if (typeof _0x460b90?.renameNode === "function") {
            _0x460b90.renameNode(_0x2182b6.nodeId, _0x2182b6.name);
          } else {
            _0x460b90?.updateNodeData?.(_0x2182b6.nodeId, {
              name: _0x2182b6.name
            });
          }
        }
      };
      if (_0x3dc405.length > 1 && typeof _0x460b90?.batch === "function") {
        _0x460b90.batch(_0x6d0337);
      } else {
        _0x6d0337();
      }
      _0x33f322.commit?.();
      return {
        nodeId: _0x127179.nodeId,
        name: _0x127179.name,
        ids: _0x3dc405.map(_0x438867 => _0x438867.nodeId),
        names: _0x3dc405.map(_0x100033 => _0x100033.name),
        renamed: _0x3dc405
      };
    }
  });
  _0x3fe2c1.register({
    id: "node.duplicate",
    description: "Duplicate canvas nodes.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        nodeId: {
          type: "string"
        },
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        copies: {
          type: "integer",
          minimum: 1,
          maximum: 12
        },
        dx: {
          type: "number"
        },
        dy: {
          type: "number"
        },
        placement: {
          type: "string",
          enum: ["offset", "spawn-preferences"]
        },
        edgePolicy: {
          type: "string",
          enum: ["internal", "all-touching"]
        }
      },
      defaults: {
        copies: 1,
        dx: 40,
        dy: 40,
        placement: "offset",
        edgePolicy: "internal"
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "edges", "selection"],
      writes: ["nodes", "edges", "selection"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "sourceIds"]
    },
    validate(_0x7a70f2 = {}, _0x38f006 = {}) {
      const _0x2f25a7 = validateNodeIds(_0x7a70f2, _0x38f006, {
        min: 1,
        allowSelection: true
      });
      if (_0x2f25a7.ok === false) {
        return _0x2f25a7;
      }
      const _0x1869cd = Number(_0x7a70f2.copies ?? 1);
      if (!Number.isInteger(_0x1869cd) || _0x1869cd < 1 || _0x1869cd > 12) {
        return {
          ok: false,
          errorCode: "INVALID_DUPLICATE_COPIES",
          message: "node.duplicate copies must be an integer between 1 and 12."
        };
      }
      return {
        args: {
          ..._0x2f25a7.args,
          copies: _0x1869cd,
          placement: _0x7a70f2.placement === "spawn-preferences" ? "spawn-preferences" : "offset"
        }
      };
    },
    execute(_0x416a54, _0x5aaf47) {
      const _0x453a49 = getState(_0x5aaf47);
      const _0xc358f7 = getStore(_0x5aaf47);
      const _0x1947fc = Math.max(1, Math.min(12, Math.trunc(Number(_0x416a54.copies || 1))));
      const _0xe250ed = toFiniteNumber(_0x416a54.dx, 40);
      const _0x34bc36 = toFiniteNumber(_0x416a54.dy, 40);
      const _0x1058da = _0x416a54.placement === "spawn-preferences" ? createDuplicateSpawnOffsets({
        nodes: _0x453a49.nodes || {},
        sourceNodes: _0x416a54.ids.map(_0x556384 => _0x453a49.nodes?.[_0x556384]).filter(Boolean),
        copies: _0x1947fc
      }) : [];
      const _0x2ae0e5 = String(_0x416a54.edgePolicy || "internal") === "all-touching" ? "all-touching" : "internal";
      const _0x57e7fe = Object.values(_0x453a49.edges || {}).map(_0x30094c => clonePlain(_0x30094c));
      const _0x22ea2b = [];
      const _0x101ef9 = [];
      const _0x349c27 = [];
      const _0x1290fe = () => {
        for (let _0x3ccb86 = 1; _0x3ccb86 <= _0x1947fc; _0x3ccb86 += 1) {
          const _0x23ad6a = _0x1058da[_0x3ccb86 - 1] || {
            dx: _0xe250ed * _0x3ccb86,
            dy: _0x34bc36 * _0x3ccb86
          };
          const _0x47e713 = new Map();
          for (const _0x183012 of _0x416a54.ids) {
            const _0x166af4 = _0x453a49.nodes?.[_0x183012];
            if (!_0x166af4) {
              continue;
            }
            const _0x305320 = generateId(String(_0x166af4.type || "node"));
            _0x47e713.set(_0x183012, _0x305320);
            const _0x3d35c6 = {
              ...clonePlain(_0x166af4),
              id: _0x305320,
              x: toFiniteNumber(_0x166af4.x) + _0x23ad6a.dx,
              y: toFiniteNumber(_0x166af4.y) + _0x23ad6a.dy,
              _bizRev: undefined
            };
            delete _0x3d35c6._bizRev;
            stripImageGenerationRuntimeState(_0x3d35c6);
            _0xc358f7?.addNode?.(_0x3d35c6);
            _0x101ef9.push(_0x305320);
          }
          _0x22ea2b.push(_0x47e713);
          for (const _0x1553e3 of _0x57e7fe) {
            const _0x4581bd = _0x47e713.has(_0x1553e3?.sourceId);
            const _0x3699a0 = _0x47e713.has(_0x1553e3?.targetId);
            const _0x3adc58 = _0x2ae0e5 === "all-touching" ? _0x4581bd || _0x3699a0 : _0x4581bd && _0x3699a0;
            if (!_0x3adc58) {
              continue;
            }
            _0x349c27.push({
              ..._0x1553e3,
              id: generateId("edge"),
              sourceId: _0x4581bd ? _0x47e713.get(_0x1553e3.sourceId) : _0x1553e3.sourceId,
              targetId: _0x3699a0 ? _0x47e713.get(_0x1553e3.targetId) : _0x1553e3.targetId
            });
          }
        }
        if (_0x349c27.length > 0) {
          if (typeof _0xc358f7?.updateEdgesBatch === "function") {
            _0xc358f7.updateEdgesBatch([], _0x349c27);
          } else {
            _0x349c27.forEach(_0x5151dc => _0xc358f7?.addEdge?.(_0x5151dc));
          }
        }
        _0xc358f7?.setSelectedNodes?.(_0x101ef9);
      };
      if (typeof _0xc358f7?.batch === "function") {
        _0xc358f7.batch(_0x1290fe);
      } else {
        _0x1290fe();
      }
      _0x5aaf47.commit?.();
      return {
        ids: _0x101ef9,
        sourceIds: _0x416a54.ids,
        copies: _0x1947fc,
        idMap: Object.fromEntries(_0x22ea2b[0] || []),
        idMaps: _0x22ea2b.map(_0x4fdcca => Object.fromEntries(_0x4fdcca)),
        edgeIds: _0x349c27.map(_0x5bc07e => _0x5bc07e.id)
      };
    }
  });
  _0x3fe2c1.register({
    id: "node.getSummary",
    description: "Get a canvas node summary.",
    riskLevel: "safe",
    argsSchema: {
      required: ["nodeId"],
      properties: {
        nodeId: {
          type: "string"
        },
        includeData: {
          type: "boolean"
        }
      },
      defaults: {
        includeData: false
      }
    },
    capabilitySchema: {
      reads: ["nodes"],
      writes: []
    },
    returnSchema: {
      aliasFields: ["id", "type", "name", "model", "provider"]
    },
    validate(_0x11d6e2 = {}, _0x38eba5 = {}) {
      const _0xc72ff = String(_0x11d6e2.nodeId || "").trim();
      if (!_0xc72ff) {
        return {
          ok: false,
          errorCode: "MISSING_NODE_ID",
          message: "node.getSummary requires nodeId."
        };
      }
      if (!getNode(_0x38eba5, _0xc72ff)) {
        return {
          ok: false,
          errorCode: "NODE_NOT_FOUND",
          message: "Canvas node not found: " + _0xc72ff
        };
      }
      return {
        args: {
          nodeId: _0xc72ff,
          includeData: _0x11d6e2.includeData === true
        }
      };
    },
    execute(_0x258d1f, _0x126f33) {
      return buildNodeSummary(_0x126f33, _0x258d1f.nodeId, {
        includeData: _0x258d1f.includeData
      });
    }
  });
  _0x3fe2c1.register({
    id: "graph.connect",
    description: "Connect two canvas nodes.",
    riskLevel: "safe",
    argsSchema: {
      required: ["sourceId", "targetId"],
      properties: {
        sourceId: {
          type: "string"
        },
        targetId: {
          type: "string"
        },
        refSlot: {
          type: "string"
        },
        edgeId: {
          type: "string"
        },
        type: {
          type: "string"
        }
      }
    },
    capabilitySchema: {
      reads: ["nodes", "edges"],
      writes: ["edges"]
    },
    returnSchema: {
      aliasFields: ["edgeId", "edge"]
    },
    validate(_0x4722f4 = {}, _0x4ae2f7 = {}) {
      const _0x4b1cc6 = normalizeEdgeArgs(_0x4722f4);
      if (!_0x4b1cc6.sourceId || !_0x4b1cc6.targetId) {
        return {
          ok: false,
          errorCode: "MISSING_EDGE_ENDPOINTS",
          message: "graph.connect requires sourceId and targetId."
        };
      }
      if (_0x4b1cc6.sourceId === _0x4b1cc6.targetId) {
        return {
          ok: false,
          errorCode: "INVALID_EDGE_ENDPOINTS",
          message: "graph.connect cannot connect a node to itself."
        };
      }
      if (!getNode(_0x4ae2f7, _0x4b1cc6.sourceId)) {
        return {
          ok: false,
          errorCode: "NODE_NOT_FOUND",
          message: "Canvas node not found: " + _0x4b1cc6.sourceId
        };
      }
      if (!getNode(_0x4ae2f7, _0x4b1cc6.targetId)) {
        return {
          ok: false,
          errorCode: "NODE_NOT_FOUND",
          message: "Canvas node not found: " + _0x4b1cc6.targetId
        };
      }
      return {
        args: {
          ..._0x4b1cc6,
          edgeId: _0x4b1cc6.edgeId || generateId("edge"),
          type: _0x4722f4.type ?? null
        }
      };
    },
    execute(_0x3686f0, _0x547f7c) {
      const _0x34bb5c = findEdgesByEndpoints(_0x547f7c, _0x3686f0)[0];
      if (_0x34bb5c) {
        return {
          edgeId: _0x34bb5c.id,
          edge: _0x34bb5c,
          reused: true
        };
      }
      const _0x4a1baf = {
        id: _0x3686f0.edgeId,
        sourceId: _0x3686f0.sourceId,
        targetId: _0x3686f0.targetId,
        type: _0x3686f0.type
      };
      if (_0x3686f0.refSlot) {
        _0x4a1baf.refSlot = _0x3686f0.refSlot;
      }
      getStore(_0x547f7c)?.addEdge?.(_0x4a1baf);
      _0x547f7c.commit?.();
      return {
        edgeId: _0x4a1baf.id,
        edge: _0x4a1baf,
        reused: false
      };
    }
  });
  _0x3fe2c1.register({
    id: "node.setInputSlot",
    description: "Set or clear the input slot/refSlot on an existing edge.",
    riskLevel: "safe",
    argsSchema: {
      required: ["refSlot"],
      properties: {
        edgeId: {
          type: "string"
        },
        sourceId: {
          type: "string"
        },
        targetId: {
          type: "string"
        },
        refSlot: {
          type: "string"
        },
        slot: {
          type: "string"
        },
        inputSlot: {
          type: "string"
        }
      }
    },
    capabilitySchema: {
      reads: ["edges"],
      writes: ["edges"]
    },
    returnSchema: {
      aliasFields: ["edgeId", "refSlot", "edge"]
    },
    validate(_0x1ef1d5 = {}, _0x4a527c = {}) {
      const _0x2fe7a0 = normalizeEdgeArgs(_0x1ef1d5);
      const _0x370988 = Object.prototype.hasOwnProperty.call(_0x1ef1d5, "refSlot") || Object.prototype.hasOwnProperty.call(_0x1ef1d5, "slot") || Object.prototype.hasOwnProperty.call(_0x1ef1d5, "inputSlot");
      if (!_0x370988) {
        return {
          ok: false,
          errorCode: "MISSING_REF_SLOT",
          message: "node.setInputSlot requires refSlot, slot, or inputSlot."
        };
      }
      const _0x15f2e4 = String(_0x1ef1d5.refSlot ?? _0x1ef1d5.slot ?? _0x1ef1d5.inputSlot ?? "").trim();
      let _0x16607a = null;
      if (_0x2fe7a0.edgeId) {
        _0x16607a = getEdges(_0x4a527c)[_0x2fe7a0.edgeId] || null;
        if (!_0x16607a) {
          return {
            ok: false,
            errorCode: "EDGE_NOT_FOUND",
            message: "Canvas edge not found: " + _0x2fe7a0.edgeId
          };
        }
      } else {
        if (!_0x2fe7a0.sourceId || !_0x2fe7a0.targetId) {
          return {
            ok: false,
            errorCode: "MISSING_EDGE_SELECTOR",
            message: "node.setInputSlot requires edgeId or sourceId/targetId."
          };
        }
        _0x16607a = findEdgesByEndpoints(_0x4a527c, _0x2fe7a0)[0] || null;
        if (!_0x16607a) {
          return {
            ok: false,
            errorCode: "EDGE_NOT_FOUND",
            message: "No canvas edge matched node.setInputSlot."
          };
        }
      }
      return {
        args: {
          edgeId: String(_0x16607a.id || ""),
          refSlot: _0x15f2e4
        }
      };
    },
    execute(_0x721d14, _0x3bc581) {
      const _0x18f88d = getEdges(_0x3bc581)[_0x721d14.edgeId];
      if (!_0x18f88d) {
        throw createCanvasCommandError("EDGE_NOT_FOUND", "Canvas edge not found: " + _0x721d14.edgeId, {
          edgeId: _0x721d14.edgeId
        });
      }
      const _0x2786a0 = {
        ..._0x18f88d
      };
      if (_0x721d14.refSlot) {
        _0x2786a0.refSlot = _0x721d14.refSlot;
      } else {
        delete _0x2786a0.refSlot;
      }
      const _0x425e66 = getStore(_0x3bc581);
      if (typeof _0x425e66?.updateEdgesBatch === "function") {
        _0x425e66.updateEdgesBatch([_0x721d14.edgeId], [_0x2786a0]);
      } else {
        _0x425e66?.removeEdge?.(_0x721d14.edgeId);
        _0x425e66?.addEdge?.(_0x2786a0);
      }
      _0x3bc581.commit?.();
      return {
        edgeId: _0x721d14.edgeId,
        refSlot: _0x721d14.refSlot,
        edge: _0x2786a0
      };
    }
  });
  _0x3fe2c1.register({
    id: "graph.disconnect",
    description: "Disconnect canvas nodes.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        edgeId: {
          type: "string"
        },
        sourceId: {
          type: "string"
        },
        targetId: {
          type: "string"
        },
        refSlot: {
          type: "string"
        }
      }
    },
    capabilitySchema: {
      reads: ["edges"],
      writes: ["edges"]
    },
    returnSchema: {
      aliasFields: ["edgeIds"]
    },
    validate(_0x10ecde = {}, _0x556ebb = {}) {
      const _0x2b060f = normalizeEdgeArgs(_0x10ecde);
      if (_0x2b060f.edgeId) {
        const _0x212cda = getEdges(_0x556ebb)[_0x2b060f.edgeId];
        if (!_0x212cda) {
          return {
            ok: false,
            errorCode: "EDGE_NOT_FOUND",
            message: "Canvas edge not found: " + _0x2b060f.edgeId
          };
        }
        return {
          args: {
            edgeIds: [_0x2b060f.edgeId]
          }
        };
      }
      if (!_0x2b060f.sourceId && !_0x2b060f.targetId) {
        return {
          ok: false,
          errorCode: "MISSING_EDGE_SELECTOR",
          message: "graph.disconnect requires edgeId or endpoint selectors."
        };
      }
      const _0x1f08bd = findEdgesByEndpoints(_0x556ebb, _0x2b060f);
      if (_0x1f08bd.length === 0) {
        return {
          ok: false,
          errorCode: "EDGE_NOT_FOUND",
          message: "No canvas edge matched graph.disconnect."
        };
      }
      return {
        args: {
          edgeIds: _0x1f08bd.map(_0x4f2382 => _0x4f2382.id)
        }
      };
    },
    execute(_0x5d4b1c, _0x45d354) {
      const _0x2e375d = getStore(_0x45d354);
      for (const _0x3a70cc of _0x5d4b1c.edgeIds) {
        _0x2e375d?.removeEdge?.(_0x3a70cc);
      }
      _0x45d354.commit?.();
      return {
        edgeIds: _0x5d4b1c.edgeIds
      };
    }
  });
  _0x3fe2c1.register({
    id: "graph.getCanvasSummary",
    description: "Get a safe canvas summary.",
    riskLevel: "safe",
    argsSchema: {},
    capabilitySchema: {
      reads: ["nodes", "edges", "selection", "viewport"],
      writes: []
    },
    returnSchema: {
      aliasFields: ["selectedNodeIds", "nodes", "edges", "nodeCount", "edgeCount"]
    },
    execute(_0xe01119, _0x3bcb00) {
      return buildCanvasSummary(_0x3bcb00);
    }
  });
}
export { buildCanvasSummary, buildNodeSummary, normalizeNodeIds };