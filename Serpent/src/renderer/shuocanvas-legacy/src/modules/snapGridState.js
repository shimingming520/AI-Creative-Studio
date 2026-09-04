const SNAP_GRID_STORAGE_KEY = "v2-snap-grid";
const SNAP_GRID_CHANGED_EVENT = "v2-snap-grid-changed";
function getRoot() {
  if (typeof window !== "undefined") {
    return window;
  } else {
    return globalThis;
  }
}
function readStoredSnapGridEnabled() {
  const _0x336c89 = getRoot();
  try {
    const _0xf1c4c3 = _0x336c89?.localStorage?.getItem(SNAP_GRID_STORAGE_KEY);
    if (_0xf1c4c3 == null) {
      return false;
    }
    return _0xf1c4c3 === "true";
  } catch {
    return false;
  }
}
function syncSnapGridButtons(_0x58ecdd) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x31b0da = _0x58ecdd === true;
  const _0x43a641 = document.getElementById("btnSnapGridOn");
  const _0x5e926c = document.getElementById("btnSnapGridOff");
  if (_0x43a641) {
    _0x43a641.classList.toggle("active", _0x31b0da);
  }
  if (_0x5e926c) {
    _0x5e926c.classList.toggle("active", !_0x31b0da);
  }
}
export function readSnapGridEnabled() {
  const _0x30120c = getRoot();
  if (typeof _0x30120c?.v2SnapToGrid === "boolean") {
    return _0x30120c.v2SnapToGrid;
  }
  return readStoredSnapGridEnabled();
}
export function writeSnapGridEnabled(_0x2f27ff, {
  emitEvent = true
} = {}) {
  const _0x200120 = getRoot();
  const _0x11a352 = _0x2f27ff === true;
  _0x200120.v2SnapToGrid = _0x11a352;
  try {
    _0x200120?.localStorage?.setItem(SNAP_GRID_STORAGE_KEY, _0x11a352 ? "true" : "false");
  } catch {}
  if (emitEvent && typeof _0x200120?.dispatchEvent === "function" && typeof CustomEvent === "function") {
    _0x200120.dispatchEvent(new CustomEvent(SNAP_GRID_CHANGED_EVENT, {
      detail: {
        enabled: _0x11a352
      }
    }));
  }
  return _0x11a352;
}
export function applySnapGridEnabled(_0xb12482, {
  syncButtons = true,
  emitEvent = true
} = {}) {
  const _0x5cd7ec = writeSnapGridEnabled(_0xb12482, {
    emitEvent: emitEvent
  });
  if (syncButtons) {
    syncSnapGridButtons(_0x5cd7ec);
  }
  return _0x5cd7ec;
}
export function subscribeSnapGridChanges(_0x5b7a15) {
  if (typeof window === "undefined" || typeof _0x5b7a15 !== "function") {
    return () => {};
  }
  const _0x2f9ba1 = _0x2df97e => _0x5b7a15(_0x2df97e?.detail?.enabled === true, _0x2df97e);
  window.addEventListener(SNAP_GRID_CHANGED_EVENT, _0x2f9ba1);
  return () => window.removeEventListener(SNAP_GRID_CHANGED_EVENT, _0x2f9ba1);
}