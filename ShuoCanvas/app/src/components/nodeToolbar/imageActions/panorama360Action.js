import { t } from "../../../i18n/index.js";
import { showProviderApiKeyMissingToast } from "../../../modules/providerApiKeyMissingToast.js";
const PANORAMA360_LEGACY_LABELS = Object.freeze(["360°全景图", "360全景图"]);
function panorama360Text(_0x41764f, _0x3a0727 = {}) {
  return t("nodeToolbar.panorama360." + _0x41764f, _0x3a0727);
}
function uniqueList(_0x3446db) {
  return Array.from(new Set(_0x3446db.map(_0x450c21 => String(_0x450c21 || "").trim()).filter(Boolean)));
}
function panorama360OutputText({
  status = "",
  error = ""
} = {}) {
  const _0x5f3c88 = panorama360Text("outputText", {
    model: panorama360Text("modelLabel")
  });
  const _0x2cd8d5 = status ? panorama360Text("outputTextWithStatus", {
    outputText: _0x5f3c88,
    status: status
  }) : _0x5f3c88;
  if (error) {
    return panorama360Text("outputTextWithError", {
      outputText: _0x2cd8d5,
      error: error
    });
  } else {
    return _0x2cd8d5;
  }
}
export function bindImagePanorama360Action(_0x20ff60) {
  const {
    toolbarEl: _0x449b23,
    nodeId: _0x556d80,
    getNodeData: _0x68ffda,
    store: _0x460511,
    submitTask: _0x42826c,
    buildSourceMediaNodePayload: _0x2c33e8,
    resolveCanvasImagePreviewUrl: _0x30d3e1,
    localPathToUrl: _0x5f1eb5,
    buildImageGenerationFailurePatch: _0x1bb9f2,
    buildImageGenerationResultPatch: _0x54edad,
    calcDisplaySizeByMedia: _0x3b66f3,
    resumeRunningHubImageTask: _0x36ef34,
    runRunninghubAiApp: _0x2088c6,
    processInputImages: _0x107d68,
    getProviderConfig: _0x21e3cc,
    ensureConfig: _0x2a97c4,
    calcSafeSpawnPosNearNode: _0x209d80,
    bindRunningHubToolbarTaskButton: _0x1c0c8f,
    cancelRunningHubResultTask: _0x4926b7,
    findRunningHubToolbarTaskForNode: _0xe8c0a9,
    isRunningHubToolbarTaskCancelled: _0x1f3743,
    buildToolbarImageFields: _0x372505,
    saveOutputImageResult: _0x1ce285,
    extractFirstImageUrl: _0x47934f,
    parseRhCode: _0x2ff1ec,
    parseRhTaskId: _0x422cfc,
    resolveApiInputRatioBasis: _0x5a43ba,
    resolveFinalResultDisplaySize: _0x1663ad,
    createToolbarCancelledError: _0x4cbdb4,
    isToolbarCancelledError: _0x589b51,
    createLocalSaveFailureError: _0x30263e,
    isLocalSaveFailure: _0x5230e2,
    throwIfToolbarTaskCancelled: _0x4651cc,
    cancelRunningHubRemoteTaskQuietly: _0x268320,
    selectToolbarTaskNode: _0x1da9f,
    notifyImageToolbarTaskChange: _0x598bdc,
    buildClearedImageMediaFields: _0x480628,
    IMAGE_LOCAL_SAVE_FAILURE_MESSAGE: _0x19dfe3
  } = _0x20ff60;
  const _0x1f4d3d = _0x449b23.querySelector(".act-panorama-360");
  if (_0x1f4d3d) {
    const _0x414f7c = "2044874075721441281";
    const _0x248703 = "runninghub/" + _0x414f7c;
    const _0x4a7ef4 = "147";
    let _0x12c67a = false;
    const _0x428206 = _0xacab8c => {
      _0x12c67a = !!_0xacab8c;
      _0x1f4d3d.style.opacity = _0xacab8c ? "0.65" : "1";
      const _0x45fb04 = _0x1f4d3d.querySelector("svg");
      if (_0x45fb04) {
        if (_0xacab8c) {
          _0x45fb04.classList.add("v2-spinning");
        } else {
          _0x45fb04.classList.remove("v2-spinning");
        }
      }
    };
    _0x1c0c8f({
      button: _0x1f4d3d,
      getTask: () => _0xe8c0a9(_0x556d80, {
        models: [_0x248703],
        taskTypes: ["image-panorama-360"],
        outputTextIncludes: uniqueList([...PANORAMA360_LEGACY_LABELS, panorama360Text("modelLabel")]),
        nameIncludes: uniqueList([...PANORAMA360_LEGACY_LABELS, panorama360Text("resultName")])
      }),
      cancelTask: _0xe12778 => _0x4926b7(_0xe12778, {
        name: panorama360Text("cancelledName"),
        outputText: panorama360OutputText({
          status: panorama360Text("status.cancelled")
        }),
        notifyMessage: panorama360Text("cancelledToast")
      }),
      cancelTooltip: panorama360Text("cancelTooltip")
    });
    _0x1f4d3d.addEventListener("click", _0x814c16 => {
      _0x814c16.stopPropagation();
      _0x814c16.preventDefault();
      if (_0x12c67a) {
        window.showToast?.(panorama360Text("busy"), "info");
        return;
      }
      (async () => {
        let _0x2633a1 = null;
        let _0x44e67d = "";
        let _0x2df28a = "";
        let _0x2463ef = "";
        let _0xf44795 = null;
        try {
          _0x428206(true);
          const _0x4b0cb9 = _0x68ffda() || {};
          const _0x3b68ea = _0x4b0cb9?.localPath || _0x4b0cb9?.images && _0x4b0cb9.images[_0x4b0cb9.mainImageIndex || 0]?.localPath;
          const _0x2c7386 = _0x5f1eb5(_0x3b68ea) || _0x30d3e1(_0x4b0cb9);
          if (!_0x2c7386) {
            window.showToast?.(panorama360Text("noProcessableImage"), "error");
            return;
          }
          await _0x2a97c4();
          const _0x40bad2 = _0x21e3cc("runninghubwf");
          const _0x4db453 = String(_0x40bad2?.apiKey || "").trim();
          const _0x56431d = String(_0x40bad2?.providerProfileId || "").trim();
          const _0x465a0a = String(_0x40bad2?.apiUrl || "").trim();
          if (!_0x4db453) {
            showProviderApiKeyMissingToast(panorama360Text("apiKeyMissing"), {
              providerId: _0x56431d || "runninghubwf",
              type: "error"
            });
            return;
          }
          const _0x1ac1da = _0x460511.getState().nodes[_0x556d80] || _0x4b0cb9;
          if (!_0x1ac1da) {
            window.showToast?.(panorama360Text("sourceNodeMissing"), "error");
            return;
          }
          const _0x594711 = await _0x5a43ba(_0x1ac1da, _0x2c7386);
          const {
            width: _0x27d9bc,
            height: _0x57440d
          } = _0x3b66f3(_0x594711.width, _0x594711.height);
          const {
            x: _0x13e8da,
            y: _0x5b07b4
          } = _0x209d80(_0x460511.getState().nodes, _0x1ac1da, _0x27d9bc, _0x57440d);
          const _0x3efdad = "source-image-panorama-360-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
          const _0x58f2ca = panorama360OutputText();
          const _0x24620d = await _0x42826c({
            sourceNodeId: _0x1ac1da.id,
            trigger: "toolbar",
            taskType: "image-panorama-360",
            provider: "runninghubwf",
            adapterType: "workflow",
            modelId: _0x248703,
            executionId: "runninghub.image-panorama-360",
            payload: {
              apiKey: _0x4db453,
              providerProfileId: _0x56431d,
              runningHubApiUrl: _0x465a0a,
              imgUrl: _0x2c7386,
              inputBasis: _0x594711,
              outputText: _0x58f2ca
            },
            cancellable: true,
            resumable: true,
            onTaskChange: _0x598bdc,
            createTargetNode: ({
              startedAt: _0x13f120,
              startPatch: _0x1573da,
              protocolPatch: _0x478d23
            }) => _0x2c33e8({
              id: _0x3efdad,
              type: "source-image",
              x: _0x13e8da,
              y: _0x5b07b4,
              width: _0x27d9bc,
              height: _0x57440d,
              needsAutoResize: false,
              name: panorama360Text("processingName"),
              src: "",
              outputText: _0x58f2ca,
              localPath: "",
              fileName: "panorama_360_" + Date.now() + ".png",
              provider: "runninghubwf",
              model: _0x248703,
              rhTaskUseOpenapiQuery: true,
              ..._0x1573da,
              ..._0x478d23,
              generationStartTime: _0x13f120,
              rhTaskStartedAt: _0x13f120
            }),
            submit: async (_0x438b8e, _0x57a191) => {
              _0x1da9f(_0x57a191.targetNodeId);
              const _0x42802b = await _0x107d68([_0x438b8e.imgUrl], _0x438b8e.apiKey, {
                applyInputQualityProfile: true,
                provider: "runninghub",
                apiUrl: _0x438b8e.runningHubApiUrl
              });
              const _0x17ed23 = String(_0x42802b?.[0] || "").trim();
              if (!_0x17ed23) {
                throw new Error(panorama360Text("uploadFailed"));
              }
              _0x4651cc(_0x57a191.targetNodeId);
              const _0x54c105 = await _0x2088c6({
                apiKey: _0x438b8e.apiKey,
                providerProfileId: _0x438b8e.providerProfileId,
                runningHubApiUrl: _0x438b8e.runningHubApiUrl,
                appId: _0x414f7c,
                nodeInfoList: [{
                  nodeId: _0x4a7ef4,
                  fieldName: "image",
                  fieldValue: _0x17ed23,
                  description: "image"
                }],
                instanceType: "default",
                usePersonalQueue: "false"
              }, {
                signal: _0x57a191.signal,
                runningHubWorkflowQueueLease: _0x57a191.runningHubWorkflowQueueLease
              });
              const _0x37d495 = _0x2ff1ec(_0x54c105);
              if (_0x37d495 !== null && _0x37d495 !== 0) {
                throw new Error(String(_0x54c105?.msg || _0x54c105?.message || panorama360Text("createTaskFailed")));
              }
              const _0x2b55b2 = _0x422cfc(_0x54c105);
              if (_0x2b55b2) {
                _0x57a191.onTaskId(_0x2b55b2);
              }
              if (_0x1f3743(_0x57a191.targetNodeId)) {
                await _0x268320({
                  apiKey: _0x438b8e.apiKey,
                  taskId: _0x2b55b2,
                  label: "Panorama360",
                  providerProfileId: _0x438b8e.providerProfileId
                });
                throw _0x4cbdb4();
              }
              if (_0x2b55b2) {
                return {
                  taskId: _0x2b55b2
                };
              } else {
                return {
                  result: {
                    resultUrl: _0x47934f(_0x54c105)
                  }
                };
              }
            },
            poll: async ({
              taskId: _0x56d570,
              targetNodeId: _0xb6035b
            }) => {
              const _0x13e532 = await _0x36ef34(_0x56d570, {
                provider: "runninghubwf",
                model: _0x248703,
                apiKey: _0x4db453,
                providerProfileId: _0x56431d,
                rhProviderProfileId: _0x56431d,
                runningHubApiUrl: _0x465a0a
              }, {
                useOpenapiQuery: true,
                softTimeout: true
              });
              if (_0x13e532?.pending) {
                return _0x13e532;
              }
              _0x4651cc(_0xb6035b);
              const _0x238d0a = _0x13e532?.isBatch && Array.isArray(_0x13e532.images) ? _0x13e532.images[0] : _0x13e532;
              if (!_0x238d0a || _0x238d0a.error) {
                throw new Error(String(_0x238d0a?.error || panorama360Text("missingResultImage")));
              }
              const _0x704354 = String(_0x238d0a.sourceUrl || _0x238d0a.imageUrl || _0x238d0a.thumbUrl || _0x238d0a.src || "").trim();
              if (!_0x704354) {
                throw new Error(panorama360Text("missingResultImage"));
              }
              return {
                resultUrl: _0x704354,
                resumedImage: _0x238d0a
              };
            },
            cancel: ({
              taskId: _0x3496aa
            }) => _0x268320({
              apiKey: _0x4db453,
              taskId: _0x3496aa,
              label: "Panorama360",
              providerProfileId: _0x56431d
            }),
            resultBuilder: async (_0x457c23, _0x531663) => {
              const _0x1b9a35 = String(_0x457c23?.resultUrl || "").trim();
              if (!_0x1b9a35) {
                throw new Error(panorama360Text("missingResultImage"));
              }
              _0x44e67d = _0x1b9a35;
              _0xf44795 = _0x457c23?.resumedImage || null;
              let _0x32f7b4;
              try {
                _0x32f7b4 = await _0x1ce285(_0x1b9a35, {
                  resumedImage: _0xf44795,
                  ext: "png",
                  includeSrc: true,
                  taskKey: _0x531663.taskId ? "runninghubwf:image:" + _0x531663.taskId : ""
                });
              } catch (_0x924c43) {
                console.warn("[Panorama360] saveOutputFromUrlToServer failed:", _0x924c43);
                _0x32f7b4 = {
                  localPath: "",
                  thumbUrl: _0x1b9a35,
                  fields: _0x372505({
                    localPath: "",
                    resultUrl: _0x1b9a35,
                    thumbUrl: _0x1b9a35,
                    includeSrc: true
                  })
                };
              }
              _0x2df28a = _0x32f7b4.thumbUrl || _0x1b9a35;
              _0x2463ef = _0x32f7b4.localPath || "";
              const _0x3052c9 = _0x32f7b4.fields;
              _0x2633a1 = await _0x1663ad(_0x594711, {
                localPath: _0x2463ef,
                imageUrl: _0x2df28a || _0x1b9a35,
                sourceUrl: _0x1b9a35,
                thumbUrl: _0x2df28a,
                src: _0x2df28a || _0x1b9a35
              });
              if (!_0x2463ef) {
                throw _0x30263e();
              }
              return {
                name: panorama360Text("resultName"),
                ..._0x54edad(_0x3052c9, {
                  startedAt: _0x531663.startedAt
                }),
                ..._0x3052c9,
                sourceUrl: _0x1b9a35 || _0x3052c9.sourceUrl || "",
                fileName: _0xf44795?.fileName || _0x3052c9.fileName || "panorama_360_" + Date.now() + ".png",
                width: _0x2633a1.width,
                height: _0x2633a1.height,
                outputText: _0x58f2ca
              };
            },
            failureBuilder: async (_0x2a27dd, _0x283409) => {
              const _0x3a5a1a = _0x2a27dd instanceof Error ? _0x2a27dd.message : String(_0x2a27dd || panorama360Text("unknownError"));
              if (_0x5230e2(_0x2a27dd)) {
                _0x2633a1 ||= await _0x1663ad(_0x594711, {
                  localPath: _0x2463ef,
                  imageUrl: _0x2df28a || _0x44e67d,
                  sourceUrl: _0x44e67d,
                  thumbUrl: _0x2df28a,
                  src: _0x2df28a || _0x44e67d
                });
                return {
                  name: panorama360Text("resultName"),
                  ..._0x480628(),
                  fileName: "panorama_360_" + Date.now() + ".png",
                  width: _0x2633a1.width,
                  height: _0x2633a1.height,
                  outputText: _0x58f2ca,
                  ..._0x1bb9f2({
                    error: _0x19dfe3,
                    startedAt: _0x283409.startedAt
                  }),
                  rhStatusMessage: _0x19dfe3
                };
              }
              return {
                name: panorama360Text("failedName"),
                ..._0x1bb9f2({
                  error: _0x3a5a1a,
                  startedAt: _0x283409.startedAt
                }),
                outputText: panorama360Text("outputTextWithError", {
                  outputText: _0x58f2ca,
                  error: _0x3a5a1a
                })
              };
            },
            cancelledBuilder: () => ({
              name: panorama360Text("cancelledName"),
              outputText: panorama360OutputText({
                status: panorama360Text("status.cancelled")
              })
            })
          });
          if (_0x24620d.status === "success") {
            window.showToast?.(panorama360Text("successToast"), "success");
          } else if (_0x24620d.status === "pending") {
            window.showToast?.(panorama360Text("pendingToast"), "info");
          } else if (_0x24620d.status === "failed") {
            if (_0x5230e2(_0x24620d.error)) {
              window.showToast?.("⚠️ " + _0x19dfe3, "warn");
            } else {
              const _0x2e40e0 = _0x24620d.error instanceof Error ? _0x24620d.error.message : String(_0x24620d.error || panorama360Text("unknownError"));
              window.showToast?.(panorama360Text("failedWithError", {
                error: _0x2e40e0
              }), "error");
            }
          } else if (_0x24620d.status === "cancelled") {
            window.showToast?.(panorama360Text("cancelledToast"), "info");
          }
        } catch (_0x146edb) {
          const _0x2461e9 = _0x146edb instanceof Error ? _0x146edb.message : String(_0x146edb || panorama360Text("unknownError"));
          if (_0x589b51(_0x146edb)) {
            window.showToast?.(panorama360Text("cancelledToast"), "info");
            return;
          }
          window.showToast?.(panorama360Text("failedWithError", {
            error: _0x2461e9
          }), "error");
        } finally {
          _0x428206(false);
        }
      })();
    });
  }
}