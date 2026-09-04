import { logDiagnosticEvent } from "./diagnosticsService.js";
import { t } from "../i18n/index.js";
import { desktopBridge } from "./desktopBridge.js";
export function normalizeHttpExternalUrl(_0x4e9ea4) {
  const _0x2b54d4 = String(_0x4e9ea4 || "").trim();
  if (!_0x2b54d4) {
    return "";
  }
  try {
    const _0x4fd4cd = new URL(_0x2b54d4);
    if (_0x4fd4cd.protocol !== "http:" && _0x4fd4cd.protocol !== "https:") {
      return "";
    }
    _0x4fd4cd.username = "";
    _0x4fd4cd.password = "";
    return _0x4fd4cd.toString();
  } catch {
    return "";
  }
}
function openExternalInBrowser(_0x2efec9) {
  const _0x170650 = document.createElement("a");
  _0x170650.href = _0x2efec9;
  _0x170650.target = "_blank";
  _0x170650.rel = "noopener noreferrer";
  _0x170650.click();
  return {
    ok: true,
    url: _0x2efec9
  };
}
export async function openExternalLink(_0x2bbf9c, _0x1f9929 = {}) {
  const _0x131231 = normalizeHttpExternalUrl(_0x2bbf9c);
  const _0x2c9d08 = String(_0x1f9929.label || t("coreServices.externalLink.externalLink"));
  if (!_0x131231) {
    logDiagnosticEvent({
      type: "external_link.renderer_blocked",
      level: "warn",
      source: "renderer",
      message: "Renderer blocked invalid external link",
      context: {
        label: _0x2c9d08
      }
    });
    throw new Error(t("coreServices.externalLink.blocked"));
  }
  if (desktopBridge.shell.isAvailable()) {
    return await desktopBridge.shell.openExternal(_0x131231);
  }
  return openExternalInBrowser(_0x131231);
}
export async function openExternalLinkWithClipboardFallback(_0x578027, _0x325726 = t("coreServices.externalLink.link")) {
  const _0x521abd = normalizeHttpExternalUrl(_0x578027);
  if (!_0x521abd) {
    throw new Error(t("coreServices.externalLink.missing", {
      label: _0x325726
    }));
  }
  try {
    await openExternalLink(_0x521abd, {
      label: _0x325726
    });
    return true;
  } catch {
    try {
      await navigator.clipboard?.writeText?.(_0x521abd);
      return false;
    } catch {
      return false;
    }
  }
}
export function initExternalLinkHandlers(_0x3156f8 = document) {
  if (globalThis.window?.__aiCanvasExternalLinksInstalled) {
    return;
  }
  globalThis.window.__aiCanvasExternalLinksInstalled = true;
  _0x3156f8.addEventListener("click", _0x545b07 => {
    const _0x486a07 = _0x545b07.target?.closest?.("[data-external-url],a[href^='http://'],a[href^='https://']");
    if (!_0x486a07) {
      return;
    }
    const _0x7873c5 = _0x486a07.dataset?.externalUrl || _0x486a07.getAttribute?.("href") || "";
    if (!_0x7873c5) {
      return;
    }
    _0x545b07.preventDefault();
    openExternalLink(_0x7873c5, {
      label: _0x486a07.getAttribute?.("aria-label") || _0x486a07.getAttribute?.("title") || t("coreServices.externalLink.externalLink")
    }).catch(_0x1ee6ba => {
      globalThis.window?.showToast?.(_0x1ee6ba?.message || t("coreServices.externalLink.openFailed"), "error");
    });
  });
}