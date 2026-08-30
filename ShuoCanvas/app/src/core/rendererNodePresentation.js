import { isNodeType } from "../modules/registry.js";
import { getRefKindByNodeType } from "../modules/nodeMeta.js";
import { resolveModelProvider } from "../manifests/index.js";
import { t } from "../i18n/index.js";
import { shouldShowGenerationBusyUi } from "./generationTaskUiState.js";
const FAST_PREVIEW_PRESENTATION_OWNER = "fast-preview";
const FAST_PREVIEW_OWNED_NODE_Z_INDEX = "10";
function normalizeRendererNodeZIndex(_0x340166) {
  const _0x8dbf4a = String(_0x340166 ?? "").trim();
  return _0x8dbf4a || FAST_PREVIEW_OWNED_NODE_Z_INDEX;
}
function resolveFastPreviewOwnedNodeZIndex(_0x4fb235) {
  const _0x2095a4 = Number.parseInt(_0x4fb235, 10);
  const _0x141d6a = Number.parseInt(FAST_PREVIEW_OWNED_NODE_Z_INDEX, 10);
  if (!Number.isFinite(_0x2095a4)) {
    return FAST_PREVIEW_OWNED_NODE_Z_INDEX;
  }
  return String(Math.min(_0x2095a4, _0x141d6a));
}
function applyRendererNodePresentationZIndex(_0x5356e8) {
  if (!_0x5356e8?.dataset || !_0x5356e8?.style) {
    return "";
  }
  const _0x6d3e3d = normalizeRendererNodeZIndex(_0x5356e8.dataset.rendererPresentationTargetZIndex || _0x5356e8.style.zIndex);
  const _0x5a29ce = _0x5356e8.dataset.rendererPresentationOwner === FAST_PREVIEW_PRESENTATION_OWNER ? resolveFastPreviewOwnedNodeZIndex(_0x6d3e3d) : _0x6d3e3d;
  if (_0x5356e8.style.zIndex !== _0x5a29ce) {
    _0x5356e8.style.zIndex = _0x5a29ce;
  }
  return _0x5a29ce;
}
export function syncRendererNodePresentationZIndex(_0x3a4230, _0xaa062f) {
  if (!_0x3a4230?.dataset || !_0x3a4230?.style) {
    return "";
  }
  const _0x12075f = normalizeRendererNodeZIndex(_0xaa062f);
  if (_0x3a4230.dataset.rendererPresentationTargetZIndex !== _0x12075f) {
    _0x3a4230.dataset.rendererPresentationTargetZIndex = _0x12075f;
  }
  return applyRendererNodePresentationZIndex(_0x3a4230);
}
export function liftRendererNodePresentationZIndex(_0x245e22, _0x445949) {
  if (!_0x245e22?.dataset || !_0x245e22?.style) {
    return "";
  }
  const _0x2cfa79 = Number.parseInt(_0x245e22.dataset.rendererPresentationTargetZIndex || _0x245e22.style.zIndex, 10);
  const _0x1165ba = Number.parseInt(_0x445949, 10);
  if (!Number.isFinite(_0x2cfa79) || Number.isFinite(_0x1165ba) && _0x2cfa79 < _0x1165ba) {
    return syncRendererNodePresentationZIndex(_0x245e22, _0x445949);
  }
  return applyRendererNodePresentationZIndex(_0x245e22);
}
export function syncRendererFastPreviewPresentationOwner(_0x3d5219, _0x2b679e) {
  if (!_0x3d5219?.dataset || !_0x3d5219?.style) {
    return false;
  }
  if (!_0x3d5219.dataset.rendererPresentationTargetZIndex) {
    _0x3d5219.dataset.rendererPresentationTargetZIndex = normalizeRendererNodeZIndex(_0x3d5219.style.zIndex);
  }
  if (_0x2b679e === true) {
    if (_0x3d5219.dataset.rendererPresentationOwner !== FAST_PREVIEW_PRESENTATION_OWNER) {
      _0x3d5219.dataset.rendererPresentationOwner = FAST_PREVIEW_PRESENTATION_OWNER;
    }
  } else if (_0x3d5219.dataset.rendererPresentationOwner === FAST_PREVIEW_PRESENTATION_OWNER) {
    delete _0x3d5219.dataset.rendererPresentationOwner;
  }
  applyRendererNodePresentationZIndex(_0x3d5219);
  return true;
}
export function syncRendererNodeDragTransform(_0x3a8fae, _0x1e6ca7, {
  active = false,
  offsetX = 0,
  offsetY = 0,
  positionChanged = false
} = {}) {
  if (!_0x3a8fae?.style || !_0x1e6ca7) {
    return "";
  }
  const _0x3505ef = _0x3a8fae._dragPreviewTransformActive === true;
  if (active === true) {
    const _0x35e5f1 = Number.isFinite(offsetX) ? offsetX : 0;
    const _0x3d8f27 = Number.isFinite(offsetY) ? offsetY : 0;
    const _0x2f7644 = "translate(" + (_0x1e6ca7.x + _0x35e5f1) + "px, " + (_0x1e6ca7.y + _0x3d8f27) + "px)";
    if (_0x3a8fae.style.transform !== _0x2f7644) {
      _0x3a8fae.style.transform = _0x2f7644;
    }
    _0x3a8fae._dragPreviewTransformActive = true;
    return _0x2f7644;
  }
  if (positionChanged || _0x3505ef) {
    const _0x225d78 = "translate(" + _0x1e6ca7.x + "px, " + _0x1e6ca7.y + "px)";
    if (_0x3a8fae.style.transform !== _0x225d78) {
      _0x3a8fae.style.transform = _0x225d78;
    }
    if (_0x3505ef) {
      delete _0x3a8fae._dragPreviewTransformActive;
    }
    return _0x225d78;
  }
  return _0x3a8fae.style.transform || "";
}
export function getRendererDefaultNodeLabel(_0xaa3bae) {
  const _0x2f8b25 = String(_0xaa3bae?.type || "");
  let _0x405506 = t("coreUi.renderer.defaultNodeNames.node");
  if (_0x2f8b25.includes("image")) {
    _0x405506 = t("coreUi.renderer.defaultNodeNames.image");
  } else if (_0x2f8b25.includes("video")) {
    _0x405506 = t("coreUi.renderer.defaultNodeNames.video");
  } else if (_0x2f8b25.includes("audio")) {
    _0x405506 = t("coreUi.renderer.defaultNodeNames.audio");
  } else if (_0x2f8b25.includes("text")) {
    _0x405506 = t("coreUi.renderer.defaultNodeNames.text");
  }
  return _0x405506;
}
export function getRendererNodeZIndex(_0x63ce15, _0x9c8d1a, _0xf8c51d = -1, _0x68c57e = {}) {
  if (isNodeType(_0x63ce15, "group")) {
    return "auto";
  }
  if (isNodeType(_0x63ce15, "debug")) {
    return "1200";
  }
  if (isNodeType(_0x63ce15, "media-clip") && _0x63ce15?.mediaClip?.expanded === true) {
    return "12000";
  }
  if (_0x68c57e?.isFocused === true) {
    return "180";
  }
  if (_0x63ce15?.isImagesExpanded || _0x63ce15?.isVideosExpanded) {
    return "140";
  }
  if (!_0x9c8d1a) {
    return "10";
  }
  const _0x542293 = Math.max(0, Math.min(39, Number(_0xf8c51d) || 0));
  return String(100 + _0x542293);
}
export function shouldSkipInitialMediaNodeUpdate(_0x2362d7, _0x2d81c1) {
  return _0x2d81c1 && isNodeType(_0x2362d7, ["source-image", "image", "ai-image", "source-video", "video", "ai-video", "source-audio", "audio", "ai-audio"]) && !shouldShowGenerationBusyUi(_0x2362d7);
}
export function buildSelectedNodeRankMap(_0x5b2fb9) {
  const _0x353a47 = _0x5b2fb9 instanceof Set ? _0x5b2fb9 : _0x5b2fb9 || [];
  return new Map(Array.from(_0x353a47).map((_0x3811f8, _0x413915) => [_0x3811f8, _0x413915]));
}
export function buildRendererDragTargetSet({
  dragContext: _0x2c6e1e,
  selectedNodeSet: _0x6bb4e3,
  parentToChildren: _0x2d02ad
}) {
  if (!_0x2c6e1e?.isDragging || !_0x2c6e1e.targetNodeId) {
    return null;
  }
  const _0x4404ca = _0x6bb4e3.has(_0x2c6e1e.targetNodeId) ? Array.from(_0x6bb4e3) : [_0x2c6e1e.targetNodeId];
  const _0x5e316c = new Set(_0x4404ca);
  const _0x1d8425 = [..._0x4404ca];
  while (_0x1d8425.length > 0) {
    const _0x4a42fd = _0x1d8425.pop();
    const _0x45ed09 = _0x2d02ad?.[_0x4a42fd];
    if (!_0x45ed09) {
      continue;
    }
    for (const _0x7b8073 of _0x45ed09) {
      if (_0x5e316c.has(_0x7b8073)) {
        continue;
      }
      _0x5e316c.add(_0x7b8073);
      _0x1d8425.push(_0x7b8073);
    }
  }
  return _0x5e316c;
}
export function formatRendererNodeLabelText(_0x8b9437) {
  const _0x20a8e3 = String(_0x8b9437 || "").trim();
  if (!_0x20a8e3) {
    return "";
  }
  const _0x2638f6 = /^[\x00-\x7F]*$/.test(_0x20a8e3);
  if (_0x2638f6 && _0x20a8e3.length > 20) {
    return _0x20a8e3.slice(0, 20) + "...";
  } else {
    return _0x20a8e3;
  }
}
export function getRendererNodeLabelKind(_0x41f6cc) {
  const _0x4380cd = getRefKindByNodeType(_0x41f6cc);
  if (["text", "image", "video", "audio"].includes(_0x4380cd)) {
    return _0x4380cd;
  } else {
    return "";
  }
}
export function clearRendererNodeLabelTooltip(_0x43a6a7) {
  if (!_0x43a6a7) {
    return;
  }
  const _0x1e8d39 = (_0x48ffb1, _0x434d6b = "") => {
    if (typeof _0x43a6a7.removeAttribute === "function") {
      _0x43a6a7.removeAttribute(_0x48ffb1);
    } else if (_0x43a6a7.attributes && typeof _0x43a6a7.attributes.delete === "function") {
      _0x43a6a7.attributes.delete(_0x48ffb1);
    }
    if (_0x434d6b && _0x43a6a7.dataset && _0x434d6b in _0x43a6a7.dataset) {
      delete _0x43a6a7.dataset[_0x434d6b];
    }
  };
  _0x1e8d39("title");
  if ("title" in _0x43a6a7) {
    _0x43a6a7.title = "";
  }
  _0x1e8d39("data-tooltip", "tooltip");
  _0x1e8d39("data-tooltip-right", "tooltipRight");
  _0x1e8d39("data-tooltip-source", "tooltipSource");
  _0x1e8d39("data-native-title", "nativeTitle");
}
export function setRendererNodeLabelContent(_0x398348, {
  labelKind: _0x41bf57,
  displayLabelText: _0x3ab805,
  defaultName: _0x1e7452,
  isBeta: _0xc1c45d,
  fullLabelText: _0x11307f
}, _0xe0c6da = globalThis.document) {
  if (!_0x398348) {
    return;
  }
  clearRendererNodeLabelTooltip(_0x398348);
  const _0x79fdca = [];
  if (_0x41bf57) {
    const _0x239270 = _0xe0c6da.createElement("span");
    _0x239270.className = "node-label-icon";
    _0x239270.setAttribute("aria-hidden", "true");
    _0x239270.dataset.labelKind = _0x41bf57;
    _0x239270.textContent = _0x41bf57 === "text" ? "T" : "";
    _0x79fdca.push(_0x239270);
  }
  const _0x4e3279 = _0xe0c6da.createElement("span");
  _0x4e3279.className = "node-label-text";
  _0x4e3279.textContent = _0x3ab805 || _0x1e7452;
  _0x79fdca.push(_0x4e3279);
  if (_0xc1c45d) {
    const _0x370aef = _0xe0c6da.createElement("span");
    _0x370aef.className = "v2-node-beta-pill";
    _0x370aef.textContent = "Beta";
    _0x79fdca.push(_0x370aef);
    _0x398348.dataset.betaLabel = _0x11307f;
  } else if ("betaLabel" in _0x398348.dataset) {
    delete _0x398348.dataset.betaLabel;
  }
  _0x398348.replaceChildren(..._0x79fdca);
}
function getDreaminaTimerPhaseTitle(_0xf9e587) {
  if (!_0xf9e587 || !isNodeType(_0xf9e587, "ai-video")) {
    return "";
  }
  const _0x2d520e = resolveModelProvider(_0xf9e587.model, _0xf9e587.provider, {
    allowPrefixInference: false
  }) === "dreamina";
  if (!_0x2d520e) {
    return "";
  }
  const _0x37e7c9 = String(_0xf9e587.dreaminaTaskPhase || "").trim().toLowerCase();
  const _0x4dea0c = String(_0xf9e587.dreaminaTaskStatus || "").trim().toLowerCase();
  if (_0x37e7c9 === "failed" || _0x4dea0c === "failed") {
    return t("coreUi.renderer.dreaminaPhase.failed");
  }
  if (_0x37e7c9 === "syncing") {
    return t("coreUi.renderer.dreaminaPhase.syncing");
  }
  if (_0x37e7c9 === "queued") {
    return t("coreUi.renderer.dreaminaPhase.queued");
  }
  if (_0x37e7c9 === "generating") {
    return t("coreUi.renderer.dreaminaPhase.generating");
  }
  if (_0x37e7c9 === "done") {
    return t("coreUi.renderer.dreaminaPhase.done");
  }
  return String(_0xf9e587.dreaminaTaskLabel || "").trim();
}
export function formatRendererNodeTimerText(_0x526503, _0x5d12a3) {
  const _0x532d7c = Math.max(0, Number(_0x5d12a3) || 0);
  const _0xdadfba = Math.floor(_0x532d7c / 1000);
  const _0x16932a = Math.floor(_0x532d7c % 1000 / 100);
  const _0x978acc = _0xdadfba + "." + _0x16932a + "s";
  const _0xf7564f = getDreaminaTimerPhaseTitle(_0x526503);
  if (_0xf7564f) {
    return _0xf7564f + " · " + _0x978acc;
  } else {
    return _0x978acc;
  }
}
export function formatVideoMetaText({
  fps: _0x12a72e,
  frames: _0x35fb45,
  width: _0x5d3cd1,
  height: _0x58e0fb
} = {}) {
  const _0x285601 = Number(_0x12a72e);
  const _0x554668 = Number(_0x35fb45);
  if (!Number.isFinite(_0x285601) || _0x285601 <= 0 || !Number.isFinite(_0x554668) || _0x554668 <= 0) {
    return "";
  }
  const _0x1d7ee1 = Math.abs(_0x285601 - Math.round(_0x285601)) < 0.01 ? String(Math.round(_0x285601)) : String(Number(_0x285601.toFixed(2)));
  const _0x57cb2b = Number(_0x5d3cd1);
  const _0x3e8d98 = Number(_0x58e0fb);
  const _0x420dc9 = Number.isFinite(_0x57cb2b) && _0x57cb2b > 0 && Number.isFinite(_0x3e8d98) && _0x3e8d98 > 0;
  const _0x4e08da = t("coreUi.renderer.videoMeta.framesFps", {
    frames: Math.round(_0x554668),
    fps: _0x1d7ee1
  });
  if (_0x420dc9) {
    return Math.round(_0x57cb2b) + "×" + Math.round(_0x3e8d98) + " · " + _0x4e08da;
  } else {
    return _0x4e08da;
  }
}
export function getRendererGroupColorWithOpacity(_0x146711, _0x48ac3a) {
  const _0x38a793 = String(_0x146711 || "").match(/var\(--([^)]+)\)/);
  if (_0x38a793) {
    return "var(--" + _0x38a793[1] + "-" + _0x48ac3a + ")";
  } else {
    return _0x146711;
  }
}