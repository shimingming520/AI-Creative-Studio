import { attachVideoPlaybackRecovery, playVideoWithRecovery } from "../components/video-node/mediaPlaybackRecovery.js";
import { attachMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { acquireLocalVideoPlaybackObjectUrl, releaseLocalVideoPlaybackObjectUrlOwner } from "../services/localVideoPlaybackObjectUrlService.js";
function normalizeText(_0x549451) {
  return String(_0x549451 || "").trim();
}
function requestWorkspaceVideoProgressFrame(_0x555d01) {
  const _0x273ff9 = globalThis.window?.requestAnimationFrame || globalThis.requestAnimationFrame;
  if (typeof _0x273ff9 === "function") {
    return _0x273ff9.call(globalThis.window || globalThis, _0x555d01);
  }
  return setTimeout(_0x555d01, 16);
}
function cancelWorkspaceVideoProgressFrame(_0x400b8f) {
  const _0x107e1c = globalThis.window?.cancelAnimationFrame || globalThis.cancelAnimationFrame;
  if (typeof _0x107e1c === "function") {
    _0x107e1c.call(globalThis.window || globalThis, _0x400b8f);
    return;
  }
  clearTimeout(_0x400b8f);
}
export function createWorkspaceVideoProgressLoop({
  videoEl: _0x343ed5,
  onFrame: _0x4c9664,
  requestFrame = requestWorkspaceVideoProgressFrame,
  cancelFrame = cancelWorkspaceVideoProgressFrame
} = {}) {
  if (!_0x343ed5 || typeof _0x4c9664 !== "function") {
    throw new Error("workspace video progress loop requires videoEl and onFrame");
  }
  let _0x4b3dff = false;
  let _0x3b88ed = null;
  const _0x4dc420 = () => {
    if (_0x3b88ed == null) {
      return;
    }
    cancelFrame(_0x3b88ed);
    _0x3b88ed = null;
  };
  const _0x582a10 = () => {
    _0x3b88ed = null;
    if (_0x4b3dff) {
      return;
    }
    _0x4c9664();
    if (_0x343ed5.paused || _0x343ed5.ended) {
      return;
    }
    _0x3b88ed = requestFrame(_0x582a10);
  };
  return {
    start() {
      if (_0x4b3dff || _0x3b88ed != null || _0x343ed5.paused || _0x343ed5.ended) {
        return;
      }
      _0x3b88ed = requestFrame(_0x582a10);
    },
    stop: _0x4dc420,
    destroy() {
      if (_0x4b3dff) {
        return;
      }
      _0x4b3dff = true;
      _0x4dc420();
    }
  };
}
export function createWorkspaceVideoPlayback({
  videoEl: _0x5da243,
  sourceUrl: _0x168ab7,
  ownerId: _0x27ceb4,
  acquirePlaybackUrl = acquireLocalVideoPlaybackObjectUrl,
  releasePlaybackUrlOwner = releaseLocalVideoPlaybackObjectUrlOwner,
  attachSource = attachMediaElementPlaybackSource,
  attachRecovery = attachVideoPlaybackRecovery,
  playWithRecovery = playVideoWithRecovery,
  allowConcurrentPlayback = false,
  preferStreamingSource = false,
  acquirePlaybackOptions = undefined,
  diagnosticsLabel = ""
} = {}) {
  if (!_0x5da243) {
    throw new Error("workspace video playback requires videoEl");
  }
  const _0x1dcbcd = normalizeText(_0x168ab7);
  const _0x40dff8 = normalizeText(_0x27ceb4);
  if (!_0x1dcbcd || !_0x40dff8) {
    throw new Error("workspace video playback requires sourceUrl and ownerId");
  }
  const _0x47fd29 = normalizeText(diagnosticsLabel) || "workspace-video:" + _0x40dff8;
  let _0x276250 = false;
  let _0x4007f2 = null;
  const _0x11532d = () => {
    let _0x509d35 = false;
    try {
      _0x509d35 = typeof allowConcurrentPlayback === "function" ? allowConcurrentPlayback() === true : allowConcurrentPlayback === true;
    } catch {}
    return {
      label: _0x47fd29,
      ensureSrc: () => _0x49510e({
        load: true
      }),
      shouldContinue: () => !_0x276250,
      shouldRecover: () => !_0x276250 && _0x5da243.isConnected !== false && _0x5da243.paused === false,
      allowConcurrent: _0x509d35
    };
  };
  async function _0x49510e({
    load = false
  } = {}) {
    if (_0x276250) {
      return false;
    }
    if (normalizeText(_0x5da243.getAttribute?.("src") || _0x5da243.src)) {
      _0x5da243.preload = "auto";
      return true;
    }
    if (preferStreamingSource === true) {
      if (_0x4007f2) {
        return _0x4007f2;
      }
      _0x4007f2 = (async () => {
        await attachSource(_0x5da243, _0x1dcbcd, {
          preload: "auto",
          load: load,
          shouldAssign: () => !_0x276250
        });
        return !_0x276250 && !!normalizeText(_0x5da243.getAttribute?.("src") || _0x5da243.src);
      })();
      const _0x448627 = await _0x4007f2;
      if (!_0x448627 && !_0x276250) {
        _0x4007f2 = null;
      }
      return _0x448627;
    }
    if (_0x4007f2) {
      return _0x4007f2;
    }
    _0x4007f2 = (async () => {
      let _0x35596d = "";
      try {
        _0x35596d = normalizeText(await acquirePlaybackUrl(_0x1dcbcd, _0x40dff8, acquirePlaybackOptions));
      } catch {}
      if (_0x276250) {
        return false;
      }
      await attachSource(_0x5da243, _0x1dcbcd, {
        ...(_0x35596d ? {
          playbackUrl: _0x35596d
        } : {}),
        preload: "auto",
        load: load,
        shouldAssign: () => !_0x276250
      });
      return !_0x276250 && !!normalizeText(_0x5da243.getAttribute?.("src") || _0x5da243.src);
    })();
    const _0x21ee57 = await _0x4007f2;
    if (!_0x21ee57 && !_0x276250) {
      _0x4007f2 = null;
    }
    return _0x21ee57;
  }
  return {
    warm() {
      return _0x49510e({
        load: true
      });
    },
    play() {
      if (_0x276250) {
        return Promise.resolve(false);
      }
      const _0x305a74 = _0x11532d();
      const _0x20e717 = normalizeText(_0x5da243.getAttribute?.("src") || _0x5da243.src);
      if (!_0x20e717) {
        return playWithRecovery(_0x5da243, _0x305a74);
      }
      _0x5da243.preload = "auto";
      attachRecovery(_0x5da243, _0x305a74);
      try {
        const _0x47aa89 = _0x5da243.play?.();
        return Promise.resolve(_0x47aa89).then(() => playWithRecovery(_0x5da243, _0x305a74).then(() => true, () => true), () => playWithRecovery(_0x5da243, _0x305a74));
      } catch {
        return playWithRecovery(_0x5da243, _0x305a74);
      }
    },
    destroy() {
      if (_0x276250) {
        return;
      }
      _0x276250 = true;
      try {
        _0x5da243.pause?.();
      } catch {}
      releasePlaybackUrlOwner(_0x40dff8);
    }
  };
}