import { resolveModelProvider } from "../../manifests/index.js";
import { buildRunningHubVideoFixedSlotPayloadPatch } from "../../components/video-node/runningHubVideoSubmitPayload.js";
import { getFixedInputSlotConfigFromManifest } from "../fixedInputAssetRefs.js";
import { PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID, getPersonReplacementVideoResults, resolvePersonReplacementVideoResultRef, resolvePersonReplacementVideoImageInput, resolvePersonReplacementVideoModelId } from "./personReplacementProject.js";
import { normalizePersonReplacementWorkspaceProject } from "./personReplacementProjectSession.js";
import { updatePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
function normalizeText(_0x2b38d4) {
  return String(_0x2b38d4 ?? "").trim();
}
function getStoredVideoInputsBySlot(_0x329225 = {}) {
  const _0x595435 = _0x329225?.replacementVideoInputsBySlot;
  if (_0x595435 && typeof _0x595435 === "object" && !Array.isArray(_0x595435)) {
    return _0x595435;
  } else {
    return {};
  }
}
function resolveStoredInputUrl(_0x56f5f7) {
  if (typeof _0x56f5f7 === "string") {
    return normalizeText(_0x56f5f7);
  }
  return normalizeText(_0x56f5f7?.url || _0x56f5f7?.localUrl || _0x56f5f7?.imageUrl || _0x56f5f7?.videoUrl || _0x56f5f7?.localPath);
}
function resolveProjectSourceVideoRef(_0x31cd5a = {}, _0xfea737 = {}) {
  const _0x2161c0 = normalizeText(_0xfea737?.sourceId);
  const _0x28a1c5 = (Array.isArray(_0x31cd5a?.sources) ? _0x31cd5a.sources : []).find(_0x2b9a12 => normalizeText(_0x2b9a12?.id) === _0x2161c0);
  return normalizeText(_0xfea737?.sourceVideoRef || _0x28a1c5?.videoRef);
}
export function appendPersonReplacementVideoResults(_0x1e0115 = {}, _0x18a07e = []) {
  const _0x246ff0 = getPersonReplacementVideoResults(_0x1e0115);
  const _0x45225b = [..._0x246ff0];
  let _0xed9d56 = -1;
  _0x18a07e.forEach(_0x5a2332 => {
    const _0x7796da = resolvePersonReplacementVideoResultRef(_0x5a2332);
    if (!_0x7796da) {
      return;
    }
    const _0x4935ae = _0x45225b.findIndex(_0x28ac61 => resolvePersonReplacementVideoResultRef(_0x28ac61) === _0x7796da);
    if (_0x4935ae >= 0) {
      if (_0xed9d56 < 0) {
        _0xed9d56 = _0x4935ae;
      }
      return;
    }
    if (_0xed9d56 < 0) {
      _0xed9d56 = _0x45225b.length;
    }
    _0x45225b.push({
      ..._0x5a2332
    });
  });
  return {
    results: _0x45225b,
    activeIndex: _0xed9d56 >= 0 ? _0xed9d56 : Math.max(0, _0x45225b.length - 1)
  };
}
export function applyPersonReplacementVideoCrop(_0x16dc6c = {}, {
  shotId = "",
  cutLocalPath = "",
  videoUrl = "",
  fps = 0
} = {}) {
  const _0x447c27 = normalizePersonReplacementWorkspaceProject(_0x16dc6c);
  const _0x2400f6 = normalizeText(shotId || _0x447c27.workspace.selectedShotId);
  const _0x5111da = normalizeText(cutLocalPath || videoUrl);
  if (!_0x2400f6 || !_0x5111da) {
    return _0x447c27;
  }
  const _0x4fbfbe = _0x447c27.shots.find(_0x3285cc => _0x3285cc.id === _0x2400f6);
  if (!_0x4fbfbe) {
    return _0x447c27;
  }
  const _0xb8cef8 = Number(fps) > 0 ? Number(fps) : _0x4fbfbe.outputFps;
  const _0x261d51 = {
    ..._0x447c27,
    shots: _0x447c27.shots.map(_0x469898 => _0x469898.id === _0x2400f6 ? {
      ..._0x469898,
      videoRef: _0x5111da,
      videoRefIsCropped: true,
      outputFps: _0xb8cef8,
      materializationStatus: "succeeded",
      materializationProgress: 100,
      error: ""
    } : _0x469898),
    workspace: updatePersonReplacementVideoGenerationState(_0x447c27.workspace, {
      status: "idle",
      shotId: _0x2400f6,
      error: ""
    })
  };
  return normalizePersonReplacementWorkspaceProject(_0x261d51);
}
export function resolvePersonReplacementVideoSlotState(_0x3bf37d = {}, _0x1a8e9c = {}) {
  const _0xe48fe7 = resolvePersonReplacementVideoModelId(_0x3bf37d?.settings?.replacementModelId || PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID);
  const _0x4472e2 = resolveModelProvider(_0xe48fe7, "", {
    allowProviderHint: false,
    allowPrefixInference: false
  });
  const _0x26873f = getFixedInputSlotConfigFromManifest({
    model: _0xe48fe7,
    provider: _0x4472e2,
    generationParams: _0x3bf37d?.settings?.replacementVideoGenerationParams || {}
  }, {
    includeHiddenSlots: true
  });
  const _0x295d0d = {};
  const _0x2dd69c = ["refImage"].filter(_0x41e755 => _0x26873f?.visibleSlots?.includes(_0x41e755));
  const _0x4c335d = getStoredVideoInputsBySlot(_0x1a8e9c);
  (_0x26873f?.visibleSlots || []).forEach(_0x2c7e55 => {
    const _0x20dea8 = _0x4c335d[_0x2c7e55];
    const _0x40f11c = normalizeText(_0x20dea8?.modelId);
    const _0x39d87d = resolveStoredInputUrl(_0x20dea8);
    const _0x5889d3 = normalizeText(_0x26873f?.slotKindById?.[_0x2c7e55] || _0x20dea8?.kind);
    if (!_0x39d87d || _0x40f11c && _0x40f11c !== _0xe48fe7) {
      return;
    }
    _0x295d0d[_0x2c7e55] = {
      ...(_0x20dea8 && typeof _0x20dea8 === "object" ? _0x20dea8 : {}),
      kind: _0x5889d3,
      url: _0x39d87d
    };
  });
  const _0x2e29a1 = normalizeText(_0x1a8e9c?.videoRef);
  const _0x4a7a69 = _0x2e29a1 || resolveProjectSourceVideoRef(_0x3bf37d, _0x1a8e9c);
  if (_0x4a7a69 && _0x26873f?.slotKindById?.sourceVideo === "video" && !_0x295d0d.sourceVideo) {
    _0x295d0d.sourceVideo = {
      kind: "video",
      url: _0x4a7a69,
      thumbUrl: normalizeText(_0x1a8e9c?.keyframeRef),
      pending: !_0x2e29a1
    };
    _0x2dd69c.push("sourceVideo");
  }
  const _0x32b07c = resolvePersonReplacementVideoImageInput(_0x3bf37d, _0x1a8e9c);
  if (_0x32b07c.status === "ready" && _0x26873f?.slotKindById?.refImage === "image") {
    _0x295d0d.refImage = {
      kind: "image",
      url: _0x32b07c.imageRef
    };
  }
  const _0x263279 = Object.fromEntries(Object.entries(_0x295d0d).filter(([_0x15d37d, _0x170ff7]) => _0x26873f?.visibleSlots?.includes(_0x15d37d) && normalizeText(_0x170ff7?.url) && _0x170ff7?.pending !== true).map(([_0x4b3314, _0x2f3230]) => [_0x4b3314, {
    ..._0x2f3230,
    url: normalizeText(_0x2f3230.url)
  }]));
  const _0x2ed865 = {
    imageCount: 0,
    videoCount: 0,
    audioCount: 0
  };
  Object.entries(_0x295d0d).forEach(([_0x53635c, _0x1952b8]) => {
    const _0x595eb9 = normalizeText(_0x26873f?.slotKindById?.[_0x53635c] || _0x1952b8?.kind);
    const _0x5ac2e6 = _0x595eb9 + "Count";
    if (Object.hasOwn(_0x2ed865, _0x5ac2e6)) {
      _0x2ed865[_0x5ac2e6] += 1;
    }
  });
  return {
    modelId: _0xe48fe7,
    provider: _0x4472e2,
    fixedInputConfig: _0x26873f,
    imageInput: _0x32b07c,
    inputsBySlot: _0x295d0d,
    readOnlySlots: _0x2dd69c,
    slotEntries: _0x263279,
    referenceCounts: _0x2ed865
  };
}
export function buildPersonReplacementVideoSlotPayloadPatch({
  project = {},
  shot = {},
  generationParams = {}
} = {}) {
  const _0x549387 = resolvePersonReplacementVideoSlotState(project, shot);
  const _0x54a575 = buildRunningHubVideoFixedSlotPayloadPatch({
    model: _0x549387.modelId,
    nodeData: {
      model: _0x549387.modelId,
      provider: _0x549387.provider,
      generationParams: generationParams
    },
    slotEntries: _0x549387.slotEntries
  });
  return {
    slotState: _0x549387,
    payloadPatch: _0x54a575
  };
}