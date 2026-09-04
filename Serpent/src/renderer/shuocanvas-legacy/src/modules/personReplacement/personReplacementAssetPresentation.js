import { renderAIGenImageModelSelectorMarkup } from "../../components/aigenImage/modelSelector.js";
import { renderAudioPlaybackSurface } from "../../components/audio-node/audioPlaybackSurface.js";
import { getWorkspaceAssetAppearanceStats, getWorkspaceAssetAppearances, getWorkspaceAssetBaseAppearance } from "../workspaceAssetAppearance.js";
import { renderWorkspaceAssetCard, renderWorkspaceAssetLoadingOverlay, renderWorkspaceCardDeleteControl, renderWorkspacePreviewArrow } from "../workspaceAssetPresentation.js";
import { renderWorkspaceActionIcon } from "../workspaceActionIcons.js";
import { renderWorkspaceImageDownloadButton } from "../workspaceImageDownload.js";
import { PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS } from "./personReplacementImageGeneration.js";
import { PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID } from "./personReplacementProject.js";
import { getPersonReplacementAudioSavedName, getPersonReplacementLibraryAudioRef } from "./personReplacementVoiceLibrary.js";
function normalizeText(_0x49c3f0) {
  return String(_0x49c3f0 ?? "").trim();
}
function escapeHtml(_0x56acca) {
  return String(_0x56acca ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
export function buildPersonReplacementAssetViewState(_0x1b80e5) {
  const _0x4d113f = ["character", "scene", "audio", "library"].includes(_0x1b80e5.workspace.characterAssetTab) ? _0x1b80e5.workspace.characterAssetTab : "character";
  const _0x5ef590 = _0x4d113f === "library";
  const _0x14c16e = _0x4d113f === "scene";
  const _0x210915 = _0x4d113f === "audio";
  const _0xe0b4b5 = _0x5ef590 ? _0x1b80e5.libraryAssets : _0x210915 ? _0x1b80e5.audioAssets : _0x14c16e ? _0x1b80e5.scenes : _0x1b80e5.characters;
  const _0x48d488 = _0x5ef590 ? _0x1b80e5.workspace.selectedLibraryAssetId : _0x210915 ? _0x1b80e5.workspace.selectedAudioAssetId : _0x14c16e ? _0x1b80e5.workspace.selectedSceneId : _0x1b80e5.workspace.selectedCharacterId;
  const _0x3c10b2 = _0xe0b4b5.find(_0x1ca0a9 => _0x1ca0a9.id === _0x48d488) || _0xe0b4b5[0] || null;
  return {
    data: {
      assets: _0xe0b4b5,
      project: {}
    },
    assetFilter: _0x4d113f,
    selectedAssetId: _0x3c10b2?.id || "",
    selectedAssetIds: _0x210915 ? [] : _0x1b80e5.workspace.selectedAssetIds,
    assetSelectionMode: _0x210915 ? false : _0x1b80e5.workspace.assetSelectionMode,
    assetAppearanceIndexes: _0x1b80e5.workspace.assetAppearanceIndexes,
    assetAppearanceMotion: "",
    assetSplitRatio: _0x1b80e5.workspace.assetSplitRatio,
    generatingAppearanceKeys: _0x1b80e5.workspace.generatingAppearanceKeys,
    isBatchGenerating: false,
    batchGeneratingAssetIds: [],
    batchGeneratingAppearanceKeys: [],
    characterVoiceEditor: null,
    characterVoicePanelMotion: "",
    models: {
      image: _0x1b80e5.settings.characterImageModelId || PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID
    },
    imageProvider: _0x1b80e5.settings.characterImageProvider || "apimart",
    imageGenerationParams: _0x1b80e5.settings.characterImageGenerationParams || {},
    imageGenerationParamsByModel: _0x1b80e5.settings.characterImageGenerationParamsByModel || {},
    imageProviderProfileId: _0x1b80e5.settings.characterImageProviderProfileId || "",
    imageProviderProfileIdByModel: _0x1b80e5.settings.characterImageProviderProfileIdByModel || {},
    assetVoiceUploadLabel: "添加声音",
    allowDeleteAssetAppearance: !_0x14c16e && !_0x210915,
    allowDeleteAssetCard: !_0x5ef590,
    allowAssetRename: !_0x5ef590 && !_0x14c16e && !_0x210915,
    allowAssetStyleReference: false,
    hideAssetRoleTag: true,
    hideAssetNameTooltip: true,
    assetGenerateLabel: "生成",
    assetPromptPresetId: _0x1b80e5.workspace.assetPromptPresetId,
    assetPromptPresets: PERSON_REPLACEMENT_CHARACTER_ASSET_PROMPT_PRESETS,
    assetPromptPresetLabel: "图1 人设参考"
  };
}
function renderPromptText(_0x390ecb) {
  return escapeHtml(_0x390ecb).replace(/\r\n?|\n/g, "<br>");
}
export function readPersonReplacementAssetPromptText(_0x9751f2 = null) {
  if (!_0x9751f2) {
    return "";
  }
  const _0x264ee2 = [];
  const _0x481564 = _0x565a7c => {
    if (_0x565a7c) {
      _0x264ee2.push(String(_0x565a7c));
    }
  };
  const _0x584a6f = (_0x52a8fb, {
    root = false
  } = {}) => {
    const _0x19065a = Number(_0x52a8fb?.nodeType);
    if (_0x19065a === 3) {
      _0x481564(_0x52a8fb.textContent || "");
      return;
    }
    if (_0x19065a !== 1 && !root) {
      return;
    }
    const _0x5bc08d = String(_0x52a8fb?.tagName || "").toUpperCase();
    if (_0x5bc08d === "BR") {
      _0x481564("\n");
      return;
    }
    const _0x5c8168 = !root && ["DIV", "P"].includes(_0x5bc08d);
    if (_0x5c8168 && _0x264ee2.length && !_0x264ee2.at(-1).endsWith("\n")) {
      _0x481564("\n");
    }
    Array.from(_0x52a8fb?.childNodes || []).forEach(_0x5b136f => _0x584a6f(_0x5b136f));
    if (_0x5c8168 && _0x264ee2.length && !_0x264ee2.at(-1).endsWith("\n")) {
      _0x481564("\n");
    }
  };
  _0x584a6f(_0x9751f2, {
    root: true
  });
  return _0x264ee2.join("").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").replace(/\n$/g, "");
}
function getSelectedAppearanceIndex(_0x1a1f79 = {}, _0xad17d9 = {}) {
  const _0x38b1b7 = getWorkspaceAssetAppearances(_0xad17d9);
  if (!_0x38b1b7.length) {
    return 0;
  }
  const _0x5b1762 = Math.trunc(Number(_0x1a1f79?.assetAppearanceIndexes?.[_0xad17d9.id]) || 0);
  return Math.max(0, Math.min(_0x38b1b7.length - 1, _0x5b1762));
}
function getSelectedAppearance(_0x2e63bb = {}, _0x469a71 = {}) {
  const _0xf2cd3d = getWorkspaceAssetAppearances(_0x469a71);
  return _0xf2cd3d[getSelectedAppearanceIndex(_0x2e63bb, _0x469a71)] || getWorkspaceAssetBaseAppearance(_0x469a71) || _0xf2cd3d[0] || null;
}
function isAppearanceGenerating(_0x5c1bee = {}, _0x10260c = {}, _0x1ac843 = {}) {
  if (normalizeText(_0x1ac843?.error) || normalizeText(_0x1ac843?.imageUrl)) {
    return false;
  }
  const _0x214c67 = normalizeText(_0x10260c?.id) + ":" + normalizeText(_0x1ac843?.id);
  return Boolean(_0x214c67 !== ":" && (_0x5c1bee?.generatingAppearanceKeys?.includes?.(_0x214c67) || _0x5c1bee?.isBatchGenerating === true && _0x5c1bee?.batchGeneratingAppearanceKeys?.includes?.(_0x214c67)));
}
function isAssetGenerating(_0x564717 = {}, _0x13baa5 = {}) {
  const _0x43f684 = normalizeText(_0x13baa5?.id);
  if (!_0x43f684) {
    return false;
  }
  if (_0x564717?.isBatchGenerating === true && _0x564717?.batchGeneratingAssetIds?.includes?.(_0x43f684)) {
    return true;
  }
  const _0x1bc348 = new Map(getWorkspaceAssetAppearances(_0x13baa5).map(_0x3647ff => [normalizeText(_0x3647ff?.id), _0x3647ff]));
  return (Array.isArray(_0x564717?.generatingAppearanceKeys) ? _0x564717.generatingAppearanceKeys : []).some(_0x18e8d3 => {
    const _0x2a6b24 = normalizeText(_0x18e8d3);
    if (!_0x2a6b24.startsWith(_0x43f684 + ":")) {
      return false;
    }
    const _0x5f396b = _0x1bc348.get(_0x2a6b24.slice(_0x43f684.length + 1));
    return _0x5f396b && !normalizeText(_0x5f396b.error);
  });
}
function hasVoiceReference(_0xad7116 = {}) {
  return Boolean(normalizeText(_0xad7116?.voiceReference?.audioUrl || _0xad7116?.voiceReference?.localPath || _0xad7116?.voiceRef));
}
export function renderPersonReplacementVoicePreviewPlayer(_0x4e5e39 = {}, {
  className = "",
  showWaveform = true
} = {}) {
  if (_0x4e5e39?.kind !== "character" || _0x4e5e39?.isLibraryAsset || !hasVoiceReference(_0x4e5e39)) {
    return "";
  }
  const _0xec2bad = normalizeText(className);
  return "<span class=\"story-character-voice-name-player" + (_0xec2bad ? " " + escapeHtml(_0xec2bad) : "") + "\" data-story-character-voice-player=\"" + escapeHtml(_0x4e5e39.id) + "\">\n    <button type=\"button\" class=\"story-character-voice-name-play\" data-story-action=\"play-character-voice\" data-story-voice-asset-id=\"" + escapeHtml(_0x4e5e39.id) + "\" aria-label=\"播放 " + escapeHtml(_0x4e5e39.name) + " 的声音参考\">\n      <svg class=\"story-character-voice-name-play-icon\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M7 5.4v9.2l7.2-4.6L7 5.4Z\"/></svg>\n      <svg class=\"story-character-voice-name-pause-icon\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M6.5 5.5h2.3v9H6.5zM11.2 5.5h2.3v9h-2.3z\"/></svg>\n    </button>\n    " + (showWaveform ? "<span class=\"story-character-voice-waveform\" data-story-character-voice-waveform hidden aria-hidden=\"true\">" + Array.from({
    length: 12
  }, () => "<i></i>").join("") + "</span>" : "") + "\n  </span>";
}
function renderVoiceCapsule(_0x3a3538 = {}, _0xcb182b = "添加声音") {
  if (_0x3a3538?.kind !== "character" || _0x3a3538?.isLibraryAsset) {
    return "";
  }
  const _0x1eeff4 = hasVoiceReference(_0x3a3538);
  return "<span class=\"person-replacement-add-voice-menu-wrap\">\n    <button type=\"button\" class=\"story-character-voice-capsule " + (_0x1eeff4 ? "has-reference" : "is-missing") + "\" data-story-character-voice-capsule data-story-action=\"toggle-character-voice-menu\" aria-label=\"" + escapeHtml(_0xcb182b) + "\" aria-haspopup=\"menu\" aria-expanded=\"false\">\n      <span class=\"story-character-voice-icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 4v16M8.5 7.5v9M15.5 8.5v7M5 10v4M19 10v4\"/></svg></span>\n      <span>" + escapeHtml(_0xcb182b) + "</span>\n    </button>\n    <span class=\"person-replacement-add-voice-menu\" role=\"menu\" aria-label=\"添加人物声音\" aria-hidden=\"true\">\n      <button type=\"button\" role=\"menuitem\" data-story-action=\"upload-character-voice\">上传声音</button>\n      <button type=\"button\" role=\"menuitem\" data-story-action=\"choose-character-voice-from-library\">从项目音频添加</button>\n    </span>\n  </span>";
}
function renderPromptPresetPicker(_0x2a5835 = {}, _0x5a574a = "") {
  if (_0x5a574a !== "character") {
    return "";
  }
  const _0x4faa09 = Array.isArray(_0x2a5835.assetPromptPresets) ? _0x2a5835.assetPromptPresets : [];
  if (!_0x4faa09.length) {
    return "";
  }
  const _0x129b27 = _0x4faa09.find(_0x19e5a2 => _0x19e5a2.id === _0x2a5835.assetPromptPresetId) || _0x4faa09[0];
  const _0xd5ea27 = normalizeText(_0x2a5835.assetPromptPresetLabel) || "生成参考";
  return "<div class=\"story-home-param-picker story-asset-preset-picker\" data-story-asset-preset-picker>\n    <button type=\"button\" class=\"story-home-param-trigger story-menu-trigger story-asset-preset-trigger\" data-story-home-param-trigger=\"asset-preset\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n      <span>" + escapeHtml(_0xd5ea27) + "</span><strong>" + escapeHtml(_0x129b27?.label || "选择预设") + "</strong>\n    </button>\n    <div class=\"story-home-param-popover story-asset-preset-popover\" role=\"listbox\" aria-label=\"" + escapeHtml(_0xd5ea27) + "\">\n      <strong>" + escapeHtml(_0xd5ea27) + "</strong>\n      <div class=\"story-asset-preset-options\">\n        " + _0x4faa09.map(_0x2255ec => "<button type=\"button\" class=\"story-asset-preset-option floating-menu-item has-subtitle " + (_0x2255ec.id === _0x129b27?.id ? "active is-selected" : "") + "\" data-story-asset-preset-option=\"" + escapeHtml(_0x2255ec.id) + "\" data-story-asset-preset-kind=\"character\" role=\"option\" aria-selected=\"" + (_0x2255ec.id === _0x129b27?.id) + "\"><span class=\"fmi-content\"><span class=\"fmi-title\">" + escapeHtml(_0x2255ec.label) + "</span><small class=\"fmi-sub\">" + escapeHtml(_0x2255ec.description) + "</small></span></button>").join("") + "\n      </div>\n    </div>\n  </div>";
}
function renderPreviewActions({
  state = {},
  asset = {},
  appearance = {},
  readOnly = false,
  generating = false
} = {}) {
  const _0x1ec925 = renderWorkspaceImageDownloadButton({
    action: "download-asset-image",
    enabled: Boolean(normalizeText(appearance?.imageUrl) && normalizeText(asset?.mediaKind).toLowerCase() !== "video")
  });
  if (asset.isLibraryAsset || readOnly) {
    if (_0x1ec925) {
      return "<div class=\"story-asset-preview-actions\">" + _0x1ec925 + "</div>";
    } else {
      return "";
    }
  }
  const _0x51c734 = appearance?.totalAssetRef;
  const _0x445480 = _0x51c734 ? "已加入总素材" : "将当前形象加入总素材";
  return "<div class=\"story-asset-preview-actions\">\n    " + _0x1ec925 + "\n    <button type=\"button\" class=\"story-character-voice-upload-button story-add-to-library-button " + (_0x51c734 ? "is-synced" : "") + "\" data-story-action=\"add-asset-appearance-to-library\" aria-label=\"" + _0x445480 + "\" title=\"" + _0x445480 + "\" " + (generating || _0x51c734 ? "disabled" : "") + ">" + renderWorkspaceActionIcon("addToLibrary") + "</button>\n    <button type=\"button\" class=\"story-upload-replace story-character-voice-upload-button\" data-story-action=\"upload-asset\" aria-label=\"上传替换图片\" title=\"上传替换图片\" " + (generating ? "disabled" : "") + ">" + renderWorkspaceActionIcon("upload") + "</button>\n  </div>";
}
export function renderPersonReplacementAssetCard(_0xefa9ee, _0x2547c9, {
  previewAppearance = null,
  statusText = "",
  cardStatusHtml = "",
  draggable = false,
  cardClassName = "",
  cardAttributes = "",
  shellClassName = "",
  accessoryHtml = "",
  cardMetaHtml = "",
  cardMediaHtml = "",
  fallbackImageUrl = "",
  workspaceAssetLibraryImage = false
} = {}) {
  const _0xfa8627 = _0x2547c9.isLibraryAsset ? [_0x2547c9] : getWorkspaceAssetAppearances(_0x2547c9);
  const _0x12a63c = _0x2547c9.isLibraryAsset ? {
    total: 1,
    generated: _0x2547c9.imageUrl ? 1 : 0,
    failed: 0,
    pending: _0x2547c9.imageUrl ? 0 : 1
  } : getWorkspaceAssetAppearanceStats(_0x2547c9);
  const _0x4fee68 = previewAppearance || getWorkspaceAssetBaseAppearance(_0x2547c9) || _0xfa8627.find(_0x544e88 => normalizeText(_0x544e88?.imageUrl)) || _0xfa8627[0] || _0x2547c9;
  const _0x5e10f3 = isAssetGenerating(_0xefa9ee, _0x2547c9);
  const _0x199b27 = _0xefa9ee?.allowAssetRename === true && !_0x2547c9.isLibraryAsset;
  const _0x333348 = _0x199b27 ? "data-story-asset-name-id=\"" + escapeHtml(_0x2547c9.id) + "\" aria-label=\"重命名" + escapeHtml(_0x2547c9.name || "未命名素材") + "\"" : "";
  const _0x582bf0 = _0xefa9ee?.hideAssetRoleTag !== true && !["scene", "prop"].includes(normalizeText(_0x2547c9?.kind)) ? "<small>" + escapeHtml(_0x2547c9.role || "素材") + "</small>" : "";
  const _0x383d51 = normalizeText(_0x2547c9.kind).toLowerCase();
  const _0x3dda49 = _0x383d51 === "scene" ? "场景" : _0x383d51 === "audio" ? "音频" : "人物";
  const _0x542d88 = _0xefa9ee?.allowDeleteAssetCard && !_0x2547c9.isLibraryAsset && !_0xefa9ee.assetSelectionMode ? renderWorkspaceCardDeleteControl({
    className: "story-asset-card-delete-trigger",
    ariaLabel: "删除" + _0x3dda49 + " " + _0x2547c9.name,
    actionAttributes: {
      "data-story-action": "delete-asset-card",
      "data-story-asset-delete-id": _0x2547c9.id
    },
    disabled: _0x5e10f3
  }) : "";
  return renderWorkspaceAssetCard({
    asset: _0x2547c9,
    appearances: _0xfa8627,
    previewAppearance: _0x4fee68,
    stats: _0x12a63c,
    selected: _0x2547c9.id === _0xefa9ee?.selectedAssetId,
    selectionMode: _0xefa9ee?.assetSelectionMode === true,
    checked: _0xefa9ee?.selectedAssetIds?.includes?.(_0x2547c9.id) === true,
    loading: _0x5e10f3,
    draggable: draggable,
    promptPreview: _0x4fee68?.prompt || _0x2547c9?.prompt || "",
    statusText: statusText,
    cardStatusHtml: cardStatusHtml,
    cardClassName: cardClassName,
    cardAttributes: cardAttributes,
    shellClassName: shellClassName,
    accessoryHtml: accessoryHtml,
    cardMetaHtml: cardMetaHtml,
    cardMediaHtml: cardMediaHtml,
    fallbackImageUrl: fallbackImageUrl,
    workspaceAssetLibraryImage: workspaceAssetLibraryImage,
    nameAttributes: _0x333348,
    roleHtml: _0x582bf0,
    deleteControlHtml: _0x542d88
  });
}
function renderAudioArtwork({
  compact = false
} = {}) {
  return "<span class=\"" + (compact ? "story-asset-card-image " : "") + "person-replacement-audio-artwork" + (compact ? " is-compact" : "") + "\" role=\"img\" aria-label=\"音频素材\">\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 10v4M8.5 7.5v9M12 4v16M15.5 8.5v7M19 10v4\"/></svg>\n    <span>" + (compact ? "音频" : "声音素材") + "</span>\n  </span>";
}
function getCharacterPreview(_0x513a4f = {}) {
  const _0x356bf3 = getWorkspaceAssetBaseAppearance(_0x513a4f) || getWorkspaceAssetAppearances(_0x513a4f).find(_0x137f87 => normalizeText(_0x137f87?.imageUrl));
  return {
    imageUrl: normalizeText(_0x356bf3?.imageUrl),
    name: normalizeText(_0x513a4f.name) || "未命名人设"
  };
}
function getAudioAssetDisplayName(_0x20b9e4 = {}) {
  return getPersonReplacementAudioSavedName(_0x20b9e4);
}
export function renderPersonReplacementAudioAssetCard(_0x2a78c3, _0x16826b, {
  boundCharacters = [],
  showVoiceLibraryConfirm = false
} = {}) {
  const _0x41ee59 = Array.isArray(boundCharacters) ? boundCharacters.length : 0;
  const _0x145631 = getAudioAssetDisplayName(_0x16826b);
  const _0x3843eb = showVoiceLibraryConfirm ? "<button type=\"button\" class=\"story-primary-button person-replacement-audio-card-add-voice\" data-person-replacement-action=\"confirm-character-voice-library\" data-person-replacement-audio-asset-id=\"" + escapeHtml(_0x16826b.id) + "\" aria-label=\"添加声音：" + escapeHtml(_0x145631) + "\">添加声音</button>" : "";
  return renderPersonReplacementAssetCard(_0x2a78c3, {
    ..._0x16826b,
    name: _0x145631,
    prompt: ""
  }, {
    cardClassName: "person-replacement-audio-asset-card",
    cardAttributes: "data-person-replacement-audio-library-asset=\"true\"",
    shellClassName: showVoiceLibraryConfirm ? "person-replacement-audio-asset-shell" : "",
    accessoryHtml: _0x3843eb,
    cardMediaHtml: renderAudioArtwork({
      compact: true
    }),
    cardStatusHtml: "<span>" + (_0x41ee59 ? "已绑定 " + _0x41ee59 + " 个人设" : "未绑定人设") + "</span>"
  });
}
export function renderPersonReplacementAudioAssetDetail(_0x4120ca, {
  boundCharacters = [],
  selectedCharacterId = ""
} = {}) {
  if (!_0x4120ca) {
    return "<aside class=\"story-asset-detail story-empty-panel\">\n      <strong>暂无音频素材</strong>\n      <p>请先从总素材将声音加入当前项目。</p>\n    </aside>";
  }
  const _0x24bd7b = normalizeText(_0x4120ca.audioUrl || _0x4120ca.sourceUrl || _0x4120ca.url);
  const _0xcf3db6 = getAudioAssetDisplayName(_0x4120ca);
  const _0x396ecc = Array.isArray(boundCharacters) ? boundCharacters : [];
  const _0x5ae2ec = _0x396ecc.find(_0x10ad28 => normalizeText(_0x10ad28?.id) === normalizeText(selectedCharacterId)) || _0x396ecc[0] || null;
  const _0x13eac3 = _0x5ae2ec ? getCharacterPreview(_0x5ae2ec) : null;
  const _0x1ea8e5 = _0x396ecc.length > 1;
  const _0x27da70 = _0x5ae2ec ? _0x396ecc.indexOf(_0x5ae2ec) : -1;
  const _0x1c19c0 = _0x13eac3?.imageUrl ? "<img class=\"story-asset-preview\" src=\"" + escapeHtml(_0x13eac3.imageUrl) + "\" alt=\"" + escapeHtml(_0x13eac3.name) + "\" loading=\"lazy\" decoding=\"async\">" : "<div class=\"story-asset-preview story-media-empty\" role=\"img\" aria-label=\"" + (_0x5ae2ec ? "已绑定人设暂无图片" : "未绑定人设") + "\"><span>" + (_0x5ae2ec ? "暂无人设图片" : "未绑定人设") + "</span></div>";
  return "<aside class=\"story-asset-detail person-replacement-audio-detail\">\n    <div class=\"story-asset-preview-wrap person-replacement-audio-preview-wrap\" data-person-replacement-audio-bound-preview data-person-replacement-audio-bound-wheel=\"" + _0x1ea8e5 + "\" " + (_0x1ea8e5 ? "tabindex=\"0\" aria-label=\"滚动鼠标滚轮或按左右方向键切换已绑定人设\"" : "aria-label=\"" + (_0x5ae2ec ? "已绑定 1 个人设" : "未绑定人设") + "\"") + ">\n      <div class=\"story-asset-preview-slide\" data-person-replacement-audio-bound-character-id=\"" + escapeHtml(_0x5ae2ec?.id || "") + "\">\n        " + _0x1c19c0 + "\n      </div>\n      " + (_0x1ea8e5 ? "" + renderWorkspacePreviewArrow("previous", {
    action: "previous-audio-bound-character",
    label: "上一个已绑定人设",
    actionAttributes: {
      "data-story-action": "previous-audio-bound-character"
    }
  }) + renderWorkspacePreviewArrow("next", {
    action: "next-audio-bound-character",
    label: "下一个已绑定人设",
    actionAttributes: {
      "data-story-action": "next-audio-bound-character"
    }
  }) : "") + "\n      <div class=\"story-asset-preview-caption\">\n        <div class=\"story-asset-caption-heading\">\n          <span class=\"story-asset-caption-title\"><strong>" + escapeHtml(_0xcf3db6) + "</strong></span>\n        </div>\n        <span>" + (_0x13eac3 ? escapeHtml(_0x13eac3.name) + " · " + (_0x27da70 + 1) + "/" + _0x396ecc.length : "未绑定人设") + "</span>\n      </div>\n    </div>\n    <div class=\"story-asset-detail-panel-stage is-audio is-settled\">\n      <div class=\"person-replacement-audio-detail-panel\">\n        <strong>声音预览</strong>\n        " + (_0x24bd7b ? renderAudioPlaybackSurface({
    audioUrl: _0x24bd7b,
    waveformUrl: _0x4120ca.waveformLocalPath || _0x4120ca.waveformUrl,
    className: "person-replacement-audio-playback has-reference",
    playLabel: "播放声音素材",
    pauseLabel: "暂停声音素材"
  }) : "<p class=\"person-replacement-audio-unavailable\">该音频缺少可播放地址。</p>") + "\n      </div>\n    </div>\n  </aside>";
}
export function renderPersonReplacementAssetDetail(_0x385b43, _0x2df595, {
  showEmptyDescription = true,
  readOnly = false,
  voiceLibrarySelection = null
} = {}) {
  if (!_0x2df595) {
    const _0x2bbe1f = _0x385b43?.assetFilter === "library" ? "总素材中还没有可引用的图片或音频。" : "";
    return "<aside class=\"story-asset-detail story-empty-panel\">\n      <strong>暂无可用素材</strong>\n      " + (showEmptyDescription && _0x2bbe1f ? "<p>" + _0x2bbe1f + "</p>" : "") + "\n    </aside>";
  }
  const _0x212b4f = _0x2df595.isLibraryAsset ? [_0x2df595] : getWorkspaceAssetAppearances(_0x2df595);
  const _0x3b57a4 = getSelectedAppearanceIndex(_0x385b43, _0x2df595);
  const _0x412df8 = getSelectedAppearance(_0x385b43, _0x2df595) || _0x2df595;
  const _0x2ee6be = !_0x2df595.isLibraryAsset && !readOnly && _0x212b4f.length > 1;
  const _0x4fb973 = _0x2df595.kind === "character" && !_0x2df595.isLibraryAsset && !readOnly;
  const _0x4570a2 = getWorkspaceAssetBaseAppearance(_0x2df595);
  const _0x2e5b7d = _0x4fb973 && (_0x212b4f.length === 1 ? _0x212b4f[0]?.id === _0x412df8?.id : _0x4570a2?.id === _0x412df8?.id);
  const _0x1ac132 = isAppearanceGenerating(_0x385b43, _0x2df595, _0x412df8);
  const _0x1d22aa = Boolean(_0x385b43?.allowDeleteAssetAppearance && _0x2ee6be && !_0x2e5b7d);
  const _0x59286c = normalizeText(_0x412df8?.imageUrl);
  const _0x194a4f = _0x59286c ? "<img class=\"story-asset-preview\" src=\"" + escapeHtml(_0x59286c) + "\" alt=\"" + escapeHtml(_0x2df595.name + " · " + (_0x412df8.name || "形象")) + "\" loading=\"lazy\" decoding=\"async\">" : "<div class=\"story-asset-preview story-media-empty\" role=\"img\" aria-label=\"" + escapeHtml(_0x2df595.name + "待生成") + "\"><span>待生成</span></div>";
  const _0x3e27cf = _0x385b43?.allowAssetRename === true && !_0x2df595.isLibraryAsset ? " data-story-asset-name-id=\"" + escapeHtml(_0x2df595.id) + "\" aria-label=\"重命名" + escapeHtml(_0x2df595.name) + "\"" : "";
  const _0x4a230a = normalizeText(_0x412df8?.occurrences || _0x2df595?.occurrences) || "当前项目";
  const _0x8e767e = voiceLibrarySelection?.audioAsset || null;
  const _0x243486 = _0x8e767e ? getPersonReplacementLibraryAudioRef(_0x8e767e) : "";
  const _0x2cf433 = Boolean(voiceLibrarySelection);
  const _0x374ecb = _0x2cf433 ? "<div class=\"story-asset-prompt-field person-replacement-voice-library-playback-field\">\n        " + (_0x243486 ? renderAudioPlaybackSurface({
    audioUrl: _0x243486,
    waveformUrl: _0x8e767e?.waveformLocalPath || _0x8e767e?.waveformUrl,
    className: "person-replacement-voice-library-playback has-reference",
    playLabel: "播放" + (_0x8e767e?.name || "所选声音"),
    pauseLabel: "暂停" + (_0x8e767e?.name || "所选声音")
  }) : "<div class=\"person-replacement-voice-library-playback-empty\">请从左侧选择声音</div>") + "\n      </div>" : "<div class=\"story-asset-prompt-field\">\n        <div class=\"story-asset-prompt-editor\" data-story-asset-prompt data-story-asset-prompt-asset-id=\"" + escapeHtml(_0x2df595.id) + "\" data-story-asset-prompt-appearance-id=\"" + escapeHtml(_0x412df8.id) + "\" contenteditable=\"" + (_0x2df595.isLibraryAsset || readOnly ? "false" : "true") + "\" role=\"textbox\" aria-multiline=\"true\" aria-label=\"形象提示词\" spellcheck=\"false\">" + renderPromptText(_0x2df595.isLibraryAsset || readOnly ? _0x2df595.description || _0x412df8.prompt || "" : _0x412df8.prompt || "") + "</div>\n      </div>";
  const _0x41e594 = _0x2df595.isLibraryAsset || readOnly ? "" : _0x2cf433 ? "<div class=\"story-asset-generation-bar prompt-panel-footer person-replacement-voice-library-confirm-bar\">\n          <div class=\"story-asset-generation-actions\">\n            <button type=\"button\" class=\"story-asset-generate-button story-primary-button\" data-person-replacement-action=\"confirm-character-voice-library\" " + (_0x243486 ? "" : "disabled") + "><span>确认</span></button>\n          </div>\n        </div>" : "<div class=\"story-asset-generation-bar prompt-panel-footer\">\n          " + renderAIGenImageModelSelectorMarkup({
    modelId: _0x385b43?.models?.image,
    provider: _0x385b43?.imageProvider,
    generationParams: _0x385b43?.imageGenerationParams,
    providerProfileId: _0x385b43?.imageProviderProfileId,
    providerProfileIdByModel: _0x385b43?.imageProviderProfileIdByModel,
    showSchemaControls: true,
    className: "story-asset-image-model-selector"
  }) + "\n          <div class=\"story-asset-generation-actions\">\n            " + renderPromptPresetPicker(_0x385b43, _0x2df595.kind) + "\n            <button type=\"button\" class=\"story-asset-generate-button story-primary-button\" data-story-action=\"generate-asset\" " + (_0x1ac132 ? "disabled" : "") + "><span>" + (_0x1ac132 ? "生成中" : escapeHtml(_0x385b43?.assetGenerateLabel || "生成")) + "</span></button>\n          </div>\n        </div>";
  return "<aside class=\"story-asset-detail" + (_0x2cf433 ? " person-replacement-voice-library-character-detail" : "") + "\"" + (_0x2cf433 ? " data-person-replacement-voice-library-character-detail" : "") + ">\n    <div class=\"story-asset-preview-wrap\" data-story-appearance-wheel=\"" + _0x2ee6be + "\" " + (_0x2ee6be ? "tabindex=\"0\" aria-label=\"滚动鼠标滚轮或按左右方向键切换形象\"" : "") + ">\n      <div class=\"story-asset-preview-slide " + (_0x1ac132 ? "img-preview-loading" : "") + "\" aria-busy=\"" + _0x1ac132 + "\">\n        " + _0x194a4f + "\n        " + (_0x1ac132 ? renderWorkspaceAssetLoadingOverlay() : "") + "\n      </div>\n      " + renderPreviewActions({
    state: _0x385b43,
    asset: _0x2df595,
    appearance: _0x412df8,
    readOnly: readOnly,
    generating: _0x1ac132
  }) + "\n      " + (_0x2ee6be ? "" + renderWorkspacePreviewArrow("previous", {
    action: "previous-appearance",
    label: "上一个形象",
    actionAttributes: {
      "data-story-action": "previous-appearance"
    }
  }) + renderWorkspacePreviewArrow("next", {
    action: "next-appearance",
    label: "下一个形象",
    actionAttributes: {
      "data-story-action": "next-appearance"
    }
  }) : "") + "\n      <div class=\"story-asset-preview-caption\">\n        <div class=\"story-asset-caption-heading\">\n          <span class=\"story-asset-caption-title\"><strong" + _0x3e27cf + ">" + escapeHtml(_0x2df595.name || "未命名素材") + "</strong>" + renderPersonReplacementVoicePreviewPlayer(_0x2df595) + "</span>\n          <span class=\"story-asset-caption-tags\">\n            " + (_0x4fb973 ? "<button type=\"button\" class=\"story-base-appearance-button " + (_0x2e5b7d ? "is-active" : "") + "\" " + (_0x2ee6be ? "data-story-action=\"set-base-appearance\"" : "disabled") + " aria-pressed=\"" + _0x2e5b7d + "\" aria-disabled=\"" + !_0x2ee6be + "\" title=\"会以基础形象作为参考，生成角色的其他形象\">" + (_0x2e5b7d ? "基础形象" : "设为基础形象") + "</button>" : "") + "\n            " + renderVoiceCapsule(_0x2df595, _0x385b43?.assetVoiceUploadLabel || "添加声音") + "\n            " + (_0x1d22aa ? "<button type=\"button\" class=\"story-character-voice-capsule story-delete-appearance-button\" data-story-action=\"delete-appearance\">删除形象</button>" : "") + "\n          </span>\n        </div>\n        <span data-story-asset-caption-meta>" + escapeHtml(_0x412df8.name || _0x2df595.role || "素材") + " · " + escapeHtml(_0x4a230a) + (_0x2ee6be ? " · " + (_0x3b57a4 + 1) + "/" + _0x212b4f.length : "") + "</span>\n      </div>\n    </div>\n    <div class=\"story-asset-detail-panel-stage is-image is-settled\" data-story-asset-detail-panel-stage>\n      <div class=\"story-asset-detail-panel-cube\">\n        <div class=\"story-asset-detail-copy story-asset-detail-panel-face story-asset-detail-panel-face--image\" aria-hidden=\"false\">\n          " + _0x374ecb + "\n          " + _0x41e594 + "\n        </div>\n      </div>\n    </div>\n  </aside>";
}
export function renderPersonReplacementBatchGenerationControl(_0x462d24 = {}) {
  const _0x981b66 = Array.isArray(_0x462d24?.selectedAssetIds) ? _0x462d24.selectedAssetIds.length : 0;
  const _0x367177 = _0x462d24?.isBatchGenerating === true;
  const _0x55286f = _0x462d24?.batchCancelRequested === true;
  const _0x2e6baf = _0x367177 ? _0x55286f : !_0x981b66;
  const _0x25db0f = _0x981b66 ? " (" + _0x981b66 + ")" : "";
  const _0x56dfb6 = normalizeText(_0x462d24?.batchGenerationActionLabel) || "批量生成";
  const _0x3ffa24 = _0x367177 ? "" + (_0x55286f ? "正在停止" : "取消运行") + _0x25db0f : "" + _0x56dfb6 + _0x25db0f;
  const _0x390195 = ["scene", "prop"].includes(normalizeText(_0x462d24?.assetFilter)) ? "image" : "";
  const _0x2db051 = _0x367177 ? normalizeText(_0x462d24.batchCancelAction) || "cancel-asset-batch-generation" : "batch-generate-assets";
  return "<button type=\"button\" class=\"story-primary-button story-asset-batch-trigger\" data-story-action=\"" + escapeHtml(_0x2db051) + "\"" + (_0x390195 ? " data-story-asset-batch-direct-mode=\"" + _0x390195 + "\"" : "") + " aria-busy=\"" + _0x367177 + "\" " + (_0x2e6baf ? "disabled" : "") + "><span class=\"story-asset-batch-trigger-label\">" + escapeHtml(_0x3ffa24) + "</span></button>";
}
export function renderPersonReplacementPreviewArrow(_0x1355f8, _0x2f4446 = {}) {
  return renderWorkspacePreviewArrow(_0x1355f8, {
    ..._0x2f4446,
    actionAttributes: normalizeText(_0x2f4446?.action) ? {
      "data-story-action": _0x2f4446.action
    } : {}
  });
}
export function syncPersonReplacementVoicePreviewUi(_0x46a4ca, {
  audioEl = null,
  assetId = ""
} = {}) {
  const _0x45c826 = Number(audioEl?.duration);
  const _0x34693c = Number(audioEl?.currentTime);
  const _0x5cdf61 = Number.isFinite(_0x45c826) && _0x45c826 > 0 ? Math.max(0, Math.min(1, _0x34693c / _0x45c826)) : 0;
  const _0x47ebf7 = Boolean(audioEl && audioEl.paused === false && audioEl.ended !== true);
  _0x46a4ca?.querySelectorAll?.("[data-story-character-voice-player]")?.forEach?.(_0x5e5e42 => {
    const _0xeaf4f3 = normalizeText(_0x5e5e42.dataset?.storyCharacterVoicePlayer) === normalizeText(assetId);
    const _0x4883e0 = _0x5e5e42.querySelector?.("[data-story-action='play-character-voice']");
    const _0x47884b = _0x5e5e42.querySelector?.("[data-story-character-voice-waveform]");
    _0x5e5e42.classList?.toggle?.("is-active", _0xeaf4f3);
    _0x5e5e42.classList?.toggle?.("is-playing", _0xeaf4f3 && _0x47ebf7);
    _0x4883e0?.setAttribute?.("aria-label", _0xeaf4f3 && _0x47ebf7 ? "暂停声音参考" : "播放声音参考");
    if (_0x47884b) {
      _0x47884b.hidden = !_0xeaf4f3;
      _0x47884b.setAttribute?.("aria-hidden", String(!_0xeaf4f3));
      _0x47884b.style?.setProperty?.("--story-character-voice-progress", "" + _0x5cdf61);
      const _0x17020d = _0x47884b.querySelectorAll?.("i") || [];
      _0x17020d.forEach?.((_0x2b0e43, _0x59607b) => {
        _0x2b0e43.classList?.toggle?.("is-played", _0xeaf4f3 && _0x5cdf61 >= (_0x59607b + 1) / _0x17020d.length);
      });
    }
  });
  return true;
}