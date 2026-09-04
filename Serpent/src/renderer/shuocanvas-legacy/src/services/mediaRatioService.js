import { getAutoMediaSizeByShortSide } from "./fileService.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
export const OUTPUT_RATIO_SWITCH_THRESHOLD = 0.03;
function _toSafeNumber(_0x36e6db) {
  const _0x321b06 = Number(_0x36e6db);
  if (Number.isFinite(_0x321b06)) {
    return _0x321b06;
  } else {
    return 0;
  }
}
function _normalizeDims(_0x2f65a1, _0x2ecc39) {
  const _0xc7e10 = _toSafeNumber(_0x2f65a1);
  const _0x40c9be = _toSafeNumber(_0x2ecc39);
  if (_0xc7e10 <= 0 || _0x40c9be <= 0) {
    return null;
  }
  return {
    width: Math.max(1, Math.round(_0xc7e10)),
    height: Math.max(1, Math.round(_0x40c9be))
  };
}
export function resolveInputRatioBasis(..._0xc8e92b) {
  for (const _0x35c31c of _0xc8e92b) {
    if (!_0x35c31c || typeof _0x35c31c !== "object") {
      continue;
    }
    const _0x4304af = _normalizeDims(_0x35c31c.width, _0x35c31c.height);
    if (_0x4304af) {
      return {
        ..._0x4304af,
        valid: true
      };
    }
  }
  return {
    width: 1,
    height: 1,
    valid: false
  };
}
export function calcDisplaySizeByMedia(_0x57fd0c, _0x59e5ec) {
  const _0x28af4a = resolveInputRatioBasis({
    width: _0x57fd0c,
    height: _0x59e5ec
  });
  return getAutoMediaSizeByShortSide(_0x28af4a.width, _0x28af4a.height);
}
export function shouldSwitchToOutputRatio(_0x5d9b54, _0x263642, _0x4748c6, _0x5bae2b, _0x42b88c = OUTPUT_RATIO_SWITCH_THRESHOLD) {
  const _0x29bf53 = _normalizeDims(_0x5d9b54, _0x263642);
  const _0x545656 = _normalizeDims(_0x4748c6, _0x5bae2b);
  const _0x278368 = Math.max(0, _toSafeNumber(_0x42b88c));
  if (!_0x29bf53 || !_0x545656) {
    return false;
  }
  const _0x25b29a = _0x29bf53.width / _0x29bf53.height;
  const _0x298a40 = _0x545656.width / _0x545656.height;
  if (!Number.isFinite(_0x25b29a) || !Number.isFinite(_0x298a40) || _0x25b29a <= 0) {
    return false;
  }
  const _0x414ed3 = Math.abs(_0x298a40 - _0x25b29a) / _0x25b29a;
  return _0x414ed3 > _0x278368;
}
export function normalizePathToLocalUrl(_0x53930f) {
  const _0x124c94 = String(_0x53930f || "").trim();
  if (!_0x124c94) {
    return "";
  }
  if (_0x124c94.startsWith("http://") || _0x124c94.startsWith("https://") || _0x124c94.startsWith("blob:") || _0x124c94.startsWith("data:")) {
    return _0x124c94;
  }
  return localPathToUrl(_0x124c94);
}
export const IMAGE_NATURAL_SIZE_TIMEOUT_MS = 5000;
export async function readImageNaturalSize(_0x1ecab, _0x4cbc28 = {}) {
  const _0x51afbc = String(_0x1ecab || "").trim();
  if (!_0x51afbc) {
    return null;
  }
  const _0x3d22e6 = Object.prototype.hasOwnProperty.call(_0x4cbc28, "ImageConstructor") ? _0x4cbc28.ImageConstructor : globalThis.Image;
  const _0x3e53e6 = Object.prototype.hasOwnProperty.call(_0x4cbc28, "fetchFn") ? _0x4cbc28.fetchFn : globalThis.fetch;
  const _0x7c42fd = Object.prototype.hasOwnProperty.call(_0x4cbc28, "createImageBitmapFn") ? _0x4cbc28.createImageBitmapFn : globalThis.createImageBitmap;
  const _0x53a81c = typeof _0x3d22e6 === "function";
  const _0x59b456 = typeof _0x3e53e6 === "function" && typeof _0x7c42fd === "function";
  if (!_0x53a81c && !_0x59b456) {
    return null;
  }
  const _0x41285c = Math.max(1, Number(_0x4cbc28.timeoutMs) || IMAGE_NATURAL_SIZE_TIMEOUT_MS);
  return new Promise(_0x2326ed => {
    let _0x333571 = null;
    let _0x235c78 = null;
    let _0x43357c = false;
    let _0x19ca44 = null;
    let _0x77a652 = Number(_0x53a81c) + Number(_0x59b456);
    const _0x35d030 = (_0x237044, {
      cancelLoad = false
    } = {}) => {
      if (_0x43357c) {
        return;
      }
      _0x43357c = true;
      if (_0x19ca44 !== null) {
        clearTimeout(_0x19ca44);
      }
      if (_0x333571) {
        _0x333571.onload = null;
        _0x333571.onerror = null;
      }
      if (_0x235c78) {
        try {
          _0x235c78.abort();
        } catch {}
      }
      if (cancelLoad && _0x333571) {
        try {
          _0x333571.src = "";
        } catch {}
      }
      _0x2326ed(_0x237044);
    };
    const _0x5657a7 = _0x1c6c32 => {
      if (_0x43357c) {
        return;
      }
      const _0x3dc496 = _0x1c6c32 && _normalizeDims(_0x1c6c32.width, _0x1c6c32.height);
      if (_0x3dc496) {
        _0x35d030(_0x3dc496);
        return;
      }
      _0x77a652 -= 1;
      if (_0x77a652 <= 0) {
        _0x35d030(null);
      }
    };
    _0x19ca44 = setTimeout(() => _0x35d030(null, {
      cancelLoad: true
    }), _0x41285c);
    if (_0x53a81c) {
      try {
        _0x333571 = new _0x3d22e6();
        _0x333571.crossOrigin = "anonymous";
        _0x333571.onload = () => _0x5657a7({
          width: _0x333571.naturalWidth || _0x333571.width,
          height: _0x333571.naturalHeight || _0x333571.height
        });
        _0x333571.onerror = () => _0x5657a7(null);
        _0x333571.src = _0x51afbc;
      } catch {
        _0x5657a7(null);
      }
    }
    if (_0x59b456) {
      const _0x1611e4 = globalThis.AbortController;
      _0x235c78 = typeof _0x1611e4 === "function" ? new _0x1611e4() : null;
      Promise.resolve().then(async () => {
        const _0x25c303 = await _0x3e53e6(_0x51afbc, {
          cache: "force-cache",
          ...(_0x235c78 ? {
            signal: _0x235c78.signal
          } : {})
        });
        if (!_0x25c303 || _0x25c303.ok === false || typeof _0x25c303.blob !== "function") {
          return null;
        }
        const _0x463520 = await _0x25c303.blob();
        const _0x52676e = await _0x7c42fd(_0x463520);
        try {
          return {
            width: _0x52676e?.width,
            height: _0x52676e?.height
          };
        } finally {
          _0x52676e?.close?.();
        }
      }).then(_0x5657a7, () => _0x5657a7(null));
    }
  });
}
export async function resolveOutputMediaSize({
  localPath = "",
  imageUrl = "",
  sourceUrl = "",
  thumbUrl = "",
  src = ""
} = {}) {
  const _0x5bf1b0 = normalizePathToLocalUrl(localPath);
  const _0x36a818 = [...new Set([_0x5bf1b0, String(imageUrl || "").trim(), String(sourceUrl || "").trim(), String(thumbUrl || "").trim(), String(src || "").trim()].filter(Boolean))];
  for (const _0x468985 of _0x36a818) {
    const _0x438fae = await readImageNaturalSize(_0x468985);
    if (_0x438fae) {
      return _0x438fae;
    }
  }
  return null;
}