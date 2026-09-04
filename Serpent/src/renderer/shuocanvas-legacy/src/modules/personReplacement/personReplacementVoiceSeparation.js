import { cancelRunningHubAudioTask, resumeAudioSeparationTask, runAudioSeparation } from "../../../api/aiAudioApi.js";
import { resolveRunningHubWorkflowAccess } from "../../../api/configApi.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { saveRemoteAudioLocallyDetailed } from "../../services/projectService.js";
import { createPersonReplacementVoiceSeparationRevision, isPersonReplacementVoiceSeparationActive, normalizePersonReplacementVoiceSeparationState, resolvePersonReplacementVoiceSeparationState, updatePersonReplacementVoiceSeparationState } from "./personReplacementVoiceSeparationState.js";
function normalizeText(_0x5cca64) {
  return String(_0x5cca64 ?? "").trim();
}
function cloneJson(_0x1021eb) {
  if (_0x1021eb && typeof _0x1021eb === "object") {
    return JSON.parse(JSON.stringify(_0x1021eb));
  } else {
    return _0x1021eb;
  }
}
function createRequestId() {
  const _0x1c1442 = globalThis.crypto?.randomUUID?.();
  return "replacement-voice-separation-" + (_0x1c1442 || Date.now() + "-" + Math.round(Math.random() * 100000));
}
function resolveSeparationResultUrls(_0x593f88 = {}) {
  const _0x4a1509 = Array.isArray(_0x593f88?.audios) ? _0x593f88.audios : [];
  const _0x102edd = normalizeText(_0x593f88.vocalsAudioUrl || _0x4a1509.find(_0x3e1cf5 => normalizeText(_0x3e1cf5?.role).toLowerCase() === "vocals")?.audioUrl || _0x4a1509[0]?.audioUrl);
  const _0x59d947 = normalizeText(_0x593f88.backgroundAudioUrl || _0x4a1509.find(_0x21ef34 => normalizeText(_0x21ef34?.role).toLowerCase() === "background")?.audioUrl || _0x4a1509[1]?.audioUrl);
  if (!_0x102edd || !_0x59d947) {
    throw new Error("人声分离完成，但返回结果缺少人声或背景声音频");
  }
  return {
    vocalsAudioUrl: _0x102edd,
    backgroundAudioUrl: _0x59d947
  };
}
async function persistSeparatedAudio(_0x2cc30e, _0x13e20a) {
  const _0x2c0c74 = await _0x13e20a(_0x2cc30e);
  const _0x360ac9 = normalizeLocalPath(pickResultLocalPath(_0x2c0c74));
  const _0x12bcf8 = normalizeText(_0x2c0c74?.localUrl || _0x2c0c74?.audioUrl || localPathToUrl(_0x360ac9));
  if (!_0x360ac9 || !_0x12bcf8) {
    throw new Error("清晰人声已生成，但保存到本地失败");
  }
  return {
    localPath: _0x360ac9,
    localUrl: _0x12bcf8
  };
}
async function cancelRemoteSeparationTask({
  taskId: _0x4440db,
  providerProfileId = ""
} = {}) {
  const _0x54aa1b = await resolveRunningHubWorkflowAccess(providerProfileId);
  if (!_0x54aa1b?.apiKey) {
    throw new Error("未配置 RunningHub API Key，无法取消远端任务");
  }
  return cancelRunningHubAudioTask({
    apiKey: _0x54aa1b.apiKey,
    taskId: _0x4440db,
    providerProfileId: providerProfileId || _0x54aa1b.providerProfileId
  });
}
export function createPersonReplacementVoiceSeparationRuntime({
  getProject: _0x3214d1,
  setProject: _0x4e7eca,
  runSeparation = runAudioSeparation,
  resumeSeparation = resumeAudioSeparationTask,
  cancelSeparation = cancelRemoteSeparationTask,
  saveAudio = saveRemoteAudioLocallyDetailed,
  persistNow = async () => {},
  onStateChange = () => {},
  showToast = () => {},
  now = () => new Date().toISOString(),
  createId = createRequestId
} = {}) {
  if (typeof _0x3214d1 !== "function" || typeof _0x4e7eca !== "function") {
    throw new TypeError("Voice separation runtime requires project access");
  }
  let _0x412710 = false;
  const _0x1043e2 = new Map();
  const _0x127e97 = (_0x267626, _0x2d5ded) => normalizeText(_0x267626) + ":" + normalizeText(_0x2d5ded);
  const _0x1f4c25 = (_0xaeb097, _0x40a13a) => (Array.isArray(_0xaeb097?.sources) ? _0xaeb097.sources : []).find(_0x105082 => normalizeText(_0x105082?.id) === normalizeText(_0x40a13a));
  const _0x3a528d = ({
    projectId: _0x3d5d5b,
    sourceId: _0x50cc43,
    requestId: _0x4d0afd,
    inputRevision: _0x173ecd
  }) => {
    const _0x4c4ebb = _0x3214d1();
    const _0x1ccd32 = _0x1f4c25(_0x4c4ebb, _0x50cc43);
    const _0x5494aa = resolvePersonReplacementVoiceSeparationState(_0x4c4ebb, _0x50cc43);
    return !_0x412710 && normalizeText(_0x4c4ebb?.id) === normalizeText(_0x3d5d5b) && normalizeText(_0x5494aa.requestId) === normalizeText(_0x4d0afd) && createPersonReplacementVoiceSeparationRevision({
      project: _0x4c4ebb,
      source: _0x1ccd32
    }) === _0x173ecd;
  };
  const _0x86e004 = (_0x4eedd6, _0x3d7077 = {}, {
    persistIdentity = false
  } = {}) => {
    if (!_0x3a528d(_0x4eedd6)) {
      return null;
    }
    const _0x4f45bc = _0x3214d1();
    const _0x1740ab = resolvePersonReplacementVoiceSeparationState(_0x4f45bc, _0x4eedd6.sourceId);
    const _0x3b9ad7 = normalizePersonReplacementVoiceSeparationState({
      ..._0x1740ab,
      ..._0x3d7077,
      sourceId: _0x4eedd6.sourceId,
      requestId: _0x4eedd6.requestId,
      inputRevision: _0x4eedd6.inputRevision
    });
    const _0x5eb8b9 = _0x4e7eca({
      ..._0x4f45bc,
      audio: updatePersonReplacementVoiceSeparationState(_0x4f45bc.audio, _0x3b9ad7)
    }, {
      renderWorkspace: false
    });
    onStateChange({
      sourceId: _0x4eedd6.sourceId,
      state: cloneJson(_0x3b9ad7),
      project: cloneJson(_0x5eb8b9 || _0x3214d1())
    });
    if (persistIdentity && _0x3b9ad7.taskId !== _0x1740ab.taskId) {
      Promise.resolve(persistNow()).catch(() => {});
    }
    return _0x3b9ad7;
  };
  const _0x44899c = ({
    project: _0x2ed419,
    source: _0x1458b9,
    requestId: _0x586f42,
    inputRevision: _0x5243ee
  }) => {
    const _0x57f085 = resolvePersonReplacementVoiceSeparationState(_0x2ed419, _0x1458b9.id);
    const _0xbecd7f = normalizePersonReplacementVoiceSeparationState({
      ..._0x57f085,
      sourceId: _0x1458b9.id,
      status: "submitting",
      requestId: _0x586f42,
      inputRevision: _0x5243ee,
      taskId: "",
      providerProfileId: "",
      startedAt: now(),
      completedAt: "",
      error: ""
    });
    const _0x3cb525 = _0x4e7eca({
      ..._0x2ed419,
      audio: updatePersonReplacementVoiceSeparationState(_0x2ed419.audio, _0xbecd7f)
    }, {
      renderWorkspace: false
    });
    onStateChange({
      sourceId: _0x1458b9.id,
      state: cloneJson(_0xbecd7f),
      project: cloneJson(_0x3cb525 || _0x3214d1())
    });
    return _0xbecd7f;
  };
  const _0x3fe686 = async ({
    projectId: _0x3115d3,
    sourceId: _0x3defd8,
    sourceVideoRef: _0x4cb0a9,
    requestId: _0x5029a2,
    inputRevision: _0x4e2f11,
    taskId = "",
    providerProfileId = "",
    resume = false,
    runtime: _0x14a6f0
  }) => {
    const _0x2d3f3d = {
      projectId: _0x3115d3,
      sourceId: _0x3defd8,
      requestId: _0x5029a2,
      inputRevision: _0x4e2f11
    };
    try {
      const _0x4b220d = resume ? await resumeSeparation(taskId, {
        providerProfileId: providerProfileId
      }, {
        signal: _0x14a6f0.abortController.signal,
        pollImmediately: true
      }) : await runSeparation({
        audioUrl: localPathToUrl(_0x4cb0a9) || _0x4cb0a9
      }, {
        signal: _0x14a6f0.abortController.signal,
        onTaskMeta: (_0x37805b = {}) => {
          _0x14a6f0.taskId = normalizeText(_0x37805b.taskId);
          _0x14a6f0.providerProfileId = normalizeText(_0x37805b.providerProfileId);
          _0x86e004(_0x2d3f3d, {
            status: "running",
            taskId: _0x14a6f0.taskId,
            providerProfileId: _0x14a6f0.providerProfileId
          }, {
            persistIdentity: true
          });
        },
        onTaskId: _0x19c3b2 => {
          _0x14a6f0.taskId = normalizeText(_0x19c3b2);
          _0x86e004(_0x2d3f3d, {
            status: "running",
            taskId: _0x14a6f0.taskId
          }, {
            persistIdentity: true
          });
        }
      });
      const _0x235da1 = resolveSeparationResultUrls(_0x4b220d);
      const [_0x38bec7, _0x599be6] = await Promise.all([persistSeparatedAudio(_0x235da1.vocalsAudioUrl, saveAudio), persistSeparatedAudio(_0x235da1.backgroundAudioUrl, saveAudio)]);
      if (!_0x3a528d(_0x2d3f3d)) {
        return null;
      }
      const _0x403498 = _0x86e004(_0x2d3f3d, {
        status: "succeeded",
        taskId: normalizeText(_0x4b220d?.taskId || _0x14a6f0.taskId),
        providerProfileId: _0x14a6f0.providerProfileId || providerProfileId,
        completedAt: now(),
        vocalsAudioRef: _0x38bec7.localPath,
        vocalsAudioUrl: _0x38bec7.localUrl,
        backgroundAudioRef: _0x599be6.localPath,
        backgroundAudioUrl: _0x599be6.localUrl,
        error: ""
      });
      showToast("清晰人声提取完成，已自动用于声音克隆。", "success");
      return _0x403498;
    } catch (_0x316f4d) {
      if (_0x14a6f0.abortController.signal.aborted || _0x412710) {
        return null;
      }
      const _0x49c8a1 = normalizeText(_0x316f4d?.message || _0x316f4d) || "清晰人声提取失败";
      const _0x2b578b = _0x86e004(_0x2d3f3d, {
        status: "failed",
        completedAt: now(),
        error: _0x49c8a1
      });
      showToast("清晰人声提取失败：" + _0x49c8a1, "error");
      return _0x2b578b;
    } finally {
      const _0x3907f2 = _0x127e97(_0x3115d3, _0x3defd8);
      if (_0x1043e2.get(_0x3907f2) === _0x14a6f0) {
        _0x1043e2.delete(_0x3907f2);
      }
    }
  };
  const _0x262e8f = ({
    project: _0x33ea89,
    source: _0x5aa0bb,
    state: _0x17e80b,
    resume = false
  }) => {
    const _0x4132b9 = normalizeText(_0x33ea89.id);
    const _0x4eddc1 = normalizeText(_0x5aa0bb.id);
    const _0x45bb16 = _0x127e97(_0x4132b9, _0x4eddc1);
    const _0x436c6d = _0x1043e2.get(_0x45bb16);
    if (_0x436c6d?.promise) {
      return _0x436c6d.promise;
    }
    const _0x482f27 = {
      abortController: new AbortController(),
      taskId: normalizeText(_0x17e80b.taskId),
      providerProfileId: normalizeText(_0x17e80b.providerProfileId),
      promise: null
    };
    _0x482f27.promise = _0x3fe686({
      projectId: _0x4132b9,
      sourceId: _0x4eddc1,
      sourceVideoRef: _0x5aa0bb.videoRef,
      requestId: _0x17e80b.requestId,
      inputRevision: _0x17e80b.inputRevision,
      taskId: _0x17e80b.taskId,
      providerProfileId: _0x17e80b.providerProfileId,
      resume: resume,
      runtime: _0x482f27
    });
    _0x1043e2.set(_0x45bb16, _0x482f27);
    return _0x482f27.promise;
  };
  const _0x1e1fd8 = (_0x281b5f = "") => {
    if (_0x412710) {
      return Promise.resolve(null);
    }
    const _0x58a5b8 = _0x3214d1();
    const _0x31a9d1 = _0x1f4c25(_0x58a5b8, _0x281b5f);
    if (!_0x31a9d1?.videoRef) {
      showToast("原始视频不可用，无法提取清晰人声。", "warn");
      return Promise.resolve(null);
    }
    const _0x5d2716 = resolvePersonReplacementVoiceSeparationState(_0x58a5b8, _0x31a9d1.id);
    if (isPersonReplacementVoiceSeparationActive(_0x5d2716)) {
      return _0x3b25d3(_0x31a9d1.id);
    }
    const _0x2b8632 = normalizeText(createId());
    const _0x4e0766 = createPersonReplacementVoiceSeparationRevision({
      project: _0x58a5b8,
      source: _0x31a9d1
    });
    const _0xef57c = _0x44899c({
      project: _0x58a5b8,
      source: _0x31a9d1,
      requestId: _0x2b8632,
      inputRevision: _0x4e0766
    });
    showToast("正在从原始视频中提取清晰人声…", "info");
    return _0x262e8f({
      project: _0x3214d1(),
      source: _0x31a9d1,
      state: _0xef57c
    });
  };
  const _0x3b25d3 = (_0x5031b3 = "") => {
    if (_0x412710) {
      return Promise.resolve(null);
    }
    const _0x4e4fa1 = _0x3214d1();
    const _0xe7fb96 = _0x1f4c25(_0x4e4fa1, _0x5031b3);
    const _0x59d215 = resolvePersonReplacementVoiceSeparationState(_0x4e4fa1, _0x5031b3);
    if (!_0xe7fb96?.videoRef || !isPersonReplacementVoiceSeparationActive(_0x59d215)) {
      return Promise.resolve(null);
    }
    const _0x261301 = createPersonReplacementVoiceSeparationRevision({
      project: _0x4e4fa1,
      source: _0xe7fb96
    });
    if (!_0x59d215.taskId || _0x59d215.inputRevision !== _0x261301) {
      const _0x2f2d1e = Boolean(_0x59d215.inputRevision && _0x59d215.inputRevision !== _0x261301);
      const _0x46a7f4 = normalizePersonReplacementVoiceSeparationState({
        ..._0x59d215,
        status: "failed",
        inputRevision: _0x261301,
        taskId: "",
        providerProfileId: "",
        completedAt: now(),
        error: "人声提取任务已中断，请重新提取。",
        ...(_0x2f2d1e ? {
          vocalsAudioRef: "",
          vocalsAudioUrl: "",
          backgroundAudioRef: "",
          backgroundAudioUrl: ""
        } : {})
      });
      const _0xbe6659 = _0x4e7eca({
        ..._0x4e4fa1,
        audio: updatePersonReplacementVoiceSeparationState(_0x4e4fa1.audio, _0x46a7f4)
      }, {
        renderWorkspace: false
      });
      onStateChange({
        sourceId: _0xe7fb96.id,
        state: cloneJson(_0x46a7f4),
        project: cloneJson(_0xbe6659 || _0x3214d1())
      });
      return Promise.resolve(null);
    }
    return _0x262e8f({
      project: _0x4e4fa1,
      source: _0xe7fb96,
      state: _0x59d215,
      resume: true
    });
  };
  const _0x512529 = async (_0x2a72d8 = "") => {
    if (_0x412710) {
      return false;
    }
    const _0x29e90e = _0x3214d1();
    const _0x1b8863 = _0x1f4c25(_0x29e90e, _0x2a72d8);
    const _0x2c1463 = resolvePersonReplacementVoiceSeparationState(_0x29e90e, _0x2a72d8);
    if (!_0x1b8863 || !isPersonReplacementVoiceSeparationActive(_0x2c1463)) {
      return false;
    }
    const _0x39b4f6 = {
      projectId: _0x29e90e.id,
      sourceId: _0x1b8863.id,
      requestId: _0x2c1463.requestId,
      inputRevision: _0x2c1463.inputRevision
    };
    const _0x17b033 = _0x127e97(_0x29e90e.id, _0x1b8863.id);
    const _0x1e8afa = _0x1043e2.get(_0x17b033);
    _0x1e8afa?.abortController?.abort?.();
    _0x1043e2.delete(_0x17b033);
    _0x86e004(_0x39b4f6, {
      status: "cancelled",
      completedAt: now(),
      error: ""
    });
    const _0x254f8f = normalizeText(_0x2c1463.taskId || _0x1e8afa?.taskId);
    if (_0x254f8f) {
      try {
        await cancelSeparation({
          taskId: _0x254f8f,
          providerProfileId: _0x2c1463.providerProfileId || _0x1e8afa?.providerProfileId || ""
        });
      } catch (_0x315daf) {
        console.warn("[replacementStudio] voice separation cancel failed", _0x315daf);
      }
    }
    showToast("已取消清晰人声提取。", "info");
    return true;
  };
  return Object.freeze({
    extract: _0x1e1fd8,
    resume: _0x3b25d3,
    cancel: _0x512529,
    destroy() {
      if (_0x412710) {
        return;
      }
      _0x412710 = true;
      _0x1043e2.forEach(_0x1efe2c => _0x1efe2c.abortController?.abort?.());
      _0x1043e2.clear();
    }
  });
}