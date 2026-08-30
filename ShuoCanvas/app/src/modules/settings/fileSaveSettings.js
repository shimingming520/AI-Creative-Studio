import { fetchFileSavePathMigrationStatus, fetchUserSettingsFromServer, saveUserSettingsToServer, startFileSavePathMigration } from "../../../api/userSettingsApi.js";
import { enqueueElectronMediaTask, waitForElectronMediaTask } from "../../../api/localMediaTaskApi.js";
import { t } from "../../i18n/index.js";
import { showError, showSuccess } from "../../services/toastService.js";
import { desktopBridge } from "../../services/desktopBridge.js";
const MIGRATION_POLL_INTERVAL_MS = 350;
const ASR_RUNTIME_INSTALL_TIMEOUT_MS = 5400000;
const AUDIO_VOICE_MODEL_PREPARE_TIMEOUT_MS = 3600000;
const FUNASR_GPU_TORCH_INSTALL_TIMEOUT_MS = 5400000;
const ROOT_FIELD_ID = "fileSaveRootDir";
const ROOT_BUTTON_ID = "btnFileSaveRootDirPick";
const SUBTITLE_RECOGNITION_ENGINE_GROUP_ID = "subtitleRecognitionEngineGroup";
const SUBTITLE_RECOGNITION_MODEL_BUTTON_ID = "btnSubtitleRecognitionModelPrepare";
const SUBTITLE_RECOGNITION_STATUS_ID = "subtitleRecognitionStatus";
const SUBTITLE_RECOGNITION_DEFAULTS = Object.freeze({
  engine: "cpu",
  modelStatus: "notDownloaded",
  modelStatusByEngine: Object.freeze({}),
  modelRootKey: "",
  modelPreparedAt: 0
});
const FIELD_IDS = {
  canvasDir: "fileSaveCanvasDir",
  dataDir: "fileSaveDataDir",
  outputDir: "fileSaveOutputDir"
};
const MANAGED_DIR_NAMES = {
  canvasDir: "projects",
  dataDir: "data",
  outputDir: "output"
};
const MIGRATION_STAGE_I18N_KEYS = Object.freeze({
  准备迁移文件: "migration.preparing",
  正在创建迁移任务: "migration.creatingTask",
  正在迁移文件: "migration.migrating",
  正在迁移输出文件保存路径: "migration.migrateOutput",
  迁移完成: "migration.done"
});
let currentFileSaveUserSettings = {};
let subtitleRecognitionSettings = {
  ...SUBTITLE_RECOGNITION_DEFAULTS
};
let subtitleRecognitionPrepareState = {
  status: "idle",
  progress: 0,
  message: ""
};
let stopSubtitleRecognitionTaskUpdateListener = null;
let activeSubtitleRecognitionTaskId = "";
function fileSaveText(_0x2161f9, _0x5a5bf4 = {}) {
  return t("settings.fileSave." + _0x2161f9, _0x5a5bf4);
}
function errorMessage(_0xf737bf) {
  if (typeof _0xf737bf === "string") {
    return _0xf737bf || fileSaveText("runtime.unknownError");
  }
  return _0xf737bf?.message || fileSaveText("runtime.unknownError");
}
function getInput(_0x5afec2) {
  return document.getElementById(FIELD_IDS[_0x5afec2]);
}
function getRootInput() {
  return document.getElementById(ROOT_FIELD_ID);
}
function getRootPickButton() {
  return document.getElementById(ROOT_BUTTON_ID);
}
function normalizeText(_0x5bf7d7) {
  return String(_0x5bf7d7 || "").trim();
}
function normalizeSubtitleRecognitionEngine(_0x3d2d9f) {
  if (String(_0x3d2d9f || "").trim().toLowerCase() === "gpu") {
    return "gpu";
  } else {
    return "cpu";
  }
}
function normalizeSubtitleRecognitionModelStatus(_0x269b6a) {
  const _0x2cfef5 = String(_0x269b6a || "").trim();
  if (_0x2cfef5 === "ready") {
    return "ready";
  } else {
    return "notDownloaded";
  }
}
function normalizeSubtitleRecognitionEngineStatus(_0x5beb13 = {}) {
  return {
    modelStatus: normalizeSubtitleRecognitionModelStatus(_0x5beb13?.modelStatus),
    modelRootKey: normalizeText(_0x5beb13?.modelRootKey),
    modelPreparedAt: Number(_0x5beb13?.modelPreparedAt || 0) || 0
  };
}
function normalizeSubtitleRecognitionStatusByEngine(_0x18abbe = {}, _0x267f90 = "cpu") {
  const _0x330b17 = _0x18abbe?.modelStatusByEngine || {};
  const _0x2881cb = {};
  for (const _0x1d2081 of ["cpu", "gpu"]) {
    const _0xa307c1 = normalizeSubtitleRecognitionEngine(_0x1d2081);
    const _0xa927a9 = _0x330b17?.[_0xa307c1];
    if (_0xa927a9 && typeof _0xa927a9 === "object") {
      _0x2881cb[_0xa307c1] = normalizeSubtitleRecognitionEngineStatus(_0xa927a9);
    }
  }
  const _0x19d9a1 = normalizeSubtitleRecognitionEngine(_0x267f90);
  if (Object.keys(_0x2881cb).length === 0 && !_0x2881cb[_0x19d9a1] && _0x18abbe?.modelStatus === "ready") {
    _0x2881cb[_0x19d9a1] = normalizeSubtitleRecognitionEngineStatus(_0x18abbe);
  }
  return _0x2881cb;
}
function normalizeSubtitleRecognitionSettings(_0x15419e = {}) {
  const _0x53ac46 = normalizeSubtitleRecognitionEngine(_0x15419e?.engine);
  const _0x2cd145 = normalizeSubtitleRecognitionStatusByEngine(_0x15419e, _0x53ac46);
  const _0x3b9d49 = Object.keys(_0x2cd145).length > 0;
  const _0x28135d = _0x2cd145[_0x53ac46] || normalizeSubtitleRecognitionEngineStatus(_0x3b9d49 ? {} : _0x15419e);
  return {
    ...SUBTITLE_RECOGNITION_DEFAULTS,
    ...(_0x15419e || {}),
    engine: _0x53ac46,
    modelStatusByEngine: _0x2cd145,
    modelStatus: normalizeSubtitleRecognitionModelStatus(_0x28135d.modelStatus),
    modelRootKey: normalizeText(_0x28135d.modelRootKey),
    modelPreparedAt: Number(_0x28135d.modelPreparedAt || 0) || 0
  };
}
function translateMigrationStage(_0x13145d) {
  const _0x95222b = normalizeText(_0x13145d);
  if (!_0x95222b) {
    return "";
  }
  const _0x3fb4cf = MIGRATION_STAGE_I18N_KEYS[_0x95222b];
  if (_0x3fb4cf) {
    return fileSaveText(_0x3fb4cf);
  } else {
    return _0x95222b;
  }
}
function trimTrailingPathSeparators(_0x5b8364) {
  const _0x527265 = normalizeText(_0x5b8364);
  if (/^[a-zA-Z]:[\\/]*$/.test(_0x527265)) {
    return _0x527265.slice(0, 2) + "\\";
  }
  if (_0x527265 === "/" || _0x527265 === "\\") {
    return _0x527265;
  }
  return _0x527265.replace(/[\\/]+$/g, "");
}
function getPathSeparator(_0xf70a3c) {
  const _0x5ce6f2 = normalizeText(_0xf70a3c);
  if (_0x5ce6f2.includes("\\") && !_0x5ce6f2.includes("/")) {
    return "\\";
  } else {
    return "/";
  }
}
function joinPath(_0x3559c4, _0xd61160) {
  const _0x1e750a = trimTrailingPathSeparators(_0x3559c4);
  if (!_0x1e750a) {
    return "";
  }
  if (_0x1e750a === "/" || _0x1e750a === "\\") {
    return "" + _0x1e750a + _0xd61160;
  }
  if (/^[a-zA-Z]:\\$/.test(_0x1e750a)) {
    return "" + _0x1e750a + _0xd61160;
  }
  return "" + _0x1e750a + getPathSeparator(_0x1e750a) + _0xd61160;
}
function pathKey(_0x3847fd) {
  return trimTrailingPathSeparators(_0x3847fd).replace(/\\/g, "/").toLowerCase();
}
function pathBasename(_0x3ae987) {
  const _0x444e39 = trimTrailingPathSeparators(_0x3ae987).replace(/\\/g, "/");
  const _0x463cc1 = _0x444e39.split("/").filter(Boolean);
  return _0x463cc1.at(-1) || "";
}
function normalizeParentPath(_0x172810) {
  const _0x47e8ba = trimTrailingPathSeparators(_0x172810);
  const _0x352e19 = _0x47e8ba.match(/^(.*)[\\/][^\\/]+$/);
  if (!_0x352e19) {
    return "";
  }
  const _0xaf857a = trimTrailingPathSeparators(_0x352e19[1]);
  if (/^[a-zA-Z]:$/.test(_0xaf857a)) {
    return _0xaf857a + "\\";
  } else {
    return _0xaf857a;
  }
}
function buildManagedPaths(_0x13d78c) {
  const _0x3e1b7f = trimTrailingPathSeparators(_0x13d78c);
  return {
    canvasDir: joinPath(_0x3e1b7f, MANAGED_DIR_NAMES.canvasDir),
    dataDir: joinPath(_0x3e1b7f, MANAGED_DIR_NAMES.dataDir),
    outputDir: joinPath(_0x3e1b7f, MANAGED_DIR_NAMES.outputDir)
  };
}
function inferManagedRoot(_0x3f67f4) {
  const _0x420bbb = normalizeFileSavePaths(_0x3f67f4);
  const _0xe18320 = [];
  for (const [_0xabd8b4, _0x8f03fa] of Object.entries(MANAGED_DIR_NAMES)) {
    const _0x4b8f2a = normalizeText(_0x420bbb?.[_0xabd8b4]);
    if (!_0x4b8f2a || pathBasename(_0x4b8f2a).toLowerCase() !== _0x8f03fa.toLowerCase()) {
      return "";
    }
    _0xe18320.push(normalizeParentPath(_0x4b8f2a));
  }
  const [_0x197f26] = _0xe18320;
  if (!_0x197f26) {
    return "";
  }
  if (_0xe18320.every(_0x4a8838 => pathKey(_0x4a8838) === pathKey(_0x197f26))) {
    return _0x197f26;
  } else {
    return "";
  }
}
function inferDataDirFromTempDir(_0x4db1be) {
  const _0x421918 = normalizeText(_0x4db1be).replace(/\\/g, "/");
  if (!_0x421918) {
    return "";
  }
  if (/\/uploads\/?$/i.test(_0x421918)) {
    return _0x421918.replace(/\/uploads\/?$/i, "");
  } else {
    return _0x421918;
  }
}
function normalizeFileSavePaths(_0x459286) {
  return {
    ...(_0x459286 || {}),
    dataDir: normalizeText(_0x459286?.dataDir) || inferDataDirFromTempDir(_0x459286?.tempDir)
  };
}
function getSettingsRootDir(_0x14633e = {}) {
  return normalizeText(_0x14633e?.fileSavePathsMeta?.rootDir) || inferManagedRoot(_0x14633e?.fileSavePaths || {});
}
function getCurrentRootKey(_0x2b4d46 = currentFileSaveUserSettings) {
  return pathKey(getSettingsRootDir(_0x2b4d46));
}
function getSubtitleRecognitionEngineStatus(_0x175cb3, _0xf90ccc = _0x175cb3?.engine) {
  const _0x1c5f6d = normalizeSubtitleRecognitionSettings(_0x175cb3);
  const _0x4d30f0 = normalizeSubtitleRecognitionEngine(_0xf90ccc || _0x1c5f6d.engine);
  return _0x1c5f6d.modelStatusByEngine?.[_0x4d30f0] || (_0x4d30f0 === _0x1c5f6d.engine ? normalizeSubtitleRecognitionEngineStatus(_0x1c5f6d) : null);
}
function modelStatusForCurrentRoot(_0x398662, _0x15583d = getCurrentRootKey(), _0x6715e = _0x398662?.engine) {
  const _0x59447f = getSubtitleRecognitionEngineStatus(_0x398662, _0x6715e);
  if (!_0x59447f || _0x59447f.modelStatus !== "ready") {
    return "notDownloaded";
  }
  if (_0x59447f.modelRootKey && pathKey(_0x59447f.modelRootKey) === pathKey(_0x15583d)) {
    return "ready";
  } else {
    return "notDownloaded";
  }
}
function getSubtitleRecognitionElements() {
  return {
    group: document.getElementById(SUBTITLE_RECOGNITION_ENGINE_GROUP_ID),
    modelButton: document.getElementById(SUBTITLE_RECOGNITION_MODEL_BUTTON_ID),
    status: document.getElementById(SUBTITLE_RECOGNITION_STATUS_ID)
  };
}
function subtitleRecognitionText(_0x556107, _0x12c0a4 = {}) {
  return fileSaveText("subtitleRecognition." + _0x556107, _0x12c0a4);
}
function syncSubtitleRecognitionEngineButtons(_0x50b685) {
  const _0x23a226 = getSubtitleRecognitionElements().group;
  if (!_0x23a226) {
    return;
  }
  _0x23a226.querySelectorAll?.("[data-subtitle-recognition-engine]")?.forEach(_0x2442c6 => {
    const _0x138885 = normalizeSubtitleRecognitionEngine(_0x2442c6.dataset?.subtitleRecognitionEngine) === _0x50b685;
    _0x2442c6.classList.toggle("active", _0x138885);
    _0x2442c6.setAttribute?.("aria-pressed", _0x138885 ? "true" : "false");
    _0x2442c6.disabled = subtitleRecognitionPrepareState.status === "downloading" || subtitleRecognitionPrepareState.status === "installing" || subtitleRecognitionPrepareState.status === "checking";
  });
}
function getSubtitleRecognitionStatusLabel() {
  if (subtitleRecognitionPrepareState.status === "downloading") {
    return subtitleRecognitionText("status.downloading", {
      percent: clampPercent(subtitleRecognitionPrepareState.progress * 100) + "%"
    });
  }
  if (subtitleRecognitionPrepareState.status === "installing") {
    return subtitleRecognitionText("status.installing", {
      percent: clampPercent(subtitleRecognitionPrepareState.progress * 100) + "%"
    });
  }
  if (subtitleRecognitionPrepareState.status === "checking") {
    return subtitleRecognitionText("status.checking");
  }
  if (subtitleRecognitionPrepareState.status === "gpuRequired") {
    return subtitleRecognitionText("status.gpuRequired");
  }
  if (subtitleRecognitionPrepareState.status === "error") {
    return subtitleRecognitionText("status.retry");
  }
  const _0x3f6dbe = getCurrentRootKey();
  const _0x2013ad = modelStatusForCurrentRoot(subtitleRecognitionSettings, _0x3f6dbe, subtitleRecognitionSettings.engine);
  if (_0x2013ad === "ready") {
    return subtitleRecognitionText("status.ready");
  } else {
    return subtitleRecognitionText("status.download");
  }
}
function renderSubtitleRecognitionSettings() {
  const _0x2f0931 = getSubtitleRecognitionElements();
  const _0x3232ba = normalizeSubtitleRecognitionEngine(subtitleRecognitionSettings.engine);
  syncSubtitleRecognitionEngineButtons(_0x3232ba);
  if (_0x2f0931.modelButton) {
    const _0x495718 = subtitleRecognitionPrepareState.status === "downloading";
    const _0x32f436 = subtitleRecognitionPrepareState.status === "installing";
    const _0x30549e = subtitleRecognitionPrepareState.status === "checking";
    const _0x4a66fd = subtitleRecognitionPrepareState.status !== "error" && subtitleRecognitionPrepareState.status !== "gpuRequired" && subtitleRecognitionPrepareState.status !== "checking" && subtitleRecognitionPrepareState.status !== "installing" && modelStatusForCurrentRoot(subtitleRecognitionSettings, getCurrentRootKey(), subtitleRecognitionSettings.engine) === "ready";
    _0x2f0931.modelButton.textContent = getSubtitleRecognitionStatusLabel();
    _0x2f0931.modelButton.disabled = _0x495718 || _0x30549e || _0x32f436;
    _0x2f0931.modelButton.classList.toggle("is-success", _0x4a66fd);
    _0x2f0931.modelButton.classList.toggle("is-error", subtitleRecognitionPrepareState.status === "error");
    _0x2f0931.modelButton.classList.toggle("is-warning", subtitleRecognitionPrepareState.status === "gpuRequired");
    _0x2f0931.modelButton.classList.toggle("is-busy", _0x495718 || _0x30549e || _0x32f436);
  }
  if (_0x2f0931.status) {
    const _0x10b3c5 = normalizeText(subtitleRecognitionPrepareState.message);
    _0x2f0931.status.textContent = _0x10b3c5;
    _0x2f0931.status.classList.toggle("is-error", subtitleRecognitionPrepareState.status === "error");
    _0x2f0931.status.classList.toggle("is-warning", subtitleRecognitionPrepareState.status === "gpuRequired");
    _0x2f0931.status.classList.toggle("is-success", modelStatusForCurrentRoot(subtitleRecognitionSettings, getCurrentRootKey(), subtitleRecognitionSettings.engine) === "ready");
  }
}
function clearSubtitleRecognitionTaskUpdateListener() {
  stopSubtitleRecognitionTaskUpdateListener?.();
  stopSubtitleRecognitionTaskUpdateListener = null;
  activeSubtitleRecognitionTaskId = "";
}
function installSubtitleRecognitionTaskUpdateListener(_0x245a4b, _0x24311d = "downloading") {
  clearSubtitleRecognitionTaskUpdateListener();
  const _0x4e572f = normalizeText(_0x245a4b);
  if (!_0x4e572f || !desktopBridge.mediaTask.isAvailable()) {
    return;
  }
  activeSubtitleRecognitionTaskId = _0x4e572f;
  stopSubtitleRecognitionTaskUpdateListener = desktopBridge.mediaTask.onUpdate(_0x3fcd2b => {
    if (normalizeText(_0x3fcd2b?.taskId) !== activeSubtitleRecognitionTaskId) {
      return;
    }
    const _0x22ac89 = Math.max(0, Math.min(1, Number(_0x3fcd2b?.progress || 0) || 0));
    subtitleRecognitionPrepareState = {
      status: _0x24311d,
      progress: _0x22ac89,
      message: normalizeText(_0x3fcd2b?.message)
    };
    renderSubtitleRecognitionSettings();
  });
}
async function saveSubtitleRecognitionSettings(_0x5ac3fc = {}, {
  silent = true
} = {}) {
  const _0x3f7f20 = await fetchUserSettingsFromServer().catch(() => currentFileSaveUserSettings || {});
  const _0x4d76fb = getCurrentRootKey(_0x3f7f20);
  const _0x390cee = normalizeSubtitleRecognitionSettings(_0x3f7f20?.subtitleRecognition || {});
  const _0x40272f = normalizeSubtitleRecognitionEngine(_0x5ac3fc.engine || _0x390cee.engine);
  const _0x3e66f5 = {
    ...(_0x390cee.modelStatusByEngine || {})
  };
  const _0x14b5b4 = Object.prototype.hasOwnProperty.call(_0x5ac3fc, "modelStatus");
  const _0x5af9e1 = normalizeSubtitleRecognitionModelStatus(_0x5ac3fc.modelStatus);
  if (_0x14b5b4) {
    _0x3e66f5[_0x40272f] = normalizeSubtitleRecognitionEngineStatus({
      modelStatus: _0x5af9e1,
      modelRootKey: _0x5af9e1 === "ready" ? _0x4d76fb : "",
      modelPreparedAt: _0x5af9e1 === "ready" ? _0x5ac3fc.modelPreparedAt || Date.now() : 0
    });
  }
  const _0x31d683 = normalizeSubtitleRecognitionSettings({
    ..._0x390cee,
    ..._0x5ac3fc,
    engine: _0x40272f,
    modelStatusByEngine: _0x3e66f5,
    ...(_0x14b5b4 ? {
      modelStatus: _0x5af9e1,
      modelRootKey: _0x5af9e1 === "ready" ? _0x4d76fb : "",
      modelPreparedAt: _0x5af9e1 === "ready" ? _0x5ac3fc.modelPreparedAt || Date.now() : 0
    } : {})
  });
  currentFileSaveUserSettings = {
    ...(_0x3f7f20 || {}),
    subtitleRecognition: _0x31d683
  };
  const _0x41b7eb = await saveUserSettingsToServer(currentFileSaveUserSettings);
  if (_0x41b7eb?.settings && typeof _0x41b7eb.settings === "object") {
    currentFileSaveUserSettings = _0x41b7eb.settings;
  }
  subtitleRecognitionSettings = normalizeSubtitleRecognitionSettings(currentFileSaveUserSettings.subtitleRecognition || _0x31d683);
  renderSubtitleRecognitionSettings();
  if (!silent) {
    showSuccess(subtitleRecognitionText("saved"));
  }
  return subtitleRecognitionSettings;
}
function isGpuRuntimeUnavailableError(_0xdcfe49) {
  const _0x5c0f31 = errorMessage(_0xdcfe49).toLowerCase();
  return _0x5c0f31.includes("gpu acceleration was selected") || _0x5c0f31.includes("cuda is not available") || _0x5c0f31.includes("cpu-only pytorch") || _0x5c0f31.includes("cpu-only torch") || _0x5c0f31.includes("requires pytorch") || _0x5c0f31.includes("cuda") && _0x5c0f31.includes("not available");
}
function isGpuRuntimeUnavailableCode(_0x4ac96f) {
  return new Set(["gpu_unavailable", "cuda_unavailable", "torch_cpu_only", "torch_missing"]).has(String(_0x4ac96f || ""));
}
function isGpuRuntimeUnavailableResult(_0x5ab09c = {}) {
  return _0x5ab09c?.available === false && (isGpuRuntimeUnavailableCode(_0x5ab09c?.code) || isGpuRuntimeUnavailableError(_0x5ab09c?.message || ""));
}
function getGpuRuntimeUnavailableMessage(_0x36bdfc = {}) {
  const _0x25a579 = String(_0x36bdfc?.code || "");
  const _0x55223b = normalizeText(_0x36bdfc?.gpuName);
  if (_0x25a579 === "torch_cpu_only") {
    if (_0x55223b) {
      return subtitleRecognitionText("runtime.torchCpuOnlyWithGpu", {
        gpu: _0x55223b
      });
    } else {
      return subtitleRecognitionText("runtime.torchCpuOnly");
    }
  }
  if (_0x25a579 === "torch_missing") {
    return subtitleRecognitionText("runtime.torchMissing");
  }
  if (_0x25a579 === "cuda_unavailable") {
    return subtitleRecognitionText("runtime.cudaUnavailable");
  }
  return subtitleRecognitionText("runtime.gpuUnavailable");
}
async function checkSubtitleRecognitionRuntime(_0x226d03, {
  showFailureToast = true
} = {}) {
  const _0x3bf4e4 = normalizeSubtitleRecognitionEngine(_0x226d03);
  subtitleRecognitionPrepareState = {
    status: "checking",
    progress: 0,
    message: _0x3bf4e4 === "gpu" ? subtitleRecognitionText("runtime.checkingGpu") : subtitleRecognitionText("status.checking")
  };
  renderSubtitleRecognitionSettings();
  try {
    const _0x45656b = await enqueueElectronMediaTask({
      kind: "funasrRuntimeCheck",
      args: {
        engine: _0x3bf4e4
      }
    }, {
      wait: true,
      timeout: 120000
    });
    if (isGpuRuntimeUnavailableResult(_0x45656b)) {
      subtitleRecognitionPrepareState = {
        status: "gpuRequired",
        progress: 0,
        message: getGpuRuntimeUnavailableMessage(_0x45656b),
        code: String(_0x45656b?.code || ""),
        gpuName: normalizeText(_0x45656b?.gpuName)
      };
      renderSubtitleRecognitionSettings();
      return {
        available: false,
        engine: _0x3bf4e4
      };
    }
    if (!_0x45656b || _0x45656b.available === false) {
      const _0x1783c3 = errorMessage(_0x45656b?.message);
      if (String(_0x45656b?.code || "") === "funasr_missing") {
        await saveSubtitleRecognitionSettings({
          engine: _0x3bf4e4,
          modelStatus: "notDownloaded"
        });
      }
      subtitleRecognitionPrepareState = {
        status: "error",
        progress: 0,
        message: _0x1783c3
      };
      renderSubtitleRecognitionSettings();
      if (showFailureToast) {
        showError(subtitleRecognitionText("runtimeCheckFailed", {
          error: _0x1783c3
        }));
      }
      return {
        available: false,
        engine: _0x3bf4e4
      };
    }
    subtitleRecognitionPrepareState = {
      status: "idle",
      progress: 0,
      message: ""
    };
    renderSubtitleRecognitionSettings();
    return {
      available: true,
      engine: _0x3bf4e4
    };
  } catch (_0x2e124d) {
    const _0x458869 = isGpuRuntimeUnavailableError(_0x2e124d);
    subtitleRecognitionPrepareState = {
      status: _0x458869 ? "gpuRequired" : "error",
      progress: 0,
      code: _0x458869 ? "gpu_unavailable" : "",
      message: _0x458869 ? subtitleRecognitionText("runtime.gpuUnavailable") : errorMessage(_0x2e124d)
    };
    renderSubtitleRecognitionSettings();
    if (!_0x458869 && showFailureToast) {
      showError(subtitleRecognitionText("runtimeCheckFailed", {
        error: errorMessage(_0x2e124d)
      }));
    }
    return {
      available: false,
      engine: _0x3bf4e4
    };
  }
}
function shouldInstallSubtitleRecognitionGpuRuntime() {
  return normalizeSubtitleRecognitionEngine(subtitleRecognitionSettings.engine) === "gpu" && subtitleRecognitionPrepareState.status === "gpuRequired";
}
async function installSubtitleRecognitionGpuRuntime() {
  if (subtitleRecognitionPrepareState.status === "installing") {
    return;
  }
  subtitleRecognitionPrepareState = {
    status: "installing",
    progress: 0,
    message: subtitleRecognitionText("runtime.installingGpuTorch")
  };
  renderSubtitleRecognitionSettings();
  try {
    const _0x1113e3 = await enqueueElectronMediaTask({
      kind: "funasrGpuTorchInstall",
      args: {
        engine: "gpu"
      }
    });
    const _0x22e353 = normalizeText(_0x1113e3?.taskId);
    if (!_0x22e353) {
      throw new Error(subtitleRecognitionText("runtime.noTaskId"));
    }
    installSubtitleRecognitionTaskUpdateListener(_0x22e353, "installing");
    await waitForElectronMediaTask(_0x22e353, {
      timeout: FUNASR_GPU_TORCH_INSTALL_TIMEOUT_MS,
      diagnosticPayload: {
        kind: "funasrGpuTorchInstall"
      }
    });
    clearSubtitleRecognitionTaskUpdateListener();
    subtitleRecognitionPrepareState = {
      status: "idle",
      progress: 1,
      message: ""
    };
    renderSubtitleRecognitionSettings();
    showSuccess(subtitleRecognitionText("gpuInstallReadyToast"));
    await checkSubtitleRecognitionRuntime("gpu");
  } catch (_0x5da9c7) {
    clearSubtitleRecognitionTaskUpdateListener();
    subtitleRecognitionPrepareState = {
      status: "gpuRequired",
      progress: 0,
      message: errorMessage(_0x5da9c7),
      code: "gpu_install_failed"
    };
    renderSubtitleRecognitionSettings();
    showError(subtitleRecognitionText("gpuInstallFailed", {
      error: errorMessage(_0x5da9c7)
    }));
  }
}
async function prepareSubtitleRecognitionModel() {
  if (subtitleRecognitionPrepareState.status === "downloading" || subtitleRecognitionPrepareState.status === "installing") {
    return;
  }
  subtitleRecognitionPrepareState = {
    status: "downloading",
    progress: 0,
    message: subtitleRecognitionText("status.downloading", {
      percent: "0%"
    })
  };
  renderSubtitleRecognitionSettings();
  try {
    const _0x529662 = await enqueueElectronMediaTask({
      kind: "asrRuntimeInstall",
      args: {
        engine: normalizeSubtitleRecognitionEngine(subtitleRecognitionSettings.engine)
      }
    });
    const _0x2251b7 = normalizeText(_0x529662?.taskId);
    if (!_0x2251b7) {
      throw new Error(subtitleRecognitionText("runtime.noTaskId"));
    }
    installSubtitleRecognitionTaskUpdateListener(_0x2251b7);
    await waitForElectronMediaTask(_0x2251b7, {
      timeout: ASR_RUNTIME_INSTALL_TIMEOUT_MS,
      diagnosticPayload: {
        kind: "asrRuntimeInstall"
      }
    });
    clearSubtitleRecognitionTaskUpdateListener();
    subtitleRecognitionPrepareState = {
      status: "downloading",
      progress: 0,
      message: subtitleRecognitionText("status.downloading", {
        percent: "0%"
      })
    };
    renderSubtitleRecognitionSettings();
    const _0x4e8d08 = await enqueueElectronMediaTask({
      kind: "audioVoiceModelPrepare",
      args: {
        engine: normalizeSubtitleRecognitionEngine(subtitleRecognitionSettings.engine),
        downloadModelIfMissing: true
      }
    });
    const _0x33de75 = normalizeText(_0x4e8d08?.taskId);
    if (!_0x33de75) {
      throw new Error(subtitleRecognitionText("runtime.noTaskId"));
    }
    installSubtitleRecognitionTaskUpdateListener(_0x33de75);
    await waitForElectronMediaTask(_0x33de75, {
      timeout: AUDIO_VOICE_MODEL_PREPARE_TIMEOUT_MS,
      diagnosticPayload: {
        kind: "audioVoiceModelPrepare"
      }
    });
    clearSubtitleRecognitionTaskUpdateListener();
    subtitleRecognitionPrepareState = {
      status: "idle",
      progress: 1,
      message: ""
    };
    await saveSubtitleRecognitionSettings({
      engine: normalizeSubtitleRecognitionEngine(subtitleRecognitionSettings.engine),
      modelStatus: "ready",
      modelPreparedAt: Date.now()
    });
    showSuccess(subtitleRecognitionText("readyToast"));
  } catch (_0x597ca6) {
    clearSubtitleRecognitionTaskUpdateListener();
    const _0x38e7cb = normalizeSubtitleRecognitionEngine(subtitleRecognitionSettings.engine) === "gpu" && isGpuRuntimeUnavailableError(_0x597ca6);
    subtitleRecognitionPrepareState = {
      status: _0x38e7cb ? "gpuRequired" : "error",
      progress: 0,
      code: _0x38e7cb ? "gpu_unavailable" : "",
      message: _0x38e7cb ? subtitleRecognitionText("runtime.gpuUnavailable") : errorMessage(_0x597ca6)
    };
    renderSubtitleRecognitionSettings();
    showError(_0x38e7cb ? subtitleRecognitionText("gpuUnavailableToast") : subtitleRecognitionText("prepareFailed", {
      error: errorMessage(_0x597ca6)
    }));
  }
}
function applyPathsToInputs(_0xff456) {
  const _0x4e3f3b = normalizeFileSavePaths(_0xff456);
  const _0x3714ac = getRootInput();
  if (_0x3714ac) {
    _0x3714ac.value = inferManagedRoot(_0x4e3f3b);
  }
  for (const _0x45f46b of Object.keys(FIELD_IDS)) {
    const _0x2fd8ca = getInput(_0x45f46b);
    if (_0x2fd8ca) {
      _0x2fd8ca.value = normalizeText(_0x4e3f3b?.[_0x45f46b]);
    }
  }
}
function setInputsDisabled(_0x305abb) {
  const _0x521e59 = getRootInput();
  const _0x3e8339 = getRootPickButton();
  if (_0x521e59) {
    _0x521e59.disabled = !!_0x305abb;
  }
  if (_0x3e8339) {
    _0x3e8339.disabled = !!_0x305abb;
  }
  for (const _0x16652d of Object.keys(FIELD_IDS)) {
    const _0x13da7b = getInput(_0x16652d);
    if (_0x13da7b) {
      _0x13da7b.disabled = !!_0x305abb;
    }
  }
}
function readPathsFromInputs() {
  const _0x555590 = normalizeText(getRootInput()?.value);
  if (_0x555590) {
    return buildManagedPaths(_0x555590);
  }
  return {
    canvasDir: normalizeText(getInput("canvasDir")?.value),
    dataDir: normalizeText(getInput("dataDir")?.value),
    outputDir: normalizeText(getInput("outputDir")?.value)
  };
}
function validateRequired(_0x33bd5) {
  if (!normalizeText(getRootInput()?.value) && !_0x33bd5.canvasDir && !_0x33bd5.dataDir && !_0x33bd5.outputDir) {
    return fileSaveText("validation.chooseRoot");
  }
  if (!_0x33bd5.canvasDir) {
    return fileSaveText("validation.projectPath");
  }
  if (!_0x33bd5.dataDir) {
    return fileSaveText("validation.dataPath");
  }
  if (!_0x33bd5.outputDir) {
    return fileSaveText("validation.outputPath");
  }
  return "";
}
function setSaving(_0x400259, _0x351a98) {
  if (!_0x400259) {
    return;
  }
  _0x400259.disabled = !!_0x351a98;
  _0x400259.textContent = _0x351a98 ? fileSaveText("runtime.saving") : fileSaveText("save");
}
function getDirectoryPicker() {
  if (desktopBridge.dialog.isAvailable()) {
    return _0x2c1678 => desktopBridge.dialog.selectDirectory(_0x2c1678);
  } else {
    return null;
  }
}
function readSelectedDirectory(_0x464822) {
  if (!_0x464822 || _0x464822.canceled) {
    return "";
  }
  if (_0x464822.success === false) {
    return "";
  }
  return normalizeText(_0x464822.path || _0x464822.filePath || _0x464822.filePaths?.[0]);
}
function getPickButtonLabel(_0x2f6034) {
  return normalizeText(_0x2f6034?.querySelector?.("span")?.textContent || _0x2f6034?.textContent || fileSaveText("runtime.choose"));
}
function setPickButtonLabel(_0x151859, _0x687337) {
  const _0x2d3fe4 = _0x151859?.querySelector?.("span");
  if (_0x2d3fe4) {
    _0x2d3fe4.textContent = _0x687337;
  } else if (_0x151859) {
    _0x151859.textContent = _0x687337;
  }
}
function syncDerivedInputsFromRoot() {
  const _0x54f6c9 = normalizeText(getRootInput()?.value);
  if (!_0x54f6c9) {
    return;
  }
  applyPathsToInputs(buildManagedPaths(_0x54f6c9));
}
async function pickRootDirectory() {
  const _0x4bd10c = getRootInput();
  const _0x3eede3 = getDirectoryPicker();
  if (!_0x4bd10c || typeof _0x3eede3 !== "function") {
    showError(fileSaveText("runtime.pickerUnsupported"));
    return;
  }
  const _0xa87bfa = getRootPickButton();
  const _0x329d86 = getPickButtonLabel(_0xa87bfa);
  if (_0xa87bfa) {
    _0xa87bfa.disabled = true;
    setPickButtonLabel(_0xa87bfa, fileSaveText("runtime.choosing"));
  }
  try {
    const _0x5d83ad = await _0x3eede3({
      title: fileSaveText("runtime.pickTitle"),
      defaultPath: normalizeText(_0x4bd10c.value)
    });
    const _0x5ca350 = readSelectedDirectory(_0x5d83ad);
    if (_0x5ca350) {
      _0x4bd10c.value = _0x5ca350;
      syncDerivedInputsFromRoot();
      _0x4bd10c.focus?.();
    }
  } catch (_0xa6b509) {
    console.error("[Settings] 选择保存目录失败:", _0xa6b509);
    showError(fileSaveText("runtime.pickFailed", {
      error: errorMessage(_0xa6b509)
    }));
  } finally {
    if (_0xa87bfa) {
      _0xa87bfa.disabled = false;
      setPickButtonLabel(_0xa87bfa, _0x329d86);
    }
  }
}
function bindDirectoryPickers() {
  const _0x573391 = getRootInput();
  if (_0x573391 && !_0x573391.__fileSaveRootInputBound) {
    _0x573391.__fileSaveRootInputBound = true;
    _0x573391.addEventListener("input", syncDerivedInputsFromRoot);
  }
  const _0x2589f2 = getRootPickButton();
  if (_0x2589f2 && !_0x2589f2.__fileSaveDirectoryPickerBound) {
    _0x2589f2.__fileSaveDirectoryPickerBound = true;
    _0x2589f2.addEventListener("click", () => {
      pickRootDirectory();
    });
  }
}
function bindSubtitleRecognitionSettings() {
  const _0x42da47 = getSubtitleRecognitionElements();
  if (_0x42da47.group && !_0x42da47.group.__subtitleRecognitionEngineBound) {
    _0x42da47.group.__subtitleRecognitionEngineBound = true;
    _0x42da47.group.querySelectorAll?.("[data-subtitle-recognition-engine]")?.forEach(_0x2e649c => {
      _0x2e649c.addEventListener("click", async () => {
        const _0x4a3be1 = normalizeSubtitleRecognitionEngine(_0x2e649c.dataset?.subtitleRecognitionEngine);
        subtitleRecognitionSettings = normalizeSubtitleRecognitionSettings({
          ...subtitleRecognitionSettings,
          engine: _0x4a3be1
        });
        subtitleRecognitionPrepareState = {
          status: "idle",
          progress: 0,
          message: ""
        };
        renderSubtitleRecognitionSettings();
        try {
          await saveSubtitleRecognitionSettings({
            engine: _0x4a3be1
          });
          await checkSubtitleRecognitionRuntime(_0x4a3be1);
        } catch (_0x178718) {
          console.error("[Settings] save subtitle recognition engine failed:", _0x178718);
          showError(subtitleRecognitionText("saveFailed", {
            error: errorMessage(_0x178718)
          }));
        }
      });
    });
  }
  if (_0x42da47.modelButton && !_0x42da47.modelButton.__subtitleRecognitionPrepareBound) {
    _0x42da47.modelButton.__subtitleRecognitionPrepareBound = true;
    _0x42da47.modelButton.addEventListener("click", () => {
      if (shouldInstallSubtitleRecognitionGpuRuntime()) {
        return installSubtitleRecognitionGpuRuntime();
      }
      return prepareSubtitleRecognitionModel();
    });
  }
}
function sleep(_0x27e822) {
  return new Promise(_0x424f8b => setTimeout(_0x424f8b, _0x27e822));
}
function getMigrationElements() {
  return {
    card: document.getElementById("fileSaveMigrationCard"),
    stage: document.getElementById("fileSaveMigrationStage"),
    percent: document.getElementById("fileSaveMigrationPercent"),
    bar: document.getElementById("fileSaveMigrationBar"),
    processed: document.getElementById("fileSaveMigrationProcessed"),
    copied: document.getElementById("fileSaveMigrationCopied"),
    skipped: document.getElementById("fileSaveMigrationSkipped"),
    failed: document.getElementById("fileSaveMigrationFailed"),
    current: document.getElementById("fileSaveMigrationCurrent"),
    errors: document.getElementById("fileSaveMigrationErrors")
  };
}
function clampPercent(_0x579b1e) {
  const _0x342612 = Number(_0x579b1e);
  if (!Number.isFinite(_0x342612)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(_0x342612)));
}
function renderMigrationErrors(_0x2a032a, _0x35d9e3) {
  if (!_0x2a032a) {
    return;
  }
  const _0x232940 = Array.isArray(_0x35d9e3) ? _0x35d9e3 : [];
  _0x2a032a.replaceChildren();
  _0x2a032a.hidden = _0x232940.length === 0;
  for (const _0xee80a9 of _0x232940.slice(0, 20)) {
    const _0x1e7f35 = document.createElement("div");
    _0x1e7f35.className = "settings-file-migration-error";
    const _0x20af33 = normalizeText(_0xee80a9?.path || _0xee80a9?.localPath || "");
    const _0x4019a1 = normalizeText(_0xee80a9?.error || fileSaveText("migration.itemFailed"));
    _0x1e7f35.textContent = _0x20af33 ? _0x20af33 + " · " + _0x4019a1 : _0x4019a1;
    _0x2a032a.appendChild(_0x1e7f35);
  }
}
function renderMigrationStatus(_0xdc7bbe) {
  const _0x11ea33 = getMigrationElements();
  if (!_0x11ea33.card) {
    return;
  }
  _0x11ea33.card.hidden = false;
  const _0x17fbfd = clampPercent(_0xdc7bbe?.progress);
  if (_0x11ea33.percent) {
    _0x11ea33.percent.textContent = _0x17fbfd + "%";
  }
  if (_0x11ea33.bar) {
    _0x11ea33.bar.style.width = _0x17fbfd + "%";
  }
  if (_0x11ea33.stage) {
    _0x11ea33.stage.textContent = translateMigrationStage(_0xdc7bbe?.stage) || fileSaveText("migration.migrating");
  }
  const _0x11d121 = Number(_0xdc7bbe?.processedFiles || 0);
  const _0x4e598c = Number(_0xdc7bbe?.totalFiles || 0);
  if (_0x11ea33.processed) {
    _0x11ea33.processed.textContent = _0x11d121 + " / " + (_0x4e598c || _0x11d121);
  }
  if (_0x11ea33.copied) {
    _0x11ea33.copied.textContent = String(Number(_0xdc7bbe?.copiedCount || 0));
  }
  if (_0x11ea33.skipped) {
    _0x11ea33.skipped.textContent = String(Number(_0xdc7bbe?.skippedCount || 0));
  }
  if (_0x11ea33.failed) {
    _0x11ea33.failed.textContent = String(Number(_0xdc7bbe?.failedCount || 0));
  }
  const _0x543712 = normalizeText(_0xdc7bbe?.currentFile);
  if (_0x11ea33.current) {
    _0x11ea33.current.textContent = _0x543712 ? fileSaveText("migration.current", {
      file: _0x543712
    }) : "";
    _0x11ea33.current.title = _0x543712;
  }
  renderMigrationErrors(_0x11ea33.errors, _0xdc7bbe?.errors);
}
function resetMigrationStatus() {
  const _0x3d0a49 = getMigrationElements();
  if (_0x3d0a49.card) {
    _0x3d0a49.card.hidden = true;
  }
  if (_0x3d0a49.stage) {
    _0x3d0a49.stage.textContent = fileSaveText("migration.preparing");
  }
  if (_0x3d0a49.percent) {
    _0x3d0a49.percent.textContent = "0%";
  }
  if (_0x3d0a49.bar) {
    _0x3d0a49.bar.style.width = "0%";
  }
  if (_0x3d0a49.processed) {
    _0x3d0a49.processed.textContent = "0 / 0";
  }
  if (_0x3d0a49.copied) {
    _0x3d0a49.copied.textContent = "0";
  }
  if (_0x3d0a49.skipped) {
    _0x3d0a49.skipped.textContent = "0";
  }
  if (_0x3d0a49.failed) {
    _0x3d0a49.failed.textContent = "0";
  }
  if (_0x3d0a49.current) {
    _0x3d0a49.current.textContent = "";
    _0x3d0a49.current.title = "";
  }
  renderMigrationErrors(_0x3d0a49.errors, []);
}
function isMigrationFinished(_0x229438) {
  const _0xad7f9d = normalizeText(_0x229438?.status);
  return _0xad7f9d === "done" || _0xad7f9d === "error";
}
async function pollMigrationUntilFinished(_0x44186d) {
  let _0x51086f = null;
  while (true) {
    await sleep(MIGRATION_POLL_INTERVAL_MS);
    _0x51086f = await fetchFileSavePathMigrationStatus(_0x44186d);
    renderMigrationStatus(_0x51086f);
    if (isMigrationFinished(_0x51086f)) {
      return _0x51086f;
    }
  }
}
function buildMigrationSummary(_0x2a451b) {
  const _0x1b6dea = Number(_0x2a451b?.copiedCount || 0);
  const _0x55055a = Number(_0x2a451b?.skippedCount || 0);
  const _0x2fc50f = Number(_0x2a451b?.failedCount || 0);
  return fileSaveText("migration.summary", {
    copied: _0x1b6dea,
    skipped: _0x55055a,
    failed: _0x2fc50f
  });
}
async function saveSettingsWithMigration(_0x2c7068) {
  try {
    renderMigrationStatus({
      status: "pending",
      stage: fileSaveText("migration.creatingTask"),
      progress: 0
    });
    const _0x755fb1 = await startFileSavePathMigration(_0x2c7068);
    renderMigrationStatus(_0x755fb1);
    const _0x5a3c66 = normalizeText(_0x755fb1?.jobId);
    if (!_0x5a3c66) {
      throw new Error(fileSaveText("migration.noJobId"));
    }
    const _0x5c1be7 = await pollMigrationUntilFinished(_0x5a3c66);
    if (normalizeText(_0x5c1be7?.status) !== "done") {
      throw new Error(_0x5c1be7?.error || fileSaveText("migration.failedMessage"));
    }
    return _0x5c1be7;
  } catch (_0x44901e) {
    if (Number(_0x44901e?.status || _0x44901e?.statusCode || 0) === 404) {
      const _0x4c39b1 = await saveUserSettingsToServer(_0x2c7068);
      const _0x17965b = {
        status: "done",
        progress: 100,
        copiedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        settings: _0x4c39b1?.settings
      };
      renderMigrationStatus(_0x17965b);
      return _0x17965b;
    }
    throw _0x44901e;
  }
}
export function initFileSaveSettings() {
  const _0x11c1b4 = document.getElementById("btnFileSavePathsSave");
  if (!_0x11c1b4) {
    return;
  }
  bindDirectoryPickers();
  bindSubtitleRecognitionSettings();
  fetchUserSettingsFromServer().then(_0x69e644 => {
    currentFileSaveUserSettings = _0x69e644 || {};
    applyPathsToInputs(_0x69e644?.fileSavePaths || {});
    subtitleRecognitionSettings = normalizeSubtitleRecognitionSettings({
      ...(_0x69e644?.subtitleRecognition || {}),
      modelStatus: modelStatusForCurrentRoot(_0x69e644?.subtitleRecognition || {}, getCurrentRootKey(_0x69e644))
    });
    subtitleRecognitionPrepareState = {
      status: "idle",
      progress: 0,
      message: ""
    };
    renderSubtitleRecognitionSettings();
    const _0x4c57bb = modelStatusForCurrentRoot(subtitleRecognitionSettings, getCurrentRootKey(_0x69e644), subtitleRecognitionSettings.engine) === "ready";
    if (_0x4c57bb && desktopBridge.mediaTask.isAvailable()) {
      checkSubtitleRecognitionRuntime(subtitleRecognitionSettings.engine, {
        showFailureToast: false
      });
    }
  }).catch(_0x45065d => {
    console.error("[Settings] 加载文件与保存路径失败:", _0x45065d);
    showError(fileSaveText("runtime.loadFailed"));
  });
  resetMigrationStatus();
  _0x11c1b4.addEventListener("click", async () => {
    const _0x4d1057 = readPathsFromInputs();
    const _0x4fb4d7 = validateRequired(_0x4d1057);
    if (_0x4fb4d7) {
      showError(_0x4fb4d7);
      return;
    }
    setSaving(_0x11c1b4, true);
    setInputsDisabled(true);
    resetMigrationStatus();
    try {
      const _0x21c58d = await fetchUserSettingsFromServer().catch(() => ({}));
      currentFileSaveUserSettings = _0x21c58d || {};
      const _0xa7a181 = pathKey(getSettingsRootDir(_0x21c58d));
      const _0x19a219 = pathKey(normalizeText(getRootInput()?.value));
      const _0x218d2f = _0x19a219 && _0x19a219 !== _0xa7a181;
      const _0x1b3bd4 = await saveSettingsWithMigration({
        ...(_0x21c58d || {}),
        fileSavePaths: _0x4d1057,
        fileSavePathsMeta: {
          ...(_0x21c58d?.fileSavePathsMeta || {}),
          source: "user",
          mode: normalizeText(getRootInput()?.value) ? "root" : "custom",
          rootDir: normalizeText(getRootInput()?.value),
          updatedAt: Date.now()
        },
        ...(_0x218d2f ? {
          subtitleRecognition: normalizeSubtitleRecognitionSettings({
            ...(_0x21c58d?.subtitleRecognition || {}),
            modelStatus: "notDownloaded",
            modelStatusByEngine: {},
            modelRootKey: ""
          })
        } : {})
      });
      const _0x341896 = _0x1b3bd4?.settings || (await fetchUserSettingsFromServer());
      currentFileSaveUserSettings = _0x341896 || {};
      applyPathsToInputs(_0x341896?.fileSavePaths || _0x4d1057);
      subtitleRecognitionSettings = normalizeSubtitleRecognitionSettings({
        ...(_0x341896?.subtitleRecognition || subtitleRecognitionSettings),
        modelStatus: modelStatusForCurrentRoot(_0x341896?.subtitleRecognition || subtitleRecognitionSettings, getCurrentRootKey(_0x341896))
      });
      subtitleRecognitionPrepareState = {
        status: "idle",
        progress: 0,
        message: ""
      };
      renderSubtitleRecognitionSettings();
      if (Number(_0x1b3bd4?.failedCount || 0) > 0) {
        showError(fileSaveText("runtime.partialMigrationFailed", {
          summary: buildMigrationSummary(_0x1b3bd4)
        }));
      } else {
        showSuccess(buildMigrationSummary(_0x1b3bd4));
      }
    } catch (_0x44d43d) {
      console.error("[Settings] 保存文件与保存路径失败:", _0x44d43d);
      showError(fileSaveText("runtime.saveFailed", {
        error: errorMessage(_0x44d43d)
      }));
    } finally {
      setSaving(_0x11c1b4, false);
      setInputsDisabled(false);
    }
  });
}