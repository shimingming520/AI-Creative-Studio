import { t } from "../i18n/index.js";
import { showContextMenu } from "./interaction/contextMenuPresenter.js";
const MENU_SELECTOR = ".v2-text-input-context-menu";
export const TEXT_CONTEXT_MENU_TARGET_SELECTOR = "input, textarea, [contenteditable]:not([contenteditable='false'])";
let activeTextInputContextMenuSession = null;
const TEXT_INPUT_TYPES = new Set(["", "text", "search", "url", "tel", "email", "password"]);
function getWindow() {
  return globalThis.window || null;
}
function getDocument() {
  return globalThis.document || null;
}
function textInputContextMenuText(_0x284860, _0x43d9a6 = {}) {
  return t("textInputContextMenu." + _0x284860, _0x43d9a6);
}
function isInputElement(_0x2f16f7) {
  return String(_0x2f16f7?.tagName || "").toUpperCase() === "INPUT";
}
function isTextAreaElement(_0x2f9af4) {
  return String(_0x2f9af4?.tagName || "").toUpperCase() === "TEXTAREA";
}
function isContentEditableElement(_0x5d4af4) {
  if (_0x5d4af4?.isContentEditable === true) {
    return true;
  }
  const _0x44d79d = _0x5d4af4?.getAttribute?.("contenteditable");
  if (_0x44d79d !== null && _0x44d79d !== undefined) {
    return String(_0x44d79d).toLowerCase() !== "false";
  }
  const _0x492bd9 = String(_0x5d4af4?.contentEditable || "").toLowerCase();
  return _0x492bd9 === "true" || _0x492bd9 === "plaintext-only";
}
function isWritableTextInput(_0x3f5f25) {
  if (!isInputElement(_0x3f5f25)) {
    return false;
  }
  const _0x5efcc4 = String(_0x3f5f25.type || "").toLowerCase();
  return TEXT_INPUT_TYPES.has(_0x5efcc4) && !_0x3f5f25.disabled && !_0x3f5f25.readOnly;
}
function isWritableTextArea(_0x298ac9) {
  return isTextAreaElement(_0x298ac9) && !_0x298ac9.disabled && !_0x298ac9.readOnly;
}
function isSupportedTextInput(_0x2a4082) {
  if (!isInputElement(_0x2a4082) || _0x2a4082.disabled) {
    return false;
  }
  return TEXT_INPUT_TYPES.has(String(_0x2a4082.type || "").toLowerCase());
}
function isSupportedTextArea(_0x31680d) {
  return isTextAreaElement(_0x31680d) && !_0x31680d.disabled;
}
function getTextContextMenuTarget(_0x38a705) {
  if (!_0x38a705) {
    return null;
  }
  const _0x2b32f0 = _0x38a705.closest?.(TEXT_CONTEXT_MENU_TARGET_SELECTOR) || _0x38a705;
  if (isSupportedTextInput(_0x2b32f0) || isSupportedTextArea(_0x2b32f0) || isContentEditableElement(_0x2b32f0)) {
    return _0x2b32f0;
  }
  return null;
}
function isSensitiveTextTarget(_0x3c84e4) {
  if (String(_0x3c84e4?.type || "").toLowerCase() === "password") {
    return true;
  }
  const _0x546d2b = [_0x3c84e4?.id, _0x3c84e4?.name, _0x3c84e4?.autocomplete, _0x3c84e4?.getAttribute?.("aria-label"), _0x3c84e4?.getAttribute?.("title"), _0x3c84e4?.getAttribute?.("placeholder"), _0x3c84e4?.dataset?.sensitive].filter(Boolean).join(" ");
  return /(?:api[\s_-]*key|secret|access[\s_-]*token|password|密码|密钥|令牌)/iu.test(_0x546d2b);
}
export function getEditableTextTarget(_0x39e48c) {
  if (!_0x39e48c) {
    return null;
  }
  const _0x57ef7e = _0x39e48c.closest?.(TEXT_CONTEXT_MENU_TARGET_SELECTOR) || _0x39e48c;
  if (isWritableTextInput(_0x57ef7e) || isWritableTextArea(_0x57ef7e) || isContentEditableElement(_0x57ef7e)) {
    return _0x57ef7e;
  }
  return null;
}
export function isEditableTextTargetInGroupedNode(_0x506d45, _0x97dd5d = {}) {
  const _0x355217 = getEditableTextTarget(_0x506d45);
  if (!_0x355217) {
    return false;
  }
  const _0x54e13a = _0x355217.closest?.(".v2-node");
  const _0x5b7ef4 = String(_0x54e13a?.dataset?.nodeId || _0x54e13a?.id || "").trim();
  if (!_0x5b7ef4) {
    return false;
  }
  const _0x4d1d4d = _0x97dd5d?.[_0x5b7ef4];
  const _0x4d4321 = String(_0x4d1d4d?.parentId || "").trim();
  if (!_0x4d4321) {
    return false;
  }
  return _0x97dd5d?.[_0x4d4321]?.type === "group";
}
function closeTextInputContextMenu() {
  activeTextInputContextMenuSession?.close?.();
  activeTextInputContextMenuSession = null;
  getDocument()?.querySelectorAll?.(MENU_SELECTOR)?.forEach(_0x358581 => _0x358581.remove());
}
function dispatchInputEvent(_0x23ab52) {
  const _0x347c7d = _0x23ab52?.ownerDocument?.defaultView || getWindow();
  const _0x568be1 = _0x347c7d?.InputEvent || _0x347c7d?.Event || globalThis.Event;
  if (typeof _0x568be1 !== "function" || typeof _0x23ab52?.dispatchEvent !== "function") {
    return;
  }
  _0x23ab52.dispatchEvent(new _0x568be1("input", {
    bubbles: true
  }));
}
function clampSelection(_0x8afbfd, _0x3e10e0) {
  const _0x56a0e6 = Number(_0x8afbfd);
  if (!Number.isFinite(_0x56a0e6)) {
    return _0x3e10e0;
  }
  return Math.max(0, Math.min(_0x3e10e0, _0x56a0e6));
}
function setFieldSelection(_0x70d993, _0x44cf8e, _0xd434fa) {
  if (typeof _0x70d993?.setSelectionRange !== "function") {
    return;
  }
  try {
    _0x70d993.setSelectionRange(_0x44cf8e, _0xd434fa);
  } catch {}
}
export function captureEditableSelection(_0x30b76f) {
  if (isSupportedTextInput(_0x30b76f) || isSupportedTextArea(_0x30b76f)) {
    const _0x3eedba = String(_0x30b76f.value || "").length;
    return {
      kind: "field",
      start: clampSelection(_0x30b76f.selectionStart, _0x3eedba),
      end: clampSelection(_0x30b76f.selectionEnd, _0x3eedba)
    };
  }
  const _0xfe692c = _0x30b76f?.ownerDocument?.defaultView || getWindow();
  const _0x39663f = _0xfe692c?.getSelection?.();
  if (!_0x39663f || _0x39663f.rangeCount === 0) {
    return null;
  }
  const _0x2f61c5 = _0x39663f.getRangeAt(0);
  const _0x329cff = _0x2f61c5.commonAncestorContainer;
  if (!_0x30b76f.contains?.(_0x329cff)) {
    return null;
  }
  return {
    kind: "contenteditable",
    range: _0x2f61c5.cloneRange()
  };
}
function getSelectedText(_0x646ed8, _0x55a9d0) {
  if (_0x55a9d0?.kind === "field") {
    return String(_0x646ed8?.value || "").slice(_0x55a9d0.start, _0x55a9d0.end);
  }
  if (_0x55a9d0?.kind === "contenteditable") {
    return String(_0x55a9d0.range?.toString?.() || "");
  }
  return "";
}
function getTargetText(_0x2d168c) {
  if (isSupportedTextInput(_0x2d168c) || isSupportedTextArea(_0x2d168c)) {
    return String(_0x2d168c?.value || "");
  }
  return String(_0x2d168c?.textContent || "");
}
function deleteEditableSelection(_0x3d975b, _0x5a3628) {
  const _0x2b0177 = getEditableTextTarget(_0x3d975b);
  if (!_0x2b0177 || !_0x5a3628) {
    return false;
  }
  if (_0x5a3628.kind === "field") {
    const _0x14743e = String(_0x2b0177.value || "");
    const _0x4dd14a = clampSelection(_0x5a3628.start, _0x14743e.length);
    const _0x3bcca9 = clampSelection(_0x5a3628.end, _0x14743e.length);
    if (_0x4dd14a === _0x3bcca9) {
      return false;
    }
    return insertTextIntoField(_0x2b0177, "", {
      kind: "field",
      start: _0x4dd14a,
      end: _0x3bcca9
    });
  }
  if (_0x5a3628.kind !== "contenteditable" || !_0x5a3628.range) {
    return false;
  }
  restoreEditableSelection(_0x2b0177, _0x5a3628);
  _0x5a3628.range.deleteContents?.();
  dispatchInputEvent(_0x2b0177);
  return true;
}
function selectAllEditableText(_0x591d2e) {
  if (isSupportedTextInput(_0x591d2e) || isSupportedTextArea(_0x591d2e)) {
    _0x591d2e.focus?.({
      preventScroll: true
    });
    setFieldSelection(_0x591d2e, 0, String(_0x591d2e.value || "").length);
    return true;
  }
  if (!isContentEditableElement(_0x591d2e)) {
    return false;
  }
  const _0x5a6a47 = _0x591d2e.ownerDocument || getDocument();
  const _0x411acc = _0x5a6a47?.defaultView?.getSelection?.() || getWindow()?.getSelection?.();
  const _0xec7cfa = _0x5a6a47?.createRange?.();
  if (!_0x411acc || !_0xec7cfa) {
    return false;
  }
  _0x591d2e.focus?.({
    preventScroll: true
  });
  _0xec7cfa.selectNodeContents(_0x591d2e);
  _0x411acc.removeAllRanges();
  _0x411acc.addRange(_0xec7cfa);
  return true;
}
async function writeClipboardText(_0x9b7da) {
  const _0x3eb8e6 = globalThis.navigator?.clipboard?.writeText;
  if (typeof _0x3eb8e6 !== "function") {
    return false;
  }
  try {
    await _0x3eb8e6.call(globalThis.navigator.clipboard, _0x9b7da);
    return true;
  } catch (_0x10cf4a) {
    getWindow()?.showToast?.(textInputContextMenuText("clipboardWriteFailed"), "error");
    return false;
  }
}
async function copyEditableSelection(_0x3f773a, _0x2fe20d) {
  const _0x3bf7c3 = getSelectedText(_0x3f773a, _0x2fe20d);
  if (!_0x3bf7c3) {
    return false;
  }
  restoreEditableSelection(_0x3f773a, _0x2fe20d);
  return writeClipboardText(_0x3bf7c3);
}
async function cutEditableSelection(_0x3ad61f, _0x374f00) {
  if (!(await copyEditableSelection(_0x3ad61f, _0x374f00))) {
    return false;
  }
  return deleteEditableSelection(_0x3ad61f, _0x374f00);
}
function undoEditableChange(_0x485032, _0x578d82) {
  const _0x1ea6a3 = _0x485032?.ownerDocument || getDocument();
  if (_0x1ea6a3?.queryCommandSupported?.("undo") !== true) {
    return false;
  }
  restoreEditableSelection(_0x485032, _0x578d82);
  try {
    return _0x1ea6a3.execCommand?.("undo") === true;
  } catch (_0x58e576) {
    return false;
  }
}
function restoreEditableSelection(_0x590cc6, _0x53251c) {
  if (!_0x53251c) {
    return;
  }
  if (_0x53251c.kind === "field") {
    _0x590cc6.focus?.({
      preventScroll: true
    });
    setFieldSelection(_0x590cc6, _0x53251c.start, _0x53251c.end);
    return;
  }
  if (_0x53251c.kind !== "contenteditable" || !_0x53251c.range) {
    return;
  }
  _0x590cc6.focus?.({
    preventScroll: true
  });
  const _0x34253f = _0x590cc6?.ownerDocument?.defaultView || getWindow();
  const _0x5da1c4 = _0x34253f?.getSelection?.();
  if (!_0x5da1c4) {
    return;
  }
  _0x5da1c4.removeAllRanges();
  _0x5da1c4.addRange(_0x53251c.range);
}
function insertTextIntoField(_0x4a63e7, _0x87a4af, _0x28afec) {
  const _0xa1121b = String(_0x4a63e7.value || "");
  const _0x237803 = clampSelection(_0x28afec?.start ?? _0x4a63e7.selectionStart, _0xa1121b.length);
  const _0x3075e1 = clampSelection(_0x28afec?.end ?? _0x4a63e7.selectionEnd, _0xa1121b.length);
  _0x4a63e7.focus?.({
    preventScroll: true
  });
  if (typeof _0x4a63e7.setRangeText === "function") {
    try {
      _0x4a63e7.setRangeText(_0x87a4af, _0x237803, _0x3075e1, "end");
    } catch (_0x5999da) {
      _0x4a63e7.value = _0xa1121b.slice(0, _0x237803) + _0x87a4af + _0xa1121b.slice(_0x3075e1);
      const _0x392657 = _0x237803 + _0x87a4af.length;
      setFieldSelection(_0x4a63e7, _0x392657, _0x392657);
    }
  } else {
    _0x4a63e7.value = _0xa1121b.slice(0, _0x237803) + _0x87a4af + _0xa1121b.slice(_0x3075e1);
    const _0x30827f = _0x237803 + _0x87a4af.length;
    setFieldSelection(_0x4a63e7, _0x30827f, _0x30827f);
  }
  dispatchInputEvent(_0x4a63e7);
  return true;
}
function insertTextIntoContentEditable(_0x3d5adb, _0x4d6228, _0x554276) {
  const _0x3dc3c0 = _0x3d5adb?.ownerDocument || getDocument();
  _0x3d5adb.focus?.({
    preventScroll: true
  });
  restoreEditableSelection(_0x3d5adb, _0x554276);
  if (typeof _0x3dc3c0?.execCommand === "function") {
    try {
      if (_0x3dc3c0.execCommand("insertText", false, _0x4d6228)) {
        return true;
      }
    } catch {}
  }
  const _0x3bcd95 = _0x3dc3c0?.defaultView || getWindow();
  const _0x21bed6 = _0x3bcd95?.getSelection?.();
  if (_0x21bed6 && _0x21bed6.rangeCount > 0) {
    const _0x54eb32 = _0x21bed6.getRangeAt(0);
    _0x54eb32.deleteContents();
    const _0x424804 = _0x3dc3c0.createTextNode(String(_0x4d6228 || ""));
    _0x54eb32.insertNode(_0x424804);
    _0x54eb32.setStartAfter(_0x424804);
    _0x54eb32.collapse(true);
    _0x21bed6.removeAllRanges();
    _0x21bed6.addRange(_0x54eb32);
  } else if (typeof _0x3d5adb.appendChild === "function" && _0x3dc3c0?.createTextNode) {
    _0x3d5adb.appendChild(_0x3dc3c0.createTextNode(String(_0x4d6228 || "")));
  } else {
    _0x3d5adb.textContent = "" + (_0x3d5adb.textContent || "") + _0x4d6228;
  }
  dispatchInputEvent(_0x3d5adb);
  return true;
}
export function insertPlainTextIntoEditable(_0x217242, _0x13aa64, _0x5c5a02 = null) {
  const _0x2cf78e = getEditableTextTarget(_0x217242);
  if (!_0x2cf78e || typeof _0x13aa64 !== "string") {
    return false;
  }
  if (isWritableTextInput(_0x2cf78e) || isWritableTextArea(_0x2cf78e)) {
    return insertTextIntoField(_0x2cf78e, _0x13aa64, _0x5c5a02);
  }
  if (isContentEditableElement(_0x2cf78e)) {
    return insertTextIntoContentEditable(_0x2cf78e, _0x13aa64, _0x5c5a02);
  }
  return false;
}
async function readClipboardText() {
  const _0x46bd07 = globalThis.navigator?.clipboard?.readText;
  if (typeof _0x46bd07 !== "function") {
    return null;
  }
  return _0x46bd07.call(globalThis.navigator.clipboard);
}
export async function pasteTextIntoEditableFromClipboard(_0x53e246, _0x127450) {
  let _0x5f5c78 = null;
  try {
    _0x5f5c78 = await readClipboardText();
  } catch (_0x10b364) {
    getWindow()?.showToast?.(textInputContextMenuText("clipboardReadFailed"), "error");
    return false;
  }
  if (typeof _0x5f5c78 !== "string") {
    getWindow()?.showToast?.(textInputContextMenuText("clipboardUnsupported"), "error");
    return false;
  }
  if (!_0x5f5c78) {
    getWindow()?.showToast?.(textInputContextMenuText("clipboardEmpty"), "warn");
    return false;
  }
  return insertPlainTextIntoEditable(_0x53e246, _0x5f5c78, _0x127450);
}
export function showTextInputContextMenu({
  target: _0x51c310,
  screenX: _0x340116,
  screenY: _0x290ac9,
  snapshot: _0x392f82
}) {
  const _0x308dc7 = getDocument();
  if (!_0x308dc7?.createElement) {
    return null;
  }
  const _0x4fee7b = getTextContextMenuTarget(_0x51c310);
  if (!_0x4fee7b) {
    return null;
  }
  const _0x33ff70 = _0x392f82 === undefined ? captureEditableSelection(_0x51c310) : _0x392f82;
  closeTextInputContextMenu();
  const _0x3fc1b9 = !!getEditableTextTarget(_0x4fee7b);
  const _0x270197 = isSensitiveTextTarget(_0x4fee7b);
  const _0x5a6271 = typeof globalThis.navigator?.clipboard?.writeText === "function";
  const _0x4100fa = getSelectedText(_0x4fee7b, _0x33ff70);
  const _0x1c648a = [];
  if (_0x3fc1b9 && _0x308dc7.queryCommandSupported?.("undo") === true) {
    _0x1c648a.push({
      label: textInputContextMenuText("undo"),
      kbd: "Ctrl Z",
      action: () => undoEditableChange(_0x4fee7b, _0x33ff70)
    });
  }
  if (_0x4100fa && !_0x270197 && _0x5a6271) {
    if (_0x3fc1b9) {
      _0x1c648a.push({
        label: textInputContextMenuText("cut"),
        kbd: "Ctrl X",
        action: () => void cutEditableSelection(_0x4fee7b, _0x33ff70)
      });
    }
    _0x1c648a.push({
      label: textInputContextMenuText("copy"),
      kbd: "Ctrl C",
      action: () => void copyEditableSelection(_0x4fee7b, _0x33ff70)
    });
  }
  if (_0x3fc1b9) {
    _0x1c648a.push({
      label: textInputContextMenuText("pasteText"),
      kbd: "Ctrl V",
      action: () => {
        restoreEditableSelection(_0x4fee7b, _0x33ff70);
        pasteTextIntoEditableFromClipboard(_0x4fee7b, _0x33ff70);
      }
    });
    if (_0x4100fa) {
      _0x1c648a.push({
        label: textInputContextMenuText("delete"),
        action: () => deleteEditableSelection(_0x4fee7b, _0x33ff70)
      });
    }
  }
  if (getTargetText(_0x4fee7b)) {
    if (_0x1c648a.length > 0) {
      _0x1c648a.push("sep");
    }
    _0x1c648a.push({
      label: textInputContextMenuText("selectAll"),
      kbd: "Ctrl A",
      action: () => selectAllEditableText(_0x4fee7b)
    });
  }
  if (_0x1c648a.length === 0) {
    return null;
  }
  activeTextInputContextMenuSession = showContextMenu(_0x340116, _0x290ac9, _0x1c648a, {
    className: "v2-canvas-ctx-menu v2-text-input-context-menu",
    ownerElement: _0x4fee7b,
    ownerRoot: _0x4fee7b.parentElement || _0x4fee7b,
    autoFocus: false
  });
  return activeTextInputContextMenuSession;
}
export function initTextInputContextMenu(_0x575afc = getDocument()) {
  if (!_0x575afc?.addEventListener) {
    return () => {};
  }
  const _0x5d39f3 = _0x5448ba => {
    if (_0x5448ba.defaultPrevented) {
      return;
    }
    const _0xc8f7cf = getTextContextMenuTarget(_0x5448ba.target);
    if (!_0xc8f7cf) {
      return;
    }
    _0x5448ba.preventDefault();
    _0x5448ba.stopPropagation();
    const _0x1b43e2 = captureEditableSelection(_0xc8f7cf);
    _0xc8f7cf.focus?.({
      preventScroll: true
    });
    showTextInputContextMenu({
      target: _0xc8f7cf,
      screenX: _0x5448ba.clientX || 0,
      screenY: _0x5448ba.clientY || 0,
      snapshot: _0x1b43e2
    });
  };
  _0x575afc.addEventListener("contextmenu", _0x5d39f3);
  return () => {
    _0x575afc.removeEventListener("contextmenu", _0x5d39f3);
    closeTextInputContextMenu();
  };
}