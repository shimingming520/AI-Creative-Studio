import { getFixedInputSlotConfigFromManifest, resolveFixedInputSlotForRef } from "../../modules/fixedInputAssetRefs.js";
import { resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { validateModelMediaInputLimits } from "../../modules/modelMediaInputLimits.js";
import { getModelApiVideoMaxInputVideoSeconds, isHappyHorseModelApiVideo, isWan27ModelApiVideo, supportsHappyHorseModelApiVideoEdit } from "../../modules/modelApiVideoResolverPolicy.js";
import { resolveModelExecution } from "../../manifests/index.js";
import { t } from "../../i18n/index.js";
import { getMissingManifestInputRequirement } from "../aigenImage/manifestInputRequirements.js";
import { resolveModelApiVideoInputMaterials } from "./modelApiVideoInputPolicy.js";
import { applyVideoNodeAdaptiveAspectRatio } from "./videoNodeAdaptiveAspectRatio.js";
const APIMART_KLING_V3_OMNI_MODEL_ID = "apimart/kling-v3-omni";
const APIMART_KLING_O1_MODEL_ID = "apimart/kling-video-o1";
const HAPPYHORSE_VIDEO_INPUT_MAX_SECONDS = 15;
const WAN27_AUDIO_INPUT_MIN_SECONDS = 2;
const WAN27_AUDIO_INPUT_MAX_SECONDS = 30;
const WAN27_AUDIO_INPUT_MAX_BYTES = 15728640;
const WAN27_VIDEO_EXTEND_MAX_SECONDS = 10;
const WAN27_REFERENCE_VIDEO_MAX_SECONDS = 30;
const WAN27_EDIT_VIDEO_MIN_SECONDS = 2;
const WAN27_EDIT_VIDEO_MAX_SECONDS = 10;
const KLING_V3_OMNI_VIDEO_MIN_SECONDS = 3;
const KLING_V3_OMNI_EDIT_VIDEO_MAX_SECONDS = 10;
const KLING_O1_VIDEO_MIN_SECONDS = 3;
const KLING_O1_VIDEO_MAX_SECONDS = 10;
function videoTaskText(_0x17aa61, _0x55b7fa = {}) {
  return t("videoTask." + _0x17aa61, _0x55b7fa);
}
function getPlainObject(_0x351322) {
  if (_0x351322 && typeof _0x351322 === "object" && !Array.isArray(_0x351322)) {
    return _0x351322;
  } else {
    return {};
  }
}
function normalizePositiveNumber(_0x2bc2a8) {
  const _0x570376 = Number(_0x2bc2a8);
  if (Number.isFinite(_0x570376) && _0x570376 > 0) {
    return _0x570376;
  } else {
    return 0;
  }
}
function isCanonicalProviderModel(_0x3d9614, _0x190550, _0x2fb14c) {
  const _0x238546 = resolveModelExecution(_0x3d9614, {
    providerHint: _0x190550
  }) || resolveModelExecution(_0x3d9614);
  const _0x5da7d6 = String(_0x238546?.canonicalModelId || _0x238546?.modelManifest?.modelId || _0x3d9614 || "").trim();
  const _0x4b7af9 = String(_0x238546?.modelManifest?.provider || _0x190550 || "").trim().toLowerCase();
  return _0x5da7d6 === _0x2fb14c && (!_0x4b7af9 || _0x4b7af9 === "apimart");
}
function buildVideoInputUrlsByFixedKindSlot({
  fixedInputConfig = null,
  refs = [],
  assetInputRefs = [],
  kind = "image"
} = {}) {
  const _0x4768e8 = String(kind || "").trim();
  const _0x3248a3 = (fixedInputConfig?.visibleSlots || []).map(_0x4ae46f => String(_0x4ae46f || "").trim()).filter(_0x2800b1 => _0x2800b1 && String(fixedInputConfig?.slotKindById?.[_0x2800b1] || "") === _0x4768e8);
  if (_0x3248a3.length === 0) {
    return {};
  }
  const _0x8ecb0a = {};
  const _0x3bdb58 = new Set();
  const _0x485e70 = (_0x55c928, _0xc0ad49) => {
    const _0x375299 = String(_0x55c928 || "").trim();
    const _0x598333 = String(_0xc0ad49 || "").trim();
    if (!_0x375299 || !_0x598333 || _0x8ecb0a[_0x375299]) {
      return false;
    }
    if (!_0x3248a3.includes(_0x375299)) {
      return false;
    }
    _0x8ecb0a[_0x375299] = _0x598333;
    _0x3bdb58.add(_0x598333);
    return true;
  };
  const _0x465c48 = (_0x531cbd, {
    allowAuto = true
  } = {}) => {
    const _0x142184 = String(_0x531cbd?.url || "").trim();
    if (!_0x142184 || _0x3bdb58.has(_0x142184)) {
      return false;
    }
    const _0x2bea27 = resolveEffectiveInputKind(_0x531cbd) || _0x531cbd?.type || _0x4768e8;
    if (String(_0x2bea27 || "").trim() !== _0x4768e8) {
      return false;
    }
    const _0x17e566 = resolveFixedInputSlotForRef({
      fixedInputConfig: fixedInputConfig,
      refSlot: _0x531cbd?.refSlot,
      kind: _0x4768e8,
      occupiedSlots: _0x8ecb0a,
      sourceNode: _0x531cbd?.nodeData || _0x531cbd
    });
    if (!allowAuto && _0x17e566.reason !== "explicit") {
      return false;
    }
    return _0x485e70(_0x17e566.slot, _0x142184);
  };
  const _0x5ccf38 = _0x14f6ef => {
    const _0x5d76e2 = String(_0x14f6ef || "").trim();
    if (!_0x5d76e2 || _0x3bdb58.has(_0x5d76e2)) {
      return false;
    }
    const _0x33b583 = resolveFixedInputSlotForRef({
      fixedInputConfig: fixedInputConfig,
      refSlot: "",
      kind: _0x4768e8,
      occupiedSlots: _0x8ecb0a,
      sourceNode: {
        type: _0x4768e8,
        url: _0x5d76e2
      }
    });
    return _0x485e70(_0x33b583.slot, _0x5d76e2);
  };
  const _0x2f0943 = [...(Array.isArray(refs) ? refs : []), ...(Array.isArray(assetInputRefs) ? assetInputRefs : [])];
  _0x2f0943.forEach(_0x11328b => _0x465c48(_0x11328b, {
    allowAuto: false
  }));
  (Array.isArray(refs) ? refs : []).forEach(_0x53f398 => _0x465c48(_0x53f398));
  (Array.isArray(assetInputRefs) ? assetInputRefs : []).forEach(_0x316009 => {
    const _0xe56b6e = resolveEffectiveInputKind(_0x316009) || _0x316009?.type;
    if (_0xe56b6e === _0x4768e8) {
      _0x5ccf38(_0x316009?.url);
    }
  });
  return _0x8ecb0a;
}
function buildVideoInputUrlsByFixedImageSlot(_0x188ade = {}) {
  return buildVideoInputUrlsByFixedKindSlot({
    ..._0x188ade,
    refs: _0x188ade.imageRefs,
    kind: "image"
  });
}
function normalizeHappyHorseMode(_0x2e7b29) {
  const _0x131eaf = String(_0x2e7b29 || "").trim().toLowerCase();
  if (_0x131eaf === "image" || _0x131eaf === "reference" || _0x131eaf === "edit") {
    return _0x131eaf;
  } else {
    return "auto";
  }
}
function getHappyHorseMode(_0x29f6b1 = {}) {
  const _0x3f393a = getPlainObject(_0x29f6b1?.generationParams);
  return normalizeHappyHorseMode(_0x3f393a.happyhorse_mode ?? _0x29f6b1?.happyhorse_mode);
}
function normalizeWan27Mode(_0x23a1d7) {
  const _0x59f4fd = String(_0x23a1d7 || "").trim().toLowerCase();
  if (_0x59f4fd === "video" || _0x59f4fd === "reference" || _0x59f4fd === "edit") {
    return _0x59f4fd;
  } else {
    return "image";
  }
}
function getWan27Mode(_0x3fef3d = {}) {
  const _0x2a7e0c = getPlainObject(_0x3fef3d?.generationParams);
  return normalizeWan27Mode(_0x2a7e0c.wan27_mode ?? _0x3fef3d?.wan27_mode);
}
function normalizeKlingV3OmniMode(_0x185783) {
  const _0x59f22f = String(_0x185783 || "").trim().toLowerCase();
  if (_0x59f22f === "reference" || _0x59f22f === "edit") {
    return _0x59f22f;
  } else {
    return "image";
  }
}
function getKlingV3OmniMode(_0x151cf5 = {}) {
  const _0x4dc6e7 = getPlainObject(_0x151cf5?.generationParams);
  return normalizeKlingV3OmniMode(_0x4dc6e7.kling_v3_omni_mode ?? _0x151cf5?.kling_v3_omni_mode);
}
function buildHappyHorseMediaPayload({
  prompt = "",
  mode = "auto",
  images = [],
  videos = [],
  videoEntries = [],
  assetVideoCount = 0,
  maxVideoSeconds = HAPPYHORSE_VIDEO_INPUT_MAX_SECONDS,
  supportsEdit = true
} = {}) {
  const _0x5edb45 = String(prompt || "").trim();
  if (!_0x5edb45) {
    return {
      ok: false,
      message: videoTaskText("validation.happyHorse.promptRequired")
    };
  }
  const _0x26757e = Array.from(new Set((Array.isArray(images) ? images : []).map(_0x584c6d => String(_0x584c6d || "").trim()).filter(Boolean)));
  const _0x2d8228 = Array.from(new Set((Array.isArray(videos) ? videos : []).map(_0x2ecd9a => String(_0x2ecd9a || "").trim()).filter(Boolean)));
  const _0x181fe9 = normalizeHappyHorseMode(mode);
  const _0x195da2 = _0x26757e.length > 0 || _0x2d8228.length > 0;
  const _0x480a72 = {
    ok: true,
    images: [],
    videos: [],
    inputUrls: [],
    mode: "auto"
  };
  const _0x2e626b = assetVideoCount > 0 ? videoTaskText("validation.removePromptVideoRefs") : "";
  if (_0x181fe9 === "auto") {
    if (_0x195da2) {
      return {
        ok: false,
        message: videoTaskText("validation.happyHorse.chooseMode")
      };
    }
    return _0x480a72;
  }
  if (_0x181fe9 === "image") {
    if (_0x2d8228.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.imageModeRejectsVideo", {
          hint: _0x2e626b
        })
      };
    }
    if (!_0x26757e[0]) {
      if (!_0x195da2) {
        return _0x480a72;
      }
      return {
        ok: false,
        message: videoTaskText("validation.imageModeNeedsFirstFrame")
      };
    }
    return {
      ok: true,
      images: _0x26757e.slice(0, 1),
      videos: [],
      inputUrls: _0x26757e.slice(0, 1),
      mode: "image"
    };
  }
  if (_0x181fe9 === "reference") {
    if (_0x2d8228.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.referenceImageModeRejectsVideo", {
          hint: _0x2e626b
        })
      };
    }
    if (_0x26757e.length <= 0) {
      if (!_0x195da2) {
        return _0x480a72;
      }
      return {
        ok: false,
        message: videoTaskText("validation.referenceImageModeNeedsReference")
      };
    }
    const _0x4da43f = _0x26757e.slice(0, 9);
    return {
      ok: true,
      images: _0x4da43f,
      videos: [],
      inputUrls: _0x4da43f,
      mode: "reference"
    };
  }
  if (supportsEdit === false) {
    return {
      ok: false,
      message: videoTaskText("validation.happyHorse.editUnsupported")
    };
  }
  if (!_0x2d8228[0]) {
    if (!_0x195da2) {
      return _0x480a72;
    }
    return {
      ok: false,
      message: videoTaskText("validation.videoEditNeedsVideo")
    };
  }
  const _0x8949b6 = _0x2d8228[0];
  const _0x6a766 = (Array.isArray(videoEntries) ? videoEntries : []).find(_0x437188 => String(_0x437188?.url || "").trim() === _0x8949b6) || {};
  const _0x56fbbc = Number.isFinite(Number(maxVideoSeconds)) && Number(maxVideoSeconds) > 0 ? Number(maxVideoSeconds) : HAPPYHORSE_VIDEO_INPUT_MAX_SECONDS;
  if (normalizePositiveNumber(_0x6a766.duration) > _0x56fbbc) {
    return {
      ok: false,
      message: videoTaskText("validation.happyHorse.editVideoMaxSeconds", {
        seconds: _0x56fbbc
      })
    };
  }
  return {
    ok: true,
    images: _0x26757e.slice(0, 5),
    videos: [_0x8949b6],
    inputUrls: _0x26757e.slice(0, 5),
    mode: "edit"
  };
}
function orderHappyHorseImageUrls({
  mode = "auto",
  images = [],
  slotUrls = {}
} = {}) {
  const _0x3806a2 = [];
  const _0x357168 = _0x29312d => {
    const _0x3e0bec = String(_0x29312d || "").trim();
    if (_0x3e0bec && !_0x3806a2.includes(_0x3e0bec)) {
      _0x3806a2.push(_0x3e0bec);
    }
  };
  const _0x187648 = normalizeHappyHorseMode(mode);
  if (_0x187648 === "image") {
    _0x357168(slotUrls.firstFrame);
  }
  if (_0x187648 === "reference") {
    _0x357168(slotUrls.referenceImage);
  }
  if (_0x187648 === "edit") {
    _0x357168(slotUrls.editRefImage);
  }
  (Array.isArray(images) ? images : []).forEach(_0x357168);
  return _0x3806a2;
}
function buildWan27MediaPayload({
  mode = "image",
  images = [],
  videos = [],
  audios = [],
  videoEntries = [],
  audioEntries = [],
  assetVideoCount = 0
} = {}) {
  const _0x276174 = _0x28910f => Array.from(new Set((Array.isArray(_0x28910f) ? _0x28910f : []).map(_0x2ca52d => String(_0x2ca52d || "").trim()).filter(Boolean)));
  const _0x340f3a = normalizeWan27Mode(mode);
  const _0x3cee5c = _0x276174(images);
  const _0x356b97 = _0x276174(videos);
  const _0x3d6cbe = _0x276174(audios);
  const _0x31a6a7 = assetVideoCount > 0 ? videoTaskText("validation.removePromptVideoRefs") : "";
  const _0x47233e = (_0xa99d0e, _0x35aa46) => (Array.isArray(_0xa99d0e) ? _0xa99d0e : []).find(_0x45bb03 => String(_0x45bb03?.url || "").trim() === _0x35aa46) || {};
  const _0x4b5e59 = _0x3cb812 => {
    if (!_0x3cb812) {
      return null;
    }
    const _0xeba68f = _0x47233e(audioEntries, _0x3cb812);
    const _0x2fe6e1 = normalizePositiveNumber(_0xeba68f.duration);
    if (_0x2fe6e1 > 0 && (_0x2fe6e1 < WAN27_AUDIO_INPUT_MIN_SECONDS || _0x2fe6e1 > WAN27_AUDIO_INPUT_MAX_SECONDS)) {
      return videoTaskText("validation.wan27.audioDuration");
    }
    if (normalizePositiveNumber(_0xeba68f.sizeBytes) > WAN27_AUDIO_INPUT_MAX_BYTES) {
      return videoTaskText("validation.wan27.audioSize");
    }
    return null;
  };
  const _0x1dcac5 = _0xa19f2f => normalizePositiveNumber(_0x47233e(videoEntries, _0xa19f2f).duration);
  if (_0x340f3a === "video") {
    if (_0x3cee5c.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.videoExtendRejectsImage", {
          hint: _0x31a6a7
        })
      };
    }
    if (_0x3d6cbe.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.videoExtendRejectsAudio")
      };
    }
    if (!_0x356b97[0]) {
      return {
        ok: true,
        images: [],
        videos: [],
        audios: [],
        inputUrls: []
      };
    }
    if (_0x1dcac5(_0x356b97[0]) > WAN27_VIDEO_EXTEND_MAX_SECONDS) {
      return {
        ok: false,
        message: videoTaskText("validation.wan27.extendMaxSeconds")
      };
    }
    return {
      ok: true,
      images: [],
      videos: _0x356b97.slice(0, 1),
      audios: [],
      inputUrls: []
    };
  }
  if (_0x340f3a === "reference") {
    const _0x5417ee = _0x3cee5c.slice(0, 1);
    const _0xe07b41 = _0x356b97.slice(0, 1);
    if (_0x5417ee.length <= 0 && _0xe07b41.length <= 0) {
      return {
        ok: false,
        message: videoTaskText("validation.referenceVideoNeedsMedia")
      };
    }
    if (_0xe07b41[0] && _0x1dcac5(_0xe07b41[0]) > WAN27_REFERENCE_VIDEO_MAX_SECONDS) {
      return {
        ok: false,
        message: videoTaskText("validation.wan27.referenceVideoMaxSeconds")
      };
    }
    const _0x55e10a = _0x3d6cbe[0] || "";
    const _0x128276 = _0x4b5e59(_0x55e10a);
    if (_0x128276) {
      return {
        ok: false,
        message: _0x128276
      };
    }
    if (_0x55e10a && _0x5417ee.length <= 0) {
      return {
        ok: false,
        message: videoTaskText("validation.referenceAudioNeedsImage")
      };
    }
    return {
      ok: true,
      images: _0x5417ee,
      videos: _0xe07b41,
      audios: _0x55e10a ? [_0x55e10a] : [],
      inputUrls: _0x5417ee
    };
  }
  if (_0x340f3a === "edit") {
    if (!_0x356b97[0]) {
      return {
        ok: false,
        message: videoTaskText("validation.videoEditNeedsSourceVideo")
      };
    }
    if (_0x3cee5c.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.videoEditRejectsImageUseReferenceVideo")
      };
    }
    if (_0x3d6cbe.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.videoEditRejectsAudio")
      };
    }
    const _0x34a594 = _0x1dcac5(_0x356b97[0]);
    if (_0x34a594 > 0 && (_0x34a594 < WAN27_EDIT_VIDEO_MIN_SECONDS || _0x34a594 > WAN27_EDIT_VIDEO_MAX_SECONDS)) {
      return {
        ok: false,
        message: videoTaskText("validation.wan27.editVideoDuration")
      };
    }
    return {
      ok: true,
      images: [],
      videos: _0x356b97.slice(0, 2),
      audios: [],
      inputUrls: []
    };
  }
  if (_0x356b97.length > 0) {
    return {
      ok: false,
      message: videoTaskText("validation.imageModeRejectsVideo", {
        hint: _0x31a6a7
      })
    };
  }
  const _0x299c61 = _0x3d6cbe[0] || "";
  const _0x35ff38 = _0x4b5e59(_0x299c61);
  if (_0x35ff38) {
    return {
      ok: false,
      message: _0x35ff38
    };
  }
  const _0x13fae1 = _0x3cee5c.slice(0, 2);
  return {
    ok: true,
    images: _0x13fae1,
    videos: [],
    audios: _0x299c61 ? [_0x299c61] : [],
    inputUrls: _0x13fae1
  };
}
function buildKlingV3OmniMediaPayload({
  mode = "image",
  images = [],
  videos = [],
  videoEntries = [],
  assetVideoCount = 0
} = {}) {
  const _0x23a58d = _0x225df0 => Array.from(new Set((Array.isArray(_0x225df0) ? _0x225df0 : []).map(_0x1faae7 => String(_0x1faae7 || "").trim()).filter(Boolean)));
  const _0x21d617 = normalizeKlingV3OmniMode(mode);
  const _0x66bc72 = _0x23a58d(images);
  const _0x23f1f2 = _0x23a58d(videos);
  const _0x34b034 = assetVideoCount > 0 ? videoTaskText("validation.removePromptVideoRefs") : "";
  const _0x177e53 = _0x1bc9a2 => normalizePositiveNumber((Array.isArray(videoEntries) ? videoEntries : []).find(_0x13c6f6 => String(_0x13c6f6?.url || "").trim() === _0x1bc9a2)?.duration);
  if (_0x21d617 === "reference") {
    const _0x3ad0f1 = _0x66bc72.slice(0, 1);
    const _0x4cb5bc = _0x23f1f2.slice(0, 1);
    if (_0x3ad0f1.length <= 0 && _0x4cb5bc.length <= 0) {
      return {
        ok: false,
        message: videoTaskText("validation.referenceVideoNeedsMedia")
      };
    }
    return {
      ok: true,
      images: _0x3ad0f1,
      videos: _0x4cb5bc,
      audios: [],
      inputUrls: _0x3ad0f1
    };
  }
  if (_0x21d617 === "edit") {
    if (!_0x23f1f2[0]) {
      return {
        ok: false,
        message: videoTaskText("validation.videoEditNeedsSourceVideo")
      };
    }
    if (_0x66bc72.length > 0) {
      return {
        ok: false,
        message: videoTaskText("validation.videoEditRejectsImage")
      };
    }
    const _0x9affde = _0x177e53(_0x23f1f2[0]);
    if (_0x9affde > 0 && (_0x9affde < KLING_V3_OMNI_VIDEO_MIN_SECONDS || _0x9affde > KLING_V3_OMNI_EDIT_VIDEO_MAX_SECONDS)) {
      return {
        ok: false,
        message: videoTaskText("validation.klingV3Omni.editVideoDuration")
      };
    }
    return {
      ok: true,
      images: [],
      videos: _0x23f1f2.slice(0, 1),
      audios: [],
      inputUrls: []
    };
  }
  if (_0x23f1f2.length > 0) {
    return {
      ok: false,
      message: videoTaskText("validation.imageModeRejectsVideo", {
        hint: _0x34b034
      })
    };
  }
  return {
    ok: true,
    images: _0x66bc72.slice(0, 2),
    videos: [],
    audios: [],
    inputUrls: _0x66bc72.slice(0, 2)
  };
}
function replaceKlingO1PromptImageReferences(_0x570460, _0x253670) {
  const _0x349e21 = Math.max(0, Math.trunc(Number(_0x253670) || 0));
  if (_0x349e21 <= 0) {
    return String(_0x570460 || "");
  }
  return String(_0x570460 || "").replace(/@?图片\s*([1-9]\d*)/g, (_0x2b0bb4, _0x1af819) => {
    const _0x21aa4a = Number.parseInt(String(_0x1af819 || ""), 10);
    if (!Number.isFinite(_0x21aa4a) || _0x21aa4a < 1 || _0x21aa4a > _0x349e21) {
      return _0x2b0bb4;
    }
    return "<<<image_" + _0x21aa4a + ">>>";
  });
}
function buildKlingO1MediaPayload({
  prompt = "",
  images = [],
  videos = [],
  videoEntries = [],
  videoRole = "",
  hasEditVideo = false,
  hasFeatureVideo = false
} = {}) {
  const _0x54f25b = _0x421fb2 => Array.from(new Set((Array.isArray(_0x421fb2) ? _0x421fb2 : []).map(_0x134b8d => String(_0x134b8d || "").trim()).filter(Boolean)));
  const _0x288d91 = _0x54f25b(images);
  const _0x12a6be = _0x54f25b(videos);
  const _0x4c3c90 = String(videoRole || "").trim() === "feature" ? "feature" : "base";
  const _0x27743c = _0x4a89c5 => normalizePositiveNumber((Array.isArray(videoEntries) ? videoEntries : []).find(_0x29c1f2 => String(_0x29c1f2?.url || "").trim() === _0x4a89c5)?.duration);
  if (hasEditVideo && hasFeatureVideo) {
    return {
      ok: false,
      message: videoTaskText("validation.klingO1.editAndFeatureExclusive")
    };
  }
  if (_0x12a6be.length > 1) {
    return {
      ok: false,
      message: videoTaskText("validation.klingO1.onlyOneVideo")
    };
  }
  const _0x207727 = _0x12a6be[0] || "";
  if (_0x207727) {
    const _0x4983e8 = _0x27743c(_0x207727);
    if (_0x4983e8 > 0 && (_0x4983e8 < KLING_O1_VIDEO_MIN_SECONDS || _0x4983e8 > KLING_O1_VIDEO_MAX_SECONDS)) {
      return {
        ok: false,
        message: videoTaskText("validation.klingO1.referenceVideoDuration")
      };
    }
    if (_0x4c3c90 === "base") {
      if (_0x288d91.length > 0) {
        return {
          ok: false,
          message: videoTaskText("validation.klingO1.editVideoRejectsImage")
        };
      }
      return {
        ok: true,
        prompt: replaceKlingO1PromptImageReferences(prompt, 0),
        images: [],
        videos: [_0x207727],
        inputUrls: [],
        videoRole: "base"
      };
    }
    if (_0x288d91.length > 1) {
      return {
        ok: false,
        message: videoTaskText("validation.klingO1.featureVideoMaxOneImage")
      };
    }
    const _0x598950 = _0x288d91.slice(0, 1);
    return {
      ok: true,
      prompt: replaceKlingO1PromptImageReferences(prompt, _0x598950.length),
      images: _0x598950,
      videos: [_0x207727],
      inputUrls: _0x598950,
      videoRole: "feature"
    };
  }
  const _0x2d0048 = _0x288d91.slice(0, 2);
  return {
    ok: true,
    prompt: replaceKlingO1PromptImageReferences(prompt, _0x2d0048.length),
    images: _0x2d0048,
    videos: [],
    inputUrls: _0x2d0048,
    videoRole: ""
  };
}
function failure(_0x48405f) {
  return {
    ok: false,
    message: String(_0x48405f || "").trim(),
    payload: null
  };
}
function success(_0x2b909b) {
  return {
    ok: true,
    message: "",
    payload: _0x2b909b
  };
}
export function validateModelApiVideoPrompt({
  model = "",
  provider = "",
  prompt = ""
} = {}) {
  if (isHappyHorseModelApiVideo(model, provider) && !String(prompt || "").trim()) {
    return failure(videoTaskText("validation.happyHorse.promptRequired"));
  }
  return {
    ok: true,
    message: ""
  };
}
export function buildSubmitRandomizedSeedPatch({
  modelManifest = null,
  nodeData = {},
  payload = {},
  random = Math.random
} = {}) {
  const _0x47af37 = Array.isArray(modelManifest?.uiSchema?.fields) ? modelManifest.uiSchema.fields : [];
  const _0x1c2213 = _0x47af37.filter(_0x31ced7 => {
    const _0x1bd148 = String(_0x31ced7?.id || "").trim();
    return _0x31ced7?.randomizeOnSubmit === true && _0x1bd148 && String(_0x31ced7?.variant || "") === "randomSeedRow";
  });
  if (_0x1c2213.length === 0) {
    return null;
  }
  let _0x849c = {
    ...getPlainObject(nodeData?.generationParams),
    ...getPlainObject(payload?.generationParams)
  };
  let _0xffda1c = null;
  let _0x268dbf = false;
  _0x1c2213.forEach(_0x33fe85 => {
    const _0x25a1ea = String(_0x33fe85?.id || "").trim();
    const _0x321011 = String(_0x33fe85?.randomSeedModeField || "").trim();
    const _0x2cbfab = String(_0x33fe85?.randomSeedDefaultMode || "fixed").trim() || "fixed";
    const _0x410b09 = _0x321011 && Object.prototype.hasOwnProperty.call(_0x849c, _0x321011) ? _0x849c[_0x321011] : _0x2cbfab;
    const _0x41c793 = String(_0x410b09 ?? _0x2cbfab).trim().toLowerCase() === "random" ? "random" : "fixed";
    if (_0x41c793 !== "random") {
      return;
    }
    const _0x4318cf = Number(_0x33fe85?.randomSeedMin ?? _0x33fe85?.min);
    const _0x1ef644 = Number(_0x33fe85?.randomSeedMax ?? _0x33fe85?.max);
    const _0x276c31 = Number.isFinite(_0x4318cf) ? Math.trunc(_0x4318cf) : 0;
    const _0xde1a06 = Number.isFinite(_0x1ef644) ? Math.trunc(_0x1ef644) : 2147483647;
    const _0x493b53 = Math.min(_0x276c31, _0xde1a06);
    const _0x3d7568 = Math.max(_0x276c31, _0xde1a06);
    const _0x307ce8 = String(_0x493b53 + Math.floor(random() * (_0x3d7568 - _0x493b53 + 1)));
    _0x849c = {
      ..._0x849c,
      [_0x25a1ea]: _0x307ce8,
      ...(_0x321011 ? {
        [_0x321011]: "random"
      } : {})
    };
    _0xffda1c = {
      ...(_0xffda1c || _0x849c),
      [_0x25a1ea]: _0x307ce8,
      ...(_0x321011 ? {
        [_0x321011]: "fixed"
      } : {})
    };
    _0x268dbf = true;
  });
  if (!_0x268dbf) {
    return null;
  }
  const _0x4545ac = String(payload?.model || nodeData?.model || modelManifest?.modelId || "").trim();
  const _0x26e182 = {
    generationParams: _0x849c
  };
  if (_0x4545ac) {
    _0x26e182.generationParamsByModel = {
      ...getPlainObject(nodeData?.generationParamsByModel),
      [_0x4545ac]: _0x849c
    };
  }
  return {
    requestParams: _0xffda1c || _0x849c,
    storePatch: _0x26e182
  };
}
export function compileModelApiVideoSubmit({
  payload = {},
  model = "",
  provider = "",
  nodeData = {},
  modelExecution = null,
  inputMaterials = {},
  assetInputRefs = [],
  assetVideoCount = 0,
  inEdges = [],
  nodes = {}
} = {}) {
  const _0x528d8f = modelExecution?.modelManifest || null;
  const {
    images: _0x28d6ef,
    imageRefs: _0x2310a2,
    imageEntries: _0x25a1d0,
    videos: _0x12b9ab,
    videoRefs: _0x29720b,
    videoEntries: _0x138a8c,
    audios: _0x3d2f4c,
    audioEntries: _0x252247,
    providerAssetRefs: _0x5434b2
  } = resolveModelApiVideoInputMaterials({
    inputMaterials: inputMaterials,
    modelManifest: _0x528d8f,
    nodeData: nodeData
  });
  const _0x1c29e5 = validateModelMediaInputLimits({
    inputSlots: _0x528d8f?.inputSlots || null,
    images: _0x28d6ef,
    imageEntries: _0x25a1d0,
    videos: _0x12b9ab,
    audios: _0x3d2f4c,
    videoEntries: _0x138a8c,
    audioEntries: _0x252247
  });
  if (!_0x1c29e5.ok) {
    const _0x1134af = String(_0x1c29e5?.code || "").trim();
    return failure(_0x1134af ? videoTaskText("validation.mediaInputLimits." + _0x1134af, {
      min: _0x1c29e5.min,
      max: _0x1c29e5.max,
      actual: _0x1c29e5.actual,
      allowed: _0x1c29e5.allowed
    }) : "");
  }
  applyVideoNodeAdaptiveAspectRatio(payload, {
    inEdges: inEdges,
    nodes: nodes,
    nodeData: nodeData,
    provider: provider,
    model: model,
    modelManifest: _0x528d8f
  });
  const _0x3da62d = getFixedInputSlotConfigFromManifest(nodeData || {});
  if (isHappyHorseModelApiVideo(model, provider)) {
    const _0x4cdc43 = getHappyHorseMode(nodeData);
    const _0x41934c = buildVideoInputUrlsByFixedImageSlot({
      fixedInputConfig: _0x3da62d,
      imageRefs: _0x2310a2,
      assetInputRefs: assetInputRefs
    });
    const _0x498353 = buildHappyHorseMediaPayload({
      prompt: payload.prompt,
      mode: _0x4cdc43,
      images: orderHappyHorseImageUrls({
        mode: _0x4cdc43,
        images: _0x28d6ef,
        slotUrls: _0x41934c
      }),
      videos: _0x12b9ab,
      videoEntries: _0x138a8c,
      assetVideoCount: assetVideoCount,
      maxVideoSeconds: getModelApiVideoMaxInputVideoSeconds(model, provider, HAPPYHORSE_VIDEO_INPUT_MAX_SECONDS),
      supportsEdit: supportsHappyHorseModelApiVideoEdit(model, provider)
    });
    if (!_0x498353.ok) {
      return failure(_0x498353.message);
    }
    payload.generationParams = {
      ...payload.generationParams,
      happyhorse_mode: _0x498353.mode || _0x4cdc43
    };
    payload.images = _0x498353.images;
    payload.videos = _0x498353.videos;
    payload.audios = [];
    payload.inputUrls = _0x498353.inputUrls;
    return success(payload);
  }
  if (isWan27ModelApiVideo(model, provider)) {
    const _0x1dfef9 = getWan27Mode(nodeData);
    const _0x2d3ea8 = buildVideoInputUrlsByFixedKindSlot({
      fixedInputConfig: _0x3da62d,
      refs: _0x29720b,
      assetInputRefs: assetInputRefs,
      kind: "video"
    });
    const _0x207e3a = [];
    const _0x515cf0 = _0x3986c1 => {
      const _0x4f3ca4 = String(_0x3986c1 || "").trim();
      if (_0x4f3ca4 && !_0x207e3a.includes(_0x4f3ca4)) {
        _0x207e3a.push(_0x4f3ca4);
      }
    };
    if (_0x1dfef9 === "video") {
      _0x515cf0(_0x2d3ea8.sourceVideo);
    }
    if (_0x1dfef9 === "reference") {
      _0x515cf0(_0x2d3ea8.referenceVideo);
    }
    if (_0x1dfef9 === "edit") {
      _0x515cf0(_0x2d3ea8.originalVideo);
      _0x515cf0(_0x2d3ea8.referenceVideo);
    }
    _0x12b9ab.forEach(_0x515cf0);
    const _0x3f3f06 = buildWan27MediaPayload({
      mode: _0x1dfef9,
      images: _0x28d6ef,
      videos: _0x207e3a,
      audios: _0x3d2f4c,
      videoEntries: _0x138a8c,
      audioEntries: _0x252247,
      assetVideoCount: assetVideoCount
    });
    if (!_0x3f3f06.ok) {
      return failure(_0x3f3f06.message);
    }
    payload.generationParams = {
      ...payload.generationParams,
      wan27_mode: _0x1dfef9
    };
    payload.images = _0x3f3f06.images;
    payload.videos = _0x3f3f06.videos;
    payload.audios = _0x3f3f06.audios;
    payload.inputUrls = _0x3f3f06.inputUrls;
    if (_0x1dfef9 === "image" || _0x1dfef9 === "reference") {
      const _0x36c79c = buildVideoInputUrlsByFixedImageSlot({
        fixedInputConfig: _0x3da62d,
        imageRefs: _0x2310a2,
        assetInputRefs: assetInputRefs
      });
      if (Object.keys(_0x36c79c).length > 0) {
        payload.inputUrlsBySlot = _0x36c79c;
      }
    }
    return success(payload);
  }
  if (isCanonicalProviderModel(model, provider, APIMART_KLING_V3_OMNI_MODEL_ID)) {
    const _0x4a13f6 = getKlingV3OmniMode(nodeData);
    const _0x3075b2 = buildVideoInputUrlsByFixedImageSlot({
      fixedInputConfig: _0x3da62d,
      imageRefs: _0x2310a2,
      assetInputRefs: assetInputRefs
    });
    const _0x572607 = [];
    const _0xe50b8d = _0x5e91df => {
      const _0xa1d464 = String(_0x5e91df || "").trim();
      if (_0xa1d464 && !_0x572607.includes(_0xa1d464)) {
        _0x572607.push(_0xa1d464);
      }
    };
    if (_0x4a13f6 === "image") {
      _0xe50b8d(_0x3075b2.firstFrame);
      _0xe50b8d(_0x3075b2.lastFrame);
    }
    if (_0x4a13f6 === "reference") {
      _0xe50b8d(_0x3075b2.referenceImage);
    }
    _0x28d6ef.forEach(_0xe50b8d);
    const _0xf84d65 = buildVideoInputUrlsByFixedKindSlot({
      fixedInputConfig: _0x3da62d,
      refs: _0x29720b,
      assetInputRefs: assetInputRefs,
      kind: "video"
    });
    const _0x5b6949 = [];
    const _0x14513a = _0x94a75a => {
      const _0x1b22e6 = String(_0x94a75a || "").trim();
      if (_0x1b22e6 && !_0x5b6949.includes(_0x1b22e6)) {
        _0x5b6949.push(_0x1b22e6);
      }
    };
    if (_0x4a13f6 === "reference") {
      _0x14513a(_0xf84d65.referenceVideo);
    }
    if (_0x4a13f6 === "edit") {
      _0x14513a(_0xf84d65.editVideo);
    }
    _0x12b9ab.forEach(_0x14513a);
    const _0x441b8e = buildKlingV3OmniMediaPayload({
      mode: _0x4a13f6,
      images: _0x572607,
      videos: _0x5b6949,
      videoEntries: _0x138a8c,
      assetVideoCount: assetVideoCount
    });
    if (!_0x441b8e.ok) {
      return failure(_0x441b8e.message);
    }
    payload.generationParams = {
      ...payload.generationParams,
      kling_v3_omni_mode: _0x4a13f6
    };
    payload.images = _0x441b8e.images;
    payload.videos = _0x441b8e.videos;
    payload.audios = [];
    payload.inputUrls = _0x441b8e.inputUrls;
    if (_0x4a13f6 === "image" || _0x4a13f6 === "reference") {
      const _0x5e80d0 = {};
      if (_0x4a13f6 === "image") {
        if (_0x3075b2.firstFrame) {
          _0x5e80d0.firstFrame = _0x3075b2.firstFrame;
        }
        if (_0x3075b2.lastFrame) {
          _0x5e80d0.lastFrame = _0x3075b2.lastFrame;
        }
      } else if (_0x3075b2.referenceImage) {
        _0x5e80d0.referenceImage = _0x3075b2.referenceImage;
      }
      if (Object.keys(_0x5e80d0).length > 0) {
        payload.inputUrlsBySlot = _0x5e80d0;
      }
    }
    return success(payload);
  }
  if (isCanonicalProviderModel(model, provider, APIMART_KLING_O1_MODEL_ID)) {
    const _0x5912ca = buildVideoInputUrlsByFixedImageSlot({
      fixedInputConfig: _0x3da62d,
      imageRefs: _0x2310a2,
      assetInputRefs: assetInputRefs
    });
    const _0x3909a3 = [];
    const _0xbca9ca = _0x4cbf0b => {
      const _0x11b21c = String(_0x4cbf0b || "").trim();
      if (_0x11b21c && !_0x3909a3.includes(_0x11b21c)) {
        _0x3909a3.push(_0x11b21c);
      }
    };
    _0xbca9ca(_0x5912ca.referenceImage);
    _0x28d6ef.forEach(_0xbca9ca);
    const _0x47456d = buildVideoInputUrlsByFixedKindSlot({
      fixedInputConfig: _0x3da62d,
      refs: _0x29720b,
      assetInputRefs: assetInputRefs,
      kind: "video"
    });
    const _0x13a35c = Boolean(_0x47456d.editVideo);
    const _0x2afdb2 = Boolean(_0x47456d.featureReferenceVideo);
    const _0x1f4bdc = [];
    const _0x450137 = _0x475d2e => {
      const _0x3e5ef4 = String(_0x475d2e || "").trim();
      if (_0x3e5ef4 && !_0x1f4bdc.includes(_0x3e5ef4)) {
        _0x1f4bdc.push(_0x3e5ef4);
      }
    };
    _0x450137(_0x47456d.editVideo);
    _0x450137(_0x47456d.featureReferenceVideo);
    _0x12b9ab.forEach(_0x450137);
    const _0x1a9b9a = buildKlingO1MediaPayload({
      prompt: payload.prompt,
      images: _0x3909a3,
      videos: _0x1f4bdc,
      videoEntries: _0x138a8c,
      videoRole: _0x2afdb2 ? "feature" : "base",
      hasEditVideo: _0x13a35c,
      hasFeatureVideo: _0x2afdb2
    });
    if (!_0x1a9b9a.ok) {
      return failure(_0x1a9b9a.message);
    }
    payload.prompt = _0x1a9b9a.prompt;
    payload.images = _0x1a9b9a.images;
    payload.videos = _0x1a9b9a.videos;
    payload.audios = [];
    payload.inputUrls = _0x1a9b9a.inputUrls;
    if (_0x1a9b9a.videoRole) {
      payload.klingO1VideoRole = _0x1a9b9a.videoRole;
    } else {
      delete payload.klingO1VideoRole;
    }
    return success(payload);
  }
  payload.images = _0x28d6ef;
  payload.videos = _0x12b9ab;
  payload.audios = _0x3d2f4c;
  payload.inputUrls = _0x28d6ef;
  if (_0x5434b2.length > 0) {
    payload.providerAssetRefs = _0x5434b2;
  }
  const _0x1d53da = buildVideoInputUrlsByFixedImageSlot({
    fixedInputConfig: _0x3da62d,
    imageRefs: _0x2310a2,
    assetInputRefs: assetInputRefs
  });
  if (Object.keys(_0x1d53da).length > 0) {
    payload.inputUrlsBySlot = _0x1d53da;
  }
  const _0x5e94f5 = getMissingManifestInputRequirement({
    inputSlots: _0x528d8f?.inputSlots || null,
    inputCounts: {
      text: String(payload.prompt || "").trim() ? 1 : 0,
      image: payload.images.length,
      video: payload.videos.length,
      audio: payload.audios.length
    }
  });
  if (_0x5e94f5) {
    return failure(t("modelInputPolicy.required", {
      min: _0x5e94f5.required,
      type: t("modelInputPolicy.inputKinds." + _0x5e94f5.kind)
    }));
  }
  return success(payload);
}