import { resumeAudioSeparationTask, runAudioSeparation } from "../../api/aiAudioApi.js";
import { resolveRunningHubWorkflowAccess } from "../../api/configApi.js";
import { cancelRunningHubTask } from "../../api/runninghubTaskApi.js";
import { t } from "../i18n/index.js";
import { buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { buildRunningHubOpenapiTaskPatch } from "../core/generationTaskProtocolState.js";
import { findAvailablePosition, generateId } from "../core/math.js";
import a892_0x39f73e from "../core/stores/appStore.js";
import { buildCanvasLocalAudioFields, resolveCanvasAudioUrl } from "../services/canvasMediaLocalService.js";
import { buildSourceAudioNodePayload, getNodeDefaultSize } from "../services/fileService.js";
import { saveRemoteAudioLocallyDetailed } from "../services/projectService.js";
import { normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import { RH_AUDIO_SEPARATION_MODEL_ID, resolveModelExecution } from "../manifests/index.js";
import { buildLocalAudioGenerationResultPatch } from "../components/audio-node/audioGenerationResultRenderer.js";
import { getNodeSpawnPrefs } from "./nodeSpawn.js";
const AUDIO_SPLIT_MODEL_ID = RH_AUDIO_SEPARATION_MODEL_ID;
const AUDIO_SPLIT_ROLE_VOCALS = "vocals";
const AUDIO_SPLIT_ROLE_BACKGROUND = "background";
function _resolveAudioSplitModelId() {
  const _0x101f4b = resolveModelExecution(AUDIO_SPLIT_MODEL_ID);
  const _0x335d68 = String(_0x101f4b?.modelManifest?.modelId || "").trim();
  if (!_0x335d68) {
    throw new Error("RunningHub audio workflow manifest missing: " + AUDIO_SPLIT_MODEL_ID);
  }
  return _0x335d68;
}
const AUDIO_SPLIT_MODEL = _resolveAudioSplitModelId();
let _runAudioSeparationImpl = runAudioSeparation;
let _resumeAudioSeparationTaskImpl = resumeAudioSeparationTask;
let _saveRemoteAudioLocallyDetailedImpl = saveRemoteAudioLocallyDetailed;
const _runtimeByLeaderId = new Map();
function audioSeparationText(_0x16acf8, _0x41fe73 = {}) {
  return t("mediaProcessing.audioSeparation." + _0x16acf8, _0x41fe73);
}
function _getState() {
  if (typeof a892_0x39f73e.getStateRaw === "function") {
    return a892_0x39f73e.getStateRaw();
  } else {
    return a892_0x39f73e.getState();
  }
}
function _getNode(_0x236704) {
  return _getState().nodes?.[_0x236704] || null;
}
function _isAudioNodeType(_0x1ca4ca) {
  const _0x3a240e = String(_0x1ca4ca || "").trim().toLowerCase();
  return _0x3a240e === "source-audio" || _0x3a240e === "ai-audio" || _0x3a240e === "audio";
}
function _fileNameFromPath(_0x5bc4aa) {
  const _0x41a0d9 = normalizeLocalPath(_0x5bc4aa);
  if (!_0x41a0d9) {
    return "";
  }
  const _0x2bb45d = _0x41a0d9.split("/");
  return String(_0x2bb45d[_0x2bb45d.length - 1] || "").trim();
}
function _isAudioSplitLeader(_0x22a3b0) {
  if (!_0x22a3b0 || typeof _0x22a3b0 !== "object") {
    return false;
  }
  return String(_0x22a3b0.type || "").trim().toLowerCase() === "source-audio" && String(_0x22a3b0.audioSplitRole || "").trim().toLowerCase() === AUDIO_SPLIT_ROLE_VOCALS && String(_0x22a3b0.provider || "").trim().toLowerCase() === "runninghubwf" && String(_0x22a3b0.model || "").trim() === AUDIO_SPLIT_MODEL && !!String(_0x22a3b0.audioSplitPeerId || "").trim();
}
function _isRunningTaskStatus(_0x49dcb5) {
  const _0x2052eb = String(_0x49dcb5 || "").trim().toLowerCase();
  return !["success", "failed", "idle", "cancelled"].includes(_0x2052eb);
}
function _resolveAudioSplitLeaderId(_0xa9f67a) {
  const _0x33bfa4 = String(_0xa9f67a || "").trim();
  if (!_0x33bfa4) {
    return "";
  }
  const _0x59b036 = _getNode(_0x33bfa4);
  if (_isAudioSplitLeader(_0x59b036)) {
    return _0x33bfa4;
  }
  const _0x5b655c = String(_0x59b036?.audioSplitPeerId || "").trim();
  if (_0x5b655c && _isAudioSplitLeader(_getNode(_0x5b655c))) {
    return _0x5b655c;
  }
  const _0x21304b = _getState().nodes || {};
  const _0x9f2b2 = Object.values(_0x21304b).find(_0x43cf8c => _isAudioSplitLeader(_0x43cf8c) && (String(_0x43cf8c.audioSplitPeerId || "") === _0x33bfa4 || String(_0x43cf8c.rhSourceNodeId || "") === _0x33bfa4));
  return String(_0x9f2b2?.id || "");
}
function _getSpawnLayout(_0x6eb9f6) {
  const _0x4bb342 = getNodeDefaultSize("source-audio");
  const _0x184088 = Number(_0x6eb9f6?.width) > 0 ? Number(_0x6eb9f6.width) : _0x4bb342.width;
  const _0xf3af1c = Number(_0x6eb9f6?.height) > 0 ? Number(_0x6eb9f6.height) : _0x4bb342.height;
  const {
    spacing: _0x326247,
    direction: _0x5d3c7d,
    avoidOverlap: _0x1d6dfb
  } = getNodeSpawnPrefs();
  const _0xf1a611 = _0x5d3c7d === "down" ? "down" : "right";
  const _0x182faa = Math.max(24, Math.min(80, Math.round(_0x326247 / 2)));
  const _0x47415d = Number(_0x6eb9f6?.x) || 0;
  const _0x243312 = Number(_0x6eb9f6?.y) || 0;
  const _0x708290 = Number(_0x6eb9f6?.width) || _0x4bb342.width;
  const _0x62346a = Number(_0x6eb9f6?.height) || _0x4bb342.height;
  let _0x41bd3e = _0xf1a611 === "right" ? _0x47415d + _0x708290 + _0x326247 : _0x47415d + Math.round((_0x708290 - _0x184088) / 2);
  let _0x2d3705 = _0xf1a611 === "down" ? _0x243312 + _0x62346a + _0x326247 : _0x243312 + Math.round((_0x62346a - _0xf3af1c) / 2);
  const _0x4961dd = _0xf1a611 === "right" ? _0x184088 * 2 + _0x182faa : _0x184088;
  const _0x3a3162 = _0xf1a611 === "down" ? _0xf3af1c * 2 + _0x182faa : _0xf3af1c;
  if (_0x1d6dfb) {
    const _0x492ddb = findAvailablePosition(_getState().nodes || {}, _0x41bd3e, _0x2d3705, _0x4961dd, _0x3a3162, _0x326247, _0xf1a611);
    _0x41bd3e = _0x492ddb.x;
    _0x2d3705 = _0x492ddb.y;
  }
  return {
    width: _0x184088,
    height: _0xf3af1c,
    resolvedDirection: _0xf1a611,
    innerGap: _0x182faa,
    vocals: {
      x: _0x41bd3e,
      y: _0x2d3705
    },
    background: _0xf1a611 === "right" ? {
      x: _0x41bd3e + _0x184088 + _0x182faa,
      y: _0x2d3705
    } : {
      x: _0x41bd3e,
      y: _0x2d3705 + _0xf3af1c + _0x182faa
    }
  };
}
async function _persistAudioResult(_0x3f1083) {
  const _0x57f818 = await _saveRemoteAudioLocallyDetailedImpl(_0x3f1083);
  const _0x2ddb36 = pickResultLocalPath(_0x57f818);
  const _0x3d5905 = String(_0x57f818?.localUrl || _0x57f818?.audioUrl || "").trim();
  const _0x32e8dc = buildCanvasLocalAudioFields({
    localPath: _0x2ddb36,
    audioUrl: _0x3d5905
  });
  if (!_0x32e8dc.audioUrl || !_0x32e8dc.localPath) {
    throw new Error(audioSeparationText("localSaveFailed"));
  }
  return {
    ..._0x32e8dc,
    fileName: _fileNameFromPath(_0x32e8dc.localPath)
  };
}
function _updateNodeIfExists(_0x3d3892, _0x49587a) {
  if (!String(_0x3d3892 || "").trim()) {
    return;
  }
  if (!_getNode(_0x3d3892)) {
    return;
  }
  a892_0x39f73e.updateNodeData(_0x3d3892, _0x49587a);
}
function _focusCreatedNodes(_0x4f0234, _0x47d93b) {
  const _0x293ba6 = Array.isArray(_0x47d93b) ? _0x47d93b.map(_0x55b3dd => String(_0x55b3dd || "").trim()).filter(Boolean) : [];
  if (!_0x293ba6.length) {
    return;
  }
  a892_0x39f73e.setSelectedNodes(_0x293ba6);
  if (typeof window.v2FocusOnNodes === "function") {
    window.v2FocusOnNodes([_0x4f0234, ..._0x293ba6]);
  } else if (typeof window.v2FocusOnNode === "function") {
    window.v2FocusOnNode(_0x293ba6[0]);
  }
}
function _persistLocalCache() {
  try {
    window._triggerLocalCacheSave?.();
  } catch {}
}
function _resolveSeparationResultUrls(_0x5881f2) {
  const _0x445637 = Array.isArray(_0x5881f2?.audios) ? _0x5881f2.audios : [];
  const _0x40bebb = String(_0x5881f2?.vocalsAudioUrl || _0x445637.find(_0xeef189 => String(_0xeef189?.role || "").trim().toLowerCase() === "vocals" || String(_0xeef189?.nodeId || "").trim() === "5")?.audioUrl || _0x445637[0]?.audioUrl || "").trim();
  const _0x368d26 = String(_0x5881f2?.backgroundAudioUrl || _0x445637.find(_0x471bd4 => String(_0x471bd4?.role || "").trim().toLowerCase() === "background" || String(_0x471bd4?.nodeId || "").trim() === "7")?.audioUrl || _0x445637[1]?.audioUrl || "").trim();
  return {
    vocalsUrl: _0x40bebb,
    backgroundUrl: _0x368d26
  };
}
function _createPlaceholderPair(_0x43490a) {
  const _0x11c364 = _getSpawnLayout(_0x43490a);
  const _0x1cfec6 = Date.now();
  const _0x352f6a = generateId("source-audio-split-vocals");
  const _0x4fb0dc = generateId("source-audio-split-background");
  const _0x177f91 = buildSourceAudioNodePayload({
    id: _0x352f6a,
    x: _0x11c364.vocals.x,
    y: _0x11c364.vocals.y,
    width: _0x11c364.width,
    height: _0x11c364.height,
    name: audioSeparationText("nodeNames.vocalsProcessing"),
    audioSplitRole: AUDIO_SPLIT_ROLE_VOCALS,
    audioSplitPeerId: _0x4fb0dc,
    rhSourceNodeId: _0x43490a.id,
    rhToolbarTaskType: "audio-separation",
    provider: "runninghubwf",
    model: AUDIO_SPLIT_MODEL,
    rhInstanceType: String(_0x43490a?.rhInstanceType || "").trim() === "plus" ? "plus" : "default",
    ...buildGenerationStartPatch({
      startedAt: _0x1cfec6
    }),
    ...buildRunningHubOpenapiTaskPatch({
      taskId: "",
      status: "pending",
      startedAt: _0x1cfec6,
      recovering: false,
      useOpenapiQuery: true
    })
  });
  const _0x42b8bb = buildSourceAudioNodePayload({
    id: _0x4fb0dc,
    x: _0x11c364.background.x,
    y: _0x11c364.background.y,
    width: _0x11c364.width,
    height: _0x11c364.height,
    name: audioSeparationText("nodeNames.backgroundProcessing"),
    audioSplitRole: AUDIO_SPLIT_ROLE_BACKGROUND,
    audioSplitPeerId: _0x352f6a,
    rhSourceNodeId: _0x43490a.id,
    rhToolbarTaskType: "audio-separation",
    ...buildGenerationStartPatch({
      startedAt: _0x1cfec6
    })
  });
  a892_0x39f73e.batch(() => {
    a892_0x39f73e.addNode(_0x177f91);
    a892_0x39f73e.addNode(_0x42b8bb);
  });
  _focusCreatedNodes(_0x43490a.id, [_0x352f6a, _0x4fb0dc]);
  _persistLocalCache();
  return {
    leaderId: _0x352f6a,
    peerId: _0x4fb0dc,
    startedAt: _0x1cfec6
  };
}
async function _applySuccessResult({
  leaderId: _0x59142f,
  peerId: _0x568cb1,
  result: _0x289520,
  startedAt: _0x5ef239
}) {
  const {
    vocalsUrl: _0x20dc27,
    backgroundUrl: _0x504433
  } = _resolveSeparationResultUrls(_0x289520);
  if (!_0x20dc27 || !_0x504433) {
    throw new Error(audioSeparationText("missingResultUrls"));
  }
  const [_0x39e7f9, _0x49742d] = await Promise.all([_persistAudioResult(_0x20dc27), _persistAudioResult(_0x504433)]);
  const _0x28b44a = _getNode(_0x59142f);
  const _0x441d5e = String(_0x28b44a?.rhTaskId || _0x289520?.taskId || "").trim();
  a892_0x39f73e.batch(() => {
    _updateNodeIfExists(_0x59142f, {
      name: audioSeparationText("nodeNames.vocals"),
      ...buildLocalAudioGenerationResultPatch(_0x39e7f9, {
        startedAt: _0x5ef239
      }),
      ...buildRunningHubOpenapiTaskPatch({
        taskId: _0x441d5e,
        status: "success",
        startedAt: _0x5ef239,
        recovering: false,
        useOpenapiQuery: true
      })
    });
    _updateNodeIfExists(_0x568cb1, {
      name: audioSeparationText("nodeNames.background"),
      ...buildLocalAudioGenerationResultPatch(_0x49742d, {
        startedAt: _0x5ef239
      })
    });
  });
  _persistLocalCache();
  window.showToast?.(audioSeparationText("success"), "success");
}
function _buildEmptyAudioFields() {
  return buildCanvasLocalAudioFields({
    localPath: "",
    audioUrl: "",
    fileName: ""
  });
}
function _applyFailureResult({
  leaderId: _0xa9f6de,
  peerId: _0x5481a0,
  startedAt: _0x38634c,
  message: _0x3ea6a1
}) {
  const _0x12ea18 = String(_0x3ea6a1 || audioSeparationText("fallback")).trim() || audioSeparationText("fallback");
  const _0x3758f6 = _getNode(_0xa9f6de);
  const _0x1b3cea = _buildEmptyAudioFields();
  a892_0x39f73e.batch(() => {
    _updateNodeIfExists(_0xa9f6de, {
      name: audioSeparationText("nodeNames.vocalsFailed"),
      ...buildLocalAudioGenerationResultPatch({
        error: _0x12ea18
      }, {
        startedAt: _0x38634c
      }),
      ..._0x1b3cea,
      rhStatusMessage: _0x12ea18,
      rhStatusCode: null,
      ...buildRunningHubOpenapiTaskPatch({
        taskId: String(_0x3758f6?.rhTaskId || "").trim(),
        status: "failed",
        startedAt: _0x38634c,
        recovering: false,
        useOpenapiQuery: true
      })
    });
    _updateNodeIfExists(_0x5481a0, {
      name: audioSeparationText("nodeNames.backgroundFailed"),
      ...buildLocalAudioGenerationResultPatch({
        error: _0x12ea18
      }, {
        startedAt: _0x38634c
      }),
      ..._0x1b3cea
    });
  });
  _persistLocalCache();
  window.showToast?.(audioSeparationText("failedWithMessage", {
    message: _0x12ea18
  }), "error");
}
async function _executeTask({
  leaderId: _0x3bb481,
  peerId: _0x134df7,
  sourceAudioUrl: _0x1ffbec,
  rhInstanceType = "default",
  startedAt: _0x2aca19,
  resume = false,
  runtime: _0x54d186
}) {
  const _0x4b569c = (_0x4c4d5d, _0x56426f = "") => {
    const _0x4c46fc = _runtimeByLeaderId.get(_0x3bb481) || {};
    _runtimeByLeaderId.set(_0x3bb481, {
      ..._0x4c46fc,
      taskId: String(_0x4c4d5d || "").trim(),
      ...(_0x56426f ? {
        providerProfileId: String(_0x56426f).trim()
      } : {})
    });
  };
  try {
    let _0x142c03 = null;
    if (resume) {
      const _0x220160 = _getNode(_0x3bb481);
      const _0x3b1566 = String(_0x220160?.rhTaskId || _0x54d186.taskId || "").trim();
      if (!_0x3b1566) {
        throw new Error(audioSeparationText("missingTaskId"));
      }
      _0x142c03 = await _resumeAudioSeparationTaskImpl(_0x3b1566, {
        rhInstanceType: rhInstanceType,
        providerProfileId: _0x220160?.taskProviderProfileId || _0x220160?.providerProfileId || _0x220160?.rhProviderProfileId || ""
      }, {
        signal: _0x54d186.abortController?.signal
      });
    } else {
      window.showToast?.(audioSeparationText("submitting"), "info");
      _0x142c03 = await _runAudioSeparationImpl({
        nodeId: _0x3bb481,
        audioUrl: _0x1ffbec,
        rhInstanceType: rhInstanceType
      }, {
        signal: _0x54d186.abortController?.signal,
        onTaskMeta: ({
          taskId: _0x43d100,
          useOpenapiQuery: _0x40640a,
          providerProfileId: _0x2465b5
        }) => {
          _0x4b569c(_0x43d100, _0x2465b5);
          _updateNodeIfExists(_0x3bb481, {
            ...(_0x2465b5 ? {
              taskProviderProfileId: _0x2465b5,
              rhProviderProfileId: _0x2465b5
            } : {}),
            ...buildRunningHubOpenapiTaskPatch({
              taskId: _0x43d100,
              status: "pending",
              startedAt: _0x2aca19,
              recovering: false,
              useOpenapiQuery: _0x40640a === true
            })
          });
          _persistLocalCache();
        },
        onTaskId: _0x1ab742 => {
          _0x4b569c(_0x1ab742);
          _updateNodeIfExists(_0x3bb481, {
            ...buildRunningHubOpenapiTaskPatch({
              taskId: _0x1ab742,
              status: "pending",
              startedAt: _0x2aca19,
              recovering: false,
              useOpenapiQuery: true
            })
          });
          _persistLocalCache();
        }
      });
    }
    await _applySuccessResult({
      leaderId: _0x3bb481,
      peerId: _0x134df7,
      result: _0x142c03,
      startedAt: _0x2aca19
    });
  } catch (_0x356b9f) {
    if (_0x54d186.abortController?.signal?.aborted) {
      return;
    }
    const _0x2bba99 = _0x356b9f instanceof Error ? _0x356b9f.message : String(_0x356b9f || audioSeparationText("fallback"));
    _applyFailureResult({
      leaderId: _0x3bb481,
      peerId: _0x134df7,
      startedAt: _0x2aca19,
      message: _0x2bba99
    });
  } finally {
    const _0x33da77 = _runtimeByLeaderId.get(_0x3bb481);
    if (_0x33da77?.promise === _0x54d186.promise) {
      _runtimeByLeaderId.delete(_0x3bb481);
    }
  }
}
export async function runAudioSeparationFromNode(_0xea556f) {
  const _0x1a0335 = _getNode(_0xea556f);
  if (!_0x1a0335 || !_isAudioNodeType(_0x1a0335.type)) {
    window.showToast?.(audioSeparationText("unsupportedNode"), "warn");
    return null;
  }
  if (_0x1a0335.isGenerating) {
    window.showToast?.(audioSeparationText("busy"), "info");
    return null;
  }
  const _0x4f7fb8 = resolveCanvasAudioUrl(_0x1a0335);
  if (!_0x4f7fb8) {
    window.showToast?.(audioSeparationText("missingAudio"), "warn");
    return null;
  }
  const {
    leaderId: _0x4f7e38,
    peerId: _0xcfffa2,
    startedAt: _0x34db28
  } = _createPlaceholderPair(_0x1a0335);
  const _0x32cbb0 = {
    abortController: new AbortController(),
    promise: null,
    taskId: ""
  };
  _runtimeByLeaderId.set(_0x4f7e38, _0x32cbb0);
  const _0x49eab4 = _executeTask({
    leaderId: _0x4f7e38,
    peerId: _0xcfffa2,
    sourceAudioUrl: _0x4f7fb8,
    rhInstanceType: _0x1a0335?.rhInstanceType || "default",
    startedAt: _0x34db28,
    resume: false,
    runtime: _0x32cbb0
  });
  _0x32cbb0.promise = _0x49eab4;
  _runtimeByLeaderId.set(_0x4f7e38, _0x32cbb0);
  await _0x49eab4;
  return {
    leaderId: _0x4f7e38,
    peerId: _0xcfffa2
  };
}
export function getRunningAudioSeparationTaskForNode(_0x84c2a9) {
  const _0x19dc40 = _resolveAudioSplitLeaderId(_0x84c2a9);
  if (!_0x19dc40) {
    return null;
  }
  const _0x274bb5 = _getNode(_0x19dc40);
  if (!_isAudioSplitLeader(_0x274bb5)) {
    return null;
  }
  if (!_isRunningTaskStatus(_0x274bb5?.rhTaskStatus)) {
    return null;
  }
  return {
    sourceNodeId: String(_0x274bb5.rhSourceNodeId || ""),
    outId: _0x19dc40,
    peerId: String(_0x274bb5.audioSplitPeerId || ""),
    taskId: String(_0x274bb5.rhTaskId || _runtimeByLeaderId.get(_0x19dc40)?.taskId || ""),
    mode: "audio-separation"
  };
}
export function hasRunningAudioSeparationTaskForNode(_0x1d108b) {
  return !!getRunningAudioSeparationTaskForNode(_0x1d108b);
}
export async function cancelAudioSeparationTaskForNode(_0xdbdc8, {
  notify = false
} = {}) {
  const _0x27491a = getRunningAudioSeparationTaskForNode(_0xdbdc8);
  if (!_0x27491a?.outId) {
    return false;
  }
  const _0x464ec9 = _0x27491a.outId;
  const _0x463ac8 = _0x27491a.peerId;
  const _0x5e3b22 = _runtimeByLeaderId.get(_0x464ec9);
  try {
    _0x5e3b22?.abortController?.abort?.();
  } catch {}
  _runtimeByLeaderId.delete(_0x464ec9);
  const _0xe07ae5 = _getNode(_0x464ec9);
  const _0x4d285b = Number(_0xe07ae5?.generationStartTime || _0xe07ae5?.rhTaskStartedAt || 0) || Date.now();
  const _0xece213 = Date.now() - _0x4d285b;
  const _0x1ea878 = _buildEmptyAudioFields();
  a892_0x39f73e.batch(() => {
    _updateNodeIfExists(_0x464ec9, {
      name: audioSeparationText("nodeNames.vocalsCancelled"),
      ..._0x1ea878,
      isGenerating: false,
      jobStatus: null,
      jobError: null,
      generationDuration: _0xece213,
      rhTaskStatus: "cancelled",
      rhTaskRecovering: false,
      rhStatusMessage: null
    });
    _updateNodeIfExists(_0x463ac8, {
      name: audioSeparationText("nodeNames.backgroundCancelled"),
      ..._0x1ea878,
      isGenerating: false,
      jobStatus: null,
      jobError: null,
      generationDuration: _0xece213
    });
  });
  _persistLocalCache();
  const _0x28973e = String(_0xe07ae5?.taskProviderProfileId || _0xe07ae5?.providerProfileId || _0xe07ae5?.rhProviderProfileId || "").trim();
  let _0x4aaad0 = "";
  let _0x3bdccb = _0x28973e;
  try {
    const _0xac98c8 = await resolveRunningHubWorkflowAccess(_0x28973e);
    _0x4aaad0 = _0xac98c8.apiKey;
    _0x3bdccb = _0x3bdccb || _0xac98c8.providerProfileId;
  } catch {}
  if (_0x4aaad0 && _0x27491a.taskId) {
    try {
      await cancelRunningHubTask({
        apiKey: _0x4aaad0,
        taskId: _0x27491a.taskId,
        providerProfileId: _0x3bdccb
      });
    } catch (_0x2e595d) {
      console.warn("[AudioSeparationController] cancel request failed:", _0x2e595d);
    }
  }
  if (notify) {
    window.showToast?.(audioSeparationText("cancelled"), "info");
  }
  return true;
}
export function maybeResumeAudioSeparationLeader(_0x1fc688) {
  const _0x1b2402 = _getNode(_0x1fc688);
  if (!_isAudioSplitLeader(_0x1b2402)) {
    return null;
  }
  if (!_isRunningTaskStatus(_0x1b2402?.rhTaskStatus)) {
    return null;
  }
  const _0x583c51 = String(_0x1b2402?.rhTaskId || "").trim();
  if (!_0x583c51) {
    return null;
  }
  const _0x4b97ec = _runtimeByLeaderId.get(_0x1fc688);
  if (_0x4b97ec?.promise && _0x4b97ec.taskId === _0x583c51) {
    return _0x4b97ec.promise;
  }
  const _0x3399f9 = Number(_0x1b2402?.rhTaskStartedAt || _0x1b2402?.generationStartTime || 0) || Date.now();
  a892_0x39f73e.batch(() => {
    _updateNodeIfExists(_0x1fc688, {
      ...buildGenerationStartPatch({
        startedAt: _0x3399f9
      }),
      ...buildRunningHubOpenapiTaskPatch({
        taskId: _0x583c51,
        status: String(_0x1b2402?.rhTaskStatus || "").trim().toLowerCase() === "pending" ? "pending" : "running",
        startedAt: _0x3399f9,
        recovering: true,
        useOpenapiQuery: _0x1b2402?.rhTaskUseOpenapiQuery === true
      })
    });
    _updateNodeIfExists(_0x1b2402?.audioSplitPeerId, {
      ...buildGenerationStartPatch({
        startedAt: _0x3399f9
      }),
      jobError: null
    });
  });
  _persistLocalCache();
  const _0x1a1142 = {
    abortController: new AbortController(),
    promise: null,
    taskId: _0x583c51
  };
  _runtimeByLeaderId.set(_0x1fc688, _0x1a1142);
  const _0xf87744 = _executeTask({
    leaderId: _0x1fc688,
    peerId: _0x1b2402.audioSplitPeerId,
    sourceAudioUrl: "",
    rhInstanceType: _0x1b2402?.rhInstanceType || "default",
    startedAt: _0x3399f9,
    resume: true,
    runtime: _0x1a1142
  });
  _0x1a1142.promise = _0xf87744;
  _runtimeByLeaderId.set(_0x1fc688, _0x1a1142);
  return _0xf87744;
}
export function __setAudioSeparationDepsForTest({
  runAudioSeparationImpl: _0x218658,
  resumeAudioSeparationTaskImpl: _0x4e0a51,
  saveRemoteAudioLocallyDetailedImpl: _0x4adbff
} = {}) {
  _runAudioSeparationImpl = typeof _0x218658 === "function" ? _0x218658 : runAudioSeparation;
  _resumeAudioSeparationTaskImpl = typeof _0x4e0a51 === "function" ? _0x4e0a51 : resumeAudioSeparationTask;
  _saveRemoteAudioLocallyDetailedImpl = typeof _0x4adbff === "function" ? _0x4adbff : saveRemoteAudioLocallyDetailed;
}
export function __resetAudioSeparationDepsForTest() {
  _runAudioSeparationImpl = runAudioSeparation;
  _resumeAudioSeparationTaskImpl = resumeAudioSeparationTask;
  _saveRemoteAudioLocallyDetailedImpl = saveRemoteAudioLocallyDetailed;
  _runtimeByLeaderId.forEach(_0x4bea78 => {
    try {
      _0x4bea78?.abortController?.abort?.();
    } catch {}
  });
  _runtimeByLeaderId.clear();
}