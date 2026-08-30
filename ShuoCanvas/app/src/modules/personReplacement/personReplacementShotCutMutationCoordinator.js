function normalizeText(_0xbf23da) {
  return String(_0xbf23da ?? "").trim();
}
function cloneJson(_0x36bdef) {
  return JSON.parse(JSON.stringify(_0x36bdef));
}
export function createPersonReplacementShotCutMutationCoordinator() {
  let _0x572693 = 0;
  const _0x3e7db8 = new Map();
  const _0x37b5b0 = () => {
    _0x572693 += 1;
    return _0x572693;
  };
  const _0x301b77 = _0x5646a3 => {
    const _0x173549 = Number(_0x5646a3);
    if (_0x173549 > 0) {
      _0x572693 = Math.max(_0x572693, _0x173549);
      return _0x173549;
    }
    return _0x37b5b0();
  };
  const _0x432ed4 = _0x1091f1 => Number(_0x1091f1) === _0x572693;
  const _0x496a88 = ({
    projectId: _0x412f9e,
    shotId: _0x4fa79e,
    completion: _0x19209d
  }) => {
    const _0x1fca6a = _0x412f9e + "\0" + _0x4fa79e;
    const _0x5674fa = {
      projectId: _0x412f9e,
      shotId: _0x4fa79e,
      completion: null
    };
    _0x5674fa.completion = Promise.resolve(_0x19209d).finally(() => {
      if (_0x3e7db8.get(_0x1fca6a) === _0x5674fa) {
        _0x3e7db8.delete(_0x1fca6a);
      }
    });
    _0x3e7db8.set(_0x1fca6a, _0x5674fa);
    return _0x5674fa.completion;
  };
  const _0x2e466c = async ({
    projectId: _0x7239b9,
    shotIds = null
  } = {}) => {
    const _0x3c32dd = shotIds instanceof Set ? shotIds : null;
    const _0x3911cd = [..._0x3e7db8.values()].filter(_0x47da50 => _0x47da50.projectId === normalizeText(_0x7239b9) && (!_0x3c32dd || _0x3c32dd.has(_0x47da50.shotId))).map(_0x400120 => _0x400120.completion);
    if (_0x3911cd.length) {
      await Promise.allSettled(_0x3911cd);
    }
  };
  return {
    acceptRevision: _0x301b77,
    getRevision: () => _0x572693,
    invalidate: _0x37b5b0,
    isCurrent: _0x432ed4,
    nextRevision: _0x37b5b0,
    trackReverseCompletion: _0x496a88,
    waitForActiveReverse: _0x2e466c
  };
}
export function createPersonReplacementShotReverseOperation({
  coordinator: _0x4c21b8,
  getProject: _0x54fdc4,
  setProject: _0xbee0fe,
  snapshot: _0x2922f3,
  showToast: _0x1a18c7,
  updateShotCutRanges: _0xd07610,
  isDestroyed = () => false
} = {}) {
  return function _0x2744be({
    shotId: _0x51f85b,
    isReversed = false
  } = {}) {
    const _0x2a48a4 = _0x54fdc4();
    const _0x1c5f70 = normalizeText(_0x51f85b);
    const _0x29dbdd = _0x2a48a4.shots.find(_0x506e64 => normalizeText(_0x506e64.id) === _0x1c5f70);
    if (!_0x29dbdd) {
      throw new Error("未找到需要倒放的片段");
    }
    const _0x7b185e = normalizeText(_0x2a48a4.id);
    const _0x30f7fe = isReversed === true;
    const _0x487993 = _0x29dbdd.isReversed === true;
    const _0x2230b2 = _0x29dbdd.materializedIsReversed === true;
    const _0x304f76 = _0x4c21b8.nextRevision();
    const _0x1ce66a = _0x487993 !== _0x30f7fe;
    const _0x427d78 = Boolean(_0x29dbdd.videoRef) && _0x2230b2 === _0x30f7fe;
    const _0x35bd26 = {
      ..._0x2a48a4,
      shots: _0x2a48a4.shots.map(_0x332bd0 => _0x332bd0.id === _0x1c5f70 ? {
        ..._0x332bd0,
        isReversed: _0x30f7fe,
        materializedIsReversed: _0x2230b2,
        materializationStatus: _0x427d78 ? "succeeded" : "running",
        materializationProgress: _0x427d78 ? 100 : 0,
        ...(_0x1ce66a ? {
          replacementImage: {
            results: [],
            activeIndex: 0
          },
          replacementImageRef: ""
        } : {}),
        error: ""
      } : _0x332bd0),
      ...(_0x1ce66a ? {
        workspace: {
          ..._0x2a48a4.workspace,
          imageGeneration: {
            status: "idle",
            shotId: "",
            error: ""
          },
          imageGenerationsByShotId: {},
          videoGeneration: {
            status: "idle",
            shotId: "",
            error: ""
          },
          videoGenerationsByShotId: {},
          videoPreparation: {
            status: "idle",
            progress: 0,
            error: ""
          }
        }
      } : {})
    };
    const _0x205ecd = _0xbee0fe(_0x35bd26, {
      renderWorkspace: false
    });
    if (_0x427d78) {
      return {
        project: _0x205ecd,
        completion: _0x4c21b8.trackReverseCompletion({
          projectId: _0x7b185e,
          shotId: _0x1c5f70,
          completion: Promise.resolve({
            ok: true,
            project: cloneJson(_0x205ecd),
            changedShotCount: 0
          })
        })
      };
    }
    const _0x28b2ed = _0x205ecd.shots.map(_0x13ba8f => ({
      shotId: _0x13ba8f.id,
      sourceId: _0x13ba8f.sourceId,
      startSec: _0x13ba8f.startTimeSec,
      endSec: _0x13ba8f.endTimeSec,
      ...(_0x13ba8f.isReversed === true ? {
        isReversed: true
      } : {})
    }));
    const _0x4459df = _0xd07610({
      ranges: _0x28b2ed,
      selectedShotId: _0x205ecd.workspace.selectedShotId || _0x1c5f70,
      renderWorkspace: false,
      notify: false,
      revision: _0x304f76
    }).then(_0x314d0e => ({
      ok: _0x314d0e?.stale !== true,
      ..._0x314d0e
    })).catch(_0x195525 => {
      const _0x4df8de = _0x195525?.message || "视频倒放失败，请重试。";
      const _0x3dda29 = _0x54fdc4();
      if (!isDestroyed() && _0x4c21b8.isCurrent(_0x304f76) && normalizeText(_0x3dda29.id) === _0x7b185e) {
        _0xbee0fe({
          ..._0x3dda29,
          shots: _0x3dda29.shots.map(_0x522e1d => _0x522e1d.id === _0x1c5f70 ? {
            ..._0x522e1d,
            materializationStatus: "failed",
            materializationProgress: 0,
            error: _0x4df8de
          } : _0x522e1d)
        }, {
          renderWorkspace: false
        });
        _0x1a18c7(_0x4df8de, "error");
      }
      return {
        ok: false,
        project: _0x2922f3(),
        error: _0x4df8de,
        stale: !_0x4c21b8.isCurrent(_0x304f76)
      };
    });
    return {
      project: _0x205ecd,
      completion: _0x4c21b8.trackReverseCompletion({
        projectId: _0x7b185e,
        shotId: _0x1c5f70,
        completion: _0x4459df
      })
    };
  };
}