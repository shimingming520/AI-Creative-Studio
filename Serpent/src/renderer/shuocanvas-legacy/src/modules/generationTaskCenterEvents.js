export const GENERATION_TASK_CENTER_EVENT = "aicanvas:generation-task-center:update";
export function emitGenerationTaskCenterUpdate(_0x43ad6d = {}, _0x59c2c9 = globalThis.window) {
  if (!_0x43ad6d || typeof _0x43ad6d !== "object" || !_0x59c2c9) {
    return false;
  }
  if (typeof _0x59c2c9.dispatchEvent !== "function") {
    return false;
  }
  const _0x2429cd = typeof globalThis.CustomEvent === "function" ? globalThis.CustomEvent : typeof _0x59c2c9.CustomEvent === "function" ? _0x59c2c9.CustomEvent : null;
  const _0x2159b5 = _0x2429cd ? new _0x2429cd(GENERATION_TASK_CENTER_EVENT, {
    detail: _0x43ad6d
  }) : {
    type: GENERATION_TASK_CENTER_EVENT,
    detail: _0x43ad6d
  };
  _0x59c2c9.dispatchEvent(_0x2159b5);
  return true;
}