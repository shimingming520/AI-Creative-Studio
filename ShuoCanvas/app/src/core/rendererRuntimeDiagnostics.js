function getWindowLike() {
  if (typeof window !== "undefined") {
    return window;
  } else {
    return globalThis;
  }
}
export function isRendererRuntimeDiagnosticsEnabled() {
  const _0x438bf9 = getWindowLike();
  return _0x438bf9?.__runtimeCompareRendererDiagnosticsEnabled === true && typeof _0x438bf9?.__runtimeCompareRecordRendererDiagnostic === "function";
}
export function recordRendererRuntimeDiagnostic(_0x552965 = {}) {
  const _0x1b0016 = getWindowLike();
  if (_0x1b0016?.__runtimeCompareRendererDiagnosticsEnabled !== true || typeof _0x1b0016?.__runtimeCompareRecordRendererDiagnostic !== "function") {
    return null;
  }
  return _0x1b0016.__runtimeCompareRecordRendererDiagnostic(_0x552965);
}
export function installRendererRuntimeDiagnosticAccess(_0x39a353) {
  const _0x354472 = getWindowLike();
  if (_0x354472?.__runtimeCompareRendererDiagnosticsEnabled !== true || typeof _0x39a353 !== "function") {
    return false;
  }
  _0x354472.__runtimeCompareGetRendererNodeDiagnosticState = _0x3814c9 => {
    const _0x533248 = _0x39a353(String(_0x3814c9 || ""));
    if (_0x533248 && typeof _0x533248 === "object") {
      return {
        ..._0x533248
      };
    } else {
      return null;
    }
  };
  return true;
}