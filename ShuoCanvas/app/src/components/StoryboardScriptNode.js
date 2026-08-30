import a548_0x27f1b3 from "../core/stores/appStore.js";
import { submitTask } from "../core/generationTaskRuntime.js";
import { resolveGenerationButtonMode } from "../core/generationTaskUiState.js";
import { buildCanonicalStoryboardScriptJson, createDefaultStoryboardScriptState, getStoryboardScriptDisplayColumns, getStoryboardScriptDefaultName, normalizeStoryboardScriptSelectedRowIndexes, normalizeStoryboardScriptMediaMode, normalizeStoryboardScriptViewMode, resolveStoryboardScriptResizeMinSize, serializeCanonicalStoryboardScriptJson, serializeStoryboardScriptRowsToCsv, STORYBOARD_SCRIPT_COLUMNS, STORYBOARD_SCRIPT_TABLE_EXPORT_MIME, STORYBOARD_SCRIPT_TEXT_MODEL, STORYBOARD_SCRIPT_TEXT_PROVIDER } from "../core/storyboardScriptFactory.js";
import { generateId } from "../core/math.js";
import { buildStoryboardScriptImageSystemPrompt, buildStoryboardScriptImagePrompt, buildStoryboardScriptPrompt, buildStoryboardScriptTextOnlySystemPrompt, buildStoryboardScriptTextOnlyPrompt, buildStoryboardScriptVideoSystemPrompt, buildStoryboardScriptVideoPrompt, extractRequestedStoryboardShotCount, normalizeStoryboardScriptGenerationResult, STORYBOARD_SCRIPT_GENERATION_SCHEMA_VERSION } from "../core/storyboardScriptGeneration.js";
import { getModelManifest, resolveModelManifest, sanitizeModelUiSchemaParams } from "../manifests/index.js";
import { activateMenuKeyboard } from "../modules/floatingMenuKeyboard.js";
import { getPromptAssetInputRefsFromNode, insertPresetPromptIntoEditor, previewPresetPromptInEditor, _rehydratePromptPills, resolvePresetPromptTextWithTextRefs, resolvePromptTextWithTextRefs, shouldUsePromptPreviewForPreset } from "../modules/nodePromptShared.js";
import { resolveEffectiveInputKind } from "../modules/modelInputPolicy.js";
import { commit } from "../modules/history.js";
import { resetGenerateButtonIdleUi, setGenerateButtonLoadingUi } from "../modules/previewGenerateButtonUi.js";
import { getNanoBananaSelectionFromModel } from "../modules/nanoBananaModeRules.js";
import { getAIGenerationDefaultSizeByType } from "../services/fileService.js";
import { resolveGenerationInputImageUrl } from "../services/imageReferenceUrlService.js";
import { resolveCanvasVideoUrl } from "../services/canvasMediaLocalService.js";
import { saveTextDownload } from "../services/downloadSaveService.js";
import { sanitizePromptHtml } from "../utils/dom.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { generateText } from "../../api/aiTextApi.js";
import { extractStoryboardVideoFramesFromServer, STORYBOARD_VIDEO_FRAME_LIMIT } from "../../api/storyboardVideoFrameApi.js";
import { getDisplayModelName } from "../modules/providers.js";
import { createBatchSpawnLayoutNearNode } from "../modules/nodeSpawn.js";
import { DEFAULT_IMAGE_NODE_MODEL, DEFAULT_IMAGE_NODE_PROVIDER } from "./aigenImage/defaults.js";
import { bindImageModelMenuSubmenu, buildImageModelMenuHTML, renderImageModelTriggerIconHTML, resolveApimartImageMenuSelection, resolveGrsaiImageMenuSelection, resolveRunningHubModelImageMenuSelection, resolveRunningHubWorkflowImageMenuSelection, resolveVolcengineImageMenuSelection, setImageModelTriggerIcon } from "./aigenImage/uiModuleModelHelpers.js";
import { buildImageDisplayRatioResizePatch } from "./shared/generationDisplayPolicy.js";
import { bindDreaminaImageMenu, normalizeDreaminaImageModel } from "./aigenImage/dreaminaModelMenuHelper.js";
import { bindModelUiSchemaControls, buildModelUiSchemaDefaultParams, hasVisibleModelUiSchema, renderModelUiSchemaControls, syncModelUiSchemaControls } from "./aigenImage/uiSchemaRenderer.js";
import { buildTextModelSmallIconHTML } from "./aigenText/apimartTextModelMenu.js";
import { createNodeResizeHandle } from "./aigenText/nodeResizeUi.js";
import { _renderSharedRefBar } from "./AIGenTextNode.js";
import { closeNodeFooterMenus } from "./shared/nodeFooterControls.js";
import { buildSharedPromptPanel } from "./sharedPromptPanel.js";
import { t } from "../i18n/index.js";
const CARD_FIELDS = Object.freeze(["景别", "场景", "画面描述", "角色", "角色描述", "角色动作", "情绪", "角色图", "参考", "图片提示词", "视频提示词", "对白", "音效"]);
const CARD_FIELD_KEYS = new Set(CARD_FIELDS);
const NARROW_TABLE_COLUMNS = new Set(["镜号", "时长"]);
const COMPACT_TABLE_COLUMNS = new Set(["景别", "场景", "情绪"]);
const WIDE_TABLE_COLUMNS = new Set(["画面描述", "角色描述", "图片提示词", "视频提示词"]);
const STORYBOARD_SCRIPT_TEXT_REQUEST_TIMEOUT_MS = 1000000;
const STORYBOARD_TOOLBAR_GENERATE_ICON_HTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 4v16\"/><path d=\"M3 9h18\"/><path d=\"M3 14h18\"/><path d=\"M13 17l2 2 4-4\"/></svg>";
const STORYBOARD_TOOLBAR_FULLSCREEN_ICON_HTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/><path d=\"M16 3h3a2 2 0 0 1 2 2v3\"/><path d=\"M21 16v3a2 2 0 0 1-2 2h-3\"/><path d=\"M8 21H5a2 2 0 0 1-2-2v-3\"/></svg>";
const STORYBOARD_TOOLBAR_DOWNLOAD_ICON_HTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/></svg>";
const STORYBOARD_QUEUE_ICON_HTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M5 7h14\"/><path d=\"M5 12h14\"/><path d=\"M5 17h14\"/></svg>";
const STORYBOARD_COLUMN_I18N_KEYS = Object.freeze({
  镜号: "shotNo",
  时长: "duration",
  景别: "shotSize",
  场景: "scene",
  画面描述: "visualDescription",
  角色: "character",
  角色描述: "characterDescription",
  角色动作: "characterAction",
  情绪: "emotion",
  角色图: "characterImage",
  参考: "reference",
  图片提示词: "imagePrompt",
  视频提示词: "videoPrompt",
  对白: "dialogue",
  音效: "soundEffect"
});
const STORYBOARD_IMAGE_BATCH_PADDING = 30;
const STORYBOARD_IMAGE_BATCH_TITLE_HEIGHT = 20;
function storyboardScriptText(_0xf1d024, _0x2b6956 = {}) {
  return t("storyboardScript." + _0xf1d024, _0x2b6956);
}
function getStoryboardColumnLabel(_0x27055d, _0x42748a = "") {
  const _0xe3d934 = STORYBOARD_COLUMN_I18N_KEYS[String(_0x27055d || "")];
  if (!_0xe3d934) {
    return String(_0x42748a || _0x27055d || "");
  }
  return storyboardScriptText("columns." + _0xe3d934);
}
const getStateSnapshot = () => typeof a548_0x27f1b3.getStateRaw === "function" ? a548_0x27f1b3.getStateRaw() : a548_0x27f1b3.getState();
function getSelectedRowIndexes(_0x2320fa) {
  return normalizeStoryboardScriptSelectedRowIndexes(_0x2320fa?.selectedRowIndexes, Array.isArray(_0x2320fa?.rows) ? _0x2320fa.rows.length : 0);
}
function resolveStoryboardColumnDensity(_0x4cb0a1) {
  const _0xbdaa09 = String(_0x4cb0a1 || "");
  if (NARROW_TABLE_COLUMNS.has(_0xbdaa09)) {
    return "narrow";
  }
  if (COMPACT_TABLE_COLUMNS.has(_0xbdaa09)) {
    return "compact";
  }
  if (WIDE_TABLE_COLUMNS.has(_0xbdaa09)) {
    return "wide";
  }
  return "normal";
}
function getStoryboardColumnsForMediaMode(_0x5420c7, _0x2bdb0d = []) {
  return getStoryboardScriptDisplayColumns({
    mediaMode: _0x5420c7,
    rows: _0x2bdb0d
  });
}
function getStoryboardCardFieldsForMediaMode(_0x50904c, _0x4e423a = []) {
  return getStoryboardScriptDisplayColumns({
    mediaMode: _0x50904c,
    rows: _0x4e423a
  }).map(_0x51793e => _0x51793e.key).filter(_0xb9b792 => CARD_FIELD_KEYS.has(_0xb9b792));
}
function formatCellValue(_0x27d0d7) {
  if (_0x27d0d7 == null) {
    return "";
  }
  if (typeof _0x27d0d7 === "string") {
    return _0x27d0d7;
  }
  if (typeof _0x27d0d7 === "number" || typeof _0x27d0d7 === "boolean") {
    return String(_0x27d0d7);
  }
  try {
    return JSON.stringify(_0x27d0d7);
  } catch {
    return String(_0x27d0d7);
  }
}
const STORYBOARD_IMAGE_PLACEHOLDER_PATTERN = /@图片\d+/g;
function normalizeStoryboardImagePlaceholder(_0x24e495) {
  return String(_0x24e495 || "").trim().replace(/\s+/g, "");
}
function extractStoryboardImagePlaceholders(_0x10d2b3) {
  return String(_0x10d2b3 || "").match(STORYBOARD_IMAGE_PLACEHOLDER_PATTERN) || [];
}
function extractGeneratedText(_0x2685f1) {
  if (typeof _0x2685f1 === "string") {
    return _0x2685f1;
  }
  return String(_0x2685f1?.text || _0x2685f1?.outputText || _0x2685f1?.output || _0x2685f1?.content || _0x2685f1?.message || "");
}
function getStoryboardImagePlaceholder(_0x2f3faf) {
  return "@图片" + Math.max(1, Math.trunc(Number(_0x2f3faf) || 1));
}
function getStoryboardVideoPlaceholder(_0xa4247a) {
  return "@视频" + Math.max(1, Math.trunc(Number(_0xa4247a) || 1));
}
function buildStoryboardImageRefMap(_0x586108 = []) {
  const _0x3826fe = Array.isArray(_0x586108) ? _0x586108 : [];
  const _0x3db150 = new Map();
  _0x3826fe.forEach((_0x17234e, _0x20c465) => {
    const _0x571608 = normalizeStoryboardImagePlaceholder(_0x17234e?.label) || getStoryboardImagePlaceholder(_0x20c465 + 1);
    const _0x3c2a14 = String(_0x17234e?.url || "").trim();
    if (!_0x571608 || !_0x3c2a14) {
      return;
    }
    _0x3db150.set(_0x571608, {
      ..._0x17234e,
      label: _0x571608,
      url: _0x3c2a14
    });
  });
  return _0x3db150;
}
function mergeStoryboardImageRefs(..._0x270206) {
  const _0x447b32 = [];
  const _0x444b1d = new Set();
  _0x270206.flat().forEach(_0x2f98c1 => {
    const _0x43c363 = normalizeStoryboardImagePlaceholder(_0x2f98c1?.label);
    const _0x167092 = String(_0x2f98c1?.url || "").trim();
    if (!_0x43c363 || !_0x167092 || _0x444b1d.has(_0x43c363)) {
      return;
    }
    _0x444b1d.add(_0x43c363);
    _0x447b32.push({
      ..._0x2f98c1,
      label: _0x43c363,
      url: _0x167092,
      type: "image"
    });
  });
  return _0x447b32;
}
function pickStoryboardIndexedItem(_0x289da3, _0x5d415e) {
  if (!Array.isArray(_0x289da3) || _0x289da3.length === 0) {
    return null;
  }
  const _0x4e0746 = Number.isFinite(Number(_0x5d415e)) ? Math.max(0, Math.trunc(Number(_0x5d415e))) : 0;
  return _0x289da3[Math.min(_0x4e0746, _0x289da3.length - 1)] || null;
}
function toStoryboardUsableMediaUrl(_0x30ae86) {
  const _0x3d9c71 = String(_0x30ae86 || "").trim();
  if (!_0x3d9c71) {
    return "";
  }
  if (/^(?:https?:|blob:|data:|\/)/i.test(_0x3d9c71)) {
    return _0x3d9c71;
  }
  return localPathToUrl(_0x3d9c71) || "";
}
function resolveStoryboardVideoRefUrl(_0xc20a8f = {}) {
  const _0x59d2f1 = pickStoryboardIndexedItem(_0xc20a8f?.videos, _0xc20a8f?.mainVideoIndex);
  const _0x3a6989 = [resolveCanvasVideoUrl(_0x59d2f1), resolveCanvasVideoUrl(_0xc20a8f), _0x59d2f1?.videoUrl, _0x59d2f1?.url, _0x59d2f1?.src, _0x59d2f1?.localPath, _0xc20a8f?.videoUrl, _0xc20a8f?.url, _0xc20a8f?.src, _0xc20a8f?.localPath];
  return _0x3a6989.map(_0x8be494 => toStoryboardUsableMediaUrl(_0x8be494)).find(Boolean) || "";
}
function createStoryboardRoleImagePreview(_0x11cc4e, _0x4f3410 = new Map()) {
  const _0x17b286 = extractStoryboardImagePlaceholders(_0x11cc4e);
  const _0x15da83 = _0x17b286.map(_0x1d29f5 => _0x4f3410.get(normalizeStoryboardImagePlaceholder(_0x1d29f5))).filter(_0x1e9855 => _0x1e9855?.url);
  if (_0x15da83.length === 0) {
    return null;
  }
  const _0x15736d = document.createElement("span");
  _0x15736d.className = "storyboard-script-role-images";
  _0x15da83.slice(0, 3).forEach(_0x5e7686 => {
    const _0x404f6e = document.createElement("img");
    _0x404f6e.className = "storyboard-script-role-image-thumb";
    _0x404f6e.src = _0x5e7686.url;
    _0x404f6e.alt = _0x5e7686.label || getStoryboardColumnLabel("角色图");
    _0x404f6e.loading = "lazy";
    _0x404f6e.draggable = false;
    _0x404f6e.title = _0x5e7686.label || "";
    _0x15736d.appendChild(_0x404f6e);
  });
  if (_0x15da83.length > 3) {
    const _0x512e20 = document.createElement("span");
    _0x512e20.className = "storyboard-script-role-image-more";
    _0x512e20.textContent = "+" + (_0x15da83.length - 3);
    _0x15736d.appendChild(_0x512e20);
  }
  return _0x15736d;
}
function appendStoryboardCellDisplay(_0x499092, _0x1619a9, _0x4f6f22, _0x406a15 = new Map()) {
  const _0xa9ef30 = formatCellValue(_0x4f6f22);
  _0x499092.dataset.storyboardRawValue = _0xa9ef30;
  _0x499092.replaceChildren();
  _0x499092.classList.remove("storyboard-script-image-cell");
  if (_0x1619a9 === "角色图" || _0x1619a9 === "参考") {
    const _0x27a332 = createStoryboardRoleImagePreview(_0xa9ef30, _0x406a15);
    if (_0x27a332) {
      _0x499092.classList.add("storyboard-script-image-cell");
      _0x499092.appendChild(_0x27a332);
      return;
    }
  }
  _0x499092.textContent = _0xa9ef30;
}
function buildStoryboardBodyRenderSignature(_0x2fe6d7, _0x465a83 = []) {
  const _0x1c9d37 = mergeStoryboardImageRefs(_0x465a83, _0x2fe6d7?.referenceImageRefs).map(_0x1f80b2 => ({
    label: normalizeStoryboardImagePlaceholder(_0x1f80b2?.label),
    url: String(_0x1f80b2?.url || "").trim()
  }));
  try {
    return JSON.stringify({
      viewMode: normalizeStoryboardScriptViewMode(_0x2fe6d7?.viewMode),
      mediaMode: normalizeStoryboardScriptMediaMode(_0x2fe6d7?.mediaMode),
      selectionMode: _0x2fe6d7?.selectionMode === true,
      rows: Array.isArray(_0x2fe6d7?.rows) ? _0x2fe6d7.rows : [],
      refs: _0x1c9d37
    });
  } catch {
    return "" + Date.now();
  }
}
function collectDirectStoryboardImageRefs(_0x2f6f4f = [], _0x478c6e = {}) {
  const _0xd0a14e = [];
  for (const _0x17ff3f of Array.isArray(_0x2f6f4f) ? _0x2f6f4f : []) {
    const _0x2d1fb2 = _0x478c6e?.[_0x17ff3f?.sourceId];
    if (!_0x2d1fb2) {
      continue;
    }
    if (resolveEffectiveInputKind(_0x2d1fb2, _0x17ff3f) !== "image") {
      continue;
    }
    const _0x14bc04 = resolveGenerationInputImageUrl(_0x2d1fb2);
    if (!_0x14bc04) {
      continue;
    }
    _0xd0a14e.push({
      label: getStoryboardImagePlaceholder(_0xd0a14e.length + 1),
      url: _0x14bc04,
      type: "image",
      sourceId: String(_0x17ff3f?.sourceId || ""),
      source: "node"
    });
  }
  return _0xd0a14e;
}
function collectDirectStoryboardVideoRefs(_0x4f8e37 = [], _0x35a612 = {}) {
  const _0x25735a = [];
  for (const _0x25ceae of Array.isArray(_0x4f8e37) ? _0x4f8e37 : []) {
    const _0x2d47d7 = _0x35a612?.[_0x25ceae?.sourceId];
    if (!_0x2d47d7) {
      continue;
    }
    if (resolveEffectiveInputKind(_0x2d47d7, _0x25ceae) !== "video") {
      continue;
    }
    const _0x347802 = resolveStoryboardVideoRefUrl(_0x2d47d7);
    if (!_0x347802) {
      continue;
    }
    _0x25735a.push({
      label: getStoryboardVideoPlaceholder(_0x25735a.length + 1),
      url: _0x347802,
      type: "video",
      sourceId: String(_0x25ceae?.sourceId || ""),
      source: "node"
    });
  }
  return _0x25735a;
}
function normalizeStoryboardImageInputRefs({
  directImageRefs = [],
  promptAssetRefs = [],
  hiddenAssetRefs = []
} = {}) {
  const _0x54ab87 = [];
  const _0x2b43e9 = (_0x5b3914, _0x4bf930 = "") => {
    const _0x5c20fc = String(_0x5b3914?.url || "").trim();
    if (!_0x5c20fc) {
      return;
    }
    const _0x5cd2c4 = String(_0x5b3914?.placeholder || _0x5b3914?.label || _0x4bf930 || "").trim() || getStoryboardImagePlaceholder(_0x54ab87.length + 1);
    _0x54ab87.push({
      ..._0x5b3914,
      label: _0x5cd2c4,
      url: _0x5c20fc,
      type: "image"
    });
  };
  directImageRefs.forEach(_0xad63ba => _0x2b43e9(_0xad63ba, _0xad63ba?.label));
  promptAssetRefs.filter(_0x365ff0 => _0x365ff0?.type === "image").forEach(_0x13811a => _0x2b43e9({
    ..._0x13811a,
    label: ""
  }, _0x13811a?.placeholder));
  hiddenAssetRefs.filter(_0x1d88c8 => _0x1d88c8?.type === "image").forEach(_0x9d75dc => {
    _0x2b43e9({
      ..._0x9d75dc,
      label: ""
    }, getStoryboardImagePlaceholder(_0x54ab87.length + 1));
  });
  return _0x54ab87.map((_0x3f44ea, _0x432d83) => ({
    ..._0x3f44ea,
    label: _0x3f44ea.label || getStoryboardImagePlaceholder(_0x432d83 + 1)
  }));
}
function normalizeStoryboardVideoInputRefs({
  directVideoRefs = [],
  promptAssetRefs = [],
  hiddenAssetRefs = []
} = {}) {
  const _0x14e154 = [];
  const _0x1e2d40 = (_0x1f232a, _0x5b095f = "") => {
    const _0x32bed8 = String(_0x1f232a?.url || "").trim();
    if (!_0x32bed8) {
      return;
    }
    const _0x2ebab5 = String(_0x1f232a?.placeholder || _0x1f232a?.label || _0x5b095f || "").trim() || getStoryboardVideoPlaceholder(_0x14e154.length + 1);
    _0x14e154.push({
      ..._0x1f232a,
      label: _0x2ebab5,
      url: _0x32bed8,
      type: "video"
    });
  };
  directVideoRefs.forEach(_0x3b2207 => _0x1e2d40(_0x3b2207, _0x3b2207?.label));
  promptAssetRefs.filter(_0x3dd10f => _0x3dd10f?.type === "video").forEach(_0x26bd24 => _0x1e2d40({
    ..._0x26bd24,
    label: ""
  }, _0x26bd24?.placeholder));
  hiddenAssetRefs.filter(_0x298dd8 => _0x298dd8?.type === "video").forEach(_0x50bbab => {
    _0x1e2d40({
      ..._0x50bbab,
      label: ""
    }, getStoryboardVideoPlaceholder(_0x14e154.length + 1));
  });
  return _0x14e154.map((_0x40dd0e, _0x2d6777) => ({
    ..._0x40dd0e,
    label: _0x40dd0e.label || getStoryboardVideoPlaceholder(_0x2d6777 + 1)
  }));
}
function buildStoryboardReferenceSummary({
  imageLabels = [],
  videoLabels = []
} = {}) {
  const _0x58f04c = [];
  if (Array.isArray(imageLabels) && imageLabels.length > 0) {
    _0x58f04c.push("参考图片：" + imageLabels.join("、"));
  }
  if (Array.isArray(videoLabels) && videoLabels.length > 0) {
    _0x58f04c.push("参考视频：" + videoLabels.join("、"));
  }
  return _0x58f04c.join("\n");
}
function formatStoryboardVideoTime(_0x25445b) {
  const _0x143abe = Math.max(0, Number(_0x25445b) || 0);
  const _0x1683e1 = Math.floor(_0x143abe);
  const _0x4b435f = Math.floor(_0x1683e1 / 60);
  const _0x13be80 = _0x1683e1 % 60;
  const _0x54b244 = Math.round((_0x143abe - _0x1683e1) * 10);
  return String(_0x4b435f).padStart(2, "0") + ":" + String(_0x13be80).padStart(2, "0") + "." + _0x54b244;
}
function formatStoryboardVideoTimeRange(_0x1e277b = {}) {
  const _0x22e85a = formatStoryboardVideoTime(_0x1e277b.start);
  const _0x18ab02 = formatStoryboardVideoTime(Number(_0x1e277b.end) > Number(_0x1e277b.start) ? _0x1e277b.end : _0x1e277b.captureTime);
  return _0x22e85a + "-" + _0x18ab02;
}
function buildStoryboardVideoFrameReferenceSummary(_0x49e12a = []) {
  const _0xf18078 = Array.isArray(_0x49e12a) ? _0x49e12a : [];
  if (_0xf18078.length === 0) {
    return "";
  }
  return _0xf18078.map(_0x107c05 => {
    const _0x342d87 = normalizeStoryboardImagePlaceholder(_0x107c05?.label);
    const _0x5948e5 = String(_0x107c05?.videoLabel || "@视频1").trim();
    const _0x5c7508 = String(_0x107c05?.timeRange || "").trim();
    const _0x387120 = _0x107c05?.sentAsImage === false ? "（仅提供时间码，画面请结合原视频判断）" : "";
    return _0x342d87 + "：来自 " + _0x5948e5 + (_0x5c7508 ? " " + _0x5c7508 : "") + _0x387120;
  }).filter(Boolean).join("\n");
}
function getStoryboardModelImageInputLimit(_0x20beca, _0xd43e97) {
  const _0x5b8b = getModelManifest(_0x20beca, _0xd43e97);
  const _0x502335 = Number(_0x5b8b?.inputSlots?.maxByKind?.image);
  if (Number.isFinite(_0x502335) && _0x502335 > 0) {
    return Math.trunc(_0x502335);
  } else {
    return STORYBOARD_VIDEO_FRAME_LIMIT;
  }
}
function chunkStoryboardFrameRefs(_0x30e841 = [], _0x3c922b = STORYBOARD_VIDEO_FRAME_LIMIT) {
  const _0x4bf828 = Array.isArray(_0x30e841) ? _0x30e841 : [];
  const _0x52a797 = Math.max(1, Math.trunc(Number(_0x3c922b) || 1));
  const _0x587a91 = [];
  for (let _0x2b3ba1 = 0; _0x2b3ba1 < _0x4bf828.length; _0x2b3ba1 += _0x52a797) {
    _0x587a91.push(_0x4bf828.slice(_0x2b3ba1, _0x2b3ba1 + _0x52a797));
  }
  return _0x587a91;
}
function buildCombinedStoryboardBatchJson({
  rows = [],
  title = getStoryboardScriptDefaultName()
} = {}) {
  const _0x4d6fde = (Array.isArray(rows) ? rows : []).map((_0x31d5ec, _0x1d7e6a) => ({
    ..._0x31d5ec,
    镜号: String(_0x1d7e6a + 1)
  }));
  return JSON.stringify({
    schemaVersion: STORYBOARD_SCRIPT_GENERATION_SCHEMA_VERSION,
    type: "storyboard-script",
    sourceMode: "video",
    title: String(title || getStoryboardScriptDefaultName()).trim() || getStoryboardScriptDefaultName(),
    detectedIntent: {
      shotCount: _0x4d6fde.length,
      language: "zh-CN"
    },
    rows: _0x4d6fde
  }, null, 2);
}
async function runStoryboardScriptGenerationPayload(_0x14b0ed) {
  const _0x4ce276 = Array.isArray(_0x14b0ed?.videoFrameBatches) ? _0x14b0ed.videoFrameBatches.filter(_0x2174b4 => Array.isArray(_0x2174b4) && _0x2174b4.length > 0) : [];
  if (_0x14b0ed?.sourceMode !== "video" || _0x4ce276.length <= 1) {
    return generateText(_0x14b0ed);
  }
  const _0x6a4a9d = [];
  let _0x541108 = "";
  for (const _0x4593e7 of _0x4ce276) {
    const _0xdf2e2c = _0x4593e7.map(_0x147b47 => _0x147b47.url).filter(Boolean);
    const _0x151c25 = buildStoryboardScriptVideoPrompt(_0x14b0ed.rawPromptText || "", {
      videoCount: Array.isArray(_0x14b0ed.inputVideoUrls) ? _0x14b0ed.inputVideoUrls.length : 0,
      videoLabels: _0x14b0ed.videoLabels,
      videoFrameSummary: buildStoryboardVideoFrameReferenceSummary(_0x4593e7.map(_0x2ba7f0 => ({
        ..._0x2ba7f0,
        sentAsImage: true
      })))
    });
    const _0x2c1813 = await generateText({
      ..._0x14b0ed,
      prompt: _0x151c25,
      inputImageUrls: _0xdf2e2c,
      inputUrls: [..._0xdf2e2c, ...(_0x14b0ed.inputVideoUrls || [])]
    });
    const _0x5d0b7c = normalizeStoryboardScriptGenerationResult(extractGeneratedText(_0x2c1813).trim(), {
      requireMarker: true,
      sourceMode: "video"
    });
    if (!_0x5d0b7c.ok) {
      throw new Error(storyboardScriptText("errors.invalidJsonTooManyFrames"));
    }
    if (!_0x541108) {
      _0x541108 = _0x5d0b7c.title;
    }
    _0x6a4a9d.push(..._0x5d0b7c.rows);
  }
  return {
    text: buildCombinedStoryboardBatchJson({
      rows: _0x6a4a9d,
      title: _0x541108 || getStoryboardScriptDefaultName()
    })
  };
}
function resolveStoryboardScriptTextModel(_0x3cb92d = {}) {
  const _0x358dab = String(_0x3cb92d.storyboardScript?.model || _0x3cb92d.model || STORYBOARD_SCRIPT_TEXT_MODEL).trim();
  return _0x358dab || STORYBOARD_SCRIPT_TEXT_MODEL;
}
function resolveStoryboardScriptTextProvider(_0xc07f17 = {}) {
  const _0x1937ec = String(_0xc07f17.storyboardScript?.provider || _0xc07f17.provider || STORYBOARD_SCRIPT_TEXT_PROVIDER).trim();
  return _0x1937ec || STORYBOARD_SCRIPT_TEXT_PROVIDER;
}
function buildStoryboardScriptStatePatch({
  current: _0x7ec6f8,
  prompt: _0x28dc43,
  model: _0x4738c4,
  provider: _0x3b7f24,
  sourceMode = "",
  status: _0x1c23d3,
  normalized = null,
  error = "",
  referenceImageRefs = null
}) {
  const _0x3ec0d4 = normalized?.rows ?? _0x7ec6f8.rows ?? [];
  const _0x409b72 = buildCanonicalStoryboardScriptJson({
    ..._0x7ec6f8,
    ...(normalized || {}),
    rows: _0x3ec0d4
  });
  return {
    ..._0x7ec6f8,
    version: 1,
    viewMode: _0x7ec6f8.viewMode || "list",
    prompt: _0x28dc43,
    model: _0x4738c4,
    provider: _0x3b7f24,
    sourceMode: normalized?.sourceMode || sourceMode || _0x7ec6f8.sourceMode || "text",
    isGenerating: _0x1c23d3 === "running",
    jobStatus: _0x1c23d3,
    jobError: error,
    rawJson: normalized?.rawJson ?? _0x7ec6f8.rawJson ?? "",
    canonicalJson: JSON.stringify(_0x409b72, null, 2),
    rows: _0x3ec0d4,
    selectedRowIndexes: normalized ? [] : normalizeStoryboardScriptSelectedRowIndexes(_0x7ec6f8.selectedRowIndexes, _0x3ec0d4.length),
    selectionMode: normalized ? false : _0x7ec6f8.selectionMode === true,
    title: _0x409b72.title,
    detectedIntent: _0x409b72.detectedIntent,
    referenceImageRefs: Array.isArray(referenceImageRefs) ? referenceImageRefs : Array.isArray(_0x7ec6f8.referenceImageRefs) ? _0x7ec6f8.referenceImageRefs : [],
    warnings: normalized?.warnings ?? _0x7ec6f8.warnings ?? [],
    updatedAt: Date.now()
  };
}
function createToolbarButton({
  action: _0x2b1644,
  label: _0xf672cf,
  tooltip: _0xcdf7f3,
  iconHtml: _0x283126,
  showLabel = false
}) {
  const _0x10761e = document.createElement("button");
  _0x10761e.type = "button";
  _0x10761e.className = ["ftb-btn", showLabel ? "" : "icon-only", "act-" + _0x2b1644].filter(Boolean).join(" ");
  if (!showLabel) {
    _0x10761e.dataset.tooltip = _0xcdf7f3 || _0xf672cf;
  }
  _0x10761e.setAttribute("aria-label", _0xf672cf);
  _0x10761e.innerHTML = showLabel ? _0x283126 + "<span>" + _0xf672cf + "</span>" : _0x283126;
  return _0x10761e;
}
function setToolbarButtonLabel(_0x431348, _0x403821) {
  if (!_0x431348) {
    return;
  }
  _0x431348.setAttribute("aria-label", _0x403821);
  const _0x6f2821 = _0x431348.querySelector("span");
  if (_0x6f2821) {
    _0x6f2821.textContent = _0x403821;
    delete _0x431348.dataset.tooltip;
  } else {
    _0x431348.dataset.tooltip = _0x403821;
  }
}
function replaceModelTriggerIcon(_0x2fca30, _0x30d511) {
  const _0x493ce9 = _0x2fca30?.firstElementChild;
  const _0x73123c = String(_0x30d511 || "").trim();
  if (!_0x493ce9 || !_0x73123c) {
    return;
  }
  const _0x2ab070 = _0x2fca30.dataset?.storyboardModelIconHtml || "";
  if (_0x2ab070 === _0x73123c) {
    return;
  }
  if (!_0x2ab070 && String(_0x493ce9.outerHTML || "").trim() === _0x73123c) {
    _0x2fca30.dataset.storyboardModelIconHtml = _0x73123c;
    return;
  }
  const _0xd71eaa = document.createElement("template");
  _0xd71eaa.innerHTML = _0x73123c;
  const _0x146a39 = _0xd71eaa.content.firstElementChild;
  if (!_0x146a39) {
    return;
  }
  _0x2fca30.dataset.storyboardModelIconHtml = _0x73123c;
  _0x493ce9.replaceWith(_0x146a39);
}
function escapePromptTextForHtml(_0x1eb8d0) {
  return String(_0x1eb8d0 || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function getStoryboardRowImagePrompt(_0x10b119) {
  if (!_0x10b119 || typeof _0x10b119 !== "object") {
    return "";
  }
  return formatCellValue(_0x10b119.图片提示词 ?? _0x10b119.imagePrompt ?? _0x10b119.image_prompt ?? _0x10b119.imagePromptText ?? "").trim();
}
function getStoryboardRowShotNo(_0x409aa9, _0x3e9b4a) {
  return formatCellValue(_0x409aa9?.镜号 ?? _0x409aa9?.shotNo ?? _0x409aa9?.shotNumber ?? _0x3e9b4a + 1).trim();
}
function clonePlainObject(_0x5b0e33) {
  if (!_0x5b0e33 || typeof _0x5b0e33 !== "object" || Array.isArray(_0x5b0e33)) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(_0x5b0e33));
  } catch {
    return {
      ..._0x5b0e33
    };
  }
}
function getPlainObject(_0x5915ca) {
  if (_0x5915ca && typeof _0x5915ca === "object" && !Array.isArray(_0x5915ca)) {
    return {
      ..._0x5915ca
    };
  } else {
    return {};
  }
}
function getImageNodeSizeForAspectRatio(_0x34bcd7) {
  const _0x46ebd5 = getAIGenerationDefaultSizeByType("ai-image");
  const _0x27b75f = buildImageDisplayRatioResizePatch({
    nodeData: {
      x: 0,
      y: 0,
      width: _0x46ebd5.width,
      height: _0x46ebd5.height
    },
    ratioValue: _0x34bcd7,
    minSide: Math.min(_0x46ebd5.width, _0x46ebd5.height)
  });
  return {
    width: Number(_0x27b75f.width) || _0x46ebd5.width,
    height: Number(_0x27b75f.height) || _0x46ebd5.height
  };
}
function sanitizeExportFileName(_0x4c069e) {
  const _0x4b0c3d = String(_0x4c069e || "").trim().replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").slice(0, 80);
  return _0x4b0c3d || getStoryboardScriptDefaultName();
}
function formatExportTimestamp(_0x36e783 = new Date()) {
  const _0xb6ea94 = _0x3d2000 => String(_0x3d2000).padStart(2, "0");
  return [_0x36e783.getFullYear(), _0xb6ea94(_0x36e783.getMonth() + 1), _0xb6ea94(_0x36e783.getDate()), "-", _0xb6ea94(_0x36e783.getHours()), _0xb6ea94(_0x36e783.getMinutes()), _0xb6ea94(_0x36e783.getSeconds())].join("");
}
function focusStoryboardImageBatch(_0x323206, _0x2f9904) {
  const _0x154af4 = [_0x323206, _0x2f9904].map(_0x3bb0a4 => String(_0x3bb0a4 || "").trim()).filter(Boolean);
  if (_0x154af4.length === 0) {
    return;
  }
  a548_0x27f1b3.setSelectedNodes(_0x154af4);
  const _0xc43ef3 = typeof window !== "undefined" ? window : null;
  try {
    if (typeof _0xc43ef3?.v2FocusOnNodes === "function") {
      _0xc43ef3.v2FocusOnNodes(_0x154af4, 80, 800);
    } else if (typeof _0xc43ef3?.v2FocusOnNode === "function") {
      _0xc43ef3.v2FocusOnNode(_0x154af4[_0x154af4.length - 1], 80, 800);
    }
  } catch (_0x242bb0) {
    console.warn("[StoryboardScriptNode] focus created image batch failed", _0x242bb0);
  }
}
function createStoryboardScriptLoadingOverlay() {
  const _0x4ea865 = document.createElement("div");
  _0x4ea865.className = "storyboard-script-loading-overlay";
  _0x4ea865.setAttribute("role", "status");
  _0x4ea865.setAttribute("aria-live", "polite");
  const _0x22de96 = document.createElement("div");
  _0x22de96.className = "storyboard-script-loading-spinner";
  _0x4ea865.appendChild(_0x22de96);
  const _0x157e25 = document.createElement("div");
  _0x157e25.className = "storyboard-script-loading-label";
  _0x157e25.textContent = storyboardScriptText("loading");
  _0x4ea865.appendChild(_0x157e25);
  const _0x38c05f = document.createElement("div");
  _0x38c05f.className = "storyboard-script-loading-bar";
  const _0x308b89 = document.createElement("div");
  _0x308b89.className = "storyboard-script-loading-bar-fill";
  _0x38c05f.appendChild(_0x308b89);
  _0x4ea865.appendChild(_0x38c05f);
  return _0x4ea865;
}
function waitForStoryboardLoadingPaint() {
  const _0xe962e3 = typeof window !== "undefined" ? window : null;
  if (!_0xe962e3) {
    return Promise.resolve();
  }
  return new Promise(_0x472a45 => {
    const _0x37cd4d = () => _0x472a45();
    if (typeof _0xe962e3.requestAnimationFrame === "function") {
      _0xe962e3.requestAnimationFrame(() => {
        if (typeof _0xe962e3.setTimeout === "function") {
          _0xe962e3.setTimeout(_0x37cd4d, 0);
        } else {
          _0x37cd4d();
        }
      });
      return;
    }
    if (typeof _0xe962e3.setTimeout === "function") {
      _0xe962e3.setTimeout(_0x37cd4d, 0);
      return;
    }
    _0x37cd4d();
  });
}
function createSvgIcon() {
  const _0x4355cb = "http://www.w3.org/2000/svg";
  const _0x2f3cec = document.createElementNS(_0x4355cb, "svg");
  _0x2f3cec.setAttribute("width", "16");
  _0x2f3cec.setAttribute("height", "16");
  _0x2f3cec.setAttribute("viewBox", "0 0 24 24");
  _0x2f3cec.setAttribute("fill", "none");
  _0x2f3cec.setAttribute("stroke", "currentColor");
  _0x2f3cec.setAttribute("stroke-width", "2");
  const _0x3bca42 = document.createElementNS(_0x4355cb, "rect");
  _0x3bca42.setAttribute("x", "3");
  _0x3bca42.setAttribute("y", "4");
  _0x3bca42.setAttribute("width", "18");
  _0x3bca42.setAttribute("height", "16");
  _0x3bca42.setAttribute("rx", "2");
  _0x2f3cec.appendChild(_0x3bca42);
  ["9", "14"].forEach(_0x1aaa90 => {
    const _0x4ab1c4 = document.createElementNS(_0x4355cb, "line");
    _0x4ab1c4.setAttribute("x1", "3");
    _0x4ab1c4.setAttribute("y1", _0x1aaa90);
    _0x4ab1c4.setAttribute("x2", "21");
    _0x4ab1c4.setAttribute("y2", _0x1aaa90);
    _0x2f3cec.appendChild(_0x4ab1c4);
  });
  const _0xdb9bad = document.createElementNS(_0x4355cb, "line");
  _0xdb9bad.setAttribute("x1", "8");
  _0xdb9bad.setAttribute("y1", "4");
  _0xdb9bad.setAttribute("x2", "8");
  _0xdb9bad.setAttribute("y2", "20");
  _0x2f3cec.appendChild(_0xdb9bad);
  return _0x2f3cec;
}
export class StoryboardScriptNode {
  constructor(_0x3c323b) {
    this._data = _0x3c323b || {};
    this.nodeId = this._data.id;
    this.refBarEl = null;
    this.promptEl = null;
    this._promptPanelEl = null;
    this.btnEl = null;
    this._toolbarGenerateBtn = null;
    this._toolbarFullscreenBtn = null;
    this._toolbarDownloadBtn = null;
    this._queueBtn = null;
    this._imageModeBtn = null;
    this._videoModeBtn = null;
    this._selectionCountEl = null;
    this._onDocumentPointerDown = null;
    this._onModelTriggerClickCapture = null;
    this._storyboardImageModelMenu = null;
    this._storyboardImageModelMenuBound = false;
    this._storyboardImageSchemaCleanup = null;
    this._storyboardImageSchemaModel = "";
    this._storyboardImageSchemaSelectionMode = null;
    this.rhAdvPanelEl = null;
    this.rhAdvWrap = null;
    this.uiSchemaModeSlot = null;
    this.uiSchemaResolutionSlot = null;
    this.uiSchemaInstanceSlot = null;
    this.uiSchemaBatchSlot = null;
    this._isGeneratingScript = false;
    this._isPromptGenerateLoadingPrimed = false;
    this._activeCellEdit = null;
    this._storyboardViewScrollByKey = new Map();
    this._storyboardBodyRenderSignature = "";
    this._skipNextStoryboardBodyRender = false;
    this._fullscreenOverlayEl = null;
    this._onFullscreenKeydown = null;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component storyboard-script-node";
  }
  mount() {
    this.el.replaceChildren();
    const _0x4a2bf6 = this._getScriptState().displayOnly === true;
    this.el.classList.toggle("is-display-only", _0x4a2bf6);
    const _0x59247f = document.createElement("div");
    _0x59247f.className = "storyboard-script-header";
    const _0x4a402b = document.createElement("div");
    _0x4a402b.className = "storyboard-script-title";
    _0x4a402b.appendChild(createSvgIcon());
    const _0x1a10fc = document.createElement("span");
    _0x1a10fc.textContent = getStoryboardScriptDefaultName();
    _0x4a402b.appendChild(_0x1a10fc);
    const _0x1c86c4 = document.createElement("span");
    _0x1c86c4.className = "storyboard-script-beta";
    _0x1c86c4.textContent = "BETA";
    _0x4a402b.appendChild(_0x1c86c4);
    const _0x381a70 = document.createElement("div");
    _0x381a70.className = "storyboard-script-header-controls";
    const _0x5230e8 = document.createElement("div");
    _0x5230e8.className = "storyboard-script-media-switch";
    _0x5230e8.setAttribute("role", "group");
    _0x5230e8.setAttribute("aria-label", storyboardScriptText("mediaModeAria"));
    this._imageModeBtn = this._createMediaModeButton("image", storyboardScriptText("mediaMode.image"));
    this._videoModeBtn = this._createMediaModeButton("video", storyboardScriptText("mediaMode.video"));
    _0x5230e8.appendChild(this._imageModeBtn);
    _0x5230e8.appendChild(this._videoModeBtn);
    const _0x20b41a = document.createElement("div");
    _0x20b41a.className = "storyboard-script-view-switch";
    _0x20b41a.setAttribute("role", "group");
    _0x20b41a.setAttribute("aria-label", storyboardScriptText("viewModeAria"));
    this._listBtn = this._createModeButton("list", storyboardScriptText("viewMode.list"));
    this._cardBtn = this._createModeButton("card", storyboardScriptText("viewMode.card"));
    _0x20b41a.appendChild(this._listBtn);
    _0x20b41a.appendChild(this._cardBtn);
    _0x381a70.appendChild(_0x5230e8);
    _0x381a70.appendChild(_0x20b41a);
    _0x59247f.appendChild(_0x4a402b);
    _0x59247f.appendChild(_0x381a70);
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "storyboard-script-body";
    this._bindBodyInteractions();
    if (!_0x4a2bf6) {
      this._promptPanelEl = buildSharedPromptPanel(this, {
        placeholder: storyboardScriptText("promptPlaceholder"),
        btnTitle: storyboardScriptText("generate"),
        modelMenu: {
          provider: resolveStoryboardScriptTextProvider(this._data),
          providers: [STORYBOARD_SCRIPT_TEXT_PROVIDER],
          allowCustomModels: false,
          defaultModel: STORYBOARD_SCRIPT_TEXT_MODEL,
          model: resolveStoryboardScriptTextModel(this._data),
          onSelect: ({
            modelId: _0x498f72,
            provider: _0x103a62
          }) => {
            const _0x194a50 = this._getScriptState();
            const _0x2d12da = {
              ..._0x194a50,
              model: _0x498f72,
              provider: _0x103a62,
              sourceMode: "text"
            };
            this._data = {
              ...this._data,
              model: _0x498f72,
              provider: _0x103a62,
              storyboardScript: _0x2d12da
            };
            a548_0x27f1b3.updateNodeData(this.nodeId, {
              model: _0x498f72,
              provider: _0x103a62,
              storyboardScript: _0x2d12da
            });
          }
        }
      });
      this._bindPromptGenerateImmediateLoading();
      this._installSelectionCountIndicator();
      this._installStoryboardImagePromptSchemaControls();
      this._installStoryboardQueueButton();
      this._bindStoryboardImageModelTrigger();
    }
    this.el.appendChild(_0x59247f);
    this.el.appendChild(this._bodyEl);
    this._toolbarEl = this._createToolbar();
    this.el.appendChild(this._toolbarEl);
    if (this._promptPanelEl) {
      this.el.appendChild(this._promptPanelEl);
    }
    this._resizeHandleEl = createNodeResizeHandle(this, {
      store: a548_0x27f1b3,
      getStateSnapshot: getStateSnapshot,
      commit: commit,
      resolveMinSize: resolveStoryboardScriptResizeMinSize
    });
    this.el.appendChild(this._resizeHandleEl);
    this._renderRefBar();
    this._bindOutsideSelectionCancel();
    this._updateSubmitButtonState();
    this._render();
    return this.el;
  }
  _createToolbar() {
    const _0x3d177a = document.createElement("div");
    _0x3d177a.className = "node-floating-toolbar v2-text-toolbar v2-storyboard-script-toolbar";
    _0x3d177a.addEventListener("pointerdown", _0x30e1d9 => {
      _0x30e1d9.stopPropagation();
    });
    _0x3d177a.addEventListener("dblclick", _0x1d4550 => {
      _0x1d4550.preventDefault();
      _0x1d4550.stopPropagation();
    });
    this._toolbarGenerateBtn = createToolbarButton({
      action: "generate-storyboard",
      label: storyboardScriptText("toolbar.editMode"),
      tooltip: storyboardScriptText("toolbar.editMode"),
      iconHtml: STORYBOARD_TOOLBAR_GENERATE_ICON_HTML,
      showLabel: true
    });
    this._toolbarGenerateBtn.addEventListener("click", _0x160245 => {
      _0x160245.stopPropagation();
      const _0x169a32 = this._getScriptState();
      if (_0x169a32.selectionMode === true) {
        this._cancelSelectionMode();
      } else {
        this._enterSelectionMode();
      }
    });
    this._toolbarFullscreenBtn = createToolbarButton({
      action: "fullscreen-script",
      label: storyboardScriptText("toolbar.fullscreen"),
      tooltip: storyboardScriptText("toolbar.fullscreen"),
      iconHtml: STORYBOARD_TOOLBAR_FULLSCREEN_ICON_HTML
    });
    this._toolbarFullscreenBtn.addEventListener("click", _0x37a669 => {
      _0x37a669.stopPropagation();
      this._openFullscreenScript();
    });
    this._toolbarDownloadBtn = createToolbarButton({
      action: "download-table",
      label: storyboardScriptText("toolbar.download"),
      tooltip: storyboardScriptText("toolbar.downloadTable"),
      iconHtml: STORYBOARD_TOOLBAR_DOWNLOAD_ICON_HTML
    });
    this._toolbarDownloadBtn.addEventListener("click", _0xb6e433 => {
      _0xb6e433.stopPropagation();
      this._downloadScriptTable();
    });
    _0x3d177a.appendChild(this._toolbarGenerateBtn);
    _0x3d177a.appendChild(this._toolbarFullscreenBtn);
    _0x3d177a.appendChild(this._toolbarDownloadBtn);
    return _0x3d177a;
  }
  _bindOutsideSelectionCancel() {
    this._unbindOutsideSelectionCancel();
    this._onDocumentPointerDown = _0x2777f6 => {
      const _0x2c4332 = this._getScriptState();
      if (_0x2c4332.selectionMode !== true) {
        return;
      }
      const _0x24769d = _0x2777f6.target;
      if (!(_0x24769d instanceof Element)) {
        return;
      }
      const _0x3f1d59 = document.getElementById(this.nodeId);
      if (this._fullscreenOverlayEl?.contains(_0x24769d)) {
        return;
      }
      if (this.el.contains(_0x24769d) || _0x3f1d59?.contains(_0x24769d)) {
        return;
      }
      this._cancelSelectionMode();
    };
    document.addEventListener("pointerdown", this._onDocumentPointerDown, true);
  }
  _unbindOutsideSelectionCancel() {
    if (!this._onDocumentPointerDown) {
      return;
    }
    document.removeEventListener("pointerdown", this._onDocumentPointerDown, true);
    this._onDocumentPointerDown = null;
  }
  _bindStoryboardImageModelTrigger() {
    const _0x3a47da = this._promptPanelEl?.querySelector(".img-model-btn-trigger");
    if (!_0x3a47da) {
      return;
    }
    this._onModelTriggerClickCapture = _0x399a0f => {
      const _0x3462ec = this._getScriptState();
      if (_0x3462ec.selectionMode !== true) {
        return;
      }
      _0x399a0f.preventDefault();
      _0x399a0f.stopPropagation();
      _0x399a0f.stopImmediatePropagation?.();
      this._toggleStoryboardImageModelMenu();
    };
    _0x3a47da.addEventListener("click", this._onModelTriggerClickCapture, {
      capture: true
    });
  }
  _unbindStoryboardImageModelTrigger() {
    const _0x6c0a23 = this._promptPanelEl?.querySelector(".img-model-btn-trigger");
    if (!_0x6c0a23 || !this._onModelTriggerClickCapture) {
      return;
    }
    _0x6c0a23.removeEventListener("click", this._onModelTriggerClickCapture, {
      capture: true
    });
    this._onModelTriggerClickCapture = null;
  }
  _removeStoryboardImageModelMenu() {
    this._storyboardImageModelMenu?.remove();
    this._storyboardImageModelMenu = null;
    this._storyboardImageModelMenuBound = false;
  }
  _getStoryboardImagePromptNodeData(_0x280207 = this._data, _0x28d50b = null) {
    const _0x4b7e0c = _0x28d50b || createDefaultStoryboardScriptState(_0x280207?.storyboardScript || {});
    const _0x3a3f70 = normalizeDreaminaImageModel(_0x4b7e0c.imageModel || DEFAULT_IMAGE_NODE_MODEL, _0x4b7e0c.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER);
    return {
      ...(_0x280207 || {}),
      type: "ai-image",
      model: _0x3a3f70,
      provider: _0x4b7e0c.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER,
      providerProfileId: _0x4b7e0c.imageProviderProfileId || "",
      generationParams: getPlainObject(_0x280207?.generationParams),
      generationParamsByModel: getPlainObject(_0x280207?.generationParamsByModel)
    };
  }
  _installStoryboardImagePromptSchemaControls() {
    const _0x1d7962 = this._promptPanelEl?.querySelector(".prompt-panel-footer");
    const _0x2e8052 = _0x1d7962?.querySelector(".img-model-pills");
    const _0x14339c = _0x2e8052?.querySelector(".img-model-wrap");
    const _0x47b420 = _0x1d7962?.querySelector(".prompt-actions");
    const _0x74689e = _0x47b420?.querySelector(".debug-wrench-btn");
    if (!_0x1d7962 || !_0x2e8052 || !_0x14339c || !_0x47b420 || !_0x74689e) {
      return;
    }
    const _0x30988d = _0x479baa => {
      const _0x24ce67 = document.createElement("div");
      _0x24ce67.className = "ui-schema-placement " + _0x479baa + " storyboard-image-schema-only";
      _0x24ce67.hidden = true;
      return _0x24ce67;
    };
    this.uiSchemaModeSlot = _0x30988d("ui-schema-mode-slot");
    this.uiSchemaResolutionSlot = _0x30988d("ui-schema-resolution-slot");
    this.uiSchemaBatchSlot = _0x30988d("ui-schema-batch-slot");
    this.uiSchemaInstanceSlot = _0x30988d("ui-schema-instance-slot");
    _0x14339c.after(this.uiSchemaModeSlot, this.uiSchemaResolutionSlot);
    this.rhAdvWrap = document.createElement("div");
    this.rhAdvWrap.className = "rh-adv-wrap storyboard-image-schema-only";
    this.rhAdvWrap.hidden = true;
    const _0x22baf5 = document.createElement("button");
    _0x22baf5.type = "button";
    _0x22baf5.className = "img-pill-btn rh-adv-btn";
    const _0x472e38 = document.createElement("span");
    _0x472e38.className = "rh-adv-btn-label";
    _0x472e38.textContent = storyboardScriptText("advancedSettings");
    _0x22baf5.replaceChildren(_0x472e38);
    this.rhAdvWrap.appendChild(_0x22baf5);
    _0x47b420.insertBefore(this.rhAdvWrap, _0x74689e);
    _0x47b420.insertBefore(this.uiSchemaBatchSlot, _0x74689e);
    _0x47b420.insertBefore(this.uiSchemaInstanceSlot, _0x74689e);
    this.rhAdvPanelEl = document.createElement("div");
    this.rhAdvPanelEl.className = "rh-adv-panel storyboard-image-schema-only";
    _0x1d7962.appendChild(this.rhAdvPanelEl);
    _0x22baf5.addEventListener("click", _0x268a58 => {
      _0x268a58.stopPropagation();
      if (this.rhAdvPanelEl?.hidden) {
        return;
      }
      closeNodeFooterMenus(_0x1d7962, this.rhAdvPanelEl);
      this.rhAdvPanelEl?.classList.toggle("show");
      this._storyboardImageModelMenu?.classList.remove("show");
    });
    this.rhAdvPanelEl.addEventListener("click", _0x1d56ac => {
      _0x1d56ac.stopPropagation();
    });
    this._storyboardImageSchemaCleanup?.();
    this._storyboardImageSchemaCleanup = bindModelUiSchemaControls(_0x1d7962, {
      nodeId: this.nodeId,
      nodeData: this._getStoryboardImagePromptNodeData(),
      store: a548_0x27f1b3,
      decorateNodeData: _0x1c5234 => this._getStoryboardImagePromptNodeData(_0x1c5234, createDefaultStoryboardScriptState(_0x1c5234?.storyboardScript || {})),
      buildPatch: (_0xbf969c, _0x5b58b5, _0x2a0779) => {
        const _0x43844c = createDefaultStoryboardScriptState(_0xbf969c?.storyboardScript || {});
        const _0xf8be20 = {
          ..._0x43844c,
          updatedAt: Date.now()
        };
        if (_0x5b58b5 !== "aspectRatio") {
          return {
            storyboardScript: _0xf8be20
          };
        }
        return {
          aspectRatio: _0x2a0779,
          storyboardScript: _0xf8be20
        };
      },
      afterCommit: (_0x1eab74, _0x427ec9, _0x4411b6, {
        patch: _0x2fccec
      } = {}) => {
        if (_0x2fccec && typeof _0x2fccec === "object") {
          this._data = {
            ...this._data,
            ..._0x2fccec
          };
        }
        this._syncStoryboardImageSchemaControls(this._getScriptState());
      }
    });
  }
  _syncStoryboardImageSchemaControls(_0x4ba166 = this._getScriptState()) {
    const _0x364c82 = this._promptPanelEl?.querySelector(".prompt-panel-footer");
    if (!_0x364c82 || !this.uiSchemaModeSlot || !this.uiSchemaResolutionSlot) {
      return;
    }
    const _0x4a9b17 = Array.isArray(_0x4ba166.rows) && _0x4ba166.rows.length > 0 && _0x4ba166.selectionMode === true;
    const _0x2f9b05 = normalizeDreaminaImageModel(_0x4ba166.imageModel || DEFAULT_IMAGE_NODE_MODEL, _0x4ba166.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER);
    const _0x55e402 = this._getStoryboardImagePromptNodeData(this._data, _0x4ba166);
    const _0x4cfe38 = this._storyboardImageSchemaModel !== _0x2f9b05 || this._storyboardImageSchemaSelectionMode !== _0x4a9b17;
    if (_0x4cfe38) {
      const _0x86910f = (_0x110bfb, _0x3a7418, _0x4d0447) => {
        if (!_0x110bfb) {
          return;
        }
        const _0x2d1e60 = _0x4a9b17 ? renderModelUiSchemaControls(_0x2f9b05, _0x55e402, {
          placement: _0x3a7418,
          variant: _0x4d0447
        }) : "";
        _0x110bfb.innerHTML = _0x2d1e60;
        _0x110bfb.hidden = !_0x4a9b17 || !_0x2d1e60;
      };
      _0x86910f(this.uiSchemaModeSlot, "mode", "pillMenu");
      _0x86910f(this.uiSchemaResolutionSlot, "resolution", "resolutionPill");
      _0x86910f(this.uiSchemaBatchSlot, "batch", "pillMenu");
      _0x86910f(this.uiSchemaInstanceSlot, "instance", "instanceToggle");
      if (this.rhAdvPanelEl) {
        this.rhAdvPanelEl.innerHTML = _0x4a9b17 ? renderModelUiSchemaControls(_0x2f9b05, _0x55e402, {
          placement: "advanced",
          variant: "advancedRow"
        }) : "";
      }
      this._storyboardImageSchemaModel = _0x2f9b05;
      this._storyboardImageSchemaSelectionMode = _0x4a9b17;
    }
    syncModelUiSchemaControls(_0x364c82, _0x55e402);
    const _0x11a730 = _0x4a9b17 && hasVisibleModelUiSchema(_0x2f9b05, _0x55e402, {
      placement: "advanced"
    });
    if (this.rhAdvWrap) {
      this.rhAdvWrap.hidden = !_0x11a730;
    }
    if (this.rhAdvPanelEl) {
      this.rhAdvPanelEl.hidden = !_0x11a730;
      if (!_0x11a730 || !_0x4a9b17) {
        this.rhAdvPanelEl.classList.remove("show");
      }
    }
  }
  _buildStoryboardImageModelPatch(_0x498741, _0xe79ff6, _0x17c34e, _0x1e90da = {}) {
    const _0x2320b6 = createDefaultStoryboardScriptState(_0x498741?.storyboardScript || this._getScriptState());
    const _0x3c0bd2 = String(_0x498741?.model || "").trim();
    const _0x4a916e = String(_0xe79ff6 || "").trim() || DEFAULT_IMAGE_NODE_MODEL;
    const _0x931c1c = String(_0x17c34e || "").trim() || DEFAULT_IMAGE_NODE_PROVIDER;
    const _0x3e4271 = _0x1e90da && typeof _0x1e90da === "object" ? {
      ..._0x1e90da
    } : {};
    delete _0x3e4271.storyboardScript;
    const _0x580293 = getPlainObject(_0x498741?.generationParamsByModel);
    if (_0x3c0bd2) {
      _0x580293[_0x3c0bd2] = getPlainObject(_0x498741?.generationParams);
    }
    const _0x2f9e12 = getModelManifest(_0x4a916e);
    const _0x39fedf = new Set((_0x2f9e12?.uiSchema?.fields || []).map(_0x2b6449 => String(_0x2b6449?.id || "").trim()).filter(Boolean));
    const _0x141243 = getPlainObject(_0x3e4271.generationParams);
    const _0x2d9f47 = getPlainObject(_0x580293[_0x4a916e]);
    const _0x9ca4ce = buildModelUiSchemaDefaultParams(_0x4a916e);
    const _0x15d892 = {};
    _0x39fedf.forEach(_0x2f0171 => {
      if (Object.prototype.hasOwnProperty.call(_0x3e4271, _0x2f0171)) {
        _0x15d892[_0x2f0171] = _0x3e4271[_0x2f0171];
        delete _0x3e4271[_0x2f0171];
      }
    });
    delete _0x3e4271.generationParams;
    delete _0x3e4271.generationParamsByModel;
    const _0x3f3341 = sanitizeModelUiSchemaParams(_0x4a916e, {
      ..._0x9ca4ce,
      ..._0x2d9f47,
      ..._0x141243,
      ..._0x15d892
    }, {
      includeDefaults: true
    });
    if (_0x4a916e) {
      _0x580293[_0x4a916e] = _0x3f3341;
    }
    const _0x4f7c3d = {
      ..._0x2320b6,
      selectionMode: true,
      imageModel: _0x4a916e,
      imageProvider: _0x931c1c,
      imageProviderProfileId: _0x3e4271.providerProfileId || _0x2320b6.imageProviderProfileId || "",
      updatedAt: Date.now()
    };
    const _0x26788a = _0x3f3341.aspectRatio || _0x3e4271.aspectRatio || _0x498741?.aspectRatio;
    return {
      ..._0x3e4271,
      model: _0x4a916e,
      provider: _0x931c1c,
      ...(_0x26788a ? {
        aspectRatio: _0x26788a
      } : {}),
      generationParams: _0x3f3341,
      generationParamsByModel: _0x580293,
      storyboardScript: _0x4f7c3d
    };
  }
  _bindStoryboardImageModelMenu(_0x5e2fbe) {
    if (!_0x5e2fbe || this._storyboardImageModelMenuBound) {
      return;
    }
    const _0x29909c = this._promptPanelEl?.querySelector(".img-model-btn-trigger");
    const _0x449df3 = this._promptPanelEl?.querySelector(".img-model-label");
    const _0x5b4eda = {
      modelMenu: _0x5e2fbe,
      modelTrigger: _0x29909c,
      modelLabel: _0x449df3,
      nodeId: this.nodeId,
      store: a548_0x27f1b3,
      fallbackNodeData: this._data,
      buildModelPatch: (..._0x1fb8d6) => this._buildStoryboardImageModelPatch(..._0x1fb8d6)
    };
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-grsai-toggle]",
      submenuSelector: ".grsai-submenu",
      defaultProvider: "grsai",
      resolveSelection: resolveGrsaiImageMenuSelection,
      afterSelect: ({
        item: _0xd56612
      }) => setImageModelTriggerIcon(_0x29909c, "grsai", _0xd56612)
    });
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-ppio-toggle]",
      submenuSelector: ".ppio-submenu",
      defaultProvider: "ppio",
      afterSelect: ({
        item: _0x293f0d
      }) => setImageModelTriggerIcon(_0x29909c, "ppio", _0x293f0d)
    });
    bindDreaminaImageMenu(_0x5b4eda);
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-apimart-toggle]",
      submenuSelector: ".apimart-submenu",
      defaultProvider: "apimart",
      resolveSelection: resolveApimartImageMenuSelection,
      afterSelect: ({
        item: _0x5403f1
      }) => setImageModelTriggerIcon(_0x29909c, "apimart", _0x5403f1)
    });
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-agnes-toggle]",
      submenuSelector: ".agnes-submenu",
      defaultProvider: "agnes",
      afterSelect: ({
        item: _0x120371
      }) => setImageModelTriggerIcon(_0x29909c, "agnes", _0x120371)
    });
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-volcengine-toggle]",
      submenuSelector: ".volcengine-submenu",
      defaultProvider: "volcengine",
      resolveSelection: resolveVolcengineImageMenuSelection,
      afterSelect: ({
        item: _0x1f9a93
      }) => setImageModelTriggerIcon(_0x29909c, "volcengine", _0x1f9a93)
    });
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-runninghubwf-toggle]",
      submenuSelector: ".runninghubwf-submenu",
      defaultProvider: "runninghubwf",
      resolveSelection: resolveRunningHubWorkflowImageMenuSelection,
      afterSelect: ({
        item: _0x5a2515
      }) => setImageModelTriggerIcon(_0x29909c, "runninghubwf", _0x5a2515)
    });
    bindImageModelMenuSubmenu({
      ..._0x5b4eda,
      toggleSelector: "[data-runninghub-toggle]",
      submenuSelector: ".runninghub-submenu",
      defaultProvider: "runninghub",
      resolveSelection: resolveRunningHubModelImageMenuSelection,
      afterSelect: ({
        item: _0x25b352,
        provider: _0x4dc4d5
      }) => setImageModelTriggerIcon(_0x29909c, _0x4dc4d5, _0x25b352)
    });
    this._storyboardImageModelMenuBound = true;
  }
  _ensureStoryboardImageModelMenu() {
    if (this._storyboardImageModelMenu?.isConnected) {
      return this._storyboardImageModelMenu;
    }
    const _0x43afab = this._promptPanelEl?.querySelector(".img-model-wrap");
    if (!_0x43afab) {
      return null;
    }
    const _0x261865 = this._getScriptState();
    const _0x1ef99a = normalizeDreaminaImageModel(_0x261865.imageModel || DEFAULT_IMAGE_NODE_MODEL, _0x261865.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER);
    const _0x5d3c2e = document.createElement("template");
    _0x5d3c2e.innerHTML = buildImageModelMenuHTML({
      activeModel: _0x1ef99a,
      nanoSelection: getNanoBananaSelectionFromModel(_0x1ef99a, _0x261865.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER)
    }).trim();
    const _0x27e1bf = _0x5d3c2e.content.firstElementChild;
    if (!_0x27e1bf) {
      return null;
    }
    _0x27e1bf.classList.add("storyboard-image-model-menu");
    _0x43afab.style.position = _0x43afab.style.position || "relative";
    _0x43afab.appendChild(_0x27e1bf);
    this._storyboardImageModelMenu = _0x27e1bf;
    this._storyboardImageModelMenuBound = false;
    this._bindStoryboardImageModelMenu(_0x27e1bf);
    return _0x27e1bf;
  }
  _toggleStoryboardImageModelMenu() {
    const _0x2fd732 = this._promptPanelEl?.querySelector(".prompt-panel-footer");
    const _0x4531fb = this._ensureStoryboardImageModelMenu();
    if (!_0x4531fb) {
      return;
    }
    const _0x513c22 = !_0x4531fb.classList.contains("show");
    closeNodeFooterMenus(_0x2fd732 || this._promptPanelEl, _0x4531fb);
    _0x4531fb.classList.toggle("show", _0x513c22);
    if (_0x513c22) {
      activateMenuKeyboard(_0x4531fb);
    }
  }
  _installSelectionCountIndicator() {
    const _0x16a5c0 = this._promptPanelEl?.querySelector(".prompt-actions");
    const _0x34f892 = _0x16a5c0?.querySelector(".debug-wrench-btn");
    if (!_0x16a5c0 || !_0x34f892) {
      return;
    }
    this._selectionCountEl = document.createElement("div");
    this._selectionCountEl.className = "storyboard-script-selection-count";
    this._selectionCountEl.textContent = "0/0";
    this._selectionCountEl.setAttribute("aria-label", storyboardScriptText("selectionCount", {
      selected: 0,
      total: 0
    }));
    _0x16a5c0.insertBefore(this._selectionCountEl, _0x34f892);
  }
  _installStoryboardQueueButton() {
    const _0x2ca8f9 = this._promptPanelEl?.querySelector(".prompt-actions");
    if (!_0x2ca8f9 || !this.btnEl || this._queueBtn) {
      return;
    }
    const _0x459742 = document.createElement("button");
    _0x459742.type = "button";
    _0x459742.className = "prompt-submit storyboard-script-queue-btn";
    _0x459742.title = storyboardScriptText("toolbar.queue");
    _0x459742.setAttribute("aria-label", storyboardScriptText("toolbar.queue"));
    _0x459742.innerHTML = STORYBOARD_QUEUE_ICON_HTML;
    _0x459742.hidden = true;
    _0x459742.addEventListener("click", _0x968a7 => {
      _0x968a7.stopPropagation();
      this._flushPromptHtmlCommit?.();
      this._createImageNodesFromSelectedStoryboards({
        startGeneration: false
      });
    });
    _0x2ca8f9.insertBefore(_0x459742, this.btnEl);
    this._queueBtn = _0x459742;
  }
  _createModeButton(_0x29d5b7, _0x22752b) {
    const _0xdb14d6 = document.createElement("button");
    _0xdb14d6.type = "button";
    _0xdb14d6.className = "storyboard-script-view-btn";
    _0xdb14d6.dataset.mode = _0x29d5b7;
    _0xdb14d6.textContent = _0x22752b;
    _0xdb14d6.addEventListener("pointerdown", _0x2c7c6f => {
      _0x2c7c6f.stopPropagation();
    });
    _0xdb14d6.addEventListener("dblclick", _0x58e0d3 => {
      _0x58e0d3.stopPropagation();
    });
    _0xdb14d6.addEventListener("click", _0x18b4a7 => {
      _0x18b4a7.stopPropagation();
      this._setViewMode(_0x29d5b7);
    });
    return _0xdb14d6;
  }
  _createMediaModeButton(_0x228494, _0x1c8670) {
    const _0x5ed591 = document.createElement("button");
    _0x5ed591.type = "button";
    _0x5ed591.className = "storyboard-script-view-btn storyboard-script-media-btn";
    _0x5ed591.dataset.mediaMode = _0x228494;
    _0x5ed591.textContent = _0x1c8670;
    _0x5ed591.addEventListener("pointerdown", _0x50abca => {
      _0x50abca.stopPropagation();
    });
    _0x5ed591.addEventListener("dblclick", _0x1c2374 => {
      _0x1c2374.stopPropagation();
    });
    _0x5ed591.addEventListener("click", _0x372659 => {
      _0x372659.stopPropagation();
      this._setMediaMode(_0x228494);
    });
    return _0x5ed591;
  }
  _getScriptState() {
    return createDefaultStoryboardScriptState(this._data.storyboardScript || {});
  }
  _syncSelectionModeUi(_0x582b04 = this._getScriptState()) {
    const _0x56c4b1 = Array.isArray(_0x582b04.rows) ? _0x582b04.rows.length : 0;
    const _0x17f709 = getSelectedRowIndexes(_0x582b04);
    const _0x78a519 = _0x56c4b1 > 0 && _0x582b04.selectionMode === true;
    const _0x7bba10 = _0x78a519 ? storyboardScriptText("toolbar.exitEdit") : storyboardScriptText("toolbar.editMode");
    const _0xe577bd = _0x78a519 ? _0x582b04.imageModel || DEFAULT_IMAGE_NODE_MODEL : resolveStoryboardScriptTextModel({
      storyboardScript: _0x582b04
    });
    const _0x22d5ed = _0x78a519 ? _0x582b04.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER : resolveStoryboardScriptTextProvider({
      storyboardScript: _0x582b04
    });
    this._promptPanelEl?.classList.toggle("is-storyboard-image-mode", _0x78a519);
    if (this._queueBtn) {
      this._queueBtn.hidden = !_0x78a519;
    }
    this.el?.classList.toggle("has-storyboard-rows", _0x56c4b1 > 0);
    this.el?.classList.toggle("is-storyboard-selection-mode", _0x78a519);
    this._toolbarGenerateBtn?.classList.toggle("active", _0x78a519);
    setToolbarButtonLabel(this._toolbarGenerateBtn, _0x7bba10);
    this._promptPanelEl?.querySelector(".node-model-menu")?.classList.toggle("is-storyboard-text-menu-hidden", _0x78a519);
    if (!_0x78a519) {
      this._storyboardImageModelMenu?.classList.remove("show");
    }
    const _0x37d84b = this._promptPanelEl?.querySelector(".img-model-btn-trigger");
    const _0x5d6d27 = this._promptPanelEl?.querySelector(".img-model-label");
    const _0x4ee4e7 = getDisplayModelName(_0xe577bd);
    if (_0x5d6d27) {
      if (_0x5d6d27.textContent !== _0x4ee4e7) {
        _0x5d6d27.textContent = _0x4ee4e7;
      }
    }
    if (_0x78a519) {
      replaceModelTriggerIcon(_0x37d84b, renderImageModelTriggerIconHTML({
        model: _0xe577bd,
        provider: _0x22d5ed
      }));
    } else {
      replaceModelTriggerIcon(_0x37d84b, buildTextModelSmallIconHTML(_0xe577bd) || "<div class=\"text-model-icon-small text-model-icon-badge\">AI</div>");
    }
    if (this._selectionCountEl) {
      this._selectionCountEl.textContent = _0x17f709.length + "/" + _0x56c4b1;
      this._selectionCountEl.setAttribute("aria-label", storyboardScriptText("selectionCount", {
        selected: _0x17f709.length,
        total: _0x56c4b1
      }));
      this._selectionCountEl.hidden = !_0x78a519;
    }
    this._syncStoryboardImageSchemaControls(_0x582b04);
  }
  _enterSelectionMode() {
    this._finishCellEdit({
      commit: true
    });
    const _0x25b73b = this._getScriptState();
    if (!Array.isArray(_0x25b73b.rows) || _0x25b73b.rows.length === 0) {
      window.showToast?.(storyboardScriptText("toasts.generateScriptFirst"), "warn");
      return;
    }
    const _0x369fad = _0x25b73b.imageModel || DEFAULT_IMAGE_NODE_MODEL;
    const _0x1b04be = _0x25b73b.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER;
    const _0x1893f4 = a548_0x27f1b3.getState?.().nodes?.[this.nodeId] || this._data;
    const _0x5011fc = this._buildStoryboardImageModelPatch(_0x1893f4, _0x369fad, _0x1b04be);
    const _0x5c4db5 = {
      ..._0x5011fc.storyboardScript,
      viewMode: "list",
      selectionMode: true,
      selectedRowIndexes: getSelectedRowIndexes(_0x25b73b),
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      ..._0x5011fc,
      storyboardScript: _0x5c4db5
    };
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      ..._0x5011fc,
      storyboardScript: _0x5c4db5
    });
  }
  _cancelSelectionMode() {
    let _0x519309 = this._getScriptState();
    if (_0x519309.selectionMode !== true) {
      return;
    }
    this._finishCellEdit({
      commit: true
    });
    _0x519309 = this._getScriptState();
    const _0x4e5ef0 = resolveStoryboardScriptTextModel({
      storyboardScript: _0x519309
    });
    const _0x3e9282 = resolveStoryboardScriptTextProvider({
      storyboardScript: _0x519309
    });
    const _0x34aa21 = {
      ..._0x519309,
      selectionMode: false,
      selectedRowIndexes: [],
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      model: _0x4e5ef0,
      provider: _0x3e9282,
      storyboardScript: _0x34aa21
    };
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      model: _0x4e5ef0,
      provider: _0x3e9282,
      storyboardScript: _0x34aa21
    });
  }
  _updateSelectedRowIndexes(_0x2b73f2) {
    const _0x5188ab = this._getScriptState();
    const _0x158eb4 = normalizeStoryboardScriptSelectedRowIndexes(_0x2b73f2, _0x5188ab.rows.length);
    const _0x2f764b = {
      ..._0x5188ab,
      selectedRowIndexes: _0x158eb4,
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      storyboardScript: _0x2f764b
    };
    this._syncListSelectionState(_0x2f764b);
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      storyboardScript: _0x2f764b
    });
  }
  _toggleRowSelection(_0x3a11f0, _0x3e0c21) {
    const _0x21d4a2 = this._getScriptState();
    const _0x3d3520 = new Set(getSelectedRowIndexes(_0x21d4a2));
    if (_0x3e0c21) {
      _0x3d3520.add(_0x3a11f0);
    } else {
      _0x3d3520.delete(_0x3a11f0);
    }
    this._updateSelectedRowIndexes([..._0x3d3520].sort((_0x5e7c80, _0x3f281c) => _0x5e7c80 - _0x3f281c));
  }
  _setAllRowsSelected(_0x248e67) {
    const _0x237c8d = this._getScriptState();
    const _0x15d431 = _0x248e67 ? _0x237c8d.rows.map((_0x2edefb, _0x303ff6) => _0x303ff6) : [];
    this._updateSelectedRowIndexes(_0x15d431);
  }
  _setViewMode(_0x1bdacb) {
    this._finishCellEdit({
      commit: true
    });
    const _0x530109 = normalizeStoryboardScriptViewMode(_0x1bdacb);
    const _0x16d0dd = this._getScriptState();
    if (_0x16d0dd.viewMode === _0x530109) {
      return;
    }
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      storyboardScript: {
        ..._0x16d0dd,
        viewMode: _0x530109
      }
    });
  }
  _setMediaMode(_0x2fd628) {
    this._finishCellEdit({
      commit: true
    });
    const _0x56e4a0 = normalizeStoryboardScriptMediaMode(_0x2fd628);
    const _0x3b2f6f = this._getScriptState();
    if (_0x3b2f6f.mediaMode === _0x56e4a0) {
      return;
    }
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      storyboardScript: {
        ..._0x3b2f6f,
        mediaMode: _0x56e4a0,
        updatedAt: Date.now()
      }
    });
  }
  _syncModeButtons(_0x11d4d0, _0xbc7295) {
    [this._listBtn, this._cardBtn].forEach(_0x1dc9dc => {
      if (!_0x1dc9dc) {
        return;
      }
      const _0x322102 = _0x1dc9dc.dataset.mode === _0x11d4d0;
      _0x1dc9dc.classList.toggle("is-active", _0x322102);
      _0x1dc9dc.setAttribute("aria-pressed", _0x322102 ? "true" : "false");
    });
    const _0x178cdb = normalizeStoryboardScriptMediaMode(_0xbc7295);
    [this._imageModeBtn, this._videoModeBtn].forEach(_0x15125b => {
      if (!_0x15125b) {
        return;
      }
      const _0x864319 = _0x15125b.dataset.mediaMode === _0x178cdb;
      _0x15125b.classList.toggle("is-active", _0x864319);
      _0x15125b.setAttribute("aria-pressed", _0x864319 ? "true" : "false");
    });
  }
  _isStoryboardScriptGenerating(_0x75202a = null) {
    const _0x3f0614 = a548_0x27f1b3.getState?.().nodes?.[this.nodeId] || this._data || {};
    const _0x30f78d = _0x75202a || createDefaultStoryboardScriptState(_0x3f0614.storyboardScript || this._data.storyboardScript || {});
    return this._isGeneratingScript || _0x3f0614.isGenerating === true || _0x30f78d.isGenerating === true || String(_0x30f78d.jobStatus || _0x3f0614.jobStatus || "") === "running";
  }
  _syncGeneratingOverlay(_0x30afd7) {
    if (!this._bodyEl) {
      return;
    }
    const _0x1bd9ae = _0x30afd7 === true;
    this.el?.classList?.toggle("is-storyboard-script-generating", _0x1bd9ae);
    this._bodyEl.classList.toggle("is-generating", _0x1bd9ae);
    this._bodyEl.setAttribute("aria-busy", _0x1bd9ae ? "true" : "false");
    const _0x1871d8 = this._bodyEl.querySelector(".storyboard-script-loading-overlay");
    if (!_0x1bd9ae) {
      _0x1871d8?.remove();
      return;
    }
    if (_0x1871d8) {
      return;
    }
    this._bodyEl.appendChild(createStoryboardScriptLoadingOverlay());
  }
  _setStoryboardGeneratingState(_0x3db006, _0x9067b2 = {}) {
    const _0x2983bd = this._getScriptState();
    const _0x391522 = {
      ..._0x2983bd,
      ..._0x9067b2,
      isGenerating: _0x3db006 === true,
      jobStatus: _0x3db006 === true ? "running" : _0x9067b2.jobStatus || "",
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      storyboardScript: _0x391522
    };
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      storyboardScript: _0x391522
    });
  }
  _showStoryboardLoadingOverlayImmediately() {
    if (this._isGeneratingScript) {
      return;
    }
    const _0x37bd27 = this._getScriptState();
    if (_0x37bd27.selectionMode === true) {
      return;
    }
    this._isGeneratingScript = true;
    this._isPromptGenerateLoadingPrimed = true;
    this._setStoryboardGeneratingState(true);
    this._syncGeneratingOverlay(true);
  }
  _bindPromptGenerateImmediateLoading() {
    const _0x3f175e = this.btnEl;
    if (!(_0x3f175e instanceof HTMLElement)) {
      return;
    }
    _0x3f175e.addEventListener("click", () => {
      if (_0x3f175e.disabled) {
        return;
      }
      this._showStoryboardLoadingOverlayImmediately();
    }, {
      capture: true
    });
  }
  _getEffectiveSubmitPromptText() {
    return this._getStoryboardSubmitInput().promptText;
  }
  _getStoryboardSubmitInput(_0x4ab875 = null) {
    const _0x1e59e2 = a548_0x27f1b3.getState();
    const _0xe8eb7b = _0x1e59e2.nodes || {};
    const _0x9bd65b = _0xe8eb7b?.[this.nodeId] || this._data || {};
    const _0x156437 = a548_0x27f1b3.getIncomingEdges(this.nodeId);
    const _0x50bde8 = collectDirectStoryboardImageRefs(_0x156437, _0xe8eb7b);
    const _0xd85fde = collectDirectStoryboardVideoRefs(_0x156437, _0xe8eb7b);
    const _0x4b54f7 = [];
    const _0x3445a4 = {
      image: _0x50bde8.length,
      video: _0xd85fde.length,
      audio: 0
    };
    const _0x531721 = _0x4ab875 == null ? resolvePromptTextWithTextRefs : resolvePresetPromptTextWithTextRefs;
    const _0x507793 = _0x531721({
      template: _0x4ab875,
      promptEl: this.promptEl,
      inEdges: _0x156437,
      nodes: _0xe8eb7b,
      assetInputRefs: _0x4b54f7,
      assetMediaCounts: _0x3445a4,
      allowedAssetTypes: ["text", "image", "video"]
    }).trim();
    const _0x1363d0 = getPromptAssetInputRefsFromNode(_0x9bd65b, {
      allowedTypes: ["image", "video"]
    });
    const _0x3898f6 = normalizeStoryboardImageInputRefs({
      directImageRefs: _0x50bde8,
      promptAssetRefs: _0x4b54f7,
      hiddenAssetRefs: _0x1363d0
    });
    const _0xac02ff = normalizeStoryboardVideoInputRefs({
      directVideoRefs: _0xd85fde,
      promptAssetRefs: _0x4b54f7,
      hiddenAssetRefs: _0x1363d0
    });
    const _0x2cee9d = _0x3898f6.map(_0x576982 => _0x576982.url).filter(Boolean);
    const _0x1ce9ab = _0xac02ff.map(_0x267604 => _0x267604.url).filter(Boolean);
    const _0x35c466 = _0x2cee9d.length > 0 && _0x1ce9ab.length > 0 ? "multimodal" : _0x1ce9ab.length > 0 ? "video" : _0x2cee9d.length > 0 ? "image" : "text";
    return {
      promptText: _0x507793,
      imageRefs: _0x3898f6,
      videoRefs: _0xac02ff,
      imageLabels: _0x3898f6.map(_0x4dce5a => _0x4dce5a.label),
      videoLabels: _0xac02ff.map(_0x289d98 => _0x289d98.label),
      inputUrls: [..._0x2cee9d, ..._0x1ce9ab],
      inputImageUrls: _0x2cee9d,
      inputVideoUrls: _0x1ce9ab,
      sourceMode: _0x35c466
    };
  }
  _updateSubmitButtonState() {
    if (!this.btnEl) {
      return;
    }
    const _0x2936fe = a548_0x27f1b3.getState?.().nodes?.[this.nodeId] || this._data || {};
    const _0x3f6438 = createDefaultStoryboardScriptState(_0x2936fe.storyboardScript || this._data.storyboardScript || {});
    const _0x985535 = resolveGenerationButtonMode({
      ..._0x2936fe,
      isGenerating: this._isGeneratingScript || _0x2936fe.isGenerating === true || _0x3f6438.isGenerating === true,
      jobStatus: _0x3f6438.jobStatus || _0x2936fe.jobStatus || ""
    }, {
      cancellable: _0x2936fe.taskCancellable === true
    });
    const _0x363f3c = this._getStoryboardSubmitInput();
    const _0xdb3e = _0x363f3c.promptText;
    const _0x2ea549 = _0x3f6438.rows.length > 0 && _0x3f6438.selectionMode === true;
    const _0x2c8873 = _0x2ea549 ? storyboardScriptText("toolbar.generateSelected") : storyboardScriptText("generate");
    const _0x260b5f = getSelectedRowIndexes(_0x3f6438).length;
    const _0x27c8d3 = _0x2ea549 ? _0x260b5f > 0 : Boolean(_0xdb3e || _0x363f3c.inputImageUrls.length > 0 || _0x363f3c.inputVideoUrls.length > 0);
    this._syncGeneratingOverlay(_0x985535.busy);
    if (this._queueBtn) {
      this._queueBtn.hidden = !_0x2ea549;
      this._queueBtn.disabled = !_0x2ea549 || _0x260b5f === 0 || _0x985535.busy;
      this._queueBtn.style.cursor = this._queueBtn.disabled ? "var(--unavailable-cursor)" : "";
    }
    this._syncToolbarButtonState({
      canGenerate: _0x3f6438.rows.length > 0 && !_0x985535.busy && !_0x985535.disabled,
      canDownload: Array.isArray(_0x3f6438.rows) && _0x3f6438.rows.length > 0
    });
    if (_0x985535.busy) {
      setGenerateButtonLoadingUi(this.btnEl, {
        title: _0x2c8873,
        disabled: _0x985535.disabled,
        ariaLabel: _0x2c8873
      });
      this.btnEl.disabled = _0x985535.disabled;
      this.btnEl.style.cursor = _0x985535.cursor;
      return;
    }
    resetGenerateButtonIdleUi(this.btnEl, _0x2c8873);
    if (!_0x27c8d3) {
      this.btnEl.disabled = true;
      this.btnEl.style.cursor = "var(--unavailable-cursor)";
    } else {
      this.btnEl.disabled = false;
      this.btnEl.style.cursor = "";
    }
  }
  _syncToolbarButtonState({
    canGenerate: _0x32f952,
    canDownload: _0x4a511c,
    canFullscreen: _0xd633cc
  } = {}) {
    if (this._toolbarGenerateBtn) {
      this._toolbarGenerateBtn.disabled = _0x32f952 !== true;
      this._toolbarGenerateBtn.style.cursor = _0x32f952 === true ? "" : "var(--unavailable-cursor)";
    }
    if (this._toolbarFullscreenBtn) {
      const _0x18ee8a = (_0xd633cc ?? _0x4a511c) === true;
      this._toolbarFullscreenBtn.disabled = !_0x18ee8a;
      this._toolbarFullscreenBtn.style.cursor = _0x18ee8a ? "" : "var(--unavailable-cursor)";
    }
    if (this._toolbarDownloadBtn) {
      this._toolbarDownloadBtn.disabled = _0x4a511c !== true;
      this._toolbarDownloadBtn.style.cursor = _0x4a511c === true ? "" : "var(--unavailable-cursor)";
    }
  }
  _syncGenerateButtonState() {
    this._updateSubmitButtonState();
  }
  _createFullscreenCloseButton() {
    const _0x4b46c3 = document.createElement("button");
    _0x4b46c3.type = "button";
    _0x4b46c3.className = "storyboard-script-fullscreen-close";
    _0x4b46c3.setAttribute("aria-label", storyboardScriptText("fullscreen.close"));
    _0x4b46c3.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"18\" height=\"18\"><path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/></svg>";
    _0x4b46c3.addEventListener("click", _0x4b022a => {
      _0x4b022a.stopPropagation();
      this._closeFullscreenScript();
    });
    return _0x4b46c3;
  }
  _openFullscreenScript() {
    this._finishCellEdit({
      commit: true
    });
    const _0xefbfd9 = this._getScriptState();
    if (!Array.isArray(_0xefbfd9.rows) || _0xefbfd9.rows.length === 0) {
      window.showToast?.(storyboardScriptText("toasts.noFullscreenData"), "warn");
      return;
    }
    if (this._fullscreenOverlayEl) {
      this._renderFullscreenContent(_0xefbfd9);
      this._fullscreenOverlayEl.querySelector(".storyboard-script-fullscreen-close")?.focus?.({
        preventScroll: true
      });
      return;
    }
    const _0x49f2e8 = document.createElement("div");
    _0x49f2e8.className = "storyboard-script-fullscreen-overlay";
    _0x49f2e8.setAttribute("role", "dialog");
    _0x49f2e8.setAttribute("aria-modal", "true");
    _0x49f2e8.setAttribute("aria-label", storyboardScriptText("fullscreen.aria"));
    const _0x57e1a6 = document.createElement("section");
    _0x57e1a6.className = "storyboard-script-fullscreen-panel";
    _0x57e1a6.addEventListener("pointerdown", _0x3e57eb => {
      _0x3e57eb.stopPropagation();
    });
    _0x57e1a6.addEventListener("dblclick", _0x519dba => {
      _0x519dba.stopPropagation();
    });
    const _0x39fc2e = document.createElement("header");
    _0x39fc2e.className = "storyboard-script-fullscreen-header";
    const _0x2c8052 = document.createElement("div");
    _0x2c8052.className = "storyboard-script-fullscreen-title-wrap";
    const _0x35b5e1 = document.createElement("div");
    _0x35b5e1.className = "storyboard-script-fullscreen-title";
    _0x35b5e1.textContent = _0xefbfd9.title || this._data.name || getStoryboardScriptDefaultName();
    const _0x5df78d = document.createElement("div");
    _0x5df78d.className = "storyboard-script-fullscreen-meta";
    _0x2c8052.appendChild(_0x35b5e1);
    _0x2c8052.appendChild(_0x5df78d);
    _0x39fc2e.appendChild(_0x2c8052);
    _0x39fc2e.appendChild(this._createFullscreenCloseButton());
    const _0x4d3992 = document.createElement("div");
    _0x4d3992.className = "storyboard-script-fullscreen-body";
    this._bindFullscreenBodyInteractions(_0x4d3992);
    _0x57e1a6.appendChild(_0x39fc2e);
    _0x57e1a6.appendChild(_0x4d3992);
    _0x49f2e8.appendChild(_0x57e1a6);
    _0x49f2e8.addEventListener("pointerdown", _0x1031e5 => {
      _0x1031e5.stopPropagation();
      if (_0x1031e5.target === _0x49f2e8) {
        this._closeFullscreenScript();
      }
    });
    this._onFullscreenKeydown = _0x314175 => {
      if (_0x314175.key !== "Escape") {
        return;
      }
      _0x314175.preventDefault();
      _0x314175.stopPropagation();
      this._closeFullscreenScript();
    };
    document.addEventListener("keydown", this._onFullscreenKeydown, true);
    document.body.appendChild(_0x49f2e8);
    this._fullscreenOverlayEl = _0x49f2e8;
    this._renderFullscreenContent(_0xefbfd9);
    _0x49f2e8.querySelector(".storyboard-script-fullscreen-close")?.focus?.({
      preventScroll: true
    });
  }
  _closeFullscreenScript() {
    this._finishCellEdit({
      commit: true
    });
    if (this._onFullscreenKeydown) {
      document.removeEventListener("keydown", this._onFullscreenKeydown, true);
      this._onFullscreenKeydown = null;
    }
    this._fullscreenOverlayEl?.remove();
    this._fullscreenOverlayEl = null;
  }
  _bindFullscreenBodyInteractions(_0x9b917b) {
    if (!(_0x9b917b instanceof HTMLElement)) {
      return;
    }
    _0x9b917b.addEventListener("wheel", _0x5ec77f => {
      _0x5ec77f.stopPropagation();
    }, {
      passive: false
    });
    _0x9b917b.addEventListener("pointerdown", _0x4daade => {
      const _0x9331fc = _0x4daade.target instanceof Element ? _0x4daade.target : _0x4daade.target?.parentElement;
      const _0x428800 = _0x9331fc?.closest?.("[data-storyboard-edit-key]");
      if (!_0x428800 || !_0x9b917b.contains(_0x428800)) {
        return;
      }
      this._beginCellEdit(_0x428800, {
        focus: false,
        selectAll: false
      });
    }, {
      capture: true
    });
    _0x9b917b.addEventListener("pointerdown", _0x1bbf6f => {
      _0x1bbf6f.stopPropagation();
    });
    _0x9b917b.addEventListener("dblclick", _0x4ee0f2 => {
      const _0x3cfd62 = _0x4ee0f2.target instanceof Element ? _0x4ee0f2.target : _0x4ee0f2.target?.parentElement;
      const _0x5be750 = _0x3cfd62?.closest?.("[data-storyboard-edit-key]");
      _0x4ee0f2.preventDefault();
      _0x4ee0f2.stopPropagation();
      if (!_0x5be750 || !_0x9b917b.contains(_0x5be750)) {
        return;
      }
      this._beginCellEdit(_0x5be750);
    });
  }
  _renderFullscreenContent(_0x3116a3 = this._getScriptState(), _0x401438 = null) {
    if (!this._fullscreenOverlayEl) {
      return;
    }
    const _0xab8980 = this._fullscreenOverlayEl.querySelector(".storyboard-script-fullscreen-body");
    if (!(_0xab8980 instanceof HTMLElement)) {
      return;
    }
    const _0x5ace2e = Array.isArray(_0x3116a3.rows) ? _0x3116a3.rows : [];
    const _0x31196e = _0xab8980.querySelector(".storyboard-script-table-wrap, .storyboard-script-card-grid");
    const _0x1df732 = _0x31196e ? {
      left: _0x31196e.scrollLeft || 0,
      top: _0x31196e.scrollTop || 0
    } : null;
    const _0x44df3e = _0x401438 || mergeStoryboardImageRefs(this._getStoryboardSubmitInput().imageRefs, _0x3116a3.referenceImageRefs);
    const _0x2b2d88 = this._fullscreenOverlayEl.querySelector(".storyboard-script-fullscreen-title");
    if (_0x2b2d88) {
      _0x2b2d88.textContent = _0x3116a3.title || this._data.name || getStoryboardScriptDefaultName();
    }
    const _0x3956bf = this._fullscreenOverlayEl.querySelector(".storyboard-script-fullscreen-meta");
    if (_0x3956bf) {
      const _0x54f51b = normalizeStoryboardScriptViewMode(_0x3116a3.viewMode) === "card" ? storyboardScriptText("viewMode.card") : storyboardScriptText("viewMode.list");
      const _0x4ec5f3 = normalizeStoryboardScriptMediaMode(_0x3116a3.mediaMode) === "video" ? storyboardScriptText("mediaMode.video") : storyboardScriptText("mediaMode.image");
      _0x3956bf.textContent = storyboardScriptText("fullscreen.meta", {
        count: _0x5ace2e.length,
        media: _0x4ec5f3,
        view: _0x54f51b
      });
    }
    _0xab8980.replaceChildren();
    if (_0x5ace2e.length === 0) {
      _0xab8980.appendChild(this._createEmptyState());
      return;
    }
    const _0xcf27bc = buildStoryboardImageRefMap(_0x44df3e);
    const _0x26f34f = normalizeStoryboardScriptViewMode(_0x3116a3.viewMode) === "card" ? this._createCardView(_0x5ace2e, getStoryboardCardFieldsForMediaMode(_0x3116a3.mediaMode, _0x5ace2e), _0xcf27bc) : this._createListView(_0x5ace2e, getStoryboardColumnsForMediaMode(_0x3116a3.mediaMode, _0x5ace2e), _0xcf27bc, {
      selectionMode: false
    });
    _0x26f34f.classList.add("storyboard-script-fullscreen-scroller");
    _0xab8980.appendChild(_0x26f34f);
    if (_0x1df732) {
      const _0x5081f7 = () => {
        _0x26f34f.scrollLeft = Math.max(0, _0x1df732.left);
        _0x26f34f.scrollTop = Math.max(0, _0x1df732.top);
      };
      _0x5081f7();
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(_0x5081f7);
      }
    }
  }
  _renderRefBar() {
    _renderSharedRefBar(this);
  }
  _bindBodyInteractions() {
    if (!this._bodyEl) {
      return;
    }
    this._bodyEl.addEventListener("wheel", _0x4c2aaa => {
      _0x4c2aaa.stopPropagation();
    }, {
      passive: false
    });
    this._bodyEl.addEventListener("pointerdown", _0x3503c1 => {
      const _0x4ba78a = this._getScriptState();
      if (_0x4ba78a.selectionMode !== true) {
        return;
      }
      const _0x2d1f33 = _0x3503c1.target instanceof Element ? _0x3503c1.target : _0x3503c1.target?.parentElement;
      const _0x5e1588 = _0x2d1f33?.closest?.("[data-storyboard-edit-key]");
      if (!_0x5e1588 || !this._bodyEl.contains(_0x5e1588)) {
        return;
      }
      this._beginCellEdit(_0x5e1588, {
        focus: false,
        selectAll: false
      });
    }, {
      capture: true
    });
    this._bodyEl.addEventListener("pointerdown", _0x5a5d12 => {
      const _0x504add = this._getScriptState();
      if (_0x504add.selectionMode !== true) {
        return;
      }
      _0x5a5d12.stopPropagation();
    });
    this._bodyEl.addEventListener("dblclick", _0x4c42ad => {
      const _0x1cc2c1 = _0x4c42ad.target instanceof Element ? _0x4c42ad.target : _0x4c42ad.target?.parentElement;
      const _0x664c4f = _0x1cc2c1?.closest?.("[data-storyboard-edit-key]");
      _0x4c42ad.preventDefault();
      _0x4c42ad.stopPropagation();
      const _0x4b7b79 = this._getScriptState();
      if (_0x4b7b79.selectionMode !== true) {
        this._enterSelectionMode();
        return;
      }
      if (!_0x664c4f || !this._bodyEl.contains(_0x664c4f)) {
        return;
      }
      this._beginCellEdit(_0x664c4f);
    });
  }
  _beginCellEdit(_0x1a0b38, {
    focus = true,
    selectAll = true
  } = {}) {
    if (!(_0x1a0b38 instanceof HTMLElement)) {
      return;
    }
    if (this._activeCellEdit?.target === _0x1a0b38) {
      return;
    }
    this._finishCellEdit({
      commit: true
    });
    const _0x36ad31 = Number(_0x1a0b38.dataset.storyboardRowIndex);
    const _0x589367 = String(_0x1a0b38.dataset.storyboardEditKey || "");
    if (!Number.isInteger(_0x36ad31) || _0x36ad31 < 0 || !_0x589367) {
      return;
    }
    const _0x2ae69c = _0x1a0b38.dataset.storyboardRawValue ?? _0x1a0b38.textContent ?? "";
    const _0xe480ee = _0x1ef206 => _0x1ef206.stopPropagation();
    const _0x2f9ade = _0x5b2d5f => _0x5b2d5f.stopPropagation();
    const _0x4a7f9c = _0x3483ba => {
      _0x3483ba.stopPropagation();
      if (_0x3483ba.key === "Enter" && !_0x3483ba.shiftKey) {
        _0x3483ba.preventDefault();
        this._finishCellEdit({
          commit: true
        });
      } else if (_0x3483ba.key === "Escape") {
        _0x3483ba.preventDefault();
        this._finishCellEdit({
          commit: false
        });
      }
    };
    const _0x4667b3 = () => this._finishCellEdit({
      commit: true
    });
    const _0x404c10 = () => {
      _0x1a0b38.removeEventListener("pointerdown", _0xe480ee);
      _0x1a0b38.removeEventListener("dblclick", _0x2f9ade);
      _0x1a0b38.removeEventListener("keydown", _0x4a7f9c);
      _0x1a0b38.removeEventListener("blur", _0x4667b3);
    };
    this._activeCellEdit = {
      target: _0x1a0b38,
      rowIndex: _0x36ad31,
      key: _0x589367,
      originalText: _0x2ae69c,
      cleanup: _0x404c10
    };
    _0x1a0b38.textContent = _0x2ae69c;
    _0x1a0b38.classList.remove("storyboard-script-image-cell");
    _0x1a0b38.classList.add("is-editing");
    _0x1a0b38.contentEditable = "true";
    _0x1a0b38.spellcheck = false;
    _0x1a0b38.addEventListener("pointerdown", _0xe480ee);
    _0x1a0b38.addEventListener("dblclick", _0x2f9ade);
    _0x1a0b38.addEventListener("keydown", _0x4a7f9c);
    _0x1a0b38.addEventListener("blur", _0x4667b3);
    if (focus) {
      _0x1a0b38.focus({
        preventScroll: true
      });
    }
    const _0x5f3ab5 = selectAll ? window.getSelection?.() : null;
    if (_0x5f3ab5) {
      const _0x1ccffe = document.createRange();
      _0x1ccffe.selectNodeContents(_0x1a0b38);
      _0x5f3ab5.removeAllRanges();
      _0x5f3ab5.addRange(_0x1ccffe);
    }
  }
  _finishCellEdit({
    commit: _0xedba89
  }) {
    const _0x1c3f5e = this._activeCellEdit;
    if (!_0x1c3f5e) {
      return;
    }
    this._activeCellEdit = null;
    _0x1c3f5e.cleanup?.();
    _0x1c3f5e.target.classList.remove("is-editing");
    _0x1c3f5e.target.removeAttribute("contenteditable");
    _0x1c3f5e.target.spellcheck = false;
    if (!_0xedba89) {
      this._restoreEditedCellDisplay(_0x1c3f5e.target, _0x1c3f5e.key, _0x1c3f5e.originalText);
      return;
    }
    const _0x43bd84 = String(_0x1c3f5e.target.textContent || "").replace(/\u00a0/g, " ").trim();
    if (_0x43bd84 !== _0x1c3f5e.originalText) {
      this._restoreEditedCellDisplay(_0x1c3f5e.target, _0x1c3f5e.key, _0x43bd84);
      this._updateCellValue(_0x1c3f5e.rowIndex, _0x1c3f5e.key, _0x43bd84);
    } else if (_0x1c3f5e.key === "角色图" || _0x1c3f5e.key === "参考") {
      this._restoreEditedCellDisplay(_0x1c3f5e.target, _0x1c3f5e.key, _0x1c3f5e.originalText);
    }
  }
  _restoreEditedCellDisplay(_0x5d399a, _0x586ddf, _0x24b87c) {
    if (!(_0x5d399a instanceof HTMLElement)) {
      return;
    }
    const _0x5e5b61 = this._getScriptState();
    const _0x1173c5 = this._getStoryboardSubmitInput();
    const _0x27b677 = buildStoryboardImageRefMap(mergeStoryboardImageRefs(_0x1173c5.imageRefs, _0x5e5b61.referenceImageRefs));
    appendStoryboardCellDisplay(_0x5d399a, _0x586ddf, _0x24b87c, _0x27b677);
  }
  _updateCellValue(_0x1cc3a9, _0x51c8ca, _0x164a1a) {
    const _0x3fb908 = this._getScriptState();
    if (!Array.isArray(_0x3fb908.rows) || !_0x3fb908.rows[_0x1cc3a9]) {
      return;
    }
    const _0x51baa2 = _0x3fb908.rows.map((_0xade937, _0xfdcb6) => _0xfdcb6 === _0x1cc3a9 ? {
      ..._0xade937,
      [_0x51c8ca]: _0x164a1a
    } : _0xade937);
    const _0x4d993f = serializeCanonicalStoryboardScriptJson({
      ..._0x3fb908,
      rows: _0x51baa2
    });
    const _0x5f0841 = JSON.parse(_0x4d993f);
    const _0x41c73f = {
      ..._0x3fb908,
      rows: _0x51baa2,
      canonicalJson: _0x4d993f,
      title: _0x5f0841.title,
      detectedIntent: _0x5f0841.detectedIntent,
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      storyboardScript: _0x41c73f
    };
    this._skipNextStoryboardBodyRender = true;
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      storyboardScript: _0x41c73f
    });
  }
  async _prepareStoryboardVideoFrames({
    submitInput: _0x1e754f,
    promptText: _0x1c7875,
    model: _0x38844d,
    provider: _0x1ecc55
  }) {
    const _0x3861b4 = Array.isArray(_0x1e754f?.videoRefs) ? _0x1e754f.videoRefs : [];
    if (_0x3861b4.length === 0) {
      return {
        frameRefs: [],
        frameBatches: [],
        frameSummary: "",
        visibleFrameRefs: []
      };
    }
    const _0x3513c0 = extractRequestedStoryboardShotCount(_0x1c7875, {
      max: STORYBOARD_VIDEO_FRAME_LIMIT
    });
    const _0x5667fe = _0x3513c0 || STORYBOARD_VIDEO_FRAME_LIMIT;
    const _0x4efd21 = Math.max(1, Math.ceil(_0x5667fe / _0x3861b4.length));
    const _0x105068 = getStoryboardModelImageInputLimit(_0x38844d, _0x1ecc55);
    const _0x33b8d7 = [];
    for (const _0x396d95 of _0x3861b4) {
      if (_0x33b8d7.length >= _0x5667fe) {
        break;
      }
      const _0x4b6d60 = _0x5667fe - _0x33b8d7.length;
      const _0x1efcaa = Math.max(1, Math.min(_0x4efd21, _0x4b6d60));
      const _0x37fcfc = await extractStoryboardVideoFramesFromServer(_0x396d95.url, {
        maxFrames: _0x1efcaa,
        exactCount: _0x3513c0 > 0
      });
      const _0x39ceb0 = Array.isArray(_0x37fcfc.frames) ? _0x37fcfc.frames : [];
      for (const _0x2143dc of _0x39ceb0) {
        if (_0x33b8d7.length >= _0x5667fe) {
          break;
        }
        const _0x38dd3b = getStoryboardImagePlaceholder(_0x33b8d7.length + 1);
        const _0x3ba436 = String(_0x2143dc.url || "").trim();
        if (!_0x3ba436) {
          continue;
        }
        const _0x3508e0 = {
          ..._0x2143dc,
          label: _0x38dd3b,
          url: _0x3ba436,
          type: "image",
          source: "video-frame",
          videoLabel: _0x396d95.label,
          videoUrl: _0x396d95.url
        };
        _0x3508e0.timeRange = formatStoryboardVideoTimeRange(_0x3508e0);
        _0x33b8d7.push(_0x3508e0);
      }
    }
    const _0x7a1b78 = _0x33b8d7.map((_0x471203, _0x330b96) => ({
      ..._0x471203,
      sentAsImage: _0x330b96 < _0x105068
    }));
    return {
      frameRefs: _0x7a1b78,
      frameBatches: chunkStoryboardFrameRefs(_0x7a1b78, _0x105068),
      frameSummary: buildStoryboardVideoFrameReferenceSummary(_0x7a1b78),
      visibleFrameRefs: _0x7a1b78
    };
  }
  async _buildPayload(_0x13fa83 = null) {
    const _0xf5211a = this._getStoryboardSubmitInput(_0x13fa83);
    const _0x3bc2e2 = _0xf5211a.promptText;
    const _0x221a12 = _0xf5211a.inputImageUrls.length > 0;
    const _0x3b002b = _0xf5211a.inputVideoUrls.length > 0;
    if (!_0x3bc2e2 && !_0x221a12 && !_0x3b002b) {
      window.showToast?.(storyboardScriptText("toasts.missingPromptOrReference"), "warn");
      return null;
    }
    const _0x4b99ae = resolveStoryboardScriptTextModel(this._data);
    const _0x2e1edd = resolveStoryboardScriptTextProvider(this._data);
    const _0x86987 = _0xf5211a.sourceMode;
    const _0x58c424 = _0x86987 === "video" ? await this._prepareStoryboardVideoFrames({
      submitInput: _0xf5211a,
      promptText: _0x3bc2e2,
      model: _0x4b99ae,
      provider: _0x2e1edd
    }) : {
      frameRefs: [],
      frameBatches: [],
      frameSummary: "",
      visibleFrameRefs: []
    };
    const _0x1d6efc = _0x3bc2e2 || buildStoryboardReferenceSummary({
      imageLabels: _0xf5211a.imageLabels,
      videoLabels: _0xf5211a.videoLabels
    });
    const _0x415e66 = buildStoryboardReferenceSummary({
      imageLabels: _0xf5211a.imageLabels,
      videoLabels: _0xf5211a.videoLabels
    });
    let _0x34cb81 = buildStoryboardScriptTextOnlyPrompt(_0x3bc2e2);
    let _0x512013 = buildStoryboardScriptTextOnlySystemPrompt();
    if (_0x86987 === "image") {
      _0x34cb81 = buildStoryboardScriptImagePrompt(_0x3bc2e2, {
        imageCount: _0xf5211a.inputImageUrls.length,
        imageLabels: _0xf5211a.imageLabels
      });
      _0x512013 = buildStoryboardScriptImageSystemPrompt();
    } else if (_0x86987 === "video") {
      _0x34cb81 = buildStoryboardScriptVideoPrompt(_0x3bc2e2, {
        videoCount: _0xf5211a.inputVideoUrls.length,
        videoLabels: _0xf5211a.videoLabels,
        videoFrameSummary: _0x58c424.frameSummary
      });
      _0x512013 = buildStoryboardScriptVideoSystemPrompt();
    } else if (_0x86987 === "multimodal") {
      _0x34cb81 = buildStoryboardScriptPrompt(_0x3bc2e2, {
        summary: _0x415e66,
        imageCount: _0xf5211a.inputImageUrls.length,
        imageLabels: _0xf5211a.imageLabels,
        videoCount: _0xf5211a.inputVideoUrls.length,
        videoLabels: _0xf5211a.videoLabels
      });
      _0x512013 = "";
    }
    return {
      prompt: _0x34cb81,
      systemPrompt: _0x512013,
      storyboardPrompt: _0x1d6efc,
      sourceMode: _0x86987,
      inputUrls: _0x86987 === "video" ? [..._0x58c424.visibleFrameRefs.filter(_0x5dfc5a => _0x5dfc5a.sentAsImage !== false).map(_0x42cdef => _0x42cdef.url).filter(Boolean), ..._0xf5211a.inputVideoUrls] : _0xf5211a.inputUrls,
      inputImageUrls: _0x86987 === "video" ? _0x58c424.visibleFrameRefs.filter(_0x400c4d => _0x400c4d.sentAsImage !== false).map(_0x4eee43 => _0x4eee43.url).filter(Boolean) : _0xf5211a.inputImageUrls,
      inputVideoUrls: _0xf5211a.inputVideoUrls,
      videoLabels: _0xf5211a.videoLabels,
      videoFrameRefs: _0x58c424.visibleFrameRefs,
      videoFrameBatches: _0x58c424.frameBatches,
      referenceImageRefs: _0x58c424.visibleFrameRefs,
      rawPromptText: _0x3bc2e2,
      requestTimeoutMs: STORYBOARD_SCRIPT_TEXT_REQUEST_TIMEOUT_MS,
      model: _0x4b99ae,
      provider: _0x2e1edd,
      nodeId: this.nodeId
    };
  }
  _createImageNodesFromSelectedStoryboards({
    startGeneration = false
  } = {}) {
    this._finishCellEdit({
      commit: true
    });
    const _0x54de62 = a548_0x27f1b3.getState?.().nodes?.[this.nodeId] || this._data || {};
    const _0x2f4a48 = createDefaultStoryboardScriptState(_0x54de62.storyboardScript || this._data.storyboardScript || {});
    const _0x568a55 = serializeCanonicalStoryboardScriptJson(_0x2f4a48);
    const _0x3c6bff = JSON.parse(_0x568a55);
    const _0x16df99 = getSelectedRowIndexes(_0x2f4a48);
    if (_0x2f4a48.selectionMode !== true) {
      return false;
    }
    if (_0x16df99.length === 0) {
      window.showToast?.(storyboardScriptText("toasts.selectStoryboardsFirst"), "warn");
      return true;
    }
    const _0x258ed2 = _0x16df99.map(_0x47f477 => {
      const _0x29bd40 = _0x2f4a48.rows[_0x47f477] || {};
      return {
        rowIndex: _0x47f477,
        shotNo: getStoryboardRowShotNo(_0x29bd40, _0x47f477),
        prompt: getStoryboardRowImagePrompt(_0x29bd40)
      };
    });
    const _0x431c13 = _0x258ed2.filter(_0x1fa865 => !_0x1fa865.prompt);
    if (_0x431c13.length > 0) {
      window.showToast?.(storyboardScriptText("toasts.missingImagePrompt"), "warn");
      return true;
    }
    const _0x5b250f = _0x2f4a48.imageModel || DEFAULT_IMAGE_NODE_MODEL;
    const _0x5a54a6 = _0x2f4a48.imageProvider || DEFAULT_IMAGE_NODE_PROVIDER;
    const _0x1edec4 = String(_0x2f4a48.imageProviderProfileId || _0x54de62.providerProfileId || "").trim();
    const _0x2e6276 = resolveStoryboardScriptTextModel({
      storyboardScript: _0x2f4a48
    });
    const _0x39ad42 = resolveStoryboardScriptTextProvider({
      storyboardScript: _0x2f4a48
    });
    const _0x214705 = clonePlainObject(_0x54de62.generationParams);
    const _0x5965c2 = clonePlainObject(_0x54de62.generationParamsByModel);
    const _0x28de69 = _0x214705?.aspectRatio || _0x54de62.aspectRatio || "自适应";
    const _0x1ade65 = _0x214705?.imageSize || _0x54de62.imageSize || "";
    const _0x173207 = getImageNodeSizeForAspectRatio(_0x28de69);
    const _0x1f8b59 = getStateSnapshot();
    const _0x36f3ea = createBatchSpawnLayoutNearNode({
      nodes: _0x1f8b59.nodes || {},
      anchorNode: _0x54de62,
      itemCount: _0x258ed2.length,
      itemWidth: _0x173207.width,
      itemHeight: _0x173207.height,
      maxPerLine: 5,
      padding: STORYBOARD_IMAGE_BATCH_PADDING,
      titleHeight: STORYBOARD_IMAGE_BATCH_TITLE_HEIGHT
    });
    const _0x7c56c3 = generateId("group");
    a548_0x27f1b3.addNode({
      id: _0x7c56c3,
      type: "group",
      x: _0x36f3ea.groupX,
      y: _0x36f3ea.groupY,
      width: _0x36f3ea.groupWidth,
      height: _0x36f3ea.groupHeight,
      name: storyboardScriptText("imageBatchGroupName"),
      label: storyboardScriptText("imageBatchGroupName")
    });
    const _0x1a225c = [];
    _0x258ed2.forEach((_0x1a421a, _0x421dc4) => {
      const _0x282017 = _0x36f3ea.getItemPosition(_0x421dc4);
      const _0x584202 = generateId("ai-image");
      const _0xfc7578 = {
        id: _0x584202,
        type: "ai-image",
        x: _0x282017.x,
        y: _0x282017.y,
        width: _0x173207.width,
        height: _0x173207.height,
        name: storyboardScriptText("imageNodeName", {
          shot: _0x1a421a.shotNo || _0x421dc4 + 1
        }),
        prompt: escapePromptTextForHtml(_0x1a421a.prompt),
        model: _0x5b250f,
        provider: _0x5a54a6,
        ...(_0x5a54a6 === "runninghub" && _0x1edec4 ? {
          providerProfileId: _0x1edec4
        } : {}),
        aspectRatio: _0x28de69,
        needsAutoResize: true,
        storyboardSource: {
          nodeId: this.nodeId,
          rowIndex: _0x1a421a.rowIndex,
          shotNo: _0x1a421a.shotNo
        }
      };
      if (_0x214705) {
        _0xfc7578.generationParams = clonePlainObject(_0x214705);
      }
      if (_0x5965c2) {
        _0xfc7578.generationParamsByModel = clonePlainObject(_0x5965c2);
      }
      if (_0x1ade65) {
        _0xfc7578.imageSize = _0x1ade65;
      }
      a548_0x27f1b3.addNode(_0xfc7578);
      _0x1a225c.push(_0x584202);
    });
    a548_0x27f1b3.groupNodes(_0x1a225c, _0x7c56c3);
    const _0x29986d = {
      ..._0x2f4a48,
      canonicalJson: _0x568a55,
      title: _0x3c6bff.title,
      detectedIntent: _0x3c6bff.detectedIntent,
      selectionMode: false,
      selectedRowIndexes: [],
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      model: _0x2e6276,
      provider: _0x39ad42,
      storyboardScript: _0x29986d
    };
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      model: _0x2e6276,
      provider: _0x39ad42,
      storyboardScript: _0x29986d
    });
    commit();
    if (startGeneration) {
      this._startGeneratedImageNodes(_0x1a225c, {
        onStarted: () => focusStoryboardImageBatch(this.nodeId, _0x7c56c3)
      });
    } else {
      focusStoryboardImageBatch(this.nodeId, _0x7c56c3);
    }
    window.showToast?.(startGeneration ? storyboardScriptText("toasts.createdAndStartedImageNodes", {
      count: _0x1a225c.length
    }) : storyboardScriptText("toasts.createdImageNodes", {
      count: _0x1a225c.length
    }), "success");
    return true;
  }
  _startGeneratedImageNodes(_0x467876 = [], {
    onStarted = null
  } = {}) {
    const _0x15d50d = Array.isArray(_0x467876) ? _0x467876.map(_0x3e7dea => String(_0x3e7dea || "").trim()).filter(Boolean) : [];
    if (_0x15d50d.length === 0 || typeof window === "undefined") {
      return;
    }
    const _0x42d5da = new Set(_0x15d50d);
    const _0x315c06 = "storyboard-script:" + this.nodeId + ":auto-generate";
    const _0x5eac33 = () => window.v2Renderer || null;
    const _0x2f0629 = _0x3f0654 => {
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(_0x3f0654);
      } else {
        window.setTimeout(_0x3f0654, 16);
      }
    };
    if (_0x5eac33()?.pinNode) {
      _0x15d50d.forEach(_0x190e0e => _0x5eac33()?.pinNode?.(_0x190e0e, _0x315c06));
    }
    let _0x5ca85b = 0;
    const _0x4d5773 = 30;
    let _0x5e68a4 = false;
    const _0x254adb = () => {
      if (_0x5e68a4) {
        return;
      }
      _0x5e68a4 = true;
      if (typeof onStarted !== "function") {
        return;
      }
      try {
        onStarted();
      } catch (_0x452d8d) {
        console.warn("[StoryboardScriptNode] post-start callback failed", _0x452d8d);
      }
    };
    const _0x3bc448 = () => {
      _0x5ca85b += 1;
      const _0x51fe80 = _0x5eac33();
      _0x51fe80?.flushNodes?.([..._0x42d5da]);
      for (const _0xc3f9da of Array.from(_0x42d5da)) {
        const _0x5338b7 = _0x51fe80?.runMountedNodeGeneration?.(_0xc3f9da);
        if (!_0x5338b7?.started) {
          continue;
        }
        _0x42d5da.delete(_0xc3f9da);
        Promise.resolve(_0x5338b7.result).catch(_0x2cae53 => {
          console.error("[StoryboardScriptNode] auto image generation failed", _0x2cae53);
        }).finally(() => {
          _0x5eac33()?.unpinNode?.(_0xc3f9da, _0x315c06);
        });
      }
      if (_0x42d5da.size === 0) {
        _0x254adb();
        return;
      }
      if (_0x42d5da.size > 0 && _0x5ca85b < _0x4d5773) {
        _0x2f0629(_0x3bc448);
        return;
      }
      if (_0x42d5da.size > 0) {
        _0x42d5da.forEach(_0x50e389 => {
          _0x5eac33()?.unpinNode?.(_0x50e389, _0x315c06);
        });
        window.showToast?.(storyboardScriptText("toasts.autoStartPartialFailed"), "warn");
      }
      _0x254adb();
    };
    _0x2f0629(_0x3bc448);
  }
  runGeneration(_0x5d6279 = {}) {
    return this._onGenerate(null, _0x5d6279);
  }
  cancelGeneration() {
    return {
      ok: false,
      status: "not-cancellable",
      message: "Storyboard script generation is not cancellable yet."
    };
  }
  getGenerationStatus() {
    const _0x1e4787 = a548_0x27f1b3.getState?.().nodes?.[this.nodeId] || this._data || {};
    const _0x5c86e1 = createDefaultStoryboardScriptState(_0x1e4787.storyboardScript || this._data.storyboardScript || {});
    const _0x513fb9 = this._isStoryboardScriptGenerating(_0x5c86e1);
    return {
      nodeId: this.nodeId,
      jobStatus: _0x513fb9 ? "running" : String(_0x5c86e1.jobStatus || "idle"),
      isGenerating: _0x513fb9,
      cancellable: false,
      resumable: false
    };
  }
  async _onGenerate(_0x181fef = null, _0xcc1cd2 = {}) {
    const _0x451c22 = this._isPromptGenerateLoadingPrimed === true;
    if (this._isGeneratingScript && !_0x451c22) {
      return;
    }
    this._isPromptGenerateLoadingPrimed = false;
    if (_0xcc1cd2?.insertPrompt === true) {
      insertPresetPromptIntoEditor({
        storeApi: a548_0x27f1b3,
        nodeId: this.nodeId,
        promptEl: this.promptEl,
        template: _0x181fef,
        inEdges: a548_0x27f1b3.getIncomingEdges(this.nodeId),
        nodes: a548_0x27f1b3.getState().nodes || {},
        allowedAssetTypes: ["text", "image", "video"]
      });
      this._updateSubmitButtonState?.();
      return;
    }
    if (shouldUsePromptPreviewForPreset(_0x181fef)) {
      const _0x5e4ce3 = await this._buildPayload(_0x181fef);
      if (!_0x5e4ce3) {
        this._updateSubmitButtonState?.();
        return;
      }
      previewPresetPromptInEditor({
        storeApi: a548_0x27f1b3,
        nodeId: this.nodeId,
        promptEl: this.promptEl,
        promptText: _0x5e4ce3.prompt
      });
      this._updateSubmitButtonState?.();
      return;
    }
    const _0x41697c = this._getScriptState();
    if (_0x41697c.selectionMode === true) {
      this._isGeneratingScript = false;
      this._syncGeneratingOverlay(false);
      this._createImageNodesFromSelectedStoryboards({
        startGeneration: true
      });
      return;
    }
    this._isGeneratingScript = true;
    if (!_0x451c22) {
      this._setStoryboardGeneratingState(true);
    }
    this._syncGeneratingOverlay(true);
    await waitForStoryboardLoadingPaint();
    this._updateSubmitButtonState();
    let _0x588f39 = null;
    try {
      _0x588f39 = await this._buildPayload(_0x181fef);
    } catch (_0x4d4db7) {
      this._isGeneratingScript = false;
      this._setStoryboardGeneratingState(false);
      this._updateSubmitButtonState();
      window.showToast?.(_0x4d4db7?.message || storyboardScriptText("errors.videoPreprocessFailed"), "error");
      return;
    }
    if (!_0x588f39) {
      this._isGeneratingScript = false;
      this._setStoryboardGeneratingState(false);
      this._updateSubmitButtonState();
      return;
    }
    const _0xaa7009 = Date.now();
    const _0xa268cb = this._getScriptState();
    const _0x466092 = resolveModelManifest(_0x588f39.model, _0x588f39.provider);
    try {
      const _0x2786e8 = await submitTask({
        sourceNodeId: this.nodeId,
        targetNodeId: this.nodeId,
        trigger: "node",
        taskType: "storyboard-script-generation",
        provider: _0x588f39.provider,
        adapterType: "modelApi",
        modelId: _0x588f39.model,
        executionId: _0x466092?.executionId || "storyboard-script." + _0x588f39.provider + "." + _0x588f39.model,
        payload: _0x588f39,
        cancellable: false,
        resumable: false,
        async: false,
        submit: () => runStoryboardScriptGenerationPayload(_0x588f39),
        startBuilder: () => ({
          model: _0x588f39.model,
          provider: _0x588f39.provider,
          storyboardScript: buildStoryboardScriptStatePatch({
            current: _0xa268cb,
            prompt: _0x588f39.storyboardPrompt,
            model: _0x588f39.model,
            provider: _0x588f39.provider,
            sourceMode: _0x588f39.sourceMode,
            status: "running",
            referenceImageRefs: _0x588f39.referenceImageRefs
          })
        }),
        resultBuilder: async _0x725ca4 => {
          const _0x167570 = extractGeneratedText(_0x725ca4).trim();
          const _0x357b01 = normalizeStoryboardScriptGenerationResult(_0x167570, {
            requireMarker: true,
            sourceMode: _0x588f39.sourceMode
          });
          if (!_0x357b01.ok) {
            throw new Error(storyboardScriptText("errors.invalidJsonSwitchModel"));
          }
          return {
            name: _0x357b01.title || this._data.name || getStoryboardScriptDefaultName(),
            model: _0x588f39.model,
            provider: _0x588f39.provider,
            storyboardScript: buildStoryboardScriptStatePatch({
              current: _0xa268cb,
              prompt: _0x588f39.storyboardPrompt,
              model: _0x588f39.model,
              provider: _0x588f39.provider,
              sourceMode: _0x588f39.sourceMode,
              normalized: _0x357b01,
              status: "success",
              referenceImageRefs: _0x588f39.referenceImageRefs
            })
          };
        },
        failureBuilder: _0x17cdd7 => ({
          storyboardScript: buildStoryboardScriptStatePatch({
            current: _0xa268cb,
            prompt: _0x588f39.storyboardPrompt,
            model: _0x588f39.model,
            provider: _0x588f39.provider,
            sourceMode: _0x588f39.sourceMode,
            status: "error",
            error: _0x17cdd7?.message || storyboardScriptText("errors.generationFailed"),
            referenceImageRefs: _0x588f39.referenceImageRefs
          })
        }),
        parseError: _0x3919a8 => _0x3919a8?.message || storyboardScriptText("errors.generationFailed")
      }, {
        store: a548_0x27f1b3,
        startedAt: _0xaa7009
      });
      if (_0x2786e8.status === "failed") {
        window.showToast?.(_0x2786e8.error?.message || storyboardScriptText("errors.generationFailed"), "error");
      }
    } finally {
      this._isGeneratingScript = false;
      this._updateSubmitButtonState();
    }
  }
  async _downloadScriptTable() {
    this._finishCellEdit({
      commit: true
    });
    const _0x433660 = this._getScriptState();
    if (!Array.isArray(_0x433660.rows) || _0x433660.rows.length === 0) {
      window.showToast?.(storyboardScriptText("toasts.noDownloadData"), "warn");
      return;
    }
    const _0x25550f = serializeCanonicalStoryboardScriptJson(_0x433660);
    const _0x2e8d6f = JSON.parse(_0x25550f);
    const _0x2cb9e2 = {
      ..._0x433660,
      canonicalJson: _0x25550f,
      title: _0x2e8d6f.title,
      detectedIntent: _0x2e8d6f.detectedIntent,
      updatedAt: Date.now()
    };
    this._data = {
      ...this._data,
      storyboardScript: _0x2cb9e2
    };
    a548_0x27f1b3.updateNodeData(this.nodeId, {
      storyboardScript: _0x2cb9e2
    });
    const _0x3f2e9d = STORYBOARD_SCRIPT_COLUMNS.map(_0x412998 => ({
      ..._0x412998,
      label: getStoryboardColumnLabel(_0x412998.key, _0x412998.label)
    }));
    const _0x11c4bb = serializeStoryboardScriptRowsToCsv(_0x2cb9e2.rows, _0x3f2e9d);
    const _0x13dff1 = sanitizeExportFileName(_0x2cb9e2.title || this._data.name || getStoryboardScriptDefaultName());
    try {
      const _0x4e60a6 = await saveTextDownload({
        filename: _0x13dff1 + "_" + formatExportTimestamp() + ".csv",
        content: _0x11c4bb,
        mimeType: STORYBOARD_SCRIPT_TABLE_EXPORT_MIME,
        title: storyboardScriptText("toolbar.downloadTable"),
        filterName: "CSV"
      });
      if (_0x4e60a6?.canceled) {
        return;
      }
    } catch (_0x1d70e3) {
      window.showToast?.(String(_0x1d70e3?.message || _0x1d70e3), "error");
      return;
    }
    window.showToast?.(storyboardScriptText("toasts.downloadedTable"), "success");
  }
  _getStoryboardViewScrollKey(_0x50ef67, _0x1cdcf8 = "") {
    const _0x2bd7a5 = normalizeStoryboardScriptMediaMode(_0x50ef67?.mediaMode);
    const _0x47aaf2 = normalizeStoryboardScriptViewMode(_0x1cdcf8 || _0x50ef67?.viewMode);
    return _0x2bd7a5 + ":" + _0x47aaf2;
  }
  _getCurrentStoryboardScroller() {
    return this._bodyEl?.querySelector?.(".storyboard-script-table-wrap, .storyboard-script-card-grid");
  }
  _rememberStoryboardViewScroll(_0x3cde4c, _0x4ab808, _0x7d44b = "") {
    if (!(_0x3cde4c instanceof HTMLElement)) {
      return;
    }
    const _0x3867e0 = this._getStoryboardViewScrollKey(_0x4ab808, _0x7d44b);
    this._storyboardViewScrollByKey.set(_0x3867e0, {
      left: _0x3cde4c.scrollLeft,
      top: _0x3cde4c.scrollTop
    });
  }
  _captureStoryboardViewScroll(_0x2f854f) {
    const _0x43ca35 = this._getCurrentStoryboardScroller();
    if (!(_0x43ca35 instanceof HTMLElement)) {
      return;
    }
    const _0x3d0fe0 = _0x43ca35.classList.contains("storyboard-script-card-grid") ? "card" : "list";
    this._rememberStoryboardViewScroll(_0x43ca35, _0x2f854f, _0x3d0fe0);
  }
  _bindStoryboardViewScrollMemory(_0x3f2edd, _0xd0e851) {
    if (!(_0x3f2edd instanceof HTMLElement)) {
      return;
    }
    if (_0x3f2edd.dataset.storyboardScrollMemoryBound === "true") {
      return;
    }
    _0x3f2edd.dataset.storyboardScrollMemoryBound = "true";
    _0x3f2edd.addEventListener("scroll", () => this._rememberStoryboardViewScroll(_0x3f2edd, _0xd0e851), {
      passive: true
    });
  }
  _restoreStoryboardViewScroll(_0x2341e9, _0x31df4b) {
    if (!(_0x2341e9 instanceof HTMLElement)) {
      return;
    }
    const _0x5f235f = this._getStoryboardViewScrollKey(_0x31df4b);
    const _0x5e922c = this._storyboardViewScrollByKey.get(_0x5f235f);
    if (!_0x5e922c) {
      return;
    }
    const _0x455582 = () => {
      const _0x2d3a5b = Math.max(0, _0x2341e9.scrollWidth - _0x2341e9.clientWidth);
      const _0x199d2a = Math.max(0, _0x2341e9.scrollHeight - _0x2341e9.clientHeight);
      _0x2341e9.scrollLeft = Math.min(_0x2d3a5b, Math.max(0, _0x5e922c.left || 0));
      _0x2341e9.scrollTop = Math.min(_0x199d2a, Math.max(0, _0x5e922c.top || 0));
    };
    _0x455582();
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(_0x455582);
    }
  }
  _render() {
    if (!this._bodyEl) {
      return;
    }
    const _0x24aa69 = this._getScriptState();
    const _0x3099e1 = this._isStoryboardScriptGenerating(_0x24aa69);
    this._captureStoryboardViewScroll(_0x24aa69);
    this._syncModeButtons(_0x24aa69.viewMode, _0x24aa69.mediaMode);
    this._syncSelectionModeUi(_0x24aa69);
    this._updateSubmitButtonState();
    const _0x569200 = this._getStoryboardSubmitInput();
    const _0x53335e = mergeStoryboardImageRefs(_0x569200.imageRefs, _0x24aa69.referenceImageRefs);
    const _0x2a8dcd = buildStoryboardBodyRenderSignature(_0x24aa69, _0x53335e);
    const _0x27a872 = this._getCurrentStoryboardScroller();
    const _0x18c186 = _0x27a872 instanceof HTMLElement && (this._storyboardBodyRenderSignature === _0x2a8dcd || this._skipNextStoryboardBodyRender === true);
    if (_0x18c186) {
      this._storyboardBodyRenderSignature = _0x2a8dcd;
      this._skipNextStoryboardBodyRender = false;
      this._bindStoryboardViewScrollMemory(_0x27a872, _0x24aa69);
      this._syncListSelectionState(_0x24aa69);
      this._syncGeneratingOverlay(_0x3099e1);
      this._renderFullscreenContent(_0x24aa69, _0x53335e);
      return;
    }
    this._skipNextStoryboardBodyRender = false;
    this._storyboardBodyRenderSignature = _0x2a8dcd;
    this._bodyEl.replaceChildren();
    if (_0x24aa69.rows.length === 0) {
      this._bodyEl.appendChild(this._createEmptyState());
      this._syncGeneratingOverlay(_0x3099e1);
      this._renderFullscreenContent(_0x24aa69, _0x53335e);
      return;
    }
    const _0x54e035 = buildStoryboardImageRefMap(_0x53335e);
    let _0x2bf2ed = null;
    if (_0x24aa69.viewMode === "card") {
      _0x2bf2ed = this._createCardView(_0x24aa69.rows, getStoryboardCardFieldsForMediaMode(_0x24aa69.mediaMode, _0x24aa69.rows), _0x54e035);
      this._bodyEl.appendChild(_0x2bf2ed);
    } else {
      _0x2bf2ed = this._createListView(_0x24aa69.rows, getStoryboardColumnsForMediaMode(_0x24aa69.mediaMode, _0x24aa69.rows), _0x54e035);
      this._bodyEl.appendChild(_0x2bf2ed);
    }
    this._bindStoryboardViewScrollMemory(_0x2bf2ed, _0x24aa69);
    this._restoreStoryboardViewScroll(_0x2bf2ed, _0x24aa69);
    this._syncListSelectionState(_0x24aa69);
    this._syncGeneratingOverlay(_0x3099e1);
    this._renderFullscreenContent(_0x24aa69, _0x53335e);
  }
  _createEmptyState() {
    const _0x5a08cc = document.createElement("div");
    _0x5a08cc.className = "storyboard-script-empty";
    const _0xdbed43 = document.createElement("div");
    _0xdbed43.className = "storyboard-script-empty-title";
    _0xdbed43.textContent = storyboardScriptText("empty.title");
    const _0x39311c = document.createElement("div");
    _0x39311c.className = "storyboard-script-empty-hint";
    _0x39311c.textContent = storyboardScriptText("empty.hint");
    _0x5a08cc.appendChild(_0xdbed43);
    _0x5a08cc.appendChild(_0x39311c);
    return _0x5a08cc;
  }
  _createListView(_0x37d743, _0x286d71 = STORYBOARD_SCRIPT_COLUMNS, _0x1a05e1 = new Map(), {
    selectionMode: _0x19260f = null
  } = {}) {
    const _0x213b44 = document.createElement("div");
    _0x213b44.className = "storyboard-script-table-wrap custom-scrollbar";
    const _0x5758b2 = this._getScriptState();
    const _0x4c9025 = _0x19260f == null ? _0x5758b2.selectionMode === true : _0x19260f === true;
    const _0x59a897 = _0x4c9025 ? getSelectedRowIndexes(_0x5758b2) : [];
    const _0x1da1e5 = new Set(_0x59a897);
    const _0x1189ad = _0x37d743.length > 0 && _0x59a897.length === _0x37d743.length;
    const _0x28e5d0 = document.createElement("table");
    _0x28e5d0.className = "storyboard-script-table";
    _0x28e5d0.classList.toggle("is-selection-mode", _0x4c9025);
    const _0x168c1d = document.createElement("thead");
    const _0x3aa1a7 = document.createElement("tr");
    if (_0x4c9025) {
      const _0x16c7e3 = document.createElement("th");
      _0x16c7e3.scope = "col";
      _0x16c7e3.className = "storyboard-script-select-cell storyboard-script-select-cell--head";
      const _0x19c2e1 = document.createElement("input");
      _0x19c2e1.type = "checkbox";
      _0x19c2e1.className = "storyboard-script-select-checkbox storyboard-script-select-all";
      _0x19c2e1.checked = _0x1189ad;
      _0x19c2e1.indeterminate = _0x59a897.length > 0 && !_0x1189ad;
      _0x19c2e1.setAttribute("aria-label", storyboardScriptText("selectAllAria"));
      _0x19c2e1.addEventListener("pointerdown", _0xc5ce0e => {
        _0xc5ce0e.stopPropagation();
      });
      _0x19c2e1.addEventListener("click", _0x5161e2 => {
        _0x5161e2.stopPropagation();
        this._setAllRowsSelected(_0x19c2e1.checked);
      });
      _0x16c7e3.appendChild(_0x19c2e1);
      _0x3aa1a7.appendChild(_0x16c7e3);
    }
    _0x286d71.forEach(_0x4fe554 => {
      const _0x41ccc9 = document.createElement("th");
      _0x41ccc9.scope = "col";
      _0x41ccc9.dataset.storyboardColumnDensity = resolveStoryboardColumnDensity(_0x4fe554.key);
      _0x41ccc9.textContent = getStoryboardColumnLabel(_0x4fe554.key, _0x4fe554.label);
      _0x3aa1a7.appendChild(_0x41ccc9);
    });
    _0x168c1d.appendChild(_0x3aa1a7);
    const _0x16d74c = document.createElement("tbody");
    _0x37d743.forEach((_0x3c6bf3, _0x13d7e4) => {
      const _0x494da2 = document.createElement("tr");
      _0x494da2.dataset.storyboardRowIndex = String(_0x13d7e4);
      if (_0x4c9025) {
        const _0x50540a = document.createElement("td");
        _0x50540a.className = "storyboard-script-select-cell";
        const _0x4d7c81 = document.createElement("input");
        _0x4d7c81.type = "checkbox";
        _0x4d7c81.className = "storyboard-script-select-checkbox";
        _0x4d7c81.checked = _0x1da1e5.has(_0x13d7e4);
        _0x4d7c81.setAttribute("aria-label", storyboardScriptText("selectRowAria", {
          index: _0x13d7e4 + 1
        }));
        _0x4d7c81.addEventListener("pointerdown", _0x76e45f => {
          _0x76e45f.stopPropagation();
        });
        _0x4d7c81.addEventListener("click", _0x612e41 => {
          _0x612e41.stopPropagation();
          this._toggleRowSelection(_0x13d7e4, _0x4d7c81.checked);
        });
        _0x50540a.appendChild(_0x4d7c81);
        _0x494da2.appendChild(_0x50540a);
      }
      _0x286d71.forEach(_0x2903e8 => {
        const _0x588679 = document.createElement("td");
        _0x588679.className = "storyboard-script-editable";
        _0x588679.dataset.storyboardRowIndex = String(_0x13d7e4);
        _0x588679.dataset.storyboardEditKey = _0x2903e8.key;
        _0x588679.dataset.storyboardColumnDensity = resolveStoryboardColumnDensity(_0x2903e8.key);
        appendStoryboardCellDisplay(_0x588679, _0x2903e8.key, _0x3c6bf3[_0x2903e8.key], _0x1a05e1);
        _0x494da2.appendChild(_0x588679);
      });
      _0x16d74c.appendChild(_0x494da2);
    });
    _0x28e5d0.appendChild(_0x168c1d);
    _0x28e5d0.appendChild(_0x16d74c);
    _0x213b44.appendChild(_0x28e5d0);
    return _0x213b44;
  }
  _syncListSelectionState(_0x1034ee = this._getScriptState()) {
    const _0x3cfbde = _0x1034ee.selectionMode === true;
    const _0x4c479a = _0x3cfbde ? getSelectedRowIndexes(_0x1034ee) : [];
    const _0x8c56f5 = new Set(_0x4c479a);
    const _0x455f2a = this._bodyEl?.querySelector?.(".storyboard-script-table");
    if (!(_0x455f2a instanceof HTMLElement)) {
      return;
    }
    _0x455f2a.classList.toggle("is-selection-mode", _0x3cfbde);
    const _0x2a63eb = _0x3cfbde && Array.isArray(_0x1034ee.rows) && _0x1034ee.rows.length > 0 && _0x4c479a.length === _0x1034ee.rows.length;
    const _0x1ff625 = _0x455f2a.querySelector(".storyboard-script-select-all");
    if (_0x1ff625 instanceof HTMLInputElement) {
      _0x1ff625.checked = _0x2a63eb;
      _0x1ff625.indeterminate = _0x3cfbde && _0x4c479a.length > 0 && !_0x2a63eb;
    }
    _0x455f2a.querySelectorAll("tbody tr").forEach((_0x1c9b0f, _0x2b247c) => {
      if (!(_0x1c9b0f instanceof HTMLElement)) {
        return;
      }
      const _0x2144a4 = Number(_0x1c9b0f.dataset.storyboardRowIndex || _0x2b247c);
      const _0x1f4014 = _0x8c56f5.has(_0x2144a4);
      const _0x673aaa = _0x1c9b0f.querySelector(".storyboard-script-select-checkbox");
      if (_0x673aaa instanceof HTMLInputElement) {
        _0x673aaa.checked = _0x1f4014;
      }
    });
  }
  _createCardView(_0x1dd815, _0x424e20 = CARD_FIELDS, _0x56bb46 = new Map()) {
    const _0x29834b = document.createElement("div");
    _0x29834b.className = "storyboard-script-card-grid custom-scrollbar";
    _0x1dd815.forEach((_0x11a781, _0x8f949c) => {
      const _0x1ade57 = document.createElement("article");
      _0x1ade57.className = "storyboard-script-card";
      const _0x4d9e7e = document.createElement("div");
      _0x4d9e7e.className = "storyboard-script-card-head";
      const _0x31e8bd = document.createElement("span");
      _0x31e8bd.className = "storyboard-script-shot storyboard-script-editable";
      _0x31e8bd.dataset.storyboardRowIndex = String(_0x8f949c);
      _0x31e8bd.dataset.storyboardEditKey = "镜号";
      _0x31e8bd.textContent = formatCellValue(_0x11a781.镜号) || storyboardScriptText("shotFallback", {
        index: _0x8f949c + 1
      });
      _0x4d9e7e.appendChild(_0x31e8bd);
      const _0x5b5a4f = formatCellValue(_0x11a781.时长);
      if (_0x5b5a4f) {
        const _0x27c94c = document.createElement("span");
        _0x27c94c.className = "storyboard-script-duration storyboard-script-editable";
        _0x27c94c.dataset.storyboardRowIndex = String(_0x8f949c);
        _0x27c94c.dataset.storyboardEditKey = "时长";
        _0x27c94c.textContent = _0x5b5a4f;
        _0x4d9e7e.appendChild(_0x27c94c);
      }
      _0x1ade57.appendChild(_0x4d9e7e);
      _0x424e20.forEach(_0x30a4e3 => {
        const _0x26cb71 = formatCellValue(_0x11a781[_0x30a4e3]);
        if (!_0x26cb71) {
          return;
        }
        const _0x1215ab = document.createElement("div");
        _0x1215ab.className = "storyboard-script-card-field";
        const _0x494227 = document.createElement("span");
        _0x494227.className = "storyboard-script-card-label";
        _0x494227.textContent = getStoryboardColumnLabel(_0x30a4e3, _0x30a4e3);
        const _0xb5eb4 = document.createElement("span");
        _0xb5eb4.className = "storyboard-script-card-value storyboard-script-editable";
        _0xb5eb4.dataset.storyboardRowIndex = String(_0x8f949c);
        _0xb5eb4.dataset.storyboardEditKey = _0x30a4e3;
        appendStoryboardCellDisplay(_0xb5eb4, _0x30a4e3, _0x26cb71, _0x56bb46);
        _0x1215ab.appendChild(_0x494227);
        _0x1215ab.appendChild(_0xb5eb4);
        _0x1ade57.appendChild(_0x1215ab);
      });
      _0x29834b.appendChild(_0x1ade57);
    });
    return _0x29834b;
  }
  update(_0x471275) {
    this._data = _0x471275 || {};
    if (this.promptEl && document.activeElement !== this.promptEl && _0x471275?.prompt !== undefined) {
      const _0x33e0d3 = sanitizePromptHtml(_0x471275.prompt || "");
      if (this.promptEl?.innerHTML !== _0x33e0d3) {
        this.promptEl.innerHTML = _0x33e0d3;
        _rehydratePromptPills(this);
      }
    }
    this._syncPromptBoxSizeFromData?.(_0x471275);
    this._renderRefBar();
    this._render();
  }
  unmount() {
    this._closeFullscreenScript();
    this._finishCellEdit({
      commit: true
    });
    this._flushPromptHtmlCommit?.();
    this._unbindRefThumbHoverPreview?.();
    this._unbindRefThumbHoverPreview = null;
    this._unbindOutsideSelectionCancel();
    this._unbindStoryboardImageModelTrigger();
    this._removeStoryboardImageModelMenu();
    this._storyboardImageSchemaCleanup?.();
    this._storyboardImageSchemaCleanup = null;
    this._sharedPanelCleanup?.();
  }
}