import a1546_0x7da67 from "../core/stores/appStore.js";
import { getShortcuts, handleShortcutKeydown, isRecording } from "../modules/shortcuts.js";
import { buildJumpShortcutBinding, normalizeCommentNoteJumpShortcut, parseJumpShortcutFromKeydown } from "../modules/commentNoteJumpShortcut.js";
import { hasActiveReadonlyTextSelection } from "../components/aigenText/readonlyTextSelection.js";
import { toggleDevMode } from "../modules/devEntry.js";
import { getSelectedSyncPlayableVideoCount } from "../modules/videoSyncPlayback.js";
let _spaceHeld = false;
let _listeners = [];
const ALIGN_HOLD_TRIGGER_MS = 220;
let _alignHoldTimer = null;
let _alignHoldActive = false;
let _alignHoldKey = "";
const MODIFIER_ALIAS_MAP = Object.freeze({
  CTRL: "Ctrl",
  CONTROL: "Ctrl",
  CMD: "Ctrl",
  COMMAND: "Ctrl",
  META: "Ctrl",
  SHIFT: "Shift",
  ALT: "Alt",
  OPTION: "Alt"
});
const NAMED_KEY_ALIAS_MAP = Object.freeze({
  SPACE: "Space",
  ESC: "Escape",
  ESCAPE: "Escape",
  ENTER: "Enter",
  TAB: "Tab",
  DELETE: "Delete",
  BACKSPACE: "Backspace"
});
const INTERACTION_MODIFIER_SHORTCUTS = new Set(["cut-edge", "duplicate-with-edges", "multi-select"]);
const ACTIVE_WHITEBOARD_EDITOR_SELECTOR = ".whiteboard-node-component.is-whiteboard-editing";
function normalizeShortcutKeyPart(_0x675b84) {
  const _0x289fb4 = String(_0x675b84 ?? "").trim();
  if (!_0x289fb4) {
    return "";
  }
  if (_0x289fb4 === " ") {
    return "Space";
  }
  const _0x24d39c = _0x289fb4.toUpperCase();
  if (MODIFIER_ALIAS_MAP[_0x24d39c]) {
    return MODIFIER_ALIAS_MAP[_0x24d39c];
  }
  if (NAMED_KEY_ALIAS_MAP[_0x24d39c]) {
    return NAMED_KEY_ALIAS_MAP[_0x24d39c];
  }
  if (_0x289fb4.length === 1) {
    return _0x289fb4.toUpperCase();
  }
  return _0x289fb4[0].toUpperCase() + _0x289fb4.slice(1).toLowerCase();
}
function getPanShortcutParts() {
  const _0x1c090b = getShortcuts?.() || {};
  const _0x3ccbb9 = _0x1c090b?.["pan-canvas"]?.keys;
  const _0x3b9f15 = Array.isArray(_0x3ccbb9) && _0x3ccbb9.length > 0 ? _0x3ccbb9 : ["Space"];
  return new Set(_0x3b9f15.map(_0x420f76 => normalizeShortcutKeyPart(_0x420f76)).filter(Boolean));
}
function setPanShortcutHeld(_0x30cbc8) {
  _spaceHeld = _0x30cbc8 === true;
  window._spaceHeld = _spaceHeld;
  const _0x5e98e6 = document.getElementById("v2-wrap");
  if (_0x5e98e6) {
    _0x5e98e6.style.cursor = _spaceHeld ? "var(--grab-cursor)" : "";
  }
}
function shouldReleasePanShortcut(_0x208368) {
  if (!_spaceHeld) {
    return false;
  }
  const _0x12986e = _0x208368?.key === " " || _0x208368?.code === "Space" ? "Space" : _0x208368?.key;
  const _0x9c1d52 = normalizeShortcutKeyPart(_0x12986e);
  if (!_0x9c1d52) {
    return false;
  }
  return getPanShortcutParts().has(_0x9c1d52);
}
function isAudioClipModeActive() {
  const _0x5cc45a = document.getElementById("v2-wrap");
  return !!_0x5cc45a?.classList.contains("is-audio-clip-mode");
}
function isEscFeatureModeActive(_0x531138) {
  return !!_0x531138?.matting?.active || !!_0x531138?.annotate?.active || isAudioClipModeActive();
}
function isCommentNoteShortcutRecording() {
  return window.__commentNoteShortcutRecording === true;
}
function dispatchShortcutAction(_0x33272a) {
  window.dispatchEvent(new CustomEvent("shortcut-action", {
    detail: _0x33272a
  }));
}
function isRepeatSuppressedShortcut(_0x198fef) {
  const _0x13641d = String(_0x198fef || "");
  return _0x13641d === "upload-file" || _0x13641d === "panorama-scene-camera-create" || _0x13641d.startsWith("panorama-scene-camera-");
}
function isInteractionModifierShortcut(_0x35538b) {
  return INTERACTION_MODIFIER_SHORTCUTS.has(String(_0x35538b || ""));
}
function resolveCommentNoteJumpActionId(_0x283238, _0x820c6) {
  if (!_0x283238 || _0x820c6?.repeat) {
    return null;
  }
  const _0x2dd930 = buildJumpShortcutBinding(parseJumpShortcutFromKeydown(_0x820c6));
  if (!_0x2dd930) {
    return null;
  }
  const _0x1261ae = _0x283238.nodes || {};
  for (const [_0x2329f7, _0x1085de] of Object.entries(_0x1261ae)) {
    if (!_0x1085de || _0x1085de.type !== "comment-note") {
      continue;
    }
    const _0x3b09b2 = normalizeCommentNoteJumpShortcut(_0x1085de.jumpShortcut);
    const _0x3b2aab = buildJumpShortcutBinding(_0x3b09b2.keys);
    if (!_0x3b2aab || _0x3b2aab !== _0x2dd930) {
      continue;
    }
    return "comment-note-jump::" + _0x2329f7;
  }
  return null;
}
function _clearAlignHoldState() {
  if (_alignHoldTimer) {
    clearTimeout(_alignHoldTimer);
    _alignHoldTimer = null;
  }
  _alignHoldActive = false;
  _alignHoldKey = "";
}
function isEditingText() {
  const _0x4f4a41 = document.activeElement;
  const _0x40be66 = _0x4f4a41?.tagName;
  return _0x40be66 === "INPUT" || _0x40be66 === "TEXTAREA" || _0x4f4a41?.contentEditable === "true" || _0x4f4a41?.isContentEditable === true;
}
function isPlainCopyShortcut(_0x4980bc) {
  return (_0x4980bc?.ctrlKey || _0x4980bc?.metaKey) && !_0x4980bc?.shiftKey && !_0x4980bc?.altKey && (String(_0x4980bc?.key || "").toLowerCase() === "c" || _0x4980bc?.code === "KeyC");
}
function isActiveWhiteboardEditorTarget(_0x27a003) {
  const _0x1b2995 = _0x27a003?.target || document.activeElement;
  return Boolean(_0x1b2995?.closest?.(ACTIVE_WHITEBOARD_EDITOR_SELECTOR));
}
function isDevModeToggleShortcut(_0x10dcef) {
  if (window.LOCAL_DEV_BUILD !== true || _0x10dcef?.repeat || _0x10dcef?.ctrlKey || _0x10dcef?.metaKey || _0x10dcef?.altKey) {
    return false;
  }
  return _0x10dcef?.code === "Backslash" || _0x10dcef?.key === "\\" || _0x10dcef?.key === "|" || _0x10dcef?.key === "、";
}
function hasExpandedMediaClipNode(_0x4b8ab5) {
  const _0x277452 = _0x4b8ab5?.nodes || {};
  return Object.values(_0x277452).some(_0x57ba0e => _0x57ba0e?.type === "media-clip" && _0x57ba0e?.mediaClip?.expanded === true);
}
function buildShortcutContext(_0x503989, {
  audioClipModeActive = false
} = {}) {
  const _0xb0e8f8 = Array.isArray(_0x503989?.selectedNodeIds) ? _0x503989.selectedNodeIds : [];
  const _0x3df4c7 = _0xb0e8f8.length === 1 ? _0x503989?.nodes?.[_0xb0e8f8[0]]?.type || "" : "";
  const _0x5a7081 = _0xb0e8f8.length === 1 ? _0x503989?.nodes?.[_0xb0e8f8[0]] || null : null;
  const _0x3fbbb0 = _0x3df4c7 === "panorama-360" ? _0x5a7081?.panorama360Node || null : _0x5a7081?.sceneNode || null;
  return {
    mattingActive: _0x503989?.matting?.active,
    annotateActive: _0x503989?.annotate?.active,
    videoKeyingActive: _0x503989?.videoKeying?.active,
    featureModeActive: !!_0x503989?.matting?.active || !!_0x503989?.annotate?.active || !!_0x503989?.videoClip?.active || !!_0x503989?.videoKeying?.active || audioClipModeActive,
    alignFeatureEnabled: _0x503989?.ui?.alignFeatureEnabled !== false,
    selectedNodeType: _0x3df4c7,
    selectedSyncPlayableVideoCount: getSelectedSyncPlayableVideoCount(_0x503989?.nodes || {}, _0xb0e8f8),
    mediaClipExpandedEditing: hasExpandedMediaClipNode(_0x503989),
    panoramaSceneEditing: (_0x3df4c7 === "panorama-scene" || _0x3df4c7 === "panorama-360") && _0x3fbbb0?.ui?.isEditing === true,
    panoramaSceneFlyMode: _0x3df4c7 === "panorama-scene" && _0x3fbbb0?.ui?.isEditing === true && _0x3fbbb0?.ui?.navigationMode === "fly"
  };
}
function isPanoramaSceneNavigationKey(_0x39ade8, _0x32798b) {
  if (!_0x32798b?.panoramaSceneEditing || _0x39ade8?.ctrlKey || _0x39ade8?.metaKey || _0x39ade8?.altKey) {
    return false;
  }
  if (_0x39ade8?.code === "KeyF") {
    return true;
  }
  return _0x32798b.panoramaSceneFlyMode === true && ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"].includes(_0x39ade8?.code);
}
function handleKeyDown(_0x386505) {
  if (isRecording()) {
    return;
  }
  if (isCommentNoteShortcutRecording()) {
    return;
  }
  if (_0x386505.target?.closest?.(".v2-canvas-ctx-menu")) {
    return;
  }
  if (isDevModeToggleShortcut(_0x386505) && !isEditingText() && !isActiveWhiteboardEditorTarget(_0x386505)) {
    _0x386505.preventDefault();
    toggleDevMode();
    return;
  }
  if (document.body?.classList?.contains?.("storyboard-3d-editor-open")) {
    return;
  }
  const _0xf7f84 = a1546_0x7da67.getStateRaw();
  if (_0x386505.code === "Escape" && isEscFeatureModeActive(_0xf7f84)) {
    _0x386505.preventDefault();
    _0x386505.stopImmediatePropagation();
    dispatchShortcutAction("escape-all");
    return;
  }
  if (isEditingText()) {
    if (_0x386505.code === "Escape") {
      const {
        pickConnectMode: _0x195f56
      } = a1546_0x7da67.getStateRaw();
      if (_0x195f56 && _0x195f56.active) {
        a1546_0x7da67.setPickConnectMode({
          active: false
        });
        _0x386505.preventDefault();
        _0x386505.stopPropagation();
      }
    }
    return;
  }
  if (isActiveWhiteboardEditorTarget(_0x386505)) {
    return;
  }
  if (isPlainCopyShortcut(_0x386505) && hasActiveReadonlyTextSelection(document)) {
    return;
  }
  const _0x3cc02b = isAudioClipModeActive();
  if (_0x3cc02b) {
    return;
  }
  if (_0xf7f84.videoKeying?.active || _0xf7f84.videoClip?.active) {
    if (_0x386505.code === "Escape") {
      return;
    }
    _0x386505.preventDefault();
    _0x386505.stopPropagation();
    return;
  }
  if (_0xf7f84.annotate?.active && !_0x386505.ctrlKey && !_0x386505.metaKey && !_0x386505.altKey && String(_0x386505.key || "").toUpperCase() === "T") {
    _0x386505.preventDefault();
    _0x386505.stopPropagation();
    window.dispatchEvent(new CustomEvent("shortcut-action", {
      detail: "editor-tool-text"
    }));
    return;
  }
  if (_0x386505.code === "Escape") {
    const {
      pickConnectMode: _0x511ce3
    } = a1546_0x7da67.getStateRaw();
    if (_0x511ce3 && _0x511ce3.active) {
      a1546_0x7da67.setPickConnectMode({
        active: false
      });
      _0x386505.preventDefault();
      _0x386505.stopPropagation();
      return;
    }
  }
  if (_0x386505.key === "Control") {
    const _0x1c488c = document.getElementById("pick-connect-overlay");
    if (_0x1c488c && _0x1c488c.style.display !== "none") {
      _0x1c488c.style.cursor = "var(--connect-cursor)";
    }
  }
  const _0x36b7dc = a1546_0x7da67.getStateRaw();
  const _0x5dd2af = buildShortcutContext(_0x36b7dc, {
    audioClipModeActive: _0x3cc02b
  });
  if (isPanoramaSceneNavigationKey(_0x386505, _0x5dd2af)) {
    _0x386505.preventDefault();
    return;
  }
  const _0x32ae95 = handleShortcutKeydown(_0x386505, _0x5dd2af);
  if (_0x386505.repeat && isRepeatSuppressedShortcut(_0x32ae95)) {
    _0x386505.preventDefault();
    return;
  }
  if (_0x32ae95 === "pan-canvas") {
    _0x386505.preventDefault();
    if (!_0x386505.repeat) {
      setPanShortcutHeld(true);
    }
    return;
  }
  if (_0x32ae95 === "align-feature") {
    const _0x182d20 = String(_0x36b7dc.ui?.alignFeatureTriggerMode || "click");
    const _0x10bd1b = _0x182d20 === "hold" || _0x182d20 === "click" || _0x182d20 === "off" ? _0x182d20 : "click";
    if (_0x10bd1b === "off" || _0x5dd2af.alignFeatureEnabled === false) {
      return;
    }
    _0x386505.preventDefault();
    if (_0x10bd1b === "click") {
      dispatchShortcutAction("align-feature-toggle");
      return;
    }
    if (_0x386505.repeat) {
      return;
    }
    _clearAlignHoldState();
    _alignHoldKey = (_0x386505.code || "") + "|" + (_0x386505.key || "");
    _alignHoldTimer = setTimeout(() => {
      _alignHoldTimer = null;
      _alignHoldActive = true;
      dispatchShortcutAction("align-feature-hold-start");
    }, ALIGN_HOLD_TRIGGER_MS);
    return;
  }
  if (isInteractionModifierShortcut(_0x32ae95)) {
    return;
  }
  if (_0x32ae95) {
    _0x386505.preventDefault();
    window.dispatchEvent(new CustomEvent("shortcut-action", {
      detail: _0x32ae95
    }));
    return;
  }
  if (!_0x5dd2af.featureModeActive) {
    const _0x103581 = resolveCommentNoteJumpActionId(_0x36b7dc, _0x386505);
    if (_0x103581) {
      _0x386505.preventDefault();
      dispatchShortcutAction(_0x103581);
      return;
    }
  }
  const _0xc1e421 = _0x386505.key === "Delete" || _0x386505.key === "Del" || _0x386505.key === "Backspace" || _0x386505.code === "Delete" || _0x386505.code === "Backspace";
  if (!_0x5dd2af.featureModeActive && _0xc1e421) {
    _0x386505.preventDefault();
    _0x386505.stopPropagation();
    _0x386505.stopImmediatePropagation();
  }
}
function handleKeyUp(_0x8bc9e9) {
  if (_alignHoldKey) {
    const _0x3ba960 = (_0x8bc9e9.code || "") + "|" + (_0x8bc9e9.key || "");
    const _0x12a0c4 = _0x3ba960 === _alignHoldKey || _0x8bc9e9.code === "Tab" || String(_0x8bc9e9.key || "").toLowerCase() === "tab";
    if (_0x12a0c4) {
      const _0x47fc92 = _alignHoldActive;
      _clearAlignHoldState();
      if (_0x47fc92) {
        dispatchShortcutAction("align-feature-hold-end");
      }
    }
  }
  if (shouldReleasePanShortcut(_0x8bc9e9)) {
    setPanShortcutHeld(false);
  }
  if (_0x8bc9e9.key === "Control") {
    const _0x3c653a = document.getElementById("pick-connect-overlay");
    if (_0x3c653a && _0x3c653a.style.display !== "none") {
      _0x3c653a.style.cursor = "";
    }
  }
}
export function isSpaceHeld() {
  return _spaceHeld;
}
export function addShortcutListener(_0x11bd42) {
  _listeners.push(_0x11bd42);
  const _0x1c7ba4 = _0x479627 => _0x11bd42(_0x479627.detail);
  window.addEventListener("shortcut-action", _0x1c7ba4);
  return () => {
    const _0x5f0ef3 = _listeners.indexOf(_0x11bd42);
    if (_0x5f0ef3 > -1) {
      _listeners.splice(_0x5f0ef3, 1);
    }
    window.removeEventListener("shortcut-action", _0x1c7ba4);
  };
}
export function initKeyboardService() {
  window.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", _clearAlignHoldState);
  _spaceHeld = false;
  window._spaceHeld = false;
}
export function destroyKeyboardService() {
  window.removeEventListener("keydown", handleKeyDown, true);
  document.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("blur", _clearAlignHoldState);
  _clearAlignHoldState();
  setPanShortcutHeld(false);
}