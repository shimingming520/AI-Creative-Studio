import { createReferenceMaskBadgeHtml, getReferenceMaskSignaturePart } from "../../modules/refThumbMaskBadge.js";
import { bindRefThumbFixedSlotDrag, bindRefThumbOrderDrag } from "../../modules/refThumbDragController.js";
import { buildFixedInputAssetSlotMap, getFixedInputSlotConfigFromManifest, resolveFixedInputSlotForRef, shouldHideFixedInputSlots } from "../../modules/fixedInputAssetRefs.js";
import { getAssetInputRefsFromPrompt, getAssetInputRefsFromPromptAndNode } from "../../modules/nodePromptShared.js";
import { getGenerationRatioSizeWithDom } from "../../modules/generationRatioSource.js";
import { resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { createReferenceInputThumbnailHtml, resolveReferenceVideoItemByEdge as a572_0x37b0db, resolveReferenceVideoMediaSignature as a572_0x352e77, resolveReferenceVideoSourcePath as a572_0x2d3576, resolveReferenceVideoThumbnail as a572_0x2b8ef4 } from "../../modules/referenceInputThumbnail.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { resolveCanvasImageLowZoomUrl } from "../../services/canvasMediaLocalService.js";
import { createPromptAttachmentButtonHTML } from "../refAttachmentButton.js";
import { formatInputSlotLabelHtml } from "../shared/inputSlotLabelFormatter.js";
import { renderVideoFixedInputSlotsMarkup } from "./promptInputSurface.js";
import { t } from "../../i18n/index.js";
const RH_V54_FPS_OPTIONS = Object.freeze([16, 24, 30]);
const RH_MIN_VIDEO_RESOLUTION = 832;
function referenceInputText(_0x46575f, _0x373fb1 = {}) {
  return t("videoNode.referenceInput." + _0x46575f, _0x373fb1);
}
function normalizeRhV54Fps(_0xc779f9) {
  const _0x457191 = Number(_0xc779f9);
  if (RH_V54_FPS_OPTIONS.includes(_0x457191)) {
    return _0x457191;
  } else {
    return 24;
  }
}
function normalizeRhVideoResolution(_0xa2d0ed) {
  const _0x5be20a = Number(_0xa2d0ed);
  if (Number.isFinite(_0x5be20a)) {
    return Math.max(RH_MIN_VIDEO_RESOLUTION, Math.trunc(_0x5be20a));
  } else {
    return RH_MIN_VIDEO_RESOLUTION;
  }
}
function normalizeVideoMediaKey(_0x151d7f) {
  return String(_0x151d7f || "").trim().replace(/^\/+/, "");
}
function normalizeRefSignaturePart(_0x5b717b) {
  return String(_0x5b717b || "").trim();
}
function getFixedRefBarLayoutKey(_0x29d0e5) {
  if (!_0x29d0e5) {
    return "generic";
  }
  return "fixed";
}
function getRefSourceDisplayStateKey(_0x2189ab, _0x419a7e) {
  const _0x15fa2e = String(_0x2189ab?.type || "");
  const _0x17de95 = getReferenceMaskSignaturePart(_0x2189ab);
  const _0x48e5c6 = normalizeRefSignaturePart(_0x2189ab?.outputText || _0x2189ab?.text || _0x2189ab?.content || "");
  if (_0x15fa2e.includes("text")) {
    return "t:" + _0x48e5c6;
  }
  if (_0x15fa2e.includes("video")) {
    const _0xee7d32 = a572_0x37b0db(_0x2189ab, _0x419a7e);
    const _0x334633 = a572_0x2b8ef4(_0x2189ab, _0x419a7e);
    const _0x5e56f6 = String(_0x2189ab?.type || "") === "ai-video" ? normalizeVideoMediaKey(_0xee7d32.item?.videoThumbUnavailableSource || _0x2189ab?.videoThumbUnavailableSource) : normalizeVideoMediaKey(_0x2189ab?.videoThumbUnavailableSource);
    return ["v", _0xee7d32.index, normalizeVideoMediaKey(_0x419a7e?.sourceMediaKey), normalizeVideoMediaKey(_0x334633.thumbUrl), normalizeVideoMediaKey(_0x2189ab?.imageUrl), a572_0x352e77(_0x2189ab, _0x419a7e), _0x5e56f6].join(":");
  }
  if (_0x15fa2e.includes("audio")) {
    return ["a", normalizeRefSignaturePart(_0x2189ab?.audioUrl), normalizeRefSignaturePart(_0x2189ab?.src), normalizeRefSignaturePart(_0x2189ab?.localPath)].join(":");
  }
  return ["i", normalizeRefSignaturePart(_0x2189ab?.thumbId), normalizeRefSignaturePart(_0x2189ab?.thumbUrl), normalizeRefSignaturePart(_0x2189ab?.imageUrl), normalizeRefSignaturePart(_0x2189ab?.src), normalizeRefSignaturePart(_0x2189ab?.localPath), _0x17de95].join(":");
}
function pickPositiveNumber(..._0x506a1e) {
  for (const _0x20e16c of _0x506a1e) {
    const _0x26e4f7 = Number(_0x20e16c);
    if (Number.isFinite(_0x26e4f7) && _0x26e4f7 > 0) {
      return _0x26e4f7;
    }
  }
  return 0;
}
function getSourceVideoFrameCount(_0x1dade6, _0x2fb72a) {
  const _0xb26ccb = a572_0x37b0db(_0x1dade6, _0x2fb72a).item;
  const _0x252b53 = pickPositiveNumber(_0xb26ccb?.videoFrameCount, _0xb26ccb?.frameCount, _0x1dade6?.videoFrameCount, _0x1dade6?.frameCount);
  if (_0x252b53 > 0) {
    return Math.round(_0x252b53);
  } else {
    return 0;
  }
}
function getSourceVideoDuration(_0x3fef6e, _0x14a58d) {
  const _0x54e68e = a572_0x37b0db(_0x3fef6e, _0x14a58d).item;
  return pickPositiveNumber(_0x54e68e?.videoDuration, _0x54e68e?.duration, _0x3fef6e?.videoDuration, _0x3fef6e?.duration);
}
function getRhV5SourceVideoNode({
  inEdges = [],
  nodes = {},
  promptEl = null,
  nodeData = null
}) {
  const _0x531982 = Array.isArray(inEdges) ? inEdges : [];
  let _0x173070 = _0x531982.find(_0x397750 => String(_0x397750?.refSlot || "") === "sourceVideo") || null;
  if (!_0x173070) {
    _0x173070 = _0x531982.find(_0x5c8488 => String(nodes?.[_0x5c8488?.sourceId]?.type || "").includes("video")) || null;
  }
  if (_0x173070 && nodes?.[_0x173070.sourceId]) {
    return {
      node: nodes[_0x173070.sourceId],
      edge: _0x173070
    };
  }
  const _0x586710 = getAssetInputRefsFromPromptAndNode(promptEl, {
    nodeData: nodeData,
    allowedTypes: ["video"]
  })[0];
  if (_0x586710?.nodeData) {
    return {
      node: _0x586710.nodeData,
      edge: null
    };
  } else {
    return {
      node: null,
      edge: null
    };
  }
}
function getRhV5SourceVideoFrameCount({
  inEdges = [],
  nodes = {},
  promptEl = null,
  nodeData = null,
  targetFps = 0
} = {}) {
  const {
    node: _0xa83baf,
    edge: _0x2f95e6
  } = getRhV5SourceVideoNode({
    inEdges: inEdges,
    nodes: nodes,
    promptEl: promptEl,
    nodeData: nodeData
  });
  if (!_0xa83baf) {
    return null;
  }
  const _0x47627a = getSourceVideoFrameCount(_0xa83baf, _0x2f95e6);
  if (_0x47627a > 0) {
    return _0x47627a;
  }
  const _0x2146e7 = Number(targetFps);
  if (!Number.isFinite(_0x2146e7) || _0x2146e7 <= 0) {
    return null;
  }
  let _0x3c266f = getSourceVideoDuration(_0xa83baf, _0x2f95e6);
  if (!(_0x3c266f > 0)) {
    const _0x493c09 = a572_0x37b0db(_0xa83baf, _0x2f95e6).item;
    const _0x363f03 = pickPositiveNumber(_0x493c09?.videoFrameCount, _0x493c09?.frameCount, _0xa83baf?.videoFrameCount, _0xa83baf?.frameCount);
    const _0x5405c5 = pickPositiveNumber(_0x493c09?.videoFps, _0x493c09?.fps, _0xa83baf?.videoFps, _0xa83baf?.fps);
    if (_0x363f03 > 0 && _0x5405c5 > 0) {
      _0x3c266f = _0x363f03 / _0x5405c5;
    }
  }
  if (_0x3c266f > 0) {
    return Math.round(_0x3c266f * _0x2146e7);
  } else {
    return null;
  }
}
function createRunningHubAudioFallbackThumbHtml() {
  return createReferenceInputThumbnailHtml({
    kind: "audio",
    additionalClassName: "rh-v5-ref-media-fallback"
  });
}
const FIXED_REF_KIND_LABEL_KEYS = Object.freeze({
  text: "kind.text",
  image: "kind.image",
  video: "kind.video",
  audio: "kind.audio"
});
const FIXED_REF_SLOT_FALLBACK_LABEL_KEYS = Object.freeze({
  sourceVideo: "slots.sourceVideo",
  refImage: "slots.refImage",
  firstFrame: "slots.firstFrame",
  videoMask: "slots.videoMask",
  maskImage: "slots.maskImage",
  audio: "slots.audio"
});
function escapeHtmlText(_0x490fd6) {
  return String(_0x490fd6 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtmlAttr(_0x1c4d5f) {
  return escapeHtmlText(_0x1c4d5f).replace(/"/g, "&quot;");
}
function getFixedRefKindLabel(_0x223686) {
  const _0x70824a = FIXED_REF_KIND_LABEL_KEYS[String(_0x223686 || "")];
  if (_0x70824a) {
    return referenceInputText(_0x70824a);
  } else {
    return "";
  }
}
function getFixedRefSlotFallbackLabel(_0x11aa84) {
  const _0x36b99a = FIXED_REF_SLOT_FALLBACK_LABEL_KEYS[String(_0x11aa84 || "")];
  if (_0x36b99a) {
    return referenceInputText(_0x36b99a);
  } else {
    return "";
  }
}
function createRefThumbDeleteButtonHtml() {
  return "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + escapeHtmlAttr(referenceInputText("removeReference")) + "\">&times;</button>";
}
function getFixedSlotLabelText(_0x34371b, _0x3a9214) {
  const _0x25e0fb = String(_0x3a9214 || "").trim();
  const _0x394df0 = _0x34371b?.slotById?.[_0x25e0fb] || null;
  return String(_0x394df0?.label || "").trim() || getFixedRefSlotFallbackLabel(_0x25e0fb) || getFixedRefKindLabel(_0x34371b?.slotKindById?.[_0x25e0fb]) || _0x25e0fb;
}
function getFixedSlotLabelHtml(_0x4d5dd6, _0x1df8e5) {
  return formatInputSlotLabelHtml(getFixedSlotLabelText(_0x4d5dd6, _0x1df8e5));
}
function getFixedSlotAcceptMap(_0x18e3c6) {
  const _0x103ec2 = {};
  (_0x18e3c6?.visibleSlots || []).forEach(_0x585606 => {
    const _0x14522d = String(_0x18e3c6?.slotKindById?.[_0x585606] || "").trim();
    if (_0x585606 && _0x14522d) {
      _0x103ec2[_0x585606] = _0x14522d;
    }
  });
  return _0x103ec2;
}
function normalizeDisplayRatioSource(_0x2a9d9c) {
  if (!_0x2a9d9c || typeof _0x2a9d9c !== "object" || Array.isArray(_0x2a9d9c)) {
    return null;
  }
  const _0x1601de = Array.from(new Set([String(_0x2a9d9c.slot || _0x2a9d9c.refSlot || "").trim(), ...(Array.isArray(_0x2a9d9c.slots) ? _0x2a9d9c.slots : [])].map(_0x23d276 => String(_0x23d276 || "").trim()).filter(Boolean)));
  const _0xd9eb2 = String(_0x2a9d9c.kind || "").trim();
  const _0x578417 = Number(_0x2a9d9c.fallbackIndex ?? _0x2a9d9c.inputIndex ?? _0x2a9d9c.index);
  const _0x96cb06 = Number.isFinite(_0x578417) && _0x578417 >= 0 ? Math.trunc(_0x578417) : null;
  if (_0x1601de.length === 0 && _0x96cb06 === null) {
    return null;
  }
  return {
    ...(_0x1601de.length ? {
      slot: _0x1601de[0],
      slots: _0x1601de
    } : {}),
    ...(_0xd9eb2 ? {
      kind: _0xd9eb2
    } : {}),
    ...(_0x96cb06 !== null ? {
      fallbackIndex: _0x96cb06
    } : {})
  };
}
function resolveConfiguredDisplayRatioSlot(_0x13e9d2, _0x5f427d = {}) {
  const _0x3708d3 = normalizeDisplayRatioSource(_0x13e9d2?.manifest?.inputSlots?.displayAspectRatioSource);
  if (!_0x3708d3) {
    return null;
  }
  const _0x4bb3be = Array.isArray(_0x3708d3.slots) ? _0x3708d3.slots : _0x3708d3.slot ? [_0x3708d3.slot] : [];
  for (const _0x438ae8 of _0x4bb3be) {
    if (!_0x5f427d?.[_0x438ae8]) {
      continue;
    }
    if (_0x3708d3.kind && String(_0x13e9d2?.slotKindById?.[_0x438ae8] || "") !== _0x3708d3.kind) {
      continue;
    }
    return {
      slot: _0x438ae8,
      mode: "configured"
    };
  }
  const _0x1189e5 = Array.isArray(_0x13e9d2?.visibleSlots) ? _0x13e9d2.visibleSlots : [];
  const _0x459775 = _0x1189e5.filter(_0x36cc98 => {
    const _0xd80a84 = _0x5f427d?.[_0x36cc98];
    if (!_0xd80a84) {
      return false;
    }
    if (!_0x3708d3.kind) {
      return true;
    }
    return String(_0x13e9d2?.slotKindById?.[_0x36cc98] || "") === _0x3708d3.kind;
  });
  const _0x139a60 = _0x3708d3.fallbackIndex;
  if (Number.isInteger(_0x139a60) && _0x139a60 >= 0 && _0x139a60 < _0x459775.length) {
    return {
      slot: _0x459775[_0x139a60],
      mode: "configured"
    };
  }
  return null;
}
function resolveLegacySingleReferenceVideoSlot(_0x387eda, _0x5bfa29 = {}) {
  const _0x28bab0 = _0x387eda?.visibleSlots || [];
  const _0x1ad9c4 = _0x28bab0.length === 2 && _0x28bab0[0] === "sourceVideo" && _0x28bab0[1] === "refImage" && (_0x387eda?.fixedSlots || []).length === 2;
  if (!_0x1ad9c4 || !_0x5bfa29?.sourceVideo) {
    return null;
  }
  return {
    slot: "sourceVideo",
    mode: "sourceVideoFrames"
  };
}
function resolveFixedInputDisplayRatioSlot(_0x3d0744, _0xdc2402 = {}) {
  return resolveConfiguredDisplayRatioSlot(_0x3d0744, _0xdc2402) || resolveLegacySingleReferenceVideoSlot(_0x3d0744, _0xdc2402);
}
function getFixedInputRatioMediaSize(_0x35032d, _0x197aca = {}) {
  if (!_0x35032d) {
    return null;
  }
  const _0x9c83dc = String(_0x35032d.kind || _0x35032d.refType || "").trim();
  const _0x2722df = _0x35032d.node || _0x35032d.ref?.nodeData || _0x197aca?.[_0x35032d.sourceId];
  if (!_0x2722df) {
    return null;
  }
  const _0x529f59 = _0x9c83dc === "video" ? "video" : _0x9c83dc === "image" ? "img" : "img, video";
  return getGenerationRatioSizeWithDom({
    nodeId: _0x35032d.sourceId,
    nodeData: _0x2722df,
    edge: _0x35032d.edge || null,
    mediaSelector: _0x529f59,
    includeNodeFrame: true
  });
}
function calcFixedInputDisplaySize(_0x49a117, _0x54f4bd, _0x20de92 = 300) {
  const _0x6c285f = Number(_0x49a117);
  const _0x1cce69 = Number(_0x54f4bd);
  if (!Number.isFinite(_0x6c285f) || !(_0x6c285f > 0)) {
    return null;
  }
  if (!Number.isFinite(_0x1cce69) || !(_0x1cce69 > 0)) {
    return null;
  }
  const _0x467849 = Math.max(1, Math.round(Number(_0x20de92) || 300));
  if (_0x6c285f >= _0x1cce69) {
    return {
      width: Math.round(_0x6c285f / _0x1cce69 * _0x467849),
      height: _0x467849
    };
  }
  return {
    width: _0x467849,
    height: Math.round(_0x1cce69 / _0x6c285f * _0x467849)
  };
}
export const __videoReferenceInputTest = {
  getVideoThumbCandidate: a572_0x2b8ef4,
  getVideoSourcePathForThumb: a572_0x2d3576,
  getVideoRefMediaSignature: a572_0x352e77,
  getRefSourceDisplayStateKey: getRefSourceDisplayStateKey,
  getRhV5SourceVideoFrameCount: getRhV5SourceVideoFrameCount,
  createRunningHubAudioFallbackThumbHtml: createRunningHubAudioFallbackThumbHtml,
  getFixedSlotLabelHtml: getFixedSlotLabelHtml,
  calcFixedInputDisplaySize: calcFixedInputDisplaySize
};
export function createVideoNodeReferenceInputModule(_0x3c792c) {
  const {
    store: _0x20bb2f,
    api: _0x22a2f2,
    _syncPillLabels: _0x3fe325,
    getImage: _0x52e1c4,
    ensureThumbDecoded: _0x488192,
    revealRefThumbMedia: _0x30ed95
  } = _0x3c792c;
  class _0x3095e5 {
    _getRefSourceStateKey(_0x426170, _0x1dc898) {
      return getRefSourceDisplayStateKey(_0x426170, _0x1dc898);
    }
    _getRhV5SourceVideoFrameCount(_0x16c1c8) {
      const _0x55dfe9 = _0x20bb2f.getIncomingEdges(this.nodeId) || [];
      const _0x2f952c = typeof _0x20bb2f.getStateRaw === "function" ? _0x20bb2f.getStateRaw() : _0x20bb2f.getState() || {};
      const _0x1cdbfb = _0x2f952c.nodes || {};
      return getRhV5SourceVideoFrameCount({
        inEdges: _0x55dfe9,
        nodes: _0x1cdbfb,
        promptEl: this.promptEl,
        nodeData: _0x1cdbfb?.[this.nodeId] || this._data || null,
        targetFps: _0x16c1c8
      });
    }
    _createAssetRefThumbData(_0x3c66ef, {
      slot = "",
      key = ""
    } = {}) {
      const _0x3e79d2 = String(_0x3c66ef?.type || "").trim();
      if (!_0x3e79d2) {
        return null;
      }
      let _0xc4a97b = "";
      let _0x5383dd = "";
      if (_0x3e79d2 === "image") {
        const _0x541596 = this._resolveMediaUrl(_0x3c66ef.thumbUrl || _0x3c66ef.url || "");
        if (!_0x541596) {
          return null;
        }
        _0x488192(_0x541596);
        _0xc4a97b = createReferenceInputThumbnailHtml({
          kind: "image",
          thumbnailUrl: _0x541596
        });
        _0x5383dd = "asset-i|" + _0x541596;
      } else if (_0x3e79d2 === "video") {
        const _0x4031cb = this._resolveMediaUrl(_0x3c66ef.thumbUrl || "");
        if (_0x4031cb) {
          _0x488192(_0x4031cb);
          _0xc4a97b = createReferenceInputThumbnailHtml({
            kind: "video",
            thumbnailUrl: _0x4031cb
          });
          _0x5383dd = "asset-v|" + _0x4031cb;
        } else {
          _0xc4a97b = createReferenceInputThumbnailHtml({
            kind: "video"
          });
          _0x5383dd = "asset-v|fallback";
        }
      } else if (_0x3e79d2 === "audio") {
        _0xc4a97b = createReferenceInputThumbnailHtml({
          kind: "audio"
        });
        _0x5383dd = "asset-a|fallback";
      } else if (_0x3e79d2 === "text") {
        _0xc4a97b = createReferenceInputThumbnailHtml({
          kind: "text"
        });
        _0x5383dd = "asset-t|" + String(_0x3c66ef.content || _0x3c66ef.label || "").trim();
      } else {
        return null;
      }
      const _0x302151 = String(_0x3c66ef.assetId || "");
      const _0x39d5b5 = String(_0x3c66ef.itemIndex ?? "");
      const _0x3539e3 = String(_0x3c66ef.assetMentionOccurrence ?? "");
      const _0x5a7b8c = String(_0x3c66ef.assetRefSource || "prompt");
      const _0x558840 = "asset:" + _0x302151 + ":" + _0x39d5b5;
      return {
        key: key || "asset:" + _0x5a7b8c + ":" + _0x302151 + ":" + _0x39d5b5 + ":" + _0x3e79d2 + ":" + _0x3539e3,
        edgeId: "",
        kind: _0x3e79d2,
        sourceId: _0x558840,
        assetId: _0x302151,
        assetIndex: _0x39d5b5,
        assetOccurrence: _0x3539e3,
        assetRefSource: _0x5a7b8c,
        refType: _0x3e79d2,
        node: _0x3c66ef.nodeData || null,
        ref: _0x3c66ef,
        html: _0xc4a97b,
        thumbHTML: _0xc4a97b,
        sig: "" + (slot ? slot + "|" : "") + _0x558840 + "|" + _0x3e79d2 + "|" + String(_0x3c66ef.url || "") + "|" + _0x5383dd,
        virtual: true
      };
    }
    _createTextEdgeRefThumbData(_0x43e7bc, _0x3055ba) {
      const _0x5ba64d = String(_0x3055ba?.outputText || _0x3055ba?.text || _0x3055ba?.content || _0x3055ba?.prompt || "").trim();
      if (!_0x5ba64d) {
        return null;
      }
      return {
        key: "edge:" + _0x43e7bc.id,
        edgeId: _0x43e7bc.id,
        kind: "text",
        sourceId: _0x43e7bc.sourceId,
        html: createReferenceInputThumbnailHtml({
          kind: "text"
        }),
        sig: "text|" + _0x43e7bc.id + "|" + _0x43e7bc.sourceId + "|" + _0x5ba64d
      };
    }
    _syncFixedTrailingRefItems(_0x18a8c5, _0x2918e4 = []) {
      if (!_0x18a8c5) {
        return;
      }
      const _0x41b7e2 = new Map();
      _0x18a8c5.querySelectorAll(".rh-fixed-extra-ref").forEach(_0x509cb0 => _0x41b7e2.set(_0x509cb0.dataset.refKey, _0x509cb0));
      const _0x250861 = new Set();
      (Array.isArray(_0x2918e4) ? _0x2918e4 : []).forEach(_0x27f899 => {
        if (!_0x27f899?.key) {
          return;
        }
        let _0x1938f0 = _0x41b7e2.get(_0x27f899.key);
        if (!_0x1938f0) {
          _0x1938f0 = document.createElement("div");
          _0x1938f0.className = "ref-thumb-wrap rh-v5-ref-box rh-fixed-extra-ref" + (_0x27f899.virtual ? " ref-thumb-wrap--asset" : "");
        }
        _0x1938f0.setAttribute("draggable", _0x27f899.virtual || !_0x27f899.edgeId ? "false" : "true");
        if (_0x1938f0.dataset.sig !== _0x27f899.sig) {
          _0x1938f0.innerHTML = "" + _0x27f899.html + createRefThumbDeleteButtonHtml();
          _0x1938f0.dataset.sig = _0x27f899.sig;
          _0x30ed95(_0x1938f0, _0x27f899.sig);
        }
        _0x1938f0.dataset.refKey = _0x27f899.key;
        _0x1938f0.dataset.edgeId = _0x27f899.edgeId || "";
        _0x1938f0.dataset.kind = _0x27f899.kind || "";
        _0x1938f0.dataset.sourceId = _0x27f899.sourceId || "";
        _0x1938f0.dataset.refOrigin = _0x27f899.virtual ? "asset" : "node";
        if (_0x27f899.virtual) {
          _0x1938f0.dataset.assetId = _0x27f899.assetId || "";
          _0x1938f0.dataset.assetIndex = _0x27f899.assetIndex || "";
          _0x1938f0.dataset.assetOccurrence = _0x27f899.assetOccurrence || "";
          _0x1938f0.dataset.assetRefSource = _0x27f899.assetRefSource || "prompt";
          _0x1938f0.dataset.refType = _0x27f899.refType || _0x27f899.kind || "";
        } else {
          delete _0x1938f0.dataset.assetId;
          delete _0x1938f0.dataset.assetIndex;
          delete _0x1938f0.dataset.assetOccurrence;
          delete _0x1938f0.dataset.assetRefSource;
          delete _0x1938f0.dataset.refType;
        }
        _0x18a8c5.appendChild(_0x1938f0);
        _0x250861.add(_0x27f899.key);
      });
      for (const [_0x4e76f3, _0x9027e5] of _0x41b7e2.entries()) {
        if (!_0x250861.has(_0x4e76f3)) {
          _0x9027e5.remove();
        }
      }
    }
    _getFixedSlotRefThumbObjectUrlMap() {
      if (!this._fixedSlotRefThumbObjectUrls) {
        this._fixedSlotRefThumbObjectUrls = new Map();
      }
      return this._fixedSlotRefThumbObjectUrls;
    }
    _clearObjectUrlMap(_0x20d409) {
      if (!_0x20d409 || _0x20d409.size === 0) {
        return;
      }
      for (const _0x115501 of _0x20d409.values()) {
        if (_0x115501 && String(_0x115501).startsWith("blob:")) {
          URL.revokeObjectURL(_0x115501);
        }
      }
      _0x20d409.clear();
    }
    _pruneFixedSlotRefThumbObjectUrls(_0x1a5e8b = [], _0x1f524d = {}) {
      const _0x4a9276 = this._getFixedSlotRefThumbObjectUrlMap();
      const _0x366419 = new Set();
      for (const _0x5163e8 of _0x1a5e8b || []) {
        const _0x50e9f4 = _0x1f524d?.[_0x5163e8?.sourceId];
        if (_0x50e9f4?.thumbId) {
          _0x366419.add(_0x50e9f4.thumbId);
        }
      }
      for (const [_0x3380ae, _0x5ca7b6] of _0x4a9276.entries()) {
        if (_0x366419.has(_0x3380ae)) {
          continue;
        }
        if (_0x5ca7b6 && String(_0x5ca7b6).startsWith("blob:")) {
          URL.revokeObjectURL(_0x5ca7b6);
        }
        _0x4a9276.delete(_0x3380ae);
      }
    }
    _resolveFixedMediaUrl(_0x2166cf) {
      const _0x42aff7 = String(_0x2166cf || "").trim();
      if (!_0x42aff7) {
        return "";
      }
      if (typeof this._resolveMediaUrl === "function") {
        return this._resolveMediaUrl(_0x42aff7);
      }
      return _0x42aff7;
    }
    _resolveFixedThumbObjectUrl(_0x151f03) {
      const _0x3cbe96 = String(_0x151f03 || "").trim();
      if (!_0x3cbe96) {
        return "";
      }
      const _0x4d7630 = this._getFixedSlotRefThumbObjectUrlMap();
      if (_0x4d7630.has(_0x3cbe96)) {
        return _0x4d7630.get(_0x3cbe96);
      }
      this._scheduleFixedThumbObjectUrl(_0x3cbe96);
      return "";
    }
    _scheduleFixedThumbObjectUrl(_0x4b2dec, _0x57dc20 = this._getFixedSlotRefThumbObjectUrlMap()) {
      const _0x179745 = String(_0x4b2dec || "").trim();
      if (!_0x179745) {
        return;
      }
      if (_0x57dc20.has(_0x179745)) {
        return;
      }
      if (!this._fixedRefThumbObjectUrlLoads) {
        this._fixedRefThumbObjectUrlLoads = new Map();
      }
      const _0x376ea1 = _0x57dc20 === this._refThumbObjectUrls ? "generic:" + _0x179745 : "fixed:" + _0x179745;
      if (this._fixedRefThumbObjectUrlLoads.has(_0x376ea1)) {
        return;
      }
      let _0x3e25e6 = false;
      const _0x190cb0 = Promise.resolve().then(() => _0x52e1c4(_0x179745)).then(_0x5139fd => {
        if (!_0x5139fd || _0x57dc20.has(_0x179745)) {
          return;
        }
        _0x57dc20.set(_0x179745, URL.createObjectURL(_0x5139fd));
        _0x3e25e6 = true;
      }).catch(() => {}).finally(() => {
        this._fixedRefThumbObjectUrlLoads.delete(_0x376ea1);
        if (_0x3e25e6 && this.refBarEl) {
          this._renderRefBar();
        }
      });
      this._fixedRefThumbObjectUrlLoads.set(_0x376ea1, _0x190cb0);
    }
    _createFixedEdgeRefThumbData(_0x1d5764, _0x574617, _0x49ce86, _0x37c8b7) {
      const _0x2adcb5 = String(_0x49ce86 || "").trim();
      if (!_0x1d5764 || !_0x574617 || !_0x2adcb5) {
        return null;
      }
      if (_0x2adcb5 === "text") {
        return this._createTextEdgeRefThumbData(_0x1d5764, _0x574617);
      }
      let _0x88121a = "";
      let _0x3b1130 = "";
      if (_0x2adcb5 === "image") {
        let _0x3ef610 = this._resolveFixedMediaUrl(resolveCanvasImageLowZoomUrl(_0x574617));
        if (!_0x3ef610) {
          _0x3ef610 = this._resolveFixedThumbObjectUrl(_0x574617.thumbId);
        }
        if (!_0x3ef610 && _0x574617.localPath) {
          _0x3ef610 = this._resolveFixedMediaUrl(localPathToUrl(_0x574617.localPath));
        }
        if (!_0x3ef610) {
          return null;
        }
        _0x488192(_0x3ef610);
        _0x88121a = createReferenceInputThumbnailHtml({
          kind: "image",
          thumbnailUrl: _0x3ef610,
          extraHtml: createReferenceMaskBadgeHtml(_0x574617)
        });
        _0x3b1130 = "i|" + _0x3ef610 + "|" + getReferenceMaskSignaturePart(_0x574617);
      } else if (_0x2adcb5 === "video") {
        const _0x367e06 = a572_0x352e77(_0x574617, _0x1d5764);
        const _0x298f53 = a572_0x2b8ef4(_0x574617, _0x1d5764);
        let _0x418cf4 = this._resolveFixedMediaUrl(_0x298f53.thumbUrl || _0x574617.imageUrl || "");
        if (!_0x418cf4) {
          _0x418cf4 = this._resolveFixedThumbObjectUrl(_0x574617.thumbId);
        }
        if (_0x418cf4) {
          _0x488192(_0x418cf4);
          _0x88121a = createReferenceInputThumbnailHtml({
            kind: "video",
            thumbnailUrl: _0x418cf4
          });
          _0x3b1130 = "v|" + (_0x367e06 || _0x418cf4);
        } else {
          _0x37c8b7?.(_0x1d5764, _0x574617);
          _0x88121a = createReferenceInputThumbnailHtml({
            kind: "video",
            additionalClassName: "rh-v5-ref-media-fallback"
          });
          _0x3b1130 = "v|" + (_0x367e06 || "fallback");
        }
      } else if (_0x2adcb5 === "audio") {
        const _0x39fb4a = String(_0x574617.localPath || _0x574617.src || _0x574617.audioUrl || "");
        if (!_0x39fb4a) {
          return null;
        }
        _0x88121a = createRunningHubAudioFallbackThumbHtml();
        _0x3b1130 = "a|" + _0x39fb4a;
      } else {
        return null;
      }
      return {
        key: "edge:" + _0x1d5764.id,
        edgeId: _0x1d5764.id,
        kind: _0x2adcb5,
        sourceId: _0x1d5764.sourceId,
        node: _0x574617,
        edge: _0x1d5764,
        html: _0x88121a,
        thumbHTML: _0x88121a,
        sig: _0x1d5764.id + "|" + _0x1d5764.sourceId + "|" + _0x3b1130
      };
    }
    _syncFixedSlotEl(_0x3105d5, _0x38a7ea, _0x4d6969, _0x21b3b2) {
      if (!_0x3105d5 || !_0x38a7ea) {
        return;
      }
      const _0x5835a0 = String(_0x21b3b2?.slotKindById?.[_0x38a7ea] || "").trim();
      const _0x4d96b6 = _0x3105d5.querySelector("[data-slot=\"" + _0x38a7ea + "\"]");
      if (!_0x4d6969) {
        let _0x15e50a = _0x4d96b6 && _0x4d96b6.classList?.contains("ref-upload-slot") ? _0x4d96b6 : document.createElement("button");
        _0x15e50a.className = "ref-thumb-wrap ref-upload-slot rh-v5-ref-box";
        _0x15e50a.type = "button";
        _0x15e50a.setAttribute("draggable", "false");
        _0x15e50a.setAttribute("title", getFixedSlotLabelText(_0x21b3b2, _0x38a7ea));
        _0x15e50a.dataset.slot = _0x38a7ea;
        _0x15e50a.dataset.kind = _0x5835a0;
        _0x15e50a.dataset.edgeId = "";
        _0x15e50a.dataset.sourceId = "";
        _0x15e50a.dataset.refOrigin = "";
        delete _0x15e50a.dataset.refKey;
        delete _0x15e50a.dataset.assetId;
        delete _0x15e50a.dataset.assetIndex;
        delete _0x15e50a.dataset.assetOccurrence;
        delete _0x15e50a.dataset.assetRefSource;
        delete _0x15e50a.dataset.refType;
        const _0x5eb528 = getFixedSlotLabelHtml(_0x21b3b2, _0x38a7ea);
        const _0x4ff94b = "empty|" + _0x38a7ea + "|" + _0x5835a0 + "|" + _0x5eb528;
        if (_0x15e50a.dataset.sig !== _0x4ff94b) {
          _0x15e50a.innerHTML = "<span class=\"ref-upload-label\">" + _0x5eb528 + "</span>";
          _0x15e50a.dataset.sig = _0x4ff94b;
        }
        if (_0x4d96b6 && _0x4d96b6 !== _0x15e50a) {
          _0x4d96b6.replaceWith(_0x15e50a);
        } else if (!_0x4d96b6) {
          _0x3105d5.appendChild(_0x15e50a);
        }
        return;
      }
      let _0x5e10ba = _0x4d96b6 && !_0x4d96b6.classList?.contains("ref-upload-slot") ? _0x4d96b6 : document.createElement("div");
      _0x5e10ba.className = "ref-thumb-wrap rh-v5-ref-box" + (_0x4d6969.virtual ? " ref-thumb-wrap--asset" : "");
      _0x5e10ba.setAttribute("draggable", _0x4d6969.virtual || !_0x4d6969.edgeId ? "false" : "true");
      const _0xc341ec = _0x38a7ea + "|" + (_0x4d6969.sig || "");
      if (_0x5e10ba.dataset.sig !== _0xc341ec) {
        _0x5e10ba.innerHTML = "" + _0x4d6969.html + createRefThumbDeleteButtonHtml();
        _0x5e10ba.dataset.sig = _0xc341ec;
        _0x30ed95(_0x5e10ba, _0xc341ec);
      }
      _0x5e10ba.dataset.slot = _0x38a7ea;
      _0x5e10ba.dataset.kind = _0x4d6969.kind || _0x5835a0;
      _0x5e10ba.dataset.refKey = _0x4d6969.key || (_0x4d6969.edgeId ? "edge:" + _0x4d6969.edgeId : "");
      _0x5e10ba.dataset.edgeId = _0x4d6969.edgeId || "";
      _0x5e10ba.dataset.sourceId = _0x4d6969.sourceId || "";
      _0x5e10ba.dataset.refOrigin = _0x4d6969.virtual ? "asset" : "node";
      if (_0x4d6969.virtual) {
        _0x5e10ba.dataset.assetId = _0x4d6969.assetId || "";
        _0x5e10ba.dataset.assetIndex = _0x4d6969.assetIndex || "";
        _0x5e10ba.dataset.assetOccurrence = _0x4d6969.assetOccurrence || "";
        _0x5e10ba.dataset.assetRefSource = _0x4d6969.assetRefSource || "prompt";
        _0x5e10ba.dataset.refType = _0x4d6969.refType || _0x4d6969.kind || _0x5835a0;
      } else {
        delete _0x5e10ba.dataset.assetId;
        delete _0x5e10ba.dataset.assetIndex;
        delete _0x5e10ba.dataset.assetOccurrence;
        delete _0x5e10ba.dataset.assetRefSource;
        delete _0x5e10ba.dataset.refType;
      }
      if (_0x4d96b6 && _0x4d96b6 !== _0x5e10ba) {
        _0x4d96b6.replaceWith(_0x5e10ba);
      } else if (!_0x4d96b6) {
        _0x3105d5.appendChild(_0x5e10ba);
      }
    }
    _syncFixedSlotOrder(_0x42814e, _0x209c1a = []) {
      if (!_0x42814e) {
        return;
      }
      const _0x4f8c60 = _0x42814e.querySelector(".rh-fixed-extra-ref");
      (Array.isArray(_0x209c1a) ? _0x209c1a : []).forEach(_0x5cb86d => {
        const _0x435052 = _0x42814e.querySelector("[data-slot=\"" + _0x5cb86d + "\"]");
        if (!_0x435052) {
          return;
        }
        if (_0x4f8c60 && typeof _0x42814e.insertBefore === "function") {
          _0x42814e.insertBefore(_0x435052, _0x4f8c60);
        } else {
          _0x42814e.appendChild(_0x435052);
        }
      });
    }
    _syncSingleReferenceEditorRatio(_0x26aa34, _0x143f84, _0x107c7e = {}) {
      const _0x1a13a3 = resolveFixedInputDisplayRatioSlot(_0x26aa34, _0x143f84);
      const _0xad7d9a = _0x1a13a3?.slot || "";
      if (!_0xad7d9a || !_0x143f84?.[_0xad7d9a]) {
        return;
      }
      const _0x5b20a0 = getFixedInputRatioMediaSize(_0x143f84[_0xad7d9a], _0x107c7e);
      const _0x3d957b = calcFixedInputDisplaySize(_0x5b20a0?.width, _0x5b20a0?.height);
      if (!_0x3d957b) {
        return;
      }
      const _0x4848f4 = 280;
      const _0x335f52 = _0x428a12 => {
        const _0x594345 = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById(this.nodeId) : null;
        if (!_0x594345) {
          return;
        }
        _0x594345.classList.add("is-ratio-animating");
        if (this._ratioAnimTimer) {
          clearTimeout(this._ratioAnimTimer);
        }
        this._ratioAnimTimer = setTimeout(() => {
          const _0x35a9e9 = typeof document !== "undefined" && typeof document.getElementById === "function" ? document.getElementById(this.nodeId) : null;
          if (_0x35a9e9) {
            _0x35a9e9.classList.remove("is-ratio-animating");
          }
          this._ratioAnimTimer = null;
        }, _0x428a12 + 80);
      };
      const _0x2d4952 = typeof _0x20bb2f.getStateRaw === "function" ? _0x20bb2f.getStateRaw() : _0x20bb2f.getState?.();
      const _0x5913ef = _0x2d4952?.nodes?.[this.nodeId] || this._data || {};
      const _0xdff191 = Number(_0x5913ef.width) || 300;
      const _0x115327 = Number(_0x5913ef.height) || 300;
      const _0x4521cc = Number.isFinite(Number(_0x5913ef.x)) ? Number(_0x5913ef.x) : 0;
      const _0x417aa0 = Number.isFinite(Number(_0x5913ef.y)) ? Number(_0x5913ef.y) : 0;
      const _0x5c8170 = _0x3d957b.width;
      const _0x325577 = _0x3d957b.height;
      const _0xe11660 = _0x5c8170 - _0xdff191;
      const _0x2a5c0a = _0x325577 - _0x115327;
      if (_0xe11660 !== 0 || _0x2a5c0a !== 0) {
        _0x335f52(_0x4848f4);
      }
      const _0x245111 = {
        width: _0x5c8170,
        height: _0x325577,
        x: Math.round(_0x4521cc - _0xe11660 / 2),
        y: Math.round(_0x417aa0 - _0x2a5c0a),
        aspectRatio: "自适应"
      };
      const _0x9bd3c = Number(_0x5913ef.width) !== _0x245111.width || Number(_0x5913ef.height) !== _0x245111.height || Number(_0x5913ef.x) !== _0x245111.x || Number(_0x5913ef.y) !== _0x245111.y || String(_0x5913ef.aspectRatio || "") !== _0x245111.aspectRatio;
      if (_0x9bd3c) {
        _0x20bb2f.updateNodeData(this.nodeId, _0x245111);
      }
      this._data = {
        ..._0x5913ef,
        ..._0x245111
      };
      const _0x4bfecd = this.footerEl?.querySelector(".img-ratio-label");
      const _0x122eb5 = this.footerEl?.querySelector(".img-ratio-icon-slot");
      if (_0x4bfecd && _0x1a13a3.mode === "sourceVideoFrames") {
        const _0x7f7727 = normalizeRhV54Fps(this._data?.rhVideoFps);
        const _0x495bc4 = Number.isFinite(this._data?.rhVideoFrames) ? Math.max(0, Math.trunc(this._data.rhVideoFrames)) : 77;
        const _0x5906dd = normalizeRhVideoResolution(this._data?.rhVideoResolution);
        const _0x5d2921 = _0x495bc4 === 0 ? referenceInputText("fullLength") : String(_0x495bc4);
        _0x4bfecd.textContent = referenceInputText("sourceVideoFramesLabel", {
          frames: _0x5d2921,
          fps: _0x7f7727,
          resolution: _0x5906dd
        });
      }
      if (_0x122eb5 && typeof this._getRatioIconHTML === "function") {
        _0x122eb5.innerHTML = this._getRatioIconHTML("自适应");
      }
      if ((_0xe11660 !== 0 || _0x2a5c0a !== 0) && this.previewEl && typeof this.previewEl.animate === "function") {
        this.previewEl.style.transition = "none";
        this.previewEl.style.transformOrigin = "bottom center";
        this.previewEl.style.transform = "scaleX(" + _0xdff191 / _0x5c8170 + ") scaleY(" + _0x115327 / _0x325577 + ")";
        if (this._ratioFlipAnim) {
          this._ratioFlipAnim.cancel();
        }
        const _0x894006 = "scaleX(" + _0xdff191 / _0x5c8170 + ") scaleY(" + _0x115327 / _0x325577 + ")";
        this._ratioFlipAnim = this.previewEl.animate([{
          transform: _0x894006
        }, {
          transform: "none"
        }], {
          duration: _0x4848f4,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "forwards"
        });
        const _0x52c91a = () => {
          this._ratioFlipAnim = null;
          this.previewEl.style.transformOrigin = "";
          this.previewEl.style.transform = "";
        };
        this._ratioFlipAnim.onfinish = _0x52c91a;
        this._ratioFlipAnim.oncancel = _0x52c91a;
      }
    }
    async _renderManifestFixedRefBar({
      fixedInputConfig: _0x34a12,
      inEdges: _0x1d85e1,
      nodes: _0x29e056,
      nodeData: _0x9c9e2d,
      attachBtnHTML: _0x32f8d4,
      ensureVideoThumb: _0x248755
    }) {
      const _0x4ad6b9 = (_0x34a12?.visibleSlots || []).map(_0x56849f => String(_0x56849f || "").trim()).filter(Boolean);
      if (!_0x4ad6b9.length) {
        return false;
      }
      this._pruneFixedSlotRefThumbObjectUrls(_0x1d85e1, _0x29e056);
      const _0x5bafd5 = new Set(_0x4ad6b9);
      const _0x5923a0 = {};
      _0x4ad6b9.forEach(_0xc5f220 => {
        _0x5923a0[_0xc5f220] = null;
      });
      const _0x148b8d = [];
      const _0x19d397 = {
        text: 0,
        image: 0,
        video: 0,
        audio: 0
      };
      const _0x29636c = {};
      const _0x4447fe = [];
      for (const _0x2823e9 of _0x1d85e1 || []) {
        const _0x115192 = _0x29e056?.[_0x2823e9?.sourceId];
        if (!_0x115192) {
          continue;
        }
        const _0x2f9b83 = resolveEffectiveInputKind(_0x115192, _0x2823e9) || "image";
        _0x19d397[_0x2f9b83] = Number(_0x19d397[_0x2f9b83] || 0) + 1;
        _0x29636c[_0x2823e9.sourceId] = "@" + (getFixedRefKindLabel(_0x2f9b83) || _0x2f9b83) + _0x19d397[_0x2f9b83];
        if (_0x2f9b83 === "text") {
          const _0x1d5684 = this._createTextEdgeRefThumbData(_0x2823e9, _0x115192);
          if (_0x1d5684) {
            _0x148b8d.push(_0x1d5684);
          }
          continue;
        }
        const _0x59f949 = resolveFixedInputSlotForRef({
          fixedInputConfig: _0x34a12,
          refSlot: _0x2823e9?.refSlot,
          kind: _0x2f9b83,
          occupiedSlots: _0x5923a0,
          sourceNode: _0x115192
        });
        const _0x5e9f78 = _0x59f949.slot;
        if (_0x59f949.reason === "kindMismatch") {
          continue;
        }
        if (_0x59f949.reason === "hidden" || _0x59f949.reason === "slotConstraint") {
          if (_0x2823e9?.id) {
            _0x4447fe.push(_0x2823e9.id);
          }
          continue;
        }
        if (!_0x5e9f78 || _0x5923a0[_0x5e9f78]) {
          const _0x5771a7 = this._createFixedEdgeRefThumbData(_0x2823e9, _0x115192, _0x2f9b83, _0x248755);
          if (_0x5771a7) {
            _0x148b8d.push(_0x5771a7);
          }
          continue;
        }
        const _0x1c0635 = this._createFixedEdgeRefThumbData(_0x2823e9, _0x115192, _0x2f9b83, _0x248755);
        if (_0x1c0635) {
          _0x5923a0[_0x5e9f78] = _0x1c0635;
        }
      }
      if (_0x4447fe.length > 0) {
        if (typeof _0x20bb2f.batch === "function") {
          _0x20bb2f.batch(() => {
            _0x4447fe.forEach(_0x5babd8 => _0x20bb2f.removeEdge(_0x5babd8));
          });
        } else {
          _0x4447fe.forEach(_0x2d6ce0 => _0x20bb2f.removeEdge(_0x2d6ce0));
        }
      }
      const _0x162c27 = new Set(Object.entries(_0x5923a0).filter(([, _0x214f61]) => !!_0x214f61).map(([_0x2d37c3]) => _0x2d37c3));
      const _0x3c89fc = buildFixedInputAssetSlotMap(this.promptEl, {
        slotOrderByType: _0x34a12?.slotOrderByType || {},
        visibleSlots: _0x4ad6b9,
        exclusiveGroups: _0x34a12?.exclusiveGroups || [],
        slotById: _0x34a12?.slotById || {},
        occupiedSlots: _0x162c27,
        nodeData: _0x9c9e2d
      });
      _0x4ad6b9.forEach(_0x318a2e => {
        if (_0x5923a0[_0x318a2e]) {
          return;
        }
        const _0x546a70 = this._createAssetRefThumbData(_0x3c89fc[_0x318a2e], {
          slot: _0x318a2e
        });
        if (_0x546a70) {
          _0x5923a0[_0x318a2e] = _0x546a70;
        }
      });
      getAssetInputRefsFromPrompt(this.promptEl, {
        allowedTypes: ["text"]
      }).forEach((_0xef9b78, _0x4e2436) => {
        const _0x34b060 = this._createAssetRefThumbData(_0xef9b78, {
          key: "asset-text:" + String(_0xef9b78.assetId || "") + ":" + String(_0xef9b78.itemIndex ?? "") + ":" + _0x4e2436
        });
        if (_0x34b060) {
          _0x148b8d.push(_0x34b060);
        }
      });
      this.refBarEl.classList.add("active", "rh-v5-refbar");
      let _0x143296 = this.refBarEl.querySelector(".rh-v5-ref-container");
      const _0x3b1ef9 = !_0x143296 || !this.refBarEl.querySelector(".prompt-attachment-btn");
      if (_0x3b1ef9) {
        const _0x34de0f = String(_0x34a12?.manifest?.displayName || "").trim() || String(_0x34a12?.manifest?.label || "").trim() || referenceInputText("fixedInputs");
        const _0x2721c7 = renderVideoFixedInputSlotsMarkup({
          fixedInputConfig: _0x34a12
        });
        this.refBarEl.innerHTML = _0x32f8d4 + " <div class=\"ref-thumb-container rh-v5-ref-container\" aria-label=\"" + escapeHtmlAttr(referenceInputText("fixedInputsAria", {
          label: _0x34de0f
        })) + "\">" + _0x2721c7 + "</div>";
        _0x143296 = this.refBarEl.querySelector(".rh-v5-ref-container");
      } else {
        const _0x183612 = String(_0x34a12?.manifest?.displayName || "").trim() || String(_0x34a12?.manifest?.label || "").trim() || referenceInputText("fixedInputs");
        _0x143296.setAttribute("aria-label", referenceInputText("fixedInputsAria", {
          label: _0x183612
        }));
      }
      const _0x4801c0 = Array.from(_0x143296?.querySelectorAll?.("[data-slot]") || []).filter(_0x57610f => !_0x5bafd5.has(String(_0x57610f?.dataset?.slot || "")));
      _0x4801c0.forEach(_0x2bbde7 => _0x2bbde7.remove());
      _0x4ad6b9.forEach(_0x10a309 => {
        this._syncFixedSlotEl(_0x143296, _0x10a309, _0x5923a0[_0x10a309], _0x34a12);
      });
      this._syncFixedSlotOrder(_0x143296, _0x4ad6b9);
      this._syncFixedTrailingRefItems(_0x143296, _0x148b8d);
      this._bindFixedSlotDragSwap(_0x143296, getFixedSlotAcceptMap(_0x34a12));
      this._syncSingleReferenceEditorRatio(_0x34a12, _0x5923a0, _0x29e056);
      this._syncBtnIconState();
      _0x3fe325(this, _0x29636c);
      return true;
    }
    async _renderRefBar() {
      if (!this.refBarEl) {
        return;
      }
      if (this._rendererMediaDeferred === true) {
        this._renderRefBarPendingWhenVisible = true;
        return;
      }
      if (this._renderRefBarLock) {
        this._renderRefBarPending = true;
        return;
      }
      this._renderRefBarLock = true;
      this._renderRefBarPending = false;
      try {
        await this._renderRefBarImpl();
      } finally {
        this._renderRefBarLock = false;
        if (this._renderRefBarPending) {
          this._renderRefBarPending = false;
          this._renderRefBar();
        }
      }
    }
    async _renderRefBarImpl() {
      if (!this.refBarEl) {
        return;
      }
      const _0x32dac5 = _0x20bb2f.getIncomingEdges(this.nodeId);
      const _0x461375 = _0x20bb2f.getState().nodes;
      const _0x4affd3 = _0x461375?.[this.nodeId] || this._data || null;
      const _0x247aa3 = getFixedInputSlotConfigFromManifest(_0x4affd3 || {});
      const _0x29c535 = shouldHideFixedInputSlots(_0x247aa3) ? null : _0x247aa3;
      const _0x5694d8 = createPromptAttachmentButtonHTML({
        stroke: "var(--white-90)"
      });
      const _0x45b2ee = (_0x5371cf, _0x2fd5bf) => {
        const _0x2cae47 = String(_0x5371cf?.sourceId || "");
        if (!_0x2cae47) {
          return;
        }
        const _0x123119 = String(_0x5371cf?.refSlot || "sourceVideo");
        const _0x1bb968 = a572_0x2d3576(_0x2fd5bf, _0x5371cf);
        if (!_0x1bb968) {
          return;
        }
        if (!_0x1bb968.startsWith("/output/") && !_0x1bb968.startsWith("/data/")) {
          return;
        }
        const _0x591bff = (() => {
          if (String(_0x2fd5bf?.type || "") === "ai-video") {
            const _0x4985a9 = a572_0x37b0db(_0x2fd5bf, _0x5371cf);
            return String(_0x4985a9?.item?.videoThumbUnavailableSource || "").trim();
          }
          return String(_0x2fd5bf?.videoThumbUnavailableSource || "").trim();
        })();
        if (_0x591bff === _0x1bb968) {
          return;
        }
        const _0x381937 = _0x123119 + "|" + _0x2cae47 + "|" + _0x1bb968;
        if (this._videoThumbPending.has(_0x381937)) {
          return;
        }
        this._videoThumbPending.add(_0x381937);
        _0x22a2f2.fetchVideoFirstFrameThumbFromServer(_0x1bb968, {
          nodeId: _0x2cae47,
          assetId: String(_0x5371cf?.sourceMediaKey || _0x5371cf?.id || "")
        }).then(_0xdd924b => {
          const _0x3cd419 = String(_0xdd924b?.url || "").trim();
          if (!_0x3cd419) {
            return;
          }
          const _0x420898 = _0x20bb2f.getState();
          const _0x35d50e = _0x420898.nodes?.[_0x2cae47];
          if (!_0x35d50e) {
            return;
          }
          if (String(_0x35d50e.type || "") === "ai-video") {
            const _0x4bd8d6 = a572_0x37b0db(_0x35d50e, _0x5371cf);
            const _0x2d28fa = Number(_0x4bd8d6.index);
            const _0x2e357b = Array.isArray(_0x35d50e.videos) ? _0x35d50e.videos : [];
            if (!(_0x2d28fa >= 0) || !(_0x2d28fa < _0x2e357b.length)) {
              return;
            }
            const _0x58cf45 = _0x2e357b[_0x2d28fa] || null;
            if (!_0x58cf45 || typeof _0x58cf45 !== "object") {
              return;
            }
            if (String(_0x58cf45.thumbUrl || "").trim()) {
              return;
            }
            const _0x4b3ec5 = {
              ..._0x58cf45,
              thumbUrl: _0x3cd419,
              videoThumbUnavailableSource: ""
            };
            const _0x570e6a = _0x2e357b.slice();
            _0x570e6a[_0x2d28fa] = _0x4b3ec5;
            const _0x8c2b5e = {
              videos: _0x570e6a
            };
            const _0x3f0abf = Number(_0x35d50e.mainVideoIndex);
            const _0x266b63 = Number.isFinite(_0x3f0abf) ? Math.max(0, Math.trunc(_0x3f0abf)) : 0;
            if (_0x2d28fa === _0x266b63) {
              _0x8c2b5e.videoThumbUnavailableSource = "";
            }
            if (_0x2d28fa === _0x266b63 && !String(_0x35d50e.thumbUrl || "").trim()) {
              _0x8c2b5e.thumbUrl = _0x3cd419;
            }
            _0x20bb2f.updateNodeData(_0x2cae47, _0x8c2b5e);
          } else {
            if (String(_0x35d50e.thumbUrl || "").trim()) {
              return;
            }
            _0x20bb2f.updateNodeData(_0x2cae47, {
              thumbUrl: _0x3cd419,
              videoThumbUnavailableSource: ""
            });
          }
        }).catch(() => {
          const _0xc9c4cd = _0x20bb2f.getState();
          const _0x17e795 = _0xc9c4cd.nodes?.[_0x2cae47];
          if (!_0x17e795) {
            return;
          }
          if (a572_0x2d3576(_0x17e795, _0x5371cf) !== _0x1bb968) {
            return;
          }
          if (String(_0x17e795.type || "") === "ai-video") {
            const _0x55b464 = a572_0x37b0db(_0x17e795, _0x5371cf);
            const _0x206e06 = Number(_0x55b464.index);
            const _0x1ebd07 = Array.isArray(_0x17e795.videos) ? _0x17e795.videos : [];
            if (!(_0x206e06 >= 0) || !(_0x206e06 < _0x1ebd07.length)) {
              return;
            }
            const _0x2a9e0a = _0x1ebd07[_0x206e06] || null;
            if (!_0x2a9e0a || typeof _0x2a9e0a !== "object") {
              return;
            }
            const _0xe43449 = _0x1ebd07.slice();
            _0xe43449[_0x206e06] = {
              ..._0x2a9e0a,
              videoThumbUnavailableSource: _0x1bb968,
              thumbUrl: ""
            };
            const _0x50cfb6 = {
              videos: _0xe43449
            };
            const _0x3b83cf = Number(_0x17e795.mainVideoIndex);
            const _0x59e61a = Number.isFinite(_0x3b83cf) ? Math.max(0, Math.trunc(_0x3b83cf)) : 0;
            if (_0x206e06 === _0x59e61a) {
              _0x50cfb6.videoThumbUnavailableSource = _0x1bb968;
              _0x50cfb6.thumbUrl = "";
            }
            _0x20bb2f.updateNodeData(_0x2cae47, _0x50cfb6);
          } else {
            _0x20bb2f.updateNodeData(_0x2cae47, {
              videoThumbUnavailableSource: _0x1bb968,
              thumbUrl: ""
            });
          }
        }).finally(() => {
          this._videoThumbPending.delete(_0x381937);
        });
      };
      const _0x5b1d2e = getFixedRefBarLayoutKey(_0x29c535);
      if (this._refBarLayoutKey !== _0x5b1d2e) {
        this._refBarLayoutKey = _0x5b1d2e;
        this.refBarEl.classList.remove("active", "rh-v5-refbar");
        this.refBarEl.innerHTML = "";
        if (!_0x29c535) {
          this._clearObjectUrlMap(this._getFixedSlotRefThumbObjectUrlMap());
        }
        if (_0x5b1d2e !== "generic") {
          this._clearObjectUrlMap(this._refThumbObjectUrls);
        }
      }
      if (_0x29c535) {
        await this._renderManifestFixedRefBar({
          fixedInputConfig: _0x29c535,
          inEdges: _0x32dac5,
          nodes: _0x461375,
          nodeData: _0x4affd3,
          attachBtnHTML: _0x5694d8,
          ensureVideoThumb: _0x45b2ee
        });
        return;
      }
      const _0x59041b = getAssetInputRefsFromPromptAndNode(this.promptEl, {
        nodeData: _0x4affd3,
        allowedTypes: ["text", "image", "video", "audio"]
      });
      if (_0x32dac5.length === 0 && _0x59041b.length === 0) {
        this.refBarEl.classList.remove("rh-v5-refbar");
        this.refBarEl.classList.remove("active");
        this.refBarEl.innerHTML = _0x5694d8;
        this._syncBtnIconState();
        _0x3fe325(this, {});
        return;
      }
      const _0x589cfc = new Set();
      for (const _0x38c8ed of _0x32dac5) {
        const _0x534dcb = _0x461375?.[_0x38c8ed.sourceId];
        if (_0x534dcb?.thumbId) {
          _0x589cfc.add(_0x534dcb.thumbId);
        }
      }
      for (const [_0x49903e, _0x203846] of this._refThumbObjectUrls.entries()) {
        if (!_0x589cfc.has(_0x49903e)) {
          if (_0x203846 && String(_0x203846).startsWith("blob:")) {
            URL.revokeObjectURL(_0x203846);
          }
          this._refThumbObjectUrls.delete(_0x49903e);
        }
      }
      let _0x32ddb4 = [];
      const _0x5651d8 = {
        text: 0,
        image: 0,
        video: 0,
        audio: 0
      };
      const _0x583536 = {};
      const _0x1f2015 = {
        text: referenceInputText("kind.text"),
        image: referenceInputText("kind.image"),
        video: referenceInputText("kind.video"),
        audio: referenceInputText("kind.audio")
      };
      for (const _0x1db8b8 of _0x32dac5) {
        const _0x24e7b9 = _0x461375[_0x1db8b8.sourceId];
        if (!_0x24e7b9) {
          continue;
        }
        const _0x36a878 = resolveEffectiveInputKind(_0x24e7b9, _0x1db8b8) || "image";
        if (_0x36a878 === "text") {
          const _0x3342c3 = String(_0x24e7b9.outputText || _0x24e7b9.text || _0x24e7b9.content || _0x24e7b9.prompt || "").trim();
          if (!_0x3342c3) {
            continue;
          }
        } else if (_0x36a878 === "image") {
          const _0x19ba72 = !!_0x24e7b9.thumbId || !!_0x24e7b9.thumbUrl || !!_0x24e7b9.imageUrl || !!_0x24e7b9.src || !!_0x24e7b9.localPath;
          if (!_0x19ba72) {
            continue;
          }
        } else if (_0x36a878 === "video") {
          const _0x259211 = Array.isArray(_0x24e7b9.videos) && _0x24e7b9.videos.length > 0 || !!_0x24e7b9.thumbId || !!_0x24e7b9.thumbUrl || !!_0x24e7b9.videoUrl || !!_0x24e7b9.displayLocalPath || !!_0x24e7b9.originalLocalPath || !!_0x24e7b9.videoLocalPath || !!_0x24e7b9.src || !!_0x24e7b9.localPath || !!_0x24e7b9.url || !!_0x24e7b9.resultUrl || !!_0x24e7b9.sourceUrl;
          if (!_0x259211) {
            continue;
          }
        } else if (_0x36a878 === "audio") {
          const _0x35dcf5 = !!_0x24e7b9.audioUrl || !!_0x24e7b9.src || !!_0x24e7b9.localPath;
          if (!_0x35dcf5) {
            continue;
          }
        }
        let _0x1e84e0 = "";
        let _0x55e48a = "";
        if (_0x36a878 === "image") {
          let _0x3c4e46 = this._resolveMediaUrl(resolveCanvasImageLowZoomUrl(_0x24e7b9));
          if (_0x24e7b9.thumbId && !this._refThumbObjectUrls.has(_0x24e7b9.thumbId)) {
            this._scheduleFixedThumbObjectUrl(_0x24e7b9.thumbId, this._refThumbObjectUrls);
          }
          if (!_0x3c4e46 && _0x24e7b9.thumbId) {
            _0x3c4e46 = this._refThumbObjectUrls.get(_0x24e7b9.thumbId) || "";
          }
          if (!_0x3c4e46) {
            _0x3c4e46 = this._resolveMediaUrl(localPathToUrl(_0x24e7b9.localPath));
          }
          if (!_0x3c4e46) {
            continue;
          }
          _0x488192(_0x3c4e46);
          _0x1e84e0 = createReferenceInputThumbnailHtml({
            kind: "image",
            thumbnailUrl: _0x3c4e46,
            extraHtml: createReferenceMaskBadgeHtml(_0x24e7b9)
          });
          _0x55e48a = "i|" + _0x3c4e46 + "|" + getReferenceMaskSignaturePart(_0x24e7b9);
        } else if (_0x36a878 === "video") {
          const _0x46d664 = a572_0x2b8ef4(_0x24e7b9, _0x1db8b8);
          const _0xe45fe9 = this._resolveMediaUrl(_0x46d664.thumbUrl || _0x24e7b9.imageUrl || "");
          if (_0xe45fe9) {
            _0x488192(_0xe45fe9);
            _0x1e84e0 = createReferenceInputThumbnailHtml({
              kind: "video",
              thumbnailUrl: _0xe45fe9
            });
            _0x55e48a = "v|" + _0xe45fe9;
          } else {
            _0x45b2ee(_0x1db8b8, _0x24e7b9);
            _0x1e84e0 = createReferenceInputThumbnailHtml({
              kind: "video"
            });
            _0x55e48a = "v|fallback";
          }
        } else {
          _0x1e84e0 = createReferenceInputThumbnailHtml({
            kind: _0x36a878
          });
          _0x55e48a = _0x36a878 + "|fallback";
        }
        _0x5651d8[_0x36a878]++;
        const _0xcccaf6 = "@" + _0x1f2015[_0x36a878] + _0x5651d8[_0x36a878];
        _0x583536[_0x1db8b8.sourceId] = _0xcccaf6;
        const _0x3d34cd = _0x1db8b8.id + "|" + _0x1db8b8.sourceId + "|" + _0x55e48a;
        _0x32ddb4.push({
          key: "edge:" + _0x1db8b8.id,
          edgeId: _0x1db8b8.id,
          sourceId: _0x1db8b8.sourceId,
          sig: _0x3d34cd,
          thumbHTML: _0x1e84e0
        });
      }
      _0x59041b.forEach((_0x1be9a9, _0x2bcabd) => {
        const _0x233fbe = String(_0x1be9a9?.type || "").trim();
        if (!_0x233fbe) {
          return;
        }
        let _0x37e938 = "";
        let _0x5c4e60 = "";
        if (_0x233fbe === "image") {
          const _0x1a24ee = this._resolveMediaUrl(_0x1be9a9.thumbUrl || _0x1be9a9.url || "");
          if (!_0x1a24ee) {
            return;
          }
          _0x488192(_0x1a24ee);
          _0x37e938 = createReferenceInputThumbnailHtml({
            kind: "image",
            thumbnailUrl: _0x1a24ee
          });
          _0x5c4e60 = "asset-i|" + _0x1a24ee;
        } else if (_0x233fbe === "video") {
          const _0xb31a08 = this._resolveMediaUrl(_0x1be9a9.thumbUrl || "");
          if (_0xb31a08) {
            _0x488192(_0xb31a08);
            _0x37e938 = createReferenceInputThumbnailHtml({
              kind: "video",
              thumbnailUrl: _0xb31a08
            });
            _0x5c4e60 = "asset-v|" + _0xb31a08;
          } else {
            _0x37e938 = createReferenceInputThumbnailHtml({
              kind: "video"
            });
            _0x5c4e60 = "asset-v|fallback";
          }
        } else {
          _0x37e938 = createReferenceInputThumbnailHtml({
            kind: _0x233fbe
          });
          _0x5c4e60 = "asset-" + _0x233fbe + "|fallback";
        }
        const _0x1460c6 = String(_0x1be9a9.assetId || "");
        const _0x45de1b = String(_0x1be9a9.itemIndex ?? "");
        const _0x5cfedb = String(_0x1be9a9.assetMentionOccurrence ?? "");
        const _0x22db4c = String(_0x1be9a9.assetRefSource || "prompt");
        const _0xfe5c73 = "asset:" + _0x1460c6 + ":" + _0x45de1b;
        _0x32ddb4.push({
          key: "asset:" + _0x1460c6 + ":" + _0x45de1b + ":" + _0x233fbe + ":" + _0x2bcabd,
          edgeId: "",
          sourceId: _0xfe5c73,
          sig: _0xfe5c73 + "|" + _0x233fbe + "|" + String(_0x1be9a9.url || "") + "|" + _0x5c4e60,
          thumbHTML: _0x37e938,
          virtual: true,
          assetId: _0x1460c6,
          assetIndex: _0x45de1b,
          assetOccurrence: _0x5cfedb,
          assetRefSource: _0x22db4c,
          refType: _0x233fbe
        });
      });
      if (_0x32ddb4.length === 0) {
        this.refBarEl.classList.remove("rh-v5-refbar");
        this.refBarEl.classList.remove("active");
        this.refBarEl.innerHTML = _0x5694d8;
        this._syncBtnIconState();
        _0x3fe325(this, {});
        return;
      }
      if (this._isDraggingSorting) {
        this._syncBtnIconState();
        _0x3fe325(this, _0x583536);
        return;
      }
      this.refBarEl.classList.remove("rh-v5-refbar");
      this.refBarEl.classList.add("active");
      let _0x468453 = this.refBarEl.querySelector(".ref-thumb-container");
      if (!this.refBarEl.querySelector(".prompt-attachment-btn") || !_0x468453) {
        this.refBarEl.innerHTML = _0x5694d8 + " <div class=\"ref-thumb-container\"></div>";
        _0x468453 = this.refBarEl.querySelector(".ref-thumb-container");
      }
      const _0x2da3d3 = new Map();
      _0x468453.querySelectorAll(".ref-thumb-wrap").forEach(_0x2e98ea => _0x2da3d3.set(_0x2e98ea.dataset.refKey || "edge:" + _0x2e98ea.dataset.edgeId, _0x2e98ea));
      const _0x14c2f2 = new Set();
      for (let _0x2e696d = 0; _0x2e696d < _0x32ddb4.length; _0x2e696d++) {
        const _0x3f9b2e = _0x32ddb4[_0x2e696d];
        let _0xf7c6d8 = _0x2da3d3.get(_0x3f9b2e.key);
        if (!_0xf7c6d8) {
          _0xf7c6d8 = document.createElement("div");
          _0xf7c6d8.className = "ref-thumb-wrap" + (_0x3f9b2e.virtual ? " ref-thumb-wrap--asset" : "");
        }
        _0xf7c6d8.setAttribute("draggable", _0x3f9b2e.virtual ? "false" : "true");
        if (_0xf7c6d8.dataset.sig !== _0x3f9b2e.sig) {
          _0xf7c6d8.innerHTML = "" + _0x3f9b2e.thumbHTML + createRefThumbDeleteButtonHtml();
          _0xf7c6d8.dataset.sig = _0x3f9b2e.sig;
          _0x30ed95(_0xf7c6d8, _0x3f9b2e.sig);
        }
        _0xf7c6d8.dataset.refKey = _0x3f9b2e.key;
        _0xf7c6d8.dataset.edgeId = _0x3f9b2e.edgeId;
        _0xf7c6d8.dataset.sourceId = _0x3f9b2e.sourceId;
        _0xf7c6d8.dataset.refOrigin = _0x3f9b2e.virtual ? "asset" : "node";
        if (_0x3f9b2e.virtual) {
          _0xf7c6d8.dataset.assetId = _0x3f9b2e.assetId || "";
          _0xf7c6d8.dataset.assetIndex = _0x3f9b2e.assetIndex || "";
          _0xf7c6d8.dataset.assetOccurrence = _0x3f9b2e.assetOccurrence || "";
          _0xf7c6d8.dataset.assetRefSource = _0x3f9b2e.assetRefSource || "prompt";
          _0xf7c6d8.dataset.refType = _0x3f9b2e.refType || "";
        } else {
          delete _0xf7c6d8.dataset.assetId;
          delete _0xf7c6d8.dataset.assetIndex;
          delete _0xf7c6d8.dataset.assetOccurrence;
          delete _0xf7c6d8.dataset.assetRefSource;
          delete _0xf7c6d8.dataset.refType;
        }
        _0x468453.appendChild(_0xf7c6d8);
        _0x14c2f2.add(_0x3f9b2e.key);
      }
      for (const [_0x32997a, _0x81d70a] of _0x2da3d3.entries()) {
        if (!_0x14c2f2.has(_0x32997a)) {
          _0x81d70a.remove();
        }
      }
      this._bindDragSort(this.refBarEl);
      this._syncBtnIconState();
      _0x3fe325(this, _0x583536);
    }
    _bindFixedSlotDragSwap(_0x3931e2, _0x4d4258) {
      bindRefThumbFixedSlotDrag({
        owner: this,
        container: _0x3931e2,
        store: _0x20bb2f,
        nodeId: this.nodeId,
        acceptMap: _0x4d4258
      });
    }
    _bindDragSort(_0x4c74f6) {
      bindRefThumbOrderDrag({
        owner: this,
        container: _0x4c74f6,
        store: _0x20bb2f,
        nodeId: this.nodeId
      });
    }
  }
  return _0x3095e5.prototype;
}