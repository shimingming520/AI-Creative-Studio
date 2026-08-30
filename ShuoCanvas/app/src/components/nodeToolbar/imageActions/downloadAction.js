import { t } from "../../../i18n/index.js";
import { showMediaSaveSuccessToast } from "../mediaDownloadFeedback.js";
import { resolveNodeMediaDownloadFilename } from "../mediaDownloadFilename.js";
function toolbarText(_0x482a1d) {
  return t("nodeToolbar.common." + _0x482a1d);
}
export function bindImageDownloadAction(_0xcbf178) {
  const {
    toolbarEl: _0x2bfdc9,
    getNodeData: _0x5cfc52,
    getImage: _0x434e7e,
    localPathToUrl: _0x2d9c15,
    fetchRemoteBlob: _0x274615,
    saveMediaFile: _0x21a8ea,
    showToast = globalThis.window?.showToast
  } = _0xcbf178;
  const _0x235f07 = _0x2bfdc9.querySelector(".act-download");
  if (_0x235f07) {
    _0x235f07.addEventListener("click", async _0x393aa6 => {
      _0x393aa6.stopPropagation();
      const _0x2c8e59 = _0x5cfc52();
      if (!_0x2c8e59) {
        alert(toolbarText("nodeMissing"));
        return;
      }
      const _0x2f4850 = _0x355d89 => {
        const _0x14c535 = String(_0x355d89 || "").trim();
        if (!_0x14c535) {
          return "";
        }
        if (_0x14c535.startsWith("http://") || _0x14c535.startsWith("https://") || _0x14c535.startsWith("blob:") || _0x14c535.startsWith("data:")) {
          return _0x14c535;
        }
        if (_0x14c535.startsWith("/")) {
          return _0x14c535;
        }
        return _0x2d9c15(_0x14c535) || "/" + _0x14c535.replace(/^\/+/, "");
      };
      const _0x45d62c = _0x5bc38b => {
        const _0x28dd88 = String(_0x5bc38b || "").trim();
        if (!_0x28dd88) {
          return false;
        }
        if (_0x28dd88.startsWith("/") && !_0x28dd88.startsWith("//")) {
          return true;
        }
        try {
          const _0x4d4303 = new URL(_0x28dd88, window.location.href);
          return _0x4d4303.origin === window.location.origin;
        } catch {
          return false;
        }
      };
      const _0xb69246 = _0x4ac16c => {
        const _0x49db0a = String(_0x4ac16c || "").trim();
        if (!_0x49db0a) {
          return "";
        }
        try {
          const _0x366591 = new URL(_0x49db0a, window.location.href);
          if (_0x366591.protocol === "http:" || _0x366591.protocol === "https:") {
            return _0x366591.href;
          } else {
            return "";
          }
        } catch {
          return "";
        }
      };
      const _0x14393a = _0x59f113 => {
        return resolveNodeMediaDownloadFilename({
          nodeName: _0x2c8e59.name,
          kind: "image",
          sources: [_0x2c8e59.fileName, _0x59f113],
          fallbackBase: "image_" + Date.now()
        });
      };
      const _0x2e243c = (_0x3675f5, _0x27d04f) => {
        const _0x5eead0 = document.createElement("a");
        _0x5eead0.href = _0x3675f5;
        _0x5eead0.download = _0x27d04f;
        _0x5eead0.rel = "noopener";
        document.body.appendChild(_0x5eead0);
        _0x5eead0.click();
        _0x5eead0.remove();
      };
      const _0x5241db = _0x2f4850(_0x2c8e59.localPath) || (_0x45d62c(_0x2c8e59.src) ? _0x2c8e59.src : "");
      const _0x3ceb1b = /^(?:https?:)?\/\//i.test(String(_0x2c8e59.remoteFallbackUrl || "").trim()) ? String(_0x2c8e59.remoteFallbackUrl || "").trim() : "";
      const _0x3b52eb = _0x3ceb1b || _0x2c8e59.sourceUrl || _0x2c8e59.src || _0x2c8e59.resultUrl || _0x2c8e59.imageUrl || _0x2c8e59.thumbUrl;
      const _0x5b3fbb = _0x14393a(_0x5241db || _0x3b52eb);
      if (!_0x5241db && !_0x3b52eb && !_0x2c8e59.sourceId) {
        alert(toolbarText("noDownloadableImage"));
        return;
      }
      const _0x566baf = _0x5241db ? _0x2c8e59.localPath || _0x5241db : _0x45d62c(_0x3b52eb) ? _0x3b52eb : "";
      const _0x122012 = _0x566baf ? _0x5241db || _0x3b52eb : _0xb69246(_0x3b52eb);
      if (typeof _0x21a8ea === "function" && (_0x566baf || _0x122012)) {
        try {
          const _0x14ac0c = await _0x21a8ea({
            kind: "image",
            localPath: _0x566baf,
            url: _0x122012,
            filename: _0x5b3fbb
          });
          if (_0x14ac0c?.canceled) {
            return;
          }
          if (_0x14ac0c?.success !== false) {
            showMediaSaveSuccessToast({
              result: _0x14ac0c,
              kind: "image",
              showToast: showToast
            });
            return;
          }
          throw new Error(_0x14ac0c?.error || "图片保存失败");
        } catch (_0x4d3858) {
          const _0x4a367a = String(_0x4d3858?.message || _0x4d3858 || "图片保存失败");
          if (typeof showToast === "function") {
            showToast(_0x4a367a, "error");
          } else {
            alert(_0x4a367a);
          }
          return;
        }
      }
      if (_0x5241db) {
        _0x2e243c(_0x5241db, _0x5b3fbb);
        return;
      }
      if (_0x2c8e59.sourceId) {
        let _0x5dc41a = null;
        try {
          _0x5dc41a = await _0x434e7e(_0x2c8e59.sourceId);
        } catch {}
        if (_0x5dc41a) {
          if (typeof _0x21a8ea === "function") {
            try {
              const _0x387c9b = await _0x21a8ea({
                kind: "image",
                blob: _0x5dc41a,
                filename: _0x5b3fbb
              });
              if (_0x387c9b?.canceled) {
                return;
              }
              if (_0x387c9b?.success !== false) {
                showMediaSaveSuccessToast({
                  result: _0x387c9b,
                  kind: "image",
                  showToast: showToast
                });
                return;
              }
              throw new Error(_0x387c9b?.error || "图片保存失败");
            } catch (_0xd333d6) {
              const _0x13a863 = String(_0xd333d6?.message || _0xd333d6 || "图片保存失败");
              if (typeof showToast === "function") {
                showToast(_0x13a863, "error");
              } else {
                alert(_0x13a863);
              }
              return;
            }
          }
          const _0x3cc85c = window.URL.createObjectURL(_0x5dc41a);
          _0x2e243c(_0x3cc85c, _0x5b3fbb);
          setTimeout(() => window.URL.revokeObjectURL(_0x3cc85c), 1000);
          return;
        }
      }
      if (!_0x3b52eb) {
        alert(toolbarText("noDownloadableImage"));
        return;
      }
      if (_0x45d62c(_0x3b52eb)) {
        _0x2e243c(_0x3b52eb, _0x5b3fbb);
        return;
      }
      try {
        const _0x471ddc = new AbortController();
        const _0x1914c2 = setTimeout(() => _0x471ddc.abort(), 15000);
        const _0x1ac4d5 = await _0x274615(_0x3b52eb, {
          signal: _0x471ddc.signal
        });
        clearTimeout(_0x1914c2);
        const _0x45a445 = window.URL.createObjectURL(_0x1ac4d5);
        _0x2e243c(_0x45a445, _0x5b3fbb);
        setTimeout(() => window.URL.revokeObjectURL(_0x45a445), 1000);
      } catch {
        _0x2e243c(_0x3b52eb, _0x5b3fbb);
      }
    });
  }
}