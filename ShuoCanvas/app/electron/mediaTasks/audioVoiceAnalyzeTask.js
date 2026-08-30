import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import a255_0x7fbdec from "node:path";
import { fileURLToPath } from "node:url";
import { createProcessStartError, MediaTaskCancelledError } from "../mediaTaskQueue.js";
import { normalizeDoubaoAsrSegments, runDoubaoAsrTranscription } from "./doubaoAsrClient.js";
export { buildDoubaoAsrHeaders, buildDoubaoAsrSubmitBody, normalizeDoubaoAsrSegments, runDoubaoAsrTranscription } from "./doubaoAsrClient.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = a255_0x7fbdec.dirname(__filename);
const DEFAULT_APP_ROOT = a255_0x7fbdec.resolve(__dirname, "..", "..");
const AUDIO_VOICE_ASR_STAGE = Object.freeze({
  MODEL_DOWNLOAD: "model-download",
  MODEL_PREPARE: "model-prepare",
  TRANSCRIBE: "transcribe",
  DIARIZATION_MODEL_DOWNLOAD: "diarization-model-download",
  DIARIZATION_MODEL_PREPARE: "diarization-model-prepare",
  DIARIZE: "diarize",
  SLICE: "slice"
});
const FUNASR_GPU_TORCH_STAGE = Object.freeze({
  CHECK: "gpu-torch-check",
  INSTALL: "gpu-torch-install",
  VERIFY: "gpu-torch-verify"
});
const FUNASR_STAGE_RANGES = Object.freeze({
  "model-download": [0.08, 0.32],
  "model-prepare": [0.32, 0.42],
  transcribe: [0.42, 0.52],
  "diarization-model-download": [0.52, 0.64],
  "diarization-model-prepare": [0.64, 0.7],
  diarize: [0.7, 0.8]
});
function resolveAsrProgressMessage(_0x4c12a6 = "", _0x39aa06 = "") {
  const _0x511329 = String(_0x39aa06 || "").trim();
  if (_0x511329 && !/funasr|paraformer|modelscope/i.test(_0x511329)) {
    return _0x511329;
  }
  switch (_0x4c12a6) {
    case AUDIO_VOICE_ASR_STAGE.MODEL_DOWNLOAD:
      return "Preparing subtitle recognition model";
    case AUDIO_VOICE_ASR_STAGE.MODEL_PREPARE:
      return "Preparing recognition runtime";
    case AUDIO_VOICE_ASR_STAGE.TRANSCRIBE:
      return "Recognizing subtitles";
    default:
      return "Preparing subtitle recognition";
  }
}
const FUNASR_DEFAULT_MODEL = Object.freeze({
  model: "paraformer-zh",
  vadModel: "fsmn-vad",
  puncModel: "ct-punc-c",
  spkModel: "cam++"
});
const SORTFORMER_DEFAULT_MODEL_FILE = "diar_streaming_sortformer_4spk-v2.1.nemo";
const SORTFORMER_DEFAULT_MODEL_URL = "https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1/resolve/main/diar_streaming_sortformer_4spk-v2.1.nemo";
const FUNASR_TRANSCRIPT_MERGE_DEFAULTS = Object.freeze({
  maxGapMs: 800,
  maxDurationMs: 10000,
  maxTextChars: 100
});
const DIARIZATION_SPEAKER_RECONCILE_DEFAULTS = Object.freeze({
  maxBridgeGapMs: 120
});
const DEFAULT_FUNASR_GPU_TORCH_INDEX_URL = "https://download.pytorch.org/whl/cu128";
const DEFAULT_FUNASR_GPU_TORCH_PACKAGES = Object.freeze(["torch==2.11.0+cu128", "torchaudio==2.11.0+cu128"]);
function toNumber(_0x33a4b8, _0x3b564b = 0) {
  const _0x39afa5 = Number(_0x33a4b8);
  if (Number.isFinite(_0x39afa5)) {
    return _0x39afa5;
  } else {
    return _0x3b564b;
  }
}
function clamp(_0x237a15, _0x539ab3, _0x22b3fd) {
  return Math.max(_0x539ab3, Math.min(_0x22b3fd, _0x237a15));
}
function normalizePositiveSeconds(_0x15e71b, _0x90dd58) {
  const _0xa71fe5 = toNumber(_0x15e71b, _0x90dd58);
  if (_0xa71fe5 > 0) {
    return _0xa71fe5;
  } else {
    return _0x90dd58;
  }
}
function normalizeSilenceOptions(_0x2249aa = {}) {
  const _0x1f610a = Math.round(toNumber(_0x2249aa.noiseDb, -35));
  const _0x163da3 = normalizePositiveSeconds(_0x2249aa.minSilenceSec, 0.35);
  const _0x385e5a = Math.max(0, Math.round(toNumber(_0x2249aa.paddingMs, 80)));
  return {
    noiseDb: _0x1f610a,
    minSilenceSec: _0x163da3,
    paddingMs: _0x385e5a
  };
}
function normalizeAsrProvider(_0x28686f = {}) {
  return String(_0x28686f.asrProvider || "").trim().toLowerCase();
}
function normalizeDiarizationProvider(_0xd7118d = {}) {
  const _0x4e1758 = String(_0xd7118d.diarizationProvider || "").trim().toLowerCase();
  if (["none", "off", "disabled", "false"].includes(_0x4e1758)) {
    return "none";
  }
  return "sortformer";
}
function resolveSortformerModelRootFromFunasrRoot(_0x33b4a2 = "") {
  const _0x45717f = String(_0x33b4a2 || "").trim();
  if (!_0x45717f) {
    return "";
  }
  return a255_0x7fbdec.join(a255_0x7fbdec.dirname(a255_0x7fbdec.resolve(_0x45717f)), "sortformer");
}
export function normalizeFunasrEngine(_0x4ccf7b) {
  if (String(_0x4ccf7b || "").trim().toLowerCase() === "gpu") {
    return "gpu";
  } else {
    return "cpu";
  }
}
export function parseSilenceDetectRanges(_0x2017d1 = "", _0x3bb506 = 0) {
  const _0x420fa3 = String(_0x2017d1 || "");
  const _0xb3aa91 = Math.max(0, toNumber(_0x3bb506, 0));
  const _0x435f5f = /silence_(start|end):\s*([0-9]+(?:\.[0-9]+)?)/g;
  const _0x5f4516 = [];
  let _0x348d68 = null;
  let _0x4684db = null;
  while (_0x4684db = _0x435f5f.exec(_0x420fa3)) {
    const _0x5eef6b = _0x4684db[1];
    const _0x118855 = clamp(toNumber(_0x4684db[2], 0), 0, _0xb3aa91 || Number.MAX_SAFE_INTEGER);
    if (_0x5eef6b === "start") {
      _0x348d68 = _0x118855;
      continue;
    }
    if (_0x348d68 != null && _0x118855 > _0x348d68) {
      _0x5f4516.push({
        startSec: _0x348d68,
        endSec: _0x118855
      });
      _0x348d68 = null;
    }
  }
  if (_0x348d68 != null && _0xb3aa91 > _0x348d68) {
    _0x5f4516.push({
      startSec: _0x348d68,
      endSec: _0xb3aa91
    });
  }
  return _0x5f4516.sort((_0x2a5625, _0x340c38) => _0x2a5625.startSec - _0x340c38.startSec);
}
function mergeShortSpeechSegments(_0x114c00, _0x2faab5) {
  const _0x546124 = [];
  for (const _0x270d1b of _0x114c00) {
    const _0x8be35f = _0x270d1b.endSec - _0x270d1b.startSec;
    if (_0x8be35f >= _0x2faab5 || _0x546124.length === 0) {
      _0x546124.push({
        ..._0x270d1b
      });
      continue;
    }
    _0x546124[_0x546124.length - 1].endSec = _0x270d1b.endSec;
  }
  return _0x546124.filter(_0x2657b4 => _0x2657b4.endSec - _0x2657b4.startSec > 0.05);
}
export function buildAudioVoiceSpeechSegments({
  silenceRanges = [],
  durationSec = 0,
  paddingMs = 80,
  minSpeechSec = 0.25
} = {}) {
  const _0x1ace1d = Math.max(0, toNumber(durationSec, 0));
  if (_0x1ace1d <= 0) {
    return [];
  }
  const _0x4d855b = [];
  let _0x1a8d2e = 0;
  for (const _0x210a26 of silenceRanges) {
    const _0x3eae51 = clamp(toNumber(_0x210a26.startSec, 0), 0, _0x1ace1d);
    const _0x3f85aa = clamp(toNumber(_0x210a26.endSec, _0x3eae51), _0x3eae51, _0x1ace1d);
    if (_0x3eae51 > _0x1a8d2e) {
      _0x4d855b.push({
        startSec: _0x1a8d2e,
        endSec: _0x3eae51
      });
    }
    _0x1a8d2e = Math.max(_0x1a8d2e, _0x3f85aa);
  }
  if (_0x1a8d2e < _0x1ace1d) {
    _0x4d855b.push({
      startSec: _0x1a8d2e,
      endSec: _0x1ace1d
    });
  }
  const _0x4b12a3 = _0x4d855b.length ? mergeShortSpeechSegments(_0x4d855b, Math.max(0.05, toNumber(minSpeechSec, 0.25))) : [{
    startSec: 0,
    endSec: _0x1ace1d
  }];
  const _0x336c46 = Math.max(0, toNumber(paddingMs, 0)) / 1000;
  const _0x1c7ee5 = [];
  let _0xc439f9 = 0;
  for (const _0x124042 of _0x4b12a3) {
    const _0x530da4 = clamp(_0x124042.startSec - _0x336c46, _0xc439f9, _0x1ace1d);
    const _0x206a43 = clamp(_0x124042.endSec + _0x336c46, _0x530da4, _0x1ace1d);
    if (_0x206a43 - _0x530da4 <= 0.05) {
      continue;
    }
    _0x1c7ee5.push({
      startMs: Math.round(_0x530da4 * 1000),
      endMs: Math.round(_0x206a43 * 1000)
    });
    _0xc439f9 = _0x206a43;
  }
  if (_0x1c7ee5.length) {
    return _0x1c7ee5;
  } else {
    return [{
      startMs: 0,
      endMs: Math.round(_0x1ace1d * 1000)
    }];
  }
}
function formatSec(_0xc7c44c) {
  return (Math.max(0, Number(_0xc7c44c) || 0) / 1000).toFixed(3);
}
export function buildAudioVoiceSegmentCutArgs({
  sourceAudioAbs: _0x4fc1d2,
  outAbs: _0x89e2ac,
  startMs: _0x3ee954,
  endMs: _0x533d34
} = {}) {
  const _0x4c8f51 = Math.max(1, Math.round(Number(_0x533d34 || 0) - Number(_0x3ee954 || 0)));
  return ["-y", "-ss", formatSec(_0x3ee954), "-i", _0x4fc1d2, "-t", formatSec(_0x4c8f51), "-vn", "-c:a", "libmp3lame", "-b:a", "192k", _0x89e2ac];
}
export function normalizeFunasrTranscriptSegments(_0x1f5cb9 = {}, _0x19dd5c = 0) {
  const _0x4f4f2a = Math.max(0, Math.round(Number(_0x19dd5c || 0) * 1000));
  const _0x1443cc = Array.isArray(_0x1f5cb9?.segments) ? _0x1f5cb9.segments : Array.isArray(_0x1f5cb9) ? _0x1f5cb9 : [];
  const _0x14fedd = [];
  for (const _0x579d3d of _0x1443cc) {
    const _0x1f2f97 = clamp(Math.round(Number(_0x579d3d?.startMs || 0)), 0, _0x4f4f2a || Number.MAX_SAFE_INTEGER);
    const _0x44258b = clamp(Math.round(Number(_0x579d3d?.endMs || 0)), _0x1f2f97, _0x4f4f2a || Number.MAX_SAFE_INTEGER);
    if (_0x44258b - _0x1f2f97 <= 0.05) {
      continue;
    }
    const _0x22af7b = normalizeSpeakerLabel(_0x579d3d?.speaker ?? _0x579d3d?.spk ?? _0x579d3d?.speakerId);
    const _0x2ed4f9 = {
      startMs: _0x1f2f97,
      endMs: _0x44258b,
      sourceText: String(_0x579d3d?.sourceText || _0x579d3d?.text || "").trim()
    };
    if (_0x22af7b) {
      _0x2ed4f9.speaker = _0x22af7b;
    }
    _0x14fedd.push(_0x2ed4f9);
  }
  return _0x14fedd.sort((_0xbae7bc, _0xa1af0c) => _0xbae7bc.startMs - _0xa1af0c.startMs);
}
export function normalizeDiarizationSegments(_0x4b4b90 = {}, _0x545f7c = 0) {
  const _0x3b9ef0 = Math.max(0, Math.round(Number(_0x545f7c || 0) * 1000));
  const _0x44d50c = Array.isArray(_0x4b4b90?.segments) ? _0x4b4b90.segments : Array.isArray(_0x4b4b90) ? _0x4b4b90 : [];
  const _0x2f3b8a = [];
  for (const _0x3b1cce of _0x44d50c) {
    const _0xab0bfe = clamp(Math.round(Number(_0x3b1cce?.startMs || 0)), 0, _0x3b9ef0 || Number.MAX_SAFE_INTEGER);
    const _0x5e84ac = clamp(Math.round(Number(_0x3b1cce?.endMs || 0)), _0xab0bfe, _0x3b9ef0 || Number.MAX_SAFE_INTEGER);
    if (_0x5e84ac - _0xab0bfe <= 0.05) {
      continue;
    }
    const _0x388ce7 = normalizeSpeakerLabel(_0x3b1cce?.speaker ?? _0x3b1cce?.label ?? _0x3b1cce?.spk ?? _0x3b1cce?.speakerId);
    if (!_0x388ce7) {
      continue;
    }
    _0x2f3b8a.push({
      startMs: _0xab0bfe,
      endMs: _0x5e84ac,
      speaker: _0x388ce7
    });
  }
  return _0x2f3b8a.sort((_0x2c8a59, _0x56795a) => _0x2c8a59.startMs - _0x56795a.startMs);
}
function normalizeSpeakerLabel(_0xfa0972) {
  if (_0xfa0972 == null) {
    return "";
  }
  return String(_0xfa0972).trim();
}
function transcriptTextLength(_0x31a52f = "") {
  return Array.from(String(_0x31a52f || "").trim()).length;
}
function joinTranscriptText(_0x2494d3 = "", _0x12e966 = "") {
  const _0x2c9bcf = String(_0x2494d3 || "").trim();
  const _0x52b24a = String(_0x12e966 || "").trim();
  if (!_0x2c9bcf) {
    return _0x52b24a;
  }
  if (!_0x52b24a) {
    return _0x2c9bcf;
  }
  const _0x15ee3f = _0x2c9bcf.slice(-1);
  const _0x3c41d1 = _0x52b24a.slice(0, 1);
  const _0x1cef4e = /[A-Za-z0-9,.;:!?)]/.test(_0x15ee3f) && /[A-Za-z0-9(]/.test(_0x3c41d1);
  return "" + _0x2c9bcf + (_0x1cef4e ? " " : "") + _0x52b24a;
}
function mergeSpeakerLabel(_0x182f72 = "", _0x559a2b = "") {
  const _0x3e2878 = normalizeSpeakerLabel(_0x182f72);
  const _0x2c51aa = normalizeSpeakerLabel(_0x559a2b);
  if (_0x3e2878 && _0x2c51aa && _0x3e2878 === _0x2c51aa) {
    return _0x3e2878;
  } else {
    return "";
  }
}
function hasStrongTranscriptBoundary(_0x3f006a = "") {
  return /[。！？!?…]$/.test(String(_0x3f006a || "").trim());
}
function canMergeFunasrTranscriptSegments(_0xb4d97f = {}, _0x427f3e = {}, _0x416f25 = {}) {
  if (!mergeSpeakerLabel(_0xb4d97f.speaker, _0x427f3e.speaker)) {
    return false;
  }
  const _0x3de62f = Math.max(0, Math.round(toNumber(_0x416f25.maxGapMs, FUNASR_TRANSCRIPT_MERGE_DEFAULTS.maxGapMs)));
  const _0x40233a = Math.max(1, Math.round(toNumber(_0x416f25.maxDurationMs, FUNASR_TRANSCRIPT_MERGE_DEFAULTS.maxDurationMs)));
  const _0xf631e3 = Math.max(1, Math.round(toNumber(_0x416f25.maxTextChars, FUNASR_TRANSCRIPT_MERGE_DEFAULTS.maxTextChars)));
  const _0xb22029 = Math.round(Number(_0x427f3e.startMs || 0) - Number(_0xb4d97f.endMs || 0));
  if (_0xb22029 > _0x3de62f) {
    return false;
  }
  const _0x178953 = Math.min(Number(_0xb4d97f.startMs || 0), Number(_0x427f3e.startMs || 0));
  const _0x21f946 = Math.max(Number(_0xb4d97f.endMs || 0), Number(_0x427f3e.endMs || 0));
  if (_0x21f946 - _0x178953 > _0x40233a) {
    return false;
  }
  const _0x1ca0c5 = joinTranscriptText(_0xb4d97f.sourceText, _0x427f3e.sourceText);
  return transcriptTextLength(_0x1ca0c5) <= _0xf631e3;
}
function shouldBridgeDiarizationSpeakerChange(_0x11ad7c = {}, _0x51702e = {}, _0x3eebec = {}, _0x17cd53 = {}) {
  const _0xcd77f = mergeSpeakerLabel(_0x11ad7c?.speaker ?? _0x11ad7c?.spk ?? _0x11ad7c?.speakerId, _0x51702e?.speaker ?? _0x51702e?.spk ?? _0x51702e?.speakerId);
  if (!_0xcd77f) {
    return false;
  }
  const _0x57f2bf = normalizeSpeakerLabel(_0x3eebec?.speaker);
  const _0x207e54 = normalizeSpeakerLabel(_0x17cd53?.speaker);
  if (!_0x57f2bf || !_0x207e54 || _0x57f2bf === _0x207e54) {
    return false;
  }
  const _0x2f67f9 = Math.max(0, Math.round(Number(_0x17cd53?.startMs || 0) - Number(_0x3eebec?.endMs || 0)));
  const _0x1b5b69 = Math.max(0, Math.round(DIARIZATION_SPEAKER_RECONCILE_DEFAULTS.maxBridgeGapMs));
  if (_0x2f67f9 > _0x1b5b69) {
    return false;
  }
  if (hasStrongTranscriptBoundary(_0x3eebec?.sourceText ?? _0x11ad7c?.sourceText ?? _0x11ad7c?.text)) {
    return false;
  }
  return canMergeFunasrTranscriptSegments({
    ..._0x3eebec,
    speaker: _0x57f2bf
  }, {
    ..._0x17cd53,
    speaker: _0x57f2bf
  });
}
function reconcileDiarizationSpeakerChanges(_0xd9b07e = [], _0x57729c = []) {
  const _0x530385 = Array.isArray(_0xd9b07e) ? _0xd9b07e : [];
  const _0x4831f9 = (Array.isArray(_0x57729c) ? _0x57729c : []).map(_0x3bfb1b => ({
    ..._0x3bfb1b
  }));
  for (let _0x591ab9 = 1; _0x591ab9 < _0x4831f9.length; _0x591ab9 += 1) {
    const _0x5aafeb = _0x4831f9[_0x591ab9 - 1];
    const _0x1bb2dc = _0x4831f9[_0x591ab9];
    if (shouldBridgeDiarizationSpeakerChange(_0x530385[_0x591ab9 - 1], _0x530385[_0x591ab9], _0x5aafeb, _0x1bb2dc)) {
      _0x1bb2dc.speaker = normalizeSpeakerLabel(_0x5aafeb.speaker);
    }
  }
  return _0x4831f9;
}
export function mergeFunasrTranscriptSegments(_0x1fcb0b = [], _0x48c3a0 = {}) {
  const _0x25eb3b = [];
  for (const _0x5a223d of Array.isArray(_0x1fcb0b) ? _0x1fcb0b : []) {
    const _0x406d0c = Math.max(0, Math.round(Number(_0x5a223d?.startMs || 0)));
    const _0x21071f = Math.max(_0x406d0c, Math.round(Number(_0x5a223d?.endMs || 0)));
    if (_0x21071f - _0x406d0c <= 0.05) {
      continue;
    }
    const _0x193931 = normalizeSpeakerLabel(_0x5a223d?.speaker ?? _0x5a223d?.spk ?? _0x5a223d?.speakerId);
    const _0x139c7a = {
      startMs: _0x406d0c,
      endMs: _0x21071f,
      sourceText: String(_0x5a223d?.sourceText || _0x5a223d?.text || "").trim()
    };
    if (_0x193931) {
      _0x139c7a.speaker = _0x193931;
    }
    const _0x5273b9 = _0x25eb3b[_0x25eb3b.length - 1];
    if (_0x5273b9 && canMergeFunasrTranscriptSegments(_0x5273b9, _0x139c7a, _0x48c3a0)) {
      _0x5273b9.endMs = Math.max(_0x5273b9.endMs, _0x139c7a.endMs);
      _0x5273b9.sourceText = joinTranscriptText(_0x5273b9.sourceText, _0x139c7a.sourceText);
      const _0x58f5d9 = mergeSpeakerLabel(_0x5273b9.speaker, _0x139c7a.speaker);
      if (_0x58f5d9) {
        _0x5273b9.speaker = _0x58f5d9;
      } else {
        delete _0x5273b9.speaker;
      }
      continue;
    }
    _0x25eb3b.push(_0x139c7a);
  }
  return _0x25eb3b;
}
function stripTranscriptSpeakerLabels(_0x10f064 = []) {
  return (Array.isArray(_0x10f064) ? _0x10f064 : []).map(_0x204f1f => ({
    startMs: Math.max(0, Math.round(Number(_0x204f1f?.startMs || 0))),
    endMs: Math.max(0, Math.round(Number(_0x204f1f?.endMs || 0))),
    sourceText: String(_0x204f1f?.sourceText || _0x204f1f?.text || "").trim()
  })).filter(_0x4a9ebb => _0x4a9ebb.endMs > _0x4a9ebb.startMs);
}
function overlapMs(_0x30a570 = {}, _0x54f4d8 = {}) {
  const _0x16dde1 = Math.max(Number(_0x30a570.startMs || 0), Number(_0x54f4d8.startMs || 0));
  const _0x4b892c = Math.min(Number(_0x30a570.endMs || 0), Number(_0x54f4d8.endMs || 0));
  return Math.max(0, Math.round(_0x4b892c - _0x16dde1));
}
export function assignDiarizationSpeakersToTranscriptSegments(_0x381e46 = [], _0x463373 = []) {
  const _0x5cbf58 = normalizeDiarizationSegments(_0x463373);
  const _0x5b4016 = stripTranscriptSpeakerLabels(_0x381e46);
  const _0x6f76e4 = _0x5b4016.map(_0x151521 => {
    const _0x1ad050 = new Map();
    for (const _0x45098d of _0x5cbf58) {
      const _0x5b60b0 = overlapMs(_0x151521, _0x45098d);
      if (_0x5b60b0 <= 0) {
        continue;
      }
      const _0x571ce1 = normalizeSpeakerLabel(_0x45098d.speaker);
      if (!_0x571ce1) {
        continue;
      }
      _0x1ad050.set(_0x571ce1, (_0x1ad050.get(_0x571ce1) || 0) + _0x5b60b0);
    }
    let _0x601baf = "";
    let _0x45b76c = 0;
    for (const [_0x3d328a, _0x7d07cb] of _0x1ad050.entries()) {
      if (_0x7d07cb > _0x45b76c) {
        _0x601baf = _0x3d328a;
        _0x45b76c = _0x7d07cb;
      }
    }
    if (_0x601baf) {
      return {
        ..._0x151521,
        speaker: _0x601baf
      };
    } else {
      return _0x151521;
    }
  });
  return reconcileDiarizationSpeakerChanges(_0x381e46, _0x6f76e4);
}
export function hasRecognizedTranscriptText(_0x7ec0f3 = []) {
  return _0x7ec0f3.some(_0x204b77 => String(_0x204b77?.sourceText || "").trim());
}
export function mapFunasrProgressToOverall(_0x306a13, _0xceb998) {
  const _0x361df2 = String(_0x306a13 || "").trim();
  const _0x344ed0 = FUNASR_STAGE_RANGES[_0x361df2] || FUNASR_STAGE_RANGES.transcribe;
  const _0x40495b = clamp(Number(_0xceb998 || 0), 0, 1);
  return _0x344ed0[0] + (_0x344ed0[1] - _0x344ed0[0]) * _0x40495b;
}
export function buildFunasrTranscriptionArgs({
  audioAbs: _0x27fdbd,
  modelRoot: _0x37e70c,
  durationSec: _0x491ec8,
  downloadModelIfMissing = true,
  engine = "cpu",
  model = FUNASR_DEFAULT_MODEL.model,
  vadModel = FUNASR_DEFAULT_MODEL.vadModel,
  puncModel = FUNASR_DEFAULT_MODEL.puncModel,
  spkModel = FUNASR_DEFAULT_MODEL.spkModel,
  prepareOnly = false,
  checkRuntimeOnly = false
} = {}) {
  const _0x464e90 = ["-m", "backend.services.funasr_transcription_service", "--model-root", _0x37e70c, "--duration-ms", String(Math.max(0, Math.round(Number(_0x491ec8 || 0) * 1000))), "--model", model, "--vad-model", vadModel, "--punc-model", puncModel, "--engine", normalizeFunasrEngine(engine)];
  const _0x5ad033 = String(spkModel || "").trim();
  if (_0x5ad033) {
    _0x464e90.push("--spk-model", _0x5ad033);
  }
  if (checkRuntimeOnly) {
    _0x464e90.push("--check-runtime-only");
  } else if (prepareOnly) {
    _0x464e90.push("--prepare-only");
  } else {
    _0x464e90.splice(2, 0, "--audio", _0x27fdbd);
  }
  if (downloadModelIfMissing) {
    _0x464e90.push("--download-model-if-missing");
  }
  return _0x464e90;
}
export function buildSortformerDiarizationArgs({
  audioAbs: _0x4c4b3b,
  modelRoot: _0x299779,
  durationSec: _0x39b101,
  downloadModelIfMissing = true,
  engine = "cpu",
  modelUrl = SORTFORMER_DEFAULT_MODEL_URL,
  modelFile = SORTFORMER_DEFAULT_MODEL_FILE,
  prepareOnly = false,
  checkRuntimeOnly = false
} = {}) {
  const _0x6110dd = ["-m", "backend.services.sortformer_diarization_service", "--model-root", _0x299779, "--duration-ms", String(Math.max(0, Math.round(Number(_0x39b101 || 0) * 1000))), "--model-url", String(modelUrl || SORTFORMER_DEFAULT_MODEL_URL), "--model-file", String(modelFile || SORTFORMER_DEFAULT_MODEL_FILE), "--engine", normalizeFunasrEngine(engine)];
  if (checkRuntimeOnly) {
    _0x6110dd.push("--check-runtime-only");
  } else if (prepareOnly) {
    _0x6110dd.push("--prepare-only");
  } else {
    _0x6110dd.splice(2, 0, "--audio", _0x4c4b3b);
  }
  if (downloadModelIfMissing) {
    _0x6110dd.push("--download-model-if-missing");
  }
  return _0x6110dd;
}
export function buildFunasrEnv(_0x274765, _0x32999a = process.env, _0x1e0404 = {}) {
  const _0x259e19 = a255_0x7fbdec.resolve(_0x274765);
  const _0xaafad0 = a255_0x7fbdec.join(_0x259e19, "cache");
  const _0x49135a = a255_0x7fbdec.join(_0x259e19, "models");
  const _0xdc4331 = a255_0x7fbdec.join(_0x259e19, "torch");
  const _0x237b90 = a255_0x7fbdec.join(_0x259e19, "pip-cache");
  const _0x143545 = a255_0x7fbdec.join(_0x259e19, "tmp");
  mkdirSync(_0xaafad0, {
    recursive: true
  });
  mkdirSync(_0x49135a, {
    recursive: true
  });
  mkdirSync(_0xdc4331, {
    recursive: true
  });
  mkdirSync(_0x237b90, {
    recursive: true
  });
  mkdirSync(_0x143545, {
    recursive: true
  });
  return {
    ..._0x32999a,
    ..._0x1e0404,
    AIC_FUNASR_MODEL_ROOT: _0x259e19,
    MODELSCOPE_CACHE: _0x49135a,
    MODELSCOPE_HOME: _0xaafad0,
    HF_HOME: _0xaafad0,
    HUGGINGFACE_HUB_CACHE: _0x49135a,
    TRANSFORMERS_CACHE: _0x49135a,
    TORCH_HOME: _0xdc4331,
    PIP_CACHE_DIR: _0x237b90,
    PIP_DISABLE_PIP_VERSION_CHECK: "1",
    XDG_CACHE_HOME: _0xaafad0,
    TMPDIR: _0x143545,
    TEMP: _0x143545,
    TMP: _0x143545,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1"
  };
}
export function buildSortformerEnv(_0x157de4, _0x550921 = process.env, _0x180d5e = {}) {
  const _0xf2c71d = a255_0x7fbdec.resolve(_0x157de4);
  const _0x4b424d = a255_0x7fbdec.join(_0xf2c71d, "cache");
  const _0x4565ba = a255_0x7fbdec.join(_0xf2c71d, "models");
  const _0x3dddc0 = a255_0x7fbdec.join(_0xf2c71d, "torch");
  const _0x46df0b = a255_0x7fbdec.join(_0xf2c71d, "pip-cache");
  const _0x2991dc = a255_0x7fbdec.join(_0xf2c71d, "tmp");
  mkdirSync(_0x4b424d, {
    recursive: true
  });
  mkdirSync(_0x4565ba, {
    recursive: true
  });
  mkdirSync(_0x3dddc0, {
    recursive: true
  });
  mkdirSync(_0x46df0b, {
    recursive: true
  });
  mkdirSync(_0x2991dc, {
    recursive: true
  });
  return {
    ..._0x550921,
    ..._0x180d5e,
    AIC_SORTFORMER_MODEL_ROOT: _0xf2c71d,
    HF_HOME: _0x4b424d,
    HUGGINGFACE_HUB_CACHE: _0x4565ba,
    TORCH_HOME: _0x3dddc0,
    PIP_CACHE_DIR: _0x46df0b,
    PIP_DISABLE_PIP_VERSION_CHECK: "1",
    XDG_CACHE_HOME: _0x4b424d,
    TMPDIR: _0x2991dc,
    TEMP: _0x2991dc,
    TMP: _0x2991dc,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
    HF_HUB_DISABLE_TELEMETRY: "1",
    WANDB_DISABLED: "true"
  };
}
function normalizePackageList(_0x2d7711, _0x381ba0 = []) {
  const _0x363c4b = Array.isArray(_0x2d7711) ? _0x2d7711 : [];
  const _0x57edde = _0x363c4b.map(_0x174649 => String(_0x174649 || "").trim()).filter(Boolean);
  if (_0x57edde.length) {
    return _0x57edde;
  } else {
    return [..._0x381ba0];
  }
}
export function buildFunasrGpuTorchInstallArgs({
  indexUrl = DEFAULT_FUNASR_GPU_TORCH_INDEX_URL,
  packages = DEFAULT_FUNASR_GPU_TORCH_PACKAGES
} = {}) {
  const _0x40fb5c = String(indexUrl || "").trim() || DEFAULT_FUNASR_GPU_TORCH_INDEX_URL;
  const _0x46d434 = normalizePackageList(packages, DEFAULT_FUNASR_GPU_TORCH_PACKAGES);
  return ["-m", "pip", "install", "--upgrade", "--prefer-binary", "--no-input", "--disable-pip-version-check", "--index-url", _0x40fb5c, ..._0x46d434];
}
function parseFirstLine(_0xcad617 = "") {
  return String(_0xcad617 || "").split(/\r?\n/).map(_0x4f5d3c => _0x4f5d3c.trim()).find(Boolean) || "";
}
async function detectNvidiaGpuNameForInstall({
  queue: _0x1ac1e6,
  task: _0x266060
} = {}) {
  _0x1ac1e6?.emitProgress?.(_0x266060, 0.04, "Checking NVIDIA GPU", {
    stage: FUNASR_GPU_TORCH_STAGE.CHECK
  });
  const _0x3004ea = await _0x1ac1e6.runProcess(_0x266060, "nvidia-smi", ["--query-gpu=name", "--format=csv,noheader"]);
  const _0xee998a = parseFirstLine(_0x3004ea.stdout?.toString("utf8"));
  if (!_0xee998a) {
    throw new Error("No NVIDIA GPU was detected");
  }
  return _0xee998a;
}
export function runPipInstallProcess({
  appRoot = DEFAULT_APP_ROOT,
  env: _0x25a8bd,
  pipArgs = [],
  pythonCommand: _0x58ae5e,
  queue: _0x5c515d,
  spawnImpl = spawn,
  task: _0x1981aa
} = {}) {
  if (!_0x58ae5e) {
    throw new Error("Python runtime is unavailable");
  }
  return new Promise((_0x1ea1c1, _0x1a0e19) => {
    _0x5c515d?.throwIfCancelled?.(_0x1981aa);
    const _0x673c75 = spawnImpl(_0x58ae5e, pipArgs, {
      cwd: appRoot,
      env: _0x25a8bd,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    _0x1981aa.child = _0x673c75;
    const _0x3fb46a = [];
    const _0x3a0275 = [];
    let _0x5eb776 = 0.12;
    const _0x365c0f = (_0xc61cc = "Installing GPU acceleration component") => {
      _0x5eb776 = Math.min(0.88, _0x5eb776 + 0.015);
      _0x5c515d?.emitProgress?.(_0x1981aa, _0x5eb776, _0xc61cc, {
        stage: FUNASR_GPU_TORCH_STAGE.INSTALL
      });
    };
    const _0x407c4c = setInterval(() => {
      if (_0x5c515d?.isCancelled?.(_0x1981aa)) {
        try {
          _0x673c75.kill();
        } catch {}
        return;
      }
      _0x365c0f();
    }, 2000);
    const _0xe33572 = (_0x1407fc, _0x3814c1) => {
      clearInterval(_0x407c4c);
      if (_0x1981aa.child === _0x673c75) {
        _0x1981aa.child = null;
      }
      _0x1407fc(_0x3814c1);
    };
    const _0x2aa4cb = _0x443ea5 => {
      const _0x5868db = Buffer.from(_0x443ea5).toString("utf8");
      if (/downloading|installing|collecting/i.test(_0x5868db)) {
        _0x365c0f("Installing CUDA PyTorch");
      }
    };
    _0x673c75.stdout?.on("data", _0x3dd056 => {
      _0x3fb46a.push(Buffer.from(_0x3dd056));
      _0x2aa4cb(_0x3dd056);
    });
    _0x673c75.stderr?.on("data", _0x26783f => {
      _0x3a0275.push(Buffer.from(_0x26783f));
      _0x2aa4cb(_0x26783f);
    });
    _0x673c75.once("error", _0x2b0108 => _0xe33572(_0x1a0e19, createProcessStartError(_0x58ae5e, pipArgs, {
      cwd: appRoot
    }, _0x2b0108, 1)));
    _0x673c75.once("exit", (_0x462161, _0x53968d) => {
      if (_0x5c515d?.isCancelled?.(_0x1981aa)) {
        _0xe33572(_0x1a0e19, new MediaTaskCancelledError());
        return;
      }
      if (_0x462161 === 0) {
        _0xe33572(_0x1ea1c1, {
          stdout: Buffer.concat(_0x3fb46a),
          stderr: Buffer.concat(_0x3a0275),
          code: _0x462161,
          signal: _0x53968d
        });
        return;
      }
      const _0x307c7f = Buffer.concat(_0x3a0275).toString("utf8").trim() || Buffer.concat(_0x3fb46a).toString("utf8").trim() || "pip install exited with " + (_0x462161 ?? _0x53968d ?? "unknown");
      _0xe33572(_0x1a0e19, new Error(_0x307c7f));
    });
  });
}
function parseJsonLine(_0x4fd1c6) {
  const _0x437683 = String(_0x4fd1c6 || "").trim();
  if (!_0x437683 || !_0x437683.startsWith("{")) {
    return null;
  }
  try {
    return JSON.parse(_0x437683);
  } catch {
    return null;
  }
}
export function runFunasrTranscriptionProcess({
  appRoot = DEFAULT_APP_ROOT,
  audioAbs: _0x17ef84,
  downloadModelIfMissing = true,
  durationSec = 0,
  engine = "cpu",
  modelRoot: _0x5598d9,
  prepareOnly = false,
  checkRuntimeOnly = false,
  pythonCommand: _0x5973b2,
  certificateEnv = {},
  queue: _0x11f2a8,
  spawnImpl = spawn,
  task: _0x505d86
} = {}) {
  if (!_0x5973b2) {
    throw new Error("Python runtime is unavailable");
  }
  if (!_0x5598d9) {
    throw new Error("FunASR model directory is unavailable");
  }
  mkdirSync(_0x5598d9, {
    recursive: true
  });
  return new Promise((_0x22eb86, _0x6fc85) => {
    _0x11f2a8?.throwIfCancelled?.(_0x505d86);
    const _0x5f2203 = buildFunasrTranscriptionArgs({
      audioAbs: _0x17ef84,
      modelRoot: _0x5598d9,
      durationSec: durationSec,
      downloadModelIfMissing: downloadModelIfMissing,
      engine: engine,
      prepareOnly: prepareOnly,
      checkRuntimeOnly: checkRuntimeOnly
    });
    const _0x5977f0 = spawnImpl(_0x5973b2, _0x5f2203, {
      cwd: appRoot,
      env: buildFunasrEnv(_0x5598d9, process.env, certificateEnv),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    _0x505d86.child = _0x5977f0;
    let _0x4f8730 = null;
    let _0x338f22 = null;
    let _0x2a5631 = "";
    let _0x91ba20 = "";
    let _0x16b780 = AUDIO_VOICE_ASR_STAGE.MODEL_DOWNLOAD;
    let _0x49b5b6 = mapFunasrProgressToOverall(_0x16b780, 0);
    const _0x1e0942 = (_0xf51aab, _0x2871d2, _0x56b57d = "") => {
      _0x16b780 = String(_0xf51aab || _0x16b780);
      _0x49b5b6 = Math.max(_0x49b5b6, mapFunasrProgressToOverall(_0x16b780, _0x2871d2));
      _0x11f2a8?.emitProgress?.(_0x505d86, _0x49b5b6, resolveAsrProgressMessage(_0x16b780, _0x56b57d), {
        stage: _0x16b780
      });
    };
    const _0x4673c7 = setInterval(() => {
      if (_0x11f2a8?.isCancelled?.(_0x505d86)) {
        try {
          _0x5977f0.kill();
        } catch {}
        return;
      }
      const _0x487dde = FUNASR_STAGE_RANGES[_0x16b780] || FUNASR_STAGE_RANGES.transcribe;
      const _0x153306 = Math.min(_0x487dde[1] - 0.01, _0x49b5b6 + 0.006);
      if (_0x153306 > _0x49b5b6) {
        _0x49b5b6 = _0x153306;
        _0x11f2a8?.emitProgress?.(_0x505d86, _0x153306, resolveAsrProgressMessage(_0x16b780), {
          stage: _0x16b780
        });
      }
    }, 1500);
    const _0x12d0a1 = (_0x460d8d, _0x5b3008) => {
      clearInterval(_0x4673c7);
      if (_0x505d86.child === _0x5977f0) {
        _0x505d86.child = null;
      }
      _0x460d8d(_0x5b3008);
    };
    const _0x42220e = _0x691a73 => {
      const _0x503b07 = parseJsonLine(_0x691a73);
      if (!_0x503b07) {
        return;
      }
      if (_0x503b07.type === "progress") {
        _0x1e0942(_0x503b07.stage, _0x503b07.progress, _0x503b07.message);
      } else if (_0x503b07.type === "result") {
        _0x4f8730 = _0x503b07;
      } else if (_0x503b07.type === "error") {
        _0x338f22 = _0x503b07;
      }
    };
    _0x5977f0.stdout?.on("data", _0x5101aa => {
      _0x2a5631 += Buffer.from(_0x5101aa).toString("utf8");
      const _0x520f86 = _0x2a5631.split(/\r?\n/);
      _0x2a5631 = _0x520f86.pop() || "";
      _0x520f86.forEach(_0x42220e);
    });
    _0x5977f0.stderr?.on("data", _0x5e3950 => {
      _0x91ba20 += Buffer.from(_0x5e3950).toString("utf8");
    });
    _0x5977f0.once("error", _0x3a421c => _0x12d0a1(_0x6fc85, createProcessStartError(_0x5973b2, _0x5f2203, {
      cwd: appRoot
    }, _0x3a421c, 1)));
    _0x5977f0.once("exit", (_0x2c5fef, _0x6f26d0) => {
      if (_0x2a5631) {
        _0x42220e(_0x2a5631);
      }
      if (_0x11f2a8?.isCancelled?.(_0x505d86)) {
        _0x12d0a1(_0x6fc85, new MediaTaskCancelledError());
        return;
      }
      if (_0x2c5fef === 0 && _0x4f8730) {
        _0x12d0a1(_0x22eb86, _0x4f8730);
        return;
      }
      const _0x1d1ae2 = String(_0x338f22?.message || "").trim() || _0x91ba20.trim() || "FunASR exited with " + (_0x2c5fef ?? _0x6f26d0 ?? "unknown");
      _0x12d0a1(_0x6fc85, new Error(_0x1d1ae2));
    });
  });
}
export function runSortformerDiarizationProcess({
  appRoot = DEFAULT_APP_ROOT,
  audioAbs: _0x5acd63,
  downloadModelIfMissing = true,
  durationSec = 0,
  engine = "cpu",
  modelRoot: _0xea5dab,
  pythonCommand: _0x139b61,
  certificateEnv = {},
  prepareOnly = false,
  checkRuntimeOnly = false,
  queue: _0x61d693,
  spawnImpl = spawn,
  task: _0x73ffee
} = {}) {
  if (!_0x139b61) {
    throw new Error("Python runtime is unavailable");
  }
  if (!_0xea5dab) {
    throw new Error("Sortformer model directory is unavailable");
  }
  mkdirSync(_0xea5dab, {
    recursive: true
  });
  return new Promise((_0x4083e0, _0x19f337) => {
    _0x61d693?.throwIfCancelled?.(_0x73ffee);
    const _0x3c39be = buildSortformerDiarizationArgs({
      audioAbs: _0x5acd63,
      modelRoot: _0xea5dab,
      durationSec: durationSec,
      downloadModelIfMissing: downloadModelIfMissing,
      engine: engine,
      prepareOnly: prepareOnly,
      checkRuntimeOnly: checkRuntimeOnly
    });
    const _0xe7b2aa = spawnImpl(_0x139b61, _0x3c39be, {
      cwd: appRoot,
      env: buildSortformerEnv(_0xea5dab, process.env, certificateEnv),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    _0x73ffee.child = _0xe7b2aa;
    let _0x4d1231 = null;
    let _0x5f5047 = null;
    let _0x1ea98b = "";
    let _0x51fb2a = "";
    let _0x1a19f2 = 0.52;
    const _0xc2513d = setInterval(() => {
      if (_0x61d693?.isCancelled?.(_0x73ffee)) {
        try {
          _0xe7b2aa.kill();
        } catch {}
        return;
      }
      _0x1a19f2 = Math.min(0.79, _0x1a19f2 + 0.004);
      _0x61d693?.emitProgress?.(_0x73ffee, _0x1a19f2, "Preparing speaker separation", {
        stage: AUDIO_VOICE_ASR_STAGE.DIARIZATION_MODEL_PREPARE
      });
    }, 2000);
    const _0x1c8f0f = (_0x49c304, _0x49b232) => {
      clearInterval(_0xc2513d);
      if (_0x73ffee.child === _0xe7b2aa) {
        _0x73ffee.child = null;
      }
      _0x49c304(_0x49b232);
    };
    const _0x311c9a = _0x5aa158 => {
      const _0x5317e9 = parseJsonLine(_0x5aa158);
      if (!_0x5317e9) {
        return;
      }
      if (_0x5317e9.type === "progress") {
        const _0x43b358 = mapFunasrProgressToOverall(_0x5317e9.stage, _0x5317e9.progress);
        _0x1a19f2 = Math.max(_0x1a19f2, _0x43b358);
        _0x61d693?.emitProgress?.(_0x73ffee, _0x1a19f2, _0x5317e9.message || "Separating speakers", {
          stage: _0x5317e9.stage || AUDIO_VOICE_ASR_STAGE.DIARIZE
        });
      } else if (_0x5317e9.type === "result") {
        _0x4d1231 = _0x5317e9;
      } else if (_0x5317e9.type === "error") {
        _0x5f5047 = _0x5317e9;
      }
    };
    _0xe7b2aa.stdout?.on("data", _0x189a60 => {
      _0x1ea98b += Buffer.from(_0x189a60).toString("utf8");
      const _0x162779 = _0x1ea98b.split(/\r?\n/);
      _0x1ea98b = _0x162779.pop() || "";
      _0x162779.forEach(_0x311c9a);
    });
    _0xe7b2aa.stderr?.on("data", _0xa3e3d1 => {
      _0x51fb2a += Buffer.from(_0xa3e3d1).toString("utf8");
    });
    _0xe7b2aa.once("error", _0x1163bc => _0x1c8f0f(_0x19f337, createProcessStartError(_0x139b61, _0x3c39be, {
      cwd: appRoot
    }, _0x1163bc, 1)));
    _0xe7b2aa.once("exit", (_0x94d39a, _0x11c820) => {
      if (_0x1ea98b) {
        _0x311c9a(_0x1ea98b);
      }
      if (_0x61d693?.isCancelled?.(_0x73ffee)) {
        _0x1c8f0f(_0x19f337, new MediaTaskCancelledError());
        return;
      }
      if (_0x94d39a === 0 && _0x4d1231) {
        _0x1c8f0f(_0x4083e0, _0x4d1231);
        return;
      }
      const _0x3ee6dc = String(_0x5f5047?.message || "").trim() || _0x51fb2a.trim() || "Sortformer exited with " + (_0x94d39a ?? _0x11c820 ?? "unknown");
      _0x1c8f0f(_0x19f337, new Error(_0x3ee6dc));
    });
  });
}
async function detectSpeechSegmentsWithSilence({
  durationSec: _0x4d4801,
  getRuntimeToolOrFallback: _0x3ac052,
  options: _0x300f8c,
  queue: _0x2b9fb2,
  sourceAbs: _0x591299,
  task: _0x249e3c
}) {
  _0x2b9fb2.emitProgress(_0x249e3c, 0.12, "Detecting voice segments", {
    stage: AUDIO_VOICE_ASR_STAGE.TRANSCRIBE
  });
  const _0x3b1ed0 = await _0x2b9fb2.runProcess(_0x249e3c, _0x3ac052("ffmpeg"), ["-hide_banner", "-i", _0x591299, "-vn", "-af", "silencedetect=noise=" + _0x300f8c.noiseDb + "dB:d=" + _0x300f8c.minSilenceSec, "-f", "null", "-"]);
  const _0x42886b = Buffer.concat([_0x3b1ed0.stdout || Buffer.alloc(0), _0x3b1ed0.stderr || Buffer.alloc(0)]).toString("utf8");
  return buildAudioVoiceSpeechSegments({
    silenceRanges: parseSilenceDetectRanges(_0x42886b, _0x4d4801),
    durationSec: _0x4d4801,
    paddingMs: _0x300f8c.paddingMs
  }).map(_0x359229 => ({
    ..._0x359229,
    sourceText: ""
  }));
}
async function extractAsrAudio({
  asrAudioAbs: _0x5a368b,
  getRuntimeToolOrFallback: _0x10e616,
  queue: _0x364c57,
  sourceAbs: _0x515012,
  task: _0x4530ce
}) {
  _0x364c57.emitProgress(_0x4530ce, 0.04, "Preparing audio for subtitles", {
    stage: AUDIO_VOICE_ASR_STAGE.MODEL_PREPARE
  });
  await _0x364c57.runProcess(_0x4530ce, _0x10e616("ffmpeg"), ["-y", "-i", _0x515012, "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", _0x5a368b]);
}
async function extractDoubaoAsrAudio({
  asrAudioAbs: _0x31bc66,
  getRuntimeToolOrFallback: _0x58627a,
  queue: _0x41c20a,
  sourceAbs: _0x11a8ca,
  task: _0x5cbb38
}) {
  _0x41c20a.emitProgress(_0x5cbb38, 0.04, "Preparing audio for subtitles", {
    stage: AUDIO_VOICE_ASR_STAGE.MODEL_PREPARE
  });
  await _0x41c20a.runProcess(_0x5cbb38, _0x58627a("ffmpeg"), ["-y", "-i", _0x11a8ca, "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "16000", "-c:a", "libmp3lame", "-b:a", "64k", _0x31bc66]);
}
export function createAudioVoiceAnalyzeMediaTaskHandler({
  createOutputFilename: _0x29f3d0,
  ffprobeHasAudio: _0x168057,
  ffprobeVideoMeta: _0x3adab8,
  getDoubaoAsrConfig: _0x3e2cb9,
  getFunasrModelRootDir: _0x2e6441,
  getPythonCertificateEnv: _0x5e956c,
  getSortformerModelRootDir: _0x270e7f,
  getOutputDir: _0x41dd9f,
  getRuntimeToolOrFallback: _0x39f43b,
  resolveMediaTaskSource: _0x3e11ea,
  resolvePythonCommand: _0x5f48c1,
  runDoubaoAsrTranscription: _0x10cfda = runDoubaoAsrTranscription,
  runFunasrTranscription = runFunasrTranscriptionProcess,
  runSortformerDiarization = runSortformerDiarizationProcess,
  toOutputLocalPath: _0x1b7071,
  appRoot = DEFAULT_APP_ROOT
}) {
  return async (_0x3642b4, _0x4c7f36) => {
    const _0x7e397f = _0x3e11ea(_0x3642b4.payload.src);
    const _0x5eb7eb = _0x3642b4.payload.args || {};
    const _0x41b114 = normalizeSilenceOptions(_0x5eb7eb);
    const _0x3028dd = await _0x3adab8(_0x4c7f36, _0x3642b4, _0x7e397f);
    const _0x47a24c = !!_0x3028dd.width && !!_0x3028dd.height;
    if (!(await _0x168057(_0x4c7f36, _0x3642b4, _0x7e397f))) {
      if (!_0x47a24c) {
        throw new Error("Source media has no audio stream");
      }
      throw new Error("Source video has no audio stream");
    }
    const _0x555a83 = Math.max(0, Number(_0x3028dd.duration || 0));
    if (!(_0x555a83 > 0)) {
      throw new Error("Source media duration is unavailable");
    }
    const _0x5d5c6e = a255_0x7fbdec.join(_0x41dd9f(), "AudioVoiceAnalyze");
    const _0x51569a = a255_0x7fbdec.join(_0x41dd9f(), "AudioVoiceSegments");
    mkdirSync(_0x5d5c6e, {
      recursive: true
    });
    mkdirSync(_0x51569a, {
      recursive: true
    });
    const _0x599808 = normalizeAsrProvider(_0x5eb7eb);
    const _0x507f82 = _0x599808 === "doubao";
    const _0x5d17ef = _0x599808 === "funasr";
    let _0x43ab0f = "";
    let _0x3e7ac3 = [];
    let _0x4a9506 = "";
    let _0x5e31dd = "";
    let _0xdbcd4f = "";
    let _0x383c55 = "none";
    if (_0x507f82 || _0x5d17ef) {
      _0x4c7f36.emitProgress(_0x3642b4, 0.02, "Preparing subtitle recognition model", {
        stage: _0x5d17ef ? AUDIO_VOICE_ASR_STAGE.MODEL_DOWNLOAD : AUDIO_VOICE_ASR_STAGE.MODEL_PREPARE
      });
      const _0x547417 = _0x29f3d0("source_asr", _0x507f82 ? "mp3" : "wav");
      const _0x909474 = a255_0x7fbdec.join(_0x5d5c6e, _0x547417);
      await (_0x507f82 ? extractDoubaoAsrAudio : extractAsrAudio)({
        asrAudioAbs: _0x909474,
        getRuntimeToolOrFallback: _0x39f43b,
        queue: _0x4c7f36,
        sourceAbs: _0x7e397f,
        task: _0x3642b4
      });
      if (_0x507f82) {
        const _0x28d639 = _0x3e2cb9?.() || {};
        _0x4a9506 = String(_0x28d639.baseUrl || _0x28d639.apiUrl || "").trim();
        const _0xe1cde1 = await _0x10cfda({
          audioAbs: _0x909474,
          credentials: _0x28d639,
          durationSec: _0x555a83,
          queue: _0x4c7f36,
          task: _0x3642b4
        });
        const _0x37e0cd = mergeFunasrTranscriptSegments(normalizeDoubaoAsrSegments(_0xe1cde1, _0x555a83));
        if (hasRecognizedTranscriptText(_0x37e0cd)) {
          _0x3e7ac3 = _0x37e0cd;
        } else {
          _0x43ab0f = "empty";
        }
      } else {
        _0x5e31dd = String(_0x2e6441?.() || "").trim();
        if (!_0x5e31dd) {
          throw new Error("FunASR model directory is unavailable");
        }
        mkdirSync(_0x5e31dd, {
          recursive: true
        });
        _0x383c55 = normalizeDiarizationProvider(_0x5eb7eb);
        const _0x3195a0 = await runFunasrTranscription({
          appRoot: appRoot,
          audioAbs: _0x909474,
          downloadModelIfMissing: _0x5eb7eb.downloadModelIfMissing !== false,
          durationSec: _0x555a83,
          engine: normalizeFunasrEngine(_0x5eb7eb.engine),
          modelRoot: _0x5e31dd,
          pythonCommand: _0x5f48c1?.(),
          certificateEnv: _0x5e956c?.() || {},
          queue: _0x4c7f36,
          task: _0x3642b4
        });
        const _0xe49044 = normalizeFunasrTranscriptSegments(_0x3195a0, _0x555a83);
        let _0x5c2497 = stripTranscriptSpeakerLabels(_0xe49044);
        if (_0x383c55 === "sortformer" && _0xe49044.length) {
          _0xdbcd4f = String(_0x270e7f?.() || resolveSortformerModelRootFromFunasrRoot(_0x5e31dd)).trim();
          if (!_0xdbcd4f) {
            throw new Error("Sortformer model directory is unavailable");
          }
          mkdirSync(_0xdbcd4f, {
            recursive: true
          });
          _0x4c7f36.emitProgress(_0x3642b4, 0.52, "Preparing speaker separation model", {
            stage: AUDIO_VOICE_ASR_STAGE.DIARIZATION_MODEL_DOWNLOAD
          });
          const _0x50384e = await runSortformerDiarization({
            appRoot: appRoot,
            audioAbs: _0x909474,
            downloadModelIfMissing: _0x5eb7eb.downloadModelIfMissing !== false,
            durationSec: _0x555a83,
            engine: normalizeFunasrEngine(_0x5eb7eb.engine),
            modelRoot: _0xdbcd4f,
            pythonCommand: _0x5f48c1?.(),
            certificateEnv: _0x5e956c?.() || {},
            queue: _0x4c7f36,
            task: _0x3642b4
          });
          _0x5c2497 = assignDiarizationSpeakersToTranscriptSegments(_0xe49044, normalizeDiarizationSegments(_0x50384e, _0x555a83));
        }
        const _0x277a01 = mergeFunasrTranscriptSegments(_0x5c2497);
        if (hasRecognizedTranscriptText(_0x277a01)) {
          _0x3e7ac3 = _0x277a01;
        } else {
          _0x43ab0f = "empty";
        }
      }
    }
    if (!_0x3e7ac3.length) {
      _0x3e7ac3 = await detectSpeechSegmentsWithSilence({
        durationSec: _0x555a83,
        getRuntimeToolOrFallback: _0x39f43b,
        options: _0x41b114,
        queue: _0x4c7f36,
        sourceAbs: _0x7e397f,
        task: _0x3642b4
      });
    }
    const _0x2fd57b = _0x29f3d0("source_audio", "mp3");
    const _0x82fd7d = a255_0x7fbdec.join(_0x5d5c6e, _0x2fd57b);
    const _0xfdfec8 = _0x1b7071("AudioVoiceAnalyze", _0x2fd57b);
    _0x4c7f36.emitProgress(_0x3642b4, 0.56, "Extracting source audio", {
      stage: AUDIO_VOICE_ASR_STAGE.SLICE
    });
    await _0x4c7f36.runProcess(_0x3642b4, _0x39f43b("ffmpeg"), ["-y", "-i", _0x7e397f, "-map", "0:a:0", "-vn", "-c:a", "libmp3lame", "-b:a", "192k", _0x82fd7d]);
    const _0x2c8897 = [];
    for (let _0x4e6ca2 = 0; _0x4e6ca2 < _0x3e7ac3.length; _0x4e6ca2 += 1) {
      const _0x43066a = _0x3e7ac3[_0x4e6ca2];
      const _0x59fc96 = _0x29f3d0("segment_" + (_0x4e6ca2 + 1), "mp3");
      const _0x2fd386 = a255_0x7fbdec.join(_0x51569a, _0x59fc96);
      const _0x39b9e9 = _0x1b7071("AudioVoiceSegments", _0x59fc96);
      _0x4c7f36.emitProgress(_0x3642b4, Math.min(0.95, 0.62 + _0x4e6ca2 / Math.max(1, _0x3e7ac3.length) * 0.33), "Cutting sentence audio", {
        stage: AUDIO_VOICE_ASR_STAGE.SLICE
      });
      await _0x4c7f36.runProcess(_0x3642b4, _0x39f43b("ffmpeg"), buildAudioVoiceSegmentCutArgs({
        sourceAudioAbs: _0x82fd7d,
        outAbs: _0x2fd386,
        startMs: _0x43066a.startMs,
        endMs: _0x43066a.endMs
      }));
      _0x2c8897.push({
        id: "audio-voice-segment-" + (_0x4e6ca2 + 1),
        startMs: _0x43066a.startMs,
        endMs: _0x43066a.endMs,
        sourceText: String(_0x43066a.sourceText || ""),
        ...(_0x43066a.speaker ? {
          speaker: _0x43066a.speaker
        } : {}),
        sourceAudioLocalPath: _0x39b9e9,
        sourceAudioUrl: "/" + _0x39b9e9
      });
    }
    return {
      success: true,
      durationSec: _0x555a83,
      sourceAudio: {
        localPath: _0xfdfec8,
        url: "/" + _0xfdfec8
      },
      asr: {
        provider: _0x507f82 ? "doubao" : _0x5d17ef ? "funasr" : "silence",
        baseUrl: _0x507f82 ? _0x4a9506 : "",
        modelRoot: _0x5d17ef ? _0x5e31dd : "",
        diarizationProvider: _0x383c55,
        diarizationModelRoot: _0xdbcd4f,
        fallbackReason: _0x43ab0f
      },
      segments: _0x2c8897
    };
  };
}
export function createFunasrModelPrepareMediaTaskHandler({
  getFunasrModelRootDir: _0x3d153a,
  getPythonCertificateEnv: _0x3c8924,
  resolvePythonCommand: _0x5197e9,
  runFunasrTranscription = runFunasrTranscriptionProcess,
  appRoot = DEFAULT_APP_ROOT
} = {}) {
  return async (_0x49f615, _0x5979c5) => {
    const _0x553435 = _0x49f615?.payload?.args || {};
    const _0x25b3c4 = normalizeFunasrEngine(_0x553435.engine);
    const _0x433ca0 = String(_0x3d153a?.() || "").trim();
    if (!_0x433ca0) {
      throw new Error("FunASR model directory is unavailable");
    }
    mkdirSync(_0x433ca0, {
      recursive: true
    });
    _0x5979c5?.emitProgress?.(_0x49f615, 0.01, "Preparing subtitle recognition model", {
      stage: AUDIO_VOICE_ASR_STAGE.MODEL_DOWNLOAD
    });
    const _0x5899bf = await runFunasrTranscription({
      appRoot: appRoot,
      downloadModelIfMissing: _0x553435.downloadModelIfMissing !== false,
      engine: _0x25b3c4,
      modelRoot: _0x433ca0,
      prepareOnly: true,
      pythonCommand: _0x5197e9?.(),
      certificateEnv: _0x3c8924?.() || {},
      queue: _0x5979c5,
      task: _0x49f615
    });
    return {
      success: true,
      provider: "funasr",
      engine: _0x25b3c4,
      ready: true,
      prepared: _0x5899bf?.prepared !== false
    };
  };
}
export function createAudioVoiceModelPrepareMediaTaskHandler({
  getFunasrModelRootDir: _0x52b62e,
  getPythonCertificateEnv: _0x1d8a6b,
  getSortformerModelRootDir: _0xae4d98,
  resolvePythonCommand: _0x342107,
  runFunasrTranscription = runFunasrTranscriptionProcess,
  runSortformerDiarization = runSortformerDiarizationProcess,
  appRoot = DEFAULT_APP_ROOT
} = {}) {
  return async (_0x16717d, _0x425d5f) => {
    const _0x1e5595 = _0x16717d?.payload?.args || {};
    const _0x51b2d6 = normalizeFunasrEngine(_0x1e5595.engine);
    const _0x189876 = String(_0x52b62e?.() || "").trim();
    if (!_0x189876) {
      throw new Error("FunASR model directory is unavailable");
    }
    mkdirSync(_0x189876, {
      recursive: true
    });
    const _0xc48eb8 = String(_0xae4d98?.() || resolveSortformerModelRootFromFunasrRoot(_0x189876)).trim();
    if (!_0xc48eb8) {
      throw new Error("Sortformer model directory is unavailable");
    }
    mkdirSync(_0xc48eb8, {
      recursive: true
    });
    _0x425d5f?.emitProgress?.(_0x16717d, 0.01, "Preparing subtitle recognition model", {
      stage: AUDIO_VOICE_ASR_STAGE.MODEL_DOWNLOAD
    });
    await runFunasrTranscription({
      appRoot: appRoot,
      downloadModelIfMissing: _0x1e5595.downloadModelIfMissing !== false,
      engine: _0x51b2d6,
      modelRoot: _0x189876,
      prepareOnly: true,
      pythonCommand: _0x342107?.(),
      certificateEnv: _0x1d8a6b?.() || {},
      queue: _0x425d5f,
      task: _0x16717d
    });
    _0x425d5f?.emitProgress?.(_0x16717d, 0.52, "Preparing speaker separation model", {
      stage: AUDIO_VOICE_ASR_STAGE.DIARIZATION_MODEL_DOWNLOAD
    });
    const _0x2d780f = await runSortformerDiarization({
      appRoot: appRoot,
      downloadModelIfMissing: _0x1e5595.downloadModelIfMissing !== false,
      engine: _0x51b2d6,
      modelRoot: _0xc48eb8,
      prepareOnly: true,
      pythonCommand: _0x342107?.(),
      certificateEnv: _0x1d8a6b?.() || {},
      queue: _0x425d5f,
      task: _0x16717d
    });
    _0x425d5f?.emitProgress?.(_0x16717d, 1, "Audio voice models are ready", {
      stage: AUDIO_VOICE_ASR_STAGE.DIARIZE
    });
    return {
      success: true,
      provider: "audioVoice",
      asrProvider: "funasr",
      diarizationProvider: "sortformer",
      engine: _0x51b2d6,
      ready: true,
      funasrModelRoot: _0x189876,
      sortformerModelRoot: _0xc48eb8,
      prepared: _0x2d780f?.prepared !== false
    };
  };
}
export function createFunasrRuntimeCheckMediaTaskHandler({
  getFunasrModelRootDir: _0x3c88c7,
  getPythonCertificateEnv: _0x5008d3,
  resolvePythonCommand: _0x22372c,
  runFunasrTranscription = runFunasrTranscriptionProcess,
  appRoot = DEFAULT_APP_ROOT
} = {}) {
  return async (_0x31c6df, _0x28f168) => {
    const _0x449edf = _0x31c6df?.payload?.args || {};
    const _0x879e8c = normalizeFunasrEngine(_0x449edf.engine);
    const _0x3a15ed = String(_0x3c88c7?.() || "").trim();
    if (!_0x3a15ed) {
      throw new Error("FunASR model directory is unavailable");
    }
    mkdirSync(_0x3a15ed, {
      recursive: true
    });
    _0x28f168?.emitProgress?.(_0x31c6df, 0.01, "Checking recognition runtime", {
      stage: AUDIO_VOICE_ASR_STAGE.MODEL_PREPARE
    });
    const _0x548b18 = await runFunasrTranscription({
      appRoot: appRoot,
      checkRuntimeOnly: true,
      downloadModelIfMissing: false,
      engine: _0x879e8c,
      modelRoot: _0x3a15ed,
      pythonCommand: _0x22372c?.(),
      certificateEnv: _0x5008d3?.() || {},
      queue: _0x28f168,
      task: _0x31c6df
    });
    return {
      success: true,
      provider: "funasr",
      engine: _0x879e8c,
      available: _0x548b18?.available !== false,
      code: String(_0x548b18?.code || ""),
      message: String(_0x548b18?.message || ""),
      device: String(_0x548b18?.device || "")
    };
  };
}
export function createFunasrGpuTorchInstallMediaTaskHandler({
  getFunasrModelRootDir: _0x486aeb,
  getPythonCertificateEnv: _0xed0346,
  resolvePythonCommand: _0x3a94a8,
  runPipInstall = runPipInstallProcess,
  runFunasrTranscription = runFunasrTranscriptionProcess,
  torchIndexUrl = DEFAULT_FUNASR_GPU_TORCH_INDEX_URL,
  torchPackages = DEFAULT_FUNASR_GPU_TORCH_PACKAGES,
  appRoot = DEFAULT_APP_ROOT
} = {}) {
  return async (_0x459dd0, _0x92e91e) => {
    const _0xa23029 = _0x459dd0?.payload?.args || {};
    const _0x2322f0 = String(_0x486aeb?.() || "").trim();
    if (!_0x2322f0) {
      throw new Error("FunASR model directory is unavailable");
    }
    mkdirSync(_0x2322f0, {
      recursive: true
    });
    const _0x4fec03 = _0x3a94a8?.();
    if (!_0x4fec03) {
      throw new Error("Python runtime is unavailable");
    }
    const _0x24a0f3 = await detectNvidiaGpuNameForInstall({
      queue: _0x92e91e,
      task: _0x459dd0
    });
    const _0x4b4184 = buildFunasrGpuTorchInstallArgs({
      indexUrl: _0xa23029.torchIndexUrl || torchIndexUrl,
      packages: Array.isArray(_0xa23029.torchPackages) ? _0xa23029.torchPackages : torchPackages
    });
    _0x92e91e?.emitProgress?.(_0x459dd0, 0.12, "Installing GPU acceleration component", {
      stage: FUNASR_GPU_TORCH_STAGE.INSTALL
    });
    await runPipInstall({
      appRoot: appRoot,
      env: buildFunasrEnv(_0x2322f0, process.env, _0xed0346?.() || {}),
      pipArgs: _0x4b4184,
      pythonCommand: _0x4fec03,
      queue: _0x92e91e,
      task: _0x459dd0
    });
    _0x92e91e?.emitProgress?.(_0x459dd0, 0.9, "Verifying GPU acceleration", {
      stage: FUNASR_GPU_TORCH_STAGE.VERIFY
    });
    const _0x54f64c = await runFunasrTranscription({
      appRoot: appRoot,
      checkRuntimeOnly: true,
      downloadModelIfMissing: false,
      engine: "gpu",
      modelRoot: _0x2322f0,
      pythonCommand: _0x4fec03,
      queue: _0x92e91e,
      task: _0x459dd0
    });
    if (_0x54f64c?.available === false) {
      throw new Error(String(_0x54f64c?.message || "GPU acceleration is still unavailable"));
    }
    return {
      success: true,
      provider: "funasr",
      engine: "gpu",
      gpuName: _0x24a0f3,
      installed: true,
      verified: true,
      device: String(_0x54f64c?.device || "cuda:0"),
      torchVersion: String(_0x54f64c?.torchVersion || ""),
      torchCuda: String(_0x54f64c?.torchCuda || "")
    };
  };
}