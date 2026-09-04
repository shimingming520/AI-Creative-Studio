import a673_0x32c3f4 from "./nodeRuntimeRegistry.js";
const GENERATION_RUNTIME_METHODS = Object.freeze(["runGeneration", "getGenerationStatus", "cancelGeneration", "resumeGeneration"]);
function buildNodeGenerationRuntime(_0xc59369) {
  if (!_0xc59369 || typeof _0xc59369 !== "object") {
    return null;
  }
  const _0x163a50 = {};
  for (const _0x1887ce of GENERATION_RUNTIME_METHODS) {
    if (typeof _0xc59369[_0x1887ce] === "function") {
      _0x163a50[_0x1887ce] = _0xc59369[_0x1887ce].bind(_0xc59369);
    }
  }
  if (Object.keys(_0x163a50).length > 0) {
    return _0x163a50;
  } else {
    return null;
  }
}
export function createRendererNodeRuntimeBridge({
  getInstance: _0xaa6530,
  registry = a673_0x32c3f4
} = {}) {
  return {
    register(_0x157c47) {
      const _0x91d073 = buildNodeGenerationRuntime(_0xaa6530?.(_0x157c47));
      if (!_0x91d073) {
        registry.unregister(_0x157c47);
        return;
      }
      registry.register(_0x157c47, _0x91d073);
    },
    unregister(_0x435ff8) {
      registry.unregister(_0x435ff8);
    }
  };
}