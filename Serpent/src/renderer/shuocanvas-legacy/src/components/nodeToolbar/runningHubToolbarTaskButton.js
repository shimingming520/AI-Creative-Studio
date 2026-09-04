import { cancelRunningHubTask } from "../../../api/runninghubTaskApi.js";
import { ensureConfig, getProviderConfig } from "../../../api/configApi.js";
import a450_0x5efb50 from "../../core/stores/appStore.js";
import { isTaskCancelled, isTaskRunning } from "../../core/generationTaskUiState.js";
import { cancelTask as a450_0x1bfce8 } from "../../core/generationTaskRuntime.js";
import { GENERATE_CANCEL_ICON_HTML } from "../../modules/previewGenerateButtonUi.js";
import { normalizeProviderId, resolveModelExecution } from "../../manifests/index.js";
import { bindToolbarTaskButton, findToolbarTaskForNode, notifyToolbarTasksChanged } from "../shared/taskToolbarPresenter.js";
import { t } from "../../i18n/index.js";
export const RUNNING_HUB_TOOLBAR_TASK_EVENT = "aicanvas:runninghub-toolbar-task-change";
export const RUNNING_HUB_CANCEL_ICON_HTML = GENERATE_CANCEL_ICON_HTML;
function toolbarText(_0x5847df, _0x372ea7 = {}) {
  return t("nodeToolbar.common." + _0x5847df, _0x372ea7);
}
function getStateSnapshot() {
  if (typeof a450_0x5efb50.getStateRaw === "function") {
    return a450_0x5efb50.getStateRaw();
  } else {
    return a450_0x5efb50.getState();
  }
}
function normalizeList(_0x131600) {
  if (Array.isArray(_0x131600)) {
    return _0x131600.map(_0x4e17ba => String(_0x4e17ba || "").trim()).filter(Boolean);
  } else {
    return [];
  }
}
function includesAny(_0x496c3b, _0x42ee5b) {
  const _0x5040af = String(_0x496c3b || "");
  return _0x42ee5b.some(_0x378117 => _0x5040af.includes(_0x378117));
}
function getTaskTime(_0x4818c7) {
  return Number(_0x4818c7?.rhTaskStartedAt || _0x4818c7?.generationStartTime || 0) || 0;
}
function isRunningHubTaskProvider(_0x56705c) {
  const _0x4f5b9d = normalizeProviderId(_0x56705c?.provider);
  if (_0x4f5b9d === "runninghubwf" || _0x4f5b9d === "runninghub") {
    return true;
  }
  const _0x2e676b = String(_0x56705c?.model || "").trim();
  if (!_0x2e676b) {
    return false;
  }
  const _0x55918d = resolveModelExecution(_0x2e676b, {
    providerHint: _0x4f5b9d
  });
  const _0x231ca4 = normalizeProviderId(_0x55918d?.modelManifest?.provider);
  const _0x20c903 = normalizeProviderId(_0x55918d?.executionManifest?.provider);
  return _0x231ca4 === "runninghubwf" || _0x231ca4 === "runninghub" || _0x20c903 === "runninghubwf" || _0x20c903 === "runninghub";
}
function hasRunningHubTaskMarker(_0x3cd9a1) {
  return isRunningHubTaskProvider(_0x3cd9a1) || !!String(_0x3cd9a1?.rhTaskId || "").trim() || !!String(_0x3cd9a1?.rhTaskStatus || "").trim() || !!String(_0x3cd9a1?.rhSourceNodeId || "").trim() || !!String(_0x3cd9a1?.rhToolbarTaskType || "").trim();
}
export function notifyRunningHubToolbarTasksChanged(_0x34964d = {}) {
  notifyToolbarTasksChanged(_0x34964d, {
    eventName: RUNNING_HUB_TOOLBAR_TASK_EVENT
  });
}
export function isRunningHubToolbarTaskNode(_0x5d255d) {
  if (!_0x5d255d || typeof _0x5d255d !== "object") {
    return false;
  }
  return isTaskRunning(_0x5d255d) && hasRunningHubTaskMarker(_0x5d255d);
}
export function isRunningHubToolbarTaskCancelled(_0x5763a0) {
  const _0x2f32a2 = String(_0x5763a0 || "").trim();
  if (!_0x2f32a2) {
    return false;
  }
  const _0x20e388 = getStateSnapshot().nodes?.[_0x2f32a2];
  return hasRunningHubTaskMarker(_0x20e388) && isTaskCancelled(_0x20e388);
}
export function findRunningHubToolbarTaskForNode(_0x4356e5, {
  models = [],
  taskTypes = [],
  outputTextIncludes = [],
  nameIncludes = [],
  sourceField = "rhSourceNodeId"
} = {}) {
  const _0x50dc80 = findToolbarTaskForNode(_0x4356e5, {
    models: models,
    taskTypes: taskTypes,
    outputTextIncludes: outputTextIncludes,
    nameIncludes: nameIncludes,
    sourceField: sourceField,
    taskTypeField: "rhToolbarTaskType",
    isTaskNode: isRunningHubToolbarTaskNode
  });
  if (_0x50dc80) {
    return {
      ..._0x50dc80,
      cancellable: true,
      resumable: true
    };
  } else {
    return null;
  }
}
export function bindRunningHubToolbarTaskButton({
  button: _0x4a0871,
  getTask: _0x5b5d12,
  cancelTask: _0x13c412,
  cancelTooltip = toolbarText("cancelTask"),
  eventTypes = ["click"]
} = {}) {
  return bindToolbarTaskButton({
    button: _0x4a0871,
    getTask: _0x5b5d12,
    cancelTask: _0x13c412,
    cancelTooltip: cancelTooltip,
    eventTypes: eventTypes,
    eventName: RUNNING_HUB_TOOLBAR_TASK_EVENT,
    cancelIconHtml: RUNNING_HUB_CANCEL_ICON_HTML
  });
}
async function resolveRunningHubWorkflowAccess(_0xaa7366 = "") {
  try {
    await ensureConfig();
    const _0x197024 = String(_0xaa7366 || "").trim();
    const _0xf87bf = getProviderConfig(_0x197024 || "runninghubwf");
    return {
      apiKey: String(_0xf87bf?.apiKey || "").trim(),
      providerProfileId: String(_0x197024 || _0xf87bf?.providerProfileId || "").trim()
    };
  } catch {
    return {
      apiKey: "",
      providerProfileId: ""
    };
  }
}
export async function cancelRunningHubRemoteTaskQuietly({
  apiKey: _0x4b39ab,
  taskId: _0x49aed7,
  label: _0x1194fc,
  providerProfileId = "",
  rhProviderProfileId = ""
} = {}) {
  const _0x146c5c = String(providerProfileId || rhProviderProfileId || "").trim();
  const _0x2ce697 = await resolveRunningHubWorkflowAccess(_0x146c5c);
  const _0x365b2c = String(_0x4b39ab || "").trim() || _0x2ce697.apiKey;
  const _0x1e1496 = String(_0x49aed7 || "").trim();
  if (!_0x365b2c || !_0x1e1496) {
    return false;
  }
  try {
    await cancelRunningHubTask({
      apiKey: _0x365b2c,
      taskId: _0x1e1496,
      providerProfileId: _0x146c5c || _0x2ce697.providerProfileId
    });
    return true;
  } catch (_0x456a17) {
    console.warn("[" + (_0x1194fc || "RunningHubToolbarTask") + "] cancel request failed:", _0x456a17);
    return false;
  }
}
export async function cancelRunningHubResultTask(_0x17f5fc, {
  name: _0x59aa64,
  outputText: _0x203829,
  notifyMessage = toolbarText("taskCancelled"),
  notify = true
} = {}) {
  const _0x257fb5 = String(_0x17f5fc?.outId || _0x17f5fc?.node?.id || "").trim();
  if (!_0x257fb5) {
    return false;
  }
  const _0x1a223c = getStateSnapshot().nodes?.[_0x257fb5];
  if (!_0x1a223c) {
    return false;
  }
  const _0x48d82a = String(_0x17f5fc?.taskId || _0x1a223c.rhTaskId || "").trim();
  await a450_0x1bfce8(_0x257fb5, {
    store: a450_0x5efb50,
    cancellable: true,
    taskId: _0x48d82a,
    spec: {
      provider: "runninghubwf",
      adapterType: "workflow"
    },
    cancel: async ({
      taskId: _0x4c4bb4
    }) => {
      await cancelRunningHubRemoteTaskQuietly({
        apiKey: _0x17f5fc?.apiKey,
        taskId: _0x4c4bb4,
        label: "RunningHubToolbarTaskButton",
        providerProfileId: _0x17f5fc?.providerProfileId || _0x1a223c.taskProviderProfileId || _0x1a223c.providerProfileId || _0x1a223c.rhProviderProfileId
      });
    }
  });
  a450_0x5efb50.updateNodeData(_0x257fb5, {
    name: _0x59aa64 || _0x1a223c.name,
    outputText: _0x203829 || _0x1a223c.outputText
  });
  notifyRunningHubToolbarTasksChanged({
    outId: _0x257fb5,
    sourceNodeId: String(_0x1a223c.rhSourceNodeId || _0x17f5fc?.sourceNodeId || "")
  });
  window._triggerLocalCacheSave?.();
  if (notify) {
    window.showToast?.(notifyMessage, "info");
  }
  return true;
}