import { markSystemClipboardWrite } from "../clipboard.js";
import { undo, redo, getHistoryInfo } from "../history.js";
import { calcSafeSpawnPosNearNode } from "../nodeSpawn.js";
import { isCollageImageNode } from "../collage/collageFactory.js";
import { removeContextMenus, showContextMenu } from "./contextMenuPresenter.js";
import { isValidConnection as a1018_0x27dbcf } from "./EdgeController.js";
import { CONTEXT_NODE_CREATION_SECTION_IDS, NODE_CREATION_UPLOAD_ITEM, getNodeCreationMenuSections } from "../nodeCreationMenuCatalog.js";
import { createNodeCreationMenuIcon } from "../nodeCreationMenuIcons.js";
import { resolveStoryboardSourceImageRef } from "../../core/storyboardFactory.js";
import { hitTestNode, screenToWorld } from "../../core/math.js";
import { PANORAMA_SCENE_DEFAULT_SIZE } from "../panoramaSceneNode/sceneNode.js";
import { STORYBOARD_SCRIPT_DEFAULT_SIZE } from "../../core/storyboardScriptFactory.js";
import { getAIGenerationDefaultSizeByType, getAIGenerationNodeSize, getNodeDefaultSize } from "../../services/fileService.js";
import { canOpenKnownFolder, canShowItemInFolder, openKnownFolder, resolveNodeLocalPathForNativeAction, showItemInFolder } from "../../services/nativeFileActionService.js";
import { pasteTextIntoEditableFromClipboard } from "../textInputContextMenu.js";
import { t } from "../../i18n/index.js";
const AI_GENERATION_TYPES = Object.freeze(["ai-text", "ai-image", "ai-video", "ai-audio"]);
const STORYBOARD_QUICK_CREATE_PRESETS = Object.freeze([{
  labelKey: "canvasInteraction.grids.grid4",
  nameKey: "canvasInteraction.grids.grid4",
  cols: 2,
  rows: 2,
  baseShortSide: 400
}, {
  labelKey: "canvasInteraction.grids.grid9",
  nameKey: "canvasInteraction.grids.grid9",
  cols: 3,
  rows: 3,
  baseShortSide: 450
}, {
  labelKey: "canvasInteraction.grids.grid16",
  nameKey: "canvasInteraction.grids.grid16",
  cols: 4,
  rows: 4,
  baseShortSide: 500
}, {
  labelKey: "canvasInteraction.grids.grid25",
  nameKey: "canvasInteraction.grids.grid25",
  cols: 5,
  rows: 5,
  baseShortSide: 550
}]);
function isDevModeOn(_0x1a4dd9 = globalThis.window, _0x32cac5 = globalThis.document) {
  return _0x1a4dd9?.DEV_MODE === true || _0x32cac5?.body?.classList?.contains("dev-mode");
}
function getAiGenerationActionLabel(_0x186457) {
  if (_0x186457 === "ai-image") {
    return t("canvasInteraction.generation.image");
  }
  if (_0x186457 === "ai-video") {
    return t("canvasInteraction.generation.video");
  }
  if (_0x186457 === "ai-audio") {
    return t("canvasInteraction.generation.audio");
  }
  return t("canvasInteraction.generation.text");
}
function getAiGenerationNodeName(_0x5cb08b) {
  if (_0x5cb08b === "ai-image") {
    return t("canvasInteraction.generationNames.image");
  }
  if (_0x5cb08b === "ai-video") {
    return t("canvasInteraction.generationNames.video");
  }
  if (_0x5cb08b === "ai-audio") {
    return t("canvasInteraction.generationNames.audio");
  }
  return t("canvasInteraction.generationNames.text");
}
function getAiGenerationMenuItem(_0x4f8468) {
  const _0x114867 = getAIGenerationDefaultSizeByType(_0x4f8468);
  return {
    type: _0x4f8468,
    label: getAiGenerationActionLabel(_0x4f8468),
    name: getAiGenerationNodeName(_0x4f8468),
    width: _0x114867.width,
    height: _0x114867.height
  };
}
function getCreationMenuNodeSize(_0x2c5c2a) {
  if (AI_GENERATION_TYPES.includes(_0x2c5c2a)) {
    return getAIGenerationDefaultSizeByType(_0x2c5c2a);
  }
  if (_0x2c5c2a === "panorama-scene" || _0x2c5c2a === "panorama-360") {
    return PANORAMA_SCENE_DEFAULT_SIZE;
  }
  if (_0x2c5c2a === "storyboard-script") {
    return STORYBOARD_SCRIPT_DEFAULT_SIZE;
  }
  return getNodeDefaultSize(_0x2c5c2a);
}
function calcNodesBBox(_0x5981b3, _0x18a776) {
  let _0x54b000 = Infinity;
  let _0x389686 = Infinity;
  let _0x598f4f = -Infinity;
  let _0x5edeb4 = -Infinity;
  for (const _0x567b29 of _0x18a776) {
    const _0xf35773 = _0x5981b3[_0x567b29];
    if (!_0xf35773) {
      continue;
    }
    const _0x2ff694 = _0xf35773.width || 260;
    const _0x3a1bbc = _0xf35773.height || 100;
    _0x54b000 = Math.min(_0x54b000, _0xf35773.x);
    _0x389686 = Math.min(_0x389686, _0xf35773.y);
    _0x598f4f = Math.max(_0x598f4f, _0xf35773.x + _0x2ff694);
    _0x5edeb4 = Math.max(_0x5edeb4, _0xf35773.y + _0x3a1bbc);
  }
  if (_0x54b000 === Infinity) {
    return null;
  }
  return {
    x: _0x54b000,
    y: _0x389686,
    width: _0x598f4f - _0x54b000,
    height: _0x5edeb4 - _0x389686
  };
}
function pushRow(_0x1e053c, _0x3f3e0f, _0x585c5e, _0x3a8e44, _0x50f5c0 = {}) {
  _0x1e053c.push({
    label: _0x3f3e0f,
    kbd: _0x585c5e,
    action: _0x3a8e44,
    ..._0x50f5c0
  });
}
function pushSeparator(_0x17812b) {
  _0x17812b.push("sep");
}
export function createCanvasContextMenuController({
  store: _0x5cc31a,
  graphStore = _0x5cc31a,
  commandAdapter: _0x2a3f72,
  getShortcuts: _0x469088,
  onUploadFile: _0x5ee57b,
  windowObject = globalThis.window,
  documentObject = globalThis.document
} = {}) {
  const _0x3b3149 = () => {
    const _0x394bff = documentObject?.querySelector?.(".v2-canvas-stage") || null;
    const _0x5461ef = Number(_0x394bff?.getBoundingClientRect?.()?.top);
    return {
      viewportTop: Number.isFinite(_0x5461ef) ? Math.max(0, _0x5461ef) : 0
    };
  };
  if (!_0x5cc31a || !_0x2a3f72) {
    throw new TypeError("[canvasContextMenuController] store and commandAdapter are required");
  }
  const _0x668a50 = () => _0x5cc31a.getStateRaw?.() || _0x5cc31a.getState?.() || {};
  const _0x2f4c91 = (_0x19056d, _0x530926 = {}) => _0x2a3f72.execute(_0x19056d, _0x530926);
  const _0x26517e = (_0x4a62b2, _0x4a25da = {}) => _0x2a3f72.executeCanvasCommand(_0x4a62b2, _0x4a25da);
  const _0x526f58 = (_0x1d5281, _0x425769 = "") => {
    const _0x4c763f = _0x469088?.()?.[_0x1d5281];
    if (!_0x4c763f || !Array.isArray(_0x4c763f.keys)) {
      return _0x425769;
    }
    return _0x4c763f.keys.join(" ");
  };
  const _0x1c5155 = (_0xd48bd7, _0x1f2016 = 16, _0x521b7e = 16) => {
    const _0x3a55e7 = _0x26517e("node.duplicate", {
      ids: _0xd48bd7,
      dx: _0x1f2016,
      dy: _0x521b7e,
      edgePolicy: "all-touching"
    });
    if (_0x3a55e7.ok) {
      return _0x3a55e7.result?.idMap || {};
    } else {
      return {};
    }
  };
  function _0x524823(_0x184297, _0x3ac625) {
    if (!_0x184297 || !_0x3ac625) {
      return null;
    }
    return _0x26517e("storyboard.createGridFromNode", {
      sourceId: _0x184297.id,
      name: t(_0x3ac625.nameKey),
      cols: _0x3ac625.cols,
      rows: _0x3ac625.rows,
      baseShortSide: _0x3ac625.baseShortSide
    });
  }
  function _0x4f3039(_0x346a3f) {
    const _0xa4e882 = _0x26517e("collage.createFromSelection", {
      ids: Array.isArray(_0x346a3f) ? _0x346a3f : []
    });
    if (!_0xa4e882.ok) {
      const _0x1ffb59 = _0xa4e882.errorCode === "NO_COLLAGE_IMAGES" ? "warning" : "error";
      windowObject?.showToast?.(_0xa4e882.message || t("canvasInteraction.grids.boundsFailed"), _0x1ffb59);
      return null;
    }
    return _0xa4e882.result?.nodeId || null;
  }
  function _0x2c229d(_0x40da70, _0x2ff710, _0x3b0c89 = {}) {
    removeContextMenus();
    const _0x1055fc = _0x668a50();
    const _0x1ac5e8 = _0x1055fc.nodes || {};
    const _0x2a348a = Array.isArray(_0x3b0c89.targetNodeIds) ? _0x3b0c89.targetNodeIds : [];
    const _0x49bb5b = _0x2a348a.filter(_0x155b30 => !!_0x1ac5e8[_0x155b30]);
    if (_0x49bb5b.length === 0) {
      return null;
    }
    const _0xd458b7 = _0x3b0c89.primaryNodeId && _0x1ac5e8[_0x3b0c89.primaryNodeId] ? _0x3b0c89.primaryNodeId : _0x49bb5b[0];
    const _0x4a631f = _0xd458b7 ? _0x1ac5e8[_0xd458b7] : null;
    const _0x3c4435 = [];
    const _0x5e6d89 = (_0x20ce44, _0x4bb671, _0x39240f, _0x44ad30) => pushRow(_0x3c4435, _0x20ce44, _0x4bb671, _0x39240f, _0x44ad30);
    const _0x27f0fd = () => pushSeparator(_0x3c4435);
    const _0x11f512 = (_0x285dbb, _0x45d40c, _0x31297f = {}) => _0x3c4435.push({
      label: _0x285dbb,
      subItems: _0x45d40c,
      ..._0x31297f
    });
    _0x5e6d89(t("canvasInteraction.contextMenu.copyNode"), _0x526f58("copy", "Ctrl C"), () => {
      _0x2f4c91("copy", {
        ids: [..._0x49bb5b]
      });
      windowObject?.showToast?.(t("canvasInteraction.toasts.nodeCopied"), "success");
    });
    _0x5e6d89(t("canvasInteraction.contextMenu.cutNode"), _0x526f58("cut", "Ctrl X"), () => {
      const _0x5f0955 = [..._0x49bb5b];
      _0x2f4c91("copy", {
        ids: _0x5f0955
      });
      _0x2f4c91("delete_nodes", {
        ids: _0x5f0955
      });
      windowObject?.showToast?.(t("canvasInteraction.toasts.nodeCut"), "success");
    });
    _0x5e6d89(t("canvasInteraction.contextMenu.paste"), _0x526f58("paste", "Ctrl V"), () => {
      windowObject?.dispatchEvent?.(new CustomEvent("v2:canvas-paste-request", {
        detail: {
          screenX: _0x40da70,
          screenY: _0x2ff710
        }
      }));
    });
    const _0x3c7923 = _0x49bb5b.filter(_0x5d8908 => isCollageImageNode(_0x1ac5e8[_0x5d8908]));
    if (_0x3c7923.length >= 2) {
      _0x5e6d89(t("canvasInteraction.contextMenu.materialComparison"), "", () => {
        const _0x30826e = _0x3c7923.map(_0x28082f => _0x1ac5e8[_0x28082f]).filter(Boolean);
        import("../materialComparison.js").then(({
          openMaterialComparison: _0x588843
        }) => {
          _0x588843(_0x30826e);
        }).catch(() => windowObject?.showToast?.(t("canvasInteraction.toasts.materialComparisonFailed"), "error"));
      });
      _0x5e6d89(t("canvasInteraction.contextMenu.createCollage"), "", () => {
        _0x4f3039(_0x3c7923);
      });
    }
    if (_0x4a631f && _0x49bb5b.length === 1) {
      const _0x128d1a = ["ai-image", "source-image", "storyboard"].includes(_0x4a631f.type);
      const _0x4334fd = _0x4a631f.imageUrl || _0x4a631f.sourceUrl || _0x4a631f.src || _0x4a631f.localPath;
      if (_0x128d1a && _0x4334fd) {
        _0x5e6d89(t("canvasInteraction.contextMenu.copyImage"), _0x526f58("copy-media", "Ctrl Shift C"), () => {
          if (_0x4a631f.id) {
            graphStore.setSelectedNodes([_0x4a631f.id]);
          }
          windowObject?.dispatchEvent?.(new CustomEvent("shortcut-action", {
            detail: "copy-media"
          }));
        });
      }
    }
    const _0x2ee464 = _0x3dcf9e => {
      if (!_0xd458b7 || !_0x49bb5b.length) {
        return;
      }
      const _0x382a54 = {
        x: Number.isFinite(Number(_0x3dcf9e?.clientX)) ? Number(_0x3dcf9e.clientX) : _0x40da70,
        y: Number.isFinite(Number(_0x3dcf9e?.clientY)) ? Number(_0x3dcf9e.clientY) : _0x2ff710
      };
      graphStore.setSelectedNodes([..._0x49bb5b]);
      import("../AssetManager.js").then(({
        assetManager: _0x10eb11
      }) => {
        _0x10eb11.showLibrarySavePanel([..._0x49bb5b], null, {
          point: _0x382a54
        });
      }).catch(() => windowObject?.showToast?.(t("canvasInteraction.toasts.assetPanelFailed"), "error"));
    };
    let _0x7ac19c = "";
    let _0x148238 = false;
    let _0x462282 = false;
    if (_0x4a631f && _0x49bb5b.length === 1) {
      _0x7ac19c = resolveNodeLocalPathForNativeAction(_0x4a631f);
      _0x148238 = canShowItemInFolder(_0x7ac19c);
      _0x462282 = canOpenKnownFolder("output");
    }
    if (_0x4a631f || _0x148238) {
      _0x27f0fd();
      if (_0x4a631f) {
        _0x5e6d89(t("canvasInteraction.contextMenu.addAsset"), "", _0x2ee464);
      }
      if (_0x148238) {
        _0x5e6d89(t("canvasInteraction.contextMenu.revealAsset"), "", () => {
          showItemInFolder(_0x7ac19c).catch(() => windowObject?.showToast?.(t("canvasInteraction.toasts.assetRevealFailed"), "error"));
        });
      }
      _0x27f0fd();
    }
    if (_0x462282) {
      _0x5e6d89(t("canvasInteraction.contextMenu.openOutputFolder"), "", () => {
        openKnownFolder("output").catch(() => windowObject?.showToast?.(t("canvasInteraction.toasts.outputFolderFailed"), "error"));
      });
      _0x27f0fd();
    }
    _0x5e6d89(t("canvasInteraction.contextMenu.duplicate"), "", () => {
      const _0x29e397 = _0x668a50();
      const _0xb1894d = _0x29e397.nodes || {};
      const _0x44e296 = (_0x29e397.selectedNodeIds || []).filter(_0x57d35d => !!_0xb1894d[_0x57d35d]);
      const _0x5537e4 = _0x44e296.length > 0 ? _0x44e296 : [..._0x49bb5b];
      const _0x39a5af = calcNodesBBox(_0xb1894d, _0x5537e4);
      const _0x34801a = Math.max(280, _0x39a5af?.width || 0);
      const _0x2cac0a = Math.max(300, _0x39a5af?.height || 0);
      const _0x32829f = _0xd458b7 && _0xb1894d[_0xd458b7] || _0x39a5af;
      if (!_0x32829f) {
        return;
      }
      const _0x1f4a4c = calcSafeSpawnPosNearNode(_0xb1894d, _0x32829f, _0x34801a, _0x2cac0a);
      _0x1c5155(_0x5537e4, _0x1f4a4c.x - _0x32829f.x, _0x1f4a4c.y - _0x32829f.y);
      windowObject?.showToast?.(t("canvasInteraction.toasts.duplicateWithEdgesCreated"), "success");
    });
    if (_0x4a631f && _0x49bb5b.length === 1 && ["ai-text", "source-text"].includes(_0x4a631f.type)) {
      _0x5e6d89(t("canvasInteraction.contextMenu.copyText"), "", () => {
        const _0x1dc70b = _0x4a631f.outputText || _0x4a631f.content || "";
        if (!_0x1dc70b) {
          windowObject?.showToast?.(t("canvasInteraction.toasts.noNodeText"), "warn");
          return;
        }
        navigator.clipboard.writeText(_0x1dc70b).then(() => {
          markSystemClipboardWrite({
            text: _0x1dc70b
          });
          windowObject?.showToast?.(t("canvasInteraction.toasts.textCopied"), "success");
        }).catch(() => {
          windowObject?.showToast?.(t("canvasInteraction.toasts.copyFailed"), "error");
        });
      });
    }
    _0x5e6d89(t("canvasInteraction.contextMenu.deleteNode"), _0x526f58("delete", "Del"), () => {
      _0x2f4c91("delete_nodes", {
        ids: [..._0x49bb5b]
      });
    }, {
      danger: true
    });
    if (_0x4a631f && _0x49bb5b.length === 1) {
      _0x27f0fd();
      const _0x1a6c5f = AI_GENERATION_TYPES.map(getAiGenerationMenuItem).filter(_0x4f5f52 => a1018_0x27dbcf(_0x4a631f, {
        id: "__fake_" + _0x4f5f52.type,
        type: _0x4f5f52.type
      }));
      _0x1a6c5f.forEach(_0x43988a => {
        _0x5e6d89(_0x43988a.label, "", () => {
          _0x26517e("node.createConnected", {
            sourceId: _0xd458b7,
            type: _0x43988a.type,
            width: _0x43988a.width,
            height: _0x43988a.height,
            name: _0x43988a.name,
            inheritSource: true
          });
        });
      });
      const _0x90cd6c = ["ai-image", "source-image", "storyboard"].includes(_0x4a631f.type);
      if (_0x90cd6c && resolveStoryboardSourceImageRef(_0x4a631f)) {
        _0x27f0fd();
        const _0x448b7b = STORYBOARD_QUICK_CREATE_PRESETS.map(_0x42b467 => ({
          label: t(_0x42b467.labelKey),
          action: () => _0x524823(_0x4a631f, _0x42b467)
        }));
        _0x11f512(t("canvasInteraction.grids.createGrid"), _0x448b7b);
      }
    }
    return showContextMenu(_0x40da70, _0x2ff710, _0x3c4435, _0x3b3149());
  }
  function _0x2d98ef(_0x12a412, _0x363ba0) {
    const _0x5d464a = _0x668a50();
    const _0x54d21e = hitTestNode(_0x12a412, _0x363ba0, _0x5d464a.nodes, _0x5d464a.viewport);
    if (!_0x54d21e) {
      return null;
    }
    const _0x48bc2b = _0x5d464a.selectedNodeIds || [];
    if (!_0x48bc2b.includes(_0x54d21e)) {
      graphStore.setSelectedNodes([_0x54d21e]);
    }
    const _0x40c5dc = _0x668a50();
    return _0x2c229d(_0x12a412, _0x363ba0, {
      primaryNodeId: _0x54d21e,
      targetNodeIds: _0x40c5dc.selectedNodeIds
    });
  }
  function _0x4dea71(_0x30ccde, _0x458df6) {
    const {
      viewport: _0x5e3f14
    } = _0x668a50();
    const {
      x: _0x1b3ab2,
      y: _0x1b36af
    } = screenToWorld(_0x30ccde, _0x458df6, _0x5e3f14);
    const _0xd36d28 = [];
    const _0x29e425 = (_0x42b7ec, _0x190815, _0x5ae226, _0x8f2334) => pushRow(_0xd36d28, _0x42b7ec, _0x190815, _0x5ae226, _0x8f2334);
    const _0x44e497 = (_0x4d8fad, _0x1b4111, _0x48fb6e = {}) => _0xd36d28.push({
      label: _0x4d8fad,
      subItems: _0x1b4111,
      ..._0x48fb6e
    });
    const _0x116c66 = getNodeCreationMenuSections(CONTEXT_NODE_CREATION_SECTION_IDS, {
      includeDevOnly: isDevModeOn(windowObject, documentObject)
    }).map(_0x1e5fe5 => ({
      label: _0x1e5fe5.label,
      iconEl: createNodeCreationMenuIcon("section-" + _0x1e5fe5.id, {
        documentObject: documentObject
      }),
      subItems: _0x1e5fe5.items.map(_0x515dee => {
        const _0x49b6fd = getCreationMenuNodeSize(_0x515dee.type);
        return {
          label: _0x515dee.label,
          desc: _0x515dee.subtitle,
          badge: _0x515dee.badge,
          iconEl: createNodeCreationMenuIcon(_0x515dee.type, {
            documentObject: documentObject
          }),
          action: () => {
            _0x2f4c91("create_node", {
              type: _0x515dee.type,
              x: _0x1b3ab2 - _0x49b6fd.width / 2,
              y: _0x1b36af - _0x49b6fd.height / 2,
              width: _0x49b6fd.width,
              height: _0x49b6fd.height,
              name: _0x515dee.defaultName || _0x515dee.label,
              extra: {
                needsAutoResize: _0x515dee.type === "source-image" || _0x515dee.type === "source-video"
              }
            });
          }
        };
      })
    }));
    _0x44e497(t("canvasInteraction.contextMenu.addNode"), _0x116c66, {
      iconEl: createNodeCreationMenuIcon("add-node", {
        documentObject: documentObject
      })
    });
    if (typeof _0x5ee57b === "function") {
      _0x29e425(NODE_CREATION_UPLOAD_ITEM.label, "", () => {
        _0x5ee57b({
          screenX: _0x30ccde,
          screenY: _0x458df6
        });
      }, {
        iconEl: createNodeCreationMenuIcon("upload", {
          documentObject: documentObject
        })
      });
    }
    pushSeparator(_0xd36d28);
    _0x29e425(t("canvasInteraction.contextMenu.paste"), _0x526f58("paste", "Ctrl V"), () => {
      windowObject?.dispatchEvent?.(new CustomEvent("v2:canvas-paste-request", {
        detail: {
          screenX: _0x30ccde,
          screenY: _0x458df6
        }
      }));
    }, {
      iconEl: createNodeCreationMenuIcon("paste", {
        documentObject: documentObject
      })
    });
    const _0x2d6b3c = getHistoryInfo();
    _0x29e425(t("canvasInteraction.contextMenu.undo"), _0x526f58("undo", "Ctrl Z"), () => undo(), {
      disabled: !(Number(_0x2d6b3c?.undoCount) > 0),
      iconEl: createNodeCreationMenuIcon("undo", {
        documentObject: documentObject
      })
    });
    _0x29e425(t("canvasInteraction.contextMenu.redo"), _0x526f58("redo", "Ctrl Y"), () => redo(), {
      disabled: !(Number(_0x2d6b3c?.redoCount) > 0),
      iconEl: createNodeCreationMenuIcon("redo", {
        documentObject: documentObject
      })
    });
    return showContextMenu(_0x30ccde, _0x458df6, _0xd36d28, _0x3b3149());
  }
  function _0x55ff15(_0x1a34a2, _0x4d5626, _0x1d4804, _0x28027b = {}) {
    const _0x473c1a = [];
    const _0x41467b = (_0x357d93, _0x1ac021, _0x1fb254, _0xfa4c82) => pushRow(_0x473c1a, _0x357d93, _0x1ac021, _0x1fb254, _0xfa4c82);
    const _0x5c1257 = _0x668a50();
    const _0x533d47 = _0x5c1257.viewport;
    const _0x1ebb8e = _0x5c1257.nodes || {};
    const {
      x: _0x21e170,
      y: _0x388401
    } = screenToWorld(_0x1a34a2, _0x4d5626, _0x533d47);
    const _0x32ea1b = String(_0x28027b.anchorNodeId || "").trim();
    const _0x250790 = _0x32ea1b && _0x1ebb8e[_0x32ea1b] ? _0x32ea1b : hitTestNode(_0x1a34a2, _0x4d5626, _0x1ebb8e, _0x533d47);
    const _0x2d2dc4 = _0x250790 ? _0x1ebb8e[_0x250790] : null;
    if (_0x2d2dc4) {
      graphStore.setSelectedNodes([_0x250790]);
      _0x41467b(t("canvasInteraction.contextMenu.copyNode"), _0x526f58("copy", "Ctrl C"), () => {
        _0x2f4c91("copy");
        windowObject?.showToast?.(t("canvasInteraction.toasts.nodeCopied"), "success");
      });
      _0x41467b(t("canvasInteraction.contextMenu.cutNode"), _0x526f58("cut", "Ctrl X"), () => {
        _0x2f4c91("copy", {
          ids: [_0x250790]
        });
        _0x2f4c91("delete_nodes", {
          ids: [_0x250790]
        });
        windowObject?.showToast?.(t("canvasInteraction.toasts.nodeCut"), "success");
      });
      _0x41467b(t("canvasInteraction.contextMenu.duplicate"), "", () => {
        const _0x170bd5 = _0x668a50().selectedNodeIds || [];
        const _0x411965 = _0x170bd5.includes(_0x250790) ? [..._0x170bd5] : [_0x250790];
        const _0x3ab715 = _0x411965.length === 1 ? _0x2d2dc4.height || 280 : 300;
        const _0x1d21ae = calcSafeSpawnPosNearNode(_0x1ebb8e, _0x2d2dc4, 280, _0x3ab715);
        _0x1c5155(_0x411965, _0x1d21ae.x - _0x2d2dc4.x, _0x1d21ae.y - _0x2d2dc4.y);
        windowObject?.showToast?.(t("canvasInteraction.toasts.duplicateWithEdgesCreated"), "success");
      });
    }
    _0x41467b(t("canvasInteraction.contextMenu.copyText"), "Ctrl C", () => {
      navigator.clipboard.writeText(_0x1d4804).then(() => {
        markSystemClipboardWrite({
          text: _0x1d4804
        });
        windowObject?.showToast?.(t("canvasInteraction.toasts.selectedTextCopied"), "success");
      }).catch(() => {
        windowObject?.showToast?.(t("canvasInteraction.toasts.copyFailed"), "error");
      });
    });
    if (_0x28027b.pasteTarget) {
      _0x41467b(t("canvasInteraction.contextMenu.pasteText"), "Ctrl V", () => {
        pasteTextIntoEditableFromClipboard(_0x28027b.pasteTarget, _0x28027b.pasteSelection || null);
      });
    }
    if (_0x2d2dc4) {
      _0x41467b(t("canvasInteraction.contextMenu.deleteNode"), _0x526f58("delete", "Del"), () => {
        _0x2f4c91("delete_nodes", {
          ids: [_0x250790]
        });
      }, {
        danger: true
      });
    }
    pushSeparator(_0x473c1a);
    AI_GENERATION_TYPES.forEach(_0x13cabe => {
      const _0x4d7786 = getAIGenerationDefaultSizeByType(_0x13cabe);
      _0x41467b(getAiGenerationActionLabel(_0x13cabe), "", () => {
        const _0x2d9a4b = _0x13cabe === "ai-image" || _0x13cabe === "ai-video" ? getAIGenerationNodeSize(_0x4d7786.width, _0x4d7786.height) : {
          width: _0x4d7786.width,
          height: _0x4d7786.height
        };
        let _0x35909c = _0x21e170 - _0x2d9a4b.width / 2;
        let _0x564916 = _0x388401 - _0x2d9a4b.height / 2;
        if (_0x2d2dc4) {
          const _0x319312 = calcSafeSpawnPosNearNode(_0x1ebb8e, _0x2d2dc4, _0x2d9a4b.width, _0x2d9a4b.height);
          _0x35909c = _0x319312.x;
          _0x564916 = _0x319312.y;
        }
        _0x2f4c91("create_node", {
          type: _0x13cabe,
          x: _0x35909c,
          y: _0x564916,
          width: _0x2d9a4b.width,
          height: _0x2d9a4b.height,
          name: getAiGenerationNodeName(_0x13cabe),
          prompt: _0x1d4804,
          needsAutoResize: _0x13cabe === "ai-image" || _0x13cabe === "ai-video",
          ...(_0x13cabe === "ai-image" || _0x13cabe === "ai-video" ? {
            aspectRatio: "自适应"
          } : {})
        });
      });
    });
    return showContextMenu(_0x1a34a2, _0x4d5626, _0x473c1a, _0x3b3149());
  }
  return {
    handleNodeContextMenu: _0x2d98ef,
    handleTextContextMenu: _0x55ff15,
    showCanvasContextMenu: _0x4dea71,
    showNodesContextMenu: _0x2c229d
  };
}