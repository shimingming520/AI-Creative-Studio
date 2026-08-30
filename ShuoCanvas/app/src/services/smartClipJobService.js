import { requester } from "../../api/requester.js";
export const SMART_CLIP_MIN_SEGMENTS = 2;
export const SMART_CLIP_MAX_SEGMENTS = 25;
export const SMART_CLIP_DEFAULT_SEGMENTS = 20;
export const SMART_CLIP_FPS_OPTIONS = Object.freeze([16, 24, 30]);
export const SMART_CLIP_DEFAULT_FPS = 24;
export const SMART_CLIP_MAX_SEGMENT_DURATION_SECONDS = 600;
export const SMART_CLIP_OUTPUT_MODE_SEGMENTS = "videoSegments";
export const SMART_CLIP_OUTPUT_MODE_KEYFRAMES = "keyframes";
export const SMART_CLIP_DEFAULT_OUTPUT_MODE = SMART_CLIP_OUTPUT_MODE_SEGMENTS;
export const SMART_CLIP_KEYFRAME_SELECTION_POLICY_PERSON = "person";
const SMART_CLIP_MODE_OPTIONS = Object.freeze(["stable", "balanced", "sensitive"]);
const SMART_CLIP_STATUS_POLL_INTERVAL_MS = 800;
function toErrorMessage(_0x3c1a8f, _0x5aeeab) {
  return String(_0x3c1a8f?.message || _0x3c1a8f || _0x5aeeab || "Smart clip failed");
}
export class SmartClipJobError extends Error {
  constructor(_0x37585a, {
    code = "smart_clip_failed",
    stage = "unknown",
    jobId = ""
  } = {}) {
    super(String(_0x37585a || "Smart clip failed"));
    this.name = "SmartClipJobError";
    this.code = code;
    this.stage = stage;
    this.jobId = String(jobId || "");
  }
}
export function normalizeSmartClipMaxSegments(_0x3c4c40) {
  const _0x5f4204 = Number(_0x3c4c40);
  const _0x542ba1 = Number.isFinite(_0x5f4204) ? Math.round(_0x5f4204) : SMART_CLIP_DEFAULT_SEGMENTS;
  return Math.max(SMART_CLIP_MIN_SEGMENTS, Math.min(SMART_CLIP_MAX_SEGMENTS, _0x542ba1));
}
export function normalizeSmartClipFps(_0x4c4485) {
  const _0x21e576 = Number(_0x4c4485);
  const _0x1d08ce = Number.isFinite(_0x21e576) ? Math.round(_0x21e576) : SMART_CLIP_DEFAULT_FPS;
  if (SMART_CLIP_FPS_OPTIONS.includes(_0x1d08ce)) {
    return _0x1d08ce;
  } else {
    return SMART_CLIP_DEFAULT_FPS;
  }
}
export function normalizeSmartClipMaxSegmentDuration(_0x299349) {
  if (_0x299349 === undefined || _0x299349 === null || _0x299349 === "") {
    return 0;
  }
  const _0x41f56f = Number(_0x299349);
  if (!Number.isFinite(_0x41f56f) || _0x41f56f <= 0) {
    return 0;
  }
  return Math.max(1, Math.min(SMART_CLIP_MAX_SEGMENT_DURATION_SECONDS, _0x41f56f));
}
export function normalizeSmartClipOutputMode(_0x332f96) {
  const _0x274e74 = String(_0x332f96 || "").trim();
  if (_0x274e74 === SMART_CLIP_OUTPUT_MODE_KEYFRAMES) {
    return SMART_CLIP_OUTPUT_MODE_KEYFRAMES;
  } else {
    return SMART_CLIP_DEFAULT_OUTPUT_MODE;
  }
}
export function normalizeSmartClipMode(_0x27bc62) {
  const _0x294440 = String(_0x27bc62 || "").trim().toLowerCase();
  if (SMART_CLIP_MODE_OPTIONS.includes(_0x294440)) {
    return _0x294440;
  } else {
    return "stable";
  }
}
export function normalizeSmartClipRunOptions(_0x2b592f = {}) {
  const _0x308cde = _0x2b592f && typeof _0x2b592f === "object" ? _0x2b592f : {};
  return {
    mode: normalizeSmartClipMode(_0x308cde.mode),
    ...(_0x308cde.unlimitedSegments === true ? {
      unlimitedSegments: true
    } : {
      maxSegments: normalizeSmartClipMaxSegments(_0x308cde.maxSegments)
    }),
    fps: normalizeSmartClipFps(_0x308cde.fps),
    outputMode: normalizeSmartClipOutputMode(_0x308cde.outputMode),
    ...(String(_0x308cde.keyframeSelectionPolicy || "").trim().toLowerCase() === SMART_CLIP_KEYFRAME_SELECTION_POLICY_PERSON ? {
      keyframeSelectionPolicy: SMART_CLIP_KEYFRAME_SELECTION_POLICY_PERSON
    } : {}),
    ...(_0x308cde.preserveWholeVideo === true ? {
      preserveWholeVideo: true
    } : {}),
    ...(normalizeSmartClipMaxSegmentDuration(_0x308cde.maxSegmentDurationSec) > 0 ? {
      maxSegmentDurationSec: normalizeSmartClipMaxSegmentDuration(_0x308cde.maxSegmentDurationSec)
    } : {})
  };
}
function emitProgress(_0x1cc6b1, _0x553374) {
  if (typeof _0x1cc6b1 !== "function") {
    return;
  }
  try {
    _0x1cc6b1(_0x553374);
  } catch {}
}
function isCancelled(_0x2e7bf0, _0x1d01c1) {
  return _0x2e7bf0?.aborted === true || typeof _0x1d01c1 === "function" && _0x1d01c1() === false;
}
function throwIfCancelled(_0x44f61b, _0x57f048, _0x4bc1b4 = "") {
  if (!isCancelled(_0x44f61b, _0x57f048)) {
    return;
  }
  throw new SmartClipJobError("Smart clip cancelled", {
    code: "cancelled",
    stage: "cancelled",
    jobId: _0x4bc1b4
  });
}
function waitForNextPoll(_0x325ee9, _0x4b0e63) {
  const _0x18e167 = Math.max(0, Number(_0x325ee9) || 0);
  if (_0x18e167 <= 0) {
    return Promise.resolve();
  }
  return new Promise((_0x533c27, _0x4e1471) => {
    let _0x28fdbb = false;
    const _0x4db543 = _0x563f6c => {
      if (_0x28fdbb) {
        return;
      }
      _0x28fdbb = true;
      _0x4b0e63?.removeEventListener?.("abort", _0x3d76ba);
      _0x563f6c();
    };
    const _0xc5707e = setTimeout(() => _0x4db543(_0x533c27), _0x18e167);
    const _0x3d76ba = () => {
      clearTimeout(_0xc5707e);
      _0x4db543(() => _0x4e1471(new SmartClipJobError("Smart clip cancelled", {
        code: "cancelled",
        stage: "cancelled"
      })));
    };
    if (_0x4b0e63?.aborted) {
      _0x3d76ba();
    } else {
      _0x4b0e63?.addEventListener?.("abort", _0x3d76ba, {
        once: true
      });
    }
  });
}
function readResponseData(_0x17f6b5) {
  if (_0x17f6b5 && typeof _0x17f6b5 === "object" && Object.prototype.hasOwnProperty.call(_0x17f6b5, "data")) {
    return _0x17f6b5.data;
  }
  return _0x17f6b5;
}
export async function runSmartClipJob({
  src: _0x4ecac3,
  options: _0x258376,
  onProgress: _0x183741,
  shouldContinue: _0xb1627a,
  signal: _0x348d83,
  request = requester,
  pollIntervalMs = SMART_CLIP_STATUS_POLL_INTERVAL_MS,
  wait = waitForNextPoll
} = {}) {
  const _0x5b162b = String(_0x4ecac3 || "").trim();
  if (!_0x5b162b) {
    throw new SmartClipJobError("Missing smart clip source", {
      code: "invalid_source",
      stage: "prepare"
    });
  }
  if (typeof request !== "function") {
    throw new TypeError("Smart clip request function is required");
  }
  const _0x14e166 = normalizeSmartClipRunOptions(_0x258376);
  throwIfCancelled(_0x348d83, _0xb1627a);
  let _0x243346;
  try {
    _0x243346 = await request({
      url: "/api/v2/video/smart_clip",
      method: "POST",
      provider: "local",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        src: _0x5b162b,
        options: _0x14e166
      }),
      allow404Null: true,
      returnMeta: true,
      signal: _0x348d83
    });
  } catch (_0x3b0b62) {
    if (_0x348d83?.aborted || _0x3b0b62?.code === "cancelled") {
      throw new SmartClipJobError("Smart clip cancelled", {
        code: "cancelled",
        stage: "cancelled"
      });
    }
    throw new SmartClipJobError(toErrorMessage(_0x3b0b62, "Smart clip start failed"), {
      code: "start_failed",
      stage: "start"
    });
  }
  if (_0x243346?.status === 404 || readResponseData(_0x243346) == null) {
    throw new SmartClipJobError("Smart clip endpoint unavailable", {
      code: "endpoint_unavailable",
      stage: "start"
    });
  }
  const _0x4f7c17 = readResponseData(_0x243346) || {};
  if (!_0x4f7c17.success) {
    throw new SmartClipJobError(_0x4f7c17.error || "Smart clip start failed", {
      code: "start_failed",
      stage: "start"
    });
  }
  const _0xe51eab = String(_0x4f7c17.jobId || "").trim();
  if (!_0xe51eab) {
    throw new SmartClipJobError("Smart clip start response is missing jobId", {
      code: "missing_job_id",
      stage: "start"
    });
  }
  while (true) {
    throwIfCancelled(_0x348d83, _0xb1627a, _0xe51eab);
    let _0x299e85;
    try {
      _0x299e85 = await request({
        url: "/api/v2/video/smart_clip/status?jobId=" + encodeURIComponent(_0xe51eab),
        method: "GET",
        provider: "local",
        timeout: 20000,
        returnMeta: true,
        signal: _0x348d83
      });
    } catch (_0x23c608) {
      if (_0x348d83?.aborted || _0x23c608?.code === "cancelled") {
        throw new SmartClipJobError("Smart clip cancelled", {
          code: "cancelled",
          stage: "cancelled",
          jobId: _0xe51eab
        });
      }
      throw new SmartClipJobError(toErrorMessage(_0x23c608, "Smart clip status failed"), {
        code: "status_failed",
        stage: "status",
        jobId: _0xe51eab
      });
    }
    const _0x44d263 = readResponseData(_0x299e85) || {};
    emitProgress(_0x183741, {
      ..._0x44d263,
      jobId: _0xe51eab,
      outputMode: normalizeSmartClipOutputMode(_0x44d263.outputMode || _0x14e166.outputMode)
    });
    if (_0x44d263.status === "error" || _0x44d263.status === "failed") {
      throw new SmartClipJobError(_0x44d263.error || "Smart clip job failed", {
        code: "job_failed",
        stage: String(_0x44d263.stage || "processing"),
        jobId: _0xe51eab
      });
    }
    if (_0x44d263.status === "cancelled") {
      throw new SmartClipJobError(_0x44d263.error || "Smart clip cancelled", {
        code: "cancelled",
        stage: String(_0x44d263.stage || "cancelled"),
        jobId: _0xe51eab
      });
    }
    if (_0x44d263.status === "done" || _0x44d263.status === "complete") {
      return {
        jobId: _0xe51eab,
        outputMode: normalizeSmartClipOutputMode(_0x44d263.outputMode || _0x14e166.outputMode),
        segments: Array.isArray(_0x44d263.segments) ? _0x44d263.segments : [],
        job: _0x44d263
      };
    }
    try {
      await wait(pollIntervalMs, _0x348d83);
    } catch (_0xd8df1e) {
      if (_0x348d83?.aborted || _0xd8df1e?.code === "cancelled") {
        throw new SmartClipJobError("Smart clip cancelled", {
          code: "cancelled",
          stage: "cancelled",
          jobId: _0xe51eab
        });
      }
      throw _0xd8df1e;
    }
  }
}