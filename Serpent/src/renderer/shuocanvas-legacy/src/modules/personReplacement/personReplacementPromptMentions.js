import { sanitizePromptHtmlForCommit } from "../nodePromptShared.js";
import { resolveAssetMentionRef } from "../assetMentionRegistry.js";
import { getWorkspaceAssetAppearances } from "../workspaceAssetAppearance.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { buildPersonReplacementPromptPackage } from "./personReplacementPromptCompiler.js";
export const PERSON_REPLACEMENT_PROMPT_ASSET_PREFIX = "person-replacement-asset:";
function normalizeText(_0x15edc1, _0x382fe8 = "") {
  const _0x79514a = String(_0x15edc1 ?? "").trim();
  return _0x79514a || _0x382fe8;
}
function normalizeMediaUrl(_0x46d6e0) {
  const _0x2b77c6 = normalizeText(_0x46d6e0);
  if (!_0x2b77c6) {
    return "";
  }
  return localPathToUrl(_0x2b77c6) || _0x2b77c6;
}
function escapeHtml(_0xc97618) {
  return String(_0xc97618 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#039;");
}
function encodeMentionPart(_0x2ed018, _0x10e6c4 = "__asset__") {
  return encodeURIComponent(normalizeText(_0x2ed018, _0x10e6c4));
}
function buildMentionId(_0x562e2f, _0x327d9f, _0x2c0c89 = "__asset__") {
  return "" + PERSON_REPLACEMENT_PROMPT_ASSET_PREFIX + encodeURIComponent(_0x562e2f) + ":" + encodeMentionPart(_0x327d9f) + ":" + encodeMentionPart(_0x2c0c89);
}
function parseMentionId(_0x1254f5 = "") {
  const _0x1affb5 = normalizeText(_0x1254f5);
  if (!_0x1affb5.startsWith(PERSON_REPLACEMENT_PROMPT_ASSET_PREFIX)) {
    return null;
  }
  const _0xb94e12 = _0x1affb5.slice(PERSON_REPLACEMENT_PROMPT_ASSET_PREFIX.length).split(":");
  if (_0xb94e12.length !== 3) {
    return null;
  }
  try {
    const [_0x698b2e, _0x190966, _0x33a27f] = _0xb94e12.map(_0x2d20bb => decodeURIComponent(_0x2d20bb));
    if (_0x698b2e && _0x190966) {
      return {
        kind: _0x698b2e,
        assetId: _0x190966,
        itemId: _0x33a27f
      };
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function matchesQuery(_0x312ca5, _0x3b1a70 = "") {
  const _0x2b0866 = normalizeText(_0x3b1a70).replace(/^@+/, "").toLowerCase();
  if (!_0x2b0866) {
    return true;
  }
  return [_0x312ca5?.label, _0x312ca5?.subtitle, _0x312ca5?.pillLabel, _0x312ca5?.assetName, _0x312ca5?.menuGroup].map(_0x232033 => normalizeText(_0x232033).toLowerCase()).some(_0x3802df => _0x3802df.includes(_0x2b0866));
}
function createImageMentionCandidate({
  kind: _0xa72f57,
  assetId: _0x108ffe,
  itemId: _0x4e5f74,
  label: _0x4a99f8,
  subtitle: _0x2263a6,
  assetName: _0x3fd8b4,
  thumbUrl: _0x41809a,
  menuGroup: _0x299793,
  menuSection: _0xd1a288,
  sourceItemIndex = 0
} = {}) {
  const _0xa76d01 = normalizeText(_0x4a99f8, "图片素材");
  const _0x49af43 = normalizeMediaUrl(_0x41809a);
  return {
    origin: "asset",
    menuDirect: true,
    suppressTooltip: true,
    assetId: buildMentionId(_0xa72f57, _0x108ffe, _0x4e5f74),
    assetIndex: 0,
    type: "image",
    label: _0xa76d01,
    pillLabel: _0xa76d01,
    subtitle: normalizeText(_0x2263a6),
    assetName: normalizeText(_0x3fd8b4, _0xa76d01),
    thumbUrl: _0x49af43,
    iconType: "image",
    menuPage: "assets",
    menuGroup: _0x299793,
    menuSection: _0xd1a288,
    personReplacementAssetKind: _0xa72f57,
    personReplacementSourceItemIndex: sourceItemIndex
  };
}
function getSelectedShot(_0x46d590 = {}) {
  const _0x34b2d8 = normalizeText(_0x46d590.workspace?.selectedShotId);
  const _0x4fa5de = Array.isArray(_0x46d590.shots) ? _0x46d590.shots : [];
  return _0x4fa5de.find(_0x5ae06b => normalizeText(_0x5ae06b?.id) === _0x34b2d8) || _0x4fa5de[0] || null;
}
function resolvePromptPackage(_0x9878a1 = {}, {
  promptPackage = null,
  shot = null
} = {}) {
  if (promptPackage) {
    return promptPackage;
  }
  const _0x1d517b = shot || getSelectedShot(_0x9878a1);
  if (!_0x1d517b) {
    return null;
  }
  return buildPersonReplacementPromptPackage({
    project: _0x9878a1,
    shot: _0x1d517b
  });
}
function describePromptReference(_0x463eb6 = {}, _0x6e4105 = {}) {
  const _0x6bd1f5 = Math.max(1, Number(_0x463eb6.slot) || 1);
  const _0x25467c = normalizeText(_0x463eb6.label, "图" + _0x6bd1f5);
  if (_0x463eb6.role === "source-keyframe") {
    return {
      slotLabel: _0x25467c,
      subtitle: "当前首帧",
      assetName: "当前首帧"
    };
  }
  if (_0x463eb6.role === "person-location-guide") {
    return {
      slotLabel: _0x25467c,
      subtitle: "主体定位图",
      assetName: "主体定位图"
    };
  }
  const _0x463518 = (Array.isArray(_0x6e4105.characters) ? _0x6e4105.characters : []).find(_0x5996ff => normalizeText(_0x5996ff?.id) === normalizeText(_0x463eb6.targetCharacterId));
  const _0x31bb03 = normalizeText(_0x463518?.name, "目标形象");
  return {
    slotLabel: _0x25467c,
    subtitle: _0x31bb03,
    assetName: _0x31bb03
  };
}
function buildCurrentReferenceCandidates(_0x5223ba = {}, {
  query = "",
  promptPackage = null,
  shot = null
} = {}) {
  const _0x200797 = resolvePromptPackage(_0x5223ba, {
    promptPackage: promptPackage,
    shot: shot
  });
  const _0x376e52 = Array.isArray(_0x200797?.referenceImages) ? _0x200797.referenceImages : [];
  return _0x376e52.filter(_0x3422fc => normalizeMediaUrl(_0x3422fc?.ref)).map((_0x5c48f3, _0x2fe3a9) => {
    const _0x2b9c01 = Math.max(1, Number(_0x5c48f3.slot) || _0x2fe3a9 + 1);
    const {
      slotLabel: _0x2af46a,
      subtitle: _0x34de39,
      assetName: _0x311202
    } = describePromptReference(_0x5c48f3, _0x5223ba);
    return createImageMentionCandidate({
      kind: "reference",
      assetId: String(_0x2b9c01),
      itemId: normalizeText([_0x5c48f3.role, _0x5c48f3.targetCharacterId, _0x5c48f3.targetAppearanceId].filter(Boolean).join(":"), String(_0x2fe3a9)),
      label: _0x2af46a,
      subtitle: _0x34de39,
      assetName: _0x311202,
      thumbUrl: _0x5c48f3.ref,
      menuGroup: "当前入参",
      menuSection: "图像"
    });
  }).filter(_0x1c5c03 => matchesQuery(_0x1c5c03, query));
}
function buildProjectAssetCandidates(_0x24a832 = {}) {
  return (Array.isArray(_0x24a832.characters) ? _0x24a832.characters : []).map(_0x5644f4 => {
    const _0x5a6d52 = getWorkspaceAssetAppearances(_0x5644f4).filter(_0x25e889 => normalizeText(_0x25e889?.imageUrl));
    if (!_0x5a6d52.length) {
      return null;
    }
    const _0x1832f1 = Math.max(0, Math.min(_0x5a6d52.length - 1, Math.trunc(Number(_0x24a832.workspace?.assetAppearanceIndexes?.[_0x5644f4.id]) || 0)));
    const _0xf0451b = _0x5a6d52.map(_0x10ace9 => createImageMentionCandidate({
      kind: "character",
      assetId: _0x5644f4.id,
      itemId: _0x10ace9.id,
      label: normalizeText(_0x5644f4.name, "人物素材") + " · " + normalizeText(_0x10ace9.name, "形象"),
      subtitle: "项目素材",
      assetName: normalizeText(_0x5644f4.name, "人物素材"),
      thumbUrl: _0x10ace9.imageUrl,
      menuGroup: "项目素材",
      menuSection: "人物"
    }));
    return {
      ..._0xf0451b[_0x1832f1],
      mentionVariants: _0xf0451b,
      mentionVariantIndex: _0x1832f1
    };
  }).filter(_0x25e41f => _0x25e41f && matchesQuery(_0x25e41f));
}
function buildProjectSceneCandidates(_0x548529 = {}, _0x2ca1df = "") {
  return (Array.isArray(_0x548529.scenes) ? _0x548529.scenes : []).map(_0x337396 => {
    const _0x4bc5d9 = getWorkspaceAssetAppearances(_0x337396).filter(_0x2a4d3a => normalizeText(_0x2a4d3a?.imageUrl));
    if (!_0x4bc5d9.length) {
      return null;
    }
    const _0x4e810d = Math.max(0, Math.min(_0x4bc5d9.length - 1, Math.trunc(Number(_0x548529.workspace?.assetAppearanceIndexes?.[_0x337396.id]) || 0)));
    const _0x1b3ec7 = _0x4bc5d9.map(_0x3828ff => createImageMentionCandidate({
      kind: "scene",
      assetId: _0x337396.id,
      itemId: _0x3828ff.id,
      label: normalizeText(_0x337396.name, "场景素材") + " · " + normalizeText(_0x3828ff.name, "场景图"),
      subtitle: "项目素材",
      assetName: normalizeText(_0x337396.name, "场景素材"),
      thumbUrl: _0x3828ff.imageUrl,
      menuGroup: "项目素材",
      menuSection: "场景"
    }));
    return {
      ..._0x1b3ec7[_0x4e810d],
      mentionVariants: _0x1b3ec7,
      mentionVariantIndex: _0x4e810d
    };
  }).filter(_0x25a5b7 => _0x25a5b7 && matchesQuery(_0x25a5b7, _0x2ca1df));
}
function buildLibraryAssetCandidates(_0x1354d3 = {}) {
  return (Array.isArray(_0x1354d3.libraryAssets) ? _0x1354d3.libraryAssets : []).filter(_0x4c7e8a => normalizeText(_0x4c7e8a?.mediaKind || _0x4c7e8a?.type).toLowerCase() === "image" && normalizeText(_0x4c7e8a?.imageUrl || _0x4c7e8a?.sourceUrl)).map(_0x294227 => createImageMentionCandidate({
    kind: "library",
    assetId: normalizeText(_0x294227.sourceAssetId || _0x294227.assetId || _0x294227.id),
    itemId: normalizeText(_0x294227.sourceItemIndex ?? _0x294227.itemIndex, "0"),
    sourceItemIndex: Math.max(0, Math.trunc(Number(_0x294227.sourceItemIndex ?? _0x294227.itemIndex) || 0)),
    label: normalizeText(_0x294227.name, "画布图片"),
    subtitle: normalizeText(_0x294227.assetName, "总素材"),
    assetName: normalizeText(_0x294227.assetName, "总素材"),
    thumbUrl: _0x294227.imageUrl || _0x294227.thumbnailUrl || _0x294227.sourceUrl,
    menuGroup: "总素材",
    menuSection: "图片"
  })).filter(_0x324c4d => _0x324c4d);
}
export function buildPersonReplacementPromptMentionCandidates(_0x3b0f88 = {}, {
  query = "",
  promptPackage = null,
  shot = null
} = {}) {
  return [...buildCurrentReferenceCandidates(_0x3b0f88, {
    query: query,
    promptPackage: promptPackage,
    shot: shot
  }), ...buildProjectSceneCandidates(_0x3b0f88, query)];
}
export function resolvePersonReplacementPromptMentionRef(_0x16c249, {
  project = {},
  promptPackage = null,
  shot = null,
  resolveExternalAssetRef = resolveAssetMentionRef
} = {}) {
  const _0x22b0e0 = parseMentionId(_0x16c249?.dataset?.assetId || _0x16c249?.getAttribute?.("data-asset-id"));
  if (!_0x22b0e0) {
    if (typeof resolveExternalAssetRef !== "function") {
      return null;
    }
    return resolveExternalAssetRef({
      assetId: _0x16c249?.dataset?.assetId || _0x16c249?.getAttribute?.("data-asset-id"),
      itemIndex: Number(_0x16c249?.dataset?.assetIndex || _0x16c249?.getAttribute?.("data-asset-index") || 0)
    });
  }
  if (_0x22b0e0.kind === "reference") {
    const _0x3f07d6 = resolvePromptPackage(project, {
      promptPackage: promptPackage,
      shot: shot
    });
    const _0x2dda35 = Array.isArray(_0x3f07d6?.referenceImages) ? _0x3f07d6.referenceImages : [];
    const _0x3f5dcd = Math.max(1, Math.trunc(Number(_0x22b0e0.assetId) || 0));
    const _0x39d124 = _0x2dda35.find((_0x1059dd, _0x555663) => Math.max(1, Number(_0x1059dd?.slot) || _0x555663 + 1) === _0x3f5dcd);
    const _0x1035b7 = normalizeMediaUrl(_0x39d124?.ref);
    if (!_0x39d124 || !_0x1035b7) {
      return null;
    }
    const {
      slotLabel: _0x123ff9,
      subtitle: _0x5c5fcb
    } = describePromptReference(_0x39d124, project);
    return {
      origin: "asset",
      assetId: _0x22b0e0.assetId,
      itemIndex: 0,
      type: "image",
      name: _0x123ff9 + " · " + _0x5c5fcb,
      label: _0x123ff9,
      url: _0x1035b7,
      thumbUrl: _0x1035b7,
      nodeData: {
        type: "source-image",
        imageUrl: _0x1035b7
      }
    };
  }
  if (_0x22b0e0.kind === "character") {
    const _0x2c0b88 = (Array.isArray(project.characters) ? project.characters : []).find(_0x51f949 => normalizeText(_0x51f949?.id) === _0x22b0e0.assetId);
    const _0x5911c8 = getWorkspaceAssetAppearances(_0x2c0b88).find(_0x3800a2 => normalizeText(_0x3800a2?.id) === _0x22b0e0.itemId);
    const _0x5e324f = normalizeMediaUrl(_0x5911c8?.imageUrl);
    if (!_0x2c0b88 || !_0x5911c8 || !_0x5e324f) {
      return null;
    }
    return {
      origin: "asset",
      assetId: _0x22b0e0.assetId,
      itemIndex: 0,
      type: "image",
      name: normalizeText(_0x2c0b88.name, "人物素材") + " · " + normalizeText(_0x5911c8.name, "形象"),
      label: normalizeText(_0x2c0b88.name, "人物素材") + " · " + normalizeText(_0x5911c8.name, "形象"),
      url: _0x5e324f,
      thumbUrl: _0x5e324f,
      nodeData: {
        type: "source-image",
        imageUrl: _0x5e324f
      }
    };
  }
  if (_0x22b0e0.kind === "scene") {
    const _0xdf01b6 = (Array.isArray(project.scenes) ? project.scenes : []).find(_0x1a2f6f => normalizeText(_0x1a2f6f?.id) === _0x22b0e0.assetId);
    const _0x1b286b = getWorkspaceAssetAppearances(_0xdf01b6).find(_0x203e24 => normalizeText(_0x203e24?.id) === _0x22b0e0.itemId);
    const _0x249c6c = normalizeMediaUrl(_0x1b286b?.imageUrl);
    if (!_0xdf01b6 || !_0x1b286b || !_0x249c6c) {
      return null;
    }
    return {
      origin: "asset",
      assetId: _0x22b0e0.assetId,
      itemIndex: 0,
      type: "image",
      name: normalizeText(_0xdf01b6.name, "场景素材") + " · " + normalizeText(_0x1b286b.name, "场景图"),
      label: normalizeText(_0xdf01b6.name, "场景素材") + " · " + normalizeText(_0x1b286b.name, "场景图"),
      url: _0x249c6c,
      thumbUrl: _0x249c6c,
      nodeData: {
        type: "source-image",
        imageUrl: _0x249c6c
      }
    };
  }
  if (_0x22b0e0.kind === "library") {
    const _0x2c4692 = Math.max(0, Math.trunc(Number(_0x22b0e0.itemId) || 0));
    const _0x2f15c0 = (Array.isArray(project.libraryAssets) ? project.libraryAssets : []).find(_0x3b7570 => normalizeText(_0x3b7570?.sourceAssetId || _0x3b7570?.assetId || _0x3b7570?.id) === _0x22b0e0.assetId && Math.max(0, Math.trunc(Number(_0x3b7570?.sourceItemIndex ?? _0x3b7570?.itemIndex) || 0)) === _0x2c4692);
    const _0x1dfba0 = normalizeMediaUrl(_0x2f15c0?.sourceUrl || _0x2f15c0?.imageUrl);
    if (!_0x2f15c0 || !_0x1dfba0) {
      return null;
    }
    return {
      origin: "asset",
      assetId: _0x22b0e0.assetId,
      itemIndex: _0x2c4692,
      type: "image",
      name: normalizeText(_0x2f15c0.name, "画布图片"),
      label: normalizeText(_0x2f15c0.name, "画布图片"),
      url: _0x1dfba0,
      thumbUrl: normalizeMediaUrl(_0x2f15c0.imageUrl || _0x2f15c0.thumbnailUrl || _0x2f15c0.sourceUrl),
      nodeData: {
        type: "source-image",
        imageUrl: _0x1dfba0
      }
    };
  }
  return null;
}
export function renderPersonReplacementPromptHtml(_0x33b445 = "") {
  const _0x4cdc3d = String(_0x33b445 ?? "");
  if (!_0x4cdc3d) {
    return "";
  }
  if (/<(?:br\b|span\b[^>]*\bref-pill\b)/iu.test(_0x4cdc3d)) {
    return sanitizePromptHtmlForCommit(_0x4cdc3d);
  }
  return escapeHtml(_0x4cdc3d).replace(/\r\n?|\n/gu, "<br>");
}