import { PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID, PERSON_REPLACEMENT_DEFAULT_VIDEO_PROMPT, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE, resolvePersonReplacementVideoGenerationFps, resolvePersonReplacementVideoImageInput, resolvePersonReplacementVideoParameterPolicy, resolvePersonReplacementVideoResultRef } from "./personReplacementProject.js";
import { appendPersonReplacementVideoResults, buildPersonReplacementVideoSlotPayloadPatch, resolvePersonReplacementVideoSlotState } from "./personReplacementVideoInputs.js";
import { isPersonReplacementVideoGenerationActive, getRecoverablePersonReplacementVideoTask, resolvePersonReplacementVideoGenerationState, updatePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
import { hasPersonReplacementGenerationTaskIdentityChanged, projectPersonReplacementGenerationTaskIdentity } from "./personReplacementGenerationTaskIdentity.js";
import { PERSON_REPLACEMENT_OUTPUT_TRANSITIONS, transitionPersonReplacementOutput } from "./personReplacementOutputLineage.js";
import { getSuccessfulVideoGenerationItems, getVideoGenerationResultError } from "../../components/video-node/videoGenerationResultRenderer.js";
import { buildModelUiSchemaDefaultParams } from "../../components/aigenImage/uiSchemaRenderer.js";
import { resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { applyVideoAdaptiveAspectRatio } from "../videoAspectRatioExecution.js";
import { cancelRunningHubVideoTask, resumeAsyncVideoTask, resumeRunningHubVideoTask } from "../../../api/aiVideoApi.js";
import { resolveRunningHubWorkflowAccess } from "../../../api/configApi.js";
function normalizeText(_0x3a4c79) {
  return String(_0x3a4c79 ?? "").trim();
}
function cloneJson(_0x3a8a85) {
  if (_0x3a8a85 && typeof _0x3a8a85 === "object") {
    return JSON.parse(JSON.stringify(_0x3a8a85));
  } else {
    return _0x3a8a85;
  }
}
function createRequestId() {
  const _0xb8ed53 = globalThis.crypto?.randomUUID?.();
  return "replacement-video-request-" + (_0xb8ed53 || Date.now() + "-" + Math.round(Math.random() * 100000));
}
function normalizeStableRevisionValue(_0x349908) {
  if (Array.isArray(_0x349908)) {
    return _0x349908.map(normalizeStableRevisionValue);
  }
  if (_0x349908 && typeof _0x349908 === "object") {
    return Object.fromEntries(Object.entries(_0x349908).sort(([_0x4f9dc5], [_0xeaefaa]) => _0x4f9dc5.localeCompare(_0xeaefaa)).map(([_0x110150, _0x18ef92]) => [_0x110150, normalizeStableRevisionValue(_0x18ef92)]));
  }
  return _0x349908;
}
function normalizeSlotRevision(_0x51d055 = {}) {
  return normalizeStableRevisionValue(Object.fromEntries(Object.entries(_0x51d055 && typeof _0x51d055 === "object" ? _0x51d055 : {}).map(([_0x4c3201, _0x4bc24c]) => [_0x4c3201, {
    kind: normalizeText(_0x4bc24c?.kind),
    url: normalizeText(_0x4bc24c?.url),
    modelId: normalizeText(_0x4bc24c?.modelId)
  }])));
}
export function createPersonReplacementVideoGenerationRevision({
  project = {},
  shot = {},
  imageInput = resolvePersonReplacementVideoImageInput(project, shot)
} = {}) {
  return JSON.stringify({
    projectId: normalizeText(project?.id),
    shotId: normalizeText(shot?.id),
    videoRef: normalizeText(shot?.videoRef),
    videoPrompt: normalizeText(shot?.videoPrompt),
    imageMode: normalizeText(imageInput?.mode),
    imageRef: normalizeText(imageInput?.imageRef),
    referenceKind: normalizeText(imageInput?.referenceKind),
    outputFps: Number(shot?.outputFps) || 0,
    subjectCount: imageInput?.mode === PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE ? 1 : (Array.isArray(shot?.people) ? shot.people : []).filter(_0x55a3e3 => normalizeText(_0x55a3e3?.targetCharacterId)).length,
    slotEntries: normalizeSlotRevision(shot?.replacementVideoInputsBySlot)
  });
}
function resolveImageInputWarning(_0x2f7038 = {}) {
  if (_0x2f7038.status === "multiple") {
    return "人物参考图模式目前仅支持单个人物替换。";
  }
  if (_0x2f7038.mode === PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE) {
    return "请先在图像替换中为当前片段绑定一个人物参考图。";
  }
  return "请先生成对应的替换首帧。";
}
async function resumePersonReplacementVideoTask(_0x28d591, _0x17455e, _0x1d9ddb = {}) {
  const _0x4f9dbc = resolveModelExecution(_0x17455e?.model) || resolveModelExecution(_0x17455e?.model, {
    providerHint: _0x17455e?.provider
  });
  if (_0x4f9dbc?.executionManifest?.adapterType === "workflow") {
    return resumeRunningHubVideoTask(_0x28d591, _0x17455e, _0x1d9ddb);
  }
  return resumeAsyncVideoTask(_0x28d591, _0x17455e, _0x1d9ddb);
}
async function cancelPersonReplacementVideoTask({
  taskId: _0x41f719,
  providerProfileId = ""
} = {}) {
  const _0x53a831 = await resolveRunningHubWorkflowAccess(providerProfileId);
  if (!_0x53a831.apiKey) {
    throw new Error("未配置 RunningHub API Key，无法取消远端任务");
  }
  return cancelRunningHubVideoTask({
    apiKey: _0x53a831.apiKey,
    taskId: _0x41f719,
    providerProfileId: providerProfileId || _0x53a831.providerProfileId
  });
}
export function createPersonReplacementVideoTaskRuntime({
  getProject: _0x230920,
  getProjectById = null,
  setProject: _0x5bc250,
  setProjectById = null,
  runPreparation: _0x282a32,
  generateReplacementVideo: _0x2a0efd,
  resumeReplacementVideo = resumePersonReplacementVideoTask,
  cancelReplacementVideo = cancelPersonReplacementVideoTask,
  resolveInstallId = async () => "",
  persistNow = async () => {},
  showToast = () => {},
  notifyGenerationCompleted = () => {},
  now = () => new Date().toISOString(),
  createId = createRequestId
} = {}) {
  if (typeof _0x230920 !== "function" || typeof _0x5bc250 !== "function") {
    throw new Error("Person replacement video task runtime requires project access");
  }
  let _0x533da8 = false;
  let _0x50dc5c = null;
  let _0x15746c = "";
  const _0x8ac63 = [];
  const _0x157b54 = new Map();
  const _0x55ad9a = (_0x1d5c91 = "") => {
    const _0xa81aa4 = normalizeText(_0x1d5c91);
    if (_0xa81aa4 && typeof getProjectById === "function") {
      return getProjectById(_0xa81aa4);
    } else {
      return _0x230920();
    }
  };
  const _0x58ded9 = _0x1621c4 => typeof setProjectById === "function" ? setProjectById(_0x1621c4?.id, _0x1621c4, {
    renderWorkspace: false
  }) : _0x5bc250(_0x1621c4, {
    renderWorkspace: false
  });
  const _0x2e86e9 = ({
    projectId: _0x3176a4,
    shotId: _0x5400e0,
    requestId: _0x4fac31,
    revision: _0x31d7e1
  }, _0x4621b7 = {}, {
    persistIdentity = false
  } = {}) => {
    if (!_0x23e79d({
      projectId: _0x3176a4,
      shotId: _0x5400e0,
      requestId: _0x4fac31,
      revision: _0x31d7e1
    })) {
      return false;
    }
    const _0x549a42 = _0x55ad9a(_0x3176a4);
    const _0x434029 = _0x549a42.workspace?.videoGenerationsByShotId?.[_0x5400e0] || {};
    const _0x5a819b = {
      ..._0x434029,
      ..._0x4621b7,
      shotId: _0x5400e0,
      requestId: _0x4fac31
    };
    const _0x4b33c8 = Object.keys(_0x5a819b).some(_0x59e013 => !Object.is(_0x5a819b[_0x59e013], _0x434029[_0x59e013])) || Object.keys(_0x434029).some(_0x377bff => !Object.hasOwn(_0x5a819b, _0x377bff));
    if (!_0x4b33c8) {
      return true;
    }
    _0x58ded9({
      ..._0x549a42,
      shots: _0x549a42.shots.map(_0x4f2e2e => _0x4f2e2e.id === _0x5400e0 ? {
        ..._0x4f2e2e,
        generationStatus: _0x5a819b.status === "failed" ? "failed" : _0x5a819b.status === "succeeded" ? "succeeded" : "running",
        ...(_0x5a819b.status === "failed" ? {
          error: normalizeText(_0x5a819b.error)
        } : {})
      } : _0x4f2e2e),
      workspace: updatePersonReplacementVideoGenerationState(_0x549a42.workspace, _0x5a819b)
    });
    if (persistIdentity && normalizeText(_0x5a819b.taskId) && hasPersonReplacementGenerationTaskIdentityChanged(_0x434029, _0x5a819b)) {
      Promise.resolve(persistNow()).catch(() => {});
    }
    return true;
  };
  const _0x23e79d = ({
    projectId: _0x549e13,
    shotId: _0x104f96,
    requestId: _0x4adee7,
    revision: _0x1ea8a3
  }) => {
    if (_0x533da8) {
      return false;
    }
    const _0x386242 = _0x55ad9a(_0x549e13);
    if (normalizeText(_0x386242?.id) !== _0x549e13) {
      return false;
    }
    const _0x155bfb = _0x386242?.shots?.find(_0x2237ed => normalizeText(_0x2237ed?.id) === _0x104f96);
    if (!_0x155bfb) {
      return false;
    }
    const _0x4a3a96 = _0x386242.workspace?.videoGenerationsByShotId?.[_0x104f96];
    if (normalizeText(_0x4a3a96?.requestId) !== _0x4adee7) {
      return false;
    }
    return createPersonReplacementVideoGenerationRevision({
      project: _0x386242,
      shot: _0x155bfb
    }) === _0x1ea8a3;
  };
  const _0x55e70c = ({
    projectId: _0x2ea57a,
    shotId: _0x482aaf,
    requestId: _0x2faf38
  }) => {
    if (_0x533da8) {
      return false;
    }
    const _0xbf2d73 = _0x55ad9a(_0x2ea57a);
    if (normalizeText(_0xbf2d73?.id) !== _0x2ea57a) {
      return false;
    }
    const _0x411404 = _0xbf2d73.workspace?.videoGenerationsByShotId?.[_0x482aaf];
    if (normalizeText(_0x411404?.requestId) !== _0x2faf38 || !["queued", "submitting", "running"].includes(normalizeText(_0x411404?.status).toLowerCase())) {
      return false;
    }
    _0x58ded9({
      ..._0xbf2d73,
      shots: _0xbf2d73.shots.map(_0x181319 => _0x181319.id === _0x482aaf && _0x181319.generationStatus === "running" ? {
        ..._0x181319,
        generationStatus: "pending"
      } : _0x181319),
      workspace: updatePersonReplacementVideoGenerationState(_0xbf2d73.workspace, {
        status: "idle",
        shotId: _0x482aaf,
        error: ""
      })
    });
    return true;
  };
  const _0x28814f = (_0x3db5b7 = "") => ({
    ok: false,
    stale: true,
    failures: [],
    project: cloneJson(_0x55ad9a(_0x3db5b7))
  });
  const _0x4f22ef = () => {
    if (_0x50dc5c) {
      return _0x50dc5c;
    }
    _0x50dc5c = (async () => {
      while (_0x8ac63.length) {
        const _0x102855 = _0x8ac63.shift();
        _0x15746c = _0x102855.projectId;
        if (_0x533da8 || !_0x55ad9a(_0x102855.projectId)) {
          _0x102855.resolve(_0x28814f(_0x102855.projectId));
          _0x15746c = "";
          continue;
        }
        try {
          const _0x482d82 = typeof _0x282a32 === "function" ? await _0x282a32({
            projectId: _0x102855.projectId,
            shotIds: _0x102855.prepareAll ? null : [..._0x102855.shotIds],
            notify: _0x102855.notify,
            renderWorkspace: _0x102855.renderWorkspace
          }) : {
            ok: true,
            failures: [],
            project: cloneJson(_0x55ad9a(_0x102855.projectId))
          };
          _0x102855.resolve(_0x533da8 ? _0x28814f(_0x102855.projectId) : _0x482d82);
        } catch (_0x3a46ea) {
          _0x102855.reject(_0x3a46ea);
        } finally {
          if (_0x15746c === _0x102855.projectId) {
            _0x15746c = "";
          }
        }
      }
    })().finally(() => {
      _0x50dc5c = null;
    });
    return _0x50dc5c;
  };
  const _0x9be8f3 = (_0x53e102 = {}) => {
    if (_0x533da8) {
      return Promise.resolve(_0x28814f(_0x53e102?.projectId));
    }
    const _0x26632c = normalizeText(_0x53e102?.projectId || _0x230920()?.id);
    const _0x4d8e3d = Array.isArray(_0x53e102?.shotIds) ? _0x53e102.shotIds.map(normalizeText).filter(Boolean) : [];
    const _0x23691c = _0x8ac63.at(-1);
    if (_0x23691c && _0x23691c.projectId === _0x26632c) {
      if (!_0x4d8e3d.length) {
        _0x23691c.prepareAll = true;
      }
      _0x4d8e3d.forEach(_0x2ae9f3 => _0x23691c.shotIds.add(_0x2ae9f3));
      _0x23691c.notify = _0x23691c.notify || _0x53e102?.notify !== false;
      _0x23691c.renderWorkspace = _0x23691c.renderWorkspace || _0x53e102?.renderWorkspace !== false;
      const _0x57351f = new Promise((_0x5d51e0, _0xd75d91) => {
        _0x23691c.listeners.push({
          resolve: _0x5d51e0,
          reject: _0xd75d91
        });
      });
      _0x4f22ef();
      return _0x57351f;
    }
    let _0xa88df9;
    let _0x126ec5;
    const _0x44f02d = new Promise((_0x39af89, _0x49db24) => {
      _0xa88df9 = _0x39af89;
      _0x126ec5 = _0x49db24;
    });
    const _0x5f1b9a = {
      projectId: _0x26632c,
      prepareAll: !_0x4d8e3d.length,
      shotIds: new Set(_0x4d8e3d),
      notify: _0x53e102?.notify !== false,
      renderWorkspace: _0x53e102?.renderWorkspace !== false,
      listeners: [],
      resolve(_0x23515f) {
        _0xa88df9(_0x23515f);
        this.listeners.forEach(_0x386ac2 => _0x386ac2.resolve(_0x23515f));
      },
      reject(_0x5312fa) {
        _0x126ec5(_0x5312fa);
        this.listeners.forEach(_0x31ac3e => _0x31ac3e.reject(_0x5312fa));
      }
    };
    _0x8ac63.push(_0x5f1b9a);
    _0x4f22ef();
    return _0x44f02d;
  };
  const _0x1f4f6c = async ({
    projectId: _0x4d71c1 = "",
    shotId: _0x1f5ec6,
    notifyCompletion = true,
    recoveryTask = null
  } = {}) => {
    const _0x152f34 = normalizeText(_0x1f5ec6);
    let _0xdebe19 = _0x55ad9a(_0x4d71c1);
    let _0x1b8ea6 = _0xdebe19?.shots?.find(_0x5492e9 => normalizeText(_0x5492e9?.id) === _0x152f34);
    if (!_0x1b8ea6 || _0x533da8) {
      return null;
    }
    const _0x2d6560 = getRecoverablePersonReplacementVideoTask(_0xdebe19.workspace?.videoGenerationsByShotId?.[_0x152f34]);
    const _0x13a32e = recoveryTask ? {
      ..._0x2d6560,
      ...recoveryTask
    } : null;
    if (!_0x13a32e && _0x2d6560) {
      return null;
    }
    let _0x2cf3cc = resolvePersonReplacementVideoImageInput(_0xdebe19, _0x1b8ea6);
    if (_0x2cf3cc.status !== "ready") {
      showToast(resolveImageInputWarning(_0x2cf3cc), "warn");
      return null;
    }
    let _0x34f5a5 = resolvePersonReplacementVideoSlotState(_0xdebe19, _0x1b8ea6);
    if (!_0x34f5a5.slotEntries.sourceVideo?.url) {
      const _0x2f92c6 = await _0x9be8f3({
        projectId: _0xdebe19?.id,
        shotIds: [_0x152f34]
      });
      if (_0x2f92c6?.stale || _0x533da8) {
        return {
          ok: false,
          stale: true,
          shotId: _0x152f34
        };
      }
      _0xdebe19 = _0x55ad9a(_0xdebe19?.id);
      _0x1b8ea6 = _0xdebe19?.shots?.find(_0x20ad76 => normalizeText(_0x20ad76?.id) === _0x152f34);
      _0x34f5a5 = resolvePersonReplacementVideoSlotState(_0xdebe19, _0x1b8ea6);
    }
    if (!_0x34f5a5.slotEntries.sourceVideo?.url) {
      showToast(_0x1b8ea6?.error || "对应镜头尚未完成切片。", "warn");
      return null;
    }
    _0x2cf3cc = resolvePersonReplacementVideoImageInput(_0xdebe19, _0x1b8ea6);
    if (_0x2cf3cc.status !== "ready") {
      showToast(_0x2cf3cc.message || "当前图片入参不可用。", "warn");
      return null;
    }
    if (_0x13a32e ? typeof resumeReplacementVideo !== "function" : typeof _0x2a0efd !== "function") {
      showToast("视频生成服务尚未初始化。", "error");
      return null;
    }
    const _0x5641be = normalizeText(_0xdebe19?.id);
    const _0x5b8212 = _0x5641be + ":video:" + _0x152f34;
    if (_0x157b54.has(_0x5b8212)) {
      return null;
    }
    const _0x4daa18 = normalizeText(_0x13a32e?.requestId) || normalizeText(createId());
    const _0x3d198c = createPersonReplacementVideoGenerationRevision({
      project: _0xdebe19,
      shot: _0x1b8ea6,
      imageInput: _0x2cf3cc
    });
    const _0x245056 = normalizeText(_0x13a32e?.modelId) || _0xdebe19.settings.replacementModelId || PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID;
    const _0x54a6a3 = resolveModelExecution(_0x245056) || resolveModelExecution(_0x245056, {
      providerHint: _0x13a32e?.provider
    });
    const _0xe3b035 = normalizeText(_0x13a32e?.provider) || normalizeText(_0x54a6a3?.modelManifest?.provider) || resolveModelProvider(_0x245056);
    const _0x5d9d21 = normalizeText(_0x13a32e?.providerProfileId) || normalizeText(_0xdebe19.settings.replacementVideoProviderProfileId);
    const _0x463202 = normalizeText(_0x13a32e?.executionId) || normalizeText(_0x54a6a3?.executionManifest?.id);
    const _0x3e7f59 = Number(_0x13a32e?.startedAt) || Date.now();
    const _0x3693a4 = new AbortController();
    const _0x1147f3 = {
      projectId: _0x5641be,
      shotId: _0x152f34,
      requestId: _0x4daa18,
      revision: _0x3d198c,
      abortController: _0x3693a4,
      taskId: normalizeText(_0x13a32e?.taskId)
    };
    _0x157b54.set(_0x5b8212, _0x1147f3);
    _0x58ded9({
      ..._0xdebe19,
      workspace: updatePersonReplacementVideoGenerationState(_0xdebe19.workspace, {
        status: _0x13a32e ? "running" : "submitting",
        shotId: _0x152f34,
        requestId: _0x4daa18,
        taskId: normalizeText(_0x13a32e?.taskId),
        modelId: _0x245056,
        provider: _0xe3b035,
        providerProfileId: _0x5d9d21,
        executionId: _0x463202,
        startedAt: _0x3e7f59,
        useOpenapiQuery: _0x13a32e?.useOpenapiQuery === true,
        error: ""
      }),
      shots: _0xdebe19.shots.map(_0x4edc01 => _0x4edc01.id === _0x152f34 ? {
        ..._0x4edc01,
        generationStatus: "running"
      } : _0x4edc01)
    });
    try {
      const _0x389e1b = (Array.isArray(_0x1b8ea6.people) ? _0x1b8ea6.people : []).filter(_0xa7f6b3 => _0xa7f6b3.targetCharacterId).length;
      const _0x29a01c = _0x2cf3cc.mode === PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE;
      const _0x15e50e = resolvePersonReplacementVideoParameterPolicy({
        modelId: _0x245056,
        inputMode: _0x2cf3cc.mode,
        generationParams: _0xdebe19.settings.replacementVideoGenerationParams
      });
      const _0x3bc277 = {
        rhVideoResolution: 1024,
        rhVideoFrames: 0,
        rhScail2PersonCount: _0x29a01c ? 1 : Math.max(1, _0x389e1b),
        rhScailDetectPrompt: "person",
        ...buildModelUiSchemaDefaultParams(_0x245056),
        ..._0x15e50e.generationParams,
        rhVideoFps: resolvePersonReplacementVideoGenerationFps(_0xdebe19.settings),
        ...(_0x29a01c ? {
          rhScail2PersonCount: 1
        } : {})
      };
      const {
        payloadPatch: _0x1901ef
      } = buildPersonReplacementVideoSlotPayloadPatch({
        project: _0xdebe19,
        shot: _0x1b8ea6,
        generationParams: _0x3bc277
      });
      if (_0x1901ef.maskVideoUrl && _0x3bc277.rhSubtractSubject === true) {
        _0x3bc277.rhSubtractSubject = false;
        _0x1901ef.subtractSubject = false;
      }
      if (_0x1901ef.rhBerniniFunction) {
        _0x3bc277.rhBerniniFunction = _0x1901ef.rhBerniniFunction;
      }
      const _0x212731 = await resolveInstallId(_0x245056);
      if (!_0x23e79d({
        projectId: _0x5641be,
        shotId: _0x152f34,
        requestId: _0x4daa18,
        revision: _0x3d198c
      })) {
        _0x55e70c({
          projectId: _0x5641be,
          shotId: _0x152f34,
          requestId: _0x4daa18
        });
        return {
          ok: false,
          stale: true,
          shotId: _0x152f34
        };
      }
      const _0x4e5c96 = {
        model: _0x245056,
        provider: _0xe3b035,
        providerProfileId: _0x5d9d21,
        ...(_0x212731 ? {
          installId: _0x212731
        } : {}),
        prompt: normalizeText(_0x1b8ea6.videoPrompt) || (_0x54a6a3?.modelManifest?.prompt?.emptyPolicy === "allow" ? "" : PERSON_REPLACEMENT_DEFAULT_VIDEO_PROMPT),
        videoUrl: _0x1b8ea6.videoRef,
        inputUrls: [_0x2cf3cc.imageRef],
        ..._0x1901ef,
        generationParams: _0x3bc277
      };
      applyVideoAdaptiveAspectRatio(_0x4e5c96, {
        nodeData: {
          generationParams: _0x3bc277
        },
        modelManifest: _0x54a6a3?.modelManifest,
        provider: _0xe3b035,
        model: _0x245056,
        sourceWidth: Number(_0x1b8ea6.frame?.width) || 0,
        sourceHeight: Number(_0x1b8ea6.frame?.height) || 0
      });
      const _0x2f6309 = (_0x16f29c, _0x46f65d = {}) => {
        const _0x76c124 = _0x55ad9a(_0x5641be)?.workspace?.videoGenerationsByShotId?.[_0x152f34] || {};
        const _0x394769 = projectPersonReplacementGenerationTaskIdentity({
          taskId: _0x16f29c,
          meta: _0x46f65d,
          defaults: {
            modelId: _0x245056,
            provider: _0xe3b035,
            providerProfileId: _0x5d9d21,
            executionId: _0x463202,
            startedAt: _0x3e7f59,
            ..._0x76c124
          }
        });
        if (!_0x394769.taskId) {
          return;
        }
        _0x1147f3.taskId = _0x394769.taskId;
        _0x2e86e9(_0x1147f3, {
          status: "running",
          ..._0x394769,
          error: ""
        }, {
          persistIdentity: true
        });
      };
      const _0x29de8d = {
        signal: _0x3693a4.signal,
        useOpenapiQuery: _0x13a32e?.useOpenapiQuery === true,
        onTaskId: _0x33b4de => _0x2f6309(_0x33b4de),
        onTaskMeta: (_0x54ab2d = {}) => _0x2f6309(_0x54ab2d.taskId, _0x54ab2d),
        onRunningHubWorkflowQueueChange: (_0x18526b = {}) => {
          const _0x1d3b4d = normalizeText(_0x18526b.status).toLowerCase() === "queued" ? "queued" : "running";
          _0x2e86e9(_0x1147f3, {
            status: _0x1d3b4d,
            queueIndex: Number(_0x18526b.queueIndex ?? -1),
            queueLength: Number(_0x18526b.queueLength ?? 0),
            error: ""
          });
        }
      };
      const _0x348f54 = _0x13a32e ? await resumeReplacementVideo(_0x13a32e.taskId, _0x4e5c96, _0x29de8d) : await _0x2a0efd(_0x4e5c96, _0x29de8d);
      if (!_0x23e79d({
        projectId: _0x5641be,
        shotId: _0x152f34,
        requestId: _0x4daa18,
        revision: _0x3d198c
      })) {
        _0x55e70c({
          projectId: _0x5641be,
          shotId: _0x152f34,
          requestId: _0x4daa18
        });
        return {
          ok: false,
          stale: true,
          shotId: _0x152f34
        };
      }
      const _0x2bbf4e = now();
      const _0x9edcf8 = getSuccessfulVideoGenerationItems(_0x348f54).map(_0x4698d2 => ({
        ..._0x4698d2,
        createdAt: normalizeText(_0x4698d2?.createdAt) || _0x2bbf4e
      })).filter(_0x34fcf4 => resolvePersonReplacementVideoResultRef(_0x34fcf4));
      if (!_0x9edcf8.length) {
        throw new Error(getVideoGenerationResultError(_0x348f54) || "视频生成结果缺少可用地址");
      }
      const _0x570b0d = _0x55ad9a(_0x5641be);
      const _0x5511ec = _0x570b0d.shots.find(_0x2baee8 => _0x2baee8.id === _0x152f34);
      const _0x5ecfbe = appendPersonReplacementVideoResults(_0x5511ec, _0x9edcf8);
      const _0x1b79d8 = resolvePersonReplacementVideoResultRef(_0x5ecfbe.results[_0x5ecfbe.activeIndex]);
      const _0x1658b0 = {
        ..._0x570b0d,
        shots: _0x570b0d.shots.map(_0x3d042e => _0x3d042e.id === _0x152f34 ? {
          ..._0x3d042e,
          replacementVideo: _0x5ecfbe,
          resultVideoRef: _0x1b79d8,
          generationStatus: "succeeded",
          error: ""
        } : _0x3d042e),
        workspace: updatePersonReplacementVideoGenerationState(_0x570b0d.workspace, {
          status: "succeeded",
          shotId: _0x152f34,
          requestId: _0x4daa18,
          error: ""
        })
      };
      _0x58ded9(transitionPersonReplacementOutput(_0x1658b0, {
        type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.INVALIDATE
      }));
      let _0x132fa1 = true;
      try {
        await persistNow();
      } catch {
        _0x132fa1 = false;
      }
      if (!_0x23e79d({
        projectId: _0x5641be,
        shotId: _0x152f34,
        requestId: _0x4daa18,
        revision: _0x3d198c
      })) {
        _0x55e70c({
          projectId: _0x5641be,
          shotId: _0x152f34,
          requestId: _0x4daa18
        });
        return {
          ok: false,
          stale: true,
          shotId: _0x152f34
        };
      }
      showToast(_0x132fa1 ? "视频替换已生成。" : "视频替换已生成，项目数据正在重试保存，请暂时不要刷新。", _0x132fa1 ? "success" : "warn");
      if (notifyCompletion !== false) {
        notifyGenerationCompleted({
          kind: "video",
          mediaRef: _0x1b79d8
        });
      }
      return {
        project: cloneJson(_0x55ad9a(_0x5641be)),
        ok: true,
        shotId: _0x152f34
      };
    } catch (_0x123688) {
      if (!_0x23e79d({
        projectId: _0x5641be,
        shotId: _0x152f34,
        requestId: _0x4daa18,
        revision: _0x3d198c
      })) {
        _0x55e70c({
          projectId: _0x5641be,
          shotId: _0x152f34,
          requestId: _0x4daa18
        });
        return {
          ok: false,
          stale: true,
          shotId: _0x152f34
        };
      }
      const _0x248cb8 = _0x123688?.getUserMessage?.() || _0x123688?.message || "视频替换生成失败";
      const _0x322939 = _0x55ad9a(_0x5641be);
      const _0x586c84 = _0x58ded9({
        ..._0x322939,
        shots: _0x322939.shots.map(_0x14ec5f => _0x14ec5f.id === _0x152f34 ? {
          ..._0x14ec5f,
          generationStatus: "failed",
          error: _0x248cb8
        } : _0x14ec5f),
        workspace: updatePersonReplacementVideoGenerationState(_0x322939.workspace, {
          status: "failed",
          shotId: _0x152f34,
          requestId: _0x4daa18,
          error: _0x248cb8
        })
      });
      showToast(_0x248cb8, "error");
      return {
        project: cloneJson(_0x586c84),
        ok: false,
        shotId: _0x152f34,
        error: _0x248cb8
      };
    } finally {
      if (_0x157b54.get(_0x5b8212)?.requestId === _0x4daa18) {
        _0x157b54.delete(_0x5b8212);
      }
    }
  };
  const _0x5c2399 = async ({
    projectId: _0x345b91 = "",
    shotId: _0x2d7799,
    notifyCompletion = true
  } = {}) => {
    const _0x38407d = normalizeText(_0x2d7799);
    const _0x2d5fe3 = _0x55ad9a(_0x345b91);
    const _0x3d78df = getRecoverablePersonReplacementVideoTask(_0x2d5fe3?.workspace?.videoGenerationsByShotId?.[_0x38407d]);
    if (!_0x3d78df || _0x533da8) {
      return null;
    }
    return _0x1f4f6c({
      projectId: _0x2d5fe3?.id,
      shotId: _0x38407d,
      notifyCompletion: notifyCompletion,
      recoveryTask: _0x3d78df
    });
  };
  const _0x40b5ff = async ({
    projectId: _0xb81b89 = "",
    shotId: _0x54268b
  } = {}) => {
    const _0x535d27 = normalizeText(_0x54268b);
    const _0x61da91 = _0x55ad9a(_0xb81b89);
    const _0x4aa06c = _0x61da91?.shots?.find(_0x1d228b => normalizeText(_0x1d228b?.id) === _0x535d27);
    const _0x4c56dc = resolvePersonReplacementVideoGenerationState(_0x61da91?.workspace, _0x535d27);
    if (!_0x4aa06c || _0x533da8 || !isPersonReplacementVideoGenerationActive(_0x4c56dc)) {
      return null;
    }
    const _0x4088ff = normalizeText(_0x61da91.id) + ":video:" + _0x535d27;
    const _0x1dfff5 = _0x157b54.get(_0x4088ff);
    const _0x35df26 = normalizeText(_0x4c56dc.requestId);
    const _0x195139 = _0x1dfff5 && (!_0x35df26 || normalizeText(_0x1dfff5.requestId) === _0x35df26) ? _0x1dfff5 : null;
    const _0x2c14af = normalizeText(_0x4c56dc.taskId || _0x195139?.taskId);
    const _0x553682 = normalizeText(_0x4c56dc.providerProfileId || _0x61da91.settings?.replacementVideoProviderProfileId);
    const _0x1177fc = Boolean(normalizeText(_0x4aa06c.resultVideoRef) || Array.isArray(_0x4aa06c.replacementVideo?.results) && _0x4aa06c.replacementVideo.results.length);
    _0x58ded9({
      ..._0x61da91,
      shots: _0x61da91.shots.map(_0x295a => _0x295a.id === _0x535d27 ? {
        ..._0x295a,
        generationStatus: _0x1177fc ? "succeeded" : "pending",
        error: ""
      } : _0x295a),
      workspace: updatePersonReplacementVideoGenerationState(_0x61da91.workspace, {
        status: "idle",
        shotId: _0x535d27,
        error: ""
      })
    });
    if (_0x195139) {
      _0x157b54.delete(_0x4088ff);
      _0x195139.abortController?.abort?.();
    }
    let _0x3d37ac = !_0x2c14af;
    if (_0x2c14af && typeof cancelReplacementVideo === "function") {
      try {
        await cancelReplacementVideo({
          taskId: _0x2c14af,
          providerProfileId: _0x553682,
          modelId: normalizeText(_0x4c56dc.modelId),
          provider: normalizeText(_0x4c56dc.provider)
        });
        _0x3d37ac = true;
      } catch (_0x4cf0e0) {
        const _0x3cfd29 = normalizeText(_0x4cf0e0?.getUserMessage?.() || _0x4cf0e0?.message) || "RunningHub 远端任务取消失败";
        showToast("已停止本地等待，但" + _0x3cfd29, "warn");
      }
    }
    if (_0x3d37ac) {
      showToast("视频替换已取消。", "info");
    }
    return {
      ok: true,
      shotId: _0x535d27,
      taskId: _0x2c14af,
      remoteCancelled: _0x3d37ac
    };
  };
  const _0x4a1f6c = async () => {
    if (_0x533da8) {
      return [];
    }
    const _0x7dd4b1 = _0x230920();
    const _0x1ce802 = normalizeText(_0x7dd4b1?.id);
    const _0x273d3d = Object.entries(_0x7dd4b1?.workspace?.videoGenerationsByShotId || {}).flatMap(([_0x2c2566, _0x14d493]) => getRecoverablePersonReplacementVideoTask(_0x14d493) ? [normalizeText(_0x2c2566)] : []);
    const _0x4ab4f4 = await Promise.allSettled(_0x273d3d.map(_0x38e9e2 => _0x5c2399({
      shotId: _0x38e9e2
    })));
    if (_0x533da8 || !_0x55ad9a(_0x1ce802)) {
      return [];
    }
    return _0x4ab4f4;
  };
  return {
    prepare: _0x9be8f3,
    generate: _0x1f4f6c,
    cancel: _0x40b5ff,
    resume: _0x5c2399,
    resumeRecoverable: _0x4a1f6c,
    hasActiveTasks: () => Boolean(_0x50dc5c || _0x8ac63.length || _0x157b54.size),
    getActiveGenerationCount: () => _0x157b54.size,
    hasActiveTasksForProject: _0x471a3f => {
      const _0x5bcc4e = normalizeText(_0x471a3f);
      if (!_0x5bcc4e) {
        return false;
      }
      return _0x8ac63.some(_0x3467f8 => _0x3467f8.projectId === _0x5bcc4e) || _0x15746c === _0x5bcc4e || [..._0x157b54.values()].some(_0x181ac9 => _0x181ac9.projectId === _0x5bcc4e);
    },
    destroy: () => {
      if (_0x533da8) {
        return;
      }
      _0x157b54.forEach(_0x52876a => {
        _0x52876a.abortController?.abort?.();
        if (!normalizeText(_0x52876a.taskId)) {
          _0x55e70c(_0x52876a);
        }
      });
      _0x157b54.clear();
      _0x8ac63.splice(0).forEach(_0x3bcc5e => {
        _0x3bcc5e.resolve(_0x28814f());
      });
      _0x533da8 = true;
    }
  };
}