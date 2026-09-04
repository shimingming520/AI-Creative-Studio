import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata, isMediaElementPlaybackSource, normalizeMediaPlaybackSourceUrl } from "../services/desktopMediaBlobSource.js";
import { beginAudioPlayback, registerAudioPlaybackClient } from "./audioPlaybackCoordinator.js";
const AUDIO_VOICE_PREVIEW_ACTIONS = new Set(["play-source", "play-converted", "play-history"]);
let audioVoicePlaybackOwnerSequence = 0;
function normalizeAudioUrl(_0x2e59b9) {
  return String(_0x2e59b9 || "").trim();
}
function getAudioCacheKey(_0x14ed75) {
  const _0x4a2bcc = normalizeAudioUrl(_0x14ed75);
  if (_0x4a2bcc) {
    return normalizeMediaPlaybackSourceUrl(_0x4a2bcc) || _0x4a2bcc;
  } else {
    return "";
  }
}
export async function prepareAudioVoicePlaybackElement(_0x3ccf8a, _0xce75bd, {
  attachSource = attachMediaElementPlaybackSource,
  isPlaybackSource = isMediaElementPlaybackSource,
  preload = "auto",
  shouldAssign: _0x3c59c6
} = {}) {
  const _0x5c133b = normalizeAudioUrl(_0xce75bd);
  if (!_0x3ccf8a || !_0x5c133b) {
    return "";
  }
  const _0x26a4e6 = preload === "metadata" ? "metadata" : "auto";
  const _0x3b52a1 = String(_0x3ccf8a.__audioVoiceRequestedPreload || "");
  const _0x2f5cb8 = _0x26a4e6 === "auto" || _0x3b52a1 === "auto" ? "auto" : "metadata";
  _0x3ccf8a.__audioVoiceRequestedPreload = _0x2f5cb8;
  const _0x442ab0 = String(_0x3ccf8a.preload || "");
  const _0x149883 = isPlaybackSource(_0x3ccf8a, _0x5c133b);
  _0x3ccf8a.preload = _0x2f5cb8;
  if (typeof attachSource === "function") {
    const _0x355d0c = {
      preload: _0x2f5cb8
    };
    if (typeof _0x3c59c6 === "function") {
      _0x355d0c.shouldAssign = _0x3c59c6;
    }
    const _0x182470 = await attachSource(_0x3ccf8a, _0x5c133b, _0x355d0c);
    const _0x5f968d = _0x3ccf8a.__audioVoiceRequestedPreload === "auto" ? "auto" : _0x2f5cb8;
    if (_0x182470 && isPlaybackSource(_0x3ccf8a, _0x5c133b) && _0x5f968d === "auto" && (_0x3ccf8a.preload !== "auto" || _0x149883 && _0x2f5cb8 === "auto" && _0x442ab0 !== "auto")) {
      _0x3ccf8a.preload = "auto";
      _0x3ccf8a.load?.();
    }
    return _0x182470;
  }
  if (typeof _0x3c59c6 === "function" && _0x3c59c6() !== true) {
    return "";
  }
  _0x3ccf8a.src = _0x5c133b;
  _0x3ccf8a.load?.();
  return _0x5c133b;
}
export function isAudioVoicePreviewControlTarget(_0x220fb3) {
  const _0x299a06 = String(_0x220fb3?.closest?.("[data-audio-voice-action]")?.dataset?.audioVoiceAction || "").trim();
  return AUDIO_VOICE_PREVIEW_ACTIONS.has(_0x299a06);
}
export function createAudioVoicePlaybackSession({
  windowObject = globalThis.window,
  documentObject = globalThis.document,
  createAudioElement = () => {
    const _0x334b86 = windowObject?.Audio || globalThis.Audio;
    if (typeof _0x334b86 === "function") {
      return new _0x334b86();
    } else {
      return null;
    }
  },
  attachSource = attachMediaElementPlaybackSource,
  clearPlaybackMetadata = clearDesktopMediaPlaybackSourceMetadata,
  isPlaybackSource = isMediaElementPlaybackSource,
  isPreviewControlTarget = isAudioVoicePreviewControlTarget,
  beginPlayback = beginAudioPlayback,
  registerPlaybackClient = registerAudioPlaybackClient,
  ownerId = "audio-voice-preview:" + ++audioVoicePlaybackOwnerSequence,
  maxCachedAudioElements = 16
} = {}) {
  const _0x4879b6 = new Map();
  const _0x1060a3 = Math.max(1, Number(maxCachedAudioElements) || 16);
  let _0x1773bd = null;
  let _0x1ee1e5 = "";
  let _0x312717 = null;
  let _0x1c9fcf = null;
  let _0x12f5a8 = 0;
  let _0x36efde = 0;
  let _0x22c7b5 = false;
  const _0x4f576b = registerPlaybackClient(ownerId, {
    stopForExternalPlayback: () => _0x5e9446()
  });
  function _0x2dfc1d(_0x355738) {
    if (!_0x355738) {
      return;
    }
    try {
      _0x355738.pause?.();
    } catch {}
    try {
      _0x355738.removeAttribute?.("src");
      clearPlaybackMetadata(_0x355738);
      delete _0x355738.__audioVoiceRequestedPreload;
      _0x355738.preload = "none";
      _0x355738.load?.();
    } catch {}
  }
  function _0x53e9c0() {
    if (!_0x1773bd || !_0x312717) {
      _0x312717 = null;
      return;
    }
    _0x1773bd.removeEventListener?.("ended", _0x312717);
    _0x1773bd.removeEventListener?.("error", _0x312717);
    _0x312717 = null;
  }
  function _0x2a6925(_0x33a267) {
    _0x53e9c0();
    if (!_0x33a267?.addEventListener) {
      return;
    }
    _0x312717 = () => {
      if (_0x1773bd !== _0x33a267) {
        return;
      }
      _0x53e9c0();
      _0x1773bd = null;
      _0x1ee1e5 = "";
      _0x57d25b();
    };
    _0x33a267.addEventListener("ended", _0x312717);
    _0x33a267.addEventListener("error", _0x312717);
  }
  function _0x4228c(_0x19e0e9, _0x400303) {
    if (_0x4879b6.get(_0x19e0e9) !== _0x400303) {
      return;
    }
    _0x4879b6.delete(_0x19e0e9);
    _0x36efde += 1;
    _0x2dfc1d(_0x400303);
  }
  function _0x1c578f() {
    while (_0x4879b6.size > _0x1060a3) {
      const _0x5d36fb = [..._0x4879b6.entries()].find(([, _0x20cd6c]) => _0x20cd6c !== _0x1773bd);
      if (!_0x5d36fb) {
        return;
      }
      const [_0x3a9ec6, _0x445499] = _0x5d36fb;
      _0x4228c(_0x3a9ec6, _0x445499);
    }
  }
  function _0x58cda4(_0x3b595c) {
    const _0x55eb31 = normalizeAudioUrl(_0x3b595c);
    if (!_0x55eb31 || _0x22c7b5) {
      return null;
    }
    const _0x254ce0 = getAudioCacheKey(_0x55eb31);
    const _0x6915df = _0x4879b6.get(_0x254ce0);
    if (_0x6915df) {
      _0x4879b6.delete(_0x254ce0);
      _0x4879b6.set(_0x254ce0, _0x6915df);
      return _0x6915df;
    }
    const _0x2dfc2d = createAudioElement(_0x55eb31);
    if (!_0x2dfc2d) {
      return null;
    }
    _0x2dfc2d.preload = "auto";
    _0x4879b6.set(_0x254ce0, _0x2dfc2d);
    _0x1c578f();
    return _0x2dfc2d;
  }
  function _0x57d25b() {
    if (!_0x1c9fcf) {
      return;
    }
    documentObject?.removeEventListener?.("pointerdown", _0x1c9fcf, true);
    _0x1c9fcf = null;
  }
  function _0x2a983c() {
    const _0x2cfa73 = _0x1773bd;
    _0x53e9c0();
    _0x1773bd = null;
    _0x1ee1e5 = "";
    if (!_0x2cfa73) {
      return;
    }
    try {
      _0x2cfa73.pause?.();
    } catch {}
  }
  function _0x5e9446() {
    _0x12f5a8 += 1;
    _0x2a983c();
    _0x57d25b();
  }
  function _0x1db0d6() {
    if (_0x1c9fcf) {
      return;
    }
    _0x1c9fcf = _0x538363 => {
      if (isPreviewControlTarget(_0x538363.target)) {
        return;
      }
      _0x5e9446();
    };
    documentObject?.addEventListener?.("pointerdown", _0x1c9fcf, true);
  }
  async function _0x4631a9(_0x223efa) {
    const _0x149d21 = normalizeAudioUrl(_0x223efa);
    const _0x2fee75 = getAudioCacheKey(_0x149d21);
    const _0x2d7474 = _0x58cda4(_0x149d21);
    if (!_0x2d7474) {
      return {
        status: _0x149d21 ? "unavailable" : "missing"
      };
    }
    const _0xeec8a9 = _0x36efde;
    const _0x266011 = () => !_0x22c7b5 && _0xeec8a9 === _0x36efde && _0x4879b6.get(_0x2fee75) === _0x2d7474;
    try {
      const _0xffdeba = await prepareAudioVoicePlaybackElement(_0x2d7474, _0x149d21, {
        attachSource: attachSource,
        isPlaybackSource: isPlaybackSource,
        preload: "auto",
        shouldAssign: _0x266011
      });
      return {
        status: _0xffdeba && _0x266011() ? "ready" : "unavailable",
        audioEl: _0x2d7474
      };
    } catch {
      return {
        status: "failed",
        audioEl: _0x2d7474
      };
    }
  }
  async function _0x246634(_0x2fdc98 = [], {
    limit = 4
  } = {}) {
    const _0x80d657 = [...new Set((Array.isArray(_0x2fdc98) ? _0x2fdc98 : []).map(normalizeAudioUrl).filter(Boolean))].slice(0, Math.max(0, Number(limit) || 0));
    return await Promise.all(_0x80d657.map(_0x4631a9));
  }
  async function _0x134cc6(_0x35211f) {
    const _0x11b6d4 = normalizeAudioUrl(_0x35211f);
    if (!_0x11b6d4) {
      return {
        status: "missing"
      };
    }
    const _0x1684ee = getAudioCacheKey(_0x11b6d4);
    if (_0x1773bd && _0x1ee1e5 !== _0x1684ee) {
      _0x2a983c();
    }
    const _0x28a785 = _0x58cda4(_0x11b6d4);
    if (!_0x28a785) {
      return {
        status: "unavailable"
      };
    }
    const _0x28657d = ++_0x12f5a8;
    _0x1773bd = _0x28a785;
    _0x1ee1e5 = _0x1684ee;
    const _0x2839d8 = () => !_0x22c7b5 && _0x28657d === _0x12f5a8 && _0x1773bd === _0x28a785;
    beginPlayback(ownerId);
    try {
      const _0x1fee0b = await prepareAudioVoicePlaybackElement(_0x28a785, _0x11b6d4, {
        attachSource: attachSource,
        isPlaybackSource: isPlaybackSource,
        preload: "auto",
        shouldAssign: _0x2839d8
      });
      if (!_0x1fee0b || !_0x2839d8()) {
        return {
          status: "stale",
          audioEl: _0x28a785
        };
      }
      try {
        if (Number.isFinite(_0x28a785.duration) || _0x28a785.currentTime > 0) {
          _0x28a785.currentTime = 0;
        }
      } catch {}
      _0x1db0d6();
      _0x2a6925(_0x28a785);
      const _0x398ae9 = _0x28a785.play?.();
      if (_0x398ae9 && typeof _0x398ae9.then === "function") {
        await _0x398ae9;
      }
      if (!_0x2839d8()) {
        try {
          _0x28a785.pause?.();
        } catch {}
        return {
          status: "stale",
          audioEl: _0x28a785
        };
      }
      return {
        status: "playing",
        audioEl: _0x28a785
      };
    } catch (_0x541666) {
      if (!_0x2839d8()) {
        return {
          status: "stale",
          audioEl: _0x28a785
        };
      }
      _0x5e9446();
      _0x4228c(_0x1684ee, _0x28a785);
      return {
        status: "failed",
        audioEl: _0x28a785,
        error: _0x541666
      };
    }
  }
  function _0x4f547f() {
    _0x36efde += 1;
    _0x5e9446();
    _0x4879b6.forEach(_0xcf2f8a => {
      _0x2dfc1d(_0xcf2f8a);
    });
    _0x4879b6.clear();
  }
  function _0x3fa6ba() {
    if (_0x22c7b5) {
      return;
    }
    _0x4f547f();
    _0x4f576b?.();
    _0x22c7b5 = true;
  }
  return {
    clear: _0x4f547f,
    destroy: _0x3fa6ba,
    play: _0x134cc6,
    stop: _0x5e9446,
    warm: _0x4631a9,
    warmMany: _0x246634,
    getCacheSize: () => _0x4879b6.size
  };
}