import { registerResourceUploadEntry } from "./resourceEntry.js";
import { createProjectLifecycle } from "./projectLifecycle.js";
import { registerAppGlobalEvents } from "./globalEvents.js";
export function bootstrapAppProject({
  store: _0x22e6f6,
  CanvasTabManager: _0x2a0cf2,
  project: _0x129329,
  loadCustomPresets: _0x56ff12,
  migrateLegacyThumbnailsInMultiData: _0x48caa8,
  sanitizeMultiCanvasDataForPersistence: _0x2e4ac1,
  commit: _0xbd1624,
  patchStoreSourceNodeNamesFromFileName: _0x4d41d6,
  applySourceNamesFromFileNameToCanvas: _0x49928c,
  uploadFile: _0x555709,
  getBaseName: _0x5091f4
} = {}) {
  const _0x4345c2 = new URLSearchParams(window.location.search);
  const _0x521d85 = _0x4345c2.get("id");
  window.currentProjectId = _0x521d85 || "default_v2_project";
  if (!_0x521d85) {
    console.log("[main] 未指定项目 ID，使用默认: " + window.currentProjectId + " ");
  }
  registerResourceUploadEntry({
    store: _0x22e6f6,
    uploadFile: _0x555709,
    getBaseName: _0x5091f4,
    getCurrentProjectId: () => window.currentProjectId
  });
  const _0x42e902 = createProjectLifecycle({
    store: _0x22e6f6,
    CanvasTabManager: _0x2a0cf2,
    project: _0x129329,
    loadCustomPresets: _0x56ff12,
    migrateLegacyThumbnailsInMultiData: _0x48caa8,
    sanitizeMultiCanvasDataForPersistence: _0x2e4ac1,
    commit: _0xbd1624,
    patchStoreSourceNodeNamesFromFileName: _0x4d41d6,
    applySourceNamesFromFileNameToCanvas: _0x49928c
  });
  _0x42e902.bindHeaderProjectNameAutoSave();
  _0x42e902.bindPersistRevisionAutoSave();
  registerAppGlobalEvents({
    onBeforeUnload: _0x42e902.onBeforeUnload,
    onPageHide: _0x42e902.onPageHide,
    onVisibilityChange: _0x42e902.onVisibilityChange,
    onDocumentDragEnter: _0x42e902.onDocumentDragEnter,
    onDocumentDragOver: _0x42e902.onDocumentDragOver,
    onDocumentDrop: _0x42e902.onDocumentDrop,
    onBoot: _0x42e902.initApp
  });
  return _0x42e902;
}