import { getPersonReplacementCharacterBaseImageRef } from "./personReplacementProject.js";
import { resolvePersonReplacementVoiceInput } from "./personReplacementVoiceSeparationState.js";
import { PERSON_REPLACEMENT_EXPORT_MODES, exportPersonReplacementMedia } from "./personReplacementExport.js";
import { PERSON_REPLACEMENT_CANVAS_SCOPES } from "./personReplacementOutputCanvas.js";
import { PERSON_REPLACEMENT_OUTPUT_TRANSITIONS, transitionPersonReplacementOutput } from "./personReplacementOutputLineage.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { saveWorkspaceImageDownload } from "../workspaceImageDownload.js";
const PERSON_REPLACEMENT_COMPOSE_TASK_PURPOSE = "person-replacement-compose";
function normalizeText(_0x259ba0) {
  return String(_0x259ba0 ?? "").trim();
}
function cloneJson(_0x4b100e) {
  if (_0x4b100e && typeof _0x4b100e === "object") {
    return JSON.parse(JSON.stringify(_0x4b100e));
  } else {
    return _0x4b100e;
  }
}
function createCoalescedAsyncAction(_0x478374) {
  let _0x2637fd = null;
  return (..._0x72f796) => {
    if (_0x2637fd) {
      return _0x2637fd;
    }
    _0x2637fd = Promise.resolve().then(() => _0x478374(..._0x72f796)).finally(() => {
      _0x2637fd = null;
    });
    return _0x2637fd;
  };
}
function createKeyedCoalescedAsyncAction(_0x4682b8, _0x5002d0) {
  const _0x9599f2 = new Map();
  return (..._0x42936b) => {
    const _0x47c10f = normalizeText(_0x5002d0?.(..._0x42936b)) || "default";
    const _0x4ffc13 = _0x9599f2.get(_0x47c10f);
    if (_0x4ffc13) {
      return _0x4ffc13;
    }
    const _0x13ef94 = Promise.resolve().then(() => _0x4682b8(..._0x42936b)).finally(() => {
      if (_0x9599f2.get(_0x47c10f) === _0x13ef94) {
        _0x9599f2.delete(_0x47c10f);
      }
    });
    _0x9599f2.set(_0x47c10f, _0x13ef94);
    return _0x13ef94;
  };
}
function resolveMediaRef(_0x232cc5) {
  if (typeof _0x232cc5 === "string") {
    return normalizeText(_0x232cc5);
  }
  return normalizeText(pickResultLocalPath(_0x232cc5) || _0x232cc5?.displayUrl || _0x232cc5?.videoUrl || _0x232cc5?.imageUrl || _0x232cc5?.url || _0x232cc5?.originalUrl || _0x232cc5?.path);
}
function resolveMediaUrl(_0x9d0edf) {
  const _0x5d289b = resolveMediaRef(_0x9d0edf);
  if (_0x5d289b) {
    return localPathToUrl(_0x5d289b) || _0x5d289b;
  } else {
    return "";
  }
}
function resolveDirectOriginalTimelineRef(_0x50df47 = {}, _0x3878b7 = []) {
  if ((Array.isArray(_0x3878b7) ? _0x3878b7 : []).some(_0x230f9b => _0x230f9b?.isReversed === true)) {
    return "";
  }
  const _0xef9819 = Array.isArray(_0x50df47.sources) ? _0x50df47.sources : [];
  const _0x231d59 = new Map(_0xef9819.map(_0xa0e4c0 => [normalizeText(_0xa0e4c0.id), _0xa0e4c0]));
  const _0x5dc8ef = _0xef9819.length === 1 ? normalizeLocalPath(_0xef9819[0]?.videoRef) : "";
  const _0x3f4c24 = (Array.isArray(_0x3878b7) ? _0x3878b7 : []).map(_0x36e2b8 => normalizeLocalPath(_0x36e2b8?.sourceVideoRef || _0x231d59.get(normalizeText(_0x36e2b8?.sourceId))?.videoRef || _0x5dc8ef));
  if (!_0x3f4c24.length || _0x3f4c24.some(_0x2986b9 => !_0x2986b9)) {
    return "";
  }
  const _0x3ac47a = [...new Set(_0x3f4c24)];
  if (_0x3ac47a.length === 1) {
    return _0x3ac47a[0];
  } else {
    return "";
  }
}
function createWorkspacePresentationAdapter(_0x249418) {
  const _0x180104 = (_0x45ed0b, _0x398887) => {
    const _0x26926b = _0x249418?.();
    return _0x26926b?.[_0x45ed0b]?.(..._0x398887);
  };
  return Object.freeze({
    prewarmCompositeOriginalVideo(..._0x3ee714) {
      return _0x180104("prewarmCompositeOriginalVideo", _0x3ee714);
    },
    setComposeOutputState(..._0x234ee5) {
      return _0x180104("setComposeOutputState", _0x234ee5);
    },
    setExportOutputState(..._0x26f0b4) {
      return _0x180104("setExportOutputState", _0x26f0b4);
    },
    setOutputCanvasSyncState(..._0x730e8b) {
      return _0x180104("setOutputCanvasSyncState", _0x730e8b);
    }
  });
}
export function createPersonReplacementOutputCoordinator({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  projectSession: _0x2958ac,
  getWorkspace = () => null,
  prepareVideoReplacementShots = async () => ({
    ok: false
  }),
  createVoicePanel: _0x26f48b,
  enqueueMediaTask: _0x46dbdb,
  playCompletion = () => {},
  showCompletionNotification = () => {},
  saveMedia: _0x484905,
  saveMediaFiles: _0x5a1d28,
  createOutputCanvas = null,
  onRequestClose = () => {},
  showToast = () => {},
  exportMedia = exportPersonReplacementMedia,
  saveWorkspaceImage = saveWorkspaceImageDownload
} = {}) {
  if (typeof _0x2958ac?.getProject !== "function" || typeof _0x2958ac?.replace !== "function" || typeof _0x2958ac?.subscribe !== "function") {
    throw new TypeError("Replacement Studio Output Coordinator requires a project session");
  }
  let _0x398dec = _0x2958ac.getProject();
  const _0x29d51b = _0x2958ac.subscribe(_0x3b8801 => {
    _0x398dec = _0x3b8801.project;
  });
  const _0x288f39 = createWorkspacePresentationAdapter(getWorkspace);
  const _0x594e7b = new Set();
  const _0x7c11e9 = (_0x161576, {
    persist = true,
    sync = true,
    renderWorkspace = true
  } = {}) => _0x2958ac.replace(_0x161576, {
    persist: persist,
    presentation: !sync ? "none" : renderWorkspace ? "render" : "state"
  });
  async function _0x2a984d(_0x1177c8) {
    const _0x19e5f9 = await _0x46dbdb({
      kind: "audioVoiceCompose",
      src: _0x1177c8.src,
      args: {
        sourceKind: _0x1177c8.sourceKind,
        outputKind: "audio",
        durationSec: _0x1177c8.durationSec,
        clips: _0x1177c8.clips
      }
    }, {
      wait: true,
      timeout: 600000
    });
    const _0x23109e = resolveMediaRef(_0x19e5f9);
    if (!_0x19e5f9?.success || !_0x23109e) {
      throw new Error(_0x19e5f9?.error || _0x19e5f9?.message || "声音时间线合成失败");
    }
    return {
      localPath: _0x23109e,
      data: _0x19e5f9
    };
  }
  function _0x287a86(_0x1199ca, {
    sourceId: _0x5d6f80,
    onAudioPickStateChange = null
  } = {}) {
    const _0xfbf422 = _0x398dec.sources.filter(_0x57bc54 => _0x57bc54?.videoRef);
    const _0x4087e0 = _0xfbf422.find(_0x333c31 => _0x333c31.id === _0x5d6f80) || _0xfbf422[0];
    if (!_0x4087e0 || typeof _0x26f48b !== "function") {
      _0x1199ca.innerHTML = "<div class=\"person-replacement-inline-empty\">请先导入可用视频</div>";
      return null;
    }
    const _0x9f948c = new Map();
    const _0xeadb9b = Object.fromEntries(_0xfbf422.map(_0x1f4680 => {
      const _0x2885bf = "person-replacement-voice-" + _0x1f4680.id;
      const _0x5cf9aa = _0x398dec.shots.find(_0x2a093f => _0x2a093f?.sourceId === _0x1f4680.id && _0x2a093f?.keyframeRef)?.keyframeRef || "";
      const _0xf52a75 = _0x1f4680.thumbnailRef || _0x5cf9aa;
      const _0xb1e1d2 = resolvePersonReplacementVoiceInput(_0x398dec, _0x1f4680.id);
      const _0xb9ebc7 = _0xb1e1d2.kind === "clean-vocals";
      const _0x45a07d = _0xb9ebc7 ? _0xb1e1d2.mediaRef : _0x1f4680.videoRef;
      _0x9f948c.set(_0x2885bf, _0x1f4680.id);
      return [_0x2885bf, {
        ...(_0x398dec.audio.voiceStudioState?.[_0x1f4680.id] || {}),
        id: _0x2885bf,
        type: _0xb9ebc7 ? "source-audio" : "source-video",
        name: _0xb9ebc7 ? _0x1f4680.fileName + " · 清晰人声" : _0x1f4680.fileName,
        fileName: _0xb9ebc7 ? "清晰人声 · " + _0x1f4680.fileName : _0x1f4680.fileName,
        localPath: normalizeLocalPath(_0x45a07d) || _0x45a07d,
        originalLocalPath: normalizeLocalPath(_0x45a07d) || _0x45a07d,
        audioUrl: _0xb9ebc7 ? _0xb1e1d2.audioUrl || resolveMediaUrl(_0x45a07d) : "",
        videoUrl: resolveMediaUrl(_0x1f4680.videoRef),
        imageUrl: resolveMediaUrl(_0xf52a75),
        thumbUrl: resolveMediaUrl(_0xf52a75),
        videoDuration: _0x1f4680.durationSec || 0
      }];
    }));
    let _0x498e81 = "person-replacement-voice-" + _0x4087e0.id;
    const _0x36fd6d = {
      getState: () => ({
        nodes: _0xeadb9b,
        selectedNodeIds: [_0x498e81]
      }),
      updateNodeData: (_0x22f9b3, _0x52d7c4 = {}) => {
        const _0x5213c4 = _0x9f948c.get(_0x22f9b3);
        if (!_0x5213c4 || !_0xeadb9b[_0x22f9b3]) {
          return;
        }
        _0xeadb9b[_0x22f9b3] = {
          ..._0xeadb9b[_0x22f9b3],
          ..._0x52d7c4
        };
        _0x2958ac.replace({
          ..._0x398dec,
          audio: {
            ..._0x398dec.audio,
            selectedSourceId: _0x5213c4,
            voiceStudioState: {
              ..._0x398dec.audio.voiceStudioState,
              [_0x5213c4]: _0xeadb9b[_0x22f9b3]
            }
          }
        }, {
          presentation: "none",
          reason: "voice-studio-state"
        });
      },
      addNode() {},
      setSelectedNodes() {}
    };
    const _0x246f4e = documentObject.createElement("button");
    _0x246f4e.type = "button";
    _0x246f4e.hidden = true;
    _0x1199ca.appendChild(_0x246f4e);
    const _0x5bf008 = _0x26f48b({
      store: _0x36fd6d,
      fabBtnEl: _0x246f4e,
      root: _0x1199ca,
      windowObject: windowObject,
      embedded: true,
      composeTimeline: _0x2a984d,
      onAudioPickStateChange: onAudioPickStateChange,
      resolveStartAnalyzeConfirmation: ({
        sourceNodeId: _0x6294ed
      } = {}) => {
        const _0x1315ad = _0x9f948c.get(normalizeText(_0x6294ed)) || _0x4087e0.id;
        if (resolvePersonReplacementVoiceInput(_0x398dec, _0x1315ad).kind === "clean-vocals") {
          return null;
        }
        return {
          title: "未提取清晰人声",
          message: "当前音频未提取清晰人声，是否开始分析？",
          cancelLabel: "否",
          confirmLabel: "跳过，开始分析"
        };
      },
      onComposeResult: _0x3d41c7 => {
        const _0x225838 = resolveMediaRef(_0x3d41c7);
        if (!_0x225838) {
          return;
        }
        _0x7c11e9({
          ..._0x398dec,
          audio: {
            ..._0x398dec.audio,
            replacementAudioRef: _0x225838,
            composeStatus: "succeeded"
          }
        }, {
          renderWorkspace: false
        });
        showToast("声音时间线已合成并加入预览。", "success");
      }
    });
    _0x5bf008?.open?.({
      sourceNodeId: _0x498e81
    });
    return {
      selectSource(_0x38b871) {
        const _0x4afe56 = normalizeText(_0x38b871);
        const _0x264e4d = "person-replacement-voice-" + _0x4afe56;
        if (!_0x9f948c.has(_0x264e4d)) {
          return {
            selected: false,
            reason: "invalid-source",
            sourceId: _0x4afe56
          };
        }
        _0x498e81 = _0x264e4d;
        _0x5bf008?.open?.({
          sourceNodeId: _0x498e81,
          skipSubscriptionGate: true
        });
        return {
          selected: true,
          reason: "",
          sourceId: _0x4afe56
        };
      },
      canSelectVoiceAsset({
        segmentId = ""
      } = {}) {
        return _0x5bf008?.canSelectAudioReference?.({
          segmentId: segmentId
        }) === true;
      },
      selectVoiceAsset(_0x4d4b10, {
        segmentId = ""
      } = {}) {
        const _0x2f2880 = _0x398dec.characters.find(_0x50c83b => _0x50c83b.id === normalizeText(_0x4d4b10));
        const _0x2664d7 = _0x2f2880?.voiceReference || {};
        const _0x371de7 = normalizeLocalPath(_0x2664d7.localPath || _0x2f2880?.voiceRef);
        const _0x501141 = resolveMediaUrl(_0x371de7 || _0x2664d7.audioUrl || _0x2f2880?.voiceRef);
        if (!_0x2f2880 || !_0x501141) {
          return {
            applied: false,
            reason: "invalid",
            appliedIds: []
          };
        }
        return _0x5bf008?.selectAudioReference?.({
          id: "person-replacement-character-voice-" + _0x2f2880.id,
          type: "source-audio",
          name: _0x2f2880.name,
          fileName: _0x2664d7.fileName || _0x2f2880.name + "音频",
          localPath: _0x371de7,
          audioUrl: _0x501141,
          imageUrl: resolveMediaUrl(getPersonReplacementCharacterBaseImageRef(_0x2f2880))
        }, {
          segmentId: segmentId
        }) || {
          applied: false,
          reason: "unsupported",
          appliedIds: []
        };
      },
      destroy() {
        _0x5bf008?.destroy?.();
      }
    };
  }
  async function _0x9107eb() {
    let _0x291697 = [..._0x398dec.shots];
    const _0x49c4a7 = _0x291697.some(_0x4afe25 => normalizeLocalPath(_0x4afe25.resultVideoRef));
    if (!_0x49c4a7) {
      showToast("请先生成至少一个替换视频片段。", "warn");
      return null;
    }
    try {
      let _0x313668 = resolveDirectOriginalTimelineRef(_0x398dec, _0x291697);
      _0x288f39?.prewarmCompositeOriginalVideo?.(_0x313668);
      _0x288f39?.setComposeOutputState?.({
        pending: true
      });
      const _0x1a1e7c = _0x291697.filter(_0x2368db => !normalizeLocalPath(_0x2368db.videoRef) && (!normalizeLocalPath(_0x2368db.resultVideoRef) || !_0x313668)).map(_0x2b94c8 => normalizeText(_0x2b94c8.id)).filter(Boolean);
      if (_0x1a1e7c.length) {
        const _0x429e69 = await prepareVideoReplacementShots({
          shotIds: _0x1a1e7c,
          notify: false
        });
        if (!_0x429e69?.ok) {
          throw new Error("部分原视频片段尚未准备完成");
        }
        const _0x23229c = new Map(_0x398dec.shots.map(_0x3e0a3c => [normalizeText(_0x3e0a3c.id), _0x3e0a3c]));
        _0x291697 = _0x291697.map(_0x55f732 => _0x23229c.get(normalizeText(_0x55f732.id)) || _0x55f732);
        _0x313668 = resolveDirectOriginalTimelineRef(_0x398dec, _0x291697);
        _0x288f39?.prewarmCompositeOriginalVideo?.(_0x313668);
      }
      const _0x3b1602 = _0x291697.map(_0x20ac74 => normalizeText(_0x20ac74.id));
      const _0x4978ca = _0x291697.map(_0x4b42eb => normalizeLocalPath(_0x4b42eb.videoRef));
      if (!_0x313668 && _0x4978ca.some(_0x5d8887 => !_0x5d8887)) {
        throw new Error("合成所需的原视频片段不完整");
      }
      const _0x1f2f28 = _0x291697.map((_0x7853a8, _0x522ee4) => normalizeLocalPath(_0x7853a8.resultVideoRef) || _0x4978ca[_0x522ee4]);
      if (_0x1f2f28.some(_0x11e47d => !_0x11e47d)) {
        throw new Error("合成所需的替换视频片段不完整");
      }
      const _0x3b4631 = (_0x2d2b15, {
        includeAudio = true
      } = {}) => _0x2d2b15.length === 1 && includeAudio ? Promise.resolve({
        success: true,
        path: _0x2d2b15[0]
      }) : _0x46dbdb({
        kind: "videoCompose",
        purpose: PERSON_REPLACEMENT_COMPOSE_TASK_PURPOSE,
        srcs: _0x2d2b15,
        args: {
          includeAudio: includeAudio
        }
      }, {
        wait: true,
        timeout: 600000
      });
      const [_0x264a36, _0xf3e1f9] = await Promise.all([_0x3b4631(_0x1f2f28, {
        includeAudio: false
      }), _0x313668 ? Promise.resolve({
        success: true,
        path: _0x313668
      }) : _0x3b4631(_0x4978ca)]);
      const _0x322d61 = resolveMediaRef(_0x264a36);
      const _0x6227e3 = resolveMediaRef(_0xf3e1f9);
      if (!_0x322d61) {
        throw new Error("合成结果缺少可用视频");
      }
      if (!_0x6227e3) {
        throw new Error("原视频对照合成结果不可用");
      }
      const _0x5c95d8 = _0x7c11e9(transitionPersonReplacementOutput(_0x398dec, {
        type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.COMPOSITION_SUCCEEDED,
        originalMasterRef: _0x6227e3,
        visualMasterRef: _0x322d61,
        composedShotIds: _0x3b1602
      }));
      Promise.allSettled([Promise.resolve().then(() => playCompletion?.("person-replacement-video-compose")), Promise.resolve().then(() => showCompletionNotification?.({
        body: "人物替换视频合成完成。"
      }))]).then(_0x2d119f => {
        _0x2d119f.forEach(_0x277aba => {
          if (_0x277aba.status !== "rejected") {
            return;
          }
          console.warn("[replacementStudio] completion feedback failed", _0x277aba.reason);
        });
      });
      return {
        project: _0x5c95d8
      };
    } catch (_0x42aa3e) {
      showToast(_0x42aa3e?.message || "视频合成失败", "error");
      return null;
    } finally {
      _0x288f39?.setComposeOutputState?.({
        pending: false
      });
    }
  }
  async function _0xc021ea(_0x2ec797 = {}) {
    try {
      const _0x225a3a = await saveWorkspaceImage({
        imageRef: _0x2ec797.imageRef,
        filenameBase: _0x2ec797.filenameBase,
        title: _0x2ec797.title,
        saveMedia: _0x484905
      });
      if (_0x225a3a?.canceled) {
        return false;
      }
      if (_0x225a3a?.success === false) {
        throw new Error(_0x225a3a?.error || _0x225a3a?.message || "图片下载失败");
      }
      showToast("图片已保存。", "success");
      return _0x225a3a;
    } catch (_0xa80255) {
      showToast(_0xa80255?.message || "图片下载失败，请稍后重试。", "error");
      return false;
    }
  }
  async function _0x1fd99f(_0x151719 = {}) {
    const _0x4cf696 = _0x151719?.project || _0x398dec;
    const _0x505355 = normalizeText(_0x151719?.mode) || PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP;
    if (typeof _0x484905 !== "function" || typeof _0x5a1d28 !== "function") {
      showToast("当前环境无法导出素材。", "error");
      return false;
    }
    _0x288f39?.setExportOutputState?.({
      pending: true
    });
    try {
      let _0x5d179e = _0x4cf696;
      if (_0x505355 === PERSON_REPLACEMENT_EXPORT_MODES.FINAL_VIDEO) {
        const _0x46a4b3 = normalizeLocalPath(_0x4cf696.output?.visualMasterRef);
        if (!_0x46a4b3) {
          throw new Error("请先合成完整视频画面。");
        }
        const _0x579ab6 = _0x4cf696.audio?.exportTrack === "original" ? "original" : "replacement";
        const _0x5a5421 = normalizeLocalPath(_0x579ab6 === "original" ? _0x4cf696.audio?.originalAudioRef || _0x4cf696.output?.originalMasterRef : _0x4cf696.audio?.replacementAudioRef);
        if (!_0x5a5421) {
          throw new Error(_0x579ab6 === "original" ? "原视频音轨不可用。" : "请先在声音克隆页面合成替换音轨。");
        }
        const _0x31033b = await _0x46dbdb({
          kind: "videoAudioMux",
          purpose: PERSON_REPLACEMENT_COMPOSE_TASK_PURPOSE,
          src: _0x46a4b3,
          args: {
            audioSrc: _0x5a5421
          }
        }, {
          wait: true,
          timeout: 600000
        });
        const _0x10e088 = resolveMediaRef(_0x31033b);
        if (!_0x31033b?.success || !_0x10e088) {
          throw new Error(_0x31033b?.error || _0x31033b?.message || "完整视频封装失败。");
        }
        _0x5d179e = _0x7c11e9(transitionPersonReplacementOutput(_0x398dec, {
          type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.FINAL_MUX_SUCCEEDED,
          finalVideoRef: _0x10e088,
          finalAudioTrack: _0x579ab6
        }));
      }
      const _0x5de233 = await exportMedia({
        project: _0x5d179e,
        mode: _0x505355,
        saveMedia: _0x484905,
        saveMediaFiles: _0x5a1d28
      });
      if (_0x5de233?.canceled) {
        return false;
      }
      if (_0x5de233?.success === false) {
        throw new Error(_0x5de233?.error || _0x5de233?.message || "素材导出失败");
      }
      const _0x245601 = Math.max(0, Number(_0x5de233?.exportedCount) || 0);
      const _0x4f011c = Math.max(0, Number(_0x5de233?.skippedCount) || 0);
      showToast(_0x505355 === PERSON_REPLACEMENT_EXPORT_MODES.FINAL_VIDEO ? "完整视频已导出。" : _0x505355 === PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP ? "当前片段已导出。" : _0x4f011c ? "已导出 " + _0x245601 + " 个素材，跳过 " + _0x4f011c + " 个缺失项。" : "已导出 " + _0x245601 + " 个素材。", "success");
      return _0x5de233;
    } catch (_0x5b5cbf) {
      showToast(_0x5b5cbf?.message || "素材导出失败", "error");
      return false;
    } finally {
      _0x288f39?.setExportOutputState?.({
        pending: false
      });
    }
  }
  async function _0x732735(_0x47c3db = {}) {
    const _0x47e95b = _0x47c3db?.project || _0x398dec;
    const _0x4a406a = normalizeText(_0x47c3db?.scope) === PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT ? PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT : PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS;
    const _0x263285 = Math.max(1, Math.min(5, Math.trunc(Number(_0x47e95b.workspace?.step) || 1)));
    const _0x4ed68 = ["", "素材设定", "图像替换", "视频替换", "声音克隆", "替换片段"][_0x263285];
    if (typeof createOutputCanvas !== "function") {
      showToast("当前环境无法加入画布。", "error");
      return false;
    }
    _0x594e7b.add(_0x4a406a);
    _0x288f39?.setOutputCanvasSyncState?.({
      pending: true,
      scope: _0x4a406a
    });
    try {
      const _0x5b40ef = await createOutputCanvas({
        project: cloneJson(_0x47e95b),
        scope: _0x4a406a
      });
      const _0x342ad6 = _0x5b40ef?.binding?.nodes;
      if (!normalizeText(_0x5b40ef?.canvasId) || !_0x342ad6 || typeof _0x342ad6 !== "object" || Array.isArray(_0x342ad6) || !Object.keys(_0x342ad6).length) {
        throw new Error("加入画布后未返回有效的项目节点");
      }
      if (normalizeText(_0x398dec.id) !== normalizeText(_0x47e95b.id)) {
        return _0x5b40ef;
      }
      _0x7c11e9({
        ..._0x398dec,
        output: {
          ..._0x398dec.output,
          canvasBinding: {
            ..._0x5b40ef.binding,
            canvasId: normalizeText(_0x5b40ef.binding.canvasId || _0x5b40ef.canvasId),
            nodes: {
              ..._0x342ad6
            }
          }
        }
      });
      onRequestClose();
      showToast(_0x4a406a === PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT ? _0x5b40ef.reused ? "已更新画布中的整个人物替换项目。" : "已同步整个人物替换项目到画布。" : _0x5b40ef.reused ? "已更新画布中的" + _0x4ed68 + "内容。" : "已同步" + _0x4ed68 + "到画布。", "success");
      return _0x5b40ef;
    } catch (_0xac3054) {
      showToast(_0xac3054?.message || "人物替换项目加入画布失败", "error");
      return false;
    } finally {
      _0x594e7b.delete(_0x4a406a);
      _0x288f39?.setOutputCanvasSyncState?.({
        pending: _0x594e7b.size > 0,
        scope: [..._0x594e7b][0] || ""
      });
    }
  }
  const _0x5eda12 = createCoalescedAsyncAction(_0x9107eb);
  const _0x5b0949 = createCoalescedAsyncAction(_0x1fd99f);
  const _0x108b4c = createKeyedCoalescedAsyncAction(_0x732735, _0x512bad => _0x512bad?.scope);
  let _0x48733f = false;
  return Object.freeze({
    mountVoiceStudio: _0x287a86,
    composeOutput: _0x5eda12,
    downloadImage: _0xc021ea,
    exportOutput: _0x5b0949,
    addOutputToCanvas: _0x108b4c,
    destroy() {
      if (_0x48733f) {
        return;
      }
      _0x48733f = true;
      _0x29d51b?.();
    }
  });
}