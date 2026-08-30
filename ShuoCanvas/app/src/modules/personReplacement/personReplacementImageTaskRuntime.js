import { getImageGenerationResultError, getSuccessfulImageGenerationItems, normalizeImageGenerationResult } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { buildCharacterAssetImageGenerationPayload } from "../characterAssets/characterAssetImageGeneration.js";
import { PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID } from "./personReplacementProject.js";
import { resolveModelExecution } from "../../manifests/index.js";
import { getPersonReplacementDuplicateRoleLabels } from "./personReplacementSourceIdentity.js";
import { buildPersonReplacementPromptPackage, isPersonReplacementSceneOnlyPromptPackage } from "./personReplacementPromptCompiler.js";
import { appendPersonReplacementImageResult, createPersonReplacementImageGenerationMappingRevision, createPersonReplacementImageGenerationRequestRevision, getRecoverablePersonReplacementImageTask, resolvePersonReplacementImageGenerationParams, resolvePersonReplacementImageGenerationState, updatePersonReplacementImageGenerationState } from "./personReplacementImageGeneration.js";
import { hasPersonReplacementGenerationTaskIdentityChanged, projectPersonReplacementGenerationTaskIdentity } from "./personReplacementGenerationTaskIdentity.js";
import { resumeAsyncImageTask, resumeDreaminaImageTask, resumeRunningHubImageTask } from "../../../api/aiImageApi.js";
function normalizeText(_0x21e0a7) {
  return String(_0x21e0a7 ?? "").trim();
}
function resolveGeneratedImageRef(_0xce9b7f) {
  const _0x50d86b = normalizeImageGenerationResult(_0xce9b7f);
  const _0x226c1f = getSuccessfulImageGenerationItems(_0x50d86b)[0];
  const _0x15d3d6 = normalizeText(_0x226c1f?.localPath || _0x226c1f?.imageUrl || _0x226c1f?.url || _0x226c1f?.sourceUrl || _0x226c1f?.thumbUrl || (typeof _0x226c1f === "string" ? _0x226c1f : "") || _0x50d86b?.localPath || _0x50d86b?.imageUrl);
  if (!_0x15d3d6) {
    throw new Error(getImageGenerationResultError(_0x50d86b) || "图像生成结果缺少可用图片");
  }
  return _0x15d3d6;
}
function resolveDefaultPromptRequest({
  shot: _0x3e2dcd,
  promptPackage: _0xf4702a
}) {
  const _0x12e428 = normalizeText(_0x3e2dcd?.imagePrompt);
  return {
    savedPrompt: _0x12e428,
    requestPrompt: _0x12e428 ? [_0xf4702a.guidedBindingPrompt, "用户要求：\n" + _0x12e428].filter(Boolean).join("\n\n") : _0xf4702a.prompt,
    promptAssetRefs: []
  };
}
async function resumePersonReplacementImageTask(_0x3e89c5, _0x3fc607, _0x345492 = {}) {
  const _0x30121b = resolveModelExecution(_0x3fc607?.model) || resolveModelExecution(_0x3fc607?.model, {
    providerHint: _0x3fc607?.provider
  });
  const _0xa5546 = normalizeText(_0x30121b?.modelManifest?.provider || _0x3fc607?.provider);
  if (_0xa5546 === "dreamina") {
    return resumeDreaminaImageTask(_0x3e89c5, _0x3fc607, _0x345492);
  }
  if (_0xa5546 === "runninghub" || _0xa5546 === "runninghubwf" || _0x30121b?.executionManifest?.adapterType === "workflow") {
    return resumeRunningHubImageTask(_0x3e89c5, _0x3fc607, _0x345492);
  }
  return resumeAsyncImageTask(_0x3e89c5, _0x3fc607, _0x345492);
}
export function createPersonReplacementImageTaskRuntime({
  getProject: _0x28221c,
  getProjectById = null,
  commitProject: _0xf127cf,
  commitProjectById = null,
  generateImage: _0x35e276,
  resumeImageTask = resumePersonReplacementImageTask,
  createRequestId = () => globalThis.crypto?.randomUUID?.() || "" + Date.now(),
  showToast = () => {},
  resolvePromptRequest = resolveDefaultPromptRequest,
  now = () => new Date().toISOString(),
  notifyCompletion = () => {},
  persistNow = () => Promise.resolve(null)
} = {}) {
  const _0x2e600f = new Map();
  let _0x382693 = false;
  const _0x2f2a17 = (_0x4fa8df = "") => {
    const _0x3e5900 = normalizeText(_0x4fa8df);
    if (_0x3e5900 && typeof getProjectById === "function") {
      return getProjectById(_0x3e5900);
    } else {
      return _0x28221c?.();
    }
  };
  const _0x4c8bf7 = _0x5f4929 => typeof commitProjectById === "function" ? commitProjectById(_0x5f4929?.id, _0x5f4929) : _0xf127cf?.(_0x5f4929);
  const _0x13fd33 = ({
    currentProject: _0xf51c64,
    projectId: _0x1bfb60,
    shotId: _0x2a1ed9,
    requestId: _0x1e42a7
  }) => {
    if (_0x382693 || _0xf51c64?.id !== _0x1bfb60) {
      return null;
    }
    const _0x5ab3bc = resolvePersonReplacementImageGenerationState(_0xf51c64.workspace, _0x2a1ed9);
    if (_0x5ab3bc.requestId !== _0x1e42a7) {
      return null;
    }
    const _0x4fc3c1 = _0x4c8bf7({
      ..._0xf51c64,
      workspace: updatePersonReplacementImageGenerationState(_0xf51c64.workspace, {
        status: "idle",
        shotId: _0x2a1ed9,
        error: ""
      })
    });
    showToast("生成期间检测框或生成设置已变化，旧结果未应用，请重新生成。", "warn");
    return {
      project: _0x4fc3c1,
      ok: false,
      stale: true,
      shotId: _0x2a1ed9
    };
  };
  const _0x865a29 = ({
    shotId = "",
    imageRef = "",
    fileName = "",
    createdAt = now(),
    expectedProjectId = "",
    expectedShotRevision = ""
  } = {}) => {
    if (_0x382693) {
      return null;
    }
    const _0x158342 = _0x28221c?.();
    const _0x3c94bb = normalizeText(shotId);
    const _0xbee993 = normalizeText(imageRef);
    const _0x124208 = normalizeText(expectedProjectId);
    const _0x196724 = normalizeText(expectedShotRevision);
    if (!_0x124208 || _0x158342?.id !== _0x124208) {
      return null;
    }
    const _0xd3907b = _0x158342?.shots?.find?.(_0x384e3a => _0x384e3a.id === _0x3c94bb);
    if (!_0xd3907b || !_0xbee993) {
      return null;
    }
    if (!_0x196724 || createPersonReplacementImageGenerationMappingRevision({
      project: _0x158342,
      shot: _0xd3907b
    }) !== _0x196724) {
      return null;
    }
    const _0x2045e2 = appendPersonReplacementImageResult(_0xd3907b, {
      imageUrl: _0xbee993,
      source: "upload",
      fileName: normalizeText(fileName) || "上传替换图片",
      userPrompt: normalizeText(_0xd3907b.imagePrompt),
      createdAt: createdAt
    });
    return _0xf127cf?.({
      ..._0x158342,
      shots: _0x158342.shots.map(_0x1e429d => _0x1e429d.id === _0x3c94bb ? {
        ..._0x1e429d,
        replacementImage: _0x2045e2,
        replacementImageRef: _0xbee993,
        error: ""
      } : _0x1e429d),
      workspace: {
        ..._0x158342.workspace,
        selectedShotId: _0x3c94bb
      }
    });
  };
  const _0x3704a9 = ({
    project: _0x2f5c0a,
    shot: _0x34079d,
    promptPackage = buildPersonReplacementPromptPackage({
      project: _0x2f5c0a,
      shot: _0x34079d
    }),
    sourceImageSize: _0x447773,
    taskIdentity = {}
  }) => {
    const {
      savedPrompt = "",
      requestPrompt = promptPackage.prompt,
      promptAssetRefs = []
    } = resolvePromptRequest({
      project: _0x2f5c0a,
      shot: _0x34079d,
      promptPackage: promptPackage
    }) || {};
    const _0xf9cc46 = normalizeText(taskIdentity.modelId) || _0x2f5c0a.settings?.replacementImageModelId || PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID;
    const _0x30d575 = resolvePersonReplacementImageGenerationParams({
      modelId: _0xf9cc46,
      provider: normalizeText(taskIdentity.provider) || _0x2f5c0a.settings?.replacementImageProvider,
      generationParams: _0x2f5c0a.settings?.replacementImageGenerationParams,
      sourceImageSize: _0x447773,
      shot: _0x34079d
    });
    const _0x35e85e = buildCharacterAssetImageGenerationPayload({
      prompt: requestPrompt,
      modelId: _0xf9cc46,
      provider: _0x30d575.provider,
      providerProfileId: normalizeText(taskIdentity.providerProfileId) || _0x2f5c0a.settings?.replacementImageProviderProfileId,
      generationParams: _0x30d575.generationParams,
      referenceImageUrls: [...promptPackage.referenceImages.map(_0x500209 => _0x500209.ref), ...(Array.isArray(promptAssetRefs) ? promptAssetRefs : []).map(_0x31f8a0 => _0x31f8a0?.url)]
    });
    _0x35e85e.adaptiveSource = _0x30d575.adaptiveSource;
    _0x35e85e.resolvedRatioLabel = _0x30d575.resolvedAspectRatio;
    return {
      modelId: _0xf9cc46,
      payload: _0x35e85e,
      promptPackage: promptPackage,
      ratioResolution: _0x30d575,
      requestPrompt: requestPrompt,
      savedPrompt: savedPrompt
    };
  };
  const _0x24eb9b = ({
    currentProject: _0x2b5344,
    currentShot: _0x2c53f0,
    requestRevision: _0x4f5524,
    savedPrompt: _0x424c1d,
    sourceImageSize: _0x1cab9f,
    taskIdentity = {}
  }) => {
    try {
      const _0x36b22c = _0x3704a9({
        project: _0x2b5344,
        shot: {
          ..._0x2c53f0,
          imagePrompt: _0x424c1d
        },
        sourceImageSize: _0x1cab9f,
        taskIdentity: taskIdentity
      });
      return createPersonReplacementImageGenerationRequestRevision({
        project: _0x2b5344,
        shot: _0x2c53f0,
        payload: _0x36b22c.payload,
        sourceImageSize: _0x1cab9f
      }) === _0x4f5524;
    } catch {
      return false;
    }
  };
  const _0x4f9655 = ({
    projectId: _0x323555,
    shotId: _0x3c6f80,
    requestId: _0x3c6499,
    requestRevision = "",
    savedPrompt = "",
    sourceImageSize: _0x2f3ca5,
    taskIdentity = {}
  } = {}) => {
    if (_0x382693) {
      return false;
    }
    const _0x14e4ec = _0x2f2a17(_0x323555);
    if (normalizeText(_0x14e4ec?.id) !== normalizeText(_0x323555)) {
      return false;
    }
    const _0x1c2df4 = _0x14e4ec?.shots?.find?.(_0xadd276 => normalizeText(_0xadd276?.id) === normalizeText(_0x3c6f80));
    if (!_0x1c2df4) {
      return false;
    }
    const _0x58576a = resolvePersonReplacementImageGenerationState(_0x14e4ec.workspace, _0x3c6f80);
    if (normalizeText(_0x58576a.requestId) !== normalizeText(_0x3c6499)) {
      return false;
    }
    return !requestRevision || _0x24eb9b({
      currentProject: _0x14e4ec,
      currentShot: _0x1c2df4,
      requestRevision: requestRevision,
      savedPrompt: savedPrompt,
      sourceImageSize: _0x2f3ca5,
      taskIdentity: taskIdentity
    });
  };
  const _0x1b119f = (_0x2ac62f, _0x5b8a65 = {}, {
    persistIdentity = false
  } = {}) => {
    if (!_0x4f9655(_0x2ac62f)) {
      return false;
    }
    const _0x59c30e = _0x2f2a17(_0x2ac62f.projectId);
    const _0x21b100 = resolvePersonReplacementImageGenerationState(_0x59c30e.workspace, _0x2ac62f.shotId);
    const _0x20e1ee = {
      ..._0x21b100,
      ..._0x5b8a65,
      shotId: _0x2ac62f.shotId,
      requestId: _0x2ac62f.requestId
    };
    const _0x2924bc = Object.keys(_0x20e1ee).some(_0x76cde2 => !Object.is(_0x20e1ee[_0x76cde2], _0x21b100[_0x76cde2])) || Object.keys(_0x21b100).some(_0x44262f => !Object.hasOwn(_0x20e1ee, _0x44262f));
    if (!_0x2924bc) {
      return true;
    }
    _0x4c8bf7({
      ..._0x59c30e,
      workspace: updatePersonReplacementImageGenerationState(_0x59c30e.workspace, _0x20e1ee)
    });
    if (persistIdentity && normalizeText(_0x20e1ee.taskId) && hasPersonReplacementGenerationTaskIdentityChanged(_0x21b100, _0x20e1ee)) {
      Promise.resolve(persistNow()).catch(() => {});
    }
    return true;
  };
  const _0x2ef858 = async ({
    projectId: _0xe1eed0 = "",
    shotId = "",
    sourceImageSize: _0x4da01,
    notifyCompletion: _0x26b959 = true,
    recoveryTask = null
  } = {}) => {
    if (_0x382693) {
      return null;
    }
    const _0x301848 = _0x2f2a17(_0xe1eed0);
    const _0x5df8e9 = normalizeText(shotId);
    const _0x2eceab = _0x301848?.shots?.find?.(_0x8acb05 => _0x8acb05.id === _0x5df8e9);
    const _0x4920bf = getRecoverablePersonReplacementImageTask(_0x301848?.workspace?.imageGenerationsByShotId?.[_0x5df8e9]);
    const _0x2b109b = recoveryTask ? {
      ..._0x4920bf,
      ...recoveryTask
    } : null;
    if (!_0x2b109b && _0x4920bf) {
      return null;
    }
    if (!_0x301848?.id || !_0x2eceab || (_0x2b109b ? typeof resumeImageTask !== "function" : typeof _0x35e276 !== "function")) {
      return null;
    }
    const _0x43de30 = buildPersonReplacementPromptPackage({
      project: _0x301848,
      shot: _0x2eceab
    });
    const _0x5d7f03 = getPersonReplacementDuplicateRoleLabels(_0x2eceab, _0x301848);
    const _0x872c30 = isPersonReplacementSceneOnlyPromptPackage(_0x43de30);
    if (!_0x872c30) {
      if (_0x5d7f03.length) {
        showToast("同一镜头内角色不能重复：" + _0x5d7f03.join("、") + "。请修改红色框中的角色名。", "warn");
        return null;
      }
      if (_0x43de30.overflowPersonIds.length) {
        showToast("单次最多替换 8 个目标人物。", "warn");
        return null;
      }
      if (_0x43de30.missingLocatorPersonIds.length) {
        showToast("存在缺少定位框的人物，请切换关键帧或手动补框后再生成。", "warn");
        return null;
      }
      if (_0x43de30.unresolvedOrientationPersonIds.length) {
        showToast("还有 " + _0x43de30.unresolvedOrientationPersonIds.length + " 个人物未确认朝向，请先选择朝向。", "warn");
        return null;
      }
      if (_0x43de30.unmappedPersonIds.length) {
        showToast("还有 " + _0x43de30.unmappedPersonIds.length + " 个人物框未绑定目标形象。", "warn");
        return null;
      }
    }
    if (_0x43de30.referenceImages.length < 2) {
      showToast("请先把至少一个素材形象拖到首帧人物框。", "warn");
      return null;
    }
    const _0x944303 = _0x301848.id + ":image:" + _0x5df8e9;
    if (_0x2e600f.has(_0x944303)) {
      return null;
    }
    const _0x2a4f0a = _0x301848.id;
    const _0x21424c = normalizeText(_0x2b109b?.requestId) || normalizeText(createRequestId());
    const _0x148625 = new AbortController();
    const _0x25dd97 = {
      projectId: _0x2a4f0a,
      requestId: _0x21424c,
      shotId: _0x5df8e9,
      abortController: _0x148625,
      taskId: normalizeText(_0x2b109b?.taskId),
      taskIdentity: _0x2b109b || {}
    };
    _0x2e600f.set(_0x944303, _0x25dd97);
    const _0x3eee83 = createPersonReplacementImageGenerationMappingRevision({
      project: _0x301848,
      shot: _0x2eceab
    });
    let _0x736f46 = "";
    let _0x4d8e3b = "";
    _0x4c8bf7({
      ..._0x301848,
      workspace: updatePersonReplacementImageGenerationState(_0x301848.workspace, {
        status: "running",
        shotId: _0x5df8e9,
        requestId: _0x21424c,
        ...(_0x2b109b || {}),
        error: ""
      })
    });
    try {
      const {
        modelId: _0x375184,
        payload: _0x56634b,
        ratioResolution: _0xd8ce27,
        requestPrompt: _0x28b3a4,
        savedPrompt: _0x355874
      } = _0x3704a9({
        project: _0x301848,
        shot: _0x2eceab,
        promptPackage: _0x43de30,
        sourceImageSize: _0x4da01,
        taskIdentity: _0x2b109b || {}
      });
      _0x4d8e3b = _0x355874;
      _0x736f46 = createPersonReplacementImageGenerationRequestRevision({
        project: _0x301848,
        shot: _0x2eceab,
        payload: _0x56634b,
        sourceImageSize: _0x4da01
      });
      Object.assign(_0x25dd97, {
        requestRevision: _0x736f46,
        savedPrompt: _0x355874,
        sourceImageSize: _0x4da01
      });
      const _0x4336b3 = resolveModelExecution(_0x375184) || resolveModelExecution(_0x375184, {
        providerHint: _0xd8ce27.provider
      });
      const _0x535455 = Number(_0x2b109b?.startedAt) || Date.now();
      const _0x4136f7 = {
        taskId: normalizeText(_0x2b109b?.taskId),
        modelId: _0x375184,
        provider: _0xd8ce27.provider,
        providerProfileId: _0x56634b.providerProfileId,
        executionId: normalizeText(_0x2b109b?.executionId) || normalizeText(_0x4336b3?.executionManifest?.id),
        startedAt: _0x535455,
        useOpenapiQuery: _0x2b109b?.useOpenapiQuery === true
      };
      const _0x5cfc15 = (_0x22237f, _0x179d8d = {}) => {
        const _0x3d6aa2 = resolvePersonReplacementImageGenerationState(_0x2f2a17(_0x2a4f0a)?.workspace, _0x5df8e9);
        const _0xfdde5f = projectPersonReplacementGenerationTaskIdentity({
          taskId: _0x22237f,
          meta: _0x179d8d,
          defaults: {
            ..._0x4136f7,
            ..._0x3d6aa2
          }
        });
        if (!_0xfdde5f.taskId) {
          return;
        }
        _0x25dd97.taskId = _0xfdde5f.taskId;
        _0x1b119f(_0x25dd97, {
          status: "running",
          ..._0xfdde5f,
          error: ""
        }, {
          persistIdentity: true
        });
      };
      const _0x481c3a = {
        signal: _0x148625.signal,
        useOpenapiQuery: _0x2b109b?.useOpenapiQuery === true,
        onTaskId: _0x608e32 => _0x5cfc15(_0x608e32),
        onTaskMeta: (_0x2d84e7 = {}) => _0x5cfc15(_0x2d84e7.taskId, _0x2d84e7),
        onRunningHubWorkflowQueueChange: (_0x5b0107 = {}) => {
          const _0x1ed3dc = normalizeText(_0x5b0107.status).toLowerCase() === "queued" ? "queued" : "running";
          _0x1b119f(_0x25dd97, {
            status: _0x1ed3dc,
            error: ""
          });
        }
      };
      const _0x89fea1 = _0x2b109b ? await resumeImageTask(_0x2b109b.taskId, _0x56634b, _0x481c3a) : await _0x35e276(_0x56634b, _0x481c3a);
      if (_0x382693) {
        return null;
      }
      const _0x461e6c = resolveGeneratedImageRef(_0x89fea1);
      const _0x136b44 = _0x2f2a17(_0x2a4f0a);
      if (_0x136b44?.id !== _0x2a4f0a) {
        return null;
      }
      const _0x3bc652 = _0x136b44.shots?.find?.(_0xd89cd4 => _0xd89cd4.id === _0x5df8e9);
      if (!_0x3bc652) {
        return null;
      }
      const _0x4f3bf3 = resolvePersonReplacementImageGenerationState(_0x136b44.workspace, _0x5df8e9);
      if (_0x4f3bf3.requestId !== _0x21424c) {
        return null;
      }
      if (!_0x24eb9b({
        currentProject: _0x136b44,
        currentShot: _0x3bc652,
        requestRevision: _0x736f46,
        savedPrompt: _0x355874,
        sourceImageSize: _0x4da01,
        taskIdentity: _0x2b109b || {}
      })) {
        return _0x13fd33({
          currentProject: _0x136b44,
          projectId: _0x2a4f0a,
          shotId: _0x5df8e9,
          requestId: _0x21424c
        });
      }
      const _0x402ad2 = appendPersonReplacementImageResult(_0x3bc652, {
        imageUrl: _0x461e6c,
        prompt: _0x28b3a4,
        userPrompt: _0x355874,
        modelId: _0x375184,
        provider: _0xd8ce27.provider,
        createdAt: now()
      });
      const _0x119327 = normalizeText(_0x3bc652.imagePrompt) !== normalizeText(_0x355874);
      const _0x242d73 = _0x4c8bf7({
        ..._0x136b44,
        shots: _0x136b44.shots.map(_0xdc2338 => _0xdc2338.id === _0x5df8e9 ? {
          ..._0xdc2338,
          replacementImage: _0x402ad2,
          replacementImageRef: _0x461e6c,
          error: "",
          imagePrompt: _0x119327 ? _0x3bc652.imagePrompt : _0x355874
        } : _0xdc2338),
        workspace: updatePersonReplacementImageGenerationState(_0x136b44.workspace, {
          status: "succeeded",
          shotId: _0x5df8e9,
          requestId: _0x21424c,
          error: ""
        })
      });
      let _0x51bb81 = true;
      try {
        await persistNow();
      } catch {
        _0x51bb81 = false;
      }
      if (_0x382693) {
        return null;
      }
      const _0x5be554 = _0x2f2a17(_0x2a4f0a);
      if (_0x5be554?.id !== _0x2a4f0a) {
        return null;
      }
      const _0x25058b = _0x5be554.shots?.find?.(_0x5eaf55 => _0x5eaf55.id === _0x5df8e9);
      if (!_0x25058b) {
        return null;
      }
      const _0x4a1d55 = resolvePersonReplacementImageGenerationState(_0x5be554.workspace, _0x5df8e9);
      if (_0x4a1d55.requestId !== _0x21424c) {
        return null;
      }
      showToast(_0x51bb81 ? "替换首帧已生成。" : "替换首帧已生成，项目数据正在重试保存，请暂时不要刷新。", _0x51bb81 ? "success" : "warn");
      if (_0x26b959 !== false) {
        notifyCompletion({
          kind: "image",
          mediaRef: _0x461e6c
        });
      }
      return {
        project: _0x5be554 || _0x242d73,
        ok: true,
        shotId: _0x5df8e9
      };
    } catch (_0x401335) {
      if (_0x382693) {
        return null;
      }
      const _0x8c1563 = _0x2f2a17(_0x2a4f0a);
      if (_0x8c1563?.id !== _0x2a4f0a) {
        return null;
      }
      const _0x1f99ae = _0x8c1563.shots?.find?.(_0x3ca6f0 => _0x3ca6f0.id === _0x5df8e9);
      if (!_0x1f99ae) {
        return null;
      }
      const _0x21a582 = resolvePersonReplacementImageGenerationState(_0x8c1563.workspace, _0x5df8e9);
      if (_0x21a582.requestId !== _0x21424c) {
        return null;
      }
      const _0x5b5eef = _0x736f46 ? !_0x24eb9b({
        currentProject: _0x8c1563,
        currentShot: _0x1f99ae,
        requestRevision: _0x736f46,
        savedPrompt: _0x4d8e3b,
        sourceImageSize: _0x4da01,
        taskIdentity: _0x2b109b || {}
      }) : createPersonReplacementImageGenerationMappingRevision({
        project: _0x8c1563,
        shot: _0x1f99ae
      }) !== _0x3eee83;
      if (_0x5b5eef) {
        return _0x13fd33({
          currentProject: _0x8c1563,
          projectId: _0x2a4f0a,
          shotId: _0x5df8e9,
          requestId: _0x21424c
        });
      }
      const _0x7da430 = _0x401335?.getUserMessage?.() || _0x401335?.message || "替换首帧生成失败";
      const _0x1934f4 = _0x4c8bf7({
        ..._0x8c1563,
        workspace: updatePersonReplacementImageGenerationState(_0x8c1563.workspace, {
          status: "failed",
          shotId: _0x5df8e9,
          requestId: _0x21424c,
          error: _0x7da430
        })
      });
      showToast(_0x7da430, "error");
      return {
        project: _0x1934f4,
        ok: false,
        shotId: _0x5df8e9,
        error: _0x7da430
      };
    } finally {
      _0x2e600f.delete(_0x944303);
    }
  };
  const _0x5777fd = async ({
    projectId: _0x1e7287 = "",
    shotId = "",
    notifyCompletion = true
  } = {}) => {
    const _0x2c31ac = normalizeText(shotId);
    const _0x4edcd8 = _0x2f2a17(_0x1e7287);
    const _0x4c2c92 = getRecoverablePersonReplacementImageTask(_0x4edcd8?.workspace?.imageGenerationsByShotId?.[_0x2c31ac]);
    if (!_0x4c2c92 || _0x382693) {
      return null;
    }
    return _0x2ef858({
      projectId: _0x4edcd8?.id,
      shotId: _0x2c31ac,
      notifyCompletion: notifyCompletion,
      recoveryTask: _0x4c2c92
    });
  };
  const _0x54357f = ({
    projectId: _0x7514b = "",
    shotId: _0x3dee15
  } = {}) => {
    const _0x1a79ec = normalizeText(_0x3dee15);
    const _0x5e12df = _0x2f2a17(_0x7514b);
    const _0x512a3a = normalizeText(_0x5e12df?.id);
    const _0x5d31d9 = _0x512a3a + ":image:" + _0x1a79ec;
    const _0x3ce2b2 = _0x2e600f.get(_0x5d31d9);
    if (!_0x3ce2b2 || _0x382693) {
      return null;
    }
    _0x2e600f.delete(_0x5d31d9);
    _0x3ce2b2.abortController?.abort?.();
    const _0x537819 = resolvePersonReplacementImageGenerationState(_0x5e12df?.workspace, _0x1a79ec);
    if (normalizeText(_0x537819.requestId) !== normalizeText(_0x3ce2b2.requestId)) {
      return {
        ok: true,
        shotId: _0x1a79ec
      };
    }
    const _0x2b4538 = _0x4c8bf7({
      ..._0x5e12df,
      workspace: updatePersonReplacementImageGenerationState(_0x5e12df.workspace, {
        status: "idle",
        shotId: _0x1a79ec,
        error: ""
      })
    });
    return {
      ok: true,
      shotId: _0x1a79ec,
      project: _0x2b4538
    };
  };
  const _0x1e8bea = async () => {
    if (_0x382693) {
      return [];
    }
    const _0x25a815 = _0x28221c?.();
    const _0x54061f = normalizeText(_0x25a815?.id);
    const _0x277750 = Object.entries(_0x25a815?.workspace?.imageGenerationsByShotId || {}).flatMap(([_0x323ff0, _0x129dd9]) => getRecoverablePersonReplacementImageTask(_0x129dd9) ? [normalizeText(_0x323ff0)] : []);
    const _0x2c9f4d = await Promise.allSettled(_0x277750.map(_0x550056 => _0x5777fd({
      shotId: _0x550056
    })));
    if (_0x382693 || !_0x2f2a17(_0x54061f)) {
      return [];
    }
    return _0x2c9f4d;
  };
  const _0x3bc898 = () => {
    if (_0x382693) {
      return null;
    }
    _0x382693 = true;
    const _0xf6b87a = _0x28221c?.();
    let _0x100b88 = _0xf6b87a?.workspace;
    let _0x33c7b4 = false;
    if (_0xf6b87a?.id) {
      _0x2e600f.forEach(_0x265b07 => {
        if (_0x265b07.projectId !== _0xf6b87a.id) {
          return;
        }
        const _0x1a381d = resolvePersonReplacementImageGenerationState(_0x100b88, _0x265b07.shotId);
        if (_0x1a381d.requestId !== _0x265b07.requestId) {
          return;
        }
        _0x265b07.abortController?.abort?.();
        if (getRecoverablePersonReplacementImageTask(_0x1a381d)) {
          return;
        }
        if (_0x1a381d.status !== "running") {
          return;
        }
        _0x100b88 = updatePersonReplacementImageGenerationState(_0x100b88, {
          status: "idle",
          shotId: _0x265b07.shotId,
          error: ""
        });
        _0x33c7b4 = true;
      });
    }
    _0x2e600f.clear();
    if (!_0x33c7b4) {
      return null;
    }
    return _0xf127cf?.({
      ..._0xf6b87a,
      workspace: _0x100b88
    });
  };
  return Object.freeze({
    acceptUploadedResult: _0x865a29,
    cancel: _0x54357f,
    destroy: _0x3bc898,
    generate: _0x2ef858,
    resume: _0x5777fd,
    resumeRecoverable: _0x1e8bea,
    hasActiveTasks: () => _0x2e600f.size > 0,
    hasActiveTasksForProject: _0x49f3d9 => {
      const _0x5e58ab = normalizeText(_0x49f3d9);
      return Boolean(_0x5e58ab) && [..._0x2e600f.values()].some(_0x26dd61 => _0x26dd61.projectId === _0x5e58ab);
    }
  });
}