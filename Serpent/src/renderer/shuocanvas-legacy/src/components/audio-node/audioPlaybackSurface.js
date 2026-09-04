import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata } from "../../services/desktopMediaBlobSource.js";
import { createAudioPlaybackProgressController } from "../../utils/audioPlaybackProgress.js";
import { getWaveformBarsPathFromPersistedUrl, getWaveformBarsPathFromUrl } from "../../utils/audioWaveform.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
function normalizeText(_0x4bd4ef) {
  return String(_0x4bd4ef ?? "").trim();
}
function escapeHtml(_0x21fbc9) {
  return String(_0x21fbc9 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeClassName(_0x3a71ed) {
  return normalizeText(_0x3a71ed).split(/\s+/).filter(_0x45845a => /^[a-zA-Z0-9_-]+$/.test(_0x45845a)).join(" ");
}
function normalizeWaveformUrl(_0x302943) {
  const _0x23067e = normalizeText(_0x302943);
  return localPathToUrl(_0x23067e) || _0x23067e;
}
function renderDataAttributes(_0x451375 = {}) {
  return Object.entries(_0x451375).filter(([_0x427397]) => /^data-[a-z0-9_.:-]+$/.test(_0x427397)).map(([_0x8c415c, _0x2327be]) => _0x2327be === false || _0x2327be === null || _0x2327be === undefined ? "" : _0x2327be === "" ? _0x8c415c : _0x8c415c + "=\"" + escapeHtml(_0x2327be) + "\"").filter(Boolean).join(" ");
}
function renderWaveform(_0x19f602 = false) {
  return "<div class=\"waveform " + (_0x19f602 ? "waveform-unplayed" : "waveform-bg") + "\"" + (_0x19f602 ? " data-audio-playback-wave-progress" : "") + ">\n    <svg width=\"100%\" height=\"80\" viewBox=\"0 0 200 80\" preserveAspectRatio=\"none\" aria-hidden=\"true\">\n      <path d=\"\" data-audio-playback-wave-path stroke=\"var(--blue)\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n      <path d=\"M0,40 L200,40\" stroke=\"var(--blue)\" stroke-width=\"1\" stroke-dasharray=\"2 4\" opacity=\"0.4\"/>\n    </svg>\n  </div>";
}
export function renderAudioPlaybackSurface({
  audioUrl = "",
  waveformUrl = "",
  className = "",
  playLabel = "播放音频",
  pauseLabel = "暂停音频",
  disabled = false,
  ariaBusy = false,
  dataAttributes = {},
  trailingHtml = ""
} = {}) {
  const _0x98db44 = normalizeText(audioUrl);
  const _0x5e8bf8 = normalizeWaveformUrl(waveformUrl);
  const _0x164e29 = normalizeClassName(className);
  const _0x10a147 = renderDataAttributes(dataAttributes);
  return "<div class=\"audio-card audio-playback-surface" + (_0x164e29 ? " " + _0x164e29 : "") + "\" data-audio-playback-surface data-audio-playback-play-label=\"" + escapeHtml(playLabel) + "\" data-audio-playback-pause-label=\"" + escapeHtml(pauseLabel) + "\"" + (_0x5e8bf8 ? " data-audio-playback-waveform-url=\"" + escapeHtml(_0x5e8bf8) + "\"" : "") + " aria-busy=\"" + Boolean(ariaBusy) + "\"" + (_0x10a147 ? " " + _0x10a147 : "") + ">\n    " + renderWaveform(false) + "\n    " + renderWaveform(true) + "\n    <div class=\"media-progress-line\" data-audio-playback-progress-line></div>\n    <div class=\"media-progress-bar\" data-audio-playback-progress-bar></div>\n    <div class=\"audio-controls\">\n      <button type=\"button\" class=\"audio-play-btn\" data-audio-playback-toggle aria-label=\"" + escapeHtml(playLabel) + "\" " + (disabled || !_0x98db44 ? "disabled" : "") + ">\n        <svg class=\"audio-playback-play-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><polygon points=\"5 3 19 12 5 21 5 3\"/></svg>\n        <svg class=\"audio-playback-pause-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M6 4h4v16H6zM14 4h4v16h-4z\"/></svg>\n      </button>\n      <div class=\"audio-time-wrap\"><span class=\"audio-time-display\" data-audio-playback-time>0:00 / 0:00</span></div>\n    </div>\n    <audio class=\"audio-player\" preload=\"metadata\" data-audio-playback-audio data-audio-playback-url=\"" + escapeHtml(_0x98db44) + "\"></audio>\n    " + String(trailingHtml || "") + "\n  </div>";
}
export function createAudioPlaybackSurfaceController(_0xd544fa, {
  audioUrl = "",
  waveformUrl = "",
  preload = "metadata",
  onBeforePlay = () => {},
  onError = () => {}
} = {}) {
  const _0x4d1797 = _0xd544fa?.querySelector?.("[data-audio-playback-audio]");
  const _0xe3612d = _0xd544fa?.querySelector?.("[data-audio-playback-toggle]");
  const _0x39618a = _0xd544fa?.querySelector?.("[data-audio-playback-progress-bar]");
  if (!_0x4d1797 || !_0xe3612d || !_0x39618a) {
    return null;
  }
  const _0x5b692c = normalizeText(audioUrl || _0x4d1797.dataset?.audioPlaybackUrl);
  const _0x5ec759 = normalizeWaveformUrl(waveformUrl || _0xd544fa.dataset?.audioPlaybackWaveformUrl);
  const _0x2f0411 = normalizeText(_0xd544fa.dataset?.audioPlaybackPlayLabel) || "播放音频";
  const _0xdc26cf = normalizeText(_0xd544fa.dataset?.audioPlaybackPauseLabel) || "暂停音频";
  let _0x193c4f = false;
  let _0x51bfb4 = null;
  const _0x1de1ea = createAudioPlaybackProgressController({
    audioEl: _0x4d1797,
    wavePlayedEl: _0xd544fa.querySelector?.("[data-audio-playback-wave-progress]"),
    progressLineEl: _0xd544fa.querySelector?.("[data-audio-playback-progress-line]"),
    timeEl: _0xd544fa.querySelector?.("[data-audio-playback-time]"),
    trackEl: _0x39618a
  }).attach();
  const _0x366c67 = _0x5b692c ? attachMediaElementPlaybackSource(_0x4d1797, _0x5b692c, {
    preload: preload,
    shouldAssign: () => !_0x193c4f && _0x4d1797.isConnected !== false
  }).catch(() => "") : Promise.resolve("");
  const _0x3cbeff = Array.from(_0xd544fa.querySelectorAll?.("[data-audio-playback-wave-path]") || []);
  (async () => {
    const _0x44e33a = {
      width: 200,
      height: 80,
      samples: 190
    };
    let _0x3b1553 = "";
    if (_0x5ec759) {
      _0x3b1553 = await getWaveformBarsPathFromPersistedUrl(_0x5ec759, _0x44e33a);
    }
    if (!_0x3b1553 && _0x5b692c) {
      _0x3b1553 = await getWaveformBarsPathFromUrl(_0x5b692c, _0x44e33a);
    }
    if (_0x193c4f || !_0x3b1553 || _0xd544fa.isConnected === false) {
      return;
    }
    _0x3cbeff.forEach(_0x4975f1 => {
      _0x4975f1.setAttribute?.("d", _0x3b1553);
    });
  })();
  const _0x3155d4 = () => {
    const _0x1e3acb = _0x4d1797.paused === false && _0x4d1797.ended !== true;
    _0xe3612d.classList?.toggle?.("is-playing", _0x1e3acb);
    _0xe3612d.setAttribute?.("aria-label", _0x1e3acb ? _0xdc26cf : _0x2f0411);
  };
  const _0x1a23aa = _0x1da287 => {
    _0x1da287.preventDefault?.();
    _0x1da287.stopPropagation?.();
    if (_0x4d1797.paused === false) {
      _0x4d1797.pause?.();
      return;
    }
    if (_0x51bfb4) {
      return;
    }
    _0x51bfb4 = (async () => {
      try {
        onBeforePlay();
        await _0x366c67;
        if (_0x193c4f || !_0x5b692c) {
          return;
        }
        if (_0x4d1797.ended) {
          _0x4d1797.currentTime = 0;
        }
        const _0x3818db = _0x4d1797.play?.();
        if (_0x3818db && typeof _0x3818db.then === "function") {
          await _0x3818db;
        }
      } catch (_0x44733c) {
        if (!_0x193c4f) {
          onError(_0x44733c);
        }
      } finally {
        _0x51bfb4 = null;
        if (!_0x193c4f) {
          _0x3155d4();
        }
      }
    })();
  };
  const _0x19eb5a = _0x3b33e9 => {
    const _0x3743d5 = Number(_0x4d1797.duration);
    const _0x56c4b5 = _0x39618a.getBoundingClientRect?.();
    if (!(_0x3743d5 > 0) || !_0x56c4b5?.width) {
      return;
    }
    const _0x45945e = Math.max(0, Math.min(1, (Number(_0x3b33e9.clientX) - _0x56c4b5.left) / _0x56c4b5.width));
    const _0x3e176e = _0x45945e * _0x3743d5;
    _0x4d1797.currentTime = _0x3e176e;
    _0x1de1ea.sync({
      currentTime: _0x3e176e,
      duration: _0x3743d5,
      force: true,
      showLine: true
    });
  };
  _0xe3612d.addEventListener?.("pointerdown", _0x1a23aa);
  _0x39618a.addEventListener?.("click", _0x19eb5a);
  _0x4d1797.addEventListener?.("play", _0x3155d4);
  _0x4d1797.addEventListener?.("pause", _0x3155d4);
  _0x4d1797.addEventListener?.("ended", _0x3155d4);
  _0x3155d4();
  return {
    audioEl: _0x4d1797,
    ready: _0x366c67,
    destroy() {
      _0x193c4f = true;
      _0x4d1797.pause?.();
      _0x1de1ea.destroy();
      clearDesktopMediaPlaybackSourceMetadata(_0x4d1797);
      _0xe3612d.removeEventListener?.("pointerdown", _0x1a23aa);
      _0x39618a.removeEventListener?.("click", _0x19eb5a);
      _0x4d1797.removeEventListener?.("play", _0x3155d4);
      _0x4d1797.removeEventListener?.("pause", _0x3155d4);
      _0x4d1797.removeEventListener?.("ended", _0x3155d4);
    }
  };
}