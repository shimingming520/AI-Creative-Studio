import { isNodeType } from "../modules/registry.js";
import { resolveGenerationUiState } from "./generationTaskUiState.js";
import { formatRendererNodeTimerText } from "./rendererNodePresentation.js";
const DEFAULT_UPDATE_INTERVAL_MS = 250;
const RUNNING_TIMER_STATES = new Set(["idle", "submitting", "queued", "running", "recovering"]);
function hasResolvedMediaValue(_0x2caf2e, _0x1efdfb) {
  return !!_0x2caf2e && typeof _0x2caf2e === "object" && !!_0x1efdfb.some(_0x15c252 => !!String(_0x2caf2e?.[_0x15c252] || "").trim());
}
function isResolvedSourceMediaNode(_0x277fe6) {
  if (isNodeType(_0x277fe6, "source-audio")) {
    return hasResolvedMediaValue(_0x277fe6, ["src", "audioUrl", "localPath", "resultUrl"]);
  }
  if (!isNodeType(_0x277fe6, "source-video") || !!String(_0x277fe6?.rhTaskId || _0x277fe6?.asyncTaskId || _0x277fe6?.dreaminaSubmitId || "").trim() || _0x277fe6?.rhTaskRecovering === true || _0x277fe6?.asyncTaskRecovering === true || _0x277fe6?.dreaminaTaskRecovering === true) {
    return false;
  }
  const _0x3f83fb = Array.isArray(_0x277fe6?.videos) ? _0x277fe6.videos : [];
  return hasResolvedMediaValue(_0x277fe6, ["src", "videoUrl", "localPath", "displayLocalPath", "originalLocalPath", "resultUrl", "capturePreviewUrl"]) || _0x3f83fb.some(_0x27c089 => hasResolvedMediaValue(_0x27c089, ["url", "videoUrl", "localPath", "displayLocalPath", "originalLocalPath", "resultUrl", "sourceUrl"]));
}
function isRunningTimerNode(_0x25436d) {
  if (!_0x25436d?.generationStartTime || _0x25436d.generationDuration != null || isResolvedSourceMediaNode(_0x25436d)) {
    return false;
  }
  return RUNNING_TIMER_STATES.has(resolveGenerationUiState(_0x25436d));
}
function defaultRequestFrame(_0x2a520c) {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(_0x2a520c);
  }
  _0x2a520c();
  return null;
}
function defaultCancelFrame(_0x42c58c) {
  globalThis.cancelAnimationFrame?.(_0x42c58c);
}
export function createRendererNodeTimerController({
  getWrapper: _0x1e927f,
  now = () => Date.now(),
  requestFrame = defaultRequestFrame,
  cancelFrame = defaultCancelFrame,
  setTimer = (_0x4f6b3c, _0x15eba2) => globalThis.setTimeout(_0x4f6b3c, _0x15eba2),
  clearTimer = _0x5648e9 => globalThis.clearTimeout(_0x5648e9),
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS
} = {}) {
  if (typeof _0x1e927f !== "function") {
    throw new TypeError("[rendererNodeTimerController] getWrapper must be a function");
  }
  let _0x465bae = null;
  let _0x498562 = -1;
  let _0x5ddf55 = null;
  let _0x58d789 = null;
  const _0xd70717 = new Set();
  function _0x5d02cf(_0x44d14c) {
    const _0xac8c5b = _0x1e927f(_0x44d14c)?.__v2_timer_el;
    if (_0xac8c5b) {
      _0xac8c5b.textContent = "";
      if (_0xac8c5b.style.display !== "none") {
        _0xac8c5b.style.display = "none";
      }
    }
    _0xd70717.delete(_0x44d14c);
    if (_0xd70717.size === 0) {
      _0x95964f();
    }
  }
  function _0x95964f() {
    if (_0x5ddf55 !== null) {
      cancelFrame(_0x5ddf55);
    }
    if (_0x58d789 !== null) {
      clearTimer(_0x58d789);
    }
    _0x5ddf55 = null;
    _0x58d789 = null;
  }
  function _0x327973(_0x1953b4 = updateIntervalMs) {
    if (_0xd70717.size === 0 || _0x5ddf55 !== null || _0x58d789 !== null) {
      return;
    }
    const _0x340489 = () => {
      _0x58d789 = null;
      if (_0xd70717.size === 0) {
        return;
      }
      _0x5ddf55 = requestFrame(_0x3356ef);
    };
    const _0x5d8ed1 = Math.max(0, Number(_0x1953b4) || 0);
    if (_0x5d8ed1 > 0) {
      _0x58d789 = setTimer(_0x340489, _0x5d8ed1);
    } else {
      _0x340489();
    }
  }
  function _0x10d2f7(_0x5acd85, _0x2cd8a0) {
    if (isRunningTimerNode(_0x2cd8a0)) {
      _0xd70717.add(_0x5acd85);
      _0x327973(0);
      return;
    }
    _0xd70717.delete(_0x5acd85);
    if (_0xd70717.size === 0) {
      _0x95964f();
    }
  }
  function _0xc215d3(_0x388731, _0x8a8ef9) {
    const _0x2e4ebf = _0x1e927f(_0x388731)?.__v2_timer_el;
    if (!_0x2e4ebf) {
      return;
    }
    const _0x226c9c = formatRendererNodeTimerText(_0x8a8ef9, now() - _0x8a8ef9.generationStartTime);
    if (_0x2e4ebf.textContent !== _0x226c9c) {
      _0x2e4ebf.textContent = _0x226c9c;
    }
    if (_0x2e4ebf.style.display === "none") {
      _0x2e4ebf.style.display = "";
    }
  }
  function _0x3356ef() {
    _0x5ddf55 = null;
    if (!_0x465bae || _0xd70717.size === 0) {
      return;
    }
    const _0x97e033 = [];
    for (const _0x2b18e4 of _0xd70717) {
      const _0x223a01 = _0x465bae.nodes?.[_0x2b18e4];
      if (!_0x223a01 || !isRunningTimerNode(_0x223a01)) {
        _0x97e033.push(_0x2b18e4);
        continue;
      }
      _0xc215d3(_0x2b18e4, _0x223a01);
    }
    _0x97e033.forEach(_0x92a7c8 => _0x5d02cf(_0x92a7c8));
    if (_0xd70717.size > 0) {
      _0x327973();
    }
  }
  function _0x40f514(_0x401f99, _0x7ff55d, {
    selected = false
  } = {}) {
    const _0x57a23 = _0x1e927f(_0x401f99)?.__v2_timer_el;
    if (_0x57a23) {
      const _0x1ba654 = isRunningTimerNode(_0x7ff55d);
      const _0xca1026 = !isResolvedSourceMediaNode(_0x7ff55d) && typeof _0x7ff55d?.generationDuration === "number";
      const _0x2a6a31 = _0x1ba654 || _0xca1026;
      const _0x32a4e8 = _0x1ba654 ? formatRendererNodeTimerText(_0x7ff55d, now() - _0x7ff55d.generationStartTime) : _0xca1026 ? formatRendererNodeTimerText(_0x7ff55d, _0x7ff55d.generationDuration) : "";
      if (_0x57a23.textContent !== _0x32a4e8) {
        _0x57a23.textContent = _0x32a4e8;
      }
      if (_0x2a6a31) {
        _0x57a23.style.color = selected ? "var(--text-primary)" : "var(--white-40)";
        if (_0x57a23.style.display === "none") {
          _0x57a23.style.display = "";
        }
      } else if (_0x57a23.style.display !== "none") {
        _0x57a23.style.display = "none";
      }
    }
    _0x10d2f7(_0x401f99, _0x7ff55d);
  }
  function _0x296a3f(_0x5340df) {
    _0x465bae = _0x5340df || null;
    const _0xbc9e2 = Number.isFinite(_0x5340df?._persistRev) ? _0x5340df._persistRev : Number.isFinite(_0x5340df?._nodeCount) ? _0x5340df._nodeCount : 0;
    if (_0xbc9e2 === _0x498562) {
      return;
    }
    _0x498562 = _0xbc9e2;
    const _0x451cec = _0x5340df?.nodes || {};
    for (const _0x55851a of [..._0xd70717]) {
      if (!isRunningTimerNode(_0x451cec[_0x55851a])) {
        _0x5d02cf(_0x55851a);
      }
    }
    for (const [_0x1f9c7f, _0x153c78] of Object.entries(_0x451cec)) {
      if (!isRunningTimerNode(_0x153c78)) {
        continue;
      }
      const _0x395205 = String(_0x153c78?.id || _0x1f9c7f || "").trim();
      if (_0x395205) {
        _0x10d2f7(_0x395205, _0x153c78);
        _0xc215d3(_0x395205, _0x153c78);
      }
    }
    if (_0xd70717.size > 0) {
      _0x327973(0);
    }
  }
  function _0x2c7247() {
    _0x95964f();
    _0xd70717.clear();
    _0x498562 = -1;
    _0x465bae = null;
  }
  return {
    clear: _0x2c7247,
    hideNode: _0x5d02cf,
    renderNode: _0x40f514,
    syncSnapshot: _0x296a3f,
    trackNode: _0x10d2f7
  };
}