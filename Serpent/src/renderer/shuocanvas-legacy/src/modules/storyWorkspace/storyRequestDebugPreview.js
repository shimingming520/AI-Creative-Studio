import { maskDebugPayloadSecrets } from "../../utils/debugRequestMasking.js";
const STORY_REQUEST_CAPTURE_CODE = "STORY_REQUEST_DEBUG_CAPTURED";
const STORY_REQUEST_DEBUG_PREVIEW_ID = "storyRequestDebugPreview";
function cloneSerializableValue(_0x2992cd) {
  return JSON.parse(JSON.stringify(_0x2992cd));
}
function countCharacters(_0x22218c = "") {
  return [...String(_0x22218c || "")].length;
}
function parsePromptObject(_0x3ff494 = "") {
  try {
    const _0x2655cf = JSON.parse(String(_0x3ff494 || ""));
    if (_0x2655cf && typeof _0x2655cf === "object") {
      return _0x2655cf;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function formatPromptForPreview(_0x9ae2b4 = "") {
  const _0x373f4b = parsePromptObject(_0x9ae2b4);
  if (_0x373f4b) {
    return JSON.stringify(_0x373f4b, null, 2);
  } else {
    return String(_0x9ae2b4 || "");
  }
}
function getPromptSectionCharacters(_0x279d00) {
  if (!_0x279d00 || typeof _0x279d00 !== "object") {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x279d00).map(([_0x11d1c0, _0x25870d]) => [_0x11d1c0, countCharacters(JSON.stringify(_0x25870d))]));
}
export async function captureStoryRequestPayload(_0x41b71c) {
  if (typeof _0x41b71c !== "function") {
    throw new TypeError("调试请求缺少可执行的生成操作。");
  }
  let _0xf4af97 = null;
  const _0x328851 = async (_0xf4ff89 = {}) => {
    if (!_0xf4af97) {
      _0xf4af97 = cloneSerializableValue(_0xf4ff89);
    }
    const _0x373f74 = new Error("调试请求已在发送前截获。");
    _0x373f74.code = STORY_REQUEST_CAPTURE_CODE;
    throw _0x373f74;
  };
  try {
    await _0x41b71c(_0x328851);
  } catch (_0x2ea902) {
    if (_0xf4af97) {
      return _0xf4af97;
    }
    throw _0x2ea902;
  }
  if (_0xf4af97) {
    return _0xf4af97;
  }
  throw new Error("生成操作没有构造出可调试的 API 请求。");
}
export function buildStoryRequestDebugPreviewModel(_0x2fe62c = {}, {
  title = "剧本工作室请求调试",
  subtitle = ""
} = {}) {
  const _0x377393 = maskDebugPayloadSecrets(cloneSerializableValue(_0x2fe62c || {}));
  const _0x296be4 = String(_0x377393?.prompt || "");
  const _0x58e838 = String(_0x377393?.systemPrompt || "");
  const _0xce9c39 = parsePromptObject(_0x296be4);
  const _0x28088f = String(_0xce9c39?.task || "");
  const _0x474539 = Math.max(0, Math.trunc(Number(_0xce9c39?.batch?.index) || 0));
  const _0x1fbd7b = Math.max(0, Math.trunc(Number(_0xce9c39?.batch?.total) || 0));
  const _0x4233c3 = Array.isArray(_0xce9c39?.batch?.clipPlans) ? _0xce9c39.batch.clipPlans.length : 0;
  const _0x236903 = JSON.stringify(_0x377393, null, 2);
  return {
    title: title,
    subtitle: subtitle,
    task: _0x28088f,
    batchIndex: _0x474539,
    batchTotal: _0x1fbd7b,
    clipCount: _0x4233c3,
    model: String(_0x377393?.model || ""),
    provider: String(_0x377393?.provider || ""),
    structuredOutputName: String(_0x377393?.structuredOutput?.name || ""),
    metrics: {
      promptCharacters: countCharacters(_0x296be4),
      systemPromptCharacters: countCharacters(_0x58e838),
      requestCharacters: countCharacters(JSON.stringify(_0x377393))
    },
    promptSectionCharacters: getPromptSectionCharacters(_0xce9c39),
    tabs: [{
      id: "prompt",
      label: "用户提示词",
      content: formatPromptForPreview(_0x296be4)
    }, {
      id: "system",
      label: "系统提示词",
      content: _0x58e838
    }, {
      id: "request",
      label: "完整请求参数",
      content: _0x236903
    }, {
      id: "sections",
      label: "区块字符统计",
      content: JSON.stringify(Object.fromEntries(Object.entries(getPromptSectionCharacters(_0xce9c39)).sort((_0x4c7d8b, _0x579621) => _0x579621[1] - _0x4c7d8b[1])), null, 2)
    }]
  };
}
function createElement(_0x595f11, _0x9fa05, _0x382b44 = "", _0x16b0d5 = "") {
  const _0xbf7c02 = _0x595f11.createElement(_0x9fa05);
  if (_0x382b44) {
    _0xbf7c02.className = _0x382b44;
  }
  if (_0x16b0d5) {
    _0xbf7c02.textContent = _0x16b0d5;
  }
  return _0xbf7c02;
}
function formatTaskLabel(_0x14ce99) {
  if (_0x14ce99.task === "plan_story_episode_outlines") {
    return "分集大纲请求";
  }
  if (_0x14ce99.task === "write_story_episode_script") {
    return "分集正文请求";
  }
  if (_0x14ce99.task === "plan_story_asset_inventory") {
    return "素材清单请求";
  }
  if (_0x14ce99.task === "detail_story_asset_batch") {
    return "素材细化请求";
  }
  if (_0x14ce99.task.includes("story_asset") || _0x14ce99.task.includes("asset_inventory")) {
    return "素材设定请求";
  }
  if (_0x14ce99.task === "plan_story_episode_split_blueprint") {
    return "整集蓝图请求";
  }
  if (_0x14ce99.task === "expand_story_episode_split_batch") {
    const _0x2ae3ee = _0x14ce99.batchIndex ? "第 " + _0x14ce99.batchIndex + (_0x14ce99.batchTotal ? "/" + _0x14ce99.batchTotal : "") + " 批" : "分批展开";
    return "" + _0x2ae3ee + (_0x14ce99.clipCount ? " · " + _0x14ce99.clipCount + " 个计划" : "");
  }
  return _0x14ce99.task || "文本生成请求";
}
export function closeStoryRequestDebugPreview(_0x8c0e9 = globalThis.document) {
  const _0x51ba88 = _0x8c0e9?.getElementById?.(STORY_REQUEST_DEBUG_PREVIEW_ID);
  if (!_0x51ba88) {
    return false;
  }
  _0x51ba88._disposeStoryRequestDebugPreview?.();
  _0x51ba88.remove();
  return true;
}
export function openStoryRequestDebugPreview({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  payload = {},
  title = "剧本工作室请求调试",
  subtitle = ""
} = {}) {
  if (!documentObject?.body) {
    return null;
  }
  closeStoryRequestDebugPreview(documentObject);
  const _0x1d1a6b = buildStoryRequestDebugPreviewModel(payload, {
    title: title,
    subtitle: subtitle
  });
  const _0x4faf2c = createElement(documentObject, "div", "story-request-debug-overlay");
  _0x4faf2c.id = STORY_REQUEST_DEBUG_PREVIEW_ID;
  _0x4faf2c.setAttribute("role", "presentation");
  const _0x59d9fc = createElement(documentObject, "section", "story-request-debug-dialog");
  _0x59d9fc.setAttribute("role", "dialog");
  _0x59d9fc.setAttribute("aria-modal", "true");
  _0x59d9fc.setAttribute("aria-labelledby", "storyRequestDebugTitle");
  const _0x1f8071 = createElement(documentObject, "header", "story-request-debug-header");
  const _0x4182f3 = createElement(documentObject, "div", "story-request-debug-heading");
  const _0xad1db5 = createElement(documentObject, "div", "story-request-debug-eyebrow");
  _0xad1db5.append(createElement(documentObject, "span", "story-request-debug-unsent", "未发送"), createElement(documentObject, "span", "", formatTaskLabel(_0x1d1a6b)));
  const _0x48f39e = createElement(documentObject, "h2", "", _0x1d1a6b.title);
  _0x48f39e.id = "storyRequestDebugTitle";
  _0x4182f3.append(_0xad1db5, _0x48f39e);
  if (_0x1d1a6b.subtitle) {
    _0x4182f3.append(createElement(documentObject, "p", "", _0x1d1a6b.subtitle));
  }
  const _0x4e2a7e = createElement(documentObject, "button", "story-request-debug-close", "×");
  _0x4e2a7e.type = "button";
  _0x4e2a7e.setAttribute("aria-label", "关闭请求调试界面");
  _0x1f8071.append(_0x4182f3, _0x4e2a7e);
  const _0x4385b9 = createElement(documentObject, "div", "story-request-debug-summary");
  [["模型", _0x1d1a6b.model || "未选择"], ["Provider", _0x1d1a6b.provider || "未选择"], ["用户提示词", _0x1d1a6b.metrics.promptCharacters.toLocaleString() + " 字符"], ["系统提示词", _0x1d1a6b.metrics.systemPromptCharacters.toLocaleString() + " 字符"], ["完整请求", _0x1d1a6b.metrics.requestCharacters.toLocaleString() + " 字符"], ["结构化输出", _0x1d1a6b.structuredOutputName || "未启用"]].forEach(([_0x439eb0, _0x24d71f]) => {
    const _0x540182 = createElement(documentObject, "div", "story-request-debug-summary-item");
    _0x540182.append(createElement(documentObject, "span", "", _0x439eb0), createElement(documentObject, "strong", "", _0x24d71f));
    _0x4385b9.append(_0x540182);
  });
  const _0x395ea5 = createElement(documentObject, "div", "story-request-debug-tabs");
  _0x395ea5.setAttribute("role", "tablist");
  const _0x390648 = createElement(documentObject, "pre", "story-request-debug-code");
  _0x390648.setAttribute("tabindex", "0");
  let _0x42e72a = _0x1d1a6b.tabs[0]?.id || "prompt";
  const _0x40bf63 = () => {
    const _0x3f550c = _0x1d1a6b.tabs.find(_0x30e64a => _0x30e64a.id === _0x42e72a) || _0x1d1a6b.tabs[0];
    _0x390648.textContent = _0x3f550c?.content || "";
    _0x395ea5.querySelectorAll("[data-story-request-debug-tab]").forEach(_0x58d386 => {
      const _0x4d769e = _0x58d386.dataset.storyRequestDebugTab === _0x42e72a;
      _0x58d386.classList.toggle("is-active", _0x4d769e);
      _0x58d386.setAttribute("aria-selected", String(_0x4d769e));
      _0x58d386.tabIndex = _0x4d769e ? 0 : -1;
    });
  };
  _0x1d1a6b.tabs.forEach(_0x73c8b2 => {
    const _0x2acdd9 = createElement(documentObject, "button", "story-request-debug-tab", _0x73c8b2.label);
    _0x2acdd9.type = "button";
    _0x2acdd9.dataset.storyRequestDebugTab = _0x73c8b2.id;
    _0x2acdd9.setAttribute("role", "tab");
    _0x2acdd9.addEventListener("click", () => {
      _0x42e72a = _0x73c8b2.id;
      _0x40bf63();
    });
    _0x395ea5.append(_0x2acdd9);
  });
  const _0xd43774 = createElement(documentObject, "div", "story-request-debug-body");
  const _0x3fe22b = createElement(documentObject, "div", "story-request-debug-content-header");
  _0x3fe22b.append(_0x395ea5, createElement(documentObject, "span", "story-request-debug-safety", "只读预览 · 密钥已隐藏"));
  _0xd43774.append(_0x3fe22b, _0x390648);
  const _0x1a17f6 = createElement(documentObject, "footer", "story-request-debug-footer");
  const _0x3bdc2f = createElement(documentObject, "span", "story-request-debug-copy-status");
  const _0x4ec1a1 = createElement(documentObject, "button", "story-secondary-button", "复制当前内容");
  _0x4ec1a1.type = "button";
  _0x4ec1a1.addEventListener("click", async () => {
    try {
      const _0x3f34d5 = windowObject?.navigator?.clipboard?.writeText;
      if (typeof _0x3f34d5 !== "function") {
        throw new Error("clipboard unavailable");
      }
      await _0x3f34d5.call(windowObject.navigator.clipboard, _0x390648.textContent || "");
      _0x3bdc2f.textContent = "已复制";
    } catch {
      _0x3bdc2f.textContent = "复制失败，请手动选择文本";
    }
  });
  const _0x571c46 = createElement(documentObject, "button", "story-primary-button", "关闭");
  _0x571c46.type = "button";
  _0x1a17f6.append(_0x3bdc2f, _0x4ec1a1, _0x571c46);
  _0x59d9fc.append(_0x1f8071, _0x4385b9, _0xd43774, _0x1a17f6);
  _0x4faf2c.append(_0x59d9fc);
  const _0x3c8093 = () => closeStoryRequestDebugPreview(documentObject);
  const _0x5339b2 = _0xcf8a45 => {
    if (_0xcf8a45.key === "Escape") {
      _0x3c8093();
    }
  };
  _0x4e2a7e.addEventListener("click", _0x3c8093);
  _0x571c46.addEventListener("click", _0x3c8093);
  _0x4faf2c.addEventListener("click", _0x41cbac => {
    if (_0x41cbac.target === _0x4faf2c) {
      _0x3c8093();
    }
  });
  documentObject.addEventListener("keydown", _0x5339b2);
  _0x4faf2c._disposeStoryRequestDebugPreview = () => {
    documentObject.removeEventListener("keydown", _0x5339b2);
  };
  documentObject.body.append(_0x4faf2c);
  _0x40bf63();
  _0x4e2a7e.focus?.();
  return {
    overlay: _0x4faf2c,
    dialog: _0x59d9fc,
    model: _0x1d1a6b,
    close: _0x3c8093
  };
}