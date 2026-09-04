import { localPathToUrl, urlToLocalPath } from "../utils/localMediaPath.js";
const DEFAULT_IMAGE_PRELOAD_CONCURRENCY = 6;
const DEFAULT_PAUSED_BYPASS_PRIORITY = 95;
const DEFAULT_IMAGE_PRELOAD_TIMEOUT_MS = 5000;
const DEFAULT_IMAGE_PRELOAD_CACHE_TTL_MS = 30000;
const DEFAULT_IMAGE_PRELOAD_REJECT_TTL_MS = 12000;
const MAX_IMAGE_PRELOAD_CACHE_ENTRIES = 512;
const HIGH_PRIORITY_OVERFLOW_THRESHOLD = 100;
const HIGH_PRIORITY_OVERFLOW_EXTRA_SLOTS = 1;
const imagePreloadQueue = [];
const imagePreloadInflight = new Map();
const imagePreloadQueuedJobs = new Map();
const imagePreloadActiveJobs = new Map();
const imagePreloadResolvedCache = new Map();
const imagePreloadRejectedCache = new Map();
const imageDisplayLoadsByKey = new Map();
const imageDisplayLoadByElement = new WeakMap();
let sharedCanvasImageElements = new WeakSet();
let imagePreloadActive = 0;
let imagePreloadSequence = 0;
let imagePreloadStarted = 0;
let imagePreloadResolved = 0;
let imagePreloadRejected = 0;
let imagePreloadDeduped = 0;
let imagePreloadCacheHits = 0;
let imagePreloadRejectCacheHits = 0;
let imagePreloadPromoted = 0;
let imagePreloadPeakActive = 0;
let imagePreloadCanceled = 0;
let imagePreloadResolvedCachePrimes = 0;
let imagePreloadPaused = false;
let imagePreloadPausedBypassPriority = DEFAULT_PAUSED_BYPASS_PRIORITY;
const imagePreloadPauseSources = new Set();
function normalizeUrl(_0x2d8dac) {
  return String(_0x2d8dac || "").trim();
}
function normalizeImagePreloadKey(_0x27a339) {
  const _0x17a3c8 = normalizeUrl(_0x27a339);
  if (!_0x17a3c8) {
    return "";
  }
  const _0x4645f0 = urlToLocalPath(_0x17a3c8);
  if (_0x4645f0) {
    return localPathToUrl(_0x4645f0) || _0x17a3c8;
  } else {
    return _0x17a3c8;
  }
}
function nowMs() {
  return Date.now();
}
function isLikelyVideoUrl(_0x115c9b) {
  return /\.(?:mp4|mov|webm|m4v|avi|mkv)(?:[?#].*)?$/i.test(String(_0x115c9b || "").trim());
}
function isLikelyAudioUrl(_0xd98045) {
  return /\.(?:mp3|wav|m4a|aac|flac|ogg|opus|wma)(?:[?#].*)?$/i.test(String(_0xd98045 || "").trim());
}
function isLikelyNonImageMediaUrl(_0x1e3e8f) {
  const _0x41e0e8 = String(_0x1e3e8f || "").trim();
  return isLikelyVideoUrl(_0x41e0e8) || isLikelyAudioUrl(_0x41e0e8);
}
function configureImage(_0x34c1dc, {
  fetchPriority = "auto"
} = {}) {
  if (!_0x34c1dc) {
    return;
  }
  try {
    _0x34c1dc.decoding = "async";
  } catch {}
  try {
    if ("fetchPriority" in _0x34c1dc) {
      _0x34c1dc.fetchPriority = fetchPriority;
    }
  } catch {}
}
function normalizePriority(_0x23ff48) {
  const _0x41ef78 = Number(_0x23ff48);
  if (Number.isFinite(_0x41ef78)) {
    return _0x41ef78;
  } else {
    return 0;
  }
}
function getImagePreloadConcurrency() {
  const _0x5b7d17 = Number(globalThis.__AIC_CANVAS_IMAGE_PRELOAD_CONCURRENCY__);
  if (Number.isFinite(_0x5b7d17) && _0x5b7d17 > 0) {
    return Math.max(1, Math.floor(_0x5b7d17));
  }
  return DEFAULT_IMAGE_PRELOAD_CONCURRENCY;
}
function isImagePreloadJobEligible(_0x51ce43) {
  if (!imagePreloadPaused) {
    return true;
  }
  if (_0x51ce43?.allowWhenPaused === true) {
    return true;
  }
  if (_0x51ce43?.deferWhenPaused === true) {
    return false;
  }
  return normalizePriority(_0x51ce43?.priority) >= imagePreloadPausedBypassPriority;
}
function isImagePreloadOverflowEligible(_0x37903e) {
  return _0x37903e?.allowWhenPaused === true && _0x37903e?.deferWhenPaused !== true && normalizePriority(_0x37903e?.priority) >= HIGH_PRIORITY_OVERFLOW_THRESHOLD;
}
function pickNextImagePreloadJob({
  overflowOnly = false
} = {}) {
  let _0x39d275 = -1;
  let _0x2724e3 = null;
  for (let _0x1929d6 = 0; _0x1929d6 < imagePreloadQueue.length; _0x1929d6 += 1) {
    const _0x14b72b = imagePreloadQueue[_0x1929d6];
    if (!isImagePreloadJobEligible(_0x14b72b)) {
      continue;
    }
    if (overflowOnly && !isImagePreloadOverflowEligible(_0x14b72b)) {
      continue;
    }
    if (!_0x2724e3 || _0x14b72b.priority > _0x2724e3.priority || _0x14b72b.priority === _0x2724e3.priority && _0x14b72b.sequence < _0x2724e3.sequence) {
      _0x2724e3 = _0x14b72b;
      _0x39d275 = _0x1929d6;
    }
  }
  if (_0x39d275 < 0) {
    return null;
  }
  imagePreloadQueue.splice(_0x39d275, 1);
  imagePreloadQueuedJobs.delete(jobCacheKey(_0x2724e3));
  return _0x2724e3;
}
function jobCacheKey(_0x3e6037) {
  return _0x3e6037?.cacheKey || _0x3e6037?.url || "";
}
function summarizeImagePreloadJob(_0xd527fa) {
  if (!_0xd527fa) {
    return null;
  }
  return {
    url: String(_0xd527fa.url || ""),
    cacheKey: String(_0xd527fa.cacheKey || ""),
    scope: String(_0xd527fa.scope || ""),
    priority: normalizePriority(_0xd527fa.priority),
    fetchPriority: String(_0xd527fa.fetchPriority || "auto"),
    allowWhenPaused: _0xd527fa.allowWhenPaused === true,
    deferWhenPaused: _0xd527fa.deferWhenPaused === true,
    decode: _0xd527fa.decode === true,
    sequence: Number(_0xd527fa.sequence || 0)
  };
}
function cancelQueuedImagePreloadJob(_0x5170e2, _0x17f2bf = "canceled") {
  const _0x5339d7 = jobCacheKey(_0x5170e2);
  if (!_0x5170e2 || !imagePreloadQueuedJobs.has(_0x5339d7)) {
    return false;
  }
  imagePreloadQueuedJobs.delete(_0x5339d7);
  if (imagePreloadInflight.get(_0x5339d7) === _0x5170e2.promise) {
    imagePreloadInflight.delete(_0x5339d7);
  }
  imagePreloadCanceled += 1;
  try {
    _0x5170e2.reject(new Error("Image preload " + _0x17f2bf));
  } catch {}
  return true;
}
function shouldCancelImagePreloadJob(_0x4f0114, {
  scope: _0x3483c2,
  hasPriorityLimit: _0x422030,
  priorityLimit: _0x149871
}) {
  if (!_0x4f0114) {
    return false;
  }
  if (_0x3483c2 && _0x4f0114.scope !== _0x3483c2) {
    return false;
  }
  if (_0x422030 && normalizePriority(_0x4f0114.priority) >= _0x149871) {
    return false;
  }
  return true;
}
export function cancelQueuedCanvasImagePreloads({
  scope = "",
  belowPriority = null,
  reason = "canceled",
  includeActive = false
} = {}) {
  const _0x7b4762 = String(scope || "").trim();
  const _0x476071 = Number(belowPriority);
  const _0x1ce795 = belowPriority !== null && belowPriority !== undefined && Number.isFinite(_0x476071);
  let _0x5b3f78 = 0;
  for (let _0x2f8023 = imagePreloadQueue.length - 1; _0x2f8023 >= 0; _0x2f8023 -= 1) {
    const _0x35fa02 = imagePreloadQueue[_0x2f8023];
    if (!shouldCancelImagePreloadJob(_0x35fa02, {
      scope: _0x7b4762,
      hasPriorityLimit: _0x1ce795,
      priorityLimit: _0x476071
    })) {
      continue;
    }
    imagePreloadQueue.splice(_0x2f8023, 1);
    if (cancelQueuedImagePreloadJob(_0x35fa02, reason)) {
      _0x5b3f78 += 1;
    }
  }
  if (includeActive === true) {
    const _0x41a4d5 = Array.from(imagePreloadActiveJobs.values());
    for (const _0x2a168a of _0x41a4d5) {
      if (!shouldCancelImagePreloadJob(_0x2a168a, {
        scope: _0x7b4762,
        hasPriorityLimit: _0x1ce795,
        priorityLimit: _0x476071
      })) {
        continue;
      }
      if (typeof _0x2a168a.cancelActive === "function" && _0x2a168a.cancelActive(reason)) {
        _0x5b3f78 += 1;
      }
    }
  }
  return _0x5b3f78;
}
export function setCanvasMediaSchedulerPaused(_0x237333, _0x378fc5 = {}) {
  const _0x419b31 = _0x237333 === true;
  const _0x17eec = String(_0x378fc5.source || "default").trim() || "default";
  if (_0x419b31) {
    imagePreloadPauseSources.add(_0x17eec);
  } else {
    imagePreloadPauseSources.delete(_0x17eec);
  }
  imagePreloadPaused = imagePreloadPauseSources.size > 0;
  if (Number.isFinite(Number(_0x378fc5.bypassPriority))) {
    imagePreloadPausedBypassPriority = Number(_0x378fc5.bypassPriority);
  }
  if (!imagePreloadPaused) {
    pumpImagePreloadQueue();
  }
}
function promoteQueuedImagePreloadJob(_0x49e608, _0x49721f = {}) {
  const _0x2bbc08 = imagePreloadQueuedJobs.get(normalizeImagePreloadKey(_0x49e608));
  if (!_0x2bbc08) {
    return false;
  }
  const _0x163de9 = normalizePriority(_0x49721f.priority);
  let _0x508979 = false;
  if (_0x163de9 > _0x2bbc08.priority) {
    _0x2bbc08.priority = _0x163de9;
    _0x508979 = true;
  }
  if (_0x49721f.fetchPriority === "high" && _0x2bbc08.fetchPriority !== "high") {
    _0x2bbc08.fetchPriority = "high";
    _0x508979 = true;
  }
  if (_0x508979) {
    imagePreloadPromoted += 1;
  }
  return _0x508979;
}
function pruneResolvedImagePreloadCache(_0x27cf96 = nowMs()) {
  for (const [_0x1aed74, _0x1cd6bb] of imagePreloadResolvedCache) {
    if (!_0x1cd6bb || Number(_0x1cd6bb.expiresAt || 0) <= _0x27cf96) {
      imagePreloadResolvedCache.delete(_0x1aed74);
    }
  }
  while (imagePreloadResolvedCache.size > MAX_IMAGE_PRELOAD_CACHE_ENTRIES) {
    const _0x5fa096 = imagePreloadResolvedCache.keys().next().value;
    if (!_0x5fa096) {
      break;
    }
    imagePreloadResolvedCache.delete(_0x5fa096);
  }
}
function pruneRejectedImagePreloadCache(_0x1b9f5b = nowMs()) {
  for (const [_0x22382b, _0x3adfd5] of imagePreloadRejectedCache) {
    if (!_0x3adfd5 || Number(_0x3adfd5.expiresAt || 0) <= _0x1b9f5b) {
      imagePreloadRejectedCache.delete(_0x22382b);
    }
  }
  while (imagePreloadRejectedCache.size > MAX_IMAGE_PRELOAD_CACHE_ENTRIES) {
    const _0x16f370 = imagePreloadRejectedCache.keys().next().value;
    if (!_0x16f370) {
      break;
    }
    imagePreloadRejectedCache.delete(_0x16f370);
  }
}
function getResolvedImagePreloadCacheHit(_0x158d08, _0x580212 = {}) {
  const _0x9fe421 = normalizeImagePreloadKey(_0x158d08);
  if (!_0x9fe421) {
    return null;
  }
  const _0x3fbbec = Number.isFinite(Number(_0x580212.ttlMs)) ? Math.max(0, Number(_0x580212.ttlMs)) : DEFAULT_IMAGE_PRELOAD_CACHE_TTL_MS;
  if (_0x3fbbec <= 0) {
    return null;
  }
  const _0x2958df = imagePreloadResolvedCache.get(_0x9fe421);
  if (!_0x2958df) {
    return null;
  }
  const _0x38a8c8 = nowMs();
  if (Number(_0x2958df.expiresAt || 0) <= _0x38a8c8) {
    imagePreloadResolvedCache.delete(_0x9fe421);
    return null;
  }
  return _0x2958df.value || null;
}
function getRejectedImagePreloadCacheHit(_0x3f94eb, _0x10171e = {}) {
  const _0x454636 = normalizeImagePreloadKey(_0x3f94eb);
  if (!_0x454636) {
    return null;
  }
  const _0x2fd078 = Number.isFinite(Number(_0x10171e.rejectTtlMs)) ? Math.max(0, Number(_0x10171e.rejectTtlMs)) : DEFAULT_IMAGE_PRELOAD_REJECT_TTL_MS;
  if (_0x2fd078 <= 0) {
    return null;
  }
  const _0x837662 = imagePreloadRejectedCache.get(_0x454636);
  if (!_0x837662) {
    return null;
  }
  const _0x45ae24 = nowMs();
  if (Number(_0x837662.expiresAt || 0) <= _0x45ae24) {
    imagePreloadRejectedCache.delete(_0x454636);
    return null;
  }
  return _0x837662.error || new Error("Image preload recently failed");
}
function rememberResolvedImagePreload(_0x8b4f5c, _0x5f1bda, _0x24bc09 = {}) {
  const _0x272862 = normalizeImagePreloadKey(_0x8b4f5c);
  if (!_0x272862 || !_0x5f1bda) {
    return;
  }
  const _0x2acfc3 = Number.isFinite(Number(_0x24bc09.cacheTtlMs)) ? Math.max(0, Number(_0x24bc09.cacheTtlMs)) : DEFAULT_IMAGE_PRELOAD_CACHE_TTL_MS;
  if (_0x2acfc3 <= 0) {
    return;
  }
  const _0x4d128f = nowMs();
  imagePreloadRejectedCache.delete(_0x272862);
  imagePreloadResolvedCache.delete(_0x272862);
  imagePreloadResolvedCache.set(_0x272862, {
    expiresAt: _0x4d128f + _0x2acfc3,
    value: _0x5f1bda
  });
  pruneResolvedImagePreloadCache(_0x4d128f);
}
function rememberRejectedImagePreload(_0x663bc9, _0x582744, _0x55cea0 = {}) {
  const _0x8e2365 = normalizeImagePreloadKey(_0x663bc9);
  if (!_0x8e2365) {
    return;
  }
  const _0x2f1633 = Number.isFinite(Number(_0x55cea0.rejectTtlMs)) ? Math.max(0, Number(_0x55cea0.rejectTtlMs)) : DEFAULT_IMAGE_PRELOAD_REJECT_TTL_MS;
  if (_0x2f1633 <= 0) {
    return;
  }
  const _0xa89f95 = nowMs();
  imagePreloadRejectedCache.delete(_0x8e2365);
  imagePreloadRejectedCache.set(_0x8e2365, {
    expiresAt: _0xa89f95 + _0x2f1633,
    error: _0x582744 instanceof Error ? _0x582744 : new Error("Image preload failed")
  });
  pruneRejectedImagePreloadCache(_0xa89f95);
}
function pumpImagePreloadQueue() {
  const _0x46a194 = getImagePreloadConcurrency();
  const _0x5891c5 = _0x46a194 + HIGH_PRIORITY_OVERFLOW_EXTRA_SLOTS;
  while (imagePreloadActive < _0x5891c5 && imagePreloadQueue.length > 0) {
    const _0x1bcadf = imagePreloadActive >= _0x46a194;
    const _0x2182b7 = pickNextImagePreloadJob({
      overflowOnly: _0x1bcadf
    });
    if (!_0x2182b7) {
      return;
    }
    imagePreloadActive += 1;
    imagePreloadStarted += 1;
    imagePreloadPeakActive = Math.max(imagePreloadPeakActive, imagePreloadActive);
    const _0x2395b3 = jobCacheKey(_0x2182b7);
    imagePreloadActiveJobs.set(_0x2395b3, _0x2182b7);
    let _0x236733 = false;
    let _0x20f194 = null;
    const _0x2f3e33 = () => {
      if (_0x20f194 === null || typeof clearTimeout !== "function") {
        return;
      }
      clearTimeout(_0x20f194);
      _0x20f194 = null;
    };
    const _0x46a108 = (_0x5700e1, _0x47b175) => {
      if (_0x236733) {
        return;
      }
      _0x236733 = true;
      _0x2f3e33();
      if (imagePreloadActiveJobs.get(_0x2395b3) === _0x2182b7) {
        imagePreloadActiveJobs.delete(_0x2395b3);
      }
      imagePreloadActive = Math.max(0, imagePreloadActive - 1);
      _0x5700e1(_0x47b175);
      pumpImagePreloadQueue();
    };
    const _0x1a957b = _0x16c48c => {
      if (_0x236733) {
        return;
      }
      imagePreloadResolved += 1;
      rememberResolvedImagePreload(_0x2182b7.url, _0x16c48c, _0x2182b7);
      _0x46a108(_0x2182b7.resolve, _0x16c48c);
    };
    const _0x43c0c6 = _0x59133e => {
      if (_0x236733) {
        return;
      }
      imagePreloadRejected += 1;
      rememberRejectedImagePreload(_0x2182b7.url, _0x59133e, _0x2182b7);
      _0x46a108(_0x2182b7.reject, _0x59133e);
    };
    try {
      const _0x435186 = new Image();
      const _0x43dda7 = () => {
        try {
          _0x435186.onload = null;
          _0x435186.onerror = null;
          _0x435186.src = "";
        } catch {}
      };
      if (typeof setTimeout === "function") {
        _0x20f194 = setTimeout(() => {
          _0x43dda7();
          _0x43c0c6(new Error("Image preload timed out"));
        }, DEFAULT_IMAGE_PRELOAD_TIMEOUT_MS);
      }
      configureImage(_0x435186, {
        fetchPriority: _0x2182b7.fetchPriority
      });
      _0x2182b7.cancelActive = (_0x488b24 = "canceled") => {
        if (_0x236733) {
          return false;
        }
        imagePreloadCanceled += 1;
        _0x43dda7();
        if (imagePreloadInflight.get(_0x2395b3) === _0x2182b7.promise) {
          imagePreloadInflight.delete(_0x2395b3);
        }
        _0x46a108(_0x2182b7.reject, new Error("Image preload " + _0x488b24));
        return true;
      };
      _0x435186.onload = () => {
        if (_0x2182b7.decode === true && typeof _0x435186.decode === "function") {
          return;
        }
        _0x1a957b({
          image: _0x435186,
          naturalWidth: _0x435186.naturalWidth || 0,
          naturalHeight: _0x435186.naturalHeight || 0,
          decoded: false
        });
      };
      _0x435186.onerror = () => {
        _0x43c0c6(new Error("Image preload failed"));
      };
      _0x435186.src = _0x2182b7.url;
      if (_0x2182b7.decode === true && typeof _0x435186.decode === "function") {
        _0x435186.decode().then(() => {
          _0x1a957b({
            image: _0x435186,
            naturalWidth: _0x435186.naturalWidth || 0,
            naturalHeight: _0x435186.naturalHeight || 0,
            decoded: true
          });
        }, _0x2ca57d => {
          _0x43c0c6(_0x2ca57d || new Error("Image decode failed"));
        });
      }
    } catch (_0x484919) {
      _0x43c0c6(_0x484919);
    }
  }
}
export function preloadCanvasImage(_0x490869, _0x118527 = {}) {
  const _0x4bb5b9 = normalizeUrl(_0x490869);
  if (!_0x4bb5b9) {
    return Promise.reject(new Error("Image source is empty"));
  }
  if (isLikelyNonImageMediaUrl(_0x4bb5b9)) {
    return Promise.reject(new Error("Image preload skipped non-image media source"));
  }
  if (_0x118527.revalidate !== true) {
    const _0x3b447f = getResolvedImagePreloadCacheHit(_0x4bb5b9, {
      ttlMs: _0x118527.cacheTtlMs
    });
    if (_0x3b447f && (_0x118527.requireImage !== true || _0x3b447f.image)) {
      if (_0x118527.decode !== true || _0x3b447f.decoded === true) {
        imagePreloadCacheHits += 1;
        return Promise.resolve(_0x3b447f);
      }
      if (typeof _0x3b447f.image?.decode === "function") {
        imagePreloadCacheHits += 1;
        return _0x3b447f.image.decode().then(() => {
          const _0x8b7533 = {
            ..._0x3b447f,
            decoded: true
          };
          rememberResolvedImagePreload(_0x4bb5b9, _0x8b7533, _0x118527);
          return _0x8b7533;
        });
      }
      if (_0x3b447f.image) {
        imagePreloadCacheHits += 1;
        return Promise.resolve(_0x3b447f);
      }
    }
    const _0x48f5eb = getRejectedImagePreloadCacheHit(_0x4bb5b9, {
      rejectTtlMs: _0x118527.rejectTtlMs
    });
    if (_0x48f5eb) {
      imagePreloadRejectCacheHits += 1;
      return Promise.reject(_0x48f5eb);
    }
  }
  const _0x4be218 = normalizeImagePreloadKey(_0x4bb5b9);
  const _0x292808 = imagePreloadInflight.get(_0x4be218);
  if (_0x292808) {
    imagePreloadDeduped += 1;
    if (promoteQueuedImagePreloadJob(_0x4bb5b9, _0x118527)) {
      pumpImagePreloadQueue();
    }
    if (_0x118527.decode === true) {
      return _0x292808.then(_0x54ecfb => {
        if (_0x54ecfb?.decoded === true) {
          return _0x54ecfb;
        }
        if (typeof _0x54ecfb?.image?.decode === "function") {
          return _0x54ecfb.image.decode().then(() => {
            const _0x41f349 = {
              ..._0x54ecfb,
              decoded: true
            };
            rememberResolvedImagePreload(_0x4bb5b9, _0x41f349, _0x118527);
            return _0x41f349;
          });
        }
        if (_0x54ecfb?.image) {
          return _0x54ecfb;
        }
        return preloadCanvasImage(_0x4bb5b9, {
          ..._0x118527,
          revalidate: true
        });
      });
    }
    return _0x292808;
  }
  let _0x19b594 = null;
  const _0x33b6b9 = new Promise((_0x185cd6, _0x26ed27) => {
    _0x19b594 = {
      url: _0x4bb5b9,
      cacheKey: _0x4be218,
      resolve: _0x185cd6,
      reject: _0x26ed27,
      promise: null,
      priority: normalizePriority(_0x118527.priority),
      fetchPriority: _0x118527.fetchPriority === "high" ? "high" : "auto",
      scope: String(_0x118527.scope || "").trim(),
      allowWhenPaused: _0x118527.allowWhenPaused === true,
      deferWhenPaused: _0x118527.deferWhenPaused === true,
      cacheTtlMs: Number.isFinite(Number(_0x118527.cacheTtlMs)) ? Number(_0x118527.cacheTtlMs) : DEFAULT_IMAGE_PRELOAD_CACHE_TTL_MS,
      rejectTtlMs: Number.isFinite(Number(_0x118527.rejectTtlMs)) ? Number(_0x118527.rejectTtlMs) : DEFAULT_IMAGE_PRELOAD_REJECT_TTL_MS,
      decode: _0x118527.decode === true,
      sequence: imagePreloadSequence++
    };
  });
  const _0x358a6e = _0x33b6b9.finally(() => {
    if (imagePreloadInflight.get(_0x4be218) === _0x358a6e) {
      imagePreloadInflight.delete(_0x4be218);
    }
  });
  _0x19b594.promise = _0x358a6e;
  imagePreloadQueue.push(_0x19b594);
  imagePreloadQueuedJobs.set(_0x4be218, _0x19b594);
  imagePreloadInflight.set(_0x4be218, _0x358a6e);
  pumpImagePreloadQueue();
  return _0x358a6e;
}
export function rememberCanvasImagePreloadResolved(_0x515449, _0x2de7b9 = {}, _0x1f1c08 = {}) {
  const _0x396481 = normalizeUrl(_0x515449);
  if (!_0x396481 || isLikelyNonImageMediaUrl(_0x396481)) {
    return false;
  }
  const _0xd8644d = _0x1f1c08.retainImage === true ? _0x2de7b9?.image || null : null;
  if (_0xd8644d) {
    sharedCanvasImageElements.add(_0xd8644d);
  }
  const _0x4d435a = Math.max(0, Math.round(Number(_0x2de7b9?.naturalWidth || _0xd8644d?.naturalWidth || _0xd8644d?.width || 0) || 0));
  const _0x375356 = Math.max(0, Math.round(Number(_0x2de7b9?.naturalHeight || _0xd8644d?.naturalHeight || _0xd8644d?.height || 0) || 0));
  rememberResolvedImagePreload(_0x396481, {
    image: _0xd8644d,
    naturalWidth: _0x4d435a,
    naturalHeight: _0x375356,
    decoded: _0x2de7b9?.decoded === true || _0x1f1c08.decoded === true
  }, _0x1f1c08);
  imagePreloadResolvedCachePrimes += 1;
  return true;
}
function finishTrackedCanvasImageDisplayLoad(_0x40fc19) {
  const _0x3ad58e = imageDisplayLoadByElement.get(_0x40fc19);
  if (!_0x3ad58e) {
    return false;
  }
  imageDisplayLoadByElement.delete(_0x40fc19);
  _0x3ad58e.images.delete(_0x40fc19);
  if (_0x3ad58e.images.size === 0) {
    imageDisplayLoadsByKey.delete(_0x3ad58e.cacheKey);
  }
  _0x40fc19.removeEventListener?.("load", _0x3ad58e.onLoad);
  _0x40fc19.removeEventListener?.("error", _0x3ad58e.onError);
  return true;
}
export function trackCanvasImageDisplayLoad(_0x28e8a6, _0x399ae9) {
  const _0x3795b2 = normalizeImagePreloadKey(_0x28e8a6);
  if (!_0x3795b2 || !_0x399ae9) {
    return false;
  }
  const _0x48f051 = imageDisplayLoadByElement.get(_0x399ae9);
  if (_0x48f051?.cacheKey === _0x3795b2) {
    return true;
  }
  if (_0x48f051) {
    finishTrackedCanvasImageDisplayLoad(_0x399ae9);
  }
  let _0x7958d2 = imageDisplayLoadsByKey.get(_0x3795b2);
  if (!_0x7958d2) {
    _0x7958d2 = new Set();
    imageDisplayLoadsByKey.set(_0x3795b2, _0x7958d2);
  }
  const _0x1bb87f = {
    cacheKey: _0x3795b2,
    images: _0x7958d2,
    onLoad: () => finishTrackedCanvasImageDisplayLoad(_0x399ae9),
    onError: () => finishTrackedCanvasImageDisplayLoad(_0x399ae9)
  };
  _0x7958d2.add(_0x399ae9);
  imageDisplayLoadByElement.set(_0x399ae9, _0x1bb87f);
  _0x399ae9.addEventListener?.("load", _0x1bb87f.onLoad, {
    once: true
  });
  _0x399ae9.addEventListener?.("error", _0x1bb87f.onError, {
    once: true
  });
  return true;
}
export function forgetCanvasImageDisplayLoad(_0x5926cd) {
  return finishTrackedCanvasImageDisplayLoad(_0x5926cd);
}
export function isCanvasImageDisplayLoadPending(_0x325e0b) {
  const _0xd0f0ce = normalizeImagePreloadKey(_0x325e0b);
  return !!_0xd0f0ce && (imageDisplayLoadsByKey.get(_0xd0f0ce)?.size || 0) > 0;
}
export function isCanvasImageDisplayLoadTracked(_0x2332d7) {
  return !!_0x2332d7 && imageDisplayLoadByElement.has(_0x2332d7);
}
export function isCanvasImagePreloadSharedImage(_0x4553a) {
  return !!_0x4553a && sharedCanvasImageElements.has(_0x4553a);
}
export function isCanvasImagePreloadRecentlyResolved(_0x394858, _0x1e8554 = {}) {
  const _0x30c710 = getResolvedImagePreloadCacheHit(_0x394858, _0x1e8554);
  return !!_0x30c710 && (_0x1e8554.requireImage !== true || !!_0x30c710.image);
}
export function isCanvasImagePreloadPending(_0x535e0f) {
  const _0x2a85a4 = normalizeImagePreloadKey(_0x535e0f);
  if (!_0x2a85a4) {
    return false;
  }
  return imagePreloadActiveJobs.has(_0x2a85a4) || imagePreloadQueuedJobs.has(_0x2a85a4);
}
export function isCanvasImagePreloadCoolingDown(_0x23ec37, _0x194600 = {}) {
  return !!getRejectedImagePreloadCacheHit(_0x23ec37, {
    rejectTtlMs: _0x194600.rejectTtlMs
  });
}
export function getCanvasMediaSchedulerStats() {
  const _0x4d866f = Array.from(imagePreloadActiveJobs.values()).map(summarizeImagePreloadJob).filter(Boolean).slice(0, 24);
  const _0x38fb94 = imagePreloadQueue.map(summarizeImagePreloadJob).filter(Boolean).slice(0, 24);
  return {
    imagePreloadActive: imagePreloadActive,
    imagePreloadQueued: imagePreloadQueue.length,
    imagePreloadInflight: imagePreloadInflight.size,
    imagePreloadConcurrency: getImagePreloadConcurrency(),
    imagePreloadStarted: imagePreloadStarted,
    imagePreloadResolved: imagePreloadResolved,
    imagePreloadRejected: imagePreloadRejected,
    imagePreloadDeduped: imagePreloadDeduped,
    imagePreloadCacheHits: imagePreloadCacheHits,
    imagePreloadRejectCacheHits: imagePreloadRejectCacheHits,
    imagePreloadResolvedCacheSize: imagePreloadResolvedCache.size,
    imagePreloadRejectedCacheSize: imagePreloadRejectedCache.size,
    imagePreloadPromoted: imagePreloadPromoted,
    imagePreloadPeakActive: imagePreloadPeakActive,
    imagePreloadCanceled: imagePreloadCanceled,
    imagePreloadResolvedCachePrimes: imagePreloadResolvedCachePrimes,
    imagePreloadPaused: imagePreloadPaused,
    imagePreloadPausedBypassPriority: imagePreloadPausedBypassPriority,
    imagePreloadPauseSourceCount: imagePreloadPauseSources.size,
    imageDisplayLoadPending: Array.from(imageDisplayLoadsByKey.values()).reduce((_0x3f0a60, _0x296554) => _0x3f0a60 + _0x296554.size, 0),
    imagePreloadActiveJobSamples: _0x4d866f,
    imagePreloadQueuedJobSamples: _0x38fb94
  };
}
export function resetCanvasMediaSchedulerForTests() {
  imagePreloadQueue.length = 0;
  imagePreloadInflight.clear();
  imagePreloadQueuedJobs.clear();
  imagePreloadActiveJobs.clear();
  imagePreloadResolvedCache.clear();
  imagePreloadRejectedCache.clear();
  imageDisplayLoadsByKey.clear();
  sharedCanvasImageElements = new WeakSet();
  imagePreloadActive = 0;
  imagePreloadSequence = 0;
  imagePreloadStarted = 0;
  imagePreloadResolved = 0;
  imagePreloadRejected = 0;
  imagePreloadDeduped = 0;
  imagePreloadCacheHits = 0;
  imagePreloadRejectCacheHits = 0;
  imagePreloadPromoted = 0;
  imagePreloadPeakActive = 0;
  imagePreloadCanceled = 0;
  imagePreloadResolvedCachePrimes = 0;
  imagePreloadPaused = false;
  imagePreloadPauseSources.clear();
  imagePreloadPausedBypassPriority = DEFAULT_PAUSED_BYPASS_PRIORITY;
}