import a516_0x464193 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { uploadFile } from "../modules/project.js";
import { cancelAudioSeparationTaskForNode, getRunningAudioSeparationTaskForNode, maybeResumeAudioSeparationLeader, runAudioSeparationFromNode } from "../modules/AudioSeparationController.js";
import { registerStaticInnerHTML, setStaticInnerHTML } from "../utils/dom.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import a516_0x17c86b from "../modules/AudioClipController.js";
import { SOURCE_AUDIO_TOOLBAR_HTML } from "./NodeToolbarConfig.js";
import { deferWaveformPathUntilAudioReady, getWaveformBarsPathFromPersistedUrl, getWaveformBarsPathFromUrl } from "../utils/audioWaveform.js";
import { createAudioPlaybackProgressController } from "../utils/audioPlaybackProgress.js";
import { normalizeAudioDurationSec, pickAudioDurationSec } from "../services/audioMetadataService.js";
import { beginAudioPlayback, registerAudioPlaybackClient } from "../modules/audioPlaybackCoordinator.js";
import { resolveCanvasAudioUrl } from "../services/canvasMediaLocalService.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata, getMediaElementCurrentSource, getMediaElementPlaybackSourceKey, isMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { shouldShowGenerationResultLoadingUi } from "../core/generationTaskUiState.js";
import { localPathToUrl, pickResultLocalPath, urlToLocalPath } from "../utils/localMediaPath.js";
import { bindRunningHubToolbarTaskButton } from "./nodeToolbar/runningHubToolbarTaskButton.js";
import { bindAudioDownloadAction } from "./nodeToolbar/audioActions/downloadAction.js";
import { bindAudioVoiceStudioAction } from "./nodeToolbar/audioActions/voiceStudioAction.js";
import { bindPreviewUploadToolbarAction } from "../modules/previewUploadEntry.js";
const WAVE = "M10,40 L10,40 M15,30 L15,50 M20,20 L20,60 M25,35 L25,45 M30,25 L30,55 M35,15 L35,65 M40,30 L40,50 M45,38 L45,42 M50,22 L50,58 M55,18 L55,62 M60,28 L60,52 M65,32 L65,48 M70,24 L70,56 M75,36 L75,44 M80,20 L80,60 M85,16 L85,64 M90,26 L90,54 M95,34 L95,46 M100,22 L100,58 M105,18 L105,62 M110,30 L110,50 M115,38 L115,42 M120,15 L120,65 M125,25 L125,55 M130,35 L130,45 M135,20 L135,60 M140,30 L140,50 M145,40 L145,40 M150,25 L150,55 M155,15 L155,65 M160,30 L160,50 M165,38 L165,42 M170,22 L170,58 M175,18 L175,62 M180,28 L180,52 M185,32 L185,48 M190,24 L190,56";
const AUDIO_PLAY_LOADING_DEADLINE_MS = 5000;
function sourceAudioText(_0x4fc33b, _0x28f42c = {}) {
  return t("sourceAudioNode." + _0x4fc33b, _0x28f42c);
}
const _SOURCE_AUDIO_NODE_TEMPLATE_ID = "node:source-audio";
registerStaticInnerHTML(_SOURCE_AUDIO_NODE_TEMPLATE_ID, SOURCE_AUDIO_TOOLBAR_HTML + "\n        <div class=\"node-card media-card audio-card\">\n        <div class=\"waveform waveform-bg\">\n          <svg width=\"100%\" height=\"80\" viewBox=\"0 0 200 80\" preserveAspectRatio=\"none\">\n            <path d=\"" + WAVE + "\" stroke=\"var(--blue)\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n            <path d=\"M0,40 L200,40\" stroke=\"var(--blue)\" stroke-width=\"1\" stroke-dasharray=\"2 4\" opacity=\"0.4\"/>\n          </svg>\n        </div>\n        <div class=\"waveform waveform-unplayed\">\n          <svg width=\"100%\" height=\"80\" viewBox=\"0 0 200 80\" preserveAspectRatio=\"none\">\n            <path d=\"" + WAVE + "\" stroke=\"var(--blue)\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n            <path d=\"M0,40 L200,40\" stroke=\"var(--blue)\" stroke-width=\"1\" stroke-dasharray=\"2 4\" opacity=\"0.4\"/>\n          </svg>\n        </div>\n        <div class=\"media-progress-line\"></div>\n        <div class=\"media-progress-bar\"></div>\n        \n        <div class=\"node-upload-hint audio-upload-hint source-upload-hint\">\n          <button type=\"button\" class=\"upload-btn audio-upload-btn source-upload-btn\">\n            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"/></svg>\n          </button>\n        </div>\n\n        <div class=\"audio-controls\">\n           <button type=\"button\" class=\"audio-play-btn\">\n              <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><polygon points=\"5 3 19 12 5 21 5 3\"/></svg>\n           </button>\n           <div class=\"audio-time-wrap\">\n             <span class=\"audio-time-display\">0:00 / 0:00</span>\n           </div>\n        </div>\n        <audio class=\"audio-player\"></audio>\n        <div class=\"node-port out-port\"></div>\n        <div class=\"node-resizer\"></div>\n      </div>");
export class SourceAudioNode {
  constructor(_0x24b0a6) {
    this._data = _0x24b0a6;
    this.el = document.createElement("div");
    this.id = _0x24b0a6.id;
    this.el.className = "v2-node-component";
    this._currentSrc = null;
    this._objUrl = null;
    this._waveKey = null;
    this._waveformLocalPath = "";
    this._waveToken = 0;
    this._cancelDeferredWaveform = null;
    this._progressController = null;
    this._audioDurationProbeToken = 0;
    this._rendererAudioWarmupPreload = "";
    this._audioLoadToken = 0;
    this._audioLoadInFlightSource = "";
    this._audioLoadInFlightPreload = "";
    this._isUploading = false;
    this._unsubscribeLocale = null;
  }
  _resolveAudioSrc(_0x12db3f) {
    return resolveCanvasAudioUrl(_0x12db3f);
  }
  mount() {
    this._subscribeLocaleChanges();
    const _0x103f65 = this.el;
    setStaticInnerHTML(_0x103f65, _SOURCE_AUDIO_NODE_TEMPLATE_ID);
    this._card = _0x103f65.querySelector(".media-card");
    this._audio = _0x103f65.querySelector(".audio-player");
    this._audio.preload = "none";
    this._playBtn = _0x103f65.querySelector(".audio-play-btn");
    this._timeEl = _0x103f65.querySelector(".audio-time-display");
    this._bar = _0x103f65.querySelector(".media-progress-bar");
    this._wavePlayed = _0x103f65.querySelector(".waveform-unplayed");
    this._progressLine = _0x103f65.querySelector(".media-progress-line");
    this._hint = _0x103f65.querySelector(".node-upload-hint");
    this._uploadBtn = _0x103f65.querySelector(".upload-btn");
    this._clipBtn = _0x103f65.querySelector(".act-clip, .clip-btn");
    this._separateBtn = _0x103f65.querySelector(".act-separate, .separate-btn");
    this._voiceStudioBtn = _0x103f65.querySelector(".act-voice-studio");
    this._speedBtn = _0x103f65.querySelector(".act-speed, .speed-btn");
    this._toolbarUploadBtn = _0x103f65.querySelector(".act-upload");
    this._downloadBtn = _0x103f65.querySelector(".act-download, .download-btn");
    this._syncLocaleTexts();
    {
      const _0x37e3ef = _0x103f65.querySelectorAll(".waveform-bg svg path");
      this._waveBgPath = _0x37e3ef && _0x37e3ef.length ? _0x37e3ef[0] : null;
      const _0x43c6d5 = _0x103f65.querySelectorAll(".waveform-unplayed svg path");
      this._waveFgPath = _0x43c6d5 && _0x43c6d5.length ? _0x43c6d5[0] : null;
    }
    this._progressController = createAudioPlaybackProgressController({
      audioEl: this._audio,
      wavePlayedEl: this._wavePlayed,
      progressLineEl: this._progressLine,
      timeEl: this._timeEl,
      trackEl: this._bar,
      formatTime: _0x542671 => this._fmt(_0x542671),
      shouldSuppressSync: () => this._isSeeking || this._bar?.dataset.dragging === "true"
    }).attach();
    const _0x10e13f = _0x103f65.querySelector(".node-floating-toolbar");
    if (_0x10e13f) {
      _0x10e13f.addEventListener("pointerdown", _0xa50d2a => _0xa50d2a.stopPropagation());
    }
    this._input = document.createElement("input");
    this._input.type = "file";
    this._input.accept = "audio/*";
    this._input.style.display = "none";
    _0x103f65.appendChild(this._input);
    this._uploadBtn.addEventListener("pointerdown", _0x52ae71 => {
      _0x52ae71.stopPropagation();
      this._input.click();
    });
    this._card.addEventListener("dblclick", _0xc907e => {
      _0xc907e.stopPropagation();
    });
    let _0x737d94 = {
      x: 0,
      y: 0
    };
    this._card.addEventListener("pointerdown", _0x284686 => {
      if (_0x284686.target.closest(".media-progress-bar")) {
        return;
      }
      _0x737d94 = {
        x: _0x284686.clientX,
        y: _0x284686.clientY
      };
    });
    this._card.addEventListener("pointerup", _0xc4e580 => {
      if (_0xc4e580.target.closest(".media-progress-bar") || _0xc4e580.target.closest(".audio-play-btn") || _0xc4e580.target.closest(".upload-btn") || _0xc4e580.target.closest(".node-floating-toolbar")) {
        return;
      }
      const _0x324158 = Math.hypot(_0xc4e580.clientX - _0x737d94.x, _0xc4e580.clientY - _0x737d94.y);
      if (_0x324158 < 5) {
        const _0x4bf548 = this._card.getBoundingClientRect();
        const _0x17d218 = Math.max(0, Math.min(1, (_0xc4e580.clientX - _0x4bf548.left) / _0x4bf548.width));
        const _0x286b04 = this._readAudioDurationSec();
        if (this._audio && _0x286b04 > 0) {
          const _0x4cc74e = _0x17d218 * _0x286b04;
          this._audio.currentTime = _0x4cc74e;
          this._progressController?.sync({
            currentTime: _0x4cc74e,
            duration: _0x286b04,
            force: true,
            showLine: true
          });
        }
      }
    });
    this._bar?.addEventListener("click", _0x271733 => {
      this._seekTo(_0x271733.clientX);
    });
    this._input.addEventListener("change", async _0x3847f2 => {
      const _0x89e9a2 = _0x3847f2.target.files[0];
      if (!_0x89e9a2) {
        return;
      }
      startLoading(this._card, {
        variant: "static"
      });
      this._progressController?.reset();
      const _0x51156d = Array.from(this._uploadBtn.childNodes).map(_0x1b7556 => _0x1b7556.cloneNode(true));
      this._isUploading = true;
      this._uploadBtn.textContent = sourceAudioText("upload.uploading");
      this._uploadBtn.style.pointerEvents = "none";
      try {
        const _0x1ca153 = window.currentProjectId || "default_v2_project";
        const _0x479d2f = await uploadFile(_0x89e9a2, _0x1ca153);
        const _0x299d7d = _0x89e9a2.name.replace(/\.[^/.]+$/, "");
        a516_0x464193.renameNode(this.id, _0x299d7d);
        const _0x4a6c57 = document.getElementById(this.id);
        const _0x5704b8 = _0x4a6c57?.__v2_name_el;
        if (_0x5704b8) {
          _0x5704b8.textContent = _0x299d7d;
        }
        const _0x4b2e96 = _0x479d2f.url;
        const _0x4b9f2e = pickResultLocalPath(_0x479d2f) || urlToLocalPath(_0x4b2e96);
        a516_0x464193.updateNodeData(this.id, {
          src: _0x4b2e96,
          localPath: _0x4b9f2e,
          audioDuration: Number(_0x479d2f.audioDuration || _0x479d2f.duration || 0) || 0,
          assetId: _0x479d2f.assetId || "",
          originalLocalPath: _0x479d2f.originalLocalPath || _0x479d2f.localPath || "",
          waveformLocalPath: _0x479d2f.waveformLocalPath || "",
          derivativeStatus: _0x479d2f.derivativeStatus || _0x479d2f.status || "",
          mediaTaskId: _0x479d2f.mediaTaskId || "",
          mediaTaskKind: _0x479d2f.mediaTaskKind || "",
          mediaTaskStatus: _0x479d2f.mediaTaskStatus || "",
          mediaTaskProgress: Number(_0x479d2f.mediaTaskProgress || 0) || 0,
          mediaTaskError: _0x479d2f.mediaTaskError || "",
          fileName: _0x479d2f.filename || _0x89e9a2.name
        });
      } catch (_0x16f327) {
        console.error("音频上传失败:", _0x16f327);
        window.showToast(sourceAudioText("upload.failedRetry"));
        stopLoading(this._card);
        if (this._currentSrc) {
          this._progressController?.sync({
            force: true,
            showLine: true
          });
        }
      } finally {
        this._uploadBtn.replaceChildren(..._0x51156d.map(_0x154fab => _0x154fab.cloneNode(true)));
        this._uploadBtn.style.pointerEvents = "auto";
        this._isUploading = false;
        this._syncLocaleTexts();
        this._input.value = "";
      }
    });
    this._playBtn.addEventListener("pointerdown", _0x236557 => {
      _0x236557.stopPropagation();
      if (this._audio.paused && this._currentSrc) {
        this._playAudio();
      } else {
        this._audio.pause();
      }
    });
    const _0x5ace2b = () => {
      if (this.prepareRendererVisibleAudioPlayback({
        eager: true
      })) {
        this.hydrateDeferredMedia();
      }
    };
    this._playBtn.addEventListener("pointerenter", _0x5ace2b);
    this._playBtn.addEventListener("focus", _0x5ace2b);
    const _0x30a4aa = [1, 1.25, 1.5, 2];
    let _0x4c468d = 0;
    this._speedBtn?.addEventListener("pointerdown", _0x472208 => {
      _0x472208.stopPropagation();
      _0x4c468d = (_0x4c468d + 1) % _0x30a4aa.length;
      const _0x105433 = _0x30a4aa[_0x4c468d];
      this._audio.playbackRate = _0x105433;
      this._speedBtn.textContent = _0x105433.toFixed(1) + "x";
    });
    this._clipBtn?.addEventListener("pointerdown", _0x1e0809 => {
      _0x1e0809.stopPropagation();
      a516_0x17c86b.init(this.id);
    });
    bindRunningHubToolbarTaskButton({
      button: this._separateBtn,
      getTask: () => getRunningAudioSeparationTaskForNode(this.id),
      cancelTask: () => cancelAudioSeparationTaskForNode(this.id, {
        notify: true
      }),
      cancelTooltip: sourceAudioText("toolbar.cancelAudioSeparation"),
      eventTypes: ["pointerdown", "click"]
    });
    this._separateBtn?.addEventListener("pointerdown", _0x4edfcc => {
      if (getRunningAudioSeparationTaskForNode(this.id)) {
        _0x4edfcc.preventDefault();
        _0x4edfcc.stopPropagation();
        cancelAudioSeparationTaskForNode(this.id, {
          notify: true
        });
        return;
      }
      _0x4edfcc.stopPropagation();
      runAudioSeparationFromNode(this.id);
    });
    bindPreviewUploadToolbarAction({
      button: this._toolbarUploadBtn
    });
    bindAudioDownloadAction({
      button: this._downloadBtn,
      getNodeData: () => a516_0x464193.getState().nodes?.[this.id] || this._data || {},
      getAudioElement: () => this._audio,
      notifyMissing: () => window.showToast?.(sourceAudioText("download.missingAudio"), "warn")
    });
    bindAudioVoiceStudioAction({
      button: this._voiceStudioBtn,
      getNodeId: () => this.id
    });
    this._audio.addEventListener("play", () => this._setIcon(false));
    this._audio.addEventListener("pause", () => this._setIcon(true));
    this._unregisterAudioPlaybackClient?.();
    this._unregisterAudioPlaybackClient = registerAudioPlaybackClient(this.id, {
      stopForExternalPlayback: () => this._stopAudioForExternalPlayback()
    });
    const _0x8fdb09 = this._resolveAudioSrc(this._data);
    if (_0x8fdb09) {
      this._prepareAudio(_0x8fdb09);
      if (this._hint) {
        this._hint.style.display = "block";
      }
    } else {
      this._progressController?.reset();
      if (this._hint) {
        this._hint.style.display = "block";
      }
    }
    this._syncGeneratingUi(this._data, _0x8fdb09);
    maybeResumeAudioSeparationLeader(this.id);
    return _0x103f65;
  }
  _syncGeneratingUi(_0xdb81e2, _0x257738) {
    const _0x2ec0ae = shouldShowGenerationResultLoadingUi(_0xdb81e2, {
      hasResult: !!_0x257738
    });
    if (this._uploadBtn) {
      this._uploadBtn.disabled = _0x2ec0ae;
    }
    if (_0x2ec0ae) {
      startLoading(this._card, {
        variant: "full"
      });
      if (this._hint) {
        this._hint.style.display = "none";
      }
      return;
    }
    const _0x456065 = !!_0x257738 && this._currentSrc === _0x257738 && this._isAudioElementReady();
    if (!_0x257738 || _0x456065) {
      stopLoading(this._card);
    }
    this._clearResolvedAudioTimer(_0xdb81e2, _0x257738);
    if (!_0x257738 && this._hint) {
      this._hint.style.display = "block";
    }
  }
  _clearResolvedAudioTimer(_0x55fee9, _0x49f5a5) {
    if (!_0x49f5a5 || !_0x55fee9 || typeof _0x55fee9 !== "object") {
      return;
    }
    if (!_0x55fee9.generationStartTime && _0x55fee9.generationDuration == null) {
      return;
    }
    const _0x112652 = a516_0x464193.getState().nodes?.[this.id];
    if (!_0x112652) {
      return;
    }
    const _0x44d927 = {};
    if (_0x112652.generationStartTime) {
      _0x44d927.generationStartTime = null;
    }
    if (_0x112652.generationDuration != null) {
      _0x44d927.generationDuration = null;
    }
    if (_0x112652.isGenerating === true) {
      _0x44d927.isGenerating = false;
    }
    if (Object.keys(_0x44d927).length > 0) {
      a516_0x464193.updateNodeData(this.id, _0x44d927);
    }
  }
  _seekTo(_0x1ac5d1) {
    const _0x422072 = this._readAudioDurationSec();
    if (!this._audio || _0x422072 <= 0) {
      return;
    }
    const _0x58029b = this._bar.getBoundingClientRect();
    if (_0x58029b.width === 0) {
      return;
    }
    let _0x8b3998 = (_0x1ac5d1 - _0x58029b.left) / _0x58029b.width;
    _0x8b3998 = Math.max(0, Math.min(1, _0x8b3998));
    const _0x2e1f2b = _0x8b3998 * _0x422072;
    if (!isFinite(_0x2e1f2b)) {
      return;
    }
    this._isSeeking = true;
    this._audio.currentTime = _0x2e1f2b;
    this._progressController?.sync({
      currentTime: _0x2e1f2b,
      duration: _0x422072,
      force: true,
      showLine: true
    });
    this._audio.addEventListener("seeked", () => {
      this._isSeeking = false;
      this._progressController?.sync({
        force: true,
        showLine: true
      });
    }, {
      once: true
    });
  }
  _getAudioElementSource() {
    return getMediaElementPlaybackSourceKey(this._audio);
  }
  _getAudioElementCurrentSource() {
    return getMediaElementCurrentSource(this._audio);
  }
  _isAudioElementReady() {
    if (!this._audio || !this._getAudioElementCurrentSource()) {
      return false;
    }
    const _0x20b61b = Number(this._audio.readyState || 0);
    return _0x20b61b >= 2;
  }
  _readAudioDurationSec() {
    const _0x1753b2 = normalizeAudioDurationSec(this._audio?.duration);
    const _0x440be0 = a516_0x464193.getState().nodes?.[this.id];
    const _0x570af6 = pickAudioDurationSec(_0x440be0?.audioDuration, !_0x440be0 ? this._data?.audioDuration : 0);
    if (_0x570af6 > 0) {
      if (!(_0x1753b2 > 0)) {
        return _0x570af6;
      }
      const _0x2682e1 = Math.max(1, _0x570af6 * 0.25);
      if (Math.abs(_0x570af6 - _0x1753b2) > _0x2682e1) {
        return _0x570af6;
      }
    }
    return _0x1753b2;
  }
  _syncKnownAudioDurationUi({
    currentTime = 0,
    showLine = false
  } = {}) {
    const _0x5a8a0c = this._readAudioDurationSec();
    if (!(_0x5a8a0c > 0)) {
      return false;
    }
    const _0x56927c = Number(currentTime);
    const _0x5b7873 = Number.isFinite(_0x56927c) ? Math.max(0, Math.min(_0x56927c, _0x5a8a0c)) : 0;
    const _0x5ee01b = this._progressController?.sync({
      currentTime: _0x5b7873,
      duration: _0x5a8a0c,
      force: true,
      showLine: showLine
    });
    if (!showLine) {
      this._progressController?.hideLine?.();
    }
    if (!_0x5ee01b && this._timeEl) {
      this._timeEl.textContent = this._fmt(_0x5b7873) + " / " + this._fmt(_0x5a8a0c);
    }
    return true;
  }
  _applyResolvedAudioDuration(_0x1265dc, _0x1e19ec = this._currentSrc) {
    if (_0x1e19ec && this._currentSrc !== _0x1e19ec) {
      return false;
    }
    const _0xb3ab78 = normalizeAudioDurationSec(_0x1265dc);
    if (!(_0xb3ab78 > 0)) {
      return false;
    }
    const _0x254a19 = a516_0x464193.getState().nodes?.[this.id];
    const _0x13f993 = pickAudioDurationSec(_0x254a19?.audioDuration, this._data?.audioDuration);
    if (_0x13f993 > 0) {
      if (Math.abs(_0x13f993 - _0xb3ab78) <= 0.001) {
        return this._syncKnownAudioDurationUi({
          currentTime: this._audio?.currentTime || 0,
          showLine: Number(this._audio?.currentTime || 0) > 0
        });
      }
      const _0x12bc78 = Math.max(1, _0x13f993 * 0.25);
      if (Math.abs(_0x13f993 - _0xb3ab78) > _0x12bc78) {
        return false;
      }
    }
    if (_0x254a19) {
      a516_0x464193.updateNodeData(this.id, {
        audioDuration: _0xb3ab78
      });
      this._data = {
        ...(this._data || {}),
        audioDuration: _0xb3ab78
      };
      this._syncKnownAudioDurationUi({
        currentTime: this._audio?.currentTime || 0,
        showLine: Number(this._audio?.currentTime || 0) > 0
      });
    } else {
      this._data = {
        ...(this._data || {}),
        audioDuration: _0xb3ab78
      };
      this._syncKnownAudioDurationUi({
        currentTime: this._audio?.currentTime || 0,
        showLine: Number(this._audio?.currentTime || 0) > 0
      });
    }
    return true;
  }
  _rewindEndedAudioIfNeeded() {
    if (!this._audio) {
      return;
    }
    const _0x3739d9 = this._readAudioDurationSec();
    if (!(_0x3739d9 > 0)) {
      return;
    }
    const _0x418981 = Number(this._audio.currentTime || 0);
    const _0x5b595f = Number.isFinite(_0x418981) && _0x418981 >= _0x3739d9 - 0.05;
    if (this._audio.ended !== true && !_0x5b595f) {
      return;
    }
    try {
      this._audio.currentTime = 0;
    } catch {}
    this._progressController?.sync({
      currentTime: 0,
      duration: _0x3739d9,
      force: true,
      showLine: true
    });
  }
  _clearAudioElementSource() {
    if (!this._audio) {
      return;
    }
    this._audioPlayAttemptToken = Number(this._audioPlayAttemptToken || 0) + 1;
    if (this._audioPlayDeadlineTimer) {
      clearTimeout(this._audioPlayDeadlineTimer);
      this._audioPlayDeadlineTimer = null;
    }
    this._audioLoadToken = Number(this._audioLoadToken || 0) + 1;
    this._audioLoadInFlightSource = "";
    this._audioLoadInFlightPreload = "";
    try {
      this._audio.pause?.();
    } catch {}
    this._audio.removeAttribute?.("src");
    clearDesktopMediaPlaybackSourceMetadata(this._audio);
    this._audio.preload = "none";
    try {
      this._audio.load?.();
    } catch {}
  }
  _bindAudioLoadHandlers(_0x239f2d) {
    if (!this._audio) {
      return;
    }
    const _0xafa853 = () => {
      if (this._currentSrc === _0x239f2d) {
        this._rememberAudioDuration(_0x239f2d);
      }
    };
    this._audio.onloadedmetadata = _0xafa853;
    this._audio.ondurationchange = _0xafa853;
    const _0x3f22bb = () => {
      if (this._currentSrc === _0x239f2d) {
        this._rememberAudioDuration(_0x239f2d);
        stopLoading(this._card);
      }
    };
    this._audio.onloadeddata = _0x3f22bb;
    this._audio.oncanplay = _0x3f22bb;
    this._audio.onplaying = _0x3f22bb;
    this._audio.onerror = () => {
      if (this._currentSrc === _0x239f2d) {
        stopLoading(this._card);
      }
    };
  }
  _prepareAudio(_0x56e467) {
    if (!_0x56e467) {
      if (typeof this._cancelDeferredWaveform === "function") {
        this._cancelDeferredWaveform();
        this._cancelDeferredWaveform = null;
      }
      this._clearAudioElementSource();
      this._currentSrc = null;
      this._progressController?.reset();
      this._audioDurationProbeToken += 1;
      stopLoading(this._card);
      return;
    }
    const _0x29800c = this._currentSrc;
    const _0x3b2fdd = _0x29800c !== _0x56e467;
    if (_0x3b2fdd) {
      this._progressController?.reset();
    }
    this._currentSrc = _0x56e467;
    if (_0x3b2fdd && _0x29800c) {
      const _0x2f9bbf = a516_0x464193.getState().nodes?.[this.id];
      if (Number(_0x2f9bbf?.audioDuration || 0) > 0) {
        a516_0x464193.updateNodeData(this.id, {
          audioDuration: 0
        });
      }
    }
    const _0x30d11c = !!this._getAudioElementCurrentSource();
    const _0x3001b4 = _0x30d11c && isMediaElementPlaybackSource(this._audio, _0x56e467);
    if (this._getAudioElementSource() && !_0x3001b4) {
      this._clearAudioElementSource();
    }
    if (!_0x3001b4) {
      this._audio.preload = "none";
    }
    this._bindAudioLoadHandlers(_0x56e467);
    this._syncKnownAudioDurationUi({
      currentTime: 0,
      showLine: false
    });
    if (_0x3001b4 || this._card?.classList?.contains?.("img-preview-loading") !== true) {
      stopLoading(this._card);
    }
    this._ensureWaveform(_0x56e467, {
      persistedOnly: true
    });
    if (this._hint) {
      this._hint.style.display = "block";
    }
  }
  prepareRendererVisibleAudioPlayback({
    eager = false
  } = {}) {
    if (!this._audio || !this._currentSrc) {
      return false;
    }
    const _0x4eef57 = eager === true ? "auto" : "metadata";
    if (this._audioLoadInFlightSource === this._currentSrc) {
      if (_0x4eef57 !== "auto" || this._audioLoadInFlightPreload === "auto") {
        return false;
      }
    }
    const _0x42f807 = !!this._getAudioElementCurrentSource();
    const _0x572603 = Number(this._audio.readyState || 0);
    const _0x5f293b = Number(this._audio.networkState || 0);
    if (_0x42f807 && (this._isAudioElementReady() || _0x5f293b === 2 || _0x4eef57 === "metadata" && this._audio.preload === "metadata" && _0x572603 >= 1)) {
      return false;
    }
    if (_0x4eef57 === "auto" || this._rendererAudioWarmupPreload !== "auto") {
      this._rendererAudioWarmupPreload = _0x4eef57;
    }
    return true;
  }
  async hydrateDeferredMedia() {
    const _0x1d91a0 = this._rendererAudioWarmupPreload || "metadata";
    this._rendererAudioWarmupPreload = "";
    if (!this._audio || !this._currentSrc) {
      return false;
    }
    try {
      return await this._loadAudio(this._currentSrc, {
        showLoading: false,
        preload: _0x1d91a0
      });
    } catch {
      stopLoading(this._card);
      return false;
    }
  }
  async _loadAudio(_0x17671a, {
    showLoading = true,
    preload = "auto"
  } = {}) {
    if (!_0x17671a) {
      this._prepareAudio("");
      return false;
    }
    const _0x59f6a0 = preload === "metadata" ? "metadata" : "auto";
    const _0x5b2ba8 = this._currentSrc;
    const _0x2ae0a3 = _0x5b2ba8 !== _0x17671a;
    if (_0x2ae0a3) {
      this._progressController?.reset();
    }
    this._currentSrc = _0x17671a;
    const _0xdddeee = Number(this._audioLoadToken || 0) + 1;
    this._audioLoadToken = _0xdddeee;
    this._audioLoadInFlightSource = _0x17671a;
    this._audioLoadInFlightPreload = _0x59f6a0;
    try {
      const _0x425cbd = !!this._getAudioElementCurrentSource();
      const _0x1679f0 = !isMediaElementPlaybackSource(this._audio, _0x17671a) || !_0x425cbd;
      const _0x2cf971 = _0x59f6a0 === "auto" && Number(this._audio?.networkState || 0) === 1;
      this._bindAudioLoadHandlers(_0x17671a);
      if (!_0x1679f0 && this._isAudioElementReady()) {
        if (_0x59f6a0 === "auto" && this._audio.preload !== "auto") {
          this._audio.preload = "auto";
        }
        stopLoading(this._card);
        return true;
      }
      if (showLoading && (_0x1679f0 || _0x2cf971)) {
        startLoading(this._card, {
          variant: "full"
        });
      }
      if (this._audioLoadToken !== _0xdddeee || this._currentSrc !== _0x17671a) {
        if (showLoading) {
          stopLoading(this._card);
        }
        return false;
      }
      if (!_0x1679f0) {
        const _0x5a29a1 = _0x59f6a0 === "auto" || this._audio.preload === "auto" ? "auto" : "metadata";
        if (this._audio.preload !== _0x5a29a1 || _0x2cf971) {
          this._audio.preload = _0x5a29a1;
          try {
            this._audio.load?.();
          } catch {}
        }
      } else {
        await attachMediaElementPlaybackSource(this._audio, _0x17671a, {
          preload: _0x59f6a0,
          warmRanges: false,
          shouldAssign: () => this._audioLoadToken === _0xdddeee && this._currentSrc === _0x17671a && this._audio?.isConnected !== false
        });
      }
      if (this._isAudioElementReady()) {
        stopLoading(this._card);
      }
      if (typeof this._cancelDeferredWaveform === "function") {
        this._cancelDeferredWaveform();
        this._cancelDeferredWaveform = null;
      }
      this._cancelDeferredWaveform = deferWaveformPathUntilAudioReady(this._audio, () => {
        this._cancelDeferredWaveform = null;
        if (this._currentSrc !== _0x17671a) {
          return;
        }
        this._ensureWaveform(_0x17671a);
      });
      if (this._hint) {
        this._hint.style.display = "block";
      }
      return true;
    } finally {
      if (this._audioLoadToken === _0xdddeee) {
        this._audioLoadInFlightSource = "";
        this._audioLoadInFlightPreload = "";
      }
    }
  }
  async _ensureWaveform(_0x51109e, {
    persistedOnly = false
  } = {}) {
    const _0x22d81c = String(_0x51109e || "").trim();
    if (!_0x22d81c) {
      return;
    }
    const _0x52b6bc = ++this._waveToken;
    this._waveKey = _0x22d81c;
    const _0x278913 = localPathToUrl(this._data?.waveformLocalPath);
    this._waveformLocalPath = String(this._data?.waveformLocalPath || "").trim();
    const _0x7835a7 = {
      width: 200,
      height: 80,
      samples: 190
    };
    let _0x2fb07a = "";
    if (_0x278913) {
      _0x2fb07a = await getWaveformBarsPathFromPersistedUrl(_0x278913, _0x7835a7);
    }
    if (!_0x2fb07a && !persistedOnly) {
      _0x2fb07a = await getWaveformBarsPathFromUrl(_0x22d81c, _0x7835a7);
    }
    if (!this._audio || !this.el || !this.el.isConnected) {
      return;
    }
    if (_0x52b6bc !== this._waveToken) {
      return;
    }
    if (!_0x2fb07a) {
      return;
    }
    if (this._waveBgPath) {
      this._waveBgPath.setAttribute("d", _0x2fb07a);
    }
    if (this._waveFgPath) {
      this._waveFgPath.setAttribute("d", _0x2fb07a);
    }
  }
  _fmt(_0x3c73a0) {
    if (!_0x3c73a0 || isNaN(_0x3c73a0)) {
      return "0:00";
    }
    return Math.floor(_0x3c73a0 / 60) + ":" + String(Math.floor(_0x3c73a0 % 60)).padStart(2, "0");
  }
  _setIcon(_0x10e219) {
    const _0x39559d = this._playBtn.querySelector("svg");
    if (!_0x39559d) {
      return;
    }
    const _0x7b6d4d = "http://www.w3.org/2000/svg";
    while (_0x39559d.firstChild) {
      _0x39559d.removeChild(_0x39559d.firstChild);
    }
    if (_0x10e219) {
      const _0xf5447 = document.createElementNS(_0x7b6d4d, "polygon");
      _0xf5447.setAttribute("points", "5 3 19 12 5 21 5 3");
      _0x39559d.appendChild(_0xf5447);
    } else {
      const _0x438362 = document.createElementNS(_0x7b6d4d, "rect");
      _0x438362.setAttribute("x", "6");
      _0x438362.setAttribute("y", "4");
      _0x438362.setAttribute("width", "4");
      _0x438362.setAttribute("height", "16");
      const _0x10d4c0 = document.createElementNS(_0x7b6d4d, "rect");
      _0x10d4c0.setAttribute("x", "14");
      _0x10d4c0.setAttribute("y", "4");
      _0x10d4c0.setAttribute("width", "4");
      _0x10d4c0.setAttribute("height", "16");
      _0x39559d.appendChild(_0x438362);
      _0x39559d.appendChild(_0x10d4c0);
    }
  }
  update(_0x3f782f) {
    this._data = _0x3f782f;
    if (!this._audio) {
      return;
    }
    const _0x30b17b = this._resolveAudioSrc(_0x3f782f);
    this._syncGeneratingUi(_0x3f782f, _0x30b17b);
    if (_0x30b17b && _0x30b17b !== this._currentSrc) {
      this._prepareAudio(_0x30b17b);
    } else if (_0x30b17b) {
      this._syncKnownAudioDurationUi({
        currentTime: this._audio?.currentTime || 0,
        showLine: Number(this._audio?.currentTime || 0) > 0
      });
      if (String(_0x3f782f?.waveformLocalPath || "").trim() && String(_0x3f782f?.waveformLocalPath || "").trim() !== this._waveformLocalPath) {
        this._ensureWaveform(_0x30b17b, {
          persistedOnly: true
        });
      }
    } else if (!_0x30b17b) {
      if (typeof this._cancelDeferredWaveform === "function") {
        this._cancelDeferredWaveform();
        this._cancelDeferredWaveform = null;
      }
      this._clearAudioElementSource();
      this._currentSrc = null;
      this._progressController?.reset();
      this._audioDurationProbeToken += 1;
      if (this._hint) {
        this._hint.style.display = shouldShowGenerationResultLoadingUi(_0x3f782f) ? "none" : "block";
      }
    }
    maybeResumeAudioSeparationLeader(this.id);
    if (this._label && _0x3f782f.name && document.activeElement !== this._label) {
      this._label.innerText = _0x3f782f.name;
    }
  }
  async _playAudio() {
    if (!this._audio || !this._currentSrc) {
      return;
    }
    beginAudioPlayback(this.id);
    const _0x2f651d = this._currentSrc;
    const _0x59bb7c = Number(this._audioPlayAttemptToken || 0) + 1;
    this._audioPlayAttemptToken = _0x59bb7c;
    if (this._audioPlayDeadlineTimer) {
      clearTimeout(this._audioPlayDeadlineTimer);
    }
    const _0x2e77dd = () => {
      if (this._audioPlayAttemptToken !== _0x59bb7c) {
        return;
      }
      if (this._audioPlayDeadlineTimer) {
        clearTimeout(this._audioPlayDeadlineTimer);
        this._audioPlayDeadlineTimer = null;
      }
    };
    this._audioPlayDeadlineTimer = setTimeout(() => {
      if (this._audioPlayAttemptToken !== _0x59bb7c || this._currentSrc !== _0x2f651d) {
        return;
      }
      this._audioPlayDeadlineTimer = null;
      this._audioLoadToken = Number(this._audioLoadToken || 0) + 1;
      this._audioLoadInFlightSource = "";
      this._audioLoadInFlightPreload = "";
      try {
        this._audio.pause?.();
      } catch {}
      stopLoading(this._card);
      this._setIcon(true);
    }, AUDIO_PLAY_LOADING_DEADLINE_MS);
    let _0x5573d4 = false;
    try {
      _0x5573d4 = await this._loadAudio(this._currentSrc, {
        showLoading: true
      });
    } catch (_0x236650) {
      _0x2e77dd();
      stopLoading(this._card);
      if (_0x236650?.name !== "AbortError") {
        console.warn("[source-audio] load failed:", _0x236650);
      }
      return;
    }
    if (!_0x5573d4 || !this._getAudioElementCurrentSource()) {
      _0x2e77dd();
      stopLoading(this._card);
      return;
    }
    this._rewindEndedAudioIfNeeded();
    const _0x59e5ae = this._audio.play();
    if (_0x59e5ae && typeof _0x59e5ae.catch === "function") {
      _0x59e5ae.then(() => {
        _0x2e77dd();
        this._rememberAudioDuration();
        stopLoading(this._card);
      }).catch(_0x4fe6c4 => {
        _0x2e77dd();
        stopLoading(this._card);
        if (_0x4fe6c4?.name === "AbortError") {
          return;
        }
        console.warn("[source-audio] play failed:", _0x4fe6c4);
      });
    } else {
      _0x2e77dd();
      stopLoading(this._card);
    }
  }
  _stopAudioForExternalPlayback() {
    if (!this._audio) {
      return;
    }
    if (typeof this._cancelDeferredWaveform === "function") {
      this._cancelDeferredWaveform();
      this._cancelDeferredWaveform = null;
    }
    try {
      this._audio.pause?.();
    } catch {}
    if (!this._getAudioElementCurrentSource()) {
      this._progressController?.reset();
    }
    stopLoading(this._card);
    this._setIcon(true);
  }
  suspendRendererMedia() {
    this._rendererAudioWarmupPreload = "";
    if (!this._audio || this._audio.paused === false) {
      return false;
    }
    this._clearAudioElementSource();
    return true;
  }
  _rememberAudioDuration(_0xe96957 = this._currentSrc) {
    if (!this._audio || _0xe96957 && this._currentSrc !== _0xe96957) {
      return;
    }
    const _0x44784b = this._readAudioDurationSec();
    if (!(_0x44784b > 0)) {
      return;
    }
    this._applyResolvedAudioDuration(_0x44784b, _0xe96957);
  }
  _subscribeLocaleChanges() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
  }
  _setUploadButtonLabel(_0x3d0469) {
    if (!this._uploadBtn) {
      return;
    }
    const _0x32f83b = this._uploadBtn.querySelector("svg")?.cloneNode(true);
    this._uploadBtn.replaceChildren();
    if (_0x32f83b) {
      this._uploadBtn.appendChild(_0x32f83b);
    }
    this._uploadBtn.appendChild(document.createTextNode(" " + _0x3d0469));
  }
  _syncLocaleTexts() {
    if (!this._uploadBtn) {
      return;
    }
    if (this._isUploading) {
      this._uploadBtn.textContent = sourceAudioText("upload.uploading");
      return;
    }
    this._setUploadButtonLabel(sourceAudioText("upload.button"));
  }
  unmount() {
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    this._unregisterAudioPlaybackClient?.();
    this._unregisterAudioPlaybackClient = null;
    this._progressController?.destroy();
    this._progressController = null;
    if (typeof this._cancelDeferredWaveform === "function") {
      this._cancelDeferredWaveform();
      this._cancelDeferredWaveform = null;
    }
    this._clearAudioElementSource();
  }
}