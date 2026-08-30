import a478_0x33798a from "../../core/stores/appStore.js";
import { findAvailablePosition } from "../../core/math.js";
import { submitTask } from "../../core/generationTaskRuntime.js";
import { createRunningHubTaskStateMachine } from "../../modules/ImageFreeAngleController.js";
import a478_0x369675, { runSmartClipKeyframeExtractionFromVideoNode } from "../../modules/VideoClipController.js";
import { runVideoAudioSeparationFromNode } from "../../modules/VideoAudioSeparationController.js";
import { runVideoReverseFromNode } from "../../modules/VideoReverseController.js";
import a478_0x452ea3 from "../../modules/VideoKeyingController.js";
import { fetchRemoteBlob, saveOutputToServer, saveOutputFromUrlToServer } from "../../../api/projectsV2Api.js";
import { fetchAppRuntimeInfoFromServer } from "../../../api/runtimeApi.js";
import { fetchVideoMetaFromServer } from "../../../api/videoMetaApi.js";
import { runRunninghubAiApp, runRunninghubWorkflow, resumeRunninghubWorkflowTask } from "../../../api/runninghubWorkflowApi.js";
import { processInputVideos } from "../../../api/videoUploadApi.js";
import { detectScenes } from "../../../api/sceneDetectionApi.js";
import { buildApiUrl } from "../../../api/apiBase.js";
import { getProviderConfig, ensureConfig } from "../../../api/configApi.js";
import { calcSafeSpawnPosNearNode, getNodeSpawnPrefs } from "../../modules/nodeSpawn.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../../services/fileService.js";
import { buildCanvasLocalVideoFields, resolveCanvasVideoLocalPath, resolveCanvasVideoUrl } from "../../services/canvasMediaLocalService.js";
import { attachMediaElementPlaybackSource } from "../../services/desktopMediaBlobSource.js";
import { getVideoCurrentSource } from "../video-node/mediaPlaybackRecovery.js";
import { desktopBridge } from "../../services/desktopBridge.js";
import { saveMediaDownload } from "../../services/downloadSaveService.js";
import { pickResultLocalPath, urlToLocalPath } from "../../utils/localMediaPath.js";
import { buildVideoGenerationFailurePatch, buildVideoGenerationResultPatch } from "../video-node/videoGenerationResultRenderer.js";
import { executeCommand } from "../../core/interaction.js";
import { VIDEO_TOOLBAR_HTML } from "./videoToolbarHtml.js";
import { RUNNING_HUB_CANCEL_ICON_HTML, bindRunningHubToolbarTaskButton, cancelRunningHubResultTask, findRunningHubToolbarTaskForNode, isRunningHubToolbarTaskCancelled, notifyRunningHubToolbarTasksChanged } from "./runningHubToolbarTaskButton.js";
import { RH_VIDEO_HD_VIP_MODEL_ID, resolveModelExecution } from "../../manifests/index.js";
import { bindVideoClipAction } from "./videoActions/clipAction.js";
import { bindVideoExtractKeyframesAction } from "./videoActions/extractKeyframesAction.js";
import { bindVideoSeparateAvAction } from "./videoActions/separateAvAction.js";
import { bindVideoVoiceReplaceAction } from "./videoActions/voiceReplaceAction.js";
import { bindVideoReverseAction } from "./videoActions/reverseAction.js";
import { bindVideoSmartClipAction } from "./videoActions/smartClipAction.js";
import { bindVideoKeyingAction } from "./videoActions/keyingAction.js";
import { bindVideoRemoveAction } from "./videoActions/removeAction.js";
import { bindVideoFrameInterpolationAction } from "./videoActions/frameInterpolationAction.js";
import { bindVideoHdAction } from "./videoActions/hdAction.js";
import { bindVideoDownloadAction } from "./videoActions/downloadAction.js";
import { bindVideoFullscreenAction } from "./videoActions/fullscreenAction.js";
import { bindVideoResetSizeAction } from "./videoActions/resetSizeAction.js";
import { bindStoryboardScriptToolbarAction } from "./storyboardScriptAction.js";
import { bindImageToolbarLayoutUi } from "./imageToolbarLayoutUi.js";
import { bindApimartPrivateAvatarAction } from "./apimartPrivateAvatarAction.js";
import { VIDEO_TOOLBAR_ACTIONS, normalizeVideoToolbarLayout, serializeVideoToolbarLayout } from "../../modules/videoToolbarLayoutMemory.js";
import { bindPreviewUploadToolbarAction } from "../../modules/previewUploadEntry.js";
import { t } from "../../i18n/index.js";
export { VIDEO_TOOLBAR_HTML };
function isClientFetchableVideoUrl(_0x537684) {
  const _0xdf5147 = String(_0x537684 || "").trim();
  return /^https?:\/\//i.test(_0xdf5147) || _0xdf5147.startsWith("blob:") || _0xdf5147.startsWith("data:") || _0xdf5147.startsWith("/") && !_0xdf5147.startsWith("//");
}
const RH_VIDEO_HD_BASIC_WORKFLOW_ID = "2019292222763573249";
const RH_VIDEO_HD_VIP_EXECUTION = resolveModelExecution(RH_VIDEO_HD_VIP_MODEL_ID);
const RH_VIDEO_HD_VIP_APP_ID = RH_VIDEO_HD_VIP_EXECUTION?.executionManifest?.appId || "2047787809091620866";
const VIDEO_HD_STANDARD_INSTANCE_TYPE = "default";
const VIDEO_HD_VIP_INSTANCE_TYPE = "plus";
const VIDEO_HD_STANDARD_MAX_SECONDS = 15;
const KEYING_CANCEL_ICON_HTML = RUNNING_HUB_CANCEL_ICON_HTML;
function videoToolbarText(_0x282772, _0x44df31 = {}) {
  return t("nodeToolbar.video." + _0x282772, _0x44df31);
}
const getStateSnapshot = () => typeof a478_0x33798a.getStateRaw === "function" ? a478_0x33798a.getStateRaw() : a478_0x33798a.getState();
function getToolbarActionFromButton(_0x1aea15) {
  if (!_0x1aea15?.classList) {
    return "";
  }
  for (const _0x588957 of _0x1aea15.classList) {
    if (!_0x588957.startsWith("act-")) {
      continue;
    }
    const _0x1fd30b = _0x588957.slice(4);
    if (VIDEO_TOOLBAR_ACTIONS.includes(_0x1fd30b)) {
      return _0x1fd30b;
    }
  }
  return "";
}
export function bindVideoToolbarEvents(_0x26bdbb, _0x39a4c3) {
  if (!_0x26bdbb) {
    return;
  }
  const _0x2ec829 = 120;
  const _0x16ca7d = 800;
  const _0x50e546 = 2;
  _0x26bdbb.addEventListener("pointerdown", _0x5799d4 => _0x5799d4.stopPropagation());
  _0x26bdbb.addEventListener("dblclick", _0x3fea00 => {
    _0x3fea00.preventDefault();
    _0x3fea00.stopPropagation();
  });
  bindImageToolbarLayoutUi(_0x26bdbb, {
    store: a478_0x33798a,
    getStateSnapshot: getStateSnapshot,
    toolbarActions: VIDEO_TOOLBAR_ACTIONS,
    normalizeToolbarLayout: normalizeVideoToolbarLayout,
    serializeToolbarLayout: serializeVideoToolbarLayout,
    getToolbarActionFromButton: getToolbarActionFromButton,
    getToolbarLayout: _0x2ddb5b => _0x2ddb5b?.ui?.videoToolbarLayout,
    setToolbarLayout: _0x1dc82c => a478_0x33798a.setVideoToolbarLayout?.(_0x1dc82c),
    moreMenuStickyActions: ["hd"]
  });
  const _0x2d11c1 = () => {
    const _0x193174 = _0x39a4c3?.id;
    if (!_0x193174) {
      return _0x39a4c3 || {};
    }
    return getStateSnapshot().nodes?.[_0x193174] || _0x39a4c3 || {};
  };
  const _0x47309e = _0x579820 => {
    const _0x237477 = String(_0x579820 || "").trim();
    if (!_0x237477) {
      return "";
    }
    if (_0x237477.startsWith("http://") || _0x237477.startsWith("https://") || _0x237477.startsWith("blob:") || _0x237477.startsWith("data:")) {
      return _0x237477;
    }
    if (_0x237477.startsWith("/")) {
      return buildApiUrl(_0x237477);
    }
    return buildApiUrl("/" + _0x237477.replace(/^\/+/, ""));
  };
  const _0x2c1636 = (_0x3fdf27, _0x48e858) => {
    const _0x3c5c85 = document.createElement("a");
    _0x3c5c85.href = _0x3fdf27;
    _0x3c5c85.download = _0x48e858;
    _0x3c5c85.rel = "noopener";
    document.body.appendChild(_0x3c5c85);
    _0x3c5c85.click();
    _0x3c5c85.remove();
  };
  const _0x245c9a = _0x4af3dc => {
    const _0x3cabed = String(_0x4af3dc || "").trim();
    if (!_0x3cabed) {
      return false;
    }
    if (_0x3cabed.startsWith("/")) {
      return true;
    }
    try {
      const _0x1fd099 = new URL(_0x3cabed, window.location.href);
      return _0x1fd099.origin === window.location.origin;
    } catch {
      return false;
    }
  };
  const _0x127b5d = () => {
    const _0x48b124 = _0x2d11c1();
    const _0x57e776 = Array.isArray(_0x48b124.videos) ? _0x48b124.videos : [];
    const _0x219730 = _0x48b124.mainVideoIndex || 0;
    const _0x2bb2de = _0x57e776[_0x219730] || _0x57e776[0] || {};
    return _0x47309e(resolveCanvasVideoUrl(_0x2bb2de) || resolveCanvasVideoUrl(_0x48b124));
  };
  const _0x9b22da = () => {
    const _0x350318 = _0x26bdbb.closest?.(".v2-node") || _0x26bdbb.parentElement || null;
    const _0x2f8842 = Array.from(_0x350318?.querySelectorAll?.("video") || []);
    if (_0x2f8842.length === 0) {
      return "";
    }
    const _0x17c083 = _0x127b5d();
    const _0x461307 = _0x1c818f => {
      const _0xb55035 = String(_0x1c818f || "").trim();
      if (!_0xb55035) {
        return "";
      }
      try {
        return new URL(_0xb55035, globalThis.location?.href || globalThis.window?.location?.href || "http://localhost/").href;
      } catch {
        return _0xb55035;
      }
    };
    const _0x565bed = _0x461307(_0x17c083);
    const _0x431327 = _0x2f8842.find(_0x55ae7c => {
      const _0x14cc5f = _0x55ae7c.dataset?.desktopMediaSourceUrl || getVideoCurrentSource(_0x55ae7c);
      return _0x565bed && _0x461307(_0x14cc5f) === _0x565bed;
    });
    const _0x5691d6 = _0x431327 || _0x2f8842.find(_0x358f76 => _0x358f76.classList?.contains?.("video-player")) || _0x2f8842.find(_0x1fd565 => _0x1fd565.paused === false) || _0x2f8842[0];
    return getVideoCurrentSource(_0x5691d6);
  };
  const _0x177a51 = () => {
    const _0x420acc = _0x2d11c1();
    const _0x4127f9 = Array.isArray(_0x420acc.videos) ? _0x420acc.videos : [];
    const _0x22397c = _0x420acc.mainVideoIndex || 0;
    const _0x16cdd6 = _0x4127f9[_0x22397c] || _0x4127f9[0] || {};
    return resolveCanvasVideoLocalPath(_0x16cdd6) || resolveCanvasVideoLocalPath(_0x420acc);
  };
  const _0x1544c7 = () => {
    const _0x1c5c96 = _0x2d11c1();
    const _0x15d82f = Array.isArray(_0x1c5c96.videos) ? _0x1c5c96.videos : [];
    const _0x1a0e7f = _0x1c5c96.mainVideoIndex || 0;
    const _0x159dbb = _0x15d82f[_0x1a0e7f] || _0x15d82f[0] || {};
    return {
      node: _0x1c5c96,
      item: _0x159dbb
    };
  };
  const _0x5b566a = () => {
    const {
      node: _0x405cef,
      item: _0x257f5e
    } = _0x1544c7();
    const _0x21259b = [_0x257f5e?.videoDuration, _0x257f5e?.duration, _0x405cef?.videoDuration];
    for (const _0x2861aa of _0x21259b) {
      const _0x816931 = Number(_0x2861aa);
      if (Number.isFinite(_0x816931) && _0x816931 > 0) {
        return _0x816931;
      }
    }
    return 0;
  };
  const _0x44d15f = () => {
    const {
      node: _0x238a4a,
      item: _0x65926b
    } = _0x1544c7();
    return resolveCanvasVideoLocalPath(_0x65926b) || resolveCanvasVideoLocalPath(_0x238a4a);
  };
  const _0x4f9a61 = async () => {
    try {
      const _0x2cd3e2 = await fetchAppRuntimeInfoFromServer();
      window.ADVANCED_MODE = Boolean(_0x2cd3e2?.isAdvancedMode);
    } catch {}
    return window.ADVANCED_MODE === true;
  };
  const _0x40c6ea = _0x45fb61 => new Promise(_0x3054aa => {
    const _0x46afb3 = String(_0x45fb61 || "").trim();
    if (!_0x46afb3) {
      _0x3054aa(0);
      return;
    }
    const _0x4678e7 = document.createElement("video");
    let _0xec7797 = false;
    const _0x3e6449 = () => {
      _0x4678e7.removeAttribute("src");
      try {
        _0x4678e7.load();
      } catch {}
    };
    const _0x8a3aad = _0x1c9ce7 => {
      if (_0xec7797) {
        return;
      }
      _0xec7797 = true;
      window.clearTimeout(_0x5cc4e7);
      _0x3e6449();
      _0x3054aa(_0x1c9ce7);
    };
    const _0x5cc4e7 = window.setTimeout(() => _0x8a3aad(0), 12000);
    _0x4678e7.preload = "metadata";
    _0x4678e7.muted = true;
    _0x4678e7.playsInline = true;
    _0x4678e7.onloadedmetadata = () => {
      const _0x5c2bc3 = Number(_0x4678e7.duration);
      _0x8a3aad(Number.isFinite(_0x5c2bc3) && _0x5c2bc3 > 0 ? _0x5c2bc3 : 0);
    };
    _0x4678e7.onerror = () => _0x8a3aad(0);
    attachMediaElementPlaybackSource(_0x4678e7, _0x46afb3, {
      preload: "metadata"
    }).catch(() => {
      if (!String(_0x4678e7.getAttribute?.("src") || _0x4678e7.src || "").trim()) {
        _0x4678e7.src = _0x46afb3;
        _0x4678e7.load?.();
      }
    });
  });
  const _0x507d20 = async _0x539f68 => {
    const _0x3573b1 = _0x5b566a();
    if (_0x3573b1 > 0) {
      return _0x3573b1;
    }
    const _0x26cad3 = _0x44d15f();
    if (_0x26cad3) {
      try {
        const _0x328716 = await fetchVideoMetaFromServer(_0x26cad3);
        const _0x3d97b6 = Number(_0x328716?.duration);
        if (Number.isFinite(_0x3d97b6) && _0x3d97b6 > 0) {
          return _0x3d97b6;
        }
      } catch {}
    }
    return _0x40c6ea(_0x539f68);
  };
  const _0x149320 = async _0x25cf77 => {
    if (await _0x4f9a61()) {
      return true;
    }
    const _0x23205a = await _0x507d20(_0x25cf77);
    if (Number.isFinite(_0x23205a) && _0x23205a > VIDEO_HD_STANDARD_MAX_SECONDS + 0.05) {
      window.showToast?.(videoToolbarText("durationLimit", {
        seconds: VIDEO_HD_STANDARD_MAX_SECONDS
      }), "warn", 5200);
      return false;
    }
    return true;
  };
  const _0x588657 = async (_0x4e425f, _0xaf150a = null) => {
    return true;
  };
  const _0x35cc8c = _0x45d4c8 => {
    const _0x2011e2 = new Set();
    const _0x78b894 = ["url", "videoUrl", "video_url", "fileUrl", "file_url", "download_url", "output", "result", "data", "results", "outputs"];
    const _0x4fce38 = _0x227387 => {
      const _0x406ff4 = String(_0x227387 || "").trim();
      if (!_0x406ff4) {
        return "";
      }
      if (_0x406ff4.startsWith("http://") || _0x406ff4.startsWith("https://")) {
        return _0x406ff4;
      }
      if (_0x406ff4.startsWith("/")) {
        return _0x406ff4;
      }
      const _0x4eb4d5 = _0x406ff4.match(/https?:\/\/[^\s"'<>]+/);
      if (_0x4eb4d5?.[0]) {
        return _0x4eb4d5[0];
      }
      if (_0x406ff4.startsWith("{") || _0x406ff4.startsWith("[")) {
        try {
          return _0x456b84(JSON.parse(_0x406ff4));
        } catch {}
      }
      return "";
    };
    const _0x456b84 = _0x33b598 => {
      if (!_0x33b598) {
        return "";
      }
      if (typeof _0x33b598 === "string") {
        return _0x4fce38(_0x33b598);
      }
      if (typeof _0x33b598 !== "object") {
        return "";
      }
      if (_0x2011e2.has(_0x33b598)) {
        return "";
      }
      _0x2011e2.add(_0x33b598);
      if (Array.isArray(_0x33b598)) {
        for (const _0xd838aa of _0x33b598) {
          const _0x52e3e7 = _0x456b84(_0xd838aa);
          if (_0x52e3e7) {
            return _0x52e3e7;
          }
        }
        return "";
      }
      for (const _0x933c2c of _0x78b894) {
        if (_0x933c2c in _0x33b598) {
          const _0x412ba5 = _0x456b84(_0x33b598[_0x933c2c]);
          if (_0x412ba5) {
            return _0x412ba5;
          }
        }
      }
      for (const _0x563978 of Object.keys(_0x33b598)) {
        const _0x31572f = _0x456b84(_0x33b598[_0x563978]);
        if (_0x31572f) {
          return _0x31572f;
        }
      }
      return "";
    };
    return _0x456b84(_0x45d4c8);
  };
  const _0x4f6119 = _0x3e011e => {
    return urlToLocalPath(_0x3e011e);
  };
  const _0x3c84b2 = async _0x14666e => {
    const _0x46a1f6 = String(_0x14666e || "").trim();
    if (!isClientFetchableVideoUrl(_0x46a1f6)) {
      throw new Error(videoToolbarText("saveInvalidUrl"));
    }
    const _0x233d6d = new AbortController();
    const _0x2b3a74 = setTimeout(() => _0x233d6d.abort(), 120000);
    let _0x286c17 = null;
    try {
      _0x286c17 = await fetchRemoteBlob(_0x46a1f6, {
        signal: _0x233d6d.signal
      });
    } finally {
      clearTimeout(_0x2b3a74);
    }
    if (!_0x286c17) {
      throw new Error(videoToolbarText("saveEmptyDownload"));
    }
    const _0x374c74 = await saveOutputToServer(_0x286c17, {
      ext: "mp4"
    });
    const _0x1d39dd = pickResultLocalPath(_0x374c74);
    if (!_0x374c74?.success || !_0x1d39dd) {
      throw new Error(videoToolbarText("saveMalformed"));
    }
    return _0x1d39dd;
  };
  const _0x1a4182 = async _0x5dc634 => {
    let _0x50663e = _0x4f6119(_0x5dc634);
    if (!_0x50663e && isClientFetchableVideoUrl(_0x5dc634)) {
      try {
        window.showToast?.(videoToolbarText("savingLocal"), "info");
        _0x50663e = await _0x3c84b2(_0x5dc634);
      } catch (_0x4b9402) {
        const _0x4d18be = _0x4b9402 instanceof Error ? _0x4b9402.message : String(_0x4b9402 || "");
        const _0x3cda8d = _0x4d18be.includes("Failed to fetch") || _0x4d18be.includes("NetworkError") || _0x4d18be.toLowerCase().includes("cors");
        if (!_0x3cda8d || !/^https?:\/\//i.test(_0x5dc634)) {
          throw _0x4b9402;
        }
        const _0x4ba9e0 = await saveOutputFromUrlToServer({
          url: _0x5dc634,
          ext: "mp4"
        });
        const _0x3d6c0b = pickResultLocalPath(_0x4ba9e0);
        if (_0x3d6c0b) {
          _0x50663e = _0x3d6c0b;
        } else {
          throw new Error(_0x4ba9e0?.error || videoToolbarText("localSaveFailed"));
        }
      }
    }
    return _0x50663e || "";
  };
  const _0x3c884c = {
    toolbarEl: _0x26bdbb,
    nodeData: _0x39a4c3,
    mediaKind: "video",
    getStateSnapshot: getStateSnapshot,
    store: a478_0x33798a,
    findAvailablePosition: findAvailablePosition,
    submitTask: submitTask,
    createRunningHubTaskStateMachine: createRunningHubTaskStateMachine,
    VideoClipController: a478_0x369675,
    runSmartClipKeyframeExtractionFromVideoNode: runSmartClipKeyframeExtractionFromVideoNode,
    runVideoAudioSeparationFromNode: runVideoAudioSeparationFromNode,
    runVideoReverseFromNode: runVideoReverseFromNode,
    VideoKeyingController: a478_0x452ea3,
    fetchRemoteBlob: fetchRemoteBlob,
    runRunninghubAiApp: runRunninghubAiApp,
    runRunninghubWorkflow: runRunninghubWorkflow,
    resumeRunninghubWorkflowTask: resumeRunninghubWorkflowTask,
    processInputVideos: processInputVideos,
    detectScenes: detectScenes,
    getProviderConfig: getProviderConfig,
    ensureConfig: ensureConfig,
    calcSafeSpawnPosNearNode: calcSafeSpawnPosNearNode,
    getNodeSpawnPrefs: getNodeSpawnPrefs,
    buildSourceMediaNodePayload: buildSourceMediaNodePayload,
    getAutoMediaSizeByShortSide: getAutoMediaSizeByShortSide,
    buildCanvasLocalVideoFields: buildCanvasLocalVideoFields,
    buildVideoGenerationFailurePatch: buildVideoGenerationFailurePatch,
    buildVideoGenerationResultPatch: buildVideoGenerationResultPatch,
    executeCommand: executeCommand,
    VIDEO_TOOLBAR_FOCUS_PADDING: _0x2ec829,
    VIDEO_TOOLBAR_FOCUS_DURATION_MS: _0x16ca7d,
    VIDEO_TOOLBAR_FOCUS_MAX_ZOOM: _0x50e546,
    KEYING_CANCEL_ICON_HTML: KEYING_CANCEL_ICON_HTML,
    bindRunningHubToolbarTaskButton: bindRunningHubToolbarTaskButton,
    cancelRunningHubResultTask: cancelRunningHubResultTask,
    findRunningHubToolbarTaskForNode: findRunningHubToolbarTaskForNode,
    isRunningHubToolbarTaskCancelled: isRunningHubToolbarTaskCancelled,
    notifyRunningHubToolbarTasksChanged: notifyRunningHubToolbarTasksChanged,
    RH_VIDEO_HD_BASIC_WORKFLOW_ID: RH_VIDEO_HD_BASIC_WORKFLOW_ID,
    RH_VIDEO_HD_VIP_MODEL_ID: RH_VIDEO_HD_VIP_MODEL_ID,
    RH_VIDEO_HD_VIP_APP_ID: RH_VIDEO_HD_VIP_APP_ID,
    VIDEO_HD_STANDARD_INSTANCE_TYPE: VIDEO_HD_STANDARD_INSTANCE_TYPE,
    VIDEO_HD_VIP_INSTANCE_TYPE: VIDEO_HD_VIP_INSTANCE_TYPE,
    _getLatestNodeData: _0x2d11c1,
    _triggerHrefDownload: _0x2c1636,
    _isProbablyLocalUrl: _0x245c9a,
    _getCurrentVideoUrl: _0x127b5d,
    _getCurrentVideoPlaybackUrl: _0x9b22da,
    _getCurrentVideoLocalPath: _0x177a51,
    saveMediaFile: desktopBridge.nodeExport.canSaveMedia() ? saveMediaDownload : null,
    _getCurrentVideoSource: _0x1544c7,
    _ensureVideoHdDurationAllowed: _0x149320,
    _ensureVideoHdVipAllowed: _0x588657,
    _extractFirstUrl: _0x35cc8c,
    _saveRemoteVideoResult: _0x1a4182
  };
  bindPreviewUploadToolbarAction({
    button: _0x26bdbb.querySelector(".act-upload")
  });
  bindStoryboardScriptToolbarAction(_0x3c884c);
  bindApimartPrivateAvatarAction(_0x3c884c);
  bindVideoClipAction(_0x3c884c);
  bindVideoVoiceReplaceAction(_0x3c884c);
  bindVideoExtractKeyframesAction(_0x3c884c);
  bindVideoSeparateAvAction(_0x3c884c);
  bindVideoReverseAction(_0x3c884c);
  bindVideoSmartClipAction(_0x3c884c);
  bindVideoKeyingAction(_0x3c884c);
  bindVideoRemoveAction(_0x3c884c);
  bindVideoFrameInterpolationAction(_0x3c884c);
  bindVideoHdAction(_0x3c884c);
  bindVideoDownloadAction(_0x3c884c);
  bindVideoFullscreenAction(_0x3c884c);
  bindVideoResetSizeAction(_0x3c884c);
}
