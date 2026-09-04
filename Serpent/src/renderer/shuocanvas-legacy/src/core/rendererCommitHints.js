const DEFAULT_HINT_TTL_MS = 1000;
let nodeDragCommitHintUntil = 0;
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}
export function markRendererNodeDragCommitHint(_0x5581b0 = DEFAULT_HINT_TTL_MS) {
  const _0x30b2ad = Math.max(0, Number(_0x5581b0) || 0);
  nodeDragCommitHintUntil = nowMs() + _0x30b2ad;
}
export function consumeRendererNodeDragCommitHint() {
  if (nodeDragCommitHintUntil <= 0) {
    return false;
  }
  if (nowMs() > nodeDragCommitHintUntil) {
    nodeDragCommitHintUntil = 0;
    return false;
  }
  nodeDragCommitHintUntil = 0;
  return true;
}
export function clearRendererCommitHints() {
  nodeDragCommitHintUntil = 0;
}