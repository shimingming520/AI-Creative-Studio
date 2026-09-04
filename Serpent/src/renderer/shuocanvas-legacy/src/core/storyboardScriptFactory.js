import { t } from "../i18n/index.js";
export const STORYBOARD_SCRIPT_NODE_TYPE = "storyboard-script";
export const STORYBOARD_SCRIPT_DEFAULT_NAME = "分镜脚本";
export const STORYBOARD_SCRIPT_DEFAULT_VIEW_MODE = "list";
export const STORYBOARD_SCRIPT_DEFAULT_MEDIA_MODE = "image";
export const STORYBOARD_SCRIPT_TEXT_PROVIDER = "volcengine";
export const STORYBOARD_SCRIPT_TEXT_MODEL = "volcengine/doubao-seed-2-1-turbo-260628";
export const STORYBOARD_SCRIPT_DEFAULT_SIZE = Object.freeze({
  width: 1024,
  height: 576
});
function storyboardScriptText(_0x4569a7, _0x12073e = {}) {
  return t("storyboardScript." + _0x4569a7, _0x12073e);
}
export function getStoryboardScriptDefaultName() {
  return storyboardScriptText("defaultName");
}
const STORYBOARD_SCRIPT_COLUMN_LABELS = Object.freeze(["镜号", "时长", "景别", "场景", "画面描述", "角色", "角色描述", "角色动作", "情绪", "角色图", "参考", "图片提示词", "视频提示词", "对白", "音效"]);
export const STORYBOARD_SCRIPT_COLUMNS = Object.freeze(STORYBOARD_SCRIPT_COLUMN_LABELS.map(_0x50a553 => Object.freeze({
  key: _0x50a553,
  label: _0x50a553
})));
export const STORYBOARD_SCRIPT_TABLE_EXPORT_MIME = "text/csv;charset=utf-8";
const STORYBOARD_SCRIPT_IMAGE_MODE_COLUMN_KEYS = new Set(["镜号", "时长", "景别", "场景", "画面描述", "角色描述", "角色动作", "情绪", "角色图", "参考", "图片提示词"]);
const STORYBOARD_SCRIPT_VIDEO_MODE_COLUMN_KEYS = new Set(["镜号", "时长", "景别", "场景", "画面描述", "角色描述", "角色动作", "情绪", "角色图", "参考", "视频提示词", "对白", "音效"]);
const STORYBOARD_SCRIPT_ALWAYS_VISIBLE_COLUMN_KEYS = new Set(["镜号"]);
const STORYBOARD_SCRIPT_VIEW_MODES = new Set(["list", "card"]);
const STORYBOARD_SCRIPT_MEDIA_MODES = new Set(["image", "video"]);
const STORYBOARD_SCRIPT_SCHEMA_VERSION = "storyboard-script.v1";
export function normalizeStoryboardScriptViewMode(_0x2e9e0b) {
  const _0x4536c0 = String(_0x2e9e0b || "").trim();
  if (STORYBOARD_SCRIPT_VIEW_MODES.has(_0x4536c0)) {
    return _0x4536c0;
  } else {
    return STORYBOARD_SCRIPT_DEFAULT_VIEW_MODE;
  }
}
export function normalizeStoryboardScriptMediaMode(_0x21025b) {
  const _0x597a15 = String(_0x21025b || "").trim();
  if (STORYBOARD_SCRIPT_MEDIA_MODES.has(_0x597a15)) {
    return _0x597a15;
  } else {
    return STORYBOARD_SCRIPT_DEFAULT_MEDIA_MODE;
  }
}
function getStoryboardScriptAllowedColumnKeys(_0x2d45eb) {
  if (normalizeStoryboardScriptMediaMode(_0x2d45eb) === "video") {
    return STORYBOARD_SCRIPT_VIDEO_MODE_COLUMN_KEYS;
  } else {
    return STORYBOARD_SCRIPT_IMAGE_MODE_COLUMN_KEYS;
  }
}
function hasStoryboardScriptColumnValue(_0x15e0f9, _0x957d59) {
  const _0x133047 = String(_0x957d59 || "");
  return (Array.isArray(_0x15e0f9) ? _0x15e0f9 : []).some(_0x3053b3 => {
    if (!_0x3053b3 || typeof _0x3053b3 !== "object" || Array.isArray(_0x3053b3)) {
      return false;
    }
    return formatTableCellValue(_0x3053b3[_0x133047]).trim().length > 0;
  });
}
export function getStoryboardScriptDisplayColumns({
  mediaMode = STORYBOARD_SCRIPT_DEFAULT_MEDIA_MODE,
  rows = []
} = {}) {
  const _0x43fe10 = getStoryboardScriptAllowedColumnKeys(mediaMode);
  const _0x3ffc5a = Array.isArray(rows) ? rows : normalizeStoryboardScriptRows(rows);
  return STORYBOARD_SCRIPT_COLUMNS.filter(_0x2a79c7 => {
    if (!_0x43fe10.has(_0x2a79c7.key)) {
      return false;
    }
    if (STORYBOARD_SCRIPT_ALWAYS_VISIBLE_COLUMN_KEYS.has(_0x2a79c7.key)) {
      return true;
    }
    return hasStoryboardScriptColumnValue(_0x3ffc5a, _0x2a79c7.key);
  });
}
export function normalizeStoryboardScriptSelectedRowIndexes(_0x274611, _0x45eda2 = 0) {
  if (!Array.isArray(_0x274611)) {
    return [];
  }
  const _0x131f22 = Number.isFinite(_0x45eda2) ? Math.max(0, Math.trunc(_0x45eda2)) : 0;
  const _0x3ac81b = new Set();
  const _0x3fe406 = [];
  _0x274611.forEach(_0x832672 => {
    const _0x16a7a6 = Number(_0x832672);
    if (!Number.isInteger(_0x16a7a6) || _0x16a7a6 < 0 || _0x16a7a6 >= _0x131f22) {
      return;
    }
    if (_0x3ac81b.has(_0x16a7a6)) {
      return;
    }
    _0x3ac81b.add(_0x16a7a6);
    _0x3fe406.push(_0x16a7a6);
  });
  return _0x3fe406;
}
function parseJsonRows(_0x24cd3f) {
  if (typeof _0x24cd3f !== "string") {
    return _0x24cd3f;
  }
  const _0x56a5b6 = _0x24cd3f.trim();
  if (!_0x56a5b6) {
    return [];
  }
  try {
    return JSON.parse(_0x56a5b6);
  } catch {
    return [];
  }
}
function parseJsonObject(_0x1911c9) {
  if (_0x1911c9 && typeof _0x1911c9 === "object" && !Array.isArray(_0x1911c9)) {
    return _0x1911c9;
  }
  if (typeof _0x1911c9 !== "string") {
    return null;
  }
  const _0xbbdc51 = _0x1911c9.trim();
  if (!_0xbbdc51) {
    return null;
  }
  try {
    const _0x4168f8 = JSON.parse(_0xbbdc51);
    if (_0x4168f8 && typeof _0x4168f8 === "object" && !Array.isArray(_0x4168f8)) {
      return _0x4168f8;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function pickRowsContainer(_0x27d635) {
  const _0x58cd9f = parseJsonRows(_0x27d635);
  if (Array.isArray(_0x58cd9f)) {
    return _0x58cd9f;
  }
  if (!_0x58cd9f || typeof _0x58cd9f !== "object") {
    return [];
  }
  if (Array.isArray(_0x58cd9f.rows)) {
    return _0x58cd9f.rows;
  }
  if (Array.isArray(_0x58cd9f.shots)) {
    return _0x58cd9f.shots;
  }
  if (Array.isArray(_0x58cd9f.scenes)) {
    return _0x58cd9f.scenes;
  }
  if (Array.isArray(_0x58cd9f.items)) {
    return _0x58cd9f.items;
  }
  return [];
}
function normalizeFiniteNumber(_0x27c280) {
  const _0x56833f = Number(_0x27c280);
  if (Number.isFinite(_0x56833f)) {
    return _0x56833f;
  } else {
    return null;
  }
}
function normalizePositiveDimension(_0x268ad3, _0x339f7b) {
  const _0x4dcf1 = Number(_0x268ad3);
  if (Number.isFinite(_0x4dcf1) && _0x4dcf1 > 0) {
    return _0x4dcf1;
  } else {
    return _0x339f7b;
  }
}
export function resolveStoryboardScriptResizeMinSize(_0x40c14a = {}) {
  return {
    width: normalizePositiveDimension(_0x40c14a?.resizeMinWidth, STORYBOARD_SCRIPT_DEFAULT_SIZE.width),
    height: normalizePositiveDimension(_0x40c14a?.resizeMinHeight, STORYBOARD_SCRIPT_DEFAULT_SIZE.height)
  };
}
function parseClockDurationSeconds(_0x514203) {
  const _0x3e8686 = String(_0x514203 || "").trim().split(":");
  if (_0x3e8686.length < 2 || _0x3e8686.length > 3) {
    return null;
  }
  const _0x234cbd = _0x3e8686.map(_0x37ccc8 => Number(_0x37ccc8));
  if (_0x234cbd.some(_0xd966cf => !Number.isFinite(_0xd966cf) || _0xd966cf < 0)) {
    return null;
  }
  if (_0x234cbd.length === 2) {
    return _0x234cbd[0] * 60 + _0x234cbd[1];
  }
  return _0x234cbd[0] * 3600 + _0x234cbd[1] * 60 + _0x234cbd[2];
}
function parseDurationSeconds(_0x562d05) {
  const _0x5f1cc9 = normalizeFiniteNumber(_0x562d05);
  if (_0x5f1cc9 != null) {
    return _0x5f1cc9;
  }
  const _0x271491 = String(_0x562d05 || "").trim();
  if (!_0x271491) {
    return null;
  }
  const _0x1db3b5 = parseClockDurationSeconds(_0x271491);
  if (_0x1db3b5 != null) {
    return _0x1db3b5;
  }
  const _0x34f041 = [..._0x271491.matchAll(/\d+(?:\.\d+)?/g)].map(_0x35765a => Number(_0x35765a[0]));
  if (_0x34f041.length === 0) {
    return null;
  }
  const _0x2f680a = /[-~～—–至到]/.test(_0x271491) && _0x34f041.length >= 2;
  if (_0x2f680a) {
    return (_0x34f041[0] + _0x34f041[1]) / 2;
  }
  return _0x34f041[0];
}
function getRowsTotalDurationSeconds(_0x210a2c) {
  const _0x462757 = _0x210a2c.reduce((_0x2942b1, _0x3aeebb) => {
    const _0x35bd10 = parseDurationSeconds(_0x3aeebb?.时长 ?? _0x3aeebb?.duration ?? _0x3aeebb?.durationText);
    if (_0x35bd10 == null) {
      return _0x2942b1;
    } else {
      return _0x2942b1 + _0x35bd10;
    }
  }, 0);
  if (_0x462757 > 0) {
    return Number(_0x462757.toFixed(3));
  } else {
    return null;
  }
}
export function normalizeStoryboardScriptRows(_0x36d02b) {
  return pickRowsContainer(_0x36d02b).filter(_0x17e470 => _0x17e470 && typeof _0x17e470 === "object" && !Array.isArray(_0x17e470)).map(_0xe6711f => {
    const _0x51f6ac = _0xe6711f.场景 ?? _0xe6711f.场景标签 ?? _0xe6711f.sceneTags ?? _0xe6711f.scene ?? _0xe6711f.location;
    if (_0x51f6ac == null) {
      return {
        ..._0xe6711f
      };
    } else {
      return {
        ..._0xe6711f,
        场景: _0x51f6ac
      };
    }
  });
}
function formatTableCellValue(_0x317bdf) {
  if (_0x317bdf == null) {
    return "";
  }
  if (typeof _0x317bdf === "string") {
    return _0x317bdf;
  }
  if (typeof _0x317bdf === "number" || typeof _0x317bdf === "boolean") {
    return String(_0x317bdf);
  }
  try {
    return JSON.stringify(_0x317bdf);
  } catch {
    return String(_0x317bdf);
  }
}
function escapeCsvCell(_0x5029ea) {
  const _0x399671 = formatTableCellValue(_0x5029ea).replace(/\r\n?/g, "\n");
  if (!/[",\n]/.test(_0x399671)) {
    return _0x399671;
  }
  return "\"" + _0x399671.replace(/"/g, "\"\"") + "\"";
}
export function serializeStoryboardScriptRowsToCsv(_0x41f58b, _0x5504a8 = STORYBOARD_SCRIPT_COLUMNS) {
  const _0x554f1c = normalizeStoryboardScriptRows(_0x41f58b);
  const _0xaf32b8 = Array.isArray(_0x5504a8) && _0x5504a8.length ? _0x5504a8 : STORYBOARD_SCRIPT_COLUMNS;
  const _0x1e7195 = _0xaf32b8.map(_0xdb010f => String(_0xdb010f?.key || ""));
  const _0x57efc7 = _0xaf32b8.map(_0x323300 => _0x323300?.label || _0x323300?.key || "");
  const _0x16f9da = [_0x57efc7.map(escapeCsvCell).join(","), ..._0x554f1c.map(_0xde7225 => _0x1e7195.map(_0x56f451 => escapeCsvCell(_0xde7225?.[_0x56f451])).join(","))];
  return "﻿" + _0x16f9da.join("\r\n") + "\r\n";
}
export function buildCanonicalStoryboardScriptJson(_0x45eba2 = {}) {
  const _0x20a140 = _0x45eba2 && typeof _0x45eba2 === "object" && !Array.isArray(_0x45eba2) ? _0x45eba2 : {
    rows: _0x45eba2
  };
  const _0x4e15dd = parseJsonObject(_0x20a140.rawJson);
  const _0x160a47 = Array.isArray(_0x20a140.rows) ? _0x20a140.rows : _0x4e15dd ? _0x4e15dd : _0x20a140;
  const _0x3a5c6d = normalizeStoryboardScriptRows(_0x160a47);
  const _0x2616ce = _0x20a140.detectedIntent && typeof _0x20a140.detectedIntent === "object" ? _0x20a140.detectedIntent : _0x4e15dd?.detectedIntent && typeof _0x4e15dd.detectedIntent === "object" ? _0x4e15dd.detectedIntent : {};
  const _0x350c80 = {
    ..._0x2616ce,
    shotCount: _0x3a5c6d.length
  };
  const _0x39bc14 = getRowsTotalDurationSeconds(_0x3a5c6d);
  if (_0x39bc14 != null) {
    _0x350c80.totalDurationSeconds = _0x39bc14;
  } else {
    const _0xa6eaa3 = normalizeFiniteNumber(_0x2616ce.totalDurationSeconds);
    if (_0xa6eaa3 != null) {
      _0x350c80.totalDurationSeconds = _0xa6eaa3;
    }
  }
  const _0x33004a = String(_0x20a140.title || _0x4e15dd?.title || "").trim() || getStoryboardScriptDefaultName();
  const _0x2b9489 = {
    schemaVersion: STORYBOARD_SCRIPT_SCHEMA_VERSION,
    title: _0x33004a,
    detectedIntent: _0x350c80,
    rows: _0x3a5c6d
  };
  const _0x59eb64 = Array.isArray(_0x20a140.warnings) ? _0x20a140.warnings : Array.isArray(_0x4e15dd?.warnings) ? _0x4e15dd.warnings : [];
  if (_0x59eb64.length > 0) {
    _0x2b9489.warnings = [..._0x59eb64];
  }
  return _0x2b9489;
}
export function serializeCanonicalStoryboardScriptJson(_0x1bd1a2 = {}) {
  return JSON.stringify(buildCanonicalStoryboardScriptJson(_0x1bd1a2), null, 2);
}
export function createDefaultStoryboardScriptState(_0xf40a7e = {}) {
  if (typeof _0xf40a7e === "string") {
    const _0x43e6e8 = normalizeStoryboardScriptRows(_0xf40a7e);
    const _0x693bd3 = serializeCanonicalStoryboardScriptJson({
      rawJson: _0xf40a7e,
      rows: _0x43e6e8
    });
    return {
      version: 1,
      viewMode: STORYBOARD_SCRIPT_DEFAULT_VIEW_MODE,
      mediaMode: STORYBOARD_SCRIPT_DEFAULT_MEDIA_MODE,
      rawJson: _0xf40a7e,
      canonicalJson: _0x693bd3,
      rows: _0x43e6e8,
      selectedRowIndexes: [],
      selectionMode: false
    };
  }
  const _0x45000c = _0xf40a7e && typeof _0xf40a7e === "object" ? _0xf40a7e : {};
  const _0x3203b4 = typeof _0x45000c.rawJson === "string" ? _0x45000c.rawJson : "";
  const _0x450cf8 = Array.isArray(_0x45000c.rows) ? _0x45000c.rows : _0x3203b4 ? _0x3203b4 : [];
  const _0x4bef5d = normalizeStoryboardScriptRows(_0x450cf8);
  const _0x3264f2 = buildCanonicalStoryboardScriptJson({
    ..._0x45000c,
    rawJson: _0x3203b4,
    rows: _0x4bef5d
  });
  return {
    ..._0x45000c,
    version: 1,
    viewMode: normalizeStoryboardScriptViewMode(_0x45000c.viewMode),
    mediaMode: normalizeStoryboardScriptMediaMode(_0x45000c.mediaMode),
    rawJson: _0x3203b4,
    canonicalJson: JSON.stringify(_0x3264f2, null, 2),
    rows: _0x4bef5d,
    title: _0x3264f2.title,
    detectedIntent: _0x3264f2.detectedIntent,
    selectedRowIndexes: normalizeStoryboardScriptSelectedRowIndexes(_0x45000c.selectedRowIndexes, _0x4bef5d.length),
    selectionMode: _0x45000c.selectionMode === true
  };
}
export function createStoryboardScriptNodeData({
  id: _0x522c71,
  x = 0,
  y = 0,
  width = STORYBOARD_SCRIPT_DEFAULT_SIZE.width,
  height = STORYBOARD_SCRIPT_DEFAULT_SIZE.height,
  name = getStoryboardScriptDefaultName(),
  storyboardScript = {}
} = {}) {
  const _0x1a19f8 = normalizePositiveDimension(width, STORYBOARD_SCRIPT_DEFAULT_SIZE.width);
  const _0x1dc28f = normalizePositiveDimension(height, STORYBOARD_SCRIPT_DEFAULT_SIZE.height);
  return {
    id: _0x522c71,
    type: STORYBOARD_SCRIPT_NODE_TYPE,
    x: x,
    y: y,
    width: _0x1a19f8,
    height: _0x1dc28f,
    resizeMinWidth: _0x1a19f8,
    resizeMinHeight: _0x1dc28f,
    name: name,
    storyboardScript: createDefaultStoryboardScriptState(storyboardScript)
  };
}