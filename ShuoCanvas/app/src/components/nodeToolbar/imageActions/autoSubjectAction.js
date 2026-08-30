import { t } from "../../../i18n/index.js";
import { createToolbarActionPopupAnchorPositionGetter, positionToolbarActionSubmenu, positionToolbarActionSubmenuAbove } from "../actionMenu.js";
import { showProviderApiKeyMissingToast } from "../../../modules/providerApiKeyMissingToast.js";
function autoSubjectText(_0x3b5d6e, _0x3f2c7d = {}) {
  return t("nodeToolbar.autoSubject." + _0x3b5d6e, _0x3f2c7d);
}
export function bindImageAutoSubjectAction(_0x54755d) {
  const {
    toolbarEl: _0x5e64c9,
    nodeId: _0x199348,
    getNodeData: _0xa3b7b,
    store: _0x32c422,
    submitTask: _0x2b2068,
    buildSourceMediaNodePayload: _0x123bd1,
    resolveCanvasImagePreviewUrl: _0x56d70d,
    localPathToUrl: _0x249d7c,
    buildImageGenerationFailurePatch: _0x273610,
    buildImageGenerationResultPatch: _0x109f54,
    calcDisplaySizeByMedia: _0x9fa8c4,
    runRunninghubAiApp: _0x18212a,
    resumeRunninghubWorkflowTask: _0x1ca0ce,
    processInputImages: _0xdf75e8,
    getProviderConfig: _0x464efb,
    ensureConfig: _0x53f8d5,
    calcSafeSpawnPosNearNode: _0x87b6fd,
    bindRunningHubToolbarTaskButton: _0x20c2ee,
    cancelRunningHubResultTask: _0x538bd3,
    findRunningHubToolbarTaskForNode: _0x1f5279,
    isRunningHubToolbarTaskCancelled: _0x449e05,
    buildToolbarImageFields: _0x398e62,
    saveRemoteImageResultLocally: _0x130950,
    extractFirstImageUrl: _0x4c4124,
    parseRhCode: _0x50fd83,
    parseRhTaskId: _0x32f5b4,
    resolveApiInputRatioBasis: _0x550960,
    resolveFinalResultDisplaySize: _0x3530a3,
    createToolbarCancelledError: _0x1b2fa8,
    isToolbarCancelledError: _0x3fc722,
    createLocalSaveFailureError: _0x259550,
    isLocalSaveFailure: _0x51a937,
    throwIfToolbarTaskCancelled: _0x159a95,
    cancelRunningHubRemoteTaskQuietly: _0x473e9e,
    selectToolbarTaskNode: _0x214b1e,
    notifyImageToolbarTaskChange: _0x68836f,
    buildClearedImageMediaFields: _0x5989a4,
    IMAGE_LOCAL_SAVE_FAILURE_MESSAGE: _0x37e8c5
  } = _0x54755d;
  const _0x486039 = _0x5e64c9.querySelector(".act-auto-subject");
  if (_0x486039) {
    const _0xafd792 = "rh-matting";
    const _0x597719 = "RH抠图";
    const _0x511a33 = "runninghub/2042329021530247170";
    const _0x2853b2 = [{
      key: "transparent",
      labelKey: "transparent"
    }, {
      key: "white",
      labelKey: "white"
    }, {
      key: "black",
      labelKey: "black"
    }, {
      key: "gray",
      labelKey: "gray"
    }];
    const _0x56c61f = () => autoSubjectText("modeLabel");
    const _0x5c2fca = _0x2b7675 => autoSubjectText("backgrounds." + _0x2b7675);
    const _0x184d3f = () => {
      _0x486039.dataset.tooltip = autoSubjectText("buttonTooltip");
    };
    _0x184d3f();
    _0x20c2ee({
      button: _0x486039,
      getTask: () => _0x1f5279(_0x199348, {
        models: [_0x511a33],
        taskTypes: ["image-auto-subject"],
        outputTextIncludes: [_0x597719, _0x56c61f()]
      }),
      cancelTask: _0x5f2755 => _0x538bd3(_0x5f2755, {
        name: autoSubjectText("cancelledName"),
        outputText: autoSubjectText("cancelledOutput", {
          model: _0x56c61f()
        }),
        notifyMessage: autoSubjectText("cancelledToast")
      }),
      cancelTooltip: autoSubjectText("cancelTooltip")
    });
    let _0x2988be = null;
    let _0x5875ef = null;
    let _0x30f3e3 = null;
    let _0x3a9dae = 0;
    let _0xc79010 = 0;
    let _0x1424a3 = 0;
    let _0x3ed4c9 = null;
    let _0xcc6619 = null;
    let _0x16b88c = null;
    const _0x290fb3 = () => {
      if (_0x1424a3) {
        clearTimeout(_0x1424a3);
      }
      _0x1424a3 = 0;
      if (_0xc79010) {
        cancelAnimationFrame(_0xc79010);
      }
      _0xc79010 = 0;
      if (_0xcc6619) {
        document.removeEventListener("pointerdown", _0xcc6619);
        _0xcc6619 = null;
      }
    };
    const _0x519f4c = () => {
      if (!_0x5875ef) {
        return;
      }
      const _0x1fb87d = _0x5875ef;
      _0x5875ef = null;
      if (_0x30f3e3) {
        _0x30f3e3.classList.remove("is-open");
      }
      _0x290fb3();
      if (document.body.contains(_0x1fb87d)) {
        _0x1fb87d.remove();
      }
      if (_0x30f3e3) {
        _0x30f3e3.__v2SubjectSubOpen = false;
      }
    };
    const _0x50dfe6 = () => {
      if (!_0x5875ef) {
        return;
      }
      _0x5875ef.querySelectorAll(".v2-subject-bg-item").forEach(_0x368d1c => {
        _0x368d1c.__v2IsActive = false;
        _0x368d1c.classList.remove("is-active");
      });
    };
    const _0x26d5d7 = () => {
      if (!_0x2988be) {
        return;
      }
      const _0xfbc626 = _0x2988be;
      _0x2988be = null;
      _0x30f3e3 = null;
      _0x519f4c();
      if (_0x3ed4c9) {
        document.removeEventListener("pointerdown", _0x3ed4c9);
        _0x3ed4c9 = null;
      }
      if (_0x16b88c) {
        _0x5e64c9.removeEventListener("pointerdown", _0x16b88c, true);
        _0x16b88c = null;
      }
      if (_0x3a9dae) {
        cancelAnimationFrame(_0x3a9dae);
      }
      _0x3a9dae = 0;
      if (!document.body.contains(_0xfbc626)) {
        return;
      }
      _0xfbc626.style.opacity = "0";
      _0xfbc626.style.pointerEvents = "none";
      _0xfbc626.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (document.body.contains(_0xfbc626)) {
          _0xfbc626.remove();
        }
      }, 250);
    };
    const _0x20ad18 = () => {
      if (_0x1424a3) {
        clearTimeout(_0x1424a3);
      }
      _0x1424a3 = setTimeout(() => _0x519f4c(), 160);
    };
    const _0x124b07 = () => {
      if (_0x1424a3) {
        clearTimeout(_0x1424a3);
      }
      _0x1424a3 = 0;
    };
    const _0x4d00b3 = _0x1f73c3 => {
      if (_0x5875ef && document.body.contains(_0x5875ef)) {
        _0x50dfe6();
        return _0x5875ef;
      }
      const _0x2c8884 = document.querySelector(".v2-subject-submenu");
      if (_0x2c8884) {
        _0x2c8884.remove();
      }
      _0x5875ef = document.createElement("div");
      _0x5875ef.className = "v2-subject-submenu node-toolbar-action-submenu";
      _0x1f73c3.classList.add("is-open");
      Object.assign(_0x5875ef.style, {
        position: "fixed",
        opacity: "0",
        pointerEvents: "none"
      });
      const _0x475247 = () => {
        if (!_0x5875ef || !document.body.contains(_0x5875ef) || !document.body.contains(_0x1f73c3)) {
          if (_0xc79010) {
            cancelAnimationFrame(_0xc79010);
          }
          _0xc79010 = 0;
          return;
        }
        const _0x35fb38 = _0x1f73c3.getBoundingClientRect();
        if (_0x35fb38.width <= 0 || _0x35fb38.height <= 0) {
          _0xc79010 = requestAnimationFrame(_0x475247);
          return;
        }
        positionToolbarActionSubmenu(_0x1f73c3, _0x5875ef);
        _0xc79010 = requestAnimationFrame(_0x475247);
      };
      _0xc79010 = requestAnimationFrame(_0x475247);
      _0x5875ef.addEventListener("pointerenter", _0x8e5ae2 => {
        if (_0x8e5ae2.pointerType !== "mouse") {
          return;
        }
        _0x124b07();
      });
      _0x5875ef.addEventListener("pointerleave", _0x45249c => {
        if (_0x45249c.pointerType !== "mouse") {
          return;
        }
        _0x20ad18();
      });
      const _0x1938c0 = document.createElement("div");
      _0x1938c0.className = "node-toolbar-action-menu-title";
      _0x1938c0.textContent = autoSubjectText("chooseBackground");
      _0x5875ef.appendChild(_0x1938c0);
      _0x2853b2.forEach(_0x53221e => {
        const _0xf17dc4 = document.createElement("div");
        _0xf17dc4.className = "v2-subject-bg-item node-toolbar-action-menu-item node-toolbar-action-submenu-item";
        _0xf17dc4.dataset.bgKey = _0x53221e.key;
        _0xf17dc4.textContent = _0x5c2fca(_0x53221e.key);
        _0xf17dc4.addEventListener("click", _0x5beb52 => {
          _0x5beb52.stopPropagation();
          const _0x54fcf0 = {
            transparent: 0,
            white: 1,
            black: 2,
            gray: 3
          };
          const _0x5f49cb = _0x54fcf0[_0x53221e.key];
          if (_0x5f49cb === undefined) {
            window.showToast?.(autoSubjectText("invalidBackground"), "error");
            return;
          }
          _0x519f4c();
          _0x26d5d7();
          (async () => {
            const _0xcc5787 = _0x5c2fca(_0x53221e.key);
            const _0x324196 = autoSubjectText("outputText", {
              model: _0x56c61f(),
              background: _0xcc5787
            });
            let _0x65c17a = null;
            let _0x36aea3 = "";
            let _0x5bbd9f = "";
            let _0x111183 = "";
            try {
              const _0x4e6e66 = _0xa3b7b() || {};
              const _0x567a53 = _0x4e6e66?.localPath || _0x4e6e66?.images && _0x4e6e66.images[_0x4e6e66.mainImageIndex || 0]?.localPath;
              const _0x498b73 = _0x249d7c(_0x567a53) || _0x56d70d(_0x4e6e66);
              if (!_0x498b73) {
                window.showToast?.(autoSubjectText("noProcessableImage"), "error");
                return;
              }
              await _0x53f8d5();
              const _0x2d4367 = _0x464efb("runninghubwf");
              const _0x3a4e10 = String(_0x2d4367?.apiKey || "").trim();
              const _0x3b9d27 = String(_0x2d4367?.providerProfileId || "").trim();
              const _0x10a873 = String(_0x2d4367?.apiUrl || "").trim();
              if (!_0x3a4e10) {
                showProviderApiKeyMissingToast(autoSubjectText("apiKeyMissing"), {
                  providerId: _0x3b9d27 || "runninghubwf",
                  type: "error"
                });
                return;
              }
              const _0x2d4fc6 = _0x32c422.getState().nodes[_0x199348] || _0x4e6e66;
              if (!_0x2d4fc6) {
                window.showToast?.(autoSubjectText("sourceNodeMissing"), "error");
                return;
              }
              const _0x4f66f5 = await _0x550960(_0x2d4fc6, _0x498b73);
              const {
                width: _0x179f79,
                height: _0x3ec984
              } = _0x9fa8c4(_0x4f66f5.width, _0x4f66f5.height);
              const {
                x: _0x389daa,
                y: _0x1bfd87
              } = _0x87b6fd(_0x32c422.getState().nodes, _0x2d4fc6, _0x179f79, _0x3ec984);
              const _0x543c7a = "source-image-subject-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
              const _0x2dece6 = await _0x2b2068({
                sourceNodeId: _0x2d4fc6.id,
                trigger: "toolbar",
                taskType: "image-auto-subject",
                provider: "runninghubwf",
                adapterType: "workflow",
                modelId: _0x511a33,
                executionId: "runninghub.image-auto-subject",
                payload: {
                  apiKey: _0x3a4e10,
                  providerProfileId: _0x3b9d27,
                  runningHubApiUrl: _0x10a873,
                  bgIndex: _0x5f49cb,
                  imgUrl: _0x498b73,
                  inputBasis: _0x4f66f5,
                  outputText: _0x324196
                },
                cancellable: true,
                resumable: true,
                onTaskChange: _0x68836f,
                createTargetNode: ({
                  startedAt: _0x3fccbf,
                  startPatch: _0x10ff4e,
                  protocolPatch: _0x2f4679
                }) => _0x123bd1({
                  id: _0x543c7a,
                  type: "source-image",
                  x: _0x389daa,
                  y: _0x1bfd87,
                  width: _0x179f79,
                  height: _0x3ec984,
                  needsAutoResize: false,
                  name: autoSubjectText("processingName"),
                  src: "",
                  outputText: _0x324196,
                  localPath: "",
                  fileName: "subject_" + Date.now() + ".png",
                  provider: "runninghubwf",
                  model: _0x511a33,
                  rhTaskUseOpenapiQuery: true,
                  ..._0x10ff4e,
                  ..._0x2f4679,
                  generationStartTime: _0x3fccbf,
                  rhTaskStartedAt: _0x3fccbf
                }),
                submit: async (_0xd4882c, _0x1a6479) => {
                  _0x214b1e(_0x1a6479.targetNodeId);
                  const _0x492d7e = await _0xdf75e8([_0xd4882c.imgUrl], _0xd4882c.apiKey, {
                    applyInputQualityProfile: true,
                    provider: "runninghub",
                    apiUrl: _0xd4882c.runningHubApiUrl
                  });
                  const _0x427813 = String(_0x492d7e?.[0] || "").trim();
                  if (!_0x427813) {
                    throw new Error(autoSubjectText("uploadFailed"));
                  }
                  _0x159a95(_0x1a6479.targetNodeId);
                  const _0x3565ea = await _0x18212a({
                    apiKey: _0xd4882c.apiKey,
                    providerProfileId: _0xd4882c.providerProfileId,
                    runningHubApiUrl: _0xd4882c.runningHubApiUrl,
                    appId: "2042329021530247170",
                    nodeInfoList: [{
                      nodeId: "5",
                      fieldName: "image",
                      fieldValue: _0x427813,
                      description: "上传图片"
                    }, {
                      nodeId: "7",
                      fieldName: "index",
                      fieldValue: _0x5f49cb,
                      description: "背景颜色"
                    }],
                    instanceType: "default",
                    usePersonalQueue: "false"
                  }, {
                    signal: _0x1a6479.signal,
                    runningHubWorkflowQueueLease: _0x1a6479.runningHubWorkflowQueueLease
                  });
                  const _0x2b533a = _0x50fd83(_0x3565ea);
                  if (_0x2b533a !== null && _0x2b533a !== 0) {
                    throw new Error(String(_0x3565ea?.msg || _0x3565ea?.message || autoSubjectText("createTaskFailed")));
                  }
                  const _0x2fc2b1 = _0x32f5b4(_0x3565ea);
                  if (_0x2fc2b1) {
                    _0x1a6479.onTaskId(_0x2fc2b1);
                  }
                  if (_0x449e05(_0x1a6479.targetNodeId)) {
                    await _0x473e9e({
                      apiKey: _0xd4882c.apiKey,
                      taskId: _0x2fc2b1,
                      label: "AutoSubject",
                      providerProfileId: _0xd4882c.providerProfileId
                    });
                    throw _0x1b2fa8();
                  }
                  if (_0x2fc2b1) {
                    return {
                      taskId: _0x2fc2b1
                    };
                  } else {
                    return {
                      result: {
                        resultUrl: _0x4c4124(_0x3565ea)
                      }
                    };
                  }
                },
                poll: async ({
                  taskId: _0xa8853,
                  signal: _0x498b02,
                  targetNodeId: _0xf66b9f,
                  payload: _0x5e6fed
                }) => {
                  const _0x36a32f = _0xa8853 ? await _0x1ca0ce({
                    apiKey: _0x5e6fed.apiKey,
                    taskId: _0xa8853,
                    providerProfileId: _0x5e6fed.providerProfileId,
                    runningHubApiUrl: _0x5e6fed.runningHubApiUrl
                  }, {
                    signal: _0x498b02,
                    useOpenapiQuery: true,
                    taskKind: "image"
                  }) : null;
                  const _0x42152c = _0x4c4124(_0x36a32f);
                  _0x159a95(_0xf66b9f);
                  if (!_0x42152c) {
                    throw new Error(autoSubjectText("missingResultImage"));
                  }
                  return {
                    resultUrl: _0x42152c
                  };
                },
                cancel: ({
                  taskId: _0x5269ab
                }) => _0x473e9e({
                  apiKey: _0x3a4e10,
                  taskId: _0x5269ab,
                  label: "AutoSubject",
                  providerProfileId: _0x3b9d27
                }),
                resultBuilder: async (_0x2f8f90, _0x24cd14) => {
                  const _0x4ab61d = String(_0x2f8f90?.resultUrl || "").trim();
                  if (!_0x4ab61d) {
                    throw new Error(autoSubjectText("missingResultImage"));
                  }
                  _0x36aea3 = _0x4ab61d;
                  let _0x186f4e = _0x398e62({
                    localPath: "",
                    resultUrl: _0x4ab61d,
                    thumbUrl: _0x4ab61d
                  });
                  _0x5bbd9f = _0x4ab61d;
                  _0x111183 = "";
                  try {
                    const _0x22dd71 = await _0x130950(_0x4ab61d, {
                      projectId: window.currentProjectId || "default_v2_project"
                    });
                    _0x186f4e = _0x22dd71.fields;
                    _0x5bbd9f = _0x22dd71.thumbUrl || _0x4ab61d;
                    _0x111183 = _0x22dd71.localPath || "";
                  } catch (_0x57d49a) {
                    console.warn("[AutoSubject] saveRemoteImageLocally failed:", _0x57d49a);
                  }
                  _0x65c17a = await _0x3530a3(_0x4f66f5, {
                    localPath: _0x111183,
                    imageUrl: _0x4ab61d,
                    sourceUrl: _0x4ab61d,
                    thumbUrl: _0x5bbd9f,
                    src: _0x5bbd9f || _0x4ab61d
                  });
                  if (!_0x111183) {
                    throw _0x259550();
                  }
                  const _0x5dae1a = {
                    subjectDetectMode: _0xafd792,
                    subjectDetectBackground: _0x53221e.key
                  };
                  if (typeof _0x24cd14.updateNode === "function") {
                    _0x24cd14.updateNode(_0x199348, _0x5dae1a, {
                      allowMissing: true
                    });
                  } else {
                    _0x32c422.updateNodeData(_0x199348, _0x5dae1a);
                  }
                  return {
                    name: autoSubjectText("resultName"),
                    ..._0x109f54(_0x186f4e, {
                      startedAt: _0x24cd14.startedAt
                    }),
                    ..._0x186f4e,
                    fileName: "subject_" + Date.now() + ".png",
                    width: _0x65c17a.width,
                    height: _0x65c17a.height,
                    outputText: _0x324196
                  };
                },
                failureBuilder: async (_0x19f45d, _0x54f16f) => {
                  const _0x26f7a0 = _0x19f45d instanceof Error ? _0x19f45d.message : String(_0x19f45d || autoSubjectText("unknownError"));
                  if (_0x51a937(_0x19f45d)) {
                    _0x65c17a ||= await _0x3530a3(_0x4f66f5, {
                      localPath: _0x111183,
                      imageUrl: _0x36aea3,
                      sourceUrl: _0x36aea3,
                      thumbUrl: _0x5bbd9f,
                      src: _0x5bbd9f || _0x36aea3
                    });
                    return {
                      name: autoSubjectText("resultName"),
                      ..._0x5989a4(),
                      fileName: "subject_" + Date.now() + ".png",
                      width: _0x65c17a.width,
                      height: _0x65c17a.height,
                      outputText: _0x324196,
                      ..._0x273610({
                        error: _0x37e8c5,
                        startedAt: _0x54f16f.startedAt
                      }),
                      rhStatusMessage: _0x37e8c5
                    };
                  }
                  return {
                    name: autoSubjectText("failedName"),
                    ..._0x273610({
                      error: _0x26f7a0,
                      startedAt: _0x54f16f.startedAt
                    }),
                    outputText: autoSubjectText("outputTextWithError", {
                      outputText: _0x324196,
                      error: _0x26f7a0
                    })
                  };
                },
                cancelledBuilder: () => ({
                  name: autoSubjectText("cancelledName"),
                  outputText: autoSubjectText("cancelledOutput", {
                    model: _0x56c61f()
                  })
                })
              });
              _0x184d3f();
              if (_0x2dece6.status === "success") {
                window.showToast?.(autoSubjectText("completed", {
                  background: _0xcc5787
                }), "success");
              } else if (_0x2dece6.status === "failed") {
                if (_0x51a937(_0x2dece6.error)) {
                  window.showToast?.("⚠️ " + _0x37e8c5, "warn");
                } else {
                  const _0x26a472 = _0x2dece6.error instanceof Error ? _0x2dece6.error.message : String(_0x2dece6.error || autoSubjectText("unknownError"));
                  window.showToast?.(autoSubjectText("failedWithError", {
                    error: _0x26a472
                  }), "error");
                }
              } else if (_0x2dece6.status === "cancelled") {
                window.showToast?.(autoSubjectText("cancelledToast"), "info");
              }
            } catch (_0xc5bd3a) {
              const _0x6d1a1c = _0xc5bd3a instanceof Error ? _0xc5bd3a.message : String(_0xc5bd3a || autoSubjectText("unknownError"));
              if (_0x3fc722(_0xc5bd3a)) {
                window.showToast?.(autoSubjectText("cancelledToast"), "info");
                return;
              }
              window.showToast?.(autoSubjectText("failedWithError", {
                error: _0x6d1a1c
              }), "error");
            }
          })();
        });
        _0x5875ef.appendChild(_0xf17dc4);
      });
      document.body.appendChild(_0x5875ef);
      _0x50dfe6();
      _0x5875ef.offsetHeight;
      _0x5875ef.style.opacity = "1";
      _0x5875ef.style.pointerEvents = "auto";
      _0xcc6619 = _0x8a2741 => {
        if (!_0x5875ef) {
          return;
        }
        if (!_0x5875ef.contains(_0x8a2741.target) && !_0x1f73c3.contains(_0x8a2741.target)) {
          _0x519f4c();
        }
      };
      document.addEventListener("pointerdown", _0xcc6619);
      return _0x5875ef;
    };
    const _0x28d360 = () => {
      if (_0x2988be && document.body.contains(_0x2988be)) {
        return _0x2988be;
      }
      const _0x22cd38 = document.querySelector(".v2-hd-popup");
      if (_0x22cd38) {
        if (typeof _0x22cd38.__v2HdClose === "function") {
          _0x22cd38.__v2HdClose();
        } else {
          _0x22cd38.remove();
        }
      }
      const _0x46c299 = document.querySelector(".v2-subject-popup");
      if (_0x46c299) {
        if (typeof _0x46c299.__v2SubjectClose === "function") {
          _0x46c299.__v2SubjectClose();
        } else {
          _0x46c299.remove();
        }
      }
      _0x2988be = document.createElement("div");
      _0x2988be.className = "v2-subject-popup node-toolbar-action-menu";
      const _0x3c09ec = createToolbarActionPopupAnchorPositionGetter(_0x486039);
      const _0x2a0770 = _0x3c09ec();
      Object.assign(_0x2988be.style, {
        position: "fixed",
        left: _0x2a0770.left + "px",
        top: _0x2a0770.top + "px",
        transform: "translateY(10px)",
        opacity: "0",
        pointerEvents: "none"
      });
      const _0x2b98bd = document.createElement("div");
      _0x2b98bd.className = "node-toolbar-action-menu-title";
      _0x2b98bd.textContent = autoSubjectText("chooseMode");
      _0x2988be.appendChild(_0x2b98bd);
      _0x30f3e3 = document.createElement("div");
      _0x30f3e3.className = "node-toolbar-action-menu-item";
      const _0x4b417c = document.createElement("div");
      _0x4b417c.className = "node-toolbar-action-menu-icon";
      const _0x384987 = document.createElement("img");
      _0x384987.className = "node-toolbar-action-provider-logo";
      _0x384987.src = "images/RH.png";
      _0x384987.alt = "runninghub";
      _0x4b417c.appendChild(_0x384987);
      _0x30f3e3.appendChild(_0x4b417c);
      const _0x4450d1 = document.createElement("div");
      _0x4450d1.className = "node-toolbar-action-menu-body";
      const _0x63fe62 = document.createElement("span");
      _0x63fe62.className = "node-toolbar-action-menu-item-title";
      _0x63fe62.textContent = _0x56c61f();
      _0x4450d1.appendChild(_0x63fe62);
      const _0x33ceb5 = document.createElement("span");
      _0x33ceb5.className = "node-toolbar-action-menu-item-desc";
      _0x33ceb5.textContent = autoSubjectText("modeDesc");
      _0x4450d1.appendChild(_0x33ceb5);
      _0x30f3e3.appendChild(_0x4450d1);
      const _0x1edc81 = document.createElement("div");
      _0x1edc81.className = "node-toolbar-action-caret";
      _0x1edc81.innerHTML = "&gt;";
      _0x30f3e3.appendChild(_0x1edc81);
      _0x30f3e3.__v2LastPointerType = "mouse";
      _0x30f3e3.__v2SubjectSubOpen = false;
      _0x30f3e3.addEventListener("pointerdown", _0xb0d0b8 => {
        _0x30f3e3.__v2LastPointerType = _0xb0d0b8.pointerType || "mouse";
      });
      _0x30f3e3.addEventListener("click", _0x387e32 => {
        _0x387e32.stopPropagation();
        if (_0x30f3e3.__v2LastPointerType === "touch") {
          if (_0x5875ef && document.body.contains(_0x5875ef)) {
            _0x519f4c();
          } else {
            _0x4d00b3(_0x30f3e3);
            _0x30f3e3.__v2SubjectSubOpen = true;
          }
          return;
        }
        _0x4d00b3(_0x30f3e3);
        _0x30f3e3.__v2SubjectSubOpen = true;
      });
      _0x30f3e3.addEventListener("pointerenter", _0x525be2 => {
        if (_0x525be2.pointerType !== "mouse") {
          return;
        }
        _0x124b07();
        _0x4d00b3(_0x30f3e3);
        _0x30f3e3.__v2SubjectSubOpen = true;
      });
      _0x30f3e3.addEventListener("pointerleave", _0x1a6412 => {
        if (_0x1a6412.pointerType !== "mouse") {
          return;
        }
        _0x20ad18();
      });
      _0x2988be.appendChild(_0x30f3e3);
      document.body.appendChild(_0x2988be);
      positionToolbarActionSubmenuAbove(_0x3c09ec(), _0x2988be);
      _0x2988be.offsetHeight;
      _0x2988be.style.pointerEvents = "auto";
      _0x2988be.style.opacity = "1";
      _0x2988be.style.transform = "translateY(0)";
      _0x2988be.__v2SubjectClose = _0x26d5d7;
      const _0xd3a80d = () => {
        if (!document.body.contains(_0x2988be) || !document.body.contains(_0x486039)) {
          if (_0x3a9dae) {
            cancelAnimationFrame(_0x3a9dae);
          }
          _0x3a9dae = 0;
          return;
        }
        if (!_0x3c09ec.hasVisibleAnchor()) {
          _0x3a9dae = requestAnimationFrame(_0xd3a80d);
          return;
        }
        positionToolbarActionSubmenuAbove(_0x3c09ec(), _0x2988be);
        _0x3a9dae = requestAnimationFrame(_0xd3a80d);
      };
      _0x3a9dae = requestAnimationFrame(_0xd3a80d);
      _0x3ed4c9 = _0x440f7f => {
        if (!_0x2988be) {
          return;
        }
        const _0x46be81 = _0x2988be.contains(_0x440f7f.target);
        const _0x553c39 = _0x5875ef && _0x5875ef.contains(_0x440f7f.target);
        if (!_0x46be81 && !_0x553c39 && _0x440f7f.target !== _0x486039) {
          _0x26d5d7();
        }
      };
      _0x16b88c = _0x5cb445 => {
        if (!_0x2988be) {
          return;
        }
        const _0x4edc59 = _0x5cb445.target?.closest?.(".ftb-btn");
        if (!_0x4edc59) {
          return;
        }
        if (_0x4edc59.classList.contains("act-auto-subject")) {
          return;
        }
        _0x26d5d7();
      };
      setTimeout(() => {
        if (_0x3ed4c9) {
          document.addEventListener("pointerdown", _0x3ed4c9);
        }
      }, 10);
      if (_0x16b88c) {
        _0x5e64c9.addEventListener("pointerdown", _0x16b88c, true);
      }
      return _0x2988be;
    };
    _0x486039.addEventListener("click", _0x9ef91a => {
      _0x9ef91a.stopPropagation();
      _0x9ef91a.preventDefault();
      if (_0x2988be && document.body.contains(_0x2988be)) {
        _0x26d5d7();
        return;
      }
      _0x28d360();
    });
  }
}