import { RH_VIDEO_FRAME_INTERPOLATION_MODEL_ID, resolveModelExecution } from "../../../manifests/index.js";
import { t } from "../../../i18n/index.js";
import { showProviderApiKeyMissingToast } from "../../../modules/providerApiKeyMissingToast.js";
function frameInterpolationText(_0x5b1577, _0x27f307 = {}) {
  return t("nodeToolbar.videoFrameInterpolation." + _0x5b1577, _0x27f307);
}
function uniqueList(_0x248361) {
  return Array.from(new Set(_0x248361.map(_0x3f62aa => String(_0x3f62aa || "").trim()).filter(Boolean)));
}
function getFrameTaskOutputText(_0x55b270, {
  error = ""
} = {}) {
  const _0x54b6a9 = frameInterpolationText("outputText", {
    model: frameInterpolationText("modelLabel"),
    status: _0x55b270
  });
  if (error) {
    return frameInterpolationText("outputTextWithError", {
      outputText: _0x54b6a9,
      error: error
    });
  } else {
    return _0x54b6a9;
  }
}
function getFrameTaskOutputTextIncludes(_0x5b5819) {
  return uniqueList([...(_0x5b5819?.toolbarTaskOutputTextIncludes || []), frameInterpolationText("modelLabel")]);
}
function getVideoFrameInterpolationConfig() {
  const _0x5c6c99 = resolveModelExecution(RH_VIDEO_FRAME_INTERPOLATION_MODEL_ID);
  const _0x4124fe = _0x5c6c99?.modelManifest?.extensions?.videoFrameInterpolation || null;
  const _0x18a140 = _0x5c6c99?.executionManifest?.mapping?.sourceVideoNode || null;
  const _0x34d13b = String(_0x5c6c99?.executionManifest?.appId || _0x5c6c99?.executionManifest?.workflowId || "").trim();
  const _0x2002eb = String(_0x4124fe?.taskType || "").trim();
  if (!_0x5c6c99 || !_0x4124fe || !_0x18a140 || !_0x34d13b || !_0x2002eb) {
    throw new Error("Video frame interpolation manifest extension missing");
  }
  return {
    modelId: _0x5c6c99.modelManifest.modelId,
    provider: _0x5c6c99.modelManifest.provider,
    adapterType: _0x5c6c99.modelManifest.adapterType,
    executionId: _0x5c6c99.executionManifest.id,
    appId: _0x34d13b,
    taskType: _0x2002eb,
    toolbarTaskOutputTextIncludes: Array.isArray(_0x4124fe.toolbarTaskOutputTextIncludes) ? _0x4124fe.toolbarTaskOutputTextIncludes.map(_0xf92a53 => String(_0xf92a53 || "").trim()).filter(Boolean) : [],
    sourceVideoNode: _0x18a140,
    instanceType: _0x5c6c99.executionManifest.instanceType?.defaultValue || "default"
  };
}
export function bindVideoFrameInterpolationAction(_0x399be5) {
  const {
    toolbarEl: _0x4a3ed5,
    nodeData: _0x22d0fe,
    store: _0x2ec4f9,
    submitTask: _0x5f2d01,
    createRunningHubTaskStateMachine: _0x23ec03,
    runRunninghubAiApp: _0x369b1c,
    resumeRunninghubWorkflowTask: _0x61fed7,
    processInputVideos: _0x4ca19c,
    getProviderConfig: _0x359e97,
    ensureConfig: _0x3c5703,
    calcSafeSpawnPosNearNode: _0x27dad4,
    buildSourceMediaNodePayload: _0x457b4f,
    getAutoMediaSizeByShortSide: _0x35026a,
    buildCanvasLocalVideoFields: _0x106760,
    buildVideoGenerationFailurePatch: _0x118812,
    buildVideoGenerationResultPatch: _0x2bf2cb,
    bindRunningHubToolbarTaskButton: _0x1cdfac,
    cancelRunningHubResultTask: _0x2acbbf,
    findRunningHubToolbarTaskForNode: _0x185d4a,
    isRunningHubToolbarTaskCancelled: _0x7d8238,
    notifyRunningHubToolbarTasksChanged: _0x1ddb9d,
    _getCurrentVideoUrl: _0x3868ba,
    _ensureVideoHdDurationAllowed: _0x1a9520,
    _extractFirstUrl: _0xe62523,
    _saveRemoteVideoResult: _0x123c3c
  } = _0x399be5;
  const _0x27dcb8 = getVideoFrameInterpolationConfig();
  const _0x49a80f = _0x23ec03();
  const _0xeff83a = _0x49a80f.state;
  const _0x1c1ed6 = _0x4a3ed5.querySelector(".act-replace");
  if (_0x1c1ed6) {
    _0x49a80f.bindButton(_0x1c1ed6);
    _0x1cdfac({
      button: _0x1c1ed6,
      getTask: () => _0x185d4a(_0x22d0fe.id, {
        models: [_0x27dcb8.modelId],
        taskTypes: [_0x27dcb8.taskType],
        outputTextIncludes: getFrameTaskOutputTextIncludes(_0x27dcb8)
      }),
      cancelTask: async _0x53ae33 => {
        try {
          if (_0xeff83a.active && String(_0xeff83a.outNodeId || "") === _0x53ae33.outId) {
            try {
              await _0x49a80f.cancel();
            } catch (_0x231724) {
              console.warn("[VideoFrameInterpolation] cancel request failed:", _0x231724);
            }
          }
          return await _0x2acbbf(_0x53ae33, {
            name: frameInterpolationText("cancelledName"),
            outputText: getFrameTaskOutputText(frameInterpolationText("status.cancelled")),
            notifyMessage: frameInterpolationText("cancelledToast")
          });
        } finally {
          if (_0xeff83a.active && String(_0xeff83a.outNodeId || "") === _0x53ae33.outId) {
            _0x49a80f.reset(_0x1c1ed6);
          }
        }
      },
      cancelTooltip: frameInterpolationText("cancelTooltip")
    });
    _0x1c1ed6.addEventListener("click", _0x2b3a2b => {
      _0x2b3a2b.stopPropagation();
      _0x2b3a2b.preventDefault();
      if (_0xeff83a.active) {
        (async () => {
          let _0x425e87 = null;
          try {
            const _0x262591 = _0xeff83a.outNodeId ? {
              outId: _0xeff83a.outNodeId,
              targetNodeId: _0xeff83a.outNodeId,
              taskId: _0xeff83a.taskId,
              apiKey: _0xeff83a.apiKey,
              sourceNodeId: _0x22d0fe.id
            } : null;
            if (_0x262591) {
              await _0x2acbbf(_0x262591, {
                name: frameInterpolationText("cancelledName"),
                outputText: getFrameTaskOutputText(frameInterpolationText("status.cancelled")),
                notifyMessage: frameInterpolationText("cancelledToast")
              });
            } else {
              await _0x49a80f.cancel();
              window.showToast?.(frameInterpolationText("taskCancelled"), "info");
            }
          } catch (_0x1eef4f) {
            _0x425e87 = _0x1eef4f;
          }
          try {
            if (_0x425e87) {
              console.warn("[VideoFrameInterpolation] cancel request failed:", _0x425e87);
            }
          } finally {
            _0x49a80f.reset(_0x1c1ed6);
          }
        })();
        return;
      }
      (async () => {
        let _0xc222bd = null;
        const _0x146850 = Date.now();
        const _0x1de7bc = new AbortController();
        try {
          const _0x53a06f = _0x2ec4f9.getState().nodes?.[_0x22d0fe.id];
          if (!_0x53a06f) {
            window.showToast?.(frameInterpolationText("sourceNodeMissing"), "error");
            return;
          }
          const _0x3e379a = _0x3868ba();
          if (!_0x3e379a) {
            window.showToast?.(frameInterpolationText("noProcessableVideo"), "error");
            return;
          }
          if (!(await _0x1a9520(_0x3e379a))) {
            return;
          }
          await _0x3c5703();
          const _0x25c51d = _0x359e97("runninghubwf");
          const _0x44f7b8 = String(_0x25c51d?.apiKey || "").trim();
          const _0xd5facc = String(_0x25c51d?.providerProfileId || "").trim();
          const _0x35b9ba = String(_0x25c51d?.apiUrl || "").trim();
          if (!_0x44f7b8) {
            showProviderApiKeyMissingToast(frameInterpolationText("apiKeyMissing"), {
              providerId: _0xd5facc || "runninghubwf",
              type: "error"
            });
            return;
          }
          const _0x173632 = _0x53a06f.width || 300;
          const _0xead42b = _0x53a06f.height || 300;
          const {
            width: _0x4f2352,
            height: _0x27c8e0
          } = _0x35026a(_0x173632, _0xead42b);
          const {
            x: _0x3caa0e,
            y: _0x5902eb
          } = _0x27dad4(_0x2ec4f9.getState().nodes, _0x53a06f, _0x4f2352, _0x27c8e0);
          _0xc222bd = "source-video-frame-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
          const _0x325358 = await _0x5f2d01({
            sourceNodeId: _0x53a06f.id,
            trigger: "toolbar",
            taskType: _0x27dcb8.taskType,
            provider: _0x27dcb8.provider,
            adapterType: _0x27dcb8.adapterType,
            modelId: _0x27dcb8.modelId,
            executionId: _0x27dcb8.executionId,
            payload: {
              apiKey: _0x44f7b8,
              providerProfileId: _0xd5facc,
              runningHubApiUrl: _0x35b9ba,
              inputVideoUrl: _0x3e379a,
              appId: _0x27dcb8.appId
            },
            cancellable: true,
            resumable: true,
            pauseOnAbort: "afterTaskId",
            onTaskChange: ({
              sourceNodeId: _0x14d08b,
              targetNodeId: _0x32934b
            }) => _0x1ddb9d({
              sourceNodeId: _0x14d08b,
              outId: _0x32934b
            }),
            createTargetNode: ({
              startPatch: _0x58e5c9,
              protocolPatch: _0x3e0553
            }) => _0x457b4f({
              id: _0xc222bd,
              type: "source-video",
              x: _0x3caa0e,
              y: _0x5902eb,
              width: _0x4f2352,
              height: _0x27c8e0,
              name: frameInterpolationText("processingName"),
              src: "",
              localPath: "",
              fileName: "frame_" + Date.now() + ".mp4",
              ..._0x58e5c9,
              provider: _0x27dcb8.provider,
              model: _0x27dcb8.modelId,
              rhTaskUseOpenapiQuery: true,
              ..._0x3e0553,
              outputText: getFrameTaskOutputText(frameInterpolationText("status.processing"))
            }),
            cancel: async ({
              taskId: _0x3836fc
            }) => {
              if (!_0x44f7b8 || !_0x3836fc) {
                return;
              }
              await _0x2acbbf({
                outId: _0xc222bd,
                taskId: _0x3836fc,
                sourceNodeId: _0x53a06f.id,
                apiKey: _0x44f7b8,
                providerProfileId: _0xd5facc
              }, {
                name: frameInterpolationText("cancelledName"),
                outputText: getFrameTaskOutputText(frameInterpolationText("status.cancelled")),
                notify: false
              });
            },
            submit: async (_0x49b3d4, _0x19df70) => {
              _0x49a80f.activate({
                button: _0x1c1ed6,
                apiKey: _0x44f7b8,
                providerProfileId: _0xd5facc,
                abortController: _0x1de7bc,
                outNodeId: _0x19df70.targetNodeId
              });
              _0x2ec4f9.setSelectedNodes([_0x19df70.targetNodeId]);
              window.showToast?.(frameInterpolationText("uploading"), "info");
              const _0x33323d = await _0x4ca19c([_0x49b3d4.inputVideoUrl], _0x49b3d4.apiKey, {
                apiUrl: _0x49b3d4.runningHubApiUrl
              });
              const _0x210cbb = _0x33323d[0];
              if (!_0x210cbb) {
                throw new Error(frameInterpolationText("uploadNoDownloadUrl"));
              }
              if (_0x7d8238(_0x19df70.targetNodeId)) {
                throw new Error("CANCELLED");
              }
              window.showToast?.(frameInterpolationText("processingToast"), "info");
              const _0x5b30d6 = await _0x369b1c({
                apiKey: _0x49b3d4.apiKey,
                providerProfileId: _0x49b3d4.providerProfileId,
                runningHubApiUrl: _0x49b3d4.runningHubApiUrl,
                appId: _0x49b3d4.appId,
                nodeInfoList: [{
                  nodeId: String(_0x27dcb8.sourceVideoNode.nodeId || ""),
                  fieldName: String(_0x27dcb8.sourceVideoNode.fieldName || ""),
                  fieldValue: _0x210cbb,
                  description: String(_0x27dcb8.sourceVideoNode.description || _0x27dcb8.sourceVideoNode.fieldName || "video")
                }],
                instanceType: _0x27dcb8.instanceType,
                usePersonalQueue: "false"
              }, {
                signal: _0x19df70.signal,
                runningHubWorkflowQueueLease: _0x19df70.runningHubWorkflowQueueLease
              });
              const _0x1266f0 = String(_0x5b30d6?.data?.taskId || _0x5b30d6?.data?.task_id || _0x5b30d6?.taskId || _0x5b30d6?.task_id || "").trim();
              if (!_0x1266f0) {
                throw new Error(frameInterpolationText("taskIdMissing"));
              }
              _0x49a80f.setTaskId(_0x1266f0);
              _0x19df70.onTaskId?.(_0x1266f0);
              if (_0x49a80f.isCancelled() || _0x7d8238(_0x19df70.targetNodeId)) {
                await _0x2acbbf({
                  outId: _0x19df70.targetNodeId,
                  taskId: _0x1266f0,
                  sourceNodeId: _0x53a06f.id,
                  apiKey: _0x49b3d4.apiKey,
                  providerProfileId: _0x49b3d4.providerProfileId
                }, {
                  name: frameInterpolationText("cancelledName"),
                  outputText: getFrameTaskOutputText(frameInterpolationText("status.cancelled")),
                  notify: false
                });
                throw new Error("CANCELLED");
              }
              return {
                taskId: _0x1266f0
              };
            },
            poll: async ({
              taskId: _0x4e8cd0,
              signal: _0x3329d6,
              targetNodeId: _0x110771
            }) => {
              const _0x396ea3 = await _0x61fed7({
                apiKey: _0x44f7b8,
                taskId: _0x4e8cd0,
                providerProfileId: _0xd5facc,
                runningHubApiUrl: _0x35b9ba
              }, {
                signal: _0x3329d6,
                useOpenapiQuery: true
              });
              if (_0x7d8238(_0x110771)) {
                throw new Error("CANCELLED");
              }
              const _0x5f4944 = _0xe62523(_0x396ea3);
              if (!_0x5f4944) {
                throw new Error(frameInterpolationText("missingOutputUrl"));
              }
              const _0x58d059 = await _0x123c3c(_0x5f4944);
              if (_0x7d8238(_0x110771)) {
                throw new Error("CANCELLED");
              }
              if (!_0x58d059) {
                throw new Error(frameInterpolationText("localSaveFailed"));
              }
              return {
                resultUrl: _0x5f4944,
                localVideoFields: _0x106760({
                  localPath: _0x58d059,
                  videoUrl: _0x5f4944
                })
              };
            },
            resultBuilder: ({
              localVideoFields: _0x4f2e7a
            }, _0x23da8d) => {
              const _0x23dd14 = Date.now() - Number(_0x23da8d.getTaskNode?.()?.generationStartTime || _0x146850);
              return {
                name: frameInterpolationText("resultName"),
                ..._0x2bf2cb(_0x4f2e7a, {
                  duration: _0x23dd14
                }),
                ..._0x4f2e7a,
                fileName: "frame_" + Date.now() + ".mp4",
                outputText: getFrameTaskOutputText(frameInterpolationText("status.complete"))
              };
            },
            failureBuilder: (_0x4bb8fc, _0x49d1f2) => {
              const _0x527b8e = _0x4bb8fc instanceof Error ? _0x4bb8fc.message : String(_0x4bb8fc || "");
              const _0x402fe3 = Date.now() - Number(_0x49d1f2.getTaskNode?.()?.generationStartTime || _0x146850);
              return {
                name: _0x527b8e === frameInterpolationText("localSaveFailed") ? frameInterpolationText("resultName") : frameInterpolationText("failedName"),
                ..._0x118812({
                  error: _0x527b8e,
                  duration: _0x402fe3
                }),
                ...(_0x527b8e === frameInterpolationText("localSaveFailed") ? {
                  src: "",
                  videoUrl: "",
                  localPath: "",
                  thumbUrl: "",
                  videoMetaSrc: "",
                  fileName: "frame_" + Date.now() + ".mp4",
                  rhStatusMessage: _0x527b8e
                } : {}),
                outputText: _0x527b8e === frameInterpolationText("localSaveFailed") ? getFrameTaskOutputText(frameInterpolationText("status.failed")) : getFrameTaskOutputText(frameInterpolationText("status.failed"), {
                  error: _0x527b8e
                })
              };
            },
            cancelledBuilder: () => ({
              name: frameInterpolationText("cancelledName"),
              outputText: getFrameTaskOutputText(frameInterpolationText("status.cancelled"))
            })
          }, {
            store: _0x2ec4f9,
            abortController: _0x1de7bc,
            startedAt: _0x146850
          });
          if (_0x325358.status === "success") {
            window._triggerLocalCacheSave?.();
            window.showToast?.(frameInterpolationText("successToast"), "success");
          } else if (_0x325358.status === "cancelled") {
            if (!_0xeff83a.cancelRequested) {
              window.showToast?.(frameInterpolationText("taskCancelled"), "info");
            }
          } else if (_0x325358.status === "failed") {
            const _0x49db1f = _0x325358.error instanceof Error ? _0x325358.error.message : String(_0x325358.error || "");
            window.showToast?.(frameInterpolationText("failedWithError", {
              error: _0x49db1f
            }), "error");
          }
        } catch (_0x3c905a) {
          const _0x3c813b = _0x3c905a instanceof Error ? _0x3c905a.message : String(_0x3c905a || "");
          const _0x27e861 = _0xeff83a.cancelRequested || _0x49a80f.isCancelled() || _0x3c813b === "CANCELLED" || _0x3c813b === frameInterpolationText("taskCancelled") || _0x3c813b === "任务已取消" || _0x3c813b.includes("aborted");
          if (_0x27e861) {
            if (!_0xeff83a.cancelRequested) {
              window.showToast?.(frameInterpolationText("taskCancelled"), "info");
            }
          } else {
            window.showToast?.(frameInterpolationText("failedWithError", {
              error: _0x3c813b
            }), "error");
          }
        } finally {
          _0x49a80f.reset(_0x1c1ed6);
        }
      })();
    });
  }
}