import { t } from "../../../i18n/index.js";
import { showMediaSaveSuccessToast } from "../mediaDownloadFeedback.js";
import { resolveNodeMediaDownloadFilename } from "../mediaDownloadFilename.js";
function toolbarText(_0x41ad82) {
  return t("nodeToolbar.common." + _0x41ad82);
}
export function bindVideoDownloadAction(_0x14612d) {
  const {
    toolbarEl: _0x2c7b59,
    fetchRemoteBlob: _0xe69834,
    _triggerHrefDownload: _0x592df2,
    _isProbablyLocalUrl: _0x52519b,
    _getCurrentVideoUrl: _0x54faa7,
    _getCurrentVideoLocalPath: _0x48a950,
    _getLatestNodeData: _0x3cc8aa,
    saveMediaFile: _0x441959,
    showToast = globalThis.window?.showToast
  } = _0x14612d;
  const _0x28e3e1 = _0x2c7b59.querySelector(".act-download");
  if (_0x28e3e1) {
    _0x28e3e1.addEventListener("click", async _0xa20983 => {
      _0xa20983.stopPropagation();
      const _0x3d7e42 = _0x54faa7();
      if (!_0x3d7e42) {
        alert(toolbarText("noDownloadableVideo"));
        return;
      }
      const _0x3f188b = _0x3cc8aa?.() || {};
      const _0xcb638a = resolveNodeMediaDownloadFilename({
        nodeName: _0x3f188b.name,
        kind: "video",
        sources: [_0x3f188b.fileName, _0x3d7e42],
        fallbackBase: "video_" + Date.now()
      });
      if (typeof _0x441959 === "function") {
        try {
          const _0x10ca29 = await _0x441959({
            kind: "video",
            localPath: _0x48a950?.() || "",
            url: _0x3d7e42,
            filename: _0xcb638a
          });
          if (_0x10ca29?.canceled) {
            return;
          }
          if (_0x10ca29?.success !== false) {
            showMediaSaveSuccessToast({
              result: _0x10ca29,
              kind: "video",
              showToast: showToast
            });
            return;
          }
          throw new Error(_0x10ca29?.error || "视频保存失败");
        } catch (_0x3e9f05) {
          const _0x330ba6 = String(_0x3e9f05?.message || _0x3e9f05 || "视频保存失败");
          if (typeof showToast === "function") {
            showToast(_0x330ba6, "error");
          } else {
            alert(_0x330ba6);
          }
          return;
        }
      }
      if (_0x52519b(_0x3d7e42)) {
        _0x592df2(_0x3d7e42, _0xcb638a);
        return;
      }
      try {
        const _0x15cdae = new AbortController();
        const _0x4963cd = setTimeout(() => _0x15cdae.abort(), 20000);
        const _0x23736d = await _0xe69834(_0x3d7e42, {
          signal: _0x15cdae.signal
        });
        clearTimeout(_0x4963cd);
        const _0x52f347 = window.URL.createObjectURL(_0x23736d);
        _0x592df2(_0x52f347, _0xcb638a);
        setTimeout(() => window.URL.revokeObjectURL(_0x52f347), 1500);
      } catch {
        _0x592df2(_0x3d7e42, _0xcb638a);
      }
    });
  }
}