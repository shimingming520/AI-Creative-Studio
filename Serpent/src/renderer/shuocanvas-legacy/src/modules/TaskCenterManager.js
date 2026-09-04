import { registerSidebarSubmenu } from "./sidebarSubmenuController.js";
import { pickResultLocalPath } from "../utils/localMediaPath.js";
import { GENERATION_TASK_CENTER_EVENT } from "./generationTaskCenterEvents.js";
import a1428_0x290605 from "../core/stores/appStore.js";
import { cancelTask as a1428_0x5993f2 } from "../core/generationTaskRuntime.js";
import { cancelDreaminaVideoQueueTask } from "../../api/dreaminaGenApi.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { showContextMenu } from "./interaction/contextMenuPresenter.js";
const TERMINAL_STATUSES = new Set(["complete", "failed", "cancelled"]);
const ACTIVE_STATUSES = new Set(["waiting", "processing"]);
const MAX_TASKS = 120;
const TASK_CENTER_COLLAPSED_KEY = "__aiCanvasTaskCenterCollapsed";
function el(_0x485eab, _0x20c5ff = "", _0x486ca6 = "") {
  const _0x2b7a78 = document.createElement(_0x485eab);
  if (_0x20c5ff) {
    _0x2b7a78.className = _0x20c5ff;
  }
  if (_0x486ca6) {
    _0x2b7a78.textContent = _0x486ca6;
  }
  return _0x2b7a78;
}
function taskCenterText(_0x2c718c, _0x1adae2 = {}) {
  return t("taskCenter." + _0x2c718c, _0x1adae2);
}
function normalizeTask(_0x3fa4d3 = {}) {
  const _0x26d6bc = String(_0x3fa4d3.taskId || "").trim();
  if (!_0x26d6bc) {
    return null;
  }
  return {
    taskId: _0x26d6bc,
    nodeId: String(_0x3fa4d3.nodeId || "").trim(),
    assetId: String(_0x3fa4d3.assetId || "").trim(),
    kind: String(_0x3fa4d3.kind || "").trim(),
    source: String(_0x3fa4d3.source || "").trim() || "mediaTask",
    status: String(_0x3fa4d3.status || "").trim() || "waiting",
    progress: Math.max(0, Math.min(1, Number(_0x3fa4d3.progress || 0) || 0)),
    message: String(_0x3fa4d3.message || "").trim(),
    error: String(_0x3fa4d3.error || "").trim(),
    remoteTaskId: String(_0x3fa4d3.remoteTaskId || "").trim(),
    cancellable: _0x3fa4d3.cancellable === true,
    result: _0x3fa4d3.result && typeof _0x3fa4d3.result === "object" ? _0x3fa4d3.result : null,
    createdAt: Number(_0x3fa4d3.createdAt || 0) || Date.now(),
    startedAt: Number(_0x3fa4d3.startedAt || 0) || 0,
    finishedAt: Number(_0x3fa4d3.finishedAt || 0) || 0,
    updatedAt: Date.now()
  };
}
function getTaskLabel(_0x1fca45) {
  const _0x4dc715 = String(_0x1fca45 || "").trim();
  if (!_0x4dc715) {
    return taskCenterText("taskKinds.mediaTask");
  }
  const _0x192b0e = "taskCenter.taskKinds." + _0x4dc715;
  const _0x3c882 = t(_0x192b0e);
  if (_0x3c882 === _0x192b0e) {
    return taskCenterText("taskKinds.mediaTask");
  } else {
    return _0x3c882;
  }
}
function getStatusLabel(_0x4ddc23) {
  const _0x30d64c = String(_0x4ddc23 || "").trim();
  if (!_0x30d64c) {
    return taskCenterText("statuses.fallback");
  }
  const _0x58b93c = "taskCenter.statuses." + _0x30d64c;
  const _0xdb7bd9 = t(_0x58b93c);
  if (_0xdb7bd9 === _0x58b93c) {
    return taskCenterText("statuses.fallback");
  } else {
    return _0xdb7bd9;
  }
}
function formatPercent(_0x587497) {
  return Math.round(Math.max(0, Math.min(1, Number(_0x587497) || 0)) * 100) + "%";
}
function formatDuration(_0x8b55fe) {
  const _0x3dfb43 = Math.max(0, Math.floor(Number(_0x8b55fe || 0) / 1000));
  const _0x9afeda = Math.floor(_0x3dfb43 / 60);
  const _0x4e0f02 = _0x3dfb43 % 60;
  if (_0x9afeda <= 0) {
    return _0x4e0f02 + "s";
  }
  return _0x9afeda + "m " + String(_0x4e0f02).padStart(2, "0") + "s";
}
function getTaskDuration(_0x51fcb9) {
  const _0x2b3ca6 = Number(_0x51fcb9.startedAt || _0x51fcb9.createdAt || 0) || 0;
  const _0x38a86e = Number(_0x51fcb9.finishedAt || 0) || (ACTIVE_STATUSES.has(_0x51fcb9.status) ? Date.now() : 0);
  if (!_0x2b3ca6 || !_0x38a86e) {
    return "";
  }
  return formatDuration(_0x38a86e - _0x2b3ca6);
}
function getResultLocalPath(_0x1c4b78) {
  return pickResultLocalPath(_0x1c4b78);
}
function sortTasks(_0x4e8285) {
  const _0x43cbd7 = {
    processing: 0,
    waiting: 1,
    failed: 2,
    complete: 3,
    cancelled: 4
  };
  return [..._0x4e8285].sort((_0x2561cb, _0xf32fe4) => {
    const _0x1c028f = _0x43cbd7[_0x2561cb.status] ?? 9;
    const _0x4b0852 = _0x43cbd7[_0xf32fe4.status] ?? 9;
    if (_0x1c028f !== _0x4b0852) {
      return _0x1c028f - _0x4b0852;
    }
    return Number(_0xf32fe4.updatedAt || _0xf32fe4.createdAt || 0) - Number(_0x2561cb.updatedAt || _0x2561cb.createdAt || 0);
  });
}
function getElectronMediaTaskApi() {
  if (desktopBridge.mediaTask.isAvailable()) {
    return desktopBridge.mediaTask;
  } else {
    return null;
  }
}
export class TaskCenterManager {
  constructor({
    generationCancelTask = a1428_0x5993f2,
    generationStore = a1428_0x290605,
    contextMenuPresenter = showContextMenu
  } = {}) {
    this.generationCancelTask = generationCancelTask;
    this.generationStore = generationStore;
    this.contextMenuPresenter = contextMenuPresenter;
    this.contextMenuSession = null;
    this.panel = null;
    this.listEl = null;
    this.summaryEl = null;
    this.titleEl = null;
    this.clearBtn = null;
    this.collapseBtn = null;
    this.badgeEl = null;
    this.isCollapsed = true;
    this.tasks = new Map();
    this.renderTimer = 0;
    this.clockTimer = 0;
    this.unsubscribe = null;
    this.unsubscribeGenerationTasks = null;
    this.unsubscribeLocale = null;
    this.initPanel();
    this.bindLocaleChange();
    this.bindMediaTasks();
    this.bindGenerationTasks();
  }
  initPanel() {
    const _0x487acb = document.getElementById("btnTasks");
    this.badgeEl = document.getElementById("taskCenterBadge");
    const _0x10fad2 = document.querySelector(".sidebar-floating") || document.body;
    this.panel = el("div", "v2-task-center-panel canvas-toolbar-panel-surface");
    this.panel.setAttribute("aria-label", taskCenterText("ariaLabel"));
    const _0x354b14 = el("div", "v2-task-center-header");
    this.collapseBtn = el("button", "v2-task-center-collapse");
    this.collapseBtn.type = "button";
    this.collapseBtn.dataset.taskAction = "toggle-collapse";
    this.titleEl = el("div", "v2-task-center-title", taskCenterText("title"));
    this.clearBtn = el("button", "v2-task-center-action", taskCenterText("clearDone"));
    this.clearBtn.type = "button";
    this.clearBtn.dataset.taskAction = "clear-terminal";
    _0x354b14.append(this.collapseBtn, this.titleEl, this.clearBtn);
    this.summaryEl = el("div", "v2-task-center-summary");
    this.listEl = el("div", "v2-task-center-list");
    this.panel.append(_0x354b14, this.summaryEl, this.listEl);
    this.setCollapsed(this.readCollapsedState(), {
      persist: false
    });
    _0x10fad2.appendChild(this.panel);
    if (_0x487acb) {
      registerSidebarSubmenu({
        key: "tasks",
        button: _0x487acb,
        panel: this.panel,
        open: () => this.show(),
        close: () => this.hide(),
        isOpen: () => this.panel.classList.contains("show")
      });
    }
    this.panel.addEventListener("click", _0x234577 => this.handleClick(_0x234577));
    this.panel.addEventListener("contextmenu", _0x35789e => this.handleContextMenu(_0x35789e));
    this.panel.addEventListener("wheel", _0x4d8caa => this.handleWheel(_0x4d8caa), {
      passive: false
    });
    this.render();
  }
  handleWheel(_0x1c61dd) {
    _0x1c61dd.stopPropagation();
    _0x1c61dd.stopImmediatePropagation?.();
    if (!this.listEl || this.listEl.contains(_0x1c61dd.target)) {
      return;
    }
    const _0x20b258 = Number(_0x1c61dd.deltaY || 0);
    if (!_0x20b258) {
      return;
    }
    const _0x3b02e3 = Number(this.listEl.scrollHeight || 0) > Number(this.listEl.clientHeight || 0);
    if (!_0x3b02e3) {
      return;
    }
    _0x1c61dd.preventDefault?.();
    this.listEl.scrollTop = Math.max(0, Number(this.listEl.scrollTop || 0) + _0x20b258);
  }
  bindLocaleChange() {
    this.unsubscribeLocale = onLocaleChange(() => {
      this.render();
    });
  }
  bindMediaTasks() {
    const _0x5e856e = getElectronMediaTaskApi();
    if (!_0x5e856e) {
      this.render();
      return;
    }
    if (typeof _0x5e856e.onUpdate === "function") {
      this.unsubscribe = _0x5e856e.onUpdate(_0x5c68e5 => {
        this.upsertTask(_0x5c68e5 || {});
      });
    }
    if (typeof _0x5e856e.list === "function") {
      _0x5e856e.list({
        limit: MAX_TASKS
      }).then(_0x3b476f => {
        if (!Array.isArray(_0x3b476f)) {
          return;
        }
        _0x3b476f.forEach(_0x1ccd1f => this.upsertTask(_0x1ccd1f, {
          silent: true
        }));
        this.scheduleRender();
      }).catch(() => {});
    }
  }
  bindGenerationTasks() {
    if (!globalThis.window?.addEventListener) {
      return;
    }
    const _0x15f427 = _0x247d65 => {
      this.upsertTask({
        ...(_0x247d65?.detail || {}),
        source: "generation"
      });
    };
    window.addEventListener(GENERATION_TASK_CENTER_EVENT, _0x15f427);
    this.unsubscribeGenerationTasks = () => {
      window.removeEventListener(GENERATION_TASK_CENTER_EVENT, _0x15f427);
    };
  }
  show() {
    this.panel?.classList.add("show");
    document.getElementById("btnTasks")?.classList.add("active");
    this.render();
    this.startClock();
  }
  readCollapsedState() {
    try {
      const _0x5df4a7 = globalThis.localStorage?.getItem(TASK_CENTER_COLLAPSED_KEY);
      return _0x5df4a7 !== "expanded";
    } catch (_0x4c38f7) {
      return true;
    }
  }
  setCollapsed(_0x3d4e7c, {
    persist = true
  } = {}) {
    this.isCollapsed = Boolean(_0x3d4e7c);
    this.panel?.classList.toggle("is-collapsed", this.isCollapsed);
    if (this.collapseBtn) {
      this.collapseBtn.textContent = this.isCollapsed ? "›" : "‹";
      const _0x4f4a4b = taskCenterText(this.isCollapsed ? "expand" : "collapse");
      this.collapseBtn.setAttribute("aria-label", _0x4f4a4b);
      this.collapseBtn.title = _0x4f4a4b;
    }
    if (persist) {
      try {
        globalThis.localStorage?.setItem(TASK_CENTER_COLLAPSED_KEY, this.isCollapsed ? "collapsed" : "expanded");
      } catch (_0x2be7a1) {}
    }
  }
  toggleCollapsed() {
    this.setCollapsed(!this.isCollapsed);
  }
  hide() {
    this.closeContextMenu();
    this.panel?.classList.remove("show");
    document.getElementById("btnTasks")?.classList.remove("active");
    this.stopClock();
  }
  startClock() {
    if (this.clockTimer) {
      return;
    }
    this.clockTimer = window.setInterval(() => {
      if (!this.hasActiveTasks()) {
        this.stopClock();
        return;
      }
      this.render();
    }, 1000);
  }
  stopClock() {
    if (!this.clockTimer) {
      return;
    }
    window.clearInterval(this.clockTimer);
    this.clockTimer = 0;
  }
  closeContextMenu() {
    this.contextMenuSession?.close?.();
    this.contextMenuSession = null;
  }
  hasActiveTasks() {
    return [...this.tasks.values()].some(_0x8db85 => ACTIVE_STATUSES.has(_0x8db85.status));
  }
  retireDuplicateGenerationTasks(_0x4b978b) {
    if (_0x4b978b?.source !== "generation" || _0x4b978b.kind !== "dreaminaVideo" || !_0x4b978b.nodeId || !ACTIVE_STATUSES.has(_0x4b978b.status)) {
      return;
    }
    for (const [_0x51660b, _0x4fb2ab] of this.tasks.entries()) {
      if (_0x51660b === _0x4b978b.taskId) {
        continue;
      }
      if (_0x4fb2ab?.source === "generation" && _0x4fb2ab.kind === "dreaminaVideo" && _0x4fb2ab.nodeId === _0x4b978b.nodeId && ACTIVE_STATUSES.has(_0x4fb2ab.status)) {
        this.tasks.set(_0x51660b, {
          ..._0x4fb2ab,
          status: "complete",
          progress: 1,
          message: _0x4fb2ab.message || "Replaced by latest task",
          finishedAt: _0x4fb2ab.finishedAt || Date.now(),
          updatedAt: Date.now()
        });
      }
    }
  }
  upsertTask(_0x429962, {
    silent = false
  } = {}) {
    const _0x462cf9 = normalizeTask(_0x429962);
    if (!_0x462cf9) {
      return;
    }
    this.retireDuplicateGenerationTasks(_0x462cf9);
    const _0x5b6109 = this.tasks.get(_0x462cf9.taskId);
    this.tasks.set(_0x462cf9.taskId, {
      ...(_0x5b6109 || {}),
      ..._0x462cf9,
      updatedAt: Date.now()
    });
    this.trimTasks();
    if (!silent) {
      this.scheduleRender();
    }
    if (ACTIVE_STATUSES.has(_0x462cf9.status)) {
      this.startClock();
    }
  }
  trimTasks() {
    if (this.tasks.size <= MAX_TASKS) {
      return;
    }
    const _0x223a39 = sortTasks([...this.tasks.values()]).slice(0, MAX_TASKS);
    this.tasks = new Map(_0x223a39.map(_0x4a11a0 => [_0x4a11a0.taskId, _0x4a11a0]));
  }
  scheduleRender() {
    if (this.renderTimer) {
      return;
    }
    this.renderTimer = window.requestAnimationFrame(() => {
      this.renderTimer = 0;
      this.render();
    });
  }
  getTaskGroups() {
    const _0x419d5f = sortTasks([...this.tasks.values()]);
    return {
      active: _0x419d5f.filter(_0xa4f312 => ACTIVE_STATUSES.has(_0xa4f312.status)),
      failed: _0x419d5f.filter(_0x511e7a => _0x511e7a.status === "failed"),
      done: _0x419d5f.filter(_0x2f2fcb => _0x2f2fcb.status === "complete" || _0x2f2fcb.status === "cancelled")
    };
  }
  updateBadge(_0x5a467c) {
    const _0x2d4fba = _0x5a467c.active.length;
    if (!this.badgeEl) {
      return;
    }
    this.badgeEl.hidden = _0x2d4fba <= 0;
    this.badgeEl.textContent = _0x2d4fba > 99 ? "99+" : String(_0x2d4fba);
  }
  render() {
    if (!this.listEl || !this.summaryEl) {
      return;
    }
    this.closeContextMenu();
    const _0x49e742 = getElectronMediaTaskApi();
    const _0x3e36d4 = this.getTaskGroups();
    this.updateBadge(_0x3e36d4);
    const _0x28073c = _0x3e36d4.failed.length;
    const _0x25b121 = _0x3e36d4.done.length;
    const _0x2a4ede = _0x3e36d4.active.length + _0x28073c + _0x25b121;
    this.panel?.setAttribute("aria-label", taskCenterText("ariaLabel"));
    if (this.clearBtn) {
      this.clearBtn.textContent = taskCenterText("clearDone");
    }
    if (this.titleEl) {
      this.titleEl.textContent = taskCenterText("title");
    }
    if (this.collapseBtn) {
      const _0x5f194f = taskCenterText(this.isCollapsed ? "expand" : "collapse");
      this.collapseBtn.setAttribute("aria-label", _0x5f194f);
      this.collapseBtn.title = _0x5f194f;
    }
    this.summaryEl.textContent = _0x49e742 || _0x2a4ede > 0 ? taskCenterText("summary", {
      active: _0x3e36d4.active.length,
      failed: _0x28073c,
      done: _0x25b121
    }) : taskCenterText("unavailableSummary");
    if (this.clearBtn) {
      this.clearBtn.hidden = _0x25b121 + _0x28073c <= 0;
    }
    this.listEl.replaceChildren();
    if (!_0x49e742 && _0x2a4ede <= 0) {
      this.listEl.appendChild(el("div", "v2-task-center-empty", taskCenterText("unavailable")));
      return;
    }
    if (_0x2a4ede === 0) {
      this.listEl.appendChild(el("div", "v2-task-center-empty", taskCenterText("empty")));
      return;
    }
    if (_0x3e36d4.active.length) {
      this.listEl.appendChild(this.renderSection(taskCenterText("sections.active"), _0x3e36d4.active));
    }
    if (_0x3e36d4.failed.length) {
      this.listEl.appendChild(this.renderSection(taskCenterText("sections.failed"), _0x3e36d4.failed));
    }
    if (_0x3e36d4.done.length) {
      this.listEl.appendChild(this.renderSection(taskCenterText("sections.done"), _0x3e36d4.done.slice(0, 40)));
    }
  }
  renderSection(_0x633b92, _0x54cd40) {
    const _0x363dc0 = el("section", "v2-task-center-section");
    _0x363dc0.appendChild(el("div", "v2-task-center-section-title", _0x633b92));
    _0x54cd40.forEach(_0x36f1ef => _0x363dc0.appendChild(this.renderTaskCard(_0x36f1ef)));
    return _0x363dc0;
  }
  renderTaskCard(_0x5139d3) {
    const _0x2332a9 = el("article", "v2-task-card");
    _0x2332a9.dataset.taskId = _0x5139d3.taskId;
    const _0x30e5ba = el("div", "v2-task-card-header");
    const _0x4091f7 = el("div", "v2-task-card-main");
    _0x4091f7.appendChild(el("div", "v2-task-card-title", getTaskLabel(_0x5139d3.kind)));
    const _0xeecc81 = getTaskDuration(_0x5139d3);
    const _0x23013d = [_0x5139d3.message || getStatusLabel(_0x5139d3.status), _0xeecc81 ? taskCenterText("duration", {
      duration: _0xeecc81
    }) : ""].filter(Boolean).join(" · ");
    _0x4091f7.appendChild(el("div", "v2-task-card-meta", _0x23013d));
    const _0x5228d4 = el("span", "v2-task-status v2-task-status--" + _0x5139d3.status, getStatusLabel(_0x5139d3.status));
    _0x30e5ba.append(_0x4091f7, _0x5228d4);
    _0x2332a9.appendChild(_0x30e5ba);
    if ((_0x5139d3.status === "waiting" || _0x5139d3.status === "processing") && _0x5139d3.cancellable === true) {
      const _0x5ef695 = el("div", "v2-task-progress");
      const _0x3fd39d = el("div", "v2-task-progress-fill");
      _0x3fd39d.style.width = formatPercent(_0x5139d3.status === "waiting" ? 0 : _0x5139d3.progress);
      _0x5ef695.appendChild(_0x3fd39d);
      _0x2332a9.appendChild(_0x5ef695);
    }
    if (_0x5139d3.error) {
      _0x2332a9.appendChild(el("div", "v2-task-card-error", _0x5139d3.error));
    }
    const _0x47bb6b = this.renderTaskActions(_0x5139d3);
    if (_0x47bb6b.childElementCount > 0) {
      _0x2332a9.appendChild(_0x47bb6b);
    }
    return _0x2332a9;
  }
  renderTaskActions(_0x33410b) {
    const _0x9266cb = el("div", "v2-task-card-actions");
    if ((_0x33410b.status === "waiting" || _0x33410b.status === "processing") && _0x33410b.cancellable === true) {
      const _0x2f6993 = el("button", "v2-task-card-action v2-task-card-action--danger", taskCenterText("actions.cancel"));
      _0x2f6993.type = "button";
      _0x2f6993.dataset.taskAction = "cancel";
      _0x2f6993.dataset.taskId = _0x33410b.taskId;
      _0x9266cb.appendChild(_0x2f6993);
    }
    const _0x3cce60 = getResultLocalPath(_0x33410b.result);
    if (_0x3cce60) {
      const _0xf38a38 = el("button", "v2-task-card-action", taskCenterText("actions.reveal"));
      _0xf38a38.type = "button";
      _0xf38a38.dataset.taskAction = "reveal";
      _0xf38a38.dataset.localPath = _0x3cce60;
      _0x9266cb.appendChild(_0xf38a38);
    }
    if (_0x33410b.error) {
      const _0x32783d = el("button", "v2-task-card-action", taskCenterText("actions.copyError"));
      _0x32783d.type = "button";
      _0x32783d.dataset.taskAction = "copy-error";
      _0x32783d.dataset.taskId = _0x33410b.taskId;
      _0x9266cb.appendChild(_0x32783d);
    }
    return _0x9266cb;
  }
  handleClick(_0x39127a) {
    const _0x552e82 = _0x39127a.target.closest("[data-task-action]");
    if (!_0x552e82) {
      return;
    }
    _0x39127a.preventDefault();
    _0x39127a.stopPropagation();
    const _0x1d5afe = _0x552e82.dataset.taskAction || "";
    if (_0x1d5afe === "toggle-collapse") {
      this.toggleCollapsed();
      return;
    }
    this.runTaskAction(_0x1d5afe, {
      taskId: _0x552e82.dataset.taskId || "",
      localPath: _0x552e82.dataset.localPath || ""
    });
  }
  handleContextMenu(_0x146c1f) {
    const _0x17c927 = _0x146c1f.target?.closest?.(".v2-task-card");
    if (!_0x17c927 || !this.panel?.contains?.(_0x17c927)) {
      return;
    }
    const _0x21b233 = String(_0x17c927.dataset.taskId || "");
    const _0x3a9ee7 = this.tasks.get(_0x21b233);
    if (!_0x3a9ee7) {
      return;
    }
    const _0x147c0d = [];
    if (ACTIVE_STATUSES.has(_0x3a9ee7.status) && _0x3a9ee7.cancellable === true) {
      _0x147c0d.push({
        label: taskCenterText("actions.cancel"),
        danger: true,
        action: () => this.runTaskAction("cancel", {
          taskId: _0x21b233
        })
      });
    }
    const _0x1b1174 = getResultLocalPath(_0x3a9ee7.result);
    if (_0x1b1174) {
      _0x147c0d.push({
        label: taskCenterText("actions.reveal"),
        disabled: !desktopBridge.shell.canShowItemInFolder(),
        action: () => this.runTaskAction("reveal", {
          localPath: _0x1b1174
        })
      });
    }
    if (_0x3a9ee7.error) {
      _0x147c0d.push({
        label: taskCenterText("actions.copyError"),
        action: () => this.runTaskAction("copy-error", {
          taskId: _0x21b233
        })
      });
    }
    if (!_0x147c0d.length) {
      return;
    }
    _0x146c1f.preventDefault();
    _0x146c1f.stopPropagation();
    this.closeContextMenu();
    this.contextMenuSession = this.contextMenuPresenter(_0x146c1f.clientX, _0x146c1f.clientY, _0x147c0d, {
      ownerElement: _0x17c927,
      ownerRoot: this.panel
    });
  }
  runTaskAction(_0x685b23, {
    taskId = "",
    localPath = ""
  } = {}) {
    if (_0x685b23 === "clear-terminal") {
      for (const [_0x420b3f, _0x390ca0] of this.tasks.entries()) {
        if (TERMINAL_STATUSES.has(_0x390ca0.status)) {
          this.tasks.delete(_0x420b3f);
        }
      }
      this.render();
      return;
    }
    if (_0x685b23 === "cancel") {
      const _0x1994d1 = this.tasks.get(taskId);
      if (!_0x1994d1 || !ACTIVE_STATUSES.has(_0x1994d1.status) || _0x1994d1.cancellable !== true) {
        return;
      }
      if (_0x1994d1?.source === "generation" && _0x1994d1.kind === "dreaminaVideo") {
        cancelDreaminaVideoQueueTask(taskId).then(() => {
          const _0x659ee = this.tasks.get(taskId);
          if (!_0x659ee || !ACTIVE_STATUSES.has(_0x659ee.status)) {
            return;
          }
          this.upsertTask({
            ..._0x659ee,
            status: "cancelled",
            progress: 0,
            message: taskCenterText("cancelledMessage"),
            error: "",
            finishedAt: Date.now()
          });
        }).catch(_0x18641d => {
          window.showToast?.(_0x18641d?.message || taskCenterText("cancelFailed"), "error");
        });
        return;
      }
      if (_0x1994d1?.source === "generation") {
        const _0x11ee93 = _0x1994d1.nodeId || _0x1994d1.assetId || "";
        if (!_0x11ee93 || typeof this.generationCancelTask !== "function") {
          window.showToast?.(taskCenterText("cancelFailed"), "error");
          return;
        }
        Promise.resolve().then(() => this.generationCancelTask(_0x11ee93, {
          store: this.generationStore,
          taskCenterTaskId: _0x1994d1.taskId,
          taskId: _0x1994d1.remoteTaskId,
          abortLocal: true,
          cancellable: true
        })).then(_0x3adf1e => {
          if (_0x3adf1e?.ok === false) {
            throw new Error(_0x3adf1e?.reason || taskCenterText("cancelFailed"));
          }
          const _0x4e53a9 = this.tasks.get(taskId);
          if (!_0x4e53a9 || !ACTIVE_STATUSES.has(_0x4e53a9.status)) {
            return;
          }
          this.upsertTask({
            ..._0x4e53a9,
            status: "cancelled",
            progress: 0,
            message: taskCenterText("cancelledMessage"),
            error: "",
            finishedAt: Date.now()
          });
        }).catch(_0x213386 => {
          window.showToast?.(_0x213386?.message || taskCenterText("cancelFailed"), "error");
        });
        return;
      }
      getElectronMediaTaskApi()?.cancel?.({
        taskId: taskId
      }).catch(_0x3fe225 => {
        window.showToast?.(_0x3fe225?.message || taskCenterText("cancelFailed"), "error");
      });
      return;
    }
    if (_0x685b23 === "reveal") {
      if (!desktopBridge.shell.canShowItemInFolder()) {
        return;
      }
      desktopBridge.shell.showItemInFolder({
        localPath: localPath
      }).catch(_0x123c90 => {
        window.showToast?.(_0x123c90?.message || taskCenterText("revealFailed"), "error");
      });
      return;
    }
    if (_0x685b23 === "copy-error") {
      const _0x93ab1f = this.tasks.get(taskId);
      const _0x348f55 = _0x93ab1f?.error || "";
      if (!_0x348f55) {
        return;
      }
      const _0x3f383d = desktopBridge.clipboard.canUseText() ? desktopBridge.clipboard.writeText({
        text: _0x348f55
      }) : globalThis.navigator?.clipboard?.writeText?.(_0x348f55);
      if (!_0x3f383d) {
        window.showToast?.(taskCenterText("copyFailed"), "error");
        return;
      }
      Promise.resolve(_0x3f383d).then(() => window.showToast?.(taskCenterText("copySuccess"), "success")).catch(() => window.showToast?.(taskCenterText("copyFailed"), "error"));
    }
  }
}
export function initTaskCenterManager(_0x3fe27d = {}) {
  if (globalThis.window?.__aiCanvasTaskCenterManager) {
    return globalThis.window.__aiCanvasTaskCenterManager;
  }
  const _0x4c451c = new TaskCenterManager(_0x3fe27d);
  globalThis.window.__aiCanvasTaskCenterManager = _0x4c451c;
  return _0x4c451c;
}
