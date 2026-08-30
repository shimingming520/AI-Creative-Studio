import a1468_0x1e8abd from "../core/stores/appStore.js";
import { generateId, getViewportScreenCenter, screenToWorld } from "../core/math.js";
import { t } from "../i18n/index.js";
import { commit } from "./history.js";
import { applyFeatureSelectionsToNodeData } from "./featureSelectionMemory.js";
import { createBatchSpawnLayoutNearNode, calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { createWebImageSourceNode, createWebVideoSourceNode, getAIGenerationDefaultSizeByType, getNodeDefaultSize } from "../services/fileService.js";
import { REVERSE_IMAGE_PROMPT_PRESET_PROMPT } from "./promptPresets.js";
import { buildImageSchemaAspectRatioDisplayPatch } from "../components/shared/generationDisplayPolicy.js";
const MAX_BATCH_CREATE_COUNT = 60;
const MAX_VIDEO_CREATE_COUNT = 12;
const MIN_EXTRACT_IMAGE_WIDTH = 96;
const MIN_EXTRACT_IMAGE_HEIGHT = 96;
const MIN_EXTRACT_IMAGE_AREA = 12000;
const STREAM_MEDIA_URL_EXTENSION_RE = /\.(?:m3u8|mpd|m4s)(?:[?#].*)?$/i;
const WEB_PREVIEW_REVERSE_IMAGE_PROMPT_NODE_NAME = "反推提示词-创建";
function webPreviewCaptureText(_0xd11805, _0x1cc4ce = {}) {
  return t("webPreview.capture." + _0xd11805, _0x1cc4ce);
}
function dispatchWebPreviewPickerSync(_0x38eb26) {
  const _0x36d133 = globalThis.window;
  if (typeof _0x36d133?.dispatchEvent !== "function") {
    return;
  }
  try {
    const _0x443a14 = typeof globalThis.CustomEvent === "function" ? new CustomEvent("web-preview:force-sync", {
      detail: {
        reason: _0x38eb26
      }
    }) : {
      type: "web-preview:force-sync",
      detail: {
        reason: _0x38eb26
      }
    };
    _0x36d133.dispatchEvent(_0x443a14);
  } catch {}
}
function normalizeHttpUrl(_0x376d22) {
  const _0x51e410 = String(_0x376d22 || "").trim();
  if (!_0x51e410) {
    return "";
  }
  try {
    const _0xd706d5 = new URL(_0x51e410, globalThis.location?.href || "https://example.invalid/");
    if (_0xd706d5.protocol !== "http:" && _0xd706d5.protocol !== "https:") {
      return "";
    }
    _0xd706d5.username = "";
    _0xd706d5.password = "";
    return _0xd706d5.href;
  } catch {
    return "";
  }
}
function getGraphState(_0x4fe741 = a1468_0x1e8abd) {
  return _0x4fe741.getStateRaw?.() || _0x4fe741.getState?.() || {};
}
function getPlainObject(_0x309ab4) {
  if (_0x309ab4 && typeof _0x309ab4 === "object" && !Array.isArray(_0x309ab4)) {
    return _0x309ab4;
  } else {
    return {};
  }
}
function getImagePromptAspectRatioValue(_0x528b36 = {}) {
  const _0x44aafd = getPlainObject(_0x528b36.generationParams);
  return String(_0x44aafd.aspectRatio || _0x528b36.aspectRatio || "").trim();
}
function applyRememberedImagePromptDisplayState(_0x38e244, _0x3570f1 = a1468_0x1e8abd) {
  const _0x532a08 = getGraphState(_0x3570f1);
  const _0x3bd04e = applyFeatureSelectionsToNodeData(_0x38e244, _0x532a08.ui?.featureSelections || {});
  const _0x173917 = getImagePromptAspectRatioValue(_0x3bd04e);
  if (!_0x173917) {
    return _0x3bd04e;
  }
  const _0x2d4e11 = buildImageSchemaAspectRatioDisplayPatch({
    store: _0x3570f1,
    nodeId: _0x3bd04e.id,
    nodeData: _0x3bd04e,
    ratioValue: _0x173917,
    minSide: Math.min(Math.max(1, Number(_0x3bd04e.width) || 1), Math.max(1, Number(_0x3bd04e.height) || 1))
  });
  return {
    ..._0x3bd04e,
    ...(_0x2d4e11.width ? {
      width: _0x2d4e11.width
    } : {}),
    ...(_0x2d4e11.height ? {
      height: _0x2d4e11.height
    } : {})
  };
}
function getAnchorNode(_0x55fd07, _0x1be150 = a1468_0x1e8abd) {
  const _0x118a79 = getGraphState(_0x1be150);
  return _0x118a79.nodes?.[_0x55fd07] || null;
}
function isExtractableImageSize(_0x448b66, _0x2c2c1d) {
  const _0x169828 = Math.max(0, Math.round(Number(_0x448b66 || 0) || 0));
  const _0xdc598c = Math.max(0, Math.round(Number(_0x2c2c1d || 0) || 0));
  if (!_0x169828 || !_0xdc598c) {
    return true;
  }
  return _0x169828 >= MIN_EXTRACT_IMAGE_WIDTH && _0xdc598c >= MIN_EXTRACT_IMAGE_HEIGHT && _0x169828 * _0xdc598c >= MIN_EXTRACT_IMAGE_AREA;
}
function normalizeImageCandidate(_0x1692fa = {}) {
  const _0x1465c3 = normalizeHttpUrl(_0x1692fa?.url);
  if (!_0x1465c3) {
    return null;
  }
  const _0x52e2b6 = {
    url: _0x1465c3,
    title: String(_0x1692fa?.title || _0x1692fa?.alt || webPreviewCaptureText("fallback.image")).trim().slice(0, 160),
    pageUrl: normalizeHttpUrl(_0x1692fa?.pageUrl || _0x1692fa?.sourceUrl || ""),
    pageTitle: String(_0x1692fa?.pageTitle || "").trim().slice(0, 160),
    nodeId: String(_0x1692fa?.nodeId || "").trim(),
    tabId: String(_0x1692fa?.tabId || "").trim(),
    width: Math.max(0, Math.round(Number(_0x1692fa?.width || 0) || 0)),
    height: Math.max(0, Math.round(Number(_0x1692fa?.height || 0) || 0))
  };
  if (!isExtractableImageSize(_0x52e2b6.width, _0x52e2b6.height)) {
    return null;
  }
  return _0x52e2b6;
}
function normalizeImageCandidates(_0x200f7f = []) {
  const _0x3a851d = new Set();
  const _0x32610e = [];
  for (const _0x5831d5 of Array.isArray(_0x200f7f) ? _0x200f7f : []) {
    const _0x1c1e6f = normalizeImageCandidate(_0x5831d5);
    if (!_0x1c1e6f || _0x3a851d.has(_0x1c1e6f.url)) {
      continue;
    }
    _0x3a851d.add(_0x1c1e6f.url);
    _0x32610e.push(_0x1c1e6f);
  }
  return _0x32610e;
}
function isStreamMediaUrl(_0x4c08b9) {
  const _0x50dfb4 = normalizeHttpUrl(_0x4c08b9);
  if (!_0x50dfb4) {
    return false;
  }
  try {
    return STREAM_MEDIA_URL_EXTENSION_RE.test(new URL(_0x50dfb4).pathname);
  } catch {
    return false;
  }
}
function normalizeVideoCandidate(_0x4a9c39 = {}) {
  const _0xc802e2 = normalizeHttpUrl(_0x4a9c39?.url);
  if (!_0xc802e2 || isStreamMediaUrl(_0xc802e2)) {
    return null;
  }
  return {
    kind: "video",
    url: _0xc802e2,
    title: String(_0x4a9c39?.title || webPreviewCaptureText("fallback.video")).trim().slice(0, 160),
    pageUrl: normalizeHttpUrl(_0x4a9c39?.pageUrl || _0x4a9c39?.sourceUrl || ""),
    pageTitle: String(_0x4a9c39?.pageTitle || "").trim().slice(0, 160),
    nodeId: String(_0x4a9c39?.nodeId || "").trim(),
    tabId: String(_0x4a9c39?.tabId || "").trim(),
    width: Math.max(0, Math.round(Number(_0x4a9c39?.width || 0) || 0)),
    height: Math.max(0, Math.round(Number(_0x4a9c39?.height || 0) || 0)),
    duration: Math.max(0, Number(_0x4a9c39?.duration || 0) || 0),
    mimeType: String(_0x4a9c39?.mimeType || "").trim(),
    sourceType: String(_0x4a9c39?.sourceType || "").trim().toLowerCase()
  };
}
function normalizeVideoCandidates(_0x58d5ad = []) {
  const _0x41d868 = new Set();
  const _0x41b800 = [];
  for (const _0x3260df of Array.isArray(_0x58d5ad) ? _0x58d5ad : []) {
    const _0x4a26b3 = normalizeVideoCandidate(_0x3260df);
    if (!_0x4a26b3 || _0x41d868.has(_0x4a26b3.url)) {
      continue;
    }
    _0x41d868.add(_0x4a26b3.url);
    _0x41b800.push(_0x4a26b3);
  }
  return _0x41b800;
}
function getViewportCenterTopLeft(_0x5f26b2, _0x5e00d1 = a1468_0x1e8abd) {
  const _0x163fd5 = getGraphState(_0x5e00d1);
  const {
    x: _0x28a806,
    y: _0xf17c63
  } = getViewportScreenCenter(_0x163fd5.viewport || {}, globalThis.window?.innerWidth || 1280, globalThis.window?.innerHeight || 720);
  const _0x2ae57e = screenToWorld(_0x28a806, _0xf17c63, _0x163fd5.viewport || {});
  return {
    x: _0x2ae57e.x - _0x5f26b2.width / 2,
    y: _0x2ae57e.y - _0x5f26b2.height / 2
  };
}
function getSingleNodeSpawnPosition({
  nodeId: _0x38051d,
  storeInstance = a1468_0x1e8abd,
  size: _0x284528
} = {}) {
  const _0x221a1c = getGraphState(storeInstance);
  const _0x469526 = getAnchorNode(_0x38051d, storeInstance);
  if (_0x469526) {
    return calcSafeSpawnPosNearNode(_0x221a1c.nodes || {}, _0x469526, _0x284528.width, _0x284528.height);
  } else {
    return getViewportCenterTopLeft(_0x284528, storeInstance);
  }
}
export function createWebPreviewTextNodeFromSelection({
  nodeId: _0x10c493,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit
} = {}) {
  const _0x578899 = String(payload?.text || "").trim();
  if (!_0x578899) {
    return null;
  }
  const _0xebefbd = getAIGenerationDefaultSizeByType("ai-text");
  const _0x5c7f69 = getGraphState(storeInstance);
  const _0x539eec = getAnchorNode(_0x10c493 || payload?.nodeId, storeInstance);
  const _0x35f612 = _0x539eec ? calcSafeSpawnPosNearNode(_0x5c7f69.nodes || {}, _0x539eec, _0xebefbd.width, _0xebefbd.height) : getViewportCenterTopLeft(_0xebefbd, storeInstance);
  const _0x175e2f = generateId("ai-text");
  const _0x2a5b71 = {
    id: _0x175e2f,
    type: "ai-text",
    x: _0x35f612.x,
    y: _0x35f612.y,
    width: _0xebefbd.width,
    height: _0xebefbd.height,
    name: webPreviewCaptureText("nodeNames.generatedText"),
    prompt: _0x578899,
    webPageUrl: normalizeHttpUrl(payload?.pageUrl || ""),
    webSourceTitle: String(payload?.webSourceTitle || "").trim().slice(0, 160)
  };
  storeInstance.addNode?.(_0x2a5b71);
  storeInstance.setSelectedNodes?.([_0x175e2f]);
  commitFn?.();
  return _0x2a5b71;
}
export function createWebPreviewSourceTextNodeFromSelection({
  nodeId: _0x55c103,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit
} = {}) {
  const _0x5414e7 = String(payload?.text || "").trim();
  if (!_0x5414e7) {
    return null;
  }
  const _0x27525b = getNodeDefaultSize("source-text");
  const _0x217f49 = getSingleNodeSpawnPosition({
    nodeId: _0x55c103 || payload?.nodeId,
    storeInstance: storeInstance,
    size: _0x27525b
  });
  const _0x1f8d99 = generateId("source-text");
  const _0x28be8c = {
    id: _0x1f8d99,
    type: "source-text",
    x: _0x217f49.x,
    y: _0x217f49.y,
    width: _0x27525b.width,
    height: _0x27525b.height,
    name: webPreviewCaptureText("nodeNames.sourceText"),
    content: _0x5414e7,
    webPageUrl: normalizeHttpUrl(payload?.pageUrl || ""),
    webSourceTitle: String(payload?.webSourceTitle || "").trim().slice(0, 160)
  };
  storeInstance.addNode?.(_0x28be8c);
  storeInstance.setSelectedNodes?.([_0x1f8d99]);
  commitFn?.();
  return _0x28be8c;
}
export function createWebPreviewImagePromptNodeFromSelection({
  nodeId: _0x364458,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit
} = {}) {
  const _0x285d7a = String(payload?.text || "").trim();
  if (!_0x285d7a) {
    return null;
  }
  const _0xf02605 = getAIGenerationDefaultSizeByType("ai-image");
  const _0xf279fe = applyRememberedImagePromptDisplayState({
    id: generateId("ai-image"),
    type: "ai-image",
    width: _0xf02605.width,
    height: _0xf02605.height,
    name: webPreviewCaptureText("nodeNames.imagePrompt"),
    prompt: _0x285d7a,
    webPageUrl: normalizeHttpUrl(payload?.pageUrl || ""),
    webSourceTitle: String(payload?.webSourceTitle || "").trim().slice(0, 160)
  }, storeInstance);
  const _0x1e0562 = {
    width: Math.max(1, Number(_0xf279fe.width) || _0xf02605.width),
    height: Math.max(1, Number(_0xf279fe.height) || _0xf02605.height)
  };
  const _0x3c5567 = getSingleNodeSpawnPosition({
    nodeId: _0x364458 || payload?.nodeId,
    storeInstance: storeInstance,
    size: _0x1e0562
  });
  const _0x22e380 = {
    ..._0xf279fe,
    x: _0x3c5567.x,
    y: _0x3c5567.y,
    width: _0x1e0562.width,
    height: _0x1e0562.height
  };
  storeInstance.addNode?.(_0x22e380);
  storeInstance.setSelectedNodes?.([_0x22e380.id]);
  commitFn?.();
  return _0x22e380;
}
export function createWebPreviewVideoPromptNodeFromSelection({
  nodeId: _0x2d3bf2,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit
} = {}) {
  const _0x552b25 = String(payload?.text || "").trim();
  if (!_0x552b25) {
    return null;
  }
  const _0x5d22c7 = getAIGenerationDefaultSizeByType("ai-video");
  const _0x1d801e = getSingleNodeSpawnPosition({
    nodeId: _0x2d3bf2 || payload?.nodeId,
    storeInstance: storeInstance,
    size: _0x5d22c7
  });
  const _0x47047c = generateId("ai-video");
  const _0x109131 = {
    id: _0x47047c,
    type: "ai-video",
    x: _0x1d801e.x,
    y: _0x1d801e.y,
    width: _0x5d22c7.width,
    height: _0x5d22c7.height,
    name: webPreviewCaptureText("nodeNames.videoPrompt"),
    prompt: _0x552b25,
    webPageUrl: normalizeHttpUrl(payload?.pageUrl || ""),
    webSourceTitle: String(payload?.webSourceTitle || "").trim().slice(0, 160)
  };
  storeInstance.addNode?.(_0x109131);
  storeInstance.setSelectedNodes?.([_0x47047c]);
  commitFn?.();
  return _0x109131;
}
export function createWebPreviewImageNodeFromContext({
  nodeId: _0x414218,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  projectId = globalThis.window?.currentProjectId,
  importRemote = true,
  importRemoteAsset: _0x2f97cd
} = {}) {
  const _0x304bdf = normalizeImageCandidate(payload);
  if (!_0x304bdf) {
    return null;
  }
  const _0x5f3f96 = getNodeDefaultSize("source-image");
  const _0x408f40 = getSingleNodeSpawnPosition({
    nodeId: _0x414218 || _0x304bdf.nodeId,
    storeInstance: storeInstance,
    size: _0x5f3f96
  });
  const _0xfa7f19 = createWebImageSourceNode({
    payload: {
      ..._0x304bdf,
      title: _0x304bdf.title || _0x304bdf.pageTitle || webPreviewCaptureText("fallback.image"),
      pageUrl: _0x304bdf.pageUrl
    },
    worldX: _0x408f40.x,
    worldY: _0x408f40.y,
    storeInstance: storeInstance,
    projectId: projectId,
    select: true,
    importRemote: importRemote,
    importRemoteAsset: _0x2f97cd
  });
  if (_0xfa7f19) {
    commitFn?.();
  }
  return _0xfa7f19;
}
export function createWebPreviewReverseImagePromptNodes({
  nodeId: _0x3e6f68,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  projectId = globalThis.window?.currentProjectId,
  importRemote = true,
  importRemoteAsset: _0x44eabe
} = {}) {
  const _0x234a17 = normalizeImageCandidate(payload);
  if (!_0x234a17) {
    return null;
  }
  const _0x172307 = getNodeDefaultSize("source-image");
  const _0x3c730d = getSingleNodeSpawnPosition({
    nodeId: _0x3e6f68 || _0x234a17.nodeId,
    storeInstance: storeInstance,
    size: _0x172307
  });
  const _0x354b7f = createWebImageSourceNode({
    payload: {
      ..._0x234a17,
      title: _0x234a17.title || _0x234a17.pageTitle || webPreviewCaptureText("fallback.image"),
      pageUrl: _0x234a17.pageUrl
    },
    worldX: _0x3c730d.x,
    worldY: _0x3c730d.y,
    storeInstance: storeInstance,
    projectId: projectId,
    select: false,
    importRemote: importRemote,
    importRemoteAsset: _0x44eabe
  });
  if (!_0x354b7f) {
    return null;
  }
  const _0x53c5c4 = getAIGenerationDefaultSizeByType("ai-text");
  const _0x1f67eb = getGraphState(storeInstance);
  const _0x45e002 = calcSafeSpawnPosNearNode({
    ...(_0x1f67eb.nodes || {}),
    [_0x354b7f.id]: _0x354b7f
  }, _0x354b7f, _0x53c5c4.width, _0x53c5c4.height);
  const _0x4d204c = generateId("ai-text");
  const _0xd0a8b3 = {
    id: _0x4d204c,
    type: "ai-text",
    x: _0x45e002.x,
    y: _0x45e002.y,
    width: _0x53c5c4.width,
    height: _0x53c5c4.height,
    name: WEB_PREVIEW_REVERSE_IMAGE_PROMPT_NODE_NAME,
    prompt: REVERSE_IMAGE_PROMPT_PRESET_PROMPT,
    webPageUrl: _0x234a17.pageUrl,
    webSourceTitle: (_0x234a17.pageTitle || _0x234a17.title || "").slice(0, 160)
  };
  const _0x4520b4 = {
    id: generateId("edge"),
    sourceId: _0x354b7f.id,
    targetId: _0xd0a8b3.id
  };
  storeInstance.addNode?.(_0xd0a8b3);
  storeInstance.addEdge?.(_0x4520b4);
  storeInstance.setSelectedNodes?.([_0xd0a8b3.id]);
  commitFn?.();
  return {
    imageNode: _0x354b7f,
    textNode: _0xd0a8b3,
    edge: _0x4520b4
  };
}
export function createBatchWebImageNodes({
  nodeId: _0x50c4bd,
  candidates = [],
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  projectId = globalThis.window?.currentProjectId
} = {}) {
  const _0x153b08 = normalizeImageCandidates(candidates).slice(0, MAX_BATCH_CREATE_COUNT);
  if (!_0x153b08.length) {
    return [];
  }
  const _0x2144a8 = getGraphState(storeInstance);
  const _0x1d83ac = getAnchorNode(_0x50c4bd, storeInstance);
  const _0x2ecbd2 = getNodeDefaultSize("source-image");
  const _0x343699 = _0x1d83ac ? createBatchSpawnLayoutNearNode({
    nodes: _0x2144a8.nodes || {},
    anchorNode: _0x1d83ac,
    itemCount: _0x153b08.length,
    itemWidth: _0x2ecbd2.width,
    itemHeight: _0x2ecbd2.height
  }) : null;
  const _0x490561 = _0x343699 ? null : getViewportCenterTopLeft(_0x2ecbd2, storeInstance);
  const _0x4ecef5 = [];
  _0x153b08.forEach((_0x80cc31, _0x21a190) => {
    const _0x3a6c5e = _0x343699 ? _0x343699.getItemPosition(_0x21a190) : {
      x: _0x490561.x + _0x21a190 * 30,
      y: _0x490561.y + _0x21a190 * 30
    };
    const _0x1e6a81 = createWebImageSourceNode({
      payload: {
        ..._0x80cc31,
        title: _0x80cc31.title || _0x80cc31.pageTitle || webPreviewCaptureText("fallback.image"),
        pageUrl: _0x80cc31.pageUrl
      },
      worldX: _0x3a6c5e.x,
      worldY: _0x3a6c5e.y,
      storeInstance: storeInstance,
      projectId: projectId,
      select: false
    });
    if (_0x1e6a81) {
      _0x4ecef5.push(_0x1e6a81);
    }
  });
  if (_0x4ecef5.length) {
    storeInstance.setSelectedNodes?.(_0x4ecef5.map(_0x304da1 => _0x304da1.id));
    commitFn?.();
  }
  return _0x4ecef5;
}
export function createBatchWebVideoNodes({
  nodeId: _0x2d0085,
  candidates = [],
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  projectId = globalThis.window?.currentProjectId,
  rightsConfirmed = false,
  importRemoteAsset: _0x274e9f
} = {}) {
  const _0x552be5 = normalizeVideoCandidates(candidates).slice(0, MAX_VIDEO_CREATE_COUNT);
  if (!_0x552be5.length || rightsConfirmed !== true) {
    return [];
  }
  const _0x4b1442 = getGraphState(storeInstance);
  const _0xc15692 = getAnchorNode(_0x2d0085, storeInstance);
  const _0x587c4e = getNodeDefaultSize("source-video");
  const _0x4bf897 = _0xc15692 ? createBatchSpawnLayoutNearNode({
    nodes: _0x4b1442.nodes || {},
    anchorNode: _0xc15692,
    itemCount: _0x552be5.length,
    itemWidth: _0x587c4e.width,
    itemHeight: _0x587c4e.height
  }) : null;
  const _0x52a284 = _0x4bf897 ? null : getViewportCenterTopLeft(_0x587c4e, storeInstance);
  const _0x400122 = [];
  _0x552be5.forEach((_0x474a6b, _0x3fe865) => {
    const _0x1e2819 = _0x4bf897 ? _0x4bf897.getItemPosition(_0x3fe865) : {
      x: _0x52a284.x + _0x3fe865 * 30,
      y: _0x52a284.y + _0x3fe865 * 30
    };
    const _0x476261 = createWebVideoSourceNode({
      payload: {
        ..._0x474a6b,
        title: _0x474a6b.title || _0x474a6b.pageTitle || webPreviewCaptureText("fallback.video"),
        pageUrl: _0x474a6b.pageUrl,
        rightsConfirmed: rightsConfirmed
      },
      worldX: _0x1e2819.x,
      worldY: _0x1e2819.y,
      storeInstance: storeInstance,
      projectId: projectId,
      importRemoteAsset: _0x274e9f,
      select: false
    });
    if (_0x476261) {
      _0x400122.push(_0x476261);
    }
  });
  if (_0x400122.length) {
    storeInstance.setSelectedNodes?.(_0x400122.map(_0x4d5e3d => _0x4d5e3d.id));
    commitFn?.();
  }
  return _0x400122;
}
export function createBatchWebMediaNodes({
  nodeId: _0x2b09dd,
  imageCandidates = [],
  videoCandidates = [],
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  projectId = globalThis.window?.currentProjectId,
  rightsConfirmed = false,
  importRemoteAsset: _0x2ac0a6
} = {}) {
  const _0x20d59f = normalizeImageCandidates(imageCandidates).slice(0, MAX_BATCH_CREATE_COUNT);
  const _0x567ab3 = rightsConfirmed === true ? normalizeVideoCandidates(videoCandidates).slice(0, MAX_VIDEO_CREATE_COUNT) : [];
  const _0x486852 = [..._0x20d59f.map(_0x1d7b48 => ({
    kind: "image",
    candidate: _0x1d7b48
  })), ..._0x567ab3.map(_0x391432 => ({
    kind: "video",
    candidate: _0x391432
  }))];
  if (!_0x486852.length) {
    return [];
  }
  const _0x131276 = getGraphState(storeInstance);
  const _0x273f6d = getAnchorNode(_0x2b09dd, storeInstance);
  const _0x360acd = getNodeDefaultSize("source-image");
  const _0x375f79 = _0x273f6d ? createBatchSpawnLayoutNearNode({
    nodes: _0x131276.nodes || {},
    anchorNode: _0x273f6d,
    itemCount: _0x486852.length,
    itemWidth: _0x360acd.width,
    itemHeight: _0x360acd.height
  }) : null;
  const _0x393978 = _0x375f79 ? null : getViewportCenterTopLeft(_0x360acd, storeInstance);
  const _0x1672ab = [];
  _0x486852.forEach((_0x6290dc, _0x4ef14e) => {
    const _0x168ecf = _0x375f79 ? _0x375f79.getItemPosition(_0x4ef14e) : {
      x: _0x393978.x + _0x4ef14e * 30,
      y: _0x393978.y + _0x4ef14e * 30
    };
    const _0x11d430 = {
      worldX: _0x168ecf.x,
      worldY: _0x168ecf.y,
      storeInstance: storeInstance,
      projectId: projectId,
      select: false,
      importRemoteAsset: _0x2ac0a6
    };
    const _0x5c698f = _0x6290dc.kind === "video" ? createWebVideoSourceNode({
      ..._0x11d430,
      payload: {
        ..._0x6290dc.candidate,
        title: _0x6290dc.candidate.title || _0x6290dc.candidate.pageTitle || webPreviewCaptureText("fallback.video"),
        pageUrl: _0x6290dc.candidate.pageUrl,
        rightsConfirmed: true
      }
    }) : createWebImageSourceNode({
      ..._0x11d430,
      payload: {
        ..._0x6290dc.candidate,
        title: _0x6290dc.candidate.title || _0x6290dc.candidate.pageTitle || webPreviewCaptureText("fallback.image"),
        pageUrl: _0x6290dc.candidate.pageUrl
      }
    });
    if (_0x5c698f) {
      _0x1672ab.push(_0x5c698f);
    }
  });
  if (_0x1672ab.length) {
    storeInstance.setSelectedNodes?.(_0x1672ab.map(_0x3bdca2 => _0x3bdca2.id));
    commitFn?.();
  }
  return _0x1672ab;
}
export function createWebReferenceCardNode({
  nodeId: _0xd95e66,
  payload = {},
  storeInstance = a1468_0x1e8abd,
  commitFn = commit
} = {}) {
  const _0x2b9b7e = normalizeHttpUrl(payload?.pageUrl || payload?.url || "");
  const _0x2987a9 = String(payload?.pageTitle || payload?.title || _0x2b9b7e || webPreviewCaptureText("fallback.reference")).trim().slice(0, 160);
  const _0x2dd35c = String(payload?.selectedText || payload?.text || "").trim().slice(0, 5000);
  const _0x40f1e9 = String(payload?.screenshotDataUrl || payload?.screenshot || "");
  const _0x1a36e2 = String(payload?.capturedAt || new Date().toISOString()).trim();
  const _0x2c8b55 = getNodeDefaultSize("web-reference-card");
  const _0x416d34 = getGraphState(storeInstance);
  const _0xe6af06 = getAnchorNode(_0xd95e66 || payload?.nodeId, storeInstance);
  const _0x2552ab = _0xe6af06 ? calcSafeSpawnPosNearNode(_0x416d34.nodes || {}, _0xe6af06, _0x2c8b55.width, _0x2c8b55.height) : getViewportCenterTopLeft(_0x2c8b55, storeInstance);
  const _0x756c3f = generateId("web-reference-card");
  const _0x111310 = {
    id: _0x756c3f,
    type: "web-reference-card",
    x: _0x2552ab.x,
    y: _0x2552ab.y,
    width: _0x2c8b55.width,
    height: _0x2c8b55.height,
    name: webPreviewCaptureText("nodeNames.webReference"),
    webSourceTitle: _0x2987a9,
    webPageUrl: _0x2b9b7e,
    webScreenshotUrl: _0x40f1e9.startsWith("data:image/") ? _0x40f1e9 : "",
    webSelectedText: _0x2dd35c,
    webCapturedAt: _0x1a36e2
  };
  storeInstance.addNode?.(_0x111310);
  storeInstance.setSelectedNodes?.([_0x756c3f]);
  commitFn?.();
  return _0x111310;
}
function createImagePickerItem(_0x2de09d, _0x3fe261, _0x33d1d5, _0x143925) {
  const _0x55c11d = _0x2de09d.createElement("label");
  _0x55c11d.className = "web-preview-image-picker-item";
  const _0x319c2b = _0x2de09d.createElement("input");
  _0x319c2b.type = "checkbox";
  _0x319c2b.checked = _0x33d1d5.has(_0x3fe261.url);
  _0x319c2b.addEventListener("change", () => _0x143925(_0x3fe261.url, _0x319c2b.checked));
  const _0x4e9c1b = _0x2de09d.createElement("img");
  _0x4e9c1b.className = "web-preview-image-picker-thumb";
  _0x4e9c1b.src = _0x3fe261.url;
  _0x4e9c1b.alt = _0x3fe261.title || "";
  _0x4e9c1b.loading = "lazy";
  _0x4e9c1b.decoding = "async";
  _0x4e9c1b.referrerPolicy = "no-referrer";
  const _0x5b7195 = _0x2de09d.createElement("span");
  _0x5b7195.className = "web-preview-image-picker-title";
  _0x5b7195.textContent = _0x3fe261.title || webPreviewCaptureText("fallback.image");
  const _0x171d58 = _0x2de09d.createElement("span");
  _0x171d58.className = "web-preview-image-picker-meta";
  _0x171d58.textContent = _0x3fe261.width && _0x3fe261.height ? _0x3fe261.width + " x " + _0x3fe261.height : "";
  _0x55c11d.appendChild(_0x319c2b);
  _0x55c11d.appendChild(_0x4e9c1b);
  _0x55c11d.appendChild(_0x5b7195);
  _0x55c11d.appendChild(_0x171d58);
  return _0x55c11d;
}
function formatVideoDuration(_0x1e4d58) {
  const _0x1bf420 = Math.round(Number(_0x1e4d58 || 0) || 0);
  if (!_0x1bf420) {
    return "";
  }
  const _0x144b95 = Math.floor(_0x1bf420 / 60);
  const _0x362e19 = _0x1bf420 % 60;
  return _0x144b95 + ":" + String(_0x362e19).padStart(2, "0");
}
function formatVideoCandidateIndex(_0x40c41f) {
  const _0x146b3d = Math.max(1, Math.round(Number(_0x40c41f || 0) || 0) + 1);
  return "#" + String(_0x146b3d).padStart(2, "0");
}
function getUrlHost(_0x20326d) {
  try {
    return new URL(_0x20326d).hostname;
  } catch {
    return "";
  }
}
function shortenVideoToken(_0x4bba40, _0x19fd85 = 24) {
  const _0x1599e7 = String(_0x4bba40 || "").trim();
  if (_0x1599e7.length <= _0x19fd85) {
    return _0x1599e7;
  }
  return _0x1599e7.slice(0, Math.max(6, _0x19fd85 - 7)) + "..." + _0x1599e7.slice(-4);
}
function getVideoUrlFingerprint(_0x510b21) {
  try {
    const _0x1ac675 = new URL(_0x510b21);
    const _0x3efe0e = ["video_id", "vid", "item_id", "aweme_id", "note_id", "id", "aid", "file_id"];
    for (const _0x25b25c of _0x3efe0e) {
      const _0x2b5894 = _0x1ac675.searchParams.get(_0x25b25c);
      if (_0x2b5894) {
        return _0x25b25c + "=" + shortenVideoToken(_0x2b5894, 22);
      }
    }
    const _0x45d8ab = _0x1ac675.pathname.split("/").filter(Boolean);
    const _0x209dc2 = decodeURIComponent(_0x45d8ab.at(-1) || "").trim();
    if (_0x209dc2 && _0x209dc2 !== "play" && _0x209dc2 !== "video") {
      return shortenVideoToken(_0x209dc2, 28);
    }
    const _0x3edf9a = Array.from(_0x1ac675.searchParams.entries())[0];
    if (_0x3edf9a) {
      return _0x3edf9a[0] + "=" + shortenVideoToken(_0x3edf9a[1], 22);
    }
    return _0x1ac675.hostname;
  } catch {
    return "";
  }
}
function getVideoSourceLabel(_0x3c3bdf) {
  const _0x159800 = String(_0x3c3bdf || "").trim().toLowerCase();
  return {
    video: webPreviewCaptureText("videoSources.player"),
    "video-source": webPreviewCaptureText("videoSources.player"),
    source: webPreviewCaptureText("videoSources.player"),
    link: webPreviewCaptureText("videoSources.pageLink"),
    "data-attribute": webPreviewCaptureText("videoSources.pageAttribute"),
    "video-resource": webPreviewCaptureText("videoSources.loadedResource"),
    "embedded-url": webPreviewCaptureText("videoSources.scriptUrl"),
    "structured-data": webPreviewCaptureText("videoSources.structuredData"),
    "douyin-detail": webPreviewCaptureText("videoSources.douyinDetail")
  }[_0x159800] || webPreviewCaptureText("videoSources.videoSource");
}
function buildVideoCandidateTooltip(_0x2470a3, _0x16e71e) {
  const _0x47d5bb = [_0x16e71e + " " + (_0x2470a3.title || webPreviewCaptureText("fallback.video")), webPreviewCaptureText("videoTooltip.source", {
    source: getVideoSourceLabel(_0x2470a3.sourceType)
  }), _0x2470a3.url ? webPreviewCaptureText("videoTooltip.url", {
    url: _0x2470a3.url
  }) : "", _0x2470a3.pageUrl ? webPreviewCaptureText("videoTooltip.page", {
    url: _0x2470a3.pageUrl
  }) : ""];
  return _0x47d5bb.filter(Boolean).join("\n");
}
function createVideoPickerItem(_0x1af83d, _0xf59789, _0x3266d9, _0x6c7db9, _0x5ca422 = 0) {
  const _0x497b05 = _0x1af83d.createElement("label");
  _0x497b05.className = "web-preview-image-picker-item web-preview-video-picker-item";
  const _0xbbcfe7 = formatVideoCandidateIndex(_0x5ca422);
  _0x497b05.title = buildVideoCandidateTooltip(_0xf59789, _0xbbcfe7);
  const _0x49f72a = _0x1af83d.createElement("input");
  _0x49f72a.type = "checkbox";
  _0x49f72a.checked = _0x3266d9.has(_0xf59789.url);
  _0x49f72a.addEventListener("change", () => _0x6c7db9(_0xf59789.url, _0x49f72a.checked));
  const _0x4f42e9 = _0x1af83d.createElement("div");
  _0x4f42e9.className = "web-preview-video-picker-thumb";
  const _0x49e380 = _0x1af83d.createElement("span");
  _0x49e380.className = "web-preview-video-picker-index";
  _0x49e380.textContent = _0xbbcfe7;
  const _0x1cef99 = _0x1af83d.createElement("span");
  _0x1cef99.className = "web-preview-video-picker-source";
  _0x1cef99.textContent = getVideoSourceLabel(_0xf59789.sourceType);
  const _0x45749b = _0x1af83d.createElement("span");
  _0x45749b.className = "web-preview-video-picker-fingerprint";
  _0x45749b.textContent = getVideoUrlFingerprint(_0xf59789.url) || getUrlHost(_0xf59789.url);
  _0x4f42e9.appendChild(_0x49e380);
  _0x4f42e9.appendChild(_0x1cef99);
  _0x4f42e9.appendChild(_0x45749b);
  const _0x1efc01 = _0x1af83d.createElement("span");
  _0x1efc01.className = "web-preview-image-picker-title";
  _0x1efc01.textContent = _0xbbcfe7 + " " + (_0xf59789.title || webPreviewCaptureText("fallback.video"));
  const _0x1c646a = _0x1af83d.createElement("span");
  _0x1c646a.className = "web-preview-image-picker-meta";
  const _0x368da6 = _0xf59789.width && _0xf59789.height ? _0xf59789.width + " x " + _0xf59789.height : "";
  const _0x368a84 = formatVideoDuration(_0xf59789.duration);
  const _0x41084e = getUrlHost(_0xf59789.url);
  const _0x1b389d = getVideoUrlFingerprint(_0xf59789.url);
  _0x1c646a.textContent = [_0x368da6, _0x368a84, _0x41084e, _0x1b389d && _0x1b389d !== _0x41084e ? _0x1b389d : ""].filter(Boolean).join(" · ");
  _0x497b05.appendChild(_0x49f72a);
  _0x497b05.appendChild(_0x4f42e9);
  _0x497b05.appendChild(_0x1efc01);
  _0x497b05.appendChild(_0x1c646a);
  return _0x497b05;
}
function createPickerSection(_0x3fbaf7, _0x7f0db, _0x5c6e5d) {
  const _0x4e17c7 = _0x3fbaf7.createElement("section");
  _0x4e17c7.className = "web-preview-media-picker-section";
  const _0x5b8de4 = _0x3fbaf7.createElement("h4");
  _0x5b8de4.className = "web-preview-media-picker-section-title";
  _0x5b8de4.textContent = _0x7f0db;
  _0x4e17c7.appendChild(_0x5b8de4);
  _0x4e17c7.appendChild(_0x5c6e5d);
  return _0x4e17c7;
}
function createMediaFilterButton(_0xabdb4e, _0x46f8b2, _0x541abc, _0x2a0fc6, _0x310f42, _0x3409d0) {
  const _0x5947fb = _0xabdb4e.createElement("button");
  _0x5947fb.type = "button";
  _0x5947fb.className = "web-preview-media-picker-filter" + (_0x541abc === _0x2a0fc6 ? " is-active" : "");
  _0x5947fb.textContent = _0x46f8b2;
  _0x5947fb.disabled = !!_0x310f42;
  _0x5947fb.ariaPressed = _0x541abc === _0x2a0fc6 ? "true" : "false";
  _0x5947fb.addEventListener("click", () => {
    if (_0x5947fb.disabled) {
      return;
    }
    _0x3409d0(_0x541abc);
  });
  return _0x5947fb;
}
function selectCandidateUrls(_0x4d3dfb, _0x129176, _0x5bd8b9) {
  _0x4d3dfb.clear();
  for (const _0x100895 of _0x129176.slice(0, _0x5bd8b9)) {
    if (_0x100895?.url) {
      _0x4d3dfb.add(_0x100895.url);
    }
  }
}
export function openWebPreviewMediaPicker({
  nodeId: _0x453570,
  imageCandidates = [],
  videoCandidates = [],
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  showToast = globalThis.window?.showToast
} = {}) {
  const _0xc4445f = globalThis.document;
  if (!_0xc4445f?.body) {
    return false;
  }
  const _0x5c5e6c = normalizeImageCandidates(imageCandidates);
  const _0x52bd78 = normalizeVideoCandidates(videoCandidates);
  if (!_0x5c5e6c.length && !_0x52bd78.length) {
    showToast?.(webPreviewCaptureText("toasts.noMedia"), "warning");
    return false;
  }
  _0xc4445f.querySelector(".web-preview-image-picker-overlay")?.remove();
  const _0x54d3cd = new Set();
  const _0x571a78 = new Set();
  const _0x363eca = _0xc4445f.createElement("div");
  let _0x3333e4 = false;
  _0x363eca.className = "web-preview-image-picker-overlay";
  _0x363eca.addEventListener("pointerdown", _0x59213a => {
    _0x59213a.stopPropagation();
    if (_0x59213a.target === _0x363eca) {
      _0x571950();
    }
  });
  const _0x55ca4f = _0xc4445f.createElement("section");
  _0x55ca4f.className = "web-preview-image-picker web-preview-media-picker";
  _0x55ca4f.addEventListener("pointerdown", _0x58e134 => _0x58e134.stopPropagation());
  const _0x523106 = _0xc4445f.createElement("div");
  _0x523106.className = "web-preview-image-picker-header";
  const _0x602b97 = _0xc4445f.createElement("h3");
  _0x602b97.textContent = webPreviewCaptureText("mediaPicker.title");
  const _0x4b39ff = _0xc4445f.createElement("span");
  _0x4b39ff.className = "web-preview-image-picker-count";
  _0x523106.appendChild(_0x602b97);
  _0x523106.appendChild(_0x4b39ff);
  const _0x5b42a0 = _0xc4445f.createElement("div");
  _0x5b42a0.className = "web-preview-media-picker-content";
  let _0x1b5459 = "all";
  const _0x138bd9 = _0xc4445f.createElement("div");
  _0x138bd9.className = "web-preview-image-picker-grid";
  const _0x9614ad = _0xc4445f.createElement("div");
  _0x9614ad.className = "web-preview-image-picker-grid web-preview-video-picker-grid";
  const _0x48f387 = _0xc4445f.createElement("p");
  _0x48f387.className = "web-preview-video-picker-notice";
  _0x48f387.textContent = webPreviewCaptureText("mediaPicker.videoNotice");
  const _0x58e7be = _0xc4445f.createElement("label");
  _0x58e7be.className = "web-preview-video-picker-consent";
  const _0x1ea5a5 = _0xc4445f.createElement("input");
  _0x1ea5a5.type = "checkbox";
  const _0x5de880 = _0xc4445f.createElement("span");
  _0x5de880.textContent = webPreviewCaptureText("mediaPicker.consent");
  _0x58e7be.appendChild(_0x1ea5a5);
  _0x58e7be.appendChild(_0x5de880);
  const _0x55ca02 = _0xc4445f.createElement("div");
  _0x55ca02.className = "web-preview-media-picker-controls";
  const _0x3430a8 = _0xc4445f.createElement("div");
  _0x3430a8.className = "web-preview-media-picker-filter-group";
  _0x55ca02.appendChild(_0x3430a8);
  const _0x279d8f = _0xc4445f.createElement("div");
  _0x279d8f.className = "web-preview-image-picker-actions";
  const _0x260f26 = _0xc4445f.createElement("button");
  _0x260f26.type = "button";
  _0x260f26.className = "web-preview-image-picker-btn web-preview-media-picker-select-all";
  _0x260f26.textContent = webPreviewCaptureText("buttons.selectAll");
  _0x55ca02.appendChild(_0x260f26);
  const _0x4edd64 = _0xc4445f.createElement("button");
  _0x4edd64.type = "button";
  _0x4edd64.className = "web-preview-image-picker-btn";
  _0x4edd64.textContent = webPreviewCaptureText("buttons.cancel");
  const _0x4320dd = _0xc4445f.createElement("button");
  _0x4320dd.type = "button";
  _0x4320dd.className = "web-preview-image-picker-btn web-preview-image-picker-btn--primary";
  _0x4320dd.textContent = webPreviewCaptureText("buttons.addToCanvas");
  _0x279d8f.appendChild(_0x4edd64);
  _0x279d8f.appendChild(_0x4320dd);
  const _0xd7f08e = () => _0x1b5459 === "all" || _0x1b5459 === "image";
  const _0x488db1 = () => _0x1b5459 === "all" || _0x1b5459 === "video";
  const _0x424a59 = () => {
    if (_0x1b5459 === "image") {
      return _0x5c5e6c.length > 0;
    }
    if (_0x1b5459 === "video") {
      return _0x52bd78.length > 0;
    }
    return _0x5c5e6c.length > 0 || _0x52bd78.length > 0;
  };
  const _0xb53aff = () => {
    const _0x340e7b = Math.min(_0x5c5e6c.length, MAX_BATCH_CREATE_COUNT);
    const _0x359ce7 = Math.min(_0x52bd78.length, MAX_VIDEO_CREATE_COUNT);
    if (_0x1b5459 === "image") {
      return _0x340e7b > 0 && _0x54d3cd.size >= _0x340e7b;
    }
    if (_0x1b5459 === "video") {
      return _0x359ce7 > 0 && _0x571a78.size >= _0x359ce7;
    }
    return (_0x340e7b === 0 || _0x54d3cd.size >= _0x340e7b) && (_0x359ce7 === 0 || _0x571a78.size >= _0x359ce7);
  };
  const _0x560eaa = () => {
    _0x3430a8.replaceChildren(createMediaFilterButton(_0xc4445f, webPreviewCaptureText("filters.all"), "all", _0x1b5459, false, _0xfaa7d7), createMediaFilterButton(_0xc4445f, webPreviewCaptureText("filters.image"), "image", _0x1b5459, _0x5c5e6c.length === 0, _0xfaa7d7), createMediaFilterButton(_0xc4445f, webPreviewCaptureText("filters.video"), "video", _0x1b5459, _0x52bd78.length === 0, _0xfaa7d7));
  };
  function _0xfaa7d7(_0x3871ff) {
    _0x1b5459 = _0x3871ff;
    _0x1a3207();
    _0x2db6af();
  }
  function _0x199f29() {
    if (_0x1b5459 === "all" || _0x1b5459 === "image") {
      selectCandidateUrls(_0x54d3cd, _0x5c5e6c, MAX_BATCH_CREATE_COUNT);
    }
    if (_0x1b5459 === "all" || _0x1b5459 === "video") {
      selectCandidateUrls(_0x571a78, _0x52bd78, MAX_VIDEO_CREATE_COUNT);
    }
  }
  function _0x3fe917() {
    if (_0x1b5459 === "all" || _0x1b5459 === "image") {
      _0x5c5e6c.forEach(_0x516fc7 => _0x54d3cd.delete(_0x516fc7.url));
    }
    if (_0x1b5459 === "all" || _0x1b5459 === "video") {
      _0x52bd78.forEach(_0x276600 => _0x571a78.delete(_0x276600.url));
    }
  }
  const _0x2db6af = () => {
    const _0x3dac46 = Math.min(_0x5c5e6c.length, MAX_BATCH_CREATE_COUNT);
    const _0x18d7d8 = Math.min(_0x52bd78.length, MAX_VIDEO_CREATE_COUNT);
    _0x4b39ff.textContent = webPreviewCaptureText("mediaPicker.count", {
      imageSelected: _0x54d3cd.size,
      imageMax: _0x3dac46,
      videoSelected: _0x571a78.size,
      videoMax: _0x18d7d8
    });
    const _0xa47c3b = _0x54d3cd.size > 0 || _0x571a78.size > 0;
    _0x4320dd.disabled = !_0xa47c3b || _0x571a78.size > 0 && _0x1ea5a5.checked !== true;
    const _0x2665bd = _0xb53aff();
    _0x260f26.textContent = _0x2665bd ? webPreviewCaptureText("buttons.clearSelection") : webPreviewCaptureText("buttons.selectAll");
    _0x260f26.disabled = !_0x424a59();
  };
  const _0x46af45 = (_0x12b342, _0x3dd095) => {
    if (_0x3dd095) {
      if (_0x54d3cd.size >= MAX_BATCH_CREATE_COUNT) {
        showToast?.(webPreviewCaptureText("toasts.imageLimit", {
          limit: MAX_BATCH_CREATE_COUNT
        }), "warning");
        _0x1c26f9();
        return;
      }
      _0x54d3cd.add(_0x12b342);
    } else {
      _0x54d3cd.delete(_0x12b342);
    }
    _0x2db6af();
  };
  const _0x27377a = (_0x4e32c8, _0x4ceed8) => {
    if (_0x4ceed8) {
      if (_0x571a78.size >= MAX_VIDEO_CREATE_COUNT) {
        showToast?.(webPreviewCaptureText("toasts.videoLimit", {
          limit: MAX_VIDEO_CREATE_COUNT
        }), "warning");
        _0x4e0451();
        return;
      }
      _0x571a78.add(_0x4e32c8);
    } else {
      _0x571a78.delete(_0x4e32c8);
    }
    _0x2db6af();
  };
  const _0x1c26f9 = () => {
    _0x138bd9.replaceChildren(..._0x5c5e6c.map(_0x497e4d => createImagePickerItem(_0xc4445f, _0x497e4d, _0x54d3cd, _0x46af45)));
    _0x2db6af();
  };
  const _0x4e0451 = () => {
    _0x9614ad.replaceChildren(..._0x52bd78.map((_0x404c8c, _0x3124ed) => createVideoPickerItem(_0xc4445f, _0x404c8c, _0x571a78, _0x27377a, _0x3124ed)));
    _0x2db6af();
  };
  function _0x1a3207() {
    _0x560eaa();
    const _0x55dd9f = [_0x55ca02];
    if (_0xd7f08e() && _0x5c5e6c.length) {
      _0x55dd9f.push(createPickerSection(_0xc4445f, webPreviewCaptureText("filters.image"), _0x138bd9));
    }
    if (_0x488db1() && _0x52bd78.length) {
      _0x55dd9f.push(_0x48f387, _0x58e7be, createPickerSection(_0xc4445f, webPreviewCaptureText("filters.video"), _0x9614ad));
    }
    _0x5b42a0.replaceChildren(..._0x55dd9f);
  }
  function _0x571950() {
    if (_0x3333e4) {
      return;
    }
    _0x3333e4 = true;
    _0x363eca.remove();
    _0xc4445f.removeEventListener("keydown", _0x12ff1c, true);
    dispatchWebPreviewPickerSync("media-picker-close");
  }
  const _0x12ff1c = _0x18dcc2 => {
    if (_0x18dcc2.key === "Escape") {
      _0x571950();
    }
  };
  _0x1ea5a5.addEventListener("change", _0x2db6af);
  _0x260f26.addEventListener("click", () => {
    if (_0xb53aff()) {
      _0x3fe917();
    } else {
      _0x199f29();
    }
    _0x1c26f9();
    _0x4e0451();
  });
  _0x4edd64.addEventListener("click", _0x571950);
  _0x4320dd.addEventListener("click", () => {
    const _0xf9f1ec = _0x5c5e6c.filter(_0x41bbd9 => _0x54d3cd.has(_0x41bbd9.url));
    const _0x446ded = _0x52bd78.filter(_0x19cb5a => _0x571a78.has(_0x19cb5a.url));
    const _0x3f511f = createBatchWebMediaNodes({
      nodeId: _0x453570,
      imageCandidates: _0xf9f1ec,
      videoCandidates: _0x446ded,
      storeInstance: storeInstance,
      commitFn: commitFn,
      rightsConfirmed: _0x571a78.size > 0 && _0x1ea5a5.checked === true
    });
    if (_0x3f511f.length) {
      showToast?.(webPreviewCaptureText("toasts.mediaAdded", {
        count: _0x3f511f.length
      }), "success");
    }
    _0x571950();
  });
  _0x1c26f9();
  _0x4e0451();
  _0x1a3207();
  _0x55ca4f.appendChild(_0x523106);
  _0x55ca4f.appendChild(_0x5b42a0);
  _0x55ca4f.appendChild(_0x279d8f);
  _0x363eca.appendChild(_0x55ca4f);
  _0xc4445f.body.appendChild(_0x363eca);
  _0xc4445f.addEventListener("keydown", _0x12ff1c, true);
  dispatchWebPreviewPickerSync("media-picker-open");
  return true;
}
export function openWebPreviewVideoPicker({
  nodeId: _0x3ca2e3,
  candidates = [],
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  showToast = globalThis.window?.showToast
} = {}) {
  const _0x23aeb2 = globalThis.document;
  if (!_0x23aeb2?.body) {
    return false;
  }
  const _0x56fd9a = normalizeVideoCandidates(candidates);
  if (!_0x56fd9a.length) {
    showToast?.(webPreviewCaptureText("toasts.noVideos"), "warning");
    return false;
  }
  _0x23aeb2.querySelector(".web-preview-image-picker-overlay")?.remove();
  const _0x426fc7 = new Set();
  const _0x567982 = _0x23aeb2.createElement("div");
  let _0x569a2f = false;
  _0x567982.className = "web-preview-image-picker-overlay";
  _0x567982.addEventListener("pointerdown", _0x2ea7a2 => {
    _0x2ea7a2.stopPropagation();
    if (_0x2ea7a2.target === _0x567982) {
      _0x118f10();
    }
  });
  const _0x5e2520 = _0x23aeb2.createElement("section");
  _0x5e2520.className = "web-preview-image-picker web-preview-video-picker";
  _0x5e2520.addEventListener("pointerdown", _0x1a1dca => _0x1a1dca.stopPropagation());
  const _0xdc5dff = _0x23aeb2.createElement("div");
  _0xdc5dff.className = "web-preview-image-picker-header";
  const _0x53964c = _0x23aeb2.createElement("h3");
  _0x53964c.textContent = webPreviewCaptureText("videoPicker.title");
  const _0xbb686c = _0x23aeb2.createElement("span");
  _0xbb686c.className = "web-preview-image-picker-count";
  _0xdc5dff.appendChild(_0x53964c);
  _0xdc5dff.appendChild(_0xbb686c);
  const _0x40e616 = _0x23aeb2.createElement("p");
  _0x40e616.className = "web-preview-video-picker-notice";
  _0x40e616.textContent = webPreviewCaptureText("videoPicker.notice");
  const _0x241d77 = _0x23aeb2.createElement("label");
  _0x241d77.className = "web-preview-video-picker-consent";
  const _0x4c402c = _0x23aeb2.createElement("input");
  _0x4c402c.type = "checkbox";
  const _0x2d31fb = _0x23aeb2.createElement("span");
  _0x2d31fb.textContent = webPreviewCaptureText("mediaPicker.consent");
  _0x241d77.appendChild(_0x4c402c);
  _0x241d77.appendChild(_0x2d31fb);
  const _0x56a018 = _0x23aeb2.createElement("div");
  _0x56a018.className = "web-preview-image-picker-grid web-preview-video-picker-grid";
  const _0x333d24 = _0x23aeb2.createElement("div");
  _0x333d24.className = "web-preview-image-picker-actions";
  const _0x379a87 = _0x23aeb2.createElement("button");
  _0x379a87.type = "button";
  _0x379a87.className = "web-preview-image-picker-btn";
  _0x379a87.textContent = webPreviewCaptureText("buttons.selectAll");
  const _0x144e5e = _0x23aeb2.createElement("button");
  _0x144e5e.type = "button";
  _0x144e5e.className = "web-preview-image-picker-btn";
  _0x144e5e.textContent = webPreviewCaptureText("buttons.cancel");
  const _0x655d40 = _0x23aeb2.createElement("button");
  _0x655d40.type = "button";
  _0x655d40.className = "web-preview-image-picker-btn web-preview-image-picker-btn--primary";
  _0x655d40.textContent = webPreviewCaptureText("buttons.saveAsSourceVideo");
  _0x333d24.appendChild(_0x379a87);
  _0x333d24.appendChild(_0x144e5e);
  _0x333d24.appendChild(_0x655d40);
  const _0x2dced1 = () => {
    const _0x41dd64 = Math.min(_0x56fd9a.length, MAX_VIDEO_CREATE_COUNT);
    _0xbb686c.textContent = _0x426fc7.size + "/" + _0x41dd64;
    _0x655d40.disabled = _0x426fc7.size === 0 || _0x4c402c.checked !== true;
    _0x379a87.disabled = _0x426fc7.size >= _0x41dd64;
  };
  const _0x59619e = (_0x445a39, _0x223252) => {
    if (_0x223252) {
      if (_0x426fc7.size >= MAX_VIDEO_CREATE_COUNT) {
        showToast?.(webPreviewCaptureText("toasts.videoLimit", {
          limit: MAX_VIDEO_CREATE_COUNT
        }), "warning");
        _0x54b075();
        return;
      }
      _0x426fc7.add(_0x445a39);
    } else {
      _0x426fc7.delete(_0x445a39);
    }
    _0x2dced1();
  };
  const _0x54b075 = () => {
    _0x56a018.replaceChildren(..._0x56fd9a.map((_0x4c4c74, _0x561381) => createVideoPickerItem(_0x23aeb2, _0x4c4c74, _0x426fc7, _0x59619e, _0x561381)));
    _0x2dced1();
  };
  function _0x118f10() {
    if (_0x569a2f) {
      return;
    }
    _0x569a2f = true;
    _0x567982.remove();
    _0x23aeb2.removeEventListener("keydown", _0x4c6e0c, true);
    dispatchWebPreviewPickerSync("video-picker-close");
  }
  const _0x4c6e0c = _0x1ac8d2 => {
    if (_0x1ac8d2.key === "Escape") {
      _0x118f10();
    }
  };
  _0x4c402c.addEventListener("change", _0x2dced1);
  _0x379a87.addEventListener("click", () => {
    selectCandidateUrls(_0x426fc7, _0x56fd9a, MAX_VIDEO_CREATE_COUNT);
    _0x54b075();
  });
  _0x144e5e.addEventListener("click", _0x118f10);
  _0x655d40.addEventListener("click", () => {
    const _0x23b986 = _0x56fd9a.filter(_0x28a900 => _0x426fc7.has(_0x28a900.url));
    const _0x37da59 = createBatchWebVideoNodes({
      nodeId: _0x3ca2e3,
      candidates: _0x23b986,
      storeInstance: storeInstance,
      commitFn: commitFn,
      rightsConfirmed: _0x4c402c.checked === true
    });
    if (_0x37da59.length) {
      showToast?.(webPreviewCaptureText("toasts.videosSaved", {
        count: _0x37da59.length
      }), "success");
    }
    _0x118f10();
  });
  _0x54b075();
  _0x5e2520.appendChild(_0xdc5dff);
  _0x5e2520.appendChild(_0x40e616);
  _0x5e2520.appendChild(_0x241d77);
  _0x5e2520.appendChild(_0x56a018);
  _0x5e2520.appendChild(_0x333d24);
  _0x567982.appendChild(_0x5e2520);
  _0x23aeb2.body.appendChild(_0x567982);
  _0x23aeb2.addEventListener("keydown", _0x4c6e0c, true);
  dispatchWebPreviewPickerSync("video-picker-open");
  return true;
}
export function openWebPreviewImagePicker({
  nodeId: _0x4bb3e9,
  candidates = [],
  storeInstance = a1468_0x1e8abd,
  commitFn = commit,
  showToast = globalThis.window?.showToast
} = {}) {
  const _0x464d90 = globalThis.document;
  if (!_0x464d90?.body) {
    return false;
  }
  const _0x501e34 = normalizeImageCandidates(candidates);
  if (!_0x501e34.length) {
    showToast?.(webPreviewCaptureText("toasts.noImages"), "warning");
    return false;
  }
  _0x464d90.querySelector(".web-preview-image-picker-overlay")?.remove();
  const _0x1a8558 = new Set();
  const _0x3405d4 = _0x464d90.createElement("div");
  let _0x5bda8a = false;
  _0x3405d4.className = "web-preview-image-picker-overlay";
  _0x3405d4.addEventListener("pointerdown", _0x6b8c84 => {
    _0x6b8c84.stopPropagation();
    if (_0x6b8c84.target === _0x3405d4) {
      _0x8972e3();
    }
  });
  const _0xb26558 = _0x464d90.createElement("section");
  _0xb26558.className = "web-preview-image-picker";
  _0xb26558.addEventListener("pointerdown", _0x31145d => _0x31145d.stopPropagation());
  const _0x27407f = _0x464d90.createElement("div");
  _0x27407f.className = "web-preview-image-picker-header";
  const _0x46da06 = _0x464d90.createElement("h3");
  _0x46da06.textContent = webPreviewCaptureText("imagePicker.title");
  const _0x41eb4b = _0x464d90.createElement("span");
  _0x41eb4b.className = "web-preview-image-picker-count";
  _0x27407f.appendChild(_0x46da06);
  _0x27407f.appendChild(_0x41eb4b);
  const _0x4bca14 = _0x464d90.createElement("div");
  _0x4bca14.className = "web-preview-image-picker-grid";
  const _0xfea548 = _0x464d90.createElement("div");
  _0xfea548.className = "web-preview-image-picker-actions";
  const _0x8ee125 = _0x464d90.createElement("button");
  _0x8ee125.type = "button";
  _0x8ee125.className = "web-preview-image-picker-btn";
  _0x8ee125.textContent = webPreviewCaptureText("buttons.selectAll");
  const _0x1ea77a = _0x464d90.createElement("button");
  _0x1ea77a.type = "button";
  _0x1ea77a.className = "web-preview-image-picker-btn";
  _0x1ea77a.textContent = webPreviewCaptureText("buttons.cancel");
  const _0x325718 = _0x464d90.createElement("button");
  _0x325718.type = "button";
  _0x325718.className = "web-preview-image-picker-btn web-preview-image-picker-btn--primary";
  _0x325718.textContent = webPreviewCaptureText("buttons.addToCanvas");
  _0xfea548.appendChild(_0x8ee125);
  _0xfea548.appendChild(_0x1ea77a);
  _0xfea548.appendChild(_0x325718);
  const _0x26f0cb = () => {
    const _0x97a57e = Math.min(_0x501e34.length, MAX_BATCH_CREATE_COUNT);
    _0x41eb4b.textContent = _0x1a8558.size + "/" + _0x97a57e;
    _0x325718.disabled = _0x1a8558.size === 0;
    _0x8ee125.disabled = _0x1a8558.size >= _0x97a57e;
  };
  const _0x3e9b7b = (_0x431b9e, _0xbf70bf) => {
    if (_0xbf70bf) {
      if (_0x1a8558.size >= MAX_BATCH_CREATE_COUNT) {
        showToast?.(webPreviewCaptureText("toasts.imageLimit", {
          limit: MAX_BATCH_CREATE_COUNT
        }), "warning");
        _0x47d3ac();
        return;
      }
      _0x1a8558.add(_0x431b9e);
    } else {
      _0x1a8558.delete(_0x431b9e);
    }
    _0x26f0cb();
  };
  const _0x47d3ac = () => {
    _0x4bca14.replaceChildren(..._0x501e34.map(_0x4327b5 => createImagePickerItem(_0x464d90, _0x4327b5, _0x1a8558, _0x3e9b7b)));
    _0x26f0cb();
  };
  function _0x8972e3() {
    if (_0x5bda8a) {
      return;
    }
    _0x5bda8a = true;
    _0x3405d4.remove();
    _0x464d90.removeEventListener("keydown", _0x4fe94e, true);
    dispatchWebPreviewPickerSync("image-picker-close");
  }
  const _0x4fe94e = _0x2ef422 => {
    if (_0x2ef422.key === "Escape") {
      _0x8972e3();
    }
  };
  _0x8ee125.addEventListener("click", () => {
    selectCandidateUrls(_0x1a8558, _0x501e34, MAX_BATCH_CREATE_COUNT);
    _0x47d3ac();
  });
  _0x1ea77a.addEventListener("click", _0x8972e3);
  _0x325718.addEventListener("click", () => {
    const _0x337e7b = _0x501e34.filter(_0x3a9041 => _0x1a8558.has(_0x3a9041.url));
    const _0x59615c = createBatchWebImageNodes({
      nodeId: _0x4bb3e9,
      candidates: _0x337e7b,
      storeInstance: storeInstance,
      commitFn: commitFn
    });
    if (_0x59615c.length) {
      showToast?.(webPreviewCaptureText("toasts.imagesAdded", {
        count: _0x59615c.length
      }), "success");
    }
    _0x8972e3();
  });
  _0x47d3ac();
  _0xb26558.appendChild(_0x27407f);
  _0xb26558.appendChild(_0x4bca14);
  _0xb26558.appendChild(_0xfea548);
  _0x3405d4.appendChild(_0xb26558);
  _0x464d90.body.appendChild(_0x3405d4);
  _0x464d90.addEventListener("keydown", _0x4fe94e, true);
  dispatchWebPreviewPickerSync("image-picker-open");
  return true;
}