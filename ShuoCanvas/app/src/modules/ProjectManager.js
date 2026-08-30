import { generateId } from "../core/math.js";
import * as a1169_0x1f3a54 from "./project.js";
import { getProjects as a1169_0x387299, createProject as a1169_0x155d09, deleteProject as a1169_0x30fb98 } from "../../api/legacyProjectsApi.js";
import { commit } from "./history.js";
import { getLocale, t } from "../i18n/index.js";
function projectManagerText(_0x13abfa, _0x17f077 = {}) {
  return t("projectManager." + _0x13abfa, _0x17f077);
}
const projectGallery = document.getElementById("projectGallery");
const projectGrid = document.getElementById("projectGrid");
const ProjectManager = {
  async getProjects() {
    return await a1169_0x387299();
  },
  async createProject(_0x35a9ed) {
    if (!_0x35a9ed) {
      const _0x3ede27 = new Date();
      _0x35a9ed = projectManagerText("defaultProjectName", {
        date: _0x3ede27.toLocaleString(getLocale())
      });
    }
    const _0x5a3041 = generateId("proj");
    return await a1169_0x155d09(_0x5a3041, _0x35a9ed);
  },
  async loadProject(_0x10ffb3) {
    try {
      if (typeof window._v2OpenProjectInCanvasTab === "function") {
        return await window._v2OpenProjectInCanvasTab(_0x10ffb3, _0x10ffb3);
      }
      const _0x254510 = window.CanvasTabManager;
      if (!_0x254510?.addCanvas || !_0x254510?.hydrateActiveCanvasSnapshot) {
        throw new Error("CanvasTabManager is unavailable");
      }
      const _0x2ceea7 = _0x254510.findCanvasIdByProjectIdentity?.({
        projectId: _0x10ffb3
      }) || "";
      if (_0x2ceea7) {
        await _0x254510.switchTo?.(_0x2ceea7);
        return true;
      }
      const _0x2f3589 = await a1169_0x1f3a54.loadProjectStrict(_0x10ffb3);
      const _0x5af10f = _0x2f3589.canvases?.find(_0x278c3b => _0x278c3b?.id === _0x2f3589.activeCanvasId) || _0x2f3589.canvases?.[0];
      if (!_0x5af10f) {
        throw new Error("Project file has no canvas");
      }
      let _0x4d2701 = _0x10ffb3;
      const _0x3a4805 = await this.getProjects();
      const _0x46415d = _0x3a4805.find(_0x18d1d1 => _0x18d1d1.id === _0x10ffb3 || _0x18d1d1.filename === _0x10ffb3);
      if (_0x46415d?.name) {
        _0x4d2701 = _0x46415d.name;
      }
      if ((await _0x254510.addCanvas()) === false) {
        return false;
      }
      const _0x2b8498 = _0x254510.getActiveCanvasId?.() || _0x254510._activeId;
      _0x254510.renameCanvas?.(_0x2b8498, _0x4d2701);
      _0x254510.hydrateActiveCanvasSnapshot({
        ..._0x5af10f,
        name: _0x4d2701
      });
      _0x254510.setCanvasProjectContext?.(_0x2b8498, {
        projectId: _0x10ffb3,
        filename: _0x10ffb3,
        projectName: _0x4d2701,
        recentId: "",
        displayPath: "",
        lastModified: 0,
        isTemporary: false,
        workspaceProjectScoped: true
      });
      _0x254510.markCanvasClean?.(_0x2b8498);
      commit();
      if (projectGallery) {
        projectGallery.classList.add("hidden");
      }
      document.body.classList.remove("in-gallery");
      localStorage.setItem("tapnow_last_project_v2", _0x10ffb3);
      return true;
    } catch (_0x55ce4f) {
      console.error("Failed to load project:", _0x55ce4f);
      alert(projectManagerText("loadFailed"));
    }
  },
  async saveCurrentProject() {
    if (window.CanvasTabManager) {
      const _0x1e145e = window.CanvasTabManager;
      const _0x22fc1f = _0x1e145e.getActiveCanvasId?.() || _0x1e145e._activeId || "";
      const _0xa0d54e = _0x1e145e.getCanvasProjectContext?.(_0x22fc1f) || {
        projectId: window.currentProjectId || "",
        projectName: window.currentProjectId || ""
      };
      if (!_0x22fc1f || !_0xa0d54e.projectId) {
        return;
      }
      const _0x57a94d = _0x1e145e.getMultiDataSnapshot({
        sanitizeForPersistence: true
      });
      const _0x27dbc8 = _0x57a94d.canvases?.find(_0x3d2552 => _0x3d2552?.id === _0x22fc1f);
      if (!_0x27dbc8) {
        return;
      }
      const _0x5fea32 = {
        canvases: [_0x27dbc8],
        activeCanvasId: _0x22fc1f
      };
      const _0x2b4c8d = await a1169_0x1f3a54.saveProject(_0xa0d54e.projectId, _0x5fea32);
      if (_0x2b4c8d?.success) {
        _0x1e145e.setCanvasProjectContext?.(_0x22fc1f, {
          ..._0xa0d54e,
          projectId: _0x2b4c8d.projectId || String(_0x2b4c8d.filename || _0xa0d54e.projectId).replace(/\.(?:aicanvas|aicproj|json)$/i, ""),
          filename: _0x2b4c8d.filename || _0xa0d54e.filename || "",
          isTemporary: false
        });
        _0x1e145e.markCanvasClean?.(_0x22fc1f);
      }
    }
  },
  showConfirm(_0x18e54f, _0x209cff, _0x1e5389) {
    const _0x334ed8 = document.createElement("div");
    _0x334ed8.className = "custom-confirm-overlay";
    const _0x2e9dec = document.createElement("div");
    _0x2e9dec.className = "custom-confirm-box";
    const _0x3e5980 = document.createElement("div");
    _0x3e5980.className = "confirm-title";
    _0x3e5980.textContent = _0x18e54f;
    const _0x2f13bf = document.createElement("div");
    _0x2f13bf.className = "confirm-msg";
    _0x2f13bf.textContent = _0x209cff;
    const _0xa16f23 = document.createElement("div");
    _0xa16f23.className = "confirm-btns";
    const _0x1ef586 = document.createElement("button");
    _0x1ef586.type = "button";
    _0x1ef586.className = "confirm-btn confirm-cancel";
    _0x1ef586.textContent = projectManagerText("confirm.cancel");
    const _0x2fcf86 = document.createElement("button");
    _0x2fcf86.type = "button";
    _0x2fcf86.className = "confirm-btn confirm-ok";
    _0x2fcf86.textContent = projectManagerText("confirm.deleteConfirm");
    _0xa16f23.appendChild(_0x1ef586);
    _0xa16f23.appendChild(_0x2fcf86);
    _0x2e9dec.appendChild(_0x3e5980);
    _0x2e9dec.appendChild(_0x2f13bf);
    _0x2e9dec.appendChild(_0xa16f23);
    _0x334ed8.appendChild(_0x2e9dec);
    document.body.appendChild(_0x334ed8);
    const _0x390e3b = () => _0x334ed8.remove();
    _0x1ef586.onclick = _0x390e3b;
    _0x2fcf86.onclick = () => {
      _0x1e5389();
      _0x390e3b();
    };
    _0x334ed8.onclick = _0x53d8b5 => {
      if (_0x53d8b5.target === _0x334ed8) {
        _0x390e3b();
      }
    };
  },
  async deleteProject(_0x503d0c) {
    this.showConfirm(projectManagerText("deleteConfirm.title"), projectManagerText("deleteConfirm.message"), async () => {
      try {
        await a1169_0x30fb98(_0x503d0c);
        if (window.currentProjectId === _0x503d0c) {
          this.showGallery();
        } else {
          this.renderGallery();
        }
      } catch (_0x110bf3) {
        console.error("Failed to delete project:", _0x110bf3);
      }
    });
  },
  showGallery() {
    window.currentProjectId = null;
    if (projectGallery) {
      projectGallery.classList.remove("hidden");
    }
    document.body.classList.add("in-gallery");
    this.renderGallery();
  },
  async renderGallery() {
    if (!projectGrid) {
      return;
    }
    const _0x5dc4de = await this.getProjects();
    projectGrid.replaceChildren();
    const _0x47a9a2 = document.createElement("div");
    _0x47a9a2.className = "project-card new-project-card";
    const _0x4372fd = "http://www.w3.org/2000/svg";
    const _0x268c83 = document.createElement("div");
    _0x268c83.className = "pc-preview new-project-preview";
    Object.assign(_0x268c83.style, {
      background: "var(--white-02)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    const _0x26c406 = document.createElementNS(_0x4372fd, "svg");
    _0x26c406.setAttribute("width", "32");
    _0x26c406.setAttribute("height", "32");
    _0x26c406.setAttribute("viewBox", "0 0 24 24");
    _0x26c406.setAttribute("fill", "none");
    _0x26c406.setAttribute("stroke", "currentColor");
    _0x26c406.setAttribute("stroke-width", "1.5");
    _0x26c406.style.opacity = "0.4";
    const _0x489096 = document.createElementNS(_0x4372fd, "line");
    _0x489096.setAttribute("x1", "12");
    _0x489096.setAttribute("y1", "5");
    _0x489096.setAttribute("x2", "12");
    _0x489096.setAttribute("y2", "19");
    const _0x46f82b = document.createElementNS(_0x4372fd, "line");
    _0x46f82b.setAttribute("x1", "5");
    _0x46f82b.setAttribute("y1", "12");
    _0x46f82b.setAttribute("x2", "19");
    _0x46f82b.setAttribute("y2", "12");
    _0x26c406.appendChild(_0x489096);
    _0x26c406.appendChild(_0x46f82b);
    _0x268c83.appendChild(_0x26c406);
    const _0x2df579 = document.createElement("div");
    _0x2df579.className = "pc-info";
    Object.assign(_0x2df579.style, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      padding: "16px 0"
    });
    const _0x30d393 = document.createElement("div");
    _0x30d393.className = "pc-title";
    Object.assign(_0x30d393.style, {
      color: "var(--text-primary)",
      fontSize: "16px",
      fontWeight: "600",
      textAlign: "center",
      margin: "0"
    });
    _0x30d393.textContent = projectManagerText("newProject");
    _0x2df579.appendChild(_0x30d393);
    _0x47a9a2.appendChild(_0x268c83);
    _0x47a9a2.appendChild(_0x2df579);
    const _0x31212e = document.createElement("style");
    _0x31212e.textContent = "@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }";
    document.head.appendChild(_0x31212e);
    window.showGlobalLoading = function (_0x1fcd6f = projectManagerText("loading"), _0x3358da = {}) {
      let _0x1de2c6 = document.getElementById("v2-global-loading");
      if (!_0x1de2c6) {
        _0x1de2c6 = document.createElement("div");
        _0x1de2c6.id = "v2-global-loading";
        Object.assign(_0x1de2c6.style, {
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--surface-quote)",
          color: "var(--white)",
          padding: "10px 24px",
          borderRadius: "30px",
          fontSize: "14px",
          zIndex: "99999",
          border: "1px solid var(--white-10)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 8px 32px var(--black-50)",
          opacity: "0",
          transition: "opacity 0.2s",
          pointerEvents: "none"
        });
        const _0x53192d = document.createElementNS(_0x4372fd, "svg");
        _0x53192d.setAttribute("width", "18");
        _0x53192d.setAttribute("height", "18");
        _0x53192d.setAttribute("viewBox", "0 0 24 24");
        _0x53192d.setAttribute("fill", "none");
        _0x53192d.setAttribute("stroke", "currentColor");
        _0x53192d.setAttribute("stroke-width", "2");
        _0x53192d.classList.add("spin");
        const _0x27fd13 = document.createElementNS(_0x4372fd, "path");
        _0x27fd13.setAttribute("d", "M21 12a9 9 0 1 1-6.219-8.56");
        _0x53192d.appendChild(_0x27fd13);
        const _0xb2f35c = document.createElement("div");
        _0xb2f35c.className = "v2-global-loading-body";
        const _0x358058 = document.createElement("span");
        _0x358058.className = "v2-global-loading-label";
        const _0x926b30 = document.createElement("progress");
        _0x926b30.className = "v2-global-loading-progress";
        _0x926b30.max = 1;
        _0x926b30.value = 0;
        _0x926b30.hidden = true;
        _0x1de2c6.appendChild(_0x53192d);
        _0xb2f35c.appendChild(_0x358058);
        _0xb2f35c.appendChild(_0x926b30);
        _0x1de2c6.appendChild(_0xb2f35c);
        document.body.appendChild(_0x1de2c6);
      }
      const _0x15918e = _0x1de2c6.querySelector(".v2-global-loading-label");
      const _0x22735e = _0x1de2c6.querySelector(".v2-global-loading-progress");
      if (_0x15918e) {
        _0x15918e.textContent = _0x1fcd6f;
      }
      const _0x412b62 = Number(_0x3358da?.progress);
      const _0x58e683 = Number.isFinite(_0x412b62) && _0x412b62 >= 0;
      if (_0x22735e) {
        _0x22735e.hidden = !_0x58e683;
        if (_0x58e683) {
          _0x22735e.value = Math.max(0, Math.min(1, _0x412b62));
        }
      }
      _0x1de2c6.offsetWidth;
      _0x1de2c6.style.opacity = "1";
    };
    window.updateGlobalLoading = function (_0x1b00cd = {}) {
      const _0x5bd92c = document.getElementById("v2-global-loading");
      if (!_0x5bd92c) {
        return;
      }
      const _0x2d7b66 = typeof _0x1b00cd === "string" ? {
        text: _0x1b00cd
      } : _0x1b00cd || {};
      const _0x1a86a9 = _0x5bd92c.querySelector(".v2-global-loading-label");
      const _0x12fead = _0x5bd92c.querySelector(".v2-global-loading-progress");
      const _0x466c90 = String(_0x2d7b66.text || _0x2d7b66.message || "").trim();
      if (_0x466c90 && _0x1a86a9) {
        _0x1a86a9.textContent = _0x466c90;
      }
      const _0x22f384 = Number(_0x2d7b66.progress);
      const _0x5227dc = Number.isFinite(_0x22f384) && _0x22f384 >= 0;
      if (_0x12fead) {
        _0x12fead.hidden = !_0x5227dc;
        if (_0x5227dc) {
          _0x12fead.value = Math.max(0, Math.min(1, _0x22f384));
        }
      }
    };
    window.hideGlobalLoading = function () {
      const _0x26e840 = document.getElementById("v2-global-loading");
      if (_0x26e840) {
        _0x26e840.style.opacity = "0";
        setTimeout(() => _0x26e840.remove(), 250);
      }
    };
    _0x47a9a2.onclick = async () => {
      const _0x2f120b = await this.createProject();
      if (_0x2f120b) {
        if (window.store) {
          window.store.hydrate({});
        }
        await this.loadProject(_0x2f120b);
        commit();
      }
    };
    projectGrid.appendChild(_0x47a9a2);
    _0x5dc4de.sort((_0x2d9594, _0x76c822) => _0x76c822.lastModified - _0x2d9594.lastModified).forEach(_0xc4667d => {
      const _0x19e14b = document.createElement("div");
      _0x19e14b.className = "project-card";
      const _0x4cf3c5 = new Date(_0xc4667d.lastModified).toLocaleString(getLocale(), {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      const _0x536d78 = document.createElement("div");
      _0x536d78.className = "pc-preview";
      if (_0xc4667d.thumbnail && _0xc4667d.thumbnail.type === "image" && _0xc4667d.thumbnail.data) {
        const _0x2a8307 = document.createElement("img");
        _0x2a8307.src = _0xc4667d.thumbnail.data;
        _0x536d78.appendChild(_0x2a8307);
      } else if (_0xc4667d.thumbnail && _0xc4667d.thumbnail.type === "text" && _0xc4667d.thumbnail.data) {
        const _0x49762b = document.createElement("div");
        _0x49762b.className = "pc-text-snippet";
        _0x49762b.textContent = _0xc4667d.thumbnail.data;
        _0x536d78.appendChild(_0x49762b);
      } else {
        const _0x307449 = document.createElement("div");
        _0x307449.className = "pc-logo";
        Object.assign(_0x307449.style, {
          fontWeight: "bold",
          color: "var(--white-10)",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%"
        });
        _0x307449.textContent = "SHUO Canvas";
        _0x536d78.appendChild(_0x307449);
      }
      const _0x286784 = document.createElement("div");
      _0x286784.className = "pc-info";
      const _0x5af8d9 = document.createElement("div");
      _0x5af8d9.className = "pc-title";
      _0x5af8d9.textContent = _0xc4667d.name;
      const _0x59fb29 = document.createElement("div");
      _0x59fb29.className = "pc-meta";
      const _0x506f45 = document.createElement("span");
      _0x506f45.className = "pc-time";
      _0x506f45.textContent = _0x4cf3c5;
      const _0x4396b8 = document.createElement("span");
      _0x4396b8.className = "pc-delete";
      _0x4396b8.dataset.id = _0xc4667d.id;
      Object.assign(_0x4396b8.style, {
        color: "var(--text-muted)",
        cursor: "pointer",
        transition: "color 0.2s"
      });
      _0x4396b8.textContent = projectManagerText("delete");
      _0x4396b8.addEventListener("mouseenter", () => _0x4396b8.style.color = "var(--red)");
      _0x4396b8.addEventListener("mouseleave", () => _0x4396b8.style.color = "var(--text-muted)");
      _0x59fb29.appendChild(_0x506f45);
      _0x59fb29.appendChild(_0x4396b8);
      _0x286784.appendChild(_0x5af8d9);
      _0x286784.appendChild(_0x59fb29);
      _0x19e14b.appendChild(_0x536d78);
      _0x19e14b.appendChild(_0x286784);
      _0x19e14b.onclick = async _0x143d65 => {
        const _0x1e31c7 = _0x143d65.target.closest(".pc-delete");
        if (_0x1e31c7) {
          _0x143d65.stopPropagation();
          await this.deleteProject(_0xc4667d.id);
          return;
        }
        await this.loadProject(_0xc4667d.id);
      };
      projectGrid.appendChild(_0x19e14b);
    });
  }
};
export default ProjectManager;
export { ProjectManager };