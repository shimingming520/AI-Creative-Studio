import { resolveAssetMentionRef } from "./assetMentionRegistry.js";
import { normalizeInputKind, resolveEffectiveInputKind } from "./modelInputPolicy.js";
import { sanitizePromptHtml } from "../utils/dom.js";
const PROMPT_MENTION_TYPE_MAP = Object.freeze({
  text: "text",
  "source-text": "text",
  "ai-text": "text",
  image: "image",
  "source-image": "image",
  "ai-image": "image",
  video: "video",
  "source-video": "video",
  "ai-video": "video",
  audio: "audio",
  "source-audio": "audio",
  "ai-audio": "audio"
});
export const PROMPT_ASSET_INPUT_REFS_FIELD = "promptAssetInputRefs";
export function normalizePromptMentionType(_0x155fa2) {
  const _0x59b1be = String(_0x155fa2 || "").trim();
  return normalizeInputKind(PROMPT_MENTION_TYPE_MAP[_0x59b1be] || _0x59b1be);
}
export function normalizePromptAssetInputRefRecord(_0x4bbfd7 = {}) {
  if (!_0x4bbfd7 || typeof _0x4bbfd7 !== "object") {
    return null;
  }
  const _0x30bd00 = String(_0x4bbfd7.assetId || "").trim();
  const _0x175951 = _0x4bbfd7.itemIndex !== undefined && _0x4bbfd7.itemIndex !== null ? _0x4bbfd7.itemIndex : _0x4bbfd7.assetIndex;
  const _0x179f89 = Number(_0x175951);
  const _0x3ec4b6 = normalizePromptMentionType(_0x4bbfd7.type);
  if (!_0x30bd00 || !Number.isFinite(_0x179f89) || !_0x3ec4b6 || _0x3ec4b6 === "text") {
    return null;
  }
  return {
    assetId: _0x30bd00,
    itemIndex: Math.max(0, Math.trunc(_0x179f89)),
    type: _0x3ec4b6
  };
}
export function getPromptAssetInputRefRecords(_0x7859a4 = {}) {
  const _0x4901a6 = _0x7859a4?.[PROMPT_ASSET_INPUT_REFS_FIELD];
  if (!Array.isArray(_0x4901a6)) {
    return [];
  }
  return _0x4901a6.map(_0x38d2e9 => normalizePromptAssetInputRefRecord(_0x38d2e9)).filter(Boolean);
}
function getPillDatasetValue(_0x3e1484, _0x5a932, _0x5b8fd6 = "") {
  const _0x5433b9 = String(_0x3e1484?.dataset?.[_0x5a932] || "").trim();
  if (_0x5433b9) {
    return _0x5433b9;
  }
  if (_0x5b8fd6 && typeof _0x3e1484?.getAttribute === "function") {
    return String(_0x3e1484.getAttribute(_0x5b8fd6) || "").trim();
  }
  return "";
}
function isRefPillNode(_0x54c9a6) {
  if (!_0x54c9a6) {
    return false;
  }
  if (typeof _0x54c9a6.classList?.contains === "function") {
    return _0x54c9a6.classList.contains("ref-pill");
  }
  return String(_0x54c9a6.className || "").split(/\s+/).filter(Boolean).includes("ref-pill");
}
function isAssetMentionPill(_0x3cb1c7) {
  return getPillDatasetValue(_0x3cb1c7, "refOrigin", "data-ref-origin") === "asset";
}
export function getAssetMentionRefFromPillNode(_0xfa117d) {
  if (!isRefPillNode(_0xfa117d) || !isAssetMentionPill(_0xfa117d)) {
    return null;
  }
  const _0x3737f9 = getPillDatasetValue(_0xfa117d, "assetId", "data-asset-id");
  const _0x30d58b = getPillDatasetValue(_0xfa117d, "assetIndex", "data-asset-index");
  const _0x68923a = Number(_0x30d58b);
  if (!_0x3737f9 || !Number.isFinite(_0x68923a)) {
    return null;
  }
  return resolveAssetMentionRef({
    assetId: _0x3737f9,
    itemIndex: _0x68923a
  });
}
function normalizeAllowedMentionTypes(_0x486416 = null) {
  if (Array.isArray(_0x486416) && _0x486416.length) {
    return new Set(_0x486416.map(_0x552b60 => normalizePromptMentionType(_0x552b60)).filter(Boolean));
  } else {
    return null;
  }
}
function appendResolvedAssetInputRefFromRecord(_0x40eaed, _0x1628a6, _0x3e633c, {
  allowed = null,
  assetRefSource = "prompt",
  promptAssetRefIndex = null
} = {}) {
  const _0x14faff = String(_0x3e633c?.assetId || "").trim();
  const _0x12f26f = _0x3e633c?.itemIndex !== undefined && _0x3e633c?.itemIndex !== null ? _0x3e633c.itemIndex : _0x3e633c?.assetIndex;
  const _0x606f8a = Number(_0x12f26f);
  const _0x41f883 = resolveEffectiveInputKind(_0x3e633c) || normalizePromptMentionType(_0x3e633c?.type);
  if (!_0x14faff || !Number.isFinite(_0x606f8a) || !_0x41f883 || allowed && !allowed.has(_0x41f883)) {
    return false;
  }
  const _0x31b16a = Math.max(0, Math.trunc(_0x606f8a));
  const _0x51e6dd = resolveAssetMentionRef({
    assetId: _0x14faff,
    itemIndex: _0x31b16a
  });
  if (!_0x51e6dd) {
    return false;
  }
  const _0x21057c = resolveEffectiveInputKind(_0x51e6dd) || normalizePromptMentionType(_0x51e6dd.type || _0x41f883);
  if (!_0x21057c || _0x21057c !== _0x41f883) {
    return false;
  }
  if (_0x41f883 === "text") {
    if (!String(_0x51e6dd.content || "").trim()) {
      return false;
    }
  } else if (!String(_0x51e6dd.url || "").trim()) {
    return false;
  }
  const _0x2eb3eb = _0x14faff + ":" + _0x31b16a + ":" + _0x41f883;
  const _0x4a2853 = _0x1628a6.get(_0x2eb3eb) || 0;
  _0x1628a6.set(_0x2eb3eb, _0x4a2853 + 1);
  const _0x22c192 = {
    ..._0x51e6dd,
    type: _0x41f883,
    assetMentionOccurrence: _0x4a2853,
    assetRefSource: assetRefSource
  };
  if (Number.isFinite(Number(promptAssetRefIndex))) {
    _0x22c192.promptAssetRefIndex = Math.max(0, Math.trunc(Number(promptAssetRefIndex)));
  }
  _0x40eaed.push(_0x22c192);
  return true;
}
export function getAssetInputRefsFromPrompt(_0x5e651e = null, {
  allowedTypes = null
} = {}) {
  if (!_0x5e651e || typeof _0x5e651e.querySelectorAll !== "function") {
    return [];
  }
  const _0x65519f = normalizeAllowedMentionTypes(allowedTypes);
  const _0x5368b = [];
  const _0x5538bf = new Map();
  _0x5e651e.querySelectorAll(".ref-pill").forEach(_0x5539c5 => {
    if (!isAssetMentionPill(_0x5539c5)) {
      return;
    }
    const _0x10c222 = getAssetMentionRefFromPillNode(_0x5539c5);
    if (!_0x10c222) {
      return;
    }
    const _0x3d3243 = resolveEffectiveInputKind(_0x10c222) || normalizePromptMentionType(_0x10c222.type);
    if (!_0x3d3243 || _0x65519f && !_0x65519f.has(_0x3d3243)) {
      return;
    }
    if (_0x3d3243 === "text") {
      if (!String(_0x10c222.content || "").trim()) {
        return;
      }
    } else if (!String(_0x10c222.url || "").trim()) {
      return;
    }
    const _0x24069b = _0x10c222.assetId + ":" + _0x10c222.itemIndex + ":" + _0x3d3243;
    const _0x2f0ca5 = _0x5538bf.get(_0x24069b) || 0;
    _0x5538bf.set(_0x24069b, _0x2f0ca5 + 1);
    _0x5368b.push({
      ..._0x10c222,
      type: _0x3d3243,
      assetMentionOccurrence: _0x2f0ca5,
      assetRefSource: "prompt"
    });
  });
  return _0x5368b;
}
function decodeHtmlAttrValue(_0x248240) {
  return String(_0x248240 || "").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function getHtmlAttrValue(_0x25e440 = "", _0x140e16 = "") {
  const _0x23e279 = String(_0x140e16 || "").trim();
  if (!_0x23e279) {
    return "";
  }
  const _0x2e4901 = _0x23e279.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const _0x3db7bb = new RegExp(_0x2e4901 + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i");
  const _0xd716cc = String(_0x25e440 || "").match(_0x3db7bb);
  if (!_0xd716cc) {
    return "";
  }
  return decodeHtmlAttrValue(_0xd716cc[1] ?? _0xd716cc[2] ?? _0xd716cc[3] ?? "").trim();
}
function htmlClassAttrContains(_0xd8277 = "", _0x10f980 = "") {
  return getHtmlAttrValue(_0xd8277, "class").split(/\s+/).filter(Boolean).includes(_0x10f980);
}
export function getAssetInputRefsFromPromptHtml(_0x46aa1c = "", {
  allowedTypes = null
} = {}) {
  const _0x4c1461 = normalizeAllowedMentionTypes(allowedTypes);
  const _0xb87ddc = sanitizePromptHtml(_0x46aa1c);
  if (!_0xb87ddc) {
    return [];
  }
  const _0x471ea7 = [];
  const _0x1e9153 = new Map();
  const _0x5532a2 = /<span\b([^>]*)>([\s\S]*?)<\/span>/gi;
  let _0x34fe98 = null;
  while (_0x34fe98 = _0x5532a2.exec(_0xb87ddc)) {
    const _0x44610f = _0x34fe98[1] || "";
    if (!htmlClassAttrContains(_0x44610f, "ref-pill")) {
      continue;
    }
    if (getHtmlAttrValue(_0x44610f, "data-ref-origin") !== "asset") {
      continue;
    }
    appendResolvedAssetInputRefFromRecord(_0x471ea7, _0x1e9153, {
      assetId: getHtmlAttrValue(_0x44610f, "data-asset-id"),
      itemIndex: getHtmlAttrValue(_0x44610f, "data-asset-index"),
      type: getHtmlAttrValue(_0x44610f, "data-ref-type")
    }, {
      allowed: _0x4c1461,
      assetRefSource: "prompt"
    });
  }
  return _0x471ea7;
}
export function getPromptAssetInputRefsFromNode(_0x5b901c = {}, {
  allowedTypes = null
} = {}) {
  const _0x249a5d = normalizeAllowedMentionTypes(allowedTypes);
  const _0x729c9d = [];
  const _0x5a5932 = new Map();
  getPromptAssetInputRefRecords(_0x5b901c).forEach((_0x195992, _0x4ffd84) => {
    const _0x53266e = normalizePromptMentionType(_0x195992.type);
    if (!_0x53266e || _0x53266e === "text") {
      return;
    }
    appendResolvedAssetInputRefFromRecord(_0x729c9d, _0x5a5932, _0x195992, {
      allowed: _0x249a5d,
      assetRefSource: "hidden",
      promptAssetRefIndex: _0x4ffd84
    });
  });
  return _0x729c9d;
}
export function getAssetInputRefsFromNodeData(_0x31ae0d = {}, {
  allowedTypes = null
} = {}) {
  return [...getAssetInputRefsFromPromptHtml(_0x31ae0d?.prompt || "", {
    allowedTypes: allowedTypes
  }), ...getPromptAssetInputRefsFromNode(_0x31ae0d || {}, {
    allowedTypes: allowedTypes
  })];
}
export function getAssetInputRefsFromPromptAndNode(_0x4d811b = null, {
  nodeData = null,
  allowedTypes = null
} = {}) {
  return [...getAssetInputRefsFromPrompt(_0x4d811b, {
    allowedTypes: allowedTypes
  }), ...getPromptAssetInputRefsFromNode(nodeData || {}, {
    allowedTypes: allowedTypes
  })];
}