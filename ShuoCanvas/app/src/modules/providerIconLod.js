import { MEDIA_LOD_HOVER_PROMOTED_CLASS, isCanvasLowZoomActive, isNodePromotedForFullImage } from "./canvasImageLod.js";
const PROVIDER_ICON_RE = /^images\/(?:RH|jimeng|grsai|ppio)\.png(?:[?#].*)?$/i;
const PROVIDER_ICON_PRELOAD_URLS = Object.freeze(["images/RH.png", "images/jimeng.png", "images/grsai.png", "images/ppio.png"]);
const PROVIDER_ICON_SELECTOR = ["#v2-canvas .v2-node .img-model-pills img", "#v2-canvas .v2-node .img-model-menu img", "#v2-canvas .v2-node .image-function-model-trigger-icon-slot img"].join(",");
const PROVIDER_ICON_CONTAINER_SELECTOR = ".img-model-pills, .img-model-menu, .image-function-model-trigger-icon-slot";
const PROVIDER_SRC_ATTR = "lowZoomProviderSrc";
const PROVIDER_SRCSET_ATTR = "lowZoomProviderSrcset";
const PLACEHOLDER_CLASS = "provider-logo-lod-placeholder";
const providerIconPreloadImages = new Map();
const NODE_PROMOTION_CLASSES = new Set(["selected", "v2-selected", "selection-related", "conn-src", "conn-hoverTarget", MEDIA_LOD_HOVER_PROMOTED_CLASS]);
function getDocumentRef(_0x402656) {
  return _0x402656?.ownerDocument || globalThis.document;
}
function scheduleFrame(_0x15cf4a) {
  const _0x3c11b4 = globalThis.requestAnimationFrame;
  if (typeof _0x3c11b4 === "function") {
    return _0x3c11b4(_0x15cf4a);
  }
  return setTimeout(_0x15cf4a, 16);
}
function cancelFrame(_0x46905a) {
  const _0x38ccb5 = globalThis.cancelAnimationFrame;
  if (typeof _0x38ccb5 === "function") {
    _0x38ccb5(_0x46905a);
    return;
  }
  clearTimeout(_0x46905a);
}
function normalizeIconSrc(_0x3d873e) {
  return String(_0x3d873e || "").trim().replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "");
}
function readProviderIconSrc(_0x1b6e50) {
  return _0x1b6e50?.getAttribute?.("src") || _0x1b6e50?.dataset?.[PROVIDER_SRC_ATTR] || "";
}
function isProviderIconImage(_0x173209) {
  return isProviderLogoSrc(readProviderIconSrc(_0x173209));
}
function isElementNode(_0x1dd5fe) {
  return !!_0x1dd5fe && _0x1dd5fe.nodeType === 1;
}
function getElementFromNode(_0x23a53f) {
  if (isElementNode(_0x23a53f)) {
    return _0x23a53f;
  }
  const _0x303c8f = _0x23a53f?.parentElement || _0x23a53f?.parentNode;
  if (isElementNode(_0x303c8f)) {
    return _0x303c8f;
  } else {
    return null;
  }
}
function elementMatches(_0x5b427c, _0x59a038) {
  if (!isElementNode(_0x5b427c) || typeof _0x5b427c.matches !== "function") {
    return false;
  }
  try {
    return _0x5b427c.matches(_0x59a038);
  } catch {
    return false;
  }
}
function elementContainsMatch(_0x53f55a, _0x3dd80d) {
  if (!isElementNode(_0x53f55a) || typeof _0x53f55a.querySelector !== "function") {
    return false;
  }
  try {
    return !!_0x53f55a.querySelector(_0x3dd80d);
  } catch {
    return false;
  }
}
function isProviderIconElement(_0x11989b) {
  if (!isElementNode(_0x11989b)) {
    return false;
  }
  if (elementMatches(_0x11989b, PROVIDER_ICON_SELECTOR)) {
    return true;
  }
  if (String(_0x11989b.tagName || "").toLowerCase() !== "img") {
    return false;
  }
  return isProviderIconImage(_0x11989b);
}
function nodeContainsProviderIcon(_0x3c347c) {
  if (!isElementNode(_0x3c347c)) {
    return false;
  }
  return isProviderIconElement(_0x3c347c) || elementContainsMatch(_0x3c347c, PROVIDER_ICON_SELECTOR) || elementMatches(_0x3c347c, PROVIDER_ICON_CONTAINER_SELECTOR) || elementContainsMatch(_0x3c347c, PROVIDER_ICON_CONTAINER_SELECTOR);
}
function didPromotionClassChange(_0x48b781, _0x1d295c = "") {
  const _0x3269ce = new Set(String(_0x48b781 || "").split(/\s+/).filter(Boolean));
  const _0x19d4c1 = new Set(String(_0x1d295c || "").split(/\s+/).filter(Boolean));
  for (const _0x2f4d69 of NODE_PROMOTION_CLASSES) {
    if (_0x3269ce.has(_0x2f4d69) !== _0x19d4c1.has(_0x2f4d69)) {
      return true;
    }
  }
  return false;
}
function shouldSyncForProviderIconMutation(_0x471282) {
  const _0x3a3a6d = _0x471282?.target;
  if (!_0x3a3a6d) {
    return false;
  }
  if (_0x471282.type === "childList") {
    const _0x2e78be = [...Array.from(_0x471282.addedNodes || []), ...Array.from(_0x471282.removedNodes || [])];
    return _0x2e78be.some(_0x910ebe => nodeContainsProviderIcon(_0x910ebe));
  }
  if (_0x471282.type !== "attributes") {
    return false;
  }
  if (isProviderIconElement(_0x3a3a6d)) {
    return true;
  }
  if (_0x471282.attributeName !== "class") {
    return false;
  }
  if (elementMatches(_0x3a3a6d, ".v2-node")) {
    return didPromotionClassChange(_0x471282.oldValue, _0x3a3a6d.getAttribute?.("class") || "");
  }
  return nodeContainsProviderIcon(_0x3a3a6d);
}
function getClosestCanvasNode(_0x5f1d37) {
  const _0x37cf9a = getElementFromNode(_0x5f1d37);
  if (!_0x37cf9a) {
    return null;
  }
  if (elementMatches(_0x37cf9a, ".v2-node")) {
    return _0x37cf9a;
  }
  if (typeof _0x37cf9a.closest !== "function") {
    return null;
  }
  try {
    return _0x37cf9a.closest(".v2-node");
  } catch {
    return null;
  }
}
function shouldSyncForProviderPointerEvent(_0x11d7d8) {
  const _0x55ab8e = getClosestCanvasNode(_0x11d7d8?.target);
  const _0x10595b = getClosestCanvasNode(_0x11d7d8?.relatedTarget);
  return (!!_0x55ab8e || !!_0x10595b) && _0x55ab8e !== _0x10595b;
}
function findProviderIconImages(_0x2cbe22) {
  if (!_0x2cbe22 || typeof _0x2cbe22.querySelectorAll !== "function") {
    return [];
  }
  return Array.from(_0x2cbe22.querySelectorAll(PROVIDER_ICON_SELECTOR));
}
function shouldDehydrateProviderIcon(_0x576ef5, {
  store: _0x5d4bba,
  documentRef: _0x2ad8de
} = {}) {
  if (!isProviderIconImage(_0x576ef5)) {
    return false;
  }
  const _0x1e1e70 = _0x576ef5.closest?.(".v2-node");
  if (!_0x1e1e70) {
    return false;
  }
  if (!isCanvasLowZoomActive(_0x2ad8de)) {
    return false;
  }
  return !isNodePromotedForFullImage({
    nodeId: _0x1e1e70.id,
    rootEl: _0x1e1e70,
    store: _0x5d4bba,
    documentRef: _0x2ad8de
  });
}
export function isProviderLogoSrc(_0x393365) {
  return PROVIDER_ICON_RE.test(normalizeIconSrc(_0x393365));
}
export function preloadProviderIconAssets({
  imageFactory = null
} = {}) {
  const _0x51128a = typeof imageFactory === "function" ? imageFactory : () => {
    const _0x34d3e9 = globalThis.Image;
    if (typeof _0x34d3e9 === "function") {
      return new _0x34d3e9();
    } else {
      return null;
    }
  };
  let _0x43c0e8 = 0;
  for (const _0x13d18c of PROVIDER_ICON_PRELOAD_URLS) {
    const _0x10ded2 = normalizeIconSrc(_0x13d18c);
    if (!_0x10ded2 || providerIconPreloadImages.has(_0x10ded2)) {
      continue;
    }
    const _0x18e9f3 = _0x51128a(_0x13d18c);
    if (!_0x18e9f3) {
      continue;
    }
    try {
      _0x18e9f3.decoding = "async";
      _0x18e9f3.loading = "eager";
      _0x18e9f3.fetchPriority = "high";
      _0x18e9f3.src = _0x13d18c;
      _0x18e9f3.decode?.()?.catch?.(() => {});
    } catch {
      continue;
    }
    providerIconPreloadImages.set(_0x10ded2, _0x18e9f3);
    _0x43c0e8 += 1;
  }
  return _0x43c0e8;
}
export function resetProviderIconPreloadForTests() {
  providerIconPreloadImages.clear();
}
export function dehydrateProviderIcon(_0x429f71) {
  if (!_0x429f71 || !isProviderIconImage(_0x429f71)) {
    return false;
  }
  const _0x4d2dae = String(_0x429f71.getAttribute?.("src") || "").trim();
  const _0x26e1ff = String(_0x429f71.dataset?.[PROVIDER_SRC_ATTR] || "").trim();
  const _0x18c4bb = _0x4d2dae || _0x26e1ff;
  if (_0x18c4bb && !_0x4d2dae) {
    _0x429f71.setAttribute?.("src", _0x18c4bb);
  }
  const _0x3e1960 = String(_0x429f71.getAttribute?.("srcset") || "").trim();
  const _0x3e94d2 = String(_0x429f71.dataset?.[PROVIDER_SRCSET_ATTR] || "").trim();
  const _0x2f10ae = _0x3e1960 || _0x3e94d2;
  if (_0x2f10ae && !_0x3e1960) {
    _0x429f71.setAttribute?.("srcset", _0x2f10ae);
  }
  if (_0x429f71.dataset) {
    delete _0x429f71.dataset[PROVIDER_SRC_ATTR];
    delete _0x429f71.dataset[PROVIDER_SRCSET_ATTR];
  }
  _0x429f71.classList?.remove(PLACEHOLDER_CLASS);
  return true;
}
export function hydrateProviderIcon(_0x3e54cf) {
  if (!_0x3e54cf) {
    return false;
  }
  const _0x29be4e = String(_0x3e54cf.dataset?.[PROVIDER_SRC_ATTR] || "").trim();
  const _0x469ebc = String(_0x3e54cf.dataset?.[PROVIDER_SRCSET_ATTR] || "").trim();
  if (_0x29be4e && !String(_0x3e54cf.getAttribute?.("src") || "").trim()) {
    _0x3e54cf.setAttribute("src", _0x29be4e);
  }
  if (_0x469ebc && !String(_0x3e54cf.getAttribute?.("srcset") || "").trim()) {
    _0x3e54cf.setAttribute("srcset", _0x469ebc);
  }
  if (_0x3e54cf.dataset) {
    delete _0x3e54cf.dataset[PROVIDER_SRC_ATTR];
    delete _0x3e54cf.dataset[PROVIDER_SRCSET_ATTR];
  }
  _0x3e54cf.classList?.remove(PLACEHOLDER_CLASS);
  return !!_0x29be4e || !!_0x469ebc;
}
export function syncLowZoomProviderIcons({
  rootEl = globalThis.document,
  store = null
} = {}) {
  const _0x3ebaab = getDocumentRef(rootEl);
  const _0x56f5f8 = rootEl?.querySelectorAll ? rootEl : _0x3ebaab;
  const _0x5b3f9a = findProviderIconImages(_0x56f5f8);
  for (const _0xcd0bb1 of _0x5b3f9a) {
    if (shouldDehydrateProviderIcon(_0xcd0bb1, {
      store: store,
      documentRef: _0x3ebaab
    })) {
      dehydrateProviderIcon(_0xcd0bb1);
    } else {
      hydrateProviderIcon(_0xcd0bb1);
    }
  }
}
export function installProviderIconLodController({
  rootEl = null,
  store = null
} = {}) {
  const _0x1eee8a = getDocumentRef(rootEl);
  const _0x11238e = rootEl || _0x1eee8a?.getElementById?.("v2-canvas") || _0x1eee8a;
  let _0x133c68 = null;
  preloadProviderIconAssets();
  const _0x5d55ed = () => {
    if (_0x133c68 !== null) {
      return;
    }
    _0x133c68 = scheduleFrame(() => {
      _0x133c68 = null;
      syncLowZoomProviderIcons({
        rootEl: _0x11238e,
        store: store
      });
    });
  };
  const _0x18fd72 = (_0x1ed1ff = []) => {
    const _0x40c222 = Array.isArray(_0x1ed1ff) ? _0x1ed1ff : Array.from(_0x1ed1ff || []);
    if (_0x40c222.some(_0xcd461d => shouldSyncForProviderIconMutation(_0xcd461d))) {
      _0x5d55ed();
    }
  };
  const _0xa859fd = _0xca84c2 => {
    if (shouldSyncForProviderPointerEvent(_0xca84c2)) {
      _0x5d55ed();
    }
  };
  const _0x34d582 = typeof MutationObserver === "function" && _0x11238e ? new MutationObserver(_0x18fd72) : null;
  _0x34d582?.observe(_0x11238e, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "src", "srcset"],
    attributeOldValue: true
  });
  _0x11238e?.addEventListener?.("pointerover", _0xa859fd, true);
  _0x11238e?.addEventListener?.("pointerout", _0xa859fd, true);
  const _0x48b931 = store?.subscribeSelector?.(_0x7d476 => (_0x7d476.selectedNodeIds || []).join("|"), _0x5d55ed);
  _0x5d55ed();
  return {
    sync: () => syncLowZoomProviderIcons({
      rootEl: _0x11238e,
      store: store
    }),
    scheduleSync: _0x5d55ed,
    disconnect() {
      if (_0x133c68 !== null) {
        cancelFrame(_0x133c68);
        _0x133c68 = null;
      }
      _0x34d582?.disconnect();
      _0x11238e?.removeEventListener?.("pointerover", _0xa859fd, true);
      _0x11238e?.removeEventListener?.("pointerout", _0xa859fd, true);
      _0x48b931?.();
    }
  };
}