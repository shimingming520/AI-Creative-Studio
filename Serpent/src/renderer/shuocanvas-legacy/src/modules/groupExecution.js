import a977_0x2d33ee from "../core/stores/appStore.js";
import { t } from "../i18n/index.js";
const EXECUTABLE_NODE_TYPES = new Set(["ai-text", "ai-image", "ai-video", "ai-audio"]);
const DEFAULT_SELECTED_GENERATE_STAGGER_MS = 300;
let activeSelectedGenerateBatch = null;
function groupExecutionText(_0x1e48f5, _0x31b522 = {}) {
  return t("groupExecution." + _0x1e48f5, _0x31b522);
}
function toNodeList(_0x48152d) {
  if (!_0x48152d || typeof _0x48152d !== "object") {
    return [];
  }
  return Object.values(_0x48152d).filter(_0x3be003 => _0x3be003 && typeof _0x3be003 === "object");
}
function isExecutableNode(_0x38bebb) {
  return EXECUTABLE_NODE_TYPES.has(String(_0x38bebb?.type || ""));
}
function compareCanvasOrder(_0x2a6085, _0x41ab39) {
  const _0x2f0afb = Number(_0x2a6085?.y) || 0;
  const _0x1a9203 = Number(_0x41ab39?.y) || 0;
  if (_0x2f0afb !== _0x1a9203) {
    return _0x2f0afb - _0x1a9203;
  }
  const _0x50a1a9 = Number(_0x2a6085?.x) || 0;
  const _0x1446b4 = Number(_0x41ab39?.x) || 0;
  if (_0x50a1a9 !== _0x1446b4) {
    return _0x50a1a9 - _0x1446b4;
  }
  return String(_0x2a6085?.id || "").localeCompare(String(_0x41ab39?.id || ""));
}
export function collectGroupExecutableNodeIds(_0x3f59bb, _0x4d9a2b) {
  const _0x276014 = String(_0x4d9a2b || "").trim();
  if (!_0x276014) {
    return [];
  }
  const _0x515bcb = toNodeList(_0x3f59bb);
  const _0x5f11c0 = new Map();
  for (const _0x1cdc99 of _0x515bcb) {
    const _0x9d7c6d = String(_0x1cdc99.parentId || "").trim();
    if (!_0x9d7c6d) {
      continue;
    }
    if (!_0x5f11c0.has(_0x9d7c6d)) {
      _0x5f11c0.set(_0x9d7c6d, []);
    }
    _0x5f11c0.get(_0x9d7c6d).push(_0x1cdc99);
  }
  for (const _0x1fafae of _0x5f11c0.values()) {
    _0x1fafae.sort(compareCanvasOrder);
  }
  const _0x407548 = [];
  const _0x48caf5 = new Set();
  const _0x359674 = _0x4094f1 => {
    const _0x3f8a6a = _0x5f11c0.get(_0x4094f1) || [];
    for (const _0x5be6bf of _0x3f8a6a) {
      const _0x44c3c8 = String(_0x5be6bf?.id || "").trim();
      if (!_0x44c3c8 || _0x48caf5.has(_0x44c3c8)) {
        continue;
      }
      _0x48caf5.add(_0x44c3c8);
      if (isExecutableNode(_0x5be6bf)) {
        _0x407548.push(_0x44c3c8);
      }
      if (String(_0x5be6bf?.type || "") === "group") {
        _0x359674(_0x44c3c8);
      }
    }
  };
  _0x359674(_0x276014);
  return _0x407548;
}
export function collectSelectedExecutableNodeIds(_0x369621, _0x28a983 = []) {
  const _0x3ad32d = new Set((Array.isArray(_0x28a983) ? _0x28a983 : []).map(_0x3bd549 => String(_0x3bd549 || "").trim()).filter(Boolean));
  if (_0x3ad32d.size === 0) {
    return [];
  }
  return toNodeList(_0x369621).filter(_0x2687a2 => _0x3ad32d.has(String(_0x2687a2?.id || "").trim()) && isExecutableNode(_0x2687a2)).sort(compareCanvasOrder).map(_0x5876c8 => String(_0x5876c8?.id || "").trim()).filter(Boolean);
}
export function hasRunningGroupGenerateNodes(_0x40b22d, _0x40bb92) {
  return collectGroupExecutableNodeIds(_0x40b22d, _0x40bb92).some(_0x405e9d => _0x40b22d?.[_0x405e9d]?.isGenerating === true);
}
export function hasRunningSelectedGenerateNodes(_0x46eb8c, _0x25b9db = []) {
  return collectSelectedExecutableNodeIds(_0x46eb8c, _0x25b9db).some(_0x17b036 => _0x46eb8c?.[_0x17b036]?.isGenerating === true);
}
export function cancelGroupGenerateButtons({
  groupId: _0x2accde,
  state = a977_0x2d33ee.getState(),
  root = globalThis.document,
  showToast = globalThis.window?.showToast
} = {}) {
  const _0x11a03d = state?.nodes || {};
  const _0x41dec7 = collectGroupExecutableNodeIds(_0x11a03d, _0x2accde).filter(_0x5affc5 => _0x11a03d?.[_0x5affc5]?.isGenerating === true);
  let _0x2a6c7b = 0;
  for (const _0x13263e of _0x41dec7) {
    const _0x100f37 = findGenerateButtonForNode(root, _0x13263e);
    if (!_0x100f37 || _0x100f37.disabled) {
      continue;
    }
    _0x100f37.click();
    _0x2a6c7b += 1;
  }
  if (_0x2a6c7b > 0) {
    showToast?.(groupExecutionText("groupCancelTriggered", {
      count: _0x2a6c7b
    }), "info");
  }
  return {
    clicked: _0x2a6c7b,
    total: _0x41dec7.length
  };
}
export function findGenerateButtonForNode(_0x637965, _0x1d59f5) {
  const _0x20ca1f = _0x637965 || globalThis.document;
  if (!_0x20ca1f || typeof _0x20ca1f.getElementById !== "function") {
    return null;
  }
  const _0x5d3840 = _0x20ca1f.getElementById(String(_0x1d59f5 || ""));
  if (!_0x5d3840 || typeof _0x5d3840.querySelector !== "function") {
    return null;
  }
  return _0x5d3840.querySelector(".prompt-submit.img-gen-btn:not(.debug-wrench-btn)");
}
function normalizeStaggerMs(_0x33622f, _0x15a972 = DEFAULT_SELECTED_GENERATE_STAGGER_MS) {
  const _0x415119 = Number(_0x33622f);
  if (!Number.isFinite(_0x415119) || _0x415119 < 0) {
    return _0x15a972;
  }
  return Math.floor(_0x415119);
}
function scheduleGenerateButtonClick(_0x5f512d, _0x56f8e6, _0x316d14, _0xc326a8 = () => {}) {
  const _0x73d244 = () => {
    if (!_0x5f512d.disabled) {
      _0x5f512d.click();
    }
    _0xc326a8();
  };
  if (_0x56f8e6 > 0 && typeof _0x316d14 === "function") {
    return _0x316d14(_0x73d244, _0x56f8e6);
  }
  _0x73d244();
  return null;
}
export function hasActiveSelectedGenerateBatch() {
  return Boolean(activeSelectedGenerateBatch);
}
function cancelActiveSelectedGenerateQueue() {
  const _0x1d52b2 = activeSelectedGenerateBatch;
  if (!_0x1d52b2) {
    return false;
  }
  activeSelectedGenerateBatch = null;
  _0x1d52b2.cancelled = true;
  _0x1d52b2.timeoutIds.forEach(_0xf78e1e => _0x1d52b2.clearScheduledTimeout?.(_0xf78e1e));
  _0x1d52b2.timeoutIds.clear();
  _0x1d52b2.onStateChange?.(false);
  return true;
}
export function cancelSelectedGenerateButtons({
  selectedIds = [],
  state = a977_0x2d33ee.getState(),
  root = globalThis.document,
  showToast = globalThis.window?.showToast
} = {}) {
  const _0xe1d3bb = cancelActiveSelectedGenerateQueue();
  const _0x1263a5 = state?.nodes || {};
  const _0x359bb4 = collectSelectedExecutableNodeIds(_0x1263a5, selectedIds).filter(_0x461514 => _0x1263a5?.[_0x461514]?.isGenerating === true);
  let _0x23383d = 0;
  for (const _0x2e70f6 of _0x359bb4) {
    const _0x479965 = findGenerateButtonForNode(root, _0x2e70f6);
    if (!_0x479965 || _0x479965.disabled) {
      continue;
    }
    _0x479965.click();
    _0x23383d += 1;
  }
  if (_0x23383d > 0) {
    showToast?.(groupExecutionText("selectedCancelTriggered", {
      count: _0x23383d
    }), "info");
  }
  return _0xe1d3bb || _0x23383d > 0;
}
export function executeGroupGenerateButtons({
  groupId: _0x1dd856,
  state = a977_0x2d33ee.getState(),
  root = globalThis.document,
  showToast = globalThis.window?.showToast
} = {}) {
  const _0x39ead9 = state?.nodes || {};
  const _0x143abf = _0x39ead9?.[_0x1dd856];
  if (!_0x143abf || String(_0x143abf.type || "") !== "group") {
    showToast?.(groupExecutionText("groupNotFound"), "warn");
    return {
      clicked: 0,
      total: 0,
      missing: 0,
      skippedDisabled: 0,
      skippedGenerating: 0
    };
  }
  const _0x36d788 = collectGroupExecutableNodeIds(_0x39ead9, _0x1dd856);
  if (_0x36d788.length === 0) {
    showToast?.(groupExecutionText("groupNoExecutable"), "warn");
    return {
      clicked: 0,
      total: 0,
      missing: 0,
      skippedDisabled: 0,
      skippedGenerating: 0
    };
  }
  let _0x26f526 = 0;
  let _0x5db515 = 0;
  let _0x2b6c18 = 0;
  let _0x5aa3e4 = 0;
  for (const _0x17a128 of _0x36d788) {
    const _0x5ab8dd = _0x39ead9[_0x17a128];
    if (_0x5ab8dd?.isGenerating === true) {
      _0x5aa3e4 += 1;
      continue;
    }
    const _0x17c750 = findGenerateButtonForNode(root, _0x17a128);
    if (!_0x17c750) {
      _0x5db515 += 1;
      continue;
    }
    if (_0x17c750.disabled) {
      _0x2b6c18 += 1;
      continue;
    }
    _0x17c750.click();
    _0x26f526 += 1;
  }
  if (_0x26f526 > 0) {
    showToast?.(groupExecutionText("groupTriggered", {
      count: _0x26f526
    }), "success");
  } else if (_0x5aa3e4 > 0) {
    showToast?.(groupExecutionText("groupRunning"), "warn");
  } else {
    showToast?.(groupExecutionText("groupNoTriggerable"), "warn");
  }
  return {
    clicked: _0x26f526,
    total: _0x36d788.length,
    missing: _0x5db515,
    skippedDisabled: _0x2b6c18,
    skippedGenerating: _0x5aa3e4
  };
}
export function executeSelectedGenerateButtons({
  selectedIds: _0x2ab3fd,
  state = a977_0x2d33ee.getState(),
  root = globalThis.document,
  showToast = globalThis.window?.showToast,
  staggerMs = DEFAULT_SELECTED_GENERATE_STAGGER_MS,
  scheduleTimeout = globalThis.setTimeout,
  clearScheduledTimeout = globalThis.clearTimeout,
  onStateChange = () => {}
} = {}) {
  cancelActiveSelectedGenerateQueue();
  const _0x34f3e7 = state?.nodes || {};
  const _0x174c9d = collectSelectedExecutableNodeIds(_0x34f3e7, _0x2ab3fd || state?.selectedNodeIds || []);
  if (_0x174c9d.length === 0) {
    showToast?.(groupExecutionText("selectedNoExecutable"), "warn");
    return {
      clicked: 0,
      total: 0,
      missing: 0,
      skippedDisabled: 0,
      skippedGenerating: 0
    };
  }
  let _0x18276c = 0;
  let _0xffe91f = 0;
  let _0x36ebd3 = 0;
  let _0x28bbc3 = 0;
  const _0x53edba = {
    cancelled: false,
    timeoutIds: new Set(),
    clearScheduledTimeout: clearScheduledTimeout,
    onStateChange: onStateChange
  };
  const _0x4e7434 = _0x1275b9 => {
    _0x53edba.timeoutIds.delete(_0x1275b9);
    if (_0x53edba.timeoutIds.size > 0) {
      return;
    }
    if (activeSelectedGenerateBatch === _0x53edba) {
      activeSelectedGenerateBatch = null;
      _0x53edba.onStateChange?.(false);
    }
  };
  for (const _0x3dbbd9 of _0x174c9d) {
    const _0x20866a = _0x34f3e7[_0x3dbbd9];
    if (_0x20866a?.isGenerating === true) {
      _0x28bbc3 += 1;
      continue;
    }
    const _0x44ad54 = findGenerateButtonForNode(root, _0x3dbbd9);
    if (!_0x44ad54) {
      _0xffe91f += 1;
      continue;
    }
    if (_0x44ad54.disabled) {
      _0x36ebd3 += 1;
      continue;
    }
    const _0x353cf3 = _0x18276c * normalizeStaggerMs(staggerMs);
    if (_0x353cf3 > 0) {
      let _0x1c64b8 = null;
      const _0x594096 = () => {
        if (!_0x53edba.cancelled && !_0x44ad54.disabled) {
          _0x44ad54.click();
        }
        _0x4e7434(_0x1c64b8);
      };
      _0x1c64b8 = scheduleTimeout(_0x594096, _0x353cf3);
      _0x53edba.timeoutIds.add(_0x1c64b8);
    } else {
      scheduleGenerateButtonClick(_0x44ad54, 0, scheduleTimeout);
    }
    _0x18276c += 1;
  }
  if (_0x53edba.timeoutIds.size > 0) {
    activeSelectedGenerateBatch = _0x53edba;
    _0x53edba.onStateChange?.(true);
  }
  if (_0x18276c > 0) {
    showToast?.(groupExecutionText("selectedTriggered", {
      count: _0x18276c
    }), "success");
  } else if (_0x28bbc3 > 0) {
    showToast?.(groupExecutionText("selectedRunning"), "warn");
  } else {
    showToast?.(groupExecutionText("selectedNoTriggerable"), "warn");
  }
  return {
    clicked: _0x18276c,
    total: _0x174c9d.length,
    missing: _0xffe91f,
    skippedDisabled: _0x36ebd3,
    skippedGenerating: _0x28bbc3
  };
}