import a421_0xd87f4d from "../../core/stores/appStore.js";
import { commit } from "../../modules/history.js";
import { getShortcuts, detectShortcutConflict } from "../../modules/shortcuts.js";
import { buildJumpShortcutBinding, formatJumpShortcutLabel, normalizeCommentNoteJumpShortcut, normalizeJumpShortcutZoomPercent, parseJumpShortcutFromKeydown } from "../../modules/commentNoteJumpShortcut.js";
import { t } from "../../i18n/index.js";
import { registerStaticInnerHTML } from "../../utils/dom.js";
import { normalizeCommentNoteStyle } from "../commentNoteStyle.js";
function commentToolbarText(_0x1395fb, _0x2a7f5c = {}) {
  return t("nodeToolbar.comment." + _0x1395fb, _0x2a7f5c);
}
const I18N = {
  fontSize: commentToolbarText("fontSize"),
  convertMarkdown: commentToolbarText("convertMarkdown"),
  convertPlainText: commentToolbarText("convertPlainText"),
  markdownConverted: commentToolbarText("markdownConverted"),
  plainTextConverted: commentToolbarText("plainTextConverted"),
  textColor: commentToolbarText("textColor"),
  bgColor: commentToolbarText("bgColor"),
  deleteNode: commentToolbarText("deleteNode"),
  jumpShortcut: commentToolbarText("jumpShortcut"),
  jumpShortcutRow: commentToolbarText("jumpShortcutRow"),
  jumpClear: commentToolbarText("jumpClear"),
  jumpClearAria: commentToolbarText("jumpClearAria"),
  jumpHintRecording: commentToolbarText("jumpHintRecording"),
  jumpEmpty: commentToolbarText("jumpEmpty"),
  jumpUpdated: commentToolbarText("jumpUpdated"),
  jumpCleared: commentToolbarText("jumpCleared"),
  jumpZoom: commentToolbarText("jumpZoom"),
  textColorLabel: {
    white: commentToolbarText("textColorLabel.white"),
    red: commentToolbarText("textColorLabel.red"),
    orange: commentToolbarText("textColorLabel.orange"),
    yellow: commentToolbarText("textColorLabel.yellow"),
    green: commentToolbarText("textColorLabel.green"),
    blue: commentToolbarText("textColorLabel.blue"),
    purple: commentToolbarText("textColorLabel.purple"),
    cyan: commentToolbarText("textColorLabel.cyan"),
    pink: commentToolbarText("textColorLabel.pink"),
    gray: commentToolbarText("textColorLabel.gray")
  },
  bgColorLabel: {
    transparent: commentToolbarText("bgColorLabel.transparent"),
    white: commentToolbarText("bgColorLabel.white"),
    red: commentToolbarText("bgColorLabel.red"),
    orange: commentToolbarText("bgColorLabel.orange"),
    yellow: commentToolbarText("bgColorLabel.yellow"),
    green: commentToolbarText("bgColorLabel.green"),
    blue: commentToolbarText("bgColorLabel.blue"),
    purple: commentToolbarText("bgColorLabel.purple"),
    cyan: commentToolbarText("bgColorLabel.cyan"),
    gray: commentToolbarText("bgColorLabel.gray")
  }
};
const TEXT_COLOR_OPTIONS = ["white", "red", "orange", "yellow", "green", "blue", "purple", "cyan", "pink", "gray"];
const BACKGROUND_COLOR_OPTIONS = ["transparent", "red", "orange", "yellow", "green", "blue", "purple", "cyan", "gray", "white"];
const SVG_KEYBOARD = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M7 9h0M10 9h0M13 9h0M16 9h0M7 12h0M10 12h0M13 12h0M16 12h0M8 15h8\"/></svg>";
const SVG_FONT_SIZE = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"M5 20 10 6h4l5 14\"/><path d=\"M7.5 14h9\"/></svg>";
const SVG_MARKDOWN = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M7 15V9l3 4 3-4v6\"/><path d=\"M17 9v6\"/><path d=\"m15 13 2 2 2-2\"/></svg>";
const SVG_TEXT_COLOR = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"m4 20 5-13h6l5 13\"/><path d=\"M7.5 13h9\"/><path d=\"M4 21h16\"/></svg>";
const SVG_BG_COLOR = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"12\" rx=\"2\"/><path d=\"M4 20h16\"/></svg>";
const SVG_DELETE = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><polyline points=\"3 6 5 6 21 6\"/><path d=\"M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6\"/><path d=\"M10 11v6\"/><path d=\"M14 11v6\"/><path d=\"M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2\"/></svg>";
const COLOR_SWATCH_TOKEN_MAP = {
  red: "var(--red)",
  orange: "var(--gold)",
  yellow: "var(--warning-text)",
  green: "var(--green)",
  blue: "var(--blue)",
  purple: "var(--purple)",
  cyan: "var(--cyan)",
  pink: "var(--group-pink)",
  gray: "var(--group-slate)",
  white: "var(--canvas-white)",
  transparent: "transparent"
};
function createColorPopupHtml(_0xef30de, _0x3a466a, _0x5d68d5, _0x5eb4ef) {
  return "\n    <div class=\"comment-toolbar-color-popup\" data-popup=\"" + _0xef30de + "\" aria-label=\"" + _0x5d68d5 + "\">\n      " + _0x3a466a.map(_0x45fe4f => "<button\n              class=\"ftb-btn comment-toolbar-color-item\"\n              data-action=\"" + _0xef30de + "\"\n              data-value=\"" + _0x45fe4f + "\"\n              data-tooltip=\"" + (_0x5eb4ef[_0x45fe4f] || _0x45fe4f) + "\"\n              aria-label=\"" + (_0x5eb4ef[_0x45fe4f] || _0x45fe4f) + "\"\n            ></button>").join("") + "\n    </div>\n  ";
}
function createJumpPopupHtml() {
  return "\n    <div class=\"comment-toolbar-jump-popup\" data-popup=\"jump-shortcut\" aria-label=\"" + I18N.jumpShortcut + "\">\n      <div class=\"comment-toolbar-jump-binding-row\">\n        <span class=\"comment-toolbar-jump-binding-label\">" + I18N.jumpShortcutRow + "</span>\n        <div class=\"comment-toolbar-jump-binding-anchor\">\n          <button class=\"comment-toolbar-jump-binding\" data-action=\"jump-toggle-record\" data-role=\"jump-binding\" type=\"button\">" + I18N.jumpEmpty + "</button>\n          <button class=\"comment-toolbar-jump-clear-btn\" data-action=\"jump-clear-keys\" data-tooltip=\"" + I18N.jumpClear + "\" aria-label=\"" + I18N.jumpClearAria + "\" type=\"button\">&times;</button>\n        </div>\n      </div>\n      <label class=\"comment-toolbar-jump-zoom-field\">\n        <span class=\"comment-toolbar-jump-zoom-label\">" + I18N.jumpZoom + "</span>\n        <input\n          class=\"comment-toolbar-range comment-toolbar-jump-zoom-input\"\n          data-role=\"jump-zoom-range\"\n          type=\"range\"\n          min=\"0\"\n          max=\"100\"\n          step=\"1\"\n        />\n        <span class=\"comment-toolbar-jump-zoom-unit\" data-role=\"jump-zoom-value\">50%</span>\n      </label>\n    </div>\n  ";
}
export const COMMENT_NOTE_TOOLBAR_HTML = "\n<div class=\"node-floating-toolbar v2-comment-toolbar\">\n  <div class=\"comment-toolbar-jump-wrap\" data-role=\"jump-shortcut\">\n    <button class=\"ftb-btn icon-only act-jump-shortcut comment-toolbar-jump-trigger\" data-tooltip=\"" + I18N.jumpShortcut + " | " + I18N.jumpEmpty + "\" aria-label=\"" + I18N.jumpShortcut + "\">" + SVG_KEYBOARD + "</button>\n    " + createJumpPopupHtml() + "\n  </div>\n  <span class=\"comment-toolbar-divider\" aria-hidden=\"true\">|</span>\n  <button class=\"ftb-btn icon-only act-convert-markdown\" data-tooltip=\"" + I18N.convertMarkdown + "\" aria-label=\"" + I18N.convertMarkdown + "\">" + SVG_MARKDOWN + "</button>\n  <div class=\"comment-toolbar-font-wrap\" data-role=\"font-size\">\n    <button class=\"ftb-btn icon-only act-font-size\" data-tooltip=\"" + I18N.fontSize + "\" aria-label=\"" + I18N.fontSize + "\">" + SVG_FONT_SIZE + "</button>\n    <div class=\"comment-toolbar-font-popup\" data-popup=\"font-size\" aria-label=\"" + I18N.fontSize + "\">\n      <input\n        class=\"comment-toolbar-range comment-toolbar-font-range\"\n        data-role=\"font-size-range\"\n        type=\"range\"\n        min=\"14\"\n        max=\"56\"\n        step=\"2\"\n        value=\"24\"\n        aria-label=\"" + I18N.fontSize + "\"\n      />\n      <span class=\"comment-toolbar-font-value\" data-role=\"font-size-value\">24</span>\n    </div>\n  </div>\n\n  <div class=\"comment-toolbar-color-wrap\" data-role=\"text-color\">\n    <button class=\"ftb-btn icon-only act-text-color comment-toolbar-color-trigger\" data-tooltip=\"" + I18N.textColor + "\" aria-label=\"" + I18N.textColor + "\">\n      " + SVG_TEXT_COLOR + "\n      <span class=\"comment-toolbar-color-dot\" data-dot=\"text-color\"></span>\n    </button>\n    " + createColorPopupHtml("text-color", TEXT_COLOR_OPTIONS, I18N.textColor, I18N.textColorLabel) + "\n  </div>\n\n  <div class=\"comment-toolbar-color-wrap\" data-role=\"background-color\">\n    <button class=\"ftb-btn icon-only act-bg-color comment-toolbar-color-trigger\" data-tooltip=\"" + I18N.bgColor + "\" aria-label=\"" + I18N.bgColor + "\">\n      " + SVG_BG_COLOR + "\n      <span class=\"comment-toolbar-color-dot\" data-dot=\"background-color\"></span>\n    </button>\n    " + createColorPopupHtml("background-color", BACKGROUND_COLOR_OPTIONS, I18N.bgColor, I18N.bgColorLabel) + "\n  </div>\n\n  <button class=\"ftb-btn icon-only act-delete-node comment-toolbar-danger\" data-tooltip=\"" + I18N.deleteNode + "\" aria-label=\"" + I18N.deleteNode + "\">" + SVG_DELETE + "</button>\n</div>\n";
registerStaticInnerHTML("toolbar:comment-note", COMMENT_NOTE_TOOLBAR_HTML);
function normalizeArgs(_0x4e4786) {
  if (_0x4e4786 && typeof _0x4e4786 === "object" && !_0x4e4786.nodeType && _0x4e4786.toolbarEl) {
    return _0x4e4786;
  }
  return {
    toolbarEl: _0x4e4786?.[0],
    nodeId: _0x4e4786?.[1],
    getCurrentStyle: _0x4e4786?.[2],
    getNodeSnapshot: _0x4e4786?.[4]
  };
}
function setColorDot(_0x156d17, _0x243812) {
  if (!_0x156d17) {
    return;
  }
  const _0x5bab90 = COLOR_SWATCH_TOKEN_MAP[_0x243812] || "var(--white-20)";
  _0x156d17.style.setProperty("--comment-toolbar-dot-color", _0x5bab90);
  _0x156d17.classList.toggle("is-transparent", _0x243812 === "transparent");
}
function getJumpShortcutTooltipText(_0x5a40e8) {
  return commentToolbarText("jumpTooltip", {
    shortcut: formatJumpShortcutLabel(_0x5a40e8, I18N.jumpEmpty)
  });
}
export function bindCommentNoteToolbarEvents(..._0x315673) {
  const {
    toolbarEl: _0x545822,
    nodeId: _0x43a41e,
    getCurrentStyle: _0x545d2d,
    getNodeSnapshot: _0x1c46cd
  } = normalizeArgs(_0x315673.length === 1 ? _0x315673[0] : _0x315673);
  if (!_0x545822 || !_0x43a41e || typeof _0x545d2d !== "function") {
    return null;
  }
  _0x545822.addEventListener("pointerdown", _0x3816ed => _0x3816ed.stopPropagation());
  _0x545822.addEventListener("dblclick", _0x525369 => {
    _0x525369.preventDefault();
    _0x525369.stopPropagation();
  });
  _0x545822.tabIndex = -1;
  let _0x42270a = null;
  let _0x370e28 = false;
  let _0x3e94ee = 0;
  let _0x610473 = null;
  let _0x248f3c = null;
  const _0x1a51bc = _0x545822.querySelector("[data-dot=\"text-color\"]");
  const _0x2cb64d = _0x545822.querySelector("[data-dot=\"background-color\"]");
  const _0x5ebf5d = _0x545822.querySelector(".act-convert-markdown");
  const _0xd28c0f = _0x545822.querySelector(".comment-toolbar-font-wrap");
  const _0x4480c9 = _0x545822.querySelector(".act-font-size");
  const _0xaf66e5 = _0x545822.querySelector("[data-role=\"font-size-range\"]");
  const _0x54f48e = _0x545822.querySelector("[data-role=\"font-size-value\"]");
  const _0x48e12e = _0x545822.querySelector(".comment-toolbar-jump-wrap");
  const _0x35d1dc = _0x545822.querySelector(".act-jump-shortcut");
  const _0x4cbe84 = _0x545822.querySelector("[data-role=\"jump-binding\"]");
  const _0x33d91d = _0x545822.querySelector("[data-role=\"jump-zoom-range\"]");
  const _0x99d00b = _0x545822.querySelector("[data-role=\"jump-zoom-value\"]");
  const _0x20cdc3 = () => a421_0xd87f4d.getStateRaw().nodes?.[_0x43a41e] || null;
  const _0x4d68e1 = () => normalizeCommentNoteJumpShortcut(_0x20cdc3()?.jumpShortcut);
  const _0x3b8fa9 = () => _0x20cdc3()?.contentFormat === "markdown";
  const _0x962099 = () => {
    if (!_0x5ebf5d) {
      return;
    }
    const _0x298b2b = _0x3b8fa9();
    _0x5ebf5d.classList.toggle("is-active", _0x298b2b);
    _0x5ebf5d.setAttribute("data-tooltip", _0x298b2b ? I18N.convertPlainText : I18N.convertMarkdown);
    _0x5ebf5d.setAttribute("aria-label", _0x298b2b ? I18N.convertPlainText : I18N.convertMarkdown);
  };
  const _0x21516e = () => {
    if (!_0x3e94ee) {
      return;
    }
    clearTimeout(_0x3e94ee);
    _0x3e94ee = 0;
  };
  const _0x2164ec = _0x545e95 => {
    if (!_0x35d1dc) {
      return;
    }
    _0x35d1dc.setAttribute("data-tooltip", getJumpShortcutTooltipText(_0x545e95));
  };
  const _0x365f56 = (_0x19f6f3, _0x50217b = 1800) => {
    if (!_0x35d1dc) {
      return;
    }
    _0x21516e();
    _0x35d1dc.classList.add("is-tooltip-pinned");
    _0x35d1dc.setAttribute("data-tooltip", _0x19f6f3);
    _0x3e94ee = window.setTimeout(() => {
      _0x35d1dc.classList.remove("is-tooltip-pinned");
      _0x2164ec(_0x4d68e1().keys);
      _0x21516e();
    }, _0x50217b);
  };
  const _0x8d5027 = () => {
    const _0xa191b9 = _0x4d68e1();
    const _0x56cf6b = formatJumpShortcutLabel(_0xa191b9.keys, I18N.jumpEmpty);
    if (_0x4cbe84) {
      _0x4cbe84.textContent = _0x370e28 ? I18N.jumpHintRecording : _0x56cf6b;
      _0x4cbe84.classList.toggle("is-recording", _0x370e28);
      _0x4cbe84.setAttribute("aria-label", _0x370e28 ? I18N.jumpHintRecording : _0x56cf6b);
    }
    if (_0x35d1dc && !_0x35d1dc.classList.contains("is-tooltip-pinned")) {
      _0x2164ec(_0xa191b9.keys);
    }
    if (_0x33d91d && document.activeElement !== _0x33d91d) {
      _0x33d91d.value = String(_0xa191b9.zoomPercent);
    }
    if (_0x99d00b) {
      _0x99d00b.textContent = _0xa191b9.zoomPercent + "%";
    }
    if (_0x48e12e) {
      _0x48e12e.classList.toggle("is-recording", _0x370e28);
    }
  };
  const _0x3edc09 = _0x391b1f => {
    _0x370e28 = _0x391b1f === true;
    window.__commentNoteShortcutRecording = _0x370e28;
    _0x8d5027();
  };
  const _0x9b94d3 = _0x9b58ce => {
    const _0x593150 = getShortcuts?.();
    const _0x25d403 = detectShortcutConflict(_0x593150, "__comment-note-jump__", _0x9b58ce);
    if (_0x25d403) {
      return commentToolbarText("jumpConflictGlobal", {
        label: _0x25d403.label
      });
    }
    const _0x5c9de9 = buildJumpShortcutBinding(_0x9b58ce);
    if (!_0x5c9de9) {
      return null;
    }
    const _0x9e3a28 = a421_0xd87f4d.getStateRaw().nodes || {};
    for (const [_0x5a4e45, _0x5f29ec] of Object.entries(_0x9e3a28)) {
      if (!_0x5f29ec || _0x5a4e45 === _0x43a41e || _0x5f29ec.type !== "comment-note") {
        continue;
      }
      const _0xc766ac = normalizeCommentNoteJumpShortcut(_0x5f29ec.jumpShortcut);
      const _0x3c6b46 = buildJumpShortcutBinding(_0xc766ac.keys);
      if (_0x3c6b46 && _0x3c6b46 === _0x5c9de9) {
        return commentToolbarText("jumpConflictOther");
      }
    }
    return null;
  };
  const _0x116468 = (_0x7349b0, {
    commitHistory = true
  } = {}) => {
    const _0x4c1bec = _0x4d68e1();
    const _0x33eb42 = normalizeCommentNoteJumpShortcut({
      ..._0x4c1bec,
      ...(_0x7349b0 || {})
    });
    if (buildJumpShortcutBinding(_0x4c1bec.keys) === buildJumpShortcutBinding(_0x33eb42.keys) && _0x4c1bec.zoomPercent === _0x33eb42.zoomPercent) {
      _0x8d5027();
      return;
    }
    a421_0xd87f4d.updateNodeData(_0x43a41e, {
      jumpShortcut: _0x33eb42
    });
    if (commitHistory) {
      commit();
    }
    _0x8d5027();
  };
  const _0x1f67e7 = () => {
    if (_0x610473) {
      document.removeEventListener("keydown", _0x610473, true);
      _0x610473 = null;
    }
    _0x3edc09(false);
  };
  const _0x46ac4d = () => {
    if (_0x370e28) {
      return;
    }
    _0x3edc09(true);
    _0x610473 = _0x3969af => {
      if (!_0x370e28) {
        return;
      }
      _0x3969af.preventDefault();
      _0x3969af.stopImmediatePropagation();
      if (_0x3969af.key === "Escape") {
        _0x1f67e7();
        _0x8d5027();
        return;
      }
      const _0x4deafa = parseJumpShortcutFromKeydown(_0x3969af);
      if (!_0x4deafa.length) {
        return;
      }
      const _0x5824ac = _0x9b94d3(_0x4deafa);
      if (_0x5824ac) {
        _0x365f56(_0x5824ac);
        _0x1f67e7();
        return;
      }
      _0x116468({
        keys: _0x4deafa
      });
      window.showToast?.(I18N.jumpUpdated, "success");
      _0x1f67e7();
    };
    document.addEventListener("keydown", _0x610473, true);
  };
  const _0xb231b7 = () => {
    _0x545822.querySelectorAll(".comment-toolbar-color-wrap").forEach(_0x4c4f7d => _0x4c4f7d.classList.remove("is-open"));
  };
  const _0x50ae6f = () => {
    if (_0x48e12e) {
      _0x48e12e.classList.remove("is-open");
    }
    _0x1f67e7();
  };
  const _0x43f163 = () => {
    if (_0x248f3c === null) {
      return;
    }
    const _0x5c2a3c = normalizeCommentNoteStyle(_0x20cdc3()?.style || _0x545d2d());
    if (_0x5c2a3c.fontSize !== _0x248f3c) {
      commit();
    }
    _0x248f3c = null;
  };
  const _0x44ce7b = () => {
    _0x43f163();
    if (_0xd28c0f) {
      _0xd28c0f.classList.remove("is-open");
    }
  };
  const _0x29f705 = () => {
    _0x42270a = null;
    _0x545822.classList.remove("comment-toolbar-popup-open");
    _0xb231b7();
    _0x50ae6f();
    _0x44ce7b();
  };
  const _0x20e6f4 = _0x843e0c => {
    if (_0x42270a === "font-size" && _0x843e0c !== "font-size") {
      _0x43f163();
    }
    _0x42270a = _0x843e0c;
    _0x545822.classList.add("comment-toolbar-popup-open");
    _0x545822.querySelectorAll(".comment-toolbar-color-wrap").forEach(_0x524008 => {
      _0x524008.classList.toggle("is-open", _0x524008.dataset.role === _0x843e0c);
    });
    if (_0x48e12e) {
      _0x48e12e.classList.toggle("is-open", _0x843e0c === "jump-shortcut");
    }
    if (_0xd28c0f) {
      _0xd28c0f.classList.toggle("is-open", _0x843e0c === "font-size");
    }
    if (_0x843e0c !== "jump-shortcut") {
      _0x1f67e7();
    }
    if (_0x843e0c === "jump-shortcut") {
      _0x4cbe84?.focus();
      _0x8d5027();
    }
    if (_0x843e0c === "font-size") {
      _0xaf66e5?.focus();
    }
  };
  _0x545822.addEventListener("focusout", _0x30c07a => {
    if (!_0x545822.contains(_0x30c07a.relatedTarget)) {
      _0x29f705();
    }
  });
  const _0x55b4b7 = _0x4e3067 => {
    const _0x34fb49 = normalizeCommentNoteStyle(_0x4e3067 || _0x545d2d());
    if (_0xaf66e5) {
      _0xaf66e5.value = String(_0x34fb49.fontSize);
    }
    if (_0x54f48e) {
      _0x54f48e.textContent = String(_0x34fb49.fontSize);
    }
    if (_0x4480c9) {
      const _0x5d4d58 = I18N.fontSize + " · " + _0x34fb49.fontSize + "px";
      _0x4480c9.setAttribute("data-tooltip", _0x5d4d58);
      _0x4480c9.setAttribute("aria-label", _0x5d4d58);
    }
    _0x545822.querySelectorAll("[data-action=\"text-color\"]").forEach(_0x51215c => _0x51215c.classList.toggle("is-active", _0x51215c.dataset.value === _0x34fb49.textColor));
    _0x545822.querySelectorAll("[data-action=\"background-color\"]").forEach(_0x1f3efc => _0x1f3efc.classList.toggle("is-active", _0x1f3efc.dataset.value === _0x34fb49.backgroundColor));
    setColorDot(_0x1a51bc, _0x34fb49.textColor);
    setColorDot(_0x2cb64d, _0x34fb49.backgroundColor);
    _0x8d5027();
    _0x962099();
  };
  const _0x18b57c = _0x5540e7 => {
    const _0x2ca10c = normalizeCommentNoteStyle(_0x545d2d());
    const _0x3369df = normalizeCommentNoteStyle({
      ..._0x2ca10c,
      ..._0x5540e7
    });
    a421_0xd87f4d.updateNodeData(_0x43a41e, {
      style: _0x3369df
    });
    commit();
  };
  const _0x430bfe = () => {
    if (!_0xaf66e5) {
      return;
    }
    const _0x1da7a8 = normalizeCommentNoteStyle(_0x20cdc3()?.style || _0x545d2d());
    const _0x2ad6db = normalizeCommentNoteStyle({
      ..._0x1da7a8,
      fontSize: _0xaf66e5.value
    });
    if (_0x248f3c === null) {
      _0x248f3c = _0x1da7a8.fontSize;
    }
    if (_0x54f48e) {
      _0x54f48e.textContent = String(_0x2ad6db.fontSize);
    }
    if (_0x2ad6db.fontSize === _0x1da7a8.fontSize) {
      return;
    }
    a421_0xd87f4d.updateNodeData(_0x43a41e, {
      style: _0x2ad6db
    });
  };
  const _0x33aad7 = ({
    commitHistory = true
  } = {}) => {
    if (!_0x33d91d) {
      return;
    }
    const _0x7a2287 = normalizeJumpShortcutZoomPercent(_0x33d91d.value);
    _0x116468({
      zoomPercent: _0x7a2287
    }, {
      commitHistory: commitHistory
    });
  };
  _0x33d91d?.addEventListener("input", () => _0x33aad7({
    commitHistory: false
  }));
  _0x33d91d?.addEventListener("change", () => _0x33aad7({
    commitHistory: true
  }));
  _0xaf66e5?.addEventListener("input", _0x430bfe);
  _0xaf66e5?.addEventListener("change", () => {
    _0x430bfe();
    _0x43f163();
  });
  _0x545822.addEventListener("click", _0x5daa85 => {
    const _0x2b0d64 = _0x5daa85.target.closest("button");
    if (!_0x2b0d64) {
      return;
    }
    _0x5daa85.stopPropagation();
    const _0x37c508 = _0x2b0d64.dataset.action;
    if (_0x37c508 === "jump-toggle-record") {
      if (_0x370e28) {
        _0x1f67e7();
      } else {
        _0x46ac4d();
      }
      return;
    }
    if (_0x37c508 === "jump-clear-keys") {
      _0x1f67e7();
      _0x116468({
        keys: []
      });
      window.showToast?.(I18N.jumpCleared, "success");
      return;
    }
    if (_0x2b0d64.classList.contains("act-jump-shortcut")) {
      if (_0x42270a === "jump-shortcut") {
        _0x29f705();
      } else {
        _0x20e6f4("jump-shortcut");
      }
      return;
    }
    if (_0x2b0d64.classList.contains("act-convert-markdown")) {
      const _0x3712b7 = _0x20cdc3();
      const _0x324c2e = typeof _0x1c46cd === "function" && _0x1c46cd() || _0x3712b7;
      if (!_0x324c2e) {
        return;
      }
      const _0x2719d3 = (_0x3712b7?.contentFormat || _0x324c2e.contentFormat) !== "markdown";
      a421_0xd87f4d.updateNodeData(_0x43a41e, {
        content: typeof _0x324c2e.content === "string" ? _0x324c2e.content : "",
        contentFormat: _0x2719d3 ? "markdown" : "plain"
      });
      commit();
      window.showToast?.(_0x2719d3 ? I18N.markdownConverted : I18N.plainTextConverted, "success");
      _0x962099();
      _0x29f705();
      return;
    }
    if (_0x2b0d64.classList.contains("act-font-size")) {
      if (_0x42270a === "font-size") {
        _0x29f705();
      } else {
        _0x20e6f4("font-size");
      }
      return;
    }
    if (_0x2b0d64.classList.contains("act-delete-node")) {
      a421_0xd87f4d.deleteNodes([_0x43a41e]);
      commit();
      _0x29f705();
      return;
    }
    if (_0x2b0d64.classList.contains("act-text-color")) {
      if (_0x42270a === "text-color") {
        _0x29f705();
      } else {
        _0x20e6f4("text-color");
      }
      return;
    }
    if (_0x2b0d64.classList.contains("act-bg-color")) {
      if (_0x42270a === "background-color") {
        _0x29f705();
      } else {
        _0x20e6f4("background-color");
      }
      return;
    }
    const _0x56f53a = _0x2b0d64.dataset.value;
    if (_0x37c508 === "text-color" && _0x56f53a) {
      _0x18b57c({
        textColor: _0x56f53a
      });
      _0x29f705();
      return;
    }
    if (_0x37c508 === "background-color" && _0x56f53a) {
      _0x18b57c({
        backgroundColor: _0x56f53a
      });
      _0x29f705();
    }
  });
  _0x55b4b7(_0x545d2d());
  return _0x55b4b7;
}