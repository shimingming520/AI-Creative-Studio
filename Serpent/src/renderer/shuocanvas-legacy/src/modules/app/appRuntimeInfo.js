export function publishAppRuntimeInfo({
  runtimeInfo = {},
  windowObject = globalThis.window,
  EventCtor = globalThis.CustomEvent
} = {}) {
  if (!windowObject) {
    return;
  }
  windowObject.AI_CANVAS_IS_DEV_BUILD = Boolean(runtimeInfo?.isDevBuild);
  windowObject.ADVANCED_MODE = Boolean(runtimeInfo?.isAdvancedMode);
  if (typeof windowObject.dispatchEvent === "function" && typeof EventCtor === "function") {
    windowObject.dispatchEvent(new EventCtor("aicanvas:runtime-info", {
      detail: runtimeInfo
    }));
  }
}
export async function initAppRuntimeInfo({
  fetchAppRuntimeInfo: _0x148126,
  initDevEntries: _0x8f2d4e,
  windowObject = globalThis.window,
  EventCtor = globalThis.CustomEvent
} = {}) {
  try {
    const _0x45218a = await _0x148126?.();
    publishAppRuntimeInfo({
      runtimeInfo: _0x45218a,
      windowObject: windowObject,
      EventCtor: EventCtor
    });
    _0x8f2d4e?.({
      isDevBuild: Boolean(_0x45218a?.isDevBuild)
    });
    return _0x45218a;
  } catch (_0x419828) {
    const _0xad8788 = {
      isDevBuild: false,
      isAdvancedMode: false
    };
    publishAppRuntimeInfo({
      runtimeInfo: _0xad8788,
      windowObject: windowObject,
      EventCtor: EventCtor
    });
    _0x8f2d4e?.({
      isDevBuild: false
    });
    return _0xad8788;
  }
}