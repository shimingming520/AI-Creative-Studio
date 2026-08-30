import { createDefaultCommentNoteStyle } from "../../components/commentNoteStyle.js";
import { findAvailablePosition, generateId, getViewportScreenCenter, screenToWorld } from "../../core/math.js";
import { t } from "../../i18n/index.js";
import { getNodeSpawnPrefs } from "../nodeSpawn.js";
import { desktopBridge } from "../../services/desktopBridge.js";
function getMimeExtension(_0x3a40a4, _0x5717bf = "bin") {
  const _0x46cfe8 = String(_0x3a40a4 || "").split(";")[0].trim().toLowerCase();
  if (!_0x46cfe8.includes("/")) {
    return _0x5717bf;
  }
  const _0x3dad03 = _0x46cfe8.split("/")[1] || _0x5717bf;
  return _0x3dad03.replace(/[^a-z0-9]/g, "") || _0x5717bf;
}
function buildSystemClipboardSignature({
  pastedMedia: _0x1e9377,
  pastedText: _0x2e37aa,
  pastedFiles: _0x3719c1
}) {
  if (Array.isArray(_0x3719c1) && _0x3719c1.length > 0) {
    const _0x141b6a = _0x3719c1.map(_0x2e751d => String(_0x2e751d?.path || _0x2e751d?.name || "")).filter(Boolean).slice(0, 8).join("|");
    return "files:" + _0x141b6a + "|len:" + _0x3719c1.length;
  }
  if (_0x1e9377?.mimeType) {
    const _0xc4aa82 = String(_0x1e9377.mimeType).toLowerCase();
    const _0x18da90 = Number(_0x1e9377?.blob?.size) || 0;
    return "media:" + _0xc4aa82 + "|" + _0x18da90;
  }
  const _0x22313a = String(_0x2e37aa || "");
  if (!_0x22313a.trim()) {
    return "";
  }
  const _0x10563c = _0x22313a.slice(0, 256);
  return "text:" + _0x10563c + "|len:" + _0x22313a.length;
}
function resolvePastedMediaDescriptor(_0x2e0831, _0x200024 = {}) {
  const _0x7bcae3 = String(_0x200024.nodeName || _0x200024.name || "").trim();
  const _0x4a5880 = String(_0x200024.typeSlug || "").trim();
  if (_0x2e0831.startsWith("image/")) {
    return {
      nodeType: "source-image",
      nodeName: _0x7bcae3 || t("canvasNodeFlows.paste.nodeName.image"),
      typeSlug: _0x4a5880 || "image"
    };
  }
  if (_0x2e0831.startsWith("video/")) {
    return {
      nodeType: "source-video",
      nodeName: _0x7bcae3 || t("canvasNodeFlows.paste.nodeName.video"),
      typeSlug: _0x4a5880 || "video"
    };
  }
  if (_0x2e0831.startsWith("audio/")) {
    return {
      nodeType: "source-audio",
      nodeName: _0x7bcae3 || t("canvasNodeFlows.paste.nodeName.audio"),
      typeSlug: _0x4a5880 || "audio"
    };
  }
  return null;
}
function centerNodeAtWorldPosition(_0x2392af, _0x23c6d1, _0x1ed410) {
  const _0x215310 = Number(_0x2392af?.width) || 0;
  const _0x5d9536 = Number(_0x2392af?.height) || 0;
  return {
    ..._0x2392af,
    x: _0x23c6d1 - _0x215310 / 2,
    y: _0x1ed410 - _0x5d9536 / 2
  };
}
function decodeBase64Bytes(_0x4d29a2) {
  const _0x3aa279 = String(_0x4d29a2 || "").trim();
  if (!_0x3aa279) {
    return new Uint8Array();
  }
  if (typeof atob === "function") {
    const _0x5dcd3f = atob(_0x3aa279);
    const _0x34cb7d = new Uint8Array(_0x5dcd3f.length);
    for (let _0x3bde69 = 0; _0x3bde69 < _0x5dcd3f.length; _0x3bde69 += 1) {
      _0x34cb7d[_0x3bde69] = _0x5dcd3f.charCodeAt(_0x3bde69);
    }
    return _0x34cb7d;
  }
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(_0x3aa279, "base64"));
  }
  return new Uint8Array();
}
function blobFromBase64(_0x3ed318, _0x633589) {
  const _0x24e56d = decodeBase64Bytes(_0x3ed318);
  if (!_0x24e56d.length) {
    return null;
  }
  return new Blob([_0x24e56d], {
    type: _0x633589 || "application/octet-stream"
  });
}
function normalizeSpawnDirection(_0x4a44b7) {
  if (_0x4a44b7 === "left" || _0x4a44b7 === "down") {
    return _0x4a44b7;
  } else {
    return "right";
  }
}
function toFinitePositiveNumber(_0x53a46a, _0x43beee) {
  const _0x42110a = Number(_0x53a46a);
  if (Number.isFinite(_0x42110a) && _0x42110a > 0) {
    return _0x42110a;
  } else {
    return _0x43beee;
  }
}
function getCssPixelValue(_0x1a105a, _0x452a21 = 0) {
  const _0x179f71 = globalThis.document;
  if (!_0x179f71) {
    return _0x452a21;
  }
  try {
    const _0x1f3c4e = globalThis.getComputedStyle?.(_0x179f71.body)?.getPropertyValue?.(_0x1a105a);
    const _0x5e6c81 = Number.parseFloat(_0x1f3c4e);
    if (Number.isFinite(_0x5e6c81)) {
      return _0x5e6c81;
    } else {
      return _0x452a21;
    }
  } catch {
    return _0x452a21;
  }
}
function getVisibleCanvasCenterScreenPosition(_0x18377f = {}) {
  const _0x36ed3f = globalThis.window || {};
  const _0x6b5c6b = toFinitePositiveNumber(_0x36ed3f.innerWidth, 0);
  const _0x352633 = toFinitePositiveNumber(_0x36ed3f.innerHeight, 0);
  let _0x5df1f1 = _0x6b5c6b;
  try {
    const _0x1acae7 = globalThis.document;
    const _0x5cc8ac = _0x1acae7?.body;
    if (_0x5cc8ac?.classList?.contains?.("agent-sidebar-open") && !_0x5cc8ac.classList.contains("agent-sidebar-collapsed")) {
      const _0x3c0b80 = _0x1acae7.querySelector?.(".agent-sidebar.is-open");
      const _0x377226 = Number(_0x3c0b80?.getBoundingClientRect?.()?.width);
      const _0x168826 = Number.isFinite(_0x377226) && _0x377226 > 0 ? _0x377226 : getCssPixelValue("--agent-sidebar-width", 0);
      _0x5df1f1 = Math.max(1, _0x6b5c6b - _0x168826);
    }
  } catch {}
  return getViewportScreenCenter(_0x18377f, _0x5df1f1, _0x352633);
}
function getSequenceNodes(_0x12d75b, _0x1dedfc) {
  if (!_0x1dedfc || !_0x12d75b || typeof _0x12d75b !== "object") {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x12d75b).filter(([, _0x3f01aa]) => String(_0x3f01aa?.spawnSequenceKey || "") === _0x1dedfc));
}
async function readElectronClipboardContents() {
  const _0x144afd = desktopBridge.clipboard;
  if (!_0x144afd.canUseFiles() && !_0x144afd.canUseImages() && !_0x144afd.canUseText()) {
    return {
      pastedFiles: [],
      pastedMedia: null,
      pastedText: "",
      failed: false
    };
  }
  const _0x38c33b = {
    pastedFiles: [],
    pastedMedia: null,
    pastedText: "",
    failed: false
  };
  try {
    if (typeof _0x144afd.readFileReferences === "function") {
      const _0x19ce91 = await _0x144afd.readFileReferences();
      if (_0x19ce91?.ok && Array.isArray(_0x19ce91.files)) {
        _0x38c33b.pastedFiles = _0x19ce91.files;
      }
    }
    if (_0x38c33b.pastedFiles.length === 0 && typeof _0x144afd.readImage === "function") {
      const _0x4ebd8b = await _0x144afd.readImage();
      if (_0x4ebd8b?.ok && _0x4ebd8b.dataBase64) {
        const _0x62348c = String(_0x4ebd8b.mimeType || "image/png");
        const _0x502a9 = blobFromBase64(_0x4ebd8b.dataBase64, _0x62348c);
        if (_0x502a9) {
          _0x38c33b.pastedMedia = {
            mimeType: _0x62348c,
            blob: _0x502a9
          };
        }
      }
    }
    if (typeof _0x144afd.readText === "function") {
      const _0x47fd9a = await _0x144afd.readText();
      if (_0x47fd9a?.ok && typeof _0x47fd9a.text === "string") {
        _0x38c33b.pastedText = _0x47fd9a.text;
      }
    }
  } catch (_0x42b1bf) {
    console.warn("[paste] Electron 剪贴板读取失败:", _0x42b1bf);
    _0x38c33b.failed = true;
  }
  return _0x38c33b;
}
async function readSystemClipboardContents() {
  let _0x1ffc67 = null;
  let _0x550935 = "";
  let _0x4a783e = [];
  let _0x342c38 = false;
  const _0x10f6d0 = await readElectronClipboardContents();
  _0x4a783e = _0x10f6d0.pastedFiles;
  _0x1ffc67 = _0x10f6d0.pastedMedia;
  _0x550935 = _0x10f6d0.pastedText;
  _0x342c38 = !!_0x10f6d0.failed;
  try {
    const _0x326624 = globalThis?.navigator?.clipboard;
    const _0xc18199 = typeof _0x326624?.read === "function";
    const _0x479ce5 = typeof _0x326624?.readText === "function";
    if (_0x4a783e.length === 0 && !_0x1ffc67 && _0xc18199) {
      const _0x4a8633 = await _0x326624.read();
      for (const _0x1b52ae of _0x4a8633) {
        const _0x82badf = _0x1b52ae.types.find(_0x2c01e0 => _0x2c01e0.startsWith("image/") || _0x2c01e0.startsWith("video/") || _0x2c01e0.startsWith("audio/"));
        if (!_0x1ffc67 && _0x82badf) {
          _0x1ffc67 = {
            mimeType: _0x82badf,
            blob: await _0x1b52ae.getType(_0x82badf)
          };
          continue;
        }
        if (!_0x550935 && _0x1b52ae.types.includes("text/plain")) {
          const _0x38baf2 = await _0x1b52ae.getType("text/plain");
          _0x550935 = await _0x38baf2.text();
        }
      }
    }
    if (!_0x550935 && _0x479ce5) {
      _0x550935 = await _0x326624.readText();
    }
  } catch (_0x314870) {
    console.warn("[paste] 剪贴板读取失败:", _0x314870);
    _0x342c38 = true;
  }
  return {
    pastedFiles: _0x4a783e,
    pastedMedia: _0x1ffc67,
    pastedText: _0x550935,
    clipboardReadFailed: _0x342c38
  };
}
export function createAppCanvasNodeFlows({
  graphStore: _0x215ccd,
  commit: _0x25f404,
  getCursorScreenPosition: _0x91ae46,
  getNodeDefaultSize: _0x4f75eb,
  getAIGenerationDefaultSizeByType: _0x12eb9c,
  getAIGenerationNodeSize: _0x45202a,
  createPanoramaNodeDataByType: _0x1ee94a,
  processFile: _0x28d4e7,
  executeCommand: _0x52a2ee,
  getCurrentProjectId: _0x592880,
  showToast: _0x707081,
  loadClipboardModule = () => import("../clipboard.js")
} = {}) {
  function _0x5ae1e2() {
    return _0x215ccd?.getStateRaw?.() ?? _0x215ccd?.getState?.() ?? {};
  }
  function _0x12a9ac(_0x539979 = {}) {
    if (_0x539979.placement === "viewport-center-sequence") {
      return _0x537f0f();
    }
    const {
      viewport: _0x46f18a
    } = _0x5ae1e2();
    const _0x1f7101 = getVisibleCanvasCenterScreenPosition(_0x46f18a);
    const _0xaabef4 = _0x91ae46?.() || {};
    const _0x45d6a0 = typeof _0xaabef4.x === "number" && Number.isFinite(_0xaabef4.x) ? _0xaabef4.x : _0x1f7101.x;
    const _0x4e374b = typeof _0xaabef4.y === "number" && Number.isFinite(_0xaabef4.y) ? _0xaabef4.y : _0x1f7101.y;
    const _0x21ae0e = typeof _0x539979.screenX === "number" && Number.isFinite(_0x539979.screenX) ? _0x539979.screenX : _0x45d6a0;
    const _0x1bfa95 = typeof _0x539979.screenY === "number" && Number.isFinite(_0x539979.screenY) ? _0x539979.screenY : _0x4e374b;
    return screenToWorld(_0x21ae0e, _0x1bfa95, _0x46f18a);
  }
  function _0x537f0f() {
    const {
      viewport: _0x24c413
    } = _0x5ae1e2();
    const {
      x: _0x31de33,
      y: _0x164b86
    } = getVisibleCanvasCenterScreenPosition(_0x24c413);
    return screenToWorld(_0x31de33, _0x164b86, _0x24c413);
  }
  function _0x842af1(_0x834f5e, _0x51af17, _0x33dd03, _0x450cae, _0x1db8e9 = {}) {
    const {
      x: _0x2d4fd7,
      y: _0x226f8f
    } = _0x12a9ac(_0x1db8e9);
    const _0x58ff90 = generateId(_0x834f5e);
    const _0x3bc27b = _0x834f5e === "ai-text" ? _0x12eb9c("ai-text") : _0x834f5e === "ai-image" || _0x834f5e === "ai-video" ? _0x45202a(_0x51af17, _0x33dd03) : {
      width: _0x51af17,
      height: _0x33dd03
    };
    const _0x37a283 = _0x3bc27b.width;
    const _0x20fc8f = _0x3bc27b.height;
    const _0x53c7eb = _0x1ee94a?.({
      type: _0x834f5e,
      id: _0x58ff90,
      x: _0x2d4fd7 - _0x37a283 / 2,
      y: _0x226f8f - _0x20fc8f / 2,
      width: _0x37a283,
      height: _0x20fc8f,
      name: _0x450cae
    }) || {
      id: _0x58ff90,
      type: _0x834f5e,
      x: _0x2d4fd7 - _0x37a283 / 2,
      y: _0x226f8f - _0x20fc8f / 2,
      width: _0x37a283,
      height: _0x20fc8f,
      name: _0x450cae
    };
    if (_0x834f5e === "comment-note") {
      _0x53c7eb.name = "";
      _0x53c7eb.content = "";
      _0x53c7eb.style = createDefaultCommentNoteStyle();
    }
    if (_0x1db8e9.placement === "viewport-center-sequence") {
      const {
        spacing: _0xad29c,
        direction: _0x31287f,
        avoidOverlap: _0x43fd23
      } = getNodeSpawnPrefs();
      const _0x2e3afe = normalizeSpawnDirection(_0x31287f);
      const _0x528cec = _0x2d4fd7 - _0x37a283 / 2;
      const _0x42544a = _0x226f8f - _0x20fc8f / 2;
      const _0x24ab1d = _0x5ae1e2().nodes || {};
      const _0x4c7f11 = String(_0x1db8e9.sequenceKey || "").trim();
      const _0xc9960b = _0x43fd23 ? _0x24ab1d : getSequenceNodes(_0x24ab1d, _0x4c7f11);
      const _0x1b0ea1 = findAvailablePosition(_0xc9960b, _0x528cec, _0x42544a, _0x37a283, _0x20fc8f, _0xad29c, _0x2e3afe);
      _0x53c7eb.x = _0x1b0ea1.x;
      _0x53c7eb.y = _0x1b0ea1.y;
      if (_0x4c7f11) {
        _0x53c7eb.spawnSequenceKey = _0x4c7f11;
      }
    }
    _0x215ccd.addNode(_0x53c7eb);
    _0x215ccd.setSelectedNodes([_0x58ff90]);
    if (_0x1db8e9.skipCommit !== true) {
      _0x25f404();
    }
    return _0x53c7eb;
  }
  async function _0x2459b7(_0xcd5b12, _0x4b1074, _0x501f12, _0x4a4179, _0x26edd1 = {}) {
    if (!_0xcd5b12 || !_0x4b1074) {
      return false;
    }
    const _0x2000ce = resolvePastedMediaDescriptor(String(_0x4b1074), _0x26edd1);
    if (!_0x2000ce) {
      return false;
    }
    const _0x5d443a = getMimeExtension(_0x4b1074, "dat");
    const _0x19add5 = "pasted-" + _0x2000ce.typeSlug + "-" + Date.now() + "." + _0x5d443a;
    const _0x3d4afc = new File([_0xcd5b12], _0x19add5, {
      type: _0x4b1074
    });
    const _0x3cf0be = _0x592880?.() || "default_v2_project";
    const _0xa7786e = await _0x28d4e7(_0x3d4afc, _0x501f12, _0x4a4179, _0x3cf0be);
    if (!_0xa7786e) {
      return false;
    }
    const _0x1ec22d = centerNodeAtWorldPosition(_0xa7786e, _0x501f12, _0x4a4179);
    if (_0x26edd1.placement === "viewport-center-sequence") {
      const {
        spacing: _0x5f408e,
        direction: _0x96c260,
        avoidOverlap: _0x42f384
      } = getNodeSpawnPrefs();
      const _0x4c696d = normalizeSpawnDirection(_0x96c260);
      const _0x536583 = Number(_0x1ec22d.width) || 300;
      const _0x47efdb = Number(_0x1ec22d.height) || 200;
      const _0x692c61 = _0x501f12 - _0x536583 / 2;
      const _0x2bb284 = _0x4a4179 - _0x47efdb / 2;
      const _0x33c1a1 = _0x5ae1e2().nodes || {};
      const _0x406d87 = String(_0x26edd1.sequenceKey || "").trim();
      const _0x32de0f = _0x42f384 ? _0x33c1a1 : getSequenceNodes(_0x33c1a1, _0x406d87);
      const _0x35cf2e = findAvailablePosition(_0x32de0f, _0x692c61, _0x2bb284, _0x536583, _0x47efdb, _0x5f408e, _0x4c696d);
      _0x1ec22d.x = _0x35cf2e.x;
      _0x1ec22d.y = _0x35cf2e.y;
      if (_0x406d87) {
        _0x1ec22d.spawnSequenceKey = _0x406d87;
      }
    }
    _0x1ec22d.name = _0x2000ce.nodeName;
    _0x215ccd.addNode(_0x1ec22d);
    _0x215ccd.setSelectedNodes([_0x1ec22d.id]);
    _0x25f404();
    return true;
  }
  async function _0x583390(_0x2ec4b2, _0x24f818, _0x4f7ad8 = {}) {
    const {
      x: _0x59699a,
      y: _0x3c31b5
    } = _0x12a9ac(_0x4f7ad8);
    return await _0x2459b7(_0x2ec4b2, _0x24f818, _0x59699a, _0x3c31b5, _0x4f7ad8);
  }
  function _0x5eb4b8(_0x2fb4be) {
    if (typeof File !== "function") {
      return null;
    }
    const _0x45c003 = String(_0x2fb4be?.path || "").trim();
    const _0x43330f = String(_0x2fb4be?.name || _0x45c003.split(/[\\/]/).pop() || "clipboard-file");
    const _0x44be5c = String(_0x2fb4be?.type || "").trim();
    if (!_0x45c003 || !_0x44be5c) {
      return null;
    }
    const _0x15953f = new File([], _0x43330f, {
      type: _0x44be5c
    });
    try {
      Object.defineProperty(_0x15953f, "path", {
        value: _0x45c003,
        configurable: true
      });
    } catch {
      _0x15953f.path = _0x45c003;
    }
    return _0x15953f;
  }
  async function _0x346bd9(_0x2609d8, _0x1f0452, _0x32c34e) {
    const _0x2141b2 = String(_0x2609d8?.type || "").trim();
    const _0x374a58 = resolvePastedMediaDescriptor(_0x2141b2);
    if (!_0x374a58) {
      return false;
    }
    const _0x4b00a2 = _0x5eb4b8(_0x2609d8);
    if (!_0x4b00a2) {
      return false;
    }
    const _0x3f6fb3 = _0x592880?.() || "default_v2_project";
    const _0x245d44 = await _0x28d4e7(_0x4b00a2, _0x1f0452, _0x32c34e, _0x3f6fb3);
    if (!_0x245d44) {
      return false;
    }
    const _0x3d01c3 = centerNodeAtWorldPosition(_0x245d44, _0x1f0452, _0x32c34e);
    _0x3d01c3.name = _0x374a58.nodeName;
    _0x215ccd.addNode(_0x3d01c3);
    _0x215ccd.setSelectedNodes([_0x3d01c3.id]);
    _0x25f404();
    return true;
  }
  async function _0x4e33d4(_0xa6179b, _0x46822b, _0x1421dd) {
    if (!Array.isArray(_0xa6179b) || _0xa6179b.length === 0) {
      return 0;
    }
    let _0x38321c = 0;
    for (const _0x36c850 of _0xa6179b) {
      const _0x39e937 = _0x38321c * 30;
      const _0x3ee7ce = await _0x346bd9(_0x36c850, _0x46822b + _0x39e937, _0x1421dd + _0x39e937);
      if (_0x3ee7ce) {
        _0x38321c += 1;
      }
    }
    return _0x38321c;
  }
  function _0x191ab4(_0x105665, _0x1aa4f3, _0x2e7333) {
    const {
      width: _0x1ad222,
      height: _0xb2277e
    } = _0x4f75eb("source-text");
    const _0x2e38a3 = generateId("source-text");
    _0x215ccd.addNode({
      id: _0x2e38a3,
      type: "source-text",
      x: _0x1aa4f3 - _0x1ad222 / 2,
      y: _0x2e7333 - _0xb2277e / 2,
      width: _0x1ad222,
      height: _0xb2277e,
      name: t("canvasNodeFlows.paste.nodeName.text"),
      content: String(_0x105665 || "")
    });
    _0x215ccd.setSelectedNodes([_0x2e38a3]);
    _0x25f404();
  }
  async function _0x508bec(_0x315952 = {}) {
    const {
      x: _0x2cf0e6,
      y: _0x1967c3
    } = _0x12a9ac(_0x315952);
    const {
      getClipboard: _0x545efd,
      getClipboardMeta: _0x5edffa,
      observeSystemClipboardSignature: _0xfc8994
    } = await loadClipboardModule();
    const _0x521b9f = _0x545efd();
    const _0x5c4653 = _0x5edffa();
    const {
      pastedFiles: _0x45ff73,
      pastedMedia: _0xb1eeca,
      pastedText: _0x21daf6,
      clipboardReadFailed: _0x1e3640
    } = await readSystemClipboardContents();
    const _0x240f18 = String(_0x21daf6 || "").trim();
    const _0x565674 = Array.isArray(_0x45ff73) && _0x45ff73.length > 0 || !!_0xb1eeca || !!_0x240f18;
    const _0x457cd7 = _0x565674 ? buildSystemClipboardSignature({
      pastedFiles: _0x45ff73,
      pastedMedia: _0xb1eeca,
      pastedText: _0x21daf6
    }) : "";
    const _0x187db6 = _0x521b9f && _0x521b9f.length > 0;
    const _0x2ba723 = Number(_0x5c4653?.copiedAt) || 0;
    const _0x593ae0 = Number(_0x5c4653?.systemCopiedAt) || 0;
    const _0x171747 = String(_0x5c4653?.systemSignatureAtCopy || "");
    const _0x468bc9 = String(_0x5c4653?.systemSignature || "");
    if (_0x457cd7) {
      _0xfc8994(_0x457cd7);
    }
    if (_0x187db6) {
      const _0x56bd9b = _0x593ae0 > _0x2ba723 && _0x2ba723 > 0;
      const _0x51bf85 = _0x2ba723 > _0x593ae0 && _0x593ae0 > 0;
      const _0x54fbcf = !!_0x171747 && !!_0x457cd7;
      const _0x209399 = _0x54fbcf ? _0x171747 === _0x457cd7 : false;
      const _0x3dca9b = _0x54fbcf ? _0x171747 !== _0x457cd7 : false;
      const _0x42bd58 = !_0x171747 && !!_0x468bc9 && _0x468bc9 === _0x457cd7;
      const _0x399954 = !_0x565674 || _0x209399 || _0x51bf85 && _0x42bd58;
      if (_0x399954 && !_0x56bd9b && !_0x3dca9b) {
        _0x52a2ee("paste", {
          x: _0x2cf0e6,
          y: _0x1967c3
        });
        return;
      }
    }
    if (Array.isArray(_0x45ff73) && _0x45ff73.length > 0) {
      const _0x589556 = await _0x4e33d4(_0x45ff73, _0x2cf0e6, _0x1967c3);
      if (_0x589556 > 0) {
        _0x707081?.(_0x589556 === 1 ? t("canvasNodeFlows.paste.filePasted") : t("canvasNodeFlows.paste.filesPasted", {
          count: _0x589556
        }), "success");
        return;
      }
    }
    if (_0xb1eeca) {
      const _0x461829 = await _0x2459b7(_0xb1eeca.blob, _0xb1eeca.mimeType, _0x2cf0e6, _0x1967c3);
      if (_0x461829) {
        const _0x461330 = _0xb1eeca.mimeType.startsWith("image/") ? t("canvasNodeFlows.media.image") : _0xb1eeca.mimeType.startsWith("video/") ? t("canvasNodeFlows.media.video") : t("canvasNodeFlows.media.audio");
        _0x707081?.(t("canvasNodeFlows.paste.mediaPasted", {
          label: _0x461330
        }), "success");
        return;
      }
    }
    if (_0x240f18) {
      _0x191ab4(_0x240f18, _0x2cf0e6, _0x1967c3);
      _0x707081?.(t("canvasNodeFlows.paste.textPasted"), "success");
      return;
    }
    if (_0x521b9f && _0x521b9f.length > 0) {
      _0x52a2ee("paste", {
        x: _0x2cf0e6,
        y: _0x1967c3
      });
      return;
    }
    if (_0x1e3640) {
      _0x707081?.(t("canvasNodeFlows.paste.clipboardReadFailed"), "error");
      return;
    }
    _0x707081?.(t("canvasNodeFlows.paste.clipboardEmpty"), "warning");
  }
  return {
    createNodeAtCursor: _0x842af1,
    createMediaNodeFromBlob: _0x583390,
    handlePasteFromClipboard: _0x508bec
  };
}