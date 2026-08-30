import { getPerfProbeSnapshot, setPerfProbeEnabled } from "../modules/perf/perfProbe.js";
import { t } from "../i18n/index.js";
import { desktopBridge } from "./desktopBridge.js";
const MAX_CONTEXT_STRING_LENGTH = 1200;
const MAX_CONTEXT_DEPTH = 5;
const RESOURCE_ERROR_DEDUP_MS = 30000;
const MAX_RESOURCE_ERROR_KEYS = 100;
function getDiagnosticsApi() {
  if (desktopBridge.diagnostics.isAvailable()) {
    return desktopBridge.diagnostics;
  } else {
    return null;
  }
}
function toMessage(_0x32ad57, _0x225ac1 = "Unknown error") {
  if (typeof _0x32ad57 === "string") {
    return _0x32ad57;
  }
  if (_0x32ad57?.message) {
    return String(_0x32ad57.message);
  }
  return String(_0x32ad57 || _0x225ac1);
}
function normalizeContextValue(_0x2941fa, _0x15946d = 0) {
  if (_0x2941fa == null) {
    return _0x2941fa;
  }
  if (typeof _0x2941fa === "string") {
    if (_0x2941fa.length <= MAX_CONTEXT_STRING_LENGTH) {
      return _0x2941fa;
    }
    return _0x2941fa.slice(0, MAX_CONTEXT_STRING_LENGTH) + "...";
  }
  if (typeof _0x2941fa === "number" || typeof _0x2941fa === "boolean") {
    return _0x2941fa;
  }
  if (typeof _0x2941fa !== "object") {
    return String(_0x2941fa);
  }
  if (_0x15946d >= MAX_CONTEXT_DEPTH) {
    return "[Object]";
  }
  if (_0x2941fa instanceof Error) {
    const _0x2ace17 = {
      name: _0x2941fa.name || "Error",
      message: _0x2941fa.message || "",
      stack: _0x2941fa.stack || ""
    };
    for (const _0x471bf4 of ["type", "provider", "code", "status", "retryable"]) {
      const _0x2789a0 = _0x2941fa[_0x471bf4];
      if (_0x2789a0 !== undefined && _0x2789a0 !== null && ["string", "number", "boolean"].includes(typeof _0x2789a0)) {
        _0x2ace17[_0x471bf4] = _0x2789a0;
      }
    }
    return _0x2ace17;
  }
  if (Array.isArray(_0x2941fa)) {
    return _0x2941fa.slice(0, 20).map(_0x599de9 => normalizeContextValue(_0x599de9, _0x15946d + 1));
  }
  const _0x452d62 = {};
  Object.entries(_0x2941fa).slice(0, 50).forEach(([_0x398df3, _0x4f25f8]) => {
    _0x452d62[_0x398df3] = normalizeContextValue(_0x4f25f8, _0x15946d + 1);
  });
  return _0x452d62;
}
function summarizeResourceReference(_0x15329c) {
  const _0x37f5f1 = String(_0x15329c || "").trim();
  if (!_0x37f5f1) {
    return {
      present: false
    };
  }
  const _0x37a741 = _0x37f5f1.split(/[?#]/, 1)[0] || "";
  const _0x344d21 = _0x37a741.match(/\.([a-z0-9]{1,8})$/i);
  const _0x3efc14 = _0x37f5f1.match(/^([a-z][a-z0-9+.-]*):/i);
  return {
    present: true,
    scheme: _0x3efc14?.[1]?.toLowerCase() || "relative",
    extension: _0x344d21 ? "." + _0x344d21[1].toLowerCase() : "",
    length: _0x37f5f1.length
  };
}
function getResourceElementReference(_0x31899c) {
  return _0x31899c?.currentSrc || _0x31899c?.src || _0x31899c?.href || _0x31899c?.getAttribute?.("src") || _0x31899c?.getAttribute?.("href") || _0x31899c?.getAttribute?.("poster") || "";
}
export function logDiagnosticEvent(_0x1d6df0 = {}) {
  const _0x4c6f8b = getDiagnosticsApi();
  if (typeof _0x4c6f8b?.logEvent !== "function") {
    return Promise.resolve({
      ok: false
    });
  }
  const _0x4c45c1 = _0x1d6df0.error instanceof Error ? _0x1d6df0.error : null;
  const _0x3ebe16 = normalizeContextValue(_0x1d6df0.context || {});
  if (_0x4c45c1 && _0x3ebe16 && typeof _0x3ebe16 === "object" && !Array.isArray(_0x3ebe16)) {
    _0x3ebe16.error = normalizeContextValue(_0x4c45c1);
  }
  const _0x2c4246 = {
    type: String(_0x1d6df0.type || "renderer.event"),
    level: String(_0x1d6df0.level || "info"),
    source: String(_0x1d6df0.source || "renderer"),
    message: String(_0x1d6df0.message || toMessage(_0x4c45c1 || _0x1d6df0.error, "Renderer event")),
    context: _0x3ebe16,
    stack: String(_0x1d6df0.stack || _0x4c45c1?.stack || "")
  };
  try {
    return Promise.resolve(_0x4c6f8b.logEvent(_0x2c4246)).catch(() => ({
      ok: false
    }));
  } catch {
    return Promise.resolve({
      ok: false
    });
  }
}
export function logDeveloperDiagnosticEvent(_0x2d2a5c = {}, {
  windowObject = globalThis.window,
  logEvent = logDiagnosticEvent
} = {}) {
  if (windowObject?.AI_CANVAS_IS_DEV_BUILD !== true) {
    return Promise.resolve({
      ok: false,
      skipped: true
    });
  }
  try {
    return Promise.resolve(logEvent(_0x2d2a5c)).catch(() => ({
      ok: false
    }));
  } catch {
    return Promise.resolve({
      ok: false
    });
  }
}
export function logPerformanceSnapshot(_0x24437d = "manual") {
  const _0x20ef7e = String(_0x24437d || "manual").trim() || "manual";
  return logDiagnosticEvent({
    type: "performance.snapshot",
    level: "info",
    source: "renderer",
    message: "Canvas performance snapshot",
    context: {
      reason: _0x20ef7e,
      snapshot: getPerfProbeSnapshot()
    }
  });
}
export async function createDiagnosticsPackage(_0x1de7ff = {}) {
  const _0x27d5d3 = getDiagnosticsApi();
  if (typeof _0x27d5d3?.createPackage !== "function") {
    throw new Error(t("coreServices.diagnostics.packageUnsupported"));
  }
  return await _0x27d5d3.createPackage(_0x1de7ff && typeof _0x1de7ff === "object" ? _0x1de7ff : {});
}
export async function openDiagnosticsLogsFolder() {
  const _0x262f95 = getDiagnosticsApi();
  if (typeof _0x262f95?.openLogsFolder !== "function") {
    throw new Error(t("coreServices.diagnostics.logsUnsupported"));
  }
  return await _0x262f95.openLogsFolder();
}
export function canUseDiagnostics() {
  const _0x1af816 = getDiagnosticsApi();
  return !!_0x1af816 && typeof _0x1af816.logEvent === "function" && typeof _0x1af816.createPackage === "function" && typeof _0x1af816.openLogsFolder === "function";
}
export function initDiagnosticsService() {
  if (globalThis.window?.__aiCanvasDiagnosticsInstalled) {
    return;
  }
  if (!canUseDiagnostics()) {
    return;
  }
  const _0x331fe7 = globalThis.window;
  _0x331fe7.__aiCanvasDiagnosticsInstalled = true;
  setPerfProbeEnabled(true);
  _0x331fe7.addEventListener("error", _0x1eb15d => {
    logDiagnosticEvent({
      type: "renderer.window_error",
      level: "error",
      source: "renderer",
      message: _0x1eb15d?.message || "Renderer window error",
      error: _0x1eb15d?.error,
      context: {
        filename: _0x1eb15d?.filename || "",
        lineno: _0x1eb15d?.lineno || 0,
        colno: _0x1eb15d?.colno || 0
      }
    });
  });
  _0x331fe7.addEventListener("unhandledrejection", _0x19ce98 => {
    const _0x3a1250 = _0x19ce98?.reason;
    logDiagnosticEvent({
      type: "renderer.unhandled_rejection",
      level: "error",
      source: "renderer",
      message: toMessage(_0x3a1250, "Renderer unhandled rejection"),
      error: _0x3a1250 instanceof Error ? _0x3a1250 : null,
      context: _0x3a1250 instanceof Error ? {} : {
        reason: toMessage(_0x3a1250)
      }
    });
  });
  const _0x50f03e = new Map();
  _0x331fe7.addEventListener("error", _0x26c52e => {
    const _0x9db28 = _0x26c52e?.target;
    if (!_0x9db28 || _0x9db28 === _0x331fe7) {
      return;
    }
    const _0x5eb9f6 = String(_0x9db28?.tagName || "resource").toLowerCase();
    const _0x24c2de = getResourceElementReference(_0x9db28);
    const _0x184b24 = summarizeResourceReference(_0x24c2de);
    const _0x52bcc6 = _0x9db28?.closest?.(".v2-node");
    const _0x5497c8 = String(_0x52bcc6?.dataset?.nodeId || _0x52bcc6?.id || "");
    const _0x33d4de = _0x5eb9f6 + ":" + _0x5497c8 + ":" + _0x24c2de;
    const _0x342526 = Date.now();
    const _0x1dbb86 = _0x50f03e.get(_0x33d4de) || 0;
    if (_0x342526 - _0x1dbb86 < RESOURCE_ERROR_DEDUP_MS) {
      return;
    }
    _0x50f03e.set(_0x33d4de, _0x342526);
    if (_0x50f03e.size > MAX_RESOURCE_ERROR_KEYS) {
      _0x50f03e.delete(_0x50f03e.keys().next().value);
    }
    logDiagnosticEvent({
      type: "renderer.resource_load_failed",
      level: "warn",
      source: "renderer",
      message: _0x5eb9f6 + " resource failed to load",
      context: {
        tagName: _0x5eb9f6,
        nodeId: _0x5497c8,
        resource: _0x184b24
      }
    });
  }, true);
  _0x331fe7.addEventListener("securitypolicyviolation", _0xc745b4 => {
    logDiagnosticEvent({
      type: "renderer.security_policy_violation",
      level: "warn",
      source: "renderer",
      message: "Renderer security policy violation",
      context: {
        effectiveDirective: _0xc745b4?.effectiveDirective || "",
        violatedDirective: _0xc745b4?.violatedDirective || "",
        blockedResource: summarizeResourceReference(_0xc745b4?.blockedURI || ""),
        lineNumber: Number(_0xc745b4?.lineNumber || 0) || 0,
        columnNumber: Number(_0xc745b4?.columnNumber || 0) || 0
      }
    });
  });
  _0x331fe7.addEventListener("offline", () => {
    logDiagnosticEvent({
      type: "renderer.network_offline",
      level: "warn",
      source: "renderer",
      message: "Browser network state changed to offline"
    });
  });
  _0x331fe7.addEventListener("online", () => {
    logDiagnosticEvent({
      type: "renderer.network_online",
      level: "info",
      source: "renderer",
      message: "Browser network state changed to online"
    });
  });
  logDiagnosticEvent({
    type: "renderer.diagnostics_ready",
    level: "info",
    source: "renderer",
    message: "Renderer diagnostics service initialized",
    context: {
      href: _0x331fe7.location?.href || globalThis.location?.href || "",
      userAgent: _0x331fe7.navigator?.userAgent || globalThis.navigator?.userAgent || ""
    }
  });
}