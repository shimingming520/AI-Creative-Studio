import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import a243_0x11226c from "node:path";
export const LEGACY_RENDERER_STORAGE_SCHEMA_VERSION = 1;
const STAGING_FILENAME = "legacy-renderer-storage-migration.json";
const COMPLETED_FILENAME = "legacy-renderer-storage-migration.completed.json";
export function buildLegacyRendererStorageMigrationAppUrl(_0xbcc834, {
  available = false
} = {}) {
  const _0x240d18 = new URL(String(_0xbcc834 || "http://127.0.0.1:8777/"));
  _0x240d18.searchParams.set("aicLegacyStorageMigration", available === true ? "1" : "0");
  return _0x240d18.href;
}
const LEGACY_STORAGE_EXPORT_SCRIPT = `(${async function exportLegacyRendererStorage() {
  const schemaVersion = 1;
  const maxBinaryRecordBytes = 16777216;
  const maxExportBytes = 100663296;
  let exportedBytes = 0;
  const skipped = [];
  function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 32768;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }
  async function encodeValue(value, allowLargeBinary = false) {
    if (value instanceof Blob) {
      if (!allowLargeBinary && value.size > maxBinaryRecordBytes) {
        throw new Error("binary-record-too-large");
      }
      const bytes = new Uint8Array(await value.arrayBuffer());
      return {
        __aicStorageType: "blob",
        mimeType: value.type || "application/octet-stream",
        base64: bytesToBase64(bytes)
      };
    }
    if (value instanceof ArrayBuffer) {
      if (!allowLargeBinary && value.byteLength > maxBinaryRecordBytes) {
        throw new Error("binary-record-too-large");
      }
      return {
        __aicStorageType: "array-buffer",
        base64: bytesToBase64(new Uint8Array(value))
      };
    }
    if (ArrayBuffer.isView(value)) {
      const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      if (!allowLargeBinary && bytes.byteLength > maxBinaryRecordBytes) {
        throw new Error("binary-record-too-large");
      }
      return {
        __aicStorageType: "typed-array",
        constructorName: value.constructor?.name || "Uint8Array",
        base64: bytesToBase64(bytes)
      };
    }
    if (value instanceof Date) {
      return {
        __aicStorageType: "date",
        value: value.toISOString()
      };
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map(item => encodeValue(item, allowLargeBinary)));
    }
    if (value && typeof value === "object") {
      const output = {};
      for (const [key, item] of Object.entries(value)) {
        output[key] = await encodeValue(item, allowLargeBinary);
      }
      return output;
    }
    return value;
  }
  function openDatabase(name) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error(`Unable to open ${name}`));
      request.onblocked = () => reject(new Error(`Opening ${name} was blocked`));
    });
  }
  function readStoreEntries(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const entries = [];
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          return;
        }
        entries.push({
          key: cursor.key,
          value: cursor.value
        });
        cursor.continue();
      };
      request.onerror = () => reject(request.error || new Error(`Unable to read ${storeName}`));
      transaction.oncomplete = () => resolve(entries);
      transaction.onerror = () => reject(transaction.error || new Error(`Unable to read ${storeName}`));
      transaction.onabort = () => reject(transaction.error || new Error(`Unable to read ${storeName}`));
    });
  }
  const localStorageEntries = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) {
      continue;
    }
    localStorageEntries[key] = localStorage.getItem(key);
  }
  exportedBytes += JSON.stringify(localStorageEntries).length;
  const targets = [{
    name: "TapNowV2Cache",
    stores: ["workspace"]
  }, {
    name: "TapNowCanvasDB",
    stores: ["images", "thumbnails"]
  }, {
    name: "AICanvasStoryboard3DAssets",
    stores: ["assets"]
  }];
  let knownDatabases = null;
  if (typeof indexedDB.databases === "function") {
    try {
      knownDatabases = new Set((await indexedDB.databases()).map(item => item?.name).filter(Boolean));
    } catch {}
  }
  const databases = [];
  for (const target of targets) {
    if (knownDatabases && !knownDatabases.has(target.name)) {
      continue;
    }
    let db = null;
    try {
      db = await openDatabase(target.name);
      const stores = [];
      for (const storeName of target.stores) {
        if (!db.objectStoreNames.contains(storeName)) {
          continue;
        }
        const rawEntries = await readStoreEntries(db, storeName);
        const entries = [];
        const isPersistentUserData = target.name === "TapNowV2Cache" || target.name === "AICanvasStoryboard3DAssets";
        for (const rawEntry of rawEntries) {
          try {
            const encoded = {
              key: await encodeValue(rawEntry.key, isPersistentUserData),
              value: await encodeValue(rawEntry.value, isPersistentUserData)
            };
            const size = JSON.stringify(encoded).length;
            if (!isPersistentUserData && exportedBytes + size > maxExportBytes) {
              skipped.push({
                database: target.name,
                store: storeName,
                reason: "export-limit"
              });
              continue;
            }
            exportedBytes += size;
            entries.push(encoded);
          } catch (error) {
            skipped.push({
              database: target.name,
              store: storeName,
              reason: String(error?.message || error || "encode-failed")
            });
          }
        }
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        stores.push({
          name: storeName,
          keyPath: objectStore.keyPath ?? null,
          autoIncrement: objectStore.autoIncrement === true,
          entries
        });
      }
      if (stores.length > 0) {
        databases.push({
          name: target.name,
          version: db.version,
          stores
        });
      }
    } catch (error) {
      skipped.push({
        database: target.name,
        reason: String(error?.message || error)
      });
    } finally {
      db?.close?.();
    }
  }
  return {
    schemaVersion,
    exportedAt: Date.now(),
    localStorage: localStorageEntries,
    databases,
    skipped
  };
}})()`;
function readJsonFile(_0x3f8019, _0x7a38db = readFileSync) {
  try {
    const _0x42943e = JSON.parse(_0x7a38db(_0x3f8019, "utf8"));
    if (_0x42943e && typeof _0x42943e === "object") {
      return _0x42943e;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
export function createLegacyRendererStorageMigration({
  userDataDir: _0x1b0d49,
  appUrl: _0x379001,
  createWindow: _0xc1afa4,
  exists = existsSync,
  readFile = readFileSync,
  writeFile = writeFileSync,
  rename = renameSync,
  unlink = unlinkSync,
  now = () => Date.now()
} = {}) {
  const _0x108d14 = a243_0x11226c.resolve(String(_0x1b0d49 || process.cwd()));
  const _0x2eb351 = a243_0x11226c.join(_0x108d14, STAGING_FILENAME);
  const _0x43516b = a243_0x11226c.join(_0x108d14, COMPLETED_FILENAME);
  function _0x47d1cc() {
    return exists(_0x43516b);
  }
  async function _0x43bf14() {
    if (_0x47d1cc()) {
      return {
        available: false,
        reason: "completed"
      };
    }
    if (exists(_0x2eb351)) {
      return {
        available: true,
        reason: "staged"
      };
    }
    if (typeof _0xc1afa4 !== "function") {
      return {
        available: false,
        reason: "window-unavailable"
      };
    }
    const _0x46a296 = _0xc1afa4();
    try {
      const _0x5140e8 = new URL("electron/legacyStorageMigration.html", _0x379001).href;
      await _0x46a296.loadURL(_0x5140e8);
      const _0x4ec22c = await _0x46a296.webContents.executeJavaScript(LEGACY_STORAGE_EXPORT_SCRIPT, true);
      if (Number(_0x4ec22c?.schemaVersion) !== LEGACY_RENDERER_STORAGE_SCHEMA_VERSION) {
        throw new Error("Legacy renderer storage export returned an unsupported schema");
      }
      const _0x3e4abe = _0x2eb351 + ".tmp";
      writeFile(_0x3e4abe, JSON.stringify(_0x4ec22c) + "\n", "utf8");
      rename(_0x3e4abe, _0x2eb351);
      return {
        available: true,
        reason: "prepared"
      };
    } finally {
      _0x46a296.destroy?.();
    }
  }
  function _0x3ca0ed() {
    if (_0x47d1cc()) {
      return {
        available: false,
        reason: "completed"
      };
    }
    const _0x16684e = readJsonFile(_0x2eb351, readFile);
    if (!_0x16684e) {
      return {
        available: false,
        reason: "not-prepared"
      };
    }
    return {
      available: true,
      payload: _0x16684e
    };
  }
  function _0x5aae6a(_0x55dd17 = {}) {
    writeFile(_0x43516b, JSON.stringify({
      schemaVersion: LEGACY_RENDERER_STORAGE_SCHEMA_VERSION,
      completedAt: now(),
      summary: _0x55dd17 && typeof _0x55dd17 === "object" ? _0x55dd17 : {}
    }, null, 2) + "\n", "utf8");
    try {
      unlink(_0x2eb351);
    } catch {}
    return {
      success: true
    };
  }
  return Object.freeze({
    prepare: _0x43bf14,
    read: _0x3ca0ed,
    complete: _0x5aae6a,
    stagingPath: _0x2eb351,
    completedPath: _0x43516b
  });
}
export const __legacyRendererStorageMigrationForTest = {
  LEGACY_STORAGE_EXPORT_SCRIPT: LEGACY_STORAGE_EXPORT_SCRIPT,
  readJsonFile: readJsonFile
};