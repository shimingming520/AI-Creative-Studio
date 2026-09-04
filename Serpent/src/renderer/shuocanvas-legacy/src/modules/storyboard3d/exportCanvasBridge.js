function normalizeResults(_0x33f042) {
  return (Array.isArray(_0x33f042) ? _0x33f042 : []).filter(_0x5e7c1b => _0x5e7c1b?.blob instanceof Blob || _0x5e7c1b?.blob?.type).filter(_0x1d125d => String(_0x1d125d.blob.type || "").startsWith("image/"));
}
export function installStoryboard3DExportCanvasBridge({
  windowObject = globalThis.window,
  createMediaNodeFromBlob: _0x3f0b71,
  showToast: _0xa1d1f0
} = {}) {
  if (!windowObject?.addEventListener || typeof _0x3f0b71 !== "function") {
    return () => {};
  }
  const _0x1d579e = async _0x21886a => {
    const _0x344c39 = _0x21886a?.detail || {};
    if (_0x344c39.options?.returnToCanvas === false) {
      return;
    }
    const _0x27aed3 = normalizeResults(_0x344c39.results);
    if (_0x27aed3.length === 0) {
      return;
    }
    let _0x4217ad = 0;
    for (const [_0x134718, _0x35590f] of _0x27aed3.entries()) {
      const _0x1e59e3 = await _0x3f0b71(_0x35590f.blob, _0x35590f.blob.type || "image/png", {
        name: _0x27aed3.length > 1 ? (_0x344c39.projectName || "3D 分镜") + " " + (_0x134718 + 1) : _0x344c39.projectName || "3D 分镜",
        placement: "viewport-center-sequence",
        sequenceKey: "storyboard-3d-export:" + (_0x344c39.projectId || "project")
      });
      if (_0x1e59e3) {
        _0x4217ad += 1;
      }
    }
    if (_0x4217ad > 0) {
      _0xa1d1f0?.("已将 " + _0x4217ad + " 张 3D 分镜添加到画布", "success");
    }
  };
  windowObject.addEventListener("storyboard-3d:export-complete", _0x1d579e);
  return () => windowObject.removeEventListener("storyboard-3d:export-complete", _0x1d579e);
}