import { isStorySeedance25PromptMode } from "../../src/modules/storyWorkspace/storyPromptModes.js";
import { normalizeStringArray, normalizeText } from "../utils/storyGenerationValues.js";
const STORY_EPISODE_SCENE_SPATIAL_ANCHOR_MAX_CHARACTERS = 800;
function buildStoryEpisodeSceneSpatialAnchor(_0x3ac4e7 = {}, _0x11db15 = null) {
  const _0x3d899c = [_0x11db15?.description, _0x11db15?.prompt, _0x3ac4e7?.description].map(normalizeText).filter(Boolean);
  return [...new Set(_0x3d899c)].join("；").slice(0, STORY_EPISODE_SCENE_SPATIAL_ANCHOR_MAX_CHARACTERS);
}
export function createStoryEpisodeSplitCompactSceneCatalog(_0x11ef71 = [], {
  includeSpatialAnchors = false
} = {}) {
  const _0x2c656d = [];
  (Array.isArray(_0x11ef71) ? _0x11ef71 : []).filter(_0x4456e7 => normalizeText(_0x4456e7?.kind) === "scene").forEach(_0x3782bc => {
    const _0x7097d5 = Array.isArray(_0x3782bc?.appearances) ? _0x3782bc.appearances.filter(_0x289917 => normalizeText(_0x289917?.ref)) : [];
    const _0x5e9540 = _0x7097d5.find(_0x575f87 => normalizeText(_0x575f87?.ref) === normalizeText(_0x3782bc?.baseAppearanceRef)) || _0x7097d5[0] || null;
    const _0x2458a8 = includeSpatialAnchors ? buildStoryEpisodeSceneSpatialAnchor(_0x3782bc, _0x5e9540) : "";
    _0x2c656d.push({
      code: "s" + (_0x2c656d.length + 1),
      name: normalizeText(_0x3782bc?.name),
      ...(_0x2458a8 ? {
        spatialAnchor: _0x2458a8
      } : {}),
      assetName: normalizeText(_0x3782bc?.name),
      ref: normalizeText(_0x5e9540?.ref) || normalizeText(_0x3782bc?.ref),
      assetRef: normalizeText(_0x3782bc?.ref),
      kind: "scene",
      sourceSceneRefs: normalizeStringArray(_0x3782bc?.sourceSceneRefs)
    });
  });
  return _0x2c656d;
}
export function createStoryEpisodeSplitPromptSceneCatalog(_0x2782ca = [], _0x5b3008 = "") {
  return createStoryEpisodeSplitCompactSceneCatalog(_0x2782ca, {
    includeSpatialAnchors: isStorySeedance25PromptMode(_0x5b3008)
  }).map(({
    code: _0x165306,
    name: _0x1ef1ab,
    spatialAnchor: _0x33f02c
  }) => ({
    code: _0x165306,
    name: _0x1ef1ab,
    ...(_0x33f02c ? {
      spatialAnchor: _0x33f02c
    } : {})
  }));
}