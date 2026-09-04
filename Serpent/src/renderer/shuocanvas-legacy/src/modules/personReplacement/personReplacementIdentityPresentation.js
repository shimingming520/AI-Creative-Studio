import { renderVideoReferenceBarMarkup } from "../../components/video-node/promptInputSurface.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { getWorkspaceAssetAppearances, getWorkspaceAssetBaseAppearance } from "../workspaceAssetAppearance.js";
import { buildPersonReplacementAssetViewState, renderPersonReplacementAssetCard, renderPersonReplacementPreviewArrow } from "./personReplacementAssetPresentation.js";
import { PERSON_REPLACEMENT_ORIENTATIONS, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE, PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE, formatPersonReplacementScopeLabel, normalizePersonReplacementScope } from "./personReplacementProject.js";
import { PERSON_REPLACEMENT_ORIENTATION_ENABLED } from "./personReplacementCapabilities.js";
import { getPersonReplacementIdentityCorrectionDraftKey, resolvePersonReplacementDetectionLabel } from "./personReplacementSourceIdentity.js";
const PERSON_REPLACEMENT_ORIENTATION_LABELS = Object.freeze({
  front: "正面",
  back: "背面",
  side: "侧面",
  left_profile: "左侧面",
  right_profile: "右侧面",
  three_quarter_left: "左前侧",
  three_quarter_right: "右前侧",
  over_shoulder_left: "左过肩",
  over_shoulder_right: "右过肩",
  unknown: "待确认"
});
function escapeHtml(_0xab89cc) {
  return String(_0xab89cc ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x5e318f, _0x1b925b = "") {
  const _0x3b052f = String(_0x5e318f ?? "").trim();
  return _0x3b052f || _0x1b925b;
}
function normalizeMediaUrl(_0x160555) {
  const _0x31642b = normalizeText(_0x160555);
  if (_0x31642b) {
    return localPathToUrl(_0x31642b) || _0x31642b;
  } else {
    return "";
  }
}
function formatPersonOrientation(_0x3c63bc) {
  return PERSON_REPLACEMENT_ORIENTATION_LABELS[normalizeText(_0x3c63bc)] || PERSON_REPLACEMENT_ORIENTATION_LABELS.unknown;
}
function getCharacterAppearance(_0x3b0d14, _0x22ab1a = "") {
  const _0x40dd54 = getWorkspaceAssetAppearances(_0x3b0d14);
  return _0x40dd54.find(_0xe11882 => _0xe11882.id === _0x22ab1a) || getWorkspaceAssetBaseAppearance(_0x3b0d14) || _0x40dd54[0] || null;
}
function normalizeProjectAssetMediaForRender(_0x5b6c4b = {}) {
  return {
    ..._0x5b6c4b,
    appearances: getWorkspaceAssetAppearances(_0x5b6c4b).map(_0x229f8b => ({
      ..._0x229f8b,
      imageUrl: normalizeMediaUrl(_0x229f8b.imageUrl),
      referenceImageUrl: normalizeMediaUrl(_0x229f8b.referenceImageUrl)
    }))
  };
}
function renderPersonReplacementVoiceReferenceStatus(_0x264069 = {}, _0x1e18aa = "") {
  const _0x5089c7 = normalizeMediaUrl(_0x264069.voiceReference?.audioUrl || _0x264069.voiceReference?.localPath || _0x264069.voiceRef);
  const _0x252685 = Boolean(_0x5089c7);
  return "<span class=\"person-replacement-target-voice-status" + (_0x1e18aa ? " " + escapeHtml(_0x1e18aa) : "") + " " + (_0x252685 ? "has-reference" : "is-missing") + "\"><i aria-hidden=\"true\"></i>" + (_0x252685 ? "有声音参考" : "无声音参考") + "</span>";
}
function renderPersonDetectionPicker({
  kind: _0xcc569b,
  value: _0x46c888,
  label: _0x68aaac,
  ariaLabel: _0x92b3a4,
  customInputValue = "",
  sourceCharacterId = ""
} = {}) {
  const _0xabc758 = normalizeText(_0x46c888);
  const _0x5299c9 = normalizeText(_0x68aaac, "请选择");
  const _0x654161 = _0xcc569b === "label";
  const _0x1d13d7 = _0x654161 ? "data-person-replacement-person-label" : _0xcc569b === "scope" ? "data-person-replacement-person-scope" : "data-person-replacement-person-orientation";
  return "<span class=\"person-replacement-detection-picker is-" + escapeHtml(_0xcc569b) + "\" data-person-replacement-detection-picker=\"" + escapeHtml(_0xcc569b) + "\">\n    <button type=\"button\" class=\"person-replacement-detection-picker-trigger\" data-person-replacement-action=\"toggle-detection-picker\" data-person-replacement-detection-picker-trigger=\"" + escapeHtml(_0xcc569b) + "\" " + _0x1d13d7 + " value=\"" + escapeHtml(_0xabc758) + "\"" + (_0x654161 ? " data-person-replacement-selected-source-character-id=\"" + escapeHtml(sourceCharacterId) + "\"" : "") + " aria-label=\"" + escapeHtml(_0x92b3a4) + "\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n      <span data-person-replacement-detection-picker-value>" + escapeHtml(_0x5299c9) + "</span><span class=\"story-project-sort-chevron\" aria-hidden=\"true\"></span>\n    </button>\n    " + (_0x654161 ? "<input type=\"text\" class=\"person-replacement-detection-name-input\" value=\"" + escapeHtml(customInputValue || _0x5299c9) + "\" maxlength=\"24\" placeholder=\"输入人物名称\" aria-label=\"自定义人物名称\" data-person-replacement-person-custom-label hidden>" : "") + "\n    <div class=\"story-project-sort-menu person-replacement-detection-picker-menu\" data-person-replacement-detection-picker-menu data-person-replacement-picker-options-lazy=\"true\" role=\"listbox\" aria-label=\"" + escapeHtml(_0x92b3a4) + "选项\" aria-hidden=\"true\"></div>\n  </span>";
}
function renderPersonDetectionPickerOptions(_0x671ae9 = [], _0xb9a1a5 = "") {
  const _0x2fe39e = normalizeText(_0xb9a1a5);
  return (Array.isArray(_0x671ae9) ? _0x671ae9 : []).map(_0x5e0684 => {
    const _0x336010 = normalizeText(_0x5e0684?.value);
    const _0x3a8cf8 = normalizeText(_0x5e0684?.label, _0x336010);
    const _0x4a4b92 = _0x336010 === _0x2fe39e;
    const _0x5ae56e = _0x5e0684?.deletable ? "<button type=\"button\" class=\"person-replacement-detection-picker-option-delete\" data-person-replacement-action=\"delete-detection-custom-label\" data-person-replacement-custom-label=\"" + escapeHtml(_0x336010) + "\" aria-label=\"删除自定义名称" + escapeHtml(_0x3a8cf8) + "\"><span class=\"person-replacement-detection-picker-delete-mark\" aria-hidden=\"true\">×</span></button>" : "";
    const _0x543654 = _0x5e0684?.sourceCharacterId ? " data-person-replacement-source-character-id=\"" + escapeHtml(_0x5e0684.sourceCharacterId) + "\"" : "";
    return "<span class=\"person-replacement-detection-picker-option-row" + (_0x5e0684?.deletable ? " is-deletable" : "") + "\"><button type=\"button\" class=\"story-project-sort-option" + (_0x4a4b92 ? " is-selected" : "") + "\" data-person-replacement-action=\"select-detection-picker-option\" data-person-replacement-detection-picker-option=\"" + escapeHtml(_0x336010) + "\"" + _0x543654 + " role=\"option\" aria-selected=\"" + _0x4a4b92 + "\"><span>" + escapeHtml(_0x3a8cf8) + "</span></button>" + _0x5ae56e + "</span>";
  }).join("");
}
function renderPersonMappingScopeMenu({
  personLabel = "当前人物",
  targetName = "目标人物",
  appearanceName = "当前形象"
} = {}) {
  return "<div class=\"person-replacement-mapping-scope-menu\" data-person-replacement-mapping-scope-menu role=\"menu\" aria-label=\"选择人物形象应用范围\">\n    <div class=\"person-replacement-mapping-scope-heading\">\n      <strong>" + escapeHtml(personLabel) + " 已有绑定</strong>\n      <small>" + escapeHtml(targetName) + " · " + escapeHtml(appearanceName) + "</small>\n    </div>\n    <button type=\"button\" class=\"person-replacement-mapping-scope-option\" data-person-replacement-action=\"confirm-person-mapping-scope\" data-person-replacement-mapping-scope=\"current\" role=\"menuitem\">\n      <span class=\"person-replacement-mapping-scope-option-copy\">\n        <span class=\"person-replacement-mapping-scope-option-title\">仅当前片段</span>\n        <small class=\"person-replacement-mapping-scope-option-subtitle\">只替换这个片段中的人物形象</small>\n      </span>\n    </button>\n    <button type=\"button\" class=\"person-replacement-mapping-scope-option\" data-person-replacement-action=\"confirm-person-mapping-scope\" data-person-replacement-mapping-scope=\"all\" role=\"menuitem\">\n      <span class=\"person-replacement-mapping-scope-option-copy\">\n        <span class=\"person-replacement-mapping-scope-option-title\">应用全部片段</span>\n        <small class=\"person-replacement-mapping-scope-option-subtitle\">同步替换该人物在所有片段中的形象</small>\n      </span>\n    </button>\n  </div>";
}
function hasTargetAssetBinding(_0x5bcc25, _0x3fdd04) {
  const _0x2bccb7 = Array.isArray(_0x3fdd04?.referenceImages) ? _0x3fdd04.referenceImages : [];
  return _0x2bccb7.some(_0x174ace => _0x174ace.role === "target-character" && _0x174ace.targetCharacterId === _0x5bcc25.id);
}
function renderTargetAssetGroup(_0x2c76a6, _0x5f376c, _0x785be6) {
  const _0x196528 = _0x5f376c === "scene";
  const _0x215ee8 = _0x196528 ? _0x2c76a6.scenes : _0x2c76a6.characters;
  const _0x5140b5 = _0x215ee8.map(normalizeProjectAssetMediaForRender);
  const _0x2172ce = {
    ...buildPersonReplacementAssetViewState({
      ..._0x2c76a6,
      characters: _0x196528 ? _0x2c76a6.characters : _0x5140b5,
      scenes: _0x196528 ? _0x5140b5 : _0x2c76a6.scenes,
      workspace: {
        ..._0x2c76a6.workspace,
        characterAssetTab: _0x5f376c
      }
    }),
    allowDeleteAssetCard: false,
    allowAssetRename: false,
    assetSelectionMode: false,
    selectedAssetIds: []
  };
  const _0x133346 = _0x5140b5.map(_0x20b6bf => {
    const _0x1c71e4 = getWorkspaceAssetAppearances(_0x20b6bf);
    const _0x4a56d5 = _0x1c71e4.filter(_0x2e1d18 => _0x2e1d18.imageUrl);
    const _0x2719ce = Math.max(0, Math.min(_0x1c71e4.length - 1, Math.trunc(Number(_0x2c76a6.workspace.assetAppearanceIndexes?.[_0x20b6bf.id]) || 0)));
    const _0x589f2f = _0x1c71e4[_0x2719ce]?.id;
    const _0x354c75 = Math.max(0, _0x4a56d5.findIndex(_0x1dce33 => _0x1dce33.id === _0x589f2f));
    return {
      asset: _0x20b6bf,
      appearances: _0x4a56d5,
      appearance: _0x4a56d5[_0x354c75] || null,
      selectedIndex: _0x354c75
    };
  }).filter(_0x523c7d => _0x523c7d.appearance);
  const _0x46fb2a = _0x133346.map(({
    asset: _0x2d6379,
    appearances: _0x2b53d4,
    appearance: _0x38d039,
    selectedIndex: _0x1e8d60
  }) => {
    if (_0x196528) {
      return renderPersonReplacementAssetCard(_0x2172ce, _0x2d6379, {
        previewAppearance: _0x38d039,
        statusText: "场景图 " + (_0x1e8d60 + 1) + "/" + _0x2b53d4.length,
        draggable: true,
        cardClassName: "person-replacement-target-asset person-replacement-scene-reference-asset",
        cardAttributes: "data-person-replacement-replacement-asset-kind=\"scene\" data-person-replacement-target-scene-id=\"" + escapeHtml(_0x2d6379.id) + "\" data-person-replacement-target-scene-appearance-id=\"" + escapeHtml(_0x38d039.id) + "\" aria-label=\"" + escapeHtml("拖拽" + _0x2d6379.name + "到首帧画面作为场景参考") + "\"",
        shellClassName: "person-replacement-target-asset-shell"
      });
    }
    const _0x347a62 = _0x2b53d4.length > 1;
    const _0x8499a5 = _0x347a62 ? "<span class=\"person-replacement-target-appearance-controls\" data-person-replacement-target-controls=\"" + escapeHtml(_0x2d6379.id) + "\" data-story-asset-hover-id=\"" + escapeHtml(_0x2d6379.id) + "\">" + renderPersonReplacementPreviewArrow("previous", {
      action: "target-previous-appearance",
      label: _0x2d6379.name + "上一个形象",
      className: "person-replacement-target-appearance-arrow"
    }) + renderPersonReplacementPreviewArrow("next", {
      action: "target-next-appearance",
      label: _0x2d6379.name + "下一个形象",
      className: "person-replacement-target-appearance-arrow"
    }) + "</span>" : "";
    const _0x23111c = hasTargetAssetBinding(_0x2d6379, _0x785be6);
    return renderPersonReplacementAssetCard(_0x2172ce, _0x2d6379, {
      previewAppearance: _0x38d039,
      statusText: "形象 " + (_0x1e8d60 + 1) + "/" + _0x2b53d4.length,
      cardMetaHtml: renderPersonReplacementVoiceReferenceStatus(_0x2d6379),
      draggable: true,
      cardClassName: "person-replacement-target-asset" + (_0x23111c ? " has-person-replacement-input" : ""),
      cardAttributes: "data-person-replacement-target-character-id=\"" + escapeHtml(_0x2d6379.id) + "\" data-person-replacement-target-appearance-id=\"" + escapeHtml(_0x38d039.id) + "\" data-person-replacement-target-appearance-index=\"" + _0x1e8d60 + "\" data-person-replacement-target-appearance-count=\"" + _0x2b53d4.length + "\" data-person-replacement-target-appearance-wheel=\"" + _0x347a62 + "\" aria-label=\"拖拽" + escapeHtml(_0x2d6379.name) + "的" + escapeHtml(_0x38d039.name) + "到视频人物框\"",
      shellClassName: "person-replacement-target-asset-shell",
      accessoryHtml: _0x8499a5
    });
  }).join("");
  if (_0x196528 && !_0x46fb2a) {
    return "";
  }
  const _0x183354 = _0x196528 ? "场景" : "角色";
  const _0x132ff5 = "请先在素材设定上传基础形象";
  return "<div class=\"person-replacement-target-asset-group\" data-person-replacement-target-asset-group=\"" + _0x5f376c + "\" role=\"group\" aria-labelledby=\"person-replacement-target-asset-group-" + _0x5f376c + "\">\n    <h3 class=\"person-replacement-target-asset-group-heading\" id=\"person-replacement-target-asset-group-" + _0x5f376c + "\">" + _0x183354 + "：</h3>\n    <div class=\"person-replacement-target-asset-group-items\">" + (_0x46fb2a || "<p class=\"person-replacement-inline-empty\">" + _0x132ff5 + "</p>") + "</div>\n  </div>";
}
function renderTargetAssetRail(_0x1dc045, _0x25a441) {
  const _0x6e1532 = _0x25a441?.promptPackage || null;
  return "<aside class=\"person-replacement-target-assets\">\n    <div class=\"person-replacement-target-assets-heading\">\n      <strong>替换素材</strong>\n      <small>拖拽角色到首帧人物框；拖拽场景到首帧画面</small>\n    </div>\n    <div class=\"person-replacement-target-asset-list\">\n      " + renderTargetAssetGroup(_0x1dc045, "character", _0x6e1532) + "\n      " + renderTargetAssetGroup(_0x1dc045, "scene", _0x6e1532) + "\n    </div>\n  </aside>";
}
function renderVideoReplacementReferenceRail(_0x376540, _0xc358a5) {
  const _0x11263f = _0xc358a5?.shot || null;
  const _0x447472 = _0xc358a5?.imageInput || {};
  const _0x1cdd85 = Array.isArray(_0x447472.referenceOptions) ? _0x447472.referenceOptions : [];
  const _0x5f443a = Math.max(0, Math.min(_0x1cdd85.length - 1, Math.trunc(Number(_0x447472.activeReferenceIndex) || 0)));
  const _0x293e15 = _0x447472.mode === PERSON_REPLACEMENT_VIDEO_INPUT_MODE_CHARACTER_REFERENCE;
  const _0x3c3f55 = _0x293e15 ? "包含当前图像替换结果与当前镜头的角色绑定图" : "来自图像替换界面的当前结果";
  const _0x30b04b = _0x1cdd85.map((_0x51af94, _0xff83f9) => {
    const _0x37a13f = _0x51af94.kind === PERSON_REPLACEMENT_VIDEO_REFERENCE_KIND_CHARACTER_IMAGE;
    const _0x46401c = _0x51af94.reference || {};
    const _0x5903d7 = _0x37a13f ? normalizeText(_0x46401c.characterName) || "人物参考图" : "替换首帧 1";
    const _0x1cb2bb = _0x37a13f ? "角色绑定图 · " + (normalizeText(_0x46401c.appearanceName) || "基础形象") : "图像替换结果";
    const _0xecb219 = normalizeMediaUrl(_0x51af94.imageRef);
    const _0xfa65b3 = _0xff83f9 === _0x5f443a;
    const _0x348de6 = _0xecb219 ? " data-story-asset-hover-id=\"" + escapeHtml(_0x11263f?.id || "") + "\" data-person-replacement-video-reference-hover-preview=\"true\"" : "";
    return "<button type=\"button\" class=\"person-replacement-video-reference-card " + (_0xfa65b3 ? "is-selected" : "") + "\" data-story-action=\"select-video-shot-reference\" data-shot-id=\"" + escapeHtml(_0x11263f?.id || "") + "\" data-person-replacement-video-reference-index=\"" + _0xff83f9 + "\"" + _0x348de6 + " aria-pressed=\"" + _0xfa65b3 + "\" aria-label=\"" + escapeHtml("选择" + _0x5903d7 + "作为视频替换参考图") + "\">\n      <span class=\"person-replacement-video-reference-media\">" + (_0xecb219 ? "<img src=\"" + escapeHtml(_0xecb219) + "\" alt=\"" + escapeHtml(_0x5903d7) + "\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">" : "") + "</span>\n      <span class=\"person-replacement-video-reference-copy\"><strong>" + escapeHtml(_0x5903d7) + "</strong><small>" + escapeHtml(_0x1cb2bb) + "</small></span>\n      <span class=\"person-replacement-video-reference-selection\" aria-hidden=\"true\">" + (_0xfa65b3 ? "当前" : "") + "</span>\n    </button>";
  }).join("");
  const _0x40d733 = _0x293e15 ? "请先在图像替换中生成替换首帧并绑定一个角色" : "请先在图像替换中生成替换首帧";
  const _0x340441 = _0x293e15 && Array.isArray(_0x447472.references) && _0x447472.references.length > 1 ? "<p class=\"person-replacement-reference-note\">人物参考图模式当前仅支持单个人物替换。</p>" : "";
  return "<aside class=\"person-replacement-target-assets person-replacement-video-reference-assets\">\n    <div class=\"person-replacement-target-assets-heading\"><strong>替换参考图</strong><small>" + escapeHtml(_0x3c3f55) + "</small></div>\n    <div class=\"person-replacement-target-asset-list person-replacement-video-reference-list\" data-person-replacement-video-reference-list tabindex=\"0\">" + (_0x30b04b || "<p class=\"person-replacement-inline-empty\">" + escapeHtml(_0x40d733) + "</p>") + _0x340441 + "</div>\n  </aside>";
}
function renderDetectionBox(_0x3e5013, _0x504a44, _0xba886d, {
  duplicateRoleLabels = new Set()
} = {}) {
  const _0x341768 = _0x3e5013.locator?.bbox || _0x3e5013.bbox;
  if (!_0x341768) {
    return "";
  }
  const _0x43cf08 = _0x3e5013.detectionMethod === "manual";
  const _0x446f43 = normalizeText(_0xba886d.workspace.selectedShotId);
  const _0x3f0776 = getPersonReplacementIdentityCorrectionDraftKey(_0x446f43, _0x3e5013.id);
  const _0x4f95c2 = _0xba886d.workspace.identityCorrectionDrafts[_0x3f0776] || {};
  const _0x1d0357 = _0xba886d.characters.find(_0x326d37 => _0x326d37.id === _0x3e5013.targetCharacterId);
  const _0x3a6a9f = _0x1d0357 ? getCharacterAppearance(_0x1d0357, _0x3e5013.targetAppearanceId) : null;
  const _0x1fe706 = _0x3e5013.identityReviewStatus === "needs_review" || _0x3e5013.identityReviewRequired === true;
  const _0x29a24d = Object.keys(_0x4f95c2).length > 0;
  const _0xbec896 = normalizeText(_0x4f95c2.orientation, normalizeText(_0x3e5013.orientation));
  const _0x45b374 = formatPersonOrientation(_0xbec896);
  const _0x20ebee = resolvePersonReplacementDetectionLabel(_0x3e5013, _0x504a44, _0xba886d, _0x446f43);
  const _0x3530f7 = duplicateRoleLabels.has(_0x20ebee);
  const _0x48323a = normalizeText(_0x4f95c2.sourceCharacterId, normalizeText(_0x3e5013.sourceCharacterId));
  const _0x46fa36 = _0x3530f7 ? "角色名重复" : _0x1d0357 ? "已绑定" : "未绑定";
  const _0x3e673c = PERSON_REPLACEMENT_ORIENTATIONS.includes(_0xbec896) && _0xbec896 !== "unknown" ? _0xbec896 : "";
  const _0x49e7f9 = normalizePersonReplacementScope(_0x3e5013.replacementScope);
  const _0x20176a = formatPersonReplacementScopeLabel(_0x49e7f9);
  const _0x1ce9c7 = _0x1fe706 || _0x29a24d || PERSON_REPLACEMENT_ORIENTATION_ENABLED && !_0x3e673c;
  const _0x2a3719 = PERSON_REPLACEMENT_ORIENTATION_ENABLED ? "<span class=\"person-replacement-detection-separator\" aria-hidden=\"true\">·</span>" + renderPersonDetectionPicker({
    kind: "orientation",
    value: _0x3e673c,
    label: _0x3e673c ? _0x45b374 : "选择朝向",
    ariaLabel: "人物朝向：" + (_0x3e673c ? _0x45b374 : "待选择")
  }) : "";
  const _0x815e96 = "<span class=\"person-replacement-detection-separator\" aria-hidden=\"true\">·</span>" + renderPersonDetectionPicker({
    kind: "scope",
    value: _0x49e7f9,
    label: _0x20176a,
    ariaLabel: "替换范围：" + _0x20176a
  });
  const _0x485b31 = !_0x1d0357 ? "is-unready" : _0x1ce9c7 ? "is-partially-ready" : "is-ready";
  const _0x2edc56 = "" + renderPersonDetectionPicker({
    kind: "label",
    value: _0x20ebee,
    label: _0x20ebee,
    ariaLabel: "人物名称：" + _0x20ebee,
    customInputValue: _0x20ebee,
    sourceCharacterId: _0x48323a
  }) + _0x815e96 + _0x2a3719 + "<span class=\"person-replacement-detection-separator\" aria-hidden=\"true\">·</span><span class=\"person-replacement-detection-binding-status " + (_0x3530f7 ? "is-conflict" : _0x1d0357 ? "is-bound" : "is-unbound") + "\">" + _0x46fa36 + "</span>";
  const _0x40e10b = _0x1d0357 && _0x3a6a9f?.imageUrl ? " data-story-asset-hover-id=\"" + escapeHtml(_0x1d0357.id) + "\" data-story-asset-hover-appearance-id=\"" + escapeHtml(_0x3a6a9f.id) + "\"" : "";
  const _0x3d5c91 = "<button type=\"button\" class=\"story-action-icon-button is-danger person-replacement-detection-delete-action\" data-person-replacement-action=\"delete-person\" data-shot-id=\"" + escapeHtml(_0xba886d.workspace.selectedShotId) + "\" data-person-id=\"" + escapeHtml(_0x3e5013.id) + "\" aria-label=\"删除" + escapeHtml(_0x20ebee) + "检测框\"><span class=\"person-replacement-detection-delete-mark\" aria-hidden=\"true\">×</span></button>";
  const _0x3b1fbf = ["n", "e", "s", "w", "nw", "ne", "sw", "se"].map(_0x35f8d8 => "<span class=\"person-replacement-manual-resize-handle is-" + _0x35f8d8 + "\" data-person-replacement-manual-resize=\"" + _0x35f8d8 + "\" aria-hidden=\"true\"></span>").join("");
  const _0x5a53ab = _0x43cf08 ? " data-person-replacement-manual-person tabindex=\"0\" aria-keyshortcuts=\"Delete D\"" : " tabindex=\"0\" aria-keyshortcuts=\"Delete D\"";
  const _0x4ac88a = "<svg class=\"person-replacement-detection-readiness-border\" width=\"100%\" height=\"100%\" aria-hidden=\"true\" focusable=\"false\"><rect class=\"person-replacement-detection-readiness-stroke\"></rect></svg>";
  return "<div class=\"person-replacement-detection-box has-identity-controls is-movable " + (_0x1d0357 ? "is-mapped" : "") + " " + (_0x1fe706 ? "needs-identity-review" : "") + " " + (_0x1ce9c7 ? "is-identity-editing" : "") + " " + _0x485b31 + " " + (_0x43cf08 ? "is-manual" : "") + " " + (_0x3530f7 ? "has-role-conflict" : "") + "\" style=\"--box-x:" + _0x341768.x * 100 + "%;--box-y:" + _0x341768.y * 100 + "%;--box-width:" + _0x341768.width * 100 + "%;--box-height:" + _0x341768.height * 100 + "%\" data-person-replacement-person-drop" + _0x40e10b + _0x5a53ab + " data-person-id=\"" + escapeHtml(_0x3e5013.id) + "\" data-shot-id=\"" + escapeHtml(_0x446f43) + "\" aria-label=\"" + escapeHtml(_0x3530f7 ? _0x20ebee + "，角色名重复" : _0x20ebee) + "\"" + (_0x3530f7 ? " aria-invalid=\"true\"" : "") + ">" + _0x4ac88a + "<div class=\"person-replacement-detection-label\"><span class=\"person-replacement-detection-summary\">" + _0x2edc56 + "</span><span class=\"person-replacement-detection-actions\">" + _0x3d5c91 + "</span></div>" + (_0x1d0357 ? "<div class=\"person-replacement-mapping-badge\"><span class=\"person-replacement-mapping-badge-text\">→ " + escapeHtml(_0x1d0357.name) + " · " + escapeHtml(_0x3a6a9f?.name || "基础形象") + "</span><button type=\"button\" class=\"story-action-icon-button is-danger story-project-delete-trigger person-replacement-mapping-remove person-replacement-detection-delete-action\" data-person-replacement-action=\"clear-person-mapping\" data-shot-id=\"" + escapeHtml(_0x446f43) + "\" data-person-id=\"" + escapeHtml(_0x3e5013.id) + "\" aria-label=\"取消" + escapeHtml(_0x20ebee) + "的人物配置\"><span class=\"person-replacement-detection-delete-mark\" aria-hidden=\"true\">×</span></button></div>" : "<div class=\"person-replacement-mapping-badge\">拖入目标形象</div>") + _0x3b1fbf + "</div>";
}
function renderVideoReplacementReferenceInputs(_0x3eab42) {
  const _0x3040df = _0x3eab42?.slotState || {};
  const {
    fixedInputConfig: _0x1b0380
  } = _0x3040df;
  if (!_0x1b0380?.visibleSlots?.length) {
    return "";
  }
  const _0x4bd8fa = Object.fromEntries(Object.entries(_0x3040df.inputsBySlot).map(([_0x47d7d6, _0x766b64]) => [_0x47d7d6, {
    ..._0x766b64,
    url: normalizeMediaUrl(_0x766b64.url),
    thumbUrl: normalizeMediaUrl(_0x766b64.thumbUrl)
  }]));
  return renderVideoReferenceBarMarkup({
    fixedInputConfig: _0x1b0380,
    inputsBySlot: _0x4bd8fa,
    readOnlyFixedInputSlots: _0x3040df.readOnlySlots,
    showItemTitles: false,
    attachmentButtonHtml: ""
  });
}
function renderPromptReferenceInputs(_0x10c358, _0x204ae3) {
  const _0x438351 = Array.isArray(_0x204ae3?.referenceImages) ? _0x204ae3.referenceImages : [];
  if (!_0x438351.length) {
    return "";
  }
  const _0x276a6d = new Map(_0x10c358.characters.map(_0x59a7ec => [_0x59a7ec.id, _0x59a7ec]));
  const _0x359f3f = new Map(_0x10c358.scenes.map(_0x2bd832 => [_0x2bd832.id, _0x2bd832]));
  const _0x197542 = _0x438351.map(_0x42c2e1 => {
    const _0x4571e3 = Math.max(1, Number(_0x42c2e1.slot) || 1);
    const _0x4a0181 = _0x276a6d.get(_0x42c2e1.targetCharacterId);
    const _0x475470 = _0x359f3f.get(_0x42c2e1.targetSceneId);
    const _0x159055 = _0x42c2e1.role === "source-keyframe" ? "图" + _0x4571e3 + " · 当前首帧" : _0x42c2e1.role === "person-location-guide" ? "图" + _0x4571e3 + " · A–H 定位图" : _0x42c2e1.role === "target-scene" ? "图" + _0x4571e3 + " · 场景 · " + (_0x475470?.name || "场景参考") : "图" + _0x4571e3 + " · " + (_0x4a0181?.name || "目标形象");
    const _0x35a712 = _0x42c2e1.role === "target-character";
    const _0x4b9a6d = _0x42c2e1.role === "target-scene";
    return {
      kind: "image",
      slotId: "image-" + _0x4571e3,
      name: _0x159055,
      url: normalizeMediaUrl(_0x42c2e1.ref),
      removeAction: _0x35a712 ? "clear-person-replacement-target" : _0x4b9a6d ? "clear-person-replacement-scene-reference" : "",
      removeValue: _0x35a712 ? JSON.stringify({
        shotId: _0x10c358.workspace.selectedShotId,
        targetCharacterId: _0x42c2e1.targetCharacterId,
        targetAppearanceId: _0x42c2e1.targetAppearanceId
      }) : _0x4b9a6d ? JSON.stringify({
        shotId: _0x10c358.workspace.selectedShotId
      }) : ""
    };
  });
  return "<div class=\"person-replacement-prompt-reference-inputs\" aria-label=\"图像生成入参\">" + renderVideoReferenceBarMarkup({
    readOnlyInputs: _0x197542,
    showItemTitles: false,
    attachmentButtonHtml: ""
  }) + "</div>";
}
export function createPersonReplacementIdentityPresentation() {
  return Object.freeze({
    buildImage(_0x42c8d5, _0x5b0752, {
      people = [],
      duplicateRoleLabels = new Set()
    } = {}) {
      const _0x51ec8b = Array.isArray(people) ? people : [];
      return Object.freeze({
        targetAssetRailHtml: renderTargetAssetRail(_0x42c8d5, _0x5b0752),
        detectionBoxesHtml: _0x51ec8b.map((_0x3324e8, _0x515eb9) => renderDetectionBox(_0x3324e8, _0x515eb9, _0x42c8d5, {
          duplicateRoleLabels: duplicateRoleLabels
        })).join(""),
        promptReferenceInputsHtml: renderPromptReferenceInputs(_0x42c8d5, _0x5b0752?.promptPackage)
      });
    },
    buildVideo(_0x2fd7ab, _0x431f5b) {
      return Object.freeze({
        referenceRailHtml: renderVideoReplacementReferenceRail(_0x2fd7ab, _0x431f5b),
        referenceInputsHtml: renderVideoReplacementReferenceInputs(_0x431f5b)
      });
    },
    renderOverlay(_0x5281fd, _0x598158 = {}) {
      if (_0x5281fd === "picker-options") {
        return renderPersonDetectionPickerOptions(_0x598158.options, _0x598158.selectedValue);
      }
      if (_0x5281fd === "mapping-scope") {
        return renderPersonMappingScopeMenu(_0x598158);
      }
      return "";
    }
  });
}