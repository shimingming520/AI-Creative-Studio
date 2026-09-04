const DEFAULT_LOCAL_MEDIA_PLAYBACK_TIMEOUT_MS = 900;
const DEFAULT_LOCAL_MEDIA_PLAYBACK_MAX_BYTES = 33554432;
const STREAM_READ_YIELD_EVERY_CHUNKS = 4;
const TYPED_RESULT_MODE = "typed";
function playbackFetchResult(_0x27760b, _0x347b48, _0x522152 = null, _0x3b0b19 = 0) {
  if (_0x27760b === TYPED_RESULT_MODE) {
    return {
      status: _0x347b48,
      blob: _0x522152,
      httpStatus: Number(_0x3b0b19 || 0)
    };
  }
  return _0x522152;
}
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function markLocalPlaybackProbe(_0x104f5d, _0x86d5f = {}) {
  globalThis.window?.__runtimeCompareMark?.("local-media-blob:" + _0x104f5d, _0x86d5f);
}
function throwIfAborted(_0x53fb16) {
  if (!_0x53fb16?.aborted) {
    return;
  }
  if (typeof _0x53fb16.throwIfAborted === "function") {
    _0x53fb16.throwIfAborted();
  }
  throw new DOMException("The operation was aborted", "AbortError");
}
async function yieldToMainThread(_0x41b0ae) {
  await new Promise(_0xdc730d => setTimeout(_0xdc730d, 0));
  throwIfAborted(_0x41b0ae);
}
async function readBoundedResponseBlob(_0x44d8d3, _0x6bf620, {
  signal = null,
  url = ""
} = {}) {
  const _0x5ef64c = nowMs();
  if (typeof _0x44d8d3.body?.getReader !== "function") {
    markLocalPlaybackProbe("body-read-start", {
      url: url,
      streamed: false
    });
    const _0x1562f8 = await _0x44d8d3.blob();
    markLocalPlaybackProbe("body-read-end", {
      url: url,
      streamed: false,
      blobSize: Number(_0x1562f8?.size || 0),
      durationMs: nowMs() - _0x5ef64c
    });
    if (_0x1562f8?.size > 0 && _0x1562f8.size <= _0x6bf620) {
      return _0x1562f8;
    } else {
      return null;
    }
  }
  const _0x173438 = _0x44d8d3.body.getReader();
  const _0x382b95 = [];
  let _0xde74dd = 0;
  let _0x388e6a = 0;
  let _0x3cd7ea = 0;
  markLocalPlaybackProbe("body-read-start", {
    url: url,
    streamed: true
  });
  try {
    while (true) {
      throwIfAborted(signal);
      const {
        done: _0x4391e3,
        value: _0x1ac8b1
      } = await _0x173438.read();
      if (_0x4391e3) {
        break;
      }
      _0x388e6a += 1;
      const _0x12df02 = Number(_0x1ac8b1?.byteLength || _0x1ac8b1?.length || 0);
      _0xde74dd += _0x12df02;
      if (_0xde74dd > _0x6bf620) {
        try {
          await _0x173438.cancel();
        } catch {}
        return null;
      }
      if (_0x12df02 > 0) {
        _0x382b95.push(_0x1ac8b1);
      }
      if (_0x388e6a % STREAM_READ_YIELD_EVERY_CHUNKS === 0) {
        _0x3cd7ea += 1;
        if (_0x3cd7ea === 1) {
          markLocalPlaybackProbe("body-read-yield", {
            url: url,
            chunkCount: _0x388e6a,
            totalBytes: _0xde74dd
          });
        }
        await yieldToMainThread(signal);
      }
    }
  } finally {
    try {
      _0x173438.releaseLock?.();
    } catch {}
  }
  if (!(_0xde74dd > 0)) {
    return null;
  }
  const _0x4afc05 = nowMs();
  markLocalPlaybackProbe("blob-construct-start", {
    url: url,
    chunkCount: _0x388e6a,
    totalBytes: _0xde74dd
  });
  const _0x32adf6 = new Blob(_0x382b95, {
    type: String(_0x44d8d3.headers?.get?.("content-type") || "")
  });
  markLocalPlaybackProbe("blob-construct-end", {
    url: url,
    chunkCount: _0x388e6a,
    totalBytes: _0xde74dd,
    blobSize: Number(_0x32adf6.size || 0),
    durationMs: nowMs() - _0x4afc05
  });
  markLocalPlaybackProbe("body-read-end", {
    url: url,
    streamed: true,
    chunkCount: _0x388e6a,
    totalBytes: _0xde74dd,
    yieldCount: _0x3cd7ea,
    durationMs: nowMs() - _0x5ef64c
  });
  return _0x32adf6;
}
export async function fetchLocalMediaPlaybackBlob(_0x14eb90, {
  signal: _0x5d9779,
  timeout = DEFAULT_LOCAL_MEDIA_PLAYBACK_TIMEOUT_MS,
  maxBytes = DEFAULT_LOCAL_MEDIA_PLAYBACK_MAX_BYTES,
  resultMode = "legacy"
} = {}) {
  const _0x512c71 = String(_0x14eb90 || "").trim();
  if (!_0x512c71) {
    markLocalPlaybackProbe("empty-url");
    return playbackFetchResult(resultMode, "empty-url");
  }
  const _0x187508 = Number.isFinite(Number(maxBytes)) ? Math.max(0, Number(maxBytes)) : DEFAULT_LOCAL_MEDIA_PLAYBACK_MAX_BYTES;
  const _0x352549 = Number.isFinite(Number(timeout)) ? Math.max(0, Number(timeout)) : DEFAULT_LOCAL_MEDIA_PLAYBACK_TIMEOUT_MS;
  const _0x4f45c9 = new AbortController();
  let _0x593af2 = "";
  const _0x27902e = setTimeout(() => {
    if (!_0x4f45c9.signal.aborted) {
      _0x593af2 = "timeout";
    }
    _0x4f45c9.abort();
  }, _0x352549);
  let _0x438f2f = null;
  if (_0x5d9779) {
    if (_0x5d9779.aborted) {
      _0x593af2 = "aborted";
      _0x4f45c9.abort();
    } else {
      _0x438f2f = () => {
        if (!_0x4f45c9.signal.aborted) {
          _0x593af2 = "aborted";
        }
        _0x4f45c9.abort();
      };
      _0x5d9779.addEventListener("abort", _0x438f2f, {
        once: true
      });
    }
  }
  try {
    const _0x438e96 = await fetch(_0x512c71, {
      method: "GET",
      cache: "no-store",
      signal: _0x4f45c9.signal
    });
    if (!_0x438e96?.ok) {
      const _0x50f4c8 = Number(_0x438e96?.status || 0);
      markLocalPlaybackProbe("response-error", {
        url: _0x512c71,
        status: _0x50f4c8
      });
      return playbackFetchResult(resultMode, _0x50f4c8 === 404 || _0x50f4c8 === 410 ? "hard-missing" : "http-error", null, _0x50f4c8);
    }
    const _0x49b277 = Number(_0x438e96.headers?.get?.("content-length") || 0);
    if (_0x49b277 > _0x187508) {
      try {
        await _0x438e96.body?.cancel?.();
      } catch {}
      markLocalPlaybackProbe("over-limit", {
        url: _0x512c71,
        contentLength: _0x49b277,
        byteLimit: _0x187508
      });
      return playbackFetchResult(resultMode, "over-limit");
    }
    const _0x440305 = await readBoundedResponseBlob(_0x438e96, _0x187508, {
      signal: _0x4f45c9.signal,
      url: _0x512c71
    });
    markLocalPlaybackProbe(_0x440305 ? "ready" : "empty-body", {
      url: _0x512c71,
      contentLength: _0x49b277,
      blobSize: Number(_0x440305?.size || 0),
      blobType: String(_0x440305?.type || "")
    });
    return playbackFetchResult(resultMode, _0x440305 ? "ready" : "empty-body", _0x440305);
  } catch (_0x26c82a) {
    markLocalPlaybackProbe("failed", {
      url: _0x512c71,
      error: String(_0x26c82a?.name || _0x26c82a?.message || _0x26c82a || "error")
    });
    if (resultMode === TYPED_RESULT_MODE) {
      if (_0x4f45c9.signal.aborted) {
        return playbackFetchResult(resultMode, _0x593af2 === "timeout" ? "timeout" : "aborted");
      }
      return playbackFetchResult(resultMode, "failed");
    }
    throw _0x26c82a;
  } finally {
    clearTimeout(_0x27902e);
    if (_0x5d9779 && _0x438f2f) {
      _0x5d9779.removeEventListener("abort", _0x438f2f);
    }
  }
}