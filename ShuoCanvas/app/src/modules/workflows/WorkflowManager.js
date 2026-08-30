import a1483_0x6d9f7c, { graphStore as a1483_0x7a668e, uiStore as a1483_0x521c0b, workspaceStore as a1483_0x5c3238 } from "../../core/stores/appStore.js";
import { screenToWorld } from "../../core/math.js";
import { getLocale, t } from "../../i18n/index.js";
import { commit } from "../history.js";
import { applyWorkflowToCanvas, sliceCanvasStateForWorkflow, normalizeWorkflowTags, WORKFLOW_LIMITS } from "./workflowCanvas.js";
import { DEFAULT_WORKFLOW_COVER_ID, createWorkflowSnapshotCoverCandidate, extractWorkflowCoverCandidates, getDefaultWorkflowCoverCandidate } from "./workflowCovers.js";
import { buildWorkflowContentPreviewItems, buildWorkflowSourceSummary } from "./workflowPreview.js";
import { filterWorkflows, findWorkflowById } from "./workflowSelectors.js";
import { deleteWorkflow, loadWorkflowsFromServer, renameWorkflow, saveNewWorkflowFromCanvas, saveWorkflowMeta, saveUpdatedWorkflowFromCanvas, saveWorkflowUsage } from "./workflowService.js";
import { playWorkflowSaveFly } from "./workflowSaveAnimation.js";
import { registerSidebarSubmenu } from "../sidebarSubmenuController.js";
import { showContextMenu } from "../interaction/contextMenuPresenter.js";
import { TEXT_CONTEXT_MENU_TARGET_SELECTOR } from "../textInputContextMenu.js";
const graphStore = a1483_0x6d9f7c?.graphStore || a1483_0x7a668e || a1483_0x6d9f7c;
const uiStore = a1483_0x6d9f7c?.uiStore || a1483_0x521c0b || a1483_0x6d9f7c;
const workspaceStore = a1483_0x6d9f7c?.workspaceStore || a1483_0x5c3238 || a1483_0x6d9f7c;
function getState() {
  return {
    ...graphStore.getState(),
    ...uiStore.getState(),
    ...workspaceStore.getState()
  };
}
function getStateRaw() {
  return {
    ...graphStore.getStateRaw(),
    ...uiStore.getStateRaw(),
    ...workspaceStore.getStateRaw()
  };
}
function el(_0x4dbb92, _0xdd6f77 = "", _0x16f313 = "") {
  const _0x154a28 = document.createElement(_0x4dbb92);
  if (_0xdd6f77) {
    _0x154a28.className = _0xdd6f77;
  }
  if (_0x16f313) {
    _0x154a28.textContent = _0x16f313;
  }
  return _0x154a28;
}
function cleanText(_0x2a5ffd) {
  return String(_0x2a5ffd ?? "").trim();
}
function workflowText(_0x30c473, _0x26df5c = {}) {
  return t("workflows.manager." + _0x30c473, _0x26df5c);
}
function formatDateTime(_0x3c5a58) {
  const _0x4797f0 = Number(_0x3c5a58);
  if (!Number.isFinite(_0x4797f0) || _0x4797f0 <= 0) {
    return workflowText("unknown");
  }
  return new Date(_0x4797f0).toLocaleString(getLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatShortDate(_0x53468b) {
  const _0x2279fd = Number(_0x53468b);
  if (!Number.isFinite(_0x2279fd) || _0x2279fd <= 0) {
    return workflowText("unknown");
  }
  return new Date(_0x2279fd).toLocaleDateString(getLocale(), {
    month: "2-digit",
    day: "2-digit"
  });
}
function formatWorkflowMetaLine(_0x5c581f) {
  const _0x43cc80 = Number(_0x5c581f?.nodeCount || _0x5c581f?.workflowData?.nodes?.length || 0) || 0;
  const _0x31b0b5 = Number(_0x5c581f?.edgeCount || _0x5c581f?.workflowData?.edges?.length || 0) || 0;
  const _0x3f0c27 = Number(_0x5c581f?.lastUsedAt || 0) || 0;
  const _0x1c655b = Number(_0x5c581f?.updatedAt || 0) || 0;
  const _0x1fd57b = _0x3f0c27 > 0 ? workflowText("meta.used", {
    date: formatShortDate(_0x3f0c27)
  }) : workflowText("meta.updated", {
    date: formatShortDate(_0x1c655b)
  });
  return workflowText("meta.line", {
    nodeCount: _0x43cc80,
    edgeCount: _0x31b0b5,
    time: _0x1fd57b
  });
}
function showToast(_0xe72255, _0x4a915a = "info") {
  window.showToast?.(_0xe72255, _0x4a915a);
}
function appendCoverPlaceholder(_0x110a73, _0x77df0a = "SHUO Canvas") {
  if (!_0x110a73) {
    return;
  }
  _0x110a73.replaceChildren(el("div", "v2-workflow-cover-placeholder", _0x77df0a));
}
const WORKFLOW_UPDATE_ENTRY_ENABLED = false;
const WORKFLOW_MODAL_TABS_ENABLED = WORKFLOW_UPDATE_ENTRY_ENABLED;
function buildWorkflowListRenderKey(_0x192502 = []) {
  if (!Array.isArray(_0x192502)) {
    return "";
  }
  return _0x192502.map(_0x2fb4c5 => {
    const _0x7a4cc3 = Array.isArray(_0x2fb4c5?.tags) ? _0x2fb4c5.tags.map(cleanText).filter(Boolean).join(",") : "";
    return [cleanText(_0x2fb4c5?.id), cleanText(_0x2fb4c5?.name), cleanText(_0x2fb4c5?.cover || _0x2fb4c5?.coverUrl), cleanText(_0x2fb4c5?.note), _0x7a4cc3, Number(_0x2fb4c5?.updatedAt || 0) || 0, Number(_0x2fb4c5?.nodeCount || 0) || 0, Number(_0x2fb4c5?.edgeCount || 0) || 0].join("|");
  }).join(";");
}
export class WorkflowManager {
  constructor() {
    this.sidebarPanel = null;
    this.sidebarContent = null;
    this.modal = null;
    this.modalDialog = null;
    this.modalBody = null;
    this._hideTimer = 0;
    this._loadingPromise = null;
    this._pendingDeleteWorkflowId = "";
    this._renamingWorkflowId = "";
    this._contextMenuSession = null;
    this.initSidebarPanel();
    this.initModal();
    this.bindGlobalEvents();
    this.loadWorkflows();
    workspaceStore.subscribeSelector(_0x5380d5 => ({
      workflowsKey: buildWorkflowListRenderKey(_0x5380d5.workflows?.items),
      workflowsLoading: _0x5380d5.workflows?.loading === true,
      workflowsError: _0x5380d5.workflows?.error || null,
      panelOpen: _0x5380d5.workflowUi?.panelOpen,
      panelPinned: _0x5380d5.workflowUi?.panelPinned,
      searchKeyword: _0x5380d5.workflowUi?.searchKeyword,
      detailWorkflowId: _0x5380d5.workflowUi?.detailWorkflowId
    }), () => this.renderSidebar());
  }
  bindGlobalEvents() {
    const _0x4907ad = _0x43003f => {
      _0x43003f?.preventDefault?.();
      this.openCreateModal(_0x43003f?.detail?.groupId || null);
    };
    document.addEventListener("workflow:create-request", _0x4907ad);
    window.addEventListener("workflow:create-request", _0x4907ad);
  }
  initSidebarPanel() {
    const _0x10ddc9 = document.querySelector(".sidebar-floating") || document.body;
    const _0x10eb6b = document.getElementById("btnWorkflows");
    this.sidebarPanel = el("div", "v2-workflow-sidebar-panel canvas-toolbar-panel-surface");
    this.sidebarPanel.setAttribute("aria-label", workflowText("sidebarAria"));
    const _0x159372 = el("div", "v2-workflow-sidebar-header");
    const _0x343515 = el("button", "v2-workflow-back", "‹");
    _0x343515.type = "button";
    _0x343515.dataset.action = "workflow-back";
    const _0x144f90 = el("div", "v2-workflow-sidebar-title");
    this.sidebarTitleTextEl = el("span", "v2-workflow-title-text", workflowText("title"));
    _0x144f90.appendChild(this.sidebarTitleTextEl);
    _0x159372.append(_0x343515, _0x144f90);
    const _0x20adde = el("div", "v2-workflow-search");
    const _0x3e1b8a = el("input", "v2-workflow-search-input");
    _0x3e1b8a.type = "search";
    _0x3e1b8a.placeholder = workflowText("searchPlaceholder");
    _0x3e1b8a.dataset.role = "workflow-search";
    _0x20adde.appendChild(_0x3e1b8a);
    this.sidebarContent = el("div", "v2-workflow-list");
    this.sidebarPanel.append(_0x159372, _0x20adde, this.sidebarContent);
    _0x10ddc9.appendChild(this.sidebarPanel);
    if (_0x10eb6b) {
      registerSidebarSubmenu({
        key: "workflows",
        button: _0x10eb6b,
        panel: this.sidebarPanel,
        open: () => this.openSidebar(false),
        close: () => {
          this.hideSidebar();
          workspaceStore.setWorkflowUi({
            panelOpen: false,
            panelPinned: false,
            detailWorkflowId: null
          });
        },
        isOpen: () => getState().workflowUi?.panelOpen === true
      });
    }
    this.sidebarPanel.addEventListener("click", _0x5083e1 => this.handleSidebarClick(_0x5083e1));
    this.sidebarPanel.addEventListener("contextmenu", _0xe0425f => this.handleSidebarContextMenu(_0xe0425f));
    this.sidebarPanel.addEventListener("keydown", _0x37d79c => {
      if (_0x37d79c.target?.dataset?.role !== "workflow-rename-input") {
        return;
      }
      this.handleSidebarRenameKeydown(_0x37d79c);
    });
    this.sidebarPanel.addEventListener("focusout", _0x2fcffc => {
      const _0x515637 = _0x2fcffc.target;
      if (_0x515637?.dataset?.role !== "workflow-rename-input") {
        return;
      }
      if (_0x515637.dataset.submitted === "1") {
        return;
      }
      this.commitWorkflowRename(_0x515637.dataset.workflowId, _0x515637.value);
    });
    this.sidebarPanel.addEventListener("input", _0x542b3f => {
      const _0xb2cbfc = _0x542b3f.target;
      if (_0xb2cbfc?.dataset?.role !== "workflow-search") {
        return;
      }
      workspaceStore.setWorkflowUi({
        searchKeyword: _0xb2cbfc.value || ""
      });
    });
  }
  initModal() {
    this.modal = el("div", "v2-workflow-modal-backdrop");
    this.modal.setAttribute("aria-hidden", "true");
    this.modalDialog = el("div", "v2-workflow-modal");
    this.modalDialog.setAttribute("role", "dialog");
    this.modalDialog.setAttribute("aria-label", workflowText("title"));
    const _0x18b559 = el("div", "v2-workflow-modal-header");
    const _0xb6c207 = el("div", "v2-workflow-modal-title");
    this.modalTitleTextEl = el("span", "v2-workflow-title-text", workflowText("title"));
    _0xb6c207.appendChild(this.modalTitleTextEl);
    const _0x2b01c3 = el("button", "v2-workflow-icon-btn", "×");
    _0x2b01c3.type = "button";
    _0x2b01c3.dataset.action = "workflow-modal-close";
    _0x18b559.append(_0xb6c207, _0x2b01c3);
    this.modalBody = el("div", "v2-workflow-modal-body");
    if (WORKFLOW_MODAL_TABS_ENABLED) {
      const _0x3fe307 = el("div", "v2-workflow-modal-tabs");
      const _0x4d012a = [["create", workflowText("tabs.create")]];
      if (WORKFLOW_UPDATE_ENTRY_ENABLED) {
        _0x4d012a.push(["update", workflowText("tabs.update")]);
      }
      for (const [_0x3664b0, _0x7455c] of _0x4d012a) {
        const _0x4a8038 = el("button", "v2-workflow-modal-tab", _0x7455c);
        _0x4a8038.type = "button";
        _0x4a8038.dataset.modalTab = _0x3664b0;
        _0x3fe307.appendChild(_0x4a8038);
      }
      this.modalDialog.append(_0x18b559, _0x3fe307, this.modalBody);
    } else {
      this.modalDialog.append(_0x18b559, this.modalBody);
    }
    this.modal.appendChild(this.modalDialog);
    document.body.appendChild(this.modal);
    this.modal.addEventListener("click", _0x237bda => {
      const _0x3fdf92 = _0x237bda.target.closest("[data-action]");
      if (_0x3fdf92?.dataset?.action === "workflow-modal-close") {
        this.closeModal();
        return;
      }
      if (_0x237bda.target === this.modal) {
        this.closeModal();
      }
    });
    this.modal.addEventListener("click", _0x1085a6 => this.handleModalClick(_0x1085a6));
    this.modal.addEventListener("input", _0x465c4b => this.handleModalInput(_0x465c4b));
    this.modal.addEventListener("keydown", _0x11a78d => this.handleModalKeydown(_0x11a78d));
  }
  async loadWorkflows() {
    if (this._loadingPromise) {
      return this._loadingPromise;
    }
    workspaceStore.setWorkflowsLoading(true);
    this._loadingPromise = loadWorkflowsFromServer().then(_0x3c5f92 => {
      const _0x333c69 = new Map();
      for (const _0x426ae2 of getState().workflows?.items || []) {
        if (_0x426ae2?.id) {
          _0x333c69.set(_0x426ae2.id, _0x426ae2);
        }
      }
      for (const _0x1699e7 of _0x3c5f92 || []) {
        if (_0x1699e7?.id) {
          _0x333c69.set(_0x1699e7.id, _0x1699e7);
        }
      }
      const _0x221bc9 = Array.from(_0x333c69.values());
      workspaceStore.setWorkflows(_0x221bc9);
      return _0x221bc9;
    }).catch(_0x3d76be => {
      workspaceStore.setWorkflowsLoading(false, _0x3d76be?.message || workflowText("loadFailed"));
      showToast(workflowText("loadFailed"), "error");
      return [];
    }).finally(() => {
      this._loadingPromise = null;
    });
    return this._loadingPromise;
  }
  openSidebar(_0x5a9eed = false) {
    clearTimeout(this._hideTimer);
    workspaceStore.setWorkflowUi({
      panelOpen: true,
      panelPinned: _0x5a9eed === true
    });
    const _0x2334e3 = getState().workflows || {};
    if (!_0x2334e3.loadedAt && !_0x2334e3.loading) {
      this.loadWorkflows();
    }
  }
  scheduleCloseSidebar() {
    clearTimeout(this._hideTimer);
    this._hideTimer = window.setTimeout(() => {
      const _0x3715af = getState().workflowUi || {};
      if (!_0x3715af.panelPinned) {
        this.hideSidebar();
        workspaceStore.setWorkflowUi({
          panelOpen: false
        });
      }
    }, 180);
  }
  hideSidebar() {
    clearTimeout(this._hideTimer);
    this._contextMenuSession?.close?.();
    this._contextMenuSession = null;
    this._pendingDeleteWorkflowId = "";
    this._renamingWorkflowId = "";
    this.sidebarPanel?.classList.remove("show");
    const _0xc4a331 = document.getElementById("btnWorkflows");
    _0xc4a331?.classList.remove("active");
  }
  renderSidebar() {
    if (!this.sidebarPanel || !this.sidebarContent) {
      return;
    }
    this._contextMenuSession?.close?.();
    this._contextMenuSession = null;
    const _0x4119a0 = getState();
    const _0x22e6e8 = _0x4119a0.workflows?.items || [];
    const _0x42514c = _0x4119a0.workflows || {};
    const _0x1b823a = _0x4119a0.workflowUi || {};
    const _0x525d0d = document.getElementById("btnWorkflows");
    this.sidebarPanel.classList.toggle("show", _0x1b823a.panelOpen === true);
    _0x525d0d?.classList.toggle("active", _0x1b823a.panelOpen === true || _0x1b823a.panelPinned === true);
    const _0x21d750 = this.sidebarPanel.querySelector(".v2-workflow-back");
    _0x21d750?.classList.toggle("show", !!_0x1b823a.detailWorkflowId);
    if (this.sidebarTitleTextEl) {
      this.sidebarTitleTextEl.textContent = _0x1b823a.detailWorkflowId ? workflowText("detailTitle") : workflowText("title");
    }
    const _0x3a76e5 = this.sidebarPanel.querySelector("[data-role='workflow-search']");
    if (_0x3a76e5 && _0x3a76e5.value !== (_0x1b823a.searchKeyword || "")) {
      _0x3a76e5.value = _0x1b823a.searchKeyword || "";
    }
    this.sidebarContent.replaceChildren();
    if (_0x1b823a.detailWorkflowId) {
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      this.renderWorkflowDetail(_0x22e6e8, _0x1b823a.detailWorkflowId);
      return;
    }
    if (_0x42514c.loading) {
      this.renderLoadingList();
      return;
    }
    const _0x3012f2 = filterWorkflows(_0x22e6e8, _0x1b823a.searchKeyword);
    if (_0x3012f2.length === 0) {
      const _0x4dfe34 = cleanText(_0x1b823a.searchKeyword) ? workflowText("empty.noMatches") : workflowText("empty.noWorkflows");
      this.sidebarContent.appendChild(this.renderEmpty(_0x4dfe34));
      return;
    }
    for (const _0x480679 of _0x3012f2) {
      this.sidebarContent.appendChild(this.renderWorkflowCard(_0x480679));
    }
  }
  renderLoadingList() {
    for (let _0x2b1ee6 = 0; _0x2b1ee6 < 4; _0x2b1ee6++) {
      this.sidebarContent.appendChild(el("div", "v2-workflow-skeleton"));
    }
  }
  renderEmpty(_0x538ca4) {
    const _0x568a96 = el("div", "v2-workflow-empty");
    const _0xa83a7 = el("div", "v2-workflow-empty-text", _0x538ca4);
    _0x568a96.appendChild(_0xa83a7);
    return _0x568a96;
  }
  renderCover(_0x39bed4, _0x5a04e8 = "v2-workflow-cover", _0x455c8d = "SHUO Canvas") {
    const _0x590de4 = el("div", _0x5a04e8);
    const _0x159031 = cleanText(_0x39bed4);
    appendCoverPlaceholder(_0x590de4, _0x455c8d);
    if (_0x159031) {
      const _0x230c20 = el("img");
      _0x230c20.src = _0x159031;
      _0x230c20.alt = workflowText("coverAlt");
      _0x230c20.draggable = false;
      _0x230c20.decoding = "async";
      _0x230c20.addEventListener("load", () => {
        if (_0x590de4.isConnected) {
          _0x590de4.replaceChildren(_0x230c20);
        }
      }, {
        once: true
      });
    }
    return _0x590de4;
  }
  renderWorkflowCard(_0x44fa3b) {
    const _0x2c5955 = el("article", "v2-workflow-card");
    const _0x4c3e5e = String(_0x44fa3b?.id || "");
    _0x2c5955.dataset.workflowId = _0x4c3e5e;
    _0x2c5955.dataset.action = "workflow-view";
    _0x2c5955.appendChild(this.renderCover(_0x44fa3b.cover));
    const _0x53c1ce = getState().workflowUi?.applyingWorkflowId;
    const _0x25a982 = el("button", "v2-workflow-card-load");
    _0x25a982.type = "button";
    _0x25a982.dataset.action = "workflow-apply";
    _0x25a982.dataset.workflowId = _0x4c3e5e;
    _0x25a982.disabled = _0x53c1ce === _0x44fa3b.id;
    _0x25a982.title = workflowText("loadToCanvas");
    _0x25a982.setAttribute("aria-label", workflowText("loadToCanvas"));
    _0x25a982.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16.5 5.5a7.5 7.5 0 1 0-1 13.5\"/><path d=\"M12 14h6v6\"/><path d=\"m18 14-6 6\"/></svg>";
    const _0x31ce3c = el("button", "v2-workflow-card-delete");
    _0x31ce3c.type = "button";
    _0x31ce3c.dataset.action = "workflow-delete-open";
    _0x31ce3c.dataset.workflowId = _0x4c3e5e;
    _0x31ce3c.setAttribute("aria-label", workflowText("deleteWorkflow"));
    _0x31ce3c.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z\"/></svg>";
    const _0x1d4c5f = el("div", "v2-workflow-card-delete-confirm");
    _0x1d4c5f.hidden = this._pendingDeleteWorkflowId !== _0x4c3e5e;
    const _0x4637a6 = el("button", "v2-workflow-card-delete-confirm-btn v2-workflow-card-delete-confirm-btn--danger", "✔");
    _0x4637a6.type = "button";
    _0x4637a6.dataset.action = "workflow-delete-confirm";
    _0x4637a6.dataset.workflowId = _0x4c3e5e;
    _0x4637a6.setAttribute("aria-label", workflowText("confirm"));
    const _0x4e7a9c = el("button", "v2-workflow-card-delete-confirm-btn v2-workflow-card-delete-confirm-btn--neutral", "×");
    _0x4e7a9c.type = "button";
    _0x4e7a9c.dataset.action = "workflow-delete-cancel";
    _0x4e7a9c.dataset.workflowId = _0x4c3e5e;
    _0x4e7a9c.setAttribute("aria-label", workflowText("cancel"));
    _0x1d4c5f.append(_0x4637a6, _0x4e7a9c);
    _0x31ce3c.hidden = this._pendingDeleteWorkflowId === _0x4c3e5e;
    _0x2c5955.append(_0x25a982, _0x31ce3c, _0x1d4c5f);
    const _0xb67cf3 = el("div", "v2-workflow-card-info");
    const _0x1fe61f = el("div", "v2-workflow-card-title");
    _0x1fe61f.dataset.action = "workflow-rename-open";
    _0x1fe61f.dataset.workflowId = _0x4c3e5e;
    if (this._renamingWorkflowId === _0x4c3e5e) {
      _0x1fe61f.classList.add("is-editing");
      _0x1fe61f.removeAttribute("data-action");
      _0x1fe61f.removeAttribute("data-workflow-id");
      const _0x601ca4 = el("input", "v2-workflow-card-title-input");
      _0x601ca4.type = "text";
      _0x601ca4.value = _0x44fa3b.name || "";
      _0x601ca4.maxLength = WORKFLOW_LIMITS.nameMax;
      _0x601ca4.dataset.role = "workflow-rename-input";
      _0x601ca4.dataset.workflowId = _0x4c3e5e;
      _0x601ca4.setAttribute("aria-label", workflowText("name"));
      _0x1fe61f.appendChild(_0x601ca4);
      window.requestAnimationFrame(() => {
        if (!_0x601ca4.isConnected) {
          return;
        }
        _0x601ca4.focus();
        _0x601ca4.select?.();
      });
    } else {
      _0x1fe61f.textContent = _0x44fa3b.name || workflowText("unnamedWorkflow");
    }
    _0xb67cf3.appendChild(_0x1fe61f);
    const _0x1c7938 = cleanText(_0x44fa3b.note);
    const _0x379dee = el("button", "v2-workflow-note-hint", "!");
    _0x379dee.type = "button";
    _0x379dee.dataset.note = _0x1c7938 || workflowText("empty.noNote");
    _0x379dee.title = _0x1c7938 || workflowText("empty.noNote");
    _0x379dee.setAttribute("aria-label", _0x1c7938 ? workflowText("noteAria", {
      note: _0x1c7938
    }) : workflowText("empty.noNote"));
    _0xb67cf3.appendChild(_0x379dee);
    if (_0x53c1ce === _0x44fa3b.id) {
      _0x2c5955.classList.add("is-applying");
    }
    _0x2c5955.appendChild(_0xb67cf3);
    return _0x2c5955;
  }
  renderWorkflowDetail(_0x1bf508, _0x2354f5) {
    const _0x4e3cba = findWorkflowById(_0x1bf508, _0x2354f5);
    if (!_0x4e3cba) {
      this.sidebarContent.appendChild(this.renderEmpty(workflowText("workflowMissing")));
      return;
    }
    const _0x15b2b8 = el("div", "v2-workflow-detail");
    _0x15b2b8.appendChild(this.renderCover(_0x4e3cba.cover, "v2-workflow-detail-cover"));
    _0x15b2b8.appendChild(el("div", "v2-workflow-detail-title", _0x4e3cba.name));
    _0x15b2b8.appendChild(el("div", "v2-workflow-detail-meta", formatWorkflowMetaLine(_0x4e3cba)));
    const _0x51ca7d = (_0x4e3cba.tags || []).map(_0x3e8ab8 => cleanText(_0x3e8ab8)).filter(Boolean);
    if (_0x51ca7d.length > 0) {
      const _0x1068b4 = el("div", "v2-workflow-tags");
      for (const _0x45fb03 of _0x51ca7d) {
        _0x1068b4.appendChild(el("span", "v2-workflow-tag", _0x45fb03));
      }
      _0x15b2b8.appendChild(_0x1068b4);
    }
    const _0x324f7c = el("section", "v2-workflow-detail-section");
    _0x324f7c.appendChild(el("div", "v2-workflow-detail-section-title", workflowText("content")));
    const _0x4273e7 = buildWorkflowContentPreviewItems(_0x4e3cba);
    if (_0x4273e7.length === 0) {
      _0x324f7c.appendChild(this.renderEmpty(workflowText("empty.noPreviewContent")));
    } else {
      const _0x1328e5 = el("div", "v2-workflow-content-list");
      for (const _0x19a0a9 of _0x4273e7) {
        _0x1328e5.appendChild(this.renderWorkflowContentItem(_0x19a0a9));
      }
      _0x324f7c.appendChild(_0x1328e5);
    }
    _0x15b2b8.appendChild(_0x324f7c);
    const _0x4fc019 = cleanText(_0x4e3cba.note);
    if (_0x4fc019) {
      const _0x189ca2 = el("div", "v2-workflow-detail-note");
      _0x189ca2.textContent = _0x4fc019;
      _0x15b2b8.appendChild(_0x189ca2);
    }
    const _0x2d0d86 = el("div", "v2-workflow-detail-actions");
    if (WORKFLOW_UPDATE_ENTRY_ENABLED) {
      const _0x40e847 = el("button", "v2-workflow-secondary-btn", workflowText("editMeta"));
      _0x40e847.type = "button";
      _0x40e847.dataset.action = "workflow-edit-meta";
      _0x40e847.dataset.workflowId = _0x4e3cba.id;
      const _0x55d00d = el("button", "v2-workflow-secondary-btn", workflowText("updateContent"));
      _0x55d00d.type = "button";
      _0x55d00d.dataset.action = "workflow-open-update";
      _0x55d00d.dataset.workflowId = _0x4e3cba.id;
      _0x2d0d86.append(_0x40e847, _0x55d00d);
    }
    const _0x5dfd5c = el("button", "v2-workflow-primary-btn", workflowText("applyToCanvas"));
    _0x5dfd5c.type = "button";
    _0x5dfd5c.dataset.action = "workflow-apply";
    _0x5dfd5c.dataset.workflowId = _0x4e3cba.id;
    if (getState().workflowUi?.applyingWorkflowId === _0x4e3cba.id) {
      _0x5dfd5c.disabled = true;
      _0x5dfd5c.textContent = workflowText("applying");
    }
    _0x2d0d86.append(_0x5dfd5c);
    _0x15b2b8.appendChild(_0x2d0d86);
    this.sidebarContent.appendChild(_0x15b2b8);
  }
  renderWorkflowContentItem(_0xaba242) {
    const _0x16f7ac = el("article", "v2-workflow-content-item");
    _0x16f7ac.appendChild(this.renderCover(_0xaba242.thumbSrc, "v2-workflow-content-thumb", _0xaba242.placeholderLabel || workflowText("nodeFallback")));
    const _0x54b96c = el("div", "v2-workflow-content-info");
    _0x54b96c.appendChild(el("span", "v2-workflow-content-type", _0xaba242.typeLabel || workflowText("nodeFallback")));
    _0x54b96c.appendChild(el("div", "v2-workflow-content-title", _0xaba242.title || _0xaba242.typeLabel || workflowText("nodeFallback")));
    const _0x3e7014 = el("div", "v2-workflow-content-summary");
    _0x3e7014.textContent = _0xaba242.summary || workflowText("empty.noNodePreviewContent");
    _0x54b96c.appendChild(_0x3e7014);
    _0x16f7ac.appendChild(_0x54b96c);
    return _0x16f7ac;
  }
  playDeleteShake(_0x48e1eb) {
    if (!_0x48e1eb) {
      return;
    }
    _0x48e1eb.classList.remove("is-delete-shaking");
    _0x48e1eb.offsetWidth;
    _0x48e1eb.classList.add("is-delete-shaking");
    window.setTimeout(() => {
      if (_0x48e1eb.isConnected) {
        _0x48e1eb.classList.remove("is-delete-shaking");
      }
    }, 240);
  }
  findWorkflowCard(_0x3b6370) {
    const _0x12d631 = String(_0x3b6370 || "").trim();
    if (!_0x12d631 || !this.sidebarContent) {
      return null;
    }
    for (const _0x1a7b48 of this.sidebarContent.querySelectorAll(".v2-workflow-card")) {
      if (_0x1a7b48?.dataset?.workflowId === _0x12d631) {
        return _0x1a7b48;
      }
    }
    return null;
  }
  setWorkflowDeleteConfirm(_0x38318d, _0x2c54e7) {
    const _0x8329f8 = String(_0x38318d || "").trim();
    if (!_0x8329f8) {
      return false;
    }
    if (_0x2c54e7 && this._pendingDeleteWorkflowId && this._pendingDeleteWorkflowId !== _0x8329f8) {
      this.setWorkflowDeleteConfirm(this._pendingDeleteWorkflowId, false);
    }
    const _0x1b59d4 = this.findWorkflowCard(_0x8329f8);
    if (!_0x1b59d4) {
      return false;
    }
    const _0x3c61b3 = _0x1b59d4.querySelector(".v2-workflow-card-delete");
    const _0x7ed20c = _0x1b59d4.querySelector(".v2-workflow-card-delete-confirm");
    if (!_0x3c61b3 || !_0x7ed20c) {
      return false;
    }
    _0x3c61b3.hidden = _0x2c54e7;
    _0x7ed20c.hidden = !_0x2c54e7;
    _0x1b59d4.classList.toggle("is-delete-confirming", _0x2c54e7);
    this._pendingDeleteWorkflowId = _0x2c54e7 ? _0x8329f8 : this._pendingDeleteWorkflowId === _0x8329f8 ? "" : this._pendingDeleteWorkflowId;
    return true;
  }
  finishWorkflowRename(_0x3fcfdd, _0x57fb8d = "") {
    const _0x4be52b = String(_0x3fcfdd || "").trim();
    if (!_0x4be52b) {
      return false;
    }
    const _0x37acbd = this.findWorkflowCard(_0x4be52b);
    const _0x190b85 = _0x37acbd?.querySelector(".v2-workflow-card-title");
    if (!_0x190b85) {
      return false;
    }
    const _0x3ac844 = findWorkflowById(getState().workflows?.items || [], _0x4be52b);
    _0x190b85.classList.remove("is-editing");
    _0x190b85.dataset.action = "workflow-rename-open";
    _0x190b85.dataset.workflowId = _0x4be52b;
    _0x190b85.replaceChildren();
    _0x190b85.textContent = cleanText(_0x57fb8d || _0x3ac844?.name) || workflowText("unnamedWorkflow");
    if (this._renamingWorkflowId === _0x4be52b) {
      this._renamingWorkflowId = "";
    }
    return true;
  }
  startWorkflowRename(_0x8ea195) {
    const _0x4a74f6 = String(_0x8ea195 || "").trim();
    if (!_0x4a74f6) {
      return false;
    }
    if (this._renamingWorkflowId && this._renamingWorkflowId !== _0x4a74f6) {
      this.finishWorkflowRename(this._renamingWorkflowId);
    }
    if (this._pendingDeleteWorkflowId) {
      this.setWorkflowDeleteConfirm(this._pendingDeleteWorkflowId, false);
    }
    const _0x441f21 = findWorkflowById(getState().workflows?.items || [], _0x4a74f6);
    const _0x4143a0 = this.findWorkflowCard(_0x4a74f6);
    const _0x45cf0d = _0x4143a0?.querySelector(".v2-workflow-card-title");
    if (!_0x441f21 || !_0x45cf0d) {
      return false;
    }
    this._renamingWorkflowId = _0x4a74f6;
    _0x45cf0d.classList.add("is-editing");
    _0x45cf0d.removeAttribute("data-action");
    _0x45cf0d.removeAttribute("data-workflow-id");
    const _0x5e2661 = el("input", "v2-workflow-card-title-input");
    _0x5e2661.type = "text";
    _0x5e2661.value = _0x441f21.name || "";
    _0x5e2661.maxLength = WORKFLOW_LIMITS.nameMax;
    _0x5e2661.dataset.role = "workflow-rename-input";
    _0x5e2661.dataset.workflowId = _0x4a74f6;
    _0x5e2661.setAttribute("aria-label", workflowText("name"));
    _0x45cf0d.replaceChildren(_0x5e2661);
    window.requestAnimationFrame(() => {
      if (!_0x5e2661.isConnected) {
        return;
      }
      _0x5e2661.focus();
      _0x5e2661.select?.();
    });
    return true;
  }
  handleSidebarClick(_0x2e3923) {
    const _0x56e7ec = _0x2e3923.target.closest("[data-action]");
    const _0x25d32f = _0x56e7ec?.dataset?.action;
    if (_0x25d32f === "workflow-back") {
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      workspaceStore.setWorkflowUi({
        detailWorkflowId: null
      });
      return;
    }
    if (_0x25d32f === "workflow-open-create") {
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      this.openCreateModal(null);
      return;
    }
    const _0xc9b443 = _0x56e7ec?.dataset?.workflowId;
    if (_0x25d32f === "workflow-delete-open" && _0xc9b443) {
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      if (this._renamingWorkflowId) {
        this.finishWorkflowRename(this._renamingWorkflowId);
      }
      if (!this.setWorkflowDeleteConfirm(_0xc9b443, true)) {
        this.renderSidebar();
      }
      return;
    }
    if (_0x25d32f === "workflow-delete-cancel") {
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      if (!this.setWorkflowDeleteConfirm(_0xc9b443, false)) {
        this._pendingDeleteWorkflowId = "";
        this.renderSidebar();
      }
      return;
    }
    if (_0x25d32f === "workflow-delete-confirm" && _0xc9b443) {
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      this.deleteWorkflowById(_0xc9b443);
      return;
    }
    if (_0x25d32f === "workflow-rename-open" && _0xc9b443) {
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      if (!this.startWorkflowRename(_0xc9b443)) {
        this._renamingWorkflowId = String(_0xc9b443);
        this.renderSidebar();
      }
      return;
    }
    if (_0x25d32f === "workflow-card-apply" && _0xc9b443) {
      if (_0x2e3923.target.closest("button, input, textarea, select") || _0x2e3923.target.closest(".v2-workflow-card-title")) {
        return;
      }
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      this.applyWorkflow(_0xc9b443);
      return;
    }
    if (_0x25d32f === "workflow-view" && _0xc9b443) {
      if (_0x2e3923.target.closest("button, input, textarea, select") || _0x2e3923.target.closest(".v2-workflow-card-title")) {
        return;
      }
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      workspaceStore.setWorkflowUi({
        detailWorkflowId: _0xc9b443
      });
      return;
    }
    if (_0x25d32f === "workflow-edit-meta" && _0xc9b443) {
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      this.openUpdateModal(_0xc9b443, {
        metaOnly: true
      });
      return;
    }
    if (_0x25d32f === "workflow-open-update" && _0xc9b443) {
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      this.openUpdateModal(_0xc9b443, {
        metaOnly: false
      });
      return;
    }
    if (_0x25d32f === "workflow-apply" && _0xc9b443) {
      _0x2e3923.preventDefault();
      _0x2e3923.stopPropagation();
      this._pendingDeleteWorkflowId = "";
      this._renamingWorkflowId = "";
      this.applyWorkflow(_0xc9b443);
      return;
    }
  }
  handleSidebarContextMenu(_0x27d3fe) {
    if (_0x27d3fe.target?.closest?.("select, " + TEXT_CONTEXT_MENU_TARGET_SELECTOR)) {
      return;
    }
    const _0x5b4691 = _0x27d3fe.target?.closest?.(".v2-workflow-card");
    if (!_0x5b4691 || !this.sidebarPanel?.contains?.(_0x5b4691)) {
      return;
    }
    const _0x5a8c61 = String(_0x5b4691.dataset.workflowId || "").trim();
    const _0x562c9e = findWorkflowById(getState().workflows?.items || [], _0x5a8c61);
    if (!_0x562c9e) {
      return;
    }
    _0x27d3fe.preventDefault();
    _0x27d3fe.stopPropagation();
    const _0x224964 = getState().workflowUi?.applyingWorkflowId;
    const _0x3d40d7 = [{
      label: workflowText("detailTitle"),
      action: () => {
        this._pendingDeleteWorkflowId = "";
        this._renamingWorkflowId = "";
        workspaceStore.setWorkflowUi({
          detailWorkflowId: _0x5a8c61
        });
      }
    }, {
      label: workflowText("loadToCanvas"),
      disabled: _0x224964 === _0x5a8c61,
      action: () => {
        this._pendingDeleteWorkflowId = "";
        this._renamingWorkflowId = "";
        this.applyWorkflow(_0x5a8c61);
      }
    }, {
      label: workflowText("rename"),
      action: () => {
        if (!this.startWorkflowRename(_0x5a8c61)) {
          this._renamingWorkflowId = _0x5a8c61;
          this.renderSidebar();
        }
      }
    }];
    _0x3d40d7.push({
      label: workflowText("editMeta"),
      disabled: !WORKFLOW_UPDATE_ENTRY_ENABLED,
      action: () => this.openUpdateModal(_0x5a8c61, {
        metaOnly: true
      })
    }, {
      label: workflowText("updateContent"),
      disabled: !WORKFLOW_UPDATE_ENTRY_ENABLED,
      action: () => this.openUpdateModal(_0x5a8c61, {
        metaOnly: false
      })
    });
    _0x3d40d7.push("sep", {
      label: workflowText("deleteWorkflow"),
      danger: true,
      action: () => {
        if (this._renamingWorkflowId) {
          this.finishWorkflowRename(this._renamingWorkflowId);
        }
        if (!this.setWorkflowDeleteConfirm(_0x5a8c61, true)) {
          this.renderSidebar();
        }
      }
    });
    this._contextMenuSession = showContextMenu(_0x27d3fe.clientX, _0x27d3fe.clientY, _0x3d40d7, {
      ownerElement: _0x5b4691,
      ownerRoot: this.sidebarPanel
    });
  }
  handleSidebarRenameKeydown(_0x4c90ec) {
    const _0x57a956 = _0x4c90ec.target;
    const _0xaa0d88 = _0x57a956?.dataset?.workflowId;
    if (!_0xaa0d88) {
      return;
    }
    if (_0x4c90ec.key === "Enter") {
      _0x4c90ec.preventDefault();
      _0x4c90ec.stopPropagation();
      _0x57a956.dataset.submitted = "1";
      this.commitWorkflowRename(_0xaa0d88, _0x57a956.value);
      return;
    }
    if (_0x4c90ec.key === "Escape") {
      _0x4c90ec.preventDefault();
      _0x4c90ec.stopPropagation();
      if (!this.finishWorkflowRename(_0xaa0d88)) {
        this._renamingWorkflowId = "";
        this.renderSidebar();
      }
    }
  }
  async commitWorkflowRename(_0xf28b2d, _0x30a270) {
    const _0x48f1eb = String(_0xf28b2d || "").trim();
    const _0x4a64d4 = cleanText(_0x30a270);
    if (!_0x48f1eb) {
      return;
    }
    if (!_0x4a64d4) {
      showToast(workflowText("errors.nameRequired"), "error");
      return;
    }
    const _0x381bc3 = findWorkflowById(getState().workflows?.items || [], _0x48f1eb);
    if (!_0x381bc3) {
      return;
    }
    if (cleanText(_0x381bc3.name) === _0x4a64d4) {
      if (!this.finishWorkflowRename(_0x48f1eb, _0x381bc3.name)) {
        this._renamingWorkflowId = "";
        this.renderSidebar();
      }
      return;
    }
    let _0xdab9df = null;
    try {
      _0xdab9df = await renameWorkflow(_0x381bc3, _0x4a64d4);
      this.finishWorkflowRename(_0x48f1eb, _0xdab9df?.name || _0x4a64d4);
      workspaceStore.upsertWorkflow(_0xdab9df);
      showToast(workflowText("renamed"), "success");
    } catch (_0x183385) {
      this.finishWorkflowRename(_0x48f1eb, _0x381bc3.name);
      showToast(_0x183385?.message || workflowText("renameFailed"), "error");
    } finally {
      this._renamingWorkflowId = "";
    }
  }
  async deleteWorkflowById(_0x4cbcdf) {
    const _0x424137 = String(_0x4cbcdf || "").trim();
    if (!_0x424137) {
      return;
    }
    this.setWorkflowDeleteConfirm(_0x424137, false);
    this._pendingDeleteWorkflowId = "";
    this._renamingWorkflowId = "";
    try {
      await deleteWorkflow(_0x424137);
      const _0x382ab1 = getState();
      const _0x358fd8 = (_0x382ab1.workflows?.items || []).filter(_0xadd34a => String(_0xadd34a?.id || "") !== _0x424137);
      workspaceStore.setWorkflows(_0x358fd8);
      if (_0x382ab1.workflowUi?.detailWorkflowId === _0x424137) {
        workspaceStore.setWorkflowUi({
          detailWorkflowId: null
        });
      }
      showToast(workflowText("deleted"), "success");
    } catch (_0x32c62f) {
      showToast(_0x32c62f?.message || workflowText("deleteFailed"), "error");
    }
  }
  openCreateModal(_0xf09de9 = null) {
    workspaceStore.openWorkflowModal({
      tab: "create",
      sourceGroupId: _0xf09de9
    });
    this.resetCreateDraftFromCurrentSource();
    this.renderModal();
  }
  openUpdateModal(_0x29f5e0, {
    metaOnly = false
  } = {}) {
    workspaceStore.openWorkflowModal({
      tab: "update",
      sourceGroupId: null
    });
    workspaceStore.setWorkflowUi({
      updateMetaOnly: metaOnly === true
    });
    this.selectUpdateTarget(_0x29f5e0, {
      render: false
    });
    this.renderModal();
  }
  resetCreateDraftFromCurrentSource() {
    const _0x1594e1 = this.getWorkflowSourceCanvasState();
    const _0x4da8b2 = this.getWorkflowSourceContext();
    const _0x227d48 = buildWorkflowSourceSummary(_0x1594e1, _0x4da8b2);
    const _0x21d435 = this.getCoverCandidates(null, _0x1594e1)[0] || getDefaultWorkflowCoverCandidate();
    workspaceStore.resetWorkflowDraft({
      name: _0x227d48.isEmpty ? "" : _0x227d48.suggestedName,
      tags: _0x227d48.isEmpty ? [] : _0x227d48.suggestedTags,
      cover: _0x21d435.src || "",
      selectedCoverId: _0x21d435.id
    });
  }
  closeModal() {
    workspaceStore.closeWorkflowModal();
    this.renderModal();
  }
  getWorkflowSourceCanvasState() {
    const _0x4e4692 = getState();
    const _0x3702b0 = getStateRaw();
    return sliceCanvasStateForWorkflow(graphStore.serialize(), _0x3702b0?.nodes || {}, _0x4e4692.workflowUi?.sourceGroupId);
  }
  getWorkflowSourceContext() {
    const _0x348cd5 = getState();
    const _0x49e251 = getStateRaw();
    const _0x322052 = cleanText(_0x348cd5.workflowUi?.sourceGroupId);
    const _0x57195d = _0x322052 ? _0x49e251?.nodes?.[_0x322052] : null;
    return {
      sourceGroupId: _0x322052 || "",
      sourceLabel: _0x322052 ? workflowText("source.currentGroup") : workflowText("source.wholeCanvas"),
      sourceName: cleanText(_0x57195d?.name || _0x57195d?.title || _0x57195d?.label)
    };
  }
  getWorkflowSourceSummary(_0x3e1c36 = this.getWorkflowSourceCanvasState(), _0x1e6a50 = {}) {
    return buildWorkflowSourceSummary(_0x3e1c36, {
      ...this.getWorkflowSourceContext(),
      ..._0x1e6a50
    });
  }
  getCoverCandidates(_0x71710c = null, _0x2617b4 = this.getWorkflowSourceCanvasState()) {
    const _0x1ffd9b = createWorkflowSnapshotCoverCandidate(_0x2617b4);
    const _0x43aaa = extractWorkflowCoverCandidates(_0x2617b4?.nodes);
    const _0x49a285 = [];
    if (_0x71710c?.src) {
      _0x49a285.push(_0x71710c);
    }
    if (_0x1ffd9b?.src) {
      _0x49a285.push(_0x1ffd9b);
    }
    _0x49a285.push(..._0x43aaa);
    if (_0x49a285.length === 0) {
      _0x49a285.push(getDefaultWorkflowCoverCandidate());
    }
    const _0x110174 = new Set();
    return _0x49a285.filter(_0xa4a841 => {
      const _0x2710e0 = _0xa4a841.src || _0xa4a841.id;
      if (_0x110174.has(_0x2710e0)) {
        return false;
      }
      _0x110174.add(_0x2710e0);
      return true;
    });
  }
  getUpdateCoverCandidates(_0x5139a7, _0xf349ed = null) {
    const _0x4c04cc = getState().workflowUi || {};
    if (_0x4c04cc.updateMetaOnly && _0x5139a7?.workflowData) {
      return this.getCoverCandidates(_0xf349ed, _0x5139a7.workflowData);
    }
    return this.getCoverCandidates(_0xf349ed);
  }
  renderModal() {
    if (!this.modal || !this.modalBody) {
      return;
    }
    const _0x312085 = getState();
    const _0x2af3a3 = _0x312085.workflowUi || {};
    this.modal.classList.toggle("show", _0x2af3a3.modalOpen === true);
    this.modal.setAttribute("aria-hidden", _0x2af3a3.modalOpen === true ? "false" : "true");
    if (!_0x2af3a3.modalOpen) {
      this.modalBody.replaceChildren();
      return;
    }
    for (const _0x486fb4 of this.modal.querySelectorAll(".v2-workflow-modal-tab")) {
      _0x486fb4.classList.toggle("active", _0x486fb4.dataset.modalTab === (_0x2af3a3.modalTab || "create"));
    }
    const _0x3b69af = _0x2af3a3.modalTab === "update" && !WORKFLOW_UPDATE_ENTRY_ENABLED ? "create" : _0x2af3a3.modalTab;
    if (this.modalTitleTextEl) {
      this.modalTitleTextEl.textContent = _0x3b69af === "update" ? _0x2af3a3.updateMetaOnly ? workflowText("modal.editMetaTitle") : workflowText("modal.updateTitle") : workflowText("modal.createTitle");
    }
    this.modalBody.replaceChildren();
    if (_0x3b69af === "update") {
      this.renderUpdateForm();
    } else {
      this.renderCreateForm();
    }
  }
  renderCreateForm() {
    const _0x49343a = getState();
    const _0x2d3dbb = _0x49343a.workflowUi || {};
    const _0x4b3c2c = this.getWorkflowSourceCanvasState();
    const _0x22f26f = this.getWorkflowSourceSummary(_0x4b3c2c);
    const _0x137a54 = el("div", "v2-workflow-create-layout");
    _0x137a54.appendChild(this.renderWorkflowSourcePanel(_0x22f26f));
    const _0x2346e5 = this.renderWorkflowMetaForm({
      mode: "create",
      candidates: this.getCoverCandidates(null, _0x4b3c2c),
      sourceSummary: _0x22f26f,
      submitText: _0x2d3dbb.saving ? workflowText("saving") : workflowText("createConfirm")
    });
    _0x137a54.appendChild(_0x2346e5);
    this.modalBody.appendChild(_0x137a54);
  }
  renderUpdateForm() {
    const _0xa525fa = getState();
    const _0x81225 = _0xa525fa.workflowUi || {};
    const _0x58657a = filterWorkflows(_0xa525fa.workflows?.items || [], _0x81225.updateSearchKeyword || "");
    const _0x265457 = el("div", "v2-workflow-create-layout v2-workflow-update-layout");
    const _0x5cb005 = el("section", "v2-workflow-update-picker v2-workflow-source-panel");
    const _0x1b04a0 = el("div", "v2-workflow-source-header");
    _0x1b04a0.appendChild(el("div", "v2-workflow-source-title", workflowText("updatePicker.title")));
    _0x1b04a0.appendChild(el("div", "v2-workflow-source-scope", workflowText("updatePicker.resultCount", {
      count: _0x58657a.length
    })));
    _0x5cb005.appendChild(_0x1b04a0);
    const _0x5ca094 = el("input", "v2-workflow-search-input");
    _0x5ca094.type = "search";
    _0x5ca094.placeholder = workflowText("updatePicker.searchPlaceholder");
    _0x5ca094.value = _0x81225.updateSearchKeyword || "";
    _0x5ca094.dataset.role = "workflow-update-search";
    _0x5cb005.appendChild(_0x5ca094);
    const _0xa37c1d = el("div", "v2-workflow-update-list");
    if (_0x58657a.length === 0) {
      const _0x47eed6 = el("div", "v2-workflow-source-empty");
      _0x47eed6.textContent = cleanText(_0x81225.updateSearchKeyword) ? workflowText("empty.noMatches") : workflowText("empty.noWorkflows");
      _0xa37c1d.appendChild(_0x47eed6);
    } else {
      for (const _0x3e5d45 of _0x58657a) {
        const _0x4429d4 = el("button", "v2-workflow-update-item");
        _0x4429d4.type = "button";
        _0x4429d4.dataset.action = "workflow-update-select";
        _0x4429d4.dataset.workflowId = _0x3e5d45.id;
        _0x4429d4.classList.toggle("active", _0x81225.updateTargetId === _0x3e5d45.id);
        _0x4429d4.append(this.renderCover(_0x3e5d45.cover, "v2-workflow-update-thumb"));
        const _0x8bae1d = el("div", "v2-workflow-update-info");
        _0x8bae1d.append(el("span", "", _0x3e5d45.name), el("small", "", formatDateTime(_0x3e5d45.updatedAt)));
        _0x4429d4.appendChild(_0x8bae1d);
        _0xa37c1d.appendChild(_0x4429d4);
      }
    }
    _0x5cb005.appendChild(_0xa37c1d);
    _0x265457.appendChild(_0x5cb005);
    const _0x3b16f7 = findWorkflowById(_0xa525fa.workflows?.items || [], _0x81225.updateTargetId);
    const _0x5185b3 = el("div", "v2-workflow-update-editor");
    if (_0x3b16f7) {
      const _0x356b1f = this.getWorkflowSourceCanvasState();
      const _0x1bff9e = this.getWorkflowSourceSummary(_0x356b1f);
      const _0x2063e0 = buildWorkflowSourceSummary(_0x3b16f7.workflowData, {
        sourceLabel: workflowText("source.historyWorkflow"),
        sourceName: _0x3b16f7.name
      });
      const _0x78f0e8 = _0x3b16f7.cover && _0x81225.draft?.cover === _0x3b16f7.cover ? {
        id: "existing-" + _0x3b16f7.id,
        src: _0x3b16f7.cover,
        nodeId: "",
        label: workflowText("currentCover")
      } : null;
      _0x5185b3.appendChild(this.renderWorkflowMetaForm({
        mode: "update",
        target: _0x3b16f7,
        candidates: this.getUpdateCoverCandidates(_0x3b16f7, _0x78f0e8),
        sourceSummary: _0x81225.updateMetaOnly ? null : _0x1bff9e,
        submitText: _0x81225.saving ? workflowText("updating") : _0x81225.updateMetaOnly ? workflowText("saveMeta") : _0x81225.updateConfirmOpen ? workflowText("confirmOverwrite") : workflowText("updateConfirm")
      }));
    } else {
      _0x5185b3.appendChild(this.renderWorkflowMetaForm({
        mode: "update",
        candidates: [getDefaultWorkflowCoverCandidate()],
        submitText: workflowText("updateConfirm"),
        disabled: true
      }));
    }
    _0x265457.appendChild(_0x5185b3);
    this.modalBody.appendChild(_0x265457);
  }
  renderWorkflowSourcePanel(_0x1953b6, {
    title = workflowText("source.savingContent")
  } = {}) {
    const _0x32cb62 = el("section", "v2-workflow-source-panel");
    const _0x382d8b = el("div", "v2-workflow-source-header");
    _0x382d8b.appendChild(el("div", "v2-workflow-source-title", title));
    const _0x16d682 = el("div", "v2-workflow-source-scope", _0x1953b6.sourceLabel || workflowText("source.wholeCanvas"));
    if (_0x1953b6.sourceName) {
      _0x16d682.appendChild(el("span", "", " · " + _0x1953b6.sourceName));
    }
    _0x382d8b.appendChild(_0x16d682);
    _0x32cb62.appendChild(_0x382d8b);
    if (_0x1953b6.isEmpty) {
      const _0x1b1bb5 = el("div", "v2-workflow-source-empty");
      _0x1b1bb5.textContent = _0x1953b6.sourceGroupId || _0x1953b6.sourceLabel === workflowText("source.currentGroup") ? workflowText("empty.noGroupNodes") : workflowText("empty.noCanvasNodes");
      _0x32cb62.appendChild(_0x1b1bb5);
      return _0x32cb62;
    }
    if (_0x1953b6.typeCounts.length > 0) {
      const _0x5d2881 = el("div", "v2-workflow-source-types");
      for (const _0x39b6fa of _0x1953b6.typeCounts.slice(0, 6)) {
        _0x5d2881.appendChild(el("span", "v2-workflow-source-type", _0x39b6fa.label + " " + _0x39b6fa.count));
      }
      _0x32cb62.appendChild(_0x5d2881);
    }
    const _0x77e20c = _0x1953b6.previewItems.slice(0, 4);
    if (_0x77e20c.length > 0) {
      const _0x45f183 = el("div", "v2-workflow-source-preview");
      for (const _0x1f2629 of _0x77e20c) {
        _0x45f183.appendChild(this.renderWorkflowContentItem(_0x1f2629));
      }
      if (_0x1953b6.previewItems.length > _0x77e20c.length) {
        _0x45f183.appendChild(el("div", "v2-workflow-source-more", workflowText("source.moreNodes", {
          count: _0x1953b6.previewItems.length - _0x77e20c.length
        })));
      }
      _0x32cb62.appendChild(_0x45f183);
    }
    return _0x32cb62;
  }
  renderWorkflowMetaForm({
    mode: _0x3df4a1,
    candidates: _0x2aea57,
    submitText: _0x57ce8a,
    sourceSummary = null,
    disabled = false
  }) {
    const _0x3fff30 = getState().workflowUi || {};
    const _0x318dd4 = _0x3fff30.draft || {};
    const _0x242356 = _0x3df4a1 === "create" || _0x3df4a1 === "update" && !_0x3fff30.updateMetaOnly;
    const _0x514eb6 = _0x242356 && sourceSummary?.isEmpty;
    const _0x1263b0 = el("div", "v2-workflow-form");
    _0x1263b0.dataset.workflowForm = _0x3df4a1;
    _0x1263b0.classList.toggle("is-disabled", disabled === true);
    const _0x40fac2 = el("div", "v2-workflow-cover-row");
    _0x40fac2.appendChild(this.renderCover(_0x318dd4.cover, "v2-workflow-form-cover"));
    const _0x1aa97d = el("div", "v2-workflow-cover-choices");
    for (const _0xe0bed3 of _0x2aea57) {
      const _0x527231 = el("button", "v2-workflow-cover-choice");
      _0x527231.type = "button";
      _0x527231.dataset.action = "workflow-cover-select";
      _0x527231.dataset.coverId = _0xe0bed3.id;
      _0x527231.dataset.coverSrc = _0xe0bed3.src || "";
      _0x527231.classList.toggle("active", _0xe0bed3.id === _0x318dd4.selectedCoverId);
      _0x527231.title = _0xe0bed3.label;
      _0x527231.appendChild(this.renderCover(_0xe0bed3.src, "v2-workflow-cover-choice-img"));
      _0x1aa97d.appendChild(_0x527231);
    }
    _0x40fac2.appendChild(_0x1aa97d);
    _0x1263b0.appendChild(_0x40fac2);
    _0x1263b0.appendChild(this.renderTextField(workflowText("name"), "workflow-draft-name", _0x318dd4.name || "", WORKFLOW_LIMITS.nameMax));
    _0x1263b0.appendChild(this.renderTagsField(_0x318dd4.tags || []));
    _0x1263b0.appendChild(this.renderNoteField(_0x318dd4.note || ""));
    const _0x5eb6ec = el("div", "v2-workflow-form-error");
    _0x5eb6ec.dataset.role = "workflow-form-error";
    if (_0x3fff30.error) {
      _0x5eb6ec.textContent = _0x3fff30.error;
    }
    _0x1263b0.appendChild(_0x5eb6ec);
    const _0x5f01fc = el("div", "v2-workflow-form-footer");
    const _0x37d4b4 = el("button", "v2-workflow-secondary-btn", workflowText("cancel"));
    _0x37d4b4.type = "button";
    _0x37d4b4.dataset.action = "workflow-modal-close";
    const _0x30a229 = el("button", "v2-workflow-primary-btn", _0x57ce8a);
    _0x30a229.type = "button";
    _0x30a229.dataset.action = _0x3df4a1 === "update" ? "workflow-update-submit" : "workflow-create-submit";
    _0x30a229.disabled = disabled === true || _0x3fff30.saving === true || !cleanText(_0x318dd4.name) || _0x514eb6;
    _0x5f01fc.append(_0x37d4b4, _0x30a229);
    _0x1263b0.appendChild(_0x5f01fc);
    return _0x1263b0;
  }
  renderTextField(_0x4cb0c3, _0xa2bc70, _0x3109d7, _0x2ecd78) {
    const _0x2201c8 = el("label", "v2-workflow-field");
    _0x2201c8.appendChild(el("span", "", _0x4cb0c3));
    const _0x6f4112 = el("input", "v2-workflow-input");
    _0x6f4112.type = "text";
    _0x6f4112.value = _0x3109d7 || "";
    _0x6f4112.maxLength = _0x2ecd78;
    _0x6f4112.dataset.role = _0xa2bc70;
    _0x2201c8.appendChild(_0x6f4112);
    return _0x2201c8;
  }
  renderNoteField(_0xa78b7f) {
    const _0xbc3cfe = el("label", "v2-workflow-field v2-workflow-note-field");
    _0xbc3cfe.appendChild(el("span", "", workflowText("note")));
    const _0x122f68 = el("textarea", "v2-workflow-textarea");
    _0x122f68.maxLength = WORKFLOW_LIMITS.noteMax;
    _0x122f68.value = _0xa78b7f || "";
    _0x122f68.dataset.role = "workflow-draft-note";
    _0x122f68.placeholder = workflowText("notePlaceholder");
    _0xbc3cfe.appendChild(_0x122f68);
    return _0xbc3cfe;
  }
  renderTagsField(_0x29fcd5) {
    const _0x2f7b6c = el("div", "v2-workflow-field");
    _0x2f7b6c.appendChild(el("span", "", workflowText("tags")));
    const _0x9b6e70 = el("div", "v2-workflow-tag-editor");
    for (const _0x28a4cd of _0x29fcd5) {
      const _0x3a5b38 = el("span", "v2-workflow-tag-chip");
      _0x3a5b38.appendChild(document.createTextNode(_0x28a4cd));
      const _0x3cf3fe = el("button", "", "×");
      _0x3cf3fe.type = "button";
      _0x3cf3fe.dataset.action = "workflow-tag-remove";
      _0x3cf3fe.dataset.tag = _0x28a4cd;
      _0x3a5b38.appendChild(_0x3cf3fe);
      _0x9b6e70.appendChild(_0x3a5b38);
    }
    const _0x59a375 = el("div", "v2-workflow-tag-input-row");
    const _0x5c7013 = el("input", "v2-workflow-input v2-workflow-tag-input");
    _0x5c7013.type = "text";
    _0x5c7013.maxLength = WORKFLOW_LIMITS.tagLengthMax;
    _0x5c7013.placeholder = _0x29fcd5.length >= WORKFLOW_LIMITS.tagMax ? workflowText("tagLimitReached") : workflowText("addTagPlaceholder");
    _0x5c7013.disabled = _0x29fcd5.length >= WORKFLOW_LIMITS.tagMax;
    _0x5c7013.value = getState().workflowUi?.tagDraft || "";
    _0x5c7013.dataset.role = "workflow-tag-draft";
    const _0x495e8a = el("button", "v2-workflow-secondary-btn v2-workflow-tag-add-btn", workflowText("addTag"));
    _0x495e8a.type = "button";
    _0x495e8a.dataset.action = "workflow-tag-add";
    _0x495e8a.disabled = _0x29fcd5.length >= WORKFLOW_LIMITS.tagMax;
    _0x59a375.append(_0x5c7013, _0x495e8a);
    _0x2f7b6c.append(_0x9b6e70, _0x59a375);
    return _0x2f7b6c;
  }
  handleModalKeydown(_0xb67bf4) {
    if (_0xb67bf4.key === "Escape") {
      this.closeModal();
      return;
    }
    if (_0xb67bf4.key !== "Enter") {
      return;
    }
    const _0x457b41 = _0xb67bf4.target?.dataset?.role;
    if (_0x457b41 !== "workflow-tag-draft") {
      return;
    }
    _0xb67bf4.preventDefault();
    this.addDraftTag();
  }
  handleModalInput(_0x2cb4ac) {
    const _0x40d746 = _0x2cb4ac.target;
    const _0x65d448 = _0x40d746?.dataset?.role;
    if (!_0x65d448) {
      return;
    }
    if (_0x65d448 === "workflow-draft-name") {
      workspaceStore.setWorkflowDraft({
        name: _0x40d746.value || ""
      });
      this.updateSubmitDisabled();
    } else if (_0x65d448 === "workflow-draft-note") {
      workspaceStore.setWorkflowDraft({
        note: _0x40d746.value || ""
      });
    } else if (_0x65d448 === "workflow-tag-draft") {
      workspaceStore.setWorkflowUi({
        tagDraft: _0x40d746.value || ""
      });
    } else if (_0x65d448 === "workflow-update-search") {
      workspaceStore.setWorkflowUi({
        updateSearchKeyword: _0x40d746.value || "",
        updateConfirmOpen: false
      });
      this.renderModal();
    }
  }
  handleModalClick(_0x33eb97) {
    const _0x20d17d = _0x33eb97.target.closest(".v2-workflow-modal-tab");
    if (_0x20d17d?.dataset?.modalTab) {
      workspaceStore.setWorkflowUi({
        modalTab: _0x20d17d.dataset.modalTab,
        updateConfirmOpen: false,
        updateMetaOnly: false,
        error: null
      });
      if (_0x20d17d.dataset.modalTab === "create") {
        this.resetCreateDraftFromCurrentSource();
      }
      this.renderModal();
      return;
    }
    const _0x3fbb9c = _0x33eb97.target.closest("[data-action]");
    const _0x1e25ba = _0x3fbb9c?.dataset?.action;
    if (!_0x1e25ba) {
      return;
    }
    if (_0x1e25ba === "workflow-cover-select") {
      const _0x4224a2 = _0x3fbb9c.dataset.coverId;
      const _0x1368d3 = _0x4224a2 === DEFAULT_WORKFLOW_COVER_ID ? "" : _0x3fbb9c.dataset.coverSrc || "";
      workspaceStore.setWorkflowDraft({
        selectedCoverId: _0x4224a2,
        cover: _0x1368d3
      });
      workspaceStore.setWorkflowUi({
        updateConfirmOpen: false
      });
      this.updateCoverSelectionUi(_0x4224a2, _0x1368d3);
      return;
    }
    if (_0x1e25ba === "workflow-tag-add") {
      this.addDraftTag();
      return;
    }
    if (_0x1e25ba === "workflow-tag-remove") {
      this.removeDraftTag(_0x3fbb9c.dataset.tag);
      return;
    }
    if (_0x1e25ba === "workflow-create-submit") {
      this.submitCreate();
      return;
    }
    if (_0x1e25ba === "workflow-update-select") {
      this.selectUpdateTarget(_0x3fbb9c.dataset.workflowId);
      return;
    }
    if (_0x1e25ba === "workflow-update-submit") {
      this.submitUpdate();
    }
  }
  updateSubmitDisabled() {
    const _0x53b743 = this.modalBody?.querySelector("[data-action='workflow-create-submit'], [data-action='workflow-update-submit']");
    if (_0x53b743) {
      const _0x1e71b6 = getState().workflowUi || {};
      const _0x238fa3 = _0x1e71b6.modalTab === "create" || _0x1e71b6.modalTab === "update" && !_0x1e71b6.updateMetaOnly;
      const _0x3e9b07 = _0x238fa3 && this.getWorkflowSourceSummary(this.getWorkflowSourceCanvasState()).isEmpty;
      _0x53b743.disabled = _0x1e71b6.saving === true || !cleanText(_0x1e71b6.draft?.name) || _0x3e9b07;
    }
  }
  updateCoverSelectionUi(_0x2e3905, _0x39cd7e) {
    if (!this.modalBody) {
      return;
    }
    const _0x3fd69e = cleanText(_0x2e3905);
    for (const _0x4509d0 of this.modalBody.querySelectorAll(".v2-workflow-cover-choice")) {
      _0x4509d0.classList.toggle("active", _0x4509d0.dataset.coverId === _0x3fd69e);
    }
    const _0x307ba8 = this.modalBody.querySelector(".v2-workflow-form-cover");
    if (!_0x307ba8?.parentNode) {
      return;
    }
    _0x307ba8.replaceWith(this.renderCover(_0x39cd7e, "v2-workflow-form-cover"));
  }
  setFormError(_0x2cf150) {
    workspaceStore.setWorkflowUi({
      error: _0x2cf150 || null
    });
    const _0x138c62 = this.modalBody?.querySelector("[data-role='workflow-form-error']");
    if (_0x138c62) {
      _0x138c62.textContent = _0x2cf150 || "";
    }
  }
  addDraftTag() {
    const _0x4c815b = getState().workflowUi || {};
    const _0x22c39a = cleanText(_0x4c815b.tagDraft).slice(0, WORKFLOW_LIMITS.tagLengthMax);
    if (!_0x22c39a) {
      return;
    }
    const _0x8d193e = normalizeWorkflowTags([...(_0x4c815b.draft?.tags || []), _0x22c39a]);
    if ((_0x4c815b.draft?.tags || []).length >= WORKFLOW_LIMITS.tagMax) {
      this.setFormError(workflowText("errors.tagLimit", {
        limit: WORKFLOW_LIMITS.tagMax
      }));
      return;
    }
    if (_0x8d193e.length === (_0x4c815b.draft?.tags || []).length) {
      this.setFormError(workflowText("errors.tagExists"));
      return;
    }
    workspaceStore.setWorkflowDraft({
      tags: _0x8d193e
    });
    workspaceStore.setWorkflowUi({
      tagDraft: "",
      updateConfirmOpen: false,
      error: null
    });
    this.renderModal();
  }
  removeDraftTag(_0x39b680) {
    const _0x4a7cbb = getState().workflowUi || {};
    const _0x2ecc2e = cleanText(_0x39b680).toLowerCase();
    const _0x299700 = (_0x4a7cbb.draft?.tags || []).filter(_0x568a55 => cleanText(_0x568a55).toLowerCase() !== _0x2ecc2e);
    workspaceStore.setWorkflowDraft({
      tags: _0x299700
    });
    workspaceStore.setWorkflowUi({
      updateConfirmOpen: false,
      error: null
    });
    this.renderModal();
  }
  selectUpdateTarget(_0xcd6ae0, {
    render = true
  } = {}) {
    const _0xd5634d = findWorkflowById(getState().workflows?.items || [], _0xcd6ae0);
    if (!_0xd5634d) {
      return;
    }
    const _0x580c77 = getState().workflowUi || {};
    const _0x300582 = _0xd5634d.cover ? {
      id: "existing-" + _0xd5634d.id,
      src: _0xd5634d.cover,
      nodeId: "",
      label: workflowText("currentCover")
    } : null;
    const _0x3640aa = this.getUpdateCoverCandidates(_0xd5634d, _0x580c77.updateMetaOnly ? _0x300582 : null)[0] || getDefaultWorkflowCoverCandidate();
    const _0x4ff90f = _0xd5634d.cover ? "existing-" + _0xd5634d.id : _0x3640aa.id;
    workspaceStore.setWorkflowUi({
      updateTargetId: _0xd5634d.id,
      updateConfirmOpen: false,
      tagDraft: "",
      error: null
    });
    workspaceStore.setWorkflowDraft({
      name: _0xd5634d.name,
      cover: _0xd5634d.cover || _0x3640aa.src || "",
      tags: _0xd5634d.tags || [],
      note: _0xd5634d.note || "",
      selectedCoverId: _0x4ff90f
    });
    if (render) {
      this.renderModal();
    }
  }
  async submitCreate() {
    const _0x9ec5c2 = getState().workflowUi || {};
    if (_0x9ec5c2.saving) {
      return;
    }
    const _0x2591e4 = _0x9ec5c2.draft || {};
    if (!cleanText(_0x2591e4.name)) {
      this.setFormError(workflowText("errors.nameRequired"));
      return;
    }
    const _0x3a7421 = this.getWorkflowSourceCanvasState();
    if (!Array.isArray(_0x3a7421.nodes) || _0x3a7421.nodes.length === 0) {
      this.setFormError(_0x9ec5c2.sourceGroupId ? workflowText("empty.noGroupNodes") : workflowText("empty.noCanvasNodes"));
      return;
    }
    workspaceStore.setWorkflowSaving(true);
    this.renderModal();
    try {
      const _0x4ca23d = await saveNewWorkflowFromCanvas(_0x3a7421, _0x2591e4);
      const _0xd5e4b5 = this.modalBody?.querySelector(".v2-workflow-form-cover");
      workspaceStore.upsertWorkflow(_0x4ca23d);
      playWorkflowSaveFly({
        sourceEl: _0xd5e4b5
      });
      workspaceStore.closeWorkflowModal();
      this.renderModal();
      showToast(workflowText("created"), "success");
    } catch (_0x1a606a) {
      workspaceStore.setWorkflowSaving(false);
      this.setFormError(_0x1a606a?.message || workflowText("saveFailed"));
      this.renderModal();
      showToast(workflowText("saveFailed"), "error");
    }
  }
  async submitUpdate() {
    const _0x5c8658 = getState();
    const _0x1c41cd = _0x5c8658.workflowUi || {};
    if (_0x1c41cd.saving) {
      return;
    }
    const _0xa0f298 = findWorkflowById(_0x5c8658.workflows?.items || [], _0x1c41cd.updateTargetId);
    if (!_0xa0f298) {
      this.setFormError(workflowText("errors.selectWorkflowToUpdate"));
      return;
    }
    if (!cleanText(_0x1c41cd.draft?.name)) {
      this.setFormError(workflowText("errors.nameRequired"));
      return;
    }
    if (_0x1c41cd.updateMetaOnly) {
      workspaceStore.setWorkflowSaving(true);
      this.renderModal();
      try {
        const _0x2be187 = await saveWorkflowMeta(_0xa0f298, _0x1c41cd.draft || {});
        const _0x1caafb = this.modalBody?.querySelector(".v2-workflow-form-cover");
        workspaceStore.upsertWorkflow(_0x2be187);
        playWorkflowSaveFly({
          sourceEl: _0x1caafb
        });
        workspaceStore.closeWorkflowModal();
        this.renderModal();
        showToast(workflowText("metaSaved"), "success");
      } catch (_0x313a3d) {
        workspaceStore.setWorkflowSaving(false);
        this.setFormError(_0x313a3d?.message || workflowText("metaSaveFailed"));
        this.renderModal();
        showToast(workflowText("metaSaveFailed"), "error");
      }
      return;
    }
    const _0x2617c8 = this.getWorkflowSourceCanvasState();
    if (!Array.isArray(_0x2617c8.nodes) || _0x2617c8.nodes.length === 0) {
      this.setFormError(_0x1c41cd.sourceGroupId ? workflowText("empty.noGroupNodes") : workflowText("empty.noCanvasNodes"));
      return;
    }
    if (!_0x1c41cd.updateConfirmOpen) {
      workspaceStore.setWorkflowUi({
        updateConfirmOpen: true,
        error: null
      });
      this.renderModal();
      return;
    }
    workspaceStore.setWorkflowSaving(true);
    this.renderModal();
    try {
      const _0x19aeea = await saveUpdatedWorkflowFromCanvas(_0xa0f298.id, _0x2617c8, {
        ...(_0x1c41cd.draft || {}),
        existingWorkflow: _0xa0f298
      });
      const _0x27717f = this.modalBody?.querySelector(".v2-workflow-form-cover");
      workspaceStore.upsertWorkflow(_0x19aeea);
      playWorkflowSaveFly({
        sourceEl: _0x27717f
      });
      workspaceStore.closeWorkflowModal();
      this.renderModal();
      showToast(workflowText("updated"), "success");
    } catch (_0x45b571) {
      workspaceStore.setWorkflowSaving(false);
      this.setFormError(_0x45b571?.message || workflowText("updateFailed"));
      this.renderModal();
      showToast(workflowText("updateFailed"), "error");
    }
  }
  getCanvasCenterWorld() {
    const {
      viewport: _0x52cc4b
    } = getState();
    const _0x39d4ce = window.innerWidth / 2;
    const _0x302822 = window.innerHeight / 2;
    const _0x1c89b4 = document.documentElement?.clientWidth || window.innerWidth || 0;
    const _0x281a86 = document.documentElement?.clientHeight || window.innerHeight || 0;
    if (!_0x1c89b4 || !_0x281a86) {
      return screenToWorld(_0x39d4ce, _0x302822, _0x52cc4b);
    }
    let _0x22439a = 0;
    let _0x4495b4 = 0;
    let _0x47349c = _0x1c89b4;
    let _0x546fd6 = _0x281a86;
    const _0xa5a63b = [];
    const _0x317354 = document.querySelector("header");
    if (_0x317354) {
      _0xa5a63b.push(_0x317354);
    }
    const _0x1ab5a5 = document.querySelector(".sidebar-floating");
    if (_0x1ab5a5) {
      _0xa5a63b.push(_0x1ab5a5);
    }
    if (this.sidebarPanel?.classList?.contains("show")) {
      _0xa5a63b.push(this.sidebarPanel);
    }
    const _0x1eccf3 = 8;
    for (const _0x3c66b9 of _0xa5a63b) {
      if (!_0x3c66b9?.isConnected) {
        continue;
      }
      const _0x53b059 = _0x3c66b9.getBoundingClientRect();
      const _0x3c510f = Math.max(_0x22439a, _0x53b059.left);
      const _0x4f422b = Math.max(_0x4495b4, _0x53b059.top);
      const _0x1231ff = Math.min(_0x47349c, _0x53b059.right);
      const _0x13bf29 = Math.min(_0x546fd6, _0x53b059.bottom);
      if (_0x1231ff <= _0x3c510f || _0x13bf29 <= _0x4f422b) {
        continue;
      }
      if (_0x53b059.left <= _0x22439a + _0x1eccf3 && _0x53b059.right > _0x22439a + _0x1eccf3) {
        _0x22439a = Math.max(_0x22439a, _0x53b059.right);
        continue;
      }
      if (_0x53b059.right >= _0x47349c - _0x1eccf3 && _0x53b059.left < _0x47349c - _0x1eccf3) {
        _0x47349c = Math.min(_0x47349c, _0x53b059.left);
        continue;
      }
      if (_0x53b059.top <= _0x4495b4 + _0x1eccf3 && _0x53b059.bottom > _0x4495b4 + _0x1eccf3) {
        _0x4495b4 = Math.max(_0x4495b4, _0x53b059.bottom);
        continue;
      }
      if (_0x53b059.bottom >= _0x546fd6 - _0x1eccf3 && _0x53b059.top < _0x546fd6 - _0x1eccf3) {
        _0x546fd6 = Math.min(_0x546fd6, _0x53b059.top);
      }
    }
    const _0x412c6d = _0x47349c - _0x22439a;
    const _0x5749e6 = _0x546fd6 - _0x4495b4;
    const _0x5c9cf9 = _0x412c6d > 40 ? _0x22439a + _0x412c6d / 2 : _0x39d4ce;
    const _0x48906d = _0x5749e6 > 40 ? _0x4495b4 + _0x5749e6 / 2 : _0x302822;
    return screenToWorld(_0x5c9cf9, _0x48906d, _0x52cc4b);
  }
  async applyWorkflow(_0x3d4119) {
    const _0x516588 = getState();
    const _0x17c802 = _0x516588.workflowUi || {};
    if (_0x17c802.applyingWorkflowId) {
      return;
    }
    const _0xd05fa9 = findWorkflowById(_0x516588.workflows?.items || [], _0x3d4119);
    if (!_0xd05fa9) {
      showToast(workflowText("workflowMissing"), "error");
      return;
    }
    workspaceStore.setWorkflowApplying(_0xd05fa9.id);
    try {
      const _0x4eeb35 = applyWorkflowToCanvas(_0xd05fa9, this.getCanvasCenterWorld());
      if (_0x4eeb35.nodes.length === 0) {
        showToast(workflowText("empty.noApplicableNodes"), "warn");
        return;
      }
      graphStore.batch(() => {
        for (const _0x1a9250 of _0x4eeb35.nodes) {
          graphStore.addNode(_0x1a9250);
        }
        for (const _0x64ccec of _0x4eeb35.edges) {
          graphStore.addEdge(_0x64ccec);
        }
        graphStore.setSelectedNodes(_0x4eeb35.nodes.map(_0x8a971e => _0x8a971e.id));
      });
      commit();
      const _0x33e7ad = Date.now();
      workspaceStore.markWorkflowUsed(_0xd05fa9.id, _0x33e7ad);
      saveWorkflowUsage({
        ..._0xd05fa9,
        lastUsedAt: _0x33e7ad
      }, _0x33e7ad).catch(() => {});
      showToast(workflowText("applied"), "success");
    } catch (_0x20e131) {
      showToast(_0x20e131?.message || workflowText("applyFailed"), "error");
    } finally {
      workspaceStore.setWorkflowApplying(null);
    }
  }
}
export const workflowManager = new WorkflowManager();