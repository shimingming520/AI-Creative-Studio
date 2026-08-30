import { REPLACEMENT_STUDIO_MODE_ID, REPLACEMENT_STUDIO_NAME, VIDEO_REPLICATION_STUDIO_MODE_ID, VIDEO_REPLICATION_STUDIO_NAME } from "./workspaceStudioModes.js";
import { runCircularRevealTransition } from "../utils/circularRevealTransition.js";
import { resolveRendererVirtualizationTier } from "../core/rendererVirtualization.js";
export const WORKSPACE_MODE_CHANGED_EVENT = "workspaceMode:changed";
const CANVAS_MODE_ID = "canvas";
const STORY_MODE_ID = "story";
const STORYBOARD_3D_MODE_ID = "storyboard3d";
const WORKSPACE_MODE_IDS = new Set([CANVAS_MODE_ID, STORY_MODE_ID, STORYBOARD_3D_MODE_ID, REPLACEMENT_STUDIO_MODE_ID, VIDEO_REPLICATION_STUDIO_MODE_ID]);
const MODE_BODY_CLASSES = Object.freeze({
  [STORY_MODE_ID]: ["story-workspace-active"],
  [STORYBOARD_3D_MODE_ID]: ["storyboard-3d-workspace-active"],
  [REPLACEMENT_STUDIO_MODE_ID]: ["person-replacement-workspace-active", "replacement-studio-workspace-active"],
  [VIDEO_REPLICATION_STUDIO_MODE_ID]: ["story-workspace-active", "video-replication-workspace-active"]
});
function normalizeWorkspaceMode(_0x3a70d6) {
  if (WORKSPACE_MODE_IDS.has(_0x3a70d6)) {
    return _0x3a70d6;
  } else {
    return CANVAS_MODE_ID;
  }
}
export function shouldBypassCanvasModeViewTransition({
  currentMode: _0x271be1,
  nextMode: _0x3005d7,
  canvasPresentationContext = null
} = {}) {
  if (_0x271be1 !== CANVAS_MODE_ID && _0x3005d7 !== CANVAS_MODE_ID) {
    return false;
  }
  return resolveRendererVirtualizationTier({
    viewport: canvasPresentationContext?.viewport,
    nodeCount: canvasPresentationContext?.nodeCount
  }) === "very-dense-low-zoom";
}
export function isStoryboard3DWorkspaceAvailable(_0x5675d4 = globalThis.window) {
  return _0x5675d4?.AI_CANVAS_IS_DEV_BUILD === true && _0x5675d4?.DEV_MODE === true;
}
function renderWorkspaceModeIcon(_0xb55681) {
  if (_0xb55681 === REPLACEMENT_STUDIO_MODE_ID || _0xb55681 === VIDEO_REPLICATION_STUDIO_MODE_ID) {
    return "<span class=\"workspace-mode-icon workspace-mode-icon--person-replacement\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M7.5 10.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z\"/><path d=\"M2.75 18.75v-1.5a4.75 4.75 0 0 1 4.75-4.75h1.25\"/><path d=\"M16.5 13.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z\"/><path d=\"M12.25 20.25v-1.5A3.75 3.75 0 0 1 16 15h1a4.25 4.25 0 0 1 4.25 4.25v1\"/><path d=\"m10.5 8.25 2-2 2 2M12.5 6.25v5\"/></svg></span>";
  }
  if (_0xb55681 === STORYBOARD_3D_MODE_ID) {
    return "<span class=\"workspace-mode-icon workspace-mode-icon--storyboard3d\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"m12 3 8 4.5v9L12 21l-8-4.5v-9z\"/><path d=\"m4 7.5 8 4.5 8-4.5M12 12v9\"/><circle cx=\"12\" cy=\"8\" r=\"1.5\"/></svg></span>";
  }
  if (_0xb55681 === STORY_MODE_ID) {
    return "<span class=\"workspace-mode-icon workspace-mode-icon--story\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M7 3.75h8.5L19 7.25v13H7z\"/><path d=\"M15.5 3.75v3.5H19M10 11h6M10 14.5h6M10 18h4\"/></svg></span>";
  }
  return "<span class=\"workspace-mode-icon workspace-mode-icon--canvas\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><rect x=\"3.75\" y=\"3.75\" width=\"6.5\" height=\"6.5\" rx=\"1.25\"/><rect x=\"13.75\" y=\"3.75\" width=\"6.5\" height=\"6.5\" rx=\"1.25\"/><rect x=\"3.75\" y=\"13.75\" width=\"6.5\" height=\"6.5\" rx=\"1.25\"/><path d=\"M14 17h6M17 14v6\"/></svg></span>";
}
export function renderWorkspaceModeSwitcher(_0x104385, {
  storyboard3DAvailable = false,
  videoReplicationStudioAvailable = false,
  menuOpen = false
} = {}) {
  const _0x27f2db = normalizeWorkspaceMode(_0x104385);
  const _0x78f7c = _0x27f2db === STORY_MODE_ID ? "剧本工作室模式" : _0x27f2db === REPLACEMENT_STUDIO_MODE_ID ? REPLACEMENT_STUDIO_NAME : _0x27f2db === VIDEO_REPLICATION_STUDIO_MODE_ID ? VIDEO_REPLICATION_STUDIO_NAME : _0x27f2db === STORYBOARD_3D_MODE_ID ? "3D场景预演模式" : "画布模式";
  const _0x4d1767 = storyboard3DAvailable ? "" : "disabled aria-disabled=\"true\"";
  const _0x31ba3f = ["workspace-mode-switcher", menuOpen ? "is-open" : ""].filter(Boolean).join(" ");
  return "<div class=\"" + _0x31ba3f + "\" data-story-mode-switcher>\n    <button type=\"button\" class=\"workspace-mode-current\" aria-haspopup=\"menu\" aria-controls=\"workspaceModeMenu\" aria-expanded=\"" + menuOpen + "\">\n      " + renderWorkspaceModeIcon(_0x27f2db) + "\n      <span data-story-mode-current>" + _0x78f7c + "</span>\n      <span class=\"workspace-mode-chevron\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"m6 9 6 6 6-6\"/></svg></span>\n    </button>\n    <div class=\"workspace-mode-menu\" id=\"workspaceModeMenu\" role=\"menu\" aria-label=\"工作区模式\" aria-hidden=\"" + !menuOpen + "\">\n      <button type=\"button\" class=\"workspace-mode-option workspace-mode-option--canvas " + (_0x27f2db === CANVAS_MODE_ID ? "is-active" : "") + "\" data-story-workspace-mode=\"" + CANVAS_MODE_ID + "\" role=\"menuitem\">\n        " + renderWorkspaceModeIcon(CANVAS_MODE_ID) + "\n        <span class=\"workspace-mode-option-copy\"><span class=\"workspace-mode-option-title\"><strong>画布模式</strong></span><small>节点创作与生成</small></span>\n      </button>\n      <button type=\"button\" class=\"workspace-mode-option workspace-mode-option--story " + (_0x27f2db === STORY_MODE_ID ? "is-active" : "") + "\" data-story-workspace-mode=\"" + STORY_MODE_ID + "\" role=\"menuitem\">\n        " + renderWorkspaceModeIcon(STORY_MODE_ID) + "\n        <span class=\"workspace-mode-option-copy\"><span class=\"workspace-mode-option-title\"><strong>剧本工作室</strong><span class=\"workspace-mode-beta-badge\">beta 限免</span></span><small>剧本、素材与分集</small></span>\n      </button>\n      <button type=\"button\" class=\"workspace-mode-option workspace-mode-option--person-replacement " + (_0x27f2db === REPLACEMENT_STUDIO_MODE_ID ? "is-active" : "") + "\" data-story-workspace-mode=\"" + REPLACEMENT_STUDIO_MODE_ID + "\" role=\"menuitem\">\n        " + renderWorkspaceModeIcon(REPLACEMENT_STUDIO_MODE_ID) + "\n        <span class=\"workspace-mode-option-copy\"><span class=\"workspace-mode-option-title\"><strong>" + REPLACEMENT_STUDIO_NAME + "</strong><span class=\"workspace-mode-beta-badge\">beta</span><span class=\"workspace-mode-vip-badge\">VIP</span></span><small>角色、镜头与声音替换</small></span>\n      </button>\n      " + (videoReplicationStudioAvailable ? "<button type=\"button\" class=\"workspace-mode-option workspace-mode-option--person-replacement " + (_0x27f2db === VIDEO_REPLICATION_STUDIO_MODE_ID ? "is-active" : "") + "\" data-story-workspace-mode=\"" + VIDEO_REPLICATION_STUDIO_MODE_ID + "\" role=\"menuitem\">\n        " + renderWorkspaceModeIcon(VIDEO_REPLICATION_STUDIO_MODE_ID) + "\n        <span class=\"workspace-mode-option-copy\"><span class=\"workspace-mode-option-title\"><strong>" + VIDEO_REPLICATION_STUDIO_NAME + "</strong><span class=\"workspace-mode-beta-badge\">dev</span></span><small>参考视频、分段与批量生成</small></span>\n      </button>" : "") + "\n      <button type=\"button\" class=\"workspace-mode-option workspace-mode-option--storyboard3d " + (_0x27f2db === STORYBOARD_3D_MODE_ID ? "is-active" : "") + "\" data-story-workspace-mode=\"" + STORYBOARD_3D_MODE_ID + "\" role=\"menuitem\" " + _0x4d1767 + ">\n        " + renderWorkspaceModeIcon(STORYBOARD_3D_MODE_ID) + "\n        <span class=\"workspace-mode-option-copy\"><span class=\"workspace-mode-option-title\"><strong>3D场景预演</strong></span><small>场景、机位与镜头预演</small></span>\n      </button>\n    </div>\n  </div>";
}
function resolveMountTarget(_0x50e0b2, _0x52fb9c) {
  if (typeof _0x52fb9c === "string") {
    return _0x50e0b2?.querySelector?.(_0x52fb9c) || null;
  }
  return _0x52fb9c || null;
}
export function createWorkspaceModeCoordinator({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  mountTarget = ".header",
  initialMode = CANVAS_MODE_ID,
  storyWorkspace = null,
  storyboard3DWorkspace = null,
  replacementStudio = null,
  videoReplicationStudio = null,
  getCanvasPresentationContext = null
} = {}) {
  if (!documentObject?.body) {
    return null;
  }
  const _0x5a9295 = resolveMountTarget(documentObject, mountTarget);
  if (!_0x5a9295) {
    return null;
  }
  const _0x7f4854 = _0x5a9295.querySelector?.(".workspace-mode-switcher-wrap");
  if (_0x7f4854?._workspaceModeCoordinator) {
    return _0x7f4854._workspaceModeCoordinator;
  }
  const _0x585755 = Object.freeze({
    [STORY_MODE_ID]: storyWorkspace,
    [STORYBOARD_3D_MODE_ID]: storyboard3DWorkspace,
    [REPLACEMENT_STUDIO_MODE_ID]: replacementStudio,
    [VIDEO_REPLICATION_STUDIO_MODE_ID]: videoReplicationStudio
  });
  const _0x5d36d3 = _0x54ced6 => {
    const _0x3c8233 = _0x585755[_0x54ced6];
    if (typeof _0x3c8233?.isAvailable === "function") {
      try {
        return _0x3c8233.isAvailable() !== false;
      } catch {
        return false;
      }
    }
    if (_0x54ced6 === STORYBOARD_3D_MODE_ID) {
      return isStoryboard3DWorkspaceAvailable(windowObject);
    }
    if (_0x54ced6 === VIDEO_REPLICATION_STUDIO_MODE_ID) {
      return false;
    }
    return true;
  };
  const _0x5a3a01 = normalizeWorkspaceMode(initialMode);
  const _0x499390 = {
    mode: _0x5d36d3(_0x5a3a01) ? _0x5a3a01 : CANVAS_MODE_ID,
    storyboard3DAvailable: _0x5d36d3(STORYBOARD_3D_MODE_ID),
    videoReplicationStudioAvailable: _0x5d36d3(VIDEO_REPLICATION_STUDIO_MODE_ID)
  };
  let _0x2bd0e8 = false;
  let _0x5ab282 = 0;
  let _0x13a203 = _0x499390.mode;
  let _0x40f1af = false;
  let _0x4c3637 = false;
  let _0x27f067 = false;
  const _0x44ecb7 = documentObject.createElement("div");
  _0x44ecb7.className = "workspace-mode-switcher-wrap";
  _0x5a9295.appendChild(_0x44ecb7);
  const _0xc907d7 = () => {
    _0x27f067 = _0x40f1af || _0x4c3637;
    _0x44ecb7.innerHTML = renderWorkspaceModeSwitcher(_0x499390.mode, {
      storyboard3DAvailable: _0x499390.storyboard3DAvailable,
      videoReplicationStudioAvailable: _0x499390.videoReplicationStudioAvailable,
      menuOpen: _0x27f067
    });
  };
  const _0xab44c3 = () => {
    const _0x8789c4 = new Set(MODE_BODY_CLASSES[_0x499390.mode] || []);
    new Set(Object.values(MODE_BODY_CLASSES).flat()).forEach(_0x120156 => {
      documentObject.body.classList.toggle(_0x120156, _0x8789c4.has(_0x120156));
    });
    documentObject.getElementById("v2-canvas")?.setAttribute("aria-hidden", String(_0x499390.mode !== CANVAS_MODE_ID));
    _0xc907d7();
  };
  const _0x107acb = ({
    focus = ""
  } = {}) => {
    const _0x3d7006 = _0x40f1af || _0x4c3637;
    _0x27f067 = _0x3d7006;
    const _0x15911c = _0x44ecb7.querySelector("[data-story-mode-switcher]");
    const _0x343d4b = _0x15911c?.querySelector(".workspace-mode-current");
    const _0x5ebc74 = _0x15911c?.querySelector(".workspace-mode-menu");
    _0x15911c?.classList.toggle("is-open", _0x3d7006);
    _0x343d4b?.setAttribute("aria-expanded", String(_0x3d7006));
    _0x5ebc74?.setAttribute("aria-hidden", String(!_0x3d7006));
    if (!_0x3d7006 || !focus) {
      return;
    }
    const _0x40302e = Array.from(_0x5ebc74?.querySelectorAll(".workspace-mode-option:not(:disabled)") || []).filter(_0x2ecd49 => _0x2ecd49.getAttribute("aria-disabled") !== "true");
    const _0x4d52f8 = focus === "last" ? _0x40302e.at(-1) : _0x40302e[0];
    const _0x5ac571 = () => {
      if (!_0x27f067 || !_0x44ecb7.contains(_0x4d52f8)) {
        return;
      }
      _0x4d52f8?.focus?.();
    };
    if (typeof windowObject?.requestAnimationFrame === "function") {
      windowObject.requestAnimationFrame(_0x5ac571);
    } else {
      _0x5ac571();
    }
  };
  const _0x2da2da = (_0x410fed, _0x8014cc) => {
    const _0x1e0c63 = windowObject?.CustomEvent || globalThis.CustomEvent;
    if (typeof _0x1e0c63 !== "function") {
      return;
    }
    windowObject?.dispatchEvent?.(new _0x1e0c63(WORKSPACE_MODE_CHANGED_EVENT, {
      detail: {
        mode: _0x410fed,
        previousMode: _0x8014cc
      }
    }));
  };
  const _0x542235 = (_0x5764d8, {
    activate = true
  } = {}, _0x24353f) => {
    if (_0x2bd0e8) {
      return false;
    }
    const _0x533b44 = normalizeWorkspaceMode(_0x5764d8);
    if (!_0x5d36d3(_0x533b44)) {
      return false;
    }
    const _0xc2f7c1 = _0x585755[_0x533b44];
    let _0x16958e = true;
    try {
      _0x16958e = _0xc2f7c1?.canActivate?.() !== false;
    } catch {
      _0x16958e = false;
    }
    if (!_0x16958e) {
      _0xc2f7c1?.requestActivation?.({
        retry: () => {
          if (_0x2bd0e8 || _0x24353f !== _0x5ab282 || _0x13a203 !== _0x533b44) {
            return false;
          }
          return _0x542235(_0x533b44, {
            activate: activate
          }, _0x24353f);
        }
      });
      return false;
    }
    const _0x5663f3 = _0x499390.mode;
    const _0x2bfba3 = _0x585755[_0x5663f3];
    if (_0x5663f3 !== _0x533b44) {
      let _0x2ae7b4 = true;
      try {
        _0x2ae7b4 = _0x2bfba3?.canDeactivate?.({
          nextMode: _0x533b44
        }) !== false;
      } catch {
        _0x2ae7b4 = true;
      }
      if (!_0x2ae7b4) {
        _0x2bfba3?.onNavigationBlocked?.({
          nextMode: _0x533b44
        });
        return false;
      }
    }
    if (_0x5663f3 === _0x533b44) {
      if (activate && [STORYBOARD_3D_MODE_ID, REPLACEMENT_STUDIO_MODE_ID, VIDEO_REPLICATION_STUDIO_MODE_ID].includes(_0x533b44)) {
        const _0x4699f0 = _0xc2f7c1?.activate?.({
          previousMode: _0x5663f3,
          reactivating: true
        });
        if (!_0x4699f0) {
          return false;
        }
        _0xc2f7c1?.onActivated?.({
          previousMode: _0x5663f3,
          reactivating: true
        });
      }
      return true;
    }
    let _0x1755fb = true;
    if (activate && _0x533b44 !== CANVAS_MODE_ID) {
      _0x1755fb = _0xc2f7c1?.activate?.({
        previousMode: _0x5663f3
      });
      if (!_0x1755fb) {
        return false;
      }
    }
    _0x499390.mode = _0x533b44;
    _0xab44c3();
    const _0x2fe134 = _0x2bfba3?.deactivate?.({
      nextMode: _0x533b44
    });
    if (_0x2fe134 === false) {
      _0x499390.mode = _0x5663f3;
      _0xab44c3();
      _0xc2f7c1?.deactivate?.({
        nextMode: _0x5663f3,
        rollback: true
      });
      _0x2bfba3?.onNavigationBlocked?.({
        nextMode: _0x533b44
      });
      return false;
    }
    _0x2da2da(_0x533b44, _0x5663f3);
    if (activate && _0x1755fb) {
      _0xc2f7c1?.onActivated?.({
        previousMode: _0x5663f3
      });
    }
    return true;
  };
  const _0x3029dd = (_0xa308e1, _0x1cd934 = {}) => {
    const _0x2b7113 = normalizeWorkspaceMode(_0xa308e1);
    _0x13a203 = _0x2b7113;
    _0x5ab282 += 1;
    return _0x542235(_0x2b7113, _0x1cd934, _0x5ab282);
  };
  const _0x7188d2 = _0x1f9c1f => {
    const _0x4505a9 = normalizeWorkspaceMode(_0x1f9c1f);
    if (_0x2bd0e8 || _0x13a203 !== _0x4505a9) {
      return false;
    }
    return _0x542235(_0x4505a9, {}, _0x5ab282);
  };
  const _0x771bc3 = () => {
    if (_0x2bd0e8) {
      return false;
    }
    const _0x42d349 = _0x5d36d3(STORYBOARD_3D_MODE_ID);
    const _0x5889b0 = _0x5d36d3(VIDEO_REPLICATION_STUDIO_MODE_ID);
    const _0x231e78 = _0x499390.storyboard3DAvailable !== _0x42d349 || _0x499390.videoReplicationStudioAvailable !== _0x5889b0;
    if (!_0x231e78) {
      return false;
    }
    _0x499390.storyboard3DAvailable = _0x42d349;
    _0x499390.videoReplicationStudioAvailable = _0x5889b0;
    if (!_0x42d349 && _0x499390.mode === STORYBOARD_3D_MODE_ID || !_0x5889b0 && _0x499390.mode === VIDEO_REPLICATION_STUDIO_MODE_ID) {
      _0x3029dd(CANVAS_MODE_ID);
    } else {
      _0xc907d7();
    }
    return true;
  };
  const _0x576860 = () => {
    _0x40f1af = true;
    _0x107acb();
  };
  const _0x12d645 = () => {
    _0x40f1af = false;
    _0x107acb();
  };
  const _0xd510ad = _0x2534ac => {
    if (_0x44ecb7.contains(_0x2534ac.target)) {
      if (_0x2534ac.target.matches?.(":focus-visible")) {
        _0x4c3637 = true;
        _0x107acb();
      }
      return;
    }
    if (!_0x4c3637) {
      return;
    }
    _0x4c3637 = false;
    _0x107acb();
  };
  const _0x5d5179 = _0x3667b2 => {
    const _0x43746f = _0x3667b2.target.closest?.(".workspace-mode-current");
    const _0x38ab8e = _0x3667b2.target.closest?.(".workspace-mode-option");
    if (_0x3667b2.key === "Escape" && _0x27f067) {
      _0x3667b2.preventDefault();
      _0x44ecb7.querySelector(".workspace-mode-current")?.focus?.();
      _0x4c3637 = false;
      _0x40f1af = false;
      _0x107acb();
      return;
    }
    if (_0x43746f && (_0x3667b2.key === "ArrowDown" || _0x3667b2.key === "ArrowUp")) {
      _0x3667b2.preventDefault();
      _0x4c3637 = true;
      _0x107acb({
        focus: _0x3667b2.key === "ArrowUp" ? "last" : "first"
      });
      return;
    }
    if (!_0x38ab8e || !_0x27f067) {
      return;
    }
    const _0x421ba4 = Array.from(_0x44ecb7.querySelectorAll(".workspace-mode-option:not(:disabled)")).filter(_0x54d6b7 => _0x54d6b7.getAttribute("aria-disabled") !== "true");
    const _0x3a2a5e = _0x421ba4.indexOf(_0x38ab8e);
    let _0xe64a97 = _0x3a2a5e;
    if (_0x3667b2.key === "ArrowDown") {
      _0xe64a97 = (_0x3a2a5e + 1) % _0x421ba4.length;
    } else if (_0x3667b2.key === "ArrowUp") {
      _0xe64a97 = (_0x3a2a5e - 1 + _0x421ba4.length) % _0x421ba4.length;
    } else if (_0x3667b2.key === "Home") {
      _0xe64a97 = 0;
    } else if (_0x3667b2.key === "End") {
      _0xe64a97 = _0x421ba4.length - 1;
    } else {
      return;
    }
    _0x3667b2.preventDefault();
    _0x421ba4[_0xe64a97]?.focus?.();
  };
  const _0x510325 = _0x5e4a09 => {
    const _0x535cf2 = _0x5e4a09.target.closest?.(".workspace-mode-current");
    if (_0x535cf2 && _0x44ecb7.contains(_0x535cf2)) {
      return;
    }
    const _0x35fdc9 = _0x5e4a09.target.closest?.("[data-story-workspace-mode]");
    if (!_0x35fdc9 || !_0x44ecb7.contains(_0x35fdc9)) {
      return;
    }
    if (_0x35fdc9.disabled || _0x35fdc9.getAttribute("aria-disabled") === "true") {
      _0x5e4a09.preventDefault();
      return;
    }
    const _0x294ca8 = _0x35fdc9.dataset.storyWorkspaceMode;
    if (_0x294ca8 === _0x499390.mode && _0x294ca8 !== STORYBOARD_3D_MODE_ID) {
      _0x40f1af = false;
      _0x4c3637 = false;
      _0x107acb();
      _0x3029dd(_0x294ca8);
      return;
    }
    const _0x5c014f = _0x44ecb7.querySelector(".workspace-mode-current");
    const _0x15b13e = () => {
      _0x40f1af = false;
      _0x4c3637 = false;
      _0x107acb();
      _0x3029dd(_0x294ca8);
    };
    let _0x31b475 = null;
    try {
      _0x31b475 = getCanvasPresentationContext?.() || null;
    } catch {
      _0x31b475 = null;
    }
    if (shouldBypassCanvasModeViewTransition({
      currentMode: _0x499390.mode,
      nextMode: _0x294ca8,
      canvasPresentationContext: _0x31b475
    })) {
      _0x15b13e();
      return;
    }
    runCircularRevealTransition({
      sourceElement: _0x5c014f,
      apply: _0x15b13e,
      documentObject: documentObject,
      windowObject: windowObject,
      rootClassName: "workspace-mode-reveal-transitioning",
      duration: 760
    });
  };
  const _0x531e5e = Object.freeze({
    setMode: _0x3029dd,
    getMode: () => _0x499390.mode,
    resumePendingMode: _0x7188d2,
    refreshAvailability: _0x771bc3,
    destroy() {
      if (_0x2bd0e8) {
        return;
      }
      _0x2bd0e8 = true;
      _0x44ecb7.removeEventListener("click", _0x510325);
      _0x44ecb7.removeEventListener("pointerenter", _0x576860);
      _0x44ecb7.removeEventListener("pointerleave", _0x12d645);
      _0x44ecb7.removeEventListener("keydown", _0x5d5179);
      documentObject.removeEventListener("focusin", _0xd510ad);
      windowObject?.removeEventListener?.("aicanvas:runtime-info", _0x771bc3);
      windowObject?.removeEventListener?.("dev-mode-changed", _0x771bc3);
      Object.values(MODE_BODY_CLASSES).flat().forEach(_0x1acfb5 => {
        documentObject.body.classList.remove(_0x1acfb5);
      });
      documentObject.getElementById("v2-canvas")?.setAttribute("aria-hidden", "false");
      _0x44ecb7.remove();
    }
  });
  _0x44ecb7._workspaceModeCoordinator = _0x531e5e;
  _0x44ecb7.addEventListener("click", _0x510325);
  _0x44ecb7.addEventListener("pointerenter", _0x576860);
  _0x44ecb7.addEventListener("pointerleave", _0x12d645);
  _0x44ecb7.addEventListener("keydown", _0x5d5179);
  documentObject.addEventListener("focusin", _0xd510ad);
  windowObject?.addEventListener?.("aicanvas:runtime-info", _0x771bc3);
  windowObject?.addEventListener?.("dev-mode-changed", _0x771bc3);
  _0xab44c3();
  return _0x531e5e;
}