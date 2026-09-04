import { PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID, getPersonReplacementActiveImageResultIndex, getPersonReplacementImageResults, getPersonReplacementVideoResults, resolvePersonReplacementImageResultRef, resolvePersonReplacementImageSourceRef, resolvePersonReplacementTargetCharacterId } from "./personReplacementProject.js";
import { resolvePersonReplacementImageGenerationState } from "./personReplacementImageGeneration.js";
import { buildPersonReplacementPromptPackage, isPersonReplacementSceneOnlyPromptPackage } from "./personReplacementPromptCompiler.js";
import { getPersonReplacementBoxedPeople, getPersonReplacementDuplicateRoleLabels, resolvePersonReplacementDetectionLabel } from "./personReplacementSourceIdentity.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { renderAIGenImageModelSelectorMarkup } from "../../components/aigenImage/modelSelector.js";
import { renderWorkspaceAssetLoadingOverlay } from "../workspaceAssetPresentation.js";
import { renderPersonReplacementPreviewArrow } from "./personReplacementAssetPresentation.js";
import { renderWorkspaceImageDownloadButton } from "../workspaceImageDownload.js";
import { renderWorkspaceUploadIcon } from "../workspaceActionIcons.js";
import { normalizePersonReplacementLayout } from "./personReplacementProjectSession.js";
import { renderPersonReplacementPromptHtml } from "./personReplacementPromptMentions.js";
import { resolvePersonReplacementSourcePlaybackRef } from "./personReplacementSourcePlayback.js";
function normalizeText(_0x2970f0) {
  return String(_0x2970f0 ?? "").trim();
}
export function syncPersonReplacementImageStageFrame(_0x290cf0) {
  const _0x3c8274 = Math.max(0, Number(_0x290cf0?.naturalWidth) || 0);
  const _0x1494f8 = Math.max(0, Number(_0x290cf0?.naturalHeight) || 0);
  const _0xfbc304 = _0x290cf0?.closest?.("[data-person-replacement-keyframe-stage]");
  if (!(_0x3c8274 > 0) || !(_0x1494f8 > 0) || !_0xfbc304?.style) {
    return false;
  }
  _0xfbc304.style.setProperty("--frame-aspect", _0x3c8274 + " / " + _0x1494f8);
  _0xfbc304.style.setProperty("--frame-width", String(_0x3c8274));
  _0xfbc304.style.setProperty("--frame-height", String(_0x1494f8));
  _0x290cf0.setAttribute?.("width", String(_0x3c8274));
  _0x290cf0.setAttribute?.("height", String(_0x1494f8));
  const _0x728a27 = _0xfbc304.parentElement;
  const _0xfc0fc = _0x728a27?.getBoundingClientRect?.();
  const _0x188078 = Math.max(0, Number(_0x728a27?.clientWidth) || Number(_0xfc0fc?.width) || 0);
  const _0x413ed5 = Math.max(0, Number(_0x728a27?.clientHeight) || Number(_0xfc0fc?.height) || 0);
  if (_0x188078 > 0 && _0x413ed5 > 0) {
    const _0x99cde2 = _0x3c8274 / _0x1494f8;
    const _0x40e9fd = _0x188078 / _0x413ed5;
    const _0x4f5a7d = _0x40e9fd > _0x99cde2 ? _0x413ed5 * _0x99cde2 : _0x188078;
    const _0x4d895e = _0x40e9fd > _0x99cde2 ? _0x413ed5 : _0x188078 / _0x99cde2;
    _0xfbc304.style.setProperty("width", _0x4f5a7d + "px");
    _0xfbc304.style.setProperty("height", _0x4d895e + "px");
  }
  return true;
}
function resolveSelectedShot(_0x30c059 = {}) {
  const _0x1b2e26 = Array.isArray(_0x30c059?.shots) ? _0x30c059.shots : [];
  const _0xfbb775 = normalizeText(_0x30c059?.workspace?.selectedShotId);
  return _0x1b2e26.find(_0x590fe1 => normalizeText(_0x590fe1?.id) === _0xfbb775) || _0x1b2e26[0] || null;
}
function buildGate({
  boxedPeople = [],
  duplicateRoleLabels = [],
  promptPackage = {}
} = {}) {
  const _0x27fc74 = promptPackage || {};
  const _0x13d9e7 = Array.isArray(_0x27fc74.missingLocatorPersonIds) ? _0x27fc74.missingLocatorPersonIds : [];
  const _0x12eea6 = Array.isArray(_0x27fc74.unmappedPersonIds) ? _0x27fc74.unmappedPersonIds : [];
  const _0x87ac48 = Array.isArray(_0x27fc74.unresolvedOrientationPersonIds) ? _0x27fc74.unresolvedOrientationPersonIds : [];
  const _0x5d21d9 = Array.isArray(_0x27fc74.overflowPersonIds) ? _0x27fc74.overflowPersonIds : [];
  const _0x3f01a2 = Array.isArray(_0x27fc74.mappedPersonIds) ? _0x27fc74.mappedPersonIds : [];
  const _0x346b2e = Array.isArray(_0x27fc74.referenceImages) && _0x27fc74.referenceImages.some(_0x566953 => normalizeText(_0x566953?.role) === "source-keyframe");
  const _0x3ceb85 = Boolean(_0x346b2e && isPersonReplacementSceneOnlyPromptPackage(_0x27fc74));
  const _0x553d27 = _0x3ceb85 ? [] : [...(!boxedPeople.length ? ["missing-person-box"] : []), ...(duplicateRoleLabels.length ? ["duplicate-role"] : []), ...(_0x13d9e7.length ? ["missing-locator"] : []), ...(_0x12eea6.length ? ["missing-mapping"] : []), ...(_0x87ac48.length ? ["missing-orientation"] : []), ...(_0x5d21d9.length ? ["person-limit"] : [])];
  const _0x1a799a = Boolean(boxedPeople.length && _0x3f01a2.length === boxedPeople.length && _0x553d27.length === 0);
  return {
    eligible: _0x3ceb85 || _0x1a799a,
    mappingComplete: _0x1a799a,
    sceneOnly: _0x3ceb85,
    blockers: _0x553d27,
    duplicateRoleLabels: duplicateRoleLabels,
    mappedPersonIds: _0x3f01a2,
    missingLocatorPersonIds: _0x13d9e7,
    unmappedPersonIds: _0x12eea6,
    unresolvedOrientationPersonIds: _0x87ac48,
    overflowPersonIds: _0x5d21d9
  };
}
function buildIdentityPresentation({
  project = {},
  shot = {},
  boxedPeople = [],
  duplicateRoleLabels = [],
  mappedPersonIds = []
} = {}) {
  const _0x23f1d7 = new Set(duplicateRoleLabels);
  const _0x16b4aa = new Set(mappedPersonIds);
  const _0x1b359e = normalizeText(shot?.id);
  return boxedPeople.map((_0xace7b8, _0x2db11d) => {
    const _0x33bf04 = resolvePersonReplacementDetectionLabel(_0xace7b8, _0x2db11d, project, _0x1b359e);
    const _0x239f4e = resolvePersonReplacementTargetCharacterId(project, _0xace7b8);
    const _0xc59546 = _0x16b4aa.has(normalizeText(_0xace7b8?.id));
    const _0x35e215 = _0x23f1d7.has(_0x33bf04);
    return {
      person: _0xace7b8,
      personId: normalizeText(_0xace7b8?.id),
      sourceCharacterId: normalizeText(_0xace7b8?.sourceCharacterId),
      targetCharacterId: _0x239f4e,
      label: _0x33bf04,
      mapped: _0xc59546,
      duplicateRole: _0x35e215,
      eligible: _0xc59546 && !_0x35e215
    };
  });
}
function hasProjectDerivedArtifacts(_0x1f0e95 = {}) {
  const _0x26c221 = _0x1f0e95?.output || {};
  return Boolean(normalizeText(_0x1f0e95?.audio?.originalAudioRef) || normalizeText(_0x26c221.originalMasterRef) || normalizeText(_0x26c221.visualMasterRef) || normalizeText(_0x26c221.finalVideoRef) || normalizeText(_0x26c221.finalAudioTrack) || normalizeText(_0x26c221.composeStatus).toLowerCase() === "succeeded" || Array.isArray(_0x26c221.composedShotIds) && _0x26c221.composedShotIds.some(_0x5783b8 => normalizeText(_0x5783b8)));
}
function buildResultPresentation(_0x5f3cd0 = {}, _0x12d4c2 = null) {
  const _0x1a05c1 = getPersonReplacementImageResults(_0x12d4c2);
  const _0x3b97ea = getPersonReplacementActiveImageResultIndex(_0x12d4c2, _0x1a05c1);
  const _0x39c178 = _0x1a05c1[_0x3b97ea] || null;
  const _0x3381e1 = resolvePersonReplacementImageResultRef(_0x39c178) || normalizeText(_0x12d4c2?.replacementImageRef);
  const _0x3b123e = Boolean(getPersonReplacementVideoResults(_0x12d4c2).length || normalizeText(_0x12d4c2?.resultVideoRef) || normalizeText(_0x12d4c2?.generationStatus) && normalizeText(_0x12d4c2?.generationStatus).toLowerCase() !== "pending" || normalizeText(_0x12d4c2?.error));
  const _0x1f7658 = hasProjectDerivedArtifacts(_0x5f3cd0);
  return {
    results: _0x1a05c1,
    active: _0x39c178,
    activeIndex: _0x3b97ea,
    activeRef: _0x3381e1,
    activePrompt: normalizeText(_0x12d4c2?.imagePrompt),
    resultPrompt: Object.prototype.hasOwnProperty.call(_0x39c178 || {}, "userPrompt") ? normalizeText(_0x39c178?.userPrompt) : "",
    hasHistory: _0x1a05c1.length > 1,
    downstream: {
      shotHasDerivedArtifacts: _0x3b123e,
      projectHasDerivedArtifacts: _0x1f7658,
      invalidationRequired: _0x3b123e || _0x1f7658
    }
  };
}
export function buildPersonReplacementImagePresentation(_0x26446d = {}, _0x351c1b = []) {
  const _0x517ad3 = resolveSelectedShot(_0x26446d);
  const _0x33a62d = normalizeText(_0x517ad3?.id);
  const _0x1b9750 = _0x517ad3 ? buildPersonReplacementPromptPackage({
    project: _0x26446d,
    shot: _0x517ad3
  }) : null;
  const _0x965662 = _0x517ad3 ? getPersonReplacementBoxedPeople(_0x517ad3) : [];
  const _0x2078d2 = _0x517ad3 ? getPersonReplacementDuplicateRoleLabels(_0x517ad3, _0x26446d) : [];
  const _0x5f297a = buildGate({
    boxedPeople: _0x965662,
    duplicateRoleLabels: _0x2078d2,
    promptPackage: _0x1b9750
  });
  const _0x3c85da = resolvePersonReplacementImageGenerationState(_0x26446d?.workspace, _0x33a62d);
  const _0x29ea1a = new Set((Array.isArray(_0x351c1b) ? _0x351c1b : []).map(normalizeText).filter(Boolean));
  const _0x5cbd6e = Boolean(_0x33a62d && (_0x3c85da.status === "running" && normalizeText(_0x3c85da.shotId) === _0x33a62d || _0x29ea1a.has(_0x33a62d)));
  return {
    selectedShot: _0x517ad3,
    selectedShotId: _0x33a62d,
    sourceImageRef: resolvePersonReplacementImageSourceRef(_0x517ad3),
    promptPackage: _0x1b9750,
    boxedPeople: _0x965662,
    identities: buildIdentityPresentation({
      project: _0x26446d,
      shot: _0x517ad3,
      boxedPeople: _0x965662,
      duplicateRoleLabels: _0x2078d2,
      mappedPersonIds: _0x5f297a.mappedPersonIds
    }),
    gate: _0x5f297a,
    generation: {
      state: _0x3c85da,
      loading: _0x5cbd6e
    },
    result: buildResultPresentation(_0x26446d, _0x517ad3)
  };
}
function escapeHtml(_0x32be45) {
  return String(_0x32be45 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeMediaUrl(_0x1a9462) {
  const _0x4eb048 = normalizeText(_0x1a9462);
  if (_0x4eb048) {
    return localPathToUrl(_0x4eb048) || _0x4eb048;
  } else {
    return "";
  }
}
function renderImageReplacementGenerateButton(_0xd8e756, {
  presentation = {},
  shotBatchGenerationActive = false,
  shotBatchCancelRequested = false
} = {}) {
  const _0x591ca6 = presentation.selectedShot || null;
  const _0x327737 = _0xd8e756.workspace.shotSelectionMode === true;
  const _0x4607ee = Array.isArray(_0xd8e756.workspace.selectedShotIds) ? _0xd8e756.workspace.selectedShotIds.length : 0;
  const _0x333d0b = new Set(Array.isArray(_0xd8e756.workspace.selectedShotIds) ? _0xd8e756.workspace.selectedShotIds.map(normalizeText).filter(Boolean) : []);
  const _0x5b2b14 = _0xd8e756.shots.some(_0x5a9208 => {
    if (!_0x333d0b.has(normalizeText(_0x5a9208.id))) {
      return false;
    }
    const _0xeb7a2c = buildPersonReplacementImagePresentation({
      ..._0xd8e756,
      workspace: {
        ..._0xd8e756.workspace,
        selectedShotId: normalizeText(_0x5a9208.id)
      }
    });
    return !_0xeb7a2c.gate.sceneOnly && _0xeb7a2c.gate.duplicateRoleLabels.length > 0;
  });
  const _0x482d25 = Boolean(presentation.generation?.loading);
  const _0x3a88a4 = _0x4607ee ? " (" + _0x4607ee + ")" : "";
  const _0x471158 = _0x327737 ? shotBatchGenerationActive ? shotBatchCancelRequested ? "正在停止" + _0x3a88a4 : "取消运行" + _0x3a88a4 : "批量生成替换图" + _0x3a88a4 : _0x482d25 ? "生成中" : "生成替换图";
  const _0x74a800 = _0x327737 ? !_0x4607ee || _0x5b2b14 || shotBatchCancelRequested : !_0x591ca6 || !presentation.gate?.eligible || _0x482d25;
  return "<button type=\"button\" class=\"story-asset-generate-button\" aria-busy=\"" + shotBatchGenerationActive + "\" data-person-replacement-action=\"generate-replacement-image\" " + (_0x74a800 ? "disabled" : "") + ">" + _0x471158 + "</button>";
}
function renderImageReplacementPage(_0x57e6aa, _0x57ee56 = {}, {
  buildIdentityView: _0xdef4b9,
  renderShotTimeline: _0x43815a,
  renderLayoutSplitter: _0x8d1ec0,
  renderFooter: _0x5a55c0,
  renderSmartDetectTrigger: _0xc65fae
}) {
  const _0x54bdec = buildPersonReplacementImagePresentation(_0x57e6aa, _0x57ee56.shotBatchGeneratingShotIds);
  const _0x293a75 = _0x54bdec.selectedShot;
  const _0x2b580a = _0x54bdec.sourceImageRef;
  const _0x4aaf1b = _0x57ee56.cutEditorOpen === true;
  const _0x127201 = _0x57ee56.omitShotTimeline === true;
  const _0x7d6458 = _0x57ee56.cutEditorSoundEnabled === true;
  const _0x349631 = _0x4aaf1b ? Array.isArray(_0x57ee56.cutEditorDraft) ? _0x57ee56.cutEditorDraft.find(_0x309bb8 => _0x309bb8.shotId === normalizeText(_0x57ee56.cutEditorPreviewShotId)) : null : null;
  const _0x331e91 = _0x4aaf1b ? _0x57e6aa.shots.find(_0x7f9091 => _0x7f9091.id === normalizeText(_0x57ee56.cutEditorPreviewShotId)) || _0x57e6aa.shots.find(_0x59c89c => _0x59c89c.id === normalizeText(_0x349631?.originShotId)) || _0x293a75 : _0x293a75;
  const _0x1ba70f = _0x4aaf1b ? _0x57e6aa.sources.find(_0x4e958f => _0x4e958f.id === _0x331e91?.sourceId) : null;
  const _0x450282 = resolvePersonReplacementSourcePlaybackRef({
    runtimePreviewRef: _0x57e6aa.sourcePreviewRefs?.[_0x331e91?.sourceId],
    source: _0x1ba70f,
    sourceShot: _0x331e91
  });
  const _0x95b1d4 = normalizeMediaUrl(_0x450282);
  const _0x36e2a9 = Boolean(_0x4aaf1b && _0x95b1d4 && normalizeText(_0x57ee56.cutEditorBufferedMediaRef) === _0x95b1d4);
  const _0x2c0269 = normalizeMediaUrl(_0x331e91?.keyframeRef || _0x293a75?.keyframeRef);
  const _0x435540 = _0x54bdec.generation.state;
  const _0x93f18e = _0x54bdec.generation.loading;
  const _0x52c247 = _0x54bdec.result.results;
  const _0x418113 = _0x54bdec.result.activeIndex;
  const _0x3b5f4e = _0x54bdec.result.hasHistory;
  const _0xf7db6b = _0x3b5f4e ? "" + renderPersonReplacementPreviewArrow("previous", {
    action: "previous-replacement-image-result",
    label: "切换到上一个替换图结果",
    className: "person-replacement-image-result-arrow"
  }) + renderPersonReplacementPreviewArrow("next", {
    action: "next-replacement-image-result",
    label: "切换到下一个替换图结果",
    className: "person-replacement-image-result-arrow"
  }) : "";
  const _0x369031 = _0x4aaf1b ? _0x331e91?.frame : _0x293a75?.frame;
  const _0x54cb1e = Math.max(1, Number(_0x369031?.width) || 16);
  const _0x1c67ac = Math.max(1, Number(_0x369031?.height) || 9);
  const _0x55b95c = "--frame-aspect:" + _0x54cb1e + " / " + _0x1c67ac + ";--frame-width:" + _0x54cb1e + ";--frame-height:" + _0x1c67ac;
  const _0x27afa7 = _0x54bdec.boxedPeople;
  const _0x556c10 = new Set(_0x54bdec.gate.duplicateRoleLabels);
  const _0x411459 = _0xdef4b9(_0x57e6aa, _0x54bdec, {
    people: _0x27afa7,
    duplicateRoleLabels: _0x556c10
  });
  const _0x5ef320 = _0x556c10.size ? "<p class=\"person-replacement-limit-warning person-replacement-role-conflict-warning\">同一镜头内角色不能重复：" + escapeHtml([..._0x556c10].join("、")) + "。请修改红色框中的角色名。</p>" : "";
  const _0x39e70b = _0x293a75?.people?.length ? "检测结果缺少人物框" : "当前帧未检测到人物（可替换主体）";
  const _0x33f82e = "<div class=\"person-replacement-detection-empty\"><strong>" + _0x39e70b + "</strong><span>怪物、兽人等人形角色可能被人体模型漏检，可直接框选主体。</span></div>";
  const _0x5ea261 = _0x27afa7.length > 0;
  const _0x6cc9ac = _0x5ea261 ? "<button type=\"button\" class=\"person-replacement-secondary-button person-replacement-clear-people-button\" data-person-replacement-action=\"clear-shot-people\" data-shot-id=\"" + escapeHtml(_0x293a75?.id || "") + "\" aria-label=\"清空全部人物框\">清空</button>" : "<button type=\"button\" class=\"person-replacement-secondary-button person-replacement-clear-people-button\" aria-hidden=\"true\" tabindex=\"-1\" disabled>清空</button>";
  const _0x3975f = "person-replacement-keyframe-display person-replacement-middle-preview-slide" + (_0x4aaf1b ? " is-cut-editor-open" : "");
  const _0x26aa13 = !_0x4aaf1b && !_0x5ea261;
  const _0x59eb05 = _0x4aaf1b ? _0xc65fae({
    smartDetectOpen: _0x57ee56.cutEditorSmartDetectOpen === true,
    smartDetecting: _0x57ee56.cutEditorSmartDetecting === true,
    disabled: Boolean(_0x57ee56.cutEditorSubmitting || _0x57ee56.cutEditorSmartDetecting)
  }) : _0x6cc9ac;
  const _0x4f4ef2 = "<div class=\"person-replacement-keyframe-tools" + (_0x26aa13 ? " is-layout-placeholder" : "") + "\"" + (_0x26aa13 ? " aria-hidden=\"true\" inert" : "") + ">" + _0x59eb05 + "</div>";
  const _0x1da5e8 = _0x57e6aa.shots.length > 1;
  const _0x1fa961 = _0x1da5e8 ? "" + renderPersonReplacementPreviewArrow("previous", {
    action: "previous-shot",
    label: "上一个片段",
    className: "person-replacement-shot-navigation-arrow"
  }) + renderPersonReplacementPreviewArrow("next", {
    action: "next-shot",
    label: "下一个片段",
    className: "person-replacement-shot-navigation-arrow"
  }) : "";
  const _0x336eb4 = _0x1da5e8 ? " aria-label=\"滚动鼠标滚轮或按左右方向键切换片段\"" : "";
  const _0x283490 = _0x4aaf1b && _0x450282 ? "<div class=\"" + _0x3975f + "\">" + _0x4f4ef2 + "<div class=\"person-replacement-keyframe-stage-shell\"><div class=\"person-replacement-shot-clip-stage\" data-person-replacement-shot-cut-preview-stage data-shot-id=\"" + escapeHtml(_0x331e91?.id || "") + "\" style=\"" + _0x55b95c + "\"><video aria-label=\"镜头切口预览\" preload=\"" + (_0x36e2a9 ? "none" : "auto") + "\" playsinline " + (_0x7d6458 ? "" : "muted ") + (_0x36e2a9 ? "" : "src=\"" + escapeHtml(_0x95b1d4) + "\" ") + (_0x2c0269 ? "poster=\"" + escapeHtml(_0x2c0269) + "\"" : "") + " data-person-replacement-shot-cut-video data-source-id=\"" + escapeHtml(_0x331e91?.sourceId || "") + "\"></video></div></div></div>" : _0x2b580a ? "<div class=\"" + _0x3975f + "\"" + (_0x1da5e8 ? " data-person-replacement-shot-wheel=\"true\"" : "") + ">" + _0x4f4ef2 + "<div class=\"person-replacement-keyframe-stage-shell\"><div class=\"person-replacement-keyframe-stage\" data-person-replacement-keyframe-stage data-story-marquee-surface=\"people\" data-shot-id=\"" + escapeHtml(_0x293a75?.id || "") + "\" tabindex=\"0\" aria-keyshortcuts=\"Control D Delete\" style=\"" + _0x55b95c + "\"" + _0x336eb4 + "><img src=\"" + escapeHtml(normalizeMediaUrl(_0x2b580a)) + "\" alt=\"" + (_0x293a75?.imageIterationReferenceRef ? "图像1参考图" : "视频首帧") + "\" width=\"" + _0x54cb1e + "\" height=\"" + _0x1c67ac + "\">" + (_0x27afa7.length ? _0x411459.detectionBoxesHtml : _0x33f82e) + "</div></div>" + _0x1fa961 + "</div>" : "<div class=\"person-replacement-inline-empty\">视频仍在抽帧或没有可用首帧</div>";
  const _0x288044 = normalizePersonReplacementLayout(_0x57e6aa.workspace.replacementLayout);
  const _0x1eee46 = "--person-replacement-left-width:" + _0x288044.left + "%;--person-replacement-right-width:" + _0x288044.right + "%;--person-replacement-center-top:" + _0x288044.centerTop + "%;";
  return "<div class=\"person-replacement-production-page\">\n    <div class=\"person-replacement-four-panel-layout\" data-person-replacement-layout style=\"" + _0x1eee46 + "\">\n       " + _0x411459.targetAssetRailHtml + "\n       " + _0x8d1ec0("left", _0x288044) + "\n       <section class=\"person-replacement-keyframe-panel person-replacement-middle-layout\">" + _0x283490 + _0x8d1ec0("center", _0x288044) + (_0x127201 ? "" : _0x43815a(_0x57e6aa, {
    ..._0x57ee56,
    allowCutEditing: true
  })) + "</section>\n      " + _0x8d1ec0("right", _0x288044) + "\n      <aside class=\"person-replacement-generation-panel person-replacement-image-generation-panel\">\n        <div class=\"person-replacement-generation-preview " + (_0x93f18e ? "img-preview-loading" : "") + "\" aria-busy=\"" + _0x93f18e + "\"" + (_0x3b5f4e ? " data-person-replacement-image-result-wheel=\"true\" aria-label=\"滚动鼠标滚轮切换生成结果\"" : "") + ">\n          <div class=\"person-replacement-image-preview-slide\">\n            " + (_0x54bdec.result.activeRef ? "<img src=\"" + escapeHtml(normalizeMediaUrl(_0x54bdec.result.activeRef)) + "\" alt=\"替换结果 " + (_0x418113 + 1) + "\" width=\"" + _0x54cb1e + "\" height=\"" + _0x1c67ac + "\">" : "<span>生成结果显示在这里</span>") + "\n          </div>\n          " + (_0x93f18e ? renderWorkspaceAssetLoadingOverlay({
    title: "替换图生成中",
    description: "正在等待生成结果，完成后会自动显示。"
  }) : "") + "\n          <div class=\"story-asset-preview-actions person-replacement-result-actions\">\n            " + renderWorkspaceImageDownloadButton({
    action: "download-replacement-image",
    enabled: Boolean(_0x54bdec.result.activeRef),
    className: "person-replacement-result-download"
  }) + "\n            <button type=\"button\" class=\"story-upload-replace story-character-voice-upload-button person-replacement-result-upload\" data-story-action=\"upload-replacement-image\" aria-label=\"上传替换图片\" " + (!_0x293a75 || _0x93f18e ? "disabled" : "") + ">" + renderWorkspaceUploadIcon() + "</button>\n          </div>\n          " + _0xf7db6b + "\n          " + (_0x52c247.length ? "<div class=\"person-replacement-image-result-meta\" aria-label=\"生成结果 " + (_0x418113 + 1) + "/" + _0x52c247.length + "\"><span>" + (_0x418113 + 1) + "/" + _0x52c247.length + "</span></div>" : "") + "\n        </div>\n        <div class=\"story-asset-detail-copy person-replacement-generation-copy\"><div class=\"story-asset-prompt-field person-replacement-prompt-field\"><div class=\"person-replacement-prompt-field-heading\"><span>提示词</span>" + _0x411459.promptReferenceInputsHtml + "</div><div class=\"prompt-input-wrapper is-resizable person-replacement-prompt-input-wrapper\"><div class=\"prompt-textarea custom-textarea story-asset-prompt-editor person-replacement-prompt-editor\" contenteditable=\"true\" role=\"textbox\" aria-label=\"图像替换提示词\" data-placeholder=\"描述替换效果，输入 @ 引用左侧素材图\" data-person-replacement-field=\"image-prompt\" data-shot-id=\"" + escapeHtml(_0x293a75?.id || "") + "\">" + renderPersonReplacementPromptHtml(_0x54bdec.result.activePrompt) + "</div></div></div>" + (_0x54bdec.gate.overflowPersonIds.length ? "<p class=\"person-replacement-limit-warning\">单次最多 8 个目标人物</p>" : "") + (_0x54bdec.gate.unresolvedOrientationPersonIds.length ? "<p class=\"person-replacement-limit-warning person-replacement-orientation-warning\">还有 " + _0x54bdec.gate.unresolvedOrientationPersonIds.length + " 个人物未确认朝向，确认后才能生成。</p>" : "") + _0x5ef320 + "<div class=\"story-asset-generation-bar prompt-panel-footer\">" + renderAIGenImageModelSelectorMarkup({
    modelId: _0x57e6aa.settings.replacementImageModelId || PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID,
    provider: _0x57e6aa.settings.replacementImageProvider,
    generationParams: _0x57e6aa.settings.replacementImageGenerationParams || {},
    providerProfileId: _0x57e6aa.settings.replacementImageProviderProfileId,
    providerProfileIdByModel: _0x57e6aa.settings.replacementImageProviderProfileIdByModel,
    showSchemaControls: true,
    className: "story-asset-image-model-selector person-replacement-image-model-selector"
  }) + renderImageReplacementGenerateButton(_0x57e6aa, {
    presentation: _0x54bdec,
    ..._0x57ee56
  }) + "</div>" + (_0x435540.error ? "<p class=\"person-replacement-error\">" + escapeHtml(_0x435540.error) + "</p>" : "") + "</div>\n      </aside>\n   </div>" + _0x5a55c0(_0x57e6aa, {
    nextLabel: "进入视频替换"
  }) + "\n  </div>";
}
function cloneFrozenPresentationValue(_0x1c10d3) {
  if (Array.isArray(_0x1c10d3)) {
    return Object.freeze(_0x1c10d3.map(cloneFrozenPresentationValue));
  }
  if (!_0x1c10d3 || typeof _0x1c10d3 !== "object") {
    return _0x1c10d3;
  }
  return Object.freeze(Object.fromEntries(Object.entries(_0x1c10d3).map(([_0x3dfe4c, _0x54beef]) => [_0x3dfe4c, cloneFrozenPresentationValue(_0x54beef)])));
}
function buildReadonlyImagePresentation(_0x51dc8d, _0x594801) {
  const _0x5c0134 = buildPersonReplacementImagePresentation(_0x51dc8d, _0x594801);
  return Object.freeze({
    selectedShot: _0x5c0134.selectedShot ? cloneFrozenPresentationValue(_0x5c0134.selectedShot) : null,
    selectedShotId: _0x5c0134.selectedShotId,
    sourceImageRef: _0x5c0134.sourceImageRef,
    promptPackage: _0x5c0134.promptPackage ? cloneFrozenPresentationValue(_0x5c0134.promptPackage) : null,
    boxedPeople: cloneFrozenPresentationValue(_0x5c0134.boxedPeople),
    identities: cloneFrozenPresentationValue(_0x5c0134.identities),
    gate: cloneFrozenPresentationValue(_0x5c0134.gate),
    generation: cloneFrozenPresentationValue(_0x5c0134.generation),
    result: cloneFrozenPresentationValue(_0x5c0134.result)
  });
}
export function createPersonReplacementImagePresentation({
  buildIdentityView = () => ({
    detectionBoxesHtml: "",
    promptReferenceInputsHtml: "",
    targetAssetRailHtml: ""
  }),
  renderShotTimeline = () => "",
  renderLayoutSplitter = () => "",
  renderFooter = () => "",
  renderSmartDetectTrigger = () => ""
} = {}) {
  const _0x543026 = Object.freeze({
    buildIdentityView: buildIdentityView,
    renderShotTimeline: renderShotTimeline,
    renderLayoutSplitter: renderLayoutSplitter,
    renderFooter: renderFooter,
    renderSmartDetectTrigger: renderSmartDetectTrigger
  });
  return Object.freeze({
    build: buildReadonlyImagePresentation,
    render: (_0x15f61e, _0x5997e4 = {}) => renderImageReplacementPage(_0x15f61e, _0x5997e4, _0x543026),
    renderGenerateButton: renderImageReplacementGenerateButton
  });
}