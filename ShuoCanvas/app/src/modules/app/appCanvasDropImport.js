import { hasNodeManagerDragType } from "../nodeManager/nodeManagerDragContract.js";
export async function runAppCanvasFileImport({
  event: _0x22edd8,
  projectId: _0x19571f,
  handleFileDrop: _0x12b247,
  commit: _0x9c79aa
} = {}) {
  const _0x64223e = await _0x12b247?.(_0x22edd8, _0x19571f || "default_v2_project");
  if (_0x64223e) {
    _0x9c79aa?.();
  }
  return _0x64223e === true;
}
export function openAppCanvasFilePicker({
  documentObject = typeof document === "undefined" ? null : document,
  projectId: _0x5ee192,
  handleFileDrop: _0x4bacb0,
  commit: _0x55bcb7,
  clientX = 0,
  clientY = 0,
  onUnsupported: _0x4fad39,
  onError: _0x4642d7
} = {}) {
  if (typeof documentObject?.createElement !== "function" || typeof documentObject?.body?.appendChild !== "function") {
    return false;
  }
  const _0x15c23a = documentObject.createElement("input");
  _0x15c23a.type = "file";
  _0x15c23a.accept = "image/*,video/*,audio/*";
  _0x15c23a.style.position = "fixed";
  _0x15c23a.style.left = "-9999px";
  _0x15c23a.style.top = "-9999px";
  _0x15c23a.style.opacity = "0";
  let _0x5efecd = false;
  const _0x167ac3 = () => {
    if (_0x5efecd) {
      return;
    }
    _0x5efecd = true;
    _0x15c23a.remove?.();
  };
  _0x15c23a.addEventListener?.("cancel", _0x167ac3, {
    once: true
  });
  _0x15c23a.addEventListener?.("change", _0x4e0e38 => {
    const _0x37762a = Array.from(_0x4e0e38?.target?.files || []);
    _0x167ac3();
    if (_0x37762a.length === 0) {
      return;
    }
    const _0x4c28ef = {
      dataTransfer: {
        files: _0x37762a
      },
      clientX: Number.isFinite(Number(clientX)) ? Number(clientX) : 0,
      clientY: Number.isFinite(Number(clientY)) ? Number(clientY) : 0,
      preventDefault() {},
      stopPropagation() {}
    };
    runAppCanvasFileImport({
      event: _0x4c28ef,
      projectId: _0x5ee192,
      handleFileDrop: _0x4bacb0,
      commit: _0x55bcb7
    }).then(_0x480c00 => {
      if (!_0x480c00) {
        _0x4fad39?.();
      }
    }).catch(_0xba4c21 => {
      _0x4642d7?.(_0xba4c21);
    });
  }, {
    once: true
  });
  try {
    documentObject.body.appendChild(_0x15c23a);
    _0x15c23a.click();
    return true;
  } catch (_0x138b13) {
    _0x167ac3();
    _0x4642d7?.(_0x138b13);
    return false;
  }
}
function isCanvasDropBlocked(_0x52ecf8) {
  return Boolean(_0x52ecf8?.target?.closest?.("[data-ui-stop=\"1\"]"));
}
export function installAppCanvasDropImport({
  targetEl: _0x1afbd2,
  handleFileDrop: _0x2c07f9,
  handleWebImageUrlDrop: _0x3a0852,
  commit: _0x5c398e,
  getCurrentProjectId: _0x58a97d
} = {}) {
  if (!_0x1afbd2) {
    return () => {};
  }
  const _0x346aaa = _0x3f2206 => {
    if (hasNodeManagerDragType(_0x3f2206?.dataTransfer)) {
      return;
    }
    if (isCanvasDropBlocked(_0x3f2206)) {
      return;
    }
    _0x3f2206.preventDefault();
  };
  const _0x47fcc3 = async _0xf7e33b => {
    if (hasNodeManagerDragType(_0xf7e33b?.dataTransfer)) {
      return;
    }
    if (isCanvasDropBlocked(_0xf7e33b)) {
      return;
    }
    const _0x4d0e80 = _0x58a97d?.() || "default_v2_project";
    const _0x396de5 = await runAppCanvasFileImport({
      event: _0xf7e33b,
      projectId: _0x4d0e80,
      handleFileDrop: _0x2c07f9,
      commit: _0x5c398e
    });
    if (_0x396de5) {
      return;
    }
    const _0x250fc5 = await _0x3a0852?.(_0xf7e33b, {
      projectId: _0x4d0e80
    });
    if (_0x250fc5) {
      _0x5c398e?.();
    }
  };
  _0x1afbd2.addEventListener("dragover", _0x346aaa);
  _0x1afbd2.addEventListener("drop", _0x47fcc3);
  return () => {
    _0x1afbd2.removeEventListener("dragover", _0x346aaa);
    _0x1afbd2.removeEventListener("drop", _0x47fcc3);
  };
}