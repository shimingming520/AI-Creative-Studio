function getRecognitionConstructor(_0x2639cb) {
  return _0x2639cb?.SpeechRecognition || _0x2639cb?.webkitSpeechRecognition || null;
}
export function isStoryboard3DVoiceInputSupported(_0x1688b0 = globalThis.window) {
  return typeof getRecognitionConstructor(_0x1688b0) === "function";
}
function collectRecognitionText(_0x4fa1ad) {
  const _0x5c8505 = [];
  const _0x5c6726 = [];
  const _0x2449cb = _0x4fa1ad?.results || [];
  const _0xc8d74f = Math.max(0, Number(_0x4fa1ad?.resultIndex || 0));
  for (let _0x3d148f = _0xc8d74f; _0x3d148f < _0x2449cb.length; _0x3d148f += 1) {
    const _0x48402f = _0x2449cb[_0x3d148f];
    const _0x55101f = String(_0x48402f?.[0]?.transcript || "").trim();
    if (!_0x55101f) {
      continue;
    }
    if (_0x48402f.isFinal) {
      _0x5c8505.push(_0x55101f);
    } else {
      _0x5c6726.push(_0x55101f);
    }
  }
  return {
    finalText: _0x5c8505.join(" ").trim(),
    interimText: _0x5c6726.join(" ").trim()
  };
}
export class Storyboard3DVoiceInputService {
  constructor({
    windowObject = globalThis.window,
    lang = "zh-CN",
    continuous = false,
    interimResults = true,
    onStateChange: _0x172605,
    onTranscript: _0x4f9035,
    onError: _0x41bc09
  } = {}) {
    this.window = windowObject;
    this.lang = lang;
    this.continuous = Boolean(continuous);
    this.interimResults = Boolean(interimResults);
    this.onStateChange = _0x172605;
    this.onTranscript = _0x4f9035;
    this.onError = _0x41bc09;
    this.recognition = null;
    this.state = "idle";
    this.finalTranscript = "";
    this._stopping = false;
  }
  isSupported() {
    return isStoryboard3DVoiceInputSupported(this.window);
  }
  _setState(_0x5ce201, _0x22fd1b = {}) {
    if (this.state === _0x5ce201 && Object.keys(_0x22fd1b).length === 0) {
      return;
    }
    this.state = _0x5ce201;
    this.onStateChange?.({
      state: _0x5ce201,
      ..._0x22fd1b
    });
  }
  _bindRecognition(_0x18d891) {
    _0x18d891.lang = this.lang;
    _0x18d891.continuous = this.continuous;
    _0x18d891.interimResults = this.interimResults;
    _0x18d891.maxAlternatives = 1;
    _0x18d891.onstart = () => {
      this._stopping = false;
      this._setState("listening");
    };
    _0x18d891.onspeechstart = () => this._setState("transcribing");
    _0x18d891.onresult = _0x373f6d => {
      const {
        finalText: _0x2bb2c7,
        interimText: _0x3855a8
      } = collectRecognitionText(_0x373f6d);
      if (_0x2bb2c7) {
        this.finalTranscript = [this.finalTranscript, _0x2bb2c7].filter(Boolean).join(" ");
      }
      const _0x5a9a48 = [this.finalTranscript, _0x3855a8].filter(Boolean).join(" ").trim();
      this.onTranscript?.({
        transcript: _0x5a9a48,
        finalText: this.finalTranscript,
        interimText: _0x3855a8,
        isFinal: Boolean(_0x2bb2c7 && !_0x3855a8)
      });
    };
    _0x18d891.onerror = _0x340050 => {
      const _0x521bcf = String(_0x340050?.error || "recognition-error");
      const _0x52259a = ["no-speech", "aborted"].includes(_0x521bcf);
      this._setState(_0x52259a ? "idle" : "error", {
        error: _0x521bcf
      });
      if (!_0x52259a) {
        this.onError?.({
          error: _0x521bcf,
          message: String(_0x340050?.message || "")
        });
      }
    };
    _0x18d891.onend = () => {
      this.recognition = null;
      this._setState("idle", {
        transcript: this.finalTranscript,
        stopped: this._stopping
      });
      this._stopping = false;
    };
  }
  start({
    resetTranscript = true
  } = {}) {
    if (!this.isSupported()) {
      const _0x1185d0 = new Error("当前运行环境不支持语音转文字。");
      _0x1185d0.code = "speech-recognition-unsupported";
      this._setState("error", {
        error: _0x1185d0.code
      });
      this.onError?.({
        error: _0x1185d0.code,
        message: _0x1185d0.message
      });
      throw _0x1185d0;
    }
    if (this.recognition) {
      return false;
    }
    if (resetTranscript) {
      this.finalTranscript = "";
    }
    const _0x379add = getRecognitionConstructor(this.window);
    const _0x5af29e = new _0x379add();
    this.recognition = _0x5af29e;
    this._bindRecognition(_0x5af29e);
    this._setState("starting");
    try {
      _0x5af29e.start();
      return true;
    } catch (_0x5d3f1f) {
      this.recognition = null;
      this._setState("error", {
        error: "start-failed"
      });
      this.onError?.({
        error: "start-failed",
        message: _0x5d3f1f?.message || String(_0x5d3f1f)
      });
      throw _0x5d3f1f;
    }
  }
  stop() {
    if (!this.recognition) {
      return false;
    }
    this._stopping = true;
    this._setState("stopping");
    this.recognition.stop?.();
    return true;
  }
  abort() {
    if (!this.recognition) {
      return false;
    }
    this._stopping = true;
    this.recognition.abort?.();
    return true;
  }
  destroy() {
    const _0x539103 = this.recognition;
    this.recognition = null;
    _0x539103?.abort?.();
    if (_0x539103) {
      _0x539103.onstart = null;
      _0x539103.onspeechstart = null;
      _0x539103.onresult = null;
      _0x539103.onerror = null;
      _0x539103.onend = null;
    }
    this._setState("idle");
  }
}
export function createStoryboard3DVoiceInputService(_0xaac445 = {}) {
  return new Storyboard3DVoiceInputService(_0xaac445);
}