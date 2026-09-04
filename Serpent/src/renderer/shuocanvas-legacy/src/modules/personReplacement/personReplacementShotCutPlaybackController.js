import { getPersonReplacementShotCutPositionAtTimelineSec, getPersonReplacementShotCutTotalDuration } from "./personReplacementShotCutModel.js";
function normalizeText(_0x1a874e) {
  return String(_0x1a874e ?? "").trim();
}
function clamp(_0x3b7adf, _0x5b05bc, _0x5531f2, _0x1908ac = _0x5b05bc) {
  const _0x44f497 = Number(_0x3b7adf);
  if (Number.isFinite(_0x44f497)) {
    return Math.min(_0x5531f2, Math.max(_0x5b05bc, _0x44f497));
  } else {
    return _0x1908ac;
  }
}
export function createPersonReplacementShotCutPlaybackController({
  windowObject: _0x432b15,
  isEditorOpen: _0x458c4e,
  getDraft: _0x3e4993,
  getProject: _0x293eb3,
  syncNativePlayback: _0x34512f,
  syncTimelinePosition: _0x87bd1,
  previewShotCut: _0x525a40
} = {}) {
  let _0x430b7f = 0;
  let _0x50bbe8 = false;
  let _0x50872d = null;
  let _0x415171 = 0;
  let _0x456eb1 = 0;
  let _0x1b7429 = false;
  let _0x1702f6 = 0;
  let _0x2f8fbc = 0;
  const _0x270a61 = () => {
    _0x456eb1 += 1;
    _0x1b7429 = false;
    _0x1702f6 = 0;
    _0x2f8fbc = 0;
    const _0x1e3e65 = _0x50872d;
    _0x50872d = null;
    if (_0x430b7f) {
      try {
        if (_0x50bbe8) {
          _0x432b15?.clearTimeout?.(_0x430b7f);
        } else {
          _0x432b15?.cancelAnimationFrame?.(_0x430b7f);
        }
      } catch {}
      _0x430b7f = 0;
    }
    _0x50bbe8 = false;
    if (_0x415171 && _0x1e3e65?.cancelVideoFrameCallback) {
      try {
        _0x1e3e65.cancelVideoFrameCallback(_0x415171);
      } catch {}
    }
    _0x415171 = 0;
  };
  const _0x5950fb = _0x7e0fbb => {
    if (!_0x458c4e() || !_0x7e0fbb || _0x7e0fbb !== _0x50872d || _0x7e0fbb.paused !== false || _0x7e0fbb.ended === true) {
      return;
    }
    if (_0x430b7f || _0x415171) {
      return;
    }
    const _0x117ee8 = _0x456eb1;
    const _0x48a68e = () => {
      if (_0x117ee8 !== _0x456eb1 || _0x7e0fbb !== _0x50872d || !_0x458c4e()) {
        return;
      }
      _0x430b7f = 0;
      _0x50bbe8 = false;
      _0x415171 = 0;
      _0x34512f(_0x7e0fbb);
      if (_0x7e0fbb.paused === false && _0x7e0fbb.ended !== true) {
        _0x5950fb(_0x7e0fbb);
      }
    };
    if (typeof _0x7e0fbb.requestVideoFrameCallback === "function") {
      try {
        _0x415171 = _0x7e0fbb.requestVideoFrameCallback(_0x48a68e);
        return;
      } catch {}
    }
    const _0x25c9d0 = _0x432b15?.requestAnimationFrame || globalThis.requestAnimationFrame;
    if (typeof _0x25c9d0 === "function") {
      _0x50bbe8 = false;
      _0x430b7f = _0x25c9d0(_0x48a68e);
    } else {
      _0x50bbe8 = true;
      _0x430b7f = _0x432b15?.setTimeout?.(_0x48a68e, 16) || 0;
    }
  };
  const _0x3af220 = _0x190917 => {
    if (!_0x190917) {
      return;
    }
    if (_0x190917 !== _0x50872d) {
      _0x270a61();
      _0x50872d = _0x190917;
    }
    _0x5950fb(_0x190917);
  };
  const _0x3b2334 = (_0x618203, _0x594ff2) => {
    if (!_0x618203 || !_0x458c4e()) {
      return false;
    }
    _0x270a61();
    try {
      _0x618203.pause?.();
    } catch {}
    _0x50872d = _0x618203;
    _0x1b7429 = true;
    _0x1702f6 = 0;
    const _0x2d3b08 = _0x3e4993();
    _0x2f8fbc = clamp(_0x594ff2, 0, getPersonReplacementShotCutTotalDuration(_0x2d3b08), 0);
    _0x618203.muted = true;
    const _0x5180f0 = _0x456eb1;
    const _0x26ef04 = () => {
      if (_0x5180f0 !== _0x456eb1 || !_0x1b7429 || _0x618203 !== _0x50872d || !_0x458c4e()) {
        return;
      }
      const _0x446908 = _0x432b15?.requestAnimationFrame || globalThis.requestAnimationFrame;
      if (typeof _0x446908 === "function") {
        _0x50bbe8 = false;
        _0x430b7f = _0x446908(_0x38bd96);
      } else {
        _0x50bbe8 = true;
        _0x430b7f = _0x432b15?.setTimeout?.(() => _0x38bd96(Date.now()), 16) || 0;
      }
    };
    const _0x38bd96 = _0x58bc76 => {
      _0x430b7f = 0;
      _0x50bbe8 = false;
      if (_0x5180f0 !== _0x456eb1 || !_0x1b7429 || _0x618203 !== _0x50872d || !_0x458c4e()) {
        return;
      }
      const _0x203078 = Number.isFinite(Number(_0x58bc76)) ? Number(_0x58bc76) : Date.now();
      if (!_0x1702f6) {
        _0x1702f6 = _0x203078;
      }
      const _0x1b03ae = Math.max(0, (_0x203078 - _0x1702f6) / 1000);
      const _0x4c3ac8 = _0x3e4993();
      const _0x59f43f = getPersonReplacementShotCutTotalDuration(_0x4c3ac8);
      const _0xe6943a = Math.min(_0x59f43f, _0x2f8fbc + _0x1b03ae);
      const _0x1131c5 = getPersonReplacementShotCutPositionAtTimelineSec(_0x4c3ac8, _0xe6943a);
      const _0x3739b3 = _0x4c3ac8[_0x1131c5.shotIndex];
      if (!_0x3739b3) {
        _0x270a61();
        return;
      }
      if (_0x3739b3.isReversed !== true) {
        _0x270a61();
        _0x525a40(_0x1131c5.shotId, _0x1131c5.sourceTimeSec, {
          timelineSec: _0x1131c5.timelineSec,
          autoplay: true
        });
        return;
      }
      const _0x163569 = _0x293eb3();
      const _0x32bcd4 = _0x163569.shots.find(_0x14587a => _0x14587a.id === _0x1131c5.shotId) || _0x163569.shots.find(_0xa9ae8e => _0xa9ae8e.id === normalizeText(_0x3739b3.originShotId));
      if (_0x618203.dataset?.sourceId !== _0x32bcd4?.sourceId) {
        _0x270a61();
        _0x525a40(_0x1131c5.shotId, _0x1131c5.sourceTimeSec, {
          timelineSec: _0x1131c5.timelineSec,
          autoplay: true
        });
        return;
      }
      _0x87bd1(_0x1131c5);
      try {
        if (!Number.isFinite(Number(_0x618203.currentTime)) || Math.abs(Number(_0x618203.currentTime) - _0x1131c5.sourceTimeSec) > 0.01) {
          _0x618203.currentTime = _0x1131c5.sourceTimeSec;
        }
      } catch {}
      if (_0xe6943a >= _0x59f43f) {
        _0x270a61();
        try {
          _0x618203.pause?.();
        } catch {}
        return;
      }
      _0x26ef04();
    };
    _0x26ef04();
    return true;
  };
  return {
    isReverseActive: () => _0x1b7429,
    startNative: _0x3af220,
    startReverse: _0x3b2334,
    stop: _0x270a61
  };
}