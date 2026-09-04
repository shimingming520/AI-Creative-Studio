import { cancelTask as a383_0x4157e1, resumeTask as a383_0x8ae0ca, submitTask as a383_0x28f227 } from "../../core/generationTaskRuntime.js";
import { createGenerationCancelPlanFromNode, createGenerationResumePlanFromNode, createGenerationSubmitPlan } from "../../core/generationExecutionPlan.js";
import { buildRunningHubTaskPatch } from "../../core/generationTaskProtocolState.js";
import { shouldShowGenerationBusyUi } from "../../core/generationTaskUiState.js";
const DEFAULT_RUNTIME = Object.freeze({
  cancelTask: a383_0x4157e1,
  resumeTask: a383_0x8ae0ca,
  submitTask: a383_0x28f227
});
function normalizeProvider(_0x137a84, _0x423d23 = "runninghubwf") {
  return String(_0x137a84 || _0x423d23).trim().toLowerCase();
}
function isRunningHubProvider(_0x5b3b3f) {
  return _0x5b3b3f === "runninghubwf" || _0x5b3b3f === "runninghub";
}
function getResultPatch(_0x597f3e) {
  if (_0x597f3e?.patch && typeof _0x597f3e.patch === "object") {
    return _0x597f3e.patch;
  }
  if (_0x597f3e && typeof _0x597f3e === "object") {
    return _0x597f3e;
  } else {
    return {};
  }
}
function isAbortLike(_0x37db4f, _0x47433d) {
  return _0x47433d?.aborted === true || _0x37db4f?.name === "AbortError" || _0x37db4f?.message === "CANCELLED";
}
function throwIfAborted(_0x5a28fb) {
  if (_0x5a28fb?.aborted !== true) {
    return;
  }
  const _0x3b7397 = new Error("CANCELLED");
  _0x3b7397.name = "AbortError";
  throw _0x3b7397;
}
export function createAudioNodeTaskOrchestration(_0x542abd = {}) {
  const {
    nodeId: _0x213c66,
    store: _0x328d62,
    runtime = DEFAULT_RUNTIME,
    api = {},
    ensureConfig = async () => {},
    getProviderConfig = () => ({}),
    buildResultPatch = async () => ({}),
    afterResultCommit = () => {},
    persistTaskState = () => {},
    setBusyState = () => {},
    setLoading = () => {},
    onSuccess = () => {},
    onFailure = () => {},
    now = () => Date.now(),
    createAbortController = () => new AbortController(),
    messages = {}
  } = _0x542abd;
  if (!String(_0x213c66 || "").trim()) {
    throw new Error("[audioTaskOrchestration] nodeId is required");
  }
  if (!_0x328d62 || typeof _0x328d62.getState !== "function") {
    throw new Error("[audioTaskOrchestration] store is required");
  }
  let _0x45c80d = false;
  let _0x15cce8 = null;
  let _0x36eb30 = null;
  let _0x1e4f82 = null;
  let _0x288701 = null;
  let _0x55424e = "";
  let _0x4e50c0 = "";
  let _0x576cbb = "";
  let _0x365639 = "";
  let _0x3520ce = false;
  let _0x5945f1 = false;
  let _0x423187 = false;
  const _0x4f5113 = () => _0x328d62.getState()?.nodes?.[_0x213c66] || {};
  const _0x2d0bac = (_0x4864d7, _0x54cc73) => {
    if (typeof _0x4864d7?.updateTaskNode === "function") {
      return _0x4864d7.updateTaskNode(_0x54cc73);
    }
    _0x328d62.updateNodeData(_0x213c66, _0x54cc73);
    return true;
  };
  const _0x49b50a = (_0x56ac87, _0x3f20ae) => {
    const _0x5ab768 = messages[_0x56ac87];
    if (typeof _0x5ab768 === "function") {
      return _0x5ab768() || _0x3f20ae;
    }
    return _0x5ab768 || _0x3f20ae;
  };
  const _0x187c85 = (_0x11c076 = {}) => {
    try {
      const _0x445391 = persistTaskState(_0x11c076);
      _0x445391?.catch?.(() => {});
    } catch {}
  };
  const _0x2d54ac = () => {
    const _0x16890f = _0x4f5113();
    const _0x1feb5e = shouldShowGenerationBusyUi(_0x16890f);
    setBusyState({
      isGenerating: _0x1feb5e,
      cancelInFlight: _0x5945f1,
      taskId: String(_0x4e50c0 || _0x16890f.rhTaskId || _0x16890f.taskId || "")
    });
    setLoading(_0x1feb5e);
    return _0x1feb5e;
  };
  const _0x27bd5d = ({
    resetRecovering = false
  } = {}) => {
    if (_0x288701 && _0x288701.signal.aborted !== true) {
      _0x288701.abort();
    }
    _0x288701 = null;
    _0x55424e = "";
    _0x1e4f82 = null;
    if (resetRecovering && _0x4f5113().rhTaskRecovering === true) {
      _0x328d62.updateNodeData(_0x213c66, {
        rhTaskRecovering: false
      });
      _0x187c85({
        patch: {
          rhTaskRecovering: false
        }
      });
    }
  };
  const _0x1bc669 = async (_0x18a186, _0x5c51c8) => ({
    ...getResultPatch(await buildResultPatch(_0x18a186, _0x5c51c8.startedAt, _0x5c51c8)),
    rhStatusMessage: null,
    rhStatusCode: null
  });
  const _0x456b8b = _0x3bf294 => ({
    rhStatusMessage: _0x3bf294?.message || _0x49b50a("generationFailed", "Audio generation failed"),
    rhStatusCode: Number.isFinite(Number(_0x3bf294?.code)) ? Number(_0x3bf294.code) : null
  });
  const _0x4a96c8 = () => ({
    audioUrl: "",
    src: "",
    localPath: "",
    rhStatusMessage: _0x49b50a("interrupted", "Audio generation interrupted")
  });
  const _0x5093b0 = _0x2a9801 => {
    const _0x4aed2b = normalizeProvider(_0x2a9801.provider);
    const _0x354d99 = {
      provider: _0x2a9801.provider,
      audioWorkflowKey: _0x2a9801.audioWorkflowKey,
      audioWorkflowLabel: _0x2a9801.audioWorkflowLabel,
      model: _0x2a9801.audioWorkflowKey
    };
    if (isRunningHubProvider(_0x4aed2b)) {
      _0x354d99.rhTaskUseOpenapiQuery = true;
    }
    if (_0x4aed2b === "runninghubwf") {
      _0x354d99.rhInstanceType = _0x2a9801.rhInstanceType;
    }
    if (isRunningHubProvider(_0x4aed2b) && _0x2a9801.providerProfileId) {
      _0x354d99.providerProfileId = _0x2a9801.providerProfileId;
      _0x354d99.rhProviderProfileId = _0x2a9801.providerProfileId;
    }
    return _0x354d99;
  };
  async function _0x1a2919({
    payload: _0x11b788,
    startedAt = now()
  } = {}) {
    if (_0x45c80d) {
      return {
        ok: false,
        status: "disposed"
      };
    }
    if (_0x15cce8) {
      return _0x15cce8;
    }
    if (!_0x11b788 || typeof _0x11b788 !== "object") {
      throw new Error("[audioTaskOrchestration] payload is required");
    }
    _0x27bd5d({
      resetRecovering: true
    });
    const _0x35f91d = normalizeProvider(_0x11b788.provider);
    const _0x4cf942 = createAbortController();
    _0x36eb30 = _0x4cf942;
    _0x3520ce = false;
    _0x5945f1 = false;
    _0x423187 = false;
    _0x4e50c0 = "";
    _0x576cbb = String(_0x11b788.apiKey || "").trim();
    _0x365639 = String(_0x11b788.providerProfileId || _0x11b788.rhProviderProfileId || "").trim();
    setBusyState({
      isGenerating: true,
      cancelInFlight: false,
      taskId: ""
    });
    setLoading(true);
    const _0x427947 = createGenerationSubmitPlan({
      kind: "audio",
      sourceNodeId: _0x213c66,
      targetNodeId: _0x213c66,
      trigger: "node",
      taskType: "audio-generation",
      provider: _0x35f91d,
      adapterType: _0x11b788.adapterType || "workflow",
      modelId: _0x11b788.audioWorkflowKey || _0x4f5113().model || "",
      executionId: _0x11b788.executionId,
      payload: _0x11b788,
      cancellable: _0x35f91d !== "volcengine-speech",
      resumable: isRunningHubProvider(_0x35f91d),
      pauseOnAbort: isRunningHubProvider(_0x35f91d) ? "afterTaskId" : false,
      startBuilder: () => _0x5093b0(_0x11b788),
      persistTaskState: _0x187c85,
      submit: async (_0x3e5bac, _0x234902) => api.generateAudio(_0x11b788, {
        signal: _0x4cf942.signal,
        runningHubWorkflowQueueLease: _0x234902.runningHubWorkflowQueueLease,
        onTaskMeta: (_0x364247 = {}) => {
          const _0x36a8d3 = String(_0x364247.taskId || "").trim();
          if (!_0x36a8d3) {
            return;
          }
          _0x365639 = String(_0x364247.providerProfileId || _0x364247.rhProviderProfileId || _0x365639).trim();
          _0x4e50c0 = _0x36a8d3;
          _0x576cbb = String(_0x364247.apiKey || "").trim() || String(_0x11b788.apiKey || "").trim() || _0x576cbb;
          _0x234902.onTaskId(_0x36a8d3);
          _0x2d0bac(_0x234902, {
            rhTaskUseOpenapiQuery: _0x364247.useOpenapiQuery === true,
            ...(_0x365639 ? {
              taskProviderProfileId: _0x365639,
              providerProfileId: _0x365639,
              rhProviderProfileId: _0x365639
            } : {})
          });
          _0x187c85({
            taskId: _0x36a8d3
          });
          if (_0x3520ce && !_0x5945f1 && !_0x423187) {
            _0x5e23a3();
          }
        },
        onTaskId: _0x50ce3c => {
          const _0x3b37f7 = String(_0x50ce3c || "").trim();
          if (!_0x3b37f7) {
            return;
          }
          _0x4e50c0 = _0x3b37f7;
          _0x234902.onTaskId(_0x3b37f7);
          _0x2d0bac(_0x234902, {
            rhTaskUseOpenapiQuery: true
          });
          _0x187c85({
            taskId: _0x3b37f7
          });
          if (_0x3520ce && !_0x5945f1 && !_0x423187) {
            _0x5e23a3();
          }
        }
      }),
      cancel: async ({
        taskId: _0x366a2d
      }) => {
        const _0xd0e7f7 = String(_0x576cbb || _0x11b788.apiKey || "").trim();
        if (!_0xd0e7f7 || !_0x366a2d) {
          return;
        }
        _0x423187 = true;
        await api.cancelRunningHubAudioTask?.({
          apiKey: _0xd0e7f7,
          taskId: _0x366a2d,
          ...(_0x365639 || _0x11b788?.providerProfileId || _0x11b788?.rhProviderProfileId ? {
            providerProfileId: _0x365639 || _0x11b788?.providerProfileId || _0x11b788?.rhProviderProfileId
          } : {})
        });
      },
      resultBuilder: _0x1bc669,
      failureBuilder: _0x456b8b,
      cancelledBuilder: _0x4a96c8,
      parseError: _0x36e9ce => _0x36e9ce?.message || _0x49b50a("generationFailed", "Audio generation failed")
    });
    const _0x700f61 = runtime.submitTask(_0x427947, {
      store: _0x328d62,
      startedAt: startedAt,
      abortController: _0x4cf942
    }).then(async _0x370c99 => {
      if (_0x370c99?.status === "success" && !_0x45c80d && _0x4cf942.signal.aborted !== true) {
        const _0x41d5ee = getResultPatch(_0x370c99.patch || _0x4f5113());
        await afterResultCommit(_0x41d5ee, startedAt, _0x370c99);
        await onSuccess(_0x370c99, {
          recovering: false,
          payload: _0x11b788
        });
      } else if (_0x370c99?.status === "failed" && !_0x45c80d) {
        await onFailure(_0x370c99.error, {
          payload: _0x11b788,
          result: _0x370c99
        });
      }
      return _0x370c99;
    }).finally(() => {
      _0x15cce8 = null;
      if (_0x36eb30 === _0x4cf942) {
        _0x36eb30 = null;
      }
      const _0x214264 = _0x45c80d ? false : _0x2d54ac();
      if (!_0x214264) {
        _0x4e50c0 = "";
        if (!_0x3520ce) {
          _0x576cbb = "";
          _0x365639 = "";
        }
      }
      _0x3520ce = false;
      _0x5945f1 = false;
      _0x423187 = false;
    });
    _0x15cce8 = _0x700f61;
    return _0x700f61;
  }
  async function _0x5e23a3() {
    _0x3520ce = true;
    if (_0x5945f1) {
      return {
        ok: true,
        status: "cancelling"
      };
    }
    _0x5945f1 = true;
    const _0x57ed13 = _0x4f5113();
    const _0x43daf4 = String(_0x4e50c0 || _0x57ed13.rhTaskId || "").trim();
    _0x4e50c0 = _0x43daf4;
    let _0x135018 = String(_0x576cbb || "").trim();
    const _0x3d370b = String(_0x365639 || _0x57ed13.taskProviderProfileId || _0x57ed13.providerProfileId || _0x57ed13.rhProviderProfileId || "").trim();
    if (!_0x135018) {
      try {
        await ensureConfig();
        _0x135018 = String(getProviderConfig(_0x3d370b || "runninghubwf")?.apiKey || "").trim();
      } catch {}
    }
    _0x576cbb = _0x135018;
    const _0x53b003 = Number(_0x57ed13.generationStartTime || _0x57ed13.rhTaskStartedAt || 0);
    const _0x56b383 = _0x57ed13.generationDuration ?? (_0x53b003 > 0 ? Math.max(0, now() - _0x53b003) : 0);
    const _0x171a17 = createGenerationCancelPlanFromNode({
      kind: "audio",
      node: _0x57ed13,
      payload: _0x57ed13,
      sourceNodeId: _0x213c66,
      targetNodeId: _0x213c66,
      trigger: "node",
      taskType: "audio-generation",
      taskProtocol: "workflow",
      provider: normalizeProvider(_0x57ed13.provider),
      adapterType: _0x57ed13.adapterType || "workflow",
      modelId: _0x57ed13.audioWorkflowKey || _0x57ed13.model || "",
      executionId: _0x57ed13.executionId,
      taskId: _0x43daf4,
      startedAt: _0x53b003,
      cancellable: true,
      resumable: true,
      persistTaskState: _0x187c85
    });
    const _0xf965f = ({
      remoteResult: _0x4f0b81,
      remoteError: _0xbf41fc,
      startedAt: _0x4edc25
    } = {}) => {
      const _0x5b81ed = Number(_0x4f0b81?.code);
      const _0x2f291a = !_0x43daf4 ? _0x49b50a("interruptedMissingTaskId", "Audio generation interrupted before task id was available") : _0xbf41fc ? _0xbf41fc.message || _0x49b50a("cancelFailed", "Cancel failed") : _0x5b81ed === 0 ? _0x49b50a("cancelSuccess", "Cancelled") : _0x5b81ed === 807 ? _0x49b50a("cancelTaskMissing", "Task no longer exists") : _0x4f0b81?.msg || _0x49b50a("cancelFailed", "Cancel failed");
      return {
        audioUrl: "",
        src: "",
        localPath: "",
        generationDuration: _0x56b383,
        rhStatusMessage: _0x2f291a,
        rhStatusCode: !_0x43daf4 ? 813 : Number.isFinite(_0x5b81ed) ? _0x5b81ed : null,
        ...buildRunningHubTaskPatch({
          taskId: _0x43daf4,
          status: "cancelled",
          startedAt: Number(_0x4edc25 || _0x53b003 || 0),
          recovering: false,
          useOpenapiQuery: _0x57ed13.rhTaskUseOpenapiQuery === true
        })
      };
    };
    setBusyState({
      isGenerating: true,
      cancelInFlight: true,
      taskId: _0x43daf4
    });
    try {
      _0x423187 = true;
      return await runtime.cancelTask(_0x213c66, {
        store: _0x328d62,
        taskId: _0x43daf4,
        cancellable: true,
        cancel: async ({
          taskId: _0xa61938
        }) => {
          if (!_0x135018) {
            throw new Error(_0x49b50a("missingApiKey", "RunningHub API key is required"));
          }
          return api.cancelRunningHubAudioTask?.({
            apiKey: _0x135018,
            taskId: _0xa61938,
            ...(_0x3d370b || _0x57ed13?.providerProfileId || _0x57ed13?.rhProviderProfileId ? {
              providerProfileId: _0x3d370b || _0x57ed13?.providerProfileId || _0x57ed13?.rhProviderProfileId
            } : {})
          });
        },
        cancelledBuilder: _0xf965f,
        persistTaskState: _0x187c85,
        spec: {
          ..._0x171a17,
          cancelledBuilder: _0xf965f
        }
      });
    } finally {
      _0x5945f1 = false;
      _0x423187 = false;
      const _0x217c43 = _0x2d54ac();
      if (!_0x217c43) {
        _0x4e50c0 = "";
        _0x576cbb = "";
        _0x365639 = "";
        _0x3520ce = false;
      }
    }
  }
  async function _0x1ef653({
    payload: _0x50ab5f,
    startedAt: _0x111741
  } = {}) {
    if (_0x45c80d) {
      return {
        ok: false,
        status: "disposed"
      };
    }
    const _0x37474b = _0x4f5113();
    const _0x2c240c = normalizeProvider(_0x37474b.provider);
    const _0xdf9194 = String(_0x37474b.rhTaskId || "").trim();
    const _0x140478 = String(_0x37474b.rhTaskStatus || "").trim().toLowerCase();
    if (!isRunningHubProvider(_0x2c240c) || !_0xdf9194 || ["success", "failed", "idle", "cancelled", "canceled"].includes(_0x140478)) {
      _0x27bd5d();
      return null;
    }
    if (_0x55424e === _0xdf9194 && _0x1e4f82) {
      return _0x1e4f82;
    }
    if (!_0x50ab5f || typeof _0x50ab5f !== "object") {
      throw new Error("[audioTaskOrchestration] resume payload is required");
    }
    const _0x4c586b = Number(_0x111741 || _0x37474b.rhTaskStartedAt || _0x37474b.generationStartTime || now());
    const _0x1208f8 = createAbortController();
    _0x288701 = _0x1208f8;
    _0x55424e = _0xdf9194;
    _0x4e50c0 = _0xdf9194;
    const _0x2bb3e8 = String(_0x37474b.taskProviderProfileId || _0x37474b.providerProfileId || _0x37474b.rhProviderProfileId || _0x50ab5f.providerProfileId || _0x50ab5f.rhProviderProfileId || "").trim();
    _0x365639 = _0x2bb3e8;
    const _0x3005cf = {
      ..._0x50ab5f,
      ...(_0x2bb3e8 ? {
        providerProfileId: _0x2bb3e8,
        rhProviderProfileId: _0x2bb3e8
      } : {})
    };
    let _0x2b4bb6 = String(_0x50ab5f.apiKey || _0x576cbb || "").trim();
    if (!_0x2b4bb6) {
      try {
        await ensureConfig();
        _0x2b4bb6 = String(getProviderConfig(_0x2bb3e8 || "runninghubwf")?.apiKey || "").trim();
      } catch {}
    }
    _0x576cbb = _0x2b4bb6;
    setBusyState({
      isGenerating: true,
      cancelInFlight: false,
      taskId: _0xdf9194
    });
    setLoading(true);
    const _0x21368f = createGenerationResumePlanFromNode({
      kind: "audio",
      node: _0x37474b,
      payload: _0x3005cf,
      sourceNodeId: _0x213c66,
      targetNodeId: _0x213c66,
      trigger: "node",
      taskType: "audio-generation",
      taskProtocol: "workflow",
      provider: normalizeProvider(_0x3005cf.provider, _0x2c240c),
      adapterType: _0x3005cf.adapterType || "workflow",
      modelId: _0x3005cf.audioWorkflowKey || _0x37474b.model || "",
      executionId: _0x3005cf.executionId,
      taskId: _0xdf9194,
      startedAt: _0x4c586b,
      cancellable: true,
      resumable: true,
      pauseOnAbort: true,
      startBuilder: () => _0x5093b0(_0x3005cf),
      persistTaskState: _0x187c85,
      poll: async () => {
        throwIfAborted(_0x1208f8.signal);
        return api.resumeRunningHubAudioTask(_0xdf9194, _0x3005cf, {
          signal: _0x1208f8.signal,
          useOpenapiQuery: true
        });
      },
      resultBuilder: async (_0x3909ae, _0x423e92) => ({
        ...(await _0x1bc669(_0x3909ae, _0x423e92)),
        rhStatusMessage: null,
        rhStatusCode: null,
        ...buildRunningHubTaskPatch({
          taskId: _0xdf9194,
          status: "success",
          startedAt: _0x423e92.startedAt,
          recovering: false,
          useOpenapiQuery: true
        })
      }),
      failureBuilder: (_0x4e2145, _0x1340cf) => ({
        ..._0x456b8b(_0x4e2145),
        ...buildRunningHubTaskPatch({
          taskId: _0xdf9194,
          status: "failed",
          startedAt: _0x1340cf.startedAt,
          recovering: false,
          useOpenapiQuery: true
        })
      }),
      cancelledBuilder: _0x195117 => ({
        ..._0x4a96c8(),
        ...buildRunningHubTaskPatch({
          taskId: _0xdf9194,
          status: "cancelled",
          startedAt: _0x195117.startedAt,
          recovering: false,
          useOpenapiQuery: true
        })
      }),
      parseError: _0x5aa3ff => _0x5aa3ff?.message || _0x49b50a("generationFailed", "Audio generation failed")
    });
    const _0x137195 = runtime.resumeTask(_0x21368f, {
      store: _0x328d62,
      startedAt: _0x4c586b,
      abortController: _0x1208f8
    }).then(async _0x517a25 => {
      if (_0x517a25?.status === "success" && !_0x45c80d && _0x1208f8.signal.aborted !== true) {
        const _0x4722e5 = getResultPatch(_0x517a25.patch || _0x4f5113());
        await afterResultCommit(_0x4722e5, _0x4c586b, _0x517a25);
        await onSuccess(_0x517a25, {
          recovering: true,
          payload: _0x3005cf
        });
      } else if (_0x517a25?.status === "failed" && !_0x45c80d) {
        await onFailure(_0x517a25.error, {
          payload: _0x3005cf,
          result: _0x517a25,
          recovering: true
        });
      }
      return _0x517a25;
    }).catch(_0x3ca093 => {
      if (isAbortLike(_0x3ca093, _0x1208f8.signal)) {
        return {
          ok: true,
          status: "pending",
          paused: true
        };
      }
      throw _0x3ca093;
    }).finally(() => {
      if (_0x288701 === _0x1208f8) {
        _0x288701 = null;
      }
      if (_0x55424e === _0xdf9194) {
        _0x55424e = "";
      }
      _0x1e4f82 = null;
      const _0x301a48 = _0x45c80d ? false : _0x2d54ac();
      if (!_0x301a48) {
        _0x4e50c0 = "";
      }
    });
    _0x1e4f82 = _0x137195;
    return _0x137195;
  }
  function _0x28254a() {
    const _0x2f4764 = _0x4f5113();
    const _0x25b120 = String(_0x2f4764.jobStatus || _0x2f4764.rhTaskStatus || (_0x15cce8 || _0x1e4f82 ? "running" : "idle"));
    return {
      nodeId: _0x213c66,
      jobStatus: _0x25b120,
      isGenerating: !!_0x15cce8 || !!_0x1e4f82 || _0x25b120 === "running" || _0x25b120 === "pending",
      taskId: String(_0x4e50c0 || _0x2f4764.rhTaskId || _0x2f4764.taskId || ""),
      cancellable: true,
      resumable: Boolean(_0x2f4764.rhTaskId),
      cancelInFlight: _0x5945f1
    };
  }
  function _0x453f86({
    preserveTask = false
  } = {}) {
    _0x45c80d = true;
    if (!preserveTask && _0x36eb30 && !_0x36eb30.signal.aborted) {
      _0x36eb30.abort();
    }
    _0x36eb30 = null;
    if (!preserveTask) {
      _0x27bd5d();
    }
  }
  return Object.freeze({
    runGeneration: _0x1a2919,
    cancelGeneration: _0x5e23a3,
    getGenerationStatus: _0x28254a,
    resetRecovery: _0x27bd5d,
    resumeIfNeeded: _0x1ef653,
    dispose: _0x453f86
  });
}