const DEBUG_STORAGE_KEY = "aic.videoPlaybackDebug";
const DEBUG_URL_PARAM = "aicVideoDebug";
const DEFAULT_MIN_BUFFER_AHEAD_SECONDS = 0.75;
const DEFAULT_READY_TIMEOUT_MS = 700;
const DEFAULT_RECOVERY_DEBOUNCE_MS = 250;
const DEFAULT_RECOVERY_COOLDOWN_MS = 900;
const DEFAULT_STARTUP_RECOVERY_GRACE_MS = 4000;
const DEFAULT_STARTUP_RECOVERY_MIN_PLAYED_SECONDS = 0.08;
const NATIVE_LOOP_BOUNDARY_EPSILON_SECONDS = 0.15;
const HOVER_PLAYBACK_INTENT = "hover";
const EXCLUSIVE_PLAYBACK_INTENT = "exclusive";
const videoRecoveryStates = new WeakMap();
const activePlaybackVideos = new Set();
export function isVideoPlaybackDebugEnabled() {
  try {
    if (globalThis.window?.AIC_VIDEO_DEBUG === true) {
      return true;
    }
  } catch {}
  try {
    const _0x620e96 = globalThis.localStorage?.getItem(DEBUG_STORAGE_KEY);
    if (_0x620e96 === "1" || _0x620e96 === "true") {
      return true;
    }
  } catch {}
  try {
    const _0x336f6f = globalThis.window?.location?.search || "";
    if (_0x336f6f) {
      const _0x277cbc = new URLSearchParams(_0x336f6f);
      const _0x3b22f2 = _0x277cbc.get(DEBUG_URL_PARAM);
      if (_0x3b22f2 === "1" || _0x3b22f2 === "true") {
        return true;
      }
    }
  } catch {}
  return false;
}
export function getVideoCurrentSource(_0x13c250) {
  if (!_0x13c250) {
    return "";
  }
  return String(_0x13c250.currentSrc || _0x13c250.getAttribute?.("src") || _0x13c250.src || "").trim();
}
export function getVideoBufferedRanges(_0x464e78) {
  const _0x6df1b = [];
  const _0x544080 = _0x464e78?.buffered;
  if (!_0x544080) {
    return _0x6df1b;
  }
  for (let _0x1a3c4c = 0; _0x1a3c4c < _0x544080.length; _0x1a3c4c++) {
    try {
      _0x6df1b.push({
        start: _0x544080.start(_0x1a3c4c),
        end: _0x544080.end(_0x1a3c4c)
      });
    } catch {}
  }
  return _0x6df1b;
}
export function getVideoBufferedAhead(_0x130691, _0x2b80db = null) {
  if (!_0x130691) {
    return 0;
  }
  const _0x3d4212 = _0x2b80db !== null && _0x2b80db !== undefined;
  const _0x42d554 = _0x3d4212 && Number.isFinite(Number(_0x2b80db)) ? Number(_0x2b80db) : Number(_0x130691.currentTime || 0);
  let _0x3a54de = 0;
  for (const _0x4fefd7 of getVideoBufferedRanges(_0x130691)) {
    if (_0x4fefd7.end < _0x42d554) {
      continue;
    }
    if (_0x4fefd7.start <= _0x42d554 + 0.15) {
      _0x3a54de = Math.max(_0x3a54de, _0x4fefd7.end - _0x42d554);
    }
  }
  return _0x3a54de;
}
export function hasVideoBufferedAhead(_0x2721e1, _0x1c9404 = DEFAULT_MIN_BUFFER_AHEAD_SECONDS) {
  if (!_0x2721e1) {
    return false;
  }
  const _0x136042 = Number(_0x2721e1.duration);
  const _0x577ed2 = Number(_0x2721e1.currentTime || 0);
  if (Number.isFinite(_0x136042) && _0x136042 > 0) {
    const _0x198bb8 = _0x136042 - _0x577ed2;
    if (_0x198bb8 <= Math.max(0.35, _0x1c9404)) {
      return true;
    }
  }
  if (Number(_0x2721e1.readyState || 0) >= 4) {
    return true;
  }
  return getVideoBufferedAhead(_0x2721e1, _0x577ed2) >= _0x1c9404;
}
export function getVideoPlaybackSnapshot(_0x5f1b9c) {
  return {
    currentTime: Number(_0x5f1b9c?.currentTime || 0),
    duration: Number(_0x5f1b9c?.duration || 0),
    readyState: Number(_0x5f1b9c?.readyState || 0),
    networkState: Number(_0x5f1b9c?.networkState || 0),
    paused: !!_0x5f1b9c?.paused,
    preload: String(_0x5f1b9c?.preload || ""),
    src: getVideoCurrentSource(_0x5f1b9c),
    buffered: getVideoBufferedRanges(_0x5f1b9c)
  };
}
export function logVideoPlaybackEvent(_0x31a786, _0x3b2b7e, _0x2a6f96 = {}) {
  const _0xa834d1 = videoRecoveryStates.get(_0x31a786) || {};
  const _0x23dd57 = _0x2a6f96.label || _0xa834d1.label || "video";
  if (!isVideoPlaybackDebugEnabled()) {
    return;
  }
  try {
    console.debug("[video-playback]", _0x23dd57, _0x3b2b7e, {
      ...getVideoPlaybackSnapshot(_0x31a786),
      ...(_0x2a6f96.extra || {})
    });
  } catch {}
}
export function attachVideoPlaybackRecovery(_0x2162d2, _0x4c7d8f = {}) {
  if (!_0x2162d2) {
    return null;
  }
  let _0x18e50a = videoRecoveryStates.get(_0x2162d2);
  if (!_0x18e50a) {
    _0x18e50a = {
      label: "video",
      ensureSrc: null,
      shouldRecover: null,
      minBufferAhead: DEFAULT_MIN_BUFFER_AHEAD_SECONDS,
      readyTimeoutMs: DEFAULT_READY_TIMEOUT_MS,
      recoveryDebounceMs: DEFAULT_RECOVERY_DEBOUNCE_MS,
      recoveryCooldownMs: DEFAULT_RECOVERY_COOLDOWN_MS,
      startupRecoveryGraceMs: DEFAULT_STARTUP_RECOVERY_GRACE_MS,
      startupRecoveryMinPlayedSeconds: DEFAULT_STARTUP_RECOVERY_MIN_PLAYED_SECONDS,
      recoveryTimer: null,
      lastRecoveryAt: 0,
      lastPlayRequestAt: 0,
      lastPlayingAt: 0,
      presentedSource: "",
      recoverySourceKey: "",
      recoverySourceGeneration: 0,
      playbackIntent: EXCLUSIVE_PLAYBACK_INTENT,
      playRequestGeneration: 0
    };
    videoRecoveryStates.set(_0x2162d2, _0x18e50a);
    installMediaEventListeners(_0x2162d2, _0x18e50a);
  }
  updateRecoveryState(_0x18e50a, _0x4c7d8f);
  syncRecoverySourceIdentity(_0x2162d2, _0x18e50a);
  rememberPresentedVideoSource(_0x2162d2, _0x18e50a);
  return _0x18e50a;
}
export async function prepareVideoForPlayback(_0x46305e, _0x3d05da = {}) {
  if (!_0x46305e) {
    return false;
  }
  const _0x5c75c8 = attachVideoPlaybackRecovery(_0x46305e, _0x3d05da);
  if (!(await ensureVideoSource(_0x46305e, _0x5c75c8))) {
    return false;
  }
  const _0x2c709b = _0x3d05da.preload === "metadata" || _0x3d05da.playbackIntent === HOVER_PLAYBACK_INTENT ? "metadata" : "auto";
  if (_0x46305e.preload !== _0x2c709b) {
    _0x46305e.preload = _0x2c709b;
  }
  logVideoPlaybackEvent(_0x46305e, "prepare", {
    label: _0x5c75c8.label
  });
  return true;
}
export async function playVideoWithRecovery(_0x2e6e8c, _0x5becb6 = {}) {
  if (!_0x2e6e8c) {
    return false;
  }
  const _0x3f1bd1 = attachVideoPlaybackRecovery(_0x2e6e8c, _0x5becb6);
  const _0x4acd72 = Number(_0x3f1bd1.playRequestGeneration || 0) + 1;
  _0x3f1bd1.playRequestGeneration = _0x4acd72;
  const _0x230d34 = () => _0x3f1bd1.playRequestGeneration === _0x4acd72;
  const _0x136538 = await prepareVideoForPlayback(_0x2e6e8c, _0x5becb6);
  if (!_0x136538 || !_0x230d34()) {
    return false;
  }
  if (!shouldContinuePlayback(_0x5becb6)) {
    if (_0x230d34()) {
      safePause(_0x2e6e8c);
    }
    return false;
  }
  if (_0x5becb6.waitForReadyBeforePlay === true) {
    await waitForVideoReadiness(_0x2e6e8c, _0x3f1bd1.readyTimeoutMs);
    if (!_0x230d34()) {
      return false;
    }
    if (!shouldContinuePlayback(_0x5becb6)) {
      if (_0x230d34()) {
        safePause(_0x2e6e8c);
      }
      return false;
    }
  }
  const _0x204374 = resolvePlaybackIntent(_0x2e6e8c, _0x3f1bd1, _0x5becb6.playbackIntent);
  if (_0x5becb6.allowConcurrent !== true && !prepareActiveVideosForPlayback(_0x2e6e8c, _0x204374)) {
    if (_0x230d34() && _0x2e6e8c.paused === false) {
      safePause(_0x2e6e8c);
    }
    logVideoPlaybackEvent(_0x2e6e8c, "play-blocked", {
      label: _0x3f1bd1.label,
      extra: {
        playbackIntent: _0x204374
      }
    });
    return false;
  }
  _0x3f1bd1.playbackIntent = _0x204374;
  if (!_0x230d34()) {
    return false;
  }
  try {
    _0x3f1bd1.lastPlayRequestAt = Date.now();
    const _0x1015ac = _0x2e6e8c.play?.();
    if (_0x1015ac && typeof _0x1015ac.then === "function") {
      await _0x1015ac;
    }
  } catch (_0x2b4c7c) {
    if (!isIgnorablePlayError(_0x2b4c7c)) {
      logVideoPlaybackEvent(_0x2e6e8c, "play-error", {
        label: _0x3f1bd1.label,
        extra: {
          name: _0x2b4c7c?.name || "",
          message: _0x2b4c7c?.message || String(_0x2b4c7c || "")
        }
      });
    }
    return false;
  }
  if (!_0x230d34()) {
    return false;
  }
  if (!shouldContinuePlayback(_0x5becb6)) {
    safePause(_0x2e6e8c);
    return false;
  }
  activePlaybackVideos.add(_0x2e6e8c);
  logVideoPlaybackEvent(_0x2e6e8c, "play-request", {
    label: _0x3f1bd1.label
  });
  return true;
}
function updateRecoveryState(_0x430655, _0x132d48) {
  if (!_0x430655) {
    return;
  }
  if (_0x132d48.label) {
    _0x430655.label = String(_0x132d48.label);
  }
  if (typeof _0x132d48.ensureSrc === "function") {
    _0x430655.ensureSrc = _0x132d48.ensureSrc;
  }
  if (typeof _0x132d48.shouldRecover === "function") {
    _0x430655.shouldRecover = _0x132d48.shouldRecover;
  }
  if (Number.isFinite(Number(_0x132d48.minBufferAhead))) {
    _0x430655.minBufferAhead = Math.max(0.5, Number(_0x132d48.minBufferAhead));
  }
  if (Number.isFinite(Number(_0x132d48.readyTimeoutMs))) {
    _0x430655.readyTimeoutMs = Math.max(100, Number(_0x132d48.readyTimeoutMs));
  }
  if (Number.isFinite(Number(_0x132d48.recoveryDebounceMs))) {
    _0x430655.recoveryDebounceMs = Math.max(50, Number(_0x132d48.recoveryDebounceMs));
  }
  if (Number.isFinite(Number(_0x132d48.recoveryCooldownMs))) {
    _0x430655.recoveryCooldownMs = Math.max(100, Number(_0x132d48.recoveryCooldownMs));
  }
  if (Number.isFinite(Number(_0x132d48.startupRecoveryGraceMs))) {
    _0x430655.startupRecoveryGraceMs = Math.max(0, Number(_0x132d48.startupRecoveryGraceMs));
  }
  if (Number.isFinite(Number(_0x132d48.startupRecoveryMinPlayedSeconds))) {
    _0x430655.startupRecoveryMinPlayedSeconds = Math.max(0, Number(_0x132d48.startupRecoveryMinPlayedSeconds));
  }
}
function installMediaEventListeners(_0x3980b6, _0x4d8687) {
  const _0x13fa0a = ["play", "playing", "pause", "waiting", "stalled", "progress", "canplay"];
  for (const _0x3636ba of _0x13fa0a) {
    _0x3980b6.addEventListener?.(_0x3636ba, () => {
      logVideoPlaybackEvent(_0x3980b6, _0x3636ba, {
        label: _0x4d8687.label
      });
    });
  }
  for (const _0x3ac066 of ["waiting", "stalled"]) {
    _0x3980b6.addEventListener?.(_0x3ac066, () => {
      scheduleStallRecovery(_0x3980b6, _0x4d8687, _0x3ac066);
    });
  }
  _0x3980b6.addEventListener?.("play", () => {
    syncRecoverySourceIdentity(_0x3980b6, _0x4d8687);
    _0x4d8687.lastPlayRequestAt = Date.now();
    activePlaybackVideos.add(_0x3980b6);
  });
  _0x3980b6.addEventListener?.("playing", () => {
    syncRecoverySourceIdentity(_0x3980b6, _0x4d8687);
    _0x4d8687.lastPlayingAt = Date.now();
    rememberPresentedVideoSource(_0x3980b6, _0x4d8687, {
      force: true
    });
  });
  for (const _0x47e873 of ["loadeddata", "canplay", "canplaythrough"]) {
    _0x3980b6.addEventListener?.(_0x47e873, () => {
      syncRecoverySourceIdentity(_0x3980b6, _0x4d8687);
      rememberPresentedVideoSource(_0x3980b6, _0x4d8687);
    });
  }
  for (const _0x37a99b of ["loadstart", "emptied"]) {
    _0x3980b6.addEventListener?.(_0x37a99b, () => {
      syncRecoverySourceIdentity(_0x3980b6, _0x4d8687);
    });
  }
  _0x3980b6.addEventListener?.("pause", () => activePlaybackVideos.delete(_0x3980b6));
  _0x3980b6.addEventListener?.("ended", () => activePlaybackVideos.delete(_0x3980b6));
}
function getVideoRecoverySourceKey(_0xe871cb) {
  if (!_0xe871cb) {
    return "";
  }
  try {
    const _0x21b48f = _0xe871cb.getAttribute?.("src");
    if (typeof _0x21b48f === "string") {
      return _0x21b48f.trim();
    }
  } catch {}
  return String(_0xe871cb.currentSrc || _0xe871cb.src || "").trim();
}
function syncRecoverySourceIdentity(_0x31d0d3, _0x493f98) {
  const _0x49c1cb = getVideoRecoverySourceKey(_0x31d0d3);
  if (!_0x493f98) {
    return {
      sourceKey: _0x49c1cb,
      generation: 0
    };
  }
  if (_0x49c1cb !== String(_0x493f98.recoverySourceKey || "")) {
    if (_0x493f98.recoveryTimer !== null) {
      clearTimeout(_0x493f98.recoveryTimer);
      _0x493f98.recoveryTimer = null;
    }
    _0x493f98.recoverySourceKey = _0x49c1cb;
    _0x493f98.recoverySourceGeneration = Number(_0x493f98.recoverySourceGeneration || 0) + 1;
    _0x493f98.lastRecoveryAt = 0;
    _0x493f98.presentedSource = "";
  }
  return {
    sourceKey: _0x49c1cb,
    generation: Number(_0x493f98.recoverySourceGeneration || 0)
  };
}
function captureRecoverySourceIdentity(_0x5ca48d, _0x282570) {
  return syncRecoverySourceIdentity(_0x5ca48d, _0x282570);
}
function isRecoverySourceIdentityCurrent(_0x5e4fb4, _0x41c9c, _0x5b25c2) {
  if (!_0x5b25c2) {
    return false;
  }
  const _0x3fbd5e = syncRecoverySourceIdentity(_0x5e4fb4, _0x41c9c);
  return _0x3fbd5e.sourceKey === _0x5b25c2.sourceKey && _0x3fbd5e.generation === _0x5b25c2.generation;
}
function rememberPresentedVideoSource(_0x5e859a, _0x4bd311, {
  force = false
} = {}) {
  if (!_0x5e859a || !_0x4bd311) {
    return "";
  }
  const _0x53025c = getVideoCurrentSource(_0x5e859a);
  if (!_0x53025c || !force && Number(_0x5e859a.readyState || 0) < 2) {
    return "";
  }
  _0x4bd311.presentedSource = _0x53025c;
  return _0x53025c;
}
function hasPresentedCurrentVideoSource(_0x5273e1, _0x6bd026) {
  const _0x3a49fc = getVideoCurrentSource(_0x5273e1);
  return !!_0x3a49fc && _0x3a49fc === String(_0x6bd026?.presentedSource || "");
}
function isPresentedNativeLoopBoundary(_0x469baa, _0x2a03ec) {
  if (_0x469baa?.loop !== true) {
    return false;
  }
  if (!hasPresentedCurrentVideoSource(_0x469baa, _0x2a03ec)) {
    return false;
  }
  const _0x59d5ab = Number(_0x469baa.duration);
  const _0x104bb2 = Number(_0x469baa.currentTime);
  return Number.isFinite(_0x59d5ab) && _0x59d5ab > 0 && Number.isFinite(_0x104bb2) && _0x104bb2 >= 0 && _0x104bb2 <= NATIVE_LOOP_BOUNDARY_EPSILON_SECONDS;
}
async function ensureVideoSource(_0x58e298, _0x198488) {
  const _0x510ceb = () => {
    if (typeof _0x58e298?.getAttribute !== "function") {
      return "";
    }
    const _0x40b27d = String(_0x58e298.getAttribute("src") || "").trim();
    if (_0x40b27d) {
      return _0x40b27d;
    }
    return String(_0x58e298.querySelector?.("source[src]")?.getAttribute?.("src") || "").trim();
  };
  const _0x50f239 = _0x510ceb();
  if (_0x50f239) {
    return true;
  }
  if (typeof _0x198488?.ensureSrc !== "function" && getVideoCurrentSource(_0x58e298)) {
    return true;
  }
  if (typeof _0x198488?.ensureSrc !== "function") {
    return false;
  }
  try {
    await _0x198488.ensureSrc(_0x58e298);
  } catch {}
  if (typeof _0x58e298?.getAttribute === "function") {
    return !!_0x510ceb();
  }
  return !!getVideoCurrentSource(_0x58e298);
}
function scheduleStallRecovery(_0x53376e, _0x4c7ce0, _0x1b8151) {
  const _0x55beaf = captureRecoverySourceIdentity(_0x53376e, _0x4c7ce0);
  if (_0x4c7ce0.recoveryTimer !== null) {
    clearTimeout(_0x4c7ce0.recoveryTimer);
  }
  const _0x28cb29 = setTimeout(() => {
    if (_0x4c7ce0.recoveryTimer !== _0x28cb29) {
      return;
    }
    _0x4c7ce0.recoveryTimer = null;
    recoverStalledPlayback(_0x53376e, _0x4c7ce0, _0x1b8151, _0x55beaf);
  }, Math.max(50, Number(_0x4c7ce0.recoveryDebounceMs || DEFAULT_RECOVERY_DEBOUNCE_MS)));
  _0x4c7ce0.recoveryTimer = _0x28cb29;
}
async function recoverStalledPlayback(_0x15697d, _0x38feaf, _0x1d6315, _0x52b41c) {
  if (!_0x15697d || !isRecoverySourceIdentityCurrent(_0x15697d, _0x38feaf, _0x52b41c) || !shouldRecoverPlayback(_0x15697d, _0x38feaf)) {
    return;
  }
  const _0x148561 = Date.now();
  const _0x2a2249 = getStartupRecoveryDelayMs(_0x15697d, _0x38feaf, _0x148561);
  if (_0x2a2249 > 0) {
    logVideoPlaybackEvent(_0x15697d, _0x1d6315 + "-startup-grace", {
      label: _0x38feaf.label,
      extra: {
        retryInMs: _0x2a2249
      }
    });
    const _0xaf7e43 = setTimeout(() => {
      if (_0x38feaf.recoveryTimer !== _0xaf7e43) {
        return;
      }
      _0x38feaf.recoveryTimer = null;
      recoverStalledPlayback(_0x15697d, _0x38feaf, _0x1d6315, _0x52b41c);
    }, _0x2a2249);
    _0x38feaf.recoveryTimer = _0xaf7e43;
    return;
  }
  const _0x169f2a = Math.max(100, Number(_0x38feaf.recoveryCooldownMs || DEFAULT_RECOVERY_COOLDOWN_MS));
  if (_0x148561 - Number(_0x38feaf.lastRecoveryAt || 0) < _0x169f2a) {
    return;
  }
  if (hasVideoBufferedAhead(_0x15697d, _0x38feaf.minBufferAhead)) {
    return;
  }
  if (!(await ensureVideoSource(_0x15697d, _0x38feaf))) {
    return;
  }
  if (!isRecoverySourceIdentityCurrent(_0x15697d, _0x38feaf, _0x52b41c)) {
    return;
  }
  if (isPresentedNativeLoopBoundary(_0x15697d, _0x38feaf)) {
    return;
  }
  _0x38feaf.lastRecoveryAt = _0x148561;
  const _0x174743 = !!_0x15697d.paused;
  logVideoPlaybackEvent(_0x15697d, _0x1d6315 + "-recovery", {
    label: _0x38feaf.label
  });
  const _0x56449d = await reloadVideoPreservingTime(_0x15697d, _0x38feaf, _0x1d6315, _0x52b41c);
  if (_0x56449d && isRecoverySourceIdentityCurrent(_0x15697d, _0x38feaf, _0x52b41c) && !_0x174743 && shouldRecoverPlayback(_0x15697d, _0x38feaf)) {
    try {
      const _0x2cc49a = _0x15697d.play?.();
      if (_0x2cc49a && typeof _0x2cc49a.catch === "function") {
        _0x2cc49a.catch(() => {});
      }
    } catch {}
  }
}
function getStartupRecoveryDelayMs(_0x5bc925, _0x5b8fb9, _0x25ba9c = Date.now()) {
  const _0x17b9ed = Math.max(0, Number(_0x5b8fb9?.startupRecoveryGraceMs ?? DEFAULT_STARTUP_RECOVERY_GRACE_MS));
  if (!(_0x17b9ed > 0)) {
    return 0;
  }
  const _0x593547 = Math.max(Number(_0x5b8fb9?.lastPlayRequestAt || 0), Number(_0x5b8fb9?.lastPlayingAt || 0));
  if (!(_0x593547 > 0)) {
    return 0;
  }
  const _0x5c7b4e = _0x25ba9c - _0x593547;
  if (_0x5c7b4e >= _0x17b9ed) {
    return 0;
  }
  const _0x5aa59b = Math.max(0, Number(_0x5b8fb9?.startupRecoveryMinPlayedSeconds ?? DEFAULT_STARTUP_RECOVERY_MIN_PLAYED_SECONDS));
  if (Number(_0x5bc925?.currentTime || 0) > _0x5aa59b) {
    return 0;
  }
  return Math.max(50, Math.ceil(_0x17b9ed - _0x5c7b4e));
}
function shouldRecoverPlayback(_0x45e72f, _0x4fbffa) {
  if (_0x45e72f?.isConnected === false) {
    return false;
  }
  if (typeof _0x4fbffa?.shouldRecover === "function") {
    try {
      return !!_0x4fbffa.shouldRecover(_0x45e72f);
    } catch {
      return false;
    }
  }
  return !_0x45e72f?.paused;
}
async function reloadVideoPreservingTime(_0x1bbe03, _0x4f76b4, _0x43943e, _0x2fb338) {
  if (!isRecoverySourceIdentityCurrent(_0x1bbe03, _0x4f76b4, _0x2fb338)) {
    return false;
  }
  const _0x417b94 = getVideoCurrentSource(_0x1bbe03);
  if (!_0x417b94) {
    return false;
  }
  const _0xfe7431 = Number(_0x1bbe03.currentTime || 0);
  const _0x4c0974 = () => {
    if (!isRecoverySourceIdentityCurrent(_0x1bbe03, _0x4f76b4, _0x2fb338)) {
      return false;
    }
    if (!(_0xfe7431 > 0)) {
      return true;
    }
    const _0xad6edc = Number(_0x1bbe03.duration);
    const _0x23a2d1 = Number.isFinite(_0xad6edc) && _0xad6edc > 0 ? Math.min(_0xfe7431, Math.max(0, _0xad6edc - 0.05)) : _0xfe7431;
    try {
      _0x1bbe03.currentTime = _0x23a2d1;
    } catch {}
    return true;
  };
  logVideoPlaybackEvent(_0x1bbe03, _0x43943e + "-load", {
    label: _0x4f76b4.label
  });
  try {
    if (!_0x1bbe03.getAttribute?.("src") && _0x417b94) {
      _0x1bbe03.src = _0x417b94;
    }
    _0x1bbe03.load?.();
  } catch {}
  if (!isRecoverySourceIdentityCurrent(_0x1bbe03, _0x4f76b4, _0x2fb338)) {
    return false;
  }
  if (Number(_0x1bbe03.readyState || 0) >= 1 && !_0x4c0974()) {
    return false;
  }
  await waitForVideoReadiness(_0x1bbe03, _0x4f76b4.readyTimeoutMs);
  if (!isRecoverySourceIdentityCurrent(_0x1bbe03, _0x4f76b4, _0x2fb338)) {
    return false;
  }
  if (!_0x4c0974()) {
    return false;
  }
  return true;
}
function waitForVideoReadiness(_0x4c2c2e, _0x20202c) {
  if (!_0x4c2c2e || Number(_0x4c2c2e.readyState || 0) >= 2) {
    return Promise.resolve(true);
  }
  return new Promise(_0x23692a => {
    let _0x3b80af = false;
    const _0x292dc4 = ["loadeddata", "canplay", "canplaythrough", "progress", "error"];
    const _0x4195de = () => {
      if (_0x3b80af) {
        return;
      }
      _0x3b80af = true;
      clearTimeout(_0x590e09);
      for (const _0x499625 of _0x292dc4) {
        _0x4c2c2e.removeEventListener?.(_0x499625, _0x17d7ff);
      }
    };
    const _0x17d7ff = () => {
      _0x4195de();
      _0x23692a(Number(_0x4c2c2e.readyState || 0) >= 2);
    };
    const _0x590e09 = setTimeout(() => {
      _0x4195de();
      _0x23692a(Number(_0x4c2c2e.readyState || 0) >= 2);
    }, Math.max(100, Number(_0x20202c || DEFAULT_READY_TIMEOUT_MS)));
    for (const _0x1d4926 of _0x292dc4) {
      _0x4c2c2e.addEventListener?.(_0x1d4926, _0x17d7ff);
    }
  });
}
function shouldContinuePlayback(_0x392b54) {
  if (typeof _0x392b54.shouldContinue !== "function") {
    return true;
  }
  try {
    return !!_0x392b54.shouldContinue();
  } catch {
    return false;
  }
}
function safePause(_0x37093f) {
  try {
    _0x37093f?.pause?.();
  } catch {}
}
function resolvePlaybackIntent(_0x413dad, _0x1e4a2a, _0x10981b) {
  const _0x254ca7 = _0x10981b === HOVER_PLAYBACK_INTENT ? HOVER_PLAYBACK_INTENT : EXCLUSIVE_PLAYBACK_INTENT;
  if (_0x254ca7 === HOVER_PLAYBACK_INTENT && activePlaybackVideos.has(_0x413dad) && _0x413dad?.paused === false && _0x1e4a2a?.playbackIntent !== HOVER_PLAYBACK_INTENT) {
    return EXCLUSIVE_PLAYBACK_INTENT;
  }
  return _0x254ca7;
}
function prepareActiveVideosForPlayback(_0x979e30, _0x3dfbad) {
  let _0x5ec5be = false;
  for (const _0x7ee7cd of Array.from(activePlaybackVideos)) {
    if (!_0x7ee7cd || _0x7ee7cd === _0x979e30) {
      continue;
    }
    if (_0x7ee7cd.isConnected === false) {
      activePlaybackVideos.delete(_0x7ee7cd);
      continue;
    }
    const _0x1d09e3 = videoRecoveryStates.get(_0x7ee7cd)?.playbackIntent || EXCLUSIVE_PLAYBACK_INTENT;
    if (_0x3dfbad === HOVER_PLAYBACK_INTENT && _0x1d09e3 !== HOVER_PLAYBACK_INTENT) {
      _0x5ec5be = true;
      continue;
    }
    safePause(_0x7ee7cd);
    activePlaybackVideos.delete(_0x7ee7cd);
  }
  return !_0x5ec5be;
}
export function __resetVideoPlaybackRecoveryForTest() {
  activePlaybackVideos.clear();
}
function isIgnorablePlayError(_0x41203e) {
  const _0x4e54be = _0x41203e && typeof _0x41203e === "object" ? _0x41203e.name : "";
  const _0x30f1b7 = _0x41203e && typeof _0x41203e === "object" ? String(_0x41203e.message || "") : String(_0x41203e || "");
  return _0x4e54be === "AbortError" || _0x30f1b7.includes("interrupted by a call to pause");
}