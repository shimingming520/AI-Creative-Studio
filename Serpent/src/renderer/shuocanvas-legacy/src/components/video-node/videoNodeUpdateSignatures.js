const VIDEO_NODE_LAYOUT_SIG_IGNORED_KEYS = new Set(["x", "y", "width", "height", "_bizRev", "selected", "isSelected", "zIndex"]);
const VIDEO_NODE_FOOTER_CONTROL_SIG_IGNORED_KEYS = new Set([...VIDEO_NODE_LAYOUT_SIG_IGNORED_KEYS, "prompt", "videoUrl", "resultUrl", "sourceUrl", "localPath", "displayLocalPath", "originalLocalPath", "thumbId", "thumbUrl", "thumbLocalPath", "posterUrl", "posterLocalPath", "mainVideoIndex", "isVideosExpanded", "videoMetaSrc", "videoFps", "videoFrameCount", "videoDuration", "videoWidth", "videoHeight", "selectedVideoWidth", "selectedVideoHeight", "isGenerating", "jobStatus", "jobError", "error", "statusMessage", "rhStatus", "rhStatusMessage", "rhStatusCode", "rhTaskId", "rhTaskStatus", "rhTaskStartedAt", "rhTaskRecovering", "rhTaskUseOpenapiQuery", "dreaminaSubmitId", "dreaminaTaskStatus", "dreaminaTaskPhase", "dreaminaTaskLabel", "dreaminaTaskStartedAt", "dreaminaTaskLastCheckedAt", "dreaminaTaskRecovering", "asyncTaskId", "asyncTaskStatus", "asyncTaskError", "asyncTaskRecovering"]);
function stringifyVideoNodeUpdateSig(_0x3cafed) {
  try {
    return JSON.stringify(_0x3cafed);
  } catch {
    return "";
  }
}
function isVideoNodeUpdateSigPrimitive(_0xa30e81) {
  return _0xa30e81 == null || typeof _0xa30e81 === "string" || typeof _0xa30e81 === "number" || typeof _0xa30e81 === "boolean";
}
function getGenerationParamsForSig(_0x2f38d4) {
  if (_0x2f38d4.generationParams && typeof _0x2f38d4.generationParams === "object" && !Array.isArray(_0x2f38d4.generationParams)) {
    return _0x2f38d4.generationParams;
  } else {
    return null;
  }
}
function buildVideoNodePrimitiveDataSig(_0x4569b4 = {}, {
  ignoredKeys = VIDEO_NODE_LAYOUT_SIG_IGNORED_KEYS
} = {}) {
  const _0x118c52 = _0x4569b4 && typeof _0x4569b4 === "object" ? _0x4569b4 : {};
  const _0x10d7cf = {};
  Object.keys(_0x118c52).sort().forEach(_0x3deeca => {
    if (ignoredKeys.has(_0x3deeca)) {
      return;
    }
    const _0x5c7dbc = _0x118c52[_0x3deeca];
    if (isVideoNodeUpdateSigPrimitive(_0x5c7dbc)) {
      _0x10d7cf[_0x3deeca] = _0x5c7dbc ?? null;
    }
  });
  return stringifyVideoNodeUpdateSig({
    primitive: _0x10d7cf,
    generationParams: getGenerationParamsForSig(_0x118c52)
  });
}
export function buildVideoNodePromptUiSig(_0x344117 = {}) {
  const _0x4c90cf = _0x344117 && typeof _0x344117 === "object" ? _0x344117 : {};
  return stringifyVideoNodeUpdateSig({
    model: String(_0x4c90cf.model || ""),
    provider: String(_0x4c90cf.provider || "")
  });
}
export function buildVideoNodePromptBoxSizeSig(_0x4d5cc7 = {}) {
  const _0x1101bb = _0x4d5cc7 && typeof _0x4d5cc7 === "object" ? _0x4d5cc7 : {};
  return String(Number(_0x1101bb.promptBoxHeight || 0) || 0);
}
export function buildVideoNodeVideoViewSig(_0x476a93 = {}) {
  const _0x4f03de = _0x476a93 && typeof _0x476a93 === "object" ? _0x476a93 : {};
  const _0x4da373 = Array.isArray(_0x4f03de.videos) ? _0x4f03de.videos : [];
  return stringifyVideoNodeUpdateSig({
    videos: _0x4da373.map(_0x34bc8c => ({
      videoUrl: String(_0x34bc8c?.videoUrl || ""),
      resultUrl: String(_0x34bc8c?.resultUrl || ""),
      sourceUrl: String(_0x34bc8c?.sourceUrl || ""),
      localPath: String(_0x34bc8c?.localPath || ""),
      displayLocalPath: String(_0x34bc8c?.displayLocalPath || ""),
      originalLocalPath: String(_0x34bc8c?.originalLocalPath || ""),
      thumbId: String(_0x34bc8c?.thumbId || ""),
      thumbUrl: String(_0x34bc8c?.thumbUrl || ""),
      thumbLocalPath: String(_0x34bc8c?.thumbLocalPath || ""),
      posterUrl: String(_0x34bc8c?.posterUrl || ""),
      posterLocalPath: String(_0x34bc8c?.posterLocalPath || ""),
      error: String(_0x34bc8c?.error || ""),
      mediaUnavailable: _0x34bc8c?.mediaUnavailable === true,
      mediaUnavailableSource: String(_0x34bc8c?.mediaUnavailableSource || "")
    })),
    videoUrl: String(_0x4f03de.videoUrl || ""),
    resultUrl: String(_0x4f03de.resultUrl || ""),
    sourceUrl: String(_0x4f03de.sourceUrl || ""),
    localPath: String(_0x4f03de.localPath || ""),
    displayLocalPath: String(_0x4f03de.displayLocalPath || ""),
    originalLocalPath: String(_0x4f03de.originalLocalPath || ""),
    thumbId: String(_0x4f03de.thumbId || ""),
    thumbUrl: String(_0x4f03de.thumbUrl || ""),
    thumbLocalPath: String(_0x4f03de.thumbLocalPath || ""),
    posterUrl: String(_0x4f03de.posterUrl || ""),
    posterLocalPath: String(_0x4f03de.posterLocalPath || ""),
    mainVideoIndex: Number(_0x4f03de.mainVideoIndex || 0),
    isVideosExpanded: !!_0x4f03de.isVideosExpanded,
    isGenerating: _0x4f03de.isGenerating === true,
    jobStatus: String(_0x4f03de.jobStatus || ""),
    jobError: String(_0x4f03de.jobError || ""),
    error: String(_0x4f03de.error || ""),
    statusMessage: String(_0x4f03de.statusMessage || ""),
    rhStatus: String(_0x4f03de.rhStatus || ""),
    rhStatusMessage: String(_0x4f03de.rhStatusMessage || ""),
    rhStatusCode: String(_0x4f03de.rhStatusCode || ""),
    rhTaskId: String(_0x4f03de.rhTaskId || ""),
    rhTaskStatus: String(_0x4f03de.rhTaskStatus || ""),
    rhTaskStartedAt: Number(_0x4f03de.rhTaskStartedAt || 0),
    rhTaskRecovering: !!_0x4f03de.rhTaskRecovering,
    rhTaskUseOpenapiQuery: !!_0x4f03de.rhTaskUseOpenapiQuery,
    dreaminaSubmitId: String(_0x4f03de.dreaminaSubmitId || ""),
    dreaminaTaskStatus: String(_0x4f03de.dreaminaTaskStatus || ""),
    dreaminaTaskPhase: String(_0x4f03de.dreaminaTaskPhase || ""),
    dreaminaTaskLabel: String(_0x4f03de.dreaminaTaskLabel || ""),
    dreaminaTaskStartedAt: Number(_0x4f03de.dreaminaTaskStartedAt || 0),
    dreaminaTaskLastCheckedAt: Number(_0x4f03de.dreaminaTaskLastCheckedAt || 0),
    dreaminaTaskRecovering: !!_0x4f03de.dreaminaTaskRecovering,
    asyncTaskId: String(_0x4f03de.asyncTaskId || ""),
    asyncTaskStatus: String(_0x4f03de.asyncTaskStatus || ""),
    asyncTaskError: String(_0x4f03de.asyncTaskError || ""),
    asyncTaskRecovering: !!_0x4f03de.asyncTaskRecovering
  });
}
export function buildVideoNodeFooterControlSig(_0x19e4cb = {}, _0x383641 = "") {
  return [_0x383641, buildVideoNodePrimitiveDataSig(_0x19e4cb, {
    ignoredKeys: VIDEO_NODE_FOOTER_CONTROL_SIG_IGNORED_KEYS
  })].join("\n");
}
export function buildVideoNodeSubmitButtonSig(_0x330b66 = {}, _0x12df8e = "", _0x1e823c = {}) {
  return [_0x12df8e, _0x1e823c.rhCancelInFlight === true ? "cancel:1" : "cancel:0", buildVideoNodePrimitiveDataSig(_0x330b66)].join("\n");
}