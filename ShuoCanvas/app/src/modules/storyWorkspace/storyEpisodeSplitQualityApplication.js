export async function runStoryEpisodeSplitQualityReview({
  reviewEpisodeSplit: _0xb068e6,
  result: _0x4ce72b,
  episode: _0x3e5855,
  context: _0x341088,
  projectData: _0x230895,
  splitRun: _0x368bf7,
  clipDurationConstraints = null,
  onProgress = null
} = {}) {
  if (typeof _0xb068e6 !== "function" || !_0x4ce72b) {
    return _0x4ce72b;
  }
  return _0xb068e6({
    project: _0x341088?.project,
    episode: _0x3e5855,
    result: _0x4ce72b,
    assets: _0x230895?.assets,
    constraints: _0x341088?.project?.planning,
    model: _0x368bf7.execution.modelId,
    provider: _0x368bf7.execution.provider,
    providerProfileId: _0x368bf7.execution.providerProfileId,
    clipDurationConstraints: clipDurationConstraints,
    resumeDraft: _0x368bf7.qualityReview,
    onCheckpoint: _0x368bf7.saveQualityReview,
    onInvocation: _0x368bf7.onInvocation,
    onProgress: onProgress
  });
}