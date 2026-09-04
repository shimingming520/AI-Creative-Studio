import { parseStoryEpisodeSplitResult } from "../storyGenerationApi.js";
import { reviewStoryEpisodeSplitQuality as a146_0x276d8c } from "./storyEpisodeSplitQualityReview.js";
import { resolveStoryPromptModeClipMaxSeconds } from "./storyPromptModeRules.js";
function normalizeText(_0x21c09c) {
  return String(_0x21c09c || "").trim();
}
export function reviewStoryEpisodeSplitQuality(_0x57386f = {}) {
  const _0x195829 = {
    ...(_0x57386f.project?.planning || {}),
    ...(_0x57386f.constraints || {})
  };
  const _0x2b65f2 = normalizeText(_0x195829.promptMode) || "seedance-2.0";
  _0x195829.sceneMaxSeconds = resolveStoryPromptModeClipMaxSeconds(_0x2b65f2, _0x195829.sceneMaxSeconds);
  return a146_0x276d8c({
    ..._0x57386f,
    constraints: _0x195829,
    validateClips: ({
      episodeRef: _0x25e4ab,
      clips: _0x571a08
    }) => parseStoryEpisodeSplitResult({
      episodeRef: _0x25e4ab,
      clips: _0x571a08
    }, {
      episodeRef: _0x25e4ab,
      episode: _0x57386f.episode,
      scriptMode: normalizeText(_0x57386f.project?.scriptMode),
      constraints: _0x195829,
      assets: _0x57386f.assets,
      minimumShotsPerClip: 1,
      maximumShotsPerClip: 12,
      repairMissingShotFields: true,
      requireAllPlanCharacters: false,
      completeCharacterAssetUsages: false,
      clipDurationConstraints: _0x57386f.clipDurationConstraints,
      rejectUnsupportedClipDuration: Boolean(_0x57386f.clipDurationConstraints),
      promptMode: _0x2b65f2
    }).clips
  });
}