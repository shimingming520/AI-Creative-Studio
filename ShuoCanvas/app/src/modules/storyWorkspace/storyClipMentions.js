import { normalizeStoryCharacterVoiceReference } from "./storyCharacterVoice.js";
import { buildStoryClipFrameMentionCandidates, resolveStoryClipFrameMentionRef, STORY_CLIP_FRAME_MENTION_PREFIX } from "./storyClipFrames.js";
import { deriveStoryEpisodeAssetSummary } from "./storyPlanningData.js";
const STORY_ASSET_NODE_PREFIX = "story-asset:";
const STORY_CHARACTER_VOICE_NODE_PREFIX = "story-character-voice:";
const STORY_TIME_MENTION_ASSET_ID = "story-meta:time";
const STORY_TIME_ICON_SVG = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"13\" r=\"8\"></circle><path d=\"M12 9v4l2.5 1.5\"></path><path d=\"M9 2h6\"></path><path d=\"M12 2v3\"></path></svg>";
function normalizeText(_0x5ad81a) {
  return String(_0x5ad81a || "").trim();
}
function escapeHtml(_0x20e64f) {
  return String(_0x20e64f ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeRegExp(_0x478f66) {
  return String(_0x478f66 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const STORY_H3_LITERAL_TAG_PATTERN = /(?:<|&(?:amp;)*(?:lt;|#0*60;|#x0*3c;)|＜)\s*((?:\/\s*)?d|scenetrans|cutoff|(?:Subject|Picture|Video|Audio)\s+\d+)\s*(?:>|&(?:amp;)*(?:gt;|#0*62;|#x0*3e;)|＞)/giu;
function normalizeStoryH3LiteralTag(_0x520949 = "") {
  const _0x5007a4 = normalizeText(_0x520949).replace(/\s+/gu, " ");
  if (/^\/\s*d$/iu.test(_0x5007a4)) {
    return "</d>";
  }
  if (/^d$/iu.test(_0x5007a4)) {
    return "<d>";
  }
  if (/^(scenetrans|cutoff)$/iu.test(_0x5007a4)) {
    return "<" + _0x5007a4.toLowerCase() + ">";
  }
  const _0x4d9d82 = _0x5007a4.match(/^(Subject|Picture|Video|Audio)\s+(\d+)$/iu);
  if (!_0x4d9d82) {
    return "";
  }
  const _0x6f9e4b = "" + _0x4d9d82[1][0].toUpperCase() + _0x4d9d82[1].slice(1).toLowerCase();
  return "<" + _0x6f9e4b + " " + _0x4d9d82[2] + ">";
}
function protectStoryH3LiteralTags(_0xa71324 = "") {
  const _0x55eb0e = [];
  const _0x76d5b2 = String(_0xa71324 || "").replace(STORY_H3_LITERAL_TAG_PATTERN, (_0x41a240, _0x24f326) => {
    const _0x5f0f86 = normalizeStoryH3LiteralTag(_0x24f326);
    if (!_0x5f0f86) {
      return _0x41a240;
    }
    const _0x2e7fd8 = "story-h3-tag-" + _0x55eb0e.length + "";
    _0x55eb0e.push({
      token: _0x2e7fd8,
      tag: _0x5f0f86
    });
    return _0x2e7fd8;
  });
  return {
    source: _0x76d5b2,
    restore: (_0x5c60c0 = "") => _0x55eb0e.reduce((_0x4f0db5, {
      token: _0x1754b3,
      tag: _0x3950ec
    }) => _0x4f0db5.split(_0x1754b3).join(escapeHtml(_0x3950ec)), String(_0x5c60c0 || ""))
  };
}
export function normalizeStoryClipTimeLabel(_0x32d896, _0x586312 = "3.0s") {
  const _0x2edecd = String(_0x32d896 ?? "").match(/-?\d+(?:\.\d+)?/);
  const _0x310b8c = Number(_0x2edecd?.[0]);
  if (!Number.isFinite(_0x310b8c) || _0x310b8c <= 0) {
    return _0x586312;
  }
  const _0x39ca11 = Math.min(999, Math.max(0.1, _0x310b8c));
  return _0x39ca11.toFixed(1) + "s";
}
function getStoryAssetMentionAppearance(_0xa18836 = {}) {
  const _0x102f31 = Array.isArray(_0xa18836.appearances) ? _0xa18836.appearances : [];
  const _0x4d100c = normalizeText(_0xa18836.baseAppearanceId);
  return _0x102f31.find(_0x460b6d => _0x4d100c && normalizeText(_0x460b6d?.id) === _0x4d100c) || _0x102f31.find(_0x4bb3e8 => normalizeText(_0x4bb3e8?.name) === "基础形象") || _0x102f31[0] || null;
}
function buildStoryAssetMentionId(_0x22be08 = "", _0x42fb95 = "") {
  return "" + STORY_ASSET_NODE_PREFIX + encodeURIComponent(normalizeText(_0x22be08)) + ":" + encodeURIComponent(normalizeText(_0x42fb95) || "__asset__");
}
function parseStoryAssetMentionId(_0x48f66e = "") {
  const _0x5324b2 = normalizeText(_0x48f66e);
  if (!_0x5324b2.startsWith(STORY_ASSET_NODE_PREFIX)) {
    return null;
  }
  const [_0x1a26a2 = "", _0x2c677b = ""] = _0x5324b2.slice(STORY_ASSET_NODE_PREFIX.length).split(":");
  try {
    const _0x3c1bea = decodeURIComponent(_0x1a26a2);
    const _0x2bfe88 = decodeURIComponent(_0x2c677b);
    if (_0x3c1bea) {
      return {
        assetId: _0x3c1bea,
        appearanceId: _0x2bfe88
      };
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function matchesQuery(_0x27b252 = {}, _0x581228 = "") {
  const _0x5e5f4a = normalizeText(_0x581228).replace(/^@+/, "").toLowerCase();
  if (!_0x5e5f4a) {
    return true;
  }
  const _0x278967 = Array.isArray(_0x27b252.mentionVariants) ? _0x27b252.mentionVariants : [];
  return [_0x27b252.label, _0x27b252.subtitle, _0x27b252.pillLabel, _0x27b252.assetName, _0x27b252.type, ..._0x278967.flatMap(_0x464a32 => [_0x464a32?.label, _0x464a32?.subtitle, _0x464a32?.pillLabel])].map(_0x4a8e17 => normalizeText(_0x4a8e17).toLowerCase()).some(_0x310878 => _0x310878.includes(_0x5e5f4a));
}
function getStoryAssetMentionSection(_0x1f0eeb) {
  if (_0x1f0eeb === "scene") {
    return "场景";
  }
  if (_0x1f0eeb === "prop") {
    return "道具";
  }
  return "角色";
}
function getStoryAssetMentionAppearances(_0x42dbf5 = {}) {
  const _0x4681c4 = Array.isArray(_0x42dbf5.appearances) ? _0x42dbf5.appearances.filter(Boolean) : [];
  const _0x4297f9 = getStoryAssetMentionAppearance(_0x42dbf5);
  if (_0x42dbf5.kind !== "character") {
    if (_0x4297f9) {
      return [_0x4297f9];
    } else {
      return [];
    }
  }
  if (!_0x4681c4.length) {
    if (_0x4297f9) {
      return [_0x4297f9];
    } else {
      return [];
    }
  }
  return [..._0x4681c4].sort((_0x5aec58, _0x4f8a9a) => Number(_0x4f8a9a === _0x4297f9) - Number(_0x5aec58 === _0x4297f9));
}
export function getStoryEpisodeMentionAssets(_0x1f066a = [], _0x1690b7 = null) {
  const _0x5ed9da = (Array.isArray(_0x1f066a) ? _0x1f066a : []).filter(_0x1b474c => _0x1b474c && ["character", "scene", "prop"].includes(_0x1b474c.kind));
  const _0x1830fb = deriveStoryEpisodeAssetSummary(_0x1690b7, _0x5ed9da);
  if (_0x1830fb.assetIds.length) {
    return _0x1830fb.assets;
  } else {
    return _0x5ed9da;
  }
}
function buildStoryClipAssetMentionCandidate({
  asset: _0x5ea6e3,
  appearance = null,
  allowAssetImageFallback = false
} = {}) {
  const _0x4fb018 = normalizeText(_0x5ea6e3?.name) || "本集素材";
  const _0x12b8af = normalizeText(appearance?.id);
  const _0x2690e7 = normalizeText(appearance?.name) || "基础形象";
  const _0x5b4557 = normalizeText(appearance?.imageUrl || (allowAssetImageFallback ? _0x5ea6e3?.imageUrl : ""));
  return {
    origin: "asset",
    menuDirect: true,
    suppressTooltip: true,
    assetId: buildStoryAssetMentionId(_0x5ea6e3?.id, _0x12b8af),
    assetIndex: 0,
    type: "image",
    label: _0x4fb018,
    subtitle: _0x2690e7,
    pillLabel: _0x4fb018 + " · " + _0x2690e7,
    thumbUrl: _0x5b4557,
    iconType: "image",
    storyAssetId: normalizeText(_0x5ea6e3?.id),
    storyAppearanceId: _0x12b8af,
    storyAssetKind: normalizeText(_0x5ea6e3?.kind),
    menuPage: "assets",
    menuGroup: "本集素材",
    menuSection: getStoryAssetMentionSection(_0x5ea6e3?.kind),
    assetName: "本集素材",
    missingAsset: !_0x5b4557
  };
}
export function buildStoryClipMentionCandidates({
  assets = [],
  episode = null,
  libraryCandidates = [],
  clipFrames = [],
  query = "",
  includeTime = false,
  includeClipFrames = false,
  defaultDuration = "3.0s"
} = {}) {
  const _0x278a6f = new Map([["character", 0], ["scene", 1], ["prop", 2]]);
  const _0x218fd2 = [...getStoryEpisodeMentionAssets(assets, episode)].sort((_0x8c25bf, _0x13c960) => (_0x278a6f.get(_0x8c25bf?.kind) ?? 9) - (_0x278a6f.get(_0x13c960?.kind) ?? 9)).map(_0x970613 => {
    const _0x43183b = getStoryAssetMentionAppearances(_0x970613);
    const _0x5633e7 = _0x43183b.length ? _0x43183b.map(_0x26a313 => buildStoryClipAssetMentionCandidate({
      asset: _0x970613,
      appearance: _0x26a313
    })) : [buildStoryClipAssetMentionCandidate({
      asset: _0x970613,
      appearance: null,
      allowAssetImageFallback: true
    })];
    const _0x4055ce = normalizeText(query).replace(/^@+/, "").toLowerCase();
    const _0x291394 = _0x4055ce ? _0x5633e7.findIndex(_0x54e862 => [_0x54e862.subtitle, _0x54e862.pillLabel].some(_0x251c99 => normalizeText(_0x251c99).toLowerCase().includes(_0x4055ce))) : -1;
    const _0x4cec1a = _0x291394 >= 0 ? _0x291394 : 0;
    const _0x789b50 = _0x5633e7[_0x4cec1a] || _0x5633e7[0];
    return {
      ..._0x789b50,
      mentionVariants: _0x5633e7,
      mentionVariantIndex: _0x4cec1a
    };
  });
  const _0x3c856d = (Array.isArray(libraryCandidates) ? libraryCandidates : []).map(_0x2fa1ff => ({
    ..._0x2fa1ff,
    origin: "asset",
    menuDirect: true,
    menuPage: "assets",
    menuGroup: "全部素材",
    menuSection: "",
    suppressTooltip: true,
    assetIndex: Number(_0x2fa1ff?.itemIndex || 0),
    label: normalizeText(_0x2fa1ff?.insertLabel || _0x2fa1ff?.label || _0x2fa1ff?.name) || "素材库内容",
    assetName: normalizeText(_0x2fa1ff?.assetName) || "素材库",
    iconType: normalizeText(_0x2fa1ff?.type)
  }));
  const _0x49e618 = includeTime ? [{
    origin: "asset",
    menuDirect: true,
    suppressTooltip: true,
    assetId: STORY_TIME_MENTION_ASSET_ID,
    assetIndex: 0,
    type: "",
    label: "添加时间",
    subtitle: "设置当前片段在提示词中的生成时长",
    pillLabel: normalizeStoryClipTimeLabel(defaultDuration),
    pillKind: "time",
    iconType: "",
    assetName: "片段设置",
    menuPage: "tools",
    menuSection: "",
    compactVisual: true
  }] : [];
  const _0x483337 = includeClipFrames || clipFrames.length ? buildStoryClipFrameMentionCandidates(clipFrames, {
    query: query,
    clips: episode?.clips,
    episodeId: episode?.id
  }) : [];
  return [..._0x218fd2, ..._0x3c856d, ..._0x49e618, ..._0x483337].filter(_0x2ed5d5 => matchesQuery(_0x2ed5d5, query));
}
function renderStoryAssetMentionPill(_0x54b315) {
  const _0x1348b0 = normalizeText(_0x54b315?.pillLabel || _0x54b315?.label) || "本集素材";
  const _0x40e16d = _0x54b315?.missingAsset === true;
  const _0x5afe69 = normalizeText(_0x54b315?.storyAssetId);
  const _0xc7eb54 = normalizeText(_0x54b315?.storyAppearanceId);
  const _0x1afda5 = _0x54b315?.thumbUrl ? "<img class=\"ref-pill-thumb\" src=\"" + escapeHtml(_0x54b315.thumbUrl) + "\" alt=\"\" draggable=\"false\">" : "";
  return "<span class=\"ref-pill" + (_0x40e16d ? " ref-pill--unresolved" : "") + "\" contenteditable=\"false\" data-label=\"" + escapeHtml(_0x1348b0) + "\" data-ref-origin=\"asset\" data-asset-id=\"" + escapeHtml(_0x54b315.assetId) + "\" data-asset-index=\"0\" data-ref-type=\"image\"" + (_0x5afe69 ? " data-story-asset-hover-id=\"" + escapeHtml(_0x5afe69) + "\"" : "") + (_0xc7eb54 ? " data-story-asset-hover-appearance-id=\"" + escapeHtml(_0xc7eb54) + "\"" : "") + (_0x40e16d ? " data-ref-unresolved=\"true\" data-tooltip=\"缺少图片素材\"" : "") + ">" + _0x1afda5 + "<span class=\"ref-pill-label\">" + escapeHtml(_0x1348b0) + "</span></span>";
}
function renderStoryTimeMentionPill(_0x39c912) {
  const _0x26b2f8 = normalizeStoryClipTimeLabel(_0x39c912);
  return "<span class=\"ref-pill story-time-pill\" contenteditable=\"false\" data-label=\"" + escapeHtml(_0x26b2f8) + "\" data-ref-origin=\"asset\" data-asset-id=\"" + STORY_TIME_MENTION_ASSET_ID + "\" data-asset-index=\"0\" data-prompt-pill-kind=\"time\"><span class=\"story-time-pill-icon\" aria-hidden=\"true\">" + STORY_TIME_ICON_SVG + "</span><span class=\"ref-pill-label\">" + escapeHtml(_0x26b2f8) + "</span></span>";
}
export function createStoryClipTimeMentionIcon(_0x343fee = globalThis.document) {
  const _0x5e0f9b = _0x343fee?.createElement?.("span");
  if (!_0x5e0f9b) {
    return null;
  }
  _0x5e0f9b.className = "story-time-pill-icon";
  _0x5e0f9b.setAttribute?.("aria-hidden", "true");
  _0x5e0f9b.innerHTML = STORY_TIME_ICON_SVG;
  return _0x5e0f9b;
}
export function beginStoryClipTimePillEdit({
  pill: _0x25bfa5,
  documentObject = globalThis.document,
  onCommit = null
} = {}) {
  if (!_0x25bfa5 || !documentObject?.createElement) {
    return null;
  }
  const _0x71e195 = _0x25bfa5.querySelector?.(".story-time-pill-input");
  if (_0x71e195) {
    _0x71e195.focus?.();
    _0x71e195.select?.();
    return _0x71e195;
  }
  const _0x3100bf = _0x25bfa5.querySelector?.(".ref-pill-label");
  if (!_0x3100bf || typeof _0x25bfa5.replaceChild !== "function") {
    return null;
  }
  const _0x117609 = normalizeStoryClipTimeLabel(_0x25bfa5.dataset?.label || _0x3100bf.textContent);
  const _0x3337d5 = documentObject.createElement("input");
  _0x3337d5.className = "story-time-pill-input";
  _0x3337d5.type = "text";
  _0x3337d5.inputMode = "decimal";
  _0x3337d5.value = _0x117609.replace(/s$/i, "");
  _0x3337d5.autocomplete = "off";
  _0x3337d5.spellcheck = false;
  _0x3337d5.dataset.promptPillInlineEditor = "true";
  _0x3337d5.setAttribute?.("aria-label", "片段时间（秒）");
  let _0x36232d = false;
  const _0xdfa09a = _0x3b08c4 => {
    if (_0x36232d) {
      return;
    }
    _0x36232d = true;
    const _0x4d50c9 = _0x3b08c4 ? normalizeStoryClipTimeLabel(_0x3337d5.value, _0x117609) : _0x117609;
    const _0x257966 = documentObject.createElement("span");
    _0x257966.className = "ref-pill-label";
    _0x257966.textContent = _0x4d50c9;
    if (_0x3337d5.parentNode === _0x25bfa5) {
      _0x25bfa5.replaceChild(_0x257966, _0x3337d5);
    }
    _0x25bfa5.dataset.label = _0x4d50c9;
    _0x25bfa5.classList?.remove?.("is-editing");
    if (_0x3b08c4 && _0x4d50c9 !== _0x117609 && typeof onCommit === "function") {
      onCommit(_0x4d50c9);
    }
  };
  _0x3337d5.addEventListener?.("keydown", _0x9b1d9b => {
    if (_0x9b1d9b.key === "Enter") {
      _0x9b1d9b.preventDefault?.();
      _0xdfa09a(true);
      return;
    }
    if (_0x9b1d9b.key === "Escape") {
      _0x9b1d9b.preventDefault?.();
      _0xdfa09a(false);
    }
  });
  _0x3337d5.addEventListener?.("blur", () => _0xdfa09a(true));
  _0x25bfa5.replaceChild(_0x3337d5, _0x3100bf);
  _0x25bfa5.classList?.add?.("is-editing");
  _0x3337d5.focus?.();
  _0x3337d5.select?.();
  return _0x3337d5;
}
export function resolveStoryClipPromptPillPresentation(_0x5afe45, _0xc4c14e = [], _0x41c7cb = []) {
  const _0x11f2ca = normalizeText(_0x5afe45?.dataset?.assetId || _0x5afe45?.getAttribute?.("data-asset-id"));
  const _0x4b9b2d = normalizeText(_0x5afe45?.dataset?.promptPillKind || _0x5afe45?.getAttribute?.("data-prompt-pill-kind"));
  if (_0x4b9b2d === "time" || _0x11f2ca === STORY_TIME_MENTION_ASSET_ID) {
    return {
      pillKind: "time",
      missingAsset: false
    };
  }
  if (_0x11f2ca.startsWith(STORY_CLIP_FRAME_MENTION_PREFIX)) {
    return {
      pillKind: "frame",
      missingAsset: !resolveStoryClipFrameMentionRef(_0x5afe45, _0x41c7cb)
    };
  }
  if (!_0x11f2ca.startsWith(STORY_ASSET_NODE_PREFIX)) {
    return {
      pillKind: "",
      missingAsset: false
    };
  }
  return {
    pillKind: "",
    missingAsset: !resolveStoryClipAssetMentionRef(_0x5afe45, _0xc4c14e)
  };
}
export function syncStoryClipPromptPillPresentation(_0x19b08a, _0x3cacf2 = [], _0x97b234 = []) {
  _0x19b08a?.querySelectorAll?.(".ref-pill")?.forEach?.(_0x54af9c => {
    syncStoryClipPromptPillHoverTarget(_0x54af9c);
    const _0x433570 = resolveStoryClipPromptPillPresentation(_0x54af9c, _0x3cacf2, _0x97b234);
    if (_0x433570.pillKind === "time") {
      _0x54af9c.dataset.promptPillKind = "time";
      _0x54af9c.classList?.add?.("story-time-pill");
    }
    if (_0x433570.missingAsset) {
      _0x54af9c.dataset.refUnresolved = "true";
      _0x54af9c.classList?.add?.("ref-pill--unresolved");
      _0x54af9c.setAttribute?.("data-tooltip", "缺少图片素材");
      _0x54af9c.removeAttribute?.("title");
      return;
    }
    const _0x46a0b7 = normalizeText(_0x54af9c?.dataset?.assetId);
    if (_0x46a0b7.startsWith(STORY_ASSET_NODE_PREFIX) || _0x46a0b7.startsWith(STORY_CLIP_FRAME_MENTION_PREFIX)) {
      delete _0x54af9c.dataset.refUnresolved;
      _0x54af9c.classList?.remove?.("ref-pill--unresolved");
      _0x54af9c.removeAttribute?.("data-tooltip");
      _0x54af9c.removeAttribute?.("data-native-title");
      _0x54af9c.removeAttribute?.("data-tooltip-source");
      _0x54af9c.removeAttribute?.("title");
    }
  });
}
export function renderStoryClipPromptMentions(_0x539caa, {
  assets = [],
  episode = null,
  clipFrames = []
} = {}) {
  const _0x3f49de = protectStoryH3LiteralTags(_0x539caa);
  const _0xbae335 = _0x3f49de.source;
  if (!_0xbae335) {
    return _0xbae335;
  }
  const _0x440ed0 = buildStoryClipMentionCandidates({
    assets: assets,
    episode: episode,
    clipFrames: clipFrames
  });
  const _0x198b24 = new Map();
  _0x440ed0.forEach(_0x3e6b02 => {
    const _0x123308 = normalizeText(_0x3e6b02.label);
    if (_0x123308 && !_0x198b24.has(_0x123308)) {
      _0x198b24.set(_0x123308, _0x3e6b02);
    }
    const _0x105c76 = Array.isArray(_0x3e6b02.mentionVariants) ? _0x3e6b02.mentionVariants : [];
    _0x105c76.forEach(_0x41edfb => {
      const _0x162428 = normalizeText(_0x41edfb?.pillLabel || _0x41edfb?.label);
      if (_0x162428) {
        _0x198b24.set(_0x162428, _0x41edfb);
      }
    });
  });
  const _0x534d4c = [..._0x198b24.keys()].filter(Boolean).sort((_0x354872, _0x497089) => _0x497089.length - _0x354872.length);
  const _0x2c5fce = _0x534d4c.length ? "@(?:" + _0x534d4c.map(escapeRegExp).join("|") + ")" : "(?!)";
  const _0x36c7b8 = new RegExp("(" + _0x2c5fce + ")|(⏱\\s*-?\\d+(?:\\.\\d+)?\\s*(?:s|秒))", "gi");
  const _0x58c87e = (_0x264257, {
    escapeText = true
  } = {}) => {
    _0x36c7b8.lastIndex = 0;
    let _0x54f0d8 = 0;
    let _0x2afe10 = "";
    let _0x1d5389 = null;
    const _0x17e296 = _0x37bfa4 => escapeText ? escapeHtml(_0x37bfa4) : _0x37bfa4;
    while (_0x1d5389 = _0x36c7b8.exec(_0x264257)) {
      _0x2afe10 += _0x17e296(_0x264257.slice(_0x54f0d8, _0x1d5389.index));
      if (_0x1d5389[1]) {
        const _0x2a462b = _0x1d5389[1].slice(1);
        const _0x5d1fa0 = _0x198b24.get(_0x2a462b);
        _0x2afe10 += _0x5d1fa0 ? renderStoryAssetMentionPill(_0x5d1fa0) : _0x17e296(_0x1d5389[0]);
      } else {
        _0x2afe10 += renderStoryTimeMentionPill(_0x1d5389[2]);
      }
      _0x54f0d8 = _0x1d5389.index + _0x1d5389[0].length;
    }
    _0x2afe10 += _0x17e296(_0x264257.slice(_0x54f0d8));
    return _0x2afe10;
  };
  if (/<[a-z][\s\S]*>/i.test(_0xbae335)) {
    return _0x3f49de.restore(_0xbae335.split(/(<[^>]+>)/gu).map(_0x2ee1dd => _0x2ee1dd.startsWith("<") ? _0x2ee1dd : _0x58c87e(_0x2ee1dd, {
      escapeText: false
    })).join(""));
  }
  return _0x3f49de.restore(_0x58c87e(_0xbae335));
}
export function resolveStoryClipPromptAssetRefs(_0x3f3eec, {
  assets = [],
  episode = null,
  clipFrames = [],
  resolveExternalAssetRef = null,
  voiceAssetIds = null
} = {}) {
  const _0x5062b4 = renderStoryClipPromptMentions(_0x3f3eec, {
    assets: assets,
    episode: episode,
    clipFrames: clipFrames
  });
  const _0x2f2539 = /<span\b[^>]*\bclass\s*=\s*(["'])[^"']*\bref-pill\b[^"']*\1[^>]*>/gi;
  const _0x2a41e6 = (_0x4f0f29, _0x1d3f23) => {
    const _0x44750d = _0x4f0f29.match(new RegExp("\\b" + _0x1d3f23 + "\\s*=\\s*([\"'])(.*?)\\1", "i"));
    return normalizeText(_0x44750d?.[2]).replace(/&quot;/gi, "\"").replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&");
  };
  const _0x3f864f = [];
  const _0x447c1c = new Set();
  const _0x13a438 = voiceAssetIds == null ? null : new Set([...voiceAssetIds].map(normalizeText).filter(Boolean));
  let _0x476c79 = null;
  while (_0x476c79 = _0x2f2539.exec(_0x5062b4)) {
    const _0x352bf6 = _0x476c79[0];
    const _0x4b9a0b = _0x2a41e6(_0x352bf6, "data-asset-id");
    if (!_0x4b9a0b) {
      continue;
    }
    const _0x32a45e = getStoryAssetIdFromMentionNodeId(_0x4b9a0b);
    const _0x2c0f55 = _0x4b9a0b.startsWith(STORY_ASSET_NODE_PREFIX) ? resolveStoryClipAssetMentionRefs({
      dataset: {
        assetId: _0x4b9a0b
      }
    }, assets, {
      voiceEnabled: _0x13a438 && !_0x13a438.has(_0x32a45e) ? false : getStoryEpisodeCharacterVoiceEnabled(episode, _0x32a45e)
    }) : _0x4b9a0b.startsWith(STORY_CLIP_FRAME_MENTION_PREFIX) ? resolveStoryClipFrameMentionRef({
      dataset: {
        assetId: _0x4b9a0b
      }
    }, clipFrames) : typeof resolveExternalAssetRef === "function" ? resolveExternalAssetRef({
      assetId: _0x4b9a0b,
      itemIndex: Number(_0x2a41e6(_0x352bf6, "data-asset-index"))
    }) : null;
    (Array.isArray(_0x2c0f55) ? _0x2c0f55 : [_0x2c0f55]).filter(Boolean).forEach(_0x307daf => {
      const _0x4f8af5 = normalizeText(_0x307daf?.type || _0x307daf?.kind);
      const _0x448414 = normalizeText(_0x307daf?.url);
      if (!_0x4f8af5 || !_0x448414) {
        return;
      }
      const _0x3d18cb = _0x4f8af5 + ":" + _0x448414;
      if (_0x447c1c.has(_0x3d18cb)) {
        return;
      }
      _0x447c1c.add(_0x3d18cb);
      _0x3f864f.push(_0x307daf);
    });
  }
  return _0x3f864f;
}
export function getStoryAssetIdFromMentionNodeId(_0x52bbf4 = "") {
  return parseStoryAssetMentionId(_0x52bbf4)?.assetId || "";
}
export function getStoryEpisodeCharacterVoiceEnabled(_0x412c47 = {}, _0x2b506e = "") {
  const _0x200065 = normalizeText(_0x2b506e);
  const _0x25fd3d = _0x412c47?.characterVoiceEnabledByAssetId;
  if (!_0x200065 || !_0x25fd3d || typeof _0x25fd3d !== "object" || Array.isArray(_0x25fd3d) || typeof _0x25fd3d[_0x200065] !== "boolean") {
    return undefined;
  }
  return _0x25fd3d[_0x200065];
}
export function setStoryEpisodeCharacterVoiceEnabled(_0x241748 = {}, _0x33efc1 = "", _0x30c358 = false) {
  if (!_0x241748 || typeof _0x241748 !== "object" || Array.isArray(_0x241748)) {
    return false;
  }
  const _0x59b8d6 = normalizeText(_0x33efc1);
  if (!_0x59b8d6) {
    return false;
  }
  const _0x595773 = _0x241748.characterVoiceEnabledByAssetId;
  _0x241748.characterVoiceEnabledByAssetId = {
    ...(_0x595773 && typeof _0x595773 === "object" && !Array.isArray(_0x595773) ? _0x595773 : {}),
    [_0x59b8d6]: _0x30c358 === true
  };
  return true;
}
export function syncStoryClipPromptPillHoverTarget(_0x3d607b) {
  if (!_0x3d607b?.dataset) {
    return "";
  }
  const _0x335c63 = parseStoryAssetMentionId(_0x3d607b.dataset.assetId);
  const _0x9eefd5 = _0x335c63?.assetId || "";
  const _0x2411a1 = _0x335c63?.appearanceId === "__asset__" ? "" : _0x335c63?.appearanceId || "";
  if (_0x9eefd5) {
    _0x3d607b.dataset.storyAssetHoverId = _0x9eefd5;
  } else {
    delete _0x3d607b.dataset.storyAssetHoverId;
  }
  if (_0x2411a1) {
    _0x3d607b.dataset.storyAssetHoverAppearanceId = _0x2411a1;
  } else {
    delete _0x3d607b.dataset.storyAssetHoverAppearanceId;
  }
  return _0x9eefd5;
}
export function resolveStoryClipAssetMentionRef(_0x22511a, _0xc345a4 = []) {
  const _0x28e02f = parseStoryAssetMentionId(_0x22511a?.dataset?.assetId);
  if (!_0x28e02f) {
    return null;
  }
  const _0x3750c4 = (Array.isArray(_0xc345a4) ? _0xc345a4 : []).find(_0x295454 => normalizeText(_0x295454?.id) === _0x28e02f.assetId);
  if (!_0x3750c4) {
    return null;
  }
  const _0x4c901b = _0x28e02f.appearanceId === "__asset__" ? null : (Array.isArray(_0x3750c4.appearances) ? _0x3750c4.appearances : []).find(_0xfba811 => normalizeText(_0xfba811?.id) === _0x28e02f.appearanceId);
  if (_0x28e02f.appearanceId !== "__asset__" && !_0x4c901b) {
    return null;
  }
  const _0x2ed92f = _0x28e02f.appearanceId === "__asset__" ? normalizeText(_0x3750c4.imageUrl) : normalizeText(_0x4c901b?.imageUrl);
  if (!_0x2ed92f) {
    return null;
  }
  return {
    origin: "asset",
    assetId: normalizeText(_0x22511a?.dataset?.assetId),
    storyAssetId: _0x28e02f.assetId,
    appearanceId: _0x28e02f.appearanceId,
    itemIndex: 0,
    type: "image",
    name: normalizeText(_0x3750c4.name) || "本集素材",
    label: normalizeText(_0x3750c4.name) || "本集素材",
    url: _0x2ed92f,
    thumbUrl: _0x2ed92f,
    nodeData: {
      type: "source-image",
      imageUrl: _0x2ed92f
    }
  };
}
export function getStoryClipMentionVoiceState(_0x5eed18, _0x1196ff = [], {
  voiceEnabled: _0x169dbd
} = {}) {
  const _0x15af4d = parseStoryAssetMentionId(_0x5eed18?.dataset?.assetId);
  const _0x525f8a = _0x15af4d ? (Array.isArray(_0x1196ff) ? _0x1196ff : []).find(_0x533e7d => normalizeText(_0x533e7d?.id) === _0x15af4d.assetId) : null;
  const _0x47b69a = _0x525f8a?.kind === "character" ? normalizeStoryCharacterVoiceReference(_0x525f8a?.voiceReference) : null;
  const _0x847c3a = normalizeText(_0x47b69a?.audioUrl || _0x47b69a?.localPath);
  const _0x43f7f6 = Boolean(_0x525f8a && _0x847c3a);
  const _0x244f1c = normalizeText(_0x5eed18?.dataset?.storyVoiceEnabled);
  const _0x366487 = typeof _0x169dbd === "boolean" ? _0x169dbd : _0x244f1c !== "false";
  return {
    available: _0x43f7f6,
    enabled: _0x43f7f6 && _0x366487,
    asset: _0x525f8a,
    voiceReference: _0x47b69a,
    url: _0x847c3a
  };
}
export function setStoryClipMentionVoiceEnabled(_0x4c0bf7, _0x534c3c = [], _0x7f6ba5 = false) {
  if (!_0x4c0bf7?.dataset) {
    return getStoryClipMentionVoiceState(_0x4c0bf7, _0x534c3c);
  }
  const _0x2151af = getStoryClipMentionVoiceState(_0x4c0bf7, _0x534c3c);
  if (_0x2151af.available && _0x7f6ba5 === true) {
    _0x4c0bf7.dataset.storyVoiceEnabled = "true";
  } else if (_0x2151af.available) {
    _0x4c0bf7.dataset.storyVoiceEnabled = "false";
  } else {
    delete _0x4c0bf7.dataset.storyVoiceEnabled;
    _0x4c0bf7.removeAttribute?.("data-story-voice-enabled");
  }
  return getStoryClipMentionVoiceState(_0x4c0bf7, _0x534c3c);
}
export function resolveStoryClipAssetMentionRefs(_0x3e88ac, _0x55b71e = [], {
  voiceEnabled: _0x13f66c,
  clipFrames = [],
  resolveExternalAssetRef = null
} = {}) {
  const _0x3c9f73 = resolveStoryClipFrameMentionRef(_0x3e88ac, clipFrames);
  if (_0x3c9f73) {
    return _0x3c9f73;
  }
  const _0x5d7477 = normalizeText(_0x3e88ac?.dataset?.assetId);
  if (!_0x5d7477.startsWith(STORY_ASSET_NODE_PREFIX) && typeof resolveExternalAssetRef === "function") {
    return resolveExternalAssetRef({
      assetId: _0x5d7477,
      itemIndex: Number(_0x3e88ac?.dataset?.assetIndex || 0)
    });
  }
  const _0x4d0ffc = [];
  const _0x4305d7 = resolveStoryClipAssetMentionRef(_0x3e88ac, _0x55b71e);
  if (_0x4305d7) {
    _0x4d0ffc.push(_0x4305d7);
  }
  const _0x3e0d37 = getStoryClipMentionVoiceState(_0x3e88ac, _0x55b71e, {
    voiceEnabled: _0x13f66c
  });
  if (_0x3e0d37.enabled) {
    const _0x4cb649 = normalizeText(_0x3e0d37.asset?.id);
    _0x4d0ffc.push({
      origin: "asset",
      assetId: "" + STORY_CHARACTER_VOICE_NODE_PREFIX + encodeURIComponent(_0x4cb649),
      storyAssetId: _0x4cb649,
      itemIndex: 0,
      type: "audio",
      name: (normalizeText(_0x3e0d37.asset?.name) || "角色") + " · 声音参考",
      label: normalizeText(_0x3e0d37.asset?.name) || "角色声音",
      url: _0x3e0d37.url,
      audioUrl: _0x3e0d37.url,
      localPath: normalizeText(_0x3e0d37.voiceReference?.localPath),
      placeholderTypeLabel: "声音",
      nodeData: {
        type: "source-audio",
        audioUrl: _0x3e0d37.url,
        localPath: normalizeText(_0x3e0d37.voiceReference?.localPath)
      }
    });
  }
  if (_0x4d0ffc.length === 0) {
    return null;
  }
  if (_0x4d0ffc.length === 1) {
    return _0x4d0ffc[0];
  } else {
    return _0x4d0ffc;
  }
}