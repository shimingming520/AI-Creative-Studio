import a217_0x15b360 from "yazl";
import { randomUUID } from "node:crypto";
import { appendFileSync, closeSync, createWriteStream, existsSync, mkdirSync, openSync, readFileSync, readSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import a217_0x7d317d from "node:os";
import a217_0x3479f0 from "node:path";
const DESKTOP_LOG_NAME = "desktop.log.jsonl";
const ROTATED_DESKTOP_LOG_NAME = DESKTOP_LOG_NAME + ".1";
const DIAGNOSTIC_README_NAME = "README.txt";
const DIAGNOSTIC_METADATA_NAME = "metadata.json";
const AI_DIAGNOSTICS_REPORT_NAME = "ai-diagnostics-report.json";
const DIAGNOSTIC_PACKAGE_MANIFEST_NAME = "package-manifest.json";
const DIAGNOSTIC_ERROR_SUMMARY_NAME = "error-summary.json";
const DEFAULT_MAX_LOG_BYTES = 5242880;
const DEFAULT_SERVER_TAIL_BYTES = 1048576;
const DEFAULT_DESKTOP_TAIL_BYTES = 2097152;
const DEFAULT_ROTATED_DESKTOP_TAIL_BYTES = 2097152;
const MAX_RECENT_PROBLEMS = 30;
const MAX_STRING_LENGTH = 2000;
const MAX_STACK_LENGTH = 10000;
const MAX_ARRAY_ITEMS = 30;
const MAX_OBJECT_KEYS = 80;
const MAX_DEPTH = 5;
const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_RE = /(?:api[-_ ]?key|token|authorization|password|passwd|pwd|cdkey|secret|cookie|session|bearer|access[-_ ]?key|refresh[-_ ]?key)/i;
const PRIVATE_CONTENT_KEY_RE = /^(?:prompt|negativePrompt|inputText|sourceText|projectJson|canvasJson|requestBody|responseBody|rawRequest|rawResponse)$/i;
const SAFE_DIAGNOSTIC_KEYS = new Set(["dragFpsSessions", "panFpsSessions", "zoomFpsSessions", "resizeFpsSessions", "launchSessionId", "launchSessionIds"]);
const SENSITIVE_TEXT_NAME = String.raw`(?:api[-_ ]?key|token|authorization|password|passwd|pwd|cdkey|secret|cookie|bearer|access[-_ ]?key|refresh[-_ ]?key|prompt|negativePrompt|inputText|sourceText|projectJson|canvasJson|requestBody|responseBody|rawRequest|rawResponse)`;
const PRIVATE_CONTENT_TEXT_NAME = String.raw`(?:prompt|negativePrompt|inputText|sourceText|projectJson|canvasJson|requestBody|responseBody|rawRequest|rawResponse)`;
const PRIVATE_CONTENT_ASSIGNMENT_RE = new RegExp(String.raw`((?:["']?${PRIVATE_CONTENT_TEXT_NAME}["']?)\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\r\n]*)`, "gi");
const SENSITIVE_ASSIGNMENT_RE = new RegExp(String.raw`((?:["']?${SENSITIVE_TEXT_NAME}["']?)\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;\]}]+)`, "gi");
const SENSITIVE_QUERY_RE = new RegExp(String.raw`([?&]${SENSITIVE_TEXT_NAME}=)[^&#\s]*`, "gi");
const BEARER_VALUE_RE = /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi;
const COMMON_SECRET_VALUE_RE = /\b(?:sk|rk|pk)-[A-Za-z0-9_-]{8,}\b/gi;
function normalizeOneLine(_0x5910bf, _0x275f62 = "") {
  return String(_0x5910bf ?? _0x275f62).replace(/\s+/g, " ").trim();
}
function truncateString(_0x414044, _0xa49c98 = MAX_STRING_LENGTH) {
  const _0x505c5e = String(_0x414044 ?? "");
  if (_0x505c5e.length <= _0xa49c98) {
    return _0x505c5e;
  }
  return _0x505c5e.slice(0, _0xa49c98) + "... [truncated " + (_0x505c5e.length - _0xa49c98) + " chars]";
}
function escapeRegExp(_0x410cb5) {
  return String(_0x410cb5 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function redactSensitiveText(_0x282e18) {
  let _0x279884 = String(_0x282e18 ?? "");
  _0x279884 = _0x279884.replace(PRIVATE_CONTENT_ASSIGNMENT_RE, "$1" + REDACTED).replace(BEARER_VALUE_RE, "Bearer " + REDACTED).replace(SENSITIVE_QUERY_RE, "$1" + REDACTED).replace(SENSITIVE_ASSIGNMENT_RE, "$1" + REDACTED).replace(COMMON_SECRET_VALUE_RE, REDACTED);
  const _0x55b7d2 = String(a217_0x7d317d.homedir?.() || "").trim();
  if (_0x55b7d2) {
    const _0x589625 = new Set([_0x55b7d2, _0x55b7d2.replace(/\\/g, "/")]);
    for (const _0x3ca7d9 of _0x589625) {
      if (!_0x3ca7d9) {
        continue;
      }
      _0x279884 = _0x279884.replace(new RegExp(escapeRegExp(_0x3ca7d9), "gi"), "%USERPROFILE%");
    }
  }
  return _0x279884;
}
function sanitizeDiagnosticText(_0x4ccaeb, _0x22e7ca = MAX_STRING_LENGTH) {
  return truncateString(redactSensitiveText(_0x4ccaeb), _0x22e7ca);
}
function isSensitiveDiagnosticKey(_0x1161e6) {
  const _0x30de9b = String(_0x1161e6 || "");
  if (SAFE_DIAGNOSTIC_KEYS.has(_0x30de9b)) {
    return false;
  }
  return SENSITIVE_KEY_RE.test(_0x30de9b) || PRIVATE_CONTENT_KEY_RE.test(_0x30de9b);
}
function sanitizeError(_0x3a3950) {
  return {
    name: sanitizeDiagnosticText(_0x3a3950?.name || "Error", 160),
    message: sanitizeDiagnosticText(_0x3a3950?.message || String(_0x3a3950 || ""), MAX_STRING_LENGTH),
    stack: sanitizeDiagnosticText(_0x3a3950?.stack || "", MAX_STACK_LENGTH)
  };
}
export function sanitizeDiagnosticValue(_0x2f7ac4, _0x8e37b6 = {}) {
  const _0x1c30f8 = Number(_0x8e37b6.depth || 0) || 0;
  const _0x4986bb = String(_0x8e37b6.key || "");
  if (isSensitiveDiagnosticKey(_0x4986bb)) {
    return REDACTED;
  }
  if (_0x2f7ac4 instanceof Error) {
    return sanitizeError(_0x2f7ac4);
  }
  if (_0x2f7ac4 == null) {
    return _0x2f7ac4;
  }
  const _0x9aeba0 = typeof _0x2f7ac4;
  if (_0x9aeba0 === "string") {
    return sanitizeDiagnosticText(_0x2f7ac4);
  }
  if (_0x9aeba0 === "number" || _0x9aeba0 === "boolean") {
    return _0x2f7ac4;
  }
  if (_0x9aeba0 === "bigint") {
    return String(_0x2f7ac4);
  }
  if (_0x9aeba0 === "function") {
    return "[Function]";
  }
  if (_0x9aeba0 !== "object") {
    return sanitizeDiagnosticText(String(_0x2f7ac4));
  }
  if (_0x1c30f8 >= MAX_DEPTH) {
    return "[MaxDepth]";
  }
  if (Array.isArray(_0x2f7ac4)) {
    const _0x5d3bfb = _0x2f7ac4.slice(0, MAX_ARRAY_ITEMS).map(_0x5ba332 => sanitizeDiagnosticValue(_0x5ba332, {
      depth: _0x1c30f8 + 1
    }));
    if (_0x2f7ac4.length > MAX_ARRAY_ITEMS) {
      _0x5d3bfb.push("[truncated " + (_0x2f7ac4.length - MAX_ARRAY_ITEMS) + " items]");
    }
    return _0x5d3bfb;
  }
  const _0x53032f = {};
  const _0x330810 = Object.entries(_0x2f7ac4).slice(0, MAX_OBJECT_KEYS);
  for (const [_0x53035f, _0x3ef741] of _0x330810) {
    _0x53032f[_0x53035f] = sanitizeDiagnosticValue(_0x3ef741, {
      key: _0x53035f,
      depth: _0x1c30f8 + 1
    });
  }
  const _0x271af2 = Object.keys(_0x2f7ac4).length - _0x330810.length;
  if (_0x271af2 > 0) {
    _0x53032f.__truncatedKeys = _0x271af2;
  }
  return _0x53032f;
}
export function buildDiagnosticLogEntry(_0x50652e = {}, _0x23c948 = new Date(), _0x35d8d4 = {}) {
  const _0x51914d = normalizeOneLine(_0x50652e.source, "unknown") || "unknown";
  const _0x8b354f = normalizeOneLine(_0x50652e.type, "event") || "event";
  const _0x23383d = normalizeOneLine(_0x50652e.level, "info").toLowerCase();
  const _0x5acad9 = ["debug", "info", "warn", "error"].includes(_0x23383d) ? _0x23383d : "info";
  const _0x3d0cde = _0x50652e.error instanceof Error ? _0x50652e.error : null;
  const _0x2a548a = normalizeOneLine(_0x35d8d4.launchSessionId || _0x50652e.launchSessionId);
  const _0x1484c7 = Number(_0x35d8d4.eventSeq || _0x50652e.eventSeq || 0) || 0;
  return {
    ts: _0x23c948.toISOString(),
    ...(_0x2a548a ? {
      launchSessionId: truncateString(_0x2a548a, 120)
    } : {}),
    ...(_0x1484c7 > 0 ? {
      eventSeq: _0x1484c7
    } : {}),
    type: truncateString(_0x8b354f, 120),
    level: _0x5acad9,
    source: truncateString(_0x51914d, 120),
    message: sanitizeDiagnosticText(_0x50652e.message || _0x3d0cde?.message || _0x50652e.error || _0x8b354f, MAX_STRING_LENGTH),
    context: sanitizeDiagnosticValue(_0x50652e.context || {}),
    stack: sanitizeDiagnosticText(_0x50652e.stack || _0x3d0cde?.stack || "", MAX_STACK_LENGTH)
  };
}
function ensureDir(_0x56e4e2) {
  mkdirSync(_0x56e4e2, {
    recursive: true
  });
  return _0x56e4e2;
}
function safeUnlink(_0x2f2a10) {
  try {
    if (existsSync(_0x2f2a10)) {
      unlinkSync(_0x2f2a10);
    }
  } catch {}
}
function rotateLogIfNeeded(_0x51b3d2, _0x3b1c67) {
  try {
    if (!existsSync(_0x51b3d2)) {
      return;
    }
    const _0x5697d9 = statSync(_0x51b3d2).size;
    if (_0x5697d9 < _0x3b1c67) {
      return;
    }
    const _0x235c7b = _0x51b3d2 + ".1";
    safeUnlink(_0x235c7b);
    renameSync(_0x51b3d2, _0x235c7b);
  } catch {}
}
function readTailSnapshot(_0x2e3e32, _0x419bcb) {
  try {
    if (!_0x2e3e32 || !existsSync(_0x2e3e32)) {
      return {
        buffer: Buffer.alloc(0),
        exists: false,
        sourceBytes: 0,
        includedBytes: 0,
        truncated: false
      };
    }
    const _0x3d8b67 = statSync(_0x2e3e32);
    if (!_0x3d8b67.isFile() || _0x3d8b67.size <= 0) {
      return {
        buffer: Buffer.alloc(0),
        exists: _0x3d8b67.isFile(),
        sourceBytes: Math.max(0, Number(_0x3d8b67.size || 0)),
        includedBytes: 0,
        truncated: false
      };
    }
    const _0x381ede = Math.min(_0x3d8b67.size, _0x419bcb);
    const _0x1880db = Math.max(0, _0x3d8b67.size - _0x381ede);
    const _0x426769 = Buffer.alloc(_0x381ede);
    const _0x79bf8e = openSync(_0x2e3e32, "r");
    try {
      readSync(_0x79bf8e, _0x426769, 0, _0x381ede, _0x1880db);
    } finally {
      closeSync(_0x79bf8e);
    }
    return {
      buffer: _0x426769,
      exists: true,
      sourceBytes: _0x3d8b67.size,
      includedBytes: _0x426769.length,
      truncated: _0x3d8b67.size > _0x426769.length
    };
  } catch {
    return {
      buffer: Buffer.alloc(0),
      exists: false,
      sourceBytes: 0,
      includedBytes: 0,
      truncated: false,
      readFailed: true
    };
  }
}
function parseJsonlEntries(_0x52d491 = []) {
  const _0x470f71 = [];
  for (const _0x39c4b0 of _0x52d491) {
    const _0x1c253c = Buffer.isBuffer(_0x39c4b0) ? _0x39c4b0.toString("utf8").split(/\r?\n/) : [];
    for (const _0x3dd16d of _0x1c253c) {
      if (!_0x3dd16d.trim()) {
        continue;
      }
      try {
        const _0x92e63d = JSON.parse(_0x3dd16d);
        if (_0x92e63d && typeof _0x92e63d === "object") {
          _0x470f71.push(_0x92e63d);
        }
      } catch {}
    }
  }
  return _0x470f71.sort((_0x336219, _0xd2ae07) => String(_0x336219?.ts || "").localeCompare(String(_0xd2ae07?.ts || "")));
}
function sanitizeStructuredLogBuffer(_0x13dc1e) {
  if (!Buffer.isBuffer(_0x13dc1e) || _0x13dc1e.length === 0) {
    return Buffer.alloc(0);
  }
  const _0x57b9d0 = [];
  for (const _0x12127d of _0x13dc1e.toString("utf8").split(/\r?\n/)) {
    if (!_0x12127d.trim()) {
      continue;
    }
    try {
      const _0x1dd75b = JSON.parse(_0x12127d);
      _0x57b9d0.push(JSON.stringify(sanitizeDiagnosticValue(_0x1dd75b)));
    } catch {}
  }
  return Buffer.from(_0x57b9d0.length ? _0x57b9d0.join("\n") + "\n" : "", "utf8");
}
function incrementCounter(_0xc0355d, _0x338312) {
  const _0x452ceb = normalizeOneLine(_0x338312, "unknown") || "unknown";
  _0xc0355d[_0x452ceb] = (_0xc0355d[_0x452ceb] || 0) + 1;
}
function sortCounter(_0x4aa399, _0x5a68bc = 50) {
  return Object.fromEntries(Object.entries(_0x4aa399).sort((_0x17b67d, _0x1a315a) => _0x1a315a[1] - _0x17b67d[1] || _0x17b67d[0].localeCompare(_0x1a315a[0])).slice(0, _0x5a68bc));
}
function buildErrorSummary(_0x57feb1 = [], _0xa106e4 = {}) {
  const _0x3a58a3 = {};
  const _0x3af1c2 = {};
  const _0x165509 = {};
  const _0x69b51f = new Set();
  const _0x53b080 = new Map();
  const _0x5ce2ae = [];
  for (const _0x21b0ae of _0x57feb1) {
    incrementCounter(_0x3a58a3, _0x21b0ae?.level || "info");
    incrementCounter(_0x3af1c2, _0x21b0ae?.source || "unknown");
    if (_0x21b0ae?.launchSessionId) {
      const _0x51806e = String(_0x21b0ae.launchSessionId);
      _0x69b51f.add(_0x51806e);
      const _0x407020 = _0x53b080.get(_0x51806e) || {
        launchSessionId: _0x51806e,
        firstEventAt: _0x21b0ae?.ts || "",
        lastEventAt: _0x21b0ae?.ts || "",
        eventCount: 0,
        problemCount: 0,
        startedAt: "",
        endedAt: ""
      };
      _0x407020.lastEventAt = _0x21b0ae?.ts || _0x407020.lastEventAt;
      _0x407020.eventCount += 1;
      if (_0x21b0ae?.level === "error" || _0x21b0ae?.level === "warn") {
        _0x407020.problemCount += 1;
      }
      if (_0x21b0ae?.type === "app.session_started") {
        _0x407020.startedAt = _0x21b0ae?.ts || "";
      }
      if (_0x21b0ae?.type === "app.session_ended") {
        _0x407020.endedAt = _0x21b0ae?.ts || "";
      }
      _0x53b080.set(_0x51806e, _0x407020);
    }
    if (_0x21b0ae?.level !== "error" && _0x21b0ae?.level !== "warn") {
      continue;
    }
    incrementCounter(_0x165509, _0x21b0ae?.type || "unknown");
    _0x5ce2ae.push({
      ts: _0x21b0ae?.ts || "",
      launchSessionId: _0x21b0ae?.launchSessionId || "",
      eventSeq: Number(_0x21b0ae?.eventSeq || 0) || 0,
      type: _0x21b0ae?.type || "unknown",
      level: _0x21b0ae?.level || "warn",
      source: _0x21b0ae?.source || "unknown",
      message: _0x21b0ae?.message || "",
      context: _0x21b0ae?.context || {},
      stack: sanitizeDiagnosticText(_0x21b0ae?.stack || "", 4000)
    });
  }
  return sanitizeDiagnosticValue({
    schemaVersion: 1,
    generatedAt: _0xa106e4.generatedAt || new Date().toISOString(),
    launchSessionId: _0xa106e4.launchSessionId || "",
    eventCount: _0x57feb1.length,
    problemCount: _0x5ce2ae.length,
    timeRange: {
      first: _0x57feb1[0]?.ts || "",
      last: _0x57feb1.at(-1)?.ts || ""
    },
    launchSessionIds: Array.from(_0x69b51f).slice(-20),
    sessions: Array.from(_0x53b080.values()).slice(-20).map(_0x40605a => ({
      ..._0x40605a,
      normalEndRecorded: Boolean(_0x40605a.endedAt)
    })),
    levelCounts: sortCounter(_0x3a58a3),
    sourceCounts: sortCounter(_0x3af1c2),
    problemTypeCounts: sortCounter(_0x165509),
    recentProblems: _0x5ce2ae.slice(-MAX_RECENT_PROBLEMS),
    notes: ["The summary contains structured warning/error events only.", "Use launchSessionId, eventSeq, taskId and nodeId to correlate related events when available."]
  });
}
function sanitizeServerLogBuffer(_0x1aeeb6) {
  if (!Buffer.isBuffer(_0x1aeeb6) || _0x1aeeb6.length === 0) {
    return Buffer.alloc(0);
  }
  return Buffer.from(redactSensitiveText(_0x1aeeb6.toString("utf8")), "utf8");
}
function describePackageFile(_0x45fd34, _0x496607, _0x298691 = {}) {
  return {
    name: _0x45fd34,
    kind: _0x298691.kind || "log",
    included: _0x298691.included !== false,
    sourceBytes: Number(_0x496607?.sourceBytes || 0),
    includedBytes: Number(_0x298691.includedBytes ?? _0x496607?.includedBytes ?? 0),
    truncated: _0x496607?.truncated === true,
    readFailed: _0x496607?.readFailed === true,
    redacted: _0x298691.redacted === true
  };
}
function writeZip(_0x18b2ba, _0x2fdb73) {
  return new Promise((_0x516a17, _0x24b90e) => {
    const _0xc43c8d = createWriteStream(_0x2fdb73);
    _0xc43c8d.once("close", _0x516a17);
    _0xc43c8d.once("error", _0x24b90e);
    _0x18b2ba.outputStream.once("error", _0x24b90e);
    _0x18b2ba.outputStream.pipe(_0xc43c8d);
    _0x18b2ba.end();
  });
}
function resolveDownloadsDir(_0x5b03e2, _0x181c8b) {
  try {
    const _0x25a875 = _0x5b03e2?.getPath?.("downloads");
    if (_0x25a875) {
      return ensureDir(_0x25a875);
    }
  } catch {}
  return ensureDir(_0x181c8b);
}
function timestampForFilename(_0x538ef7 = new Date()) {
  const _0x3b4bd3 = _0x12ac92 => String(_0x12ac92).padStart(2, "0");
  return [_0x538ef7.getFullYear(), _0x3b4bd3(_0x538ef7.getMonth() + 1), _0x3b4bd3(_0x538ef7.getDate()), "-", _0x3b4bd3(_0x538ef7.getHours()), _0x3b4bd3(_0x538ef7.getMinutes()), _0x3b4bd3(_0x538ef7.getSeconds())].join("");
}
function buildReadme() {
  return ["SHUO Canvas 诊断包", "", "请将整个 ZIP 文件发送给开发者用于排查问题。", "本诊断包包含运行日志、错误摘要、环境摘要和生成瞬间的脱敏状态快照。", "不包含项目文件、画布正文、素材、提示词、API Key 或授权码。", "package-manifest.json 会说明日志时间范围、截断和脱敏状态。", ""].join("\n");
}
export function createDiagnosticsManager(_0x47340e = {}) {
  const _0x4b6b0c = ensureDir(_0x47340e.logDir);
  const _0x250c8e = ensureDir(_0x47340e.diagnosticsDir || a217_0x3479f0.join(_0x4b6b0c, "diagnostics"));
  const _0x34e34d = _0x47340e.desktopLogPath || a217_0x3479f0.join(_0x4b6b0c, DESKTOP_LOG_NAME);
  const _0x315aea = _0x47340e.serverLogPath || "";
  const _0x2e2739 = Number(_0x47340e.maxLogBytes || DEFAULT_MAX_LOG_BYTES) || DEFAULT_MAX_LOG_BYTES;
  const _0xc07686 = normalizeOneLine(_0x47340e.launchSessionId || randomUUID());
  const _0x4ff846 = _0x47340e.app || null;
  const _0x660576 = typeof _0x47340e.getMetadata === "function" ? _0x47340e.getMetadata : () => ({});
  let _0x2c706c = 0;
  let _0x344ed9 = false;
  let _0x5a7d99 = false;
  function _0x3ebc46(_0x5c5058 = {}) {
    try {
      ensureDir(_0x4b6b0c);
      rotateLogIfNeeded(_0x34e34d, _0x2e2739);
      _0x2c706c += 1;
      const _0x2d7617 = buildDiagnosticLogEntry(_0x5c5058, new Date(), {
        launchSessionId: _0xc07686,
        eventSeq: _0x2c706c
      });
      appendFileSync(_0x34e34d, JSON.stringify(_0x2d7617) + "\n", "utf8");
      return {
        ok: true
      };
    } catch (_0x5e0db5) {
      return {
        ok: false,
        error: String(_0x5e0db5?.message || _0x5e0db5)
      };
    }
  }
  function _0x5a1fb6(_0x4eea93 = new Date()) {
    const _0x56bd71 = "AI-CanvasPro-Diagnostics-" + timestampForFilename(_0x4eea93) + ".zip";
    return a217_0x3479f0.join(resolveDownloadsDir(_0x4ff846, _0x250c8e), _0x56bd71);
  }
  async function _0x4a234d(_0x4e2c5d = {}) {
    const _0xf96272 = new Date();
    _0x3ebc46({
      type: "diagnostics.package_collecting",
      level: "info",
      source: "main",
      message: "Diagnostics package collection started"
    });
    const _0x32af0f = String(_0x4e2c5d?.outputPath || "").trim();
    if (_0x32af0f && !a217_0x3479f0.isAbsolute(_0x32af0f)) {
      throw new Error("Diagnostics output path must be absolute");
    }
    const _0x16c2d1 = _0x32af0f ? a217_0x3479f0.resolve(_0x32af0f) : _0x5a1fb6(_0xf96272);
    ensureDir(a217_0x3479f0.dirname(_0x16c2d1));
    const _0x4e432f = a217_0x3479f0.basename(_0x16c2d1);
    const _0x4aa09f = await Promise.resolve(_0x660576());
    const _0x57305f = sanitizeDiagnosticValue({
      generatedAt: _0xf96272.toISOString(),
      host: {
        platform: process.platform,
        arch: process.arch,
        osRelease: a217_0x7d317d.release()
      },
      diagnostics: {
        schemaVersion: 2,
        launchSessionId: _0xc07686
      },
      ...(_0x4aa09f || {})
    });
    const _0x13cde3 = _0x34e34d + ".1";
    const _0x104121 = readTailSnapshot(_0x13cde3, DEFAULT_ROTATED_DESKTOP_TAIL_BYTES);
    const _0x3b01df = readTailSnapshot(_0x34e34d, DEFAULT_DESKTOP_TAIL_BYTES);
    const _0x2befc9 = readTailSnapshot(_0x315aea, DEFAULT_SERVER_TAIL_BYTES);
    const _0x3fe1dd = sanitizeStructuredLogBuffer(_0x104121.buffer);
    const _0x5c2b54 = sanitizeStructuredLogBuffer(_0x3b01df.buffer);
    const _0x78cd36 = sanitizeServerLogBuffer(_0x2befc9.buffer);
    const _0x45cb36 = parseJsonlEntries([_0x3fe1dd, _0x5c2b54]);
    const _0x350816 = buildErrorSummary(_0x45cb36, {
      generatedAt: _0xf96272.toISOString(),
      launchSessionId: _0xc07686
    });
    const _0x5e94e1 = _0x4e2c5d?.aiAnalysisReport && typeof _0x4e2c5d.aiAnalysisReport === "object" ? sanitizeDiagnosticValue(_0x4e2c5d.aiAnalysisReport) : null;
    const _0x384765 = Buffer.from(JSON.stringify(_0x57305f, null, 2) + "\n", "utf8");
    const _0x515df5 = Buffer.from(JSON.stringify(_0x350816, null, 2) + "\n", "utf8");
    const _0x42d082 = _0x5e94e1 ? Buffer.from(JSON.stringify(_0x5e94e1, null, 2) + "\n", "utf8") : null;
    const _0x784351 = Buffer.from(buildReadme(), "utf8");
    const _0x5bd7db = [describePackageFile(DIAGNOSTIC_METADATA_NAME, null, {
      kind: "environment",
      includedBytes: _0x384765.length
    }), describePackageFile(DIAGNOSTIC_ERROR_SUMMARY_NAME, null, {
      kind: "summary",
      includedBytes: _0x515df5.length
    }), describePackageFile(DESKTOP_LOG_NAME, _0x3b01df, {
      kind: "structured-log",
      includedBytes: _0x5c2b54.length,
      redacted: true
    }), describePackageFile(ROTATED_DESKTOP_LOG_NAME, _0x104121, {
      kind: "structured-log-archive",
      included: _0x104121.exists,
      includedBytes: _0x3fe1dd.length,
      redacted: true
    }), describePackageFile("server.log", _0x2befc9, {
      kind: "backend-log",
      includedBytes: _0x78cd36.length,
      redacted: true
    }), describePackageFile(DIAGNOSTIC_README_NAME, null, {
      kind: "instructions",
      includedBytes: _0x784351.length
    })];
    if (_0x42d082) {
      _0x5bd7db.splice(1, 0, describePackageFile(AI_DIAGNOSTICS_REPORT_NAME, null, {
        kind: "runtime-snapshot",
        includedBytes: _0x42d082.length
      }));
    }
    const _0x35070f = sanitizeDiagnosticValue({
      schemaVersion: 1,
      generatedAt: _0xf96272.toISOString(),
      launchSessionId: _0xc07686,
      limits: {
        desktopTailBytes: DEFAULT_DESKTOP_TAIL_BYTES,
        rotatedDesktopTailBytes: DEFAULT_ROTATED_DESKTOP_TAIL_BYTES,
        serverTailBytes: DEFAULT_SERVER_TAIL_BYTES,
        recentProblems: MAX_RECENT_PROBLEMS
      },
      structuredLogRange: _0x350816.timeRange,
      files: _0x5bd7db,
      privacy: {
        structuredLogsRedacted: true,
        backendLogRedactedDuringPackaging: true,
        projectFilesIncluded: false,
        assetFilesIncluded: false,
        promptsIncluded: false
      }
    });
    const _0x221b45 = new a217_0x15b360.ZipFile();
    _0x221b45.addBuffer(_0x384765, DIAGNOSTIC_METADATA_NAME);
    _0x221b45.addBuffer(Buffer.from(JSON.stringify(_0x35070f, null, 2) + "\n", "utf8"), DIAGNOSTIC_PACKAGE_MANIFEST_NAME);
    _0x221b45.addBuffer(_0x515df5, DIAGNOSTIC_ERROR_SUMMARY_NAME);
    if (_0x42d082) {
      _0x221b45.addBuffer(_0x42d082, AI_DIAGNOSTICS_REPORT_NAME);
    }
    _0x221b45.addBuffer(_0x5c2b54, DESKTOP_LOG_NAME);
    if (_0x104121.exists) {
      _0x221b45.addBuffer(_0x3fe1dd, ROTATED_DESKTOP_LOG_NAME);
    }
    _0x221b45.addBuffer(_0x78cd36, "server.log");
    _0x221b45.addBuffer(_0x784351, DIAGNOSTIC_README_NAME);
    try {
      await writeZip(_0x221b45, _0x16c2d1);
      _0x3ebc46({
        type: "diagnostics.package_created",
        level: "info",
        source: "main",
        message: "Diagnostics package created",
        context: {
          filename: _0x4e432f,
          outputDirectory: _0x32af0f ? "user-selected" : "downloads"
        }
      });
      return {
        ok: true,
        path: _0x16c2d1,
        filename: _0x4e432f
      };
    } catch (_0x140c22) {
      _0x3ebc46({
        type: "diagnostics.package_failed",
        level: "error",
        source: "main",
        message: "Diagnostics package failed",
        error: _0x140c22
      });
      throw _0x140c22;
    }
  }
  function _0x5b934f() {
    ensureDir(_0x4b6b0c);
    if (!existsSync(_0x34e34d)) {
      writeFileSync(_0x34e34d, "", "utf8");
    }
    if (!_0x344ed9) {
      _0x344ed9 = true;
      _0x3ebc46({
        type: "app.session_started",
        level: "info",
        source: "main",
        message: "Desktop application session started",
        context: {
          pid: process.pid,
          packaged: _0x4ff846?.isPackaged === true
        }
      });
      if (typeof _0x4ff846?.once === "function") {
        _0x4ff846.once("before-quit", () => {
          if (_0x5a7d99) {
            return;
          }
          _0x5a7d99 = true;
          _0x3ebc46({
            type: "app.session_ended",
            level: "info",
            source: "main",
            message: "Desktop application session ended"
          });
        });
      }
    }
  }
  return {
    launchSessionId: _0xc07686,
    logDir: _0x4b6b0c,
    diagnosticsDir: _0x250c8e,
    desktopLogPath: _0x34e34d,
    serverLogPath: _0x315aea,
    ensureInitialFiles: _0x5b934f,
    logEvent: _0x3ebc46,
    getSuggestedPackagePath: _0x5a1fb6,
    createPackage: _0x4a234d
  };
}