import { desktopBridge } from "./desktopBridge.js";
const LEGACY_RENDERER_STORAGE_MIGRATION_COMPLETED_KEY = "aic_legacy_renderer_storage_migration_completed";
function readMigrationAvailabilityHint(_0x59f7ce = globalThis.location) {
  try {
    const _0x1e7939 = new URLSearchParams(_0x59f7ce?.search || "").get("aicLegacyStorageMigration");
    if (_0x1e7939 === "1") {
      return true;
    }
    if (_0x1e7939 === "0") {
      return false;
    }
  } catch {}
  return null;
}
function hasCompletedMigrationMarker(_0x40da75) {
  try {
    return _0x40da75?.getItem?.(LEGACY_RENDERER_STORAGE_MIGRATION_COMPLETED_KEY) === "1";
  } catch {
    return false;
  }
}
function markMigrationCompleted(_0xeb143e) {
  try {
    _0xeb143e?.setItem?.(LEGACY_RENDERER_STORAGE_MIGRATION_COMPLETED_KEY, "1");
  } catch {}
}
function base64ToBytes(_0x3bc347) {
  const _0x115df2 = atob(String(_0x3bc347 || ""));
  const _0x5f1d3f = new Uint8Array(_0x115df2.length);
  for (let _0x36e605 = 0; _0x36e605 < _0x115df2.length; _0x36e605 += 1) {
    _0x5f1d3f[_0x36e605] = _0x115df2.charCodeAt(_0x36e605);
  }
  return _0x5f1d3f;
}
export function decodeLegacyStorageValue(_0x4b1bf7) {
  if (Array.isArray(_0x4b1bf7)) {
    return _0x4b1bf7.map(_0x2c639c => decodeLegacyStorageValue(_0x2c639c));
  }
  if (!_0x4b1bf7 || typeof _0x4b1bf7 !== "object") {
    return _0x4b1bf7;
  }
  const _0x55e3e0 = String(_0x4b1bf7.__aicStorageType || "");
  if (_0x55e3e0 === "blob") {
    return new Blob([base64ToBytes(_0x4b1bf7.base64)], {
      type: String(_0x4b1bf7.mimeType || "application/octet-stream")
    });
  }
  if (_0x55e3e0 === "array-buffer") {
    return base64ToBytes(_0x4b1bf7.base64).buffer;
  }
  if (_0x55e3e0 === "typed-array") {
    const _0x354cda = base64ToBytes(_0x4b1bf7.base64);
    const _0x37407f = globalThis[String(_0x4b1bf7.constructorName || "")] || Uint8Array;
    try {
      return new _0x37407f(_0x354cda.buffer.slice(0));
    } catch {
      return _0x354cda;
    }
  }
  if (_0x55e3e0 === "date") {
    return new Date(_0x4b1bf7.value);
  }
  return Object.fromEntries(Object.entries(_0x4b1bf7).map(([_0xc1559e, _0x237ce1]) => [_0xc1559e, decodeLegacyStorageValue(_0x237ce1)]));
}
export function applyLegacyLocalStorage(_0x56bcb2, _0x2f02a9 = globalThis.localStorage) {
  if (!_0x2f02a9 || !_0x56bcb2 || typeof _0x56bcb2 !== "object") {
    return 0;
  }
  let _0xcc9fc1 = 0;
  for (const [_0xf5ca3b, _0xeddbfa] of Object.entries(_0x56bcb2)) {
    if (_0x2f02a9.getItem(_0xf5ca3b) !== null || _0xeddbfa === null || _0xeddbfa === undefined) {
      continue;
    }
    _0x2f02a9.setItem(_0xf5ca3b, String(_0xeddbfa));
    _0xcc9fc1 += 1;
  }
  return _0xcc9fc1;
}
function openDatabase(_0x3f333c, _0x13d937, _0x2370b6, _0x3c6e87) {
  return new Promise((_0x34d12a, _0x2e1870) => {
    const _0x5b0c2e = _0x2370b6 ? _0x3f333c.open(_0x13d937, _0x2370b6) : _0x3f333c.open(_0x13d937);
    _0x5b0c2e.onupgradeneeded = _0x11972b => _0x3c6e87?.(_0x11972b.target.result);
    _0x5b0c2e.onsuccess = () => _0x34d12a(_0x5b0c2e.result);
    _0x5b0c2e.onerror = () => _0x2e1870(_0x5b0c2e.error || new Error("Unable to open " + _0x13d937));
    _0x5b0c2e.onblocked = () => _0x2e1870(new Error("Opening " + _0x13d937 + " was blocked"));
  });
}
function createMissingStores(_0x128b90, _0x32ada7) {
  for (const _0x155b4a of _0x32ada7 || []) {
    if (!_0x155b4a?.name || _0x128b90.objectStoreNames.contains(_0x155b4a.name)) {
      continue;
    }
    const _0x31694a = {};
    if (_0x155b4a.keyPath !== null && _0x155b4a.keyPath !== undefined) {
      _0x31694a.keyPath = _0x155b4a.keyPath;
    }
    if (_0x155b4a.autoIncrement === true) {
      _0x31694a.autoIncrement = true;
    }
    _0x128b90.createObjectStore(_0x155b4a.name, _0x31694a);
  }
}
async function openDatabaseForImport(_0x53fcfa, _0x32f26e) {
  let _0x415eec = await openDatabase(_0x53fcfa, _0x32f26e.name, 0, _0x557327 => createMissingStores(_0x557327, _0x32f26e.stores));
  const _0x3e0b1d = (_0x32f26e.stores || []).some(_0x588066 => _0x588066?.name && !_0x415eec.objectStoreNames.contains(_0x588066.name));
  if (!_0x3e0b1d) {
    return _0x415eec;
  }
  const _0x1bf6fd = Math.max(1, Number(_0x415eec.version || 0) + 1);
  _0x415eec.close();
  _0x415eec = await openDatabase(_0x53fcfa, _0x32f26e.name, _0x1bf6fd, _0x1b1196 => createMissingStores(_0x1b1196, _0x32f26e.stores));
  return _0x415eec;
}
function mergeStoreEntries(_0x7e9c7a, _0x4a37ae) {
  const _0x50af81 = Array.isArray(_0x4a37ae?.entries) ? _0x4a37ae.entries : [];
  if (!_0x4a37ae?.name || _0x50af81.length === 0) {
    return Promise.resolve(0);
  }
  return new Promise((_0x35b146, _0xa2623f) => {
    const _0x57861a = _0x7e9c7a.transaction(_0x4a37ae.name, "readwrite");
    const _0xa3e7bd = _0x57861a.objectStore(_0x4a37ae.name);
    let _0x26255f = 0;
    for (const _0x416334 of _0x50af81) {
      const _0x2b3403 = decodeLegacyStorageValue(_0x416334?.key);
      const _0x1e194c = decodeLegacyStorageValue(_0x416334?.value);
      const _0x43353d = _0xa3e7bd.get(_0x2b3403);
      _0x43353d.onsuccess = () => {
        if (_0x43353d.result !== undefined) {
          return;
        }
        if (_0xa3e7bd.keyPath === null) {
          _0xa3e7bd.put(_0x1e194c, _0x2b3403);
        } else {
          _0xa3e7bd.put(_0x1e194c);
        }
        _0x26255f += 1;
      };
      _0x43353d.onerror = () => _0x57861a.abort();
    }
    _0x57861a.oncomplete = () => _0x35b146(_0x26255f);
    _0x57861a.onerror = () => _0xa2623f(_0x57861a.error || new Error("Unable to import " + _0x4a37ae.name));
    _0x57861a.onabort = () => _0xa2623f(_0x57861a.error || new Error("Unable to import " + _0x4a37ae.name));
  });
}
export async function importLegacyIndexedDatabases(_0x3971d5, _0x57771c = globalThis.indexedDB) {
  if (!_0x57771c?.open || !Array.isArray(_0x3971d5)) {
    return 0;
  }
  let _0x38c4f3 = 0;
  for (const _0x1c8465 of _0x3971d5) {
    if (!_0x1c8465?.name) {
      continue;
    }
    const _0x2ece93 = await openDatabaseForImport(_0x57771c, _0x1c8465);
    try {
      for (const _0x2b69a5 of _0x1c8465.stores || []) {
        _0x38c4f3 += await mergeStoreEntries(_0x2ece93, _0x2b69a5);
      }
    } finally {
      _0x2ece93.close();
    }
  }
  return _0x38c4f3;
}
export async function migrateLegacyRendererStorageIfNeeded({
  bridge = desktopBridge.storageMigration,
  storage = globalThis.localStorage,
  indexedDBApi = globalThis.indexedDB,
  importDatabases = importLegacyIndexedDatabases,
  locationObject = globalThis.location
} = {}) {
  if (!bridge?.isAvailable?.()) {
    return {
      migrated: false,
      reason: "unavailable"
    };
  }
  const _0x5820f6 = readMigrationAvailabilityHint(locationObject);
  if (_0x5820f6 === false) {
    return {
      migrated: false,
      reason: "not-staged"
    };
  }
  if (hasCompletedMigrationMarker(storage)) {
    return {
      migrated: false,
      reason: "completed"
    };
  }
  try {
    const _0x2c5e51 = await bridge.read();
    if (!_0x2c5e51?.available || !_0x2c5e51.payload) {
      if (_0x2c5e51?.reason === "completed") {
        markMigrationCompleted(storage);
      }
      return {
        migrated: false,
        reason: _0x2c5e51?.reason || "not-staged"
      };
    }
    const _0x47a570 = applyLegacyLocalStorage(_0x2c5e51.payload.localStorage, storage);
    const _0x47cff7 = await importDatabases(_0x2c5e51.payload.databases, indexedDBApi);
    const _0x296624 = {
      localStorageCount: _0x47a570,
      indexedDbCount: _0x47cff7,
      skippedCount: Array.isArray(_0x2c5e51.payload.skipped) ? _0x2c5e51.payload.skipped.length : 0
    };
    await bridge.complete(_0x296624);
    markMigrationCompleted(storage);
    return {
      migrated: true,
      ..._0x296624
    };
  } catch (_0x3f1e6a) {
    console.warn("[storageMigration] legacy Electron storage migration failed:", _0x3f1e6a);
    return {
      migrated: false,
      reason: "failed",
      error: String(_0x3f1e6a?.message || _0x3f1e6a)
    };
  }
}