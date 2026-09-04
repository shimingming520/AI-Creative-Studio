import { PERSON_REPLACEMENT_CUT_EPSILON_SEC } from "./personReplacementShotCutModel.js";
import { materializePersonReplacementShotPlayback } from "./personReplacementShotReverse.js";
function normalizeText(_0x30e844) {
  return String(_0x30e844 ?? "").trim();
}
function cloneJson(_0x18e3e8) {
  return JSON.parse(JSON.stringify(_0x18e3e8));
}
export function createPersonReplacementVideoPreparationRunner({
  getProject: _0x1fa59f,
  getProjectById = null,
  setProject: _0x54c297,
  setProjectById = null,
  isDestroyed = () => false,
  waitForActiveReverse: _0x1b745c,
  fetchVideoMeta: _0x496c21,
  resolveDurationSec: _0x1c2a30,
  enqueueMediaTask: _0x3b7819,
  resolveMediaRef: _0x148fea,
  showToast: _0x581e23
} = {}) {
  return async function _0x546caa({
    projectId: _0x4ffd98 = "",
    shotIds = null,
    notify = true,
    renderWorkspace = true
  } = {}) {
    const _0x123d07 = Array.isArray(shotIds) && shotIds.length ? new Set(shotIds.map(normalizeText).filter(Boolean)) : null;
    const _0x56332b = () => {
      const _0x2e4746 = normalizeText(_0x4ffd98);
      if (_0x2e4746 && typeof getProjectById === "function") {
        return getProjectById(_0x2e4746);
      } else {
        return _0x1fa59f();
      }
    };
    const _0x5bea46 = (_0x11eef2, _0x31476f = {}) => typeof setProjectById === "function" ? setProjectById(_0x11eef2?.id, _0x11eef2, _0x31476f) : _0x54c297(_0x11eef2, _0x31476f);
    const _0x3626ce = normalizeText(_0x4ffd98 || _0x56332b()?.id);
    await _0x1b745c({
      projectId: _0x3626ce,
      shotIds: _0x123d07
    });
    let _0x318867 = _0x56332b();
    if (isDestroyed() || normalizeText(_0x318867.id) !== _0x3626ce) {
      return {
        ok: false,
        stale: true,
        failures: [],
        project: cloneJson(_0x318867)
      };
    }
    const _0x5d5040 = _0x318867.shots.filter(_0x1b5e9d => (!_0x123d07 || _0x123d07.has(_0x1b5e9d.id)) && (!_0x1b5e9d.videoRef || _0x1b5e9d.materializationStatus !== "succeeded" || Boolean(_0x1b5e9d.materializedIsReversed) !== Boolean(_0x1b5e9d.isReversed)));
    if (!_0x5d5040.length) {
      if (_0x318867.workspace.videoPreparation?.status !== "succeeded" || Number(_0x318867.workspace.videoPreparation?.progress) !== 100 || normalizeText(_0x318867.workspace.videoPreparation?.error)) {
        _0x318867 = _0x5bea46({
          ..._0x318867,
          workspace: {
            ..._0x318867.workspace,
            videoPreparation: {
              status: "succeeded",
              progress: 100,
              error: ""
            }
          }
        }, {
          renderWorkspace: renderWorkspace
        });
      }
      return {
        ok: true,
        project: cloneJson(_0x318867)
      };
    }
    _0x318867 = _0x5bea46({
      ..._0x318867,
      workspace: {
        ..._0x318867.workspace,
        videoPreparation: {
          status: "running",
          progress: 0,
          error: ""
        }
      },
      shots: _0x318867.shots.map(_0x4a0cf3 => _0x5d5040.some(_0xab0cd3 => _0xab0cd3.id === _0x4a0cf3.id) ? {
        ..._0x4a0cf3,
        materializationStatus: "running",
        materializationProgress: 0,
        error: ""
      } : _0x4a0cf3)
    }, {
      renderWorkspace: renderWorkspace
    });
    const _0x48f23e = [];
    for (let _0x44537c = 0; _0x44537c < _0x5d5040.length; _0x44537c += 1) {
      const _0x4ea8f7 = _0x5d5040[_0x44537c].id;
      const _0x5db33d = _0x318867.shots.find(_0x442318 => _0x442318.id === _0x4ea8f7);
      const _0x246237 = _0x318867.sources.find(_0x5eac5c => _0x5eac5c.id === _0x5db33d?.sourceId);
      const _0x247fc0 = _0x5db33d?.sourceVideoRef || _0x246237?.videoRef || "";
      try {
        if (!_0x5db33d || !_0x247fc0) {
          throw new Error("镜头缺少原始视频地址");
        }
        let _0x3d0300 = Number(_0x5db33d.endTimeSec) || 0;
        if (!(_0x3d0300 > _0x5db33d.startTimeSec)) {
          if (typeof _0x496c21 !== "function") {
            throw new Error("无法读取镜头结束时间");
          }
          const _0x4e52aa = _0x1c2a30(await _0x496c21(_0x247fc0));
          if (!(_0x4e52aa > _0x5db33d.startTimeSec)) {
            throw new Error("无法读取原视频时长");
          }
          _0x3d0300 = _0x4e52aa;
        }
        const _0x372798 = [16, 24, 30].includes(Math.round(Number(_0x5db33d.outputFps))) ? Math.round(Number(_0x5db33d.outputFps)) : 24;
        const _0x414085 = {
          shotId: _0x5db33d.id,
          sourceId: _0x5db33d.sourceId,
          startSec: _0x5db33d.startTimeSec,
          endSec: _0x3d0300,
          ...(_0x5db33d.isReversed === true ? {
            isReversed: true
          } : {})
        };
        const {
          videoRef: _0x2c8953,
          videoRefIsCropped: _0x1911d5
        } = await materializePersonReplacementShotPlayback({
          currentShot: {
            ..._0x5db33d,
            endTimeSec: _0x3d0300
          },
          range: _0x414085,
          isNewShot: false,
          sourceVideoRef: _0x247fc0,
          outputFps: _0x372798,
          epsilonSec: PERSON_REPLACEMENT_CUT_EPSILON_SEC,
          enqueueMediaTask: _0x3b7819,
          resolveMediaRef: _0x148fea
        });
        const _0xfd766f = _0x56332b();
        const _0x36c9ad = _0xfd766f.shots.find(_0x2a9246 => _0x2a9246.id === _0x4ea8f7);
        if (isDestroyed() || normalizeText(_0xfd766f.id) !== _0x3626ce) {
          return {
            ok: false,
            stale: true,
            failures: _0x48f23e,
            project: cloneJson(_0xfd766f)
          };
        }
        if (!_0x36c9ad || Boolean(_0x36c9ad.isReversed) !== Boolean(_0x5db33d.isReversed)) {
          _0x318867 = _0xfd766f;
          continue;
        }
        const _0xfb676d = Math.round((_0x44537c + 1) / _0x5d5040.length * 100);
        _0x318867 = _0x5bea46({
          ..._0xfd766f,
          shots: _0xfd766f.shots.map(_0xdbfa70 => _0xdbfa70.id === _0x4ea8f7 ? {
            ..._0xdbfa70,
            sourceVideoRef: _0x247fc0,
            endTimeSec: _0x3d0300,
            durationSec: Math.max(0, _0x3d0300 - _0xdbfa70.startTimeSec),
            videoRef: _0x2c8953,
            videoRefIsCropped: _0x1911d5,
            outputFps: _0x372798,
            materializedIsReversed: _0x5db33d.isReversed === true,
            materializationStatus: "succeeded",
            materializationProgress: 100,
            error: ""
          } : _0xdbfa70),
          workspace: {
            ..._0xfd766f.workspace,
            videoPreparation: {
              status: "running",
              progress: _0xfb676d,
              error: ""
            }
          }
        }, {
          renderWorkspace: false
        });
      } catch (_0x292ab0) {
        const _0x66a07b = _0x292ab0?.message || "镜头切片失败";
        _0x48f23e.push({
          shotId: _0x4ea8f7,
          message: _0x66a07b
        });
        const _0x4cbd95 = _0x56332b();
        _0x318867 = _0x5bea46({
          ..._0x4cbd95,
          shots: _0x4cbd95.shots.map(_0x45b81c => _0x45b81c.id === _0x4ea8f7 ? {
            ..._0x45b81c,
            materializationStatus: "failed",
            materializationProgress: 0,
            error: _0x66a07b
          } : _0x45b81c),
          workspace: {
            ..._0x4cbd95.workspace,
            videoPreparation: {
              status: "running",
              progress: Math.round((_0x44537c + 1) / _0x5d5040.length * 100),
              error: _0x66a07b
            }
          }
        }, {
          renderWorkspace: false
        });
      }
    }
    const _0x52e56b = _0x48f23e.length ? "failed" : "succeeded";
    const _0x3ee248 = _0x48f23e.map(_0x27cebe => _0x27cebe.message).join("；");
    const _0x34cb05 = _0x56332b();
    _0x318867 = _0x5bea46({
      ..._0x34cb05,
      workspace: {
        ..._0x34cb05.workspace,
        videoPreparation: {
          status: _0x52e56b,
          progress: 100,
          error: _0x3ee248
        }
      }
    }, {
      renderWorkspace: renderWorkspace
    });
    if (notify) {
      if (_0x48f23e.length) {
        _0x581e23(_0x3ee248 || "部分镜头切片失败。", "error");
      } else {
        _0x581e23("已准备 " + _0x5d5040.length + " 个固定帧率镜头。", "success");
      }
    }
    return {
      ok: _0x48f23e.length === 0,
      failures: _0x48f23e,
      project: _0x318867
    };
  };
}