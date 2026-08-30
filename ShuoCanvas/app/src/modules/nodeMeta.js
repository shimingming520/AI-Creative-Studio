const _NODE_META = {
  group: {
    aliases: [],
    wrapperClasses: ["node-group"],
    refKind: ""
  },
  "source-text": {
    aliases: ["text", "source_text"],
    wrapperClasses: ["source-text-node", "type-source"],
    refKind: "text"
  },
  "comment-note": {
    aliases: ["comment_note", "comment"],
    wrapperClasses: ["comment-note-node"],
    refKind: ""
  },
  "source-image": {
    aliases: ["image", "source_image"],
    wrapperClasses: ["image-node", "type-source"],
    refKind: "image"
  },
  "source-video": {
    aliases: ["video", "source_video"],
    wrapperClasses: ["video-node", "type-source"],
    refKind: "video"
  },
  "source-audio": {
    aliases: ["audio", "source_audio"],
    wrapperClasses: ["audio-node", "type-source"],
    refKind: "audio"
  },
  "web-preview": {
    aliases: ["web_preview"],
    wrapperClasses: ["web-preview-node"],
    refKind: "",
    beta: true
  },
  "web-reference-card": {
    aliases: ["web_reference_card", "web-reference"],
    wrapperClasses: ["web-reference-card-node"],
    refKind: ""
  },
  "media-clip": {
    aliases: ["clip", "media_clip"],
    wrapperClasses: ["media-clip-node"],
    refKind: "",
    beta: true
  },
  "ai-text": {
    aliases: [],
    wrapperClasses: ["text-node"],
    refKind: "text"
  },
  "ai-image": {
    aliases: [],
    wrapperClasses: ["image-node"],
    refKind: "image"
  },
  "ai-video": {
    aliases: [],
    wrapperClasses: ["video-node"],
    refKind: "video"
  },
  "ai-audio": {
    aliases: [],
    wrapperClasses: ["audio-node"],
    refKind: "audio"
  },
  debug: {
    aliases: [],
    wrapperClasses: [],
    refKind: ""
  },
  collage: {
    aliases: [],
    wrapperClasses: ["collage-node-wrapper"],
    refKind: ""
  },
  whiteboard: {
    aliases: ["drawing-board", "draw-board"],
    wrapperClasses: ["whiteboard-node"],
    refKind: "",
    beta: true
  },
  storyboard: {
    aliases: [],
    wrapperClasses: [],
    refKind: ""
  },
  "storyboard-script": {
    aliases: ["storyboard_script"],
    wrapperClasses: ["storyboard-script-wrapper"],
    refKind: ""
  },
  "panorama-scene": {
    aliases: ["panorama_scene"],
    wrapperClasses: ["panorama-scene-node"],
    refKind: ""
  },
  "panorama-360": {
    aliases: ["panorama_360", "panorama360"],
    wrapperClasses: ["panorama-scene-node"],
    refKind: ""
  },
  "test-video": {
    aliases: [],
    wrapperClasses: ["video-node"],
    refKind: "video"
  }
};
const _ALIAS_TO_CANONICAL = (() => {
  const _0x48702d = new Map();
  for (const [_0x2c6979, _0x4da424] of Object.entries(_NODE_META)) {
    _0x48702d.set(_0x2c6979, _0x2c6979);
    for (const _0x4843b3 of _0x4da424.aliases || []) {
      _0x48702d.set(_0x4843b3, _0x2c6979);
    }
  }
  return _0x48702d;
})();
export function getAllNodeTypeMeta() {
  return _NODE_META;
}
export function normalizeNodeType(_0x530aa4) {
  if (typeof _0x530aa4 !== "string") {
    return "";
  }
  const _0x5ce3b5 = _0x530aa4.trim();
  if (!_0x5ce3b5) {
    return "";
  }
  return _ALIAS_TO_CANONICAL.get(_0x5ce3b5) || _0x5ce3b5;
}
export function getNodeTypeAliases(_0x52a1db) {
  const _0x13438b = normalizeNodeType(_0x52a1db);
  const _0x36f659 = _NODE_META[_0x13438b];
  if (_0x36f659?.aliases) {
    return [..._0x36f659.aliases];
  } else {
    return [];
  }
}
export function getNodeWrapperExtraClasses(_0x5d4cc2) {
  const _0x5c7771 = normalizeNodeType(_0x5d4cc2);
  const _0x2282a9 = _NODE_META[_0x5c7771];
  const _0x1ce797 = _0x2282a9?.wrapperClasses || [];
  if (_0x1ce797.length) {
    return _0x1ce797.join(" ");
  } else {
    return "";
  }
}
export function getRefKindByNodeType(_0x599962) {
  const _0x2cd8cf = normalizeNodeType(_0x599962);
  return _NODE_META[_0x2cd8cf]?.refKind || "";
}
export function hasNodeTypeBetaBadge(_0x92b58a) {
  const _0x4c375f = normalizeNodeType(_0x92b58a);
  return _NODE_META[_0x4c375f]?.beta === true;
}