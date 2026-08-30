export function registerAppGlobalEvents({
  onBeforeUnload: _0x1f12de,
  onPageHide: _0x4e95c3,
  onVisibilityChange: _0x3c578f,
  onDocumentDragEnter: _0x3aa020,
  onDocumentDragOver: _0x1102f0,
  onDocumentDrop: _0x416016,
  onBoot: _0xc3948
}) {
  if (typeof _0x1f12de === "function") {
    window.addEventListener("beforeunload", _0x1f12de);
  }
  if (typeof _0x4e95c3 === "function") {
    window.addEventListener("pagehide", _0x4e95c3);
  }
  if (typeof _0x3c578f === "function") {
    document.addEventListener("visibilitychange", _0x3c578f);
  }
  if (typeof _0x3aa020 === "function") {
    document.addEventListener("dragenter", _0x3aa020);
  }
  if (typeof _0x1102f0 === "function") {
    document.addEventListener("dragover", _0x1102f0);
  }
  if (typeof _0x416016 === "function") {
    document.addEventListener("drop", _0x416016);
  }
  if (typeof _0xc3948 === "function") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", _0xc3948, {
        once: true
      });
    } else {
      _0xc3948();
    }
  }
}