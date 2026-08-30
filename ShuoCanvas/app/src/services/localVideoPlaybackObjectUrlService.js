import { fetchLocalMediaPlaybackBlob } from "../../api/localMediaPlaybackApi.js";
import { createTrackedMediaObjectUrl, revokeTrackedMediaObjectUrl } from "./mediaObjectUrlRegistry.js";
const LOCAL_VIDEO_PLAYBACK_MAX_BYTES = 33554432;
const LOCAL_VIDEO_PLAYBACK_MAX_REQUEST_BYTES = 134217728;
const LOCAL_VIDEO_WARMUP_MAX_BYTES = 8388608;
const LOCAL_VIDEO_WARMUP_TOTAL_BYTES = 25165824;
const LOCAL_VIDEO_WARMUP_TTL_MS = 15000;
const LOCAL_VIDEO_PLAYBACK_TIMEOUT_MS = 1500;
const LOCAL_VIDEO_PLAYBACK_MAX_REQUEST_TIMEOUT_MS = 15000;
const LOCAL_VIDEO_PLAYBACK_CONCURRENCY = 2;
const LOCAL_VIDEO_PATH_RE = /^\/(?:output|data\/assets|data\/uploads)\//i;
const entriesBySource = new Map();
const sourceByOwner = new Map();
const sourcesByWarmupScope = new Map();
const warmupBypassUntilBySource = new Map();
let queuedEntries = [];
let activeFetchCount = 0;
function resolveCanonicalLocalSource(_0x7273b7) {
  const _0x23307b = String(_0x7273b7 || "").trim();
  const _0x1f82d5 = globalThis.location || globalThis.window?.location;
  const _0x12ca27 = String(_0x1f82d5?.href || "").trim();
  const _0x4505a8 = String(_0x1f82d5?.origin || "").trim();
  if (!_0x23307b || !_0x12ca27 || !_0x4505a8 || _0x4505a8 === "null") {
    return "";
  }
  try {
    const _0x48b9e7 = new URL(_0x23307b, _0x12ca27);
    if (_0x48b9e7.origin !== _0x4505a8 || _0x48b9e7.username || _0x48b9e7.password || !LOCAL_VIDEO_PATH_RE.test(_0x48b9e7.pathname)) {
      return "";
    }
    _0x48b9e7.hash = "";
    return _0x48b9e7.href;
  } catch {
    return "";
  }
}
function isWarmupBypassed(_0x264548) {
  const _0x4e06fb = Number(warmupBypassUntilBySource.get(_0x264548) || 0);
  if (!(_0x4e06fb > Date.now())) {
    warmupBypassUntilBySource.delete(_0x264548);
    return false;
  }
  return true;
}
function hasReferences(_0x355de3) {
  return _0x355de3.ownerRefs.size > 0 || _0x355de3.warmupRefs.size > 0 || _0x355de3.handoffRetained === true;
}
function clearWarmupExpiry(_0x39fadb) {
  if (_0x39fadb?.warmupExpiryTimer == null) {
    return;
  }
  clearTimeout(_0x39fadb.warmupExpiryTimer);
  _0x39fadb.warmupExpiryTimer = null;
}
function getWarmupBlobBytes(_0x55556f = null) {
  let _0x19ae0c = 0;
  for (const _0x28d8cd of entriesBySource.values()) {
    if (_0x28d8cd === _0x55556f || !_0x28d8cd.blob || _0x28d8cd.ownerRefs.size > 0) {
      continue;
    }
    _0x19ae0c += Number(_0x28d8cd.blob.size || 0);
  }
  return _0x19ae0c;
}
function expireWarmupEntry(_0x34dcbb) {
  clearWarmupExpiry(_0x34dcbb);
  if (!_0x34dcbb || _0x34dcbb.ownerRefs.size > 0) {
    return;
  }
  for (const _0x652561 of _0x34dcbb.warmupRefs) {
    const _0x34464d = sourcesByWarmupScope.get(_0x652561);
    _0x34464d?.delete(_0x34dcbb.sourceUrl);
    if (_0x34464d?.size === 0) {
      sourcesByWarmupScope.delete(_0x652561);
    }
  }
  _0x34dcbb.warmupRefs.clear();
  _0x34dcbb.handoffRetained = false;
  removeEntryIfUnreferenced(_0x34dcbb);
}
function scheduleWarmupExpiry(_0x58bfd5) {
  clearWarmupExpiry(_0x58bfd5);
  if (!_0x58bfd5 || _0x58bfd5.ownerRefs.size > 0) {
    return;
  }
  _0x58bfd5.warmupExpiryTimer = setTimeout(() => expireWarmupEntry(_0x58bfd5), LOCAL_VIDEO_WARMUP_TTL_MS);
  _0x58bfd5.warmupExpiryTimer?.unref?.();
}
function evictWarmupBlobsForBudget(_0x6e1ba3, _0x3f8413 = null) {
  let _0x1518f3 = getWarmupBlobBytes(_0x3f8413);
  if (_0x1518f3 + _0x6e1ba3 <= LOCAL_VIDEO_WARMUP_TOTAL_BYTES) {
    return true;
  }
  const _0x4afa70 = Array.from(entriesBySource.values()).filter(_0x1dacb6 => _0x1dacb6 !== _0x3f8413 && _0x1dacb6.blob && _0x1dacb6.ownerRefs.size === 0).sort((_0x293bdc, _0x3b8c) => Number(_0x293bdc.blobReadyAt || 0) - Number(_0x3b8c.blobReadyAt || 0));
  for (const _0x5c26b5 of _0x4afa70) {
    const _0xc4c360 = Number(_0x5c26b5.blob?.size || 0);
    expireWarmupEntry(_0x5c26b5);
    _0x1518f3 = Math.max(0, _0x1518f3 - _0xc4c360);
    if (_0x1518f3 + _0x6e1ba3 <= LOCAL_VIDEO_WARMUP_TOTAL_BYTES) {
      return true;
    }
  }
  return _0x1518f3 + _0x6e1ba3 <= LOCAL_VIDEO_WARMUP_TOTAL_BYTES;
}
function settleEntry(_0x4aaa36, _0x59f013 = "") {
  if (_0x4aaa36.settled) {
    return;
  }
  _0x4aaa36.settled = true;
  _0x4aaa36.resolvePromise(_0x59f013);
}
function createPlaybackResult(_0x3c5e7c, _0x50bbb5 = "", _0x57d56b = 0) {
  return {
    status: String(_0x3c5e7c || "failed"),
    playbackUrl: String(_0x50bbb5 || ""),
    httpStatus: Number(_0x57d56b || 0)
  };
}
function disposeEntry(_0x330cd3) {
  if (!_0x330cd3 || _0x330cd3.disposed) {
    return;
  }
  _0x330cd3.disposed = true;
  clearWarmupExpiry(_0x330cd3);
  _0x330cd3.controller.abort();
  _0x330cd3.queued = false;
  if (_0x330cd3.objectUrl) {
    revokeTrackedMediaObjectUrl(_0x330cd3.objectUrl);
    _0x330cd3.objectUrl = "";
  }
  _0x330cd3.blob = null;
  settleEntry(_0x330cd3, "");
}
function syncEntryObjectUrl(_0x28c725) {
  if (!_0x28c725 || _0x28c725.disposed) {
    return "";
  }
  if (_0x28c725.ownerRefs.size === 0) {
    if (_0x28c725.objectUrl) {
      revokeTrackedMediaObjectUrl(_0x28c725.objectUrl);
      _0x28c725.objectUrl = "";
    }
    scheduleWarmupExpiry(_0x28c725);
    return "";
  }
  _0x28c725.handoffRetained = false;
  clearWarmupExpiry(_0x28c725);
  if (!_0x28c725.objectUrl && _0x28c725.blob) {
    _0x28c725.objectUrl = createTrackedMediaObjectUrl(_0x28c725.blob, {
      kind: "video",
      ownerId: _0x28c725.firstOwnerId,
      sourceUrl: _0x28c725.sourceUrl
    });
  }
  return _0x28c725.objectUrl;
}
function removeEntryIfUnreferenced(_0x2793a2) {
  if (!_0x2793a2 || hasReferences(_0x2793a2)) {
    return false;
  }
  if (entriesBySource.get(_0x2793a2.sourceUrl) === _0x2793a2) {
    entriesBySource.delete(_0x2793a2.sourceUrl);
  }
  disposeEntry(_0x2793a2);
  return true;
}
function createEntry(_0x5a31a0, _0x5675a2 = "") {
  let _0x40e06a;
  const _0x493f3b = new Promise(_0x12fe21 => {
    _0x40e06a = _0x12fe21;
  });
  const _0x122680 = {
    sourceUrl: _0x5a31a0,
    firstOwnerId: String(_0x5675a2 || ""),
    playbackMaxBytes: LOCAL_VIDEO_PLAYBACK_MAX_BYTES,
    playbackTimeoutMs: LOCAL_VIDEO_PLAYBACK_TIMEOUT_MS,
    ownerRefs: new Set(),
    warmupRefs: new Set(),
    handoffRetained: false,
    controller: new AbortController(),
    blob: null,
    blobReadyAt: 0,
    objectUrl: "",
    status: "pending",
    httpStatus: 0,
    promise: _0x493f3b,
    resolvePromise: _0x40e06a,
    settled: false,
    disposed: false,
    queued: false,
    active: false,
    bypassConcurrencyLimitRequested: false,
    warmupExpiryTimer: null
  };
  entriesBySource.set(_0x5a31a0, _0x122680);
  return _0x122680;
}
function getOrCreateEntry(_0x3ae8ea, _0x47d748 = "") {
  return entriesBySource.get(_0x3ae8ea) || createEntry(_0x3ae8ea, _0x47d748);
}
function removeOwnerReference(_0x771cf7) {
  const _0xc53c33 = String(_0x771cf7 || "").trim();
  const _0x2b2298 = sourceByOwner.get(_0xc53c33);
  if (!_0xc53c33 || !_0x2b2298) {
    return false;
  }
  sourceByOwner.delete(_0xc53c33);
  const _0x3aa2cc = entriesBySource.get(_0x2b2298);
  if (!_0x3aa2cc) {
    return false;
  }
  _0x3aa2cc.ownerRefs.delete(_0xc53c33);
  syncEntryObjectUrl(_0x3aa2cc);
  removeEntryIfUnreferenced(_0x3aa2cc);
  return true;
}
async function startEntryFetch(_0x3134d9) {
  _0x3134d9.active = true;
  activeFetchCount += 1;
  const _0x44376a = _0x3134d9.ownerRefs.size === 0;
  let _0x15ea89 = false;
  const _0x9a31c = () => _0x44376a && _0x3134d9.ownerRefs.size > 0 && !_0x3134d9.disposed && !_0x3134d9.controller.signal.aborted && entriesBySource.get(_0x3134d9.sourceUrl) === _0x3134d9;
  try {
    const _0x46c531 = await fetchLocalMediaPlaybackBlob(_0x3134d9.sourceUrl, {
      signal: _0x3134d9.controller.signal,
      timeout: _0x44376a ? LOCAL_VIDEO_PLAYBACK_TIMEOUT_MS : _0x3134d9.playbackTimeoutMs,
      maxBytes: _0x44376a ? LOCAL_VIDEO_WARMUP_MAX_BYTES : _0x3134d9.playbackMaxBytes,
      resultMode: "typed"
    });
    const _0x5c27fa = _0x46c531?.blob || null;
    _0x3134d9.status = String(_0x46c531?.status || (_0x5c27fa ? "ready" : "failed"));
    _0x3134d9.httpStatus = Number(_0x46c531?.httpStatus || 0);
    if (!_0x5c27fa || _0x3134d9.disposed || _0x3134d9.controller.signal.aborted || entriesBySource.get(_0x3134d9.sourceUrl) !== _0x3134d9 || !hasReferences(_0x3134d9)) {
      if (_0x9a31c()) {
        _0x15ea89 = true;
        return;
      }
      if (_0x44376a && !_0x3134d9.disposed && !_0x3134d9.controller.signal.aborted) {
        warmupBypassUntilBySource.set(_0x3134d9.sourceUrl, Date.now() + LOCAL_VIDEO_WARMUP_TTL_MS);
      }
      settleEntry(_0x3134d9, "");
      return;
    }
    const _0x2e0164 = Number(_0x5c27fa.size || 0);
    if (_0x3134d9.ownerRefs.size === 0 && (_0x2e0164 > LOCAL_VIDEO_WARMUP_MAX_BYTES || !evictWarmupBlobsForBudget(_0x2e0164, _0x3134d9))) {
      settleEntry(_0x3134d9, "");
      return;
    }
    _0x3134d9.blob = _0x5c27fa;
    _0x3134d9.blobReadyAt = Date.now();
    _0x3134d9.status = "ready";
    _0x3134d9.httpStatus = 0;
    const _0x3b120b = syncEntryObjectUrl(_0x3134d9);
    settleEntry(_0x3134d9, _0x3b120b);
  } catch {
    _0x3134d9.status = _0x3134d9.controller.signal.aborted ? "aborted" : "failed";
    _0x3134d9.httpStatus = 0;
    if (_0x9a31c()) {
      _0x15ea89 = true;
    } else {
      settleEntry(_0x3134d9, "");
    }
  } finally {
    _0x3134d9.active = false;
    activeFetchCount = Math.max(0, activeFetchCount - 1);
    if (_0x15ea89) {
      _0x3134d9.controller = new AbortController();
      _0x3134d9.status = "pending";
      _0x3134d9.httpStatus = 0;
      enqueueEntry(_0x3134d9, {
        urgent: true,
        bypassConcurrencyLimit: _0x3134d9.bypassConcurrencyLimitRequested
      });
    } else if (!_0x3134d9.blob && !_0x3134d9.objectUrl && entriesBySource.get(_0x3134d9.sourceUrl) === _0x3134d9) {
      entriesBySource.delete(_0x3134d9.sourceUrl);
      for (const _0xcc8c9b of _0x3134d9.ownerRefs) {
        if (sourceByOwner.get(_0xcc8c9b) === _0x3134d9.sourceUrl) {
          sourceByOwner.delete(_0xcc8c9b);
        }
      }
      _0x3134d9.ownerRefs.clear();
      _0x3134d9.warmupRefs.clear();
    }
    drainQueue();
  }
}
function drainQueue() {
  while (activeFetchCount < LOCAL_VIDEO_PLAYBACK_CONCURRENCY && queuedEntries.length > 0) {
    const _0x50a68f = queuedEntries.shift();
    if (!_0x50a68f) {
      continue;
    }
    _0x50a68f.queued = false;
    if (_0x50a68f.disposed || _0x50a68f.active || _0x50a68f.objectUrl || entriesBySource.get(_0x50a68f.sourceUrl) !== _0x50a68f || !hasReferences(_0x50a68f)) {
      continue;
    }
    startEntryFetch(_0x50a68f);
  }
}
function enqueueEntry(_0xebdc36, {
  urgent = false,
  bypassConcurrencyLimit = false
} = {}) {
  if (!_0xebdc36 || _0xebdc36.disposed || _0xebdc36.active || _0xebdc36.blob || _0xebdc36.objectUrl) {
    return;
  }
  if (bypassConcurrencyLimit) {
    if (_0xebdc36.queued) {
      queuedEntries = queuedEntries.filter(_0x1d2754 => _0x1d2754 !== _0xebdc36);
      _0xebdc36.queued = false;
    }
    startEntryFetch(_0xebdc36);
    return;
  }
  if (_0xebdc36.queued) {
    if (urgent) {
      queuedEntries = [_0xebdc36, ...queuedEntries.filter(_0x58042f => _0x58042f !== _0xebdc36)];
    }
    return;
  }
  _0xebdc36.queued = true;
  if (urgent) {
    queuedEntries.unshift(_0xebdc36);
  } else {
    queuedEntries.push(_0xebdc36);
  }
  drainQueue();
}
function removeOwnerReferenceForSource(_0x1df05a, _0x1f35f2) {
  const _0xfdbfcb = String(_0x1df05a || "").trim();
  const _0x32eb0b = String(_0x1f35f2 || "").trim();
  if (!_0xfdbfcb || !_0x32eb0b || sourceByOwner.get(_0xfdbfcb) !== _0x32eb0b) {
    return false;
  }
  return removeOwnerReference(_0xfdbfcb);
}
function waitForPlaybackEntry(_0x2d0915, _0x4588c5, _0x4fd4aa, {
  signal: _0x4e4fef,
  timeout: _0x2e2acf
} = {}) {
  if (_0x2d0915.settled) {
    return Promise.resolve("settled");
  }
  const _0x228302 = Number.isFinite(Number(_0x2e2acf)) ? Math.max(0, Number(_0x2e2acf)) : LOCAL_VIDEO_PLAYBACK_TIMEOUT_MS;
  return new Promise(_0x35b6c7 => {
    let _0x83fce1 = false;
    let _0x4da139 = null;
    let _0x16908f = null;
    const _0x21a86c = _0x88cf3b => {
      if (_0x83fce1) {
        return;
      }
      _0x83fce1 = true;
      if (_0x4da139 !== null) {
        clearTimeout(_0x4da139);
      }
      if (_0x4e4fef && _0x16908f) {
        _0x4e4fef.removeEventListener?.("abort", _0x16908f);
      }
      _0x35b6c7(_0x88cf3b);
    };
    if (_0x4e4fef?.aborted) {
      _0x21a86c("aborted");
      return;
    }
    if (_0x4e4fef) {
      _0x16908f = () => _0x21a86c("aborted");
      _0x4e4fef.addEventListener?.("abort", _0x16908f, {
        once: true
      });
    }
    if (_0x228302 > 0) {
      _0x4da139 = setTimeout(() => _0x21a86c("timeout"), _0x228302);
      _0x4da139?.unref?.();
    }
    _0x2d0915.promise.then(() => _0x21a86c("settled"), () => _0x21a86c("settled"));
  }).then(_0x59c804 => {
    if (_0x59c804 !== "settled") {
      removeOwnerReferenceForSource(_0x4588c5, _0x4fd4aa);
    }
    return _0x59c804;
  });
}
export async function acquireLocalVideoPlaybackObjectUrlResult(_0x4a3db2, _0x3d44ee, {
  bypassConcurrencyLimit = false,
  maxBytes = LOCAL_VIDEO_PLAYBACK_MAX_BYTES,
  timeout = LOCAL_VIDEO_PLAYBACK_TIMEOUT_MS,
  signal = null
} = {}) {
  const _0x1114c9 = resolveCanonicalLocalSource(_0x4a3db2);
  const _0x232844 = String(_0x3d44ee || "").trim();
  if (!_0x232844) {
    return createPlaybackResult("missing-owner");
  }
  const _0x485433 = sourceByOwner.get(_0x232844) || "";
  if (!_0x1114c9) {
    removeOwnerReference(_0x232844);
    return createPlaybackResult("not-local");
  }
  if (_0x485433 && _0x485433 !== _0x1114c9) {
    removeOwnerReference(_0x232844);
  }
  warmupBypassUntilBySource.delete(_0x1114c9);
  const _0x2f94e1 = getOrCreateEntry(_0x1114c9, _0x232844);
  _0x2f94e1.playbackMaxBytes = Math.max(_0x2f94e1.playbackMaxBytes, Math.min(LOCAL_VIDEO_PLAYBACK_MAX_REQUEST_BYTES, Math.max(LOCAL_VIDEO_PLAYBACK_MAX_BYTES, Math.trunc(Number(maxBytes) || 0))));
  _0x2f94e1.playbackTimeoutMs = Math.max(_0x2f94e1.playbackTimeoutMs, Math.min(LOCAL_VIDEO_PLAYBACK_MAX_REQUEST_TIMEOUT_MS, Math.max(LOCAL_VIDEO_PLAYBACK_TIMEOUT_MS, Math.trunc(Number(timeout) || 0))));
  if (!_0x2f94e1.firstOwnerId || _0x2f94e1.firstOwnerId.startsWith("warmup:")) {
    _0x2f94e1.firstOwnerId = _0x232844;
  }
  _0x2f94e1.ownerRefs.add(_0x232844);
  sourceByOwner.set(_0x232844, _0x1114c9);
  if (bypassConcurrencyLimit) {
    _0x2f94e1.bypassConcurrencyLimitRequested = true;
  }
  const _0x27b2b0 = syncEntryObjectUrl(_0x2f94e1);
  if (_0x27b2b0) {
    return createPlaybackResult("ready", _0x27b2b0);
  }
  enqueueEntry(_0x2f94e1, {
    urgent: true,
    bypassConcurrencyLimit: bypassConcurrencyLimit
  });
  const _0x4e3866 = await waitForPlaybackEntry(_0x2f94e1, _0x232844, _0x1114c9, {
    signal: signal,
    timeout: timeout
  });
  if (_0x4e3866 === "timeout") {
    return createPlaybackResult("timeout");
  }
  if (_0x4e3866 === "aborted") {
    return createPlaybackResult("aborted");
  }
  const _0x4ceb95 = syncEntryObjectUrl(_0x2f94e1);
  if (sourceByOwner.get(_0x232844) === _0x1114c9 && _0x2f94e1.ownerRefs.has(_0x232844) && _0x4ceb95) {
    return createPlaybackResult("ready", _0x4ceb95);
  }
  return createPlaybackResult(_0x2f94e1.status, "", _0x2f94e1.httpStatus);
}
export async function acquireLocalVideoPlaybackObjectUrl(_0x134268, _0x106f22, _0x323123 = {}) {
  const _0x2cc4f7 = await acquireLocalVideoPlaybackObjectUrlResult(_0x134268, _0x106f22, _0x323123);
  return _0x2cc4f7.playbackUrl;
}
export function releaseLocalVideoPlaybackObjectUrlOwner(_0x60214c) {
  return removeOwnerReference(_0x60214c);
}
export function releaseLocalVideoPlaybackObjectUrlOwnerScope(_0x571810) {
  const _0x5bf47a = String(_0x571810 || "").trim();
  if (!_0x5bf47a) {
    return 0;
  }
  let _0x2635d4 = 0;
  for (const _0x2cb3a3 of Array.from(sourceByOwner.keys())) {
    if (_0x2cb3a3 === _0x5bf47a || _0x2cb3a3.startsWith(_0x5bf47a + ":")) {
      _0x2635d4 += removeOwnerReference(_0x2cb3a3) ? 1 : 0;
    }
  }
  return _0x2635d4;
}
export function syncLocalVideoPlaybackWarmupSources(_0x17d533, {
  scope = "canvas-low-zoom",
  maxSources = 3
} = {}) {
  const _0xbc9de2 = String(scope || "").trim();
  if (!_0xbc9de2) {
    return {
      sources: [],
      scheduledCount: 0
    };
  }
  const _0x189e57 = Math.max(0, Math.min(3, Math.trunc(Number(maxSources) || 0)));
  const _0x2c9acb = [];
  const _0x607a8f = new Set();
  for (const _0x5a783f of _0x17d533 || []) {
    const _0x5b6e96 = resolveCanonicalLocalSource(_0x5a783f);
    if (!_0x5b6e96 || _0x607a8f.has(_0x5b6e96)) {
      continue;
    }
    _0x607a8f.add(_0x5b6e96);
    _0x2c9acb.push(_0x5b6e96);
    if (_0x2c9acb.length >= _0x189e57) {
      break;
    }
  }
  const _0x22d284 = sourcesByWarmupScope.get(_0xbc9de2) || new Set();
  const _0x2b27c8 = new Set(_0x2c9acb);
  for (const _0x2faeec of _0x22d284) {
    if (_0x2b27c8.has(_0x2faeec)) {
      continue;
    }
    const _0xb184cd = entriesBySource.get(_0x2faeec);
    _0xb184cd?.warmupRefs.delete(_0xbc9de2);
    if (_0xb184cd && _0xb184cd.ownerRefs.size === 0 && _0xb184cd.warmupRefs.size === 0 && (_0xb184cd.blob || _0xb184cd.active || _0xb184cd.queued)) {
      _0xb184cd.handoffRetained = true;
      scheduleWarmupExpiry(_0xb184cd);
    } else {
      removeEntryIfUnreferenced(_0xb184cd);
    }
  }
  if (_0x2b27c8.size > 0) {
    sourcesByWarmupScope.set(_0xbc9de2, _0x2b27c8);
  } else {
    sourcesByWarmupScope.delete(_0xbc9de2);
  }
  for (const _0x5f01a7 of _0x2c9acb) {
    if (isWarmupBypassed(_0x5f01a7)) {
      continue;
    }
    const _0x4f6e3d = getOrCreateEntry(_0x5f01a7, "warmup:" + _0xbc9de2);
    _0x4f6e3d.handoffRetained = false;
    _0x4f6e3d.warmupRefs.add(_0xbc9de2);
    scheduleWarmupExpiry(_0x4f6e3d);
    enqueueEntry(_0x4f6e3d);
  }
  return {
    sources: _0x2c9acb,
    scheduledCount: _0x2c9acb.length
  };
}
export function clearLocalVideoPlaybackWarmupScope(_0x25d200 = "canvas-low-zoom") {
  const _0x5049ff = String(_0x25d200 || "").trim();
  const _0x5195bc = sourcesByWarmupScope.get(_0x5049ff)?.size || 0;
  syncLocalVideoPlaybackWarmupSources([], {
    scope: _0x5049ff,
    maxSources: 0
  });
  return _0x5195bc;
}
export const __localVideoPlaybackObjectUrlServiceForTest = {
  clear() {
    for (const _0x7ba1cc of entriesBySource.values()) {
      disposeEntry(_0x7ba1cc);
    }
    entriesBySource.clear();
    sourceByOwner.clear();
    sourcesByWarmupScope.clear();
    warmupBypassUntilBySource.clear();
    queuedEntries = [];
    activeFetchCount = 0;
  },
  snapshot() {
    return {
      activeFetchCount: activeFetchCount,
      queuedCount: queuedEntries.filter(_0x267472 => _0x267472.queued).length,
      warmupBlobBytes: getWarmupBlobBytes(),
      warmupBypassedSources: Array.from(warmupBypassUntilBySource.keys()),
      entries: Array.from(entriesBySource.values()).map(_0x4c030a => ({
        sourceUrl: _0x4c030a.sourceUrl,
        blobSize: Number(_0x4c030a.blob?.size || 0),
        objectUrl: _0x4c030a.objectUrl,
        status: _0x4c030a.status,
        httpStatus: _0x4c030a.httpStatus,
        ownerRefs: Array.from(_0x4c030a.ownerRefs),
        warmupRefs: Array.from(_0x4c030a.warmupRefs),
        handoffRetained: _0x4c030a.handoffRetained === true,
        queued: _0x4c030a.queued,
        active: _0x4c030a.active,
        aborted: _0x4c030a.controller.signal.aborted
      }))
    };
  }
};