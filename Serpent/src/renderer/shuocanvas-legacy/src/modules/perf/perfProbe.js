import { getCanvasMediaSchedulerStats } from "../canvasMediaScheduler.js";
const PERF_STORE_KEY = "__aicPerfProbeStore";
const DRAG_FPS_SESSION_LIMIT = 50;
const PAN_FPS_SESSION_LIMIT = 50;
const ZOOM_FPS_SESSION_LIMIT = 50;
const RESIZE_FPS_SESSION_LIMIT = 50;
const CANVAS_PAN_SAMPLE_LIMIT = 120;
const EDGE_REDRAW_SAMPLE_LIMIT = 240;
const FAST_PREVIEW_SAMPLE_LIMIT = 240;
const RENDER_FRAME_SAMPLE_LIMIT = 240;
const NODE_LIFECYCLE_SAMPLE_LIMIT = 240;
const NODE_LIFECYCLE_TYPE_LIMIT = 10;
const NODE_LIFECYCLE_SLOW_LIMIT = 8;
const VIRTUALIZATION_SAMPLE_LIMIT = 240;
const MINIMAP_UPDATE_SAMPLE_LIMIT = 240;
const LONG_TASK_SAMPLE_LIMIT = 120;
const LONG_ANIMATION_FRAME_SAMPLE_LIMIT = 120;
const SLOW_LONG_ANIMATION_FRAME_LIMIT = 8;
const LONG_ANIMATION_FRAME_SCRIPT_LIMIT = 12;
const SCRIPT_SOURCE_URL_LIMIT = 500;
const SCRIPT_FUNCTION_NAME_LIMIT = 160;
const STATIC_MEDIA_SAMPLE_LIMIT = 20;
const DERIVED_STATIC_MEDIA_PREFIXES = Object.freeze(["/data/uploads/_derived/", "/data/assets/_derived/", "/data/assets/derived/", "/output/_derived/", "/output/VideoThumbs/"]);
const STATIC_VIDEO_PREFIXES = Object.freeze(["/output/", "/data/uploads/", "/data/assets/"]);
const STATIC_VIDEO_EXTENSIONS = Object.freeze([".mp4", ".webm", ".mov", ".m4v", ".mkv", ".mpeg", ".mpg", ".avi"]);
const STATIC_IMAGE_EXTENSIONS = Object.freeze([".avif", ".bmp", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
function getGlobalWindow() {
  if (typeof window === "undefined") {
    return null;
  }
  return window;
}
function toFiniteNumber(_0x1aafb5, _0x257973 = 0) {
  const _0x33de4b = Number(_0x1aafb5);
  if (Number.isFinite(_0x33de4b)) {
    return _0x33de4b;
  } else {
    return _0x257973;
  }
}
function pushCapped(_0x222cde, _0x2d0d3d, _0x44ada5) {
  if (!Array.isArray(_0x222cde)) {
    return;
  }
  _0x222cde.push(_0x2d0d3d);
  const _0x2ca834 = _0x222cde.length - _0x44ada5;
  if (_0x2ca834 > 0) {
    _0x222cde.splice(0, _0x2ca834);
  }
}
function normalizeLifecycleTypeBreakdown(_0x26d869) {
  if (!_0x26d869 || typeof _0x26d869 !== "object") {
    return [];
  }
  return Object.entries(_0x26d869).map(([_0x48eeb4, _0x4f1ca3]) => ({
    type: String(_0x48eeb4 || "unknown").slice(0, 80),
    count: toFiniteNumber(_0x4f1ca3?.count, 0),
    durationMs: toFiniteNumber(_0x4f1ca3?.durationMs, 0),
    maxMs: toFiniteNumber(_0x4f1ca3?.maxMs, 0)
  })).filter(_0x3c8c89 => _0x3c8c89.count > 0 || _0x3c8c89.durationMs > 0).sort((_0x29e577, _0x791cc8) => _0x791cc8.durationMs - _0x29e577.durationMs).slice(0, NODE_LIFECYCLE_TYPE_LIMIT);
}
function normalizeLifecycleSlowList(_0x50cb37) {
  if (!Array.isArray(_0x50cb37)) {
    return [];
  }
  return _0x50cb37.map(_0x1d68c3 => {
    const _0x587510 = {
      nodeId: String(_0x1d68c3?.nodeId || "").slice(0, 120),
      type: String(_0x1d68c3?.type || "unknown").slice(0, 80),
      reason: String(_0x1d68c3?.reason || "").slice(0, 80),
      durationMs: toFiniteNumber(_0x1d68c3?.durationMs, 0)
    };
    const _0x4b960d = Array.isArray(_0x1d68c3?.breakdown?.sections) ? _0x1d68c3.breakdown.sections.map(_0x2a06d3 => ({
      name: String(_0x2a06d3?.name || "").slice(0, 80),
      durationMs: toFiniteNumber(_0x2a06d3?.durationMs, 0)
    })).filter(_0x51a5e2 => _0x51a5e2.name).slice(0, 12) : [];
    if (_0x4b960d.length) {
      _0x587510.breakdown = {
        totalMs: toFiniteNumber(_0x1d68c3?.breakdown?.totalMs, 0),
        sections: _0x4b960d
      };
      if (_0x1d68c3?.breakdown?.details && typeof _0x1d68c3.breakdown.details === "object") {
        _0x587510.breakdown.details = Object.fromEntries(Object.entries(_0x1d68c3.breakdown.details).map(([_0x2a683f, _0x58a148]) => [String(_0x2a683f || "").slice(0, 80), String(_0x58a148 ?? "").slice(0, 500)]).filter(([_0x1d1cd4]) => _0x1d1cd4));
      }
    }
    return _0x587510;
  }).filter(_0x4787b7 => _0x4787b7.durationMs >= 0).sort((_0x4a3566, _0x572e43) => _0x572e43.durationMs - _0x4a3566.durationMs).slice(0, NODE_LIFECYCLE_SLOW_LIMIT);
}
function normalizeResourcePath(_0x29c88a) {
  const _0x16a0ee = String(_0x29c88a || "").trim();
  if (!_0x16a0ee) {
    return "";
  }
  try {
    const _0x518e69 = getGlobalWindow()?.location?.href || "http://127.0.0.1/";
    return new URL(_0x16a0ee, _0x518e69).pathname.replace(/\\/g, "/");
  } catch {
    return _0x16a0ee.split("?")[0].split("#")[0].replace(/\\/g, "/");
  }
}
function hasAnyPrefix(_0x514466, _0x2bb1da) {
  return _0x2bb1da.some(_0x442abe => _0x514466.startsWith(_0x442abe));
}
function isDerivedStaticMediaPath(_0xc018ea) {
  return hasAnyPrefix(_0xc018ea, DERIVED_STATIC_MEDIA_PREFIXES);
}
function isStaticVideoPath(_0x697df5) {
  if (!hasAnyPrefix(_0x697df5, STATIC_VIDEO_PREFIXES)) {
    return false;
  }
  const _0x25778f = _0x697df5.toLowerCase();
  return STATIC_VIDEO_EXTENSIONS.some(_0x3e0574 => _0x25778f.endsWith(_0x3e0574));
}
function isStaticImagePath(_0x7ad328) {
  if (!hasAnyPrefix(_0x7ad328, STATIC_VIDEO_PREFIXES) && !isDerivedStaticMediaPath(_0x7ad328)) {
    return false;
  }
  const _0x3669ff = _0x7ad328.toLowerCase();
  return STATIC_IMAGE_EXTENSIONS.some(_0x1bbcec => _0x3669ff.endsWith(_0x1bbcec));
}
function isMp4Path(_0x4ee72b) {
  if (!hasAnyPrefix(_0x4ee72b, STATIC_VIDEO_PREFIXES)) {
    return false;
  }
  return _0x4ee72b.toLowerCase().endsWith(".mp4");
}
function getDomMediaElements() {
  const _0x5b5e3f = getGlobalWindow()?.document;
  if (!_0x5b5e3f || typeof _0x5b5e3f.querySelectorAll !== "function") {
    return [];
  }
  return Array.from(_0x5b5e3f.querySelectorAll("img, video, audio, source, image") || []);
}
function getDomMediaSources() {
  const _0x232d64 = [];
  for (const _0x11a916 of getDomMediaElements()) {
    const _0x55a489 = _0x11a916?.currentSrc || _0x11a916?.src || typeof _0x11a916?.getAttribute === "function" && (_0x11a916.getAttribute("src") || _0x11a916.getAttribute("href") || _0x11a916.getAttribute("xlink:href")) || "";
    const _0xb85a38 = normalizeResourcePath(_0x55a489);
    if (!_0xb85a38) {
      continue;
    }
    _0x232d64.push({
      path: _0xb85a38,
      tagName: String(_0x11a916?.tagName || "").toLowerCase()
    });
  }
  return _0x232d64;
}
function countDomVideoElements() {
  let _0x3ea173 = 0;
  for (const _0x53af70 of getDomMediaElements()) {
    if (String(_0x53af70?.tagName || "").toLowerCase() === "video") {
      _0x3ea173 += 1;
    }
  }
  return _0x3ea173;
}
function createEmptyStaticMediaSummary(_0x5c505c = 0) {
  return {
    resourceCount: _0x5c505c,
    staticMediaCount: 0,
    derivedMediaCount: 0,
    cacheableVideoCount: 0,
    cacheHitLikeCount: 0,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    domMediaElementCount: 0,
    imageRequestCount: 0,
    mp4RequestCount: 0,
    videoElementCount: 0,
    sampledResources: []
  };
}
function summarizeStaticMediaResources() {
  const _0x42165d = getGlobalWindow();
  const _0x15b1b0 = _0x42165d?.performance || globalThis.performance;
  const _0x4af82a = _0x15b1b0 && typeof _0x15b1b0.getEntriesByType === "function" ? _0x15b1b0.getEntriesByType.bind(_0x15b1b0) : null;
  const _0x29c832 = _0x4af82a ? _0x4af82a("resource") || [] : [];
  const _0x41a8a3 = [];
  const _0x16fac7 = createEmptyStaticMediaSummary(_0x29c832.length);
  _0x16fac7.sampledResources = _0x41a8a3;
  _0x16fac7.videoElementCount = countDomVideoElements();
  const _0x5931fb = new Set();
  for (const _0x4e1ae3 of _0x29c832) {
    const _0xda81be = normalizeResourcePath(_0x4e1ae3?.name);
    const _0x215528 = isDerivedStaticMediaPath(_0xda81be);
    const _0x1e2663 = isStaticVideoPath(_0xda81be);
    const _0x403a61 = isStaticImagePath(_0xda81be);
    if (_0x403a61) {
      _0x16fac7.imageRequestCount += 1;
    }
    if (isMp4Path(_0xda81be)) {
      _0x16fac7.mp4RequestCount += 1;
    }
    if (!_0x215528 && !_0x1e2663) {
      continue;
    }
    _0x5931fb.add(_0xda81be);
    const _0x12d514 = toFiniteNumber(_0x4e1ae3?.transferSize, 0);
    const _0xec649e = toFiniteNumber(_0x4e1ae3?.encodedBodySize, 0);
    const _0x5bf46b = toFiniteNumber(_0x4e1ae3?.decodedBodySize, 0);
    _0x16fac7.staticMediaCount += 1;
    if (_0x215528) {
      _0x16fac7.derivedMediaCount += 1;
    }
    if (_0x1e2663) {
      _0x16fac7.cacheableVideoCount += 1;
    }
    if (_0x12d514 === 0 && _0xec649e > 0) {
      _0x16fac7.cacheHitLikeCount += 1;
    }
    _0x16fac7.transferSize += _0x12d514;
    _0x16fac7.encodedBodySize += _0xec649e;
    _0x16fac7.decodedBodySize += _0x5bf46b;
    pushCapped(_0x41a8a3, {
      path: _0xda81be,
      initiatorType: String(_0x4e1ae3?.initiatorType || ""),
      transferSize: _0x12d514,
      encodedBodySize: _0xec649e,
      durationMs: toFiniteNumber(_0x4e1ae3?.duration, 0),
      derived: _0x215528,
      staticVideo: _0x1e2663,
      source: "resource"
    }, STATIC_MEDIA_SAMPLE_LIMIT);
  }
  for (const _0x46fa27 of getDomMediaSources()) {
    const _0xa44d1e = isDerivedStaticMediaPath(_0x46fa27.path);
    const _0xef822a = isStaticVideoPath(_0x46fa27.path);
    if (!_0xa44d1e && !_0xef822a) {
      continue;
    }
    _0x16fac7.domMediaElementCount += 1;
    if (_0x5931fb.has(_0x46fa27.path)) {
      continue;
    }
    _0x5931fb.add(_0x46fa27.path);
    _0x16fac7.staticMediaCount += 1;
    if (_0xa44d1e) {
      _0x16fac7.derivedMediaCount += 1;
    }
    if (_0xef822a) {
      _0x16fac7.cacheableVideoCount += 1;
    }
    pushCapped(_0x41a8a3, {
      path: _0x46fa27.path,
      initiatorType: _0x46fa27.tagName || "dom",
      transferSize: 0,
      encodedBodySize: 0,
      durationMs: 0,
      derived: _0xa44d1e,
      staticVideo: _0xef822a,
      source: "dom"
    }, STATIC_MEDIA_SAMPLE_LIMIT);
  }
  return _0x16fac7;
}
function percentile(_0x8eae22, _0x467b77) {
  if (!Array.isArray(_0x8eae22) || _0x8eae22.length === 0) {
    return 0;
  }
  const _0x1ef999 = Math.min(1, Math.max(0, Number(_0x467b77) / 100));
  const _0x111083 = Math.ceil(_0x1ef999 * _0x8eae22.length) - 1;
  return _0x8eae22[Math.max(0, _0x111083)];
}
function summarize(_0xc32342) {
  const _0x27ed3f = (_0xc32342 || []).map(_0xb5587c => toFiniteNumber(_0xb5587c, NaN)).filter(_0xe2d611 => Number.isFinite(_0xe2d611) && _0xe2d611 > 0).sort((_0x1c19fd, _0x494e42) => _0x1c19fd - _0x494e42);
  if (_0x27ed3f.length === 0) {
    return {
      count: 0,
      avg: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      max: 0
    };
  }
  const _0xfae065 = _0x27ed3f.reduce((_0x9d66df, _0x4a2b82) => _0x9d66df + _0x4a2b82, 0);
  return {
    count: _0x27ed3f.length,
    avg: _0xfae065 / _0x27ed3f.length,
    p50: percentile(_0x27ed3f, 50),
    p95: percentile(_0x27ed3f, 95),
    p99: percentile(_0x27ed3f, 99),
    max: _0x27ed3f.at(-1) || 0
  };
}
function sanitizeScriptSourceURL(_0x4fcaaf) {
  const _0x1b7f20 = String(_0x4fcaaf || "").trim();
  if (!_0x1b7f20) {
    return "";
  }
  try {
    const _0xa9c2d3 = new URL(getGlobalWindow()?.location?.href || "http://127.0.0.1/");
    const _0x3fe959 = new URL(_0x1b7f20, _0xa9c2d3);
    if (_0x3fe959.protocol === "data:" || _0x3fe959.protocol === "blob:") {
      return _0x3fe959.protocol + "[redacted]";
    }
    const _0x247fe2 = _0x3fe959.pathname.replace(/\\/g, "/");
    if (_0x3fe959.protocol === "file:") {
      const _0x319ab1 = _0x247fe2.split("/").filter(Boolean).at(-1) || "script";
      return ("file:///[redacted]/" + _0x319ab1).slice(0, SCRIPT_SOURCE_URL_LIMIT);
    }
    const _0x5b6955 = _0x3fe959.origin === _0xa9c2d3.origin ? _0x247fe2 : "" + _0x3fe959.origin + _0x247fe2;
    return _0x5b6955.slice(0, SCRIPT_SOURCE_URL_LIMIT);
  } catch {
    const _0x5b2dd5 = _0x1b7f20.split("?")[0].split("#")[0].replace(/\\/g, "/");
    if (/^(?:[a-z]:\/|\/users\/)/i.test(_0x5b2dd5)) {
      const _0x1eb003 = _0x5b2dd5.split("/").filter(Boolean).at(-1) || "script";
      return ("[redacted]/" + _0x1eb003).slice(0, SCRIPT_SOURCE_URL_LIMIT);
    }
    return _0x5b2dd5.slice(0, SCRIPT_SOURCE_URL_LIMIT);
  }
}
function sanitizeScriptFunctionName(_0x15fd03) {
  return String(_0x15fd03 || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, SCRIPT_FUNCTION_NAME_LIMIT);
}
function normalizeLongAnimationFrameScript(_0xadfe3a = {}) {
  return {
    durationMs: Math.max(0, toFiniteNumber(_0xadfe3a.duration, 0)),
    executionStart: Math.max(0, toFiniteNumber(_0xadfe3a.executionStart, 0)),
    forcedStyleAndLayoutDurationMs: Math.max(0, toFiniteNumber(_0xadfe3a.forcedStyleAndLayoutDuration, 0)),
    sourceURL: sanitizeScriptSourceURL(_0xadfe3a.sourceURL),
    functionName: sanitizeScriptFunctionName(_0xadfe3a.sourceFunctionName ?? _0xadfe3a.functionName),
    charPosition: Math.max(0, Math.trunc(toFiniteNumber(_0xadfe3a.sourceCharPosition ?? _0xadfe3a.charPosition, 0)))
  };
}
function normalizeLongAnimationFrameEntry(_0x431967 = {}) {
  const _0x5bf995 = Math.max(0, toFiniteNumber(_0x431967.duration, 0));
  if (_0x5bf995 <= 0) {
    return null;
  }
  const _0x17e3d9 = Array.isArray(_0x431967.scripts) ? _0x431967.scripts.map(normalizeLongAnimationFrameScript).sort((_0x45a4b3, _0x524a00) => _0x524a00.durationMs - _0x45a4b3.durationMs).slice(0, LONG_ANIMATION_FRAME_SCRIPT_LIMIT) : [];
  const _0x37e658 = Math.max(0, toFiniteNumber(_0x431967.startTime, 0));
  const _0x2bd81e = Math.max(0, toFiniteNumber(_0x431967.renderStart, 0));
  const _0x4ce4d5 = Math.max(0, toFiniteNumber(_0x431967.styleAndLayoutStart, 0));
  const _0x4e18ca = _0x17e3d9.reduce((_0x2b2915, _0x20d0f5) => _0x2b2915 + _0x20d0f5.durationMs, 0);
  const _0x24e5e7 = _0x17e3d9.reduce((_0x3442a3, _0x599c08) => _0x3442a3 + _0x599c08.forcedStyleAndLayoutDurationMs, 0);
  return {
    durationMs: _0x5bf995,
    blockingDurationMs: Math.max(0, toFiniteNumber(_0x431967.blockingDuration, 0)),
    startTime: _0x37e658,
    renderStart: _0x2bd81e,
    styleAndLayoutStart: _0x4ce4d5,
    renderStartOffsetMs: Math.max(0, _0x2bd81e - _0x37e658),
    styleAndLayoutStartOffsetMs: Math.max(0, _0x4ce4d5 - _0x37e658),
    scriptDurationMs: _0x4e18ca,
    forcedStyleAndLayoutDurationMs: _0x24e5e7,
    unattributedDurationMs: Math.max(0, _0x5bf995 - _0x4e18ca),
    scripts: _0x17e3d9,
    at: Date.now()
  };
}
function cloneLongAnimationFrameSample(_0x3f5c23 = {}) {
  return {
    ..._0x3f5c23,
    scripts: Array.isArray(_0x3f5c23.scripts) ? _0x3f5c23.scripts.map(_0x23b3f0 => ({
      ..._0x23b3f0
    })) : []
  };
}
function bindHelpers(_0x438c68) {
  const _0x4cb06c = getGlobalWindow();
  if (!_0x4cb06c) {
    return;
  }
  _0x4cb06c.__resetPerfProbe = resetPerfProbeData;
  _0x4cb06c.__getPerfProbeSnapshot = getPerfProbeSnapshot;
  _0x4cb06c.__setPerfProbeEnabled = _0x649761 => {
    _0x438c68.enabled = !!_0x649761;
    _0x4cb06c.__perfProbeEnabled = _0x438c68.enabled;
    syncLongAnimationFrameObserver(_0x438c68);
  };
}
function installRendererVirtualizationProbe() {
  const _0x413f36 = getGlobalWindow();
  if (!_0x413f36 || _0x413f36.__perfProbeVirtualizationProbeInstalled === true) {
    return;
  }
  const _0x4e0cfc = _0x413f36.__rendererVirtualizationProbe;
  _0x413f36.__rendererVirtualizationProbe = {
    onCandidateSignatureEvaluated(_0x25d44e) {
      recordRendererVirtualizationSample(_0x25d44e);
      _0x4e0cfc?.onCandidateSignatureEvaluated?.(_0x25d44e);
    }
  };
  _0x413f36.__perfProbeVirtualizationProbeInstalled = true;
}
function installLongTaskObserver() {
  const _0x30315c = getGlobalWindow();
  if (!_0x30315c || _0x30315c.__perfProbeLongTaskObserverInstalled === true) {
    return;
  }
  const _0x37d433 = _0x30315c.PerformanceObserver || globalThis.PerformanceObserver;
  if (typeof _0x37d433 !== "function") {
    return;
  }
  const _0x38ba0b = _0x37d433.supportedEntryTypes;
  if (Array.isArray(_0x38ba0b) && !_0x38ba0b.includes("longtask")) {
    return;
  }
  try {
    const _0x7cfc3b = new _0x37d433(_0x465bd6 => {
      const _0x111d90 = typeof _0x465bd6?.getEntries === "function" ? _0x465bd6.getEntries() : [];
      for (const _0x535e81 of _0x111d90) {
        recordLongTaskSample(_0x535e81?.duration, {
          name: _0x535e81?.name,
          startTime: _0x535e81?.startTime,
          source: "observer"
        });
      }
    });
    _0x7cfc3b.observe({
      type: "longtask",
      buffered: true
    });
    _0x30315c.__perfProbeLongTaskObserver = _0x7cfc3b;
    _0x30315c.__perfProbeLongTaskObserverInstalled = true;
  } catch {}
}
function disconnectLongAnimationFrameObserver(_0x397ea5, _0x535de2) {
  _0x397ea5?.__perfProbeLongAnimationFrameObserver?.disconnect?.();
  if (_0x397ea5) {
    _0x397ea5.__perfProbeLongAnimationFrameObserver = null;
    _0x397ea5.__perfProbeLongAnimationFrameObserverInstalled = false;
    _0x397ea5.__perfProbeLongAnimationFrameObserverAttempted = false;
  }
  if (_0x535de2) {
    _0x535de2.longAnimationFrameObserverActive = false;
  }
}
function detectLongAnimationFrameSupport(_0x13d573) {
  const _0x4d3ac3 = _0x13d573?.PerformanceObserver || globalThis.PerformanceObserver;
  if (typeof _0x4d3ac3 !== "function") {
    return false;
  }
  const _0x5c4ce9 = _0x4d3ac3.supportedEntryTypes;
  if (Array.isArray(_0x5c4ce9)) {
    return _0x5c4ce9.includes("long-animation-frame");
  }
  return null;
}
function recordLongAnimationFrameEntry(_0xf69b0a) {
  const _0x4dc02f = ensureStore();
  if (!isEnabled(_0x4dc02f)) {
    return;
  }
  const _0x26d1b9 = normalizeLongAnimationFrameEntry(_0xf69b0a);
  if (!_0x26d1b9) {
    return;
  }
  _0x4dc02f.maxLongAnimationFrameDurationMs = Math.max(toFiniteNumber(_0x4dc02f.maxLongAnimationFrameDurationMs, 0), _0x26d1b9.durationMs);
  _0x4dc02f.maxLongAnimationFrameBlockingDurationMs = Math.max(toFiniteNumber(_0x4dc02f.maxLongAnimationFrameBlockingDurationMs, 0), _0x26d1b9.blockingDurationMs);
  pushCapped(_0x4dc02f.longAnimationFrameSamples, _0x26d1b9, LONG_ANIMATION_FRAME_SAMPLE_LIMIT);
}
function syncLongAnimationFrameObserver(_0x2f8e2f) {
  const _0x5b9467 = getGlobalWindow();
  if (!_0x5b9467 || !_0x2f8e2f) {
    return;
  }
  if (!isEnabled(_0x2f8e2f)) {
    disconnectLongAnimationFrameObserver(_0x5b9467, _0x2f8e2f);
    const _0x4b0300 = detectLongAnimationFrameSupport(_0x5b9467);
    if (_0x4b0300 !== null) {
      _0x2f8e2f.longAnimationFrameSupported = _0x4b0300;
    }
    return;
  }
  if (_0x5b9467.__perfProbeLongAnimationFrameObserverInstalled === true) {
    _0x2f8e2f.longAnimationFrameSupported = true;
    _0x2f8e2f.longAnimationFrameObserverActive = true;
    return;
  }
  if (_0x5b9467.__perfProbeLongAnimationFrameObserverAttempted === true) {
    return;
  }
  const _0x427fa0 = _0x5b9467.PerformanceObserver || globalThis.PerformanceObserver;
  if (typeof _0x427fa0 !== "function") {
    _0x2f8e2f.longAnimationFrameSupported = false;
    _0x5b9467.__perfProbeLongAnimationFrameObserverAttempted = true;
    return;
  }
  const _0x2dd58b = _0x427fa0.supportedEntryTypes;
  if (Array.isArray(_0x2dd58b) && !_0x2dd58b.includes("long-animation-frame")) {
    _0x2f8e2f.longAnimationFrameSupported = false;
    _0x5b9467.__perfProbeLongAnimationFrameObserverAttempted = true;
    return;
  }
  _0x5b9467.__perfProbeLongAnimationFrameObserverAttempted = true;
  try {
    const _0x3e51d9 = new _0x427fa0(_0x27263c => {
      const _0xa1ccfc = typeof _0x27263c?.getEntries === "function" ? _0x27263c.getEntries() : [];
      for (const _0x2a346b of _0xa1ccfc) {
        recordLongAnimationFrameEntry(_0x2a346b);
      }
    });
    _0x3e51d9.observe({
      type: "long-animation-frame"
    });
    _0x5b9467.__perfProbeLongAnimationFrameObserver = _0x3e51d9;
    _0x5b9467.__perfProbeLongAnimationFrameObserverInstalled = true;
    _0x2f8e2f.longAnimationFrameSupported = true;
    _0x2f8e2f.longAnimationFrameObserverActive = true;
  } catch {
    _0x5b9467.__perfProbeLongAnimationFrameObserver = null;
    _0x5b9467.__perfProbeLongAnimationFrameObserverInstalled = false;
    _0x2f8e2f.longAnimationFrameSupported = false;
    _0x2f8e2f.longAnimationFrameObserverActive = false;
  }
}
function createMilestoneState() {
  return {
    startedAtPerf: nowMs(),
    firstVisualMs: null,
    firstInteractiveMs: null,
    maxLongTaskMs: 0
  };
}
function ensureStore() {
  const _0x48960a = getGlobalWindow();
  if (!_0x48960a) {
    return null;
  }
  if (!_0x48960a[PERF_STORE_KEY]) {
    _0x48960a[PERF_STORE_KEY] = {
      enabled: _0x48960a.__perfProbeEnabled === true,
      dragSessions: {},
      dragFpsSessions: [],
      panSessions: {},
      panFpsSessions: [],
      canvasPanSamples: [],
      zoomSessions: {},
      zoomFpsSessions: [],
      resizeSessions: {},
      resizeFpsSessions: [],
      edgeRedrawSamples: [],
      fastPreviewSamples: [],
      renderFrameSamples: [],
      nodeLifecycleSamples: [],
      virtualizationSamples: [],
      minimapUpdateSamples: [],
      longTaskSamples: [],
      longAnimationFrameSupported: false,
      longAnimationFrameObserverActive: false,
      longAnimationFrameSamples: [],
      maxLongAnimationFrameDurationMs: 0,
      maxLongAnimationFrameBlockingDurationMs: 0,
      ...createMilestoneState()
    };
  }
  const _0x588b72 = _0x48960a[PERF_STORE_KEY];
  if (!_0x588b72.dragSessions || typeof _0x588b72.dragSessions !== "object") {
    _0x588b72.dragSessions = {};
  }
  if (!Array.isArray(_0x588b72.dragFpsSessions)) {
    _0x588b72.dragFpsSessions = [];
  }
  if (!_0x588b72.panSessions || typeof _0x588b72.panSessions !== "object") {
    _0x588b72.panSessions = {};
  }
  if (!Array.isArray(_0x588b72.panFpsSessions)) {
    _0x588b72.panFpsSessions = [];
  }
  if (!Array.isArray(_0x588b72.canvasPanSamples)) {
    _0x588b72.canvasPanSamples = [];
  }
  if (!_0x588b72.zoomSessions || typeof _0x588b72.zoomSessions !== "object") {
    _0x588b72.zoomSessions = {};
  }
  if (!Array.isArray(_0x588b72.zoomFpsSessions)) {
    _0x588b72.zoomFpsSessions = [];
  }
  if (!_0x588b72.resizeSessions || typeof _0x588b72.resizeSessions !== "object") {
    _0x588b72.resizeSessions = {};
  }
  if (!Array.isArray(_0x588b72.resizeFpsSessions)) {
    _0x588b72.resizeFpsSessions = [];
  }
  if (!Array.isArray(_0x588b72.edgeRedrawSamples)) {
    _0x588b72.edgeRedrawSamples = [];
  }
  if (!Array.isArray(_0x588b72.fastPreviewSamples)) {
    _0x588b72.fastPreviewSamples = [];
  }
  if (!Array.isArray(_0x588b72.renderFrameSamples)) {
    _0x588b72.renderFrameSamples = [];
  }
  if (!Array.isArray(_0x588b72.nodeLifecycleSamples)) {
    _0x588b72.nodeLifecycleSamples = [];
  }
  if (!Array.isArray(_0x588b72.virtualizationSamples)) {
    _0x588b72.virtualizationSamples = [];
  }
  if (!Array.isArray(_0x588b72.minimapUpdateSamples)) {
    _0x588b72.minimapUpdateSamples = [];
  }
  if (!Array.isArray(_0x588b72.longTaskSamples)) {
    _0x588b72.longTaskSamples = [];
  }
  if (!Array.isArray(_0x588b72.longAnimationFrameSamples)) {
    _0x588b72.longAnimationFrameSamples = [];
  }
  if (typeof _0x588b72.longAnimationFrameSupported !== "boolean") {
    _0x588b72.longAnimationFrameSupported = false;
  }
  if (typeof _0x588b72.longAnimationFrameObserverActive !== "boolean") {
    _0x588b72.longAnimationFrameObserverActive = false;
  }
  if (!Number.isFinite(Number(_0x588b72.maxLongAnimationFrameDurationMs))) {
    _0x588b72.maxLongAnimationFrameDurationMs = 0;
  }
  if (!Number.isFinite(Number(_0x588b72.maxLongAnimationFrameBlockingDurationMs))) {
    _0x588b72.maxLongAnimationFrameBlockingDurationMs = 0;
  }
  if (!Number.isFinite(Number(_0x588b72.startedAtPerf))) {
    _0x588b72.startedAtPerf = nowMs();
  }
  if (!Number.isFinite(Number(_0x588b72.maxLongTaskMs))) {
    _0x588b72.maxLongTaskMs = 0;
  }
  if (_0x48960a.__perfProbeEnabled === true) {
    _0x588b72.enabled = true;
  }
  bindHelpers(_0x588b72);
  installRendererVirtualizationProbe();
  installLongTaskObserver();
  syncLongAnimationFrameObserver(_0x588b72);
  return _0x588b72;
}
function isEnabled(_0x374a8c) {
  return !!_0x374a8c && _0x374a8c.enabled === true;
}
export function isPerfProbeEnabled() {
  return isEnabled(ensureStore());
}
export function setPerfProbeEnabled(_0x30dbb2) {
  const _0x3ecad6 = ensureStore();
  if (!_0x3ecad6) {
    return false;
  }
  _0x3ecad6.enabled = _0x30dbb2 === true;
  const _0x45252d = getGlobalWindow();
  if (_0x45252d) {
    _0x45252d.__perfProbeEnabled = _0x3ecad6.enabled;
  }
  syncLongAnimationFrameObserver(_0x3ecad6);
  return _0x3ecad6.enabled;
}
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}
function requestProbeFrame(_0xef0c9) {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(_0xef0c9);
  }
  return setTimeout(() => _0xef0c9(nowMs()), 16);
}
function cancelProbeFrame(_0x49380e) {
  if (_0x49380e === null || _0x49380e === undefined) {
    return;
  }
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(_0x49380e);
    return;
  }
  clearTimeout(_0x49380e);
}
function getElapsedSinceProbeStart(_0x44b236) {
  const _0x32539a = toFiniteNumber(_0x44b236?.startedAtPerf, nowMs());
  return Math.max(0, nowMs() - _0x32539a);
}
function sampleHasVisualContent(_0x172077 = {}) {
  return toFiniteNumber(_0x172077.nodeCount, 0) > 0 || toFiniteNumber(_0x172077.mountedNodeCount, 0) > 0 || toFiniteNumber(_0x172077.fastPreviewCount, 0) > 0 || toFiniteNumber(_0x172077.visibleFastPreviewCount, 0) > 0;
}
function beginFpsSession(_0x299305, _0x548160, _0x2300ac, _0x362a9c) {
  if (!isEnabled(_0x299305)) {
    return;
  }
  const _0x72859d = String(_0x2300ac || _0x362a9c);
  const _0x1c6c3d = _0x299305[_0x548160] || {};
  _0x299305[_0x548160] = _0x1c6c3d;
  if (_0x1c6c3d[_0x72859d]) {
    return;
  }
  const _0x2fe1e7 = {
    label: _0x72859d,
    startedAt: Date.now(),
    startedAtPerf: nowMs(),
    prevTs: null,
    frameIntervals: [],
    rafId: null
  };
  const _0x459f8c = _0xdef582 => {
    if (!_0x1c6c3d[_0x72859d]) {
      return;
    }
    if (_0x2fe1e7.prevTs !== null) {
      const _0x5e731a = _0xdef582 - _0x2fe1e7.prevTs;
      if (Number.isFinite(_0x5e731a) && _0x5e731a > 0) {
        _0x2fe1e7.frameIntervals.push(_0x5e731a);
      }
    }
    _0x2fe1e7.prevTs = _0xdef582;
    _0x2fe1e7.rafId = requestProbeFrame(_0x459f8c);
  };
  _0x2fe1e7.rafId = requestProbeFrame(_0x459f8c);
  _0x1c6c3d[_0x72859d] = _0x2fe1e7;
}
function endFpsSession(_0x408038, _0x2d05d4, _0x5bdff3, _0x3ed8fb, _0x4c3630, _0x8efe5f) {
  if (!isEnabled(_0x408038)) {
    return null;
  }
  const _0x39901c = String(_0x4c3630 || _0x8efe5f);
  const _0x7f19a9 = _0x408038[_0x2d05d4] || {};
  const _0x5274dc = _0x7f19a9[_0x39901c];
  if (!_0x5274dc) {
    return null;
  }
  if (_0x5274dc.rafId !== null) {
    cancelProbeFrame(_0x5274dc.rafId);
  }
  const _0x1d73ea = _0x5274dc.frameIntervals.map(_0x45d6c7 => _0x45d6c7 > 0 ? 1000 / _0x45d6c7 : 0).filter(_0x25ee51 => Number.isFinite(_0x25ee51) && _0x25ee51 > 0);
  const _0x452a16 = summarize(_0x1d73ea);
  const _0x29ff45 = summarize(_0x5274dc.frameIntervals);
  const _0x485328 = _0x5274dc.frameIntervals.reduce((_0x7c573b, _0x49624b) => _0x7c573b + Math.max(0, toFiniteNumber(_0x49624b, 0)), 0);
  const _0x594968 = 1000 / 60;
  const _0xca8359 = _0x5274dc.frameIntervals.reduce((_0x187bdb, _0x296cec) => _0x187bdb + Math.max(0, Math.round(Number(_0x296cec || 0) / _0x594968) - 1), 0);
  const _0x21c8f8 = _0x5274dc.frameIntervals.length;
  const _0x469436 = {
    label: _0x5274dc.label,
    startedAt: _0x5274dc.startedAt,
    endedAt: Date.now(),
    durationMs: Math.max(0, nowMs() - _0x5274dc.startedAtPerf),
    frameCount: _0x452a16.count,
    avgFps: _0x452a16.avg,
    effectiveFps: _0x485328 > 0 ? _0x452a16.count * 1000 / _0x485328 : 0,
    observedFrameIntervalTotalMs: _0x485328,
    p50Fps: _0x452a16.p50,
    p95Fps: _0x452a16.p95,
    frameIntervalP50Ms: _0x29ff45.p50,
    frameIntervalP95Ms: _0x29ff45.p95,
    frameIntervalP99Ms: _0x29ff45.p99,
    frameIntervalMaxMs: _0x29ff45.max,
    droppedFrameCount: _0xca8359,
    droppedFrameRatio: _0x21c8f8 + _0xca8359 > 0 ? _0xca8359 / (_0x21c8f8 + _0xca8359) : 0
  };
  pushCapped(_0x408038[_0x5bdff3], _0x469436, _0x3ed8fb);
  delete _0x7f19a9[_0x39901c];
  return _0x469436;
}
export function beginDragFpsSession(_0x94bf07 = "node-drag") {
  beginFpsSession(ensureStore(), "dragSessions", _0x94bf07, "node-drag");
}
export function endDragFpsSession(_0x681b9d = "node-drag") {
  return endFpsSession(ensureStore(), "dragSessions", "dragFpsSessions", DRAG_FPS_SESSION_LIMIT, _0x681b9d, "node-drag");
}
export function beginPanFpsSession(_0x5dd8ba = "canvas-pan") {
  beginFpsSession(ensureStore(), "panSessions", _0x5dd8ba, "canvas-pan");
}
export function endPanFpsSession(_0x41eacc = "canvas-pan") {
  return endFpsSession(ensureStore(), "panSessions", "panFpsSessions", PAN_FPS_SESSION_LIMIT, _0x41eacc, "canvas-pan");
}
export function beginZoomFpsSession(_0x30fd72 = "wheel-zoom") {
  beginFpsSession(ensureStore(), "zoomSessions", _0x30fd72, "wheel-zoom");
}
export function endZoomFpsSession(_0x151b9d = "wheel-zoom") {
  return endFpsSession(ensureStore(), "zoomSessions", "zoomFpsSessions", ZOOM_FPS_SESSION_LIMIT, _0x151b9d, "wheel-zoom");
}
export function beginResizeFpsSession(_0x4fceca = "node-resize") {
  beginFpsSession(ensureStore(), "resizeSessions", _0x4fceca, "node-resize");
}
export function endResizeFpsSession(_0x1703b0 = "node-resize") {
  return endFpsSession(ensureStore(), "resizeSessions", "resizeFpsSessions", RESIZE_FPS_SESSION_LIMIT, _0x1703b0, "node-resize");
}
export function recordEdgeRedrawSample(_0x59d364, _0x3742c7, _0x2d5960 = {}) {
  const _0x5ed94b = ensureStore();
  if (!isEnabled(_0x5ed94b)) {
    return;
  }
  const _0x450293 = toFiniteNumber(_0x3742c7, 0);
  if (!Number.isFinite(_0x450293) || _0x450293 < 0) {
    return;
  }
  const _0x33fac9 = {
    mode: String(_0x59d364 || "unknown"),
    durationMs: _0x450293,
    reason: String(_0x2d5960.reason || ""),
    edgeCount: toFiniteNumber(_0x2d5960.edgeCount, 0),
    visibleEdgeCount: toFiniteNumber(_0x2d5960.visibleEdgeCount, 0),
    updatedCount: toFiniteNumber(_0x2d5960.updatedCount, 0),
    createdCount: toFiniteNumber(_0x2d5960.createdCount, 0),
    removedCount: toFiniteNumber(_0x2d5960.removedCount, 0),
    reusedCount: toFiniteNumber(_0x2d5960.reusedCount, 0),
    skippedInvisibleCount: toFiniteNumber(_0x2d5960.skippedInvisibleCount, 0),
    cacheSize: toFiniteNumber(_0x2d5960.cacheSize, 0),
    layoutReadMs: toFiniteNumber(_0x2d5960.layoutReadMs, 0),
    pathBuildMs: toFiniteNumber(_0x2d5960.pathBuildMs, 0),
    domWriteMs: toFiniteNumber(_0x2d5960.domWriteMs, 0),
    clearedDom: _0x2d5960.clearedDom === true,
    renderAllLowZoomEdges: _0x2d5960.renderAllLowZoomEdges === true,
    lodActive: _0x2d5960.lodActive === true,
    lodOmittedCount: toFiniteNumber(_0x2d5960.lodOmittedCount, 0),
    lodRelatedCount: toFiniteNumber(_0x2d5960.lodRelatedCount, 0),
    lodNonRelatedCount: toFiniteNumber(_0x2d5960.lodNonRelatedCount, 0),
    at: Date.now()
  };
  pushCapped(_0x5ed94b.edgeRedrawSamples, _0x33fac9, EDGE_REDRAW_SAMPLE_LIMIT);
}
export function recordCanvasPanSample(_0x3b86e2 = {}) {
  const _0x3164ef = ensureStore();
  if (!isEnabled(_0x3164ef)) {
    return;
  }
  pushCapped(_0x3164ef.canvasPanSamples, {
    durationMs: toFiniteNumber(_0x3b86e2.durationMs, 0),
    moveCount: toFiniteNumber(_0x3b86e2.moveCount, 0),
    committed: _0x3b86e2.committed === true,
    nodeCount: toFiniteNumber(_0x3b86e2.nodeCount, 0),
    edgeCount: toFiniteNumber(_0x3b86e2.edgeCount, 0),
    mountedNodeCount: toFiniteNumber(_0x3b86e2.mountedNodeCount, 0),
    minimapPreviewCount: toFiniteNumber(_0x3b86e2.minimapPreviewCount, 0),
    finalX: toFiniteNumber(_0x3b86e2.finalX, 0),
    finalY: toFiniteNumber(_0x3b86e2.finalY, 0),
    finalZoom: toFiniteNumber(_0x3b86e2.finalZoom, 1),
    at: Date.now()
  }, CANVAS_PAN_SAMPLE_LIMIT);
}
export function recordMinimapUpdateSample(_0x332b6a, _0x3f7c88, _0x4d9f9f = {}) {
  const _0x3dd0c1 = ensureStore();
  if (!isEnabled(_0x3dd0c1)) {
    return;
  }
  pushCapped(_0x3dd0c1.minimapUpdateSamples, {
    mode: String(_0x332b6a || "unknown"),
    durationMs: toFiniteNumber(_0x3f7c88, 0),
    nodeCount: toFiniteNumber(_0x4d9f9f.nodeCount, 0),
    dotCount: toFiniteNumber(_0x4d9f9f.dotCount, 0),
    createdCount: toFiniteNumber(_0x4d9f9f.createdCount, 0),
    updatedCount: toFiniteNumber(_0x4d9f9f.updatedCount, 0),
    removedCount: toFiniteNumber(_0x4d9f9f.removedCount, 0),
    viewportOnly: _0x4d9f9f.viewportOnly === true,
    delayed: _0x4d9f9f.delayed === true,
    at: Date.now()
  }, MINIMAP_UPDATE_SAMPLE_LIMIT);
}
export function recordFastPreviewSample(_0x28192e, _0x436c68, _0x39d902 = {}) {
  const _0x281bee = ensureStore();
  if (!isEnabled(_0x281bee)) {
    return;
  }
  const _0x139a95 = toFiniteNumber(_0x436c68, 0);
  if (!Number.isFinite(_0x139a95) || _0x139a95 < 0) {
    return;
  }
  pushCapped(_0x281bee.fastPreviewSamples, {
    mode: String(_0x28192e || "unknown"),
    durationMs: _0x139a95,
    startPerf: toFiniteNumber(_0x39d902.startPerf, 0),
    endPerf: toFiniteNumber(_0x39d902.endPerf, 0),
    candidateCount: toFiniteNumber(_0x39d902.candidateCount, 0),
    createdCount: toFiniteNumber(_0x39d902.createdCount, 0),
    reusedCount: toFiniteNumber(_0x39d902.reusedCount, 0),
    removedCount: toFiniteNumber(_0x39d902.removedCount, 0),
    poolSize: toFiniteNumber(_0x39d902.poolSize, 0),
    pendingCreateCount: toFiniteNumber(_0x39d902.pendingCreateCount, 0),
    srcAssignedCount: toFiniteNumber(_0x39d902.srcAssignedCount, 0),
    pendingMediaSrcCount: toFiniteNumber(_0x39d902.pendingMediaSrcCount, 0),
    imageCount: toFiniteNumber(_0x39d902.imageCount, 0),
    zoom: toFiniteNumber(_0x39d902.zoom, 1),
    at: Date.now()
  }, FAST_PREVIEW_SAMPLE_LIMIT);
}
export function recordRenderFrameSample(_0x5b14c7 = {}) {
  const _0x52893e = ensureStore();
  if (!isEnabled(_0x52893e)) {
    return;
  }
  const _0x2e5f2b = toFiniteNumber(_0x5b14c7.durationMs, 0);
  if (!Number.isFinite(_0x2e5f2b) || _0x2e5f2b < 0) {
    return;
  }
  const _0x56f005 = sampleHasVisualContent(_0x5b14c7);
  if (_0x52893e.firstVisualMs === null && _0x56f005) {
    _0x52893e.firstVisualMs = getElapsedSinceProbeStart(_0x52893e);
  }
  if (_0x52893e.firstInteractiveMs === null && String(_0x5b14c7.mode || "") === "steady" && _0x56f005) {
    _0x52893e.firstInteractiveMs = getElapsedSinceProbeStart(_0x52893e);
  }
  pushCapped(_0x52893e.renderFrameSamples, {
    mode: String(_0x5b14c7.mode || "unknown"),
    durationMs: _0x2e5f2b,
    nodeCount: toFiniteNumber(_0x5b14c7.nodeCount, 0),
    edgeCount: toFiniteNumber(_0x5b14c7.edgeCount, 0),
    mountedNodeCount: toFiniteNumber(_0x5b14c7.mountedNodeCount, 0),
    parkedNodeCount: toFiniteNumber(_0x5b14c7.parkedNodeCount, 0),
    fastPreviewCount: toFiniteNumber(_0x5b14c7.fastPreviewCount, 0),
    visibleFastPreviewCount: toFiniteNumber(_0x5b14c7.visibleFastPreviewCount, 0),
    previewWithMediaCount: toFiniteNumber(_0x5b14c7.previewWithMediaCount, 0),
    deferredMountedWithPreviewCount: toFiniteNumber(_0x5b14c7.deferredMountedWithPreviewCount, 0),
    at: Date.now()
  }, RENDER_FRAME_SAMPLE_LIMIT);
}
export function recordRendererNodeLifecycleSample(_0x100fbc = {}) {
  const _0x33b508 = ensureStore();
  if (!isEnabled(_0x33b508)) {
    return;
  }
  const _0x2b073b = toFiniteNumber(_0x100fbc.createdCount, 0);
  const _0x126c4c = toFiniteNumber(_0x100fbc.remountedCount, 0);
  const _0x178e00 = toFiniteNumber(_0x100fbc.parkedCount, 0);
  const _0x116f33 = toFiniteNumber(_0x100fbc.updateCount, 0);
  const _0x121f1f = toFiniteNumber(_0x100fbc.skippedUpdateCount, 0);
  const _0x20390e = toFiniteNumber(_0x100fbc.mountBatchCount, 0);
  const _0x26d2c3 = _0x2b073b > 0 || _0x126c4c > 0 || _0x178e00 > 0 || _0x116f33 > 0 || _0x121f1f > 0 || _0x20390e > 0;
  if (!_0x26d2c3) {
    return;
  }
  pushCapped(_0x33b508.nodeLifecycleSamples, {
    mode: String(_0x100fbc.mode || "unknown"),
    nodeCount: toFiniteNumber(_0x100fbc.nodeCount, 0),
    renderNodeCount: toFiniteNumber(_0x100fbc.renderNodeCount, 0),
    mountCandidateCount: toFiniteNumber(_0x100fbc.mountCandidateCount, 0),
    parkCandidateCount: toFiniteNumber(_0x100fbc.parkCandidateCount, 0),
    viewportBusy: _0x100fbc.viewportBusy === true,
    createdCount: _0x2b073b,
    createRuntimeMs: toFiniteNumber(_0x100fbc.createRuntimeMs, 0),
    createRuntimeMaxMs: toFiniteNumber(_0x100fbc.createRuntimeMaxMs, 0),
    remountedCount: _0x126c4c,
    remountRuntimeMs: toFiniteNumber(_0x100fbc.remountRuntimeMs, 0),
    remountRuntimeMaxMs: toFiniteNumber(_0x100fbc.remountRuntimeMaxMs, 0),
    parkedCount: _0x178e00,
    parkRuntimeMs: toFiniteNumber(_0x100fbc.parkRuntimeMs, 0),
    parkRuntimeMaxMs: toFiniteNumber(_0x100fbc.parkRuntimeMaxMs, 0),
    updateCount: _0x116f33,
    hiddenUpdateCount: toFiniteNumber(_0x100fbc.hiddenUpdateCount, 0),
    updateRuntimeMs: toFiniteNumber(_0x100fbc.updateRuntimeMs, 0),
    updateRuntimeMaxMs: toFiniteNumber(_0x100fbc.updateRuntimeMaxMs, 0),
    skippedUpdateCount: _0x121f1f,
    mountBatchCount: _0x20390e,
    mountBatchFlushMs: toFiniteNumber(_0x100fbc.mountBatchFlushMs, 0),
    mountBatchFlushMaxMs: toFiniteNumber(_0x100fbc.mountBatchFlushMaxMs, 0),
    createdByType: normalizeLifecycleTypeBreakdown(_0x100fbc.createdByType),
    updatedByType: normalizeLifecycleTypeBreakdown(_0x100fbc.updatedByType),
    slowCreates: normalizeLifecycleSlowList(_0x100fbc.slowCreates),
    slowUpdates: normalizeLifecycleSlowList(_0x100fbc.slowUpdates),
    at: Date.now()
  }, NODE_LIFECYCLE_SAMPLE_LIMIT);
}
export function recordLongTaskSample(_0x4d454a, _0x4a43c7 = {}) {
  const _0xd23221 = ensureStore();
  if (!isEnabled(_0xd23221)) {
    return;
  }
  const _0x23cbb1 = toFiniteNumber(_0x4d454a, 0);
  if (!Number.isFinite(_0x23cbb1) || _0x23cbb1 <= 0) {
    return;
  }
  _0xd23221.maxLongTaskMs = Math.max(toFiniteNumber(_0xd23221.maxLongTaskMs, 0), _0x23cbb1);
  pushCapped(_0xd23221.longTaskSamples, {
    durationMs: _0x23cbb1,
    name: String(_0x4a43c7.name || ""),
    startTime: toFiniteNumber(_0x4a43c7.startTime, 0),
    source: String(_0x4a43c7.source || "manual"),
    at: Date.now()
  }, LONG_TASK_SAMPLE_LIMIT);
}
export function recordRendererVirtualizationSample(_0x4cdb9a = {}) {
  const _0x461186 = ensureStore();
  if (!isEnabled(_0x461186)) {
    return;
  }
  pushCapped(_0x461186.virtualizationSamples, {
    cacheHit: _0x4cdb9a.cacheHit === true,
    spatialIndex: _0x4cdb9a.spatialIndex === true,
    snapshotRev: toFiniteNumber(_0x4cdb9a.snapshotRev, 0),
    nodeCount: toFiniteNumber(_0x4cdb9a.nodeCount, 0),
    mountCandidateCount: toFiniteNumber(_0x4cdb9a.mountCandidateCount, 0),
    previewCandidateCount: toFiniteNumber(_0x4cdb9a.previewCandidateCount, 0),
    parkCandidateCount: toFiniteNumber(_0x4cdb9a.parkCandidateCount, 0),
    keepAliveCount: toFiniteNumber(_0x4cdb9a.keepAliveCount, 0),
    containerW: toFiniteNumber(_0x4cdb9a.containerW, 0),
    containerH: toFiniteNumber(_0x4cdb9a.containerH, 0),
    at: Date.now()
  }, VIRTUALIZATION_SAMPLE_LIMIT);
}
export function resetPerfProbeData() {
  const _0xab557e = ensureStore();
  if (!_0xab557e) {
    return;
  }
  for (const _0x576aeb of Object.values(_0xab557e.dragSessions || {})) {
    if (_0x576aeb && _0x576aeb.rafId !== null) {
      cancelProbeFrame(_0x576aeb.rafId);
    }
  }
  for (const _0xb364b1 of Object.values(_0xab557e.zoomSessions || {})) {
    if (_0xb364b1 && _0xb364b1.rafId !== null) {
      cancelProbeFrame(_0xb364b1.rafId);
    }
  }
  for (const _0x585bbc of Object.values(_0xab557e.resizeSessions || {})) {
    if (_0x585bbc && _0x585bbc.rafId !== null) {
      cancelProbeFrame(_0x585bbc.rafId);
    }
  }
  _0xab557e.dragSessions = {};
  _0xab557e.dragFpsSessions = [];
  for (const _0x2bcc17 of Object.values(_0xab557e.panSessions || {})) {
    if (_0x2bcc17 && _0x2bcc17.rafId !== null) {
      cancelProbeFrame(_0x2bcc17.rafId);
    }
  }
  _0xab557e.panSessions = {};
  _0xab557e.panFpsSessions = [];
  _0xab557e.canvasPanSamples = [];
  _0xab557e.zoomSessions = {};
  _0xab557e.zoomFpsSessions = [];
  _0xab557e.resizeSessions = {};
  _0xab557e.resizeFpsSessions = [];
  _0xab557e.edgeRedrawSamples = [];
  _0xab557e.fastPreviewSamples = [];
  _0xab557e.renderFrameSamples = [];
  _0xab557e.nodeLifecycleSamples = [];
  _0xab557e.virtualizationSamples = [];
  _0xab557e.minimapUpdateSamples = [];
  _0xab557e.longTaskSamples = [];
  _0xab557e.longAnimationFrameSamples = [];
  _0xab557e.maxLongAnimationFrameDurationMs = 0;
  _0xab557e.maxLongAnimationFrameBlockingDurationMs = 0;
  Object.assign(_0xab557e, createMilestoneState());
}
export function getPerfProbeSnapshot() {
  const _0x351bbf = ensureStore();
  if (!_0x351bbf) {
    return {
      version: 1,
      enabled: false,
      dragFpsSessions: [],
      panFpsSessions: [],
      canvasPanSamples: [],
      zoomFpsSessions: [],
      resizeFpsSessions: [],
      edgeRedrawSamples: [],
      fastPreviewSamples: [],
      renderFrameSamples: [],
      nodeLifecycleSamples: [],
      virtualizationSamples: [],
      minimapUpdateSamples: [],
      longTaskSamples: [],
      longAnimationFrameSupported: false,
      longAnimationFrameObserverActive: false,
      longAnimationFrameSamples: [],
      slowLongAnimationFrames: [],
      maxLongAnimationFrameDurationMs: 0,
      maxLongAnimationFrameBlockingDurationMs: 0,
      mediaSchedulerStats: getCanvasMediaSchedulerStats(),
      staticMediaResourceSummary: summarizeStaticMediaResources(),
      firstVisualMs: null,
      firstInteractiveMs: null,
      maxLongTaskMs: 0
    };
  }
  const _0x3e68c4 = Array.isArray(_0x351bbf.longAnimationFrameSamples) ? _0x351bbf.longAnimationFrameSamples.map(cloneLongAnimationFrameSample) : [];
  const _0x459930 = _0x3e68c4.slice().sort((_0x38d5a1, _0x1f2822) => _0x1f2822.durationMs - _0x38d5a1.durationMs).slice(0, SLOW_LONG_ANIMATION_FRAME_LIMIT);
  return {
    version: 1,
    enabled: !!_0x351bbf.enabled,
    dragFpsSessions: Array.isArray(_0x351bbf.dragFpsSessions) ? _0x351bbf.dragFpsSessions.map(_0x1a74c9 => ({
      ..._0x1a74c9
    })) : [],
    panFpsSessions: Array.isArray(_0x351bbf.panFpsSessions) ? _0x351bbf.panFpsSessions.map(_0x344bf7 => ({
      ..._0x344bf7
    })) : [],
    canvasPanSamples: Array.isArray(_0x351bbf.canvasPanSamples) ? _0x351bbf.canvasPanSamples.map(_0x4233e2 => ({
      ..._0x4233e2
    })) : [],
    zoomFpsSessions: Array.isArray(_0x351bbf.zoomFpsSessions) ? _0x351bbf.zoomFpsSessions.map(_0x18d049 => ({
      ..._0x18d049
    })) : [],
    resizeFpsSessions: Array.isArray(_0x351bbf.resizeFpsSessions) ? _0x351bbf.resizeFpsSessions.map(_0x243112 => ({
      ..._0x243112
    })) : [],
    edgeRedrawSamples: Array.isArray(_0x351bbf.edgeRedrawSamples) ? _0x351bbf.edgeRedrawSamples.map(_0x33f791 => ({
      ..._0x33f791
    })) : [],
    fastPreviewSamples: Array.isArray(_0x351bbf.fastPreviewSamples) ? _0x351bbf.fastPreviewSamples.map(_0x653012 => ({
      ..._0x653012
    })) : [],
    renderFrameSamples: Array.isArray(_0x351bbf.renderFrameSamples) ? _0x351bbf.renderFrameSamples.map(_0x2d6f5a => ({
      ..._0x2d6f5a
    })) : [],
    nodeLifecycleSamples: Array.isArray(_0x351bbf.nodeLifecycleSamples) ? _0x351bbf.nodeLifecycleSamples.map(_0x36279a => ({
      ..._0x36279a,
      createdByType: Array.isArray(_0x36279a.createdByType) ? _0x36279a.createdByType.map(_0x46c95b => ({
        ..._0x46c95b
      })) : [],
      updatedByType: Array.isArray(_0x36279a.updatedByType) ? _0x36279a.updatedByType.map(_0x4e6632 => ({
        ..._0x4e6632
      })) : [],
      slowCreates: Array.isArray(_0x36279a.slowCreates) ? _0x36279a.slowCreates.map(_0xa5b9cb => ({
        ..._0xa5b9cb
      })) : [],
      slowUpdates: Array.isArray(_0x36279a.slowUpdates) ? _0x36279a.slowUpdates.map(_0x68dd1b => ({
        ..._0x68dd1b
      })) : []
    })) : [],
    virtualizationSamples: Array.isArray(_0x351bbf.virtualizationSamples) ? _0x351bbf.virtualizationSamples.map(_0x38e840 => ({
      ..._0x38e840
    })) : [],
    minimapUpdateSamples: Array.isArray(_0x351bbf.minimapUpdateSamples) ? _0x351bbf.minimapUpdateSamples.map(_0x173b8b => ({
      ..._0x173b8b
    })) : [],
    longTaskSamples: Array.isArray(_0x351bbf.longTaskSamples) ? _0x351bbf.longTaskSamples.map(_0x4b1dd0 => ({
      ..._0x4b1dd0
    })) : [],
    longAnimationFrameSupported: _0x351bbf.longAnimationFrameSupported === true,
    longAnimationFrameObserverActive: _0x351bbf.longAnimationFrameObserverActive === true,
    longAnimationFrameSamples: _0x3e68c4,
    slowLongAnimationFrames: _0x459930,
    maxLongAnimationFrameDurationMs: toFiniteNumber(_0x351bbf.maxLongAnimationFrameDurationMs, 0),
    maxLongAnimationFrameBlockingDurationMs: toFiniteNumber(_0x351bbf.maxLongAnimationFrameBlockingDurationMs, 0),
    mediaSchedulerStats: getCanvasMediaSchedulerStats(),
    staticMediaResourceSummary: summarizeStaticMediaResources(),
    firstVisualMs: _0x351bbf.firstVisualMs,
    firstInteractiveMs: _0x351bbf.firstInteractiveMs,
    maxLongTaskMs: toFiniteNumber(_0x351bbf.maxLongTaskMs, 0)
  };
}