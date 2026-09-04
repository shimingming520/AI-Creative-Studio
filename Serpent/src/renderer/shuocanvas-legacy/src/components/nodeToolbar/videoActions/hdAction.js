import { appendToolbarActionMenuTitle, createRunningHubActionIcon, createToolbarActionDescription, createToolbarActionMenuBody, createToolbarActionMenuItem, createToolbarActionTitle, createToolbarActionTitleRow, createToolbarActionVipBadge, createToolbarActionPopupAnchorPositionGetter, positionToolbarActionSubmenuAbove } from "../actionMenu.js";
import { t } from "../../../i18n/index.js";
import { showProviderApiKeyMissingToast } from "../../../modules/providerApiKeyMissingToast.js";
const VIDEO_HD_LEGACY_PROMPT_LABEL = "高清修复视频";
function videoHdText(_0x1b5970, _0x54659a = {}) {
  return t("nodeToolbar.videoHd." + _0x1b5970, _0x54659a);
}
function uniqueList(_0x102cee) {
  return Array.from(new Set(_0x102cee.map(_0x1f0771 => String(_0x1f0771 || "").trim()).filter(Boolean)));
}
function videoHdOptionTitle(_0x55c455) {
  return videoHdText("options." + _0x55c455.key + ".title");
}
function videoHdOptionDesc(_0x532f1e) {
  return videoHdText("options." + _0x532f1e.key + ".desc");
}
function videoHdOutputText(_0x470a44, {
  status = "",
  error = ""
} = {}) {
  const _0x2c7405 = videoHdText("outputText", {
    model: videoHdOptionTitle(_0x470a44),
    prompt: videoHdText("promptLabel")
  });
  const _0xdc8f91 = status ? videoHdText("outputTextWithStatus", {
    outputText: _0x2c7405,
    status: status
  }) : _0x2c7405;
  if (error) {
    return videoHdText("outputTextWithError", {
      outputText: _0xdc8f91,
      error: error
    });
  } else {
    return _0xdc8f91;
  }
}
export function bindVideoHdAction(_0x2dd84a) {
  const {
    toolbarEl: _0x2d5b37,
    nodeData: _0x167250,
    store: _0x2758f3,
    submitTask: _0x36950a,
    createRunningHubTaskStateMachine: _0x12cc74,
    runRunninghubAiApp: _0x5b01de,
    runRunninghubWorkflow: _0x9174b0,
    resumeRunninghubWorkflowTask: _0x478678,
    processInputVideos: _0x241223,
    getProviderConfig: _0x38510b,
    ensureConfig: _0xf60bc1,
    calcSafeSpawnPosNearNode: _0x34ce1b,
    buildSourceMediaNodePayload: _0x22eb8f,
    getAutoMediaSizeByShortSide: _0xc69680,
    buildCanvasLocalVideoFields: _0x293608,
    buildVideoGenerationFailurePatch: _0x964d99,
    buildVideoGenerationResultPatch: _0x2f117e,
    bindRunningHubToolbarTaskButton: _0x12c1d7,
    cancelRunningHubResultTask: _0x26d145,
    findRunningHubToolbarTaskForNode: _0x1ff724,
    isRunningHubToolbarTaskCancelled: _0x27aaea,
    notifyRunningHubToolbarTasksChanged: _0x2f5b26,
    RH_VIDEO_HD_BASIC_WORKFLOW_ID: _0x4dc8bc,
    RH_VIDEO_HD_VIP_MODEL_ID: _0x56d195,
    RH_VIDEO_HD_VIP_APP_ID: _0x2ab137,
    VIDEO_HD_STANDARD_INSTANCE_TYPE: _0x4d9ca9,
    VIDEO_HD_VIP_INSTANCE_TYPE: _0x415ec5,
    _getCurrentVideoUrl: _0x964080,
    _ensureVideoHdDurationAllowed: _0x1e6366,
    _ensureVideoHdVipAllowed: _0x16f7f0,
    _extractFirstUrl: _0x211f7d,
    _saveRemoteVideoResult: _0x44a76d
  } = _0x2dd84a;
  const _0x3c42eb = _0x12cc74();
  const _0x1e1103 = _0x3c42eb.state;
  const _0x27b8b5 = _0x2d5b37.querySelector(".act-hd");
  if (_0x27b8b5) {
    _0x3c42eb.bindButton(_0x27b8b5);
    _0x12c1d7({
      button: _0x27b8b5,
      getTask: () => _0x1ff724(_0x167250.id, {
        models: [_0x56d195, "runninghub/" + _0x4dc8bc],
        taskTypes: ["video-hd"],
        outputTextIncludes: uniqueList([VIDEO_HD_LEGACY_PROMPT_LABEL, videoHdText("promptLabel")])
      }),
      cancelTask: async _0x6cf4b5 => {
        try {
          if (_0x1e1103.active && String(_0x1e1103.outNodeId || "") === _0x6cf4b5.outId) {
            try {
              await _0x3c42eb.cancel();
            } catch (_0x505437) {
              console.warn("[VideoHD] cancel request failed:", _0x505437);
            }
          }
          return await _0x26d145(_0x6cf4b5, {
            name: videoHdText("cancelledName"),
            outputText: videoHdText("cancelledOutput", {
              model: videoHdText("modelFallback"),
              prompt: videoHdText("promptLabel"),
              status: videoHdText("status.cancelled")
            }),
            notifyMessage: videoHdText("cancelledToast")
          });
        } finally {
          if (_0x1e1103.active && String(_0x1e1103.outNodeId || "") === _0x6cf4b5.outId) {
            _0x3c42eb.reset(_0x27b8b5);
          }
        }
      },
      cancelTooltip: videoHdText("cancelTooltip")
    });
    _0x27b8b5.addEventListener("click", _0x3272e7 => {
      _0x3272e7.stopPropagation();
      _0x3272e7.preventDefault();
      if (_0x1e1103.active) {
        (async () => {
          let _0x2ceaaa = null;
          try {
            const _0x550f9c = _0x1e1103.outNodeId ? {
              outId: _0x1e1103.outNodeId,
              targetNodeId: _0x1e1103.outNodeId,
              taskId: _0x1e1103.taskId,
              apiKey: _0x1e1103.apiKey,
              sourceNodeId: _0x167250.id
            } : null;
            if (_0x550f9c) {
              await _0x26d145(_0x550f9c, {
                name: videoHdText("cancelledName"),
                outputText: videoHdText("cancelledOutput", {
                  model: videoHdText("modelFallback"),
                  prompt: videoHdText("promptLabel"),
                  status: videoHdText("status.cancelled")
                }),
                notifyMessage: videoHdText("cancelledToast")
              });
            } else {
              await _0x3c42eb.cancel();
              window.showToast?.(videoHdText("taskCancelled"), "info");
            }
          } catch (_0x327fc8) {
            _0x2ceaaa = _0x327fc8;
          }
          try {
            if (_0x2ceaaa) {
              console.warn("[VideoHD] cancel request failed:", _0x2ceaaa);
            }
          } finally {
            _0x3c42eb.reset(_0x27b8b5);
          }
        })();
        return;
      }
      const _0x2023ce = document.querySelector(".v2-hd-popup");
      if (_0x2023ce) {
        const _0x37a394 = _0x2023ce.__v2HdAnchorBtn && _0x2023ce.__v2HdAnchorBtn === _0x27b8b5;
        const _0x841135 = typeof _0x2023ce.__v2HdClose === "function" ? _0x2023ce.__v2HdClose : () => _0x2023ce.remove();
        _0x841135();
        if (_0x37a394) {
          return;
        }
      }
      const _0x20897b = document.createElement("div");
      _0x20897b.className = "v2-hd-popup node-toolbar-action-menu";
      _0x20897b.__v2HdAnchorBtn = _0x27b8b5;
      const _0x5b87a1 = createToolbarActionPopupAnchorPositionGetter(_0x27b8b5);
      const _0x465e1a = _0x5b87a1();
      Object.assign(_0x20897b.style, {
        position: "fixed",
        left: _0x465e1a.left + "px",
        top: _0x465e1a.top + "px",
        transform: "translateY(10px)",
        opacity: "0",
        pointerEvents: "none"
      });
      appendToolbarActionMenuTitle(_0x20897b, videoHdText("choosePlan"));
      let _0x765bd8 = () => {};
      let _0x55f3a1 = 0;
      const _0x59c036 = () => {
        if (!document.body.contains(_0x20897b)) {
          _0x765bd8();
          return;
        }
        if (_0x20897b.__v2HdClosing) {
          return;
        }
        _0x20897b.__v2HdClosing = true;
        _0x765bd8();
        _0x20897b.style.opacity = "0";
        _0x20897b.style.pointerEvents = "none";
        _0x20897b.style.transform = "translateY(10px)";
        const _0xb5ca = () => {
          _0x20897b.removeEventListener("transitionend", _0xb5ca);
          if (document.body.contains(_0x20897b)) {
            _0x20897b.remove();
          }
        };
        _0x20897b.addEventListener("transitionend", _0xb5ca);
        window.setTimeout(_0xb5ca, 280);
      };
      _0x20897b.__v2HdClose = _0x59c036;
      const _0x6d9b8b = [{
        key: "sharp",
        vip: false,
        model: _0x56d195,
        appId: _0x2ab137,
        index: "1",
        instanceType: _0x415ec5,
        useOpenapiQuery: true
      }, {
        key: "quality",
        vip: false,
        model: _0x56d195,
        appId: _0x2ab137,
        index: "0",
        instanceType: _0x415ec5,
        useOpenapiQuery: true
      }, {
        key: "basic",
        vip: false,
        model: "runninghub/" + _0x4dc8bc,
        workflowId: _0x4dc8bc,
        instanceType: _0x4d9ca9,
        useOpenapiQuery: false
      }];
      const _0x108a7f = _0x25c02f => {
        const _0x19475b = createToolbarActionMenuItem();
        _0x19475b.appendChild(createRunningHubActionIcon());
        const _0xa041f5 = createToolbarActionMenuBody();
        const _0xce6387 = createToolbarActionTitleRow();
        const _0x7bab1a = createToolbarActionTitle(videoHdOptionTitle(_0x25c02f));
        _0xce6387.appendChild(_0x7bab1a);
        if (_0x25c02f.vip) {
          _0xce6387.appendChild(createToolbarActionVipBadge());
        }
        _0xa041f5.appendChild(_0xce6387);
        _0xa041f5.appendChild(createToolbarActionDescription(videoHdOptionDesc(_0x25c02f)));
        _0x19475b.appendChild(_0xa041f5);
        _0x19475b.addEventListener("click", async _0x4943f7 => {
          _0x4943f7.stopPropagation();
          _0x59c036();
          let _0x367e51 = null;
          const _0xcdd3fb = Date.now();
          const _0x2a1906 = new AbortController();
          try {
            const _0xf2964c = _0x2758f3.getState().nodes?.[_0x167250.id];
            if (!_0xf2964c) {
              window.showToast?.(videoHdText("sourceNodeMissing"), "error");
              return;
            }
            const _0x598c02 = _0x964080();
            if (!_0x598c02) {
              window.showToast?.(videoHdText("noProcessableVideo"), "error");
              return;
            }
            if (!(await _0x1e6366(_0x598c02))) {
              return;
            }
            if (_0x25c02f.vip && !(await _0x16f7f0(_0x25c02f.model, () => {
              _0x19475b.dispatchEvent(new MouseEvent("click", {
                bubbles: true,
                cancelable: true
              }));
            }))) {
              return;
            }
            await _0xf60bc1();
            const _0x38b9a6 = _0x38510b("runninghubwf");
            const _0x31822f = String(_0x38b9a6?.apiKey || "").trim();
            const _0xed456e = String(_0x38b9a6?.providerProfileId || "").trim();
            const _0x4a6d91 = String(_0x38b9a6?.apiUrl || "").trim();
            if (!_0x31822f) {
              showProviderApiKeyMissingToast(videoHdText("apiKeyMissing"), {
                providerId: _0xed456e || "runninghubwf",
                type: "error"
              });
              return;
            }
            const _0x56a94c = _0xf2964c.width || 300;
            const _0x84b526 = _0xf2964c.height || 300;
            const {
              width: _0x23086c,
              height: _0x5452b5
            } = _0xc69680(_0x56a94c, _0x84b526);
            const {
              x: _0xcd6e9a,
              y: _0x36e919
            } = _0x34ce1b(_0x2758f3.getState().nodes, _0xf2964c, _0x23086c, _0x5452b5);
            _0x367e51 = "source-video-hd-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
            const _0x516316 = _0x25c02f.instanceType === _0x415ec5 ? _0x415ec5 : _0x4d9ca9;
            const _0x415166 = await _0x36950a({
              sourceNodeId: _0xf2964c.id,
              trigger: "toolbar",
              taskType: "video-hd",
              provider: "runninghubwf",
              adapterType: "workflow",
              modelId: _0x25c02f.model,
              executionId: _0x25c02f.appId ? "runninghub.ai-app." + _0x25c02f.appId : "runninghub.workflow." + _0x25c02f.workflowId,
              payload: {
                apiKey: _0x31822f,
                providerProfileId: _0xed456e,
                runningHubApiUrl: _0x4a6d91,
                inputVideoUrl: _0x598c02,
                option: _0x25c02f,
                instanceType: _0x516316
              },
              cancellable: true,
              resumable: true,
              pauseOnAbort: "afterTaskId",
              onTaskChange: ({
                sourceNodeId: _0x14db96,
                targetNodeId: _0x504706
              }) => _0x2f5b26({
                sourceNodeId: _0x14db96,
                outId: _0x504706
              }),
              createTargetNode: ({
                startPatch: _0x53fa12,
                protocolPatch: _0x1a292b
              }) => _0x22eb8f({
                id: _0x367e51,
                type: "source-video",
                x: _0xcd6e9a,
                y: _0x36e919,
                width: _0x23086c,
                height: _0x5452b5,
                name: videoHdText("processingName"),
                src: "",
                localPath: "",
                fileName: "hd_" + Date.now() + ".mp4",
                ..._0x53fa12,
                provider: "runninghubwf",
                model: _0x25c02f.model,
                rhTaskUseOpenapiQuery: _0x25c02f.useOpenapiQuery === true,
                ..._0x1a292b,
                outputText: videoHdOutputText(_0x25c02f)
              }),
              cancel: async ({
                taskId: _0x8adc3d
              }) => {
                if (!_0x31822f || !_0x8adc3d) {
                  return;
                }
                await _0x26d145({
                  outId: _0x367e51,
                  taskId: _0x8adc3d,
                  sourceNodeId: _0xf2964c.id,
                  apiKey: _0x31822f,
                  providerProfileId: _0xed456e
                }, {
                  name: videoHdText("cancelledName"),
                  outputText: videoHdText("cancelledOutput", {
                    model: videoHdText("modelFallback"),
                    prompt: videoHdText("promptLabel"),
                    status: videoHdText("status.cancelled")
                  }),
                  notify: false
                });
              },
              submit: async (_0x347c7e, _0x20abef) => {
                _0x3c42eb.activate({
                  button: _0x27b8b5,
                  apiKey: _0x31822f,
                  providerProfileId: _0xed456e,
                  abortController: _0x2a1906,
                  outNodeId: _0x20abef.targetNodeId
                });
                _0x2758f3.setSelectedNodes([_0x20abef.targetNodeId]);
                window.showToast?.(videoHdText("uploading"), "info");
                const _0x41cc28 = await _0x241223([_0x347c7e.inputVideoUrl], _0x347c7e.apiKey, {
                  apiUrl: _0x347c7e.runningHubApiUrl
                });
                const _0x197b35 = _0x41cc28[0];
                if (!_0x197b35) {
                  throw new Error(videoHdText("uploadNoDownloadUrl"));
                }
                if (_0x27aaea(_0x20abef.targetNodeId)) {
                  throw new Error("CANCELLED");
                }
                window.showToast?.(videoHdText("processingToast"), "info");
                const _0x3cef70 = _0x25c02f.appId ? [{
                  nodeId: "10",
                  fieldName: "index",
                  fieldValue: _0x25c02f.index,
                  description: "index"
                }, {
                  nodeId: "12",
                  fieldName: "video",
                  fieldValue: _0x197b35,
                  description: "video"
                }] : [{
                  nodeId: "9",
                  fieldName: "video",
                  fieldValue: _0x197b35
                }];
                const _0x1ee753 = _0x25c02f.appId ? await _0x5b01de({
                  apiKey: _0x347c7e.apiKey,
                  providerProfileId: _0x347c7e.providerProfileId,
                  runningHubApiUrl: _0x347c7e.runningHubApiUrl,
                  appId: _0x25c02f.appId,
                  nodeInfoList: _0x3cef70,
                  instanceType: _0x516316,
                  usePersonalQueue: "false"
                }, {
                  signal: _0x20abef.signal,
                  runningHubWorkflowQueueLease: _0x20abef.runningHubWorkflowQueueLease
                }) : await _0x9174b0({
                  apiKey: _0x347c7e.apiKey,
                  providerProfileId: _0x347c7e.providerProfileId,
                  runningHubApiUrl: _0x347c7e.runningHubApiUrl,
                  workflowId: _0x25c02f.workflowId,
                  addMetadata: false,
                  nodeInfoList: _0x3cef70,
                  instanceType: _0x516316,
                  usePersonalQueue: "false"
                }, {
                  signal: _0x20abef.signal,
                  runningHubWorkflowQueueLease: _0x20abef.runningHubWorkflowQueueLease
                });
                const _0x199130 = String(_0x1ee753?.data?.taskId || _0x1ee753?.data?.task_id || _0x1ee753?.taskId || _0x1ee753?.task_id || "").trim();
                if (!_0x199130) {
                  throw new Error(videoHdText("taskIdMissing"));
                }
                _0x3c42eb.setTaskId(_0x199130);
                _0x20abef.onTaskId?.(_0x199130);
                if (_0x3c42eb.isCancelled() || _0x27aaea(_0x20abef.targetNodeId)) {
                  await _0x26d145({
                    outId: _0x20abef.targetNodeId,
                    taskId: _0x199130,
                    sourceNodeId: _0xf2964c.id,
                    apiKey: _0x347c7e.apiKey,
                    providerProfileId: _0x347c7e.providerProfileId
                  }, {
                    name: videoHdText("cancelledName"),
                    outputText: videoHdText("cancelledOutput", {
                      model: videoHdText("modelFallback"),
                      prompt: videoHdText("promptLabel"),
                      status: videoHdText("status.cancelled")
                    }),
                    notify: false
                  });
                  throw new Error("CANCELLED");
                }
                return {
                  taskId: _0x199130
                };
              },
              poll: async ({
                taskId: _0x2fac7c,
                signal: _0x3f38d0,
                targetNodeId: _0x2642b2
              }) => {
                if (_0x3c42eb.isCancelled() || _0x27aaea(_0x2642b2)) {
                  throw new Error("CANCELLED");
                }
                const _0x541c7e = await _0x478678({
                  apiKey: _0x31822f,
                  taskId: _0x2fac7c,
                  providerProfileId: _0xed456e,
                  runningHubApiUrl: _0x4a6d91
                }, {
                  signal: _0x3f38d0,
                  useOpenapiQuery: _0x25c02f.useOpenapiQuery === true,
                  taskKind: "video"
                });
                const _0x588d54 = _0x211f7d(_0x541c7e);
                if (!_0x588d54) {
                  throw new Error(videoHdText("missingOutputUrl"));
                }
                if (_0x27aaea(_0x2642b2)) {
                  throw new Error("CANCELLED");
                }
                let _0x298d39 = "";
                try {
                  _0x298d39 = await _0x44a76d(_0x588d54);
                } catch {
                  throw new Error(videoHdText("localSaveFailed"));
                }
                if (_0x27aaea(_0x2642b2)) {
                  throw new Error("CANCELLED");
                }
                if (!_0x298d39) {
                  throw new Error(videoHdText("localSaveFailed"));
                }
                return {
                  resultUrl: _0x588d54,
                  localVideoFields: _0x293608({
                    localPath: _0x298d39,
                    videoUrl: _0x588d54
                  })
                };
              },
              resultBuilder: ({
                localVideoFields: _0x20cca4
              }, _0x5dd3a2) => {
                const _0x2e7b88 = Date.now() - Number(_0x5dd3a2.getTaskNode?.()?.generationStartTime || _0xcdd3fb);
                return {
                  name: videoHdText("resultName"),
                  ..._0x2f117e(_0x20cca4, {
                    duration: _0x2e7b88
                  }),
                  ..._0x20cca4,
                  fileName: "hd_" + Date.now() + ".mp4",
                  outputText: videoHdOutputText(_0x25c02f)
                };
              },
              failureBuilder: (_0x3f1679, _0x24361c) => {
                const _0x4afa19 = _0x3f1679 instanceof Error ? _0x3f1679.message : String(_0x3f1679 || "");
                const _0x1257b2 = Date.now() - Number(_0x24361c.getTaskNode?.()?.generationStartTime || _0xcdd3fb);
                return {
                  name: _0x4afa19 === videoHdText("localSaveFailed") ? videoHdText("resultName") : videoHdText("failedName"),
                  ..._0x964d99({
                    error: _0x4afa19,
                    duration: _0x1257b2
                  }),
                  ...(_0x4afa19 === videoHdText("localSaveFailed") ? {
                    src: "",
                    videoUrl: "",
                    localPath: "",
                    thumbUrl: "",
                    videoMetaSrc: "",
                    fileName: "hd_" + Date.now() + ".mp4",
                    rhStatusMessage: _0x4afa19
                  } : {}),
                  outputText: _0x4afa19 === videoHdText("localSaveFailed") ? videoHdOutputText(_0x25c02f) : videoHdOutputText(_0x25c02f, {
                    error: _0x4afa19
                  })
                };
              },
              cancelledBuilder: () => ({
                name: videoHdText("cancelledName"),
                outputText: videoHdOutputText(_0x25c02f, {
                  status: videoHdText("status.cancelled")
                })
              })
            }, {
              store: _0x2758f3,
              abortController: _0x2a1906,
              startedAt: _0xcdd3fb
            });
            if (_0x415166.status === "success") {
              window._triggerLocalCacheSave?.();
              window.showToast?.(videoHdText("successToast"), "success");
            } else if (_0x415166.status === "cancelled") {
              if (!_0x1e1103.cancelRequested) {
                window.showToast?.(videoHdText("taskCancelled"), "info");
              }
            } else if (_0x415166.status === "failed") {
              const _0x3eabed = _0x415166.error instanceof Error ? _0x415166.error.message : String(_0x415166.error || "");
              window.showToast?.(videoHdText("failedWithError", {
                error: _0x3eabed
              }), "error");
            }
          } catch (_0x3ac7a1) {
            const _0x1b3833 = _0x3ac7a1 instanceof Error ? _0x3ac7a1.message : String(_0x3ac7a1 || "");
            const _0x3cbe66 = _0x1e1103.cancelRequested || _0x3c42eb.isCancelled() || _0x1b3833 === "CANCELLED" || _0x1b3833 === videoHdText("taskCancelled") || _0x1b3833 === "任务已取消" || _0x1b3833.includes("aborted");
            if (_0x3cbe66) {
              if (!_0x1e1103.cancelRequested) {
                window.showToast?.(videoHdText("taskCancelled"), "info");
              }
            } else {
              window.showToast?.(videoHdText("failedWithError", {
                error: _0x1b3833
              }), "error");
            }
          } finally {
            _0x3c42eb.reset(_0x27b8b5);
          }
        });
        return _0x19475b;
      };
      _0x6d9b8b.forEach(_0x1f9260 => {
        _0x20897b.appendChild(_0x108a7f(_0x1f9260));
      });
      document.body.appendChild(_0x20897b);
      positionToolbarActionSubmenuAbove(_0x5b87a1(), _0x20897b);
      _0x20897b.offsetHeight;
      _0x20897b.style.pointerEvents = "auto";
      _0x20897b.style.opacity = "1";
      _0x20897b.style.transform = "translateY(0)";
      let _0x3d25cf = null;
      _0x765bd8 = () => {
        if (_0x55f3a1) {
          cancelAnimationFrame(_0x55f3a1);
          _0x55f3a1 = 0;
        }
        if (_0x3d25cf) {
          document.removeEventListener("pointerdown", _0x3d25cf, true);
          _0x3d25cf = null;
        }
      };
      const _0x5122f5 = () => {
        if (!document.body.contains(_0x20897b) || !document.body.contains(_0x27b8b5)) {
          _0x765bd8();
          return;
        }
        if (!_0x5b87a1.hasVisibleAnchor()) {
          _0x55f3a1 = requestAnimationFrame(_0x5122f5);
          return;
        }
        positionToolbarActionSubmenuAbove(_0x5b87a1(), _0x20897b);
        _0x55f3a1 = requestAnimationFrame(_0x5122f5);
      };
      _0x55f3a1 = requestAnimationFrame(_0x5122f5);
      _0x3d25cf = _0x320609 => {
        if (_0x20897b.__v2HdClosing) {
          return;
        }
        if (!_0x20897b.contains(_0x320609.target) && !_0x27b8b5.contains(_0x320609.target)) {
          _0x59c036();
        }
      };
      document.addEventListener("pointerdown", _0x3d25cf, true);
    });
  }
}
