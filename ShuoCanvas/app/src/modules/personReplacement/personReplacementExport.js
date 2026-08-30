import { saveMediaDownload, saveMediaFilesDownload } from "../../services/downloadSaveService.js";
import { localPathToUrl, normalizeLocalPath } from "../../utils/localMediaPath.js";
export const PERSON_REPLACEMENT_EXPORT_MODES = Object.freeze({
  FINAL_VIDEO: "final-video",
  CURRENT_CLIP: "current-clip",
  ALL_REPLACEMENT_CLIPS: "all-replacement-clips",
  ALL_CLIPS_AND_IMAGES: "all-clips-and-images"
});
function normalizeText(_0x33097a) {
  return String(_0x33097a || "").trim();
}
function normalizeMode(_0x39edc1) {
  const _0x54385 = normalizeText(_0x39edc1);
  if (Object.values(PERSON_REPLACEMENT_EXPORT_MODES).includes(_0x54385)) {
    return _0x54385;
  }
  return PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP;
}
function formatSequence(_0x54c236) {
  return String(_0x54c236 + 1).padStart(2, "0");
}
function resolveMediaExtension(_0x1e4fa0, _0x58ecc7) {
  const _0x1470fe = normalizeText(_0x1e4fa0).replace(/[?#].*$/, "").match(/\.([a-z0-9]{2,10})$/i);
  return normalizeText(_0x1470fe?.[1]).toLowerCase() || _0x58ecc7;
}
function buildMediaFile({
  ref: _0x3cf465,
  kind: _0x52069e,
  filename: _0x2152c1
}) {
  const _0x3035fc = normalizeText(_0x3cf465);
  if (!_0x3035fc) {
    return null;
  }
  const _0x5dc0e6 = normalizeLocalPath(_0x3035fc);
  return {
    kind: _0x52069e,
    localPath: _0x5dc0e6,
    url: localPathToUrl(_0x5dc0e6) || _0x3035fc,
    filename: _0x2152c1
  };
}
function buildReplacementVideoFile(_0x9c6659, _0x33d98d) {
  const _0x359ab7 = normalizeText(_0x9c6659?.resultVideoRef);
  if (!_0x359ab7) {
    return null;
  }
  return buildMediaFile({
    ref: _0x359ab7,
    kind: "video",
    filename: "镜头片段" + formatSequence(_0x33d98d) + "-替换视频." + resolveMediaExtension(_0x359ab7, "mp4")
  });
}
function buildReplacementImageFile(_0x2061d3, _0x1b1545) {
  const _0x6acb96 = normalizeText(_0x2061d3?.replacementImageRef);
  if (!_0x6acb96) {
    return null;
  }
  return buildMediaFile({
    ref: _0x6acb96,
    kind: "image",
    filename: "镜头片段" + formatSequence(_0x1b1545) + "-替换图." + resolveMediaExtension(_0x6acb96, "png")
  });
}
function buildReplacementAudioFile(_0x1ca624) {
  const _0x21a376 = normalizeText(_0x1ca624?.audio?.replacementAudioRef);
  if (!_0x21a376) {
    return null;
  }
  return buildMediaFile({
    ref: _0x21a376,
    kind: "audio",
    filename: "替换音频." + resolveMediaExtension(_0x21a376, "wav")
  });
}
function buildFinalVideoFile(_0x4953c7) {
  const _0x591926 = normalizeText(_0x4953c7?.output?.finalVideoRef);
  if (!_0x591926) {
    return null;
  }
  return buildMediaFile({
    ref: _0x591926,
    kind: "video",
    filename: "完整视频." + resolveMediaExtension(_0x591926, "mp4")
  });
}
function createSkippedEntry(_0x354618, _0x3c155e, _0x26fe98) {
  return {
    shotId: normalizeText(_0x354618?.id),
    shotName: "镜头片段" + formatSequence(_0x3c155e),
    kind: _0x26fe98
  };
}
export function buildPersonReplacementExportPlan({
  project = {},
  mode = PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP
} = {}) {
  const _0xb06c26 = normalizeMode(mode);
  const _0x8ca52 = Array.isArray(project.shots) ? project.shots : [];
  const _0x4bfd14 = [];
  const _0x3b8df2 = [];
  if (_0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.FINAL_VIDEO) {
    const _0x3ba4b7 = buildFinalVideoFile(project);
    if (!_0x3ba4b7) {
      throw new Error("完整视频尚未封装，请先完成视频与音轨合成。");
    }
    _0x4bfd14.push(_0x3ba4b7);
  } else if (_0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP) {
    const _0x35d4e7 = normalizeText(project.workspace?.selectedShotId);
    const _0x13867c = _0x8ca52.findIndex(_0x39aa85 => normalizeText(_0x39aa85?.id) === _0x35d4e7);
    if (_0x13867c < 0) {
      throw new Error("请先选择要导出的镜头片段。");
    }
    const _0x183c02 = buildReplacementVideoFile(_0x8ca52[_0x13867c], _0x13867c);
    if (!_0x183c02) {
      throw new Error("当前片段还没有可导出的替换视频。");
    }
    _0x4bfd14.push(_0x183c02);
  } else {
    _0x8ca52.forEach((_0x5c6bfa, _0xaa2564) => {
      const _0x58a693 = buildReplacementVideoFile(_0x5c6bfa, _0xaa2564);
      if (_0x58a693) {
        _0x4bfd14.push(_0x58a693);
      } else {
        _0x3b8df2.push(createSkippedEntry(_0x5c6bfa, _0xaa2564, "video"));
      }
      if (_0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.ALL_CLIPS_AND_IMAGES) {
        const _0x3a224d = buildReplacementImageFile(_0x5c6bfa, _0xaa2564);
        if (_0x3a224d) {
          _0x4bfd14.push(_0x3a224d);
        } else {
          _0x3b8df2.push(createSkippedEntry(_0x5c6bfa, _0xaa2564, "image"));
        }
      }
    });
    const _0x2603ee = buildReplacementAudioFile(project);
    if (_0x2603ee) {
      _0x4bfd14.push(_0x2603ee);
    }
    if (!_0x4bfd14.length) {
      throw new Error(_0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.ALL_CLIPS_AND_IMAGES ? "当前项目还没有可导出的替换片段、音频或替换图。" : "当前项目还没有可导出的替换片段或音频。");
    }
  }
  const _0x61dd85 = _0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.FINAL_VIDEO ? "导出完整视频" : _0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP ? "导出当前片段" : _0xb06c26 === PERSON_REPLACEMENT_EXPORT_MODES.ALL_REPLACEMENT_CLIPS ? "导出所有替换片段/音频" : "导出所有片段/音频+替换图";
  return {
    mode: _0xb06c26,
    title: _0x61dd85,
    files: _0x4bfd14,
    skipped: _0x3b8df2
  };
}
export async function exportPersonReplacementMedia({
  project = {},
  mode = PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP,
  saveMedia = saveMediaDownload,
  saveMediaFiles = saveMediaFilesDownload
} = {}) {
  const _0x5aecbb = buildPersonReplacementExportPlan({
    project: project,
    mode: mode
  });
  const _0x2fddd2 = _0x5aecbb.mode === PERSON_REPLACEMENT_EXPORT_MODES.FINAL_VIDEO || _0x5aecbb.mode === PERSON_REPLACEMENT_EXPORT_MODES.CURRENT_CLIP ? await saveMedia({
    ..._0x5aecbb.files[0],
    title: _0x5aecbb.title
  }) : await saveMediaFiles({
    title: _0x5aecbb.title,
    files: _0x5aecbb.files
  });
  return {
    ..._0x2fddd2,
    mode: _0x5aecbb.mode,
    requestedCount: _0x5aecbb.files.length + _0x5aecbb.skipped.length,
    exportedCount: _0x2fddd2?.count ?? _0x5aecbb.files.length,
    skipped: _0x5aecbb.skipped,
    skippedCount: _0x5aecbb.skipped.length
  };
}