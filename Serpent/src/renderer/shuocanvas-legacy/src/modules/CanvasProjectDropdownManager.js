import * as a947_0x475d5d from "./project.js";
import { commit } from "./history.js";
import { clearElement, setStaticInnerHTML, setText } from "../utils/dom.js";
import { buildUniqueCanvasName, stripCanvasProjectFileExtension } from "../utils/canvasProjectFileNames.js";
import { sanitizeMultiCanvasDataForPersistence } from "../utils/thumbnailPersistence.js";
import { canUseDesktopProjectApi, exportDesktopProjectPackage, importDesktopProjectPackage, openDesktopProject, saveDesktopProject } from "../services/desktopProjectService.js";
import { deleteV2ProjectFromServer, fetchV2ProjectsFromServer, renameV2ProjectOnServer } from "../../api/projectsV2Api.js";
import { showContextMenu } from "./interaction/contextMenuPresenter.js";
import { closeSidebarSubmenu, registerSidebarSubmenu } from "./sidebarSubmenuController.js";
import { t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { CANVAS_TOOLBAR_PLACEMENT_EVENT, normalizeCanvasToolbarPlacement } from "./canvasToolbarPlacement.js";
function projectDropdownText(_0x1e41bb, _0x3bc75d = {}) {
  return t("projectDropdown." + _0x1e41bb, _0x3bc75d);
}
function stripProjectFileExtensionFromName(_0x57df83) {
  return stripCanvasProjectFileExtension(_0x57df83);
}
const CanvasProjectDropdownManager = {
  init(_0x51ecd0 = {}) {
    const _0x19fad1 = 12;
    const _0x3edd5f = 12;
    const _0xa9dec = document.getElementById("btnCanvasLogo");
    const _0x3e8b09 = document.getElementById("canvasProjDropdown");
    const _0x23ac13 = _0x3e8b09?.querySelector(".cpd-header");
    const _0x3c789d = document.getElementById("canvasProjList");
    const _0xb2ca28 = document.getElementById("btnCloseProjDropdown");
    const _0xf388cb = document.getElementById("btnNewCanvas");
    const _0x465980 = document.getElementById("saveDialogOverlay");
    const _0x5a3743 = document.getElementById("saveDialogInput");
    const _0x3acb7e = document.getElementById("saveDialogCancel");
    const _0xb5c03f = document.getElementById("saveDialogConfirm");
    const _0xe780d1 = typeof _0x51ecd0.getCanvasToolbarPlacement === "function" ? _0x51ecd0.getCanvasToolbarPlacement : () => "left";
    const _0x1675ac = typeof _0x51ecd0.onProjectHydrated === "function" ? _0x51ecd0.onProjectHydrated : () => {};
    const _0x2ef365 = typeof _0x51ecd0.renameTemporaryProject === "function" ? _0x51ecd0.renameTemporaryProject : () => false;
    let _0x88d877 = null;
    const _0x57ded8 = _0x51ecd0.projectWorkspaceSessions || {
      async save() {},
      async load() {
        return null;
      },
      async clear() {},
      async move() {}
    };
    let _0x55930a = null;
    let _0x28cf77 = 0;
    let _0x3559a3 = false;
    if (!_0xa9dec || !_0x3e8b09 || !_0x465980) {
      return;
    }
    document.body.appendChild(_0x3e8b09);
    function _0xbd0dc1() {
      if (!_0xa9dec || !_0x3e8b09) {
        return;
      }
      const _0x344c30 = _0xa9dec.getBoundingClientRect();
      const _0x3c5832 = _0x3e8b09.classList.contains("open");
      if (!_0x3c5832) {
        _0x3e8b09.classList.add("open");
      }
      const _0x5a724a = _0x3e8b09.getBoundingClientRect().height || _0x3e8b09.offsetHeight || 0;
      const _0x55cafe = _0x3e8b09.getBoundingClientRect().width || _0x3e8b09.offsetWidth || 0;
      const _0x50310a = normalizeCanvasToolbarPlacement(_0xe780d1());
      _0x3e8b09.dataset.placement = _0x50310a;
      if (_0x50310a === "bottom") {
        const _0x352297 = window.innerWidth - _0x55cafe - _0x3edd5f;
        const _0x1a315a = _0x344c30.left + (_0x344c30.width - _0x55cafe) / 2;
        const _0x31fa02 = _0x352297 <= _0x3edd5f ? _0x3edd5f : Math.min(Math.max(_0x1a315a, _0x3edd5f), _0x352297);
        const _0x5b4d63 = Math.max(_0x3edd5f, _0x344c30.top - _0x19fad1 - _0x5a724a);
        _0x3e8b09.style.left = _0x31fa02 + "px";
        _0x3e8b09.style.top = _0x5b4d63 + "px";
        if (!_0x3c5832) {
          _0x3e8b09.classList.remove("open");
        }
        return;
      }
      const _0x16a698 = _0x344c30.top + (_0x344c30.height - _0x5a724a) / 2;
      const _0x48ab88 = window.innerHeight - _0x5a724a - _0x3edd5f;
      const _0x2aa376 = _0x48ab88 <= _0x3edd5f ? _0x3edd5f : Math.min(Math.max(_0x16a698, _0x3edd5f), _0x48ab88);
      const _0x4c6f9d = Math.max(_0x3edd5f, window.innerWidth - _0x55cafe - _0x3edd5f);
      const _0x4d70d8 = _0x50310a === "right" ? _0x344c30.left - _0x19fad1 - _0x55cafe : _0x344c30.right + _0x19fad1;
      const _0x373fca = Math.min(Math.max(_0x4d70d8, _0x3edd5f), _0x4c6f9d);
      _0x3e8b09.style.left = _0x373fca + "px";
      _0x3e8b09.style.top = _0x2aa376 + "px";
      if (!_0x3c5832) {
        _0x3e8b09.classList.remove("open");
      }
    }
    function _0x250bca(_0x2bfbf4) {
      const _0x3777f1 = new Date(_0x2bfbf4 * 1000);
      return _0x3777f1.getFullYear() + "-" + String(_0x3777f1.getMonth() + 1).padStart(2, "0") + "-" + String(_0x3777f1.getDate()).padStart(2, "0") + " " + String(_0x3777f1.getHours()).padStart(2, "0") + ":" + String(_0x3777f1.getMinutes()).padStart(2, "0");
    }
    function _0x3dc43b() {
      const _0x498024 = document.getElementById("projectNameText");
      return String(_0x498024?.textContent || "").trim() || projectDropdownText("unnamedCanvas");
    }
    function _0x5eb21c() {
      const _0x4b0bfb = window.CanvasTabManager;
      const _0x186bc9 = String(_0x4b0bfb?.getActiveCanvasId?.() || _0x4b0bfb?._activeId || "").trim();
      const _0x46b08e = Array.isArray(_0x4b0bfb?._canvases) ? _0x4b0bfb._canvases : [];
      const _0x33b372 = _0x46b08e.find(_0x28ffff => String(_0x28ffff?.id || "") === _0x186bc9) || _0x46b08e[0];
      return String(_0x33b372?.name || "").trim();
    }
    function _0x114100(_0x565667) {
      const _0x5e0876 = String(_0x565667 || "").trim();
      if (!_0x5e0876) {
        return true;
      }
      const _0x33d846 = new Set(["新项目", "New project", projectDropdownText("unnamedCanvas"), t("project.newProject"), t("projectManager.newProjectFallback"), t("projectLifecycle.untitledProject"), t("projectLifecycle.untitledCanvas"), t("projectLifecycle.defaultCanvas"), t("canvasTabs.defaultCanvasName"), t("canvasTabs.untitledCanvas")].map(_0x381f6e => String(_0x381f6e || "").trim()).filter(Boolean));
      if (_0x33d846.has(_0x5e0876)) {
        return true;
      }
      return /^(?:画布|Canvas)\s+\d+$/i.test(_0x5e0876);
    }
    function _0x1ea61c(_0x5cac5d) {
      return stripProjectFileExtensionFromName(_0x5cac5d).replace(/\s+/g, " ").trim().toLowerCase();
    }
    function _0xa86cb4(_0x5412b6, _0x8f56f4) {
      const _0x4740e6 = _0x1ea61c(_0x8f56f4);
      if (!_0x4740e6) {
        return false;
      }
      return [_0x5412b6?.name, _0x5412b6?.filename].some(_0x29f004 => _0x1ea61c(_0x29f004) === _0x4740e6);
    }
    function _0x27c205(_0x5ea985, _0x2a9407, _0x4a1ccf) {
      const _0x3d5b84 = String(_0x4a1ccf?.filename || "").trim();
      const _0x55914b = String(_0x5ea985?.filename || "").trim();
      return _0x55914b !== _0x3d5b84 && _0xa86cb4(_0x5ea985, _0x2a9407);
    }
    async function _0x4037f0(_0x1fc172) {
      const _0x2f3fdf = await fetchV2ProjectsFromServer();
      return _0x2f3fdf.some(_0x356f37 => _0xa86cb4(_0x356f37, _0x1fc172));
    }
    async function _0x1d55bb(_0xaefb8f, _0x38d5f5) {
      const _0x5b4e9c = await fetchV2ProjectsFromServer();
      return _0x5b4e9c.some(_0x3feecc => _0x27c205(_0x3feecc, _0xaefb8f, _0x38d5f5));
    }
    function _0x86ff19() {
      const _0x46ec23 = _0x5eb21c();
      if (_0x46ec23) {
        return _0x46ec23;
      }
      return _0x3dc43b();
    }
    function _0x3228ec() {
      return window.CanvasTabManager?.getMultiDataSnapshot?.({
        sanitizeForPersistence: true
      }) || {
        canvases: [],
        activeCanvasId: null
      };
    }
    function _0x4d30ef() {
      return stripProjectFileExtensionFromName(window.currentProjectId || window._v2CurrentFile || "");
    }
    function _0x323be1() {
      return window.CanvasTabManager?.getCanvasProjectContext?.() || {
        projectId: window.currentProjectId || "",
        filename: window._v2CurrentFile || "",
        projectName: _0x3dc43b(),
        recentId: window._v2CurrentRecentProjectId || "",
        displayPath: window._v2CurrentProjectDisplayPath || "",
        lastModified: Number(window._v2CurrentProjectLastModified || 0) || 0,
        isTemporary: false,
        workspaceProjectScoped: window._v2WorkspaceProjectScoped !== false
      };
    }
    function _0x42adfc(_0xc67297 = {}, _0x4529b6 = {}) {
      const _0x45b10e = String(_0xc67297.filename || _0x4529b6.filename || "").trim();
      return {
        projectId: String(_0xc67297.projectId || _0x4529b6.projectId || stripProjectFileExtensionFromName(_0x45b10e)).trim(),
        filename: _0x45b10e,
        projectName: String(_0xc67297.projectName || _0x4529b6.projectName || stripProjectFileExtensionFromName(_0x45b10e)).trim(),
        recentId: String(_0xc67297.recentId || _0x4529b6.recentId || "").trim(),
        displayPath: String(_0xc67297.displayPath || _0x4529b6.displayPath || "").trim(),
        lastModified: Number(_0xc67297.lastModified || _0x4529b6.lastModified || 0) || 0,
        isTemporary: _0xc67297.isTemporary === true,
        workspaceProjectScoped: true
      };
    }
    function _0x986690() {
      const _0x45f7e5 = _0x3228ec();
      if (window._v2WorkspaceProjectScoped === true) {
        return _0x45f7e5;
      }
      const _0x438aee = Array.isArray(_0x45f7e5?.canvases) ? _0x45f7e5.canvases : [];
      const _0x48ad72 = _0x438aee.find(_0x87506c => _0x87506c?.id === _0x45f7e5.activeCanvasId) || _0x438aee[0] || null;
      return {
        ..._0x45f7e5,
        canvases: _0x48ad72 ? [_0x48ad72] : [],
        activeCanvasId: _0x48ad72?.id || null
      };
    }
    async function _0x19b7a6(_0x314860 = "") {
      const _0x8549eb = _0x4d30ef();
      const _0x5260ee = new Set([_0x314860, _0x8549eb].map(stripProjectFileExtensionFromName).filter(Boolean));
      if (window.CanvasTabManager?.hasDirtyCanvases?.() === true) {
        await _0x57ded8.save({
          projectId: _0x8549eb,
          projectName: _0x3dc43b(),
          multiData: _0x986690(),
          hasUnsavedChanges: true
        });
        _0x5260ee.delete(_0x8549eb);
      }
      await Promise.all(Array.from(_0x5260ee, _0x534cb9 => _0x57ded8.clear(_0x534cb9)));
    }
    function _0x2d8ca4(_0x1ad0e7 = {}) {
      const _0x2ad69e = _0x3228ec();
      const _0x1d560f = Array.isArray(_0x2ad69e?.canvases) ? _0x2ad69e.canvases : [];
      if (!_0x1d560f.length) {
        return {
          projectName: String(_0x1ad0e7.projectName || _0x3dc43b()).trim(),
          multiData: _0x2ad69e
        };
      }
      const _0x486bfd = String(_0x1ad0e7.canvasId || window.CanvasTabManager?.getActiveCanvasId?.() || _0x2ad69e.activeCanvasId || "").trim();
      const _0x2274c4 = _0x1d560f.find(_0x516f9a => String(_0x516f9a?.id || "") === _0x486bfd) || _0x1d560f.find(_0x53385c => String(_0x53385c?.id || "") === String(_0x2ad69e.activeCanvasId || "")) || _0x1d560f[0];
      const _0x4d00e3 = String(_0x1ad0e7.projectName || _0x2274c4?.name || _0x3dc43b()).trim();
      const _0x3fcf2b = _0x2274c4 && _0x1ad0e7.renameActiveCanvas ? {
        ..._0x2274c4,
        name: _0x4d00e3
      } : _0x2274c4;
      return {
        projectName: _0x4d00e3,
        multiData: {
          ..._0x2ad69e,
          canvases: _0x3fcf2b ? [_0x3fcf2b] : [],
          activeCanvasId: _0x3fcf2b?.id || _0x486bfd || null
        }
      };
    }
    function _0x3167e9(_0x3ba53b = [], _0x5358f2 = 3) {
      const _0x26d568 = Array.isArray(_0x3ba53b) ? _0x3ba53b.map(_0x135f5a => String(_0x135f5a?.localPath || _0x135f5a?.url || _0x135f5a || "").trim()).filter(Boolean) : [];
      if (!_0x26d568.length) {
        return "";
      }
      const _0x5cc9f5 = _0x26d568.slice(0, _0x5358f2).join(projectDropdownText("listSeparator"));
      if (_0x26d568.length > _0x5358f2) {
        return projectDropdownText("listMore", {
          items: _0x5cc9f5,
          count: _0x26d568.length
        });
      } else {
        return _0x5cc9f5;
      }
    }
    function _0x174a36(_0x2ee796 = {}) {
      if (_0x2ee796.code === "MISSING_LOCAL_ASSETS") {
        const _0x410443 = _0x3167e9(_0x2ee796.missing);
        if (_0x410443) {
          return projectDropdownText("packageExport.missingLocalWithSummary", {
            summary: _0x410443
          });
        } else {
          return projectDropdownText("packageExport.missingLocal");
        }
      }
      if (_0x2ee796.code === "REMOTE_MEDIA_NOT_LOCALIZED") {
        const _0x14f62f = _0x3167e9(_0x2ee796.remoteMedia);
        if (_0x14f62f) {
          return projectDropdownText("packageExport.remoteNotLocalizedWithSummary", {
            summary: _0x14f62f
          });
        } else {
          return projectDropdownText("packageExport.remoteNotLocalized");
        }
      }
      return _0x2ee796.message || projectDropdownText("packageExport.failed");
    }
    function _0x38dccf(_0x2e371c = []) {
      const _0x318dd1 = Array.isArray(_0x2e371c) ? _0x2e371c : [];
      const _0x105abc = _0x318dd1.filter(_0x466191 => _0x466191?.type === "missing-original-video-fallback").length;
      if (_0x105abc <= 0) {
        return "";
      }
      return projectDropdownText("packageExport.missingOriginalVideos", {
        count: _0x105abc
      });
    }
    function _0x4dbfbe(_0xd0ee35 = "pkg") {
      return _0xd0ee35 + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    }
    let _0x3159a8 = null;
    function _0x11b741(_0x502a7d) {
      const _0x4a0137 = Math.max(0, Math.floor((Date.now() - _0x502a7d) / 1000));
      if (_0x4a0137 < 60) {
        return projectDropdownText("elapsedSeconds", {
          seconds: _0x4a0137
        });
      }
      const _0xeb4571 = Math.floor(_0x4a0137 / 60);
      const _0x219e67 = String(_0x4a0137 % 60).padStart(2, "0");
      return projectDropdownText("elapsedMinutesSeconds", {
        minutes: _0xeb4571,
        seconds: _0x219e67
      });
    }
    function _0x2327b1(_0x468d58 = {}) {
      const _0x4f8955 = String(_0x468d58?.message || projectDropdownText("packageProcessing")).trim();
      const _0x4f2de7 = Number(_0x468d58?.progress);
      if (!Number.isFinite(_0x4f2de7) || _0x4f2de7 < 0) {
        return _0x4f8955;
      }
      return _0x4f8955 + " · " + Math.round(Math.max(0, Math.min(1, _0x4f2de7)) * 100) + "%";
    }
    function _0x34d816(_0x143006 = {}) {
      if (!_0x3159a8) {
        return;
      }
      const {
        root: _0x138cfb,
        titleEl: _0xb4c72a,
        messageEl: _0x1878da,
        elapsedEl: _0xbdb9ca,
        progressEl: _0x52cf35,
        startedAt: _0x20d711
      } = _0x3159a8;
      const _0x1014e6 = String(_0x143006?.title || projectDropdownText("collectingCurrentProject")).trim();
      const _0x46b5ae = _0x2327b1(_0x143006);
      const _0x3837ca = _0x11b741(_0x20d711);
      const _0x340ddb = Number(_0x143006?.progress);
      const _0x22fbb2 = Number.isFinite(_0x340ddb) && _0x340ddb >= 0;
      setText(_0xb4c72a, _0x1014e6);
      setText(_0x1878da, _0x46b5ae);
      setText(_0xbdb9ca, _0x3837ca);
      _0x138cfb.setAttribute("aria-label", _0x1014e6 + "，" + _0x46b5ae + "，" + _0x3837ca);
      if (_0x22fbb2) {
        _0x138cfb.classList.add("has-progress");
      } else {
        _0x138cfb.classList.remove("has-progress");
      }
      _0x52cf35.hidden = !_0x22fbb2;
      if (_0x22fbb2) {
        _0x52cf35.value = Math.max(0, Math.min(1, _0x340ddb));
      }
      _0x3159a8.lastPayload = _0x143006;
    }
    function _0x501960(_0x58d184 = {}) {
      if (typeof document === "undefined" || !document.body) {
        return;
      }
      if (_0x3159a8?.root) {
        _0x34d816(_0x58d184);
        return;
      }
      document.getElementById?.("project-package-loading")?.remove?.();
      const _0x3c88fb = document.createElement("div");
      _0x3c88fb.id = "project-package-loading";
      _0x3c88fb.className = "project-package-loading is-visible";
      _0x3c88fb.setAttribute("role", "status");
      _0x3c88fb.setAttribute("aria-live", "polite");
      const _0x1dc1d2 = document.createElement("div");
      _0x1dc1d2.className = "project-package-loading-panel";
      const _0x588541 = document.createElement("div");
      _0x588541.className = "project-package-loading-spinner";
      _0x588541.setAttribute("aria-hidden", "true");
      const _0x40fdc8 = document.createElement("div");
      _0x40fdc8.className = "project-package-loading-body";
      const _0x80de8b = document.createElement("div");
      _0x80de8b.className = "project-package-loading-title";
      const _0x5b8eb5 = document.createElement("div");
      _0x5b8eb5.className = "project-package-loading-message";
      const _0x4caa55 = document.createElement("div");
      _0x4caa55.className = "project-package-loading-meta";
      const _0x7ea310 = document.createElement("span");
      _0x7ea310.className = "project-package-loading-elapsed";
      _0x4caa55.appendChild(_0x7ea310);
      const _0x37b01c = document.createElement("progress");
      _0x37b01c.className = "project-package-loading-progress";
      _0x37b01c.max = 1;
      _0x37b01c.value = 0;
      _0x37b01c.hidden = true;
      _0x40fdc8.appendChild(_0x80de8b);
      _0x40fdc8.appendChild(_0x5b8eb5);
      _0x40fdc8.appendChild(_0x4caa55);
      _0x40fdc8.appendChild(_0x37b01c);
      _0x1dc1d2.appendChild(_0x588541);
      _0x1dc1d2.appendChild(_0x40fdc8);
      _0x3c88fb.appendChild(_0x1dc1d2);
      document.body.appendChild(_0x3c88fb);
      const _0x1bbb5c = typeof window.setInterval === "function" ? window.setInterval.bind(window) : setInterval;
      _0x3159a8 = {
        root: _0x3c88fb,
        titleEl: _0x80de8b,
        messageEl: _0x5b8eb5,
        elapsedEl: _0x7ea310,
        progressEl: _0x37b01c,
        startedAt: Date.now(),
        lastPayload: _0x58d184,
        timerId: _0x1bbb5c(() => {
          _0x34d816(_0x3159a8?.lastPayload || {});
        }, 1000)
      };
      _0x34d816(_0x58d184);
    }
    function _0x4eba26(_0x1ba0bb = {}) {
      if (!_0x3159a8) {
        _0x501960(_0x1ba0bb);
      }
      _0x34d816(_0x1ba0bb);
    }
    async function _0x5906de() {
      if (typeof window.requestAnimationFrame === "function") {
        await new Promise(_0x53c50c => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(_0x53c50c);
          });
        });
        return;
      }
      const _0x2dab5a = typeof window.setTimeout === "function" ? window.setTimeout.bind(window) : setTimeout;
      await new Promise(_0x2adc9c => _0x2dab5a(_0x2adc9c, 0));
    }
    async function _0x5ad353(_0x2931d9 = projectDropdownText("loadingProjectDefault")) {
      _0x501960({
        title: projectDropdownText("loadingProjectTitle"),
        message: _0x2931d9
      });
      await _0x5906de();
    }
    function _0x12828f() {
      if (!_0x3159a8) {
        return;
      }
      const _0x187a80 = _0x3159a8;
      _0x3159a8 = null;
      const _0x667759 = typeof window.clearInterval === "function" ? window.clearInterval.bind(window) : clearInterval;
      const _0x204708 = typeof window.setTimeout === "function" ? window.setTimeout.bind(window) : setTimeout;
      _0x667759(_0x187a80.timerId);
      _0x187a80.root.classList.remove("is-visible");
      _0x187a80.root.classList.add("is-hiding");
      _0x204708(() => _0x187a80.root.remove?.(), 180);
    }
    function _0x3cceba(_0x31ecb1, {
      title = projectDropdownText("collectingCurrentProject")
    } = {}) {
      if (!desktopBridge.project.isAvailable()) {
        return () => {};
      }
      const _0x15eb5e = desktopBridge.project.onPackageProgress((_0x1bca09 = {}) => {
        if (String(_0x1bca09?.operationId || "") !== _0x31ecb1) {
          return;
        }
        _0x4eba26({
          title: title,
          ..._0x1bca09
        });
      });
      if (typeof _0x15eb5e === "function") {
        return _0x15eb5e;
      } else {
        return () => {};
      }
    }
    function _0x11c0a3(_0x229bff) {
      if (!_0x229bff) {
        return;
      }
      _0x229bff.classList.remove("is-shaking");
      _0x229bff.offsetWidth;
      _0x229bff.classList.add("is-shaking");
      window.setTimeout(() => {
        _0x229bff.classList.remove("is-shaking");
      }, 240);
    }
    function _0x1e294a(_0x245004, _0x8ada2c, _0x49e052) {
      _0x11c0a3(_0x245004);
      window.setTimeout(() => {
        _0x8ada2c.hidden = true;
        _0x49e052.hidden = false;
      }, 180);
    }
    function _0x330a60() {
      _0x88d877?.close?.();
      _0x88d877 = null;
    }
    function _0x10098c(_0x4ceeb8) {
      return !!_0x4ceeb8?.closest?.("[data-sidebar-submenu-owner=\"canvas-project\"]");
    }
    function _0x5bb643(_0x3121e2) {
      return _0x1ea61c(_0x3121e2);
    }
    function _0x199129(_0x5012a4) {
      const _0x2661f2 = _0x5bb643(_0x5012a4?.filename);
      const _0x43ccbd = _0x5bb643(stripProjectFileExtensionFromName(_0x5012a4?.filename));
      const _0x3195d4 = _0x5bb643(window._v2CurrentFile);
      const _0x41f23f = _0x5bb643(window.currentProjectId);
      return !!_0x2661f2 && (_0x2661f2 === _0x3195d4 || _0x2661f2 === _0x41f23f || _0x43ccbd === _0x41f23f);
    }
    function _0x59d6e8(_0xa0eb59, _0x143b0a, _0x461bb1 = {}) {
      const _0x2133e1 = window.CanvasTabManager;
      const _0x48fb30 = _0x2133e1?.findCanvasIdByProjectIdentity?.({
        projectId: stripProjectFileExtensionFromName(_0xa0eb59?.filename),
        filename: _0xa0eb59?.filename,
        projectName: _0xa0eb59?.name || stripProjectFileExtensionFromName(_0xa0eb59?.filename)
      }) || "";
      if (!_0x48fb30 && !_0x199129(_0xa0eb59)) {
        return;
      }
      const _0x2f5018 = String(_0x461bb1.filename || _0xa0eb59?.filename || "").trim();
      const _0x5e645d = _0x48fb30 || _0x2133e1?.getActiveCanvasId?.() || _0x2133e1?._activeId;
      if (_0x5e645d) {
        _0x2133e1?.setCanvasProjectContext?.(_0x5e645d, {
          ...(_0x2133e1?.getCanvasProjectContext?.(_0x5e645d) || _0x323be1()),
          projectId: _0x2f5018 ? stripProjectFileExtensionFromName(_0x2f5018) : _0x143b0a,
          filename: _0x2f5018,
          projectName: _0x143b0a,
          recentId: "",
          displayPath: "",
          lastModified: 0,
          isTemporary: false
        });
        _0x2133e1?.renameCanvas?.(_0x5e645d, _0x143b0a);
      }
      _0x2133e1?.renderTabs?.();
    }
    async function _0x360c90(_0x598575, _0x37b2a3, _0x4147fc = {}) {
      const _0x4ec63f = String(_0x37b2a3 || "").replace(/\s+/g, " ").trim();
      if (!_0x4ec63f) {
        throw new Error(projectDropdownText("renameFailed"));
      }
      const _0xdbda62 = await _0x1d55bb(_0x4ec63f, _0x598575);
      if (_0xdbda62) {
        throw new Error(projectDropdownText("nameExists"));
      }
      const _0x4f0aa1 = await renameV2ProjectOnServer(_0x598575.filename, _0x4ec63f);
      if (!_0x4f0aa1?.success) {
        throw new Error(projectDropdownText("renameFailed"));
      }
      const _0x22e19c = _0x598575.filename;
      _0x59d6e8(_0x598575, _0x4ec63f, _0x4f0aa1);
      _0x598575.name = _0x4ec63f;
      if (_0x4f0aa1.filename) {
        _0x598575.filename = _0x4f0aa1.filename;
      }
      await _0x57ded8.move(_0x22e19c, _0x4f0aa1.filename || _0x4ec63f, {
        projectName: _0x4ec63f
      });
      if (_0x4147fc.showSuccessToast !== false) {
        _0x5f2ee0(projectDropdownText("renamed", {
          name: _0x4ec63f
        }));
      }
      if (_0x4147fc.refreshList !== false) {
        await _0x4f4292();
      }
      return {
        ..._0x4f0aa1,
        name: _0x4ec63f,
        filename: _0x4f0aa1.filename || _0x598575.filename
      };
    }
    function _0x359b3b(_0x1478a4, _0x5c5502) {
      _0x330a60();
      if (!_0x5c5502 || _0x5c5502.parentElement?.querySelector?.(".cpd-item-rename-input")) {
        return;
      }
      const _0x20df4f = String(_0x1478a4?.name || stripProjectFileExtensionFromName(_0x1478a4?.filename) || "").trim();
      const _0x1f4544 = document.createElement("input");
      _0x1f4544.type = "text";
      _0x1f4544.className = "cpd-item-rename-input";
      _0x1f4544.value = _0x20df4f;
      _0x1f4544.setAttribute("aria-label", projectDropdownText("renameAria", {
        name: _0x20df4f
      }));
      let _0x528d61 = false;
      let _0x396dd5 = false;
      const _0x1473f = () => {
        _0x1f4544.remove?.();
        _0x5c5502.hidden = false;
      };
      const _0x168fe1 = () => {
        if (_0x396dd5) {
          return;
        }
        _0x396dd5 = true;
        _0x1473f();
      };
      const _0x312b20 = async () => {
        if (_0x396dd5 || _0x528d61) {
          return;
        }
        const _0x2c7f62 = String(_0x1f4544.value || "").replace(/\s+/g, " ").trim();
        if (!_0x2c7f62 || _0x2c7f62 === _0x20df4f) {
          _0x168fe1();
          return;
        }
        _0x528d61 = true;
        _0x1f4544.disabled = true;
        try {
          await _0x360c90(_0x1478a4, _0x2c7f62, {
            refreshList: false
          });
          setText(_0x5c5502, _0x2c7f62);
          _0x396dd5 = true;
          _0x1473f();
          await _0x4f4292();
        } catch (_0x110318) {
          _0x528d61 = false;
          _0x1f4544.disabled = false;
          _0x5f2ee0(_0x110318?.message || projectDropdownText("renameFailed"), "error");
          _0x1f4544.focus?.();
          _0x1f4544.select?.();
        }
      };
      _0x1f4544.addEventListener("keydown", _0x38624d => {
        if (_0x38624d.key === "Enter") {
          _0x38624d.preventDefault();
          _0x312b20();
          return;
        }
        if (_0x38624d.key === "Escape") {
          _0x38624d.preventDefault();
          _0x168fe1();
        }
      });
      _0x1f4544.addEventListener("blur", () => {
        _0x312b20();
      });
      _0x5c5502.hidden = true;
      _0x5c5502.parentElement?.appendChild(_0x1f4544);
      _0x1f4544.focus?.();
      _0x1f4544.select?.();
    }
    function _0x28c612() {
      return _0x3c789d?.querySelector?.(".cpd-item-rename-input") || null;
    }
    function _0xaf9b10(_0x58179c, _0x2ad2fc) {
      return !!_0x58179c && (_0x2ad2fc === _0x58179c || _0x58179c.contains?.(_0x2ad2fc));
    }
    function _0x5f32fb(_0xc5f07c) {
      _0xc5f07c.preventDefault?.();
      _0xc5f07c.stopPropagation?.();
      _0xc5f07c.stopImmediatePropagation?.();
    }
    _0x3c789d?.addEventListener("pointerdown", _0x4728b2 => {
      const _0x4b78ed = _0x28c612();
      if (!_0x4b78ed || _0xaf9b10(_0x4b78ed, _0x4728b2.target)) {
        return;
      }
      _0x3559a3 = true;
      setTimeout(() => {
        _0x3559a3 = false;
      }, 0);
      _0x5f32fb(_0x4728b2);
      _0x4b78ed.blur?.();
    }, true);
    _0x3c789d?.addEventListener("click", _0x5f03ce => {
      const _0x295fba = _0x28c612();
      if (_0x295fba && _0xaf9b10(_0x295fba, _0x5f03ce.target)) {
        return;
      }
      if (!_0x295fba && !_0x3559a3) {
        return;
      }
      _0x3559a3 = false;
      _0x5f32fb(_0x5f03ce);
      _0x295fba?.blur?.();
    }, true);
    function _0x22634b(_0x11e357, _0x3bff29, _0x25c09d) {
      _0x11e357.preventDefault();
      _0x11e357.stopPropagation();
      _0x330a60();
      _0x88d877 = showContextMenu(Number(_0x11e357.clientX || _0x11e357.pageX || 0), Number(_0x11e357.clientY || _0x11e357.pageY || 0), [{
        label: projectDropdownText("contextMenu.rename"),
        action: () => _0x359b3b(_0x3bff29, _0x25c09d.nameEl)
      }, {
        label: projectDropdownText("contextMenu.delete"),
        danger: true,
        action: () => _0x1e294a(_0x25c09d.item, _0x25c09d.deleteButton, _0x25c09d.confirmPanel)
      }], {
        ownerElement: _0x25c09d.item,
        ownerRoot: _0x25c09d.item?.parentElement || _0x25c09d.item,
        sidebarSubmenuOwner: "canvas-project"
      });
    }
    function _0xa80cab(_0x3ae5af) {
      const _0x2abd2d = _0x3ae5af?.getBoundingClientRect?.();
      if (!_0x2abd2d) {
        return null;
      }
      const _0xa8621c = Number(_0x2abd2d.left ?? 0);
      const _0x9dc706 = Number(_0x2abd2d.top ?? 0);
      const _0x4b2354 = Number(_0x2abd2d.width);
      const _0x4b5429 = Number(_0x2abd2d.height);
      const _0x3b2606 = Number(_0x2abd2d.right);
      const _0x58ec99 = Number(_0x2abd2d.bottom);
      const _0x42861b = Number.isFinite(_0x4b2354) && _0x4b2354 > 0 ? _0x4b2354 : Number.isFinite(_0x3b2606) ? _0x3b2606 - _0xa8621c : 0;
      const _0x5888c8 = Number.isFinite(_0x4b5429) && _0x4b5429 > 0 ? _0x4b5429 : Number.isFinite(_0x58ec99) ? _0x58ec99 - _0x9dc706 : 0;
      if (!Number.isFinite(_0xa8621c) || !Number.isFinite(_0x9dc706) || !Number.isFinite(_0x42861b) || !Number.isFinite(_0x5888c8) || _0x42861b <= 0 || _0x5888c8 <= 0) {
        return null;
      }
      return {
        left: _0xa8621c,
        top: _0x9dc706,
        width: _0x42861b,
        height: _0x5888c8,
        right: _0xa8621c + _0x42861b,
        bottom: _0x9dc706 + _0x5888c8
      };
    }
    function _0x54f99e(_0x5275b3) {
      if (!_0x5275b3) {
        return null;
      }
      const _0x549837 = Number(window.innerWidth || 0);
      const _0x4390de = Number(window.innerHeight || 0);
      if (_0x549837 <= 0 || _0x4390de <= 0) {
        return _0x5275b3;
      }
      const _0x4d0af5 = Math.max(0, _0x5275b3.left);
      const _0x4425a2 = Math.max(0, _0x5275b3.top);
      const _0x4a5bf6 = Math.min(_0x549837, _0x5275b3.right);
      const _0x505146 = Math.min(_0x4390de, _0x5275b3.bottom);
      const _0x3a3723 = _0x4a5bf6 - _0x4d0af5;
      const _0x244ef9 = _0x505146 - _0x4425a2;
      if (_0x3a3723 <= 0 || _0x244ef9 <= 0) {
        return _0x5275b3;
      }
      return {
        left: _0x4d0af5,
        top: _0x4425a2,
        width: _0x3a3723,
        height: _0x244ef9,
        right: _0x4a5bf6,
        bottom: _0x505146
      };
    }
    function _0x46460c() {
      const _0x36f1ff = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (_0x36f1ff) {
        return;
      }
      const _0x207a1f = _0xa80cab(document.getElementById("v2-canvas")) || _0xa80cab(document.getElementById("v2-wrap"));
      const _0x2e0f4a = _0x54f99e(_0x207a1f);
      const _0x2e3a8c = _0xa80cab(_0xa9dec || document.getElementById("btnCanvasLogo"));
      if (!_0x2e0f4a || !_0x2e3a8c) {
        return;
      }
      const _0x12dae5 = _0x2e0f4a.width / _0x2e0f4a.height || 4 / 3;
      let _0x371b00 = Math.min(_0x2e0f4a.width, Math.max(140, Math.min(360, _0x2e0f4a.width * 0.42)));
      let _0x4ad25b = _0x371b00 / _0x12dae5;
      const _0x49f657 = Math.min(_0x2e0f4a.height, Math.max(96, Math.min(240, _0x2e0f4a.height * 0.42)));
      if (_0x4ad25b > _0x49f657) {
        _0x4ad25b = _0x49f657;
        _0x371b00 = _0x4ad25b * _0x12dae5;
      }
      _0x371b00 = Math.max(1, Math.round(_0x371b00));
      _0x4ad25b = Math.max(1, Math.round(_0x4ad25b));
      const _0x58b332 = _0x2e0f4a.left + _0x2e0f4a.width / 2;
      const _0x2a9221 = _0x2e0f4a.top + _0x2e0f4a.height / 2;
      const _0x28662a = _0x2e3a8c.left + _0x2e3a8c.width / 2;
      const _0x573188 = _0x2e3a8c.top + _0x2e3a8c.height / 2;
      const _0x3eaacf = Math.round(_0x58b332 - _0x371b00 / 2);
      const _0x1ca7fe = Math.round(_0x2a9221 - _0x4ad25b / 2);
      const _0x47d710 = _0x28662a - _0x58b332;
      const _0x151306 = _0x573188 - _0x2a9221;
      const _0x5014fe = document.createElement("div");
      _0x5014fe.className = "v2-project-save-fly";
      _0x5014fe.style.left = _0x3eaacf + "px";
      _0x5014fe.style.top = _0x1ca7fe + "px";
      _0x5014fe.style.width = _0x371b00 + "px";
      _0x5014fe.style.height = _0x4ad25b + "px";
      document.body.appendChild(_0x5014fe);
      const _0x4c7558 = (() => {
        let _0xce9994 = false;
        return () => {
          if (_0xce9994) {
            return;
          }
          _0xce9994 = true;
          _0x5014fe.remove?.();
          if (_0xa9dec?.animate) {
            _0xa9dec.animate([{
              transform: "scale(1)",
              filter: "brightness(1)"
            }, {
              transform: "scale(1.08)",
              filter: "brightness(1.2)"
            }, {
              transform: "scale(1)",
              filter: "brightness(1)"
            }], {
              duration: 260,
              easing: "cubic-bezier(0.2, 0, 0, 1)"
            });
          }
        };
      })();
      if (typeof _0x5014fe.animate === "function") {
        const _0x38c0ad = _0x5014fe.animate([{
          transform: "translate(0,0) scale(1)",
          opacity: 1
        }, {
          transform: "translate(" + _0x47d710 + "px," + _0x151306 + "px) scale(0.12)",
          opacity: 0.18
        }], {
          duration: 560,
          easing: "cubic-bezier(0.2, 0, 0, 1)"
        });
        _0x38c0ad.onfinish = _0x4c7558;
        _0x38c0ad.oncancel = _0x4c7558;
        return;
      }
      window.setTimeout(_0x4c7558, 560);
    }
    function _0x301fcf(_0x328672) {
      return buildUniqueCanvasName(_0x328672, window.CanvasTabManager?._canvases || [], {
        fallbackName: projectDropdownText("loadedPackageBase")
      });
    }
    async function _0x2b0a39(_0x14cc7a, _0x52fcba = {}) {
      if (!_0x14cc7a || _0x14cc7a.canceled) {
        return false;
      }
      const _0xb1e8d6 = _0x42adfc(_0x14cc7a);
      const _0xda2c5e = window.CanvasTabManager;
      const _0x2a6c9f = _0xda2c5e?.findCanvasIdByProjectIdentity?.(_0xb1e8d6) || "";
      if (_0x2a6c9f) {
        _0xda2c5e?.setCanvasProjectContext?.(_0x2a6c9f, {
          ...(_0xda2c5e?.getCanvasProjectContext?.(_0x2a6c9f) || {}),
          ..._0xb1e8d6
        });
        if (_0x2a6c9f !== _0xda2c5e?._activeId) {
          const _0x3e2a2a = await _0xda2c5e.switchTo?.(_0x2a6c9f);
          if (_0x3e2a2a === false) {
            return false;
          }
        }
        const _0x58c6f8 = _0xda2c5e?._canvases?.find(_0x5331ea => _0x5331ea?.id === _0x2a6c9f);
        return {
          activeCanvasId: _0x2a6c9f,
          canvasName: _0x58c6f8?.name || _0xb1e8d6.projectName || projectDropdownText("loadedPackageBase"),
          hydratedData: null,
          alreadyOpen: true
        };
      }
      const _0x699b0f = sanitizeMultiCanvasDataForPersistence(_0x14cc7a.multiData || a947_0x475d5d.resolveCanvasData(_0x14cc7a.data || {}));
      const _0x2b56fa = _0x699b0f.canvases.find(_0x224d9e => _0x224d9e.id === _0x699b0f.activeCanvasId) || _0x699b0f.canvases[0];
      if (!_0x2b56fa) {
        return false;
      }
      const _0x1fe640 = _0x301fcf(_0x14cc7a.projectName || stripProjectFileExtensionFromName(_0x14cc7a.filename) || _0x2b56fa.name || projectDropdownText("loadedPackageBase"));
      if (typeof _0xda2c5e?.addCanvas !== "function") {
        return false;
      }
      const _0x34e70a = await _0xda2c5e.addCanvas();
      if (_0x34e70a === false) {
        return false;
      }
      const _0x562db2 = _0xda2c5e._activeId;
      if (!_0x562db2) {
        return false;
      }
      _0xda2c5e.renameCanvas?.(_0x562db2, _0x1fe640);
      const _0x3f5feb = {
        ..._0x2b56fa,
        name: _0x1fe640
      };
      if (_0x52fcba.applySourceNames && window._v2ApplySourceNamesFromFileNameToCanvas) {
        window._v2ApplySourceNamesFromFileNameToCanvas(_0x3f5feb);
      }
      _0xda2c5e.hydrateActiveCanvasSnapshot?.(_0x3f5feb);
      _0xda2c5e.setCanvasProjectContext?.(_0x562db2, {
        ..._0xb1e8d6,
        projectName: _0xb1e8d6.projectName || _0x1fe640
      });
      _0xda2c5e.markCanvasClean?.(_0x562db2);
      _0xda2c5e.renderTabs?.();
      commit();
      _0x1675ac({
        activeCanvasId: _0x562db2,
        projectContext: _0xb1e8d6
      });
      window._triggerLocalCacheSave?.();
      return {
        activeCanvasId: _0x562db2,
        canvasName: _0x1fe640,
        hydratedData: _0x699b0f
      };
    }
    async function _0x42c36b(_0x25eaea) {
      return !!(await _0x2b0a39(_0x25eaea, {
        applySourceNames: true
      }));
    }
    async function _0x3eaeca(_0x278f3d) {
      return !!(await _0x2b0a39(_0x278f3d));
    }
    async function _0x242009(_0x17f237 = "") {
      let _0x1919de = false;
      try {
        if (_0x17f237) {
          await _0x5ad353(projectDropdownText("readingLocalProject"));
          _0x1919de = true;
        }
        const _0x209562 = await openDesktopProject({
          recentId: _0x17f237
        });
        if (!_0x209562 || _0x209562.canceled) {
          return;
        }
        if (!_0x1919de) {
          await _0x5ad353(projectDropdownText("renderingCanvas"));
          _0x1919de = true;
        } else {
          _0x4eba26({
            title: projectDropdownText("loadingProjectTitle"),
            message: projectDropdownText("renderingCanvas")
          });
          await _0x5906de();
        }
        if (await _0x42c36b(_0x209562)) {
          closeSidebarSubmenu("canvas-project");
          _0x5f2ee0(projectDropdownText("opened", {
            name: _0x209562.projectName || _0x209562.filename
          }));
        }
      } catch (_0x1f4aeb) {
        console.error("[desktopProject] open failed:", _0x1f4aeb);
        _0x5f2ee0(_0x1f4aeb?.message || projectDropdownText("openLocalFailed"), "error");
      } finally {
        _0x12828f();
      }
    }
    async function _0xf006ee(_0x420b75 = {}) {
      if (window.showGlobalLoading) {
        window.showGlobalLoading(projectDropdownText("savingLocal"));
      }
      try {
        const _0x108f95 = _0x2d8ca4(_0x420b75);
        const _0x42e59a = _0x108f95.multiData?.activeCanvasId;
        const _0x1e4024 = _0x323be1();
        const _0x320f8d = await saveDesktopProject(_0x108f95.projectName || _0x3dc43b(), _0x108f95.multiData, {
          mode: "saveAs",
          projectId: _0x1e4024.projectId,
          recentId: _0x1e4024.recentId
        });
        if (!_0x320f8d || _0x320f8d.canceled) {
          return;
        }
        window.CanvasTabManager?.setCanvasProjectContext?.(_0x42e59a, _0x42adfc(_0x320f8d, {
          ..._0x1e4024,
          projectName: _0x108f95.projectName
        }));
        window.CanvasTabManager?.markCanvasClean?.(_0x42e59a);
        _0x5f2ee0(projectDropdownText("saveAsSucceeded", {
          filename: _0x320f8d.filename
        }));
        _0x4f4292();
      } catch (_0x545fe2) {
        console.error("[desktopProject] saveAs failed:", _0x545fe2);
        _0x5f2ee0(_0x545fe2?.message || projectDropdownText("saveAsFailed"), "error");
      } finally {
        if (window.hideGlobalLoading) {
          window.hideGlobalLoading();
        }
      }
    }
    async function _0x1bdef5(_0x39253e = {}) {
      const _0x2bff64 = _0x4dbfbe("export-package");
      const _0xdc45c0 = _0x3cceba(_0x2bff64, {
        title: projectDropdownText("collectingCurrentProject")
      });
      try {
        const _0x2f1dff = _0x2d8ca4(_0x39253e);
        const _0x785ceb = _0x323be1();
        const _0x54a49e = await exportDesktopProjectPackage(_0x2f1dff.projectName || _0x3dc43b(), _0x2f1dff.multiData, {
          projectId: _0x785ceb.projectId,
          recentId: _0x785ceb.recentId,
          displayPath: _0x785ceb.displayPath,
          operationId: _0x2bff64
        });
        if (!_0x54a49e || _0x54a49e.canceled) {
          return;
        }
        if (_0x54a49e.blocked) {
          console.warn("[desktopProject] export package blocked:", _0x54a49e);
          _0x5f2ee0(_0x174a36(_0x54a49e), "error");
          return;
        }
        if (!_0x54a49e.success) {
          _0x5f2ee0(_0x54a49e.message || projectDropdownText("packageExport.failed"), "error");
          return;
        }
        const _0x1b7041 = _0x38dccf(_0x54a49e.warnings);
        if (_0x1b7041) {
          console.warn("[desktopProject] export package warnings:", _0x54a49e.warnings);
          _0x5f2ee0(projectDropdownText("packageExport.collectedWithWarning", {
            filename: _0x54a49e.filename || projectDropdownText("packageFallback"),
            warning: _0x1b7041
          }), "warn");
          return;
        }
        _0x5f2ee0(projectDropdownText("packageExport.collected", {
          filename: _0x54a49e.filename || projectDropdownText("packageFallback")
        }));
      } catch (_0x223008) {
        console.error("[desktopProject] export package failed:", _0x223008);
        _0x5f2ee0(_0x223008?.message || projectDropdownText("packageExport.failed"), "error");
      } finally {
        _0xdc45c0();
        _0x12828f();
      }
    }
    async function _0xb51ed0({
      path = "",
      file = null
    } = {}) {
      const _0x102215 = _0x4dbfbe("import-package");
      const _0x421b52 = _0x3cceba(_0x102215, {
        title: projectDropdownText("loadingProjectTitle")
      });
      try {
        if (path || file) {
          await _0x5ad353(projectDropdownText("readingProjectPackage"));
        }
        const _0x40511c = await importDesktopProjectPackage({
          path: path,
          file: file,
          operationId: _0x102215
        });
        if (!_0x40511c || _0x40511c.canceled) {
          return _0x40511c;
        }
        if (!_0x3159a8) {
          await _0x5ad353(projectDropdownText("renderingProjectPackage"));
        } else {
          _0x4eba26({
            title: projectDropdownText("loadingProjectTitle"),
            message: projectDropdownText("renderingProjectPackage")
          });
          await _0x5906de();
        }
        if (await _0x3eaeca(_0x40511c)) {
          closeSidebarSubmenu("canvas-project");
          _0x5f2ee0(projectDropdownText("packageImport.loaded", {
            name: _0x40511c.projectName || _0x40511c.filename
          }));
        }
        return _0x40511c;
      } catch (_0x18dc53) {
        console.error("[desktopProject] import package failed:", _0x18dc53);
        _0x5f2ee0(_0x18dc53?.message || projectDropdownText("packageImport.failed"), "error");
        return null;
      } finally {
        _0x421b52();
        _0x12828f();
      }
    }
    function _0x982343(_0x3389f1 = "") {
      return _0xb51ed0({
        path: _0x3389f1
      });
    }
    function _0x541782(_0x889879) {
      return _0xb51ed0({
        file: _0x889879
      });
    }
    async function _0x1257a3(_0x5a8c30) {
      if (!_0x5a8c30 || typeof _0x5a8c30 !== "object") {
        return;
      }
      if (_0x5a8c30.success === false) {
        _0x5f2ee0(_0x5a8c30.error || projectDropdownText("externalOpenFailed"), "error");
        return;
      }
      if (_0x5a8c30.kind === "projectPackage") {
        await _0x982343(_0x5a8c30.path || _0x5a8c30.filePath || "");
        return;
      }
      try {
        await _0x5ad353(projectDropdownText("renderingCanvas"));
        if (await _0x42c36b(_0x5a8c30)) {
          closeSidebarSubmenu("canvas-project");
          _0x5f2ee0(projectDropdownText("opened", {
            name: _0x5a8c30.projectName || _0x5a8c30.filename
          }));
        }
      } catch (_0x28bd35) {
        console.error("[desktopProject] external open failed:", _0x28bd35);
        _0x5f2ee0(_0x28bd35?.message || projectDropdownText("externalOpenFailed"), "error");
      } finally {
        _0x12828f();
      }
    }
    async function _0x5b8fe3(_0x1433fb) {
      const _0x27749d = Array.isArray(_0x1433fb) ? _0x1433fb : [];
      for (const _0x59fa9c of _0x27749d) {
        await _0x1257a3(_0x59fa9c);
      }
    }
    async function _0x1542d1() {
      if (!desktopBridge.project.isAvailable()) {
        return;
      }
      try {
        await _0x5b8fe3(await desktopBridge.project.consumeExternalOpenRequests());
      } catch (_0x1e2211) {
        console.error("[desktopProject] consume external open failed:", _0x1e2211);
        _0x5f2ee0(_0x1e2211?.message || projectDropdownText("externalOpenFailed"), "error");
      }
    }
    function _0x3a0aab() {
      if (!desktopBridge.project.isAvailable()) {
        return;
      }
      if (window.__aiCanvasExternalProjectOpenInstalled) {
        return;
      }
      window.__aiCanvasExternalProjectOpenInstalled = true;
      desktopBridge.project.onExternalOpen(_0x1f0372 => {
        _0x5b8fe3(_0x1f0372);
      });
      _0x1542d1();
    }
    function _0x47c35a({
      iconId: _0xbb49d4,
      title: _0x1c439c,
      onClick: _0x12bae1
    }) {
      const _0x2114fd = document.createElement("button");
      _0x2114fd.type = "button";
      _0x2114fd.className = "cpd-local-action-btn";
      _0x2114fd.dataset.tooltip = _0x1c439c;
      _0x2114fd.setAttribute("aria-label", _0x1c439c);
      setStaticInnerHTML(_0x2114fd, _0xbb49d4);
      _0x2114fd.addEventListener("click", _0x53343d => {
        _0x53343d.preventDefault();
        _0x53343d.stopPropagation();
        _0x12bae1?.();
      });
      return _0x2114fd;
    }
    function _0x2fd324() {
      if (!canUseDesktopProjectApi() || !_0x23ac13) {
        return;
      }
      let _0x1e4301 = _0x23ac13.querySelector(".cpd-local-actions");
      if (_0x1e4301) {
        return;
      }
      _0x1e4301 = document.createElement("div");
      _0x1e4301.className = "cpd-local-actions";
      _0x1e4301.appendChild(_0x47c35a({
        iconId: "iconFolderOpen18",
        title: projectDropdownText("actions.openLocal"),
        onClick: () => _0x242009()
      }));
      _0x1e4301.appendChild(_0x47c35a({
        iconId: "iconSaveAs18",
        title: projectDropdownText("actions.saveAsLocal"),
        onClick: () => _0xf006ee()
      }));
      _0x1e4301.appendChild(_0x47c35a({
        iconId: "iconPackageExport18",
        title: projectDropdownText("actions.collectCurrent"),
        onClick: () => _0x1bdef5()
      }));
      _0x1e4301.appendChild(_0x47c35a({
        iconId: "iconPackageImport18",
        title: projectDropdownText("actions.loadPackage"),
        onClick: () => _0x982343()
      }));
      const _0x25b911 = _0x23ac13.querySelector(".cpd-close");
      _0x23ac13.insertBefore(_0x1e4301, _0x25b911 || null);
    }
    async function _0x4f4292() {
      const _0x58da8b = ++_0x28cf77;
      _0x2fd324();
      clearElement(_0x3c789d);
      const _0x1c783c = document.createElement("div");
      _0x1c783c.className = "cpd-loading";
      _0x1c783c.setAttribute("role", "status");
      _0x1c783c.setAttribute("aria-live", "polite");
      _0x1c783c.setAttribute("aria-busy", "true");
      const _0x41e988 = document.createElement("span");
      _0x41e988.className = "project-package-loading-spinner";
      _0x41e988.setAttribute("aria-hidden", "true");
      const _0xa6ec76 = document.createElement("span");
      setText(_0xa6ec76, projectDropdownText("loading"));
      _0x1c783c.appendChild(_0x41e988);
      _0x1c783c.appendChild(_0xa6ec76);
      _0x3c789d.appendChild(_0x1c783c);
      requestAnimationFrame(_0xbd0dc1);
      try {
        const _0xdd5ee3 = await fetchV2ProjectsFromServer();
        if (_0x58da8b !== _0x28cf77) {
          return;
        }
        if (!_0xdd5ee3.length) {
          clearElement(_0x3c789d);
          const _0x3c7102 = document.createElement("div");
          _0x3c7102.className = "cpd-empty";
          setText(_0x3c7102, projectDropdownText("emptyProjects"));
          _0x3c789d.appendChild(_0x3c7102);
          requestAnimationFrame(_0xbd0dc1);
          return;
        }
        clearElement(_0x3c789d);
        _0xdd5ee3.forEach(_0x31e5e2 => {
          const _0x4d60ef = document.createElement("div");
          _0x4d60ef.className = "cpd-item";
          _0x4d60ef.dataset.filename = _0x31e5e2.filename;
          _0x4d60ef.dataset.name = _0x31e5e2.name;
          const _0x24de44 = document.createElement("div");
          _0x24de44.className = "cpd-item-left";
          const _0x1165c9 = document.createElement("div");
          _0x1165c9.className = "cpd-item-icon";
          setStaticInnerHTML(_0x1165c9, "cpdProjectItemIcon16");
          const _0x308771 = document.createElement("div");
          _0x308771.className = "cpd-item-info";
          const _0x49c3eb = document.createElement("div");
          _0x49c3eb.className = "cpd-item-name";
          setText(_0x49c3eb, _0x31e5e2.name);
          _0x308771.appendChild(_0x49c3eb);
          _0x24de44.appendChild(_0x1165c9);
          _0x24de44.appendChild(_0x308771);
          const _0x58b0d9 = document.createElement("div");
          _0x58b0d9.className = "cpd-item-actions";
          _0x4d60ef.appendChild(_0x24de44);
          _0x4d60ef.appendChild(_0x58b0d9);
          const _0x611718 = document.createElement("div");
          _0x611718.className = "cpd-item-delete";
          setStaticInnerHTML(_0x611718, "iconTrash18");
          const _0x3ed951 = document.createElement("div");
          _0x3ed951.className = "cpd-confirm-panel";
          _0x3ed951.hidden = true;
          const _0x219a9c = document.createElement("button");
          _0x219a9c.type = "button";
          _0x219a9c.className = "cpd-confirm-btn cpd-confirm-btn--danger";
          _0x219a9c.textContent = "✔";
          _0x219a9c.setAttribute("aria-label", projectDropdownText("confirm"));
          const _0x296b63 = document.createElement("button");
          _0x296b63.type = "button";
          _0x296b63.className = "cpd-confirm-btn cpd-confirm-btn--neutral";
          _0x296b63.textContent = "×";
          _0x296b63.setAttribute("aria-label", projectDropdownText("cancel"));
          _0x3ed951.appendChild(_0x219a9c);
          _0x3ed951.appendChild(_0x296b63);
          _0x58b0d9.appendChild(_0x611718);
          _0x58b0d9.appendChild(_0x3ed951);
          _0x24de44.addEventListener("click", _0x3ced46 => {
            _0x3ced46.stopPropagation();
            const _0x2f089b = _0x28c612();
            if (_0x2f089b) {
              if (!_0xaf9b10(_0x2f089b, _0x3ced46.target)) {
                _0x2f089b.blur?.();
              }
              return;
            }
            if (_0x3559a3) {
              _0x3559a3 = false;
              return;
            }
            _0x40af37(_0x31e5e2.filename, _0x31e5e2.name);
          });
          _0x611718.addEventListener("click", _0x1093ef => {
            _0x1093ef.stopPropagation();
            _0x1e294a(_0x4d60ef, _0x611718, _0x3ed951);
          });
          _0x296b63.addEventListener("click", _0x5c4f37 => {
            _0x5c4f37.stopPropagation();
            _0x3ed951.hidden = true;
            _0x611718.hidden = false;
          });
          _0x219a9c.addEventListener("click", async _0x2fdfa3 => {
            _0x2fdfa3.stopPropagation();
            _0x219a9c.textContent = "...";
            const _0x36c2ca = await deleteV2ProjectFromServer(_0x31e5e2.filename);
            if (_0x36c2ca) {
              await _0x57ded8.clear(_0x31e5e2.filename);
              _0x5f2ee0(projectDropdownText("deleted"));
              _0x4f4292();
            } else {
              _0x5f2ee0(projectDropdownText("deleteFailed"));
              _0x219a9c.textContent = "✔";
            }
          });
          _0x4d60ef.addEventListener("contextmenu", _0x2d2003 => {
            _0x22634b(_0x2d2003, _0x31e5e2, {
              item: _0x4d60ef,
              nameEl: _0x49c3eb,
              deleteButton: _0x611718,
              confirmPanel: _0x3ed951
            });
          });
          _0x3c789d.appendChild(_0x4d60ef);
        });
        requestAnimationFrame(_0xbd0dc1);
      } catch (_0x43f29f) {
        if (_0x58da8b !== _0x28cf77) {
          return;
        }
        clearElement(_0x3c789d);
        const _0x159405 = document.createElement("div");
        _0x159405.className = "cpd-empty";
        setText(_0x159405, projectDropdownText("listLoadFailed"));
        _0x3c789d.appendChild(_0x159405);
        requestAnimationFrame(_0xbd0dc1);
      }
    }
    function _0x40af37(_0x31d46a, _0x4ad516) {
      if (_0x55930a) {
        return _0x55930a;
      }
      _0x55930a = _0x5f3e7b(_0x31d46a, _0x4ad516).finally(() => {
        _0x55930a = null;
      });
      return _0x55930a;
    }
    async function _0x5f3e7b(_0x150cc3, _0x214d55) {
      try {
        await _0x5ad353(projectDropdownText("readingProjectData"));
        const _0x43e69e = String(_0x150cc3 || "").trim();
        const _0x338028 = stripProjectFileExtensionFromName(_0x43e69e);
        const _0x67672b = window.CanvasTabManager;
        const _0x23c0db = _0x67672b?.findCanvasIdByProjectIdentity?.({
          projectId: _0x338028,
          filename: _0x43e69e,
          projectName: _0x214d55 || _0x338028
        }) || "";
        if (_0x23c0db) {
          _0x67672b?.setCanvasProjectContext?.(_0x23c0db, {
            ...(_0x67672b?.getCanvasProjectContext?.(_0x23c0db) || {}),
            projectId: _0x338028,
            filename: _0x43e69e,
            projectName: _0x214d55 || _0x338028,
            isTemporary: false,
            workspaceProjectScoped: true
          });
          if (_0x23c0db !== _0x67672b?._activeId) {
            const _0xfd3992 = await _0x67672b.switchTo?.(_0x23c0db);
            if (_0xfd3992 === false) {
              return;
            }
          }
          closeSidebarSubmenu("canvas-project");
          _0x5f2ee0(projectDropdownText("loaded", {
            name: _0x214d55 || _0x338028
          }));
          return;
        }
        let _0x536da9;
        try {
          _0x536da9 = await a947_0x475d5d.loadProjectStrict(_0x43e69e);
        } catch (_0x264af5) {
          console.error("strict project load error:", _0x264af5);
          throw new Error(projectDropdownText("loadFailed"));
        }
        const _0x2ea71d = sanitizeMultiCanvasDataForPersistence(_0x536da9);
        if (!_0x2ea71d?.canvases?.length) {
          throw new Error(projectDropdownText("loadFailed"));
        }
        _0x4eba26({
          title: projectDropdownText("loadingProjectTitle"),
          message: projectDropdownText("renderingCanvas")
        });
        await _0x5906de();
        const _0x3e1232 = _0x214d55 || _0x338028;
        const _0x12c41e = await _0x2b0a39({
          filename: _0x150cc3,
          projectId: _0x338028,
          projectName: _0x3e1232,
          multiData: _0x2ea71d
        }, {
          applySourceNames: true
        });
        if (!_0x12c41e) {
          return;
        }
        closeSidebarSubmenu("canvas-project");
        _0x5f2ee0(projectDropdownText("loaded", {
          name: _0x12c41e.canvasName
        }));
      } catch (_0x24edb6) {
        console.error("load project error:", _0x24edb6);
        _0x5f2ee0(_0x24edb6?.message || projectDropdownText("loadFailed"), "error");
      } finally {
        _0x12828f();
      }
    }
    async function _0x36577c(_0x5ebfe0, _0xb1d089 = {}) {
      try {
        const _0x3a7c65 = _0x4d30ef();
        const _0x2e1d41 = _0x2d8ca4({
          ..._0xb1d089,
          projectName: _0x5ebfe0
        });
        const _0x4d6ee2 = _0x2e1d41.multiData?.activeCanvasId;
        const _0x59f527 = _0x323be1();
        const _0x1c3e46 = _0xb1d089.saveAs === true || _0x59f527.isTemporary ? _0x5ebfe0 : _0x59f527.projectId || _0x5ebfe0;
        const _0x31a141 = await a947_0x475d5d.saveProject(_0x1c3e46, _0x2e1d41.multiData);
        if (_0x31a141?.canceled) {
          return;
        }
        if (_0x31a141.success) {
          window.CanvasTabManager?.setCanvasProjectContext?.(_0x4d6ee2, _0x42adfc(_0x31a141, {
            ..._0x59f527,
            projectId: _0x1c3e46,
            projectName: _0x5ebfe0,
            filename: _0x31a141.filename,
            recentId: "",
            displayPath: "",
            lastModified: 0
          }));
          if (_0xb1d089.renameActiveCanvas) {
            window.CanvasTabManager.renameCanvas(_0x4d6ee2, _0x5ebfe0);
          }
          window.CanvasTabManager.renderTabs();
          window.CanvasTabManager.markCanvasClean(_0x4d6ee2);
          if (window.CanvasTabManager?._activeId === _0x4d6ee2) {
            await _0x19b7a6(_0x3a7c65);
          }
          _0x46460c();
          _0x5f2ee0(projectDropdownText("saveSucceeded", {
            name: _0x5ebfe0
          }));
          await _0x4f4292();
        }
      } catch (_0x3e327d) {
        console.error("[saveProject] JSON 保存失败:", _0x3e327d);
        _0x5f2ee0(projectDropdownText("saveFailed"), "error");
      }
    }
    window._v2SaveProject = _0x36577c;
    window._v2OpenProjectInCanvasTab = _0x40af37;
    window._v2SaveProjectAsLocal = _0xf006ee;
    window._v2ExportCurrentProjectPackage = _0x1bdef5;
    window._v2ImportProjectPackageByPath = _0x982343;
    window._v2ImportProjectPackageFile = _0x541782;
    function _0x5f2ee0(_0x33c2cc, _0x1a55e1 = "ok") {
      window.showToast(_0x33c2cc, _0x1a55e1);
    }
    function _0x34111e() {
      if (!_0xa9dec || !_0x3e8b09) {
        return;
      }
      _0xbd0dc1();
      _0x3e8b09.classList.add("open");
      requestAnimationFrame(_0xbd0dc1);
      _0x4f4292();
    }
    function _0x111967() {
      _0x28cf77 += 1;
      _0x330a60();
      _0x3e8b09.classList.remove("open");
    }
    registerSidebarSubmenu({
      key: "canvas-project",
      button: _0xa9dec,
      panel: _0x3e8b09,
      open: _0x34111e,
      close: _0x111967,
      isOpen: () => _0x3e8b09.classList.contains("open"),
      ignorePointerDown: _0x3ca159 => _0x10098c(_0x3ca159?.target),
      openClass: "open"
    });
    _0xb2ca28?.addEventListener("click", _0x2d7a46 => {
      _0x2d7a46.preventDefault();
      _0x2d7a46.stopPropagation();
      closeSidebarSubmenu("canvas-project");
    });
    _0xf388cb?.addEventListener("click", () => {
      closeSidebarSubmenu("canvas-project");
      window.CanvasTabManager?.addCanvas?.();
      _0x5f2ee0(projectDropdownText("newCanvasCreated"));
    });
    function _0x286dae(_0x4baae2 = {}) {
      const _0x2579c9 = window.CanvasTabManager._canvases.find(_0x6dd8e5 => _0x6dd8e5.id === window.CanvasTabManager._activeId);
      _0x5a3743.value = String(_0x4baae2.defaultName || _0x2579c9?.name || projectDropdownText("unnamedCanvas")).trim();
      _0x465980.classList.add("open");
      setTimeout(() => {
        _0x5a3743.focus();
        _0x5a3743.select();
      }, 80);
    }
    window._openSaveDialog = _0x286dae;
    async function _0x5e50b2() {
      const _0x3953be = _0x86ff19();
      if (!_0x3953be || _0x114100(_0x3953be)) {
        _0x286dae({
          defaultName: _0x3953be
        });
        return false;
      }
      let _0x3db646 = false;
      try {
        _0x3db646 = await _0x4037f0(_0x3953be);
      } catch (_0x4a73dd) {
        console.error("[saveCurrentProjectFromShortcut] 项目列表校验失败:", _0x4a73dd);
        _0x5f2ee0(projectDropdownText("listLoadFailed"), "error");
        return false;
      }
      if (!_0x3db646) {
        _0x286dae({
          defaultName: _0x3953be
        });
        return false;
      }
      return _0x36577c(_0x3953be);
    }
    window._v2SaveProjectFromShortcut = _0x5e50b2;
    CanvasProjectDropdownManager.renameCurrentProject = async _0x4be90c => {
      const _0x1aa3e6 = String(_0x4be90c || "").replace(/\s+/g, " ").trim();
      if (!_0x1aa3e6) {
        return false;
      }
      const _0x3afd03 = _0x323be1();
      const _0x354883 = String(_0x3afd03?.filename || _0x3afd03?.projectId || "").trim();
      if (_0x3afd03?.isTemporary === true || !_0x354883) {
        return Promise.resolve(_0x2ef365(_0x1aa3e6));
      }
      const _0x267eb1 = await _0x360c90({
        filename: _0x354883,
        name: _0x3afd03.projectName || stripProjectFileExtensionFromName(_0x354883)
      }, _0x1aa3e6);
      return _0x267eb1.name;
    };
    function _0x4e90d4() {
      _0x465980.classList.remove("open");
    }
    _0x3acb7e?.addEventListener("click", _0x4e90d4);
    _0xb5c03f?.addEventListener("click", () => {
      const _0x3aad71 = _0x5a3743.value.trim() || projectDropdownText("unnamedCanvas");
      _0x4e90d4();
      _0x36577c(_0x3aad71, {
        renameActiveCanvas: true,
        saveAs: true
      });
    });
    _0x5a3743?.addEventListener("keydown", _0xa1ec29 => {
      if (_0xa1ec29.key === "Enter") {
        _0xa1ec29.preventDefault();
        _0xb5c03f.click();
      }
      if (_0xa1ec29.key === "Escape") {
        _0xa1ec29.preventDefault();
        _0x4e90d4();
      }
    });
    _0x3a0aab();
    window.addEventListener("resize", () => {
      if (_0x3e8b09.classList.contains("open")) {
        _0xbd0dc1();
      }
    });
    window.addEventListener(CANVAS_TOOLBAR_PLACEMENT_EVENT, () => {
      if (_0x3e8b09.classList.contains("open")) {
        _0xbd0dc1();
      }
    });
  }
};
export default CanvasProjectDropdownManager;
export { CanvasProjectDropdownManager };