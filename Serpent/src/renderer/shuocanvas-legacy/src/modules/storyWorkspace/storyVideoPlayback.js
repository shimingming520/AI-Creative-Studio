import { createWorkspaceVideoPlayback, createWorkspaceVideoProgressLoop } from "../workspaceVideoPlayback.js";
export const createStoryVideoProgressLoop = createWorkspaceVideoProgressLoop;
const STORY_VIDEO_PLAYBACK_ACQUIRE_OPTIONS = Object.freeze({
  maxBytes: 67108864,
  timeout: 5000
});
let storyVideoPlaybackLeaseSequence = 0;
function createStoryVideoPlaybackLeaseOwnerId(_0x429f25) {
  const _0x47514b = String(_0x429f25 || "").trim();
  if (!_0x47514b) {
    return "";
  }
  storyVideoPlaybackLeaseSequence += 1;
  return _0x47514b + ":lease:" + storyVideoPlaybackLeaseSequence;
}
export function createStoryVideoPlayback(_0x4dd689 = {}) {
  const _0x2f35c9 = String(_0x4dd689?.ownerId || "").trim();
  const _0x4d1f3e = String(_0x4dd689?.diagnosticsLabel || "").trim() || "story-video:" + _0x2f35c9;
  return createWorkspaceVideoPlayback({
    acquirePlaybackOptions: STORY_VIDEO_PLAYBACK_ACQUIRE_OPTIONS,
    ..._0x4dd689,
    diagnosticsLabel: _0x4d1f3e,
    ownerId: createStoryVideoPlaybackLeaseOwnerId(_0x2f35c9)
  });
}