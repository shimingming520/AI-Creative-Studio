import { deleteSelectedPanoramaSceneObject, focusPanoramaSceneSelection, resetPanoramaSceneView, setPanoramaSceneEditing, setPanoramaSceneTool } from "../panoramaSceneNode/sceneNodeActions.js";
import { copyNodeMediaToSystemClipboard } from "../mediaClipboard.js";
import { startCanvasScreenshot } from "../canvasScreenshot.js";
import { markSystemClipboardWrite } from "../clipboard.js";
import { applySnapGridEnabled, readSnapGridEnabled } from "../snapGridState.js";
import { readGridDotsPref, setGridDotsPref } from "../settings/appearanceSettings.js";
import { setSelectionRelatedHighlightPref } from "../settings/canvasAlignmentSettings.js";
import { readCommentNoteJumpFocusPref, setImageVideoNodeResizePref, setNodeAvoidOverlapPref, setPromptBoxResizePref, setTitleFollowsCanvasZoomPref } from "../settings/nodeBehaviorSettings.js";
import { resolveJumpZoom } from "../commentNoteJumpShortcut.js";
import { toggleSettingsPanel } from "../settings/panelSettings.js";
import { toggleSidebarSubmenu } from "../sidebarSubmenuController.js";
import { syncPlaySelectedVideos } from "../videoSyncPlayback.js";
import { computeNodesWorldBounds, computeViewportForWorldBounds, getAlignableSelectionNodes, getViewportScreenOrigin, screenToWorld } from "../../core/math.js";
import { getBrowserViewportRect } from "../../core/viewportFocus.js";
import { clampCanvasZoom } from "../../core/canvasZoom.js";
import { t } from "../../i18n/index.js";
const COMMENT_NOTE_JUMP_WORLD_ALIGN = 0.5;
const MEDIA_CLIP_DELETE_MATERIAL_EVENT = "media-clip-delete-material";
export function createAppBusinessEvents({
  store: _0x27b213,
  wrap: _0x260f82,
  canvasViewportEl = null,
  addShortcutListener: _0x240353,
  executeCommand: _0xa36247,
  undo: _0x1235dd,
  redo: _0xf227ff,
  commit: _0x4447ad,
  closeShortcuts: _0x167d35,
  getNodeDefaultSize: _0x58e5da,
  getAIGenerationDefaultSizeByType: _0x3fcbd6,
  createNodeAtCursor: _0x427c5f,
  createImageNodeFromBlob: _0x326f1b,
  openFileUpload: _0x25a7b,
  animateViewport: _0x5a5ce6,
  focusNodeAtZoomPercent: _0x3773da,
  focusNodes: _0x3a7393,
  clearTrackedFocus: _0x594a06,
  handlePasteFromClipboard: _0x5f4c3e,
  initCanvasContextMenu: _0x2035f4,
  toggleAgentPanel: _0x51b090,
  ImageAnnotateController: _0xd9b2e5,
  ImageMattingController: _0x32075d,
  AudioClipController: _0x2a1eb7,
  syncPlaySelectedVideos: _0x3d46aa = syncPlaySelectedVideos
} = {}) {
  const _0x56eacc = _0x4cd654 => {
    const _0x4fa5e3 = _0x4cd654?.viewport;
    if (!_0x4fa5e3) {
      return null;
    }
    const _0x4d2e21 = Number(window?._lastMx);
    const _0x540b48 = Number(window?._lastMy);
    if (!Number.isFinite(_0x4d2e21) || !Number.isFinite(_0x540b48)) {
      return null;
    }
    const _0x3b4aa9 = screenToWorld(_0x4d2e21, _0x540b48, _0x4fa5e3);
    if (!_0x3b4aa9 || !Number.isFinite(_0x3b4aa9.x) || !Number.isFinite(_0x3b4aa9.y)) {
      return null;
    }
    return {
      x: _0x3b4aa9.x,
      y: _0x3b4aa9.y
    };
  };
  const _0x18dbc4 = {
    "panorama-scene-camera-create": {
      selector: ".act-camera",
      nodeTypes: ["panorama-scene"]
    },
    "image-tool-matting": {
      selector: ".act-matting",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-repaint": {
      selector: ".act-repaint",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-erase": {
      selector: ".act-erase",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-hd": {
      selector: ".act-hd",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-expand": {
      selector: ".act-expand",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-auto-subject": {
      selector: ".act-auto-subject",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-multigrid": {
      selector: ".act-multigrid",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-multiangle": {
      selector: ".act-multiangle",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-annotate": {
      selector: ".act-annotate",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-crop": {
      selector: ".act-crop",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-fullscreen": {
      selector: ".act-fullscreen",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "image-tool-download": {
      selector: ".act-download",
      nodeTypes: ["source-image", "ai-image", "image"]
    },
    "video-tool-clip": {
      selector: ".act-clip",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "video-tool-separate-av": {
      selector: ".act-separate-av",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "video-tool-capture-frame": {
      selector: ".video-snap-btn",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "video-tool-keying": {
      selector: ".act-keying",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "video-tool-hd": {
      selector: ".act-hd",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "video-tool-fullscreen": {
      selector: ".act-fullscreen",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "video-tool-download": {
      selector: ".act-download",
      nodeTypes: ["source-video", "ai-video", "video"]
    },
    "audio-tool-clip": {
      selector: ".clip-btn",
      nodeTypes: ["source-audio", "ai-audio", "audio"]
    },
    "audio-tool-speed": {
      selector: ".speed-btn",
      nodeTypes: ["source-audio", "ai-audio", "audio"]
    },
    "audio-tool-download": {
      selector: ".download-btn",
      nodeTypes: ["source-audio", "ai-audio", "audio"]
    },
    "clip-tool-crop": {
      selector: ".media-clip-tool-crop",
      nodeTypes: ["media-clip"]
    },
    "text-tool-copy": {
      selector: ".act-copy",
      nodeTypes: ["source-text", "ai-text", "text"]
    },
    "text-tool-fullscreen": {
      selector: ".act-fullscreen",
      nodeTypes: ["source-text", "ai-text", "text"]
    }
  };
  function _0x4704e9() {
    const _0x468307 = document.getElementById("v2-wrap");
    return !!_0x468307?.classList.contains("is-audio-clip-mode");
  }
  function _0x2ff6ae(_0x483a99 = _0x27b213.getState()) {
    return !!_0x483a99.matting?.active || !!_0x483a99.annotate?.active || !!_0x483a99.videoClip?.active || !!_0x483a99.videoKeying?.active || _0x4704e9();
  }
  function _0x541907(_0x47451f = _0x27b213.getState()) {
    const _0x19d1d8 = Array.isArray(_0x47451f?.selectedNodeIds) ? _0x47451f.selectedNodeIds : [];
    if (_0x19d1d8.length !== 1) {
      return false;
    }
    const _0x37cfb4 = _0x19d1d8[0];
    const _0x3834fd = _0x47451f?.nodes?.[_0x37cfb4] || null;
    if (_0x3834fd?.type !== "media-clip" || _0x3834fd?.mediaClip?.expanded !== true) {
      return false;
    }
    const _0x169e77 = typeof CustomEvent === "function" ? new CustomEvent(MEDIA_CLIP_DELETE_MATERIAL_EVENT, {
      detail: {
        nodeId: _0x37cfb4
      }
    }) : {
      type: MEDIA_CLIP_DELETE_MATERIAL_EVENT,
      detail: {
        nodeId: _0x37cfb4
      }
    };
    window.dispatchEvent?.(_0x169e77);
    return true;
  }
  function _0x13e71e() {
    let _0x4b8b9b = false;
    if (_0x4704e9() || _0x2a1eb7.active) {
      _0x2a1eb7.exit?.({
        silent: true
      });
      _0x4b8b9b = true;
    }
    const _0xf51ca8 = _0x27b213.getState();
    if (_0xf51ca8.annotate?.active) {
      _0xd9b2e5.exit?.({
        silent: true
      });
      _0x4b8b9b = true;
    }
    if (_0xf51ca8.matting?.active) {
      _0x32075d.exit?.({
        silent: true
      });
      _0x4b8b9b = true;
    }
    return _0x4b8b9b;
  }
  function _0x20641f(_0x804322) {
    const _0x185593 = _0x18dbc4[_0x804322];
    if (!_0x185593) {
      return false;
    }
    const _0x33aa3e = _0x27b213.getState();
    if (_0x2ff6ae(_0x33aa3e)) {
      return false;
    }
    const {
      selectedNodeIds: _0xe8609e,
      nodes: _0x4f19ad
    } = _0x33aa3e;
    if (!Array.isArray(_0xe8609e) || _0xe8609e.length !== 1) {
      return false;
    }
    const _0x36ec2c = _0xe8609e[0];
    const _0x3a363d = _0x4f19ad?.[_0x36ec2c];
    if (!_0x3a363d || !_0x185593.nodeTypes.includes(_0x3a363d.type)) {
      return false;
    }
    const _0x5b78e5 = document.getElementById(_0x36ec2c);
    if (!_0x5b78e5) {
      return false;
    }
    const _0x20278d = _0x5b78e5.querySelector(_0x185593.selector);
    if (!_0x20278d) {
      return false;
    }
    if (_0x804322.startsWith("audio-tool-")) {
      try {
        const _0x529f6b = new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          pointerType: "mouse",
          isPrimary: true,
          button: 0
        });
        _0x20278d.dispatchEvent(_0x529f6b);
        return true;
      } catch {
        const _0x28812a = new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          button: 0
        });
        _0x20278d.dispatchEvent(_0x28812a);
        return true;
      }
    }
    if (typeof _0x20278d.click !== "function") {
      return false;
    }
    _0x20278d.click();
    return true;
  }
  function _0x5e54f5() {
    const _0x4fdfe9 = _0x27b213.getState();
    if (_0x2ff6ae(_0x4fdfe9)) {
      return false;
    }
    if (_0x4fdfe9?.ui?.promptAttachmentButtonHidden === true) {
      return false;
    }
    const _0x37a0ab = Array.isArray(_0x4fdfe9?.selectedNodeIds) ? _0x4fdfe9.selectedNodeIds : [];
    if (_0x37a0ab.length !== 1) {
      return false;
    }
    const _0x411a85 = document.getElementById(_0x37a0ab[0]);
    const _0x3951dd = _0x411a85?.querySelector?.(".prompt-attachment-btn");
    if (!_0x3951dd || typeof _0x3951dd.click !== "function") {
      return false;
    }
    _0x3951dd.click();
    return true;
  }
  function _0x4a5b3c() {
    const _0x413291 = _0x27b213.getStateRaw ? _0x27b213.getStateRaw() : _0x27b213.getState();
    const _0x518d26 = Array.isArray(_0x413291?.selectedNodeIds) ? _0x413291.selectedNodeIds : [];
    if (_0x518d26.length !== 1) {
      return null;
    }
    const _0x4f8a3f = _0x518d26[0];
    const _0x3b57e1 = _0x413291?.nodes?.[_0x4f8a3f];
    if (!_0x3b57e1 || _0x3b57e1.type !== "panorama-scene" && _0x3b57e1.type !== "panorama-360") {
      return null;
    }
    const _0x1f2218 = _0x3b57e1.type === "panorama-360" ? _0x3b57e1.panorama360Node || null : _0x3b57e1.sceneNode || null;
    return {
      nodeId: _0x4f8a3f,
      node: _0x3b57e1,
      sceneState: _0x1f2218,
      supportsCamera: _0x3b57e1.type === "panorama-scene"
    };
  }
  function _0x4bb59d({
    nodeId: _0x2abb34,
    mode: _0x599944,
    slot: _0x533ca1
  }) {
    const _0x19ecce = Number(_0x533ca1);
    if (!Number.isInteger(_0x19ecce) || _0x19ecce < 1 || _0x19ecce > 10) {
      return;
    }
    window.dispatchEvent(new CustomEvent("panorama-scene:camera-shortcut", {
      detail: {
        nodeId: _0x2abb34,
        mode: _0x599944 === "save" ? "save" : "activate",
        slot: _0x19ecce
      }
    }));
  }
  function _0x40a471({
    nodeId: _0x4ad740
  }) {
    const _0x9fd776 = String(_0x4ad740 || "").trim();
    if (!_0x9fd776) {
      return;
    }
    window.dispatchEvent(new CustomEvent("panorama-scene:capture-shortcut", {
      detail: {
        nodeId: _0x9fd776
      }
    }));
  }
  function _0x5907f2(_0x3b9f97) {
    const _0x1a61b0 = String(_0x3b9f97?.nodeId || "").trim();
    if (!_0x1a61b0) {
      return;
    }
    const _0x6c3a6e = _0x27b213.getStateRaw ? _0x27b213.getStateRaw() : _0x27b213.getState();
    const _0x3beb6d = _0x6c3a6e?.nodes?.[_0x1a61b0];
    if (!_0x3beb6d) {
      return;
    }
    if (_0x3beb6d.type !== "panorama-scene" && _0x3beb6d.type !== "panorama-360") {
      return;
    }
    _0x27b213.setSelectedNodes?.([_0x1a61b0]);
    setPanoramaSceneEditing({
      nodeId: _0x1a61b0,
      isEditing: true,
      storeInstance: _0x27b213
    });
  }
  function _0x42d072() {
    const _0xe5207f = (_0x3e368b, _0x89cf9b = 800) => {
      const _0x1b647c = _0x27b213.getState();
      const _0x2b592c = _0x1b647c?.nodes?.[_0x3e368b];
      if (!_0x2b592c || _0x2b592c.type !== "comment-note") {
        return false;
      }
      const _0x3e8025 = computeNodesWorldBounds(_0x1b647c?.nodes || {}, [_0x3e368b]);
      const _0x65c61c = getBrowserViewportRect({
        windowObject: typeof window !== "undefined" ? window : undefined,
        containerEl: canvasViewportEl || _0x260f82,
        containerCoordinates: !!canvasViewportEl
      });
      const {
        viewportAlignX: _0x1ad2fa,
        viewportAlignY: _0x2a3ccb
      } = readCommentNoteJumpFocusPref();
      const _0x115585 = computeViewportForWorldBounds(_0x3e8025, _0x65c61c, {
        fixedZoom: resolveJumpZoom(_0x2b592c?.jumpShortcut?.zoomPercent),
        worldAlignX: COMMENT_NOTE_JUMP_WORLD_ALIGN,
        worldAlignY: COMMENT_NOTE_JUMP_WORLD_ALIGN,
        viewportAlignX: _0x1ad2fa,
        viewportAlignY: _0x2a3ccb
      });
      if (!_0x115585) {
        return false;
      }
      _0x594a06?.("comment-note-jump");
      const _0x67f3f4 = _0x27b213.getStateRaw ? _0x27b213.getStateRaw() : _0x27b213.getState();
      const _0x5748e5 = _0x67f3f4?.viewport || {
        x: 0,
        y: 0,
        zoom: 1
      };
      if (typeof _0x5a5ce6 === "function") {
        _0x5a5ce6(_0x5748e5.x, _0x5748e5.y, _0x5748e5.zoom, _0x115585.x, _0x115585.y, _0x115585.zoom, _0x89cf9b);
        return true;
      }
      _0x27b213.updateViewport?.(_0x115585.x, _0x115585.y, _0x115585.zoom);
      _0x27b213.markViewportPersist?.();
      return true;
    };
    _0x240353(_0x8b6700 => {
      if (typeof _0x8b6700 === "string" && _0x8b6700.startsWith("comment-note-jump::")) {
        const _0x44120a = _0x8b6700.slice("comment-note-jump::".length);
        _0xe5207f(_0x44120a, 800);
        return;
      }
      const _0x13479a = _0x4a5b3c();
      switch (_0x8b6700) {
        case "panorama-scene-tool-toggle-mouse":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing) {
              break;
            }
            const _0x580a1e = String(_0x13479a.sceneState?.ui?.activeTool || "").trim();
            const _0x8267ce = String(_0x13479a.sceneState?.ui?.mouseTool || _0x13479a.sceneState?.ui?.activeTool || "").trim();
            const _0x223b77 = _0x580a1e === "move" || _0x580a1e === "rotate" || _0x580a1e === "scale";
            const _0x27e668 = _0x223b77 ? "navigate" : _0x8267ce === "box-select" ? "navigate" : "box-select";
            setPanoramaSceneTool({
              nodeId: _0x13479a.nodeId,
              tool: _0x27e668
            });
            break;
          }
        case "panorama-scene-tool-move":
        case "panorama-scene-tool-scale":
        case "panorama-scene-tool-rotate":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing) {
              break;
            }
            const _0x14341a = _0x8b6700 === "panorama-scene-tool-move" ? "move" : _0x8b6700 === "panorama-scene-tool-scale" ? "scale" : "rotate";
            setPanoramaSceneTool({
              nodeId: _0x13479a.nodeId,
              tool: _0x14341a
            });
            break;
          }
        case "panorama-scene-reset-view":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing) {
              break;
            }
            resetPanoramaSceneView({
              nodeId: _0x13479a.nodeId
            });
            break;
          }
        case "panorama-scene-capture":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing) {
              break;
            }
            _0x40a471({
              nodeId: _0x13479a.nodeId
            });
            break;
          }
        case "panorama-scene-camera-create":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing || _0x13479a?.supportsCamera !== true) {
              break;
            }
            _0x20641f(_0x8b6700);
            break;
          }
        case "ms-sync-video-play":
          {
            const _0x2cd4d0 = _0x27b213.getState();
            const _0x1895b6 = Array.isArray(_0x2cd4d0?.selectedNodeIds) ? _0x2cd4d0.selectedNodeIds : [];
            if (_0x1895b6.length >= 2) {
              _0x3d46aa({
                selectedIds: _0x1895b6,
                state: _0x2cd4d0
              });
            }
            break;
          }
        case "image-tool-matting":
        case "image-tool-repaint":
        case "image-tool-erase":
        case "image-tool-hd":
        case "image-tool-expand":
        case "image-tool-auto-subject":
        case "image-tool-multigrid":
        case "image-tool-multiangle":
        case "image-tool-annotate":
        case "image-tool-crop":
        case "image-tool-fullscreen":
        case "image-tool-download":
        case "video-tool-clip":
        case "video-tool-separate-av":
        case "video-tool-capture-frame":
        case "video-tool-keying":
        case "video-tool-hd":
        case "video-tool-fullscreen":
        case "video-tool-download":
        case "audio-tool-clip":
        case "audio-tool-speed":
        case "audio-tool-download":
        case "clip-tool-crop":
        case "text-tool-copy":
        case "text-tool-fullscreen":
          _0x20641f(_0x8b6700);
          break;
        case "delete":
          {
            const _0x45dd4c = _0x27b213.getState();
            if (_0x45dd4c.annotate?.active) {
              _0xd9b2e5?.deleteSelectedTextCommand?.();
              break;
            }
            if (_0x45dd4c.matting?.active) {
              break;
            }
            if (_0x13479a?.sceneState?.ui?.isEditing) {
              deleteSelectedPanoramaSceneObject({
                nodeId: _0x13479a.nodeId
              });
              break;
            }
            if (_0x541907(_0x45dd4c)) {
              break;
            }
            const _0xd0b0c0 = _0x45dd4c.selectedNodeIds;
            if (_0xd0b0c0.length > 0) {
              _0xa36247("delete_nodes", {
                ids: [..._0xd0b0c0]
              });
            }
            break;
          }
        case "undo":
          {
            const _0x1565ed = _0x27b213.getState();
            if (_0x1565ed.annotate?.active) {
              _0xd9b2e5._undo?.call(_0xd9b2e5);
            } else if (_0x1565ed.matting?.active) {
              _0x32075d._undo?.call(_0x32075d);
            } else {
              _0x1235dd();
              if (_0x13479a?.sceneState?.ui?.isEditing) {
                _0x5907f2(_0x13479a);
              }
            }
            break;
          }
        case "redo":
          {
            const _0x535c4c = _0x27b213.getState();
            if (_0x535c4c.annotate?.active) {
              _0xd9b2e5._redo?.call(_0xd9b2e5);
            } else if (_0x535c4c.matting?.active) {
              _0x32075d._redo?.call(_0x32075d);
            } else {
              _0xf227ff();
              if (_0x13479a?.sceneState?.ui?.isEditing) {
                _0x5907f2(_0x13479a);
              }
            }
            break;
          }
        case "copy":
          _0xa36247("copy");
          break;
        case "copy-media":
          {
            const _0x3c35c6 = _0x27b213.getState().selectedNodeIds;
            if (!Array.isArray(_0x3c35c6) || _0x3c35c6.length !== 1) {
              window.showToast?.(t("appBusinessEvents.copyMedia.selectSingleImageNode"), "warn");
              break;
            }
            const _0x27aa1c = _0x27b213.getState().nodes?.[_0x3c35c6[0]];
            const _0x156ab4 = _0x27aa1c && (_0x27aa1c.type === "source-image" || _0x27aa1c.type === "ai-image" || _0x27aa1c.type === "storyboard");
            if (!_0x156ab4) {
              window.showToast?.(t("appBusinessEvents.copyMedia.selectSingleImageNode"), "warn");
              break;
            }
            copyNodeMediaToSystemClipboard(_0x27aa1c).then(_0x586a64 => {
              if (_0x586a64?.ok) {
                markSystemClipboardWrite({
                  mediaType: String(_0x586a64?.mimeType || "image/png")
                });
                window.showToast?.(t("appBusinessEvents.copyMedia.copied"), "success");
                return;
              }
              if (_0x586a64?.reason === "no-media") {
                window.showToast?.(t("appBusinessEvents.copyMedia.noMedia"), "warn");
                return;
              }
              if (_0x586a64?.reason === "not-supported") {
                window.showToast?.(t("appBusinessEvents.copyMedia.clipboardUnsupported"), "warn");
                return;
              }
              window.showToast?.(t("appBusinessEvents.copyMedia.copyFailed"), "error");
            }).catch(() => {
              window.showToast?.(t("appBusinessEvents.copyMedia.copyFailed"), "error");
            });
            break;
          }
        case "canvas-screenshot":
          {
            startCanvasScreenshot({
              createImageNodeFromBlob: _0x326f1b,
              showToast: (..._0x15ca3d) => window.showToast?.(..._0x15ca3d)
            });
            break;
          }
        case "cut":
          {
            const _0xffa4a2 = _0x27b213.getState().selectedNodeIds;
            if (Array.isArray(_0xffa4a2) && _0xffa4a2.length > 0) {
              const _0x259b12 = [..._0xffa4a2];
              _0xa36247("copy", {
                ids: _0x259b12
              });
              _0xa36247("delete_nodes", {
                ids: _0x259b12
              });
            }
            break;
          }
        case "paste":
          _0x5f4c3e();
          break;
        case "group":
          _0xa36247("create_group");
          break;
        case "align-feature":
        case "align-feature-toggle":
        case "align-feature-hold-start":
        case "align-feature-hold-end":
          {
            const _0x4dadfa = _0x27b213.getState();
            if (_0x4dadfa?.ui?.alignFeatureEnabled === false) {
              break;
            }
            if (_0x8b6700 === "align-feature-hold-end") {
              _0x27b213.setAlignPanelVisible(false);
              break;
            }
            const _0x31eac5 = Array.isArray(_0x4dadfa?.selectedNodeIds) ? _0x4dadfa.selectedNodeIds : [];
            if (_0x31eac5.length < 2) {
              break;
            }
            const _0x35aab3 = getAlignableSelectionNodes(_0x4dadfa?.nodes || {}, _0x31eac5);
            if (_0x35aab3.length < 2) {
              break;
            }
            if (_0x8b6700 === "align-feature-hold-start") {
              const _0x5778b3 = _0x56eacc(_0x4dadfa);
              _0x27b213.setAlignPanelAnchorWorld?.(_0x5778b3);
              _0x27b213.setAlignPanelVisible(true);
              break;
            }
            if (_0x8b6700 === "align-feature-toggle" || _0x8b6700 === "align-feature") {
              const _0x3b2898 = _0x4dadfa?.ui?.alignPanelVisible === true;
              if (_0x3b2898) {
                _0x27b213.setAlignPanelVisible(false);
              } else {
                const _0x2cbe65 = _0x56eacc(_0x4dadfa);
                _0x27b213.setAlignPanelAnchorWorld?.(_0x2cbe65);
                _0x27b213.setAlignPanelVisible(true);
              }
            }
            break;
          }
        case "select-all":
          {
            _0xa36247("select_all");
            break;
          }
        case "fit-all":
          {
            if (_0x13479a?.sceneState?.ui?.isEditing) {
              focusPanoramaSceneSelection({
                nodeId: _0x13479a.nodeId
              });
              break;
            }
            const {
              nodes: _0x5df63f,
              selectedNodeIds: _0x36a7f1
            } = _0x27b213.getState();
            const _0x348a96 = _0x36a7f1 && _0x36a7f1.length > 0 ? _0x36a7f1.filter(_0xff9cc6 => _0x5df63f[_0xff9cc6]) : Object.keys(_0x5df63f || {});
            if (_0x348a96.length === 0) {
              break;
            }
            _0x3a7393?.(_0x348a96, 80, 800);
            break;
          }
        case "minimap":
          {
            const _0x41b009 = document.getElementById("minimapWrapper");
            const _0x61fb6b = document.getElementById("btnMinimap");
            if (_0x41b009) {
              _0x41b009.classList.toggle("open");
              if (_0x61fb6b) {
                _0x61fb6b.classList.toggle("active", _0x41b009.classList.contains("open"));
              }
            }
            break;
          }
        case "zoom-in":
        case "zoom-out":
          {
            _0x594a06?.("shortcut-zoom");
            const {
              viewport: _0xde3f27
            } = _0x27b213.getState();
            const _0x5be2e8 = _0x8b6700 === "zoom-in" ? 1.1 : 0.9;
            const _0x1659c3 = clampCanvasZoom(_0xde3f27.zoom * _0x5be2e8);
            const _0x4afdee = getViewportScreenOrigin(_0xde3f27);
            const _0x4a1251 = Math.max(0, window.innerWidth - _0x4afdee.x) / 2;
            const _0x5532fe = Math.max(0, window.innerHeight - _0x4afdee.y) / 2;
            const _0x457d77 = _0x4a1251 - (_0x4a1251 - _0xde3f27.x) * (_0x1659c3 / _0xde3f27.zoom);
            const _0x2c1d58 = _0x5532fe - (_0x5532fe - _0xde3f27.y) * (_0x1659c3 / _0xde3f27.zoom);
            _0x27b213.updateViewport(_0x457d77, _0x2c1d58, _0x1659c3);
            break;
          }
        case "snap-guides":
          {
            const _0x526e17 = _0x27b213.getState();
            const _0x2dce93 = _0x526e17?.ui?.snapGuidesEnabled === false;
            _0x27b213.setSnapGuidesEnabled(_0x2dce93);
            window.v2SnapGuides = _0x2dce93;
            if (!_0x2dce93) {
              window._clearSnapGuideLines?.();
            }
            window.dispatchEvent(new CustomEvent("v2-snap-guides-changed", {
              detail: {
                enabled: _0x2dce93
              }
            }));
            window.showToast?.(_0x2dce93 ? t("appBusinessEvents.toggles.snapGuides.on") : t("appBusinessEvents.toggles.snapGuides.off"));
            break;
          }
        case "snap-grid":
          {
            const _0x2f83ad = applySnapGridEnabled(!readSnapGridEnabled());
            window.showToast?.(_0x2f83ad ? t("appBusinessEvents.toggles.snapGrid.on") : t("appBusinessEvents.toggles.snapGrid.off"));
            break;
          }
        case "grid-dots":
          {
            const _0x526a6c = setGridDotsPref(!readGridDotsPref());
            window.showToast?.(_0x526a6c ? t("appBusinessEvents.toggles.gridDots.on") : t("appBusinessEvents.toggles.gridDots.off"));
            break;
          }
        case "toggle-connection-lines":
          {
            const _0x5b3f0d = _0x27b213.getState();
            const _0x158db1 = _0x5b3f0d?.ui?.connectionLinesVisible === false;
            _0x27b213.setConnectionLinesVisible(_0x158db1);
            window.dispatchEvent(new CustomEvent("v2-connection-lines-visibility-changed", {
              detail: {
                visible: _0x158db1
              }
            }));
            window.showToast?.(_0x158db1 ? t("appBusinessEvents.toggles.connectionLines.on") : t("appBusinessEvents.toggles.connectionLines.off"));
            break;
          }
        case "toggle-selection-related-highlight":
          {
            const _0x770358 = _0x27b213.getState();
            const _0x224ffa = _0x770358?.ui?.selectionRelatedHighlightEnabled === false;
            setSelectionRelatedHighlightPref(_0x224ffa, _0x27b213);
            window.showToast?.(_0x224ffa ? t("appBusinessEvents.toggles.selectionRelatedHighlight.on") : t("appBusinessEvents.toggles.selectionRelatedHighlight.off"));
            break;
          }
        case "toggle-title-follows-zoom":
          {
            const _0x239d81 = _0x27b213.getState();
            const _0x555ba6 = _0x239d81?.ui?.titleFollowsCanvasZoom !== true;
            setTitleFollowsCanvasZoomPref(_0x555ba6, _0x27b213);
            window.showToast?.(_0x555ba6 ? t("appBusinessEvents.toggles.titleFollowsZoom.on") : t("appBusinessEvents.toggles.titleFollowsZoom.off"));
            break;
          }
        case "toggle-media-node-resize":
          {
            const _0x35b56f = _0x27b213.getState();
            const _0x169145 = _0x35b56f?.ui?.imageVideoNodeResizeEnabled !== true;
            setImageVideoNodeResizePref(_0x169145, _0x27b213);
            window.showToast?.(_0x169145 ? t("appBusinessEvents.toggles.mediaNodeResize.on") : t("appBusinessEvents.toggles.mediaNodeResize.off"));
            break;
          }
        case "toggle-prompt-box-resize":
          {
            const _0x448d17 = _0x27b213.getState();
            const _0x19d811 = _0x448d17?.ui?.promptBoxResizeEnabled === false;
            setPromptBoxResizePref(_0x19d811, _0x27b213);
            window.showToast?.(_0x19d811 ? t("appBusinessEvents.toggles.promptBoxResize.on") : t("appBusinessEvents.toggles.promptBoxResize.off"));
            break;
          }
        case "toggle-node-avoid-overlap":
          {
            const _0x5622b5 = window.v2NodeAvoidOverlap === false;
            setNodeAvoidOverlapPref(_0x5622b5);
            window.showToast?.(_0x5622b5 ? t("appBusinessEvents.toggles.nodeAvoidOverlap.on") : t("appBusinessEvents.toggles.nodeAvoidOverlap.off"));
            break;
          }
        case "reset-media-size":
          {
            const _0x4d8732 = _0x27b213.getState();
            if (_0x2ff6ae(_0x4d8732)) {
              break;
            }
            const _0x20175a = Array.isArray(_0x4d8732?.selectedNodeIds) ? _0x4d8732.selectedNodeIds : [];
            if (_0x20175a.length === 0) {
              break;
            }
            const _0xaf6232 = _0x20175a.some(_0x16c5cf => {
              const _0x469d3b = _0x4d8732?.nodes?.[_0x16c5cf]?.type;
              return _0x469d3b === "source-image" || _0x469d3b === "ai-image" || _0x469d3b === "source-video" || _0x469d3b === "ai-video";
            });
            if (!_0xaf6232) {
              break;
            }
            _0xa36247("reset_source_media_size", {
              ids: _0x20175a
            });
            break;
          }
        case "add-reference":
          _0x5e54f5();
          break;
        case "create-text":
          if (_0x27b213.getState().matting?.active) {
            break;
          }
          {
            const {
              width: _0x41f069,
              height: _0xf1dcda
            } = _0x58e5da("source-text");
            _0x427c5f("source-text", _0x41f069, _0xf1dcda, t("appBusinessEvents.nodeDefaults.sourceText"));
          }
          break;
        case "create-comment-note":
          {
            if (_0x27b213.getState().matting?.active) {
              break;
            }
            const {
              width: _0x1702bc,
              height: _0x2874c6
            } = _0x58e5da("comment-note");
            _0x427c5f("comment-note", _0x1702bc, _0x2874c6, "");
            break;
          }
        case "create-ai-text":
          if (_0x27b213.getState().matting?.active) {
            break;
          }
          {
            const _0x4d47e7 = typeof _0x3fcbd6 === "function" ? _0x3fcbd6("ai-text") : {
              width: 300,
              height: 300
            };
            _0x427c5f("ai-text", _0x4d47e7.width, _0x4d47e7.height, t("appBusinessEvents.nodeDefaults.aiText"));
          }
          break;
        case "create-ai-image":
          if (_0x27b213.getState().matting?.active) {
            break;
          }
          {
            const _0xc6744c = typeof _0x3fcbd6 === "function" ? _0x3fcbd6("ai-image") : {
              width: 288,
              height: 288
            };
            _0x427c5f("ai-image", _0xc6744c.width, _0xc6744c.height, t("appBusinessEvents.nodeDefaults.aiImage"));
          }
          break;
        case "create-ai-video":
          if (_0x27b213.getState().matting?.active) {
            break;
          }
          {
            const _0x44cb4a = typeof _0x3fcbd6 === "function" ? _0x3fcbd6("ai-video") : {
              width: 288,
              height: 288
            };
            _0x427c5f("ai-video", _0x44cb4a.width, _0x44cb4a.height, t("appBusinessEvents.nodeDefaults.aiVideo"));
          }
          break;
        case "create-ai-audio":
          if (_0x27b213.getState().matting?.active) {
            break;
          }
          {
            const _0x579593 = typeof _0x3fcbd6 === "function" ? _0x3fcbd6("ai-audio") : {
              width: 288,
              height: 288
            };
            _0x427c5f("ai-audio", _0x579593.width, _0x579593.height, t("appBusinessEvents.nodeDefaults.aiAudio"));
          }
          break;
        case "upload-file":
          {
            const _0x4d76f6 = _0x27b213.getState();
            if (_0x2ff6ae(_0x4d76f6) || _0x13479a?.sceneState?.ui?.isEditing) {
              break;
            }
            _0x25a7b?.();
            break;
          }
        case "create-scene-detection":
          if (_0x27b213.getState().matting?.active) {
            break;
          }
          _0x427c5f("scene-detection", 400, 500, t("appBusinessEvents.nodeDefaults.sceneDetection"));
          break;
        case "save":
          if (typeof window._v2SaveProjectFromShortcut === "function") {
            window._v2SaveProjectFromShortcut();
          } else {
            window._openSaveDialog?.();
          }
          break;
        case "open-settings":
          {
            toggleSettingsPanel();
            break;
          }
        case "toggle-agent":
          {
            _0x51b090?.();
            break;
          }
        case "open-canvas-projects":
          toggleSidebarSubmenu("canvas-project");
          break;
        case "open-assets":
          toggleSidebarSubmenu("assets");
          break;
        case "open-workflows":
          toggleSidebarSubmenu("workflows");
          break;
        case "open-node-manager":
          toggleSidebarSubmenu("node-manager");
          break;
        case "open-files":
          toggleSidebarSubmenu("files");
          break;
        case "open-task-center":
          toggleSidebarSubmenu("tasks");
          break;
        case "open-custom-ai-app":
          window.dispatchEvent(new CustomEvent("custom-ai-app:toggle", {
            detail: {
              source: "shortcut"
            }
          }));
          break;
        case "editor-tool-brush":
        case "editor-tool-rect":
        case "editor-tool-eraser":
        case "editor-tool-bucket":
        case "editor-tool-text":
          {
            const _0x463fb1 = _0x27b213.getState();
            const _0x48f883 = _0x8b6700 === "editor-tool-rect" ? "rect" : _0x8b6700 === "editor-tool-eraser" ? "eraser" : _0x8b6700 === "editor-tool-bucket" ? "bucket" : _0x8b6700 === "editor-tool-text" ? "text" : "brush";
            if (_0x463fb1.annotate?.active) {
              if (_0xd9b2e5._setTool) {
                _0xd9b2e5._setTool.call(_0xd9b2e5, _0x48f883);
              } else {
                _0x27b213.setAnnotateState({
                  tool: _0x48f883
                });
              }
            } else if (_0x463fb1.matting?.active) {
              if (_0x48f883 === "rect") {
                break;
              }
              if (document.activeElement?.tagName === "INPUT") {
                document.activeElement.blur();
              }
              _0x32075d._switchTool?.call(_0x32075d, _0x48f883);
            }
            break;
          }
        case "editor-clear":
          {
            const _0xd220c4 = _0x27b213.getState();
            if (_0xd220c4.annotate?.active) {
              _0xd9b2e5._clear?.call(_0xd9b2e5);
            } else if (_0xd220c4.matting?.active) {
              _0x32075d._clear?.call(_0x32075d);
            }
            break;
          }
        case "escape-all":
          {
            if (_0x13e71e()) {
              break;
            }
            if (_0x13479a?.sceneState?.ui?.isEditing) {
              setPanoramaSceneEditing({
                nodeId: _0x13479a.nodeId,
                isEditing: false
              });
              break;
            }
            const {
              nodes: _0xe24832
            } = _0x27b213.getState();
            let _0x1e8b64 = false;
            for (const _0x5589a9 in _0xe24832) {
              if (_0xe24832[_0x5589a9].type === "storyboard" && _0xe24832[_0x5589a9].isEditing) {
                _0x27b213.updateNodeData(_0x5589a9, {
                  isEditing: false
                });
                _0x1e8b64 = true;
              }
            }
            if (_0x1e8b64) {
              _0x4447ad();
            }
            const _0x46e3dd = _0x27b213.getState().pickConnectMode;
            if (_0x46e3dd && _0x46e3dd.active) {
              _0x27b213.setPickConnectMode({
                active: false
              });
            }
            _0x167d35();
            _0xd9b2e5.exit?.({
              silent: true
            });
            _0x32075d.exit?.({
              silent: true
            });
            document.getElementById("avatarMenu")?.classList.remove("open");
            document.querySelector(".canvas-proj-dropdown")?.classList.remove("open");
            if (document.getElementById("aboutOverlay")) {
              document.getElementById("aboutOverlay").style.display = "none";
            }
            document.getElementById("v2PickerOverlay")?.remove();
            document.querySelector(".v2-canvas-ctx-menu")?.remove();
            document.querySelector(".v2-node-picker")?.remove();
            document.querySelector(".v2-quote-menu")?.remove();
            if (document.getElementById("nodeMenu")) {
              document.getElementById("nodeMenu").style.display = "none";
            }
            if (document.getElementById("nodeModal")) {
              document.getElementById("nodeModal").style.display = "none";
            }
            if (document.getElementById("settingsOverlay")) {
              document.getElementById("settingsOverlay").style.display = "none";
            }
            if (document.getElementById("imageViewerOverlay")) {
              document.getElementById("imageViewerOverlay").style.display = "none";
            }
            _0x27b213.setAlignPanelVisible(false);
            _0x27b213.clearSelection();
            break;
          }
        case "panorama-scene-camera-1":
        case "panorama-scene-camera-2":
        case "panorama-scene-camera-3":
        case "panorama-scene-camera-4":
        case "panorama-scene-camera-5":
        case "panorama-scene-camera-6":
        case "panorama-scene-camera-7":
        case "panorama-scene-camera-8":
        case "panorama-scene-camera-9":
        case "panorama-scene-camera-0":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing || _0x13479a?.supportsCamera !== true) {
              break;
            }
            const _0x2d0ba3 = _0x8b6700.slice(-1);
            const _0x52e101 = _0x2d0ba3 === "0" ? 10 : Number(_0x2d0ba3);
            _0x4bb59d({
              nodeId: _0x13479a.nodeId,
              mode: "activate",
              slot: _0x52e101
            });
            break;
          }
        case "panorama-scene-camera-save-1":
        case "panorama-scene-camera-save-2":
        case "panorama-scene-camera-save-3":
        case "panorama-scene-camera-save-4":
        case "panorama-scene-camera-save-5":
        case "panorama-scene-camera-save-6":
        case "panorama-scene-camera-save-7":
        case "panorama-scene-camera-save-8":
        case "panorama-scene-camera-save-9":
        case "panorama-scene-camera-save-0":
          {
            if (!_0x13479a?.sceneState?.ui?.isEditing || _0x13479a?.supportsCamera !== true) {
              break;
            }
            const _0x3683ba = _0x8b6700.slice(-1);
            const _0x1c5df2 = _0x3683ba === "0" ? 10 : Number(_0x3683ba);
            _0x4bb59d({
              nodeId: _0x13479a.nodeId,
              mode: "save",
              slot: _0x1c5df2
            });
            break;
          }
      }
    });
  }
  function _0x27be20() {
    window.addEventListener("v2:canvas-paste-request", _0x1f471e => {
      _0x5f4c3e(_0x1f471e?.detail || {});
    });
  }
  function _0x17fbc6() {
    _0x27be20();
    _0x42d072();
    _0x2035f4?.(_0x260f82);
  }
  return {
    bindAll: _0x17fbc6,
    triggerSelectedNodeToolbarAction: _0x20641f,
    triggerSelectedNodeReferenceButton: _0x5e54f5,
    exitActiveFeatureModes: _0x13e71e
  };
}