const TEXT_NODE_TRANSFER_PATTERNS = Object.freeze([/(?:放到|放进|放入|写入|保存到|添加到).{0,16}画布.{0,12}(?:文本|文字).{0,4}节点/iu, /(?:放到|放进|放入|写入|保存到|添加到).{0,12}(?:文本|文字).{0,4}节点/iu, /\b(?:put|place|save|write|add)\b.{0,40}\b(?:canvas|text node)\b/iu]);
const VERSION_NUMBER_MAP = Object.freeze({
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10
});
function parseVersionNumber(_0x4dfb6d = "") {
  const _0x2507e6 = String(_0x4dfb6d || "").trim();
  if (/^\d+$/.test(_0x2507e6)) {
    return Number(_0x2507e6);
  }
  return VERSION_NUMBER_MAP[_0x2507e6] || 0;
}
function getRequestedVersion(_0x2e9d7e = "") {
  const _0x28470a = String(_0x2e9d7e || "").match(/第\s*([一二三四五六七八九十\d]+)\s*版/iu);
  if (_0x28470a) {
    return parseVersionNumber(_0x28470a[1]);
  } else {
    return 0;
  }
}
function collectVersionBlocks(_0x31aba9 = "") {
  const _0x1be2c2 = String(_0x31aba9 || "").trim();
  if (!_0x1be2c2) {
    return [];
  }
  const _0x567f8b = _0x1be2c2.split(/\r?\n/);
  const _0x21aad5 = [];
  let _0x274afa = null;
  for (const _0x5d9aba of _0x567f8b) {
    const _0x288ee3 = _0x5d9aba.match(/^\s*(?:(?:修改|调整|优化|改写)后(?:的)?\s*)?(?:第\s*([一二三四五六七八九十\d]+)\s*版|([1-9]\d*)[.、])\s*[：:]?\s*(.*)$/u);
    if (_0x288ee3) {
      if (_0x274afa) {
        _0x21aad5.push(_0x274afa);
      }
      _0x274afa = {
        version: parseVersionNumber(_0x288ee3[1] || _0x288ee3[2]),
        lines: [_0x5d9aba.trim()]
      };
    } else if (_0x274afa) {
      _0x274afa.lines.push(_0x5d9aba);
    }
  }
  if (_0x274afa) {
    _0x21aad5.push(_0x274afa);
  }
  return _0x21aad5;
}
function extractVersionBlock(_0x233fb3 = "", _0x2888de = 0) {
  const _0x3e8aec = String(_0x233fb3 || "").trim();
  if (!_0x3e8aec || _0x2888de <= 0) {
    return _0x3e8aec;
  }
  const _0x10aa0c = collectVersionBlocks(_0x3e8aec).find(_0x1f9f2a => _0x1f9f2a.version === _0x2888de);
  if (_0x10aa0c) {
    return _0x10aa0c.lines.join("\n").trim();
  } else {
    return _0x3e8aec;
  }
}
function getAssistantText(_0x12e647 = {}) {
  return String(_0x12e647.content || _0x12e647.reply || _0x12e647.message || _0x12e647.question || "").trim();
}
function resolveSourceEntry(_0x3cb707 = [], _0x282e8e = 0) {
  if (_0x282e8e > 0) {
    for (let _0x71600c = _0x3cb707.length - 1; _0x71600c >= 0; _0x71600c -= 1) {
      const _0x2b1ca6 = _0x3cb707[_0x71600c];
      const _0x506892 = collectVersionBlocks(getAssistantText(_0x2b1ca6)).find(_0x1a465a => _0x1a465a.version === _0x282e8e);
      if (_0x506892) {
        return {
          entry: _0x2b1ca6,
          content: _0x506892.lines.join("\n").trim()
        };
      }
    }
  }
  const _0x598920 = _0x3cb707.at(-1) || null;
  return {
    entry: _0x598920,
    content: extractVersionBlock(getAssistantText(_0x598920), _0x282e8e)
  };
}
export function resolveAgentConversationCanvasTransfer({
  message = "",
  history = []
} = {}) {
  const _0x2395c9 = String(message || "").trim();
  if (!TEXT_NODE_TRANSFER_PATTERNS.some(_0x3df704 => _0x3df704.test(_0x2395c9))) {
    return null;
  }
  const _0xf0994a = (Array.isArray(history) ? history : []).filter(_0x442cc6 => String(_0x442cc6?.role || "") === "assistant" && String(_0x442cc6?.status || "chat") === "chat" && getAssistantText(_0x442cc6));
  const _0x30c192 = getRequestedVersion(_0x2395c9);
  const _0x3fa221 = resolveSourceEntry(_0xf0994a, _0x30c192);
  return {
    matched: true,
    nodeType: "ai-text",
    content: _0x3fa221.content,
    requestedVersion: _0x30c192,
    sourceItemId: String(_0x3fa221.entry?.itemId || "").trim(),
    sourceTurnId: String(_0x3fa221.entry?.turnId || "").trim()
  };
}