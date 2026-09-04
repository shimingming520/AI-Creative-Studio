import { createWorkspaceMarqueeRect, createWorkspaceMarqueeSelectionController, doesWorkspaceMarqueeIntersect, hasWorkspaceMarqueeDrag, resolveWorkspaceMarqueeSelection, WORKSPACE_MARQUEE_DRAG_THRESHOLD } from "../workspaceMarqueeSelection.js";
export const STORY_MARQUEE_DRAG_THRESHOLD = WORKSPACE_MARQUEE_DRAG_THRESHOLD;
export const hasStoryMarqueeDrag = hasWorkspaceMarqueeDrag;
export const createStoryMarqueeRect = createWorkspaceMarqueeRect;
export const doesStoryMarqueeIntersect = doesWorkspaceMarqueeIntersect;
export const resolveStoryMarqueeSelection = resolveWorkspaceMarqueeSelection;
const STORY_MARQUEE_SURFACE_SELECTOR = "[data-story-marquee-surface]";
const STORY_MARQUEE_BLOCKED_CONTROL_SELECTOR = "[data-story-action], input, textarea, select, a, [contenteditable='true']";
const STORY_MARQUEE_ITEM_SELECTOR = "[data-story-marquee-item]";
export function createStoryMarqueeSelectionController(_0x4e74b9 = {}) {
  return createWorkspaceMarqueeSelectionController({
    ..._0x4e74b9,
    surfaceSelector: _0x4e74b9.surfaceSelector || STORY_MARQUEE_SURFACE_SELECTOR,
    blockedControlSelector: _0x4e74b9.blockedControlSelector || STORY_MARQUEE_BLOCKED_CONTROL_SELECTOR,
    overlayClassName: _0x4e74b9.overlayClassName || "story-marquee-selection",
    itemSelector: _0x4e74b9.itemSelector || STORY_MARQUEE_ITEM_SELECTOR,
    getItemId: _0x4e74b9.getItemId || (_0x2c01e5 => _0x2c01e5.dataset?.storyMarqueeId)
  });
}