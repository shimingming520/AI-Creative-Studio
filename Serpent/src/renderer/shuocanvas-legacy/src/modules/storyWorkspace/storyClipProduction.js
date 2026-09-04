import { resolveAssetMentionRef } from "../assetMentionRegistry.js";
import { renderAIGenVideoModelSelectorMarkup } from "../../components/aigenVideo/modelSelector.js";
import { renderVideoPromptEditorMarkup, renderVideoReferenceBarMarkup } from "../../components/video-node/promptInputSurface.js";
import { resolveModelExecution } from "../../manifests/index.js";
import { buildFixedInputAssetSlotMapFromRefs, getFixedInputSlotConfigFromManifest, shouldHideFixedInputSlots } from "../fixedInputAssetRefs.js";
import { sanitizePromptHtmlForCommit } from "../nodePromptShared.js";
import { t } from "../../i18n/index.js";
import { buildStoryClipInputSlotViewModel } from "./storyClipInputSlots.js";
import { getRecoverableStoryClipVideoTask } from "./storyClipGeneration.js";
import { renderStoryGenerationSpinner } from "./storyAsyncButtonPresentation.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { renderWorkspaceVideoPlaybackControls } from "../workspaceVideoPlaybackControls.js";
import { renderStoryClipPromptMentions, resolveStoryClipPromptAssetRefs } from "./storyClipMentions.js";
import { normalizeDurationSeconds } from "./storyPlanningData.js";
import { resolveStoryVideoReplicationClipVoiceAssetIds } from "./storyVideoReplication.js";
import { renderStoryKeyframeIcon } from "./storyWorkspaceIcons.js";
import { renderStoryMediaHistoryMenu } from "./storyMediaHistory.js";
import { VIDEO_CLIP_ICON_SVG } from "../../components/nodeToolbar/videoToolbarHtml.js";
import { renderWorkspaceCardDeleteControl } from "../workspaceAssetPresentation.js";
import { formatStoryClipVideoGenerationDuration, resolveStoryClipVideoGenerationParams } from "./storyVideoGenerationSettings.js";
import { STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_IDS } from "./storyWorkspaceModelCatalog.js";
import { isStoryClipAdjustmentGenerating, normalizeStoryClipPromptHistory } from "./storyClipAdjustment.js";
import { STORY_PROMPT_MODE_OPTIONS, isStoryMinimaxH3PromptMode, getStoryPromptModeLabel, normalizeStoryMinimaxH3OfficialTags, normalizeStoryPromptMode } from "./storyPromptModes.js";
function escapeHtml(_0x19d565) {
  return String(_0x19d565 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function normalizeText(_0x4f4085) {
  return String(_0x4f4085 || "").trim();
}
function formatPromptHistorySavedAt(_0x21dae7) {
  const _0x1f95b6 = new Date(Number(_0x21dae7));
  if (!Number.isFinite(_0x1f95b6.getTime()) || Number(_0x21dae7) <= 0) {
    return "时间未记录";
  }
  const _0x2eb472 = _0x535c9e => String(_0x535c9e).padStart(2, "0");
  return _0x1f95b6.getFullYear() + "-" + _0x2eb472(_0x1f95b6.getMonth() + 1) + "-" + _0x2eb472(_0x1f95b6.getDate()) + " " + _0x2eb472(_0x1f95b6.getHours()) + ":" + _0x2eb472(_0x1f95b6.getMinutes());
}
function getPromptHistoryPreview(_0x12d9f2) {
  return normalizeText(String(_0x12d9f2 || "").replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&").replace(/\s+/g, " ")).slice(0, 96);
}
function getVideoResults(_0x56b365 = {}) {
  if (Array.isArray(_0x56b365?.video?.results)) {
    return _0x56b365.video.results.filter(_0x360704 => _0x360704 && typeof _0x360704 === "object");
  } else {
    return [];
  }
}
function getActiveVideoResultIndex(_0x688e40 = {}, _0x1a3346 = getVideoResults(_0x688e40)) {
  if (!_0x1a3346.length) {
    return 0;
  }
  const _0x85d6f3 = Math.trunc(Number(_0x688e40?.video?.activeIndex) || 0);
  return Math.max(0, Math.min(_0x1a3346.length - 1, _0x85d6f3));
}
function removeVideoResult(_0x3afe36 = {}, _0x543ff0) {
  const _0x244e8f = getVideoResults(_0x3afe36);
  const _0x2a356d = Number(_0x543ff0);
  const _0x3b6aac = getActiveVideoResultIndex(_0x3afe36, _0x244e8f);
  if (_0x244e8f.length < 2 || !Number.isInteger(_0x2a356d) || _0x2a356d < 0 || _0x2a356d >= _0x244e8f.length) {
    return {
      changed: false,
      clip: _0x3afe36,
      results: _0x244e8f,
      activeIndex: _0x3b6aac,
      activeResultChanged: false,
      direction: ""
    };
  }
  const _0x4e91c8 = _0x244e8f[_0x3b6aac];
  const _0x57461a = _0x244e8f.filter((_0x182af4, _0xe5e729) => _0xe5e729 !== _0x2a356d);
  const _0x277177 = _0x2a356d < _0x3b6aac ? _0x3b6aac - 1 : _0x2a356d === _0x3b6aac ? Math.min(_0x2a356d, _0x57461a.length - 1) : _0x3b6aac;
  const _0x2cee4a = _0x57461a[_0x277177] !== _0x4e91c8;
  return {
    changed: true,
    clip: {
      ..._0x3afe36,
      video: {
        ...(_0x3afe36?.video || {}),
        results: _0x57461a,
        activeIndex: _0x277177
      }
    },
    results: _0x57461a,
    activeIndex: _0x277177,
    activeResultChanged: _0x2cee4a,
    direction: _0x2cee4a && _0x2a356d >= _0x57461a.length ? "previous" : _0x2cee4a ? "next" : ""
  };
}
function resolveVideoResultUrl(_0x4e0d49 = {}) {
  return [localPathToUrl(_0x4e0d49.displayLocalPath), localPathToUrl(_0x4e0d49.localPath), _0x4e0d49.videoUrl, _0x4e0d49.url, _0x4e0d49.displayUrl].map(_0x498eb8 => normalizeText(_0x498eb8)).find(Boolean) || "";
}
function resolveVideoResultPosterUrl(_0x327e15 = {}) {
  return [_0x327e15.posterUrl, _0x327e15.thumbUrl, _0x327e15.thumbnailUrl, _0x327e15.coverUrl, localPathToUrl(_0x327e15.posterLocalPath), localPathToUrl(_0x327e15.thumbLocalPath), localPathToUrl(_0x327e15.thumbnailLocalPath)].map(_0x1a6c87 => normalizeText(_0x1a6c87)).find(Boolean) || "";
}
function renderVideoThumbnail(_0x527141, {
  className = "",
  label = "视频缩略图"
} = {}) {
  const _0x3202e2 = resolveVideoResultPosterUrl(_0x527141);
  if (_0x3202e2) {
    return "<img class=\"" + escapeHtml(className) + "\" src=\"" + escapeHtml(_0x3202e2) + "\" alt=\"" + escapeHtml(label) + "\" loading=\"lazy\" draggable=\"false\">";
  }
  const _0xe4af7c = resolveVideoResultUrl(_0x527141);
  if (_0xe4af7c) {
    return "<video class=\"" + escapeHtml(className) + "\" src=\"" + escapeHtml(_0xe4af7c) + "\" aria-label=\"" + escapeHtml(label) + "\" muted playsinline preload=\"metadata\"></video>";
  }
  return "";
}
function getAdjacentVideoResultIndex(_0x450687 = {}, _0x4a81ec = 1) {
  const _0x277311 = getVideoResults(_0x450687);
  if (_0x277311.length < 2) {
    return getActiveVideoResultIndex(_0x450687, _0x277311);
  }
  const _0x296c1b = getActiveVideoResultIndex(_0x450687, _0x277311);
  const _0x27d6ac = Number(_0x4a81ec) < 0 ? -1 : 1;
  return (_0x296c1b + _0x27d6ac + _0x277311.length) % _0x277311.length;
}
function renderVideoHistoryMenu(_0x1a01e2 = {}) {
  const _0x347fef = getVideoResults(_0x1a01e2);
  const _0x35c0da = getActiveVideoResultIndex(_0x1a01e2, _0x347fef);
  return renderStoryMediaHistoryMenu({
    title: _0x1a01e2?.title || "片段视频",
    results: _0x347fef,
    activeIndex: _0x35c0da,
    menuLabel: (_0x1a01e2?.title || "片段") + "历史视频",
    getItemStatus: (_0x394a1e, _0x26aa69) => _0x26aa69 === _0x35c0da ? "当前播放" : "点击切换",
    renderMedia: (_0x386d75, _0x1a1c1b) => renderVideoThumbnail(_0x386d75, {
      className: "story-media-history-thumbnail story-clip-video-history-thumbnail",
      label: (_0x1a01e2?.title || "片段") + " · 版本 " + (_0x1a1c1b + 1)
    }),
    getItemAttributes: (_0x615a2c, _0x14d199) => "data-story-action=\"select-video-result\" data-story-clip-id=\"" + escapeHtml(_0x1a01e2?.id) + "\" data-story-video-result-index=\"" + _0x14d199 + "\"",
    renderItemAction: (_0x3609b1, _0xa7d758) => renderWorkspaceCardDeleteControl({
      className: "story-media-history-delete",
      ariaLabel: "删除版本 " + (_0xa7d758 + 1),
      actionAttributes: {
        "data-story-action": "delete-video-result",
        "data-story-clip-id": _0x1a01e2?.id,
        "data-story-video-result-index": _0xa7d758
      }
    })
  });
}
function renderGenerationSpinner() {
  return renderStoryGenerationSpinner();
}
function renderTimelineVideoThumbnail(_0x8fe206 = {}) {
  const _0x1bcbb9 = getVideoResults(_0x8fe206);
  const _0x4ff398 = _0x1bcbb9[getActiveVideoResultIndex(_0x8fe206, _0x1bcbb9)] || null;
  if (_0x4ff398) {
    return renderVideoThumbnail(_0x4ff398, {
      className: "story-clip-card-thumbnail",
      label: "片段 " + _0x8fe206.number + " 视频缩略图"
    });
  } else {
    return "";
  }
}
function getSelectedEpisode(_0x43ec6f) {
  const _0x2897d0 = Array.isArray(_0x43ec6f?.data?.episodes) ? _0x43ec6f.data.episodes : [];
  return _0x2897d0.find(_0xa24fbf => _0xa24fbf.id === _0x43ec6f?.selectedEpisodeId) || _0x2897d0[0] || null;
}
function getSelectedClip(_0x288759, _0x33bab6) {
  const _0x5b02af = Array.isArray(_0x33bab6?.clips) ? _0x33bab6.clips : [];
  return _0x5b02af.find(_0xc5cf3c => _0xc5cf3c.id === _0x288759?.selectedClipId) || _0x5b02af[0] || null;
}
function getAdjacentClipId(_0x12ab30 = [], _0x1fd4f7 = "", _0x10a606 = 1) {
  const _0x4348a8 = (Array.isArray(_0x12ab30) ? _0x12ab30 : []).filter(_0x34e5be => normalizeText(_0x34e5be?.id));
  if (!_0x4348a8.length) {
    return "";
  }
  const _0x1c31b6 = _0x4348a8.findIndex(_0x21ef18 => _0x21ef18.id === _0x1fd4f7);
  const _0x4924eb = _0x1c31b6 >= 0 ? _0x1c31b6 : 0;
  const _0x4ddf3c = Number(_0x10a606) < 0 ? -1 : 1;
  const _0x5e56ef = (_0x4924eb + _0x4ddf3c + _0x4348a8.length) % _0x4348a8.length;
  return _0x4348a8[_0x5e56ef].id;
}
function selectBatchTargets(_0x6e8da8 = [], _0xf24a0a = []) {
  const _0x1a3d3d = new Set((Array.isArray(_0xf24a0a) ? _0xf24a0a : []).map(_0x412b8b => normalizeText(_0x412b8b)).filter(Boolean));
  return (Array.isArray(_0x6e8da8) ? _0x6e8da8 : []).filter(_0x3b0162 => _0x1a3d3d.has(normalizeText(_0x3b0162?.id)));
}
async function runBatch(_0x1a5068 = [], _0x28b2af = null, {
  onProgress = null
} = {}) {
  if (typeof _0x28b2af !== "function") {
    return [];
  }
  const _0x386efb = Array.isArray(_0x1a5068) ? _0x1a5068 : [];
  let _0x496e00 = 0;
  return Promise.all(_0x386efb.map(async (_0x2a3109, _0x22ac72) => {
    let _0x166950;
    try {
      _0x166950 = await _0x28b2af(_0x2a3109, {
        index: _0x22ac72,
        total: _0x386efb.length
      });
    } catch (_0x1bc9d8) {
      _0x166950 = {
        ok: false,
        error: _0x1bc9d8
      };
    }
    _0x496e00 += 1;
    onProgress?.({
      completed: _0x496e00,
      total: _0x386efb.length,
      index: _0x22ac72,
      target: _0x2a3109,
      result: _0x166950
    });
    return _0x166950;
  }));
}
function getGeneratingClipIds(_0x943daa = {}, _0x34c631 = null) {
  const _0x4e1ff7 = new Set((Array.isArray(_0x943daa?.generatingClipIds) ? _0x943daa.generatingClipIds : []).map(_0x5ef40a => normalizeText(_0x5ef40a)).filter(Boolean));
  const _0x140c09 = normalizeText(_0x943daa?.generatingClipId);
  if (_0x140c09) {
    _0x4e1ff7.add(_0x140c09);
  }
  const _0x11e358 = [..._0x4e1ff7];
  if (!_0x34c631) {
    return _0x11e358;
  }
  const _0x5618ce = new Set((Array.isArray(_0x34c631?.clips) ? _0x34c631.clips : []).map(_0x28ed9d => normalizeText(_0x28ed9d?.id)).filter(Boolean));
  return _0x11e358.filter(_0x5d89e4 => _0x5618ce.has(_0x5d89e4));
}
function setClipGenerationRunning(_0x5d3d20, _0x44fd96, _0xb69d27 = true) {
  if (!_0x5d3d20 || typeof _0x5d3d20 !== "object") {
    return [];
  }
  const _0x21f9d4 = normalizeText(_0x44fd96);
  const _0x5aa048 = new Set(getGeneratingClipIds(_0x5d3d20));
  if (_0x21f9d4) {
    if (_0xb69d27) {
      _0x5aa048.add(_0x21f9d4);
    } else {
      _0x5aa048.delete(_0x21f9d4);
    }
  }
  _0x5d3d20.generatingClipIds = [..._0x5aa048];
  _0x5d3d20.generatingClipId = _0x5d3d20.generatingClipIds[0] || "";
  return [..._0x5d3d20.generatingClipIds];
}
function getGenerationState(_0x550a8a = {}, _0x238b64 = null) {
  const _0x1f3a45 = normalizeText(_0x238b64?.id);
  const _0x7fe41a = _0x550a8a?.clipBatchGenerationByEpisode;
  const _0x55166c = Boolean(_0x1f3a45 && _0x7fe41a && typeof _0x7fe41a === "object" && !Array.isArray(_0x7fe41a) && Object.hasOwn(_0x7fe41a, _0x1f3a45));
  const _0x8265c1 = _0x55166c ? _0x7fe41a[_0x1f3a45] : null;
  const _0x483979 = getGeneratingClipIds(_0x550a8a, _0x238b64);
  return {
    generatingClipIds: _0x483979,
    isBatchGenerating: _0x55166c,
    batchLabel: normalizeText(_0x8265c1?.label),
    batchCancelRequested: _0x8265c1?.cancelRequested === true,
    busy: _0x55166c || _0x483979.length > 0
  };
}
function setEpisodeBatchRunning(_0x44700c, _0x2b7909, _0xa6c4d3 = true, _0xba8d3 = "", _0x41507d = {}) {
  if (!_0x44700c || typeof _0x44700c !== "object") {
    return null;
  }
  const _0x43f07d = normalizeText(_0x2b7909);
  if (!_0x43f07d) {
    return null;
  }
  const _0x23ae16 = _0x44700c.clipBatchGenerationByEpisode;
  const _0x35c0bc = {
    ...(_0x23ae16 && typeof _0x23ae16 === "object" && !Array.isArray(_0x23ae16) ? _0x23ae16 : {})
  };
  if (_0xa6c4d3) {
    _0x35c0bc[_0x43f07d] = {
      ...(_0x35c0bc[_0x43f07d] || {}),
      ...(_0x41507d && typeof _0x41507d === "object" ? _0x41507d : {}),
      label: normalizeText(_0xba8d3)
    };
  } else {
    delete _0x35c0bc[_0x43f07d];
  }
  _0x44700c.clipBatchGenerationByEpisode = _0x35c0bc;
  return _0x35c0bc[_0x43f07d] || null;
}
function getClipInputSurface(_0x4e71a2, _0x55849a, _0x383642) {
  if (!_0x383642) {
    return "";
  }
  const _0x5de9fb = resolveModelExecution(_0x4e71a2.models.video, {
    providerHint: _0x4e71a2.videoProvider
  });
  const _0xc17374 = buildStoryClipInputSlotViewModel({
    modelId: _0x4e71a2.models.video,
    provider: _0x4e71a2.videoProvider,
    inputs: _0x383642.inputs
  });
  const _0x2874b5 = {
    model: _0x4e71a2.models.video,
    provider: _0x4e71a2.videoProvider,
    generationParams: _0x4e71a2.videoGenerationParams
  };
  const _0x55be9c = getFixedInputSlotConfigFromManifest(_0x2874b5, {
    manifest: _0x5de9fb?.modelManifest || null
  });
  const _0x5d5833 = shouldHideFixedInputSlots(_0x55be9c) ? null : _0x55be9c;
  const _0x108d5a = _0xc17374.slots.filter(_0x2abe6b => _0x2abe6b.input?.url);
  const _0x3be158 = Object.fromEntries(_0x108d5a.map(_0x5c2321 => [_0x5c2321.id, {
    ..._0x5c2321.input,
    kind: _0x5c2321.kind
  }]));
  const _0x1e549d = new Set(_0x108d5a.map(_0x14b90a => normalizeText(_0x14b90a.kind) + ":" + normalizeText(_0x14b90a.input?.url)).filter(Boolean));
  const _0x321abc = resolveStoryVideoReplicationClipVoiceAssetIds(_0x4e71a2?.data, _0x383642);
  const _0x1ab609 = resolveStoryClipPromptAssetRefs(_0x383642?.prompt || "", {
    assets: Array.isArray(_0x4e71a2?.data?.assets) ? _0x4e71a2.data.assets : [],
    episode: _0x55849a,
    clipFrames: Array.isArray(_0x4e71a2?.data?.clipFrames) ? _0x4e71a2.data.clipFrames : [],
    resolveExternalAssetRef: resolveAssetMentionRef,
    voiceAssetIds: _0x321abc
  }).map((_0x31a9e1, _0x33d9d9) => ({
    ..._0x31a9e1,
    type: normalizeText(_0x31a9e1?.type || _0x31a9e1?.kind),
    kind: normalizeText(_0x31a9e1?.type || _0x31a9e1?.kind),
    url: normalizeText(_0x31a9e1?.url),
    thumbUrl: normalizeText(_0x31a9e1?.thumbUrl || _0x31a9e1?.url),
    name: normalizeText(_0x31a9e1?.name || _0x31a9e1?.label) || "素材 " + (_0x33d9d9 + 1),
    refSlot: normalizeText(_0x31a9e1?.refSlot || _0x31a9e1?.slotId)
  })).filter(_0xc01b4f => _0xc01b4f.kind && _0xc01b4f.url && !_0x1e549d.has(_0xc01b4f.kind + ":" + _0xc01b4f.url));
  let _0x762b56 = _0x1ab609.filter(_0xf5f121 => _0xf5f121.kind === "image");
  const _0x4d87e8 = [];
  if (_0x5de9fb?.modelManifest?.extensions?.rhAiApp && _0x5d5833) {
    const _0x1f6097 = buildFixedInputAssetSlotMapFromRefs(_0x1ab609, {
      slotOrderByType: _0x5d5833.slotOrderByType,
      visibleSlots: _0x5d5833.visibleSlots,
      occupiedSlots: _0x108d5a.map(_0x3d7b73 => _0x3d7b73.id),
      exclusiveGroups: _0x5d5833.exclusiveGroups,
      slotById: _0x5d5833.slotById
    });
    const _0x556506 = new Set();
    Object.entries(_0x1f6097).forEach(([_0x36fd3c, _0x5c345e]) => {
      if (!_0x5c345e?.url) {
        return;
      }
      const _0x2939cf = normalizeText(_0x5c345e.type || _0x5c345e.kind);
      _0x3be158[_0x36fd3c] = {
        ..._0x5c345e,
        kind: _0x2939cf,
        slotId: _0x36fd3c
      };
      _0x4d87e8.push(_0x36fd3c);
      _0x556506.add(_0x2939cf + ":" + normalizeText(_0x5c345e.url));
    });
    _0x762b56 = _0x762b56.filter(_0x4d0e05 => !_0x556506.has(_0x4d0e05.kind + ":" + _0x4d0e05.url));
  }
  return {
    fixedInputConfig: _0x5d5833,
    inputsBySlot: _0x3be158,
    inputs: _0x108d5a.map(_0x49b4ef => ({
      ..._0x49b4ef.input,
      kind: _0x49b4ef.kind,
      slotId: _0x49b4ef.id
    })),
    readOnlyInputs: _0x762b56,
    readOnlyFixedInputSlots: _0x4d87e8
  };
}
function getInputReferenceCounts(_0x24c62b) {
  const _0xb7cfeb = _0x24c62b?.inputs && typeof _0x24c62b.inputs === "object" ? _0x24c62b.inputs : {};
  const _0x19502a = _0x38ce9e => (Array.isArray(_0xb7cfeb[_0x38ce9e]) ? _0xb7cfeb[_0x38ce9e] : []).filter(_0x510ddb => normalizeText(_0x510ddb?.url)).length;
  return {
    imageCount: _0x19502a("image"),
    videoCount: _0x19502a("video"),
    audioCount: _0x19502a("audio")
  };
}
function getUsedReferenceCounts(_0x318130, {
  assets = [],
  episode = null,
  clipFrames = [],
  voiceAssetIds = null
} = {}) {
  const _0x21113e = {
    imageCount: 0,
    audioCount: 0,
    videoCount: 0
  };
  const _0x59f5ce = new Set();
  const _0x4cbe78 = (_0x20e57c, _0x43ddc3 = "") => {
    const _0xb7180 = normalizeText(_0x20e57c?.type || _0x20e57c?.kind || _0x43ddc3);
    const _0x246f6c = normalizeText(_0x20e57c?.url);
    if (!Object.hasOwn(_0x21113e, _0xb7180 + "Count") || !_0x246f6c) {
      return;
    }
    const _0xb40d1 = _0xb7180 + ":" + _0x246f6c;
    if (_0x59f5ce.has(_0xb40d1)) {
      return;
    }
    _0x59f5ce.add(_0xb40d1);
    _0x21113e[_0xb7180 + "Count"] += 1;
  };
  const _0x2f1290 = _0x318130?.inputs && typeof _0x318130.inputs === "object" ? _0x318130.inputs : {};
  ["image", "audio", "video"].forEach(_0x1b8de6 => {
    (Array.isArray(_0x2f1290[_0x1b8de6]) ? _0x2f1290[_0x1b8de6] : []).forEach(_0x26228f => _0x4cbe78(_0x26228f, _0x1b8de6));
  });
  resolveStoryClipPromptAssetRefs(_0x318130?.prompt || "", {
    assets: assets,
    episode: episode,
    clipFrames: clipFrames,
    resolveExternalAssetRef: resolveAssetMentionRef,
    voiceAssetIds: voiceAssetIds
  }).forEach(_0xf02f09 => _0x4cbe78(_0xf02f09));
  return _0x21113e;
}
function renderReferenceSummary(_0x56fa57, {
  assets = [],
  episode = null,
  clipFrames = [],
  voiceAssetIds = null
} = {}) {
  const _0x2d47f9 = getUsedReferenceCounts(_0x56fa57, {
    assets: assets,
    episode: episode,
    clipFrames: clipFrames,
    voiceAssetIds: voiceAssetIds
  });
  const _0x28d51e = "使用参考，图片 " + _0x2d47f9.imageCount + "，音频 " + _0x2d47f9.audioCount + "，视频 " + _0x2d47f9.videoCount;
  return "<div class=\"story-clip-reference-summary\" data-story-clip-reference-summary role=\"status\" aria-live=\"polite\" aria-label=\"" + _0x28d51e + "\">\n    <span class=\"story-clip-reference-summary-label\">使用参考</span>\n    <span>图片：<strong data-story-reference-count=\"image\">" + _0x2d47f9.imageCount + "</strong></span>\n    <span>音频：<strong data-story-reference-count=\"audio\">" + _0x2d47f9.audioCount + "</strong></span>\n    <span>视频：<strong data-story-reference-count=\"video\">" + _0x2d47f9.videoCount + "</strong></span>\n  </div>";
}
function renderSelectionControls(_0x42813f, _0x2fd292, _0x16dec1 = null) {
  const _0x3b0b88 = Array.isArray(_0x2fd292?.clips) ? _0x2fd292.clips : [];
  const _0x4afc5b = Array.isArray(_0x42813f?.selectedClipGenerationIds) ? _0x42813f.selectedClipGenerationIds : [];
  const _0x5a88ed = selectBatchTargets(_0x3b0b88, _0x4afc5b);
  const _0x1ad08e = _0x5a88ed.length;
  const _0x2a4a3f = getGenerationState(_0x42813f, _0x2fd292);
  const {
    generatingClipIds: _0xd1709
  } = _0x2a4a3f;
  const _0x6b3f6e = _0x16dec1 || getSelectedClip(_0x42813f, _0x2fd292);
  const _0x1c65ba = _0x42813f?.clipSelectionMode ? _0x5a88ed[0] : _0x6b3f6e;
  const _0x4bbbc3 = _0x42813f?.clipSelectionMode && _0x1ad08e > 1;
  const _0xfe8b7d = !_0x42813f?.clipSelectionMode || _0x1ad08e === 1;
  const _0x58a67f = _0xfe8b7d && Boolean(_0x1c65ba && (_0xd1709.includes(normalizeText(_0x1c65ba.id)) || getRecoverableStoryClipVideoTask(_0x1c65ba)));
  const _0x119d25 = _0x2a4a3f.isBatchGenerating;
  const _0x549ac2 = _0x42813f?.clipSelectionMode ? _0x1ad08e === 0 || _0x2a4a3f.isBatchGenerating || (_0x4bbbc3 ? _0xd1709.length > 0 : _0x58a67f) : !_0x6b3f6e || _0x2a4a3f.isBatchGenerating || _0x58a67f;
  const _0x51f763 = normalizeText(_0x1c65ba?.generation?.status).toLowerCase() === "queued";
  const _0x4a83f4 = "批量生成视频" + (_0x1ad08e ? " (" + _0x1ad08e + ")" : "");
  const _0x10080d = _0x2a4a3f.isBatchGenerating ? _0x4a83f4 : _0x58a67f ? _0x51f763 ? "排队中" : "生成中" : _0x42813f?.clipSelectionMode && _0x1ad08e > 1 ? _0x4a83f4 : "生成本片段";
  const _0x2f9edb = Boolean(_0x2a4a3f.isBatchGenerating || _0x58a67f);
  const _0x2df31e = "<button type=\"button\" class=\"story-workbench-action-button story-main-action-button\" data-story-action=\"generate-clip-video\" aria-busy=\"" + _0x2f9edb + "\" " + (_0x549ac2 ? "disabled" : "") + ">" + (_0x2f9edb ? renderStoryGenerationSpinner({
    button: true
  }) : "") + _0x10080d + "</button>";
  const _0x9c62d3 = _0x2a4a3f.isBatchGenerating ? "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-clip-batch-generation\" " + (_0x2a4a3f.batchCancelRequested ? "disabled" : "") + ">" + (_0x2a4a3f.batchCancelRequested ? "正在停止" : "停止批量生成") + "</button>" : "";
  const _0xad63be = _0x42813f?.clipSelectionMode ? "<div class=\"story-clip-selection-actions\">\n        <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"select-all-clips\" " + (_0x119d25 || !_0x3b0b88.length || _0x1ad08e === _0x3b0b88.length ? "disabled" : "") + ">全选</button>\n        <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-clip-selection\">" + (_0x119d25 ? "退出多选" : "取消") + "</button>\n        " + _0x9c62d3 + "\n        " + _0x2df31e + "\n      </div>" : "<div class=\"story-clip-selection-actions\">\n        <button type=\"button\" class=\"story-secondary-button story-clip-selection-trigger\" data-story-action=\"toggle-clip-selection\" " + (_0x119d25 || !_0x3b0b88.length ? "disabled" : "") + ">多选</button>\n        " + _0x9c62d3 + "\n        " + _0x2df31e + "\n      </div>";
  return "<div class=\"story-clip-selection-controls\">" + _0xad63be + "</div>";
}
function renderAdjustmentBar(_0x4118d5, _0x25c6a5, _0x53450b = null) {
  if (_0x4118d5?.clipAdjustmentOpen !== true) {
    return "";
  }
  const _0x164004 = isStoryClipAdjustmentGenerating(_0x4118d5, _0x53450b, _0x25c6a5);
  const _0xe21dc8 = normalizeStoryPromptMode(_0x25c6a5?.promptMode || _0x53450b?.promptMode || _0x4118d5?.data?.project?.planning?.promptMode, {
    allowDeveloperModes: true
  });
  const _0x2a47a5 = normalizeStoryPromptMode(_0x4118d5?.clipAdjustmentPromptMode || _0xe21dc8, {
    allowDeveloperModes: true
  });
  const _0x4f10e5 = normalizeText(_0x4118d5?.clipAdjustmentInstruction);
  const _0x4440c7 = Boolean(_0x4f10e5 || _0x2a47a5 !== _0xe21dc8);
  return "<div class=\"story-clip-adjustment-bar\" data-story-clip-adjustment-bar>\n    <div class=\"story-clip-adjustment-mode\" data-story-clip-adjustment-mode>\n      <button type=\"button\" class=\"story-clip-adjustment-mode-trigger\" data-story-action=\"toggle-clip-adjustment-mode\" aria-haspopup=\"listbox\" aria-expanded=\"" + (_0x4118d5?.clipAdjustmentPromptModeOpen === true) + "\" " + (_0x164004 ? "disabled" : "") + ">\n        <strong data-story-clip-adjustment-mode-label>" + escapeHtml(getStoryPromptModeLabel(_0x2a47a5)) + "</strong>\n        <span aria-hidden=\"true\">⌄</span>\n      </button>\n      <div class=\"story-clip-adjustment-mode-menu\" role=\"listbox\" aria-label=\"提示词模式\" " + (_0x4118d5?.clipAdjustmentPromptModeOpen === true ? "" : "hidden") + ">\n        " + STORY_PROMPT_MODE_OPTIONS.map(_0x39f935 => "<button type=\"button\" class=\"" + (_0x39f935.value === _0x2a47a5 ? "is-selected" : "") + "\" data-story-action=\"select-clip-adjustment-mode\" data-story-clip-adjustment-mode-option=\"" + escapeHtml(_0x39f935.value) + "\" role=\"option\" aria-selected=\"" + (_0x39f935.value === _0x2a47a5) + "\">" + escapeHtml(_0x39f935.label) + "</button>").join("") + "\n      </div>\n    </div>\n    <div class=\"story-clip-adjustment-compose\">\n      <input type=\"text\" data-story-clip-adjustment-instruction maxlength=\"600\" value=\"" + escapeHtml(_0x4118d5?.clipAdjustmentInstruction || "") + "\" placeholder=\"可选：补充这一段还要怎么调整\" aria-label=\"AI 调整说明\" " + (_0x164004 ? "disabled" : "") + ">\n      <button type=\"button\" class=\"story-workbench-action-button\" data-story-action=\"generate-clip-adjustment\" " + (_0x164004 || !_0x4440c7 ? "disabled" : "") + " aria-busy=\"" + _0x164004 + "\">" + (_0x164004 ? renderStoryGenerationSpinner({
    button: true
  }) : "") + (_0x164004 ? "生成中" : "生成") + "</button>\n    </div>\n  </div>";
}
function shouldCloseAdjustmentOnOutsideClick(_0x36f28e, _0x3685f0) {
  return _0x36f28e?.clipAdjustmentOpen === true && !_0x3685f0?.closest?.(".story-clip-adjustment-control");
}
function shouldClosePromptHistoryOnOutsideClick(_0x18c061, _0x5496ff) {
  return _0x18c061?.clipPromptHistoryOpen === true && !_0x5496ff?.closest?.("[data-story-clip-prompt-history]");
}
function renderPromptHistoryControl(_0x563076, _0x555768) {
  const _0x11b64e = normalizeStoryClipPromptHistory(_0x555768?.promptHistory);
  if (!_0x11b64e.length) {
    return "";
  }
  const _0x454672 = _0x563076?.clipPromptHistoryOpen === true;
  return "<div class=\"story-clip-prompt-history\" data-story-clip-prompt-history>\n    <button type=\"button\" class=\"story-clip-prompt-history-trigger\" data-story-action=\"toggle-clip-prompt-history\" aria-label=\"提示词历史\" aria-haspopup=\"dialog\" aria-expanded=\"" + _0x454672 + "\">\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M3.8 12a8.2 8.2 0 1 0 2.4-5.8L4 8.4M4 4.8v3.6h3.6M12 7.8v4.7l3.1 1.8\"/></svg>\n    </button>\n    <section class=\"story-clip-prompt-history-panel\" data-story-clip-prompt-history-panel role=\"dialog\" aria-label=\"提示词历史\" " + (_0x454672 ? "" : "hidden") + ">\n      <header><strong>提示词历史</strong><span>最近 " + _0x11b64e.length + " 个已确认版本</span></header>\n      <div class=\"story-clip-prompt-history-list\">\n        " + _0x11b64e.map(_0x2c1850 => {
    const _0x45185d = _0x2c1850.durationSec > 0 ? _0x2c1850.durationSec.toFixed(1) + "s" : "时长未记录";
    const _0x157eab = getPromptHistoryPreview(_0x2c1850.promptHtml) || "空提示词";
    return "<button type=\"button\" class=\"story-clip-prompt-history-item\" data-story-action=\"restore-clip-prompt-history\" data-story-clip-prompt-history-id=\"" + escapeHtml(_0x2c1850.id) + "\" aria-label=\"恢复 " + escapeHtml(getStoryPromptModeLabel(_0x2c1850.promptMode)) + " 历史提示词\">\n            <span class=\"story-clip-prompt-history-item-meta\"><strong>" + escapeHtml(getStoryPromptModeLabel(_0x2c1850.promptMode)) + " · " + _0x45185d + "</strong><small>" + escapeHtml(formatPromptHistorySavedAt(_0x2c1850.savedAt)) + "</small></span>\n            <span class=\"story-clip-prompt-history-item-preview\">" + escapeHtml(_0x157eab) + "</span>\n            <span class=\"story-clip-prompt-history-item-action\">恢复</span>\n          </button>";
  }).join("") + "\n      </div>\n    </section>\n  </div>";
}
function renderAdjustmentControl(_0x5d49d6, _0x3f9530, _0x18ed55 = null) {
  if (_0x3f9530?.promptAdjustment?.candidate) {
    return "";
  }
  const _0x2187ba = isStoryClipAdjustmentGenerating(_0x5d49d6, _0x18ed55, _0x3f9530);
  const _0x19e2be = "<div class=\"story-clip-adjustment-header\">\n    " + renderPromptHistoryControl(_0x5d49d6, _0x3f9530) + "\n    <button type=\"button\" class=\"story-clip-adjustment-trigger\" data-story-action=\"toggle-clip-adjustment\" aria-expanded=\"" + (_0x5d49d6?.clipAdjustmentOpen === true) + "\" " + (_0x2187ba ? "disabled" : "") + "><span aria-hidden=\"true\">✦</span>AI 调整</button>\n  </div>";
  return "<div class=\"story-clip-adjustment-control\">\n    " + _0x19e2be + "\n    " + renderAdjustmentBar(_0x5d49d6, _0x3f9530, _0x18ed55) + "\n  </div>";
}
function renderPromptComparison(_0x1d3e6c) {
  const _0xa111ca = _0x1d3e6c?.promptAdjustment?.candidate;
  if (!_0xa111ca) {
    return "";
  }
  const _0x17ef7a = normalizeDurationSeconds(_0xa111ca.sourceDurationSeconds || _0x1d3e6c?.durationSec || _0x1d3e6c?.duration);
  const _0x13ddba = normalizeDurationSeconds(_0xa111ca.candidateDurationSeconds || _0x17ef7a);
  const _0x2f65cb = normalizeStoryPromptMode(_0xa111ca.sourcePromptMode || _0x1d3e6c?.promptMode, {
    allowDeveloperModes: true
  });
  const _0x226009 = normalizeStoryPromptMode(_0xa111ca.targetPromptMode || _0x2f65cb, {
    allowDeveloperModes: true
  });
  const _0x48a914 = _0x124176 => _0x124176 > 0 ? _0x124176.toFixed(1) + "s" : "--";
  return "<div class=\"story-clip-prompt-comparison\" data-story-clip-prompt-comparison>\n    <header>\n      <span>AI 调整完成</span>\n      <strong>选择这个片段要使用的提示词版本</strong>\n    </header>\n    <div class=\"story-clip-prompt-comparison-grid\">\n      <article>\n        <div class=\"story-clip-prompt-version-title\"><strong>原版本 · " + escapeHtml(getStoryPromptModeLabel(_0x2f65cb)) + "</strong><span>总时长 " + _0x48a914(_0x17ef7a) + "</span></div>\n        <div class=\"story-clip-prompt-version-content\">" + sanitizePromptHtmlForCommit(_0xa111ca.sourcePromptHtml) + "</div>\n        <button type=\"button\" data-story-action=\"keep-current-clip-prompt\">保留原版本</button>\n      </article>\n      <article class=\"is-ai-version\">\n        <div class=\"story-clip-prompt-version-title\"><strong>AI 调整后 · " + escapeHtml(getStoryPromptModeLabel(_0x226009)) + "</strong><span>总时长 " + _0x48a914(_0x13ddba) + "</span></div>\n        <div class=\"story-clip-prompt-version-content\">" + sanitizePromptHtmlForCommit(_0xa111ca.promptHtml) + "</div>\n        <div class=\"story-clip-prompt-version-actions\">\n          <button type=\"button\" class=\"story-regenerate-button\" data-story-action=\"regenerate-clip-adjustment\">重新生成</button>\n          <button type=\"button\" class=\"story-workbench-action-button\" data-story-action=\"use-ai-clip-prompt\">使用 AI 版本</button>\n        </div>\n      </article>\n    </div>\n  </div>";
}
function renderPromptSurface(_0xd39db5, _0x472331, _0xd9c4da) {
  try {
    const _0x10be65 = getClipInputSurface(_0xd39db5, _0x472331, _0xd9c4da);
    const _0x3ae515 = resolveStoryClipVideoGenerationParams(_0xd9c4da, _0xd39db5.models.video, _0xd39db5.videoGenerationParams);
    const _0x445b64 = {
      ...(_0xd39db5.videoGenerationParamsByModel || {}),
      [_0xd39db5.models.video]: {
        ..._0x3ae515
      }
    };
    const _0x55efe4 = normalizeStoryPromptMode(_0xd9c4da?.promptMode || _0x472331?.promptMode || _0xd39db5?.data?.project?.planning?.promptMode, {
      allowDeveloperModes: true
    });
    const _0x91929d = isStoryMinimaxH3PromptMode(_0x55efe4) ? normalizeStoryMinimaxH3OfficialTags(_0xd9c4da?.prompt || "") : _0xd9c4da?.prompt || "";
    const _0x213e6a = renderStoryClipPromptMentions(_0x91929d, {
      assets: Array.isArray(_0xd39db5?.data?.assets) ? _0xd39db5.data.assets : [],
      episode: _0x472331,
      clipFrames: Array.isArray(_0xd39db5?.data?.clipFrames) ? _0xd39db5.data.clipFrames : []
    });
    const _0x4413b0 = isStoryClipAdjustmentGenerating(_0xd39db5, _0x472331, _0xd9c4da);
    const _0x24db8f = Boolean(_0xd9c4da?.promptAdjustment?.candidate);
    return "<div class=\"story-video-node-prompt text-prompt-panel\" data-story-clip-prompt-surface>\n      <div class=\"story-clip-prompt-toolbar\">\n        " + renderVideoReferenceBarMarkup({
      ..._0x10be65,
      attachmentButtonHtml: ""
    }) + "\n        " + renderAdjustmentControl(_0xd39db5, _0xd9c4da, _0x472331) + "\n      </div>\n      " + (_0x4413b0 ? "<div class=\"story-clip-prompt-adjustment-loading\" role=\"status\" aria-live=\"polite\" aria-busy=\"true\">\n            " + renderGenerationSpinner() + "\n            <strong>正在调整当前片段提示词</strong>\n            <span>其他片段不受影响</span>\n          </div>" : _0x24db8f ? renderPromptComparison(_0xd9c4da) : renderVideoPromptEditorMarkup({
      promptHtml: _0x213e6a,
      placeholder: t("aigenVideoNode.prompt.placeholder"),
      attributes: "data-story-clip-prompt"
    })) + "\n      <div class=\"story-clip-model-bar prompt-panel-footer\">\n        " + renderAIGenVideoModelSelectorMarkup({
      modelId: _0xd39db5.models.video,
      provider: _0xd39db5.videoProvider,
      generationParams: _0x3ae515,
      generationParamsByModel: _0x445b64,
      providerProfileId: _0xd39db5.videoProviderProfileId,
      providerProfileIdByModel: _0xd39db5.videoProviderProfileIdByModel,
      referenceCounts: getInputReferenceCounts(_0xd9c4da),
      showSchemaControls: true,
      className: "story-clip-video-model-selector",
      runningHubWorkflowAllowedModelIds: STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_IDS
    }) + "\n        <span class=\"story-clip-provider-profile-control\" data-story-video-provider-profile></span>\n        <div class=\"story-clip-generation-actions\">\n          " + renderSelectionControls(_0xd39db5, _0x472331, _0xd9c4da) + "\n        </div>\n      </div>\n    </div>";
  } catch (_0x2b72ff) {
    return "<div class=\"story-inline-error\">" + escapeHtml(_0x2b72ff?.message || "当前模型输入槽不可用") + "</div>";
  }
}
function renderVideoResultSwitchButton(_0x8458e, _0x25617b) {
  const _0x51d829 = _0x8458e === "previous";
  const _0x409fda = _0x51d829 ? "previous-video-result" : "next-video-result";
  const _0x14f888 = _0x51d829 ? "切换到上一个历史视频" : "切换到下一个历史视频";
  const _0xcbd450 = _0x51d829 ? "story-video-result-switch--previous" : "story-video-result-switch--next";
  const _0x2595b1 = _0x51d829 ? "m6.5 14.5 5.5-5.5 5.5 5.5" : "m6.5 9.5 5.5 5.5 5.5-5.5";
  return "<button type=\"button\" class=\"story-appearance-arrow story-video-result-switch " + _0xcbd450 + "\" data-story-action=\"" + _0x409fda + "\" data-story-clip-id=\"" + escapeHtml(_0x25617b?.id) + "\" aria-label=\"" + _0x14f888 + "\"><svg class=\"story-appearance-arrow-icon\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"" + _0x2595b1 + "\"/></svg></button>";
}
function renderVideoPlaybackControls(_0x24891c, _0xe510ef) {
  const _0x49c38b = escapeHtml(_0x24891c?.id);
  return renderWorkspaceVideoPlaybackControls({
    label: "视频",
    playLabel: "播放视频",
    playTitle: "播放视频",
    controlsAttributes: {
      "data-story-video-controls": true
    },
    playAttributes: {
      "data-story-video-play": true
    },
    currentTimeAttributes: {
      "data-story-video-time-current": true
    },
    progressAttributes: {
      "data-story-video-progress": true
    },
    progressFillAttributes: {
      "data-story-video-progress-fill": true
    },
    totalTimeAttributes: {
      "data-story-video-time-total": true
    },
    volumeAttributes: {
      "data-story-video-volume": true
    },
    slots: {
      beforeVolume: "<button type=\"button\" class=\"video-snap-btn story-video-snap-btn\" data-story-action=\"capture-video-frame\" data-story-clip-id=\"" + _0x49c38b + "\" data-story-video-result-index=\"" + _0xe510ef + "\" aria-label=\"获取当前帧\" title=\"获取当前帧\">\n        " + renderStoryKeyframeIcon() + "\n      </button>\n      <button type=\"button\" class=\"video-snap-btn story-video-snap-btn story-video-clip-btn\" data-story-action=\"trim-video\" data-story-clip-id=\"" + _0x49c38b + "\" data-story-video-result-index=\"" + _0xe510ef + "\" aria-label=\"裁剪视频\" title=\"裁剪视频\">\n        " + VIDEO_CLIP_ICON_SVG + "\n      </button>"
    }
  });
}
function renderVideoPreview(_0x56520b, {
  isGenerating = false
} = {}) {
  const _0x1fd33f = getVideoResults(_0x56520b);
  const _0x5724cf = getActiveVideoResultIndex(_0x56520b, _0x1fd33f);
  const _0x1724f5 = _0x1fd33f[_0x5724cf] || {};
  const _0x85174d = resolveVideoResultUrl(_0x1724f5);
  const _0x2819f8 = normalizeText(_0x56520b?.generation?.status).toLowerCase();
  const _0x237556 = isGenerating || ["pending", "queued", "recovering", "running", "submitting"].includes(_0x2819f8);
  if (_0x237556) {
    return "<div class=\"story-video-empty story-video-loading\" role=\"status\" aria-live=\"polite\" aria-busy=\"true\">\n      " + renderGenerationSpinner() + "\n      <strong>视频生成中</strong>\n      <p>正在等待生成结果，完成后会自动显示。</p>\n    </div>";
  }
  if (_0x85174d) {
    const _0x923d8a = _0x1fd33f.length > 1;
    return "<div class=\"story-video-result\" data-story-video-result-index=\"" + _0x5724cf + "\">\n      <div class=\"story-video-stage\">\n        " + (_0x923d8a ? renderVideoResultSwitchButton("previous", _0x56520b) : "") + "\n        <video data-story-video-player data-story-video-url=\"" + escapeHtml(_0x85174d) + "\" playsinline preload=\"auto\"></video>\n        " + (_0x923d8a ? renderVideoResultSwitchButton("next", _0x56520b) : "") + "\n        " + renderVideoPlaybackControls(_0x56520b, _0x5724cf) + "\n      </div>\n      <div class=\"story-video-result-meta\"><strong>视频结果</strong><span>" + (_0x5724cf + 1) + "/" + _0x1fd33f.length + "</span></div>\n    </div>";
  }
  const _0x3fc9ec = _0x56520b?.generation?.error || "";
  const _0x3ca2ba = _0x3fc9ec ? "story-video-empty story-video-error" : "story-video-empty";
  return "<div class=\"" + _0x3ca2ba + "\">\n    <strong>视频结果</strong>\n    <p>" + escapeHtml(_0x3fc9ec || "生成完成后将在这里预览本片段视频。") + "</p>\n  </div>";
}
function renderTimeline(_0x97de61, _0xa86815, {
  selectionMode = false,
  selectedClipIds = [],
  pendingDeleteClipId = "",
  generatingClipIds = [],
  modelId = "",
  generationParams = {}
} = {}) {
  const _0x502a29 = Array.isArray(_0x97de61?.clips) ? _0x97de61.clips : [];
  const _0x30d29c = new Set((Array.isArray(selectedClipIds) ? selectedClipIds : []).map(_0x4cbd9b => normalizeText(_0x4cbd9b)));
  const _0x3b7624 = new Set((Array.isArray(generatingClipIds) ? generatingClipIds : []).map(_0x44170b => normalizeText(_0x44170b)).filter(Boolean));
  return "<div class=\"story-clip-timeline " + (selectionMode ? "is-selection-mode" : "") + "\">\n    <div class=\"story-clip-timeline-header\">\n      <span>" + escapeHtml(_0x97de61?.duration || "--:--") + "</span>\n      <small>" + (selectionMode ? "点击片段选择需要生成的视频" : "点击片段切换提示词和视频结果") + "</small>\n    </div>\n    <div class=\"story-clip-strip\" data-story-marquee-surface=\"clips\">\n      " + _0x502a29.map((_0x40cd6c, _0x2f1e28) => {
    const _0x14651f = normalizeText(_0x40cd6c.id);
    const _0x3d2349 = getVideoResults(_0x40cd6c);
    const _0x3f638c = renderTimelineVideoThumbnail(_0x40cd6c);
    const _0x2f8993 = normalizeText(_0x40cd6c?.generation?.status).toLowerCase();
    const _0x3bf89f = _0x3b7624.has(_0x14651f) || ["pending", "queued", "recovering", "running", "submitting"].includes(_0x2f8993);
    const _0x1c05a3 = _0x30d29c.has(_0x14651f);
    const _0x24ab1a = !_0x3bf89f && normalizeText(pendingDeleteClipId) === _0x14651f;
    const _0x169da6 = "<div class=\"story-clip-card-shell" + (_0x3bf89f ? " is-generating" : "") + (_0x24ab1a ? " is-delete-confirming" : "") + "\" data-story-video-history=\"" + (_0x3d2349.length > 1) + "\" data-story-clip-id=\"" + escapeHtml(_0x40cd6c.id) + "\">\n          <button type=\"button\" class=\"story-clip-card " + (_0x40cd6c.id === _0xa86815 ? "is-selected" : "") + " " + (selectionMode ? "is-selection-mode" : "") + " " + (_0x1c05a3 ? "is-checked" : "") + (_0x3f638c ? " has-video-thumbnail" : "") + "\" data-story-clip-id=\"" + escapeHtml(_0x40cd6c.id) + "\" data-story-marquee-item data-story-marquee-id=\"" + escapeHtml(_0x40cd6c.id) + "\" aria-pressed=\"" + (selectionMode ? String(_0x1c05a3) : "false") + "\" aria-busy=\"" + _0x3bf89f + "\">\n            " + (selectionMode && !_0x3bf89f ? "<span class=\"story-asset-select-indicator story-clip-select-indicator\" aria-hidden=\"true\">" + (_0x1c05a3 ? "✓" : "") + "</span>" : "") + "\n            " + (_0x3f638c ? "<span class=\"story-clip-card-media\" aria-hidden=\"true\">" + _0x3f638c + "</span>" : "") + "\n            <span class=\"story-clip-card-copy\"><span>" + _0x40cd6c.number + "</span><strong>" + escapeHtml(_0x40cd6c.title) + "</strong><small data-story-clip-duration=\"" + escapeHtml(_0x40cd6c.id) + "\">" + escapeHtml(formatStoryClipVideoGenerationDuration(_0x40cd6c, modelId, generationParams)) + "</small></span>\n          </button>\n          " + (_0x3bf89f ? "<span class=\"story-clip-card-loading\" role=\"status\" aria-label=\"片段 " + escapeHtml(_0x40cd6c.number) + " 视频生成中\">" + renderGenerationSpinner() + "</span>" : selectionMode ? "" : renderWorkspaceCardDeleteControl({
      className: "story-clip-delete-trigger",
      ariaLabel: "删除片段 " + _0x40cd6c.number + "：" + (_0x40cd6c.title || "未命名片段"),
      actionAttributes: {
        "data-story-action": "request-delete-clip",
        "data-story-clip-delete-id": _0x40cd6c.id,
        hidden: _0x24ab1a
      }
    }) + "\n          <div class=\"story-project-delete-confirm story-clip-delete-confirm\" " + (_0x24ab1a ? "" : "hidden") + " aria-label=\"确认删除片段 " + escapeHtml(_0x40cd6c.number) + "\">\n            <button type=\"button\" class=\"confirm-btn confirm-cancel\" data-story-action=\"cancel-delete-clip\" data-story-clip-delete-id=\"" + escapeHtml(_0x40cd6c.id) + "\">取消</button>\n            <button type=\"button\" class=\"confirm-btn confirm-ok\" data-story-action=\"confirm-delete-clip\" data-story-clip-delete-id=\"" + escapeHtml(_0x40cd6c.id) + "\">删除</button>\n          </div>") + "\n        </div>";
    if (_0x2f1e28 >= _0x502a29.length - 1) {
      return _0x169da6;
    }
    const _0x30d989 = _0x502a29[_0x2f1e28 + 1];
    return _0x169da6 + "<button type=\"button\" class=\"story-clip-insert-button\" data-story-insert-after-clip-id=\"" + escapeHtml(_0x40cd6c.id) + "\" aria-label=\"在片段 " + escapeHtml(_0x40cd6c.number) + " 和片段 " + escapeHtml(_0x30d989?.number) + " 之间新增片段\"><span aria-hidden=\"true\">+</span></button>";
  }).join("") + "\n    </div>\n  </div>";
}
function renderEpisode(_0x6854bd = {}, _0x5bacd7 = null, _0x28ac24 = null) {
  const _0x33c4cf = _0x5bacd7 || getSelectedEpisode(_0x6854bd);
  const _0x589051 = _0x28ac24 || getSelectedClip(_0x6854bd, _0x33c4cf);
  const _0x4d9339 = Array.isArray(_0x6854bd?.data?.assets) ? _0x6854bd.data.assets : [];
  const _0x2a5ba9 = Array.isArray(_0x6854bd?.data?.clipFrames) ? _0x6854bd.data.clipFrames : [];
  const _0x37dde6 = resolveStoryVideoReplicationClipVoiceAssetIds(_0x6854bd?.data, _0x589051);
  return {
    get referenceCounts() {
      return getUsedReferenceCounts(_0x589051, {
        assets: _0x4d9339,
        episode: _0x33c4cf,
        clipFrames: _0x2a5ba9,
        voiceAssetIds: _0x37dde6
      });
    },
    get referenceSummary() {
      return renderReferenceSummary(_0x589051, {
        assets: _0x4d9339,
        episode: _0x33c4cf,
        clipFrames: _0x2a5ba9,
        voiceAssetIds: _0x37dde6
      });
    },
    get referenceBar() {
      return renderVideoReferenceBarMarkup({
        ...getClipInputSurface(_0x6854bd, _0x33c4cf, _0x589051),
        attachmentButtonHtml: ""
      });
    },
    get selectionControls() {
      return renderSelectionControls(_0x6854bd, _0x33c4cf, _0x589051);
    },
    get adjustmentBar() {
      return renderAdjustmentBar(_0x6854bd, _0x589051, _0x33c4cf);
    },
    get adjustmentControl() {
      return renderAdjustmentControl(_0x6854bd, _0x589051, _0x33c4cf);
    },
    get promptSurface() {
      return renderPromptSurface(_0x6854bd, _0x33c4cf, _0x589051);
    },
    get videoPreview() {
      const _0x357876 = getGenerationState(_0x6854bd, _0x33c4cf);
      return renderVideoPreview(_0x589051, {
        isGenerating: _0x357876.generatingClipIds.includes(normalizeText(_0x589051?.id))
      });
    },
    get videoResults() {
      return getVideoResults(_0x589051);
    },
    get activeVideoResultIndex() {
      return getActiveVideoResultIndex(_0x589051);
    },
    get videoHistoryMenu() {
      return renderVideoHistoryMenu(_0x589051);
    },
    getAdjacentVideoResultIndex(_0x13fb36) {
      return getAdjacentVideoResultIndex(_0x589051, _0x13fb36);
    },
    get timeline() {
      const _0x176c42 = getGenerationState(_0x6854bd, _0x33c4cf);
      return renderTimeline(_0x33c4cf, _0x589051?.id, {
        selectionMode: _0x6854bd?.clipSelectionMode,
        selectedClipIds: _0x6854bd?.selectedClipGenerationIds,
        pendingDeleteClipId: _0x6854bd?.pendingDeleteClipId,
        generatingClipIds: _0x176c42.generatingClipIds,
        modelId: _0x6854bd?.models?.video,
        generationParams: _0x6854bd?.videoGenerationParams
      });
    }
  };
}
function createRuntime({
  state: _0x1905be,
  projectAdapter = {},
  generationAdapter = {},
  projectionAdapter = {}
} = {}) {
  if (!_0x1905be || typeof _0x1905be !== "object") {
    throw new Error("[storyClipProduction] state is required");
  }
  if (typeof projectAdapter.createToken !== "function") {
    throw new Error("[storyClipProduction] projectAdapter.createToken is required");
  }
  if (typeof generationAdapter.createController !== "function") {
    throw new Error("[storyClipProduction] generationAdapter.createController is required");
  }
  const _0x345b3e = generationAdapter.controllers instanceof Map ? generationAdapter.controllers : new Map();
  const _0x3aa017 = new Map();
  const _0x382cc2 = _0x115676 => projectAdapter.isLive?.(_0x115676) !== false;
  const _0x57e450 = _0x423ee2 => projectAdapter.isCurrent?.(_0x423ee2) !== false;
  const _0x5292b7 = (_0x534a97, _0x581221, _0x1de42c) => [_0x534a97?.projectId, _0x581221?.id, _0x1de42c?.id].map(normalizeText).join(":");
  const _0x3c61e2 = (_0x4f86bd, _0x5ed304) => [_0x4f86bd?.projectId, _0x5ed304?.id].map(normalizeText).join(":");
  const _0x44c718 = () => {
    if (projectionAdapter.refreshGeneration?.() === true) {
      return true;
    }
    projectionAdapter.render?.();
    return false;
  };
  function _0x339323({
    episode: _0x677eaf,
    clip: _0x3b2400,
    projectToken: _0x742074
  }) {
    return {
      ok: false,
      cancelled: true,
      reason: "batch-cancelled",
      projectToken: _0x742074,
      episodeId: _0x677eaf?.id || "",
      clipId: _0x3b2400?.id || ""
    };
  }
  async function _0x3cdb5d({
    episode: _0x23826b,
    clip: _0x19ccb2,
    displayedClip: _0x36f412,
    projectToken: _0x4f9c18,
    batch = null,
    batchRun = null
  }) {
    if (batchRun?.cancelRequested) {
      return _0x339323({
        episode: _0x23826b,
        clip: _0x19ccb2,
        projectToken: _0x4f9c18
      });
    }
    const _0x23d960 = _0x5292b7(_0x4f9c18, _0x23826b, _0x19ccb2);
    if (!_0x23826b || !_0x19ccb2 || getGenerationState(_0x1905be, _0x23826b).generatingClipIds.includes(normalizeText(_0x19ccb2.id)) || getRecoverableStoryClipVideoTask(_0x19ccb2) || _0x345b3e.has(_0x23d960)) {
      return {
        ok: false,
        reason: "unavailable"
      };
    }
    let _0x1ebc5b = null;
    let _0x528ff5 = "";
    let _0x69e71e = "";
    try {
      const _0x20cc6c = generationAdapter.resolvePrompt?.({
        state: _0x1905be,
        episode: _0x23826b,
        clip: _0x19ccb2,
        displayedClip: _0x36f412,
        projectToken: _0x4f9c18
      }) || {};
      if (!normalizeText(_0x20cc6c.prompt)) {
        return {
          ok: false,
          reason: "empty-prompt"
        };
      }
      const _0x412b60 = generationAdapter.resolveSettings?.({
        state: _0x1905be,
        episode: _0x23826b,
        clip: _0x19ccb2,
        projectToken: _0x4f9c18
      }) || {};
      _0x528ff5 = normalizeText(_0x412b60.modelId);
      _0x69e71e = normalizeText(_0x412b60.provider);
      const _0x234ce9 = normalizeText(await generationAdapter.resolveInstallId?.({
        state: _0x1905be,
        episode: _0x23826b,
        clip: _0x19ccb2,
        projectToken: _0x4f9c18,
        modelId: _0x528ff5,
        provider: _0x69e71e
      }));
      if (batchRun?.cancelRequested) {
        return _0x339323({
          episode: _0x23826b,
          clip: _0x19ccb2,
          projectToken: _0x4f9c18
        });
      }
      _0x1ebc5b = generationAdapter.createController({
        state: _0x1905be,
        episode: _0x23826b,
        clip: _0x19ccb2,
        projectToken: _0x4f9c18,
        batch: batch
      });
      if (!_0x1ebc5b || typeof _0x1ebc5b.generate !== "function") {
        throw new Error("story clip generation controller is unavailable");
      }
      _0x345b3e.set(_0x23d960, _0x1ebc5b);
      batchRun?.controllers.add(_0x1ebc5b);
      if (batchRun?.cancelRequested) {
        return _0x339323({
          episode: _0x23826b,
          clip: _0x19ccb2,
          projectToken: _0x4f9c18
        });
      }
      projectAdapter.register?.(_0x4f9c18);
      if (_0x57e450(_0x4f9c18)) {
        setClipGenerationRunning(_0x1905be, _0x19ccb2.id, true);
        _0x44c718();
      }
      const _0x8d703f = await _0x1ebc5b.generate({
        projectId: _0x4f9c18.projectId,
        episodeId: _0x23826b.id,
        modelId: _0x528ff5,
        provider: _0x69e71e,
        providerProfileId: _0x412b60.providerProfileId,
        prompt: _0x20cc6c.prompt,
        generationParams: _0x412b60.generationParams,
        inputs: _0x19ccb2.inputs,
        assetInputRefs: _0x20cc6c.assetInputRefs,
        installId: _0x234ce9
      });
      if (!_0x382cc2(_0x4f9c18)) {
        return {
          ok: false,
          reason: "stale-project",
          modelId: _0x528ff5,
          provider: _0x69e71e
        };
      }
      const _0x1f64ad = normalizeText(_0x8d703f?.status).toLowerCase();
      if (batchRun?.cancelRequested && (_0x8d703f?.ok === false || ["cancelled", "canceled", "paused"].includes(_0x1f64ad))) {
        return _0x339323({
          episode: _0x23826b,
          clip: _0x19ccb2,
          projectToken: _0x4f9c18
        });
      }
      if (_0x8d703f?.ok === false || ["cancelled", "canceled", "error", "failed"].includes(_0x1f64ad)) {
        const _0xe8e4dd = _0x8d703f?.error;
        const _0x156b27 = _0xe8e4dd instanceof Error ? _0xe8e4dd : new Error(normalizeText(_0xe8e4dd?.message || _0xe8e4dd) || "片段视频生成失败");
        return {
          ok: false,
          type: "single-failed",
          error: _0x156b27,
          projectToken: _0x4f9c18,
          episodeId: _0x23826b.id,
          clipId: _0x19ccb2.id,
          modelId: _0x528ff5,
          provider: _0x69e71e
        };
      }
      await projectionAdapter.persist?.({
        immediate: true
      });
      return {
        ok: true,
        type: "single-complete",
        result: _0x8d703f,
        projectToken: _0x4f9c18,
        episodeId: _0x23826b.id,
        clipId: _0x19ccb2.id,
        modelId: _0x528ff5,
        provider: _0x69e71e
      };
    } catch (_0x3a2a7d) {
      if (!_0x382cc2(_0x4f9c18)) {
        return {
          ok: false,
          reason: "stale-project",
          modelId: _0x528ff5,
          provider: _0x69e71e
        };
      }
      if (batchRun?.cancelRequested) {
        return _0x339323({
          episode: _0x23826b,
          clip: _0x19ccb2,
          projectToken: _0x4f9c18
        });
      }
      return {
        ok: false,
        type: "single-failed",
        error: _0x3a2a7d,
        projectToken: _0x4f9c18,
        episodeId: _0x23826b?.id || "",
        clipId: _0x19ccb2?.id || "",
        modelId: _0x528ff5,
        provider: _0x69e71e
      };
    } finally {
      if (_0x1ebc5b && _0x345b3e.get(_0x23d960) === _0x1ebc5b) {
        _0x345b3e.delete(_0x23d960);
      }
      if (_0x1ebc5b) {
        batchRun?.controllers.delete(_0x1ebc5b);
      }
      if (_0x1ebc5b && _0x57e450(_0x4f9c18)) {
        setClipGenerationRunning(_0x1905be, _0x19ccb2?.id, false);
        _0x44c718();
      }
    }
  }
  async function _0x5526d6({
    episode: _0x106e4c,
    targets: _0x4f034f,
    projectToken: _0x3c9ce0
  }) {
    const _0x1de8f3 = new Set(_0x4f034f.map(_0x179990 => normalizeText(_0x179990?.id)).filter(Boolean));
    const _0x111d56 = projectAdapter.createBatch?.("clip-videos", {
      episodeId: _0x106e4c.id,
      total: _0x4f034f.length,
      completed: 0,
      targetClipIds: [..._0x1de8f3],
      pendingClipIds: [..._0x1de8f3],
      label: "批量生成 0/" + _0x4f034f.length
    }) || {
      id: "clip-videos:" + normalizeText(_0x3c9ce0?.projectId) + ":" + Date.now(),
      type: "clip-videos",
      episodeId: _0x106e4c.id,
      total: _0x4f034f.length,
      completed: 0
    };
    const _0x41886f = {
      batch: _0x111d56,
      projectToken: _0x3c9ce0,
      episodeId: normalizeText(_0x106e4c.id),
      controllers: new Set(),
      cancelRequested: false
    };
    const _0xf2b069 = _0x3c61e2(_0x3c9ce0, _0x106e4c);
    _0x3aa017.set(_0xf2b069, _0x41886f);
    setEpisodeBatchRunning(_0x1905be, _0x106e4c.id, true, "批量生成 0/" + _0x4f034f.length, {
      batchId: _0x111d56.id,
      cancelRequested: false
    });
    let _0x58aa2a = 0;
    let _0x472e6b = 0;
    let _0x5db5af = 0;
    let _0x327a58 = null;
    let _0x3175e3 = false;
    _0x44c718();
    try {
      await runBatch(_0x4f034f, _0x3c77b1 => _0x3cdb5d({
        episode: _0x106e4c,
        clip: _0x3c77b1,
        displayedClip: null,
        projectToken: _0x3c9ce0,
        batch: _0x111d56,
        batchRun: _0x41886f
      }), {
        onProgress: ({
          completed: _0x1463f6,
          total: _0x42dd0c,
          target: _0x3c846c,
          result: _0x4dfbe0
        }) => {
          if (!_0x382cc2(_0x3c9ce0)) {
            return;
          }
          _0x1de8f3.delete(normalizeText(_0x3c846c?.id));
          const _0xf35d51 = _0x41886f.cancelRequested ? "正在停止批量生成 · 已结束 " + _0x1463f6 + "/" + _0x42dd0c : "批量生成 " + _0x1463f6 + "/" + _0x42dd0c;
          projectAdapter.syncBatch?.(_0x3c9ce0, _0x111d56, {
            completed: _0x1463f6,
            pendingClipIds: [..._0x1de8f3],
            cancelRequested: _0x41886f.cancelRequested,
            label: _0xf35d51
          });
          if (_0x4dfbe0?.ok) {
            _0x58aa2a += 1;
          } else if (_0x4dfbe0?.cancelled || _0x4dfbe0?.reason === "batch-cancelled") {
            _0x5db5af += 1;
          } else {
            _0x472e6b += 1;
            _0x327a58 ||= _0x4dfbe0;
            if (!_0x3175e3 && _0x4dfbe0?.error) {
              _0x3175e3 = projectionAdapter.present?.({
                type: "provider-error",
                error: _0x4dfbe0.error,
                modelId: _0x4dfbe0.modelId,
                provider: _0x4dfbe0.provider
              }) === true;
            }
          }
          if (_0x57e450(_0x3c9ce0)) {
            setEpisodeBatchRunning(_0x1905be, _0x106e4c.id, true, _0xf35d51, {
              batchId: _0x111d56.id,
              cancelRequested: _0x41886f.cancelRequested
            });
            _0x44c718();
          }
        }
      });
    } finally {
      if (_0x3aa017.get(_0xf2b069) === _0x41886f) {
        _0x3aa017.delete(_0xf2b069);
      }
      if (_0x57e450(_0x3c9ce0)) {
        setEpisodeBatchRunning(_0x1905be, _0x106e4c.id, false);
        await projectionAdapter.persist?.({
          immediate: true
        });
        _0x44c718();
      }
    }
    if (!_0x382cc2(_0x3c9ce0)) {
      return false;
    }
    projectionAdapter.present?.({
      type: "batch-complete",
      projectToken: _0x3c9ce0,
      episodeId: _0x106e4c.id,
      clipId: _0x4f034f[0]?.id || "",
      succeeded: _0x58aa2a,
      failed: _0x472e6b,
      cancelled: _0x5db5af,
      cancelRequested: _0x41886f.cancelRequested,
      firstFailure: _0x327a58,
      suppressToast: _0x3175e3
    });
    return _0x58aa2a > 0;
  }
  async function _0x2d26fd() {
    const _0x48b4b1 = getSelectedEpisode(_0x1905be);
    const _0x3fd9e2 = normalizeText(_0x48b4b1?.id);
    const _0x1685cf = projectAdapter.createToken();
    const _0x5c75fb = _0x3c61e2(_0x1685cf, _0x48b4b1);
    let _0xdb6ae4 = _0x3aa017.get(_0x5c75fb);
    if (!_0xdb6ae4) {
      const _0x1ce7e5 = _0x1905be.clipBatchGenerationByEpisode?.[_0x3fd9e2];
      const _0x55a50b = _0x5c75fb + ":";
      const _0x23d37b = new Set([..._0x345b3e.entries()].filter(([_0x27899f]) => normalizeText(_0x27899f).startsWith(_0x55a50b)).map(([, _0x68ace1]) => _0x68ace1));
      if (!_0x1ce7e5?.batchId || !_0x23d37b.size) {
        return false;
      }
      _0xdb6ae4 = {
        batch: {
          id: _0x1ce7e5.batchId,
          type: "clip-videos",
          episodeId: _0x3fd9e2
        },
        projectToken: _0x1685cf,
        episodeId: _0x3fd9e2,
        controllers: _0x23d37b,
        cancelRequested: _0x1ce7e5.cancelRequested === true
      };
    }
    if (!_0xdb6ae4 || _0xdb6ae4.cancelRequested) {
      return false;
    }
    _0xdb6ae4.cancelRequested = true;
    const _0x2d36bb = "正在停止批量生成";
    projectAdapter.syncBatch?.(_0xdb6ae4.projectToken, _0xdb6ae4.batch, {
      type: "clip-videos-stopped",
      cancelRequested: true,
      pendingClipIds: [],
      label: _0x2d36bb
    });
    if (_0x57e450(_0xdb6ae4.projectToken)) {
      setEpisodeBatchRunning(_0x1905be, _0x3fd9e2, true, _0x2d36bb, {
        batchId: _0xdb6ae4.batch.id,
        cancelRequested: true
      });
      _0x44c718();
    }
    await Promise.allSettled([..._0xdb6ae4.controllers].map(_0x74434a => {
      if (typeof _0x74434a?.cancel === "function") {
        return _0x74434a.cancel();
      }
      return _0x74434a?.pause?.();
    }));
    return true;
  }
  async function _0x5b4c81() {
    const _0x19e186 = getSelectedEpisode(_0x1905be);
    const _0x589658 = getGenerationState(_0x1905be, _0x19e186);
    if (_0x589658.isBatchGenerating) {
      return false;
    }
    const _0x25d706 = getSelectedClip(_0x1905be, _0x19e186);
    const _0x30e169 = _0x1905be.clipSelectionMode ? selectBatchTargets(_0x19e186?.clips, _0x1905be.selectedClipGenerationIds) : [];
    if (_0x1905be.clipSelectionMode && _0x30e169.length > 1) {
      if (_0x589658.busy) {
        return false;
      }
      return _0x5526d6({
        episode: _0x19e186,
        targets: _0x30e169,
        projectToken: projectAdapter.createToken()
      });
    }
    const _0x4b0ba9 = _0x1905be.clipSelectionMode ? _0x30e169[0] : _0x25d706;
    if (!_0x4b0ba9) {
      projectionAdapter.present?.({
        type: "selection-missing"
      });
      return false;
    }
    const _0x30cf42 = projectAdapter.createToken();
    const _0x2916d = await _0x3cdb5d({
      episode: _0x19e186,
      clip: _0x4b0ba9,
      displayedClip: _0x25d706,
      projectToken: _0x30cf42
    });
    if (_0x2916d.reason === "empty-prompt") {
      projectionAdapter.present?.({
        ..._0x2916d,
        type: "empty-prompt"
      });
      return false;
    }
    if (_0x2916d.type) {
      projectionAdapter.present?.(_0x2916d);
    }
    return _0x2916d.ok === true;
  }
  return Object.freeze({
    generateSelection: _0x5b4c81,
    cancelBatch: _0x2d26fd
  });
}
export const storyClipProduction = Object.freeze({
  createRuntime: createRuntime,
  getAdjacentClipId: getAdjacentClipId,
  getInputReferenceCounts: getInputReferenceCounts,
  removeVideoResult: removeVideoResult,
  renderTimelineVideoThumbnail: renderTimelineVideoThumbnail,
  selectBatchTargets: selectBatchTargets,
  runBatch: runBatch,
  getGenerationState: getGenerationState,
  setClipGenerationRunning: setClipGenerationRunning,
  setEpisodeBatchRunning: setEpisodeBatchRunning,
  shouldCloseAdjustmentOnOutsideClick: shouldCloseAdjustmentOnOutsideClick,
  shouldClosePromptHistoryOnOutsideClick: shouldClosePromptHistoryOnOutsideClick,
  renderEpisode: renderEpisode
});