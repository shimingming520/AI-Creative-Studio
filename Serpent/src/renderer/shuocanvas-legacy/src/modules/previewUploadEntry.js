import a1164_0xfc2cb8 from "../core/stores/appStore.js";
import { t } from "../i18n/index.js";
import { uploadFile } from "./project.js";
import { readFileNaturalSize } from "../services/fileService.js";
import { applyUploadedPreviewAudioResult, applyUploadedPreviewImageResult, applyUploadedPreviewVideoResult } from "./previewUploadResult.js";
const PREVIEW_UPLOAD_TYPES = {
  image: {
    accept: "image/*",
    mimePrefix: "image/",
    labelKey: "previewUpload.types.image",
    successMessageKey: "previewUpload.success.image",
    applyResult: applyUploadedPreviewImageResult,
    nodeTypes: new Set(["source-image", "image", "ai-image"])
  },
  video: {
    accept: "video/*",
    mimePrefix: "video/",
    labelKey: "previewUpload.types.video",
    successMessageKey: "previewUpload.success.video",
    applyResult: applyUploadedPreviewVideoResult,
    nodeTypes: new Set(["source-video", "video", "ai-video"])
  },
  audio: {
    accept: "audio/*",
    mimePrefix: "audio/",
    labelKey: "previewUpload.types.audio",
    successMessageKey: "previewUpload.success.audio",
    applyResult: applyUploadedPreviewAudioResult,
    nodeTypes: new Set(["source-audio", "audio", "ai-audio"])
  }
};
const OPTIMISTIC_IMAGE_PREVIEW_SELECTOR = ".preview-upload-optimistic-media";
const DEFAULT_OPTIMISTIC_PREVIEW_FINALIZE_DELAY_MS = 350;
const DEFAULT_OPTIMISTIC_PREVIEW_COMMIT_TIMEOUT_MS = 30000;
function shouldReadPreviewUploadNaturalSize(_0x1fc85b = {}) {
  return _0x1fc85b.kind === "image";
}
function previewUploadText(_0x4b7c81, _0x2413d7 = {}) {
  return t("previewUpload." + _0x4b7c81, _0x2413d7);
}
function getPreviewUploadTypeLabel(_0x3792d0) {
  return t(_0x3792d0.labelKey);
}
function getPreviewUploadSuccessMessage(_0x3f7f86) {
  return t(_0x3f7f86.successMessageKey);
}
function getState(_0x434cee) {
  return _0x434cee?.getState?.() || {};
}
function getToast(_0x47827b) {
  if (typeof _0x47827b === "function") {
    return _0x47827b;
  } else {
    return globalThis.window?.showToast;
  }
}
function setButtonBusy(_0x50e3bc, _0x3f135e) {
  if (!_0x50e3bc) {
    return;
  }
  if (_0x3f135e) {
    if (!_0x50e3bc.dataset.previewUploadLabel) {
      _0x50e3bc.dataset.previewUploadLabel = _0x50e3bc.textContent || previewUploadText("upload");
    }
    _0x50e3bc.disabled = true;
    _0x50e3bc.textContent = previewUploadText("uploading");
    return;
  }
  _0x50e3bc.disabled = false;
  _0x50e3bc.textContent = _0x50e3bc.dataset.previewUploadLabel || previewUploadText("upload");
}
function setToolbarUploadButtonBusy(_0x96741b, _0x433d4b) {
  if (!_0x96741b) {
    return;
  }
  _0x96741b.disabled = _0x433d4b === true;
  _0x96741b.classList?.toggle?.("is-uploading", _0x433d4b === true);
  _0x96741b.classList?.toggle?.("is-task-running", _0x433d4b === true);
  if (_0x433d4b === true) {
    _0x96741b.setAttribute?.("aria-busy", "true");
  } else {
    _0x96741b.removeAttribute?.("aria-busy");
  }
}
function createToolbarUploadInput(_0x21dadd) {
  const _0x10f0f1 = _0x21dadd?.ownerDocument || globalThis.document || null;
  if (!_0x10f0f1?.createElement) {
    return null;
  }
  const _0x54180d = _0x10f0f1.createElement("input");
  _0x54180d.type = "file";
  _0x54180d.hidden = true;
  _0x54180d.className = "node-toolbar-upload-input";
  const _0x7169f8 = _0x21dadd?.closest?.(".node-floating-toolbar") || _0x21dadd?.parentNode || _0x10f0f1.body || null;
  _0x7169f8?.appendChild?.(_0x54180d);
  return _0x54180d;
}
function getUrlApi() {
  return globalThis.URL || globalThis.webkitURL || null;
}
function safelyCreateObjectUrl(_0x1037ac) {
  const _0x37907f = getUrlApi();
  if (!_0x1037ac || typeof _0x37907f?.createObjectURL !== "function") {
    return "";
  }
  try {
    return String(_0x37907f.createObjectURL(_0x1037ac) || "").trim();
  } catch {
    return "";
  }
}
function safelyRevokeObjectUrl(_0x17601f) {
  if (!_0x17601f || !String(_0x17601f).startsWith("blob:")) {
    return;
  }
  const _0x12c97e = getUrlApi();
  try {
    _0x12c97e?.revokeObjectURL?.(_0x17601f);
  } catch {}
}
function getMountedPreviewElement(_0x4a50c5) {
  const _0x31f326 = String(_0x4a50c5 || "").trim();
  if (!_0x31f326) {
    return null;
  }
  const _0xb09a02 = globalThis.window?.v2Renderer;
  try {
    _0xb09a02?.hydrateDeferredNodeForImmediateMedia?.(_0x31f326);
  } catch {}
  try {
    const _0x56ac24 = _0xb09a02?.queryMountedNodeElement?.(_0x31f326, ".img-node-preview");
    if (_0x56ac24) {
      return _0x56ac24;
    }
  } catch {}
  const _0x1f55a4 = globalThis.document;
  const _0x48b8f5 = typeof _0xb09a02?.getMountedWrapper === "function" ? _0xb09a02.getMountedWrapper(_0x31f326) : null;
  if (_0x48b8f5?.querySelector) {
    return _0x48b8f5.querySelector(".img-node-preview");
  }
  const _0x1c9abd = typeof _0x1f55a4?.getElementById === "function" ? _0x1f55a4.getElementById(_0x31f326) : null;
  return _0x1c9abd?.querySelector?.(".img-node-preview") || null;
}
function clearExistingOptimisticImagePreview(_0xf93b9f) {
  if (!_0xf93b9f) {
    return;
  }
  if (typeof _0xf93b9f._previewUploadOptimisticCleanup === "function") {
    _0xf93b9f._previewUploadOptimisticCleanup({
      delayMs: 0,
      force: true
    });
    return;
  }
  _0xf93b9f.querySelectorAll?.(OPTIMISTIC_IMAGE_PREVIEW_SELECTOR)?.forEach(_0x4b4691 => _0x4b4691.remove?.());
}
function hasClassName(_0x1830a3, _0x552e47) {
  return _0x1830a3?.classList?.contains?.(_0x552e47) || String(_0x1830a3?.className || "").split(/\s+/).includes(_0x552e47);
}
function getPreviewImageElements(_0x4936b5) {
  const _0x2b0005 = Array.from(_0x4936b5?.querySelectorAll?.("img") || []);
  return _0x2b0005.filter(_0x157362 => !hasClassName(_0x157362, "preview-upload-optimistic-media"));
}
function getImageElementSrc(_0x11368e) {
  return String(_0x11368e?.currentSrc || _0x11368e?.src || _0x11368e?.getAttribute?.("src") || "").trim();
}
function getImageElementAttributeSrc(_0x49c30c) {
  return String(_0x49c30c?.src || _0x49c30c?.getAttribute?.("src") || "").trim();
}
function normalizeUrlPathForCompare(_0x3eeaf5 = "") {
  const _0x25ddcf = String(_0x3eeaf5 || "").trim();
  if (!_0x25ddcf) {
    return "";
  }
  try {
    return new URL(_0x25ddcf, "http://aic.local").pathname.replace(/\/+/g, "/");
  } catch {
    return _0x25ddcf.split("?")[0].split("#")[0].replace(/\\/g, "/");
  }
}
function imageSrcMatchesExpected(_0x498279 = "", _0x24b985 = []) {
  const _0x556db3 = normalizeUrlPathForCompare(_0x498279);
  if (!_0x556db3) {
    return false;
  }
  const _0x559bab = _0x24b985.map(_0x2f6e1a => normalizeUrlPathForCompare(_0x2f6e1a)).filter(Boolean);
  if (_0x559bab.length === 0) {
    return true;
  }
  return _0x559bab.some(_0x7f7937 => _0x556db3 === _0x7f7937 || _0x556db3.endsWith(_0x7f7937));
}
function toUploadedPreviewLocalUrl(_0x37ac78 = "") {
  const _0x513508 = String(_0x37ac78 || "").trim().replace(/\\/g, "/");
  if (!_0x513508) {
    return "";
  }
  if (/^(?:https?:|blob:|data:|aic-local-preview:)/i.test(_0x513508)) {
    return _0x513508;
  }
  if (_0x513508.startsWith("/")) {
    return _0x513508;
  } else {
    return "/" + _0x513508;
  }
}
function resolveUploadedPreviewImageExpectedUrls(_0x3ce6c0 = {}) {
  return Array.from(new Set([_0x3ce6c0?.displayUrl, _0x3ce6c0?.originalUrl, _0x3ce6c0?.url, toUploadedPreviewLocalUrl(_0x3ce6c0?.displayLocalPath), toUploadedPreviewLocalUrl(_0x3ce6c0?.originalLocalPath), toUploadedPreviewLocalUrl(_0x3ce6c0?.localPath)].map(_0x3a85fc => String(_0x3a85fc || "").trim()).filter(Boolean)));
}
function getMountedPreviewImageSrc(_0x1af01c) {
  const _0x2486be = getPreviewImageElements(_0x1af01c);
  for (const _0x57c784 of _0x2486be) {
    const _0x1a84f4 = getImageElementSrc(_0x57c784);
    if (_0x1a84f4) {
      return _0x1a84f4;
    }
  }
  return "";
}
function waitForUploadedPreviewImageCommit({
  nodeId: _0x25b114,
  previousSrc = "",
  expectedUrls = [],
  timeoutMs = DEFAULT_OPTIMISTIC_PREVIEW_COMMIT_TIMEOUT_MS,
  onPoll = null
} = {}) {
  const _0x5caf9 = String(_0x25b114 || "").trim();
  if (!_0x5caf9) {
    return Promise.resolve(false);
  }
  return new Promise(_0x49c320 => {
    let _0x7167d4 = false;
    let _0x502613 = null;
    let _0x5e6813 = null;
    const _0x5e23b2 = new Set();
    const _0x1d8700 = [];
    const _0x3e01b9 = _0x5f56b4 => {
      if (_0x7167d4) {
        return;
      }
      _0x7167d4 = true;
      if (_0x502613 !== null) {
        clearTimeout(_0x502613);
      }
      if (_0x5e6813 !== null) {
        clearTimeout(_0x5e6813);
      }
      for (const _0x2347df of _0x1d8700.splice(0)) {
        _0x2347df();
      }
      _0x49c320(_0x5f56b4);
    };
    const _0x45e484 = _0x21ec04 => {
      if (!_0x21ec04?.addEventListener || _0x5e23b2.has(_0x21ec04)) {
        return;
      }
      _0x5e23b2.add(_0x21ec04);
      const _0x1821ce = () => {
        const _0xfd5462 = String(_0x21ec04.currentSrc || "").trim() || getImageElementSrc(_0x21ec04);
        if (_0xfd5462 !== previousSrc && imageSrcMatchesExpected(_0xfd5462, expectedUrls)) {
          _0x3e01b9(true);
        }
      };
      const _0x51439e = () => {
        const _0x12d484 = getImageElementAttributeSrc(_0x21ec04) || getImageElementSrc(_0x21ec04);
        if (_0x12d484 !== previousSrc && imageSrcMatchesExpected(_0x12d484, expectedUrls)) {
          _0x3e01b9(true);
        }
      };
      _0x21ec04.addEventListener("load", _0x1821ce, {
        once: true
      });
      _0x21ec04.addEventListener("error", _0x51439e, {
        once: true
      });
      _0x1d8700.push(() => {
        _0x21ec04.removeEventListener?.("load", _0x1821ce);
        _0x21ec04.removeEventListener?.("error", _0x51439e);
      });
    };
    const _0x443da6 = () => {
      if (typeof onPoll === "function") {
        onPoll();
      }
      const _0x439c3b = getMountedPreviewElement(_0x5caf9);
      const _0x43c46c = getPreviewImageElements(_0x439c3b);
      for (const _0x231e4d of _0x43c46c) {
        const _0x5d9451 = getImageElementAttributeSrc(_0x231e4d) || getImageElementSrc(_0x231e4d);
        if (!_0x5d9451 || _0x5d9451 === previousSrc) {
          continue;
        }
        if (!imageSrcMatchesExpected(_0x5d9451, expectedUrls)) {
          continue;
        }
        _0x45e484(_0x231e4d);
        return false;
      }
      return false;
    };
    const _0x2fa2a4 = () => {
      if (_0x7167d4 || _0x443da6()) {
        return;
      }
      _0x502613 = setTimeout(_0x2fa2a4, 80);
    };
    _0x5e6813 = setTimeout(() => _0x3e01b9(false), Math.max(0, Number(timeoutMs) || 0));
    _0x2fa2a4();
  });
}
function applyOptimisticImageUploadPreview({
  nodeId: _0x249239,
  file: _0x1904ac
} = {}) {
  if (!String(_0x1904ac?.type || "").startsWith("image/")) {
    return null;
  }
  const _0x19b867 = getMountedPreviewElement(_0x249239);
  const _0x35a202 = _0x19b867?.ownerDocument || globalThis.document;
  if (!_0x19b867?.appendChild || !_0x35a202?.createElement) {
    return null;
  }
  const _0x40895a = safelyCreateObjectUrl(_0x1904ac);
  if (!_0x40895a) {
    return null;
  }
  clearExistingOptimisticImagePreview(_0x19b867);
  const _0x3cf990 = getMountedPreviewImageSrc(_0x19b867);
  const _0x9144c9 = _0x35a202.createElement("img");
  _0x9144c9.className = "preview-upload-optimistic-media";
  _0x9144c9.draggable = false;
  _0x9144c9.alt = "";
  _0x9144c9.dataset.previewUploadOptimistic = "true";
  _0x9144c9.src = _0x40895a;
  let _0x53b181 = false;
  let _0x411376 = null;
  let _0x2a1d60 = null;
  const _0x4becae = (_0x2a1c3f = getMountedPreviewElement(_0x249239)) => {
    if (_0x53b181 || !_0x2a1c3f?.appendChild) {
      return false;
    }
    if (_0x2a1d60 && _0x2a1d60 !== _0x2a1c3f && _0x2a1d60._previewUploadOptimisticCleanup === _0x13edeb) {
      delete _0x2a1d60._previewUploadOptimisticCleanup;
    }
    if (_0x9144c9.parentNode !== _0x2a1c3f) {
      _0x2a1c3f.appendChild(_0x9144c9);
    }
    _0x2a1c3f._previewUploadOptimisticCleanup = _0x13edeb;
    _0x2a1d60 = _0x2a1c3f;
    return true;
  };
  const _0x4c8ab9 = () => {
    if (_0x53b181) {
      return;
    }
    _0x53b181 = true;
    _0x411376 = null;
    _0x9144c9.remove?.();
    safelyRevokeObjectUrl(_0x40895a);
    if (_0x2a1d60?._previewUploadOptimisticCleanup === _0x13edeb) {
      delete _0x2a1d60._previewUploadOptimisticCleanup;
    }
  };
  function _0x13edeb({
    delayMs = 0,
    force = false
  } = {}) {
    if (_0x53b181) {
      return;
    }
    if (_0x411376 !== null) {
      clearTimeout(_0x411376);
      _0x411376 = null;
    }
    const _0xb0c863 = () => {
      _0x4c8ab9();
    };
    const _0x170308 = Math.max(0, Number(delayMs) || 0);
    if (!force && _0x170308 > 0 && typeof setTimeout === "function") {
      _0x411376 = setTimeout(_0xb0c863, _0x170308);
    } else {
      _0xb0c863();
    }
  }
  _0x4becae(_0x19b867);
  return {
    cleanup: _0x13edeb,
    ensureMounted: _0x4becae,
    objectUrl: _0x40895a,
    previousMediaSrc: _0x3cf990
  };
}
function flushUploadedPreviewNode(_0x5b572e) {
  const _0x56b3eb = String(_0x5b572e || "").trim();
  if (!_0x56b3eb) {
    return false;
  }
  try {
    return globalThis.window?.v2Renderer?.flushNode?.(_0x56b3eb) === true;
  } catch {
    return false;
  }
}
export function resolvePreviewUploadTarget(_0x5404cd = {}) {
  const _0x1e63d4 = Array.isArray(_0x5404cd.selectedNodeIds) ? _0x5404cd.selectedNodeIds.filter(Boolean) : [];
  if (_0x1e63d4.length !== 1) {
    return {
      ok: false,
      message: previewUploadText("selectSingleNode")
    };
  }
  const _0x463b16 = _0x1e63d4[0];
  const _0x15dc74 = _0x5404cd.nodes?.[_0x463b16];
  if (!_0x15dc74) {
    return {
      ok: false,
      message: previewUploadText("selectedNodeMissing")
    };
  }
  const _0x244837 = String(_0x15dc74.type || "").trim();
  for (const [_0x5d0fbc, _0x54d7b4] of Object.entries(PREVIEW_UPLOAD_TYPES)) {
    if (!_0x54d7b4.nodeTypes.has(_0x244837)) {
      continue;
    }
    return {
      ok: true,
      kind: _0x5d0fbc,
      nodeId: _0x463b16,
      node: _0x15dc74,
      accept: _0x54d7b4.accept,
      mimePrefix: _0x54d7b4.mimePrefix,
      label: getPreviewUploadTypeLabel(_0x54d7b4),
      successMessage: getPreviewUploadSuccessMessage(_0x54d7b4),
      applyResult: _0x54d7b4.applyResult
    };
  }
  return {
    ok: false,
    message: previewUploadText("unsupportedNode")
  };
}
export async function handlePreviewUploadFile({
  file: _0x2f7d16,
  button = null,
  storeApi = a1164_0xfc2cb8,
  uploadFileImpl = uploadFile,
  showToast = null,
  getProjectId = () => globalThis.window?.currentProjectId || "default_v2_project",
  applyResults = {},
  optimisticPreviewFinalizeDelayMs = DEFAULT_OPTIMISTIC_PREVIEW_FINALIZE_DELAY_MS
} = {}) {
  const _0x5e2edf = getToast(showToast);
  const _0x44dd0b = resolvePreviewUploadTarget(getState(storeApi));
  if (!_0x44dd0b.ok) {
    _0x5e2edf?.(_0x44dd0b.message, "warn");
    return false;
  }
  if (!_0x2f7d16) {
    return false;
  }
  if (!String(_0x2f7d16.type || "").startsWith(_0x44dd0b.mimePrefix)) {
    _0x5e2edf?.(previewUploadText("invalidFileType", {
      label: _0x44dd0b.label
    }), "error");
    return false;
  }
  setButtonBusy(button, true);
  const _0x112621 = _0x44dd0b.kind === "image" ? applyOptimisticImageUploadPreview({
    nodeId: _0x44dd0b.nodeId,
    file: _0x2f7d16
  }) : null;
  const _0x11405a = shouldReadPreviewUploadNaturalSize(_0x44dd0b) ? readFileNaturalSize(_0x2f7d16, "source-image").catch(() => null) : Promise.resolve(null);
  try {
    const _0x2ca66e = await uploadFileImpl(_0x2f7d16, getProjectId());
    const _0x115811 = await _0x11405a;
    const _0x2e1557 = applyResults[_0x44dd0b.kind] || _0x44dd0b.applyResult;
    _0x2e1557({
      nodeId: _0x44dd0b.nodeId,
      uploadRes: _0x2ca66e,
      fileName: _0x2f7d16.name,
      mediaNaturalSize: _0x115811
    });
    flushUploadedPreviewNode(_0x44dd0b.nodeId);
    if (_0x112621) {
      _0x112621.ensureMounted?.();
      waitForUploadedPreviewImageCommit({
        nodeId: _0x44dd0b.nodeId,
        previousSrc: _0x112621.previousMediaSrc,
        expectedUrls: resolveUploadedPreviewImageExpectedUrls(_0x2ca66e),
        onPoll: () => _0x112621.ensureMounted?.()
      }).catch(() => false).then(() => {
        _0x112621.cleanup({
          delayMs: optimisticPreviewFinalizeDelayMs
        });
      });
    }
    _0x5e2edf?.(_0x44dd0b.successMessage, "success");
    return true;
  } catch (_0x2e287f) {
    _0x112621?.cleanup({
      delayMs: 0
    });
    _0x5e2edf?.(_0x2e287f?.message || previewUploadText("uploadFailed"), "error");
    return false;
  } finally {
    setButtonBusy(button, false);
  }
}
export function bindPreviewUploadEntry({
  button: _0x48a3de,
  input: _0x59c371,
  storeApi = a1164_0xfc2cb8,
  uploadFileImpl = uploadFile,
  showToast = null,
  getProjectId: _0x4b2202,
  applyResults: _0xaeed81
} = {}) {
  if (!_0x48a3de || !_0x59c371) {
    return null;
  }
  const _0x272910 = getToast(showToast);
  const _0x5bd6d8 = () => {
    const _0x211d31 = resolvePreviewUploadTarget(getState(storeApi));
    if (!_0x211d31.ok) {
      _0x272910?.(_0x211d31.message, "warn");
      return;
    }
    _0x59c371.accept = _0x211d31.accept;
    _0x59c371.value = "";
    _0x59c371.click?.();
  };
  const _0x16f7ad = async () => {
    const _0x44cdab = _0x59c371.files?.[0];
    if (!_0x44cdab) {
      return;
    }
    try {
      await handlePreviewUploadFile({
        file: _0x44cdab,
        button: _0x48a3de,
        storeApi: storeApi,
        uploadFileImpl: uploadFileImpl,
        showToast: showToast,
        getProjectId: _0x4b2202,
        applyResults: _0xaeed81
      });
    } finally {
      _0x59c371.value = "";
    }
  };
  _0x48a3de.addEventListener("click", _0x5bd6d8);
  _0x59c371.addEventListener("change", _0x16f7ad);
  return () => {
    _0x48a3de.removeEventListener?.("click", _0x5bd6d8);
    _0x59c371.removeEventListener?.("change", _0x16f7ad);
  };
}
export function bindPreviewUploadToolbarAction({
  button: _0x16e09c,
  input = null,
  storeApi = a1164_0xfc2cb8,
  uploadFileImpl = uploadFile,
  showToast = null,
  getProjectId: _0x2feb44,
  applyResults: _0x81072a
} = {}) {
  if (!_0x16e09c) {
    return () => {};
  }
  const _0xf1e114 = input || createToolbarUploadInput(_0x16e09c);
  if (!_0xf1e114) {
    return () => {};
  }
  const _0x395fe2 = getToast(showToast);
  const _0x1a6fc8 = _0x2f3a8e => {
    _0x2f3a8e?.preventDefault?.();
    _0x2f3a8e?.stopPropagation?.();
    const _0x25bcae = resolvePreviewUploadTarget(getState(storeApi));
    if (!_0x25bcae.ok) {
      _0x395fe2?.(_0x25bcae.message, "warn");
      return;
    }
    _0xf1e114.accept = _0x25bcae.accept;
    _0xf1e114.value = "";
    _0xf1e114.click?.();
  };
  const _0x376dc9 = async () => {
    const _0x4c19a9 = _0xf1e114.files?.[0];
    if (!_0x4c19a9) {
      return;
    }
    setToolbarUploadButtonBusy(_0x16e09c, true);
    try {
      await handlePreviewUploadFile({
        file: _0x4c19a9,
        button: null,
        storeApi: storeApi,
        uploadFileImpl: uploadFileImpl,
        showToast: showToast,
        getProjectId: _0x2feb44,
        applyResults: _0x81072a
      });
    } finally {
      setToolbarUploadButtonBusy(_0x16e09c, false);
      _0xf1e114.value = "";
    }
  };
  _0x16e09c.addEventListener("click", _0x1a6fc8);
  _0xf1e114.addEventListener("change", _0x376dc9);
  return () => {
    _0x16e09c.removeEventListener?.("click", _0x1a6fc8);
    _0xf1e114.removeEventListener?.("change", _0x376dc9);
  };
}