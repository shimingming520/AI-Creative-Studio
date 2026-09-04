import { resolveGenerationInputImageUrl } from "../services/imageReferenceUrlService.js";
import { resolveCanvasAudioUrl, resolveCanvasVideoUrl } from "../services/canvasMediaLocalService.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { resolveEffectiveInputKind } from "./modelInputPolicy.js";
const TYPE_LABELS = Object.freeze({
  text: "文本",
  image: "图片",
  video: "视频",
  audio: "音频"
});
let _assetMentionRefs = [];
let _assetMentionRefMap = new Map();
let _assetMentionRegistryRevision = 0;
const _assetMentionRegistryListeners = new Set();
let _assetMentionLibrarySettings = {
  categories: [],
  displayNames: {},
  parents: {}
};
function normalizeText(_0x5af8db) {
  return String(_0x5af8db || "").trim();
}
function normalizeAssetType(_0x2116af) {
  const _0x2c6f4f = normalizeText(_0x2116af).toLowerCase();
  if (!_0x2c6f4f) {
    return "";
  }
  if (_0x2c6f4f === "text" || _0x2c6f4f === "source-text" || _0x2c6f4f === "ai-text") {
    return "text";
  }
  if (_0x2c6f4f === "image" || _0x2c6f4f === "source-image" || _0x2c6f4f === "ai-image") {
    return "image";
  }
  if (_0x2c6f4f === "video" || _0x2c6f4f === "source-video" || _0x2c6f4f === "ai-video") {
    return "video";
  }
  if (_0x2c6f4f === "audio" || _0x2c6f4f === "source-audio" || _0x2c6f4f === "ai-audio") {
    return "audio";
  }
  if (_0x2c6f4f.includes("text")) {
    return "text";
  }
  if (_0x2c6f4f.includes("video")) {
    return "video";
  }
  if (_0x2c6f4f.includes("audio")) {
    return "audio";
  }
  if (_0x2c6f4f.includes("image")) {
    return "image";
  }
  return "";
}
function normalizeCategoryList(_0x44b1ed) {
  const _0x2dba39 = [];
  const _0x1376a8 = new Set();
  for (const _0x120e53 of Array.isArray(_0x44b1ed) ? _0x44b1ed : []) {
    const _0x411a47 = normalizeText(_0x120e53);
    const _0x4152b4 = _0x411a47.toLocaleLowerCase();
    if (!_0x411a47 || _0x1376a8.has(_0x4152b4)) {
      continue;
    }
    _0x1376a8.add(_0x4152b4);
    _0x2dba39.push(_0x411a47);
  }
  return _0x2dba39;
}
function normalizeCategoryRecord(_0x2a49b4) {
  const _0x16aaa1 = {};
  for (const [_0x168b23, _0x26efdb] of Object.entries(_0x2a49b4 && typeof _0x2a49b4 === "object" ? _0x2a49b4 : {})) {
    const _0x28fe16 = normalizeText(_0x168b23);
    const _0x2dd46a = normalizeText(_0x26efdb);
    if (_0x28fe16 && _0x2dd46a) {
      _0x16aaa1[_0x28fe16] = _0x2dd46a;
    }
  }
  return _0x16aaa1;
}
function areLibrarySettingsEqual(_0x12a88c, _0x46371f) {
  if (_0x12a88c.categories.length !== _0x46371f.categories.length) {
    return false;
  }
  if (_0x12a88c.categories.some((_0x361720, _0x25b648) => _0x361720 !== _0x46371f.categories[_0x25b648])) {
    return false;
  }
  const _0x279309 = (_0x79e7f1, _0x2b73ef) => {
    const _0x2adc84 = Object.entries(_0x79e7f1).sort(([_0xc1ab95], [_0x146cff]) => _0xc1ab95.localeCompare(_0x146cff));
    const _0x43f417 = Object.entries(_0x2b73ef).sort(([_0x1b754b], [_0x1acd37]) => _0x1b754b.localeCompare(_0x1acd37));
    return _0x2adc84.length === _0x43f417.length && _0x2adc84.every(([_0x33c8ae, _0x392c3c], _0x20c969) => _0x33c8ae === _0x43f417[_0x20c969]?.[0] && _0x392c3c === _0x43f417[_0x20c969]?.[1]);
  };
  return _0x279309(_0x12a88c.displayNames, _0x46371f.displayNames) && _0x279309(_0x12a88c.parents, _0x46371f.parents);
}
function toUsableUrl(_0x5587b0) {
  const _0x270c4a = normalizeText(_0x5587b0);
  if (!_0x270c4a) {
    return "";
  }
  if (/^(?:https?:|blob:|data:|\/)/i.test(_0x270c4a)) {
    return _0x270c4a;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(_0x270c4a)) {
    return "";
  }
  return localPathToUrl(_0x270c4a) || "/" + _0x270c4a.replace(/^\/+/, "");
}
function firstUsableUrl(..._0x33f80c) {
  for (const _0x30fe31 of _0x33f80c) {
    const _0x20f4c1 = toUsableUrl(_0x30fe31);
    if (_0x20f4c1) {
      return _0x20f4c1;
    }
  }
  return "";
}
function pickResultItem(_0x41bc5b, _0x2f53a2) {
  if (!Array.isArray(_0x41bc5b) || _0x41bc5b.length === 0) {
    return null;
  }
  const _0x2b14cb = Number(_0x2f53a2);
  const _0x43ace3 = Number.isFinite(_0x2b14cb) ? Math.max(0, Math.trunc(_0x2b14cb)) : 0;
  return _0x41bc5b[Math.min(_0x43ace3, _0x41bc5b.length - 1)] || null;
}
function getTextContent(_0x58d390 = {}, _0xe8a2c3 = {}) {
  return normalizeText(_0x58d390.outputText || _0x58d390.text || _0x58d390.content || _0x58d390.prompt || _0xe8a2c3.text || _0xe8a2c3.content || _0xe8a2c3.prompt || _0x58d390.label || _0xe8a2c3.name);
}
function resolveRefUrl(_0x12a90e, _0x4244ec = {}, _0x4a206d = {}) {
  if (_0x12a90e === "image") {
    return resolveGenerationInputImageUrl(_0x4244ec) || firstUsableUrl(_0x4a206d.url, _0x4a206d.src, _0x4a206d.thumbSrc, _0x4244ec.originalLocalPath, _0x4244ec.localPath, _0x4244ec.imageUrl, _0x4244ec.sourceUrl, _0x4244ec.src, _0x4244ec.url, _0x4244ec.thumbUrl);
  }
  if (_0x12a90e === "video") {
    const _0x3736c5 = pickResultItem(_0x4244ec.videos, _0x4244ec.mainVideoIndex);
    return resolveCanvasVideoUrl(_0x4244ec) || firstUsableUrl(_0x4a206d.url, _0x4a206d.src, _0x4244ec.localPath, _0x4244ec.videoUrl, _0x4244ec.src, _0x4244ec.url, _0x3736c5?.localPath, _0x3736c5?.videoUrl);
  }
  if (_0x12a90e === "audio") {
    return resolveCanvasAudioUrl(_0x4244ec) || firstUsableUrl(_0x4a206d.url, _0x4a206d.src, _0x4244ec.localPath, _0x4244ec.audioUrl, _0x4244ec.src, _0x4244ec.url);
  }
  return "";
}
function resolveThumbUrl(_0x15ca1f, _0x6c1069 = {}, _0x1650d1 = {}) {
  const _0x37abe6 = firstUsableUrl(_0x1650d1.thumbSrc, _0x1650d1.thumbUrl, _0x1650d1.thumbnailUrl, _0x1650d1.coverUrl, _0x6c1069.thumbLocalPath, _0x6c1069.thumbUrl, _0x6c1069.thumbnailUrl, _0x6c1069.coverUrl, _0x6c1069.displayLocalPath);
  if (_0x37abe6 || _0x15ca1f !== "image" && _0x15ca1f !== "video") {
    return _0x37abe6;
  }
  return firstUsableUrl(_0x15ca1f === "image" ? _0x6c1069.originalLocalPath : "", _0x15ca1f === "image" ? _0x6c1069.localPath : "", _0x15ca1f === "image" ? _0x6c1069.imageUrl : "");
}
function buildAssetMentionRefs(_0x34f267) {
  if (!_0x34f267 || typeof _0x34f267 !== "object") {
    return [];
  }
  const _0x2eb86d = normalizeText(_0x34f267.id);
  if (!_0x2eb86d) {
    return [];
  }
  const _0x5d7317 = Array.isArray(_0x34f267.items);
  const _0x92d97c = Array.isArray(_0x34f267.nodes);
  if (!_0x5d7317 && !_0x92d97c) {
    return [];
  }
  const _0x5dcca2 = _0x5d7317 ? _0x34f267.items : _0x34f267.nodes.map(_0x4415ef => ({
    nodeData: _0x4415ef,
    type: _0x4415ef?.type
  }));
  const _0x3fdb3d = normalizeText(_0x34f267.name);
  const _0x1c3e9d = normalizeText(_0x34f267.category);
  const _0x50b02f = [];
  _0x5dcca2.forEach((_0xcf313b, _0x5be5cb) => {
    if (!_0xcf313b || typeof _0xcf313b !== "object") {
      return;
    }
    const _0x1b9619 = _0xcf313b.nodeData && typeof _0xcf313b.nodeData === "object" ? _0xcf313b.nodeData : _0xcf313b;
    const _0x161b6b = resolveEffectiveInputKind(_0x1b9619) || normalizeAssetType(_0xcf313b.type || _0x1b9619.type);
    if (!_0x161b6b) {
      return;
    }
    const _0xcfc64c = normalizeText(_0xcf313b.name || _0x1b9619.name || _0x1b9619.label) || _0x3fdb3d || "" + (TYPE_LABELS[_0x161b6b] || "素材") + (_0x5be5cb + 1);
    const _0x46a46b = _0x161b6b === "text" ? getTextContent(_0x1b9619, _0xcf313b) : "";
    const _0x3364b8 = _0x161b6b === "text" ? "" : resolveRefUrl(_0x161b6b, _0x1b9619, _0xcf313b);
    const _0x1f0009 = resolveThumbUrl(_0x161b6b, _0x1b9619, _0xcf313b);
    if (_0x161b6b === "text" ? !_0x46a46b : !_0x3364b8) {
      return;
    }
    _0x50b02f.push({
      origin: "asset",
      assetId: _0x2eb86d,
      assetName: _0x3fdb3d,
      category: _0x1c3e9d,
      assetCategory: _0x1c3e9d,
      itemIndex: _0x5be5cb,
      type: _0x161b6b,
      name: _0xcfc64c,
      label: _0xcfc64c,
      insertLabel: _0xcfc64c,
      content: _0x46a46b,
      url: _0x3364b8,
      thumbUrl: _0x1f0009,
      nodeData: _0x1b9619
    });
  });
  return _0x50b02f;
}
function notifyRegistryChange() {
  _assetMentionRegistryRevision += 1;
  _assetMentionRegistryListeners.forEach(_0x313f29 => {
    try {
      _0x313f29(_assetMentionRegistryRevision);
    } catch (_0x8c8b2e) {
      console.warn("[assetMentionRegistry] listener failed", _0x8c8b2e);
    }
  });
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new CustomEvent("asset-mention-registry-change", {
        detail: {
          revision: _assetMentionRegistryRevision
        }
      }));
    } catch {}
  }
}
function rebuildIndex(_0xaaaa87) {
  _assetMentionRefs = Array.isArray(_0xaaaa87) ? _0xaaaa87 : [];
  _assetMentionRefMap = new Map();
  _assetMentionRefs.forEach(_0x1e18d0 => {
    _assetMentionRefMap.set(_0x1e18d0.assetId + ":" + _0x1e18d0.itemIndex, _0x1e18d0);
  });
  notifyRegistryChange();
}
export function getAssetMentionRegistryRevision() {
  return _assetMentionRegistryRevision;
}
export function getAssetMentionLibrarySettings() {
  return {
    categories: [..._assetMentionLibrarySettings.categories],
    displayNames: {
      ..._assetMentionLibrarySettings.displayNames
    },
    parents: {
      ..._assetMentionLibrarySettings.parents
    }
  };
}
export function setAssetMentionLibrarySettings({
  categories = [],
  displayNames = {},
  parents = {}
} = {}) {
  const _0x1919f6 = {
    categories: normalizeCategoryList(categories),
    displayNames: normalizeCategoryRecord(displayNames),
    parents: normalizeCategoryRecord(parents)
  };
  if (areLibrarySettingsEqual(_assetMentionLibrarySettings, _0x1919f6)) {
    return false;
  }
  _assetMentionLibrarySettings = _0x1919f6;
  notifyRegistryChange();
  return true;
}
export function subscribeAssetMentionRegistry(_0x1e373c) {
  if (typeof _0x1e373c !== "function") {
    return () => {};
  }
  _assetMentionRegistryListeners.add(_0x1e373c);
  return () => {
    _assetMentionRegistryListeners.delete(_0x1e373c);
  };
}
export function setAssetMentionAssets(_0x4948c0 = []) {
  const _0x188a19 = [];
  (Array.isArray(_0x4948c0) ? _0x4948c0 : []).forEach(_0x4e6fbf => {
    _0x188a19.push(...buildAssetMentionRefs(_0x4e6fbf));
  });
  rebuildIndex(_0x188a19);
}
export function upsertAssetMentionAsset(_0x196e21) {
  if (!_0x196e21 || typeof _0x196e21 !== "object") {
    return;
  }
  const _0x340ad2 = normalizeText(_0x196e21.id);
  if (!_0x340ad2) {
    return;
  }
  const _0x222498 = _assetMentionRefs.filter(_0x1b94d2 => _0x1b94d2.assetId !== _0x340ad2);
  _0x222498.push(...buildAssetMentionRefs(_0x196e21));
  rebuildIndex(_0x222498);
}
export function removeAssetMentionAsset(_0x2512b2) {
  const _0x4fda0f = normalizeText(_0x2512b2);
  if (!_0x4fda0f) {
    return;
  }
  rebuildIndex(_assetMentionRefs.filter(_0x309352 => _0x309352.assetId !== _0x4fda0f));
}
export function resolveAssetMentionRef({
  assetId = "",
  itemIndex = 0
} = {}) {
  return _assetMentionRefMap.get(normalizeText(assetId) + ":" + Number(itemIndex)) || null;
}
export function getAssetMentionCandidates({
  query = "",
  allowedTypes = null
} = {}) {
  const _0x211cec = normalizeText(query).replace(/^@+/, "").toLowerCase();
  const _0x761e21 = Array.isArray(allowedTypes) && allowedTypes.length ? new Set(allowedTypes) : null;
  return _assetMentionRefs.filter(_0x1e1b28 => {
    if (_0x761e21 && !_0x761e21.has(_0x1e1b28.type)) {
      return false;
    }
    if (!_0x211cec) {
      return true;
    }
    const _0x44fec6 = [_0x1e1b28.name, _0x1e1b28.assetName, _0x1e1b28.category, TYPE_LABELS[_0x1e1b28.type], _0x1e1b28.label, _0x1e1b28.insertLabel].join(" ").toLowerCase();
    return _0x44fec6.includes(_0x211cec);
  });
}
export function _resetAssetMentionRegistryForTests() {
  _assetMentionLibrarySettings = {
    categories: [],
    displayNames: {},
    parents: {}
  };
  rebuildIndex([]);
}