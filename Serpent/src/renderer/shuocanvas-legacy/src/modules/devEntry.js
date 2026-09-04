import { onLocaleChange, t } from "../i18n/index.js";
import { isPreviewModeEnabled, setPreviewMode } from "./previewMode.js";
import { bindPreviewUploadEntry } from "./previewUploadEntry.js";
const DEV_ENTRY_WRAP_ID = "devEntryWrap";
const LEGACY_DEV_HELPER_ID = "dev-shortcut-btn";
let syncBound = false;
let localeUnsubscribe = null;
function devEntryText(_0x5ee0a1, _0x247c41 = {}) {
  return t("devEntry." + _0x5ee0a1, _0x247c41);
}
function setToggleButtonState(_0x3bd05b, _0x515bc2, _0x41ba34) {
  if (!_0x3bd05b) {
    return;
  }
  _0x3bd05b.classList.toggle("is-active", _0x515bc2 === true);
  _0x3bd05b.setAttribute("aria-pressed", _0x515bc2 === true ? "true" : "false");
  _0x3bd05b.title = _0x515bc2 === true ? _0x41ba34.on : _0x41ba34.off;
}
function setDevButtonState(_0x4d6360, _0x475afd) {
  setToggleButtonState(_0x4d6360, _0x475afd, {
    on: devEntryText("titles.devOn"),
    off: devEntryText("titles.devOff")
  });
}
function setPreviewButtonState(_0x103f7d, _0x1e14eb) {
  setToggleButtonState(_0x103f7d, _0x1e14eb, {
    on: devEntryText("titles.previewOn"),
    off: devEntryText("titles.previewOff")
  });
}
function broadcastDevMode(_0x297e8e) {
  try {
    window.dispatchEvent(new CustomEvent("dev-mode-changed", {
      detail: {
        enabled: _0x297e8e === true
      }
    }));
  } catch {}
}
function setDevMode(_0x39faf6, _0x53eb53) {
  const _0x1f0210 = _0x39faf6 === true;
  window.DEV_MODE = _0x1f0210;
  document.body?.classList?.toggle("dev-mode", _0x1f0210);
  setDevButtonState(_0x53eb53, _0x1f0210);
  broadcastDevMode(_0x1f0210);
}
export function toggleDevMode() {
  if (window.LOCAL_DEV_BUILD !== true) {
    return null;
  }
  const _0x400be3 = !Boolean(window.DEV_MODE);
  setDevMode(_0x400be3, document.getElementById("devEntryModeBtn"));
  window.showToast?.(_0x400be3 ? devEntryText("toasts.devOn") : devEntryText("toasts.devOff"));
  return _0x400be3;
}
function createEntryButton({
  id: _0x5ec66e,
  label: _0x5672ad,
  title: _0x129bf8,
  className = ""
}) {
  const _0x16b718 = document.createElement("button");
  _0x16b718.type = "button";
  _0x16b718.id = _0x5ec66e;
  _0x16b718.className = ("dev-entry-btn " + className).trim();
  _0x16b718.title = _0x129bf8;
  _0x16b718.setAttribute("aria-label", _0x129bf8);
  _0x16b718.textContent = _0x5672ad;
  return _0x16b718;
}
function setButtonTextAndTitle(_0x245f04, _0xf712b9, _0x402d62) {
  if (!_0x245f04) {
    return;
  }
  _0x245f04.textContent = _0xf712b9;
  _0x245f04.title = _0x402d62;
  _0x245f04.setAttribute("aria-label", _0x402d62);
}
function syncDevEntryTexts() {
  const _0x4cdc90 = document.getElementById("devEntryModeBtn");
  setButtonTextAndTitle(_0x4cdc90, devEntryText("buttons.dev"), devEntryText("titles.devOff"));
  setDevButtonState(_0x4cdc90, Boolean(window.DEV_MODE));
  const _0x102960 = document.getElementById("devEntryPreviewModeBtn");
  setButtonTextAndTitle(_0x102960, devEntryText("buttons.preview"), devEntryText("titles.previewOff"));
  setPreviewButtonState(_0x102960, isPreviewModeEnabled());
  setButtonTextAndTitle(document.getElementById("devEntryPreviewUploadBtn"), devEntryText("buttons.upload"), devEntryText("titles.upload"));
}
function bindLocaleSync() {
  if (localeUnsubscribe) {
    return;
  }
  localeUnsubscribe = onLocaleChange(syncDevEntryTexts);
}
function bindExternalModeSync() {
  if (syncBound) {
    return;
  }
  syncBound = true;
  window.addEventListener("dev-mode-changed", _0x188efa => {
    const _0x53f823 = Boolean(_0x188efa?.detail?.enabled ?? window.DEV_MODE);
    setDevButtonState(document.getElementById("devEntryModeBtn"), _0x53f823);
  });
  window.addEventListener("preview-mode-changed", _0xa50dde => {
    const _0x2bb19d = Boolean(_0xa50dde?.detail?.enabled ?? globalThis.window?.PREVIEW_MODE);
    setPreviewButtonState(document.getElementById("devEntryPreviewModeBtn"), _0x2bb19d);
  });
}
function removeDevEntries() {
  localeUnsubscribe?.();
  localeUnsubscribe = null;
  document.getElementById(DEV_ENTRY_WRAP_ID)?.remove();
  document.getElementById(LEGACY_DEV_HELPER_ID)?.remove();
}
export function initDevEntries({
  isDevBuild: _0x34a560
} = {}) {
  document.getElementById(LEGACY_DEV_HELPER_ID)?.remove();
  const _0x108b38 = Boolean(_0x34a560);
  window.LOCAL_DEV_BUILD = _0x108b38;
  document.body?.classList?.toggle("dev-build", _0x108b38);
  if (!_0x108b38) {
    setPreviewMode(false);
    removeDevEntries();
    return;
  }
  bindExternalModeSync();
  if (document.getElementById(DEV_ENTRY_WRAP_ID)) {
    return;
  }
  const _0xbcfe4b = document.createElement("div");
  _0xbcfe4b.id = DEV_ENTRY_WRAP_ID;
  _0xbcfe4b.className = "dev-entry-wrap";
  const _0xfa7ab1 = createEntryButton({
    id: "devEntryModeBtn",
    label: devEntryText("buttons.dev"),
    title: devEntryText("titles.devOff"),
    className: "dev-entry-btn-mode"
  });
  setDevButtonState(_0xfa7ab1, Boolean(window.DEV_MODE));
  _0xfa7ab1.addEventListener("click", () => {
    toggleDevMode();
  });
  const _0x3c61bb = createEntryButton({
    id: "devEntryPreviewModeBtn",
    label: devEntryText("buttons.preview"),
    title: devEntryText("titles.previewOff"),
    className: "dev-entry-btn-preview-mode"
  });
  setPreviewButtonState(_0x3c61bb, isPreviewModeEnabled());
  _0x3c61bb.addEventListener("click", () => {
    const _0x70f039 = !isPreviewModeEnabled();
    setPreviewMode(_0x70f039);
    window.showToast?.(_0x70f039 ? devEntryText("toasts.previewOn") : devEntryText("toasts.previewOff"));
  });
  const _0x479026 = createEntryButton({
    id: "devEntryPreviewUploadBtn",
    label: devEntryText("buttons.upload"),
    title: devEntryText("titles.upload"),
    className: "dev-entry-btn-preview-upload"
  });
  const _0x1209d8 = document.createElement("input");
  _0x1209d8.type = "file";
  _0x1209d8.id = "devEntryPreviewUploadInput";
  _0x1209d8.hidden = true;
  bindPreviewUploadEntry({
    button: _0x479026,
    input: _0x1209d8
  });
  _0xbcfe4b.appendChild(_0xfa7ab1);
  _0xbcfe4b.appendChild(_0x3c61bb);
  _0xbcfe4b.appendChild(_0x479026);
  _0xbcfe4b.appendChild(_0x1209d8);
  document.body.appendChild(_0xbcfe4b);
  bindLocaleSync();
}