import { getStoryAssetAppearance, getStoryAssetAppearanceStats, getStoryAssetAppearances, getStoryAssetBaseAppearance, isStoryAssetBaseAppearance } from "./storyAssetAppearances.js";
import { getStoryAssetGenerationControlState, isStoryAssetCardLoading, isStoryAssetVoiceLoading } from "./storyAssetGenerationState.js";
import { STORY_CHARACTER_ASSET_PROMPT_PREFIX } from "./storyPlanningData.js";
import { STORY_CHARACTER_ASSET_PROMPT_PRESETS, STORY_SCENE_ASSET_PROMPT_PRESETS, getStoryCharacterAssetPromptPreset, getStorySceneAssetPromptPreset } from "./storyAssetPromptPresets.js";
import { resolveStoryStyleSelection } from "./storyStyleCatalog.js";
import { STORY_CHARACTER_VOICE_SAMPLE_MAX_CHARACTERS, getStoryCharacterVoiceWorkflow, getStoryCharacterVoiceWorkflowItems, hasStoryCharacterVoiceReference, normalizeStoryCharacterVoiceHistory, normalizeStoryCharacterVoiceReference } from "./storyCharacterVoice.js";
function normalizeText(_0x38a352) {
  return String(_0x38a352 ?? "").trim();
}
function freezeSnapshot(_0x5ab8df) {
  if (Array.isArray(_0x5ab8df)) {
    return Object.freeze(_0x5ab8df.map(_0x1c9ea8 => freezeSnapshot(_0x1c9ea8)));
  }
  if (_0x5ab8df && typeof _0x5ab8df === "object" && (Object.getPrototypeOf(_0x5ab8df) === Object.prototype || Object.getPrototypeOf(_0x5ab8df) === null)) {
    return Object.freeze(Object.fromEntries(Object.entries(_0x5ab8df).map(([_0x4d26dc, _0x221a83]) => [_0x4d26dc, freezeSnapshot(_0x221a83)])));
  }
  return _0x5ab8df;
}
export function shouldRenderStoryAssetRoleTag(_0x442d7c = "") {
  return !["scene", "prop"].includes(normalizeText(_0x442d7c));
}
export function getStoryAssetBatchDirectMode(_0x17442f = "") {
  if (["scene", "prop"].includes(normalizeText(_0x17442f))) {
    return "image";
  } else {
    return "";
  }
}
export function formatStoryAssetOccurrences(_0x18d928 = "") {
  const _0x299356 = normalizeText(_0x18d928);
  if (!_0x299356) {
    return "当前项目";
  }
  const _0x3b25f1 = _0x299356.split(/[、,，]/u).map(_0x2a01ce => _0x2a01ce.trim()).filter(Boolean);
  const _0x1cd9ad = _0x3b25f1.map(_0x154ae1 => {
    const _0x23f6f8 = /(?:^|[-_])episode-(\d+)$/iu.exec(_0x154ae1);
    if (_0x23f6f8) {
      return String(Math.max(1, Number(_0x23f6f8[1]) || 1));
    } else {
      return "";
    }
  });
  if (_0x3b25f1.length && _0x1cd9ad.every(Boolean)) {
    const _0x4775d9 = [...new Set(_0x1cd9ad.map(Number))].sort((_0x55eb0e, _0x56ce30) => _0x55eb0e - _0x56ce30);
    return "第 " + _0x4775d9.join("、") + " 集";
  }
  return _0x3b25f1.map((_0x47c27d, _0x95c404) => _0x1cd9ad[_0x95c404] ? "第 " + _0x1cd9ad[_0x95c404] + " 集" : _0x47c27d).join("、");
}
function getSelectedAppearanceIndex(_0x2dacd4, _0xc59338) {
  const _0x317764 = Number(_0x2dacd4.assetAppearanceIndexes?.[_0xc59338?.id]);
  const _0x5f3bc8 = Math.max(0, getStoryAssetAppearances(_0xc59338).length - 1);
  return Math.max(0, Math.min(_0x5f3bc8, Number.isFinite(_0x317764) ? Math.trunc(_0x317764) : 0));
}
function getSelectedAppearance(_0xec5765, _0x579216) {
  if (_0x579216?.isLibraryAsset) {
    return _0x579216;
  } else {
    return getStoryAssetAppearance(_0x579216, getSelectedAppearanceIndex(_0xec5765, _0x579216));
  }
}
function getAppearanceActionKey(_0x3e3e98 = {}, _0x1143e1 = {}) {
  const _0x48d8cd = normalizeText(_0x3e3e98?.id);
  const _0x474273 = normalizeText(_0x1143e1?.id);
  if (_0x48d8cd && _0x474273) {
    return _0x48d8cd + ":" + _0x474273;
  } else {
    return "";
  }
}
function isAddedAppearance(_0x31b8cb = {}) {
  return normalizeText(_0x31b8cb?.sourceOrigin) === "library";
}
function getCardPromptPreview(_0x21b1e3 = {}, _0x4aa97c = {}, _0x4a0a2e = {}) {
  let _0x3e0246 = normalizeText(_0x4a0a2e?.prompt || _0x4aa97c?.prompt);
  if (_0x4aa97c?.kind !== "character" || !_0x3e0246) {
    return _0x3e0246;
  }
  const _0x3f3df1 = _0x21b1e3?.data?.project || {};
  const _0x3d9e48 = resolveStoryStyleSelection({
    styleId: _0x3f3df1.videoStyleId,
    stylePrompt: _0x3f3df1.videoStylePrompt,
    videoStyle: _0x3f3df1.videoStyle
  }).stylePrompt;
  [STORY_CHARACTER_ASSET_PROMPT_PREFIX, _0x3d9e48, "正面全身人物设定图"].filter(Boolean).forEach(_0x6dc706 => {
    _0x3e0246 = _0x3e0246.split(_0x6dc706).join("");
  });
  return _0x3e0246.split(/\r?\n/u).map(_0x34e6c2 => _0x34e6c2.trim().replace(/(?:\s*[，,]){2,}/gu, "，").replace(/^[\s，,。；;:：|/·-]+|[\s，,。；;:：|/·-]+$/gu, "")).filter(Boolean).join("\n");
}
function formatVoiceHistoryTime(_0x578962) {
  const _0x308280 = new Date(Number(_0x578962));
  if (!Number.isFinite(_0x308280.getTime())) {
    return "历史版本";
  }
  const _0x49cfa3 = _0x4f4bd0 => String(_0x4f4bd0).padStart(2, "0");
  return _0x308280.getFullYear() + "/" + _0x49cfa3(_0x308280.getMonth() + 1) + "/" + _0x49cfa3(_0x308280.getDate()) + " " + _0x49cfa3(_0x308280.getHours()) + ":" + _0x49cfa3(_0x308280.getMinutes());
}
function projectPreset(_0x279e6c, _0xb9cb15, _0x36a16e, _0x19e2ce) {
  if (!["character", "scene"].includes(_0xb9cb15)) {
    return {
      visible: false
    };
  }
  const _0x3bec33 = _0xb9cb15 === "scene";
  const _0x15831a = !_0x3bec33 && Array.isArray(_0x279e6c.assetPromptPresets) && _0x279e6c.assetPromptPresets.length ? _0x279e6c.assetPromptPresets : null;
  const _0x463485 = _0x3bec33 ? STORY_SCENE_ASSET_PROMPT_PRESETS : _0x15831a || STORY_CHARACTER_ASSET_PROMPT_PRESETS;
  const _0x8383fc = _0x3bec33 ? getStorySceneAssetPromptPreset(_0x279e6c.sceneAssetPromptPresetId) : _0x15831a?.find(_0x558a4a => _0x558a4a.id === _0x279e6c.assetPromptPresetId) || _0x15831a?.[0] || getStoryCharacterAssetPromptPreset(_0x279e6c.assetPromptPresetId);
  const _0x525b8d = _0x36a16e && _0x19e2ce ? getStoryAssetGenerationControlState(_0x279e6c, _0x36a16e.id, _0x19e2ce.id) : {
    disabled: _0x279e6c.isBatchGenerating === true
  };
  return {
    visible: true,
    assetKind: _0xb9cb15,
    label: _0x3bec33 ? "场景图片预设" : normalizeText(_0x279e6c.assetPromptPresetLabel) || "角色图片预设",
    selectedId: _0x8383fc?.id || "",
    selectedLabel: _0x8383fc?.label || "",
    disabled: Boolean(_0x525b8d.disabled),
    options: _0x463485.map(_0x5bf8a8 => ({
      id: _0x5bf8a8.id,
      label: _0x5bf8a8.label,
      description: _0x5bf8a8.description
    }))
  };
}
function projectLibrarySyncState(_0x576e08, _0xcbd799) {
  const _0x29c704 = _0x576e08?.totalAssetRef && typeof _0x576e08.totalAssetRef === "object" ? _0x576e08.totalAssetRef : null;
  const _0x4801ed = normalizeText(_0x29c704?.assetId);
  const _0x4aa486 = Math.max(0, Math.trunc(Number(_0x29c704?.itemIndex) || 0));
  if (!_0x4801ed) {
    return {
      exists: false,
      synced: false
    };
  }
  const _0x51d5f8 = _0xcbd799({
    assetId: _0x4801ed,
    itemIndex: _0x4aa486
  });
  if (!_0x51d5f8) {
    return {
      exists: false,
      synced: false
    };
  }
  const _0x1bf000 = normalizeText(_0x29c704?.itemKey);
  const _0x8b38db = normalizeText(_0x51d5f8?.nodeData?.assetPackageItemKey);
  const _0x11dd6f = !_0x1bf000 || !_0x8b38db || _0x1bf000 === _0x8b38db;
  const _0x4bca76 = normalizeText(_0x576e08?.imageUrl);
  const _0x225d4d = normalizeText(_0x51d5f8?.url || _0x51d5f8?.nodeData?.imageUrl || _0x51d5f8?.nodeData?.src);
  return {
    exists: _0x11dd6f,
    synced: _0x11dd6f && Boolean(_0x4bca76) && _0x4bca76 === _0x225d4d
  };
}
function projectPreviewActions(_0x14a81a, _0x2c76a7, _0x5f2cb5, _0x14b7fe, _0x41e07d, _0x47298a) {
  if (_0x2c76a7.isLibraryAsset || _0x41e07d) {
    return {
      canDownload: Boolean(normalizeText(_0x5f2cb5?.imageUrl) && normalizeText(_0x2c76a7?.mediaKind).toLowerCase() !== "video"),
      showProjectActions: false
    };
  }
  const _0x26f272 = projectLibrarySyncState(_0x5f2cb5, _0x47298a);
  const _0x546261 = getAppearanceActionKey(_0x2c76a7, _0x5f2cb5);
  const _0x9f346d = Boolean(_0x546261 && normalizeText(_0x14a81a.pendingDeleteAssetAppearanceKey) === _0x546261);
  const _0x58cf34 = isAddedAppearance(_0x5f2cb5) && getStoryAssetAppearances(_0x2c76a7).length > 1;
  const _0x4a4730 = normalizeText(_0x14a81a.exportingAssetAppearanceKey) === getAppearanceActionKey(_0x2c76a7, _0x5f2cb5);
  const _0x53d43c = Boolean(normalizeText(_0x5f2cb5?.imageUrl) && !_0x14b7fe.disabled && !_0x4a4730 && !_0x26f272.synced && !_0x9f346d);
  return {
    canDownload: Boolean(normalizeText(_0x5f2cb5?.imageUrl) && normalizeText(_0x2c76a7?.mediaKind).toLowerCase() !== "video"),
    showProjectActions: true,
    saveToLibraryLabel: _0x4a4730 ? "正在加入总素材" : _0x26f272.synced ? "已加入总素材" : _0x26f272.exists ? "更新总素材" : "将当前形象加入总素材",
    canSaveToLibrary: _0x53d43c,
    isSavingToLibrary: _0x4a4730,
    canUpload: !_0x4a4730 && !_0x9f346d,
    showDeleteAppearance: _0x58cf34,
    canDeleteAppearance: Boolean(_0x58cf34 && !_0x14b7fe.disabled && !_0x4a4730 && !_0x9f346d),
    isDeleteAppearanceConfirming: _0x9f346d,
    librarySynced: _0x26f272.synced
  };
}
function projectVoicePanel(_0x164930, _0x51ad06, _0x36bd3d) {
  const _0x51379a = _0x164930.characterVoiceEditor;
  if (!_0x51379a?.assetId || _0x51379a.assetId !== _0x51ad06?.id || _0x51ad06.kind !== "character") {
    return {
      visible: false
    };
  }
  const _0x4a3c55 = normalizeStoryCharacterVoiceReference(_0x51ad06.voiceReference);
  const _0x4f9f26 = normalizeStoryCharacterVoiceHistory(_0x51ad06.voiceReferenceHistory).map(_0x9821a6 => ({
    ..._0x9821a6,
    label: _0x9821a6.modelLabel || _0x9821a6.fileName || (_0x9821a6.source === "generated" ? "AI 生成声音" : "上传声音"),
    timeLabel: formatVoiceHistoryTime(_0x9821a6.updatedAt)
  }));
  const _0x518620 = isStoryAssetVoiceLoading(_0x164930, _0x51ad06.id);
  return {
    visible: true,
    isActive: _0x36bd3d,
    isGenerating: _0x518620,
    reference: _0x4a3c55,
    history: _0x4f9f26,
    sampleText: _0x51379a.sampleText || "",
    voiceDescription: _0x51379a.voiceDescription || "",
    error: _0x51379a.error || "",
    sampleMaxCharacters: STORY_CHARACTER_VOICE_SAMPLE_MAX_CHARACTERS,
    footer: {
      workflow: getStoryCharacterVoiceWorkflow(_0x51379a.nodeData?.model),
      nodeData: _0x51379a.nodeData,
      workflowItems: getStoryCharacterVoiceWorkflowItems()
    }
  };
}
export function createStoryAssetSettingsProjection({
  resolveLibraryReference = () => null
} = {}) {
  function _0x157a1f(_0x594be7 = {}, _0x57cff4 = {}, _0x6723ad = {}) {
    const _0x563d00 = _0x57cff4.isLibraryAsset ? [_0x57cff4] : getStoryAssetAppearances(_0x57cff4);
    const _0x2d37b2 = _0x57cff4.isLibraryAsset ? {
      total: 1,
      generated: _0x57cff4.imageUrl ? 1 : 0,
      failed: 0,
      pending: _0x57cff4.imageUrl ? 0 : 1
    } : getStoryAssetAppearanceStats(_0x57cff4);
    const _0x54e8cd = _0x6723ad.previewAppearance || getStoryAssetBaseAppearance(_0x57cff4) || _0x563d00.find(_0xc506d3 => normalizeText(_0xc506d3.imageUrl)) || _0x563d00[0] || _0x57cff4;
    const _0x5a9f86 = Array.isArray(_0x594be7.selectedAssetIds) ? _0x594be7.selectedAssetIds : [];
    const _0x171da2 = _0x594be7.assetSelectionMode === true;
    const _0x1091c4 = _0x57cff4.id === _0x594be7.selectedAssetId;
    const _0x4ba1ba = isStoryAssetCardLoading(_0x594be7, _0x57cff4.id);
    return {
      id: _0x57cff4.id,
      name: normalizeText(_0x57cff4.name) || "未命名素材",
      role: _0x57cff4.role || "素材",
      kind: _0x57cff4.kind,
      appearanceCount: _0x563d00.length,
      preview: _0x54e8cd,
      promptPreview: getCardPromptPreview(_0x594be7, _0x57cff4, _0x54e8cd),
      stats: _0x2d37b2,
      statusText: _0x6723ad.statusText || "",
      cardStatusHtml: _0x6723ad.cardStatusHtml || "",
      isCurrent: _0x1091c4,
      isChecked: _0x5a9f86.includes(_0x57cff4.id),
      isSelectionMode: _0x171da2,
      isLoading: _0x4ba1ba,
      showRoleTag: _0x594be7.hideAssetRoleTag !== true && shouldRenderStoryAssetRoleTag(_0x57cff4.kind),
      canRename: _0x594be7.allowAssetRename === true && !_0x57cff4.isLibraryAsset,
      canDelete: Boolean(_0x594be7.allowDeleteAssetCard && !_0x57cff4.isLibraryAsset && !_0x171da2),
      draggable: _0x6723ad.draggable === true,
      cardClassName: _0x6723ad.cardClassName || "",
      cardAttributes: _0x6723ad.cardAttributes || "",
      shellClassName: _0x6723ad.shellClassName || "",
      accessoryHtml: _0x6723ad.accessoryHtml || "",
      cardMetaHtml: _0x6723ad.cardMetaHtml || "",
      cardMediaHtml: _0x6723ad.cardMediaHtml || "",
      fallbackImageUrl: _0x6723ad.fallbackImageUrl || "",
      workspaceAssetLibraryImage: _0x6723ad.workspaceAssetLibraryImage === true
    };
  }
  function _0x38517a(_0x285e18, _0x5b29e3 = {}) {
    if (_0x285e18 === "batch-generation") {
      const _0x32c43b = _0x5b29e3.state || _0x5b29e3;
      const _0x57a1c0 = Array.isArray(_0x32c43b.selectedAssetIds) ? _0x32c43b.selectedAssetIds.length : 0;
      const _0x55087e = _0x32c43b.isBatchGenerating === true;
      const _0x54c2f1 = _0x32c43b.assetBatchCancelRequested === true;
      return {
        selectedCount: _0x57a1c0,
        action: _0x55087e ? "cancel-asset-batch-generation" : "batch-generate-assets",
        isCancellation: _0x55087e,
        busy: false,
        cancelRequested: _0x54c2f1,
        disabled: _0x55087e ? _0x54c2f1 : !_0x57a1c0,
        label: _0x55087e ? "" + (_0x54c2f1 ? "已取消后续生成" : "取消后续生成") + (_0x57a1c0 ? " (" + _0x57a1c0 + ")" : "") : "批量生成" + (_0x57a1c0 ? " (" + _0x57a1c0 + ")" : ""),
        directMode: _0x55087e ? "" : getStoryAssetBatchDirectMode(_0x32c43b.assetFilter)
      };
    }
    if (_0x285e18 === "prompt-generation") {
      const _0x189c96 = _0x5b29e3.state || {};
      const _0xae2299 = _0x5b29e3.generationControl || {};
      const _0x19fe18 = Array.isArray(_0x189c96.selectedAssetIds) ? _0x189c96.selectedAssetIds.length : 0;
      const _0x1712cf = _0x189c96.assetSelectionMode === true && _0x19fe18 > 1;
      const _0x391627 = _0x1712cf && _0x189c96.isBatchGenerating === true;
      const _0xf176cb = _0x189c96.assetBatchCancelRequested === true;
      return {
        isMultiSelection: _0x1712cf,
        selectedCount: _0x19fe18,
        action: _0x391627 ? "cancel-asset-batch-generation" : "batch-generate-assets",
        isCancellation: _0x391627,
        busy: !_0x1712cf && _0xae2299.isGenerating === true,
        cancelRequested: _0xf176cb,
        disabled: _0x1712cf ? _0x391627 && _0xf176cb : Boolean(_0xae2299.disabled),
        label: _0x1712cf ? _0x391627 ? (_0xf176cb ? "已取消后续生成" : "取消后续生成") + " (" + _0x19fe18 + ")" : "批量生成 (" + _0x19fe18 + ")" : _0xae2299.label || "生成素材图"
      };
    }
    if (_0x285e18 === "library-selection") {
      const _0x26d6ae = Math.max(0, Math.trunc(Number(_0x5b29e3.selectedCount) || 0));
      const _0x170fc7 = Array.isArray(_0x5b29e3.projectAssets) ? _0x5b29e3.projectAssets : [];
      return {
        selectionMode: _0x5b29e3.selectionMode === true,
        selectedCount: _0x26d6ae,
        allSelected: _0x5b29e3.allSelected === true,
        targetGroups: ["character", "scene", "prop"].map(_0x3b2a97 => ({
          kind: _0x3b2a97,
          label: _0x5b29e3.getTabLabel?.(_0x3b2a97) || _0x3b2a97,
          targets: _0x170fc7.filter(_0x5a8016 => normalizeText(_0x5a8016?.kind) === _0x3b2a97).map(_0x2db866 => {
            const _0x34fe2c = getStoryAssetAppearances(_0x2db866);
            return {
              id: _0x2db866.id,
              kind: _0x2db866.kind,
              name: _0x2db866.name,
              appearanceCount: _0x34fe2c.length,
              appearances: _0x34fe2c.map(_0x1fd786 => ({
                id: _0x1fd786.id,
                name: _0x1fd786.name,
                imageUrl: _0x1fd786.imageUrl
              })),
              preview: getStoryAssetBaseAppearance(_0x2db866) || _0x34fe2c.find(_0x4bfcc5 => normalizeText(_0x4bfcc5?.imageUrl)) || _0x34fe2c[0] || {}
            };
          })
        }))
      };
    }
    if (_0x285e18 === "preset") {
      const _0x5c055a = _0x5b29e3.state || {};
      const _0x445069 = _0x5b29e3.asset || (Array.isArray(_0x5c055a.data?.assets) ? _0x5c055a.data.assets.find(_0x404fde => _0x404fde.id === _0x5c055a.selectedAssetId) : null);
      return projectPreset(_0x5c055a, _0x5b29e3.assetKind, _0x445069, _0x445069 ? getSelectedAppearance(_0x5c055a, _0x445069) : null);
    }
    if (_0x285e18 === "preview-actions") {
      return projectPreviewActions(_0x5b29e3.state || {}, _0x5b29e3.asset || {}, _0x5b29e3.appearance || {}, _0x5b29e3.generationControl || {}, _0x5b29e3.readOnly === true, resolveLibraryReference);
    }
    if (_0x285e18 === "voice-capsule") {
      const _0x4eff5c = _0x5b29e3.state || {};
      const _0x59d904 = _0x5b29e3.asset || {};
      return {
        visible: _0x59d904.kind === "character" && !_0x59d904.isLibraryAsset,
        hasReference: hasStoryCharacterVoiceReference(_0x59d904),
        isOpen: _0x5b29e3.isOpen === true,
        uploadLabel: normalizeText(_0x4eff5c.assetVoiceUploadLabel)
      };
    }
    if (_0x285e18 === "voice-player") {
      const _0xb4252b = _0x5b29e3.asset || {};
      return {
        visible: _0xb4252b.kind === "character" && !_0xb4252b.isLibraryAsset && hasStoryCharacterVoiceReference(_0xb4252b),
        id: _0xb4252b.id,
        name: _0xb4252b.name
      };
    }
    return {};
  }
  function _0x202997(_0x34e410 = {}, _0x3c21d1 = null, {
    showEmptyDescription = true,
    readOnly = false
  } = {}) {
    if (!_0x3c21d1) {
      return {
        empty: true,
        emptyDescription: _0x34e410.assetFilter === "library" ? "总素材中还没有可引用的图片或视频。" : "完成剧本分析后，角色、场景和道具会显示在这里。",
        showEmptyDescription: showEmptyDescription
      };
    }
    const _0x34e872 = _0x3c21d1.isLibraryAsset ? [_0x3c21d1] : getStoryAssetAppearances(_0x3c21d1);
    const _0x2835a2 = getSelectedAppearanceIndex(_0x34e410, _0x3c21d1);
    const _0x245ddb = getSelectedAppearance(_0x34e410, _0x3c21d1) || _0x3c21d1;
    const _0x53a72c = !_0x3c21d1.isLibraryAsset && !readOnly && _0x34e872.length > 1;
    const _0x5d68d9 = _0x3c21d1.kind === "character" && !_0x3c21d1.isLibraryAsset && !readOnly;
    const _0x45fb7a = _0x5d68d9 && isStoryAssetBaseAppearance(_0x3c21d1, _0x245ddb);
    const _0x94eee6 = getStoryAssetGenerationControlState(_0x34e410, _0x3c21d1.id, _0x245ddb.id);
    const _0x36188f = _0x34e410.characterVoiceEditor?.assetId === _0x3c21d1.id;
    const _0x46bb9d = _0x36188f && _0x34e410.characterVoicePanelMotion !== "to-asset";
    const _0x450bf2 = _0x34e410.characterVoicePanelMotion === "to-voice" ? "is-flipping-to-voice" : _0x34e410.characterVoicePanelMotion === "to-asset" ? "is-flipping-to-asset" : "";
    const _0x55561c = Array.isArray(_0x34e410.data?.assets) ? _0x34e410.data.assets.find(_0x36ddb9 => _0x36ddb9.id === _0x34e410.selectedAssetId) : _0x3c21d1;
    const _0x702636 = _0x55561c ? getSelectedAppearance(_0x34e410, _0x55561c) : _0x245ddb;
    return {
      empty: false,
      asset: {
        id: _0x3c21d1.id,
        name: normalizeText(_0x3c21d1.name) || "未命名素材",
        role: _0x3c21d1.role,
        kind: _0x3c21d1.kind,
        mediaKind: _0x3c21d1.mediaKind,
        isLibraryAsset: _0x3c21d1.isLibraryAsset === true,
        description: _0x3c21d1.description || ""
      },
      appearance: _0x245ddb,
      appearanceIndex: _0x2835a2,
      appearanceCount: _0x34e872.length,
      hasMultipleAppearances: _0x53a72c,
      supportsBaseAppearance: _0x5d68d9,
      isBaseAppearance: _0x45fb7a,
      canRename: _0x34e410.allowAssetRename === true && !_0x3c21d1.isLibraryAsset,
      isBaseAppearanceSelectionDisabled: Boolean(isStoryAssetCardLoading(_0x34e410, _0x3c21d1.id)),
      canSetBaseAppearance: _0x53a72c && !isStoryAssetCardLoading(_0x34e410, _0x3c21d1.id),
      showStyleReference: _0x45fb7a && _0x34e410.allowAssetStyleReference !== false,
      styleReference: {
        referenceImageUrl: _0x245ddb.referenceImageUrl,
        disabled: Boolean(_0x94eee6.disabled)
      },
      voiceCapsule: {
        visible: _0x3c21d1.kind === "character" && !_0x3c21d1.isLibraryAsset,
        hasReference: hasStoryCharacterVoiceReference(_0x3c21d1),
        isOpen: _0x46bb9d,
        uploadLabel: normalizeText(_0x34e410.assetVoiceUploadLabel)
      },
      voicePlayer: {
        visible: _0x3c21d1.kind === "character" && !_0x3c21d1.isLibraryAsset && hasStoryCharacterVoiceReference(_0x3c21d1)
      },
      previewActions: projectPreviewActions(_0x34e410, _0x3c21d1, _0x245ddb, _0x94eee6, readOnly, resolveLibraryReference),
      generationControl: _0x94eee6,
      promptControl: _0x38517a("prompt-generation", {
        state: _0x34e410,
        generationControl: _0x94eee6
      }),
      preset: projectPreset(_0x34e410, _0x3c21d1.kind, _0x55561c, _0x702636),
      imageModel: {
        modelId: _0x34e410.models?.image,
        provider: _0x34e410.imageProvider,
        generationParams: _0x34e410.imageGenerationParams
      },
      readOnly: readOnly,
      allowDeleteAppearance: Boolean(_0x34e410.allowDeleteAssetAppearance && _0x53a72c && !_0x45fb7a),
      isGeneratingAppearance: Boolean(_0x94eee6.isGenerating),
      motionClass: _0x34e410.assetAppearanceMotion ? "is-sliding-" + _0x34e410.assetAppearanceMotion : "",
      panel: {
        isVoice: _0x46bb9d,
        motionClass: _0x450bf2,
        isAnimating: Boolean(_0x450bf2)
      },
      voicePanel: projectVoicePanel(_0x34e410, _0x3c21d1, _0x46bb9d),
      captionMeta: (_0x245ddb.name || _0x3c21d1.role || "素材") + " · " + formatStoryAssetOccurrences(_0x245ddb.occurrences || _0x3c21d1.occurrences || "当前项目") + (_0x53a72c ? " · " + (_0x2835a2 + 1) + "/" + _0x34e872.length : "")
    };
  }
  return Object.freeze({
    projectAssetCard: (..._0x172971) => freezeSnapshot(_0x157a1f(..._0x172971)),
    projectAssetControl: (..._0x49fdc8) => freezeSnapshot(_0x38517a(..._0x49fdc8)),
    projectAssetDetail: (..._0x1b0c45) => freezeSnapshot(_0x202997(..._0x1b0c45))
  });
}