import { onLocaleChange, t } from "../i18n/index.js";
import { getInitialShortcuts, getShortcuts } from "./shortcuts.js";
const TIP_KEYS = Object.freeze(["viewWheelZoom", "viewShortcutZoom", "viewFocus", "viewMinimap", "viewSpacePan", "viewMiddlePan", "createDoubleClick", "createLeftPlus", "createNote", "createTextImage", "createVideoAudio", "createDragMedia", "editSelectAll", "editShiftSelect", "editBoxSelect", "editCopyPaste", "editCut", "editDelete", "editUndoRedo", "organizeGroup", "organizeAlign", "organizeGuides", "organizeGrid", "organizeResetSize", "edgeConnect", "edgeCut", "edgeScissors", "nodeRename", "imageTools", "imageCopy", "videoTools", "videoCaptureFrame", "audioTools", "textTools", "sceneTools", "sceneCapture", "projectSave", "projectSettings", "settingsShortcuts", "hintEsc"]);
const TIP_SHORTCUT_ACTIONS = Object.freeze({
  viewShortcutZoom: Object.freeze({
    zoomIn: "zoom-in",
    zoomOut: "zoom-out"
  }),
  viewFocus: Object.freeze({
    shortcut: "fit-all"
  }),
  viewMinimap: Object.freeze({
    shortcut: "minimap"
  }),
  viewSpacePan: Object.freeze({
    shortcut: "pan-canvas"
  }),
  createNote: Object.freeze({
    shortcut: "create-comment-note"
  }),
  createTextImage: Object.freeze({
    text: "create-ai-text",
    image: "create-ai-image"
  }),
  createVideoAudio: Object.freeze({
    video: "create-ai-video",
    audio: "create-ai-audio"
  }),
  editSelectAll: Object.freeze({
    shortcut: "select-all"
  }),
  editShiftSelect: Object.freeze({
    shortcut: "multi-select"
  }),
  editCopyPaste: Object.freeze({
    copy: "copy",
    paste: "paste"
  }),
  editCut: Object.freeze({
    shortcut: "cut"
  }),
  editDelete: Object.freeze({
    shortcut: "delete"
  }),
  editUndoRedo: Object.freeze({
    undo: "undo",
    redo: "redo"
  }),
  organizeGroup: Object.freeze({
    shortcut: "group"
  }),
  organizeAlign: Object.freeze({
    shortcut: "align-feature"
  }),
  organizeGuides: Object.freeze({
    shortcut: "snap-guides"
  }),
  organizeGrid: Object.freeze({
    shortcut: "snap-grid"
  }),
  organizeResetSize: Object.freeze({
    shortcut: "reset-media-size"
  }),
  edgeCut: Object.freeze({
    shortcut: "cut-edge"
  }),
  imageCopy: Object.freeze({
    shortcut: "copy-media"
  }),
  videoCaptureFrame: Object.freeze({
    shortcut: "video-tool-capture-frame"
  }),
  sceneCapture: Object.freeze({
    shortcut: "panorama-scene-capture"
  }),
  projectSave: Object.freeze({
    shortcut: "save"
  }),
  projectSettings: Object.freeze({
    shortcut: "open-settings"
  })
});
const TIP_SHORTCUT_ACTION_LISTS = Object.freeze({
  imageTools: Object.freeze(["image-tool-matting", "image-tool-repaint", "image-tool-erase", "image-tool-hd", "image-tool-expand", "image-tool-auto-subject", "image-tool-multigrid", "image-tool-multiangle", "image-tool-annotate", "image-tool-crop"]),
  videoTools: Object.freeze(["video-tool-clip", "video-tool-keying", "video-tool-hd", "video-tool-fullscreen", "video-tool-download"]),
  audioTools: Object.freeze(["audio-tool-clip", "audio-tool-speed", "audio-tool-download"]),
  textTools: Object.freeze(["text-tool-copy", "text-tool-fullscreen"]),
  sceneTools: Object.freeze(["panorama-scene-tool-toggle-mouse", "panorama-scene-tool-move", "panorama-scene-tool-scale", "panorama-scene-tool-rotate"])
});
function mascotText(_0xeae52f, _0x4b4460 = {}) {
  return t("mascot." + _0xeae52f, _0x4b4460);
}
function formatShortcutBinding(_0x231a8b, _0x2be03a) {
  const _0x399870 = _0x231a8b?.[_0x2be03a];
  const _0x2f55ea = [...(Array.isArray(_0x399870?.keys) ? [_0x399870.keys] : []), ...(Array.isArray(_0x399870?.alternateKeys) ? _0x399870.alternateKeys : [])].filter(_0x3c5a33 => Array.isArray(_0x3c5a33) && _0x3c5a33.length > 0).map(_0xd60a5c => _0xd60a5c.join(" + "));
  const _0x40e822 = Array.from(new Set(_0x2f55ea));
  return _0x40e822.join(" / ") || t("settings.shortcuts.unset");
}
export function getMascotTipText(_0x52fc96, _0x5cface = getShortcuts()) {
  const _0x2735f9 = Object.keys(_0x5cface || {}).length > 0 ? _0x5cface : getInitialShortcuts();
  const _0x121820 = {};
  Object.entries(TIP_SHORTCUT_ACTIONS[_0x52fc96] || {}).forEach(([_0x1db5f1, _0x3eca26]) => {
    _0x121820[_0x1db5f1] = formatShortcutBinding(_0x2735f9, _0x3eca26);
  });
  const _0x2edded = TIP_SHORTCUT_ACTION_LISTS[_0x52fc96];
  if (_0x2edded) {
    _0x121820.shortcuts = Array.from(new Set(_0x2edded.map(_0x4ec647 => formatShortcutBinding(_0x2735f9, _0x4ec647)))).join(" / ");
  }
  return mascotText("tips." + _0x52fc96, _0x121820);
}
const MascotManager = {
  _lastIdx: -1,
  _visible: false,
  _rotationTimer: null,
  _fabBtn: null,
  _mascotWrap: null,
  _mascotText: null,
  _mascotFigure: null,
  _unsubscribeLocale: null,
  _bindFabButton: true,
  init(_0x35f5d7 = {}) {
    this._bindFabButton = _0x35f5d7.bindFabButton !== false;
    this._fabBtn = document.getElementById("fabBtn");
    this._mascotWrap = document.getElementById("mascotWrap");
    this._mascotText = document.getElementById("mascotText");
    this._mascotFigure = document.getElementById("mascotFigure");
    if (!this._fabBtn || !this._mascotWrap || !this._mascotText) {
      return;
    }
    this._subscribeLocaleChanges();
    this._bindEvents();
  },
  _getRandTip() {
    let _0x488e38;
    do {
      _0x488e38 = Math.floor(Math.random() * TIP_KEYS.length);
    } while (_0x488e38 === this._lastIdx && TIP_KEYS.length > 1);
    this._lastIdx = _0x488e38;
    return getMascotTipText(TIP_KEYS[_0x488e38]);
  },
  _updateTip() {
    if (!this._mascotText) {
      return;
    }
    this._mascotText.textContent = this._getRandTip();
    this._mascotText.classList.remove("refresh");
    this._mascotText.offsetHeight;
    this._mascotText.classList.add("refresh");
    this._triggerShake();
  },
  _showMascot() {
    if (this._visible || !this._mascotWrap || !this._mascotText) {
      return;
    }
    this._mascotText.textContent = this._getRandTip();
    this._mascotText.classList.remove("refresh");
    this._mascotText.offsetHeight;
    this._mascotText.classList.add("refresh");
    this._mascotWrap.classList.add("visible");
    this._visible = true;
    this._restartIdle();
    clearInterval(this._rotationTimer);
    this._rotationTimer = setInterval(() => {
      if (this._visible) {
        this._updateTip();
      }
    }, 8000);
  },
  _hideMascot() {
    if (!this._visible || !this._mascotWrap) {
      return;
    }
    this._mascotWrap.classList.remove("visible");
    this._visible = false;
    clearInterval(this._rotationTimer);
  },
  _triggerShake() {
    if (!this._mascotFigure) {
      return;
    }
    this._mascotFigure.classList.remove("shake", "idle");
    this._mascotFigure.offsetHeight;
    this._mascotFigure.classList.add("shake");
    this._mascotFigure.addEventListener("animationend", () => {
      this._mascotFigure.classList.remove("shake");
      this._mascotFigure.classList.add("idle");
    }, {
      once: true
    });
  },
  _restartIdle() {
    if (!this._mascotFigure) {
      return;
    }
    this._mascotFigure.classList.remove("shake");
    this._mascotFigure.offsetHeight;
    this._mascotFigure.classList.add("idle");
  },
  _subscribeLocaleChanges() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => {
      if (this._visible && this._lastIdx >= 0 && this._mascotText) {
        this._mascotText.textContent = getMascotTipText(TIP_KEYS[this._lastIdx]);
      }
    });
  },
  _bindEvents() {
    window.addEventListener("shortcuts-updated", () => {
      if (!this._visible || this._lastIdx < 0 || !this._mascotText) {
        return;
      }
      this._mascotText.textContent = getMascotTipText(TIP_KEYS[this._lastIdx]);
    });
    if (this._bindFabButton) {
      this._fabBtn.addEventListener("click", _0x352ac9 => {
        _0x352ac9.stopPropagation();
        if (!this._visible) {
          this._showMascot();
        } else {
          this._updateTip();
          clearInterval(this._rotationTimer);
          this._rotationTimer = setInterval(() => {
            if (this._visible) {
              this._updateTip();
            }
          }, 8000);
        }
      });
    }
    this._mascotWrap.addEventListener("click", _0x459b40 => {
      _0x459b40.stopPropagation();
      this._hideMascot();
    });
  },
  show() {
    this._showMascot();
  },
  hide() {
    this._hideMascot();
  },
  isVisible() {
    return this._visible;
  }
};
export default MascotManager;
export { MascotManager };