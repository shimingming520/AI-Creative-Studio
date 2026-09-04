import a1430_0x15566f from "../core/stores/appStore.js";
function getStateSnapshot() {
  if (typeof a1430_0x15566f.getStateRaw === "function") {
    return a1430_0x15566f.getStateRaw();
  } else {
    return a1430_0x15566f.getState();
  }
}
function normalizeIds(_0x21a384) {
  return (Array.isArray(_0x21a384) ? _0x21a384 : [_0x21a384]).map(_0x185f22 => String(_0x185f22 || "").trim()).filter(Boolean);
}
export function persistToolbarResultNodes() {
  try {
    globalThis.window?._triggerLocalCacheSave?.();
  } catch {}
}
export function selectToolbarResultNodes(_0x49b72c) {
  const _0xf3ca82 = normalizeIds(_0x49b72c);
  if (!_0xf3ca82.length) {
    return [];
  }
  a1430_0x15566f.setSelectedNodes(_0xf3ca82);
  return _0xf3ca82;
}
export function addToolbarPendingResultNodes({
  nodes = [],
  persist = true
} = {}) {
  const _0x9a5ba2 = (Array.isArray(nodes) ? nodes : [nodes]).filter(_0x4ff928 => _0x4ff928 && typeof _0x4ff928 === "object" && String(_0x4ff928.id || "").trim());
  if (!_0x9a5ba2.length) {
    return [];
  }
  const _0x2890f2 = () => {
    _0x9a5ba2.forEach(_0x51ec8f => a1430_0x15566f.addNode(_0x51ec8f));
  };
  if (typeof a1430_0x15566f.batch === "function" && _0x9a5ba2.length > 1) {
    a1430_0x15566f.batch(_0x2890f2);
  } else {
    _0x2890f2();
  }
  const _0x4f8e7c = _0x9a5ba2.map(_0x7f43cc => _0x7f43cc.id);
  selectToolbarResultNodes(_0x4f8e7c);
  if (persist) {
    persistToolbarResultNodes();
  }
  return _0x4f8e7c;
}
export function updateToolbarResultNode(_0x14fffe, _0x310b06) {
  const _0x7db79e = String(_0x14fffe || "").trim();
  if (!_0x7db79e || !_0x310b06 || typeof _0x310b06 !== "object") {
    return false;
  }
  if (!getStateSnapshot().nodes?.[_0x7db79e]) {
    return false;
  }
  a1430_0x15566f.updateNodeData(_0x7db79e, _0x310b06);
  return true;
}
export function updateToolbarResultNodes(_0x114f22 = []) {
  const _0x3ac48d = (Array.isArray(_0x114f22) ? _0x114f22 : []).filter(_0x47170c => String(_0x47170c?.nodeId || _0x47170c?.id || "").trim() && _0x47170c?.patch && typeof _0x47170c.patch === "object");
  if (!_0x3ac48d.length) {
    return;
  }
  const _0x1b2d12 = () => {
    _0x3ac48d.forEach(_0x1d471c => {
      updateToolbarResultNode(_0x1d471c.nodeId || _0x1d471c.id, _0x1d471c.patch);
    });
  };
  if (typeof a1430_0x15566f.batch === "function" && _0x3ac48d.length > 1) {
    a1430_0x15566f.batch(_0x1b2d12);
  } else {
    _0x1b2d12();
  }
}