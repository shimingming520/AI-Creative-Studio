import { t } from "../../../i18n/index.js";
import { createToolbarActionPopupAnchorPositionGetter, positionToolbarActionSubmenu, positionToolbarActionSubmenuAbove } from "../actionMenu.js";
import { showProviderApiKeyMissingToast } from "../../../modules/providerApiKeyMissingToast.js";
const IMAGE_HD_LEGACY_MODEL_LABEL = "RH高清放大";
function imageHdText(_0x456426, _0x5c1499 = {}) {
  return t("nodeToolbar.imageHd." + _0x456426, _0x5c1499);
}
function uniqueList(_0x386f16) {
  return Array.from(new Set(_0x386f16.map(_0x51e81c => String(_0x51e81c || "").trim()).filter(Boolean)));
}
function imageHdOutputText({
  resolution = "",
  status = "",
  error = ""
} = {}) {
  const _0x398e49 = imageHdText("outputText", {
    model: imageHdText("modelLabel"),
    prompt: imageHdText("promptLabel"),
    resolution: resolution
  });
  const _0x198a7a = status ? imageHdText("outputTextWithStatus", {
    outputText: _0x398e49,
    status: status
  }) : _0x398e49;
  if (error) {
    return imageHdText("outputTextWithError", {
      outputText: _0x198a7a,
      error: error
    });
  } else {
    return _0x198a7a;
  }
}
export function bindImageHdAction(_0x337bbe) {
  const {
    toolbarEl: _0x26c0a1,
    nodeId: _0x1e262b,
    getNodeData: _0x4f3469,
    _hdTaskMachine: _0x3b387b,
    _hdState: _0x4c4c22,
    store: _0x404977,
    submitTask: _0x71f00b,
    buildSourceMediaNodePayload: _0x1f855d,
    buildImageGenerationFailurePatch: _0x53da7f,
    buildImageGenerationResultPatch: _0x15bb21,
    calcDisplaySizeByMedia: _0x21f298,
    runRunninghubWorkflow: _0x72992c,
    resumeRunninghubWorkflowTask: _0x1a85cd,
    processInputImages: _0x52791e,
    getProviderConfig: _0x222f20,
    ensureConfig: _0x32df4d,
    calcSafeSpawnPosNearNode: _0x5eb868,
    bindRunningHubToolbarTaskButton: _0x30f91e,
    cancelRunningHubResultTask: _0x587c78,
    findRunningHubToolbarTaskForNode: _0x12e486,
    isRunningHubToolbarTaskCancelled: _0x55cdc0,
    saveRemoteImageResultLocally: _0x48ce27,
    extractFirstImageUrl: _0x39afd4,
    resolveApiInputRatioBasis: _0x1b0524,
    resolveFinalResultDisplaySize: _0x12a5da,
    createToolbarCancelledError: _0x39fadb,
    isToolbarCancelledError: _0x10cca5,
    createLocalSaveFailureError: _0x18a642,
    isLocalSaveFailure: _0x3ded0d,
    throwIfToolbarTaskCancelled: _0x55a1fa,
    cancelRunningHubRemoteTaskQuietly: _0x5cea22,
    selectToolbarTaskNode: _0x4b069a,
    notifyImageToolbarTaskChange: _0x703e9,
    buildClearedImageMediaFields: _0x44c9bb,
    IMAGE_LOCAL_SAVE_FAILURE_MESSAGE: _0x44762f
  } = _0x337bbe;
  const _0x1632e8 = _0x26c0a1.querySelector(".act-hd");
  if (_0x1632e8) {
    _0x3b387b.bindButton(_0x1632e8);
    _0x30f91e({
      button: _0x1632e8,
      getTask: () => _0x12e486(_0x1e262b, {
        models: ["runninghub/2012862147813974018"],
        taskTypes: ["image-hd"],
        outputTextIncludes: uniqueList([IMAGE_HD_LEGACY_MODEL_LABEL, imageHdText("modelLabel")])
      }),
      cancelTask: async _0x39b9f0 => {
        try {
          if (_0x4c4c22.active && String(_0x4c4c22.outNodeId || "") === _0x39b9f0.outId) {
            try {
              await _0x3b387b.cancel();
            } catch (_0x1916d4) {
              console.warn("[ImageHD] cancel request failed:", _0x1916d4);
            }
          }
          return await _0x587c78(_0x39b9f0, {
            name: imageHdText("cancelledName"),
            outputText: imageHdOutputText({
              status: imageHdText("status.cancelled")
            }),
            notifyMessage: imageHdText("cancelledToast")
          });
        } finally {
          if (_0x4c4c22.active && String(_0x4c4c22.outNodeId || "") === _0x39b9f0.outId) {
            _0x3b387b.reset(_0x1632e8);
          }
        }
      },
      cancelTooltip: imageHdText("cancelTooltip")
    });
    _0x1632e8.addEventListener("click", _0x41b4a0 => {
      _0x41b4a0.stopPropagation();
      _0x41b4a0.preventDefault();
      if (_0x4c4c22.active) {
        (async () => {
          let _0x99f465 = null;
          try {
            const _0x374bc4 = _0x4c4c22.outNodeId ? {
              outId: _0x4c4c22.outNodeId,
              targetNodeId: _0x4c4c22.outNodeId,
              taskId: _0x4c4c22.taskId,
              apiKey: _0x4c4c22.apiKey,
              sourceNodeId: _0x1e262b
            } : null;
            if (_0x374bc4) {
              await _0x587c78(_0x374bc4, {
                name: imageHdText("cancelledName"),
                outputText: imageHdOutputText({
                  status: imageHdText("status.cancelled")
                }),
                notifyMessage: imageHdText("cancelledToast")
              });
            } else {
              await _0x3b387b.cancel();
              window.showToast?.(imageHdText("taskCancelled"), "info");
            }
          } catch (_0x2272f0) {
            _0x99f465 = _0x2272f0;
          }
          try {
            if (_0x99f465) {
              console.warn("[ImageHD] cancel request failed:", _0x99f465);
            }
          } finally {
            _0x3b387b.reset(_0x1632e8);
          }
        })();
        return;
      }
      const _0x4457c2 = document.querySelector(".v2-hd-popup");
      if (_0x4457c2) {
        const _0x2cd2ce = _0x4457c2.__v2HdAnchorBtn && _0x4457c2.__v2HdAnchorBtn === _0x1632e8;
        const _0x41705a = typeof _0x4457c2.__v2HdClose === "function" ? _0x4457c2.__v2HdClose : () => _0x4457c2.remove();
        _0x41705a();
        if (_0x2cd2ce) {
          return;
        }
      }
      const _0x301dd7 = document.createElement("div");
      _0x301dd7.className = "v2-hd-popup node-toolbar-action-menu";
      _0x301dd7.__v2HdAnchorBtn = _0x1632e8;
      const _0x5b3cd1 = createToolbarActionPopupAnchorPositionGetter(_0x1632e8);
      const _0x3d8a7f = _0x5b3cd1();
      Object.assign(_0x301dd7.style, {
        position: "fixed",
        left: _0x3d8a7f.left + "px",
        top: _0x3d8a7f.top + "px",
        transform: "translateY(10px)",
        opacity: "0",
        pointerEvents: "none"
      });
      const _0x28f92d = document.createElement("div");
      _0x28f92d.className = "node-toolbar-action-menu-title";
      _0x28f92d.textContent = imageHdText("choosePlan");
      _0x301dd7.appendChild(_0x28f92d);
      const _0x23de92 = [1280, 1920, 2560];
      const _0x5c5e15 = () => {
        const _0x5331d6 = document.createElement("div");
        _0x5331d6.className = "node-toolbar-action-menu-item";
        const _0x28e437 = document.createElement("div");
        _0x28e437.className = "node-toolbar-action-menu-icon";
        const _0x3aefbb = document.createElement("img");
        _0x3aefbb.className = "node-toolbar-action-provider-logo";
        _0x3aefbb.src = "images/RH.png";
        _0x3aefbb.alt = "runninghub";
        _0x28e437.appendChild(_0x3aefbb);
        _0x5331d6.appendChild(_0x28e437);
        const _0x53ebc4 = document.createElement("div");
        _0x53ebc4.className = "node-toolbar-action-menu-body";
        const _0x40b33e = document.createElement("span");
        _0x40b33e.className = "node-toolbar-action-menu-item-title";
        _0x40b33e.textContent = imageHdText("modelLabel");
        _0x53ebc4.appendChild(_0x40b33e);
        const _0x383159 = document.createElement("span");
        _0x383159.className = "node-toolbar-action-menu-item-desc";
        _0x383159.textContent = imageHdText("modelDesc");
        _0x53ebc4.appendChild(_0x383159);
        _0x5331d6.appendChild(_0x53ebc4);
        const _0x111212 = document.createElement("div");
        _0x111212.className = "node-toolbar-action-caret";
        _0x111212.innerHTML = "&gt;";
        _0x5331d6.appendChild(_0x111212);
        let _0x476840 = null;
        let _0x4d2d9b = 0;
        let _0x5c4aac = 0;
        let _0x240291 = 0;
        let _0x21d280 = null;
        const _0x2f8238 = () => {
          if (_0x4d2d9b) {
            clearTimeout(_0x4d2d9b);
          }
          _0x4d2d9b = 0;
          if (_0x5c4aac) {
            clearTimeout(_0x5c4aac);
          }
          _0x5c4aac = 0;
          if (_0x240291) {
            cancelAnimationFrame(_0x240291);
          }
          _0x240291 = 0;
          if (_0x21d280) {
            document.removeEventListener("pointerdown", _0x21d280);
            _0x21d280 = null;
          }
        };
        const _0xd31ce2 = () => {
          if (!_0x476840) {
            return;
          }
          const _0x42f82c = _0x476840;
          _0x476840 = null;
          if (_0x301dd7.__v2HdSubmenuEl === _0x42f82c) {
            _0x301dd7.__v2HdSubmenuEl = null;
          }
          _0x5331d6.classList.remove("is-open");
          _0x2f8238();
          if (document.body.contains(_0x42f82c)) {
            _0x42f82c.remove();
          }
        };
        const _0x24489b = () => {
          if (_0x5c4aac) {
            clearTimeout(_0x5c4aac);
          }
          _0x5c4aac = 0;
        };
        const _0x1cd011 = () => {
          _0x24489b();
          _0x5c4aac = setTimeout(() => _0xd31ce2(), 160);
        };
        const _0x4d61b9 = () => {
          if (_0x476840 && document.body.contains(_0x476840)) {
            return _0x476840;
          }
          const _0x7210ce = document.querySelector(".v2-hd-submenu");
          if (_0x7210ce) {
            _0x7210ce.remove();
          }
          _0x476840 = document.createElement("div");
          _0x476840.className = "v2-hd-submenu node-toolbar-action-submenu";
          _0x301dd7.__v2HdSubmenuEl = _0x476840;
          _0x5331d6.classList.add("is-open");
          Object.assign(_0x476840.style, {
            position: "fixed",
            opacity: "0",
            pointerEvents: "none"
          });
          const _0x1a110f = () => {
            if (!_0x476840 || !document.body.contains(_0x476840) || !document.body.contains(_0x5331d6)) {
              if (_0x240291) {
                cancelAnimationFrame(_0x240291);
              }
              _0x240291 = 0;
              return;
            }
            const _0x206db9 = _0x5331d6.getBoundingClientRect();
            if (_0x206db9.width <= 0 || _0x206db9.height <= 0) {
              _0x240291 = requestAnimationFrame(_0x1a110f);
              return;
            }
            positionToolbarActionSubmenu(_0x5331d6, _0x476840);
            _0x240291 = requestAnimationFrame(_0x1a110f);
          };
          _0x240291 = requestAnimationFrame(_0x1a110f);
          _0x476840.addEventListener("pointerenter", _0x454698 => {
            if (_0x454698.pointerType !== "mouse") {
              return;
            }
            _0x24489b();
          });
          _0x476840.addEventListener("pointerleave", _0x4a1d2e => {
            if (_0x4a1d2e.pointerType !== "mouse") {
              return;
            }
            _0x1cd011();
          });
          const _0x2c5eec = document.createElement("div");
          _0x2c5eec.className = "node-toolbar-action-menu-title";
          _0x2c5eec.textContent = imageHdText("chooseResolution");
          _0x476840.appendChild(_0x2c5eec);
          _0x23de92.forEach(_0x9c2c3b => {
            const _0x3ab3f0 = document.createElement("div");
            _0x3ab3f0.className = "node-toolbar-action-menu-item node-toolbar-action-submenu-item";
            _0x3ab3f0.textContent = _0x9c2c3b;
            _0x3ab3f0.addEventListener("click", async _0x4a72bb => {
              _0x4a72bb.stopPropagation();
              _0xd31ce2();
              _0x2ae3c5();
              const _0x36b63b = _0x9c2c3b;
              const _0x4dd718 = _0x1e262b;
              const _0x1a3ef9 = _0x1632e8.querySelector("svg");
              if (_0x1a3ef9) {
                _0x1a3ef9.classList.add("v2-spinning");
              }
              const _0x15e484 = new AbortController();
              let _0x34ea58 = "";
              let _0x2b8b07 = "";
              let _0x47bdbe = "";
              let _0x39b534 = "";
              let _0x298901 = null;
              let _0x1d1e13 = "";
              let _0x10578e = "";
              let _0x420399 = "";
              try {
                const _0x3d2b10 = _0x4f3469();
                const _0x50db50 = _0x3d2b10?.localPath || _0x3d2b10?.images && _0x3d2b10.images[_0x3d2b10.mainImageIndex || 0]?.localPath;
                const _0x109905 = _0x50db50 ? "/" + _0x50db50 : _0x3d2b10?.src || _0x3d2b10?.sourceUrl;
                if (!_0x109905) {
                  window.showToast?.(imageHdText("noProcessableImage"), "error");
                  return;
                }
                await _0x32df4d();
                const _0x37c5c6 = _0x222f20("runninghubwf");
                _0x2b8b07 = String(_0x37c5c6?.apiKey || "").trim();
                _0x47bdbe = String(_0x37c5c6?.providerProfileId || "").trim();
                _0x39b534 = String(_0x37c5c6?.apiUrl || "").trim();
                if (!_0x2b8b07) {
                  showProviderApiKeyMissingToast(imageHdText("apiKeyMissing"), {
                    providerId: _0x47bdbe || "runninghubwf",
                    type: "error"
                  });
                  return;
                }
                const _0x3cc5df = _0x404977.getState().nodes[_0x4dd718] || _0x3d2b10;
                if (!_0x3cc5df) {
                  window.showToast?.(imageHdText("sourceNodeMissing"), "error");
                  return;
                }
                const _0x5add96 = await _0x1b0524(_0x3cc5df, _0x109905);
                const {
                  width: _0x388393,
                  height: _0x33403b
                } = _0x21f298(_0x5add96.width, _0x5add96.height);
                const {
                  x: _0x3a5633,
                  y: _0x4d435b
                } = _0x5eb868(_0x404977.getState().nodes, _0x3cc5df, _0x388393, _0x33403b);
                const _0x35aec9 = "2012862147813974018";
                const _0x1af855 = "runninghub/" + _0x35aec9;
                const _0x4757ce = "source-image-hd-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
                const _0x49d62e = imageHdOutputText({
                  resolution: _0x36b63b
                });
                const _0x371a27 = await _0x71f00b({
                  sourceNodeId: _0x3cc5df.id,
                  trigger: "toolbar",
                  taskType: "image-hd",
                  provider: "runninghubwf",
                  adapterType: "workflow",
                  modelId: _0x1af855,
                  executionId: "runninghub.image-hd",
                  payload: {
                    apiKey: _0x2b8b07,
                    providerProfileId: _0x47bdbe,
                    runningHubApiUrl: _0x39b534,
                    imgUrl: _0x109905,
                    inputBasis: _0x5add96,
                    selectedResolution: _0x36b63b,
                    outputText: _0x49d62e
                  },
                  cancellable: true,
                  resumable: true,
                  onTaskChange: _0x703e9,
                  createTargetNode: ({
                    startedAt: _0x4cabc4,
                    startPatch: _0x30d6fb,
                    protocolPatch: _0x1f2faa
                  }) => _0x1f855d({
                    id: _0x4757ce,
                    type: "source-image",
                    x: _0x3a5633,
                    y: _0x4d435b,
                    width: _0x388393,
                    height: _0x33403b,
                    needsAutoResize: false,
                    name: imageHdText("processingName"),
                    src: "",
                    outputText: _0x49d62e,
                    localPath: "",
                    fileName: "hd_" + Date.now() + ".jpg",
                    provider: "runninghubwf",
                    model: _0x1af855,
                    rhTaskUseOpenapiQuery: false,
                    ..._0x30d6fb,
                    ..._0x1f2faa,
                    generationStartTime: _0x4cabc4,
                    rhTaskStartedAt: _0x4cabc4
                  }),
                  submit: async (_0x413f03, _0x448200) => {
                    _0x4b069a(_0x448200.targetNodeId);
                    _0x3b387b.activate({
                      button: _0x1632e8,
                      apiKey: _0x2b8b07,
                      providerProfileId: _0x47bdbe,
                      abortController: _0x15e484,
                      outNodeId: _0x448200.targetNodeId
                    });
                    const _0x2a9548 = await _0x52791e([_0x413f03.imgUrl], _0x413f03.apiKey, {
                      applyInputQualityProfile: true,
                      provider: "runninghub",
                      apiUrl: _0x413f03.runningHubApiUrl
                    });
                    if (_0x2a9548.length === 0) {
                      throw new Error(imageHdText("uploadEmpty"));
                    }
                    const _0x15d7e8 = String(_0x2a9548[0] || "").trim();
                    if (!_0x15d7e8) {
                      throw new Error(imageHdText("uploadFailed"));
                    }
                    _0x55a1fa(_0x448200.targetNodeId);
                    const _0x1a2d2b = await _0x72992c({
                      apiKey: _0x413f03.apiKey,
                      providerProfileId: _0x413f03.providerProfileId,
                      runningHubApiUrl: _0x413f03.runningHubApiUrl,
                      workflowId: _0x35aec9,
                      addMetadata: false,
                      nodeInfoList: [{
                        nodeId: "416",
                        fieldName: "image",
                        fieldValue: _0x15d7e8
                      }, {
                        nodeId: "413",
                        fieldName: "value",
                        fieldValue: _0x36b63b
                      }],
                      instanceType: "default",
                      usePersonalQueue: "false"
                    }, {
                      signal: _0x15e484.signal,
                      runningHubWorkflowQueueLease: _0x448200.runningHubWorkflowQueueLease
                    });
                    _0x34ea58 = String(_0x1a2d2b?.data?.taskId || _0x1a2d2b?.taskId || "").trim();
                    if (!_0x34ea58) {
                      throw new Error(imageHdText("taskIdMissing"));
                    }
                    _0x3b387b.setTaskId(_0x34ea58);
                    _0x448200.onTaskId(_0x34ea58);
                    if (_0x3b387b.isCancelled() || _0x55cdc0(_0x448200.targetNodeId)) {
                      await _0x5cea22({
                        apiKey: _0x413f03.apiKey,
                        taskId: _0x34ea58,
                        label: "ImageHD",
                        providerProfileId: _0x413f03.providerProfileId
                      });
                      throw _0x39fadb();
                    }
                    return {
                      taskId: _0x34ea58
                    };
                  },
                  poll: async ({
                    taskId: _0x129027,
                    signal: _0x1d8339,
                    targetNodeId: _0x1f9e49
                  }) => {
                    if (_0x3b387b.isCancelled() || _0x55cdc0(_0x1f9e49)) {
                      throw _0x39fadb();
                    }
                    const _0x22c346 = await _0x1a85cd({
                      apiKey: _0x2b8b07,
                      taskId: _0x129027,
                      providerProfileId: _0x47bdbe,
                      runningHubApiUrl: _0x39b534
                    }, {
                      signal: _0x1d8339,
                      taskKind: "image"
                    });
                    if (_0x3b387b.isCancelled() || _0x55cdc0(_0x1f9e49)) {
                      throw _0x39fadb();
                    }
                    const _0x1917f7 = _0x39afd4(_0x22c346);
                    if (!_0x1917f7) {
                      throw new Error(imageHdText("missingResultImage"));
                    }
                    return {
                      resultUrl: _0x1917f7
                    };
                  },
                  cancel: ({
                    taskId: _0x17fa94
                  }) => _0x5cea22({
                    apiKey: _0x2b8b07,
                    taskId: _0x17fa94,
                    label: "ImageHD",
                    providerProfileId: _0x47bdbe
                  }),
                  resultBuilder: async (_0x21bbc6, _0x832f46) => {
                    const _0x3daa35 = String(_0x21bbc6?.resultUrl || "").trim();
                    if (!_0x3daa35) {
                      throw new Error(imageHdText("missingResultImage"));
                    }
                    _0x1d1e13 = _0x3daa35;
                    let _0x239c15 = null;
                    try {
                      _0x239c15 = await _0x48ce27(_0x3daa35, {
                        projectId: window.currentProjectId || "default_v2_project",
                        includeSrc: true
                      });
                    } catch (_0x1fb380) {
                      console.error("保存图片失败:", _0x1fb380);
                    }
                    _0x420399 = _0x239c15?.localPath || "";
                    _0x10578e = _0x239c15?.thumbUrl || _0x3daa35;
                    if (!_0x420399) {
                      throw _0x18a642();
                    }
                    _0x298901 = await _0x12a5da(_0x5add96, {
                      localPath: _0x420399,
                      imageUrl: _0x3daa35,
                      sourceUrl: _0x3daa35,
                      thumbUrl: _0x10578e,
                      src: _0x10578e || _0x3daa35
                    });
                    return {
                      name: imageHdText("resultName"),
                      ..._0x15bb21(_0x239c15.fields, {
                        startedAt: _0x832f46.startedAt
                      }),
                      ..._0x239c15.fields,
                      fileName: "hd_" + Date.now() + ".jpg",
                      width: _0x298901.width,
                      height: _0x298901.height,
                      outputText: _0x49d62e
                    };
                  },
                  failureBuilder: async (_0x32c306, _0x3fcb71) => {
                    const _0x2e1d49 = _0x32c306 instanceof Error ? _0x32c306.message : String(_0x32c306 || imageHdText("unknownError"));
                    if (_0x3ded0d(_0x32c306)) {
                      _0x298901 ||= await _0x12a5da(_0x5add96, {
                        localPath: _0x420399,
                        imageUrl: _0x1d1e13,
                        sourceUrl: _0x1d1e13,
                        thumbUrl: _0x10578e,
                        src: _0x10578e || _0x1d1e13
                      });
                      return {
                        name: imageHdText("resultName"),
                        ..._0x44c9bb(),
                        width: _0x298901.width,
                        height: _0x298901.height,
                        outputText: _0x49d62e,
                        ..._0x53da7f({
                          error: _0x44762f,
                          startedAt: _0x3fcb71.startedAt
                        }),
                        rhStatusMessage: _0x44762f
                      };
                    }
                    return {
                      name: imageHdText("failedName"),
                      ..._0x53da7f({
                        error: _0x2e1d49,
                        startedAt: _0x3fcb71.startedAt
                      }),
                      outputText: imageHdText("outputTextWithError", {
                        outputText: _0x49d62e,
                        error: _0x2e1d49
                      })
                    };
                  },
                  cancelledBuilder: () => ({
                    name: imageHdText("cancelledName"),
                    outputText: imageHdOutputText({
                      status: imageHdText("status.cancelled")
                    })
                  })
                }, {
                  abortController: _0x15e484
                });
                if (_0x371a27.status === "success") {
                  window.showToast?.(imageHdText("successToast"), "success");
                } else if (_0x371a27.status === "failed") {
                  if (_0x3ded0d(_0x371a27.error)) {
                    window.showToast?.("⚠️ " + _0x44762f, "warn");
                  } else {
                    const _0x351e93 = _0x371a27.error instanceof Error ? _0x371a27.error.message : String(_0x371a27.error || imageHdText("unknownError"));
                    window.showToast?.(imageHdText("failedWithError", {
                      error: _0x351e93
                    }), "error");
                  }
                } else if (_0x371a27.status === "cancelled") {
                  window.showToast?.(imageHdText("cancelledToast"), "info");
                }
              } catch (_0x58899a) {
                const _0x3bd8e1 = _0x58899a instanceof Error ? _0x58899a.message : String(_0x58899a || "");
                if (_0x10cca5(_0x58899a)) {
                  window.showToast?.(imageHdText("cancelledToast"), "info");
                } else {
                  console.error("RH高清放大失败:", _0x58899a);
                  window.showToast?.(imageHdText("failedWithError", {
                    error: _0x3bd8e1
                  }), "error");
                }
              } finally {
                if (_0x1a3ef9) {
                  _0x1a3ef9.classList.remove("v2-spinning");
                }
                _0x3b387b.reset(_0x1632e8);
              }
            });
            _0x476840.appendChild(_0x3ab3f0);
          });
          document.body.appendChild(_0x476840);
          _0x476840.offsetHeight;
          _0x476840.style.opacity = "1";
          _0x476840.style.pointerEvents = "auto";
          _0x21d280 = _0x475329 => {
            if (!_0x476840) {
              return;
            }
            if (!_0x476840.contains(_0x475329.target) && !_0x5331d6.contains(_0x475329.target)) {
              _0xd31ce2();
            }
          };
          document.addEventListener("pointerdown", _0x21d280);
          return _0x476840;
        };
        _0x5331d6.__v2LastPointerType = "mouse";
        _0x5331d6.addEventListener("pointerdown", _0x411b01 => {
          _0x5331d6.__v2LastPointerType = _0x411b01.pointerType || "mouse";
        });
        const _0x3da844 = () => {
          _0x24489b();
          if (_0x4d2d9b) {
            clearTimeout(_0x4d2d9b);
          }
          _0x4d2d9b = setTimeout(() => _0x4d61b9(), 60);
        };
        _0x5331d6.addEventListener("pointerenter", _0xca2e12 => {
          if (_0xca2e12.pointerType !== "mouse") {
            return;
          }
          _0x3da844();
        });
        _0x5331d6.addEventListener("pointerleave", _0x266648 => {
          if (_0x266648.pointerType !== "mouse") {
            return;
          }
          _0x1cd011();
        });
        _0x5331d6.addEventListener("click", _0x534f24 => {
          _0x534f24.stopPropagation();
          if (_0x5331d6.__v2LastPointerType === "touch") {
            if (_0x476840 && document.body.contains(_0x476840)) {
              _0xd31ce2();
            } else {
              _0x4d61b9();
            }
            return;
          }
          _0x4d61b9();
        });
        return _0x5331d6;
      };
      _0x301dd7.appendChild(_0x5c5e15());
      document.body.appendChild(_0x301dd7);
      positionToolbarActionSubmenuAbove(_0x5b3cd1(), _0x301dd7);
      _0x301dd7.offsetHeight;
      _0x301dd7.style.pointerEvents = "auto";
      _0x301dd7.style.opacity = "1";
      _0x301dd7.style.transform = "translateY(0)";
      let _0x40b425 = 0;
      let _0x31a0a8 = null;
      const _0x5d88fd = () => {
        if (_0x40b425) {
          cancelAnimationFrame(_0x40b425);
        }
        _0x40b425 = 0;
        if (_0x31a0a8) {
          document.removeEventListener("pointerdown", _0x31a0a8);
          _0x31a0a8 = null;
        }
      };
      const _0x2ae3c5 = () => {
        if (_0x301dd7.__v2HdClosing) {
          return;
        }
        _0x301dd7.__v2HdClosing = true;
        _0x5d88fd();
        _0x301dd7.style.opacity = "0";
        _0x301dd7.style.pointerEvents = "none";
        _0x301dd7.style.transform = "translateY(10px)";
        setTimeout(() => _0x301dd7.remove(), 250);
      };
      _0x301dd7.__v2HdClose = _0x2ae3c5;
      const _0x1ecf0a = () => {
        if (!document.body.contains(_0x301dd7) || !document.body.contains(_0x1632e8)) {
          _0x5d88fd();
          return;
        }
        if (!_0x5b3cd1.hasVisibleAnchor()) {
          _0x40b425 = requestAnimationFrame(_0x1ecf0a);
          return;
        }
        positionToolbarActionSubmenuAbove(_0x5b3cd1(), _0x301dd7);
        _0x40b425 = requestAnimationFrame(_0x1ecf0a);
      };
      _0x40b425 = requestAnimationFrame(_0x1ecf0a);
      _0x31a0a8 = _0x3e1566 => {
        if (_0x301dd7.__v2HdClosing) {
          return;
        }
        const _0x53f128 = _0x301dd7.__v2HdSubmenuEl;
        const _0x28c796 = _0x301dd7.contains(_0x3e1566.target);
        const _0x526de0 = _0x53f128 && _0x53f128.contains(_0x3e1566.target);
        if (!_0x28c796 && !_0x526de0 && _0x3e1566.target !== _0x1632e8) {
          _0x2ae3c5();
        }
      };
      setTimeout(() => document.addEventListener("pointerdown", _0x31a0a8), 10);
    });
  }
}