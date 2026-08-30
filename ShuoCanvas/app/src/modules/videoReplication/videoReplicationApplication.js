import { runLocalMediaClipExport } from "../../../api/localMediaTaskApi.js";
import { localPathToUrl, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { VIDEO_REPLICATION_PROMPT_MODEL_ID, buildVideoReplicationGenerationPrompt } from "./videoReplicationPromptAnalysis.js";
import { normalizeVideoReplicationProject, normalizeVideoReplicationProjectLibrary, settleInterruptedVideoReplicationProjects, upsertVideoReplicationProject } from "./videoReplicationProject.js";
import { createVideoReplicationWorkspace } from "./videoReplicationWorkspace.js";
import { VIDEO_REPLICATION_DEFAULT_VIDEO_MODEL_ID, VIDEO_REPLICATION_MAX_CHARACTER_IMAGES, VIDEO_REPLICATION_MAX_SOURCE_CLIP_DURATION_SECONDS, generateVideoReplicationClip } from "./videoReplicationGeneration.js";
import { createWorkspacePersistenceCoordinator } from "../workspacePersistenceCoordinator.js";
import { getGenerationMediaItemSize } from "../generationRatioSource.js";
function normalizeText(_0xda475e, _0x3f1875 = "") {
  const _0x567eed = String(_0xda475e ?? "").trim();
  return _0x567eed || _0x3f1875;
}
function createId(_0x51ce4d) {
  const _0x1edee4 = globalThis.crypto?.randomUUID?.();
  return _0x51ce4d + "-" + (_0x1edee4 || Date.now() + "-" + Math.round(Math.random() * 100000));
}
function nowTimestamp() {
  return Date.now();
}
function getFileTitle(_0x1594ab, _0x625218 = 0) {
  return normalizeText(_0x1594ab?.name).replace(/^.*[\\/]/u, "").replace(/\.[^.]+$/u, "") || "第 " + (_0x625218 + 1) + " 集";
}
function resolveMediaRef(_0x46186a) {
  if (typeof _0x46186a === "string") {
    return normalizeText(_0x46186a);
  }
  return normalizeText(pickResultLocalPath(_0x46186a) || _0x46186a?.displayUrl || _0x46186a?.videoUrl || _0x46186a?.url || _0x46186a?.originalUrl || _0x46186a?.path);
}
function resolveMediaDuration(_0x424a94) {
  const _0x438848 = Number(_0x424a94?.durationSec ?? _0x424a94?.videoDuration ?? _0x424a94?.duration ?? _0x424a94?.metadata?.duration);
  if (Number.isFinite(_0x438848) && _0x438848 > 0) {
    return _0x438848;
  } else {
    return 0;
  }
}
export function createVideoReplicationFixedClipWindows(_0x3d7035, _0x4f865e) {
  const _0x36f354 = Math.max(0, Number(_0x3d7035) || 0);
  const _0x322968 = [15, 30].includes(Number(_0x4f865e)) ? Number(_0x4f865e) : 15;
  if (!_0x36f354) {
    return [];
  }
  const _0x2a0417 = [];
  for (let _0x40be68 = 0; _0x40be68 < _0x36f354; _0x40be68 += _0x322968) {
    const _0x4e6790 = Math.min(_0x36f354, _0x40be68 + _0x322968);
    _0x2a0417.push({
      index: _0x2a0417.length,
      startTimeSec: _0x40be68,
      endTimeSec: _0x4e6790,
      durationSec: _0x4e6790 - _0x40be68
    });
  }
  return _0x2a0417;
}
export function readVideoReplicationFileDuration(_0x58db2b, {
  documentObject = globalThis.document,
  urlObject = globalThis.URL
} = {}) {
  if (!_0x58db2b || !documentObject?.createElement || !urlObject?.createObjectURL) {
    return Promise.resolve(0);
  }
  return new Promise(_0x4cff21 => {
    const _0x203149 = documentObject.createElement("video");
    const _0x2b85ec = urlObject.createObjectURL(_0x58db2b);
    const _0x21274e = (_0x4593df = 0) => {
      _0x203149.removeAttribute?.("src");
      _0x203149.load?.();
      urlObject.revokeObjectURL?.(_0x2b85ec);
      _0x4cff21(Math.max(0, Number(_0x4593df) || 0));
    };
    _0x203149.preload = "metadata";
    _0x203149.onloadedmetadata = () => _0x21274e(_0x203149.duration);
    _0x203149.onerror = () => _0x21274e(0);
    _0x203149.src = _0x2b85ec;
  });
}
function cloneJson(_0x525a2f) {
  if (_0x525a2f && typeof _0x525a2f === "object") {
    return JSON.parse(JSON.stringify(_0x525a2f));
  } else {
    return _0x525a2f;
  }
}
function createAnalysisProject(_0x26541e, _0x59ee9a) {
  const _0x214a3f = nowTimestamp();
  const _0x3b06cf = _0x26541e.map(getFileTitle);
  const _0x418d64 = _0x3b06cf.length > 1 ? _0x3b06cf[0] + " 等 " + _0x3b06cf.length + " 集" : _0x3b06cf[0] || "未命名复刻项目";
  const _0x472fa9 = _0x26541e.map((_0x40cde1, _0x2d045b) => ({
    id: createId("video-replication-episode"),
    number: _0x2d045b + 1,
    title: getFileTitle(_0x40cde1, _0x2d045b),
    fileName: normalizeText(_0x40cde1?.name, "视频 " + (_0x2d045b + 1)),
    sourceVideoRef: "",
    durationSec: 0,
    clipLimitSeconds: _0x59ee9a.clipLimitSeconds,
    status: "uploading",
    progress: 1,
    error: "",
    clips: []
  }));
  return normalizeVideoReplicationProject({
    id: createId("video-replication"),
    title: _0x418d64,
    status: "analyzing",
    settings: _0x59ee9a,
    episodes: _0x472fa9,
    workspace: {
      step: 1,
      assetTab: "character",
      selectedAssetId: "",
      selectedEpisodeId: _0x472fa9[0]?.id || "",
      selectedClipId: "",
      episodeAssetTab: "assets"
    },
    selectedEpisodeId: _0x472fa9[0]?.id || "",
    createdAt: _0x214a3f,
    updatedAt: _0x214a3f
  });
}
function createFixedClipRecord(_0x5ae45e = {}, _0x46a920 = "") {
  const _0x3f60f7 = Math.max(0, Math.trunc(Number(_0x5ae45e.index) || 0));
  const _0xdb9936 = Math.max(0, Number(_0x5ae45e.startTimeSec) || 0);
  const _0x150784 = Math.max(_0xdb9936, Number(_0x5ae45e.endTimeSec) || 0);
  return {
    id: createId("video-replication-clip"),
    index: _0x3f60f7,
    title: "片段 " + String(_0x3f60f7 + 1).padStart(2, "0"),
    startTimeSec: _0xdb9936,
    endTimeSec: _0x150784,
    durationSec: Math.max(0, Number(_0x5ae45e.durationSec) || _0x150784 - _0xdb9936),
    sourceVideoRef: _0x46a920,
    videoRef: "",
    materializationStatus: "pending",
    materializationError: "",
    promptStatus: "pending",
    promptError: "",
    analysis: {},
    generationPrompt: "",
    generationPromptEdited: false,
    generation: {
      status: "idle",
      results: []
    },
    video: {
      results: [],
      activeIndex: 0
    }
  };
}
function getProjectCompletionStatus(_0x1b5b25 = {}) {
  const _0x56c74e = Array.isArray(_0x1b5b25.episodes) ? _0x1b5b25.episodes : [];
  if (_0x56c74e.some(_0x4223e8 => ["uploading", "cutting", "prompting"].includes(_0x4223e8.status))) {
    return "analyzing";
  }
  if (_0x56c74e.every(_0x31b561 => _0x31b561.status === "ready")) {
    return "ready";
  }
  if (_0x56c74e.every(_0x5ce2e0 => _0x5ce2e0.status === "failed")) {
    return "failed";
  }
  return "partial";
}
export function createVideoReplicationApplication({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  mountTarget = "#v2-wrap",
  uploadFile: _0x10d2e3,
  loadWorkspace = null,
  saveWorkspace = null,
  readVideoDuration = _0x562f0c => readVideoReplicationFileDuration(_0x562f0c, {
    documentObject: documentObject,
    urlObject: windowObject?.URL || globalThis.URL
  }),
  runClipExport = runLocalMediaClipExport,
  runVideoGeneration = null,
  generateClipTask = generateVideoReplicationClip,
  createWorkspace = createVideoReplicationWorkspace,
  showToast = windowObject?.showToast?.bind?.(windowObject) || (() => {})
} = {}) {
  let _0x27b291 = normalizeVideoReplicationProjectLibrary();
  let _0x6fefc = [];
  let _0x22181e = 15;
  let _0x212014 = true;
  let _0x281f90 = VIDEO_REPLICATION_PROMPT_MODEL_ID;
  let _0x144fe1 = "";
  let _0xfc27eb = "";
  let _0x306793 = "";
  let _0x190c50 = "home";
  let _0x49f221 = null;
  const _0x599d17 = new Map();
  const _0x121ab7 = new Set();
  let _0x4b61fa = "";
  let _0x168487 = false;
  let _0x19de90 = null;
  const _0x59ca2c = () => _0x27b291.projects.find(_0x2cdc93 => _0x2cdc93.id === _0x306793) || null;
  const _0x364e01 = _0x3a4166 => {
    const _0x4d1699 = _0x3a4166 + ":";
    return [..._0x599d17.keys()].some(_0x4a295a => _0x4a295a.startsWith(_0x4d1699)) || _0x121ab7.has(_0x3a4166);
  };
  const _0x21d162 = () => {
    if (_0x168487) {
      return;
    }
    _0x19de90?.setState?.({
      view: _0x190c50,
      sourceFiles: _0x6fefc,
      clipLimitSeconds: _0x22181e,
      useSourceVideoReference: _0x212014,
      promptModelId: _0x281f90,
      textProvider: _0x144fe1,
      textProviderProfileId: _0xfc27eb,
      projects: cloneJson(_0x27b291.projects),
      project: cloneJson(_0x59ca2c()),
      isAnalyzing: Boolean(_0x49f221),
      uploadingAssetKind: _0x4b61fa,
      isUploadingCharacters: _0x4b61fa === "character",
      isGenerating: _0x364e01(_0x306793)
    });
  };
  const _0x2b9762 = createWorkspacePersistenceCoordinator({
    ready: false,
    debounceMs: 350,
    save: saveWorkspace,
    getSnapshot: () => cloneJson(_0x27b291),
    setTimeoutFn: windowObject?.setTimeout?.bind?.(windowObject) || globalThis.setTimeout?.bind?.(globalThis),
    clearTimeoutFn: windowObject?.clearTimeout?.bind?.(windowObject) || globalThis.clearTimeout?.bind?.(globalThis),
    onError: _0x2cc338 => {
      console.warn("[videoReplication] persistence failed", _0x2cc338);
      showToast(_0x2cc338?.message || "复刻项目保存失败", "warn");
    }
  });
  const _0x20cf4d = ({
    immediate = false
  } = {}) => {
    if (_0x168487) {
      return 0;
    }
    return _0x2b9762.schedule({
      immediate: immediate
    });
  };
  const _0x40289 = (_0x46b474, {
    persist = true,
    render = true
  } = {}) => {
    if (_0x168487) {
      return null;
    }
    const _0x2903c8 = normalizeVideoReplicationProject({
      ..._0x46b474,
      updatedAt: nowTimestamp()
    });
    const _0x441a4c = _0x306793 || _0x2903c8.id;
    _0x27b291 = {
      ...upsertVideoReplicationProject(_0x27b291, _0x2903c8),
      currentProjectId: _0x441a4c
    };
    _0x306793 = _0x441a4c;
    if (render && (_0x190c50 !== "project" || _0x2903c8.id === _0x306793)) {
      _0x21d162();
    }
    if (persist) {
      _0x20cf4d();
    }
    return _0x2903c8;
  };
  const _0x28a703 = (_0x1856ae, _0x289a64, _0x4ab689 = {}) => {
    const _0x4f14c9 = _0x27b291.projects.find(_0x29b294 => _0x29b294.id === _0x1856ae);
    if (!_0x4f14c9 || typeof _0x289a64 !== "function") {
      return null;
    }
    return _0x40289(_0x289a64(cloneJson(_0x4f14c9)), _0x4ab689);
  };
  const _0x425bbc = (_0x2c6193, _0x58293e, _0x2eda86, _0x2e1c42 = {}) => _0x28a703(_0x2c6193, _0x1eb8a7 => {
    const _0x2e187a = _0x1eb8a7.episodes.map(_0x32f441 => _0x32f441.id === _0x58293e ? _0x2eda86({
      ..._0x32f441
    }) : _0x32f441);
    const _0x50cb1d = {
      ..._0x1eb8a7,
      episodes: _0x2e187a
    };
    return {
      ..._0x50cb1d,
      status: getProjectCompletionStatus(_0x50cb1d)
    };
  }, _0x2e1c42);
  const _0x324887 = (_0x14a418, _0x1a2a34, _0x57f437, _0x4c8383, _0x9d294b = {}) => _0x425bbc(_0x14a418, _0x1a2a34, _0x58d7ba => ({
    ..._0x58d7ba,
    clips: _0x58d7ba.clips.map(_0x21ec5f => _0x21ec5f.id === _0x57f437 ? _0x4c8383({
      ..._0x21ec5f
    }) : _0x21ec5f)
  }), _0x9d294b);
  const _0x433107 = (_0x43f734, _0x41ded7, _0x78126e) => _0x27b291.projects.find(_0x346964 => _0x346964.id === _0x43f734)?.episodes?.find(_0x2a0982 => _0x2a0982.id === _0x41ded7)?.clips?.find(_0x43322a => _0x43322a.id === _0x78126e) || null;
  const _0x24e43f = _0x2712a0 => {
    const _0x2fcfb5 = Array.isArray(_0x2712a0.characters) ? _0x2712a0.characters.length : 0;
    return {
      ..._0x2712a0,
      episodes: _0x2712a0.episodes.map(_0x2c7d41 => ({
        ..._0x2c7d41,
        clips: _0x2c7d41.clips.map(_0x348acb => ({
          ..._0x348acb,
          generationPrompt: !_0x348acb.generationPromptEdited && _0x348acb.analysis?.seedancePrompt ? buildVideoReplicationGenerationPrompt({
            analysis: _0x348acb.analysis,
            useSourceVideoReference: _0x2712a0.settings.useSourceVideoReference,
            characterCount: _0x2fcfb5
          }) : _0x348acb.generationPrompt
        }))
      }))
    };
  };
  let _0x2f61ca = false;
  const _0x179e67 = Promise.resolve().then(async () => {
    if (typeof loadWorkspace !== "function") {
      _0x2f61ca = true;
      return;
    }
    const _0x25298e = await loadWorkspace();
    const _0x49899f = settleInterruptedVideoReplicationProjects(_0x25298e || {});
    _0x27b291 = _0x49899f.library;
    if (_0x49899f.changed) {
      _0x20cf4d();
    }
    _0x21d162();
    _0x2f61ca = true;
  }).catch(_0x2feb29 => {
    console.warn("[videoReplication] hydration failed", _0x2feb29);
    _0x2b9762.setHydrationError(_0x2feb29);
    showToast("复刻工作室项目加载失败，已暂停自动保存以防覆盖数据。", "error");
  }).finally(() => {
    if (!_0x2f61ca) {
      return;
    }
    _0x2b9762.setReady(true, {
      immediate: _0x2b9762.isDirty()
    });
  });
  const _0x3cf8b6 = async (_0x35e17c, _0x128593, _0x534ca3, _0x21c5c5) => {
    const _0x84d990 = Promise.resolve(readVideoDuration(_0x534ca3));
    let _0x55e502;
    try {
      _0x55e502 = await _0x10d2e3(_0x534ca3, _0x35e17c);
    } catch (_0x19b2c2) {
      throw new Error("视频上传失败：" + (_0x19b2c2?.message || _0x19b2c2));
    }
    if (_0x168487 || _0x21c5c5.aborted) {
      throw new Error("解析任务已取消");
    }
    const _0x432018 = resolveMediaRef(_0x55e502);
    if (!_0x432018) {
      throw new Error("视频上传结果缺少可用地址");
    }
    const _0x250ced = resolveMediaDuration(_0x55e502) || Math.max(0, Number(await _0x84d990) || 0);
    if (!_0x250ced) {
      throw new Error("无法读取视频时长，暂时不能建立固定片段");
    }
    const _0x1bcb09 = createVideoReplicationFixedClipWindows(_0x250ced, _0x22181e);
    const _0x534725 = _0x1bcb09.map(_0x595362 => createFixedClipRecord(_0x595362, _0x432018));
    _0x425bbc(_0x35e17c, _0x128593, _0x1e1250 => ({
      ..._0x1e1250,
      sourceVideoRef: _0x432018,
      durationSec: _0x250ced,
      status: "cutting",
      progress: 10,
      clips: _0x534725
    }));
    let _0x245733 = 0;
    for (let _0x404d35 = 0; _0x404d35 < _0x534725.length; _0x404d35 += 1) {
      if (_0x21c5c5.aborted) {
        throw new Error("解析任务已取消");
      }
      const _0x25c8b5 = _0x534725[_0x404d35];
      try {
        const _0x5468d8 = await runClipExport({
          electronPayload: {
            kind: "videoCut",
            src: _0x432018,
            args: {
              start: _0x25c8b5.startTimeSec,
              end: _0x25c8b5.endTimeSec
            }
          },
          backendBody: {
            src: _0x432018,
            start: _0x25c8b5.startTimeSec,
            end: _0x25c8b5.endTimeSec
          }
        });
        if (_0x168487 || _0x21c5c5.aborted) {
          throw new Error("解析任务已取消");
        }
        const _0x2f1234 = resolveMediaRef(_0x5468d8);
        const _0x1a993a = getGenerationMediaItemSize(_0x5468d8);
        if (!_0x2f1234) {
          throw new Error("裁剪结果缺少可用视频地址");
        }
        _0x324887(_0x35e17c, _0x128593, _0x25c8b5.id, _0x18db22 => ({
          ..._0x18db22,
          videoRef: _0x2f1234,
          ...(_0x1a993a ? {
            videoWidth: _0x1a993a.width,
            videoHeight: _0x1a993a.height
          } : {}),
          materializationStatus: "ready",
          materializationError: ""
        }), {
          persist: false
        });
      } catch (_0x5a9361) {
        if (_0x168487 || _0x21c5c5.aborted) {
          throw _0x5a9361;
        }
        _0x245733 += 1;
        _0x324887(_0x35e17c, _0x128593, _0x25c8b5.id, _0x5e72c9 => ({
          ..._0x5e72c9,
          materializationStatus: "failed",
          materializationError: _0x5a9361?.message || "固定片段裁剪失败"
        }), {
          persist: false
        });
      }
      const _0x20d978 = Math.round(10 + (_0x404d35 + 1) / _0x534725.length * 90);
      _0x425bbc(_0x35e17c, _0x128593, _0x503273 => ({
        ..._0x503273,
        status: "cutting",
        progress: _0x20d978
      }), {
        persist: _0x404d35 !== _0x534725.length - 1
      });
    }
    _0x425bbc(_0x35e17c, _0x128593, _0x293489 => ({
      ..._0x293489,
      status: _0x245733 === _0x534725.length ? "failed" : _0x245733 ? "partial" : "ready",
      progress: 100,
      error: _0x245733 ? _0x245733 + " 个固定片段裁剪失败" : ""
    }));
  };
  const _0x31d8f8 = async () => {
    if (typeof loadWorkspace === "function") {
      await _0x179e67;
    }
    if (_0x168487) {
      return {
        ok: false,
        reason: "destroyed"
      };
    }
    if (_0x49f221) {
      showToast("当前复刻项目正在解析。", "info");
      return {
        ok: false,
        reason: "already-running"
      };
    }
    if (!_0x6fefc.length) {
      showToast("请先选择参考视频。", "warn");
      return {
        ok: false,
        reason: "missing-source"
      };
    }
    if (typeof _0x10d2e3 !== "function" || typeof readVideoDuration !== "function" || typeof runClipExport !== "function") {
      showToast("复刻视频准备服务尚未初始化。", "error");
      return {
        ok: false,
        reason: "service-unavailable"
      };
    }
    const _0x407cb7 = [..._0x6fefc];
    const _0x43cdf7 = createAnalysisProject(_0x407cb7, {
      clipLimitSeconds: _0x22181e,
      useSourceVideoReference: _0x212014,
      promptModelId: _0x281f90,
      textProvider: _0x144fe1,
      textProviderProfileId: _0xfc27eb,
      videoModelId: VIDEO_REPLICATION_DEFAULT_VIDEO_MODEL_ID,
      resolution: "720p",
      aspectRatio: "adaptive"
    });
    _0x306793 = _0x43cdf7.id;
    _0x190c50 = "project";
    _0x6fefc = [];
    _0x49f221 = new AbortController();
    const _0x21d575 = _0x49f221.signal;
    _0x40289(_0x43cdf7);
    showToast("已进入素材设定，正在后台按固定时长准备视频片段。", "info");
    for (let _0x2656f9 = 0; _0x2656f9 < _0x43cdf7.episodes.length; _0x2656f9 += 1) {
      const _0x3e0979 = _0x43cdf7.episodes[_0x2656f9];
      try {
        await _0x3cf8b6(_0x43cdf7.id, _0x3e0979.id, _0x407cb7[_0x2656f9], _0x21d575);
      } catch (_0x2ad13a) {
        if (_0x21d575.aborted) {
          break;
        }
        _0x425bbc(_0x43cdf7.id, _0x3e0979.id, _0x3ddfc8 => ({
          ..._0x3ddfc8,
          status: "failed",
          progress: 100,
          error: _0x2ad13a?.message || "视频片段准备失败"
        }));
      }
    }
    if (_0x49f221?.signal === _0x21d575) {
      _0x49f221 = null;
    }
    if (_0x168487 || _0x21d575.aborted) {
      return {
        ok: false,
        reason: "cancelled"
      };
    }
    const _0x5f57d2 = _0x28a703(_0x43cdf7.id, _0x3a9fbc => ({
      ..._0x3a9fbc,
      status: getProjectCompletionStatus(_0x3a9fbc)
    }));
    _0x21d162();
    const _0x3075ee = _0x5f57d2?.episodes?.filter(_0x5f43f7 => ["ready", "partial"].includes(_0x5f43f7.status)).length || 0;
    showToast(_0x3075ee ? "固定片段准备完成，共 " + _0x3075ee + " 集；提示词反推将在后续接入。" : "视频片段准备未完成，请查看失败原因。", _0x3075ee ? "success" : "warn");
    return {
      ok: _0x3075ee > 0,
      project: cloneJson(_0x5f57d2)
    };
  };
  const _0x47c119 = _0x4a4176 => _0x4a4176 === "scene" ? "scenes" : _0x4a4176 === "prop" ? "props" : "characters";
  const _0x514e9d = _0x2b7b45 => _0x2b7b45 === "scene" ? "场景" : _0x2b7b45 === "prop" ? "道具" : "人物";
  const _0x59a5c6 = async (_0x2a6727 = "character", _0x49f51e = []) => {
    await _0x179e67;
    if (_0x168487) {
      return {
        ok: false,
        reason: "destroyed"
      };
    }
    const _0x4e10ac = _0x59ca2c();
    const _0x2ce0a9 = ["character", "scene", "prop"].includes(_0x2a6727) ? _0x2a6727 : "character";
    const _0x230825 = _0x47c119(_0x2ce0a9);
    const _0x54b310 = Array.isArray(_0x4e10ac?.[_0x230825]) ? _0x4e10ac[_0x230825] : [];
    const _0x3756e1 = _0x2ce0a9 === "character" ? VIDEO_REPLICATION_MAX_CHARACTER_IMAGES : 60;
    const _0x603e45 = Math.max(0, _0x3756e1 - _0x54b310.length);
    const _0x11e58a = (Array.isArray(_0x49f51e) ? _0x49f51e : []).filter(Boolean).slice(0, _0x603e45);
    if (!_0x4e10ac || !_0x11e58a.length || _0x4b61fa) {
      if (_0x4e10ac && _0x603e45 <= 0) {
        showToast(_0x2ce0a9 === "character" ? "当前项目最多保留 " + VIDEO_REPLICATION_MAX_CHARACTER_IMAGES + " 张人物设定图。" : _0x514e9d(_0x2ce0a9) + "素材数量已达到当前界面上限。", "warn");
      }
      return {
        ok: false,
        reason: "unavailable"
      };
    }
    if (_0x364e01(_0x4e10ac.id)) {
      showToast("视频生成中，暂时不能修改人物素材。", "warn");
      return {
        ok: false,
        reason: "generation-running"
      };
    }
    if (typeof _0x10d2e3 !== "function") {
      showToast("人物素材上传服务尚未初始化。", "error");
      return {
        ok: false,
        reason: "service-unavailable"
      };
    }
    _0x4b61fa = _0x2ce0a9;
    _0x21d162();
    const _0x173e7f = [];
    const _0x4b3dc7 = [];
    for (let _0x2b1a51 = 0; _0x2b1a51 < _0x11e58a.length; _0x2b1a51 += 1) {
      const _0x5a897f = _0x11e58a[_0x2b1a51];
      try {
        const _0x1591ba = await _0x10d2e3(_0x5a897f, _0x4e10ac.id);
        if (_0x168487) {
          _0x4b61fa = "";
          return {
            ok: false,
            reason: "destroyed"
          };
        }
        const _0x4fdebd = resolveMediaRef(_0x1591ba);
        if (!_0x4fdebd) {
          throw new Error("上传结果缺少可用图片地址");
        }
        const _0x13a21d = getGenerationMediaItemSize(_0x1591ba) || getGenerationMediaItemSize(_0x5a897f);
        _0x173e7f.push({
          id: createId("video-replication-" + _0x2ce0a9),
          name: getFileTitle(_0x5a897f, _0x54b310.length + _0x2b1a51),
          kind: _0x2ce0a9,
          description: "",
          imageRef: _0x4fdebd,
          ...(_0x13a21d ? {
            imageWidth: _0x13a21d.width,
            imageHeight: _0x13a21d.height
          } : {})
        });
      } catch (_0x5c69de) {
        _0x4b3dc7.push(_0x5c69de?.message || _0x514e9d(_0x2ce0a9) + "图片上传失败");
      }
    }
    _0x4b61fa = "";
    if (_0x173e7f.length) {
      _0x28a703(_0x4e10ac.id, _0x32c5c4 => {
        const _0x48201a = {
          ..._0x32c5c4,
          [_0x230825]: [...(Array.isArray(_0x32c5c4[_0x230825]) ? _0x32c5c4[_0x230825] : []), ..._0x173e7f],
          workspace: {
            ..._0x32c5c4.workspace,
            assetTab: _0x2ce0a9,
            selectedAssetId: _0x173e7f[0]?.id || ""
          }
        };
        if (_0x2ce0a9 === "character") {
          return _0x24e43f(_0x48201a);
        } else {
          return _0x48201a;
        }
      });
    } else {
      _0x21d162();
    }
    if (_0x306793 !== _0x4e10ac.id) {
      _0x21d162();
    }
    showToast(_0x173e7f.length ? "已添加 " + _0x173e7f.length + " 张" + _0x514e9d(_0x2ce0a9) + "素材。" : _0x4b3dc7[0] || _0x514e9d(_0x2ce0a9) + "图片上传失败。", _0x173e7f.length ? "success" : "error");
    return {
      ok: _0x173e7f.length > 0,
      added: _0x173e7f.length,
      errors: _0x4b3dc7
    };
  };
  const _0x341b99 = (_0xe4b314 = []) => _0x59a5c6("character", _0xe4b314);
  const _0x196910 = ({
    kind = "character",
    assetId = ""
  } = {}) => {
    const _0x142ce0 = _0x59ca2c();
    if (!_0x142ce0) {
      return false;
    }
    if (_0x364e01(_0x142ce0.id)) {
      showToast("视频生成中，暂时不能修改人物素材。", "warn");
      return false;
    }
    const _0x36219a = ["character", "scene", "prop"].includes(kind) ? kind : "character";
    const _0x4a2653 = _0x47c119(_0x36219a);
    const _0x52b498 = Array.isArray(_0x142ce0[_0x4a2653]) ? _0x142ce0[_0x4a2653] : [];
    const _0x42ef9b = _0x52b498.filter(_0xb59b32 => _0xb59b32.id !== assetId);
    if (_0x42ef9b.length === _0x52b498.length) {
      return false;
    }
    const _0x28d5f2 = {
      ..._0x142ce0,
      [_0x4a2653]: _0x42ef9b,
      workspace: {
        ..._0x142ce0.workspace,
        selectedAssetId: _0x142ce0.workspace?.selectedAssetId === assetId ? _0x42ef9b[0]?.id || "" : _0x142ce0.workspace?.selectedAssetId || ""
      }
    };
    _0x40289(_0x36219a === "character" ? _0x24e43f(_0x28d5f2) : _0x28d5f2);
    return true;
  };
  const _0x170dd4 = _0x178ee9 => _0x196910({
    kind: "character",
    assetId: _0x178ee9
  });
  const _0x22dce8 = ({
    episodeId: _0x2028dc,
    clipId: _0x20873e,
    prompt: _0x1ebb77
  }) => {
    const _0x5aca34 = _0x59ca2c();
    if (!_0x5aca34) {
      return false;
    }
    const _0x42f542 = normalizeText(_0x1ebb77);
    _0x324887(_0x5aca34.id, _0x2028dc, _0x20873e, _0x10bcb3 => ({
      ..._0x10bcb3,
      generationPrompt: _0x42f542,
      generationPromptEdited: true,
      promptStatus: _0x42f542 ? "ready" : "failed",
      promptError: _0x42f542 ? "" : "生成提示词不能为空"
    }), {
      render: false
    });
    return true;
  };
  const _0x30a023 = ({
    kind = "character",
    assetId = "",
    description = ""
  } = {}) => {
    const _0x56f6b9 = _0x59ca2c();
    if (!_0x56f6b9) {
      return false;
    }
    const _0x3af4b1 = ["character", "scene", "prop"].includes(kind) ? kind : "character";
    const _0x124aee = _0x47c119(_0x3af4b1);
    const _0x35b308 = Array.isArray(_0x56f6b9[_0x124aee]) ? _0x56f6b9[_0x124aee] : [];
    if (!_0x35b308.some(_0x1430e6 => _0x1430e6.id === assetId)) {
      return false;
    }
    _0x28a703(_0x56f6b9.id, _0x4a6fa7 => ({
      ..._0x4a6fa7,
      [_0x124aee]: _0x4a6fa7[_0x124aee].map(_0x94b199 => _0x94b199.id === assetId ? {
        ..._0x94b199,
        description: String(description ?? "")
      } : _0x94b199)
    }), {
      render: false
    });
    return true;
  };
  const _0x3b3477 = (_0x1bcd2f, _0x11cbd4) => {
    const _0x6738b = normalizeText(_0x11cbd4);
    if (!_0x6738b) {
      _0x21d162();
      return false;
    }
    return Boolean(_0x28a703(_0x1bcd2f, _0x5adb2d => ({
      ..._0x5adb2d,
      title: _0x6738b
    })));
  };
  const _0x363d00 = _0x280973 => {
    const _0x554e4f = _0x27b291.projects.find(_0x1162d4 => _0x1162d4.id === _0x280973);
    if (!_0x554e4f) {
      return false;
    }
    const _0x2b3f6c = nowTimestamp();
    const _0x2dece5 = new Map();
    const _0xe83117 = new Map();
    const _0x1fc5c5 = _0x554e4f.episodes.map(_0x2e05cf => {
      const _0x2d7bec = createId("video-replication-episode");
      _0x2dece5.set(_0x2e05cf.id, _0x2d7bec);
      return {
        ...cloneJson(_0x2e05cf),
        id: _0x2d7bec,
        clips: _0x2e05cf.clips.map(_0x398ccc => ({
          ...cloneJson(_0x398ccc),
          id: createId("video-replication-clip"),
          generation: {
            status: "idle",
            error: "",
            results: []
          },
          video: {
            results: [],
            activeIndex: 0
          }
        }))
      };
    });
    const _0x1aa9c3 = (_0x2775e9, _0x5b3044) => _0x2775e9.map(_0x13ad63 => {
      const _0x15a969 = createId("video-replication-" + _0x5b3044);
      _0xe83117.set(_0x13ad63.id, _0x15a969);
      return {
        ...cloneJson(_0x13ad63),
        id: _0x15a969
      };
    });
    const _0x49e50b = _0x2dece5.get(_0x554e4f.workspace?.selectedEpisodeId) || _0x1fc5c5[0]?.id || "";
    const _0x5e7cf1 = _0x1fc5c5.find(_0x568aa4 => _0x568aa4.id === _0x49e50b);
    const _0x828530 = normalizeVideoReplicationProject({
      ...cloneJson(_0x554e4f),
      id: createId("video-replication"),
      title: _0x554e4f.title + " 副本",
      status: getProjectCompletionStatus({
        episodes: _0x1fc5c5
      }),
      characters: _0x1aa9c3(_0x554e4f.characters || [], "character"),
      scenes: _0x1aa9c3(_0x554e4f.scenes || [], "scene"),
      props: _0x1aa9c3(_0x554e4f.props || [], "prop"),
      episodes: _0x1fc5c5,
      workspace: {
        ..._0x554e4f.workspace,
        selectedAssetId: _0xe83117.get(_0x554e4f.workspace?.selectedAssetId) || "",
        selectedEpisodeId: _0x49e50b,
        selectedClipId: _0x5e7cf1?.clips?.[0]?.id || ""
      },
      selectedEpisodeId: _0x49e50b,
      createdAt: _0x2b3f6c,
      updatedAt: _0x2b3f6c,
      archivedAt: 0
    });
    _0x27b291 = upsertVideoReplicationProject(_0x27b291, _0x828530);
    _0x27b291.currentProjectId = _0x306793;
    _0x20cf4d();
    _0x21d162();
    showToast("已复制复刻项目。", "success");
    return true;
  };
  const _0x1b77aa = (_0x3768c7, _0x564ad4) => {
    const _0x7bd5f3 = _0x28a703(_0x3768c7, _0x252d71 => ({
      ..._0x252d71,
      archivedAt: _0x564ad4 ? nowTimestamp() : 0
    }));
    if (_0x7bd5f3) {
      showToast(_0x564ad4 ? "项目已归档。" : "项目已恢复。", "success");
    }
    return Boolean(_0x7bd5f3);
  };
  const _0x34b785 = _0x1bc643 => {
    const _0x2c6e86 = _0x27b291.projects.length;
    const _0x56e4dd = _0x27b291.projects.filter(_0x1573ff => _0x1573ff.id !== _0x1bc643);
    if (_0x56e4dd.length === _0x2c6e86) {
      return false;
    }
    if (_0x306793 === _0x1bc643) {
      _0x306793 = _0x56e4dd[0]?.id || "";
    }
    _0x27b291 = {
      ..._0x27b291,
      currentProjectId: _0x306793,
      projects: _0x56e4dd
    };
    if (_0x190c50 === "project" && !_0x59ca2c()) {
      _0x190c50 = "home";
    }
    _0x20cf4d();
    _0x21d162();
    showToast("复刻项目已删除。", "success");
    return true;
  };
  const _0x5a086e = async ({
    projectId = _0x306793,
    episodeId: _0x5c1ede,
    clipId: _0x4cd555,
    notify = true
  } = {}) => {
    await _0x179e67;
    if (_0x168487) {
      return {
        ok: false,
        reason: "destroyed"
      };
    }
    const _0x3f509f = _0x27b291.projects.find(_0x5a3a19 => _0x5a3a19.id === projectId);
    const _0x2a3c4e = _0x433107(projectId, _0x5c1ede, _0x4cd555);
    if (!_0x3f509f || !_0x2a3c4e) {
      return {
        ok: false,
        reason: "missing-clip"
      };
    }
    if (!_0x3f509f.characters.length) {
      if (notify) {
        showToast("请先上传人物设定图。", "warn");
      }
      return {
        ok: false,
        reason: "missing-characters"
      };
    }
    if (typeof generateClipTask !== "function") {
      if (notify) {
        showToast("视频生成服务尚未初始化。", "error");
      }
      return {
        ok: false,
        reason: "service-unavailable"
      };
    }
    const _0x3f2d84 = projectId + ":" + _0x5c1ede + ":" + _0x4cd555;
    if (_0x599d17.has(_0x3f2d84)) {
      return {
        ok: false,
        reason: "already-running"
      };
    }
    const _0x37b3c3 = normalizeText(_0x2a3c4e.generationPrompt) || buildVideoReplicationGenerationPrompt({
      analysis: _0x2a3c4e.analysis,
      useSourceVideoReference: _0x3f509f.settings.useSourceVideoReference,
      characterCount: _0x3f509f.characters.length
    });
    if (!_0x37b3c3) {
      if (notify) {
        showToast("当前片段缺少可用的生成提示词。", "warn");
      }
      return {
        ok: false,
        reason: "missing-prompt"
      };
    }
    const _0x3c44bf = new AbortController();
    _0x599d17.set(_0x3f2d84, _0x3c44bf);
    _0x324887(projectId, _0x5c1ede, _0x4cd555, _0x3d79b3 => ({
      ..._0x3d79b3,
      generationPrompt: _0x37b3c3,
      generation: {
        ..._0x3d79b3.generation,
        status: "submitting",
        error: ""
      }
    }));
    try {
      const _0x4195db = await generateClipTask({
        projectId: projectId,
        episodeId: _0x5c1ede,
        clipId: _0x4cd555,
        settings: _0x3f509f.settings,
        characterImages: _0x3f509f.characters,
        getClip: () => _0x433107(projectId, _0x5c1ede, _0x4cd555),
        updateClip: _0x8c08a9 => _0x324887(projectId, _0x5c1ede, _0x4cd555, () => _0x8c08a9),
        abortController: _0x3c44bf,
        ...(typeof runVideoGeneration === "function" ? {
          runVideoGeneration: runVideoGeneration
        } : {})
      });
      if (_0x168487) {
        return {
          ok: false,
          reason: "destroyed"
        };
      }
      if (!_0x4195db?.ok) {
        const _0x23f367 = _0x4195db?.error?.getUserMessage?.() || _0x4195db?.error?.message || _0x4195db?.readiness?.message || "视频生成失败";
        _0x324887(projectId, _0x5c1ede, _0x4cd555, _0x21ddff => ({
          ..._0x21ddff,
          generation: {
            ..._0x21ddff.generation,
            status: "failed",
            error: _0x23f367
          }
        }));
        if (notify) {
          showToast(_0x23f367, "error");
        }
        return {
          ..._0x4195db,
          ok: false,
          error: _0x23f367
        };
      }
      if (notify) {
        showToast("复刻视频已生成。", "success");
      }
      return _0x4195db;
    } catch (_0x30f4a2) {
      if (_0x168487 || _0x3c44bf.signal.aborted) {
        return {
          ok: false,
          reason: "cancelled"
        };
      }
      const _0x40d9d0 = _0x30f4a2?.message || "视频生成失败";
      _0x324887(projectId, _0x5c1ede, _0x4cd555, _0x4b470b => ({
        ..._0x4b470b,
        generation: {
          ..._0x4b470b.generation,
          status: "failed",
          error: _0x40d9d0
        }
      }));
      if (notify) {
        showToast(_0x40d9d0, "error");
      }
      return {
        ok: false,
        error: _0x40d9d0
      };
    } finally {
      if (_0x599d17.get(_0x3f2d84) === _0x3c44bf) {
        _0x599d17.delete(_0x3f2d84);
      }
      if (!_0x168487) {
        _0x20cf4d();
      }
      if (_0x190c50 === "project" && _0x306793 === projectId) {
        _0x21d162();
      }
    }
  };
  const _0x33e848 = async () => {
    await _0x179e67;
    if (_0x168487) {
      return {
        ok: false,
        reason: "destroyed"
      };
    }
    const _0x3cd80c = _0x59ca2c();
    if (!_0x3cd80c) {
      return {
        ok: false,
        reason: "missing-project"
      };
    }
    if (_0x121ab7.has(_0x3cd80c.id)) {
      return {
        ok: false,
        reason: "already-running"
      };
    }
    if (!_0x3cd80c.characters.length) {
      showToast("请先上传人物设定图。", "warn");
      return {
        ok: false,
        reason: "missing-characters"
      };
    }
    const _0x1f978a = _0x3cd80c.episodes.flatMap(_0x57a410 => _0x57a410.clips.filter(_0x4d83a0 => _0x4d83a0.promptStatus === "ready" && Boolean(normalizeText(_0x4d83a0.generationPrompt) || normalizeText(_0x4d83a0.analysis?.seedancePrompt)) && Number(_0x4d83a0.durationSec || 0) <= VIDEO_REPLICATION_MAX_SOURCE_CLIP_DURATION_SECONDS && (!Array.isArray(_0x4d83a0.video?.results) || !_0x4d83a0.video.results.length) && !_0x599d17.has(_0x3cd80c.id + ":" + _0x57a410.id + ":" + _0x4d83a0.id)).map(_0x98c415 => ({
      projectId: _0x3cd80c.id,
      episodeId: _0x57a410.id,
      clipId: _0x98c415.id
    })));
    const _0x4149a1 = _0x3cd80c.episodes.reduce((_0x3846a3, _0x273d4c) => _0x3846a3 + _0x273d4c.clips.filter(_0x3fadd6 => _0x3fadd6.promptStatus === "ready" && Number(_0x3fadd6.durationSec || 0) > VIDEO_REPLICATION_MAX_SOURCE_CLIP_DURATION_SECONDS).length, 0);
    if (!_0x1f978a.length) {
      showToast("没有可生成的片段；当前 Seedance 2.0 仅支持最长 15 秒。", "warn");
      return {
        ok: false,
        reason: "no-eligible-clips"
      };
    }
    _0x121ab7.add(_0x3cd80c.id);
    _0x21d162();
    let _0x2772e6 = 0;
    let _0x168eab = 0;
    try {
      showToast("开始批量生成 " + _0x1f978a.length + " 个片段。", "info");
      for (const _0x3a8f84 of _0x1f978a) {
        if (_0x168487) {
          break;
        }
        const _0x1fb1d9 = await _0x5a086e({
          ..._0x3a8f84,
          notify: false
        });
        if (_0x1fb1d9?.ok) {
          _0x2772e6 += 1;
        } else {
          _0x168eab += 1;
        }
      }
      if (_0x168487) {
        return {
          ok: false,
          reason: "cancelled"
        };
      }
      showToast(_0x168eab ? "批量生成完成：成功 " + _0x2772e6 + " 个，失败 " + _0x168eab + " 个" + (_0x4149a1 ? "，另有 " + _0x4149a1 + " 个超过 15 秒未提交" : "") + "。" : "批量生成完成：" + _0x2772e6 + " 个片段已生成" + (_0x4149a1 ? "，另有 " + _0x4149a1 + " 个超过 15 秒未提交" : "") + "。", _0x168eab ? "warn" : "success");
      return {
        ok: _0x2772e6 > 0,
        succeeded: _0x2772e6,
        failed: _0x168eab
      };
    } finally {
      _0x121ab7.delete(_0x3cd80c.id);
      if (_0x190c50 === "project" && _0x306793 === _0x3cd80c.id) {
        _0x21d162();
      }
    }
  };
  const _0x31cd39 = (_0x9eb301 = {}) => {
    const _0x4c1f2c = _0x59ca2c();
    if (!_0x4c1f2c) {
      return false;
    }
    _0x40289({
      ..._0x4c1f2c,
      workspace: {
        ..._0x4c1f2c.workspace,
        ..._0x9eb301
      },
      ...(_0x9eb301.selectedEpisodeId ? {
        selectedEpisodeId: _0x9eb301.selectedEpisodeId
      } : {})
    });
    return true;
  };
  _0x19de90 = createWorkspace({
    documentObject: documentObject,
    windowObject: windowObject,
    mountTarget: mountTarget,
    onSourceVideosSelected(_0x28c121) {
      _0x6fefc = Array.isArray(_0x28c121) ? _0x28c121 : [];
      _0x21d162();
    },
    onClipLimitChanged(_0x3f31f9) {
      _0x22181e = [15, 30].includes(Number(_0x3f31f9)) ? Number(_0x3f31f9) : 15;
      _0x21d162();
    },
    onSourceReferenceChanged(_0x8784de) {
      _0x212014 = _0x8784de !== false;
      _0x21d162();
    },
    onTextModelChanged({
      modelId: _0x289656,
      provider: _0x407811,
      providerProfileId: _0x46c5cc
    } = {}) {
      _0x281f90 = normalizeText(_0x289656, _0x281f90);
      _0x144fe1 = normalizeText(_0x407811);
      _0xfc27eb = normalizeText(_0x46c5cc);
      _0x21d162();
    },
    onStartAnalysis: _0x31d8f8,
    onOpenProject(_0xa3ff08) {
      const _0x69258e = _0x27b291.projects.find(_0x2a4f0b => _0x2a4f0b.id === _0xa3ff08);
      if (!_0x69258e) {
        return false;
      }
      _0x306793 = _0x69258e.id;
      _0x27b291 = {
        ..._0x27b291,
        currentProjectId: _0x69258e.id
      };
      _0x190c50 = "project";
      _0x21d162();
      _0x20cf4d();
      return true;
    },
    onBackHome() {
      _0x190c50 = "home";
      _0x21d162();
    },
    onProjectStepChanged(_0x49258a) {
      return _0x31cd39({
        step: Number(_0x49258a) === 2 ? 2 : 1
      });
    },
    onAssetTabChanged(_0x16e824) {
      return _0x31cd39({
        assetTab: ["character", "scene", "prop", "library"].includes(_0x16e824) ? _0x16e824 : "character",
        selectedAssetId: ""
      });
    },
    onAssetSelected({
      kind: _0xf765a2,
      assetId: _0x1dd2be
    } = {}) {
      return _0x31cd39({
        assetTab: ["character", "scene", "prop", "library"].includes(_0xf765a2) ? _0xf765a2 : "character",
        selectedAssetId: normalizeText(_0x1dd2be)
      });
    },
    onEpisodeSelected(_0x1ee30e) {
      const _0x253ce5 = _0x59ca2c();
      const _0xb739fc = _0x253ce5?.episodes?.find(_0x5f2447 => _0x5f2447.id === _0x1ee30e);
      if (!_0xb739fc) {
        return false;
      }
      return _0x31cd39({
        selectedEpisodeId: _0xb739fc.id,
        selectedClipId: _0xb739fc.clips?.[0]?.id || ""
      });
    },
    onClipSelected(_0xd2478a) {
      return _0x31cd39({
        selectedClipId: normalizeText(_0xd2478a)
      });
    },
    onEpisodeAssetTabChanged(_0x5e1eb1) {
      return _0x31cd39({
        episodeAssetTab: ["assets", "frames", "library"].includes(_0x5e1eb1) ? _0x5e1eb1 : "assets"
      });
    },
    onAssetImagesSelected: _0x59a5c6,
    onRemoveAsset: _0x196910,
    onAssetDescriptionChanged: _0x30a023,
    onCharacterImagesSelected: _0x341b99,
    onRemoveCharacter: _0x170dd4,
    onPromptChanged: _0x22dce8,
    onRenameProject: _0x3b3477,
    onDuplicateProject: _0x363d00,
    onArchiveProject: _0x1b77aa,
    onDeleteProject: _0x34b785,
    onVideoModelChanged({
      modelId: _0x1efe90,
      provider: _0x15046e,
      generationParams: _0x124f05,
      generationParamsByModel: _0x408fd5,
      providerProfileId: _0x4ac9fc
    } = {}) {
      const _0x816428 = _0x59ca2c();
      if (!_0x816428) {
        return false;
      }
      _0x40289({
        ..._0x816428,
        settings: {
          ..._0x816428.settings,
          videoModelId: normalizeText(_0x1efe90, _0x816428.settings.videoModelId),
          videoProvider: normalizeText(_0x15046e),
          videoProviderProfileId: normalizeText(_0x4ac9fc),
          generationParams: _0x124f05 && typeof _0x124f05 === "object" ? {
            ..._0x124f05
          } : {},
          generationParamsByModel: _0x408fd5 && typeof _0x408fd5 === "object" ? {
            ..._0x408fd5
          } : {}
        }
      });
      return true;
    }
  });
  _0x21d162();
  return Object.freeze({
    open() {
      _0x19de90?.open();
      _0x21d162();
      return _0x19de90;
    },
    close() {
      return _0x19de90?.close?.();
    },
    startAnalysis: _0x31d8f8,
    addCharacterImages: _0x341b99,
    addProjectAssetImages: _0x59a5c6,
    generateClip: _0x5a086e,
    generateAll: _0x33e848,
    getProjects() {
      return cloneJson(_0x27b291.projects);
    },
    whenReady() {
      return _0x179e67;
    },
    async persist() {
      if (_0x168487) {
        return;
      }
      _0x20cf4d({
        immediate: true
      });
      await _0x2b9762.flush();
    },
    destroy() {
      if (_0x168487) {
        return;
      }
      _0x168487 = true;
      _0x49f221?.abort?.();
      _0x49f221 = null;
      _0x599d17.forEach(_0x3d5f8f => _0x3d5f8f.abort());
      _0x599d17.clear();
      _0x121ab7.clear();
      _0x2b9762.destroy({
        flush: true,
        force: true
      }).catch(() => {});
      _0x19de90?.destroy?.();
    }
  });
}