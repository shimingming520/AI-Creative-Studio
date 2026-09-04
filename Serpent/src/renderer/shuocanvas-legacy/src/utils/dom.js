import { readNodeMediaMetricsDataset } from "../modules/nodeMediaMetrics.js";
const _staticInnerHtmlRegistry = new Map([["cpdProjectItemIcon16", "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--indigo-text)\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>"], ["iconTrash18", "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--red)\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2\"/></svg>"], ["iconFolderOpen18", "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2\"/><path d=\"M3 10h18l-2 8a2 2 0 0 1-2 1.5H5a2 2 0 0 1-2-1.5Z\"/></svg>"], ["iconSaveAs18", "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v3\"/><path d=\"M17 21v-8H7v8\"/><path d=\"M7 3v5h8\"/><path d=\"M18 14v6\"/><path d=\"M15 17h6\"/></svg>"], ["iconPackageExport18", "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8\"/><path d=\"M3 8l9 5 9-5\"/><path d=\"M12 13v7\"/><path d=\"M7 4h10l4 4H3z\"/><path d=\"M12 2v6\"/><path d=\"M9 5l3-3 3 3\"/></svg>"], ["iconPackageImport18", "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8\"/><path d=\"M3 8l9 5 9-5\"/><path d=\"M12 13v7\"/><path d=\"M7 4h10l4 4H3z\"/><path d=\"M12 2v6\"/><path d=\"M15 5l-3 3-3-3\"/></svg>"]]);
const _staticTemplateCache = new Map();
export function registerStaticInnerHTML(_0x3d8cdb, _0x3645e7) {
  if (typeof _0x3d8cdb !== "string" || !_0x3d8cdb) {
    throw new Error("templateId must be a non-empty string");
  }
  if (typeof _0x3645e7 !== "string") {
    throw new Error("html must be a string");
  }
  if (_staticInnerHtmlRegistry.has(_0x3d8cdb)) {
    throw new Error("Static HTML template already registered: " + _0x3d8cdb);
  }
  _staticInnerHtmlRegistry.set(_0x3d8cdb, _0x3645e7);
}
export function setStaticInnerHTML(_0x5e8b60, _0x4b71ff) {
  if (!_0x5e8b60) {
    return;
  }
  const _0x3bfb47 = _staticTemplateCache.get(_0x4b71ff);
  if (_0x3bfb47) {
    _0x5e8b60.replaceChildren(_0x3bfb47.content.cloneNode(true));
    return;
  }
  const _0x3c6d9c = _staticInnerHtmlRegistry.get(_0x4b71ff);
  if (!_0x3c6d9c) {
    throw new Error("Unknown static HTML template: " + _0x4b71ff);
  }
  if (typeof document === "undefined") {
    _0x5e8b60.innerHTML = _0x3c6d9c;
    return;
  }
  const _0x4f4187 = document.createElement("template");
  _0x4f4187.innerHTML = _0x3c6d9c;
  _staticTemplateCache.set(_0x4b71ff, _0x4f4187);
  _0x5e8b60.replaceChildren(_0x4f4187.content.cloneNode(true));
}
export function clearElement(_0x481b82) {
  if (!_0x481b82) {
    return;
  }
  _0x481b82.replaceChildren();
}
export function setText(_0x377011, _0xf45eb) {
  if (!_0x377011) {
    return;
  }
  _0x377011.textContent = _0xf45eb == null ? "" : String(_0xf45eb);
}
export function setTextWithLineBreaks(_0x5b63e1, _0x26ae55) {
  if (!_0x5b63e1) {
    return;
  }
  _0x5b63e1.replaceChildren();
  const _0x38f12c = _0x26ae55 == null ? "" : String(_0x26ae55);
  const _0x555d28 = _0x38f12c.split("\n");
  for (let _0x348dd7 = 0; _0x348dd7 < _0x555d28.length; _0x348dd7++) {
    if (_0x348dd7 > 0) {
      _0x5b63e1.appendChild(document.createElement("br"));
    }
    _0x5b63e1.appendChild(document.createTextNode(_0x555d28[_0x348dd7]));
  }
}
const _SVG_NS = "http://www.w3.org/2000/svg";
const _ALLOWED_SVG_TAGS = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);
const _ALLOWED_SVG_ATTRS = new Set(["viewBox", "width", "height", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset", "opacity", "transform", "d", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "points", "xmlns", "class", "aria-hidden", "focusable"]);
function _sanitizeSvgNode(_0x264878) {
  if (!_0x264878 || _0x264878.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  const _0x29b5b0 = String(_0x264878.tagName || "").toLowerCase();
  if (!_ALLOWED_SVG_TAGS.has(_0x29b5b0)) {
    return null;
  }
  const _0x69e0cc = document.createElementNS(_SVG_NS, _0x29b5b0);
  for (const _0x142387 of Array.from(_0x264878.attributes || [])) {
    const _0x2ecd0c = _0x142387.name;
    const _0x3dc4b7 = _0x142387.value;
    if (!_0x2ecd0c) {
      continue;
    }
    const _0xca8c6d = _0x2ecd0c.toLowerCase();
    if (_0xca8c6d.startsWith("on")) {
      continue;
    }
    if (_0xca8c6d === "href" || _0xca8c6d === "xlink:href") {
      continue;
    }
    if (!_ALLOWED_SVG_ATTRS.has(_0x2ecd0c)) {
      continue;
    }
    _0x69e0cc.setAttribute(_0x2ecd0c, _0x3dc4b7);
  }
  for (const _0x29c17e of Array.from(_0x264878.childNodes || [])) {
    if (_0x29c17e.nodeType === Node.ELEMENT_NODE) {
      const _0x4efcd7 = _sanitizeSvgNode(_0x29c17e);
      if (_0x4efcd7) {
        _0x69e0cc.appendChild(_0x4efcd7);
      }
    }
  }
  return _0x69e0cc;
}
export function createSafeSvg(_0x3e2553) {
  if (typeof _0x3e2553 !== "string") {
    return null;
  }
  const _0x399c22 = _0x3e2553.trim();
  if (!_0x399c22) {
    return null;
  }
  const _0x4751db = new DOMParser().parseFromString(_0x399c22, "image/svg+xml");
  if (_0x4751db.querySelector("parsererror")) {
    return null;
  }
  const _0x499168 = _0x4751db.documentElement;
  if (!_0x499168 || String(_0x499168.tagName || "").toLowerCase() !== "svg") {
    return null;
  }
  const _0x1c1a20 = _sanitizeSvgNode(_0x499168);
  if (!_0x1c1a20) {
    return null;
  }
  if (!_0x1c1a20.getAttribute("focusable")) {
    _0x1c1a20.setAttribute("focusable", "false");
  }
  if (!_0x1c1a20.getAttribute("aria-hidden")) {
    _0x1c1a20.setAttribute("aria-hidden", "true");
  }
  return _0x1c1a20;
}
const _DANGEROUS_HTML_TAGS = new Set(["script", "style", "iframe", "object", "embed", "template"]);
const _PROMPT_CONTAINER_TAGS = new Set(["div", "p"]);
const _RICH_TEXT_ALLOWED_TAGS = new Set(["h1", "h2", "h3", "p", "div", "br", "b", "strong", "i", "em", "ul", "ol", "li", "hr", "blockquote", "pre", "code", "table", "thead", "tbody", "tr", "th", "td"]);
function _escapeHtmlText(_0x179973) {
  return String(_0x179973 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function _escapeHtmlAttr(_0x925901) {
  return _escapeHtmlText(_0x925901).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function _stripHtmlTags(_0x2af7bf) {
  return String(_0x2af7bf ?? "").replace(/<\/?[^>]+>/g, "");
}
function _stripDangerousHtml(_0x1fe796) {
  let _0x3e9685 = String(_0x1fe796 ?? "");
  _DANGEROUS_HTML_TAGS.forEach(_0xcefd95 => {
    const _0x62e9f = new RegExp("<" + _0xcefd95 + "\\b[^>]*>[\\s\\S]*?<\\/" + _0xcefd95 + "\\s*>", "gi");
    const _0x12ce6d = new RegExp("<\\/?" + _0xcefd95 + "\\b[^>]*\\/?>", "gi");
    _0x3e9685 = _0x3e9685.replace(_0x62e9f, "");
    _0x3e9685 = _0x3e9685.replace(_0x12ce6d, "");
  });
  return _0x3e9685;
}
function _extractHtmlAttr(_0xac55a5, _0x214240) {
  const _0x173cf9 = String(_0xac55a5 ?? "");
  const _0x2d306e = String(_0x214240 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const _0x42d298 = new RegExp(_0x2d306e + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)')", "i");
  const _0x25df01 = _0x173cf9.match(_0x42d298);
  if (_0x25df01) {
    return _0x25df01[2] ?? _0x25df01[3] ?? "";
  }
  const _0x4482ec = new RegExp(_0x2d306e + "\\s*=\\s*([^\\s\"'>]+)", "i");
  const _0x585147 = _0x173cf9.match(_0x4482ec);
  if (_0x585147) {
    return _0x585147[1] ?? "";
  } else {
    return "";
  }
}
function _classAttrContains(_0x5d0332, _0x52514a) {
  const _0x138237 = _extractHtmlAttr(_0x5d0332, "class");
  return String(_0x138237 || "").split(/\s+/).filter(Boolean).includes(String(_0x52514a || ""));
}
function _replaceAllowedTagsWithTokens(_0x2b33fb, _0x468f66) {
  const _0x124179 = [];
  const _0x1f2420 = _0x1ea93c => {
    const _0x4b3349 = "__AIC_HTML_TOKEN_" + _0x124179.length + "__";
    _0x124179.push(String(_0x1ea93c ?? ""));
    return _0x4b3349;
  };
  let _0x544d7b = String(_0x2b33fb ?? "");
  const _0x58d670 = _0x5eb38a => {
    const _0x3ba599 = new RegExp("<" + _0x5eb38a + "\\b[^>]*>", "gi");
    const _0x11f412 = new RegExp("<\\/" + _0x5eb38a + "\\s*>", "gi");
    _0x544d7b = _0x544d7b.replace(_0x3ba599, () => _0x1f2420("<" + _0x5eb38a + ">"));
    _0x544d7b = _0x544d7b.replace(_0x11f412, () => _0x1f2420("</" + _0x5eb38a + ">"));
  };
  _0x468f66.forEach(_0x2a2596 => {
    if (_0x2a2596 === "br" || _0x2a2596 === "hr") {
      const _0x19cf24 = new RegExp("<" + _0x2a2596 + "\\b[^>]*\\/?>", "gi");
      _0x544d7b = _0x544d7b.replace(_0x19cf24, () => _0x1f2420("<" + _0x2a2596 + ">"));
      return;
    }
    _0x58d670(_0x2a2596);
  });
  return {
    output: _0x544d7b,
    restore() {
      return _0x544d7b.replace(/__AIC_HTML_TOKEN_(\d+)__/g, (_0x479c75, _0xa6f81) => {
        const _0x249aa1 = _0x124179[Number(_0xa6f81)];
        if (typeof _0x249aa1 === "string") {
          return _0x249aa1;
        } else {
          return "";
        }
      });
    },
    pushToken: _0x1f2420,
    setOutput(_0x365930) {
      _0x544d7b = String(_0x365930 ?? "");
    }
  };
}
function _sanitizePromptHtmlWithoutDom(_0xe9aec5) {
  const _0x2868fd = String(_0xe9aec5 ?? "").replace(/<button\b[^>]*\bdata-story-voice-toggle(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>[\s\S]*?<\/button>/gi, "").replace(/<span\b[^>]*\bdata-story-voice-separator(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>[\s\S]*?<\/span>/gi, "");
  const _0xa47e5a = _replaceAllowedTagsWithTokens(_stripDangerousHtml(_0x2868fd), _PROMPT_CONTAINER_TAGS);
  let _0x29423d = _0xa47e5a.output.replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (_0x4daaec, _0x1e8c31, _0x5ba472) => {
    if (!_classAttrContains(_0x1e8c31, "ref-pill")) {
      return _0x5ba472;
    }
    const _0xac9233 = _extractHtmlAttr(_0x1e8c31, "data-label") || _stripHtmlTags(_0x5ba472);
    const _0x517cf8 = _stripHtmlTags(_0xac9233).replace(/[×✕✖]/g, "").trim();
    const _0x1a064a = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-node-id") || _extractHtmlAttr(_0x1e8c31, "data-nodeId")).trim();
    const _0x416a6f = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-ref-origin")).trim();
    const _0x15f8d6 = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-ref-label")).trim();
    const _0x27893d = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-asset-id")).trim();
    const _0x4ccbad = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-asset-index")).trim();
    const _0x3e87ef = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-ref-type")).trim();
    const _0x5e86c3 = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-ref-unresolved")).trim();
    const _0x25bd01 = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-prompt-pill-kind")).trim();
    const _0x376a38 = _stripHtmlTags(_extractHtmlAttr(_0x1e8c31, "data-story-voice-enabled")).trim();
    const _0x2eda61 = ["class=\"ref-pill\"", "contenteditable=\"false\""];
    if (_0x517cf8) {
      _0x2eda61.push("data-label=\"" + _escapeHtmlAttr(_0x517cf8) + "\"");
    }
    if (_0x1a064a) {
      _0x2eda61.push("data-node-id=\"" + _escapeHtmlAttr(_0x1a064a) + "\"");
    }
    if (_0x416a6f === "asset") {
      _0x2eda61.push("data-ref-origin=\"asset\"");
    }
    if (_0x15f8d6) {
      _0x2eda61.push("data-ref-label=\"" + _escapeHtmlAttr(_0x15f8d6) + "\"");
    }
    if (_0x27893d) {
      _0x2eda61.push("data-asset-id=\"" + _escapeHtmlAttr(_0x27893d) + "\"");
    }
    if (_0x4ccbad) {
      _0x2eda61.push("data-asset-index=\"" + _escapeHtmlAttr(_0x4ccbad) + "\"");
    }
    if (_0x3e87ef) {
      _0x2eda61.push("data-ref-type=\"" + _escapeHtmlAttr(_0x3e87ef) + "\"");
    }
    if (_0x5e86c3 === "true") {
      _0x2eda61.push("data-ref-unresolved=\"true\"");
    }
    if (_0x25bd01 === "time") {
      _0x2eda61.push("data-prompt-pill-kind=\"time\"");
    }
    if (_0x376a38 === "true") {
      _0x2eda61.push("data-story-voice-enabled=\"true\"");
    }
    return _0xa47e5a.pushToken("<span " + _0x2eda61.join(" ") + ">" + _escapeHtmlText(_0x517cf8) + "</span>");
  }).replace(/<br\b[^>]*\/?>/gi, () => _0xa47e5a.pushToken("<br>"));
  _0xa47e5a.setOutput(_0x29423d.replace(/<\/?[^>]+>/g, ""));
  return _0xa47e5a.restore();
}
function _sanitizeRichTextHtmlWithoutDom(_0x3e0c64) {
  const _0x2974ec = _replaceAllowedTagsWithTokens(_stripDangerousHtml(_0x3e0c64), _RICH_TEXT_ALLOWED_TAGS);
  _0x2974ec.setOutput(_0x2974ec.output.replace(/<\/?[^>]+>/g, ""));
  return _0x2974ec.restore();
}
function _appendSanitizedPromptNode(_0x566817, _0x43a557) {
  const _0x258db0 = Number(_0x43a557?.nodeType);
  if (_0x258db0 === 3) {
    _0x566817.appendChild(document.createTextNode(String(_0x43a557?.textContent || "")));
    return;
  }
  if (_0x258db0 !== 1) {
    return;
  }
  const _0x50c8b6 = String(_0x43a557?.tagName || "").toLowerCase();
  if (_DANGEROUS_HTML_TAGS.has(_0x50c8b6)) {
    return;
  }
  if (_0x50c8b6 === "br") {
    _0x566817.appendChild(document.createElement("br"));
    return;
  }
  if (_0x50c8b6 === "span" && _0x43a557.classList?.contains("ref-pill")) {
    const _0x4ae5ea = String(_0x43a557.getAttribute?.("data-label") || _0x43a557.dataset?.label || _0x43a557.textContent || "").replace(/[×✕✖]/g, "").trim();
    const _0x2445e0 = String(_0x43a557.getAttribute?.("data-node-id") || _0x43a557.dataset?.nodeId || "").trim();
    const _0x2288a0 = String(_0x43a557.getAttribute?.("data-ref-origin") || _0x43a557.dataset?.refOrigin || "").trim();
    const _0x5f13a6 = String(_0x43a557.getAttribute?.("data-ref-label") || _0x43a557.dataset?.refLabel || "").trim();
    const _0x1d55eb = String(_0x43a557.getAttribute?.("data-asset-id") || _0x43a557.dataset?.assetId || "").trim();
    const _0x1f5427 = String(_0x43a557.getAttribute?.("data-asset-index") || _0x43a557.dataset?.assetIndex || "").trim();
    const _0x42d75b = String(_0x43a557.getAttribute?.("data-ref-type") || _0x43a557.dataset?.refType || "").trim();
    const _0x46fb10 = String(_0x43a557.getAttribute?.("data-ref-unresolved") || _0x43a557.dataset?.refUnresolved || "").trim();
    const _0x537c75 = String(_0x43a557.getAttribute?.("data-prompt-pill-kind") || _0x43a557.dataset?.promptPillKind || "").trim();
    const _0x33c02f = String(_0x43a557.getAttribute?.("data-story-voice-enabled") || _0x43a557.dataset?.storyVoiceEnabled || "").trim();
    const _0x5daca6 = document.createElement("span");
    _0x5daca6.className = "ref-pill";
    _0x5daca6.setAttribute("contenteditable", "false");
    if (_0x4ae5ea) {
      _0x5daca6.setAttribute("data-label", _0x4ae5ea);
    }
    if (_0x2445e0) {
      _0x5daca6.setAttribute("data-node-id", _0x2445e0);
    }
    if (_0x2288a0 === "asset") {
      _0x5daca6.setAttribute("data-ref-origin", "asset");
    }
    if (_0x5f13a6) {
      _0x5daca6.setAttribute("data-ref-label", _0x5f13a6);
    }
    if (_0x1d55eb) {
      _0x5daca6.setAttribute("data-asset-id", _0x1d55eb);
    }
    if (_0x1f5427) {
      _0x5daca6.setAttribute("data-asset-index", _0x1f5427);
    }
    if (_0x42d75b) {
      _0x5daca6.setAttribute("data-ref-type", _0x42d75b);
    }
    if (_0x46fb10 === "true") {
      _0x5daca6.setAttribute("data-ref-unresolved", "true");
    }
    if (_0x537c75 === "time") {
      _0x5daca6.setAttribute("data-prompt-pill-kind", "time");
    }
    if (_0x33c02f === "true") {
      _0x5daca6.setAttribute("data-story-voice-enabled", "true");
    }
    _0x5daca6.textContent = _0x4ae5ea;
    _0x566817.appendChild(_0x5daca6);
    return;
  }
  if (_PROMPT_CONTAINER_TAGS.has(_0x50c8b6)) {
    const _0x466046 = document.createElement(_0x50c8b6);
    Array.from(_0x43a557.childNodes || []).forEach(_0x3cff1f => _appendSanitizedPromptNode(_0x466046, _0x3cff1f));
    _0x566817.appendChild(_0x466046);
    return;
  }
  Array.from(_0x43a557.childNodes || []).forEach(_0x2edb50 => _appendSanitizedPromptNode(_0x566817, _0x2edb50));
}
function _appendSanitizedRichTextNode(_0x11855b, _0x3ff69f) {
  const _0x279462 = Number(_0x3ff69f?.nodeType);
  if (_0x279462 === 3) {
    _0x11855b.appendChild(document.createTextNode(String(_0x3ff69f?.textContent || "")));
    return;
  }
  if (_0x279462 !== 1) {
    return;
  }
  const _0x92d07c = String(_0x3ff69f?.tagName || "").toLowerCase();
  if (_DANGEROUS_HTML_TAGS.has(_0x92d07c)) {
    return;
  }
  if (!_RICH_TEXT_ALLOWED_TAGS.has(_0x92d07c)) {
    Array.from(_0x3ff69f.childNodes || []).forEach(_0x1fb782 => _appendSanitizedRichTextNode(_0x11855b, _0x1fb782));
    return;
  }
  const _0x4c314d = document.createElement(_0x92d07c);
  if (_0x92d07c !== "br" && _0x92d07c !== "hr") {
    Array.from(_0x3ff69f.childNodes || []).forEach(_0x4e45f9 => _appendSanitizedRichTextNode(_0x4c314d, _0x4e45f9));
  }
  _0x11855b.appendChild(_0x4c314d);
}
function _sanitizeHtmlWithDom(_0xb0d22b, _0x58d4e4) {
  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    throw new Error("Document API is unavailable");
  }
  const _0x4ec543 = document.createElement("template");
  const _0x3eec54 = document.createElement("div");
  _0x4ec543.innerHTML = String(_0xb0d22b ?? "");
  const _0x40d06c = Array.from(_0x4ec543.content?.childNodes || _0x4ec543.childNodes || []);
  _0x40d06c.forEach(_0xa0b59c => {
    if (_0x58d4e4 === "prompt") {
      _appendSanitizedPromptNode(_0x3eec54, _0xa0b59c);
      return;
    }
    _appendSanitizedRichTextNode(_0x3eec54, _0xa0b59c);
  });
  return _0x3eec54.innerHTML || "";
}
export function sanitizePromptHtml(_0x485f28) {
  const _0x479387 = typeof _0x485f28 === "string" ? _0x485f28 : "";
  if (!_0x479387.trim()) {
    return "";
  }
  try {
    return _sanitizeHtmlWithDom(_0x479387, "prompt");
  } catch {
    return _sanitizePromptHtmlWithoutDom(_0x479387);
  }
}
export function sanitizeRichTextHtml(_0xe3b7e5) {
  const _0x332230 = typeof _0xe3b7e5 === "string" ? _0xe3b7e5 : "";
  if (!_0x332230.trim()) {
    return "";
  }
  try {
    return _sanitizeHtmlWithDom(_0x332230, "richText");
  } catch {
    return _sanitizeRichTextHtmlWithoutDom(_0x332230);
  }
}
export function createElement(_0x218e78, _0x527b81 = {}, _0x32c53f = null) {
  const _0x59593b = document.createElement(_0x218e78);
  Object.entries(_0x527b81).forEach(([_0x3287dd, _0x3ff9d8]) => {
    if (_0x3287dd === "className") {
      _0x59593b.className = _0x3ff9d8;
    } else if (_0x3287dd === "dataset") {
      Object.entries(_0x3ff9d8).forEach(([_0x5e9821, _0x5f31de]) => {
        _0x59593b.dataset[_0x5e9821] = _0x5f31de;
      });
    } else if (_0x3287dd.startsWith("on") && typeof _0x3ff9d8 === "function") {
      _0x59593b.addEventListener(_0x3287dd.slice(2).toLowerCase(), _0x3ff9d8);
    } else {
      _0x59593b.setAttribute(_0x3287dd, _0x3ff9d8);
    }
  });
  if (_0x32c53f) {
    if (typeof _0x32c53f === "string") {
      _0x59593b.textContent = _0x32c53f;
    } else if (_0x32c53f instanceof Node) {
      _0x59593b.appendChild(_0x32c53f);
    } else if (Array.isArray(_0x32c53f)) {
      _0x59593b.append(..._0x32c53f.filter(Boolean));
    }
  }
  return _0x59593b;
}
export function closest(_0x419816, _0x318bbb) {
  if (!_0x419816) {
    return null;
  }
  if (_0x419816.matches && _0x419816.matches(_0x318bbb)) {
    return _0x419816;
  }
  if (_0x419816.closest) {
    return _0x419816.closest(_0x318bbb);
  } else {
    return null;
  }
}
export function addEvents(_0xb5899e, _0x3cfe7a, _0x5f0c64 = false) {
  Object.entries(_0x3cfe7a).forEach(([_0x59cbc1, _0x19a5ab]) => {
    _0xb5899e.addEventListener(_0x59cbc1, _0x19a5ab, _0x5f0c64);
  });
}
export function removeEvents(_0x47389c, _0x32d3dc, _0x2ae0aa = false) {
  Object.entries(_0x32d3dc).forEach(([_0xfe6a62, _0x34b277]) => {
    _0x47389c.removeEventListener(_0xfe6a62, _0x34b277, _0x2ae0aa);
  });
}
export function raf(_0x40a83b) {
  return requestAnimationFrame(_0x40a83b);
}
export function nextFrame(_0x2431e0) {
  return new Promise(_0x538a37 => {
    requestAnimationFrame(() => {
      _0x2431e0();
      _0x538a37();
    });
  });
}
export function debounce(_0x562661, _0x2a8f6c = 300) {
  let _0xf01fc8 = null;
  return function (..._0x3006a4) {
    clearTimeout(_0xf01fc8);
    _0xf01fc8 = setTimeout(() => _0x562661.apply(this, _0x3006a4), _0x2a8f6c);
  };
}
export function throttle(_0x378c5c, _0x41b31c = 100) {
  let _0x4279ba = false;
  return function (..._0x486fa0) {
    if (!_0x4279ba) {
      _0x378c5c.apply(this, _0x486fa0);
      _0x4279ba = true;
      setTimeout(() => _0x4279ba = false, _0x41b31c);
    }
  };
}
export function rafSampleLatest(_0x413d51) {
  let _0x1b33de = null;
  let _0x63f594 = null;
  let _0x68b6c7 = null;
  function _0x506dff(..._0x112504) {
    _0x63f594 = _0x112504;
    _0x68b6c7 = this;
    if (_0x1b33de !== null) {
      return;
    }
    _0x1b33de = requestAnimationFrame(() => {
      _0x1b33de = null;
      const _0x506345 = _0x63f594;
      const _0x23bbfe = _0x68b6c7;
      _0x63f594 = null;
      _0x68b6c7 = null;
      if (!_0x506345) {
        return;
      }
      _0x413d51.apply(_0x23bbfe, _0x506345);
    });
  }
  _0x506dff.cancel = () => {
    if (_0x1b33de !== null) {
      cancelAnimationFrame(_0x1b33de);
    }
    _0x1b33de = null;
    _0x63f594 = null;
    _0x68b6c7 = null;
  };
  return _0x506dff;
}
export function waitForElement(_0xc3ce56, _0x244767 = 5000) {
  return new Promise((_0x2574f4, _0x58ec7e) => {
    const _0x51cd8f = document.querySelector(_0xc3ce56);
    if (_0x51cd8f) {
      _0x2574f4(_0x51cd8f);
      return;
    }
    const _0x2adbc9 = new MutationObserver(() => {
      const _0x1ff429 = document.querySelector(_0xc3ce56);
      if (_0x1ff429) {
        _0x2adbc9.disconnect();
        clearTimeout(_0x6953ad);
        _0x2574f4(_0x1ff429);
      }
    });
    _0x2adbc9.observe(document.body, {
      childList: true,
      subtree: true
    });
    const _0x6953ad = setTimeout(() => {
      _0x2adbc9.disconnect();
      _0x58ec7e(new Error("Element " + _0xc3ce56 + " not found within " + _0x244767 + "ms"));
    }, _0x244767);
  });
}
export function safeRemove(_0xe1c385) {
  if (_0xe1c385 && _0xe1c385.parentNode) {
    _0xe1c385.parentNode.removeChild(_0xe1c385);
  }
}
export function getViewportRect(_0x242a0e) {
  const _0x1b7aef = _0x242a0e.getBoundingClientRect();
  return {
    top: _0x1b7aef.top,
    left: _0x1b7aef.left,
    bottom: _0x1b7aef.bottom,
    right: _0x1b7aef.right,
    width: _0x1b7aef.width,
    height: _0x1b7aef.height
  };
}
export function isInViewport(_0xc637f8, _0x188055 = 0) {
  const _0x2f8148 = _0xc637f8.getBoundingClientRect();
  return _0x2f8148.top >= -_0x188055 && _0x2f8148.left >= -_0x188055 && _0x2f8148.bottom <= window.innerHeight + _0x188055 && _0x2f8148.right <= window.innerWidth + _0x188055;
}
export function getDisplayedMediaSizeFromNode(_0x2d57aa, _0x1da481) {
  const _0x111a1f = String(_0x2d57aa || "").trim();
  if (!_0x111a1f) {
    return {
      w: 0,
      h: 0
    };
  }
  const _0x14744e = document.getElementById(_0x111a1f);
  if (!_0x14744e) {
    return {
      w: 0,
      h: 0
    };
  }
  const _0x4fe155 = readNodeMediaMetricsDataset(_0x14744e, _0x1da481);
  if (_0x4fe155) {
    return {
      w: _0x4fe155.w,
      h: _0x4fe155.h
    };
  }
  const _0x3bceda = _0x14744e.querySelector(".img-node-preview") || _0x14744e;
  const _0x52328e = String(_0x1da481 || "");
  const _0x3d9ed7 = _0x52328e === "video" ? "video" : "img";
  const _0x31dba9 = Array.from(_0x3bceda.querySelectorAll(_0x3d9ed7));
  let _0x497233 = 0;
  let _0xd8d0fb = 0;
  let _0x40d418 = -1000000000;
  for (const _0x1197bc of _0x31dba9) {
    const _0x373cc2 = window.getComputedStyle(_0x1197bc);
    if (!_0x373cc2) {
      continue;
    }
    if (_0x373cc2.display === "none") {
      continue;
    }
    if (_0x373cc2.visibility === "hidden") {
      continue;
    }
    if (Number(_0x373cc2.opacity || "1") <= 0.05) {
      continue;
    }
    if (_0x373cc2.pointerEvents === "none") {
      continue;
    }
    const _0x43447a = _0x52328e === "video" ? _0x1197bc.videoWidth || 0 : _0x1197bc.naturalWidth || 0;
    const _0x4b1306 = _0x52328e === "video" ? _0x1197bc.videoHeight || 0 : _0x1197bc.naturalHeight || 0;
    if (!_0x43447a || !_0x4b1306) {
      continue;
    }
    const _0x1e1d99 = Number(_0x373cc2.zIndex);
    const _0x50626f = Number.isFinite(_0x1e1d99) ? _0x1e1d99 : 0;
    if (_0x50626f >= _0x40d418) {
      _0x40d418 = _0x50626f;
      _0x497233 = _0x43447a;
      _0xd8d0fb = _0x4b1306;
    }
  }
  return {
    w: _0x497233,
    h: _0xd8d0fb
  };
}
export function getDisplayedVideoMetaFromNode(_0x23a96d) {
  const _0x28860b = String(_0x23a96d || "").trim();
  if (!_0x28860b) {
    return {
      src: "",
      w: 0,
      h: 0
    };
  }
  const _0x34bff8 = document.getElementById(_0x28860b);
  if (!_0x34bff8) {
    return {
      src: "",
      w: 0,
      h: 0
    };
  }
  const _0x1acd96 = readNodeMediaMetricsDataset(_0x34bff8, "video");
  if (_0x1acd96?.src) {
    return {
      src: _0x1acd96.src,
      w: _0x1acd96.w,
      h: _0x1acd96.h
    };
  }
  const _0x424bfc = _0x34bff8.querySelector(".img-node-preview") || _0x34bff8;
  const _0x4a98ac = Array.from(_0x424bfc.querySelectorAll("video"));
  let _0x1237dc = "";
  let _0x2f2a93 = 0;
  let _0x1fdec4 = 0;
  let _0x16a926 = -1000000000;
  for (const _0x3641dc of _0x4a98ac) {
    const _0x53d650 = window.getComputedStyle(_0x3641dc);
    if (!_0x53d650) {
      continue;
    }
    if (_0x53d650.display === "none") {
      continue;
    }
    if (_0x53d650.visibility === "hidden") {
      continue;
    }
    if (Number(_0x53d650.opacity || "1") <= 0.05) {
      continue;
    }
    if (_0x53d650.pointerEvents === "none") {
      continue;
    }
    const _0xf3a0e7 = String(_0x3641dc.currentSrc || _0x3641dc.src || "").trim();
    if (!_0xf3a0e7) {
      continue;
    }
    const _0x19a1c7 = Number(_0x3641dc.videoWidth || 0);
    const _0x36a265 = Number(_0x3641dc.videoHeight || 0);
    const _0x4a2c1c = Number(_0x53d650.zIndex);
    const _0x1edaf4 = Number.isFinite(_0x4a2c1c) ? _0x4a2c1c : 0;
    if (_0x1edaf4 >= _0x16a926) {
      _0x16a926 = _0x1edaf4;
      _0x1237dc = _0xf3a0e7;
      _0x2f2a93 = Number.isFinite(_0x19a1c7) ? _0x19a1c7 : 0;
      _0x1fdec4 = Number.isFinite(_0x36a265) ? _0x36a265 : 0;
    }
  }
  return {
    src: _0x1237dc,
    w: _0x2f2a93,
    h: _0x1fdec4
  };
}