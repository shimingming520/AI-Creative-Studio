import { post as a168_0x545e91 } from "./requester.js";
export const STORY_DOCUMENT_EXTRACT_PATH = "/api/v2/story-workspace/document/extract";
export const STORY_DOCUMENT_MAX_FILE_BYTES = 20971520;
export const STORY_DOCUMENT_SUPPORTED_EXTENSIONS = Object.freeze(["txt", "docx", "pdf"]);
function getFileExtension(_0x205c06) {
  const _0x2207b9 = String(_0x205c06 || "").trim();
  const _0x5212c1 = _0x2207b9.lastIndexOf(".");
  if (_0x5212c1 >= 0) {
    return _0x2207b9.slice(_0x5212c1 + 1).toLowerCase();
  } else {
    return "";
  }
}
export function validateStoryDocumentFile(_0x4031c0) {
  if (!_0x4031c0) {
    return {
      ok: false,
      error: "请选择剧本文件。"
    };
  }
  const _0x1b0e67 = getFileExtension(_0x4031c0.name);
  if (_0x1b0e67 === "doc") {
    return {
      ok: false,
      error: "暂不支持旧版 DOC 文件，请先另存为 DOCX、PDF 或 TXT。"
    };
  }
  if (!STORY_DOCUMENT_SUPPORTED_EXTENSIONS.includes(_0x1b0e67)) {
    return {
      ok: false,
      error: "仅支持 TXT、DOCX 和文本型 PDF 文件。"
    };
  }
  const _0x80ec47 = Number(_0x4031c0.size || 0);
  if (_0x80ec47 <= 0) {
    return {
      ok: false,
      error: "剧本文件为空。"
    };
  }
  if (_0x80ec47 > STORY_DOCUMENT_MAX_FILE_BYTES) {
    return {
      ok: false,
      error: "剧本文件不能超过 20 MB。"
    };
  }
  return {
    ok: true,
    extension: _0x1b0e67
  };
}
export async function extractStoryDocumentText(_0x415eac, _0x5ecadc = {}) {
  const _0x667e43 = validateStoryDocumentFile(_0x415eac);
  if (!_0x667e43.ok) {
    throw new Error(_0x667e43.error);
  }
  const _0x4e92c0 = new FormData();
  _0x4e92c0.append("file", _0x415eac, String(_0x415eac.name || "script." + _0x667e43.extension));
  const _0x48a4e6 = await a168_0x545e91(STORY_DOCUMENT_EXTRACT_PATH, _0x4e92c0, {
    provider: "local",
    signal: _0x5ecadc.signal,
    timeout: Number(_0x5ecadc.timeout) || 90000
  });
  const _0x1261ae = typeof _0x48a4e6?.text === "string" ? _0x48a4e6.text : "";
  if (!_0x1261ae.trim()) {
    throw new Error("文档解析结果没有可用文本。");
  }
  return {
    ..._0x48a4e6,
    text: _0x1261ae,
    characterCount: Number.isFinite(_0x48a4e6?.characterCount) ? _0x48a4e6.characterCount : _0x1261ae.length,
    extension: String(_0x48a4e6?.extension || _0x667e43.extension),
    warnings: Array.isArray(_0x48a4e6?.warnings) ? _0x48a4e6.warnings : []
  };
}