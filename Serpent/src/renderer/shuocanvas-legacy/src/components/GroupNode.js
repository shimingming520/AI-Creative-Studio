import a394_0x114250 from "../core/stores/appStore.js";
import { executeCommand } from "../core/interaction.js";
import { commit } from "../modules/history.js";
import { cancelGroupGenerateButtons, executeGroupGenerateButtons, hasRunningGroupGenerateNodes } from "../modules/groupExecution.js";
import { collectGroupContainmentReparentOps } from "../modules/groupMembership.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { collectGroupSyncPlayableVideoEntries, syncPlayGroupVideos } from "../modules/videoSyncPlayback.js";
import { onLocaleChange, t } from "../i18n/index.js";
const getStateSnapshot = () => typeof a394_0x114250.getStateRaw === "function" ? a394_0x114250.getStateRaw() : a394_0x114250.getState();
function groupText(_0x5c691c, _0x3d0b8e = {}) {
  return t("groupNode." + _0x5c691c, _0x3d0b8e);
}
export class GroupNode {
  constructor(_0x8d3d61) {
    this._data = _0x8d3d61;
    this._rootEl = null;
    this._titleEl = null;
    this._toolbarEl = null;
    this._detachedToolbarEl = null;
    this._colorMenuOutsidePointerDown = null;
    this._toolbarInteractivityRaf = null;
    this._toolbarPreviewOffsetX = 0;
    this._toolbarPreviewOffsetY = 0;
    this._toolbarAnchorInsetY = null;
    this._lastSyncPlayableVideoCount = null;
    this._unsubscribeLocale = null;
  }
  mount() {
    this._rootEl = document.createElement("div");
    this._rootEl.style.width = "100%";
    this._rootEl.style.height = "100%";
    const _0x21d42b = document.createElement("div");
    _0x21d42b.className = "node-group-drag-handle";
    _0x21d42b.dataset.groupDragHandleFor = this._data.id;
    _0x21d42b.setAttribute("aria-hidden", "true");
    this._rootEl.appendChild(_0x21d42b);
    this._titleEl = document.createElement("div");
    this._titleEl.className = "node-group-title";
    this._titleEl.contentEditable = "true";
    this._titleEl.spellcheck = false;
    this._titleEl.title = groupText("renameTooltip");
    this._titleEl.textContent = this._data.name || groupText("defaultName");
    this._titleEl.addEventListener("pointerdown", _0x16e3c1 => _0x16e3c1.stopPropagation());
    this._titleEl.addEventListener("keydown", _0x1b3353 => {
      if (_0x1b3353.key === "Enter") {
        _0x1b3353.preventDefault();
        this._titleEl.blur();
      }
    });
    this._titleEl.addEventListener("blur", () => {
      a394_0x114250.updateNodeData(this._data.id, {
        name: this._titleEl.textContent
      });
      commit();
    });
    this._rootEl.appendChild(this._titleEl);
    const _0x129f08 = document.createElement("div");
    _0x129f08.className = "group-toolbar";
    _0x129f08.dataset.groupToolbarFor = this._data.id;
    _0x129f08.onpointerdown = _0x18919a => _0x18919a.stopPropagation();
    this._toolbarEl = _0x129f08;
    const _0x5261ef = "http://www.w3.org/2000/svg";
    const _0x5d1b60 = () => {
      const _0x3760f5 = document.createElementNS(_0x5261ef, "svg");
      _0x3760f5.setAttribute("viewBox", "0 0 24 24");
      _0x3760f5.setAttribute("fill", "none");
      _0x3760f5.setAttribute("stroke", "currentColor");
      _0x3760f5.setAttribute("stroke-linecap", "round");
      _0x3760f5.setAttribute("stroke-linejoin", "round");
      return _0x3760f5;
    };
    const _0x371c05 = (_0x17e4d5, _0x561d9a) => {
      _0x17e4d5.type = "button";
      const _0x7255fc = groupText(_0x561d9a);
      _0x17e4d5.title = _0x7255fc;
      _0x17e4d5.setAttribute("aria-label", _0x7255fc);
    };
    const _0x2ad16a = (_0x3f7f39, _0x5e05fc) => {
      const _0x50ae53 = document.createElementNS(_0x5261ef, "path");
      _0x50ae53.setAttribute("d", _0x5e05fc);
      _0x3f7f39.appendChild(_0x50ae53);
      return _0x50ae53;
    };
    const _0xffeebd = document.createElement("button");
    _0xffeebd.className = "gt-btn gt-btn-run";
    _0x371c05(_0xffeebd, "toolbar.runGroup");
    _0xffeebd.replaceChildren();
    const _0x55316c = _0x5d1b60();
    _0x55316c.setAttribute("stroke-width", "2");
    _0x2ad16a(_0x55316c, "M12 3l1.2 4.1L17 8.3l-3.8 1.2L12 13.5l-1.2-4-3.8-1.2 3.8-1.2L12 3z");
    _0x2ad16a(_0x55316c, "M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14z");
    _0x2ad16a(_0x55316c, "M6 13l.8 2.7L9.5 16.5l-2.7.8L6 20l-.8-2.7-2.7-.8 2.7-.8L6 13z");
    _0xffeebd.appendChild(_0x55316c);
    _0xffeebd.onclick = _0x4493c5 => {
      _0x4493c5.stopPropagation();
      this._runGroup();
    };
    _0x129f08.appendChild(_0xffeebd);
    const _0x2e6634 = document.createElement("button");
    _0x2e6634.className = "gt-btn gt-btn-sync-play";
    _0x371c05(_0x2e6634, "toolbar.syncPlay");
    _0x2e6634.replaceChildren();
    const _0x34b291 = _0x5d1b60();
    _0x34b291.setAttribute("stroke-width", "2.5");
    const _0x5f1579 = document.createElementNS(_0x5261ef, "polygon");
    _0x5f1579.setAttribute("points", "5 3 19 12 5 21 5 3");
    _0x34b291.appendChild(_0x5f1579);
    _0x2e6634.appendChild(_0x34b291);
    _0x2e6634.style.display = "none";
    _0x2e6634.onclick = _0x38a617 => {
      _0x38a617.stopPropagation();
      this._syncPlayGroupVideos();
    };
    _0x129f08.appendChild(_0x2e6634);
    const _0xa2d04f = document.createElement("div");
    _0xa2d04f.className = "gt-color-wrap";
    const _0x139822 = document.createElement("button");
    _0x139822.className = "gt-btn gt-btn-color";
    _0x371c05(_0x139822, "toolbar.color");
    _0x139822.replaceChildren();
    const _0x25dcef = document.createElement("div");
    _0x25dcef.className = "color-dot";
    _0x25dcef.style.background = this._data.color || "var(--indigo)";
    _0x139822.appendChild(_0x25dcef);
    const _0x16a9e3 = document.createElement("div");
    _0x16a9e3.className = "gt-color-menu";
    const _0x7b84d4 = ["var(--indigo)", "var(--green)", "var(--gold)", "var(--red)", "var(--purple)", "var(--group-pink)", "var(--group-slate)", "var(--cyan)"];
    _0x139822.onclick = _0x497bb0 => {
      _0x497bb0.stopPropagation();
      const _0x345408 = _0x16a9e3.classList.contains("show");
      document.querySelectorAll(".gt-color-menu.show").forEach(_0x1bf14d => _0x1bf14d.classList.remove("show"));
      if (!_0x345408) {
        _0x16a9e3.classList.add("show");
      }
    };
    _0x7b84d4.forEach(_0x4ff805 => {
      const _0x1525ae = document.createElement("div");
      _0x1525ae.className = "color-option";
      _0x1525ae.dataset.groupColor = _0x4ff805;
      _0x1525ae.style.background = _0x4ff805;
      _0x1525ae.onclick = _0x30d1f3 => {
        _0x30d1f3.stopPropagation();
        this._setColor(_0x4ff805);
      };
      _0x16a9e3.appendChild(_0x1525ae);
    });
    this._colorMenuOutsidePointerDown = () => _0x16a9e3.classList.remove("show");
    window.addEventListener("pointerdown", this._colorMenuOutsidePointerDown);
    _0xa2d04f.appendChild(_0x139822);
    _0xa2d04f.appendChild(_0x16a9e3);
    _0x129f08.appendChild(_0xa2d04f);
    const _0x2959e9 = document.createElement("button");
    _0x2959e9.className = "gt-btn gt-btn-workflow";
    _0x371c05(_0x2959e9, "toolbar.createWorkflow");
    _0x2959e9.replaceChildren();
    const _0x1da96a = _0x5d1b60();
    _0x1da96a.setAttribute("stroke-width", "1.8");
    const _0x28ffd5 = document.createElementNS(_0x5261ef, "rect");
    _0x28ffd5.setAttribute("x", "3");
    _0x28ffd5.setAttribute("y", "3");
    _0x28ffd5.setAttribute("width", "18");
    _0x28ffd5.setAttribute("height", "18");
    _0x28ffd5.setAttribute("rx", "2");
    _0x28ffd5.setAttribute("ry", "2");
    const _0x1f11b5 = document.createElementNS(_0x5261ef, "line");
    _0x1f11b5.setAttribute("x1", "3");
    _0x1f11b5.setAttribute("y1", "9");
    _0x1f11b5.setAttribute("x2", "21");
    _0x1f11b5.setAttribute("y2", "9");
    const _0x385f00 = document.createElementNS(_0x5261ef, "line");
    _0x385f00.setAttribute("x1", "9");
    _0x385f00.setAttribute("y1", "21");
    _0x385f00.setAttribute("x2", "9");
    _0x385f00.setAttribute("y2", "9");
    _0x1da96a.appendChild(_0x28ffd5);
    _0x1da96a.appendChild(_0x1f11b5);
    _0x1da96a.appendChild(_0x385f00);
    _0x2959e9.appendChild(_0x1da96a);
    _0x2959e9.onclick = _0x1191a0 => {
      _0x1191a0.stopPropagation();
      this._requestWorkflow();
    };
    _0x129f08.appendChild(_0x2959e9);
    const _0x3fe693 = document.createElement("button");
    _0x3fe693.className = "gt-btn gt-btn-ungroup";
    _0x371c05(_0x3fe693, "toolbar.ungroup");
    _0x3fe693.replaceChildren();
    const _0x10d007 = _0x5d1b60();
    _0x10d007.setAttribute("stroke-width", "2");
    const _0x476401 = document.createElementNS(_0x5261ef, "path");
    _0x476401.setAttribute("d", "M3 6h18");
    const _0x1dc2da = document.createElementNS(_0x5261ef, "path");
    _0x1dc2da.setAttribute("d", "M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2");
    const _0x1f7915 = document.createElementNS(_0x5261ef, "path");
    _0x1f7915.setAttribute("d", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6");
    const _0xb499c3 = document.createElementNS(_0x5261ef, "line");
    _0xb499c3.setAttribute("x1", "10");
    _0xb499c3.setAttribute("y1", "11");
    _0xb499c3.setAttribute("x2", "10");
    _0xb499c3.setAttribute("y2", "17");
    const _0x5d2224 = document.createElementNS(_0x5261ef, "line");
    _0x5d2224.setAttribute("x1", "14");
    _0x5d2224.setAttribute("y1", "11");
    _0x5d2224.setAttribute("x2", "14");
    _0x5d2224.setAttribute("y2", "17");
    _0x10d007.appendChild(_0x476401);
    _0x10d007.appendChild(_0x1dc2da);
    _0x10d007.appendChild(_0x1f7915);
    _0x10d007.appendChild(_0xb499c3);
    _0x10d007.appendChild(_0x5d2224);
    _0x3fe693.appendChild(_0x10d007);
    _0x3fe693.onclick = _0x42403e => {
      _0x42403e.stopPropagation();
      this._ungroup();
    };
    _0x129f08.appendChild(_0x3fe693);
    this._rootEl.appendChild(_0x129f08);
    this._mountDetachedToolbar(_0x129f08);
    const _0x182655 = document.createElement("div");
    _0x182655.className = "group-resizer";
    _0x182655.style.pointerEvents = "auto";
    _0x182655.addEventListener("pointerdown", _0x2df4d3 => {
      startNodeResizePreview({
        event: _0x2df4d3,
        nodeId: this._data.id,
        getNode: () => getStateSnapshot().nodes?.[this._data.id] || this._data,
        getViewport: () => getStateSnapshot().viewport,
        resolveSize: ({
          startWidth: _0x4e575a,
          startHeight: _0x1563f6,
          dx: _0x45d0fc,
          dy: _0x3bccf7
        }) => ({
          width: Math.max(150, _0x4e575a + _0x45d0fc),
          height: Math.max(100, _0x1563f6 + _0x3bccf7)
        }),
        applyPatch: _0x3692a8 => a394_0x114250.updateNodeData(this._data.id, _0x3692a8),
        onPreview: _0x266162 => this._syncToolbarPosition(_0x266162.width),
        afterApply: () => this._syncContainedChildren(),
        commit: commit,
        label: "group-resize"
      });
    });
    this._rootEl.appendChild(_0x182655);
    this._syncColor(this._data.color || "var(--indigo)");
    this._syncGroupRunButton(getStateSnapshot().nodes || {});
    this._syncGroupSyncPlaybackButton(getStateSnapshot().nodes || {});
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    return this._rootEl;
  }
  _syncLocaleTexts() {
    if (this._titleEl) {
      this._titleEl.title = groupText("renameTooltip");
      if (!String(this._data?.name || "").trim() && document.activeElement !== this._titleEl) {
        this._titleEl.textContent = groupText("defaultName");
      }
    }
    const _0x599c84 = [[".gt-btn-run", "toolbar.runGroup"], [".gt-btn-sync-play", "toolbar.syncPlay"], [".gt-btn-color", "toolbar.color"], [".gt-btn-workflow", "toolbar.createWorkflow"], [".gt-btn-ungroup", "toolbar.ungroup"]];
    for (const _0x4af2bb of [this._toolbarEl, this._detachedToolbarEl]) {
      if (!_0x4af2bb) {
        continue;
      }
      for (const [_0x212a83, _0x2bb69d] of _0x599c84) {
        const _0x177212 = _0x4af2bb.querySelector(_0x212a83);
        if (!_0x177212) {
          continue;
        }
        const _0x209406 = groupText(_0x2bb69d);
        _0x177212.title = _0x209406;
        _0x177212.setAttribute("aria-label", _0x209406);
      }
    }
    this._syncGroupRunButton(getStateSnapshot().nodes || {});
  }
  _mountDetachedToolbar(_0x27a249) {
    const _0x298184 = document.getElementById("v2-canvas");
    if (!_0x298184) {
      return;
    }
    const _0x280bbe = _0x27a249.cloneNode(true);
    _0x280bbe.classList.add("group-toolbar--detached");
    _0x280bbe.onpointerdown = _0xae5465 => _0xae5465.stopPropagation();
    _0x280bbe.addEventListener("click", _0x37aa62 => this._handleDetachedToolbarClick(_0x37aa62));
    _0x298184.appendChild(_0x280bbe);
    this._detachedToolbarEl = _0x280bbe;
    this._syncToolbarPosition();
  }
  _syncToolbarPosition(_0x5751b4 = null) {
    if (!this._detachedToolbarEl) {
      return;
    }
    const _0x365820 = Number.isFinite(this._data.x) ? this._data.x : 0;
    const _0x367d29 = Number.isFinite(this._data.y) ? this._data.y : 0;
    const _0x54eea7 = Number.isFinite(_0x5751b4) ? _0x5751b4 : Number.isFinite(this._data.width) ? this._data.width : 0;
    const _0x3f7e99 = _0x365820 + this._toolbarPreviewOffsetX + _0x54eea7 / 2;
    const _0x3229fa = _0x367d29 + this._toolbarPreviewOffsetY + this._resolveToolbarAnchorInsetY();
    this._detachedToolbarEl.style.left = _0x3f7e99 + "px";
    this._detachedToolbarEl.style.top = _0x3229fa + "px";
  }
  _resolveToolbarAnchorInsetY() {
    if (Number.isFinite(this._toolbarAnchorInsetY)) {
      return this._toolbarAnchorInsetY;
    }
    const _0x40e604 = this._rootEl?.parentElement;
    if (!_0x40e604) {
      return 0;
    }
    const _0x35b37c = Number.parseFloat(window.getComputedStyle(_0x40e604).borderTopWidth);
    const _0x46ae55 = Number.parseFloat(window.getComputedStyle(this._detachedToolbarEl).borderTopWidth);
    this._toolbarAnchorInsetY = (Number.isFinite(_0x35b37c) ? _0x35b37c : 0) + (Number.isFinite(_0x46ae55) ? _0x46ae55 : 0);
    return this._toolbarAnchorInsetY;
  }
  syncDragPreview({
    dx = 0,
    dy = 0,
    active = false
  } = {}) {
    this._detachedToolbarEl?.classList.toggle("is-drag-preview", active === true);
    const _0x181dc1 = active && Number.isFinite(dx) ? dx : 0;
    const _0x50a37b = active && Number.isFinite(dy) ? dy : 0;
    if (_0x181dc1 === this._toolbarPreviewOffsetX && _0x50a37b === this._toolbarPreviewOffsetY) {
      return;
    }
    this._toolbarPreviewOffsetX = _0x181dc1;
    this._toolbarPreviewOffsetY = _0x50a37b;
    this._syncToolbarPosition();
  }
  syncSelectionState({
    selected = false,
    singleSelected = false,
    visible = true,
    nodes = null
  } = {}) {
    if (!this._detachedToolbarEl) {
      return;
    }
    this._syncGroupRunButton(nodes || getStateSnapshot().nodes || {});
    this._syncGroupSyncPlaybackButton(nodes || getStateSnapshot().nodes || {});
    const _0x30d5d8 = visible && selected && singleSelected;
    this._detachedToolbarEl.classList.toggle("is-visible", _0x30d5d8);
    if (!_0x30d5d8) {
      if (this._toolbarInteractivityRaf !== null) {
        cancelAnimationFrame(this._toolbarInteractivityRaf);
        this._toolbarInteractivityRaf = null;
      }
      this._syncDetachedToolbarInteractivity(false);
      return;
    }
    this._syncToolbarPosition();
    this._scheduleDetachedToolbarInteractivitySync(_0x30d5d8);
  }
  _syncColor(_0x7a909) {
    [this._toolbarEl, this._detachedToolbarEl].forEach(_0x14b244 => {
      const _0x51176f = _0x14b244?.querySelector(".color-dot");
      if (_0x51176f) {
        _0x51176f.style.background = _0x7a909;
      }
    });
  }
  _closeColorMenus() {
    document.querySelectorAll(".gt-color-menu.show").forEach(_0x49310e => _0x49310e.classList.remove("show"));
  }
  _runGroup() {
    const _0x19906e = getStateSnapshot();
    if (hasRunningGroupGenerateNodes(_0x19906e.nodes || {}, this._data.id)) {
      cancelGroupGenerateButtons({
        groupId: this._data.id,
        state: _0x19906e
      });
    } else {
      executeGroupGenerateButtons({
        groupId: this._data.id,
        state: _0x19906e
      });
    }
    this._syncGroupRunButton(getStateSnapshot().nodes || {});
  }
  _syncGroupRunButton(_0x25c48f = {}) {
    const _0xe7a340 = hasRunningGroupGenerateNodes(_0x25c48f, this._data.id);
    const _0x335e99 = groupText(_0xe7a340 ? "toolbar.stopGroup" : "toolbar.runGroup");
    [this._toolbarEl, this._detachedToolbarEl].forEach(_0x97d027 => {
      const _0x535a06 = _0x97d027?.querySelector?.(".gt-btn-run");
      if (!_0x535a06) {
        return;
      }
      _0x535a06.title = _0x335e99;
      _0x535a06.setAttribute("aria-label", _0x335e99);
      _0x535a06.setAttribute("aria-busy", String(_0xe7a340));
      _0x535a06.classList.toggle("is-active", _0xe7a340);
    });
  }
  _syncPlayGroupVideos() {
    syncPlayGroupVideos({
      groupId: this._data.id,
      state: getStateSnapshot()
    });
  }
  _syncGroupSyncPlaybackButton(_0x1cadb9 = {}) {
    const _0x645588 = collectGroupSyncPlayableVideoEntries(_0x1cadb9, this._data.id).length;
    if (_0x645588 === this._lastSyncPlayableVideoCount) {
      return;
    }
    this._lastSyncPlayableVideoCount = _0x645588;
    const _0x24839a = _0x645588 >= 2;
    [this._toolbarEl, this._detachedToolbarEl].forEach(_0x3dddd8 => {
      const _0x1b37ea = _0x3dddd8?.querySelector?.(".gt-btn-sync-play");
      if (!_0x1b37ea) {
        return;
      }
      _0x1b37ea.style.display = _0x24839a ? "" : "none";
      _0x1b37ea.disabled = !_0x24839a;
      _0x1b37ea.classList.toggle("is-disabled", !_0x24839a);
    });
  }
  _setColor(_0x9f1af6) {
    a394_0x114250.updateNodeData(this._data.id, {
      color: _0x9f1af6
    });
    this._closeColorMenus();
    commit();
  }
  _syncContainedChildren() {
    const {
      nodes: _0x32aaf4
    } = getStateSnapshot();
    const _0x21a782 = collectGroupContainmentReparentOps(_0x32aaf4, [this._data.id]);
    if (_0x21a782.length === 0) {
      return false;
    }
    const _0x1ed1a7 = () => {
      _0x21a782.forEach(({
        nodeId: _0x4b00dd,
        parentId: _0x34ec9a
      }) => {
        a394_0x114250.groupNodes([_0x4b00dd], _0x34ec9a);
      });
    };
    if (typeof a394_0x114250.batch === "function") {
      a394_0x114250.batch(_0x1ed1a7);
      return true;
    }
    _0x1ed1a7();
    return true;
  }
  _requestWorkflow() {
    window.dispatchEvent(new CustomEvent("workflow:create-request", {
      detail: {
        source: "group-toolbar",
        groupId: this._data.id
      }
    }));
  }
  _ungroup() {
    executeCommand("ungroup", {
      ids: [this._data.id]
    });
  }
  _handleDetachedToolbarClick(_0x3b3eef) {
    const _0x176740 = _0x3b3eef.target;
    if (!(_0x176740 instanceof Element)) {
      return;
    }
    const _0x16f785 = _0x176740.closest(".gt-btn-run, .gt-btn-sync-play, .gt-btn-color, .gt-btn-workflow, .gt-btn-ungroup, .color-option");
    if (!_0x16f785 || !this._detachedToolbarEl?.contains(_0x16f785)) {
      return;
    }
    _0x3b3eef.stopPropagation();
    if (_0x16f785.classList.contains("color-option")) {
      const _0x474732 = _0x16f785.dataset.groupColor || _0x16f785.style.background;
      if (_0x474732) {
        this._setColor(_0x474732);
      }
      return;
    }
    if (_0x16f785.classList.contains("gt-btn-run")) {
      this._runGroup();
      return;
    }
    if (_0x16f785.classList.contains("gt-btn-sync-play")) {
      this._syncPlayGroupVideos();
      return;
    }
    if (_0x16f785.classList.contains("gt-btn-workflow")) {
      this._requestWorkflow();
      return;
    }
    if (_0x16f785.classList.contains("gt-btn-ungroup")) {
      this._ungroup();
      return;
    }
    if (_0x16f785.classList.contains("gt-btn-color")) {
      const _0x49df6a = this._detachedToolbarEl.querySelector(".gt-color-menu");
      const _0x1289ea = _0x49df6a?.classList.contains("show");
      this._closeColorMenus();
      if (_0x49df6a && !_0x1289ea) {
        _0x49df6a.classList.add("show");
      }
    }
  }
  _syncDetachedToolbarInteractivity(_0x24bceb) {
    if (!this._detachedToolbarEl) {
      return;
    }
    this._detachedToolbarEl.classList.remove("is-interactive");
    this._toolbarEl?.classList.remove("is-detached-source-hidden");
    if (!_0x24bceb || !this._toolbarEl) {
      return;
    }
    const _0xd15869 = Array.from(this._toolbarEl.querySelectorAll(".gt-btn")).map(_0x41aa6e => _0x41aa6e.getBoundingClientRect()).filter(_0x30e6ff => _0x30e6ff.width > 0 && _0x30e6ff.height > 0);
    const _0x472938 = this._toolbarEl.getBoundingClientRect();
    if (_0x472938.width > 0 && _0x472938.height > 0) {
      _0xd15869.push(_0x472938);
    }
    const _0x4a8356 = _0xd15869.some(_0x4af3f4 => {
      const _0x1d4d8c = _0x4af3f4.left + _0x4af3f4.width / 2;
      const _0x3e8f80 = _0x4af3f4.top + _0x4af3f4.height / 2;
      const _0x787f11 = document.elementFromPoint(_0x1d4d8c, _0x3e8f80);
      return _0x787f11 && !this._toolbarEl.contains(_0x787f11);
    });
    this._detachedToolbarEl.classList.toggle("is-interactive", _0x4a8356);
    this._toolbarEl.classList.toggle("is-detached-source-hidden", _0x4a8356);
  }
  _scheduleDetachedToolbarInteractivitySync(_0xab1363) {
    this._syncDetachedToolbarInteractivity(_0xab1363);
    if (this._toolbarInteractivityRaf !== null) {
      cancelAnimationFrame(this._toolbarInteractivityRaf);
      this._toolbarInteractivityRaf = null;
    }
    if (typeof requestAnimationFrame !== "function") {
      return;
    }
    this._toolbarInteractivityRaf = requestAnimationFrame(() => {
      this._toolbarInteractivityRaf = null;
      this._syncDetachedToolbarInteractivity(_0xab1363);
    });
  }
  update(_0x4aaa4b) {
    if (_0x4aaa4b.name !== this._data.name) {
      if (document.activeElement !== this._titleEl) {
        this._titleEl.textContent = _0x4aaa4b.name || groupText("defaultName");
      }
    }
    if (_0x4aaa4b.color !== this._data.color) {
      this._syncColor(_0x4aaa4b.color || "var(--indigo)");
    }
    this._toolbarPreviewOffsetX = 0;
    this._toolbarPreviewOffsetY = 0;
    this._data = _0x4aaa4b;
    this._syncToolbarPosition();
    this._syncGroupSyncPlaybackButton(getStateSnapshot().nodes || {});
  }
  unmount() {
    if (this._toolbarInteractivityRaf !== null) {
      cancelAnimationFrame(this._toolbarInteractivityRaf);
      this._toolbarInteractivityRaf = null;
    }
    if (this._colorMenuOutsidePointerDown) {
      window.removeEventListener("pointerdown", this._colorMenuOutsidePointerDown);
      this._colorMenuOutsidePointerDown = null;
    }
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    if (this._toolbarEl?.isConnected) {
      this._toolbarEl.remove();
    }
    if (this._detachedToolbarEl?.isConnected) {
      this._detachedToolbarEl.remove();
    }
    this._detachedToolbarEl = null;
    this._toolbarEl = null;
    this._titleEl = null;
    this._rootEl = null;
  }
}