const WORKSPACE_ACTION_ICON_PATHS = Object.freeze({
  addToLibrary: "<rect x=\"4\" y=\"4\" width=\"6\" height=\"6\" rx=\"1.5\"/><rect x=\"14\" y=\"4\" width=\"6\" height=\"6\" rx=\"1.5\"/><rect x=\"4\" y=\"14\" width=\"6\" height=\"6\" rx=\"1.5\"/><path d=\"M17 14v6m-3-3h6\"/>",
  confirm: "<path d=\"m5 12 4 4L19 6\"/>",
  delete: "<path d=\"M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5\"/>",
  keyframe: "<path d=\"M4 8.5A2.5 2.5 0 0 1 6.5 6H9l1.5-2h3L15 6h2.5A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  split: "<path d=\"M8 18V6m0 0L5 9m3-3 3 3M16 6v12m0 0-3-3m3 3 3-3\"/>",
  upload: "<path d=\"M12 15V4m0 0L8 8m4-4 4 4\"/><path d=\"M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4\"/>"
});
export function renderWorkspaceActionIcon(_0x2127c6) {
  const _0xb0b5e3 = Object.hasOwn(WORKSPACE_ACTION_ICON_PATHS, _0x2127c6) ? _0x2127c6 : "confirm";
  return "<svg class=\"story-action-icon story-" + _0xb0b5e3 + "-icon\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><g stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">" + WORKSPACE_ACTION_ICON_PATHS[_0xb0b5e3] + "</g></svg>";
}
export function renderWorkspaceConfirmIcon() {
  return renderWorkspaceActionIcon("confirm");
}
export function renderWorkspaceDeleteIcon() {
  return renderWorkspaceActionIcon("delete");
}
export function renderWorkspaceSplitIcon() {
  return renderWorkspaceActionIcon("split");
}
export function renderWorkspaceKeyframeIcon() {
  return renderWorkspaceActionIcon("keyframe");
}
export function renderWorkspaceUploadIcon() {
  return renderWorkspaceActionIcon("upload");
}
export function renderWorkspaceAddToLibraryIcon() {
  return renderWorkspaceActionIcon("addToLibrary");
}