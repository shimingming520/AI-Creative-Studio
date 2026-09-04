function classifyRequestFailure(_0x4cee03) {
  if (_0x4cee03?.safeToRetry === true || _0x4cee03?.requestSubmitted === false) {
    return "not-submitted";
  } else {
    return "outcome-unknown";
  }
}
export function createStoryInvocationLifecycle(_0x59b10b, _0x420423, {
  serializeResponse = _0xeb832e => _0xeb832e
} = {}) {
  if (typeof _0x420423 !== "function") {
    return {};
  }
  return {
    onRequest: ({
      attempt: _0x48424c,
      requestPayload: _0x5b427e
    }) => _0x420423({
      state: "prepared",
      stepId: _0x59b10b,
      attempt: _0x48424c,
      requestPayload: _0x5b427e
    }),
    onResponse: ({
      attempt: _0x1c2b77,
      response: _0x38f9f4,
      requestPayload: _0x1b56ce
    }) => _0x420423({
      state: "completed",
      stepId: _0x59b10b,
      attempt: _0x1c2b77,
      requestPayload: _0x1b56ce,
      rawResponse: serializeResponse(_0x38f9f4)
    }),
    onRequestError: ({
      attempt: _0x5d2b33,
      error: _0x3099ce,
      requestPayload: _0x152d49
    }) => _0x420423({
      state: classifyRequestFailure(_0x3099ce),
      stepId: _0x59b10b,
      attempt: _0x5d2b33,
      requestPayload: _0x152d49,
      error: _0x3099ce?.message || String(_0x3099ce || "模型请求失败")
    })
  };
}
export async function invokeStoryGenerationRequest({
  request: _0x48ce2f,
  requestPayload: _0x2bafd8,
  stepId: _0x3d7ff0,
  attempt: _0x246d26,
  onInvocation = null,
  serializeResponse = _0x551dfb => _0x551dfb
} = {}) {
  await onInvocation?.({
    state: "prepared",
    stepId: _0x3d7ff0,
    attempt: _0x246d26,
    requestPayload: _0x2bafd8
  });
  let _0x3c2156;
  try {
    _0x3c2156 = await _0x48ce2f(_0x2bafd8);
  } catch (_0x1527fe) {
    await onInvocation?.({
      state: classifyRequestFailure(_0x1527fe),
      stepId: _0x3d7ff0,
      attempt: _0x246d26,
      requestPayload: _0x2bafd8,
      error: _0x1527fe?.message || String(_0x1527fe || "模型请求失败")
    });
    throw _0x1527fe;
  }
  await onInvocation?.({
    state: "completed",
    stepId: _0x3d7ff0,
    attempt: _0x246d26,
    requestPayload: _0x2bafd8,
    rawResponse: serializeResponse(_0x3c2156)
  });
  return _0x3c2156;
}