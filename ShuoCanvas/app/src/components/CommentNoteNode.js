import a387_0x24b525 from "../core/stores/appStore.js";
import { commit } from "../modules/history.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { bindCommentNoteToolbarEvents } from "./NodeToolbarConfig.js";
import { setStaticInnerHTML } from "../utils/dom.js";
import { COMMENT_NOTE_BACKGROUND_COLOR_MAP, COMMENT_NOTE_TEXT_COLOR_MAP, normalizeCommentNoteStyle } from "./commentNoteStyle.js";
import { isCommentNoteMarkdown } from "./commentNoteFormat.js";
import { COMMENT_NOTE_MIN_HEIGHT, buildCommentNoteContentPatch } from "./commentNoteSize.js";
import { renderMarkdownToHtml } from "./aigenText/markdownRenderer.js";
const COMMENT_NOTE_PLACEHOLDER = "双击写下注释";
export class CommentNoteNode {
  constructor(_0x4f0aa9) {
    this._data = _0x4f0aa9;
    this.id = _0x4f0aa9.id;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component";
  }
  mount() {
    const _0x1e0c0a = this.el;
    setStaticInnerHTML(_0x1e0c0a, "toolbar:comment-note");
    const _0x48d7c6 = document.createElement("div");
    _0x48d7c6.className = "node-card comment-note-card";
    const _0x1221e3 = document.createElement("div");
    _0x1221e3.className = "comment-note-content";
    _0x1221e3.setAttribute("contenteditable", "false");
    _0x1221e3.spellcheck = false;
    _0x1221e3.dataset.placeholder = COMMENT_NOTE_PLACEHOLDER;
    const _0x5375f3 = document.createElement("div");
    _0x5375f3.className = "group-resizer";
    _0x5375f3.classList.add("v2-resize-move");
    _0x48d7c6.appendChild(_0x1221e3);
    _0x48d7c6.appendChild(_0x5375f3);
    _0x1e0c0a.appendChild(_0x48d7c6);
    this._card = _0x48d7c6;
    this._content = _0x1221e3;
    this._card.addEventListener("dblclick", _0x33e44e => {
      _0x33e44e.stopPropagation();
    });
    this._renderContentFromData(this._data);
    this._content.addEventListener("blur", () => {
      this._content.setAttribute("contenteditable", "false");
      this.el.classList.remove("comment-note-editing");
      const _0x141990 = this._content.innerText || "";
      const _0xe13c83 = a387_0x24b525.getStateRaw().nodes?.[this.id] || this._data;
      const _0x377eb9 = buildCommentNoteContentPatch({
        content: _0x141990,
        measuredHeight: this._measureAutoHeight(),
        currentHeight: _0xe13c83?.height
      });
      a387_0x24b525.updateNodeData(this.id, _0x377eb9);
      this._data = {
        ...this._data,
        ..._0x377eb9
      };
      this._renderContentFromData(this._data);
      commit();
    });
    this._content.addEventListener("input", () => {
      const _0x2eafd = this._content.innerText || "";
      if (_0x2eafd.length > 0) {
        delete this._content.dataset.placeholder;
      } else {
        this._content.dataset.placeholder = COMMENT_NOTE_PLACEHOLDER;
      }
      this._syncAutoHeightToStore();
    });
    let _0x224b17 = 0;
    let _0x7c2027 = 0;
    this._content.addEventListener("pointerdown", _0x15c898 => {
      if (this._content.getAttribute("contenteditable") === "true") {
        _0x15c898.stopPropagation();
        return;
      }
      _0x224b17 = _0x15c898.clientX;
      _0x7c2027 = _0x15c898.clientY;
    });
    this._content.addEventListener("pointerup", _0x1a95ea => {
      if (this._content.getAttribute("contenteditable") === "true") {
        return;
      }
      const _0x2ce401 = Math.hypot(_0x1a95ea.clientX - _0x224b17, _0x1a95ea.clientY - _0x7c2027);
      if (_0x2ce401 >= 5) {
        return;
      }
      const _0x5dc344 = this._readCurrentRawContent().trim();
      if (!_0x5dc344) {
        this._enterEditMode();
        return;
      }
      const _0x512867 = document.caretRangeFromPoint?.(_0x1a95ea.clientX, _0x1a95ea.clientY);
      if (_0x512867 && this._content.contains(_0x512867.startContainer)) {
        this._enterEditMode();
      }
    });
    this._content.addEventListener("wheel", _0xd30816 => {
      if (this._content.scrollHeight > this._content.clientHeight) {
        _0xd30816.stopPropagation();
      }
    });
    _0x5375f3.addEventListener("pointerdown", _0x405c11 => {
      startNodeResizePreview({
        event: _0x405c11,
        nodeId: this.id,
        getNode: () => a387_0x24b525.getStateRaw().nodes?.[this.id] || this._data,
        getViewport: () => a387_0x24b525.getStateRaw().viewport,
        resolveSize: ({
          startWidth: _0x512ff7,
          startHeight: _0x55b741,
          dx: _0x5c13f2,
          dy: _0x3a307e
        }) => ({
          width: Math.max(160, _0x512ff7 + _0x5c13f2),
          height: Math.max(COMMENT_NOTE_MIN_HEIGHT, _0x55b741 + _0x3a307e)
        }),
        applyPatch: _0x512453 => a387_0x24b525.updateNodeData(this.id, _0x512453),
        commit: commit
      });
    });
    const _0x13f782 = _0x1e0c0a.querySelector(".node-floating-toolbar");
    this._syncToolbarState = bindCommentNoteToolbarEvents({
      toolbarEl: _0x13f782,
      nodeId: this.id,
      getCurrentStyle: () => normalizeCommentNoteStyle(this._data.style),
      getNodeSnapshot: () => ({
        ...(a387_0x24b525.getStateRaw().nodes?.[this.id] || this._data),
        content: this._readCurrentRawContent()
      })
    });
    this._applyNodeState(this._data);
    return _0x1e0c0a;
  }
  _enterEditMode() {
    const _0x25887e = this._readCurrentRawContent();
    this._content.setAttribute("contenteditable", "true");
    this.el.classList.add("comment-note-editing");
    this._renderContentFromData({
      ...this._data,
      content: _0x25887e
    }, {
      forceRaw: true
    });
    this._syncAutoHeightToStore();
    this._content.focus();
    const _0x1b5f23 = a387_0x24b525.getState().selectedNodeIds;
    if (!_0x1b5f23.includes(this.id)) {
      a387_0x24b525.setSelectedNodes([this.id]);
    }
  }
  _readCurrentRawContent() {
    if (!this._content) {
      return this._data?.content || "";
    }
    if (this._content.getAttribute("contenteditable") === "true") {
      return this._content.innerText || "";
    }
    if (typeof this._data?.content === "string") {
      return this._data.content;
    } else {
      return this._content.innerText || "";
    }
  }
  _renderContentFromData(_0x5a61d7, {
    forceRaw = false
  } = {}) {
    if (!this._content) {
      return;
    }
    const _0x52b18b = typeof _0x5a61d7?.content === "string" ? _0x5a61d7.content : "";
    const _0x2e0646 = isCommentNoteMarkdown(_0x5a61d7) && !forceRaw;
    this._content.classList.toggle("comment-note-content--markdown", isCommentNoteMarkdown(_0x5a61d7));
    if (_0x2e0646) {
      this._content.innerHTML = renderMarkdownToHtml(_0x52b18b);
    } else {
      this._content.innerText = _0x52b18b;
    }
    if (!_0x52b18b) {
      this._content.dataset.placeholder = COMMENT_NOTE_PLACEHOLDER;
    } else {
      delete this._content.dataset.placeholder;
    }
  }
  _measureAutoHeight() {
    if (!this._content) {
      return COMMENT_NOTE_MIN_HEIGHT;
    }
    const _0x140d2e = this._content.style.height;
    this._content.style.height = "auto";
    const _0x21b5ab = Math.ceil(this._content.scrollHeight);
    this._content.style.height = _0x140d2e;
    return Math.max(COMMENT_NOTE_MIN_HEIGHT, _0x21b5ab);
  }
  _syncAutoHeightToStore({
    allowShrink = false
  } = {}) {
    const _0x200789 = a387_0x24b525.getStateRaw().nodes?.[this.id];
    if (!_0x200789) {
      return;
    }
    const _0x4aadfd = this._measureAutoHeight();
    const _0x33f7a7 = Number(_0x200789.height) || COMMENT_NOTE_MIN_HEIGHT;
    const _0x26b4d3 = allowShrink ? Math.abs(_0x4aadfd - _0x33f7a7) >= 1 : _0x4aadfd > _0x33f7a7 + 1;
    if (!_0x26b4d3) {
      return;
    }
    a387_0x24b525.updateNodeData(this.id, {
      height: _0x4aadfd
    });
  }
  _applyNodeState(_0x15fa25) {
    const _0x126558 = normalizeCommentNoteStyle(_0x15fa25.style);
    this._card.style.setProperty("--comment-note-font-size", _0x126558.fontSize + "px");
    this._card.style.setProperty("--comment-note-text-color", COMMENT_NOTE_TEXT_COLOR_MAP[_0x126558.textColor]);
    this._card.style.setProperty("--comment-note-bg-color", COMMENT_NOTE_BACKGROUND_COLOR_MAP[_0x126558.backgroundColor]);
    this._card.classList.toggle("comment-note-card--transparent", _0x126558.backgroundColor === "transparent");
    this._syncToolbarState?.(_0x126558);
  }
  update(_0x27fe9a) {
    const _0x154c83 = normalizeCommentNoteStyle(this._data?.style);
    const _0x7fdbd7 = normalizeCommentNoteStyle(_0x27fe9a?.style);
    this._data = _0x27fe9a;
    if (!this._content || !this._card) {
      return;
    }
    if (document.activeElement !== this._content) {
      this._renderContentFromData(_0x27fe9a);
    }
    this._applyNodeState(_0x27fe9a);
    if (_0x7fdbd7.fontSize > _0x154c83.fontSize) {
      this._syncAutoHeightToStore();
    }
  }
  unmount() {}
}