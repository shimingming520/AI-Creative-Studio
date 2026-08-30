import { desktopBridge } from "../services/desktopBridge.js";
const CLIPBOARD_GRAPH_SCHEMA_VERSION = 1;
let clipData = null;
let clipMeta = {
  copiedAt: 0,
  systemSignatureAtCopy: "",
  systemCopiedAt: 0,
  systemSignature: ""
};
function buildClipboardSignatureFromReadResult({
  files = [],
  mediaType = "",
  mediaSize = 0,
  text = ""
} = {}) {
  if (Array.isArray(files) && files.length > 0) {
    const _0x1bc2bf = files.map(_0x316425 => String(_0x316425?.path || _0x316425?.name || "")).filter(Boolean).slice(0, 8).join("|");
    return "files:" + _0x1bc2bf + "|len:" + files.length;
  }
  if (mediaType) {
    return "media:" + String(mediaType).toLowerCase() + "|" + (Number(mediaSize) || 0);
  }
  const _0x34860c = String(text || "");
  if (!_0x34860c.trim()) {
    return "";
  }
  const _0x2cb602 = _0x34860c.slice(0, 256);
  return "text:" + _0x2cb602 + "|len:" + _0x34860c.length;
}
function cloneJson(_0x330216) {
  return JSON.parse(JSON.stringify(_0x330216));
}
function normalizeNodeClipboardPayload(_0x2d4afb, {
  edges = []
} = {}) {
  if (!Array.isArray(_0x2d4afb) || _0x2d4afb.length === 0) {
    return null;
  }
  return {
    schemaVersion: CLIPBOARD_GRAPH_SCHEMA_VERSION,
    nodes: cloneJson(_0x2d4afb),
    edges: Array.isArray(edges) ? cloneJson(edges) : []
  };
}
function getBase64ByteLength(_0x125a57) {
  const _0x8af77e = String(_0x125a57 || "").replace(/\s/g, "");
  if (!_0x8af77e) {
    return 0;
  }
  const _0x44a687 = _0x8af77e.endsWith("==") ? 2 : _0x8af77e.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor(_0x8af77e.length * 3 / 4) - _0x44a687);
}
async function captureElectronClipboardSignatureBestEffort() {
  const _0x209cd3 = desktopBridge.clipboard;
  if (!_0x209cd3.canUseFiles() && !_0x209cd3.canUseImages() && !_0x209cd3.canUseText()) {
    return "";
  }
  try {
    if (typeof _0x209cd3.readFileReferences === "function") {
      const _0x5b6d9a = await _0x209cd3.readFileReferences();
      if (_0x5b6d9a?.ok && Array.isArray(_0x5b6d9a.files) && _0x5b6d9a.files.length > 0) {
        const _0x5cf9d8 = buildClipboardSignatureFromReadResult({
          files: _0x5b6d9a.files
        });
        if (_0x5cf9d8) {
          return _0x5cf9d8;
        }
      }
    }
    if (typeof _0x209cd3.readImage === "function") {
      const _0x53c571 = await _0x209cd3.readImage();
      if (_0x53c571?.ok && _0x53c571.dataBase64) {
        const _0x2b988f = buildClipboardSignatureFromReadResult({
          mediaType: String(_0x53c571.mimeType || "image/png"),
          mediaSize: getBase64ByteLength(_0x53c571.dataBase64)
        });
        if (_0x2b988f) {
          return _0x2b988f;
        }
      }
    }
    if (typeof _0x209cd3.readText === "function") {
      const _0x2850b8 = await _0x209cd3.readText();
      if (_0x2850b8?.ok && typeof _0x2850b8.text === "string") {
        const _0x14f103 = buildClipboardSignatureFromReadResult({
          text: _0x2850b8.text
        });
        if (_0x14f103) {
          return _0x14f103;
        }
      }
    }
  } catch (_0x24dd07) {}
  return "";
}
async function captureSystemClipboardSignatureBestEffort() {
  const _0x518bfe = await captureElectronClipboardSignatureBestEffort();
  if (_0x518bfe) {
    return _0x518bfe;
  }
  try {
    const _0x546380 = globalThis?.navigator?.clipboard;
    const _0x53d84f = typeof _0x546380?.read === "function";
    const _0x2a9b50 = typeof _0x546380?.readText === "function";
    if (_0x53d84f) {
      const _0x578e2d = await _0x546380.read();
      for (const _0x5883cf of _0x578e2d) {
        const _0x37b9fc = _0x5883cf.types.find(_0x28e459 => _0x28e459.startsWith("image/") || _0x28e459.startsWith("video/") || _0x28e459.startsWith("audio/"));
        if (_0x37b9fc) {
          const _0x56c9bc = await _0x5883cf.getType(_0x37b9fc);
          return buildClipboardSignatureFromReadResult({
            mediaType: _0x37b9fc,
            mediaSize: _0x56c9bc?.size || 0
          });
        }
        if (_0x5883cf.types.includes("text/plain")) {
          const _0x1cebdb = await _0x5883cf.getType("text/plain");
          const _0x307a61 = await _0x1cebdb.text();
          const _0x7ec7c3 = buildClipboardSignatureFromReadResult({
            text: _0x307a61
          });
          if (_0x7ec7c3) {
            return _0x7ec7c3;
          }
        }
      }
    }
    if (_0x2a9b50) {
      const _0x74d5b1 = await _0x546380.readText();
      return buildClipboardSignatureFromReadResult({
        text: _0x74d5b1
      });
    }
  } catch (_0x5a4637) {}
  return "";
}
export function markSystemClipboardWrite({
  signature = "",
  mediaType = "",
  mediaSize = 0,
  text = ""
} = {}) {
  const _0x4361b6 = String(signature || "").trim() || buildClipboardSignatureFromReadResult({
    mediaType: mediaType,
    mediaSize: mediaSize,
    text: text
  });
  clipMeta = {
    ...clipMeta,
    systemCopiedAt: Date.now(),
    systemSignature: _0x4361b6 || clipMeta.systemSignature || ""
  };
}
export function observeSystemClipboardSignature(_0x221ade) {
  const _0xda1179 = String(_0x221ade || "").trim();
  if (!_0xda1179) {
    return;
  }
  clipMeta = {
    ...clipMeta,
    systemSignature: _0xda1179
  };
}
export function setClipboard(_0x31cf7b, _0x2fa4c9 = {}) {
  const _0x165ba7 = normalizeNodeClipboardPayload(_0x31cf7b, _0x2fa4c9);
  if (!_0x165ba7) {
    clipData = null;
    clipMeta = {
      ...clipMeta,
      copiedAt: 0,
      systemSignatureAtCopy: ""
    };
    return;
  }
  clipData = _0x165ba7;
  const _0xa59956 = Date.now();
  clipMeta = {
    ...clipMeta,
    copiedAt: _0xa59956,
    systemSignatureAtCopy: clipMeta.systemSignature || ""
  };
  Promise.resolve().then(async () => {
    const _0x14b9ac = await captureSystemClipboardSignatureBestEffort();
    if (!clipData) {
      return;
    }
    if (clipMeta.copiedAt !== _0xa59956) {
      return;
    }
    clipMeta = {
      ...clipMeta,
      systemSignatureAtCopy: _0x14b9ac || clipMeta.systemSignatureAtCopy || ""
    };
  }).catch(() => {});
}
export function getClipboard() {
  if (!clipData) {
    return null;
  }
  if (Array.isArray(clipData)) {
    return cloneJson(clipData);
  }
  return cloneJson(Array.isArray(clipData.nodes) ? clipData.nodes : []);
}
export function getClipboardGraph() {
  if (!clipData) {
    return null;
  }
  if (Array.isArray(clipData)) {
    return {
      schemaVersion: CLIPBOARD_GRAPH_SCHEMA_VERSION,
      nodes: cloneJson(clipData),
      edges: []
    };
  }
  return {
    schemaVersion: CLIPBOARD_GRAPH_SCHEMA_VERSION,
    nodes: cloneJson(Array.isArray(clipData.nodes) ? clipData.nodes : []),
    edges: cloneJson(Array.isArray(clipData.edges) ? clipData.edges : [])
  };
}
export function getClipboardMeta() {
  return {
    ...clipMeta
  };
}