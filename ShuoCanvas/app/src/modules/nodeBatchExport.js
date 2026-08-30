import { t } from "../i18n/index.js";
import { isNodeType } from "./registry.js";
import { isRemoteHttpUrl, normalizeCanvasLocalPath, resolveCanvasAudioLocalPath, resolveCanvasVideoLocalPath } from "../services/canvasMediaLocalService.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { saveMediaDownload, saveTextDownload } from "../services/downloadSaveService.js";
import { resolveNodeMediaDownloadFilename } from "../components/nodeToolbar/mediaDownloadFilename.js";
const TEXT_NODE_TYPES = Object.freeze(["source-text", "text", "ai-text"]);
const IMAGE_NODE_TYPES = Object.freeze(["source-image", "image", "ai-image"]);
const VIDEO_NODE_TYPES = Object.freeze(["source-video", "video", "ai-video"]);
const AUDIO_NODE_TYPES = Object.freeze(["source-audio", "audio", "ai-audio"]);
const IMAGE_LOCAL_KEYS = Object.freeze(["localPath", "originalLocalPath", "displayLocalPath", "sourceUrl", "imageUrl", "src", "url", "resultUrl"]);
const IMAGE_REMOTE_KEYS = Object.freeze(["sourceUrl", "imageUrl", "src", "url", "resultUrl"]);
const VIDEO_REMOTE_KEYS = Object.freeze(["videoUrl", "src", "url", "resultUrl"]);
const AUDIO_REMOTE_KEYS = Object.freeze(["audioUrl", "src", "url", "resultUrl"]);
function trimText(_0x56d063) {
  return String(_0x56d063 || "").trim();
}
function firstNonEmpty(..._0x3e17df) {
  for (const _0x52d08f of _0x3e17df) {
    const _0x504295 = trimText(_0x52d08f);
    if (_0x504295) {
      return _0x504295;
    }
  }
  return "";
}
function firstNonEmptyRaw(..._0x2061b6) {
  for (const _0x2d75f6 of _0x2061b6) {
    const _0x5979cd = String(_0x2d75f6 ?? "");
    if (_0x5979cd.trim()) {
      return _0x5979cd;
    }
  }
  return "";
}
function getNodeName(_0x50d9f1, _0x52806d = "") {
  return firstNonEmpty(_0x50d9f1?.name, _0x50d9f1?.label, _0x50d9f1?.title, _0x50d9f1?.fileName, _0x52806d);
}
function pickPrimaryItem(_0x3b3a83, _0x491431) {
  if (!Array.isArray(_0x3b3a83) || _0x3b3a83.length <= 0) {
    return null;
  }
  const _0x3d4941 = Number.isFinite(Number(_0x491431)) ? Math.max(0, Math.trunc(Number(_0x491431))) : 0;
  return _0x3b3a83[Math.min(_0x3d4941, _0x3b3a83.length - 1)] || _0x3b3a83[0] || null;
}
function collectSources(..._0x248ffe) {
  return _0x248ffe.filter(_0x5cf2dc => _0x5cf2dc && typeof _0x5cf2dc === "object" && !Array.isArray(_0x5cf2dc));
}
function pickLocalPath(_0x3202f8, _0x5e7b86) {
  for (const _0x21c3a6 of _0x3202f8) {
    for (const _0x54336b of _0x5e7b86) {
      const _0x5e5dde = normalizeCanvasLocalPath(_0x21c3a6?.[_0x54336b]);
      if (_0x5e5dde) {
        return _0x5e5dde;
      }
    }
  }
  return "";
}
function pickRemoteUrl(_0x657bc1, _0xf1c345) {
  for (const _0xd725ac of _0x657bc1) {
    for (const _0x3d8788 of _0xf1c345) {
      const _0xb607fa = trimText(_0xd725ac?.[_0x3d8788]);
      if (isRemoteHttpUrl(_0xb607fa)) {
        return _0xb607fa;
      }
    }
  }
  return "";
}
function pickFileNameHint(_0x58c449) {
  for (const _0x41e233 of _0x58c449) {
    const _0xa698ae = firstNonEmpty(_0x41e233?.fileName, _0x41e233?.filename, _0x41e233?.name);
    if (_0xa698ae) {
      return _0xa698ae;
    }
  }
  return "";
}
function buildTextExportItem(_0xf1e212, _0x58eeae) {
  let _0x2ca4de = "";
  if (isNodeType(_0xf1e212, ["source-text", "text"])) {
    _0x2ca4de = firstNonEmptyRaw(_0xf1e212?.content);
  } else if (isNodeType(_0xf1e212, "ai-text")) {
    _0x2ca4de = firstNonEmptyRaw(_0xf1e212?.outputText, _0xf1e212?.resultText);
  }
  if (!_0x2ca4de.trim()) {
    return null;
  }
  return {
    nodeId: _0x58eeae,
    nodeName: getNodeName(_0xf1e212, _0x58eeae),
    nodeType: trimText(_0xf1e212?.type),
    kind: "text",
    text: _0x2ca4de
  };
}
function buildImageExportItem(_0x37d7a8, _0x1dcfa5) {
  const _0x39cc70 = pickPrimaryItem(_0x37d7a8?.images, _0x37d7a8?.mainImageIndex);
  const _0x19e355 = collectSources(_0x39cc70, _0x37d7a8);
  const _0x544845 = pickLocalPath(_0x19e355, IMAGE_LOCAL_KEYS);
  const _0x228806 = _0x544845 ? "" : pickRemoteUrl(_0x19e355, IMAGE_REMOTE_KEYS);
  if (!_0x544845 && !_0x228806) {
    return null;
  }
  return {
    nodeId: _0x1dcfa5,
    nodeName: getNodeName(_0x37d7a8, _0x1dcfa5),
    nodeType: trimText(_0x37d7a8?.type),
    kind: "image",
    localPath: _0x544845,
    url: _0x228806,
    filenameHint: pickFileNameHint(_0x19e355)
  };
}
function buildVideoExportItem(_0xcfda50, _0x3d1cd0) {
  const _0x468698 = pickPrimaryItem(_0xcfda50?.videos, _0xcfda50?.mainVideoIndex);
  const _0x4ecd9a = collectSources(_0x468698, _0xcfda50);
  let _0x2f149a = "";
  for (const _0x1fabfb of _0x4ecd9a) {
    _0x2f149a = resolveCanvasVideoLocalPath(_0x1fabfb);
    if (_0x2f149a) {
      break;
    }
  }
  const _0x45f4e9 = _0x2f149a ? "" : pickRemoteUrl(_0x4ecd9a, VIDEO_REMOTE_KEYS);
  if (!_0x2f149a && !_0x45f4e9) {
    return null;
  }
  return {
    nodeId: _0x3d1cd0,
    nodeName: getNodeName(_0xcfda50, _0x3d1cd0),
    nodeType: trimText(_0xcfda50?.type),
    kind: "video",
    localPath: _0x2f149a,
    url: _0x45f4e9,
    filenameHint: pickFileNameHint(_0x4ecd9a)
  };
}
function buildAudioExportItem(_0x4684e1, _0x2b1733) {
  const _0xbda87e = collectSources(_0x4684e1);
  const _0x3a539e = resolveCanvasAudioLocalPath(_0x4684e1);
  const _0x50ea7e = _0x3a539e ? "" : pickRemoteUrl(_0xbda87e, AUDIO_REMOTE_KEYS);
  if (!_0x3a539e && !_0x50ea7e) {
    return null;
  }
  return {
    nodeId: _0x2b1733,
    nodeName: getNodeName(_0x4684e1, _0x2b1733),
    nodeType: trimText(_0x4684e1?.type),
    kind: "audio",
    localPath: _0x3a539e,
    url: _0x50ea7e,
    filenameHint: pickFileNameHint(_0xbda87e)
  };
}
function buildExportItem(_0x89fb20, _0x74d38d) {
  if (!_0x89fb20 || typeof _0x89fb20 !== "object") {
    return null;
  }
  if (isNodeType(_0x89fb20, TEXT_NODE_TYPES)) {
    return buildTextExportItem(_0x89fb20, _0x74d38d);
  }
  if (isNodeType(_0x89fb20, IMAGE_NODE_TYPES)) {
    return buildImageExportItem(_0x89fb20, _0x74d38d);
  }
  if (isNodeType(_0x89fb20, VIDEO_NODE_TYPES)) {
    return buildVideoExportItem(_0x89fb20, _0x74d38d);
  }
  if (isNodeType(_0x89fb20, AUDIO_NODE_TYPES)) {
    return buildAudioExportItem(_0x89fb20, _0x74d38d);
  }
  return null;
}
function normalizeSelectedIds(_0x3868f9) {
  if (_0x3868f9 instanceof Set) {
    return Array.from(_0x3868f9);
  }
  if (Array.isArray(_0x3868f9)) {
    return _0x3868f9;
  } else {
    return [];
  }
}
export function collectSelectedNodeExportItems({
  nodes = {},
  selectedNodeIds = []
} = {}) {
  const _0x4a004d = [];
  const _0x1e7734 = [];
  for (const _0x13d36d of normalizeSelectedIds(selectedNodeIds)) {
    const _0x153367 = trimText(_0x13d36d);
    if (!_0x153367) {
      continue;
    }
    const _0x1b8b19 = nodes?.[_0x153367];
    const _0x34172b = buildExportItem(_0x1b8b19, _0x153367);
    if (_0x34172b) {
      _0x4a004d.push(_0x34172b);
      continue;
    }
    if (_0x1b8b19) {
      _0x1e7734.push({
        nodeId: _0x153367,
        nodeName: getNodeName(_0x1b8b19, _0x153367),
        nodeType: trimText(_0x1b8b19?.type),
        reason: "NO_EXPORTABLE_CONTENT"
      });
    }
  }
  return {
    items: _0x4a004d,
    skipped: _0x1e7734
  };
}
export function hasBatchExportableSelection(_0x452c56 = {}, _0x30d095 = []) {
  return collectSelectedNodeExportItems({
    nodes: _0x452c56,
    selectedNodeIds: _0x30d095
  }).items.length > 0;
}
function resolveTextDownloadFilename(_0xf3833e) {
  const _0xec76c7 = firstNonEmpty(_0xf3833e?.nodeName, _0xf3833e?.nodeId, "text");
  const _0x238f9a = _0xec76c7.replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").replace(/[. ]+$/g, "").trim();
  const _0x34f6c1 = (_0x238f9a || "text").replace(/\.txt$/i, "");
  const _0x132b3e = _0x34f6c1.slice(0, 156).replace(/[. ]+$/g, "");
  return (_0x132b3e || "text") + ".txt";
}
function normalizeDownloadFailureMessage(_0x3baed6, _0x4b57ea) {
  return firstNonEmpty(_0x3baed6?.message, _0x3baed6?.error?.message, _0x3baed6?.error, _0x4b57ea);
}
export async function downloadNodeOutput({
  node: _0xaf4020,
  nodeId: _0xf579e9,
  showToast = globalThis.window?.showToast,
  saveTextDownload: _0x41e3c4 = saveTextDownload,
  saveMediaDownload: _0x2005e6 = saveMediaDownload,
  resolveNodeMediaDownloadFilename: _0x1472c3 = resolveNodeMediaDownloadFilename,
  downloadDependencies = {}
} = {}) {
  const _0x5e81dc = firstNonEmpty(_0xf579e9, _0xaf4020?.id, "node");
  const {
    items: _0x29b334,
    skipped: _0x297bb8
  } = collectSelectedNodeExportItems({
    nodes: {
      [_0x5e81dc]: _0xaf4020
    },
    selectedNodeIds: [_0x5e81dc]
  });
  const _0x433b32 = _0x29b334[0] || null;
  if (!_0x433b32) {
    show(showToast, t("nodeBatchExport.toasts.noExportable"), "warn");
    return {
      success: false,
      canceled: false,
      code: "NO_EXPORTABLE_ITEMS",
      nodeId: _0x5e81dc,
      kind: "",
      filename: "",
      skipped: _0x297bb8,
      saveResult: null
    };
  }
  let _0x5afb3c = "";
  try {
    if (_0x433b32.kind === "text") {
      _0x5afb3c = resolveTextDownloadFilename(_0x433b32);
    } else {
      _0x5afb3c = _0x1472c3({
        nodeName: _0x433b32.nodeName,
        kind: _0x433b32.kind,
        sources: [_0x433b32.filenameHint, _0x433b32.localPath, _0x433b32.url],
        fallbackBase: _0x433b32.kind
      });
    }
    const _0x3cdd0a = _0x433b32.kind === "text" ? await _0x41e3c4({
      filename: _0x5afb3c,
      content: _0x433b32.text,
      mimeType: "text/plain;charset=utf-8"
    }, downloadDependencies) : await _0x2005e6({
      kind: _0x433b32.kind,
      localPath: _0x433b32.localPath,
      url: _0x433b32.url,
      filename: _0x5afb3c
    }, downloadDependencies);
    if (_0x3cdd0a?.canceled) {
      return {
        success: false,
        canceled: true,
        code: "CANCELED",
        nodeId: _0x5e81dc,
        kind: _0x433b32.kind,
        filename: _0x5afb3c,
        skipped: _0x297bb8,
        saveResult: _0x3cdd0a
      };
    }
    if (_0x3cdd0a?.success === false) {
      const _0x5ae743 = normalizeDownloadFailureMessage(_0x3cdd0a, t("nodeBatchExport.toasts.failed"));
      show(showToast, t("nodeBatchExport.toasts.failedWithMessage", {
        message: _0x5ae743
      }), "error");
      return {
        success: false,
        canceled: false,
        code: firstNonEmpty(_0x3cdd0a?.code, "DOWNLOAD_FAILED"),
        error: _0x5ae743,
        nodeId: _0x5e81dc,
        kind: _0x433b32.kind,
        filename: _0x5afb3c,
        skipped: _0x297bb8,
        saveResult: _0x3cdd0a
      };
    }
    show(showToast, t("nodeBatchExport.toasts.completed", {
      count: 1
    }), "success");
    return {
      success: true,
      canceled: false,
      code: "DOWNLOADED",
      nodeId: _0x5e81dc,
      kind: _0x433b32.kind,
      filename: _0x5afb3c,
      skipped: _0x297bb8,
      saveResult: _0x3cdd0a || null
    };
  } catch (_0x444d10) {
    const _0x5a4ec9 = firstNonEmpty(_0x444d10?.message, _0x444d10, t("nodeBatchExport.toasts.failed"));
    show(showToast, t("nodeBatchExport.toasts.failedWithMessage", {
      message: _0x5a4ec9
    }), "error");
    return {
      success: false,
      canceled: false,
      code: "DOWNLOAD_FAILED",
      error: _0x5a4ec9,
      nodeId: _0x5e81dc,
      kind: _0x433b32.kind,
      filename: _0x5afb3c,
      skipped: _0x297bb8,
      saveResult: null
    };
  }
}
function mergeSkipped(..._0x421f9d) {
  return _0x421f9d.flatMap(_0x8fb49 => Array.isArray(_0x8fb49) ? _0x8fb49 : []);
}
function show(_0x872070, _0x467100, _0x2cf920) {
  if (typeof _0x872070 === "function") {
    _0x872070(_0x467100, _0x2cf920);
  }
}
export async function exportSelectedNodesBatch({
  state = {},
  electronAPI = desktopBridge.nodeExport.isAvailable() ? {
    nodeExport: desktopBridge.nodeExport
  } : null,
  showToast = globalThis.window?.showToast,
  consoleObject = globalThis.console
} = {}) {
  const _0x58c74e = normalizeSelectedIds(state?.selectedNodeIds);
  const {
    items: _0x43bf18,
    skipped: _0x338cbb
  } = collectSelectedNodeExportItems({
    nodes: state?.nodes || {},
    selectedNodeIds: _0x58c74e
  });
  if (_0x43bf18.length <= 0) {
    show(showToast, t("nodeBatchExport.toasts.noExportable"), "warn");
    if (_0x338cbb.length > 0) {
      consoleObject?.info?.("[node-batch-export] skipped", _0x338cbb);
    }
    return {
      success: false,
      canceled: false,
      code: "NO_EXPORTABLE_ITEMS",
      exportedCount: 0,
      skipped: _0x338cbb,
      counts: {}
    };
  }
  const _0x3af5a5 = electronAPI?.nodeExport?.exportSelected;
  if (typeof _0x3af5a5 !== "function") {
    show(showToast, t("nodeBatchExport.toasts.unsupported"), "error");
    return {
      success: false,
      canceled: false,
      code: "UNSUPPORTED",
      exportedCount: 0,
      skipped: _0x338cbb,
      counts: {}
    };
  }
  show(showToast, t("nodeBatchExport.toasts.started"), "info");
  try {
    const _0x763c16 = await _0x3af5a5({
      items: _0x43bf18
    });
    if (_0x763c16?.canceled) {
      return _0x763c16;
    }
    const _0x4d02e0 = mergeSkipped(_0x338cbb, _0x763c16?.skipped);
    if (_0x763c16?.success) {
      if (_0x4d02e0.length > 0) {
        consoleObject?.info?.("[node-batch-export] skipped", _0x4d02e0);
        show(showToast, t("nodeBatchExport.toasts.completedWithSkipped", {
          exported: _0x763c16.exportedCount || 0,
          skipped: _0x4d02e0.length
        }), "success");
      } else {
        show(showToast, t("nodeBatchExport.toasts.completed", {
          count: _0x763c16.exportedCount || 0
        }), "success");
      }
      return {
        ..._0x763c16,
        skipped: _0x4d02e0
      };
    }
    if (_0x763c16?.code === "NO_EXPORTABLE_ITEMS") {
      show(showToast, t("nodeBatchExport.toasts.noExportable"), "warn");
      return {
        ..._0x763c16,
        skipped: _0x4d02e0
      };
    }
    const _0x382fd4 = _0x763c16?.message || _0x763c16?.error || t("nodeBatchExport.toasts.failed");
    show(showToast, _0x382fd4, "error");
    return {
      ..._0x763c16,
      skipped: _0x4d02e0
    };
  } catch (_0x5938f2) {
    const _0x4a3544 = String(_0x5938f2?.message || _0x5938f2 || "");
    show(showToast, t("nodeBatchExport.toasts.failedWithMessage", {
      message: _0x4a3544 || t("nodeBatchExport.toasts.failed")
    }), "error");
    return {
      success: false,
      canceled: false,
      error: _0x4a3544,
      exportedCount: 0,
      skipped: _0x338cbb,
      counts: {}
    };
  }
}