import a1215_0x338aeb from "../../core/stores/appStore.js";
import { closeSlashMenu } from "../slashMenu.js";
const COMMENT_NOTE_JUMP_FOCUS_X_STORAGE_KEY = "v2-comment-note-jump-focus-x";
const COMMENT_NOTE_JUMP_FOCUS_Y_STORAGE_KEY = "v2-comment-note-jump-focus-y";
const DEFAULT_COMMENT_NOTE_JUMP_FOCUS_X_PERCENT = 50;
const DEFAULT_COMMENT_NOTE_JUMP_FOCUS_Y_PERCENT = 20;
function getRuntimeRoot() {
  if (typeof window !== "undefined") {
    return window;
  }
  return globalThis;
}
function getRuntimeStorage() {
  const _0x150843 = getRuntimeRoot();
  try {
    if (_0x150843?.localStorage) {
      return _0x150843.localStorage;
    }
  } catch {}
  try {
    if (typeof localStorage !== "undefined" && localStorage) {
      return localStorage;
    }
  } catch {}
  return null;
}
function normalizePercent(_0x1d5de4, _0x505975) {
  if (_0x1d5de4 === null || _0x1d5de4 === undefined || _0x1d5de4 === "") {
    return _0x505975;
  }
  const _0x4466f0 = Number(_0x1d5de4);
  if (!Number.isFinite(_0x4466f0)) {
    return _0x505975;
  }
  return Math.max(0, Math.min(100, Math.round(_0x4466f0)));
}
function readPercentPref(_0x1ad711, _0xe31041) {
  let _0x30112b = null;
  try {
    _0x30112b = getRuntimeStorage()?.getItem(_0x1ad711) ?? null;
  } catch {}
  return normalizePercent(_0x30112b, _0xe31041);
}
function writePercentPref(_0x2694ba, _0x579cef, _0x47cc5b) {
  const _0x582ba1 = normalizePercent(_0x579cef, _0x47cc5b);
  try {
    getRuntimeStorage()?.setItem(_0x2694ba, String(_0x582ba1));
  } catch {}
  return _0x582ba1;
}
export function readCommentNoteJumpFocusPref() {
  return {
    viewportAlignX: readPercentPref(COMMENT_NOTE_JUMP_FOCUS_X_STORAGE_KEY, DEFAULT_COMMENT_NOTE_JUMP_FOCUS_X_PERCENT) / 100,
    viewportAlignY: readPercentPref(COMMENT_NOTE_JUMP_FOCUS_Y_STORAGE_KEY, DEFAULT_COMMENT_NOTE_JUMP_FOCUS_Y_PERCENT) / 100
  };
}
export function applyImageVideoNodeResizePref(_0x398e82) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x425bb1 = document.getElementById("v2-wrap");
  if (!_0x425bb1) {
    return;
  }
  _0x425bb1.classList.toggle("v2-media-node-resize-enabled", _0x398e82 === true);
}
function syncButtonPair(_0x47d138, _0x569070, _0x5aad32) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x56f8e1 = _0x5aad32 === true;
  document.getElementById(_0x47d138)?.classList.toggle("active", _0x56f8e1);
  document.getElementById(_0x569070)?.classList.toggle("active", !_0x56f8e1);
}
function normalizePromptEnterBehavior(_0xa99aeb) {
  if (_0xa99aeb === "newline") {
    return "newline";
  } else {
    return "submit";
  }
}
function syncPromptEnterBehaviorButtons(_0x26e882) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x1fd004 = normalizePromptEnterBehavior(_0x26e882);
  document.querySelectorAll("#promptEnterBehaviorGroup .cursor-size-btn").forEach(_0x24efb3 => {
    _0x24efb3.classList.toggle("active", _0x24efb3.dataset.promptEnterBehavior === _0x1fd004);
  });
}
function syncNodeAvoidOverlapButtons(_0x350d22) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x13cf05 = _0x350d22 !== false;
  document.querySelectorAll("#nodeAvoidOverlapGroup .cursor-size-btn").forEach(_0x436ec0 => {
    const _0x284e04 = _0x436ec0.dataset.avoid === "on";
    _0x436ec0.classList.toggle("active", _0x284e04 === _0x13cf05);
  });
}
export function setSelectionMediaPropertiesPref(_0x5cb231, _0x3db295 = a1215_0x338aeb) {
  const _0xe14222 = _0x5cb231 !== false;
  _0x3db295.setShowSelectionMediaProperties(_0xe14222);
  syncButtonPair("btnSelectionMediaPropertiesOn", "btnSelectionMediaPropertiesOff", _0xe14222);
  return _0xe14222;
}
export function setImageVideoNodeResizePref(_0xc5fc49, _0x25cdae = a1215_0x338aeb) {
  const _0x596918 = _0xc5fc49 === true;
  _0x25cdae.setImageVideoNodeResizeEnabled(_0x596918);
  applyImageVideoNodeResizePref(_0x596918);
  syncButtonPair("btnMediaNodeResizeOn", "btnMediaNodeResizeOff", _0x596918);
  return _0x596918;
}
export function setTitleFollowsCanvasZoomPref(_0xbb7bd7, _0x5ebcf0 = a1215_0x338aeb) {
  const _0x2d84f5 = _0xbb7bd7 === true;
  _0x5ebcf0.setTitleFollowsCanvasZoom(_0x2d84f5);
  syncButtonPair("btnTitleFollowsZoomOn", "btnTitleFollowsZoomOff", _0x2d84f5);
  return _0x2d84f5;
}
export function setPromptBoxResizePref(_0x261d8d, _0x3cd91b = a1215_0x338aeb) {
  const _0x514cf7 = _0x261d8d !== false;
  _0x3cd91b.setPromptBoxResizeEnabled(_0x514cf7);
  syncButtonPair("btnPromptBoxResizeOn", "btnPromptBoxResizeOff", _0x514cf7);
  return _0x514cf7;
}
export function setPromptEnterBehaviorPref(_0x408c19, _0x1559fc = a1215_0x338aeb) {
  const _0x5805fb = normalizePromptEnterBehavior(_0x408c19);
  _0x1559fc.setPromptEnterBehavior(_0x5805fb);
  syncPromptEnterBehaviorButtons(_0x5805fb);
  return _0x5805fb;
}
export function applyPromptAttachmentButtonHiddenPref(_0x105814) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x2658c1 = document.getElementById("v2-wrap");
  if (!_0x2658c1) {
    return;
  }
  _0x2658c1.classList.toggle("prompt-attachment-button-hidden", _0x105814 === true);
}
export function setPromptAttachmentButtonHiddenPref(_0x11f5af, _0x661288 = a1215_0x338aeb) {
  const _0x4f9e75 = _0x11f5af === true;
  _0x661288.setPromptAttachmentButtonHidden(_0x4f9e75);
  applyPromptAttachmentButtonHiddenPref(_0x4f9e75);
  syncButtonPair("btnPromptAttachmentButtonHiddenYes", "btnPromptAttachmentButtonHiddenNo", _0x4f9e75);
  if (_0x4f9e75 && _0x661288.getState?.()?.pickConnectMode?.active) {
    _0x661288.setPickConnectMode?.({
      active: false
    });
  }
  return _0x4f9e75;
}
export function applyPromptPresetButtonHiddenPref(_0x231178) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x3f3292 = document.getElementById("v2-wrap");
  if (!_0x3f3292) {
    return;
  }
  _0x3f3292.classList.toggle("prompt-preset-button-hidden", _0x231178 === true);
}
export function setPromptPresetButtonHiddenPref(_0x21b119, _0x59fbdb = a1215_0x338aeb) {
  const _0xe384a4 = _0x21b119 === true;
  _0x59fbdb.setPromptPresetButtonHidden(_0xe384a4);
  applyPromptPresetButtonHiddenPref(_0xe384a4);
  syncButtonPair("btnPromptPresetButtonHiddenYes", "btnPromptPresetButtonHiddenNo", _0xe384a4);
  if (_0xe384a4 && document.getElementById("v2-slash-menu")?.classList.contains("open")) {
    closeSlashMenu();
  }
  return _0xe384a4;
}
export function setVideoAudioDefaultEnabledPref(_0x5ed0ce, _0x4a8c75 = a1215_0x338aeb) {
  const _0x4a48b3 = _0x5ed0ce === true;
  _0x4a8c75.setVideoAudioDefaultEnabled(_0x4a48b3);
  syncButtonPair("btnVideoAudioDefaultEnabledOn", "btnVideoAudioDefaultEnabledOff", _0x4a48b3);
  return _0x4a48b3;
}
export function setNodeAvoidOverlapPref(_0x1b1bd7) {
  const _0x12d570 = _0x1b1bd7 !== false;
  const _0x136002 = typeof window !== "undefined" ? window : globalThis;
  _0x136002.v2NodeAvoidOverlap = _0x12d570;
  try {
    _0x136002?.localStorage?.setItem("v2-node-avoid-overlap", _0x12d570 ? "1" : "0");
  } catch {}
  syncNodeAvoidOverlapButtons(_0x12d570);
  return _0x12d570;
}
function initSelectionMediaProperties() {
  const _0x5c2779 = document.getElementById("btnSelectionMediaPropertiesOn");
  const _0x32bc2d = document.getElementById("btnSelectionMediaPropertiesOff");
  if (!_0x5c2779 || !_0x32bc2d) {
    return;
  }
  const _0xabc998 = a1215_0x338aeb.getState();
  const _0x49322d = _0xabc998?.ui?.showSelectionMediaProperties !== false;
  setSelectionMediaPropertiesPref(_0x49322d);
  _0x5c2779.addEventListener("click", () => setSelectionMediaPropertiesPref(true));
  _0x32bc2d.addEventListener("click", () => setSelectionMediaPropertiesPref(false));
}
function initImageVideoNodeResize() {
  const _0xb34101 = document.getElementById("btnMediaNodeResizeOn");
  const _0x42dc12 = document.getElementById("btnMediaNodeResizeOff");
  if (!_0xb34101 || !_0x42dc12) {
    return;
  }
  const _0xef650f = a1215_0x338aeb.getState();
  const _0x47a5d4 = _0xef650f?.ui?.imageVideoNodeResizeEnabled === true;
  setImageVideoNodeResizePref(_0x47a5d4);
  _0xb34101.addEventListener("click", () => setImageVideoNodeResizePref(true));
  _0x42dc12.addEventListener("click", () => setImageVideoNodeResizePref(false));
}
function initTitleFollowsCanvasZoom() {
  const _0x1c2f36 = document.getElementById("btnTitleFollowsZoomOn");
  const _0x39996e = document.getElementById("btnTitleFollowsZoomOff");
  if (!_0x1c2f36 || !_0x39996e) {
    return;
  }
  const _0x52824c = a1215_0x338aeb.getState();
  const _0x3c7358 = _0x52824c?.ui?.titleFollowsCanvasZoom === true;
  setTitleFollowsCanvasZoomPref(_0x3c7358);
  _0x1c2f36.addEventListener("click", () => setTitleFollowsCanvasZoomPref(true));
  _0x39996e.addEventListener("click", () => setTitleFollowsCanvasZoomPref(false));
}
function initPromptBoxResize() {
  const _0x3da676 = document.getElementById("btnPromptBoxResizeOn");
  const _0x2a082b = document.getElementById("btnPromptBoxResizeOff");
  if (!_0x3da676 || !_0x2a082b) {
    return;
  }
  const _0x54a31b = a1215_0x338aeb.getState();
  const _0xc27066 = _0x54a31b?.ui?.promptBoxResizeEnabled !== false;
  setPromptBoxResizePref(_0xc27066);
  _0x3da676.addEventListener("click", () => setPromptBoxResizePref(true));
  _0x2a082b.addEventListener("click", () => setPromptBoxResizePref(false));
}
function initPromptEnterBehavior() {
  const _0x380281 = document.getElementById("promptEnterBehaviorGroup");
  if (!_0x380281) {
    return;
  }
  const _0x192239 = a1215_0x338aeb.getState();
  const _0x1f8004 = normalizePromptEnterBehavior(_0x192239?.ui?.promptEnterBehavior);
  setPromptEnterBehaviorPref(_0x1f8004);
  document.querySelectorAll("#promptEnterBehaviorGroup .cursor-size-btn").forEach(_0xffed7e => {
    _0xffed7e.addEventListener("click", () => setPromptEnterBehaviorPref(_0xffed7e.dataset.promptEnterBehavior));
  });
}
function initPromptAttachmentButtonHidden() {
  const _0x37cba0 = document.getElementById("btnPromptAttachmentButtonHiddenNo");
  const _0xa40496 = document.getElementById("btnPromptAttachmentButtonHiddenYes");
  if (!_0x37cba0 || !_0xa40496) {
    return;
  }
  const _0x55d93e = a1215_0x338aeb.getState();
  const _0x4be162 = _0x55d93e?.ui?.promptAttachmentButtonHidden === true;
  setPromptAttachmentButtonHiddenPref(_0x4be162);
  _0x37cba0.addEventListener("click", () => setPromptAttachmentButtonHiddenPref(false));
  _0xa40496.addEventListener("click", () => setPromptAttachmentButtonHiddenPref(true));
}
function initPromptPresetButtonHidden() {
  const _0x53bca0 = document.getElementById("btnPromptPresetButtonHiddenNo");
  const _0x1c8db3 = document.getElementById("btnPromptPresetButtonHiddenYes");
  if (!_0x53bca0 || !_0x1c8db3) {
    return;
  }
  const _0x2ba456 = a1215_0x338aeb.getState()?.ui?.promptPresetButtonHidden === true;
  setPromptPresetButtonHiddenPref(_0x2ba456);
  _0x53bca0.addEventListener("click", () => setPromptPresetButtonHiddenPref(false));
  _0x1c8db3.addEventListener("click", () => setPromptPresetButtonHiddenPref(true));
}
function initVideoAudioDefaultEnabled() {
  const _0x3f3d7c = document.getElementById("btnVideoAudioDefaultEnabledOn");
  const _0xdbf30a = document.getElementById("btnVideoAudioDefaultEnabledOff");
  if (!_0x3f3d7c || !_0xdbf30a) {
    return;
  }
  const _0x54c446 = a1215_0x338aeb.getState();
  const _0x51225e = _0x54c446?.ui?.videoAudioDefaultEnabled === true;
  setVideoAudioDefaultEnabledPref(_0x51225e);
  _0x3f3d7c.addEventListener("click", () => setVideoAudioDefaultEnabledPref(true));
  _0xdbf30a.addEventListener("click", () => setVideoAudioDefaultEnabledPref(false));
}
function initCommentNoteJumpFocus() {
  const _0x2e7d61 = ({
    sliderId: _0x260261,
    valueId: _0x13b6da,
    storageKey: _0x56c8e4,
    fallback: _0x4b6121
  }) => {
    const _0x35d7fd = document.getElementById(_0x260261);
    const _0x2327e3 = document.getElementById(_0x13b6da);
    if (!_0x35d7fd) {
      return;
    }
    const _0x1aa3bd = _0x4b1063 => {
      const _0x1cb7ca = normalizePercent(_0x4b1063, _0x4b6121);
      _0x35d7fd.value = String(_0x1cb7ca);
      if (_0x2327e3) {
        _0x2327e3.textContent = _0x1cb7ca + "%";
      }
      return _0x1cb7ca;
    };
    _0x1aa3bd(readPercentPref(_0x56c8e4, _0x4b6121));
    _0x35d7fd.addEventListener("input", _0x2ab1c1 => {
      _0x1aa3bd(_0x2ab1c1.target?.value);
    });
    _0x35d7fd.addEventListener("change", _0x985846 => {
      _0x1aa3bd(writePercentPref(_0x56c8e4, _0x985846.target?.value, _0x4b6121));
    });
  };
  _0x2e7d61({
    sliderId: "commentNoteJumpFocusXSlider",
    valueId: "commentNoteJumpFocusXValue",
    storageKey: COMMENT_NOTE_JUMP_FOCUS_X_STORAGE_KEY,
    fallback: DEFAULT_COMMENT_NOTE_JUMP_FOCUS_X_PERCENT
  });
  _0x2e7d61({
    sliderId: "commentNoteJumpFocusYSlider",
    valueId: "commentNoteJumpFocusYValue",
    storageKey: COMMENT_NOTE_JUMP_FOCUS_Y_STORAGE_KEY,
    fallback: DEFAULT_COMMENT_NOTE_JUMP_FOCUS_Y_PERCENT
  });
}
function initNodeSpacing() {
  const _0x1680e7 = document.getElementById("nodeSpacingSlider");
  const _0x29839e = document.getElementById("nodeSpacingValue");
  let _0x4c27d2 = parseInt(localStorage.getItem("v2-node-spacing"), 10);
  if (isNaN(_0x4c27d2)) {
    _0x4c27d2 = 120;
  }
  window.v2NodeSpacing = _0x4c27d2;
  if (_0x1680e7) {
    _0x1680e7.value = _0x4c27d2;
    if (_0x29839e) {
      _0x29839e.textContent = _0x4c27d2;
    }
  }
  _0x1680e7?.addEventListener("input", _0x58f6ed => {
    const _0x2afa0a = parseInt(_0x58f6ed.target.value, 10);
    if (_0x29839e) {
      _0x29839e.textContent = _0x2afa0a;
    }
  });
  _0x1680e7?.addEventListener("change", _0x40a9a6 => {
    const _0x1dfa72 = parseInt(_0x40a9a6.target.value, 10);
    window.v2NodeSpacing = _0x1dfa72;
    localStorage.setItem("v2-node-spacing", _0x1dfa72);
  });
}
function initNodeDirection() {
  const _0x2b6a57 = localStorage.getItem("v2-node-direction") || "right";
  window.v2NodeDirection = _0x2b6a57;
  const _0x1a3f3a = document.querySelectorAll("#nodeDirectionGroup .cursor-size-btn");
  _0x1a3f3a.forEach(_0x1b0474 => {
    _0x1b0474.classList.toggle("active", _0x1b0474.dataset.dir === _0x2b6a57);
    _0x1b0474.addEventListener("click", () => {
      _0x1a3f3a.forEach(_0x5172bd => _0x5172bd.classList.remove("active"));
      _0x1b0474.classList.add("active");
      window.v2NodeDirection = _0x1b0474.dataset.dir;
      localStorage.setItem("v2-node-direction", _0x1b0474.dataset.dir);
    });
  });
}
function initNodeAvoidOverlap() {
  const _0x4bfd47 = localStorage.getItem("v2-node-avoid-overlap");
  let _0x2ee452 = true;
  if (_0x4bfd47 == null) {
    localStorage.setItem("v2-node-avoid-overlap", "1");
  } else {
    _0x2ee452 = _0x4bfd47 === "1" || _0x4bfd47 === "true";
  }
  setNodeAvoidOverlapPref(_0x2ee452);
  const _0x54d274 = document.querySelectorAll("#nodeAvoidOverlapGroup .cursor-size-btn");
  _0x54d274.forEach(_0x21fff0 => {
    _0x21fff0.addEventListener("click", () => {
      setNodeAvoidOverlapPref(_0x21fff0.dataset.avoid === "on");
    });
  });
}
export function initNodeBehaviorSettings() {
  initSelectionMediaProperties();
  initImageVideoNodeResize();
  initTitleFollowsCanvasZoom();
  initPromptBoxResize();
  initPromptEnterBehavior();
  initPromptAttachmentButtonHidden();
  initPromptPresetButtonHidden();
  initVideoAudioDefaultEnabled();
  initCommentNoteJumpFocus();
  initNodeSpacing();
  initNodeDirection();
  initNodeAvoidOverlap();
}