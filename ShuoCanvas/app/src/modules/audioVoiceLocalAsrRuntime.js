import { enqueueElectronMediaTask, waitForElectronMediaTask } from "../../api/localMediaTaskApi.js";
import { fetchUserSettingsFromServer } from "../../api/userSettingsApi.js";
import { desktopBridge } from "../services/desktopBridge.js";
export const AUDIO_VOICE_ASR_RUNTIME_INSTALL_TIMEOUT_MS = 5400000;
function normalizeEngine(_0x5340c0) {
  if (String(_0x5340c0 || "").trim().toLowerCase() === "gpu") {
    return "gpu";
  } else {
    return "cpu";
  }
}
function clampProgress(_0x3257fe) {
  const _0x32cce8 = Number(_0x3257fe);
  if (Number.isFinite(_0x32cce8)) {
    return Math.max(0, Math.min(1, _0x32cce8));
  } else {
    return 0;
  }
}
export function createAudioVoiceTaskProgressTracker({
  getMediaTask = () => desktopBridge.mediaTask,
  onProgress = () => {}
} = {}) {
  let _0x4afdc1 = "";
  let _0x540909 = null;
  const _0x36ed58 = () => {
    _0x540909?.();
    _0x540909 = null;
    _0x4afdc1 = "";
  };
  return {
    clear: _0x36ed58,
    install(_0x54184f, {
      progressOffset = 0,
      progressScale = 1
    } = {}) {
      _0x36ed58();
      const _0x56aee1 = String(_0x54184f || "").trim();
      const _0x2d64ff = getMediaTask()?.onUpdate;
      if (!_0x56aee1 || typeof _0x2d64ff !== "function") {
        return;
      }
      _0x4afdc1 = _0x56aee1;
      _0x540909 = _0x2d64ff(_0x4d2803 => {
        if (String(_0x4d2803?.taskId || "") !== _0x4afdc1) {
          return;
        }
        onProgress({
          stage: _0x4d2803?.stage,
          progress: clampProgress(progressOffset) + clampProgress(_0x4d2803?.progress) * clampProgress(progressScale),
          message: _0x4d2803?.message
        });
      });
    }
  };
}
export async function ensureAudioVoiceLocalAsrRuntime({
  engine = "cpu",
  enqueueTask = enqueueElectronMediaTask,
  nodeId = "",
  onTaskStarted = () => {},
  timeout = AUDIO_VOICE_ASR_RUNTIME_INSTALL_TIMEOUT_MS,
  waitForTask = waitForElectronMediaTask
} = {}) {
  const _0x27eb7a = normalizeEngine(engine);
  const _0x11e9db = await enqueueTask({
    kind: "asrRuntimeInstall",
    nodeId: nodeId,
    args: {
      engine: _0x27eb7a
    }
  });
  const _0x30e6fd = String(_0x11e9db?.taskId || "").trim();
  if (!_0x30e6fd) {
    throw new Error("Subtitle recognition runtime task did not return a task ID");
  }
  onTaskStarted(_0x30e6fd);
  return await waitForTask(_0x30e6fd, {
    timeout: timeout,
    diagnosticPayload: {
      kind: "asrRuntimeInstall",
      nodeId: nodeId
    }
  });
}
export async function prepareAudioVoiceLocalAsr({
  ensureRuntime = ensureAudioVoiceLocalAsrRuntime,
  fetchSettings = fetchUserSettingsFromServer,
  nodeId = "",
  onTaskStarted = () => {}
} = {}) {
  const _0x4052ef = await fetchSettings().catch(() => ({}));
  const _0x52e86a = normalizeEngine(_0x4052ef?.subtitleRecognition?.engine);
  await ensureRuntime({
    engine: _0x52e86a,
    nodeId: nodeId,
    onTaskStarted: onTaskStarted
  });
  return {
    diarizationProvider: "sortformer",
    downloadModelIfMissing: true,
    engine: _0x52e86a
  };
}