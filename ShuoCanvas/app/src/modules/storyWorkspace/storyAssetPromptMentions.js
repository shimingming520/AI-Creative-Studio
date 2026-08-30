import { STORY_ASSET_STYLE_REFERENCE_MENTION } from "./storyAssetAppearances.js";
export const STORY_ASSET_STYLE_REFERENCE_PILL_KIND = "style-reference";
const STORY_ASSET_STYLE_REFERENCE_NODE_ID = "story-style-reference";
function normalizeText(_0xd93f51) {
  return String(_0xd93f51 || "").trim();
}
function escapeHtml(_0x2839cf) {
  return String(_0x2839cf ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeRegExp(_0x22f6f5) {
  return String(_0x22f6f5 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function buildStoryAssetStyleReferenceMentionCandidate(_0x46018f = {}, {
  query = ""
} = {}) {
  const _0x26b8d0 = normalizeText(_0x46018f.referenceImageUrl);
  const _0x397a87 = normalizeText(query).replace(/^@+/, "").toLowerCase();
  if (!_0x26b8d0 || _0x397a87 && !"风格参考".includes(_0x397a87)) {
    return null;
  }
  return {
    origin: "node",
    nodeId: STORY_ASSET_STYLE_REFERENCE_NODE_ID,
    type: "",
    label: "风格参考",
    pillLabel: "风格参考",
    refLabel: STORY_ASSET_STYLE_REFERENCE_MENTION,
    subtitle: "使用已上传的风格参考图",
    thumbUrl: _0x26b8d0,
    iconType: "image",
    pillKind: STORY_ASSET_STYLE_REFERENCE_PILL_KIND,
    suppressTooltip: true
  };
}
export function renderStoryAssetPromptMentions(_0x4ca21f = "", _0x408d80 = {}) {
  const _0x16267a = String(_0x4ca21f || "");
  if (!_0x16267a) {
    return "";
  }
  const _0x220457 = normalizeText(_0x408d80.referenceImageUrl);
  const _0x2a4b88 = new RegExp(escapeRegExp(STORY_ASSET_STYLE_REFERENCE_MENTION), "g");
  const _0x49fe98 = "<span class=\"ref-pill story-asset-style-reference-pill\" contenteditable=\"false\" data-label=\"风格参考\" data-ref-origin=\"node\" data-node-id=\"" + STORY_ASSET_STYLE_REFERENCE_NODE_ID + "\" data-ref-label=\"" + STORY_ASSET_STYLE_REFERENCE_MENTION + "\" data-prompt-pill-kind=\"" + STORY_ASSET_STYLE_REFERENCE_PILL_KIND + "\">" + (_0x220457 ? "<img class=\"ref-pill-thumb\" src=\"" + escapeHtml(_0x220457) + "\" alt=\"\" draggable=\"false\">" : "") + "<span class=\"ref-pill-label\">风格参考</span></span>";
  return escapeHtml(_0x16267a).replace(_0x2a4b88, _0x49fe98).replace(/\r\n?|\n/g, "<br>");
}
export function readStoryAssetPromptText(_0x152b41 = null) {
  if (!_0x152b41) {
    return "";
  }
  const _0x409119 = [];
  const _0x4d5198 = _0x4e35c0 => {
    if (_0x4e35c0) {
      _0x409119.push(String(_0x4e35c0));
    }
  };
  const _0x16c074 = (_0x4320c1, {
    root = false
  } = {}) => {
    const _0x5d1303 = Number(_0x4320c1?.nodeType);
    if (_0x5d1303 === 3) {
      _0x4d5198(_0x4320c1.textContent || "");
      return;
    }
    if (_0x5d1303 !== 1 && !root) {
      return;
    }
    if (!root && normalizeText(_0x4320c1?.dataset?.promptPillKind) === STORY_ASSET_STYLE_REFERENCE_PILL_KIND) {
      _0x4d5198(STORY_ASSET_STYLE_REFERENCE_MENTION);
      return;
    }
    const _0x59e13f = String(_0x4320c1?.tagName || "").toUpperCase();
    if (_0x59e13f === "BR") {
      _0x4d5198("\n");
      return;
    }
    const _0xd994f2 = !root && ["DIV", "P"].includes(_0x59e13f);
    if (_0xd994f2 && _0x409119.length && !_0x409119.at(-1).endsWith("\n")) {
      _0x4d5198("\n");
    }
    Array.from(_0x4320c1?.childNodes || []).forEach(_0x1edae6 => _0x16c074(_0x1edae6));
    if (_0xd994f2 && _0x409119.length && !_0x409119.at(-1).endsWith("\n")) {
      _0x4d5198("\n");
    }
  };
  _0x16c074(_0x152b41, {
    root: true
  });
  return _0x409119.join("").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").replace(/\n$/g, "");
}