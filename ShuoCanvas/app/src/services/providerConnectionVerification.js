export const PASSED_PROVIDER_CONNECTION_STATUS = "passed";
const VOLCENGINE_SPEECH_CAPABILITY_IDS = new Set(["asr", "tts", "audioGeneration"]);
const RUNNINGHUB_PROVIDER_IDS = new Set(["runninghub", "runninghub-international"]);
const RUNNINGHUB_CAPABILITY_BY_STEP_ID = Object.freeze({
  auth: "workflow",
  model: "modelApi",
  upload: "modelApi"
});
function normalizeProviderId(_0x3df6c5 = "") {
  return String(_0x3df6c5 || "").trim().toLowerCase();
}
function getVerificationStepStatus(_0x101ef8 = {}) {
  if (_0x101ef8.ok === true && !_0x101ef8.skipped) {
    return "passed";
  }
  if (_0x101ef8.skipped) {
    return "unknown";
  } else {
    return "failed";
  }
}
function getRunningHubConfiguredCapabilities(_0x15ded3 = {}) {
  const _0x8c694c = [];
  if (String(_0x15ded3?.apiKey || "").trim()) {
    _0x8c694c.push("workflow");
  }
  if (String(_0x15ded3?.modelApiKey || "").trim()) {
    _0x8c694c.push("modelApi");
  }
  return _0x8c694c;
}
function getRunningHubVerificationStatus(_0x2c4586 = {}, _0x204c33 = {}) {
  const _0x55e389 = getRunningHubConfiguredCapabilities(_0x2c4586);
  if (_0x55e389.length === 0) {
    return "failed";
  }
  const _0x2aa943 = _0x55e389.map(_0x24cc07 => _0x204c33?.[_0x24cc07]?.status || "unknown");
  if (_0x2aa943.every(_0x4b6c50 => _0x4b6c50 === "passed")) {
    return PASSED_PROVIDER_CONNECTION_STATUS;
  }
  if (_0x2aa943.some(_0x253e27 => _0x253e27 === "passed")) {
    return "partial";
  } else {
    return "failed";
  }
}
function getPreservedRunningHubCapabilities(_0x4793b7, _0x355ba4) {
  const _0x551e00 = _0x4793b7?.connectionVerification?.capabilities || {};
  if (String(_0x4793b7?.apiUrl || "").trim() !== String(_0x355ba4?.apiUrl || "").trim()) {
    return {};
  }
  const _0x47bddd = {};
  if (String(_0x4793b7?.apiKey || "").trim() === String(_0x355ba4?.apiKey || "").trim() && _0x551e00.workflow) {
    _0x47bddd.workflow = {
      ..._0x551e00.workflow
    };
  }
  if (String(_0x4793b7?.modelApiKey || "").trim() === String(_0x355ba4?.modelApiKey || "").trim() && _0x551e00.modelApi) {
    _0x47bddd.modelApi = {
      ..._0x551e00.modelApi
    };
  }
  return _0x47bddd;
}
function buildRunningHubConnectionVerification(_0x35919c, _0x5b6b1a, _0x1ca8ee, _0x38464a) {
  const _0x407c86 = getPreservedRunningHubCapabilities(_0x35919c, _0x5b6b1a);
  const _0x3d90e8 = Array.isArray(_0x1ca8ee?.steps) ? _0x1ca8ee.steps : [];
  _0x3d90e8.forEach(_0x6951 => {
    const _0x14e45a = RUNNINGHUB_CAPABILITY_BY_STEP_ID[_0x6951?.id];
    if (!_0x14e45a || _0x6951?.skipped) {
      return;
    }
    _0x407c86[_0x14e45a] = {
      status: getVerificationStepStatus(_0x6951),
      verifiedAt: _0x38464a
    };
  });
  return {
    status: getRunningHubVerificationStatus(_0x5b6b1a, _0x407c86),
    verifiedAt: _0x38464a,
    ...(Object.keys(_0x407c86).length > 0 ? {
      capabilities: _0x407c86
    } : {})
  };
}
function getProviderConnectionIdentity(_0x218f8c = {}, _0x2dadf1 = "") {
  const _0x249bbd = String(_0x2dadf1 || "").trim().toLowerCase();
  const _0x3308b2 = _0x4e7b72 => String(_0x218f8c?.[_0x4e7b72] || "").trim();
  if (_0x249bbd === "comfyui") {
    return JSON.stringify([_0x3308b2("apiUrl"), _0x3308b2("cloudApiUrl")]);
  }
  if (_0x249bbd === "runninghub" || _0x249bbd === "runninghub-international") {
    return JSON.stringify([_0x3308b2("apiUrl"), _0x3308b2("apiKey"), _0x3308b2("modelApiKey")]);
  }
  return JSON.stringify([_0x3308b2("apiUrl"), _0x3308b2("apiKey"), _0x249bbd === "apimart" ? _0x3308b2("routeId") : ""]);
}
function joinProviderDiagnosticMessages(_0x1288ab = {}) {
  return [_0x1288ab.message, _0x1288ab.detail].map(_0x2f6a64 => String(_0x2f6a64 || "").trim()).filter((_0x323991, _0x444f23, _0x57954e) => _0x323991 && _0x57954e.indexOf(_0x323991) === _0x444f23).join(" · ");
}
export function formatProviderDiagnosticDetail(_0x594f83 = {}, _0x877a3e = {}) {
  const _0x41927c = [];
  const _0x5a51b7 = _0x594f83.suggestion || _0x594f83.summary || _0x594f83.error || _0x594f83.detail || "";
  if (_0x5a51b7) {
    _0x41927c.push(_0x5a51b7);
  }
  if (Array.isArray(_0x594f83.steps) && _0x594f83.steps.length > 0) {
    _0x594f83.steps.forEach(_0x5431ef => {
      const _0x442bbe = _0x5431ef.skipped ? _0x877a3e.skipped || "跳过" : _0x5431ef.ok ? _0x877a3e.passed || "通过" : _0x877a3e.failed || "失败";
      const _0xbad0c4 = joinProviderDiagnosticMessages(_0x5431ef);
      _0x41927c.push((_0x5431ef.label || _0x5431ef.id || _0x877a3e.step || "步骤") + "：" + _0x442bbe + (_0xbad0c4 ? " - " + _0xbad0c4 : ""));
    });
  } else if (_0x594f83.detail) {
    _0x41927c.push(_0x594f83.detail);
  }
  return _0x41927c.filter(Boolean).join("\n");
}
export function isProviderConnectionVerified(_0x3acdc8 = {}, _0x39f363 = "") {
  const _0x26aaa2 = _0x3acdc8?.providers?.[normalizeProviderId(_0x39f363)]?.connectionVerification;
  return _0x26aaa2?.status === PASSED_PROVIDER_CONNECTION_STATUS;
}
export function shouldPersistProviderConnectionResult(_0x6fec90 = "", _0x3b5b27 = {}) {
  if (_0x3b5b27?.ok === true) {
    return true;
  }
  if (!RUNNINGHUB_PROVIDER_IDS.has(normalizeProviderId(_0x6fec90))) {
    return false;
  }
  return (Array.isArray(_0x3b5b27?.steps) ? _0x3b5b27.steps : []).some(_0x127fda => RUNNINGHUB_CAPABILITY_BY_STEP_ID[_0x127fda?.id] && _0x127fda?.ok === true && !_0x127fda?.skipped);
}
export function reconcileProviderConnectionVerification(_0xf45ef3 = {}, _0x96ca33 = {}, _0x118e97 = "") {
  const _0x3ec1f7 = _0x96ca33 && typeof _0x96ca33 === "object" ? {
    ..._0x96ca33
  } : {};
  const _0xafa885 = normalizeProviderId(_0x118e97);
  if (RUNNINGHUB_PROVIDER_IDS.has(_0xafa885)) {
    const _0x364099 = _0xf45ef3?.connectionVerification;
    if (!_0x364099) {
      return _0x3ec1f7;
    }
    const _0x591aa6 = getPreservedRunningHubCapabilities(_0xf45ef3, _0x3ec1f7);
    if (Object.keys(_0x591aa6).length === 0) {
      delete _0x3ec1f7.connectionVerification;
      return _0x3ec1f7;
    }
    _0x3ec1f7.connectionVerification = {
      ..._0x364099,
      status: getRunningHubVerificationStatus(_0x3ec1f7, _0x591aa6),
      capabilities: _0x591aa6
    };
    return _0x3ec1f7;
  }
  if (getProviderConnectionIdentity(_0xf45ef3, _0x118e97) !== getProviderConnectionIdentity(_0x3ec1f7, _0x118e97)) {
    delete _0x3ec1f7.connectionVerification;
  }
  return _0x3ec1f7;
}
export function mergePassedProviderApiConfig(_0x47df07 = {}, _0x112c18 = {}, _0x238840 = [], _0x381623 = new Map(), _0x4adda6 = {}) {
  const _0x5befd1 = _0x47df07 && typeof _0x47df07 === "object" ? _0x47df07 : {};
  const _0xca111d = _0x112c18 && typeof _0x112c18 === "object" ? _0x112c18 : {};
  const _0x5ed8b3 = {
    ...(_0x5befd1.providers || {})
  };
  const _0x5e32d8 = _0xca111d.providers || {};
  const _0x3943fe = _0x381623 instanceof Map ? _0x381623 : new Map();
  const _0x4be8b7 = Number(_0x4adda6?.verifiedAt) || Date.now();
  const _0x2739aa = _0x4adda6?.providerResults && typeof _0x4adda6.providerResults === "object" ? _0x4adda6.providerResults : {};
  _0x238840.forEach(_0x33046c => {
    const _0x51a663 = normalizeProviderId(_0x33046c);
    if (!_0x51a663) {
      return;
    }
    const _0x23b63a = _0x5ed8b3[_0x51a663] || {};
    const _0x2633f9 = {
      ..._0x23b63a,
      ...(_0x5e32d8[_0x51a663] || {}),
      ...(_0x3943fe.get(_0x51a663) || {})
    };
    const _0x28b5b6 = RUNNINGHUB_PROVIDER_IDS.has(_0x51a663) ? buildRunningHubConnectionVerification(_0x23b63a, _0x2633f9, _0x2739aa[_0x51a663], _0x4be8b7) : {
      status: PASSED_PROVIDER_CONNECTION_STATUS,
      verifiedAt: _0x4be8b7
    };
    if (_0x51a663 === "volcengine-speech") {
      const _0x1d80cc = getProviderConnectionIdentity(_0x23b63a, _0x51a663) === getProviderConnectionIdentity(_0x2633f9, _0x51a663);
      const _0x2a2bc0 = _0x1d80cc ? {
        ...(_0x23b63a?.connectionVerification?.capabilities || {})
      } : {};
      const _0x5f0246 = Array.isArray(_0x2739aa[_0x51a663]?.steps) ? _0x2739aa[_0x51a663].steps : [];
      _0x5f0246.forEach(_0x53812c => {
        const _0x879c37 = String(_0x53812c?.id || "").trim();
        if (!VOLCENGINE_SPEECH_CAPABILITY_IDS.has(_0x879c37)) {
          return;
        }
        _0x2a2bc0[_0x879c37] = {
          status: _0x53812c.ok === true ? "passed" : _0x53812c.skipped ? "unknown" : "failed",
          verifiedAt: _0x4be8b7
        };
      });
      if (Object.keys(_0x2a2bc0).length > 0) {
        _0x28b5b6.capabilities = _0x2a2bc0;
      }
    }
    _0x5ed8b3[_0x51a663] = {
      ..._0x2633f9,
      connectionVerification: _0x28b5b6
    };
  });
  return {
    ..._0x5befd1,
    providers: _0x5ed8b3
  };
}