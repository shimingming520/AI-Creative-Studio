import a890_0x39bf69 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { generateId } from "../core/math.js";
import { commit } from "./history.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { requester } from "../../api/requester.js";
import { canUseElectronMediaTask, enqueueElectronMediaTask } from "../../api/localMediaTaskApi.js";
import { getAudioDurationFromUrl, getWaveformBarsPathFromUrl } from "../utils/audioWaveform.js";
import { attachDesktopMediaPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { localPathToUrl, pickResultLocalPath } from "../utils/localMediaPath.js";
export function normalizeAudioCutResultLocalPath(_0x9a7ac) {
  return pickResultLocalPath(_0x9a7ac);
}
export function shouldAudioClipSelectionPointerUpSeek(_0x3cab24 = "", _0x3bb8f4 = false) {
  return String(_0x3cab24 || "") === "move" && _0x3bb8f4 !== true;
}
export function normalizeAudioClipSplitSec({
  splitSec: _0x38984f,
  startSec: _0x383275,
  endSec: _0x34d0a1,
  durationSec: _0x2c86ab,
  minLenSec = 0.1
} = {}) {
  const _0x300ffe = Number(_0x2c86ab);
  const _0x5bd3b0 = Math.max(0, Number(_0x383275) || 0);
  const _0x574004 = Math.max(_0x5bd3b0, Number(_0x34d0a1) || _0x5bd3b0);
  const _0x3d6594 = Number(_0x38984f);
  const _0x15038a = Math.max(0.001, Number(minLenSec) || 0.1);
  if (!Number.isFinite(_0x300ffe) || _0x300ffe <= 0) {
    return null;
  }
  if (!Number.isFinite(_0x3d6594)) {
    return null;
  }
  const _0x2ec3ea = Math.max(0, Math.min(_0x300ffe, _0x3d6594));
  if (_0x2ec3ea - _0x5bd3b0 < _0x15038a) {
    return null;
  }
  if (_0x574004 - _0x2ec3ea < _0x15038a) {
    return null;
  }
  return _0x2ec3ea;
}
function audioClipText(_0x531c39, _0x50d9fc = {}) {
  return t("audioClip." + _0x531c39, _0x50d9fc);
}
const AudioClipController = {
  active: false,
  nodeId: null,
  anchorNodeId: null,
  wrapperEl: null,
  barEl: null,
  trackEl: null,
  selectionEl: null,
  splitLeftSelectionEl: null,
  splitRightSelectionEl: null,
  leftHandleEl: null,
  rightHandleEl: null,
  playheadEl: null,
  labelEl: null,
  cancelBtnEl: null,
  splitBtnEl: null,
  undoSplitBtnEl: null,
  confirmBtnEl: null,
  audioEl: null,
  splitMarkerEl: null,
  durationSec: 0,
  startSec: 0,
  endSec: 0,
  _splitSec: null,
  _splitRanges: null,
  _activeSplitRangeId: "",
  _sourceOptions: null,
  _dragMode: null,
  _dragRangeId: "",
  _dragOffsetPx: 0,
  _onKeyDown: null,
  _onDocClick: null,
  _onLoadedMeta: null,
  _onDurationChange: null,
  _onPointerMove: null,
  _onPointerUp: null,
  _retryRaf: 0,
  _retryCount: 0,
  _playheadRaf: 0,
  _hiddenEls: null,
  _msgEls: null,
  _msgInterval: 0,
  _wavePathEl: null,
  _waveToken: 0,
  _sourceToken: 0,
  _unsubscribeLocale: null,
  init(_0x2b92e6) {
    if (!_0x2b92e6) {
      return;
    }
    if (this.active) {
      this.exit({
        silent: true
      });
    }
    this.audioEl = null;
    const _0x55fa0 = a890_0x39bf69.getState().nodes[_0x2b92e6];
    if (!_0x55fa0) {
      return;
    }
    const _0x375fce = this._resolveAudioSrcFromNode(_0x55fa0);
    if (!_0x375fce) {
      window.showToast?.(audioClipText("toasts.uploadFirst"), "warn");
      return;
    }
    this.active = true;
    this.nodeId = _0x2b92e6;
    this.anchorNodeId = _0x2b92e6;
    this._retryCount = 0;
    this._mountWhenReady();
  },
  initForSource(_0x4cf64c = {}) {
    const _0x5ebc44 = _0x4cf64c.wrapperEl;
    const _0x5b745e = localPathToUrl(_0x4cf64c.sourceLocalPath) || String(_0x4cf64c.sourceUrl || "").trim();
    if (!_0x5ebc44 || !_0x5b745e) {
      window.showToast?.(audioClipText("toasts.uploadFirst"), "warn");
      return;
    }
    if (this.active) {
      this.exit({
        silent: true
      });
    }
    this.active = true;
    this.audioEl = _0x4cf64c.audioEl || null;
    this.nodeId = String(_0x4cf64c.anchorId || _0x4cf64c.nodeId || "audio-source-clip");
    this.anchorNodeId = this.nodeId;
    this.wrapperEl = _0x5ebc44;
    this.durationSec = 0;
    this.startSec = Math.max(0, Number(_0x4cf64c.initialStartSec) || 0);
    this.endSec = Math.max(this.startSec, Number(_0x4cf64c.initialEndSec) || this.startSec);
    this._splitSec = null;
    this._splitRanges = null;
    this._activeSplitRangeId = "";
    this._dragRangeId = "";
    this._retryCount = 0;
    this._sourceOptions = {
      ..._0x4cf64c,
      sourceUrl: _0x5b745e,
      allowSplit: _0x4cf64c.allowSplit === true,
      dimMode: _0x4cf64c.dimMode === true
    };
    this._applyFrozenUI(true);
    this._applyDimMode(this._sourceOptions.dimMode);
    this._createUI();
    this._bindEvents();
    this._syncDurationAndDefaults();
    this._render();
  },
  _applyDimMode(_0x3cce22) {
    const _0x5b5b71 = document.getElementById("v2-wrap");
    if (_0x5b5b71) {
      if (_0x3cce22) {
        _0x5b5b71.classList.add("is-audio-clip-mode");
      } else {
        _0x5b5b71.classList.remove("is-audio-clip-mode");
      }
    }
    if (this.wrapperEl) {
      if (_0x3cce22) {
        this.wrapperEl.classList.add("is-audio-clip-target");
      } else {
        this.wrapperEl.classList.remove("is-audio-clip-target");
      }
    }
  },
  _applyFrozenUI(_0x5b1d54) {
    if (!this.wrapperEl) {
      return;
    }
    const _0x5ad155 = "is-audio-clipping";
    if (_0x5b1d54) {
      this.wrapperEl.classList.add(_0x5ad155);
    } else {
      this.wrapperEl.classList.remove(_0x5ad155);
    }
    this._applyFrozenOverlaysHidden(_0x5b1d54);
  },
  _applyFrozenOverlaysHidden(_0x426b48) {
    if (!this.wrapperEl) {
      return;
    }
    if (_0x426b48) {
      if (Array.isArray(this._hiddenEls) && this._hiddenEls.length) {
        return;
      }
      const _0x38a562 = [".audio-controls", ".node-upload-hint"];
      const _0xe6cc1d = [];
      _0x38a562.forEach(_0x27703d => {
        this.wrapperEl.querySelectorAll(_0x27703d).forEach(_0x417bcf => {
          _0xe6cc1d.push({
            el: _0x417bcf,
            prevDisplay: _0x417bcf.style.display
          });
          _0x417bcf.style.display = "none";
        });
      });
      this._hiddenEls = _0xe6cc1d;
      return;
    }
    const _0x5aed4b = Array.isArray(this._hiddenEls) ? this._hiddenEls : [];
    this._hiddenEls = null;
    _0x5aed4b.forEach(({
      el: _0x351723,
      prevDisplay: _0x1a328c
    }) => {
      if (!_0x351723 || !_0x351723.isConnected) {
        return;
      }
      _0x351723.style.display = _0x1a328c || "";
    });
  },
  _mountWhenReady() {
    const _0x15e609 = this.nodeId;
    const _0x327bd1 = () => {
      if (!this.active || this.nodeId !== _0x15e609) {
        return;
      }
      const _0x576fe7 = document.getElementById(_0x15e609);
      if (!_0x576fe7) {
        this._retryCount++;
        if (this._retryCount > 10) {
          this.exit({
            silent: true
          });
          return;
        }
        this._retryRaf = requestAnimationFrame(_0x327bd1);
        return;
      }
      this.wrapperEl = _0x576fe7;
      window.v2FocusOnNodes?.([_0x15e609]);
      this._applyFrozenUI(true);
      this._applyDimMode(true);
      this._createUI();
      this._bindEvents();
      this._syncDurationAndDefaults();
      this._render();
    };
    this._retryRaf = requestAnimationFrame(_0x327bd1);
  },
  _createUI() {
    if (!this.wrapperEl) {
      return;
    }
    this.wrapperEl.querySelectorAll(".v2-video-clipbar").forEach(_0x1aa388 => _0x1aa388.remove());
    const _0x657a33 = document.createElement("div");
    _0x657a33.className = "v2-video-clipbar";
    if (this._sourceOptions) {
      _0x657a33.classList.add("v2-audio-source-clipbar");
    }
    _0x657a33.addEventListener("pointerdown", _0x1a8110 => _0x1a8110.stopPropagation());
    _0x657a33.addEventListener("click", _0x53d7dd => _0x53d7dd.stopPropagation());
    _0x657a33.addEventListener("dblclick", _0xeec883 => {
      _0xeec883.preventDefault();
      _0xeec883.stopPropagation();
    });
    const _0x6efa9b = document.createElement("button");
    _0x6efa9b.type = "button";
    _0x6efa9b.className = "v2-video-clipbtn cancel";
    _0x6efa9b.title = audioClipText("controls.cancel");
    {
      const _0x43ddc6 = "http://www.w3.org/2000/svg";
      const _0x2437d6 = document.createElementNS(_0x43ddc6, "svg");
      _0x2437d6.setAttribute("width", "20");
      _0x2437d6.setAttribute("height", "20");
      _0x2437d6.setAttribute("viewBox", "0 0 24 24");
      _0x2437d6.setAttribute("fill", "none");
      _0x2437d6.setAttribute("stroke", "currentColor");
      _0x2437d6.setAttribute("stroke-width", "2");
      const _0x52f57d = document.createElementNS(_0x43ddc6, "path");
      _0x52f57d.setAttribute("d", "M18 6L6 18");
      const _0x206ae3 = document.createElementNS(_0x43ddc6, "path");
      _0x206ae3.setAttribute("d", "M6 6l12 12");
      _0x2437d6.appendChild(_0x52f57d);
      _0x2437d6.appendChild(_0x206ae3);
      _0x6efa9b.appendChild(_0x2437d6);
    }
    const _0xcd4b4 = document.createElement("button");
    _0xcd4b4.type = "button";
    _0xcd4b4.className = "v2-video-clipbtn confirm";
    _0xcd4b4.title = audioClipText("controls.done");
    {
      const _0x3be52b = "http://www.w3.org/2000/svg";
      const _0x3372e2 = document.createElementNS(_0x3be52b, "svg");
      _0x3372e2.setAttribute("width", "24");
      _0x3372e2.setAttribute("height", "24");
      _0x3372e2.setAttribute("viewBox", "0 0 24 24");
      _0x3372e2.setAttribute("fill", "none");
      _0x3372e2.setAttribute("stroke", "currentColor");
      _0x3372e2.setAttribute("stroke-width", "2.5");
      const _0x2a57bc = document.createElementNS(_0x3be52b, "polyline");
      _0x2a57bc.setAttribute("points", "20 6 9 17 4 12");
      _0x3372e2.appendChild(_0x2a57bc);
      _0xcd4b4.appendChild(_0x3372e2);
    }
    let _0x3445b2 = null;
    let _0x6862eb = null;
    if (this._sourceOptions?.allowSplit === true) {
      _0x3445b2 = document.createElement("button");
      _0x3445b2.type = "button";
      _0x3445b2.className = "v2-video-clipbtn split";
      _0x3445b2.title = audioClipText("controls.split");
      {
        const _0x6a9970 = "http://www.w3.org/2000/svg";
        const _0x3127c5 = document.createElementNS(_0x6a9970, "svg");
        _0x3127c5.setAttribute("width", "20");
        _0x3127c5.setAttribute("height", "20");
        _0x3127c5.setAttribute("viewBox", "0 0 24 24");
        _0x3127c5.setAttribute("fill", "none");
        _0x3127c5.setAttribute("stroke", "currentColor");
        _0x3127c5.setAttribute("stroke-width", "2");
        _0x3127c5.setAttribute("stroke-linecap", "round");
        _0x3127c5.setAttribute("stroke-linejoin", "round");
        const _0x3ccd68 = document.createElementNS(_0x6a9970, "circle");
        _0x3ccd68.setAttribute("cx", "6");
        _0x3ccd68.setAttribute("cy", "6");
        _0x3ccd68.setAttribute("r", "2");
        const _0x50cbdf = document.createElementNS(_0x6a9970, "circle");
        _0x50cbdf.setAttribute("cx", "6");
        _0x50cbdf.setAttribute("cy", "18");
        _0x50cbdf.setAttribute("r", "2");
        const _0x2b5d1b = document.createElementNS(_0x6a9970, "path");
        _0x2b5d1b.setAttribute("d", "M20 4 8.12 15.88");
        const _0x3acab1 = document.createElementNS(_0x6a9970, "path");
        _0x3acab1.setAttribute("d", "M14.47 14.48 20 20");
        const _0xc54084 = document.createElementNS(_0x6a9970, "path");
        _0xc54084.setAttribute("d", "M8.12 8.12 12 12");
        _0x3127c5.append(_0x3ccd68, _0x50cbdf, _0x2b5d1b, _0x3acab1, _0xc54084);
        _0x3445b2.appendChild(_0x3127c5);
      }
      _0x6862eb = document.createElement("button");
      _0x6862eb.type = "button";
      _0x6862eb.className = "v2-video-clipbtn undo";
      _0x6862eb.title = audioClipText("controls.undoSplit");
      {
        const _0x54001c = "http://www.w3.org/2000/svg";
        const _0x2d0c55 = document.createElementNS(_0x54001c, "svg");
        _0x2d0c55.setAttribute("width", "20");
        _0x2d0c55.setAttribute("height", "20");
        _0x2d0c55.setAttribute("viewBox", "0 0 24 24");
        _0x2d0c55.setAttribute("fill", "none");
        _0x2d0c55.setAttribute("stroke", "currentColor");
        _0x2d0c55.setAttribute("stroke-width", "2");
        _0x2d0c55.setAttribute("stroke-linecap", "round");
        _0x2d0c55.setAttribute("stroke-linejoin", "round");
        const _0x5b5e09 = document.createElementNS(_0x54001c, "path");
        _0x5b5e09.setAttribute("d", "M9 14 4 9l5-5");
        const _0x8172b6 = document.createElementNS(_0x54001c, "path");
        _0x8172b6.setAttribute("d", "M4 9h10a6 6 0 0 1 0 12h-1");
        _0x2d0c55.append(_0x5b5e09, _0x8172b6);
        _0x6862eb.appendChild(_0x2d0c55);
      }
    }
    const _0x3b74c3 = document.createElement("div");
    _0x3b74c3.className = "v2-video-cliprow";
    const _0x53504d = document.createElement("div");
    _0x53504d.className = "v2-video-cliptrack";
    const _0xaa4328 = document.createElement("div");
    _0xaa4328.className = "v2-audio-clipwave";
    {
      const _0x91c977 = "http://www.w3.org/2000/svg";
      const _0x466da9 = document.createElementNS(_0x91c977, "svg");
      _0x466da9.setAttribute("viewBox", "0 0 200 44");
      _0x466da9.setAttribute("preserveAspectRatio", "none");
      const _0x556c43 = document.createElementNS(_0x91c977, "path");
      _0x556c43.setAttribute("fill", "none");
      _0x556c43.setAttribute("d", "");
      _0x556c43.classList.add("v2-audio-clipwave-path");
      const _0x3f520f = document.createElementNS(_0x91c977, "path");
      _0x3f520f.setAttribute("fill", "none");
      _0x3f520f.setAttribute("d", "M0,22 L200,22");
      _0x3f520f.classList.add("v2-audio-clipwave-mid");
      _0x466da9.appendChild(_0x556c43);
      _0x466da9.appendChild(_0x3f520f);
      _0xaa4328.appendChild(_0x466da9);
      this._wavePathEl = _0x556c43;
    }
    const _0x145d07 = document.createElement("div");
    _0x145d07.className = "v2-video-clipticks";
    const _0x352e8f = document.createElement("div");
    _0x352e8f.className = "v2-video-cliprange";
    const _0x2a1c17 = document.createElement("div");
    _0x2a1c17.className = "v2-video-clipselection";
    const _0x447066 = document.createElement("div");
    _0x447066.className = "v2-video-clipselection v2-video-clipsplit-selection left";
    _0x447066.dataset.splitRangeId = "left";
    _0x447066.hidden = true;
    const _0x2fdb12 = document.createElement("div");
    _0x2fdb12.className = "v2-video-clipselection v2-video-clipsplit-selection right";
    _0x2fdb12.dataset.splitRangeId = "right";
    _0x2fdb12.hidden = true;
    const _0x1dfb83 = document.createElement("div");
    _0x1dfb83.className = "v2-video-clipplayhead";
    const _0x4e6af8 = document.createElement("div");
    _0x4e6af8.className = "v2-video-clipsplit-marker";
    _0x4e6af8.hidden = true;
    const _0x45d31d = document.createElement("div");
    _0x45d31d.className = "v2-video-cliphandle left";
    _0x45d31d.dataset.handle = "left";
    const _0x3d329e = document.createElement("div");
    _0x3d329e.className = "v2-video-cliphandle right";
    _0x3d329e.dataset.handle = "right";
    const _0x23341c = document.createElement("div");
    _0x23341c.className = "v2-video-cliplabel";
    _0x23341c.textContent = "0.00s";
    _0x352e8f.appendChild(_0x2a1c17);
    _0x352e8f.appendChild(_0x45d31d);
    _0x352e8f.appendChild(_0x3d329e);
    _0x53504d.appendChild(_0xaa4328);
    _0x53504d.appendChild(_0x352e8f);
    _0x53504d.appendChild(_0x447066);
    _0x53504d.appendChild(_0x2fdb12);
    _0x53504d.appendChild(_0x4e6af8);
    _0x53504d.appendChild(_0x1dfb83);
    _0x53504d.appendChild(_0x145d07);
    _0x53504d.appendChild(_0x23341c);
    _0x3b74c3.appendChild(_0x6efa9b);
    _0x3b74c3.appendChild(_0x53504d);
    if (_0x3445b2 && _0x6862eb) {
      _0x3b74c3.appendChild(_0x3445b2);
      _0x3b74c3.appendChild(_0x6862eb);
    }
    _0x3b74c3.appendChild(_0xcd4b4);
    _0x657a33.appendChild(_0x3b74c3);
    const _0x446fcf = document.createElement("div");
    _0x446fcf.className = "v2-video-cliphelper-row";
    const _0x5d68f5 = document.createElement("div");
    _0x5d68f5.className = "v2-video-cliphelper-left";
    const _0x328380 = this._buildHelperMessages();
    this._msgEls = _0x328380.map((_0x384b48, _0x414431) => {
      const _0x2fabf1 = document.createElement("div");
      _0x2fabf1.className = "v2-video-cliphelper-msg";
      if (_0x414431 !== 0) {
        _0x2fabf1.classList.add("hide-down");
      }
      _0x2fabf1.innerHTML = _0x384b48.html;
      _0x5d68f5.appendChild(_0x2fabf1);
      return _0x2fabf1;
    });
    if (this._msgInterval) {
      window.clearInterval(this._msgInterval);
    }
    let _0x107787 = 0;
    this._msgInterval = window.setInterval(() => {
      if (!this.active || !this._msgEls) {
        return;
      }
      const _0x24078b = this._msgEls[_0x107787];
      _0x107787 = (_0x107787 + 1) % this._msgEls.length;
      const _0x5bbe1a = this._msgEls[_0x107787];
      _0x24078b.classList.remove("hide-down");
      _0x24078b.classList.add("hide-up");
      _0x5bbe1a.classList.remove("hide-up");
      _0x5bbe1a.classList.remove("hide-down");
      window.setTimeout(() => {
        if (_0x24078b && _0x24078b.classList.contains("hide-up")) {
          _0x24078b.classList.remove("hide-up");
          _0x24078b.classList.add("hide-down");
        }
      }, 300);
    }, 4000);
    const _0x5b1740 = document.createElement("div");
    _0x5b1740.className = "v2-video-clip-smartwrap";
    _0x446fcf.appendChild(_0x5d68f5);
    _0x446fcf.appendChild(_0x5b1740);
    _0x657a33.appendChild(_0x446fcf);
    this.wrapperEl.appendChild(_0x657a33);
    this.barEl = _0x657a33;
    this.cancelBtnEl = _0x6efa9b;
    this.splitBtnEl = _0x3445b2;
    this.undoSplitBtnEl = _0x6862eb;
    this.confirmBtnEl = _0xcd4b4;
    this.trackEl = _0x53504d;
    this.selectionEl = _0x2a1c17;
    this.splitLeftSelectionEl = _0x447066;
    this.splitRightSelectionEl = _0x2fdb12;
    this.leftHandleEl = _0x45d31d;
    this.rightHandleEl = _0x3d329e;
    this.playheadEl = _0x1dfb83;
    this.splitMarkerEl = _0x4e6af8;
    this.labelEl = _0x23341c;
    this._subscribeLocaleChanges();
    this._syncLocaleTexts();
  },
  _buildHelperMessages() {
    return [{
      html: "<span class=\"v2-video-cliphelperkbd\">Esc</span><span>" + audioClipText("helpers.cancel") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Space</span><span>" + audioClipText("helpers.playPauseRange") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">←</span> <span class=\"v2-video-cliphelperkbd\">→</span> <span>" + audioClipText("helpers.moveRange") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Shift</span> + <span class=\"v2-video-cliphelperkbd\">←</span>/<span class=\"v2-video-cliphelperkbd\">→</span> <span>" + audioClipText("helpers.moveRangeLarge") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">I</span>/<span class=\"v2-video-cliphelperkbd\">O</span> <span>" + audioClipText("helpers.setInOut") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Ctrl</span> + <span class=\"v2-video-cliphelperkbd\">←</span>/<span class=\"v2-video-cliphelperkbd\">→</span> <span>" + audioClipText("helpers.fineTuneIn") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Alt</span> + <span class=\"v2-video-cliphelperkbd\">←</span>/<span class=\"v2-video-cliphelperkbd\">→</span> <span>" + audioClipText("helpers.fineTuneOut") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">" + audioClipText("helpers.wheelKey") + "</span><span>" + audioClipText("helpers.sameAsArrows") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">" + audioClipText("helpers.doubleClickSelection") + "</span><span>" + audioClipText("helpers.restoreDefault") + "</span>"
    }];
  },
  _subscribeLocaleChanges() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
  },
  _syncLocaleTexts() {
    if (this.cancelBtnEl) {
      this.cancelBtnEl.title = audioClipText("controls.cancel");
    }
    if (this.splitBtnEl) {
      this.splitBtnEl.title = audioClipText("controls.split");
    }
    if (this.undoSplitBtnEl) {
      this.undoSplitBtnEl.title = audioClipText("controls.undoSplit");
    }
    if (this.confirmBtnEl) {
      this.confirmBtnEl.title = audioClipText("controls.done");
    }
    if (Array.isArray(this._msgEls)) {
      const _0x3100fa = this._buildHelperMessages();
      this._msgEls.forEach((_0x30d1f8, _0x4fd0ef) => {
        if (_0x3100fa[_0x4fd0ef]) {
          _0x30d1f8.innerHTML = _0x3100fa[_0x4fd0ef].html;
        }
      });
    }
  },
  _resolveAudioSrcFromNode(_0x1bce1d) {
    if (!_0x1bce1d) {
      return "";
    }
    const _0x1e82cd = localPathToUrl(_0x1bce1d.localPath);
    return _0x1e82cd || _0x1bce1d.src || _0x1bce1d.audioUrl || _0x1bce1d.resultUrl || "";
  },
  _resolveActiveAudioSrc() {
    if (this._sourceOptions) {
      return localPathToUrl(this._sourceOptions.sourceLocalPath) || String(this._sourceOptions.sourceUrl || "").trim();
    }
    const _0xef3b3d = a890_0x39bf69.getState().nodes[this.nodeId];
    return this._resolveAudioSrcFromNode(_0xef3b3d);
  },
  _getAudioEl({
    create = true
  } = {}) {
    if (!this.wrapperEl) {
      return null;
    }
    if (this._sourceOptions) {
      if (this.audioEl && this.audioEl.isConnected) {
        return this.audioEl;
      }
      if (!create) {
        return this.audioEl || null;
      }
      const _0x5bd0aa = document.createElement("audio");
      _0x5bd0aa.className = "audio-player v2-audio-clip-hidden-player";
      _0x5bd0aa.preload = "auto";
      _0x5bd0aa.hidden = true;
      (this.barEl || this.wrapperEl).appendChild(_0x5bd0aa);
      this.audioEl = _0x5bd0aa;
      return _0x5bd0aa;
    }
    if (this.audioEl && this.audioEl.isConnected && this.wrapperEl.contains?.(this.audioEl)) {
      return this.audioEl;
    }
    const _0x5033c3 = this.wrapperEl.querySelector("audio.audio-player");
    this.audioEl = _0x5033c3 || null;
    return _0x5033c3;
  },
  _getAudioElementSource(_0xf4f695) {
    return String(_0xf4f695?.getAttribute?.("src") || _0xf4f695?.currentSrc || _0xf4f695?.src || "").trim();
  },
  _setClipMediaKeepAlive(_0x12346d, _0xc7f395) {
    if (!_0x12346d?.dataset) {
      return;
    }
    if (_0xc7f395) {
      _0x12346d.dataset.desktopMediaKeepAlive = "audio-clip";
      return;
    }
    if (_0x12346d.dataset.desktopMediaKeepAlive === "audio-clip") {
      delete _0x12346d.dataset.desktopMediaKeepAlive;
    }
  },
  _readDurationSec(_0x4bf820) {
    const _0x22ac80 = Number(_0x4bf820?.duration);
    if (!Number.isFinite(_0x22ac80) || _0x22ac80 <= 0) {
      return 0;
    }
    return _0x22ac80;
  },
  _applyDurationSec(_0x55ca58) {
    const _0x2a09ce = Number(_0x55ca58);
    if (!Number.isFinite(_0x2a09ce) || _0x2a09ce <= 0) {
      return false;
    }
    this.durationSec = _0x2a09ce;
    if (!(this.endSec > this.startSec)) {
      const _0x52dc80 = Math.min(3, _0x2a09ce);
      const _0x4944c0 = Math.max(0, (_0x2a09ce - _0x52dc80) / 2);
      this.startSec = _0x4944c0;
      this.endSec = _0x4944c0 + _0x52dc80;
      return true;
    }
    this.startSec = Math.max(0, Math.min(this.startSec, _0x2a09ce));
    this.endSec = Math.max(0, Math.min(this.endSec, _0x2a09ce));
    if (this.endSec <= this.startSec) {
      const _0x588470 = Math.min(3, _0x2a09ce);
      this.startSec = 0;
      this.endSec = _0x588470;
    }
    return true;
  },
  async _syncDurationAndDefaults() {
    const _0x1165d7 = this._resolveActiveAudioSrc();
    if (!_0x1165d7) {
      this.exit({
        silent: true
      });
      return;
    }
    const _0x482eeb = this._getAudioEl();
    if (!_0x482eeb) {
      window.showToast?.(audioClipText("toasts.playerMissing"), "error");
      this.exit({
        silent: true
      });
      return;
    }
    const _0x3d2698 = ++this._sourceToken;
    this._setClipMediaKeepAlive(_0x482eeb, true);
    try {
      _0x482eeb.pause();
    } catch (_0x207776) {}
    try {
      _0x482eeb.loop = false;
    } catch (_0x293d8e) {}
    if (!this._onLoadedMeta) {
      this._onLoadedMeta = () => {
        if (!this.active) {
          return;
        }
        const _0x6523b1 = this._readDurationSec(_0x482eeb);
        this._applyDurationSec(_0x6523b1, _0x482eeb);
        this._render();
      };
      this._onDurationChange = () => {
        if (!this.active) {
          return;
        }
        const _0x1d238e = this._readDurationSec(_0x482eeb);
        this._applyDurationSec(_0x1d238e, _0x482eeb);
        this._render();
      };
      _0x482eeb.addEventListener("loadedmetadata", this._onLoadedMeta, {
        once: true
      });
      _0x482eeb.addEventListener("durationchange", this._onDurationChange);
    }
    this._ensureWaveform(_0x1165d7);
    await attachDesktopMediaPlaybackSource(_0x482eeb, _0x1165d7);
    if (!this.active || _0x3d2698 !== this._sourceToken) {
      return;
    }
    if (!this._getAudioElementSource(_0x482eeb)) {
      _0x482eeb.preload = "auto";
      _0x482eeb.src = _0x1165d7;
      try {
        _0x482eeb.load();
      } catch (_0x4509cc) {}
    }
    const _0x47f398 = this._readDurationSec(_0x482eeb);
    if (this._applyDurationSec(_0x47f398, _0x482eeb)) {
      this._render();
      this._startPlayheadLoop();
      return;
    }
    this._startPlayheadLoop();
  },
  async _ensureWaveform(_0x3a94ef) {
    const _0x53cfcb = String(_0x3a94ef || "").trim();
    if (!_0x53cfcb) {
      return;
    }
    if (!this._wavePathEl) {
      return;
    }
    const _0x37f725 = ++this._waveToken;
    const [_0x4dec96, _0x18ed47] = await Promise.all([getWaveformBarsPathFromUrl(_0x53cfcb, {
      width: 200,
      height: 44,
      samples: 200
    }), getAudioDurationFromUrl(_0x53cfcb)]);
    if (!this.active) {
      return;
    }
    if (_0x37f725 !== this._waveToken) {
      return;
    }
    if (this._applyDurationSec(_0x18ed47)) {
      this._render();
      this._startPlayheadLoop();
    }
    if (!this._wavePathEl || !_0x4dec96) {
      return;
    }
    this._wavePathEl.setAttribute("d", _0x4dec96);
  },
  _startPlayheadLoop() {
    if (this._playheadRaf) {
      cancelAnimationFrame(this._playheadRaf);
    }
    const _0x43fb5a = () => {
      if (!this.active) {
        return;
      }
      this._renderPlayhead();
      this._playheadRaf = requestAnimationFrame(_0x43fb5a);
    };
    this._playheadRaf = requestAnimationFrame(_0x43fb5a);
  },
  _renderPlayhead() {
    if (!this.playheadEl || !this.trackEl) {
      return;
    }
    const _0x497efc = this.durationSec;
    if (!Number.isFinite(_0x497efc) || _0x497efc <= 0) {
      this.playheadEl.style.display = "none";
      return;
    }
    const _0x547eeb = this._getAudioEl({
      create: false
    });
    if (!_0x547eeb) {
      this.playheadEl.style.display = "none";
      return;
    }
    let _0x4377bd = Number(_0x547eeb.currentTime) || 0;
    const _0x3a1d4d = this._getPlaybackRange();
    if (_0x4377bd < _0x3a1d4d.startSec || _0x4377bd > _0x3a1d4d.endSec) {
      if (!_0x547eeb.paused) {
        _0x547eeb.currentTime = _0x3a1d4d.startSec;
        _0x4377bd = _0x3a1d4d.startSec;
      }
    }
    const _0x139694 = Math.max(0, Math.min(1, _0x4377bd / _0x497efc));
    this.playheadEl.style.display = "block";
    this.playheadEl.style.left = _0x139694 * 100 + "%";
  },
  _getMinSelectionSec() {
    const _0x3cc707 = this.durationSec;
    if (!Number.isFinite(_0x3cc707) || _0x3cc707 <= 0) {
      return 0.1;
    }
    return Math.min(0.1, _0x3cc707);
  },
  _normalizeSplitRange(_0xbd5c2d = {}, _0x5e3dc4 = "") {
    const _0x28d76f = this.durationSec;
    if (!Number.isFinite(_0x28d76f) || _0x28d76f <= 0) {
      return null;
    }
    const _0x521b53 = this._getMinSelectionSec();
    const _0x1ef3ae = String(_0xbd5c2d?.id || _0x5e3dc4 || "").trim();
    const _0x35acad = Number(_0xbd5c2d?.startSec);
    const _0x2c42cd = Number(_0xbd5c2d?.endSec);
    const _0x6a60e5 = Number.isFinite(_0x35acad) ? _0x35acad : 0;
    const _0x215a67 = Number.isFinite(_0x2c42cd) ? _0x2c42cd : _0x6a60e5;
    const _0x3688f3 = Math.max(0, Math.min(_0x28d76f, _0x6a60e5));
    const _0x2f38e3 = Math.max(_0x3688f3, Math.min(_0x28d76f, _0x215a67));
    if (_0x2f38e3 - _0x3688f3 < _0x521b53) {
      return null;
    }
    return {
      id: _0x1ef3ae || _0x5e3dc4,
      startSec: _0x3688f3,
      endSec: _0x2f38e3
    };
  },
  _getSplitRanges() {
    if (!Array.isArray(this._splitRanges) || this._splitRanges.length < 2) {
      return null;
    }
    const _0x114d53 = this._splitRanges.find(_0x596ce5 => _0x596ce5?.id === "left") || this._splitRanges[0];
    const _0x58d8eb = this._splitRanges.find(_0x244364 => _0x244364?.id === "right") || this._splitRanges[1];
    const _0x37f1b0 = this._normalizeSplitRange(_0x114d53, "left");
    const _0x4bda01 = this._normalizeSplitRange(_0x58d8eb, "right");
    if (!_0x37f1b0 || !_0x4bda01) {
      return null;
    }
    if (_0x37f1b0.endSec > _0x4bda01.startSec) {
      return null;
    }
    return [{
      ..._0x37f1b0,
      id: "left"
    }, {
      ..._0x4bda01,
      id: "right"
    }];
  },
  _hasSplitRanges() {
    return this._getSplitRanges() !== null;
  },
  _syncSelectionEnvelopeFromSplitRanges() {
    const _0x50b2e0 = this._getSplitRanges();
    if (!_0x50b2e0) {
      return null;
    }
    this.startSec = Math.min(..._0x50b2e0.map(_0xa801ce => _0xa801ce.startSec));
    this.endSec = Math.max(..._0x50b2e0.map(_0x45ec7f => _0x45ec7f.endSec));
    return _0x50b2e0;
  },
  _getSplitRangeById(_0x114eb2) {
    const _0x102cf2 = String(_0x114eb2 || "").trim();
    const _0x4ba539 = this._getSplitRanges();
    if (!_0x4ba539) {
      return null;
    }
    return _0x4ba539.find(_0x3bc6b9 => _0x3bc6b9.id === _0x102cf2) || null;
  },
  _getActiveSplitRange() {
    const _0x4ca0f9 = this._getSplitRanges();
    if (!_0x4ca0f9) {
      return null;
    }
    const _0x46efb6 = _0x4ca0f9.find(_0x577c45 => _0x577c45.id === this._activeSplitRangeId) || _0x4ca0f9[0];
    this._activeSplitRangeId = _0x46efb6.id;
    return _0x46efb6;
  },
  _setActiveSplitRange(_0x333762) {
    const _0x10e27a = this._getSplitRangeById(_0x333762);
    if (!_0x10e27a) {
      return null;
    }
    this._activeSplitRangeId = _0x10e27a.id;
    return _0x10e27a;
  },
  _getPlaybackRange() {
    const _0x3f226c = this._getActiveSplitRange();
    if (_0x3f226c) {
      return _0x3f226c;
    }
    return {
      id: "selection",
      startSec: this.startSec,
      endSec: this.endSec
    };
  },
  _getSplitRangeBounds(_0x3154d6) {
    const _0x9bd67b = this._getSplitRanges();
    if (!_0x9bd67b) {
      return null;
    }
    const _0x4a8d2c = _0x9bd67b.findIndex(_0x598053 => _0x598053.id === _0x3154d6);
    if (_0x4a8d2c < 0) {
      return null;
    }
    const _0x2560f1 = this.durationSec;
    return {
      minStart: _0x4a8d2c > 0 ? _0x9bd67b[_0x4a8d2c - 1].endSec : 0,
      maxEnd: _0x4a8d2c < _0x9bd67b.length - 1 ? _0x9bd67b[_0x4a8d2c + 1].startSec : _0x2560f1
    };
  },
  _replaceSplitRange(_0x2edac9, _0x1d0981 = {}) {
    const _0x3db352 = this._getSplitRanges();
    if (!_0x3db352) {
      return null;
    }
    const _0x3fccbf = _0x3db352.map(_0x3a7259 => _0x3a7259.id === _0x2edac9 ? {
      ..._0x3a7259,
      ..._0x1d0981,
      id: _0x3a7259.id
    } : _0x3a7259);
    this._splitRanges = _0x3fccbf;
    this._syncSelectionEnvelopeFromSplitRanges();
    return this._getSplitRangeById(_0x2edac9);
  },
  _getSplitRangeElement(_0x521db2) {
    if (_0x521db2 === "left") {
      return this.splitLeftSelectionEl || null;
    }
    if (_0x521db2 === "right") {
      return this.splitRightSelectionEl || null;
    }
    return null;
  },
  _getSplitRangeElementFromTarget(_0x28b0ec) {
    const _0x4bc582 = _0x28b0ec?.closest?.("[data-split-range-id]");
    const _0x1f2062 = String(_0x4bc582?.dataset?.splitRangeId || "").trim();
    if (!_0x1f2062) {
      return null;
    }
    if (this._getSplitRangeById(_0x1f2062)) {
      return _0x4bc582;
    } else {
      return null;
    }
  },
  _clearSplitRangeHover() {
    [this.splitLeftSelectionEl, this.splitRightSelectionEl].forEach(_0x389fe7 => {
      if (!_0x389fe7) {
        return;
      }
      _0x389fe7.classList?.remove?.("hover-active", "hover-left", "hover-right");
      _0x389fe7.style.cursor = "";
    });
  },
  _setSplitRangeCurrentTime(_0x4efc7f) {
    const _0x3e8223 = this._getAudioEl();
    if (!_0x3e8223 || !_0x4efc7f) {
      return;
    }
    try {
      _0x3e8223.currentTime = _0x4efc7f.startSec;
    } catch (_0x3af07d) {}
  },
  _moveSplitRangeByDelta(_0xa4db8a, _0x3abe27) {
    const _0x4291a9 = this._getSplitRangeById(_0xa4db8a);
    const _0x5e1592 = this._getSplitRangeBounds(_0xa4db8a);
    if (!_0x4291a9 || !_0x5e1592) {
      return null;
    }
    const _0x4f2c41 = Math.max(this._getMinSelectionSec(), _0x4291a9.endSec - _0x4291a9.startSec);
    const _0x37b62b = _0x5e1592.minStart;
    const _0x1115e8 = Math.max(_0x37b62b, _0x5e1592.maxEnd - _0x4f2c41);
    const _0x28082f = Math.max(_0x37b62b, Math.min(_0x1115e8, _0x4291a9.startSec + _0x3abe27));
    const _0x277417 = this._replaceSplitRange(_0xa4db8a, {
      startSec: _0x28082f,
      endSec: _0x28082f + _0x4f2c41
    });
    this._setSplitRangeCurrentTime(_0x277417);
    return _0x277417;
  },
  _resizeSplitRangeEdge(_0x3446b1, _0x337c8a, _0x29b8a1) {
    const _0x3a1506 = this._getSplitRangeById(_0x3446b1);
    const _0x359464 = this._getSplitRangeBounds(_0x3446b1);
    if (!_0x3a1506 || !_0x359464) {
      return null;
    }
    const _0x303349 = this._getMinSelectionSec();
    const _0x3b96b9 = Math.max(0, Math.min(this.durationSec, Number(_0x29b8a1) || 0));
    let _0x4ea0df = null;
    if (_0x337c8a === "left") {
      const _0x53c74a = Math.max(_0x359464.minStart, _0x3a1506.endSec - _0x303349);
      _0x4ea0df = this._replaceSplitRange(_0x3446b1, {
        startSec: Math.max(_0x359464.minStart, Math.min(_0x53c74a, _0x3b96b9))
      });
      this._setSplitRangeCurrentTime(_0x4ea0df);
      return _0x4ea0df;
    }
    if (_0x337c8a === "right") {
      const _0xfe53c3 = Math.min(_0x359464.maxEnd, _0x3a1506.startSec + _0x303349);
      _0x4ea0df = this._replaceSplitRange(_0x3446b1, {
        endSec: Math.max(_0xfe53c3, Math.min(_0x359464.maxEnd, _0x3b96b9))
      });
      return _0x4ea0df;
    }
    return null;
  },
  _getValidSplitSec(_0x11f700 = this.startSec, _0x468cab = this.endSec) {
    if (this._sourceOptions?.allowSplit !== true) {
      return null;
    }
    return normalizeAudioClipSplitSec({
      splitSec: this._splitSec,
      startSec: _0x11f700,
      endSec: _0x468cab,
      durationSec: this.durationSec,
      minLenSec: this._getMinSelectionSec()
    });
  },
  _stageSplitAtCurrentTime() {
    if (this._sourceOptions?.allowSplit !== true) {
      return false;
    }
    if (this._hasSplitRanges() || this._getValidSplitSec() !== null) {
      return false;
    }
    const _0x5d4686 = this._getAudioEl();
    const _0x4b2377 = (this.startSec + this.endSec) / 2;
    const _0x8d2b90 = Number.isFinite(Number(_0x5d4686?.currentTime)) ? Number(_0x5d4686.currentTime) : _0x4b2377;
    const _0x2faa59 = normalizeAudioClipSplitSec({
      splitSec: _0x8d2b90,
      startSec: this.startSec,
      endSec: this.endSec,
      durationSec: this.durationSec,
      minLenSec: this._getMinSelectionSec()
    });
    if (_0x2faa59 === null) {
      window.showToast?.(audioClipText("toasts.splitAtMiddle"), "warn");
      return false;
    }
    this._splitSec = _0x2faa59;
    this._splitRanges = [{
      id: "left",
      startSec: this.startSec,
      endSec: _0x2faa59
    }, {
      id: "right",
      startSec: _0x2faa59,
      endSec: this.endSec
    }];
    this._activeSplitRangeId = "right";
    this._render();
    return true;
  },
  _clearSplit() {
    if (this._splitSec === null && !this._hasSplitRanges()) {
      return;
    }
    this._splitSec = null;
    this._splitRanges = null;
    this._activeSplitRangeId = "";
    this._dragRangeId = "";
    this._render();
  },
  _bindEvents() {
    if (!this.barEl) {
      return;
    }
    this.cancelBtnEl?.addEventListener("click", _0x1a42ce => {
      _0x1a42ce.stopPropagation();
      this.exit();
    });
    this.confirmBtnEl?.addEventListener("click", _0x23df58 => {
      _0x23df58.stopPropagation();
      this._confirm();
    });
    this.splitBtnEl?.addEventListener("click", _0x1af3ab => {
      _0x1af3ab.stopPropagation();
      this._stageSplitAtCurrentTime();
    });
    this.undoSplitBtnEl?.addEventListener("click", _0x4f8a7f => {
      _0x4f8a7f.stopPropagation();
      this._clearSplit();
    });
    const _0x13f7b3 = _0x29b57a => {
      if (!this.trackEl || !this.active || this._dragMode) {
        return;
      }
      const _0x20965b = _0x29b57a.clientX;
      const _0x12d669 = this._getSplitRangeElementFromTarget(_0x29b57a.target);
      if (_0x12d669 && this._hasSplitRanges()) {
        this._clearSplitRangeHover();
        const _0x533609 = _0x12d669.getBoundingClientRect();
        const _0x2f906f = 20;
        const _0x1d85a8 = Math.abs(_0x20965b - _0x533609.left) < _0x2f906f;
        const _0x13eb73 = Math.abs(_0x20965b - _0x533609.right) < _0x2f906f;
        if (_0x1d85a8) {
          _0x12d669.classList.add("hover-active", "hover-left");
          _0x12d669.style.cursor = "var(--resize-ew-cursor)";
        } else if (_0x13eb73) {
          _0x12d669.classList.add("hover-active", "hover-right");
          _0x12d669.style.cursor = "var(--resize-ew-cursor)";
        } else {
          _0x12d669.classList.add("hover-active");
          _0x12d669.style.cursor = "var(--grab-cursor)";
        }
        this.leftHandleEl.classList.remove("hover-active");
        this.rightHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "default";
        return;
      }
      this._clearSplitRangeHover();
      const _0x395f20 = this.selectionEl.getBoundingClientRect();
      const _0x1b7192 = 20;
      const _0x1b3315 = Math.abs(_0x20965b - _0x395f20.left) < _0x1b7192;
      const _0x46eb92 = Math.abs(_0x20965b - _0x395f20.right) < _0x1b7192;
      if (_0x1b3315) {
        this.leftHandleEl.classList.add("hover-active");
        this.rightHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "var(--resize-ew-cursor)";
      } else if (_0x46eb92) {
        this.rightHandleEl.classList.add("hover-active");
        this.leftHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "var(--resize-ew-cursor)";
      } else {
        this.leftHandleEl.classList.remove("hover-active");
        this.rightHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "var(--grab-cursor)";
      }
    };
    this.trackEl?.addEventListener("pointermove", _0x13f7b3);
    const _0x1e39e0 = 30;
    const _0xded564 = _0x36b339 => Number(_0x36b339 || 1) / _0x1e39e0 * 1;
    const _0x45efa5 = () => {
      const _0x2cb094 = this.durationSec;
      if (!Number.isFinite(_0x2cb094) || _0x2cb094 <= 0) {
        return 0.1;
      }
      return Math.min(0.1, _0x2cb094);
    };
    const _0x25515d = (_0x20dd8e, _0xa134b1, _0x2d7f96) => Math.max(_0xa134b1, Math.min(_0x2d7f96, _0x20dd8e));
    const _0x422f49 = _0x1e73f1 => {
      if (!this.trackEl || !this.active) {
        return;
      }
      const _0x14cbc9 = this.durationSec;
      if (!Number.isFinite(_0x14cbc9) || _0x14cbc9 <= 0) {
        return;
      }
      const _0x3eaac9 = this._getAudioEl();
      if (!_0x3eaac9) {
        return;
      }
      const _0x48dc7d = this.trackEl.getBoundingClientRect();
      if (!_0x48dc7d.width) {
        return;
      }
      const _0x298bb0 = _0x1e73f1 - _0x48dc7d.left;
      const _0x2eb241 = _0x25515d(_0x298bb0 / _0x48dc7d.width, 0, 1);
      const _0x49652b = _0x2eb241 * _0x14cbc9;
      const _0xe07bb5 = Math.max(0, _0x14cbc9 - 0.001);
      try {
        _0x3eaac9.currentTime = _0x25515d(_0x49652b, 0, _0xe07bb5);
      } catch (_0xf97aaa) {}
      this._renderPlayhead();
    };
    const _0x2b0a38 = () => {
      const _0x622e1c = this._getAudioEl();
      if (!_0x622e1c) {
        return;
      }
      if (!_0x622e1c.paused) {
        return;
      }
      const _0x4640ef = Number(_0x622e1c.currentTime) || 0;
      const _0x20e7e1 = this._getPlaybackRange();
      if (_0x4640ef >= _0x20e7e1.startSec && _0x4640ef <= _0x20e7e1.endSec) {
        return;
      }
      try {
        _0x622e1c.currentTime = _0x20e7e1.startSec;
      } catch (_0x4f7243) {}
    };
    const _0x336148 = (_0x3b051e, _0x46597b) => {
      const _0x4ef8e8 = this.durationSec;
      if (!Number.isFinite(_0x4ef8e8) || _0x4ef8e8 <= 0) {
        return;
      }
      const _0x18ba57 = _0xded564(_0x46597b) * (_0x3b051e >= 0 ? 1 : -1);
      const _0x24b4e2 = this._getActiveSplitRange();
      if (_0x24b4e2) {
        this._moveSplitRangeByDelta(_0x24b4e2.id, _0x18ba57);
        this._render();
        return;
      }
      const _0x2530db = _0x45efa5();
      const _0x2740da = Math.max(_0x2530db, this.endSec - this.startSec);
      let _0xb3beb3 = this.startSec + _0x18ba57;
      let _0x4e2a69 = this.endSec + _0x18ba57;
      if (_0xb3beb3 < 0) {
        _0xb3beb3 = 0;
        _0x4e2a69 = _0x2740da;
      }
      if (_0x4e2a69 > _0x4ef8e8) {
        _0x4e2a69 = _0x4ef8e8;
        _0xb3beb3 = Math.max(0, _0x4ef8e8 - _0x2740da);
      }
      this.startSec = _0xb3beb3;
      this.endSec = _0x4e2a69;
      const _0x174d60 = this._getAudioEl();
      if (_0x174d60) {
        try {
          if (!_0x174d60.paused) {
            _0x174d60.pause();
          }
        } catch (_0x5c256b) {}
        try {
          _0x174d60.currentTime = _0xb3beb3;
        } catch (_0xbc2345) {}
      } else {
        _0x2b0a38();
      }
      this._render();
    };
    const _0x173284 = _0x504d69 => {
      const _0x3ec056 = this.durationSec;
      if (!Number.isFinite(_0x3ec056) || _0x3ec056 <= 0) {
        return;
      }
      const _0x2414fc = _0xded564(1) * (_0x504d69 >= 0 ? 1 : -1);
      const _0x2a7855 = this._getActiveSplitRange();
      if (_0x2a7855) {
        this._resizeSplitRangeEdge(_0x2a7855.id, "left", _0x2a7855.startSec + _0x2414fc);
        this._render();
        return;
      }
      const _0x1af48e = _0x45efa5();
      const _0x294a4c = Math.max(0, this.endSec - _0x1af48e);
      this.startSec = _0x25515d(this.startSec + _0x2414fc, 0, _0x294a4c);
      const _0x314a05 = this._getAudioEl();
      if (_0x314a05) {
        try {
          if (!_0x314a05.paused) {
            _0x314a05.pause();
          }
        } catch (_0x3a3ab2) {}
        try {
          _0x314a05.currentTime = this.startSec;
        } catch (_0x1cb46a) {}
      }
      this._render();
    };
    const _0x5f1835 = _0x3023a4 => {
      const _0x3be2d3 = this.durationSec;
      if (!Number.isFinite(_0x3be2d3) || _0x3be2d3 <= 0) {
        return;
      }
      const _0x2be702 = _0xded564(1) * (_0x3023a4 >= 0 ? 1 : -1);
      const _0x1ccc08 = this._getActiveSplitRange();
      if (_0x1ccc08) {
        this._resizeSplitRangeEdge(_0x1ccc08.id, "right", _0x1ccc08.endSec + _0x2be702);
        this._render();
        return;
      }
      const _0x3632d6 = _0x45efa5();
      const _0x5b0a36 = Math.min(_0x3be2d3, this.startSec + _0x3632d6);
      this.endSec = _0x25515d(this.endSec + _0x2be702, _0x5b0a36, _0x3be2d3);
      const _0x38a7b4 = this._getAudioEl();
      if (_0x38a7b4) {
        try {
          if (!_0x38a7b4.paused) {
            _0x38a7b4.pause();
          }
        } catch (_0x4e6608) {}
        try {
          _0x38a7b4.currentTime = this.endSec;
        } catch (_0x16e22b) {}
      }
      this._render();
    };
    const _0x34964e = _0x165684 => {
      const _0x358add = this.durationSec;
      if (!Number.isFinite(_0x358add) || _0x358add <= 0) {
        return;
      }
      const _0x28236a = this._getAudioEl();
      if (!_0x28236a) {
        return;
      }
      let _0x13ab39 = Number(_0x28236a.currentTime) || 0;
      _0x13ab39 = _0x25515d(_0x13ab39, 0, _0x358add);
      const _0xdc5098 = _0x45efa5();
      const _0x121d26 = this._getActiveSplitRange();
      if (_0x121d26) {
        this._resizeSplitRangeEdge(_0x121d26.id, _0x165684 === "in" ? "left" : "right", _0x13ab39);
        this._render();
        return;
      }
      if (_0x165684 === "in") {
        const _0x3ee94e = Math.max(0, this.endSec - _0xdc5098);
        this.startSec = _0x25515d(_0x13ab39, 0, _0x3ee94e);
      } else {
        const _0xe56b07 = Math.min(_0x358add, this.startSec + _0xdc5098);
        this.endSec = _0x25515d(_0x13ab39, _0xe56b07, _0x358add);
      }
      this._render();
    };
    const _0xd1d01f = _0x179538 => {
      if (!this.trackEl || !this.active) {
        return;
      }
      const _0x3457f1 = _0x179538.target.closest(".v2-video-cliphandle");
      const _0x5ab2f2 = this._hasSplitRanges();
      const _0x2afcf4 = _0x5ab2f2 ? this._getSplitRangeElementFromTarget(_0x179538.target) : null;
      const _0x28e754 = !_0x5ab2f2 && !!_0x179538.target.closest(".v2-video-clipselection");
      const _0x25e025 = this.trackEl.getBoundingClientRect();
      if (!_0x25e025.width) {
        return;
      }
      const _0x2fb576 = _0x179538.clientX;
      const _0x51561c = _0x2afcf4 ? _0x2afcf4.getBoundingClientRect() : this.selectionEl.getBoundingClientRect();
      const _0xc9035e = 20;
      const _0x292b7b = Math.abs(_0x2fb576 - _0x51561c.left) < _0xc9035e;
      const _0xb1c3be = Math.abs(_0x2fb576 - _0x51561c.right) < _0xc9035e;
      if (_0x2afcf4) {
        const _0x398a5c = String(_0x2afcf4.dataset.splitRangeId || "").trim();
        this._dragRangeId = _0x398a5c;
        this._setActiveSplitRange(_0x398a5c);
        this._clearSplitRangeHover();
        _0x2afcf4.classList.add("hover-active");
        if (_0x292b7b) {
          this._dragMode = "left";
          _0x2afcf4.classList.add("hover-left");
        } else if (_0xb1c3be) {
          this._dragMode = "right";
          _0x2afcf4.classList.add("hover-right");
        } else {
          this._dragMode = "move";
        }
      } else if (!_0x5ab2f2 && (_0x292b7b || _0x3457f1 && _0x3457f1.dataset.handle === "left")) {
        this._dragMode = "left";
        this.leftHandleEl.classList.add("hover-active");
      } else if (!_0x5ab2f2 && (_0xb1c3be || _0x3457f1 && _0x3457f1.dataset.handle === "right")) {
        this._dragMode = "right";
        this.rightHandleEl.classList.add("hover-active");
      } else if (!_0x5ab2f2 && _0x28e754) {
        this._dragMode = "move";
      } else {
        this._dragMode = "scrub";
        const _0x4d80b0 = this._getAudioEl();
        if (_0x4d80b0) {
          try {
            if (!_0x4d80b0.paused) {
              _0x4d80b0.pause();
            }
          } catch (_0x24bed7) {}
        }
      }
      if (this._dragMode === "move") {
        const _0x3b8ea9 = _0x2afcf4 || this.selectionEl;
        const _0x38cdf5 = _0x3b8ea9.getBoundingClientRect();
        this._dragOffsetPx = _0x179538.clientX - _0x38cdf5.left;
      } else {
        this._dragOffsetPx = 0;
      }
      _0x179538.preventDefault();
      _0x179538.stopPropagation();
      const _0xcf836c = Number(_0x179538.clientX || 0);
      let _0xdcb0f6 = false;
      if (this._dragMode === "scrub") {
        _0x422f49(_0x179538.clientX);
      } else if (this._dragMode !== "move") {
        this._handleDragAtClientX(_0x179538.clientX);
      }
      if (this._onPointerMove) {
        window.removeEventListener("pointermove", this._onPointerMove, true);
      }
      if (this._onPointerUp) {
        window.removeEventListener("pointerup", this._onPointerUp, true);
      }
      this._onPointerMove = _0x308fd3 => {
        if (!this.active || !this.trackEl) {
          return;
        }
        _0x308fd3.preventDefault();
        _0x308fd3.stopPropagation();
        const _0x3f7d2c = Number(_0x308fd3.clientX || 0);
        if (this._dragMode === "scrub") {
          _0x422f49(_0x3f7d2c);
          return;
        }
        if (this._dragMode === "move") {
          if (!_0xdcb0f6 && Math.abs(_0x3f7d2c - _0xcf836c) <= 2) {
            return;
          }
          _0xdcb0f6 = true;
        }
        this._handleDragAtClientX(_0x3f7d2c);
      };
      this._onPointerUp = _0x2e796a => {
        if (!this.active) {
          return;
        }
        _0x2e796a.preventDefault();
        _0x2e796a.stopPropagation();
        const _0x53e8f5 = this._dragMode;
        const _0x1c29a4 = shouldAudioClipSelectionPointerUpSeek(_0x53e8f5, _0xdcb0f6);
        const _0x1bff72 = Number.isFinite(Number(_0x2e796a.clientX)) ? Number(_0x2e796a.clientX) : _0xcf836c;
        this._dragMode = null;
        this._dragRangeId = "";
        this._dragOffsetPx = 0;
        this.leftHandleEl?.classList.remove("hover-active");
        this.rightHandleEl?.classList.remove("hover-active");
        this._clearSplitRangeHover();
        if (this._onPointerMove) {
          window.removeEventListener("pointermove", this._onPointerMove, true);
        }
        if (this._onPointerUp) {
          window.removeEventListener("pointerup", this._onPointerUp, true);
        }
        this._onPointerMove = null;
        this._onPointerUp = null;
        if (_0x1c29a4) {
          _0x422f49(_0x1bff72);
        }
      };
      window.addEventListener("pointermove", this._onPointerMove, true);
      window.addEventListener("pointerup", this._onPointerUp, true);
    };
    this.trackEl?.addEventListener("pointerdown", _0xd1d01f);
    this.trackEl?.addEventListener("wheel", _0x5aaf01 => {
      if (!this.active) {
        return;
      }
      _0x5aaf01.preventDefault();
      _0x5aaf01.stopPropagation();
      const _0xee79c6 = Number(_0x5aaf01.deltaX) || 0;
      const _0x56644c = Number(_0x5aaf01.deltaY) || 0;
      const _0x1a7345 = Math.abs(_0xee79c6) > Math.abs(_0x56644c) ? _0xee79c6 : _0x56644c;
      if (!_0x1a7345) {
        return;
      }
      const _0x3c186a = _0x1a7345 > 0 ? 1 : -1;
      if (_0x5aaf01.ctrlKey || _0x5aaf01.metaKey) {
        _0x173284(_0x3c186a);
      } else if (_0x5aaf01.altKey) {
        _0x5f1835(_0x3c186a);
      } else {
        const _0x26ce66 = _0x5aaf01.shiftKey ? 10 : 1;
        _0x336148(_0x3c186a, _0x26ce66);
      }
    }, {
      passive: false
    });
    this.selectionEl?.addEventListener("dblclick", _0x3705f5 => {
      if (!this.active) {
        return;
      }
      _0x3705f5.preventDefault();
      _0x3705f5.stopPropagation();
      const _0x4e15c3 = this.durationSec;
      if (!_0x4e15c3 || !Number.isFinite(_0x4e15c3) || _0x4e15c3 <= 0) {
        return;
      }
      const _0x4656ad = this.selectionEl.getBoundingClientRect();
      const _0x4b2b6a = _0x3705f5.clientX;
      const _0x588bef = 24;
      if (_0x4b2b6a - _0x4656ad.left < _0x588bef || _0x4656ad.right - _0x4b2b6a < _0x588bef) {
        return;
      }
      const _0x21ed85 = Math.min(3, _0x4e15c3);
      const _0x365b43 = (this.startSec + this.endSec) / 2;
      const _0x19c9a3 = Math.max(0, Math.min(_0x4e15c3 - _0x21ed85, _0x365b43 - _0x21ed85 / 2));
      this.startSec = _0x19c9a3;
      this.endSec = _0x19c9a3 + _0x21ed85;
      const _0x1f4a8b = this._getAudioEl();
      if (_0x1f4a8b && _0x1f4a8b.paused) {
        _0x1f4a8b.currentTime = this.startSec;
      }
      this._render();
    });
    if (this._onKeyDown) {
      window.removeEventListener("keydown", this._onKeyDown, true);
      this._onKeyDown = null;
    }
    this._onKeyDown = _0x2eacd4 => {
      if (!this.active) {
        return;
      }
      if (_0x2eacd4.key === "Escape") {
        _0x2eacd4.preventDefault();
        this.exit();
        return;
      }
      if (_0x2eacd4.key === " " || _0x2eacd4.code === "Space") {
        _0x2eacd4.preventDefault();
        const _0x201129 = this._getAudioEl();
        if (_0x201129) {
          const _0x4289df = this._getPlaybackRange();
          if (_0x201129.paused) {
            if (_0x201129.currentTime < _0x4289df.startSec || _0x201129.currentTime >= _0x4289df.endSec) {
              _0x201129.currentTime = _0x4289df.startSec;
            }
            _0x201129.play();
          } else {
            _0x201129.pause();
          }
        }
        return;
      }
      if (_0x2eacd4.key === "i" || _0x2eacd4.key === "I") {
        _0x2eacd4.preventDefault();
        _0x34964e("in");
        return;
      }
      if (_0x2eacd4.key === "o" || _0x2eacd4.key === "O") {
        _0x2eacd4.preventDefault();
        _0x34964e("out");
        return;
      }
      if (_0x2eacd4.key === "ArrowLeft" || _0x2eacd4.key === "ArrowRight") {
        _0x2eacd4.preventDefault();
        const _0x51ab71 = _0x2eacd4.key === "ArrowRight" ? 1 : -1;
        if (_0x2eacd4.ctrlKey || _0x2eacd4.metaKey) {
          _0x173284(_0x51ab71);
          return;
        }
        if (_0x2eacd4.altKey) {
          _0x5f1835(_0x51ab71);
          return;
        }
        const _0x49727b = _0x2eacd4.shiftKey ? 10 : 1;
        _0x336148(_0x51ab71, _0x49727b);
      }
    };
    window.addEventListener("keydown", this._onKeyDown, true);
    if (this._onDocClick) {
      document.removeEventListener("pointerdown", this._onDocClick, true);
      this._onDocClick = null;
    }
    this._onDocClick = _0x3ffe85 => {
      if (!this.active || !this.barEl) {
        return;
      }
      if (this.barEl.contains(_0x3ffe85.target)) {
        return;
      }
      this.exit({
        silent: true
      });
    };
    document.addEventListener("pointerdown", this._onDocClick, true);
  },
  _togglePlayRange() {
    const _0x5ce93f = this._getAudioEl();
    const _0x1cb5bd = this.durationSec;
    if (!_0x5ce93f || !Number.isFinite(_0x1cb5bd) || _0x1cb5bd <= 0) {
      return;
    }
    try {
      if (!_0x5ce93f.paused) {
        _0x5ce93f.pause();
        return;
      }
    } catch (_0x59168b) {}
    let _0x52143d = Number(_0x5ce93f.currentTime) || 0;
    const _0x8d6094 = this._getPlaybackRange();
    if (_0x52143d < _0x8d6094.startSec || _0x52143d >= _0x8d6094.endSec) {
      try {
        _0x5ce93f.currentTime = _0x8d6094.startSec;
      } catch (_0x2e3483) {}
    }
    try {
      _0x5ce93f.play();
    } catch (_0xb87eef) {}
  },
  _handleDragAtClientX(_0x781a53) {
    if (!this.trackEl || !this.active) {
      return;
    }
    const _0x537e7c = this.durationSec;
    if (!_0x537e7c || !Number.isFinite(_0x537e7c) || _0x537e7c <= 0) {
      this._render();
      return;
    }
    const _0x39c190 = this.trackEl.getBoundingClientRect();
    if (!_0x39c190.width) {
      return;
    }
    const _0x4bb3ba = _0x781a53 - _0x39c190.left;
    const _0x2ccd32 = Math.max(0, Math.min(1, _0x4bb3ba / _0x39c190.width));
    const _0x4e4f08 = _0x2ccd32 * _0x537e7c;
    const _0x5bf29b = Math.min(0.1, _0x537e7c);
    const _0x43b236 = String(this._dragRangeId || "").trim();
    if (_0x43b236 && this._hasSplitRanges()) {
      this._setActiveSplitRange(_0x43b236);
      if (this._dragMode === "left" || this._dragMode === "right") {
        this._resizeSplitRangeEdge(_0x43b236, this._dragMode, _0x4e4f08);
      } else if (this._dragMode === "move") {
        const _0x542ced = this._getSplitRangeById(_0x43b236);
        if (_0x542ced) {
          const _0x8608c9 = _0x781a53 - _0x39c190.left - this._dragOffsetPx;
          const _0x31fb92 = _0x8608c9 / _0x39c190.width * _0x537e7c;
          this._moveSplitRangeByDelta(_0x43b236, _0x31fb92 - _0x542ced.startSec);
        }
      }
      this._render();
      return;
    }
    const _0x26f85d = Math.max(_0x5bf29b, this.endSec - this.startSec);
    if (this._dragMode === "left") {
      const _0x4ef385 = Math.max(0, Math.min(_0x4e4f08, this.endSec - _0x5bf29b));
      this.startSec = _0x4ef385;
      const _0x35f55a = this._getAudioEl();
      if (_0x35f55a) {
        try {
          _0x35f55a.currentTime = _0x4ef385;
        } catch (_0x55f09c) {}
      }
    } else if (this._dragMode === "right") {
      const _0xf1a4a2 = Math.max(this.startSec + _0x5bf29b, Math.min(_0x537e7c, _0x4e4f08));
      this.endSec = _0xf1a4a2;
    } else if (this._dragMode === "move") {
      const _0x3a81f7 = this.selectionEl.getBoundingClientRect().left - _0x39c190.left;
      const _0x50033c = _0x781a53 - _0x39c190.left - this._dragOffsetPx;
      const _0x15b519 = _0x50033c - _0x3a81f7;
      const _0x55ce50 = _0x15b519 / _0x39c190.width * _0x537e7c;
      const _0x2e78cf = Math.max(0, Math.min(_0x537e7c - _0x26f85d, this.startSec + _0x55ce50));
      this.startSec = _0x2e78cf;
      this.endSec = _0x2e78cf + _0x26f85d;
      const _0x2fc549 = this._getAudioEl();
      if (_0x2fc549) {
        try {
          _0x2fc549.currentTime = _0x2e78cf;
        } catch (_0x330bec) {}
      }
    }
    this._render();
  },
  _render() {
    if (!this.active || !this.trackEl || !this.selectionEl || !this.leftHandleEl || !this.rightHandleEl) {
      return;
    }
    const _0x45621a = this.durationSec;
    const _0x5bc922 = Number.isFinite(_0x45621a) && _0x45621a > 0;
    let _0x52e4a9 = _0x5bc922 ? this._getSplitRanges() : null;
    if (Array.isArray(this._splitRanges) && this._splitRanges.length && !_0x52e4a9) {
      this._splitRanges = null;
      this._activeSplitRangeId = "";
      this._dragRangeId = "";
    }
    if (_0x52e4a9) {
      this._syncSelectionEnvelopeFromSplitRanges();
      _0x52e4a9 = this._getSplitRanges();
    }
    const _0x127edf = _0x5bc922 ? Math.max(0, Math.min(this.startSec, _0x45621a)) : 0;
    const _0x56d3a8 = _0x5bc922 ? Math.max(0, Math.min(this.endSec, _0x45621a)) : 0;
    const _0x476cae = Math.max(0, _0x56d3a8 - _0x127edf);
    if (_0x5bc922) {
      const _0x34b07a = _0x127edf / _0x45621a * 100;
      const _0x297c9b = _0x476cae / _0x45621a * 100;
      this.selectionEl.style.left = _0x34b07a + "%";
      this.selectionEl.style.width = _0x297c9b + "%";
      this.leftHandleEl.style.left = _0x34b07a + "%";
      this.rightHandleEl.style.left = _0x34b07a + _0x297c9b + "%";
      if (this.labelEl) {
        const _0x1ed735 = _0x52e4a9 ? this._getActiveSplitRange() || _0x52e4a9[0] : null;
        const _0x44c6d9 = _0x1ed735 ? _0x1ed735.startSec : _0x127edf;
        const _0x55ed6d = _0x1ed735 ? _0x1ed735.endSec : _0x56d3a8;
        const _0x48769b = _0x44c6d9 / _0x45621a * 100;
        const _0x16ad22 = (_0x55ed6d - _0x44c6d9) / _0x45621a * 100;
        this.labelEl.textContent = Math.max(0, _0x55ed6d - _0x44c6d9).toFixed(2) + "s";
        this.labelEl.style.left = _0x48769b + _0x16ad22 / 2 + "%";
      }
    } else {
      this.selectionEl.style.left = "0%";
      this.selectionEl.style.width = "0%";
      this.leftHandleEl.style.left = "0%";
      this.rightHandleEl.style.left = "0%";
      if (this.labelEl) {
        this.labelEl.textContent = audioClipText("status.loading");
        this.labelEl.style.left = "50%";
      }
    }
    const _0x38afed = _0x5bc922 && !_0x52e4a9 ? this._getValidSplitSec(_0x127edf, _0x56d3a8) : null;
    if (this._splitSec !== null && !_0x52e4a9 && _0x38afed === null) {
      this._splitSec = null;
    }
    const _0x41001a = _0x52e4a9 || (_0x38afed !== null ? [{
      id: "left",
      startSec: _0x127edf,
      endSec: _0x38afed
    }, {
      id: "right",
      startSec: _0x38afed,
      endSec: _0x56d3a8
    }] : null);
    if (this.selectionEl) {
      if (_0x41001a) {
        this.selectionEl.classList.add("has-split");
      } else {
        this.selectionEl.classList.remove("has-split");
      }
    }
    if (this.splitLeftSelectionEl && this.splitRightSelectionEl) {
      if (_0x41001a && _0x5bc922) {
        const _0x53b2fc = _0x41001a[0];
        const _0x2a541a = _0x41001a[1];
        const _0x3c578e = _0x52e4a9 ? this._getActiveSplitRange()?.id : "";
        this.splitLeftSelectionEl.hidden = false;
        this.splitRightSelectionEl.hidden = false;
        if (this.splitLeftSelectionEl.dataset) {
          this.splitLeftSelectionEl.dataset.splitRangeId = "left";
        }
        if (this.splitRightSelectionEl.dataset) {
          this.splitRightSelectionEl.dataset.splitRangeId = "right";
        }
        this.splitLeftSelectionEl.style.left = _0x53b2fc.startSec / _0x45621a * 100 + "%";
        this.splitLeftSelectionEl.style.width = Math.max(0, (_0x53b2fc.endSec - _0x53b2fc.startSec) / _0x45621a * 100) + "%";
        this.splitRightSelectionEl.style.left = _0x2a541a.startSec / _0x45621a * 100 + "%";
        this.splitRightSelectionEl.style.width = Math.max(0, (_0x2a541a.endSec - _0x2a541a.startSec) / _0x45621a * 100) + "%";
        if (_0x3c578e === "left") {
          this.splitLeftSelectionEl.classList.add("is-active");
          this.splitRightSelectionEl.classList.remove("is-active");
        } else if (_0x3c578e === "right") {
          this.splitRightSelectionEl.classList.add("is-active");
          this.splitLeftSelectionEl.classList.remove("is-active");
        } else {
          this.splitLeftSelectionEl.classList.remove("is-active");
          this.splitRightSelectionEl.classList.remove("is-active");
        }
      } else {
        this.splitLeftSelectionEl.hidden = true;
        this.splitRightSelectionEl.hidden = true;
        this.splitLeftSelectionEl.style.left = "0%";
        this.splitLeftSelectionEl.style.width = "0%";
        this.splitRightSelectionEl.style.left = "0%";
        this.splitRightSelectionEl.style.width = "0%";
        this.splitLeftSelectionEl.classList.remove("is-active");
        this.splitRightSelectionEl.classList.remove("is-active");
      }
    }
    if (this.splitMarkerEl) {
      if (!_0x52e4a9 && _0x38afed !== null && _0x5bc922) {
        this.splitMarkerEl.hidden = false;
        this.splitMarkerEl.style.left = _0x38afed / _0x45621a * 100 + "%";
      } else {
        this.splitMarkerEl.hidden = true;
        this.splitMarkerEl.style.left = "0%";
      }
    }
    if (this.splitBtnEl) {
      const _0x36822d = !_0x5bc922 || _0x41001a !== null;
      this.splitBtnEl.disabled = _0x36822d;
      this.splitBtnEl.dataset.disabled = _0x36822d ? "true" : "false";
    }
    if (this.undoSplitBtnEl) {
      const _0x5cdf93 = _0x41001a === null;
      this.undoSplitBtnEl.disabled = _0x5cdf93;
      this.undoSplitBtnEl.dataset.disabled = _0x5cdf93 ? "true" : "false";
    }
    this._renderPlayhead();
    if (this.confirmBtnEl) {
      const _0x3d8a0c = _0x52e4a9 ? _0x52e4a9.every(_0xa45a10 => _0xa45a10.endSec - _0xa45a10.startSec >= this._getMinSelectionSec()) : _0x5bc922 && _0x476cae >= 0.1;
      this.confirmBtnEl.disabled = !_0x3d8a0c;
      this.confirmBtnEl.dataset.disabled = _0x3d8a0c ? "false" : "true";
      if (this.confirmBtnEl.dataset.loading !== "true") {
        this.confirmBtnEl.innerHTML = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg>";
      }
    }
  },
  async _confirm() {
    if (!this.confirmBtnEl) {
      return;
    }
    const _0x16fe89 = this.confirmBtnEl;
    if (_0x16fe89.dataset.disabled === "true") {
      return;
    }
    const _0x34a37f = this._sourceOptions;
    let _0x370d9d = null;
    if (!_0x34a37f) {
      const _0x4bfe71 = a890_0x39bf69.getState().nodes;
      _0x370d9d = _0x4bfe71[this.anchorNodeId];
      if (!_0x370d9d) {
        this.exit({
          silent: true
        });
        return;
      }
    }
    const _0x29ac16 = this.durationSec;
    if (!_0x29ac16 || !Number.isFinite(_0x29ac16) || _0x29ac16 <= 0) {
      return;
    }
    const _0x279ed2 = this._syncSelectionEnvelopeFromSplitRanges();
    const _0x34fb99 = Math.max(0, Math.min(this.startSec, _0x29ac16));
    const _0x1d8f9d = Math.max(0, Math.min(this.endSec, _0x29ac16));
    if (!(_0x1d8f9d > _0x34fb99)) {
      return;
    }
    const _0x8cb9ca = _0x34a37f ? this._resolveActiveAudioSrc() : localPathToUrl(_0x370d9d.localPath) || _0x370d9d.src || _0x370d9d.audioUrl || _0x370d9d.resultUrl || "";
    if (!_0x8cb9ca) {
      return;
    }
    _0x16fe89.dataset.disabled = "true";
    _0x16fe89.dataset.loading = "true";
    _0x16fe89.innerHTML = "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><g style=\"animation:spin 1s linear infinite;transform-origin:50% 50%;transform-box:fill-box;\"><path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/></g></svg>";
    window.showToast?.(audioClipText("toasts.cutting"), "info");
    try {
      if (_0x34a37f) {
        if (typeof _0x34a37f.onConfirm === "function") {
          const _0x2870a9 = _0x279ed2 ? _0x279ed2.map(_0x1309ce => ({
            id: _0x1309ce.id,
            startSec: _0x1309ce.startSec,
            endSec: _0x1309ce.endSec
          })) : null;
          await _0x34a37f.onConfirm({
            startSec: _0x34fb99,
            endSec: _0x1d8f9d,
            splitSec: this._getValidSplitSec(_0x34fb99, _0x1d8f9d),
            ranges: _0x2870a9,
            sourceUrl: _0x8cb9ca,
            sourceLocalPath: String(_0x34a37f.sourceLocalPath || "")
          });
        }
        this.exit({
          silent: true
        });
        return;
      }
      let _0x3d55ab = null;
      if (canUseElectronMediaTask()) {
        _0x3d55ab = await enqueueElectronMediaTask({
          kind: "audioCut",
          nodeId: this.anchorNodeId,
          src: _0x8cb9ca,
          args: {
            start: _0x34fb99,
            end: _0x1d8f9d
          }
        }, {
          wait: true,
          timeout: 300000
        });
      } else {
        const _0x50035e = await requester({
          url: "/api/v2/audio/cut",
          method: "POST",
          provider: "local",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            src: _0x8cb9ca,
            start: _0x34fb99,
            end: _0x1d8f9d
          }),
          allow404Null: true,
          returnMeta: true
        });
        if (_0x50035e?.status === 404 || _0x50035e?.data == null) {
          throw new Error(audioClipText("errors.cutApiMissing"));
        }
        _0x3d55ab = _0x50035e.data || {};
      }
      const _0x2ad013 = _0x3d55ab?.result && typeof _0x3d55ab.result === "object" ? _0x3d55ab.result : _0x3d55ab;
      const _0x37d95c = normalizeAudioCutResultLocalPath(_0x3d55ab);
      if (!_0x37d95c || _0x3d55ab?.success === false || _0x2ad013?.success === false) {
        throw new Error(_0x2ad013?.error || _0x3d55ab?.error || _0x3d55ab?.message || audioClipText("errors.cutFailed"));
      }
      const _0x2c7c8c = _0x370d9d.width || 360;
      const _0x2979d6 = _0x370d9d.height || 150;
      const _0x201681 = calcSafeSpawnPosNearNode(a890_0x39bf69.getState().nodes, _0x370d9d, _0x2c7c8c, _0x2979d6);
      const _0x40807a = generateId("source-audio-cut");
      a890_0x39bf69.addNode({
        id: _0x40807a,
        type: "source-audio",
        x: _0x201681.x,
        y: _0x201681.y,
        width: _0x2c7c8c,
        height: _0x2979d6,
        name: audioClipText("output.nodeName", {
          name: _0x370d9d.name || audioClipText("output.audioFallback")
        }),
        src: "/" + _0x37d95c,
        localPath: _0x37d95c,
        audioDuration: Math.max(0, _0x1d8f9d - _0x34fb99),
        fileName: _0x2ad013?.filename || _0x3d55ab?.filename || "",
        waveformLocalPath: _0x2ad013?.waveformLocalPath || _0x3d55ab?.waveformLocalPath || "",
        needsAutoResize: false,
        fixedSize: true
      });
      a890_0x39bf69.setSelectedNodes([_0x40807a]);
      commit();
      window.v2FocusOnNodes?.([this.anchorNodeId, _0x40807a]);
      window._triggerLocalCacheSave?.();
      window.showToast?.(audioClipText("toasts.success"), "success");
      this.exit({
        silent: true
      });
    } catch (_0x12a1f5) {
      const _0xed9546 = _0x12a1f5 instanceof Error ? _0x12a1f5.message : String(_0x12a1f5 || audioClipText("errors.cutFailed"));
      window.showToast?.(audioClipText("toasts.failed", {
        error: _0xed9546
      }), "error");
      _0x16fe89.dataset.loading = "false";
      this._render();
      _0x16fe89.dataset.loading = "false";
    }
    _0x16fe89.dataset.loading = "false";
  },
  exit({
    silent = false
  } = {}) {
    if (!this.active) {
      return;
    }
    this.active = false;
    this._sourceToken++;
    if (this._playheadRaf) {
      cancelAnimationFrame(this._playheadRaf);
    }
    this._playheadRaf = 0;
    if (this._retryRaf) {
      cancelAnimationFrame(this._retryRaf);
    }
    this._retryRaf = 0;
    const _0x3a3a98 = this._getAudioEl();
    if (_0x3a3a98) {
      this._setClipMediaKeepAlive(_0x3a3a98, false);
      if (this._onLoadedMeta) {
        _0x3a3a98.removeEventListener("loadedmetadata", this._onLoadedMeta);
      }
      if (this._onDurationChange) {
        _0x3a3a98.removeEventListener("durationchange", this._onDurationChange);
      }
    }
    if (this._onKeyDown) {
      window.removeEventListener("keydown", this._onKeyDown, true);
      this._onKeyDown = null;
    }
    if (this._onPointerMove) {
      window.removeEventListener("pointermove", this._onPointerMove, true);
    }
    if (this._onPointerUp) {
      window.removeEventListener("pointerup", this._onPointerUp, true);
    }
    this._onPointerMove = null;
    this._onPointerUp = null;
    if (this._onDocClick) {
      document.removeEventListener("pointerdown", this._onDocClick, true);
      this._onDocClick = null;
    }
    if (this._msgInterval) {
      window.clearInterval(this._msgInterval);
      this._msgInterval = 0;
    }
    this._msgEls = null;
    this._onLoadedMeta = null;
    this._onDurationChange = null;
    this._dragMode = null;
    this._dragRangeId = "";
    this._dragOffsetPx = 0;
    if (this.barEl && this.barEl.isConnected) {
      this.barEl.remove();
    }
    this.barEl = null;
    this.trackEl = null;
    this.selectionEl = null;
    this.splitLeftSelectionEl = null;
    this.splitRightSelectionEl = null;
    this.leftHandleEl = null;
    this.rightHandleEl = null;
    this.playheadEl = null;
    this.splitMarkerEl = null;
    this.labelEl = null;
    this.cancelBtnEl = null;
    this.splitBtnEl = null;
    this.undoSplitBtnEl = null;
    this.confirmBtnEl = null;
    this._applyFrozenUI(false);
    this._applyDimMode(false);
    this.wrapperEl = null;
    this.audioEl = null;
    this.nodeId = null;
    this.anchorNodeId = null;
    this.durationSec = 0;
    this.startSec = 0;
    this.endSec = 0;
    this._splitSec = null;
    this._splitRanges = null;
    this._activeSplitRangeId = "";
    this._dragRangeId = "";
    this._sourceOptions = null;
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    if (!silent) {
      window.showToast?.(audioClipText("toasts.cancelled"), "info");
    }
  }
};
export default AudioClipController;