import { isSameStringOrder } from "../utils/arrayOrder.js";
import { resolveGroupOutputSourceOrder } from "./groupDynamicOutput.js";
const THUMB_CONTAINER_SELECTOR = ".ref-thumb-container";
const THUMB_ITEM_SELECTOR = ".ref-thumb-wrap";
const orderDragStateByContainer = new WeakMap();
function matchesSelector(_0x309aff, _0x15ecef) {
  return typeof _0x309aff?.matches === "function" && _0x309aff.matches(_0x15ecef);
}
function resolveThumbContainer(_0x30cb42) {
  if (!_0x30cb42) {
    return null;
  }
  if (matchesSelector(_0x30cb42, THUMB_CONTAINER_SELECTOR)) {
    return _0x30cb42;
  }
  return _0x30cb42.querySelector?.(THUMB_CONTAINER_SELECTOR) || null;
}
function queryThumbItems(_0x4cbdb6) {
  return Array.from(_0x4cbdb6?.querySelectorAll?.(THUMB_ITEM_SELECTOR) || []);
}
function getDataset(_0x2b51e5) {
  return _0x2b51e5?.dataset || {};
}
function isAssetRef(_0x15ea73) {
  const _0x533315 = getDataset(_0x15ea73);
  return _0x533315.refOrigin === "asset" || !!_0x533315.assetId || String(_0x533315.refKey || "").startsWith("asset:");
}
function getEdgeId(_0x2362cd) {
  return String(getDataset(_0x2362cd).edgeId || "").trim();
}
function isNodeEdgeThumb(_0x5b7070) {
  return !!getEdgeId(_0x5b7070) && !isAssetRef(_0x5b7070);
}
function isGroupOutputEdge(_0x16d0d2) {
  return !!_0x16d0d2?.isGroupOutput && !!_0x16d0d2?.groupOutputEdgeId;
}
function isReadOnlyDerivedGroupEdge(_0x101795) {
  if (!_0x101795) {
    return false;
  }
  if (isGroupOutputEdge(_0x101795)) {
    return false;
  }
  if (_0x101795.isGroupShared) {
    return false;
  }
  return !!_0x101795.effectiveTargetId && !isGroupOutputEdge(_0x101795);
}
function findIncomingEdge(_0x4d525e, _0x460374, _0x4de678) {
  const _0x282198 = String(_0x4de678 || "").trim();
  if (!_0x282198 || typeof _0x4d525e?.getIncomingEdges !== "function") {
    return null;
  }
  return (_0x4d525e.getIncomingEdges(_0x460374) || []).find(_0x34bf1f => String(_0x34bf1f?.id || "").trim() === _0x282198) || null;
}
function isMutableNodeEdgeThumb(_0x3fbcb1, _0x161f48, _0x46fd8d) {
  if (!isNodeEdgeThumb(_0x3fbcb1)) {
    return false;
  }
  const _0x3258b6 = findIncomingEdge(_0x161f48, _0x46fd8d, getEdgeId(_0x3fbcb1));
  return !isReadOnlyDerivedGroupEdge(_0x3258b6);
}
function getFixedSlotEdgeContext(_0x34ed7f, _0x2f8462, _0x5e6363) {
  if (!_0x2f8462) {
    return null;
  }
  const _0x104833 = _0x34ed7f?.getState?.() || {};
  const _0x2eb580 = String(_0x5e6363 || "");
  if (isGroupOutputEdge(_0x2f8462)) {
    if (String(_0x2f8462.effectiveTargetId || "") !== _0x2eb580) {
      return null;
    }
    const _0x462178 = String(_0x2f8462.groupOutputEdgeId || "").trim();
    const _0x1b1c54 = _0x104833.edges?.[_0x462178] || null;
    if (!_0x1b1c54?.id) {
      return null;
    }
    return {
      kind: "groupOutput",
      incomingEdge: _0x2f8462,
      rawEdge: _0x1b1c54,
      dragEdgeId: String(_0x2f8462.id || "").trim()
    };
  }
  const _0x301d24 = _0x104833.edges?.[String(_0x2f8462.id || "").trim()] || null;
  if (!_0x301d24?.id) {
    return null;
  }
  if (String(_0x301d24.targetId || "") === _0x2eb580) {
    return {
      kind: "edge",
      incomingEdge: _0x2f8462,
      rawEdge: _0x301d24,
      dragEdgeId: _0x301d24.id
    };
  }
  if (_0x2f8462.isGroupShared && String(_0x2f8462.effectiveTargetId || "") === _0x2eb580) {
    return {
      kind: "edge",
      incomingEdge: _0x2f8462,
      rawEdge: _0x301d24,
      dragEdgeId: _0x301d24.id
    };
  }
  return null;
}
function resolveMutableFixedSlotThumb(_0x4caa47, _0x153a52, _0x3d5225) {
  if (!isMutableNodeEdgeThumb(_0x4caa47, _0x153a52, _0x3d5225)) {
    return null;
  }
  const _0x54f00b = findIncomingEdge(_0x153a52, _0x3d5225, getEdgeId(_0x4caa47));
  return getFixedSlotEdgeContext(_0x153a52, _0x54f00b, _0x3d5225);
}
function resolveMutableFixedSlotEdgeById(_0x552a55, _0x21050e, _0x1fe90f) {
  const _0x5283a9 = findIncomingEdge(_0x552a55, _0x21050e, _0x1fe90f);
  return getFixedSlotEdgeContext(_0x552a55, _0x5283a9, _0x21050e);
}
function isFixedSlotThumb(_0x1426e0, _0x2be154 = null) {
  const _0x1e666c = getDataset(_0x1426e0);
  return !!String(_0x1e666c.slot || "").trim() || !!String(_0x1e666c.refSlot || "").trim() || !!String(_0x2be154?.refSlot || "").trim();
}
function isOrderableNodeEdgeThumb(_0x200512, _0x4ba809, _0x892c77) {
  if (!isNodeEdgeThumb(_0x200512)) {
    return false;
  }
  const _0x1ce9b0 = findIncomingEdge(_0x4ba809, _0x892c77, getEdgeId(_0x200512));
  if (isReadOnlyDerivedGroupEdge(_0x1ce9b0)) {
    return false;
  }
  return !isFixedSlotThumb(_0x200512, _0x1ce9b0);
}
function setDragData(_0x4b176d, _0x29135a) {
  if (!_0x4b176d?.dataTransfer) {
    return;
  }
  _0x4b176d.dataTransfer.effectAllowed = "move";
  _0x4b176d.dataTransfer.setData?.("text/plain", _0x29135a);
}
function setDropMove(_0x1f12a7) {
  if (!_0x1f12a7?.dataTransfer) {
    return;
  }
  _0x1f12a7.dataTransfer.dropEffect = "move";
}
function setOwnerDragging(_0xfc0540, _0x827a7e) {
  if (!_0xfc0540) {
    return;
  }
  _0xfc0540._isDraggingSorting = _0x827a7e;
}
function getOrderDragState(_0x950957) {
  if (!_0x950957 || typeof _0x950957 !== "object") {
    return {
      dragEl: null
    };
  }
  let _0x1a9aa9 = orderDragStateByContainer.get(_0x950957);
  if (!_0x1a9aa9) {
    _0x1a9aa9 = {
      dragEl: null
    };
    orderDragStateByContainer.set(_0x950957, _0x1a9aa9);
  }
  return _0x1a9aa9;
}
function animateReorder(_0x1c6264, _0x59d344) {
  const _0x3c28bb = queryThumbItems(_0x1c6264);
  const _0x20cfca = _0x3c28bb.map(_0x2749c6 => _0x2749c6.getBoundingClientRect?.() || {});
  _0x59d344();
  const _0x5c3c44 = _0x3c28bb.map(_0x1a4247 => _0x1a4247.getBoundingClientRect?.() || {});
  _0x3c28bb.forEach((_0x5cfc30, _0x35fc80) => {
    const _0x21925b = Number(_0x20cfca[_0x35fc80]?.left || 0) - Number(_0x5c3c44[_0x35fc80]?.left || 0);
    const _0x23ef9a = Number(_0x20cfca[_0x35fc80]?.top || 0) - Number(_0x5c3c44[_0x35fc80]?.top || 0);
    if (_0x21925b === 0 && _0x23ef9a === 0) {
      return;
    }
    _0x5cfc30.style.transform = "translate(" + _0x21925b + "px, " + _0x23ef9a + "px)";
    _0x5cfc30.style.transition = "none";
    const _0x119f4a = typeof requestAnimationFrame === "function" ? requestAnimationFrame : _0x103302 => setTimeout(_0x103302, 0);
    _0x119f4a(() => {
      _0x5cfc30.style.transform = "";
      _0x5cfc30.style.transition = "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)";
    });
  });
}
function getTargetIncomingEdges(_0x73b2fe, _0x3b5e75) {
  return (_0x73b2fe?.getIncomingEdges?.(_0x3b5e75) || []).filter(_0xe81b64 => {
    if (!_0xe81b64 || !String(_0xe81b64.id || "").trim()) {
      return false;
    }
    const _0xa71fff = String(_0x3b5e75 || "");
    if (String(_0xe81b64.targetId || "") === _0xa71fff) {
      return true;
    }
    return _0xe81b64.isGroupShared && String(_0xe81b64.effectiveTargetId || "") === _0xa71fff || isGroupOutputEdge(_0xe81b64) && String(_0xe81b64.effectiveTargetId || "") === _0xa71fff;
  });
}
function resolveEdge(_0x5beef4, _0x4ecee7, _0x4398b0) {
  const _0x478c13 = _0x5beef4?.getState?.() || {};
  return _0x478c13.edges?.[_0x4ecee7] || _0x4398b0.find(_0x51abf5 => _0x51abf5.id === _0x4ecee7) || null;
}
function uniqueSourceIds(_0x3896e5) {
  const _0x2ea928 = new Set();
  const _0x5f00a4 = [];
  _0x3896e5.forEach(_0x5af72d => {
    const _0x264357 = String(_0x5af72d?.sourceId || "").trim();
    if (!_0x264357 || _0x2ea928.has(_0x264357)) {
      return;
    }
    _0x2ea928.add(_0x264357);
    _0x5f00a4.push(_0x264357);
  });
  return _0x5f00a4;
}
function mergeVisibleSourceOrder(_0x4e0d22, _0x45b8b2) {
  const _0x41ac93 = [..._0x45b8b2];
  const _0x3925d6 = new Set(_0x41ac93);
  (Array.isArray(_0x4e0d22) ? _0x4e0d22 : []).forEach(_0x398c50 => {
    const _0x563836 = String(_0x398c50 || "").trim();
    if (!_0x563836 || _0x3925d6.has(_0x563836)) {
      return;
    }
    _0x3925d6.add(_0x563836);
    _0x41ac93.push(_0x563836);
  });
  return _0x41ac93;
}
function getGroupOutputOrderTargetId(_0x1b2d22) {
  const _0x58fa63 = new Set();
  for (const _0x43e93e of _0x1b2d22 || []) {
    if (!_0x43e93e?.isGroupShared) {
      return "";
    }
    const _0x342515 = String(_0x43e93e.effectiveTargetId || "").trim();
    if (!_0x342515) {
      return "";
    }
    _0x58fa63.add(_0x342515);
  }
  if (_0x58fa63.size === 1) {
    return Array.from(_0x58fa63)[0];
  } else {
    return "";
  }
}
function applyGroupOutputSourceOrder(_0x1c9ce5, _0x17a859, _0xc58640) {
  if (!_0x17a859) {
    return {
      ..._0x1c9ce5,
      groupOutputSourceOrder: _0xc58640
    };
  }
  const _0x49d096 = _0x1c9ce5.groupOutputSourceOrderByTarget;
  const _0x53a70f = _0x49d096 && typeof _0x49d096 === "object" && !Array.isArray(_0x49d096) ? {
    ..._0x49d096
  } : {};
  _0x53a70f[_0x17a859] = _0xc58640;
  return {
    ..._0x1c9ce5,
    groupOutputSourceOrderByTarget: _0x53a70f
  };
}
function collectGroupOutputEdgeUpdates(_0x2e64c3, _0x1e6aa0) {
  const _0x595796 = _0x2e64c3?.getState?.() || {};
  const _0x2989fc = new Map();
  _0x1e6aa0.forEach(_0x3931c7 => {
    if (!isGroupOutputEdge(_0x3931c7)) {
      return;
    }
    const _0x1ee39e = String(_0x3931c7.groupOutputEdgeId || "").trim();
    if (!_0x1ee39e) {
      return;
    }
    if (!_0x2989fc.has(_0x1ee39e)) {
      _0x2989fc.set(_0x1ee39e, []);
    }
    _0x2989fc.get(_0x1ee39e).push(_0x3931c7);
  });
  const _0x4e3a14 = [];
  _0x2989fc.forEach((_0x47d8ae, _0x3b7409) => {
    const _0x59240d = _0x595796.edges?.[_0x3b7409];
    if (!_0x59240d?.id) {
      return;
    }
    const _0x5539b4 = uniqueSourceIds(_0x47d8ae);
    if (_0x5539b4.length <= 1) {
      return;
    }
    const _0x558a98 = getGroupOutputOrderTargetId(_0x47d8ae);
    const _0x1d611f = resolveGroupOutputSourceOrder(_0x59240d, _0x558a98);
    const _0x27aaf4 = mergeVisibleSourceOrder(_0x1d611f, _0x5539b4);
    if (isSameStringOrder(_0x27aaf4, _0x1d611f || [])) {
      return;
    }
    _0x4e3a14.push({
      removeId: _0x3b7409,
      edge: applyGroupOutputSourceOrder(_0x59240d, _0x558a98, _0x27aaf4)
    });
  });
  return _0x4e3a14;
}
function collectOrderedEdgeIds(_0x5f0123, _0x29784c, _0x4b0df3) {
  return queryThumbItems(_0x5f0123).filter(_0x3370d6 => isOrderableNodeEdgeThumb(_0x3370d6, _0x29784c, _0x4b0df3)).map(_0x403386 => getEdgeId(_0x403386)).filter(Boolean);
}
function commitOrder(_0x1e25e8, _0x927c3f, _0x57b363) {
  const _0x96be4b = collectOrderedEdgeIds(_0x1e25e8, _0x927c3f, _0x57b363);
  if (_0x96be4b.length === 0) {
    return;
  }
  const _0x28935b = new Set(_0x96be4b);
  const _0x3d8d17 = getTargetIncomingEdges(_0x927c3f, _0x57b363).filter(_0x32bca6 => _0x28935b.has(_0x32bca6.id));
  const _0x16b6ac = _0x3d8d17.map(_0x36ac48 => _0x36ac48.id);
  if (_0x16b6ac.length !== _0x96be4b.length) {
    return;
  }
  if (isSameStringOrder(_0x96be4b, _0x16b6ac)) {
    return;
  }
  const _0x13128d = _0x96be4b.map(_0x5f61c8 => resolveEdge(_0x927c3f, _0x5f61c8, _0x3d8d17)).filter(Boolean);
  if (_0x13128d.length !== _0x16b6ac.length) {
    return;
  }
  const _0x139e1d = collectGroupOutputEdgeUpdates(_0x927c3f, _0x13128d);
  const _0x3ee850 = _0x13128d.filter(_0x3c5a2f => !isGroupOutputEdge(_0x3c5a2f));
  const _0x109500 = _0x3d8d17.filter(_0x322fcc => !isGroupOutputEdge(_0x322fcc)).map(_0x57c731 => _0x57c731.id);
  const _0x314544 = _0x3ee850.map(_0x5a0c38 => _0x5a0c38.id);
  const _0x2516bf = [];
  const _0x1ce211 = [];
  if (_0x109500.length > 1 && !isSameStringOrder(_0x314544, _0x109500)) {
    _0x2516bf.push(..._0x109500);
    _0x1ce211.push(..._0x3ee850);
  }
  _0x139e1d.forEach(_0x191e9d => {
    _0x2516bf.push(_0x191e9d.removeId);
    _0x1ce211.push(_0x191e9d.edge);
  });
  if (_0x2516bf.length === 0) {
    return;
  }
  _0x927c3f.updateEdgesBatch?.(_0x2516bf, _0x1ce211);
}
export function bindRefThumbOrderDrag({
  owner: _0x66e3d1,
  container: _0x2c0d5a,
  store: _0xd1000e,
  nodeId: _0x5335dd
} = {}) {
  const _0x11039c = resolveThumbContainer(_0x2c0d5a);
  if (!_0x11039c || !_0xd1000e || !_0x5335dd) {
    return;
  }
  const _0xe6f04 = getOrderDragState(_0x11039c);
  queryThumbItems(_0x11039c).forEach(_0x57664c => {
    if (!isOrderableNodeEdgeThumb(_0x57664c, _0xd1000e, _0x5335dd)) {
      const _0x140004 = findIncomingEdge(_0xd1000e, _0x5335dd, getEdgeId(_0x57664c));
      if (isNodeEdgeThumb(_0x57664c) && isReadOnlyDerivedGroupEdge(_0x140004)) {
        _0x57664c.setAttribute?.("draggable", "false");
      }
      return;
    }
    if (_0x57664c.dataset.dragBound === "1") {
      return;
    }
    _0x57664c.dataset.dragBound = "1";
    _0x57664c.setAttribute?.("draggable", "true");
    let _0x1109b2 = null;
    let _0x1465bc = 0;
    _0x57664c.addEventListener("dragstart", _0x5adff9 => {
      if (!isOrderableNodeEdgeThumb(_0x57664c, _0xd1000e, _0x5335dd)) {
        return;
      }
      const _0x2b134a = ++_0x1465bc;
      if (_0x1109b2 !== null) {
        clearTimeout(_0x1109b2);
      }
      _0xe6f04.dragEl = _0x57664c;
      setOwnerDragging(_0x66e3d1, true);
      setDragData(_0x5adff9, getEdgeId(_0x57664c) || "dragging");
      _0x57664c.classList?.add("dragging-capture");
      _0x1109b2 = setTimeout(() => {
        _0x1109b2 = null;
        if (_0x1465bc !== _0x2b134a || _0xe6f04.dragEl !== _0x57664c) {
          return;
        }
        _0x57664c.classList?.add("dragging");
        _0x57664c.style.opacity = "0.1";
      }, 0);
    });
    _0x57664c.addEventListener("dragend", () => {
      _0x1465bc += 1;
      if (_0x1109b2 !== null) {
        clearTimeout(_0x1109b2);
        _0x1109b2 = null;
      }
      if (_0xe6f04.dragEl) {
        _0xe6f04.dragEl.style.opacity = "1";
      }
      _0x57664c.classList?.remove("dragging");
      _0x57664c.classList?.remove("dragging-capture");
      try {
        commitOrder(_0x11039c, _0xd1000e, _0x5335dd);
      } finally {
        _0xe6f04.dragEl = null;
        setOwnerDragging(_0x66e3d1, false);
      }
    });
    _0x57664c.addEventListener("dragover", _0x18f73b => {
      const _0x4148ad = _0xe6f04.dragEl;
      if (!_0x4148ad || _0x4148ad === _0x57664c) {
        return;
      }
      if (!isOrderableNodeEdgeThumb(_0x4148ad, _0xd1000e, _0x5335dd) || !isOrderableNodeEdgeThumb(_0x57664c, _0xd1000e, _0x5335dd)) {
        return;
      }
      _0x18f73b.preventDefault?.();
      setDropMove(_0x18f73b);
      const _0x3423eb = _0x57664c.getBoundingClientRect?.() || {};
      const _0x2f2275 = Number(_0x3423eb.left || 0) + Number(_0x3423eb.width || 0) / 2;
      animateReorder(_0x11039c, () => {
        if (Number(_0x18f73b.clientX || 0) < _0x2f2275) {
          _0x57664c.parentNode?.insertBefore(_0x4148ad, _0x57664c);
        } else {
          _0x57664c.parentNode?.insertBefore(_0x4148ad, _0x57664c.nextSibling);
        }
      });
    });
  });
  if (_0x11039c.dataset.dragContainerBound !== "1") {
    _0x11039c.dataset.dragContainerBound = "1";
    _0x11039c.addEventListener("dragover", _0x122d88 => _0x122d88.preventDefault?.());
    _0x11039c.addEventListener("drop", _0x40a330 => _0x40a330.preventDefault?.());
  }
}
function defaultGetKindByNode(_0x14a964) {
  const _0x3f324d = String(_0x14a964?.type || "");
  if (_0x3f324d.includes("text")) {
    return "text";
  }
  if (_0x3f324d.includes("video")) {
    return "video";
  }
  if (_0x3f324d.includes("audio")) {
    return "audio";
  }
  if (_0x3f324d) {
    return "image";
  } else {
    return "";
  }
}
function clearDropState(_0x146663) {
  queryThumbItems(_0x146663).filter(_0x32135c => _0x32135c.classList?.contains?.("is-drop-allow")).forEach(_0x29c2dd => _0x29c2dd.classList?.remove("is-drop-allow"));
}
function getSlot(_0x2876f6) {
  return String(getDataset(_0x2876f6).slot || "").trim();
}
function getSlotKind(_0x28f878, _0x305b2d, _0x252625, _0x597911) {
  const _0xa9acc7 = getSlot(_0x28f878);
  const _0x1e1d6e = String(getDataset(_0x28f878).kind || "").trim();
  if (_0x1e1d6e) {
    return _0x1e1d6e;
  }
  const _0x1a88df = String(getDataset(_0x28f878).sourceId || "").trim();
  const _0x256dde = _0x1a88df ? _0x597911?.getState?.()?.nodes?.[_0x1a88df] : null;
  return _0x252625(_0x256dde) || String(_0x305b2d?.[_0xa9acc7] || "").trim();
}
function findSlotTarget(_0x5eb36b) {
  return _0x5eb36b?.target?.closest?.("[data-slot]") || null;
}
function resolveFixedSlotTargetEdgeContext(_0xe3ff72, _0x46f3dd, _0x228f5e, _0xe597e9) {
  const _0x178066 = getEdgeId(_0xe3ff72);
  if (_0x178066) {
    return resolveMutableFixedSlotEdgeById(_0x46f3dd, _0x228f5e, _0x178066);
  }
  return getTargetIncomingEdges(_0x46f3dd, _0x228f5e).map(_0x5f0636 => getFixedSlotEdgeContext(_0x46f3dd, _0x5f0636, _0x228f5e)).filter(Boolean).find(({
    incomingEdge: _0x453d5d,
    rawEdge: _0x449339
  }) => _0x449339 && String(_0x453d5d?.refSlot || "").trim() === String(_0xe597e9 || "")) || null;
}
function getFixedSlotAcceptMap(_0x1e859f, _0x2dcf4f) {
  return _0x1e859f?._refThumbFixedSlotAcceptMap || _0x2dcf4f || {};
}
function getContextSourceKind(_0x3c29c9, _0xebe9e6, _0x4ae78c) {
  const _0x2f874f = String(_0x3c29c9?.incomingEdge?.sourceId || "").trim();
  if (!_0x2f874f) {
    return "";
  }
  return _0x4ae78c(_0xebe9e6?.nodes?.[_0x2f874f] || null);
}
function collectFixedSlotGroupOutputUpdates({
  store: _0x488db8,
  nodeId: _0x52b20a,
  slotOrder: _0x3be974,
  contextA: _0x415ec0,
  contextB: _0xdac00f,
  fromSlot: _0x260637,
  toSlot: _0x349f14
}) {
  if (_0x415ec0?.kind !== "groupOutput" && _0xdac00f?.kind !== "groupOutput") {
    return [];
  }
  const _0x22938f = new Map();
  getTargetIncomingEdges(_0x488db8, _0x52b20a).filter(isGroupOutputEdge).forEach(_0x3fa7e2 => {
    const _0x16d0f0 = String(_0x3fa7e2?.refSlot || "").trim();
    if (_0x16d0f0) {
      _0x22938f.set(_0x16d0f0, _0x3fa7e2);
    }
  });
  if (_0x415ec0?.kind === "groupOutput") {
    _0x22938f.delete(_0x260637);
  }
  if (_0xdac00f?.kind === "groupOutput") {
    _0x22938f.delete(_0x349f14);
  }
  if (_0x415ec0?.kind === "groupOutput") {
    _0x22938f.set(_0x349f14, _0x415ec0.incomingEdge);
  }
  if (_0xdac00f?.kind === "groupOutput") {
    _0x22938f.set(_0x260637, _0xdac00f.incomingEdge);
  }
  const _0x5b0532 = _0x3be974.map(_0x19fef5 => _0x22938f.get(_0x19fef5)).filter(Boolean);
  return collectGroupOutputEdgeUpdates(_0x488db8, _0x5b0532);
}
export function bindRefThumbFixedSlotDrag({
  owner: _0x1f6fdf,
  container: _0x29b4d9,
  store: _0x5717a3,
  nodeId: _0x2478ce,
  acceptMap: _0x5f0de7,
  getKindByNode = defaultGetKindByNode
} = {}) {
  if (!_0x29b4d9 || !_0x5717a3 || !_0x2478ce || !_0x5f0de7) {
    return;
  }
  if (_0x1f6fdf) {
    _0x1f6fdf._refThumbFixedSlotAcceptMap = _0x5f0de7 || null;
  }
  if (_0x29b4d9.dataset.fixedSlotDragBound === "1") {
    return;
  }
  _0x29b4d9.dataset.fixedSlotDragBound = "1";
  _0x29b4d9.addEventListener("dragstart", _0x164867 => {
    const _0x11a386 = _0x164867.target?.closest?.(THUMB_ITEM_SELECTOR);
    const _0x5efd95 = _0x11a386 ? resolveMutableFixedSlotThumb(_0x11a386, _0x5717a3, _0x2478ce) : null;
    if (!_0x11a386 || !_0x5efd95) {
      return;
    }
    const _0x320b04 = String(_0x5efd95.dragEdgeId || _0x5efd95.rawEdge.id || "").trim();
    const _0x59bea8 = getSlot(_0x11a386);
    if (!_0x320b04 || !_0x59bea8) {
      return;
    }
    const _0x9ac420 = getFixedSlotAcceptMap(_0x1f6fdf, _0x5f0de7);
    const _0x3e622b = getSlotKind(_0x11a386, _0x9ac420, getKindByNode, _0x5717a3);
    if (!_0x3e622b || _0x9ac420[_0x59bea8] !== _0x3e622b) {
      return;
    }
    if (!_0x1f6fdf) {
      return;
    }
    _0x1f6fdf._fixedSlotDrag = {
      edgeId: _0x320b04,
      fromSlot: _0x59bea8,
      kind: _0x3e622b
    };
    clearDropState(_0x29b4d9);
    _0x11a386.classList?.add("is-dragging");
    setDragData(_0x164867, _0x320b04);
    _0x164867.stopPropagation?.();
  });
  _0x29b4d9.addEventListener("dragend", _0x4dacc8 => {
    const _0x376de7 = _0x4dacc8.target?.closest?.(THUMB_ITEM_SELECTOR);
    _0x376de7?.classList?.remove("is-dragging");
    clearDropState(_0x29b4d9);
    if (_0x1f6fdf) {
      _0x1f6fdf._fixedSlotDrag = null;
    }
    _0x4dacc8.stopPropagation?.();
  });
  _0x29b4d9.addEventListener("dragover", _0x8f26db => {
    const _0x337204 = _0x1f6fdf?._fixedSlotDrag;
    if (!_0x337204) {
      return;
    }
    const _0x31f11d = findSlotTarget(_0x8f26db);
    const _0x45a308 = getSlot(_0x31f11d);
    const _0x31e9be = getFixedSlotAcceptMap(_0x1f6fdf, _0x5f0de7);
    if (!_0x45a308 || _0x31e9be[_0x45a308] !== _0x337204.kind) {
      return;
    }
    _0x8f26db.preventDefault?.();
    setDropMove(_0x8f26db);
    clearDropState(_0x29b4d9);
    _0x31f11d.classList?.add("is-drop-allow");
    _0x8f26db.stopPropagation?.();
  });
  _0x29b4d9.addEventListener("drop", _0x253990 => {
    const _0x881e4b = _0x1f6fdf?._fixedSlotDrag;
    if (!_0x881e4b) {
      return;
    }
    const _0x84fd56 = findSlotTarget(_0x253990);
    const _0x4c4bf7 = getSlot(_0x84fd56);
    const _0x51ac67 = getFixedSlotAcceptMap(_0x1f6fdf, _0x5f0de7);
    if (!_0x4c4bf7 || _0x51ac67[_0x4c4bf7] !== _0x881e4b.kind) {
      return;
    }
    _0x253990.preventDefault?.();
    clearDropState(_0x29b4d9);
    if (_0x4c4bf7 === _0x881e4b.fromSlot) {
      return;
    }
    const _0x292ef4 = _0x5717a3.getState?.() || {};
    const _0x364c56 = resolveMutableFixedSlotEdgeById(_0x5717a3, _0x2478ce, _0x881e4b.edgeId);
    const _0x2bbe74 = _0x364c56?.rawEdge || null;
    if (!_0x2bbe74) {
      return;
    }
    const _0x13ca87 = resolveFixedSlotTargetEdgeContext(_0x84fd56, _0x5717a3, _0x2478ce, _0x4c4bf7);
    const _0x1a704a = _0x13ca87?.rawEdge || null;
    const _0x5c7023 = Object.keys(_0x51ac67 || {}).filter(_0x24adab => _0x51ac67[_0x24adab] === _0x881e4b.kind);
    const _0xa6abff = collectFixedSlotGroupOutputUpdates({
      store: _0x5717a3,
      nodeId: _0x2478ce,
      slotOrder: _0x5c7023,
      contextA: _0x364c56,
      contextB: _0x13ca87,
      fromSlot: _0x881e4b.fromSlot,
      toSlot: _0x4c4bf7
    });
    const _0x537137 = [];
    const _0x52f4b8 = [];
    if (_0x1a704a?.id && _0x1a704a.id !== _0x2bbe74.id) {
      const _0x36e40b = getContextSourceKind(_0x13ca87, _0x292ef4, getKindByNode);
      if (!_0x36e40b || _0x51ac67[_0x881e4b.fromSlot] !== _0x36e40b) {
        return;
      }
      if (_0x364c56.kind === "edge") {
        _0x537137.push(_0x2bbe74.id);
        _0x52f4b8.push({
          ..._0x2bbe74,
          refSlot: _0x4c4bf7
        });
      }
      if (_0x13ca87.kind === "edge") {
        _0x537137.push(_0x1a704a.id);
        _0x52f4b8.push({
          ..._0x1a704a,
          refSlot: _0x881e4b.fromSlot
        });
      }
    } else if (_0x364c56.kind === "edge") {
      _0x537137.push(_0x2bbe74.id);
      _0x52f4b8.push({
        ..._0x2bbe74,
        refSlot: _0x4c4bf7
      });
    }
    _0xa6abff.forEach(_0x548186 => {
      _0x537137.push(_0x548186.removeId);
      _0x52f4b8.push(_0x548186.edge);
    });
    if (_0x537137.length === 0) {
      return;
    }
    _0x5717a3.updateEdgesBatch?.(_0x537137, _0x52f4b8);
    if (_0x1f6fdf) {
      _0x1f6fdf._fixedSlotDrag = null;
    }
    _0x253990.stopPropagation?.();
  });
}