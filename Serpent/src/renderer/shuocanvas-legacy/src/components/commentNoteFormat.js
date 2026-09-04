export const COMMENT_NOTE_CONTENT_FORMAT = Object.freeze({
  PLAIN: "plain",
  MARKDOWN: "markdown"
});
export function normalizeCommentNoteContentFormat(_0x53696b) {
  if (_0x53696b === COMMENT_NOTE_CONTENT_FORMAT.MARKDOWN) {
    return COMMENT_NOTE_CONTENT_FORMAT.MARKDOWN;
  } else {
    return COMMENT_NOTE_CONTENT_FORMAT.PLAIN;
  }
}
export function isCommentNoteMarkdown(_0x5a4566) {
  return normalizeCommentNoteContentFormat(_0x5a4566?.contentFormat) === COMMENT_NOTE_CONTENT_FORMAT.MARKDOWN;
}