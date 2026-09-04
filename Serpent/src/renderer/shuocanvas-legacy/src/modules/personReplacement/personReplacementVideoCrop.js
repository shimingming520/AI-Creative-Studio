import { localPathToUrl } from "../../utils/localMediaPath.js";
function normalizeText(_0x74c2d0) {
  return String(_0x74c2d0 ?? "").trim();
}
function normalizeMediaUrl(_0x2e07ff) {
  const _0x1384e1 = normalizeText(_0x2e07ff);
  if (_0x1384e1) {
    return localPathToUrl(_0x1384e1) || _0x1384e1;
  } else {
    return "";
  }
}
function findShot(_0x396c41 = {}, _0xe1e4da = "") {
  const _0x382666 = normalizeText(_0xe1e4da);
  return (Array.isArray(_0x396c41?.shots) ? _0x396c41.shots : []).find(_0x31fc65 => normalizeText(_0x31fc65?.id) === _0x382666) || null;
}
export function isPersonReplacementVideoCropReverseRunning(_0x31501b = {}) {
  return normalizeText(_0x31501b.materializationStatus) === "running" && Boolean(_0x31501b.isReversed) !== Boolean(_0x31501b.materializedIsReversed);
}
export function assertPersonReplacementVideoCropSourceCurrent({
  project = {},
  projectId = "",
  shotId = "",
  result = {}
} = {}) {
  const _0x5641fe = normalizeText(projectId);
  const _0x3e7e4a = findShot(project, shotId);
  const _0x368dcc = normalizeText(result?.sourceLocalPath);
  const _0x443957 = typeof result?.isReversed === "boolean" ? result.isReversed : _0x3e7e4a?.isReversed === true;
  if (_0x5641fe && normalizeText(project?.id) !== _0x5641fe) {
    throw new Error("当前项目已切换，请重新打开裁剪。");
  }
  if (!_0x3e7e4a || _0x368dcc && normalizeText(_0x3e7e4a.videoRef) !== _0x368dcc || Boolean(_0x3e7e4a.isReversed) !== _0x443957 || Boolean(_0x3e7e4a.materializedIsReversed) !== _0x443957) {
    throw new Error("当前片段的倒放状态已变化，请重新打开裁剪。");
  }
  return _0x3e7e4a;
}
function createReverseControl({
  selectedShot: _0x5e5f0c,
  getProject: _0x10f86a,
  acceptProject: _0x14a746,
  requestReverseChange: _0x327186
}) {
  return {
    isReversed: _0x5e5f0c.isReversed === true,
    materializedIsReversed: _0x5e5f0c.materializedIsReversed === true,
    async onChange(_0x95615c) {
      const _0x1d42bd = _0x327186(_0x5e5f0c.id, _0x95615c);
      const _0x34e25d = _0x1d42bd?.then ? await _0x1d42bd : _0x1d42bd;
      if (!_0x34e25d) {
        throw new Error("视频倒放服务不可用");
      }
      const _0x5ef544 = _0x34e25d.completion ? await _0x34e25d.completion : _0x34e25d;
      const _0x42dfd7 = _0x5ef544?.stale === true;
      const _0x323a13 = _0x5ef544?.project || _0x34e25d.project || _0x10f86a();
      const _0x4eb10d = _0x42dfd7 ? _0x10f86a() : _0x14a746(_0x323a13);
      const _0x21af07 = findShot(_0x4eb10d, _0x5e5f0c.id);
      if (!_0x21af07) {
        throw new Error("倒放完成后未找到当前片段");
      }
      return {
        ok: _0x5ef544?.ok !== false && !_0x42dfd7,
        isReversed: _0x21af07.isReversed === true,
        materializedIsReversed: _0x21af07.materializedIsReversed === true,
        sourceLocalPath: normalizeText(_0x21af07.videoRef),
        sourceUrl: normalizeMediaUrl(_0x21af07.videoRef),
        posterUrl: normalizeMediaUrl(_0x21af07.keyframeRef),
        error: _0x5ef544?.error || _0x21af07.error || "",
        suppressToast: true
      };
    }
  };
}
export function createPersonReplacementVideoCropOptions({
  projectId = "",
  selectedShot: _0x1e2079,
  stage: _0x1b840d,
  videoEl: _0x5688c2,
  durationSec = 0,
  getProject = () => ({}),
  acceptProject = _0xce08e2 => _0xce08e2,
  requestReverseChange = () => null,
  onConfirm = () => {},
  onExit = () => {}
} = {}) {
  const _0x1a58e8 = normalizeText(_0x1e2079?.videoRef);
  return {
    anchorId: "person-replacement-video:" + normalizeText(projectId) + ":" + normalizeText(_0x1e2079?.id),
    wrapperEl: _0x1b840d,
    videoEl: _0x5688c2,
    sourceUrl: normalizeMediaUrl(_0x1a58e8),
    sourceLocalPath: _0x1a58e8,
    sourceData: {
      videoDuration: durationSec,
      videoFps: _0x1e2079?.outputFps,
      videoWidth: Number(_0x5688c2?.videoWidth) || Number(_0x1e2079?.frame?.width) || 0,
      videoHeight: Number(_0x5688c2?.videoHeight) || Number(_0x1e2079?.frame?.height) || 0
    },
    posterUrl: normalizeMediaUrl(_0x1e2079?.keyframeRef),
    durationSec: durationSec,
    videoWidth: Number(_0x5688c2?.videoWidth) || Number(_0x1e2079?.frame?.width) || 0,
    videoHeight: Number(_0x5688c2?.videoHeight) || Number(_0x1e2079?.frame?.height) || 0,
    initialStartSec: 0,
    initialEndSec: durationSec,
    dimMode: false,
    reverseControl: createReverseControl({
      selectedShot: _0x1e2079,
      getProject: getProject,
      acceptProject: acceptProject,
      requestReverseChange: requestReverseChange
    }),
    onConfirm: _0xf30f09 => {
      assertPersonReplacementVideoCropSourceCurrent({
        project: getProject(),
        projectId: projectId,
        shotId: _0x1e2079?.id,
        result: _0xf30f09
      });
      return onConfirm(_0xf30f09);
    },
    onExit: onExit
  };
}