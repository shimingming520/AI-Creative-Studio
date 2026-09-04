import { showError, showWarning } from "../../services/index.js";
import { markSystemClipboardWrite } from "../../modules/clipboard.js";
import a455_0xe6231 from "../../core/stores/appStore.js";
import { registerStaticInnerHTML, sanitizeRichTextHtml } from "../../utils/dom.js";
import { TEXT_TOOLBAR_HTML } from "./textToolbarHtml.js";
import { bindStoryboardScriptToolbarAction } from "./storyboardScriptAction.js";
import { bindNodeToolbarFullscreenOverlay, closeExistingNodeToolbarFullscreen } from "./fullscreenOverlayToggle.js";
import { t } from "../../i18n/index.js";
export { TEXT_TOOLBAR_HTML };
registerStaticInnerHTML("toolbar:text", TEXT_TOOLBAR_HTML);
const TEXT_FULLSCREEN_OVERLAY_SELECTOR = "[data-node-toolbar-text-fullscreen-overlay='true']";
function textToolbarText(_0x1f4ecd) {
  return t("nodeToolbar.text." + _0x1f4ecd);
}
export function bindTextToolbarEvents(_0x2ccb16, _0x1d1a95, _0x4dc7f9) {
  if (!_0x2ccb16) {
    return;
  }
  _0x2ccb16.addEventListener("pointerdown", _0xf98b68 => _0xf98b68.stopPropagation());
  _0x2ccb16.addEventListener("dblclick", _0x47d4d8 => {
    _0x47d4d8.preventDefault();
    _0x47d4d8.stopPropagation();
  });
  const _0xb8cce9 = (..._0x528f8e) => {
    for (const _0x530eaf of _0x528f8e) {
      if (typeof _0x530eaf === "string") {
        return _0x530eaf;
      }
    }
    return "";
  };
  const _0x301341 = () => {
    const _0x8b02a6 = typeof _0x1d1a95?.id === "string" ? _0x1d1a95.id : "";
    if (!_0x8b02a6) {
      return _0x1d1a95 || {};
    }
    const _0x4098e4 = typeof a455_0xe6231.getStateRaw === "function" ? a455_0xe6231.getStateRaw() : a455_0xe6231.getState();
    return _0x4098e4?.nodes?.[_0x8b02a6] || _0x1d1a95 || {};
  };
  const _0x29a785 = _0x485957 => String(_0x485957 ?? "").replace(/\r\n?/g, "\n");
  const _0x5b25cc = _0x3e4c8c => _0x29a785(_0x3e4c8c).replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "");
  const _0x3d879b = _0xfe1a5 => {
    const _0x3abdce = _0x5b25cc(_0xfe1a5);
    return _0x3abdce.split("\n").filter(_0xc781c0 => _0xc781c0.trim() !== "").join("\n");
  };
  const _0x14b976 = _0x46d209 => {
    const _0x62a4d = sanitizeRichTextHtml(typeof _0x46d209 === "string" ? _0x46d209 : "");
    if (!_0x62a4d.trim()) {
      return "";
    }
    const _0x287706 = document.createElement("div");
    _0x287706.innerHTML = _0x62a4d;
    const _0x28b9e8 = _0x2f0ef5 => _0x2f0ef5?.nodeType === Node.ELEMENT_NODE && String(_0x2f0ef5.tagName || "").toLowerCase() === "br";
    const _0x108479 = _0x55356d => {
      const _0x1c3c21 = String(_0x55356d?.tagName || "").toLowerCase();
      const _0xda08cd = _0x1c3c21 === "hr" || !!_0x55356d.querySelector?.("img, video, audio, canvas, svg, iframe, hr");
      const _0x491940 = _0x5b25cc(_0x55356d.innerText || _0x55356d.textContent || "").trim();
      return !!_0x491940 || _0xda08cd;
    };
    const _0xa072a8 = [];
    let _0x1f5acb = false;
    let _0x37f6eb = false;
    Array.from(_0x287706.childNodes).forEach(_0x8d5be2 => {
      if (_0x8d5be2.nodeType === Node.TEXT_NODE) {
        if (!_0x5b25cc(_0x8d5be2.textContent || "").trim()) {
          return;
        }
        if (_0x37f6eb) {
          _0xa072a8.push(document.createElement("br"));
          _0x37f6eb = false;
        }
        _0xa072a8.push(_0x8d5be2);
        _0x1f5acb = true;
        return;
      }
      if (_0x8d5be2.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      if (_0x28b9e8(_0x8d5be2)) {
        if (_0x1f5acb) {
          _0x37f6eb = true;
        }
        return;
      }
      const _0x124e4e = _0x8d5be2;
      if (!_0x108479(_0x124e4e)) {
        return;
      }
      if (_0x37f6eb) {
        _0xa072a8.push(document.createElement("br"));
        _0x37f6eb = false;
      }
      _0xa072a8.push(_0x124e4e);
      _0x1f5acb = true;
    });
    _0x287706.replaceChildren(..._0xa072a8);
    return _0x287706.innerHTML || "";
  };
  const _0x29fee9 = _0x15ded5 => {
    const _0x3a986e = document.createElement("div");
    return _0x29a785(_0x15ded5).split("\n").map(_0x48cba5 => {
      _0x3a986e.textContent = _0x48cba5;
      return _0x3a986e.innerHTML;
    }).join("<br>");
  };
  const _0x59bfab = ({
    rawText: _0x533bb5,
    richHtml: _0x359396
  } = {}) => {
    const _0x4b1dfd = typeof _0x533bb5 === "string" ? _0x533bb5 : "";
    const _0x1c2985 = sanitizeRichTextHtml(typeof _0x359396 === "string" ? _0x359396 : "");
    const _0x351260 = typeof _0x1d1a95?.id === "string" ? _0x1d1a95.id : "";
    if (!_0x351260) {
      window._triggerLocalCacheSave?.();
      return;
    }
    const _0x59f6ce = _0x301341();
    const _0x168ba5 = String(_0x59f6ce?.type || _0x1d1a95?.type || "");
    const _0x191041 = {};
    if (_0x168ba5 === "ai-text" || Object.prototype.hasOwnProperty.call(_0x59f6ce || {}, "outputText") || Object.prototype.hasOwnProperty.call(_0x1d1a95 || {}, "outputText")) {
      _0x191041.outputText = _0x4b1dfd;
    }
    if (_0x168ba5 === "source-text" || _0x168ba5 === "text" || Object.prototype.hasOwnProperty.call(_0x59f6ce || {}, "content") || Object.prototype.hasOwnProperty.call(_0x1d1a95 || {}, "content")) {
      _0x191041.content = _0x4b1dfd;
      _0x191041.contentHtml = _0x1c2985;
    }
    if (!Object.keys(_0x191041).length) {
      _0x191041.content = _0x4b1dfd;
    }
    try {
      a455_0xe6231.updateNodeData(_0x351260, _0x191041);
      Object.assign(_0x1d1a95, _0x191041);
    } catch (_0x288dba) {
      console.warn("[TextToolbar] Persist fullscreen text failed:", _0x288dba);
    }
    window._triggerLocalCacheSave?.();
  };
  const _0x311e8c = _0x2ccb16.querySelector(".act-copy");
  if (_0x311e8c) {
    const _0x3cf0a = Array.from(_0x311e8c.childNodes).map(_0x87136a => _0x87136a.cloneNode(true));
    const _0x11c32f = _0x311e8c.getAttribute("data-tooltip") || textToolbarText("copy");
    const _0x6b547d = _0x311e8c.getAttribute("aria-label") || "";
    let _0x3b550e = null;
    _0x311e8c.addEventListener("click", _0x2116d2 => {
      _0x2116d2.stopPropagation();
      const _0x4501aa = _0x4dc7f9 ? _0x4dc7f9() : _0x1d1a95.content || _0x1d1a95.resultText || "";
      if (!_0x4501aa) {
        showWarning(textToolbarText("noTextToCopy"));
        return;
      }
      navigator.clipboard.writeText(_0x4501aa).then(() => {
        markSystemClipboardWrite({
          text: _0x4501aa
        });
        if (_0x3b550e) {
          clearTimeout(_0x3b550e);
          _0x3b550e = null;
        }
        _0x311e8c.replaceChildren();
        const _0x34fd6c = "http://www.w3.org/2000/svg";
        const _0x1535e7 = document.createElementNS(_0x34fd6c, "svg");
        _0x1535e7.setAttribute("viewBox", "0 0 24 24");
        _0x1535e7.setAttribute("fill", "none");
        _0x1535e7.setAttribute("stroke", "currentColor");
        _0x1535e7.setAttribute("stroke-width", "2");
        _0x1535e7.setAttribute("width", "16");
        _0x1535e7.setAttribute("height", "16");
        const _0xb55b6 = document.createElementNS(_0x34fd6c, "polyline");
        _0xb55b6.setAttribute("points", "20 6 9 17 4 12");
        _0x1535e7.appendChild(_0xb55b6);
        _0x311e8c.appendChild(_0x1535e7);
        _0x311e8c.classList.add("is-copied");
        _0x311e8c.setAttribute("data-tooltip", textToolbarText("copied"));
        _0x311e8c.setAttribute("aria-label", textToolbarText("copied"));
        _0x3b550e = setTimeout(() => {
          _0x311e8c.replaceChildren(..._0x3cf0a.map(_0x1ebe99 => _0x1ebe99.cloneNode(true)));
          _0x311e8c.setAttribute("data-tooltip", _0x11c32f);
          if (_0x6b547d) {
            _0x311e8c.setAttribute("aria-label", _0x6b547d);
          } else {
            _0x311e8c.removeAttribute("aria-label");
          }
          _0x311e8c.classList.remove("is-copied");
          _0x3b550e = null;
        }, 2000);
      }).catch(_0x5ecf9d => {
        console.error("复制失败:", _0x5ecf9d);
        showError(textToolbarText("copyFailed"));
      });
    });
  }
  const _0x37f653 = _0x2ccb16.querySelector(".act-clear-empty-lines");
  if (_0x37f653) {
    _0x37f653.addEventListener("click", _0x18120f => {
      _0x18120f.stopPropagation();
      const _0x44a36d = _0x301341();
      const _0x189a5c = _0xb8cce9(_0x4dc7f9 ? _0x4dc7f9() : undefined, _0x44a36d?.content, _0x44a36d?.outputText, _0x1d1a95?.content, _0x1d1a95?.outputText, _0x1d1a95?.resultText);
      const _0x2378d6 = _0x29a785(_0x189a5c);
      if (!_0x2378d6.trim()) {
        showWarning(textToolbarText("noTextToClean"));
        return;
      }
      const _0x454879 = _0x3d879b(_0x2378d6);
      if (_0x5b25cc(_0x454879) === _0x5b25cc(_0x2378d6)) {
        window.showToast?.(textToolbarText("noBlankLines"), "info");
        return;
      }
      const _0xf9d2b1 = _0xb8cce9(_0x44a36d?.contentHtml, _0x1d1a95?.contentHtml);
      let _0xdd2d1d = _0x14b976(_0xf9d2b1);
      if (_0xf9d2b1.trim()) {
        const _0x22e613 = _0x29a785(_0xf9d2b1).trim();
        const _0x53ade8 = _0x29a785(_0xdd2d1d).trim();
        if (_0x22e613 === _0x53ade8) {
          _0xdd2d1d = _0x29fee9(_0x454879);
        }
      }
      _0x59bfab({
        rawText: _0x454879,
        richHtml: _0xdd2d1d
      });
      window.showToast?.(textToolbarText("clearedBlankLines"), "success");
    });
  }
  bindStoryboardScriptToolbarAction({
    toolbarEl: _0x2ccb16,
    nodeData: _0x1d1a95,
    store: a455_0xe6231,
    getStateSnapshot: () => typeof a455_0xe6231.getStateRaw === "function" ? a455_0xe6231.getStateRaw() : a455_0xe6231.getState()
  });
  const _0x5f28b0 = _0x2ccb16.querySelector(".act-fullscreen");
  if (_0x5f28b0) {
    _0x5f28b0.addEventListener("click", _0x4abec6 => {
      _0x4abec6.stopPropagation();
      if (closeExistingNodeToolbarFullscreen(TEXT_FULLSCREEN_OVERLAY_SELECTOR)) {
        return;
      }
      const _0x3e3c7b = _0x301341();
      const _0x1282f6 = _0xb8cce9(_0x3e3c7b?.content, _0x3e3c7b?.outputText, _0x4dc7f9 ? _0x4dc7f9() : undefined, _0x1d1a95?.content, _0x1d1a95?.resultText);
      const _0x583438 = _0xb8cce9(_0x3e3c7b?.contentHtml, _0x1d1a95?.contentHtml);
      const _0x415286 = sanitizeRichTextHtml(_0x583438);
      const _0x343dac = document.createElement("div");
      _0x343dac.dataset.nodeToolbarTextFullscreenOverlay = "true";
      Object.assign(_0x343dac.style, {
        position: "fixed",
        inset: "0",
        background: "var(--overlay-dim)",
        zIndex: "99999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)"
      });
      const _0x3c52bf = document.createElement("div");
      Object.assign(_0x3c52bf.style, {
        background: "var(--bg-2)",
        border: "1px solid var(--stroke-08)",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "1000px",
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-dialog)"
      });
      const _0x329fcf = document.createElement("div");
      Object.assign(_0x329fcf.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid var(--stroke-05)"
      });
      const _0x23b65f = document.createElement("div");
      const _0x133e03 = document.createElement("button");
      _0x133e03.setAttribute("data-tooltip", textToolbarText("copy"));
      _0x133e03.setAttribute("aria-label", textToolbarText("copy"));
      Object.assign(_0x133e03.style, {
        background: "transparent",
        border: "none",
        color: "var(--text-muted)",
        cursor: "pointer",
        padding: "6px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        transition: "background 0.2s"
      });
      const _0x91b17d = "http://www.w3.org/2000/svg";
      const _0x4faf8c = document.createElementNS(_0x91b17d, "svg");
      _0x4faf8c.setAttribute("viewBox", "0 0 24 24");
      _0x4faf8c.setAttribute("fill", "none");
      _0x4faf8c.setAttribute("stroke", "currentColor");
      _0x4faf8c.setAttribute("stroke-width", "2");
      _0x4faf8c.setAttribute("width", "16");
      _0x4faf8c.setAttribute("height", "16");
      const _0x56005f = document.createElementNS(_0x91b17d, "rect");
      _0x56005f.setAttribute("x", "9");
      _0x56005f.setAttribute("y", "9");
      _0x56005f.setAttribute("width", "13");
      _0x56005f.setAttribute("height", "13");
      _0x56005f.setAttribute("rx", "2");
      _0x56005f.setAttribute("ry", "2");
      const _0x2bd618 = document.createElementNS(_0x91b17d, "path");
      _0x2bd618.setAttribute("d", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1");
      _0x4faf8c.appendChild(_0x56005f);
      _0x4faf8c.appendChild(_0x2bd618);
      _0x133e03.appendChild(_0x4faf8c);
      _0x23b65f.appendChild(_0x133e03);
      _0x133e03.onmouseenter = () => _0x133e03.style.background = "var(--white-10)";
      _0x133e03.onmouseleave = () => _0x133e03.style.background = "transparent";
      const _0x252adf = document.createElement("div");
      Object.assign(_0x252adf.style, {
        display: "flex",
        alignItems: "center",
        gap: "4px"
      });
      const _0x1bfdb1 = (_0x54f88b, _0x2e79b9, _0xecaba0 = null, _0x589aa3 = "") => {
        if (_0x54f88b === "|") {
          const _0x576189 = document.createElement("div");
          Object.assign(_0x576189.style, {
            width: "1px",
            height: "14px",
            background: "var(--stroke-10)",
            margin: "0 4px"
          });
          return _0x576189;
        }
        const _0x4566f3 = document.createElement("button");
        if (_0x589aa3) {
          _0x4566f3.setAttribute("data-tooltip", _0x589aa3);
          _0x4566f3.setAttribute("aria-label", _0x589aa3);
        }
        _0x4566f3.replaceChildren();
        if (_0x54f88b && typeof _0x54f88b === "object" && _0x54f88b.kind === "svg") {
          const _0x3e9a05 = document.createElementNS(_0x91b17d, "svg");
          _0x3e9a05.setAttribute("viewBox", "0 0 24 24");
          _0x3e9a05.setAttribute("fill", "none");
          _0x3e9a05.setAttribute("stroke", "currentColor");
          _0x3e9a05.setAttribute("stroke-width", "2");
          _0x3e9a05.setAttribute("width", "14");
          _0x3e9a05.setAttribute("height", "14");
          if (_0x54f88b.name === "ul") {
            const _0x32e167 = document.createElementNS(_0x91b17d, "line");
            _0x32e167.setAttribute("x1", "8");
            _0x32e167.setAttribute("y1", "6");
            _0x32e167.setAttribute("x2", "21");
            _0x32e167.setAttribute("y2", "6");
            const _0x4318f5 = document.createElementNS(_0x91b17d, "line");
            _0x4318f5.setAttribute("x1", "8");
            _0x4318f5.setAttribute("y1", "12");
            _0x4318f5.setAttribute("x2", "21");
            _0x4318f5.setAttribute("y2", "12");
            const _0x5b3a65 = document.createElementNS(_0x91b17d, "line");
            _0x5b3a65.setAttribute("x1", "8");
            _0x5b3a65.setAttribute("y1", "18");
            _0x5b3a65.setAttribute("x2", "21");
            _0x5b3a65.setAttribute("y2", "18");
            const _0x4f6661 = document.createElementNS(_0x91b17d, "line");
            _0x4f6661.setAttribute("x1", "3");
            _0x4f6661.setAttribute("y1", "6");
            _0x4f6661.setAttribute("x2", "3.01");
            _0x4f6661.setAttribute("y2", "6");
            const _0x1db7ee = document.createElementNS(_0x91b17d, "line");
            _0x1db7ee.setAttribute("x1", "3");
            _0x1db7ee.setAttribute("y1", "12");
            _0x1db7ee.setAttribute("x2", "3.01");
            _0x1db7ee.setAttribute("y2", "12");
            const _0x41ffbf = document.createElementNS(_0x91b17d, "line");
            _0x41ffbf.setAttribute("x1", "3");
            _0x41ffbf.setAttribute("y1", "18");
            _0x41ffbf.setAttribute("x2", "3.01");
            _0x41ffbf.setAttribute("y2", "18");
            _0x3e9a05.appendChild(_0x32e167);
            _0x3e9a05.appendChild(_0x4318f5);
            _0x3e9a05.appendChild(_0x5b3a65);
            _0x3e9a05.appendChild(_0x4f6661);
            _0x3e9a05.appendChild(_0x1db7ee);
            _0x3e9a05.appendChild(_0x41ffbf);
          } else if (_0x54f88b.name === "ol") {
            const _0x2988d2 = document.createElementNS(_0x91b17d, "line");
            _0x2988d2.setAttribute("x1", "10");
            _0x2988d2.setAttribute("y1", "6");
            _0x2988d2.setAttribute("x2", "21");
            _0x2988d2.setAttribute("y2", "6");
            const _0x49d87e = document.createElementNS(_0x91b17d, "line");
            _0x49d87e.setAttribute("x1", "10");
            _0x49d87e.setAttribute("y1", "12");
            _0x49d87e.setAttribute("x2", "21");
            _0x49d87e.setAttribute("y2", "12");
            const _0x1ce327 = document.createElementNS(_0x91b17d, "line");
            _0x1ce327.setAttribute("x1", "10");
            _0x1ce327.setAttribute("y1", "18");
            _0x1ce327.setAttribute("x2", "21");
            _0x1ce327.setAttribute("y2", "18");
            const _0x456ed8 = document.createElementNS(_0x91b17d, "path");
            _0x456ed8.setAttribute("d", "M4 6h1v4");
            const _0x3ef683 = document.createElementNS(_0x91b17d, "path");
            _0x3ef683.setAttribute("d", "M4 10h2");
            const _0x5215e4 = document.createElementNS(_0x91b17d, "path");
            _0x5215e4.setAttribute("d", "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1");
            _0x3e9a05.appendChild(_0x2988d2);
            _0x3e9a05.appendChild(_0x49d87e);
            _0x3e9a05.appendChild(_0x1ce327);
            _0x3e9a05.appendChild(_0x456ed8);
            _0x3e9a05.appendChild(_0x3ef683);
            _0x3e9a05.appendChild(_0x5215e4);
          }
          _0x4566f3.appendChild(_0x3e9a05);
        } else {
          _0x4566f3.textContent = String(_0x54f88b ?? "");
          if (_0x54f88b === "B") {
            _0x4566f3.style.fontWeight = "700";
          }
          if (_0x54f88b === "I") {
            _0x4566f3.style.fontStyle = "italic";
          }
          if (_0x54f88b === "H₁" || _0x54f88b === "H₂" || _0x54f88b === "H₃") {
            _0x4566f3.style.fontSize = "12px";
            _0x4566f3.style.fontWeight = "700";
          }
          if (_0x54f88b === "¶") {
            _0x4566f3.style.fontSize = "14px";
            _0x4566f3.style.fontWeight = "700";
          }
        }
        Object.assign(_0x4566f3.style, {
          background: "transparent",
          border: "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontFamily: "serif",
          transition: "all 0.2s"
        });
        _0x4566f3.onmouseenter = () => _0x4566f3.style.background = "var(--white-10)";
        _0x4566f3.onmouseleave = () => _0x4566f3.style.background = "transparent";
        _0x4566f3.onclick = _0x10b394 => {
          _0x10b394.preventDefault();
          document.execCommand(_0x2e79b9, false, _0xecaba0);
        };
        return _0x4566f3;
      };
      const _0x121bbe = [{
        l: "H₁",
        c: "formatBlock",
        v: "H1",
        tooltip: textToolbarText("heading1")
      }, {
        l: "H₂",
        c: "formatBlock",
        v: "H2",
        tooltip: textToolbarText("heading2")
      }, {
        l: "H₃",
        c: "formatBlock",
        v: "H3",
        tooltip: textToolbarText("heading3")
      }, {
        l: "¶",
        c: "formatBlock",
        v: "P",
        tooltip: textToolbarText("paragraph")
      }, {
        l: "|"
      }, {
        l: "B",
        c: "bold",
        tooltip: textToolbarText("bold")
      }, {
        l: "I",
        c: "italic",
        tooltip: textToolbarText("italic")
      }, {
        l: "|"
      }, {
        l: {
          kind: "svg",
          name: "ul"
        },
        c: "insertUnorderedList",
        tooltip: textToolbarText("unorderedList")
      }, {
        l: {
          kind: "svg",
          name: "ol"
        },
        c: "insertOrderedList",
        tooltip: textToolbarText("orderedList")
      }, {
        l: "|"
      }, {
        l: "—",
        c: "insertHorizontalRule",
        tooltip: textToolbarText("divider")
      }];
      _0x121bbe.forEach(_0x59f0b9 => _0x252adf.appendChild(_0x1bfdb1(_0x59f0b9.l, _0x59f0b9.c, _0x59f0b9.v, _0x59f0b9.tooltip)));
      const _0x53262e = document.createElement("div");
      const _0x36f36a = document.createElement("button");
      _0x36f36a.setAttribute("data-tooltip", textToolbarText("close"));
      _0x36f36a.setAttribute("aria-label", textToolbarText("close"));
      Object.assign(_0x36f36a.style, {
        background: "transparent",
        border: "none",
        color: "var(--text-muted)",
        cursor: "pointer",
        padding: "6px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        transition: "background 0.2s"
      });
      const _0x3c1dbd = document.createElementNS(_0x91b17d, "svg");
      _0x3c1dbd.setAttribute("viewBox", "0 0 24 24");
      _0x3c1dbd.setAttribute("fill", "none");
      _0x3c1dbd.setAttribute("stroke", "currentColor");
      _0x3c1dbd.setAttribute("stroke-width", "2");
      _0x3c1dbd.setAttribute("width", "16");
      _0x3c1dbd.setAttribute("height", "16");
      const _0x471925 = document.createElementNS(_0x91b17d, "path");
      _0x471925.setAttribute("d", "M18 6L6 18");
      const _0x4f2407 = document.createElementNS(_0x91b17d, "path");
      _0x4f2407.setAttribute("d", "M6 6l12 12");
      _0x3c1dbd.appendChild(_0x471925);
      _0x3c1dbd.appendChild(_0x4f2407);
      _0x36f36a.appendChild(_0x3c1dbd);
      _0x53262e.appendChild(_0x36f36a);
      _0x36f36a.onmouseenter = () => _0x36f36a.style.background = "var(--white-10)";
      _0x36f36a.onmouseleave = () => _0x36f36a.style.background = "transparent";
      _0x329fcf.appendChild(_0x23b65f);
      _0x329fcf.appendChild(_0x252adf);
      _0x329fcf.appendChild(_0x53262e);
      const _0x57e9c8 = document.createElement("div");
      Object.assign(_0x57e9c8.style, {
        flex: "1",
        padding: "40px 60px",
        overflowY: "auto",
        color: "var(--text-secondary)",
        fontSize: "16px",
        lineHeight: "1.8",
        outline: "none",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap"
      });
      _0x57e9c8.contentEditable = "true";
      _0x57e9c8.spellcheck = false;
      if (_0x415286) {
        _0x57e9c8.innerHTML = _0x415286;
      } else {
        _0x57e9c8.textContent = _0x1282f6;
      }
      _0x57e9c8.className = "v2-rt-editor";
      _0x3c52bf.appendChild(_0x329fcf);
      _0x3c52bf.appendChild(_0x57e9c8);
      _0x133e03.onclick = () => {
        const _0x423f74 = _0x57e9c8.innerText || "";
        navigator.clipboard.writeText(_0x423f74).then(() => {
          markSystemClipboardWrite({
            text: _0x423f74
          });
          const _0x495053 = Array.from(_0x133e03.childNodes).map(_0x4b4227 => _0x4b4227.cloneNode(true));
          _0x133e03.replaceChildren();
          const _0x4c44b9 = document.createElementNS(_0x91b17d, "svg");
          _0x4c44b9.setAttribute("viewBox", "0 0 24 24");
          _0x4c44b9.setAttribute("fill", "none");
          _0x4c44b9.setAttribute("stroke", "currentColor");
          _0x4c44b9.setAttribute("stroke-width", "2");
          _0x4c44b9.setAttribute("width", "16");
          _0x4c44b9.setAttribute("height", "16");
          const _0x470511 = document.createElementNS(_0x91b17d, "polyline");
          _0x470511.setAttribute("points", "20 6 9 17 4 12");
          _0x4c44b9.appendChild(_0x470511);
          _0x133e03.appendChild(_0x4c44b9);
          setTimeout(() => {
            _0x133e03.replaceChildren(..._0x495053.map(_0x1d9ae1 => _0x1d9ae1.cloneNode(true)));
          }, 2000);
        });
      };
      _0x3c52bf.addEventListener("click", _0x54a20e => _0x54a20e.stopPropagation());
      const _0x18ae8d = bindNodeToolbarFullscreenOverlay(_0x343dac, {
        onClose() {
          _0x59bfab({
            rawText: _0x57e9c8.innerText || "",
            richHtml: sanitizeRichTextHtml(_0x57e9c8.innerHTML || "")
          });
        }
      });
      _0x36f36a.onclick = _0x18ae8d;
      _0x343dac.addEventListener("click", _0x4468cf => {
        if (_0x4468cf.target === _0x343dac) {
          _0x18ae8d();
        }
      });
      _0x343dac.appendChild(_0x3c52bf);
      document.body.appendChild(_0x343dac);
      window._triggerLocalCacheSave?.();
      setTimeout(() => _0x57e9c8.focus(), 50);
    });
  }
}