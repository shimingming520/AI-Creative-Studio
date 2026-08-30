import a1074_0x3a456e from "../core/stores/appStore.js";
import { getInputLimitReason, getTargetInputPolicy, isInputKindAllowed, resolveEffectiveInputKind } from "./modelInputPolicy.js";
import { sanitizePromptHtml } from "../utils/dom.js";
import { getAssetMentionCandidates } from "./assetMentionRegistry.js";
import { createReferenceFallbackThumbElement } from "./referenceThumbnailFallback.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { hasPromptPresetTemplateContent, resolvePromptPresetTemplate } from "./promptPresetTemplate.js";
import { normalizeProviderId, resolveModelExecution } from "../manifests/index.js";
import { t } from "../i18n/index.js";
import { deferPromptTriggerUntilCompositionEnd, shouldSkipPromptTriggerForBulkInput } from "./promptTriggerComposition.js";
import { insertVirtualizedPromptTextAtSelection, removeVirtualPromptPasteEndMarker, rememberVirtualizedPromptCommit, serializeVirtualizedPromptHtml } from "./promptPasteVirtualization.js";
import { PROMPT_ASSET_INPUT_REFS_FIELD, getAssetInputRefsFromNodeData, getAssetInputRefsFromPrompt, getAssetInputRefsFromPromptAndNode, getAssetInputRefsFromPromptHtml, getAssetMentionRefFromPillNode, getPromptAssetInputRefRecords as a1074_0x8bce2a, getPromptAssetInputRefsFromNode, normalizePromptAssetInputRefRecord as a1074_0x2a18dd, normalizePromptMentionType as a1074_0x44399a } from "./promptAssetInputRefs.js";
export { PROMPT_ASSET_INPUT_REFS_FIELD, getAssetInputRefsFromNodeData, getAssetInputRefsFromPrompt, getAssetInputRefsFromPromptAndNode, getAssetInputRefsFromPromptHtml, getAssetMentionRefFromPillNode, getPromptAssetInputRefsFromNode } from "./promptAssetInputRefs.js";
function nodePromptSharedText(_0x572451, _0x5edd40 = {}) {
  return t("nodePromptShared." + _0x572451, _0x5edd40);
}
const AT_TYPE_MAP = {
  text: "文本",
  image: "图片",
  video: "视频",
  audio: "音频"
};
const MENTION_TYPE_ORDER = ["text", "image", "video", "audio"];
const ASSET_TYPE_MENU_LABELS = {
  text: "text",
  image: "image",
  video: "video",
  audio: "audio"
};
const PROMPT_INPUT_REF_LABEL_ATTR = "data-ref-label";
const PROMPT_INPUT_REF_UNRESOLVED_ATTR = "data-ref-unresolved";
const PROMPT_HTML_COMMIT_DELAY_MS = 320;
const ADVANCED_VOICE_CLONE_WORKFLOW_KEY = "advanced_voice_clone";
const _pendingPromptHtmlCommitTargets = new Set();
function _normalizeQuery(_0x5b8c55) {
  return String(_0x5b8c55 || "").trim().replace(/^@+/, "");
}
function _stripMentionDisplayMarker(_0x1214fd) {
  return String(_0x1214fd || "").trim().replace(/^@+/, "").trim();
}
function _findLastMentionTriggerIndex(_0x424638, _0x315b99) {
  const _0x500331 = Number.isFinite(_0x315b99) ? _0x315b99 - 1 : undefined;
  return Math.max(String(_0x424638 || "").lastIndexOf("@", _0x500331), String(_0x424638 || "").lastIndexOf("＠", _0x500331));
}
function _formatMentionSubmitLabel(_0x1a10d1) {
  const _0x13917a = _stripMentionDisplayMarker(_0x1a10d1);
  if (_0x13917a) {
    return "@" + _0x13917a;
  } else {
    return "";
  }
}
function _getNodeMentionDisplayLabel(_0xad1685 = {}, _0x244138 = "") {
  const _0x487c87 = [_0xad1685?.name, _0xad1685?.title, _0xad1685?.label, _0xad1685?.displayName].map(_0x44e214 => _stripMentionDisplayMarker(_0x44e214)).find(Boolean);
  return _0x487c87 || _stripMentionDisplayMarker(_0x244138);
}
function _normalizePromptWhitespace(_0x429171) {
  return String(_0x429171 || "").replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, " ").trim();
}
export function normalizePromptEnterBehavior(_0x3124e5) {
  if (_0x3124e5 === "newline") {
    return "newline";
  } else {
    return "submit";
  }
}
function getPromptEnterBehaviorFromStore() {
  try {
    const _0x544b88 = a1074_0x3a456e.getStateRaw?.() || a1074_0x3a456e.getState?.() || {};
    return normalizePromptEnterBehavior(_0x544b88?.ui?.promptEnterBehavior);
  } catch {
    return "submit";
  }
}
export function shouldSubmitPromptByKeyboard(_0x29a5a8, _0x43dedb = {}) {
  if (!_0x29a5a8 || _0x29a5a8.key !== "Enter" || _0x29a5a8.isComposing === true) {
    return false;
  }
  const _0x1c6cfe = Object.prototype.hasOwnProperty.call(_0x43dedb, "behavior") ? _0x43dedb.behavior : getPromptEnterBehaviorFromStore();
  const _0x9b27a8 = normalizePromptEnterBehavior(_0x1c6cfe);
  if (_0x9b27a8 === "newline") {
    return _0x29a5a8.ctrlKey === true || _0x29a5a8.metaKey === true;
  }
  return _0x29a5a8.shiftKey !== true;
}
function _getAssetTypeMenuLabel(_0x41a7e1) {
  const _0x527b39 = ASSET_TYPE_MENU_LABELS[_0x41a7e1];
  if (_0x527b39) {
    return nodePromptSharedText("assetTypes." + _0x527b39);
  }
  return _0x41a7e1 || nodePromptSharedText("materialFallback");
}
function _escapeRegExp(_0x383ff0) {
  return String(_0x383ff0 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function resolveTextReferenceContent(_0x3be9f8) {
  const _0x2d00f = String(_0x3be9f8?.type || "").trim().toLowerCase();
  if (_0x2d00f === "source-text" || _0x2d00f === "text") {
    const _0x40b7c0 = typeof _0x3be9f8?.content === "string" ? _0x3be9f8.content : _0x3be9f8?.text || _0x3be9f8?.outputText || _0x3be9f8?.prompt || _0x3be9f8?.label || "";
    return String(_0x40b7c0).trim();
  }
  return String(_0x3be9f8?.outputText || _0x3be9f8?.text || _0x3be9f8?.content || _0x3be9f8?.prompt || _0x3be9f8?.label || "").trim();
}
function _getChildNodes(_0x54c5b8) {
  if (!_0x54c5b8?.childNodes) {
    return [];
  }
  return Array.from(_0x54c5b8.childNodes);
}
function _isRefPillNode(_0x1bf616) {
  if (!_0x1bf616) {
    return false;
  }
  if (typeof _0x1bf616.classList?.contains === "function") {
    return _0x1bf616.classList.contains("ref-pill");
  }
  return String(_0x1bf616.className || "").split(/\s+/).filter(Boolean).includes("ref-pill");
}
function _getDatasetValue(_0x2a994d, _0x1b890f, _0x548ecc = "") {
  const _0x32a927 = String(_0x2a994d?.dataset?.[_0x1b890f] || "").trim();
  if (_0x32a927) {
    return _0x32a927;
  }
  if (_0x548ecc && typeof _0x2a994d?.getAttribute === "function") {
    return String(_0x2a994d.getAttribute(_0x548ecc) || "").trim();
  }
  return "";
}
function _decodeHtmlAttrValue(_0x1e03ce) {
  return String(_0x1e03ce || "").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function _getHtmlAttrValue(_0x366bfc = "", _0x557a86 = "") {
  const _0x815012 = String(_0x557a86 || "").trim();
  if (!_0x815012) {
    return "";
  }
  const _0x5107fe = new RegExp(_escapeRegExp(_0x815012) + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i");
  const _0x118b3d = String(_0x366bfc || "").match(_0x5107fe);
  if (!_0x118b3d) {
    return "";
  }
  return _decodeHtmlAttrValue(_0x118b3d[1] ?? _0x118b3d[2] ?? _0x118b3d[3] ?? "").trim();
}
function _htmlClassAttrContains(_0x2576ea = "", _0x2e2f4e = "") {
  const _0x59d677 = _getHtmlAttrValue(_0x2576ea, "class");
  return _0x59d677.split(/\s+/).filter(Boolean).includes(_0x2e2f4e);
}
function _isAssetMentionPill(_0x4e7f87) {
  return _getDatasetValue(_0x4e7f87, "refOrigin", "data-ref-origin") === "asset";
}
function _isUnresolvedInputMentionPill(_0x32749f) {
  return !_isAssetMentionPill(_0x32749f) && _getDatasetValue(_0x32749f, "refUnresolved", PROMPT_INPUT_REF_UNRESOLVED_ATTR) === "true";
}
function _normalizeMentionLabelKey(_0x34cf15) {
  return _stripMentionDisplayMarker(_0x34cf15).replace(/[\s\u00A0]+/g, "");
}
function _inferMentionTypeFromLabel(_0x1dc9e7 = "") {
  const _0x3454ef = _normalizeMentionLabelKey(_0x1dc9e7);
  if (!_0x3454ef) {
    return "";
  }
  for (const _0xe66392 of MENTION_TYPE_ORDER) {
    const _0x4de01a = String(AT_TYPE_MAP[_0xe66392] || "").trim();
    if (_0x4de01a && _0x3454ef.startsWith(_0x4de01a)) {
      return _0xe66392;
    }
  }
  return "";
}
function _getPillMentionType(_0x1f945c) {
  return a1074_0x44399a(_getDatasetValue(_0x1f945c, "refType", "data-ref-type")) || _inferMentionTypeFromLabel(_getDatasetValue(_0x1f945c, "label", "data-label") || _0x1f945c?.textContent || "");
}
function _getPromptInputDisplayLabel(_0x196872) {
  return _stripMentionDisplayMarker(_getDatasetValue(_0x196872, "label", "data-label") || _0x196872?.textContent || "");
}
function _getPromptInputRefLabel(_0x599ddf, _0x3d9541 = "") {
  return _stripMentionDisplayMarker(_getDatasetValue(_0x599ddf, "refLabel", PROMPT_INPUT_REF_LABEL_ATTR) || _0x3d9541);
}
export function getPromptInputSubmitLabelFromPillNode(_0x365cfb, _0x5b795b = "") {
  if (_isAssetMentionPill(_0x365cfb)) {
    return String(_getDatasetValue(_0x365cfb, "label", "data-label") || _0x365cfb?.textContent || _0x5b795b || "").trim();
  }
  return _formatMentionSubmitLabel(_getPromptInputRefLabel(_0x365cfb, _0x5b795b) || _getPromptInputDisplayLabel(_0x365cfb) || _0x5b795b);
}
function _setInputMentionPillUnresolved(_0x2d0e13, {
  label = "",
  type = ""
} = {}) {
  if (!_isRefPillNode(_0x2d0e13) || _isAssetMentionPill(_0x2d0e13)) {
    return false;
  }
  const _0x5e1cec = _stripMentionDisplayMarker(label || _0x2d0e13?.dataset?.label || _0x2d0e13?.textContent || "");
  const _0x428afb = _getPromptInputRefLabel(_0x2d0e13, _0x5e1cec);
  const _0x2bdb13 = a1074_0x44399a(type) || _getPillMentionType(_0x2d0e13);
  _0x2d0e13.dataset.label = _0x5e1cec;
  _0x2d0e13.dataset.refOrigin = "node";
  _0x2d0e13.dataset.refUnresolved = "true";
  if (_0x428afb) {
    _0x2d0e13.dataset.refLabel = _0x428afb;
  }
  if (_0x2bdb13) {
    _0x2d0e13.dataset.refType = _0x2bdb13;
  }
  delete _0x2d0e13.dataset.nodeId;
  _0x2d0e13.removeAttribute?.("data-node-id");
  _0x2d0e13.classList?.add?.("ref-pill--unresolved");
  _0x2d0e13.title = "Input reference is not bound in this node.";
  _renderMentionPillContent(_0x2d0e13, _0x5e1cec, _getMentionVisual(null, null, _0x2d0e13));
  return true;
}
function _clearInputMentionPillUnresolved(_0x3ed616) {
  if (!_isRefPillNode(_0x3ed616)) {
    return false;
  }
  delete _0x3ed616.dataset.refUnresolved;
  _0x3ed616.removeAttribute?.(PROMPT_INPUT_REF_UNRESOLVED_ATTR);
  _0x3ed616.classList?.remove?.("ref-pill--unresolved");
  if (_0x3ed616.title === "Input reference is not bound in this node.") {
    _0x3ed616.removeAttribute?.("title");
    if ("title" in _0x3ed616) {
      _0x3ed616.title = "";
    }
  }
  return true;
}
function _getTargetNodeData(_0x54a49b = null) {
  const _0x312629 = String(_0x54a49b?.nodeId || "").trim();
  const _0x1e00df = _0x312629 ? a1074_0x3a456e.getState?.()?.nodes?.[_0x312629] : null;
  return _0x1e00df || _0x54a49b?._data || {};
}
function _isAdvancedVoiceCloneTarget(_0xb0e10 = {}) {
  if (String(_0xb0e10?.type || "").trim() !== "ai-audio") {
    return false;
  }
  return [_0xb0e10.audioWorkflowKey, _0xb0e10.model, _0xb0e10.audioWorkflowLabel].some(_0x5ba31f => String(_0x5ba31f || "").trim() === ADVANCED_VOICE_CLONE_WORKFLOW_KEY);
}
function _getMentionAudioInputKey(_0x3a4c79 = {}) {
  if (a1074_0x44399a(_0x3a4c79?.type) !== "audio") {
    return "";
  }
  if (_0x3a4c79?.origin === "asset") {
    const _0x53c7e7 = _getPromptAssetInputRefRecordForMention(_0x3a4c79);
    if (_0x53c7e7) {
      return "asset:" + _0x53c7e7.assetId + ":" + _0x53c7e7.itemIndex;
    } else {
      return "";
    }
  }
  const _0x8e472d = String(_0x3a4c79?.nodeId || _0x3a4c79?.sourceId || "").trim();
  if (_0x8e472d) {
    return "node:" + _0x8e472d;
  } else {
    return "";
  }
}
function _getActualAudioInputKeysForTarget(_0x1fae90 = "", _0x4fad48 = {}, _0x3afdf9 = null) {
  const _0x9e9d29 = new Set();
  const _0x1f4315 = _0x3afdf9 || a1074_0x3a456e.getState();
  const _0xbd7061 = _0x1f4315.nodes || {};
  a1074_0x3a456e.getIncomingEdges(_0x1fae90).forEach(_0xe55490 => {
    const _0xb0ab5f = _0xbd7061?.[_0xe55490?.sourceId];
    if (resolveEffectiveInputKind(_0xb0ab5f, _0xe55490) === "audio" && _0xe55490?.sourceId) {
      _0x9e9d29.add("node:" + _0xe55490.sourceId);
    }
  });
  a1074_0x8bce2a(_0x4fad48 || {}).forEach(_0x7f3a89 => {
    if (_0x7f3a89.type === "audio") {
      _0x9e9d29.add("asset:" + _0x7f3a89.assetId + ":" + _0x7f3a89.itemIndex);
    }
  });
  return _0x9e9d29;
}
function _getAdvancedVoiceCloneAudioLimitReason(_0x575595, _0x5d75c4 = {}, _0x4a2e78 = {}, _0x7698db = null) {
  if (!_isAdvancedVoiceCloneTarget(_0x4a2e78)) {
    return null;
  }
  if (a1074_0x44399a(_0x5d75c4?.type) !== "audio") {
    return null;
  }
  const _0x44166e = getTargetInputPolicy(_0x4a2e78);
  const _0x4083fa = Number(_0x44166e?.maxByKind?.audio);
  if (!Number.isFinite(_0x4083fa) || _0x4083fa <= 0) {
    return null;
  }
  const _0x1a7763 = _getActualAudioInputKeysForTarget(_0x575595?.nodeId, _0x4a2e78, _0x7698db);
  const _0x353cad = _getMentionAudioInputKey(_0x5d75c4);
  if (_0x353cad && _0x1a7763.has(_0x353cad)) {
    return "";
  }
  if (_0x1a7763.size >= _0x4083fa) {
    return getInputLimitReason(_0x44166e, "audio", {
      audio: _0x1a7763.size
    });
  } else {
    return "";
  }
}
export function isRunningHubWorkflowNode(_0x4e2218 = {}) {
  const _0x2c2103 = normalizeProviderId(_0x4e2218?.provider);
  if (_0x2c2103 === "runninghubwf") {
    return true;
  }
  const _0x275abd = String(_0x4e2218?.model || "").trim();
  if (!_0x275abd) {
    return false;
  }
  const _0x1589d7 = resolveModelExecution(_0x275abd, {
    providerHint: _0x2c2103
  }) || resolveModelExecution(_0x275abd);
  const _0xd33179 = normalizeProviderId(_0x1589d7?.modelManifest?.provider);
  const _0x24c6fe = normalizeProviderId(_0x1589d7?.executionManifest?.provider);
  return _0x1589d7?.executionManifest?.adapterType === "workflow" && (_0xd33179 === "runninghubwf" || _0x24c6fe === "runninghubwf");
}
function _toLocalPathUrl(_0x58ece2) {
  return localPathToUrl(_0x58ece2);
}
function _isLikelyImageUrl(_0x127f40) {
  const _0x56fbe1 = String(_0x127f40 || "").trim().toLowerCase();
  if (!_0x56fbe1) {
    return false;
  }
  if (_0x56fbe1.startsWith("data:image/") || _0x56fbe1.startsWith("blob:")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(_0x56fbe1);
}
function _firstNonEmpty(_0x39ba19 = []) {
  return _0x39ba19.map(_0x6e51e4 => String(_0x6e51e4 || "").trim()).find(Boolean) || "";
}
function _pickIndexedItem(_0xbd5af9, _0x2e5b5a) {
  if (!Array.isArray(_0xbd5af9) || _0xbd5af9.length === 0) {
    return null;
  }
  const _0x4d4226 = Number.isFinite(Number(_0x2e5b5a)) ? Math.max(0, Math.trunc(Number(_0x2e5b5a))) : 0;
  return _0xbd5af9[_0x4d4226] || _0xbd5af9[0] || null;
}
function _resolveNodeThumbUrl(_0x252e8f = {}, _0x237727 = "") {
  const _0x1a5aaa = a1074_0x44399a(_0x237727 || _0x252e8f?.type);
  if (_0x1a5aaa === "text" || _0x1a5aaa === "audio") {
    return "";
  }
  if (_0x1a5aaa === "image") {
    const _0x3fb5fe = _pickIndexedItem(_0x252e8f.images || _0x252e8f.outputImages, _0x252e8f.mainImageIndex);
    return _firstNonEmpty([_0x3fb5fe?.thumbUrl, _0x3fb5fe?.src, _0x3fb5fe?.imageUrl, _0x3fb5fe?.sourceUrl, _0x3fb5fe?.url, _toLocalPathUrl(_0x3fb5fe?.localPath), _0x252e8f.thumbUrl, _0x252e8f.src, _0x252e8f.imageUrl, _0x252e8f.sourceUrl, _0x252e8f.url, _toLocalPathUrl(_0x252e8f.localPath)]);
  }
  if (_0x1a5aaa === "video") {
    const _0x448cf6 = _pickIndexedItem(_0x252e8f.videos, _0x252e8f.mainVideoIndex);
    const _0x1082e = [_0x448cf6?.thumbUrl, _0x448cf6?.posterUrl, _toLocalPathUrl(_0x448cf6?.posterLocalPath), _0x252e8f.thumbUrl, _0x252e8f.videoThumbSrc, _0x252e8f.firstFrameThumbUrl, _0x252e8f.firstFrameUrl, _0x252e8f.posterUrl, _toLocalPathUrl(_0x252e8f.posterLocalPath), _0x252e8f.imageUrl, _0x252e8f.src];
    return _0x1082e.map(_0x2c6d80 => String(_0x2c6d80 || "").trim()).find(_0x37b04b => _0x37b04b && _isLikelyImageUrl(_0x37b04b)) || "";
  }
  return "";
}
function _resolveRefBarThumbNode(_0x3d46db, _0x2295ab) {
  const _0x109a2c = String(_0x2295ab || "").trim();
  if (!_0x109a2c || !_0x3d46db?.refBarEl || typeof _0x3d46db.refBarEl.querySelector !== "function") {
    return null;
  }
  const _0xece8ac = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(_0x109a2c) : _0x109a2c.replace(/["\\]/g, "\\$&");
  const _0x326497 = _0x3d46db.refBarEl.querySelector(".ref-thumb-wrap[data-source-id=\"" + _0xece8ac + "\"]");
  return _0x326497?.querySelector?.(".ref-thumb-media") || null;
}
function _getThumbNodeUrl(_0x340e48) {
  const _0x30025b = _0x340e48?.tagName && String(_0x340e48.tagName).toLowerCase() === "img" ? _0x340e48 : null;
  return String(_0x30025b?.currentSrc || _0x30025b?.src || "").trim();
}
function _getRenderableMentionThumbUrl(_0x59d3d6, _0x9bca15 = "") {
  const _0x162f6 = String(_0x59d3d6 || "").trim();
  if (!_0x162f6) {
    return "";
  }
  const _0x2bb4e0 = a1074_0x44399a(_0x9bca15);
  if (_0x2bb4e0 === "text" || _0x2bb4e0 === "audio") {
    if (_isLikelyImageUrl(_0x162f6)) {
      return _0x162f6;
    } else {
      return "";
    }
  }
  return _0x162f6;
}
function _getMentionVisual(_0x38bbb6, _0x23b887 = null, _0x5d5ce5 = null) {
  const _0x8fb9cd = _0x38bbb6?.getMentionVisual?.({
    mention: _0x23b887,
    pill: _0x5d5ce5
  });
  if (_0x8fb9cd && typeof _0x8fb9cd === "object") {
    return _0x8fb9cd;
  }
  const _0x37aa8d = a1074_0x44399a(_0x23b887?.type || _getDatasetValue(_0x5d5ce5, "refType", "data-ref-type"));
  const _0x3f7658 = _0x37aa8d || "text";
  if (_0x23b887?.origin === "asset" || _isAssetMentionPill(_0x5d5ce5)) {
    const _0x21ab35 = _0x23b887?.origin === "asset" ? null : getAssetMentionRefFromPillNode(_0x5d5ce5);
    const _0x28a33d = _getRenderableMentionThumbUrl(_0x23b887?.thumbUrl || _0x21ab35?.thumbUrl || "", _0x37aa8d);
    return {
      thumbUrl: _0x28a33d,
      iconType: _0x3f7658
    };
  }
  const _0x5a1621 = String(_0x23b887?.nodeId || _0x23b887?.sourceId || _getDatasetValue(_0x5d5ce5, "nodeId", "data-node-id")).trim();
  const _0x32ca61 = a1074_0x3a456e.getState?.()?.nodes?.[_0x5a1621] || {};
  const _0x2d0df0 = _0x37aa8d || a1074_0x44399a(_0x32ca61.type);
  const _0xd71186 = _resolveRefBarThumbNode(_0x38bbb6, _0x5a1621);
  const _0x312666 = _getThumbNodeUrl(_0xd71186);
  const _0x329276 = _0x312666 || _getRenderableMentionThumbUrl(_0x23b887?.thumbUrl || "", _0x2d0df0) || _resolveNodeThumbUrl(_0x32ca61, _0x2d0df0);
  return {
    thumbUrl: _0x329276,
    thumbNode: _0x329276 ? null : _0xd71186,
    iconType: _0x2d0df0 || _0x3f7658
  };
}
function _createTextAudioMentionThumb(_0x53fa5a, _0x5da86a) {
  return createReferenceFallbackThumbElement(a1074_0x44399a(_0x53fa5a), _0x5da86a);
}
function _cloneMentionThumbNode(_0x3ba52b, _0x36eb67, _0x1d9db8 = "") {
  const _0xf35bd1 = _createTextAudioMentionThumb(_0x1d9db8, _0x36eb67);
  if (_0xf35bd1) {
    return _0xf35bd1;
  }
  if (!_0x3ba52b) {
    return null;
  }
  if (typeof _0x3ba52b.cloneNode !== "function") {
    return null;
  }
  const _0x5c1efb = _0x3ba52b.cloneNode(true);
  _0x5c1efb.className = _0x36eb67;
  _0x5c1efb.draggable = false;
  _0x5c1efb.contentEditable = "false";
  return _0x5c1efb;
}
function _appendMentionVisualNode(_0x5db3ca, {
  thumbUrl = "",
  thumbNode = null,
  iconType = ""
} = {}) {
  if (thumbUrl) {
    const _0x22a099 = document.createElement("img");
    _0x22a099.className = "ref-pill-thumb";
    _0x22a099.src = thumbUrl;
    _0x22a099.alt = "";
    _0x22a099.draggable = false;
    _0x22a099.contentEditable = "false";
    _0x5db3ca.appendChild(_0x22a099);
    return true;
  }
  const _0x78ae27 = _cloneMentionThumbNode(thumbNode, "ref-pill-thumb", iconType);
  if (!_0x78ae27) {
    return false;
  }
  _0x5db3ca.appendChild(_0x78ae27);
  return true;
}
function _renderMentionPillContent(_0x5d2bc3, _0x465b12, _0x3b411e = {}) {
  const _0x3af7a0 = _stripMentionDisplayMarker(_0x465b12);
  if (typeof document === "undefined" || typeof document.createElement !== "function" || typeof _0x5d2bc3?.replaceChildren !== "function") {
    _0x5d2bc3.textContent = _0x3af7a0;
    return;
  }
  const _0x73d7fd = document.createElement("span");
  _0x73d7fd.className = "ref-pill-label";
  _0x73d7fd.textContent = _0x3af7a0;
  _0x5d2bc3.replaceChildren();
  _appendMentionVisualNode(_0x5d2bc3, _0x3b411e);
  _0x5d2bc3.appendChild(_0x73d7fd);
}
function _decorateMentionPill(_0xceab5e, _0x5336ec, _0x4caf38 = null) {
  if (typeof _0xceab5e?.decorateMentionPill !== "function") {
    return;
  }
  _0xceab5e.decorateMentionPill({
    pill: _0x5336ec,
    mention: _0x4caf38
  });
}
function _isPillVisualCurrent(_0x4e1994, _0x23208c = {}) {
  if (!_0x4e1994 || typeof _0x4e1994.querySelector !== "function") {
    return true;
  }
  const _0x4c382c = a1074_0x44399a(_0x23208c.iconType);
  if (_0x23208c.thumbUrl) {
    const _0x5212a1 = _0x4e1994.querySelector("img.ref-pill-thumb");
    return String(_0x5212a1?.currentSrc || _0x5212a1?.src || "").trim() === _0x23208c.thumbUrl;
  }
  if (_0x4c382c === "text" || _0x4c382c === "audio") {
    const _0x4ef165 = _0x4e1994.querySelector(".ref-pill-thumb");
    const _0x4b290d = typeof _0x4ef165?.className === "string" ? _0x4ef165.className : String(_0x4ef165?.getAttribute?.("class") || "");
    return !!_0x4ef165 && (_0x4ef165.classList?.contains?.("ref-thumb-fallback") || _0x4b290d.includes("ref-thumb-fallback"));
  }
  if (_0x23208c.thumbNode) {
    return !!_0x4e1994.querySelector(".ref-pill-thumb");
  }
  return !_0x4e1994.querySelector(".ref-pill-thumb") && !_0x4e1994.querySelector(".ref-pill-icon");
}
export function getMentionPlaceholderLabel(_0x400640, _0x21427c, _0x4cdbf5 = "") {
  const _0x1b4069 = a1074_0x44399a(_0x400640);
  const _0x59f468 = _stripMentionDisplayMarker(_0x4cdbf5) || AT_TYPE_MAP[_0x1b4069] || _0x1b4069 || "素材";
  const _0x498828 = Math.max(1, Math.trunc(Number(_0x21427c) || 1));
  return "@" + _0x59f468 + _0x498828;
}
export function appendAssetMentionToPrompt({
  domNode = null,
  rawLabel = "",
  promptParts = null,
  inputRefs = null,
  mediaCounts = null,
  allowedTypes = null,
  resolveAssetMentionRef = null,
  dedupeState = null
} = {}) {
  const _0x508827 = typeof resolveAssetMentionRef === "function" ? resolveAssetMentionRef(domNode) : null;
  const _0x1ca9be = _0x508827 || getAssetMentionRefFromPillNode(domNode);
  const _0x2065f6 = (Array.isArray(_0x1ca9be) ? _0x1ca9be : [_0x1ca9be]).filter(Boolean);
  if (!_0x2065f6.length) {
    return false;
  }
  const _0x5de0cc = mediaCounts || {};
  _0x2065f6.forEach(_0x558d5c => {
    const _0x4fc5a5 = resolveEffectiveInputKind(_0x558d5c) || a1074_0x44399a(_0x558d5c.type);
    if (Array.isArray(allowedTypes) && !allowedTypes.includes(_0x4fc5a5)) {
      if (_0x2065f6.length === 1 && Array.isArray(promptParts)) {
        promptParts.push(" " + (rawLabel || _0x558d5c.label) + " ");
      }
      return;
    }
    if (_0x4fc5a5 === "text") {
      if (Array.isArray(promptParts)) {
        promptParts.push(" " + (_0x558d5c.content || "") + " ");
      }
      return;
    }
    if (!_0x558d5c.url) {
      if (_0x2065f6.length === 1 && Array.isArray(promptParts)) {
        promptParts.push(" " + (rawLabel || _0x558d5c.label) + " ");
      }
      return;
    }
    const _0x22a049 = _0x4fc5a5 + ":" + String(_0x558d5c.url || "").trim();
    const _0x491653 = dedupeState instanceof Map ? dedupeState.get(_0x22a049) : "";
    if (_0x491653) {
      if (Array.isArray(promptParts)) {
        promptParts.push(" " + _0x491653 + " ");
      }
      return;
    }
    _0x5de0cc[_0x4fc5a5] = Number(_0x5de0cc[_0x4fc5a5] || 0) + 1;
    const _0xaa1b1e = getMentionPlaceholderLabel(_0x4fc5a5, _0x5de0cc[_0x4fc5a5], _0x558d5c.placeholderTypeLabel);
    if (dedupeState instanceof Map) {
      dedupeState.set(_0x22a049, _0xaa1b1e);
    }
    if (Array.isArray(promptParts)) {
      promptParts.push(" " + _0xaa1b1e + " ");
    }
    if (Array.isArray(inputRefs)) {
      inputRefs.push({
        ..._0x558d5c,
        type: _0x4fc5a5,
        placeholder: _0xaa1b1e
      });
    }
  });
  return true;
}
export function removeAssetMentionPillFromPrompt(_0x3e23dd, {
  assetId = "",
  assetIndex = "",
  itemIndex = "",
  type = "",
  occurrence = null
} = {}) {
  const _0x33eff7 = _0x3e23dd?.promptEl;
  if (!_0x33eff7 || typeof _0x33eff7.querySelectorAll !== "function") {
    return false;
  }
  const _0x2260a3 = String(assetId || "").trim();
  const _0x1a5318 = assetIndex !== null && assetIndex !== undefined && String(assetIndex) !== "" ? assetIndex : itemIndex;
  const _0x4419c4 = String(_0x1a5318 ?? "").trim();
  const _0x543479 = a1074_0x44399a(type);
  const _0xb62ac9 = Number(occurrence);
  const _0x18f906 = Number.isFinite(_0xb62ac9) && _0xb62ac9 >= 0;
  if (!_0x2260a3 || !_0x4419c4) {
    return false;
  }
  const _0x284cd2 = Array.from(_0x33eff7.querySelectorAll(".ref-pill"));
  let _0x1468ad = 0;
  const _0x11b4be = _0x284cd2.find(_0x3d83d5 => {
    if (!_isAssetMentionPill(_0x3d83d5)) {
      return false;
    }
    const _0x3ac983 = _getDatasetValue(_0x3d83d5, "assetId", "data-asset-id");
    const _0x4a054d = _getDatasetValue(_0x3d83d5, "assetIndex", "data-asset-index");
    const _0x29e033 = a1074_0x44399a(_getDatasetValue(_0x3d83d5, "refType", "data-ref-type"));
    const _0x321034 = _0x3ac983 === _0x2260a3 && _0x4a054d === _0x4419c4 && (!_0x543479 || _0x29e033 === _0x543479);
    if (!_0x321034) {
      return false;
    }
    if (!_0x18f906) {
      return true;
    }
    const _0x166044 = _0x1468ad === _0xb62ac9;
    _0x1468ad += 1;
    return _0x166044;
  });
  if (!_0x11b4be) {
    return false;
  }
  _0x11b4be.remove?.();
  _updatePromptHtml(_0x3e23dd);
  return true;
}
export function removePromptAssetInputRefFromNode(_0x42b77b, {
  assetId = "",
  assetIndex = "",
  itemIndex = "",
  type = "",
  occurrence = null
} = {}) {
  const _0xa9d2a2 = String(_0x42b77b?.nodeId || "").trim();
  if (!_0xa9d2a2) {
    return false;
  }
  const _0x75b4a3 = String(assetId || "").trim();
  const _0x515146 = assetIndex !== null && assetIndex !== undefined && String(assetIndex) !== "" ? assetIndex : itemIndex;
  const _0x12bdbc = Number(_0x515146);
  const _0x525c0f = a1074_0x44399a(type);
  const _0x10020c = Number(occurrence);
  const _0x446de2 = Number.isFinite(_0x10020c) && _0x10020c >= 0;
  if (!_0x75b4a3 || !Number.isFinite(_0x12bdbc)) {
    return false;
  }
  const _0x175479 = a1074_0x8bce2a(_getTargetNodeData(_0x42b77b));
  let _0x3ff02e = 0;
  let _0x10fce5 = false;
  const _0x1a1916 = _0x175479.filter(_0x2f8480 => {
    if (_0x10fce5) {
      return true;
    }
    const _0x9597ef = _0x2f8480.assetId === _0x75b4a3 && _0x2f8480.itemIndex === Math.max(0, Math.trunc(_0x12bdbc)) && (!_0x525c0f || _0x2f8480.type === _0x525c0f);
    if (!_0x9597ef) {
      return true;
    }
    if (_0x446de2 && _0x3ff02e !== _0x10020c) {
      _0x3ff02e += 1;
      return true;
    }
    _0x10fce5 = true;
    return false;
  });
  if (!_0x10fce5) {
    return false;
  }
  a1074_0x3a456e.updateNodeData(_0xa9d2a2, {
    [PROMPT_ASSET_INPUT_REFS_FIELD]: _0x1a1916
  });
  _notifyPromptHtmlUpdated(_0x42b77b);
  return true;
}
function _assetInputRefTargetMatches(_0x322840 = {}, _0x18aaea = {}) {
  const _0x46a0b9 = String(_0x18aaea?.assetId || "").trim();
  const _0x2dcc0f = _0x18aaea?.itemIndex !== undefined && _0x18aaea?.itemIndex !== null ? _0x18aaea.itemIndex : _0x18aaea?.assetIndex;
  const _0x13affd = Number(_0x2dcc0f);
  const _0x309762 = a1074_0x44399a(_0x18aaea?.type || _0x18aaea?.refType || "");
  if (!_0x46a0b9 || !Number.isFinite(_0x13affd)) {
    return false;
  }
  return String(_0x322840?.assetId || "").trim() === _0x46a0b9 && Number(_0x322840?.itemIndex) === Math.max(0, Math.trunc(_0x13affd)) && (!_0x309762 || a1074_0x44399a(_0x322840?.type) === _0x309762);
}
function _removePromptAssetInputRecordFromNodeData(_0x16813f = {}, _0x4dc147 = {}) {
  const _0x247ac5 = a1074_0x8bce2a(_0x16813f);
  if (!_0x247ac5.length) {
    return {
      removed: false,
      records: _0x247ac5
    };
  }
  const _0x4365c1 = String(_0x4dc147?.assetRefSource || "").trim();
  if (_0x4365c1 && _0x4365c1 !== "hidden") {
    return {
      removed: false,
      records: _0x247ac5
    };
  }
  const _0x240d7f = Number(_0x4dc147?.promptAssetRefIndex);
  if (Number.isFinite(_0x240d7f) && _0x240d7f >= 0) {
    const _0x38b4af = Math.max(0, Math.trunc(_0x240d7f));
    if (_assetInputRefTargetMatches(_0x247ac5[_0x38b4af], _0x4dc147)) {
      const _0x56907c = _0x247ac5.slice();
      _0x56907c.splice(_0x38b4af, 1);
      return {
        removed: true,
        records: _0x56907c
      };
    }
  }
  const _0x4660f0 = Number(_0x4dc147?.assetMentionOccurrence ?? _0x4dc147?.occurrence);
  const _0x474304 = Number.isFinite(_0x4660f0) && _0x4660f0 >= 0;
  let _0x516a34 = 0;
  let _0x32a843 = false;
  const _0x340cce = _0x247ac5.filter(_0x5da5f6 => {
    if (_0x32a843 || !_assetInputRefTargetMatches(_0x5da5f6, _0x4dc147)) {
      return true;
    }
    if (_0x474304 && _0x516a34 !== Math.trunc(_0x4660f0)) {
      _0x516a34 += 1;
      return true;
    }
    _0x32a843 = true;
    return false;
  });
  return {
    removed: _0x32a843,
    records: _0x340cce
  };
}
function _removeAssetMentionPillFromPromptHtml(_0x3f888f = "", _0x3b3c0f = {}) {
  const _0x30aad2 = String(_0x3b3c0f?.assetRefSource || "").trim();
  if (_0x30aad2 && _0x30aad2 !== "prompt") {
    return {
      removed: false,
      prompt: _0x3f888f
    };
  }
  const _0x542aec = sanitizePromptHtml(_0x3f888f);
  if (!_0x542aec) {
    return {
      removed: false,
      prompt: _0x542aec
    };
  }
  const _0x1d4762 = Number(_0x3b3c0f?.assetMentionOccurrence ?? _0x3b3c0f?.occurrence);
  const _0x555257 = Number.isFinite(_0x1d4762) && _0x1d4762 >= 0;
  let _0x192ecc = 0;
  let _0x26ee89 = false;
  const _0x59fe14 = _0x542aec.replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (_0xb63f88, _0x23c75d) => {
    if (_0x26ee89) {
      return _0xb63f88;
    }
    if (!_htmlClassAttrContains(_0x23c75d, "ref-pill")) {
      return _0xb63f88;
    }
    if (_getHtmlAttrValue(_0x23c75d, "data-ref-origin") !== "asset") {
      return _0xb63f88;
    }
    const _0x32bbb7 = {
      assetId: _getHtmlAttrValue(_0x23c75d, "data-asset-id"),
      itemIndex: _getHtmlAttrValue(_0x23c75d, "data-asset-index"),
      type: _getHtmlAttrValue(_0x23c75d, "data-ref-type")
    };
    if (!_assetInputRefTargetMatches(_0x32bbb7, _0x3b3c0f)) {
      return _0xb63f88;
    }
    if (_0x555257 && _0x192ecc !== Math.trunc(_0x1d4762)) {
      _0x192ecc += 1;
      return _0xb63f88;
    }
    _0x26ee89 = true;
    return "";
  });
  return {
    removed: _0x26ee89,
    prompt: _0x26ee89 ? sanitizePromptHtml(_0x59fe14) : _0x542aec
  };
}
export function buildRemoveAssetInputRefPatchFromNodeData(_0x570d98 = {}, _0x263ec7 = {}) {
  const _0x1b7eb3 = {};
  const _0x5b25a5 = _removePromptAssetInputRecordFromNodeData(_0x570d98, _0x263ec7);
  if (_0x5b25a5.removed) {
    _0x1b7eb3[PROMPT_ASSET_INPUT_REFS_FIELD] = _0x5b25a5.records;
  }
  const _0x4aed0a = _removeAssetMentionPillFromPromptHtml(_0x570d98?.prompt || "", _0x263ec7);
  if (_0x4aed0a.removed) {
    _0x1b7eb3.prompt = _0x4aed0a.prompt;
  }
  if (Object.keys(_0x1b7eb3).length) {
    return _0x1b7eb3;
  } else {
    return null;
  }
}
export function removeAssetInputRefFromNodeData(_0x54b794 = "", _0x4477c4 = {}) {
  const _0x4b7ca0 = String(_0x54b794 || "").trim();
  if (!_0x4b7ca0) {
    return false;
  }
  const _0x267f02 = a1074_0x3a456e.getState?.()?.nodes?.[_0x4b7ca0] || {};
  const _0x427884 = buildRemoveAssetInputRefPatchFromNodeData(_0x267f02, _0x4477c4);
  if (!_0x427884) {
    return false;
  }
  a1074_0x3a456e.updateNodeData(_0x4b7ca0, _0x427884);
  return true;
}
export function handleRefThumbDeleteClick(_0x53852e, _0xcceec4) {
  const _0x3b925e = _0xcceec4?.target?.closest?.(".ref-thumb-delete");
  if (!_0x3b925e) {
    return false;
  }
  if (typeof _0xcceec4.stopImmediatePropagation === "function") {
    _0xcceec4.stopImmediatePropagation();
  } else {
    _0xcceec4.stopPropagation?.();
  }
  _0xcceec4.preventDefault?.();
  const _0x28f381 = _0x3b925e.closest?.(".ref-thumb-wrap");
  const _0x370311 = _0x28f381?.dataset?.edgeId || "";
  if (_0x370311) {
    a1074_0x3a456e.removeEdge(_0x370311);
    _0x53852e?._updateSubmitButtonState?.();
    return true;
  }
  if (_0x28f381?.dataset?.refOrigin === "asset") {
    const _0x5d252d = {
      assetId: _0x28f381.dataset.assetId,
      assetIndex: _0x28f381.dataset.assetIndex,
      type: _0x28f381.dataset.refType || _0x28f381.dataset.kind,
      occurrence: _0x28f381.dataset.assetOccurrence
    };
    const _0x19ee40 = String(_0x28f381.dataset.assetRefSource || "").trim();
    const _0x7b4742 = _0x19ee40 === "hidden" ? removePromptAssetInputRefFromNode(_0x53852e, _0x5d252d) : removeAssetMentionPillFromPrompt(_0x53852e, _0x5d252d) || removePromptAssetInputRefFromNode(_0x53852e, _0x5d252d);
    if (!_0x7b4742) {
      _0x53852e?._renderRefBar?.();
      _0x53852e?._updateSubmitButtonState?.();
    }
  }
  return true;
}
function _createInputCountState() {
  return {
    counts: {
      text: 0,
      image: 0,
      video: 0,
      audio: 0
    },
    keysByType: {
      text: new Set(),
      image: new Set(),
      video: new Set(),
      audio: new Set()
    }
  };
}
function _cloneInputCountState(_0x2ddf33 = null) {
  const _0x49b3f4 = _createInputCountState();
  MENTION_TYPE_ORDER.forEach(_0x1ef162 => {
    _0x49b3f4.counts[_0x1ef162] = Number(_0x2ddf33?.counts?.[_0x1ef162] || 0);
    _0x49b3f4.keysByType[_0x1ef162] = new Set(_0x2ddf33?.keysByType?.[_0x1ef162] || []);
  });
  return _0x49b3f4;
}
function _addInputCount(_0x286ff9, _0x5bc63c, _0x3b3f9a = "") {
  const _0xfac06a = a1074_0x44399a(_0x5bc63c);
  if (!_0x286ff9 || _0x286ff9.counts?.[_0xfac06a] == null) {
    return false;
  }
  const _0x48a1d2 = String(_0x3b3f9a || "").trim();
  const _0x1491ee = _0x286ff9.keysByType?.[_0xfac06a];
  if (_0x48a1d2 && _0x1491ee?.has(_0x48a1d2)) {
    return false;
  }
  if (_0x48a1d2 && _0x1491ee) {
    _0x1491ee.add(_0x48a1d2);
  }
  _0x286ff9.counts[_0xfac06a] += 1;
  return true;
}
function _getNodeInputCountKey(_0x45bb65 = "", _0x599a20 = "") {
  const _0x18a47a = String(_0x45bb65 || "").trim();
  const _0x7b80eb = a1074_0x44399a(_0x599a20);
  if (_0x18a47a && _0x7b80eb) {
    return "node:" + _0x18a47a + ":" + _0x7b80eb;
  } else {
    return "";
  }
}
function _getAssetInputCountKey({
  assetId = "",
  itemIndex = null,
  assetIndex = null,
  type = ""
} = {}) {
  const _0x1a4a44 = String(assetId || "").trim();
  const _0xa29d43 = itemIndex ?? assetIndex;
  const _0x324bec = Number(_0xa29d43);
  const _0x1be4ef = a1074_0x44399a(type);
  if (!_0x1a4a44 || !Number.isFinite(_0x324bec) || !_0x1be4ef) {
    return "";
  }
  return "asset:" + _0x1a4a44 + ":" + Math.max(0, Math.trunc(_0x324bec)) + ":" + _0x1be4ef;
}
function _getMentionInputCountKey(_0xaa9971 = {}, _0x1ec828 = "") {
  const _0x53241e = a1074_0x44399a(_0x1ec828 || _0xaa9971?.type);
  if (_0xaa9971?.origin === "asset") {
    return _getAssetInputCountKey({
      assetId: _0xaa9971.assetId,
      itemIndex: _0xaa9971.itemIndex,
      assetIndex: _0xaa9971.assetIndex,
      type: _0x53241e
    });
  }
  return _getNodeInputCountKey(_0xaa9971?.nodeId || _0xaa9971?.sourceId, _0x53241e);
}
function _isMentionAlreadyCounted(_0x447333, _0x15cd71 = {}, _0xadab34 = "") {
  const _0x4b6a94 = a1074_0x44399a(_0xadab34 || _0x15cd71?.type);
  const _0x5c2b40 = _getMentionInputCountKey(_0x15cd71, _0x4b6a94);
  return !!_0x4b6a94 && !!_0x5c2b40 && !!_0x447333?.keysByType?.[_0x4b6a94]?.has(_0x5c2b40);
}
function _canReuseAlreadyCountedInputForLimit(_0xcde381 = "") {
  return a1074_0x44399a(_0xcde381) !== "audio";
}
function _getPromptInputCountState(_0x40555c, _0x3f04e6 = null, {
  nodeData = null
} = {}) {
  const _0x2626fc = _createInputCountState();
  const _0x41d8ba = a1074_0x3a456e.getState();
  const _0x91654 = _0x41d8ba.nodes || {};
  if (_0x40555c && typeof _0x40555c.querySelectorAll === "function") {
    _0x40555c.querySelectorAll(".ref-pill").forEach(_0xc48dae => {
      if (_0xc48dae === _0x3f04e6) {
        return;
      }
      let _0x49456f = "";
      let _0x41e781 = "";
      if (_isAssetMentionPill(_0xc48dae)) {
        const _0x10bbc6 = getAssetMentionRefFromPillNode(_0xc48dae);
        _0x49456f = _0x10bbc6?.type || _getDatasetValue(_0xc48dae, "refType", "data-ref-type");
        _0x41e781 = _getAssetInputCountKey({
          assetId: _0x10bbc6?.assetId || _getDatasetValue(_0xc48dae, "assetId", "data-asset-id"),
          itemIndex: _0x10bbc6?.itemIndex,
          assetIndex: _getDatasetValue(_0xc48dae, "assetIndex", "data-asset-index"),
          type: _0x49456f
        });
      } else {
        const _0x331986 = _getDatasetValue(_0xc48dae, "nodeId", "data-node-id");
        if (_isUnresolvedInputMentionPill(_0xc48dae)) {
          return;
        }
        _0x49456f = _getPillMentionType(_0xc48dae) || a1074_0x44399a(_0x91654?.[_0x331986]?.type || "");
        _0x41e781 = _getNodeInputCountKey(_0x331986, _0x49456f);
      }
      _addInputCount(_0x2626fc, _0x49456f, _0x41e781);
    });
  }
  a1074_0x8bce2a(nodeData || {}).forEach(_0x1f01ae => {
    _addInputCount(_0x2626fc, _0x1f01ae.type, _getAssetInputCountKey(_0x1f01ae));
  });
  return _0x2626fc;
}
function _countPromptPillsByType(_0x4781e5, _0x2669cc = null, {
  nodeData = null
} = {}) {
  return _getPromptInputCountState(_0x4781e5, _0x2669cc, {
    nodeData: nodeData
  }).counts;
}
function _candidateMatchesQuery({
  label = "",
  type = "",
  assetName = ""
}, _0x56e409 = "") {
  const _0x235d91 = _normalizeQuery(_0x56e409).toLowerCase();
  if (!_0x235d91) {
    return true;
  }
  const _0x452160 = AT_TYPE_MAP[type] || type;
  const _0xb26bf2 = _getAssetTypeMenuLabel(type);
  return [label, _0x452160, _0xb26bf2, assetName].join(" ").toLowerCase().includes(_0x235d91);
}
export function _resolvePromptTextWithTextRefs({
  promptEl = null,
  inEdges = [],
  nodes = {},
  assetInputRefs = null,
  assetMediaCounts = null,
  allowedAssetTypes = null,
  prependUnusedTextRefs = true,
  resolveAssetMentionRef = null,
  dedupeAssetMentions = false
} = {}) {
  const _0x389937 = [];
  let _0x4adadb = 0;
  for (const _0x6d78e1 of inEdges) {
    const _0x59a24c = nodes?.[_0x6d78e1?.sourceId];
    if (!_0x59a24c) {
      continue;
    }
    if (a1074_0x44399a(_0x59a24c.type) !== "text") {
      continue;
    }
    const _0x3393f2 = resolveTextReferenceContent(_0x59a24c);
    if (!_0x3393f2) {
      continue;
    }
    _0x4adadb += 1;
    _0x389937.push({
      label: "@" + AT_TYPE_MAP.text + _0x4adadb,
      content: _0x3393f2,
      sourceId: String(_0x6d78e1?.sourceId || ""),
      used: false
    });
  }
  if (!promptEl && _0x389937.length === 0) {
    return "";
  }
  const _0x5160e4 = Object.create(null);
  const _0xb443d = Object.create(null);
  _0x389937.forEach(_0x117bc3 => {
    _0x5160e4[_normalizeMentionLabelKey(_0x117bc3.label)] = _0x117bc3;
    if (_0x117bc3.sourceId) {
      _0xb443d[_0x117bc3.sourceId] = _0x117bc3;
    }
  });
  const _0x183dd2 = globalThis.Node?.TEXT_NODE ?? 3;
  const _0x1f5edb = globalThis.Node?.ELEMENT_NODE ?? 1;
  const _0x28a59b = dedupeAssetMentions ? new Map() : null;
  let _0x3e2642 = "";
  const _0x48b869 = _0x32ac63 => {
    for (const _0x2d0a29 of _getChildNodes(_0x32ac63)) {
      const _0x25de32 = Number(_0x2d0a29?.nodeType);
      if (_0x25de32 === _0x183dd2) {
        _0x3e2642 += String(_0x2d0a29?.textContent || "");
        continue;
      }
      if (_0x25de32 !== _0x1f5edb) {
        continue;
      }
      if (_isRefPillNode(_0x2d0a29)) {
        const _0x4b3b6e = [];
        if (appendAssetMentionToPrompt({
          domNode: _0x2d0a29,
          rawLabel: String(_0x2d0a29?.dataset?.label || _0x2d0a29?.textContent || "").trim(),
          promptParts: _0x4b3b6e,
          inputRefs: assetInputRefs,
          mediaCounts: assetMediaCounts,
          allowedTypes: allowedAssetTypes,
          resolveAssetMentionRef: resolveAssetMentionRef,
          dedupeState: _0x28a59b
        })) {
          _0x3e2642 += _0x4b3b6e.join("");
          continue;
        }
        const _0x43d322 = String(_0x2d0a29?.dataset?.nodeId || "");
        const _0x352553 = _getPromptInputDisplayLabel(_0x2d0a29);
        const _0x45df3b = getPromptInputSubmitLabelFromPillNode(_0x2d0a29, _0x352553) || _0x352553;
        if (_isUnresolvedInputMentionPill(_0x2d0a29)) {
          _0x3e2642 += " " + _0x45df3b + " ";
          continue;
        }
        const _0x2af81b = _normalizeMentionLabelKey(_getPromptInputRefLabel(_0x2d0a29, _0x352553) || _0x352553);
        const _0x2e5ef5 = _0x43d322 && _0xb443d[_0x43d322] || _0x5160e4[_0x2af81b];
        if (_0x2e5ef5) {
          _0x2e5ef5.used = true;
          _0x3e2642 += " " + _0x2e5ef5.content + " ";
        } else {
          _0x3e2642 += " " + _0x45df3b + " ";
        }
        continue;
      }
      if (String(_0x2d0a29?.tagName || "").toUpperCase() === "BR") {
        _0x3e2642 += "\n";
        continue;
      }
      _0x48b869(_0x2d0a29);
    }
  };
  if (_getChildNodes(promptEl).length > 0) {
    _0x48b869(promptEl);
  } else {
    _0x3e2642 = String(promptEl?.textContent || "");
  }
  let _0x1392db = _normalizePromptWhitespace(_0x3e2642);
  _0x389937.forEach(_0x1737eb => {
    if (_0x1737eb.used) {
      return;
    }
    const _0x183e73 = new RegExp(_escapeRegExp(_0x1737eb.label).replace(/\s+/g, "[\\s\\u00A0]*"), "g");
    if (_0x183e73.test(_0x1392db)) {
      _0x1737eb.used = true;
      _0x1392db = _0x1392db.replace(_0x183e73, " " + _0x1737eb.content + " ");
    }
  });
  _0x1392db = _normalizePromptWhitespace(_0x1392db);
  let _0x5e993b = "";
  if (prependUnusedTextRefs) {
    _0x389937.forEach(_0x1d8683 => {
      if (!_0x1d8683.used && _0x1d8683.content) {
        _0x5e993b += _0x1d8683.content + "\n";
        _0x1d8683.used = true;
      }
    });
  }
  if (!_0x5e993b) {
    return _0x1392db;
  }
  if (!_0x1392db) {
    return _0x5e993b.replace(/\n+$/g, "");
  }
  return "" + _0x5e993b + _0x1392db;
}
export function resolvePromptTextWithTextRefs(_0x4b5fe4 = {}) {
  return _resolvePromptTextWithTextRefs(_0x4b5fe4);
}
export function resolvePresetPromptTextWithTextRefs({
  template = null,
  promptEl = null,
  inEdges = [],
  nodes = {},
  assetInputRefs = null,
  assetMediaCounts = null,
  allowedAssetTypes = null
} = {}) {
  const _0x31486f = _resolvePromptTextWithTextRefs({
    promptEl: promptEl,
    inEdges: inEdges,
    nodes: nodes,
    assetInputRefs: assetInputRefs,
    assetMediaCounts: assetMediaCounts,
    allowedAssetTypes: allowedAssetTypes
  });
  if (template == null) {
    return _0x31486f;
  }
  const _0x169ae7 = resolvePromptPresetTemplate(template, _0x31486f);
  return _resolvePromptTextWithTextRefs({
    promptEl: {
      innerText: _0x169ae7,
      textContent: _0x169ae7,
      childNodes: []
    },
    inEdges: inEdges,
    nodes: nodes,
    assetInputRefs: assetInputRefs,
    assetMediaCounts: assetMediaCounts,
    allowedAssetTypes: allowedAssetTypes,
    prependUnusedTextRefs: false
  });
}
function _templateConsumesPresetUserInput(_0x8745cd = null) {
  if (_0x8745cd == null) {
    return false;
  }
  const _0x188ca5 = "__PROMPT_PRESET_USER_INPUT_MARKER__";
  return resolvePromptPresetTemplate(_0x8745cd, _0x188ca5).includes(_0x188ca5);
}
function _resolveInsertedPresetPromptText({
  template = null,
  promptEl = null,
  inEdges = [],
  nodes = {},
  allowedAssetTypes = null
} = {}) {
  const _0x109732 = _resolvePromptTextWithTextRefs({
    promptEl: promptEl,
    inEdges: inEdges,
    nodes: nodes,
    assetInputRefs: [],
    assetMediaCounts: {
      image: 0,
      video: 0,
      audio: 0
    },
    allowedAssetTypes: allowedAssetTypes
  });
  const _0x46f1d8 = resolvePromptPresetTemplate(template, _0x109732);
  if (!_0x109732 || _templateConsumesPresetUserInput(template)) {
    return _0x46f1d8;
  }
  if (!_0x46f1d8) {
    return _0x109732;
  }
  return _0x109732 + "\n" + _0x46f1d8;
}
function _notifyPromptHtmlUpdated(_0x30f64a, _0x18394a = {}) {
  const _0x4a5484 = _0x18394a?.renderRefBar !== false;
  if (typeof _0x30f64a._handlePromptHtmlUpdated === "function") {
    _0x30f64a._handlePromptHtmlUpdated();
    return;
  }
  if (_0x4a5484 && typeof _0x30f64a._renderRefBar === "function") {
    _0x30f64a._renderRefBar();
  }
  if (typeof _0x30f64a._updateSubmitButtonState === "function") {
    _0x30f64a._updateSubmitButtonState();
  }
}
function _isEmptyPromptHtml(_0xaedd02 = "") {
  const _0x1df41f = String(_0xaedd02 || "").replace(/<br\b[^>]*\/?>/gi, "").replace(/<\/?(?:div|p|section|article|blockquote)\b[^>]*>/gi, "").replace(/&nbsp;|\u00a0/g, "").trim();
  return _0x1df41f === "";
}
function _sanitizePromptHtmlForCommit(_0x5cf157 = "") {
  const _0x4af3a = sanitizePromptHtml(_0x5cf157);
  if (_isEmptyPromptHtml(_0x4af3a)) {
    return "";
  } else {
    return _0x4af3a;
  }
}
function _readPromptHtmlForCommit(_0x924451) {
  const _0x1fee2f = serializeVirtualizedPromptHtml(_0x924451?.promptEl);
  const _0xe546b1 = _0x1fee2f === null ? sanitizePromptHtml(_0x924451?.promptEl?.innerHTML || "") : _0x1fee2f;
  const _0x2d54fd = _isEmptyPromptHtml(_0xe546b1) ? "" : _0xe546b1;
  rememberVirtualizedPromptCommit(_0x924451, _0x2d54fd);
  return _0x2d54fd;
}
export function sanitizePromptHtmlForCommit(_0x143382 = "") {
  return _sanitizePromptHtmlForCommit(_0x143382);
}
function _clearPromptHtmlCommitTimer(_0x239ebd) {
  if (!_0x239ebd?._promptHtmlCommitTimer) {
    return;
  }
  clearTimeout(_0x239ebd._promptHtmlCommitTimer);
  _0x239ebd._promptHtmlCommitTimer = null;
}
export function schedulePromptHtmlCommit(_0x4e56d6, {
  delayMs = PROMPT_HTML_COMMIT_DELAY_MS
} = {}) {
  if (!_0x4e56d6?.promptEl || !_0x4e56d6?.nodeId) {
    return false;
  }
  removeVirtualPromptPasteEndMarker(_0x4e56d6.promptEl);
  _clearPromptHtmlCommitTimer(_0x4e56d6);
  _0x4e56d6._hasPendingPromptHtmlCommit = true;
  _pendingPromptHtmlCommitTargets.add(_0x4e56d6);
  const _0x417562 = Math.max(0, Number(delayMs) || 0);
  _0x4e56d6._promptHtmlCommitTimer = setTimeout(() => {
    flushPromptHtmlCommit(_0x4e56d6);
  }, _0x417562);
  return true;
}
export function cancelPromptHtmlCommit(_0xaa8f21) {
  if (!_0xaa8f21) {
    return false;
  }
  _clearPromptHtmlCommitTimer(_0xaa8f21);
  _0xaa8f21._hasPendingPromptHtmlCommit = false;
  _pendingPromptHtmlCommitTargets.delete(_0xaa8f21);
  return true;
}
export function flushPromptHtmlCommit(_0x1f6865) {
  if (!_0x1f6865) {
    return false;
  }
  _clearPromptHtmlCommitTimer(_0x1f6865);
  const _0x37b21e = _0x1f6865._hasPendingPromptHtmlCommit === true;
  _0x1f6865._hasPendingPromptHtmlCommit = false;
  _pendingPromptHtmlCommitTargets.delete(_0x1f6865);
  if (!_0x1f6865?.promptEl || !_0x1f6865?.nodeId) {
    return false;
  }
  const _0x51088a = _readPromptHtmlForCommit(_0x1f6865);
  if (typeof _0x1f6865.commitPromptHtml === "function") {
    const _0x9aa369 = typeof _0x1f6865.getPromptHtml === "function" ? String(_0x1f6865.getPromptHtml() || "") : "";
    if (_0x9aa369 === _0x51088a) {
      return false;
    }
    _0x1f6865.commitPromptHtml(_0x51088a);
    _notifyPromptHtmlUpdated(_0x1f6865);
    return true;
  }
  const _0x1e6ed5 = (a1074_0x3a456e.getStateRaw?.() || a1074_0x3a456e.getState?.())?.nodes?.[_0x1f6865.nodeId];
  if (!_0x1e6ed5) {
    return false;
  }
  const _0x2bc5b0 = _0x1e6ed5.prompt;
  if (!_0x37b21e && _0x2bc5b0 === _0x51088a) {
    return false;
  }
  if (_0x2bc5b0 === _0x51088a) {
    return false;
  }
  a1074_0x3a456e.updateNodeData(_0x1f6865.nodeId, {
    prompt: _0x51088a
  });
  return true;
}
export function flushAllPendingPromptHtmlCommits() {
  let _0x328eff = false;
  Array.from(_pendingPromptHtmlCommitTargets).forEach(_0x2100e9 => {
    _0x328eff = flushPromptHtmlCommit(_0x2100e9) || _0x328eff;
  });
  return _0x328eff;
}
function _updatePromptHtml(_0x46728d, _0x33060c = {}) {
  if (!_0x46728d?.promptEl || !_0x46728d?.nodeId) {
    return;
  }
  cancelPromptHtmlCommit(_0x46728d);
  const _0xca97e5 = _readPromptHtmlForCommit(_0x46728d);
  if (typeof _0x46728d.commitPromptHtml === "function") {
    _0x46728d.commitPromptHtml(_0xca97e5);
    _notifyPromptHtmlUpdated(_0x46728d, _0x33060c);
    return;
  }
  a1074_0x3a456e.updateNodeData(_0x46728d.nodeId, {
    prompt: _0xca97e5
  });
  _notifyPromptHtmlUpdated(_0x46728d, _0x33060c);
}
function _commitPromptAndAssetInputRefs(_0x58e9fa, _0x4c2542) {
  if (!_0x58e9fa?.nodeId) {
    return false;
  }
  const _0x4acab8 = {
    [PROMPT_ASSET_INPUT_REFS_FIELD]: Array.isArray(_0x4c2542) ? _0x4c2542 : []
  };
  if (_0x58e9fa?.promptEl) {
    cancelPromptHtmlCommit(_0x58e9fa);
    _0x4acab8.prompt = _readPromptHtmlForCommit(_0x58e9fa);
  }
  a1074_0x3a456e.updateNodeData(_0x58e9fa.nodeId, _0x4acab8);
  _notifyPromptHtmlUpdated(_0x58e9fa);
  return true;
}
function _getPromptAssetInputRefRecordForMention(_0x670317 = {}) {
  if (_0x670317?.origin !== "asset") {
    return null;
  }
  return a1074_0x2a18dd({
    assetId: _0x670317.assetId,
    itemIndex: _0x670317.assetIndex ?? _0x670317.itemIndex,
    type: _0x670317.type
  });
}
function _appendPromptAssetInputRefRecords(_0x1f5160, _0x22c992 = []) {
  const _0x1fcb48 = a1074_0x8bce2a(_getTargetNodeData(_0x1f5160));
  const _0x3fa53e = _0x1fcb48.slice();
  (Array.isArray(_0x22c992) ? _0x22c992 : [_0x22c992]).forEach(_0x3faa8f => {
    const _0x5b906c = _getPromptAssetInputRefRecordForMention(_0x3faa8f);
    if (_0x5b906c) {
      _0x3fa53e.push(_0x5b906c);
    }
  });
  return _0x3fa53e;
}
function _shouldStoreMentionAsPromptAssetInput(_0xa66d35, _0x4dfbee = {}) {
  const _0x28bfbd = a1074_0x44399a(_0x4dfbee?.type);
  return _0xa66d35?.keepAssetMentionPills !== true && _0x4dfbee?.origin === "asset" && _0x28bfbd && _0x28bfbd !== "text" && isRunningHubWorkflowNode(_getTargetNodeData(_0xa66d35));
}
function _consumeMentionTriggerText({
  triggerRange = null,
  atIndex = -1
} = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  const _0x218067 = window.getSelection?.();
  const _0x16c27d = triggerRange || (_0x218067 && _0x218067.rangeCount ? _0x218067.getRangeAt(0) : null);
  if (!_0x16c27d || _0x16c27d.startContainer.nodeType !== Node.TEXT_NODE) {
    return false;
  }
  const _0x22210e = _0x16c27d.startContainer;
  const _0x3fd979 = String(_0x22210e.textContent || "");
  const _0x2aeb7b = _0x16c27d.startOffset;
  const _0x3b339f = Number.isFinite(atIndex) && atIndex >= 0 ? atIndex : _findLastMentionTriggerIndex(_0x3fd979, _0x2aeb7b);
  if (_0x3b339f < 0) {
    return false;
  }
  const _0x1dfd8b = _0x22210e.parentNode;
  if (!_0x1dfd8b) {
    return false;
  }
  const _0x574ed0 = document.createTextNode(_0x3fd979.slice(0, _0x3b339f));
  const _0x1a2b26 = document.createTextNode(_0x3fd979.slice(_0x2aeb7b));
  _0x1dfd8b.replaceChild(_0x1a2b26, _0x22210e);
  _0x1dfd8b.insertBefore(_0x574ed0, _0x1a2b26);
  const _0x262948 = document.createRange();
  _0x262948.setStartAfter(_0x574ed0);
  _0x262948.collapse(true);
  _0x218067?.removeAllRanges?.();
  _0x218067?.addRange?.(_0x262948);
  return true;
}
function _insertPromptAssetInputRef(_0x347c86, _0x4d1875, {
  triggerRange = null,
  atIndex = -1,
  pillToEdit = null
} = {}) {
  const _0x3291a7 = _appendPromptAssetInputRefRecords(_0x347c86, [_0x4d1875]);
  if (pillToEdit) {
    pillToEdit.remove?.();
    return _commitPromptAndAssetInputRefs(_0x347c86, _0x3291a7);
  }
  if (!_consumeMentionTriggerText({
    triggerRange: triggerRange,
    atIndex: atIndex
  })) {
    return false;
  }
  return _commitPromptAndAssetInputRefs(_0x347c86, _0x3291a7);
}
function _escapePromptPreviewHtml(_0xe1c084) {
  return String(_0xe1c084 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
}
function _moveCaretToPromptEnd(_0x225795) {
  if (!_0x225795) {
    return;
  }
  if (typeof window === "undefined" || typeof document === "undefined" || typeof document.createRange !== "function") {
    return;
  }
  try {
    const _0x450346 = window.getSelection?.();
    if (!_0x450346) {
      return;
    }
    const _0x432b04 = document.createRange();
    _0x432b04.selectNodeContents(_0x225795);
    _0x432b04.collapse(false);
    _0x450346.removeAllRanges();
    _0x450346.addRange(_0x432b04);
  } catch {}
}
export function shouldUsePromptPreviewForPreset(_0x2d3d2c = null, _0x4fac62 = {}) {
  return (_0x4fac62?.insertPrompt === true || globalThis.window?.DEV_MODE === true) && hasPromptPresetTemplateContent(_0x2d3d2c);
}
export function previewPresetPromptInEditor({
  storeApi = a1074_0x3a456e,
  nodeId = "",
  promptEl = null,
  promptText = "",
  toastText = "",
  toastType = "warn"
} = {}) {
  const _0x50c356 = String(promptText ?? "");
  const _0x547367 = sanitizePromptHtml(_escapePromptPreviewHtml(_0x50c356));
  const _0x3aae9b = typeof Element !== "undefined" && promptEl instanceof Element;
  if (promptEl) {
    promptEl.innerHTML = _0x547367;
  }
  if (!_0x3aae9b && promptEl) {
    if ("textContent" in promptEl || typeof promptEl.textContent !== "undefined") {
      promptEl.textContent = _0x50c356;
    }
    if ("innerText" in promptEl || typeof promptEl.innerText !== "undefined") {
      promptEl.innerText = _0x50c356;
    }
    if (Array.isArray(promptEl.childNodes)) {
      promptEl.childNodes = [{
        nodeType: globalThis.Node?.TEXT_NODE ?? 3,
        textContent: _0x50c356
      }];
    }
  }
  if (typeof promptEl?.focus === "function") {
    try {
      promptEl.focus();
    } catch {}
  }
  if (_0x3aae9b) {
    _moveCaretToPromptEnd(promptEl);
  }
  if (storeApi?.updateNodeData && nodeId) {
    storeApi.updateNodeData(nodeId, {
      prompt: _0x547367
    });
  }
  if (toastText) {
    globalThis.window?.showToast?.(toastText, toastType);
  }
  return _0x547367;
}
export function insertPresetPromptIntoEditor({
  storeApi = a1074_0x3a456e,
  nodeId = "",
  promptEl = null,
  template = null,
  inEdges = [],
  nodes = {},
  allowedAssetTypes = null,
  toastText = "",
  toastType = "success"
} = {}) {
  const _0x2cac16 = _resolveInsertedPresetPromptText({
    template: template,
    promptEl: promptEl,
    inEdges: inEdges,
    nodes: nodes,
    allowedAssetTypes: allowedAssetTypes
  });
  return previewPresetPromptInEditor({
    storeApi: storeApi,
    nodeId: nodeId,
    promptEl: promptEl,
    promptText: _0x2cac16,
    toastText: toastText,
    toastType: toastType
  });
}
let _mentionMenuEl = null;
let _mentionMenuState = {
  activeMenu: null,
  activeCandidateHoverEnd: null
};
let _mentionViewportUnsubscribe = null;
let _mentionOutsideDocClick = null;
let _mentionOutsideDocClickTimer = 0;
let _mentionMenuPositionState = null;
function _isMentionNodeConnected(_0x3a9ec4) {
  if (!_0x3a9ec4) {
    return false;
  }
  if (_0x3a9ec4.isConnected === true) {
    return true;
  }
  if (typeof document === "undefined") {
    return true;
  }
  if (typeof document.body?.contains === "function") {
    return document.body.contains(_0x3a9ec4);
  } else {
    return true;
  }
}
function _clearMentionOutsideDocClick() {
  if (_mentionOutsideDocClickTimer) {
    clearTimeout(_mentionOutsideDocClickTimer);
    _mentionOutsideDocClickTimer = 0;
  }
  if (_mentionOutsideDocClick && typeof document !== "undefined") {
    document.removeEventListener?.("mousedown", _mentionOutsideDocClick);
  }
  _mentionOutsideDocClick = null;
}
function _cleanupMentionMenuLifecycle() {
  const _0x1e071b = _mentionMenuState.activeCandidateHoverEnd;
  _mentionMenuState.activeCandidateHoverEnd = null;
  _0x1e071b?.();
  _clearMentionOutsideDocClick();
  if (_mentionViewportUnsubscribe) {
    _mentionViewportUnsubscribe();
    _mentionViewportUnsubscribe = null;
  }
  _mentionMenuPositionState = null;
}
function _resolveMentionMenuPoint(_0x71d670) {
  if (!_0x71d670) {
    return null;
  }
  const _0x248372 = 5;
  if (_0x71d670.triggerRange?.getBoundingClientRect) {
    try {
      const _0x534a2b = _0x71d670.triggerRange.getBoundingClientRect();
      if (_0x534a2b) {
        return {
          left: _0x534a2b.left,
          top: _0x534a2b.bottom + _0x248372,
          anchorTop: _0x534a2b.top
        };
      }
    } catch {}
  }
  if (_0x71d670.pillToEdit?.getBoundingClientRect && _isMentionNodeConnected(_0x71d670.pillToEdit)) {
    const _0x11caa8 = _0x71d670.pillToEdit.getBoundingClientRect();
    return {
      left: _0x11caa8.left,
      top: _0x11caa8.bottom + _0x248372,
      anchorTop: _0x11caa8.top
    };
  }
  if (Number.isFinite(_0x71d670.fallbackX) && Number.isFinite(_0x71d670.fallbackY)) {
    return {
      left: _0x71d670.fallbackX,
      top: _0x71d670.fallbackY
    };
  }
  return null;
}
function _syncOpenMentionSubmenus() {
  const _0x13150d = _mentionMenuPositionState?.menu || _mentionMenuEl;
  if (!_0x13150d?.querySelectorAll) {
    return;
  }
  _0x13150d.querySelectorAll(".at-mention-submenu-open").forEach(_0x581f2e => {
    const _0x44dc65 = Array.from(_0x581f2e.children || []).find(_0x54152d => _0x54152d.classList?.contains("at-mention-submenu"));
    if (_0x44dc65) {
      _positionMentionSubmenu(_0x581f2e, _0x44dc65);
    }
  });
}
function _positionMentionMenu() {
  const _0x2e5f26 = _mentionMenuPositionState;
  const _0x5ade10 = _0x2e5f26?.menu;
  if (!_0x2e5f26 || !_0x5ade10 || _0x5ade10.style.display !== "flex") {
    return;
  }
  const _0x3d56d5 = _resolveMentionMenuPoint(_0x2e5f26);
  if (!_0x3d56d5) {
    _closeMentionMenu();
    return;
  }
  const _0x3716d3 = Number(globalThis.window?.innerWidth || 0);
  const _0xe51533 = Number(globalThis.window?.innerHeight || 0);
  const _0x3c1184 = 12;
  const _0x263d7a = 5;
  _0x5ade10.style.maxHeight = "";
  const _0xef6337 = _0x5ade10.getBoundingClientRect?.() || null;
  const _0x324d15 = Math.max(0, Number(_0xef6337?.width || _0x5ade10.offsetWidth || 0));
  const _0x2f710c = Math.max(1, Number(_0xef6337?.height || _0x5ade10.offsetHeight || 0));
  let _0x50b0e3 = Number(_0x3d56d5.left || 0);
  let _0x629c52 = Number(_0x3d56d5.top || 0);
  if (_0x3716d3 > 0 && _0x324d15 > 0) {
    _0x50b0e3 = Math.min(Math.max(_0x3c1184, _0x50b0e3), Math.max(_0x3c1184, _0x3716d3 - _0x3c1184 - _0x324d15));
  }
  if (_0xe51533 > 0) {
    const _0x1f7296 = Math.max(0, _0xe51533 - _0x3c1184 - _0x629c52);
    const _0x52299a = Number.isFinite(_0x3d56d5.anchorTop) ? Number(_0x3d56d5.anchorTop) : _0x629c52 - _0x263d7a;
    const _0x16e1a1 = Math.max(0, _0x52299a - _0x3c1184);
    const _0x36cc3e = _0x2f710c > _0x1f7296 && _0x16e1a1 > _0x1f7296;
    const _0x404ce7 = _0x36cc3e ? _0x16e1a1 : _0x1f7296;
    const _0x1df167 = Math.max(1, Math.min(_0x2f710c, _0x404ce7));
    _0x5ade10.style.maxHeight = _0x1df167 + "px";
    _0x629c52 = _0x36cc3e ? Math.max(_0x3c1184, _0x52299a - _0x263d7a - _0x1df167) : Math.min(Math.max(_0x3c1184, _0x629c52), Math.max(_0x3c1184, _0xe51533 - _0x3c1184 - _0x1df167));
  }
  _0x5ade10.style.left = _0x50b0e3 + "px";
  _0x5ade10.style.top = _0x629c52 + "px";
  _syncOpenMentionSubmenus();
}
function _watchMentionViewport() {
  if (typeof a1074_0x3a456e.subscribeSelector !== "function") {
    return;
  }
  if (_mentionViewportUnsubscribe) {
    _mentionViewportUnsubscribe();
  }
  _mentionViewportUnsubscribe = a1074_0x3a456e.subscribeSelector(_0x5e8cb8 => _0x5e8cb8.viewport, () => _positionMentionMenu());
}
function _bindMentionOutsideDocClick(_0x18de6b) {
  _clearMentionOutsideDocClick();
  _mentionOutsideDocClick = _0x2e449d => {
    if (!_0x18de6b.contains(_0x2e449d.target)) {
      _closeMentionMenu();
    }
  };
  _mentionOutsideDocClickTimer = setTimeout(() => {
    _mentionOutsideDocClickTimer = 0;
    if (_mentionOutsideDocClick) {
      document.addEventListener?.("mousedown", _mentionOutsideDocClick);
    }
  }, 10);
}
export function _getMentionMenu() {
  if (!_mentionMenuEl) {
    _mentionMenuEl = document.getElementById("v2-mention-menu");
    if (!_mentionMenuEl) {
      _mentionMenuEl = document.createElement("div");
      _mentionMenuEl.id = "v2-mention-menu";
      _mentionMenuEl.className = "at-mention-menu";
      document.body.appendChild(_mentionMenuEl);
    } else if (!_mentionMenuEl.classList.contains("at-mention-menu")) {
      _mentionMenuEl.classList.add("at-mention-menu");
    }
  }
  const _0x42136e = document.getElementById?.("v2-mention-menu") || null;
  if (_0x42136e && _0x42136e !== _mentionMenuEl) {
    _mentionMenuEl = _0x42136e;
  } else if (_mentionMenuEl && !_0x42136e && typeof document.body?.appendChild === "function") {
    document.body.appendChild(_mentionMenuEl);
  }
  if (_mentionMenuEl && !_mentionMenuEl.classList.contains("at-mention-menu")) {
    _mentionMenuEl.classList.add("at-mention-menu");
  }
  return _mentionMenuEl;
}
export function _closeMentionMenu() {
  _cleanupMentionMenuLifecycle();
  const _0x5b2d0d = _getMentionMenu();
  _0x5b2d0d.style.display = "none";
  _0x5b2d0d.innerHTML = "";
  _mentionMenuState.activeMenu = null;
}
export function _buildMentionCandidates(_0x543fb9, _0x1ac6a8 = "", _0x51c222 = {}) {
  if (typeof _0x543fb9?.getMentionCandidates === "function") {
    const _0x13068c = _0x543fb9.getMentionCandidates({
      query: _0x1ac6a8,
      options: _0x51c222
    });
    if (Array.isArray(_0x13068c)) {
      return _0x13068c;
    } else {
      return [];
    }
  }
  const _0x49bf90 = _0x543fb9?.nodeId;
  const _0x1184e4 = a1074_0x3a456e.getState();
  const _0x5c707a = _0x1184e4.nodes || {};
  const _0x20476f = _0x5c707a?.[_0x49bf90] || _0x543fb9?._data || {};
  const _0x48203c = getTargetInputPolicy(_0x20476f);
  const _0x28f033 = a1074_0x3a456e.getIncomingEdges(_0x49bf90);
  const _0x159172 = _normalizeQuery(_0x1ac6a8);
  const _0x1f3045 = _0x159172.toLowerCase();
  const _0xce1dea = {
    text: 0,
    image: 0,
    video: 0,
    audio: 0
  };
  const _0xcac75a = _getPromptInputCountState(_0x543fb9?.promptEl, _0x51c222?.excludePill || null, {
    nodeData: _0x20476f
  });
  const _0x23340a = _cloneInputCountState(_0xcac75a);
  const _0x217e97 = [];
  _0x28f033.forEach(_0x251cd0 => {
    const _0x52dbfe = _0x5c707a[_0x251cd0.sourceId];
    if (!_0x52dbfe) {
      return;
    }
    const _0x5cbc98 = resolveEffectiveInputKind(_0x52dbfe, _0x251cd0);
    if (!_0x5cbc98) {
      return;
    }
    if (!isInputKindAllowed(_0x48203c, _0x5cbc98)) {
      return;
    }
    _addInputCount(_0x23340a, _0x5cbc98, _getNodeInputCountKey(_0x251cd0.sourceId, _0x5cbc98));
    _0xce1dea[_0x5cbc98] += 1;
    const _0xa11862 = AT_TYPE_MAP[_0x5cbc98] || _0x5cbc98;
    const _0x26ac4d = "" + _0xa11862 + _0xce1dea[_0x5cbc98];
    const _0x5f3f28 = _getNodeMentionDisplayLabel(_0x52dbfe, _0x26ac4d);
    if (_0x159172 && !_0x26ac4d.includes(_0x159172) && !_0xa11862.includes(_0x159172) && !_0x5f3f28.toLowerCase().includes(_0x1f3045)) {
      return;
    }
    _0x217e97.push({
      origin: "node",
      edgeId: _0x251cd0.id,
      nodeId: _0x251cd0.sourceId,
      type: _0x5cbc98,
      label: _0x5f3f28,
      refLabel: _0x26ac4d,
      ..._getMentionVisual(_0x543fb9, {
        origin: "node",
        nodeId: _0x251cd0.sourceId,
        type: _0x5cbc98
      }),
      limitReason: ""
    });
  });
  const _0x3017fc = MENTION_TYPE_ORDER.filter(_0x3f1980 => isInputKindAllowed(_0x48203c, _0x3f1980));
  getAssetMentionCandidates({
    query: "",
    allowedTypes: _0x3017fc
  }).forEach(_0x1e51ab => {
    const _0x1cb903 = a1074_0x44399a(_0x1e51ab.type);
    if (!_0x1cb903) {
      return;
    }
    if (!_candidateMatchesQuery(_0x1e51ab, _0x1ac6a8)) {
      return;
    }
    _0x217e97.push({
      origin: "asset",
      assetId: _0x1e51ab.assetId,
      assetIndex: _0x1e51ab.itemIndex,
      type: _0x1cb903,
      label: _stripMentionDisplayMarker(_0x1e51ab.insertLabel || _0x1e51ab.label || _0x1e51ab.name),
      assetName: _0x1e51ab.assetName,
      thumbUrl: _getRenderableMentionThumbUrl(_0x1e51ab.thumbUrl || "", _0x1cb903),
      iconType: _0x1cb903,
      limitReason: _getAdvancedVoiceCloneAudioLimitReason(_0x543fb9, {
        origin: "asset",
        assetId: _0x1e51ab.assetId,
        assetIndex: _0x1e51ab.itemIndex,
        type: _0x1cb903
      }, _0x20476f, _0x1184e4) ?? (_canReuseAlreadyCountedInputForLimit(_0x1cb903) && _isMentionAlreadyCounted(_0x23340a, {
        origin: "asset",
        assetId: _0x1e51ab.assetId,
        assetIndex: _0x1e51ab.itemIndex,
        type: _0x1cb903
      }) ? "" : getInputLimitReason(_0x48203c, _0x1cb903, _0x23340a.counts))
    });
  });
  return _0x217e97;
}
export function _buildMentionMenuTree(_0x49c7f3 = []) {
  const _0x11c1c6 = [];
  const _0x56c8c1 = new Map();
  (Array.isArray(_0x49c7f3) ? _0x49c7f3 : []).forEach(_0x3e3b03 => {
    if (!_0x3e3b03 || typeof _0x3e3b03 !== "object") {
      return;
    }
    if (_0x3e3b03.origin !== "asset" || _0x3e3b03.menuDirect === true) {
      _0x11c1c6.push(_0x3e3b03);
      return;
    }
    const _0x1c474c = a1074_0x44399a(_0x3e3b03.type);
    if (!_0x1c474c) {
      return;
    }
    const _0x195731 = String(_0x3e3b03.assetGroupId || _0x3e3b03.assetId || _0x3e3b03.assetName || "asset");
    if (!_0x56c8c1.has(_0x195731)) {
      _0x56c8c1.set(_0x195731, {
        assetId: _0x3e3b03.assetId || "",
        label: _0x3e3b03.assetName || nodePromptSharedText("assetFallback"),
        subtitle: _0x3e3b03.assetGroupSubtitle || "",
        menuPage: _0x3e3b03.menuPage || "",
        menuGroup: _0x3e3b03.menuGroup || "",
        menuSection: _0x3e3b03.menuSection || "",
        suppressBulkMention: _0x3e3b03.suppressBulkMention === true,
        typeMap: new Map(),
        items: []
      });
    }
    const _0x3c984d = _0x56c8c1.get(_0x195731);
    _0x3c984d.items.push(_0x3e3b03);
    if (!_0x3c984d.typeMap.has(_0x1c474c)) {
      _0x3c984d.typeMap.set(_0x1c474c, {
        type: _0x1c474c,
        label: _getAssetTypeMenuLabel(_0x1c474c),
        items: []
      });
    }
    _0x3c984d.typeMap.get(_0x1c474c).items.push(_0x3e3b03);
  });
  const _0xb3a3fc = Array.from(_0x56c8c1.values()).map(_0x9549df => ({
    assetId: _0x9549df.assetId,
    label: _0x9549df.label,
    subtitle: _0x9549df.subtitle,
    menuPage: _0x9549df.menuPage,
    menuGroup: _0x9549df.menuGroup,
    menuSection: _0x9549df.menuSection,
    suppressBulkMention: _0x9549df.suppressBulkMention,
    items: _0x9549df.items,
    typeItems: MENTION_TYPE_ORDER.map(_0x15d5a4 => _0x9549df.typeMap.get(_0x15d5a4)).filter(_0x357ffb => _0x357ffb?.items?.length > 0)
  })).filter(_0x1c24e9 => _0x1c24e9.items.length > 0);
  return {
    nodeItems: _0x11c1c6,
    assetItems: _0xb3a3fc
  };
}
function _getPromptInputPillLabel(_0x515780) {
  return _getPromptInputRefLabel(_0x515780, _getPromptInputDisplayLabel(_0x515780));
}
function _buildInputMentionCandidateIndex(_0x15ca4d) {
  const _0x51e5d2 = _buildMentionCandidates(_0x15ca4d, "").filter(_0x14148b => _0x14148b?.origin === "node");
  const _0x281664 = new Map();
  const _0x376e83 = new Map();
  const _0x4692a1 = new Map();
  _0x51e5d2.forEach(_0xbf38dd => {
    const _0xdb0664 = String(_0xbf38dd?.nodeId || "").trim();
    const _0x52fa49 = [_0xbf38dd?.label, _0xbf38dd?.refLabel].map(_0x4676c0 => _normalizeMentionLabelKey(_0x4676c0 || "")).filter(Boolean);
    const _0x418370 = a1074_0x44399a(_0xbf38dd?.type);
    if (_0xdb0664) {
      _0x281664.set(_0xdb0664, _0xbf38dd);
    }
    _0x52fa49.forEach(_0x5a6539 => {
      if (_0x5a6539 && !_0x376e83.has(_0x5a6539)) {
        _0x376e83.set(_0x5a6539, _0xbf38dd);
      }
      if (_0x5a6539 && _0x418370) {
        const _0x3352c8 = _0x418370 + ":" + _0x5a6539;
        if (!_0x4692a1.has(_0x3352c8)) {
          _0x4692a1.set(_0x3352c8, _0xbf38dd);
        }
      }
    });
  });
  return {
    bySourceId: _0x281664,
    byLabel: _0x376e83,
    byLabelAndType: _0x4692a1
  };
}
function _applyInputMentionCandidateToPill(_0x1d878b, _0x5f2fe0, _0x3294fd) {
  if (!_isRefPillNode(_0x5f2fe0) || !_0x3294fd) {
    return false;
  }
  const _0x3a0773 = _stripMentionDisplayMarker(_0x3294fd.label || _0x5f2fe0.dataset?.label || "");
  const _0x41896b = _stripMentionDisplayMarker(_0x3294fd.refLabel || _0x3a0773);
  const _0x4baf23 = a1074_0x44399a(_0x3294fd.type);
  _0x5f2fe0.dataset.refOrigin = "node";
  _0x5f2fe0.dataset.label = _0x3a0773;
  if (_0x41896b) {
    _0x5f2fe0.dataset.refLabel = _0x41896b;
  }
  _0x5f2fe0.dataset.nodeId = String(_0x3294fd.nodeId || "");
  if (_0x4baf23) {
    _0x5f2fe0.dataset.refType = _0x4baf23;
  }
  delete _0x5f2fe0.dataset.assetId;
  delete _0x5f2fe0.dataset.assetIndex;
  _0x5f2fe0.removeAttribute?.("data-asset-id");
  _0x5f2fe0.removeAttribute?.("data-asset-index");
  _clearInputMentionPillUnresolved(_0x5f2fe0);
  _renderMentionPillContent(_0x5f2fe0, _0x3a0773, _getMentionVisual(_0x1d878b, _0x3294fd, _0x5f2fe0));
  _decorateMentionPill(_0x1d878b, _0x5f2fe0, _0x3294fd);
  return true;
}
export function resolvePromptInputPillsForTarget(_0x5586d8) {
  if (!_0x5586d8?.promptEl || typeof _0x5586d8.promptEl.querySelectorAll !== "function") {
    return {
      resolved: 0,
      unresolved: 0
    };
  }
  const _0x4904b9 = _buildInputMentionCandidateIndex(_0x5586d8);
  let _0x5f155f = 0;
  let _0x3a556d = 0;
  _0x5586d8.promptEl.querySelectorAll(".ref-pill").forEach(_0x14bd72 => {
    if (_isAssetMentionPill(_0x14bd72)) {
      return;
    }
    const _0x4c398f = _getPromptInputPillLabel(_0x14bd72);
    const _0x29973b = _normalizeMentionLabelKey(_0x4c398f);
    const _0x254ce1 = _getPillMentionType(_0x14bd72);
    const _0x504017 = _getDatasetValue(_0x14bd72, "nodeId", "data-node-id");
    let _0x7efab2 = _0x504017 ? _0x4904b9.bySourceId.get(_0x504017) : null;
    if (!_0x7efab2 && _0x29973b && _0x254ce1) {
      _0x7efab2 = _0x4904b9.byLabelAndType.get(_0x254ce1 + ":" + _0x29973b) || null;
    }
    if (!_0x7efab2 && _0x29973b) {
      _0x7efab2 = _0x4904b9.byLabel.get(_0x29973b) || null;
    }
    if (_0x7efab2 && (!_0x254ce1 || a1074_0x44399a(_0x7efab2.type) === _0x254ce1)) {
      if (_applyInputMentionCandidateToPill(_0x5586d8, _0x14bd72, _0x7efab2)) {
        _0x5f155f += 1;
      }
      return;
    }
    if (_setInputMentionPillUnresolved(_0x14bd72, {
      label: _0x4c398f,
      type: _0x254ce1
    })) {
      _0x3a556d += 1;
    }
  });
  return {
    resolved: _0x5f155f,
    unresolved: _0x3a556d
  };
}
function _getClipboardData(_0x19566d, _0x142e2c) {
  const _0x570ac1 = _0x19566d?.clipboardData || globalThis.window?.clipboardData;
  if (typeof _0x570ac1?.getData !== "function") {
    return "";
  }
  return String(_0x570ac1.getData(_0x142e2c) || "");
}
function _insertPromptHtmlAtSelection(_0x3a504a) {
  if (typeof document !== "undefined" && typeof document.execCommand === "function") {
    try {
      if (document.execCommand("insertHTML", false, _0x3a504a)) {
        return true;
      }
    } catch {}
  }
  return false;
}
function _insertPromptTextAtSelection(_0x45014a) {
  if (typeof document !== "undefined" && typeof document.execCommand === "function") {
    try {
      if (document.execCommand("insertText", false, _0x45014a)) {
        return true;
      }
    } catch {}
  }
  return false;
}
export function handlePromptPaste(_0x5d23fa, _0x462496) {
  if (!_0x5d23fa?.promptEl) {
    return false;
  }
  _0x462496?.preventDefault?.();
  const _0x249e09 = _getClipboardData(_0x462496, "text/html");
  const _0x168dcb = _getClipboardData(_0x462496, "text/plain");
  const _0x1f3d3d = /ref-pill/i.test(_0x249e09) ? sanitizePromptHtml(_0x249e09) : "";
  const _0x38cc2b = !!_0x1f3d3d && /class="ref-pill"/i.test(_0x1f3d3d);
  if (!_0x38cc2b) {
    if (insertVirtualizedPromptTextAtSelection(_0x5d23fa.promptEl, _0x168dcb)) {
      schedulePromptHtmlCommit(_0x5d23fa);
      return true;
    }
    const _0x482306 = _insertPromptTextAtSelection(_0x168dcb);
    if (_0x482306) {
      if (!schedulePromptHtmlCommit(_0x5d23fa)) {
        _updatePromptHtml(_0x5d23fa);
      }
      return true;
    }
    return false;
  }
  const _0xd7adc0 = _insertPromptHtmlAtSelection(_0x1f3d3d);
  if (!_0xd7adc0) {
    const _0x4591e1 = _insertPromptTextAtSelection(_0x168dcb);
    if (_0x4591e1) {
      _updatePromptHtml(_0x5d23fa);
    }
    return _0x4591e1;
  }
  const _0x2c39b7 = resolvePromptInputPillsForTarget(_0x5d23fa);
  _rehydratePromptPills(_0x5d23fa);
  _syncEdgesOrderFromPills(_0x5d23fa);
  _updatePromptHtml(_0x5d23fa);
  if (_0x2c39b7.unresolved > 0) {
    globalThis.window?.showToast?.("Some @ input refs are not bound in this node.", "warn");
  }
  return true;
}
export function handlePromptSelectAll(_0x3c9599, _0x40d49e) {
  if (!_0x3c9599?.promptEl) {
    return false;
  }
  const _0x372d4b = String(_0x40d49e?.key || "").toLowerCase();
  const _0x5bfddc = String(_0x40d49e?.code || "");
  const _0x3e8c98 = (_0x40d49e?.ctrlKey || _0x40d49e?.metaKey) && !_0x40d49e?.altKey && (_0x372d4b === "a" || _0x5bfddc === "KeyA");
  if (!_0x3e8c98) {
    return false;
  }
  const _0x37d066 = globalThis.window?.getSelection?.();
  const _0x3ee8d3 = typeof document !== "undefined" && typeof document.createRange === "function" ? document.createRange() : null;
  if (!_0x37d066 || !_0x3ee8d3) {
    return false;
  }
  _0x40d49e.preventDefault?.();
  _0x40d49e.stopPropagation?.();
  _0x3ee8d3.selectNodeContents(_0x3c9599.promptEl);
  _0x37d066.removeAllRanges?.();
  _0x37d066.addRange?.(_0x3ee8d3);
  return true;
}
export function bindPromptMentionHost(_0x30f556, {
  enablePaste = true,
  enableSelectAll = true,
  ignoreInlineEditor = true,
  inlineEditorSelector = "[data-prompt-pill-inline-editor=\"true\"]",
  rehydrate = true,
  commitHydratedPrompt = true,
  closeMenuOnDestroy = true
} = {}) {
  const _0x3c8126 = _0x30f556?.promptEl;
  if (!_0x3c8126?.addEventListener) {
    return null;
  }
  const _0x403e8d = _0x4a08a4 => ignoreInlineEditor && Boolean(_0x4a08a4?.target?.closest?.(inlineEditorSelector));
  const _0x3f6b08 = _0x29740e => {
    if (_0x403e8d(_0x29740e)) {
      return;
    }
    schedulePromptHtmlCommit(_0x30f556);
    _checkAtTrigger(_0x30f556, _0x29740e);
  };
  const _0x42cf80 = () => {
    flushPromptHtmlCommit(_0x30f556);
  };
  const _0x14ce1c = _0x16ae94 => {
    if (_0x403e8d(_0x16ae94)) {
      return;
    }
    if (_handleMentionMenuKeyboard(_0x16ae94)) {
      return;
    }
    if (enableSelectAll && handlePromptSelectAll(_0x30f556, _0x16ae94)) {
      return;
    }
    _handlePillKeyboard(_0x30f556, _0x16ae94);
  };
  const _0x45e176 = _0x1ade56 => {
    if (_0x403e8d(_0x1ade56)) {
      return;
    }
    handlePromptPaste(_0x30f556, _0x1ade56);
  };
  _0x3c8126.addEventListener("input", _0x3f6b08);
  _0x3c8126.addEventListener("blur", _0x42cf80);
  _0x3c8126.addEventListener("keydown", _0x14ce1c);
  if (enablePaste) {
    _0x3c8126.addEventListener("paste", _0x45e176);
  }
  if (rehydrate) {
    _rehydratePromptPills(_0x30f556);
  }
  if (commitHydratedPrompt && typeof _0x30f556.getPromptHtml === "function" && typeof _0x30f556.commitPromptHtml === "function") {
    const _0x8def8e = _readPromptHtmlForCommit(_0x30f556);
    if (_0x8def8e !== _0x30f556.getPromptHtml()) {
      _0x30f556.commitPromptHtml(_0x8def8e);
    }
  }
  let _0x456f2c = false;
  return {
    destroy() {
      if (_0x456f2c) {
        return;
      }
      _0x456f2c = true;
      if (closeMenuOnDestroy) {
        _closeMentionMenu();
      }
      flushPromptHtmlCommit(_0x30f556);
      _0x3c8126.removeEventListener?.("input", _0x3f6b08);
      _0x3c8126.removeEventListener?.("blur", _0x42cf80);
      _0x3c8126.removeEventListener?.("keydown", _0x14ce1c);
      if (enablePaste) {
        _0x3c8126.removeEventListener?.("paste", _0x45e176);
      }
    }
  };
}
export function _insertMentionPill(_0x36c4b2, {
  label: _0x22b480,
  nodeId: _0x1e7ea5,
  triggerRange = null,
  atIndex = -1,
  pillToEdit = null,
  candidate = null
} = {}) {
  if (!_0x36c4b2?.promptEl) {
    return false;
  }
  const _0x4c566d = candidate || {
    origin: "node",
    label: _0x22b480,
    nodeId: _0x1e7ea5,
    type: ""
  };
  const _0x5c597c = a1074_0x44399a(_0x4c566d.type);
  if (_0x5c597c) {
    const _0x5eaaf0 = a1074_0x3a456e.getState();
    const _0x280ff7 = _0x5eaaf0.nodes?.[_0x36c4b2.nodeId] || _0x36c4b2?._data || {};
    const _0x428b8f = getTargetInputPolicy(_0x280ff7);
    const _0x2c0eaa = _getPromptInputCountState(_0x36c4b2.promptEl, pillToEdit || null, {
      nodeData: _0x280ff7
    });
    if (_0x4c566d.origin === "asset") {
      const _0x380235 = _0x5eaaf0.nodes || {};
      a1074_0x3a456e.getIncomingEdges(_0x36c4b2.nodeId).forEach(_0x13bd8 => {
        const _0x398eab = resolveEffectiveInputKind(_0x380235?.[_0x13bd8?.sourceId], _0x13bd8);
        _addInputCount(_0x2c0eaa, _0x398eab, _getNodeInputCountKey(_0x13bd8?.sourceId, _0x398eab));
      });
    }
    const _0xf0f4eb = _getAdvancedVoiceCloneAudioLimitReason(_0x36c4b2, _0x4c566d, _0x280ff7, _0x5eaaf0) ?? (_canReuseAlreadyCountedInputForLimit(_0x5c597c) && _isMentionAlreadyCounted(_0x2c0eaa, _0x4c566d, _0x5c597c) ? "" : getInputLimitReason(_0x428b8f, _0x5c597c, _0x2c0eaa.counts));
    if (_0xf0f4eb) {
      globalThis.window?.showToast?.(_0xf0f4eb, "warn");
      return false;
    }
  }
  if (_shouldStoreMentionAsPromptAssetInput(_0x36c4b2, _0x4c566d)) {
    return _insertPromptAssetInputRef(_0x36c4b2, _0x4c566d, {
      triggerRange: triggerRange,
      atIndex: atIndex,
      pillToEdit: pillToEdit
    });
  }
  const _0x58b147 = _0x227d8a => {
    const _0x5aa297 = _stripMentionDisplayMarker(_0x4c566d.pillLabel || _0x4c566d.label || _0x22b480 || "");
    const _0x5ab3c4 = _stripMentionDisplayMarker(_0x4c566d.refLabel || _0x5aa297);
    _0x227d8a.dataset.label = _0x5aa297;
    if (_0x4c566d.origin === "asset") {
      _0x227d8a.dataset.refOrigin = "asset";
      _0x227d8a.dataset.assetId = String(_0x4c566d.assetId || "");
      _0x227d8a.dataset.assetIndex = String(_0x4c566d.assetIndex ?? "");
      _0x227d8a.dataset.refType = String(_0x5c597c || _0x4c566d.type || "");
      delete _0x227d8a.dataset.refLabel;
      _clearInputMentionPillUnresolved(_0x227d8a);
      delete _0x227d8a.dataset.nodeId;
      _0x227d8a.removeAttribute?.("data-node-id");
      _0x227d8a.removeAttribute?.(PROMPT_INPUT_REF_LABEL_ATTR);
      _renderMentionPillContent(_0x227d8a, _0x5aa297, _getMentionVisual(_0x36c4b2, _0x4c566d, _0x227d8a));
    } else {
      _0x227d8a.dataset.refOrigin = "node";
      _0x227d8a.dataset.nodeId = String(_0x4c566d.nodeId || _0x1e7ea5 || "");
      if (_0x5ab3c4) {
        _0x227d8a.dataset.refLabel = _0x5ab3c4;
      }
      if (_0x5c597c || _0x4c566d.type) {
        _0x227d8a.dataset.refType = String(_0x5c597c || _0x4c566d.type || "");
      }
      _clearInputMentionPillUnresolved(_0x227d8a);
      delete _0x227d8a.dataset.assetId;
      delete _0x227d8a.dataset.assetIndex;
      _0x227d8a.removeAttribute?.("data-asset-id");
      _0x227d8a.removeAttribute?.("data-asset-index");
      _renderMentionPillContent(_0x227d8a, _0x5aa297, _getMentionVisual(_0x36c4b2, _0x4c566d, _0x227d8a));
    }
    _applyMentionPillPresentation(_0x227d8a, _0x4c566d);
    _decorateMentionPill(_0x36c4b2, _0x227d8a, _0x4c566d);
  };
  if (pillToEdit) {
    _0x58b147(pillToEdit);
    _updatePromptHtml(_0x36c4b2);
    return true;
  }
  const _0x27892a = window.getSelection();
  const _0x4c2d2e = triggerRange || (_0x27892a && _0x27892a.rangeCount ? _0x27892a.getRangeAt(0) : null);
  if (!_0x4c2d2e || _0x4c2d2e.startContainer.nodeType !== Node.TEXT_NODE) {
    return false;
  }
  const _0x4b2ac0 = _0x4c2d2e.startContainer;
  const _0x2bae53 = String(_0x4b2ac0.textContent || "");
  const _0x691f9 = _0x4c2d2e.startOffset;
  const _0x5c25d0 = Number.isFinite(atIndex) && atIndex >= 0 ? atIndex : _findLastMentionTriggerIndex(_0x2bae53, _0x691f9);
  if (_0x5c25d0 < 0) {
    return false;
  }
  const _0x50f1ea = _0x2bae53.slice(0, _0x5c25d0);
  const _0x1cccd9 = _0x2bae53.slice(_0x691f9);
  const _0x56f4bd = document.createTextNode(_0x50f1ea);
  const _0x3d4559 = document.createTextNode(_0x1cccd9);
  const _0x2896e4 = document.createElement("span");
  _0x2896e4.className = "ref-pill";
  _0x2896e4.contentEditable = "false";
  _0x58b147(_0x2896e4);
  _bindPromptPill(_0x36c4b2, _0x2896e4);
  _0x4b2ac0.parentNode.replaceChild(_0x3d4559, _0x4b2ac0);
  _0x3d4559.parentNode.insertBefore(_0x2896e4, _0x3d4559);
  _0x3d4559.parentNode.insertBefore(_0x56f4bd, _0x2896e4);
  const _0x42a698 = document.createRange();
  _0x42a698.setStartAfter(_0x2896e4);
  _0x42a698.collapse(true);
  _0x27892a.removeAllRanges();
  _0x27892a.addRange(_0x42a698);
  _updatePromptHtml(_0x36c4b2);
  return true;
}
function _getDirectMentionItems(_0x25e262) {
  return Array.from(_0x25e262?.children || []).filter(_0x4e7316 => _0x4e7316.classList?.contains("at-mention-item"));
}
function _clearActiveItems(_0x4c225f) {
  _getDirectMentionItems(_0x4c225f).forEach(_0x2fc5ca => {
    _0x2fc5ca.classList.remove("active");
    _0x2fc5ca.classList.remove("at-mention-keyboard-active");
  });
}
function _setActiveMentionItem(_0x357d7a, {
  focusSubmenu = false,
  keyboard = false
} = {}) {
  if (!_0x357d7a) {
    return;
  }
  const _0x2fd6f0 = _0x357d7a.parentElement;
  if (!_0x2fd6f0) {
    return;
  }
  _clearActiveItems(_0x2fd6f0);
  _0x357d7a.classList.add("active");
  _0x357d7a.classList.toggle("at-mention-keyboard-active", keyboard);
  _mentionMenuState.activeMenu = _0x2fd6f0;
  if (_0x357d7a.classList.contains("at-mention-has-submenu")) {
    _openMentionSubmenu(_0x357d7a, {
      focusSubmenu: focusSubmenu
    });
  } else {
    _closeSiblingMentionSubmenus(_0x357d7a);
  }
}
function _setInitialMentionActiveItem(_0x137a59, {
  keyboard = false
} = {}) {
  const _0x370425 = _getDirectMentionItems(_0x137a59).find(_0x4fb91f => !_0x4fb91f.classList.contains("at-mention-disabled")) || _getDirectMentionItems(_0x137a59)[0];
  if (_0x370425) {
    _setActiveMentionItem(_0x370425, {
      keyboard: keyboard
    });
  }
}
function _closeSiblingMentionSubmenus(_0x2e4138) {
  const _0x5f4926 = _0x2e4138?.parentElement;
  if (!_0x5f4926) {
    return;
  }
  _getDirectMentionItems(_0x5f4926).forEach(_0x1148c7 => {
    if (_0x1148c7 === _0x2e4138) {
      return;
    }
    _0x1148c7.classList.remove("at-mention-submenu-open");
    _0x1148c7.querySelectorAll(".at-mention-submenu-open").forEach(_0x5c400c => _0x5c400c.classList.remove("at-mention-submenu-open"));
  });
}
function _positionMentionSubmenu(_0x25c38c, _0x5f3066) {
  if (!_0x25c38c || !_0x5f3066 || typeof _0x25c38c.getBoundingClientRect !== "function") {
    return;
  }
  const _0x48c7be = _0x25c38c.getBoundingClientRect();
  const _0x5ca76d = Number(globalThis.window?.innerWidth || 0);
  const _0x219e20 = Number(globalThis.window?.innerHeight || 0);
  const _0x3adb4d = 6;
  const _0x2c1f3e = 12;
  const _0x292e02 = _0x5f3066.offsetWidth || 220;
  const _0x198dd9 = _0x5f3066.offsetHeight || 320;
  let _0x51839a = _0x48c7be.right + _0x3adb4d;
  if (_0x5ca76d > 0 && _0x51839a + _0x292e02 + _0x2c1f3e > _0x5ca76d) {
    _0x51839a = Math.max(_0x2c1f3e, _0x48c7be.left - _0x292e02 - _0x3adb4d);
  }
  let _0x33be94 = _0x48c7be.top;
  if (_0x219e20 > 0 && _0x33be94 + _0x198dd9 + _0x2c1f3e > _0x219e20) {
    _0x33be94 = Math.max(_0x2c1f3e, _0x219e20 - _0x198dd9 - _0x2c1f3e);
  }
  _0x5f3066.style.left = Math.round(_0x51839a) + "px";
  _0x5f3066.style.top = Math.round(_0x33be94) + "px";
  if (_0x219e20 > 0) {
    _0x5f3066.style.maxHeight = Math.max(160, _0x219e20 - _0x2c1f3e * 2) + "px";
  }
}
function _openMentionSubmenu(_0x22e122, {
  focusSubmenu = false
} = {}) {
  const _0x49f0f5 = Array.from(_0x22e122?.children || []).find(_0x34dca8 => _0x34dca8.classList?.contains("at-mention-submenu"));
  if (!_0x49f0f5) {
    return false;
  }
  _closeSiblingMentionSubmenus(_0x22e122);
  _0x22e122.classList.add("at-mention-submenu-open");
  _positionMentionSubmenu(_0x22e122, _0x49f0f5);
  if (focusSubmenu) {
    _mentionMenuState.activeMenu = _0x49f0f5;
    _setInitialMentionActiveItem(_0x49f0f5, {
      keyboard: true
    });
  } else {
    _mentionMenuState.activeMenu = _0x22e122.parentElement || _0x49f0f5;
  }
  return true;
}
function _activateMentionMenuItem(_0x5d064a) {
  if (!_0x5d064a) {
    return false;
  }
  if (_0x5d064a.classList.contains("at-mention-has-submenu")) {
    return _openMentionSubmenu(_0x5d064a, {
      focusSubmenu: true
    });
  }
  if (typeof _0x5d064a._mentionSelect === "function") {
    _0x5d064a._mentionSelect();
    return true;
  }
  return false;
}
function _createMentionMenuItem({
  label = "",
  subtitle = "",
  title = "",
  disabled = false,
  hasSubmenu = false,
  thumbUrl = "",
  thumbNode = null,
  iconType = "",
  badges = null,
  compactVisual = false,
  variantCount = 0,
  variantIndex = 0,
  onVariantChange = null,
  onSelect = null
} = {}) {
  const _0x331d06 = document.createElement("div");
  _0x331d06.className = "at-mention-item" + (disabled ? " at-mention-disabled disabled" : "") + (hasSubmenu ? " at-mention-has-submenu" : "") + (compactVisual ? " at-mention-compact-visual" : "");
  _0x331d06.title = title || "";
  const _0xbef5 = Math.max(0, Math.trunc(Number(variantCount) || 0));
  let _0x5ef751 = Math.max(0, Math.min(_0xbef5 - 1, Math.trunc(Number(variantIndex) || 0)));
  const _0x58e5f9 = a1074_0x44399a(iconType);
  let _0x81d957 = null;
  let _0x5170a8 = null;
  if (thumbUrl || thumbNode || _0xbef5 > 1 || _0x58e5f9 === "text" || _0x58e5f9 === "audio") {
    _0x81d957 = document.createElement("span");
    _0x81d957.className = "at-mention-visual";
    if (thumbUrl || _0xbef5 > 1) {
      _0x5170a8 = document.createElement("img");
      _0x5170a8.className = "at-mention-thumb";
      if (thumbUrl) {
        _0x5170a8.src = thumbUrl;
      }
      _0x5170a8.hidden = !thumbUrl;
      _0x5170a8.alt = "";
      _0x5170a8.draggable = false;
      _0x81d957.appendChild(_0x5170a8);
    } else {
      const _0x323463 = _cloneMentionThumbNode(thumbNode, "at-mention-thumb", iconType);
      if (_0x323463) {
        _0x81d957.appendChild(_0x323463);
      }
    }
    if (_0x81d957.childNodes.length) {
      _0x331d06.appendChild(_0x81d957);
    }
  }
  const _0x35ba8f = document.createElement("span");
  _0x35ba8f.className = "at-mention-copy";
  const _0x30f1d6 = document.createElement("span");
  _0x30f1d6.className = "at-mention-label";
  _0x30f1d6.textContent = label;
  _0x35ba8f.appendChild(_0x30f1d6);
  const _0x9ea733 = document.createElement("span");
  _0x9ea733.className = "at-mention-subtitle";
  _0x9ea733.textContent = subtitle;
  _0x9ea733.hidden = !subtitle;
  _0x35ba8f.appendChild(_0x9ea733);
  _0x331d06.classList.toggle("at-mention-has-subtitle", Boolean(subtitle));
  _0x331d06.appendChild(_0x35ba8f);
  if (Array.isArray(badges) && badges.length > 0) {
    const _0x393f51 = document.createElement("span");
    _0x393f51.className = "at-mention-badges";
    badges.slice(0, 4).forEach(_0x38b2cd => {
      const _0x107233 = document.createElement("span");
      _0x107233.className = "at-mention-badge";
      _0x107233.textContent = String(_0x38b2cd || "");
      _0x393f51.appendChild(_0x107233);
    });
    _0x331d06.appendChild(_0x393f51);
  }
  if (hasSubmenu) {
    const _0x1baba9 = document.createElement("span");
    _0x1baba9.className = "at-mention-arrow";
    _0x1baba9.textContent = ">";
    _0x331d06.appendChild(_0x1baba9);
  }
  let _0xa01c2a = null;
  let _0x163beb = null;
  if (_0xbef5 > 1) {
    const _0x37ba72 = document.createElement("span");
    _0x37ba72.className = "at-mention-variant-controls";
    _0xa01c2a = document.createElement("button");
    _0xa01c2a.type = "button";
    _0xa01c2a.className = "at-mention-variant-arrow at-mention-variant-arrow--previous";
    _0xa01c2a.setAttribute("aria-label", "上一个形象");
    _0x163beb = document.createElement("button");
    _0x163beb.type = "button";
    _0x163beb.className = "at-mention-variant-arrow at-mention-variant-arrow--next";
    _0x163beb.setAttribute("aria-label", "下一个形象");
    _0x37ba72.appendChild(_0xa01c2a);
    _0x37ba72.appendChild(_0x163beb);
    _0x331d06.appendChild(_0x37ba72);
  }
  const _0x5eb267 = () => {
    if (_0xa01c2a) {
      _0xa01c2a.hidden = _0x5ef751 <= 0;
    }
    if (_0x163beb) {
      _0x163beb.hidden = _0x5ef751 >= _0xbef5 - 1;
    }
    _0x331d06.dataset.mentionVariantIndex = String(_0x5ef751);
  };
  const _0x2dccbc = _0xac574b => {
    const _0x485546 = Math.max(0, Math.min(_0xbef5 - 1, Math.trunc(Number(_0xac574b) || 0)));
    if (_0xbef5 <= 1 || _0x485546 === _0x5ef751) {
      return false;
    }
    _0x5ef751 = _0x485546;
    _0x5eb267();
    onVariantChange?.(_0x5ef751);
    return true;
  };
  _0xa01c2a?.addEventListener("mousedown", _0x47f626 => {
    _0x47f626.preventDefault();
    _0x47f626.stopPropagation();
    _0x2dccbc(_0x5ef751 - 1);
  });
  _0x163beb?.addEventListener("mousedown", _0x35e342 => {
    _0x35e342.preventDefault();
    _0x35e342.stopPropagation();
    _0x2dccbc(_0x5ef751 + 1);
  });
  let _0x3abe19 = 0;
  if (_0xbef5 > 1) {
    _0x331d06.addEventListener("wheel", _0x117a19 => {
      const _0x2fd230 = Number(_0x117a19.deltaX || 0);
      const _0x59f9c5 = Number(_0x117a19.deltaY || 0);
      const _0x25faa3 = Math.abs(_0x2fd230) > Math.abs(_0x59f9c5) ? _0x2fd230 : _0x59f9c5;
      if (Math.abs(_0x25faa3) < 4) {
        return;
      }
      _0x117a19.preventDefault();
      _0x117a19.stopPropagation();
      const _0x2bc032 = Date.now();
      if (_0x2bc032 - _0x3abe19 < 160) {
        return;
      }
      _0x3abe19 = _0x2bc032;
      _0x2dccbc(_0x5ef751 + (_0x25faa3 > 0 ? 1 : -1));
    }, {
      passive: false
    });
  }
  _0x331d06._mentionSetPresentation = (_0x3ac8b9 = {}) => {
    _0x30f1d6.textContent = String(_0x3ac8b9.label || "");
    const _0x41acc1 = String(_0x3ac8b9.subtitle || "");
    _0x9ea733.textContent = _0x41acc1;
    _0x9ea733.hidden = !_0x41acc1;
    _0x331d06.classList.toggle("at-mention-has-subtitle", Boolean(_0x41acc1));
    if (_0x5170a8) {
      const _0x3eaa7c = String(_0x3ac8b9.thumbUrl || "");
      if (_0x3eaa7c) {
        _0x5170a8.src = _0x3eaa7c;
      } else {
        _0x5170a8.removeAttribute?.("src");
      }
      _0x5170a8.hidden = !_0x3eaa7c;
      _0x81d957.hidden = false;
    }
    if (Number.isFinite(Number(_0x3ac8b9.variantIndex))) {
      _0x5ef751 = Math.max(0, Math.min(_0xbef5 - 1, Math.trunc(Number(_0x3ac8b9.variantIndex))));
    }
    if (Object.hasOwn(_0x3ac8b9, "title")) {
      _0x331d06.title = String(_0x3ac8b9.title || "");
    }
    if (Object.hasOwn(_0x3ac8b9, "disabled")) {
      const _0x1d749f = _0x3ac8b9.disabled === true;
      _0x331d06.classList.toggle("at-mention-disabled", _0x1d749f);
      _0x331d06.classList.toggle("disabled", _0x1d749f);
    }
    _0x5eb267();
  };
  _0x331d06._mentionShiftVariant = _0x4cdb1f => _0x2dccbc(_0x5ef751 + Math.sign(Number(_0x4cdb1f) || 0));
  _0x5eb267();
  _0x331d06._mentionSelect = onSelect;
  _0x331d06.addEventListener("mouseenter", () => {
    _setActiveMentionItem(_0x331d06);
  });
  _0x331d06.addEventListener("mousedown", _0x441247 => {
    _0x441247.preventDefault();
    _0x441247.stopPropagation();
    _activateMentionMenuItem(_0x331d06);
  });
  return _0x331d06;
}
function _appendMentionCandidateItem(_0x2d6e90, _0x49f254, _0x20ea9d, {
  triggerRange = null,
  atIndex = -1,
  pillToEdit = null
} = {}) {
  const _0xc0f2d6 = Array.isArray(_0x20ea9d.mentionVariants) && _0x20ea9d.mentionVariants.length ? _0x20ea9d.mentionVariants.filter(Boolean) : [_0x20ea9d];
  let _0x3c7142 = Math.max(0, Math.min(_0xc0f2d6.length - 1, Math.trunc(Number(_0x20ea9d.mentionVariantIndex) || 0)));
  let _0x16c0d3 = _0xc0f2d6[_0x3c7142] || _0x20ea9d;
  let _0x9a74eb = null;
  let _0x41d1ca = false;
  let _0xe6dd7b = null;
  const _0x372921 = () => {
    _0x9a74eb?._mentionSetPresentation?.({
      label: _0x16c0d3.label || _0x20ea9d.label,
      subtitle: _0x16c0d3.subtitle || _0x20ea9d.subtitle || "",
      thumbUrl: _0x16c0d3.thumbUrl || "",
      variantIndex: _0x3c7142,
      title: _0x20ea9d.suppressTooltip ? "" : _0x16c0d3.limitReason || "",
      disabled: !!_0x16c0d3.limitReason
    });
  };
  _0x9a74eb = _createMentionMenuItem({
    label: _0x16c0d3.label || _0x20ea9d.label,
    subtitle: _0x16c0d3.subtitle || _0x20ea9d.subtitle || "",
    title: _0x20ea9d.suppressTooltip ? "" : _0x16c0d3.limitReason || "",
    disabled: !!_0x16c0d3.limitReason,
    thumbUrl: _0x16c0d3.thumbUrl || "",
    thumbNode: _0x16c0d3.thumbNode || null,
    iconType: _0x16c0d3.iconType || _0x16c0d3.type || "",
    compactVisual: _0x16c0d3.compactVisual === true,
    variantCount: _0xc0f2d6.length,
    variantIndex: _0x3c7142,
    onVariantChange: _0x17b6e6 => {
      _0x3c7142 = _0x17b6e6;
      _0x16c0d3 = _0xc0f2d6[_0x3c7142] || _0x20ea9d;
      _0x372921();
      if (_0x41d1ca && _0xe6dd7b && typeof _0x49f254?.onMentionCandidateHover === "function") {
        _0x49f254.onMentionCandidateHover({
          candidate: _0x16c0d3,
          item: _0x9a74eb,
          event: _0xe6dd7b
        });
      }
    },
    onSelect: () => {
      if (_0x16c0d3.limitReason) {
        globalThis.window?.showToast?.(_0x16c0d3.limitReason, "warn");
        return;
      }
      _insertMentionPill(_0x49f254, {
        label: _0x16c0d3.label,
        nodeId: _0x16c0d3.nodeId,
        candidate: _0x16c0d3,
        triggerRange: triggerRange,
        atIndex: atIndex,
        pillToEdit: pillToEdit
      });
      _closeMentionMenu();
    }
  });
  const _0x497b42 = () => {
    if (!_0x41d1ca) {
      return;
    }
    _0x41d1ca = false;
    _0xe6dd7b = null;
    _0x49f254?.onMentionCandidateHoverEnd?.({
      candidate: _0x16c0d3,
      item: _0x9a74eb
    });
  };
  const _0x3e2c38 = _0x2b5a96 => {
    if (typeof _0x49f254?.onMentionCandidateHover !== "function") {
      return;
    }
    _0xe6dd7b = _0x2b5a96;
    if (!_0x41d1ca) {
      const _0xe29a81 = _mentionMenuState.activeCandidateHoverEnd;
      _mentionMenuState.activeCandidateHoverEnd = null;
      _0xe29a81?.();
      _0x41d1ca = true;
      _mentionMenuState.activeCandidateHoverEnd = _0x497b42;
    }
    _0x49f254.onMentionCandidateHover({
      candidate: _0x16c0d3,
      item: _0x9a74eb,
      event: _0x2b5a96
    });
  };
  _0x9a74eb.addEventListener("mouseenter", _0x3e2c38);
  _0x9a74eb.addEventListener("mousemove", _0x3e2c38);
  _0x9a74eb.addEventListener("mouseleave", () => {
    if (_mentionMenuState.activeCandidateHoverEnd === _0x497b42) {
      _mentionMenuState.activeCandidateHoverEnd = null;
    }
    _0x497b42();
  });
  if (_0x20ea9d.assetName && !_0x20ea9d.limitReason && !_0x20ea9d.suppressTooltip) {
    _0x9a74eb.title = _0x20ea9d.assetName + " · " + _getAssetTypeMenuLabel(_0x20ea9d.type);
  }
  _0x2d6e90.appendChild(_0x9a74eb);
  return _0x9a74eb;
}
function _appendMentionSectionLabel(_0x4e7832, _0x40c49a) {
  const _0x323eec = document.createElement("div");
  _0x323eec.className = "at-mention-section-label";
  _0x323eec.textContent = String(_0x40c49a || "");
  _0x4e7832.appendChild(_0x323eec);
  return _0x323eec;
}
function _appendMentionGroupLabel(_0x2ec139, _0x55ced5) {
  const _0x27486b = document.createElement("div");
  _0x27486b.className = "at-mention-group-label";
  _0x27486b.textContent = String(_0x55ced5 || "");
  _0x2ec139.appendChild(_0x27486b);
  return _0x27486b;
}
function _getBulkAssetLimitReason(_0x4d966e, _0x232593 = [], _0x28b1b3 = null) {
  const _0x46735b = (Array.isArray(_0x232593) ? _0x232593 : []).filter(_0x55d510 => _0x55d510?.origin === "asset");
  if (!_0x46735b.length) {
    return nodePromptSharedText("assetUnavailable");
  }
  const _0x466833 = a1074_0x3a456e.getState();
  const _0x396aa2 = _0x466833.nodes?.[_0x4d966e?.nodeId] || _0x4d966e?._data || {};
  const _0x5093c7 = getTargetInputPolicy(_0x396aa2);
  if (_isAdvancedVoiceCloneTarget(_0x396aa2)) {
    const _0x5021ae = _getActualAudioInputKeysForTarget(_0x4d966e?.nodeId, _0x396aa2, _0x466833);
    const _0x5230ce = Number(_0x5093c7?.maxByKind?.audio);
    for (const _0x1eaffc of _0x46735b) {
      const _0x2dabb2 = a1074_0x44399a(_0x1eaffc.type);
      if (!_0x2dabb2) {
        continue;
      }
      if (_0x2dabb2 !== "audio") {
        const _0x404b4f = getInputLimitReason(_0x5093c7, _0x2dabb2, {});
        if (_0x404b4f) {
          return _0x404b4f;
        }
        continue;
      }
      const _0x528d51 = _getMentionAudioInputKey(_0x1eaffc);
      if (_0x528d51 && _0x5021ae.has(_0x528d51)) {
        continue;
      }
      if (Number.isFinite(_0x5230ce) && _0x5021ae.size >= _0x5230ce) {
        return getInputLimitReason(_0x5093c7, "audio", {
          audio: _0x5021ae.size
        });
      }
      if (_0x528d51) {
        _0x5021ae.add(_0x528d51);
      }
    }
    return "";
  }
  const _0xfa9891 = _getPromptInputCountState(_0x4d966e?.promptEl, _0x28b1b3 || null, {
    nodeData: _0x396aa2
  });
  const _0x4e8b93 = _0x466833.nodes || {};
  a1074_0x3a456e.getIncomingEdges(_0x4d966e?.nodeId).forEach(_0x30f53c => {
    const _0x236776 = resolveEffectiveInputKind(_0x4e8b93?.[_0x30f53c?.sourceId], _0x30f53c);
    _addInputCount(_0xfa9891, _0x236776, _getNodeInputCountKey(_0x30f53c?.sourceId, _0x236776));
  });
  for (const _0x12bc3b of _0x46735b) {
    const _0x559c = a1074_0x44399a(_0x12bc3b.type);
    if (!_0x559c) {
      continue;
    }
    if (_canReuseAlreadyCountedInputForLimit(_0x559c) && _isMentionAlreadyCounted(_0xfa9891, _0x12bc3b, _0x559c)) {
      continue;
    }
    const _0x37ed11 = getInputLimitReason(_0x5093c7, _0x559c, _0xfa9891.counts);
    if (_0x37ed11) {
      return _0x37ed11;
    }
    _addInputCount(_0xfa9891, _0x559c, _getMentionInputCountKey(_0x12bc3b, _0x559c));
  }
  return "";
}
function _createMentionPillForCandidate(_0x16a207, _0x3e483b = null) {
  const _0x3c5ee6 = document.createElement("span");
  _0x3c5ee6.className = "ref-pill";
  _0x3c5ee6.contentEditable = "false";
  const _0x314e13 = a1074_0x44399a(_0x16a207?.type);
  const _0x4555c1 = _stripMentionDisplayMarker(_0x16a207?.pillLabel || _0x16a207?.label || "");
  const _0xba188c = _stripMentionDisplayMarker(_0x16a207?.refLabel || _0x4555c1);
  _0x3c5ee6.dataset.label = _0x4555c1;
  if (_0x16a207?.origin === "asset") {
    _0x3c5ee6.dataset.refOrigin = "asset";
    _0x3c5ee6.dataset.assetId = String(_0x16a207.assetId || "");
    _0x3c5ee6.dataset.assetIndex = String(_0x16a207.assetIndex ?? "");
    _0x3c5ee6.dataset.refType = String(_0x314e13 || _0x16a207.type || "");
    _renderMentionPillContent(_0x3c5ee6, _0x4555c1, _getMentionVisual(_0x3e483b, _0x16a207, _0x3c5ee6));
    _applyMentionPillPresentation(_0x3c5ee6, _0x16a207);
    _decorateMentionPill(_0x3e483b, _0x3c5ee6, _0x16a207);
    return _0x3c5ee6;
  }
  _0x3c5ee6.dataset.refOrigin = "node";
  _0x3c5ee6.dataset.nodeId = String(_0x16a207?.nodeId || "");
  if (_0xba188c) {
    _0x3c5ee6.dataset.refLabel = _0xba188c;
  }
  if (_0x314e13 || _0x16a207?.type) {
    _0x3c5ee6.dataset.refType = String(_0x314e13 || _0x16a207.type || "");
  }
  _renderMentionPillContent(_0x3c5ee6, _0x4555c1, _getMentionVisual(_0x3e483b, _0x16a207, _0x3c5ee6));
  _applyMentionPillPresentation(_0x3c5ee6, _0x16a207);
  _decorateMentionPill(_0x3e483b, _0x3c5ee6, _0x16a207);
  return _0x3c5ee6;
}
function _applyMentionPillPresentation(_0xe1837d, _0x32372b = {}) {
  if (!_0xe1837d) {
    return;
  }
  const _0x4aaf4a = String(_0x32372b?.pillKind || "").trim();
  if (_0x4aaf4a) {
    _0xe1837d.dataset.promptPillKind = _0x4aaf4a;
  } else {
    delete _0xe1837d.dataset.promptPillKind;
  }
  _0xe1837d.classList?.toggle?.("story-time-pill", _0x4aaf4a === "time");
  const _0x4d05d0 = _0x32372b?.missingAsset === true;
  _0xe1837d.classList?.toggle?.("ref-pill--unresolved", _0x4d05d0);
  if (_0x4d05d0) {
    _0xe1837d.dataset.refUnresolved = "true";
    _0xe1837d.title = "缺少图片素材";
  } else {
    if (_0xe1837d.dataset?.refUnresolved === "true" && _0x32372b?.origin === "asset") {
      delete _0xe1837d.dataset.refUnresolved;
    }
    if (_0xe1837d.title === "缺少图片素材") {
      _0xe1837d.removeAttribute?.("title");
    }
  }
}
export function appendMentionPillToPrompt(_0x1683d7, _0x4bd04c, {
  focus = true
} = {}) {
  const _0x4ef6ab = _0x1683d7?.promptEl;
  if (!_0x4ef6ab || !_0x4bd04c) {
    return null;
  }
  const _0x13802d = _createMentionPillForCandidate(_0x4bd04c, _0x1683d7);
  _bindPromptPill(_0x1683d7, _0x13802d);
  const _0x8325db = Boolean(String(_0x4ef6ab.textContent || "").trim() || _0x4ef6ab.childNodes?.length);
  if (_0x8325db) {
    _0x4ef6ab.appendChild(document.createTextNode(" "));
  }
  _0x4ef6ab.appendChild(_0x13802d);
  const _0xd96545 = document.createTextNode("\xA0");
  _0x4ef6ab.appendChild(_0xd96545);
  _updatePromptHtml(_0x1683d7);
  if (focus) {
    const _0x584c6f = globalThis.window?.getSelection?.();
    const _0x5c3c12 = typeof globalThis.document?.createRange === "function" ? globalThis.document.createRange() : null;
    if (_0x584c6f && _0x5c3c12) {
      _0x5c3c12.setStart(_0xd96545, _0xd96545.textContent.length);
      _0x5c3c12.collapse(true);
      _0x584c6f.removeAllRanges();
      _0x584c6f.addRange(_0x5c3c12);
      _0x4ef6ab.focus?.();
    }
  }
  return _0x13802d;
}
function _insertMentionPills(_0x4a981e, _0x13384e = [], {
  triggerRange = null,
  atIndex = -1,
  pillToEdit = null
} = {}) {
  if (!_0x4a981e?.promptEl) {
    return false;
  }
  const _0x38b285 = (Array.isArray(_0x13384e) ? _0x13384e : []).filter(Boolean);
  if (!_0x38b285.length) {
    return false;
  }
  if (pillToEdit) {
    return _insertMentionPill(_0x4a981e, {
      candidate: _0x38b285[0],
      pillToEdit: pillToEdit
    });
  }
  const _0xc8559a = _0x38b285.filter(_0x24c709 => _shouldStoreMentionAsPromptAssetInput(_0x4a981e, _0x24c709));
  const _0x4e9198 = _0x38b285.filter(_0x3725e1 => !_shouldStoreMentionAsPromptAssetInput(_0x4a981e, _0x3725e1));
  if (!_0x4e9198.length) {
    const _0x45c1f5 = _appendPromptAssetInputRefRecords(_0x4a981e, _0xc8559a);
    if (!_consumeMentionTriggerText({
      triggerRange: triggerRange,
      atIndex: atIndex
    })) {
      return false;
    }
    return _commitPromptAndAssetInputRefs(_0x4a981e, _0x45c1f5);
  }
  const _0x1caa28 = window.getSelection();
  const _0x44603b = triggerRange || (_0x1caa28 && _0x1caa28.rangeCount ? _0x1caa28.getRangeAt(0) : null);
  if (!_0x44603b || _0x44603b.startContainer.nodeType !== Node.TEXT_NODE) {
    return false;
  }
  const _0xcc9ef2 = _0x44603b.startContainer;
  const _0xf65d72 = String(_0xcc9ef2.textContent || "");
  const _0x3f0595 = _0x44603b.startOffset;
  const _0x400d84 = Number.isFinite(atIndex) && atIndex >= 0 ? atIndex : _findLastMentionTriggerIndex(_0xf65d72, _0x3f0595);
  if (_0x400d84 < 0) {
    return false;
  }
  const _0x55f9d7 = document.createTextNode(_0xf65d72.slice(0, _0x400d84));
  const _0x569243 = document.createTextNode(_0xf65d72.slice(_0x3f0595));
  const _0x477caa = _0xcc9ef2.parentNode;
  if (!_0x477caa) {
    return false;
  }
  _0x477caa.replaceChild(_0x569243, _0xcc9ef2);
  const _0x2944ad = [];
  _0x4e9198.forEach((_0x2f393b, _0x1b1a41) => {
    if (_0x1b1a41 > 0) {
      _0x477caa.insertBefore(document.createTextNode("\xA0"), _0x569243);
    }
    const _0x1a56b8 = _createMentionPillForCandidate(_0x2f393b, _0x4a981e);
    _bindPromptPill(_0x4a981e, _0x1a56b8);
    _0x2944ad.push(_0x1a56b8);
    _0x477caa.insertBefore(_0x1a56b8, _0x569243);
  });
  _0x477caa.insertBefore(_0x55f9d7, _0x2944ad[0] || _0x569243);
  const _0x19bda9 = document.createRange();
  const _0x5670fa = _0x2944ad[_0x2944ad.length - 1];
  _0x19bda9.setStartAfter(_0x5670fa);
  _0x19bda9.collapse(true);
  _0x1caa28.removeAllRanges();
  _0x1caa28.addRange(_0x19bda9);
  if (_0xc8559a.length) {
    _commitPromptAndAssetInputRefs(_0x4a981e, _appendPromptAssetInputRefRecords(_0x4a981e, _0xc8559a));
  } else {
    _updatePromptHtml(_0x4a981e);
  }
  return true;
}
function _appendMentionDivider(_0x5da5e9) {
  const _0x4dcd9c = document.createElement("div");
  _0x4dcd9c.className = "at-mention-divider";
  _0x5da5e9.appendChild(_0x4dcd9c);
  return _0x4dcd9c;
}
function _createMentionSubmenu({
  leaf = false
} = {}) {
  const _0x2e2b82 = document.createElement("div");
  _0x2e2b82.className = "at-mention-menu at-mention-submenu" + (leaf ? " at-mention-leaf-submenu" : " at-mention-branch-submenu");
  _0x2e2b82.addEventListener("mouseenter", () => {
    _mentionMenuState.activeMenu = _0x2e2b82;
  });
  return _0x2e2b82;
}
function _populateMentionMenuTree(_0x2353b3, _0x3cd8d9, _0x3daab2, {
  triggerRange = null,
  atIndex = -1,
  pillToEdit = null
} = {}) {
  let _0x485f1d = "";
  let _0x22ae10 = "";
  let _0x4a160a = 0;
  _0x3daab2.nodeItems.forEach(_0x47e6eb => {
    const _0x17eabf = String(_0x47e6eb.menuGroup || "").trim();
    const _0x42e19e = String(_0x47e6eb.menuSection || "").trim();
    if (_0x17eabf && _0x17eabf !== _0x485f1d) {
      if (_0x4a160a > 0) {
        _appendMentionDivider(_0x2353b3);
      }
      _appendMentionGroupLabel(_0x2353b3, _0x17eabf);
      _0x22ae10 = "";
    }
    _0x485f1d = _0x17eabf;
    if (_0x42e19e && _0x42e19e !== _0x22ae10) {
      _appendMentionSectionLabel(_0x2353b3, _0x42e19e);
    }
    _0x22ae10 = _0x42e19e;
    _appendMentionCandidateItem(_0x2353b3, _0x3cd8d9, _0x47e6eb, {
      triggerRange: triggerRange,
      atIndex: atIndex,
      pillToEdit: pillToEdit
    });
    _0x4a160a += 1;
  });
  if (_0x3daab2.nodeItems.length && _0x3daab2.assetItems.length) {
    _appendMentionDivider(_0x2353b3);
  }
  _0x3daab2.assetItems.forEach(_0x1e943b => {
    const _0x500b70 = _createMentionMenuItem({
      label: _0x1e943b.label,
      subtitle: _0x1e943b.subtitle,
      hasSubmenu: true
    });
    const _0x5e8a96 = _createMentionSubmenu();
    if (!_0x1e943b.suppressBulkMention) {
      const _0x390068 = _getBulkAssetLimitReason(_0x3cd8d9, _0x1e943b.items, pillToEdit);
      const _0x115431 = _createMentionMenuItem({
        label: nodePromptSharedText("useEntireAsset"),
        title: _0x390068,
        disabled: !!_0x390068,
        onSelect: () => {
          if (_0x390068) {
            globalThis.window?.showToast?.(_0x390068, "warn");
            return;
          }
          _insertMentionPills(_0x3cd8d9, _0x1e943b.items, {
            triggerRange: triggerRange,
            atIndex: atIndex,
            pillToEdit: pillToEdit
          });
          _closeMentionMenu();
        }
      });
      _0x5e8a96.appendChild(_0x115431);
      _appendMentionDivider(_0x5e8a96);
    }
    _0x1e943b.items.forEach(_0x232e00 => {
      _appendMentionCandidateItem(_0x5e8a96, _0x3cd8d9, _0x232e00, {
        triggerRange: triggerRange,
        atIndex: atIndex,
        pillToEdit: pillToEdit
      });
    });
    _0x500b70.appendChild(_0x5e8a96);
    _0x2353b3.appendChild(_0x500b70);
  });
}
function _getMentionMenuPages(_0x17b604, _0x876a97 = []) {
  const _0x397a12 = typeof _0x17b604?.getMentionMenuPages === "function" ? _0x17b604.getMentionMenuPages({
    candidates: _0x876a97
  }) : [];
  if (!Array.isArray(_0x397a12) || _0x397a12.length < 2) {
    return [];
  }
  const _0x4edd00 = new Set();
  return _0x397a12.map(_0x49a817 => ({
    id: String(_0x49a817?.id || "").trim(),
    label: String(_0x49a817?.label || "").trim(),
    icon: ["assets", "tools"].includes(String(_0x49a817?.icon || "").trim()) ? String(_0x49a817.icon).trim() : ""
  })).filter(_0x950fd7 => {
    if (!_0x950fd7.id || !_0x950fd7.label || _0x4edd00.has(_0x950fd7.id)) {
      return false;
    }
    _0x4edd00.add(_0x950fd7.id);
    return true;
  });
}
function _createMentionMenuPageIcon(_0x4ef4ba) {
  const _0xb03570 = String(_0x4ef4ba || "").trim();
  if (!_0xb03570) {
    return null;
  }
  const _0xda6cbe = document.createElement("span");
  _0xda6cbe.className = "at-mention-tab-icon";
  _0xda6cbe.dataset.icon = _0xb03570;
  _0xda6cbe.setAttribute("aria-hidden", "true");
  _0xda6cbe.innerHTML = _0xb03570 === "tools" ? "<svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5l-7.7 7.7a2 2 0 1 0 2.8 2.8z\"/><path d=\"m16 15 4.5 4.5\"/></svg>" : "<svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M4 6.5h6l1.7 2H20v9.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/><path d=\"M4 9h16\"/></svg>";
  return _0xda6cbe;
}
function _appendMentionMenuPages(_0x425def, _0x11946b, _0x4e0f00, _0x165ff2) {
  const _0x15c54c = _getMentionMenuPages(_0x11946b, _0x4e0f00);
  if (_0x15c54c.length < 2) {
    return null;
  }
  const _0x300e6c = document.createElement("div");
  _0x300e6c.className = "at-mention-tabs";
  _0x300e6c.setAttribute("role", "tablist");
  _0x300e6c.setAttribute("aria-label", "@ 功能分类");
  _0x425def.appendChild(_0x300e6c);
  const _0x9db9a9 = document.createElement("div");
  _0x9db9a9.className = "at-mention-pages";
  const _0x3bd7c7 = document.createElement("div");
  _0x3bd7c7.className = "at-mention-pages-track";
  _0x3bd7c7.style.width = _0x15c54c.length * 100 + "%";
  _0x3bd7c7.style.gridTemplateColumns = "repeat(" + _0x15c54c.length + ", minmax(0, 1fr))";
  _0x9db9a9.appendChild(_0x3bd7c7);
  _0x425def.appendChild(_0x9db9a9);
  const _0x28e187 = String(_0x11946b?.getMentionMenuDefaultPage?.({
    candidates: _0x4e0f00
  }) || _0x15c54c[0].id).trim();
  const _0x4394fa = _0x15c54c.map(_0x4dba48 => {
    const _0x1d2fe7 = _0x4e0f00.filter(_0x3db3ac => String(_0x3db3ac?.menuPage || _0x15c54c[0].id).trim() === _0x4dba48.id);
    const _0xd108bb = document.createElement("button");
    _0xd108bb.type = "button";
    _0xd108bb.className = "at-mention-tab";
    const _0x1ba764 = _createMentionMenuPageIcon(_0x4dba48.icon);
    if (_0x1ba764) {
      _0xd108bb.appendChild(_0x1ba764);
    }
    const _0x5031fb = document.createElement("span");
    _0x5031fb.className = "at-mention-tab-label";
    _0x5031fb.textContent = _0x4dba48.label;
    _0xd108bb.appendChild(_0x5031fb);
    _0xd108bb.dataset.mentionPage = _0x4dba48.id;
    _0xd108bb.setAttribute("role", "tab");
    const _0x59f6c0 = document.createElement("div");
    _0x59f6c0.className = "at-mention-page";
    _0x59f6c0.dataset.mentionPagePanel = _0x4dba48.id;
    _0x59f6c0.setAttribute("role", "tabpanel");
    if (_0x1d2fe7.length) {
      _populateMentionMenuTree(_0x59f6c0, _0x11946b, _buildMentionMenuTree(_0x1d2fe7), _0x165ff2);
    } else {
      const _0x451b22 = document.createElement("div");
      _0x451b22.className = "at-mention-empty";
      _0x451b22.textContent = "没有匹配的内容";
      _0x59f6c0.appendChild(_0x451b22);
    }
    _0x300e6c.appendChild(_0xd108bb);
    _0x3bd7c7.appendChild(_0x59f6c0);
    return {
      ..._0x4dba48,
      button: _0xd108bb,
      panel: _0x59f6c0,
      hasCandidates: _0x1d2fe7.length > 0
    };
  });
  const _0x4283cb = _0x4394fa.find(_0xc9e40c => _0xc9e40c.id === _0x28e187);
  let _0x25b588 = _0x4283cb?.hasCandidates ? _0x4283cb : null;
  if (!_0x25b588) {
    _0x25b588 = _0x4394fa.find(_0x1283b1 => _0x1283b1.hasCandidates);
  }
  if (!_0x25b588) {
    _0x25b588 = _0x4283cb || _0x4394fa[0];
  }
  const _0xa770fa = (_0x60e100, {
    keyboard = false
  } = {}) => {
    if (!_0x60e100) {
      return;
    }
    const _0x4b4638 = _0x4394fa.indexOf(_0x60e100);
    _0x4394fa.forEach(_0x18b031 => {
      const _0x32e50c = _0x18b031 === _0x60e100;
      _0x18b031.button.classList.toggle("is-active", _0x32e50c);
      _0x18b031.button.setAttribute("aria-selected", String(_0x32e50c));
      _0x18b031.button.tabIndex = _0x32e50c ? 0 : -1;
      _0x18b031.panel.classList.toggle("is-active", _0x32e50c);
      _0x18b031.panel.setAttribute("aria-hidden", String(!_0x32e50c));
      _0x18b031.panel.inert = !_0x32e50c;
    });
    _0x3bd7c7.style.transform = "translateX(" + -_0x4b4638 * (100 / _0x4394fa.length) + "%)";
    _mentionMenuState.activeMenu = _0x60e100.panel;
    _setInitialMentionActiveItem(_0x60e100.panel, {
      keyboard: keyboard
    });
    _positionMentionMenu();
  };
  _0x4394fa.forEach(_0x3d9587 => {
    _0x3d9587.button.addEventListener("mousedown", _0x2b4ded => {
      _0x2b4ded.preventDefault();
      _0x2b4ded.stopPropagation();
      _0xa770fa(_0x3d9587);
    });
  });
  _0xa770fa(_0x25b588);
  return _0x25b588?.panel || null;
}
export function _populateMentionMenu(_0x993e47, {
  x: _0x5caa8d,
  y: _0x25f937,
  triggerRange = null,
  query = "",
  atIndex = -1,
  pillToEdit = null
} = {}) {
  const _0x59cf94 = _getMentionMenu();
  _cleanupMentionMenuLifecycle();
  const _0x241016 = _buildMentionCandidates(_0x993e47, query, {
    excludePill: pillToEdit || null
  });
  const _0x15707e = _buildMentionMenuTree(_0x241016);
  _0x59cf94.innerHTML = "";
  _0x59cf94.classList.remove("at-mention-paged");
  if (!_0x241016.length) {
    _closeMentionMenu();
    return false;
  }
  const _0x4a7857 = {
    triggerRange: triggerRange,
    atIndex: atIndex,
    pillToEdit: pillToEdit
  };
  const _0x2d4d7f = _appendMentionMenuPages(_0x59cf94, _0x993e47, _0x241016, _0x4a7857);
  if (_0x2d4d7f) {
    _0x59cf94.classList.add("at-mention-paged");
  } else {
    _populateMentionMenuTree(_0x59cf94, _0x993e47, _0x15707e, _0x4a7857);
  }
  _0x59cf94.style.display = "flex";
  _0x59cf94.style.pointerEvents = "auto";
  _0x59cf94.style.bottom = "";
  _0x59cf94.style.marginTop = "";
  _0x59cf94.style.marginBottom = "";
  _0x59cf94.style.transformOrigin = "";
  _mentionMenuPositionState = {
    menu: _0x59cf94,
    triggerRange: triggerRange,
    pillToEdit: pillToEdit,
    fallbackX: Number(_0x5caa8d),
    fallbackY: Number(_0x25f937)
  };
  _positionMentionMenu();
  _mentionMenuState.activeMenu = _0x2d4d7f || _0x59cf94;
  if (!_0x2d4d7f) {
    _setInitialMentionActiveItem(_0x59cf94);
  }
  _watchMentionViewport();
  _bindMentionOutsideDocClick(_0x59cf94);
  return true;
}
export function _checkAtTrigger(_0x43a58d, _0x43d22c) {
  if (deferPromptTriggerUntilCompositionEnd({
    event: _0x43d22c,
    promptEl: _0x43a58d?.promptEl,
    triggerKey: "mention",
    onCompositionEnd: () => _checkAtTrigger(_0x43a58d, {})
  })) {
    return false;
  }
  if (shouldSkipPromptTriggerForBulkInput(_0x43d22c)) {
    _closeMentionMenu();
    return false;
  }
  const _0x16de63 = window.getSelection();
  if (!_0x16de63.rangeCount) {
    return false;
  }
  const _0x610578 = _0x16de63.getRangeAt(0).cloneRange();
  if (_0x610578.startContainer.nodeType !== Node.TEXT_NODE) {
    _closeMentionMenu();
    return false;
  }
  const _0x27b6ed = String(_0x610578.startContainer.textContent || "").slice(0, _0x610578.startOffset);
  const _0x440c2b = _findLastMentionTriggerIndex(_0x27b6ed);
  if (_0x440c2b === -1) {
    _closeMentionMenu();
    return false;
  }
  const _0x115680 = _0x27b6ed.slice(_0x440c2b + 1);
  if (_0x115680.length > 20) {
    _closeMentionMenu();
    return false;
  }
  const _0x1051d1 = _0x610578.getBoundingClientRect();
  return _populateMentionMenu(_0x43a58d, {
    x: _0x1051d1.left,
    y: _0x1051d1.bottom + 5,
    triggerRange: _0x610578,
    query: _0x115680,
    atIndex: _0x440c2b
  });
}
export function _handleMentionMenuKeyboard(_0x5a8127) {
  const _0x423f3e = _getMentionMenu();
  if (_0x423f3e.style.display !== "flex") {
    return false;
  }
  const _0x20459e = _mentionMenuState.activeMenu || _0x423f3e;
  const _0x597595 = _getDirectMentionItems(_0x20459e);
  if (!_0x597595.length) {
    if (_0x5a8127.key === "Escape") {
      _0x5a8127.preventDefault();
      _closeMentionMenu();
      return true;
    }
    return false;
  }
  let _0x34b2f1 = _0x597595.findIndex(_0x2a9c19 => _0x2a9c19.classList.contains("active"));
  if (_0x34b2f1 < 0) {
    _0x34b2f1 = 0;
  }
  if (_0x5a8127.key === "ArrowDown") {
    _0x5a8127.preventDefault();
    _0x34b2f1 = _0x34b2f1 < _0x597595.length - 1 ? _0x34b2f1 + 1 : 0;
    _setActiveMentionItem(_0x597595[_0x34b2f1], {
      keyboard: true
    });
    _0x597595[_0x34b2f1]?.scrollIntoView({
      block: "nearest"
    });
    return true;
  }
  if (_0x5a8127.key === "ArrowUp") {
    _0x5a8127.preventDefault();
    _0x34b2f1 = _0x34b2f1 > 0 ? _0x34b2f1 - 1 : _0x597595.length - 1;
    _setActiveMentionItem(_0x597595[_0x34b2f1], {
      keyboard: true
    });
    _0x597595[_0x34b2f1]?.scrollIntoView({
      block: "nearest"
    });
    return true;
  }
  if (_0x5a8127.key === "ArrowRight") {
    _0x5a8127.preventDefault();
    if (_0x34b2f1 >= 0) {
      if (_0x597595[_0x34b2f1]?._mentionShiftVariant?.(1)) {
        _setActiveMentionItem(_0x597595[_0x34b2f1], {
          keyboard: true
        });
      } else {
        _openMentionSubmenu(_0x597595[_0x34b2f1], {
          focusSubmenu: true
        });
      }
    }
    return true;
  }
  if (_0x5a8127.key === "ArrowLeft") {
    _0x5a8127.preventDefault();
    if (_0x34b2f1 >= 0 && _0x597595[_0x34b2f1]?._mentionShiftVariant?.(-1)) {
      _setActiveMentionItem(_0x597595[_0x34b2f1], {
        keyboard: true
      });
      return true;
    }
    if (_0x20459e !== _0x423f3e && _0x20459e.parentElement) {
      const _0x32f358 = _0x20459e.parentElement;
      const _0x1b170f = _0x32f358.parentElement || _0x423f3e;
      _0x32f358.classList.remove("at-mention-submenu-open");
      _clearActiveItems(_0x1b170f);
      _0x32f358.classList.add("active");
      _0x32f358.classList.add("at-mention-keyboard-active");
      _mentionMenuState.activeMenu = _0x1b170f;
    }
    return true;
  }
  if (_0x5a8127.key === "Enter") {
    _0x5a8127.preventDefault();
    if (_0x34b2f1 >= 0) {
      _activateMentionMenuItem(_0x597595[_0x34b2f1]);
    }
    return true;
  }
  if (_0x5a8127.key === "Escape") {
    _0x5a8127.preventDefault();
    _closeMentionMenu();
    return true;
  }
  return false;
}
export function _bindPromptPill(_0x2adb16, _0x562b0c) {
  if (!_0x562b0c) {
    return;
  }
  _0x562b0c.querySelectorAll(".pill-del").forEach(_0x5d4dda => _0x5d4dda.remove());
  const _0x5acaee = _stripMentionDisplayMarker(String(_0x562b0c.dataset.label || _0x562b0c.textContent || "").replace(/[×✕✖]/g, ""));
  _0x562b0c.dataset.label = _0x5acaee;
  _renderMentionPillContent(_0x562b0c, _0x5acaee, _getMentionVisual(_0x2adb16, null, _0x562b0c));
  _decorateMentionPill(_0x2adb16, _0x562b0c, null);
  if (_0x562b0c.dataset?.promptPillKind === "time") {
    _0x562b0c.classList?.add?.("story-time-pill");
  }
  if (_0x562b0c.dataset?.refUnresolved === "true") {
    _0x562b0c.classList?.add?.("ref-pill--unresolved");
  }
  if (_isUnresolvedInputMentionPill(_0x562b0c)) {
    _0x562b0c.classList?.add?.("ref-pill--unresolved");
    _0x562b0c.title = "Input reference is not bound in this node.";
  }
  _0x562b0c.onmousedown = _0x799954 => {
    if (_0x799954.target?.closest?.("[data-prompt-pill-inline-editor=\"true\"]")) {
      _0x799954.stopPropagation();
      return;
    }
    _0x799954.preventDefault();
    _0x799954.stopPropagation();
    if (_0x2adb16?.onPromptPillActivate?.({
      pill: _0x562b0c,
      event: _0x799954
    }) === true) {
      return;
    }
    const _0x3a5b29 = _0x562b0c.getBoundingClientRect();
    _populateMentionMenu(_0x2adb16, {
      x: _0x3a5b29.left,
      y: _0x3a5b29.bottom + 5,
      pillToEdit: _0x562b0c,
      query: "",
      atIndex: -1,
      triggerRange: null
    });
  };
}
export function _rehydratePromptPills(_0x169b5c) {
  if (!_0x169b5c?.promptEl) {
    return;
  }
  _0x169b5c.promptEl.querySelectorAll(".ref-pill").forEach(_0x38a2b0 => {
    _bindPromptPill(_0x169b5c, _0x38a2b0);
  });
}
const CARET_SPACER_TEXT_RE = /^[\u00A0\u200B\u200C\u200D\uFEFF]*$/;
function _isCaretSpacerTextNode(_0x441387) {
  return !!_0x441387 && _0x441387.nodeType === Node.TEXT_NODE && !!CARET_SPACER_TEXT_RE.test(String(_0x441387.textContent || ""));
}
function _findRefPillNearNode(_0xe87ce, _0x40b44a) {
  let _0x386e2f = _0xe87ce || null;
  while (_0x386e2f) {
    if (_isRefPillNode(_0x386e2f)) {
      return _0x386e2f;
    }
    if (!_isCaretSpacerTextNode(_0x386e2f)) {
      return null;
    }
    _0x386e2f = _0x40b44a === "previous" ? _0x386e2f.previousSibling : _0x386e2f.nextSibling;
  }
  return null;
}
function _getSelectedRefPill(_0xd10f07) {
  const _0xa3e65 = _0xd10f07?.startContainer;
  const _0x371f58 = _0xd10f07?.endContainer;
  if (!_0xa3e65 || _0xa3e65 !== _0x371f58 || _0xa3e65.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  if (_0xd10f07.endOffset - _0xd10f07.startOffset !== 1) {
    return null;
  }
  if (_isRefPillNode(_0xa3e65.childNodes?.[_0xd10f07.startOffset])) {
    return _0xa3e65.childNodes[_0xd10f07.startOffset];
  } else {
    return null;
  }
}
export function _handlePillKeyboard(_0x2d1d01, _0x33a894) {
  if (!_0x2d1d01?.promptEl) {
    return false;
  }
  if (_0x33a894.key !== "Backspace" && _0x33a894.key !== "Delete") {
    return false;
  }
  const _0x277360 = window.getSelection();
  if (!_0x277360.rangeCount) {
    return false;
  }
  const _0x198a5f = _0x277360.getRangeAt(0);
  if (!_0x198a5f.collapsed) {
    const _0x170cb5 = _getSelectedRefPill(_0x198a5f);
    if (!_0x170cb5) {
      return false;
    }
    _0x33a894.preventDefault();
    _0x170cb5.remove();
    _updatePromptHtml(_0x2d1d01);
    return true;
  }
  const _0x2bb2ac = _0x198a5f.startContainer;
  const _0x4867eb = _0x198a5f.startOffset;
  let _0x325297 = null;
  if (_0x2bb2ac.nodeType === Node.TEXT_NODE) {
    const _0x232d0d = String(_0x2bb2ac.textContent || "");
    if (_0x33a894.key === "Backspace" && (_0x4867eb === 0 || CARET_SPACER_TEXT_RE.test(_0x232d0d.slice(0, _0x4867eb)))) {
      _0x325297 = _findRefPillNearNode(_0x2bb2ac.previousSibling, "previous");
      if (_0x325297 && _0x4867eb > 0) {
        _0x2bb2ac.textContent = _0x232d0d.slice(_0x4867eb);
      }
    } else if (_0x33a894.key === "Delete" && (_0x4867eb === _0x232d0d.length || CARET_SPACER_TEXT_RE.test(_0x232d0d.slice(_0x4867eb)))) {
      _0x325297 = _findRefPillNearNode(_0x2bb2ac.nextSibling, "next");
      if (_0x325297 && _0x4867eb < _0x232d0d.length) {
        _0x2bb2ac.textContent = _0x232d0d.slice(0, _0x4867eb);
      }
    }
  } else if (_0x2bb2ac.nodeType === Node.ELEMENT_NODE) {
    if (_0x33a894.key === "Backspace" && _0x4867eb > 0) {
      _0x325297 = _findRefPillNearNode(_0x2bb2ac.childNodes[_0x4867eb - 1], "previous");
    } else if (_0x33a894.key === "Delete" && _0x4867eb < _0x2bb2ac.childNodes.length) {
      _0x325297 = _findRefPillNearNode(_0x2bb2ac.childNodes[_0x4867eb], "next");
    }
  }
  if (_isRefPillNode(_0x325297)) {
    _0x33a894.preventDefault();
    _0x325297.remove();
    _updatePromptHtml(_0x2d1d01);
    return true;
  }
  return false;
}
export function _handlePillHover(_0x31b1e1, _0x17b08d) {
  const _0x514cf3 = _0x31b1e1.target.closest(".ref-pill");
  if (!_0x514cf3 || !_0x17b08d.refBarEl) {
    return;
  }
  const _0x2c7bce = _0x514cf3.dataset.nodeId;
  if (!_0x2c7bce) {
    return;
  }
  const _0x4a0950 = _0x17b08d.refBarEl.querySelector(".ref-thumb-wrap[data-source-id=\"" + _0x2c7bce + "\"]");
  if (_0x4a0950) {
    _0x4a0950.classList.add("highlight");
    _0x4a0950.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
  }
}
export function _handlePillOut(_0xdc506, _0x455ed5) {
  const _0x3f2103 = _0xdc506.target.closest(".ref-pill");
  if (!_0x3f2103 || !_0x455ed5.refBarEl) {
    return;
  }
  const _0x47d938 = _0x3f2103.dataset.nodeId;
  if (!_0x47d938) {
    return;
  }
  const _0x5bcb35 = _0x455ed5.refBarEl.querySelector(".ref-thumb-wrap[data-source-id=\"" + _0x47d938 + "\"]");
  if (_0x5bcb35) {
    _0x5bcb35.classList.remove("highlight");
  }
}
export function _syncEdgesOrderFromPills(_0x2697b4, {
  allowReorder = false
} = {}) {
  if (!allowReorder) {
    return false;
  }
  if (!_0x2697b4?.promptEl || typeof _0x2697b4.promptEl.querySelectorAll !== "function") {
    return false;
  }
  const _0x4d056c = Array.from(_0x2697b4.promptEl.querySelectorAll(".ref-pill"));
  if (_0x4d056c.length === 0) {
    return false;
  }
  const _0x49be69 = a1074_0x3a456e.getIncomingEdges(_0x2697b4.nodeId).filter(_0x4e7abe => !_0x4e7abe?.isGroupShared && _0x4e7abe?.targetId === _0x2697b4.nodeId);
  if (_0x49be69.length <= 1) {
    return false;
  }
  const _0x2c11ca = _0x4d056c.map(_0x307104 => _0x307104.dataset.nodeId).filter(Boolean);
  if (_0x2c11ca.length === 0) {
    return false;
  }
  const _0xbe2671 = _0x49be69.map(_0x48b561 => _0x48b561.id);
  const _0x494b28 = {};
  _0x49be69.forEach(_0x546681 => {
    if (!_0x494b28[_0x546681.sourceId]) {
      _0x494b28[_0x546681.sourceId] = [];
    }
    _0x494b28[_0x546681.sourceId].push(_0x546681);
  });
  const _0x28c383 = [];
  _0x2c11ca.forEach(_0x1180cd => {
    if (_0x494b28[_0x1180cd]?.length > 0) {
      _0x28c383.push(_0x494b28[_0x1180cd].shift());
    }
  });
  Object.values(_0x494b28).forEach(_0x1c520d => _0x28c383.push(..._0x1c520d));
  const _0x1366bd = _0x28c383.map(_0x198000 => _0x198000.id);
  if (JSON.stringify(_0xbe2671) !== JSON.stringify(_0x1366bd)) {
    _0x2697b4._isDraggingSorting = false;
    a1074_0x3a456e.updateEdgesBatch(_0xbe2671, _0x28c383);
    return true;
  }
  return false;
}
export function _syncPillLabels(_0x2fcc36, _0x5467fb) {
  if (!_0x2fcc36.promptEl) {
    return;
  }
  const _0x3d36f0 = _0x2fcc36.promptEl.querySelectorAll(".ref-pill");
  if (!_0x3d36f0.length) {
    return;
  }
  let _0x10aeee = false;
  let _0x5c8ef0 = {};
  try {
    _0x5c8ef0 = a1074_0x3a456e.getState?.()?.nodes || {};
  } catch {
    _0x5c8ef0 = {};
  }
  _0x3d36f0.forEach(_0x3441b5 => {
    if (_isAssetMentionPill(_0x3441b5)) {
      return;
    }
    const _0x5688a4 = _0x3441b5.dataset.nodeId;
    if (!_0x5688a4) {
      return;
    }
    if (_0x5467fb[_0x5688a4]) {
      const _0x171c83 = _0x5467fb[_0x5688a4];
      const _0x4945f8 = typeof _0x171c83 === "object" && _0x171c83 !== null ? _stripMentionDisplayMarker(_0x171c83.refLabel || _0x171c83.placeholderLabel || _0x171c83.label || "") : _stripMentionDisplayMarker(_0x171c83);
      const _0x51a8ea = typeof _0x171c83 === "object" && _0x171c83 !== null ? _stripMentionDisplayMarker(_0x171c83.displayLabel || "") : "";
      const _0x125467 = _0x51a8ea || _getNodeMentionDisplayLabel(_0x5c8ef0?.[_0x5688a4], _0x4945f8);
      const _0x229844 = _0x3441b5.querySelector?.(".ref-pill-label");
      const _0x30756b = String(_0x3441b5.dataset.label || _0x229844?.textContent || _0x3441b5.textContent || "").trim();
      const _0x4a7cc2 = _getPromptInputRefLabel(_0x3441b5);
      const _0x29549b = _getMentionVisual(_0x2fcc36, null, _0x3441b5);
      const _0x19b2d8 = _0x30756b !== _0x125467 || _0x4a7cc2 !== _0x4945f8 || !_0x3441b5.querySelector?.(".ref-pill-label") || !_isPillVisualCurrent(_0x3441b5, _0x29549b) || !!_0x3441b5.querySelector?.(".pill-del");
      if (_0x19b2d8) {
        _0x3441b5.dataset.label = _0x125467;
        if (_0x4945f8) {
          _0x3441b5.dataset.refLabel = _0x4945f8;
        }
        _renderMentionPillContent(_0x3441b5, _0x125467, _0x29549b);
        _0x10aeee = true;
      }
    } else {
      _0x3441b5.remove();
      _0x10aeee = true;
    }
  });
  if (_0x10aeee) {
    _updatePromptHtml(_0x2fcc36, {
      renderRefBar: false
    });
  }
}