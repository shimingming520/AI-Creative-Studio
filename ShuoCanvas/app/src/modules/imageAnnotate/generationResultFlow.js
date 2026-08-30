import a986_0x4da5bf from "../../core/stores/appStore.js";
import { generateId } from "../../core/math.js";
import { getModelDisplayName, getModelProvider } from "../../config/modelConfig.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../../services/fileService.js";
import { OUTPUT_RATIO_SWITCH_THRESHOLD, calcDisplaySizeByMedia, resolveInputRatioBasis, resolveOutputMediaSize, shouldSwitchToOutputRatio } from "../../services/mediaRatioService.js";
import { calcSafeSpawnPosNearNode } from "../nodeSpawn.js";
import { generateImage } from "../../../api/aiImageApi.js";
import { buildAsyncTaskPatch, buildDreaminaTaskPatch, buildRunningHubTaskPatch, isDreaminaTaskModel, isRunningHubModelApiTaskModel, isRunningHubTaskModel, persistRunningHubResumeCache } from "./taskPatch.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { buildGenerationStartPatch } from "../../core/generationTaskLifecycle.js";
import { isTaskCancelled } from "../../core/generationTaskUiState.js";
const SCENE_CONFIG = {
  erase: {
    idPrefix: "source-image-erase",
    pendingName: "擦除生成中...",
    resultName: "擦除结果",
    failureName: "擦除生成失败",
    successToast: "擦除生成成功"
  },
  repaint: {
    idPrefix: "source-image-repaint",
    pendingName: "重绘生成中...",
    resultName: "重绘结果",
    failureName: "重绘生成失败",
    successToast: "重绘生成成功"
  }
};
export const resolveGenerationRuntime = ({
  model: _0xfeb3ad,
  provider: _0x23b5b5
} = {}) => {
  const _0x23d059 = String(_0xfeb3ad || "").trim();
  const _0x2e537e = String(_0x23b5b5 || getModelProvider(_0x23d059) || "").trim();
  const _0x91de0d = isRunningHubTaskModel(_0x23d059, _0x2e537e);
  const _0x536e19 = isDreaminaTaskModel(_0x23d059, _0x2e537e);
  return {
    model: _0x23d059,
    provider: _0x2e537e,
    isRunningHubTask: _0x91de0d,
    isDreaminaTask: _0x536e19,
    isAsyncTask: !_0x91de0d && !_0x536e19,
    asyncProvider: _0x2e537e.toLowerCase(),
    useOpenapiByModel: isRunningHubModelApiTaskModel(_0x23d059, _0x2e537e)
  };
};
export const buildGenerationOutputText = ({
  model: _0x53241e,
  prompt: _0xcb0356,
  errorMessage = ""
} = {}) => {
  const _0x5377be = ["模型: " + getModelDisplayName(_0x53241e), "提示词: " + String(_0xcb0356 || "").trim()];
  if (errorMessage) {
    _0x5377be.push("错误: " + (String(errorMessage || "").trim() || "未知错误"));
  }
  return _0x5377be.join("\n");
};
const persistGenerationRuntimeIfNeeded = _0xdd1165 => {
  if (_0xdd1165?.isRunningHubTask || _0xdd1165?.isDreaminaTask || _0xdd1165?.isAsyncTask) {
    persistRunningHubResumeCache();
  }
};
export const buildGenerationRuntimePatch = ({
  phase: _0x3797f7,
  runtime: _0x49eca8,
  latestNode: _0x49189a,
  startTime: _0x4cc47a,
  taskId = "",
  taskProvider = "",
  useOpenapiQuery = false,
  errorMessage = ""
} = {}) => {
  const _0x4a120b = String(taskId || _0x49189a?.rhTaskId || _0x49189a?.dreaminaSubmitId || _0x49189a?.asyncTaskId || "").trim();
  if (_0x49eca8?.isRunningHubTask) {
    return buildRunningHubTaskPatch({
      taskId: _0x4a120b,
      status: _0x3797f7,
      startedAt: _0x4cc47a,
      recovering: false,
      useOpenapiQuery: _0x3797f7 === "pending" ? _0x49eca8.useOpenapiByModel : _0x3797f7 === "running" ? useOpenapiQuery === true || _0x49189a?.rhTaskUseOpenapiQuery === true || _0x49eca8.useOpenapiByModel : _0x49189a?.rhTaskUseOpenapiQuery === true || _0x49eca8.useOpenapiByModel
    });
  }
  if (_0x49eca8?.isDreaminaTask) {
    return buildDreaminaTaskPatch({
      submitId: _0x4a120b,
      status: _0x3797f7 === "running" ? "pending" : _0x3797f7,
      phase: _0x3797f7 === "success" ? "done" : _0x3797f7 === "failed" ? "failed" : "generating",
      label: _0x3797f7 === "success" ? "已完成" : _0x3797f7 === "failed" ? errorMessage || "生成失败" : _0x3797f7 === "running" ? "生成中" : "提交中",
      startedAt: _0x4cc47a,
      recovering: false
    });
  }
  if (_0x49eca8?.isAsyncTask) {
    return buildAsyncTaskPatch({
      provider: String(taskProvider || _0x49189a?.asyncTaskProvider || _0x49eca8.asyncProvider || "").trim(),
      kind: "image",
      taskId: _0x4a120b,
      status: _0x3797f7,
      startedAt: _0x4cc47a,
      recovering: false
    });
  }
  return {};
};
const updateGenerationRuntimeNode = ({
  nodeId: _0x2e5a42,
  runtime: _0x41a303,
  startTime: _0xdd2d5f,
  phase: _0x269003,
  taskId = "",
  taskProvider = "",
  useOpenapiQuery = false,
  errorMessage = ""
} = {}) => {
  const _0x3e987c = String(taskId || "").trim();
  if (!_0x3e987c && _0x269003 === "running") {
    return;
  }
  const _0x20dd48 = a986_0x4da5bf.getState().nodes?.[_0x2e5a42];
  if (!_0x20dd48) {
    return;
  }
  if (isTaskCancelled(_0x20dd48)) {
    return;
  }
  a986_0x4da5bf.updateNodeData(_0x2e5a42, {
    ...buildGenerationRuntimePatch({
      phase: _0x269003,
      runtime: _0x41a303,
      latestNode: _0x20dd48,
      startTime: _0xdd2d5f,
      taskId: _0x3e987c || _0x20dd48?.rhTaskId || _0x20dd48?.dreaminaSubmitId || _0x20dd48?.asyncTaskId || "",
      taskProvider: taskProvider,
      useOpenapiQuery: useOpenapiQuery,
      errorMessage: errorMessage
    })
  });
  persistGenerationRuntimeIfNeeded(_0x41a303);
};
export const runGenerationResultFlow = async ({
  scene: _0xea329,
  built: _0x2e111,
  sourceNode: _0x343be2,
  fallbackModel: _0x1741f9,
  fallbackProvider: _0xd6b3ff,
  exitController: _0x1d6d71,
  notify = (_0x203511, _0x343067) => window.showToast?.(_0x203511, _0x343067)
} = {}) => {
  if (!_0x2e111?.payload) {
    return;
  }
  const _0x4cedbe = SCENE_CONFIG[_0xea329];
  if (!_0x4cedbe) {
    throw new Error("未知生成场景: " + _0xea329);
  }
  const _0x2fdd77 = resolveGenerationRuntime({
    model: _0x2e111?.payload?.model || _0x1741f9,
    provider: _0x2e111?.payload?.provider || _0xd6b3ff
  });
  const _0x3a16c0 = String(_0x2e111?.payload?.prompt || "").trim();
  const _0x495d98 = Date.now();
  const _0x1e74cb = _0x2e111.inputUrl;
  let _0x48c8d7 = null;
  const _0x2ad1b2 = () => {
    if (!_0x48c8d7) {
      return false;
    }
    return isTaskCancelled(a986_0x4da5bf.getState().nodes?.[_0x48c8d7]);
  };
  try {
    const _0x2d35b3 = Number(_0x2e111?.naturalWidth) || _0x343be2?.width || 1;
    const _0x5b76e6 = Number(_0x2e111?.naturalHeight) || _0x343be2?.height || 1;
    const {
      width: _0x4119a6,
      height: _0x623595
    } = getAutoMediaSizeByShortSide(_0x2d35b3, _0x5b76e6);
    const {
      x: _0xaa155a,
      y: _0x2184f1
    } = calcSafeSpawnPosNearNode(a986_0x4da5bf.getState().nodes, _0x343be2, _0x4119a6, _0x623595);
    _0x48c8d7 = generateId(_0x4cedbe.idPrefix);
    a986_0x4da5bf.addNode(buildSourceMediaNodePayload({
      id: _0x48c8d7,
      type: "source-image",
      x: _0xaa155a,
      y: _0x2184f1,
      width: _0x4119a6,
      height: _0x623595,
      needsAutoResize: false,
      name: _0x4cedbe.pendingName,
      src: "",
      ...buildGenerationStartPatch({
        startedAt: _0x495d98
      }),
      provider: _0x2fdd77.provider,
      model: _0x2fdd77.model,
      ...(_0x2fdd77.isRunningHubTask ? {
        rhSourceNodeId: _0x343be2?.id || "",
        rhToolbarTaskType: "image-" + _0xea329
      } : {}),
      ...buildGenerationRuntimePatch({
        phase: "pending",
        runtime: _0x2fdd77,
        startTime: _0x495d98
      }),
      outputText: buildGenerationOutputText({
        model: _0x2fdd77.model,
        prompt: _0x3a16c0
      })
    }));
    persistGenerationRuntimeIfNeeded(_0x2fdd77);
    a986_0x4da5bf.setSelectedNodes([_0x48c8d7]);
    _0x1d6d71?.({
      silent: true
    });
    const _0x1a435d = await generateImage(_0x2e111.payload, {
      onTaskMeta: ({
        taskId: _0x240ac5,
        useOpenapiQuery: _0x41bab9,
        provider: _0x33fe65
      }) => {
        updateGenerationRuntimeNode({
          nodeId: _0x48c8d7,
          runtime: _0x2fdd77,
          startTime: _0x495d98,
          phase: "running",
          taskId: _0x240ac5,
          taskProvider: _0x33fe65,
          useOpenapiQuery: _0x41bab9
        });
      },
      onTaskId: _0x3194a4 => {
        updateGenerationRuntimeNode({
          nodeId: _0x48c8d7,
          runtime: _0x2fdd77,
          startTime: _0x495d98,
          phase: "running",
          taskId: _0x3194a4
        });
      }
    });
    if (_0x2ad1b2()) {
      return;
    }
    if (_0x1a435d?.error) {
      throw new Error(_0x1a435d.error);
    }
    const _0x48d08b = a986_0x4da5bf.getState().nodes?.[_0x48c8d7];
    const _0x2fb73e = _0x48d08b?.generationStartTime ? Date.now() - _0x48d08b.generationStartTime : 0;
    const _0xec1607 = resolveInputRatioBasis({
      width: _0x2e111?.naturalWidth,
      height: _0x2e111?.naturalHeight
    }, {
      width: _0x343be2?.width,
      height: _0x343be2?.height
    });
    const _0x256b80 = await resolveOutputMediaSize({
      localPath: _0x1a435d.localPath,
      imageUrl: _0x1a435d.imageUrl,
      sourceUrl: _0x1a435d.sourceUrl,
      thumbUrl: _0x1a435d.thumbUrl,
      src: _0x1a435d.imageUrl || _0x1a435d.sourceUrl || _0x1a435d.thumbUrl || ""
    });
    const _0x629d36 = _0x256b80 && shouldSwitchToOutputRatio(_0xec1607.width, _0xec1607.height, _0x256b80.width, _0x256b80.height, OUTPUT_RATIO_SWITCH_THRESHOLD) ? calcDisplaySizeByMedia(_0x256b80.width, _0x256b80.height) : calcDisplaySizeByMedia(_0xec1607.width, _0xec1607.height);
    a986_0x4da5bf.updateNodeData(_0x48c8d7, {
      ...buildImageGenerationResultPatch(_0x1a435d, {
        startedAt: _0x495d98,
        duration: _0x2fb73e
      }),
      name: _0x4cedbe.resultName,
      width: _0x629d36.width,
      height: _0x629d36.height,
      ...buildGenerationRuntimePatch({
        phase: "success",
        runtime: _0x2fdd77,
        latestNode: _0x48d08b,
        startTime: _0x495d98
      }),
      outputText: buildGenerationOutputText({
        model: _0x2fdd77.model,
        prompt: _0x3a16c0
      })
    });
    persistGenerationRuntimeIfNeeded(_0x2fdd77);
    notify(_0x4cedbe.successToast, "success");
  } catch (_0x3feb17) {
    if (!_0x48c8d7) {
      throw _0x3feb17;
    }
    if (_0x2ad1b2()) {
      return;
    }
    const _0x183d95 = a986_0x4da5bf.getState().nodes?.[_0x48c8d7];
    const _0x3dc5c1 = _0x183d95?.generationStartTime ? Date.now() - _0x183d95.generationStartTime : 0;
    const _0x5e0ccb = _0x3feb17?.message || "未知错误";
    a986_0x4da5bf.updateNodeData(_0x48c8d7, {
      ...buildImageGenerationFailurePatch({
        error: _0x5e0ccb,
        startedAt: _0x495d98,
        duration: _0x3dc5c1
      }),
      name: _0x4cedbe.failureName,
      ...buildGenerationRuntimePatch({
        phase: "failed",
        runtime: _0x2fdd77,
        latestNode: _0x183d95,
        startTime: _0x495d98,
        errorMessage: _0x5e0ccb
      }),
      outputText: buildGenerationOutputText({
        model: _0x2fdd77.model,
        prompt: _0x3a16c0,
        errorMessage: _0x5e0ccb
      })
    });
    persistGenerationRuntimeIfNeeded(_0x2fdd77);
  } finally {
    if (_0x1e74cb) {
      URL.revokeObjectURL(_0x1e74cb);
    }
  }
};