import { SMART_CLIP_OUTPUT_MODE_KEYFRAMES, SmartClipJobError, normalizeSmartClipRunOptions, runSmartClipJob } from "../../services/smartClipJobService.js";
import { localPathToUrl, pickResultLocalPath } from "../../utils/localMediaPath.js";
const TIMELINE_MATCH_TOLERANCE_SEC = 0.15;
function toFiniteNumber(_0xd1d7b, _0x5dde3a = 0) {
  const _0x1079c8 = Number(_0xd1d7b);
  if (Number.isFinite(_0x1079c8)) {
    return _0x1079c8;
  } else {
    return _0x5dde3a;
  }
}
function toPositiveIndex(_0x441130) {
  const _0x71f0e8 = Number(_0x441130);
  if (!Number.isFinite(_0x71f0e8) || _0x71f0e8 < 1) {
    return 0;
  }
  return Math.trunc(_0x71f0e8);
}
function serializeStageError(_0x10fdc8, _0x220805) {
  return {
    stage: String(_0x10fdc8?.stage || _0x220805 || "unknown"),
    code: String(_0x10fdc8?.code || "smart_clip_failed"),
    message: String(_0x10fdc8?.message || _0x10fdc8 || "Smart clip failed"),
    jobId: String(_0x10fdc8?.jobId || "")
  };
}
function normalizeSegment(_0x59be5a, _0x27c35f) {
  const _0x40e58f = _0x59be5a && typeof _0x59be5a === "object" ? _0x59be5a : {};
  const _0x45f56e = Math.max(0, toFiniteNumber(_0x40e58f.start, 0));
  const _0x39d917 = Math.max(0, toFiniteNumber(_0x40e58f.duration, 0));
  const _0x5dec39 = toFiniteNumber(_0x40e58f.end, _0x45f56e + _0x39d917);
  const _0x241402 = Math.max(_0x45f56e, _0x5dec39);
  const _0x213d5e = _0x39d917 > 0 ? _0x39d917 : Math.max(0, _0x241402 - _0x45f56e);
  const _0x5ebf90 = pickResultLocalPath(_0x40e58f);
  return {
    sourceIndex: toPositiveIndex(_0x40e58f.index),
    sourcePosition: _0x27c35f,
    start: _0x45f56e,
    end: _0x241402 > _0x45f56e ? _0x241402 : _0x45f56e + _0x213d5e,
    duration: _0x213d5e,
    fps: Math.max(0, toFiniteNumber(_0x40e58f.fps, 0)),
    keyframeIndex: Math.max(0, Math.trunc(toFiniteNumber(_0x40e58f.keyframeIndex, 0))),
    keyframeTimeSec: Math.max(_0x45f56e, toFiniteNumber(_0x40e58f.keyframeTimeSec, _0x45f56e)),
    personDetection: _0x40e58f.personDetection && typeof _0x40e58f.personDetection === "object" ? _0x40e58f.personDetection : null,
    personFound: _0x40e58f.personFound === true,
    keyframeSelectionPolicy: String(_0x40e58f.keyframeSelectionPolicy || ""),
    ref: _0x5ebf90,
    url: localPathToUrl(_0x5ebf90),
    fileName: String(_0x40e58f.fileName || "")
  };
}
export function normalizePersonReplacementSmartClipSegments(_0x5a2366) {
  const _0x3eef96 = (Array.isArray(_0x5a2366) ? _0x5a2366 : []).map((_0x2d1aa8, _0x3b0a78) => normalizeSegment(_0x2d1aa8, _0x3b0a78)).sort((_0x43c19b, _0x4f6791) => _0x43c19b.start - _0x4f6791.start || _0x43c19b.end - _0x4f6791.end || _0x43c19b.sourceIndex - _0x4f6791.sourceIndex || _0x43c19b.sourcePosition - _0x4f6791.sourcePosition);
  const _0x1745a8 = new Set(_0x3eef96.map(_0x20c382 => _0x20c382.sourceIndex).filter(Boolean));
  const _0x575062 = new Set();
  let _0x47dd81 = 1;
  return _0x3eef96.map(_0x4b5af1 => {
    let _0x108392 = _0x4b5af1.sourceIndex;
    if (!_0x108392 || _0x575062.has(_0x108392)) {
      while (_0x1745a8.has(_0x47dd81) || _0x575062.has(_0x47dd81)) {
        _0x47dd81 += 1;
      }
      _0x108392 = _0x47dd81;
      _0x47dd81 += 1;
    }
    _0x575062.add(_0x108392);
    return {
      ..._0x4b5af1,
      index: _0x108392
    };
  });
}
function timelineDiffers(_0x328b9c, _0x54747d) {
  if (!_0x328b9c || !_0x54747d) {
    return false;
  }
  return Math.abs(_0x328b9c.start - _0x54747d.start) > TIMELINE_MATCH_TOLERANCE_SEC || Math.abs(_0x328b9c.end - _0x54747d.end) > TIMELINE_MATCH_TOLERANCE_SEC;
}
function missingRefError(_0x3a390a, _0x310f10, _0x4e35c9) {
  return {
    stage: _0x3a390a,
    code: _0x310f10,
    message: _0x4e35c9,
    jobId: ""
  };
}
export function buildPersonReplacementShotBundles({
  clipSegments: _0x3b0e92,
  keyframeSegments: _0x5aea65,
  stageErrors = {},
  requireClip = true
} = {}) {
  const _0x1edc72 = normalizePersonReplacementSmartClipSegments(_0x3b0e92);
  const _0x277500 = normalizePersonReplacementSmartClipSegments(_0x5aea65);
  const _0x51b43c = new Map(_0x1edc72.map(_0x2f0591 => [_0x2f0591.index, _0x2f0591]));
  const _0x1e82f8 = new Map(_0x277500.map(_0x65368c => [_0x65368c.index, _0x65368c]));
  const _0x223908 = Array.from(new Set([..._0x51b43c.keys(), ..._0x1e82f8.keys()])).sort((_0x216442, _0x2364f9) => {
    const _0x4b19dc = _0x51b43c.get(_0x216442) || _0x1e82f8.get(_0x216442);
    const _0x4bf90f = _0x51b43c.get(_0x2364f9) || _0x1e82f8.get(_0x2364f9);
    return _0x4b19dc.start - _0x4bf90f.start || _0x4b19dc.end - _0x4bf90f.end || _0x216442 - _0x2364f9;
  });
  return _0x223908.map((_0x5eb029, _0x1d0696) => {
    const _0x15428c = _0x51b43c.get(_0x5eb029) || null;
    const _0x5d92ca = _0x1e82f8.get(_0x5eb029) || null;
    const _0x35311a = _0x15428c || _0x5d92ca || {
      start: 0,
      end: 0,
      duration: 0
    };
    const _0x578d2f = [];
    if (requireClip && !_0x15428c?.ref) {
      _0x578d2f.push(stageErrors.videoSegments || missingRefError("videoSegments", "missing_clip_ref", "Video segment output is missing"));
    }
    if (!_0x5d92ca?.ref) {
      _0x578d2f.push(stageErrors.keyframes || missingRefError("keyframes", "missing_keyframe_ref", "Keyframe output is missing"));
    }
    if (timelineDiffers(_0x15428c, _0x5d92ca)) {
      _0x578d2f.push(missingRefError("pairing", "timeline_mismatch", "Video segment and keyframe timelines do not match"));
    }
    const _0x2d009d = Boolean(_0x15428c?.ref);
    const _0xce11b6 = Boolean(_0x5d92ca?.ref);
    const _0x172dd0 = !requireClip || _0x2d009d;
    const _0x397336 = _0x172dd0 && _0xce11b6 && _0x578d2f.length === 0 ? "ready" : _0x2d009d || _0xce11b6 ? "partial" : "failed";
    return {
      id: "shot-" + String(_0x1d0696 + 1).padStart(3, "0"),
      index: _0x1d0696 + 1,
      sourceIndex: _0x5eb029,
      start: _0x35311a.start,
      end: _0x35311a.end,
      duration: _0x35311a.duration || Math.max(0, _0x35311a.end - _0x35311a.start),
      fps: _0x5d92ca?.fps || _0x15428c?.fps || 0,
      keyframeIndex: _0x5d92ca?.keyframeIndex || 0,
      keyframeTimeSec: _0x5d92ca?.keyframeTimeSec || _0x35311a.start,
      personDetection: _0x5d92ca?.personDetection || null,
      personFound: _0x5d92ca?.personFound === true,
      keyframeSelectionPolicy: _0x5d92ca?.keyframeSelectionPolicy || "",
      clipRef: _0x15428c?.ref || "",
      keyframeRef: _0x5d92ca?.ref || "",
      status: _0x397336,
      errors: _0x578d2f
    };
  });
}
function normalizeSourceRef(_0xa55131) {
  const _0xfcae07 = pickResultLocalPath(_0xa55131);
  return localPathToUrl(_0xfcae07);
}
function createStageSuccess(_0x48d48e) {
  const _0x14d487 = Array.isArray(_0x48d48e?.segments) ? _0x48d48e.segments : [];
  return {
    status: _0x14d487.length > 0 ? "complete" : "empty",
    jobId: String(_0x48d48e?.jobId || ""),
    count: _0x14d487.length,
    error: _0x14d487.length > 0 ? null : {
      stage: String(_0x48d48e?.outputMode || "unknown"),
      code: "no_results",
      message: "Smart clip stage returned no results",
      jobId: String(_0x48d48e?.jobId || "")
    }
  };
}
function emitProgress(_0x4bfef1, _0x2e8463, _0x195ee4) {
  if (typeof _0x4bfef1 !== "function") {
    return;
  }
  try {
    _0x4bfef1({
      phase: _0x2e8463,
      ..._0x195ee4
    });
  } catch {}
}
async function runStage({
  phase: _0x26cb14,
  src: _0x4fca9a,
  options: _0xbfae09,
  runJob: _0x11cc4a,
  onProgress: _0x29d2cb,
  shouldContinue: _0x5084d6,
  signal: _0x26df9d
}) {
  try {
    const _0x452b53 = await _0x11cc4a({
      src: _0x4fca9a,
      options: {
        ..._0xbfae09,
        outputMode: _0x26cb14
      },
      shouldContinue: _0x5084d6,
      signal: _0x26df9d,
      onProgress: _0x40e464 => emitProgress(_0x29d2cb, _0x26cb14, _0x40e464)
    });
    return {
      result: _0x452b53,
      error: null,
      stage: createStageSuccess(_0x452b53)
    };
  } catch (_0x29c30c) {
    const _0x510c98 = serializeStageError(_0x29c30c, _0x26cb14);
    return {
      result: {
        segments: [],
        outputMode: _0x26cb14,
        jobId: _0x510c98.jobId
      },
      error: _0x510c98,
      stage: {
        status: _0x510c98.code === "cancelled" ? "cancelled" : "failed",
        jobId: _0x510c98.jobId,
        count: 0,
        error: _0x510c98
      }
    };
  }
}
export async function runPersonReplacementSmartClip({
  source: _0x5b9ad4,
  options: _0x165e64,
  onProgress: _0x53decb,
  shouldContinue: _0x3ed059,
  signal: _0x4fe0a6,
  runJob = runSmartClipJob
} = {}) {
  const _0x503c5c = normalizeSourceRef(_0x5b9ad4);
  if (!_0x503c5c) {
    throw new SmartClipJobError("Invalid person replacement source video", {
      code: "invalid_source",
      stage: "prepare"
    });
  }
  if (typeof runJob !== "function") {
    throw new TypeError("Smart clip job runner is required");
  }
  const _0x4418ac = normalizeSmartClipRunOptions(_0x165e64);
  const _0x131afd = {
    mode: _0x4418ac.mode,
    ...(_0x4418ac.unlimitedSegments === true ? {
      unlimitedSegments: true
    } : {
      maxSegments: _0x4418ac.maxSegments
    }),
    fps: _0x4418ac.fps,
    keyframeSelectionPolicy: "person",
    ...(_0x4418ac.preserveWholeVideo === true ? {
      preserveWholeVideo: true
    } : {})
  };
  const _0x2bdaa9 = await runStage({
    phase: SMART_CLIP_OUTPUT_MODE_KEYFRAMES,
    src: _0x503c5c,
    options: _0x131afd,
    runJob: runJob,
    onProgress: _0x53decb,
    shouldContinue: _0x3ed059,
    signal: _0x4fe0a6
  });
  const _0x139d71 = {
    keyframes: _0x2bdaa9.error || _0x2bdaa9.stage.error
  };
  const _0x60cfbe = buildPersonReplacementShotBundles({
    keyframeSegments: _0x2bdaa9.result.segments,
    stageErrors: _0x139d71,
    requireClip: false
  });
  const _0x307901 = _0x2bdaa9.stage.status !== "complete";
  const _0x175354 = _0x60cfbe.some(_0x1fe3fe => _0x1fe3fe.status !== "ready");
  const _0x1132b4 = _0x60cfbe.some(_0x594f31 => _0x594f31.status !== "failed");
  const _0x4fd090 = _0x60cfbe.length === 0 || !_0x1132b4 ? "failed" : _0x307901 || _0x175354 ? "partial" : "ready";
  return {
    ok: _0x4fd090 !== "failed",
    status: _0x4fd090,
    sourceRef: pickResultLocalPath(_0x5b9ad4),
    options: _0x131afd,
    shotBundles: _0x60cfbe,
    stages: {
      videoSegments: {
        status: "deferred",
        jobId: "",
        count: 0,
        error: null
      },
      keyframes: _0x2bdaa9.stage
    }
  };
}