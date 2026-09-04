import { isDreaminaStyleVideoModel, normalizeDreaminaVideoRouteMode } from "./dreaminaVideoModelHelper.js";
import { PERSON_REPLACE_V3_MODEL_ID, PERSON_REPLACE_V21_MODEL_ID, QWEN_IMAGE_EDIT_MODEL_ID, getModelManifest, normalizeProviderId, resolveModelExecution, resolveModelProvider } from "../manifests/index.js";
import { isHappyHorseModelApiVideo, isSeedance2ModelApiVideo } from "./modelApiVideoResolverPolicy.js";
import { t } from "../i18n/index.js";
export const INPUT_KIND_ORDER = Object.freeze(["text", "image", "video", "audio"]);
export const INPUT_KIND_LABELS = Object.freeze({
  text: "文本",
  image: "图片",
  video: "视频",
  audio: "音频"
});
function modelInputPolicyText(_0x1ccf94, _0x3bb75f = {}) {
  return t("modelInputPolicy." + _0x1ccf94, _0x3bb75f);
}
export function getInputKindLabel(_0x15dc80) {
  const _0xe4c7a2 = normalizeInputKind(_0x15dc80);
  if (!_0xe4c7a2) {
    return modelInputPolicyText("inputKinds.material");
  }
  return modelInputPolicyText("inputKinds." + _0xe4c7a2);
}
export const RH_PERSON_REPLACE_V21_MODEL = PERSON_REPLACE_V21_MODEL_ID;
export const RH_QWEN_IMAGE_EDIT_MODEL = QWEN_IMAGE_EDIT_MODEL_ID;
const APIMART_WAN27_MODEL_ID = "apimart/wan2.7";
const APIMART_KLING_V3_OMNI_MODEL_ID = "apimart/kling-v3-omni";
const APIMART_VIDU_Q3_MODEL_ID = "apimart/viduq3";
const RH_PERSON_REPLACE_FIXED_IMAGE_SLOTS = Object.freeze(["replaceTarget", "replacedImage"]);
const INPUT_TARGET_NODE_TYPES = new Set(["ai-image", "ai-video", "ai-audio", "ai-text", "group", "media-clip", "panorama-360", "panorama_360", "panorama360", "storyboard", "storyboard-script", "whiteboard"]);
function normalizeText(_0x1cb204) {
  return String(_0x1cb204 || "").trim();
}
export function isRhPersonReplaceV3Model(_0x5b899b) {
  return getModelManifest(_0x5b899b)?.modelId === PERSON_REPLACE_V3_MODEL_ID;
}
function hasExactPersonReplaceFixedImageSlotCapability(_0x594189) {
  const _0x5ddaf9 = _0x594189?.capabilities?.fixedImageSlots;
  return Array.isArray(_0x5ddaf9) && _0x5ddaf9.length === RH_PERSON_REPLACE_FIXED_IMAGE_SLOTS.length && _0x5ddaf9.every((_0x35c284, _0x526e79) => _0x35c284 === RH_PERSON_REPLACE_FIXED_IMAGE_SLOTS[_0x526e79]);
}
function hasPersonReplaceFixedImageInputSlots(_0x2484ea) {
  const _0xd63c1e = _0x2484ea?.inputSlots?.fixedSlots;
  if (!Array.isArray(_0xd63c1e)) {
    return false;
  }
  return RH_PERSON_REPLACE_FIXED_IMAGE_SLOTS.every(_0x10bb25 => _0xd63c1e.some(_0x410324 => _0x410324?.id === _0x10bb25 && _0x410324?.kind === "image"));
}
function isDreaminaManifestOrModel(_0x33aab0, _0x21ba99 = "") {
  return resolveTargetProvider(_0x33aab0, _0x21ba99) === "dreamina";
}
function isHappyHorseVideoModel(_0x18e1dd, _0x4fb7b9 = "") {
  return isHappyHorseModelApiVideo(_0x18e1dd, _0x4fb7b9);
}
function isSeedance2VideoModel(_0x4cd97e, _0x254404 = "") {
  return isSeedance2ModelApiVideo(_0x4cd97e, _0x254404);
}
function isApimartWan27VideoModel(_0x1ca0b2, _0x245a85 = "") {
  const _0x211489 = resolveModelExecution(_0x1ca0b2, {
    providerHint: _0x245a85
  }) || resolveModelExecution(_0x1ca0b2);
  const _0x99f500 = _0x211489?.modelManifest || getModelManifest(_0x1ca0b2);
  const _0x5aa524 = normalizeText(_0x211489?.canonicalModelId || _0x99f500?.modelId || _0x1ca0b2);
  if (_0x5aa524 !== APIMART_WAN27_MODEL_ID) {
    return false;
  }
  const _0x22dbd5 = normalizeProviderId(_0x99f500?.provider) || resolveTargetProvider(_0x1ca0b2, _0x245a85);
  return !_0x22dbd5 || _0x22dbd5 === "apimart";
}
function isApimartKlingV3OmniVideoModel(_0x1b03ee, _0x2a8f50 = "") {
  const _0x39890a = resolveModelExecution(_0x1b03ee, {
    providerHint: _0x2a8f50
  }) || resolveModelExecution(_0x1b03ee);
  const _0x5543d6 = _0x39890a?.modelManifest || getModelManifest(_0x1b03ee);
  const _0x56bfa3 = normalizeText(_0x39890a?.canonicalModelId || _0x5543d6?.modelId || _0x1b03ee);
  if (_0x56bfa3 !== APIMART_KLING_V3_OMNI_MODEL_ID) {
    return false;
  }
  const _0x24ebad = normalizeProviderId(_0x5543d6?.provider) || resolveTargetProvider(_0x1b03ee, _0x2a8f50);
  return !_0x24ebad || _0x24ebad === "apimart";
}
function isApimartViduQ3VideoModel(_0x40702f, _0x2b76fa = "") {
  const _0x431d5c = resolveModelExecution(_0x40702f, {
    providerHint: _0x2b76fa
  }) || resolveModelExecution(_0x40702f);
  const _0xeb2b64 = _0x431d5c?.modelManifest || getModelManifest(_0x40702f);
  const _0x2bd17b = normalizeText(_0x431d5c?.canonicalModelId || _0xeb2b64?.modelId || _0x40702f);
  if (_0x2bd17b !== APIMART_VIDU_Q3_MODEL_ID) {
    return false;
  }
  const _0x279ad5 = normalizeProviderId(_0xeb2b64?.provider) || resolveTargetProvider(_0x40702f, _0x2b76fa);
  return !_0x279ad5 || _0x279ad5 === "apimart";
}
function resolveTargetProvider(_0x6b3416, _0x8c50df = "") {
  const _0x1084d4 = normalizeProviderId(_0x8c50df);
  if (_0x1084d4) {
    return _0x1084d4;
  }
  return resolveModelProvider(_0x6b3416, "", {
    allowProviderHint: false,
    allowPrefixInference: false
  }) || normalizeProviderId(getModelManifest(_0x6b3416)?.provider);
}
export function isRhPersonReplaceWorkflowModel(_0x55f120) {
  const _0x143df3 = getModelManifest(_0x55f120);
  return _0x143df3?.kind === "image" && hasExactPersonReplaceFixedImageSlotCapability(_0x143df3) && hasPersonReplaceFixedImageInputSlots(_0x143df3);
}
export function isRhQwenImageEditModel(_0x21161e) {
  return normalizeText(_0x21161e) === RH_QWEN_IMAGE_EDIT_MODEL;
}
const VIDEO_PATH_RE = /\.(?:mp4|mov|m4v|webm|mkv|avi|mpeg|mpg|3gp)(?:[?#].*)?$/i;
const AUDIO_PATH_RE = /\.(?:mp3|wav|m4a|aac|flac|ogg|opus|wma)(?:[?#].*)?$/i;
const IMAGE_PATH_RE = /\.(?:png|jpe?g|webp|gif|bmp|tiff?|avif)(?:[?#].*)?$/i;
export function normalizeInputKind(_0x55c577) {
  const _0x1bddcf = _0x55c577 && typeof _0x55c577 === "object" ? normalizeText(_0x55c577.type) : normalizeText(_0x55c577);
  if (!_0x1bddcf) {
    return "";
  }
  if (_0x1bddcf === "text" || _0x1bddcf === "source-text" || _0x1bddcf === "ai-text") {
    return "text";
  }
  if (_0x1bddcf === "image" || _0x1bddcf === "source-image" || _0x1bddcf === "ai-image") {
    return "image";
  }
  if (_0x1bddcf === "video" || _0x1bddcf === "source-video" || _0x1bddcf === "ai-video") {
    return "video";
  }
  if (_0x1bddcf === "audio" || _0x1bddcf === "source-audio" || _0x1bddcf === "ai-audio") {
    return "audio";
  }
  if (_0x1bddcf.includes("text")) {
    return "text";
  }
  if (_0x1bddcf.includes("video")) {
    return "video";
  }
  if (_0x1bddcf.includes("audio")) {
    return "audio";
  }
  if (_0x1bddcf.includes("image")) {
    return "image";
  }
  return "";
}
function normalizeExplicitMediaKind(_0xd3ff79) {
  const _0x1f7e86 = normalizeText(_0xd3ff79).toLowerCase();
  if (!_0x1f7e86) {
    return "";
  }
  if (_0x1f7e86 === "text" || _0x1f7e86 === "source-text" || _0x1f7e86 === "ai-text") {
    return "text";
  }
  if (_0x1f7e86 === "image" || _0x1f7e86 === "source-image" || _0x1f7e86 === "ai-image" || _0x1f7e86 === "asset-image" || _0x1f7e86.startsWith("image/")) {
    return "image";
  }
  if (_0x1f7e86 === "video" || _0x1f7e86 === "source-video" || _0x1f7e86 === "ai-video" || _0x1f7e86 === "asset-video" || _0x1f7e86.startsWith("video/")) {
    return "video";
  }
  if (_0x1f7e86 === "audio" || _0x1f7e86 === "source-audio" || _0x1f7e86 === "ai-audio" || _0x1f7e86 === "asset-audio" || _0x1f7e86.startsWith("audio/")) {
    return "audio";
  }
  return "";
}
function hasPathLikeValue(_0x2608ef, _0x21bd6d, _0x353e71) {
  if (!_0x2608ef || typeof _0x2608ef !== "object") {
    return false;
  }
  return _0x21bd6d.some(_0x323670 => _0x353e71(normalizeText(_0x2608ef?.[_0x323670])));
}
function isVideoPath(_0xbc3409) {
  return VIDEO_PATH_RE.test(normalizeText(_0xbc3409));
}
function isAudioPath(_0x5c6c0c) {
  return AUDIO_PATH_RE.test(normalizeText(_0x5c6c0c));
}
function isImagePath(_0x12c23d) {
  return IMAGE_PATH_RE.test(normalizeText(_0x12c23d));
}
function hasExplicitKind(_0x30bccc, _0x126f49) {
  if (!_0x30bccc || typeof _0x30bccc !== "object") {
    return false;
  }
  const _0x54270b = ["kind", "mediaKind", "mediaTaskKind", "asyncTaskKind", "assetKind", "assetType", "mediaType", "mimeType"];
  return _0x54270b.some(_0x32ade3 => normalizeExplicitMediaKind(_0x30bccc?.[_0x32ade3]) === _0x126f49);
}
function hasVideoEvidence(_0x1c9b61 = {}, _0x39c013 = null) {
  if (!_0x1c9b61 || typeof _0x1c9b61 !== "object") {
    return false;
  }
  if (hasExplicitKind(_0x1c9b61, "video")) {
    return true;
  }
  const _0x38c5ac = Array.isArray(_0x1c9b61.videos) ? _0x1c9b61.videos : [];
  if (_0x38c5ac.some(_0x2b4d0b => getVideoSourceKey(_0x2b4d0b) || hasExplicitKind(_0x2b4d0b, "video"))) {
    return true;
  }
  if (hasPathLikeValue(_0x1c9b61, ["videoUrl", "videoLocalPath", "originalVideoUrl", "localPath", "originalLocalPath", "displayLocalPath", "src", "url", "resultUrl", "sourceUrl"], isVideoPath)) {
    return true;
  }
  return hasPathLikeValue(_0x39c013, ["sourceMediaKey", "videoUrl", "localPath"], isVideoPath);
}
function hasAudioEvidence(_0x166473 = {}, _0x19cb26 = null) {
  if (!_0x166473 || typeof _0x166473 !== "object") {
    return false;
  }
  if (hasExplicitKind(_0x166473, "audio")) {
    return true;
  }
  if (Array.isArray(_0x166473.audios) && _0x166473.audios.length > 0) {
    return true;
  }
  if (hasPathLikeValue(_0x166473, ["audioUrl", "audioLocalPath", "localPath", "originalLocalPath", "displayLocalPath", "src", "url", "resultUrl", "sourceUrl"], isAudioPath)) {
    return true;
  }
  return hasPathLikeValue(_0x19cb26, ["sourceMediaKey", "audioUrl", "localPath"], isAudioPath);
}
function hasImageEvidence(_0x57f011 = {}, _0x21ddfc = null) {
  if (!_0x57f011 || typeof _0x57f011 !== "object") {
    return false;
  }
  if (hasExplicitKind(_0x57f011, "image")) {
    return true;
  }
  if (Array.isArray(_0x57f011.images) && _0x57f011.images.length > 0) {
    return true;
  }
  if (_0x57f011.thumbId || _0x57f011.thumbUrl || _0x57f011.imageUrl || _0x57f011.posterLocalPath) {
    return true;
  }
  if (hasPathLikeValue(_0x57f011, ["imageUrl", "localPath", "originalLocalPath", "displayLocalPath", "src", "url", "resultUrl", "sourceUrl"], isImagePath)) {
    return true;
  }
  return hasPathLikeValue(_0x21ddfc, ["sourceMediaKey", "imageUrl", "localPath"], isImagePath);
}
export function resolveEffectiveInputKind(_0x49f968, _0x258cf5 = null) {
  if (!_0x49f968 || typeof _0x49f968 !== "object") {
    return normalizeInputKind(_0x49f968);
  }
  const _0x1f9f43 = normalizeInputKind(_0x49f968);
  if (hasVideoEvidence(_0x49f968, _0x258cf5)) {
    return "video";
  }
  if (hasAudioEvidence(_0x49f968, _0x258cf5)) {
    return "audio";
  }
  if (_0x1f9f43) {
    return _0x1f9f43;
  }
  if (hasImageEvidence(_0x49f968, _0x258cf5)) {
    return "image";
  }
  return "";
}
function makePolicy(_0xe4bf2f, _0x36bb33 = {}) {
  const _0x4d66e9 = new Set(["text", ...(Array.isArray(_0xe4bf2f) ? _0xe4bf2f : [])].map(_0x3fe40c => normalizeInputKind(_0x3fe40c)).filter(Boolean));
  return {
    allowedKinds: INPUT_KIND_ORDER.filter(_0x125ef7 => _0x4d66e9.has(_0x125ef7)),
    maxByKind: {
      ..._0x36bb33
    }
  };
}
function normalizePolicyCompareValue(_0x4a1db1) {
  return String(_0x4a1db1 ?? "").trim().toLowerCase();
}
function manifestPolicyConditionMatches(_0xc0dfa9, _0x2fab57 = {}) {
  if (Array.isArray(_0xc0dfa9)) {
    return _0xc0dfa9.some(_0x4b7aaf => manifestPolicyConditionMatches(_0x4b7aaf, _0x2fab57));
  }
  if (!_0xc0dfa9 || typeof _0xc0dfa9 !== "object") {
    return false;
  }
  if (Array.isArray(_0xc0dfa9.any)) {
    return _0xc0dfa9.any.some(_0x4fa4b4 => manifestPolicyConditionMatches(_0x4fa4b4, _0x2fab57));
  }
  if (Array.isArray(_0xc0dfa9.all)) {
    return _0xc0dfa9.all.every(_0x26e7fd => manifestPolicyConditionMatches(_0x26e7fd, _0x2fab57));
  }
  const _0x5df567 = normalizeText(_0xc0dfa9.field ?? _0xc0dfa9.param);
  if (!_0x5df567) {
    return false;
  }
  const _0x4482f9 = _0xc0dfa9.values !== undefined ? _0xc0dfa9.values : _0xc0dfa9.value;
  const _0x58cac1 = (Array.isArray(_0x4482f9) ? _0x4482f9 : [_0x4482f9]).map(normalizePolicyCompareValue);
  const _0x2688e3 = _0x58cac1.includes(normalizePolicyCompareValue(_0x2fab57?.[_0x5df567]));
  if (_0xc0dfa9.not === true) {
    return !_0x2688e3;
  } else {
    return _0x2688e3;
  }
}
export function getActiveManifestInputPolicyVariant(_0x28344f, _0xa92e7c = {}) {
  const _0x537e8c = Array.isArray(_0x28344f?.policyVariants) ? _0x28344f.policyVariants : [];
  if (_0x537e8c.length === 0) {
    return null;
  }
  const _0x19ea2d = _0xa92e7c?.generationParams && typeof _0xa92e7c.generationParams === "object" && !Array.isArray(_0xa92e7c.generationParams) ? _0xa92e7c.generationParams : {};
  const _0x117add = {
    ..._0xa92e7c,
    ..._0x19ea2d
  };
  return _0x537e8c.find(_0x39bb91 => manifestPolicyConditionMatches(_0x39bb91?.when, _0x117add)) || null;
}
function makeManifestInputPolicy(_0x569c14, _0x1352c8 = {}) {
  if (!_0x569c14 || typeof _0x569c14 !== "object") {
    return null;
  }
  const _0x1e90e4 = getActiveManifestInputPolicyVariant(_0x569c14, _0x1352c8);
  const _0x36ff33 = Array.isArray(_0x1e90e4?.allowedKinds) ? _0x1e90e4.allowedKinds : Array.isArray(_0x569c14.allowedKinds) ? _0x569c14.allowedKinds : [];
  const _0x41f617 = {
    ...(_0x569c14.maxByKind || {}),
    ...(_0x1e90e4?.maxByKind || {})
  };
  return {
    allowedKinds: INPUT_KIND_ORDER.filter(_0x1547c8 => _0x36ff33.includes(_0x1547c8)),
    maxByKind: _0x41f617
  };
}
export function manifestInputPolicyReferencesField(_0x2b789b, _0x4477c9) {
  const _0x2a09c9 = normalizeText(_0x4477c9);
  if (!_0x2a09c9) {
    return false;
  }
  const _0x423e44 = _0x2ab112 => {
    if (Array.isArray(_0x2ab112)) {
      return _0x2ab112.some(_0x423e44);
    }
    if (!_0x2ab112 || typeof _0x2ab112 !== "object") {
      return false;
    }
    if (Array.isArray(_0x2ab112.any) && _0x2ab112.any.some(_0x423e44)) {
      return true;
    }
    if (Array.isArray(_0x2ab112.all) && _0x2ab112.all.some(_0x423e44)) {
      return true;
    }
    return normalizeText(_0x2ab112.field ?? _0x2ab112.param) === _0x2a09c9;
  };
  return (Array.isArray(_0x2b789b?.policyVariants) ? _0x2b789b.policyVariants : []).some(_0x4642ba => _0x423e44(_0x4642ba?.when));
}
function makeDreaminaStyleVideoPolicy(_0x1872f1) {
  const _0x312c0e = _0x1872f1?.generationParams && typeof _0x1872f1.generationParams === "object" ? _0x1872f1.generationParams : {};
  const _0x1b80c2 = normalizeDreaminaVideoRouteMode(_0x312c0e.dreaminaRouteMode ?? _0x1872f1?.dreaminaRouteMode, _0x1872f1?.mode);
  if (_0x1b80c2 === "frames2video") {
    return makePolicy(["text", "image"], {
      image: 2,
      video: 0,
      audio: 0
    });
  }
  if (_0x1b80c2 === "multiframe2video") {
    return makePolicy(["text", "image"], {
      image: 20,
      video: 0,
      audio: 0
    });
  }
  const _0x5c4638 = resolveModelExecution(_0x1872f1?.model, {
    providerHint: _0x1872f1?.provider
  }) || resolveModelExecution(_0x1872f1?.model);
  const _0x288ca9 = _0x5c4638?.modelManifest || getModelManifest(_0x1872f1?.model);
  const _0x2d71e0 = makeManifestInputPolicy(_0x288ca9?.inputSlots, _0x1872f1);
  return makePolicy(_0x2d71e0?.allowedKinds || ["text", "image", "video", "audio"], {
    image: _0x2d71e0?.maxByKind?.image ?? 9,
    video: _0x2d71e0?.maxByKind?.video ?? 3,
    audio: _0x2d71e0?.maxByKind?.audio ?? 3
  });
}
function normalizeHappyHorseVideoMode(_0x241330) {
  const _0x2b76cd = normalizeText(_0x241330).toLowerCase();
  if (_0x2b76cd === "image" || _0x2b76cd === "reference" || _0x2b76cd === "edit") {
    return _0x2b76cd;
  } else {
    return "auto";
  }
}
function getHappyHorseVideoMode(_0x329c31 = {}) {
  const _0x4642ff = _0x329c31?.generationParams && typeof _0x329c31.generationParams === "object" ? _0x329c31.generationParams : {};
  return normalizeHappyHorseVideoMode(_0x4642ff.happyhorse_mode ?? _0x329c31?.happyhorse_mode);
}
function makeHappyHorseVideoPolicy(_0x5e02cd) {
  const _0x456b20 = getHappyHorseVideoMode(_0x5e02cd);
  if (_0x456b20 === "image") {
    return makePolicy(["text", "image"], {
      image: 1,
      video: 0,
      audio: 0
    });
  }
  if (_0x456b20 === "reference") {
    return makePolicy(["text", "image"], {
      image: 9,
      video: 0,
      audio: 0
    });
  }
  if (_0x456b20 === "edit") {
    return makePolicy(["text", "image", "video"], {
      image: 5,
      video: 1,
      audio: 0
    });
  }
  return makePolicy(["text"], {
    image: 0,
    video: 0,
    audio: 0
  });
}
function normalizeSeedance2VideoMode(_0x2754e2, _0x3d43dc = "text2video") {
  const _0x37fa97 = normalizeText(_0x2754e2).toLowerCase();
  if (_0x37fa97 === "multimodal2video" || _0x37fa97 === "reference") {
    return "multimodal2video";
  }
  if (_0x37fa97 === "frames2video" || _0x37fa97 === "frames") {
    return "frames2video";
  }
  if (_0x37fa97 === "image2video" || _0x37fa97 === "image" || _0x37fa97 === "frame") {
    return "image2video";
  }
  if (_0x37fa97 === "text2video" || _0x37fa97 === "text") {
    return "text2video";
  }
  if (_0x3d43dc === "multimodal2video") {
    return "multimodal2video";
  } else {
    return "text2video";
  }
}
function getSeedance2VideoMode(_0x317d2c = {}) {
  const _0x382dd0 = _0x317d2c?.generationParams && typeof _0x317d2c.generationParams === "object" ? _0x317d2c.generationParams : {};
  const _0x34520f = normalizeText(_0x317d2c?.provider).toLowerCase();
  const _0x5ec4f4 = normalizeText(_0x317d2c?.model).toLowerCase();
  const _0x304bf8 = _0x34520f === "volcengine" || _0x5ec4f4.startsWith("volcengine/");
  return normalizeSeedance2VideoMode(_0x382dd0.rh_seedance_2_mode ?? _0x382dd0.volcengine_seedance_2_mode ?? _0x317d2c?.rh_seedance_2_mode ?? _0x317d2c?.volcengine_seedance_2_mode, _0x304bf8 ? "multimodal2video" : "text2video");
}
function makeSeedance2VideoPolicy(_0x2681bb) {
  const _0x20a06e = getSeedance2VideoMode(_0x2681bb);
  if (_0x20a06e === "multimodal2video") {
    return makePolicy(["text", "image", "video", "audio"], {
      image: 9,
      video: 3,
      audio: 3
    });
  }
  if (_0x20a06e === "frames2video") {
    return makePolicy(["text", "image"], {
      image: 2,
      video: 0,
      audio: 0
    });
  }
  if (_0x20a06e === "image2video") {
    return makePolicy(["text", "image"], {
      image: 1,
      video: 0,
      audio: 0
    });
  }
  return makePolicy(["text"], {
    image: 0,
    video: 0,
    audio: 0
  });
}
function normalizeWan27VideoMode(_0x1f2549) {
  const _0x116e92 = normalizeText(_0x1f2549).toLowerCase();
  if (_0x116e92 === "video" || _0x116e92 === "reference" || _0x116e92 === "edit") {
    return _0x116e92;
  } else {
    return "image";
  }
}
function getWan27VideoMode(_0x4975a7 = {}) {
  const _0x3393a5 = _0x4975a7?.generationParams && typeof _0x4975a7.generationParams === "object" ? _0x4975a7.generationParams : {};
  return normalizeWan27VideoMode(_0x3393a5.wan27_mode ?? _0x4975a7?.wan27_mode);
}
function makeWan27VideoPolicy(_0x2ec6a2) {
  const _0x28fde6 = getWan27VideoMode(_0x2ec6a2);
  if (_0x28fde6 === "video") {
    return makePolicy(["text", "video"], {
      image: 0,
      video: 1,
      audio: 0
    });
  }
  if (_0x28fde6 === "reference") {
    return makePolicy(["text", "image", "video", "audio"], {
      image: 1,
      video: 1,
      audio: 1
    });
  }
  if (_0x28fde6 === "edit") {
    return makePolicy(["text", "video"], {
      image: 0,
      video: 2,
      audio: 0
    });
  }
  return makePolicy(["text", "image", "audio"], {
    image: 2,
    video: 0,
    audio: 1
  });
}
function normalizeKlingV3OmniVideoMode(_0x50a0f5) {
  const _0x10e70b = normalizeText(_0x50a0f5).toLowerCase();
  if (_0x10e70b === "reference" || _0x10e70b === "edit") {
    return _0x10e70b;
  } else {
    return "image";
  }
}
function getKlingV3OmniVideoMode(_0x591387 = {}) {
  const _0x1fd187 = _0x591387?.generationParams && typeof _0x591387.generationParams === "object" ? _0x591387.generationParams : {};
  return normalizeKlingV3OmniVideoMode(_0x1fd187.kling_v3_omni_mode ?? _0x591387?.kling_v3_omni_mode);
}
function makeKlingV3OmniVideoPolicy(_0xea0d89) {
  const _0x469c5f = getKlingV3OmniVideoMode(_0xea0d89);
  if (_0x469c5f === "reference") {
    return makePolicy(["text", "image", "video"], {
      image: 1,
      video: 1,
      audio: 0
    });
  }
  if (_0x469c5f === "edit") {
    return makePolicy(["text", "video"], {
      image: 0,
      video: 1,
      audio: 0
    });
  }
  return makePolicy(["text", "image"], {
    image: 2,
    video: 0,
    audio: 0
  });
}
function normalizeViduQ3GenerationMode(_0x37f2e6) {
  const _0x6f2034 = normalizeText(_0x37f2e6).toLowerCase();
  if (_0x6f2034 === "reference") {
    return "reference";
  } else {
    return "video";
  }
}
function getViduQ3GenerationMode(_0x2a8685 = {}) {
  const _0x13b729 = _0x2a8685?.generationParams && typeof _0x2a8685.generationParams === "object" ? _0x2a8685.generationParams : {};
  return normalizeViduQ3GenerationMode(_0x13b729.vidu_q3_generation_mode ?? _0x2a8685?.vidu_q3_generation_mode);
}
function makeViduQ3VideoPolicy(_0x3b08b5) {
  const _0x2c2f4e = getViduQ3GenerationMode(_0x3b08b5);
  return makePolicy(["text", "image"], {
    image: _0x2c2f4e === "reference" ? 7 : 2,
    video: 0,
    audio: 0
  });
}
export function getTargetInputPolicy(_0x427750 = {}) {
  const _0x4b2d9f = normalizeText(_0x427750?.type);
  const _0x1bef3b = normalizeText(_0x427750?.model);
  const _0x5b4c23 = normalizeText(_0x427750?.provider).toLowerCase();
  const _0x24186b = normalizeText(_0x427750?.audioWorkflowKey);
  if (_0x4b2d9f === "ai-image") {
    const _0x44cc87 = makeManifestInputPolicy(getModelManifest(_0x1bef3b)?.inputSlots, _0x427750);
    if (_0x44cc87) {
      return _0x44cc87;
    }
    const _0x4f7238 = isRhPersonReplaceWorkflowModel(_0x1bef3b) ? 2 : isDreaminaManifestOrModel(_0x1bef3b, _0x5b4c23) ? 1 : 9;
    return makePolicy(["text", "image"], {
      image: _0x4f7238,
      video: 0,
      audio: 0
    });
  }
  if (_0x4b2d9f === "ai-video") {
    if (isDreaminaStyleVideoModel(_0x1bef3b, _0x5b4c23)) {
      return makeDreaminaStyleVideoPolicy(_0x427750);
    }
    if (isHappyHorseVideoModel(_0x1bef3b, _0x5b4c23)) {
      return makeHappyHorseVideoPolicy(_0x427750);
    }
    if (isSeedance2VideoModel(_0x1bef3b, _0x5b4c23)) {
      return makeSeedance2VideoPolicy(_0x427750);
    }
    if (isApimartWan27VideoModel(_0x1bef3b, _0x5b4c23)) {
      return makeWan27VideoPolicy(_0x427750);
    }
    if (isApimartKlingV3OmniVideoModel(_0x1bef3b, _0x5b4c23)) {
      return makeKlingV3OmniVideoPolicy(_0x427750);
    }
    if (isApimartViduQ3VideoModel(_0x1bef3b, _0x5b4c23)) {
      return makeViduQ3VideoPolicy(_0x427750);
    }
    const _0x1cdd3a = makeManifestInputPolicy(getModelManifest(_0x1bef3b)?.inputSlots, _0x427750);
    if (_0x1cdd3a) {
      return _0x1cdd3a;
    }
    return makePolicy(["text", "image", "video"], {
      audio: 0
    });
  }
  if (_0x4b2d9f === "ai-audio") {
    const _0xa6b976 = makeManifestInputPolicy(getModelManifest(_0x24186b || _0x1bef3b)?.inputSlots, _0x427750);
    if (_0xa6b976) {
      return _0xa6b976;
    }
    return makePolicy(["text", "audio"], {
      image: 0,
      video: 0,
      audio: _0x24186b === "voice_convert" ? 2 : 1
    });
  }
  if (_0x4b2d9f === "ai-text") {
    const _0x2a4f40 = getModelManifest(_0x1bef3b);
    const _0x5b6449 = makeManifestInputPolicy(_0x2a4f40?.inputSlots, _0x427750);
    if (_0x5b6449) {
      return _0x5b6449;
    }
    const _0x4807aa = resolveTargetProvider(_0x1bef3b, _0x5b4c23) || normalizeProviderId(_0x2a4f40?.provider);
    if (_0x4807aa === "apimart") {
      return makePolicy(["text", "image"], {
        video: 0,
        audio: 0
      });
    }
    return makePolicy(["text", "image", "video", "audio"], {});
  }
  if (_0x4b2d9f === "media-clip") {
    return {
      allowedKinds: ["image", "video", "audio"],
      maxByKind: {
        text: 0
      }
    };
  }
  if (_0x4b2d9f === "whiteboard") {
    return {
      allowedKinds: ["image"],
      maxByKind: {
        text: 0,
        image: 1,
        video: 0,
        audio: 0
      }
    };
  }
  if (_0x4b2d9f === "storyboard" || _0x4b2d9f === "storyboard-script") {
    return makePolicy(["text", "image", "video"], {
      audio: 0
    });
  }
  return makePolicy(["text", "image", "video", "audio"], {});
}
export function canTargetReceiveInputs(_0x362fe7 = {}) {
  return INPUT_TARGET_NODE_TYPES.has(normalizeText(_0x362fe7?.type));
}
export function getVideoSourceKey(_0x50d85c) {
  if (!_0x50d85c || typeof _0x50d85c !== "object") {
    return "";
  }
  return normalizeText(_0x50d85c.localPath) || normalizeText(_0x50d85c.displayLocalPath) || normalizeText(_0x50d85c.originalLocalPath) || normalizeText(_0x50d85c.videoLocalPath) || normalizeText(_0x50d85c.videoUrl) || normalizeText(_0x50d85c.src) || normalizeText(_0x50d85c.url) || normalizeText(_0x50d85c.resultUrl) || normalizeText(_0x50d85c.sourceUrl);
}
function isUnavailableVideoRecord(_0x21d6f5) {
  const _0xc31c14 = getVideoSourceKey(_0x21d6f5);
  if (!_0xc31c14) {
    return false;
  }
  return _0x21d6f5?.mediaUnavailable === true && normalizeText(_0x21d6f5?.mediaUnavailableSource) === _0xc31c14;
}
export function hasUsableInputNodeSource(_0x59231c = {}, _0x73af9c = {}) {
  const _0x3c98de = _0x73af9c?.edge || _0x73af9c || null;
  const _0x1a9163 = normalizeInputKind(_0x73af9c?.kind) || resolveEffectiveInputKind(_0x59231c, _0x3c98de);
  if (!_0x1a9163) {
    return false;
  }
  if (_0x1a9163 !== "video") {
    return true;
  }
  const _0x2f1f98 = Array.isArray(_0x59231c?.videos) ? _0x59231c.videos : [];
  if (_0x2f1f98.some(_0x2332ca => getVideoSourceKey(_0x2332ca) && !isUnavailableVideoRecord(_0x2332ca))) {
    return true;
  }
  if (getVideoSourceKey(_0x59231c) && !isUnavailableVideoRecord(_0x59231c)) {
    return true;
  }
  const _0x8e378b = isVideoPath(_0x3c98de?.sourceMediaKey) ? normalizeText(_0x3c98de?.sourceMediaKey) : "";
  return Boolean(_0x8e378b);
}
export function isInputNodeCompatibleWithTarget(_0x124677 = {}, _0x438177 = {}, _0x256f18 = null) {
  if (!canTargetReceiveInputs(_0x438177)) {
    return false;
  }
  const _0x5d843b = resolveEffectiveInputKind(_0x124677, _0x256f18);
  if (!_0x5d843b) {
    return false;
  }
  if (!isInputKindAllowed(getTargetInputPolicy(_0x438177), _0x5d843b)) {
    return false;
  }
  return hasUsableInputNodeSource(_0x124677, {
    edge: _0x256f18,
    kind: _0x5d843b
  });
}
export function canAppendInputKindWithinLimit(_0x3be389, _0x39ea74, _0x3751b9 = {}) {
  const _0x2f580e = normalizeInputKind(_0x39ea74);
  if (!_0x2f580e) {
    return false;
  }
  if (!isInputKindAllowed(_0x3be389, _0x2f580e)) {
    return false;
  }
  const _0x7d86f1 = Number(_0x3be389?.maxByKind?.[_0x2f580e]);
  if (!Number.isFinite(_0x7d86f1)) {
    return true;
  }
  if (_0x7d86f1 <= 0) {
    return false;
  }
  return Number(_0x3751b9?.[_0x2f580e] || 0) < _0x7d86f1;
}
export function isInputKindAllowed(_0x55671f, _0x55a29a) {
  const _0x3474f3 = normalizeInputKind(_0x55a29a);
  if (!_0x3474f3) {
    return false;
  }
  const _0x56379c = Array.isArray(_0x55671f?.allowedKinds) ? _0x55671f.allowedKinds : INPUT_KIND_ORDER;
  return _0x56379c.includes(_0x3474f3);
}
export function getInputLimitReason(_0x29c5e8, _0x5939ce, _0x33f778 = {}) {
  const _0x2b5a59 = normalizeInputKind(_0x5939ce);
  if (!_0x2b5a59) {
    return "";
  }
  if (!isInputKindAllowed(_0x29c5e8, _0x2b5a59)) {
    return modelInputPolicyText("unsupported");
  }
  const _0x262bd0 = Number(_0x29c5e8?.maxByKind?.[_0x2b5a59]);
  if (!Number.isFinite(_0x262bd0)) {
    return "";
  }
  if (_0x262bd0 <= 0) {
    return modelInputPolicyText("unsupported");
  }
  const _0x23f83e = Number(_0x33f778?.[_0x2b5a59] || 0);
  if (_0x23f83e < _0x262bd0) {
    return "";
  }
  return modelInputPolicyText("limitReached", {
    max: _0x262bd0,
    type: getInputKindLabel(_0x2b5a59)
  });
}