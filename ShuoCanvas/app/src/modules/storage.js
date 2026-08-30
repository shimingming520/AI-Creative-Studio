import { DB_CONFIG } from "../utils/constants.js";
const {
  name: DB_NAME,
  version: DB_VERSION,
  storeName: IMAGE_STORE_NAME,
  thumbnailStoreName: THUMBNAIL_STORE_NAME = "thumbnails"
} = DB_CONFIG;
let dbPromise = null;
const DB_OPEN_TIMEOUT_MS = 5000;
export function openIndexedDatabase(_0x402c18, _0x3d1148, _0x3d8d37, _0x46c82f = {}) {
  const {
    timeoutMs = DB_OPEN_TIMEOUT_MS,
    onUpgrade = null,
    setTimeoutFn = globalThis.setTimeout,
    clearTimeoutFn = globalThis.clearTimeout
  } = _0x46c82f;
  return new Promise((_0x5067c6, _0x4fadb9) => {
    let _0x24535b;
    try {
      _0x24535b = _0x402c18.open(_0x3d1148, _0x3d8d37);
    } catch (_0x10cde4) {
      _0x4fadb9(_0x10cde4);
      return;
    }
    let _0x400d62 = false;
    let _0x2e7462 = null;
    const _0x50a281 = (_0x3f6841, _0x5f3a2f) => {
      if (_0x400d62) {
        return false;
      }
      _0x400d62 = true;
      if (_0x2e7462 != null) {
        clearTimeoutFn?.(_0x2e7462);
      }
      _0x2e7462 = null;
      _0x3f6841(_0x5f3a2f);
      return true;
    };
    const _0x38b04c = _0x40c321 => _0x50a281(_0x4fadb9, _0x40c321);
    _0x24535b.onupgradeneeded = _0x3b6247 => onUpgrade?.(_0x3b6247);
    _0x24535b.onsuccess = _0x5b88da => {
      const _0xbe3b79 = _0x5b88da.target.result;
      if (!_0x50a281(_0x5067c6, _0xbe3b79)) {
        _0xbe3b79?.close?.();
      }
    };
    _0x24535b.onerror = _0x3e13ae => {
      _0x38b04c(_0x3e13ae.target?.error || new Error("IndexedDB open failed: " + _0x3d1148));
    };
    _0x24535b.onblocked = () => {
      _0x38b04c(new Error("IndexedDB open blocked: " + _0x3d1148));
    };
    const _0x31eb1b = Math.max(0, Number(timeoutMs) || 0);
    if (_0x31eb1b > 0 && typeof setTimeoutFn === "function") {
      _0x2e7462 = setTimeoutFn(() => {
        _0x38b04c(new Error("IndexedDB open timed out: " + _0x3d1148));
      }, _0x31eb1b);
    }
  });
}
function getDB() {
  if (!dbPromise) {
    dbPromise = openIndexedDatabase(indexedDB, DB_NAME, DB_VERSION, {
      onUpgrade: _0x1bd7e8 => {
        const _0x4f6b15 = _0x1bd7e8.target.result;
        if (!_0x4f6b15.objectStoreNames.contains(IMAGE_STORE_NAME)) {
          _0x4f6b15.createObjectStore(IMAGE_STORE_NAME);
        }
        if (!_0x4f6b15.objectStoreNames.contains(THUMBNAIL_STORE_NAME)) {
          _0x4f6b15.createObjectStore(THUMBNAIL_STORE_NAME);
        }
      }
    }).then(_0x28d0ae => {
      _0x28d0ae.onversionchange = () => _0x28d0ae.close();
      return _0x28d0ae;
    }).catch(_0xaed0f0 => {
      dbPromise = null;
      throw _0xaed0f0;
    });
  }
  return dbPromise;
}
async function putValue(_0x359436, _0x339787, _0x33d721) {
  const _0x168b7e = await getDB();
  return new Promise((_0x574553, _0x5206a4) => {
    const _0xc3e1f9 = _0x168b7e.transaction(_0x359436, "readwrite");
    const _0x2184a7 = _0xc3e1f9.objectStore(_0x359436);
    const _0x5da02b = _0x2184a7.put(_0x33d721, _0x339787);
    _0x5da02b.onsuccess = () => _0x574553(true);
    _0x5da02b.onerror = _0x5a9627 => _0x5206a4(_0x5a9627.target.error);
  });
}
async function getValue(_0x23820d, _0x3ea730) {
  const _0x45961d = await getDB();
  return new Promise((_0x4fa6d4, _0x29245c) => {
    const _0xc09155 = _0x45961d.transaction(_0x23820d, "readonly");
    const _0x5d0953 = _0xc09155.objectStore(_0x23820d);
    const _0x18351a = _0x5d0953.get(_0x3ea730);
    _0x18351a.onsuccess = _0x2e6f75 => _0x4fa6d4(_0x2e6f75.target.result ?? null);
    _0x18351a.onerror = _0x2d7218 => _0x29245c(_0x2d7218.target.error);
  });
}
async function deleteValue(_0x5d8473, _0xc7cdaf) {
  const _0x114628 = await getDB();
  return new Promise((_0x4d38ed, _0x4e0342) => {
    const _0x5c6bd1 = _0x114628.transaction(_0x5d8473, "readwrite");
    const _0x53317b = _0x5c6bd1.objectStore(_0x5d8473);
    const _0x832095 = _0x53317b.delete(_0xc7cdaf);
    _0x832095.onsuccess = () => _0x4d38ed(true);
    _0x832095.onerror = _0xe3d4fc => _0x4e0342(_0xe3d4fc.target.error);
  });
}
export async function saveImage(_0x21527d, _0x46fe4b) {
  return await putValue(IMAGE_STORE_NAME, _0x21527d, _0x46fe4b);
}
export async function getImage(_0x34d79a) {
  return await getValue(IMAGE_STORE_NAME, _0x34d79a);
}
export async function deleteImage(_0x5dc1fa) {
  return await deleteValue(IMAGE_STORE_NAME, _0x5dc1fa);
}
export async function saveThumbnailRecord(_0x15cb04, _0x6b1b6f) {
  return await putValue(THUMBNAIL_STORE_NAME, _0x15cb04, _0x6b1b6f);
}
export async function getThumbnailRecord(_0x5b5c2f) {
  return await getValue(THUMBNAIL_STORE_NAME, _0x5b5c2f);
}
export async function deleteThumbnailRecord(_0x49ee90) {
  return await deleteValue(THUMBNAIL_STORE_NAME, _0x49ee90);
}