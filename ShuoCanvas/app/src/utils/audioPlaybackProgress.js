export function formatAudioTime(_0x159998) {
  const _0x4bc489 = Number(_0x159998);
  if (!Number.isFinite(_0x4bc489) || _0x4bc489 <= 0) {
    return "0:00";
  }
  return Math.floor(_0x4bc489 / 60) + ":" + String(Math.floor(_0x4bc489 % 60)).padStart(2, "0");
}
function clamp01(_0x484220) {
  const _0x5f1bfa = Number(_0x484220);
  if (!Number.isFinite(_0x5f1bfa)) {
    return 0;
  }
  return Math.max(0, Math.min(1, _0x5f1bfa));
}
function getRafFns(_0x33737c = {}) {
  const _0x3e29eb = _0x33737c.requestFrame || (typeof requestAnimationFrame === "function" ? requestAnimationFrame : typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame.bind(window) : null);
  const _0x2b2464 = _0x33737c.cancelFrame || (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function" ? window.cancelAnimationFrame.bind(window) : null);
  return {
    requestFrame: _0x3e29eb || (_0x2d8a64 => setTimeout(_0x2d8a64, 16)),
    cancelFrame: _0x2b2464 || (_0x2bc802 => clearTimeout(_0x2bc802))
  };
}
export function createAudioPlaybackProgressController(_0x1a2722 = {}) {
  const {
    audioEl: _0x1b78e9,
    wavePlayedEl: _0x2a29a8,
    progressLineEl: _0x18de73,
    timeEl: _0x2d52f8,
    trackEl: _0xd41997,
    formatTime = formatAudioTime,
    shouldSuppressSync = () => false
  } = _0x1a2722;
  const {
    requestFrame: _0x2149cf,
    cancelFrame: _0x9c8931
  } = getRafFns(_0x1a2722);
  const _0x19f5cd = _0x1a2722.ResizeObserverClass || (typeof ResizeObserver === "function" ? ResizeObserver : null);
  let _0x4e69e5 = null;
  let _0x163353 = false;
  let _0x37e9a2 = false;
  let _0xb812ab = 0;
  let _0x67fe65 = null;
  let _0x5c6b95 = "";
  let _0x46ed21 = "";
  let _0x401497 = "";
  let _0x4ed602 = "";
  const _0x42eb3a = (_0x11fa34 = null) => {
    const _0x3b4995 = Number(_0x11fa34?.contentRect?.width);
    if (Number.isFinite(_0x3b4995) && _0x3b4995 >= 0) {
      _0xb812ab = _0x3b4995;
      return _0xb812ab;
    }
    const _0x1c9057 = Number(_0xd41997?.clientWidth) || Number(_0xd41997?.getBoundingClientRect?.().width) || Number(_0x18de73?.parentElement?.clientWidth) || 0;
    _0xb812ab = Number.isFinite(_0x1c9057) && _0x1c9057 > 0 ? _0x1c9057 : 0;
    return _0xb812ab;
  };
  const _0x39f7f6 = () => {
    return !!_0x1b78e9 && _0x1b78e9.paused === false && _0x1b78e9.ended !== true;
  };
  const _0x229ab0 = _0x3278e4 => {
    if (!_0x18de73 || _0x4ed602 === _0x3278e4) {
      return;
    }
    _0x18de73.style.opacity = _0x3278e4;
    _0x4ed602 = _0x3278e4;
  };
  const _0x2ec615 = () => {
    _0x229ab0("0");
  };
  const _0x6ac17 = ({
    currentTime = _0x1b78e9?.currentTime,
    duration = _0x1b78e9?.duration,
    force = false,
    showLine = true
  } = {}) => {
    const _0x46871b = Number(duration);
    if (!Number.isFinite(_0x46871b) || _0x46871b <= 0) {
      return false;
    }
    const _0x2aac9d = Number(currentTime);
    const _0x25aa5d = clamp01(_0x2aac9d / _0x46871b);
    const _0x167bfc = (_0x25aa5d * 100).toFixed(2);
    if (_0x2a29a8 && (force || _0x5c6b95 !== _0x167bfc)) {
      _0x2a29a8.style.clipPath = "inset(0 0 0 " + _0x167bfc + "%)";
    }
    if (_0x18de73 && (force || _0x5c6b95 !== _0x167bfc)) {
      const _0x54df8a = _0xb812ab;
      if (_0x54df8a > 0) {
        const _0x188e5e = (_0x25aa5d * _0x54df8a).toFixed(2) + "px";
        if (force || _0x401497 !== _0x188e5e) {
          _0x18de73.style.left = "0";
          _0x18de73.style.transform = "translateX(" + _0x188e5e + ")";
          _0x401497 = _0x188e5e;
        }
      } else {
        const _0x37bf56 = _0x167bfc + "%";
        if (force || _0x401497 !== _0x37bf56) {
          _0x18de73.style.left = _0x37bf56;
          _0x18de73.style.transform = "";
          _0x401497 = _0x37bf56;
        }
      }
    }
    if (showLine) {
      _0x229ab0("1");
    }
    const _0x301ab2 = formatTime(_0x2aac9d) + " / " + formatTime(_0x46871b);
    if (_0x2d52f8 && (force || _0x46ed21 !== _0x301ab2)) {
      _0x2d52f8.textContent = _0x301ab2;
      _0x46ed21 = _0x301ab2;
    }
    _0x5c6b95 = _0x167bfc;
    return true;
  };
  const _0x1b8350 = () => {
    if (_0x163353 || _0x4e69e5 !== null) {
      return;
    }
    _0x4e69e5 = _0x2149cf(_0x1d09d7);
  };
  const _0x11157c = () => {
    if (_0x4e69e5 === null) {
      return;
    }
    _0x9c8931(_0x4e69e5);
    _0x4e69e5 = null;
  };
  const _0x1d09d7 = () => {
    _0x4e69e5 = null;
    if (_0x163353 || !_0x39f7f6()) {
      return;
    }
    if (!shouldSuppressSync()) {
      _0x6ac17({
        showLine: true
      });
    }
    _0x1b8350();
  };
  const _0x1d7cdd = () => {
    if (_0xb812ab <= 0) {
      _0x42eb3a();
    }
    _0x1b8350();
  };
  const _0x44dd8c = () => {
    _0x11157c();
    if (_0x163353 || shouldSuppressSync()) {
      return;
    }
    if (_0x1b78e9?.ended === true) {
      _0x6ac17({
        force: true,
        showLine: false
      });
      _0x2ec615();
      return;
    }
    _0x6ac17({
      showLine: true
    });
  };
  const _0x109ba5 = () => {
    if (_0x163353 || _0x39f7f6() || shouldSuppressSync()) {
      return;
    }
    _0x6ac17({
      showLine: true
    });
  };
  const _0x5b5dad = () => {
    if (_0x163353) {
      return;
    }
    if (_0xb812ab <= 0) {
      _0x42eb3a();
    }
    const _0x1bd582 = Number(_0x1b78e9?.currentTime || 0);
    _0x6ac17({
      currentTime: _0x1bd582,
      duration: _0x1b78e9?.duration,
      force: true,
      showLine: _0x1bd582 > 0
    });
    if (_0x1bd582 <= 0) {
      _0x2ec615();
    }
  };
  const _0x38bca4 = () => {
    _0x11157c();
    _0x6ac17({
      force: true,
      showLine: false
    });
    _0x2ec615();
  };
  const _0x60e04 = () => {
    if (_0x37e9a2 || !_0x1b78e9?.addEventListener) {
      return _0x5329fe;
    }
    _0x37e9a2 = true;
    _0x163353 = false;
    _0x42eb3a();
    if (_0x19f5cd && _0xd41997 && typeof _0xd41997 === "object") {
      _0x67fe65 = new _0x19f5cd((_0x151bf9 = []) => {
        const _0x9700eb = _0x151bf9.find?.(_0xc42780 => _0xc42780?.target === _0xd41997) || _0x151bf9[0] || null;
        _0x42eb3a(_0x9700eb);
        _0x6ac17({
          force: true,
          showLine: _0x4ed602 === "1"
        });
      });
      _0x67fe65.observe(_0xd41997);
    }
    _0x1b78e9.addEventListener("play", _0x1d7cdd);
    _0x1b78e9.addEventListener("pause", _0x44dd8c);
    _0x1b78e9.addEventListener("timeupdate", _0x109ba5);
    _0x1b78e9.addEventListener("loadedmetadata", _0x5b5dad);
    _0x1b78e9.addEventListener("durationchange", _0x5b5dad);
    _0x1b78e9.addEventListener("ended", _0x38bca4);
    if (_0x39f7f6()) {
      _0x1b8350();
    }
    return _0x5329fe;
  };
  const _0x207e5c = ({
    hide = true
  } = {}) => {
    _0x5c6b95 = "";
    _0x46ed21 = "";
    _0x401497 = "";
    if (_0x2a29a8) {
      _0x2a29a8.style.clipPath = "inset(0 0 0 0)";
    }
    if (_0x18de73) {
      _0x18de73.style.left = "0";
      _0x18de73.style.transform = "translateX(0px)";
    }
    if (hide) {
      _0x2ec615();
    }
    if (_0x2d52f8) {
      _0x2d52f8.textContent = "0:00 / 0:00";
      _0x46ed21 = "0:00 / 0:00";
    }
  };
  const _0x28d6e8 = () => {
    _0x163353 = true;
    _0x11157c();
    if (_0x37e9a2 && _0x1b78e9?.removeEventListener) {
      _0x1b78e9.removeEventListener("play", _0x1d7cdd);
      _0x1b78e9.removeEventListener("pause", _0x44dd8c);
      _0x1b78e9.removeEventListener("timeupdate", _0x109ba5);
      _0x1b78e9.removeEventListener("loadedmetadata", _0x5b5dad);
      _0x1b78e9.removeEventListener("durationchange", _0x5b5dad);
      _0x1b78e9.removeEventListener("ended", _0x38bca4);
    }
    _0x37e9a2 = false;
    if (_0x67fe65) {
      _0x67fe65.disconnect();
      _0x67fe65 = null;
    }
  };
  const _0x5329fe = {
    attach: _0x60e04,
    destroy: _0x28d6e8,
    reset: _0x207e5c,
    hideLine: _0x2ec615,
    start: _0x1b8350,
    stop: _0x11157c,
    sync: _0x6ac17,
    isRunning: () => _0x4e69e5 !== null
  };
  return _0x5329fe;
}