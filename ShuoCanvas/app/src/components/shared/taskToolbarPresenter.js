import a508_0x33f184 from "../../core/stores/appStore.js";
import { isTaskCancelled, isTaskRunning } from "../../core/generationTaskUiState.js";
import { GENERATE_CANCEL_ICON_HTML } from "../../modules/previewGenerateButtonUi.js";
export const TASK_TOOLBAR_EVENT = "aicanvas:generation-toolbar-task-change";
function getStateSnapshot() {
  if (typeof a508_0x33f184.getStateRaw === "function") {
    return a508_0x33f184.getStateRaw();
  } else {
    return a508_0x33f184.getState();
  }
}
function normalizeList(_0x570cb7) {
  if (Array.isArray(_0x570cb7)) {
    return _0x570cb7.map(_0x4cd796 => String(_0x4cd796 || "").trim()).filter(Boolean);
  } else {
    return [];
  }
}
function includesAny(_0x4d81cc, _0x324a0b) {
  const _0x56040b = String(_0x4d81cc || "");
  return _0x324a0b.some(_0x5452af => _0x56040b.includes(_0x5452af));
}
function getTaskTime(_0x42bfc2) {
  return Number(_0x42bfc2?.rhTaskStartedAt || _0x42bfc2?.asyncTaskStartedAt || _0x42bfc2?.generationStartTime || 0) || 0;
}
function defaultIsTaskNode(_0x5043fb) {
  return !!_0x5043fb && typeof _0x5043fb === "object" && isTaskRunning(_0x5043fb);
}
export function notifyToolbarTasksChanged(_0x1ff48e = {}, {
  eventName = TASK_TOOLBAR_EVENT
} = {}) {
  try {
    window.dispatchEvent?.(new CustomEvent(eventName, {
      detail: _0x1ff48e
    }));
  } catch {}
}
export function isToolbarTaskCancelled(_0x269f17, {
  isTaskNode = defaultIsTaskNode
} = {}) {
  const _0x1c1ad1 = String(_0x269f17 || "").trim();
  if (!_0x1c1ad1) {
    return false;
  }
  const _0x1f3664 = getStateSnapshot().nodes?.[_0x1c1ad1];
  if (!!_0x1f3664 && isTaskNode(_0x1f3664) === false) {
    return false;
  } else {
    return isTaskCancelled(_0x1f3664);
  }
}
export function findToolbarTaskForNode(_0x2e501b, {
  models = [],
  taskTypes = [],
  outputTextIncludes = [],
  nameIncludes = [],
  sourceField = "rhSourceNodeId",
  taskTypeField = "rhToolbarTaskType",
  isTaskNode = defaultIsTaskNode
} = {}) {
  const _0x1368af = String(_0x2e501b || "").trim();
  if (!_0x1368af) {
    return null;
  }
  const _0x50b61f = new Set(normalizeList(models).map(_0x43c766 => _0x43c766.toLowerCase()));
  const _0x9445f1 = new Set(normalizeList(taskTypes));
  const _0x599584 = normalizeList(outputTextIncludes);
  const _0x2fef28 = normalizeList(nameIncludes);
  const _0x539525 = Object.values(getStateSnapshot().nodes || {}).filter(_0x53b2d8 => {
    if (!_0x53b2d8 || typeof _0x53b2d8 !== "object") {
      return false;
    }
    const _0x1fa875 = String(_0x53b2d8.id || "") === _0x1368af || String(_0x53b2d8[sourceField] || "") === _0x1368af;
    if (!_0x1fa875) {
      return false;
    }
    if (!isTaskNode(_0x53b2d8)) {
      return false;
    }
    if (_0x50b61f.size) {
      const _0x4383b9 = String(_0x53b2d8.model || "").trim().toLowerCase();
      if (!_0x50b61f.has(_0x4383b9)) {
        return false;
      }
    }
    const _0x337250 = _0x9445f1.size > 0 && _0x9445f1.has(String(_0x53b2d8[taskTypeField] || "").trim());
    const _0x3327d4 = _0x599584.length > 0 && includesAny(_0x53b2d8.outputText, _0x599584);
    const _0x3a1761 = _0x2fef28.length > 0 && includesAny(_0x53b2d8.name, _0x2fef28);
    const _0x1e8792 = _0x9445f1.size > 0 || _0x599584.length > 0 || _0x2fef28.length > 0;
    return !_0x1e8792 || _0x337250 || _0x3327d4 || _0x3a1761;
  }).sort((_0x5e9d1c, _0x3470a2) => getTaskTime(_0x3470a2) - getTaskTime(_0x5e9d1c));
  const _0x249e4f = _0x539525[0] || null;
  if (!_0x249e4f) {
    return null;
  }
  return {
    sourceNodeId: String(_0x249e4f[sourceField] || ""),
    outId: String(_0x249e4f.id || ""),
    targetNodeId: String(_0x249e4f.id || ""),
    taskId: String(_0x249e4f.rhTaskId || _0x249e4f.asyncTaskId || ""),
    apiKey: "",
    node: _0x249e4f,
    fromStore: true
  };
}
export function bindToolbarTaskButton({
  button: _0x776598,
  getTask: _0xb6d872,
  cancelTask: _0x2c9984,
  cancelTooltip = "取消任务",
  eventTypes = ["click"],
  eventName = TASK_TOOLBAR_EVENT,
  cancelIconHtml = GENERATE_CANCEL_ICON_HTML
} = {}) {
  if (!_0x776598 || typeof _0xb6d872 !== "function") {
    return () => {};
  }
  const _0x137990 = {
    html: _0x776598.innerHTML,
    color: _0x776598.style?.color || "",
    tooltip: _0x776598.dataset?.tooltip,
    aria: _0x776598.getAttribute?.("aria-label") || "",
    title: _0x776598.title || ""
  };
  let _0x519584 = "";
  let _0x1e2cab = true;
  const _0x1d02a8 = () => {
    const _0x1629ff = _0xb6d872() || null;
    const _0x4fba30 = String(_0x1629ff?.outId || _0x1629ff?.targetNodeId || "");
    if (_0x1e2cab && _0x4fba30 === _0x519584) {
      return;
    }
    _0x1e2cab = true;
    _0x519584 = _0x4fba30;
    const _0x14f326 = !!_0x519584;
    _0x776598.classList?.toggle?.("is-task-cancel", _0x14f326);
    if (_0x14f326) {
      _0x776598.innerHTML = cancelIconHtml;
      if (_0x776598.dataset) {
        _0x776598.dataset.tooltip = cancelTooltip;
      }
      _0x776598.setAttribute?.("aria-label", cancelTooltip);
      _0x776598.title = cancelTooltip;
      return;
    }
    _0x776598.innerHTML = _0x137990.html;
    if (_0x776598.style) {
      _0x776598.style.color = _0x137990.color || "";
    }
    if (_0x776598.dataset) {
      if (_0x137990.tooltip == null) {
        delete _0x776598.dataset.tooltip;
      } else {
        _0x776598.dataset.tooltip = _0x137990.tooltip;
      }
    }
    if (_0x137990.aria) {
      _0x776598.setAttribute?.("aria-label", _0x137990.aria);
    } else {
      _0x776598.removeAttribute?.("aria-label");
    }
    _0x776598.title = _0x137990.title || "";
  };
  const _0x207a7b = _0x110203 => {
    const _0x2c2709 = _0xb6d872() || null;
    if (!_0x2c2709) {
      return;
    }
    _0x110203.preventDefault?.();
    _0x110203.stopPropagation?.();
    _0x110203.stopImmediatePropagation?.();
    Promise.resolve(_0x2c9984?.(_0x2c2709)).finally(_0x1d02a8);
  };
  const _0x18eed7 = normalizeList(eventTypes);
  _0x18eed7.forEach(_0x463e9d => {
    _0x776598.addEventListener?.(_0x463e9d, _0x207a7b, true);
  });
  window.addEventListener?.(eventName, _0x1d02a8);
  _0x1d02a8();
  return () => {
    _0x18eed7.forEach(_0x4516e3 => {
      _0x776598.removeEventListener?.(_0x4516e3, _0x207a7b, true);
    });
    window.removeEventListener?.(eventName, _0x1d02a8);
    if (_0x519584) {
      _0x519584 = "";
      _0x1d02a8();
    }
  };
}