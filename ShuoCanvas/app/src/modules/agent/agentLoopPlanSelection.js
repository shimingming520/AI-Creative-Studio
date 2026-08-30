export function selectAgentLoopPlanAction({
  rawPlan: _0x279660,
  actions: _0x2116bf,
  validate: _0x4da376,
  completedFingerprints = [],
  fingerprint: _0x8fc8c3,
  onCompletedPrefix = null
} = {}) {
  const _0x44e9bc = Array.isArray(_0x2116bf) ? _0x2116bf : [];
  const _0x611470 = _0x44e9bc.length > 0 ? {
    ..._0x279660,
    actions: [_0x44e9bc[0]]
  } : _0x279660;
  let _0x5a1f28 = _0x611470;
  let _0x432542 = _0x4da376(_0x611470);
  if (_0x44e9bc.length <= 1 || !_0x432542.ok) {
    return {
      plan: _0x5a1f28,
      validation: _0x432542
    };
  }
  for (let _0x43c8d1 = 0; _0x43c8d1 < _0x44e9bc.length; _0x43c8d1 += 1) {
    const _0x5ac947 = {
      ..._0x279660,
      actions: [_0x44e9bc[_0x43c8d1]]
    };
    const _0x4f1122 = _0x43c8d1 === 0 ? _0x432542 : _0x4da376(_0x5ac947);
    if (!_0x4f1122.ok) {
      return {
        plan: _0x5ac947,
        validation: _0x4f1122
      };
    }
    const _0x2cbb44 = _0x4f1122.plan.actions[0];
    if (completedFingerprints.includes(_0x8fc8c3(_0x2cbb44))) {
      onCompletedPrefix?.(_0x2cbb44, _0x43c8d1);
      continue;
    }
    _0x5a1f28 = _0x5ac947;
    _0x432542 = _0x4f1122;
    break;
  }
  return {
    plan: _0x5a1f28,
    validation: _0x432542
  };
}