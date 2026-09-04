import { saveMediaDownload } from "../../../services/downloadSaveService.js";
import { normalizeLocalPath } from "../../../utils/localMediaPath.js";
import { showMediaSaveSuccessToast } from "../mediaDownloadFeedback.js";
import { resolveNodeMediaDownloadFilename } from "../mediaDownloadFilename.js";
function firstNonEmptyString(..._0x144169) {
  for (const _0x3cff34 of _0x144169) {
    const _0x2316f6 = String(_0x3cff34 || "").trim();
    if (_0x2316f6) {
      return _0x2316f6;
    }
  }
  return "";
}
function normalizeAudioDownloadUrl(_0x1f96c6) {
  const _0x2a8720 = String(_0x1f96c6 || "").trim();
  if (!_0x2a8720) {
    return "";
  }
  if (/^(?:https?:|blob:|data:)/i.test(_0x2a8720)) {
    return _0x2a8720;
  }
  if (_0x2a8720.startsWith("/")) {
    return _0x2a8720;
  }
  return "/" + _0x2a8720.replace(/^\/+/, "");
}
export function resolveAudioDownloadTarget({
  nodeData = {},
  audioElement = null
} = {}) {
  const _0x51cda8 = firstNonEmptyString(nodeData.localPath, nodeData.audioUrl, nodeData.src, nodeData.url, nodeData.resultUrl, audioElement?.currentSrc, audioElement?.src);
  const _0x10ceed = normalizeAudioDownloadUrl(_0x51cda8);
  if (!_0x10ceed) {
    return null;
  }
  return {
    url: _0x10ceed,
    filename: resolveNodeMediaDownloadFilename({
      nodeName: nodeData.name,
      kind: "audio",
      sources: [nodeData.fileName, nodeData.localPath, nodeData.audioUrl, nodeData.src, nodeData.url, nodeData.resultUrl, _0x10ceed],
      fallbackBase: "audio"
    })
  };
}
export function triggerAudioDownload(_0x3e0273, _0x49008f = globalThis.document) {
  if (!_0x3e0273?.url || !_0x49008f?.createElement || !_0x49008f?.body) {
    return false;
  }
  const _0x24a8d8 = _0x49008f.createElement("a");
  _0x24a8d8.href = _0x3e0273.url;
  _0x24a8d8.download = _0x3e0273.filename || "audio.mp3";
  _0x24a8d8.rel = "noopener";
  _0x49008f.body.appendChild(_0x24a8d8);
  _0x24a8d8.click();
  _0x24a8d8.remove?.();
  if (_0x24a8d8.parentNode) {
    _0x24a8d8.parentNode.removeChild(_0x24a8d8);
  }
  return true;
}
export function bindAudioDownloadAction({
  button: _0x1cf476,
  getNodeData: _0x25178d,
  getAudioElement: _0x4b94ea,
  notifyMissing: _0x562420,
  saveMediaFile = saveMediaDownload,
  documentRef = globalThis.document,
  showToast = globalThis.window?.showToast
} = {}) {
  if (!_0x1cf476) {
    return () => {};
  }
  const _0x167c77 = async _0x1e39e3 => {
    _0x1e39e3?.preventDefault?.();
    _0x1e39e3?.stopPropagation?.();
    const _0x3b1e30 = resolveAudioDownloadTarget({
      nodeData: typeof _0x25178d === "function" ? _0x25178d() : {},
      audioElement: typeof _0x4b94ea === "function" ? _0x4b94ea() : null
    });
    if (!_0x3b1e30) {
      if (typeof _0x562420 === "function") {
        _0x562420();
      }
      return;
    }
    if (typeof saveMediaFile !== "function") {
      triggerAudioDownload(_0x3b1e30, documentRef);
      return;
    }
    try {
      const _0x173b09 = await saveMediaFile({
        kind: "audio",
        localPath: normalizeLocalPath(_0x3b1e30.url),
        url: _0x3b1e30.url,
        filename: _0x3b1e30.filename
      });
      if (_0x173b09?.canceled) {
        return;
      }
      if (_0x173b09?.success !== false) {
        showMediaSaveSuccessToast({
          result: _0x173b09,
          kind: "audio",
          showToast: showToast
        });
        return;
      }
      throw new Error(_0x173b09?.error || "音频保存失败");
    } catch (_0x2ac4a7) {
      const _0x28efb9 = String(_0x2ac4a7?.message || _0x2ac4a7 || "音频保存失败");
      if (typeof showToast === "function") {
        showToast(_0x28efb9, "error");
      }
    }
  };
  _0x1cf476.addEventListener("click", _0x167c77);
  return () => _0x1cf476.removeEventListener("click", _0x167c77);
}