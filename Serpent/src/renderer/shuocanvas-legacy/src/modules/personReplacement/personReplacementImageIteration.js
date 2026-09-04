import { getPersonReplacementImageResults, resolvePersonReplacementImageResultRef } from "./personReplacementProject.js";
function normalizeText(_0x45693f) {
  return String(_0x45693f ?? "").trim();
}
export function setPersonReplacementImageResultAsReference(_0x20912f = {}, {
  shotId = "",
  resultIndex = 0
} = {}) {
  const _0x5b5165 = normalizeText(shotId);
  const _0x2c4bf5 = Array.isArray(_0x20912f?.shots) ? _0x20912f.shots : [];
  const _0x39b368 = _0x2c4bf5.findIndex(_0x4be3af => normalizeText(_0x4be3af?.id) === _0x5b5165);
  const _0x2e449b = _0x2c4bf5[_0x39b368];
  const _0x25bbec = getPersonReplacementImageResults(_0x2e449b);
  const _0x1af835 = Math.trunc(Number(resultIndex));
  const _0x429723 = resolvePersonReplacementImageResultRef(_0x25bbec[_0x1af835]);
  if (_0x39b368 < 0 || !Number.isInteger(_0x1af835) || _0x1af835 < 0 || _0x1af835 >= _0x25bbec.length || !_0x429723) {
    return {
      project: _0x20912f,
      changed: false,
      changedShotIds: [],
      imageRef: ""
    };
  }
  const _0x23ad5b = normalizeText(_0x2e449b?.keyframeRef);
  const _0x350c1d = normalizeText(_0x2e449b?.imageIterationReferenceRef);
  const _0x50d493 = {
    ..._0x2e449b,
    replacementImage: {
      ...(_0x2e449b?.replacementImage || {}),
      results: _0x25bbec,
      activeIndex: _0x1af835
    },
    replacementImageRef: _0x429723
  };
  const _0x136e70 = _0x5153c9 => ({
    ..._0x20912f,
    shots: _0x2c4bf5.map((_0x17e83b, _0x4efbdc) => _0x4efbdc === _0x39b368 ? _0x5153c9 : _0x17e83b),
    workspace: {
      ...(_0x20912f?.workspace || {}),
      selectedShotId: _0x5b5165
    }
  });
  if (_0x429723 === _0x350c1d) {
    const _0x1312be = {
      ..._0x50d493
    };
    delete _0x1312be.imageIterationReferenceRef;
    return {
      project: _0x136e70(_0x1312be),
      changed: true,
      changedShotIds: [_0x5b5165],
      imageRef: _0x23ad5b,
      clearedReference: true
    };
  }
  const _0x1bc8f3 = {
    ..._0x50d493,
    imageIterationReferenceRef: _0x429723
  };
  return {
    project: _0x136e70(_0x1bc8f3),
    changed: true,
    changedShotIds: [_0x5b5165],
    imageRef: _0x429723
  };
}